// ===== ENV FIELD =====
// Open Field, proposed as the river meadows outside the city. Night: the moon over the left of the sky, thin cloud silvered round it;
// across the back the river, and on its far bank an old elven aqueduct striding toward the city on pointed arches, the gold vine along
// its cornice and one span fallen; beyond the bank the city and the Hallowell tower with its ring of cyan light. The meadow the fight
// stands on is grazed grass, dark and calm, a footpath worn through it to a landing where a lantern hangs over a moored boat.
// Fireflies over the grass, mist on the water.
(()=>{const E=EnvLook,{C,pp,poly,line,lin,rad,rgba,mix,glow,haze,vine,stars,moon,skyline,hallTower,wetStreak,rng,lerp,clamp,TAU}=E;
const FAR=278,EY=()=>GB-FAR*PSY;
const MOON={x:262,y:86,r:15},TOWER={x:748,base:229,top:66,w:30};
const BANK0=228,WAT0=236;            // the far bank's top and the water's far edge, on screen
const PATH={a:{x:-70,d:-100},b:{x:552,d:FAR},w:13};   // the footpath across the meadow, in the ground plane
const LAND={x:617,y:261};            // where the path meets the water: the landing
function patAt(c,cv,x,y,u,rot){const p=c.createPattern(cv,'repeat');if(p.setTransform){let m=new DOMMatrix().translate(x,y);if(rot)m=m.rotate(rot);p.setTransform(m.scale(u));}return p;}
// distance from the footpath's centre line, in plane units, and where along it (0..1)
function pathDist(x,d){const ax=PATH.a.x,ad=PATH.a.d,bx=PATH.b.x-ax,bd=PATH.b.d-ad,L2=bx*bx+bd*bd,t=clamp(((x-ax)*bx+(d-ad)*bd)/L2,0,1),px=ax+bx*t,pd=ad+bd*t;return{dist:Math.hypot(x-px,d-pd),t};}
// ---------- trees on the far bank, as silhouettes rimmed on the side toward the moon ----------
// each returns a Path2D; rimmed() fills it pale, then dark a little away from the moon, so a thin edge of moonlight is left
function poplar(x,base,h,w,seed){const r=rng(seed),p=new Path2D(),n=22,pts=[];
  for(let i=0;i<=n;i++){const t=i/n,ww=w*Math.sin(Math.PI*Math.pow(t,.8))*(1-.25*t)*(.75+.5*r());pts.push({x:x-ww/2,y:base-h*t});}
  p.moveTo(x-1,base);for(const q of pts)p.lineTo(q.x,q.y);p.lineTo(x,base-h-3);for(let i=n;i>=0;i--){const t=i/n,ww=w*Math.sin(Math.PI*Math.pow(t,.8))*(1-.25*t)*(.75+.5*r());p.lineTo(x+ww/2,base-h*t);}p.lineTo(x+1,base);p.closePath();return p;}
function willow(x,base,h,w,seed){const r=rng(seed),p=new Path2D();
  p.moveTo(x-2.4,base);p.quadraticCurveTo(x-1.4,base-h*.3,x-3.2,base-h*.56);p.lineTo(x+1.2,base-h*.6);p.quadraticCurveTo(x+1.4,base-h*.3,x+2.4,base);p.closePath();
  for(let i=0;i<22;i++){const t=r(),a=Math.PI*(1.04+.92*t),rr=w*(.08+.09*r()),cx=x+Math.cos(a)*w*.46*(.5+.5*r()),cy=base-h*.7+Math.sin(a)*h*.22+r()*h*.06;p.moveTo(cx+rr,cy);p.ellipse(cx,cy,rr,rr*.8,0,0,TAU);}
  return p;}
// the curtain of a willow's fronds, hanging from the rim of its crown toward the water
function fronds(c,x,base,h,w,seed,lit){const r=rng(seed+1);c.save();c.lineCap='round';
  for(let i=0;i<130;i++){const u=(r()-.5)*2,fx=x+u*w*.55,fy=base-h*(.5+.36*(1-u*u)*r()),fl=h*(.22+.36*r())*(1-.3*Math.abs(u)),sw=(r()-.5)*2.2,ex=fx+sw*1.4+u*2.4,ey=Math.min(base+1,fy+fl);
    c.strokeStyle='#05070b';c.lineWidth=.5+r()*.8;c.beginPath();c.moveTo(fx,fy);c.quadraticCurveTo(fx+sw,(fy+ey)/2,ex,ey);c.stroke();
    if(lit&&r()<.22){c.strokeStyle=rgba('#c8d4ff',.22);c.lineWidth=.35;c.beginPath();c.moveTo(fx+(x<MOON.x?.5:-.5),fy+1);c.quadraticCurveTo(fx+sw,(fy+ey)/2,ex,ey-1);c.stroke();}}
  c.restore();}
function bush(x,base,w,h,seed){const r=rng(seed),p=new Path2D();for(let i=0;i<6;i++){const cx=x+(r()-.5)*w*.8,rr=w*(.18+r()*.16),cy=base-rr*.7;p.moveTo(cx+rr,cy);p.ellipse(cx,cy,rr,rr*.75,0,0,TAU);}p.rect(x-w/2,base-2,w,2);return p;}
function rimmed(c,p,dark,rim,ra,x){c.fillStyle=rgba(rim,ra);c.fill(p);c.save();c.translate(x<MOON.x?-.9:.9,.9);c.fillStyle=dark;c.fill(p);c.restore();}
// ---------- the elven aqueduct: piers of pale stone, pointed arches, a cornice with the vine, a span fallen near the left ----------
function aqueduct(c){const base=BANK0+3,top=182,x0=-190,x1=510,bay=46,pw=10,ys=top+22;
  const body=new Path2D();body.rect(x0,top,x1-x0,base-top);
  for(let x=x0;x<x1-pw;x+=bay){const a0=x+pw,a1=Math.min(x+bay,x1-pw),w=a1-a0,h=w*.6;body.moveTo(a0,base+1);body.lineTo(a0,ys);body.quadraticCurveTo(a0,ys-h*.62,(a0+a1)/2,ys-h);body.quadraticCurveTo(a1,ys-h*.62,a1,ys);body.lineTo(a1,base+1);body.closePath();}
  // the fallen span: the deck and the spandrels gone between two piers, the stumps ragged
  const gone=new Path2D(),r=rng(4),gx0=-12,gx1=86;gone.moveTo(gx0,top-12);for(let x=gx0;x<=gx1;x+=6)gone.lineTo(x,top+6+r()*10+(x>gx0+10&&x<gx1-10?14:0));gone.lineTo(gx1,top-12);gone.closePath();
  // and the far end, broken off in steps where the stone has been robbed
  gone.moveTo(x1-34,top-12);gone.lineTo(x1-34,top+3);gone.lineTo(x1-22,top+5);gone.lineTo(x1-21,top+14);gone.lineTo(x1-12,top+16);gone.lineTo(x1-10,top+27);gone.lineTo(x1-2,top+31);gone.lineTo(x1+20,top+31);gone.lineTo(x1+20,top-12);gone.closePath();
  c.save();const keep=new Path2D();keep.rect(x0-20,top-40,x1-x0+40,base-top+60);keep.addPath(gone);c.clip(keep,'evenodd');
  c.fillStyle=patAt(c,OutTex.lichenStone(31,256,256,{base:'#76706a',dark:'#2c2a2a',l1:'#9a7a46'}),0,top,.3);c.fill(body,'evenodd');
  // night on the stone: the moon finds the face, the soffits of the arches stay black
  c.fillStyle=lin(c,0,top,0,base,[[0,rgba('#070810',.42)],[1,rgba('#05060c',.72)]]);c.fill(body,'evenodd');
  c.save();c.globalCompositeOperation='lighter';c.fillStyle=rad(c,MOON.x,MOON.y,20,420,[[0,rgba('#9aa8d0',.12)],[1,rgba('#9aa8d0',0)]]);c.fill(body,'evenodd');c.restore();
  for(let x=x0;x<x1-pw;x+=bay){const a0=x+pw,a1=Math.min(x+bay,x1-pw),w=a1-a0,h=w*.6;c.strokeStyle=rgba('#000000',.55);c.lineWidth=2.2;c.beginPath();c.moveTo(a0+1,base);c.lineTo(a0+1,ys);c.quadraticCurveTo(a0+1,ys-h*.62+1,(a0+a1)/2,ys-h+1.2);c.stroke();
    // voussoir joints round each arch, the course line at the springing
    c.strokeStyle=rgba('#000000',.35);c.lineWidth=.45;c.beginPath();for(let k=1;k<6;k++){const t=k/6,ax=lerp(a0,a1,t),ay=ys-h*Math.sin(Math.PI*t)*.98;c.moveTo(ax,ay);c.lineTo(ax+(ax-(a0+a1)/2)*.12,ay-4.5);}c.stroke();}
  c.save();c.clip(body,'evenodd');c.strokeStyle=rgba('#000000',.32);c.lineWidth=.45;c.beginPath();for(let y=top+6.5;y<base;y+=6.5){c.moveTo(x0,y);c.lineTo(x1,y);}
    for(let y=top+6.5,k=0;y<base;y+=6.5,k++)for(let x=x0+(k%2)*7;x<x1;x+=14){c.moveTo(x,y);c.lineTo(x,y+6.5);}c.stroke();
    c.strokeStyle=rgba('#d8e0ff',.07);c.beginPath();for(let y=top+7.2;y<base;y+=6.5){c.moveTo(x0,y);c.lineTo(x1,y);}c.stroke();c.restore();
  // ivy over some of the piers and spandrels, dark leaves with a few that catch the moon
  {const ri=rng(12);for(let i=0;i<9;i++){const ix=x0+60+ri()*(x1-x0-80),iy=top+4+ri()*20,ih=12+ri()*26;if(ix>gx0-6&&ix<gx1+6)continue;
    for(let k=0;k<40;k++){const lx=ix+(ri()-.5)*10*(1+k/40),ly=iy+ri()*ih;c.fillStyle=ri()<.12?rgba('#9aa8c0',.35):'#0a100c';c.beginPath();c.ellipse(lx,ly,1.4,1,ri()*3,0,TAU);c.fill();}}}
  // the cornice, lit along its top, the vine let into it in gold
  c.fillStyle=patAt(c,OutTex.lichenStone(32,256,256,{base:'#86807a',dark:'#34322e'}),0,top-6,.3);c.fillRect(x0,top-6,x1-x0,7);c.fillStyle=rgba('#05060c',.5);c.fillRect(x0,top-6,x1-x0,7);
  c.fillStyle=rgba('#d8e0ff',.32);c.fillRect(x0,top-6,x1-x0,.7);c.fillStyle=rgba('#000000',.5);c.fillRect(x0,top+1,x1-x0,1.4);
  vine(c,[{x:x0,y:top-2.5},{x:x1,y:top-2.5}],{w:.55,amp:1,wave:10,leaf:1.5,every:2,seed:9,col:rgba(C.gold,.85)});
  c.restore();
  // the stumps of the fallen span, and its stones lying in the grass of the far bank
  c.fillStyle=rgba('#d8e0ff',.18);for(const sx of [gx0+4,gx1-6]){c.fillRect(sx,top+12,1,4);}
  for(let i=0;i<7;i++){const bx=gx0+10+r()*(gx1-gx0-20),by=base-1-r()*3,bw=5+r()*7;c.fillStyle='#2a2a2c';c.beginPath();c.moveTo(bx,by);c.lineTo(bx+bw*.2,by-3-r()*2);c.lineTo(bx+bw,by-2);c.lineTo(bx+bw+1,by);c.closePath();c.fill();c.fillStyle=rgba('#c8d0f0',.25);c.fillRect(bx+bw*.2,by-3,bw*.5,.5);}
  return{x0,x1,top,base,bay,pw};}
// ---------- the city across the river: blocks with lit windows in their floors, flat roofs and parapets, a few spires, domes and
// chimneys; hazed by distance (far 0 near, 1 far) ----------
function cityRow(c,x0,x1,base,o){const r=rng(o.seed),far=o.far,col=mix(o.col||'#121427','#2a2436',far*.7);let x=x0;
  while(x<x1){const w=(o.w0||8)+r()*(o.w1||20),h=(o.h0||10)+Math.pow(r(),1.5)*(o.h1||50),top=base-h,k=r();c.fillStyle=col;c.fillRect(x,top,w,h+2);
    if(k<.12){c.fillRect(x+w*.4,top-h*.35,w*.2,h*.35);c.beginPath();c.moveTo(x+w*.4,top-h*.35);c.lineTo(x+w*.5,top-h*.6);c.lineTo(x+w*.6,top-h*.35);c.fill();}
    else if(k<.2){c.beginPath();c.arc(x+w/2,top,w*.32,Math.PI,0);c.fill();c.fillRect(x+w/2-.5,top-w*.32-5,1,5);}
    else if(k<.32){c.beginPath();c.moveTo(x-1,top);c.lineTo(x+2.5,top-4);c.lineTo(x+w-2.5,top-4);c.lineTo(x+w+1,top);c.fill();}
    else if(k<.45){c.fillRect(x+w*.2,top-4-r()*4,2,6);c.fillRect(x+w*.62,top-3-r()*4,2,5);}
    else{c.fillRect(x-.6,top-1.2,w+1.2,1.4);}
    // the floors: a grid of windows, some lit
    const fw=3,fh=4,cols=Math.max(1,Math.floor((w-2)/fw)),rows=Math.max(1,Math.floor((h-3)/fh));for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){if(r()>(o.lit||.3))continue;
      c.fillStyle=rgba(r()<.88?'#ffcf86':'#dfeeff',(.3+.55*r())*(1-far*.55));c.fillRect(x+1.4+j*fw,top+2.2+i*fh,1.1,1.5);}
    c.fillStyle=rgba('#ffcf86',.08*(1-far));c.fillRect(x+w-1,top,1,h);
    x+=w+(r()<.2?r()*10:.5);}
  haze(c,x0,x1,base-(o.hazeH||40),base+2,'#3a2a36',o.hazeA==null?.45:o.hazeA);}
// ---------- the landing at the end of the path: a short jetty, a post with a lantern, a rowboat ----------
function landing(c){const x=LAND.x,y=LAND.y;
  // the jetty runs out over the water away from us: posts and planks, foreshortened
  c.fillStyle='#17110c';c.beginPath();c.moveTo(x-6,y+1);c.lineTo(x+6,y+1);c.lineTo(x+9.5,y-17);c.lineTo(x-2.5,y-17);c.closePath();c.fill();
  c.strokeStyle=rgba('#000000',.6);c.lineWidth=.4;c.beginPath();for(let k=1;k<9;k++){const t=k/9,yy=lerp(y+1,y-17,t),xa=lerp(x-6,x-2.5,t),xb=lerp(x+6,x+9.5,t);c.moveTo(xa,yy);c.lineTo(xb,yy);}c.stroke();
  c.fillStyle=rgba(C.rim,.22);c.beginPath();c.moveTo(x-2.5,y-17);c.lineTo(x+9.5,y-17);c.lineTo(x+9.3,y-16.3);c.lineTo(x-2.6,y-16.3);c.fill();
  for(const [px,py,ph] of [[x-6,y+1,8],[x+6,y+1,8],[x-2.5,y-17,7],[x+9.5,y-17,7]]){c.fillStyle='#0d0907';c.fillRect(px-1,py-ph,2,ph+3);c.fillStyle=rgba(C.rim,.3);c.fillRect(px+.4,py-ph,.6,ph);}
  // the rowboat moored along it, a painted line under the gunwale
  {const bx=x+16,by=y-7;c.fillStyle='#120d0a';c.beginPath();c.moveTo(bx-2,by-3);c.quadraticCurveTo(bx+14,by-4,bx+30,by-6);c.quadraticCurveTo(bx+28,by+2,bx+20,by+3);c.lineTo(bx+4,by+3);c.quadraticCurveTo(bx-1,by+1,bx-2,by-3);c.fill();
    c.fillStyle=rgba('#7a2a1e',.7);c.beginPath();c.moveTo(bx-1,by-1.6);c.quadraticCurveTo(bx+14,by-2.6,bx+29,by-4.4);c.lineTo(bx+29,by-3.6);c.quadraticCurveTo(bx+14,by-1.8,bx-1,by-.8);c.fill();
    c.fillStyle=rgba(C.rim,.35);c.beginPath();c.moveTo(bx-2,by-3);c.quadraticCurveTo(bx+14,by-4,bx+30,by-6);c.lineTo(bx+30,by-5.4);c.quadraticCurveTo(bx+14,by-3.4,bx-2,by-2.4);c.fill();
    c.strokeStyle='#0d0907';c.lineWidth=.5;c.beginPath();c.moveTo(bx-1,by-2);c.lineTo(x+5,y-6);c.stroke();}
  // the lantern on the jetty's far post
  const lx=x+9.5,ly=y-30;c.fillStyle='#0d0907';c.fillRect(lx-.9,ly,1.8,13);c.fillRect(lx-.9,ly-1,7,1.2);c.strokeStyle='#0d0907';c.lineWidth=.4;c.beginPath();c.moveTo(lx+5,ly);c.lineTo(lx+5,ly+2.5);c.stroke();
  c.fillStyle=lin(c,0,ly+2.5,0,ly+9,[[0,'#fff3d2'],[1,'#ffb259']]);c.fillRect(lx+3,ly+2.5,4,6.5);c.fillStyle='#0d0907';c.fillRect(lx+2.6,ly+2,4.8,1);c.fillRect(lx+2.6,ly+8.8,4.8,1);
  glow(c,lx+5,ly+6,40,'#ffc070',.55);glow(c,lx+5,ly+6,10,'#fff0d0',.7);
  return{lx:lx+5,ly:ly+6};}
// ---------- the scene ----------
function paint(c){
  const X0=-160,X1=W+240,T0=-110,ey=EY(),r=rng(17);
  // ---- the night sky: cold round the moon, warm low on the right where the city lights it
  c.fillStyle=lin(c,0,T0,0,ey,[[0,'#020309'],[.32,'#070a17'],[.62,'#10142a'],[.85,'#1b1b2e'],[1,'#282234']]);c.fillRect(X0,T0,X1-X0,ey-T0+2);
  glow(c,MOON.x,MOON.y,330,'#7c8ed0',.1);
  c.save();c.globalCompositeOperation='lighter';c.fillStyle=rad(c,800,236,10,470,[[0,rgba('#ff9a5a',.26)],[.35,rgba('#ff8a50',.09)],[1,rgba('#ff8a50',0)]]);c.fillRect(260,T0,X1-260,ey-T0);c.restore();
  stars(c,X0,X1,T0,205,230,13,.75);
  // thin strata of cloud, silvered where they pass the moon, warmed underneath where they pass over the city
  for(let i=0;i<9;i++){const cx=X0+r()*(X1-X0),cy=60+r()*90,rx=70+r()*170,ry=2.5+r()*5,dm=Math.hypot(cx-MOON.x,cy-MOON.y),k=clamp(1-dm/300,0,1),kc=clamp(1-Math.abs(cx-800)/360,0,1);
    c.save();c.translate(cx,cy);c.scale(1,ry/rx);c.fillStyle=rad(c,0,-ry*2,0,rx,[[0,rgba('#d8e0ff',.32*k)],[1,rgba('#d8e0ff',0)]]);c.beginPath();c.arc(0,-ry*1.2,rx,0,TAU);c.fill();
      c.fillStyle=rad(c,0,0,0,rx,[[0,rgba('#141828',.9)],[.7,rgba('#141828',.55)],[1,rgba('#141828',0)]]);c.beginPath();c.arc(0,0,rx,0,TAU);c.fill();
      if(kc>0){c.globalCompositeOperation='lighter';c.fillStyle=rad(c,0,ry*3,0,rx,[[0,rgba('#ff9a5a',.16*kc)],[1,rgba('#ff9a5a',0)]]);c.beginPath();c.arc(0,ry*1.5,rx,0,TAU);c.fill();}c.restore();}
  moon(c,MOON.x,MOON.y,MOON.r,{});
  // ---- the city across the river: far towers in haze, the Hallowell tower, the warehouses on the waterfront
  cityRow(c,420,X1,BANK0-4,{seed:12,far:.9,h0:16,h1:70,w0:8,w1:20,lit:.22,hazeH:52,hazeA:.5});
  cityRow(c,436,X1,BANK0,{seed:19,far:.72,h0:9,h1:42,w0:9,w1:22,lit:.3,hazeH:34,hazeA:.4});
  hallTower(c,TOWER.x,TOWER.base,TOWER.top,TOWER.w,{lit:.95});
  cityRow(c,452,X1,BANK0+3,{seed:5,far:.48,h0:5,h1:16,w0:12,w1:28,lit:.38,col:'#0e101c',hazeH:16,hazeA:.35});
  // a bridge of lamps over the river where it reaches the city
  {const y=BANK0+1;c.strokeStyle='#0a0b12';c.lineWidth=1.6;c.beginPath();c.moveTo(510,y);c.quadraticCurveTo(585,y-7,660,y);c.stroke();for(let i=0;i<=10;i++){const t=i/10,x=lerp(510,660,t),yy=y-7*4*t*(1-t)-1.2;c.fillStyle=rgba('#ffd9a0',.85);c.fillRect(x-.5,yy-.5,1,1);glow(c,x,yy,4,'#ffb866',.35);}
    for(let i=0;i<4;i++){const x=528+i*38;c.fillStyle='#0a0b12';c.beginPath();c.moveTo(x-6,y+.5);c.quadraticCurveTo(x,y-3.5,x+6,y+.5);c.lineTo(x+6,y+2);c.lineTo(x-6,y+2);c.fill();}}
  glow(c,840,226,320,'#ff9a5a',.12,.32);
  // ---- poplars behind the aqueduct, then the aqueduct, then willows and scrub on the far bank in front of it
  for(const [px,h,w] of [[-120,96,15],[-70,80,13],[176,104,16],[214,86,12],[356,92,14],[396,74,12]]){const p=poplar(px,BANK0+2,h,w,px*7);rimmed(c,p,'#06080d','#c8d4ff',.35,px);}
  const AQ=aqueduct(c);
  for(const [bx,h,w,k] of [[-40,40,40,'w'],[118,30,34,'w'],[280,34,38,'w'],[445,26,30,'w'],[60,10,30,'b'],[330,9,26,'b'],[520,8,28,'b'],[600,7,24,'b'],[980,8,30,'b']]){
    const p=k==='w'?willow(bx,BANK0+3,h,w,bx*3+5):bush(bx,BANK0+4,w,h,bx*5+1);rimmed(c,p,'#05070b','#c8d4ff',.28,bx);if(k==='w')fronds(c,bx,BANK0+3,h,w,bx*3+5,true);}
  c.fillStyle=lin(c,0,BANK0+1,0,WAT0,[[0,'#0d120f'],[1,'#07090b']]);c.fillRect(X0,BANK0+1,X1-X0,WAT0-BANK0);c.fillStyle=rgba('#c8d4ff',.1);c.fillRect(X0,BANK0+1,X1-X0,.6);
  {const rb=rng(44);for(let i=0;i<60;i++){const bx=X0+rb()*(X1-X0),bw=2+rb()*5;c.fillStyle=rgba('#2a2c30',.8);c.beginPath();c.ellipse(bx,WAT0-.6,bw,1.2,0,Math.PI,0);c.fill();c.fillStyle=rgba('#c8d4ff',.15);c.fillRect(bx-bw*.6,WAT0-1.6,bw*.8,.4);}}
  // ---- the river: the sky lies on it, the far bank and the arches go dark in it, the moon's track and the city's lights break on it
  const wy0=WAT0,wy1=ey+1;
  c.fillStyle=lin(c,0,wy0,0,wy1,[[0,'#1a1d2e'],[.45,'#10131f'],[1,'#151a28']]);c.fillRect(X0,wy0,X1-X0,wy1-wy0);
  c.save();c.globalCompositeOperation='lighter';c.fillStyle=rad(c,820,wy0,0,420,[[0,rgba('#ff9a5a',.17)],[1,rgba('#ff9a5a',0)]]);c.fillRect(260,wy0,X1-260,wy1-wy0);c.restore();
  c.fillStyle=lin(c,0,wy0,0,wy0+9,[[0,rgba('#020306',.85)],[1,rgba('#020306',0)]]);c.fillRect(X0,wy0,X1-X0,9);
  // the piers' reflections, wavering
  for(let x=AQ.x0;x<AQ.x1-AQ.pw;x+=AQ.bay){c.fillStyle=rgba('#020306',.5);c.beginPath();c.moveTo(x,wy0);for(let y=wy0;y<wy1-6;y+=3)c.lineTo(x+Math.sin(y*1.7+x)*1.2,y);for(let y=wy1-6;y>=wy0;y-=3)c.lineTo(x+AQ.pw+Math.sin(y*1.3+x)*1.2,y);c.closePath();c.fill();}
  wetStreak(c,MOON.x,wy0+1,wy1-1,16,'#dfe6ff',.55,3);
  wetStreak(c,TOWER.x,wy0+1,wy1-2,7,'#7ff3e3',.4,11);
  for(const [sx,a] of [[560,.18],[640,.2],[700,.16],[800,.22],[870,.15],[940,.2],[1020,.16]])wetStreak(c,sx,wy0+1,wy1-3,10,'#ffb866',a,sx);
  c.strokeStyle=rgba('#c8d4ff',.12);c.lineWidth=.5;c.beginPath();for(let i=0;i<46;i++){const x=X0+r()*(X1-X0),y=wy0+3+r()*(wy1-wy0-5),l=6+r()*24;c.moveTo(x,y);c.lineTo(x+l,y);}c.stroke();
  const LT=landing(c);wetStreak(c,LT.lx,wy0+2,wy1-1,8,'#ffc477',.5,77);
  // ---- the meadow: grazed grass in the ground plane, dark and calm
  const mv=[pp(X0,GB,FAR),pp(X1,GB,FAR),pp(X1,GB,-110),pp(X0,GB,-110)];
  c.save();poly(c,mv);c.clip();c.save();c.transform(1,0,PSX,-PSY,0,GB);
  c.fillStyle=patAt(c,OutTex.meadow(3,{g0:'#0f1913',g1:'#1c281d',dry:'#2a2a20',earth:'#1c1711'}),0,0,1/3);c.fillRect(X0-60,-120,X1-X0+120,FAR+130);
  // the footpath worn through it to the landing: trodden earth and grit, two soft ruts, a puddle holding the moon
  {const ax=PATH.a.x,ad=PATH.a.d,bx=PATH.b.x,bd=PATH.b.d,L=Math.hypot(bx-ax,bd-ad),ux=(bx-ax)/L,ud=(bd-ad)/L,nx=-ud,nd=ux,rr=rng(23),w=PATH.w,side=k=>{const e=[];for(let s2=0;s2<=L;s2+=5)e.push([ax+ux*s2+nx*k*w/2*(.82+.36*rr()),ad+ud*s2+nd*k*w/2*(.82+.36*rr())]);return e;};
    const e1=side(1),e2=side(-1).reverse();c.beginPath();for(const [x,d] of e1.concat(e2))c.lineTo(x,d);c.closePath();
    c.fillStyle=patAt(c,OutTex.pathEarth(7,{e0:'#2c261e',e1:'#4a4236',stone:'#6e695e'}),0,0,1/4);c.fill();
    c.lineCap='round';for(const off of [-2.9,2.9]){c.strokeStyle=rgba('#000000',.16);c.lineWidth=2.4;c.beginPath();for(let s2=0;s2<=L;s2+=4){const x=ax+ux*s2+nx*off+(rr()-.5)*.5,d=ad+ud*s2+nd*off;s2?c.lineTo(x,d):c.moveTo(x,d);}c.stroke();}
    c.strokeStyle=rgba('#8a8270',.08);c.lineWidth=1.4;c.beginPath();for(let s2=0;s2<=L;s2+=4){const x=ax+ux*s2,d=ad+ud*s2;s2?c.lineTo(x,d):c.moveTo(x,d);}c.stroke();
    for(const t of [.38,.71]){const px=ax+ux*L*t+nx*1.4,pd=ad+ud*L*t;c.fillStyle=rgba('#0a0c12',.75);c.beginPath();c.ellipse(px,pd,6,3.4,Math.atan2(ud,ux),0,TAU);c.fill();c.fillStyle=rgba('#8ea0c8',.16);c.beginPath();c.ellipse(px+1,pd+.6,3.6,1.6,Math.atan2(ud,ux),0,TAU);c.fill();}}
  c.restore();
  // the night over the meadow: darker toward us, the moon's cold light lying across the far grass
  c.fillStyle=lin(c,0,ey,0,GB+70,[[0,rgba('#04060a',.3)],[.45,rgba('#04060a',.5)],[1,rgba('#010203',.78)]]);c.fillRect(X0,ey,X1-X0,GB+130-ey);
  c.save();c.globalCompositeOperation='lighter';{const q=pp(MOON.x-40,GB,FAR-40);c.fillStyle=rad(c,q.x,q.y,10,480,[[0,rgba('#8ea0c8',.12)],[.5,rgba('#8ea0c8',.035)],[1,rgba('#8ea0c8',0)]]);c.fillRect(X0,ey,X1-X0,GB+130-ey);}
  // the landing lantern's warmth on the grass by the water
  {const q=pp(LAND.x-FAR*PSX,GB,FAR-14);c.save();c.translate(q.x,q.y);c.scale(1,.4);c.fillStyle=rad(c,0,0,2,90,[[0,rgba('#ffb866',.16)],[1,rgba('#ffb866',0)]]);c.beginPath();c.arc(0,0,90,0,TAU);c.fill();c.restore();}
  c.restore();c.restore();
  // ---- the grass itself: tufts in thousands, each a fan of blades, the tips that face the moon catching it; wildflowers; cow parsley by the water
  {const r2=rng(5),cols=['#070c09','#0f1710','#172018','#202a22','#34403a','#55625c'],paths=cols.map(()=>new Path2D());
    for(let i=0;i<2700;i++){const x=X0+r2()*(X1-X0),d=-72+r2()*(FAR+66),pd=pathDist(x,d);if(pd.dist<PATH.w/2-1.2)continue;
      const q=pp(x,GB,d),far=clamp(d/FAR,0,1),n=4+Math.floor(r2()*7),hh=(1.3+r2()*2.3)*(pd.dist<PATH.w/2+2.5?.55:1)*(d<-18?2:1);
      for(let k=0;k<n;k++){const a=(k/(n-1)-.5)*1.3+(r2()-.5)*.35,h=hh*(.6+.55*r2()),bx=q.x+(r2()-.5)*2.6,ex=bx+Math.sin(a)*h*.9,ey2=q.y-Math.cos(a)*h,v=r2();
        let ci=v<.3?1:v<.66?2:v<.88?3:v<.97?4:5;if(k===0&&r2()<.45)ci=0;if(ci>=4&&far<.35&&r2()<.55)ci=3;paths[ci].moveTo(bx,q.y);paths[ci].lineTo(ex,ey2);}}
    c.lineCap='round';cols.forEach((col,i)=>{c.strokeStyle=rgba(col,i>=5?.5:.92);c.lineWidth=i>=4?.42:.55;c.stroke(paths[i]);});
    for(let i=0;i<300;i++){const x=X0+r2()*(X1-X0),d=70+Math.pow(r2(),.6)*(FAR-72);if(pathDist(x,d).dist<PATH.w/2+2)continue;const q=pp(x,GB,d);c.fillStyle=rgba(r2()<.75?'#d8dce8':'#e8dca0',.18+.26*r2());c.fillRect(q.x,q.y-1.5-r2()*1.5,.85,.85);}
    for(let i=0;i<70;i++){const x=X0+r2()*(X1-X0),d=FAR-2-r2()*22;if(Math.abs(pp(x,GB,d).x-LAND.x)<26)continue;const q=pp(x,GB,d),h=6+r2()*9;c.strokeStyle=rgba('#141c14',.9);c.lineWidth=.5;c.beginPath();c.moveTo(q.x,q.y);c.lineTo(q.x+(r2()-.5)*2,q.y-h);c.stroke();
      if(r2()<.55){c.fillStyle=rgba('#e4e6ee',.36);for(let k=0;k<5;k++){c.beginPath();c.arc(q.x+(k-2)*1.1,q.y-h-.4+Math.abs(k-2)*.3,.6,0,TAU);c.fill();}}}}
  // ---- the near bank: a soft lip of mud and grass, the water lapping it
  {const rb=rng(52);c.fillStyle=lin(c,0,ey-6,0,ey+6,[[0,'#0a0d0b'],[.5,'#0c100d'],[1,rgba('#0c100d',0)]]);c.beginPath();c.moveTo(X0,ey+6);for(let x=X0;x<=X1;x+=5)c.lineTo(x,ey-1-(Math.sin(x*.045)*1.6+1.6)-rb()*2.6);c.lineTo(X1,ey+6);c.closePath();c.fill();
    c.strokeStyle=rgba('#c8d4ff',.14);c.lineWidth=.5;c.beginPath();for(let x=X0;x<X1;x+=4+rb()*10){const l=3+rb()*12;c.moveTo(x,ey-2.4-rb()*1.4);c.lineTo(x+l,ey-2.6-rb()*1.4);}c.stroke();}
  // ---- reeds along the near bank in clumps, rimmed by the moon and the water
  {const r3=rng(31);c.lineCap='round';const clumps=[];for(let i=0;i<46;i++)clumps.push(X0+r3()*(X1-X0));for(let i=0;i<760;i++){const x=clumps[i%clumps.length]+(r3()-.5)*18;if(Math.abs(x-LAND.x)<16)continue;const y=ey+2+r3()*3-(r3()<.2?7:0),h=8+r3()*15,lean=(r3()-.4)*4.4;
    c.strokeStyle='#04060a';c.lineWidth=1;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+lean*.3,y-h*.6,x+lean,y-h);c.stroke();
    if(r3()<.55){c.strokeStyle=rgba('#c8d4ff',.3);c.lineWidth=.4;c.beginPath();c.moveTo(x+lean*.5-.3,y-h*.7);c.lineTo(x+lean-.3,y-h);c.stroke();}
    if(r3()<.08){c.fillStyle='#0a0705';c.beginPath();c.ellipse(x+lean,y-h-1.6,.9,2.2,lean*.08,0,TAU);c.fill();}}}
  // mist lying on the water and drifting into the low meadow
  haze(c,X0,X1,WAT0-12,ey-2,'#8a98bc',.14);haze(c,X0,X1,ey-2,ey+46,'#8a98bc',.13,true);
  // ---- the corners nearest us: long grass and dock leaves, dark, a few blades catching the moon
  {const rc=rng(77),G2=(x,d)=>pp(x,GB,d);c.lineCap='round';for(const [cx0,cx1] of [[-120,110],[760,1060]])for(let i=0;i<150;i++){const x=cx0+rc()*(cx1-cx0),edge=Math.min(1,Math.min(Math.abs(x-cx0),Math.abs(cx1-x))/60),d=-34+rc()*24,q=G2(x,d),h=(9+rc()*16)*(.45+.55*edge),lean=(rc()-.5)*7;
      c.strokeStyle=rc()<.8?'#05080a':'#0b120d';c.lineWidth=.8+rc()*.7;c.beginPath();c.moveTo(q.x,q.y);c.quadraticCurveTo(q.x+lean*.3,q.y-h*.6,q.x+lean,q.y-h);c.stroke();
      if(rc()<.25){c.strokeStyle=rgba('#c8d4ff',.18);c.lineWidth=.35;c.beginPath();c.moveTo(q.x+lean*.6,q.y-h*.75);c.lineTo(q.x+lean,q.y-h);c.stroke();}
      if(rc()<.05){c.fillStyle='#070b08';c.save();c.translate(q.x,q.y-2);c.rotate((rc()-.5)*1.4);c.beginPath();c.ellipse(0,-6,2.6,7,0,0,TAU);c.fill();c.strokeStyle=rgba('#c8d4ff',.12);c.lineWidth=.4;c.beginPath();c.moveTo(0,0);c.lineTo(0,-12);c.stroke();c.restore();}}}
  // the dark toward us
  c.fillStyle=lin(c,0,GB-10,0,GB+110,[[0,rgba('#000000',0)],[1,rgba('#000000',.55)]]);c.fillRect(X0,GB-10,X1-X0,120);}
// ---------- what moves: fireflies over the grass, the moon's track glinting ----------
const FLIES=(()=>{const r=rng(91),a=[];for(let i=0;i<34;i++)a.push({x:-40+r()*980,d:120+r()*150,h:4+r()*18,ph:r()*TAU,sp:.6+r()*1.2,dr:6+r()*14,bl:2+r()*3});return a;})();
function live(){const t=S.t;ctx.save();
  for(const f of FLIES){const x=f.x+Math.sin(t*f.sp*.4+f.ph)*f.dr,d=f.d+Math.cos(t*f.sp*.3+f.ph*1.7)*f.dr*.5,q=pp(x,GB,d),y=q.y-f.h-Math.sin(t*f.sp+f.ph)*3,b=Math.pow(Math.max(0,Math.sin(t*f.bl+f.ph)),3);
    if(b<.02)continue;glow(ctx,q.x,y,7,'#c8ff7a',.55*b);ctx.fillStyle=rgba('#f0ffd0',.9*b);ctx.fillRect(q.x-.5,y-.5,1,1);}
  const ey=EY();for(let i=0;i<5;i++){const ph=(t*.9+i*.37)%1,y=lerp(WAT0+2,ey-2,(i*.23+.1)%1),a=Math.sin(ph*Math.PI);ctx.fillStyle=rgba('#f4f6ff',.35*a);ctx.fillRect(MOON.x-4+Math.sin(t*3+i*2)*5,y,6+i%3*2,.7);}
  ctx.restore();}
// the light that rims a fighter: the moon
function light(f){return{light:{x:MOON.x-f.dep*PSX,y:MOON.y+f.dep*PSY}};}
E.S.field={paint,live,light,div:it=>it.dv.mat==='plank'&&typeof EnvProps!=='undefined'?EnvProps.plankFence(it,'rustic'):false,table:()=>typeof EnvProps!=='undefined'?EnvProps.fieldTable('rustic'):false};
})();
// ===== ENV FIELD END =====
