// ===== MOTION TEST: THE DRAWN POSE =====
// A test, not part of the game (README.md). It goes into a copy of the built page after the game's own script (build_motion.py) and
// changes only what is drawn: the game's clock, its rules, its ragdolls and every number they hold are left as they are.
//
// The game poses a figure in two steps. Each step of its clock it reads the pose he is meant to be in (the keys of the action he is
// in, or his guard: where his hips, his feet, his hands and his blade should be), and then it pulls a ragdoll toward that pose with
// springs. What is drawn is the ragdoll, so what is seen is the pose arrived at late, with the sway and the settling of the springs
// in it. Here the figure is drawn in the pose itself:
//   - his hips go along the floor where the game's hips go (so he is never drawn through a table or a wall, and a shove still moves
//     him), at the height the pose asks for;
//   - his chest, head, hands and blade are set from the pose's own numbers, his elbows and knees found from them, his planted feet
//     stay where they were planted;
//   - walking, his feet come off the floor heel first and swing through as an ankle does, and his hips ride over a straighter leg;
//   - a change of pose that the game makes at once (a stance, a guard taken up, the end of a blow) is eased over a quarter of a second,
//     his head a little ahead of his body and his hands a little behind it;
//   - when he is hit hard, thrown or falls (the game lets go of the pose: f.motor), the ragdoll is drawn again, and he is eased
//     back into the pose as the game takes him up again.
// With `twos` each drawing is held for a twelfth of a second: his hips still travel every frame and a planted foot stays planted, so
// nothing slides, but the pose changes twelve times a second.
(function(){
'use strict';
const MO=window.MotionTest={
  on:true,twos:false,bones:false,dry:false,turns:true,
  // a blow in a fight: 'drawn' from its keys like the rest, 'arms' the ragdoll's arms and blade on the drawn body, 'upper' the ragdoll
  // above the hips on the drawn legs, 'ragdoll' the ragdoll whole
  blows:'upper',
  // easing a change of pose: seconds; the head's and the hands' share of it; how fast a guard may move before it counts as a change
  blend:.26,headLead:.7,armLag:1.2,footLag:.7,footW:22,jump:320,
  // rounding off an action's keys: seconds between the five moments its pose is read at (0: the keys as they stand)
  smoothBody:.04,smoothArm:.03,
  // walking. Heights of the hips are in leg lengths, the rest in the game's units (one is about 1.16 cm on Ilyas)
  walkHip:1.005,walkBob:.0175,heel:6.5,heelX:3,swing:10,
  // jogging: from jog0 to jog1 units a second the walk turns into it
  jog0:108,jog1:134,jogHip:.935,jogBob:.022,jogLean:.1,heelJog:13,heelXJog:5,swingJog:17,
  // standing easy: the hips of one who stands on bent knees (0: as the game has them)
  standHip:1.03,idle:.6,
  // when the ragdoll is drawn: under phys0 of the body's strength all of it, over phys1 none; and when the ragdoll is this far (far0
  // to far1 units) from where its own pose would have it
  phys0:.72,phys1:.98,physIn:14,physOut:6,far0:22,far1:40,farHip0:26,farHip1:46,
  // read by the page: figures drawn in the pose the last frame, milliseconds it took, the furthest a ragdoll was from its pose
  n:0,ms:0,far:0,farHip:0,rf:0};
const TAU2=Math.PI*2,UP=[CHE,HEAD,HAF,HAB,TIP],ENDS=[PEL,CHE,HEAD,HAF,HAB,TIP,FTF,FTB];
const sm=(a,b,x)=>{const u=Math.min(1,Math.max(0,(x-a)/(b-a)));return u*u*(3-2*u);};
const sm5=u=>{u=Math.min(1,Math.max(0,u));return u*u*u*(u*(u*6-15)+10);};
const pts=()=>{const a=[];for(let i=0;i<12;i++)a.push({x:0,y:0,px:0,py:0,m:1,im:1,r:3,fx:0,fy:0,vx0:0,vy0:0});return a;};
const copy=(A,B)=>{for(let i=0;i<12;i++){B[i].x=A[i].x;B[i].y=A[i].y;}};
const ST=new WeakMap();
function stOf(f){let s=ST.get(f);
  if(!s){s={K:pts(),C:pts(),Cp:pts(),dtp:0,D:pts(),Dp:pts(),O:pts(),V:pts(),R:pts(),Kl:pts(),out:pts(),show:false,had:false,t:-1,rf:-9,cb:null,w:1,ev:-9,sig:null,fa:0,rootX:0,
    ft:[{t0:-1,pre:0,dx:0,pv:0,pre0:0,dx0:0,v0:0,fresh:false,seen:false,lx:0,ly:0,vx:0,vy:0,ox:0,oy:0,ovx:0,ovy:0,ot:0},{t0:-1,pre:0,dx:0,pv:0,pre0:0,dx0:0,v0:0,fresh:false,seen:false,lx:0,ly:0,vx:0,vy:0,ox:0,oy:0,ovx:0,ovy:0,ot:0}],dip:0,sink:0,hold:pts(),holdN:-1,holdFa:0,holdY:0,sc:new Float64Array(64),scN:0,trail:[],tl:{ok:false,hx:0,hy:0,tx:0,ty:0,px:0,py:0}};ST.set(f,s);}
  return s;}
// figures the game does not pose on their own two feet are left as the game draws them
function special(f){return!!(f.mount||f.perch||f.beast||(f.puppet&&f.pup)||f.hidden||f.clinch||f.carry||f.bed||f.impaled);}
function upright(P){const dx=P[CHE].x-P[PEL].x,dy=P[CHE].y-P[PEL].y;return dy<-.6*Math.hypot(dx,dy);}
// the ankle's height through a walking swing, u from 0 to 1: up from where the heel had risen to (pre, still rising at v0 a unit
// of u), highest a quarter of the way through with the knee folded behind him, then down quickly and along the floor to the heel's
// landing
function swingLift(u,pre,v0,top){
  if(u<.25){const s=u*4,s2=s*s,s3=s2*s;return pre*(2*s3-3*s2+1)+Math.max(top,pre)*(3*s2-2*s3)+v0*.25*(s3-2*s2+s);}
  const s=(u-.25)/.75,v=1-s;return Math.max(top,pre)*v*v*v*(1+3*s);}
// what is left of a difference d0 that was changing at v0, t seconds after it began to be let go of at rate w: it keeps the pace it
// had at first and comes to rest without going past (the same curve whatever the difference: one that starts at rest eases out of it)
function fade(d0,v0,w,t){return(d0+(v0+w*d0)*t)*Math.exp(-w*t);}
// one foot: where the game planted it, or on its way to where the game will plant it
function footAt(f,s,k,G,run,dt,dir){const F=s.ft[k],q=footPath(f,F,f.steps[k],k,G,run,dt,dir);
  // (a step that begins somewhere other than where the foot was last drawn, one step cut short by the next: the difference and
  // the pace the foot had are carried and let go of)
  if(F.fresh){F.fresh=false;F.ox=F.oy=F.ovx=F.ovy=0;
    if(F.seen){const ox=F.lx+F.vx*dt-q.x,oy=F.ly+F.vy*dt-q.y,d=Math.hypot(ox,oy);if(d>1.5&&d<60){F.ox=ox;F.oy=oy;F.ovx=clamp(F.vx,-500,500);F.ovy=clamp(F.vy,-500,500);F.ot=S.t;}}}
  if(F.ox||F.oy){const u=S.t-F.ot,w=MO.footW;q.x+=fade(F.ox,F.ovx,w,u);q.y=Math.min(q.y+fade(F.oy,F.ovy,w,u),f.gr(q.x)-3);if(u>7/w)F.ox=F.oy=0;}
  if(F.seen&&dt>0){F.vx=(q.x-F.lx)/dt;F.vy=(q.y-F.ly)/dt;}else F.vx=F.vy=0;
  F.lx=q.x;F.ly=q.y;F.seen=true;return q;}
function footPath(f,F,st,k,G,run,dt,dir){
  const leg=f.leg;
  if(st.active){
    if(F.t0!==st.t0){F.t0=st.t0;F.pre0=F.pre;F.dx0=F.dx;F.v0=F.pv*st.dur;F.fresh=true;}
    F.pre=0;F.dx=0;F.pv=0;
    const u=clamp((S.t-st.t0)/st.dur,0,1),e=sstep(u),ty=f.gr(st.to.x)-3;
    if(st.walk){const sc=clamp(st.lift/(leg*GAIT.lift),.5,1);
      return{x:lerp(st.from.x+F.dx0,st.to.x,e),y:lerp(st.from.y,ty,e)-swingLift(u,F.pre0,F.v0,lerp(MO.swing,MO.swingJog,run)*sc),air:true,u,tx:st.to.x,ty,left:(1-u)*st.dur};}
    const sn=Math.sin(Math.PI*u);return{x:lerp(st.from.x,st.to.x,e),y:lerp(st.from.y,ty,e)-sn*sn*st.lift,air:true};}
  // planted. The foot that swings next comes up off its heel as the other one passes it (and, jogging, leaves the floor before the
  // other has landed); a walk that stops sets it down again
  let tp=0,tx=0,tv=0;
  if(G&&G.k===k){const uu=(S.t-G.t0)/G.beat,u0=lerp(.5,.58,run),q=clamp((uu-u0)/(1-u0),0,1),sc=.6+.4*G.along,A0=lerp(MO.heel,MO.heelJog,run)*sc;
    tp=q*q*A0;tx=dir*q*q*lerp(MO.heelX,MO.heelXJog,run)*sc;tv=q<1?2*q*A0/((1-u0)*G.beat):0;}
  if(tp>=F.pre){F.pre=tp;F.dx=tx;F.pv=tv;}else{const r=Math.max(0,1-dt*9);F.pre=Math.max(tp,F.pre*r);F.dx=F.pre>1e-3?F.dx*r:0;F.pv=0;}
  return{x:st.plant.x+F.dx,y:st.plant.y-F.pre,air:F.pre>.5};}
// a jogger's hand: the upper arm swinging from the shoulder, the elbow held near a right angle (c: +1 forward, -1 back)
function jogHand(f,che,c){const b=f.body,fa=f.facing,q=(c+1)/2,phi=lerp(-.6,.3,q),eps=lerp(1.2,1.65,q);
  return{x:che.x+fa*(b.ua*Math.sin(phi)+b.fa*Math.sin(phi+eps)),y:che.y+b.ua*Math.cos(phi)+b.fa*Math.cos(phi+eps)};}
// ---------- an action's pose about a moment ----------
// An action's keys were written for springs: each is a place to be pulled toward, and from one key to the next the game eases out
// and in, so that read as they stand the body would stop at every key. The springs round that off, late. Here it is rounded off on
// time: the pose is read at five moments about this one (MO.smooth of a second apart, the nearest weighing most) and averaged, the
// keys ahead of this moment as well as those behind it. Nothing lags and nothing overshoots.
const TAPS=[[-2,.0625],[-1,.25],[0,.375],[1,.25],[2,.0625]];
function actBody(f,A,lt){const h=MO.smoothBody,bl=(a,c,u)=>blendBody(f,a,c,u),mid=sample(A.body,lt,bl);
  if(!(h>0))return mid;
  let crouch=0,lean=0,top=0,lift=0,kw=0;
  for(const [k,w] of TAPS){const b=k?sample(A.body,lt+k*h,bl):mid;crouch+=w*b.crouch;lean+=w*b.lean;top+=w*(b.top??.96);lift+=w*(b.lift||0);kw+=w*(b.kw||0);}
  return{px:mid.px,pz:mid.pz,crouch,lean,top,lift,kw,kick:mid.kick,stF:mid.stF,stB:mid.stB,th:mid.th};}
// (called with the figure's joints changed for the drawn ones, so that a hand measured from his chest is measured from the drawn chest)
function actArm(f,A,lt){const h=MO.smoothArm,bl=(a,c,u)=>blendArm(f,a,c,u),mid=sample(A.arm,lt,bl),grip=mid.off==='grip';
  if(!(h>0)){const q=f.resolve(mid.hand);return{hand:{x:q.x,y:q.y},off:grip?null:f.resolve(mid.off),wAng:mid.wAng,tilt:mid.tilt||0};}
  let hx=0,hy=0,ox=0,oy=0,ow=0,wAng=0,tilt=0;
  for(const [k,w] of TAPS){const a=k?sample(A.arm,lt+k*h,bl):mid,q=f.resolve(a.hand);hx+=w*q.x;hy+=w*q.y;wAng+=w*a.wAng;tilt+=w*(a.tilt||0);
    if(!grip&&a.off!=='grip'){const o=f.resolve(a.off);ox+=w*o.x;oy+=w*o.y;ow+=w;}}
  return{hand:{x:hx,y:hy},off:grip||!ow?null:{x:ox/ow,y:oy/ow},wAng,tilt};}
// ---------- the pose he is meant to be in, joint for joint ----------
// The game's own reading of it (controlAndForces, sk_core.js), at this moment and not ahead of it (the game reads a little ahead, to
// give the springs time), and with nothing of the ragdoll in it but where his hips are along the floor.
function kin(f,s,dt){
  const P=f.p,b=f.body,fa=f.facing,K=s.K,leg=f.leg,arm=f.arm;
  copy(P,K);
  const A=f.action,lt=A?S.t-A.t0:0,inAct=!!A&&lt<=A.end;
  const bp=inAct?actBody(f,A,lt):f.guardBody();
  const G=inAct?null:gaitOf(f);
  const px=P[PEL].x,lift=bp.lift||0,vault=!!f.vaulting;
  let run=0,gu=0,dir=fa,wvx=0,crouch=bp.crouch,top=bp.top,lean=bp.lean;
  if(G){const WV=f.walkV,vx=WV?WV.x:f.velX,vz=WV?WV.z:(f.vdep||0);wvx=vx;run=sm(MO.jog0,MO.jog1,Math.hypot(vx,vz*.6));gu=(S.t-G.t0)/G.beat;dir=Math.sign(vx)||fa;
    // walking, the hips are highest over the planted foot and lowest as both feet are down; jogging, lowest over the planted foot and
    // highest between the feet
    crouch=lerp(MO.walkHip+MO.walkBob*Math.cos(TAU2*(gu-.42)),MO.jogHip-MO.jogBob*Math.cos(TAU2*(gu-.3)),run);top=1.2;lean+=MO.jogLean*run;}
  // standing easy the old way (hips at .97 of a leg under a lid of .96, knees bent, stock still: sk_cast.js STAND0): he stands up
  // on straight legs, as the named cast does, and breathes and shifts his weight a little, as the cast's own standing does
  else if(MO.standHip&&!inAct&&Object.prototype.hasOwnProperty.call(f,'guardBody')&&(bp.top??.96)<=.9601&&bp.crouch>=.955){
    const br=Math.sin(S.t*1.7+f.idx*1.9),sh=Math.sin(S.t*.43+f.idx*2.3);crouch=MO.standHip+br*.004*MO.idle;top=1.2;lean+=(br*.008+sh*.02)*MO.idle;}
  const want=f.pelvisY(px,bp.crouch,bp.top)-lift;
  // (a wounded leg: the game drops his hips at once while that foot is in the air and puts them back at once; here they sink and rise)
  const dip=f.wounds&&f.wounds.leg&&f.steps[0].active?f.wounds.leg*2.6:0,dr=dt*40;s.dip+=clamp(dip-s.dip,-dr,dr);
  let py=f.pelvisY(px,crouch,top)-lift-dip+s.dip;
  // his feet; walking, the one that carries him brings his hips down if they have ridden out of its reach (anywhere else a foot
  // left out of reach comes up off the floor after him: legs, below)
  const ft=[null,null],L=leg*.995;let sink=0;
  for(let k=0;k<2;k++){
    if(vault){ft[k]={x:px-fa*(k?10:2),y:py+leg*.45,air:true};continue;}
    const q=ft[k]=footAt(f,s,k,G,run,dt,dir);
    // (the foot coming down counts more and more as it nears the floor, by where it will land and where his hips will be by then)
    const wt=!G||k===G.k?0:!q.air?1:q.u!=null?sm(.45,1,q.u):0;
    if(wt>0){const dx=(q.air?q.tx-wvx*q.left:q.x)-(px+fa*(k?-2:2)),lim=(q.air?q.ty:q.y)-Math.sqrt(Math.max(64,L*L-dx*dx));if((lim-py)*wt>sink)sink=(lim-py)*wt;}}
  // (they sink to it and rise from it: a first step set down far ahead of hips that have not got going yet is a dip, not a notch)
  s.sink+=clamp(sink-s.sink,-dt*24,dt*70);py+=s.sink;
  const cx=px+fa*Math.sin(lean)*b.torso,cy=py-Math.cos(lean)*b.torso;
  K[PEL].x=px;K[PEL].y=py;K[CHE].x=cx;K[CHE].y=cy;
  // his hands, by the pose's own word for them (some are measured from his chest: the chest he is drawn with)
  let ap,hand,off=null,kp=null;const p0=f.p;f.p=K;
  try{if(inAct){ap=actArm(f,A,lt);hand=ap.hand;off=ap.off;}
    else{ap=f.guardArm();hand=f.resolve(ap.hand);if(ap.off!=='grip')off=f.resolve(ap.off);}
    if(!vault&&bp.kick&&bp.kw>.01)kp=kickPoint(f,bp.kick);}
  finally{f.p=p0;}
  hand={x:hand.x,y:hand.y};if(off)off={x:off.x,y:off.y};
  if(G&&run>0){const c=(G.cur===0?1:-1)*Math.cos(Math.PI*clamp(gu,0,1)),jh=jogHand(f,K[CHE],c),jo=jogHand(f,K[CHE],-c);
    hand.x=lerp(hand.x,jh.x,run);hand.y=lerp(hand.y,jh.y,run);if(off){off.x=lerp(off.x,jo.x,run);off.y=lerp(off.y,jo.y,run);}}
  // his head: along his spine, turned by the pose's tilt and by a glance
  const tx=fa*Math.sin(lean),ty=-Math.cos(lean),tt=(ap.tilt||0)*fa,ct=Math.cos(tt),sn=Math.sin(tt);
  let hx=(tx*ct-ty*sn)*b.neck,hy=(tx*sn+ty*ct)*b.neck;
  const lk=f.look;if(lk&&!f.dead&&S.t<lk.t0+lk.end){const a=tacTilt(tacLook(f))*fa;if(a){const ca=Math.cos(a),sa=Math.sin(a),x=hx*ca-hy*sa;hy=hx*sa+hy*ca;hx=x;}}
  K[HEAD].x=cx+hx;K[HEAD].y=cy+hy;
  hand=reachClamp(K[CHE],hand,arm*.985);
  const el=ik(K[CHE],hand,b.ua,b.fa,fa,true),wl=f.lash?f.sticks[10][2]:f.wp.len;
  K[ELF].x=el.x;K[ELF].y=el.y;K[HAF].x=hand.x;K[HAF].y=hand.y;
  // (a blade strung out on its thread is the game's own all the way: it hangs from the hand he is drawn with)
  if(f.lash){K[TIP].x=hand.x+P[TIP].x-P[HAF].x;K[TIP].y=hand.y+P[TIP].y-P[HAF].y;}
  else{K[TIP].x=hand.x+fa*Math.cos(ap.wAng)*wl;K[TIP].y=hand.y+Math.sin(ap.wAng)*wl;}
  if(!off){const wp=f.wp;off={x:hand.x+(K[TIP].x-hand.x)/wp.len*wp.off,y:hand.y+(K[TIP].y-hand.y)/wp.len*wp.off};}
  off=reachClamp(K[CHE],off,arm*.985);
  const eb=ik(K[CHE],off,b.ua,b.fa,fa,true);
  K[ELB].x=eb.x;K[ELB].y=eb.y;K[HAB].x=off.x;K[HAB].y=off.y;
  // (a blow in a fight, MO.blows. A blow's keys were tuned by eye against what the springs and the weight of the weapon made of
  // them, so drawn from the keys alone it is a smaller, tighter blow than the one the game shows. 'arms': his arms and his blade are
  // the ragdoll's own, carried on the chest he is drawn with. 'upper': all of him above the hips is the ragdoll's, carried on the
  // hips he is drawn with, so the swing and the follow-through are the game's and his legs and feet are the drawn ones)
  const fight=inAct&&!!(S.game&&S.game.ex);
  if(fight&&MO.blows==='arms'){const c=P[CHE];for(const i of [ELF,HAF,ELB,HAB,TIP]){K[i].x=cx+P[i].x-c.x;K[i].y=cy+P[i].y-c.y;}}
  else if(fight&&MO.blows==='upper'){const c=P[PEL];for(const i of [CHE,HEAD,ELF,HAF,ELB,HAB,TIP]){K[i].x=px+P[i].x-c.x;K[i].y=py+P[i].y-c.y;}}
  if(kp&&ft[0]){ft[0]={x:lerp(ft[0].x,kp.x,bp.kw),y:lerp(ft[0].y,kp.y,bp.kw),air:true};}
  K[FTF].x=ft[0].x;K[FTF].y=ft[0].y;K[FTB].x=ft[1].x;K[FTB].y=ft[1].y;
  legs(f,K);
  return{inAct,fight,G,want,vault,sig:{act:inAct?A:null,G:!!G,vault,wk:f.weaponKey,gb:f.guardBody,ga:f.guardArm}};}
// his legs under a pose: a foot his hips have left out of reach comes up off the floor toward them, the knees are found from hip and foot
function legs(f,J){const b=f.body,fa=f.facing,L=f.leg*.995;
  for(let k=0;k<2;k++){const ft=J[k?FTB:FTF],kn=J[k?KNB:KNF],hx=J[PEL].x+fa*(k?-2:2),hy=J[PEL].y,dx=ft.x-hx,dy=ft.y-hy,d=Math.hypot(dx,dy);
    if(d>L){ft.x=hx+dx/d*L;ft.y=hy+dy/d*L;}
    const q=ik({x:hx,y:hy},ft,b.th,b.sh,fa,false);kn.x=q.x;kn.y=q.y;}}
// his chest on his hips, his head on his neck, his hands within his reach, his blade its own length; his elbows found from them
function lengths(f,J,wl){const b=f.body,fa=f.facing,arm=f.arm*.985,P=J[PEL],C=J[CHE],H=J[HEAD];
  let dx=C.x-P.x,dy=C.y-P.y,d=Math.hypot(dx,dy)||1;C.x=P.x+dx/d*b.torso;C.y=P.y+dy/d*b.torso;
  dx=H.x-C.x;dy=H.y-C.y;d=Math.hypot(dx,dy)||1;H.x=C.x+dx/d*b.neck;H.y=C.y+dy/d*b.neck;
  for(const [h,e] of [[HAF,ELF],[HAB,ELB]]){const q=reachClamp(C,J[h],arm);J[h].x=q.x;J[h].y=q.y;const m=ik(C,J[h],b.ua,b.fa,fa,true);J[e].x=m.x;J[e].y=m.y;}
  if(wl>0){dx=J[TIP].x-J[HAF].x;dy=J[TIP].y-J[HAF].y;d=Math.hypot(dx,dy)||1;J[TIP].x=J[HAF].x+dx/d*wl;J[TIP].y=J[HAF].y+dy/d*wl;}}
// ---------- easing a change of pose ----------
// The game changes a pose at once (a stance, a guard taken up or let go, one action handed on to the next) and leaves the springs to
// make a movement of it. Here the difference between what was being drawn and the new pose is kept, with the pace each joint had,
// and let go of (fade, above; MO.blend is the time nine tenths of it takes): measured from his hips, so it travels with him, his
// feet where they stand on the floor. His head lets go of it sooner than his body and his hands later.
function ease(f,s,info,dt,fresh){
  const K=s.K,C=s.C,O=s.O,V=s.V,Kl=s.Kl,fa=f.facing,sig=info.sig,p=s.sig,kx=K[PEL].x,ky=K[PEL].y;
  const reset=fresh||!s.had||fa!==s.fa||Math.abs(kx-s.rootX)>40;
  let ev=false;
  if(!reset){
    if(sig.act!==p.act||sig.G!==p.G||sig.vault!==p.vault||sig.wk!==p.wk||sig.gb!==p.gb||sig.ga!==p.ga)ev=true;
    else if(!sig.act){const lim=3+MO.jump*dt;for(const i of UP){if(Math.hypot((K[i].x-kx)*fa-Kl[i].x,K[i].y-ky-Kl[i].y)>lim){ev=true;break;}}}}
  for(const i of UP){Kl[i].x=(K[i].x-kx)*fa;Kl[i].y=K[i].y-ky;}
  const w0=3.89/MO.blend,u0=S.t-s.ev,live=u0<7/w0*Math.max(1,MO.armLag);
  if(reset){s.ev=-9;for(let i=0;i<12;i++){O[i].x=O[i].y=V[i].x=V[i].y=0;}}
  else if(ev){
    // (from where the drawn pose was going: what it was the frame before, carried on at the pace it had)
    const Cp=s.Cp,r=s.dtp>0?1/s.dtp:0,cx=C[PEL].x,cy=C[PEL].y,qx=Cp[PEL].x,qy=Cp[PEL].y,lim=v=>clamp(v,-420,420);
    for(const i of UP){const lx=(C[i].x-cx)*fa,ly=C[i].y-cy,vx=lim((lx-(Cp[i].x-qx)*fa)*r),vy=lim((ly-(Cp[i].y-qy))*r);O[i].x=lx+vx*dt-Kl[i].x;O[i].y=ly+vy*dt-Kl[i].y;V[i].x=vx;V[i].y=vy;}
    for(const i of [FTF,FTB]){const vx=lim((C[i].x-Cp[i].x)*r),vy=lim((C[i].y-Cp[i].y)*r);O[i].x=C[i].x+vx*dt-K[i].x;O[i].y=C[i].y+vy*dt-K[i].y;V[i].x=vx;V[i].y=vy;}
    {const vy=lim((cy-qy)*r);O[PEL].x=0;O[PEL].y=cy+vy*dt-ky;V[PEL].x=0;V[PEL].y=vy;}
    // (the pace a joint had is the pose's own where the pose it came from was moving: only what the new pose does not have is kept)
    s.ev=S.t;}
  s.sig=sig;s.fa=fa;s.rootX=kx;s.had=true;copy(C,s.Cp);s.dtp=dt;
  const u=S.t-s.ev;
  if(!(ev||live)||u>7/w0*Math.max(1,MO.armLag)){copy(K,C);return;}
  const wb=w0,wh=w0/MO.headLead,wa=w0/MO.armLag,wf=w0/MO.footLag;
  C[PEL].x=kx;C[PEL].y=ky+fade(O[PEL].y,V[PEL].y,wb,u);
  for(const i of UP){const w=i===CHE?wb:i===HEAD?wh:wa;C[i].x=kx+(Kl[i].x+fade(O[i].x,V[i].x,w,u))*fa;C[i].y=C[PEL].y+Kl[i].y+fade(O[i].y,V[i].y,w,u);}
  for(const i of [FTF,FTB]){C[i].x=K[i].x+fade(O[i].x,V[i].x,wf,u);C[i].y=Math.min(K[i].y+fade(O[i].y,V[i].y,wf,u),f.gr(C[i].x)-3);}
  lengths(f,C,f.lash?0:f.wp.len);legs(f,C);}
// ---------- the blade's blur ----------
// The game keeps the blur of a quick blade as the ragdoll's blade swept it (recordTrail, sk_core.js). A figure drawn in his pose has
// his blade somewhere else, so his blur is kept here the same way, by the same rule, from the blade he is drawn with: a step of the
// game's clock at a time, between where the blade was drawn the frame before and where it is drawn now.
function blur(f,s,out,dt,fresh){
  const tr=s.trail,L=s.tl,h=out[HAF],t=out[TIP],pl=out[PEL];
  for(const e of tr)e.age+=dt;while(tr.length&&tr[0].age>tr[0].life)tr.shift();
  if(!fresh&&dt>0&&L.ok&&f.motor>.3&&!(f.lash||(f.arc&&S.t<f.arc.t0+f.arc.lock[0])||(f.sheath&&S.t<f.sheath.t0+f.sheath.out))){
    const sp=Math.hypot(t.x-L.tx,t.y-L.ty)/dt,rel=Math.hypot(t.x-L.tx-(pl.x-L.px),t.y-L.ty-(pl.y-L.py))/dt,fl=f.flair&&S.t>=f.flair.from&&f.flair.trail!==false;
    if(fl?rel>240:sp>330){const n=Math.max(1,Math.min(8,Math.round(dt/DT))),k=fl?.12:.3;
      for(let j=1;j<=n;j++){const u=j/n,hx=lerp(L.hx,h.x,u),hy=lerp(L.hy,h.y,u),tx=lerp(L.tx,t.x,u),ty=lerp(L.ty,t.y,u),back=(n-j)*DT;
        tr.push({hx:lerp(hx,tx,k),hy:lerp(hy,ty,k),tx,ty,age:back,life:fl?.24:.1,c:fl?f.color:null,t:S.t-back});}}}
  L.hx=h.x;L.hy=h.y;L.tx=t.x;L.ty=t.y;L.px=pl.x;L.py=pl.y;L.ok=true;}
// ---------- one figure, one frame ----------
function figure(f,rf,now){
  const P=f.p;if(!P||P.length<12||f.gone)return null;
  const s=stOf(f);
  if(special(f)){s.show=false;s.rf=-9;s.had=false;return null;}
  const fresh=s.rf!==rf-1,dt=fresh?0:S.t-s.t;
  // (no time has passed, a pause or a blow's freeze: as he was drawn)
  if(!fresh&&dt<=0){s.rf=rf;return s.show?s:null;}
  s.rf=rf;s.t=S.t;
  // (the game's own posing ran for him this step: it leaves a new record of the pose each time it does)
  const cb=f.curBody,stepped=!!cb&&(cb!==s.cb||fresh);s.cb=cb;
  const can=stepped&&!f.dead&&!f.downed&&S.t>=(f.knockUntil||0)&&upright(P);
  let wT=1,info=null;
  if(can){info=kin(f,s,dt);wT=info.fight&&MO.blows==='ragdoll'?1:1-sm(MO.phys0,MO.phys1,f.motor==null?1:f.motor);
    // where the ragdoll is against where its own pose would have it: far off, the game has him somewhere this reading does not know of
    let m=0;const mh=Math.abs(P[PEL].y-info.want);
    for(let k=0;k<2;k++){const st=f.steps[k];if(!st.active&&!f.vaulting){const q=P[k?FTB:FTF];m=Math.max(m,Math.hypot(q.x-st.plant.x,q.y-st.plant.y));}}
    if(m>MO.far)MO.far=m;if(mh>MO.farHip)MO.farHip=mh;
    wT=Math.max(wT,sm(MO.far0,MO.far1,m),sm(MO.farHip0,MO.farHip1,mh));}
  s.w=fresh?wT:wT>s.w?Math.min(wT,s.w+dt*MO.physIn):Math.max(wT,s.w-dt*MO.physOut);
  const D=s.D,Dp=s.Dp,C=s.C,R=s.R,w=s.w;copy(D,Dp);
  // (R: how far each drawn joint stands from the ragdoll's. When the game lets go of him outright, a blow that puts him down, there
  // is no pose left to read: what was drawn rides on the ragdoll from where it was, and is given up over a few frames)
  if(!info){s.ft[0].seen=s.ft[1].seen=false;}
  if(info){ease(f,s,info,dt,fresh);for(let i=0;i<12;i++){R[i].x=C[i].x-P[i].x;R[i].y=C[i].y-P[i].y;}}
  else if(s.had&&w<.999)for(let i=0;i<12;i++){C[i].x=P[i].x+R[i].x;C[i].y=P[i].y+R[i].y;}
  else s.had=false;
  if(!s.had||w>=.999){copy(P,D);copy(P,C);s.had=false;s.ev=-9;}
  else if(w<=.001)copy(C,D);
  else{const wm=sm(.5,1,w);
    for(const i of ENDS){D[i].x=lerp(C[i].x,P[i].x,w);D[i].y=lerp(C[i].y,P[i].y,w);}
    lengths(f,D,f.lash?0:f.wp.len);legs(f,D);
    for(const i of [ELF,ELB,KNF,KNB]){D[i].x=lerp(D[i].x,P[i].x,wm);D[i].y=lerp(D[i].y,P[i].y,wm);}}
  // how fast each joint is going, as the painters read it (his hair, the glow of a quick hand)
  const kv=fresh||dt<=0?0:DT/dt;
  for(let i=0;i<12;i++){const q=D[i];q.px=q.x-(q.x-Dp[i].x)*kv;q.py=q.y-(q.y-Dp[i].y)*kv;if(Math.abs(q.x-q.px)>30){q.px=q.x;q.py=q.y;}}
  const drawn=s.had&&w<.999;
  if(!drawn&&!MO.twos){s.show=false;s.tl.ok=false;s.trail.length=0;return null;}
  // what is handed to the painters
  const out=s.out;
  if(MO.twos){const n=Math.floor(now*12/1000),H=s.hold,fa=f.facing;
    if(fresh||s.holdN!==n||s.holdFa!==fa||!s.show){s.holdN=n;s.holdFa=fa;s.holdY=D[PEL].y;for(let i=0;i<12;i++){H[i].x=D[i].x-D[PEL].x;H[i].y=D[i].y-D[PEL].y;}}
    const rx=D[PEL].x,ry=s.holdY;
    for(let i=0;i<12;i++){out[i].x=rx+H[i].x;out[i].y=ry+H[i].y;}
    // (a planted foot stays where it is planted)
    if(info&&drawn&&!info.vault)for(let k=0;k<2;k++)if(!f.steps[k].active){const i=k?FTB:FTF;out[i].x=D[i].x;out[i].y=D[i].y;}
    if(drawn)legs(f,out);
    for(let i=0;i<12;i++){out[i].px=out[i].x-(D[i].x-D[i].px);out[i].py=out[i].y-(D[i].y-D[i].py);}}
  else for(let i=0;i<12;i++){const q=D[i],o=out[i];o.x=q.x;o.y=q.y;o.px=q.px;o.py=q.py;}
  for(let i=0;i<12;i++){const o=out[i],q=P[i];o.m=q.m;o.im=q.im;o.r=q.r;}
  // (the arm that is gone: the game keeps its two joints on his chest, and the painters count on finding them there)
  if(f.oneArm){const c=out[CHE];for(const i of [ELB,HAB]){const o=out[i];o.x=c.x;o.y=c.y;o.px=c.px;o.py=c.py;}}
  blur(f,s,out,dt,fresh);
  s.show=true;return s;}
// ---------- the two bodies as lines (MO.bones) ----------
// The ragdoll the game has (red) and the pose he is drawn in (white), over the picture: what the test changes, seen bare.
const BONES=[[PEL,CHE],[CHE,HEAD],[CHE,ELF],[ELF,HAF],[CHE,ELB],[ELB,HAB],[PEL,KNF],[KNF,FTF],[PEL,KNB],[KNB,FTB],[HAF,TIP]];
function bones(sw){
  const k=cv.width/cam.viewW,L=cam.x-cam.viewW/2,T=camTop();
  ctx.save();ctx.setTransform(k,0,0,k,-L*k,-T*k);ctx.lineCap='round';
  const line=(J,col,w)=>{ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();for(const [a,b] of BONES){ctx.moveTo(J[a].x,J[a].y);ctx.lineTo(J[b].x,J[b].y);}ctx.stroke();
    ctx.fillStyle=col;for(const i of [PEL,CHE,HEAD,KNF,KNB,FTF,FTB,HAF,HAB]){ctx.beginPath();ctx.arc(J[i].x,J[i].y,w*1.1,0,TAU2);ctx.fill();}};
  for(let i=0;i<sw.length;i+=3){const f=sw[i],P=sw[i+1],s=sw[i+2];ctx.save();ctx.translate(f.dep*PSX,-f.dep*PSY);
    if(MO.bones!=='new')line(P,'rgba(255,70,60,.9)',1.5);line(s.out,'rgba(255,255,255,.95)',1.5);ctx.restore();}
  ctx.restore();}
// the joints of one figure as the page last drew him and as the game has him (for the test's own checks)
MO.joints=f=>{const s=ST.get(f);return{shown:!!(s&&s.show),w:s?s.w:1,out:s&&s.show?s.out.map(q=>[q.x,q.y]):null,sim:f.p.map(q=>[q.x,q.y])};};
// ---------- turning round ----------
// The game draws Ilyas turning round through the front view when it changes the way he faces, and changes everyone else over at
// once. The cast's painter can be drawn turned as his can (it is, in a spin), so with the test on the cast turn round as he does.
{const ta=turnsAround;turnsAround=function(f){return ta(f)||(MO.on&&MO.turns&&typeof FigKit!=='undefined'&&typeof castOn==='function'&&castOn(f)&&!f.beast);};}
// ---------- the frame ----------
// Each figure's joints are changed for the drawn ones while the game's own render runs, and put back after it. His scarf, which the
// game hangs from the ragdoll's neck, is carried across to the neck he is drawn with and put back to the last digit.
const R0=render;
render=function(){
  if(!MO.on){if(!MO.dry)R0();return;}
  const t0=performance.now(),sw=[];MO.rf++;
  try{
    for(const f of S.F){const s=figure(f,MO.rf,t0);if(!s)continue;
      const P=f.p,o=s.out,sc=f.scarf,dx=o[CHE].x-P[CHE].x,dy=o[CHE].y-P[CHE].y;
      s.scN=0;if(sc&&sc.length&&sc.length<=16){const B=s.sc;let j=0;for(const q of sc){B[j++]=q.x;B[j++]=q.y;B[j++]=q.px;B[j++]=q.py;q.x+=dx;q.y+=dy;q.px+=dx;q.py+=dy;}s.scN=sc.length;}
      s.tr0=S.trails[f.idx];if(s.tr0)S.trails[f.idx]=s.trail;
      sw.push(f,P,s);f.p=o;}
    MO.n=sw.length/3;MO.ms=performance.now()-t0;
    if(MO.dry)return;
    R0();
    if(MO.bones)bones(sw);}
  finally{
    for(let i=0;i<sw.length;i+=3){const f=sw[i],s=sw[i+2];f.p=sw[i+1];if(s.tr0){S.trails[f.idx]=s.tr0;s.tr0=null;}
      if(s.scN){const sc=f.scarf,B=s.sc;let j=0;for(let k=0;k<s.scN&&k<sc.length;k++){const q=sc[k];q.x=B[j++];q.y=B[j++];q.px=B[j++];q.py=B[j++];}}}}};
})();
