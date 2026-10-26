// ===== ACT I, SCENE 6 START =====
// The Toll: a stair-street below the Shelf, at dusk. Two of Tarr's collectors close a switchback, one above him and one below. Thirty
// years of habit answer for him, and he refuses. He reaches for the fight he knows, and most of it is not there.
// The first fight of Act I, and one he is meant to lose. The dagger is in his left hand and they act twice for every once he does (each
// of them at his pace: TOLL.pace). When he steps in, the bigger one gets behind him and pins his only arm while the other goes to work
// (the pin: TOLL.gangHits blows, then down on the steps, Broken). Twist free and the over-shoulder throw both need two hands. The fight
// ends on a condition, not a game over: Broken a second time, or under a third of his health. Nobody dies on the stair (st.spare): a
// blow that would kill puts a man down instead. A player who downs one of them sees the other close the pin anyway, and Tamm notices in
// scene 7 (S.story.flags.downedOne).
const TOLL={pace:1,gangHits:2,heldTurns:2,breaks:2,hpEnd:1/3};

// ---------- what any Act I fight needs ----------
// a story foe with `cast` is that figure of the cast (its body from ACT1_CAST, its look from CastLook.CAST): set before the body is made
{const sr=storyRoster;storyRoster=function(st){sr(st);if(!st.act)return;st.foes.forEach((e,i)=>{const f=S.F[i+1];if(f&&e.cast)f.pitCast=e.cast;});};}
// a fighter's own pace (f.tempoK): every cost he pays is scaled by it, so the turn order, the plans shown and the dock all agree
{const ac=actionCost;actionCost=function(f,c,x){const v=ac(f,c,x);return f&&f.tempoK?Math.round(v*f.tempoK):v;};}
// nobody dies in a stage that spares them (st.spare): the blow that would have killed puts him down with a breath left, no finisher
function act1Spare(f){const st=act1Stage();return!!st&&!!st.spare&&!!f&&!f.npc&&(f===S.F[0]||f.team===1||!!f.pitCast);}
{const ra=resolveAttack;resolveAttack=function(A,D,kind,op,T){const r=ra.apply(this,arguments);
  // the whetstone's edge: his blade cuts two deeper for one fight
  if(r&&A&&A===S.F[0]&&A.whet&&(r.out==='hit'||r.out==='crit')&&A.wp&&A.wp.edge&&r.dmg>0)r.dmg+=ACT1_GOODS.whet;
  if(r&&act1Spare(D)&&(r.out==='hit'||r.out==='crit')){if(r.dmg>=D.hp){r.dmg=Math.max(0,D.hp-1);r.kd=true;}if(r.tech&&r.tech.fin)r.tech={...r.tech,fin:null};}
  return r;};}
// what scene 5's shop sells does what it says: the whetstone's edge (two more on each cut of his) lasts the next fight he fights; a
// salve (four tenths of his health) goes on between fights, at the start of the next one he is hurt for (under seven tenths)
const ACT1_GOODS={whet:2,salve:.4,salveBelow:.7};
V11.duelStart.push(()=>{const st=act1Stage(),A=S.act1;if(!st||!A||!A.errand||!st.foes||!st.foes.length||st.key==='tamm')return;const K=S.F[0],E=A.errand;
  K.whet=!!E.sharp&&!st.sh;A.whetShown=false;
  if(!st.sh&&E.salve>0&&K.hp<K.maxHp*ACT1_GOODS.salveBelow){const n=Math.min(K.maxHp-K.hp,Math.round(K.maxHp*ACT1_GOODS.salve));K.hp+=n;E.salve--;
    const i=E.bag.indexOf('salve');if(i>=0)E.bag.splice(i,1);else if(E.hand==='salve')E.hand=null;A.salveUsed={n,shown:false};}});
// (said when the fight starts: the edge, the salve)
{const sf=storyFight;storyFight=function(){sf.apply(this,arguments);const A=S.act1,K=S.F[0];if(!act1On()||!A||!K)return;
  if(K.whet&&!A.whetShown){A.whetShown=true;popup(K,'Whetted edge','#e2b65a','+'+ACT1_GOODS.whet+' on a cut, this fight',20,-52);}
  if(A.salveUsed&&!A.salveUsed.shown){A.salveUsed.shown=true;popup(K,'Salve','#a9e88c','+'+A.salveUsed.n,20,-30);}};}
// the edge is spent once the fight it was for is over
{const sc=storyCleared;storyCleared=function(){const A=S.act1,K=S.F[0];if(act1On()&&K&&K.whet&&A&&A.errand){A.errand.sharp=false;K.whet=false;}return sc.apply(this,arguments);};}
{const k=kill;kill=function(D,dir){if(act1Spare(D)&&!D.dead){D.hp=Math.max(1,D.hp);if(!D.downed)knockDown(D);return;}return k.apply(this,arguments);};}
// Kael's flow (sk_chain.js) went with the light: drained, in the Pit, a takedown or a break starts no run
{const ca=chainAdd;chainAdd=function(){const K=hero();if(act1On()&&K&&K.drain)return;return ca.apply(this,arguments);};}
// and its reach went with it: drained, a takedown flows on to the next man the way it does for any fighter of his rank (sk_core's
// flowTarget and considerFlow: a man close by, and the read rolled, never free)
function act1Drained(f){return!!f&&f===hero()&&!!f.drain&&act1On();}
{const ft=flowTarget;flowTarget=function(A,D){if(!act1Drained(A))return ft.apply(this,arguments);
  if(A.skill<RANK.expert)return null;let best=null,bd=1e9;
  for(const o of rivals(A)){if(o===D)continue;const d=Math.abs(o.station-A.station)-engageGap(A,o),dz=Math.abs(o.lane-A.lane);if(d<=60&&dz<=56&&d+dz<bd){bd=d+dz;best=o;}}
  return best;};}
{const cf=considerFlow;considerFlow=function(ex,f,E){if(!act1Drained(f))return cf.apply(this,arguments);
  if(f.dead||E.dead||(ex.depth||0)>=4||ex.openAt!=null)return;
  const read=readRoll(f,E,'flow',ex.depth||0);S.hooks.read(ex,f,read,'flow',E);
  if(read.ok){ex.openAt=S.t+.14;ex.openFor=f;ex.openSource='flow';ex.openKind='flow';ex.openOpp=E;}};}
// one arm: what needs two hands is not there, and a man held from behind by his only arm has no elbow and nothing to shield with
function oneArmLock(A,cmd){if(!A||!A.oneArm)return null;const c=A.clinch;
  if(cmd==='throw')return'Needs two hands';
  if(!c)return null;const held=c.b===A;
  if(held&&c.behind&&cmd==='breakfree')return'Needs two hands';
  if(held&&c.behind&&(cmd==='elbow'||cmd==='shield'||cmd==='stab'))return'Arm pinned';
  return null;}
{const cv=cmdValid;cmdValid=function(A,D,cmd){if(oneArmLock(A,cmd))return false;return cv.apply(this,arguments);};}
// (on auto he answers a pin with what he has: the back of his head, a heel)
{const acl=aiClinch;aiClinch=function(A,D){const c=acl(A,D);if(!oneArmLock(A,c))return c;
  const ks=['headbutt','knee'].filter(k=>cmdValid(A,D,k));return ks.length?ks[Math.floor(S.rng()*ks.length)]:'wait';};}

// ---------- the toll ----------
function tollRec(){const st=act1Stage();return st&&st.key==='toll'&&S.act1?S.act1.toll:null;}
function tollBig(){return S.F.find(f=>f.team===1&&!f.npc&&f.pitCast==='Big collector');}
function tollSmall(){return S.F.find(f=>f.team===1&&!f.npc&&f.pitCast==='Collector');}
function tollFighting(){return!!tollRec()&&!!S.story&&S.story.step==='fight';}
// he steps in (a blow, a shove, a step at them): the pin is armed (and by his third turn, whatever he does)
{const cm=command;command=function(i,cmd){const ok=cm.apply(this,arguments),T=tollRec();
  if(ok&&T&&tollFighting()&&S.F[i]===S.F[0]){T.acts++;if(ATTACKS.includes(cmd)||cmd==='shove'||cmd==='advance'||cmd==='grab'||cmd==='feint')T.stepIns++;
    if(!T.gang&&(T.stepIns>0||T.acts>=3))T.gang='armed';}
  return ok;};}
// the bigger one: once armed, he goes for the pin (closing in first if he must), and once he has it he holds it; the smaller one
// leaves the holding to him
{const ac=aiChoice;aiChoice=function(i){const T=tollFighting()?tollRec():null,A=S.F[i],K=S.F[0];
  // (while he is held the smaller one works on him: a blow each turn he has the balance for one)
  if(T&&A&&A===tollSmall()&&T.gang==='held'&&heldBy(K)===tollBig()&&!A.downed&&!A.clinch){const k=['overhead','thrust','slash'].find(c=>cmdValid(A,K,c));if(k)return k;}
  if(T&&A&&A===tollBig()){
    if(T.gang==='held'&&A.clinch&&clinchPartner(A)===K)return'wait';
    if(T.gang==='armed'&&!A.downed&&!A.clinch&&!K.downed&&!K.clinch&&!K.dead){if(cmdValid(A,K,'grab'))return'grab';if(cmdValid(A,K,'advance'))return'advance';}}
  const c=ac.apply(this,arguments);
  if(T&&A&&c==='grab'&&!(A===tollBig()&&T.gang==='armed'))return['overhead','slash','thrust'].find(k=>cmdValid(A,K,k))||'wait';
  return c;};}
// the pin takes: from behind, his only arm caught
{const rg=resolveGrab;resolveGrab=function(A,D,op){const r=rg.apply(this,arguments),T=tollFighting()?tollRec():null;
  if(T&&T.gang==='armed'&&A===tollBig()&&D===S.F[0]){r.ok=true;r.behind=true;r.crush=false;}return r;};}
{const dg=doGrab;doGrab=function(A,D,gr,fa){dg.apply(this,arguments);const T=tollRec();
  if(T&&A===tollBig()&&D===S.F[0]&&heldBy(D)===A){T.gang='held';T.hits=0;T.heldTurns=0;T.pins++;}};}
// (his own turns in the hold: there are only so many before the holder has had enough of him)
V11.turnStart.push(i=>{const T=tollRec();if(T&&T.gang==='held'&&S.F[i]===S.F[0])T.heldTurns++;});
// the other goes to work on the held man
{const ra=resolveAttack;resolveAttack=function(A,D){const r=ra.apply(this,arguments),T=tollRec();
  if(T&&T.gang==='held'&&A===tollSmall()&&D===S.F[0]&&heldBy(D)===tollBig())T.hits++;return r;};}
// enough of it, and the holder lets him drop: down on the steps, Broken (beaten down out of the hold comes to the same)
V11.exchangeEnd.push(()=>{const T=tollRec();if(!T||T.gang!=='held')return;const K=S.F[0],B=tollBig();
  const out=!K.clinch||heldBy(K)!==B;
  if(out&&!K.downed){T.gang=null;return;}
  if(!out&&T.hits<TOLL.gangHits&&T.heldTurns<=TOLL.heldTurns)return;
  endClinch(K);T.gang=null;T.pinDowns++;if(!K.broken)breakFighter(K,tollSmall()||B);if(!K.downed)knockDown(K);S.shake=Math.max(S.shake,6);
  popup(K,'Down on the steps','#ffb347',null,20,-30);S.hooks.sound('thud',300);});
// what counts: each time he is Broken once the pin has put him down the first time (that is the first), and a collector put down by him
{const bf=breakFighter;breakFighter=function(D){bf.apply(this,arguments);const T=tollRec();if(T&&D===S.F[0]&&tollFighting()&&T.pinDowns>0)T.breaks++;};}
{const kd=knockDown;knockDown=function(D){const was=D&&D.downed;kd.apply(this,arguments);const T=tollRec();
  if(T&&tollFighting()&&D&&!was&&D.team===1&&!D.npc){T.downed=true;S.story.flags.downedOne=true;}};}
// the end: Broken twice, or under a third of his health, at the turn after
function tollOver(){const T=tollRec(),K=S.F[0];return!!T&&!T.end&&tollFighting()&&(T.breaks>=TOLL.breaks||K.hp<K.maxHp*TOLL.hpEnd);}
{const stt=startTurn;startTurn=function(i){if(tollOver()){tollEnd();return;}return stt.apply(this,arguments);};}
// down on one knee over a man on the ground, a hand (both, if he has them) pressing him there
function kneelHold(f,dur,fn){const pt={fn},to={hand:pt,wAng:1.2,off:{fn:()=>{const q=fn();return{x:q.x-f.facing*6,y:q.y+3};}},tilt:.1},
    low=()=>({...easyBody(f),crouch:.6,lean:.52});
  return{t0:S.t,end:dur,body:[{t:0,v:()=>easyBody(f)},{t:.5,v:low,e:eOut},{t:dur,v:low}],arm:[{t:0,v:easyArm(f)},{t:.5,v:to,e:eOut},{t:dur,v:to}]};}
function tollEnd(){const T=tollRec(),K=S.F[0];T.end=true;for(const f of S.F)endClinch(f);if(!K.downed)knockDown(K);
  for(const f of S.F){f.intent=null;f.action=f.downed?f.action:null;}S.opening=null;storyCleared();}

STAGES.push({key:'toll',act:1,num:'6',title:'The Toll',sub:'A stair-street below the Shelf, at dusk',arena:'stairs',next:null,weapon:'dagger',wear:'kit',spare:true,
  foes:[{name:'Collector',cast:'Collector',seed:7411,weapon:'club',skill:3,temper:'rusher',hp:70,human:true},
        {name:'Big collector',cast:'Big collector',seed:7433,weapon:'fists',skill:3,temper:'brute',hp:90,human:true}],
  spawn:[[700,100],[240,96,-1],[880,104,1]],
  setup(st){const K=hero(),A=act1State(),Sm=tollSmall(),Bg=tollBig();S.fade=1;A.dusk=true;A.spikeView=0;A.tollDrop=null;A.riceSpill=null;
    if(!A.errand)A.errand=errandDone();
    A.toll={breaks:0,stepIns:0,acts:0,gang:null,hits:0,pins:0,pinDowns:0,downed:false,end:false};S.story.flags.downedOne=false;
    standEasy(K);K.station=700;K.lane=K.dep=K.stepDep=100;K.facing=-1;K.build();
    for(const f of [Sm,Bg]){f.hidden=true;f.offstage=true;standEasy(f);}
    Sm.station=240;Sm.lane=Sm.dep=Sm.stepDep=96;Sm.facing=1;Sm.build();Bg.station=880;Bg.lane=Bg.dep=Bg.stepDep=104;Bg.facing=-1;Bg.build();
    // each of them at his pace: together, two turns to his one
    for(const f of [Sm,Bg]){f.tempoK=null;f.tempoK=clamp(TOLL.pace*actionCost(K,'slash')/Math.max(1,actionCost(f,'slash')),.3,1.2);}
    for(const f of S.F)if(!f.npc)f.ready=Math.round(actionCost(f,'slash')*.5);},
  *intro(st){const K=hero(),A=act1State(),Sm=tollSmall(),Bg=tollBig(),E=errand();
    letter(1);camTo(560,720,0);yield* fadeTo(0,1.2);
    // down the switchback with Tamm's goods; the smaller one steps up onto the stair below him, the bigger one comes down behind
    yield* goTo(K,560,100,62);
    Sm.hidden=false;Sm.offstage=false;yield* goTo(Sm,400,96,80);Sm.facing=1;
    yield* speak('Collector','Water toll on goods, friend. A chit a bag.',{dur:3});
    Bg.hidden=false;Bg.offstage=false;yield* all(goTo(Bg,700,104,74),(function*(){yield* wait(.5);K.facing=1;yield* wait(.6);K.facing=-1;})());Bg.facing=-1;
    yield* speak(HERO_NAME,'I’ve never paid a toll in my life.',{dur:2.6});
    yield* speak('Collector','Then you’ve been lucky. Pump King says everyone pays.',{dur:3.4});
    // his one hand is for the knife: what it held goes down on the step
    if(E.hand){const x=K.station+K.facing*12;A.tollDrop={id:E.hand,x,d:K.lane+8};errandHand(null);K.action=stoopAction(K,.8,{crouch:.82,lean:.42});yield* wait(.9);K.action=null;}
    // he reaches for the fight he knows: the Aether tab, once, and gone
    // (out before the dock comes up: the flicker shows in the dock's place)
    A.flicker={t0:S.t};S.hooks.sound('fizzle',.8);yield* wait(1.6);
    letter(0);},
  *outro(st){const K=hero(),A=act1State(),Sm=tollSmall(),Bg=tollBig();camTo(K.station,560,1.4);
    // down on the steps, Broken; the rice he had in his hand across the stair
    if(A.tollDrop&&A.tollDrop.id==='rice'){A.riceSpill={x:A.tollDrop.x,d:A.tollDrop.d,t0:S.t};S.hooks.sound('plates',.4);}
    yield* wait(.8);
    // the bigger one kneels on him; the smaller one crouches at his arm and looks at the ink on it
    yield* riseUp([Bg,Sm]);
    // (the smaller one, on the bigger one's side of him, goes round them both to his arm, not through them: round the near side of
    // them, or the far side if he stands on the far side of the bigger one, so he never crosses the bigger one's line)
    const fa=Math.sign(Bg.station-K.station)||1,sx=K.station-fa*52,sz=K.lane-6;
    const smTo=(function*(){if((Sm.station-K.station)*fa>0){const far=Sm.lane>Bg.lane,
        zb=far?clamp(Math.max(K.lane,Bg.lane,Sm.lane)+40,44,146):clamp(Math.min(K.lane,Bg.lane,Sm.lane)-40,44,146);
        yield* goTo(Sm,Sm.station,zb,60);yield* goTo(Sm,sx,zb,60);}
      yield* goTo(Sm,sx,sz,60);})();
    yield* all(goTo(Bg,K.station+fa*26,K.lane+3,60),smTo);
    Bg.facing=-fa;Sm.facing=fa;Bg.action=kneelHold(Bg,9,()=>{const c=K.p[CHE];return{x:c.x,y:c.y-2};});
    Sm.action=stoopAction(Sm,9,{crouch:.74,lean:.5});yield* wait(1);
    yield* fadeTo(.35,.8);
    yield* speak('Collector','Same ink as the arm in the pump...',{dur:3.2});
    yield* speak('Big collector','Shut it.',{dur:1.6});
    // half out: where they all are is where Tamm finds them
    A.tollEnd={K:{x:K.station,z:K.lane,hp:K.hp},big:{x:Bg.station,z:Bg.lane,hp:Bg.hp,down:!!Bg.downed},small:{x:Sm.station,z:Sm.lane,hp:Sm.hp,down:!!Sm.downed},drop:A.tollDrop,spill:A.riceSpill};
    yield* fadeTo(.6,1.2);
    if(!st.next){yield* fadeTo(1,1);S.story.ended='act1';}}});
// the chain: the way back down at dusk goes on into the toll
{const sd=STAGES[stageIx('stairsdown')];if(sd&&!sd.next){sd.next='toll';const o=sd.outro;sd.outro=function*(st){yield* fadeTo(1,1.2);};void o;}}
// ===== ACT I, SCENE 6 END =====
