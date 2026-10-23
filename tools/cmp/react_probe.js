// auto fights on every arena with the reactions and balance: how fights go (headless). usage: node tools/cmp/react_probe.js [core file]
const core=require('../../sk_src.js')(process.argv[2]);
process.chdir(__dirname+'/../..');
eval(core+`
const st={react:{},broken:{hero:0,foe:0},out:{},cmds:{},turns:0,fights:0,wins:0,dur:0,kd:0,openings:{}};
S.hooks.react=(D,A,k)=>{st.react[k]=(st.react[k]||0)+1;};
S.hooks.broken=(D,by)=>{st.broken[D.team?'foe':'hero']++;};
S.hooks.log=e=>{st.cmds[e.type]=(st.cmds[e.type]||0)+1;if(e.type==='attack'&&e.res)st.out[e.res.out]=(st.out[e.res.out]||0)+1;};
S.hooks.opening=o=>{if(o)st.openings[o.source]=(st.openings[o.source]||0)+1;};
S.hooks.over=w=>{if(w)st.wins++;};
const rows=[];
for(const ak of Object.keys(ARENAS))for(const n of [1,2,3])for(const seed of [1,2]){
  Math.random=mulberry32(seed*977+5);S.arenaKey=ak;S.cfg.n=n;S.auto=true;S.tableOn=true;S.rng=mulberry32(seed*31+n);S.F=[];rosterBuild();initDuel();
  let k=0;while(k<120*400&&S.game.phase!=='over'){simStep();tickOpening(DT*3);k++;}
  st.fights++;st.turns+=S.game.turnNo;st.dur+=k*DT;
  rows.push(ak.padEnd(10)+' 1v'+n+' s'+seed+': '+S.game.phase+' t='+(k*DT).toFixed(0)+'s turns='+S.game.turnNo+' hp '+S.F.map(f=>f.hp).join('/'));}
console.log(rows.join('\\n'));
console.log(JSON.stringify({fights:st.fights,wins:st.wins,avgTurns:+(st.turns/st.fights).toFixed(1),avgSecs:+(st.dur/st.fights).toFixed(1),react:st.react,broken:st.broken,out:st.out,openings:st.openings}));
`);
