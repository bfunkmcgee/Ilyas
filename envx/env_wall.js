// ===== ENV WALL =====
// Ruin Wall (a proposal): a corner of the old elven city wall, inside it. On the right the wall the fight can break runs away from us,
// dressed stone in courses with the gold vine carved and inlaid along a string course, arrow slits, crenellations, ivy, torches in
// iron brackets; its near end is broken off and shows the rubble core between its two skins. Across the back the wall turns: a lower,
// ruined stretch with a gatehouse, two towers and an arched gate with its portcullis half raised, braziers burning either side, and a
// gap where a stretch has fallen. The old road of setts runs through the grass to the gate. Beyond the walls, the city's lights and
// the Hallowell tower with its ring of cyan light.
(()=>{const E=EnvLook,{C,pp,poly,line,lin,rad,rgba,mix,glow,beam,haze,vine,scroll,stars,moon,cloudBank,skyline,hallTower,rng,lerp,clamp,TAU}=E;
const TX=()=>EnvTex,TB=()=>EnvTexB;
const FAR=278,DW=304;
const wallX=()=>S.arena&&S.arena.wall?S.arena.wall:770;
function patAt(c,cv,x,y,u,rot){const p=c.createPattern(cv,'repeat');if(p.setTransform){let m=new DOMMatrix().translate(x,y);if(rot)m=m.rotate(rot);p.setTransform(m.scale(u));}return p;}
function plane(c,g){c.transform(1,0,PSX,-PSY,0,g);}
// the near wall's face, the side the fight is on: (depth, y) -> screen at x = wx
function facePlane(c,wx){c.transform(PSX,-PSY,0,1,wx,0);}
// the far wall stands square to us at depth DW: world x and height above the ground -> screen
const fx=x=>x+DW*PSX,fy=h=>GB-DW*PSY-h;
// the lights: torches in brackets on the near wall's face (world depth, height), braziers either side of the gate (world x)
const TORCH=[{d:150,h:150},{d:232,h:150}],BRAZ=[{x:334,h:30},{x:426,h:30}],GATE={x:380,w:56,h:96,tw:46,th:178};
const torchAt=T=>pp(wallX()-3,GB-T.h,T.d),brazAt=B=>pp(B.x,GB-B.h,DW-16);
// ---------- small things ----------
function weeds(c,x,y,n,h,seed){const r=rng(seed);c.save();c.lineCap='round';for(let i=0;i<n;i++){const bx=x+(r()-.5)*n*1.6,bh=h*(.5+r()*.6),lean=(r()-.5)*bh*.6;c.strokeStyle=mix('#141c10','#2c3a1c',r());c.lineWidth=.6+r()*.5;
  c.beginPath();c.moveTo(bx,y);c.quadraticCurveTo(bx+lean*.3,y-bh*.6,bx+lean,y-bh);c.stroke();}c.restore();}
// ivy: leaves on hanging stems, dark, the moon on their upper edges; drawn in screen space from a list of (x, y, length) stems
function ivy(c,stems,seed,o){o=o||{};const r=rng(seed);c.save();c.lineCap='round';
  for(const [x,y,len,sway] of stems){const pts=[];let px=x,py=y;for(let k=0;k<len;k+=3){px+=(r()-.5)*1.6+(sway||0)*.2;py+=3;pts.push([px,py]);}
    c.strokeStyle='#0c1208';c.lineWidth=.6;c.beginPath();pts.forEach(([a,b],i)=>i?c.lineTo(a,b):c.moveTo(a,b));c.stroke();
    for(const [a,b] of pts){for(let j=0;j<2;j++){const lx=a+(r()-.5)*5,ly=b+(r()-.5)*3,s=1.4+r()*1.4,ang=r()*TAU;c.save();c.translate(lx,ly);c.rotate(ang);
      c.fillStyle=mix('#0a1408','#1c2e14',r());c.beginPath();c.moveTo(0,-s);c.quadraticCurveTo(s,-s*.6,s*.9,0);c.quadraticCurveTo(s*.4,s*.9,0,s*.6);c.quadraticCurveTo(-s*.4,s*.9,-s*.9,0);c.quadraticCurveTo(-s,-s*.6,0,-s);c.fill();
      if(r()<.45){c.fillStyle=rgba(o.lit||'#9ab0d8',.22);c.beginPath();c.moveTo(-s*.6,-s*.5);c.quadraticCurveTo(0,-s*1.05,s*.6,-s*.5);c.lineTo(0,-s*.6);c.fill();}c.restore();}}}
  c.restore();}
function brazier(c,q){c.fillStyle=rgba('#000000',.5);c.beginPath();c.ellipse(q.x+1,q.y+30,12,2.6,0,0,TAU);c.fill();
  c.strokeStyle='#0a090c';c.lineWidth=1.5;c.lineCap='round';c.beginPath();for(const dx of [-8,0,8]){c.moveTo(q.x+dx,q.y+30);c.lineTo(q.x+dx*.35,q.y+8);}c.stroke();
  c.fillStyle=lin(c,q.x-10,0,q.x+10,0,[[0,'#0a090c'],[.6,'#1c1a20'],[1,'#08070a']]);c.beginPath();c.moveTo(q.x-10,q.y+4);c.quadraticCurveTo(q.x,q.y+14,q.x+10,q.y+4);c.closePath();c.fill();
  c.fillStyle=rgba(C.rim,.5);c.fillRect(q.x-10,q.y+3.6,20,.8);c.fillStyle='#ff8a3c';c.beginPath();c.ellipse(q.x,q.y+4,8.6,1.6,0,0,TAU);c.fill();c.fillStyle='#ffd27a';c.beginPath();c.ellipse(q.x,q.y+4,5,.9,0,0,TAU);c.fill();}
function cypress(c,x,base,h,w,seed){const r=rng(seed);c.save();c.fillStyle='#070a08';c.beginPath();c.moveTo(x,base-h);
  for(let k=0;k<=12;k++){const t=k/12,yy=base-h+t*h,ww=w*Math.sin(Math.min(1,t*1.15)*Math.PI*.62)*(.85+r()*.3);c.lineTo(x+ww,yy);}c.lineTo(x+1.5,base);c.lineTo(x-1.5,base);
  for(let k=12;k>=0;k--){const t=k/12,yy=base-h+t*h,ww=w*Math.sin(Math.min(1,t*1.15)*Math.PI*.62)*(.85+r()*.3);c.lineTo(x-ww,yy);}c.closePath();c.fill();
  c.strokeStyle=rgba('#9ab0d8',.14);c.lineWidth=.6;c.beginPath();for(let k=2;k<=10;k++){const t=k/12,yy=base-h+t*h,ww=w*Math.sin(Math.min(1,t*1.15)*Math.PI*.62);c.moveTo(x-ww*.9,yy);c.quadraticCurveTo(x-ww*.4,yy-3,x,yy-1);}c.stroke();c.restore();}
// ---------- the far wall, square to us ----------
// a stretch of wall from world x0 to x1, h high, crenellated, in dressed stone; tops is a function of x giving its broken top height
function farWall(c,x0,x1,top,seed){const r=rng(seed),A=TB().ashlar(15,{bh:11,bl:26}),base=fy(0);
  c.beginPath();c.moveTo(fx(x0),base);for(let x=x0;x<=x1;x+=3)c.lineTo(fx(x),fy(top(x)));c.lineTo(fx(x1),base);c.closePath();
  c.save();c.fillStyle=patAt(c,A,fx(x0),base,.25);c.fill();c.fillStyle=lin(c,0,fy(170),0,base,[[0,rgba('#0a0c18',.72)],[1,rgba('#06060c',.8)]]);c.fill();c.clip();
  // water stains below the wall walk, moss and damp at the foot
  for(let i=0;i<46;i++){const x=x0+r()*(x1-x0),w=1+r()*4,l=20+r()*90,t=fy(top(x));c.fillStyle=lin(c,0,t,0,t+l,[[0,rgba('#000000',.32)],[1,rgba('#000000',0)]]);c.fillRect(fx(x),t,w,l);}
  c.fillStyle=lin(c,0,base-30,0,base,[[0,rgba('#1a2a14',0)],[1,rgba('#1a2a14',.55)]]);c.fillRect(fx(x0),base-30,x1-x0,30);c.restore();
  c.strokeStyle=rgba('#c8d4ff',.16);c.lineWidth=.7;c.beginPath();for(let x=x0;x<=x1;x+=3){const q={x:fx(x),y:fy(top(x))};x===x0?c.moveTo(q.x,q.y):c.lineTo(q.x,q.y);}c.stroke();}
// crenellations along a wall top at height h from x0 to x1: merlons with the moon on their tops
function merlons(c,x0,x1,h,mw,gap,seed){const r=rng(seed),A=TB().ashlar(15,{bh:11,bl:26});
  for(let x=x0;x+mw<=x1;x+=mw+gap){if(r()<.18)continue;const mh=10+r()*3-(r()<.2?r()*6:0);c.beginPath();c.rect(fx(x),fy(h+mh),mw,mh+.5);c.fillStyle=patAt(c,A,0,0,.25);c.fill();c.fillStyle=rgba('#08090f',.74);c.fill();
    c.fillStyle=rgba('#c8d4ff',.18);c.fillRect(fx(x),fy(h+mh),mw,.7);c.fillStyle=rgba('#000000',.3);c.fillRect(fx(x)+mw-1,fy(h+mh),1,mh);}}
// a cross-shaped arrow slit at x, h
function slit(c,x,h,s){s=s||1;const X=fx(x),Y=fy(h);c.fillStyle='#040306';c.fillRect(X-1.2*s,Y-9*s,2.4*s,18*s);c.fillRect(X-4*s,Y-1.2*s,8*s,2.4*s);c.fillStyle=rgba('#c8d4ff',.12);c.fillRect(X-2.4*s,Y-10.5*s,4.8*s,1.2*s);}
// the gatehouse: two towers, the arch, the portcullis half up, the vine carved on the voussoirs and inlaid along a frieze
function gatehouse(c){const G=GATE,A=TB().ashlar(15,{bh:11,bl:26}),stone=TX().granite(62,96,96,{base:'#827a6e'}),base=fy(0);
  // beyond the gate: the old road running on into the dark, the city's glow low down
  {const x0=fx(G.x-G.w/2),x1=fx(G.x+G.w/2),yA=fy(G.h-G.w/2);c.save();c.beginPath();c.moveTo(x0,base);c.lineTo(x0,yA);c.arc((x0+x1)/2,yA,G.w/2,Math.PI,0);c.lineTo(x1,base);c.closePath();c.clip();
    c.fillStyle=lin(c,0,fy(G.h),0,base,[[0,'#06060b'],[.55,'#0e0c12'],[.8,'#2a1a18'],[1,'#3a2418']]);c.fillRect(x0,fy(G.h+4),G.w,G.h+6);
    for(let i=0;i<14;i++){const lx=x0+3+(i*13.7)%(G.w-6),ly=base-14-(i%3)*3;c.fillStyle=rgba('#ffcf86',.5);c.fillRect(lx,ly,1,1);}glow(c,(x0+x1)/2,base-10,40,'#ff9a5a',.25,.5);
    // the portcullis: iron bars with spiked feet, hanging half up
    const py=base-48;c.fillStyle='#0a090c';for(let x=x0+3;x<x1-1;x+=6.5){c.fillRect(x,fy(G.h+2),1.8,py-fy(G.h+2));c.beginPath();c.moveTo(x-.6,py);c.lineTo(x+.9,py+5);c.lineTo(x+2.4,py);c.fill();}
    for(let y=fy(G.h-6);y<py;y+=7)c.fillRect(x0,y,G.w,1.6);c.fillStyle=rgba(C.rim,.25);for(let x=x0+3;x<x1-1;x+=6.5)c.fillRect(x,py-30,.5,30);c.restore();}
  // the arch: voussoirs round the opening, the vine carved along them, a keystone with the elven ring
  {const x0=fx(G.x-G.w/2),x1=fx(G.x+G.w/2),cx=(x0+x1)/2,yA=fy(G.h-G.w/2),R0=G.w/2,R1=G.w/2+9;
    c.beginPath();c.moveTo(x0-9,fy(G.h+18));c.lineTo(x1+9,fy(G.h+18));c.lineTo(x1+9,base);c.lineTo(x1,base);c.lineTo(x1,yA);c.arc(cx,yA,R0,0,Math.PI,true);c.lineTo(x0,base);c.lineTo(x0-9,base);c.closePath();
    c.fillStyle=patAt(c,A,x0,base,.25);c.fill();c.fillStyle=rgba('#0a0c18',.72);c.fill();
    c.beginPath();c.arc(cx,yA,R1,Math.PI,0);c.arc(cx,yA,R0,0,Math.PI,true);c.closePath();c.fillStyle=patAt(c,stone,0,0,.25);c.fill();c.fillStyle=rgba('#0a0c18',.5);c.fill();
    c.strokeStyle=rgba('#000000',.55);c.lineWidth=.5;c.beginPath();for(let k=1;k<11;k++){const a=Math.PI+k*Math.PI/11;c.moveTo(cx+Math.cos(a)*R0,yA+Math.sin(a)*R0);c.lineTo(cx+Math.cos(a)*R1,yA+Math.sin(a)*R1);}c.stroke();
    const vp=[];for(let k=0;k<=18;k++){const a=Math.PI+k*Math.PI/18;vp.push({x:cx+Math.cos(a)*(R0+4.5),y:yA+Math.sin(a)*(R0+4.5)});}vine(c,vp,{w:.5,amp:.8,wave:7,leaf:1.4,every:2,seed:12,col:rgba(C.gold,.9)});
    c.beginPath();c.moveTo(cx-4,yA-R1-1);c.lineTo(cx+4,yA-R1-1);c.lineTo(cx+3,yA-R0+1);c.lineTo(cx-3,yA-R0+1);c.closePath();c.fillStyle=patAt(c,stone,0,0,.25);c.fill();c.fillStyle=rgba('#0a0c18',.4);c.fill();
    c.strokeStyle=rgba(C.gold,.9);c.lineWidth=.7;c.beginPath();c.arc(cx,yA-R0-4.5,2,.4,TAU-.4);c.stroke();
    // the frieze over the gate, the vine running the width of it
    const fyy=fy(G.h+12);c.fillStyle=patAt(c,stone,0,0,.25);c.fillRect(x0-9,fyy,G.w+18,6);c.fillStyle=rgba('#08090f',.5);c.fillRect(x0-9,fyy,G.w+18,6);c.fillStyle=rgba('#c8d4ff',.2);c.fillRect(x0-9,fyy,G.w+18,.7);
    vine(c,[{x:x0-7,y:fyy+3},{x:x1+7,y:fyy+3}],{w:.55,amp:1.1,wave:10,leaf:1.6,every:2,seed:14,col:rgba(C.gold,.9),curl:.3});
    merlons(c,G.x-G.w/2-9,G.x+G.w/2+9,G.h+18,8,5,17);}
  // the towers
  for(const s of [-1,1]){const cx=G.x+s*(G.w/2+G.tw/2+2),x0=cx-G.tw/2,x1=cx+G.tw/2,top=s<0?G.th-14:G.th;
    c.beginPath();c.moveTo(fx(x0),base);c.lineTo(fx(x0),fy(top));if(s<0){c.lineTo(fx(x0+12),fy(top));c.lineTo(fx(x0+18),fy(top+9));c.lineTo(fx(x0+26),fy(top+4));c.lineTo(fx(x0+31),fy(top+14));c.lineTo(fx(x1),fy(top+12));}else c.lineTo(fx(x1),fy(top));c.lineTo(fx(x1),base);c.closePath();
    c.fillStyle=patAt(c,A,fx(x0),base,.25);c.fill();c.fillStyle=lin(c,fx(x0),0,fx(x1),0,[[0,rgba('#0a0c18',.64)],[.6,rgba('#0a0c18',.72)],[1,rgba('#06060c',.86)]]);c.fill();
    c.fillStyle=rgba('#c8d4ff',.16);c.fillRect(fx(x0),fy(top),1,top);
    // a string course with the vine inlaid, slits
    {const y=fy(top-26);c.fillStyle=patAt(c,stone,0,0,.25);c.fillRect(fx(x0)-2,y,G.tw+4,5);c.fillStyle=rgba('#08090f',.55);c.fillRect(fx(x0)-2,y,G.tw+4,5);c.fillStyle=rgba('#c8d4ff',.2);c.fillRect(fx(x0)-2,y,G.tw+4,.7);
      vine(c,[{x:fx(x0)+1,y:y+2.5},{x:fx(x1)-1,y:y+2.5}],{w:.45,amp:.9,wave:9,leaf:1.3,every:2,seed:s+5,col:rgba(C.gold,.85)});}
    slit(c,cx,top-60,1.1);slit(c,cx,top-118,1);
    if(s>0)merlons(c,x0-2,x1+2,top,9,6,s+9);}
  // ivy over the left tower, braziers before the gate
  ivy(c,[[fx(G.x-G.w/2-G.tw-2)+4,fy(GATE.th-20),70,1],[fx(G.x-G.w/2-G.tw-2)+12,fy(GATE.th-14),46,-1],[fx(G.x-G.w/2-G.tw-2)+20,fy(GATE.th-24),90,.5],[fx(G.x-G.w/2)-6,fy(GATE.th-40),36,0]],31);}
// ---------- the near wall, the one the fight can break: drawn every frame from the game's wall state ----------
let FACE=null,END=null,IVY=null;
// its face, rendered once in the face plane: stone in courses, stains, damp, the vine carved and inlaid on a string course, slits
function faceCanvas(){if(FACE)return FACE;const s3=3,d0=-12,d1=FAR,top=GB-WALL_TOP-2,bot=GB+2,cv=document.createElement('canvas');cv.width=Math.ceil((d1-d0)*s3);cv.height=Math.ceil((bot-top)*s3);
  const c=cv.getContext('2d');c.scale(s3,s3);c.translate(-d0,-top);const r=rng(5);
  c.fillStyle=patAt(c,TB().ashlar(13,{bh:18,bl:40}),0,GB,.25);c.fillRect(d0,top,d1-d0,bot-top);
  c.fillStyle=lin(c,0,top,0,bot,[[0,rgba('#0a0c18',.46)],[1,rgba('#06060c',.66)]]);c.fillRect(d0,top,d1-d0,bot-top);
  for(let i=0;i<46;i++){const d=d0+r()*(d1-d0),w=1+r()*5,l=20+r()*130;c.fillStyle=lin(c,0,top,0,top+l,[[0,rgba('#000000',.36)],[1,rgba('#000000',0)]]);c.fillRect(d,top,w,l);}
  c.fillStyle=lin(c,0,GB-50,0,GB,[[0,rgba('#1a2a14',0)],[1,rgba('#1a2a14',.6)]]);c.fillRect(d0,GB-50,d1-d0,50);
  {const y=GB-204;c.fillStyle=rgba('#000000',.42);c.fillRect(d0,y+8,d1-d0,1.6);c.fillStyle=rgba('#c8d4ff',.14);c.fillRect(d0,y,d1-d0,1);
    vine(c,[{x:d0,y:y+4},{x:d1,y:y+4}],{w:1,amp:1.8,wave:18,leaf:2.6,every:2,seed:21,col:rgba(C.gold,.9)});}
  for(const d of [130,186,244]){const y0=GB-244,y1=GB-212;c.fillStyle='#040306';c.fillRect(d-4,y0,8,y1-y0);c.fillStyle=rgba('#c8d4ff',.12);c.fillRect(d-6,y0-2,12,2);}
  FACE={cv,d0,d1,top,bot};return FACE;}
// the broken near end: two skins of dressed stone and the rubble core between, rendered once (screen units, 26 wide)
function endCanvas(){if(END)return END;const s3=3,w=WALL_T,h=WALL_TOP+4,cv=document.createElement('canvas');cv.width=Math.ceil(w*s3);cv.height=Math.ceil(h*s3);const c=cv.getContext('2d');c.scale(s3,s3);const r=rng(9),stone=TX().granite(62,96,96,{base:'#7e766a'});
  c.fillStyle='#17141a';c.fillRect(0,0,w,h);
  for(let i=0;i<260;i++){const x=6.5+r()*13,y=r()*h,s=1+r()*2.6;c.save();c.translate(x,y);c.rotate(r()*3);c.beginPath();c.moveTo(-s,-s*.6);c.lineTo(s*.7,-s*.8);c.lineTo(s,s*.4);c.lineTo(-s*.4,s*.8);c.closePath();c.fillStyle=patAt(c,stone,0,0,.25);c.fill();c.fillStyle=rgba('#0a0c14',.45+r()*.25);c.fill();c.restore();}
  for(const [x0,x1] of [[0,6],[20,26]])for(let y=0,k=0;y<h;y+=18,k++){c.beginPath();c.rect(x0+.3,y+.4,x1-x0-.6,17.2);c.fillStyle=patAt(c,stone,0,0,.25);c.fill();c.fillStyle=rgba('#0a0c14',.4+((k*7+x0)%5)*.04);c.fill();c.fillStyle=rgba('#c8d4ff',.14);c.fillRect(x0+.3,y+.4,x1-x0-.6,.6);}
  c.fillStyle=lin(c,0,0,0,h,[[0,rgba('#000000',.1)],[1,rgba('#000000',.4)]]);c.fillRect(0,0,w,h);
  END={cv,w,h};return END;}
// ivy on the wall, in screen space, rendered once over the wall's screen box
function ivyCanvas(){if(IVY)return IVY;const wx=wallX(),x0=wx-30,y0=-20,w=120,h=GB+20-y0,s3=2,cv=document.createElement('canvas');cv.width=w*s3;cv.height=h*s3;const c=cv.getContext('2d');c.scale(s3,s3);c.translate(-x0,-y0);
  const top=d=>pp(wx,GB-WALL_TOP,d);const st=[];for(const [da,db,len] of [[120,150,120],[168,196,70],[204,230,150],[250,270,90]])for(let d=da;d<db;d+=3.5){const q=top(d);st.push([q.x,q.y+1,len*(.5+((d*7)%10)/14),0]);}
  {const q=pp(wx,GB-WALL_TOP,-12);for(let k=0;k<7;k++)st.push([q.x+2+k*3.4,q.y+1,60+k*13,-.5]);}
  ivy(c,st,77);IVY={cv,x0,y0,w,h};return IVY;}
// once the wall is broken through it has come down along the whole stretch the fight uses: the far end still stands with a ragged
// edge stepping down course by course to the ground, a low stub is left at the near end, and the stone lies in a mound between
const BRK=[[176,0],[176,9],[181,9],[181,22],[185,24],[185,38],[190,40],[190,57],[194,60],[194,78],[199,80],[199,101],[203,104],[203,128],[208,131],[208,156],[212,160],[212,186],[217,190],[217,214],[222,218],[222,242],[226,246],[226,260]],BRK_D=226,
  STUB=[[-12,46],[-7,52],[-2,41],[3,33],[7,19],[11,8],[13,0]];
let BRC=null;
// the break, drawn once: the rubble core showing in the far stretch's broken end, and the mound of fallen stone along the foot
function breakCanvas(wx){if(BRC&&BRC.wx===wx)return BRC;const s3=2,yb=GB,top=pp(wx,GB-WALL_TOP,BRK_D).y-12,x0=pp(wx-40,yb,-14).x,x1=pp(wx+WALL_T+60,yb,BRK_D).x,y1=yb+30,
  cv=document.createElement('canvas');cv.width=Math.ceil((x1-x0)*s3);cv.height=Math.ceil((y1-top)*s3);const c=cv.getContext('2d');c.scale(s3,s3);c.translate(-x0,-top);
  const r=rng(53),stone=TX().granite(62,96,96,{base:'#7e766a'}),frag=(x,y,sz,dk,rot)=>{c.save();c.translate(x,y);c.rotate(rot);c.beginPath();c.moveTo(-sz,-sz*.6);c.lineTo(sz*.8,-sz*.7);c.lineTo(sz,sz*.5);c.lineTo(-sz*.5,sz*.7);c.closePath();
    c.fillStyle=patAt(c,stone,0,0,.25);c.fill();c.fillStyle=rgba('#0a0c14',dk);c.fill();c.restore();};
  // the far stretch's broken end: the edge as it stands on this face, and again on the far face, the core between
  const A=BRK.map(([d,h])=>pp(wx,yb-h,d)),Bq=BRK.map(([d,h])=>pp(wx+WALL_T,yb-h,d));
  c.save();c.beginPath();A.forEach((q,i)=>i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y));for(let i=Bq.length-1;i>=0;i--)c.lineTo(Bq[i].x,Bq[i].y);c.closePath();
  c.fillStyle='#141117';c.fill();c.clip();for(let i=0;i<240;i++){const t=r(),k=Math.floor(t*(BRK.length-1)),u=t*(BRK.length-1)-k,a=A[k],b=A[k+1],q={x:lerp(a.x,b.x,u),y:lerp(a.y,b.y,u)};frag(q.x+r()*WALL_T,q.y+(r()-.5)*6,1+r()*2.6,.45+r()*.3,r()*3);}
  // the dressed skins of the wall show as a band of cut stone either side of the core
  c.strokeStyle=rgba('#8a8478',.35);c.lineWidth=3;c.beginPath();A.forEach((q,i)=>i?c.lineTo(q.x+1.5,q.y):c.moveTo(q.x+1.5,q.y));c.stroke();
  c.fillStyle=lin(c,0,top,0,yb,[[0,rgba('#000000',.15)],[1,rgba('#000000',.45)]]);c.fillRect(x0,top,x1-x0,yb-top+2);c.restore();
  c.strokeStyle=rgba(C.rim,.4);c.lineWidth=.9;c.beginPath();A.forEach((q,i)=>i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y));c.stroke();
  // the mound: rough core stone and whole dressed blocks, highest in the middle of the break, spilling out either side of the line
  const bandD=d=>Math.sin(clamp((d+14)/(BRK[0][0]+22),0,1)*Math.PI),hh=d=>4+24*bandD(d)*(.72+.28*Math.sin(d*.21)*Math.sin(d*.057+1));
  {const F=[],Rr=[],Bk=[];for(let d=-16;d<=BRK[0][0]+6;d+=4){F.push(pp(wx-13,GB+1,d));Rr.push(pp(wx+WALL_T*.45,GB-hh(d),d));Bk.push(pp(wx+WALL_T+15,GB+1,d));}
    c.beginPath();F.forEach((q,i)=>i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y));for(let i=Rr.length-1;i>=0;i--)c.lineTo(Rr[i].x,Rr[i].y);c.closePath();c.fillStyle=patAt(c,stone,0,0,.25);c.fill();c.fillStyle=rgba('#0b0a10',.82);c.fill();
    c.beginPath();Rr.forEach((q,i)=>i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y));for(let i=Bk.length-1;i>=0;i--)c.lineTo(Bk[i].x,Bk[i].y);c.closePath();c.fillStyle=patAt(c,stone,0,0,.25);c.fill();c.fillStyle=rgba('#08070c',.9);c.fill();}
  for(let i=0;i<230;i++){const d=-14+r()*(BRK[0][0]+20),u=r(),x=wx-12+u*(WALL_T+26),q=pp(x,GB-hh(d)*Math.sin(clamp(u*1.05,0,1)*Math.PI)*(.55+r()*.45),d);frag(q.x,q.y,1.4+r()*3.8,.62+r()*.24,r()*3);}
  for(let i=0;i<16;i++){const d=r()*(BRK[0][0]-4),x=wx-10+r()*(WALL_T+22),q=pp(x,GB-r()*hh(d)*.6,d),w=7+r()*6,h=4+r()*3,rot=(r()-.5)*.7;
    c.save();c.translate(q.x,q.y);c.rotate(rot);c.fillStyle=patAt(c,stone,0,0,.25);c.fillRect(-w/2,-h,w,h);c.fillStyle=rgba('#0a0c14',.66);c.fillRect(-w/2,-h,w,h);c.fillStyle=rgba('#c8d4ff',.14);c.fillRect(-w/2,-h,w,.6);
    if(r()<.4){c.strokeStyle=rgba(C.gold,.55);c.lineWidth=.5;c.beginPath();for(let k=0;k<=w-2;k+=1)c.lineTo(-w/2+1+k,-h/2+Math.sin(k*1.2)*.9);c.stroke();}c.restore();}
  // the dark the fallen stone throws on the ground in front of it
  c.save();c.globalCompositeOperation='destination-over';for(let d=-10;d<BRK[0][0];d+=6){const q=pp(wx-16,GB,d);c.fillStyle=rgba('#000000',.18);c.beginPath();c.ellipse(q.x,q.y+1,18,4,0,0,TAU);c.fill();}c.restore();
  BRC={cv,x0,y0:top,w:x1-x0,h:y1-top,wx};return BRC;}
function wall(){const wx=S.arena.wall;if(!wx)return true;const st=S.wall?S.wall.state:'standing',hp=S.wall?S.wall.hp:3,d0=-12,d1=S.arena.far,yb=GB,yt=GB-WALL_TOP,yh=GB-WALL_GAP,br=st==='breached',t=S.t;
  const F=faceCanvas(),Nd=endCanvas(),V=ivyCanvas();
  const facePath=()=>{ctx.beginPath();if(br){ctx.moveTo(d1,yt);ctx.lineTo(d1,yb);for(const [d,h] of BRK)ctx.lineTo(d,yb-h);ctx.closePath();ctx.moveTo(d0,yb);for(const [d,h] of STUB)ctx.lineTo(d,yb-h);ctx.closePath();}else{ctx.moveTo(d0,yt);ctx.lineTo(d1,yt);ctx.lineTo(d1,yb);ctx.lineTo(d0,yb);ctx.closePath();}};
  // the face, clipped to what stands of it
  ctx.save();ctx.save();facePlane(ctx,wx);facePath();ctx.restore();ctx.clip();
  ctx.save();facePlane(ctx,wx);ctx.drawImage(F.cv,F.d0,F.top,F.d1-F.d0,F.bot-F.top);
  // cracks where it has been hit: along the joints and through the stones, a pale edge where the stone split
  if(!br&&hp<=2){const dm=(d0+d1)*.42,crack=pts=>{ctx.strokeStyle='#050407';ctx.lineWidth=1.8;ctx.lineCap='round';ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(dm+p[0],p[1]):ctx.moveTo(dm+p[0],p[1]));ctx.stroke();
      ctx.strokeStyle=rgba('#d8ccb8',.28);ctx.lineWidth=.6;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(dm+p[0]+1,p[1]-1):ctx.moveTo(dm+p[0]+1,p[1]-1));ctx.stroke();};
    crack([[-20,yb-150],[-6,yb-128],[-14,yb-104],[2,yb-82]]);if(hp<=1){crack([[-30,yb-60],[-12,yb-74],[8,yb-66]]);crack([[2,yb-82],[14,yb-98],[22,yb-122]]);}}
  if(!br&&hp<=1){const crack=pts=>{ctx.strokeStyle='#050407';ctx.lineWidth=2.6;ctx.lineCap='round';ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();ctx.strokeStyle=rgba('#d8ccb8',.25);ctx.lineWidth=.8;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0]+1.5,p[1]-1):ctx.moveTo(p[0]+1.5,p[1]-1));ctx.stroke();};
    crack([[136,yb-176],[150,yb-150],[142,yb-128],[160,yb-100],[154,yb-72],[170,yb-44]]);crack([[150,yb-150],[176,yb-138],[196,yb-146]]);crack([[160,yb-100],[188,yb-92]]);}
  if(br){ctx.strokeStyle='#050407';ctx.lineWidth=1.6;ctx.beginPath();STUB.forEach(([d,h],i)=>i?ctx.lineTo(d,yb-h):ctx.moveTo(d,yb-h));ctx.stroke();}
  ctx.restore();
  // the torches' light on the stone, and the ivy
  for(const T of TORCH){if(br&&T.d<BRK_D+2)continue;const q=torchAt(T),k=.85+.15*Math.sin(t*9+T.d)*Math.sin(t*4.1);ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=rad(ctx,q.x,q.y,0,70,[[0,rgba('#ffa850',.32*k)],[1,rgba('#ffa850',0)]]);ctx.fillRect(q.x-70,q.y-70,140,140);ctx.restore();}
  ctx.drawImage(V.cv,V.x0,V.y0,V.w,V.h);ctx.restore();
  // the wall walk on top, and the merlons along it, back to front
  {const stone=TX().granite(62,96,96,{base:'#7e766a'}),w0=br?BRK_D:d0,q=[pp(wx,yt,w0),pp(wx+WALL_T,yt,w0),pp(wx+WALL_T,yt,d1),pp(wx,yt,d1)];ctx.beginPath();ctx.moveTo(q[0].x,q[0].y);for(const p of q.slice(1))ctx.lineTo(p.x,p.y);ctx.closePath();
    ctx.fillStyle=patAt(ctx,stone,0,0,.25);ctx.fill();ctx.fillStyle=rgba('#0a0c18',.86);ctx.fill();
    if(br){const B0=breakCanvas(wx);ctx.drawImage(B0.cv,B0.x0,B0.y0,B0.w,B0.h);}
    for(let d=d1-16;d>=(br?BRK_D+1:10);d-=26){const a=pp(wx,yt,d),b=pp(wx,yt,d+14),mh=13;
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(a.x,a.y-mh);ctx.lineTo(b.x,b.y-mh);ctx.lineTo(b.x,b.y);ctx.closePath();ctx.fillStyle=patAt(ctx,stone,0,0,.25);ctx.fill();ctx.fillStyle=rgba('#0a0c18',.84);ctx.fill();
      const e=pp(wx+WALL_T,yt,d),f=pp(wx+WALL_T,yt,d+14);ctx.beginPath();ctx.moveTo(a.x,a.y-mh);ctx.lineTo(e.x,e.y-mh);ctx.lineTo(f.x,f.y-mh);ctx.lineTo(b.x,b.y-mh);ctx.closePath();ctx.fillStyle=patAt(ctx,stone,0,0,.25);ctx.fill();ctx.fillStyle=rgba('#0a0c18',.74);ctx.fill();
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(e.x,e.y);ctx.lineTo(e.x,e.y-mh);ctx.lineTo(a.x,a.y-mh);ctx.closePath();ctx.fillStyle=patAt(ctx,stone,0,0,.25);ctx.fill();ctx.fillStyle=rgba('#0a0c18',.84);ctx.fill();
      ctx.fillStyle=rgba('#c8d4ff',.14);ctx.fillRect(a.x,a.y-mh,e.x-a.x,.7);}}
  // the broken near end: the core showing between the skins, a warm rim on its edge
  {const a=pp(wx,yb,d0),b=pp(wx,yt,d0),sh=br?STUB[0][1]:WALL_TOP,st=pp(wx,yb-sh,d0);ctx.save();ctx.beginPath();if(br){ctx.moveTo(a.x,a.y);ctx.lineTo(st.x,st.y);for(let u=3;u<=WALL_T;u+=3.3)ctx.lineTo(st.x+u,st.y+((u*7)%6)-2+u*.12);ctx.lineTo(a.x+WALL_T,a.y);ctx.closePath();}else ctx.rect(a.x,b.y,WALL_T,a.y-b.y);ctx.clip();ctx.drawImage(Nd.cv,b.x,b.y,Nd.w,Nd.h);
    if(!br&&hp<=2){const cr=(pts,w)=>{ctx.strokeStyle='#040306';ctx.lineWidth=w;ctx.lineCap='round';ctx.beginPath();pts.forEach(([u,v],i)=>i?ctx.lineTo(b.x+u,b.y+v):ctx.moveTo(b.x+u,b.y+v));ctx.stroke();ctx.strokeStyle=rgba('#d8ccb8',.22);ctx.lineWidth=.5;ctx.beginPath();pts.forEach(([u,v],i)=>i?ctx.lineTo(b.x+u+.8,b.y+v-.6):ctx.moveTo(b.x+u+.8,b.y+v-.6));ctx.stroke();};
      cr([[4,60],[9,78],[6,96],[13,118],[10,136]],1.6);if(hp<=1){cr([[13,118],[20,132],[18,150],[24,170]],2);cr([[6,96],[1,104]],1.2);cr([[18,150],[9,176],[12,196],[5,214]],1.8);
        ctx.fillStyle='#040306';ctx.beginPath();ctx.moveTo(b.x+20,b.y+152);ctx.lineTo(b.x+26,b.y+150);ctx.lineTo(b.x+26,b.y+166);ctx.lineTo(b.x+22,b.y+164);ctx.closePath();ctx.fill();}}
    ctx.restore();
    ctx.strokeStyle=rgba(C.rim,.4);ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(a.x+.7,a.y);ctx.lineTo(br?st.x+.7:b.x+.7,br?st.y:b.y);ctx.stroke();
    if(!br){ctx.save();ctx.beginPath();ctx.rect(a.x-6,b.y-2,WALL_T+12,a.y-b.y+2);ctx.clip();ctx.drawImage(V.cv,V.x0,V.y0,V.w,V.h);ctx.restore();}
    // grass on the broken top
    const gt=br?st:b;weeds(ctx,gt.x+6,gt.y+1,6,7,3);weeds(ctx,gt.x+18,gt.y+1+(br?2:0),5,6,4);}
  // the torches: iron brackets and their flames
  for(const T of TORCH){if(br&&T.d<BRK_D+2)continue;const q=torchAt(T),k=Math.sin(t*13+T.d);ctx.save();ctx.strokeStyle='#0a090c';ctx.lineWidth=1.6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(q.x+3,q.y+10);ctx.lineTo(q.x-4,q.y+4);ctx.lineTo(q.x-4,q.y-2);ctx.stroke();
    ctx.fillStyle='#14100c';ctx.fillRect(q.x-6,q.y-2,4,5);ctx.fillStyle=rgba(C.rim,.4);ctx.fillRect(q.x-6,q.y-2,4,.6);
    for(let i=0;i<4;i++){const fx2=q.x-5.6+i*1.3,fh=7+3*Math.sin(t*21+i*1.9+T.d)+1.6*k;ctx.fillStyle=rgba(i%2?'#ffb54a':'#ff8a30',.88);ctx.beginPath();ctx.moveTo(fx2-1.2,q.y-1.5);ctx.quadraticCurveTo(fx2-.6,q.y-1.5-fh*.6,fx2+.4,q.y-1.5-fh);ctx.quadraticCurveTo(fx2+1.2,q.y-1.5-fh*.45,fx2+1.3,q.y-1.5);ctx.closePath();ctx.fill();}
    glow(ctx,q.x-4,q.y-6,18,'#ffd08a',.75);glow(ctx,q.x-4,q.y-4,70,'#ff9a50',.22);ctx.restore();}
  return true;}
// ---------- the scene ----------
function paint(c){const X0=-160,X1=W+240,T0=-110,r=rng(3),wx=wallX(),base=fy(0),yF=GB-FAR*PSY;
  // the night sky, warmer down toward the city beyond the walls
  c.fillStyle=lin(c,0,T0,0,base,[[0,C.night0],[.34,'#080b16'],[.62,'#131527'],[.84,'#2a1e2c'],[1,'#47302c']]);c.fillRect(X0,T0,X1-X0,base-T0+6);
  stars(c,X0,X1,T0,base-60,180,17,.65);
  moon(c,128,64,13,{phase:.35});
  cloudBank(c,X0,X1,88,28,{seed:5,n:15,col:'#161624',under:'#ff9a5a'});
  glow(c,820,base-10,420,'#ff9a5a',.13,.3);
  // beyond the walls: the plain, the city's lights along it, the Hallowell tower
  c.fillStyle='#100d16';c.beginPath();c.moveTo(X0,base-24);for(let x=X0;x<=X1;x+=8)c.lineTo(x,base-30-5*Math.sin(x*.012)-3*Math.sin(x*.04+2));c.lineTo(X1,base+10);c.lineTo(X0,base+10);c.closePath();c.fill();
  skyline(c,X0,X1,base-14,{seed:41,far:.9,h0:6,h1:30,w0:8,w1:20,col:'#18141f',hazeCol:'#3a2a34',hazeH:30,hazeA:.5,dens:1.4});
  hallTower(c,874,base-10,58,26,{lit:.95});
  skyline(c,X0,X1,base+2,{seed:43,far:.6,h0:4,h1:18,w0:10,w1:24,col:'#140f19',hazeCol:'#3e2a30',hazeH:20,hazeA:.4,dens:1.2});
  // the far wall across the back: the stretch to the left, the gatehouse, the fallen gap, the stretch to the corner
  const G=GATE,gl=G.x-G.w/2-G.tw-2,gr=G.x+G.w/2+G.tw+2,topL=x=>128+2.5*Math.sin(x*.07)+1.5*Math.sin(x*.23)-(x<-60?((-60-x)*.2):0)-(x>40&&x<96?10*Math.sin((x-40)/56*Math.PI):0),gap0=520,gap1=612;
  const topR=x=>x<gap0?128:x<gap1?26+12*Math.abs(Math.sin(x*.09))+(x<gap0+16?(gap0+16-x)*5:0)+(x>gap1-18?(x-gap1+18)*5.5:0):128;
  farWall(c,X0-60,gl,topL,7);merlons(c,X0-60,gl,128,10,7,8);
  farWall(c,gr,wx-6,topR,9);merlons(c,gr,gap0-2,128,10,7,10);merlons(c,gap1+2,wx-6,128,10,7,11);
  for(const x of [60,180,560-100,690])slit(c,x,80,1);
  // rubble at the foot of the fallen stretch
  {const stone=TX().granite(62,96,96,{base:'#7e766a'}),rr=rng(19);for(let i=0;i<40;i++){const x=gap0-20+rr()*(gap1-gap0+40),h=rr()*22*Math.sin(clamp((x-gap0+20)/(gap1-gap0+40),0,1)*Math.PI),s=2+rr()*4;
    c.save();c.translate(fx(x),fy(h)+2);c.rotate(rr()*3);c.beginPath();c.moveTo(-s,-s*.6);c.lineTo(s*.8,-s*.7);c.lineTo(s,s*.5);c.lineTo(-s*.5,s*.7);c.closePath();c.fillStyle=patAt(c,stone,0,0,.25);c.fill();c.fillStyle=rgba('#0a0c14',.55+rr()*.2);c.fill();c.restore();}}
  gatehouse(c);
  // the braziers' light warming the gatehouse stones
  c.save();c.globalCompositeOperation='lighter';for(const B of BRAZ){const q=brazAt(B);c.fillStyle=rad(c,q.x,q.y,0,90,[[0,rgba('#ff9a50',.2)],[.5,rgba('#ff9a50',.06)],[1,rgba('#ff9a50',0)]]);c.fillRect(q.x-90,q.y-90,180,180);}c.restore();
  ivy(c,[[fx(-40),fy(126),60,0],[fx(-30),fy(124),90,.4],[fx(-18),fy(127),40,0],[fx(640),fy(126),70,-.4],[fx(652),fy(125),110,0],[fx(665),fy(127),60,.5]],41);
  // the ground inside the walls: grass, the old road of setts running through it to the gate, puddles on the road
  {const g=GB;c.save();c.beginPath();const qs=[pp(X0,g,DW),pp(wx,g,DW),pp(wx,g,-100),pp(X0,g,-100)];poly(c,qs);c.clip();
    c.save();plane(c,g);c.fillStyle=patAt(c,TB().turf(5,{}),0,0,.25);c.fillRect(X0,-100,wx-X0,DW+100);
    const roadX=d=>lerp(178,G.x,Math.pow((d+100)/(DW+100),1.25)),rw=d=>lerp(34,26,(d+100)/(DW+100)),jr=rng(5),L=[],R=[];for(let d=-100;d<=DW;d+=8){L.push([roadX(d)-rw(d)+(jr()-.5)*5,d]);R.push([roadX(d)+rw(d)+(jr()-.5)*5,d]);}
    c.beginPath();L.forEach(([x,d],i)=>i?c.lineTo(x,d):c.moveTo(x,d));for(let i=R.length-1;i>=0;i--)c.lineTo(R[i][0],R[i][1]);c.closePath();c.save();c.clip();
    c.fillStyle=patAt(c,TX().setts(7,{c0:'#28222a',c1:'#423a40',farX:true}),0,0,1/6,90);c.fillRect(X0,-100,wx-X0,DW+100);c.restore();
    c.strokeStyle=rgba('#0a0c08',.6);c.lineWidth=2.2;c.beginPath();L.forEach(([x,d],i)=>i?c.lineTo(x,d):c.moveTo(x,d));c.stroke();c.beginPath();R.forEach(([x,d],i)=>i?c.lineTo(x,d):c.moveTo(x,d));c.stroke();c.restore();
    c.fillStyle=lin(c,0,yF,0,GB+80,[[0,rgba('#06070e',.58)],[1,rgba('#05060c',.7)]]);c.fillRect(X0,base-20,wx-X0+60,GB+120-base);
    // puddles on the road holding the braziers' light
    for(const [d,w] of [[230,14],[150,18],[60,22]]){const q=pp(roadX(d)+(d%3)*4,g,d);c.save();c.beginPath();c.ellipse(q.x,q.y,w,w*.22,0,0,TAU);c.clip();c.fillStyle=lin(c,0,q.y-w*.22,0,q.y+w*.22,[[0,'#262a38'],[1,'#13151e']]);c.fillRect(q.x-w,q.y-w,2*w,2*w);
      c.globalCompositeOperation='lighter';for(const B of BRAZ){const bq=brazAt(B);if(Math.abs(bq.x-q.x)<w+16){c.fillStyle=rgba('#ffb866',.32);c.fillRect(bq.x-1.5,q.y-w*.22,3,w*.44);}}c.restore();}
    c.restore();}
  // the strip under the near wall (the footing of its stones, seen only when it is broken through) and the ground outside it
  {const g=GB,stone=TX().granite(62,96,96,{base:'#6e665c'});c.save();c.beginPath();poly(c,[pp(wx,g,DW),pp(wx+WALL_T,g,DW),pp(wx+WALL_T,g,-100),pp(wx,g,-100)]);c.clip();c.fillStyle=patAt(c,stone,0,0,.25);c.fillRect(wx-20,0,WALL_T+120,700);c.fillStyle=rgba('#05050a',.86);c.fillRect(wx-20,0,WALL_T+120,700);c.restore();
    c.save();c.beginPath();poly(c,[pp(wx+WALL_T,g,DW),pp(X1,g,DW),pp(X1,g,-100),pp(wx+WALL_T,g,-100)]);c.clip();c.save();plane(c,g);c.fillStyle=patAt(c,TB().turf(9,{g0:'#20261a',g1:'#343c24'}),0,0,.25);c.fillRect(wx,-100,X1-wx,DW+100);
      // the ditch along the outside of the wall
      c.fillStyle=lin(c,wx+WALL_T,0,wx+WALL_T+34,0,[[0,'rgba(4,4,8,.7)'],[.5,'rgba(10,10,14,.55)'],[1,'rgba(4,4,8,0)']]);c.fillRect(wx+WALL_T,-100,34,DW+100);c.restore();
      c.fillStyle=rgba('#05050b',.68);c.fillRect(wx,0,X1-wx,700);c.restore();}
  // the old town inside the walls: a roofless house's gable, cypresses against the far wall, a well
  {const stone=TX().granite(62,96,96,{base:'#7e766a'}),b0=pp(130,GB,288),b1=pp(214,GB,288),A=TB().ashlar(15,{bh:11,bl:26});
    c.beginPath();c.moveTo(b0.x,b0.y);c.lineTo(b0.x,b0.y-62);c.lineTo((b0.x+b1.x)/2-4,b0.y-96);c.lineTo((b0.x+b1.x)/2+6,b0.y-88);c.lineTo(b1.x-8,b0.y-70);c.lineTo(b1.x,b0.y-52);c.lineTo(b1.x,b1.y);c.closePath();
    c.fillStyle=patAt(c,A,b0.x,b0.y,.25);c.fill();c.fillStyle=lin(c,b0.x,0,b1.x,0,[[0,rgba('#0a0c18',.62)],[1,rgba('#06060c',.8)]]);c.fill();
    const wxm=(b0.x+b1.x)/2;c.fillStyle='#060509';c.beginPath();c.moveTo(wxm-8,b0.y-20);c.lineTo(wxm-8,b0.y-52);c.arc(wxm,b0.y-52,8,Math.PI,0);c.lineTo(wxm+8,b0.y-20);c.closePath();c.fill();
    c.strokeStyle=rgba(C.gold,.55);c.lineWidth=.6;c.beginPath();c.arc(wxm,b0.y-52,10,Math.PI,0);c.stroke();
    ivy(c,[[b1.x-10,b0.y-68,40,0],[b1.x-4,b0.y-56,30,0]],51);
    cypress(c,fx(30),fy(0)+8,78,9,1);cypress(c,fx(48),fy(0)+8,58,7,2);cypress(c,fx(628),fy(0)+8,84,10,3);cypress(c,fx(702),fy(0)+8,64,8,4);
    for(const B of BRAZ)brazier(c,brazAt(B));}
  // stones fallen from the walls in the grass, weeds along the road
  {const stone=TX().granite(62,96,96,{base:'#7e766a'});for(let i=0;i<22;i++){const x=40+r()*(wx-80),d=180+r()*110,q=pp(x,GB,d),s=1.6+r()*3.4;c.save();c.translate(q.x,q.y);c.rotate((r()-.5)*.6);c.beginPath();c.moveTo(-s,0);c.lineTo(-s*.8,-s*.7);c.lineTo(s*.1,-s*.95);c.lineTo(s,-s*.5);c.lineTo(s*.9,0);c.closePath();c.fillStyle=patAt(c,stone,0,0,.25);c.fill();c.fillStyle=rgba('#0a0c14',.74);c.fill();c.fillStyle=rgba('#c8d4ff',.12);c.fillRect(-s*.6,-s*.85,s*1.2,.45);c.restore();weeds(c,q.x+s,q.y,2,3,i+900);}
    for(let i=0;i<30;i++){const x=20+r()*(wx-60),d=-60+r()*340,q=pp(x,GB,d);weeds(c,q.x,q.y,4,4+r()*5,i+70);}}
  // the light: warm pools before the braziers and below the torches, the moon's cool wash, the dark toward us
  c.save();c.globalCompositeOperation='lighter';for(const B of BRAZ){const q=pp(B.x,GB,DW-34);c.save();c.translate(q.x,q.y);c.scale(1,.4);c.fillStyle=rad(c,0,0,0,110,[[0,rgba('#ffb060',.18)],[1,rgba('#ffb060',0)]]);c.fillRect(-120,-120,240,240);c.restore();}
    for(const T of TORCH){const q=pp(wx-30,GB,T.d);c.save();c.translate(q.x,q.y);c.scale(1,.4);c.fillStyle=rad(c,0,0,0,100,[[0,rgba('#ffb060',.12)],[1,rgba('#ffb060',0)]]);c.fillRect(-110,-110,220,220);c.restore();}
    c.fillStyle=lin(c,0,base,0,GB+40,[[0,rgba('#6a7aa8',.06)],[1,rgba('#6a7aa8',0)]]);c.fillRect(X0,base,X1-X0,GB+40-base);c.restore();
  haze(c,X0,X1,base-40,base+10,'#3a2a3a',.14);
  c.fillStyle=lin(c,0,GB-40,0,GB+120,[[0,rgba('#000000',0)],[1,rgba('#000000',.6)]]);c.fillRect(X0,GB-40,X1-X0,160);}
// the braziers burn: drawn every frame over the layer
function live(){const t=S.t;ctx.save();
  for(const B of BRAZ){const q=brazAt(B),f=.9+.1*Math.sin(t*7+B.x)*Math.sin(t*3.3);
    for(let i=0;i<6;i++){const fx2=q.x-6+i*2.4,fh=6+3*Math.sin(t*19+i*1.7+B.x)+2*Math.sin(t*31+i);ctx.fillStyle=rgba(i%2?'#ffb54a':'#ff8a30',.85);ctx.beginPath();ctx.moveTo(fx2-1.6,q.y+4);ctx.quadraticCurveTo(fx2-1,q.y+4-fh*.6,fx2+.3,q.y+4-fh);ctx.quadraticCurveTo(fx2+1.3,q.y+4-fh*.5,fx2+1.6,q.y+4);ctx.closePath();ctx.fill();}
    glow(ctx,q.x,q.y,24,'#ffd08a',.7*f);glow(ctx,q.x,q.y+4,90,'#ff9a50',.22*f);}
  ctx.restore();}
// the light that falls on a fighter: a torch on the wall while it stands, else the nearer brazier, else the moon
function light(f){const px=f.p[PEL].x+f.dep*PSX,cands=[];if(!(S.wall&&S.wall.state==='breached'))for(const T of TORCH)cands.push(torchAt(T));for(const B of BRAZ)cands.push(brazAt(B));
  let best=null,bd=1e9;for(const q of cands){const dd=Math.abs(q.x-px);if(dd<bd){bd=dd;best=q;}}
  if(bd>240)return{dir:{x:-.4,y:-1}};return{light:{x:best.x-f.dep*PSX,y:best.y+f.dep*PSY}};}
E.S.wall={paint,live,light,wall,table:()=>typeof EnvProps!=='undefined'?EnvProps.fieldTable('rustic'):false,div:it=>it.dv.mat==='plank'&&typeof EnvProps!=='undefined'?EnvProps.plankFence(it,'rustic'):false};
})();
// ===== ENV WALL END =====
