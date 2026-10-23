// ===== BREACH START =====
// Once the lobby is clear, Kael walks to the executive's door, plants a small charge between its leaves, backs out of the blast
// and takes cover with Amri. The charge goes off: the leaves are torn into pieces that fly out into the room toward the camera,
// the room shakes, and smoke curls out of the empty doorway.
// Contract: breachStart(T) starts it and returns a step function that the transit calls every sim step until it returns true;
// S.breach holds all of it for the breach UI to draw (cleared on every new fight); drawExecDoor() (the breach UI) draws the door.
// S.breach.state: 'walk' (to the door), 'plant', 'back' (out of the blast), 'cover' (the beeps run down), 'blast', then 'smoke';
// S.breach.seen lists the states it has been through. The pieces of the door are S.breach.pieces (see breachPieces), the smoke
// S.breach.smoke. The office, too, scatters a few resting pieces of the door inside its doorway (restPieces).
const BREACH={
  walkV:190,walkMax:2,backV:140,   // speed to the door (quicker over a long way, so it takes 2 s at most) and back out of the blast
  stand:34,standZ:LOBBY.far-14,    // where Kael stands to plant: this far to one side of the seam, at this depth
  backX:92,backZ:146,              // where he waits out the blast: this far to the same side of the door, at this depth
  maraX:168,maraZ:120,             // Amri holds back further out on that side
  chargeH:62,                      // the charge's height on the door
  fuse:1.85,beeps:[0,.5,.93,1.3,1.58,1.76],   // seconds from the click to the blast, and when the beeps sound on the way
  after:1,                         // seconds from the blast until the heroes stand easy again and the walk on begins
  push:2.4,rumble:7};              // how hard the blast shoves loose things nearby, and how hard the floor goes on shaking after it
S.breach=null;
// where the charge sits on the door, in the heroes' own plane: the hand that plants it has to reach this point
function chargeHand(f){const far=LOBBY.far,sx=EXEC_DOOR.x+far*PSX,sy=prjY(GB,far)-BREACH.chargeH;return{x:sx-f.dep*PSX,y:sy+f.dep*PSY};}
// a hero's walk along a path (walkPath points) at a speed; with a facing the hero keeps it, otherwise faces the way they go
const brWalk=(f,pts,v,face)=>({f,pts,v,face,k:1,done:false});
function brMove(w){const f=w.f;if(w.done||w.k>=w.pts.length){w.done=true;return true;}
  const p=w.pts[w.k],dx=p[0]-f.station,dz=p[1]-f.lane,d=Math.hypot(dx,dz),st=w.v*DT;
  if(w.face)f.facing=w.face;else if(Math.abs(dx)>3)f.facing=Math.sign(dx);
  if(d<=st){f.station=p[0];f.lane=p[1];w.k++;}else{f.station+=dx/d*st;f.lane+=dz/d*st;}
  if(w.k>=w.pts.length)w.done=true;return w.done;}
// poses as functions, so a pose follows the hero's station and lane as they walk: the guard with some fields changed
const brB=(f,fn)=>()=>{const g=f.guardBody();return{...g,...fn(g)};};
const brA=(f,o)=>()=>{const g=f.guardArm();return{...g,off:g.off==='grip'?{sh:[.14*f.arm,.46*f.arm]}:g.off,...o};};
// the plant: a short crouch, the free hand to the door, a click, the hand away again. The click is .55 s in
function plantAction(K,t0,hand){
  const a=K.arm,end=1.05,low=K.wp.len<=60?{wAng:2.05}:{},sh={hand:{sh:[.22*a,.55*a]},...low},gB=brB(K,()=>({})),gA=brA(K,{}),
    carry=brA(K,{...sh,tilt:.1}),reach=brA(K,{...sh,off:{w:hand},tilt:.12}),crouch=brB(K,g=>({crouch:g.crouch-.17,lean:.2,stF:.32*K.leg,stB:-.28*K.leg}));
  return{t0,end,body:[{t:0,v:gB},{t:.28,v:crouch,e:sstep},{t:.8,v:crouch},{t:end-.02,v:gB,e:sstep},{t:end,v:gB}],
    arm:[{t:0,v:gA},{t:.22,v:carry,e:sstep},{t:.42,v:reach,e:eOut},{t:.64,v:reach},{t:.84,v:carry,e:sstep},{t:end-.02,v:gA,e:sstep},{t:end,v:gA}]};}
// bracing for the blast: down, leaning away, a forearm up over the face; the blast rocks them back, then they ease up
function coverAction(f,t0,tb){
  const a=f.arm,T1=.2,tr=Math.max(tb,T1+.1),end=tr+BREACH.after,gB=brB(f,()=>({})),gA=brA(f,{}),
    brace=brB(f,g=>({crouch:g.crouch-.1,lean:-.2,stF:g.stF*.8,stB:g.stB*.9})),rock=brB(f,g=>({crouch:g.crouch-.2,lean:-.42,px:f.station-f.facing*8})),
    up=brA(f,{off:{sh:[.34*a,-.16*a]},tilt:.28}),back=brA(f,{off:{sh:[.3*a,-.1*a]},tilt:.4});
  return{t0,end,body:[{t:0,v:gB},{t:T1,v:brace,e:eOut},{t:tr,v:brace},{t:tr+.09,v:rock,e:eOut},{t:tr+.4,v:brace,e:sstep},{t:end-.35,v:brace},{t:end-.05,v:gB,e:sstep},{t:end,v:gB}],
    arm:[{t:0,v:gA},{t:T1,v:up,e:eOut},{t:tr,v:up},{t:tr+.09,v:back,e:eOut},{t:tr+.4,v:up,e:sstep},{t:end-.45,v:up},{t:end-.05,v:gA,e:sstep},{t:end,v:gA}]};}

function breachStart(T){
  const t0=S.t,K=hero(),party=S.F.filter(f=>f.team===0&&!f.dead&&!f.gone),M=party.find(f=>f.ally)||null,side=K.station<EXEC_DOOR.x?-1:1,X=EXEC_DOOR.x;
  const B=S.breach={t0,state:'walk',seen:['walk'],blown:false,side,charge:null,clickT:null,blastT:null,beeps:[],nb:0,pieces:[],smoke:[],acc:0,clack:-9,fl0:null,seed:(Math.random()*1e9)|0};
  K.zMax=LOBBY.far-12;K.action=null;
  // the way to the door, round anything in the lobby that stands in the way; a long way is walked a little faster
  const pts=walkPath(K,X+side*BREACH.stand,BREACH.standZ),len=pathLen(pts);
  B.wk=brWalk(K,pts,clamp(len/BREACH.walkMax,BREACH.walkV,420));
  B.others=party.filter(h=>h!==K);
  // everyone else standing holds back: Amri out to the side, anyone further just where they are
  B.others.forEach(h=>{h.action=null;if(h===M)B.wm=brWalk(h,walkPath(h,X+side*BREACH.maraX,BREACH.maraZ),Math.max(BREACH.walkV,150));});
  return()=>breachStep(B,K,party);}
function breachState(B,s){B.state=s;B.seen.push(s);}
function breachStep(B,K,party){
  const face=-B.side,X=EXEC_DOOR.x;
  if(B.wm)brMove(B.wm);
  // whoever has arrived somewhere stands watching the door
  if(B.wm&&B.wm.done&&B.state!=='cover'&&B.state!=='blast'&&B.state!=='smoke')B.wm.f.facing=face;
  // the beeps run from the click to the blast, quicker as it nears
  while(B.nb<B.beeps.length&&S.t>=B.beeps[B.nb]){S.hooks.sound('beep',1+.55*B.nb/(B.beeps.length-1));B.nb++;}
  if(B.state==='walk'){
    if(brMove(B.wk)){K.facing=face;K.action=plantAction(K,S.t,chargeHand(K));B.plantT=S.t;breachState(B,'plant');}}
  else if(B.state==='plant'){
    const u=S.t-B.plantT;
    if(!B.charge&&u>=.55){B.charge={t:S.t};B.clickT=S.t;B.blastT=S.t+BREACH.fuse;B.beeps=BREACH.beeps.map(x=>S.t+x);S.hooks.sound('click',1);S.hooks.log({type:'breach',stage:'plant',f:K});}
    if(B.charge&&u>=.85){B.wk=brWalk(K,walkPath(K,X+B.side*BREACH.backX,BREACH.backZ),BREACH.backV);breachState(B,'back');}}
  else if(B.state==='back'){
    if(brMove(B.wk)&&S.t>=B.plantT+1.05){
      K.zMax=null;K.facing=face;K.action=coverAction(K,S.t,B.blastT-S.t);
      B.others.forEach((h,i)=>{if(h.dead)return;h.facing=face;h.action=coverAction(h,S.t,B.blastT-S.t);});
      breachState(B,'cover');}}
  else if(B.state==='cover'){if(S.t>=B.blastT)breachBlast(B,K,party);}
  else{
    if(B.state==='blast'&&S.t>=B.blastT+.5)breachState(B,'smoke');
    if(S.t>=B.blastT+BREACH.after){
      // the heroes are valid again: inside the stage, standing, nothing scripted left on them
      for(const h of party){h.zMax=null;h.action=null;h.station=clamp(h.station,60,maxStation());h.lane=clamp(h.lane,DEP_MIN,DEP_MAX);}
      return true;}}
  return false;}

// ---------- the blast ----------
function breachBlast(B,K,party){
  const X=EXEC_DOOR.x,far=LOBBY.far,dd=far-4,R=Math.random;
  B.blown=true;breachState(B,'blast');B.blastT=S.t;
  B.pieces=breachPieces();B.smoke=[];breachPuffs(B,24,true);
  S.shake=Math.max(S.shake,22);S.shakeDir={x:.35,y:1};S.freeze=Math.max(S.freeze,.08);S.slowT=Math.max(S.slowT,.45);S.punch={x:prjX(X,far),t:0};
  flash({x:X,y:GB-62},84,'#fff1c9',dd);flash({x:X,y:GB-40},58,'#ffb24a',dd);ring(X,far-10,210,'#ffb24a');ring(X,far-10,290,'rgba(255,236,200,.8)');
  sparks({x:X,y:GB-62},52,'#ffb24a',dd);sparks({x:X,y:GB-110},34,'#fff1c9',dd);sparks({x:X,y:GB-26},24,'#ff7a2a',dd);
  for(let i=0;i<46;i++)shard('wood',X+(R()-.5)*80,GB-12-R()*150,dd,R()<.5?-1:1,1.4);
  for(let i=0;i<12;i++)shard('brass',X+(R()-.5)*60,GB-20-R()*130,dd,R()<.5?-1:1,1.1);
  breachShove(X,dd);
  for(const h of party){const rx=h.p[PEL].x-X,k=Math.exp(-Math.hypot(rx,(h.dep-dd)*1.4)/230),s=Math.sign(rx)||1;for(const q of h.p)q.px-=s*1.7*k;h.vdep-=45;}
  S.hooks.sound('boom',1);S.hooks.sound('rattle',1);S.hooks.log({type:'breach',stage:'blast',f:K});}
// the shock wave: lamps swing, furniture is shoved, bodies slide, loose things scatter. Less with distance from the door.
function breachShove(X,dd){
  const push=(x,dep)=>{const rx=x-X;return{dir:Math.sign(rx)||1,k:Math.exp(-Math.hypot(rx,(dep-dd)*1.4)/230)};},R=Math.random,PW=BREACH.push;
  for(const L of S.lamps){const q=push(L.x,L.dep);L.p.px=L.p.x-q.dir*3*q.k;L.flick=Math.max(L.flick||0,.5);}
  for(const P of S.props){if(P.broken||P.fixed)continue;const q=push(P.box.cx,P.dep),v=PW*q.k;if(v<.15)continue;P.sleep=0;
    for(const t of P.pts){const hk=1+clamp((P.box.b-t.y)/80,0,1.2);t.px=t.x-q.dir*v*hk;t.py=t.y+v*.5*hk;}kickWares(P,q.dir,1.3*q.k);}
  for(const f of S.F){if(!f.dead||f.gone)continue;const q=push(f.p[PEL].x,f.dep),v=PW*1.1*q.k;if(v<.15)continue;for(const t of f.p){t.px=t.x-q.dir*v;t.py=t.y+v*.4;}}
  for(const it of S.items){if(it.stuck)continue;const q=push((it.a.x+it.b.x)/2,it.dep),v=PW*.85*q.k;for(const t of [it.a,it.b]){t.px=t.x-q.dir*v;t.py=t.y+v*.5;}}
  for(const d of S.debris){const q=push((d.a.x+d.b.x)/2,d.dep),v=PW*.85*q.k;for(const t of [d.a,d.b]){t.px=t.x-q.dir*v;t.py=t.y+v*.5;}}
  for(const s of S.shards){const q=push(s.x,s.d);if(q.k<.12)continue;s.rest=false;s.vx+=q.dir*(90+R()*220)*q.k;s.vy-=(120+R()*200)*q.k;}
}
// A piece of the door: x, y, d is its centre (y down, as everywhere), vx, vy, vd its speed (vd toward the camera is negative), ang and va
// its turn in the plane it flies in, flip and fv a coin-like turn about its own height, th the tilt that lays it flat on the floor
// (0 flying, PI/2 flat), w and h its size, out its torn outline (eight points around its middle, x right and y up), kind 'wood', 'brass'
// or 'hinge', hot how much it still glows from the blast, rest when it lies still, tgt the angle it settles at.
function brokenOutline(w,h,tough,keep){const R=Math.random,j=m=>(R()-.5)*m,m=Math.min(w,h)*(tough?.1:.45),hx=w/2,hy=h/2,k=keep||[0,0,0,0];
  return[[-hx+j(3),-hy+j(3)],[j(w*.5),-hy+(k[0]?0:R()*m)],[hx+j(3),-hy+j(3)],[hx-(k[1]?0:R()*m),j(h*.5)],[hx+j(3),hy+j(3)],[j(w*.5),hy-(k[2]?0:R()*m)],[-hx+j(3),hy+j(3)],[-hx+(k[3]?0:R()*m),j(h*.5)]];}
function mkPiece(x,y,d,w,h,kind,o){return Object.assign({x,y,d,vx:0,vy:0,vd:0,ang:0,va:0,flip:0,fv:0,th:0,w,h,kind,hot:0,rest:false,bounce:0,age:0,seed:(Math.random()*1e6)|0,tgt:0,
  out:brokenOutline(w,h,kind!=='wood',o&&o.keep),inlay:Math.random()<.4?Math.floor(Math.random()*4):-1},o||{});}
// the two leaves in pieces: wood in panels and strips, brass pulls, hinges and kickplates. Door coordinates: x from the seam, height
// up from the foot. Each piece flies out from the middle of the door, toward the camera and up.
function breachPieces(){
  const R=Math.random,out=[],dh=EXEC_DOOR.h,hw=EXEC_DOOR.w/2,X=EXEC_DOOR.x,far=LOBBY.far-1.5;
  const add=(x0,x1,y0,y1,kind)=>{const w=x1-x0,h=y1-y0,mx=(x0+x1)/2,my=(y0+y1)/2,dir=Math.sign(mx)||(R()<.5?-1:1),big=Math.sqrt(w*h)/30,
    keep=kind==='wood'&&w>6?[y0<=0?1:0,x1>=hw-.1||Math.abs(x1)<.1?1:0,y1>=dh?1:0,x0<=-hw+.1||Math.abs(x0)<.1?1:0]:null;
    out.push(mkPiece(X+mx,GB-my,far,w,h,kind,{vx:mx*2.6+(R()-.5)*80+dir*20,vy:-(90+R()*200)-(my-62)*.7,vd:-(60+R()*150)/(1+big*.25),va:(R()-.5)*14/(1+big*.3),
      flip:R()*6,fv:(R()-.5)*10,ang:(R()-.5)*.3,hot:1,keep}));};
  for(const s of[-1,1]){const xa=s>0?0:-hw,xb=s>0?hw:0;
    for(const[y0,y1]of[[0,42],[42,98],[98,dh]]){
      if(R()<.62){const u=xa+(xb-xa)*(.35+R()*.3);add(xa,u,y0,y1,'wood');add(u,xb,y0,y1,'wood');}else add(xa,xb,y0,y1,'wood');}
    add(s*6-1.6,s*6+1.6,66,110,'brass');                       // the long pull
    add(xa+2,xb-2,3,24,'brass');                               // the kickplate
    for(const y of[18,82,140])add(s>0?hw-6:-hw,s>0?hw:-hw+6,y,y+12,'hinge');}
  for(let i=0;i<8;i++){const x=(R()-.5)*76,y=10+R()*140,h=18+R()*34;add(x-2,x+2,y,y+h,'wood');}   // splinters and slats
  return out;}
// a few pieces of the door already lying on the floor (the office's doorway): x0..x1 and d0..d1 are where, n how many
function restPieces(n,x0,x1,d0,d1,seed){
  const r=mulberry32(seed|0),keep=Math.random;Math.random=r;const out=[];
  for(let i=0;i<n;i++){const k=r(),kind=k<.74?'wood':k<.9?'brass':'hinge',big=kind==='wood',w=big?12+r()*30:kind==='brass'?3+r()*20:9,h=big?10+r()*38:kind==='brass'?3+r()*6:9;
    out.push(mkPiece(x0+r()*(x1-x0),GB-2.2,d0+r()*(d1-d0),w,h,kind,{ang:r()*TAU,th:Math.PI/2,rest:true,bounce:2}));}
  Math.random=keep;for(const p of out)p.tgt=p.ang;return out;}
// smoke: n big puffs out of the doorway (hot ones for the fireball), or one thin wisp
function breachPuffs(B,n,burst){
  const R=Math.random,X=EXEC_DOOR.x;
  for(let i=0;i<n;i++){const roll=burst&&i<5;
    B.smoke.push({x:X+(R()-.5)*(burst?70:50),y:GB-(burst?18+R()*136:70+R()*90),d:LOBBY.far-3-R()*4,
      vx:(R()-.5)*(burst?130:40),vy:-R()*(burst?70:30),vd:-(roll?110+R()*90:burst?30+R()*85:12+R()*30),r:burst?15+R()*11:11+R()*8,r1:roll?80+R()*40:burst?52+R()*46:34+R()*24,age:0,
      life:burst?2.6+R()*1.8:3+R()*1.6,a0:burst?.78:.5,hot:burst?.7+R()*.3:0,ph:R()*6.28,kind:Math.floor(R()*3)});}}
// every sim step: the pieces fall and bounce and lie still; the smoke drifts and thins, and a wisp keeps coming while the room lasts
function breachTick(){
  const B=S.breach;if(!B||!B.blown)return;
  const u=S.t-B.blastT;
  // the floor goes on shaking for a while after the blast
  if(u<1.2)S.shake=Math.max(S.shake,BREACH.rumble*Math.exp(-u/.45));
  for(const p of B.pieces){if(p.rest)continue;p.age+=DT;
    p.vy+=G*DT;p.x+=p.vx*DT;p.y+=p.vy*DT;p.d+=p.vd*DT;p.ang+=p.va*DT;p.flip+=p.fv*DT;p.hot=Math.max(0,p.hot-DT*1.1);p.vx*=1-.6*DT;p.vd*=1-.9*DT;
    if(p.d<DEP_MIN+6){p.d=DEP_MIN+6;p.vd=Math.abs(p.vd)*.2;}
    const g=S.arena.ground(p.x,p.d);
    // once it has touched down it tips over onto its flat side
    if(p.bounce){p.th+=(Math.PI/2-p.th)*Math.min(1,6*DT);p.va*=1-3*DT;p.fv*=1-5*DT;}
    const up=Math.abs(Math.sin(p.ang))*p.w/2+Math.abs(Math.cos(p.ang))*p.h/2,ey=lerp(up,2.2,clamp(p.th/(Math.PI/2),0,1));
    if(p.y+ey>=g){p.y=g-ey;
      if(p.vy>80&&p.bounce<4){p.vy*=-.32;p.vx*=.66;p.vd*=.55;p.va*=.5;p.fv*=.4;p.bounce++;
        if(p.vy<-120&&S.t-B.clack>.06){B.clack=S.t;S.hooks.sound('wood',clamp(.25+Math.abs(p.vy)/700,.25,.6));}}
      else{p.vy=0;if(!p.bounce)p.bounce=1;p.vx*=1-9*DT;p.vd*=1-9*DT;p.va*=1-8*DT;p.fv*=1-8*DT;
        if(Math.abs(p.vx)+Math.abs(p.vd)<12&&p.th>1.5||p.age>5){p.rest=true;p.th=Math.PI/2;p.y=g-2.2;p.vx=p.vd=p.vy=p.va=p.fv=0;p.tgt=p.ang;}}}}
  const sm=B.smoke;let n=0;
  for(const s of sm){s.age+=DT;s.x+=s.vx*DT;s.y+=s.vy*DT;s.d+=s.vd*DT;s.vx*=1-1.4*DT;s.vd*=1-1.5*DT;s.vy=s.vy*(1-1.2*DT)-24*DT;s.hot=Math.max(0,s.hot-DT*1.6);if(s.age<s.life)sm[n++]=s;}
  sm.length=n;
  if(S.room==='lobby'&&n<70){B.acc+=DT*(15*Math.exp(-u/1.2)+2.4);while(B.acc>=1){B.acc--;breachPuffs(B,1,false);}}}
V11.step.push(breachTick);
S.floorPieces=[];
V11.duelStart.push(()=>{S.breach=null;S.floorPieces=[];});
// ===== BREACH END =====
