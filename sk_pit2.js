// ===== ACT I, SCENES 3 AND 4 START =====
// Scene 3, Lost Property: Tamm's crate of thirty years of what her customers left behind, and what he puts on from it. The gear screen
// has five slots (body, coat, hands, feet, belt) and the right arm's, which is empty: Missing. Scene 4, A Man's Pace: the yard, and
// the movement tutorial. He walks and jogs about the floor and its depth, lurching until he finds his weight; his one hand holds the
// bucket or nothing, so a latched gate means setting the bucket down first; the ladder to the roof loft needs two hands; Dob sits on
// the yard wall and says what he sees. Tamm gives him the job at the start: fill the bucket at the pump and take it up to Dob's birds
// in the loft.

// ---------- what he wears in the Pit ----------
// The crate, slot by slot. The oilcloth coat turns a knife a little (cut: what a blade's blow takes off him is that much less). The
// choice rides in the story's flags (S.story.flags.kit), so it goes with him from scene to scene, and a chapter picked from the menu
// after scene 3 starts in the first of each slot.
const KIT={
  body:[{id:'shirt',name:'Work shirt',what:'Collarless linen gone grey.'},
    {id:'jersey',name:'Knitted jersey',what:'Dark wool, darned at the elbow.'},
    {id:'under',name:'Undershirt',what:'Sleeveless. The scars and the dressing show.'}],
  coat:[{id:'oilcloth',scarf:true,name:'Oilcloth coat and scarf',what:'An orc dockhand’s coat, two sizes too big, and a rust wool scarf. Turns a knife a little.',cut:1},
    {id:'canvas',scarf:true,name:'Canvas jacket and scarf',what:'Short, stiff canvas and the rust scarf.'},
    {id:null,scarf:true,name:'Scarf',what:'The rust scarf, and nothing else over it.'},
    {id:null,scarf:false,name:'Nothing',what:'Nothing over it.'}],
  hands:[{id:null,name:'Nothing',what:'A bare hand.'},{id:'glove',name:'Fingerless glove',what:'Old leather, for the left hand.'},{id:'wrap',name:'Wrist wrap',what:'A strip of linen round the wrist.'}],
  feet:[{id:'boots',name:'Work boots',what:'They nearly fit.'},{id:'sandals',name:'Rope sandals',what:'Light. They slap on the steps.'},{id:null,name:'Barefoot',what:'The yard is cold.'}],
  belt:[{id:'belt',name:'Belt and sheath',what:'The hip dagger rides at his side.'},{id:'rope',name:'Rope belt',what:'The dagger goes through the knot.'}]};
const KIT_SLOTS=['body','coat','hands','feet','belt'],KIT_NAMES={body:'Body',coat:'Coat',hands:'Hands',feet:'Feet',belt:'Belt'};
function kitDefault(){return{body:0,coat:0,hands:0,feet:0,belt:0};}
function kitOf(){const F=S.story&&S.story.flags;return Object.assign(kitDefault(),F&&F.kit||{});}
function kitItem(slot,i){const L=KIT[slot];return L[((i%L.length)+L.length)%L.length];}
// what the look draws for a kit (pinned: Tamm has pinned the empty sleeve up)
function kitWear(k,o={}){const b=kitItem('body',k.body),c=kitItem('coat',k.coat),h=kitItem('hands',k.hands),f=kitItem('feet',k.feet),bl=kitItem('belt',k.belt);
  return{top:b.id,coat:c.id,scarf:c.scarf?'rust':null,hands:h.id,feet:f.id||'bare',belt:bl.id,bandage:b.id==='under'&&!c.id,pinned:o.pinned!==false};}
// a sleeve on the right to pin up
function kitSleeve(w){return!!w&&(!!w.coat||w.top==='shirt'||w.top==='jersey');}
// the coat turns a knife a little: a blade's blow takes that much less off him
const KIT_CUT={oilcloth:1};
{const ra=resolveAttack;resolveAttack=function(A,D,kind,op,T){const r=ra(A,D,kind,op,T);
  if(r&&r.dmg>0&&D&&D===S.F[0]&&act1On()&&D.wear&&KIT_CUT[D.wear.coat]&&A&&A.wp&&!A.wp.unarmed&&A.weaponKey!=='club'){r.dmg=Math.max(1,r.dmg-KIT_CUT[D.wear.coat]);r.cutBy=D.wear.coat;}
  return r;};}
// an Act I stage that says wear:'kit' dresses him from the crate's choice
{const sd=storyDuel;storyDuel=function(st){sd(st);if(st&&st.act&&st.wear==='kit'){const K=hero();if(K)K.wear=kitWear(kitOf());}};}
V11.duelStart.push(()=>{const st=act1Stage();if(st&&st.wear==='kit'){const K=S.F[0];if(K)K.wear=kitWear(kitOf());}});

// ---------- the gear screen ----------
// Opened by a scene (S.act1.gear = {open, kit, wear}); the page shows it and calls these. On auto the crate's first choices are taken.
function act1GearOpen(kit,o={}){const A=act1State();A.gear={open:true,kit:Object.assign({},kit||kitOf()),pinned:o.pinned!==false,t0:S.t};A.gear.wear=kitWear(A.gear.kit,{pinned:A.gear.pinned});
  S.hooks.act1('gear',A.gear);return A.gear;}
function act1GearSet(slot,i){const G=S.act1&&S.act1.gear;if(!G||!G.open||!KIT[slot])return;const L=KIT[slot].length;G.kit[slot]=((i%L)+L)%L;G.wear=kitWear(G.kit,{pinned:G.pinned});}
function act1GearStep(slot,dir){const G=S.act1&&S.act1.gear;if(G)act1GearSet(slot,(G.kit[slot]||0)+dir);}
function act1GearDone(){const G=S.act1&&S.act1.gear;if(!G||!G.open)return;G.open=false;if(S.story)S.story.flags.kit=Object.assign({},G.kit);S.hooks.act1('geardone',G);}
V11.step.push(()=>{const G=S.act1&&S.act1.gear;if(G&&G.open&&(S.storyAuto||S.auto)&&S.t-G.t0>1.4)act1GearDone();});
S.hooks.act1=()=>{};

// ---------- his weight, one arm short ----------
// For the first stretch of walking in the yard he lurches (f.lurch, 1 to 0, worn off by the ground he covers): he leans and pitches
// and his arm goes out for balance, then he finds where the floor is.
{const eb=easyBody;easyBody=function(f){const B=eb(f);if(f.lurch>0&&gaitOf(f)){const t=S.t,l=f.lurch;B.lean+=(Math.sin(t*6.1)*.16+Math.sin(t*2.3+1)*.08)*l;B.crouch-=.035*l*Math.abs(Math.sin(t*3.05));}return B;};}
{const ea=easyArm;easyArm=function(f){const R=ea(f);if(f.lurch>0&&gaitOf(f)&&R.hand&&R.hand.sh){const a=f.arm,l=f.lurch;R.hand.sh=[R.hand.sh[0]+Math.sin(S.t*6.1+.8)*.32*a*l,R.hand.sh[1]-.2*a*l];}return R;};}
V11.step.push(()=>{const K=S.F[0];if(!K||!(K.lurch>0))return;if(K.cutWalk&&K.walkV){const v=Math.hypot(K.walkV.x,K.walkV.z);K.lurch=Math.max(0,K.lurch-v*DT/360);}});

// ---------- the crate in Tamm's arms ----------
// She carries it in against her stomach, her hands on its sides near the bottom, leaning back a little under it, and squats to set it
// down. While she has it (A.crate.held: her) A.crate.at() says where it is: the middle of its bottom edge, in her own depth, and how far
// up its sides her hands are (grip). The page draws it over her body and under her near arm. Set down, it is a thing on the floor
// again (A.crate.x, d).
// (CRATE_GRIP: her hands' hold as she carries it, and as it touches the floor; CRATE_STAND: she stands this far behind where it is to
// go down)
const CRATE_GRIP=[6,15],CRATE_STAND=48;
function crateCarried(T){const c=T.p[CHE],a=T.arm;return{x:c.x+T.facing*.5*a,y:c.y+.74*a+CRATE_GRIP[0],grip:CRATE_GRIP[0]};}
function crateArm(T){const at=()=>S.act1.crate.at();
  return{hand:{fn:()=>{const b=at();return{x:b.x+T.facing*2,y:b.y-b.grip};}},wAng:1.3,off:{fn:()=>{const b=at();return{x:b.x-T.facing*3,y:b.y-b.grip-1};}},tilt:.1};}
function crateBody(T){const B=easyBody(T);B.lean-=.08;return B;}
function crateTake(T){const C=act1State().crate;C.on=true;C.held=T;C.at=()=>crateCarried(T);T.guardBody=()=>crateBody(T);T.guardArm=()=>crateArm(T);}
// setting it down at x: she brings her feet together and squats, and it goes down with her hands to the floor (a beat behind her, as
// her arms take it down); she lets go, and stands. (Feet together, neither shin lies low: the cast's shoes are drawn flat on the floor
// only under a shin within about 54 degrees of upright, and a foot further back would be drawn toes down through the floor.)
function* crateSetDown(T,x,o={}){const C=act1State().crate,dur=o.dur??1.3,t0=S.t,from=crateCarried(T),leg=T.leg,lag=.4;
  C.at=()=>{const u=sstep((S.t-t0-lag)/(dur-lag));return{x:lerp(from.x,x,u),y:lerp(from.y,GB,u),grip:lerp(CRATE_GRIP[0],CRATE_GRIP[1],u)};};
  const feet={stF:.13*leg,stB:.13*leg,th:.04},low={px:T.station,pz:T.lane,crouch:o.crouch??.55,lean:o.lean??.8,...feet},off=dur+.25,end=off+.8;
  T.action={t0,end,body:[{t:0,v:()=>crateBody(T)},{t:.3,v:()=>({...crateBody(T),...feet})},{t:dur-.25,v:low,e:sstep},{t:off,v:low},{t:end,v:()=>easyBody(T),e:sstep}],
    arm:[{t:0,v:crateArm(T)},{t:off,v:crateArm(T)},{t:end,v:easyArm(T),e:sstep}]};
  yield* wait(off);
  // let go: it is drawn with her, under her near arm, until her hands are up off it; then it is a thing on the floor, just in front of her
  // (standing easy is what she does once the bend is done, even if it ends a frame before this script does)
  const b=C.at();C.at=()=>({x:b.x,y:GB,grip:CRATE_GRIP[1]});standEasy(T);
  yield* wait(end-off);T.action=null;
  const d=T.dep-.05;C.held=null;C.x=b.x+(T.dep-d)*PSX;C.d=d;}

// ===== SCENE 3: LOST PROPERTY =====
// The back room. His clothes are past saving. Tamm carries in a crate of everything her customers have left behind over thirty years.
// Nothing is cut for an elf. He settles on what is warm. Tamm pins the empty right sleeve up with a pin from her apron. In the cracked
// mirror over the washbasin there is no gold on him anywhere.
STAGES.push({key:'lostprop',act:1,num:'3',title:'Lost Property',sub:'The Sump’s back room',arena:'backroom',next:'yard1',weapon:'fists',
  wear:{top:'bare',bandage:true,feet:'bare'},foes:[],spawn:[[ACT1_PLACES.backroom.cot.x1-20,140]],
  setup(st){const K=hero(),R=ACT1_PLACES.backroom,A=act1State();S.fade=1;standEasy(K);K.station=R.cot.x1-20;K.lane=K.dep=K.stepDep=140;K.facing=1;K.build();
    // (the soup bowl gone from the stool, the plates back in the hilt)
    A.crate={x:R.crate.x,d:R.crate.d,on:false,held:null,at:null};A.gear=null;A.mirrorSaid=false;A.hilt=null;A.suit=true;A.soup=null;A.plates=null;
    // (Tamm, out of sight past the door, with the crate already in her arms)
    const T=act1Npc('Tamm',{x:R.door.x+30,dep:R.door.d,facing:-1});T.hidden=true;A.tamm=T;crateTake(T);},
  *intro(st){const K=hero(),R=ACT1_PLACES.backroom,A=act1State(),T=A.tamm;
    letter(1);camTo(470,760,0);
    yield* fadeTo(0,1.2);
    // Tamm carries the crate in from the door in her arms and sets it down
    T.hidden=false;
    yield* goTo(T,R.crate.x+CRATE_STAND,R.crate.d+.05,44);T.facing=-1;
    yield* crateSetDown(T,R.crate.x);
    yield* speak('Tamm','Thirty years of drunks leave things behind. Take what fits.',{dur:3});
    // he goes through it
    yield* goTo(K,R.crate.x-34,R.crate.d+2,60);K.facing=1;K.action=stoopAction(K,2.6,{crouch:.78,lean:.55});yield* wait(2.6);K.action=null;
    yield* speak(HERO_NAME,'None of it fits.',{dur:2});
    yield* speak('Tamm','Then take what’s warm.',{dur:2.2});
    // what he takes: the gear screen (the scene waits for it)
    letter(0);const G=act1GearOpen(kitOf(),{pinned:false});
    yield* until(()=>!G.open,1e6);
    letter(1);
    // he dresses (a moment of black)
    yield* fadeTo(1,.45);K.wear=kitWear(G.kit,{pinned:false});yield* wait(.25);yield* fadeTo(0,.6);
    // Tamm pins the empty right sleeve up with a pin from her apron
    if(kitSleeve(K.wear)){yield* goTo(T,K.station+K.facing*30,K.lane-4,46);T.facing=-K.facing;
      T.action=stoopAction(T,1.4,{crouch:.9,lean:.3});yield* wait(.8);K.wear.pinned=true;S.hooks.sound('pin',1);yield* wait(.6);T.action=null;}
    // and goes back to her bar
    yield* goTo(T,R.door.x+30,R.door.d,70);T.hidden=true;
    letter(0);},
  explore(st){const R=ACT1_PLACES.backroom,A=act1State();
    return{area:'backroom',bounds:{x0:R.floor.x0,x1:R.floor.x1,z0:R.floor.z0,z1:R.floor.z1},view:760,
      goal:{text:'The mirror over the washbasin',done:()=>!!A.mirrorSaid},
      spots:[
        {id:'mirror',label:'The mirror',verb:'Look',x:R.basin.x,z:R.floor.z1,at:{x:R.mirror.x,y:GB-R.mirror.y,d:R.far},key:true,
          *run(){A.mirror={t0:S.t};yield* wait(.6);yield* think('No gold. Not one line.',{dur:2.6});A.mirrorSaid=true;}},
        {id:'crate',label:'The crate',verb:'Change',x:R.crate.x-30,z:R.crate.d+4,at:{x:R.crate.x,y:GB-24,d:R.crate.d},
          *run(){const K=hero();K.action=stoopAction(K,1,{crouch:.8,lean:.5});yield* wait(.6);const G=act1GearOpen(kitOf(),{pinned:true});yield* until(()=>!G.open,1e6);K.action=null;
            yield* fadeTo(1,.4);K.wear=kitWear(G.kit);yield* wait(.2);yield* fadeTo(0,.5);}}]};},
  *outro(st){yield* fadeTo(1,1.4);}});

// ===== SCENE 4: A MAN'S PACE =====
// The Sump's yard. One arm has moved his centre of weight, and he lurches before he finds it. When he tries to run the way an elf
// runs, his legs give him a jog. Dob sits on the yard wall and supervises. At the ladder to the roof loft, Ilyas reaches with a hand
// he does not have. The errand that walks him through it: water for Dob's birds on the roof. The bucket by the pump, filled at the
// pump (he sets it under the spout and works the handle with his one hand), the ladder (two hands), the little gate at the foot of
// the stairs round the side (his hand full: the bucket set down first), and up the stairs.
ACT1_PLACES.yard.stairGate={x:126,d:196,w:34};
// (Dob perches on the crate by the wall: no one stands deeper than DEP_MAX, so the wall itself is out of reach. The crate's top is
// ground at its own depth, behind where he walks: the yard's floor ends short of it)
ACT1_PLACES.yard.dobSeat={x:690,d:170,crate:true};ACT1_PLACES.yard.floor.z1=164;
{const Cr=ACT1_PLACES.yard.crates[1];ARENAS.yard.ground=(x,d)=>d!=null&&d>=Cr.d-4&&d<=Cr.d+6&&Math.abs(x-Cr.x)<=Cr.w/2?GB-Cr.h:GB;}
// the goal as it stands: what he has done of the errand and what is in his hand
function yardGoal(){const A=S.act1,YD=A&&A.yard;if(!YD)return'';const H=S.ex&&S.ex.hand,has=id=>!!H&&H.id===id;
  if(!YD.filled)return has('bucket')?'Fill the bucket at the pump':'Take the bucket';
  if(!has('water'))return'Take up the bucket of water';
  if(!YD.ladderTried)return'Take the water up to Dob’s birds in the loft';
  if(A.stairGate<1)return'Round the side: through the gate to the stairs';
  return'Up the stairs with the water';}
// the hint under it: how he is walked at first, then how each part of the job is done ({touch, keys}: a finger, or keys)
function yardHint(){const A=S.act1,YD=A&&A.yard;if(!YD)return'';const H=S.ex&&S.ex.hand,has=id=>!!H&&H.id===id,h=(touch,keys)=>({touch,keys});
  if(!YD.step&&YD.walked<160)return h('Tap the ground to walk there. Tap twice to jog. Up the screen is farther away.','Arrows or WASD walk, Shift jogs. Up is farther away. E uses, Q sets down.');
  if(!YD.filled)return has('bucket')?h('Walk to the pump, then tap Fill.','Walk to the pump and press E to fill it.')
    :h('The bucket is by the pump. Walk to it, then tap Take.','The bucket is by the pump. Walk to it and press E to take it.');
  if(!has('water'))return YD.ladderTried&&A.stairGate<1?h('Walk to the gate, then tap Open. Then take the bucket again.','Walk to the gate and press E to open it. Then take the bucket again.')
    :h('Take the bucket again: walk to it, then tap Take.','Take the bucket again: walk to it and press E.');
  if(!YD.ladderTried)return h('The loft is up the ladder by the back wall.','The loft is up the ladder by the back wall.');
  if(A.stairGate<1)return h('The gate needs a free hand. Tap Set down to put the bucket down first.','The gate needs a free hand. Press Q to put the bucket down first.');
  return h('Walk to the stairs, then tap Go up.','Walk to the stairs and press E to go up.');}
STAGES.push({key:'yard1',act:1,num:'4',title:'A Man’s Pace',sub:'The Sump’s yard',arena:'yard',next:null,weapon:'fists',wear:'kit',foes:[],
  spawn:[[ACT1_PLACES.yard.step.x+20,ACT1_PLACES.yard.floor.z1-4]],
  setup(st){const K=hero(),Y=ACT1_PLACES.yard,A=act1State();S.fade=1;standEasy(K);K.station=Y.step.x+20;K.lane=K.dep=K.stepDep=Y.floor.z1-4;K.facing=1;K.build();K.lurch=1;
    A.yard={step:0,walked:0,ladderTried:false,drunk:false,jogNote:false,filled:false,done:false};A.stairGate=0;A.gate=0;
    A.bucket={x:Y.pump.x-30,d:Y.pump.d-16,full:false,where:'floor'};A.pumping=null;
    const D=act1Npc('Dob',{x:Y.dobSeat.x,dep:Y.dobSeat.d,facing:-1});D.guardBody=()=>sitBody(D,4);D.guardArm=()=>sitArm(D);A.dob=D;
    const T=act1Npc('Tamm',{x:Y.door.x+8,dep:Y.door.d-10,facing:1});A.tamm=T;},
  *intro(st){const A=act1State(),T=A.tamm,D=A.dob,K=hero(),Y=ACT1_PLACES.yard;
    letter(1);camTo(Y.step.x+200,760,0);
    yield* fadeTo(0,1.2);yield* wait(.8);
    // Tamm, at the back door, gives him the yard's job: water for Dob's birds, up in the roof loft. Dob watches from his crate
    faceToward(K,T.station);yield* wait(.3);
    yield* speak('Tamm','Up and walking. Good. You can earn your soup.',{dur:2.6});
    yield* speak('Tamm','Dob’s birds want water. Fill the bucket at the pump and take it up to the loft.',{dur:4});
    faceToward(K,D.station);yield* wait(.2);
    yield* speak('Dob','I’d do it myself, but I’m watching.',{dur:2.4});
    // Tamm goes back in to her kitchen; the yard is his
    yield* goTo(T,Y.door.x,Y.door.d-2,40);T.hidden=true;
    letter(0);},
  explore(st){const Y=ACT1_PLACES.yard,A=act1State(),YD=A.yard,G=Y.stairGate;
    const hand=()=>S.ex&&S.ex.hand,holds=id=>!!hand()&&hand().id===id;
    return{area:'yard',bounds:{x0:Y.floor.x0,x1:Y.floor.x1,z0:Y.floor.z0,z1:Y.floor.z1},view:760,hand:null,
      goal:{text:yardGoal,done:()=>YD.done,hint:yardHint},
      spots:[
        {id:'bucket',label:'The bucket',verb:'Take',x:A.bucket.x,z:A.bucket.d,at:{x:A.bucket.x,y:GB-10,d:A.bucket.d},take:{id:'bucket',name:'Bucket'},when:()=>A.bucket.where==='floor',
          *run(){A.bucket.where='hand';YD.step=Math.max(YD.step,1);}},
        {id:'pump',label:'The pump',verb:'Fill',x:Y.pump.x-26,z:Y.pump.d-6,at:{x:Y.pump.x,y:GB-44,d:Y.pump.d},
          needs:()=>holds('bucket')?null:holds('water')?'The bucket is full':'Bring the bucket',
          *run(){const K=hero();
            // the bucket under the spout, the handle worked with his one hand, three strokes, and the bucket up again
            S.ex.hand=null;A.bucket.where='spout';K.action=stoopAction(K,.8,{crouch:.86,lean:.4});yield* wait(.8);
            A.pumping={t0:S.t};for(let i=0;i<3;i++){K.action=pumpAction(K);S.hooks.sound('pump',1);yield* wait(.7);A.bucket.fill=(i+1)/3;}
            A.pumping=null;K.action=stoopAction(K,.8,{crouch:.86,lean:.4});yield* wait(.8);K.action=null;
            A.bucket.where='hand';A.bucket.full=true;S.ex.hand={id:'water',name:'Bucket of water'};YD.filled=true;YD.step=Math.max(YD.step,2);}},
        {id:'ladder',label:'The ladder',verb:'Climb',x:Y.ladder.x+4,z:Y.floor.z1,at:{x:Y.ladder.x,y:GB-70,d:Y.ladder.d},needs:'two',
          *refused(){const K=hero();
            // he reaches up for the rung with the hand he has (when it is free), and for the next with the hand he has not
            K.facing=1;K.action=reachAction(K,1.8,{holding:!!S.ex.hand});yield* wait(1.9);K.action=null;
            if(!YD.ladderTried){YD.ladderTried=true;YD.step=Math.max(YD.step,3);yield* wait(.3);
              yield* speak('Dob','Stairs are round the side. Takes longer. Everything does now, I bet.',{dur:3.6});}}},
        {id:'stairgate',label:'The gate',verb:'Open',x:G.x+22,z:Y.floor.z1,at:{x:G.x,y:GB-34,d:G.d},needs:'free',when:()=>YD.ladderTried&&A.stairGate<1,
          *run(){const K=hero();K.action=stoopAction(K,.7,{crouch:.95,lean:.2});const t0=S.t;yield* until(()=>{A.stairGate=sstep(clamp((S.t-t0)/.8,0,1));return A.stairGate>=1;},2);
            S.hooks.sound('gate',1);K.action=null;}},
        {id:'stairs',label:'The stairs',verb:'Go up',x:Y.sidestair.x1+4,z:Y.floor.z1,at:{x:(Y.sidestair.x0+Y.sidestair.x1)/2,y:GB-40,d:Y.sidestair.d},
          when:()=>YD.ladderTried&&A.stairGate>=1,needs:()=>holds('water')?null:'The birds want the water',key:true,
          *run(){YD.done=true;}}],
      exits:[]};},
  *outro(st){const K=hero(),Y=ACT1_PLACES.yard;
    // up the stairs with the bucket
    yield* goTo(K,Y.sidestair.x0+20,Y.floor.z1,60);yield* fadeTo(1,1.4);S.story.ended='act1';}});

// the yard's moments: Dob's first look at his walk, and the jog he gets for a run
V11.step.push(()=>{const st=act1Stage();if(!st||st.key!=='yard1'||!S.ex||!S.ex.on||S.cut)return;const A=S.act1,YD=A&&A.yard,K=S.F[0];if(!YD)return;
  if(K.cutWalk&&K.walkV)YD.walked+=Math.hypot(K.walkV.x,K.walkV.z)*DT;
  if(!YD.drunk&&YD.walked>90&&K.lurch>.3){YD.drunk=true;cutStart('yard:drunk',(function*(){const D=A.dob;D.facing=K.station<D.station?-1:1;
      // (he has stopped where he was: the scene's start halts the walk) he turns to her to answer
      yield* speak('Dob','You walk like a drunk on payday.',{dur:2.6});yield* wait(.2);faceToward(K,D.station);
      yield* speak(HERO_NAME,'I’m still finding where the floor is.',{dur:2.6});})(),{then:()=>{if(exOn())S.game.phase='explore';}});return;}
  if(!YD.jogNote&&(S.ex.run||S.ex.keys.run)&&K.cutWalk){YD.jogNote=true;exNote('A man’s jog. The sprint went with the gilt.');}});
// the pump's handle worked with his one hand: the hand up to the handle and down with it
function pumpAction(f){const a=f.arm;return{t0:S.t,end:.7,body:[{t:0,v:()=>({...easyBody(f),crouch:.9,lean:.22})}],
  arm:[{t:0,v:{hand:{sh:[.62*a,.2*a]},wAng:.3,off:{sh:[0,.9*a]},tilt:0}},{t:.3,v:{hand:{sh:[.6*a,.62*a]},wAng:.9,off:{sh:[0,.9*a]},tilt:.1},e:eOut},{t:.7,v:{hand:{sh:[.62*a,.2*a]},wAng:.3,off:{sh:[0,.9*a]},tilt:0},e:eOut}]};}
// reaching up a ladder: the hand up to a rung over his head and held there (unless it holds something), and then the reach of the
// arm he has not got: the empty side's shoulder comes up and the sleeve swings forward with it (f.phantom, which the look draws)
function reachAction(f,dur,o={}){const a=f.arm,arm=o.holding?[{t:0,v:easyArm(f)},{t:dur,v:easyArm(f)}]:
    [{t:0,v:easyArm(f)},{t:.45,v:{hand:{sh:[.3*a,-.95*a]},wAng:-1.4,off:{sh:[0,.9*a]},tilt:0},e:eOut},{t:dur-.4,v:{hand:{sh:[.32*a,-.9*a]},wAng:-1.4,off:{sh:[0,.9*a]},tilt:0}},{t:dur,v:easyArm(f)}];
  return{t0:S.t,end:dur,phantom:{from:o.holding?.15:.6,to:dur-.35},body:[{t:0,v:()=>easyBody(f)},{t:.4,v:()=>({...easyBody(f),crouch:1,lean:-.06}),e:eOut},{t:dur,v:()=>easyBody(f)}],arm};}
V11.step.push(()=>{for(const f of S.F){const A=f.action,P=A&&A.phantom;if(!P){if(f.phantom)f.phantom=0;continue;}const u=S.t-A.t0;
  f.phantom=sstep(clamp((u-P.from)/.35,0,1))*(1-sstep(clamp((u-P.to)/.3,0,1)));}});
// ===== ACT I, SCENES 3 AND 4 END =====
