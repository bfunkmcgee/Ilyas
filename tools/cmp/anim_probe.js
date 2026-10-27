// The motion over the auto fights on every arena (headless): how often each variant of each blow comes, how often a combo opens a
// blow and with how many leads, by the attacker's rank, and how the fights come out. usage: node tools/cmp/anim_probe.js [core file]
const core=require('../../sk_src.js')(process.argv[2]);
process.chdir(__dirname+'/../..');
eval(core+`
const st={variant:{},combo:{},combosBy:{},blowsBy:{},beats:0,wins:0,fights:0,turns:0,dur:0,out:{}};
{const pa=planAttack;planAttack=function(A,D,kind,res,opts){const P=pa.apply(this,arguments);if(!P||!P.anim)return P;
  const sk=A.skill|0,a=P.anim;st.blowsBy[sk]=(st.blowsBy[sk]||0)+1;
  if(a.variant)st.variant[kind+':'+a.variant]=(st.variant[kind+':'+a.variant]||0)+1;
  if(a.combo){const n=a.combo.length;st.combo[n]=(st.combo[n]||0)+1;st.combosBy[sk]=(st.combosBy[sk]||0)+1;if(P.combo.hits.some(h=>h.beat))st.beats++;}
  return P;};}
S.hooks.log=e=>{if(e.type==='attack'&&e.res)st.out[e.res.out]=(st.out[e.res.out]||0)+1;};
S.hooks.over=w=>{if(w)st.wins++;};
for(const ak of Object.keys(ARENAS))for(const n of [1,2,3])for(const seed of [1,2]){
  Math.random=mulberry32(seed*977+5);S.arenaKey=ak;S.cfg.n=n;S.auto=true;S.tableOn=true;S.rng=mulberry32(seed*31+n);S.F=[];rosterBuild();initDuel();
  let k=0;while(k<120*400&&S.game.phase!=='over'){simStep();tickOpening(DT*3);k++;}
  st.fights++;st.turns+=S.game.turnNo;st.dur+=k*DT;}
const rate={};for(const k in st.blowsBy)rate[k]=+((st.combosBy[k]||0)/st.blowsBy[k]).toFixed(2);
console.log(JSON.stringify({fights:st.fights,wins:st.wins,avgTurns:+(st.turns/st.fights).toFixed(1),avgSecs:+(st.dur/st.fights).toFixed(1),out:st.out}));
console.log('blows by rank',JSON.stringify(st.blowsBy),'combos by rank',JSON.stringify(st.combosBy),'share',JSON.stringify(rate),'leads',JSON.stringify(st.combo),'beat and thrust',st.beats);
console.log('variants',JSON.stringify(Object.entries(st.variant).sort()));
`);
