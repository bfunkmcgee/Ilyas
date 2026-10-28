// The answers and balance (sk_react.js, and the balance rules in sk_core.js): the window a blow at a hero the player controls opens,
// each answer and what it pays, a break and its one free move, balance coming back on its own, Hold, cover only in a gunfight, and
// Kael's flow (sk_chain.js): links that cost no balance, a run that carries from turn to turn until a blow lands on him.
const core=require('./sk_src.js')(process.argv[2]);
eval(core+`
const errs=[];let nOk=0,base=mulberry32(17),FORCE=[],REACTS=[],PICKS=[];const opened=[],R=[];
S.rng=()=>base();Math.random=()=>base();
// a forced outcome for the next attack roll (the die is picked to give it)
const _ra=resolveAttack;
resolveAttack=function(A,D,kind,op,T){T=T||pickTechnique(A,D,kind);const want=FORCE.shift();if(!want)return _ra(A,D,kind,op,T);
  const c=computeMods(A,D,kind,op,T);let pick=null;
  for(let v=2;v<=19;v++){const tot=v+c.bonus,o=isCrit(v,tot,c.def)?'crit':tot>=c.def?'hit':tot>=c.def-4?'block':'dodge';if(o===want){pick=v;if(want!=='hit')break;}}
  if(want==='hit'){for(let v=2;v<20;v++){const tot=v+c.bonus;if(tot>=c.def&&!isCrit(v,tot,c.def)){pick=v;break;}}}
  if(pick==null)return _ra(A,D,kind,op,T);
  const save=S.rng;let first=true;S.rng=()=>{if(first){first=false;return(pick-.5)/20;}return base();};const r=_ra(A,D,kind,op,T);S.rng=save;return r;};
// a forced answer for an enemy (or a hero on auto)
const _aR=aiReact;aiReact=function(D,A,kind,T,op){const w=REACTS.shift();return w&&reactChoices(D,A).includes(w)?w:_aR(D,A,kind,T,op);};
styleRoll=()=>0;
S.hooks.react=(D,A,k)=>R.push(D.name+':'+k);
const BR=[];S.hooks.broken=(D,by)=>BR.push(D.name+' by '+by.name);
function expect(label,ok,extra){if(ok)nOk++;else errs.push(label+(extra!=null?': '+extra:''));console.log((ok?'ok   ':'FAIL ')+label+(extra!=null?'  '+extra:''));}
// Kael (sword, Expert) against the foes given, each at striking distance on his right unless placed; auto: Kael answers by his own read
function setup(foes,o={}){S.arenaKey='field';S.auto=!!o.auto;S.tableOn=false;S.divOn=false;S.cfg.n=foes.length;S.cfg.crew=false;S.cfg.ally.on=false;
  S.cfg.hero={seed:2207,weapon:'sword',skill:4};foes.forEach((f,i)=>{S.cfg.foes[i]={seed:[5113,7741,3190][i],weapon:f[0],skill:f[1],temper:'plain'};});
  S.F=[];rosterBuild();initDuel();if(S.table)S.table.on=false;
  const K=S.F[0];K.station=380;K.lane=K.dep=K.stepDep=92;K.facing=1;K.build();
  S.F.forEach((f,i)=>{if(!f.team)return;const x=o.at&&o.at[i]!=null?o.at[i]:K.station+engageGap(K,f);f.station=x;f.lane=f.dep=f.stepDep=92;f.side=1;f.facing=-1;f.build();});
  warm(60);S.game.phase='input';startTurn(0);S.game.aiAt=null;S.game.active=0;for(const f of S.F){f.intent=null;f.ready=0;f.foot=footMaxOf(f);f.reads={};}
  FORCE=[];REACTS=[];PICKS=[];opened.length=0;R.length=0;BR.length=0;}
// the exchange to its end; a window or an opening for a hero the player controls takes the next pick (none: the time runs out)
function run(max=120*12){let n=0;for(;n<max;n++){simStep();
    if(S.opening){const o=S.opening;opened.push(o.f.name+':'+o.source+(o.link?'×'+o.link:''));
      if(!isAI(o.f.idx)){const p=PICKS.shift();if(p!=null)resolveOpening(p);else tickOpening(o.left+.01);}else tickOpening(1);}
    if(S.game.phase!=='exchange'&&!S.opening)return n;}return n;}
function act(i,cmd){const g=S.game;g.phase='input';g.active=i;g.aiAt=null;S.opening=null;g.ex=null;return command(i,cmd);}
const lastAttack=()=>{const ex=S.game.ex;return ex&&ex.res;};
let K,V,B;

// ---- the window
setup([['sword',3]]);K=S.F[0];V=S.F[1];
act(1,'slash');const o=S.opening;
expect('a blow at a hero the player controls is held and opens a window for him',!!o&&o.source==='react'&&o.f===K&&o.opp===V&&o.attack==='slash'&&!!(o.ex&&o.ex.reactPending),o&&o.source);
// (and since V70 the Gilt ward, sk_spells.js, while he has the Aether for it)
expect('it offers Parry, Counter, Slip and Step back, and the Ward while he has the Aether (Turn him only with one of his behind him)',o&&JSON.stringify(openingChoices(o))===JSON.stringify(['parry','counter','slip','back',...(wardOK(K)?['ward']:[])]),o&&openingChoices(o).join());
expect('time slows for it: the window lasts two to three and a half seconds of the player\\'s own',o&&o.dur>=REACT.durMin&&o.dur<=REACT.durMax,o&&o.dur);
{const r0=K.ready,v0=V.foot;FORCE=['block'];resolveOpening('parry');const res=lastAttack(),pm=res&&(res.defMods.find(m=>m[0]==='parry')||[0,0])[1];
  expect('Parry: the answer counts in his DEF (+4 against a Slash) and costs him '+REACT.cost+' tempo',R.includes(HERO_NAME+':parry')&&pm===4&&K.ready-r0===REACT.cost,R.join()+' parry '+pm+' tempo '+(K.ready-r0));
  run();
  expect('a blow parried costs the man swinging two pips and opens a riposte for the one who parried, no read roll',opened.includes(HERO_NAME+':parry')&&V.foot<=v0-BAL.parried,opened.join()+' foot '+v0+'>'+V.foot);}

// ---- the time runs out
setup([['sword',3]]);K=S.F[0];V=S.F[1];
act(1,'thrust');run();
expect('if the time runs out, he answers by his own read',R.length===1&&reactChoices(K,V).includes(R[0].split(':')[1]),R.join());

// ---- an enemy answers at once
setup([['sword',3]]);K=S.F[0];V=S.F[1];
act(0,'slash');
expect('an enemy answers a blow at once: no window, the blow goes on',!S.opening&&R.length===1&&R[0].startsWith('Qadir:')&&!(S.game.ex&&S.game.ex.reactPending),R.join());
run();

// ---- Counter
setup([['sword',3]]);K=S.F[0];V=S.F[1];
{FORCE=['dodge'];PICKS=['counter'];const v0=V.foot;act(1,'overhead');run();
  expect('Counter: a blow that misses costs him two pips and opens a counter, no read roll',opened.includes(HERO_NAME+':counter')&&V.foot<=v0-1-BAL.countered,opened.join()+' foot '+v0+'>'+V.foot);}

// ---- Step back
setup([['sword',3]]);K=S.F[0];V=S.F[1];
{K.foot=3;FORCE=['dodge'];PICKS=['back'];act(1,'sweep');run();
  expect('Step back: a blow that misses steadies him by a pip',K.foot>=3+BAL.stepBack,K.foot);}

// ---- Turn him
setup([['sword',3],['axe',2]],{at:{2:null}});K=S.F[0];V=S.F[1];B=S.F[2];
{B.station=V.station+46;B.build();resolveStations();act(1,'slash');const ch=S.opening?openingChoices(S.opening):[];
  expect('with one of his own just behind him, Turn him is offered',ch.includes('turn'),ch.join()+' B@'+Math.round(B.station-V.station));
  const b0=B.foot;FORCE=['dodge'];PICKS=['turn'];run();
  expect('Turn him: a blow that misses him clean sends him into his partner and puts them both down',R.includes(HERO_NAME+':turn')&&B.downed&&V.downed,R.join()+' B '+b0+'>'+B.foot+(B.downed?' down':'')+(V.downed?' V down':''));}

// ---- a break and its one free move
setup([['sword',3]]);K=S.F[0];V=S.F[1];
{V.foot=1;REACTS=['back'];FORCE=['hit'];PICKS=['slash','slash','slash'];act(0,'slash');run();
  expect('knocked to nothing by the other side, he is Broken',BR.includes('Qadir by '+HERO_NAME),BR.join());
  expect('whoever broke him gets one free move, and only one',opened.filter(x=>x.startsWith(HERO_NAME+':broken')).length===1,opened.join());
  expect('a man Broken has no answer to the free move',R.filter(x=>x.startsWith('Qadir:')).length===1,R.join());
  expect('the free move is not at the +3 of an opening',!openBonus({source:'broken'})&&openBonus({source:'parry'}));
  V.broken={by:0,t:S.t,paid:true};V.foot=0;S.game.phase='input';startTurn(V.idx);
  expect('his own turn ends the break, and two pips come back',!V.broken&&V.foot===BAL.recover,V.foot);}

// ---- Kael broken
setup([['sword',3]]);K=S.F[0];V=S.F[1];
{K.foot=1;FORCE=['hit'];PICKS=['back'];act(1,'slash');run();
  expect('Kael can be broken too, and the other side gets the free move',BR.includes(HERO_NAME+' by Qadir')&&opened.includes('Qadir:broken'),BR.join()+' · '+opened.join());}

// ---- balance comes back by itself; a crew man and a boss have their own bars
setup([['sword',3]]);K=S.F[0];V=S.F[1];
{K.foot=1;S.game.phase='input';startTurn(0);const a=K.foot;K.foot=5;startTurn(0);const b=K.foot;
  expect('two pips come back at the start of each of his turns, to the top of his bar',a===1+BAL.recover&&b===FOOT_MAX,a+' '+b);
  expect('a crew man has four pips, a boss eight, everyone else six',footMaxOf({hench:true})===4&&footMaxOf({boss:true})===8&&footMaxOf({})===FOOT_MAX);}

// ---- Hold, and no guard in a melee
setup([['sword',3]]);K=S.F[0];V=S.F[1];
expect('there is no guard to take in a melee, and the guard slot is empty',!cmdValid(K,V,'guard')&&slotAction(K,V,'guard')===null);
act(0,'wait');run();
expect('Hold takes no stance',!K.counter&&!K.guarding&&!K.react);
expect('an answer that was never used does not carry past the exchange',S.F.every(f=>!f.react));
V.setWeapon('pistol');
expect('in a gunfight cover is a guard again, for both sides',cmdValid(K,V,'guard')&&cmdValid(V,K,'guard')&&slotAction(V,K,'guard')==='guard');
act(1,'guard');run();
expect('and cover lasts past the end of the exchange',V.guarding);

// ---- a feint spoils his read
setup([['sword',3]]);K=S.F[0];V=S.F[1];
{const T=pickTechnique(K,V,'slash'),save=S.rng;S.rng=()=>0;const best=_aR(V,K,'slash',T,false);S.rng=save;
  let plain=0,fooled=0;for(let i=0;i<600;i++){if(_aR(V,K,'slash',T,false)===best)plain++;}
  K.feint={tgt:V.idx};for(let i=0;i<600;i++){if(_aR(V,K,'slash',T,false)===best)fooled++;}K.feint=null;
  expect('a man who bit on a feint picks the right answer less often',fooled<plain-60,plain+' > '+fooled+' of 600 ('+best+')');}

// ---- flow
setup([['sword',3],['axe',2]]);K=S.F[0];V=S.F[1];B=S.F[2];
{B.station=K.station-engageGap(K,B)-20;B.side=-1;B.facing=1;B.build();resolveStations();
  V.hp=1;REACTS=['back','back'];FORCE=['hit','block'];PICKS=['overhead'];let spent=null,mods=null;
  const _la=launchAttack;launchAttack=function(A,D,kind,ex,op,po){const b=K.foot,r=_la.apply(this,arguments);if(A===K&&ex&&ex.link&&spent==null){spent=b-K.foot;mods=ex.res&&ex.res.mods;}return r;};
  act(0,'slash');run();launchAttack=_la;
  expect('a takedown with another enemy in reach opens a link straight away, no read roll',opened.includes(HERO_NAME+':flow×1'),opened.join());
  expect('a link spends no balance (an Overhead here) and hits at +1 one into the run',spent===0&&mods&&(mods.find(m=>m[0]==='chain')||[0,0])[1]===1,spent+' '+JSON.stringify(mods&&mods.find(m=>m[0]==='chain')));
  expect('a link that does not put its man down keeps the run',chainSt().live&&chainSt().n===1,JSON.stringify({live:chainSt().live,n:chainSt().n}));
  S.game.phase='input';startTurn(B.idx);startTurn(0);
  expect('flow carries from turn to turn',chainSt().live);
  FORCE=['hit'];PICKS=['back'];act(B.idx,'slash');run();
  expect('a blow that lands on Kael ends it',!chainSt().live&&chainSt().last===1,JSON.stringify({live:chainSt().live,last:chainSt().last,hp:K.hp}));}
setup([['sword',3]]);K=S.F[0];V=S.F[1];
{V.foot=1;REACTS=['back'];FORCE=['hit'];PICKS=['slash'];act(0,'slash');run();
  expect('a break by Kael puts him in flow, and the free move on the broken man is a link',opened.includes(HERO_NAME+':broken×1')&&chainSt().n>=1,opened.join()+' n '+chainSt().n);}

console.log('checks '+nOk);
console.log('errors '+errs.length+' '+JSON.stringify(errs));
`);
