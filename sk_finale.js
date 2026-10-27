// ===== FINALE START =====
// The executive and the last scene. Mr. Hallowell never fights: he sits behind his desk through the office fight on a puppet controller
// (every point of his ragdoll is driven to a pose by springs, so he holds his seat whatever happens around him). When his head of
// security is down, beginFinale() plays the last scene: Kael slams his face on the desk, hauls him over it onto the floor, he begs on
// his knees, and the player chooses to spare him or behead him. The scene ends the fight with endFight(true) after setting S.endText.
// Contract: EXEC {name,color}; officeSetup(sp,party) appends the executive to S.F as a Fighter with npc=true and hc={seed,weapon:'fists',
// skill,temper}; officeCardLine(); beginFinale(); S.finale holds the scene's state (S.finale.step==='choice' while it waits for the
// player); finaleChoose('spare'|'behead') makes the choice. S.hooks.finale(kind,info) tells the UI (banner, choice panel, log).
const EXEC={name:'Mr. Hallowell',color:'#d8cfa8'};
S.finale=null;S.hooks.finale=()=>{};
const PI2=Math.PI/2,dirv=a=>({x:Math.cos(a),y:Math.sin(a)});
const execOf=()=>S.F.find(f=>f.npc&&f.puppet)||S.F.find(f=>f.npc)||null;

// ---------- the desk, as it stands in the room ----------
function deskInfo(){
  const P=S.props.find(p=>p.type==='desk'&&!p.broken),hw=DESK.hw;let rad=4,top=GB-DESK.h-rad;
  if(P&&P.segs&&P.segs.length){const s=P.segs[0],a=P.pts[s[0]],b=P.pts[s[1]];rad=s[2];top=Math.min(a.y,b.y)-rad;}
  return{x0:DESK.x-hw,x1:DESK.x+hw,top,rad,under:top+2*rad,P};
}

// ---------- the puppet ----------
// A pose is a bag of numbers: the pelvis (x,y), the screen angle of each bone (-PI/2 is straight up: torso aT and neck aN, the front and
// back arm uF,fF,uB,fB, the thighs and shins tF,sF,tB,sB), how stiff each part is (wp pelvis, wc chest, wh head, wa arms, wl legs:
// 0 limp, 1 held), an optional pin for the head (kx,ky with weight kw: Kael's hand) and the depth to stand at. Each bone hangs from
// the body as it is, so a body that lags its pose keeps its shape. Poses blend number by number.
const QK=['x','y','aT','aN','uF','fF','uB','fB','tF','sF','tB','sB','wp','wc','wh','wa','wl','kx','ky','kw','tz'];
const ANG={aT:1,aN:1,uF:1,fF:1,uB:1,fB:1,tF:1,sF:1,tB:1,sB:1};
function lerpQ(a,b,u){const o={};for(const k of QK){const av=a[k],bv=b[k];
  if(av==null||bv==null){o[k]=bv==null?av:bv;continue;}
  let d=bv-av;if(ANG[k]){while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;}
  o[k]=av+d*u;}return o;}
const angTo=(a,b)=>Math.atan2(b.y-a.y,b.x-a.x);
// the two bone angles of a limb from its root to a wanted end point, bent the way the game's own IK bends it
function limbA(root,end,a,c,fa,isArm){const E=ik(root,end,a,c,fa,isArm);return[angTo(root,E),angTo(E,end)];}
// the pose the body is actually in
function fitQ(f){const p=f.p,X=f.pup,q=X.Q||{};
  return{x:p[PEL].x,y:p[PEL].y,aT:angTo(p[PEL],p[CHE]),aN:angTo(p[CHE],p[HEAD]),uF:angTo(p[CHE],p[ELF]),fF:angTo(p[ELF],p[HAF]),uB:angTo(p[CHE],p[ELB]),fB:angTo(p[ELB],p[HAB]),
    tF:angTo(p[PEL],p[KNF]),sF:angTo(p[KNF],p[FTF]),tB:angTo(p[PEL],p[KNB]),sB:angTo(p[KNB],p[FTB]),
    wp:q.wp??1,wc:q.wc??1,wh:q.wh??1,wa:q.wa??1,wl:q.wl??1,kx:p[HEAD].x,ky:p[HEAD].y,kw:0,tz:f.dep};}
// where every point wants to be for a pose; with abs the chain hangs from the pose's own pelvis, else from the body as it is
function xTargets(f,Q,abs){
  const p=f.p,b=f.body,fa=f.facing,t={pel:{x:Q.x,y:Q.y}},P=abs?t.pel:p[PEL],at=(o,a,l)=>({x:o.x+Math.cos(a)*l,y:o.y+Math.sin(a)*l});
  t.che=at(P,Q.aT,b.torso);const C=abs?t.che:p[CHE];
  t.head=at(C,Q.aN,b.neck);if(Q.kw>0)t.head={x:lerp(t.head.x,Q.kx,Q.kw),y:lerp(t.head.y,Q.ky,Q.kw)};
  t.elF=at(C,Q.uF,b.ua);t.hand=at(abs?t.elF:p[ELF],Q.fF,b.fa);t.elB=at(C,Q.uB,b.ua);t.off=at(abs?t.elB:p[ELB],Q.fB,b.fa);
  t.knF=at({x:P.x+fa*2,y:P.y},Q.tF,b.th);t.ftF=at(abs?t.knF:p[KNF],Q.sF,b.sh);
  t.knB=at({x:P.x-fa*2,y:P.y},Q.tB,b.th);t.ftB=at(abs?t.knB:p[KNB],Q.sB,b.sh);
  t.tip=at(t.hand,Q.fF,f.wp.len);
  return t;
}
function puppetSnap(f,Q){
  const t=xTargets(f,Q,true),p=f.p,put=(i,v)=>{const q=p[i];q.x=q.px=v.x;q.y=q.py=v.y;q.fx=q.fy=0;};
  put(PEL,t.pel);put(CHE,t.che);put(HEAD,t.head);put(ELF,t.elF);put(HAF,t.hand);put(ELB,t.elB);put(HAB,t.off);put(KNF,t.knF);put(FTF,t.ftF);put(KNB,t.knB);put(FTB,t.ftB);put(TIP,t.tip);
  f.dep=f.lane=Q.tz;f.vdep=0;
}
function puppetQ(f){
  const X=f.pup;let Q=X.pose(f,X);
  if(X.bl){const u=(S.t-X.bl.t0)/X.bl.dur;if(u>=1)X.bl=null;else Q=lerpQ(X.bl.from,Q,(X.bl.e||sstep)(Math.max(0,u)));}
  X.Q=Q;return Q;}
// switch to another pose, blended over dur seconds from where the last one stood (fit: from where the body actually is)
function puppetGo(f,pose,dur,o){o=o||{};const X=f.pup,from=o.fit||!X.Q?fitQ(f):X.Q;X.pose=pose;X.t0=S.t;X.bl=dur>0?{from:{...from},t0:S.t,dur,e:o.e}:null;}
// the springs: the same ones the other fighters' muscles use, but with the pose handed in and the strength of each part in it
const PW={w:30,z:.8,wB:16,zB:.95};
function puppetForces(f){
  const X=f.pup,p=f.p,b=f.body,fa=f.facing=-1,Q=puppetQ(f);
  f.motor=1;f.knockUntil=-1;f.wasDown=false;f.velX=0;
  // rebuilt or knocked far from its place: back into the pose at once
  if(!Number.isFinite(p[PEL].x+p[HEAD].y)||Math.hypot(p[PEL].x-Q.x,p[PEL].y-Q.y)>160||Math.hypot(p[HEAD].x-p[PEL].x,p[HEAD].y-p[PEL].y)>200)puppetSnap(f,Q);
  const t=xTargets(f,Q,false),{w,z,wB,zB}=PW;
  for(const q of p){q.fx=0;q.fy=0;}
  spring(p[PEL],t.pel,3*b.mass,wB,zB,Q.wp,null,0);
  spring(p[CHE],t.che,3*b.mass,w*1.05,z,Q.wc,p[PEL],.35);
  spring(p[HEAD],t.head,1.2*b.mass,w,z,Q.wh,p[CHE],.3);
  spring(p[ELF],t.elF,.8*b.mass,w*.9,z,Q.wa,p[CHE],.4);spring(p[HAF],t.hand,.6*b.mass,w,z,Q.wa,p[CHE],.4);
  spring(p[ELB],t.elB,.8*b.mass,w*.9,z,Q.wa,p[CHE],.4);spring(p[HAB],t.off,.6*b.mass,w,z,Q.wa,p[CHE],.4);
  spring(p[TIP],t.tip,.8*b.mass,w,z,Q.wa,p[HAF],.3);
  spring(p[KNF],t.knF,1.2*b.mass,w*.9,z,Q.wl,p[PEL],.3);spring(p[FTF],t.ftF,.9*b.mass,w*1.3,.9,Q.wl,p[PEL],.15);
  spring(p[KNB],t.knB,1.2*b.mass,w*.9,z,Q.wl,p[PEL],.3);spring(p[FTB],t.ftB,.9*b.mass,w*1.3,.9,Q.wl,p[PEL],.15);
  // depth: eased to the pose's
  f.dep+=(Q.tz-f.dep)*Math.min(1,8*DT);f.vdep=0;f.lane=f.dep;
  // what the rest of the game reads from every fighter
  f.curBody={px:Q.x,pz:Q.tz,crouch:.5,lean:0,stF:0,stB:0,th:.2,lift:0,kw:0};
  f.curArm={hand:{w:{x:t.hand.x,y:t.hand.y}},wAng:0,off:{w:{x:t.off.x,y:t.off.y}},tilt:0};
  Object.assign(f.dbg,{pel:t.pel,che:t.che,head:t.head,elF:t.elF,hand:t.hand,tip:t.tip,elB:t.elB,off:t.off,knF:t.knF,knB:t.knB,ftF:t.ftF,ftB:t.ftB});
}
// the puppet takes over a fighter's muscles; a dead one goes back to the ordinary (limp) ones
const _caf=controlAndForces;
controlAndForces=function(f){if(f.puppet&&!f.dead&&f.pup){puppetForces(f);return;}_caf(f);};

// ---------- sitting ----------
// the pose for the desk: seat, knees under the top, feet flat, torso upright and a little back, hands steepled on the desk end
function seatGeom(f){const b=f.body,D=deskInfo();
  return{hipY:GB-3-b.sh+1,kx:EXEC_SEAT.x-b.th,D,hx:D.x1-5,hy:D.top-3.8};}
function poseSeat(f,X){
  const b=f.body,t=S.t,G=seatGeom(f),br=Math.sin(t*1.5+.7),fl=X.fl,ln=X.ln,sl=X.sl||0,tie=X.tie||0,fa=-1;
  const tapN=X.tap&&t<X.tap.until?Math.abs(Math.sin((t-X.tap.at)*11))*(1-clamp((t-X.tap.at)/(X.tap.until-X.tap.at),0,1)*.3):0;
  const P={x:EXEC_SEAT.x+2*fl+.3*br-2*sl,y:G.hipY+.4*br},aT=-PI2+.03+.17*fl-.42*ln-.93*sl+.011*br,C={x:P.x+Math.cos(aT)*b.torso,y:P.y+Math.sin(aT)*b.torso};
  // a hand goes up to the knot of the tie and tugs it straight
  const ux=Math.cos(aT),uy=Math.sin(aT),tg={x:C.x-ux*5+uy*9,y:C.y-uy*5-ux*9+1.2*Math.sin(t*14)*tie},hx=G.hx-3*ln-40*sl,hy=G.hy;
  const hF={x:lerp(hx,tg.x,tie),y:lerp(hy-4*fl,tg.y,tie)};
  const [uF,fF]=limbA(C,hF,b.ua,b.fa,fa,true),[uB,fB]=limbA(C,{x:hx+4,y:hy-1.6*tapN-4*fl},b.ua,b.fa,fa,true);
  const [tF,sF]=limbA({x:P.x+fa*2,y:P.y},{x:G.kx+3,y:GB-3},b.th,b.sh,fa,false),[tB,sB]=limbA({x:P.x-fa*2,y:P.y},{x:G.kx+6,y:GB-3},b.th,b.sh,fa,false);
  return{x:P.x,y:P.y,aT,aN:-PI2-.05+.3*fl-.12*ln-.8*sl+X.look+.01*br,uF,fF,uB,fB,tF,sF,tB,sB,wp:1,wc:1,wh:1,wa:1,wl:1,kx:0,ky:0,kw:0,tz:EXEC_SEAT.d};
}
// small life while he sits: his head follows the fight, now and then a tap of the fingers, a flinch at a crash or a hard hit on Kade,
// and he leans in when Kade is winning
function seatLife(f){
  const X=f.pup,t=S.t,K=hero(),B=S.F.find(o=>o.boss);
  X.fl=Math.max(0,X.fl-DT*1.6);
  if(!S.warming){
    if(B&&X.bossHp!=null&&X.bossHp-B.hp>=B.maxHp*.1)X.fl=Math.min(1,X.fl+.8);
    if(B)X.bossHp=B.hp;
    if(S.shake>X.shakeSeen+3&&S.shake>5)X.fl=Math.min(1,X.fl+clamp(S.shake/16,.3,1));
    X.shakeSeen=S.shake;}
  const want=B&&K&&!B.dead?clamp((B.hp/B.maxHp-K.hp/K.maxHp)*1.5,0,.7):0;X.ln+=(want-X.ln)*Math.min(1,.8*DT);
  // the head follows the fight: a little further down the closer it comes
  const ps=S.F.filter(o=>!o.npc&&!o.dead&&o.team!==undefined&&!o.gone),cx=ps.length?ps.reduce((s,o)=>s+o.p[PEL].x,0)/ps.length:400;
  const near=clamp(1-(EXEC_SEAT.x-cx)/520,0,1),lk=-.03-.1*near+.035*Math.sin(t*.45+1.1);X.look+=(lk-X.look)*Math.min(1,2*DT);
  if(X.tap&&t>=X.tap.until)X.tap=null;
  if(!X.tap&&t>=X.nextTap){X.tap={at:t,until:t+1.1+X.r()*.8};X.nextTap=t+6+X.r()*8;}
}
function puppetInit(f){
  f.puppet=true;f.facing=-1;f.motor=1;
  f.pup={fl:0,ln:0,look:-.05,tap:null,nextTap:S.t+4,bossHp:null,shakeSeen:S.shake,r:mulberry32(4242),pose:poseSeat,bl:null,Q:null,t0:S.t};
  const Q=poseSeat(f,f.pup);f.pup.Q=Q;puppetSnap(f,Q);
}
function officeSetup(sp,party){
  const f=new Fighter(S.F.length,1,EXEC.name,EXEC.color);f.npc=true;f.hc={seed:4242,weapon:'fists',skill:1,temper:'plain'};
  Object.assign(f,{seed:4242,weaponKey:'fists',skill:1});S.F.push(f);initFighter(f,[EXEC_SEAT.x,EXEC_SEAT.d,1],sp);
  f.facing=-1;f.station=EXEC_SEAT.x;f.lane=EXEC_SEAT.d;f.entering=true;f.build();puppetInit(f);}
function officeCardLine(){return`${BOSS.name} is waiting`;}
// every step: the seated life while he is seated
V11.step.push(()=>{const X=execOf();if(X&&X.pup&&X.pup.pose===poseSeat)seatLife(X);});

// ---------- poses for the scene ----------
// the point at distances ra from A and rb from B (the chest between the head and the pelvis), the upper of the two
function ccp(A,ra,B,rb){const dx=B.x-A.x,dy=B.y-A.y,d=Math.max(1e-6,Math.hypot(dx,dy)),x=clamp((ra*ra-rb*rb+d*d)/(2*d),-ra,ra),h=Math.sqrt(Math.max(0,ra*ra-x*x)),ux=dx/d,uy=dy/d,
  p1={x:A.x+ux*x-uy*h,y:A.y+uy*x+ux*h},p2={x:A.x+ux*x+uy*h,y:A.y+uy*x-ux*h};return p1.y<p2.y?p1:p2;}
// held by the head: the face on the desk, the body lying along it behind the head, the legs trailing; H.s lifts the hips out of the seat
// and up onto the desk, H.limp lets the body go slack as it is drawn over the edge
function poseHaul(f,X){
  const b=f.body,H=X.H,D=deskInfo(),L=b.neck+b.torso-.8,hd={x:H.kx,y:H.ky},seat={x:EXEC_SEAT.x-2,y:GB-EXEC_SEAT.h-8};
  const flat={x:hd.x+L*.995,y:Math.min(hd.y+L*.1,D.top-7)};
  let p0={x:lerp(seat.x,flat.x,H.s),y:lerp(seat.y,flat.y,H.s)};
  const dd=Math.hypot(p0.x-hd.x,p0.y-hd.y);if(dd>L)p0={x:hd.x+(p0.x-hd.x)/dd*L,y:hd.y+(p0.y-hd.y)/dd*L};
  const C=ccp(hd,b.neck,p0,b.torso),aT=angTo(p0,C),aN=angTo(C,hd),ld=angTo(hd,p0),w=1-H.limp;
  const [uF,fF]=limbA(C,{x:hd.x-24,y:D.top-4},b.ua,b.fa,-1,true),[uB,fB]=limbA(C,{x:hd.x-12,y:D.top-4},b.ua,b.fa,-1,true);
  // the legs: trailing behind the hips as he is lifted, then along the desk top and over its right end
  const endX=D.x1+10,lane=D.top-5,k=sstep((endX+18-p0.x)/30),path=(s0,dy)=>{const run=endX-p0.x;return s0<=run?{x:p0.x+s0,y:lane+dy}:{x:endX,y:lane+dy+s0-run};};
  const trail=(ang,len,o)=>({x:o.x+Math.cos(ang)*len,y:o.y+Math.sin(ang)*len}),leg=(a1,a2,dy)=>{
    const t1=trail(ld+a1,b.th,p0),t2=trail(ld+a2,b.sh,t1),q1=path(b.th,dy),q2=path(b.th+b.sh,dy);
    const kn={x:lerp(t1.x,q1.x,k),y:lerp(t1.y,q1.y,k)},ft={x:lerp(t2.x,q2.x,k),y:lerp(t2.y,q2.y,k)};return[angTo(p0,kn),angTo(kn,ft)];};
  const lo=Math.max(.05-ld,.1),[tF,sF]=leg(lo,lo+.45,0),[tB,sB]=leg(lo-.04,lo+.35,-1.5);
  return{x:p0.x,y:p0.y,aT,aN,uF,fF,uB,fB,tF,sF,tB,sB,wp:H.s<1?1:.12+.5*w,wc:.1+.6*w,wh:1.7,wa:.1+.25*w,wl:.08+.8*w,kx:hd.x,ky:hd.y,kw:H.kw,tz:EXEC_SEAT.d};
}
// no muscle at all: a body that has been let go
function poseLimp(f,X){return{...fitQ(f),wp:0,wc:0,wh:0,wa:0,wl:0,kw:0};}
// on his knees facing Kael: knees on the floor under the hips, shins flat behind, back straight, hands up and shaking
function poseKneel(f,X){
  const b=f.body,t=S.t,t0=X.t0,tr=Math.sin(t*23)*.8+Math.sin(t*37+1)*.5,K=X.kn,a=.18,kneeY=GB-5.5,py=kneeY-b.th*Math.cos(a)+.6*Math.sin(t*1.9);
  const P={x:K.x+.3*tr,y:py},aT=-PI2+.07+.012*tr,C={x:P.x+Math.cos(aT)*b.torso,y:P.y+Math.sin(aT)*b.torso},up=clamp((t-t0)/1.3,0,1)*K.up;
  const [uF,fF]=limbA(C,{x:C.x-24-2*up+.8*tr,y:C.y-6-4*up},b.ua,b.fa,-1,true),[uB,fB]=limbA(C,{x:C.x-18-2*up+.6*tr,y:C.y+4-3*up},b.ua,b.fa,-1,true);
  return{x:P.x,y:P.y,aT,aN:-PI2-.1+K.look+.02*tr,uF,fF,uB,fB,tF:PI2+a,sF:.07,tB:PI2+a-.08,sB:.06,wp:1,wc:1,wh:1,wa:1,wl:1,kx:0,ky:0,kw:0,tz:K.tz};
}
// spared: he folds forward onto his hands
function poseSlump(f,X){
  const b=f.body,t=S.t,K=X.kn,a=.18,py=GB-5.5-b.th*Math.cos(a),u=sstep((t-X.t0)/.9),th=lerp(0,1.3,u),tr=(1-u*.6)*(Math.sin(t*23)*.6+Math.sin(t*37+1)*.4);
  const P={x:K.x+3*u,y:py+3*u},aT=-PI2-th,C={x:P.x+Math.cos(aT)*b.torso,y:P.y+Math.sin(aT)*b.torso};
  const [uF,fF]=limbA(C,{x:C.x-8-10*u,y:GB-4},b.ua,b.fa,-1,true),[uB,fB]=limbA(C,{x:C.x+2-10*u,y:GB-4},b.ua,b.fa,-1,true);
  return{x:P.x,y:P.y,aT,aN:aT-.25*u-.1*(1-u)+.02*tr,uF,fF,uB,fB,tF:PI2+a,sF:.07,tB:PI2+a-.08,sB:.06,wp:1,wc:1,wh:1,wa:1,wl:1,kx:0,ky:0,kw:0,tz:K.tz};
}

// ---------- the scene ----------
const FIN_LINES=[['Wait. Wait.',.25,1.2],['Name a number. Lumen Vast will double it.',1.2,1.55],['Please. I have grandchildren.',2.6,1.9]];
const STEPS=['settle','walk','reach','slam','haul','drop','kneel','choice'];
function say(F,text,life){const X=F.X,h=X.p[HEAD],sx=prjX(h.x,X.dep),hw=text.length*5.6+12;
  S.callouts.push({i:X.idx,text,age:0,life:life||1.8,dx:Math.min(0,W-6-hw-sx)+Math.max(0,hw+6-sx),fin:1});}
function flog(kind){S.hooks.log({type:'finale',kind});}
function go(F,step){F.step=step;F.ts=S.t;S.hooks.finale('step',F);}
// what Kael and Amri hold when it starts: their own weapons, upright
function readyHero(h,own){
  if(h.downed&&!h.carry)standUp(h);
  h.carry=null;h.guarding=h.counter=h.circleGuard=false;h.covering=null;h.intent=null;h.driveSel=null;
  if(own&&h.weaponKey!==own)h.setWeapon(own);if(own)S.items=S.items.filter(it=>!(it.owner===h.idx&&it.key===own));
  h.ownWeapon=null;if(h.idx===0)h.sidearm='sheathed';}
function beginFinale(){
  const g=S.game,K=hero(),X=execOf(),M=S.F.find(f=>f.team===0&&f.ally&&!f.dead&&!f.gone)||null;
  g.phase='finale';g.ex=null;g.aiAt=null;S.opening=null;S.queued=null;for(const f of S.F)f.intent=null;
  readyHero(K,S.cfg.hero.weapon);if(M)readyHero(M,S.cfg.ally.weapon);
  K.facing=1;if(M)M.facing=1;
  const D=deskInfo();
  S.finale={step:'settle',t0:S.t,ts:S.t,K,X,M,D,cb:null,ca:null,kx:K.p[PEL].x,mx:M?M.p[PEL].x:0,walkX:Math.min(OFFICE.maxX,D.x0-26),lines:0,fx:{},smear:null,choice:null,autoAt:null,endAt:null,ended:false};
  if(X&&X.pup){X.pup.sl=0;X.pup.tie=0;}
  S.hooks.finale('begin',S.finale);flog('down');
}
// Kael is driven by one live action: his pose for this step is kept in F.cb (body) and F.ca (arm); the beats set the targets
function kdrive(F,T,rate){
  const K=F.K,r=1-Math.exp(-(rate||12)*DT),C=K.p[CHE],a=K.arm,cb=F.cb,ca=F.ca;
  if(!cb){F.cb={...K.curBody};F.ca={hx:K.curArm.hand.w?K.curArm.hand.w.x:C.x+20,hy:K.curArm.hand.w?K.curArm.hand.w.y:C.y+30,wa:K.curArm.wAng,ox:C.x+10,oy:C.y+34,tl:0};return kdrive(F,T,rate);}
  if(T.b.px!=null)cb.px=T.b.px;
  for(const k of ['pz','crouch','lean','stF','stB','th'])if(T.b[k]!=null)cb[k]+=(T.b[k]-cb[k])*r;
  cb.lift=0;cb.kw=0;
  const ra=T.ar||rate||12,r2=1-Math.exp(-ra*DT);
  for(const [k,v] of [['hx',T.hx],['hy',T.hy],['wa',T.wa],['ox',T.ox],['oy',T.oy],['tl',T.tl]])if(v!=null)ca[k]+=(v-ca[k])*r2;
  K.action=K.action&&K.action.fin?K.action:{t0:S.t,end:1e9,fin:1,body:[{t:0,v:()=>F.cb}],arm:[{t:0,v:()=>({hand:{w:{x:F.ca.hx,y:F.ca.hy}},wAng:F.ca.wa,off:{w:{x:F.ca.ox,y:F.ca.oy}},tilt:F.ca.tl})}]};
  K.station=K.p[PEL].x;
}
function finaleStep(){
  const F=S.finale;if(!F)return;
  const {K,X,M,D}=F,u=S.t-F.ts,t=S.t-F.t0;
  if(!X||!X.pup||K.dead){if(!F.ended){F.ended=true;S.endText=S.endText||'The office is clear.';endFight(true);}return;}
  K.facing=F.kface||1;
  const XP=X.pup,a=K.arm,leg=K.leg,C=K.p[CHE],ky=D.top;
  const idleOff=()=>({ox:C.x+.1*a,oy:C.y+.72*a}),lowHand=()=>({hx:C.x+.3*a,hy:C.y+.58*a,wa:2.2}),sideHand=()=>({hx:C.x+.16*a,hy:C.y+.86*a,wa:2.3});
  const execHead=()=>X.p[HEAD],headBack=()=>({x:X.p[HEAD].x+X.body.headR*.6,y:X.p[HEAD].y-X.body.headR*.55});
  // Amri steps back and lowers her weapon
  if(M&&!M.dead&&!M.gone&&F.step!=='settle')mdrive(F);
  switch(F.step){
  case'settle':{
    // Kade's body settles; Kael turns to the desk; the executive straightens his tie and speaks
    if(M&&!M.dead&&!M.gone){M.guarding=false;}
    if(t>=.15&&!F.fx.tie){F.fx.tie=1;XP.tieAt=S.t;}
    if(t>=.35&&!F.fx.line){F.fx.line=1;say(F,'Do you know what that man cost me?',2.4);}
    if(XP.tieAt!=null){const w=(S.t-XP.tieAt)/1.5;XP.tie=w<0?0:w<1?Math.sin(Math.PI*clamp(w,0,1)):0;}
    const ready=K.motor>.8&&!K.downed&&S.t>K.knockUntil;
    if(t>=.9&&ready||t>2.4){F.kx=F.k0=K.p[PEL].x;go(F,'walk');}
    break;}
  case'walk':{
    if(XP.tieAt!=null){const w=(S.t-XP.tieAt)/1.5;XP.tie=w<0?0:w<1?Math.sin(Math.PI*clamp(w,0,1)):0;}
    const dx=F.walkX-F.kx,v=clamp(Math.abs(F.walkX-F.k0)/1.4,190,330);F.kx+=Math.sign(dx)*Math.min(Math.abs(dx),v*DT);
    XP.sl=Math.min(1,XP.sl+DT*1.1);
    kdrive(F,{b:{px:F.kx,pz:106,crouch:.9,lean:.12,stF:.2*leg,stB:-.24*leg,th:.2},...lowHand(),...idleOff(),tl:0},9);
    if(Math.abs(dx)<1&&XP.sl>=.98&&u>.5){go(F,'reach');}
    break;}
  case'reach':{
    XP.sl=1;const hb=headBack();
    kdrive(F,{b:{px:F.walkX,pz:106,crouch:.82,lean:.86,stF:10,stB:-.33*leg,th:.2},...lowHand(),ox:hb.x,oy:hb.y,tl:.05},u<.2?7:11);
    if(u>.32&&Math.hypot(K.p[HAB].x-hb.x,K.p[HAB].y-hb.y)<9||u>.7){F.fx.grab=S.t;go(F,'slam');
      XP.H={kx:execHead().x,ky:execHead().y,s:0,limp:0,kw:1};puppetGo(X,poseHaul,.06);F.slamX=execHead().x-4;}
    break;}
  case'slam':{
    // down onto the desk, hard
    const hy=ky-X.body.headR-.4,hx=F.slamX;
    const hand={x:hx+X.body.headR*.6,y:hy-X.body.headR*.55};
    kdrive(F,{b:{px:F.walkX,pz:106,crouch:.74,lean:1.12,stF:10,stB:-.33*leg},...lowHand(),ox:hand.x,oy:hand.y,tl:.1},u<.16?30:14);
    const H=XP.H,hb=K.p[HAB];H.kx=hb.x-X.body.headR*.6;H.ky=Math.min(hb.y+X.body.headR*.55,ky-X.body.headR-.3);
    if(!F.fx.slam&&(X.p[HEAD].y>=ky-X.body.headR-3||u>.5))fxSlam(F);
    if(F.fx.slam&&S.t-F.fx.slam>.4){go(F,'haul');F.hx0=H.kx;F.fx.chair=0;S.hooks.sound('over_desk',1,{dur:.7});}
    break;}
  case'haul':{
    // drawn back across the desk, the hips lifting out of the chair and onto the top; Kael steps back with him, and at the edge
    // he takes him down: the head goes over and low, the body follows
    const Th=1.7,w=clamp(u/Th,0,1),e=w*w*(3-2*w),H=XP.H,x0=F.hx0,x1=D.x0-62,hr=X.body.headR;
    const hx=lerp(x0,x1,e),hy=ky-hr-.4-hr*.55+Math.max(0,D.x0+12-hx)*.85;
    F.kx=Math.min(F.walkX,hx-62);
    const low=clamp((D.x0+12-hx)/50,0,1);
    kdrive(F,{b:{px:F.kx,pz:106,crouch:lerp(.8,.7,low),lean:lerp(1.0,1.2,low),stF:8,stB:-.3*leg},...lowHand(),ox:hx+hr*.6,oy:hy,tl:.1},14);
    const hb=K.p[HAB];H.kx=hb.x-hr*.6;H.ky=Math.min(hb.y+hr*.55,ky-hr-.3+Math.max(0,D.x0+8-H.kx)*.9);
    H.s=Math.min(1,u/.5);
    if(u>.12&&!F.fx.chair){F.fx.chair=1;chairShove();}
    if(X.p[PEL].x<D.x0+4)H.limp=Math.min(1,H.limp+DT*6);
    if(X.p[PEL].x<D.x0-4||u>Th+.3){go(F,'drop');}
    break;}
  case'drop':{
    // let go: he slides off the edge and lands
    const H=XP.H;H.kw=Math.max(0,H.kw-DT*10);
    kdrive(F,{b:{px:F.kx-6*Math.min(1,u*2),pz:106,crouch:.88,lean:.35,stF:.2*leg,stB:-.26*leg},...lowHand(),...idleOff(),tl:0},6);
    if(H.kw<=0&&XP.pose!==poseLimp){puppetGo(X,poseLimp,0);}
    const hot=X.p[PEL].y>=GB-22||X.p[CHE].y>=GB-16;
    if(hot&&!F.fx.land&&u>.2){F.fx.land=S.t;fxLand(F);}
    const rest=F.fx.land&&S.t-F.fx.land>.55&&X.p.every(q=>Math.hypot(q.x-q.px,q.y-q.py)<.8);
    if(rest||u>2.2){startKneel(F);}
    break;}
  case'kneel':{
    walkTo(F,F.stand,150);
    kdrive(F,{b:{px:F.kx,pz:X.dep,...over(leg)},...sideHand(),...idleOff(),tl:0},6);
    for(const [i,L] of FIN_LINES.entries())if(F.lines<=i&&u>=L[1]){F.lines=i+1;say(F,L[0],L[2]);if(i===0)flog('begs');}
    if(u>=2.75&&F.lines>=3)askChoice(F);
    break;}
  case'choice':{
    const w=S.t-F.ts;
    walkTo(F,F.stand,150);
    kdrive(F,{b:{px:F.kx,pz:X.dep,...over(leg),lean:.05+.01*Math.sin(S.t*1.6)},...sideHand(),...idleOff(),tl:0},6);
    if(S.auto){if(F.autoAt==null){F.autoAt=S.t+2;S.hooks.finale('decide',F);}if(S.t>=F.autoAt)finaleChoose(autoPick());}
    else if(F.autoAt!=null){F.autoAt=null;S.hooks.finale('hands',F);}
    break;}
  case'spare':{sparing(F,u,a,leg,idleOff,lowHand);break;}
  case'behead':{beheading(F,u,a,leg,idleOff,lowHand);break;}
  case'done':{
    if(F.choice==='spare'){F.kx=Math.max(F.kx-130*DT,F.stand-260);kdrive(F,{b:{px:F.kx,pz:106,crouch:.9,lean:.08,stF:.2*leg,stB:-.24*leg},...lowHand(),...idleOff(),tl:0},6);}
    else kdrive(F,{b:{px:F.kx,pz:X.dep,crouch:.9,lean:.08,stF:.2*leg,stB:-.24*leg},...lowHand(),...idleOff(),tl:0},6);
    break;}
  }
}

// ---------- the beats' helpers ----------
// Kael upright over him, feet close
const over=leg=>({crouch:.97,lean:.04,stF:.12*leg,stB:-.16*leg});
const walkTo=(F,x,v)=>{const d=x-F.kx;F.kx+=Math.sign(d)*Math.min(Math.abs(d),v*DT);};
// Amri steps back from the desk, her weapon lowered
function mdrive(F){
  const M=F.M,a=M.arm,C=M.p[CHE],tx=F.walkX-170;
  F.mx+=Math.sign(tx-F.mx)*Math.min(Math.abs(tx-F.mx),150*DT);
  F.mb={...M.guardBody(),px:F.mx,pz:clamp(M.dep,DEP_MIN,DEP_MAX)};
  F.ma={hand:{w:{x:C.x+.24*a,y:C.y+.6*a}},wAng:M.weaponKey==='spear'?1.25:1.7,off:M.wp.off?'grip':{w:{x:C.x+.08*a,y:C.y+.72*a}},tilt:0};
  if(!M.action||!M.action.fin)M.action={t0:S.t,end:1e9,fin:1,body:[{t:0,v:()=>F.mb}],arm:[{t:0,v:()=>F.ma}]};
  M.facing=1;M.station=M.p[PEL].x;
}
// his chair goes back from under him
function chairShove(){const P=S.props.find(p=>p.type==='execchair'&&!p.broken);if(!P)return;P.sleep=0;S.hooks.sound('chair_topple',1);
  for(const [i,q] of P.pts.entries()){const v=[4.5,4.5,7,3.2][i]||4;q.px=q.x-v;if(i<3)q.py=q.y+1.2;}}
// the face meets the desk
function fxSlam(F){
  const X=F.X,D=F.D,h=X.p[HEAD],x=h.x,y=D.top;F.fx.slam=S.t;
  S.freeze=Math.max(S.freeze,.1);S.shake=Math.max(S.shake,12);S.hooks.sound('thud',700,{s:'desk_slam'});S.hooks.sound('crit',30,{skip:'desk_slam'});
  if(!S.warming)S.punch={x:prjX(x,X.dep),t:0};
  flash({x,y:y-6},28,'#fff3cf',X.dep);dust(x,y,.9,X.dep);sparks({x:x+4,y:y-4},7,'#fff3cf',X.dep);
  if(D.P)kickWares(D.P,-1,1.4);
  for(const L of S.lamps)if(!L.fallen&&Math.abs(L.x-DESK.x)<150&&Math.abs(L.dep-DESK.d)<70){L.p.px=L.p.x-1.8;L.flick=.35;}
  if(S.gore!=='off'){bleed({x:x-2,y:y-6},-1,12,X.dep,.5);addMark(X,'head',false);F.smear={x,r:8,a:0};}
}
function fxLand(F){const X=F.X,p=X.p[PEL];dust(p.x,GB,1.3,X.dep);dust(p.x-16,GB,1,X.dep);S.shake=Math.max(S.shake,8);S.hooks.sound('thud',520);}
// he gets up onto his knees where he lies, but not under the desk
function startKneel(F){
  const X=F.X,K=F.K,D=F.D,px=X.p[PEL].x,kx=clamp(Math.min(px,696),600,696),wrong=X.p.some(q=>q.x>D.x0-8||q.y<GB-60&&q.x>D.x0-30);
  X.pup.kn={x:kx,tz:106,look:-.04,up:1};
  puppetGo(X,poseKneel,wrong?0:1.25,{fit:true,e:sstep});
  if(wrong)puppetSnap(X,poseKneel(X,X.pup));
  F.kx=K.p[PEL].x;F.stand=kx-64;go(F,'kneel');
}
function askChoice(F){go(F,'choice');S.hooks.finale('choice',F);}
function autoPick(){return hash32('halloran|'+S.game.turnNo+'|'+S.cfg.hero.seed+'|'+S.cfg.boss.seed)%2?'behead':'spare';}
function finaleChoose(kind){
  const F=S.finale;if(!F||F.step!=='choice'||(kind!=='spare'&&kind!=='behead'))return false;
  F.choice=kind;F.autoAt=null;
  S.endText=kind==='spare'?'Mr. Hallowell is spared.':S.gore==='off'?'Mr. Hallowell is struck down.':'Mr. Hallowell is beheaded.';
  go(F,kind);S.hooks.finale('chosen',F);flog(kind);return true;
}
function finish(F,after){if(F.endAt==null)F.endAt=S.t+after;if(!F.ended&&S.t>=F.endAt){F.ended=true;endFight(true);go(F,'done');S.hooks.finale('end',F);}}
// spare: a held breath, the blade rolls back into its hilt, Kael turns and walks out; once his back is turned he folds onto his hands
function sparing(F,u,a,leg,idleOff,lowHand){
  const K=F.K,X=F.X;
  if(u>.45&&!K.arcRoll&&K.weaponKey==='elven'){K.arcRoll={t0:S.t,dur:.7};S.hooks.sound('reroll',1);}
  if(u>.9&&F.kface!==-1){F.kface=-1;}
  if(u>.95&&!F.fx.slump){F.fx.slump=1;puppetGo(X,poseSlump,.4,{fit:true});}
  if(u>1.05)F.kx=Math.max(F.kx-130*DT,F.stand-300);
  kdrive(F,{b:{px:F.kx,pz:106,crouch:.97,lean:u<.9?.05:.06,stF:.12*leg,stB:-.16*leg},...lowHand(),hy:K.p[CHE].y+.8*a,hx:K.p[CHE].x+.16*a,wa:2.3,...idleOff(),tl:.04},6);
  finish(F,2.6);
}
// behead: feet set, the blade back, one cut through the neck, the follow-through, and he goes down
function beheading(F,u,a,leg,idleOff,lowHand){
  const K=F.K,X=F.X,C=K.p[CHE],cutAt=.56;
  const pre=u<.45,strike=u>=.45&&u<cutAt+.3;
  let T;
  if(pre)T={b:{px:F.kx,pz:X.dep,crouch:.8,lean:-.05,stF:.3*leg,stB:-.4*leg},hx:C.x-.05*a,hy:C.y-.36*a,wa:-2.1,ox:C.x+.1*a,oy:C.y+.5*a,tl:-.08,ar:10};
  else if(strike)T={b:{px:F.kx+10,pz:X.dep,crouch:.78,lean:.32,stF:.42*leg,stB:-.4*leg},hx:C.x+.78*a,hy:C.y-.05*a,wa:.95,ox:C.x+.3*a,oy:C.y+.4*a,tl:.08,ar:34};
  else T={b:{px:F.kx+10-Math.min(26,(u-cutAt-.3)*60),pz:X.dep,crouch:.84,lean:.25,stF:.42*leg,stB:-.4*leg},hx:C.x+.7*a,hy:C.y+.22*a,wa:1.2,ox:C.x+.1*a,oy:C.y+.6*a,tl:.05,ar:5};
  kdrive(F,T,pre?7:16);
  if(u>=cutAt&&!F.fx.cut)fxCut(F);
  finish(F,2.6);
}
// the blade goes through
function fxCut(F){
  const K=F.K,X=F.X,fa=1,gore=S.gore!=='off',h=X.p[HEAD],c=X.p[CHE],n={x:lerp(c.x,h.x,.5),y:lerp(c.y,h.y,.5)};
  F.fx.cut=S.t;
  S.slowT=Math.max(S.slowT,.75);S.freeze=Math.max(S.freeze,.1);if(!S.warming)S.punch={x:prjX(n.x,X.dep),t:0};
  S.callouts.push({i:K.idx,text:gore?'Beheaded':'Struck down',age:0,life:1.7,dx:-fa*8,big:true,fin:1});
  S.hooks.sound('crit',30,{s:gore?'finish_neck':'crit_cut'});S.hooks.sound('swoosh',2.2,{s:'swing_heavy'});
  flash(n,26,'#fff6e0',X.dep);sparks(n,10,'#fff3cf',X.dep);
  S.callouts=S.callouts.filter(c=>c.i!==X.idx);kill(X,fa);X.motor=0;X.station=X.p[PEL].x;X.dyingUntil=0;
  if(gore)sever(X,fa,false);
  else{h.px-=fa*280*DT;h.py+=70*DT;}
  // he pitches forward
  for(const i of [CHE,ELF,ELB,HEAD]){if(i===HEAD&&gore)continue;X.p[i].px+=.5;}
}
V11.step.push(()=>{if(S.finale&&!S.warming)finaleStep();});
V11.duelStart.push(()=>{S.finale=null;const K=hero();if(K){K.arcRoll=null;K.entering=false;}S.hooks.finale('reset');});
// ===== FINALE END =====
