// ===== ACT I START =====
// Act I, the Pit: beats 1 and 2, after the user's "Act I, beats 1 and 2". From the night of the fall to the first morning Ilyas can
// hold Tamm's door, about six weeks pass, and he goes from helpless to dangerous again on one arm. The stages carry act:1 and come after
// the fall. In them he is the man the null round left: drained (the scars, no magic, a man's speed: drained() in sk_elf.js), a crew man's
// four pips of balance, one arm, and the hip dagger in his left hand.
// The rig keeps its front arm (the weapon arm: every weapon system works as it always has) and loses its back arm (f.oneArm): the far
// shoulder carries the pinned empty sleeve. Scene 1, minutes after the fall, keeps the fall's own wound (the front arm gone, F.armOff).
// The places are game-side layouts (ACT1_PLACES); the painters in envx/ draw them.

const ACT_NAMES={1:'The Pit'};
// an Act I scene's card says so; the act's first scene shows the act's own card first
{const ss=storyStage;storyStage=function(key){ss(key);const st=S.story&&STAGES[S.story.i];if(!st||!st.act||!S.card)return;
  S.card.kick='ACT '+(['','I','II','III'][st.act]||st.act)+' · SCENE '+st.num;
  if(st.actCard){const pre=Object.assign({dur:3},st.actCard);S.card.pre=pre;S.card.dur+=pre.dur;}};}

// ---------- who he is in Act I ----------
const ACT1_K={weapon:'dagger',skill:4,hp:150,foot:4};
function act1On(){const SV=S.story;return!!SV&&!!STAGES[SV.i]&&STAGES[SV.i].act===1;}
function act1Stage(){return act1On()?STAGES[S.story.i]:null;}
// the stage is set up as the prologue's are, with his Act I weapon, rank and strength
{const sd=storyDuel;storyDuel=function(st){
  if(!st.act)return sd(st);
  const w=STORY_KAEL.weapon,sk=STORY_KAEL.skill,hp=STORY_KAEL.hp;STORY_KAEL.weapon=st.weapon||ACT1_K.weapon;STORY_KAEL.hp=ACT1_K.hp;
  const K0=storyKael();K0.skill=ACT1_K.skill;
  try{sd(st);}finally{STORY_KAEL.weapon=w;STORY_KAEL.skill=sk;STORY_KAEL.hp=hp;}};}
// four pips of balance, a crew man's
{const fm=footMaxOf;footMaxOf=function(f){if(f&&f===S.F[0]&&act1On())return ACT1_K.foot;return fm(f);};}
// every Act I stage: drained, the hip dagger in his hand and no other (st.weapon: 'fists' where he has none), one arm (the stage says
// which), and what he wears in the Pit (st.wear, drawn by the look: nothing of the Noir Gilt suit is left on him after scene 1). The
// tears the prologue put in his clothes went with the clothes.
V11.duelStart.push(()=>{const st=act1Stage();if(!st)return;const K=S.F[0];
  K.drain=1;K.eyeLit=0;K.coatOff=true;K.sidearm=null;K.stow=false;K.arc=null;K.armTear=0;
  K.wear=st.wear?JSON.parse(JSON.stringify(st.wear)):null;K.seared=false;K.rips=[];K.hemTears=[];
  if(st.wound){K.armOff=true;K.oneArm=false;}else{K.armOff=false;K.oneArm=true;}
  K.build();K.foot=footMaxOf(K);S.act1=S.act1||{};});

// his hip dagger with the light gone out of it (the design 'kaeldull' in sk_armsui.js): the same blade, no gilt
{const af=S.hooks.arms;S.hooks.arms=(f,k)=>f&&f.name===HERO_NAME&&!f.npc&&k==='dagger'&&act1On()?'crew:kaeldull':af(f,k);}
ARMS_NAME['crew:kaeldull']='Hip dagger';

// ---------- one arm ----------
// The back arm is gone: its two sticks hold nothing and its points ride at the shoulder, out of every reckoning.
function oneArmFollow(f){const c=f.p[CHE];for(const i of [ELB,HAB]){const q=f.p[i];q.x=c.x;q.y=c.y;q.px=c.px;q.py=c.py;}}
{const bd=Fighter.prototype.build;Fighter.prototype.build=function(){bd.call(this);if(this.oneArm){this.sticks[4][3]=1;this.sticks[5][3]=1;oneArmFollow(this);}};}
V11.step.push(()=>{for(const f of S.F)if(f.oneArm)oneArmFollow(f);});
{const co=collide;collide=function(f,final){co(f,final);if(f.oneArm)oneArmFollow(f);};}
// the fall's own wound (scene 1): the front arm's points ride at the chest as they did once it came away
V11.step.push(()=>{const st=act1Stage();if(!st||!st.wound)return;const K=S.F[0];if(K&&K.armOff){for(const i of [ELF,HAF,TIP]){const q=K.p[i],c=K.p[CHE];q.x=c.x;q.y=c.y;q.px=c.px;q.py=c.py;}}});
{const bd=Fighter.prototype.build;Fighter.prototype.build=function(){bd.call(this);if(this.armOff&&act1On()){this.sticks[2][3]=1;this.sticks[3][3]=1;this.sticks[10][3]=1;}};}
// a new run of the story starts the Pit's own record afresh (what each scene has done: the skillet, the soup, the hilt, the plates)
{const sb=storyBegin;storyBegin=function(key,o){S.act1=null;return sb(key,o);};}
// leaving the story gives him both arms back (the lab's Kael is whole)
{const sq=storyQuit;storyQuit=function(){sq();for(const f of S.F){f.oneArm=false;f.armOff=false;}S.act1=null;};}

// ---------- the people of the Pit ----------
// Tamm Broadhand keeps the Sump; Dob climbs the Pit's walls for scrap and keeps pigeons on her roof. In a scene they are figures of
// the cast (f.pitCast names their look in CastLook.CAST), never fighters.
// cm: height; bulk: build; posture: a stoop (the old man's); the look is CastLook.CAST[name] (sk_pitcastui.js)
const ACT1_CAST={Tamm:{cm:186,bulk:1.44,color:'#c9a46a',seed:7311},Dob:{cm:136,bulk:.74,color:'#a8b48a',seed:7333},Nim:{cm:116,bulk:.82,color:'#9fb86a',seed:7351},
  Collector:{cm:172,bulk:.92,color:'#8f9aa8',seed:7411},'Big collector':{cm:191,bulk:1.42,color:'#7a8698',seed:7433},
  Beggar:{cm:166,bulk:.86,color:'#8a8070',seed:7451},'Old man':{cm:162,bulk:.8,posture:.25,color:'#a09a8a',seed:7477},
  'Oil seller':{cm:168,bulk:1.1,color:'#c49a5a',seed:7501},Grocer:{cm:160,bulk:1.2,color:'#a8a070',seed:7523},'Linen seller':{cm:158,bulk:.9,color:'#c8c0b0',seed:7541},
  Grinder:{cm:174,bulk:1.02,color:'#9a8a7a',seed:7561}};
function act1Npc(name,o={}){const c=ACT1_CAST[name]||{},seed=o.seed||c.seed||(name.length*97),f=new Fighter(S.F.length,1,name,c.color||'#a89a80');
  f.npc=true;f.pitCast=o.cast||name;f.scfg={seed,weapon:o.weapon||'fists',skill:1,temper:'plain'};Object.assign(f,{seed,weaponKey:o.weapon||'fists',skill:1,temper:'plain'});
  f.setup(seed,f.weaponKey,1,o.x??450,o.dep??100);f.maxHp=f.hp=20;f.facing=o.facing??-1;f.build();f.side=1;f.reads={};f.wounds={head:0,arm:0,leg:0,body:0};f.marks=[];
  S.F.push(f);S.trails.push([]);standEasy(f);return f;}
{const cb=S.hooks.body;S.hooks.body=(f,b)=>{const c=f&&f.pitCast&&ACT1_CAST[f.pitCast];if(c){rebuild(b,c.cm,c.bulk);if(c.posture!=null)b.posture=c.posture;return b;}return cb(f,b);};}

// ---------- the places ----------
// The Sump: a bar of boards and tin on the floor of the Pit. Its roof (the hay, Dob's pigeon lofts, the hatch house), its kitchen
// (the table, the stove, the window up the Pit's wall), the back room (the cot, the chair, the shelf, the window onto the Pit's floor),
// and later its yard. x across the world, d the depth (12 near, 170 the back of the floor), y up from the floor where it matters.
const ACT1_PLACES={
  sumproof:{far:210,hay:{x:470,d:96,w:74,h:22},hatch:{x:742,d:168,door:28},lofts:{x0:70,x1:250,d:180},pipe:{x:640,d:186},
    spike:{x:360,y:208},floor:{x0:40,x1:860,z0:30,z1:150}},
  sumpkitchen:{far:224,table:{x0:368,x1:552,d0:56,d1:112,top:42},stove:{x:742,d:206,w:96},window:{x0:450,x1:590,y0:96,y1:40},
    ladder:{x:146,d:200},door:{x:30,w:56},floor:{x0:60,x1:860,z0:24,z1:160}},
  backroom:{far:226,cot:{x0:96,x1:300,d0:168,d1:212,top:26},chair:{x:372,d:176},shelf:{x0:448,x1:610,d:218,y:92},window:{x0:650,x1:770,y0:146,y1:82},
    door:{x:858,d:150},basin:{x:560,d:206},mirror:{x:560,y:124},stool:{x:330,d:150},crate:{x:470,d:118},floor:{x0:60,x1:830,z0:26,z1:150}},
  // the yard behind the Sump, on the floor of the Pit: the back door and its step, the pump and its trough, the gate out to the
  // stair-streets, the ladder up to the roof loft (two hands), the stairs round the side, the wall Dob sits on, barrels and crates
  yard:{far:232,door:{x:170,d:226,w:46},step:{x:170,d:206,h:16},window:{x0:286,x1:346,y0:150,y1:104},pump:{x:520,d:118,r:22},trough:{x0:540,x1:600,d:126},
    bucket:{x:496,d:104},gate:{x:836,d:120,w:60},ladder:{x:392,d:224,top:150},sidestair:{x0:30,x1:118,d:200},wall:{x0:600,x1:900,d:214,h:64},dobSeat:{x:712,d:214},
    barrels:[{x:250,d:150,r:16},{x:282,d:164,r:15}],crates:[{x:660,d:156,w:34,h:30},{x:690,d:170,w:30,h:26}],floor:{x0:40,x1:800,z0:30,z1:170}},
  // a stair-street: a switchback cut up the Pit's wall, rising left to right (the floor of the Pit below, off the left; the Shelf
  // above, off the right). Its steps are the ground; landings at both ends. Beggars sit along the wall with tin cups. From its
  // first landing the spike is in view across the Pit, high on the far wall.
  stairs:{far:224,lo:{x1:150},hi:{x0:744},rise:132,step:{run:24,h:8},beggars:{x0:330,x1:610,d:206},oldman:{x:640,d:204},rail:{d:20},spike:{x:470,y:-140},
    floor:{x0:30,x1:870,z0:40,z1:150}},
  // the Shelf market: a broad ledge halfway up the Pit's wall, stalls along the back under tarps and lamps, the edge railed at the
  // front with the drop to the floor beyond it
  shelf:{far:232,stalls:[{id:'oil',x:150,w:110,name:'Lamp oil'},{id:'grain',x:300,w:120,name:'Rice and salt'},{id:'linen',x:450,w:110,name:'Linen'},
      {id:'nim',x:610,w:130,name:'Pump stall'},{id:'grind',x:770,w:110,name:'Salves and a grinder'}],d:214,edge:{d:16},floor:{x0:40,x1:870,z0:40,z1:160}}};
// a raised place in the floor (the hay, a table, the cot): what stands or lies there stands on it
function act1Top(R,x,d){return d!=null&&x>=R.x0&&x<=R.x1&&d>=R.d0&&d<=R.d1;}
function act1Hay(x,d){const H=ACT1_PLACES.sumproof.hay,u=(x-H.x)/H.w,v=(d??0)-H.d;if(Math.abs(u)>=1||Math.abs(v)>34)return 0;return H.h*(1-u*u)*(1-(v/34)*(v/34));}
storyArena('sumproof',{label:'Roof',name:'The Sump’s roof',ground:(x,d)=>GB-act1Hay(x,d),wall:null,far:ACT1_PLACES.sumproof.far});
storyArena('sumpkitchen',{label:'Kitchen',name:'The Sump’s kitchen',ground:(x,d)=>{const T=ACT1_PLACES.sumpkitchen.table;return act1Top({x0:T.x0,x1:T.x1,d0:T.d0,d1:T.d1},x,d)?GB-T.top:GB;},wall:null,far:ACT1_PLACES.sumpkitchen.far});
// a stair-street's ground: the bottom landing, the steps, the top landing
function act1StairY(x){const R=ACT1_PLACES.stairs;if(x<=R.lo.x1)return 0;if(x>=R.hi.x0)return R.rise;const u=(x-R.lo.x1)/(R.hi.x0-R.lo.x1),n=Math.floor(u*R.rise/R.step.h);return Math.min(R.rise,n*R.step.h);}
storyArena('yard',{label:'Yard',name:'The Sump’s yard',ground:()=>GB,wall:null,far:ACT1_PLACES.yard.far});
storyArena('stairs',{label:'Stair-street',name:'The stair-streets',ground:x=>GB-act1StairY(x),wall:null,far:ACT1_PLACES.stairs.far});
storyArena('shelf',{label:'Shelf',name:'The Shelf market',ground:()=>GB,wall:null,far:ACT1_PLACES.shelf.far});
storyArena('backroom',{label:'Back room',name:'The Sump’s back room',ground:(x,d)=>{const C=ACT1_PLACES.backroom.cot;return act1Top(C,x,d)?GB-C.top:GB;},wall:null,far:ACT1_PLACES.backroom.far});

// ---------- poses for Act I ----------
// a body laid out at rest: on its back along x (dir: which way the head lies), on whatever is under it there
function layDown(f,x,d,dir){f.station=x;f.lane=f.dep=f.stepDep=d;f.facing=dir;f.build();const g=f.gr(x),b=f.body,p=f.p;
  const set=(i,X,Y)=>{p[i].x=p[i].px=X;p[i].y=p[i].py=Y;};
  const y=g-5;set(PEL,x,y);set(CHE,x+dir*b.torso,y-2);set(HEAD,x+dir*(b.torso+b.neck),y-3);
  set(ELF,x+dir*(b.torso-b.ua*.55),y+1);set(HAF,x+dir*(b.torso-b.ua*.9),y+2);set(ELB,x+dir*(b.torso-b.ua*.6),y);set(HAB,x+dir*(b.torso-b.ua),y+1);
  set(KNF,x-dir*b.th,y);set(FTF,x-dir*(b.th+b.sh),y+1);set(KNB,x-dir*b.th*.95,y-1);set(FTB,x-dir*(b.th+b.sh)*.97,y);set(TIP,x+dir*(b.torso-b.ua),y+2);
  for(const s of f.steps){s.active=false;}f.steps[0].plant={x:p[FTF].x,y:p[FTF].y};f.steps[1].plant={x:p[FTB].x,y:p[FTB].y};
  f.motor=0;f.knockUntil=S.t+1e6;f.downed=true;if(f.oneArm)oneArmFollow(f);}
// sitting on the edge of something at the height top above the floor, the feet on the floor in front of it
function sitBody(f,top){const leg=f.leg;return{px:f.station,pz:f.lane,crouch:clamp(top/leg+.18,.4,.8),lean:.12,stF:.26*leg,stB:.1*leg,th:.25};}
function sitArm(f){const a=f.arm;return{hand:{sh:[.36*a,.62*a]},wAng:1.5,off:{sh:[.2*a,.7*a]},tilt:.12};}

// ---------- the pieces of the scenes ----------
// a thought: his own words over the picture, no one speaking them (S.thought, drawn as the fall's thoughts are)
function* think(text,o={}){const dur=o.dur??Math.max(2.2,1.3+text.length*.05);S.thought={text,t0:S.t,dur:dur*(S.auto||S.storyAuto?1:1.25)};
  yield* wait(S.thought.dur);S.thought=null;yield* wait(o.gap??.2);}
function* fadeTo(v,dur){const f0=S.fade,t0=S.t;while(S.t<t0+dur){S.fade=lerp(f0,v,sstep((S.t-t0)/dur));yield;}S.fade=v;}
// a fighter's pose for a while: bent down to a body on the ground (or a table), his hands at it
function stoopAction(f,dur,o={}){const a=f.arm,leg=f.leg,x=o.x??f.station;
  return{t0:S.t,end:dur,body:[{t:0,v:()=>easyBody(f)},{t:.5,v:{px:x,pz:f.lane,crouch:o.crouch??.72,lean:o.lean??.62,stF:.2*leg,stB:-.18*leg,th:.25},e:eOut},{t:dur,v:{px:x,pz:f.lane,crouch:o.crouch??.72,lean:o.lean??.62,stF:.2*leg,stB:-.18*leg,th:.25}}],
    arm:[{t:0,v:easyArm(f)},{t:.5,v:{hand:{sh:[.62*a,.5*a]},wAng:1.4,off:{sh:[.5*a,.55*a]},tilt:.2},e:eOut},{t:dur,v:{hand:{sh:[.62*a,.5*a]},wAng:1.4,off:{sh:[.5*a,.55*a]},tilt:.2}}]};}
// holding something on a table in front of him (Dob, his legs): upright, both hands forward on it (pt: a point the hands go to, as
// a pose takes it: {w:{x,y}} or {fn})
function holdAction(f,dur,pt){const a=f.arm,to={hand:pt,wAng:1.2,off:pt.fn?{fn:()=>{const q=pt.fn();return{x:q.x-f.facing*5,y:q.y+2};}}:pt,tilt:.1};
  return{t0:S.t,end:dur,body:[{t:0,v:()=>easyBody(f)},{t:.5,v:()=>({...easyBody(f),crouch:.92,lean:.2}),e:eOut},{t:dur,v:()=>({...easyBody(f),crouch:.92,lean:.2})}],
    arm:[{t:0,v:easyArm(f)},{t:.5,v:to,e:eOut},{t:dur,v:to}]};}
// looking up at something high over him (Dob at the kitchen window): leaning back, the head up, the hands hanging
function lookUpAction(f,dur){const up=()=>({...easyBody(f),lean:-.2,crouch:.98});return{t0:S.t,end:dur,body:[{t:0,v:()=>easyBody(f)},{t:.8,v:up,e:eOut},{t:dur,v:up}],arm:[{t:0,v:easyArm(f)},{t:dur,v:easyArm(f)}]};}
// he wakes: the motor comes back to him, and he sits up on the edge of what he lay on
function sitUp(f,x,z,top){f.station=x;f.lane=z;f.guardBody=()=>sitBody(f,top);f.guardArm=()=>sitArm(f);f.knockUntil=S.t;f.downed=false;f.wasDown=true;}
function act1State(){return S.act1||(S.act1={});}
// whoever of them is down gets up the way a man does in a fight (standUp, and his strength coming back to him over most of a second),
// and the scene gives him that second before it moves him on (a scene that handed a downed man half his strength at once had him
// spring up off the floor in a few frames)
function* riseUp(fs,t=.9){let any=false;for(const f of fs)if(f&&f.downed&&!f.dead){standUp(f);f.motor=Math.max(f.motor,.12);any=true;}if(any)yield* wait(t);}

// ---------- in the cot, and out of it ----------
// In the back room he is posed by the scene, joint by joint, not by his own legs: on his back in the cot with his head on the pillow,
// sitting up, his legs swung out over the front edge as he turns to face the room, sitting on the edge with his feet on the floor,
// leaning, rising, standing. A pose says where his hips are (P, at depth d), the way his trunk and head point (aT, aN: angles, 0
// along +x, -π/2 straight up), where his hand is (h) and his feet (fF, fB), which way his elbow and knees bend (eb, kb), how far he
// is turned toward the viewer (yaw, his head hy: 0 his profile facing the cot's foot, -π/2 facing the room, as the look turns him),
// and how far the blanket has come off him (blk: 0 up to his chest, 1 down to his lap, 2 off his legs and lying on the cot, 3 gone
// back into the cot's own). f.bed = {seq, t0}: seq is [[pose, seconds], ...], the first pose where he starts and each after it
// reached in its seconds, eased. The joints are set after each step's physics (the collide wrapper below), so nothing pulls them
// about; bedEnd hands him back to his own legs, standing.
function bedPoses(K){const b=K.body,C=ACT1_PLACES.backroom.cot,MT=GB-C.top-1,F=GB-3,U=-Math.PI/2,R=-Math.PI/2,
    px=C.x0+48+b.neck*.89+b.torso,mid=(C.d0+C.d1)/2,lp=V2(px+b.th+b.sh,MT-5);
  const lie={P:V2(px,MT-8),d:mid,aT:Math.PI,aN:-2.66+2*Math.PI,h:V2(px-1,MT-9),eb:V2(0,1),fF:lp,fB:V2(lp.x-2,MT-4.5),kb:V2(0,-1),blk:0,down:true,yaw:0,hy:0};
  // (facing the room: the knees a hand apart, his hand on his knee, the head a little down)
  const edge={P:V2(px+2,MT-8),d:C.d0-4,aT:U+.18+2*Math.PI,aN:U+.26+2*Math.PI,h:V2(px+29,MT-17),eb:V2(-.4,1),fF:V2(px+38,F),fB:V2(px+34,F),kb:V2(1,-1),blk:3,yaw:R,hy:R};
  const stand={P:V2(px+35,F-b.th-b.sh+2.5),d:C.d0-4,aT:U+.04+2*Math.PI,aN:U+.02+2*Math.PI,h:V2(px+38,F-b.th-b.sh+40),eb:V2(-.2,1),fF:V2(px+40,F),fB:V2(px+31,F),kb:V2(1,-.2),blk:3,yaw:R,hy:R};
  return{lie,edge,stand,
    // (the elbow stays on the side of his feet the whole way up and back down: bent toward his head, the knee of the arm would flip
    // sides halfway and jump)
    reach:{...lie,h:V2(px-34,MT-52),eb:V2(1,.4)},
    sat:{P:V2(px-4,MT-8),d:mid,aT:U+.1+2*Math.PI,aN:U+.16+2*Math.PI,h:V2(px-20,MT-3),eb:V2(-.5,-1),fF:V2(px-4+b.th+b.sh-1,MT-5),fB:V2(px-6+b.th+b.sh-1,MT-4.5),kb:V2(0,-1),blk:1,yaw:0,hy:0},
    // (the legs come up and round toward the room as he turns on the mattress)
    knees:{P:V2(px-1,MT-8),d:mid-12,aT:U+.16+2*Math.PI,aN:U+.2+2*Math.PI,h:V2(px+3,MT-3),eb:V2(-.3,-1),fF:V2(px+40,MT-5),fB:V2(px+35,MT-5),kb:V2(.3,-1),blk:2,yaw:-.75,hy:-.95},
    lap:{...edge,h:V2(px+22,MT-15),eb:V2(-.6,1),aN:U+.42+2*Math.PI},
    lean:{...edge,P:V2(px+7,MT-9),aT:U+.62+2*Math.PI,aN:U+.5+2*Math.PI,h:V2(px+35,MT-21),eb:V2(-.3,1)},
    rise:{...edge,P:V2(px+24,F-62),aT:U+.38+2*Math.PI,aN:U+.28+2*Math.PI,h:V2(px+39,F-38),eb:V2(-.2,1),kb:V2(1,-.6)},
    // (standing, turned back to his profile, ready to go)
    standP:{...stand,yaw:0,hy:0}};}
function V2(x,y){return{x,y};}
// an angle's way from a to b the short way round
function bedTurn(a,b){let d=(b-a)%(2*Math.PI);if(d>Math.PI)d-=2*Math.PI;if(d<-Math.PI)d+=2*Math.PI;return d;}
// the pose at this moment: the leg of seq he is in, eased
function bedNow(K){const B=K.bed,q=B.seq;let t=S.t-B.t0,i=1;while(i<q.length&&t>q[i][1]){t-=q[i][1];i++;}
  if(i>=q.length){const P=q[q.length-1][0];return{...P,i};}
  const A=q[i-1][0],Z=q[i][0],u=sstep(t/Math.max(.001,q[i][1])),m=(a,b)=>a+(b-a)*u,mv=(a,b)=>V2(m(a.x,b.x),m(a.y,b.y)),ma=(a,b)=>a+bedTurn(a,b)*u;
  return{P:mv(A.P,Z.P),d:m(A.d,Z.d),aT:ma(A.aT,Z.aT),aN:ma(A.aN,Z.aN),h:mv(A.h,Z.h),eb:mv(A.eb,Z.eb),fF:mv(A.fF,Z.fF),fB:mv(A.fB,Z.fB),kb:mv(A.kb,Z.kb),blk:m(A.blk,Z.blk),
    yaw:m(A.yaw||0,Z.yaw||0),hy:m(A.hy??A.yaw??0,Z.hy??Z.yaw??0),down:u<.5?A.down:Z.down,i};}
// the pose he is in now, his own (to go on from it without a jump), turned as given
function bedFrom(K,yaw=0,hy=yaw){const p=K.p,ang=(a,b)=>Math.atan2(b.y-a.y,b.x-a.x),mid=(a,b)=>V2((a.x+b.x)/2,(a.y+b.y)/2),dir=(a,b)=>{const d=Math.hypot(b.x-a.x,b.y-a.y)||1;return V2((b.x-a.x)/d,(b.y-a.y)/d);};
  return{P:V2(p[PEL].x,p[PEL].y),d:K.dep,aT:ang(p[PEL],p[CHE]),aN:ang(p[CHE],p[HEAD]),h:V2(p[HAF].x,p[HAF].y),eb:dir(mid(p[CHE],p[HAF]),p[ELF]),
    fF:V2(p[FTF].x,p[FTF].y),fB:V2(p[FTB].x,p[FTB].y),kb:dir(mid(p[PEL],p[FTF]),p[KNF]),blk:3,yaw,hy};}
// a limb of two bones from R toward T, bent to the side of bend
function bedIK(R,T,a,b,bend){const dx=T.x-R.x,dy=T.y-R.y,L=Math.min(a+b-.05,Math.max(Math.abs(a-b)+.05,Math.hypot(dx,dy))),ux=dx/(Math.hypot(dx,dy)||1),uy=dy/(Math.hypot(dx,dy)||1);
  const A=Math.acos(clamp((a*a+L*L-b*b)/(2*a*L),-1,1)),r=s=>V2(ux*Math.cos(s*A)-uy*Math.sin(s*A),ux*Math.sin(s*A)+uy*Math.cos(s*A)),p=r(1),n=r(-1);
  const pk=(p.x*bend.x+p.y*bend.y)>=(n.x*bend.x+n.y*bend.y)?p:n;return V2(R.x+pk.x*a,R.y+pk.y*a);}
// a pose's joints for a body (b: its measures; the one arm's back points at the chest), facing +x
function poseJoints(b,N,br=0){const J=[],aT=N.aT+br,P=N.P,Ch=V2(P.x+Math.cos(aT)*b.torso,P.y+Math.sin(aT)*b.torso),H=V2(Ch.x+Math.cos(N.aN)*b.neck,Ch.y+Math.sin(N.aN)*b.neck);
  J[PEL]=P;J[CHE]=Ch;J[HEAD]=H;
  const E=bedIK(Ch,N.h,b.ua,b.fa,N.eb),hd=Math.hypot(N.h.x-E.x,N.h.y-E.y)||1,Hn=V2(E.x+(N.h.x-E.x)/hd*b.fa,E.y+(N.h.y-E.y)/hd*b.fa);
  J[ELF]=E;J[HAF]=Hn;J[TIP]=V2(Hn.x+(Hn.x-E.x)/b.fa*7,Hn.y+(Hn.y-E.y)/b.fa*7);J[ELB]=Ch;J[HAB]=Ch;
  for(const [kn,ft,T,kb] of [[KNF,FTF,N.fF,N.kbF||N.kb],[KNB,FTB,N.fB,N.kbB||N.kb]]){const Kn=bedIK(P,T,b.th,b.sh,kb),fd=Math.hypot(T.x-Kn.x,T.y-Kn.y)||1;J[kn]=Kn;J[ft]=V2(Kn.x+(T.x-Kn.x)/fd*b.sh,Kn.y+(T.y-Kn.y)/fd*b.sh);}
  return J;}
// (and a breath: the trunk rises and falls a little)
function bedApply(K){const N=bedNow(K),b=K.body,p=K.p,br=Math.sin(S.t*1.7)*.012;K.bedNow=N;K.openHand=true;
  const J=poseJoints(b,N,br);for(let i=0;i<J.length;i++){if(!J[i]||!p[i])continue;p[i].x=p[i].px=J[i].x;p[i].y=p[i].py=J[i].y;}
  K.dep=K.lane=K.stepDep=N.d;K.vdep=0;K.facing=1;K.station=N.P.x;K.downed=!!N.down;K.motor=0;K.knockUntil=S.t+1e6;
  for(const s of K.steps){s.active=false;}K.steps[0].plant={x:p[FTF].x,y:p[FTF].y};K.steps[1].plant={x:p[FTB].x,y:p[FTB].y};}
{const co=collide;collide=function(f,final){co(f,final);if(final&&f.bed)bedApply(f);};}
// play a run of poses (the first is where he is now) and wait for it
function* bedGo(K,seq){K.bed={seq,t0:S.t};bedApply(K);yield* wait(seq.reduce((s,q,i)=>s+(i?q[1]:0),0)+.02);}
// back on his own legs, standing where the last pose left him
function bedEnd(K){const P=K.p[PEL];K.bed=null;K.bedNow=null;K.openHand=false;K.knockUntil=S.t;K.downed=false;K.wasDown=false;K.motor=1;standEasy(K);K.station=P.x;K.facing=1;}

// ===== SCENE 1: OFF THE ROOF =====
// The Sump's roof, minutes after the fall. The hay on it is bedding for Dob's pigeons, which he sells to Tamm's kitchen. Dob is up
// there when an elf comes down through the birds. He runs for Tamm, and the two of them haul Ilyas down through the roof hatch.
STAGES.push({key:'roof1',act:1,num:'1',title:'Off the Roof',sub:'The Sump, minutes after the fall',arena:'sumproof',next:'kitchen1',noFight:true,wound:true,weapon:'fists',
  actCard:{kick:'ACT I',title:'The Pit',sub:''},foes:[],spawn:[[ACT1_PLACES.sumproof.hay.x,ACT1_PLACES.sumproof.hay.d]],
  setup(st){const K=hero(),R=ACT1_PLACES.sumproof,A=act1State();S.fade=1;layDown(K,R.hay.x+6,R.hay.d,-1);K.facing=1;
    A.birds={t0:S.t+60,settle:3};
    const D=act1Npc('Dob',{x:R.lofts.x1-30,dep:120,facing:1});A.dob=D;
    const T=act1Npc('Tamm',{x:R.hatch.x+18,dep:R.hatch.d-16,facing:-1});T.offstage=true;T.hidden=true;A.tamm=T;},
  *intro(st){const K=hero(),R=ACT1_PLACES.sumproof,A=act1State(),D=A.dob,T=A.tamm;
    letter(1);camTo(470,700,0);A.birds.t0=S.t;
    yield* fadeTo(0,1.8);
    yield* wait(.8);
    // Dob, slow, to the edge of the hay; a long look at what came down in it
    yield* goTo(D,R.hay.x-110,108,46);D.facing=1;lookAt(D,1,1.2);
    yield* wait(1.4);
    // and away for Tamm, to the hatch house
    yield* goTo(D,R.hatch.x-40,R.hatch.d-24,150);D.facing=1;
    yield* speak('Dob','Tamm! An elf came down in the birds’ hay!',{dur:2.6});
    yield* speak('Tamm','Then get him out of the birds’ hay.',{dur:2.2});
    // Tamm comes up, and the two of them go to him
    T.hidden=false;
    yield* all(goTo(T,R.hay.x+70,R.hay.d+4,70),(function*(){yield* wait(.4);yield* goTo(D,R.hay.x-64,R.hay.d-2,80);})());
    T.facing=-1;D.facing=1;
    T.action=stoopAction(T,3,{x:T.station});D.action=stoopAction(D,3,{x:D.station,crouch:.8,lean:.5});
    yield* wait(1.5);
    yield* fadeTo(1,1.2);},
  introSkip:null});

// ===== SCENE 1, the kitchen =====
// On Tamm's kitchen table. The shoulder is pumping blood. Tamm puts a skillet on the stove and does what has to be done. Ilyas surfaces
// once, long enough to see a thread of gold light high on the Pit wall through the window, where his arm hangs on the spike. Dob
// sees it too.
STAGES.push({key:'kitchen1',act:1,num:'',title:'',sub:'',arena:'sumpkitchen',next:'backroom',noFight:true,wound:true,weapon:'fists',cardDur:0,foes:[],
  spawn:[[(ACT1_PLACES.sumpkitchen.table.x0+ACT1_PLACES.sumpkitchen.table.x1)/2,84]],
  // (he lies with his feet near the table's end, where Dob can stand on the floor past it and hold them)
  setup(st){const K=hero(),R=ACT1_PLACES.sumpkitchen,A=act1State(),Tb=R.table;S.fade=1;layDown(K,(Tb.x0+Tb.x1)/2-10,(Tb.d0+Tb.d1)/2,1);
    A.skillet={x:R.stove.x-20,d:R.stove.d-30,heat:0,held:null};A.sear=null;A.curtain=0;
    const T=act1Npc('Tamm',{x:R.stove.x-30,dep:170,facing:1});A.tamm=T;
    const D=act1Npc('Dob',{x:Tb.x0-34,dep:98,facing:1});A.dob=D;
    // (the two of them stand on the floor at the table's ends: the table is no ground for them, so a knee or a foot that swings past
    // its edge as they step up to it or lean over it is not lifted onto its top)
    T.gr=D.gr=()=>GB;},
  *intro(st){const K=hero(),R=ACT1_PLACES.sumpkitchen,A=act1State(),T=A.tamm,D=A.dob,Tb=R.table;
    letter(1);camTo(500,700,0);
    yield* fadeTo(0,1.4);
    // the skillet heats on the stove
    const heat=(function*(){const t0=S.t;while(A.skillet.heat<1){A.skillet.heat=clamp((S.t-t0)/3.2,0,1);yield;}})();
    yield* wait(1);
    T.facing=-1;
    yield* speak('Tamm','Hold his legs, Dob. And don’t look.',{dur:2.4});
    // Dob to the foot of the table, on the floor past its end: his hands on the ankles, his face turned away (while the skillet heats)
    yield* all(heat,(function*(){yield* goTo(D,Tb.x0-16,(Tb.d0+Tb.d1)/2,60);D.facing=1;D.lookBack=true;
      D.action=holdAction(D,12,{fn:()=>{const a=K.p[FTF],b=K.p[FTB];return{x:(a.x+b.x)/2-2,y:(a.y+b.y)/2-2};}});})());
    // the skillet off the stove, across to the table
    A.skillet.held=T;T.facing=-1;
    yield* goTo(T,Tb.x1+30,74,60);T.facing=-1;
    // bent over him from the table's end, the pan on the stump (it sits a handle's length past her hand: 26 out along the handle, as
    // it is drawn)
    const pan=()=>{const c=K.p[CHE],dd=K.dep-T.dep;return{x:c.x+PSX*dd+26*Math.cos(.15),y:c.y-PSY*dd+26*Math.sin(.15)-3};},
      bend=()=>({...easyBody(T),crouch:.8,lean:.55}),reach={hand:{fn:pan},wAng:.2,off:{sh:[.5*T.arm,.5*T.arm]},tilt:.2};
    T.action={t0:S.t,end:2,body:[{t:0,v:()=>easyBody(T)},{t:.4,v:bend,e:eOut},{t:2,v:bend}],arm:[{t:0,v:easyArm(T)},{t:.4,v:reach,e:eOut},{t:2,v:reach}]};
    yield* wait(.55);
    // what has to be done
    A.sear={t0:S.t};K.seared=true;S.hooks.sound('sizzle',1);S.shake=Math.max(S.shake,5);
    // (his body jerks up off the table)
    for(const i of [CHE,HEAD,PEL])K.p[i].py+=14*DT;
    yield* wait(.35);
    yield* fadeTo(1,.25);A.skillet.held=null;A.skillet.heat=.3;A.skillet.x=R.stove.x-20;A.skillet.d=R.stove.d-30;
    T.action=null;D.action=null;D.lookBack=false;
    yield* wait(1.6);
    // he surfaces: the window, and high on the Pit's wall a thread of gold light. Dob at the window, looking up
    D.station=(R.window.x0+R.window.x1)/2-20;D.lane=D.dep=D.stepDep=190;D.facing=1;D.build();D.action=lookUpAction(D,9);A.dobUp=true;
    T.station=Tb.x1+50;T.lane=T.dep=T.stepDep=120;T.facing=-1;T.build();
    // (the picture looks up: the window high on the wall and him on the table below it, kept between the letterbox's bars; on a
    // narrow screen it comes in closer)
    camTo((R.window.x0+R.window.x1)/2,700,0);S.camCut.wn=340;S.camCut.band={top:GB-R.window.y0-R.far*PSY-10,foot:GB-Tb.d0*PSY+12};
    yield* fadeTo(.25,2.2);
    yield* wait(.8);
    yield* speak(HERO_NAME,'My arm.',{dur:1.8});
    yield* speak('Tamm','Whatever’s up that wall stays up that wall.',{dur:2.8});
    // she draws the curtain across it
    yield* until(()=>{A.curtain=Math.min(1,A.curtain+DT*1.6);return A.curtain>=1;},1);
    yield* fadeTo(1,1.6);
    yield* wait(.6);},
  introSkip:null});

// ===== SCENE 2: THE BACK ROOM =====
// The Sump, three weeks later. Ilyas wakes on a cot in a storeroom that smells of beer and onions. By habit he reaches for the gilt,
// and nothing answers (the Aether tab flickers once in the command dock and is gone). His suit lies cut to ribbons on a chair, and the
// arc-blade's hilt sits on a shelf among the jars. Tamm comes in with soup. She asks nothing about who he is, and he offers nothing.
// Then the player has him for the first time: the window onto the Pit's floor, the soup, the ruined suit, the hilt. Taking the hilt
// down spills its nine loose plates into his lap.
STAGES.push({key:'backroom',act:1,num:'2',title:'The Back Room',sub:'The Sump, three weeks later',arena:'backroom',next:'lostprop',weapon:'fists',
  wear:{top:'bare',bandage:true,feet:'bare'},
  foes:[],spawn:[[(ACT1_PLACES.backroom.cot.x0+ACT1_PLACES.backroom.cot.x1)/2,190]],
  // (he lies in the cot on his back, his head on the pillow at its far end and the blanket over him: posed by the scene, bedPoses)
  setup(st){const K=hero(),R=ACT1_PLACES.backroom,A=act1State();S.fade=1;K.zMax=R.cot.d1;
    // (three weeks on: the kitchen's skillet stays in the kitchen)
    A.skillet=null;A.sear=null;A.soup=null;A.plates=null;A.hilt='shelf';A.flicker=null;A.suit=true;A.platesSaid=false;A.blanket=true;
    const T=act1Npc('Tamm',{x:R.door.x+60,dep:R.door.d,facing:-1});T.offstage=true;T.hidden=true;A.tamm=T;},
  *intro(st){const K=hero(),R=ACT1_PLACES.backroom,A=act1State(),T=A.tamm,BP=bedPoses(K);
    K.bed={seq:[[BP.lie,0]],t0:S.t};bedApply(K);
    letter(1);camTo(430,760,0);
    yield* fadeTo(0,2.4);
    yield* wait(1);
    // by habit he reaches for the gilt, and nothing answers: the hand comes up off the blanket, and goes back down
    A.flicker={t0:S.t};S.hooks.sound('fizzle',1);K.bed={seq:[[BP.lie,0],[BP.reach,.8],[BP.reach,.7],[BP.lie,1]],t0:S.t};
    yield* think('Reach for the gilt. Nothing answers.',{dur:2.8});
    // he sits up, the blanket down to his lap; his legs come out from under it and over the front of the cot, and he sits on its edge
    yield* bedGo(K,[[BP.lie,0],[BP.sat,1.7],[BP.sat,.3],[BP.knees,1],[BP.edge,1.1]]);
    yield* wait(.6);
    // Tamm, with soup
    T.hidden=false;
    yield* goTo(T,R.stool.x+40,R.stool.d-6,70);T.facing=-1;
    T.action=stoopAction(T,1.4,{crouch:.86,lean:.4});yield* wait(.8);A.soup={x:R.stool.x,d:R.stool.d,full:1};yield* wait(.5);T.action=null;
    yield* speak('Tamm','Three weeks. You talked the whole time.',{dur:2.4});
    yield* speak(HERO_NAME,'What did I say?',{dur:1.6});
    yield* speak('Tamm','Names, mostly. Then you begged somebody for water.',{dur:2.8});
    yield* speak(HERO_NAME,'Where is this?',{dur:1.6});
    yield* speak('Tamm','The Sump. Bottom of the Pit. Nobody comes down here looking for anybody.',{dur:3.4});
    yield* goTo(T,R.door.x+70,R.door.d,80);T.hidden=true;
    // up off the cot (a hand on his knee to push from), a step out into the room, and it is his
    yield* bedGo(K,[[BP.edge,0],[BP.lean,.7],[BP.rise,.8],[BP.stand,.6],[BP.standP,.45]]);bedEnd(K);K.zMax=null;
    yield* goTo(K,K.station+6,R.floor.z1-4,40);
    yield* wait(.4);letter(0);},
  explore(st){const R=ACT1_PLACES.backroom,A=act1State();
    return{area:'backroom',bounds:{x0:R.floor.x0,x1:R.floor.x1,z0:R.floor.z0,z1:R.floor.z1},view:760,
      goal:{text:'Look around the room',done:()=>!!A.platesSaid,hint:()=>S.ex&&!S.ex.spots.some(s=>s.used)?{touch:'Tap the floor to walk there. Tap a marker to use it.',keys:'Click the floor to walk there, or use the arrows. E uses what is nearest.'}:''},
      spots:[
        {id:'window',label:'The window',verb:'Look',x:(R.window.x0+R.window.x1)/2,z:R.floor.z1,at:{x:(R.window.x0+R.window.x1)/2,y:GB-R.window.y0+10,d:R.far},
          *run(){yield* think('The floor of the Pit. Smoke off the drums, tin roofs, and the wall going up into the dark.');}},
        {id:'soup',label:'The soup',verb:'Eat',x:R.stool.x+30,z:R.stool.d-14,at:{x:R.stool.x,y:GB-30,d:R.stool.d},when:()=>!!A.soup,
          *run(){const K=hero();K.action=stoopAction(K,1.6,{crouch:.88,lean:.34});yield* wait(1);if(A.soup)A.soup.full=0;yield* think('Onion and barley. Three weeks of it, and not a spoonful I remember.');}},
        {id:'suit',label:'The suit',verb:'Look',x:R.chair.x+14,z:R.floor.z1,at:{x:R.chair.x,y:GB-44,d:R.chair.d},
          *run(){yield* think('Cut off me in ribbons. Even the gold thread has gone dull.');}},
        {id:'hilt',label:'The hilt',verb:'Take',x:(R.shelf.x0+R.shelf.x1)/2,z:R.floor.z1,at:{x:(R.shelf.x0+R.shelf.x1)/2,y:GB-R.shelf.y,d:R.shelf.d},key:true,once:true,
          *run(){const K=hero(),BP=bedPoses(K);
            // up to the shelf for it, back to the cot with it: he sits down on its edge, and a flick of the thumb
            K.action={t0:S.t,end:1,body:[{t:0,v:()=>easyBody(K)}],arm:[{t:0,v:easyArm(K)},{t:.45,v:{hand:{sh:[.5*K.arm,-.6*K.arm]},wAng:-1.2,off:{sh:[0,.9*K.arm]},tilt:0},e:eOut},{t:1,v:easyArm(K)}]};
            yield* wait(.5);A.hilt='hand';yield* wait(.5);
            K.zMax=R.cot.d1;yield* goTo(K,BP.stand.P.x,BP.stand.d,70);
            // (he turns round to the room, his back to the cot, and lets himself down onto its edge: the turn is his own, the game's,
            // and the scene takes him from the moment he faces the room)
            K.facing=1;yield* wait(TURN.dur*.5);
            yield* bedGo(K,[[bedFrom(K,-Math.PI/2),0],[BP.stand,.35],[BP.rise,.6],[BP.lean,.6],[BP.lap,.6]]);
            yield* wait(.5);
            A.plates={t0:S.t,n:9};S.hooks.sound('plates',1);A.hilt='lap';
            yield* wait(1.4);
            yield* speak(HERO_NAME,'Nine plates. Nothing to lock them.',{dur:2.6});A.platesSaid=true;
            yield* bedGo(K,[[BP.lap,0],[BP.lean,.6],[BP.rise,.7],[BP.stand,.5],[BP.standP,.45]]);bedEnd(K);K.zMax=null;
            yield* goTo(K,K.station+6,R.floor.z1-4,40);yield* wait(.2);}}]};},
  *outro(st){yield* fadeTo(1,1.6);}});

// the fall goes on into Act I
{const F=STAGES[stageIx('fall')];if(F){F.next='roof1';F.flagsOut=Object.assign({},F.flagsOut||{},{pit:true});}}
// ===== ACT I END =====
