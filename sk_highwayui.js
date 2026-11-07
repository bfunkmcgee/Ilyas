// ===== THE TOWER ROAD ON THE PAGE (since V101) =====
// What the Tower Road (sk_highway.js) needs drawn besides the place itself (envx/env_highway.js): the ramp's bikes at their distance
// and heading, the truck (TruckLook, envx/veh_truck.js), the drums in the air and on the road and the one in the thrower's hands, and
// the door gun in the helicopter. Nothing here writes what the game reads (the drawfree suite).

// ---------- the ramp's bikes, at their distance and the way they head ----------
// A bike on the ramp is drawn about the point where it meets the road, smaller for its distance (B.vk), and turned the way it heads
// (B.vyaw, the game's: the looks' turn, 0 its profile heading west, -π/2 its front to the camera; since V102, asked for: before, a
// bike coming at the camera was its profile drawn narrower). Its rider is turned with it by his own look (f._yaw), his hands out on
// the grips, his knees round the tank and his feet on the pegs; the bike is drawn in the round, its parts set out across it and drawn
// far to near, those behind the rider before him (at the bike's place in the draw list) and those in front of him after (with him,
// in his sprite). Within HWY_TURN[0] of a profile it is the side drawing, narrowed by the turn; out to HWY_TURN[1] the side drawing
// fades into the round one.
const HWY_TURN=[.7,.95];
function hwyApply(px,py,X){ctx.translate(px,py);ctx.scale(X.k*X.sx,X.k);ctx.translate(-px,-py);}
function hwyTurn(B){if(!B||B.kind!=='bike'||S.arenaKey!=='highway')return null;const y=B.vyaw||0,k=B.vk??1;if(Math.abs(y)<.003&&Math.abs(k-1)<.003)return null;
  const ph=Math.min(Math.abs(y),Math.abs(Math.PI-Math.abs(y)));return{yaw:y,k,c:Math.cos(y),s:Math.sin(y),side:1-sstep((ph-HWY_TURN[0])/(HWY_TURN[1]-HWY_TURN[0]))};}
// Each kind's parts in the bike's own frame (x forward and y up, as VehLook's; l across it, + its near side at yaw 0): the tyres
// (radius and half width, rear and front), the rims' radius, how far out the fork legs stand, the tank's and the seat's half widths,
// the bars from the clamp out to the grip's end (the last stretch the grip), the mirrors' stalks, the engine's case, barrel and head
// (x, y, half length, half height, half width), the exhaust's header and silencer (from, to, radius at each), the mudguards' arcs
const HWY_BK={
  street:{R:[26.1,26.1],W:[5.6,4.8],rim:16.3,hub:3.9,fork:7.6,tank:[18.5,75.5,24,11.4,11.5],seat:[-26,66.2,22,4.4,9.6],tail:[-56.5,66,11.5,6.2,7.2],panel:[-20,52,14.5,10.2,10.4],
    lamp:{x0:50,x1:58.8,xl:59.9,y:79,r:7.6,rl:6.7},bars:[[45,88.6,4],[43.8,90.6,6],[40,90.8,14],[37,89.8,19],[35.4,88,21.5],[28.4,86,27.5]],mirror:[[40.4,90.8,17],[38.8,100,21],[38.4,101.4,22]],
    case:[6.4,26.8,22,14.8,12.4],cyl:[19.6,51,10.4,10.4,10],head:[23,63.4,12.2,4.6,11.2],
    header:[[31,58.6,4.5],[36,49,6],[36.6,32,7.6],[31.4,17,8.8],[16,10.6,9.8],[-6,10.4,10.4],[-20.6,13.6,11]],muffler:[[-20.6,13.6,11.2],[-73,27.4,11.8],3.4,5.8],
    fender:[[64,25,28.5,.62,2.2],[-60,25,28.6,1.12,2.92]]},
  elven:{R:[25.6,25.4],W:[4.6,3.8],rim:17.4,hub:4.2,fork:6.6,tank:[17.6,75.4,24,11.6,10.6],seat:[-24,66,21,4,9],tail:[-55,67.5,12,7.5,7],panel:[-20,52,14,9.6,9.8],
    lamp:{x0:49.4,x1:58.4,xl:59.4,y:79,r:7.7,rl:6.6},bars:[[45,83.6,5],[45,83.6,6.6],[40.6,84.4,11],[36.4,85,13.6],[29.6,84.6,19.4]],mirror:null,
    case:[6.8,27.1,20.2,13.5,11.4],cyl:[19.4,49.8,9.5,9.8,9.2],head:[22.8,62.2,11.4,4.6,10.6],
    header:[[30.4,56,4.4],[35,48,5.8],[35.4,32,7.2],[30,17.4,8.4],[16,10,9.4],[-6,9.2,10],[-23,12.4,10.6]],muffler:[[-23,12.4,10.8],[-76,35.6,11.4],2.7,5.2],
    fender:[[64,25,28.5,.32,2.62],[-60,25,28.2,.95,2.45]]}};
// the colours: a street bike's paint (red or black), chrome and a yellow lamp; Kael's black lacquer, gold and the cyan lamp
function hwyPal(B){const V=typeof VehLook!=='undefined'?VehLook:null,K=V&&V.K,st=B.style==='street';
  if(st){const Pn=(V&&V.PAINT||{})[B.paint==='black'?'black':'red']||{d:'#2a0807',p:'#5e1714',l:'#8c2b24',hi:'#b9473a'};
    return{st,paint:Pn,metal:'#9aa0aa',metalHi:'#e8ecf2',metalD:'#3a3d45',frame:'#17171b',tyre:'#0c0c0e',inner:'#141417',rim:'#aeb4be',hub:'#7c828e',
      seat:'#1c1a19',seatHi:'#3e3a37',bar:'#2a2c32',barHi:'#c6ccd6',grip:'#0a0a0c',bucket:'#8d939e',bezel:'#d8dde4',
      lens0:'#fffaf0',lens1:'#ffe9b0',lens2:'#c99a3a',lensOff:'#2a2418',beam0:'#fff1c4',beam1:'#ffd27a',beamK:.8,case:'#25272e',caseHi:'#6a707c',pipe:'#8d939e',pipeHi:'#f2f5f8',tip:'#5d636e'};}
  const k=K||{lac:'#0b0a0e',lac1:'#141319',lac2:'#1d1c24',lacHi:'#4a4858',gold:'#e2b65a',goldL:'#ffe2a3',goldD:'#8a6a2e',cyan:'#7ff3e3',cyanL:'#d9fffa',leather:'#5a2c16',leatherL:'#8e4c26',tyre:'#08080a',frame:'#111015'};
  return{st,paint:{d:k.lac,p:k.lac1,l:k.lac2,hi:k.lacHi},metal:k.gold,metalHi:k.goldL,metalD:k.goldD,frame:k.frame,tyre:k.tyre,inner:'#0e0d12',rim:k.gold,hub:k.goldD,
    seat:k.leather,seatHi:k.leatherL,bar:'#141319',barHi:k.goldD,grip:'#1a0f09',bucket:'#121117',bezel:k.gold,
    lens0:'#ffffff',lens1:k.cyanL,lens2:k.cyan,lensOff:'#0e2422',beam0:k.cyanL,beam1:k.cyan,beamK:1,case:'#121117',caseHi:'#3a3846',pipe:'#16151b',pipeHi:k.goldD,tip:k.gold};}
// the bike's frame as the turn sees it: a point of it (x forward, y up, l across) where it is drawn in the world, and how far toward
// the viewer it lies; turned about the rider's middle, as his look turns him, so he sits where he sits (a wheelie's pitch about the
// rear tyre first, as VehLook's)
function hwyBikeV(B,f,T){const fa=B.fa<0?-1:1,px=f&&f.p?(f.p[PEL].x+f.p[CHE].x)/2:B.x-fa*3,VW=FigKit.view(px,fa,T.yaw),pt=B.pitch||0,pc=Math.cos(pt),ps=Math.sin(pt);
  const q=(X,Y)=>{const x=pt?-60+(X+60)*pc-Y*ps:X,y=pt?(X+60)*ps+Y*pc:Y;return{x:B.x+fa*x,y:B.gy-y};};
  return{fa,c:VW.c,s:VW.s,at:(X,Y,l)=>VW.at(q(X,Y),l),dep:(X,Y,l)=>VW.dep(q(X,Y),l)};}
// toward the light, on the screen: his own (the lamps on the far parapet, the ramp's), else from above
function hwyLd(B,f){let x=.35,y=-1;if(f&&typeof kaelLight==='function'){const L=kaelLight(f);if(L&&L.dir){x=L.dir.x;y=L.dir.y;}else if(L&&L.light){x=L.light.x-B.x;y=L.light.y-(B.gy-60);}}
  const l=Math.hypot(x,y)||1;return{x:x/l,y:y/l};}
// a shape filled, an edge of light left on its side toward the light: the light's colour under it, the shape over that set back from
// the light (VehLook's rimFill without its clip, a clip a part being dear on a phone: the shape's dark side stands out by w)
function hwyFill(c,P,fill,ld,w,a){c.fillStyle=`rgba(255,207,134,${a})`;c.fill(P);c.translate(-ld.x*w,-ld.y*w);c.fillStyle=fill;c.fill(P);c.translate(ld.x*w,ld.y*w);}
// a tyre: its two sides and the tread between them (rounded, seen head on: a street tyre's knobs across it), and on the side toward the
// viewer the rim, the dark inside of the wheel and the hub
function hwyTyre(c,V,X,Y,R,W,pal,ld){const ac=Math.abs(V.c),A=V.at(X,Y,-W),Bq=V.at(X,Y,W),rx=Math.max(.5,R*ac),x0=Math.min(A.x,Bq.x),x1=Math.max(A.x,Bq.x),cy=(A.y+Bq.y)/2;
  const P=new Path2D();P.ellipse(A.x,A.y,rx,R,0,0,TAU);P.ellipse(Bq.x,Bq.y,rx,R,0,0,TAU);
  if(x1-x0>.05){const rr=Math.min((x1-x0)/2,R)*(1-ac);if(P.roundRect)P.roundRect(x0,cy-R,x1-x0,2*R,rr);else P.rect(x0,cy-R,x1-x0,2*R);}
  hwyFill(c,P,pal.tyre,ld,1.2,.3);
  if(pal.st&&x1-x0>2.4&&ac<.85){c.strokeStyle=`rgba(52,52,60,${(.85*(1-ac)).toFixed(3)})`;c.lineWidth=1.5;c.beginPath();
    for(let y=-R+3;y<R-2;y+=4.4){c.moveTo(x0+(x1-x0)*.2,cy+y);c.lineTo(x1-(x1-x0)*.2,cy+y);}c.stroke();}
  if(ac<.1)return;const F=V.at(X,Y,V.c>=0?W:-W),r=pal.rimR;
  c.fillStyle=pal.inner;c.beginPath();c.ellipse(F.x,F.y,(r-1)*ac,r-1,0,0,TAU);c.fill();
  c.strokeStyle=pal.rim;c.lineWidth=2.2;c.beginPath();c.ellipse(F.x,F.y,r*ac,r,0,0,TAU);c.stroke();
  // (the spokes a blur at the road's pace: a street wheel's wires, the turbine's vanes on Kael's)
  const lf=V.c>=0?W:-W;c.strokeStyle=pal.st?'rgba(164,170,180,.24)':'rgba(138,106,46,.5)';c.lineWidth=pal.st?1.5:1.6;c.beginPath();
  for(let i=0;i<(pal.st?14:7);i++){const a=i/(pal.st?14:7)*TAU,h=V.at(X+Math.cos(a)*pal.hubR,Y+Math.sin(a)*pal.hubR,lf),e=V.at(X+Math.cos(a+(pal.st?.5:.9))*(r-1.4),Y+Math.sin(a+(pal.st?.5:.9))*(r-1.4),lf);c.moveTo(h.x,h.y);c.lineTo(e.x,e.y);}c.stroke();
  c.fillStyle=pal.hub;c.beginPath();c.ellipse(F.x,F.y,Math.max(.4,pal.hubR*ac),pal.hubR,0,0,TAU);c.fill();}
// a tube along points of the bike (fork, frame, bars, pipes), its lit side picked out
function hwyTube(c,V,pts,w,col,hi,ld){const Q=pts.map(q=>V.at(q[0],q[1],q[2]));c.strokeStyle=col;c.lineWidth=w;c.beginPath();Q.forEach((q,i)=>i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y));c.stroke();
  if(!hi)return;const ox=ld.x*w*.28,oy=ld.y*w*.28;c.strokeStyle=hi;c.lineWidth=Math.max(1.5,w*.3);c.beginPath();Q.forEach((q,i)=>i?c.lineTo(q.x+ox,q.y+oy):c.moveTo(q.x+ox,q.y+oy));c.stroke();}
// a tube that thickens from a to b (the silencer)
function hwyCone(c,V,a,b,wa,wb,fill,ld){const A=V.at(a[0],a[1],a[2]),Bq=V.at(b[0],b[1],b[2]),dx=Bq.x-A.x,dy=Bq.y-A.y,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,P=new Path2D();
  P.moveTo(A.x+nx*wa,A.y+ny*wa);P.lineTo(Bq.x+nx*wb,Bq.y+ny*wb);P.lineTo(Bq.x-nx*wb,Bq.y-ny*wb);P.lineTo(A.x-nx*wa,A.y-ny*wa);P.closePath();
  c.fillStyle=fill;c.beginPath();c.arc(A.x,A.y,wa,0,TAU);c.fill();c.beginPath();c.arc(Bq.x,Bq.y,wb,0,TAU);c.fill();hwyFill(c,P,fill,ld,.9,.35);}
// a rounded mass (tank, seat, tail, the side panels): seen round from any side
function hwyBlob(c,V,b,fill,ld,ra){const C=V.at(b[0],b[1],0),rx=Math.max(.5,Math.hypot(b[2]*V.c,b[4]*V.s)),P=new Path2D();P.ellipse(C.x,C.y,rx,b[3],0,0,TAU);
  hwyFill(c,P,typeof fill==='function'?fill(C,rx,b[3]):fill,ld,Math.min(1.5,.6+rx*.05),ra??.42);return{C,rx};}
// a block of the engine, its corners rounded
function hwyBox(c,V,b,fill,ld){const C=V.at(b[0],b[1],0),hw=Math.max(.5,Math.hypot(b[2]*V.c,b[4]*V.s)),P=new Path2D();
  if(P.roundRect)P.roundRect(C.x-hw,C.y-b[3],2*hw,2*b[3],Math.min(hw,b[3])*.35);else P.rect(C.x-hw,C.y-b[3],2*hw,2*b[3]);hwyFill(c,P,fill,ld,.9,.3);return{C,hw};}
// a mudguard over a tyre, as wide as the tyre and a little more
function hwyGuard(c,V,g,W,col,ld){const [cx,cy,r,a0,a1]=g,Q=[];for(let i=0;i<=10;i++){const a=a0+(a1-a0)*i/10;Q.push(V.at(cx+Math.cos(a)*r,cy+Math.sin(a)*r,0));}
  const w=Math.max(1.8,2*(W+1.6)*Math.abs(V.s)+1.8*Math.abs(V.c));c.lineCap='butt';c.strokeStyle=col;c.lineWidth=w;c.beginPath();Q.forEach((q,i)=>i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y));c.stroke();
  c.strokeStyle='rgba(255,207,134,.3)';c.lineWidth=1.5;const o=w*.42;c.beginPath();Q.forEach((q,i)=>i?c.lineTo(q.x+ld.x*o,q.y+ld.y*o):c.moveTo(q.x+ld.x*o,q.y+ld.y*o));c.stroke();c.lineCap='round';}
// the headlamp: its shell along the bike, the bezel and the lens on its front (lit, or dark)
function hwyLamp(c,V,G,pal,ld,lit){const L=G.lamp,as=Math.abs(V.s),A=V.at(L.x0,L.y,0),Bq=V.at(L.x1,L.y,0),rx=Math.max(.4,L.r*as),x0=Math.min(A.x,Bq.x),x1=Math.max(A.x,Bq.x),P=new Path2D();
  P.ellipse(A.x,A.y,rx,L.r,0,0,TAU);if(x1-x0>.05)P.rect(x0,A.y-L.r,x1-x0,2*L.r);P.ellipse(Bq.x,Bq.y,rx,L.r,0,0,TAU);hwyFill(c,P,pal.bucket,ld,1,.45);
  if(V.s>-.05)return;const F=V.at(L.xl,L.y,0);c.fillStyle=pal.bezel;c.beginPath();c.ellipse(F.x,F.y,Math.max(.4,(L.r+.3)*as),L.r+.3,0,0,TAU);c.fill();
  if(lit){const g=c.createRadialGradient(F.x,F.y,0,F.x,F.y,L.rl);g.addColorStop(0,pal.lens0);g.addColorStop(.55,pal.lens1);g.addColorStop(1,pal.lens2);c.fillStyle=g;}else c.fillStyle=pal.lensOff;
  c.beginPath();c.ellipse(F.x,F.y,Math.max(.3,L.rl*as),L.rl,0,0,TAU);c.fill();}
// The bike's parts, each at how far toward the viewer it lies; layer 'far': those behind the rider (and the rear wheel, the engine, its
// pipes, the seat and the tail, which he is never behind), drawn before him; 'near': the rest, after him. (He lies at
// his middle, a little further forward as the bike turns from the camera: seen square on the tank is in front of him, from three
// quarters his near knee is in front of it.)
function hwyBikeParts(B,f,T,layer){const st=B.style==='street',G=st?HWY_BK.street:HWY_BK.elven,pal=hwyPal(B),V=hwyBikeV(B,f,T),ld=hwyLd(B,f),c=ctx,ac=Math.abs(V.c);
  pal.rimR=G.rim;pal.hubR=G.hub;const lit=(B.light||0)>.05&&!B.wreck;
  const P=[],add=(d,fn,far)=>P.push({d,fn,far:!!far}),dz=(X,Y,l)=>V.dep(X,Y,l),dR=5+30*ac;
  const paintG=(C,rx,h)=>{const g=c.createLinearGradient(0,C.y-h,0,C.y+h);g.addColorStop(0,pal.paint.l);g.addColorStop(.35,pal.paint.p);g.addColorStop(1,pal.paint.d);return g;};
  // the rear wheel, its mudguard, the swinging arm's two sides, the pegs
  add(dz(-60,25,0),()=>hwyTyre(c,V,-60,25,G.R[0],G.W[0],pal,ld),1);
  add(dz(-60,48,0)+.5,()=>hwyGuard(c,V,G.fender[1],G.W[0],st?'#141416':pal.paint.p,ld),1);
  for(const sd of [1,-1]){add(dz(-36,28,7.4*sd),()=>hwyTube(c,V,[[-12,30,7.4*sd],[-60,25,7.4*sd]],4,pal.frame,null,ld),1);
    add(dz(-22,28,15*sd),()=>hwyTube(c,V,[[-22,28,12*sd],[-22,28,18*sd]],2.6,'#1a1b1f',null,ld),1);}
  // the tail, the seat, the side panels; the engine's case, barrel and head, the frame's down tube and the exhaust's header (from
  // three quarters behind him, his near leg in front of them; seen square on, in front of his shins and the coat that hangs between
  // them)
  const eng=ac>.45;
  add(dz(-56,66,0),()=>hwyBlob(c,V,G.tail,pal.paint.p,ld),1);
  add(dz(-26,66,0),()=>hwyBlob(c,V,G.seat,pal.seat,ld,.3),1);
  add(dz(-20,52,0),()=>hwyBlob(c,V,G.panel,pal.paint.d,ld,.3),1);
  add(dz(6,27,0),()=>{const E=hwyBox(c,V,G.case,pal.case,ld);c.strokeStyle=pal.caseHi;c.lineWidth=1.5;c.globalAlpha=.5;c.beginPath();c.ellipse(E.C.x,E.C.y,Math.max(.4,E.hw*.62),G.case[3]*.55,0,0,TAU);c.stroke();c.globalAlpha=1;},eng);
  add(dz(19,51,0),()=>{const E=hwyBox(c,V,G.cyl,pal.case,ld);c.strokeStyle=pal.caseHi;c.lineWidth=1.5;c.globalAlpha=.55;c.beginPath();
    for(let y=-G.cyl[3]+2.5;y<G.cyl[3];y+=3.4){c.moveTo(E.C.x-E.hw+.6,E.C.y+y);c.lineTo(E.C.x+E.hw-.6,E.C.y+y);}c.stroke();c.globalAlpha=1;},eng);
  add(dz(23,63,0),()=>hwyBox(c,V,G.head,pal.case,ld),eng);
  add(dz(32,40,0)-1,()=>hwyTube(c,V,[[42.2,72,0],[37.6,54,0],[32,32,0],[26.4,17,0]],3.6,pal.frame,null,ld),eng);
  add(dz(30,30,8),()=>hwyTube(c,V,G.header,st?3:2.8,pal.pipe,pal.pipeHi,ld),eng);
  add(dz(-46,20,11.5),()=>{const M=G.muffler;hwyCone(c,V,M[0],M[1],M[2],M[3],pal.pipe,ld);if(!st){const e=M[1],q=V.at(e[0],e[1],e[2]);c.fillStyle=pal.tip;c.beginPath();c.arc(q.x,q.y,M[3]*.8,0,TAU);c.fill();}},1);
  // the front wheel and its mudguard: in front of his legs as the bike comes at the camera
  add(dz(64,25,0),()=>hwyTyre(c,V,64,25,G.R[1],G.W[1],pal,ld));
  add(dz(64,50,0)+.5,()=>hwyGuard(c,V,G.fender[0],G.W[1],st?'#18191d':pal.paint.p,ld));
  // the tank
  add(dz(G.tank[0],G.tank[1],0),()=>{const E=hwyBlob(c,V,G.tank,paintG,ld);c.fillStyle=`rgba(255,240,220,${st?.16:.12})`;c.beginPath();c.ellipse(E.C.x+ld.x*E.rx*.3,E.C.y-G.tank[3]*.45,Math.max(.4,E.rx*.4),G.tank[3]*.22,0,0,TAU);c.fill();
    if(!st){c.strokeStyle=pal.metal;c.lineWidth=1.5;c.globalAlpha=.75;c.beginPath();c.ellipse(E.C.x,E.C.y,Math.max(.4,E.rx*.82),G.tank[3]*.7,0,Math.PI*1.1,Math.PI*1.9);c.stroke();c.globalAlpha=1;}});
  // the fork's legs: the slider, the stanchion (chrome, or gold), the top; the clamps across them; from three quarters the far one,
  // behind the front tyre, is drawn before him
  const ux=-.311,uy=.95,fk=(t,l)=>[64+ux*t,25+uy*t,l];
  for(const sd of [1,-1]){const l=G.fork*sd,d=dz(54,55,l);
    add(d,()=>{hwyTube(c,V,[fk(-1,l),fk(22,l)],6.6,'#16151b',null,ld);hwyTube(c,V,[fk(21,l),fk(52,l)],4.4,pal.metal,pal.metalHi,ld);if(st)hwyTube(c,V,[fk(21,l),fk(34,l)],5.8,'#141416',null,ld);hwyTube(c,V,[fk(52,l),fk(63,l)],5,'#141319',null,ld);},ac>.3&&l*V.c<0);}
  add(dz(46,80,0),()=>hwyTube(c,V,[fk(52,-G.fork-2),fk(52,G.fork+2)],3.2,'#121216',null,ld));
  add(dz(45,86,0),()=>hwyTube(c,V,[fk(62.6,-G.fork-2),fk(62.6,G.fork+2)],3,'#121216','rgba(200,204,212,.35)',ld));
  // the headlamp
  add(dz(56,79,0),()=>hwyLamp(c,V,G,pal,ld,lit));
  // the bars out to the grips, and the mirrors on their stalks
  for(const sd of [1,-1]){const Bp=G.bars.map(q=>[q[0],q[1],q[2]*sd]),n=Bp.length;
    add(dz(36,88,16*sd),()=>{hwyTube(c,V,Bp.slice(0,n-1),2.4,pal.bar,pal.barHi,ld);hwyTube(c,V,Bp.slice(n-2),3.8,pal.grip,null,ld);
      const e=V.at(Bp[n-1][0],Bp[n-1][1],Bp[n-1][2]);c.fillStyle=pal.metal;c.beginPath();c.arc(e.x,e.y,1.3,0,TAU);c.fill();});
    if(G.mirror){const M=G.mirror.map(q=>[q[0],q[1],q[2]*sd]);add(dz(39,95,19*sd),()=>{hwyTube(c,V,M.slice(0,2),1.5,pal.metal,null,ld);const h=V.at(M[2][0],M[2][1],M[2][2]);
      c.fillStyle='#111214';c.beginPath();c.ellipse(h.x,h.y,Math.max(.9,3.2*Math.abs(V.s)),1.9,0,0,TAU);c.fill();c.strokeStyle=pal.metal;c.lineWidth=1.5;c.stroke();});}}
  const want=P.filter(p=>layer==='far'?(p.far||p.d<dR):!(p.far||p.d<dR)).sort((a,b)=>a.d-b.d);
  c.save();c.lineCap='round';c.lineJoin='round';try{for(const p of want)p.fn();if(layer==='near'&&lit)hwyFlare(c,V,G,B,T);}finally{c.restore();}}
// the lamp coming at the camera: a flare on it, the more squarely it faces the camera the brighter, with the lens's streak across it
function hwyFlare(c,V,G,B,T){if(S.classicLook)return;const a=clamp(-V.s*1.3-.3,0,1)*(1-T.side)*clamp(B.light||0,0,1);if(a<.04)return;
  const F=V.at(G.lamp.xl,G.lamp.y,0),x=F.x,y=F.y,r=30+46*a;
  c.save();c.globalCompositeOperation='lighter';const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(255,248,232,${(.9*a).toFixed(3)})`);
  g.addColorStop(.16,`rgba(255,228,176,${(.42*a).toFixed(3)})`);g.addColorStop(1,'rgba(255,200,140,0)');c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r);
  const s=c.createLinearGradient(x-r*1.3,0,x+r*1.3,0);s.addColorStop(0,'rgba(255,236,206,0)');s.addColorStop(.5,`rgba(255,236,206,${(.3*a).toFixed(3)})`);s.addColorStop(1,'rgba(255,236,206,0)');
  c.fillStyle=s;c.fillRect(x-r*1.3,y-.7,r*2.6,1.4);c.restore();}
// the rider turned with his bike (his look's own lateral spreads, each as a share of where it would be: his hands to the grips, his
// elbows between them and his shoulders, a little out; his knees round the tank and his feet on the pegs); what it was, to put back
function hwyRiderTurn(f,B,T,y=T.yaw){const G=B.style==='street'?HWY_BK.street:HWY_BK.elven,b=f.body,sz=b.h*(.93+.07*b.bulk),kael=lookOn(f),
    wf=kael?1:(.7+.3*b.bulk)*(typeof isElf==='function'&&isElf(f)?.96:1.04),LS=12*sz*wf,LH=5.6*sz*wf,p=f.p,fa=f.facing,pxs=(p[PEL].x+p[CHE].x)/2,
    T0=Math.hypot(p[CHE].x-p[PEL].x,p[CHE].y-p[PEL].y)||40,fwd=q=>clamp((q.x-pxs)*fa/(.55*T0),0,1),grip=G.bars[G.bars.length-1][2]-3,
    hand=LS*(1-.5*fwd(p[HAF])),elb=LS*(1-.15*fwd(p[ELF]));
  const keep=[f._yaw,f._headYaw,f._latArm,f._latElbow,f._latKnee,f._latFoot,f._apart];
  f._yaw=y;f._headYaw=y;f._latArm=grip/Math.max(1,hand);f._latElbow=(.6*grip+.55*LS)/Math.max(1,elb);f._latKnee=(G.tank[4]+3.5)/LH;f._latFoot=(G.tank[4]+4.6)/LH;f._apart=true;
  return keep;}
function hwyRiderBack(f,k){[f._yaw,f._headYaw,f._latArm,f._latElbow,f._latKnee,f._latFoot,f._apart]=k;}
// the side drawing at a share a of itself, as the round one comes in under it (laid straight down at that share: its own overlaps show
// for the moment it takes, where a picture of its own cost a millisecond a bike on a phone)
function hwyCardFaded(dv,B,X,a){const px=prjX(B.x,B.dep),py=prjY(B.gy,B.dep);ctx.save();ctx.globalAlpha=a;hwyApply(px,py,X);try{dv(B);}finally{ctx.restore();}}
// the bike's shadow under it and its lamp's light on the road, laid along the way it heads (as VehLook.headBeam's, turned)
function hwyShadowT(B,T){const fa=B.fa<0?-1:1,th=T.yaw+Math.PI/2,hx=fa*Math.sin(th),hd=-Math.cos(th),an=Math.atan2(hd,hx);void an;
  ctx.save();ctx.transform(1,0,PSX,-PSY,0,B.gy);
  ctx.save();ctx.translate(B.x+hx*2,B.dep+hd*2);ctx.rotate(an);ctx.fillStyle='rgba(3,2,8,.38)';ctx.beginPath();ctx.ellipse(0,0,74,6.7,0,0,TAU);ctx.fill();ctx.restore();
  const lie=clamp(B.lie||0,0,1),lk=clamp(B.light??0,0,1)*(B.wreck?0:1)*(1-lie)*(1-lie),E=typeof EnvLook!=='undefined'&&EnvLook.softSpill?EnvLook:null;
  if(lk>.05&&E&&!S.classicLook){const pal=hwyPal(B),st=pal.st,len=(B.pitch>.2?120:st?260:330)-62,sp=st?36:44,x0=B.x+hx*62,d0=B.dep+hd*62,ang=Math.atan2(-hx,hd);
    ctx.restore();ctx.save();
    E.softSpill(ctx,x0,d0,8,sp*1.7,len,pal.beam1,.2*lk*pal.beamK,B.gy,ang);E.softSpill(ctx,x0,d0,6,sp*.9,len*.5,pal.beam0,.12*lk*pal.beamK,B.gy,ang);
    const mx=x0+hx*len*.45,md=d0+hd*len*.45;ctx.translate(mx+md*PSX,B.gy-md*PSY);ctx.scale(1,.26);ctx.globalCompositeOperation='lighter';
    const g=ctx.createRadialGradient(0,0,0,0,0,120);const a=(.16*lk*pal.beamK).toFixed(3);g.addColorStop(0,pal.beam1+Math.round(+a*255).toString(16).padStart(2,'0'));g.addColorStop(1,pal.beam1+'00');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,120,0,TAU);ctx.fill();}
  ctx.restore();}
// (near a profile, and in the old look, the rider is his profile narrowed with the side drawing, as V101's: turned there, the pack at
// the ramp's foot stood wider round Ilyas and hid him, a third of what showed of him lost against them, and drew 2.6 ms dearer on a
// phone. Out through the fade he turns by the share the round bike has come in, the rest of his turn a narrowing, so he comes out of
// his profile without a jump; coming round from the profile heading east he turns at once, as he is in the air off the garage then)
const hwySx=c=>Math.abs(c)<.07?(c<0?-.07:.07):c;
{const dfi=drawFighterItem;drawFighterItem=function(f,tr){const B=f.mount,T=B&&!B.hide&&!f.hidden&&hwyTurn(B);if(!T)return dfi(f,tr);
  if(T.side>=1||S.classicLook){ctx.save();hwyApply(B.x,B.gy,{k:T.k,sx:hwySx(T.c)});try{return dfi(f,tr);}finally{ctx.restore();}}
  const fold=T.side>0&&T.c>0,y=fold?T.yaw*(1-T.side):T.yaw;
  ctx.save();hwyApply(B.x,B.gy,{k:T.k,sx:1});const keep=hwyRiderTurn(f,B,T,y);
  try{if(fold){ctx.save();hwyApply(B.x,B.gy,{k:1,sx:T.c/Math.cos(y)});try{dfi(f,tr);}finally{ctx.restore();}}else dfi(f,tr);
    if(T.side>0)ctx.globalAlpha=1-T.side;hwyBikeParts(B,f,T,'near');}finally{hwyRiderBack(f,keep);ctx.restore();}};}
{const dv=drawVehicle;drawVehicle=function(B){if(B.hide)return;if(B.kind==='truck'){hwyTruck(B);return;}const T=hwyTurn(B);if(!T){dv(B);return;}
  const px=prjX(B.x,B.dep),py=prjY(B.gy,B.dep),round=T.side<1&&!S.classicLook,X={k:T.k,sx:round?T.c:hwySx(T.c)};
  if(round){ctx.save();hwyApply(px,py,{k:T.k,sx:1});ctx.translate(B.dep*PSX,-B.dep*PSY);try{hwyBikeParts(B,B.rider,T,'far');}finally{ctx.restore();}}
  if(!round){ctx.save();hwyApply(px,py,X);try{dv(B);}finally{ctx.restore();}}else if(T.side>0)hwyCardFaded(dv,B,X,T.side);};}
{const ds=drawVehShadow;drawVehShadow=function(B){if(B.hide)return;
  if(B.kind==='truck'){if(typeof TruckLook!=='undefined'&&!S.classicLook){ctx.save();TruckLook.shadow(ctx,B);ctx.restore();}return;}
  const T=hwyTurn(B);if(!T){ds(B);return;}if((B.air||0)>2)return;const px=prjX(B.x,B.dep),py=prjY(B.gy,B.dep),round=T.side<1&&!S.classicLook;
  ctx.save();hwyApply(px,py,{k:T.k,sx:round?1:hwySx(T.c)});try{if(round)hwyShadowT(B,T);else ds(B);}finally{ctx.restore();}};}

// ---------- the truck ----------
function hwyTruck(T){if(typeof TruckLook!=='undefined'&&!S.classicLook){const L=kaelLight({p:[{x:T.x-200,y:T.gy-90}],dep:T.dep,facing:T.fa,station:T.x-200});
    ctx.save();TruckLook.draw(ctx,T,{light:L.light,dir:L.dir,now:S.t,noShadow:true});ctx.restore();return;}
  // a plain truck for when its painter is not there: the cab, the bed, the wheels
  const d=T.dep,pt=(x,y)=>P(T.x+T.fa*x,T.gy-y,d);ctx.save();ctx.fillStyle=T.wreck?'#120e0c':'#1c2a24';
  const q=[pt(0,40),pt(266,40),pt(266,70),pt(0,70)];ctx.beginPath();q.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill();
  const c=[pt(272,40),pt(428,40),pt(428,120),pt(372,132),pt(360,186),pt(272,186)];ctx.beginPath();c.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill();
  ctx.strokeStyle='#e2b65a';ctx.lineWidth=1.5;ctx.stroke();for(const ax of [64,118,356]){const w=pt(ax,25);ctx.fillStyle='#07070a';ctx.beginPath();ctx.arc(w.x,w.y,25,0,TAU);ctx.fill();}ctx.restore();}

// ---------- the drums ----------
// a fuel drum seen side on at a point of the world and turned through ang: its body in oxide red shaded round, the two rolling hoops,
// the yellow band, its lit edge and its ends
function hwyDrumDraw(x,y,dep,ang){const q=P(x,y,dep),r=DRUM.r,h=DRUM.h;ctx.save();ctx.translate(q.x,q.y);ctx.rotate(ang);
  const g=ctx.createLinearGradient(0,-r,0,r);g.addColorStop(0,'#3a1008');g.addColorStop(.28,'#a8442a');g.addColorStop(.55,'#6e2216');g.addColorStop(1,'#1e0805');
  ctx.fillStyle=g;ctx.fillRect(-h/2,-r,h,r*2);
  ctx.fillStyle='rgba(0,0,0,.45)';for(const k of [-.2,.2])ctx.fillRect(h*k-.8,-r,1.6,r*2);
  ctx.fillStyle='rgba(200,150,44,.8)';ctx.fillRect(-2.3,-r,4.6,r*2);
  ctx.fillStyle='#1a0604';ctx.fillRect(-h/2-1.2,-r,2.4,r*2);ctx.fillRect(h/2-1.2,-r,2.4,r*2);
  ctx.fillStyle='rgba(255,217,168,.28)';ctx.fillRect(-h/2+2,-r*.55,h-4,1.2);
  ctx.strokeStyle='#070302';ctx.lineWidth=1.5;ctx.strokeRect(-h/2,-r,h,r*2);ctx.restore();}
{const ei=envItems;envItems=function(items){ei(items);if(S.arenaKey!=='highway')return;
  for(const o of S.drums||[])items.push({d:o.dep-.02,hwyDrum:o});
  for(const f of S.F)if(f.hold==='drum'&&!f.dead&&!f.hidden)items.push({d:f.dep-1,hwyHeld:f});
  for(const H of S.veh)if(H.kind==='heli'&&H.gunAng!=null&&(H.door||0)>.3)items.push({d:H.dep-HWY_GUN.dep,hwyGun:H});
  // the garage's parapet: in front of the riders still on its top deck, behind those in the air
  const X=envKey()==='highway'&&EnvLook.S.highway;if(X&&X.frontOn&&X.frontOn())items.push({d:GARAGE.dep-.4,hwyGarage:X});};}
{const de=drawEnvItem;drawEnvItem=function(it){if(it.hwyDrum){const o=it.hwyDrum;hwyDrumDraw(o.x,o.y,o.dep,o.ang);return true;}
  if(it.hwyHeld){const f=it.hwyHeld,a=f.p[HAF],b=f.p[HAB];hwyDrumDraw((a.x+b.x)/2,(a.y+b.y)/2-6,f.dep,Math.atan2(b.y-a.y,b.x-a.x));return true;}
  if(it.hwyGun){hwyDoorGun(it.hwyGun);return true;}if(it.hwyGarage){it.hwyGarage.front(ctx);return true;}return de(it);};}

// ---------- the door gun ----------
// A machine gun on a pintle in the helicopter's door: the post up from the sill, the cradle, the receiver with its feed and the belt
// out of the can hung on its side, the barrel in its cooling jacket and the flash hider; it turns on its pivot as the game lays it
// (H.gunAng: its heading in the picture) and kicks back at each round
function hwyDoorGun(H){const G0=hwyGun(H),d=G0.dep,pv=P(G0.piv.x,G0.piv.y,d),D=heliDoor(H),sill=P(D.x,D.y,d),a=H.gunAng,kick=(H.recoil||0)*4;
  ctx.save();
  // the pintle: up from the sill to the cradle
  ctx.strokeStyle='#0c0d11';ctx.lineWidth=3.4;ctx.beginPath();ctx.moveTo(sill.x+6,sill.y);ctx.lineTo(pv.x,pv.y+4);ctx.stroke();ctx.strokeStyle='rgba(200,204,212,.25)';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(sill.x+7,sill.y);ctx.lineTo(pv.x+1,pv.y+4);ctx.stroke();
  ctx.translate(pv.x,pv.y);ctx.rotate(a);ctx.translate(-kick,0);
  const dk='#0b0c10',md='#1d2029',hi='#4a5060';
  // the spade grips back toward him, the receiver, the sights
  ctx.strokeStyle=dk;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-22,0);ctx.lineTo(-34,0);ctx.moveTo(-31,-6);ctx.lineTo(-33,6);ctx.stroke();
  let g=ctx.createLinearGradient(0,-7,0,7);g.addColorStop(0,hi);g.addColorStop(.45,md);g.addColorStop(1,dk);ctx.fillStyle=g;ctx.fillRect(-24,-7,40,13);
  ctx.fillStyle='#030304';for(let x=-20;x<12;x+=4)ctx.fillRect(x,-2.5,2,5);ctx.fillStyle=dk;ctx.fillRect(-2,-11,2.4,4);
  // the can of belted rounds on its side, the belt running up into the feed, its brass
  ctx.fillStyle='#16180f';ctx.fillRect(-14,6,18,14);ctx.fillStyle='rgba(200,208,184,.2)';ctx.fillRect(-14,6,18,.8);
  ctx.fillStyle='#8a6a2e';for(let k=0;k<5;k++)ctx.fillRect(-12+k*3.4,4,1.8,3.4);
  // the barrel in its perforated jacket, the flash hider
  g=ctx.createLinearGradient(0,-4,0,4);g.addColorStop(0,dk);g.addColorStop(.4,hi);g.addColorStop(1,md);ctx.fillStyle=g;ctx.fillRect(16,-4,34,8);
  ctx.fillStyle='#030304';for(let x=19;x<48;x+=5)ctx.fillRect(x,-1.6,2.6,3.2);
  ctx.fillStyle=md;ctx.fillRect(50,-2.2,30,4.4);ctx.fillStyle=dk;ctx.fillRect(78,-3.6,12,7.2);ctx.fillStyle='#000';ctx.fillRect(84,-1.6,1.4,3.2);
  // the edge of the cabin's light along its top
  ctx.fillStyle='rgba(255,201,138,.35)';ctx.fillRect(-24,-7,40,.8);ctx.fillRect(16,-4,34,.7);
  ctx.restore();}
// ===== THE TOWER ROAD ON THE PAGE END =====
