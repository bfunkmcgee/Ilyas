
// ---------- UI ----------
const $=id=>document.getElementById(id);
const reduceMotion=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
rosterBuild();

const cv=$('cv');
// (let: while a fighter is drawn into his own sprite, sk_lightui.js points ctx at the sprite's context and back)
let ctx=cv.getContext('2d');
let aspect=1.8,cssW=900,cssH=500;
// cam.T is the world's y at the top edge of the canvas (camTop), eased toward where the framing wants it (camTarget)
const cam={x:W/2,viewW:W,T:0,tSet:false};
// what the HUD covers of the stage, in CSS pixels from the top and from the bottom edge (sk_hudui.js measures it)
const HUD_IN={top:0,bottom:0};
// The canvas fills the stage, the whole screen. Its pixel ratio is held to a budget of pixels, so a big screen costs about what a
// laptop's did, never more than twice the CSS size.
const PIX_BUDGET=2.6e6;
function resize(){
  const el=cv.parentElement,w=el.clientWidth||900;let h=el.clientHeight;if(!(h>0))h=w/1.8;
  cssW=w;cssH=h;aspect=w/h;
  const dpr=Math.max(.5,Math.min(2,window.devicePixelRatio||1,Math.sqrt(PIX_BUDGET/Math.max(1,w*h))));
  const nw=Math.round(w*dpr),nh=Math.round(h*dpr);if(cv.width!==nw)cv.width=nw;if(cv.height!==nh)cv.height=nh;
  cam.tSet=false;if(typeof hudResized==='function')hudResized();
}
// a narrow or upright screen follows the fighters close in; a wide one shows the whole floor
function camNarrow(){return cssW<640||aspect<1;}
try{new ResizeObserver(resize).observe(cv.parentElement);}catch(e){window.addEventListener('resize',resize);}
resize();
function updateCamera(rdt){
  const narrow=camNarrow();let lo=1e9,hi=-1e9;
  for(const f of S.F){if(f.gone||f.entering)continue;const x=prjX(f.p[PEL].x,f.dep);if(x<lo)lo=x;if(x>hi)hi=x;}
  // a short punch-in on the biggest moments
  const pk=S.punch&&!reduceMotion?(S.punch.t<.22?1:Math.max(0,1-(S.punch.t-.22)/.7)):0;
  const pz=(S.punch&&S.punch.z)||.1,tw=(narrow?clamp(hi-lo+280,560,W):W)*(1-pz*pk),k=Math.min(1,rdt*(pk>0?6:3.5));
  cam.viewW+=(tw-cam.viewW)*k;const half=cam.viewW/2;
  const cx=pk>0?lerp((lo+hi)/2,S.punch.x,(pz>.12?.6:.45)*pk):(lo+hi)/2;
  cam.x+=(clamp(cx,half,W-half)-cam.x)*k;
}
// The picture's height. The band the fighters stand in (the farthest one's head with a label over it, down to the nearest one's feet
// and footing ring) sits in what the HUD leaves of the screen, as low in it as lets the floor run on under the command dock, never
// lower than three quarters of the way down it; where the band does not fit, the feet win. Without a HUD over it a wide screen gets
// the old framing back: the world's foot at the canvas's foot.
const BAND0={top:180,foot:483};
function camBand(){
  if(S.camCut||!S.F.length)return BAND0;
  let top=1e9,foot=-1e9;
  for(const f of S.F){if(f.gone||f.entering||f.hidden||!f.p||!f.gr)continue;const x=f.p[PEL].x,y=prjY(f.gr(x),f.dep);if(!Number.isFinite(y))continue;
    if(y-140<top)top=y-140;if(y+22>foot)foot=y+22;}
  return top<foot?{top,foot}:BAND0;}
function camTarget(){
  const s=cssW/Math.max(1,cam.viewW),it=HUD_IN.top,ib=HUD_IN.bottom,b=camBand(),free=Math.max(40,cssH-it-ib);
  const A=H-(cssH-ib)/s,Bt=b.top-(it+36)/s,C=b.foot-(cssH-ib)/s,lo=(b.top+b.foot)/2-(it+.72*free)/s;
  return Math.max(Math.min(A,Bt),lo,C);}
function camVert(rdt){const t=camTarget();if(!cam.tSet||!Number.isFinite(cam.T)){cam.T=t;cam.tSet=true;}else cam.T+=(t-cam.T)*Math.min(1,rdt*3.2);}
function camTop(){return cam.T;}

// ---------- scenery ----------
const FAR=[],NEAR=[],STARS=[],BLDG=[],LAMPS=[];let TUFTS=[];
(function(){const r=mulberry32(99);
  for(let x=-60;x<=W+100;x+=12){FAR.push([x,204+Math.sin(x*.006)*20+Math.sin(x*.017+1)*9+r()*3]);NEAR.push([x,236+Math.sin(x*.009+2)*12+Math.sin(x*.025)*6+r()*2]);}
  for(let i=0;i<70;i++)STARS.push({x:r()*W,y:r()*170,s:r()<.85?1.2:2,a:.3+r()*.6,ph:r()*6});
  let x=-40;
  while(x<W+90){const w=70+r()*80,h=120+r()*120,win=[],cols=Math.max(1,Math.floor((w-18)/17)),rows=Math.max(1,Math.floor((h-50)/24));
    for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const v=r();if(v<.42)win.push([10+i*17,30+j*24,v<.12]);}
    BLDG.push({x,w,h,win,roof:r()<.35?'gable':'flat',door:r()<.6?10+r()*(w-34):-1});x+=w+(r()<.3?12+r()*18:2);}
  for(let lx=60;lx<W+90;lx+=230)LAMPS.push(lx);
})();
function buildScenery(){
  const r=mulberry32(7+Object.keys(ARENAS).indexOf(S.arenaKey)*31);TUFTS=[];
  if(S.arenaKey==='street'||S.arena.indoor)return;
  for(let i=0;i<170;i++){const x=r()*(W+80)-40,d=-40+r()*(S.arena.far+20);if(S.arena.wall&&x>S.arena.wall-8)continue;TUFTS.push([x,d,2+r()*6,(r()-.5)*.9]);}
}
const SIL='#0d0816',SIL_BACK='#281e3c',HL='rgba(255,228,184,.7)',TABLE_COL='#22192f',TABLE_TOP='#3b2c48',TABLE_BACK='#17101f',STONE='#2a2040',TEAL='#45d8c8';
const P=(x,y,d)=>({x:prjX(x,d),y:prjY(y,d)});
function hill(pts,col){ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(pts[0][0],H+40);for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.lineTo(pts[pts.length-1][0],H+40);ctx.closePath();ctx.fill();}
function drawSky(L,T,VW,VH){
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#1b1540');g.addColorStop(.22,'#4a2a6a');g.addColorStop(.34,'#b5567a');g.addColorStop(.43,'#ee8a5e');g.addColorStop(.5,'#ffbe7a');g.addColorStop(1,'#ffbe7a');
  ctx.fillStyle=g;ctx.fillRect(L-30,T-30,VW+60,Math.min(VH+60,H+2-(T-30)));
  for(const s of STARS){ctx.globalAlpha=s.a*(.6+.4*Math.sin(S.t*.7+s.ph));ctx.fillStyle='#fff0dc';ctx.fillRect(s.x,s.y,s.s,s.s);}
  ctx.globalAlpha=1;
  const sx=W*.62,sy=S.arenaKey==='street'?196:222,sg=ctx.createRadialGradient(sx,sy,8,sx,sy,190);
  sg.addColorStop(0,'rgba(255,226,170,.9)');sg.addColorStop(.3,'rgba(255,190,120,.32)');sg.addColorStop(1,'rgba(255,160,110,0)');
  ctx.fillStyle=sg;ctx.fillRect(sx-190,sy-190,380,380);
  ctx.fillStyle='#ffe2ad';ctx.beginPath();ctx.arc(sx,sy,40,0,TAU);ctx.fill();
}
function drawFloor(){
  const a=S.arena,gr=a.ground,far=a.far,near=-90,X0=-100,X1=W+160;
  if(S.arenaKey==='street'){drawStreet();return;}
  hill(FAR,'#7a4672');hill(NEAR,'#43284f');
  const top=[];for(let x=X0;x<=X1;x+=10)top.push(P(x,gr(x,far),far));
  let yTop=1e9;for(const q of top)yTop=Math.min(yTop,q.y);
  const g=ctx.createLinearGradient(0,yTop,0,H);g.addColorStop(0,'#6b3a63');g.addColorStop(.16,'#3a2246');g.addColorStop(.55,'#1d1229');g.addColorStop(1,'#110a1a');
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(top[0].x,top[0].y);for(const q of top)ctx.lineTo(q.x,q.y);
  ctx.lineTo(prjX(X1,near),H+90);ctx.lineTo(prjX(X0,near),H+90);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(255,160,110,.5)';ctx.lineWidth=1.4;ctx.beginPath();top.forEach((q,i)=>i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));ctx.stroke();
  if(S.arenaKey==='ledge'){
    ctx.fillStyle='rgba(6,3,14,.42)';ctx.beginPath();ctx.moveTo(prjX(440,far),prjY(gr(440),far));
    for(let x=440;x<=500;x+=6)ctx.lineTo(prjX(x,far),prjY(gr(x),far));
    for(let x=500;x>=440;x-=6)ctx.lineTo(prjX(x,near),prjY(gr(x),near));
    ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(255,170,120,.32)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(prjX(440,far),prjY(gr(440),far));ctx.lineTo(prjX(440,near),prjY(gr(440),near));ctx.stroke();
  }
  ctx.strokeStyle='rgba(255,170,120,.075)';ctx.lineWidth=1;
  for(let d=DEP_MIN;d<=far;d+=28){ctx.beginPath();for(let x=X0;x<=X1;x+=12){const q=P(x,gr(x,d),d);x===X0?ctx.moveTo(q.x,q.y):ctx.lineTo(q.x,q.y);}ctx.stroke();}
  ctx.strokeStyle='#1c1230';ctx.lineWidth=1.3;ctx.lineCap='round';ctx.beginPath();
  for(const t of TUFTS){const q=P(t[0],gr(t[0],t[1])+1,t[1]);ctx.moveTo(q.x,q.y);ctx.lineTo(q.x+t[3]*t[2],q.y-t[2]);}ctx.stroke();
  if(S.arena.wall)drawWall();
}
function drawStreet(){
  const X0=-100,X1=W+170,dF=206,ys=GB-KERB_H;
  drawFacades();
  const band=(d0,y0,d1,y1,c0,c1)=>{const a=P(X0,y1,d1),b=P(X1,y1,d1),c=P(X1,y0,d0),e=P(X0,y0,d0);
    const g=ctx.createLinearGradient(0,a.y,0,e.y);g.addColorStop(0,c1);g.addColorStop(1,c0);ctx.fillStyle=g;
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.lineTo(e.x,e.y);ctx.closePath();ctx.fill();};
  band(CURB1,ys,dF,ys,'#3b2b45','#5a4160');
  ctx.strokeStyle='rgba(10,5,18,.38)';ctx.lineWidth=1;ctx.beginPath();
  for(let x=-80;x<=W+150;x+=46){const a=P(x,ys,CURB1),b=P(x,ys,dF);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}
  for(const d of [152,178]){const a=P(X0,ys,d),b=P(X1,ys,d);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();
  for(const lx of LAMPS){const q=P(lx+14,ys,168),g=ctx.createRadialGradient(q.x,q.y,4,q.x,q.y,96);g.addColorStop(0,'rgba(255,196,120,.24)');g.addColorStop(1,'rgba(255,196,120,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(q.x,q.y,96,30,0,0,TAU);ctx.fill();}
  band(CURB0,GB,CURB1,ys,'#4d3a57','#76607e');
  ctx.strokeStyle='rgba(255,205,165,.5)';ctx.lineWidth=1.2;ctx.beginPath();{const a=P(X0,ys,CURB1),b=P(X1,ys,CURB1);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();
  band(-90,GB,CURB0,GB,'#0e0816','#2c2035');
  ctx.strokeStyle='rgba(6,3,12,.5)';ctx.lineWidth=3;ctx.beginPath();{const a=P(X0,GB,CURB0-2),b=P(X1,GB,CURB0-2);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();
  ctx.strokeStyle='rgba(255,214,150,.24)';ctx.lineWidth=2;ctx.beginPath();
  for(let x=-80;x<=W+150;x+=58){const a=P(x,GB,62),b=P(x+30,GB,62);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();
  drawLamps();
}
function drawFacades(){
  const d=212,base=prjY(GB-KERB_H,d);
  for(const b of BLDG){const x0=prjX(b.x,d);
    ctx.fillStyle='#21163a';ctx.fillRect(x0,base-b.h,b.w,b.h+2);
    if(b.roof==='gable'){ctx.beginPath();ctx.moveTo(x0-3,base-b.h);ctx.lineTo(x0+b.w/2,base-b.h-26);ctx.lineTo(x0+b.w+3,base-b.h);ctx.closePath();ctx.fill();}
    else ctx.fillRect(x0-3,base-b.h-5,b.w+6,6);
    ctx.fillStyle='rgba(255,170,120,.18)';ctx.fillRect(x0+b.w-2,base-b.h,2,b.h);
    for(const w of b.win){ctx.fillStyle=w[2]?'rgba(255,200,125,.9)':'rgba(255,190,130,.12)';ctx.fillRect(x0+w[0],base-b.h+w[1],8,13);}
    if(b.door>=0){ctx.fillStyle='rgba(255,180,110,.3)';ctx.fillRect(x0+b.door,base-30,16,30);}
  }
}
function drawLamps(){
  const d=200,base=prjY(GB-KERB_H,d);
  for(const lx of LAMPS){const x=prjX(lx,d);ctx.strokeStyle='#120b1c';ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,base);ctx.lineTo(x,base-150);ctx.lineTo(x+14,base-157);ctx.stroke();
    const g=ctx.createRadialGradient(x+16,base-151,1,x+16,base-151,28);g.addColorStop(0,'rgba(255,224,165,.95)');g.addColorStop(.3,'rgba(255,190,120,.35)');g.addColorStop(1,'rgba(255,170,100,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x+16,base-151,28,0,TAU);ctx.fill();}
}
// once he goes through it, the wall comes down from its near end to well past where anyone fights: what stands is the far stretch,
// its broken end stepping back as it climbs, and a stump at the near end, with the fallen stone heaped along the foot between them
const WALL_BRK=[[176,0],[176,9],[181,9],[181,22],[185,24],[185,38],[190,40],[190,57],[194,60],[194,78],[199,80],[199,101],[203,104],[203,128],[208,131],[208,156],[212,160],[212,186],[217,190],[217,214],[222,218],[222,242],[226,246],[226,260]],
  WALL_STUB=[[-12,46],[-7,52],[-2,41],[3,33],[7,19],[11,8],[13,0]];
function drawWall(){
  const wx=S.arena.wall;if(!wx)return;
  const st=S.wall?S.wall.state:'standing',hp=S.wall?S.wall.hp:3,d0=-12,d1=S.arena.far,yb=GB,yt=GB-WALL_TOP,br=st==='breached',w0=br?WALL_BRK[WALL_BRK.length-1][0]:d0;
  ctx.fillStyle='rgba(8,4,16,.35)';ctx.beginPath();{const a=P(wx+WALL_T,yb,d0),b=P(W+170,yb,d0),c=P(W+170,yb,d1),e=P(wx+WALL_T,yb,d1);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.lineTo(e.x,e.y);}ctx.closePath();ctx.fill();
  // the near end of the wall, nearest of all: the stump's end when it has come down, drawn under the heap that has fallen against it
  const nearEnd=()=>{const nt=br?yb-WALL_STUB[0][1]:yt;
    ctx.fillStyle='#150e25';poly(br?[P(wx,yb,d0),P(wx,nt,d0),P(wx+WALL_T*.4,nt-3,d0),P(wx+WALL_T*.7,nt+4,d0),P(wx+WALL_T,nt+7,d0),P(wx+WALL_T,yb,d0)]:[P(wx,yb,d0),P(wx+WALL_T,yb,d0),P(wx+WALL_T,yt,d0),P(wx,yt,d0)]);
    ctx.strokeStyle='rgba(255,160,110,.42)';ctx.lineWidth=1.5;ctx.beginPath();{const a=P(wx+.7,yb,d0),b=P(wx+.7,nt,d0);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();};
  const far=br?[P(wx,yt,d1),P(wx,yb,d1),...WALL_BRK.map(([d,h])=>P(wx,yb-h,d))]:[P(wx,yb,d0),P(wx,yt,d0),P(wx,yt,d1),P(wx,yb,d1)],
    stub=br?[P(wx,yb,d0),...WALL_STUB.map(([d,h])=>P(wx,yb-h,d))]:null;
  ctx.fillStyle='#1d1531';poly(far);if(stub)poly(stub);
  ctx.fillStyle='#2b2042';poly([P(wx,yt,w0),P(wx+WALL_T,yt,w0),P(wx+WALL_T,yt,d1),P(wx,yt,d1)]);
  ctx.save();ctx.beginPath();for(const sh of stub?[far,stub]:[far]){ctx.moveTo(sh[0].x,sh[0].y);for(const q of sh)ctx.lineTo(q.x,q.y);ctx.closePath();}ctx.clip();
  ctx.strokeStyle='rgba(255,255,255,.05)';ctx.lineWidth=1;ctx.beginPath();
  for(let y=yt+24;y<yb;y+=24){const a=P(wx,y,d0),b=P(wx,y,d1);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();ctx.restore();
  if(!br){
    ctx.strokeStyle='#08050f';ctx.lineWidth=1.8;ctx.lineCap='round';ctx.beginPath();const dm=(d0+d1)*.42;
    const cr=(pts)=>{pts.forEach((p,i)=>{const q=P(wx,p[1],dm+p[0]);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);});};
    if(hp<=2)cr([[-20,yb-150],[-6,yb-128],[-14,yb-104],[2,yb-82]]);
    if(hp<=1){cr([[-30,yb-60],[-12,yb-74],[8,yb-66]]);cr([[2,yb-82],[14,yb-98],[22,yb-122]]);}
    ctx.stroke();
  }else{
    // the broken edges, seen across the wall's thickness
    ctx.fillStyle='#150e25';
    for(const E of [WALL_BRK,WALL_STUB]){const A=E.map(([d,h])=>P(wx,yb-h,d)),B=E.map(([d,h])=>P(wx+WALL_T,yb-h,d)).reverse();poly([...A,...B]);}
    ctx.strokeStyle='rgba(255,160,110,.22)';ctx.lineWidth=1.2;ctx.beginPath();WALL_BRK.forEach(([d,h],i)=>{const q=P(wx+.6,yb-h,d);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);});ctx.stroke();
    nearEnd();
    // the heap along the foot: low at the stump, highest where the most came down, running out under the far stretch
    const e=WALL_BRK[0][0],hh=d=>4+24*Math.sin(clamp((d+14)/(e+22),0,1)*Math.PI)*(.72+.28*Math.sin(d*.21)*Math.sin(d*.057+1)),F=[],R=[],K=[];
    for(let d=-16;d<=e+6;d+=4){F.push(P(wx-13,yb+1,d));R.push(P(wx+WALL_T*.45,yb-hh(d),d));K.push(P(wx+WALL_T+15,yb+1,d));}
    ctx.fillStyle='#120c1f';poly([...F,...R.slice().reverse()]);ctx.fillStyle='#181029';poly([...R,...K.slice().reverse()]);
    const r=mulberry32(4711);
    for(let i=0;i<46;i++){const d=-14+r()*(e+18),u=r(),q=P(wx-11+u*(WALL_T+24),yb-hh(d)*Math.sin(clamp(u*1.05,0,1)*Math.PI)*(.5+r()*.5),d),w=4+r()*7,h=3+r()*3.5;
      ctx.save();ctx.translate(q.x,q.y);ctx.rotate((r()-.5)*.8);ctx.fillStyle=r()<.5?'#241a3a':'#1d1531';ctx.fillRect(-w/2,-h,w,h);ctx.fillStyle='rgba(255,255,255,.06)';ctx.fillRect(-w/2,-h,w,1);ctx.restore();}
  }
  if(!br)nearEnd();
}
function circ(c,r){ctx.beginPath();ctx.arc(c.x,c.y,r,0,TAU);ctx.fill();}
function seg(a,b,w,col){ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
function limb(a,b,c,w,col){ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.stroke();}
function foot(kn,ft,fa,w,col){const dx=ft.x-kn.x,dy=ft.y-kn.y,l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l;
  const tx=fa>0?uy:-uy,ty=fa>0?-ux:ux;seg(ft,{x:ft.x+tx*8,y:ft.y+ty*8+1},w*.9,col);}
function poly(pts){ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i].x,pts[i].y);ctx.closePath();ctx.fill();}
function drawShadows(){
  if(typeof FXL!=='undefined'&&FXL.on()){FXL.shadows();return;}
  for(const f of S.F){if(f.gone)continue;let lo=1e9,hi=-1e9;for(const i of [PEL,CHE,HEAD,KNF,KNB,FTF,FTB]){const q=f.p[i];if(q.x<lo)lo=q.x;if(q.x>hi)hi=q.x;}
    const cx=(lo+hi)/2,gy=f.gr(cx),h=clamp((gy-f.p[PEL].y)/(f.leg*.9),0,1.8),q=P(cx,gy,f.dep);
    const a=.36*(h>1.15?clamp(1-(h-1.15)*1.3,.25,1):1);ctx.fillStyle=`rgba(4,2,10,${a.toFixed(3)})`;
    ctx.beginPath();ctx.ellipse(q.x,q.y,Math.max(16+f.body.bulk*5,(hi-lo)/2+8),4.8,0,0,TAU);ctx.fill();}
  const T=S.table;if(T&&T.on&&T.state!=='broken'){const b=tableBox(),g=S.arena.ground(b.cx,T.dep);
    ctx.fillStyle='rgba(4,2,10,.28)';poly([P(b.l-3,g,T.dep+TD),P(b.r+3,g,T.dep+TD),P(b.r+3,g,T.dep-TD),P(b.l-3,g,T.dep-TD)]);}
}
function drawFooting(f){
  if(f.dead||f.npc)return;const ps=post(f),x=f.p[PEL].x,q=P(x,f.gr(x),f.dep),set=f.posture==='set',off=f.posture==='off',bk=!!f.broken&&!f.downed,pulse=off||bk?.5+.5*Math.sin(S.t*7):0;
  // the ring is the balance bar: a segment a pip across the front (six for a named fighter, four for a crew man, eight for a boss),
  // lit left to right; a fighter Broken has it all in amber
  const fm=footMaxOf(f),fo=Math.min(f.foot,fm),rx=22+f.body.bulk*5,seg=Math.PI/fm,gap=fm>6?.05:.07;
  ctx.save();ctx.strokeStyle=bk?'#ffb347':ps.color;ctx.lineWidth=2;ctx.globalAlpha=bk?.4+pulse*.4:.16;
  ctx.beginPath();ctx.ellipse(q.x,q.y+2,rx,5,0,Math.PI,TAU);ctx.stroke();
  for(let i=0;i<fm;i++){const lit=i<fo;ctx.globalAlpha=lit?(set?.55:.75+pulse*.25):.16;ctx.lineWidth=lit?2.4:2;
    ctx.beginPath();ctx.ellipse(q.x,q.y+2,rx,5,0,Math.PI-(i+1)*seg+gap,Math.PI-i*seg-gap);ctx.stroke();}
  // a raised guard: a man down in cover from the guns, or one covering his partner (an answer to a single blow is not shown here)
  const gd=f.guarding&&!f.react;
  if(gd){ctx.strokeStyle='#a5dcff';ctx.globalAlpha=.75;ctx.beginPath();ctx.ellipse(q.x,q.y+2,28+f.body.bulk*5,7,0,Math.PI*1.05,Math.PI*1.95);ctx.stroke();}
  ctx.globalAlpha=set&&!bk?.6:.95;ctx.font='700 10px system-ui,sans-serif';ctx.textAlign='center';ctx.lineJoin='round';
  const gl=f.covering?'Covering':'Guard',st=f.downed?'Down':f.clinch?(f.clinch.a===f?'Holding':'Held'):'';
  let t=bk?'Broken':set?(gd?gl:''):ps.name+(gd?' · '+gl:'');if(st)t=st+(f.downed?'':t?' · '+t:'');if(f.daze&&!f.downed)t=(t?t+' · ':'')+'Dazed';t=t.toUpperCase();
  ctx.restore();
  return t?{t,x:q.x,y:q.y+19,color:bk?'#ffb347':set?'#a5dcff':ps.color,a:set&&!bk?.6:.95}:null;
}
// footing labels of fighters standing close together are stacked instead of printed over each other
function drawFootLabels(L){
  ctx.save();ctx.font='700 10px system-ui,sans-serif';ctx.textAlign='center';ctx.lineJoin='round';ctx.lineWidth=3;ctx.strokeStyle='rgba(11,8,32,.7)';
  for(const l of L){const m=ctx.measureText(l.t);l.w=((m&&m.width)||l.t.length*6)+10;}
  L.sort((a,b)=>a.y-b.y||a.x-b.x);
  for(let i=1;i<L.length;i++)for(let j=0;j<i;j++){const a=L[j],b=L[i];if(Math.abs(a.y-b.y)<12&&Math.abs(a.x-b.x)<(a.w+b.w)/2){b.y=a.y+12;j=-1;}}
  for(const l of L){ctx.globalAlpha=l.a;ctx.strokeText(l.t,l.x,l.y);ctx.fillStyle=l.color;ctx.fillText(l.t,l.x,l.y);}
  ctx.restore();
}
function drawTable(){
  const T=S.table;if(!T||!T.on||T.state==='broken')return;if(S.room==='kitchen'){drawPrepTable();return;}if(S.room==='lobby'){drawLobbyTable();return;}
  const Q=T.pts,bk=T.dep+TD,fr=T.dep-TD,lp=(a,b,u)=>({x:lerp(a.x,b.x,u),y:lerp(a.y,b.y,u)}),at=(q,d)=>P(q.x,q.y,d);
  const la=lp(Q[0],Q[1],.08),lb=lp(Q[0],Q[1],.92);
  ctx.lineCap='round';ctx.lineJoin='round';
  seg(at(la,bk),at(Q[3],bk),4.5,TABLE_BACK);seg(at(lb,bk),at(Q[2],bk),4.5,TABLE_BACK);
  seg(at(lp(la,Q[3],.55),bk),at(lp(lb,Q[2],.55),bk),2.4,TABLE_BACK);
  seg(at(lp(la,Q[3],.55),fr),at(lp(la,Q[3],.55),bk),2.2,TABLE_BACK);seg(at(lp(lb,Q[2],.55),fr),at(lp(lb,Q[2],.55),bk),2.2,TABLE_BACK);
  ctx.fillStyle=TABLE_TOP;poly([at(Q[0],bk),at(Q[1],bk),at(Q[1],fr),at(Q[0],fr)]);
  seg(at(Q[0],bk),at(Q[1],bk),1.2,'rgba(255,170,120,.5)');
  seg(at(la,fr),at(Q[3],fr),4.5,TABLE_COL);seg(at(lb,fr),at(Q[2],fr),4.5,TABLE_COL);seg(at(lp(la,Q[3],.55),fr),at(lp(lb,Q[2],.55),fr),2.4,TABLE_COL);
  seg(at(Q[0],fr),at(Q[1],fr),7,TABLE_COL);
  if(S.arena.indoor){const ux=(Q[1].x-Q[0].x),uy=(Q[1].y-Q[0].y),L=Math.hypot(ux,uy)||1,nx=-uy/L,ny=ux/L,o=(q,u,v)=>({x:q.x+ux/L*u+nx*v,y:q.y+uy/L*u+ny*v});
    const a0=o(Q[0],-5,-1),a1=o(Q[1],5,-1);ctx.fillStyle=RM.cloth;poly([at(a0,bk+3),at(a1,bk+3),at(a1,fr-3),at(a0,fr-3)]);
    ctx.fillStyle=RM.clothS;const dr=[];const N=10;for(let i=0;i<=N;i++){const u=i/N,b={x:lerp(a0.x,a1.x,u),y:lerp(a0.y,a1.y,u)};dr.push(at(b,fr-3));}
    for(let i=N;i>=0;i--){const u=i/N,b={x:lerp(a0.x,a1.x,u),y:lerp(a0.y,a1.y,u)},c=o(b,0,15+(i%2?3:0));dr.push(at(c,fr-3));}poly(dr);
    ctx.fillStyle=RM.cloth;for(const [q,sgn] of [[a0,-1],[a1,1]]){poly([at(q,bk+3),at(q,fr-3),at(o(q,sgn*2,15),fr-3),at(o(q,sgn*2,15),bk+3)]);}
    seg(at(a0,fr-3),at(a1,fr-3),1,'rgba(255,255,255,.55)');}
  for(const q of T.props){const s=P(q.x,q.y,T.dep);ctx.save();ctx.translate(s.x,s.y);ctx.rotate(q.ang);ctx.fillStyle=TABLE_COL;
    if(q.kind==='mug'){ctx.fillRect(-3.5,-4.5,7,9);ctx.strokeStyle=TABLE_COL;ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(4,0,2.6,-Math.PI/2,Math.PI/2);ctx.stroke();}
    else{ctx.beginPath();ctx.moveTo(-3,4);ctx.lineTo(-3,-1);ctx.lineTo(-1.2,-3.5);ctx.lineTo(-1.2,-8);ctx.lineTo(1.2,-8);ctx.lineTo(1.2,-3.5);ctx.lineTo(3,-1);ctx.lineTo(3,4);ctx.closePath();ctx.fill();}
    ctx.restore();}
}
// h is the grip, t the tip; sd mirrors one-sided heads (the axe blade)
function drawWeaponAt(key,h,t,sd){
  const wp=WEAPONS[key],L=Math.hypot(t.x-h.x,t.y-h.y)||1,ux=(t.x-h.x)/L,uy=(t.y-h.y)/L,nx=-uy,ny=ux;
  const pt=(a,b=0)=>({x:h.x+ux*a+nx*b,y:h.y+uy*a+ny*b});
  ctx.fillStyle=SIL;
  if(key==='sword'){
    seg(pt(-wp.butt),pt(0),3.4,SIL);circ(pt(-wp.butt),3);seg(pt(3,8),pt(3,-8),3.4,SIL);
    poly([pt(5,2.7),pt(wp.len-8,2.2),pt(wp.len+1),pt(wp.len-8,-2.2),pt(5,-2.7)]);
    seg(pt(8,1),pt(wp.len-6,.8),1,HL);
  }else if(key==='axe'){
    seg(pt(-wp.butt),pt(wp.len+5),3.6,SIL);
    const Pa=(a,b)=>pt(wp.len+a,b*sd);
    ctx.beginPath();let q=Pa(3,0);ctx.moveTo(q.x,q.y);q=Pa(9,12);ctx.lineTo(q.x,q.y);
    let c=Pa(-4,28),e=Pa(-21,13);ctx.quadraticCurveTo(c.x,c.y,e.x,e.y);
    for(const v of [Pa(-13,0),Pa(-7,-7),Pa(-2,-7)])ctx.lineTo(v.x,v.y);ctx.closePath();ctx.fill();
    ctx.strokeStyle=HL;ctx.lineWidth=1.1;ctx.beginPath();q=Pa(7,13);ctx.moveTo(q.x,q.y);c=Pa(-4,26.5);e=Pa(-19,14);ctx.quadraticCurveTo(c.x,c.y,e.x,e.y);ctx.stroke();
  }else if(key==='spear'){
    seg(pt(-wp.butt),pt(wp.len-12),3,SIL);seg(pt(wp.len-18,3.5),pt(wp.len-18,-3.5),3,SIL);
    poly([pt(wp.len-17),pt(wp.len-9,4.8),pt(wp.len+3),pt(wp.len-9,-4.8)]);
    seg(pt(wp.len-11,1),pt(wp.len+1,.3),1,HL);
  }else if(key==='dagger'){
    seg(pt(-wp.butt),pt(0),3.2,SIL);seg(pt(2,5),pt(2,-5),3,SIL);
    poly([pt(3,2.3),pt(wp.len-5,1.8),pt(wp.len+1),pt(wp.len-5,-1.8),pt(3,-2.3)]);
    seg(pt(5,.8),pt(wp.len-3,.5),1,HL);
  }else if(key==='bottle'){
    seg(pt(-2),pt(wp.len*.38),3.2,SIL);poly([pt(wp.len*.36,2.2),pt(wp.len*.5,4.4),pt(wp.len,4.4),pt(wp.len,-4.4),pt(wp.len*.5,-4.4),pt(wp.len*.36,-2.2)]);
    seg(pt(wp.len*.55,2.2),pt(wp.len*.93,2.2),1.1,'rgba(170,230,220,.55)');
  }else if(key==='shard'){
    seg(pt(-2),pt(wp.len*.55),3.2,SIL);poly([pt(wp.len*.5,2.6),pt(wp.len*.78,4.2),pt(wp.len*.9,1.2),pt(wp.len+2,2.4),pt(wp.len*.86,-1),pt(wp.len*.98,-4.4),pt(wp.len*.62,-3.4),pt(wp.len*.5,-2.6)]);
    seg(pt(wp.len*.6,-1),pt(wp.len*.95,-3.4),1,'rgba(170,230,220,.6)');
  }else if(key==='mug'){
    seg(pt(0),pt(3),3,SIL);poly([pt(3,-5.5),pt(wp.len+1,-5.5),pt(wp.len+1,5.5),pt(3,5.5)]);
    ctx.strokeStyle=SIL;ctx.lineWidth=2;ctx.beginPath();const m=pt(wp.len*.55,-8.5);ctx.arc(m.x,m.y,3.2,0,TAU);ctx.stroke();
    seg(pt(4,-4),pt(wp.len,-4),1,HL);
  }else if(key==='club'){
    seg(pt(-wp.butt),pt(wp.len),5.2,SIL);circ(pt(wp.len),3.6);seg(pt(wp.len*.2,1.4),pt(wp.len*.9,1.4),1,'rgba(255,190,140,.35)');
  }else if(key==='shaft'){
    seg(pt(-wp.butt),pt(wp.len-2),3,SIL);poly([pt(wp.len-4,2),pt(wp.len+2,1.2),pt(wp.len,-.2),pt(wp.len+3,-1.4),pt(wp.len-4,-2)]);
  }else if(key==='chairleg'){
    seg(pt(-wp.butt),pt(wp.len),3.6,SIL);circ(pt(wp.len*.18),3.4);circ(pt(wp.len*.62),2.9);seg(pt(wp.len*.2,1.2),pt(wp.len*.95,1),1,'rgba(255,190,140,.3)');
  }else if(key==='elven'){drawArcBladeAt(h,t,sd,null);
  }else if(key==='stone'){
    ctx.beginPath();const c=pt(wp.len*.55);ctx.ellipse(c.x,c.y,6.5,5.2,Math.atan2(uy,ux),0,TAU);ctx.fill();
    seg(pt(wp.len*.3,-2.5),pt(wp.len*.75,-3.8),1,HL);
  }
}
function drawWeapon(f){if(f.wp.unarmed)return;
  if(f.sheath&&S.t<f.sheath.t0+f.sheath.out&&f.scab===f.weaponKey){drawDrawing(f);return;}
  if(f.weaponKey==='elven'){drawArcBladeAt(f.p[HAF],f.p[TIP],f.facing,arcState(f));return;}
  drawWeaponAt(f.weaponKey,f.p[HAF],f.p[TIP],f.facing);}
// a dropped weapon lies wherever it landed; a is the butt end, b the tip
function drawItem(it){
  const wp=WEAPONS[it.key],a=P(it.a.x,it.a.y,it.dep),b=P(it.b.x,it.b.y,it.dep),L=Math.hypot(b.x-a.x,b.y-a.y)||1,u={x:(b.x-a.x)/L,y:(b.y-a.y)/L};
  const h={x:a.x+u.x*wp.butt,y:a.y+u.y*wp.butt};ctx.lineCap='round';ctx.lineJoin='round';drawWeaponAt(it.key,h,b,1);
}
const GORE_COL={red:{spat:'#a5132b',stain:'92,8,20',mark:'#d22a43'},ink:{spat:'#4b3184',stain:'66,42,118',mark:'#7d68ad'}};
function drawStains(){
  if(S.gore==='off'||!S.stains.length)return;const c=GORE_COL[S.gore];
  for(const st of S.stains){const q=P(st.x,S.arena.ground(st.x,st.d)+.5,st.d);ctx.fillStyle=`rgba(${c.stain},${st.a})`;ctx.beginPath();ctx.ellipse(q.x,q.y,st.r,st.r*.32,0,0,TAU);ctx.fill();}
}
function drawBlood(){
  if(S.gore==='off'||!S.blood.length)return;const c=GORE_COL[S.gore];ctx.fillStyle=c.spat;ctx.strokeStyle=c.spat;ctx.lineCap='round';
  for(const b of S.blood){const q=P(b.x,b.y,b.d),sp=Math.hypot(b.vx,b.vy);ctx.globalAlpha=.95;
    if(sp>140){ctx.lineWidth=b.r*1.3;ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(q.x-b.vx*.012,q.y-b.vy*.012);ctx.stroke();}else circ(q,b.r*.9);}
  ctx.globalAlpha=1;
}
// cuts and bruises stay on the silhouette for the rest of the fight
function drawMarks(f){
  if(S.gore==='off'||!f.marks.length)return;const c=GORE_COL[S.gore];ctx.strokeStyle=c.mark;ctx.fillStyle=c.mark;ctx.lineCap='round';
  const look=lookOn(f);
  for(const m of f.marks){if(m.rip&&look)continue;const a=f.p[m.a],b=f.p[m.b],L=Math.hypot(b.x-a.x,b.y-a.y)||1,o=m.off||0,x=lerp(a.x,b.x,m.u)-(b.y-a.y)/L*f.facing*o,y=lerp(a.y,b.y,m.u)+(b.x-a.x)/L*f.facing*o,ang=Math.atan2(b.y-a.y,b.x-a.x)+m.ang;
    if(m.edge){ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(x-Math.cos(ang)*m.len/2,y-Math.sin(ang)*m.len/2);ctx.lineTo(x+Math.cos(ang)*m.len/2,y+Math.sin(ang)*m.len/2);ctx.stroke();}
    else{ctx.globalAlpha=.75;circ({x,y},2.2);ctx.globalAlpha=1;}}
}
function drawFighter(f){
  // Kael has his own look (sk_lookui.js)
  if(lookOn(f)){drawKael(f);return;}
  // the named enemies (elves) and the crews (humans) have theirs (sk_castui.js)
  if(typeof castOn==='function'&&castOn(f)){drawCast(f);return;}
  const p=f.p,b=f.body,fa=f.facing,col=f.color,s=f.scarf;
  ctx.lineCap='round';ctx.lineJoin='round';
  if(!f.hench)for(let i=1;i<s.length;i++)seg(s[i-1],s[i],lerp(5.5,1.6,i/(s.length-1))*b.h,col);
  limb(p[CHE],p[ELB],p[HAB],b.limbW*.9,SIL_BACK);
  if(f.sidearm==='offhand')drawOffDagger(f);
  limb(p[PEL],p[KNB],p[FTB],b.limbW*1.05,SIL_BACK);foot(p[KNB],p[FTB],fa,b.limbW,SIL_BACK);
  seg(p[PEL],p[CHE],b.torsoW,SIL);ctx.fillStyle=SIL;circ(p[CHE],b.torsoW*.62);circ(p[PEL],b.torsoW*.52);
  if(f.sidearm)drawSheath(f);
  if(f.scab&&!f.dead)drawScabbard(f);
  if(!f.severed)seg(p[CHE],p[HEAD],b.limbW*.85,SIL);
  else if(S.gore!=='off'){ctx.fillStyle=GORE_COL[S.gore].mark;circ(p[CHE],b.torsoW*.34);}
  ctx.fillStyle=SIL;circ(p[HEAD],b.headR);
  const op=S.opening&&S.opening.f===f;
  ctx.globalAlpha=f.dead?.28:1;ctx.fillStyle=op?'#ffc163':col;circ(tacEye(f),(op?2.4:1.7)*b.h);ctx.globalAlpha=1;
  limb(p[PEL],p[KNF],p[FTF],b.limbW*1.1,SIL);foot(p[KNF],p[FTF],fa,b.limbW,SIL);
  drawWeapon(f);
  limb(p[CHE],p[ELF],p[HAF],b.limbW,SIL);ctx.fillStyle=SIL;circ(p[HAF],b.limbW*(f.wp.unarmed?.8:.62));
  if(f.wp.unarmed||f.wp.improv){ctx.fillStyle=SIL_BACK;circ(p[HAB],b.limbW*.7);}
  drawMarks(f);drawSuit(f);
}
// the scabbard on Kael's back hip, with the dagger's grip showing while it is sheathed
function drawSheath(f){
  const k=sheathPts(f);ctx.lineCap='round';
  seg(k.guard,k.tip,3.6,SIL);seg({x:lerp(k.guard.x,k.tip.x,.08),y:lerp(k.guard.y,k.tip.y,.08)},{x:lerp(k.guard.x,k.tip.x,.9),y:lerp(k.guard.y,k.tip.y,.9)},.9,HL);
  if(f.sidearm==='sheathed'){seg(k.cross[0],k.cross[1],2.6,SIL);seg(k.guard,k.pommel,3,SIL);ctx.fillStyle=SIL;circ(k.pommel,2.3);seg(k.grip,k.pommel,.8,HL);}
}
function drawTrail(tr){
  if(!tr||tr.length<2)return;
  for(let i=1;i<tr.length;i++){const a=tr[i-1],b=tr[i];if(b.t-a.t>DT*2.5)continue;const al=(1-b.age/b.life)*(b.c?.4:.34);if(al<=0)continue;
    ctx.globalAlpha=al;ctx.fillStyle=b.c||'#ffecd0';if(b.c)ctx.globalCompositeOperation='lighter';
    ctx.beginPath();ctx.moveTo(a.hx,a.hy);ctx.lineTo(a.tx,a.ty);ctx.lineTo(b.tx,b.ty);ctx.lineTo(b.hx,b.hy);ctx.closePath();ctx.fill();
    if(b.c){ctx.globalAlpha=al*.9;ctx.strokeStyle='#fff6e0';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(a.tx,a.ty);ctx.lineTo(b.tx,b.ty);ctx.stroke();ctx.globalCompositeOperation='source-over';}}
  ctx.globalAlpha=1;
}
// a turning fighter: the weapon's path drawn as an arc around the body, the far half behind it and the near half in front
function drawSwirl(f,u,px,back){
  const t=f.p[TIP],h=f.p[HAF],q={x:lerp(h.x,t.x,.85),y:lerp(h.y,t.y,.85)},dx=q.x-px,R=Math.max(Math.abs(dx),.5*(f.arm+f.wp.len)),sg=Math.sign(dx)||f.facing,phi=u*TAU,y0=q.y;
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
  const N=22,span=2.4;let prev=null;
  for(let i=0;i<=N;i++){const th=phi-span+span*i/N,dz=R*Math.sin(th),pt={x:px+sg*R*Math.cos(th)+dz*PSX,y:y0-dz*PSY};
    if(prev&&((Math.sin(th)>0)===back)){const a=(i/N);ctx.globalAlpha=a*a*.75;ctx.strokeStyle=f.color;ctx.lineWidth=1.5+a*4.5;ctx.beginPath();ctx.moveTo(prev.x,prev.y);ctx.lineTo(pt.x,pt.y);ctx.stroke();
      ctx.globalAlpha=a*a*.6;ctx.strokeStyle='#fff6e0';ctx.lineWidth=1.2;ctx.stroke();}
    prev=pt;}
  ctx.restore();
}
// afterimage: a glowing outline of the pose a moment ago
function drawGhost(g){
  const u=g.age/g.life,a=(1-u)*.26;if(a<=0)return;const Q=g.pts,pt=i=>({x:Q[i][0],y:Q[i][1]});
  ctx.save();ctx.translate(g.d*PSX,-g.d*PSY);ctx.globalAlpha=a;ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.lineJoin='round';
  const c=g.color;ctx.fillStyle=c;
  limb(pt(CHE),pt(ELB),pt(HAB),g.lw*.8,c);limb(pt(PEL),pt(KNB),pt(FTB),g.lw*.95,c);
  seg(pt(PEL),pt(CHE),g.tw*.85,c);seg(pt(CHE),pt(HEAD),g.lw*.7,c);circ(pt(HEAD),g.hr*.92);
  limb(pt(PEL),pt(KNF),pt(FTF),g.lw,c);limb(pt(CHE),pt(ELF),pt(HAF),g.lw*.9,c);seg(pt(HAF),pt(TIP),2.6,c);
  ctx.restore();
}
function drawFx(){
  drawBlood();
  if(!(typeof FXL!=='undefined'&&FXL.fx())){
  for(const r of S.rings){const u=r.age/r.life,q=P(r.x,S.arena.ground(r.x,r.d),r.d),R=6+r.r*eOut(u);
    ctx.globalAlpha=(1-u)*.85;ctx.strokeStyle=r.color;ctx.lineWidth=3.2*(1-u)+.8;ctx.beginPath();ctx.ellipse(q.x,q.y,R,R*.28,0,0,TAU);ctx.stroke();
    ctx.globalAlpha=(1-u)*.35;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(q.x,q.y,R*.62,R*.62*.28,0,0,TAU);ctx.stroke();}
  for(const d of S.dusts){const u=d.age/d.life;ctx.globalAlpha=(1-u)*(d.c?.55:.38);ctx.fillStyle=d.c||'#e0ae8e';circ(P(d.x,d.y,d.d),d.r*(1+u*1.6));}
  ctx.lineCap='round';
  for(const s of S.sparks){ctx.globalAlpha=1-s.age/s.life;seg(P(s.x,s.y,s.d),P(s.x-s.vx*.018,s.y-s.vy*.018,s.d),1.6,s.color);}
  for(const e of S.flashes){const u=e.age/e.life,q=P(e.x,e.y,e.d);ctx.globalAlpha=(1-u)*.9;ctx.strokeStyle=e.color;ctx.lineWidth=3*(1-u)+1;
    ctx.beginPath();ctx.arc(q.x,q.y,e.r*(.25+eOut(u)),0,TAU);ctx.stroke();
    if(u<.35){ctx.globalAlpha=(1-u/.35)*.7;ctx.fillStyle=e.color;circ(q,e.r*.45*(1-u));}}
  ctx.globalAlpha=1;}
  ctx.textAlign='center';ctx.lineJoin='round';
  placePopups();
  for(const p of S.popups){const a=p.age,rise=-28*eOut(a/.55)-a*6,sc=1+.55*(1-eOut(a/.16));
    ctx.save();ctx.globalAlpha=1-clamp((a-.95)/.38,0,1);ctx.translate(prjX(p.x,p.d)+(p.nx||0),prjY(p.y,p.d)+rise+(p.ny||0));ctx.scale(sc,sc);
    ctx.font=`italic 700 ${p.size}px "Barlow Semi Condensed","Arial Narrow",sans-serif`;
    ctx.lineWidth=5;ctx.strokeStyle='#0b0820';ctx.strokeText(p.text,0,0);ctx.fillStyle=p.color;ctx.fillText(p.text,0,0);
    if(p.sub){ctx.font='700 14px "Alegreya SC",Georgia,serif';ctx.lineWidth=4;ctx.strokeText(p.sub.toUpperCase(),0,-p.size*.95);ctx.fillStyle='#ffd36b';ctx.fillText(p.sub.toUpperCase(),0,-p.size*.95);}
    ctx.restore();}
  drawCallouts();
}
// popups step sideways off the technique callouts and off each other, oldest first, easing into place; one that would rise under the
// top bar (or a scene's letterbox) stops below it
function placePopups(){
  if(!S.popups.length)return;
  const boxes=[],hit=(b,l,r,t,bt)=>l<b.r&&r>b.l&&t<b.b&&bt>b.t,
    lim=camTop()+(Math.max(HUD_IN.top,typeof ST_LB!=='undefined'?cssH*.105*ST_LB:0)+4)*cam.viewW/Math.max(1,cssW);
  ctx.save();ctx.font='800 16px "Alegreya SC",Georgia,serif';
  for(const c of S.callouts){const f=S.F[c.i];if(!f)continue;const u=c.age/c.life,h=f.p[HEAD],q=P(h.x+(c.dx||0),h.y-f.body.headR-34+(c.dy||0),f.dep);
    ctx.font=c.big?'800 22px "Alegreya SC",Georgia,serif':'800 16px "Alegreya SC",Georgia,serif';
    const t=c.text.toUpperCase(),m=ctx.measureText(t),w=((m&&m.width)||t.length*(c.big?12:9))/2+4,y=q.y-12*eOut(u)-(c.big?8:0);boxes.push({l:q.x-w,r:q.x+w,t:y-(c.big?23:17),b:y+9});}
  for(const p of S.popups){
    if(p.w==null){ctx.font=`italic 700 ${p.size}px "Barlow Semi Condensed","Arial Narrow",sans-serif`;const m=ctx.measureText(p.text);let w=(m&&m.width)||p.text.length*p.size*.5;
      if(p.sub){ctx.font='700 14px "Alegreya SC",Georgia,serif';const m2=ctx.measureText(p.sub.toUpperCase());w=Math.max(w,(m2&&m2.width)||p.sub.length*9);}p.w=w/2+5;}
    const a=p.age,x0=prjX(p.x,p.d),y1=prjY(p.y,p.d)-28*eOut(a/.55)-a*6;p.ny=Math.max(0,lim-(y1-p.size*.82-(p.sub?p.size*.95:0)));
    const y0=y1+p.ny,t=y0-p.size*.82-(p.sub?p.size*.95:0),bt=y0+5;
    const free=dx=>!boxes.some(b=>hit(b,x0+dx-p.w,x0+dx+p.w,t,bt));
    let best=0;
    if(!free(0)){const cand=[];for(const b of boxes)if(t<b.b&&bt>b.t)cand.push(b.r+p.w+2-x0,b.l-p.w-2-x0);
      cand.sort((u,v)=>Math.abs(u)-Math.abs(v));best=cand.find(free)??0;}
    p.nx=p.nx==null?best:p.nx+(best-p.nx)*.3;
    boxes.push({l:x0+p.nx-p.w,r:x0+p.nx+p.w,t,b:bt});}
  ctx.restore();
}
// the technique's name over the fighter as the move starts
function drawCallouts(){
  for(const c of S.callouts){const f=S.F[c.i];if(!f)continue;const u=c.age/c.life,h=f.p[HEAD],q=P(h.x+(c.dx||0),h.y-f.body.headR-34+(c.dy||0),f.dep);
    const a=u<.1?u/.1:u>.62?1-(u-.62)/.38:1,sc=1+(c.big?.6:.35)*(1-eOut(Math.min(1,u/.1))),t=c.text.toUpperCase();
    ctx.save();ctx.globalAlpha=clamp(a,0,1);ctx.translate(q.x,q.y-12*eOut(u)-(c.big?8:0));ctx.scale(sc,sc);
    ctx.font=c.big?'800 22px "Alegreya SC",Georgia,serif':'800 16px "Alegreya SC",Georgia,serif';ctx.textAlign='center';ctx.lineJoin='round';
    const m=ctx.measureText(t),w=((m&&m.width)||t.length*(c.big?12:9))/2,k=eOut(Math.min(1,u/.3));
    ctx.lineWidth=c.big?6:5;ctx.strokeStyle='rgba(11,8,32,.9)';ctx.strokeText(t,0,0);ctx.fillStyle=c.big?'#ffd36b':'#fff3dc';ctx.fillText(t,0,0);
    ctx.strokeStyle=f.color;ctx.lineWidth=2.4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-w*k,6);ctx.lineTo(w*k,6);ctx.stroke();
    ctx.restore();}
}
function intentLabel(f){const it=f.intent;if(!it)return'';const K=targetOf(f)||S.F[0];return ATTACKS.includes(it.cmd)?pickTechnique(f,K,it.cmd).name:DIRTY.includes(it.cmd)?dirtyTech(f,K,it.cmd).name:it.cmd==='wait'&&f.clinch?'Keep the hold':it.cmd==='wait'?'Hold':it.cmd==='grab'&&facingAway(K,f)?'Grab from behind':ACTIONS[it.cmd].name;}
// on a narrow screen the scene carries its own HP bars, since the status panel sits below the commands
// (an upright phone's top bar keeps only the hero's plate and his target's: sk_hudui.js, hudFocus)
function drawHeadBars(){
  if(cssW>=640&&!(typeof HUD!=='undefined'&&HUD.focus))return;const k=cam.viewW/Math.max(1,cssW);ctx.save();
  for(const f of S.F){if(f.dead||f.npc)continue;const h=f.p[HEAD],q=P(h.x,h.y,f.dep),w=30*k,bh=3.5*k,x=q.x-w/2,y=q.y-f.body.headR-5*k-bh,fr=clamp(f.hp/f.maxHp,0,1);
    ctx.globalAlpha=.95;ctx.fillStyle='rgba(6,10,34,.8)';ctx.fillRect(x-k,y-k,w+2*k,bh+2*k);ctx.fillStyle=fr>.5?'#66dc93':fr>.25?'#ffc163':'#ff5f6d';ctx.fillRect(x,y,w*fr,bh);
    ctx.strokeStyle=f.color;ctx.lineWidth=k;ctx.strokeRect(x-k,y-k,w+2*k,bh+2*k);}
  ctx.restore();}
// What each enemy means to do, over his head, and when it comes in your turns. Drawn on the screen's own scale (CSS pixels), so it
// reads the same on a phone as on a desktop. The commanding hero's target gets a marker pointing down at its head, and an enemy at
// his back puts a warning over him.
function labelFonts(){const big=cssW>=1000&&cssH>=600;
  return big?{a:'italic 600 15px "Barlow Semi Condensed","Arial Narrow",sans-serif',b:'500 12.5px "Barlow Semi Condensed","Arial Narrow",sans-serif',w:'600 13px "Barlow Semi Condensed","Arial Narrow",sans-serif',ah:15,bh:12.5,px:11,py:4}
    :{a:'italic 600 13px "Barlow Semi Condensed","Arial Narrow",sans-serif',b:'500 11px "Barlow Semi Condensed","Arial Narrow",sans-serif',w:'600 11px "Barlow Semi Condensed","Arial Narrow",sans-serif',ah:13,bh:11,px:9,py:3};}
function drawLabels(){
  const g=S.game,Hh=cmdHero(),human=g.phase==='input'&&!isAI(g.active)&&S.F[g.active].team===0&&!S.opening,two=heroes().length>1,ht=getTgt(Hh);
  const dpr=cv.width/Math.max(1,cssW),k=cssW/cam.viewW,L=cam.x-cam.viewW/2,T=camTop(),fo=labelFonts(),lift=cssW<640||(typeof HUD!=='undefined'&&HUD.focus)?13:6,TRI=8;
  const B=[],tw=(t,f)=>{ctx.font=f;const m=ctx.measureText(t);return(m&&m.width)||t.length*6.5;};
  const head=f=>{const h=f.p[HEAD],q=P(h.x,h.y-f.body.headR,f.dep);return{x:(q.x-L)*k,y:(q.y-T)*k-lift};};
  ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.lineWidth=1;
  for(const f of foes()){const it=human&&f.intent&&cmdValid(f,targetOf(f),f.intent.cmd)?f.intent:null,tgt=f.idx===ht&&g.phase!=='over';
    if(!it&&!tgt)continue;const q=head(f);let a='',b='',w=0,h=0;
    if(it){a='▸ '+intentLabel(f)+(two&&targetOf(f)?' → '+targetOf(f).name:'');b=(it.changed?'changed plan · ':'')+(f._when||'')+(f._back?' · at your back':'');
      w=Math.max(tw(a,fo.a),b?tw(b,fo.b):0)+fo.px*2;h=fo.ah+(b?fo.bh+3:0)+fo.py*2+1;}
    B.push({x:q.x,y:q.y,a,b,w,h,tri:tgt?TRI+3:0,back:!!f._back,col:Hh.color});}
  // a man at the hero's back
  if(human&&S.F[g.active]===Hh&&!Hh.downed&&!(Hh.guarding&&Hh.circleGuard)){const bh=foes().filter(f=>facingAway(Hh,f));
    if(bh.length){const q=head(Hh),t=`${names(bh)} at your back: +2 to hit you`;B.push({x:q.x,y:q.y,warn:t,w:tw(t,fo.w)+16,h:fo.bh+fo.py*2+4,tri:0});}}
  // lowest first. A box that would overlap one already placed goes up over it while there is room under the top bar; where there is
  // none it goes beside it instead, at its own height
  B.sort((u,v)=>v.y-u.y);const placed=[],top0=HUD_IN.top+3,hits=(x,w,t,b)=>placed.find(p=>Math.abs(p.x-x)<(p.w+w)/2+4&&t<p.b+3&&b>p.t-3);
  for(const o of B){const b0=o.y-o.tri-(o.tri?3:0),fit=x=>clamp(x,o.w/2+4,cssW-o.w/2-4);o.hx=o.x;let x=fit(o.x),bot=b0,h=hits(x,o.w,bot-o.h,bot),n=0;
    while(h&&n<6&&h.t-3-o.h>=top0){bot=h.t-3;h=hits(x,o.w,bot-o.h,bot);n++;}
    if(h){bot=Math.max(b0,top0+o.h);let best=null;
      for(const p of placed)for(const nx of [p.x-(p.w+o.w)/2-6,p.x+(p.w+o.w)/2+6]){const c=fit(nx);if(!hits(c,o.w,bot-o.h,bot)){const d=Math.abs(c-o.x);if(!best||d<best.d)best={x:c,d};}}
      if(best)x=best.x;}
    if(bot-o.h<top0)bot=top0+o.h;o.x=x;o.tp=bot-o.h;o.bt=bot;if(o.h)placed.push({x:o.x,w:o.w,t:o.tp,b:o.bt+(Math.abs(o.x-o.hx)<2?o.tri:0)});}
  for(const o of B){
    if(o.tri){const x=o.hx,y=o.y-TRI;ctx.fillStyle=o.col;ctx.beginPath();ctx.moveTo(x-7,y);ctx.lineTo(x+7,y);ctx.lineTo(x,y+TRI);ctx.closePath();ctx.fill();}
    if(!o.h)continue;const x0=Math.round(o.x-o.w/2)+.5,y0=Math.round(o.tp)+.5;
    ctx.fillStyle=o.warn?'rgba(8,6,12,.8)':'rgba(8,6,12,.74)';ctx.fillRect(x0,y0,o.w,o.h);
    ctx.strokeStyle=o.warn?'rgba(255,150,110,.5)':'rgba(226,182,90,.3)';ctx.strokeRect(x0,y0,o.w,o.h);
    if(o.warn){ctx.font=fo.w;ctx.fillStyle='#ffb795';ctx.fillText(o.warn,o.x,o.tp+fo.py+2+fo.bh*.9);continue;}
    ctx.font=fo.a;ctx.fillStyle='#f2cf86';ctx.fillText(o.a,o.x,o.tp+fo.py+fo.ah*.9);
    if(o.b){ctx.font=fo.b;ctx.fillStyle=o.back?'#ffb795':'#cfc4a8';ctx.fillText(o.b,o.x,o.tp+fo.py+fo.ah+3+fo.bh*.9);}}
  ctx.restore();
}
function drawDebug(){
  const C='#7cf4ff';ctx.lineWidth=1;ctx.font='600 11px "Barlow Semi Condensed",sans-serif';ctx.textAlign='left';
  for(const f of S.F){const d=f.dbg,p=f.p;ctx.save();ctx.translate(f.dep*PSX,-f.dep*PSY);
    const pairs=[[PEL,d.pel],[CHE,d.che],[HEAD,d.head],[HAF,d.hand],[HAB,d.off],[TIP,d.tip],[ELF,d.elF],[ELB,d.elB],[KNF,d.knF],[KNB,d.knB],[FTF,d.ftF],[FTB,d.ftB]];
    for(const [i,t] of pairs){if(!t)continue;ctx.strokeStyle='rgba(124,244,255,.45)';ctx.beginPath();ctx.moveTo(p[i].x,p[i].y);ctx.lineTo(t.x,t.y);ctx.stroke();
      ctx.strokeStyle=C;ctx.beginPath();ctx.arc(t.x,t.y,2.6,0,TAU);ctx.stroke();}
    for(const s of f.steps){const q=s.active?{x:s.to.x,y:f.gr(s.to.x)-3}:s.plant;ctx.fillStyle=s.active?'#ffc163':C;ctx.beginPath();ctx.moveTo(q.x-4,q.y+7);ctx.lineTo(q.x+4,q.y+7);ctx.lineTo(q.x,q.y+2);ctx.closePath();ctx.fill();}
    const h=p[HEAD],y=h.y-f.body.headR-12;ctx.fillStyle='rgba(10,8,30,.65)';ctx.fillRect(h.x-16,y,32,4);ctx.fillStyle=C;ctx.fillRect(h.x-16,y,32*f.motor,4);
    ctx.restore();}
  if(tableIntact()){const b=tableBox(),T=S.table,g=S.arena.ground(b.cx,T.dep);ctx.strokeStyle='rgba(124,244,255,.6)';ctx.setLineDash([4,4]);
    const c=[P(b.l,g,T.dep-TD),P(b.r,g,T.dep-TD),P(b.r,g,T.dep+TD),P(b.l,g,T.dep+TD)];ctx.beginPath();c.forEach((q,i)=>i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));ctx.closePath();ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle=C;ctx.fillText('table footprint',c[3].x,c[3].y-5);}
  const ex=S.game.ex;
  if(ex&&ex.plan&&ex.D){const c=ex.plan.Cfn(),q=P(c.x,c.y,ex.D.dep),A='#ffc163';ctx.strokeStyle=A;ctx.lineWidth=1.4;ctx.beginPath();
    ctx.moveTo(q.x-7,q.y);ctx.lineTo(q.x+7,q.y);ctx.moveTo(q.x,q.y-7);ctx.lineTo(q.x,q.y+7);ctx.stroke();ctx.beginPath();ctx.arc(q.x,q.y,4,0,TAU);ctx.stroke();
    ctx.fillStyle=A;ctx.fillText(ex.plan.shove?'push':ex.plan.Timp===undefined?'move':'contact',q.x+8,q.y-6);
    const sx=ex.plan.strikeX,z=ex.A.lane,s=P(sx,S.arena.ground(sx,z),z);ctx.beginPath();ctx.moveTo(s.x,s.y+2);ctx.lineTo(s.x,s.y+14);ctx.stroke();ctx.fillText('strike',s.x+4,s.y+14);}
}
// who is drawn turned in the round in a spin: Kael, the cast and the beasts (the others are squeezed across)
function turnsRound(f){return typeof FigKit!=='undefined'&&(lookOn(f)||(typeof castOn==='function'&&castOn(f))||(!!f.beast&&typeof BeastLook!=='undefined'&&!!BeastLook.turns&&!S.classicLook));}
// ---------- turning round ----------
// The game turns Kael to face the other way at once (a step past a man, a cut at the one behind him, a scene's turn to face someone).
// He is drawn turning round to it instead: his body through the front view over TURN.dur of a second, eased in and out, his head ahead
// of it, his coat swinging out a little. ang is the way he is drawn facing: 0 his profile facing right, π facing left, and between them
// turned toward the viewer. Up to the front view he is drawn in the frame of the way he faced, past it in the frame of the way he faces
// now, in the pose he was last drawn in (carried along with him), mirrored as the frame needs, easing into the pose the game has him in.
// As he faces the viewer his hands come in to the middle of him and his feet in under him, so the hand that holds the blade (in
// profile always the near one) changes over unseen. Only drawing: the game's own Kael is never touched.
const TURN={dur:.36,head:.62,settle:.26,jump:40};
function turnsAround(f){return typeof FigKit!=='undefined'&&lookOn(f);}
// standing on his own feet and his own master: not down, dead, mounted, held or tumbling, his chest over his hips
function canTurn(f){if(f.dead||f.downed||f.mount||f.clinch||f.hidden||(f.motor!=null&&f.motor<.5)||S.t<(f.knockUntil||0))return false;
  const P=f.p[PEL],C=f.p[CHE],dx=C.x-P.x,dy=C.y-P.y;return dy<-.6*Math.hypot(dx,dy);}
// (trails: draws the weapon's trail when he is not turning, for the game's blade swings across at once when he turns and he is not drawn
// so; sp: a spin he is in. A spin is drawn as before, all the way round, but begun from wherever a turn has him, the rest of the turn
// carried round in it: a man behind him is cut at by a spin that starts from the way he faced)
function drawTurned(f,trails,sp){
  const fa=f.facing,tgt=fa>0?0:Math.PI,J=f.p,cx=(J[PEL].x+J[CHE].x)/2,cy=(J[PEL].y+J[CHE].y)/2,rf=S._rf||0;
  let T=f._turn;
  // (a figure not drawn the frame before, or carried off somewhere at once, a scene setting him up, starts afresh where it is)
  if(!T||T.rf!==rf-1||Math.hypot(cx-T.cx,cy-T.cy)>TURN.jump||!canTurn(f))T=f._turn={ang:tgt,angH:tgt,a0:tgt,h0:tgt,ts:-9,fa,snap:null,flipT:-9,live:null,spin:null};
  else if(fa!==T.fa){
    // a turn (or a turn back before the last one is done): from the way he is drawn now, out of the pose he was last drawn in
    T.snap=T.live?T.live.map(q=>({x:q.x-T.cx,y:q.y-T.cy})):null;T.flipT=S.t;T.fa=fa;T.a0=T.ang;T.h0=T.angH;T.ts=S.t;}
  const toward=(a0,dur)=>{const span=Math.abs(tgt-a0)/Math.PI;if(span<1e-4)return tgt;const u=Math.min(1,(S.t-T.ts)/(dur*span));return a0+(tgt-a0)*u*u*(3-2*u);};
  T.ang=toward(T.a0,TURN.dur);T.angH=toward(T.h0,TURN.dur*TURN.head);T.rf=rf;T.cx=cx;T.cy=cy;
  // his pose in the frame of the way he faces now: the one he turned from, mirrored, easing into the game's
  const w=T.snap?Math.min(1,(S.t-T.flipT)/TURN.settle):1,ws=w*w*(3-2*w);
  // (kept in one array of its own, written over each frame)
  if(!T.buf)T.buf=J.map(()=>({x:0,y:0}));const live=T.buf;
  for(let i=0;i<J.length;i++){const q=J[i],o=live[i];if(ws>=1){o.x=q.x;o.y=q.y;}else{o.x=lerp(cx-T.snap[i].x,q.x,ws);o.y=lerp(cy+T.snap[i].y,q.y,ws);}}
  T.live=live;if(ws>=1)T.snap=null;
  // how far round he is drawn, as a turn from the way the game has him facing (his old way is -π, the front view -π/2), his head too
  const yOf=a=>fa<0?a-Math.PI:-a;let ynew=yOf(T.ang),hnew=yOf(T.angH),u=null;
  if(sp){u=(S.t-sp.t0)/(sp.t1-sp.t0);if(!T.spin||T.spin.t0!==sp.t0)T.spin={t0:sp.t0,y0:ynew,h0:hnew};
    const S0=T.spin,ys=FigKit.spinYaw(u);ynew=S0.y0+ys*(TAU-S0.y0)/TAU;hnew=S0.h0+FigKit.headYaw(ys)*(TAU-S0.h0)/TAU;
    // (he comes out of the spin facing the way the game has him: the turn is done)
    T.ang=T.a0=tgt;T.angH=T.h0=tgt;}
  else T.spin=null;
  if(!sp&&T.ang===tgt&&ws>=1){if(trails)trails();drawFighter(f);return;}
  if(sp)drawSwirl(f,u,cx,true);
  if(sp&&T.spin.y0===0&&T.spin.h0===0&&ws>=1){f._yaw=ynew;f._spinU=u;try{drawFighter(f);}finally{f._yaw=0;f._spinU=null;}}
  else{
    // the frame he is drawn in (the old way until the front view), the pose in it, his hands and feet coming in at the front view
    const old=ynew<-Math.PI/2,faD=old?-fa:fa,mir=faD!==fa,yaw=old?Math.PI-ynew:ynew,hy=mir?Math.PI-hnew:hnew,kd=Math.min(1,Math.abs(ynew+Math.PI/2)/(.22*Math.PI)),kA=kd*kd*(3-2*kd);
    const P=live.map((q,i)=>{const x=mir?2*cx-q.x:q.x,vx=J[i].px!=null?J[i].x-J[i].px:0,vy=J[i].py!=null?J[i].y-J[i].py:0;return{x,y:q.y,px:x-(mir?-vx:vx),py:q.y-vy};});
    // (the coat's motion is run on the body the game has: f._phys)
    const p0=f.p,fa0=f.facing;f.p=P;f.facing=faD;f._yaw=yaw;f._headYaw=hy;f._latArm=kA;f._latLeg=.45+.55*kA;f._spinU=sp?u:Math.asin(.45*Math.abs(Math.sin(ynew)))/Math.PI;f._phys={p:p0,fa:fa0,mir,cx};
    try{drawFighter(f);}finally{f.p=p0;f.facing=fa0;f._yaw=0;f._headYaw=undefined;f._latArm=undefined;f._latLeg=undefined;f._spinU=null;f._phys=undefined;}}
  if(sp)drawSwirl(f,u,cx,false);}
// one fighter as the draw list has him, in his depth's frame
function drawFighterItem(f,trails){
  const sp=f.spin&&S.t>=f.spin.t0&&S.t<=f.spin.t1?f.spin:null;
  // a spin: Kael and the cast turn round in the round (their looks draw them turned: f._yaw, FigKit.spinYaw), shoulders, arms,
  // head and coat each as they are seen; the old figures are squeezed across and back as before
  // (Kael: his turns round and his spins, drawTurned)
  if(turnsAround(f))drawTurned(f,trails,sp);
  else if(sp){const u=(S.t-sp.t0)/(sp.t1-sp.t0),c=Math.cos(u*TAU),px=(f.p[PEL].x+f.p[CHE].x)/2,sx=c>=0?Math.max(.07,c):Math.min(-.07,c);
    drawSwirl(f,u,px,true);
    // (the lizard's tail comes round at the even rate the game sweeps it at, so it hits where it is drawn: drawnX)
    if(turnsRound(f)){f._yaw=f.tailAct?u*TAU:FigKit.spinYaw(u);f._spinU=u;try{drawFighter(f);}finally{f._yaw=0;f._spinU=null;}}
    else{ctx.save();ctx.translate(px,0);ctx.scale(sx,1);ctx.translate(-px,0);drawFighter(f);ctx.restore();}
    drawSwirl(f,u,px,false);}
  else{trails();drawFighter(f);}}
function render(){
  const t0r=performance.now();
  S._rf=(S._rf||0)+1;
  const s=cv.width/cam.viewW,viewH=cam.viewW/aspect,L=cam.x-cam.viewW/2,T=camTop();
  const sh=reduceMotion?0:S.shake,dir=S.shakeDir||{x:0,y:0},osc=Math.cos(performance.now()*.05);
  let ox=(dir.x*osc*.9+(uiRand()*2-1)*.3)*sh,oy=(dir.y*osc*.7+(uiRand()*2-1)*.3)*sh;
  if(S.camKick&&!reduceMotion){const k=Math.max(0,1-S.camKick.t/.3);ox+=S.camKick.x*k*k;oy+=S.camKick.y*k*k;}
  // under the world's foot the screen is the page's dark; the floor fades into it
  const yFoot=(H-T+oy)*s;if(yFoot<cv.height){ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#05050a';ctx.fillRect(0,Math.max(0,yFoot-4),cv.width,cv.height);}
  ctx.setTransform(s,0,0,s,(-L+ox)*s,(-T+oy)*s);
  if(S.arena.indoor)drawRoom(L,T,cam.viewW,viewH);else{drawSky(L,T,cam.viewW,viewH);drawFloor();}
  // the light and the air (sk_lightui.js): the fighters' sprites, their reflections, the light on the floor, the air behind them
  const fxl=typeof FXL!=='undefined'&&FXL.on();if(fxl)FXL.frame(s,L,T,ox,oy);
  drawSpills();drawLampPools();
  drawStains();drawRestingShards();
  drawShadows();drawEnvShadows();
  const fl=[];for(const f of S.F){const l=drawFooting(f);if(l)fl.push(l);}drawFootLabels(fl);
  // everything that stands on the floor, far to near
  const ex=S.game.ex,items=[];
  for(const f of S.F)if(!f.gone)items.push({d:f.dep-(ex&&ex.A===f?.05:0)+(f.dead?.03:0),f});
  if(S.table&&S.table.on&&S.table.state!=='broken')items.push({d:S.table.dep,tb:1});
  for(const p of S.debris)if(!p.taken)items.push({d:p.dep,sg:p,col:p.col||TABLE_COL});
  envItems(items);
  for(const p of S.rubble)if(!p.taken)items.push({d:p.dep,sg:p,col:STONE});
  for(const it of S.items)items.push({d:it.dep,item:it});
  for(const g of S.ghosts)items.push({d:g.d+.02,gh:g});
  items.sort((a,b)=>b.d-a.d);
  for(const it of items){
    if(it.f){const f=it.f;
      // (with the effects on he was drawn into his own sprite before the floor's shadows: it is set down here)
      if(fxl&&FXL.put(f))continue;
      ctx.save();ctx.translate(f.dep*PSX,-f.dep*PSY);
      drawFighterItem(f,()=>{drawTrail(S.trails[f.idx]);if(f.offTrail)drawTrail(f.offTrail);});
      ctx.restore();}
    else if(it.gh)drawGhost(it.gh);
    else if(it.item)drawItem(it.item);
    else if(it.tb)drawTable();
    else if(drawEnvItem(it)){}
    else drawDebrisPiece(it.sg,it.d,it.col);
  }
  if(fxl)FXL.front();
  if(yFoot<cv.height+40*s){const y0=(H-8-T+oy)*s,y1=(H+40-T+oy)*s;ctx.setTransform(1,0,0,1,0,0);const fg=ctx.createLinearGradient(0,y0,0,y1);
    fg.addColorStop(0,'rgba(5,5,10,0)');fg.addColorStop(1,'rgba(5,5,10,1)');ctx.fillStyle=fg;ctx.fillRect(0,y0,cv.width,cv.height-y0);ctx.setTransform(s,0,0,s,(-L+ox)*s,(-T+oy)*s);}
  if(fxl)FXL.grade();
  // (the head bars under the intent labels: a label over a neighbour's head is read whole)
  drawFx();drawHeadBars();drawLabels();
  for(const fn of V11UI.world)fn();
  if(S.debug)drawDebug();
  if(S.opening){
    const f=S.opening.f,h=P(f.p[HEAD].x,f.p[HEAD].y,f.dep),pulse=.5+.5*Math.sin(performance.now()/140);
    ctx.strokeStyle=`rgba(255,193,99,${.45+.4*pulse})`;ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(h.x,h.y,f.body.headR+6+pulse*3,0,TAU);ctx.stroke();
    ctx.setTransform(1,0,0,1,0,0);
    const w=cv.width,hh=cv.height,vg=ctx.createRadialGradient(w/2,hh*.55,Math.min(w,hh)*.25,w/2,hh*.55,Math.max(w,hh)*.75);
    vg.addColorStop(0,'rgba(6,5,24,0)');vg.addColorStop(1,'rgba(6,5,24,.62)');ctx.fillStyle=vg;ctx.fillRect(0,0,w,hh);
  }
  drawWipe();
  if(V11UI.screen.length){ctx.setTransform(1,0,0,1,0,0);for(const fn of V11UI.screen)fn();}
  if(fxl)FXL.done(performance.now()-t0r);
}

// ---------- DOM ----------
// keys 1 to 9 and 0 pick the first ten; Feint (F) sits beside Counter, Team move and Cover (- and =) after it
const CMD_ORDER=['slash','overhead','thrust','sweep','shove','guard','advance','sidestep','withdraw','wait','feint','team','cover'];
const cmdBox=$('cmds');
let previewCmd=null;
function wirePreview(b,k){for(const ev of ['pointerenter','focus'])b.addEventListener(ev,()=>{if(!b.disabled)previewAction(k);});
  for(const ev of ['pointerleave','blur'])b.addEventListener(ev,()=>{if(previewCmd===k)previewAction(null);});}
const CMD_KEY={slash:'1',overhead:'2',thrust:'3',sweep:'4',shove:'5',guard:'6',advance:'7',sidestep:'8',withdraw:'9',wait:'0',feint:'F',team:'−',cover:'='};
CMD_ORDER.forEach(k=>{const b=document.createElement('button');b.type='button';b.className='cmd';b.id='cmd-'+k;
  b.innerHTML=`<span id="n-${k}">${ACTIONS[k].name}</span><span class="ft" id="f-${k}"></span><span class="tq" id="t-${k}"></span><small id="h-${k}"></small><kbd class="ck" aria-hidden="true">${CMD_KEY[k]}</kbd>`;b.addEventListener('click',()=>humanCommand(k));wirePreview(b,k);cmdBox.appendChild(b);});
function previewAction(k){previewCmd=k;updateOrder();}
function humanCommand(k){ensureAudio();const g=S.game;if(g.phase!=='input'||isAI(g.active)||S.opening)return;const A=S.F[g.active],act=slotAction(A,targetOf(A),k);if(!act)return;previewCmd=null;command(g.active,act);}
const opBtns=$('opBtns');
function humanOpening(k){ensureAudio();const o=S.opening;if(!o||isAI(o.f.idx)||!openingChoices(o).includes(k)||!openValid(o,k))return;previewCmd=null;markPicked(k);resolveOpening(k);}
function markPicked(k){opBtns.querySelectorAll('button').forEach(b=>b.classList.toggle('picked',b.dataset.c===k));}
// whose commands the panel shows: the hero acting now, or the next one the player controls
function cmdHero(){const g=S.game,A=S.F[g.active];if(A&&A.team===0&&!A.dead&&!isAI(A.idx))return A;
  for(const k of turnOrder(8)){const f=S.F[k];if(f&&f.team===0&&!f.dead&&!isAI(k))return f;}
  return S.F[0];}
// a henchman still walking in can be picked only when nobody else is left standing
function targetable(f){return!notHereYet(f);}
function setTarget(i){const f=S.F[i],K=cmdHero();if(!f||f.dead||f.team!==1||f.npc||K.clinch||!targetable(f))return;setTgt(K,i);const g=S.game;if(g.phase==='input'&&g.active===K.idx&&!S.opening&&!K.downed)faceToward(K,f.station);updateStatus();}
function cycleTarget(){const fs=foes().filter(targetable);if(!fs.length)return;const i=fs.findIndex(f=>f.idx===getTgt(cmdHero()));setTarget(fs[(i+1)%fs.length].idx);}
// keys go to the game unless the focus is somewhere that takes typing: a clicked checkbox or button keeps the focus but types nothing
function typingIn(el){if(!el||!el.tagName)return false;const t=el.tagName;if(t==='TEXTAREA'||t==='SELECT'||el.isContentEditable)return true;
  return t==='INPUT'&&!['checkbox','radio','range','button','submit','reset','color','file','image'].includes(String(el.type||'text').toLowerCase());}
document.addEventListener('keydown',e=>{if(typingIn(e.target)||e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.key==='t'||e.key==='T'){cycleTarget();return;}
  if(e.key==='-'||e.key==='='){if(!S.opening)humanCommand(e.key==='-'?'team':'cover');return;}
  if(e.key==='f'||e.key==='F'){if(!S.opening)humanCommand('feint');return;}
  const n=parseInt(e.key,10);if(!(n>=0&&n<=9))return;
  if(S.opening){const ch=openingChoices(S.opening);if(n>=1&&n<=ch.length)humanOpening(ch[n-1]);}
  else{const k=n===0?CMD_ORDER[9]:CMD_ORDER[n-1];if(k)humanCommand(k);}});
// balance as pips: −◆◆ spends two, +◆ buys one back
function footGlyph(d){return d?(d<0?'−':'+')+'◆'.repeat(Math.min(FOOT_MAX,Math.abs(d))):'';}
function footText(A,d){if(!d)return'';const fm=footMaxOf(A),to=clamp(A.foot+d,0,fm),n=to-A.foot;if(!n)return'';
  return n<0?`Costs ${-n} pip${n<-1?'s':''} of balance (${to} left).`:to>=fm?'Balance back to full.':`+${n} balance (${to} of ${fm}).`;}
// what reach does to this command, and where an aimed blow sends them
function reachText(A,D,k){if(!D||!k)return'';const out=[];const ap=approachCost(A,D,k),dv=driveFor(A,D),rb=readBonus(A,D,k),fb=feintBonus(A,D);
  if(rb)out.push(`${D.name} has read your ${ACTIONS[k].name}: +${rb} DEF against it. A different attack, or a feint, resets it.`);
  if(fb&&ATTACKS.includes(k))out.push(`He bit on your feint: +${fb}.`);
  if(ATTACKS.includes(k)&&!D.downed){
    if(k==='thrust'&&angleMod(A,D,'thrust')<0)out.push(`${D.name} holds the angle on you: a Thrust from off his line is at ${signed(ANSWER.offLineThrust)}.`);
    {const hv=k==='overhead'||k==='sweep',n=hv?hitFoot(A,D):Math.max(1,BAL.hit-outclass(A,D));
      if(!D.clinch&&!D.npc&&!D.broken&&D.foot<=n&&!(hv&&D.posture==='off'))out.push(`${D.name} is down to ${D.foot} pip${D.foot===1?'':'s'} of balance: if this lands, he breaks.`);}}
  if(stopHitFor(A,D,k,k==='advance'?(advanceInfo(A,D)||{}).x:null)){const bt=k==='advance'?beatPoint(A,D):0;
    out.push(`${D.name}'s ${D.wp.name.toLowerCase()} outreaches yours: coming in hands ${D.name} a stop-hit first${bt?`, at −${bt} as you beat the point aside`:''}.${D.setSpear?` His spear is set: +${MOVES.setSpear.acc} and twice the knockback on it.`:''}`);}
  if(ap)out.push(`Closing the distance adds ${ap} tempo.`);
  if(ATTACKS.includes(k)&&!D.downed){const T=pickTechnique(A,D,k);if(jammedTech(A,T))out.push(`${D.name} is inside your reach: −2. Withdraw to get it back.`);else if(outreaches(D,A))out.push(`Inside the longer ${D.wp.name.toLowerCase()}: +2.`);
    if(dv)out.push(driveReaches(A,D,k,T,dv)?`A hit drives ${D.name} into ${dv.label}.`:`Only a heavy hit or a crit reaches ${dv.label}.`);}
  if(k==='shove'&&dv)out.push(`A shove that lands drives ${D.name} into ${dv.label}.`);
  return out.length?out.join(' ')+' ':'';}
// how far a typical landed hit of this kind carries them, aimed
function driveReaches(A,D,k,T,dv){const [n,s,b]=T.dice||A.wp.dice,avg=(n*(s+1)/2+b)*ACTIONS[k].mult*(T.dmg||1),kn=(k==='sweep'?8:12+avg*.75)*(T.knock||1);return dv.dist<=kn*1.6+12;}
function cmdName(A,act){return act==='wait'&&!A.downed&&!A.clinch?'Hold':ACTIONS[act].name;}
function techFor(A,D,k,op){return ATTACKS.includes(k)&&D?pickTechnique(A,D,k):DIRTY.includes(k)&&D?dirtyTech(A,D,k):k==='shove'&&D?shoveTech(A,D,op):null;}
// What a choice does, in one line, for the preview strip
// what a flourish changes, for the preview strip
const FLAIR_TXT={whirl:'+15% damage and extra knockback, for one extra pip of balance.',leap:'−1 to hit, +25% damage, for one extra pip of balance.',fleche:'+1 to hit and closes the gap fast, for one extra pip of balance.',
  twirlthrust:'+1 to hit: the spin hides the line. No extra balance.',twirlcrash:'−1 to hit, +20% damage, for one extra pip of balance.',spinsweep:'+10% damage, and a clean hit can put a Committed fighter down. One extra pip of balance.',
  slide:'+1 to hit, and a clean hit can put a Committed fighter down. One extra pip of balance.'};
function names(list){return list.length>1?list.slice(0,-1).map(f=>f.name).join(', ')+' and '+list[list.length-1].name:list[0].name;}
const THROW_INTO={table:'Through the table',wall:'Into the wall',curb:'Onto the curb'};
function throwText(th){return th.hazard?(th.hazard.kind==='body'?'Into '+th.hazard.o.name:hazardText(th.hazard,th)||THROW_INTO[th.hazard.kind]):th.how==='slam'?'Body slam':th.how==='shoulder'?'Over the shoulder':'Hip throw';}
// an attack that runs past a man on the floor says so (sk_insureui.js)
function roleText(A,D,k){const s=roleTextBase(A,D,k),n=ATTACKS.includes(k)?insureNote(A,D,k):'';return n?s+' '+n:s;}
function roleTextBase(A,D,k){const dn=D?D.name:'';
  if(DIRTY.includes(k)){const T=dirtyTech(A,D,k),eff={headbutt:'a head blow that can leave them dazed',knee:T.back?'a heel on the foot of whoever holds you':'doubles them over and knocks three pips of balance out of them',elbow:'a short, quick shot to the face'}[k];
    return`${T.name}: ${eff}. Light damage, cheap on tempo.`;}
  switch(k){
    case'grab':return`Grab ${dn}${facingAway(D,A)?' from behind':''} and lock into a clinch: neither of you can move away, and you get a quick choice of headbutt, knee, elbow, throw or push. If it fails, you lose three pips of balance.`;
    case'throw':{const th=throwInfo(A);if(!th)return'No room to throw.';return`${throwText(th)}: ${dn} hits the ground and stays down until their next turn${th.hazard?(th.hazard.kind==='body'?`, and knocks ${th.hazard.o.name} down too`:th.hazard.kind==='table'?', smashing the table':th.hazard.kind==='wall'?', cracking the wall':th.hazard.kind==='div'?(th.hazard.w.hp<=1?`, straight through ${divThe(th.hazard.w)}`:`, slamming into ${divThe(th.hazard.w)} (a crushing throw goes through)`):th.hazard.kind==='prop'?`, smashing the ${PROP[th.hazard.p.type].name}`:', on the hard edge'):''}. If it fails, you lose three pips of balance.`;}
    case'push':return`Shove ${dn} out of the clinch. No roll: they lose three pips of balance and 12 tempo.`;
    case'breakfree':return`An opposed roll to get out of ${dn}'s hold${A.clinch&&A.clinch.behind?' (−2 while pinned from behind)':''}.`;
    case'shield':{const si=shieldInfo(A),P=clinchPartner(A);return si?`Spin ${P.name} round into ${si.X.name}'s line. ${si.X.name}'s attacks on you take −4, and near misses hit ${P.name} instead.`:'';}
    case'getup':return`Stand up. It is quick, and you come up Committed (${FOOT_RISE} pips). Until you do, anyone in reach can stomp or stab you at a bonus.`;
    case'roll':return'Roll away from the nearest enemy and come up a few steps clear.';
    case'pickup':{const L=pickupInfo(A);return L?`${lootLabel(A,L)}. Costs this turn, but puts a weapon back in your hand${L.stuck?'; a blade stuck in a body has to be wrenched free':''}.`:'';}
    case'stab':{const T=stabTech(A,D);return T.back?`Find the hip dagger with the free hand and stab back into ${dn}. If it lands, ${dn} lets go.`
      :T.rear?`Holding ${dn} from behind, draw the dagger with the free hand and drive it into their side. A killing stab here slits the throat.`
      :`Draw the hip dagger with the free hand and stab ${dn} under the ribs without letting go.`+(T.drawn?' The dagger is already out, so it is quicker.':'');}
    case'pincer':{const pi=pincerInfo(A);return pi?`Circle round ${pi.D.name} to the far side from ${pi.P.name}. Caught between you, ${pi.D.name} can only face one of you, so the other attacks from behind at +2.`:'';}
    case'cover':{const ci=coverInfo(A);return ci?`Stand beside ${ci.P.name} with your guard up. The next attack aimed at ${ci.P.name} before your next turn hits you instead.`:'';}
    case'helpup':{const hi=helpInfo(A);return hi?`Pull ${hi.P.name} to their feet. They are up straight away and keep their own turn.`:'';}
    case'draw':return`Pull the dagger from your hip${A.wp.improv?` and drop the ${A.wp.name.toLowerCase()}`:''}. Quick, accurate and short. It goes back in the scabbard when you pick your own weapon up again.`;}
  if(k==='wait'&&A.downed)return'Stay on the ground. Anyone standing can stomp or stab you at a bonus, though you can still block.';
  if(k==='wait'&&A.clinch)return A.clinch.a===A?`Keep hold of ${dn} without striking.`:'Hold on and wait.';
  if(ATTACKS.includes(k)&&D&&D.downed)return`${dn} is on the ground: −2 to their defense and no guard, though they can still block.`;
  if(ATTACKS.includes(k)&&D&&rescueShoveOK(A,D))return`${dn} is holding ${clinchPartner(D).name}: a hit makes them let go.`;
  if(k==='shove'&&D&&rescueShoveOK(A,D))return`Tear ${dn} off ${clinchPartner(D).name}. If the shove lands, ${clinchPartner(D).name} is free and ${dn} loses three pips of balance.`;
  {const mr=D?moveRole(A,D,k)||moveCmdRole(A,D,k):null;if(mr)return mr;}
  if(ATTACKS.includes(k)){const T=pickTechnique(A,D,k);
    if(T.into)return T.breaks?`${D.name} is out of reach behind ${divThe(T.into)}: this blow smashes it down, but doesn't touch ${D.name}.`
      :`${cap(divThe(T.into))} is in the way and too solid to cut through in one blow: this one ${T.into.hp-T.struct>1?'cracks':'nearly breaks'} it and ${D.name} is untouched.`;
    if(T.through)return`Straight through ${divThe(T.through)}: the blow breaks it on the way in, at −2 to hit.`;
    if(T.aroundW)return`${cap(divThe(T.aroundW))} is in the way, so the approach goes round the end of it.`;
    if(T.multi){const D2=T.multi.D2,n2=D2.name,p2=Math.round(hitChanceT(A,D2,k,false,secondaryTech(T))*100);return(T.multi.type==='whirl'?`Cuts ${dn}, then spins round into ${n2} behind you.`
      :`Cuts ${dn}, then carries on into ${n2}.`)+` ${n2} is attacked at −2 (${p2}% to hit) for 60% damage. One extra pip of balance.`;}
    if(T.lash)return`${T.name}: the segments unlock and the blade lashes out from where you stand. No run in and no stop-hit; −1 to hit, a little less damage, a light knock and no drive. One extra pip of balance.`;
    if(T.flair&&FLAIR_TXT[T.key])return`${T.name}: ${FLAIR_TXT[T.key]}`;}
  switch(k){
    case'slash':return`A measured cut. ${dn} answers it best with a Parry (+4) or a Step back (+2); a parried cut costs you two pips of balance. A hit takes two of his.`;
    case'thrust':return`Fast, and the hardest blow to read. ${dn} answers it best with a Parry or a Slip (+4); into a Counter it comes in at +1. A hit takes two pips of his balance.`;
    case'overhead':return D.posture==='off'?`${dn} is off balance: a hit puts them down.`:`The heavy blow, the easiest to read: a Counter answers it (+3), and it breaks through a Parry. A hit knocks three pips of balance out of ${dn}; a solid hit (${OVER_FLOOR} over DEF) or a crit puts them down.`;
    case'sweep':return D.posture==='off'?`${dn} is off balance, so a sweep that lands puts them down.`:`Takes the legs, under a Parry (+${ANSWER.guardSweep} only); a Step back answers it (+4). A hit knocks three pips of balance out of ${dn}. Off balance or on a crit, they go down.`;
    case'shove':{const db=divBehind(D);if(db&&db.d<70)return db.w.hp<=1?`${D.name} has ${divThe(db.w)} at their back: a shove that lands puts them straight through it.`
      :`${D.name} has ${divThe(db.w)} at their back: a shove slams them into it and cracks it; a crushing shove goes through.`;
      const D2=dominoPartner(A,D);if(D2&&!tableBetween(A,D))return`Drives ${dn} into ${D2.name}. If the shove lands, ${D2.name} loses three pips of balance and loses 15 tempo too.`;
      return`${dn} is ${post(D).name.toLowerCase()} (${signed(post(D).resist)} to resist). If it lands they lose three pips of balance and 25 tempo; if they brace, you lose three pips and 15 tempo.`;}
    case'guard':return'Get down behind whatever is there: +4 DEF against shots until you act again.';
    case'wait':return`Hold your ground and let them come to you.${setSpearOK(A)?' Your spear is set for whoever closes.':''} Every blow on you still gets its answer as it comes.`;
    case'feint':{const p=Math.round(chanceOf(feintMods(A,D))*100);return`Fake an attack: ${p}% unless he reads it (your d20 and skill against 10 and his skill). If he bites, your next attack on him is at +${FEINT.bonus} and he is likely to answer it wrong; if he reads it, he is +${FEINT.read} against it. It also breaks any pattern he has read.`;}
    case'advance':{const ai=advanceInfo(A,D);if(ai&&ai.around)return`${cap(divThe(ai.around))} is between you: head round the end of it.`;return'Close the distance and line up.';}
    case'sidestep':{const info=sidestepInfo(A,D);if(!info)return'No room to step to either side.';
      return info.into?`Step back into line with ${dn} so your attacks connect cleanly.`:`Step off ${dn}'s line: ${dn} attacks you at −2 and you attack at +1 until one of you lines up again.`;}
    case'withdraw':{const bo=breakoutInfo(A);if(bo)return`Break out: dive past ${names(bo.pass)} so every enemy ends up in front of you. No more attacks from behind.`;
      return'Give ground: step back out of his reach.';}
    case'bind':return`No damage. Pins ${dn}'s weapon: they lose 20 tempo and three pips of balance.`;
    case'hold':return'Let it pass and keep your tempo.';}
  return'';}
function previewInfo(k){
  const g=S.game,o=S.opening;
  if(o){if(isAI(o.f.idx)||!openingChoices(o).includes(k))return null;return{A:o.f,D:o.opp,act:k,label:openingLabel(o,k),ft:openingFt0(o,k),pv:{i:o.f.idx,now:true,cost:openCost(o.f,k),delay:k==='bind'?20:0,delayIdx:o.opp.idx}};}
  if(g.phase!=='input'||isAI(g.active))return null;
  const A=S.F[g.active],D=targetOf(A),act=slotAction(A,D,k);if(!act||(!D&&!['getup','roll','wait','pickup','guard','draw','helpup','cover'].includes(act)))return null;
  return{A,D,act,label:cmdName(A,act),ft:footDelta(A,act,techFor(A,D,act)),pv:{i:A.idx,now:false,cost:actionCost(A,act,D?moveCost(A,D,act):0)+approachCost(A,D,act),delay:0}};
}
function enemyTurnsBefore(ord,me,skipFirst){const names=[],friends=[],team=S.F[me].team;for(let j=skipFirst?1:0;j<ord.length&&ord[j]!==me;j++){const f=S.F[ord[j]];(f.team===team?friends:names).push(f.name);}names.friends=friends;return names;}
function turnsText(names){const fr=[...new Set(names.friends||[])],fx=fr.length?`; ${fr.join(' and ')} also acts first`:'';
  if(!names.length)return fr.length?`no enemy turns before yours${fx}`:'you act again next';const c={};for(const n of names)c[n]=(c[n]||0)+1;
  const parts=Object.entries(c).map(([n,k])=>k>1?`${n} ×${k}`:n);return`${names.length} enemy turn${names.length>1?'s':''} before yours (${parts.join(', ')})${fx}`;}
function laneWord(A,z){
  if(S.arenaKey==='street'){if(z>CURB1&&A.lane<=CURB1)return'Up onto the sidewalk';if(z<CURB0&&A.lane>=CURB0)return'Down into the street';}
  return z>A.lane?'Out of line ↑':'Out of line ↓';}
function dirtySub(A,D,k){const n=dirtyTech(A,D,k).name;return n===ACTIONS[k].name?{elbow:'To the jaw',headbutt:'To the face',knee:'To the gut'}[k]:n;}
function cmdInfo(A,D,k){const inf=cmdInfo0(A,D,k);if(outOfFooting(A,k,D))return{tq:'No balance',h:'It comes back next turn',ok:false,ft:0};
  // the panel never offers what the rules would turn down
  if(inf.ok&&!cmdValid(A,D,k))return{tq:A.wallPin&&(k==='withdraw'||k==='sidestep')?'Pinned in place':D&&D.walkIn?'Not here yet':D&&D.downed?'Target is down':k==='shield'?'Nobody else near':'Not possible',h:'',ok:false,ft:0};
  // a defensive button against the next attack shown on you: the one that answers it says so, the ones it beats warn you
  if(inf.ok&&k==='advance'&&D&&moveName(A,D,'advance')){inf.tq='Beat the point';inf.mark='move';}
  if(inf.ok){const an=answerNote(A,k);if(an){inf.tq=an.text;inf.mark='answer';}}
  const d=inf.ok?footDelta(A,k,techFor(A,D,k)):0;inf.ft=d>0?Math.min(d,footMaxOf(A)-A.foot):Math.max(d,-A.foot);return inf;}
// Every blow is answered as it comes (sk_react.js), so the one answer still picked ahead is where you stand: stepping off the line of
// a Thrust the man you face is about to make puts it at −4
function answerNote(A,k){if(k!=='sidestep'||A.downed||A.clinch)return null;const th=threatOn(A);if(!th||th.cmd!=='thrust'||th.E!==targetOf(A))return null;
  const si=sidestepInfo(A,th.E);return si&&!si.into?{text:`Thrust at ${signed(ANSWER.offLineThrust)}`}:null;}
function cmdInfo0(A,D,k){const c=actionCost(A,k,D?moveCost(A,D,k):0)+approachCost(A,D,k),pct=x=>Math.round(x*100);
  if(k==='getup')return{tq:'Back on your feet',h:`${c} tempo`,ok:true};
  if(k==='roll'){const ri=rollInfo(A);return{tq:ri?'Roll clear':'No room',h:`${c} tempo`,ok:!!ri};}
  if(k==='wait'&&A.downed)return{tq:'Stay down',h:`${c} tempo`,ok:true};
  if(k==='pickup'){const L=pickupInfo(A);return{tq:L?lootLabel(A,L):'Nothing in reach',h:L?`${Math.round(Math.abs(L.x-A.station))}u · ${c} tempo`:'',ok:!!L,mark:'brawl'};}
  if(k==='draw')return{tq:'Backup weapon',h:`${c} tempo`,ok:canDraw(A),mark:'brawl'};
  if(k==='helpup'){const hi=helpInfo(A);return{tq:hi?`Pull ${hi.P.name} up`:'Not in reach',h:hi?`${Math.round(Math.abs(hi.x-A.station))}u · ${c} tempo`:'',ok:!!hi,mark:'team'};}
  if(k==='cover'){const ci=coverInfo(A);return{tq:ci?`Guard ${ci.P.name}`:'Not in reach',h:`${c} tempo`,ok:!!ci,mark:'team'};}
  if(k==='pincer'){const pi=pincerInfo(A);return{tq:pi?`Behind ${pi.D.name}`:'No way round',h:pi?`${Math.round(Math.hypot(pi.x-A.station,pi.z-A.lane))}u · ${c} tempo`:'',ok:!!pi,mark:'team'};}
  if(k==='stab'&&D){const T=stabTech(A,D);return{tq:T.name,h:`${pct(hitChanceT(A,D,'stab',false,T))}% · ${c} tempo`,ok:true,mark:'brawl'};}
  if(!D)return{tq:'No target',h:`${c} tempo`,ok:k==='guard'||k==='wait'};
  if(k==='feint'){const ok=feintOK(A,D);if(!ok)return{tq:D.downed?'Target is down':tableBetween(A,D)?'Table in the way':S.divs.length&&divBetween(A,D)?cap(divWord(divBetween(A,D)))+' in the way':'Too far',h:'',ok:false};
    return{tq:'Fake an attack',h:`${pct(chanceOf(feintMods(A,D)))}% · ${c} tempo`,ok:true,mark:null};}
  if(DIRTY.includes(k)){const T=dirtyTech(A,D,k);return{tq:dirtySub(A,D,k),h:`${pct(hitChanceT(A,D,k,false,T))}% · ${c} tempo`,ok:true,mark:'brawl'};}
  if(k==='grab')return{tq:facingAway(D,A)?'From behind':'Into a clinch',h:`${pct(chanceOf(grabMods(A,D,false)))}% · ${c} tempo`,ok:true,mark:'brawl'};
  if(k==='throw'){const th=throwInfo(A);return{tq:th?throwText(th):'No room',h:`${pct(chanceOf(throwMods(A,D,false)))}% · ${c} tempo`,ok:!!th,mark:'brawl'};}
  if(k==='push')return{tq:'Shove them off',h:`sure · ${c} tempo`,ok:true};
  if(k==='breakfree')return{tq:A.clinch&&A.clinch.behind?'Twist free':'Break the hold',h:`${pct(chanceOf(breakMods(A,D,false)))}% · ${c} tempo`,ok:true};
  if(k==='shield'){const P=clinchPartner(A);return{tq:P?'Use '+P.name:'',h:`${c} tempo`,ok:!!P,mark:'brawl'};}
  if(k==='wait'&&A.clinch)return{tq:A.clinch.a===A?'Keep the hold':'Hold on',h:`${c} tempo`,ok:true};
  if(ATTACKS.includes(k)){const T=pickTechnique(A,D,k),pc=Math.round(hitChanceT(A,D,k,false,T)*100);
    if(T.into)return{tq:T.name,h:`${T.breaks?'smashes':'hits'} the ${divWord(T.into)} · ${c} tempo`,ok:true,mark:null};
    if(T.multi){const D2=T.multi.D2,p2=Math.round(hitChanceT(A,D2,k,false,secondaryTech(T))*100);return{tq:`${T.name} ×2`,h:`${pc}% · ${c} tempo`,ok:true,mark:'crowd',p2};}
    const dv=driveFor(A,D),reach=dv&&driveReaches(A,D,k,T,dv);
    return{tq:T.name+(reach?' ▸ '+dv.label.replace(/^the /,''):''),h:`${pc}% · ${c} tempo`,ok:true,mark:T.move?'move':T.flair?'flair':null,warn:stopHitFor(A,D,k)};}
  if(k==='shove'){const mi=moveCmdInfo(A,D,'shove',c);if(mi)return mi;}
  if(k==='shove'){const ok=!tableBetween(A,D)&&!(S.divs.length&&divBetween(A,D))&&(!D.clinch||rescueShoveOK(A,D)),ob=obstacleKind(D,70),D2=ok&&!D.clinch?dominoPartner(A,D):null;
    if(D.clinch&&rescueShoveOK(A,D))return{tq:`Pull off ${clinchPartner(D).name}`,h:`${Math.round(shoveChance(A,D,false)*100)}% · ${c} tempo`,ok,mark:'team'};
    const dvb=!ok&&!D.clinch&&S.divs.length?divBetween(A,D):null,db=ob?divBehind(D):null;
    const dv=ok&&!D.clinch?driveFor(A,D):null;
    return{tq:!ok?(D.clinch?'Locked in a clinch':dvb?cap(divWord(dvb))+' in the way':'Table in the way'):dv?'Into '+dv.label:D2?'Domino shove':ob?(db&&db.d<76&&db.w.hp<=1?'Through the ':'Into the ')+ob:'Two-hand shove',h:`${Math.round(shoveChance(A,D,false)*100)}% · ${c} tempo`,ok,mark:D2&&!dv?'crowd':null,warn:ok&&stopHitFor(A,D,'shove')};}
  if(k==='guard')return{tq:A.guarding?'Stay down':'Get behind something',h:`+4 DEF vs shots · ${c} tempo`,ok:true};
  if(k==='withdraw'){const bo=breakoutInfo(A);if(bo)return{tq:'Break out',h:`${Math.round(Math.abs(bo.x-A.station))}u · ${c} tempo`,ok:true,mark:'crowd'};}
  if(k==='wait')return moveCmdInfo(A,D,'wait',c)||{tq:'Let him come',h:`${c} tempo`,ok:true};
  if(k==='advance'){const info=advanceInfo(A,D),gp=info&&!info.vault&&S.divs.length?gapOnSeg(A.station,A.lane,info.x,info.z):null;if(gp)return{tq:'Through the gap',h:`${Math.round(Math.hypot(info.x-A.station,info.z-A.lane))}u · ${c} tempo`,ok:true,warn:stopHitFor(A,D,'advance',info.x)};return{warn:info&&!info.vault&&!info.around&&stopHitFor(A,D,'advance',info.x),tq:!info?(tableBetween(A,D)?'Table in the way':S.divs.length&&divBetween(A,D)?cap(divWord(divBetween(A,D)))+' in the way':'At closest range'):info.vault?'Vault the table':info.around?'Around the '+divWord(info.around):Math.abs(info.z-A.lane)>=8?'Step in, into line':'Step in',h:`${info?Math.round(Math.hypot(info.x-A.station,info.z-A.lane)):0}u · ${c} tempo`,ok:!!info};}
  if(k==='sidestep'){const info=sidestepInfo(A,D);return{tq:!info?'No room':info.into?'Into line':laneWord(A,info.to),h:`${info?Math.round(Math.abs(info.to-A.lane)):0}u · ${c} tempo`,ok:!!info};}
  const info=withdrawInfo(A,D),pb=pinnedBy(A);return{tq:info?'Step back':pb?'Pinned to the '+pb:'No room',h:`${info?Math.round(Math.abs(info.x-A.station)):0}u · ${c} tempo`,ok:!!info};
}
function updateCommands(){
  const g=S.game,i=g.active,A=S.F[i],K=cmdHero(),human=g.phase==='input'&&!isAI(i)&&!S.opening&&A===K,D=K.dead?null:targetOf(K),team=S.F.some(f=>f.ally);
  $('cmdHead').textContent=g.phase==='over'?'Fight over':g.phase==='transit'?'On to the '+(S.stage.tr&&S.stage.tr.to?ROOMS[S.stage.tr.to].name:'kitchen'):g.phase==='finale'?'The executive':g.phase==='intro'?'Weapons out…':human?`${A.name} · Command`:g.phase==='input'?`${A.name} is deciding…`:S.opening?`${S.opening.f.name} reads an opening`:`${A.name} acts…`;
  for(const k of CMD_ORDER){const act=K.dead?null:slotAction(K,D,k),b=$('cmd-'+k),ts=k==='team'||k==='cover';b.hidden=(ts&&!team)||(k==='guard'&&(!act||act==='guard')&&!(act&&cmdValid(K,D,act)));
    const inf=g.phase==='transit'||g.phase==='intro'||g.phase==='finale'?{tq:'',h:'',ok:false}:act?cmdInfo(K,D,act):{tq:K.downed?'You are down':K.clinch?'Locked in a clinch':ts?(partnerOf(K)?(k==='team'?'No move together':'Nobody to cover'):'Partner is out'):'—',h:'',ok:false};
    b.disabled=!human||!inf.ok;for(const m of ['flair','crowd','brawl','team','answer','weak','move'])b.classList.toggle(m,inf.mark===m);
    $('n-'+k).textContent=act?cmdName(K,act):ACTIONS[k].name;$('t-'+k).textContent=inf.tq;$('h-'+k).textContent=inf.h;
    const fe=$('f-'+k),fd=human&&inf.ok?inf.ft||0:0;fe.textContent=footGlyph(fd);fe.className='ft'+(fd>0?' gain':fd<0?' cost':'');
    b.classList.toggle('warn',!!(human&&inf.ok&&inf.warn));}
  updateTargets();updateDrives();updateIntents();
}
function updateTargets(){
  const H=cmdHero(),ht=getTgt(H);let html=`<span class="lbl">${heroes().length>1?H.name+"'s target":'Target'}</span>`;
  for(const f of S.F){if(f.team!==1||f.npc)continue;html+=`<button type="button" class="tgt" data-i="${f.idx}" style="--c:${f.color}" aria-pressed="${f.idx===ht&&!f.dead}"${f.dead||!targetable(f)?' disabled':''}>${f.name}</button>`;}
  const box=$('targets');if(box.innerHTML!==html)box.innerHTML=html;
}
$('targets').addEventListener('click',e=>{const b=e.target.closest('.tgt');if(b&&!b.disabled)setTarget(+b.dataset.i);});
// Drive: aim knockback at something on the far side of the target
function updateDrives(){
  const K=cmdHero(),D=K.dead?null:targetOf(K),box=$('drives');if(!box)return;const opts=D&&!K.clinch?driveOptions(K,D):[];
  if(K.driveSel&&!opts.some(o=>o.id===K.driveSel))K.driveSel=null;
  const html=opts.length?`<span class="lbl">Drive</span><button type="button" class="drv" data-d="" aria-pressed="${!K.driveSel}">Straight</button>`+opts.map(o=>`<button type="button" class="drv" data-d="${o.id}" aria-pressed="${K.driveSel===o.id}">${cap(o.label.replace(/^the /,''))}</button>`).join(''):'';
  if(box.innerHTML!==html)box.innerHTML=html;box.hidden=!opts.length;}
$('drives').addEventListener('click',e=>{const b=e.target.closest('.drv');if(!b)return;const K=cmdHero();K.driveSel=b.dataset.d||null;updateStatus();});
function updateIntents(){
  const el=$('intents'),g=S.game,K=S.F[0];
  if(g.phase==='over'||g.phase==='transit'||g.phase==='intro'||g.phase==='finale'||K.dead){el.innerHTML='';return;}
  const ord=turnOrder(12),items=[];
  for(const f of foes()){const it=f.intent&&cmdValid(f,targetOf(f),f.intent.cmd)?f.intent:null;let txt;f._when=null;f._back=false;
    if(f.downed&&!it)txt='is on the ground';
    else if(g.active===f.idx&&g.phase!=='input')txt='is committed to the move';
    else if(!it)txt='is weighing options';
    else{const V=targetOf(f)||K,two=heroes().length>1,tech=ATTACKS.includes(it.cmd)?pickTechnique(f,V,it.cmd).name:DIRTY.includes(it.cmd)?dirtyTech(f,V,it.cmd).name:it.cmd==='feint'?'':moveIntent(f,V,it.cmd)||'';let when;
      if(g.phase==='input'&&g.active===f.idx)when='acting now';
      else{let mine=0;for(const k of ord){if(k===f.idx)break;if(S.F[k].team===0&&!isAI(k))mine++;}when=mine===0?'before your next move':mine===1?'after your next move':`after ${mine} of your moves`;}
      const at=two?` on <b style="color:${V.color}">${V.name}</b>`:'';
      const back=ATTACKS.includes(it.cmd)&&facingAway(V,f)?(two?` · <em>at ${V.name}'s back</em>`:' · <em>at your back</em>'):'';
      f._when=when;f._back=ATTACKS.includes(it.cmd)&&facingAway(V,f)&&V===cmdHero();
      const nm=it.cmd==='wait'&&f.clinch?'Keep the hold':it.cmd==='wait'?'Hold':it.cmd==='grab'&&facingAway(V,f)?'Grab from behind':ACTIONS[it.cmd].name;
      txt=`${it.changed?'changes plan:':'intends'} <b>${nm}</b>${tech?` <i>${tech}</i>`:''}${at} · ${when}${back}${it.paid?` · <i>the change cost him ${it.paid} tempo</i>`:''}`;}
    items.push(`<li style="--c:${f.color}"><span class="who">${f.name}</span> ${txt}</li>`);}
  const html=items.join('');if(el.innerHTML!==html)el.innerHTML=html;
}
function updateOrder(){
  const g=S.game,o=S.opening,info=previewCmd?previewInfo(previewCmd):null;if(!info)previewCmd=null;
  const ord=turnOrder(8,info?info.pv:null),now=g.phase==='input'&&!o?g.active:-1,el=$('order');
  el.classList.toggle('pv',!!info);
  el.innerHTML=ord.map((k,i)=>`<span class="chip${i===0&&k===now?' now':''}" style="--c:${S.F[k].color}">${S.F[k].name}</span>`).join('');
  let tt=null;
  if(info){tt=turnsText(enemyTurnsBefore(ord,info.pv.i,!info.pv.now));
    $('tempoLine').textContent=`If ${info.A.name} picks ${info.label}: ${info.pv.cost} tempo${info.pv.delay?`, ${info.D.name} +${info.pv.delay}`:''}. Before any dice effects.`;}
  else $('tempoLine').textContent=`Tempo per slash: ${S.F.filter(f=>!f.dead).map(f=>`${f.name} ${actionCost(f,'slash')}`).join(' · ')} (lower acts sooner)`;
  const line=info?`<b>${info.label}</b> · ${roleText(info.A,info.D,info.act||previewCmd)} ${o?'':reachText(info.A,info.D,info.act||previewCmd)}${footText(info.A,info.ft)} <i>${cap(tt)}.</i>`:null;
  if(o)$('opHint').innerHTML=line||(isAI(o.f.idx)?'':'Follow-ups cost half tempo. Hover a choice to see how it moves the turn order.');
  $('cmdPreview').innerHTML=line||footingLine();
}
function footingLine(){
  const K=cmdHero(),g=S.game;if(g.phase==='over'||K.dead)return'';const D=targetOf(K);if(!D)return'';
  const human=g.phase==='input'&&!isAI(g.active)&&!S.opening&&S.F[g.active]===K,ol=offLine(K,D,'slash'),P=partnerOf(K);
  let tip='',tipBack=false;
  if(human){const behind=foes().filter(f=>facingAway(K,f)),hb=heldBy(K);
    if(K.downed)tip='You are down: get up or roll clear before they stomp you.'+(P&&!P.downed?` ${P.name} can also pull you up.`:'');
    else if(P&&P.downed&&helpInfo(K))tip=`${P.name} is down: Team move pulls them up.`;
    else if(P&&heldBy(P)&&!K.clinch)tip=`${heldBy(P).name} has hold of ${P.name}: hit or shove ${heldBy(P).name} to break it.`;
    else if(K.clinch&&stabInfo(K)&&heldBy(K))tip=`${heldBy(K).name} has you${K.clinch.behind?' from behind':''}: Advance is now ${stabTech(K,heldBy(K)).name}.`;
    else if(hb)tip=K.clinch.behind?`${hb.name} has you from behind: everyone else hits you at +3. Twist free, throw ${hb.name} over your shoulder, or fight dirty.`:`${hb.name} has hold of you: break free or fight dirty.`;
    else if(K.clinch&&stabInfo(K)&&!K.clinch.behind)tip=`You have hold of ${clinchPartner(K).name}: Advance is now ${stabTech(K,clinchPartner(K)).name}, or headbutt, knee, elbow, throw or push.`;
    else if(K.clinch)tip=K.clinch.behind?`You hold ${clinchPartner(K).name} from behind${stabInfo(K)?`: Advance is now ${stabTech(K,clinchPartner(K)).name}`:' as a shield'}.`:`You have hold of ${clinchPartner(K).name}: headbutt, knee, elbow, throw or push`+(shieldInfo(K)?`, or spin them round as a shield.`:'.');
    else if(K.wp.unarmed||K.sidearm==='drawn'||(K.wp.improv&&canDraw(K))){const st=stuckIn(K),L=pickupInfo(K),opts=[];
      if(canDraw(K))opts.push('Draw dagger');if(L)opts.push(lootLabel(K,L));
      const why=st?`Your ${itemShort(st).toLowerCase()} is stuck in ${S.F[st.stuck.f].name}`:K.sidearm==='drawn'?'Fighting with your dagger':K.wp.improv?`Fighting with a ${K.wp.name.toLowerCase()}`:'Disarmed';
      tip=why+(opts.length?': '+opts.join(', or ')+'.':K.wp.unarmed?': fists and feet until you find something.':'.');}
    else if(D.downed)tip=`${D.name} is down: attacks hit at +2, and Sweep stomps.`;
    else if(moveTip(K,D))tip=moveTip(K,D);
    else if(K.foot<1)tip='No balance left: two pips come back at the start of your next turn. Hold or step back till then.';
    else if(K.posture==='off')tip='Off balance: −3 DEF and −2 to hit, and one more blow that lands breaks you. Two pips come back at the start of each turn.';
    else if(threatOn(K)){const th=threatOn(K),E=th.E.name;
      tip=`${E} is about to ${th.cmd==='overhead'?'swing an Overhead':ACTIONS[th.cmd].name}. When it comes, time slows and you answer it: ${REACT_TIP[th.cmd]}`;}
    else if(readOf(K,D)&&readOf(K,D).n>=2)tip=`${D.name} has read your ${ACTIONS[readOf(K,D).kind].name}: +${readBonus(K,D,readOf(K,D).kind)} DEF against it. Switch attacks or feint to reset it.`;
    else if(behind.length){tip=`${behind.map(f=>f.name).join(' and ')} ${behind.length>1?'are':'is'} at your back: +2 to hit you.${breakoutInfo(K)?' Withdraw breaks out of the pincer.':''}`;tipBack=!breakoutInfo(K);}
    else if(pincered(D)&&P)tip=`${D.name} is caught between you and ${P.name}: whoever it is not facing attacks from behind.`;
    else if(P&&pincerInfo(K))tip=`${P.name} is on ${D.name}: Team move takes you round behind it for a pincer.`;
    else if(onGlass(K))tip='You are standing on broken glass: −1 balance every turn you stay. Step off it.';
    else if(stopHitFor(K,D,'thrust'))tip=`${D.name}'s ${D.wp.name.toLowerCase()} outreaches you: closing in hands ${D.name} a stop-hit. Inside it, you strike at +2.`;
    else if(K.wp.len>=60&&techContext(K,D).clinch&&!D.downed)tip=`${D.name} is inside your reach: your blows are at −2. Withdraw to get the range back.`;
    else if(D.broken&&!D.downed)tip=`${D.name} is broken: he has no answer to your blows until his own turn.`;
    else if(D.foot<=2&&!D.downed&&!D.clinch&&!D.broken)tip=D.posture==='off'?`${D.name} is off balance with ${D.foot?'one pip':'nothing'} left: a Slash or Thrust that lands breaks him, and a Sweep or Overhead puts him down.`
      :`${D.name} is down to ${D.foot} pips of balance: a blow that lands breaks him, and a broken man has no answer.`;
    else if(inShadow(D))tip=`${D.name} stands where the lamps are out: −1 to hit.`;
    else if(driveOptions(K,D).length&&!K.driveSel)tip=`There is something behind ${D.name}: pick it under Drive to aim your blows at it.`;
    else if(D.posture==='off')tip='They are off balance: a Sweep or Overhead that lands puts them down.';
    else if(K.posture!=='set')tip='Committed: −1 DEF and no +1 to hit. Two pips come back at the start of each turn.';
    else if(ol)tip=holdsAngle(K,D)?`You hold the angle: +1 on your attacks, and a Thrust at you is at ${signed(ANSWER.offLineThrust)}.`:`You are off their line: −2 (a Thrust ${signed(ANSWER.offLineThrust)}) unless you step back into line.`;
    else tip='Hover a command to see what it does to the turn order.';}
  const fl=K===hero()&&chainSt().live?` · <b>in flow ×${chainSt().n}</b>`:'';
  return`<span class="fl-pre">${K.name} <b>${post(K).name.toLowerCase()}, ${K.foot} of ${footMaxOf(K)}</b>${K.guarding?' and in cover':''}${fl} · ${D.name} <b>${D.broken?'broken':post(D).name.toLowerCase()}, ${D.foot} of ${footMaxOf(D)}</b>${D.guarding?' and in cover':''}, ${ol?Math.round(Math.abs(K.lane-D.lane))+'u off line':'in line'}${tip?'.':''}</span>${tip?` <span class="fl-tip${tipBack?' fl-back':''}">${tip}</span>`:''}`;
}
function updateTags(){
  for(const f of S.F){const tags=[];
    if(f.dead)tags.push([f.gone?'Left in the '+(f.goneFrom||'dining room'):f.finName||'Out','var(--hp-low)']);else if(f.downed||S.t<f.knockUntil||f.motor<.45)tags.push(['Down','var(--hp-mid)','On the ground until their next turn: −2 DEF, no guard, can still block']);
    if(!f.dead&&f.clinch)tags.push([f.clinch.a===f?(f.clinch.behind?'Holding from behind':'Holding'):(f.clinch.behind?'Held from behind':'Held'),'#ffd9a8']);
    const stk=!f.dead&&stuckIn(f);
    if(stk)tags.push([itemShort(stk)+' stuck','var(--hp-low)',`Stuck in ${S.F[stk.stuck.f].name}: a turn to pull it free`]);
    else if(!f.dead&&f.wp.unarmed)tags.push(['Disarmed','var(--hp-low)']);else if(!f.dead&&f.wp.improv)tags.push([f.wp.name,'#ffd9a8']);
    if(!f.dead&&f.sidearm==='drawn')tags.push(['Sidearm','#ffd9a8','Fighting with the dagger from his hip']);
    if(!f.dead&&f.sidearm==='offhand')tags.push(['Dagger out','#ffd9a8','The hip dagger is in his free hand']);
    if(!f.dead&&f.covering&&!f.covering.dead)tags.push(['Covering '+f.covering.name,'#a9e88c','The next attack on them before this fighter acts again hits this fighter instead']);
    if(!f.dead&&S.F.some(o=>o.covering===f&&!o.dead))tags.push(['Covered','#a9e88c']);
    if(!f.dead&&f.team===1&&pincered(f))tags.push(['Pincered','#a9e88c','Caught between two fighters: whoever it is not facing attacks from behind']);
    // rank: an enemy two or more ranks below Kael, or above him
    {const K=S.F[0];if(!f.dead&&f.team===1&&!f.npc&&K&&!K.dead){const lo=outclass(f,K),hi=outclass(K,f);
      if(lo)tags.push(['Outclassed','#9fc3d8',`Two or more ranks below ${K.name}: ${signed(outclassMod(f,K))} on everything he tries against ${K.name}, and only a crit puts ${K.name} down`]);
      else if(hi)tags.push([`Outclasses ${K.name}`,'#ff9f7a',`Two or more ranks above ${K.name}: ${K.name} is at ${signed(outclassMod(K,f))} against him, and only a crit puts him down`]);}}
    if(!f.dead)for(const w of woundText(f))tags.push([w,'#ff8a8a',w==='Dazed'?'−2 to hit and −2 DEF until after their next action':w.startsWith('Limp')?'Narrow stance, slower moves, easier to sweep and shove':(w==='Arm badly hurt'?'−2 to hit':'−1 to hit')+', weaker weapon arm, easier to disarm']);
    if(!f.dead){const ps=post(f),fm=footMaxOf(f),fo=clamp(f.foot,0,fm);tags.push([`${ps.name} <i class="pips">${'●'.repeat(fo)}<b>${'●'.repeat(fm-fo)}</b></i>`,ps.color,`Balance ${fo} of ${fm}. ${ps.tip}`]);}
    if(!f.dead&&f.broken&&!f.downed)tags.push(['Broken','#ffb347','Knocked off his balance: no answer to any blow until his own turn']);
    if(!f.dead&&f.guarding&&!f.react&&!f.covering)tags.push(['In cover','var(--block)','Down behind whatever he found: +4 DEF against shots']);
    if(!f.dead&&f.setSpear)tags.push(['Spear set','#9fd8ff',`Whoever closes on ${f.name} runs onto the point: stop-thrust at +${MOVES.setSpear.acc}, twice the knockback`]);
    if(!f.dead&&f.wallPin)tags.push(['Pinned in place','var(--hp-low)','Pinned by a thrust: no Withdraw or Sidestep on the next turn']);
    {const E=!f.dead&&f.holdFace!=null?S.F[f.holdFace]:null;if(E&&!E.dead)tags.push(['Facing '+E.name,'#9fd8ff','After the back thrust he keeps his front to this enemy until he acts again']);}
    if(!f.dead&&!f.downed&&onGlass(f))tags.push(['On glass','#d6f3f5','Broken glass underfoot: −1 balance every turn spent here']);
    if(!f.dead&&inShadow(f))tags.push(['In shadow','#b9a6ff','The lamps above are out: −1 to hit them']);
    const pb=!f.dead&&pinnedBy(f);if(pb)tags.push(['Pinned · '+pb,'var(--hp-low)']);
    {const H=cmdHero();if(f.team===1&&f.idx===getTgt(H)&&!f.dead)tags.push([heroes().length>1?H.name+"'s target":'Target',H.color]);}
    if(S.opening&&S.opening.f===f)tags.push(['Opening','var(--amber)']);
    // what this fighter has read: Kael's attacks for an enemy, the enemies' attacks for Kael
    if(!f.dead&&!f.npc&&f.reads){const K=S.F[0];let shown=0;
      for(const [ai,r] of Object.entries(f.reads)){const A=S.F[+ai];if(!A||A.dead||A.team===f.team||!r||r.n<1||shown>=2)continue;if(f.team===1&&A!==K)continue;
        shown++;const n=Math.min(READ_MAX,r.n),whose=A===K?'your':A.name+'\'s';
        tags.push([`Reads ${whose} ${ACTIONS[r.kind].name} +${n}`,'#c8b6ff',`${f.name} has seen ${A===K?'you':A.name} use ${ACTIONS[r.kind].name} ${r.n} time${r.n>1?'s':''} in a row: +${n} DEF against the next one. A different attack, or a feint, resets it.`]);}}
    if(!f.dead&&f.feint){const T=S.F[f.feint.tgt];if(T&&!T.dead)tags.push(['Feint landed','#ffd36b',`${T.name} bit: +${FEINT.bonus} on ${f.name}'s next attack on him`]);}
    const html=tags.map(t=>`<span class="tag" style="color:${t[1]}"${t[2]?` title="${t[2]}"`:''}>${t[0]}</span>`).join('');
    const el=$('tags'+f.idx);if(el&&el.innerHTML!==html)el.innerHTML=html;
    // the plate: balance as pips (six, four for a crew man, eight for a boss), whose turn it is, who the hero has picked
    const fp=$('fp'+f.idx);if(fp){const ph=f.dead?'':Array.from({length:footMaxOf(f)},(_,i)=>i<f.foot?'<i class="on"></i>':'<i></i>').join(''),pc='fpips p-'+(f.dead?'dead':f.broken&&!f.downed?'broken':f.posture||'set');
      if(fp.innerHTML!==ph)fp.innerHTML=ph;if(fp.className!==pc)fp.className=pc;}
    const row=$('fr'+f.idx);if(row&&row.classList){const g=S.game,o=S.opening,act=o?o.f.idx:(g.phase==='input'||g.phase==='exchange')?g.active:-1,H=cmdHero();
      row.classList.toggle('is-turn',f.idx===act&&!f.dead);row.classList.toggle('is-target',f.team===1&&!f.dead&&f.idx===getTgt(H));}}
  lockRunToggles();
}
function buildRows(){
  $('frows').innerHTML=S.F.filter(f=>!(f.hench&&f.dead)&&!f.npc&&!(f.gone&&f.team===1)).map(f=>`<div class="frow" id="fr${f.idx}" data-i="${f.idx}" data-team="${f.team}" style="--c:${f.color}"${f.team===1?` role="button" tabindex="0" aria-label="Target ${f.name}"`:''}><div class="fid"><span class="fname">${f.name}</span><span class="fmeta" id="meta${f.idx}"></span></div><div class="hp"><span id="hpn${f.idx}">${f.hp}</span><small id="hpm${f.idx}">/${f.maxHp}</small></div><div class="hpbar"><i id="hpb${f.idx}"></i></div><div class="fpips" id="fp${f.idx}" aria-hidden="true"></div><div class="tags" id="tags${f.idx}"></div></div>`).join('')+crewRows();
}
function updateStatus(){
  for(const f of S.F){const i=f.idx,el=$('hpn'+i);if(!el)continue;const fr=f.hp/f.maxHp;el.textContent=f.hp;$('hpm'+i).textContent='/'+f.maxHp;
    const bar=$('hpb'+i);bar.style.width=(fr*100)+'%';bar.dataset.level=fr>.5?'ok':fr>.25?'mid':'low';
    $('meta'+i).textContent=`${f.dead&&f.ownWeapon?ownWeaponName(f):f.wp.name} · ${SKILLS[f.skill-1]}${f.team&&f.temper&&f.temper!=='plain'?' · '+TEMPERS[f.temper].name:''}`;$('fr'+i).classList.toggle('is-dead',f.dead);$('fr'+i).hidden=!!(f.hench&&f.dead);}
  const K=cmdHero(),D=K.dead?null:targetOf(K),two=S.F.some(f=>f.ally&&!f.dead);let fl=`${S.arena.name} · ${S.room==='office'?(two?'two on one':'one on one'):crewOn()?(two?'2':'1')+' v crew':two?(S.cfg.n===1?'two on one':'2 vs '+S.cfg.n):(S.cfg.n===1?'one on one':'1 vs '+S.cfg.n)}`;
  if(D){const dist=Math.round(Math.abs(K.station-D.station)),dh=Math.round(S.arena.ground(D.station,D.lane)-S.arena.ground(K.station,K.lane));
    const rs=dist>engageGap(K,D)+APPROACH_FREE?(outreaches(D,K)&&dist>stopRange(D,K)?'outside the '+D.wp.short.toLowerCase():'out of reach'):jammedTech(K,pickTechnique(K,D,'thrust'))?'inside your reach':'in reach';
    fl+=` · ${D.name} ${dist}u away, ${rs}, ${offLine(K,D,'slash')?Math.round(Math.abs(K.lane-D.lane))+'u off line':'in line'}`;
    if(dh>18)fl+=`, ${K.name} holds high ground`;else if(-dh>18)fl+=`, ${D.name} holds high ground`;}
  if(S.table&&S.table.on){if(S.table.state==='toppled')fl+=' · table knocked over';else if(S.table.state!=='intact')fl+=' · table smashed';
    else if(D&&tableBetween(K,D))fl+=' · table between them';}
  if(S.wall)fl+=` · wall ${S.wall.state==='breached'?'breached':S.wall.state==='breaching'?'giving way':S.wall.hp<=1?'about to give':S.wall.hp===2?'cracked':'intact'}`;
  if(D&&S.divs.length){const db=divBetween(K,D);if(db)fl+=` · ${divThe(db)} between them`;}
  if(S.divs.length){const br=S.divs.filter(w=>w.state==='broken').length;if(br)fl+=` · ${br===S.divs.length?(br>1?'every divider down':divThe(S.divs[0])+' smashed'):br+' of '+S.divs.length+' dividers down'}`;}
  $('fieldLine').textContent=fl;updateBill();crewStatus();
  updateTags();updateCommands();updateOrder();
}
const logEl=$('log');
function logPlaceholder(){logEl.innerHTML='<li class="lg-empty">Pick a target and a command. Each exchange names the technique and why it was chosen, shows the dice, then what the physics did with it.</li>';}
function signed(n){return(n<0?'−':'+')+Math.abs(n);}
function who(f){return f?`<span class="lg-who" style="color:${f.color}">${f.name}</span>`:'';}
function whos(f){return f?`<span class="lg-who" style="color:${f.color}">${f.name}'s</span>`:'';}
const OUT_TXT={hit:'Hit',crit:'Critical',block:'Blocked',dodge:'Dodged',fumble:'Fumble',wall:'Struck'};
const CHAIN_TXT={riposte:'Counter',press:'Press',punish:'Punish',flow:'Flow',clinch:'Clinch',gang:'Gang-up',stop:'Stop-hit'};
const READ_TXT={hit:'stagger',block:'parry',dodge:'miss',dodgeOver:'missed overhead',break:'broken guard',brace:'braced shove',flow:'takedown',gang:'opening on '+HERO_NAME};
function defNote(dm){const t=(dm||[]).filter(m=>m[1]!==0).map(m=>`${m[0]} ${signed(m[1])}`).join(', ');return t?` (${t})`:'';}
function footNote(ex){const pn=f=>f.broken&&!f.downed?'broken':post(f).name.toLowerCase();return`${ex.A.name} ${pn(ex.A)} ${ex.A.foot}/${footMaxOf(ex.A)} · ${ex.D.name} ${pn(ex.D)} ${ex.D.foot}/${footMaxOf(ex.D)}`;}
function newEntry(chain){const ph=logEl.querySelector('.lg-empty');if(ph)ph.remove();const li=document.createElement('li');li.className='lg'+(chain?' chain':'');return li;}
function pushEntry(li){logEl.prepend(li);while(logEl.children.length>50)logEl.lastChild.remove();}
function modsText(mods){return mods.filter(m=>m[0]==='skill'||m[1]!==0).map(m=>`${signed(m[1])} ${m[0]}`).join(' ');}
S.hooks.log=e=>{
  const chain=e.ex&&e.ex.chain;const li=newEntry(chain&&e.type!=='hold');
  const tag=chain?`<span class="lg-tag">${chain==='gang'&&e.A&&e.A.team===0?'Tandem':CHAIN_TXT[chain]}</span>`:'';
  if(e.type==='attack'&&e.res.out==='wall'){const r=e.res,w=r.div;
    li.innerHTML=`<div class="lg-l">${tag}${who(e.A)}<span>${ACTIONS[r.kind].name}</span><span class="lg-tech">${r.tech.name}</span><span class="out out-block pending">${r.divBreak?'Smashed':'Struck'}</span></div>
      <div class="lg-why">${r.tech.why}</div><div class="lg-roll">no roll: the blow lands on ${divThe(w)}${r.divBreak?', which gives way':`, ${Math.max(0,w.hp-r.divStruct)} of ${w.maxHp} strength left after it`}</div><div class="lg-perf">performing…</div>`;
    e.ex.li=li;pushEntry(li);return;}
  if(e.type==='attack'){const r=e.res,wd=r.tech.dice||e.A.wp.dice;
    let dm='';if(r.dmg){const m=+r.mult.toFixed(2);dm=` · dmg ${r.dice.length}d${wd[1]} [${r.dice.join(',')}]+${wd[2]}${m!==1?' ×'+m:''}${r.flat?' (caught countering)':''}${r.hgDmg?' +3 high ground':''}${r.out==='crit'?' ×2':''}${r.wall?` +${r.wall} ${r.wallRes==='breach'?'through the wall':'wall'}`:''}${r.tableDmg?` +${r.tableDmg} ${r.table==='break'?'through the table':'table'}`:''}${r.divDmg?` +${r.divDmg} ${r.divRes==='breach'?'through '+divThe(r.div):divWord(r.div)}`:''}`;}
    li.innerHTML=`<div class="lg-l">${tag}${who(e.A)}<span>${ACTIONS[r.kind].name}</span><span class="lg-tech">${r.tech.name}</span>${e.D?`<span>on</span>${who(e.D)}`:''}<span class="out out-${r.out} pending">${OUT_TXT[r.out]}${r.dmg?' '+r.dmg:''}</span></div>
      <div class="lg-why">${r.tech.why}</div>
      <div class="lg-roll">d20 <b>${r.roll}</b> ${modsText(r.mods)} = <b>${r.total}</b> vs DEF ${r.def}${defNote(r.defMods)}${dm}</div><div class="lg-perf">performing…</div>`;
    if(e.ex.covered){const d=document.createElement('div');d.className='lg-read';d.textContent=`${e.D.name} steps in to cover ${e.ex.covered.name}`;li.insertBefore(d,li.querySelector('.lg-perf'));}
    if(r.shielded){const d=document.createElement('div');d.className='lg-read';d.textContent=`${e.D.name} takes it: ${r.shielded.name} is using them as a shield`;li.insertBefore(d,li.querySelector('.lg-perf'));}
    if(e.ex.res2){const r2=e.ex.res2,D2=e.ex.D2;const d=document.createElement('div');d.className='lg-sec';
      d.innerHTML=`<span>${r.tech.multi&&r.tech.multi.type==='whirl'?'spins on into':'carries on into'}</span>${who(D2)}<span class="out out-${r2.out} pending">${OUT_TXT[r2.out]}${r2.dmg?' '+r2.dmg:''}</span><span class="lg-roll">d20 <b>${r2.roll}</b> ${modsText(r2.mods)} = <b>${r2.total}</b> vs DEF ${r2.def}${defNote(r2.defMods)}${r2.dmg?` · dmg ×0.6`:''}</span>`;
      li.insertBefore(d,li.querySelector('.lg-perf'));}
    e.ex.li=li;
  }else if(e.type==='kick'||e.type==='bottle')moveLog(li,e,tag);
  else if(e.type==='shove'){const r=e.res;
    li.innerHTML=`<div class="lg-l">${tag}${who(e.A)}<span>${r.shoulder?'shoulder-checks':'shoves'}</span>${who(e.D)}<span class="out out-shove pending">Shove</span></div>
      <div class="lg-roll">d20 <b>${r.roll}</b> ${modsText(r.mods)} = <b>${r.total}</b> vs ${r.dc}${defNote(r.defMods)}${r.crush?' · crushing':''}</div><div class="lg-perf">performing…</div>`;e.ex.li=li;}
  else if(e.type==='bind'){li.innerHTML=`<div class="lg-l">${tag}${who(e.A)}<span>takes control of</span>${who(e.D)}<span class="out out-shove pending">Weapon control</span></div><div class="lg-perf">performing…</div>`;e.ex.li=li;}
  else if(e.type==='wait'){const A=e.A,bal=`balance ${A.foot}/${footMaxOf(A)}`;li.innerHTML=e.setSpear?`<div class="lg-l">${who(A)}<span>sets the spear</span><span class="out out-guard">Spear set</span></div><div class="lg-perf">${bal} · whoever closes runs onto the point: stop-thrust +${MOVES.setSpear.acc}, twice the knockback</div>`
      :A.downed?`<div class="lg-l">${who(A)}<span>stays down</span></div>`:`<div class="lg-l">${who(A)}<span>${A.clinch?(A.clinch.a===A?'keeps hold':'holds on'):'holds his ground'}</span></div><div class="lg-perf">${bal}</div>`;}
  else if(e.type==='guard'){li.innerHTML=`<div class="lg-l">${tag}${who(e.A)}<span>takes cover</span><span class="out out-guard">DEF +4</span></div><div class="lg-perf">balance ${e.A.foot}/${footMaxOf(e.A)} · +4 DEF against shots</div>`;}
  else if(e.type==='broken'){li.innerHTML=`<div class="lg-l">${who(e.A)}<span>breaks</span>${who(e.D)}<span class="out out-crit">Broken</span></div><div class="lg-perf">${e.D.name} has no balance left: no answer to any blow until his own turn, and ${e.A.name} gets a free move</div>`;}
  else if(e.type==='breakout'){li.innerHTML=`<div class="lg-l">${who(e.A)}<span>breaks out past</span>${e.pass.map(who).join('<span>and</span>')}<span class="out out-move">${e.moved}u</span></div><div class="lg-perf">dived through the depth: every enemy is now on one side</div>`;}
  else if(e.type==='feint'){const r=e.res;li.innerHTML=`<div class="lg-l">${tag}${who(e.A)}<span>feints at</span>${who(e.D)}<span class="out out-shove pending">${r.ok?(r.stance==='guard'?'Guard drawn':r.stance==='counter'?'Counter spent':'Bites'):'Read'}</span></div>
      <div class="lg-roll">d20 <b>${r.roll}</b> ${modsText(r.mods)} = <b>${r.total}</b> vs ${r.dc}${defNote(r.defMods)}</div><div class="lg-perf">performing…</div>`;e.ex.li=li;}
  else if(e.type==='hold'){li.innerHTML=`<div class="lg-l">${who(e.A)}<span>lets the opening pass</span></div><div class="lg-perf">balance ${e.A.foot}/${footMaxOf(e.A)}</div>`;}
  else if(e.type==='grab'){const r=e.res;li.innerHTML=`<div class="lg-l">${tag}${who(e.A)}<span>${r.behind?'grabs from behind':'grabs'}</span>${who(e.D)}<span class="out out-shove pending">${r.ok?'Clinch':'Missed'}</span></div>
      <div class="lg-roll">d20 <b>${r.roll}</b> ${modsText(r.mods)} = <b>${r.total}</b> vs ${r.dc}${defNote(r.defMods)}</div><div class="lg-perf">performing…</div>`;e.ex.li=li;}
  else if(e.type==='throw'){const r=e.res,info=e.ex.info;li.innerHTML=`<div class="lg-l">${tag}${who(e.A)}<span>throws</span>${who(e.D)}<span class="lg-tech">${info?throwText(info):''}</span><span class="out out-crit pending">${r.ok?'Thrown':'Countered'}</span></div>
      <div class="lg-roll">d20 <b>${r.roll}</b> ${modsText(r.mods)} = <b>${r.total}</b> vs ${r.dc}${defNote(r.defMods)}</div><div class="lg-perf">performing…</div>`;e.ex.li=li;}
  else if(e.type==='push'){li.innerHTML=`<div class="lg-l">${tag}${who(e.A)}<span>pushes</span>${who(e.D)}<span>out of the clinch</span><span class="out out-shove pending">Pushed off</span></div><div class="lg-perf">performing…</div>`;e.ex.li=li;}
  else if(e.type==='breakfree'){const r=e.res;li.innerHTML=`<div class="lg-l">${who(e.A)}<span>tries to break</span>${whos(e.D)}<span>hold</span><span class="out out-shove pending">${r.ok?'Free':'Held fast'}</span></div>
      <div class="lg-roll">d20 <b>${r.roll}</b> ${modsText(r.mods)} = <b>${r.total}</b> vs ${r.dc}${defNote(r.defMods)}</div><div class="lg-perf">performing…</div>`;e.ex.li=li;}
  else if(e.type==='shield'){li.innerHTML=`<div class="lg-l">${who(e.A)}<span>turns</span>${who(e.D)}<span>into a human shield against</span>${who(e.X)}</div><div class="lg-perf">${e.X.name} attacks ${e.A.name} at −4, and near misses land on ${e.D.name}</div>`;}
  else if(e.type==='getup'){li.innerHTML=`<div class="lg-l">${who(e.A)}<span>gets back up</span></div><div class="lg-perf">on their feet, Committed (${e.A.foot}/${footMaxOf(e.A)} once up)</div>`;}
  else if(e.type==='roll'){li.innerHTML=`<div class="lg-l">${who(e.A)}<span>rolls clear and gets up</span></div>`;}
  else if(e.type==='pincer'){li.innerHTML=`<div class="lg-l">${who(e.A)}<span>circles behind</span>${who(e.D)}<span>for a pincer with</span>${who(e.P)}<span class="out out-move">${e.moved}u</span></div><div class="lg-perf">${e.D.name} is caught between them: whoever it is not facing attacks from behind (+2)</div>`;}
  else if(e.type==='cover'){li.innerHTML=`<div class="lg-l">${who(e.A)}<span>covers</span>${who(e.P)}<span class="out out-guard">Cover</span></div><div class="lg-perf">guard up beside ${e.P.name}: the next attack on ${e.P.name} hits ${e.A.name} instead</div>`;}
  else if(e.type==='helpup'){li.innerHTML=`<div class="lg-l">${who(e.A)}<span>pulls</span>${who(e.P)}<span>back to their feet</span><span class="out out-move pending">Help up</span></div><div class="lg-perf">performing…</div>`;e.ex.li=li;}
  else if(e.type==='draw'){li.innerHTML=`<div class="lg-l">${who(e.A)}<span>draws the dagger from his hip</span><span class="out out-move">Dagger</span></div><div class="lg-perf">backup weapon in hand</div>`;}
  else if(e.type==='pickup'){li.innerHTML=`<div class="lg-l">${who(e.A)}<span>${e.label.charAt(0).toLowerCase()+e.label.slice(1)}</span><span class="out out-move pending">Armed</span></div><div class="lg-perf">performing…</div>`;e.ex.li=li;}
  else if(e.type==='flank'){li.innerHTML=`<div class="lg-l">${who(e.A)}<span>${e.gap?'slips through the gap to':'circles around to'}</span>${whos(e.D)}<span>other side</span><span class="out out-move">${e.moved}u</span></div><div class="lg-perf">${e.gap?`through the broken ${divWord(e.gap)}`:'swung wide through the depth'} to come at ${e.D.name} from the ${e.A.side<0?'left':'right'}</div>`;}
  else if(e.type==='approach'){li.innerHTML=`<div class="lg-l">${who(e.A)}<span>closes in on</span>${who(e.D)}<span class="out out-move">${ACTIONS[e.cmd].name}</span></div><div class="lg-perf">into the reach of ${whos(e.D).replace(/<[^>]+>/g,'')} ${e.D.wp.name.toLowerCase()}</div>`;e.ex.li=li;}
  else if(e.type==='phase'){const N=e.notes||[],hs=N.map(n=>n.f),fs=e.foes||[];li.className='lg lg-phase';
    const names=l=>l.length>1?l.slice(0,-1).map(who).join(', ')+' and '+who(l[l.length-1]):l.map(who).join('');
    const R=ROOMS[e.room]||ROOMS.kitchen;
    li.innerHTML=`<div class="lg-l"><span class="lg-tag">Phase ${R.phase}</span>${names(hs)}<span>go${hs.length>1?'':'es'} ${R.via.charAt(0).toLowerCase()+R.via.slice(1)}</span></div><div class="lg-perf">${fs.map(f=>f.name).join(', ')} ${fs.length>1?'are':'is'} waiting · ${N.map(n=>`${n.f.name} +${n.hp} HP${n.eased?', wounds bound':''}${n.weapon?`, back to the ${WEAPONS[n.weapon].name.toLowerCase()}`:''}`).join(' · ')} · balance back to full</div>`;}
  else if(e.type==='stopped'){li.innerHTML=`<div class="lg-l">${who(e.A)}<span>is stopped cold</span></div><div class="lg-perf">no balance left to finish the attack</div>`;}
  else if(e.type==='sidestep'){li.innerHTML=`<div class="lg-l">${who(e.A)}<span>${e.into?'steps back into line with':'sidesteps off the line of'}</span>${who(e.D)}<span class="out out-move">${e.moved}u</span></div><div class="lg-perf">${e.into?'lined up: attacks connect cleanly again':'holds the angle: +1 to attack, −2 for the other side until someone lines up'}</div>`;}
  else{const D=e.D,to=e.toX??e.A.station,dist=D?Math.round(Math.abs(to-D.station)):0;
    const verb=e.vault?'vaults the table':e.moved?(e.cmd==='advance'?'advances ':'withdraws ')+e.moved+'u':'holds position';
    li.innerHTML=`<div class="lg-l">${who(e.A)}<span>${verb}</span>${D?`<span class="out out-move">${dist}u from ${D.name}</span>`:''}</div>${e.stop?`<div class="lg-perf">into the reach of ${D.name}'s ${D.wp.name.toLowerCase()}${e.beat?`, beating the point aside: the stop-hit comes at −${e.beat}`:''}</div>`:''}`;if(e.stop)e.ex.li=li;}
  pushEntry(li);
};
S.hooks.feint=(ex,r)=>{if(!ex||!ex.li)return;const o=ex.li.querySelector('.out');o.classList.remove('pending');o.className='out '+(r.ok&&!r.void?'out-shove':'out-dodge');
  ex.li.querySelector('.lg-perf').textContent=r.void?'nobody left to fool':r.ok?`${ex.D.name} bit · ${ex.A.name}'s next attack on him is at +${FEINT.bonus}`:`${ex.D.name} read it · +${FEINT.read} DEF against ${ex.A.name}'s next attack`;};
S.hooks.perf2=ex=>{if(!ex.li)return;const o=ex.li.querySelector('.lg-sec .out');if(o)o.classList.remove('pending');};
S.hooks.domino=(ex,D2,i)=>{if(!ex.li)return;const d=document.createElement('div');d.className='lg-perf';
  d.textContent=`drove ${ex.D.name} into ${D2.name}: ${D2.name} ${i.crush?'knocked down':'loses three pips of balance'}, pushed ${i.pushed}u, +15 tempo`;ex.li.appendChild(d);};
S.hooks.perf=ex=>{if(!ex.li)return;const p=ex.perf,o=ex.li.querySelector('.out');o.classList.remove('pending');
  if(ex.res.out==='wall'){const w=ex.res.div;ex.li.querySelector('.lg-perf').textContent=p.divBroke?`${divThe(w)} gave way · ${ex.D.name} untouched`:`${divThe(w)} ${w.hp<=1?'is about to give':'cracked'} · ${ex.D.name} untouched · ${ex.A.name} jarred, loses a pip of balance`;return;}
  if(ex.res.guardBreak&&ex.res.out==='block'){o.textContent='Guard broken';o.className='out out-crit';}
  const how=[p.vault?'vaulted the table':'',p.around?(ex.res.tech.aroundW?'circled '+divThe(ex.res.tech.aroundW):'circled the table'):'',ex.res.tech.through?'broke through '+divThe(ex.res.tech.through):'',p.slip!=null?`${ex.D.name} slipped off the line`:''].filter(Boolean).join(' · ');
  const dr=ex.res.disarm,dis=dr?(dr.ok?` · disarm d20 ${dr.roll} ${signed(dr.bonus)} = ${dr.total} vs ${dr.dc}: weapon knocked away`:` · disarm d20 ${dr.roll} ${signed(dr.bonus)} = ${dr.total} vs ${dr.dc}: kept hold`):'';
  if(dr&&dr.ok)o.textContent='Disarmed';else if(ex.res.weaponHit==='haft')o.textContent='Haft cut';else if(ex.res.weaponHit==='wrap')o.textContent='Wrapped';
  ex.li.querySelector('.lg-perf').textContent=`${footNote(ex)}${ex.freed?` · ${ex.freed.name} freed from the hold`:''}${ex.res.guardBreak?', guard broken, +15 tempo':''}${dis}${how?' · '+how:''}${p.dash?` · dash ${p.dash}u`:''}${p.windup!=null?` · windup ${p.windup.toFixed(2)}s`:''} · contact ${p.speed}u/s${p.knock?` · knockback ${p.knock}u`:''}${ex.res.shatter?' · the bottle shattered':''}${ex.res.drive&&(ex.res.table||ex.res.wallRes||ex.res.divRes||ex.res.propDmg)?' · driven into '+ex.res.drive.label+', dazed':ex.res.table||ex.res.wallRes||ex.res.divRes?' · slammed, dazed':''}${movePerf(ex)}`;};
S.hooks.wound=(ex,D,i)=>{if(!ex||!ex.li)return;const d=document.createElement('div');d.className='lg-perf lg-hurt';
  const z={head:D.daze?'head blow: dazed':'head blow',arm:armPen(D)>1?'arm badly hurt: −2 to hit':'arm hurt: −1 to hit',leg:'leg hurt: limping',body:'body blow'}[i.zone];
  d.textContent=`${D.name}: ${i.tripped?tripText(i.tripped)+(i.hurt?', ':''):''}${i.hurt?z:''}${i.tripped?' · down until their next turn':''}`;ex.li.appendChild(d);};
S.hooks.grab=(ex,i)=>{if(!ex||!ex.li)return;const o=ex.li.querySelector('.out');o.classList.remove('pending');o.className='out '+(i.ok?'out-shove':'out-dodge');
  ex.li.querySelector('.lg-perf').textContent=i.ok?(i.behind?`${ex.D.name} pinned from behind: everyone else hits them at +3`:`locked in a clinch with ${ex.D.name}`):`${ex.D.name} slipped the grab · ${ex.A.name} loses three pips of balance`;};
S.hooks.throwLand=(ex,i)=>{if(!ex||!ex.li)return;const o=ex.li.querySelector('.out');o.classList.remove('pending');o.textContent=i.label+' '+i.dmg;
  ex.li.querySelector('.lg-perf').textContent=`${ex.D.name} lands hard and stays down until their next turn`;};
S.hooks.breakfree=(ex,i)=>{if(!ex||!ex.li)return;const o=ex.li.querySelector('.out');o.classList.remove('pending');o.className='out '+(i.ok?'out-shove':'out-dodge');
  ex.li.querySelector('.lg-perf').textContent=i.ok?`${ex.A.name} is out of the hold`:`${ex.D.name} keeps hold`;};
S.hooks.pickup=(ex,i)=>{if(!ex||!ex.li)return;const o=ex.li.querySelector('.out');o.classList.remove('pending');o.textContent=i.name||WEAPONS[i.kind].short;ex.li.querySelector('.lg-perf').textContent=`now fighting with a ${(i.full||WEAPONS[i.kind].name).toLowerCase()}`;};
S.hooks.shove=(ex,i)=>{if(!ex||!ex.li)return;const o=ex.li.querySelector('.out');o.className='out '+(i.ok?'out-shove':'out-dodge');o.textContent=i.label+(i.tableDmg||i.wallDmg||i.divDmg?' '+(i.tableDmg+i.wallDmg+(i.divDmg||0)):'');
  const dr=i.disarm,dis=dr?` · disarm d20 ${dr.roll} ${signed(dr.bonus)} = ${dr.total} vs ${dr.dc}`:'';
  ex.li.querySelector('.lg-perf').textContent=i.bind?(dr&&dr.ok?`${ex.D.name}'s weapon twisted out of their hand${dis} · +10 tempo`:`${ex.D.name}'s weapon pinned${dis} · ${ex.D.name} loses three pips of balance, +20 tempo`)
    :i.ok?`${i.shoulder?'shoulder check · ':''}${ex.freed?`${ex.freed.name} torn free · `:''}${i.floored?'floored · ':''}pushed ${i.pushed}u${i.tableDmg?(i.crush?', through the table':', into the table'):''}${i.wallDmg?(i.wallDmg>=8?', through the wall':', into the wall'):''}${i.divDmg?(i.divRes==='breach'?', through '+divThe(i.div):', into '+divThe(i.div)):''}${i.tripped?', '+tripText(i.tripped):''} · ${ex.D.name} delayed +${i.push?12:25} tempo, three pips of balance lost`:`${ex.D.name} braced · ${ex.A.name} loses three pips of balance, +15 tempo`;};
S.hooks.read=function(ex,f,read,out){if(!ex.li)return;const d=document.createElement('div');d.className='lg-read'+(read.ok?'':' miss');
  if(read.free)d.textContent=read.gang?`${f.name} piles in while ${arguments[4]?arguments[4].name:HERO_NAME} is held`:read.flow?`${f.name} flows straight on to ${arguments[4]?arguments[4].name:'the next enemy'}`
    :read.src==='stop'?`Stop-hit: ${f.name}'s ${f.wp.name.toLowerCase()} meets them coming in`:read.src==='parry'?`Parry: ${f.name}'s guard turns it aside, a free riposte`:read.src==='counter'?`${f.name} was waiting for it: a free counter`:`Fumble hands ${f.name} a free opening`;
  else d.innerHTML=`${f.name} reads the ${out==='gang'&&arguments[4]?(f.team===0?`chance to follow up on ${arguments[4].name}`:`opening on ${arguments[4].name}`):READ_TXT[out]||out}: d20 <b>${read.roll}</b> ${signed(read.bonus)} = <b>${read.total}</b> vs ${read.dc} → ${read.ok?'opening':'no opening'}`;
  ex.li.appendChild(d);};
S.hooks.fin=(ex,i)=>{if(!ex||!ex.li)return;const d=document.createElement('div');d.className='lg-perf lg-fin';d.innerHTML=`<b>${i.F.name}</b> · ${FIN_TXT[i.F.type]?FIN_TXT[i.F.type](i):''}`;ex.li.appendChild(d);};
S.hooks.stuck=(ex,i)=>{if(!ex||!ex.li)return;const d=document.createElement('div');d.className='lg-perf lg-hurt';d.textContent=`the ${WEAPONS[i.key].name.toLowerCase()} is stuck in ${i.D.name}: a turn to pull it free`;ex.li.appendChild(d);};
const FIN_TXT={behead:i=>S.gore==='off'?'a crushing blow to the neck':'the head comes off',execution:i=>S.gore==='off'?'finished on the ground':'the head comes off',cutdown:i=>'cut down where they stood',
  runthrough:i=>'the blade goes clean through',impale:i=>'lifted on the point',heartstab:i=>'the blade goes in to the hilt',cleave:i=>'the blade bites deep and drops them to their knees',
  throatcut:i=>'hands to the throat, then down',knockout:i=>'out cold before they hit the floor',pin:i=>'the point goes through into the ground'};
const FIN_LINE={behead:n=>S.gore==='off'?`Struck down by ${n}`:`Beheaded by ${n}`,execution:n=>S.gore==='off'?`Finished on the ground by ${n}`:`Executed by ${n}`,cutdown:n=>`Cut down by ${n}`,
  runthrough:n=>`Run through by ${n}`,impale:n=>`Impaled on ${n}'s spear`,heartstab:n=>`Stabbed by ${n}`,cleave:n=>`Cleaved by ${n}`,throatcut:n=>S.gore==='off'?`Struck down by ${n}`:`Throat cut by ${n}`,
  knockout:n=>`Knocked out by ${n}`,pin:n=>`Pinned to the ground by ${n}`};
S.hooks.cover=(ex,i)=>{};
S.hooks.helped=(ex,i)=>{if(!ex||!ex.li)return;const o=ex.li.querySelector('.out');if(o)o.classList.remove('pending');const pf=ex.li.querySelector('.lg-perf');if(pf)pf.textContent=`${i.P.name} is up and keeps their own turn`;};
S.hooks.status=updateStatus;
S.hooks.bill=()=>{updateBill();bumpBill();};
S.hooks.turn=i=>{$('banner').textContent=`Turn ${S.game.turnNo} · ${S.F[i].name}`;};
const OPEN_TITLE={stop:'Stop-hit',parry:'Riposte',counter:'Counter',block:'Parried',dodge:'Evaded',dodgeOver:'Overhead evaded',hit:'Press the advantage',fumble:'Punish the fumble',break:'Guard broken',brace:'Shove braced',flow:'Next in line',clinch:'Clinch',gang:'Gang-up',
  broken:'Broken',turn:'Turned'};
const OPEN_WHY={stop:'They are coming onto your point.',parry:'The parry turned the blow aside.',counter:'The blow came onto a counter.',block:'The parry turned the weapon aside.',broken:'His balance is gone: he has no answer.',turn:'The blow turned aside into his partner.',dodge:'The miss left them reaching.',dodgeOver:'The heavy swing left their feet exposed.',hit:'The hit staggered them.',fumble:'They lost their grip and their balance.',break:'The overhead smashed through the parry.',brace:'The shove bounced off and left the shover overextended.'};
function openingLabel(o,k){return k==='hold'?'Let it pass':k==='guard'?'Recover + guard':k==='bind'?'Weapon control':k==='thrust'&&(o.source==='block'||o.source==='parry')?'Riposte':k==='thrust'&&o.source==='stop'?'Stop-thrust':ACTIONS[k].name;}
function openingSub(o,k){const A=o.f,D=o.opp;
  if(k==='hold')return o.source==='clinch'?'Just hold on':'Keep your tempo';if(k==='guard')return'Guard up';if(k==='bind')return'Pin or tear away their weapon';
  if(DIRTY.includes(k))return dirtySub(A,D,k);
  if(k==='stab')return stabInfo(A)?stabTech(A,D).name:'No dagger';
  if(k==='throw'){const th=throwInfo(A);return th?throwText(th):'No room';}
  if(k==='push')return'Shove them off';
  if(k==='shove'&&shoveVariant(A,D,true))return'Shoulder check';
  if(k==='shove'){const ob=obstacleKind(D,70);return tableBetween(A,D)?'Table in the way':ob?'Into the '+ob:'Two-hand shove';}
  if(k==='thrust'&&o.source==='stop'){const T=stopTech(pickTechnique(A,D,k),D,stopInfo(o));return T.beaten?`${T.name} · beaten aside −${T.beaten}`:T.name;}
  return pickTechnique(A,D,k).name;}
// (a link of Kael's flow spends no balance)
function openingFt0(o,k){if(k==='hold')return 0;const d=footDelta(o.f,k,techFor(o.f,o.opp,k,true));return o.link?Math.max(0,d):d;}
function openingFt(o,k){const d=openingFt0(o,k);return d>0?Math.min(d,footMaxOf(o.f)-o.f.foot):Math.max(d,-o.f.foot);}
function openingHint(o,k){const A=o.f,D=o.opp,c=openCost(A,k),op=openBonus(o);
  if(k==='hold')return'no tempo cost';if(k==='guard')return`+4 DEF · ${c} tempo`;if(k==='bind')return`${D.name} +20 · ${c} tempo`;
  if(DIRTY.includes(k))return`${Math.round(hitChanceT(A,D,k,op,dirtyTech(A,D,k))*100)}% · ${c} tempo`;
  if(k==='stab')return stabInfo(A)?`${Math.round(hitChanceT(A,D,'stab',op,stabTech(A,D))*100)}% · ${c} tempo`:'';
  if(k==='throw')return`${Math.round(chanceOf(throwMods(A,D,true))*100)}% · ${c} tempo`;
  if(k==='push')return`sure · ${c} tempo`;
  if(k==='shove')return`${Math.round(shoveChance(A,D,op)*100)}% · ${c} tempo`;
  if(k==='thrust'&&o.source==='stop')return`${Math.round(hitChanceT(A,D,'thrust',false,stopTech(pickTechnique(A,D,'thrust'),D,stopInfo(o)))*100)}% · ${c} tempo`;
  return`${Math.round(hitChance(A,D,k,op)*100)}% · ${c} tempo`;}
S.hooks.opening=(o,choice)=>{
  previewCmd=null;const el=$('opening');
  if(!o){if(!el.hidden){if(choice)markPicked(choice);setTimeout(()=>{if(!S.opening)el.hidden=true;},choice&&choice!=='hold'?260:120);}$('banner').hidden=false;updateStatus();return;}
  const ai=isAI(o.f.idx);
  $('opTitle').textContent=o.source==='gang'&&o.f.team===0?'Tandem strike':OPEN_TITLE[o.source]||'Opening';
  $('opSub').textContent=`${o.f.name} vs ${o.opp.name}${o.depth>1?` · ${o.depth} in a row`:''}${ai?' · deciding…':' · time slows, choose'}`;
  const hb=heldBy(o.opp),why=o.source==='flow'?`${o.prev?o.prev.name:'The target'} went down and ${o.opp.name} is within reach.`
    :o.source==='clinch'?`${o.f.name} has hold of ${o.opp.name}.`:o.source==='gang'?(hb?`${hb.name} is holding ${o.opp.name}.`:`${o.opp.name} is reeling.`):OPEN_WHY[o.source]||'';
  $('opReason').textContent=`${why} ${o.f.name} ${post(o.f).name.toLowerCase()} · ${o.opp.name} ${o.opp.broken&&!o.opp.downed?'broken':post(o.opp).name.toLowerCase()}.`;
  const nch=openingChoices(o).length;opBtns.innerHTML='';opBtns.classList.toggle('five',nch===5);opBtns.classList.toggle('six',nch>=6);
  openingChoices(o).forEach(k=>{const b=document.createElement('button');b.type='button';b.dataset.c=k;b.disabled=ai||!openValid(o,k);
    const fd=openingFt(o,k);b.innerHTML=`<span>${openingLabel(o,k)}<b class="ft${fd>0?' gain':fd<0?' cost':''}">${footGlyph(fd)}</b></span><span class="tq">${openingSub(o,k)}</span><small>${openingHint(o,k)}</small>`;
    b.addEventListener('click',()=>humanOpening(k));wirePreview(b,k);opBtns.appendChild(b);});
  el.hidden=false;$('banner').hidden=true;$('opBar').style.width='100%';updateStatus();
  if(!ai){const first=opBtns.querySelector('button');if(first&&document.activeElement&&document.activeElement.closest&&document.activeElement.closest('.commands,.op-card'))first.focus({preventScroll:true});}
};
let overTimer=null;
function turnsN(k){return k+' turn'+(k===1?'':'s');}
S.hooks.over=heroWon=>{clearTimeout(overTimer);overTimer=setTimeout(()=>{
  const n=S.cfg.n,fnames=S.F.filter(f=>f.team===1&&!f.npc).map(f=>f.name),two=S.stage.phase>=2,ph=S.stage.phase,cleared=['the dining room','the kitchen','the lobby','the office'].slice(0,ph),reached=ROOMS[S.room]?ROOMS[S.room].name:'kitchen';
  const who2=crewOn()?fnames[0]+' and the crew are':n===1?fnames[0]+' is':n===2?'Both enemies are':'All three enemies are';
  $('overK').textContent=S.auto?(heroWon?HERO_NAME+' wins':HERO_NAME+' falls'):heroWon?'Victory':'Defeat';
  const K=S.F[0],how=K.finName&&K.finBy?`${FIN_LINE[K.finType]?FIN_LINE[K.finType](K.finBy):K.finName+' by '+K.finBy} after ${turnsN(S.game.turnNo)}.`:null;
  const roomsTxt=cleared.length>2?cap(cleared.slice(0,-1).join(', ')+' and '+cleared[cleared.length-1]):cap(cleared.join(' and '));
  $('overT').textContent=heroWon?(S.endText?S.endText+` (${turnsN(S.game.turnNo)})`:two?`${roomsTxt} are clear after ${turnsN(S.game.turnNo)}.`:`${who2} down after ${turnsN(S.game.turnNo)}.`):(how||`${HERO_NAME} is down after ${turnsN(S.game.turnNo)}.`)+(two?` He made it as far as the ${reached}.`:'');
  const bl=$('overBill');if(bl){const parts=billText();bl.hidden=!S.bill.total;bl.textContent=S.bill.total?`The bill: ${S.bill.total.toLocaleString('en-US')} crowns for ${parts.length>1?parts.slice(0,-1).join(', ')+' and '+parts[parts.length-1]:parts[0]}.`:'';}
  $('over').hidden=false;$('banner').textContent=heroWon?HERO_NAME+' stands':HERO_NAME+' has fallen';},1100);};

// audio
let AC=null,master=null,noiseBuf=null;
function ensureAudio(){
  if(!S.soundOn)return null;
  try{if(!AC){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;AC=new C();master=AC.createGain();master.gain.value=.3;master.connect(AC.destination);
      const len=Math.floor(AC.sampleRate*.6);noiseBuf=AC.createBuffer(1,len,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<len;i++)d[i]=uiRand()*2-1;}
    if(AC.state==='suspended')AC.resume();}catch(e){return null;}
  return AC;
}
function nz(dur,type,f0,f1,q,vol){const a=AC,t0=a.currentTime,src=a.createBufferSource();src.buffer=noiseBuf;const fl=a.createBiquadFilter();fl.type=type;
  fl.frequency.setValueAtTime(f0,t0);fl.frequency.exponentialRampToValueAtTime(f1,t0+dur);fl.Q.value=q;const g=a.createGain();
  g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(vol,t0+dur*.25);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
  src.connect(fl);fl.connect(g);g.connect(master);src.start(t0);src.stop(t0+dur+.05);}
function tone(dur,type,f0,f1,vol){const a=AC,t0=a.currentTime,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f0,t0);
  o.frequency.exponentialRampToValueAtTime(f1,t0+dur);g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);o.connect(g);g.connect(master);o.start(t0);o.stop(t0+dur+.05);}
S.soundOn=true;
S.hooks.sound=(k,v)=>{
  if(!S.soundOn||!AC||AC.state!=='running')return;
  try{
    if(k==='swoosh'){const m=clamp(v,.6,3.4);nz(.16+m*.03,'bandpass',420/Math.sqrt(m),2400/Math.sqrt(m),1.3,.32);}
    else if(k==='hit'){tone(.2,'sine',150,48,.55);nz(.12,'lowpass',2200,300,.7,.45);}
    else if(k==='crit'){tone(.32,'triangle',110,34,.6);tone(.2,'sine',180,60,.4);nz(.2,'lowpass',3000,250,.7,.55);}
    else if(k==='clang'){for(const f of [1820,2710,3980])tone(.45,'sine',f,f*.985,.1);nz(.05,'highpass',3000,6000,.7,.28);}
    else if(k==='thud'){nz(.18,'lowpass',700,120,.8,.4);tone(.14,'sine',90,45,.3);}
    else if(k==='crack'){nz(.12,'highpass',2500,900,.9,.5);tone(.16,'square',160,55,.12);nz(.35,'lowpass',1100,140,.8,.45);}
    else if(k==='glass'){const m=clamp(v,.3,1.6);for(const f of [2600,3400,4300,5200])tone(.18+uiRand()*.25,'sine',f*(1+uiRand()*.15),f*.97,.05*m);nz(.22,'highpass',4000,7000,.6,.32*m);}
    else if(k==='china'){for(const f of [1900,2500,3100])tone(.14+uiRand()*.12,'sine',f*(1+uiRand()*.1),f*.95,.05*clamp(v,.3,1.2));nz(.12,'bandpass',3000,2000,1.2,.2);}
    else if(k==='paper'){const m=clamp(v,.3,1.6);nz(.18+.1*m,'bandpass',1600,900,.9,.32*m);nz(.08,'highpass',3500,2500,.7,.2*m);}
    else if(k==='plaster'){const m=clamp(v,.3,1.6);nz(.45,'lowpass',900,90,.8,.5*m);tone(.22,'sine',70,38,.35*m);nz(.15,'highpass',2000,800,.7,.25*m);}
    else if(k==='shing'){const m=clamp(v,.3,1.4);nz(.3,'highpass',2800,6400,.9,.2*m);for(const f of [2350,3520])tone(.34,'sine',f,f*1.04,.035*m);}
    else if(k==='unroll'){const m=clamp(v,.3,1.4),a=AC;for(let i=0;i<11;i++){const t0=a.currentTime+i*.05,o=a.createOscillator(),g=a.createGain();o.type='square';
        o.frequency.setValueAtTime(1500+i*110,t0);g.gain.setValueAtTime(.035*m,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+.028);o.connect(g);g.connect(master);o.start(t0);o.stop(t0+.04);}}
    else if(k==='lock'){const m=clamp(v,.3,1.4);for(const f of [1568,2349,3136])tone(.9,'sine',f,f,.045*m);tone(.18,'sine',160,60,.3*m);nz(.06,'highpass',3500,6000,.7,.25*m);}
    else if(k==='sizzle'){const m=clamp(v,.3,1.6);nz(.55,'highpass',2600,5200,.6,.3*m);nz(.3,'bandpass',4800,3000,2.2,.18*m);}
    else if(k==='wood'){const m=clamp(v,.3,1.6);nz(.1,'bandpass',1400,500,1.4,.4*m);tone(.12,'triangle',190,70,.18*m);}
  }catch(e){}
};

// bench
const benchBox=$('fcfgs'),countSeg=$('countSeg'),arenaSeg=$('arenaSeg'),goreSeg=$('goreSeg');
[['off','Off'],['ink','Ink'],['red','Red']].forEach(([k,l])=>{const b=document.createElement('button');b.type='button';b.dataset.g=k;b.textContent=l;
  b.addEventListener('click',()=>{S.gore=k;updateBench();});goreSeg.appendChild(b);});
const allySeg=$('allySeg');
[[false,'Off'],[true,'On']].forEach(([on,l])=>{const b=document.createElement('button');b.type='button';b.dataset.ally=on?'1':'0';b.textContent=l;
  b.addEventListener('click',()=>{if(S.cfg.ally.on===on)return;S.cfg.ally.on=on;S.showcase=false;S.F=[];rosterBuild();restart();});allySeg.appendChild(b);});
$('tAllyAuto').addEventListener('change',e=>{S.allyAuto=e.target.checked;const g=S.game;if(g.phase==='input')g.aiAt=isAI(g.active)?S.t+.4:null;if(S.opening)S.hooks.opening(S.opening);updateStatus();});
[1,2,3].forEach(n=>{const b=document.createElement('button');b.type='button';b.dataset.n=n;b.textContent=n===1?'1 v 1':'1 v '+n;
  b.addEventListener('click',()=>{if(S.cfg.n===n&&!crewOn())return;S.cfg.n=n;S.cfg.crew=false;S.showcase=false;S.F=[];rosterBuild();restart();});countSeg.appendChild(b);});
{const b=document.createElement('button');b.type='button';b.dataset.n='crew';b.textContent='Crew';
  b.addEventListener('click',()=>{if(crewOn())return;S.cfg.n=1;S.cfg.crew=true;S.showcase=false;S.F=[];rosterBuild();restart();});countSeg.appendChild(b);}
for(const [k,a] of Object.entries(ARENAS)){const b=document.createElement('button');b.type='button';b.dataset.a=k;b.textContent=a.label;
  b.addEventListener('click',()=>{S.arenaKey=k;S.showcase=false;restart();});arenaSeg.appendChild(b);}
// one card per fighter: Kael, Amri, the dining room enemies and, in the restaurant, the kitchen crew. A card whose fighter is on the
// floor right now changes that fighter at once; the others change the set-up for when they come in.
function benchEntries(){
  const out=[],K=S.F[0],A=S.F.find(f=>f.ally),two=backroomOn();
  out.push({key:'k',f:K,cfg:S.cfg.hero,name:K.name,color:K.color});
  if(A)out.push({key:'m',f:A,cfg:S.cfg.ally,name:A.name,color:A.color,ally:true});
  for(let i=1;i<=S.cfg.n;i++){const f=S.F[i];out.push({key:'a'+i,f:f&&f.team===1&&!f.p2&&!f.p3&&!f.p4&&!f.npc?f:null,cfg:S.cfg.foes[i-1],name:FOE_NAMES[i-1],color:FOE_COLORS[i-1],foe:true,dt:DEFAULT_TEMPER[i-1],group:two?'dining':null,note:crewNote(CREW.size)});}
  if(two)for(let i=1;i<=S.cfg.n;i++){const f=S.F[i];out.push({key:'b'+i,f:f&&f.p2?f:null,cfg:S.cfg.foes2[i-1],name:FOE2_NAMES[i-1],color:FOE2_COLORS[i-1],foe:true,dt:DEFAULT_TEMPER2[i-1],group:'kitchen',note:crewNote(CREW.kitchen)});}
  if(deepOn()){for(let i=1;i<=S.cfg.n;i++){const f=S.F[i];out.push({key:'c'+i,f:f&&f.p3?f:null,cfg:S.cfg.foes3[i-1],name:FOE3_NAMES[i-1],color:FOE3_COLORS[i-1],foe:true,dt:DEFAULT_TEMPER3[i-1],group:'lobby',note:crewNote(CREW.lobby)});}
    const f=S.F[1];out.push({key:'d1',f:f&&f.boss?f:null,cfg:S.cfg.boss,name:BOSS.name,color:BOSS.color,foe:true,dt:S.cfg.boss.temper,group:'office',note:'Head of security. He fights alone while his employer watches.'});}
  return out;}
function buildBench(){
  benchBox.innerHTML='';let grp=null;
  for(const e of benchEntries()){
    if(e.group&&e.group!==grp){grp=e.group;const h=document.createElement('p');h.className='fgroup';h.textContent={kitchen:'Kitchen · phase 2',lobby:'Lobby · phase 3',office:'Office · phase 4'}[grp]||'Dining room · phase 1';benchBox.appendChild(h);}
    // an elf never fights below his rank floor (sk_cast.js), so the slider stops there
    const lo=e.foe&&typeof elfMin==='function'?elfMin(e.name):1;if(e.cfg.skill<lo)e.cfg.skill=lo;
    const cfg=e.cfg,f=e.f,k=e.key,skill=Math.max(lo,f?f.skill:cfg.skill),live=()=>!!f&&S.F.includes(f),d=document.createElement('div');d.className='fcfg'+(e.ally?' ally':'');d.dataset.k=k;
    d.innerHTML=`<div class="fcfg-head"><span class="swatch" style="background:${e.color}"></span><b>${e.name}</b><span class="bdesc" id="bd${k}"></span></div>
      <div class="seg${k==='k'?' kael':''}" role="group" aria-label="${e.name} weapon">${(k==='k'?['elven',...REAL_WEAPONS]:REAL_WEAPONS).map(kk=>WEAPONS[kk]).map(w=>`<button type="button" data-w="${w.key}" aria-pressed="${w.key===cfg.weapon}"${w.heroOnly?' class="sig"':''}>${w.heroOnly?'Elven arc-blade':w.short}</button>`).join('')}</div>
      <div class="skill-row"><label for="sk${k}">Skill</label><input type="range" id="sk${k}" min="${lo}" max="5" step="1" value="${skill}"><output id="sko${k}" for="sk${k}">${SKILLS[skill-1]}</output></div>
      ${e.foe?`<div class="seg seg4 temper" role="group" aria-label="${e.name} temperament">${TEMPER_ORDER.map(t=>`<button type="button" data-t="${t}" aria-pressed="${(cfg.temper||e.dt)===t}" title="${TEMPERS[t].tip}">${TEMPERS[t].name}</button>`).join('')}</div>`:''}
      <button type="button" class="btn btn-small" id="nb${k}">New body</button>${e.note?`<p class="fnote">${e.note}</p>`:''}`;
    benchBox.appendChild(d);
    d.querySelectorAll('[data-w]').forEach(b=>b.addEventListener('click',()=>{const wk=b.dataset.w;cfg.weapon=wk;
      d.querySelectorAll('[data-w]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));if(live())applyOrQueue(()=>{f.setWeapon(wk);f.ownWeapon=null;if(f.sidearm)f.sidearm='sheathed';for(const o of S.F)o.intent=null;ensureIntents();});}));
    d.querySelectorAll('[data-t]').forEach(b=>b.addEventListener('click',()=>{const t=b.dataset.t;cfg.temper=t;d.querySelectorAll('[data-t]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
      if(live())applyOrQueue(()=>{f.temper=t;f.intent=null;ensureIntents();});}));
    const sk=$('sk'+k);sk.addEventListener('input',()=>{cfg.skill=+sk.value;if(live())f.skill=cfg.skill;$('sko'+k).textContent=SKILLS[cfg.skill-1];updateStatus();});
    $('nb'+k).addEventListener('click',()=>{const seed=1+Math.floor(Math.random()*9998);cfg.seed=seed;
      if(live())applyOrQueue(()=>{const hp=f.hp,mh=f.maxHp,dead=f.dead;f.setup(seed,f.weaponKey,f.skill,f.station,f.lane);f.hp=hp;f.maxHp=mh;f.dead=dead;if(dead){f.motor=0;f.knockUntil=Infinity;}updateBench();});else updateBench();});
  }
  updateBench();
}
function updateBench(){
  for(const e of benchEntries()){const el=$('bd'+e.key);if(!el)continue;const seed=e.f?e.f.seed:e.cfg.seed;el.textContent=`#${seed} · ${describeBody(e.f?e.f.body:S.hooks.body({name:e.name,team:e.foe?1:0,seed},genBody(seed)))}`;}
  $('backTog').hidden=S.arenaKey!=='restaurant';$('tBack').checked=!!S.backroom;$('deepTog').hidden=S.arenaKey!=='restaurant';$('tDeep').checked=!!S.deep;lockRunToggles();
  goreSeg.querySelectorAll('[data-g]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.g===S.gore)));
  countSeg.querySelectorAll('[data-n]').forEach(b=>{if(b.dataset.n==='crew'){b.setAttribute('aria-pressed',String(crewOn()));b.textContent=allyOn()?'2 v crew':'Crew';return;}
    b.setAttribute('aria-pressed',String(+b.dataset.n===S.cfg.n&&!crewOn()));const n=+b.dataset.n;b.textContent=allyOn()?(n===1?'2 v 1':'2 v '+n):(n===1?'1 v 1':'1 v '+n);});
  allySeg.querySelectorAll('[data-ally]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.ally==='1')===allyOn())));
  $('allyAutoRow').hidden=!allyOn();$('tAllyAuto').checked=!!S.allyAuto;
  arenaSeg.querySelectorAll('[data-a]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.a===S.arenaKey)));
}
function busy(){return S.game.phase==='exchange'||!!S.opening;}
function applyOrQueue(fn){if(busy())S.pending.push(()=>{fn();updateStatus();});else{fn();updateStatus();}}
$('tDebug').addEventListener('change',e=>{S.debug=e.target.checked;});
$('tSlow').addEventListener('change',e=>{S.userSlow=e.target.checked;});
$('tAuto').addEventListener('change',e=>{S.auto=e.target.checked;if(!S.auto)S.showcase=false;const g=S.game;if(g.phase==='input')g.aiAt=isAI(g.active)?S.t+.4:null;if(S.opening)S.hooks.opening(S.opening);updateStatus();});
$('tSound').addEventListener('change',e=>{S.soundOn=e.target.checked;if(S.soundOn)ensureAudio();});
function setTable(){
  if(S.tableOn){const td=S.table&&S.table.on&&S.table.state==='intact'?{x:tableBox().cx,d:S.table.dep}:tableDefault();if(td)placeTable(td.x,td.d);}
  else{if(S.table)S.table.on=false;S.debris=[];S.wares=S.wares.filter(it=>it.host!=='T');}
  for(const f of S.F)f.intent=null;ensureIntents();updateStatus();
}
$('tTable').addEventListener('change',e=>{S.tableOn=e.target.checked;if(busy())S.pending.push(setTable);else setTable();});
function resetTable(){S.tableOn=true;$('tTable').checked=true;const td=tableIntact()?{x:tableBox().cx,d:S.table.dep}:tableDefault();if(td)placeTable(td.x,td.d);
  S.debris=[];envBuild();for(const f of S.F)f.intent=null;ensureIntents();updateStatus();}
$('tDivs').addEventListener('change',e=>{S.divOn=e.target.checked;const fn=()=>{setDividers();for(const f of S.F)f.intent=null;ensureIntents();updateStatus();};if(busy())S.pending.push(fn);else fn();});
$('showcase').addEventListener('click',()=>{ensureAudio();S.arenaKey='restaurant';S.cfg.n=3;S.cfg.ally.on=true;S.divOn=true;S.tableOn=true;$('tTable').checked=true;S.showcase=true;S.auto=true;$('tAuto').checked=true;S.F=[];rosterBuild();restart();});
$('resetTable').addEventListener('click',()=>{if(busy())S.pending.push(resetTable);else resetTable();});
function toWorld(e){const r=cv.getBoundingClientRect(),vh=cam.viewW/aspect;return{x:cam.x-cam.viewW/2+(e.clientX-r.left)/r.width*cam.viewW,y:camTop()+(e.clientY-r.top)/r.height*vh};}
function floorAt(w){let d=(GB-w.y)/PSY,x=w.x-d*PSX;for(let i=0;i<3;i++){const g=S.arena.ground(x,d);d=(g-w.y)/PSY;x=w.x-d*PSX;}return{x,d};}
function tableScreenBox(){const T=S.table;let l=1e9,r=-1e9,t=1e9,b=-1e9;for(const q of T.pts)for(const d of [T.dep-TD,T.dep+TD]){const s=P(q.x,q.y,d);l=Math.min(l,s.x);r=Math.max(r,s.x);t=Math.min(t,s.y);b=Math.max(b,s.y);}return{l,r,t,b};}
function overTable(w){if(!tableIntact())return false;const s=tableScreenBox();return w.x>s.l-10&&w.x<s.r+10&&w.y>s.t-24&&w.y<s.b+8;}
function fighterAt(w){let best=null,bd=1e9;
  for(const f of S.F){if(f.dead||f.team!==1||f.npc||!targetable(f))continue;const pel=f.p[PEL],x=prjX(pel.x,f.dep),top=prjY(f.p[HEAD].y-f.body.headR,f.dep)-8,bot=prjY(f.gr(pel.x),f.dep)+8;
    if(w.x>x-32&&w.x<x+32&&w.y>top&&w.y<bot&&f.dep<bd){bd=f.dep;best=f;}}
  return best;}
let drag=null;
cv.addEventListener('pointerdown',e=>{const w=toWorld(e);
  if(!busy()&&overTable(w)){const fl=floorAt(w);drag={ox:tableBox().cx-fl.x,od:S.table.dep-fl.d};try{cv.setPointerCapture(e.pointerId);}catch(_){}e.preventDefault();return;}
  const f=fighterAt(w);if(f)setTarget(f.idx);});
cv.addEventListener('pointermove',e=>{const w=toWorld(e);
  if(drag){if(busy()){drag=null;return;}const fl=floorAt(w);placeTable(fl.x+drag.ox,fl.d+drag.od);for(const f of S.F)f.intent=null;ensureIntents();updateStatus();return;}
  if(e.pointerType==='mouse')cv.style.cursor=!busy()&&overTable(w)?'grab':fighterAt(w)?'pointer':'';});
const endDrag=()=>{drag=null;};cv.addEventListener('pointerup',endDrag);cv.addEventListener('pointercancel',endDrag);
$('restart').addEventListener('click',()=>{ensureAudio();restart();});
$('rematch').addEventListener('click',()=>{ensureAudio();restart();});

function restart(){
  clearTimeout(overTimer);$('over').hidden=true;$('tDivs').checked=S.divOn;$('opening').hidden=true;$('banner').hidden=false;logPlaceholder();
  if(S.F.length!==rosterSize())rosterBuild();
  S.arena=ARENAS[S.arenaKey];buildScenery();buildRows();initDuel();buildRows();buildBench();updateStatus();
}

// loop
let last=performance.now(),acc=0,tagClock=0;
function frame(now){
  requestAnimationFrame(frame);
  const rdt=Math.min(.05,(now-last)/1000);last=now;
  if(S.paused){updateCamera(rdt);camVert(rdt);uiTick();render();return;}
  if(S.freeze>0)S.freeze-=rdt;
  else{const sc=(S.opening?.08:1)*(S.userSlow?.35:1)*(S.slowT>0?.3:1);if(S.slowT>0)S.slowT-=rdt;acc+=rdt*sc;let n=0;while(acc>=DT&&n<12){simStep();acc-=DT;n++;}if(n>=12)acc=0;}
  if(S.opening){tickOpening(rdt);if(S.opening)$('opBar').style.width=(clamp(S.opening.left/S.opening.dur,0,1)*100)+'%';}
  S.shake*=Math.exp(-rdt*10);if(S.shake<.05)S.shake=0;
  if(S.punch){S.punch.t=(S.punch.t||0)+rdt;if(S.punch.t>1)S.punch=null;}
  if(S.camKick){S.camKick.t+=rdt;if(S.camKick.t>.3)S.camKick=null;}
  tagClock+=rdt;if(tagClock>.25){tagClock=0;updateTags();}
  updateCamera(rdt);camVert(rdt);uiTick();render();
}
// What the page does each frame whether or not the frame is drawn: the HUD's state, the panels, the sounds that follow the scene, a
// scene's textures made ahead (V11UI.tick). The drawing (render) changes nothing the game or the page reads, so the checks can skip it.
function uiTick(){for(const fn of V11UI.tick)fn();}
for(const fn of V11UI.init)fn();
restart();
{let lo=1e9,hi=-1e9;for(const f of S.F){const x=prjX(f.p[PEL].x,f.dep);lo=Math.min(lo,x);hi=Math.max(hi,x);}
  cam.viewW=camNarrow()?clamp(hi-lo+280,560,W):W;cam.x=clamp((lo+hi)/2,cam.viewW/2,W-cam.viewW/2);cam.tSet=false;camVert(0);}
requestAnimationFrame(frame);
