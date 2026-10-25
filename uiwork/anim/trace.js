// The motion trace: seeded auto fights run headless, and every fighter's joints, station, depth, health and footing recorded every few
// sim steps as one hash per checkpoint. Two builds that move the same way give the same hashes; the first checkpoint that differs is
// named with its values. For refactors of the animation that must not change a frame.
// usage: node uiwork/anim/trace.js <repo dir> <out.json> [quick]          (the repo's build_modules.json must exist: python3 build.py)
//        node uiwork/anim/trace.js --cmp <a.json> <b.json>
const fs=require('fs'),path=require('path');
if(process.argv[2]==='--cmp'){const A=JSON.parse(fs.readFileSync(process.argv[3],'utf8')),B=JSON.parse(fs.readFileSync(process.argv[4],'utf8'));let bad=0;
  for(const k of Object.keys(A)){const a=A[k],b=B[k];if(!b){console.log('missing in b: '+k);bad++;continue;}
    const n=Math.min(a.h.length,b.h.length);let i=0;while(i<n&&a.h[i]===b.h[i])i++;
    if(i<n||a.h.length!==b.h.length){bad++;console.log(`DIFF ${k}: first at checkpoint ${i} of ${a.h.length}/${b.h.length}`+(a.v&&b.v?`\n  a ${JSON.stringify(a.v[i])}\n  b ${JSON.stringify(b.v[i])}`:''));}}
  for(const k of Object.keys(B))if(!A[k]){console.log('missing in a: '+k);bad++;}
  console.log(bad?`traces differ: ${bad} of ${Object.keys(A).length}`:`traces identical: ${Object.keys(A).length} fights`);process.exit(bad?1:0);}
const ROOT=path.resolve(process.argv[2]||'.'),OUT=process.argv[3]||'trace.json',QUICK=process.argv[4]==='quick';process.chdir(ROOT);
const core=require(path.join(ROOT,'sk_src.js'))();
eval(core+`
(()=>{const out={};
const h32=s=>{let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h.toString(36);};
const snap=()=>S.F.map(f=>[f.p.map(q=>q.x.toFixed(6)+','+q.y.toFixed(6)).join(';'),f.station.toFixed(6),(f.lane||0).toFixed(6),f.hp,f.foot,f.posture,f.downed?1:0,f.dead?1:0].join('|')).join('#')+'@'+S.game.phase;
const arenas=QUICK?['street','restaurant']:['street','field','restaurant','hill','wall'],ns=QUICK?[1,3]:[1,2,3],heroW=['elven','sword'],seeds=QUICK?[1]:[1,2];
const run=(key,setup)=>{setup();S.F=[];rosterBuild();initDuel();const h=[],v=[];let k=0;
  while(k<120*400&&S.game.phase!=='over'){simStep();tickOpening(DT);k++;if(k%6===0){const s=snap();h.push(h32(s));v.push(s.length>600?s.slice(0,600):s);}}
  const s=snap();h.push(h32(s));v.push(s.slice(0,600));out[key]={h,v,steps:k,winner:S.F[0].dead?'foes':'hero'};};
for(const ak of arenas)for(const n of ns)for(const hw of heroW)for(const seed of seeds)
  run(ak+'/'+n+'/'+hw+'/'+seed,()=>{Math.random=mulberry32(seed*977+n*31+hw.length);S.rng=mulberry32(seed*31+n);S.arenaKey=ak;S.cfg.n=n;S.cfg.crew=false;
    S.cfg.ally.on=false;S.auto=true;S.tableOn=true;S.cfg.hero={...S.cfg.hero,weapon:hw};});
// a crew in the restaurant, and an ally beside him
for(const seed of seeds){
  run('crew/'+seed,()=>{Math.random=mulberry32(seed*577+3);S.rng=mulberry32(seed*13+1);S.arenaKey='restaurant';S.cfg.n=1;S.cfg.crew=true;S.cfg.ally.on=false;S.auto=true;S.tableOn=true;S.cfg.hero={...S.cfg.hero,weapon:'elven'};});
  run('ally/'+seed,()=>{Math.random=mulberry32(seed*389+7);S.rng=mulberry32(seed*17+2);S.arenaKey='street';S.cfg.n=2;S.cfg.crew=false;S.cfg.ally.on=true;S.auto=true;S.tableOn=true;S.cfg.hero={...S.cfg.hero,weapon:'elven'};});}
fs.writeFileSync(OUT,JSON.stringify(out));
console.log('traced '+Object.keys(out).length+' fights, '+Object.values(out).reduce((s,o)=>s+o.h.length,0)+' checkpoints; hero won '+Object.values(out).filter(o=>o.winner==='hero').length);})();
`);
