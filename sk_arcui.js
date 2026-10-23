// ---------- the arc-blade, scabbards and the readying intro, drawn ----------
// (loaded ahead of the main UI script; everything here runs only once the UI is up)
const ARC_GLOW='#7ff3e3',ARC_GLOW2='#d9fffa';
// where the arc-blade is in its life: rolled up, unrolling, locking, out on the chain, or relocking after a lash
function arcState(f){const A=f.arc;
  if(A){const u=S.t-A.t0;if(u<A.unroll[0])return{mode:'rolled'};if(u<A.unroll[1])return{mode:'unroll',p:(u-A.unroll[0])/(A.unroll[1]-A.unroll[0])};
    if(u<A.lock[1])return{mode:'lock',q:(u-A.lock[0])/(A.lock[1]-A.lock[0])};}
  if(f.lash&&f.lashLen>f.wp.len+2)return{mode:'lash',L:f.lashLen};
  if(S.t-(f.relockT??-9)<.32)return{mode:'pulse',q:(S.t-f.relockT)/.32};
  return null;}
// the curved, segmented blade between grip h and tip t; sd mirrors the curve to the fighter's facing
function drawArcBladeAt(h,t,sd,st){
  const wp=WEAPONS.elven,Lr=Math.hypot(t.x-h.x,t.y-h.y)||1,ux=(t.x-h.x)/Lr,uy=(t.y-h.y)/Lr,nx=-uy*sd,ny=ux*sd,mode=st?st.mode:'rigid';
  const pt=(a,b=0)=>({x:h.x+ux*a+nx*b,y:h.y+uy*a+ny*b});
  // the hilt: a slim angular guard, a wrapped grip and a ring pommel
  ctx.fillStyle=SIL;ctx.lineCap='round';ctx.lineJoin='round';
  seg(pt(-wp.butt+2),pt(1),3.4,SIL);
  ctx.strokeStyle=SIL;ctx.lineWidth=2.2;ctx.beginPath();const pr=pt(-wp.butt-1.5);ctx.arc(pr.x,pr.y,3.1,0,TAU);ctx.stroke();
  poly([pt(1,-7.5),pt(4.5,-5.2),pt(4.2,6.5),pt(1.8,8.8),pt(.4,4)]);
  seg(pt(-wp.butt+3,.6),pt(-.5,.6),.8,'rgba(127,243,227,.45)');
  const L=mode==='lash'?st.L:wp.len,g0=4.5,N=ARC_SEGS,bow=5.2;
  const half=s=>s<.86?lerp(3.1,2.3,s/.86):2.3*(1-(s-.86)/.14);
  if(mode==='rolled'){drawArcCoil(pt(7),5.4,ux,uy,sd,1);return;}
  if(mode==='lash'){drawArcChain(h,ux,uy,nx,ny,L,g0,wp.len);return;}
  const cut=mode==='unroll'?st.p:1,wob=mode==='unroll'?1:mode==='lock'?1-st.q:0;
  const cAt=(s,j)=>{const along=g0+s*(wp.len-g0),off=bow*4*s*(1-s)+(wob?Math.sin(S.t*38+j*1.9)*1.6*wob*s:0);return pt(along,off);};
  // segments with hairline seams between them; the tip segment comes to a point
  const gap=.55/(wp.len-g0);
  for(let i=0;i<N;i++){const s0=i/N,s1=(i+1)/N;if(s0>=cut)break;const e1=Math.min(s1,cut),a0=s0+(i?gap:0),a1=e1-(e1<1?gap:0);
    const A0=cAt(a0,i),A1=cAt(a1,i),w0=half(a0),w1=half(a1);
    ctx.fillStyle=SIL;poly([{x:A0.x+nx*w0,y:A0.y+ny*w0},{x:A1.x+nx*w1,y:A1.y+ny*w1},{x:A1.x-nx*w1*.9,y:A1.y-ny*w1*.9},{x:A0.x-nx*w0*.9,y:A0.y-ny*w0*.9}]);}
  // the edge catches the light along the convex side
  ctx.strokeStyle=HL;ctx.lineWidth=.9;ctx.beginPath();for(let k=0;k<=12;k++){const s=.04+k/12*(Math.min(cut,1)*.92);const c=cAt(s,Math.floor(s*N));const w=half(s)*.72;const q={x:c.x+nx*w,y:c.y+ny*w};k?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);}ctx.stroke();
  // seams and the thread of light that holds the segments: faint when locked, bright while it locks
  ctx.save();ctx.globalCompositeOperation='lighter';
  const lockAt=mode==='lock'?st.q:mode==='pulse'?st.q:mode==='unroll'?0:1.01;
  for(let i=1;i<N;i++){const s=i/N;if(s>cut)break;const c=cAt(s,i),w=half(s),lit=s<=lockAt;
    ctx.globalAlpha=lit?(mode==='rigid'||lockAt>1?.35:.75):.22;ctx.strokeStyle=lit?ARC_GLOW:'#3a9f95';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(c.x+nx*w,c.y+ny*w);ctx.lineTo(c.x-nx*w,c.y-ny*w);ctx.stroke();}
  ctx.globalAlpha=mode==='rigid'?.2:.32;ctx.strokeStyle=ARC_GLOW;ctx.lineWidth=.9;ctx.beginPath();for(let k=0;k<=10;k++){const s=.05+k/10*(Math.min(cut,1)*.86);const c=cAt(s,0);k?ctx.lineTo(c.x,c.y):ctx.moveTo(c.x,c.y);}ctx.stroke();
  if(mode==='lock'||mode==='pulse'){const s=clamp(lockAt,0,1),c=cAt(s,0),r=mode==='pulse'?9:13,gr=ctx.createRadialGradient(c.x,c.y,0,c.x,c.y,r);
    gr.addColorStop(0,'rgba(217,255,250,.95)');gr.addColorStop(.4,'rgba(127,243,227,.55)');gr.addColorStop(1,'rgba(127,243,227,0)');ctx.globalAlpha=1;ctx.fillStyle=gr;ctx.beginPath();ctx.arc(c.x,c.y,r,0,TAU);ctx.fill();}
  ctx.restore();
  if(mode==='unroll'&&cut<1){const c=cAt(cut,Math.floor(cut*N));drawArcCoil({x:c.x-nx*(1.5+3.8*(1-cut)),y:c.y-ny*(1.5+3.8*(1-cut))},1.6+3.8*(1-cut),ux,uy,sd,1-cut);}
}
// the blade still rolled up: a tight coil of segments
function drawArcCoil(c,r,ux,uy,sd,k){
  ctx.fillStyle=SIL;ctx.beginPath();ctx.arc(c.x,c.y,r+1.6,0,TAU);ctx.fill();
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=ARC_GLOW;ctx.globalAlpha=.55;ctx.lineWidth=.9;ctx.beginPath();
  const a0=Math.atan2(uy,ux);for(let i=0;i<=28;i++){const u=i/28,a=a0+sd*u*TAU*1.6+S.t*9*sd,rr=r*(1-u*.8);const q={x:c.x+Math.cos(a)*rr,y:c.y+Math.sin(a)*rr};i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);}ctx.stroke();ctx.restore();}
// the lash: the segments strung out on a thread of light, whipping toward the tip
function drawArcChain(h,ux,uy,nx,ny,L,g0,len){
  const N=ARC_SEGS,sl=(len-g0)/N,gapL=(L-g0-sl*N)/(N-1),A=Math.min(9,gapL*.22),ph=S.t*34,pts=[];
  for(let i=0;i<N;i++){const a=g0+i*(sl+gapL),s=(a+sl/2)/L,w=A*Math.sin(Math.PI*s)*Math.sin(ph-s*9);
    const c={x:h.x+ux*(a+sl/2)+nx*w,y:h.y+uy*(a+sl/2)+ny*w},dw=A*Math.PI/L*Math.cos(Math.PI*s)*Math.sin(ph-s*9)-A*9/L*Math.sin(Math.PI*s)*Math.cos(ph-s*9);
    const tx=ux+nx*dw,ty=uy+ny*dw,tl=Math.hypot(tx,ty)||1;pts.push({c,tx:tx/tl,ty:ty/tl});}
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=ARC_GLOW;ctx.lineWidth=2.4;ctx.globalAlpha=.35;ctx.beginPath();ctx.moveTo(h.x+ux*g0,h.y+uy*g0);for(const q of pts)ctx.lineTo(q.c.x,q.c.y);ctx.stroke();
  ctx.lineWidth=1;ctx.globalAlpha=.85;ctx.strokeStyle=ARC_GLOW2;ctx.stroke();ctx.restore();
  pts.forEach((q,i)=>{const hl=sl*.5,w=i===N-1?1.8:lerp(3,2.3,i/N),qx=-q.ty,qy=q.tx,a={x:q.c.x-q.tx*hl,y:q.c.y-q.ty*hl},b={x:q.c.x+q.tx*hl,y:q.c.y+q.ty*hl};
    ctx.fillStyle=SIL;if(i===N-1)poly([{x:a.x+qx*w,y:a.y+qy*w},{x:b.x+q.tx*3,y:b.y+q.ty*3},{x:a.x-qx*w,y:a.y-qy*w}]);else poly([{x:a.x+qx*w,y:a.y+qy*w},{x:b.x+qx*w,y:b.y+qy*w},{x:b.x-qx*w,y:b.y-qy*w},{x:a.x-qx*w,y:a.y-qy*w}]);
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.6;ctx.strokeStyle=ARC_GLOW;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.restore();});}
// ---------- scabbards ----------
function drawScabbard(f){const q=scabFrame(f),m=q.mouth,e={x:m.x+q.sx*q.len,y:m.y+q.sy*q.len},nx=-q.sy,ny=q.sx,dg=f.scab==='dagger';
  ctx.lineCap='round';ctx.fillStyle=SIL;
  poly([{x:m.x+nx*3,y:m.y+ny*3},{x:e.x+nx*2,y:e.y+ny*2},{x:e.x+q.sx*3,y:e.y+q.sy*3},{x:e.x-nx*2,y:e.y-ny*2},{x:m.x-nx*3,y:m.y-ny*3}]);
  seg({x:m.x+q.sx*3+nx*.6,y:m.y+q.sy*3+ny*.6},{x:e.x-q.sx*3+nx*.6,y:e.y-q.sy*3+ny*.6},.8,HL);
  seg({x:m.x-nx*3.4,y:m.y-ny*3.4},{x:m.x+nx*3.4,y:m.y+ny*3.4},2.2,'#8a6a32');
  if(!dg)seg({x:e.x-q.sx*7-nx*2.2,y:e.y-q.sy*7-ny*2.2},{x:e.x-q.sx*7+nx*2.2,y:e.y-q.sy*7+ny*2.2},1.6,'#8a6a32');}
// a sword or dagger on its way out: the grip in the hand, the blade showing from the hand to the scabbard's mouth
function drawDrawing(f){const k=f.weaponKey,wp=f.wp,q=scabFrame(f),h=f.p[HAF],m=q.mouth,vx=m.x-h.x,vy=m.y-h.y,vis=Math.hypot(vx,vy),ux=vis?vx/vis:q.sx,uy=vis?vy/vis:q.sy,nx=-uy,ny=ux;
  const pt=(a,b=0)=>({x:h.x+ux*a+nx*b,y:h.y+uy*a+ny*b}),dg=k==='dagger',bl=Math.min(wp.len,vis);
  ctx.fillStyle=SIL;ctx.lineCap='round';
  seg(pt(-wp.butt),pt(0),dg?3.2:3.4,SIL);circ(pt(-wp.butt),dg?2.4:3);seg(pt(dg?2:3,dg?5:8),pt(dg?2:3,dg?-5:-8),dg?3:3.4,SIL);
  if(bl>5){poly([pt(dg?3:5,dg?2.3:2.7),pt(bl,dg?2:2.5),pt(bl,dg?-2:-2.5),pt(dg?3:5,dg?-2.3:-2.7)]);seg(pt(dg?5:8,1),pt(bl-1,.9),1,HL);}}
// ---------- the intro on screen ----------
S.hooks.intro=step=>{const b=document.getElementById('banner');if(step==='start'){b.textContent='Weapons out';}};
document.getElementById('tIntro').addEventListener('change',e=>{S.introOn=e.target.checked;});
