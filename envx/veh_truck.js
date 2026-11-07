// ===== VEH TRUCK =====
// The fuel truck on the Tower Road (since V101), in the Noir Gilt look: an old flatbed of the Sprawl's haulage yards, a rounded cab in
// bottle-green paint gone dull, a long hood and swept front fenders, a chrome grille, an exhaust stack behind the cab, SPRAWL HAULAGE
// in cream on the door. Its bed has low plank sides on stake posts and a headboard with a ladder rack; the tailgate hangs open. In the
// bed, fuel drums stand in two rows (T.drums of them, the tail's first to go: the man in the bed throws them). T.wreck takes it to a
// burnt-out wreck: soot over everything, the glass gone, the paint blistered off the cab and the planks charred to the stakes; the
// fires on it are the story's own (S.fires).
// It is drawn in its own frame, x forward from the tail toward the nose along T.fa and y up from the ground, set into the floor at
// (T.x, T.gy, T.dep) with the game's projection (T.x is the tail: the bed runs 8 to 262 forward of it, as sk_highway.js has it).
const TruckLook=(()=>{
const TAU=Math.PI*2,lerp=(a,b,t)=>a+(b-a)*t,clamp=(v,a,b)=>v<a?a:v>b?b:v;
const rgba=(hex,a)=>{const n=parseInt(hex.slice(1),16);return`rgba(${n>>16&255},${n>>8&255},${n&255},${a})`;};
const mix=(a,b,t)=>{const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16),f=s=>Math.round(lerp(A>>s&255,B>>s&255,t));return'#'+((1<<24)|(f(16)<<16)|(f(8)<<8)|f(0)).toString(16).slice(1);};
const PX=()=>typeof PSX==='number'?PSX:.2,PY=()=>typeof PSY==='number'?PSY:.75;
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
// the frame: the bed from 6 to 266 with its deck at 70, the cab from 272 to 372 (its roof at 188), the hood to the grille at 428; the
// wheels (two at the back, one at the front) and the drums' places in the bed, the tail's first
const DIM={x0:0,x1:436,deck:70,R:25,axles:[64,118,356],cab:[272,372],roof:188,stack:268,
  drums:[[56,0],[88,0],[120,0],[152,0],[72,1],[104,1],[136,1],[168,1],[200,1]],drumR:15,drumH:46};
const K={paint:'#15241e',paintL:'#2a4236',paintD:'#0a120f',cream:'#e6d6b0',chrome:'#c8ccd4',ink:'#05060a',wood:'#2a1d14',woodL:'#4a3424',steel:'#2a2e36',
  rim:'#ffcf86',cold:'#cfe0ff',glass:'#0b1420',tyre:'#0a0a0c',gold:'#e2b65a',red:'#ff3a26',amber:'#ffb030',drum:'#6e2216',drumL:'#a8442a',drumD:'#260b07',band:'#c8962c'};

function poly(pts){const P=new Path2D();P.moveTo(pts[0][0],pts[0][1]);for(const q of pts.slice(1))P.lineTo(q[0],q[1]);P.closePath();return P;}
function lg(c,x0,y0,x1,y1,st){const g=c.createLinearGradient(x0,y0,x1,y1);for(const [o,col] of st)g.addColorStop(o,col);return g;}
function rg(c,x,y,r0,r1,st){const g=c.createRadialGradient(x,y,r0,x,y,r1);for(const [o,col] of st)g.addColorStop(o,col);return g;}
function rimFill(c,P,fill,L,w,a,col){c.fillStyle=rgba(col||K.rim,a);c.fill(P);c.save();c.clip(P);c.translate(-L.x*w,-L.y*w);c.fillStyle=fill;c.fill(P);c.restore();}
// words on the door, readable whichever way the truck faces (the frame is mirrored for fa -1 and turned y up)
function word(c,fa,txt,cx,y,size,col,o){o=o||{};c.save();c.font=`${o.w||700} ${size}px ${o.font||'"Alegreya SC", Georgia, serif'}`;c.textAlign='center';if(o.track)c.letterSpacing=o.track+'px';
  c.translate(cx,y);c.scale(fa,-1);if(o.shadow){c.fillStyle=o.shadow;c.fillText(txt,.5,.5);}c.fillStyle=col;c.fillText(txt,0,0);c.restore();}

let PATHS=null;
function paths(){if(PATHS)return PATHS;const P={};
  // the cab: its back wall, the rounded roof, the windscreen raked forward to the cowl, the hood down to the grille
  P.cab=new Path2D();P.cab.moveTo(272,40);P.cab.lineTo(272,176);P.cab.quadraticCurveTo(274,188,290,188);P.cab.lineTo(344,188);P.cab.quadraticCurveTo(356,188,360,180);
  P.cab.lineTo(374,136);P.cab.lineTo(420,128);P.cab.quadraticCurveTo(428,126,428,116);P.cab.lineTo(428,52);P.cab.lineTo(372,40);P.cab.closePath();
  P.win=poly([[300,132],[300,172],[340,172],[352,132]]);P.screen=poly([[352,132],[358,174],[362,174],[372,138]]);
  P.door=new Path2D();P.door.moveTo(292,52);P.door.lineTo(292,176);P.door.lineTo(352,176);P.door.lineTo(364,132);P.door.lineTo(358,52);P.door.closePath();
  P.hood=poly([[374,136],[420,128],[424,120],[376,122]]);
  // the swept front fender over the front wheel, the running board under the door, the rear fenders over the back pair
  P.fender=new Path2D();P.fender.moveTo(312,44);P.fender.quadraticCurveTo(318,92,356,94);P.fender.quadraticCurveTo(404,94,420,64);P.fender.lineTo(428,52);P.fender.lineTo(424,44);
  P.fender.quadraticCurveTo(404,84,356,84);P.fender.quadraticCurveTo(326,84,320,44);P.fender.closePath();
  P.board=poly([[284,40],[318,40],[318,46],[284,46]]);
  P.rearFender=new Path2D();for(const ax of [64,118]){P.rearFender.moveTo(ax-34,62);P.rearFender.quadraticCurveTo(ax-32,88,ax,88);P.rearFender.quadraticCurveTo(ax+32,88,ax+34,62);P.rearFender.closePath();}
  P.grille=poly([[422,58],[422,116],[430,114],[430,60]]);
  P.deck=poly([[6,62],[266,62],[266,70],[6,70]]);
  P.side=poly([[6,70],[258,70],[258,88],[6,88]]);
  P.head=poly([[258,70],[266,70],[266,160],[258,160]]);
  P.chassis=poly([[10,30],[420,30],[420,42],[10,42]]);
  PATHS=P;return P;}

// ---------- the frame on the screen ----------
// its origin at the tail on the ground at (T.x, T.gy) set back to T.dep; a blast lifts it a little (jolt) and the wreck rolls onto
// its far side (roll)
function frame(T,now){const fa=T.fa>0?1:-1,d=T.dep||0,j=clamp(T.jolt||0,0,1),sx=j?Math.sin((now||0)*57)*3*j:0,sy=j?Math.sin((now||0)*43+1)*2*j:0,
  bob=(T.ctl==='run'?Math.sin((now||0)*9.3)*.7:0);return{fa,ox:T.x+d*PX()+sx,oy:T.gy-d*PY()-sy-bob,lift:j*10,roll:T.roll||0};}
function setT(c,F){c.transform(F.fa,0,0,-1,F.ox,F.oy);c.translate(0,F.lift);if(F.roll){c.translate(DIM.x1/2,0);c.rotate(-F.roll);c.translate(-DIM.x1/2,0);}}
function lightLocal(T,F,o){let lx,ly;if(o&&o.dir){lx=o.dir.x;ly=o.dir.y;}else if(o&&o.light){lx=o.light.x-T.x;ly=o.light.y-(T.gy-100);}else{lx=.35;ly=-1;}
  const l=Math.hypot(lx,ly)||1;return{x:lx/l*F.fa,y:-ly/l};}

// ---------- caches: the body painted once for each facing, light (to an eighth of a turn) and scale ----------
const CACHE=new Map(),BUDGET=30e6;let BYTES=0;
function canvas(w,h){if(typeof OffscreenCanvas!=='undefined')return new OffscreenCanvas(w,h);const v=document.createElement('canvas');v.width=w;v.height=h;return v;}
function bucket(k){return clamp(Math.pow(2,Math.ceil(Math.log2(Math.max(k,.01))*2)/2),.5,3);}
function layer(key,sc,x0,x1,y0,y1,fn){let e=CACHE.get(key);if(e){CACHE.delete(key);CACHE.set(key,e);return e;}
  const w=Math.max(1,Math.ceil((x1-x0)*sc)),h=Math.max(1,Math.ceil((y1-y0)*sc)),cv=canvas(w,h),g=cv.getContext('2d');
  g.setTransform(sc,0,0,-sc,-x0*sc,y1*sc);fn(g);e={sc,x0,y1,bytes:w*h*4,cv:cv.transferToImageBitmap?cv.transferToImageBitmap():cv};CACHE.set(key,e);BYTES+=e.bytes;
  while(BYTES>BUDGET&&CACHE.size>1){const [k0,v]=CACHE.entries().next().value;CACHE.delete(k0);BYTES-=v.bytes;}return e;}
function stamp(c,e){c.save();c.translate(e.x0,e.y1);c.scale(1/e.sc,-1/e.sc);c.drawImage(e.cv,0,0);c.restore();}
const LX0=-12,LX1=446,LY0=-4,LY1=222;

// ---------- the body, painted into a layer ----------
function body(c,L,fa,wr){const P=paths(),W=wr?1:0,col=(a,b)=>W?b:a,r=rng(31);
  // under it all: the dark under the chassis, the rails, the tank between the axles, the spare under the bed
  c.fillStyle='#030304';c.fillRect(8,22,414,22);
  c.fillStyle=col('#0c0d10','#070605');c.fill(P.chassis);c.fillStyle=rgba(col('#4a4e58','#3a2a20'),.35);c.fillRect(10,41,410,.9);
  c.fillStyle=lg(c,0,30,0,58,[[0,col('#121418','#0a0807')],[.6,col('#2a2e36','#141010')],[1,col('#16181d','#0c0a09')]]);c.beginPath();c.roundRect?c.roundRect(176,30,70,28,8):c.rect(176,30,70,28);c.fill();
  c.strokeStyle=rgba(col('#6a7080','#4a3a30'),.35);c.lineWidth=1.5;c.beginPath();c.moveTo(180,52);c.lineTo(242,52);c.stroke();
  // the bed: the deck's edge, the plank side on its stakes, the headboard and its ladder rack, the tailgate hanging open
  c.fillStyle=col('#0f0d0b','#080605');c.fill(P.deck);c.fillStyle=rgba(col('#7a6a58','#3a2a20'),.4);c.fillRect(6,69,260,1);
  rimFill(c,P.side,lg(c,0,70,0,88,[[0,col(K.woodL,'#120c08')],[.5,col(K.wood,'#0c0806')],[1,col('#1a120c','#080504')]]),L,1,.35,W?'#ff9a5a':K.rim);
  c.strokeStyle=rgba('#000000',.6);c.lineWidth=1.5;c.beginPath();for(const y of [76,82])c.moveTo(6,y),c.lineTo(258,y);c.stroke();
  c.strokeStyle=rgba(col('#8a7058','#2a1a12'),.18);c.lineWidth=1;c.beginPath();for(let i=0;i<30;i++){const x=8+r()*240,y=71+r()*16;c.moveTo(x,y);c.lineTo(x+4+r()*10,y+(r()-.5)*.6);}c.stroke();
  for(const x of [6,66,126,186,246]){c.fillStyle=col('#14161b','#0a0807');c.fillRect(x,70,7,(W?24:42));c.fillStyle=rgba(col('#7a808e','#3a2a20'),.35);c.fillRect(x,70,1,W?24:42);
    c.fillStyle=rgba(col('#9aa0aa','#4a3a30'),.5);c.beginPath();c.arc(x+3.5,79,1,0,TAU);c.fill();}
  rimFill(c,P.head,lg(c,258,0,266,0,[[0,col('#16181d','#0a0807')],[1,col('#2a2e36','#141010')]]),L,1,.4,W?'#ff9a5a':K.rim);
  c.strokeStyle=col('#14161b','#0a0807');c.lineWidth=2.4;c.beginPath();c.moveTo(262,160);c.lineTo(262,176);c.lineTo(250,176);c.moveTo(262,168);c.lineTo(254,168);c.stroke();
  c.strokeStyle=col('#1a1c22','#0a0807');c.lineWidth=2;c.beginPath();for(let y=92;y<160;y+=12){c.moveTo(258,y);c.lineTo(266,y);}c.stroke();
  // (the tailgate: open, hanging down off the tail on its chains)
  c.fillStyle=col('#1c140e','#0a0705');c.fillRect(-2,40,8,30);c.strokeStyle=rgba(col('#9aa0aa','#3a2a20'),.45);c.lineWidth=1.5;c.beginPath();c.moveTo(4,68);c.lineTo(12,88);c.stroke();
  // the rear fenders over the back wheels, the mud flaps
  rimFill(c,P.rearFender,col('#101318','#0a0807'),L,1,.35,W?'#ff9a5a':K.rim);c.fillStyle='#060607';c.fillRect(150,22,4,32);c.fillRect(24,22,4,32);
  // the cab: its flank in the green, a long highlight down the curve of the roof, the door's seam, the window, the windscreen's edge
  rimFill(c,P.cab,lg(c,0,40,0,188,[[0,col(K.paintD,'#090706')],[.45,col(K.paint,'#120d0b')],[.85,col(K.paintL,'#1a1210')],[1,col('#3a5446','#1c1412')]]),L,1.6,.45,W?'#ff9a5a':K.rim);
  if(!W){c.save();c.clip(P.cab);c.globalCompositeOperation='lighter';c.fillStyle=lg(c,0,150,0,190,[[0,rgba(K.cold,0)],[.7,rgba(K.cold,.06)],[1,rgba(K.cold,.12)]]);c.fillRect(270,150,110,40);
    c.fillStyle=lg(c,374,0,428,0,[[0,rgba(K.rim,.0)],[1,rgba(K.rim,.12)]]);c.fillRect(374,110,56,30);c.restore();}
  else{c.save();c.clip(P.cab);for(let i=0;i<18;i++){const x=274+r()*150,y=44+r()*130,s=4+r()*16;c.fillStyle=rgba(r()<.5?'#000000':'#3a2a20',.3+r()*.4);c.beginPath();c.ellipse(x,y,s,s*.6,r()*3,0,TAU);c.fill();}c.restore();}
  c.strokeStyle=rgba('#000000',.65);c.lineWidth=1.6;c.stroke(P.door);c.strokeStyle=rgba(col('#4a6a5a','#3a2a20'),.3);c.lineWidth=1.5;c.save();c.translate(1,-1);c.stroke(P.door);c.restore();
  c.fillStyle=col(K.chrome,'#3a3028');c.fillRect(338,112,10,3);
  c.fillStyle=W?'#060403':lg(c,300,172,352,132,[[0,'#1c2a40'],[.5,K.glass],[1,'#22324a']]);c.fill(P.win);c.strokeStyle=col('#05060a','#0a0807');c.lineWidth=2.4;c.stroke(P.win);
  if(!W){c.save();c.clip(P.win);c.globalCompositeOperation='lighter';c.fillStyle=rgba(K.cold,.14);c.beginPath();c.moveTo(310,172);c.lineTo(318,172);c.lineTo(330,132);c.lineTo(322,132);c.closePath();c.fill();c.restore();}
  c.fillStyle=W?'#080504':lg(c,352,170,372,136,[[0,'#2a3a50'],[1,'#0b1420']]);c.fill(P.screen);
  rimFill(c,P.hood,col('#203a30','#140e0c'),L,1,.5,W?'#ff9a5a':K.rim);
  c.strokeStyle=rgba('#000000',.55);c.lineWidth=1.5;c.beginPath();c.moveTo(380,121);c.lineTo(420,118);c.stroke();
  // the louvres down the side of the hood, the front fender, the running board
  c.fillStyle=rgba('#000000',.55);for(let k=0;k<5;k++)c.fillRect(386+k*6,98,2.2,14);
  rimFill(c,P.fender,lg(c,0,44,0,94,[[0,col(K.paintD,'#080605')],[1,col(K.paint,'#120d0b')]]),L,1.4,.5,W?'#ff9a5a':K.rim);
  c.fillStyle=col('#0d0e11','#080605');c.fill(P.board);c.fillStyle=rgba(col(K.chrome,'#3a2a20'),.35);c.fillRect(284,45,34,.8);
  // the grille's chrome bars, the bumper, the headlamp in its bucket on the fender, the cab's lamps, the mirror on its arm
  c.fillStyle=W?'#100c0a':lg(c,0,58,0,116,[[0,'#3a3e46'],[.5,K.chrome],[1,'#4a4e58']]);c.fill(P.grille);c.fillStyle='#050506';for(let y=62;y<114;y+=5)c.fillRect(422,y,8,2);
  c.fillStyle=W?'#1a1410':lg(c,0,40,0,52,[[0,'#3a3e46'],[.55,K.chrome],[1,'#2a2e36']]);c.fillRect(404,40,34,11);
  c.fillStyle=col('#0f1714','#080605');c.beginPath();c.ellipse(414,98,8,9,0,0,TAU);c.fill();c.fillStyle=W?'#140c08':'#f6ecd2';c.beginPath();c.ellipse(416,98,5,7,0,0,TAU);c.fill();
  c.fillStyle=W?'#1a0e08':K.amber;c.fillRect(290,188,6,3);c.fillRect(312,188,6,3);c.fillRect(334,188,6,3);
  c.strokeStyle=col('#0c0d10','#080605');c.lineWidth=1.6;c.beginPath();c.moveTo(356,160);c.lineTo(376,170);c.stroke();c.fillStyle=col('#14161b','#0a0807');c.fillRect(374,158,5,18);c.fillStyle=rgba(col(K.cold,'#2a2018'),.3);c.fillRect(377,160,1,14);
  // the exhaust stack behind the cab with its rain cap, soot round its mouth
  c.fillStyle=lg(c,266,0,272,0,[[0,'#16181d'],[.5,col('#4a4e58','#2a201a')],[1,'#0c0d10']]);c.fillRect(266,62,6,148);c.fillStyle='#0a0b0d';c.fillRect(264,208,10,3);c.fillStyle=rgba('#000000',.4);c.fillRect(266,196,6,12);
  // the door's lettering and the fleet number, the tail lamps, the reflectors along the bed
  if(!W){word(c,fa,'SPRAWL HAULAGE',322,98,8.6,rgba(K.cream,.82),{track:.8,shadow:rgba('#000000',.5)});word(c,fa,'No. 14',322,85,6.6,rgba(K.cream,.62),{w:600,track:1});
    c.strokeStyle=rgba(K.gold,.5);c.lineWidth=1.1;c.beginPath();c.moveTo(300,106);c.lineTo(348,106);c.moveTo(300,79);c.lineTo(348,79);c.stroke();}
  c.fillStyle=col('#3a0c08','#120604');c.fillRect(0,48,5,10);c.fillStyle=col('#5a3a10','#120a04');for(const x of [70,130,190])c.fillRect(x,78,4,4);
  c.strokeStyle=K.ink;c.lineWidth=1.6;c.stroke(P.cab);
  if(W){c.save();c.globalCompositeOperation='source-atop';c.fillStyle=rg(c,320,120,10,140,[[0,rgba('#3a1a0c',.5)],[1,rgba('#000000',.2)]]);c.fillRect(260,30,180,170);c.restore();}}
// ---------- a wheel, live: the tyre, its tread going round, the steel disc and its studs ----------
function wheel(c,cx,L,ang,burnt){const R=DIM.R;
  if(!burnt){c.fillStyle=K.tyre;c.beginPath();c.arc(cx,25,R,0,TAU);c.fill();
    c.fillStyle='#17171b';for(let i=0;i<16;i++){const a=ang+i/16*TAU;c.save();c.translate(cx+Math.cos(a)*(R-2.4),25+Math.sin(a)*(R-2.4));c.rotate(a);c.fillRect(-2,-3.2,4,6.4);c.restore();}
    c.strokeStyle=rgba(K.rim,.22);c.lineWidth=1;c.beginPath();c.arc(cx,25,R-.6,Math.atan2(L.y,L.x)-.7,Math.atan2(L.y,L.x)+.7);c.stroke();}
  else{c.fillStyle='#050404';c.beginPath();c.arc(cx,25,R-4,0,TAU);c.fill();}
  c.fillStyle=burnt?'#2a201c':lg(c,cx-14,11,cx+14,39,[[0,'#3a3e48'],[.5,'#1a1d24'],[1,'#2c3038']]);c.beginPath();c.arc(cx,25,15,0,TAU);c.fill();
  c.fillStyle=burnt?'#120c0a':'#0a0b0e';c.beginPath();c.arc(cx,25,6,0,TAU);c.fill();
  c.fillStyle=burnt?'#4a3a30':'#6a707e';for(let i=0;i<6;i++){const a=ang+i/6*TAU;c.beginPath();c.arc(cx+Math.cos(a)*9.6,25+Math.sin(a)*9.6,1.2,0,TAU);c.fill();}}
// ---------- the drums, live: standing in the bed in two rows, the far row a shade back and darker ----------
function drum(c,x,y,L,far){const r=DIM.drumR,h=DIM.drumH,d=far?.35:0;
  c.fillStyle=lg(c,x-r,0,x+r,0,[[0,mix(K.drumD,'#000000',d)],[.3+L.x*.1,mix(K.drumL,K.drumD,d+.15)],[.62,mix(K.drum,'#000000',d)],[1,mix(K.drumD,'#000000',d)]]);c.fillRect(x-r,y,r*2,h);
  c.fillStyle=rgba('#000000',.45+d*.3);for(const k of [.3,.66])c.fillRect(x-r,y+h*k,r*2,1.6);
  c.fillStyle=rgba(K.band,.75-d*.4);c.fillRect(x-r,y+h*.44,r*2,4.6);
  c.fillStyle=rgba('#ffd9a8',.22-d*.12);c.fillRect(x-r*.55+L.x*3,y+2,1.4,h-4);
  c.fillStyle=mix('#1a0805','#000000',d);c.beginPath();c.ellipse(x,y+h,r,2.6,0,0,TAU);c.fill();c.fillStyle=rgba(K.drumL,.35-d*.2);c.beginPath();c.ellipse(x,y+h,r-1.5,1.6,0,0,TAU);c.fill();
  c.fillStyle='#0a0504';c.fillRect(x+r*.3,y+h-.6,3,1.4);}
function drums(c,T,L){const n=clamp(Math.round(T.drums||0),0,DIM.drums.length),list=DIM.drums.slice(DIM.drums.length-n);
  // (the far row first, then the near)
  for(const pass of [1,0])for(const [x,row] of list)if(row===pass)drum(c,x+(row?6:0),DIM.deck+(row?5:0),L,!!row);}
// the lamps lit: the headlamp's light and its beam a little way down the road, the tail lamps' red, the cab's ambers
function lamps(c,T,o){const lt=clamp(T.lamp||0,0,1);if(lt<=0)return;c.save();c.globalCompositeOperation='lighter';
  c.fillStyle=rg(c,418,98,0,34,[[0,rgba('#fff6e0',.8*lt)],[.3,rgba('#ffe2b0',.3*lt)],[1,rgba('#ffe2b0',0)]]);c.beginPath();c.arc(418,98,34,0,TAU);c.fill();
  c.fillStyle=lg(c,430,0,560,0,[[0,rgba('#ffe2b0',.16*lt)],[1,rgba('#ffe2b0',0)]]);c.beginPath();c.moveTo(422,104);c.lineTo(560,72);c.lineTo(560,140);c.lineTo(422,92);c.closePath();c.fill();
  c.fillStyle=rg(c,2,53,0,18,[[0,rgba(K.red,.85*lt)],[.4,rgba(K.red,.3*lt)],[1,rgba(K.red,0)]]);c.beginPath();c.arc(2,53,18,0,TAU);c.fill();
  for(const x of [293,315,337]){c.fillStyle=rg(c,x,189,0,7,[[0,rgba(K.amber,.7*lt)],[1,rgba(K.amber,0)]]);c.beginPath();c.arc(x,189,7,0,TAU);c.fill();}
  c.restore();}
// the embers in a wreck: the cab's inside glowing through its empty windows, the bed's planks still alight here and there
function embers(c,wr,now){if(wr<.5)return;c.save();c.globalCompositeOperation='lighter';
  for(const [x,y,r] of [[326,150,30],[362,152,16],[120,74,26],[200,74,22],[40,74,18]]){const f=(.55+.45*Math.sin(now*2.1+x))*(.6+.4*Math.sin(now*4.7+y));
    c.fillStyle=rg(c,x,y,0,r,[[0,rgba('#ff7a2a',.4*f*wr)],[1,rgba('#ff7a2a',0)]]);c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}c.restore();}

// ---------- drawing it ----------
function draw(c,T,o){o=o||{};const now=o.now??0,F=frame(T,now),L=lightLocal(T,F,o),wr=clamp(T.wreck||0,0,1);
  const M=c.getTransform(),k=Math.hypot(M.a,M.b),kb=bucket(k),q=((Math.round(Math.atan2(L.y,L.x)/(TAU/8))%8)+8)%8,Lq={x:Math.cos(q*TAU/8),y:Math.sin(q*TAU/8)};
  if(!o.noShadow)shadow(c,T);
  c.save();setT(c,F);c.imageSmoothingEnabled=true;
  const ang=-(T.wheel||0);for(const ax of DIM.axles)wheel(c,ax,L,ang,wr>.5);
  stamp(c,layer((wr>.5?'W':'B')+F.fa+'|'+q+'|'+kb,kb,LX0,LX1,LY0,LY1,g=>body(g,Lq,F.fa,wr>.5?1:0)));
  if(wr<.5){drums(c,T,L);lamps(c,T,{now});}
  embers(c,wr,now);
  c.restore();}
// its contact shadow on the road
function shadow(c,T){const F=frame(T,0),mid=F.ox+F.fa*DIM.x1/2;c.save();c.translate(mid,F.oy);c.scale(1,.16);const g=c.createRadialGradient(0,0,10,0,0,250);
  g.addColorStop(0,'rgba(2,2,6,.6)');g.addColorStop(.7,'rgba(2,2,6,.35)');g.addColorStop(1,'rgba(2,2,6,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,250,0,TAU);c.fill();c.restore();}
return{draw,shadow,DIM};
})();
// ===== VEH TRUCK END =====
