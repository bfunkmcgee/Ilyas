// ===== ENV STAIRS =====
// A stair-street switchbacking up the Pit's wall, below the Shelf. Its ground rises from left to right exactly as act1StairY says: the
// bottom landing of flagstones (the flight below comes up to it from the left), then the steps, cut stone worn hollow and planks
// patched where the stone went, then the top landing of boards, where an arch in the rock takes the next flight on up. Along the back
// the wall of the Pit, built on: shack fronts of boards and tin standing on the steps with their doors and lit windows, a tea stall,
// a cookshop smoking; between them the bare stretch of stone where the beggars sit on sacking under a painted water toll board, a
// pipe running along the wall over them and washing strung across; lamps on brackets. Above the roofs the wall goes on up, more
// walkways and shacks into the haze. The open edge toward the eye has a rail on posts (drawn over the people in fore()), and below the
// edge the drop: the ledge's face and the timbers under it, the street below in the dark, smoke and fires further down. Two lights by
// S.act1: day, and dusk (the sky above the Pit orange to violet, the lamps being lit). When S.act1.spikeView is set (0..1) the
// picture gives way to a view across the Pit to its far wall, the spike sticking out high on it: bare but for a dark stain and a strip
// of black coat cloth (somebody climbed for the arm).
(()=>{const E=EnvLook,{C,pp,poly,lin,rad,rgba,mix,glow,haze,stars,moon,rng,lerp,clamp,TAU}=E;const K=E.pitKit;
const L=()=>typeof ACT1_PLACES!=='undefined'&&ACT1_PLACES.stairs?ACT1_PLACES.stairs:null;
const L0={far:224,lo:{x1:150},hi:{x0:744},rise:132,step:{run:24,h:8},beggars:{x0:330,x1:610,d:168},oldman:{x:640,d:168},rail:{d:20},spike:{x:470,y:-140},floor:{x0:30,x1:870,z0:40,z1:150}};
const Y=()=>L()||L0;
const Q=K.Q,jm=(a,b,t)=>K.jm(a,b,t);
// the stair's ground (the game's own when it is there); past the bottom landing's left end the flight below goes on down
function sy(x){const R=Y();let h;if(typeof act1StairY==='function'&&L())h=act1StairY(x);else{if(x<=R.lo.x1)h=0;else if(x>=R.hi.x0)h=R.rise;else{const u=(x-R.lo.x1)/(R.hi.x0-R.lo.x1);h=Math.min(R.rise,Math.floor(u*R.rise/R.step.h)*R.step.h);}}
  if(x<DOWN.x)h=-R.step.h*Math.ceil((DOWN.x-x)/DOWN.run);return h;}
const DOWN={x:-36,run:34};
// the treads: runs of the ground at one height, left to right
function treads(){const T=[];let x0=-170,h=sy(x0);for(let x=-170;x<=1150;x+=1){const hh=sy(x);if(hh!==h){T.push({x0,x1:x,h});x0=x;h=hh;}}T.push({x0,x1:1150,h});return T;}
const EDGE=6;                              // the ledge's open edge, in depth
const FACE=20;                             // how deep the ledge's face goes down under its edge
let OUT={fires:[],chims:[],lit:[]},BELOW={fires:[]},NEARCH=[],WLAMPS=[];
function key(){return'stairs:'+K.tod();}
// the height of the back wall's foot on the screen at world x
const backY=x=>Q(x,sy(x),Y().far).y;
// ---------- the wall above the street ----------
const ROWS={yBot:178,rs:76,u:1.2,seed:63,span:330,shrink:.45,sspan:900};
function backdrop(c,P,X0,X1,T0){c.fillStyle=lin(c,0,T0,0,320,[[0,P.air[0]],[.6,P.air[1]],[1,P.air[2]]]);c.fillRect(X0,T0,X1-X0,420-T0);
  OUT={fires:[],chims:[],lit:[]};K.shackRows(c,Object.assign({pal:P,x0:X0,x1:X1,yTop:T0,out:OUT},ROWS));
  // the haze low against the wall over the roofs of the street
  c.fillStyle=lin(c,0,60,0,240,[[0,rgba(P.air[1],0)],[1,rgba(P.air[1],.35)]]);c.fillRect(X0,60,X1-X0,180);}
// ---------- the street's back wall ----------
// a shack front on the steps: its boards from its top down to the lowest step under it (the treads cover what is below their own),
// its roof, windows, a door on the step where it stands
function front(c,P,o){const far=Y().far,a=Q(o.x0,o.top,far),hmin=Math.min(sy(o.x0),sy(o.x1))-12,e=Q(o.x1,hmin,far);
  K.facade(c,P,{x0:a.x,x1:e.x,top:a.y,base:e.y,seed:o.seed,col:o.col,kind:o.kind,wins:o.wins,patch:o.patch,tip:o.tip,eave:6});
  for(const dd of o.doors||[]){door(c,P,dd[0],dd[1],dd[2],dd[3]);}}
// a door at world x on its step: w wide, h high; open on a lit room, or shut
function door(c,P,x,w,h,open){const far=Y().far,hb=sy(x),a=Q(x-w/2,hb+h,far),e=Q(x+w/2,hb,far),sh=(col,k)=>K.shade(P,col,k);
  c.fillStyle=sh('#22180f',1.2);c.fillRect(a.x-3,a.y-4,e.x-a.x+6,e.y-a.y+4);
  if(open){c.fillStyle=lin(c,0,a.y,0,e.y,[[0,'#4a2410'],[.5,mix('#4a2410','#d88a40',.4+.4*P.lamp)],[1,mix('#4a2410','#e8a050',.5+.4*P.lamp)]]);c.fillRect(a.x,a.y,e.x-a.x,e.y-a.y);
    c.fillStyle='#120a06';c.beginPath();c.moveTo(a.x,a.y);c.lineTo(a.x+7,a.y+4);c.lineTo(a.x+7,e.y-2);c.lineTo(a.x,e.y);c.closePath();c.fill();
    c.fillStyle=rgba('#2a1206',.5);c.fillRect(a.x+(e.x-a.x)*.55,a.y+(e.y-a.y)*.3,(e.x-a.x)*.3,(e.y-a.y)*.7);
    if(P.lamp>.5){c.save();c.globalCompositeOperation='lighter';K.glowAt(c,(a.x+e.x)/2,(a.y+e.y)/2,(e.y-a.y)*.6,'#ffb25e',.28*P.lamp,1.2);c.restore();}}
  else{K.boards(c,a.x,a.y,e.x,e.y,{base:sh('#33261c',1.1),bw:6.5,seed:(x*7)|0,foot:8,pal:P,top:false});c.fillStyle=sh('#22180f');c.fillRect(a.x,a.y+(e.y-a.y)*.3,e.x-a.x,3);c.fillRect(a.x,a.y+(e.y-a.y)*.72,e.x-a.x,3);
    c.fillStyle=sh('#5a5450');c.beginPath();c.arc(e.x-5,(a.y+e.y)/2,1.4,0,TAU);c.fill();}
  // its step: a stone up to the sill
  c.fillStyle=K.topLit(P,'#4a4640',.7);c.fillRect(a.x-4,e.y-3,e.x-a.x+8,3);}
// a lamp on a bracket on the wall at world x, h above the step there (lit as the time says; its glow is live)
function wallLamp(c,P,x,h,litK){const far=Y().far,p=Q(x,sy(x)+h,far),sh=(col,k)=>K.shade(P,col,k),on=litK>0;
  c.strokeStyle=sh('#1a1612');c.lineWidth=1.4;c.beginPath();c.moveTo(p.x-8,p.y-14);c.lineTo(p.x,p.y-14);c.lineTo(p.x,p.y-10);c.stroke();K.lantern(c,P,p.x,p.y-10,1,on);
  WLAMPS.push({x:p.x,y:p.y-4,k:litK});}
// the bare stretch where the beggars sit: stone laid up against the rock, its courses stepping up with the street, a pipe along it,
// the painted water toll board, a niche with a candle stub, damp and soot
function beggarsWall(c,P){const R=Y(),far=R.far,x0=R.beggars.x0-22,x1=R.oldman.x+26,sh=(col,k)=>K.shade(P,col,k),r=rng(301),top=150;
  const pts=[Q(x0,sy(x0)+top,far),Q(x1,sy(x1)+top+6,far),Q(x1,-30,far),Q(x0,-30,far)];
  c.fillStyle=sh('#34302c',1.3);K.poly(c,pts);c.fill();
  c.save();K.poly(c,pts);c.clip();
  // courses of rough stone
  for(let hh=-30;hh<top+60;hh+=9)for(let x=x0-((hh/9)%2)*14;x<x1;x+=22+r()*10){const p=Q(x,sy(Math.min(x1,Math.max(x0,x)))+hh,far),w=20+r()*10,v=r();
    c.fillStyle=sh(v<.35?'#3a3632':v<.7?'#34302c':'#2e2a27',1.25);c.fillRect(p.x+.6,p.y-8.4,w-1.2,8);c.fillStyle=rgba(P.light,.02+.08*P.lightA);c.fillRect(p.x+.6,p.y-8.4,w-1.2,.8);}
  c.fillStyle=rgba('#000000',.25);for(let x=x0;x<x1;x+=40+r()*30){const p=Q(x,sy(x)+top,far);c.fillRect(p.x,p.y,1,top);}
  // soot and damp: dark at the foot where they sit, streaks down from the pipe
  c.fillStyle=lin(c,0,Q(0,top,far).y,0,Q(0,0,far).y,[[0,rgba('#000000',0)],[1,rgba('#000000',.35)]]);c.fillRect(-200,-400,1400,900);
  for(let i=0;i<14;i++){const x=x0+r()*(x1-x0),p=Q(x,sy(x)+112,far),L2=20+r()*60;c.fillStyle=lin(c,0,p.y,0,p.y+L2,[[0,rgba('#0a0806',.4)],[1,rgba('#0a0806',0)]]);c.fillRect(p.x,p.y,2+r()*5,L2);}
  c.restore();
  // the toll board, painted, weathered: a pump drawn on it, its words
  {const bx=(R.beggars.x0+R.beggars.x1)/2+20,p=Q(bx,sy(bx)+68,far),w=86,h=34;c.fillStyle=sh('#2a2018',1.2);c.fillRect(p.x-w/2-3,p.y-h-3,w+6,h+6);c.fillStyle=sh('#5a5444',1.05);c.fillRect(p.x-w/2,p.y-h,w,h);
    c.fillStyle=rgba('#000000',.18);for(let i=0;i<10;i++)c.fillRect(p.x-w/2+r()*w,p.y-h+r()*h,4+r()*14,1+r()*2);
    c.font='700 11px "Alegreya SC", Georgia, serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle=sh('#7a2a1e',.9);c.fillText('WATER TOLL',p.x+8,p.y-h*.62);
    c.font='700 7px "Alegreya SC", Georgia, serif';c.fillText('ONE CHIT A BAG',p.x+8,p.y-h*.26);
    c.strokeStyle=sh('#7a2a1e',.9);c.lineWidth=1.4;c.beginPath();c.moveTo(p.x-w/2+8,p.y-6);c.lineTo(p.x-w/2+8,p.y-h+8);c.lineTo(p.x-w/2+16,p.y-h+10);c.moveTo(p.x-w/2+8,p.y-h+14);c.lineTo(p.x-w/2+3,p.y-h+11);c.stroke();
    c.fillStyle=rgba(P.light,.06+.2*P.lightA);c.fillRect(p.x-w/2,p.y-h,w,1);}
  // a niche in the stone, a candle stub and a saucer in it
  {const nx=R.beggars.x0+60,p=Q(nx,sy(nx)+58,far);c.fillStyle='#0c0a09';c.beginPath();c.moveTo(p.x-8,p.y);c.lineTo(p.x-8,p.y-14);c.arc(p.x,p.y-14,8,Math.PI,0);c.lineTo(p.x+8,p.y);c.closePath();c.fill();
    c.fillStyle=sh('#d8ccb0');c.fillRect(p.x-1.4,p.y-7,2.8,6);c.fillStyle=sh('#6a6050');c.fillRect(p.x-5,p.y-1.4,10,1.4);WLAMPS.push({x:p.x,y:p.y-9,k:P.key==='dusk'?.5:.25,small:1});}}
// the pipe along the wall over the street, on brackets, a valve wheel, rust run down from its joints
function wallPipe(c,P){const far=Y().far,sh=(col,k)=>K.shade(P,col,k),r=rng(311),pts=[];for(let x=-170;x<=1150;x+=10){pts.push(Q(x,lerp(0,132,clamp((x-150)/594,0,1))+122,far));}
  c.strokeStyle=sh('#2a201a',1.1);c.lineWidth=7;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();
  c.strokeStyle=rgba(P.light,.05+.25*P.lightA);c.lineWidth=1.2;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y-2.6):c.moveTo(p.x,p.y-2.6));c.stroke();
  for(let x=-150;x<1150;x+=70+r()*30){const p=Q(x,lerp(0,132,clamp((x-150)/594,0,1))+122,far);c.fillStyle=sh('#1c1612');c.fillRect(p.x-2,p.y-5,4,12);c.fillStyle=lin(c,0,p.y+3,0,p.y+30,[[0,rgba(K.shade(P,'#7a3a18'),.4)],[1,rgba('#7a3a18',0)]]);c.fillRect(p.x-1.4,p.y+3,2.8,27);}
  {const x=520,p=Q(x,lerp(0,132,(x-150)/594)+122,far);c.strokeStyle=sh('#5a2418');c.lineWidth=1.6;c.beginPath();c.arc(p.x,p.y-12,6,0,TAU);c.moveTo(p.x-6,p.y-12);c.lineTo(p.x+6,p.y-12);c.moveTo(p.x,p.y-18);c.lineTo(p.x,p.y-6);c.stroke();c.fillStyle=sh('#1c1612');c.fillRect(p.x-1.4,p.y-8,2.8,8);}}
// washing strung across over the beggars, from the shack before them to the shack after them
function washing(c,P,x0,h0,x1,h1,seed){const far=Y().far,a=Q(x0,h0,far-4),b=Q(x1,h1,far-4),r=rng(seed),sag=26;
  c.strokeStyle=K.shade(P,'#6a6052');c.lineWidth=.7;c.beginPath();c.moveTo(a.x,a.y);c.quadraticCurveTo((a.x+b.x)/2,(a.y+b.y)/2+sag,b.x,b.y);c.stroke();
  for(let s=.1;s<.92;s+=.1+r()*.12){const x=lerp(a.x,b.x,s),y=lerp(a.y,b.y,s)+sag*2*s*(1-s)+.5,k=r(),col=K.shade(P,['#6a5a4a','#4a5260','#7a6a50','#5a4a44','#8a8070','#4a4a3a'][(r()*6)|0],1);c.fillStyle=col;c.beginPath();
    if(k<.35){// a shirt: shoulders, sleeves, the body
      c.moveTo(x-7,y);c.lineTo(x+7,y);c.lineTo(x+11,y+6);c.lineTo(x+7,y+7);c.lineTo(x+6,y+18);c.lineTo(x-6,y+18);c.lineTo(x-7,y+7);c.lineTo(x-11,y+6);c.closePath();}
    else if(k<.6){// trousers: two legs
      c.moveTo(x-6,y);c.lineTo(x+6,y);c.lineTo(x+7,y+22);c.lineTo(x+2,y+22);c.lineTo(x,y+8);c.lineTo(x-2,y+22);c.lineTo(x-7,y+22);c.closePath();}
    else if(k<.8){// a sheet, folded over the line
      c.moveTo(x-12,y);c.lineTo(x+12,y);c.lineTo(x+13,y+26);c.lineTo(x-11,y+25);c.closePath();}
    else{// a rag, a sock
      c.moveTo(x-3,y);c.lineTo(x+3,y);c.lineTo(x+3.4,y+10);c.lineTo(x-3,y+9);c.closePath();}
    c.fill();c.fillStyle=rgba('#000000',.22);c.fillRect(x-4,y+2,1,10);c.fillStyle=rgba(P.light,.05+.2*P.lightA);c.fillRect(x-5,y,10,1);}}
// the back of the street from end to end
function backWall(c,P){const R=Y(),far=R.far,sh=(col,k)=>K.shade(P,col,k);WLAMPS=[];NEARCH=[];
  // the rock between and behind the fronts, down to the steps
  {const pts=[];for(let x=-170;x<=1150;x+=8)pts.push(Q(x,sy(x)+40,far));pts.push(Q(1150,-40,far),Q(-170,-40,far));c.fillStyle=sh('#26201c',1.3);K.poly(c,pts);c.fill();}
  // the bottom landing: a tea stall in the front of a tall shack, a lamp, a sign; a lower shack on the left over the flight going down
  front(c,P,{x0:-170,x1:-40,top:166,seed:401,col:'#33292a',wins:[[24,22,16,13],[80,24,14,12]],doors:[[-80,30,128,1]]});
  front(c,P,{x0:-40,x1:150,top:186,seed:403,col:'#3a2e28',wins:[[30,16,18,14],[120,16,18,14]],patch:1});
  {const p=Q(-20,96,far),q=Q(130,0,far);c.fillStyle='#0c0907';c.fillRect(p.x,p.y,q.x-p.x,q.y-p.y);
    c.fillStyle=lin(c,0,p.y,0,q.y,[[0,'#3a1c0c'],[1,mix('#3a1c0c','#d0803a',.35+.4*P.lamp)]]);c.fillRect(p.x+3,p.y+3,q.x-p.x-6,q.y-p.y-3);
    // the counter across it, cups and a kettle on it, the awning over it
    const ca=Q(-20,38,far-6),cb=Q(130,0,far-6);c.fillStyle=sh('#3a2c20',1.1);c.fillRect(ca.x,ca.y,cb.x-ca.x,cb.y-ca.y);c.fillStyle=K.topLit(P,'#4e3c2a',.8);c.fillRect(ca.x-3,ca.y-3,cb.x-ca.x+6,4);
    for(let i=0;i<5;i++){const cp=Q(-6+i*12,40,far-8);c.fillStyle=sh(i%2?'#8a7a5a':'#6a5a44');c.fillRect(cp.x-2.4,cp.y-5,4.8,5);}
    {const kp=Q(96,40,far-8);c.fillStyle=sh('#2a2826');c.beginPath();c.ellipse(kp.x,kp.y-6,7,6,0,0,TAU);c.fill();c.fillRect(kp.x+5,kp.y-9,7,2.4);c.strokeStyle=sh('#2a2826');c.lineWidth=1.4;c.beginPath();c.arc(kp.x,kp.y-12,4,Math.PI,0);c.stroke();NEARCH.push({x:kp.x+12,y:kp.y-9,s:1.2,tea:1});}
    K.oilcloth(c,[Q(-30,112,far),Q(140,112,far),Q(140,100,far-34),Q(-30,100,far-34)],{pal:P,base:K.shade(P,'#4a3a26'),seed:5,sag:4,patch:['#5a3020','#2e3e3a','#6a5a34']});
    const sp=Q(55,140,far);c.fillStyle=sh('#1e1612');c.fillRect(sp.x-26,sp.y-12,52,16);c.font='700 10px "Alegreya SC", Georgia, serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle=K.shade(P,'#d8b878',.6);c.fillText('TEA',sp.x,sp.y-3.5);}
  wallLamp(c,P,-110,134,P.key==='dusk'?1:.6);wallLamp(c,P,142,134,P.key==='dusk'?1:0);
  // up the steps: two fronts stepping up, a cookshop with its chimney, then the beggars' stretch
  front(c,P,{x0:150,x1:236,top:178,seed:411,col:'#2e2a2c',kind:'tin',wins:[[22,26,14,12]],doors:[[214,22,96,0]]});
  front(c,P,{x0:236,x1:322,top:196,seed:413,col:'#40362c',wins:[[16,22,16,12],[56,22,14,12]],doors:[[300,24,100,1]],tip:-4});
  {const p=Q(268,200,far);c.fillStyle=sh('#201a18');c.fillRect(p.x-3,p.y-30,6,30);c.fillStyle=sh('#2a2220');c.fillRect(p.x-5,p.y-33,10,3);NEARCH.push({x:p.x,y:p.y-33,s:1.6});}
  wallLamp(c,P,232,140,P.key==='dusk'?.5:0);
  beggarsWall(c,P);
  // past the old man: a shack on the last steps, then the top landing's shop and the arch the next flight goes up through
  front(c,P,{x0:666,x1:744,top:262,seed:421,col:'#38302a',wins:[[16,30,14,12]],doors:[[722,24,98,0]],patch:1});
  front(c,P,{x0:744,x1:900,top:290,seed:423,col:'#33292a',wins:[[24,26,18,14],[96,26,18,14],[60,74,16,12]],doors:[[800,28,104,1]]});
  wallLamp(c,P,700,150,P.key==='dusk'?.85:0);wallLamp(c,P,880,150,P.key==='dusk'?1:.5);
  arch(c,P);
  front(c,P,{x0:1060,x1:1160,top:276,seed:431,col:'#3e3430',kind:'tin',wins:[[30,28,16,12]]});
  wallPipe(c,P);
  washing(c,P,316,196,672,240,7);washing(c,P,678,262,860,290,9);
  // the old man's crate against the wall behind his place at the end of the row, turned over, a tin pot on it
  {const om=Y().oldman,p=Q(om.x,sy(om.x),far-10),q=Q(om.x+14,sy(om.x)+14,far-26);c.fillStyle=sh('#3a2c1e',1.2);c.fillRect(p.x-12,q.y,24,p.y-q.y);c.fillStyle=K.topLit(P,'#4a3a28',.6);c.fillRect(p.x-12,q.y-2,24,3);
    c.fillStyle=sh('#4a4644');c.fillRect(p.x-3,q.y-8,7,6);c.fillStyle=K.topLit(P,'#4a4644',.7);c.fillRect(p.x-3,q.y-9,7,1.4);}}
// the arch in the rock at the top landing: the next flight going up inside it, a lamp at its mouth
function arch(c,P){const R=Y(),far=R.far,x0=944,x1=1040,h0=sy(x0),sh=(col,k)=>K.shade(P,col,k),a=Q(x0,h0+150,far),e=Q(x1,h0,far),cx=(a.x+e.x)/2,rr=(e.x-a.x)/2;
  // the rock round it, rough stone
  c.fillStyle=sh('#3a3632',1.2);c.beginPath();c.moveTo(a.x-18,e.y);c.lineTo(a.x-18,a.y+rr-8);c.arc(cx,a.y+rr,rr+18,Math.PI,0);c.lineTo(e.x+18,e.y);c.closePath();c.fill();
  c.strokeStyle=rgba('#000000',.4);c.lineWidth=1;for(let k=0;k<=8;k++){const an=Math.PI+k*Math.PI/8;c.beginPath();c.moveTo(cx+Math.cos(an)*rr,a.y+rr+Math.sin(an)*rr);c.lineTo(cx+Math.cos(an)*(rr+18),a.y+rr+Math.sin(an)*(rr+18));c.stroke();}
  // inside: the steps going up into the dark, the far lamp
  c.save();c.beginPath();c.moveTo(a.x,e.y);c.lineTo(a.x,a.y+rr);c.arc(cx,a.y+rr,rr,Math.PI,0);c.lineTo(e.x,e.y);c.closePath();c.clip();
  c.fillStyle=lin(c,0,a.y,0,e.y,[[0,'#0a0807'],[1,'#16110e']]);c.fillRect(a.x,a.y,e.x-a.x,e.y-a.y);
  for(let k=0;k<11;k++){const y=e.y-6-k*11,w=(e.x-a.x)*(1-k*.05);c.fillStyle=jm(K.topLit(P,'#4a443c',.6),'#0a0807',k/12);c.fillRect(cx-w/2,y-2,w,3);c.fillStyle=rgba('#000000',.4);c.fillRect(cx-w/2,y+1,w,8);}
  c.fillStyle=lin(c,0,a.y,0,e.y,[[0,rgba('#000000',.6)],[1,rgba('#000000',0)]]);c.fillRect(a.x,a.y,e.x-a.x,e.y-a.y);
  c.save();c.globalCompositeOperation='lighter';K.glowAt(c,cx+8,a.y+rr*.9,22,'#ffb25e',.35*P.lamp+.1);c.restore();c.fillStyle='#ffcf86';c.fillRect(cx+6,a.y+rr*.9-2,4,4);
  c.restore();
  wallLamp(c,P,x1+10,120,P.key==='dusk'?1:.5);}
// ---------- the drop under the open edge ----------
// From the ledge's face down: the timbers that hold the street out over the drop, and past them the street below in the dark, its
// doors and windows, smoke and the glow of fires further down
function drop(c,P,T){const sh=(col,k)=>K.shade(P,col,k),r=rng(501);
  const top=[];for(const t of T)top.push(Q(t.x0,t.h-FACE,EDGE),Q(t.x1,t.h-FACE,EDGE));
  const pts=top.concat([Q(1150,-300,EDGE),Q(-170,-300,EDGE)]);
  c.save();K.poly(c,pts);c.clip();
  BELOW=K.drop(c,P,-200,1200,Q(0,132-FACE,EDGE).y,620,{seed:7,rows:3,out:{fires:[]}});
  // the street below: its fronts in the dark, a few windows and doors lit; its rail
  {const yb=Q(0,-150,Y().far).y;for(let x=-160;x<1160;){const w=60+r()*80,h=110+r()*60,p=Q(x,-150+h,Y().far),q=Q(x+w,-150,Y().far);
      c.fillStyle=jm(sh(K.SHACK[(r()*K.SHACK.length)|0],1.6),'#000000',.25);c.fillRect(p.x,p.y,q.x-p.x,q.y-p.y);
      c.fillStyle=jm(sh(K.TINC[(r()*K.TINC.length)|0],1.3),P.air[2],.3);c.fillRect(p.x-3,p.y-3,q.x-p.x+6,4);
      if(r()<.45+P.win){const wx=p.x+8+r()*(w-30),wy=p.y+20+r()*20;c.fillStyle=jm('#e8a050','#000000',.2+.3*(1-P.winA));c.fillRect(wx,wy,12,9);c.fillStyle=rgba('#000000',.4);c.fillRect(wx+5.4,wy,1.2,9);c.save();c.globalCompositeOperation='lighter';K.glowAt(c,wx+6,wy+4,20,'#ffb25e',.12+.2*P.winA);c.restore();}
      if(r()<.4){const dx=p.x+w*.6;c.fillStyle='#090706';c.fillRect(dx,q.y-70,20,70);}
      x+=w+(r()<.25?8+r()*30:2);}
    c.fillStyle=lin(c,0,yb-160,0,yb+40,[[0,rgba(P.air[2],.15)],[1,rgba(jm(P.air[2],'#000000',.4),.7)]]);c.fillRect(-200,yb-160,1400,240);}
  // the shadow of the ledge over all of it
  c.fillStyle=lin(c,0,Q(0,132-FACE,EDGE).y,0,Q(0,132-FACE-90,EDGE).y,[[0,rgba('#000000',.55)],[1,rgba('#000000',0)]]);c.fillRect(-200,Q(0,132-FACE,EDGE).y,1400,200);
  // the timbers under the ledge: posts going down, braces across
  for(let x=-140;x<1150;x+=62+r()*16){const h=sy(x)-FACE,p=Q(x,h,EDGE+2),b=Q(x+18,h-150,EDGE+30);c.strokeStyle=sh('#241a12',1.3);c.lineWidth=5;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(b.x,b.y);c.stroke();
    c.strokeStyle=rgba(P.light,.04+.15*P.lightA);c.lineWidth=1;c.beginPath();c.moveTo(p.x-2,p.y);c.lineTo(b.x-2,b.y);c.stroke();
    const p2=Q(x+46,h,EDGE+2),m=Q(x+9,h-75,EDGE+16);c.strokeStyle=sh('#20160f',1.3);c.lineWidth=3;c.beginPath();c.moveTo(p2.x,p2.y);c.lineTo(m.x,m.y);c.stroke();}
  c.restore();}
// ---------- the street itself ----------
// the treads, low to high (each covers the riser of the one before, which faces away from the eye); flagstones on the bottom landing,
// cut stone and plank on the steps, boards on the top landing; the path worn into them; the nosing of each step lit
function street(c,P,T){const R=Y(),far=R.far,sh=(col,k)=>K.shade(P,col,k),r=rng(601);
  for(const t of T){const x0=t.x0,x1=t.x1,h=t.h,land=x1-x0>60,boardsT=x0>=R.hi.x0-1,plank=!land&&!boardsT&&((Math.round(x0/36)%5)===3),base=boardsT?'#3a3024':plank?'#3c3024':'#3c3834';
    const A=Q(x0,h,EDGE),B=Q(x1,h,EDGE),Cc=Q(x1,h,far),D=Q(x0,h,far);
    c.fillStyle=K.topLit(P,base,.5);K.poly(c,[A,B,Cc,D]);c.fill();
    c.save();K.poly(c,[A,B,Cc,D]);c.clip();
    if(land&&!boardsT){// flagstones: rows across the depth, joints staggered
      for(let d=EDGE;d<far;d+=26)for(let x=x0-((d/26|0)%2)*24;x<x1;x+=44+r()*14){const a=Q(x,h,d),b=Q(x+44,h,d),e=Q(x+44,h,d+26),f=Q(x,h,d+26);c.fillStyle=rgba(r()<.5?'#000000':P.light,r()<.5?.1:.02+.04*P.lightA);K.poly(c,[a,b,e,f]);c.fill();
        c.strokeStyle=rgba('#000000',.35);c.lineWidth=.7;c.stroke();}}
    else if(boardsT){// the landing's deck: boards laid across, their ends staggered, a few loose
      for(let d=EDGE+9;d<far;d+=9){const a=Q(x0,h,d),b=Q(x1,h,d);c.strokeStyle=rgba('#000000',.4);c.lineWidth=.8;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
        for(let x=x0+r()*60;x<x1;x+=60+r()*80){const p=Q(x,h,d),q=Q(x,h,d+9);c.beginPath();c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);c.stroke();}
        if(r()<.12){const xx=x0+r()*(x1-x0-40),p=Q(xx,h,d),q=Q(xx+40,h,d+9);c.fillStyle=rgba(r()<.5?'#000000':P.light,.08);c.fillRect(p.x,q.y,q.x-p.x,p.y-q.y);}}}
    else if(plank){// planks laid back from the edge where the stone went
      for(let x=x0+7;x<x1;x+=7){const a=Q(x,h,EDGE),b=Q(x,h,far);c.strokeStyle=rgba('#000000',.22);c.lineWidth=.7;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}}
    else{// cut stone: a joint or two across, chips off the edge
      for(let d=EDGE+40+r()*30;d<far-10;d+=50+r()*40){const a=Q(x0,h,d),b=Q(x1,h,d+(r()-.5)*6);c.strokeStyle=rgba('#000000',.35);c.lineWidth=.7;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
      for(let i=0;i<3;i++){const d=EDGE+r()*(far-EDGE),p=Q(x0+1,h,d);c.fillStyle=rgba('#000000',.35);c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x+5,p.y-1);c.lineTo(p.x+2,p.y+3);c.closePath();c.fill();}}
    // the hollow worn where people walk, the grit at the back against the wall
    {const a=Q(x0,h,46),b=Q(x1,h,46),e=Q(x1,h,150),f=Q(x0,h,150);c.fillStyle=rgba(P.light,(.025+.07*P.lightA)*(plank||boardsT?.6:1));K.poly(c,[a,b,e,f]);c.fill();}
    {const a=Q(x0,h,far-30),b=Q(x1,h,far-30);c.fillStyle=lin(c,0,a.y,0,Cc.y,[[0,rgba('#000000',0)],[1,rgba('#000000',.3)]]);c.fillRect(Math.min(a.x,D.x)-2,Cc.y,Math.max(b.x,Cc.x)-Math.min(a.x,D.x)+4,a.y-Cc.y);}
    for(let i=0;i<(x1-x0)/8;i++){const p=Q(x0+r()*(x1-x0),h,EDGE+r()*(far-EDGE));c.fillStyle=rgba(r()<.6?'#000000':'#c8b8a0',.12+.1*r());c.fillRect(p.x,p.y,1+r()*1.6,.8);}
    // the inner corner at the step's back end, where the next step goes up: darker
    if(!land){const a=Q(x1-9,h,EDGE),b=Q(x1,h,EDGE),e=Q(x1,h,far),f=Q(x1-9,h,far);c.fillStyle=lin(c,a.x,0,b.x,0,[[0,rgba('#000000',0)],[1,rgba('#000000',.28)]]);K.poly(c,[a,b,e,f]);c.fill();}
    c.restore();
    // the nosing: the step's front edge, lit, and the dark under it on the step below
    if(!land||x0>-40){c.fillStyle=rgba('#000000',.32);K.poly(c,[Q(x0-3,h-8,EDGE),Q(x0,h-8,EDGE),Q(x0,h-8,far),Q(x0-3,h-8,far)]);c.fill();
      c.fillStyle=rgba(jm(P.light,base,.4),.22+.5*P.lightA);K.poly(c,[Q(x0,h,EDGE),Q(x0+1.8,h,EDGE),Q(x0+1.8,h,far),Q(x0,h,far)]);c.fill();}}
  // the beggars' sacking, one on each step along their row (they sit on it, at depth 166 to 170, the old man at the row's end): sacks
  // laid open, a folded blanket, rags, from just in front of where they sit back to behind them
  {const B=R.beggars,bd=B.d??168,xa=B.x0-6,xb=Math.max(B.x1,R.oldman?R.oldman.x+16:B.x1);
    for(const t of T){const x0=Math.max(t.x0+2,xa),x1=Math.min(t.x1-2,xb);if(x1-x0<12)continue;const h=t.h,d0=bd-8,d1=Math.min(far-3,bd+20+r()*6);
      c.fillStyle=K.shade(P,['#5a4a32','#4a4030','#3e3a2e','#5a4436'][(r()*4)|0],.9);K.poly(c,[Q(x0,h,d0),Q(x1,h,d0+1),Q(x1-1,h,d1),Q(x0+1,h,d1)]);c.fill();
      c.strokeStyle=rgba('#000000',.25);c.lineWidth=.6;c.beginPath();const a=Q(x0+(x1-x0)*.3,h,d0+3),b=Q(x0+(x1-x0)*.36,h,d1-2);c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
      c.fillStyle=rgba(P.light,.05+.15*P.lightA);K.poly(c,[Q(x0,h,d0),Q(x1,h,d0+1),Q(x1,h,d0+4),Q(x0,h,d0+3)]);c.fill();}
    // what they own, against the wall behind them: bundles tied in cloth, a pot, a stick leaning
    for(const [bx,k] of [[372,0],[468,1],[566,2]]){const h=sy(bx),p=Q(bx,h,far-12);c.fillStyle=K.shade(P,['#4a4030','#3e3a2e','#5a4436'][k],1);c.beginPath();c.ellipse(p.x,p.y-6,10,7,0,0,TAU);c.fill();
      c.fillStyle=rgba(P.light,.04+.18*P.lightA);c.beginPath();c.ellipse(p.x-2,p.y-10,6,2.4,0,0,TAU);c.fill();c.fillStyle=K.shade(P,'#2a2018');c.fillRect(p.x-1.4,p.y-14,2.8,4);}
    {const h=sy(520),p=Q(520,h,far-8);c.fillStyle=K.shade(P,'#2a2826');c.beginPath();c.ellipse(p.x,p.y-4,6,4.6,0,0,TAU);c.fill();c.fillStyle=rgba('#000000',.5);c.beginPath();c.ellipse(p.x,p.y-8,4.4,1.4,0,0,TAU);c.fill();}
    {const h=sy(604),a=Q(604,h,far-6),b=Q(612,h+66,far-2);c.strokeStyle=K.shade(P,'#4a3826');c.lineWidth=1.8;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}}}
// the ledge's face under its open edge, step by step: stone and timber, the edge itself lit
function face(c,P,T){const sh=(col,k)=>K.shade(P,col,k),r=rng(701);
  for(const t of T){const a=Q(t.x0,t.h,EDGE),b=Q(t.x1,t.h,EDGE),e=Q(t.x1,t.h-FACE,EDGE),f=Q(t.x0,t.h-FACE,EDGE),boardsT=t.x0>=Y().hi.x0-1;
    c.fillStyle=sh(boardsT?'#33261a':'#3a3632',1.25);K.poly(c,[a,b,e,f]);c.fill();
    if(!boardsT){for(let x=t.x0;x<t.x1;x+=18+r()*8){const p=Q(x,t.h,EDGE);c.fillStyle=rgba('#000000',.3);c.fillRect(p.x,p.y,.8,FACE);}c.fillStyle=rgba('#000000',.25);c.fillRect(a.x,a.y+FACE*.5,b.x-a.x,.8);}
    else{c.fillStyle=rgba('#000000',.3);c.fillRect(a.x,a.y+6,b.x-a.x,1);c.fillStyle=sh('#22180f');for(let x=t.x0+20;x<t.x1;x+=60){const p=Q(x,t.h,EDGE);c.fillRect(p.x-3,p.y,6,FACE+8);}}
    c.fillStyle=rgba(P.light,.1+.4*P.lightA);c.fillRect(a.x,a.y-.4,b.x-a.x,1.1);
    c.fillStyle=lin(c,0,a.y,0,a.y+FACE,[[0,rgba('#000000',0)],[1,rgba('#000000',.4)]]);c.fillRect(a.x,a.y,b.x-a.x,FACE);}}
// ---------- the light over it ----------
function lightPass(c,P){c.save();c.globalCompositeOperation='lighter';
  if(P.key==='dusk'){// the last of the sky's light high up the wall, orange going to rose; the lamps' pools on the steps
    c.fillStyle=lin(c,0,-110,0,230,[[0,rgba('#ff9a5a',.22)],[.5,rgba('#ff7a6a',.08)],[1,rgba('#ff7a6a',0)]]);c.fillRect(-200,-110,1400,340);}
  else{const m=Q(480,60,120);K.cRad(c,m.x,m.y,20,520,P.light,.07,.4);}
  for(const L2 of WLAMPS){if(L2.k<=0||L2.small)continue;K.cRad(c,L2.x-20,L2.y+90,6,90,'#ffb25e',.1*L2.k*P.lamp,.45);}
  c.restore();
  // at dusk the shadows go violet
  if(P.key==='dusk'){c.fillStyle=lin(c,0,140,0,GB,[[0,rgba('#3a2448',0)],[1,rgba('#3a2448',.16)]]);c.fillRect(-200,140,1400,GB-140);}
  c.fillStyle=lin(c,0,GB-40,0,GB+120,[[0,rgba('#000000',0)],[1,rgba('#000000',.55)]]);c.fillRect(-200,GB-40,1400,170);}
// ---------- the scene ----------
function paint(c){const P=K.pal(),X0=-170,X1=W+250,T0=-110,T=treads();
  backdrop(c,P,X0,X1,T0);backWall(c,P);drop(c,P,T);face(c,P,T);street(c,P,T);lightPass(c,P);}
// ---------- the rail along the open edge, over the people ----------
// posts on the steps, a top rail running up with the street and a lower one, three lamp posts; patched where it was broken
const RAIL={h:34,lamps:[150,450,744]};
function railTop(x){return lerp(0,132,clamp((x-150)/594,0,1))+RAIL.h;}
function fore(c){c=c||ctx;const P=K.pal(),R=Y(),d=R.rail.d,sh=(col,k)=>K.shade(P,col,k),A=S.act1;
  if(A&&A.spikeView>0)spikeFore(c,P,A.spikeView);
  if(A&&A.spikeView>=1)return;
  c.save();c.lineCap='round';
  // posts
  c.fillStyle=sh('#2a1e14',1.1);for(let x=-150;x<1150;x+=44){const h=sy(x),p=Q(x,h,d),q=Q(x,railTop(x)+2,d);c.fillRect(p.x-2.2,q.y,4.4,p.y-q.y);}
  // the rails
  const pts=[],mid=[];for(let x=-170;x<=1150;x+=8){pts.push(Q(x,railTop(x),d));mid.push(Q(x,railTop(x)-16,d));}
  c.strokeStyle=sh('#33251a',1.1);c.lineWidth=3.4;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();
  c.lineWidth=2;c.beginPath();mid.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();
  c.strokeStyle=rgba(P.light,.1+.4*P.lightA);c.lineWidth=.9;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y-1.4):c.moveTo(p.x,p.y-1.4));c.stroke();
  // a length of rope where the rail is broken, a rag tied on
  {const a=Q(560,railTop(560)-16,d),b=Q(604,railTop(604)-16,d);c.strokeStyle=sh('#6a5a3e');c.lineWidth=1.2;c.beginPath();c.moveTo(a.x,a.y);c.quadraticCurveTo((a.x+b.x)/2,(a.y+b.y)/2+6,b.x,b.y);c.stroke();}
  // the lamp posts: a taller post, an arm, the lantern
  for(const lx of RAIL.lamps){const h=sy(lx),p=Q(lx,h,d),q=Q(lx,h+112,d);c.fillStyle=sh('#22180f',1.1);c.fillRect(p.x-2.6,q.y,5.2,p.y-q.y);
    c.strokeStyle=sh('#22180f',1.1);c.lineWidth=2;c.beginPath();c.moveTo(q.x,q.y+4);c.lineTo(q.x+14,q.y+4);c.lineTo(q.x+14,q.y+8);c.stroke();
    const on=lampOn(lx);K.lantern(c,P,q.x+14,q.y+8,1.1,on>.5);
    if(on>0){c.globalCompositeOperation='lighter';K.glowAt(c,q.x+14,q.y+16,12,'#fff0c8',.75*on);K.glowAt(c,q.x+14,q.y+16,48,'#ffb25e',.3*on);c.globalCompositeOperation='source-over';c.globalAlpha=1;}}
  c.restore();}
// how lit a rail lamp is: by day the middle one burns low; at dusk they are lit one after another, the last one catching as you watch
function lampOn(lx){const P=K.pal(),t=S.t;if(P.key==='day')return lx===450?.35:0;if(P.key!=='dusk')return 1;
  if(lx===744){const u=(t%9)/9;return u<.35?0:u<.45?Math.max(0,Math.sin(t*40)*.8):1;}return .95+.05*Math.sin(t*6+lx);}
// ---------- what moves ----------
function live(){const t=S.t,P=K.pal(),T=P.key;ctx.save();
  K.upper('stairs:'+T,-1000,(c,x0,x1,y0,y1)=>{c.fillStyle=P.air[0];c.fillRect(x0,y0,x1-x0,y1-y0);
    K.shackRows(c,Object.assign({pal:P,x0:-170,x1:W+250,yTop:-650,clip:[-650,y1]},ROWS));
    c.fillStyle=lin(c,0,-640,0,-470,[[0,rgba(P.sky[1],.8)],[1,rgba(P.air[0],0)]]);c.fillRect(x0,-640,x1-x0,170);
    K.skyTop(c,x0,x1,y0,-636,P,{tower:-40});
    if(T==='dusk'){c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,0,-640,0,-200,[[0,rgba('#ff9a5a',.18)],[1,rgba('#ff9a5a',0)]]);c.fillRect(x0,-640,x1-x0,440);c.restore();}});
  // smoke: the cookshop's chimney, the tea kettle's steam, the chimneys up the wall, the drop's fires
  {const srcs=[];for(const ch of NEARCH)srcs.push(ch.tea?{x:ch.x,y:ch.y,s:2,sp:.25,n:5,h:40,dx:8,a:.35}:{x:ch.x,y:ch.y,s:5,sp:.1,n:7,h:170,dx:20,a:.5});
    for(const ch of OUT.chims.slice(0,8))srcs.push({x:ch.x,y:ch.y,s:2.6*(ch.s||1),sp:.08,n:5,h:60+50*(ch.s||1),dx:12,a:.4*(1-ch.hz*.6),ph:ch.x*.013});
    K.smoke(ctx,srcs,t,P.smoke,1);}
  ctx.globalCompositeOperation='lighter';
  for(const f of OUT.fires.concat(BELOW.fires||[])){const a=(.6+.4*Math.sin(t*9+f.x)*Math.sin(t*3.3+f.y))*P.fire*(1-(f.hz||0)*.6);K.glowAt(ctx,f.x,f.y-4*f.s,14*f.s,'#ff8a3c',.55*a);K.glowAt(ctx,f.x,f.y-3*f.s,4*f.s,'#ffd28a',.8*a);}
  // the lamps on the wall: lit or not, breathing; the candle in the niche
  for(const L2 of WLAMPS){if(L2.k<=0)continue;const f=.9+.1*Math.sin(t*7+L2.x)*Math.sin(t*2.3+L2.y);K.glowAt(ctx,L2.x,L2.y,L2.small?5:9,'#fff0c8',.8*L2.k*f);K.glowAt(ctx,L2.x,L2.y,L2.small?14:40,'#ffb25e',.3*L2.k*f);}
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  // smoke coming up out of the drop past the edge
  {const pf=K.puffSpr(P.smoke);for(let q=0;q<6;q++){const u=((t*.05+q/6)%1),x=120+q*160+Math.sin(t*.3+q)*20,y=520-u*260,R=20+u*50;ctx.globalAlpha=.16*(1-u)*Math.min(1,u*4);ctx.drawImage(pf,x-R,y-R,R*2,R*2);}ctx.globalAlpha=1;}
  ctx.restore();}
// ---------- the spike, seen across the Pit ----------
// A picture of its own, made the first time it is asked for at the screen's size: the far wall of the Pit going up into the haze, the
// cliff standing out of it high up and the spike at its end, the rim and the sky above on a tall screen. The strip of coat cloth
// moves in the draught; the picture fades in by S.act1.spikeView.
let SPK=null;
function spikeFore(c,P,a){if(typeof cv==='undefined')return;const w=cv.width,h=cv.height;
  if(!SPK||SPK.w!==w||SPK.h!==h||SPK.k!==P.key){if(SPK&&SPK.cv)SPK.cv.width=SPK.cv.height=0;SPK=spikePaint(w,h,P);}
  c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=clamp(a,0,1);c.drawImage(SPK.cv,0,0,w,h);
  // the cloth on the spike, in the picture's own frame
  const s=SPK.s,G=SPK.G,t=S.t;c.setTransform(s,0,0,s,0,0);c.fillStyle='#0b0a0e';c.beginPath();const bx=G.cx,by=G.cy;c.moveTo(bx-3,by-1);c.lineTo(bx+3,by+1);
  for(let k=1;k<=6;k++){const u=k/6,sw=Math.sin(t*2.4-u*3)*6*u+Math.sin(t*5.1-u*5)*2*u;c.lineTo(bx+3+sw+u*4,by+u*44);}
  for(let k=6;k>=1;k--){const u=k/6,sw=Math.sin(t*2.4-u*3)*6*u+Math.sin(t*5.1-u*5)*2*u;c.lineTo(bx-3+sw+u*2-(k===6?4:0),by+u*40);}c.closePath();c.fill();
  c.strokeStyle='rgba(120,128,150,.35)';c.lineWidth=.6;c.beginPath();c.moveTo(bx-3,by-1);c.lineTo(bx+3,by+1);c.stroke();
  c.restore();}
function spikePaint(w,h,P){const cvs=document.createElement('canvas');cvs.width=w;cvs.height=h;const g=cvs.getContext('2d'),s=w/900,H=h/s,gore=typeof S!=='undefined'&&S?S.gore:'red';g.setTransform(s,0,0,s,0,0);
  // the air across the Pit, lighter up toward the sky
  g.fillStyle=lin(g,0,0,0,H,[[0,P.air[0]],[.7,P.air[1]],[1,P.air[2]]]);g.fillRect(0,0,900,H);
  const tall=H>700,skyH=tall?H*.2:0;
  K.shackRows(g,{pal:P,x0:-40,x1:940,yBot:H+60,yTop:skyH-20,rs:62,u:.9,seed:91,span:H*.55,shrink:.5,sspan:H*1.2,winK:1.1,pipes:1,slides:3});
  if(tall){g.fillStyle=lin(g,0,skyH,0,skyH+140,[[0,rgba(P.sky[1],.8)],[1,rgba(P.air[0],0)]]);g.fillRect(0,skyH,900,140);K.skyTop(g,0,900,0,skyH+4,P,{tower:-10});}
  // the cliff: a prow of rock standing out of the wall, seen from below, the old roots and a cable hanging off its underside
  const cyy=tall?H*.36:H*.36,cx=330,G={},r=rng(53),rock=jm(K.shade(P,'#3a3034',1.1),P.air[1],.2),dark=jm(K.shade(P,'#1c1618',1.3),P.air[1],.15);
  // the wall's own mass at the left, the cliff coming out of it: a shelf of rock, jagged along its top, its underside going back in
  g.fillStyle=jm(K.shade(P,'#201a1c',1.2),P.air[1],.3);g.beginPath();g.moveTo(-40,cyy-90);g.quadraticCurveTo(60,cyy-70,110,cyy-36);g.lineTo(140,cyy+90);g.quadraticCurveTo(60,cyy+150,-40,cyy+170);g.closePath();g.fill();
  const Qp=[[-40,cyy-44]];for(let x=0;x<=cx;x+=22)Qp.push([x,cyy-24-r()*9+(x/cx)*14]);
  Qp.push([cx+14,cyy-6],[cx+22,cyy+6],[cx+10,cyy+18],[cx-24,cyy+26],[cx-110,cyy+40],[60,cyy+62],[-40,cyy+84]);
  g.fillStyle=lin(g,0,cyy-30,0,cyy+70,[[0,rock],[.35,jm(rock,dark,.5)],[1,dark]]);g.beginPath();Qp.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();
  g.save();g.clip();for(let k=0;k<7;k++){g.fillStyle=k%2?'rgba(0,0,0,.22)':rgba(P.light,.04+.1*P.lightA);g.fillRect(-60,cyy-14+k*11+r()*4,cx+100,3+r()*5);}
    for(let k=0;k<6;k++){const jx=20+r()*(cx-60),jy=cyy-10+r()*40;g.fillStyle=jm(K.shade(P,K.JUNKC[(r()*K.JUNKC.length)|0],1.1),P.air[1],.2);if(r()<.4){g.beginPath();g.ellipse(jx,jy,7,3,(r()-.5)*.5,0,TAU);g.fill();}else g.fillRect(jx,jy,10+r()*16,3+r()*4);}g.restore();
  g.strokeStyle=jm(P.light,P.air[0],.45);g.lineWidth=1.1;g.beginPath();for(let i=1;i<Qp.length-6;i++)i===1?g.moveTo(Qp[i][0],Qp[i][1]):g.lineTo(Qp[i][0],Qp[i][1]);g.stroke();
  // roots and an old cable hanging off its underside
  g.strokeStyle=dark;g.lineWidth=1;g.beginPath();for(let q=0;q<6;q++){const x=cx-30-q*46,y=cyy+28+q*6,sw=(q%2?3:-2);g.moveTo(x,y);g.quadraticCurveTo(x+sw,y+22,x+3+sw,y+30+q*6);}g.stroke();
  g.lineWidth=1.6;g.beginPath();g.moveTo(cx-140,cyy+44);g.quadraticCurveTo(cx-120,cyy+110,cx-160,cyy+150);g.stroke();
  // the spike: iron, rusted, from the cliff's end up and out
  const ax=cx+16,ay=cyy-4,bx=ax+70,by=ay-92,dx=bx-ax,dy=by-ay,Lh=Math.hypot(dx,dy),ux=dx/Lh,uy=dy/Lh,nx=-uy,ny=ux;
  g.fillStyle=K.shade(P,'#5a3420',.8);g.beginPath();g.moveTo(ax+nx*4,ay+ny*4);g.lineTo(bx+ux*3,by+uy*3);g.lineTo(ax-nx*4,ay-ny*4);g.closePath();g.fill();
  g.strokeStyle=rgba(P.light,.25+.4*P.lightA);g.lineWidth=.8;g.beginPath();g.moveTo(ax+nx*2,ay+ny*2);g.lineTo(bx,by);g.stroke();
  // the dark stain down it and down the rock under it (soot-dark with the gore off)
  const sc=gore==='off'?'#1a1414':gore==='ink'?'#241a34':'#3a1212';
  g.strokeStyle=rgba(sc,.85);g.lineWidth=2.6;g.beginPath();g.moveTo(ax+ux*Lh*.55,ay+uy*Lh*.55);g.lineTo(ax+ux*4,ay+uy*4);g.stroke();
  g.fillStyle=rgba(sc,.75);g.beginPath();g.moveTo(ax-6,ay+2);g.quadraticCurveTo(ax-2,ay+20,ax-8,ay+44);g.lineTo(ax-12,ay+46);g.quadraticCurveTo(ax-10,ay+18,ax-16,ay+4);g.closePath();g.fill();
  g.fillStyle=rgba(sc,.5);g.beginPath();g.ellipse(ax-8,ay+1,14,3,0,0,TAU);g.fill();
  G.cx=ax+ux*Lh*.62;G.cy=ay+uy*Lh*.62;
  // the haze between, thick over the bottom of the picture
  g.fillStyle=lin(g,0,H*.55,0,H,[[0,rgba(P.air[1],0)],[1,rgba(P.air[2],.6)]]);g.fillRect(0,H*.55,900,H*.45);
  g.fillStyle=rad(g,450,H*.45,Math.min(900,H)*.3,Math.max(900,H)*.8,[[0,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,.5)']]);g.fillRect(0,0,900,H);
  return{cv:cvs,w,h,s,G,k:P.key};}
// the light that rims a man on the stair: at dusk the nearest lamp, else the daylight from far above
function light(f){const P=K.pal();if(P.key==='dusk'){const px=f.p[PEL].x+f.dep*PSX;let best=RAIL.lamps[0],bd=1e9;for(const lx of RAIL.lamps){const dd=Math.abs(lx-px);if(dd<bd){bd=dd;best=lx;}}
    const q=Q(best+14,sy(best)+104,Y().rail.d);return{light:{x:q.x-f.dep*PSX,y:q.y+f.dep*PSY}};}
  return{light:{x:500-f.dep*PSX,y:-340+f.dep*PSY}};}
const LAYOUT={edge:EDGE,face:FACE,rail:RAIL,down:DOWN};
E.S.stairs={paint,live,fore,light,key,LAYOUT};
})();
// ===== ENV STAIRS END =====
