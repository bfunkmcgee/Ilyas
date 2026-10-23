// what breaks whom, over the same auto fights as react_probe.js: for each break, whether the broken man was swinging (his blow was
// answered) or being swung at, the exchange's chain, and how much he had before. usage: node tools/cmp/break_causes.js [core file]
const core=require('../../sk_src.js')(process.argv[2]);
process.chdir(__dirname+'/../..');
eval(core+`
const C={},B={hero:0,foe:0},PAY={};let fights=0,wins=0,turns=0,dmgAfter={hero:[],foe:[]};
const _kb=knockBalance;knockBalance=function(D,n,by){const was=D?D.foot:0,ex=S.game.ex;const r=_kb.apply(this,arguments);
  if(D&&was>0&&D.broken&&D.broken.t===S.t){const side=D.team?'foe':'hero',role=ex&&ex.A===D?'swinging':ex&&ex.D===D?'struck':'other',ch=ex&&ex.chain||'turn';
    const k=side+' '+role+' '+ch+' was'+was+' n'+n;C[k]=(C[k]||0)+1;B[side]++;D._brokeHp=D.hp;}
  return r;};
S.hooks.opening=o=>{if(o&&o.source==='broken'){}};
const _ro=resolveOpening;resolveOpening=function(c){const o=S.opening;if(o&&o.source==='broken'){const k=(o.f.team?'foe':'hero')+'>'+c;PAY[k]=(PAY[k]||0)+1;}return _ro.apply(this,arguments);};
V11.turnStart.push(i=>{for(const f of S.F)if(f._brokeHp!=null){(f.team?dmgAfter.foe:dmgAfter.hero).push(f._brokeHp-f.hp);f._brokeHp=null;}});
S.hooks.over=w=>{if(w)wins++;};
for(const ak of Object.keys(ARENAS))for(const n of [1,2,3])for(const seed of [1,2]){
  Math.random=mulberry32(seed*977+5);S.arenaKey=ak;S.cfg.n=n;S.auto=true;S.tableOn=true;S.rng=mulberry32(seed*31+n);S.F=[];rosterBuild();initDuel();
  let k=0;while(k<120*400&&S.game.phase!=='over'){simStep();tickOpening(DT*3);k++;}fights++;turns+=S.game.turnNo;}
const avg=a=>a.length?+(a.reduce((s,x)=>s+x,0)/a.length).toFixed(1):0;
console.log(JSON.stringify({fights,wins,avgTurns:+(turns/fights).toFixed(1),broken:B,hpLostAfterBreak:{hero:avg(dmgAfter.hero),foe:avg(dmgAfter.foe)},payoff:PAY},null,0));
for(const [k,v] of Object.entries(C).sort((a,b)=>b[1]-a[1]))console.log(String(v).padStart(4),k);
`);
