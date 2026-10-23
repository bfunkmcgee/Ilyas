// The room in auto fights: how often the physics events happen (by kind, down or not, whose doing), how often the room moves are
// offered and used (by kind, by side, how they went), and what it does to the fights. usage: node tools/cmp/room_probe.js [seeds] [crew]
const core=require('../../sk_src.js')();
process.chdir(__dirname+'/../..');
const SEEDS=+(process.argv[2]||2),CREWRUN=process.argv[3]==="crew";
eval(core+`
let fights=0,wins=0,turns=0,errs=0,hpLost=0;const ev={},mv={},offer={turns:0,with:0,kinds:{}},quiet={};
S.hooks.over=w=>{if(w)wins++;};
S.hooks.roomEvent=e=>{const k=e.kind+(e.quiet?'_quiet':'')+(e.by?(e.by.team===0?'_kael':'_foe'):'_none');(e.quiet?quiet:ev)[k]=((e.quiet?quiet:ev)[k]||0)+1;};
const _rl=roomLaunch;roomLaunch=function(A,m,ex){_rl.apply(this,arguments);const k=m.cmd+(A.team===0?'_hero':'_foe')+(ex.res.ok?'_ok':'_fail');mv[k]=(mv[k]||0)+1;};
const foeOffer={turns:0,with:0,kinds:{}};
const _st=startTurn;startTurn=function(i){_st.apply(this,arguments);const A=S.F[i];if(!A||A.dead)return;const O=A.team===0?offer:foeOffer;O.turns++;const ms=roomMoves(A);if(ms.length){O.with++;for(const m of ms)O.kinds[m.cmd]=(O.kinds[m.cmd]||0)+1;}};
if(process.env.NOFOE){const _ac=aiChoice;aiChoice=function(i){const A=S.F[i];if(A&&A.team===1){const s=roomMoves;roomMoves=()=>[];try{return _ac(i);}finally{roomMoves=s;}}return _ac(i);};}
if(process.env.NOROOM){roomMoves=()=>[];}
// ALWAYS: Kael takes the room's first move every time it is offered (and nobody else does); FAKE: the same picks are made (and the
// same dice spent) but he does what he would have done anyway, to separate the move from the shuffle of the dice
if(process.env.ALWAYS||process.env.FAKE){const _ac2=aiChoice;aiChoice=function(i){const A=S.F[i];
  if(A&&A.team===1){const s=roomMoves;roomMoves=()=>[];try{return _ac2(i);}finally{roomMoves=s;}}
  const s=roomMoves;roomMoves=()=>[];let c;try{c=_ac2(i);}finally{roomMoves=s;}
  const ms=roomMoves(A);if(A&&!A.dead&&!A.downed&&!A.clinch&&A.foot>=1&&ms.length){S.rng();if(process.env.ALWAYS){A._roomPick=roomKey(ms[0]);return'room1';}}
  return c;};}
for(const ak of Object.keys(ARENAS))for(const n of (CREWRUN?[1]:[1,2,3]))for(let seed=1+(+process.env.SEED0||0);seed<=SEEDS+(+process.env.SEED0||0);seed++){
  Math.random=mulberry32(seed*977+5);S.arenaKey=ak;S.cfg.n=n;S.cfg.crew=CREWRUN;S.auto=true;S.tableOn=true;S.rng=mulberry32(seed*31+n);S.F=[];rosterBuild();initDuel();
  let k=0;try{while(k<120*400&&S.game.phase!=='over'){simStep();tickOpening(DT*3);k++;}}catch(e){errs++;if(errs<4)console.log('ERR',ak,n,seed,e.stack.split('\\n').slice(0,5).join(' | '));}
  fights++;turns+=S.game.turnNo;hpLost+=S.F[0].maxHp-Math.max(0,S.F[0].hp);}
console.log(JSON.stringify({fights,wins,avgTurns:+(turns/fights).toFixed(1),kaelHpLost:+(hpLost/fights).toFixed(1),errs,events:ev,quiet,moves:mv,offer,foeOffer}));
`);
