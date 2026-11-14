// ===== ACT I, SCENES 3 AND 4 START =====
// Scene 3, Lost Property: Tamm's crate of thirty years of what her customers left behind, and what he puts on from it. The gear screen
// has the gear's eight slots (sk_gear.js) and the right arm's, which is empty: Missing. Scene 4, A Man's Pace: the yard, and
// the movement tutorial. He walks and jogs about the floor and its depth, lurching until he finds his weight; his one hand holds the
// bucket or nothing, so a latched gate means setting the bucket down first; the ladder to the roof loft needs two hands; Dob sits on
// the yard wall and says what he sees. Tamm gives him the job at the start: fill the bucket at the pump and take it up to Dob's birds
// in the loft.

// ---------- what he wears in the Pit ----------
// The crate's things and what they do are the gear's (sk_gear.js: GEAR, GEAR_CRATE, kitOf, kitWear and the rules). The choice rides in
// the story's flags (S.story.flags.kit: slot -> what he wears), so it goes with him from scene to scene, and a chapter picked from the
// menu after scene 3 starts in the first of each slot.
// an Act I stage that says wear:'kit' dresses him from the crate's choice
{const sd=storyDuel;storyDuel=function(st){sd(st);if(st&&st.act&&st.wear==='kit'){const K=hero();if(K)K.wear=kitWear(kitOf());}};}
V11.duelStart.push(()=>{const st=act1Stage();if(st&&st.wear==='kit'){const K=S.F[0];if(K)K.wear=kitWear(kitOf());}});

// ---------- the gear screen ----------
// Opened by a scene (S.act1.gear = {open, kit (slot -> what he has on), wear, last: the slot last changed}); the page shows it and calls
// these. Each slot steps through what he has for it (gearOwned: the crate's, then what he bought). On auto the crate's first choices are
// taken.
function act1GearOpen(kit,o={}){const A=act1State();A.gear={open:true,kit:kitRead(kit||kitOf()),pinned:o.pinned!==false,t0:S.t,last:null};A.gear.wear=kitWear(A.gear.kit,{pinned:A.gear.pinned});
  S.hooks.act1('gear',A.gear);return A.gear;}
function act1GearSet(slot,id){const G=S.act1&&S.act1.gear;if(!G||!G.open||!GEAR_CRATE[slot])return;const L=gearOwned(slot);
  if(typeof id==='number')id=L[((id%L.length)+L.length)%L.length];if(!L.includes(id))return;G.kit[slot]=id;G.last=slot;G.wear=kitWear(G.kit,{pinned:G.pinned});}
function act1GearStep(slot,dir){const G=S.act1&&S.act1.gear;if(!G||!GEAR_CRATE[slot])return;const L=gearOwned(slot),i=Math.max(0,L.indexOf(G.kit[slot]));act1GearSet(slot,L[((i+dir)%L.length+L.length)%L.length]);}
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
// ---------- the yard's camera (since V117) ----------
// Its shots by name: where the camera looks (x, as drawn), how wide (w; wn on a phone held upright; ws on a phone on its side, where
// the shot's band would not fit under w) and what it keeps in the picture from top to foot (band: world y, as drawn). k 0 is a cut
// (it lands at once, up and down too); a glide is a cut with reduced motion. The whole yard as the scene opens; in on whoever
// speaks; in on the pump and the ladder as he uses them; up the stairs with him, and the roof, as it closes.
const YARD_SHOTS={
  yard:{x:464,w:820,ws:900,wn:640,band:[56,478]},   // the whole yard under the Sump's roof
  door:{x:232,w:500,ws:600,wn:300,band:[108,364]},  // the back door, Tamm before its step, he by her
  pump:{x:540,w:430,wn:300,band:[200,420]},         // the pump, the bucket under its spout, the trough
  loft:{x:436,w:460,wn:320,band:[30,250]},          // up the ladder to the loft's hatch and the birds' boxes on the ridge
  ladder:{x:428,w:560,ws:700,wn:300,band:[44,356]}, // he at the ladder's foot, the loft over him
  dob:{x:752,w:420,wn:280,band:[200,380]},          // Dob up on his crate by the yard wall
  him:{x:300,w:420,wn:280,band:[215,395]},          // he where he stands (x given)
  roof:{x:150,w:440,ws:640,wn:300,band:[-90,190]}}; // the roof's corner over the stairs' landing, the birds' boxes on the ridge
// (an upright phone has height to spare: there each shot sits at the foot of the screen, YARD_FOOT at its lower edge, and the
// Pit's wall over the yard fills the rest; while he walks about, YARD_HUD pixels under it are left to the hand's panel and the
// buttons, which lie over the picture. The roof's shot looks up and keeps its own band)
const YARD_VIEWN=440,YARD_VIEWS=900,YARD_FOOT=492,YARD_HUD=90;
// (since V118 the floor runs on south, and the picture goes down it with him: nothing moves while he is in the yard's back half, deeper
// than YARD_SLIDE.d; from there to the floor's foot the band comes down by so much (dy on a wide screen, dyN on an upright phone),
// so the floor's foot stands clear of the panels when he is on it. On the ground before the shed the picture comes down further
// (over, overN) and looks out past the lip: yardLook, 0 to 1, by how near the lip he stands, from the shed's front on south.
// The floor runs twice as far as it did when this was written, and the picture comes down so much further: its foot is the
// kerb's, 33 units under the floor's own)
const YARD_SLIDE={d:100,dy:358,dyN:326,over:130,overN:160};
function yardLook(K){const Sh=ACT1_PLACES.yard.south.shed;return sstep(clamp((K.station-640)/150,0,1))*sstep(clamp((Sh.d0+10-K.dep)/44,0,1));}
function yardDown(K,narrow){const So=ACT1_PLACES.yard.south,y=prjY(GB,K.dep),y0=prjY(GB,YARD_SLIDE.d),y1=prjY(GB,So.z0);
  return sstep(clamp((y-y0)/(y1-y0),0,1))*(narrow?YARD_SLIDE.dyN:YARD_SLIDE.dy)+yardLook(K)*(narrow?YARD_SLIDE.overN:YARD_SLIDE.over);}
function yardShot(name,k,o){const Sh=YARD_SHOTS[name],rm=typeof reduceMotion!=='undefined'&&reduceMotion;camTo(o&&o.x!=null?o.x:Sh.x,Sh.w,rm?0:k);
  const C=S.camCut,K=o&&o.x!=null?hero():null,dy=K?prjY(GB,K.dep)-prjY(GB,150):0;C.wn=Sh.wn;C.ws=Sh.ws||null;C.band={top:Sh.band[0]+dy,foot:Sh.band[1]+dy};
  // (the whole yard's shot takes in the south too on an upright phone, which has the height for it: since V118)
  if(name!=='roof')C.bandN={top:Sh.band[0]+dy,foot:name==='yard'?prjY(GB,ACT1_PLACES.yard.south.z0)+14:YARD_FOOT,low:YARD_HUD};if(rm||!k)C.snap=true;return C;}
// shots one after another while a line is spoken ([name, k, how long]); it stops with the line
function* yardSeq(list){for(const [name,k,hold] of list){yardShot(name,k);const t=S.t+hold;while(S.t<t&&S.say)yield;if(!S.say)return;}}
// while he walks about: on an upright phone the view is closer (YARD_VIEWN) and leads him a little the way he walks; a phone on its
// side looks wider (YARD_VIEWS), so that his head at the yard's back is clear of the goal's panel and his feet at its front are
// clear of the hand's. The yard's floor sits at the foot of the picture, over the panels
function yardExCam(C,K){const dy=yardDown(K,false),dn=yardDown(K,true),lk=yardLook(K);C.ws=YARD_VIEWS;C.band={top:128+dy,foot:460+dy,low:56};C.bandN={top:56+dn,foot:YARD_FOOT+dn,low:YARD_HUD};
  C.xn=prjX(K.station,K.dep)+(K.cutWalk?K.facing*36:0)+lk*46;}
// a shot that goes with him (the climb): S.act1.yardFollow {w, wn, ws, up, down (how much of the picture over and under his feet), dx}
V11.step.push(()=>{const A=S.act1,Fw=A&&A.yardFollow;if(!Fw||!S.camCut||S.arenaKey!=='yard')return;const st=act1Stage();if(!st||st.key!=='yard1')return;const K=hero(),x=K.p[PEL].x,y=prjY(K.gr(x),K.dep),C=S.camCut;
  C.x=C.xn=prjX(x,K.dep)+(Fw.dx||0);C.w=Fw.w;C.wn=Fw.wn;C.ws=Fw.ws||null;C.band={top:y-Fw.up,foot:y+Fw.down};C.bandN=null;});
// ---------- the way up: the side stairs, their landing, the roof (since V117) ----------
// The side stairs are ground to a man on his way up them (f.yardUp, in this scene only): ten treads from inside the gate up to the
// landing at the Sump's corner, and from the landing a step up onto the roof's tin, which rises to the ridge as it goes back.
// yardStairH: how high the tread at x stands; yardRoofH: how high the roof is at depth d (the painter's own numbers).
const YARD_STEPS=12,YARD_LAND=174,YARD_ROOF={d0:232,d1:278,eave:190,ridge:208};
function yardStairH(x){const St=ACT1_PLACES.yard.sidestair,run=(St.x1-St.x0)/YARD_STEPS;return x>=St.x1?0:Math.min(YARD_STEPS,Math.floor((St.x1-x)/run)+1)*YARD_LAND/YARD_STEPS;}
function yardRoofH(d){return lerp(YARD_ROOF.eave,YARD_ROOF.ridge,clamp((d-YARD_ROOF.d0)/(YARD_ROOF.d1-YARD_ROOF.d0),0,1));}
function yardUpH(x,d){const St=ACT1_PLACES.yard.sidestair;return d>=YARD_ROOF.d0-1?yardRoofH(d):d>=St.d-2?yardStairH(x):0;}
{const gr=Fighter.prototype.gr;Fighter.prototype.gr=function(x){if(this.yardUp&&S.arenaKey==='yard'){const st=act1Stage();if(st&&st.key==='yard1')return GB-yardUpH(x,this.dep);}return gr.call(this,x);};}
// The scene's close. He goes in at the gate with the bucket and up the flight a tread at a time, at the pace the stairs allow him;
// over the landing and up onto the roof to the pigeon lofts, where he sets the water down by their boxes. The birds go up as he
// comes. The camera goes up with him (S.act1.yardFollow), then holds the roof.
const YARD_UP={d:213,v:21,land:{x:24,d:219},roof:[{x:30,d:240},{x:46,d:250}],bucket:{x:63,d:252}};
function* yardClimb(){const A=act1State(),K=hero(),Y=ACT1_PLACES.yard,G=Y.stairGate,St=Y.sidestair,U=YARD_UP;
  letter(1);A.stairGate=1;camTo(prjX(K.station,K.dep),540,typeof reduceMotion!=='undefined'&&reduceMotion?0:2.4);A.yardFollow={w:540,ws:700,wn:330,up:170,down:54,dx:-34};
  yield* goTo(K,G.x+3,G.d-8,56,{direct:true});
  // (the stairs and the roof lie deeper than the yard's floor and past its left edge: his own depth limit goes with him, K.zMax,
  // and the stage's edge lets him by, K.offstage)
  K.yardUp=true;K.zMax=YARD_ROOF.d1+8;K.offstage=true;
  yield* goTo(K,G.x-3,U.d,44,{direct:true});
  yield* goTo(K,St.x0+7,U.d,U.v,{direct:true});
  yield* goTo(K,U.land.x,U.land.d,26,{direct:true});
  A.yardFollow=null;yardShot('roof',1.3);
  yield* goTo(K,U.roof[0].x,U.roof[0].d,26,{direct:true});
  A.birdsUp=S.t;S.hooks.sound('birds',1);
  yield* goTo(K,U.roof[1].x,U.roof[1].d,26,{direct:true});
  K.facing=1;K.action=stoopAction(K,1.1,{crouch:.84,lean:.42});yield* wait(.55);
  if(S.ex)S.ex.hand=null;A.bucket.where='roof';A.bucket.x=U.bucket.x;A.bucket.d=U.bucket.d;A.bucket.h=yardRoofH(U.bucket.d);
  yield* wait(.6);K.action=null;yield* wait(1.3);
  yield* fadeTo(1,1.4);
  K.yardUp=false;K.zMax=null;K.offstage=false;A.yardFollow=null;A.birdsUp=0;}
// (Dob perches on the crate by the wall: no one stands deeper than DEP_MAX, so the wall itself is out of reach. The crate's top is
// ground at its own depth, behind where he walks: the yard's floor ends short of it)
ACT1_PLACES.yard.dobSeat={x:690,d:170,crate:true};ACT1_PLACES.yard.floor.z1=164;
{const Cr=ACT1_PLACES.yard.crates[1];ARENAS.yard.ground=(x,d)=>d!=null&&d>=Cr.d-4&&d<=Cr.d+6&&Math.abs(x-Cr.x)<=Cr.w/2?GB-Cr.h:GB;}
// what stands on the yard's floor, that he walks round (the pump and its trough, the two barrels, the crates by Dob)
const YARD_BLOCKS=[{x0:506,x1:636,z0:110,z1:144},{x0:244,x1:326,z0:134,z1:214},{x0:641,x1:708,z0:146,z1:180}];
// (and in the yard's south, since V118: the spoil bank, in two parts as it narrows to its end, and the headwall's two wing walls;
// everything right of the old floor's edge above the south's own right side; the shed, and the ground behind it, which it hides;
// the fire's ring, the crate and the log by it; the handcart by the kerb; the garden's beds, each with room behind it for what
// grows in it; the tree; the straw man's post and the rack by it; the wagon; the table and its benches; the pails at the standpipe)
const YARD_BLOCKS_S=(()=>{const Y=ACT1_PLACES.yard,So=Y.south,B=So.bank,D=So.drain,F=So.fire,C=So.cart,Sh=So.shed,Wg=So.wagon,Tb=So.table,Tr=So.tree,Po=So.post,Qu=So.queue,w0=D.x-D.r-18,w1=D.x+D.r+18,fk=F.k,tk=Tb.k;
  return[{x0:-400,x1:B.x1,z0:B.d0-4,z1:B.d2},{x0:-400,x1:B.x2,z0:B.d2,z1:B.d1},{x0:-400,x1:w0+2,z0:D.d-D.wing,z1:D.d+2},{x0:w1-2,x1:w1+30,z0:D.d-D.wing,z1:D.d+2},
    {x0:Y.floor.x1,x1:1300,z0:So.east,z1:400},{x0:Sh.x0-6,x1:1300,z0:Sh.d0-4,z1:Sh.d1+8},{x0:Sh.x0-24,x1:1300,z0:Sh.d1,z1:400},
    {x0:F.x-F.r-6,x1:F.x+F.r+6,z0:F.d-F.r*.9-4,z1:F.d+F.r*.9+4},{x0:F.x-F.r-40*fk,x1:F.x-F.r-13*fk,z0:F.d-14*fk,z1:F.d+10*fk},{x0:F.x+F.r+12*fk,x1:F.x+F.r+46*fk,z0:F.d-6*fk,z1:F.d+10*fk},
    {x0:C.x0,x1:C.x1,z0:So.z0-20,z1:C.d+14*C.k},...So.beds.map(b=>({x0:b[0]-3,x1:b[1]+3,z0:b[2]-3,z1:b[3]+16})),
    {x0:Tr.x-14,x1:Tr.x+14,z0:Tr.d-8,z1:Tr.d+8},{x0:Po.x-18,x1:Po.x+18,z0:Po.d-10,z1:Po.d+10},{x0:Po.x-98,x1:Po.x-42,z0:Po.d-8,z1:Po.d+8},
    {x0:Wg.x0-4,x1:Wg.x1+4,z0:Wg.d0-4,z1:Wg.d1+4},{x0:Tb.x0-4,x1:Tb.x1+4,z0:Tb.d0-16*tk-4,z1:Tb.d1+16*tk+4},{x0:Qu.x-22,x1:Qu.x+22,z0:So.z0-20,z1:Qu.d1+14}];})();
YARD_BLOCKS.push(...YARD_BLOCKS_S);
// the yard's floor as he may walk it: the old floor and the south, its foot along the lip at the right (he stands a pace back from
// it: the rail is between), run on at its left end down to the floor's own foot
function yardBounds(){const Y=ACT1_PLACES.yard,So=Y.south,L=So.lip,foot=[];
  for(let i=3;i>=0;i--)foot.push([L[i][0],L[i][1]+22]);
  {const a=foot[0],b=foot[1];foot.unshift([a[0]-(a[1]-So.z0)*(b[0]-a[0])/(b[1]-a[1]),So.z0]);}
  return{x0:Y.floor.x0,x1:So.x1,z0:So.z0,z1:Y.floor.z1,foot};}
// the goal as it stands: what he has done of the errand and what is in his hand
function yardGoal(){const A=S.act1,YD=A&&A.yard;if(!YD)return'';const H=S.ex&&S.ex.hand,has=id=>!!H&&H.id===id;
  if(!YD.filled)return has('bucket')||A.bucket.where==='spout'?'Fill the bucket at the pump':'Take the bucket';
  if(!has('water'))return'Take up the bucket of water';
  if(!YD.ladderTried)return'Take the water up to Dob’s birds in the loft';
  if(A.stairGate<1)return'Round the side: through the gate to the stairs';
  return'Up the stairs with the water';}
// the hint under it: how he is walked at first, then how each part of the job is done ({touch, keys}: a finger, or keys)
function yardHint(){const A=S.act1,YD=A&&A.yard;if(!YD)return'';const H=S.ex&&S.ex.hand,has=id=>!!H&&H.id===id,h=(touch,keys)=>({touch,keys});
  if(!YD.step&&YD.walked<160)return h('Tap the ground to walk there. Tap twice to jog. Up the screen is farther away.','Arrows or WASD walk, Shift jogs. Up is farther away. E uses, Q sets down.');
  if(!YD.filled&&A.bucket.where==='spout')return h('One hand for the handle. The bucket waits under the spout.','One hand for the handle. The bucket waits under the spout.');
  if(!YD.filled)return has('bucket')?h('Walk to the pump, then tap Fill.','Walk to the pump and press E to fill it.')
    :h('The bucket is by the pump. Walk to it, then tap Take.','The bucket is by the pump. Walk to it and press E to take it.');
  if(!has('water'))return YD.ladderTried&&A.stairGate<1?h('Walk to the gate, then tap Open. Then take the bucket again.','Walk to the gate and press E to open it. Then take the bucket again.')
    :h('Take the bucket again: walk to it, then tap Take.','Take the bucket again: walk to it and press E.');
  if(!YD.ladderTried)return h('The loft is up the ladder by the back wall.','The loft is up the ladder by the back wall.');
  if(A.stairGate<1)return h('The gate needs a free hand. Tap Set down to put the bucket down first.','The gate needs a free hand. Press Q to put the bucket down first.');
  return h('Walk to the stairs, then tap Go up.','Walk to the stairs and press E to go up.');}
STAGES.push({key:'yard1',act:1,num:'4',title:'A Man’s Pace',sub:'The Sump’s yard',arena:'yard',next:null,weapon:'fists',wear:'kit',foes:[],
  spawn:[[ACT1_PLACES.yard.step.x+46,ACT1_PLACES.yard.floor.z1-14]],
  setup(st){const K=hero(),Y=ACT1_PLACES.yard,A=act1State();S.fade=1;standEasy(K);K.station=Y.step.x+46;K.lane=K.dep=K.stepDep=Y.floor.z1-14;K.facing=-1;K.build();K.lurch=1;
    A.yard={step:0,walked:0,ladderTried:false,drunk:false,jogNote:false,filled:false,done:false};A.stairGate=0;A.gate=0;
    A.bucket={x:Y.pump.x-36,d:Y.pump.d-16,full:false,where:'floor'};A.pumping=null;A.pumpA=0;A.yardFollow=null;A.birdsUp=0;A.yardDoor=0;K.yardUp=false;K.zMax=null;
    const D=act1Npc('Dob',{x:Y.dobSeat.x,dep:Y.dobSeat.d,facing:-1});D.guardBody=()=>sitBody(D,4);D.guardArm=()=>sitArm(D);A.dob=D;
    // (Tamm stands on the yard's floor before the back door's step, as deep as the floor goes)
    const T=act1Npc('Tamm',{x:Y.door.x-8,dep:DEP_MAX,facing:1});A.tamm=T;},
  *intro(st){const A=act1State(),T=A.tamm,D=A.dob,K=hero(),Y=ACT1_PLACES.yard;
    // the whole yard as it opens, then in on the two of them at the back door
    letter(1);yardShot('yard',0);
    yield* fadeTo(0,1.2);yield* wait(.9);
    // Tamm, before the back door's step, gives him the yard's job: water for Dob's birds, up in the roof loft. Dob watches from his crate
    faceToward(K,T.station);yardShot('door',1.5);yield* wait(.5);
    yield* speak('Tamm','Up and walking. Good. You can earn your soup.',{dur:2.6});
    // (the camera goes to each thing as she names it: the pump, then up the ladder to the loft and the birds' boxes)
    yield* all(yardSeq([['door',1.5,1.3],['pump',2,1.5],['loft',2,9]]),speak('Tamm','Dob’s birds want water. Fill the bucket at the pump and take it up to the loft.',{dur:4}));
    yardShot('dob',0);faceToward(K,D.station);yield* wait(.25);
    yield* speak('Dob','I’d do it myself, but I’m watching.',{dur:2.4});
    // Tamm goes back in to her kitchen: the door opens to her and shuts behind her (A.yardDoor, which the yard's picture draws);
    // the yard is his
    yardShot('door',0);T.zMax=Y.door.d;
    yield* all(goTo(T,Y.door.x+4,Y.door.d-5,48,{direct:true}),yardDoorTo(1,.5,.3));T.hidden=true;
    yield* yardDoorTo(0,.4,.1);
    letter(0);},
  explore(st){const Y=ACT1_PLACES.yard,A=act1State(),YD=A.yard,G=Y.stairGate;
    const hand=()=>S.ex&&S.ex.hand,holds=id=>!!hand()&&hand().id===id;
    return{area:'yard',bounds:yardBounds(),view:760,viewN:YARD_VIEWN,cam:yardExCam,hand:null,blocks:YARD_BLOCKS,
      goal:{text:yardGoal,done:()=>YD.done,hint:yardHint},
      spots:[
        {id:'bucket',label:'The bucket',verb:'Take',x:A.bucket.x-14,z:A.bucket.d,at:{x:A.bucket.x,y:GB-10,d:A.bucket.d},take:{id:'bucket',name:'Bucket'},when:()=>A.bucket.where==='floor',
          *run(){A.bucket.where='hand';YD.step=Math.max(YD.step,1);}},
        {id:'pump',label:'The pump',verb:'Fill',x:Y.pump.x+12,z:Y.pump.d-24,at:{x:Y.pump.x+20,y:GB-66,d:Y.pump.d},
          needs:()=>holds('bucket')?null:holds('water')?'The bucket is full':'Bring the bucket',
          *run(){const K=hero(),Pm=Y.pump;
            // a one-handed job in three goes: the bucket down under the spout; round to the handle and three strokes of it, the
            // water coming with each; back round for the bucket. The camera comes in for it
            yardShot('pump',1.8);
            K.facing=1;K.action=stoopAction(K,.8,{crouch:.86,lean:.4});yield* wait(.4);S.ex.hand=null;A.bucket.where='spout';yield* wait(.4);K.action=null;
            yield* goTo(K,Pm.x-PUMP_STAND,Pm.d,64,{direct:true});K.facing=1;yield* wait(.15);
            A.pumping={t0:S.t};for(let i=0;i<3;i++){K.action=pumpAction(K);S.hooks.sound('pump',1);const t0=S.t;
              yield* until(()=>{A.pumpA=-Math.sin(clamp((S.t-t0)/.7,0,1)*Math.PI);return S.t>=t0+.7;},1);A.bucket.fill=(i+1)/3;}
            A.pumping=null;A.pumpA=0;K.action=null;
            yield* goTo(K,Pm.x+12,Pm.d-24,64,{direct:true});K.facing=1;K.action=stoopAction(K,.8,{crouch:.86,lean:.4});yield* wait(.4);
            A.bucket.where='hand';A.bucket.full=true;S.ex.hand={id:'water',name:'Bucket of water'};YD.filled=true;YD.step=Math.max(YD.step,2);yield* wait(.4);K.action=null;}},
        {id:'ladder',label:'The ladder',verb:'Climb',x:Y.ladder.x+4,z:Y.floor.z1,at:{x:Y.ladder.x,y:GB-70,d:Y.ladder.d},needs:'two',
          *refused(){const K=hero(),Ld=Y.ladder,first=!YD.ladderTried;
            // he goes in to its foot and looks up it to the loft; he reaches for the rung with the hand he has (when it is free), and
            // for the next with the hand he has not; then back out onto the yard's floor
            yardShot('ladder',1.6);
            K.zMax=Ld.d;yield* goTo(K,Ld.x-LADDER_STAND,Ld.d-22,60,{direct:true});
            K.facing=1;K.action=reachAction(K,1.8,{holding:!!S.ex.hand});yield* wait(1.9);K.action=null;
            if(first){YD.ladderTried=true;YD.step=Math.max(YD.step,3);yield* wait(.3);
              yardShot('dob',0);
              yield* speak('Dob','Stairs are round the side. Takes longer. Everything does now, I bet.',{dur:3.6});yardShot('ladder',0);}
            yield* goTo(K,Ld.x+4,Y.floor.z1,60,{direct:true});K.zMax=null;}},
        {id:'stairgate',label:'The gate',verb:'Open',x:G.x+22,z:Y.floor.z1,at:{x:G.x,y:GB-54,d:G.d},needs:'free',when:()=>YD.ladderTried&&A.stairGate<1,
          *run(){const K=hero(),dz=12;
            // up to it, his hand on its top rail, and in it goes; then back out onto the yard's floor
            K.zMax=G.d;yield* goTo(K,G.x-6,G.d-dz,56,{direct:true});K.facing=1;
            const t0=S.t+.35,at=()=>{const k=sstep(clamp((S.t-t0)/.8,0,1));return{x:G.x+10-k*5+dz*PSX,y:GB-(SG_RAIL+k*2)-dz*PSY};};
            K.action=holdAction(K,1.3,{fn:at});yield* wait(.35);
            yield* until(()=>{A.stairGate=sstep(clamp((S.t-t0)/.8,0,1));return A.stairGate>=1;},2);
            S.hooks.sound('gate',1);yield* wait(.15);K.action=null;
            yield* goTo(K,G.x+22,Y.floor.z1,56,{direct:true});K.zMax=null;}},
        {id:'stairs',label:'The stairs',verb:'Go up',x:Y.sidestair.x1+4,z:Y.floor.z1,at:{x:(Y.sidestair.x0+Y.sidestair.x1)/2,y:GB-40,d:Y.sidestair.d},
          when:()=>YD.ladderTried&&A.stairGate>=1,needs:()=>holds('water')?null:'The birds want the water',key:true,
          *run(){YD.done=true;}}],
      exits:[]};},
  *outro(st){
    // up the stairs with the bucket, to the birds
    yield* yardClimb();S.story.ended='act1';}});

// the yard's moments: Dob's first look at his walk, and the jog he gets for a run
V11.step.push(()=>{const st=act1Stage();if(!st||st.key!=='yard1'||!S.ex||!S.ex.on||S.cut)return;const A=S.act1,YD=A&&A.yard,K=S.F[0];if(!YD)return;
  // (Dob is watching: he turns on his crate to keep him in sight)
  {const D=A.dob,dx=D?K.station-D.station:0;if(D&&Math.abs(dx)>26)D.facing=Math.sign(dx);}
  if(K.cutWalk&&K.walkV)YD.walked+=Math.hypot(K.walkV.x,K.walkV.z)*DT;
  if(!YD.drunk&&YD.walked>90&&K.lurch>.3){YD.drunk=true;cutStart('yard:drunk',(function*(){const D=A.dob;D.facing=K.station<D.station?-1:1;
      // (he has stopped where he was: the scene's start halts the walk) he turns to her to answer
      yardShot('dob',0);
      yield* speak('Dob','You walk like a drunk on payday.',{dur:2.6});yield* wait(.2);faceToward(K,D.station);
      yardShot('him',0,{x:prjX(K.station,K.dep)});
      yield* speak(HERO_NAME,'I’m still finding where the floor is.',{dur:2.6});})(),{then:()=>{if(exOn())S.game.phase='explore';}});return;}
  if(!YD.jogNote&&(S.ex.run||S.ex.keys.run)&&K.cutWalk){YD.jogNote=true;exNote('A man’s jog. The sprint went with the gilt.');}});
// the back door on its hinges: open (1) or shut (0) over dur, after a wait
function* yardDoorTo(v,dur,after){const A=act1State(),v0=A.yardDoor||0;yield* wait(after||0);const t0=S.t;yield* until(()=>{A.yardDoor=lerp(v0,v,sstep(clamp((S.t-t0)/dur,0,1)));return S.t>=t0+dur;},dur+1);A.yardDoor=v;}
// the pump's handle worked with his one hand: the hand up to the handle and down with it
// (his hand keeps hold of the handle's grip as it goes down and comes up: the grip's place is the game's, pumpGrip, and the
// drawing puts the handle there; his weight goes onto it with the stroke)
function pumpAction(f){const a=f.arm,grip=()=>{const g=pumpGrip(S.act1&&S.act1.pumpA),dd=g.d-f.dep;return{x:g.x+dd*PSX,y:GB-g.h-dd*PSY};},
    lean=()=>({...easyBody(f),crouch:.93+.05*((S.act1&&S.act1.pumpA)||0),lean:.16-.12*((S.act1&&S.act1.pumpA)||0)});
  return{t0:S.t,end:.7,body:[{t:0,v:lean},{t:.7,v:lean}],arm:[{t:0,v:{hand:{fn:grip},wAng:.5,off:{sh:[0,.9*a]},tilt:.05}},{t:.7,v:{hand:{fn:grip},wAng:.5,off:{sh:[0,.9*a]},tilt:.05}}]};}
// the pump's handle: a lever from the head of the column back toward him, its grip's place as it swings (a: 0 at rest, -1 pushed
// right down): x, height over the ground, depth
const PUMP_STAND=76,PUMP_LEVER=31,LADDER_STAND=17,SG_RAIL=68;
function pumpGrip(a){const Pm=ACT1_PLACES.yard.pump,k=Pm.k||1,th=-(a||0)*.6;return{x:Pm.x-(2+PUMP_LEVER*Math.cos(th))*k,h:14+(50-PUMP_LEVER*Math.sin(th))*k,d:Pm.d,th};}
// reaching up a ladder: the hand up to a rung over his head and held there (unless it holds something), and then the reach of the
// arm he has not got: the empty side's shoulder comes up and the sleeve swings forward with it (f.phantom, which the look draws)
function reachAction(f,dur,o={}){const a=f.arm,arm=o.holding?[{t:0,v:easyArm(f)},{t:dur,v:easyArm(f)}]:
    [{t:0,v:easyArm(f)},{t:.45,v:{hand:{sh:[.3*a,-.95*a]},wAng:-1.4,off:{sh:[0,.9*a]},tilt:0},e:eOut},{t:dur-.4,v:{hand:{sh:[.32*a,-.9*a]},wAng:-1.4,off:{sh:[0,.9*a]},tilt:0}},{t:dur,v:easyArm(f)}];
  return{t0:S.t,end:dur,phantom:{from:o.holding?.15:.6,to:dur-.35},body:[{t:0,v:()=>easyBody(f)},{t:.4,v:()=>({...easyBody(f),crouch:1,lean:-.06}),e:eOut},{t:dur,v:()=>easyBody(f)}],arm};}
V11.step.push(()=>{for(const f of S.F){const A=f.action,P=A&&A.phantom;if(!P){if(f.phantom)f.phantom=0;continue;}const u=S.t-A.t0;
  f.phantom=sstep(clamp((u-P.from)/.35,0,1))*(1-sstep(clamp((u-P.to)/.3,0,1)));}});
// ===== ACT I, SCENES 3 AND 4 END =====
