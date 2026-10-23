// The drawing's own dice. The game rolls Math.random (the checks seed it), so anything drawn, heard or eased on the screen rolls these
// instead, and the game comes out the same however many of its frames are drawn.
const uiRand=mulberry32(0x9e3779b9);
// ---------- environment drawing: the restaurant, divider walls, furniture, tableware, lamps and debris ----------
// (loaded ahead of the main UI script; everything here runs only once the UI is up)
const RM={wall:'#4c2443',wall2:'#57294c',wain:'#2a1426',rail:'rgba(255,196,140,.42)',floorN:'#2f1a28',floorF:'#5d3443',seam:'rgba(14,6,14,.34)',beam:'#1b0e1a',
  wood:'#24121c',wood2:'#3a2030',brass:'#c9a25a',cloth:'#eadbc2',clothS:'#cdb89c',marble:'#d6c3bd',marbleS:'#a88f8c',paper:'rgba(247,226,186,.9)',frame:'#2a1712'};
const ROOM={far:236,winY0:96,winY1:226};
let ROOM_BOTTLES=null;
function roomBottles(){if(ROOM_BOTTLES)return ROOM_BOTTLES;const r=mulberry32(77),L=[];
  for(let row=0;row<3;row++)for(let x=548;x<880;x+=9+r()*6){const h=14+r()*12;L.push({x,row,h,w:4+r()*3,c:['#8a2f2f','#2f6a4a','#c9a25a','#5a3a7a','#b5567a','#3a5a8a'][Math.floor(r()*6)],tall:r()<.4});}
  return ROOM_BOTTLES=L;}
function litFrac(){if(!S.lamps.length)return 1;let n=0;for(const L of S.lamps)if(L.lit)n++;return n/S.lamps.length;}
// the back wall, windows, bar and ceiling, then the floor: painted once into a layer and reused every frame
const RC={x0:-150,y0:-90,w:W+380,h:H+200};let ROOM_LAYERS={};
function paintRoom(c){
  const far=ROOM.far,yB=prjY(GB,far),X0=-140,X1=W+220,L=RC.x0,T=RC.y0,VW=RC.w,VH=RC.h,pl=pts=>{c.beginPath();c.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)c.lineTo(pts[i].x,pts[i].y);c.closePath();c.fill();};
  // ceiling and wall
  const wg=c.createLinearGradient(0,T,0,yB);wg.addColorStop(0,'#1d0f1c');wg.addColorStop(.18,'#36182f');wg.addColorStop(.55,RM.wall);wg.addColorStop(1,'#3a1a33');
  c.fillStyle=wg;c.fillRect(L-40,T-40,VW+80,yB-T+44);
  c.fillStyle='rgba(255,210,170,.035)';for(let x=-60;x<W+200;x+=28)c.fillRect(x,ROOM.winY0-46,12,yB-ROOM.winY0+46-64);
  // windows onto the dusk street
  for(const wx of [150,300]){const x0=wx+far*PSX-44,x1=x0+88,y0=ROOM.winY0,y1=ROOM.winY1;
    c.save();c.beginPath();c.moveTo(x0,y1);c.lineTo(x0,y0+44);c.arc((x0+x1)/2,y0+44,44,Math.PI,0);c.lineTo(x1,y1);c.closePath();c.clip();
    const g=c.createLinearGradient(0,y0,0,y1);g.addColorStop(0,'#2a1d52');g.addColorStop(.45,'#9c4a78');g.addColorStop(.8,'#ee8a5e');g.addColorStop(1,'#ffbe7a');c.fillStyle=g;c.fillRect(x0,y0,88,y1-y0);
    const sg=c.createRadialGradient(x0+60,y1-20,4,x0+60,y1-20,70);sg.addColorStop(0,'rgba(255,226,170,.85)');sg.addColorStop(1,'rgba(255,190,120,0)');c.fillStyle=sg;c.fillRect(x0,y0,88,y1-y0);
    c.fillStyle='#21163a';const r=mulberry32(wx);for(let bx=x0-4;bx<x1;bx+=10+r()*12){const h=20+r()*46;c.fillRect(bx,y1-h,9+r()*8,h);}
    for(let i=0;i<14;i++){c.fillStyle=r()<.4?'rgba(255,200,125,.85)':'rgba(255,190,130,.25)';c.fillRect(x0+r()*80,y1-8-r()*40,2,3);}
    c.restore();
    c.strokeStyle='#1a0d18';c.lineWidth=5;c.beginPath();c.moveTo(x0,y1);c.lineTo(x0,y0+44);c.arc((x0+x1)/2,y0+44,44,Math.PI,0);c.lineTo(x1,y1);c.closePath();c.stroke();
    c.lineWidth=2.4;c.beginPath();c.moveTo((x0+x1)/2,y0);c.lineTo((x0+x1)/2,y1);c.moveTo(x0,y0+70);c.lineTo(x1,y0+70);c.stroke();
    c.fillStyle='#1a0d18';c.fillRect(x0-8,y1,x1-x0+16,7);c.fillStyle=RM.rail;c.fillRect(x0-8,y1,x1-x0+16,1.4);}
  // a painted sign and a framed picture
  {const x=470+far*PSX-60,y=ROOM.winY0+10;c.fillStyle='#1a0d18';c.fillRect(x-4,y-4,128,40);c.fillStyle='#2a1426';c.fillRect(x,y,120,32);
    c.font='italic 700 19px "Alegreya SC",Georgia,serif';c.textAlign='center';c.fillStyle='#e9c27a';c.fillText('Lantern Bistro',x+60,y+22);
    c.fillStyle=RM.brass;c.fillRect(x+16,y+26,88,1.2);}
  {const x=60+far*PSX-20,y=ROOM.winY0+20;c.fillStyle='#8a6a32';c.fillRect(x-3,y-3,46,58);c.fillStyle='#2a1d3a';c.fillRect(x,y,40,52);
    c.fillStyle='#b5567a';c.beginPath();c.arc(x+20,y+30,9,0,TAU);c.fill();c.fillStyle='#1a1230';c.fillRect(x,y+38,40,14);}
  // the bar along the back on the right: shelves of bottles behind a long counter
  {const x0=540+far*PSX-10,x1=W+far*PSX+40,top=ROOM.winY0-10,cy=yB-74;
    const mg=c.createLinearGradient(0,top,0,cy);mg.addColorStop(0,'#2a1830');mg.addColorStop(1,'#4a2a40');c.fillStyle=mg;c.fillRect(x0,top,x1-x0,cy-top);
    c.fillStyle='rgba(255,200,150,.07)';c.fillRect(x0+6,top+6,x1-x0-12,36);
    for(let row=0;row<3;row++){const sy=top+48+row*34;c.fillStyle='#1a0d18';c.fillRect(x0,sy,x1-x0,4);c.fillStyle=RM.rail;c.fillRect(x0,sy,x1-x0,1);}
    for(const b of roomBottles()){const bx=b.x+far*PSX,sy=top+48+b.row*34;c.fillStyle='#120a14';c.fillRect(bx,sy-b.h,b.w,b.h);c.fillRect(bx+b.w*.3,sy-b.h-(b.tall?7:4),b.w*.4,b.tall?7:4);
      c.fillStyle=b.c;c.globalAlpha=.55;c.fillRect(bx+1,sy-b.h+3,1.4,b.h-5);c.globalAlpha=1;}
    c.fillStyle='#1a0d18';c.fillRect(x0-10,cy-6,x1-x0+20,8);c.fillStyle=RM.brass;c.fillRect(x0-10,cy-6,x1-x0+20,1.5);}
  // wainscot
  const wy=yB-64;c.fillStyle=RM.wain;c.fillRect(X0,wy,X1-X0,yB-wy);c.fillStyle=RM.rail;c.fillRect(X0,wy,X1-X0,1.6);
  c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=1;c.beginPath();for(let x=-40;x<W+200;x+=56){c.moveTo(x,wy+10);c.lineTo(x,yB-6);}c.stroke();
  {const x0=540+far*PSX-10,x1=W+far*PSX+40;c.fillStyle='#331a2c';c.fillRect(x0,wy-12,x1-x0,yB-wy+12);c.fillStyle=RM.brass;c.fillRect(x0,yB-14,x1-x0,1.6);c.fillStyle='rgba(255,196,140,.3)';c.fillRect(x0,wy-12,x1-x0,1.4);}
  paintDiningDoor(c);
  // beams
  c.fillStyle=RM.beam;c.fillRect(L-40,T-40,VW+80,48+40);
  for(let x=-40;x<W+200;x+=120){c.fillStyle='#120812';c.fillRect(x,T-40,16,80);}
  c.fillStyle='rgba(255,190,140,.18)';c.fillRect(L-40,46,VW+80,1.4);
  // floor
  const top=[];for(let x=X0;x<=X1;x+=20)top.push(P(x,GB,far));
  const fg=c.createLinearGradient(0,yB,0,H+60);fg.addColorStop(0,RM.floorF);fg.addColorStop(.35,'#462838');fg.addColorStop(1,RM.floorN);
  c.fillStyle=fg;c.beginPath();c.moveTo(top[0].x,top[0].y);for(const q of top)c.lineTo(q.x,q.y);c.lineTo(prjX(X1,-90),H+90);c.lineTo(prjX(X0,-90),H+90);c.closePath();c.fill();
  c.strokeStyle=RM.seam;c.lineWidth=1;c.beginPath();
  for(let d=-80,k=0;d<=far;d+=11,k++){const a=P(X0,GB,d),b=P(X1,GB,d);c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);
    for(let x=X0+((k*37)%90);x<X1;x+=90){const q1=P(x,GB,d),e=P(x,GB,d+11);c.moveTo(q1.x,q1.y);c.lineTo(e.x,e.y);}}
  c.stroke();
  // the rug down the middle of the room
  {const x0=200,x1=700,d0=58,d1=128;c.fillStyle='#5a1a2c';pl([P(x0,GB,d0),P(x1,GB,d0),P(x1,GB,d1),P(x0,GB,d1)]);
    c.strokeStyle='rgba(201,162,90,.55)';c.lineWidth=1.6;c.beginPath();for(const q of [P(x0+8,GB,d0+5),P(x1-8,GB,d0+5),P(x1-8,GB,d1-5),P(x0+8,GB,d1-5)])c.lineTo(q.x,q.y);c.closePath();c.stroke();
    c.strokeStyle='rgba(201,162,90,.22)';c.beginPath();for(let x=x0+30;x<x1-20;x+=40){const a=P(x,GB,d0+14),b=P(x+14,GB,(d0+d1)/2),q3=P(x,GB,d1-14),e=P(x-14,GB,(d0+d1)/2);c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineTo(q3.x,q3.y);c.lineTo(e.x,e.y);c.closePath();}c.stroke();}
  // the far edge of the floor, and the room growing darker as its lamps go out
  c.fillStyle='rgba(10,4,12,.5)';c.fillRect(X0,yB-2,X1-X0,3);
}
function drawRoom(L,T,VW,VH){
  const need=clamp(cv.width/cam.viewW*1.12,1,2.4),key=['kitchen','lobby','office'].includes(S.room)?S.room:'dining';let Ly=ROOM_LAYERS[key];
  // each room paints its still parts once into a layer, and draws what moves over it every frame
  const paint={dining:paintRoom,kitchen:paintKitchen,lobby:paintLobby,office:paintOffice}[key],live={dining:drawDiningDoor,kitchen:drawKitchenLive,lobby:drawLobbyLive,office:drawOfficeLive}[key];
  if(!Ly||need>Ly.sc*1.2||need<Ly.sc*.6){const cn=document.createElement('canvas'),sc=need;cn.width=Math.ceil(RC.w*sc);cn.height=Math.ceil(RC.h*sc);
    const c=cn.getContext('2d');c.setTransform(sc,0,0,sc,-RC.x0*sc,-RC.y0*sc);paint(c);ROOM_LAYERS={[key]:{cv:cn,sc}};Ly=ROOM_LAYERS[key];}
  ctx.drawImage(Ly.cv,RC.x0,RC.y0,RC.w,RC.h);
  live();
  const lf=litFrac();if(lf<1){ctx.fillStyle=`rgba(8,3,14,${((1-lf)*.38).toFixed(3)})`;ctx.fillRect(L-40,T-40,VW+80,VH+80);}
}
// soft light sprites, made once
let GLOW=null;
function glowSprites(){if(GLOW)return GLOW;const mk=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);return c;};
  GLOW={
    dot:mk(128,128,(g,w,h)=>{const r=g.createRadialGradient(w/2,h/2,1,w/2,h/2,w/2);r.addColorStop(0,'rgba(255,236,190,1)');r.addColorStop(.35,'rgba(255,200,130,.38)');r.addColorStop(1,'rgba(255,180,110,0)');g.fillStyle=r;g.fillRect(0,0,w,h);}),
    pool:mk(128,128,(g,w,h)=>{const r=g.createRadialGradient(w/2,h/2,2,w/2,h/2,w/2);r.addColorStop(0,'rgba(255,196,120,1)');r.addColorStop(1,'rgba(255,180,110,0)');g.fillStyle=r;g.fillRect(0,0,w,h);}),
    cone:mk(96,128,(g,w,h)=>{const r=g.createLinearGradient(0,0,0,h);r.addColorStop(0,'rgba(255,214,150,1)');r.addColorStop(1,'rgba(255,190,120,0)');g.fillStyle=r;g.beginPath();g.moveTo(w/2-9,0);g.lineTo(w/2+9,0);g.lineTo(w,h);g.lineTo(0,h);g.closePath();g.fill();})};
  return GLOW;}
// pools of lamplight on the floor, following each lamp as it swings
function drawLampPools(){
  if(!S.lamps.length)return;const G=glowSprites();ctx.save();ctx.globalCompositeOperation='lighter';
  for(const L of S.lamps){const k=lampGlow(L);if(k<=0)continue;const p=L.p,q=P(p.x,S.arena.ground(p.x,L.dep),L.dep);ctx.globalAlpha=.2*k;ctx.drawImage(G.pool,q.x-92,q.y-30,184,60);}
  ctx.restore();
  // where every lamp overhead is out, the floor lies in shadow
  ctx.save();for(const L of S.lamps){if(L.lit)continue;const p=L.p,q=P(L.x,S.arena.ground(L.x,L.dep),L.dep);
    if(S.lamps.some(o=>o.lit&&Math.abs(o.x-L.x)<95&&Math.abs(o.dep-L.dep)<62))continue;
    const g=ctx.createRadialGradient(q.x,q.y,4,q.x,q.y,92);g.addColorStop(0,'rgba(6,2,14,.42)');g.addColorStop(1,'rgba(6,2,14,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(q.x,q.y,96,32,0,0,TAU);ctx.fill();}
  ctx.restore();}
function lampGlow(L){if(L.lit)return L.flick>0?.55+.45*Math.sin(S.t*90+L.ph):1;const u=S.t-L.dead;return u<.35&&!L.fallen?Math.max(0,.6*Math.sin(u*70))*(1-u/.35):0;}
function drawSpills(){for(const p of S.spills){const q=P(p.x,S.arena.ground(p.x,p.d)+.5,p.d);ctx.fillStyle=p.c;ctx.beginPath();ctx.ellipse(q.x,q.y,p.r,p.r*.3,0,0,TAU);ctx.fill();}}
function drawShard(s){const q=P(s.x,s.y,s.d);ctx.save();ctx.translate(q.x,q.y);ctx.rotate(s.a);ctx.fillStyle=SHARD_COL[s.k]||'#ddd';
  if(s.k==='flour'){ctx.globalAlpha=.8;ctx.beginPath();ctx.arc(0,0,s.s*.6,0,TAU);ctx.fill();}
  else if(s.k==='paper'){ctx.globalAlpha=.9;ctx.fillRect(-s.s/2,-s.s*.35,s.s,s.s*.7);ctx.fillStyle='rgba(42,23,18,.5)';ctx.fillRect(-s.s/2,-.4,s.s,.8);}
  else if(s.k==='leaf'){ctx.beginPath();ctx.ellipse(0,0,s.s*.9,s.s*.32,0,0,TAU);ctx.fill();}
  else{ctx.beginPath();ctx.moveTo(-s.s*.5,s.s*.35);ctx.lineTo(s.s*.55,s.s*.1);ctx.lineTo(-s.s*.1,-s.s*.5);ctx.closePath();ctx.fill();
    if(s.k==='glass'&&s.rest&&Math.sin(S.t*3+s.ph*7)>.985){ctx.fillStyle='#ffffff';ctx.fillRect(-1,-1,2,2);}}
  ctx.restore();}
function drawRestingShards(){for(const s of S.shards)if(s.rest)drawShard(s);}

// ---------- dividers ----------
// drawn as thin depth slices so fighters on either side of them are covered by the right part of the panel
function divItems(items){
  for(const w of S.divs){const step=12;
    if(w.state!=='broken'){const g0=S.arena.ground(w.x,w.d0),yt=g0-w.h,top=prjY(yt,w.d1),bot=prjY(g0,w.d0),gr=ctx.createLinearGradient(0,top,0,bot);
      if(w.mat==='paper'){gr.addColorStop(0,'rgba(255,240,205,.35)');gr.addColorStop(1,'rgba(160,110,80,.12)');}
      else if(w.mat==='glass'){gr.addColorStop(0,'rgba(235,250,255,.22)');gr.addColorStop(1,'rgba(120,180,200,.08)');}
      else{gr.addColorStop(0,'rgba(255,220,200,.18)');gr.addColorStop(1,'rgba(40,10,30,.25)');}
      w._gr=gr;}
    for(let d=w.d0;d<w.d1-.1;d+=step){const e=Math.min(w.d1,d+step);items.push({d:(d+e)/2,dv:w,a:d,b:e,first:d===w.d0,last:e>=w.d1-.1});}}}
function divPt(w,x,y,d){const g=S.arena.ground(w.x,d),lean=w.wob*clamp((g-y)/w.h,0,1);return P(x+lean,y,d);}
function drawDivSlice(it){
  const w=it.dv,A=it.a,B=it.b,xl=divL(w),xr=divR(w),g=S.arena.ground(w.x,(A+B)/2),broken=w.state==='broken';
  if(broken){drawDivRemains(w,A,B,it.first,it.last);return;}
  const h=w.h,yt=g-h,M=w.mat;
  const face=(x,y0,y1,col)=>{ctx.fillStyle=col;poly([divPt(w,x,y0,A),divPt(w,x,y1,A),divPt(w,x,y1,B),divPt(w,x,y0,B)]);};
  if(M==='paper'){
    face(xr,g,yt,RM.paper);
    face(xr,g,yt,w._gr);
    ctx.strokeStyle=RM.frame;ctx.lineWidth=1.3;ctx.beginPath();
    for(let y=g-8;y>yt;y-=22){const a=divPt(w,xr,y,A),b=divPt(w,xr,y,B);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}
    for(let d=Math.ceil(w.d0/20)*20;d<=w.d1;d+=20){if(d<A||d>B)continue;const a=divPt(w,xr,g,d),b=divPt(w,xr,yt,d);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}
    ctx.stroke();
    ctx.lineWidth=4;ctx.beginPath();{let a=divPt(w,xr,yt+2,A),b=divPt(w,xr,yt+2,B);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);a=divPt(w,xr,g-3,A);b=divPt(w,xr,g-3,B);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();
    if(it.first||it.last){const d=it.first?A:B;ctx.fillStyle=RM.frame;poly([divPt(w,xl,g,d),divPt(w,xl,yt,d),divPt(w,xr,yt,d),divPt(w,xr,g,d)]);}
  }else if(M==='glass'){
    const base=g-50;face(xr,g,base,'#2a1426');
    ctx.fillStyle=RM.brass;poly([divPt(w,xr,base,A),divPt(w,xr,base+2,A),divPt(w,xr,base+2,B),divPt(w,xr,base,B)]);
    face(xr,base,yt,'rgba(150,206,222,.34)');
    face(xr,base,yt,w._gr);
    ctx.strokeStyle=RM.brass;ctx.lineWidth=1.6;ctx.beginPath();for(let d=Math.ceil(w.d0/32)*32;d<=w.d1;d+=32){if(d<A||d>B)continue;const a=divPt(w,xr,base,d),b=divPt(w,xr,yt,d);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();
    ctx.strokeStyle='rgba(235,250,255,.35)';ctx.lineWidth=1;ctx.beginPath();
    for(let k=0;k<4;k++){const d0=w.d0+(w.d1-w.d0)*(.15+k*.22),y0=base-14-k*8;if(d0<A-14||d0>B+14)continue;const a=divPt(w,xr,y0,d0),b=divPt(w,xr,y0-48,d0+10);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();
    ctx.strokeStyle=RM.brass;ctx.lineWidth=2.2;ctx.beginPath();{const a=divPt(w,xr,yt,A),b=divPt(w,xr,yt,B);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();
    if(it.first||it.last){const d=it.first?A:B;ctx.fillStyle='#1d0e1a';poly([divPt(w,xl,g,d),divPt(w,xl,base,d),divPt(w,xr,base,d),divPt(w,xr,g,d)]);
      ctx.fillStyle=RM.brass;poly([divPt(w,xl,base,d),divPt(w,xl,yt,d),divPt(w,xl+2,yt,d),divPt(w,xl+2,base,d)]);}
  }else if(M==='plaster'){
    face(xr,g,yt,'#a67a78');
    face(xr,g,yt,w._gr);
    face(xr,g,g-12,RM.wood);face(xr,yt+8,yt,RM.wood);
    ctx.fillStyle=RM.wood2;poly([divPt(w,xl,yt,A),divPt(w,xr,yt,A),divPt(w,xr,yt,B),divPt(w,xl,yt,B)]);
    const md=(w.d0+w.d1)/2;if(md>=A&&md<B){const fy=g-h*.62;ctx.fillStyle='#8a6a32';poly([divPt(w,xr,fy,md-12),divPt(w,xr,fy-30,md-12),divPt(w,xr,fy-30,md+12),divPt(w,xr,fy,md+12)]);
      ctx.fillStyle='#2a3a5a';poly([divPt(w,xr,fy-3,md-9),divPt(w,xr,fy-27,md-9),divPt(w,xr,fy-27,md+9),divPt(w,xr,fy-3,md+9)]);}
    if(it.first||it.last){const d=it.first?A:B;ctx.fillStyle='#7a5254';poly([divPt(w,xl,g,d),divPt(w,xl,yt,d),divPt(w,xr,yt,d),divPt(w,xr,g,d)]);}
  }else if(M==='shelf'){
    for(const hy of [8,46,86,126]){const y=g-hy;ctx.fillStyle='#4f5a62';poly([divPt(w,xl,y,A),divPt(w,xr,y,A),divPt(w,xr,y,B),divPt(w,xl,y,B)]);
      ctx.fillStyle='#8a979f';poly([divPt(w,xr,y,A),divPt(w,xr,y+2.4,A),divPt(w,xr,y+2.4,B),divPt(w,xr,y,B)]);
      if(hy>120)continue;const md=(A+B)/2,s=mulberry32((w.seed*31+Math.round(md)*7+hy)|0),k=s(),q=divPt(w,(xl+xr)/2,y,md);
      if(k<.55){ctx.fillStyle='#efe4d6';const n=4+Math.floor(s()*4);for(let i=0;i<n;i++){ctx.beginPath();ctx.ellipse(q.x,q.y-2-i*2.1,6.5,1.8,0,0,TAU);ctx.fill();}ctx.fillStyle='rgba(120,100,80,.35)';ctx.fillRect(q.x-6.5,q.y-2,13,1);}
      else if(k<.82){ctx.fillStyle='#e6d8c4';ctx.beginPath();ctx.moveTo(q.x-6,q.y-7);ctx.quadraticCurveTo(q.x,q.y+1,q.x+6,q.y-7);ctx.closePath();ctx.fill();}
      else{ctx.fillStyle='rgba(205,235,245,.45)';ctx.fillRect(q.x-3,q.y-10,6,10);ctx.fillStyle='rgba(214,150,50,.8)';ctx.fillRect(q.x-2.5,q.y-6,5,5.5);}}
    if(it.first||it.last){const d=it.first?A:B;ctx.fillStyle='#38424a';poly([divPt(w,xl,g,d),divPt(w,xl,yt,d),divPt(w,xl+3,yt,d),divPt(w,xl+3,g,d)]);poly([divPt(w,xr-3,g,d),divPt(w,xr-3,yt,d),divPt(w,xr,yt,d),divPt(w,xr,g,d)]);}
  }else if(M==='slats'){
    face(xr,g,yt,'rgba(16,10,8,.6)');
    ctx.strokeStyle='#9a7a56';ctx.lineWidth=4.2;ctx.beginPath();for(let d=Math.ceil(w.d0/8)*8;d<=w.d1;d+=8){if(d<A||d>B)continue;const a=divPt(w,xr,g-2,d),b=divPt(w,xr,yt+2,d);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();
    face(xr,g-26,g-34,'#5e4128');face(xr,yt+30,yt+22,'#5e4128');
    ctx.strokeStyle='rgba(255,220,180,.3)';ctx.lineWidth=1;ctx.beginPath();for(const y of [g-34,yt+22]){const a=divPt(w,xr,y,A),b=divPt(w,xr,y,B);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();
    if(it.first||it.last){const d=it.first?A:B,pl=xl-3,pr=xr+3;ctx.fillStyle='#4a3424';poly([divPt(w,pl,g,d),divPt(w,pl,yt-6,d),divPt(w,pr,yt-6,d),divPt(w,pr,g,d)]);}
  }else{
    face(xr,g,yt,'#4a3440');
    ctx.strokeStyle='rgba(8,3,8,.6)';ctx.lineWidth=1.3;ctx.beginPath();
    for(let d=Math.ceil(w.d0/9)*9;d<=w.d1;d+=9){if(d<A||d>B)continue;const a=divPt(w,xr,g,d),b=divPt(w,xr,yt+((d*7)%5),d);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();
    ctx.strokeStyle='rgba(255,206,160,.1)';ctx.lineWidth=2;ctx.beginPath();
    for(let d=Math.ceil(w.d0/9)*9+4;d<=w.d1;d+=18){if(d<A||d>B)continue;const a=divPt(w,xr,g-6,d),b=divPt(w,xr,yt+8,d);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();
    face(xr,g-24,g-32,'#2a1d26');face(xr,yt+26,yt+18,'#2a1d26');
    ctx.strokeStyle='rgba(255,196,140,.32)';ctx.lineWidth=1;ctx.beginPath();for(const y of [g-32,yt+18]){const a=divPt(w,xr,y,A),b=divPt(w,xr,y,B);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();
    ctx.strokeStyle='rgba(255,190,140,.45)';ctx.lineWidth=1.2;ctx.beginPath();{const a=divPt(w,xr,yt,A),b=divPt(w,xr,yt,B);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();
    if(it.first||it.last){const d=it.first?A:B,pl=xl-3,pr=xr+3;ctx.fillStyle='#2a1d26';poly([divPt(w,pl,g,d),divPt(w,pl,yt-8,d),divPt(w,pr,yt-8,d),divPt(w,pr,g,d)]);
      ctx.fillStyle='#5a4250';poly([divPt(w,pl-1,yt-8,d),divPt(w,pl+1,yt-12,d),divPt(w,pr-1,yt-12,d),divPt(w,pr+1,yt-8,d)]);}
  }
  for(const m of w.marks){if(m.d<A||m.d>=B)continue;drawDivMark(w,m);}
}
function drawDivMark(w,m){
  const xr=divR(w),c=divPt(w,xr,m.y,m.d),r=mulberry32(m.s),k=m.k||1;ctx.save();ctx.lineCap='round';
  if(w.mat==='paper'){ctx.fillStyle='rgba(30,14,16,.85)';ctx.beginPath();for(let i=0;i<9;i++){const a=i/9*TAU,rr=(6+r()*7)*k;const q={x:c.x+Math.cos(a)*rr*.35,y:c.y+Math.sin(a)*rr};i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);}ctx.closePath();ctx.fill();}
  else if(w.mat==='glass'){ctx.strokeStyle='rgba(240,252,255,.85)';ctx.lineWidth=.9;ctx.beginPath();
    for(let i=0;i<7+k*3;i++){const a=r()*TAU,l=(12+r()*20)*k;ctx.moveTo(c.x,c.y);const mx=c.x+Math.cos(a)*l*.2,my=c.y+Math.sin(a)*l*.5;ctx.lineTo(mx,my);ctx.lineTo(c.x+Math.cos(a+.2)*l*.35,c.y+Math.sin(a+.2)*l);}ctx.stroke();
    ctx.beginPath();ctx.ellipse(c.x,c.y,3*k,8*k,0,0,TAU);ctx.stroke();}
  else{ctx.strokeStyle=w.mat==='plaster'?'rgba(40,14,22,.8)':'rgba(10,4,8,.9)';ctx.lineWidth=1.3;ctx.beginPath();
    for(let i=0;i<4+k*2;i++){let x=c.x,y=c.y;ctx.moveTo(x,y);const a=r()*TAU;for(let j=0;j<3;j++){x+=Math.cos(a+(r()-.5))*4;y+=Math.sin(a+(r()-.5))*9;ctx.lineTo(x,y);}}ctx.stroke();
    if(w.mat==='plaster'){ctx.fillStyle='rgba(60,24,34,.5)';ctx.beginPath();ctx.ellipse(c.x,c.y,2.4*k,6*k,0,0,TAU);ctx.fill();}}
  ctx.restore();}
function drawDivRemains(w,A,B,first,last){
  const R=w.rem||{h:8,teeth:[]},xl=divL(w),xr=divR(w),g=S.arena.ground(w.x,(A+B)/2),col=w.mat==='glass'?'#2a1426':w.mat==='plaster'?'#8a6466':w.mat==='paper'?RM.frame:'#3b2a33';
  const span=w.d1-w.d0,yAt=d=>{let y=R.h;for(const t of R.teeth){const u=(d-w.d0)/span;if(Math.abs(u-t[0])<.06)y=Math.max(y,t[1]*(1-Math.abs(u-t[0])/.06));}return g-y;};
  ctx.fillStyle=col;const pts=[divPt(w,xr,g,A)];for(let d=A;d<=B+.01;d+=3)pts.push(divPt(w,xr,yAt(Math.min(d,B)),Math.min(d,B)));pts.push(divPt(w,xr,g,B));poly(pts);
  if(R.glass){ctx.fillStyle='rgba(170,220,232,.3)';for(const t of R.teeth){const d=w.d0+t[0]*span;if(d<A||d>=B)continue;poly([divPt(w,xr,g-50,d-4),divPt(w,xr,g-t[1],d),divPt(w,xr,g-50,d+5)]);}}
  if(first||last){const d=first?A:B;ctx.fillStyle=col;poly([divPt(w,xl,g,d),divPt(w,xl,yAt(d),d),divPt(w,xr,yAt(d),d),divPt(w,xr,g,d)]);}
}

// ---------- furniture ----------
const at=(q,d)=>P(q.x,q.y,d);
function segP(a,b,d,w,col){seg(at(a,d),at(b,d),w,col);}
function drawProp(Pp){
  const p=Pp.pts,d=Pp.dep,dz=Pp.dz;ctx.lineCap='round';ctx.lineJoin='round';
  if(Pp.type==='chair'){const bk=d+dz*.7,fr=d-dz*.7,dk='#1a0c14',c=RM.wood;
    segP(p[0],p[3],bk,3,dk);segP(p[1],p[4],bk,3,dk);segP(p[0],p[2],bk,3,dk);
    ctx.fillStyle='#3a1e2a';poly([at(p[0],bk),at(p[1],bk),at(p[1],fr),at(p[0],fr)]);
    segP(p[0],p[3],fr,3.2,c);segP(p[1],p[4],fr,3.2,c);
    const t=p[2],s0=p[0];segP(s0,t,fr,3.4,c);
    for(const u of [.35,.6,.85]){const a={x:lerp(s0.x,t.x,u),y:lerp(s0.y,t.y,u)};seg(at(a,fr),at(a,bk),1.6,c);}
    segP(p[0],p[1],fr,3.6,c);segP(t,{x:t.x+(t.x-s0.x)*.02,y:t.y},fr,4,c);}
  else if(Pp.type==='stool'){const dk='#1a0c14';segP(p[0],p[2],d+5,2.6,dk);segP(p[1],p[3],d+5,2.6,dk);segP(p[0],p[2],d-5,2.8,RM.wood);segP(p[1],p[3],d-5,2.8,RM.wood);
    const m0={x:lerp(p[0].x,p[2].x,.62),y:lerp(p[0].y,p[2].y,.62)},m1={x:lerp(p[1].x,p[3].x,.62),y:lerp(p[1].y,p[3].y,.62)};segP(m0,m1,d-5,1.6,RM.brass);
    ctx.fillStyle='#6a2a34';poly([at(p[0],d+8),at(p[1],d+8),at(p[1],d-8),at(p[0],d-8)]);segP(p[0],p[1],d-8,4,'#4a1c26');}
  else if(Pp.type==='bistro'){const top=p[0],tr=p[1],mx=(top.x+tr.x)/2,my=(top.y+tr.y)/2,ux=(tr.x-top.x)/2,uy=(tr.y-top.y)/2;
    segP(p[2],p[3],d,4,'#160a12');segP(p[4],p[5],d,4.2,'#1d0f18');
    ctx.fillStyle=RM.marbleS;ctx.beginPath();for(let i=0;i<=24;i++){const a=i/24*TAU,q=P(mx+ux*Math.cos(a),my+uy*Math.cos(a)+3,d+dz*Math.sin(a));i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);}ctx.fill();
    ctx.fillStyle=RM.marble;ctx.beginPath();for(let i=0;i<=24;i++){const a=i/24*TAU,q=P(mx+ux*Math.cos(a),my+uy*Math.cos(a),d+dz*Math.sin(a));i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);}ctx.fill();
    ctx.strokeStyle='rgba(120,90,90,.45)';ctx.lineWidth=.8;ctx.beginPath();{const a=P(mx-ux*.5,my-uy*.5,d+2),b=P(mx+ux*.2,my+uy*.2,d-4);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();}
  else if(Pp.type==='plant'){const pt=p[4],c={x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2},ang=Math.atan2(pt.y-c.y,pt.x-c.x);
    ctx.fillStyle='#8a4630';poly([at(p[0],d),at(p[1],d),at(p[3],d),at(p[2],d)]);ctx.fillStyle='#a8583c';poly([at(p[0],d),at(p[1],d),at({x:p[1].x,y:p[1].y+5},d),at({x:p[0].x,y:p[0].y+5},d)]);
    ctx.strokeStyle='#2f5a3a';ctx.lineWidth=2.2;
    for(let i=0;i<7;i++){const a=ang+(i-3)*.42+Math.sin(S.t*1.3+i+Pp.dep)*.03,l=34+(i%3)*10,q=at(c,d),e={x:q.x+Math.cos(a)*l,y:q.y+Math.sin(a)*l},m={x:q.x+Math.cos(a)*l*.5+Math.cos(a+1.4)*6,y:q.y+Math.sin(a)*l*.5-8};
      ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.quadraticCurveTo(m.x,m.y,e.x,e.y);ctx.stroke();}
    ctx.fillStyle='#3f6b45';for(let i=0;i<7;i++){const a=ang+(i-3)*.42,l=26+(i%3)*8,q=at(c,d);ctx.beginPath();ctx.ellipse(q.x+Math.cos(a)*l,q.y+Math.sin(a)*l,6,2.2,a,0,TAU);ctx.fill();}}
  else if(Pp.type==='cart'){for(const dd of [d+8,d-8])for(const [i,j] of [[0,2],[1,3]])segP(p[i],p[j],dd,2.4,dd>d?'#7a5a2a':RM.brass);
    ctx.fillStyle='#4a3424';poly([at(p[0],d+9),at(p[1],d+9),at(p[1],d-9),at(p[0],d-9)]);poly([at(p[2],d+9),at(p[3],d+9),at(p[3],d-9),at(p[2],d-9)]);
    ctx.fillStyle='#120a10';for(const i of [2,3]){const q=at({x:p[i].x,y:p[i].y+1},d-8);circ(q,4.6);}}
  else if(Pp.type==='rack'){segP(p[1],p[2],d,3,RM.wood);segP(p[3],p[0],d,3.2,RM.wood);
    const t=p[0],ux=(t.x-p[3].x)/150,uy=(t.y-p[3].y)/150;ctx.fillStyle='#2a1d3a';const c0=at({x:t.x+ux*-14,y:t.y+uy*-14},d);
    ctx.beginPath();ctx.moveTo(c0.x-2,c0.y);ctx.lineTo(c0.x+9,c0.y+6);ctx.lineTo(c0.x+12,c0.y+58);ctx.lineTo(c0.x-4,c0.y+60);ctx.closePath();ctx.fill();
    ctx.fillStyle='#120a14';const hq=at({x:t.x,y:t.y-2},d);ctx.beginPath();ctx.ellipse(hq.x,hq.y,9,3,Math.atan2(uy,ux)+Math.PI/2,0,TAU);ctx.fill();ctx.fillRect(hq.x-5,hq.y-8,10,7);}
  else if(Pp.type==='easel'){segP(p[0],p[2],d+4,2.4,'#1a0c14');
    const a=p[0],b=p[1],ux=(b.x-a.x),uy=(b.y-a.y),L=Math.hypot(ux,uy)||1,nx=-uy/L,ny=ux/L,s=Pp.s;
    const q=(u,v)=>at({x:a.x+ux*u+nx*v*s,y:a.y+uy*u+ny*v*s},d);ctx.fillStyle='#5a3a28';poly([q(.06,-2),q(.7,-2),q(.7,24),q(.06,24)]);ctx.fillStyle='#20222a';poly([q(.09,1),q(.67,1),q(.67,21),q(.09,21)]);
    ctx.strokeStyle='rgba(240,240,230,.6)';ctx.lineWidth=.9;ctx.beginPath();for(const u of [.18,.3,.42,.54]){const e=q(u,5),f=q(u+.04,17);ctx.moveTo(e.x,e.y);ctx.lineTo(f.x,f.y);}ctx.stroke();
    segP(p[0],p[1],d-4,2.6,'#5a3a28');}
  else if(PROP_DRAW[Pp.type])PROP_DRAW[Pp.type](Pp);
}
function drawWare(it){
  const q=P(it.x,it.y,it.dep);ctx.save();ctx.translate(q.x,q.y);ctx.rotate(it.ang);
  // a tankard or bottle taken off the field table keeps the table's silhouette
  if(it.sil){ctx.fillStyle=TABLE_COL;if(it.kind==='mug'){ctx.fillRect(-3.5,-4.5,7,9);ctx.strokeStyle=TABLE_COL;ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(4,0,2.6,-Math.PI/2,Math.PI/2);ctx.stroke();}
    else{ctx.beginPath();ctx.moveTo(-3,4);ctx.lineTo(-3,-1);ctx.lineTo(-1.2,-3.5);ctx.lineTo(-1.2,-8);ctx.lineTo(1.2,-8);ctx.lineTo(1.2,-3.5);ctx.lineTo(3,-1);ctx.lineTo(3,4);ctx.closePath();ctx.fill();}
    ctx.restore();return;}
  if(it.kind==='plate'){ctx.fillStyle='#efe4d6';ctx.beginPath();ctx.ellipse(0,1,7,2.2,0,0,TAU);ctx.fill();ctx.fillStyle='#c9b8a4';ctx.beginPath();ctx.ellipse(0,.6,4,1,0,0,TAU);ctx.fill();
    if(Math.sin(it.x)>0){ctx.fillStyle='#8a3a2a';ctx.beginPath();ctx.ellipse(1,-.6,3,1.6,0,0,TAU);ctx.fill();}}
  else if(it.kind==='bowl'){ctx.fillStyle='#efe4d6';ctx.beginPath();ctx.moveTo(-6,-2);ctx.quadraticCurveTo(0,7,6,-2);ctx.closePath();ctx.fill();}
  else if(it.kind==='glass'){ctx.strokeStyle='rgba(225,245,250,.8)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-3,4);ctx.lineTo(3,4);ctx.moveTo(0,4);ctx.lineTo(0,0);ctx.stroke();
    ctx.fillStyle='rgba(205,235,245,.35)';ctx.beginPath();ctx.moveTo(-3,-7);ctx.lineTo(3,-7);ctx.quadraticCurveTo(3.4,0,0,0);ctx.quadraticCurveTo(-3.4,0,-3,-7);ctx.fill();
    ctx.fillStyle='rgba(140,20,45,.85)';ctx.beginPath();ctx.moveTo(-2.6,-3.5);ctx.lineTo(2.6,-3.5);ctx.quadraticCurveTo(2.8,0,0,0);ctx.quadraticCurveTo(-2.8,0,-2.6,-3.5);ctx.fill();}
  else if(it.kind==='bottle'){ctx.fillStyle='#16341f';ctx.beginPath();ctx.moveTo(-3,4);ctx.lineTo(-3,-4);ctx.lineTo(-1.2,-7);ctx.lineTo(-1.2,-12);ctx.lineTo(1.2,-12);ctx.lineTo(1.2,-7);ctx.lineTo(3,-4);ctx.lineTo(3,4);ctx.closePath();ctx.fill();
    ctx.fillStyle='#e8d6b0';ctx.fillRect(-3,-2,6,3.4);ctx.fillStyle='rgba(170,230,200,.4)';ctx.fillRect(1.6,-6,.9,9);}
  else if(it.kind==='candle'){ctx.fillStyle=RM.brass;ctx.fillRect(-3,2,6,2);ctx.fillStyle='#f2e6c8';ctx.fillRect(-1.6,-7,3.2,9);
    if(it.lit){ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(0,-10,0,0,-10,12);g.addColorStop(0,'rgba(255,214,140,.7)');g.addColorStop(1,'rgba(255,170,90,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,-10,12,0,TAU);ctx.fill();
      ctx.fillStyle='#fff3cf';ctx.beginPath();ctx.ellipse(0,-10+Math.sin(S.t*13+it.x)*.4,1.3,2.6,0,0,TAU);ctx.fill();}}
  else if(it.kind==='vase'){ctx.fillStyle='#3a5a8a';ctx.beginPath();ctx.moveTo(-3,5);ctx.quadraticCurveTo(-7,0,-2,-5);ctx.lineTo(2,-5);ctx.quadraticCurveTo(7,0,3,5);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#2f5a3a';ctx.lineWidth=1.2;ctx.beginPath();for(const a of [-.5,0,.45]){ctx.moveTo(0,-5);ctx.lineTo(Math.sin(a)*9,-14);}ctx.stroke();
    for(const [x,y,c] of [[-4.5,-13,'#ff7eb6'],[0,-15,'#ffd36b'],[4,-13,'#ff6b5b']]){ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,2.2,0,TAU);ctx.fill();}}
  else if(it.kind==='pot'){ctx.fillStyle='#8a5530';ctx.fillRect(-6.5,-3,13,8.5);ctx.fillStyle='#c9874a';ctx.fillRect(-6.5,-3,13,2.4);ctx.fillRect(-9.5,-1.5,3,1.6);ctx.fillRect(6.5,-1.5,3,1.6);
    ctx.fillStyle='#3a2414';ctx.fillRect(-5.8,-4.6,11.6,1.8);ctx.fillRect(-1.5,-6.4,3,2);}
  else if(it.kind==='mug'){ctx.fillStyle='#8a6a3a';ctx.fillRect(-3.5,-4.5,7,9);ctx.strokeStyle='#8a6a3a';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(4,0,2.6,-Math.PI/2,Math.PI/2);ctx.stroke();
    ctx.fillStyle='rgba(255,235,190,.35)';ctx.fillRect(-2.6,-4.5,1.2,9);}
  else if(it.kind==='jar'){ctx.fillStyle='rgba(205,235,245,.38)';ctx.fillRect(-3.6,-6,7.2,10);ctx.fillStyle='rgba(214,150,50,.85)';ctx.fillRect(-3,-2,6,5.6);ctx.fillStyle='#5a3a28';ctx.fillRect(-4,-7.6,8,2.2);}
  ctx.restore();}
function drawLamp(L){
  const p=L.p,a=P(L.x,L.ay,L.dep),q=P(p.x,p.y,L.dep),k=lampGlow(L);
  if(!L.fallen){ctx.strokeStyle='#120812';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(q.x,q.y);ctx.stroke();}
  const ang=L.fallen?(L.landed?1.2:S.t*6):Math.atan2(p.x-L.x,L.ay-p.y)*-1;
  ctx.save();ctx.translate(q.x,q.y);ctx.rotate(L.fallen?ang:-Math.atan2(p.x-L.x,p.y-L.ay));
  if(k>0){const G=glowSprites();ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.16*k;ctx.drawImage(G.cone,-44,4,88,116);ctx.globalAlpha=.85*k;ctx.drawImage(G.dot,-30,-26,60,60);ctx.restore();}
  ctx.fillStyle=L.lit?'#fff3cf':'#3a2a2a';ctx.beginPath();ctx.arc(0,4,3.2,0,TAU);ctx.fill();
  if(L.kind==='hood'){ctx.fillStyle='#2f4a3f';ctx.beginPath();ctx.moveTo(-L.r-3,4);ctx.lineTo(-3.5,-L.r*.8);ctx.lineTo(3.5,-L.r*.8);ctx.lineTo(L.r+3,4);ctx.closePath();ctx.fill();
    ctx.fillStyle='#dfe8de';ctx.fillRect(-L.r-3,3,2*L.r+6,1.6);ctx.fillStyle='#24382f';ctx.fillRect(-1.5,-L.r*.8-5,3,5);}
  else{ctx.fillStyle='#8a6a32';ctx.beginPath();ctx.moveTo(-L.r,4);ctx.quadraticCurveTo(-L.r*.8,-L.r*.9,0,-L.r*.9);ctx.quadraticCurveTo(L.r*.8,-L.r*.9,L.r,4);ctx.closePath();ctx.fill();
  ctx.fillStyle=RM.brass;ctx.fillRect(-L.r,3,L.r*2,1.6);ctx.fillRect(-1.5,-L.r*.9-4,3,4);}
  ctx.restore();}
function drawDebrisPiece(sg,d,col){
  if(sg.fronds){const a=P(sg.a.x,sg.a.y,d),b=P(sg.b.x,sg.b.y,d),ang=Math.atan2(b.y-a.y,b.x-a.x);ctx.strokeStyle='#2f5a3a';ctx.lineWidth=2;
    for(let i=0;i<5;i++){const t=ang+(i-2)*.5;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(a.x+Math.cos(t)*26,a.y+Math.sin(t)*26);ctx.stroke();}return;}
  ctx.lineCap='round';seg(P(sg.a.x,sg.a.y,d),P(sg.b.x,sg.b.y,d),sg.w,col);
  if(sg.loot&&!sg.taken){ctx.globalAlpha=.35;seg(P(sg.a.x,sg.a.y-1,d),P(sg.b.x,sg.b.y-1,d),1,'#ffcf9a');ctx.globalAlpha=1;}
}
// everything from the environment that stands on the floor, added to the far-to-near draw list
function envItems(items){
  divItems(items);
  for(const Pp of S.props)if(!Pp.broken)items.push({d:Pp.dep,prop:Pp});
  for(const it of S.wares)if(!it.gone)items.push({d:it.dep-.01,ware:it});
  for(const L of S.lamps)items.push({d:L.dep-.02,lamp:L});
  for(const s of S.shards)if(!s.rest)items.push({d:s.d,shard:s});
}
function drawEnvItem(it){
  if(it.dv)drawDivSlice(it);else if(it.prop)drawProp(it.prop);else if(it.ware)drawWare(it.ware);else if(it.lamp)drawLamp(it.lamp);else if(it.shard)drawShard(it.shard);else return false;
  return true;}
function drawEnvShadows(){
  ctx.fillStyle='rgba(4,2,10,.26)';
  for(const Pp of S.props){if(Pp.broken)continue;const b=Pp.box,g=S.arena.ground(b.cx,Pp.dep),q=P(b.cx,g,Pp.dep);ctx.beginPath();ctx.ellipse(q.x,q.y+1,(b.r-b.l)/2+4,4,0,0,TAU);ctx.fill();}
  for(const w of S.divs){if(!divSolid(w))continue;const g=S.arena.ground(w.x,w.d0);ctx.fillStyle='rgba(4,2,10,.3)';poly([P(divL(w)-2,g,w.d0),P(divR(w)+7,g,w.d0),P(divR(w)+7,g,w.d1),P(divL(w)-2,g,w.d1)]);}
}

// ---------- words ----------
function hazardText(hz,info){if(!hz)return null;
  if(hz.kind==='div')return(hz.through||(info&&info.through)?'Through ':'Into ')+divThe(hz.w);
  if(hz.kind==='prop'){const T=hz.p.type;return(T==='bistro'||T==='cart'?'Through the ':'Onto the ')+PROP[T].name;}
  return null;}
function tripText(tr){return tr.what==='curb'?'tripped over the curb':tr.what==='prop'?'tripped over a '+PROP[tr.p.type].name:'tripped over '+tr.o.name;}

// ---------- the damage bill on the stage ----------
let billPulse=0;
function updateBill(){const el=document.getElementById('bill');if(!el)return;const show=S.bill.total>0||S.arena.indoor;el.hidden=!show;if(!show)return;
  const v=S.bill.total.toLocaleString('en-US');const t=cssW<520?`Damages ${v}`:`Damages · ${v} crowns`;if(el.textContent!==t)el.textContent=t;el.title=`${v} crowns of damage so far`;}
function bumpBill(){const el=document.getElementById('bill');if(!el)return;el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump');}
