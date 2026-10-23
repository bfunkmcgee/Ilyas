// ===== VEH TRAIN =====
// Hallowell's private line: a small elven-built locomotive and its open flatcars, in the Noir Gilt look. The engine is a crystal engine,
// not a steam one: a long iron hood banded in brass over a cyan light-core that shows through its louvres, a glass dome on top with the
// crystal in it, a short brass heat-stack, a cab at the back with warm windows, gold-rimmed driving wheels coupled by rods, a gilt
// pilot shaped like a leaf, and a round headlamp in a gold bezel that throws the cyan elven light down the line. The flatcars are
// riveted iron with iron-plate decks in a diamond tread, stake pockets and a low rail, on small bogies.
// Drawn in its own frame: x forward along T.fa (the locomotive's nose at T.x, the cars trailing behind it), y up from the rail top, set
// into the floor at (T.x, T.gy, T.dep) with the game's projection. The train has width: its near side is drawn at T.dep - hw and its
// roofs and decks run back to T.dep + hw, so the tops show as the floor's do.
const TrainLook=(()=>{
const TAU=Math.PI*2,lerp=(a,b,t)=>a+(b-a)*t,clamp=(v,a,b)=>v<a?a:v>b?b:v;
const rgba=(hex,a)=>{const n=parseInt(hex.slice(1),16);return`rgba(${n>>16&255},${n>>8&255},${n&255},${a})`;};
const mix=(a,b,t)=>{const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16),f=s=>Math.round(lerp(A>>s&255,B>>s&255,t));return'#'+((1<<24)|(f(16)<<16)|(f(8)<<8)|f(0)).toString(16).slice(1);};
const PX=()=>typeof PSX==='number'?PSX:.2,PY=()=>typeof PSY==='number'?PSY:.75;
// the sizes, in world units (the game is about 1.23 cm a unit): the engine 236 long and 214 to its cab roof, each flatcar 300 long
// with its deck 41 above the rail top (a platform's height on the line), 16 between them at the couplings, 44 either side of the centre line
const DIM={loco:236,car:300,gap:16,deck:41,hw:44,roof:214,wheel:19,carWheel:12,rail:0,
  axles:[-58,-104,-150],trailer:-204,bogies:[-62,-238],bogieAx:22};
const K={iron:'#121218',iron1:'#1a1a22',iron2:'#24242e',ironHi:'#4a4a5a',ink:'#050508',gold:'#e2b65a',goldL:'#ffe2a3',goldD:'#8a6a2e',goldDD:'#4a3818',
  cyan:'#7ff3e3',cyanL:'#d9fffa',cyanD:'#2a8a80',warm:'#ffcf86',glass:'#0a1218',rust:'#4a2a18'};
function lg(c,x0,y0,x1,y1,st){const g=c.createLinearGradient(x0,y0,x1,y1);for(const [o,col] of st)g.addColorStop(o,col);return g;}
function rg(c,x,y,r0,r1,st){const g=c.createRadialGradient(x,y,r0,x,y,r1);for(const [o,col] of st)g.addColorStop(o,col);return g;}
function P(pts){const p=new Path2D();p.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)p.lineTo(pts[i][0],pts[i][1]);p.closePath();return p;}
function rr(x0,y0,x1,y1,r){const p=new Path2D();if(p.roundRect)p.roundRect(x0,y0,x1-x0,y1-y0,r);else p.rect(x0,y0,x1-x0,y1-y0);return p;}

// ---------- where things are ----------
function span(T){const n=T.cars??2,L=DIM.loco+n*(DIM.car+DIM.gap),fa=T.fa<0?-1:1;return{x0:Math.min(T.x,T.x-fa*L),x1:Math.max(T.x,T.x-fa*L),len:L};}
// the front of car i (0 the first behind the engine) in the train's own x
function carFront(i){return-(DIM.loco+DIM.gap+i*(DIM.car+DIM.gap));}
// a point of the train's frame (lx forward, ly up, dz toward the far side from the centre line) in the world, projected
function trainPt(T,lx,ly,dz){const fa=T.fa<0?-1:1,d=(T.dep||0)+(dz||0);return{x:T.x+fa*lx+d*PX(),y:T.gy-ly-d*PY()};}
// car i's deck: the world x range, the deck's world y and the depths it spans
function deckAt(T,i){const fa=T.fa<0?-1:1,f=carFront(i),hw=T.hw??DIM.hw,a=T.x+fa*(f-6),b=T.x+fa*(f-DIM.car+6);
  return{x0:Math.min(a,b),x1:Math.max(a,b),y:T.gy-DIM.deck,dep:T.dep||0,d0:(T.dep||0)-hw+6,d1:(T.dep||0)+hw-6};}

// ---------- caches: the still body painted once per scale, facing and light, then stamped ----------
const CACHE=new Map();let BYTES=0;const BUDGET=40e6;
function canvas(w,h){if(typeof OffscreenCanvas!=='undefined')return new OffscreenCanvas(w,h);const v=document.createElement('canvas');v.width=w;v.height=h;return v;}
function bucket(k){return clamp(Math.pow(2,Math.ceil(Math.log2(Math.max(k,.01))*2)/2),.5,8);}
function layer(key,sc,x0,x1,y0,y1,fn){let e=CACHE.get(key);if(e){CACHE.delete(key);CACHE.set(key,e);return e;}
  const w=Math.max(1,Math.ceil((x1-x0)*sc)),h=Math.max(1,Math.ceil((y1-y0)*sc)),cv=canvas(w,h),g=cv.getContext('2d');
  g.setTransform(sc,0,0,-sc,-x0*sc,y1*sc);fn(g);e={cv,x0,y1,sc,bytes:w*h*4};CACHE.set(key,e);BYTES+=e.bytes;
  while(BYTES>BUDGET&&CACHE.size>1){const [k0,v]=CACHE.entries().next().value;CACHE.delete(k0);BYTES-=v.bytes;}return e;}
function stamp(c,e){c.save();c.translate(e.x0,e.y1);c.scale(1/e.sc,-1/e.sc);c.drawImage(e.cv,0,0);c.restore();}

// ---------- the engine ----------
// in the frame of its near side (y up). ox, oy: where the far side lies from the near side, so tops and the end show. The hood is
// narrower than the cab and set in from its sides, with a walkway along it; fa says which end shows (the nose, or the cab's back).
const INSET=14;
function loco(c,ox,oy,L,fa){const X0=-DIM.loco,X1=0,cab0=X0+2,cab1=X0+82,h0=cab1,h1=X1-14,hy=128;
  // the inset hood's near face lies this far into the engine; its top is narrower by twice that
  const ix=ox*INSET/(2*DIM.hw),iy=oy*INSET/(2*DIM.hw),hox=ox-2*ix,hoy=oy-2*iy;
  const quad=(x0,y0,x1,y1,dx,dy,col)=>{c.fillStyle=col;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.lineTo(x1+dx,y1+dy);c.lineTo(x0+dx,y0+dy);c.closePath();c.fill();};
  const top=(x0,x1,y,dx,dy,col)=>quad(x0,y,x1,y,dx,dy,col);
  // ---- the tops, back to front: the running board, the hood's top with the dome and the stack on it, the cab's roof
  top(X0-4,X1-2,46,ox,oy,lg(c,0,46,0,46+oy,[[0,'#2a2a34'],[1,'#17171e']]));
  for(let k=1;k<6;k++){const u=k/6;c.strokeStyle=rgba('#000000',.35);c.lineWidth=.6;c.beginPath();c.moveTo(X0-4+ox*u,46+oy*u);c.lineTo(X1-2+ox*u,46+oy*u);c.stroke();}
  c.save();c.translate(ix,iy);
  top(h0,h1,hy,hox,hoy,lg(c,0,hy,0,hy+hoy,[[0,'#3a3a48'],[.5,'#2a2a36'],[1,'#1c1c25']]));
  // the hood's rounded crown: a highlight down its middle, rivet seams across
  c.strokeStyle=rgba(K.warm,.12+.12*Math.max(0,L.y));c.lineWidth=2;c.beginPath();c.moveTo(h0+hox*.45,hy+hoy*.45);c.lineTo(h1-8+hox*.45,hy+hoy*.45);c.stroke();
  for(let i=0;i<5;i++){const x=h0+10+i*(h1-h0-20)/4;c.strokeStyle=lg(c,0,hy,0,hy+hoy,[[0,K.goldL],[1,K.goldD]]);c.lineWidth=3;c.beginPath();c.moveTo(x,hy);c.lineTo(x+hox,hy+hoy);c.stroke();}
  // a hatch on the hood's top
  quad(h0+70,hy+hoy*.25,h0+100,hy+hoy*.25,hox*.5,hoy*.5,'#121218');
  // the crystal dome: a glass bell on a brass seat in the middle of the top (its core is lit live); the heat-stack toward the nose
  {const x=h0+48+hox*.5,y=hy+hoy*.5;c.fillStyle=lg(c,x-16,0,x+16,0,[[0,K.goldDD],[.5,K.gold],[1,K.goldD]]);c.beginPath();c.ellipse(x,y,18,7,0,0,TAU);c.fill();
    c.fillStyle=K.goldDD;c.fillRect(x-17,y-2,34,4);
    c.fillStyle=rgba('#9ae8f0',.18);c.beginPath();c.moveTo(x-13,y+2);c.bezierCurveTo(x-13,y+28,x+13,y+28,x+13,y+2);c.closePath();c.fill();
    c.strokeStyle=rgba('#d9fffa',.55);c.lineWidth=.8;c.stroke();c.fillStyle=K.gold;c.beginPath();c.arc(x,y+28,2.6,0,TAU);c.fill();}
  {const x=h1-26+hox*.5,y=hy+hoy*.5;c.fillStyle=lg(c,x-6,0,x+6,0,[[0,K.goldDD],[.45,K.goldL],[1,K.goldD]]);c.fillRect(x-5,y-2,10,20);c.fillRect(x-7,y+16,14,4);c.fillStyle=K.ink;c.beginPath();c.ellipse(x,y+20,6,2,0,0,TAU);c.fill();}
  c.restore();
  // the cab's roof: arched, its top going back, a gilt edge at the eaves and a vent on top
  top(cab0-6,cab1+6,DIM.roof,ox,oy,lg(c,0,DIM.roof,0,DIM.roof+oy,[[0,'#3c3c4a'],[.45,'#2e2e3a'],[1,'#1a1a22']]));
  c.strokeStyle=rgba(K.warm,.14+.14*Math.max(0,L.y));c.lineWidth=2.4;c.beginPath();c.moveTo(cab0-6+ox*.4,DIM.roof+oy*.4);c.lineTo(cab1+6+ox*.4,DIM.roof+oy*.4);c.stroke();
  for(let k=1;k<4;k++){const x=cab0-6+k*(cab1-cab0+12)/4;c.strokeStyle=rgba('#000000',.4);c.lineWidth=.8;c.beginPath();c.moveTo(x,DIM.roof);c.lineTo(x+ox,DIM.roof+oy);c.stroke();}
  quad(cab0+28,DIM.roof+oy*.35,cab0+52,DIM.roof+oy*.35,ox*.3,oy*.3,'#14141b');
  c.strokeStyle=rgba(K.gold,.5);c.lineWidth=1;c.beginPath();c.moveTo(cab0-6+ox,DIM.roof+oy);c.lineTo(cab1+6+ox,DIM.roof+oy);c.stroke();
  // ---- the end of the engine that shows, going back to the far side: the nose when she faces right, the cab's back when she faces left
  if(fa>0){c.save();c.translate(ix,iy);quad(h1,46,h1,hy-12,hox,hoy,'#1e1e28');
      c.fillStyle=rgba(K.gold,.5);c.beginPath();c.moveTo(h1,hy-12);c.lineTo(h1+hox,hy-12+hoy);c.lineTo(h1+hox,hy-13.4+hoy);c.lineTo(h1,hy-13.4);c.closePath();c.fill();c.restore();
    quad(X1-6,28,X1-6,46,ox,oy,'#4a1818');quad(X1+2,46,X1+2,47,ox,oy,K.goldD);}
  else{quad(cab0-7,46,cab0-7,DIM.roof+2,ox,oy,'#17171f');
    c.fillStyle=lg(c,0,150,0,182,[[0,'#ffcf86'],[1,'#a85a2a']]);c.beginPath();c.moveTo(cab0-7+ox*.2,150+oy*.2);c.lineTo(cab0-7+ox*.2,182+oy*.2);c.lineTo(cab0-7+ox*.75,182+oy*.75);c.lineTo(cab0-7+ox*.75,150+oy*.75);c.closePath();c.fill();
    c.strokeStyle=rgba(K.gold,.45);c.lineWidth=.8;c.beginPath();c.moveTo(cab0-7,DIM.roof+1);c.lineTo(cab0-7+ox,DIM.roof+1+oy);c.stroke();}
  // ---- the hood's near face, set in from the cab's side
  c.save();c.translate(ix,iy);
  c.fillStyle=lg(c,0,46,0,hy,[[0,'#0c0c12'],[.55,'#1b1b24'],[.85,'#272733'],[1,'#33333f']]);c.beginPath();c.moveTo(h0,46);c.lineTo(h0,hy);c.lineTo(h1-10,hy);c.quadraticCurveTo(h1,hy,h1,hy-12);c.lineTo(h1,46);c.closePath();c.fill();
  c.strokeStyle=rgba(K.warm,.18+.2*Math.max(0,L.y));c.lineWidth=1.2;c.beginPath();c.moveTo(h0,hy-.6);c.lineTo(h1-10,hy-.6);c.stroke();
  // brass bands round the hood, and between them the louvres where the core's light comes through (lit live)
  for(let i=0;i<5;i++){const x=h0+10+i*(h1-h0-20)/4;c.fillStyle=lg(c,x-2,0,x+2,0,[[0,K.goldDD],[.5,K.goldL],[1,K.goldD]]);c.fillRect(x-1.6,46,3.2,hy-46);}
  for(let i=0;i<4;i++){const x0=h0+16+i*(h1-h0-20)/4,x1=x0+(h1-h0-20)/4-12;for(let k=0;k<6;k++){const y=70+k*8;c.fillStyle='#040408';c.fillRect(x0,y,x1-x0,3.4);c.fillStyle=rgba(K.ironHi,.25);c.fillRect(x0,y+3.4,x1-x0,.8);}}
  // the house's H in a brass roundel on the hood's side
  {const x=(h0+h1)/2,y=104;c.fillStyle=K.ink;c.beginPath();c.arc(x,y,13,0,TAU);c.fill();c.strokeStyle=K.gold;c.lineWidth=2;c.stroke();
    c.fillStyle=K.goldL;c.fillRect(x-6,y-7,2.6,14);c.fillRect(x+3.4,y-7,2.6,14);c.fillRect(x-6,y-1.3,12,2.6);}
  // the headlamp: a drum on the nose, a gold bezel round the lens (the lens is lit live)
  {const x=X1-6,y=96;c.fillStyle=lg(c,0,y-12,0,y+12,[[0,'#2a2a34'],[1,'#0e0e14']]);c.fillRect(x-18,y-11,16,22);
    c.fillStyle=lg(c,x-4,y-12,x+4,y+12,[[0,K.goldL],[.5,K.gold],[1,K.goldDD]]);c.beginPath();c.ellipse(x,y,4,12,0,0,TAU);c.fill();
    c.fillStyle=K.glass;c.beginPath();c.ellipse(x+.6,y,2.6,9.6,0,0,TAU);c.fill();}
  c.fillStyle=rgba(K.warm,.12+.12*Math.max(0,L.x));c.fillRect(h1-1.4,50,1.2,hy-62);
  c.restore();
  // a hand rail along the walkway beside the hood
  c.strokeStyle=K.goldD;c.lineWidth=1.4;c.beginPath();c.moveTo(h0+4,96);c.lineTo(h1-6,96);c.stroke();for(let x=h0+16;x<h1-8;x+=34){c.beginPath();c.moveTo(x,46);c.lineTo(x,96);c.stroke();}
  // ---- the cab's near face: the panelled wall, the warm windows with the driver at the near one, the grab rail and steps
  c.fillStyle=lg(c,0,46,0,DIM.roof,[[0,'#0e0e14'],[.6,'#17171f'],[1,'#22222c']]);c.fillRect(cab0,46,cab1-cab0,DIM.roof-50);
  c.fillStyle=K.ink;c.fillRect(cab0-7,DIM.roof-6,cab1-cab0+14,8);c.fillStyle=lg(c,0,DIM.roof-6,0,DIM.roof+2,[[0,K.goldD],[.5,K.gold],[1,K.goldL]]);c.fillRect(cab0-7,DIM.roof-1.4,cab1-cab0+14,1.6);
  for(const [wx0,wx1] of [[cab0+10,cab0+36],[cab0+46,cab1-10]]){c.fillStyle=lg(c,0,120,0,180,[[0,'#ffcf86'],[.6,'#d88a40'],[1,'#7a3a1c']]);c.fillRect(wx0,124,wx1-wx0,56);
    c.fillStyle=rgba('#ffe9c0',.25);c.fillRect(wx0,170,wx1-wx0,10);
    c.strokeStyle=K.goldD;c.lineWidth=2.2;c.strokeRect(wx0,124,wx1-wx0,56);c.strokeStyle=rgba(K.goldL,.5);c.lineWidth=.7;c.beginPath();c.moveTo(wx0,180);c.lineTo(wx1,180);c.stroke();}
  c.fillStyle=rgba('#120a06',.92);c.beginPath();c.arc(cab0+56,150,9,0,TAU);c.fill();c.fillRect(cab0+47,124,18,22);
  c.strokeStyle=K.goldD;c.lineWidth=1.8;c.beginPath();c.moveTo(cab1-4,60);c.lineTo(cab1-4,112);c.stroke();
  c.fillStyle=K.iron2;c.fillRect(cab1-14,24,16,4);c.fillRect(cab1-12,34,12,3);
  c.strokeStyle=rgba(K.gold,.55);c.lineWidth=.9;c.strokeRect(cab0+6,56,cab1-cab0-12,54);c.strokeRect(cab0+6,188,cab1-cab0-12,14);
  // ---- the nose: the buffer beam, the buffers, the leaf-shaped pilot swept back from the rail
  c.fillStyle='#0b0b10';c.fillRect(X1-14,36,14,44);
  c.fillStyle=lg(c,0,30,0,46,[[0,'#3a1414'],[1,'#5a1a1a']]);c.fillRect(X1-6,28,8,18);c.fillStyle=K.gold;c.fillRect(X1-6,44.6,8,1.2);
  c.fillStyle=K.iron2;c.fillRect(X1+2,34,5,7);c.fillStyle=K.goldD;c.fillRect(X1+6,32,2.4,11);
  c.fillStyle=lg(c,X1-30,0,X1+6,0,[[0,K.goldDD],[.6,K.gold],[1,K.goldL]]);c.beginPath();c.moveTo(X1+4,4);c.quadraticCurveTo(X1-4,12,X1-28,28);c.lineTo(X1-8,28);c.quadraticCurveTo(X1,14,X1+6,6);c.closePath();c.fill();
  c.strokeStyle=K.ink;c.lineWidth=.8;c.beginPath();for(let k=1;k<4;k++){const u=k/4;c.moveTo(lerp(X1+4,X1-28,u),lerp(4,28,u));c.lineTo(lerp(X1+6,X1-8,u),lerp(6,28,u));}c.stroke();
  // ---- the frame under the board: plates with lightening holes, a brass line
  c.fillStyle='#0a0a0f';c.fillRect(X0-2,22,X1-X0-4,24);
  c.fillStyle='#050508';for(let x=X0+18;x<X1-24;x+=26){c.beginPath();c.ellipse(x,32,7,5,0,0,TAU);c.fill();}
  c.fillStyle=rgba(K.gold,.45);c.fillRect(X0-2,44,X1-X0-4,1);}

// ---------- a flatcar ----------
// in the frame of its near side, its front at x=0 (the car's own nose, toward the engine)
function flatcar(c,ox,oy,L,i,fa){const X0=-DIM.car,X1=0,D=DIM.deck,r=rnd(17+i*31);
  const top=(x0,x1,y,col)=>{c.fillStyle=col;c.beginPath();c.moveTo(x0,y);c.lineTo(x1,y);c.lineTo(x1+ox,y+oy);c.lineTo(x0+ox,y+oy);c.closePath();c.fill();};
  // the deck: iron plate with a diamond tread, the same as the car the fight rides on in the tunnel: plates 60 long with welded seams
  // and rivets along them, worn bright down the middle, oil and rust on it
  top(X0,X1,D,'#17171d');
  c.save();c.beginPath();c.moveTo(X0,D);c.lineTo(X1,D);c.lineTo(X1+ox,D+oy);c.lineTo(X0+ox,D+oy);c.closePath();c.clip();
  const NR=12;for(let k=0;k<NR;k++){const u=(k+.5)/NR;c.fillStyle=rgba(k%2?'#2c2c36':'#272731',.9);for(let x=X0+1+(k%2)*2.2;x<X1;x+=4.4)c.fillRect(x+ox*u,D+oy*u-.3,2.2,.6);}
  c.fillStyle=lg(c,0,D,0,D+oy,[[0,rgba('#030305',.45)],[.4,rgba('#030305',.2)],[.6,rgba('#030305',.2)],[1,rgba('#030305',.5)]]);c.beginPath();c.moveTo(X0,D);c.lineTo(X1,D);c.lineTo(X1+ox,D+oy);c.lineTo(X0+ox,D+oy);c.closePath();c.fill();
  c.fillStyle=rgba('#9aa4c0',.05);c.beginPath();c.moveTo(X0+ox*.36,D+oy*.36);c.lineTo(X1+ox*.36,D+oy*.36);c.lineTo(X1+ox*.62,D+oy*.62);c.lineTo(X0+ox*.62,D+oy*.62);c.closePath();c.fill();
  // the seams: across the car every 60, and one down its length; rivets along them
  c.strokeStyle='#07070a';c.lineWidth=.9;c.beginPath();for(let x=X0+60;x<X1;x+=60){c.moveTo(x,D);c.lineTo(x+ox,D+oy);}c.moveTo(X0+ox*.5,D+oy*.5);c.lineTo(X1+ox*.5,D+oy*.5);c.stroke();
  c.fillStyle=rgba('#6a6a7a',.45);for(let x=X0+60;x<X1;x+=60)for(let u=.08;u<1;u+=.14)c.fillRect(x+ox*u+1.2,D+oy*u,.9,.9);for(let x=X0+4;x<X1;x+=7)c.fillRect(x+ox*.5,D+oy*.5+1.1,.9,.9);
  for(let k=0;k<7;k++){const x=X0+20+r()*(X1-X0-40),u=.15+r()*.7;c.fillStyle=rgba(r()<.6?'#050406':'#2a1408',.3);c.beginPath();c.ellipse(x+ox*u,D+oy*u,8+r()*16,2+r()*3,0,0,TAU);c.fill();}
  c.restore();
  // iron angle round the deck's edges, gilt where it is worn
  c.fillStyle='#0c0c11';c.fillRect(X0,D-3,X1-X0,4);c.fillStyle=rgba(K.gold,.35);c.fillRect(X0,D,X1-X0,.9);
  c.strokeStyle='#0c0c11';c.lineWidth=2.4;c.beginPath();c.moveTo(X0+ox,D+oy);c.lineTo(X1+ox,D+oy);c.stroke();
  // the far rail: stanchions in their pockets, a top rail, a chain slung between the end posts
  const post=(x,far)=>{const bx=x+(far?ox:0),by=D+(far?oy:0);c.fillStyle=far?'#101016':'#0a0a0e';c.fillRect(bx-1.8,by,3.6,22);c.fillStyle=far?rgba(K.goldD,.7):K.goldD;c.fillRect(bx-2.4,by+20,4.8,2.6);};
  for(let x=X0+14;x<=X1-14;x+=(X1-X0-28)/6)post(x,1);
  c.strokeStyle='#14141a';c.lineWidth=2;c.beginPath();c.moveTo(X0+14+ox,D+oy+21);c.lineTo(X1-14+ox,D+oy+21);c.stroke();c.strokeStyle=rgba(K.gold,.4);c.lineWidth=.6;c.stroke();
  // the end rails, going back across the car at each end
  for(const ex of [X0+4,X1-4]){c.strokeStyle='#121218';c.lineWidth=1.8;c.beginPath();c.moveTo(ex,D+21);c.lineTo(ex+ox,D+oy+21);c.stroke();c.strokeStyle=rgba(K.gold,.3);c.lineWidth=.5;c.stroke();}
  // the near side: the sole bar, riveted, with the stake pockets
  c.fillStyle=lg(c,0,22,0,D,[[0,'#08080c'],[.7,'#15151c'],[1,'#20202a']]);c.fillRect(X0,22,X1-X0,D-24);
  c.fillStyle=rgba(K.ironHi,.55);for(let x=X0+6;x<X1;x+=10){c.fillRect(x,D-6,1.2,1.2);c.fillRect(x,25,1.2,1.2);}
  for(let x=X0+14;x<=X1-14;x+=(X1-X0-28)/6){c.fillStyle='#050508';c.fillRect(x-3,D-12,6,10);c.fillStyle=rgba(K.gold,.3);c.fillRect(x-3,D-2.4,6,.8);}
  for(let x=X0+14;x<=X1-14;x+=(X1-X0-28)/3)post(x,0);
  c.strokeStyle='#0c0c11';c.lineWidth=2;c.beginPath();c.moveTo(X0+14,D+21);c.lineTo(X1-14,D+21);c.stroke();c.strokeStyle=rgba(K.gold,.5);c.lineWidth=.6;c.stroke();
  // a number and the house's mark stencilled on the sole bar
  c.fillStyle=rgba(K.gold,.55);{const x=X0+40;c.fillRect(x,28,1.4,8);c.fillRect(x+5,28,1.4,8);c.fillRect(x,31.3,6.4,1.4);}
  // the couplings at each end, and the bogie frames
  c.fillStyle='#0a0a0e';c.fillRect(X1-2,28,8,6);c.fillRect(X0-6,28,8,6);c.fillStyle=K.goldD;c.fillRect(X1+4,27,3,8);
  for(const bx of DIM.bogies){c.fillStyle='#0b0b10';c.fillRect(bx-34,10,68,12);c.fillStyle=rgba(K.ironHi,.3);c.fillRect(bx-34,21,68,.8);
    c.fillStyle='#16161c';c.fillRect(bx-8,14,16,10);c.fillStyle=rgba(K.gold,.4);c.fillRect(bx-8,23,16,.8);}
  // the end of the deck that shows, going back across the car
  {const ex=fa>0?X1:X0;c.fillStyle='#0c0c11';c.beginPath();c.moveTo(ex,D-3);c.lineTo(ex,D+1);c.lineTo(ex+ox,D+1+oy);c.lineTo(ex+ox,D-3+oy);c.closePath();c.fill();}
  c.fillStyle=rgba(K.warm,.1+.1*Math.max(0,L.y));c.fillRect(X0,D-.4,X1-X0,.6);}
function rnd(a){return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

// ---------- the wheels and rods (they turn, so they are drawn every frame) ----------
function wheel(c,x,R,a,big,blur){c.save();c.translate(x,R);
  c.fillStyle='#07070b';c.beginPath();c.arc(0,0,R,0,TAU);c.fill();
  c.strokeStyle=big?K.gold:K.goldD;c.lineWidth=big?2.2:1.6;c.beginPath();c.arc(0,0,R-1.6,0,TAU);c.stroke();
  c.fillStyle='#14141a';c.beginPath();c.arc(0,0,R-3.6,0,TAU);c.fill();
  if(blur<.8){c.globalAlpha=1-blur;c.strokeStyle=big?K.goldD:'#2a2a34';c.lineWidth=big?1.8:1.4;c.beginPath();const n=big?10:6;for(let k=0;k<n;k++){const b=-a+k*TAU/n;c.moveTo(Math.cos(b)*3,Math.sin(b)*3);c.lineTo(Math.cos(b)*(R-3.6),Math.sin(b)*(R-3.6));}c.stroke();c.globalAlpha=1;}
  if(blur>0){c.fillStyle=rgba(big?K.goldD:'#2a2a34',.35*blur);c.beginPath();c.arc(0,0,R-3.6,0,TAU);c.fill();}
  c.fillStyle=big?K.goldL:K.goldD;c.beginPath();c.arc(0,0,big?4:2.6,0,TAU);c.fill();c.restore();}
function running(c,T,ox,oy,n,wa,blur){
  // the engine's three drivers, the trailing wheel under the cab, the coupling rod over the crank pins
  const R=DIM.wheel,ax=DIM.axles,cr=8;
  for(const x of ax)wheel(c,x,R,wa,1,blur);
  wheel(c,DIM.trailer,13,wa*R/13,0,blur);
  const pin=x=>({x:x+Math.cos(-wa)*cr,y:R+Math.sin(-wa)*cr});const p0=pin(ax[0]),p2=pin(ax[2]);
  c.strokeStyle=lg(c,0,R-3,0,R+3,[[0,K.goldD],[.5,K.goldL],[1,K.goldD]]);c.lineWidth=3.4;c.lineCap='round';c.beginPath();c.moveTo(p0.x,p0.y);c.lineTo(p2.x,p2.y);c.stroke();
  c.fillStyle=K.ink;for(const x of ax){const q=pin(x);c.beginPath();c.arc(q.x,q.y,1.6,0,TAU);c.fill();}
  // the cars' bogies
  for(let i=0;i<n;i++){const f=carFront(i);for(const bx of DIM.bogies)for(const s of [-1,1])wheel(c,f+bx+s*DIM.bogieAx,DIM.carWheel,wa*R/DIM.carWheel,0,blur);}}

// ---------- the lights: the core through the louvres, the crystal, the headlamp and its beam, the cab's glow ----------
function lights(c,T,o,ox,oy){const now=o.now||0,run=clamp(T.run??0,0,1),lk=clamp(T.lamp??0,0,1),cab0=-DIM.loco+2,cab1=cab0+80,h0=cab1,h1=-14,hy=128;
  const ix=ox*INSET/(2*DIM.hw),iy=oy*INSET/(2*DIM.hw),hox=ox-2*ix,hoy=oy-2*iy;c.save();c.translate(ix,iy);
  const pulse=.7+.3*Math.sin(now*2.2)*Math.sin(now*.83+1),core=(.35+.65*run)*pulse;
  c.save();c.globalCompositeOperation='lighter';
  for(let i=0;i<4;i++){const x0=h0+16+i*(h1-h0-20)/4,x1=x0+(h1-h0-20)/4-12;for(let k=0;k<6;k++){const y=70+k*8,f=(.5+.5*Math.sin(now*6+k+i*1.7))*run;c.fillStyle=rgba(K.cyan,(.35+.25*f)*core);c.fillRect(x0+1,y+.6,x1-x0-2,2.2);}}
  c.fillStyle=rg(c,(h0+h1)/2,90,4,90,[[0,rgba(K.cyan,.12*core)],[1,rgba(K.cyan,0)]]);c.fillRect(h0,40,h1-h0,100);
  {const x=h0+48+hox*.5,y=hy+hoy*.5+12;c.fillStyle=rg(c,x,y,0,18,[[0,rgba(K.cyanL,.9*core)],[.3,rgba(K.cyan,.5*core)],[1,rgba(K.cyan,0)]]);c.beginPath();c.arc(x,y,18,0,TAU);c.fill();
    c.fillStyle=rgba(K.cyanL,.95*core);c.beginPath();c.moveTo(x,y+8);c.lineTo(x+3.4,y);c.lineTo(x,y-7);c.lineTo(x-3.4,y);c.closePath();c.fill();}
  // the cab's lamp
  c.fillStyle=rg(c,cab0+40,160,0,60,[[0,rgba('#ffcf86',.16)],[1,rgba('#ffcf86',0)]]);c.fillRect(cab0-10,110,100,90);
  if(lk>0){const x=-6,y=96,fl=lk*(.94+.06*Math.sin(now*29)*Math.sin(now*7.1));
    c.fillStyle=rgba(K.cyanL,.95*fl);c.beginPath();c.ellipse(x+.6,y,2.6,9.6,0,0,TAU);c.fill();
    c.fillStyle=rg(c,x+2,y,0,30,[[0,rgba(K.cyanL,.55*fl)],[.25,rgba(K.cyan,.25*fl)],[1,rgba(K.cyan,0)]]);c.beginPath();c.arc(x+2,y,30,0,TAU);c.fill();
    // the beam down the line, and the pool it makes on the rails ahead
    c.fillStyle=lg(c,x,0,x+260,0,[[0,rgba(K.cyan,.2*fl)],[1,rgba(K.cyan,0)]]);c.beginPath();c.moveTo(x+2,y+10);c.lineTo(x+260,y+40);c.lineTo(x+260,-4);c.lineTo(x+2,y-10);c.closePath();c.fill();
    c.fillStyle=rg(c,x+150,2,0,120,[[0,rgba(K.cyan,.14*fl)],[1,rgba(K.cyan,0)]]);c.save();c.translate(x+150,2);c.scale(1,.18);c.beginPath();c.arc(0,0,120,0,TAU);c.fill();c.restore();}
  c.restore();
  // heat over the stack when she is working
  if(run>0){c.save();c.globalAlpha=.18*run;c.strokeStyle='#a6b0c0';c.lineWidth=.8;c.beginPath();const x=h1-26+hox*.5,y=hy+hoy*.5;for(let k=0;k<3;k++){const ph=now*3+k*2.1;c.moveTo(x-3+k*3,y+20);c.bezierCurveTo(x-6+k*3+Math.sin(ph)*4,y+34,x+k*3+Math.sin(ph+1)*5,y+44,x-2+k*3+Math.sin(ph+2)*6,y+58);}c.stroke();c.restore();}
  c.restore();}

// ---------- the whole train ----------
function draw(c,T,o){o=o||{};const fa=T.fa<0?-1:1,n=T.cars??2,hw=T.hw??DIM.hw,d0=(T.dep||0)-hw,ox=fa*2*hw*PX(),oy=2*hw*PY(),now=o.now??0;
  // the light's direction in the frame (y up), to a quarter of the way round
  let lx=.3,ly=1;if(o.dir){lx=o.dir.x*fa;ly=-o.dir.y;}else if(o.light){const q=trainPt(T,-DIM.loco/2,120,0);lx=(o.light.x-q.x)*fa;ly=-(o.light.y-q.y);}
  const ll=Math.hypot(lx,ly)||1,L={x:lx/ll,y:ly/ll},q8=((Math.round(Math.atan2(L.y,L.x)/(TAU/8))%8)+8)%8,Lq={x:Math.cos(q8*TAU/8),y:Math.sin(q8*TAU/8)};
  const Tr=c.getTransform(),k=Math.hypot(Tr.a,Tr.b),kb=bucket(k);
  const wa=T.wheel||0;let spin=0;if(T._wl!=null&&T._wt!=null&&now>T._wt)spin=Math.abs(wa-T._wl)/(now-T._wt);T._wl=wa;T._wt=now;const blur=clamp((spin-6)/14,0,.85);
  // a train in a pit or a portal is cut off where the platform's edge or the wall hides it: o.clip(c) sets that clip in the world,
  // o.clipY cuts it off below a line on the screen
  c.save();if(o.clip)o.clip(c);else if(o.clipY!=null){c.beginPath();c.rect(-1e5,-1e5,2e5,o.clipY+1e5);c.clip();}
  c.translate(T.x+d0*PX(),T.gy-d0*PY());c.scale(fa,-1);
  // the shadow under it on the track
  c.fillStyle='rgba(0,0,0,.4)';c.beginPath();c.moveTo(-span(T).len-6,-1);c.lineTo(8,-1);c.lineTo(8+ox,oy-1);c.lineTo(-span(T).len-6+ox,oy-1);c.closePath();c.fill();
  // the cars, the last first so each nearer the engine overlaps the coupling behind it
  for(let i=n-1;i>=0;i--){const f=carFront(i),e=layer('car'+i+'|'+fa+'|'+hw+'|'+kb+'|'+q8,kb,f-DIM.car-10+Math.min(0,ox),f+12+Math.max(0,ox),-2,DIM.deck+oy+26,g=>{g.translate(f,0);flatcar(g,ox,oy,Lq,i,fa);});stamp(c,e);}
  stamp(c,layer('loco|'+fa+'|'+hw+'|'+kb+'|'+q8,kb,-DIM.loco-14+Math.min(0,ox),12+Math.max(0,ox),-2,DIM.roof+oy+6,g=>loco(g,ox,oy,Lq,fa)));
  running(c,T,ox,oy,n,wa,blur);
  lights(c,T,o,ox,oy);
  c.restore();}
return{draw,DIM,span,deckAt,trainPt,carFront};
})();
// ===== VEH TRAIN END =====
