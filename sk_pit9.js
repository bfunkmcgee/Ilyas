// ===== ACT I, SCENE 9 START =====
// Short Hand: the Sump's yard, a week of mornings. The Tarkesh veterans called it Short Hand: short a hand, and short with the knife.
// They were Caliphate soldiers who lost hands and arms in the Poisoned River war and came south in the dispersals with no trade but
// fighting. They built a style out of what they had left, and Tamm learned it on the back step of her grandfather's fish stall.
// Each lesson is a drill, then a short bout against Tamm with a rolling pin (SH_LESSONS): the stance (she shoves him round the yard
// with a broom while he holds his balance), the Hinge, the Wrist toll, the Short ladder, and the Blind-side check with the Ankle hook
// (the yard's barrels and crates are fixed props for them). The week ends with a bout to three touches; Tamm fights with her left hand
// in her apron pocket. When he takes the third touch, she gives him the door.
// The rules of the style are sk_short.js's (f.style, f.styleMoves). Here: what he has learned (S.story.flags.short, so a chapter
// picked from the menu starts with the lessons before it), the drills (what Tamm does, what counts, and the count), the bouts (a hit
// is a touch: no damage, a popup, the count), and the styles screen's moment (S.act1.styles, drawn by sk_pit9ui.js).

const SH_MOVES=['stance','hinge','toll','ladder','check','hook'];
// the lessons: the move each teaches, Tamm's line, her weapon in the drill, what she does each turn of it, what counts and how many;
// cap: the most of her turns the drill runs before she calls it and goes on to the bout anyway (a drill never holds him for good);
// coach: what she tells him when a few of her turns have gone by with nothing counted (shown in the lesson's box); praise: her word
// when the drill is done
const SH_LESSONS=[
  {key:'sh1',num:'9',morning:1,title:'Short Hand',sub:'The Sump’s yard, a week of mornings',teach:['stance'],name:'The stance',
   line:'Empty side back. Knife close. Your feet are your other hand now.',drillWeapon:'spear',drill:'shove',need:4,cap:16,coach:'Low. Weight forward. Let it go through you, and Hold.',praise:'Better.',
   goal:n=>'Hold your balance: '+n+' of 4 shoves',hint:{touch:'Short Hand is your style now. Stay on your feet; Hold keeps your balance coming back.',keys:'Short Hand is your style now. Stay on your feet; Hold (0) keeps your balance coming back.'}},
  {key:'sh2',morning:2,title:'The Hinge',teach:['hinge'],name:'The Hinge',
   line:'Don’t block. You’ve nothing to block with. Take it on the shoulder and walk in.',drill:'swing',need:2,cap:10,
   coach:'Not a block. Turn your empty side into it: the Hinge.',praise:'That’s it.',
   goal:n=>'Answer her swing with the Hinge: '+n+' of 2',hint:{touch:'When she swings, pick Hinge in the answer window.',keys:'When she swings, pick Hinge in the answer window.'}},
  {key:'sh3',morning:3,title:'The Wrist Toll',teach:['toll'],name:'The Wrist toll',
   line:'Anything that reaches for you pays the toll.',drill:'reach',need:2,cap:10,
   coach:'The hand that reaches. Cut it: the Wrist toll.',praise:'Good.',
   goal:n=>'Make her reaching hand pay the toll: '+n+' of 2',hint:{touch:'When she grabs or thrusts, pick Wrist toll.',keys:'When she grabs or thrusts, pick Wrist toll.'}},
  {key:'sh4',morning:4,title:'The Short Ladder',teach:['ladder'],name:'The Short ladder',
   line:'Up from under. A man guards his face and forgets his belly.',drill:'ladder',need:2,cap:18,
   coach:'Take my swing on the shoulder first. Then up from under.',praise:'Huh.',
   goal:n=>'Land the Short ladder from inside her reach: '+n+' of 2',hint:{touch:'Get inside (a Hinge does it), then Thrust: from Short Hand it is the Short ladder.',keys:'Get inside (a Hinge does it), then Thrust (3): from Short Hand it is the Short ladder.'}},
  {key:'sh5',morning:5,title:'Check and Hook',teach:['check','hook'],name:'The Blind-side check and the Ankle hook',
   line:null,drill:'checkhook',need:2,cap:18,coach:'Get inside, or catch me unsteady. Then the shoulder. Then my heel.',praise:'Good.',
   goal:n=>'The Blind-side check and the Ankle hook: '+n+' of 2',
   hint:{touch:'Inside her reach (a Hinge gets you there) or with her off balance, Shove is the Blind-side check. Sweep is the Ankle hook; a barrel or crate behind her helps.',
     keys:'Inside her reach (a Hinge gets you there) or with her off balance, Shove (5) is the Blind-side check. Sweep (4) is the Ankle hook; a barrel or crate behind her helps.'}},
  {key:'sh6',morning:7,title:'Three Touches',teach:[],name:'The bout',line:null,drill:null,need:0,touches:3}];
// a lesson's bout: his first touch ends it (three in the last), and so does hers once she has this many (the lesson is over either way)
const SH_TOUCH={lesson:1,hersLesson:5,hersLast:6};
// her things in the yard: the broom for the stance, the rolling pin for the bouts (her boning knife is sk_pit7.js's)
{const af=S.hooks.arms;S.hooks.arms=(f,k)=>f&&f.pitCast==='Tamm'&&k==='spear'?'crew:broom':f&&f.pitCast==='Tamm'&&k==='club'?'crew:rollingpin':af(f,k);}
ARMS_NAME['crew:broom']='Broom';ARMS_NAME['crew:rollingpin']='Rolling pin';
function shLesson(){const st=act1Stage();return st&&st.sh?SH_LESSONS.find(l=>l.key===st.key):null;}
function shRec(){return shLesson()&&S.act1?S.act1.sh:null;}
function shTamm(){return S.F.find(f=>f.team===1&&!f.npc&&f.pitCast==='Tamm');}
// what he has of the style: the lessons before this one, and this one's once its drill begins
function shKnown(){const SV=S.story;return SV&&SV.flags&&SV.flags.short||null;}
function shApply(K){const k=shKnown();if(!k){K.style=null;K.styleMoves=null;return;}K.style='shorthand';K.styleMoves={...k};}
function shLearn(K,moves){const SV=S.story;SV.flags.short=Object.assign({},SV.flags.short||{});for(const m of moves)SV.flags.short[m]=true;shApply(K);}
// every Act I fight after the first lesson has him in Short Hand (the stage's own flags are what it began with); the lab's Kael has
// none of it
V11.duelStart.push(()=>{const st=act1Stage();if(!st)return;shApply(S.F[0]);});
{const sq=storyQuit;storyQuit=function(){sq.apply(this,arguments);for(const f of S.F){f.style=null;f.styleMoves=null;f.pocketHand=false;}};}
// in a fight in Short Hand his empty side turns a little toward the man in front of him: the shoulder up, the sleeve forward (the
// look's phantom reach, held low; sk_pit2.js clears it each step unless an action sets it, and this comes after)
V11.step.push(()=>{if(!S.story||S.story.step!=='fight')return;for(const f of S.F)if(f.oneArm&&!f.downed&&!f.dead&&shortOn(f)&&!(f.action&&f.action.phantom))f.phantom=Math.max(f.phantom||0,.22);});

// ---------- the drill ----------
// Tamm's turn in a drill: what the lesson has her do (her target is always him)
{const ac=aiChoice;aiChoice=function(i){const L=shLesson(),R=shRec(),T=shTamm(),A=S.F[i],K=S.F[0];
  if(!L||!R||A!==T||!S.story||S.story.step!=='fight')return ac.apply(this,arguments);
  T.tgt=K.idx;if(A.downed)return'getup';if(A.clinch)return'wait';
  const ok=k=>cmdValid(T,K,k),first=ks=>ks.find(ok)||(ok('advance')?'advance':'wait');
  if(R.phase==='drill'){
    if(L.drill==='shove')return first(['shove']);
    if(L.drill==='swing')return first([R.n%2?'slash':'overhead','overhead','slash']);
    if(L.drill==='reach')return first([R.n%2?'thrust':'grab','grab','thrust']);
    if(L.drill==='ladder'||L.drill==='checkhook')return first([R.turns%3===2?'slash':'wait']);}
  return ac.apply(this,arguments);};}
// on auto (the checks, a watched run) he does what the drill asks: the answer it teaches, the strike, the check and the hook
{const ac=aiChoice;aiChoice=function(i){const L=shLesson(),R=shRec(),T=shTamm(),A=S.F[i],K=S.F[0];
  if(!L||!R||A!==K||R.phase!=='drill'||!(S.auto||S.storyAuto)||!S.story||S.story.step!=='fight'||A.clinch||A.downed)return ac.apply(this,arguments);
  setTgt(K,T.idx);const ok=k=>cmdValid(K,T,k);
  // (the stance and the answers: he holds and lets her come)
  if((L.drill==='shove'||L.drill==='swing'||L.drill==='reach')&&ok('wait'))return'wait';
  if(L.drill==='ladder'&&ok('thrust')&&typeof shortInside==='function'&&shortInside(K,T))return'thrust';
  // (and outside her reach he holds, as she tells him, for her swing to Hinge and come inside on)
  if(L.drill==='ladder'&&ok('wait'))return'wait';
  if(L.drill==='checkhook'){const k=!R.got.check?'shove':'sweep';if(ok(k))return k;}
  if((L.drill==='ladder'||L.drill==='checkhook')&&ok('advance'))return'advance';
  return ac.apply(this,arguments);};}
// (the Hinge on her swing in the ladder and check drills too: it is how he gets inside, as she tells him)
{const ar=aiReact;aiReact=function(D,A,kind,T,op){const L=shLesson(),R=shRec();if(L&&R&&R.phase==='drill'&&D===S.F[0]){const ch=reactChoices(D,A);
  if((L.drill==='swing'||L.drill==='ladder'||L.drill==='checkhook')&&ch.includes('hinge'))return'hinge';if(L.drill==='reach'&&ch.includes('toll'))return'toll';}return ar.apply(this,arguments);};}
{const at=aiToll;aiToll=function(D,A){const L=shLesson(),R=shRec();if(L&&R&&R.phase==='drill'&&L.drill==='reach'&&D===S.F[0])return true;return at.apply(this,arguments);};}
// In the ladder drill she shows him the Short ladder, so once he has come inside her reach for it she lets it in: she keeps her guard
// up (a Parry, which it goes under) and it lands. From outside, it is a blow like any other.
function shLadderShown(A,D,kind){const L=shLesson(),R=shRec();return!!L&&!!R&&R.phase==='drill'&&L.drill==='ladder'&&A===S.F[0]&&D===shTamm()&&kind==='thrust'&&
  typeof shortInside==='function'&&shortInside(A,D);}
{const ar=aiReact;aiReact=function(D,A,kind){if(shLadderShown(A,D,kind)&&reactChoices(D,A).includes('parry'))return'parry';return ar.apply(this,arguments);};}
{const ra=resolveAttack;resolveAttack=function(A,D,kind,op,T){const R=shRec();
  if(R&&!R.forcing&&shLadderShown(A,D,kind)){R.forcing=true;try{return resolveForced(A,D,kind,op,T||pickTechnique(A,D,kind),'hit');}finally{R.forcing=false;}}
  return ra.apply(this,arguments);};}
// her turns, counted (the ladder and check drills give him room: she waits on two of three)
V11.turnStart.push(i=>{const R=shRec(),T=shTamm();if(!R||S.F[i]!==T)return;R.turns++;
  // (in a drill she is showing him, not fighting him: her balance is all there each time she comes)
  if(R.phase==='drill'){T.foot=footMaxOf(T);T.broken=null;}});
// a drill going nowhere: three of her turns with nothing counted, and she tells him what to do (again every three after that); at the
// lesson's cap she calls it and goes on to the bout ("Enough. Now properly."). The move is his either way: the drill never holds him.
V11.turnStart.push(i=>{const L=shLesson(),R=shRec(),T=shTamm();if(!L||!R||S.F[i]!==T||R.phase!=='drill'||R.drillDone)return;
  R.since=(R.since||0)+1;if(R.since>=3&&(R.since-3)%3===0&&L.coach)R.coach={text:L.coach,t0:S.t};
  if(L.cap&&R.turns>=L.cap){R.drillDone=true;R.capped=true;}});
// what counts in a drill: his balance kept through a shove, a Hinge, a toll, a Short ladder that lands, a check and a hook
function shCount(what){const L=shLesson(),R=shRec();if(!L||!R||R.phase!=='drill')return;
  if(L.drill==='checkhook'){if(R.got[what])return;R.got[what]=true;}
  R.n++;R.since=0;R.coach=null;R.flash={t0:S.t,what};if(R.n>=L.need)R.drillDone=true;}
{const sh=S.hooks.short;S.hooks.short=(ev,d)=>{if(sh)sh(ev,d);const L=shLesson(),K=S.F[0];if(!L||!d)return;
  if(ev==='hinge'&&L.drill==='swing'&&d.D===K)shCount('hinge');
  if(ev==='toll'&&L.drill==='reach'&&d.D===K)shCount('toll');
  if(ev==='ladder'&&L.drill==='ladder'&&d.A===K&&d.res&&(d.res.out==='hit'||d.res.out==='crit'))shCount('ladder');
  if((ev==='check'||ev==='hook')&&L.drill==='checkhook'&&d.A===K)shCount(ev);};}
// (in the stance drill she pushes to teach, not to floor him: her shoves are at -5)
{const sm=shoveMods;shoveMods=function(A,D){const c=sm.apply(this,arguments),L=shLesson(),R=shRec();
  if(L&&R&&R.phase==='drill'&&L.drill==='shove'&&A===shTamm()){c.mods=c.mods.concat([['a lesson',-5]]);c.bonus-=5;}return c;};}
// the stance drill: each shove of hers that leaves him on his feet and not Broken
V11.exchangeEnd.push(last=>{const L=shLesson(),R=shRec(),K=S.F[0];if(!L||!R||R.phase!=='drill'||L.drill!=='shove'||!last)return;
  if(last.A===shTamm()&&last.cmd==='shove'&&!last._stance){if(!K.downed&&!K.broken)shCount('stance');else R.flash={t0:S.t,what:'again'};}});
// (a shove he holds leaves her off balance and gives him a window on her; taken, the exchange ends on his move and not on her shove,
// so the hold is counted as the window opens)
{const so=startOpening;startOpening=function(ex,f){const L=shLesson(),R=shRec(),K=S.F[0];
  if(L&&R&&R.phase==='drill'&&L.drill==='shove'&&ex&&!ex._stance&&ex.A===shTamm()&&ex.cmd==='shove'&&f===K&&!K.downed&&!K.broken){ex._stance=true;shCount('stance');}
  return so.apply(this,arguments);};}

// ---------- the bout ----------
// a hit is a touch: no damage, no knockdown but a sweep's, and the count. His touches end it (one in a lesson, three at the end);
// hers are counted too, and a man Broken or put down gets up again
function shBout(){const R=shRec();return!!R&&R.phase==='bout';}
{const ra=resolveAttack;resolveAttack=function(A,D,kind){const r=ra.apply(this,arguments),R=shRec();
  if(R&&(r.out==='hit'||r.out==='crit')&&S.story&&S.story.step==='fight'){
    const glance=r.glancing||(D.react==='hinge');
    r.dmg=0;if(kind!=='sweep')r.kd=false;if(r.tech&&r.tech.fin)r.tech={...r.tech,fin:null};
    if(R.phase==='bout'&&!glance){if(A===S.F[0])R.his++;else if(A===shTamm())R.hers++;R.touch={t0:S.t,by:A===S.F[0]?'his':'hers'};}}
  return r;};}
// (nothing else hurts in the yard either: a fall, a shove into a barrel)
V11.step.push(()=>{const R=shRec();if(!R)return;for(const f of S.F)if(!f.npc&&f.hp<f.maxHp)f.hp=f.maxHp;});
// A lesson is not a fight: a touch draws no blood and leaves no mark and no wound (nobody limps out of the yard), the popup of a
// touch reads Touch where a fight's reads its damage, the toll stops at the wrist without cutting it, and nobody loses the knife: she
// shows him the disarm and lets go (without it Short Hand is gone, and so is any drill). If the knife is somehow out of his hand at his
// turn, it is back in it.
{const bl=bleed;bleed=function(){if(shRec())return;return bl.apply(this,arguments);};}
{const sn=stain;stain=function(){if(shRec())return;return sn.apply(this,arguments);};}
{const am=addMark;addMark=function(){if(shRec())return null;return am.apply(this,arguments);};}
{const aw=addWound;addWound=function(){if(shRec())return false;return aw.apply(this,arguments);};}
V11.step.push(()=>{if(!shRec())return;for(const f of S.F){const w=f.wounds;if(w&&(w.head||w.arm||w.leg||w.body))f.wounds={head:0,arm:0,leg:0,body:0};}});
{const pu=popup;popup=function(f,text){if(shRec()&&String(text)==='0'){const a=[...arguments];a[1]='Touch';return pu.apply(this,a);}return pu.apply(this,arguments);};}
{const td=tryDisarm;tryDisarm=function(A,D,src,fa){if(!(shRec()&&D===S.F[0]))return td.apply(this,arguments);
  const r=rollVs(disarmMods(A,D,src),{kind:'disarm',src});if(r.ok){r.ok=false;r.lesson=true;}return r;};}
{const sc=shortCutHand;shortCutHand=function(A,D,seed,fa){if(!shRec())return sc.apply(this,arguments);
  const h=A.p[HAF];for(const i of [HAF,ELF,TIP]){const q=A.p[i];q.px+=fa*120*DT;}
  flash(h,16,'#ffe3b0',A.dep);popup(A,'Touch','#ffffff','the wrist',22);S.hooks.sound('hit',2);knockBalance(A,SHORT_HAND.toll.pips,D);return 0;};}
V11.turnStart.push(i=>{const K=S.F[0];if(!shRec()||S.F[i]!==K||K.weaponKey==='dagger'||K.downed||K.dead)return;
  const j=S.items.findIndex(it=>it.key==='dagger'&&it.owner===K.idx);if(j>=0)S.items.splice(j,1);K.setWeapon('dagger');shApply(K);popup(K,'The knife','#9fd8d0','back in his hand',18,-40);});

// ---------- the flow of a lesson ----------
// drill, then (after a beat) the bout; the bout ends on his touches
{const stt=startTurn;startTurn=function(i){const L=shLesson(),R=shRec();
  if(L&&R&&S.story&&S.story.step==='fight'&&!R.cutting){
    if(R.phase==='drill'&&R.drillDone){R.cutting=true;shToBout();return;}
    if(R.phase==='bout'&&R.his>=(L.touches||SH_TOUCH.lesson)){R.cutting=true;R.done=true;for(const f of S.F)f.intent=null;storyCleared();return;}
    // (and hers: five in a lesson, six in the last bout; the lesson is over all the same)
    if(R.phase==='bout'&&R.hers>=(L.touches?SH_TOUCH.hersLast:SH_TOUCH.hersLesson)){R.cutting=true;R.done=true;R.lost=true;for(const f of S.F)f.intent=null;storyCleared();return;}}
  return stt.apply(this,arguments);};}
function shToBout(){const L=shLesson(),R=shRec(),K=S.F[0],T=shTamm();const g=S.game;g.phase='cut';g.ex=null;g.aiAt=null;for(const f of S.F)f.intent=null;S.hooks.status();
  cutStart(L.key+':bout',(function*(){yield* wait(.5);
    for(const f of [K,T])endClinch(f);yield* riseUp([K,T]);for(const f of [K,T]){f.broken=null;f.foot=footMaxOf(f);}
    yield* speak('Tamm',R.n>=L.need&&!R.capped?L.praise||'Good.':'Enough. Now properly.',{dur:2.2});
    // the broom goes against the wall: the rolling pin
    // (the body is not rebuilt for it: a rebuild stands her up anew in one frame and her hands jump)
    if(T.weaponKey!=='club')T.setWeapon('club');
    // (to their marks, each staying on the side of the other he is on: nobody walks through anybody)
    const sx=clamp((K.station+T.station)/2-75,240,560),kl=K.station<=T.station,kx=kl?sx:sx+150,tx=kl?sx+150:sx;
    yield* all(goTo(K,kx,104,90),goTo(T,tx,104,70));K.facing=kl?1:-1;T.facing=-K.facing;
    yield* speak('Tamm',L.key==='sh6'?'Three touches.':'First touch.',{dur:1.6});
    R.phase='bout';R.his=0;R.hers=0;R.cutting=false;for(const f of [K,T]){f.ready=Math.round(actionCost(f,'slash')*.5);f.intent=null;}})(),
    {then:()=>{S.game.phase='input';startTurn(nextActor());}});}

// ---------- the stages ----------
// the yard's barrels and crates are fixed props: a man can be driven into one or go over it backwards (the painter draws them)
function shYardProps(){const Y=ACT1_PLACES.yard;S.props=S.props.filter(p=>!p.painted);
  for(const B of Y.barrels){const P=addProp('barrel',B.x,B.d,1,{painted:true,fixed:true});P.hp=99;}
  for(const C of Y.crates){const P=addProp('crate',C.x,C.d,1,{painted:true,fixed:true});P.hp=99;}}
function shStage(L,i){const next=SH_LESSONS[i+1];
  return{key:L.key,act:1,num:L.num||'',title:L.title,sub:L.sub||'The Sump’s yard',arena:'yard',next:next?next.key:null,weapon:'dagger',wear:'kit',spare:true,sh:true,
    cardDur:L.num?undefined:2,
    // what he knows of the style when a chapter starts here
    flagsOut:{short:Object.fromEntries(SH_LESSONS.slice(0,i+1).flatMap(l=>l.teach).map(m=>[m,true]))},
    foes:[{name:'Tamm',cast:'Tamm',seed:7311,weapon:L.drillWeapon||'club',skill:5,temper:'keeper',hp:120,human:true}],
    spawn:[[330,104],[480,104,1]],
    setup(st){const K=hero(),A=act1State(),T=shTamm();S.fade=1;A.night=false;A.dusk=false;A.morning=true;A.stairGate=0;A.gate=0;A.bucket=null;A.night8=null;errandHome(A);
      A.sh={phase:L.drill?'drill':'bout',n:0,need:L.need,turns:0,got:{},his:0,hers:0,flash:null,touch:null,drillDone:false,cutting:false,done:false};
      shYardProps();
      T.pocketHand=L.key==='sh6';T.style='shorthand';T.styleMoves=Object.fromEntries(SH_MOVES.map(m=>[m,true]));
      standEasy(K);K.station=330;K.lane=K.dep=K.stepDep=104;K.facing=1;K.build();T.station=480;T.lane=T.dep=T.stepDep=104;T.facing=-1;T.build();
      for(const f of S.F)if(!f.npc)f.ready=Math.round(actionCost(f,'slash')*.5);},
    *intro(st){const K=hero(),T=shTamm(),A=act1State();letter(1);camTo(420,700,0);yield* fadeTo(0,1.2);
      if(L.line)yield* speak('Tamm',L.line,{dur:Math.max(2.6,1.2+L.line.length*.05)});
      // the lesson's move is his from now (the stance makes the style his)
      if(L.teach.length){shLearn(K,L.teach);popup(K,L.name,'#9fd8d0',L.key==='sh1'?'Short Hand':'learned',22,-50);yield* wait(1);}
      if(L.key==='sh6'){T.pocketHand=true;yield* speak('Tamm','Three touches.',{dur:1.8});}
      letter(0);},
    *outro(st){const K=hero(),T=shTamm(),A=act1State(),R=A.sh||{};
      // the lesson is over: up off the ground in their own time, and they stand easy to talk (her pin down, his knife off her)
      for(const f of [K,T])endClinch(f);yield* riseUp([K,T]);standEasy(K);standEasy(T);
      yield* wait(.6);
      // (a lesson's bout she took: she says so, and the morning is over all the same)
      if(R.lost&&L.key!=='sh6')yield* speak('Tamm','Again tomorrow.',{dur:2});
      // after the first lesson: the styles screen
      if(L.key==='sh1'){A.styles={open:true,t0:S.t,first:true};yield* until(()=>!A.styles.open,1e6);}
      if(L.key==='sh6'){
        if(R.lost)yield* speak('Tamm','Enough. You get up every time. That’ll do.',{dur:3});
        yield* speak('Tamm','Door’s yours, Friday nights. Don’t kill anyone in my bar.',{dur:3.2});
        yield* speak(HERO_NAME,'And outside it?',{dur:1.8});
        yield* speak('Tamm','Outside it, don’t let me hear about it.',{dur:2.8});
        yield* fadeTo(1,1.8);S.story.ended='act1';return;}
      yield* fadeTo(1,1.1);}};}
SH_LESSONS.forEach((L,i)=>STAGES.push(shStage(L,i)));
// a lesson's card names the morning: MORNING 2 · The Hinge (the first is the scene's own card)
{const ss=storyStage;storyStage=function(key){ss(key);const L=shLesson();if(L&&S.card&&!L.num){S.card.kick='MORNING '+L.morning;}};}
// the screens: open and close (the page draws them; on auto, closed after a look)
function act1StylesClose(){const A=S.act1;if(A&&A.styles)A.styles.open=false;}
V11.step.push(()=>{const A=S.act1;if(!A||!A.styles||!A.styles.open||!(S.storyAuto||S.auto))return;if(S.t-A.styles.t0>2.4)A.styles.open=false;});
// the chain: the yard at night goes on into the first morning
{const n8=STAGES[stageIx('night')];if(n8&&!n8.next)n8.next='sh1';}
// ===== ACT I, SCENE 9 END =====
