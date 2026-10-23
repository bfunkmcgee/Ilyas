// ===== VEH BIKE =====
// Kael's motorcycle and his rifle, in the Noir Gilt look. The bike is an elven cafe racer: black lacquer over a black frame, the gold
// vine let into the tank and the tail, gold-rimmed turbine wheels, a cognac seat stitched in gold, a long upswept exhaust with a gold
// tip, a round headlamp in a gold bezel that throws cyan elven light, and in the engine a small light-core behind glass with runes
// round it. A saddle scabbard in dark leather rides along the near side of the tail, the rifle's stock standing out of it.
// The rifle is elven work on a soldier's pattern: black receiver engraved with the vine, a long barrel and a ported brake, a scope
// with a cyan lens, a cell of cyan crystal where a magazine would be.
// The bike is drawn in its own frame, x forward along fa and y up from the ground, rotated about the rear tyre's contact point by
// pitch for a wheelie, and set into the game's floor at (x, ground, depth) like everything else.
// B.style 'street' draws the human gangs' bike instead (red or black paint by B.paint, steel for gold, a yellow lamp, no scabbard)
// on the same frame. B.lie 0..1 lays a bike down on its side, flattening it toward the ground with scrapes along it.
const VehLook=(()=>{
const TAU=Math.PI*2,lerp=(a,b,t)=>a+(b-a)*t,clamp=(v,a,b)=>v<a?a:v>b?b:v;
const rgba=(hex,a)=>{const n=parseInt(hex.slice(1),16);return`rgba(${n>>16&255},${n>>8&255},${n&255},${a})`;};
const mix=(a,b,t)=>{const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16),f=s=>Math.round(lerp(A>>s&255,B>>s&255,t));return'#'+((1<<24)|(f(16)<<16)|(f(8)<<8)|f(0)).toString(16).slice(1);};
const PX=()=>typeof PSX==='number'?PSX:.2,PY=()=>typeof PSY==='number'?PSY:.75;
const DIM={rearAxle:[-60,25],frontAxle:[64,25],R:25,seat:[-18,68],peg:[-22,28],grip:[32,86],lamp:[57,79],pivot:[-60,0]};
const SQ=.76;   // how far a bike lying on its side flattens toward the ground (lie 1)
const K={lac:'#0b0a0e',lac1:'#141319',lac2:'#1d1c24',lacHi:'#4a4858',gold:'#e2b65a',goldL:'#ffe2a3',goldD:'#8a6a2e',goldDD:'#4a3818',
  cyan:'#7ff3e3',cyanL:'#d9fffa',cyanD:'#2a8a80',leather:'#5a2c16',leatherL:'#8e4c26',leatherD:'#2a1309',scab:'#2e1a0f',scabL:'#5e3519',scabD:'#170c06',
  tyre:'#08080a',steel:'#25272e',steelL:'#8e95a3',rim:'#ffcf86',red:'#ff3a26',frame:'#111015'};

// ---------- paths, built once in the bike's own frame ----------
// a closed (or open) Catmull-Rom curve through [x, y] points
function cr(P,pts,closed=true){const n=pts.length,g=i=>pts[closed?(i+n)%n:clamp(i,0,n-1)];P.moveTo(g(0)[0],g(0)[1]);
  for(let i=0;i<(closed?n:n-1);i++){const p0=g(i-1),p1=g(i),p2=g(i+1),p3=g(i+2);
    P.bezierCurveTo(p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6,p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6,p2[0],p2[1]);}
  if(closed)P.closePath();return P;}
function poly(pts){const P=new Path2D();P.moveTo(pts[0][0],pts[0][1]);for(const q of pts.slice(1))P.lineTo(q[0],q[1]);P.closePath();return P;}
function rr(x0,y0,x1,y1,r){const P=new Path2D();P.roundRect?P.roundRect(x0,y0,x1-x0,y1-y0,r):P.rect(x0,y0,x1-x0,y1-y0);return P;}
// a band of constant width along a polyline, as a closed path
function band(pts,w0,w1){const L=[],R=[],n=pts.length;for(let i=0;i<n;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,w=lerp(w0,w1??w0,i/(n-1))/2;
  L.push([pts[i][0]-dy/l*w,pts[i][1]+dx/l*w]);R.push([pts[i][0]+dy/l*w,pts[i][1]-dx/l*w]);}return poly(L.concat(R.reverse()));}
let PATHS=null;
function paths(){if(PATHS)return PATHS;const P={};
  P.tank=cr(new Path2D(),[[-5,63.6],[-6.4,70],[-3.4,78.4],[5,83.2],[16,85.8],[27,86.7],[34.6,85.4],[39.6,82],[41.6,77],[39.4,71.4],[30,67.8],[18,65.4],[6,63.8]]);
  P.tankDent=cr(new Path2D(),[[-3,66.4],[-3.6,71],[1,73.8],[9,73.6],[12.4,70],[9.6,66.6],[3,65.8]]);
  P.seat=cr(new Path2D(),[[-3.8,64.8],[-7.6,67.4],[-16,66.9],[-27,67.5],[-37,68.6],[-43.6,70.2],[-45,66],[-43,63.2],[-30,62.9],[-16,63],[-6,63.4]]);
  P.tail=cr(new Path2D(),[[-42.6,63.8],[-43.8,69.2],[-47,74],[-53,76.8],[-60,75.6],[-65,71.8],[-66.6,66.2],[-65,62],[-58,60.4],[-48.6,60.8]]);
  P.panel=cr(new Path2D(),[[-7.6,61.6],[-21,61.8],[-34,61.4],[-31,53],[-24.4,44.4],[-15,42.6],[-8.4,47],[-6.6,55]]);
  P.case=rr(-13.4,13.6,27,40.6,6.4);
  P.head=cr(new Path2D(),[[11.6,59],[13,64.4],[22,66.6],[32.6,64.8],[34,59.6],[31,57.6],[20,57.8]]);
  P.barrel=poly([[6.4,40],[24.4,40],[32.4,58.6],[13.2,59.6]]);
  P.swing=poly([[-9.6,34.2],[-14.6,27.6],[-60.6,21.6],[-63.2,25.4],[-59.6,29.6],[-14.4,35.6]]);
  P.hugger=(()=>{const Q=new Path2D(),c=[-60,25],a0=.95,a1=2.45;Q.arc(c[0],c[1],29.4,a0,a1);Q.arc(c[0],c[1],27,a1,a0,true);Q.closePath();return Q;})();
  P.fender=(()=>{const Q=new Path2D(),c=[64,25],a0=.32,a1=2.62;Q.arc(c[0],c[1],29.6,a0,a1);Q.arc(c[0],c[1],27.4,a1,a0,true);Q.closePath();return Q;})();
  P.bucket=cr(new Path2D(),[[58.4,86.8],[54,86.6],[50.6,83.6],[49.4,79],[50.6,74.4],[54,71.4],[58.4,71.2]]);
  P.muffler=(()=>{const a=[-23,12.4],b=[-76,35.6],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy),nx=-dy/l,ny=dx/l,r0=2.7,r1=5.2;
    return poly([[a[0]+nx*r0,a[1]+ny*r0],[b[0]+nx*r1,b[1]+ny*r1],[b[0]-nx*r1,b[1]-ny*r1],[a[0]-nx*r0,a[1]-ny*r0]]);})();
  P.header=[[30.4,56],[35,48],[35.4,32],[30,17.4],[16,10],[-6,9.2],[-23,12.4]];
  PATHS=P;return P;}

// ---------- the bike's frame on the screen ----------
function frame(B){const fa=B.fa<0?-1:1,p=B.pitch||0,d=B.dep||0;return{fa,p,ox:B.x+d*PX(),oy:B.gy-d*PY(),c:Math.cos(p),s:Math.sin(p)};}
function setT(c,F){c.transform(F.fa,0,0,-1,F.ox,F.oy);if(F.p){c.translate(DIM.pivot[0],DIM.pivot[1]);c.rotate(F.p);c.translate(-DIM.pivot[0],-DIM.pivot[1]);}}
function bikePt(B,lx,ly){const F=frame(B),ax=lx-DIM.pivot[0],ay=ly*(1-SQ*clamp(B.lie||0,0,1))-DIM.pivot[1],rx=DIM.pivot[0]+ax*F.c-ay*F.s,ry=DIM.pivot[1]+ax*F.s+ay*F.c;return{x:F.ox+F.fa*rx,y:F.oy-ry};}
// the direction toward the light, in the bike's own frame
function lightLocal(B,F,o){let lx,ly;
  if(o&&o.dir){lx=o.dir.x;ly=o.dir.y;}else if(o&&o.light){const q=bikePt(B,0,60);lx=o.light.x-q.x;ly=o.light.y-q.y;}else{lx=.35;ly=-1;}
  const l=Math.hypot(lx,ly)||1;lx=lx/l*F.fa;ly=-ly/l;return{x:lx*F.c+ly*F.s,y:-lx*F.s+ly*F.c};}
// fill a shape and leave a thin edge of light on the side that faces the light
function rimFill(c,P,fill,L,w,a,col){c.fillStyle=rgba(col||K.rim,a);c.fill(P);c.save();c.clip(P);c.translate(-L.x*w,-L.y*w);c.fillStyle=fill;c.fill(P);c.restore();}
function lg(c,x0,y0,x1,y1,st){const g=c.createLinearGradient(x0,y0,x1,y1);for(const [o,col] of st)g.addColorStop(o,col);return g;}
function rg(c,x,y,r0,r1,st){const g=c.createRadialGradient(x,y,r0,x,y,r1);for(const [o,col] of st)g.addColorStop(o,col);return g;}
function stroke(c,pts,col,w,cap){c.strokeStyle=col;c.lineWidth=w;c.lineCap=cap||'round';c.lineJoin='round';c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(const q of pts.slice(1))c.lineTo(q[0],q[1]);c.stroke();}
function strokeCr(c,pts,col,w){const P=cr(new Path2D(),pts,false);c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.stroke(P);}
// the gold vine along a curve, small: a stem in a slow wave, a leaf at each crest on alternate sides, now and then a curl
function vine(c,pts,w,leaf,col,seed){const S=[];for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],n=Math.max(2,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.8));for(let k=0;k<n;k++)S.push([lerp(a[0],b[0],k/n),lerp(a[1],b[1],k/n)]);}
  S.push(pts[pts.length-1]);const Q=[],wl=leaf*5.2,amp=leaf*.34;let s=0;
  for(let i=0;i<S.length;i++){if(i)s+=Math.hypot(S[i][0]-S[i-1][0],S[i][1]-S[i-1][1]);const a=S[Math.max(0,i-1)],b=S[Math.min(S.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;
    const ph=s/wl*TAU+(seed||0);Q.push({x:S[i][0]-dy/l*Math.sin(ph)*amp,y:S[i][1]+dx/l*Math.sin(ph)*amp,tx:dx/l,ty:dy/l,nx:-dy/l,ny:dx/l,s,ph});}
  c.save();c.strokeStyle=col;c.fillStyle=col;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.beginPath();Q.forEach((q,i)=>i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y));c.stroke();
  // a leaf where the stem crests, on that side, swept forward along it
  let k=0;for(let i=1;i<Q.length-1;i++){const q=Q[i],a=Math.sin(Q[i-1].ph),b=Math.sin(q.ph),c2=Math.sin(Q[i+1].ph);if(!((b>a&&b>=c2)||(b<a&&b<=c2)))continue;k++;
    const side=b>0?1:-1,ang=Math.atan2(q.ty,q.tx)+side*.62,L=leaf*(.85+.3*((k*7)%3)/2);
    c.save();c.translate(q.x+q.nx*side*w*.4,q.y+q.ny*side*w*.4);c.rotate(ang);c.beginPath();c.moveTo(0,0);c.bezierCurveTo(L*.3,L*.36,L*.75,L*.3,L,0);c.bezierCurveTo(L*.75,-L*.22,L*.3,-L*.26,0,0);c.fill();c.restore();
    if(k%3===2){const r=leaf*.42;c.beginPath();for(let t=0;t<=TAU*.85;t+=.35){const rr=r*(1-t/(TAU*1.1));c.lineTo(q.x-q.nx*side*(r+rr*Math.cos(t)),q.y-q.ny*side*(r+rr*Math.cos(t))+rr*Math.sin(t)*side);}c.lineWidth=w*.8;c.stroke();}}
  c.restore();}
// a leaf crest: a pointed leaf with its vein, in gold, inside a ring
function crest(c,cx,cy,r,ang){c.save();c.translate(cx,cy);c.rotate(ang);
  c.strokeStyle=lg(c,-r,-r,r,r,[[0,K.goldD],[.5,K.goldL],[1,K.goldD]]);c.lineWidth=r*.16;c.beginPath();c.ellipse(0,0,r,r*.8,0,0,TAU);c.stroke();
  const L=r*.72;c.fillStyle=lg(c,0,-L,0,L,[[0,K.goldL],[1,K.goldD]]);c.beginPath();c.moveTo(0,-L);c.bezierCurveTo(L*.5,-L*.4,L*.42,L*.5,0,L);c.bezierCurveTo(-L*.42,L*.5,-L*.5,-L*.4,0,-L);c.fill();
  c.strokeStyle=K.lac;c.lineWidth=r*.07;c.beginPath();c.moveTo(0,-L*.8);c.lineTo(0,L*.86);for(const t of [-.3,.1,.45]){c.moveTo(0,t*L);c.lineTo(L*.26,t*L-L*.22);c.moveTo(0,t*L);c.lineTo(-L*.26,t*L-L*.22);}c.stroke();
  c.restore();}

// ---------- caches: each layer of a bike is painted once, then stamped ----------
// A bike is three stamps a frame: the two turning wheels and everything else, painted ahead into offscreen bitmaps for the
// light's direction (to an eighth of a turn). Over them, drawn live: the light-core, the runes, the lamps and their glow, the
// exhaust's shimmer. When the screen's scale holds steady and the bike stands level (the usual case), the layers are painted at
// exactly that scale, facing the bike's way, the wheels at sixteen steps of their turn, and set down pixel for pixel, which costs
// a renderer without a GPU almost nothing. Otherwise (a zoom under way, a wheelie, a bike going down) they are painted at the
// screen's scale rounded up to a half octave and drawn through the transform. A wreck is drawn straight; there is seldom more than one.
const CACHE=new Map(),ID=fn=>fn(),BUDGET=48e6,NF=16,P7=TAU/7;let BYTES=0,kNow=0,kAt=0;
function canvas(w,h){if(typeof OffscreenCanvas!=='undefined')return new OffscreenCanvas(w,h);const v=document.createElement('canvas');v.width=w;v.height=h;return v;}
function bucket(k){return clamp(Math.pow(2,Math.ceil(Math.log2(Math.max(k,.01))*2)/2),.5,8);}
function hit(key){const e=CACHE.get(key);if(e){CACHE.delete(key);CACHE.set(key,e);}return e;}
function keep(key,cv,e){e.cv=cv.transferToImageBitmap?cv.transferToImageBitmap():cv;e.bytes=cv.width*cv.height*4||e.bytes;CACHE.set(key,e);BYTES+=e.bytes;
  while(BYTES>BUDGET&&CACHE.size>1){const [k0,v]=CACHE.entries().next().value;CACHE.delete(k0);BYTES-=v.bytes;}return e;}
// a layer covering [x0,x1] x [y0,y1] of the bike's frame (y up), painted once by fn at scale sc
function layer(key,sc,x0,x1,y0,y1,fn){const e=hit(key);if(e)return e;
  const w=Math.max(1,Math.ceil((x1-x0)*sc)),h=Math.max(1,Math.ceil((y1-y0)*sc)),cv=canvas(w,h),g=cv.getContext('2d');
  g.setTransform(sc,0,0,-sc,-x0*sc,y1*sc);fn(g);return keep(key,cv,{sc,x0,y1,bytes:w*h*4});}
// the same at exactly the screen's scale k, facing fa: the bike's (0,0) lands on pixel (ox,oy) of it
function devLayer(key,k,fa,x0,x1,y0,y1,fn){const e=hit(key);if(e)return e;
  const ox=Math.ceil((fa>0?-x0:x1)*k)+1,oy=Math.ceil(y1*k)+1,w=Math.ceil((x1-x0)*k)+2,h=Math.ceil((y1-y0)*k)+2,cv=canvas(w,h),g=cv.getContext('2d');
  g.setTransform(fa*k,0,0,-k,ox,oy);fn(g);return keep(key,cv,{ox,oy,bytes:w*h*4});}
// has the screen's scale held for a quarter second?
function steady(k){const t=performance.now();if(Math.abs(k-kNow)>1e-6*k){kNow=k;kAt=t;}return t-kAt>250;}
function stamp(c,e){c.save();c.translate(e.x0,e.y1);c.scale(1/e.sc,-1/e.sc);c.drawImage(e.cv,0,0);c.restore();}
// everything outside a circle: to clip what runs in behind a wheel
function outside(cx,cy,r){const P=new Path2D();P.rect(-400,-400,800,800);P.moveTo(cx+r,cy);P.arc(cx,cy,r,0,TAU);return P;}
const CHROME=[[0,'#2b2e35'],[.32,'#8d939e'],[.52,'#f2f5f8'],[.72,'#8d939e'],[1,'#3a3d45']];
const PAINT={red:{d:'#2a0807',p:'#5e1714',l:'#8c2b24',hi:'#b9473a'},black:{d:'#060607',p:'#161619',l:'#2a2a2f',hi:'#4a4a52'}};
// the chain's two runs and the rear sprocket
function drive(c,dark,link,ring,boss){c.strokeStyle=dark;c.lineWidth=1.4;c.beginPath();c.moveTo(-9,27.4);c.lineTo(-60,33.6);c.moveTo(-9,19.4);c.lineTo(-60,16.4);c.stroke();
  c.setLineDash([.7,.9]);c.strokeStyle=link;c.lineWidth=.5;c.beginPath();c.moveTo(-9,27.4);c.lineTo(-60,33.6);c.moveTo(-9,19.4);c.lineTo(-60,16.4);c.stroke();c.setLineDash([]);
  c.fillStyle='#141318';c.beginPath();c.arc(-60,25,9.4,0,TAU);c.arc(-60,25,5.2,0,TAU,true);c.fill();
  c.fillStyle='#0a0a0c';c.beginPath();for(let i=0;i<22;i++){const a=i/22*TAU,x=-60+Math.cos(a)*9.6,y=25+Math.sin(a)*9.6;c.moveTo(x+.55,y);c.arc(x,y,.55,0,TAU);}c.fill();
  c.strokeStyle=ring;c.lineWidth=.45;c.beginPath();c.arc(-60,25,7.2,0,TAU);c.stroke();
  c.fillStyle=boss;c.beginPath();c.arc(-60,25,1.6,0,TAU);c.fill();
  stroke(c,[[-8,29],[-40,32.8]],'#0d0c10',1.6);}
function visor(c){c.fillStyle=K.lac;c.beginPath();c.moveTo(51,86.4);c.quadraticCurveTo(57.6,89.6,61.4,86.2);c.lineTo(60,85.2);c.quadraticCurveTo(56,87.2,51.6,85.2);c.closePath();c.fill();}
function crack(c,x){c.strokeStyle=rgba('#c8d0d8',.4);c.lineWidth=.25;c.beginPath();c.moveTo(x,82);c.lineTo(x+.8,77.6);c.lineTo(x-.2,75);c.moveTo(x+.6,78.6);c.lineTo(x-.6,80.8);c.stroke();}

// ---------- the elven wheels ----------
// seven turbine blades about the centre, black with a gold leading edge
function blades(c,a0){for(let i=0;i<7;i++){const a=a0+i/7*TAU,pt=(r,da)=>[Math.cos(a+da)*r,Math.sin(a+da)*r],A=pt(4.2,-.34),B2=pt(10,-.05),C2=pt(17,.32),D=pt(17,.62),E=pt(10,.32),F2=pt(4.2,.3),P=new Path2D();
    P.moveTo(A[0],A[1]);P.quadraticCurveTo(B2[0],B2[1],C2[0],C2[1]);P.lineTo(D[0],D[1]);P.quadraticCurveTo(E[0],E[1],F2[0],F2[1]);P.closePath();
    c.fillStyle='#16141b';c.fill(P);c.strokeStyle=rgba(K.gold,.85);c.lineWidth=.5;c.beginPath();c.moveTo(A[0],A[1]);c.quadraticCurveTo(B2[0],B2[1],C2[0],C2[1]);c.stroke();}}
// the turning part of a wheel, centred: the tyre and its tread, the dark inside, the front disc, the blades;
// or (blur) the inside alone with the blades smeared round into a disc, laid over the sharp one when the wheel turns fast
function wheelRotE(c,front,blur){
  if(!blur){c.fillStyle=K.tyre;c.beginPath();c.arc(0,0,25,0,TAU);c.arc(0,0,17.6,0,TAU,true);c.fill();
    c.strokeStyle=rgba('#3a3a44',.55);c.lineWidth=.7;c.beginPath();c.arc(0,0,24.2,0,TAU);c.stroke();
    c.strokeStyle=rgba(K.goldD,.55);c.lineWidth=.4;c.beginPath();c.arc(0,0,19.6,0,TAU);c.stroke();
    c.strokeStyle=rgba('#1c1c22',.9);c.lineWidth=.45;c.beginPath();for(let i=0;i<28;i++){const a=i/28*TAU;c.moveTo(Math.cos(a)*21,Math.sin(a)*21);c.lineTo(Math.cos(a+.06)*22.6,Math.sin(a+.06)*22.6);}c.stroke();}
  c.fillStyle=rg(c,0,0,2,17.6,[[0,'#17151b'],[1,'#060507']]);c.beginPath();c.arc(0,0,17.6,0,TAU);c.fill();
  if(front){c.fillStyle=rg(c,0,0,7.4,12.4,[[0,'#25272e'],[.4,'#6a7080'],[.75,'#454a55'],[1,'#25272e']]);c.beginPath();c.arc(0,0,12.4,0,TAU);c.arc(0,0,7.4,0,TAU,true);c.fill();
    if(blur){c.strokeStyle=rgba('#0a0a0c',.55);c.lineWidth=1.2;c.beginPath();c.arc(0,0,10,0,TAU);c.stroke();}
    else{c.fillStyle='#0a0a0c';c.beginPath();for(let i=0;i<14;i++){const a=i/14*TAU,x=Math.cos(a)*10,y=Math.sin(a)*10;c.moveTo(x+.62,y);c.arc(x,y,.62,0,TAU);}c.fill();}}
  if(blur){c.globalAlpha=.16;for(let k=0;k<12;k++)blades(c,k/12*TAU/7);c.globalAlpha=1;c.fillStyle=rgba(K.gold,.1);c.beginPath();c.arc(0,0,17,0,TAU);c.arc(0,0,4.4,0,TAU,true);c.fill();}
  else blades(c,0);}
// the still part over it: the light on the tyre's shoulder, the gold rim, the hub; the front caliper
function wheelOverE(c,cx,cy,front,L){const la=Math.atan2(L.y,L.x);
  c.strokeStyle=rgba(K.rim,.32);c.lineWidth=1.1;c.beginPath();c.arc(cx,cy,24.1,la-.9,la+.9);c.stroke();
  c.strokeStyle=lg(c,cx-17,cy+17,cx+17,cy-17,[[0,K.goldDD],[.35,K.gold],[.5,K.goldL],[.7,K.gold],[1,K.goldD]]);c.lineWidth=1.9;c.beginPath();c.arc(cx,cy,17.6,0,TAU);c.stroke();
  c.strokeStyle=rgba('#000000',.6);c.lineWidth=.5;c.beginPath();c.arc(cx,cy,16.5,0,TAU);c.stroke();
  c.fillStyle=rg(c,cx+L.x*1.2,cy+L.y*1.2,.4,5.4,[[0,K.goldL],[.5,K.gold],[1,K.goldDD]]);c.beginPath();c.arc(cx,cy,4.6,0,TAU);c.fill();
  c.fillStyle=K.lac;c.beginPath();c.arc(cx,cy,2.4,0,TAU);c.fill();
  c.fillStyle=K.gold;c.beginPath();c.moveTo(cx-1.5,cy-.3);c.quadraticCurveTo(cx,cy+1.5,cx+1.5,cy-.3);c.quadraticCurveTo(cx,cy+.2,cx-1.5,cy-.3);c.fill();
  if(front){const P=rr(cx-8.6,cy+5.4,cx-1.2,cy+11.4,1.6);c.fillStyle=lg(c,cx-8,cy+11,cx-2,cy+5,[[0,K.goldD],[.5,K.gold],[1,K.goldDD]]);c.fill(P);c.strokeStyle=rgba('#000000',.5);c.lineWidth=.4;c.stroke(P);}}

// ---------- the elven bike: all of it but the turning wheels and the lights, painted once into its layer ----------
function topE(c,L,hol,wr,fr){const P=paths();
  // the far fork leg behind the front wheel (only its top shows above the tyre); the rear hugger, its stay running in behind the tyre
  fr(()=>{c.save();c.clip(outside(64,25,25.2),'evenodd');c.translate(2.2,1.4);forkLeg(c,true);c.restore();});
  c.fillStyle=K.lac;c.fill(P.hugger);c.strokeStyle=rgba(K.gold,.55);c.lineWidth=.45;c.stroke(P.hugger);
  c.save();c.clip(outside(-60,25,25.2),'evenodd');stroke(c,[[-44.6,46.4],[-47.6,29.4]],K.frame,1.5);c.restore();
  // the still parts of the wheels; the front fender and its stay
  wheelOverE(c,-60,25,false,L);
  fr(()=>{wheelOverE(c,64,25,true,L);rimFill(c,P.fender,lg(c,40,50,90,40,[[0,K.lac2],[.5,K.lac],[1,K.lac1]]),L,.9,.55);
    c.save();c.clip(P.fender);c.strokeStyle=rgba(K.gold,.8);c.lineWidth=.55;c.beginPath();c.arc(64,25,29,.38,2.56);c.stroke();c.restore();
    stroke(c,[[55.6,51.8],[58.6,40.4]],K.frame,1.5);});
  // the frame: the down tubes and the cradle under the engine, the subframe under the seat
  const FR=[[42.2,72],[37.6,54],[32,32],[26.4,17],[10,10.4],[-9,12],[-13.6,24]];
  stroke(c,FR,K.frame,3);stroke(c,FR,rgba('#5a5866',.35),.6);
  stroke(c,[[-6,62.6],[-58,62.4]],K.frame,2.4);stroke(c,[[-13.6,34],[-44,61.4]],K.frame,2.6);
  // the shock: a black damper in a gold coil
  stroke(c,[[-41.6,30.6],[-36.4,60.4]],'#0c0b0f',3.2);
  {c.strokeStyle=lg(c,-42,30,-36,60,[[0,K.goldD],[.5,K.gold],[1,K.goldD]]);c.lineWidth=.9;c.beginPath();for(let i=0;i<=9;i++){const t=.18+i/9*.66,x=lerp(-41.6,-36.4,t),y=lerp(30.6,60.4,t);c.moveTo(x-3.2,y-.7);c.lineTo(x+3.2,y+.7);}c.stroke();}
  // the swingarm, the chain and the rear sprocket
  rimFill(c,P.swing,lg(c,0,22,0,36,[[0,'#09080b'],[.6,K.lac2],[1,K.lac1]]),L,.7,.45);stroke(c,[[-16,31.6],[-58.6,26]],rgba(K.gold,.7),.45);
  drive(c,'#1d1c22',rgba('#8a8e98',.45),rgba(K.gold,.6),K.gold);
  // the engine: crankcase, finned cylinder, the head under a gold rocker cover, the intake, the light-core's bezel
  {c.fillStyle=lg(c,0,13,0,41,[[0,'#08070a'],[.55,'#16141b'],[1,'#22202a']]);c.fill(P.case);c.strokeStyle=rgba('#000000',.7);c.lineWidth=.6;c.stroke(P.case);
    c.fillStyle=lg(c,6,40,32,60,[[0,'#121118'],[1,'#1c1a22']]);c.fill(P.barrel);
    c.save();for(let i=0;i<8;i++){const t=(i+.5)/8,ax=lerp(15.4,22.6,t),ay=lerp(40,59,t),hx=10.6+i*.18;c.strokeStyle='#050407';c.lineWidth=1.25;c.beginPath();c.moveTo(ax-hx,ay-.8);c.lineTo(ax+hx,ay+.4);c.stroke();
      c.strokeStyle=rgba('#8a8898',.35+.25*clamp(L.y,0,1));c.lineWidth=.42;c.beginPath();c.moveTo(ax-hx,ay+.15);c.lineTo(ax+hx,ay+1.35);c.stroke();}c.restore();
    rimFill(c,P.head,lg(c,12,58,34,66,[[0,'#16141b'],[1,'#25232c']]),L,.6,.4);
    const rc=rr(14.6,62.6,31.2,66.4,1.8);c.fillStyle=lg(c,0,62,0,67,[[0,K.goldL],[.5,K.gold],[1,K.goldD]]);c.fill(rc);
    c.fillStyle=K.goldDD;for(const x of [17.4,23,28.6]){c.beginPath();c.arc(x,64.5,.55,0,TAU);c.fill();}
    const im=poly([[8,51.6],[2,50.4],[-6.4,47.8],[-6.6,57.4],[2,55],[8,55.2]]);c.fillStyle=lg(c,-6,48,-6,57,[[0,K.goldD],[.45,K.goldL],[1,K.goldD]]);c.fill(im);
    c.fillStyle='#060507';c.beginPath();c.ellipse(-6.5,52.6,1.2,4.6,0,0,TAU);c.fill();
    c.fillStyle=lg(c,-12,18,0,34,[[0,'#1c1a22'],[1,'#0c0b10']]);c.beginPath();c.arc(-4.6,25.4,7.6,0,TAU);c.fill();c.strokeStyle=rgba(K.gold,.55);c.lineWidth=.5;c.stroke();
    c.fillStyle=K.gold;for(let i=0;i<6;i++){const a=i/6*TAU+.3;c.beginPath();c.arc(-4.6+Math.cos(a)*6.3,25.4+Math.sin(a)*6.3,.5,0,TAU);c.fill();}
    const cx=12,cy=26;c.fillStyle=lg(c,cx-7,cy+7,cx+7,cy-7,[[0,K.goldDD],[.4,K.gold],[.55,K.goldL],[1,K.goldD]]);c.beginPath();c.arc(cx,cy,7.6,0,TAU);c.fill();
    c.fillStyle='#04070a';c.beginPath();c.arc(cx,cy,6.1,0,TAU);c.fill();
    c.fillStyle=rgba('#ffffff',.18);c.beginPath();c.ellipse(cx-2,cy+2.4,2.4,1,-.6,0,TAU);c.fill();}
  // the side panel under the seat, with the leaf crest
  rimFill(c,P.panel,lg(c,-34,44,-6,62,[[0,'#08070a'],[1,K.lac2]]),L,.6,.4);
  {c.save();c.clip(P.panel);c.strokeStyle=rgba(K.gold,.65);c.lineWidth=.45;c.translate(-20.4,52.4);c.scale(.86,.86);c.translate(20.4,-52.4);c.stroke(P.panel);c.restore();
    crest(c,-19.6,52.4,4.6,-.5);}
  // the exhaust: the header round the front of the engine, a long upswept megaphone, a gold tip
  {strokeCr(c,P.header,'#0b0a0d',4.6);strokeCr(c,P.header,rgba('#6a6878',.5),.6);
    c.save();c.translate(0,1.2);strokeCr(c,P.header,rgba('#000000',.35),.5);c.restore();
    c.fillStyle=lg(c,-50,18,-48,34,[[0,'#060508'],[.55,'#1e1c24'],[.7,'#3c3a46'],[1,'#0c0b0f']]);c.fill(P.muffler);c.strokeStyle=rgba('#000000',.6);c.lineWidth=.4;c.stroke(P.muffler);
    stroke(c,[[-24,15],[-76.6,38.4]],rgba(K.rim,.38),.6);
    for(const t of [.12,.55]){const x=lerp(-23,-76,t),y=lerp(12.4,35.6,t),r=lerp(2.7,5.2,t)+.4;c.save();c.translate(x,y);c.rotate(Math.atan2(23.2,-53)+Math.PI/2);c.fillStyle=lg(c,-r,0,r,0,[[0,K.goldD],[.5,K.goldL],[1,K.goldD]]);c.fillRect(-r,-.7,r*2,1.4);c.restore();}
    c.save();c.translate(-76,35.6);c.rotate(Math.atan2(23.2,-53));c.fillStyle=lg(c,0,-5.6,0,5.6,[[0,K.goldD],[.5,K.goldL],[1,K.goldD]]);c.beginPath();c.ellipse(0,0,1.4,5.5,0,0,TAU);c.fill();
      c.fillStyle='#030304';c.beginPath();c.ellipse(-.3,0,.9,4.1,0,0,TAU);c.fill();c.restore();}
  // the tank, the seat and the tail
  rimFill(c,P.tank,lg(c,0,64,0,87,[[0,'#060509'],[.5,K.lac1],[.82,K.lac2],[1,'#2c2b35']]),L,1,.7);
  {c.save();c.clip(P.tank);c.fillStyle=rgba('#000000',.35);c.fill(P.tankDent);
    c.fillStyle=lg(c,0,76,0,86,[[0,rgba('#ffffff',0)],[.6,rgba('#c8c4d8',.07)],[1,rgba('#ffffff',0)]]);c.fillRect(-8,76,52,10);
    c.strokeStyle=rgba(K.rim,.22);c.lineWidth=1.6;c.beginPath();c.moveTo(2,81.4);c.quadraticCurveTo(18,85.4,34,84);c.stroke();c.restore();
    vine(c,[[-2.6,74],[8,77],[20,79],[31,78.8],[38.2,76.8]],.34,1.5,K.gold,1);
    stroke(c,[[-1.6,70.4],[12,73.6],[26,74.8],[38.4,73]],rgba(K.gold,.5),.3);
    crest(c,17.4,71.6,3.4,-1.15);
    const cap=rr(19.6,85.6,25.6,88.2,1);c.fillStyle=lg(c,0,85.6,0,88.2,[[0,K.goldL],[1,K.goldD]]);c.fill(cap);}
  rimFill(c,P.seat,lg(c,0,62.6,0,70,[[0,K.leatherD],[.55,K.leather],[1,K.leatherL]]),L,.8,.55);
  {c.save();c.clip(P.seat);c.strokeStyle=rgba('#000000',.32);c.lineWidth=.42;c.beginPath();for(let x=-12;x>=-40;x-=4.4){c.moveTo(x,63.4);c.lineTo(x-.4,69.6);}c.stroke();
    c.setLineDash([.6,.7]);c.strokeStyle=rgba(K.goldL,.75);c.lineWidth=.28;c.beginPath();c.moveTo(-6,66);c.bezierCurveTo(-16,65.6,-30,66.2,-42,68.4);c.stroke();c.setLineDash([]);
    c.fillStyle=lg(c,0,65,0,68.6,[[0,rgba('#ffffff',0)],[1,rgba('#ffd2a0',.16)]]);c.fillRect(-46,65,42,4);c.restore();}
  rimFill(c,P.tail,lg(c,0,60,0,77,[[0,'#060509'],[.6,K.lac1],[1,'#2c2b35']]),L,1,.65);
  {c.save();c.clip(P.tail);c.strokeStyle=rgba(K.gold,.75);c.lineWidth=.4;c.translate(-55,68);c.scale(.84,.8);c.translate(55,-68);c.stroke(P.tail);c.restore();
    vine(c,[[-45.4,66.6],[-50.6,70.6],[-58,71.4],[-62.6,68.6]],.3,1.25,K.gold,3);
    const tl=rr(-66.9,63.4,-65,70.4,.6);c.fillStyle=wr?'#3a0a08':lg(c,-67,63,-65,71,[[0,'#ff8a6a'],[.5,K.red],[1,'#7a0e08']]);c.fill(tl);}
  // the footpeg and the levers
  {stroke(c,[[-14,36.6],[-24.4,29.6]],'#0e0d11',2.2);stroke(c,[[-14,36.6],[-24.4,29.6]],rgba('#6a6878',.4),.4);
    stroke(c,[[-17,30.6],[-6,26.6]],'#0e0d11',1.1);stroke(c,[[-6,26.6],[-5,27.8]],K.gold,1);
    const pg=rr(-25.4,26.9,-19,29.1,1.1);c.fillStyle=lg(c,0,27,0,29,[[0,K.goldL],[1,K.goldD]]);c.fill(pg);c.strokeStyle=rgba('#000000',.4);c.lineWidth=.25;c.beginPath();for(let x=-24.6;x<-19.4;x+=.9){c.moveTo(x,27);c.lineTo(x,29);}c.stroke();}
  // the scabbard on the near side of the tail, the rifle's stock standing out of it
  if(hol){const mx=-61,my=65.4,dx=.9,dy=-.436,nx=-dy,ny=dx;
    if(hol==='rifle'){c.save();c.translate(mx-dx*4,my-dy*4);c.transform(dx,dy,nx,ny,0,0);rifleShape(c,{flash:0,stowed:1});c.restore();}
    const len=66,w0=6.4,w1=4.6,pt=(t,s)=>[mx+dx*len*t+nx*s,my+dy*len*t+ny*s];
    const Sc=poly([pt(0,w0),pt(.4,w0*.98),pt(.97,w1),pt(1,w1*.4),pt(1,-w1*.4),pt(.97,-w1),pt(.4,-w0*.98),pt(0,-w0)]);
    c.fillStyle=lg(c,mx+nx*w0,my+ny*w0,mx-nx*w0,my-ny*w0,[[0,K.scabL],[.35,K.scab],[1,K.scabD]]);c.fill(Sc);c.strokeStyle=rgba('#000000',.6);c.lineWidth=.4;c.stroke(Sc);
    c.setLineDash([.6,.7]);c.strokeStyle=rgba(K.goldL,.6);c.lineWidth=.26;c.beginPath();c.moveTo(...pt(.03,w0-1.2));c.lineTo(...pt(.96,w1-1));c.stroke();c.setLineDash([]);
    const mo=poly([pt(-.02,w0+.6),pt(.045,w0+.6),pt(.045,-w0-.6),pt(-.02,-w0-.6)]);c.fillStyle=K.scabD;c.fill(mo);c.strokeStyle=rgba(K.gold,.6);c.lineWidth=.35;c.stroke(mo);
    for(const t of [.22,.62]){const a=pt(t,w0+.9),b=pt(t,-w0-.9),e=pt(t+.035,-w0-.9),f2=pt(t+.035,w0+.9);c.fillStyle='#120a06';c.fill(poly([a,f2,e,b]));
      const bc=pt(t+.0175,0);c.fillStyle=lg(c,bc[0]-2,bc[1]-2,bc[0]+2,bc[1]+2,[[0,K.goldD],[.5,K.goldL],[1,K.goldD]]);c.fillRect(bc[0]-1.6,bc[1]-1.9,3.2,3.8);c.fillStyle='#120a06';c.fillRect(bc[0]-.8,bc[1]-1.1,1.6,2.2);}
    c.strokeStyle=rgba(K.rim,.3);c.lineWidth=.5;c.beginPath();c.moveTo(...pt(.05,w0-.3));c.lineTo(...pt(.95,w1-.3));c.stroke();}
  // the near fork leg, the clamps, the gauge, the clip-ons, the headlamp (its lens dark: the light is laid over it live)
  fr(()=>{forkLeg(c,false,L);
    const g=rr(42.6,86.6,48.4,91,1.8);c.fillStyle=lg(c,0,86,0,91,[[0,K.goldL],[1,K.goldD]]);c.fill(g);
    stroke(c,[[45.4,82.4],[29.6,85.4]],'#0c0b0f',2.4);stroke(c,[[44.6,83.6],[30.6,86.4]],rgba('#6a6878',.4),.4);
    strokeCr(c,[[41.6,84.6],[37,82],[30.4,81.6]],K.gold,.7);
    const gp=poly([[27.8,84.2],[36.2,85.6],[36.2,88.2],[27.8,86.8]]);c.fillStyle=lg(c,0,84,0,88,[[0,K.leatherD],[.5,K.leatherL],[1,K.leatherD]]);c.fill(gp);
    c.strokeStyle=rgba('#000000',.4);c.lineWidth=.25;c.beginPath();for(let x=29;x<36;x+=1){c.moveTo(x,84.4+(x-27.8)*.17);c.lineTo(x,86.9+(x-27.8)*.17);}c.stroke();
    c.fillStyle=K.gold;c.beginPath();c.ellipse(27.6,85.5,.9,1.6,.17,0,TAU);c.fill();
    rimFill(c,P.bucket,lg(c,49,72,58,86,[[0,'#060509'],[1,K.lac2]]),L,.8,.6);
    stroke(c,[[48.4,77.4],[51.2,78.4]],K.gold,1.1);
    c.fillStyle=lg(c,58,71,58,87,[[0,K.goldL],[.5,K.gold],[1,K.goldD]]);c.beginPath();c.ellipse(58.6,79,1.9,8.2,0,0,TAU);c.fill();
    c.fillStyle=wr?'#0a0c0e':lg(c,59,71,59,87,[[0,'#1a3a38'],[.5,'#0c1c1c'],[1,'#081010']]);c.beginPath();c.ellipse(59.8,79,1.25,7,0,0,TAU);c.fill();
    if(wr)crack(c,59.8);
    visor(c);});
}
// what changes every frame: the light-core breathing, the runes turning, the tail light, the gauge, the headlamp, the exhaust
function liveE(c,now,run,lk,wr,fr){const cx=12,cy=26,pulse=.65+.35*Math.sin(now*2.4)*Math.sin(now*.9+1),k=run*(wr?.25:1);
  if(k>0){c.save();c.globalCompositeOperation='lighter';c.fillStyle=rg(c,cx,cy,0,6,[[0,rgba(K.cyanL,.9*k*pulse)],[.35,rgba(K.cyan,.6*k*pulse)],[1,rgba(K.cyanD,.05*k)]]);c.beginPath();c.arc(cx,cy,6,0,TAU);c.fill();c.restore();}
  c.strokeStyle=rgba(K.cyan,.25+.45*k);c.lineWidth=.32;c.lineCap='round';c.lineJoin='round';c.beginPath();
  for(let i=0;i<9;i++){const a=i/9*TAU+now*.15*k,x=cx+Math.cos(a)*4.1,y=cy+Math.sin(a)*4.1;c.moveTo(x,y);c.lineTo(x+Math.cos(a+1.9)*1.1,y+Math.sin(a+1.9)*1.1);c.lineTo(x+Math.cos(a+.6)*1.5,y+Math.sin(a+.6)*1.5);}c.stroke();
  if(!wr&&run>0){c.save();c.globalCompositeOperation='lighter';c.fillStyle=rg(c,-68,67,0,9,[[0,rgba('#ff4a2a',.45*run)],[1,rgba('#ff2a10',0)]]);c.fillRect(-77,58,14,18);c.restore();}
  fr(()=>{c.fillStyle=rgba(K.cyan,.25+.5*run);c.fillRect(43.4,90.2,4.2,.7);
    if(lk>0){c.fillStyle=lg(c,59,71,59,87,[[0,mix('#1a3a38',K.cyanL,lk)],[.5,mix('#0c1c1c',K.cyan,lk)],[1,mix('#081010',K.cyanD,lk)]]);c.beginPath();c.ellipse(59.8,79,1.25,7,0,0,TAU);c.fill();visor(c);
      c.save();c.globalCompositeOperation='lighter';c.fillStyle=rg(c,61,79,0,26,[[0,rgba(K.cyanL,.55*lk)],[.18,rgba(K.cyan,.28*lk)],[1,rgba(K.cyan,0)]]);c.beginPath();c.arc(61,79,26,0,TAU);c.fill();
      c.fillStyle=lg(c,60,79,96,79,[[0,rgba(K.cyanL,.28*lk)],[1,rgba(K.cyan,0)]]);c.beginPath();c.moveTo(60.4,85.6);c.lineTo(96,94);c.lineTo(96,62);c.lineTo(60.4,72.4);c.closePath();c.fill();c.restore();}});
  if(!wr)shimmer(c,now,run,-78,37,'#c8c4d8');}
function shimmer(c,now,run,x0,y0,col){if(run<=0)return;c.save();c.globalAlpha=.16*run;c.strokeStyle=col;c.lineWidth=.5;c.lineCap='round';c.lineJoin='round';c.beginPath();
  for(let i=0;i<3;i++){const ph=now*6+i*2.1;for(let k=0;k<=8;k++){const t=k/8,x=x0-t*14,y=y0+t*4+Math.sin(ph+t*7)*1.4*t;k?c.lineTo(x,y):c.moveTo(x,y);}}c.stroke();c.restore();}

// ---------- the street bike: the human gangs' machines, heavy and tired ----------
// dark red or matte black paint, chipped and dented; steel and chrome where Kael's bike has gold; wire wheels on knobbly tyres;
// a split seat patched with tape; a yellow lamp; a plate on the rear mudguard; a crash bar round the engine. The same frame and
// the same mount points as Kael's bike, so riders sit it the same way.
let SP=null;
function spaths(){if(SP)return SP;const P={},arcBand=(cx,cy,r0,r1,a0,a1)=>{const Q=new Path2D();Q.arc(cx,cy,r0,a0,a1);Q.arc(cx,cy,r1,a1,a0,true);Q.closePath();return Q;};
  P.tank=cr(new Path2D(),[[-5.6,63.2],[-7,69.6],[-4.4,77.2],[3.6,82.6],[15,85.4],[26.4,85.8],[35,84.2],[40.8,79.8],[42.4,74.2],[39.4,69.6],[30,66.4],[18,64.4],[6,63.2]]);
  P.dent=(()=>{const Q=new Path2D();Q.ellipse(24,77.8,5.4,2.5,.1,0,TAU);return Q;})();
  P.seat=cr(new Path2D(),[[-4.6,64],[-8.6,67.4],[-18,67.8],[-30,68.2],[-40,69.2],[-46.6,70.2],[-49,66.4],[-46.4,62.8],[-30,62.4],[-16,62.6],[-6,63]]);
  P.tail=cr(new Path2D(),[[-45.6,62.8],[-47,67.8],[-50.6,71.2],[-57,72.4],[-63.4,70.4],[-67.6,66],[-67.4,61.4],[-60,59.4],[-50.4,60]]);
  P.panel=cr(new Path2D(),[[-7,61.2],[-22,61.4],[-36.4,61],[-34.4,51.6],[-26,43],[-15,41.4],[-7.6,45.6],[-5.6,54.6]]);
  P.case=rr(-15.6,12,28.4,41.6,5.4);
  P.barrel=poly([[5,41],[25.6,41],[34,60.6],[12.4,61.6]]);
  P.head=cr(new Path2D(),[[10.8,60.6],[12.2,66.2],[22,68.6],[33.6,66.6],[35.2,61.2],[31.8,59],[20,59.4]]);
  P.swing=poly([[-9.6,35],[-15,27],[-60.4,21],[-64,25.4],[-60,30.2],[-14.6,36.8]]);
  P.rfender=arcBand(-60,25,29.6,27.6,1.12,2.92);
  P.ffender=arcBand(64,25,29.4,27.6,.62,2.2);
  P.bucket=cr(new Path2D(),[[58.6,86.6],[54.6,86.6],[51.2,83.8],[49.8,79],[51.2,74.2],[54.6,71.4],[58.6,71.4]]);
  P.muffler=(()=>{const a=[-20.6,13.6],b=[-73,27.4],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy),nx=-dy/l,ny=dx/l,r0=3.4,r1=5.8;
    return poly([[a[0]+nx*r0,a[1]+ny*r0],[b[0]+nx*r1,b[1]+ny*r1],[b[0]-nx*r1,b[1]-ny*r1],[a[0]-nx*r0,a[1]-ny*r0]]);})();
  P.header=[[31,58.6],[36,49],[36.6,32],[31.4,17],[16,10.6],[-6,10.4],[-20.6,13.6]];
  P.guard=[[37.2,52.4],[41.6,45.6],[42,33],[37.6,22.6],[29,16.6]];
  P.plate=poly([[-88.2,38.4],[-85.2,39.4],[-85.6,49],[-88.6,48]]);
  P.cguard=poly([[-11,29.4],[-44.6,33.6],[-45.4,36.2],[-12,32.2]]);
  P.filter=poly([[1.4,48.6],[-8.6,46.8],[-9.6,52.8],[-8.6,58.8],[1.4,57.6]]);
  SP=P;return P;}
// the turning part of a street wheel: a fat knobbly tyre, the dark inside, the front disc or the rear drum, crossed wire spokes
function wheelRotS(c,front,blur){
  if(!blur){c.fillStyle='#0c0c0e';c.beginPath();c.arc(0,0,24.4,0,TAU);c.arc(0,0,16.2,0,TAU,true);c.fill();
    const N=new Path2D();for(let i=0;i<28;i++){const a=i/28*TAU,h=.05,r0=23.8,r1=26.1;N.moveTo(Math.cos(a-h)*r0,Math.sin(a-h)*r0);N.lineTo(Math.cos(a-h*.75)*r1,Math.sin(a-h*.75)*r1);N.lineTo(Math.cos(a+h*.75)*r1,Math.sin(a+h*.75)*r1);N.lineTo(Math.cos(a+h)*r0,Math.sin(a+h)*r0);N.closePath();}c.fill(N);
    c.strokeStyle='#1e1e23';c.lineWidth=1;c.beginPath();for(let i=0;i<28;i++){const a=(i+.5)/28*TAU,r0=i%2?20.8:21.8,r1=r0+1.6;c.moveTo(Math.cos(a)*r0,Math.sin(a)*r0);c.lineTo(Math.cos(a)*r1,Math.sin(a)*r1);}c.stroke();
    c.strokeStyle=rgba('#34343c',.7);c.lineWidth=.4;c.beginPath();c.arc(0,0,19.2,0,TAU);c.stroke();}
  c.fillStyle=rg(c,0,0,2,16.2,[[0,'#19181d'],[1,'#070708']]);c.beginPath();c.arc(0,0,16.2,0,TAU);c.fill();
  if(front){c.fillStyle=rg(c,0,0,5.6,11,[[0,'#2a2c32'],[.5,'#7c828e'],[.8,'#5a5f6a'],[1,'#2a2c32']]);c.beginPath();c.arc(0,0,11,0,TAU);c.arc(0,0,5.6,0,TAU,true);c.fill();
    if(!blur){c.strokeStyle='#121316';c.lineWidth=.5;c.beginPath();for(let i=0;i<7;i++){const a=i/7*TAU;c.moveTo(Math.cos(a)*7.4,Math.sin(a)*7.4);c.lineTo(Math.cos(a+.3)*9.8,Math.sin(a+.3)*9.8);}c.stroke();}}
  else{c.fillStyle=rg(c,0,0,3,7.8,[[0,'#3a3d45'],[.6,'#6a707c'],[1,'#25272d']]);c.beginPath();c.arc(0,0,7.8,0,TAU);c.fill();
    c.strokeStyle=rgba('#111215',.8);c.lineWidth=.4;c.beginPath();c.arc(0,0,5.4,0,TAU);c.moveTo(6.6,0);c.arc(0,0,6.6,0,TAU);c.stroke();}
  const sp=(a0,al)=>{c.globalAlpha=al;c.strokeStyle='#a4aab4';c.lineWidth=.32;c.beginPath();for(let i=0;i<28;i++){const a=a0+i/28*TAU,b=a+(i%2?.62:-.62);c.moveTo(Math.cos(a)*4.8,Math.sin(a)*4.8);c.lineTo(Math.cos(b)*15.8,Math.sin(b)*15.8);}c.stroke();c.globalAlpha=1;};
  if(blur){for(let k=0;k<10;k++)sp(k/10*.45,.2);}
  else{sp(0,1);c.fillStyle='#c6ccd6';c.beginPath();for(let i=0;i<28;i++){const b=i/28*TAU+(i%2?.62:-.62),x=Math.cos(b)*15.4,y=Math.sin(b)*15.4;c.moveTo(x+.32,y);c.arc(x,y,.32,0,TAU);}c.fill();}}
// the still part over it: the shoulder's light, the chrome rim, the hub, the front caliper
function wheelOverS(c,cx,cy,front,L){const la=Math.atan2(L.y,L.x);
  c.strokeStyle=rgba('#c8ccd6',.16);c.lineWidth=1.2;c.beginPath();c.arc(cx,cy,23.2,la-.8,la+.8);c.stroke();
  c.strokeStyle=lg(c,cx-16,cy+16,cx+16,cy-16,CHROME);c.lineWidth=1.8;c.beginPath();c.arc(cx,cy,16.3,0,TAU);c.stroke();
  c.strokeStyle=rgba('#000000',.55);c.lineWidth=.45;c.beginPath();c.arc(cx,cy,15.3,0,TAU);c.stroke();
  c.fillStyle=rg(c,cx+L.x,cy+L.y,.3,4.4,[[0,'#f2f5f8'],[.5,'#8d939e'],[1,'#2b2e35']]);c.beginPath();c.arc(cx,cy,3.9,0,TAU);c.fill();
  c.fillStyle='#15161a';c.beginPath();c.arc(cx,cy,1.6,0,TAU);c.fill();
  if(front){const P=rr(cx-8.2,cy+4.6,cx-1.8,cy+10.6,1.3);c.fillStyle=lg(c,cx-8,cy+10,cx-2,cy+5,[[0,'#0c0c0e'],[.5,'#2a2b31'],[1,'#0c0c0e']]);c.fill(P);
    c.fillStyle='#9aa0aa';c.beginPath();for(const [x,y] of [[cx-6.6,cy+9.2],[cx-3.4,cy+6]]){c.moveTo(x+.55,y);c.arc(x,y,.55,0,TAU);}c.fill();}}
function topS(c,L,pn,wr,fr){const P=spaths(),Q=PAINT[pn]||PAINT.red;
  // the far fork leg, its top above the tyre
  fr(()=>{c.save();c.clip(outside(64,25,26.4),'evenodd');c.translate(2.2,1.4);forkLeg(c,true,null,1);c.restore();});
  // the rear mudguard on its stay, the number plate hung off its end, a reflector
  stroke(c,[[-49.4,61.2],[-51.6,53.6]],'#0e0e11',1.4);
  rimFill(c,P.rfender,lg(c,0,30,0,56,[[0,'#060607'],[1,'#1e1f24']]),L,.8,.4);
  c.save();c.clip(P.rfender);c.strokeStyle=rgba('#9aa0aa',.45);c.lineWidth=.45;c.beginPath();c.arc(-60,25,29.1,1.16,2.88);c.stroke();c.restore();
  stroke(c,[[-82.6,42.6],[-86.4,44.6]],'#121215',1.3);
  c.fillStyle=lg(c,-88,39,-85.4,48,[[0,'#d3c48a'],[1,'#a3945c']]);c.fill(P.plate);c.strokeStyle='#1a170e';c.lineWidth=.45;c.stroke(P.plate);
  c.strokeStyle=rgba('#1a1810',.85);c.lineWidth=.42;c.beginPath();for(const x of [-87.6,-86.9,-86.2]){c.moveTo(x,41.2+(x+88)*.33);c.lineTo(x-.15,45.6+(x+88)*.33);}c.stroke();
  c.fillStyle='#7a1208';c.beginPath();c.arc(-86.6,50.8,.9,0,TAU);c.fill();
  // the wheels' still parts; the front mudguard, dented, on its stay
  wheelOverS(c,-60,25,false,L);
  fr(()=>{wheelOverS(c,64,25,true,L);rimFill(c,P.ffender,lg(c,40,50,90,40,[[0,'#1c1d22'],[.5,'#0c0c0e'],[1,'#16171b']]),L,.9,.5);
    c.save();c.clip(P.ffender);c.strokeStyle=rgba('#9aa0aa',.5);c.lineWidth=.45;c.beginPath();c.arc(64,25,29,.66,2.16);c.stroke();
      c.fillStyle=rgba('#000000',.5);c.beginPath();c.ellipse(79.4,48.6,2.6,1.4,-.6,0,TAU);c.fill();c.strokeStyle=rgba('#c8ccd6',.45);c.lineWidth=.3;c.beginPath();c.ellipse(79.4,48.6,2.6,1.4,-.6,Math.PI*1.1,Math.PI*1.9);c.stroke();c.restore();
    stroke(c,[[54.8,52.6],[58.4,40.8]],'#0e0e11',1.5);});
  // the frame, heavier than the elven one; the shock in a chrome spring
  const FR=[[42.2,72],[37.6,54],[32,32],[26.4,17],[10,10.4],[-9,12],[-13.6,24]];
  stroke(c,FR,'#17171b',3.6);stroke(c,FR,rgba('#6a6c76',.3),.7);
  stroke(c,[[-6,62.4],[-58,62.2]],'#17171b',2.8);stroke(c,[[-13.6,34],[-44,61.2]],'#17171b',3);
  stroke(c,[[-41.6,30.6],[-36.4,60.4]],'#0c0c0e',3.4);
  c.strokeStyle=lg(c,-42,30,-36,60,CHROME);c.lineWidth=1;c.beginPath();for(let i=0;i<=8;i++){const t=.2+i/8*.62,x=lerp(-41.6,-36.4,t),y=lerp(30.6,60.4,t);c.moveTo(x-3.4,y-.8);c.lineTo(x+3.4,y+.8);}c.stroke();
  // the swingarm, the chain under its guard, the sprocket
  rimFill(c,P.swing,lg(c,0,21,0,37,[[0,'#09090b'],[.6,'#1f2025'],[1,'#141519']]),L,.7,.4);stroke(c,[[-16,32.2],[-58.6,26.4]],rgba('#8d939e',.45),.45);
  drive(c,'#26272c',rgba('#a4aab4',.5),rgba('#8d939e',.7),'#9aa0aa');
  c.fillStyle='#0e0e10';c.fill(P.cguard);c.strokeStyle=rgba('#6a6f7a',.5);c.lineWidth=.3;c.stroke(P.cguard);
  // the engine: alloy cases, a black finned barrel, a chrome valve cover, a carburettor and a pod filter, scratched covers
  {c.fillStyle=lg(c,0,12,0,42,[[0,'#151619'],[.45,'#2e3036'],[.8,'#43464e'],[1,'#2a2c31']]);c.fill(P.case);c.strokeStyle=rgba('#000000',.65);c.lineWidth=.6;c.stroke(P.case);
    // the gearbox bulging behind, the split line, cast ribs under the sump, oil grime low down, light along the top
    c.save();c.clip(P.case);
    c.strokeStyle=rgba('#0c0c0e',.7);c.lineWidth=.5;c.beginPath();c.moveTo(-15.6,34);c.bezierCurveTo(-8,40,2,40.6,6,37.6);c.stroke();
    stroke(c,[[-15,27.6],[28,28.2]],rgba('#0e0f11',.7),.5);stroke(c,[[-15,28.3],[28,28.9]],rgba('#8d939e',.25),.3);
    c.strokeStyle=rgba('#0b0b0d',.75);c.lineWidth=.6;c.beginPath();for(let i=0;i<4;i++){const y=14.4+i*1.7;c.moveTo(16,y);c.lineTo(27,y+.3);}c.stroke();
    c.fillStyle=lg(c,0,12,0,24,[[0,rgba('#000000',.45)],[1,rgba('#000000',0)]]);c.fillRect(-16,12,45,12);
    c.strokeStyle=rgba(K.rim,.25);c.lineWidth=.6;c.beginPath();c.moveTo(-10,41);c.lineTo(23,41);c.stroke();
    c.restore();
    c.fillStyle=lg(c,6,41,34,61,[[0,'#111114'],[1,'#1d1e23']]);c.fill(P.barrel);
    c.save();for(let i=0;i<9;i++){const t=(i+.5)/9,ax=lerp(15.2,23.2,t),ay=lerp(41,60,t),hx=11.6+i*.2;c.strokeStyle='#050506';c.lineWidth=1.3;c.beginPath();c.moveTo(ax-hx,ay-.8);c.lineTo(ax+hx,ay+.4);c.stroke();
      c.strokeStyle=rgba('#9aa0aa',.28+.25*clamp(L.y,0,1));c.lineWidth=.45;c.beginPath();c.moveTo(ax-hx,ay+.15);c.lineTo(ax+hx,ay+1.35);c.stroke();}c.restore();
    rimFill(c,P.head,lg(c,11,59,35,68,[[0,'#151619'],[1,'#25262c']]),L,.6,.35);
    const vc=rr(13.6,64.8,32.4,69,1.8);c.fillStyle=lg(c,0,64.8,0,69,[[0,'#3a3d45'],[.45,'#f2f5f8'],[1,'#6a707c']]);c.fill(vc);
    c.fillStyle='#16171a';for(const x of [16.4,22.8,29.4]){c.beginPath();c.arc(x,66.9,.5,0,TAU);c.fill();}
    const cb=rr(.6,49.8,8.6,56.8,1);c.fillStyle=lg(c,0,49.8,0,56.8,[[0,'#3c3f46'],[.5,'#9aa0aa'],[1,'#2b2e35']]);c.fill(cb);
    c.fillStyle=lg(c,0,46.8,0,58.8,[[0,'#08080a'],[.5,'#212227'],[1,'#0c0c0e']]);c.fill(P.filter);
    c.strokeStyle=rgba('#000000',.7);c.lineWidth=.4;c.beginPath();for(let x=-7.8;x<1;x+=1.4){c.moveTo(x,47.6);c.lineTo(x,58.2);}c.stroke();
    c.fillStyle=lg(c,-13,17,4,33,[[0,'#6a6f7a'],[1,'#2e3036']]);c.beginPath();c.arc(-4.6,25,8.4,0,TAU);c.fill();c.strokeStyle=rgba('#000000',.5);c.lineWidth=.5;c.stroke();
    c.fillStyle='#16171a';c.beginPath();for(let i=0;i<7;i++){const a=i/7*TAU+.2,x=-4.6+Math.cos(a)*7.1,y=25+Math.sin(a)*7.1;c.moveTo(x+.5,y);c.arc(x,y,.5,0,TAU);}c.fill();
    c.fillStyle=lg(c,5,18,19,33,[[0,'#3a3d45'],[.45,'#c6ccd6'],[.6,'#8d939e'],[1,'#2b2e35']]);c.beginPath();c.arc(12,25.6,7.4,0,TAU);c.fill();c.strokeStyle=rgba('#000000',.55);c.lineWidth=.5;c.stroke();
    c.strokeStyle=rgba('#1a1b1f',.6);c.lineWidth=.35;c.beginPath();c.arc(12,25.6,5.2,0,TAU);c.stroke();
    c.fillStyle='#16171a';c.beginPath();for(let i=0;i<3;i++){const a=i/3*TAU+.5,x=12+Math.cos(a)*6.3,y=25.6+Math.sin(a)*6.3;c.moveTo(x+.5,y);c.arc(x,y,.5,0,TAU);}c.fill();
    c.strokeStyle=rgba('#ffffff',.35);c.lineWidth=.25;c.beginPath();c.moveTo(8.4,28.6);c.lineTo(14.2,23.4);c.moveTo(9.4,29.2);c.lineTo(12.6,26.4);c.stroke();}
  // the crash bar round the front of the engine
  strokeCr(c,P.guard,'#1d1e22',2.3);c.save();c.translate(L.x*.5,L.y*.5);strokeCr(c,P.guard,rgba('#c6ccd6',.55),.6);c.restore();
  // the side cover, a race number on it and the paint chipped
  rimFill(c,P.panel,lg(c,-34,44,-6,62,[[0,Q.d],[1,Q.p]]),L,.6,.35);
  {c.fillStyle='#d8d0b6';c.beginPath();c.ellipse(-20.4,52,5,3.8,0,0,TAU);c.fill();c.strokeStyle=rgba('#000000',.4);c.lineWidth=.3;c.stroke();
    c.fillStyle='#16140f';c.fillRect(-22.4,49.6,1.1,4.8);c.fillRect(-19.4,49.6,1.1,4.8);
    c.fillStyle=rgba('#8a8478',.7);c.beginPath();for(const [x,y] of [[-30,57],[-12,47],[-27,49]]){c.moveTo(x+.4,y);c.arc(x,y,.4,0,TAU);}c.fill();}
  // the exhaust: a chrome header, a fat black silencer freckled with rust, a clamp, a chrome end cap
  {strokeCr(c,P.header,'#2b2e35',4.8);c.save();c.translate(L.x*.9,L.y*.9);strokeCr(c,P.header,rgba('#eef2f6',.5),1);c.restore();
    c.save();c.translate(0,1.2);strokeCr(c,P.header,rgba('#000000',.3),.5);c.restore();
    c.fillStyle=lg(c,-48.3,14.7,-45.3,26.3,[[0,'#0a0a0c'],[.45,'#26272c'],[.66,'#5d616b'],[.82,'#26272c'],[1,'#0a0a0c']]);c.fill(P.muffler);c.strokeStyle=rgba('#000000',.6);c.lineWidth=.4;c.stroke(P.muffler);
    c.fillStyle=rgba('#7a4220',.55);c.beginPath();for(const [x,y,r] of [[-40,21.6,.7],[-52,23.4,.5],[-61,26.6,.8],[-35,19.4,.4]]){c.moveTo(x+r,y);c.arc(x,y,r,0,TAU);}c.fill();
    {const t=.22,x=lerp(-20.6,-73,t),y=lerp(13.6,27.4,t),r=lerp(3.4,5.8,t)+.4;c.save();c.translate(x,y);c.rotate(Math.atan2(13.8,-52.4)+Math.PI/2);c.fillStyle=lg(c,-r,0,r,0,CHROME);c.fillRect(-r,-.8,r*2,1.6);c.restore();}
    c.save();c.translate(-73,27.4);c.rotate(Math.atan2(13.8,-52.4));c.fillStyle=lg(c,0,-6,0,6,CHROME);c.beginPath();c.ellipse(0,0,1.6,5.9,0,0,TAU);c.fill();
      c.fillStyle='#050506';c.beginPath();c.ellipse(-.4,0,.9,2.6,0,0,TAU);c.fill();c.restore();}
  // the tank: the paint gone dull, a cream stripe pair, a dent, chips; a chrome badge, the filler cap
  rimFill(c,P.tank,lg(c,0,63,0,86,[[0,Q.d],[.5,Q.p],[.85,Q.l],[1,Q.hi]]),L,1,.55);
  {c.save();c.clip(P.tank);
    c.fillStyle=lg(c,0,76,0,86,[[0,rgba('#ffffff',0)],[.6,rgba('#ffffff',.05)],[1,rgba('#ffffff',0)]]);c.fillRect(-8,76,52,10);
    c.strokeStyle=rgba(K.rim,.16);c.lineWidth=1.4;c.beginPath();c.moveTo(2,81);c.quadraticCurveTo(18,84.8,34,83.4);c.stroke();
    c.strokeStyle=rgba('#e6dcc0',.85);c.lineWidth=.6;c.beginPath();c.moveTo(-6,73.6);c.bezierCurveTo(8,76.2,24,77.4,43,75.4);c.moveTo(-6,72);c.bezierCurveTo(8,74.6,24,75.8,43,73.8);c.stroke();
    c.fillStyle=rgba('#000000',.36);c.fill(P.dent);
    c.strokeStyle=rgba(Q.hi,.6);c.lineWidth=.45;c.beginPath();c.ellipse(24,77.6,5.2,2.3,.1,Math.PI*1.08,Math.PI*1.92);c.stroke();
    c.strokeStyle=rgba('#c8c0b0',.45);c.lineWidth=.22;c.beginPath();c.moveTo(19,79.6);c.lineTo(16.4,81.2);c.moveTo(29.4,76.4);c.lineTo(32.6,75.2);c.moveTo(27,80);c.lineTo(28.6,82.2);c.stroke();
    c.fillStyle=rgba('#8a8478',.85);c.beginPath();for(const [x,y,r] of [[3,64.6,.5],[38.4,71,.4],[33,84,.35],[-4.6,70,.4],[10,83.2,.3]]){c.moveTo(x+r,y);c.arc(x,y,r,0,TAU);}c.fill();
    c.restore();
    c.fillStyle=lg(c,0,67,0,72,CHROME);c.beginPath();c.ellipse(7,69.4,4.8,2.1,0,0,TAU);c.fill();
    c.fillStyle='#141012';c.beginPath();c.ellipse(7,69.4,3.7,1.25,0,0,TAU);c.fill();c.fillStyle=rgba('#b9473a',.9);c.fillRect(4.4,69.1,5.2,.6);
    c.fillStyle=lg(c,0,85,0,87.2,CHROME);c.beginPath();c.ellipse(21.6,86,2.6,1,0,0,TAU);c.fill();}
  // the seat: black vinyl split open on the yellow foam, a strip of grey tape across the front
  rimFill(c,P.seat,lg(c,0,62.4,0,68.2,[[0,'#060607'],[.6,'#141417'],[1,'#2c2c32']]),L,.7,.4);
  {c.save();c.clip(P.seat);
    c.fillStyle='#a8925a';c.fill(poly([[-28.2,68.6],[-29.6,66.4],[-32.4,67],[-34.4,65.9],[-36.8,69.2]]));
    c.strokeStyle=rgba('#000000',.6);c.lineWidth=.3;c.beginPath();c.moveTo(-28.2,68.6);c.lineTo(-29.6,66.4);c.lineTo(-32.4,67);c.lineTo(-34.4,65.9);c.lineTo(-36.8,69.2);c.stroke();
    c.fillStyle=rgba('#7c7e84',.92);c.fill(poly([[-11.4,62.2],[-15,62.2],[-15.6,68.6],[-12,68.4]]));
    c.strokeStyle=rgba('#c8ccd2',.35);c.lineWidth=.22;c.beginPath();c.moveTo(-11.6,63);c.lineTo(-12.1,68);c.moveTo(-13.4,62.6);c.lineTo(-13.8,68.2);c.stroke();
    c.strokeStyle=rgba('#ffffff',.08);c.lineWidth=1;c.beginPath();c.moveTo(-6,67.2);c.bezierCurveTo(-18,67,-32,67.6,-44,69.4);c.stroke();
    c.restore();}
  // the tail, chipped; a boxy tail light in a chrome rim
  rimFill(c,P.tail,lg(c,0,59,0,73,[[0,Q.d],[.6,Q.p],[1,Q.l]]),L,.9,.5);
  {c.fillStyle=rgba('#8a8478',.8);c.beginPath();for(const [x,y,r] of [[-60,70.6,.45],[-52,61.4,.35]]){c.moveTo(x+r,y);c.arc(x,y,r,0,TAU);}c.fill();
    const tl=rr(-69,61.8,-66.8,67.2,.5);c.fillStyle=wr?'#3a0a08':lg(c,-69,62,-67,67,[[0,'#ff8a6a'],[.5,K.red],[1,'#7a0e08']]);c.fill(tl);c.strokeStyle=rgba('#c6ccd6',.6);c.lineWidth=.35;c.stroke(tl);}
  // the footpeg, rubber on a steel hanger; the levers
  {stroke(c,[[-14,36.6],[-24.4,29.6]],'#1a1b1f',2.4);stroke(c,[[-14,36.6],[-24.4,29.6]],rgba('#8d939e',.35),.4);
    stroke(c,[[-17,30.6],[-6,26.6]],'#5d636e',1.1);stroke(c,[[-6,26.6],[-5,27.8]],'#9aa0aa',1);
    const pg=rr(-25.8,26.6,-18.4,29.4,1.3);c.fillStyle=lg(c,0,26.6,0,29.4,[[0,'#2a2a30'],[1,'#0c0c0e']]);c.fill(pg);c.strokeStyle=rgba('#000000',.6);c.lineWidth=.3;c.beginPath();for(let x=-25;x<-18.8;x+=1){c.moveTo(x,26.8);c.lineTo(x,29.2);}c.stroke();}
  // the near fork leg; the speedo; a riser bar back to the grip, the lever, a mirror on a stalk; the headlamp (its lens dark)
  fr(()=>{forkLeg(c,false,L,1);
    c.fillStyle='#0e0e10';c.fill(rr(45.4,88.4,50.8,93,2));c.fillStyle=lg(c,0,88.4,0,93,CHROME);c.beginPath();c.ellipse(45.8,90.7,.8,2.3,0,0,TAU);c.fill();
    stroke(c,[[45,86.4],[43.8,90.6],[38.6,91],[35.8,88.2]],'#1c1d22',2);stroke(c,[[44.6,87],[43.6,90.8],[38.6,91.4]],rgba('#c6ccd6',.45),.5);
    strokeCr(c,[[41.4,88.8],[37,85.8],[31,85.4]],'#9aa0aa',.6);
    const gp=poly([[27.8,84.4],[36.2,85.8],[36.2,88.6],[27.8,87.2]]);c.fillStyle=lg(c,0,84.4,0,88.6,[[0,'#060607'],[.5,'#26262c'],[1,'#060607']]);c.fill(gp);
    c.strokeStyle=rgba('#000000',.55);c.lineWidth=.3;c.beginPath();for(let x=28.6;x<36;x+=.9){c.moveTo(x,84.6+(x-27.8)*.17);c.lineTo(x,87.1+(x-27.8)*.17);}c.stroke();
    c.fillStyle=lg(c,0,84,0,88,CHROME);c.beginPath();c.ellipse(27.6,85.8,.9,1.6,.17,0,TAU);c.fill();
    strokeCr(c,[[40.4,90.8],[39.6,96.4],[38.6,100]],'#8d939e',.6);
    c.save();c.translate(38.2,101.4);c.rotate(.25);c.fillStyle='#111214';c.beginPath();c.ellipse(0,0,2.9,1.5,0,0,TAU);c.fill();c.strokeStyle=lg(c,-3,0,3,0,CHROME);c.lineWidth=.45;c.stroke();c.restore();
    stroke(c,[[47.4,75.4],[51,77.2]],'#141416',1.5);stroke(c,[[47.8,83.4],[51,81.2]],'#141416',1.2);
    rimFill(c,P.bucket,lg(c,49,72,58,86,[[0,'#2b2e35'],[.55,'#b8bec8'],[1,'#4a4f5a']]),L,.8,.5);
    c.fillStyle=lg(c,58,71,58,87,CHROME);c.beginPath();c.ellipse(58.8,79,1.9,7.8,0,0,TAU);c.fill();
    c.fillStyle=wr?'#0c0b08':lg(c,60,72,60,86,[[0,'#3a3218'],[.5,'#241e0e'],[1,'#141008']]);c.beginPath();c.ellipse(59.9,79,1.2,6.7,0,0,TAU);c.fill();
    if(wr)crack(c,59.9);});
}
function liveS(c,now,run,lk,wr,fr){
  if(!wr&&run>0){c.save();c.globalCompositeOperation='lighter';c.fillStyle=rg(c,-69,64.6,0,8,[[0,rgba('#ff4a2a',.4*run)],[1,rgba('#ff2a10',0)]]);c.fillRect(-77,56.6,16,16);c.restore();}
  fr(()=>{if(lk>0){c.fillStyle=lg(c,60,72,60,86,[[0,mix('#3a3218','#fff6d8',lk)],[.5,mix('#241e0e','#ffe7a6',lk)],[1,mix('#141008','#c9a050',lk)]]);c.beginPath();c.ellipse(59.9,79,1.2,6.7,0,0,TAU);c.fill();
    c.save();c.globalCompositeOperation='lighter';c.fillStyle=rg(c,61,79,0,22,[[0,rgba('#fff2c8',.5*lk)],[.2,rgba('#ffd27a',.22*lk)],[1,rgba('#ffc860',0)]]);c.beginPath();c.arc(61,79,22,0,TAU);c.fill();
    c.fillStyle=lg(c,60,79,92,79,[[0,rgba('#fff2c8',.22*lk)],[1,rgba('#ffd27a',0)]]);c.beginPath();c.moveTo(60.4,85);c.lineTo(92,92);c.lineTo(92,64);c.lineTo(60.4,73);c.closePath();c.fill();c.restore();}});
  if(!wr)shimmer(c,now,run,-75.6,28.2,'#a6a6ae');}

// ---------- the bike ----------
// a wreck: soot over the body, the paint scraped back to the metal
function soot(c,S,wr){const P=S?spaths():paths();c.save();c.globalAlpha=.55*wr;c.fillStyle='#050404';for(const p of [P.tank,P.tail,P.seat,P.panel,P.case,P.head,P.muffler,P.swing])c.fill(p);c.restore();
  c.save();c.globalAlpha=.6*wr;c.strokeStyle='#8a8e98';c.lineWidth=.3;c.beginPath();for(const [x,y,l] of [[4,80,7],[14,82,9],[-52,72,6],[-30,30,8],[22,70,5]]){c.moveTo(x,y);c.lineTo(x+l,y-1.6);c.moveTo(x+1,y-1.2);c.lineTo(x+l-1,y-2.4);}c.stroke();c.restore();}
// a bike that went down: bright scrapes along the side it slid on
function scrapes(c,lie){const a=clamp((lie-.2)/.5,0,1);if(a<=0)return;c.save();c.globalAlpha=.8*a;c.lineCap='round';c.strokeStyle='#d8dce4';c.lineWidth=.32;c.beginPath();
  for(const [x,y,l,s] of [[-4,76.6,15,.05],[-2,74.8,12,.04],[2,73.4,9,.06],[-60,69.6,10,.12],[-58,67.6,8,.1],[-46,21.6,12,-.2],[-44,19.4,9,-.2],[30,87.4,6,.02],[-28,64,9,.02],[-24,28.4,5,0]]){c.moveTo(x,y);c.lineTo(x+l,y+l*s);}
  c.stroke();c.strokeStyle=rgba('#ffffff',.5);c.lineWidth=.6;c.beginPath();c.moveTo(-3,75.6);c.lineTo(8,76.2);c.moveTo(-57,68.6);c.lineTo(-50,69.4);c.stroke();c.restore();}
function bike(c,B,o){o=o||{};const S=B.style==='street'?1:0,F=frame(B),now=o.now??0,run=clamp(B.run??0,0,1),lt=clamp(B.light??0,0,1),wr=clamp(B.wreck||0,0,1),lie=clamp(B.lie||0,0,1);
  // how fast the wheels are turning, from the last call (for the blur)
  const wa=B.wheel||0;let spin=0;if(B._wl!=null&&B._wt!=null&&now>B._wt)spin=Math.abs(wa-B._wl)/(now-B._wt);B._wl=wa;B._wt=now;
  const L=lightLocal(B,F,o),T=c.getTransform(),k=Math.hypot(T.a,T.b),kb=bucket(k),key=S?(B.paint==='black'?'black':'red'):(B.holster||null);
  const lk=wr?0:lt*(1-lie)*(.92+.08*Math.sin(now*31)*Math.sin(now*7.7)),top=S?topS:topE,live=S?liveS:liveE,rot=S?wheelRotS:wheelRotE;
  const q=((Math.round(Math.atan2(L.y,L.x)/(TAU/8))%8)+8)%8,Lq={x:Math.cos(q*TAU/8),y:Math.sin(q*TAU/8)},R=S?27:25.6,bl=clamp((spin-8)/16,0,.85);
  if(!wr&&!lie&&!F.p&&!T.b&&!T.c&&T.a>0&&Math.abs(T.d-T.a)<1e-9*T.a&&k<=3.4&&steady(k)){
    // the fast path: pixel-exact layers set down on whole pixels, the live parts snapped to match
    const dx=T.a*F.ox+T.e,dy=T.d*F.oy+T.f,X=Math.round(dx),Y=Math.round(dy),kk=k.toFixed(4),fa=F.fa,a=((-wa%P7)+P7)%P7,fi=Math.round(a/P7*NF)%NF;
    c.save();c.setTransform(1,0,0,1,0,0);c.imageSmoothingEnabled=true;
    for(let fw=0;fw<2;fw++){const cx=fw?64:-60,e=devLayer('W'+S+fw+fa+'|'+kk+'|'+fi,k,fa,cx-R,cx+R,25-R,25+R,g=>{g.translate(cx,25);g.rotate(fi/NF*P7);rot(g,fw);});
      c.drawImage(e.cv,X-e.ox,Y-e.oy);
      if(bl>0){const v=devLayer('V'+S+fw+fa+'|'+kk,k,fa,cx-R,cx+R,25-R,25+R,g=>{g.translate(cx,25);rot(g,fw,1);});c.globalAlpha=bl;c.drawImage(v.cv,X-v.ox,Y-v.oy);c.globalAlpha=1;}}
    const t=devLayer('T'+S+key+fa+'|'+kk+'|'+q,k,fa,-100,98,-1,S?106:96,g=>top(g,Lq,key,0,ID));c.drawImage(t.cv,X-t.ox,Y-t.oy);
    c.restore();c.save();c.translate((X-dx)/T.a,(Y-dy)/T.d);setT(c,F);live(c,now,run,lk,0,ID);c.restore();return;}
  c.save();setT(c,F);if(lie)c.scale(1,1-SQ*lie);c.imageSmoothingEnabled=true;
  if(wr){// a wreck is drawn straight, its front end bent back
    const fb=-wr*.38,fr=fn=>{c.save();c.translate(47.8,74.4);c.rotate(fb);c.translate(-47.8,-74.4);fn();c.restore();};
    c.save();c.translate(-60,25);c.rotate(-wa);rot(c,0);c.restore();
    fr(()=>{c.save();c.translate(64,25);c.rotate(-wa);rot(c,1);c.restore();});
    top(c,L,key,wr,fr);live(c,now,run,0,wr,fr);soot(c,S,wr);}
  else{for(let fw=0;fw<2;fw++){c.save();c.translate(fw?64:-60,25);c.rotate(-wa);stamp(c,layer('w'+S+fw+'|'+kb,kb,-R,R,-R,R,g=>rot(g,fw)));
      if(bl>0){c.globalAlpha=bl;stamp(c,layer('v'+S+fw+'|'+kb,kb,-R,R,-R,R,g=>rot(g,fw,1)));}c.restore();}
    stamp(c,layer('t'+S+key+'|'+kb+'|'+q,kb,-100,98,-1,S?106:96,g=>top(g,Lq,key,0,ID)));
    live(c,now,run,lk,0,ID);}
  if(lie>0)scrapes(c,lie);
  c.restore();}

// one fork leg: the lower slider from the axle, the stanchion (gold; chrome in a rubber gaiter on a street bike), the black upper, the clamps
function forkLeg(c,far,L,s){const ax=64,ay=25,ux=-.311,uy=.95,nx=.95,ny=.311,pt=(t,w)=>[ax+ux*t+nx*w,ay+uy*t+ny*w],q=(t0,t1,w0,w1)=>{w1=w1??w0;return poly([pt(t0,w0),pt(t1,w1),pt(t1,-w1),pt(t0,-w0)]);};
  const sl=q(-1,22,3.4,3.3),st=q(21,52,2.3),up=q(52,63,2.5);
  if(far){c.fillStyle='#08070a';c.fill(sl);c.fill(st);c.fill(up);c.fillStyle=s?rgba('#8d939e',.4):rgba(K.goldD,.55);c.fill(st);return;}
  c.fillStyle=lg(c,...pt(10,-3.4),...pt(10,3.4),[[0,'#060509'],[.6,'#1c1b22'],[1,'#2e2d38']]);c.fill(sl);
  c.fillStyle=lg(c,...pt(36,-2.3),...pt(36,2.3),s?CHROME:[[0,K.goldDD],[.35,K.gold],[.55,K.goldL],[1,K.goldD]]);c.fill(st);
  if(s){c.fillStyle=lg(c,...pt(27,-3),...pt(27,3),[[0,'#050506'],[.6,'#17171b'],[1,'#26262c']]);c.fill(q(20.4,34,3.1,2.7));
    c.strokeStyle=rgba('#000000',.7);c.lineWidth=.35;c.beginPath();for(let t=21.6;t<34;t+=1.5){c.moveTo(...pt(t,-3));c.lineTo(...pt(t,3));}c.stroke();}
  c.fillStyle=lg(c,...pt(57,-2.5),...pt(57,2.5),[[0,'#060509'],[1,'#25242c']]);c.fill(up);
  if(!s){c.fillStyle=K.gold;c.fill(q(19.6,22.4,3.6));}
  for(const [t,w] of [[52,4.6],[62.6,4]]){const cl=q(t-1.6,t+1.6,w);c.fillStyle=t>60?lg(c,...pt(t,-w),...pt(t,w),s?CHROME:[[0,K.goldD],[.5,K.goldL],[1,K.goldD]]):'#0d0c11';c.fill(cl);}
  c.fillStyle=s?'#3a3d45':K.goldD;c.beginPath();c.arc(64,25,2.2,0,TAU);c.fill();c.fillStyle=s?'#aab0ba':K.gold;c.beginPath();c.arc(64,25,1.2,0,TAU);c.fill();
  if(L){const q0=pt(0,3.2),q1=pt(22,3.1);c.strokeStyle=rgba(K.rim,.32);c.lineWidth=.6;c.beginPath();c.moveTo(q0[0],q0[1]);c.lineTo(q1[0],q1[1]);c.stroke();}
}

// ---------- the rifle, in its own frame: u along the barrel from the pistol grip (0) to the muzzle (62), the stock back to -30; v up ----------
let RP=null;
function riflePaths(){if(RP)return RP;const R={};
  R.stock=(()=>{const P=new Path2D();cr(P,[[-30,3.2],[-24,4.8],[-12,4.6],[-5,3.4],[-3.6,-2.4],[-10,-3.2],[-20,-5.4],[-30,-7.2]]);P.ellipse(-12.6,-.8,4.6,1.5,-.08,0,TAU);return P;})();
  R.butt=poly([[-31.4,3.4],[-29.4,3.4],[-29.4,-7.4],[-31.4,-7.4]]);
  R.grip=cr(new Path2D(),[[-2.4,-2.6],[2.6,-2.6],[.6,-7],[-1,-11.2],[-5.8,-10.6],[-4.6,-6]]);
  R.guard=[[2.2,-3.2],[2.8,-6.8],[6.8,-7.2],[9.4,-3.6]];
  R.recv=rr(-6,-3.4,24.6,3.8,1.6);
  R.cell=poly([[12,-3.4],[18.6,-3.4],[20.6,-12.4],[14,-13]]);
  R.scope=(()=>{const P=new Path2D();cr(P,[[1,5.6],[1.4,9.8],[4.6,9.6],[18,9.6],[21,10.8],[25.6,11],[25.6,4.4],[21,4.6],[18,5.6],[4.6,5.6]]);return P;})();
  R.guardH=rr(24,-3,46.4,2.8,1);
  R.barrel=poly([[46,1.3],[56.6,1.2],[56.6,-1.2],[46,-1.3]]);
  R.brake=rr(56,-2.2,62.4,2.2,.6);
  RP=R;return R;}
function rifleShape(c,o){const R=riflePaths(),now=o.now||0;
  // the stock: black, its cheek line catching the light, a gold butt plate
  c.fillStyle=lg(c,0,-7,0,5,[[0,'#060509'],[.7,'#17161c'],[1,'#2a2932']]);c.fill(R.stock,'evenodd');c.strokeStyle=rgba('#000000',.6);c.lineWidth=.3;c.stroke(R.stock);
  c.fillStyle=lg(c,-31,0,-29,0,[[0,K.goldD],[.5,K.goldL],[1,K.goldD]]);c.fill(R.butt);
  stroke(c,[[-28.6,4.2],[-13,4.6],[-5.6,3.2]],rgba(K.rim,.35),.45);
  vine(c,[[-27,.2],[-18,1.4],[-8,1]],.24,1,rgba(K.gold,.85),2);
  c.fillStyle=lg(c,-6,-11,2,-3,[[0,'#060509'],[1,'#1e1d24']]);c.fill(R.grip);
  stroke(c,R.guard,'#0d0c10',.9);
  if(o.stowed){c.fillStyle=lg(c,0,-3.4,0,3.8,[[0,'#060509'],[.6,'#16151b'],[1,'#2a2932']]);c.fill(R.recv);return;}
  // the cell: cyan crystal in a gold frame, glowing
  c.fillStyle=lg(c,12,-13,19,-3,[[0,K.cyanD],[.5,K.cyan],[1,K.cyanL]]);c.fill(R.cell);c.strokeStyle=K.gold;c.lineWidth=.45;c.stroke(R.cell);
  c.save();c.globalCompositeOperation='lighter';c.fillStyle=rg(c,16,-8,0,9,[[0,rgba(K.cyanL,.35+.15*Math.sin(now*3))],[1,rgba(K.cyan,0)]]);c.beginPath();c.arc(16,-8,9,0,TAU);c.fill();c.restore();
  c.strokeStyle=rgba('#ffffff',.5);c.lineWidth=.3;c.beginPath();c.moveTo(13.4,-4.4);c.lineTo(15.2,-11.6);c.stroke();
  // the receiver, engraved; the scope on two gold rings, its cyan lens
  c.fillStyle=lg(c,0,-3.4,0,3.8,[[0,'#060509'],[.6,'#16151b'],[1,'#2a2932']]);c.fill(R.recv);
  vine(c,[[-3.6,.2],[6,.9],[14,.3],[22,.7]],.24,1,rgba(K.gold,.9),5);
  c.fillStyle=K.gold;c.fillRect(6,-2.6,5,.5);
  for(const u of [6.2,17.4]){c.fillStyle=lg(c,u-1,3.6,u+1,5.8,[[0,K.goldD],[.5,K.goldL],[1,K.goldD]]);c.fillRect(u-1.2,3.6,2.4,2.4);}
  c.fillStyle=lg(c,0,4.4,0,11,[[0,'#060509'],[.6,'#1a1920'],[1,'#3a3944']]);c.fill(R.scope);
  c.fillStyle=lg(c,25.6,4.4,25.6,11,[[0,K.cyanD],[.5,K.cyanL],[1,K.cyan]]);c.beginPath();c.ellipse(25.8,7.7,.8,3.2,0,0,TAU);c.fill();
  c.strokeStyle=rgba(K.gold,.8);c.lineWidth=.35;c.beginPath();c.moveTo(18,5.6);c.lineTo(18,9.6);c.moveTo(4.6,5.6);c.lineTo(4.6,9.6);c.stroke();
  // the handguard with its slots, the rail along its top, the barrel and the ported brake
  c.fillStyle=lg(c,0,-3,0,3,[[0,'#060509'],[.6,'#17161c'],[1,'#2a2932']]);c.fill(R.guardH);
  c.fillStyle='#020203';for(let u=27;u<44;u+=4.4)c.fillRect(u,-1.5,2.6,1.6);
  c.fillStyle=K.gold;c.fillRect(24.4,2.6,21.6,.55);
  c.fillStyle=lg(c,0,-1.3,0,1.3,[[0,'#111117'],[.6,'#4a4c56'],[1,'#1a1a20']]);c.fill(R.barrel);
  c.fillStyle=lg(c,0,-2.2,0,2.2,[[0,'#08080a'],[.6,'#2a2a32'],[1,'#121218']]);c.fill(R.brake);
  c.fillStyle='#000000';c.fillRect(57.6,-1.6,1.2,3.2);c.fillRect(60,-1.6,1.2,3.2);c.fillStyle=K.gold;c.fillRect(55.8,-2.3,.7,4.6);
  stroke(c,[[-5,3.8],[24,3.8]],rgba(K.rim,.32),.4);stroke(c,[[2,10],[24,10.6]],rgba(K.rim,.35),.4);stroke(c,[[25,3.2],[56,1.6]],rgba(K.rim,.25),.35);
  // the shot: a star of cyan-white light at the muzzle, a gold core
  if(o.flash>0){const f=clamp(o.flash,0,1),x=62.6;c.save();c.globalCompositeOperation='lighter';
    c.fillStyle=rg(c,x+4,0,0,22*f,[[0,rgba('#ffffff',.95*f)],[.2,rgba(K.cyanL,.7*f)],[.5,rgba(K.cyan,.25*f)],[1,rgba(K.cyan,0)]]);c.beginPath();c.arc(x+4,0,22*f,0,TAU);c.fill();
    c.fillStyle=rgba('#fff3c8',.9*f);for(const [a,l,w] of [[0,26,2.6],[.55,13,1.4],[-.55,13,1.4],[1.2,7,1],[-1.2,7,1]]){c.save();c.translate(x,0);c.rotate(a);c.beginPath();c.moveTo(0,-w);c.lineTo(l*f,0);c.lineTo(0,w);c.closePath();c.fill();c.restore();}
    c.restore();}
}
// held: the grip at h, the muzzle at t (screen points); scope side toward 'up' for a fighter facing fa
function rifle(c,h,t,o){o=o||{};const dx=t.x-h.x,dy=t.y-h.y,l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,fa=o.fa<0?-1:1,s=l/62,nx=fa>0?uy:-uy,ny=fa>0?-ux:ux;
  c.save();c.transform(ux*s,uy*s,nx*s,ny*s,h.x,h.y);rifleShape(c,o);c.restore();}
// lying loose on the ground at (x, y), pointing at ang, the scope uppermost
function rifleAt(c,x,y,ang,o){o=Object.assign({},o||{});const ux=Math.cos(ang),uy=Math.sin(ang);o.fa=ux>=0?1:-1;rifle(c,{x,y},{x:x+ux*62,y:y+uy*62},o);}

// ---------- the headlamp's beam on the ground ahead, drawn additively under the fighters (cyan; a street bike's yellow and shorter) ----------
function headBeam(c,B,o){o=o||{};const lie=clamp(B.lie||0,0,1),lk=clamp(B.light??0,0,1)*(B.wreck?0:1)*(1-lie)*(1-lie);if(lk<=0)return;
  const S=B.style==='street',c0=S?'#fff1c4':K.cyanL,c1=S?'#ffd27a':K.cyan,k2=S?.8:1,fa=B.fa<0?-1:1,d=B.dep||0,g=B.gy,pr=(x,dd)=>({x:x+dd*PX(),y:g-dd*PY()});
  const x0=B.x+fa*62,x1=B.x+fa*(B.pitch>.2?120:S?260:330),sp=S?36:44,a=pr(x0,d),b=pr(x1,d-sp),e=pr(x1,d+sp),m=pr(lerp(x0,x1,.45),d);
  c.save();c.globalCompositeOperation='lighter';
  c.fillStyle=(()=>{const gr=c.createLinearGradient(a.x,a.y,pr(x1,d).x,pr(x1,d).y);gr.addColorStop(0,rgba(c0,.22*lk*k2));gr.addColorStop(.35,rgba(c1,.12*lk*k2));gr.addColorStop(1,rgba(c1,0));return gr;})();
  c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineTo(e.x,e.y);c.closePath();c.fill();
  c.translate(m.x,m.y);c.scale(1,.26);c.fillStyle=rg(c,0,0,0,120,[[0,rgba(c1,.16*lk*k2)],[1,rgba(c1,0)]]);c.beginPath();c.arc(0,0,120,0,TAU);c.fill();
  c.restore();}

return{bike,bikePt,headBeam,rifle,rifleAt,DIM};
})();
// ===== VEH BIKE END =====
