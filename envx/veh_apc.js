// ===== VEH APC =====
// The city police tactical unit's armoured carrier, which Hallowell owns, in the Noir Gilt look: a six-wheeled steel box in black-navy
// paint, a sloped glacis and a short armoured hood, a ram on the nose, vision blocks along the sides, a side door with its step, a spare
// wheel on the back. On the roof: the gunner's ring with its hatch lid standing open, a heavy machine gun on a pintle behind a gun
// shield, a lightbar (amber and cold blue), a spotlight and two whip aerials. CITY POLICE and TACTICAL UNIT stencilled on its flank
// beside a gold badge. A.wreck takes it to a burnt-out wreck: soot and heat-blued steel, the armour torn open and glowing inside, the
// door gone, the tyres burnt to the rims, the gun bent on its broken mount; A.burn sets flames licking out of every tear.
// It is drawn in its own frame, x forward along A.fa and y up from the ground, set into the floor at (A.x, A.gy, A.dep) with the game's
// projection. hatchAt, gunAt and box answer in world coordinates, the way fighters' points are kept (the depth is added when drawn).
const ApcLook=(()=>{
const TAU=Math.PI*2,lerp=(a,b,t)=>a+(b-a)*t,clamp=(v,a,b)=>v<a?a:v>b?b:v;
const rgba=(hex,a)=>{const n=parseInt(hex.slice(1),16);return`rgba(${n>>16&255},${n>>8&255},${n&255},${a})`;};
const mix=(a,b,t)=>{const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16),f=s=>Math.round(lerp(A>>s&255,B>>s&255,t));return'#'+((1<<24)|(f(16)<<16)|(f(8)<<8)|f(0)).toString(16).slice(1);};
const PX=()=>typeof PSX==='number'?PSX:.2,PY=()=>typeof PSY==='number'?PSY:.75;
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
// the frame: hull from x -216 (tail) to 214 (nose), the ram to 230; roof at 150; three axles; the gunner's ring and the gun's pivot
const DIM={x0:-216,x1:214,ram:230,belly:42,roof:150,R:33,axles:[-150,-82,128],hatch:[-42,150],ring:[-64,-18],pivot:[-14,186],gunLen:80,shield:[-30,6,158,214],drop:6};
const K={paint:'#161b27',paint1:'#1d2433',paintHi:'#3a4560',paintD:'#0b0e15',ink:'#05060a',grime:'#2a2622',steel:'#3a3f4a',steelL:'#9aa2b2',
  gold:'#e2b65a',goldL:'#ffe2a3',goldD:'#8a6a2e',rim:'#ffcf86',cold:'#cfe0ff',glass:'#0a1220',amber:'#ffb030',blue:'#5a8cff',tyre:'#0a0a0c',
  soot:'#0a0908',heat:'#3a2216',ember:'#ff7a2a',bare:'#6a6e78'};

// ---------- paths in the frame (y up), built once ----------
function poly(pts){const P=new Path2D();P.moveTo(pts[0][0],pts[0][1]);for(const q of pts.slice(1))P.lineTo(q[0],q[1]);P.closePath();return P;}
function rr(x0,y0,x1,y1,r){const P=new Path2D();P.roundRect?P.roundRect(x0,y0,x1-x0,y1-y0,r):P.rect(x0,y0,x1-x0,y1-y0);return P;}
function cr(P,pts,closed=true){const n=pts.length,g=i=>pts[closed?(i+n)%n:clamp(i,0,n-1)];P.moveTo(g(0)[0],g(0)[1]);
  for(let i=0;i<(closed?n:n-1);i++){const p0=g(i-1),p1=g(i),p2=g(i+1),p3=g(i+2);
    P.bezierCurveTo(p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6,p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6,p2[0],p2[1]);}
  if(closed)P.closePath();return P;}
let PATHS=null;
function paths(){if(PATHS)return PATHS;const P={};
  P.hull=poly([[-210,42],[-216,52],[-216,136],[-208,148],[86,150],[150,116],[196,105],[210,93],[214,60],[206,44],[180,42]]);
  P.upper=poly([[-216,88],[-216,136],[-208,148],[86,150],[150,116],[196,105],[210,93],[212,88]]);
  P.roofBevel=poly([[-216,136],[-208,148],[86,150],[92,146],[-206,140]]);
  P.glacis=poly([[86,150],[150,116],[196,105],[198,101],[150,111],[90,143]]);
  P.lower=poly([[-210,42],[-216,52],[-216,88],[212,88],[214,60],[206,44],[180,42]]);
  // the wheel wells, the fenders over them
  P.wells=new Path2D();P.fenders=[];for(const ax of DIM.axles){P.wells.moveTo(ax+40,30);P.wells.arc(ax,33,40,-.08,Math.PI+.08);P.wells.closePath();
    const F=new Path2D();F.arc(ax,33,40,.12,Math.PI-.12);F.arc(ax,33,46,Math.PI-.12,.12,true);F.closePath();P.fenders.push(F);}
  P.cabWin=poly([[96,140],[134,138],[146,122],[100,120]]);
  P.door=rr(-36,48,26,132,3);P.doorWin=rr(-14,112,4,125,1.5);
  P.vision=[-194,-164,-134,-104,42,70].map(x=>rr(x,116,x+15,129,1.4));
  P.vents=[];for(let k=0;k<6;k++){const x=154+k*6.6;P.vents.push(poly([[x,95],[x+3.4,95],[x+4.4,110],[x+1,110]]));}
  P.ram=new Path2D();for(const [a,b] of [[[212,46],[232,48]],[[232,48],[232,88]],[[232,88],[212,92]],[[214,62],[232,64]],[[214,76],[232,77]]]){P.ram.moveTo(a[0],a[1]);P.ram.lineTo(b[0],b[1]);}
  P.spare=rr(-226,62,-216,124,4.5);
  P.ringBase=poly([[-66,150],[-16,150],[-18,160],[-64,160]]);
  // the hatch lid swung up and back on its hinge: a heavy disc seen at a slant
  P.lid=(()=>{const Q=new Path2D();Q.ellipse(-80,180,7,23,-.42,0,TAU);return Q;})();P.lidRim=(()=>{const Q=new Path2D();Q.ellipse(-79,180,4.2,19,-.42,0,TAU);return Q;})();
  P.box=rr(-150,150,-96,160,1.5);
  P.lightbar=rr(46,150,92,158,2);
  P.shieldFront=poly([[-3,158],[6,158],[1,214],[-7,214]]);
  P.shieldWing=poly([[-4,162],[-8,208],[-30,200],[-29,166]]);
  P.shieldGlass=poly([[-9,184],[-11,202],[-26,196],[-25,182]]);
  // the wreck's tears: where the burning bike went in at the front, the blown side door, a hole in the rear flank
  P.tears=[cr(new Path2D(),[[150,58],[164,52],[186,56],[204,66],[208,84],[198,102],[180,108],[160,104],[152,92],[146,76]]),
    rr(-36,48,26,132,3),cr(new Path2D(),[[-150,112],[-134,108],[-114,114],[-110,128],[-122,138],[-142,136],[-152,126]])];
  PATHS=P;return P;}

// ---------- the frame on the screen ----------
// its origin on the ground at (A.x, A.gy) set back to A.dep; the blast lifts it (jolt, with a shake) and tips it about one end (tilt)
function frame(A,now){const fa=A.fa>0?1:-1,d=A.dep||0,j=clamp(A.jolt||0,0,1),wr=clamp(A.wreck||0,0,1);
  const sx=j?Math.sin((now||0)*61)*3*j:0,sy=j?Math.sin((now||0)*47+1)*2*j:0,lift=j*16-wr*DIM.drop;
  const tilt=A.tilt||0,piv=tilt>=0?DIM.x0:DIM.x1;return{fa,ox:A.x+d*PX()+sx,oy:A.gy-d*PY()-sy,lift,tilt,piv,c:Math.cos(tilt),s:Math.sin(tilt)};}
function setT(c,F){c.transform(F.fa,0,0,-1,F.ox,F.oy);c.translate(0,F.lift);if(F.tilt){c.translate(F.piv,0);c.rotate(F.tilt);c.translate(-F.piv,0);}}
// a point of the frame in the world (no depth offset)
function framePt(A,lx,ly){const F=frame(A,0),ax=lx-F.piv,ay=ly,rx=F.piv+ax*F.c-ay*F.s,ry=ax*F.s+ay*F.c+F.lift;return{x:A.x+F.fa*rx,y:A.gy-ry};}
// toward the light, in the frame
function lightLocal(A,F,o){let lx,ly;
  if(o&&o.dir){lx=o.dir.x;ly=o.dir.y;}else if(o&&o.light){lx=o.light.x-A.x;ly=o.light.y-(A.gy-100);}else{lx=.35;ly=-1;}
  const l=Math.hypot(lx,ly)||1;return{x:lx/l*F.fa,y:-ly/l};}
function lg(c,x0,y0,x1,y1,st){const g=c.createLinearGradient(x0,y0,x1,y1);for(const [o,col] of st)g.addColorStop(o,col);return g;}
function rg(c,x,y,r0,r1,st){const g=c.createRadialGradient(x,y,r0,x,y,r1);for(const [o,col] of st)g.addColorStop(o,col);return g;}
// fill a shape and leave an edge of light along the side toward the light
function rimFill(c,P,fill,L,w,a,col){c.fillStyle=rgba(col||K.rim,a);c.fill(P);c.save();c.clip(P);c.translate(-L.x*w,-L.y*w);c.fillStyle=fill;c.fill(P);c.restore();}
function stroke(c,pts,col,w){c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(const q of pts.slice(1))c.lineTo(q[0],q[1]);c.stroke();}
// words on the flank, readable whichever way the carrier faces (the frame is mirrored for fa -1 and turned y up)
// (x is where the word starts for a carrier facing right; facing left, the word is set from its other end so it covers the same plates)
function word(c,fa,txt,x,y,size,col,o){o=o||{};c.save();c.font=`${o.w||800} ${size}px ${o.font||'Arial, sans-serif'}`;c.textAlign='left';if(o.track)c.letterSpacing=o.track+'px';
  const w=c.measureText(txt).width;c.translate(fa>0?x:x+w,y);c.scale(fa,-1);
  if(o.shadow){c.fillStyle=o.shadow;c.fillText(txt,.6,.6);}c.fillStyle=col;c.fillText(txt,0,0);c.restore();}

// ---------- caches: the hull is painted once for each facing, light (to an eighth of a turn) and scale ----------
const CACHE=new Map(),BUDGET=40e6;let BYTES=0;
function canvas(w,h){if(typeof OffscreenCanvas!=='undefined')return new OffscreenCanvas(w,h);const v=document.createElement('canvas');v.width=w;v.height=h;return v;}
function bucket(k){return clamp(Math.pow(2,Math.ceil(Math.log2(Math.max(k,.01))*2)/2),.5,3);}
function layer(key,sc,x0,x1,y0,y1,fn){let e=CACHE.get(key);if(e){CACHE.delete(key);CACHE.set(key,e);return e;}
  const w=Math.max(1,Math.ceil((x1-x0)*sc)),h=Math.max(1,Math.ceil((y1-y0)*sc)),cv=canvas(w,h),g=cv.getContext('2d');
  g.setTransform(sc,0,0,-sc,-x0*sc,y1*sc);fn(g);e={sc,x0,y1,bytes:w*h*4,cv:cv.transferToImageBitmap?cv.transferToImageBitmap():cv};CACHE.set(key,e);BYTES+=e.bytes;
  while(BYTES>BUDGET&&CACHE.size>1){const [k0,v]=CACHE.entries().next().value;CACHE.delete(k0);BYTES-=v.bytes;}return e;}
function stamp(c,e){c.save();c.translate(e.x0,e.y1);c.scale(1/e.sc,-1/e.sc);c.drawImage(e.cv,0,0);c.restore();}
const LX0=-242,LX1=240,LY0=-8,LY1=230;

// ---------- a wheel: the tyre and its tread blocks, the steel disc, the hub and its studs; burnt, the rim alone and shreds of rubber ----------
function wheel(c,cx,L,burnt){const R=DIM.R,r=rng(cx|0);
  if(!burnt){c.fillStyle=K.tyre;c.beginPath();c.arc(cx,33,R,0,TAU);c.fill();
    c.fillStyle='#16161a';for(let i=0;i<22;i++){const a=i/22*TAU;c.save();c.translate(cx+Math.cos(a)*(R-2.6),33+Math.sin(a)*(R-2.6));c.rotate(a);c.fillRect(-2.6,-3.6,5.2,7.2);c.restore();}
    c.strokeStyle=rgba('#2c2c34',.9);c.lineWidth=1;c.beginPath();c.arc(cx,33,R-7,0,TAU);c.stroke();
    // road grime on the lower tread, the light along the top
    c.strokeStyle=rgba('#3a342c',.5);c.lineWidth=3;c.beginPath();c.arc(cx,33,R-2.4,Math.PI*1.15,Math.PI*1.85);c.stroke();
    c.strokeStyle=rgba(K.rim,.25);c.lineWidth=1.1;c.beginPath();c.arc(cx,33,R-.6,Math.atan2(L.y,L.x)-.7,Math.atan2(L.y,L.x)+.7);c.stroke();}
  else{// what the fire left: shreds of rubber stuck to the rim, the steel blued and blackened
    c.fillStyle='#050404';for(let i=0;i<9;i++){const a=r()*TAU,l=.4+r()*.7;c.beginPath();c.arc(cx,33-DIM.drop*.0,R-4,a,a+l);c.arc(cx,33,R-13,a+l,a,true);c.closePath();c.fill();}}
  const rr0=burnt?21:19;c.fillStyle=burnt?rg(c,cx,33,2,rr0,[[0,'#2a2422'],[.7,'#1a1614'],[1,'#3a3430']]):rg(c,cx,33,3,rr0,[[0,'#2c313c'],[.6,'#1b1f28'],[1,'#3c4250']]);
  c.beginPath();c.arc(cx,33,rr0,0,TAU);c.fill();
  c.strokeStyle=burnt?rgba('#6a4a3a',.5):rgba(K.steelL,.35);c.lineWidth=1;c.beginPath();c.arc(cx,33,rr0-1,0,TAU);c.stroke();
  c.fillStyle=burnt?'#120e0c':'#0d0f14';c.beginPath();c.arc(cx,33,8.4,0,TAU);c.fill();c.fillStyle=burnt?'#4a3a30':'#5a6070';for(let i=0;i<8;i++){const a=i/8*TAU;c.beginPath();c.arc(cx+Math.cos(a)*12.4,33+Math.sin(a)*12.4,1.3,0,TAU);c.fill();}
  c.fillStyle=burnt?'#2a201a':lg(c,cx-5,28,cx+5,38,[[0,'#3a4050'],[.5,'#8a92a2'],[1,'#2a2e38']]);c.beginPath();c.arc(cx,33,4.6,0,TAU);c.fill();}

// ---------- the hull, painted into a layer ----------
function hull(c,L,fa,wr){const P=paths(),W=wr?1:0,col=(a,b)=>W?b:a;
  // the wheel wells and the dark under the belly behind the wheels
  c.fillStyle='#040406';c.fill(P.wells);c.fillRect(-206,30,410,14);
  for(const ax of DIM.axles)wheel(c,ax,L,W);
  // the spare wheel on the tail, seen edge on, in its bracket
  c.fillStyle=col('#0a0a0d','#060505');c.fill(P.spare);c.strokeStyle=rgba(col('#2a2a32','#2a1e18'),1);c.lineWidth=.8;c.stroke(P.spare);
  c.fillStyle=col('#1b1f28','#1a1412');c.fillRect(-218,88,4,6);c.fillRect(-218,98,4,4);
  // the lower hull, angled out over the wheels: grime toward the road
  rimFill(c,P.lower,lg(c,0,40,0,90,[[0,col('#0c0d12','#070605')],[.5,col('#141823','#0c0a09')],[1,col('#191e2a','#100d0b')]]),L,1.2,.35,W?'#ff9a5a':K.rim);
  c.fillStyle=lg(c,0,40,0,70,[[0,rgba(col(K.grime,'#000000'),.55)],[1,rgba(K.grime,0)]]);c.fill(P.lower);
  // the upper hull: the flat flank facing us, the bevel to the roof catching the floods
  rimFill(c,P.upper,lg(c,0,88,0,150,[[0,col('#141925','#0b0908')],[.7,col(K.paint1,'#130f0d')],[1,col('#232a3a','#171210')]]),L,1.6,.45,W?'#ff9a5a':K.rim);
  c.fillStyle=lg(c,0,136,0,150,[[0,rgba(col(K.paintHi,'#2a2420'),.0)],[1,rgba(col(K.paintHi,'#2a2420'),.55)]]);c.fill(P.roofBevel);
  c.fillStyle=lg(c,86,150,198,101,[[0,rgba(col('#4a5672','#2a221c'),.55)],[1,rgba(col('#2a3244','#1a1412'),.3)]]);c.fill(P.glacis);
  // each plate a little different, a cold sheen of the floods sliding down the flank, wear along the edges, road grime low down
  {const r=rng(5),xs=[-216,-128,-50,36,96,214];c.save();c.clip(P.upper);for(let i=0;i<xs.length-1;i++){const v=r();c.fillStyle=v<.5?rgba('#000000',.08+.1*r()):rgba(W?'#3a2a20':'#5a6a8a',.04+.06*r());c.fillRect(xs[i],88,xs[i+1]-xs[i],64);}
    if(!W){c.globalCompositeOperation='lighter';for(const [x,w2,a2] of [[-150,40,.05],[-20,26,.04],[150,30,.05]]){c.fillStyle=lg(c,x-w2,0,x+w2,0,[[0,rgba(K.cold,0)],[.5,rgba(K.cold,a2)],[1,rgba(K.cold,0)]]);c.fillRect(x-w2,88,w2*2,62);}}
    c.restore();
    c.strokeStyle=rgba(W?'#6a5a50':'#7a86a0',.22);c.lineWidth=.5;c.beginPath();for(let i=0;i<40;i++){const x=-210+r()*420,y=r()<.5?146+r()*2:88+r()*3,l=2+r()*6;c.moveTo(x,y);c.lineTo(x+l,y+(r()-.5));}c.stroke();
    c.fillStyle=lg(c,0,42,0,96,[[0,rgba(W?'#000000':'#2e2a26',.6)],[1,rgba('#2e2a26',0)]]);c.fill(P.hull);}
  // the seams of the armour, the rows of bolts along them, the hinge line of the glacis
  c.strokeStyle=rgba('#000000',.55);c.lineWidth=.9;c.beginPath();for(const x of [-128,-50,36,96]){c.moveTo(x,46);c.lineTo(x,x<86?147:140);}c.moveTo(-214,88);c.lineTo(212,88);c.stroke();
  c.strokeStyle=rgba(col('#5a6680','#5a4a40'),.25);c.lineWidth=.5;c.beginPath();for(const x of [-128,-50,36,96]){c.moveTo(x+1,46);c.lineTo(x+1,x<86?147:140);}c.moveTo(-214,87);c.lineTo(212,87);c.stroke();
  c.fillStyle=rgba(col('#7a849a','#5a4a40'),.4);for(const x of [-128,-50,36,96])for(let y=52;y<140;y+=9.5){c.beginPath();c.arc(x-3,y,.75,0,TAU);c.fill();}
  for(let x=-206;x<206;x+=11){c.beginPath();c.arc(x,91,.7,0,TAU);c.fill();c.beginPath();c.arc(x,145,.7,0,TAU);c.fill();}
  // the fenders over the wheels, the mud flap behind the last
  for(const F of P.fenders){rimFill(c,F,col('#10131b','#0a0807'),L,1,.4,W?'#ff9a5a':K.rim);}
  c.fillStyle='#050507';c.fillRect(-196,20,3,24);
  // the cab's side window, armoured glass on the slope; the vision blocks along the flank
  c.fillStyle=lg(c,96,138,146,120,[[0,col('#1a2a44','#050403')],[.6,col(K.glass,'#080605')],[1,col('#24344e','#060504')]]);c.fill(P.cabWin);
  c.strokeStyle=col('#05060a','#0a0807');c.lineWidth=2.2;c.stroke(P.cabWin);
  if(!W){c.save();c.clip(P.cabWin);c.globalCompositeOperation='lighter';c.fillStyle=rgba(K.cold,.16);c.beginPath();c.moveTo(108,140);c.lineTo(116,140);c.lineTo(104,120);c.lineTo(96,120);c.closePath();c.fill();c.restore();}
  for(const V of P.vision){c.fillStyle=col('#05060a','#030302');c.save();c.translate(0,0);c.fill(V);c.restore();c.save();c.clip(V);c.fillStyle=W?'#0a0605':lg(c,0,116,0,129,[[0,'#2a3c5a'],[1,'#0a1426']]);c.fillRect(-230,117.4,460,10.2);
    if(!W){c.fillStyle=rgba(K.cold,.2);c.fillRect(-230,125.6,460,1.2);}c.restore();c.strokeStyle=rgba(col('#4a5672','#2a2018'),.6);c.lineWidth=.6;c.stroke(V);}
  // the hood's louvres, the headlamps in their cages on the nose, the turn lamps
  for(const V of P.vents){c.fillStyle='#030305';c.fill(V);}
  c.fillStyle=col('#0b0d13','#070505');c.fillRect(206,78,10,12);c.fillStyle=W?'#1a1210':lg(c,214,78,218,90,[[0,'#fff6e0'],[1,'#c8b890']]);c.fillRect(214,79,3,10);
  c.strokeStyle=col('#2a2e38','#1a1412');c.lineWidth=.7;c.beginPath();for(let y=78;y<=90;y+=3){c.moveTo(208,y);c.lineTo(219,y);}c.stroke();
  c.fillStyle=W?'#1a0e08':K.amber;c.fillRect(210,70,4,3);
  // the ram on the nose: heavy tube, a winch drum behind it
  c.strokeStyle=col('#0a0b10','#080605');c.lineWidth=4.6;c.lineCap='round';c.stroke(P.ram);c.strokeStyle=rgba(col('#6a7488','#4a3a30'),.4);c.lineWidth=1.1;c.save();c.translate(-L.x*-1.2,-L.y*-1.2);c.stroke(P.ram);c.restore();
  c.fillStyle=col('#14161e','#0c0908');c.fillRect(206,52,10,10);c.fillStyle=col('#2a2e38','#1a1410');c.fillRect(208,54,6,6);
  // the side door: its gap, three hinges, the vision block, the handle; a step under it, a grab rail beside it
  if(!W){c.strokeStyle='#05060a';c.lineWidth=1.4;c.stroke(P.door);c.strokeStyle=rgba('#4a5672',.35);c.lineWidth=.5;c.save();c.translate(.8,-.8);c.stroke(P.door);c.restore();
    for(const y of [60,90,120]){c.fillStyle='#0b0d13';c.fillRect(24,y-3,5,6);c.fillStyle=rgba('#7a849a',.4);c.fillRect(24,y-3,5,.8);}
    c.fillStyle='#05060a';c.fill(P.doorWin);c.fillStyle=lg(c,0,112,0,125,[[0,'#2a3c5a'],[1,'#0a1426']]);c.fillRect(-12.6,113.4,15.2,10.2);
    c.fillStyle='#0a0b10';c.fillRect(-30,86,8,3.4);c.fillStyle=rgba('#9aa2b2',.5);c.fillRect(-30,88.6,8,.8);}
  c.fillStyle=col('#0d0f15','#090706');c.fillRect(-42,34,72,5);c.fillStyle=rgba(col('#6a7488','#4a3a30'),.4);c.fillRect(-42,38.4,72,.7);
  stroke(c,[[-46,70],[-48,72],[-48,118],[-46,120]],col('#0a0b10','#080605'),2.4);
  // the stencils: CITY POLICE, TACTICAL UNIT, the number, the gold badge with the house's H on it
  {const a=W?.22:.82,pale=rgba('#d4dae6',a);word(c,fa,'CITY POLICE',-198,96,15,pale,{w:800,track:1.6,shadow:rgba('#000000',.4)});
    word(c,fa,'TACTICAL UNIT',-198,80,8.4,rgba('#d4dae6',a*.8),{w:700,track:2.6});
    word(c,fa,'T-07',104,98,10,rgba('#d4dae6',a*.75),{w:800,track:1});
    // the badge: a gilt shield, a star round the H
    c.save();c.translate(62,100);if(W)c.globalAlpha=.35;c.fillStyle=lg(c,0,-12,0,12,[[0,K.goldL],[.5,K.gold],[1,K.goldD]]);c.beginPath();c.moveTo(0,12);c.lineTo(9.6,7.4);c.lineTo(8.6,-6);c.lineTo(0,-12.4);c.lineTo(-8.6,-6);c.lineTo(-9.6,7.4);c.closePath();c.fill();
    c.strokeStyle=rgba('#3a2a10',.9);c.lineWidth=.7;c.stroke();c.fillStyle='#3a2a10';c.fillRect(-4.2,-5,1.8,10.4);c.fillRect(2.4,-5,1.8,10.4);c.fillRect(-4.2,-.8,8.4,1.6);
    c.strokeStyle=rgba('#fff6d6',.7);c.lineWidth=.5;c.beginPath();c.moveTo(-9.2,7);c.lineTo(-8.2,-5.8);c.lineTo(0,-11.8);c.stroke();c.restore();}
  // the roof: the spotlight on its post, the lightbar's housing, the mirror arm, the aerial mounts
  c.fillStyle=col('#0b0d13','#080605');c.fillRect(-172,150,4,8);c.save();c.translate(-170,163);c.rotate(-.2);c.fillStyle=col('#1a1e28','#0c0908');c.fillRect(-8,-4,14,8);c.fillStyle=W?'#120c0a':rgba('#e8eef8',.85);c.fillRect(5,-3,2,6);c.restore();
  c.fillStyle=col('#0c0e14','#080605');c.fill(P.lightbar);
  if(!W){c.fillStyle=rgba(K.amber,.42);c.fillRect(48,151.6,10,4.8);c.fillStyle=rgba(K.blue,.42);c.fillRect(59,151.6,10,4.8);c.fillStyle=rgba(K.amber,.42);c.fillRect(70,151.6,10,4.8);c.fillStyle=rgba(K.blue,.42);c.fillRect(81,151.6,10,4.8);}
  else{c.fillStyle='#1a1410';c.fillRect(48,151.6,43,4.8);c.fillStyle=rgba('#ffb030',.25);c.fillRect(52,152,4,2);c.fillRect(74,153,3,2);}
  stroke(c,[[100,146],[106,160],[110,160]],col('#0a0b10','#080605'),1.6);c.fillStyle=col('#14171f','#0c0908');c.fillRect(106,158,6,9);
  c.fillStyle=col('#0a0b10','#080605');c.fillRect(-208,148,6,5);c.fillRect(-194,148,6,5);
  // the gunner's ring with its hatch lid standing open behind it; the pintle post up to the gun's cradle
  rimFill(c,P.ringBase,col('#151924','#0c0908'),L,1,.45,W?'#ff9a5a':K.rim);
  if(!W){rimFill(c,P.lid,'#121620',L,1.2,.5);c.strokeStyle=rgba('#000000',.7);c.lineWidth=.7;c.stroke(P.lid);c.fillStyle=lg(c,-84,170,-74,190,[[0,'#0b0d13'],[1,'#1c2130']]);c.fill(P.lidRim);
    c.fillStyle='#0a0b10';c.fillRect(-72,155,7,5);c.fillStyle=rgba('#7a86a0',.4);c.fillRect(-72,159.2,7,.8);}
  c.fillStyle=col('#0d1017','#090706');c.fillRect(-20,158,8,24);c.fillStyle=rgba(col('#6a7488','#4a3a30'),.45);c.fillRect(-20,158,1,24);
  // the edge of light along the roof and down the glacis, toward the floods
  if(L.y>-.2){c.strokeStyle=rgba(W?'#ff9a5a':K.rim,.35*clamp(L.y+.4,0,1));c.lineWidth=1;c.beginPath();c.moveTo(-206,148.6);c.lineTo(86,150.4);c.lineTo(150,116.4);c.lineTo(196,105.4);c.stroke();}
  // the roof box, the rail along the roof's edge
  c.fillStyle=col('#10131a','#0a0807');c.fill(P.box);c.fillStyle=rgba(col('#7a86a0','#5a4a40'),.35);c.fillRect(-150,159,54,.8);
  stroke(c,[[-206,152],[-160,154],[40,154],[80,153]],rgba(col('#0a0b10','#060504'),.9),1.2);
  c.strokeStyle=K.ink;c.lineWidth=1.3;c.stroke(P.hull);
  if(W)wreckOver(c,L);}
// the wreck: soot and heat over everything, bare steel where the paint burnt off, the tears with their petals of armour curling out and
// the glow inside them, the hatch blown open, the lightbar and glass gone
// the rims of the tears (the points their outlines are drawn through) and their centres
const TEAR_RIMS=[[[150,58],[164,52],[186,56],[204,66],[208,84],[198,102],[180,108],[160,104],[152,92],[146,76]],
  [[-36,52],[-36,92],[-36,128],[-20,132],[6,132],[26,128],[26,92],[26,52],[10,48],[-20,48]],
  [[-150,112],[-134,108],[-114,114],[-110,128],[-122,138],[-142,136],[-152,126]]],TEAR_C=[[178,80],[-5,90],[-130,124]];
function wreckOver(c,L){const P=paths(),r=rng(17);
  c.save();c.clip(P.hull);
  c.fillStyle=rg(c,170,84,10,190,[[0,rgba('#5a2a14',.5)],[.5,rgba('#2a1a12',.35)],[1,rgba('#000000',0)]]);c.fillRect(-230,30,460,130);
  c.fillStyle=rg(c,-6,90,10,140,[[0,rgba('#3a1e10',.45)],[1,rgba('#000000',0)]]);c.fillRect(-230,30,460,130);
  // streaks of soot run up the flank from the tears, bare steel scored where the blast tore the paint
  for(let i=0;i<26;i++){const x=-210+r()*420,y=44+r()*40,h=20+r()*70;c.fillStyle=lg(c,0,y,0,y+h,[[0,rgba('#000000',.55)],[1,rgba('#000000',0)]]);c.fillRect(x,y,4+r()*14,h);}
  c.strokeStyle=rgba(K.bare,.28);c.lineWidth=.6;c.beginPath();for(let i=0;i<30;i++){const x=-200+r()*400,y=50+r()*90,a=(r()-.5)*.6,l=6+r()*24;c.moveTo(x,y);c.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);}c.stroke();
  c.restore();
  // the tears: black inside, embers deep in them, the torn edges bent out and catching the fire
  P.tears.forEach((T,i)=>{c.fillStyle='#030202';c.fill(T);c.save();c.clip(T);
    const b=i===0?[180,80]:i===1?[-5,90]:[-130,124];c.fillStyle=rg(c,b[0],b[1]-8,2,i===1?46:34,[[0,rgba('#ffb060',.75)],[.35,rgba(K.ember,.45)],[1,rgba('#200804',0)]]);c.fillRect(b[0]-60,b[1]-60,120,120);
    // the frame's ribs and wreckage black against the glow
    c.strokeStyle='#050303';c.lineWidth=2.4;c.beginPath();for(let k=0;k<4;k++){const x=b[0]-24+k*14+r()*6;c.moveTo(x,b[1]-40);c.lineTo(x+r()*10-5,b[1]+40);}c.stroke();c.restore();
    // the armour round the hole torn and bent outward: flaps along its rim, their edges lit by the fire inside
    {const rim=TEAR_RIMS[i],n=rim.length;for(let k=0;k<n;k++){if(r()<.35)continue;const a=rim[k],b=rim[(k+1)%n],mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,dx=mx-TEAR_C[i][0],dy=my-TEAR_C[i][1],dl=Math.hypot(dx,dy)||1,
        out=5+r()*8,tx=mx+dx/dl*out+(r()-.5)*4,ty=my+dy/dl*out+(r()-.5)*4;
      c.fillStyle=k%2?'#15110e':'#1f1814';c.beginPath();c.moveTo(a[0],a[1]);c.quadraticCurveTo(lerp(a[0],tx,.6)+dy/dl*2,lerp(a[1],ty,.6)-dx/dl*2,tx,ty);c.quadraticCurveTo(lerp(b[0],tx,.6),lerp(b[1],ty,.6),b[0],b[1]);c.closePath();c.fill();
      c.strokeStyle=rgba('#ff9a5a',.4);c.lineWidth=.6;c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();c.strokeStyle=rgba('#c8b0a0',.18);c.lineWidth=.4;c.beginPath();c.moveTo(b[0],b[1]);c.quadraticCurveTo(lerp(b[0],tx,.6),lerp(b[1],ty,.6),tx,ty);c.stroke();}}});
  // the door is gone: its hinges bent where it hung
  c.fillStyle='#0a0706';for(const y of [60,90,120]){c.save();c.translate(26,y);c.rotate(.5);c.fillRect(0,-2,7,4);c.restore();}
  // the open hatch, glowing; the cab window crazed and black
  c.fillStyle='#020101';c.fillRect(-62,149,42,4);c.fillStyle=rgba('#ff9a5a',.5);c.fillRect(-58,150,34,2);
  c.strokeStyle=rgba('#6a6060',.35);c.lineWidth=.4;c.save();c.clip(P.cabWin);c.beginPath();for(let k=0;k<9;k++){const x=100+r()*42,y=121+r()*17;c.moveTo(120,130);c.lineTo(x,y);}c.stroke();c.restore();}

// ---------- the gun, live: it turns on its pivot; a heavy machine gun on a cradle, the ammunition can, the spade grips ----------
function gun(c,A,L,wr,o){const ang=wr?lerp(A.gun||0,-.34,wr):(A.gun||0),[px,py]=DIM.pivot;c.save();c.translate(px,py);c.rotate(ang);
  const dk=wr?'#0c0908':'#0b0d12',md=wr?'#1a1410':'#1c2029',hi=wr?'#3a2e26':'#4a5266';
  // the cradle and the grips at the back, toward the gunner
  c.fillStyle=dk;c.fillRect(-7,-11,14,7);stroke(c,[[-26,1],[-37,-1]],dk,3.2);stroke(c,[[-33,5],[-37,-10]],dk,2.6);stroke(c,[[-28,4],[-31,-10]],dk,2.6);
  // the receiver: a box with its feed cover, the sights on top
  c.fillStyle=lg(c,0,-6,0,8,[[0,dk],[.6,md],[1,hi]]);c.fillRect(-26,-6,42,14);c.fillStyle=md;c.fillRect(-20,8,26,3.4);c.fillStyle=rgba(K.cold,.2);c.fillRect(-26,7,42,.9);
  c.fillStyle='#030304';for(let x=-22;x<12;x+=4)c.fillRect(x,-3,2,6);
  c.fillStyle=dk;c.fillRect(-4,11,2.6,5);c.fillRect(56,2,1.8,4.4);
  // the can of belted rounds hung on its left, the belt running up into the feed
  c.fillStyle=lg(c,0,-21,0,-6,[[0,'#0a0b0e'],[1,wr?'#1a1410':'#2a2e22']]);c.fillRect(-15,-22,20,15);c.fillStyle=rgba(wr?'#3a2a1a':'#c8d0b8',.2);c.fillRect(-15,-8,20,.8);
  c.fillStyle=wr?'#3a2a1a':'#8a6a2e';for(let k=0;k<6;k++)c.fillRect(-13+k*3.2,-7,1.8,3.6);
  // the barrel in its perforated jacket, the flash hider; a wreck's is bent where the heat took it
  if(wr){c.save();c.translate(40,0);c.rotate(-.22*wr);c.translate(-40,0);}
  c.fillStyle=lg(c,0,-4,0,4,[[0,dk],[.6,hi],[1,md]]);c.fillRect(16,-4,32,8);c.fillStyle='#030304';for(let x=19;x<46;x+=5)c.fillRect(x,-1.8,2.6,3.2);
  c.fillStyle=lg(c,0,-2.2,0,2.2,[[0,dk],[.6,hi],[1,dk]]);c.fillRect(48,-2.2,24,4.4);c.fillStyle=dk;c.fillRect(70,-3.6,10,7.2);c.fillStyle='#000000';c.fillRect(73,-1.6,1.4,3.2);c.fillRect(76,-1.6,1.4,3.2);
  if(!wr&&o.muzzle>0){const f=clamp(o.muzzle,0,1),x=80;c.save();c.globalCompositeOperation='lighter';
    c.fillStyle=rg(c,x+6,0,0,30*f,[[0,rgba('#ffffff',.95*f)],[.25,rgba('#ffe2a0',.7*f)],[.6,rgba('#ff9a3a',.25*f)],[1,rgba('#ff9a3a',0)]]);c.beginPath();c.arc(x+6,0,30*f,0,TAU);c.fill();
    c.fillStyle=rgba('#fff3c8',.9*f);const sp=(Math.sin(o.now*97)*.5+.5)*.3;for(const [a,l,w] of [[0,34,3],[.6+sp,15,1.6],[-.6-sp,15,1.6],[1.4,8,1],[-1.4,8,1]]){c.save();c.translate(x,0);c.rotate(a);c.beginPath();c.moveTo(0,-w);c.lineTo(l*f,0);c.lineTo(0,w);c.closePath();c.fill();c.restore();}
    c.restore();}
  if(wr)c.restore();
  c.restore();}
// the gun shield, live, in front of the gun: its front plate and its wing; a wreck's wing hangs torn
function shield(c,L,wr){const P=paths();
  if(wr){c.save();c.translate(-2,166);c.rotate(.5*wr);c.translate(2,-166);}
  rimFill(c,P.shieldWing,lg(c,-26,166,-2,206,[[0,wr?'#0c0908':'#10131b'],[1,wr?'#1a1410':'#1d2230']]),L,1.2,.5,wr?'#ff9a5a':K.rim);
  c.strokeStyle=rgba('#000000',.6);c.lineWidth=.7;c.stroke(P.shieldWing);
  // the wing's window of ballistic glass, dark, the floods in it; a wreck's is crazed and black
  c.fillStyle=wr?'#050303':lg(c,-26,182,-9,202,[[0,'#0c1422'],[.6,'#1c2c46'],[1,'#0a1220']]);c.fill(P.shieldGlass);c.strokeStyle=rgba('#05060a',.9);c.lineWidth=1.2;c.stroke(P.shieldGlass);
  if(!wr){c.save();c.clip(P.shieldGlass);c.globalCompositeOperation='lighter';c.fillStyle=rgba(K.cold,.2);c.beginPath();c.moveTo(-20,204);c.lineTo(-16,204);c.lineTo(-22,180);c.lineTo(-26,180);c.closePath();c.fill();c.restore();}
  c.fillStyle=rgba(wr?'#3a2a20':'#7a849a',.5);for(const [x,y] of [[-6,170],[-8,203],[-27,170],[-27,197]]){c.beginPath();c.arc(x,y,.9,0,TAU);c.fill();}
  if(wr)c.restore();
  rimFill(c,P.shieldFront,wr?'#0e0b09':'#141822',L,1,.5,wr?'#ff9a5a':K.rim);c.fillStyle='#020203';c.fillRect(-4,193,6,2.2);}
// the whip aerials off the back of the roof, leaning back with the speed it is not making; a wreck's are snapped
function aerials(c,wr){c.strokeStyle='#08090c';c.lineWidth=1;c.lineCap='round';for(const [x,h] of [[-205,92],[-191,72]]){const H=wr?h*.28:h;c.beginPath();c.moveTo(x,152);c.quadraticCurveTo(x-4,152+H*.6,x-12,152+H);c.stroke();
  if(!wr){c.fillStyle='#08090c';c.beginPath();c.arc(x-12,152+H,1.1,0,TAU);c.fill();}}}
// the lightbar burning, amber and cold blue by turns; the headlamps
function lamps(c,A,o){const lt=clamp(A.lights||0,0,1);if(lt<=0)return;const t=o.now||0;c.save();c.globalCompositeOperation='lighter';
  const ph=t*7.4,seg=[[53,K.amber,0],[64,K.blue,Math.PI],[75,K.amber,Math.PI*.5],[86,K.blue,Math.PI*1.5]];
  for(const [x,col,p] of seg){const on=Math.pow(Math.max(0,Math.sin(ph+p)),3)*lt;if(on<.02)continue;
    c.fillStyle=rg(c,x,154,0,30,[[0,rgba(col,.75*on)],[.3,rgba(col,.3*on)],[1,rgba(col,0)]]);c.beginPath();c.arc(x,154,30,0,TAU);c.fill();
    c.fillStyle=rgba('#ffffff',.9*on);c.fillRect(x-4,152.4,8,3.4);}
  c.fillStyle=rg(c,217,84,0,26,[[0,rgba('#fff6e0',.7*lt)],[1,rgba('#fff6e0',0)]]);c.beginPath();c.arc(217,84,26,0,TAU);c.fill();
  c.restore();}
// fire: tongues of flame out of the tears, the hatch and the wheel arches, an ember glow round each; dark smoke rising off them
const FIRES=[[178,70,1.2],[-6,82,1.1],[-130,124,.8],[-41,152,1],[-150,64,.6],[-82,64,.6],[128,64,.75],[194,104,.7]];
function flames(c,burn,now){if(burn<=0)return;c.save();
  for(let i=0;i<FIRES.length;i++){const [x,y,s]=FIRES[i],k=burn*s,h=(28+16*Math.sin(now*3.1+i))*k;
    c.globalCompositeOperation='lighter';
    c.fillStyle=rg(c,x,y+h*.2,0,h*1.3,[[0,rgba('#ff9a3a',.45*burn)],[.5,rgba('#ff5a1a',.14*burn)],[1,rgba('#ff5a1a',0)]]);c.beginPath();c.arc(x,y+h*.2,h*1.3,0,TAU);c.fill();
    // the tongues share one gradient up the height of the fire: white-gold at the root, red and gone at the tips
    const g=c.createLinearGradient(0,y,0,y+h);g.addColorStop(0,rgba('#fff2b0',.9*burn));g.addColorStop(.3,rgba('#ffb040',.75*burn));g.addColorStop(.7,rgba('#ff5a1a',.45*burn));g.addColorStop(1,rgba('#a01a08',0));
    c.fillStyle=g;c.beginPath();
    for(let j=0;j<5;j++){const ph=now*(6+j*1.3)+i*2.3+j*1.7,sw=Math.sin(ph)*6*k,hh=h*(.55+.45*Math.abs(Math.sin(ph*.7+j))),w=(6+j%3*2)*k,bx=x+(j-2)*4*k;
      c.moveTo(bx-w,y);c.quadraticCurveTo(bx-w*.8+sw*.4,y+hh*.5,bx+sw,y+hh);c.quadraticCurveTo(bx+w*.8+sw*.4,y+hh*.5,bx+w,y);c.closePath();}
    c.fill();
    // the smoke off it, rolling up and back
    c.globalCompositeOperation='source-over';for(let j=0;j<2;j++){const u=((now*.32+i*.21+j*.5)%1),sx=x-u*30*k+Math.sin(now+j)*4,sy=y+h+u*90*k,r2=(8+u*22)*k;
      c.fillStyle=rg(c,sx,sy,0,r2,[[0,rgba('#0a0807',.42*burn*(1-u))],[1,rgba('#0a0807',0)]]);c.beginPath();c.arc(sx,sy,r2,0,TAU);c.fill();}}
  c.restore();}
// the embers in a wreck's tears breathing even when it has stopped burning
function embers(c,wr,now){if(wr<.5)return;c.save();c.globalCompositeOperation='lighter';
  for(const [x,y,r] of [[180,80,26],[-5,90,30],[-130,124,20],[-41,151,18]]){const f=(.55+.45*Math.sin(now*2.3+x))*(.6+.4*Math.sin(now*5.1+y));
    c.fillStyle=rg(c,x,y,0,r,[[0,rgba(K.ember,.35*f*wr)],[1,rgba(K.ember,0)]]);c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}c.restore();}

// ---------- drawing it ----------
function draw(c,A,o){o=o||{};const now=o.now??0,F=frame(A,now),L=lightLocal(A,F,o),wr=clamp(A.wreck||0,0,1),burn=clamp(A.burn||0,0,1);
  const T=c.getTransform(),k=Math.hypot(T.a,T.b),kb=bucket(k),q=((Math.round(Math.atan2(L.y,L.x)/(TAU/8))%8)+8)%8,Lq={x:Math.cos(q*TAU/8),y:Math.sin(q*TAU/8)};
  // its shadow on the road
  if(!o.noShadow){c.save();c.translate(F.ox,F.oy);c.scale(1,.2);const g=c.createRadialGradient(0,0,10,0,0,250);g.addColorStop(0,'rgba(2,2,6,.6)');g.addColorStop(.75,'rgba(2,2,6,.35)');g.addColorStop(1,'rgba(2,2,6,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,250,0,TAU);c.fill();c.restore();}
  c.save();setT(c,F);c.imageSmoothingEnabled=true;
  aerials(c,wr>.5);
  if(wr<1)stamp(c,layer('H'+F.fa+'|'+q+'|'+kb,kb,LX0,LX1,LY0,LY1,g=>hull(g,Lq,F.fa,0)));
  if(wr>0){c.save();c.globalAlpha=wr;c.translate(0,0);stamp(c,layer('W'+F.fa+'|'+q+'|'+kb,kb,LX0,LX1,LY0,LY1,g=>hull(g,Lq,F.fa,1)));c.restore();}
  gun(c,A,L,wr>.5?wr:0,{muzzle:A.muzzle||0,now});shield(c,L,wr>.5?wr:0);
  if(wr<.5)lamps(c,A,{now});
  embers(c,wr,now);flames(c,burn,now);
  c.restore();}
// its contact shadow alone (for a shadow pass under everything): draw passes o.noShadow then
function shadow(c,A){const F=frame(A,0);c.save();c.translate(F.ox,F.oy);c.scale(1,.2);const g=c.createRadialGradient(0,0,10,0,0,250);g.addColorStop(0,'rgba(2,2,6,.6)');g.addColorStop(.75,'rgba(2,2,6,.35)');g.addColorStop(1,'rgba(2,2,6,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,250,0,TAU);c.fill();c.restore();}
// where things are, in the world
function hatchAt(A){return framePt(A,DIM.hatch[0],DIM.hatch[1]);}
function gunAt(A){const wr=clamp(A.wreck||0,0,1),ang=wr>.5?lerp(A.gun||0,-.34,wr):(A.gun||0),[px,py]=DIM.pivot,L=DIM.gunLen,m=framePt(A,px+Math.cos(ang)*L,py+Math.sin(ang)*L),b=framePt(A,px,py);
  return{x:m.x,y:m.y,ang:Math.atan2(m.y-b.y,m.x-b.x)};}
function box(A){const pts=[[DIM.x0,DIM.belly],[DIM.x1,DIM.belly],[DIM.x0,DIM.roof],[DIM.x1,DIM.roof]].map(p=>framePt(A,p[0],p[1]));
  return{l:Math.min(...pts.map(p=>p.x)),r:Math.max(...pts.map(p=>p.x)),t:Math.min(...pts.map(p=>p.y)),b:A.gy};}
return{draw,shadow,hatchAt,gunAt,box,DIM};
})();
// ===== VEH APC END =====
