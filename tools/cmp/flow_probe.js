// Kael's flow over the auto fights: how long runs get, how many links he takes, and what ends them. usage: node tools/cmp/flow_probe.js
const core=require('../../sk_src.js')(process.argv[2]);
process.chdir(__dirname+'/../..');
eval(core+`
let fights=0,wins=0,turns=0;const runs=[],ends={},links={flow:0,broken:0};
const _ce=chainEnd;chainEnd=function(){const c=chainSt();if(c.live){runs.push(c.n);const K=hero();const why=!K?'none':K.dead?'dead':K.downed?'down':K.clinch?'held':K.broken?'broken':S.game.phase==='over'?'over':K.hp<c.hp?'hit':'other';ends[why]=(ends[why]||0)+1;}return _ce.apply(this,arguments);};
const _ro=resolveOpening;resolveOpening=function(ch){const o=S.opening;if(o&&o.f===hero()&&o.link&&ch!=='hold')links[o.source]=(links[o.source]||0)+1;return _ro.apply(this,arguments);};
S.hooks.over=w=>{if(w)wins++;};
for(const ak of Object.keys(ARENAS))for(const n of [1,2,3])for(const seed of [1,2]){
  Math.random=mulberry32(seed*977+5);S.arenaKey=ak;S.cfg.n=n;S.auto=true;S.tableOn=true;S.rng=mulberry32(seed*31+n);S.F=[];rosterBuild();initDuel();
  let k=0;while(k<120*400&&S.game.phase!=='over'){simStep();tickOpening(DT*3);k++;}fights++;turns+=S.game.turnNo;}
const hist={};for(const r of runs)hist[r]=(hist[r]||0)+1;
console.log(JSON.stringify({fights,wins,avgTurns:+(turns/fights).toFixed(1),runs:runs.length,longest:Math.max(0,...runs),hist,ends,links}));
`);
