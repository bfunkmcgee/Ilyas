// ===== UNDER THE CITY START (since V105) =====
// Asked for in V105, under the city: the goblins chasing the train on a hand-pumped rail cart (Ilyas throws one of them into their
// pump lever and the cart flips); the line crossing a flooded cistern on an old trestle the goblins have been chewing, which goes down
// a section at a time right behind the flatcar; and the end of the line: the goblins cut the brakes, the train smashes through the
// buffer stop into Ixet's camp, and Ilyas leaps clear at the last second. The cart is a set piece of the line's fight (setPiece,
// sk_lantern.js), the trestle and the brakes the line's end, the crash the deep station's opening; what they leave in the world is the
// game's, here, and the page draws it (sk_underui.js, envx/env_tunnel.js, envx/env_station.js, envx/veh_train.js).

// ---------- the line behind the car ----------
// The flatcar's tail is in the picture now: its deck ends at LINE_REAR (the tunnel's painter draws the end beam, the buffers and a red
// tail lamp there), and behind it the line goes away into the dark, its rails' top at LINE_RT (the bed is 40 under the deck).
const LINE_REAR=-30,LINE_RT=GB+43;
// whoever is off the back of the car stands, falls and lies on the line's bed, not on the deck (f.offCar); left lying there, he is
// left behind at the line's speed (f.leftBehind) and goes out of the picture into the dark
{const gr=Fighter.prototype.gr;Fighter.prototype.gr=function(x){return this.offCar?LINE_RT:gr.call(this,x);};}
V11.step.push(()=>{if(S.arenaKey!=='tunnel')return;const v=Math.abs(S.scrollV||0)*DT;if(!v)return;
  for(const f of S.F){if(!f.leftBehind||f.carry)continue;for(const q of f.p){q.x-=v;q.px-=v;}if(f.scarf)for(const q of f.scarf){q.x-=v;q.px-=v;}f.station-=v;
    if(f.p[PEL].x<-1600){f.hidden=true;f.leftBehind=false;}}});

// ---------- the trolley ----------
// A handcar off the old line: a plank deck on four iron wheels, an A frame in its middle and the walking beam across its top that two
// goblins pump at either end, facing each other; a third crouched at its front with a hook, and a stolen crystal lamp swinging from the
// frame. It comes up out of the dark behind the car and holds just off its tail; then Ilyas takes a goblin off the deck by the scruff
// and throws it onto the beam: the beam stops dead, the front wheels dig in, and the cart goes over end over end, its crew thrown off
// it onto the line, and all of it is left behind in the dark.
// (sizes in world units: its length, half its width (its wheels on the line's rails, 154 apart), its deck over the rails, the beam's
// pivot over the deck and half its length, how far off the tail it holds, its wheels; T.x is its middle, in the car's own frame)
const TROLLEY={L:120,hw:82,lift:16,pv:44,arm:30,hold:46,wr:9,dep:93};
S.trolley=null;V11.duelStart.push(()=>{S.trolley=null;});
function trolleyHold(){return LINE_REAR-TROLLEY.hold-TROLLEY.L/2;}
function trolleyDeckY(){return LINE_RT-TROLLEY.lift;}
// a point of the trolley (x, y in the world as it stands) as it is now: turned over its front axle as it goes over (flipA), and lifted
// as it is thrown up (flipY)
function trolleyXf(T){const a=T.flipA||0,cx=T.x+TROLLEY.L/2-14,cy=LINE_RT-TROLLEY.wr,ca=Math.cos(a),sa=Math.sin(a),dy=T.flipY||0;
  return(x,y)=>a||dy?{x:cx+(x-cx)*ca-(y-cy)*sa,y:cy+(x-cx)*sa+(y-cy)*ca-dy}:{x,y};}
// the walking beam: its pivot and the two handle ends as it rocks (the near end down as the far one goes up)
function trolleyBeam(T){const pv={x:T.x,y:trolleyDeckY()-TROLLEY.pv},r=T.stuck??Math.sin(T.pump)*.36,c=Math.cos(r)*TROLLEY.arm,s=Math.sin(r)*TROLLEY.arm;
  return{pv,rock:r,back:{x:pv.x-c,y:pv.y+s},front:{x:pv.x+c,y:pv.y-s}};}
function trolleyNew(){const T={x:trolleyHold()-900,pump:0,state:'come',t0:S.t,flipA:0,flipY:0,stuck:null,lamp:0,crew:[]};
  // its crew: drawn goblins, not fighters (the fight does not have them), posed each step from the cart and its beam
  const R=mulberry32(9301);
  for(let i=0;i<3;i++){const g=new Fighter(90+i,1,'Goblin','#a7c98a');g.beast='goblin';g.facing=i===1?-1:1;
    g.setup(1+Math.floor(R()*9998),i===2?'hook':'fists',1,T.x,i===2?52:TROLLEY.dep);g.motor=0;g.role=i===0?'back':i===1?'front':'hook';T.crew.push(g);}
  return T;}
// a drawn goblin put in its pose: its feet where they stand, its hips over them, its back bent to its hands, its head up; the game's
// ik bends its knees and its elbows; then the whole of it turned with the cart if the cart is going over
function gobPose(g,o,xf){const b=g.body,fa=g.facing,leg=g.leg,y=o.y,x=o.x,p=g.p;
  const ff={x:x+fa*leg*(o.stF??.3),y:y-3},fb={x:x-fa*leg*(o.stB??.26),y:y-3},pel={x:x+fa*(o.hip||0),y:y-leg*o.crouch};
  const ln=o.lean,che={x:pel.x+fa*Math.sin(ln)*b.torso,y:pel.y-Math.cos(ln)*b.torso},hl=ln*.4-(o.up||0),hd={x:che.x+fa*Math.sin(hl)*b.neck,y:che.y-Math.cos(hl)*b.neck};
  const reach=b.ua+b.fa-.8,hf=reachClamp(che,o.hf,reach),hb=reachClamp(che,o.hb||o.hf,reach);
  const Q={[PEL]:pel,[CHE]:che,[HEAD]:hd,[FTF]:ff,[FTB]:fb,[HAF]:hf,[HAB]:hb};
  Q[KNF]=ik(pel,ff,b.th,b.sh,fa,false);Q[KNB]=ik(pel,fb,b.th,b.sh,fa,false);Q[ELF]=ik(che,hf,b.ua,b.fa,fa,true);Q[ELB]=ik(che,hb,b.ua,b.fa,fa,true);
  const L=g.wp.len||0,wa=o.wAng??Math.atan2(hf.y-Q[ELF].y,hf.x-Q[ELF].x);Q[TIP]={x:hf.x+Math.cos(wa)*Math.max(L,1),y:hf.y+Math.sin(wa)*Math.max(L,1)};
  for(let i=0;i<p.length;i++){const q=Q[i];if(!q)continue;const w=xf?xf(q.x,q.y):q;p[i].x=p[i].px=w.x;p[i].y=p[i].py=w.y;}
  g.station=p[PEL].x;}
// the crew thrown as the cart goes over: as it stops dead under them each goes on at the speed it had (in the car's frame, where it
// was), up off its feet and over, down onto the line's bed, and the bed takes it away into the dark at the line's speed (g.fling:
// its hips' x and y, how fast, how far over and how fast it turns)
function crewFling(T){const R=mulberry32(4471);
  for(const g of T.crew){const p=g.p[PEL];g.fling={x:p.x,y:p.y,vx:20+R()*50,vy:-(170+R()*130),a:0,w:(R()<.5?-1:1)*(4+R()*4)};}}
function flingStep(g,v){const F=g.fling,gy=LINE_RT-8;
  F.vy+=980*DT;F.x+=F.vx*DT;F.y+=F.vy*DT;F.a+=F.w*DT;
  if(F.y>=gy){F.y=gy;if(F.vy>140){F.vy*=-.25;F.w*=.6;}else F.vy=0;
    // (down on the bed: it takes him back at its own speed, and he comes to lie on his back or his face)
    F.vx+=(-v-F.vx)*(1-Math.exp(-DT*7));const lie=Math.round((F.a-Math.PI/2)/Math.PI)*Math.PI+Math.PI/2;F.w=0;F.a+=(lie-F.a)*(1-Math.exp(-DT*16));}
  if(F.x<-1700)g.hidden=true;}
function trolleyCrewPose(T){const xf=trolleyXf(T),B=trolleyBeam(T),dy=trolleyDeckY(),up=B.rock;
  for(const g of T.crew){if(g.hidden)continue;
    if(g.fling){// arms and legs flung out, the whole of him turned about his hips
      const F=g.fling,ca=Math.cos(F.a),sa=Math.sin(F.a),fx=(x,y)=>({x:F.x+(x-F.x)*ca-(y-F.y)*sa,y:F.y+(x-F.x)*sa+(y-F.y)*ca});
      gobPose(g,{x:F.x,y:F.y+g.leg*.7,crouch:.7,lean:-.35,up:.4,hf:{x:F.x+g.facing*30,y:F.y-50},hb:{x:F.x-g.facing*26,y:F.y-44},stF:.56,stB:.5},fx);continue;}
    if(g.role==='back'){const h=B.back;gobPose(g,{x:T.x-TROLLEY.arm-12,y:dy,crouch:.66+up*.22,lean:.62+up*.5,hf:{x:h.x,y:h.y},hb:{x:h.x-2,y:h.y+1.5},stF:.24,stB:.3},xf);}
    else if(g.role==='front'){const h=B.front;gobPose(g,{x:T.x+TROLLEY.arm+12,y:dy,crouch:.66-up*.22,lean:.62-up*.5,hf:{x:h.x,y:h.y},hb:{x:h.x+2,y:h.y+1.5},stF:.24,stB:.3},xf);}
    else{// the one at the front: down on its haunches, a hand on the cart's front, the hook out at the car's tail
      const sw=Math.sin(S.t*5.3)*.25,reachT=T.state==='chase'?1:0;
      gobPose(g,{x:T.x+TROLLEY.L/2-14,y:dy,crouch:.5,lean:.7,up:.5,hf:{x:T.x+TROLLEY.L/2+24+reachT*10,y:dy-40-reachT*14+sw*10},hb:{x:T.x+TROLLEY.L/2-4,y:dy-2},wAng:-.9+sw,stF:.34,stB:.34},xf);}}}
V11.step.push(()=>{const T=S.trolley;if(!T||T.state==='gone')return;const v=Math.abs(S.scrollV||0),hold=trolleyHold();
  if(T.state==='come'){T.x+=(hold-T.x)*(1-Math.exp(-DT*1.7));T.pump+=DT*11;if(T.x>hold-6)T.state='chase';}
  else if(T.state==='chase'){T.x+=(hold+Math.sin(S.t*1.7)*5-T.x)*(1-Math.exp(-DT*3));T.pump+=DT*8.5;}
  else if(T.state==='flip'){const u=S.t-T.flipT;
    // the front digs in: it stops dead on the line, so the car runs on away from it (it falls behind at the line's speed, as it slows),
    // and it goes over its front wheels end over end, thrown up
    T.flipA=Math.min(Math.PI*2.4,u*u*7+u*3.4);T.flipY=Math.max(0,u*190-u*u*300);T.x-=v*DT*Math.min(1,u*3);
    if(T.x<-1700)T.state='gone';}
  T.lamp=clamp(T.lamp+DT*2,0,1);
  for(const g of T.crew)if(g.fling&&!g.hidden)flingStep(g,v);
  trolleyCrewPose(T);});
// the goblins on the deck that one could take: on their feet, free, not still coming down onto it
function trolleyGob(K){let best=null,bd=1e9;
  for(const f of foes()){if(f.beast!=='goblin'||!setPieceFree(f)||f.walkIn||f.offstage||f.dropT||f.hidden||notHereYet(f))continue;
    const d=Math.abs(f.station-LINE_REAR)*.6+Math.abs(f.station-K.station)*.4;if(d<bd){bd=d;best=f;}}
  return best;}
// the turns of the line's fight so far
V11.turnStart.push(()=>{const sv=S.story;if(sv&&sv.key==='line'&&sv.step==='fight')sv.lineTurns=(sv.lineTurns||0)+1;});
setPiece({stage:'line',key:'trolley',
  due(sv){const K=hero();return(sv.lineTurns||0)>=5&&setPieceFree(K)&&!K.mount&&!!trolleyGob(K);},
  *run(sv){const K=hero(),G=sv.trolleyG=trolleyGob(K),a=K.arm,rear=LINE_REAR;letter(1);
    for(const f of [K,G]){f.guarding=false;f.counter=false;f.intent=null;}
    // a squeal and clank coming up the line behind: the cart, its lamp swinging, its crew pumping for all they are worth; the camera
    // goes back over the tail to the line behind it (C.x0: past the stage's own left edge)
    const T=S.trolley=trolleyNew();S.hooks.sound('trolley',1);
    camTo(30,660,1.4);Object.assign(S.camCut,{x0:-560,band:{top:GB-250,foot:GB+80},bandN:{top:GB-290,foot:GB+110},xn:-40,wn:370});
    // the goblin on the deck runs back to its tail to help them aboard; he goes after it
    const gx=rear+44,gz=TROLLEY.dep,kx=gx+46;
    yield* all(stepTo(G,gx,gz,190),(function*(){yield* wait(.25);yield* stepTo(K,kx,gz,175);})(),until(()=>T.state==='chase',2.6));
    G.facing=-1;K.facing=-1;K.station=kx;K.lane=gz;G.station=gx;G.lane=gz;S.hooks.sound('squeal',1,{s:'goblin_squeal'});
    // the scruff: up off its feet in his off hand, held out in front of him, and away over the tail
    const grip=()=>({x:G.p[CHE].x+G.body.torsoW*.4,y:lerp(G.p[CHE].y,G.p[HEAD].y,.3)});
    K.action={t0:S.t,end:1.15,body:[{t:0,v:()=>K.curBody||K.guardBody()},{t:.2,v:{px:kx,pz:gz,crouch:.8,lean:.3,stF:.34*K.leg,stB:-.36*K.leg,th:.32},e:eOut},
        {t:.48,v:{px:kx+4,pz:gz,crouch:.88,lean:-.08,stF:.28*K.leg,stB:-.42*K.leg,th:.4},e:sstep},{t:.66,v:{px:kx-10,pz:gz,crouch:.8,lean:.36,stF:.42*K.leg,stB:-.4*K.leg,th:.36},e:eIn},
        {t:1.15,v:()=>K.guardBody(),e:sstep}],
      // (his off hand takes it by the scruff; the blade stays in the other, down at his side, out of the way)
      arm:[{t:0,v:K.curArm},{t:.2,v:{hand:{sh:[.16*a,.5*a]},wAng:1.3,off:{fn:grip},tilt:.05},e:eOut},
        {t:.48,v:{hand:{sh:[0,.36*a]},wAng:1.4,off:{sh:[.3*a,-.34*a]},tilt:-.12},e:sstep},
        {t:.66,v:{hand:{sh:[.24*a,.46*a]},wAng:1.1,off:{sh:[.95*a,-.08*a]},tilt:.12},e:eIn},{t:1.15,v:()=>K.guardArm(),e:sstep}]};
    // (off its feet: it goes with his hand, then flies)
    G.downed=true;G.knockUntil=Infinity;G.motor=.02;G.wasDown=true;G.action=null;G.posture='off';
    G.carry={t0:S.t+.2,dur:.28,from:{x:G.p[PEL].x,y:G.p[PEL].y},apex:{x:kx-8,y:K.p[CHE].y-4},to:{x:kx-18,y:K.p[CHE].y-14},spin:-.6};
    yield* wait(.5);
    // onto the beam, end over end
    // (off the car: out of the stage's own bounds, onto the line's ground: offstage, offCar)
    const B=trolleyBeam(T),lev={x:B.pv.x+2,y:B.pv.y-8},p=G.p[PEL],air=.5;G.offCar=true;G.offstage=true;
    G.carry={t0:S.t,dur:air,from:{x:p.x,y:p.y},apex:{x:lerp(p.x,lev.x,.45),y:Math.min(p.y,lev.y)-46},to:lev,spin:-Math.PI*2.1};G.station=lev.x;G.zMax=null;
    S.hooks.sound('swing',2,{s:'swing_heavy'});
    yield* wait(air);
    // the beam stops dead on it, the front wheels dig in, and over it goes, its crew thrown off
    T.state='flip';T.flipT=S.t;T.stuck=T.stuck??trolleyBeam(T).rock;crewFling(T);S.slowT=Math.max(S.slowT,1.2);S.shake=Math.max(S.shake,6);S.freeze=Math.max(S.freeze,.06);
    S.hooks.sound('clang',1.4,{s:'clang'});S.hooks.sound('trolley_crash',1,{delay:.08});S.hooks.sound('squeal',1,{s:'goblin_squeal',delay:.05});
    sparks({x:lev.x,y:lev.y+6},18,'#ffd27a',TROLLEY.dep);sparks({x:T.x+TROLLEY.L/2-14,y:LINE_RT-2},26,'#ffcf86',TROLLEY.dep+70);
    const ns=S.stains.length,ni=S.items.length;sceneKill(G,-1);S.stains.length=ns;S.items.length=ni;G.leftBehind=true;
    // (it goes with the cart, back into the dark)
    G.carry={t0:S.t,dur:.9,from:{x:lev.x,y:lev.y},apex:{x:lev.x-40,y:lev.y-50},to:{x:lev.x-320,y:LINE_RT-6},spin:-Math.PI*1.6};
    yield* wait(.5);K.facing=-1;lookAt(K,-.6,1.2);
    yield* wait(.9);},
  // (skipped: the trolley gone, and the goblin he took gone with it)
  skip(sv){const T=S.trolley;if(T)T.state='gone';const G=sv.trolleyG;if(G){if(!G.dead){const ns=S.stains.length,ni=S.items.length;sceneKill(G,-1);S.stains.length=ns;S.items.length=ni;}G.carry=null;G.hidden=true;G.leftBehind=false;}
    const K=hero();K.action=null;K.zMax=null;}});

// ---------- the trestle ----------
// Past the fight the line slows and comes out of its tunnel into an old flooded cistern, high over the black water on a timber trestle
// the goblins have been chewing; behind the car's tail each section of it goes down into the water as soon as the car is off it, all
// the way across, and the far wall's tunnel takes the car in again. S.cistern: where it is along the line (x0 to x1, line x: the
// screen's x plus S.scroll), and when each section went (falls[k], a section k from x0 + k CIS.sec).
const CIS={sec:80,len:1840,lag:6,water:150};
S.cistern=null;V11.duelStart.push(()=>{S.cistern=null;});
V11.step.push(()=>{const C=S.cistern;if(!C)return;const tail=(S.scroll||0)+LINE_REAR,n=Math.floor((C.x1-C.x0)/CIS.sec);
  for(let k=C.next||0;k<n&&C.x0+(k+1)*CIS.sec<tail-CIS.lag;k++){C.falls[k]=S.t;C.next=k+1;
    if(!S.warming&&S.t-(C.snd||-9)>.18){C.snd=S.t;S.hooks.sound('timber',.7+.3*(k%3===0),{delay:.05});}
    if(k%2===1&&!S.warming)S.hooks.sound('splash',.6,{delay:.55});}});
function cisAt(xw){const C=S.cistern;return!!C&&xw>=C.x0&&xw<=C.x1;}

// ---------- the brakes ----------
// Off the trestle and into the tunnel again, a goblin clinging to the car's near side at its bogie saws through the brake hose: the
// air goes out of it in a shriek, and the train cannot stop. S.brakeCut: when the goblin is there, when the hose parted, when it let
// go; its goblin is drawn (g), and drops and is gone under the car.
S.brakeCut=null;V11.duelStart.push(()=>{S.brakeCut=null;});
const BRAKE={x:236,y:GB+30,dep:-8};
function brakeGob(){const g=new Fighter(94,1,'Goblin','#b8c97a');g.beast='goblin';g.facing=-1;g.setup(4417,'shiv',1,BRAKE.x+22,BRAKE.dep);g.motor=0;return g;}
V11.step.push(()=>{const B=S.brakeCut;if(!B||!B.g||B.g.hidden)return;const g=B.g,v=Math.abs(S.scrollV||0);
  // its feet on the bogie's frame, a hand on the sole bar, the spike at the hose; its face turned up to him; let go, it drops and the
  // line takes it
  const saw=B.cut==null?Math.sin(S.t*24)*4:0,lx=BRAKE.x+26;
  let xf=null;if(B.drop!=null){const u=S.t-B.drop;g.dropX=(g.dropX||0)+v*DT*Math.min(1,u*3);const dy=Math.min(60,300*u*u);xf=(x,y)=>({x:x-g.dropX,y:y+dy});if(g.dropX>1500)g.hidden=true;}
  gobPose(g,{x:lx,y:GB+38,crouch:.6,lean:.28,up:.85,hb:{x:lx-4,y:GB+6},hf:{x:BRAKE.x+4+saw,y:BRAKE.y+saw*.4},wAng:Math.PI*.95,stF:.3,stB:.18},xf);
  g.dep=BRAKE.dep;});
// his look over the car's edge: down on one knee at the side, leaning out over it, his hands on his knee and the deck
function edgeLook(K){const x=K.station,z=K.lane,a=K.arm,P={px:x,pz:z,crouch:.5,lean:.66,stF:.4*K.leg,stB:-.34*K.leg,th:.3},A={hand:{sh:[.3*a,.78*a]},wAng:1.4,off:{sh:[.62*a,.62*a]},tilt:0};
  return{t0:S.t,end:30,quiet:true,body:bodyKeys(K,[[0,K.curBody||easyBody(K)],[.45,P,eOut],[30,P]]),arm:armKeys(K,[[0,K.curArm||easyArm(K)],[.45,A,eOut],[30,A]])};}

// ---------- the line's end ----------
// The last goblin down: he rolls the blade up and goes back along the deck to the tail as the brakes go on for the trestle; the tunnel
// opens out over the cistern, and the trestle goes down behind the car all the way across; in the tunnel again, the goblin at the
// brakes, and the train running on into the dark.
function* lineEnd(st){const K=hero();letter(1);camTo(450,900,1);
  K.guarding=false;K.counter=false;
  yield* wait(.3);
  yield* act(K,rollUpAction(K,S.t));stowBlade(K);standEasy(K);K.zMax=null;
  // the brakes on for the old trestle, the tunnel opening out ahead; he walks back to the tail meanwhile
  S.story.brake=S.t;S.hooks.sound('brake',1);
  const slow=until(()=>{S.scrollV=Math.max(320,S.scrollV-DT*420);return S.scrollV<=320;},3);
  S.cistern={x0:(S.scroll||0)+1150,x1:(S.scroll||0)+1150+CIS.len,falls:{},next:0};
  camTo(200,960,.9);Object.assign(S.camCut,{x0:-420,band:{top:GB-300,foot:GB+190},bandN:{top:GB-380,foot:GB+230},xn:120,wn:420});
  const B=S.brakeCut={x:BRAKE.x,t0:null,cut:null,drop:null,g:null};
  yield* all(stepToEasy(K,LINE_REAR+80,100,150),(function*(){
    yield* all(slow,until(()=>S.cistern.x0-(S.scroll||0)<700,4));S.hooks.sound('cistern',1);
    // out over the water; the first of the trestle goes behind the tail, and he turns to watch it go
    yield* until(()=>S.cistern.x0-(S.scroll||0)<LINE_REAR+40,5);
    camTo(-130,780,.8);Object.assign(S.camCut,{x0:-600,band:{top:GB-280,foot:GB+200},bandN:{top:GB-330,foot:GB+240},xn:-50,wn:400});
    // the collapse chasing the tail all the way across, and the far wall's mouth coming by
    yield* until(()=>S.cistern.x1-(S.scroll||0)<LINE_REAR-140,8);})());
  // the tunnel again; at the near side's bogie, a goblin at the brake hose
  B.t0=S.t;B.g=brakeGob();K.facing=1;
  camTo(BRAKE.x+70,560,.9);Object.assign(S.camCut,{band:{top:GB-190,foot:GB+120},bandN:{top:GB-230,foot:GB+150},xn:BRAKE.x+56,wn:300});
  S.hooks.sound('goblin_chitter',1);yield* stepToEasy(K,BRAKE.x+96,22,170);K.facing=-1;
  // he goes down on a knee at the edge to look over it; it looks up at him, and the hose parts
  K.action=edgeLook(K);yield* wait(.55);
  B.cut=S.t;S.hooks.sound('cable_snap',1);S.hooks.sound('hose',1);S.shake=Math.max(S.shake,2);
  yield* wait(.55);B.drop=S.t;S.hooks.sound('squeal',.8,{s:'goblin_squeal'});
  yield* wait(.45);
  // and the train runs on downhill into the dark with nothing to stop it
  S.hooks.sound('rail_fast',1);
  const fast=until(()=>{S.scrollV=Math.min(1100,S.scrollV+DT*520);return S.scrollV>=1100;},2.2);
  const dark=(function*(){yield* wait(1.1);const t0=S.t;while(S.t<t0+.9){S.fade=(S.t-t0)/.9;yield;}S.fade=1;})();
  yield* all(fast,dark);K.action=null;}
// (a walk in a scene, standing easy, straight there)
function* stepToEasy(f,x,z,v){yield* goTo(f,x,z,v,{direct:true});}
function lineEndSkip(st){S.cistern=null;S.brakeCut=null;S.trolley=null;const K=hero();if(K)K.action=null;}

// ---------- the crash ----------
// The deep station, the end of the line under the tower: the main line ends at a buffer stop in the pit's far end, and past it, in the
// mouth of the old depot's bore, Ixet has his camp (envx/env_station.js draws it). The train comes out of the line's bore at speed with
// no brakes (its light grows in the bore first: S.boreLight); Ilyas leaps off the flatcar onto the platform at the last moment, and
// the engine goes through the buffer stop and into the camp, its nose reared up on the wreck, and the flatcar off its rails. S.wreck:
// when it hit, and the engine and the car as they lie (the train's own tilt: T.tilt, T.carTilt, T.carDrop).
const BUF={x:600,stop:58,tilt:.11};
// the train's speed coming in; where he is when he is up again on the platform (the skip puts him there)
const DEEP_RUN=520,DEEP_LAND={x:492,z:112};
S.wreck=null;S.boreLight=0;V11.duelStart.push(()=>{S.wreck=null;S.boreLight=0;});
// the impact: the buffer stop goes, the engine ploughs on into the camp and rears up on what it has gone through, the car jumps its
// rails; dust, sparks, the crystal core spitting
function trainCrash(T){const t=S.t;S.wreck={t0:t,x:BUF.x,v0:T.v};
  S.shake=Math.max(S.shake,24);S.shakeDir={x:1,y:.4};S.freeze=Math.max(S.freeze,.1);if(!S.warming)S.punch={x:prjX(BUF.x,T.dep),t:0};
  S.hooks.sound('crash_train',1.6);S.hooks.sound('boom',1,{kind:'charge',delay:.04});S.hooks.sound('rattle',1.2,{delay:.25});S.hooks.sound('glass',1,{s:'glass_large',delay:.1});
  const P=q=>({x:q.x,y:q.y});
  sparks(P({x:BUF.x,y:T.gy-30}),40,'#ffd27a',T.dep);sparks(P({x:BUF.x-20,y:T.gy-80}),24,'#bff8ff',T.dep-10);flash({x:BUF.x,y:T.gy-50},60,'#fff0d0',T.dep);
  for(let i=0;i<6;i++)dust(BUF.x-60+i*24,T.gy-6,2.2,T.dep-30,'rgba(130,118,100,.7)');
  S.booms.push({x:BUF.x+20,y:T.gy-50,dep:T.dep+12,t0:t,size:1.1,seed:7707,kind:'charge'});
  // the camp's fire scattered: coals burning on in the pit round the wreck
  S.fires.push({x:BUF.x+46,y:T.gy-4,dep:T.dep+30,w:30,h:40,seed:83,k:.7});S.fires.push({x:BUF.x-34,y:T.gy-2,dep:T.dep-6,w:18,h:26,seed:89,k:.55});}
V11.step.push(()=>{const W=S.wreck,T=S.story&&S.story.train;if(!W||!T)return;const u=S.t-W.t0;
  if(T.v>0){T.v=Math.max(0,T.v-W.v0*W.v0/(2*BUF.stop)*DT);}
  T.tilt=BUF.tilt*sstep(clamp(u/.32,0,1))*(1+.12*Math.exp(-u*5)*Math.sin(u*30));T.carTilt=-.035*sstep(clamp((u-.05)/.3,0,1));T.carDrop=7*sstep(clamp((u-.05)/.3,0,1));
  // her lamp guttering and her core going in fits; now and then it spits
  T.lamp=u<.25?1:.12+.2*Math.max(0,Math.sin(S.t*23)*Math.sin(S.t*7.7));T.run=.25+.55*Math.max(0,Math.sin(S.t*5.3)*Math.sin(S.t*1.9+1));
  if(!S.warming&&u>.6&&Math.random()<DT*2.2)sparks({x:T.x-170+Math.random()*60,y:T.gy-118},3,'#bff8ff',T.dep-30);});
// his leap: down onto his legs on the car, out over the pit's edge toward us with his knees tucked, and down onto the platform's
// mosaic on his feet and a hand, sliding with what the train gave him; then up
function leapOff(K,land){const x=K.station,z=K.lane,L=K.leg*.55;
  const body=bodyKeys(K,[[0,K.curBody||K.guardBody()],[.12,'overSet',{px:x+20,pz:z},eOut],[.3,'overSpring',{px:x+90,pz:lerp(z,land.z,.35),lift:L*.6},eOut],
    [.52,'overTop',{px:x+170,pz:lerp(z,land.z,.75),lift:L},sstep],[.76,'overLand',{px:land.x,pz:land.z},eIn],
    [1.2,{px:land.x+44,pz:land.z,crouch:.5,lean:.46,stF:.46*K.leg,stB:-.5*K.leg,th:.42},sstep],[1.9,'guard',{px:land.x+50,pz:land.z},sstep]]);
  const a=K.arm,arm=armKeys(K,[[0,K.curArm||K.guardArm()],[.3,'leap',eOut],[.76,{hand:{sh:[.5*a,.2*a]},wAng:.8,off:{sh:[.3*a,1.05*a]},tilt:0},eIn],
    [1.2,{hand:{sh:[.42*a,.3*a]},wAng:.9,off:{fn:()=>({x:K.p[PEL].x+18,y:K.gr(K.p[PEL].x)-2})},tilt:0},sstep],[1.9,'guard',sstep]]);
  return{t0:S.t,end:1.9,body,arm,quiet:true};}
function* deepCrash(st){const K=hero(),T=S.story.train,SL=stationLook(),M=SL&&SL.LAYOUT&&SL.LAYOUT.MAIN||{x0:178,x1:706};
  letter(1);camTo(430,900,0);Object.assign(S.camCut,{xn:250,wn:360});S.fade=1;
  // in the bore, coming: its light growing in the arch's mouth and the rails singing, then out of it at speed with no brakes
  T.v=0;T.run=1;S.boreLight=0;
  const fade=(function*(){const t0=S.t;while(S.t<t0+.5){S.fade=1-(S.t-t0)/.5;yield;}S.fade=0;})();
  yield* all(fade,until(()=>{S.boreLight=Math.min(1,S.boreLight+DT/1.1);return S.boreLight>=1;},1.4));
  S.hooks.sound('rail_fast',1);T.v=DEEP_RUN;
  // he is on the flatcar's front and sees the end of the line coming
  yield* until(()=>K.station>M.x0+14,3);
  S.slowT=Math.max(S.slowT,2.4);S.camCut.xn=430;S.camCut.k=1.2;
  // the leap, at the last moment
  {const i=T.riders.indexOf(K);if(i>=0)T.riders.splice(i,1);}K.zMax=290;
  const land={x:DEEP_LAND.x-50,z:DEEP_LAND.z};K.action=leapOff(K,land);S.hooks.sound('vault',1);
  yield* all(until(()=>{if(K.dep<200)K.pitClip=null;return T.x>=BUF.x;},2),until(()=>K.dep<200,1));K.pitClip=null;
  trainCrash(T);S.camCut.xn=560;S.boreLight=0;
  yield* wait(.8);K.zMax=null;K.station=land.x+50;K.lane=land.z;dust(K.p[FTF].x,K.gr(K.p[FTF].x),1.4,K.dep);
  yield* until(()=>!K.action,2);
  // out of the smoke of what was his camp
  const X=S.F.find(f=>f.beast==='lizard');
  camTo(470,860,1.2);Object.assign(S.camCut,{xn:560,wn:380});
  if(X){X.hidden=false;yield* goTo(X,st.spawn[1][0],st.spawn[1][1],70);X.offstage=false;X.zMax=null;}
  for(const f of S.F)if(f.team===1&&f.beast==='goblin'&&f.hidden){f.hidden=false;f.setup(f.seed,f.weaponKey,f.skill,f.station,f.lane);dropIn(f,200);f.walkIn=false;yield* wait(.3);}
  yield* wait(.4);K.offstage=false;K.facing=1;}
// (skipped: as it lies)
function deepCrashSkip(st){const K=hero(),T=S.story.train;if(T){T.riders.length=0;T.v=0;T.x=BUF.x+BUF.stop-2;T.tilt=BUF.tilt;T.carTilt=-.035;T.carDrop=7;}
  if(!S.wreck)S.wreck={t0:S.t-5,x:BUF.x,v0:0};S.boreLight=0;
  S.fade=0;K.pitClip=null;K.zMax=null;K.action=null;K.station=DEEP_LAND.x;K.lane=K.dep=DEEP_LAND.z;K.facing=1;K.offstage=false;K.build();
  for(const f of S.F)if(f.team===1&&f.hidden){const sp=st.spawn[f.idx]||[f.station,f.lane];f.hidden=false;f.offstage=false;f.zMax=null;f.setup(f.seed,f.weaponKey,f.skill,sp[0],sp[1]);f.action=null;}}
// ===== UNDER THE CITY END =====
