// ===== ACT I, SCENE 7 START =====
// Tamm: the same stair. Tamm comes down because she is late and the oil is hers. She has a boning knife in her right hand, keeps her
// left hand in her apron pocket the whole fight, and does not hurry. The holder lets go of Ilyas to grab for her, and she cuts the
// reaching wrist (the Wrist toll). The other swings; she turns her empty side into it, takes it on the shoulder, steps inside (the
// Hinge), and her knife is under his chin (the Short ladder, held as a threat). She lets them both go with a message for Tarr, then
// picks up the rice.
// A scene played by the game's own combat engine (sk_short.js's Short Hand), with Tamm a scripted fighter: who acts, what each does
// and how it comes out are set here (TAMM7), the engine plays it. Ilyas is out of it, down on the steps (an npc for the fight: no
// turns, nobody's target). Her closing line reads where the rice went in scene 5 (riceWhere()) and whether he put a collector down
// in scene 6 (S.story.flags.downedOne).

// ---------- a scripted fighter ----------
// f.scripted: the AI plays her (never the player), and the script picks her moves
{const ia=isAI;isAI=function(i){const f=S.F[i];if(f&&f.scripted)return true;return ia.apply(this,arguments);};}
// a hand kept in an apron pocket: the arm hangs bent with the hand at the front of the hip, whatever the rest of her does
// (held there in full once she has her strength; while it comes back after a fall the hand goes back to the pocket by degrees)
function pocketFollow(f){const p=f.p,c=p[CHE],pl=p[PEL],fa=f.facing,a=f.arm,w=clamp((f.motor-.3)/.4,0,1);if(w<=0)return;
  const h={x:pl.x+fa*.12*a,y:pl.y-.08*a},e={x:lerp(c.x,h.x,.5)-fa*.2*a,y:lerp(c.y,h.y,.55)};
  for(const [i,q] of [[ELB,e],[HAB,h]]){const r=p[i];r.x=lerp(r.x,q.x,w);r.y=lerp(r.y,q.y,w);r.px=lerp(r.px,q.x,w);r.py=lerp(r.py,q.y,w);}}
V11.step.push(()=>{for(const f of S.F)if(f.pocketHand&&!f.downed&&!f.dead)pocketFollow(f);});
{const co=collide;collide=function(f,final){co(f,final);if(f.pocketHand&&!f.downed&&!f.dead)pocketFollow(f);};}
// her knife: a boning knife (the design 'crew:boning')
{const af=S.hooks.arms;S.hooks.arms=(f,k)=>f&&f.pitCast==='Tamm'&&k==='dagger'?'crew:boning':af(f,k);}
// Tamm as a fighter of the Pit: the cast's body and look, Short Hand at a master's rank, a boning knife, a hand in her pocket
function act1Fighter(name,o){const c=ACT1_CAST[name]||{},seed=c.seed||(name.length*97),f=new Fighter(S.F.length,o.team??0,name,c.color||'#c9a46a');
  f.pitCast=name;f.scfg={seed,weapon:o.weapon||'dagger',skill:o.skill??5,temper:'plain'};Object.assign(f,{seed,weaponKey:o.weapon||'dagger',skill:o.skill??5,temper:'plain'});
  S.F.push(f);S.trails.push([]);const hw=S.cfg.hero.weapon;S.cfg.hero.weapon=o.weapon||'dagger';
  try{initFighter(f,[o.x,o.z,0],[[o.x,o.z]]);}finally{S.cfg.hero.weapon=hw;}
  f.maxHp=f.hp=o.hp||120;f.facing=o.facing??-1;f.build();f.reads={};return f;}

// ---------- the script ----------
// who acts when, and with what: the holder grabs for her (she answers with the Wrist toll), the other swings (the Hinge), and she
// answers with the Short ladder, its point stopped under his chin
const TAMM7={pace:[0,20,40]};
function t7(){const st=act1Stage();return st&&st.key==='tamm'&&S.act1?S.act1.t7:null;}
function t7Cast(){const A=S.act1||{};return{T:A.tammF,B:S.F.find(f=>f.team===1&&!f.npc&&f.pitCast==='Big collector'),C:S.F.find(f=>f.team===1&&!f.npc&&f.pitCast==='Collector')};}
{const ac=aiChoice;aiChoice=function(i){const R=t7();if(!R||!S.story||S.story.step!=='fight')return ac.apply(this,arguments);
  const {T,B,C}=t7Cast(),A=S.F[i];
  if(A===B&&R.beat===0){B.tgt=T.idx;return cmdValid(B,T,'grab')?'grab':'advance';}
  if(A===C&&R.beat===1){C.tgt=T.idx;return['overhead','slash'].find(k=>cmdValid(C,T,k))||'advance';}
  if(A===T&&R.beat===2){setTgt(T,C.idx);T.shortThreat=true;return cmdValid(T,C,'thrust')?'thrust':'advance';}
  return'wait';};}
// each beat played moves the script on, and the next to act is the next in it (a step to close in first keeps the turn with him)
{const cm=command;command=function(i,cmd){const ok=cm.apply(this,arguments),R=t7();if(!ok||!R)return ok;const {T,B,C}=t7Cast(),A=S.F[i];
  if(A===B&&R.beat===0){if(cmd==='grab'){R.beat=1;C.ready=0;T.ready=10;B.ready=999;}else{B.ready=0;C.ready=999;T.ready=999;}}
  else if(A===C&&R.beat===1){if(ATTACKS.includes(cmd)){R.beat=2;T.ready=0;B.ready=999;C.ready=999;}else{C.ready=0;B.ready=999;T.ready=999;}}
  else if(A===T&&R.beat===2){if(cmd==='thrust')R.beat=3;else{T.ready=0;B.ready=999;C.ready=999;}}
  return ok;};}
// how each comes out: her answers are the ones the script names, and the swing lands, on the shoulder she turned into it
{const ar=aiReact;aiReact=function(D,A,kind,T,op){const R=t7();if(R&&D===t7Cast().T){const ch=reactChoices(D,A);if(ch.includes('hinge'))return'hinge';}return ar.apply(this,arguments);};}
if(typeof aiToll==='function'){const at=aiToll;aiToll=function(D,A){const R=t7();if(R&&D===t7Cast().T)return true;return at.apply(this,arguments);};}
{const ra=resolveAttack;resolveAttack=function(A,D,kind,op,T){const R=t7();
  if(R&&!R.forcing&&R.beat===1&&D===t7Cast().T&&A===t7Cast().C){R.forcing=true;try{return resolveForced(A,D,kind,op,T||pickTechnique(A,D,kind),'hit');}finally{R.forcing=false;}}
  return ra.apply(this,arguments);};}
// no free moves in it: the script is the fight (a cut wrist, a blow on the shoulder, the knife at the chin)
{const co=considerOpening;considerOpening=function(){if(t7())return;return co.apply(this,arguments);};}
// the point under his chin (the exchange holds there until she lets him go): the fight is over, and the scene goes on from it
{const sh=S.hooks.short;S.hooks.short=(ev,d)=>{if(sh)sh(ev,d);const R=t7();if(R&&ev==='ladder'&&d&&d.res&&d.res.threat&&d.A===t7Cast().T)R.held=true;};}
V11.step.push(()=>{const R=t7();if(!R||!R.held||R.end||!S.story||S.story.step!=='fight')return;R.end=true;for(const f of S.F)f.intent=null;S.opening=null;storyCleared();});

STAGES.push({key:'tamm',act:1,num:'7',title:'Tamm',sub:'The same stair',arena:'stairs',next:null,weapon:'dagger',wear:'kit',spare:true,
  foes:[{name:'Collector',cast:'Collector',seed:7411,weapon:'club',skill:3,temper:'rusher',hp:70,human:true},
        {name:'Big collector',cast:'Big collector',seed:7433,weapon:'fists',skill:3,temper:'brute',hp:90,human:true}],
  spawn:[[460,100],[420,96,-1],[500,104,1]],
  setup(st){const K=hero(),A=act1State(),E=A.tollEnd||{K:{x:470,z:98,hp:110},big:{x:500,z:101,hp:70},small:{x:420,z:94,hp:50},drop:null,spill:null};
    S.fade=.6;A.dusk=true;A.flight='lane';A.spikeView=0;if(!A.errand)A.errand=errandDone();
    if(A.tollDrop===undefined)A.tollDrop=E.drop;if(A.riceSpill===undefined)A.riceSpill=E.spill;
    A.t7={beat:0,end:false};
    // where scene 6 left them: he is down on the steps, out of the fight
    K.station=E.K.x;K.lane=K.dep=K.stepDep=E.K.z;K.build();K.hp=Math.max(1,E.K.hp);knockDown(K);K.npc=true;
    const {B,C}={B:S.F.find(f=>f.pitCast==='Big collector'),C:S.F.find(f=>f.pitCast==='Collector')};
    B.station=E.big.x;B.lane=B.dep=B.stepDep=E.big.z;B.hp=Math.max(20,E.big.hp);B.facing=Math.sign(K.station-B.station)||-1;B.build();
    C.station=E.small.x;C.lane=C.dep=C.stepDep=E.small.z;C.hp=Math.max(20,E.small.hp);C.facing=Math.sign(K.station-C.station)||1;C.build();
    B.action=kneelHold(B,99,()=>{const c=K.p[CHE];return{x:c.x,y:c.y-2};});C.action=stoopAction(C,99,{crouch:.74,lean:.5});
    // Tamm, up the stair, not yet come down
    const T=act1Fighter('Tamm',{x:880,z:102,facing:-1,skill:5,hp:120});T.scripted=true;T.pocketHand=true;T.style='shorthand';
    T.styleMoves={stance:true,hinge:true,toll:true,ladder:true,check:true,hook:true};T.hidden=true;T.offstage=true;A.tammF=T;
    for(const f of S.F)f.ready=999;B.ready=TAMM7.pace[0];C.ready=TAMM7.pace[1];T.ready=TAMM7.pace[2];},
  *intro(st){const K=hero(),A=act1State(),T=A.tammF,{B,C}=t7Cast();
    letter(1);camTo(K.station+80,680,0);yield* fadeTo(.25,1.2);yield* wait(.6);
    // Where they meet her: the two of them just past him on her side (up the stair, toward the Shelf she comes from, unless he lies
    // too near the top for it), and she a fight's distance on from them. Scene 6 can end with either of them on the far side of him;
    // nobody walks over him to get there, and each goes round in front of him (front: a shallower line than his).
    const dir=K.station+46+118<=850?1:-1,bx=dir>0?Math.max(B.station,K.station+46):Math.min(B.station,K.station-46),tx=clamp(bx+dir*118,60,850);
    const zf=clamp(Math.min(K.lane,B.lane,C.lane)-40,44,146),round=function*(f,x,z,v){if((f.station-K.station)*dir<20){yield* goTo(f,f.station,zf,v);yield* goTo(f,x,zf,v);}yield* goTo(f,x,z,v);};
    // down the steps from the Shelf, at her own pace
    T.hidden=false;T.offstage=false;
    if(dir<0){yield* goTo(T,Math.max(B.station,C.station,K.station)+60,zf,44);yield* goTo(T,tx,zf,44);}
    yield* goTo(T,tx,102,44);T.facing=-dir;
    yield* speak('Tamm','You’re late. That oil is mine.',{dur:2.8});
    // the smaller one gets up and comes round beside the bigger
    C.action=null;yield* wait(.3);yield* round(C,bx-dir*8,B.lane-18,70);C.facing=dir;
    yield* speak('Collector','This is Pump King business, Tamm.',{dur:2.8});
    // the holder lets go of him and gets up to meet her
    B.action=null;if((B.station-K.station)*dir<0)yield* round(B,bx,B.lane,60);else if(Math.abs(bx-B.station)>2)yield* goTo(B,bx,B.lane,60);B.facing=dir;
    // (each on the side of him he stands on now: the fight keeps a man on his own side of Ilyas, and would put one standing on the
    // other side straight back over him, past Tamm, at his first turn)
    for(const f of [B,C])f.side=Math.sign(f.station-K.station)||dir;
    yield* fadeTo(0,.6);yield* wait(.5);
    letter(0);},
  *outro(st){const K=hero(),A=act1State(),T=A.tammF,{B,C}=t7Cast();
    // the point under his chin, and the message for Tarr
    yield* wait(.6);
    yield* speak('Tamm','The Sump pays its water on the first, same as always. Tell Osgood.',{dur:4});
    if(typeof shortRelease==='function')shortRelease(T);T.shortThreat=false;yield* wait(.5);
    // they go, down the stair and away, the bigger one with his wrist held to him
    yield* riseUp([B,C],.7);
    // (whoever has to pass her or Ilyas to get down the stair goes round behind them, deeper than either, and nobody walks through
    // anybody: the two of them go together at one pace, the one standing deeper on the deeper line and the other on a line in front
    // of his, both lines planned before either moves, so their paths never cross; past her and him they go on down on those lines)
    const by=[T,K].filter(o=>o&&(o.station<B.station+10||o.station<C.station+10)),inWay=by.length>0,top=inWay?Math.max(...by.map(o=>o.lane)):0,
      deep=clamp(top+40,40,148),[lo,hi]=B.lane<=C.lane?[B,C]:[C,B],zHi=inWay?deep:hi.lane,zLo=inWay?Math.max(top+16,deep-24):lo.lane;
    const away=(f,z)=>(function*(){if(inWay){yield* goTo(f,f.station-4,z,70);yield* goTo(f,Math.min(...by.map(o=>o.station))-60,z,85);}yield* goTo(f,-60,z,85);})();
    yield* all(away(hi,zHi),away(lo,zLo));
    for(const f of [B,C]){f.hidden=true;f.offstage=true;}
    // then the rice
    const D=A.tollDrop;if(D&&D.id==='rice'){yield* goTo(T,D.x+T.facing*0+14,D.d,44);T.facing=Math.sign(D.x-T.station)||-1;T.action=stoopAction(T,1.2,{crouch:.72,lean:.55});
      yield* wait(.7);D.gone=true;A.riceHeld='tamm';yield* wait(.6);T.action=null;}
    const where=typeof riceWhere==='function'?riceWhere():null;
    {const sx=T.station<K.station?K.station-30:K.station+30;yield* goTo(T,sx,K.lane+2,40);T.facing=Math.sign(K.station-sx)||-1;}yield* wait(.4);
    if(where==='bag')yield* speak('Tamm','Well. The rice made it.',{dur:2.6});
    else yield* speak('Tamm','You dropped my rice.',{dur:2.4});
    if(S.story.flags.downedOne)yield* speak('Tamm','You put one down. With one hand and no light. Huh.',{dur:3.6});
    yield* fadeTo(1,1.6);if(!st.next)S.story.ended='act1';}});
// the chain: the toll goes on into Tamm
{const tl=STAGES[stageIx('toll')];if(tl&&!tl.next)tl.next='tamm';}
// ===== ACT I, SCENE 7 END =====
