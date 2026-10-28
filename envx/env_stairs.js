// ===== ENV STAIRS =====
// The stair-streets: the two flights up the Pit's wall between the Sump's lane and the Shelf (ACT1_PLACES.stairs; S.act1.flight says
// which one a scene is on). Both rise from left to right exactly as act1StairY says, on the same ground: a landing of flagstones at the
// foot, the steps (cut stone worn hollow, planks patched where the stone went), a landing of boards at the top, where an arch in the
// rock takes the street on up inside the wall, a board by it pointing up to the Shelf.
//   The Lane stair ('lane'): its foot is the first landing over the lane (the short flight up from the lane comes in from the left,
//   past a fish stall shuttered for good, the Tarkesh mark on its post, a board pointing down to the Floor); a skewer stall on the
//   landing; up the steps the choirhouse with its bell, the Mendery's door, and a bare stretch chalked for rondel and pasted with bills,
//   tracts and the Nightglass, a numbers board by it; at the top the switchback, where Tarr's collectors keep their stand (a stool, a
//   brazier, the strongbox) under the water toll board. Under its edge the lane on the Pit's floor.
//   The Shelf stair ('shelf'): its foot is a landing that runs on to the rock, an arch at its back where the switchback comes out of
//   the wall (a board by it pointing down to the Floor); a tea stall; a cookshop smoking; then the bare stretch where the silent row
//   sits on sacking with tin cups before them (the pieces) and cardboard against the wall, under an old Hallowell billboard, a keeping
//   niche with its candle and the marks round it; the old man's crate at the end of the row. Under its edge the Lane stair's lamps and
//   the Floor further down.
// Along the back of both the wall of the Pit, built on: shack fronts of boards and tin standing on the steps with their doors and lit
// windows, Tarr's water main along the wall on brackets, a rag of the Pump King's blue on its valve, washing strung across, lamps on
// brackets. Above the roofs the wall goes on up, more walkways and shacks into the haze. The open edge toward the eye has a rail on
// posts (drawn over the people in fore()), and below the edge the drop: the ledge's face and the timbers under it, the street below in
// the dark, smoke and fires further down. Two lights by S.act1: day, and dusk (the sky above the Pit orange to violet, the lamps being
// lit). When S.act1.spikeView is set (0..1) the picture gives way to a view across the Pit to its far wall, the spike sticking out high
// on it: bare but for a dark stain and a strip of black coat cloth (somebody climbed for the arm).
(()=>{const E=EnvLook,{C,pp,poly,lin,rad,rgba,mix,glow,haze,stars,moon,rng,lerp,clamp,TAU}=E;const K=E.pitKit;
const L=()=>typeof ACT1_PLACES!=='undefined'&&ACT1_PLACES.stairs?ACT1_PLACES.stairs:null;
const L0={far:224,lo:{x1:150},hi:{x0:744},rise:132,step:{run:24,h:8},beggars:{x0:330,x1:610,d:168,n:6},oldman:{x:640,d:168},rail:{d:20},spike:{x:470,y:-140},
  stand:{x:760,d:172,sit:712,by:840},floor:{x0:30,x1:870,z0:40,z1:150}};
const Y=()=>L()||L0;
// which flight the scene is on: the Lane stair, or the Shelf stair (when the game says nothing)
function flight(){const A=typeof S!=='undefined'&&S?S.act1:null;return A&&A.flight==='lane'?'lane':'shelf';}
const Q=K.Q,jm=(a,b,t)=>K.jm(a,b,t);
const SERIF='"Alegreya SC", Georgia, serif';
// the stair's ground (the game's own when it is there); on the Lane stair the short flight from the lane goes on down past the first
// landing's left end; on the Shelf stair the landing runs on to the rock
function sy(x){const R=Y();let h;if(typeof act1StairY==='function'&&L())h=act1StairY(x);else{if(x<=R.lo.x1)h=0;else if(x>=R.hi.x0)h=R.rise;else{const u=(x-R.lo.x1)/(R.hi.x0-R.lo.x1);h=Math.min(R.rise,Math.floor(u*R.rise/R.step.h)*R.step.h);}}
  if(x<DOWN.x&&flight()==='lane')h=-R.step.h*Math.ceil((DOWN.x-x)/DOWN.run);return h;}
const DOWN={x:-36,run:34};
// the treads: runs of the ground at one height, left to right
function treads(){const T=[];let x0=-170,h=sy(x0);for(let x=-170;x<=1150;x+=1){const hh=sy(x);if(hh!==h){T.push({x0,x1:x,h});x0=x;h=hh;}}T.push({x0,x1:1150,h});return T;}
const EDGE=6;                              // the ledge's open edge, in depth
const FACE=20;                             // how deep the ledge's face goes down under its edge
let OUT={fires:[],chims:[],lit:[]},BELOW={fires:[]},NEARCH=[],WLAMPS=[],COALS=[];
function key(){return'stairs:'+K.tod()+':'+flight();}
// the height of the back wall's foot on the screen at world x
const backY=x=>Q(x,sy(x),Y().far).y;
// ---------- the wall above the street ----------
// (each flight its own stretch of the wall: the Lane stair's rows lower down, the Shelf stair's nearer the Shelf)
const ROWS={yBot:178,rs:76,u:1.2,seed:63,span:330,shrink:.45,sspan:900};
const rows=()=>flight()==='lane'?Object.assign({},ROWS,{seed:59}):ROWS;
function backdrop(c,P,X0,X1,T0){c.fillStyle=lin(c,0,T0,0,320,[[0,P.air[0]],[.6,P.air[1]],[1,P.air[2]]]);c.fillRect(X0,T0,X1-X0,420-T0);
  OUT={fires:[],chims:[],lit:[]};K.shackRows(c,Object.assign({pal:P,x0:X0,x1:X1,yTop:T0,out:OUT},rows()));
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
const dusk=P=>P.key==='dusk';
// a painted board on the wall at world x, h above the step there, its word and an arrow beside it (up 1, down -1): the way on
function wayBoard(c,P,x,h,word,dir){const far=Y().far,p=Q(x,sy(x)+h,far),sh=(col,k)=>K.shade(P,col,k),ink=K.shade(P,'#d8c8a0',.55);
  c.font='700 10px '+SERIF;const tw=c.measureText(word).width+24,bh=15;
  c.fillStyle=sh('#1a1410',1.2);c.fillRect(p.x-tw/2-2,p.y-bh-2,tw+4,bh+4);c.fillStyle=sh('#3a3226',1.05);c.fillRect(p.x-tw/2,p.y-bh,tw,bh);
  c.textAlign='center';c.textBaseline='middle';c.fillStyle=ink;c.fillText(word,p.x-5,p.y-bh/2+.5);
  const ax=p.x+tw/2-8,ay=p.y-bh/2,s=dir<0?1:-1;c.strokeStyle=ink;c.lineWidth=1.4;c.beginPath();c.moveTo(ax,ay-4*s);c.lineTo(ax,ay+4*s);c.moveTo(ax-3,ay+1*s);c.lineTo(ax,ay+4*s);c.lineTo(ax+3,ay+1*s);c.stroke();
  c.fillStyle=rgba(P.light,.06+.2*P.lightA);c.fillRect(p.x-tw/2,p.y-bh,tw,1);}
// a sheet of paper pasted on the wall at world x, h above the step there, w by hh: its face drawn by fn(c, left, top, w, h), its
// corners curled and a tear where it has weathered
function pasted(c,P,x,h,w,hh,base,tilt,fn){const far=Y().far,p=Q(x,sy(x)+h,far),r=rng((x*13+h)|0);c.save();c.translate(p.x,p.y);c.rotate(tilt||0);
  c.fillStyle=rgba('#000000',.25);c.fillRect(-w/2+1.4,-hh+1.4,w,hh);c.fillStyle=K.shade(P,base,.7);c.fillRect(-w/2,-hh,w,hh);
  fn(c,-w/2,-hh,w,hh);
  c.fillStyle=K.shade(P,'#2a2420',1.1);c.beginPath();c.moveTo(w/2,-hh);c.lineTo(w/2-5,-hh);c.lineTo(w/2,-hh+5);c.closePath();c.fill();
  if(r()<.7){c.beginPath();c.moveTo(-w/2,-hh*.4);c.lineTo(-w/2+3+r()*4,-hh*.32);c.lineTo(-w/2+1,-hh*.2);c.lineTo(-w/2,-hh*.18);c.closePath();c.fill();}
  c.fillStyle=rgba('#000000',.12);for(let i=0;i<4;i++)c.fillRect(-w/2+r()*w,-hh+r()*hh,1+r()*4,.8);
  c.fillStyle=rgba(P.light,.04+.16*P.lightA);c.fillRect(-w/2,-hh,w,.8);c.restore();}
// lines of print or of a hand: rows of short strokes across a box
function printLines(c,x,y,w,h,col,gap,wd){c.fillStyle=col;for(let yy=y;yy<y+h;yy+=gap)for(let xx=x;xx<x+w;){const m=((Math.round(xx*7+yy*3)%9)+9)%9,lw=Math.max(.8,Math.min(x+w-xx,2+m));c.fillRect(xx,yy,lw,wd||.8);xx+=lw+1.6;}}
// the bare stone laid up against the rock from x0 to x1, its courses stepping up with the street; soot and damp; dark at the foot
function stoneWall(c,P,x0,x1,seed){const far=Y().far,sh=(col,k)=>K.shade(P,col,k),r=rng(seed),top=150;
  const pts=[Q(x0,sy(x0)+top,far),Q(x1,sy(x1)+top+6,far),Q(x1,-30,far),Q(x0,-30,far)];
  c.fillStyle=sh('#34302c',1.3);K.poly(c,pts);c.fill();
  c.save();K.poly(c,pts);c.clip();
  for(let hh=-30;hh<top+60;hh+=9)for(let x=x0-((hh/9)%2)*14;x<x1;x+=22+r()*10){const p=Q(x,sy(Math.min(x1,Math.max(x0,x)))+hh,far),w=20+r()*10,v=r();
    c.fillStyle=sh(v<.35?'#3a3632':v<.7?'#34302c':'#2e2a27',1.25);c.fillRect(p.x+.6,p.y-8.4,w-1.2,8);c.fillStyle=rgba(P.light,.02+.08*P.lightA);c.fillRect(p.x+.6,p.y-8.4,w-1.2,.8);}
  c.fillStyle=rgba('#000000',.25);for(let x=x0;x<x1;x+=40+r()*30){const p=Q(x,sy(x)+top,far);c.fillRect(p.x,p.y,1,top);}
  c.fillStyle=lin(c,0,Q(0,top,far).y,0,Q(0,0,far).y,[[0,rgba('#000000',0)],[1,rgba('#000000',.35)]]);c.fillRect(-200,-400,1400,900);
  for(let i=0;i<14;i++){const x=x0+r()*(x1-x0),p=Q(x,sy(x)+112,far),L2=20+r()*60;c.fillStyle=lin(c,0,p.y,0,p.y+L2,[[0,rgba('#0a0806',.4)],[1,rgba('#0a0806',0)]]);c.fillRect(p.x,p.y,2+r()*5,L2);}
  c.restore();}
// a stall in the front of a shack, from x0 to x1 on the landing: the lit room behind, the counter across it with what it sells (ware),
// the awning over it, its sign (and a smaller line under it)
function stallFront(c,P,x0,x1,o){const far=Y().far,sh=(col,k)=>K.shade(P,col,k);
  const p=Q(x0,96,far),q=Q(x1,0,far);c.fillStyle='#0c0907';c.fillRect(p.x,p.y,q.x-p.x,q.y-p.y);
  c.fillStyle=lin(c,0,p.y,0,q.y,[[0,'#3a1c0c'],[1,mix('#3a1c0c','#d0803a',.35+.4*P.lamp)]]);c.fillRect(p.x+3,p.y+3,q.x-p.x-6,q.y-p.y-3);
  const ca=Q(x0,38,far-6),cb=Q(x1,0,far-6);c.fillStyle=sh('#3a2c20',1.1);c.fillRect(ca.x,ca.y,cb.x-ca.x,cb.y-ca.y);c.fillStyle=K.topLit(P,'#4e3c2a',.8);c.fillRect(ca.x-3,ca.y-3,cb.x-ca.x+6,4);
  o.ware(c,P,x0,x1);
  K.oilcloth(c,[Q(x0-10,112,far),Q(x1+10,112,far),Q(x1+10,100,far-34),Q(x0-10,100,far-34)],{pal:P,base:K.shade(P,o.cloth||'#4a3a26'),seed:o.seed||5,sag:4,patch:['#5a3020','#2e3e3a','#6a5a34']});
  const sp=Q((x0+x1)/2,140,far);c.font='700 10px '+SERIF;const tw=Math.max(52,c.measureText(o.sign).width+16),two=!!o.sub;c.fillStyle=sh('#1e1612');c.fillRect(sp.x-tw/2,sp.y-12,tw,two?22:16);
  c.textAlign='center';c.textBaseline='middle';c.fillStyle=K.shade(P,'#d8b878',.6);c.fillText(o.sign,sp.x,sp.y-3.5);
  if(two){c.font='700 6.5px '+SERIF;c.fillStyle=K.shade(P,'#c8a868',.65);c.fillText(o.sub,sp.x,sp.y+5.5);}}
// the tea stall: cups along the counter, the kettle steaming
function teaWare(c,P,x0,x1){const far=Y().far,sh=(col,k)=>K.shade(P,col,k);
  for(let i=0;i<5;i++){const cp=Q(x0+14+i*12,40,far-8);c.fillStyle=sh(i%2?'#8a7a5a':'#6a5a44');c.fillRect(cp.x-2.4,cp.y-5,4.8,5);}
  const kp=Q(x1-34,40,far-8);c.fillStyle=sh('#2a2826');c.beginPath();c.ellipse(kp.x,kp.y-6,7,6,0,0,TAU);c.fill();c.fillRect(kp.x+5,kp.y-9,7,2.4);c.strokeStyle=sh('#2a2826');c.lineWidth=1.4;c.beginPath();c.arc(kp.x,kp.y-12,4,Math.PI,0);c.stroke();NEARCH.push({x:kp.x+12,y:kp.y-9,s:1.2,tea:1});
  // the loaves at the counter's end, each scored with the baker's mark
  for(let i=0;i<3;i++){const bp=Q(x0+76+i*10,40,far-8);c.fillStyle=sh('#8a6a3e',.8);c.beginPath();c.ellipse(bp.x,bp.y-3,4.6,3.2,0,Math.PI,0);c.fill();c.strokeStyle=rgba('#2a1a0c',.6);c.lineWidth=.6;c.beginPath();c.moveTo(bp.x-2,bp.y-4.4);c.lineTo(bp.x+2,bp.y-4.4);c.stroke();}}
// the skewer stall: a long iron grill on the counter, the coals in it (their glow is live), skewers laid across, a bucket of water
function skewerWare(c,P,x0,x1){const far=Y().far,sh=(col,k)=>K.shade(P,col,k),r=rng(77);
  const g0=Q(x0+8,40,far-8),g1=Q(x1-26,40,far-8);c.fillStyle=sh('#1a1816');c.fillRect(g0.x,g0.y-6,g1.x-g0.x,6);c.fillStyle='#2a0c04';c.fillRect(g0.x+2,g0.y-6,g1.x-g0.x-4,2.4);
  c.fillStyle=rgba('#ff8a3c',.35+.4*P.fire);for(let x=g0.x+4;x<g1.x-4;x+=5+r()*4){c.fillRect(x,g0.y-6,2,1.4);}
  for(let x=g0.x+6;x<g1.x-6;x+=14+r()*6){COALS.push({x,y:g0.y-5});}
  for(let i=0;i<8;i++){const x=g0.x+8+i*((g1.x-g0.x-16)/7);c.strokeStyle=sh('#8a8478',.7);c.lineWidth=.7;c.beginPath();c.moveTo(x-4,g0.y-7.4);c.lineTo(x+5,g0.y-8.6);c.stroke();
    for(let k=0;k<3;k++){c.fillStyle=sh(['#6a3a1e','#5a2c18','#7a4a26'][(i+k)%3],.8);c.fillRect(x-2.6+k*3,g0.y-10-k*.4,2.4,2.4);}}
  NEARCH.push({x:(g0.x+g1.x)/2,y:g0.y-10,s:3.6,grill:1});
  const bp=Q(x1-12,40,far-8);c.fillStyle=sh('#3a3a3e');c.fillRect(bp.x-5,bp.y-9,10,9);c.fillStyle=K.topLit(P,'#5a5a60',.6);c.fillRect(bp.x-5,bp.y-10,10,1.6);}
// the arch in the rock that takes the street on up inside the wall (up) or down into it (the Shelf stair's foot): rough stone round it,
// the steps inside going up into the dark toward a far lamp, or the first steps going down out of sight, a lamp at its mouth
function arch(c,P,x0,x1,up){const R=Y(),far=R.far,h0=sy(x0),sh=(col,k)=>K.shade(P,col,k),a=Q(x0,h0+150,far),e=Q(x1,h0,far),cx=(a.x+e.x)/2,rr=(e.x-a.x)/2;
  c.fillStyle=sh('#3a3632',1.2);c.beginPath();c.moveTo(a.x-18,e.y);c.lineTo(a.x-18,a.y+rr-8);c.arc(cx,a.y+rr,rr+18,Math.PI,0);c.lineTo(e.x+18,e.y);c.closePath();c.fill();
  c.strokeStyle=rgba('#000000',.4);c.lineWidth=1;for(let k=0;k<=8;k++){const an=Math.PI+k*Math.PI/8;c.beginPath();c.moveTo(cx+Math.cos(an)*rr,a.y+rr+Math.sin(an)*rr);c.lineTo(cx+Math.cos(an)*(rr+18),a.y+rr+Math.sin(an)*(rr+18));c.stroke();}
  c.save();c.beginPath();c.moveTo(a.x,e.y);c.lineTo(a.x,a.y+rr);c.arc(cx,a.y+rr,rr,Math.PI,0);c.lineTo(e.x,e.y);c.closePath();c.clip();
  c.fillStyle=lin(c,0,a.y,0,e.y,[[0,'#0a0807'],[1,'#16110e']]);c.fillRect(a.x,a.y,e.x-a.x,e.y-a.y);
  if(up){for(let k=0;k<11;k++){const y=e.y-6-k*11,w=(e.x-a.x)*(1-k*.05);c.fillStyle=jm(K.topLit(P,'#4a443c',.6),'#0a0807',k/12);c.fillRect(cx-w/2,y-2,w,3);c.fillStyle=rgba('#000000',.4);c.fillRect(cx-w/2,y+1,w,8);}}
  else{for(let k=0;k<4;k++){const y=e.y-14+k*4,w=(e.x-a.x)*(.92-k*.14);c.fillStyle=jm(K.topLit(P,'#4a443c',.6),'#0a0807',.2+k*.22);c.fillRect(cx-w/2,y,w,2);}
    c.fillStyle=lin(c,0,e.y-30,0,e.y,[[0,rgba('#000000',0)],[1,rgba('#000000',.55)]]);c.fillRect(a.x,e.y-30,e.x-a.x,30);}
  c.fillStyle=lin(c,0,a.y,0,e.y,[[0,rgba('#000000',.6)],[1,rgba('#000000',0)]]);c.fillRect(a.x,a.y,e.x-a.x,e.y-a.y);
  if(up){c.save();c.globalCompositeOperation='lighter';K.glowAt(c,cx+8,a.y+rr*.9,22,'#ffb25e',.35*P.lamp+.1);c.restore();c.fillStyle='#ffcf86';c.fillRect(cx+6,a.y+rr*.9-2,4,4);}
  c.restore();
  wallLamp(c,P,up?x1+10:x0-10,120,dusk(P)?1:.5);}
// Tarr's water main along the wall over the street, on brackets, its valve wheel with a rag of the Pump King's blue tied on, rust run
// down from its joints; at the top it goes on up into the rock by the arch
function wallPipe(c,P){const far=Y().far,sh=(col,k)=>K.shade(P,col,k),r=rng(311),pts=[];for(let x=-170;x<=1150;x+=10){pts.push(Q(x,lerp(0,132,clamp((x-150)/594,0,1))+122,far));}
  c.strokeStyle=sh('#2a201a',1.1);c.lineWidth=7;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();
  c.strokeStyle=rgba(P.light,.05+.25*P.lightA);c.lineWidth=1.2;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y-2.6):c.moveTo(p.x,p.y-2.6));c.stroke();
  for(let x=-150;x<1150;x+=70+r()*30){const p=Q(x,lerp(0,132,clamp((x-150)/594,0,1))+122,far);c.fillStyle=sh('#1c1612');c.fillRect(p.x-2,p.y-5,4,12);c.fillStyle=lin(c,0,p.y+3,0,p.y+30,[[0,rgba(K.shade(P,'#7a3a18'),.4)],[1,rgba('#7a3a18',0)]]);c.fillRect(p.x-1.4,p.y+3,2.8,27);}
  {const x=520,p=Q(x,lerp(0,132,(x-150)/594)+122,far);c.strokeStyle=sh('#5a2418');c.lineWidth=1.6;c.beginPath();c.arc(p.x,p.y-12,6,0,TAU);c.moveTo(p.x-6,p.y-12);c.lineTo(p.x+6,p.y-12);c.moveTo(p.x,p.y-18);c.lineTo(p.x,p.y-6);c.stroke();c.fillStyle=sh('#1c1612');c.fillRect(p.x-1.4,p.y-8,2.8,8);
    c.fillStyle=K.shade(P,'#2f5c7c',.8);c.beginPath();c.moveTo(p.x+4,p.y-16);c.lineTo(p.x+8,p.y-14);c.lineTo(p.x+7,p.y-3);c.lineTo(p.x+5,p.y-6);c.closePath();c.fill();}}
// washing strung across from one shack to another
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
// ---------- the Shelf stair's own ----------
// the bare stretch where the silent row sits: the stone, the keeping niche with its candle stub and the marks round it (a tally for
// each tune hummed there at dusk), Hallowell's old billboard over it all, its paper peeling
function rowWall(c,P){const R=Y(),far=R.far,x0=R.beggars.x0-22,x1=R.oldman.x+26,sh=(col,k)=>K.shade(P,col,k),r=rng(301);
  stoneWall(c,P,x0,x1,301);
  // the keeping niche: an arch cut in the stone, the candle stub on its saucer, chalk marks round it in fives
  {const nx=R.beggars.x0+60,p=Q(nx,sy(nx)+58,far);c.fillStyle='#0c0a09';c.beginPath();c.moveTo(p.x-8,p.y);c.lineTo(p.x-8,p.y-14);c.arc(p.x,p.y-14,8,Math.PI,0);c.lineTo(p.x+8,p.y);c.closePath();c.fill();
    c.fillStyle=sh('#d8ccb0');c.fillRect(p.x-1.4,p.y-7,2.8,6);c.fillStyle=sh('#6a6050');c.fillRect(p.x-5,p.y-1.4,10,1.4);WLAMPS.push({x:p.x,y:p.y-9,k:dusk(P)?.5:.25,small:1});
    // at dusk, keeping-tune hour, two more stubs lit on the stone at its foot
    if(dusk(P))for(const dx of [-12,11]){c.fillStyle=sh('#d8ccb0');c.fillRect(p.x+dx-1,p.y+4,2.2,4.6);WLAMPS.push({x:p.x+dx,y:p.y+2.6,k:.42,small:1});}
    c.strokeStyle=rgba(K.shade(P,'#d8d0c0',.5),.45);c.lineWidth=.7;c.beginPath();
    for(let g=0;g<7;g++){const gx=p.x+(g<4?-22-((g%2)*10):14+((g%2)*10)),gy=p.y-30+Math.floor(g/2)*10-(g>3?14:0);for(let k=0;k<4;k++){c.moveTo(gx+k*1.8,gy);c.lineTo(gx+k*1.8,gy+5);}c.moveTo(gx-1,gy+4);c.lineTo(gx+7,gy+1);}
    c.stroke();}
  // the billboard behind the row, under the main: Hallowell's words for its pistol, the paper gone in strips at the foot
  {const bx=(R.beggars.x0+R.beggars.x1)/2+30,p=Q(bx,sy(bx)+74,far),w=166,h=46,l=p.x-w/2,t=p.y-h;
    c.fillStyle=sh('#1e1814',1.2);c.fillRect(l-3,t-3,w+6,h+6);c.fillStyle=sh('#b8ae98',.95);c.fillRect(l,t,w,h);
    c.fillStyle=sh('#23304a',.9);c.fillRect(l,t,w,11);
    c.textAlign='center';c.textBaseline='middle';c.font='700 7.5px '+SERIF;c.fillStyle=sh('#d8d0bc',.7);c.fillText('HALLOWELL ARMS',p.x,t+6);
    c.font='700 12px '+SERIF;c.fillStyle=sh('#23304a',.85);c.fillText('THE GUARDIAN NINE',p.x,t+21);
    c.fillStyle=sh('#7a2a1e',.85);c.fillRect(p.x-30,t+29,60,.8);c.font='700 7.5px '+SERIF;c.fillText('SLEEP SOUND',p.x,t+36);
    // weather and the strips torn away down to the board
    c.fillStyle=rgba('#000000',.16);for(let i=0;i<16;i++)c.fillRect(l+r()*w,t+r()*h,3+r()*14,1+r()*2);
    for(let i=0;i<4;i++){const tx=l+12+i*40+r()*10,tw=6+r()*12;c.fillStyle=sh('#3a3228',1.1);c.beginPath();c.moveTo(tx,p.y);c.lineTo(tx+tw,p.y);c.lineTo(tx+tw*.7,p.y-6-r()*12);c.lineTo(tx+tw*.2,p.y-4-r()*8);c.closePath();c.fill();}
    c.fillStyle=rgba(P.light,.06+.2*P.lightA);c.fillRect(l,t,w,1);}}
// what the row owns, against the wall behind each place: bundles tied in cloth, a pot, a stick leaning; cardboard propped at three of
// the places, the words gone to a scrawl
function rowThings(c,P,T){const R=Y(),far=R.far,r=rng(611);
  for(const [bx,k] of [[372,0],[468,1],[566,2]]){const h=sy(bx),p=Q(bx,h,far-12);c.fillStyle=K.shade(P,['#4a4030','#3e3a2e','#5a4436'][k],1);c.beginPath();c.ellipse(p.x,p.y-6,10,7,0,0,TAU);c.fill();
    c.fillStyle=rgba(P.light,.04+.18*P.lightA);c.beginPath();c.ellipse(p.x-2,p.y-10,6,2.4,0,0,TAU);c.fill();c.fillStyle=K.shade(P,'#2a2018');c.fillRect(p.x-1.4,p.y-14,2.8,4);}
  {const h=sy(520),p=Q(520,h,far-8);c.fillStyle=K.shade(P,'#2a2826');c.beginPath();c.ellipse(p.x,p.y-4,6,4.6,0,0,TAU);c.fill();c.fillStyle=rgba('#000000',.5);c.beginPath();c.ellipse(p.x,p.y-8,4.4,1.4,0,0,TAU);c.fill();}
  {const h=sy(604),a=Q(604,h,far-6),b=Q(612,h+66,far-2);c.strokeStyle=K.shade(P,'#4a3826');c.lineWidth=1.8;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
  for(const bx of [350,452,580]){const h=sy(bx),p=Q(bx,h,far-3),w=13,hh=10;c.save();c.translate(p.x,p.y);c.rotate(-.08);c.fillStyle=K.shade(P,'#7a6448',.8);c.fillRect(-w/2,-hh,w,hh);
    c.strokeStyle=rgba('#1a120a',.7);c.lineWidth=.7;c.beginPath();for(let k=0;k<2;k++){const yy=-hh+3+k*3.6;c.moveTo(-w/2+2,yy);for(let s=1;s<=4;s++)c.lineTo(-w/2+2+s*2.2,yy+(s%2?-.9:.6)+r()*.4);}c.stroke();c.restore();}}
// the beggars' sacking, one on each step along their row (they sit on it, the old man at the row's end): sacks laid open, a folded
// blanket, rags, from just in front of where they sit back to behind them
function rowSacking(c,P,T){const R=Y(),far=R.far,r=rng(621),B=R.beggars,bd=B.d??168,xa=B.x0-6,xb=Math.max(B.x1,R.oldman?R.oldman.x+16:B.x1);
  for(const t of T){const x0=Math.max(t.x0+2,xa),x1=Math.min(t.x1-2,xb);if(x1-x0<12)continue;const h=t.h,d0=bd-8,d1=Math.min(far-3,bd+20+r()*6);
    c.fillStyle=K.shade(P,['#5a4a32','#4a4030','#3e3a2e','#5a4436'][(r()*4)|0],.9);K.poly(c,[Q(x0,h,d0),Q(x1,h,d0+1),Q(x1-1,h,d1),Q(x0+1,h,d1)]);c.fill();
    c.strokeStyle=rgba('#000000',.25);c.lineWidth=.6;c.beginPath();const a=Q(x0+(x1-x0)*.3,h,d0+3),b=Q(x0+(x1-x0)*.36,h,d1-2);c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
    c.fillStyle=rgba(P.light,.05+.15*P.lightA);K.poly(c,[Q(x0,h,d0),Q(x1,h,d0+1),Q(x1,h,d0+4),Q(x0,h,d0+3)]);c.fill();}}
// the Shelf stair's wall from end to end
function shelfWall(c,P){const R=Y(),far=R.far,sh=(col,k)=>K.shade(P,col,k);
  // the foot: the rock the landing runs on to, and the arch in it where the switchback comes up out of the wall
  {const pts=[Q(-170,250,far),Q(-46,250,far),Q(-46,-40,far),Q(-170,-40,far)];c.fillStyle=sh('#302a26',1.25);K.poly(c,pts);c.fill();
    c.save();K.poly(c,pts);c.clip();const r=rng(707);for(let i=0;i<30;i++){const p=Q(-170+r()*124,-30+r()*270,far);c.fillStyle=rgba(r()<.5?'#000000':P.light,r()<.5?.12:.02+.05*P.lightA);c.fillRect(p.x,p.y,8+r()*20,2+r()*4);}c.restore();}
  arch(c,P,-150,-66,false);wayBoard(c,P,-108,178,'THE FLOOR',-1);
  // the bottom landing: a tea stall in the front of a tall shack, a lamp, its sign
  front(c,P,{x0:-40,x1:150,top:186,seed:403,col:'#3a2e28',wins:[[30,16,18,14],[120,16,18,14]],patch:1});
  stallFront(c,P,-20,130,{sign:'TEA',sub:'BELLBREAD',ware:teaWare,seed:5});
  wallLamp(c,P,142,134,dusk(P)?1:0);
  // up the steps: two fronts stepping up, a cookshop with its chimney, then the row's stretch
  front(c,P,{x0:150,x1:236,top:178,seed:411,col:'#2e2a2c',kind:'tin',wins:[[22,26,14,12]],doors:[[214,22,96,0]]});
  front(c,P,{x0:236,x1:322,top:196,seed:413,col:'#40362c',wins:[[16,22,16,12],[56,22,14,12]],doors:[[300,24,100,1]],tip:-4});
  {const p=Q(268,200,far);c.fillStyle=sh('#201a18');c.fillRect(p.x-3,p.y-30,6,30);c.fillStyle=sh('#2a2220');c.fillRect(p.x-5,p.y-33,10,3);NEARCH.push({x:p.x,y:p.y-33,s:1.6});}
  wallLamp(c,P,232,140,dusk(P)?.5:0);
  rowWall(c,P);
  // past the old man: a shack on the last steps, then the top landing's shop
  front(c,P,{x0:666,x1:744,top:262,seed:421,col:'#38302a',wins:[[16,30,14,12]],doors:[[722,24,98,0]],patch:1});
  front(c,P,{x0:744,x1:900,top:290,seed:423,col:'#33292a',wins:[[24,26,18,14],[96,26,18,14],[60,74,16,12]],doors:[[800,28,104,1]]});
  wallLamp(c,P,700,150,dusk(P)?.85:0);wallLamp(c,P,880,150,dusk(P)?1:.5);}
function shelfOver(c,P){const far=Y().far,sh=(col,k)=>K.shade(P,col,k);
  washing(c,P,316,196,672,240,7);washing(c,P,678,262,860,290,9);
  // the old man's crate against the wall behind his place at the end of the row, turned over, a tin pot on it
  {const om=Y().oldman,p=Q(om.x,sy(om.x),far-10),q=Q(om.x+14,sy(om.x)+14,far-26);c.fillStyle=sh('#3a2c1e',1.2);c.fillRect(p.x-12,q.y,24,p.y-q.y);c.fillStyle=K.topLit(P,'#4a3a28',.6);c.fillRect(p.x-12,q.y-2,24,3);
    c.fillStyle=sh('#4a4644');c.fillRect(p.x-3,q.y-8,7,6);c.fillStyle=K.topLit(P,'#4a4644',.7);c.fillRect(p.x-3,q.y-9,7,1.4);}}
// ---------- the Lane stair's own ----------
// the fish stall over the short flight down to the lane: its shutter of tin pulled down and locked, a fish painted on it gone pale, and
// on its post the Tarkesh foundries' mark, a root cracking a stone, cut in by whoever first kept it
function fishStall(c,P){const far=Y().far,sh=(col,k)=>K.shade(P,col,k);
  front(c,P,{x0:-170,x1:-40,top:150,seed:501,col:'#2c2826',wins:[[30,14,14,11]]});
  const a=Q(-160,64,far),e=Q(-52,sy(-52),far);K.tin(c,a.x,a.y,e.x-a.x,e.y-a.y,{base:sh('#4a4640',1.05),seed:503,pal:P,rust:5});
  c.fillStyle=sh('#1a1612',1.1);c.fillRect(a.x-2,a.y-4,e.x-a.x+4,4);
  // the fish: a long body, its tail, an eye, the scales a few strokes
  {const fx=(a.x+e.x)/2-4,fy=a.y+(e.y-a.y)*.42,fc=K.shade(P,'#6a7a84',.7);c.fillStyle=fc;c.beginPath();c.ellipse(fx,fy,20,7,0,0,TAU);c.fill();
    c.beginPath();c.moveTo(fx+17,fy);c.lineTo(fx+30,fy-8);c.lineTo(fx+28,fy);c.lineTo(fx+30,fy+8);c.closePath();c.fill();
    c.fillStyle=sh('#1a1612');c.beginPath();c.arc(fx-13,fy-1.4,1.3,0,TAU);c.fill();c.strokeStyle=rgba('#1a1612',.5);c.lineWidth=.6;c.beginPath();for(let k=0;k<4;k++){c.moveTo(fx-6+k*5,fy-4);c.quadraticCurveTo(fx-3+k*5,fy,fx-6+k*5,fy+4);}c.stroke();
    c.font='700 8px '+SERIF;c.textAlign='center';c.textBaseline='middle';c.fillStyle=rgba(K.shade(P,'#c8c0b0',.6),.6);c.fillText('FISH',fx,fy+15);}
  // the padlock on its hasp
  {const lp=Q(-106,8,far-2);c.fillStyle=sh('#2a2622');c.fillRect(lp.x-3,lp.y-5,6,5);c.strokeStyle=sh('#3a3632');c.lineWidth=1.2;c.beginPath();c.arc(lp.x,lp.y-5,2.4,Math.PI,0);c.stroke();}
  // the post, and the mark cut in it: a stone, split from top to foot, the roots coming out under it
  {const pa=Q(-48,sy(-48),far-2),pb=Q(-48,104,far-2);c.fillStyle=sh('#2a1e14',1.1);c.fillRect(pa.x-4,pb.y,8,pa.y-pb.y);
    const m=Q(-48,62,far-3),mc=K.shade(P,'#b8b0a0',.6);c.strokeStyle=mc;c.lineWidth=.8;c.lineJoin='round';
    c.beginPath();c.moveTo(m.x-3.4,m.y+2.6);c.lineTo(m.x-3,m.y-2.4);c.lineTo(m.x,m.y-4);c.lineTo(m.x+3.2,m.y-2.2);c.lineTo(m.x+3.4,m.y+2.6);c.closePath();c.stroke();
    c.beginPath();c.moveTo(m.x+.2,m.y-4);c.lineTo(m.x-.8,m.y-1.4);c.lineTo(m.x+.8,m.y+.4);c.lineTo(m.x,m.y+2.6);
    c.moveTo(m.x,m.y+2.6);c.lineTo(m.x,m.y+6.4);c.moveTo(m.x,m.y+3.6);c.quadraticCurveTo(m.x-2.6,m.y+4.4,m.x-3.6,m.y+7);c.moveTo(m.x,m.y+3.6);c.quadraticCurveTo(m.x+2.6,m.y+4.4,m.x+3.6,m.y+7);c.stroke();c.lineJoin='miter';}}
// the choirhouse: its little bell-cote on the roof, the bell and its rope, the board over its door; at dusk the door stands open on
// the warm room where they sing
function choirhouse(c,P,x0,x1,top){const far=Y().far,sh=(col,k)=>K.shade(P,col,k),cx=(x0+x1)/2-6;
  {const b=Q(cx,top+2,far),t=Q(cx,top+26,far);c.fillStyle=sh('#22180f',1.1);c.fillRect(b.x-9,t.y,2.6,b.y-t.y);c.fillRect(b.x+6.4,t.y,2.6,b.y-t.y);
    c.fillStyle=K.topLit(P,'#4a4644',.8);c.beginPath();c.moveTo(b.x-12,t.y+1);c.lineTo(b.x,t.y-8);c.lineTo(b.x+12,t.y+1);c.closePath();c.fill();
    c.fillStyle=sh('#5a4a30',.8);c.beginPath();c.moveTo(b.x-4,t.y+11);c.quadraticCurveTo(b.x-4,t.y+3,b.x,t.y+3);c.quadraticCurveTo(b.x+4,t.y+3,b.x+4,t.y+11);c.closePath();c.fill();
    c.fillStyle=rgba(P.light,.08+.3*P.lightA);c.fillRect(b.x-3,t.y+4,1,6);c.strokeStyle=K.shade(P,'#6a5a40',.8);c.lineWidth=.6;c.beginPath();c.moveTo(b.x,t.y+11);c.lineTo(b.x+1,b.y+30);c.stroke();}
  {const dx=192,p=Q(dx,sy(dx)+100,far);c.font='700 8px '+SERIF;const tw=c.measureText('CHOIRHOUSE').width+10;c.fillStyle=sh('#1e1814',1.1);c.fillRect(p.x-tw/2,p.y-11,tw,12);
    c.textAlign='center';c.textBaseline='middle';c.fillStyle=K.shade(P,'#d8c8a0',.55);c.fillText('CHOIRHOUSE',p.x,p.y-4.6);}
  // the tracts pasted by its door
  for(const [tx,th,tl] of [[172,60,-.06],[184,52,.05],[178,40,.1]])pasted(c,P,tx,th,10,13,'#b8b098',tl,(g,l,t,w,h)=>printLines(g,l+1.6,t+2,w-3.2,h-4,rgba('#1a1612',.55),2.2,.6));}
// the Mendery's door: its sign hung out on a bracket, a hand stitched across the wrist, and the words over the lintel
function mendery(c,P){const far=Y().far,sh=(col,k)=>K.shade(P,col,k),dx=300;
  {const p=Q(dx,sy(dx)+108,far);c.font='700 7.5px '+SERIF;c.textAlign='center';c.textBaseline='middle';c.fillStyle=K.shade(P,'#c87a5a',.55);c.fillText('FREE MENDING',p.x,p.y);}
  {const bx=318,b=Q(bx,sy(bx)+132,far);c.strokeStyle=sh('#1a1612');c.lineWidth=1.4;c.beginPath();c.moveTo(b.x-2,b.y);c.lineTo(b.x+16,b.y);c.moveTo(b.x+4,b.y);c.lineTo(b.x+4,b.y+4);c.moveTo(b.x+14,b.y);c.lineTo(b.x+14,b.y+4);c.stroke();
    const sx=b.x+1,sy2=b.y+4;c.fillStyle=sh('#3a3226',1.05);c.fillRect(sx,sy2,16,18);c.fillStyle=sh('#1a1410',1.1);c.fillRect(sx,sy2+17,16,1.2);
    const hc=K.shade(P,'#c8b8a0',.55);c.fillStyle=hc;c.fillRect(sx+5,sy2+9,7,7);for(let k=0;k<4;k++)c.fillRect(sx+5+k*1.8,sy2+3+(k%2),1.4,6);c.fillRect(sx+3.4,sy2+8,2,3.4);
    c.strokeStyle=K.shade(P,'#8a2a1e',.6);c.lineWidth=.8;c.beginPath();c.moveTo(sx+4,sy2+15.4);c.lineTo(sx+13,sy2+15.4);for(let k=0;k<4;k++){c.moveTo(sx+5+k*2.2,sy2+14);c.lineTo(sx+5+k*2.2,sy2+16.8);}c.stroke();}
  // jars on the sill of its second window (the front's windows are placed from its top-left on the screen)
  {const a=Q(236,200,far);for(let k=0;k<4;k++){c.fillStyle=rgba(K.shade(P,['#8a6a3a','#5a6a3a','#6a3a3a','#3a4a5a'][k],.5),.85);c.fillRect(a.x+57+k*3.2,a.y+22+6,2.4,5);}}}
// the bare stretch up the steps: the stone; a rondel court chalked on it, the ball's marks, the bills for the match and the Nightglass
// pasted up, a numbers board at the far end where the runner stands
function laneBare(c,P){const R=Y(),far=R.far,sh=(col,k)=>K.shade(P,col,k),x0=R.beggars.x0-22,x1=R.oldman.x+26,r=rng(331);
  stoneWall(c,P,x0,x1,331);
  // the court: its frame, the line across, the ring in the middle, chalked level on the wall at a child's height and rubbed half away;
  // the marks where the ball comes back
  {const ca=340,cb=416,y0=58,y1=98,chalk=rgba(K.shade(P,'#e8e0d0',.45),.26),at=(x,h)=>Q(x,h,far);c.strokeStyle=chalk;c.lineWidth=.9;c.setLineDash([7,2,4,3]);
    {const a=at(ca,y1),b=at(cb,y0);c.strokeRect(a.x,a.y,b.x-a.x,b.y-a.y);const m=at(ca,y0+14),n=at(cb,y0+14);c.beginPath();c.moveTo(m.x,m.y);c.lineTo(n.x,n.y);c.stroke();}
    c.setLineDash([]);{const m=at((ca+cb)/2,(y0+y1)/2+5);c.beginPath();c.ellipse(m.x,m.y,7,5.4,0,0,TAU);c.stroke();}
    c.fillStyle=rgba('#000000',.2);for(let i=0;i<9;i++){const m=at(ca+6+r()*(cb-ca-12),y0+4+r()*(y1-y0-8));c.beginPath();c.arc(m.x,m.y,1.4+r(),0,TAU);c.fill();}
    // the ball, left at the wall's foot
    const bp=Q(cb-14,sy(cb-14),far-10);c.fillStyle=K.shade(P,'#8a3a26',.8);c.beginPath();c.arc(bp.x,bp.y-3.4,3.4,0,TAU);c.fill();c.fillStyle=rgba(P.light,.1+.3*P.lightA);c.fillRect(bp.x-2,bp.y-6,2,1);}
  // the match bill: the court's name, a ball, the day
  pasted(c,P,456,56,38,48,'#c8b890',-.03,(g,l,t,w,h)=>{g.fillStyle=K.shade(P,'#7a2a1e',.7);g.fillRect(l,t,w,12);g.textAlign='center';g.textBaseline='middle';g.font='700 8px '+SERIF;g.fillStyle=K.shade(P,'#e8dcc0',.5);g.fillText('RONDEL',l+w/2,t+6.5);
    g.fillStyle=K.shade(P,'#2a2420',.6);g.beginPath();g.arc(l+w/2,t+24,6,0,TAU);g.fill();g.font='700 6px '+SERIF;g.fillText('RESTDAY',l+w/2,t+h-6);});
  // the Nightglass, a whole page of it
  pasted(c,P,506,48,44,58,'#bab2a2',.04,(g,l,t,w,h)=>{g.textAlign='center';g.textBaseline='middle';g.font='700 6.4px '+SERIF;g.fillStyle=K.shade(P,'#141210',.6);g.fillText('THE NIGHTGLASS',l+w/2,t+5);
    g.fillRect(l+3,t+9,w-6,.8);g.font='700 7px '+SERIF;g.fillText('RITES RUN',l+w/2,t+15);g.fillText('LONG AGAIN',l+w/2,t+22);g.fillStyle=K.shade(P,'#4a4640',.6);g.fillRect(l+4,t+27,w*.45,14);
    printLines(g,l+w*.52,t+27,w*.42,14,rgba('#1a1612',.5),2.4,.6);printLines(g,l+4,t+44,w-8,h-48,rgba('#1a1612',.5),2.4,.6);});
  // tracts pasted over one another
  for(const [tx,th,tl] of [[556,74,-.1],[568,66,.08],[550,58,.04],[580,78,-.05]])pasted(c,P,tx,th,11,14,'#c0b8a4',tl,(g,l,t,w,h)=>printLines(g,l+1.6,t+2,w-3.2,h-4,rgba('#1a1612',.55),2.2,.6));
  // the numbers board: slate on a nail, the day's numbers chalked in columns
  {const nx=628,p=Q(nx,sy(nx)+58,far),w=30,h=36;c.fillStyle=sh('#1a1612');c.fillRect(p.x-w/2-2,p.y-h-2,w+4,h+4);c.fillStyle=sh('#2a302c',1.1);c.fillRect(p.x-w/2,p.y-h,w,h);
    const ck=rgba(K.shade(P,'#e8e0d0',.4),.6);c.textAlign='center';c.textBaseline='middle';c.font='700 5.6px '+SERIF;c.fillStyle=ck;c.fillText('NUMBERS',p.x,p.y-h+5);
    c.fillRect(p.x-w/2+3,p.y-h+9,w-6,.6);for(let k=0;k<3;k++)for(let q=0;q<4;q++){c.fillRect(p.x-w/2+4+k*9,p.y-h+13+q*5.4,2.2+((k+q)%3),1.1);c.fillRect(p.x-w/2+7.6+k*9,p.y-h+13+q*5.4,1.1,1.1);}}}
// the switchback's stand at the top of the Lane stair (the game's stand: the board at x, the stool at sit, the big one's place at by):
// the water toll board on the shop's front, the strongbox under it chained to a ring in the wall, the collector's stool to the left of
// it on the stair's top step, the brazier to the right (cold at dusk, its men gone down the stair); the board reads between the two of
// them by day (the big one stands as far right as anyone stands: 840)
function tollStand(c,P){const R=Y(),far=R.far,Sd=R.stand||L0.stand,sh=(col,k)=>K.shade(P,col,k),r=rng(951);
  // the board: painted, weathered, a pump drawn on it, its words
  {const bx=Sd.x,p=Q(bx,sy(bx)+30,far),w=86,h=34;c.fillStyle=sh('#2a2018',1.2);c.fillRect(p.x-w/2-3,p.y-h-3,w+6,h+6);c.fillStyle=sh('#5a5444',1.05);c.fillRect(p.x-w/2,p.y-h,w,h);
    c.fillStyle=rgba('#000000',.18);for(let i=0;i<10;i++)c.fillRect(p.x-w/2+r()*w,p.y-h+r()*h,4+r()*14,1+r()*2);
    c.font='700 11px '+SERIF;c.textAlign='center';c.textBaseline='middle';c.fillStyle=sh('#7a2a1e',.9);c.fillText('WATER TOLL',p.x+8,p.y-h*.62);
    c.font='700 7px '+SERIF;c.fillText('ONE CHIT A BAG',p.x+8,p.y-h*.26);
    c.strokeStyle=sh('#7a2a1e',.9);c.lineWidth=1.4;c.beginPath();c.moveTo(p.x-w/2+8,p.y-6);c.lineTo(p.x-w/2+8,p.y-h+8);c.lineTo(p.x-w/2+16,p.y-h+10);c.moveTo(p.x-w/2+8,p.y-h+14);c.lineTo(p.x-w/2+3,p.y-h+11);c.stroke();
    c.fillStyle=rgba(P.light,.06+.2*P.lightA);c.fillRect(p.x-w/2,p.y-h,w,1);}
  // the strongbox against the wall under the board, its chain to the ring
  {const p=Q(Sd.x+16,sy(Sd.x+16),far-6);c.fillStyle=sh('#2a2a2e',1.1);c.fillRect(p.x-9,p.y-11,18,11);c.fillStyle=K.topLit(P,'#3a3a40',.6);c.fillRect(p.x-9,p.y-12,18,1.6);c.fillStyle=sh('#5a5040');c.fillRect(p.x-1.6,p.y-8,3.2,3);
    const rg=Q(Sd.x+30,sy(Sd.x+30)+18,far);c.strokeStyle=sh('#4a4640');c.lineWidth=1;c.beginPath();c.arc(rg.x,rg.y,2,0,TAU);c.moveTo(rg.x-1,rg.y+2);c.quadraticCurveTo(rg.x-6,p.y-4,p.x+9,p.y-6);c.stroke();}
  // the stool he sits on, left of the board: four legs splayed under a round of plank
  {const sx=Sd.sit,sd=Sd.d+2,g=sy(sx),h=18;c.strokeStyle=sh('#2a1e14',1.1);c.lineWidth=1.8;c.beginPath();
    for(const [dx,dd] of [[-6,-3],[6,-3],[-5,4],[5,4]]){const f=Q(sx+dx,g,sd+dd),t=Q(sx+dx*.6,g+h,sd+dd*.6);c.moveTo(f.x,f.y);c.lineTo(t.x,t.y);}c.stroke();
    c.fillStyle=K.topLit(P,'#4a3a28',.7);K.poly(c,[Q(sx-7,g+h,sd-4),Q(sx+7,g+h,sd-4),Q(sx+7,g+h,sd+4),Q(sx-7,g+h,sd+4)]);c.fill();
    c.fillStyle=sh('#2a1e14',1.2);const e0=Q(sx-7,g+h,sd-4),e1=Q(sx+7,g+h,sd-4);c.fillRect(e0.x,e0.y,e1.x-e0.x,1.6);}
  // the brazier: legs and a bowl, the coals red by day, gone grey at dusk
  {const bx=Sd.x+50,p=Q(bx,sy(bx),far-30);c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(p.x,p.y,12,3,0,0,TAU);c.fill();
    c.strokeStyle=sh('#1a1816');c.lineWidth=1.6;c.beginPath();c.moveTo(p.x-8,p.y);c.lineTo(p.x-5,p.y-14);c.moveTo(p.x+8,p.y);c.lineTo(p.x+5,p.y-14);c.stroke();
    c.fillStyle=sh('#262220');c.beginPath();c.moveTo(p.x-11,p.y-22);c.lineTo(p.x+11,p.y-22);c.lineTo(p.x+7,p.y-13);c.lineTo(p.x-7,p.y-13);c.closePath();c.fill();
    if(dusk(P)){c.fillStyle=sh('#4a4644',.8);c.fillRect(p.x-10,p.y-24,20,2.6);}
    else{c.fillStyle='#2a0c04';c.fillRect(p.x-10,p.y-24,20,2.6);c.fillStyle=rgba('#ff8a3c',.35+.4*P.fire);c.fillRect(p.x-8,p.y-24,16,1.6);COALS.push({x:p.x,y:p.y-24,big:1});NEARCH.push({x:p.x+2,y:p.y-28,s:2.4,coal:1});}}}
// the Lane stair's wall from end to end
function laneWall(c,P){const R=Y(),far=R.far,sh=(col,k)=>K.shade(P,col,k);
  fishStall(c,P);wayBoard(c,P,-96,96,'THE FLOOR',-1);
  // the first landing: a skewer stall in the front of a tall shack
  front(c,P,{x0:-40,x1:150,top:182,seed:507,col:'#362c28',wins:[[26,16,18,14],[124,18,16,13]],patch:1});
  stallFront(c,P,-20,130,{sign:'SKEWERS',sub:'TWO BITS',ware:skewerWare,cloth:'#3e3426',seed:9});
  wallLamp(c,P,-34,134,dusk(P)?1:.6);wallLamp(c,P,142,134,dusk(P)?1:0);
  // up the steps: the choirhouse, in tin, its bell over it; the Mendery's door in the next
  front(c,P,{x0:150,x1:236,top:184,seed:511,col:'#33302e',kind:'tin',wins:[[18,24,14,12]],doors:[[214,22,96,dusk(P)?1:0]]});
  choirhouse(c,P,150,236,184);
  front(c,P,{x0:236,x1:322,top:200,seed:513,col:'#3c3228',wins:[[16,22,16,12],[56,22,14,12]],doors:[[300,24,100,1]],tip:3});
  wallLamp(c,P,232,140,dusk(P)?.6:0);
  laneBare(c,P);
  // (the Mendery's sign and words hang out over the bare stone's edge)
  mendery(c,P);
  // the last steps, then the top landing's shop and the stand before it
  front(c,P,{x0:666,x1:744,top:256,seed:521,col:'#3a2e2c',wins:[[18,28,14,12]],doors:[[722,24,98,0]]});
  front(c,P,{x0:744,x1:900,top:294,seed:523,col:'#30282a',wins:[[22,24,18,14],[100,24,18,14]],doors:[[872,26,104,0]],patch:1});
  wallLamp(c,P,700,150,dusk(P)?.85:0);wallLamp(c,P,880,150,dusk(P)?1:.5);}
function laneOver(c,P){washing(c,P,150,214,330,234,13);washing(c,P,560,236,744,272,17);tollStand(c,P);}
// the back of the street from end to end
function backWall(c,P){const fl=flight(),sh=(col,k)=>K.shade(P,col,k);WLAMPS=[];NEARCH=[];COALS=[];
  // the rock between and behind the fronts, down to the steps
  {const pts=[];for(let x=-170;x<=1150;x+=8)pts.push(Q(x,sy(x)+40,Y().far));pts.push(Q(1150,-40,Y().far),Q(-170,-40,Y().far));c.fillStyle=sh('#26201c',1.3);K.poly(c,pts);c.fill();}
  if(fl==='lane')laneWall(c,P);else shelfWall(c,P);
  // the arch at the top landing the street goes on up through, the board by it
  arch(c,P,944,1040,true);wayBoard(c,P,916,44,'THE SHELF',1);
  front(c,P,{x0:1060,x1:1160,top:276,seed:fl==='lane'?531:431,col:'#3e3430',kind:'tin',wins:[[30,28,16,12]]});
  wallPipe(c,P);
  if(fl==='lane')laneOver(c,P);else shelfOver(c,P);}
// ---------- the drop under the open edge ----------
// From the ledge's face down: the timbers that hold the street out over the drop, and past them the street below in the dark, its
// doors and windows, smoke and the glow of fires further down (each flight its own street below)
function drop(c,P,T){const sh=(col,k)=>K.shade(P,col,k),lane=flight()==='lane',r=rng(lane?503:501);
  const top=[];for(const t of T)top.push(Q(t.x0,t.h-FACE,EDGE),Q(t.x1,t.h-FACE,EDGE));
  const pts=top.concat([Q(1150,-300,EDGE),Q(-170,-300,EDGE)]);
  c.save();K.poly(c,pts);c.clip();
  BELOW=K.drop(c,P,-200,1200,Q(0,132-FACE,EDGE).y,620,{seed:lane?9:7,rows:3,out:{fires:[]}});
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
  if(flight()==='shelf'){rowSacking(c,P,T);rowThings(c,P,T);}
  else{// on the Lane stair: the skewer stall's grease and the sticks dropped by it, a tract blown down onto the steps
    const r2=rng(641);for(let i=0;i<7;i++){const x=-10+r2()*140,p=Q(x,0,120+r2()*80);c.strokeStyle=rgba(K.shade(P,'#8a8478',.7),.5);c.lineWidth=.6;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x+5,p.y-1);c.stroke();}
    {const p=Q(56,0,168);c.fillStyle=rgba('#0a0806',.25);c.beginPath();c.ellipse(p.x,p.y,22,4,0,0,TAU);c.fill();}
    {const x=402,p=Q(x,sy(x),96);c.save();c.translate(p.x,p.y-1);c.rotate(.3);c.fillStyle=K.shade(P,'#b8b098',.75);c.fillRect(-4,-3,8,6);c.restore();}}}
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
  if(dusk(P)){// the last of the sky's light high up the wall, orange going to rose; the lamps' pools on the steps
    c.fillStyle=lin(c,0,-110,0,230,[[0,rgba('#ff9a5a',.22)],[.5,rgba('#ff7a6a',.08)],[1,rgba('#ff7a6a',0)]]);c.fillRect(-200,-110,1400,340);}
  else{const m=Q(480,60,120);K.cRad(c,m.x,m.y,20,520,P.light,.07,.4);}
  for(const L2 of WLAMPS){if(L2.k<=0||L2.small)continue;K.cRad(c,L2.x-20,L2.y+90,6,90,'#ffb25e',.1*L2.k*P.lamp,.45);}
  c.restore();
  // at dusk the shadows go violet
  if(dusk(P)){c.fillStyle=lin(c,0,140,0,GB,[[0,rgba('#3a2448',0)],[1,rgba('#3a2448',.16)]]);c.fillRect(-200,140,1400,GB-140);}
  c.fillStyle=lin(c,0,GB-40,0,GB+120,[[0,rgba('#000000',0)],[1,rgba('#000000',.55)]]);c.fillRect(-200,GB-40,1400,170);}
// ---------- the scene ----------
function paint(c){const P=K.pal(),X0=-170,X1=W+250,T0=-110,T=treads();
  backdrop(c,P,X0,X1,T0);backWall(c,P);drop(c,P,T);face(c,P,T);street(c,P,T);lightPass(c,P);}
// ---------- the pieces among the people: the row's tin cups ----------
// a tin cup set on the step before each of the silent row and the old man (the row's places are the game's: beggars x0..x1 by n, the
// old man at oldman.x); each painted once, set down at its depth in the floor's list
function cupPiece(i,x,d){const P=K.pal(),h=sy(x),a=Q(x-6,h+12,d),b=Q(x+6,h,d);
  return K.piece('stairscup'+i+'|'+P.key+':'+x+':'+d,a.x-2,a.y-2,b.x-a.x+4,b.y-a.y+4,c=>{const p=Q(x,h,d),sh=(col,k)=>K.shade(P,col,k);
    c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(p.x+1,p.y,4.6,1.4,0,0,TAU);c.fill();
    c.fillStyle=sh('#5a5650',.9);c.beginPath();c.moveTo(p.x-3.4,p.y-7);c.lineTo(p.x+3.4,p.y-7);c.lineTo(p.x+3,p.y);c.lineTo(p.x-3,p.y);c.closePath();c.fill();
    c.fillStyle=rgba('#000000',.3);c.fillRect(p.x+1,p.y-7,2,7);c.fillStyle=K.topLit(P,'#8a8680',.8);c.beginPath();c.ellipse(p.x,p.y-7,3.4,1,0,0,TAU);c.fill();
    c.fillStyle=rgba('#000000',.6);c.beginPath();c.ellipse(p.x,p.y-6.8,2.6,.6,0,0,TAU);c.fill();});}
function pieces(){if(flight()!=='shelf')return[];const R=Y(),B=R.beggars,n=B.n||6,out=[],d=(B.d??168)-20;
  for(let i=0;i<n;i++){const x=Math.round(B.x0+(B.x1-B.x0)*i/(n-1)+8);out.push({d,draw:c=>K.drawPiece(c,cupPiece(i,x,d))});}
  if(R.oldman){const x=R.oldman.x-10;out.push({d,draw:c=>K.drawPiece(c,cupPiece(n,x,d))});}
  return out;}
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
function live(){const t=S.t,P=K.pal(),T=P.key,fl=flight();ctx.save();
  K.upper('stairs:'+T+':'+fl,-1000,(c,x0,x1,y0,y1)=>{c.fillStyle=P.air[0];c.fillRect(x0,y0,x1-x0,y1-y0);
    K.shackRows(c,Object.assign({pal:P,x0:-170,x1:W+250,yTop:-650,clip:[-650,y1]},rows()));
    c.fillStyle=lin(c,0,-640,0,-470,[[0,rgba(P.sky[1],.8)],[1,rgba(P.air[0],0)]]);c.fillRect(x0,-640,x1-x0,170);
    K.skyTop(c,x0,x1,y0,-636,P,{tower:-40});
    if(T==='dusk'){c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,0,-640,0,-200,[[0,rgba('#ff9a5a',.18)],[1,rgba('#ff9a5a',0)]]);c.fillRect(x0,-640,x1-x0,440);c.restore();}});
  K.tram(ctx,t,P,-760);
  // smoke: the skewer grill and the brazier, the tea kettle's steam, the cookshop's chimney, the chimneys up the wall, the drop's fires
  {const srcs=[];for(const ch of NEARCH)srcs.push(ch.tea?{x:ch.x,y:ch.y,s:2,sp:.25,n:5,h:40,dx:8,a:.35}:ch.grill?{x:ch.x,y:ch.y,s:4,sp:.16,n:7,h:120,dx:16,a:.42}:ch.coal?{x:ch.x,y:ch.y,s:2.4,sp:.12,n:4,h:60,dx:8,a:.3}:{x:ch.x,y:ch.y,s:5,sp:.1,n:7,h:170,dx:20,a:.5});
    for(const ch of OUT.chims.slice(0,8))srcs.push({x:ch.x,y:ch.y,s:2.6*(ch.s||1),sp:.08,n:5,h:60+50*(ch.s||1),dx:12,a:.4*(1-ch.hz*.6),ph:ch.x*.013});
    K.smoke(ctx,srcs,t,P.smoke,1);}
  ctx.globalCompositeOperation='lighter';
  for(const f of OUT.fires.concat(BELOW.fires||[])){const a=(.6+.4*Math.sin(t*9+f.x)*Math.sin(t*3.3+f.y))*P.fire*(1-(f.hz||0)*.6);K.glowAt(ctx,f.x,f.y-4*f.s,14*f.s,'#ff8a3c',.55*a);K.glowAt(ctx,f.x,f.y-3*f.s,4*f.s,'#ffd28a',.8*a);}
  // the coals in the grill and the brazier, breathing
  for(const q of COALS){const a=(.55+.45*Math.sin(t*5.3+q.x*.7)*Math.sin(t*2.1+q.x))*P.fire;K.glowAt(ctx,q.x,q.y,q.big?14:8,'#ff6a2a',.4*a);}
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
const LAYOUT={edge:EDGE,face:FACE,rail:RAIL,down:DOWN,flight};
E.S.stairs={paint,live,fore,light,key,pieces,LAYOUT};
})();
// ===== ENV STAIRS END =====
