// ===== ENV SHAFT =====
// The family's lift going down from the kitchen to its railway (since V104): the steel car in its shaft, seen from the front with the
// shaft's near wall cut away, as the rooms are seen with their fourth wall gone. The shaft is old brick gone black, the car's guide rails
// up it on iron brackets, the hoist ropes going up from the car's crosshead to the big sheave at the shaft's head, the counterweight in
// its frame on the right, a caged lamp at every landing and the landing's brass plate under it; through the cut the brickwork shows its
// thickness and the clay it was built into, and at every landing the slab of its floor (the kitchen's with its quarry tiles on it). The
// car is the kitchen's own (sk_secretui.js draws it there): brushed steel lit by a strip in its ceiling, its two black glass leaves
// shut on him. The car stands where it is and the shaft goes up past it: S.shaft.y is how far the car has come down from the kitchen
// (world units). What happens in it is S.shaft's too, played by sk_lantern.js and drawn here: the gas that has come down after the car
// (gas), the spark off the arc-blade up through the car's roof (spark), the gas going away up the shaft in a sheet of flame (lit), the
// fireball coming down it after the car (ballH: its front's height over the roof), a pan off the range coming down ahead of it (pan),
// the car's brakes at the foot (brake).
(()=>{const E=EnvLook,{C,pp,poly,line,lin,rad,rgba,mix,glow,rng,lerp,clamp,TAU}=E;
const TX=()=>EnvTex;
// the layout is the game's (SHAFT in sk_lantern.js): the car's middle and the depth he stands at, the landings' spacing and the run
const L0=typeof SHAFT!=='undefined'?SHAFT:{cx:450,dep:68,lands:[0,230,460,1400],run:1400};
// world units: the shaft's side walls (their inner faces) at SX0 and SX1, its back wall at depth SB, the cut brickwork SW thick; the
// car's sides, the depth of its doors and of its back, its height inside, its doorway; its rails' depth and x; the counterweight's
// box; the landings (their depths under the kitchen's: the kitchen's the first, the line's the last) and the run between the first and
// the last; the sheave at the shaft's head, HM over the car's floor at the kitchen; a lamp on the back wall every LAMPS down the run
const SX0=300,SX1=600,SB=152,SW=30,CX0=L0.cx-44,CX1=L0.cx+44,CD0=32,CD1=104,CH=180,DW=66,DH=170,RD=68,RL=[CX0-9,CX1+9],
  CW={x0:530,x1:566,d0:62,d1:94,h:92},LANDS=L0.lands,RUN=L0.run,HM=CH+142,SHR=52,SHX=L0.cx+45,SHD=RD,LAMPS=280,
  NAMES=['G','B1','B2','L'];
const q=pp;
const st=()=>typeof S!=='undefined'&&S.shaft||null;
const Y=()=>{const s=st();return s?s.y:0;};
// a height in the shaft (from the line's landing up) at the world y it is at now, the car standing where it is
const wy=h=>GB-h+RUN-Y();
const ROOF=GB-CH-4;
// ---------- the textures ----------
let BR=null,BRC=null,CLAY=null;
function brick(){return BR||(BR=TX().brick(53,{cols:6,rows:10,bw:13,bh:4.6,sc:6,base:'#3a2620',alt:'#28180f',hot:'#462a1e',mortar:'#1e1a17'}));}
function brickCut(){return BRC||(BRC=TX().brick(54,{cols:6,rows:10,bw:13,bh:4.6,sc:6,base:'#4e3428',alt:'#3a251c',hot:'#5a3826',mortar:'#2e2824'}));}
function clay(){return CLAY||(CLAY=TX().plaster(57,256,256,{base:'#3a2c20'}));}
// (a pattern a context keeps, moved each frame: the shaft goes by)
const PATS=new WeakMap();
function pat(c,cv,x,y,u){let m=PATS.get(c);if(!m){m=new Map();PATS.set(c,m);}let p=m.get(cv);if(!p){p=c.createPattern(cv,'repeat');m.set(cv,p);}
  if(p.setTransform)p.setTransform(new DOMMatrix().translate(x,((y%9200)+9200)%9200).scale(u));return p;}
// a landing's brass plate, made once: the floor's name in it
const PLATES={};
function plate(k){if(PLATES[k])return PLATES[k];const cv=document.createElement('canvas'),s=4;cv.width=22*s;cv.height=12*s;const c=cv.getContext('2d');c.scale(s,s);
  c.fillStyle=lin(c,0,0,0,12,[[0,C.goldL],[.5,C.gold],[1,C.goldD]]);c.fillRect(0,0,22,12);c.fillStyle=rgba('#000000',.35);c.fillRect(1,1,20,10);
  c.fillStyle=lin(c,0,1,0,11,[[0,'#d8b468'],[1,'#8a6a2e']]);c.fillRect(1.6,1.6,18.8,8.8);
  c.font='700 7.4px "Alegreya SC", Georgia, serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#2a1c0c';c.fillText(NAMES[k]||'',11,6.4);
  c.fillStyle='#4a3818';for(const x of [2.6,19.4]){c.beginPath();c.arc(x,6,.8,0,TAU);c.fill();}
  return PLATES[k]=cv;}

// ---------- the still layer ----------
// Only the dark under everything: the shaft and the car are drawn as they go by (live), the cut through the wall too.
function paint(c){c.fillStyle='#06050a';c.fillRect(-200,-900,W+520,GB+1400);}

// ---------- the shaft going by ----------
const YT=-900,YB2=GB+520;
function backWall(c){const ox=SB*PSX,oy=SB*PSY,x0=SX0+ox,x1=SX1+ox,yo=GB+RUN-Y()-oy;
  c.fillStyle=pat(c,brick(),x0,yo,1/6);c.fillRect(x0,YT,x1-x0,YB2-YT);c.fillStyle=rgba('#07050a',.66);c.fillRect(x0,YT,x1-x0,YB2-YT);
  // soot run down it in streaks from each landing, and the damp
  const r=rng(31);for(let i=0;i<14;i++){const x=x0+r()*(x1-x0),k=Math.floor(r()*LANDS.length),y=wy(RUN-LANDS[k])-oy+6,L=40+r()*120;if(y>YB2||y+L<YT)continue;
    c.fillStyle=lin(c,0,y,0,y+L,[[0,rgba('#000000',.35)],[1,rgba('#000000',0)]]);c.fillRect(x,y,2+r()*5,L);}
  // at each landing: the steel sill beam its doors close on (the doors are in the near wall, cut away), and its brass plate
  for(let k=0;k<LANDS.length;k++){const yb=wy(RUN-LANDS[k])-oy;if(yb<YT-200||yb>YB2+20)continue;
    c.fillStyle='#14151a';c.fillRect(x0,yb-5,x1-x0,9);c.fillStyle=rgba(C.rim,.22);c.fillRect(x0,yb-5,x1-x0,1);c.fillStyle=rgba('#000000',.5);c.fillRect(x0,yb+4,x1-x0,1.4);
    for(let x=x0+12;x<x1;x+=24){c.fillStyle='#2a2c32';c.beginPath();c.arc(x,yb-.5,1,0,TAU);c.fill();}
    c.drawImage(plate(k),x0+40-11,yb-60,22,12);}}
function lampK(k){const t=typeof S!=='undefined'?S.t:0;return k===2?Math.max(.15,Math.pow(Math.max(0,Math.sin(t*11.3)*Math.sin(t*3.7+1)),.4)):.9+.1*Math.sin(t*2.1+k);}
function leftWall(c){c.save();c.transform(PSX,-PSY,0,1,SX0,0);const h=YB2-YT+SB*PSY;
  c.fillStyle=pat(c,brick(),0,GB+RUN-Y(),1/6);c.fillRect(0,YT,SB,h);
  c.fillStyle=lin(c,0,0,SB,0,[[0,rgba('#05040a',.58)],[1,rgba('#05040a',.8)]]);c.fillRect(0,YT,SB,h);c.restore();}
// the cut through the near wall: the clay outside, the brickwork's thickness, each landing's slab (the shaft's near wall itself away)
function section(c){const yo=GB+RUN-Y(),X0=-260,X1=W+300,a0=SX0-SW,b1=SX1+SW;
  c.fillStyle=pat(c,clay(),0,yo,.42);c.fillRect(X0,YT,a0-X0,YB2-YT);c.fillRect(b1,YT,X1-b1,YB2-YT);
  c.fillStyle=rgba('#0a070a',.5);c.fillRect(X0,YT,a0-X0,YB2-YT);c.fillRect(b1,YT,X1-b1,YB2-YT);
  // stones in the clay
  const r=rng(77);for(let i=0;i<46;i++){const left=i%2===0,x=left?X0+r()*(a0-X0-8):b1+8+r()*(X1-b1-8),h=r()*(RUN+HM+260)-60,y=wy(h);if(y<YT||y>YB2)continue;
    const rr=2.5+r()*6;c.fillStyle=mix('#3a342e','#5a5046',r());c.beginPath();c.ellipse(x,y,rr,rr*(.55+r()*.3),r()*3,0,TAU);c.fill();c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(x+rr*.2,y+rr*.25,rr*.8,rr*.4,0,0,TAU);c.fill();}
  // the brickwork, cut through: the courses in its face
  c.fillStyle=pat(c,brickCut(),0,yo,1/6);c.fillRect(a0,YT,SW,YB2-YT);c.fillRect(SX1,YT,SW,YB2-YT);
  c.fillStyle=rgba('#07050a',.36);c.fillRect(a0,YT,SW,YB2-YT);c.fillRect(SX1,YT,SW,YB2-YT);
  c.fillStyle=rgba(C.rim,.2);c.fillRect(SX0-1,YT,1,YB2-YT);c.fillRect(SX1,YT,1,YB2-YT);c.fillStyle=rgba('#000000',.45);c.fillRect(a0,YT,1.5,YB2-YT);c.fillRect(b1-1.5,YT,1.5,YB2-YT);
  // the floors, cut through at every landing, either side; the kitchen's with its tiles on it
  for(let k=0;k<LANDS.length;k++){const y=wy(RUN-LANDS[k]);if(y<YT-30||y>YB2+30)continue;for(const [x0,x1] of [[X0,SX0],[SX1,X1]])slab(c,x0,x1,y,k);}
  // the head of the shaft: the machine room's floor over the sheave
  {const y=wy(RUN+HM+SHR+40);if(y>YT){c.fillStyle='#0a0809';c.fillRect(X0,YT,X1-X0,y-22-YT);}if(y>YT-30&&y<YB2){c.fillStyle='#2a2826';c.fillRect(X0,y-22,X1-X0,22);c.fillStyle=rgba('#000000',.45);c.fillRect(X0,y-2,X1-X0,2);c.fillStyle=rgba(C.rim,.16);c.fillRect(X0,y-22,X1-X0,1);}}}
function slab(c,x0,x1,y,k){c.fillStyle='#2e2b28';c.fillRect(x0,y,x1-x0,16);c.fillStyle=lin(c,0,y,0,y+16,[[0,rgba('#9a9284',.26)],[.25,rgba('#000000',0)],[1,rgba('#000000',.5)]]);c.fillRect(x0,y,x1-x0,16);
  if(k===0){c.fillStyle='#5e2e1c';c.fillRect(x0,y-3,x1-x0,3);c.fillStyle=rgba('#ffcf9a',.22);c.fillRect(x0,y-3,x1-x0,.8);for(let x=x0+((x0*7)%20+20)%20;x<x1;x+=20){c.fillStyle=rgba('#000000',.4);c.fillRect(x,y-3,.8,3);}}
  else{c.fillStyle=rgba(C.rim,.2);c.fillRect(x0,y,x1-x0,1);}}
// the hoist at the shaft's head: the sheave on its beams, the ropes over it
function machine(c){const y=wy(RUN+HM);if(y<YT-120||y>YB2)return;const o=q(SHX,y,SHD),R=SHR;
  // the beams it sits on, across the shaft
  {const a=q(SX0,y-R-14,SHD-20),b=q(SX1,y-R-14,SHD-20);c.fillStyle='#121318';c.fillRect(a.x,a.y-10,b.x-a.x,12);c.fillStyle=rgba(C.rim,.2);c.fillRect(a.x,a.y-10,b.x-a.x,1);}
  c.fillStyle='#16171c';c.beginPath();c.arc(o.x,o.y,R,0,TAU);c.fill();c.strokeStyle='#2a2c34';c.lineWidth=5;c.beginPath();c.arc(o.x,o.y,R-3,0,TAU);c.stroke();
  c.strokeStyle=rgba(C.rim,.3);c.lineWidth=1;c.beginPath();c.arc(o.x,o.y,R-.5,Math.PI*1.1,Math.PI*1.7);c.stroke();
  // its spokes turning as the ropes run over it
  const a0=Y()/R;c.strokeStyle='#24262c';c.lineWidth=3;c.beginPath();for(let i=0;i<6;i++){const a=a0+i*TAU/6;c.moveTo(o.x,o.y);c.lineTo(o.x+Math.cos(a)*(R-6),o.y+Math.sin(a)*(R-6));}c.stroke();
  c.fillStyle=C.goldD;c.beginPath();c.arc(o.x,o.y,6,0,TAU);c.fill();c.fillStyle=C.goldL;c.beginPath();c.arc(o.x-1.5,o.y-1.5,1.6,0,TAU);c.fill();}
// the car's rails on their brackets back to the wall, and the counterweight's
function rails(c){for(const x of RL){const p0=q(x,0,RD);c.fillStyle='#1c1e24';c.fillRect(p0.x-1.6,YT,3.2,YB2-YT);c.fillStyle=rgba('#c8d4e0',.22);c.fillRect(p0.x-1.6,YT,1,YB2-YT);
    const per=115,h0=Math.floor((RUN-Y()-GB-560)/per);for(let k=h0;k<h0+20;k++){const y=wy(k*per);if(y<YT-20||y>YB2)continue;const a=q(x,y,RD),b=q(x,y,SB);c.strokeStyle='#121318';c.lineWidth=2.6;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
      c.fillStyle='#2a2c32';c.fillRect(a.x-2.4,a.y-2,4.8,4);}}
  for(const x of [CW.x0-4,CW.x1+4]){const p0=q(x,0,(CW.d0+CW.d1)/2);c.fillStyle='#17191e';c.fillRect(p0.x-1.2,YT,2.4,YB2-YT);c.fillStyle=rgba('#c8d4e0',.14);c.fillRect(p0.x-1.2,YT,.8,YB2-YT);}}
// the counterweight going up as the car comes down (it passes the car half way)
function cwY(){return GB+RUN-2*Y();}
function counterweight(c){const yb=cwY(),yt=yb-CW.h;if(yt>YB2||yb<YT)return;const {x0,x1,d0,d1}=CW;
  const F=[q(x0,yb,d0),q(x1,yb,d0),q(x1,yt,d0),q(x0,yt,d0)],R=[q(x1,yb,d0),q(x1,yb,d1),q(x1,yt,d1),q(x1,yt,d0)],T=[q(x0,yt,d0),q(x1,yt,d0),q(x1,yt,d1),q(x0,yt,d1)];
  poly(c,R,'#0e0f13');poly(c,T,'#24262c');poly(c,F,'#18191e');
  // the iron weights stacked in its frame
  for(let i=1;i<9;i++){const y=yb-i*CW.h/9,a=q(x0+3,y,d0),b=q(x1-3,y,d0);c.fillStyle=rgba('#000000',.55);c.fillRect(a.x,a.y-1,b.x-a.x,1.6);c.fillStyle=rgba(C.rim,.12);c.fillRect(a.x,a.y+.6,b.x-a.x,.8);}
  c.fillStyle='#2e3038';for(const x of [x0+1,x1-4]){const a=q(x,yb,d0),b=q(x,yt,d0);c.fillRect(a.x,b.y,3,a.y-b.y);}
  // its ropes up to the sheave
  ropesUp(c,[x0+10,x0+16,x1-16,x1-10],yt,(d0+d1)/2);}
// ropes going straight up from y at depth d (to the sheave's side at x st, or out of the picture)
function ropesUp(c,xs,y,d){const top=Math.max(YT,wy(RUN+HM));if(top>=y)return;c.strokeStyle='#1e2026';c.lineWidth=1.6;c.beginPath();
  for(const x of xs){const a=q(x,y,d),b=q(x,top,d);c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);}c.stroke();
  c.strokeStyle=rgba('#c8d4e0',.16);c.lineWidth=1;c.beginPath();for(const x of xs){const a=q(x,y,d),b=q(x,top,d);c.moveTo(a.x-.5,a.y);c.lineTo(b.x-.5,b.y);}c.stroke();}
// the lamps at the landings
function lampAt(j){const oy=SB*PSY,x0=SX0+SB*PSX;return{x:j%2?x0+222:x0+40,y:wy(RUN-112-j*LAMPS)-oy};}
function lamps(c,t){for(let j=0;j*LAMPS<=RUN;j++){const L=lampAt(j),lx=L.x,ly=L.y;if(ly<YT-60||ly>YB2)continue;const f=lampK(j);
    c.save();c.globalCompositeOperation='lighter';c.fillStyle=rad(c,lx,ly+6,2,96,[[0,rgba('#ffc27a',.2*f)],[.5,rgba('#ffa860',.06*f)],[1,rgba('#ffa860',0)]]);c.fillRect(lx-96,ly-90,192,192);c.restore();
    c.fillStyle='#0c0b0e';c.fillRect(lx-4,ly-9,8,4);c.fillStyle=rgba(f>.5?'#ffe6b0':'#6a5a40',.95);c.beginPath();c.ellipse(lx,ly,3.2,4.4,0,0,TAU);c.fill();
    c.strokeStyle='#121014';c.lineWidth=1.5;c.beginPath();c.moveTo(lx-4.6,ly-5);c.lineTo(lx-4.6,ly+5);c.moveTo(lx+4.6,ly-5);c.lineTo(lx+4.6,ly+5);c.moveTo(lx,ly-5);c.lineTo(lx,ly+6);c.moveTo(lx-4.6,ly+5);c.lineTo(lx+4.6,ly+5);c.stroke();
    glow(c,lx,ly,26,'#ffd08a',.55*f);}}

// ---------- the car ----------
// (behind him: its roof and crosshead over him, its right side, and inside it the back wall and the left side lit by the ceiling's
// strip, and the floor; in front of him, by depth: its face, the doors shut on him, the apron under them)
function carLight(){const s=st(),t=typeof S!=='undefined'?S.t:0;let k=1;
  if(s&&s.ballH!=null&&s.ballH<160){const n=clamp(1-s.ballH/160,0,1),f=Math.sin(t*37)*Math.sin(t*13.1+.4)*Math.sin(t*5.3+1.2);k=1-n*.5*clamp(f*2+.4,0,1);}
  if(s&&s.lit!=null){const u=t-s.lit;if(u>0&&u<.5)k*=.7+.3*Math.abs(Math.sin(u*60));}
  return k;}
function carBody(c,t){const yb=GB,yt=GB-CH,k=carLight(),cx=(CX0+CX1)/2;
  // the travelling cable looping down from under it into the dark
  {const a=q(CX0+12,yb+14,RD+10),b=q(CX0+30,yb+14,RD+10);c.strokeStyle='#0c0c10';c.lineWidth=3;c.beginPath();c.moveTo(a.x,a.y);c.bezierCurveTo(a.x-6,a.y+160,b.x+30,b.y+170,b.x+60,YB2+40);c.stroke();}
  // inside: the back wall, brushed steel, the rail; the left side; the floor
  {const a=q(CX0,yb,CD1),b=q(CX1,yb,CD1),e=q(CX1,yt,CD1),f=q(CX0,yt,CD1);
    c.fillStyle=lin(c,0,f.y,0,a.y,[[0,'#c4d8e8'],[.5,'#9ab3c6'],[1,'#7a92a6']]);c.fillRect(f.x,f.y,b.x-f.x,a.y-f.y);
    c.fillStyle=rgba('#ffffff',.08);for(let x=f.x+1.5;x<b.x;x+=2.5)c.fillRect(x,f.y,.6,a.y-f.y);
    c.fillStyle=rgba('#28384a',.5);c.fillRect((f.x+b.x)/2-.6,f.y,1.2,a.y-f.y);
    const ry=a.y-CH*.36;c.fillStyle=rgba('#28374a',.55);c.fillRect(f.x,ry+1.6,b.x-f.x,2.2);c.fillStyle='#dbe4ec';c.fillRect(f.x,ry-.6,b.x-f.x,2.2);
    // the strip's light on the top of the wall
    c.fillStyle=lin(c,0,f.y,0,f.y+40,[[0,rgba('#ffffff',.5)],[1,rgba('#ffffff',0)]]);c.fillRect(f.x,f.y,b.x-f.x,40);}
  {const P=[q(CX0,yb,CD0),q(CX0,yb,CD1),q(CX0,yt,CD1),q(CX0,yt,CD0)];poly(c,P,'#4b6073');c.fillStyle=lin(c,P[0].x,0,P[1].x,0,[[0,rgba('#ffffff',.06)],[1,rgba('#000000',.18)]]);poly(c,P);c.fill();}
  // (the floor's plate a lit steel, the strip's light lying on it: his boots and legs read against it, since V104's review)
  {const P=[q(CX0,yb,CD0),q(CX1,yb,CD0),q(CX1,yb,CD1),q(CX0,yb,CD1)];poly(c,P,'#3a4757');c.fillStyle=rgba('#bee2ff',.2);const m=q(cx,yb,(CD0+CD1)/2);c.beginPath();c.ellipse(m.x,m.y,40,12,0,0,TAU);c.fill();}
  // the light going: the car darkened by however much of its strip is out
  if(k<1){const P=[q(CX0,yb+2,CD0),q(CX1,yb+2,CD0),q(CX1,yb,CD1),q(CX1,yt,CD1),q(CX0,yt,CD1),q(CX0,yt,CD0)];c.fillStyle=rgba('#05070a',(1-k)*.8);poly(c,P);c.fill();}
  // the right side, outside: steel panels (in front of the inside's back wall where they meet on the screen)
  {const P=[q(CX1,yb+12,CD0),q(CX1,yb+12,CD1),q(CX1,ROOF,CD1),q(CX1,ROOF,CD0)];poly(c,P,'#2c3640');
    c.fillStyle=lin(c,P[0].x,0,P[1].x,0,[[0,rgba('#000000',.1)],[1,rgba('#000000',.45)]]);poly(c,P);c.fill();
    c.strokeStyle=rgba('#000000',.5);c.lineWidth=1.5;c.beginPath();for(const d of [56,80]){const a=q(CX1,yb+12,d),b=q(CX1,ROOF,d);c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);}c.stroke();}
  // the guide shoes under the car, on the rails (the roof and what is on it are over him: carTop, in the car's front)
  for(const x of RL){const p=q(x,GB+4,RD);c.fillStyle='#262830';c.fillRect(p.x-4,p.y-6,8,12);}}
// the roof, seen from over it: its steel plate with the vent in the middle (the slots), the crosshead across it and the rope hitch, the
// guide shoes on the rails at its corners, the hoist ropes up from the hitch. It is in front of him (whoever stands in the car is
// under it), so the car's front draws it first.
function carTop(c){const k=carLight(),cx=(CX0+CX1)/2;
  {const P=[q(CX0-2,ROOF,CD0),q(CX1+2,ROOF,CD0),q(CX1+2,ROOF,CD1),q(CX0-2,ROOF,CD1)];poly(c,P,'#1e232a');c.fillStyle=lin(c,0,P[2].y,0,P[0].y,[[0,rgba('#000000',.35)],[1,rgba('#ffffff',.04)]]);poly(c,P);c.fill();
    line(c,[P[0],P[1]],rgba(C.rim,.3),1);
    const V=[q(cx-14,ROOF,46),q(cx+14,ROOF,46),q(cx+14,ROOF,90),q(cx-14,ROOF,90)];poly(c,V,'#0a0c10');c.strokeStyle='#3a4250';c.lineWidth=1.5;c.beginPath();
    for(let i=1;i<6;i++){const d=lerp(46,90,i/6),a=q(cx-13,ROOF,d),b=q(cx+13,ROOF,d);c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);}c.stroke();
    // (the strip's light coming up through the vent)
    glow(c,(V[0].x+V[2].x)/2,(V[0].y+V[2].y)/2,22,'#cfe8ff',.25*k,.4);}
  {const a=q(CX0-10,ROOF,RD),b=q(CX1+10,ROOF,RD);c.fillStyle='#14161b';c.fillRect(a.x,a.y-14,b.x-a.x,14);c.fillStyle=rgba(C.rim,.22);c.fillRect(a.x,a.y-14,b.x-a.x,1);c.fillStyle=rgba('#000000',.5);c.fillRect(a.x,a.y-7,b.x-a.x,1.2);
    const h=q(cx,ROOF-14,RD);c.fillStyle='#22242a';c.fillRect(h.x-12,h.y-8,24,8);c.fillStyle=C.goldD;c.fillRect(h.x-12,h.y-8,24,1);
    for(const x of RL){const p=q(x,ROOF-6,RD);c.fillStyle='#262830';c.fillRect(p.x-4,p.y-10,8,14);c.fillStyle=rgba(C.rim,.25);c.fillRect(p.x-4,p.y-10,8,.9);}}
  ropesUp(c,[cx-9,cx-3,cx+3,cx+9],ROOF-22,RD);}
// the car's face, in front of him: the frame and its header with the floor's chevron, the doors shut on him (black glass, so he shows
// through them), the sill and the apron under it
function carFront(c){const yb=GB,y0=yb-CH-4,dx0=(CX0+CX1)/2-DW/2,dx1=dx0+DW,dy=yb-DH,s=st(),t=typeof S!=='undefined'?S.t:0,F=(x,y)=>q(x,y,CD0);
  carTop(c);
  const a=F(CX0,y0),b=F(CX1,yb+34);
  // the steel round the doorway
  const g=c.createLinearGradient(a.x,0,b.x,0);g.addColorStop(0,'#aeb9c2');g.addColorStop(.12,'#6b7681');g.addColorStop(.5,'#919da7');g.addColorStop(.88,'#6b7681');g.addColorStop(1,'#a6b1bb');
  c.fillStyle=g;c.beginPath();c.rect(a.x,a.y,b.x-a.x,F(0,yb).y-a.y);const d0=F(dx0,dy),d1=F(dx1,yb);c.rect(d1.x,d0.y,d0.x-d1.x,d1.y-d0.y);c.fill('evenodd');
  c.fillStyle=rgba('#ffffff',.07);for(let x=a.x+2;x<b.x;x+=3)if(x<d0.x||x>d1.x)c.fillRect(x,a.y,.7,F(0,yb).y-a.y);else c.fillRect(x,a.y,.7,d0.y-a.y);
  c.fillStyle=rgba('#000000',.35);c.fillRect(a.x,a.y,1.2,F(0,yb).y-a.y);c.fillRect(b.x-1.2,a.y,1.2,F(0,yb).y-a.y);c.fillStyle=rgba('#ffffff',.3);c.fillRect(a.x,a.y,b.x-a.x,1);
  // the header's display: the chevron, lit the way the car goes
  {const hx=(a.x+b.x)/2,hy=a.y+2;c.fillStyle='#070b10';c.fillRect(hx-15,hy,30,8);c.fillStyle='rgba(150,216,255,.95)';c.beginPath();c.moveTo(hx,hy+6.6);c.lineTo(hx-3.4,hy+1.4);c.lineTo(hx+3.4,hy+1.4);c.closePath();c.fill();
    c.fillRect(hx-11,hy+3.4,4,1.2);c.fillRect(hx+7,hy+3.4,4,1.2);}
  // the doors: two leaves of black glass meeting in the middle; through them, him
  for(const sd of [-1,1]){const xa=sd<0?d0.x:(d0.x+d1.x)/2,xb=sd<0?(d0.x+d1.x)/2:d1.x;
    c.fillStyle=lin(c,0,d0.y,0,d1.y,[[0,'rgba(11,18,27,.3)'],[1,'rgba(4,7,11,.42)']]);c.fillRect(xa,d0.y,xb-xa,d1.y-d0.y);
    const sg=c.createLinearGradient(xa,d0.y,xb,d0.y+(d1.y-d0.y)*.7);sg.addColorStop(0,'rgba(150,190,235,0)');sg.addColorStop(.42,'rgba(150,190,235,.13)');sg.addColorStop(.56,'rgba(150,190,235,0)');c.fillStyle=sg;c.fillRect(xa,d0.y,xb-xa,d1.y-d0.y);
    const ex=sd<0?xb-2.4:xa;c.fillStyle='#a3aeb8';c.fillRect(ex,d0.y,2.4,d1.y-d0.y);c.fillStyle=rgba('#ffffff',.35);c.fillRect(ex+(sd<0?0:1.8),d0.y,.6,d1.y-d0.y);}
  // the fire's light in the glass, when it comes
  const fk=fireNear();if(fk>0){c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,0,d0.y,0,d1.y,[[0,rgba('#ff9a40',.35*fk)],[1,rgba('#ff6a20',.08*fk)]]);c.fillRect(d0.x,d0.y,d1.x-d0.x,d1.y-d0.y);c.restore();}
  // the sill, and the apron down under it
  {const p=F(dx0-4,yb),r=F(dx1+4,yb);c.fillStyle='#c8d2da';c.fillRect(p.x,p.y-1,r.x-p.x,2.4);c.fillStyle=rgba('#000000',.5);c.fillRect(p.x,p.y+1.4,r.x-p.x,1);}
  {const p=F(CX0+2,yb+2),r=F(CX1-2,yb+34);c.fillStyle=lin(c,0,p.y,0,r.y,[[0,'#3a4450'],[1,'#141820']]);c.fillRect(p.x,p.y,r.x-p.x,r.y-p.y);c.fillStyle=rgba('#000000',.4);for(let y=p.y+6;y<r.y;y+=7)c.fillRect(p.x,y,r.x-p.x,1);}
  void s;void t;}
// how near the fire is to the car, 0 to 1 (the fireball's front coming down on the roof; the sheet going up in its first moment)
function fireNear(){const s=st(),t=typeof S!=='undefined'?S.t:0;if(!s)return 0;let k=0;
  if(s.ballH!=null)k=Math.max(k,clamp(1-s.ballH/260,0,1));
  if(s.lit!=null){const u=t-s.lit;if(u>=0&&u<1.4)k=Math.max(k,(u<.06?u/.06:Math.exp(-(u-.06)*2.6))*.8);}
  return k;}
// the gas over the car before it catches: the air shivering, a faint sickly tint, threads of it coming down the shaft after the car
function gas(c,t){const s=st();if(!s||!(s.gas>0))return;const a=s.gas,x0=SX0+4,x1=SX1+SB*PSX-4,top=ROOF-CD1*PSY-340,bot=ROOF-CD0*PSY+4;
  c.save();c.fillStyle=lin(c,0,top,0,bot,[[0,rgba('#c8d8a0',0)],[.6,rgba('#c8d8a0',.045*a)],[1,rgba('#c8d8a0',.07*a)]]);c.fillRect(x0,top,x1-x0,bot-top);
  c.lineWidth=1.5;for(let i=0;i<9;i++){const ph=((t*.22+i/9)%1),y=lerp(top,bot,ph),al=.11*a*Math.sin(ph*Math.PI);c.strokeStyle=rgba('#eef6d8',al);c.beginPath();
    for(let x=x0;x<=x1;x+=10){const yy=y+Math.sin(x*.045+t*2.2+i*1.7)*4+Math.sin(x*.11-t*3.1+i)*1.6;x===x0?c.moveTo(x,yy):c.lineTo(x,yy);}c.stroke();}
  c.restore();}

// ---------- over everything ----------
// the spark, the flame going up, the fireball coming down and its light, the pan, the brakes
const FPUFF={};
function fireSpr(i){if(FPUFF[i])return FPUFF[i];const cv=document.createElement('canvas'),n=96;cv.width=cv.height=n;const c=cv.getContext('2d'),R=rng(301+i*17),h=n/2;
  const cols=[['#fffbe8','#ffd27a','#ff9a3a'],['#ffe0a0','#ffa040','#d8461a'],['#ffb050','#e0581c','#7a2410'],['#a8401a','#4a1a0e','#1a0c08']][i];
  for(let k=0;k<9;k++){const a=R()*TAU,r=R()*h*.3,x=h+Math.cos(a)*r,y=h+Math.sin(a)*r,rr=h*(.3+R()*.22),g=c.createRadialGradient(x,y,0,x,y,rr);
    g.addColorStop(0,cols[0]);g.addColorStop(.5,cols[1]);g.addColorStop(1,rgba(cols[2],0));c.fillStyle=g;c.globalAlpha=.85;c.beginPath();c.arc(x,y,rr,0,TAU);c.fill();}
  return FPUFF[i]=cv;}
function fore(c){c=c||ctx;const s=st();if(!s)return;const t=S.t;c.save();
  const clip=()=>{c.beginPath();c.rect(SX0,YT,SX1-SX0,ROOF-CD0*PSY-YT);c.clip();};
  // the spark: an arc off the blade's tip up into the steel of the roof, and the sparks out through the vent into the gas
  if(s.spark!=null){const u=t-s.spark;const K=S.F[0];
    if(u>=0&&u<.16&&K&&K.p){const p=K.p[TIP],a={x:p.x+K.dep*PSX,y:p.y-K.dep*PSY},v=q(L0.cx,ROOF+2,(CD0+CD1)/2),R=rng(((u*60)|0)+5);
      c.save();c.globalCompositeOperation='lighter';for(const [w,al] of [[5,.25],[1.6,.95]]){c.strokeStyle=rgba('#d8f6ff',al);c.lineWidth=w;c.beginPath();c.moveTo(a.x,a.y);
        for(let i=1;i<7;i++){const k=i/7;c.lineTo(lerp(a.x,v.x,k)+(R()-.5)*9,lerp(a.y,v.y,k)+(R()-.5)*5);}c.lineTo(v.x,v.y);c.stroke();}
      glow(c,a.x,a.y,26,'#bfefff',.8*(1-u/.16));glow(c,v.x,v.y,30,'#ffffff',.9*(1-u/.16));c.restore();}
    if(u>=0&&u<1.1){const v=q(L0.cx,ROOF,(CD0+CD1)/2),R=rng(41);c.save();c.globalCompositeOperation='lighter';c.lineCap='round';
      for(let i=0;i<16;i++){const vx=(R()-.5)*160,vy=-(160+R()*260),L=.45+R()*.6,t0=R()*.12,w=u-t0;if(w<0||w>L)continue;
        const x=v.x+(R()-.5)*20+vx*w,y=v.y+vy*w+260*w*w,x2=x-vx*.03,y2=y-(vy+520*w)*.03,k=1-w/L;c.strokeStyle=rgba(k>.5?'#fff6d8':'#ffc861',k);c.lineWidth=1.6;c.beginPath();c.moveTo(x2,y2);c.lineTo(x,y);c.stroke();}
      c.restore();}}
  // the gas catching: blue at the vent, then a sheet of flame going away up the shaft, burning out behind its front
  if(s.lit!=null){const u=t-s.lit;if(u>=0&&u<2.6){const base=ROOF-CD0*PSY,front=base-1300*Math.pow(u,1.25),R=rng(97);c.save();clip();c.globalCompositeOperation='lighter';
      // the hot air behind the front, cooling
      const hot=Math.max(0,1-u/2.4);c.fillStyle=lin(c,0,front,0,base,[[0,rgba('#9ad0ff',.0)],[.02,rgba('#bfe4ff',.7*hot)],[.1,rgba('#ffd890',.6*hot)],[.45,rgba('#ff8a30',.45*hot)],[1,rgba('#ff6a20',.2*hot*hot)]]);
      c.fillRect(SX0,Math.max(YT,front),SX1-SX0+SB*PSX,base-Math.max(YT,front));
      // tongues licking up the walls behind it
      for(let i=0;i<22;i++){const x=lerp(SX0+6,SX1+SB*PSX-6,R()),h0=R(),y=lerp(base,front,h0),L=20+R()*46,k=hot*(1-h0*.5)*(.5+.5*Math.sin(t*19+i*3.1));if(y<YT||k<.02)continue;
        c.fillStyle=lin(c,0,y,0,y-L,[[0,rgba('#ffb050',.5*k)],[1,rgba('#ff5a1a',0)]]);c.beginPath();c.moveTo(x-5,y);c.quadraticCurveTo(x-2,y-L*.5,x+(R()-.5)*8,y-L);c.quadraticCurveTo(x+3,y-L*.5,x+5,y);c.closePath();c.fill();}
      // the front: a bright ragged line going away
      if(front>YT){c.strokeStyle=rgba('#e8f6ff',.7*hot);c.lineWidth=3;c.beginPath();for(let x=SX0;x<=SX1+SB*PSX;x+=8){const y=front+Math.sin(x*.09+u*30)*5+Math.sin(x*.23)*3;x===SX0?c.moveTo(x,y):c.lineTo(x,y);}c.stroke();}
      c.restore();
      if(u<.18){c.save();c.globalCompositeOperation='lighter';const v=q(L0.cx,ROOF,(CD0+CD1)/2);glow(c,v.x,v.y-10,120,'#a8d8ff',.9*(1-u/.18));c.restore();}}}
  // the fireball coming down after the car
  if(s.ballH!=null&&s.ballH<2400){const front=ROOF-CD0*PSY-s.ballH,x0=SX0,x1=SX1+SB*PSX,R=rng(211);c.save();clip();
    // its light down the shaft ahead of it
    c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,0,front,0,front+260,[[0,rgba('#ff9a40',.5)],[1,rgba('#ff9a40',0)]]);c.fillRect(x0,front,x1-x0,260);c.restore();
    // the shaft above it full of it: dark fire going to soot
    {const y1=front-210;if(y1>YT){c.fillStyle=lin(c,0,YT,0,y1+40,[[0,'#120806'],[.7,'#3a1208'],[1,'#7a2a10']]);c.fillRect(x0,YT,x1-x0,y1+40-YT);}}
    // the boiling mass above its front: puffs packed across the shaft, white-hot at the front, soot above
    // (each puff its own place and its own rise: in rows and columns that kept their places the fire read as a lattice, a pattern
    // that repeats, at V104's review)
    for(let i=0;i<48;i++){const row=Math.floor(i/8),col=i%8,ph=R()*TAU,sp=.6+R()*.8,rr=34+R()*30,x=lerp(x0+10,x1-10,(col+.5+(R()-.5)*1.3)/8)+Math.sin(t*sp*3+ph)*14,
        y=front-8-(row+(R()-.5)*.9)*42-((t*(70+R()*50)*sp+R()*60)%42)+Math.sin(t*sp*4+ph)*9,heat=row<1?0:row<2?1:row<4?2:3;if(y-rr>ROOF||y+rr<YT)continue;
      c.globalAlpha=row<4?.95:.85;c.drawImage(fireSpr(heat),x-rr,y-rr,rr*2,rr*2);}
    c.globalAlpha=1;c.globalCompositeOperation='lighter';
    c.fillStyle=lin(c,0,front-30,0,front+8,[[0,rgba('#ffe8b0',0)],[.7,rgba('#fff2d0',.55)],[1,rgba('#ffffff',0)]]);c.fillRect(x0,front-30,x1-x0,38);
    // embers and bits coming down ahead of it
    for(let i=0;i<30;i++){const vx=(R()-.5)*30,ph=R(),y=front+((t*240+ph*300)%300),x=lerp(x0,x1,R())+vx*Math.sin(t+i);if(y>ROOF)continue;c.fillStyle=rgba(R()<.6?'#ffb050':'#ff7a2a',.8*(1-(y-front)/300));c.fillRect(x,y,1.6,1.6);}
    c.restore();}
  // a copper pan off the range, coming down the shaft ahead of the fire and onto the roof
  if(s.pan!=null){const u=t-s.pan,T=.75,v=q(L0.cx-24,ROOF,52);let x=v.x,y,an;if(u<T){const e=u/T;y=lerp(ROOF-CD0*PSY-420,v.y,e*e);an=u*14;x=v.x+Math.sin(u*5)*12;}else{const b=u-T;y=v.y-Math.max(0,22*Math.exp(-b*7)*Math.abs(Math.sin(b*16)));an=T*14+Math.min(b,.3)*6;}
    if(u>=0){c.save();c.translate(x,y-5);c.rotate(an);c.fillStyle=lin(c,-9,0,9,0,[[0,'#7a4524'],[.4,'#f0b27a'],[1,'#7a4524']]);c.beginPath();c.ellipse(0,0,9,4,0,0,TAU);c.fill();
      c.fillStyle='#14161a';c.fillRect(8,-1,12,2);c.restore();}}
  // the brakes: sparks off the shoes on the rails
  if(s.brake!=null){const u=t-s.brake;if(u>=0&&u<s.brakeDur){const R=rng(((t*30)|0)+3);c.save();c.globalCompositeOperation='lighter';c.lineCap='round';
      for(const x of RL)for(const y of [ROOF-6,GB+4]){const p=q(x,y,RD);for(let i=0;i<4;i++){const vx=(R()-.5)*70,vy=-60-R()*90;c.strokeStyle=rgba(R()<.5?'#fff2c0':'#ffb050',.85);c.lineWidth=1.5;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x+vx*.12,p.y+vy*.12+R()*8);c.stroke();}
        glow(c,p.x,p.y,10,'#ffd890',.6);}c.restore();}}
  c.restore();}
// the car's front among the people, by depth (he is behind it)
function frontItem(){return{d:CD0-.5,draw:c=>carFront(c||ctx)};}
// the light that rims him: the strip over him in the car
function light(f){return{light:{x:L0.cx,y:GB-CH+6},col:'#d8ecff'};}
// how light the ground behind him is (the car's lit back wall; the shaft goes by, so the layer does not hold it)
const SET=null;
E.S.shaft={paint,live(){const t=S.t;ctx.save();try{backWall(ctx);leftWall(ctx);machine(ctx);rails(ctx);counterweight(ctx);lamps(ctx,t);section(ctx);carBody(ctx,t);gas(ctx,t);}finally{ctx.restore();}},
  fore,light,frontItem,ground:.42,set:SET,fireNear,LAYOUT:{SX0,SX1,SB,CX0,CX1,CD0,CD1,CH,ROOF,RD,RL}};
})();
// ===== ENV SHAFT END =====
