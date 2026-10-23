// ===== ENV HILL =====
// Hillside, proposed as the old elven cemetery on the hill above the city. The slope the fight stands on is turf over the hill, a gravel
// path climbing it; along its far side the old stones stand and lean, slim elven stelae carved with the vine, lichen on them, and on a
// few of them a small lamp burns with elven light, cold and cyan. The hill goes on rising to the right to a crest of cypresses and a
// small tomb-house with a lantern at its door; to the left it falls away over its brow, and far below lies the city at night, the
// river through it and the Hallowell tower standing out of it with its ring of cyan light. The moon is over the crest.
(()=>{const E=EnvLook,{C,poly,line,lin,rad,rgba,mix,glow,haze,vine,stars,moon,hallTower,wetStreak,rng,lerp,clamp,TAU}=E;
const FAR=278,SL=.085,G0=()=>GB+18;
const gy=(x,d)=>G0()-SL*x-d*PSY;                      // the screen height of the ground at world x, depth d
const gp=(x,d)=>({x:x+d*PSX,y:gy(x,d)});              // a point on the ground
const MOON={x:880,y:62,r:13},TOWER={x:250,base:262,top:78,w:22},HOR=196;
// the far edge of the slope at a screen x, and the line of the hill beyond it (the brow on the left, the crest on the right)
const edgeY=sx=>gy(sx-FAR*PSX,FAR);
const crestY=sx=>edgeY(sx)-4-Math.max(0,sx-300)*.12;
function patAt(c,cv,x,y,u,rot){const p=c.createPattern(cv,'repeat');if(p.setTransform){let m=new DOMMatrix().translate(x,y);if(rot)m=m.rotate(rot);p.setTransform(m.scale(u));}return p;}
const stoneTex=seed=>OutTex.lichenStone(seed,192,192,{base:'#7e786c',dark:'#2e2c28',l1:'#a8823e',l2:'#7e9070'});
// ---------- the city far below, past the brow ----------
function cityBelow(c,X0,X1){const r=rng(61),nz=EnvTex.noise2(5,16),dist=(x,y)=>EnvTex.fbm(nz,(x+200)*.012,y*.05,3);
  // the plain beyond the city and the far hills on the horizon
  c.fillStyle=lin(c,0,HOR-10,0,HOR+70,[[0,'#151629'],[1,'#1a1928']]);c.fillRect(X0,HOR,X1-X0,150);
  c.fillStyle='#0d0e1a';c.beginPath();c.moveTo(X0,HOR+2);for(let x=X0;x<=X1;x+=20)c.lineTo(x,HOR-3-Math.sin(x*.013)*3-Math.sin(x*.041+1)*1.6);c.lineTo(X1,HOR+4);c.closePath();c.fill();
  // the river's course through the city, from the foot of the hill back to the horizon
  const riv=t=>({x:lerp(-150,600,t)+Math.sin(t*5.2)*60*(1-t),y:lerp(300,HOR+5,Math.pow(t,.62))}),onRiver=(x,y)=>{for(let k=0;k<=40;k++){const q=riv(k/40);if(Math.abs(q.y-y)<3+(1-k/40)*5&&Math.abs(q.x-x)<10+(1-k/40)*14)return true;}return false;};
  // roofs seen from above in rows that grow larger toward us; dense districts bright, parks dark, lamps strung along the streets
  for(let row=0;row<22;row++){const t=row/21,y=lerp(HOR+3,302,Math.pow(t,1.45)),s=lerp(.32,1.6,t),hz=1-t;
    for(let x=X0+r()*20*s;x<660;x+=(9+r()*15)*s){const dn=dist(x,y);if(onRiver(x,y))continue;const w=(6+r()*12)*s,h=(3+r()*6)*s;
      if(dn<.38){c.fillStyle=rgba('#0b0f0d',.55);c.fillRect(x,y-h*.5,w,h*.6);if(r()<.25){c.fillStyle=rgba('#ffd9a0',.35*(1-.45*hz));c.fillRect(x+r()*w,y-.5,.6*s,.6*s);}continue;}
      c.fillStyle=mix('#141522','#22202e',r()*.6+hz*.3);c.fillRect(x,y-h,w,h+1);c.fillStyle=rgba('#2e2c3c',.6);c.fillRect(x,y-h,w,.5*s);
      const n=dn>.6?3:1;for(let k=0;k<n;k++)if(r()<.65){c.fillStyle=rgba(r()<.86?'#ffcf86':'#dfeeff',(.3+.6*r())*(1-.45*hz));c.fillRect(x+r()*w,y-h*r(),.7*s+.3,.7*s+.3);}}
    c.fillStyle=rgba('#ffc477',.6-.32*hz);for(let x=X0+r()*8;x<660;x+=(4+r()*5)*s){if(dist(x,y)<.4||onRiver(x,y))continue;c.fillRect(x,y+.6*s,.6+.35*s,.6+.35*s);}}
  // the avenues running back into the city, their lamps converging
  for(const [x0,x1] of [[-120,170],[110,262],[350,300],[560,372]]){for(let i=0;i<46;i++){const t=i/46,x=lerp(x0,x1,t),y=lerp(302,HOR+4,Math.pow(t,.8));c.fillStyle=rgba('#ffd9a0',.75-.45*t);c.fillRect(x,y,1.2-.7*t,1.2-.7*t);}}
  // the river: dark water between lamplit embankments, the lights broken on it
  {c.lineCap='round';for(const [lw,col] of [[13,'#0c0e18'],[9,'#1c1d30'],[4,'#2a2840']]){c.strokeStyle=col;c.lineWidth=lw;c.beginPath();for(let k=0;k<=60;k++){const q=riv(k/60),ww=1-k/60*.75;k?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y);}c.lineWidth=lw;c.stroke();}
    for(let k=0;k<=80;k++){const t=k/80,q=riv(t),sc=1-t*.75;for(const sd of [-1,1]){c.fillStyle=rgba('#ffd9a0',.5-.25*t);c.fillRect(q.x+sd*6*sc,q.y-sd*1.2*sc,1.1*sc,1.1*sc);}
      if(r()<.6){c.fillStyle=rgba(r()<.85?'#ffc477':'#7ff3e3',.35*sc+.1);c.fillRect(q.x-3*sc+r()*6*sc,q.y-1+r()*2,(1.5+r()*3)*sc,.5);}}}
  // the haze of distance over the far city, and its glow in the air
  haze(c,X0,X1,HOR-34,HOR-2,'#3a2a36',.5);haze(c,X0,X1,HOR-2,HOR+48,'#3a2a36',.5,true);
  c.save();c.globalCompositeOperation='lighter';c.translate(260,248);c.scale(1,.45);c.fillStyle=rad(c,0,0,10,460,[[0,rgba('#ff9a5a',.24)],[.4,rgba('#ff8a50',.07)],[1,rgba('#ff8a50',0)]]);c.beginPath();c.arc(0,0,460,0,TAU);c.fill();c.restore();
  hallTower(c,TOWER.x,TOWER.base,TOWER.top,TOWER.w,{lit:.95});
  glow(c,TOWER.x,TOWER.base-10,90,'#ff9a5a',.12,.6);}
// ---------- the cemetery's furniture ----------
// a cypress: a tall dark flame, its foliage in tufts, rimmed on the side toward the moon
function cypress(c,x,base,h,w,seed){const r=rng(seed),L=[],R=[],n=28;
  for(let i=0;i<=n;i++){const t=i/n,ww=w*Math.pow(Math.sin(Math.PI*Math.min(1,t*1.15+.05)),.7)*(1-.55*t)*(.8+.4*r());L.push([x-ww/2,base-h*t]);R.push([x+ww/2,base-h*t]);}
  const p=new Path2D();p.moveTo(x-1.5,base);for(const [a,b] of L)p.lineTo(a,b);p.lineTo(x,base-h-4);for(let i=R.length-1;i>=0;i--)p.lineTo(R[i][0],R[i][1]);p.lineTo(x+1.5,base);p.closePath();
  const side=x<MOON.x?1:-1;c.fillStyle=rgba('#c8d4ff',.32);c.fill(p);c.save();c.translate(-side*1,1);c.fillStyle='#05080a';c.fill(p);c.restore();
  // tufts: darker hollows and a few leaves catching the moon on its lit side
  for(let i=0;i<70;i++){const t=r(),yy=base-h*t*.95,ww=w*Math.sin(Math.PI*Math.min(1,t*1.15+.05))*(1-.55*t)*.45,xx=x+(r()-.5)*2*ww;c.fillStyle=r()<.7?rgba('#000000',.45):rgba('#7a8aa8',.2*(side*(xx-x)>0?1:.3));c.beginPath();c.ellipse(xx,yy,1.3+r(),.9,0,0,TAU);c.fill();}}
// an elven stela: slim, pointed, the vine carved up its face, lichen on it; it may lean and it may be broken
function stela(c,sx,sy,o){const h=o.h,w=o.w,tilt=o.tilt||0,r=rng(o.seed),dark=o.dark==null?.55:o.dark,k=o.kind||'stela';c.save();c.translate(sx,sy);c.rotate(tilt);
  const p=new Path2D();
  if(k==='obelisk'){p.moveTo(-w/2-2,1);p.lineTo(-w/2-2,-4);p.lineTo(-w/2,-4);p.lineTo(-w*.32,-h*.9);p.lineTo(0,-h);p.lineTo(w*.32,-h*.9);p.lineTo(w/2,-4);p.lineTo(w/2+2,-4);p.lineTo(w/2+2,1);p.closePath();}
  else if(k==='round'){p.moveTo(-w/2,1);p.lineTo(-w/2,-h+w/2);p.arc(0,-h+w/2,w/2,Math.PI,0);p.lineTo(w/2,1);p.closePath();}
  else{p.moveTo(-w/2,1);p.lineTo(-w/2,-h*.78);if(o.broken){p.lineTo(-w*.2,-h*.62);p.lineTo(0,-h*.7);p.lineTo(w*.25,-h*.58);p.lineTo(w/2,-h*.66);}else{p.quadraticCurveTo(-w/2,-h*.94,0,-h);p.quadraticCurveTo(w/2,-h*.94,w/2,-h*.78);}p.lineTo(w/2,1);p.closePath();}
  c.fillStyle=patAt(c,stoneTex(o.seed%7+40),-w/2,-h,.22);c.fill(p);c.fillStyle=rgba('#05060c',dark);c.fill(p);
  // the face toward the moon lit along its edge, the other side in shadow
  c.save();c.clip(p);c.fillStyle=lin(c,-w/2,0,w/2,0,[[0,rgba('#000000',.35)],[.6,rgba('#000000',0)],[1,rgba('#c8d4ff',.16)]]);c.fillRect(-w/2,-h,w,h+2);
  // the carving: a sunk panel, the vine climbing it, gold still in the cuts
  if(!o.plain){c.strokeStyle=rgba('#000000',.45);c.lineWidth=.6;c.strokeRect(-w/2+1.6,-h*.72,w-3.2,h*.62);vine(c,[{x:0,y:-h*.14},{x:0,y:-h*.68}],{w:.45,amp:1,wave:7,leaf:1.3,every:2,seed:o.seed,col:rgba(C.gold,.6),shadow:false});}
  c.restore();c.strokeStyle=rgba('#c8d4ff',.25);c.lineWidth=.6;c.beginPath();c.moveTo(w/2-.3,1);c.lineTo(w/2-.3,-h*.78);c.stroke();
  c.restore();
  // its foot in the grass
  c.strokeStyle='#0a100c';c.lineWidth=.7;c.beginPath();for(let i=0;i<9;i++){const gx=sx+(r()-.5)*(w+6),gh=2+r()*3;c.moveTo(gx,sy+1);c.lineTo(gx+(r()-.5)*1.5,sy+1-gh);}c.stroke();}
// a little lamp of elven light on a grave: a stone housing, the cold flame inside
function graveLamp(c,sx,sy){c.fillStyle='#2a2a2c';c.fillRect(sx-3,sy-5,6,5);c.fillStyle='#1c1c20';c.beginPath();c.moveTo(sx-3.6,sy-11);c.lineTo(sx,sy-14);c.lineTo(sx+3.6,sy-11);c.closePath();c.fill();
  c.fillStyle=rgba(C.cyanL,.95);c.fillRect(sx-1.4,sy-10.6,2.8,5);glow(c,sx,sy-8,26,C.cyan,.45);glow(c,sx,sy-8,7,C.cyanL,.7);
  c.fillStyle=rgba(C.gold,.6);c.fillRect(sx-3.6,sy-11.2,7.2,.5);}
// the tomb-house on the crest: lichened stone, a steep roof, a pointed door with the vine round it, a lantern beside it
function tombHouse(c,x,base){const w=46,h=34,rh=26,r=rng(5),T=stoneTex(44);
  // steps up to it
  for(let i=0;i<3;i++){c.fillStyle=patAt(c,T,x-w/2,base,.22);c.fillRect(x-w/2-6+i*2,base-i*2.4,w+12-i*4,2.6);c.fillStyle=rgba('#05060c',.55-i*.05);c.fillRect(x-w/2-6+i*2,base-i*2.4,w+12-i*4,2.6);c.fillStyle=rgba('#c8d4ff',.18);c.fillRect(x-w/2-6+i*2,base-i*2.4,w+12-i*4,.5);}
  const b=base-7;c.fillStyle=patAt(c,T,x-w/2,b-h,.22);c.fillRect(x-w/2,b-h,w,h);c.fillStyle=lin(c,x-w/2,0,x+w/2,0,[[0,rgba('#05060c',.7)],[1,rgba('#05060c',.42)]]);c.fillRect(x-w/2,b-h,w,h);
  c.strokeStyle=rgba('#000000',.35);c.lineWidth=.45;c.beginPath();for(let y=b-h+5;y<b;y+=5){c.moveTo(x-w/2,y);c.lineTo(x+w/2,y);}c.stroke();
  // the roof, steep, slabs of stone, a finial
  c.fillStyle='#16161c';c.beginPath();c.moveTo(x-w/2-4,b-h);c.lineTo(x,b-h-rh);c.lineTo(x+w/2+4,b-h);c.closePath();c.fill();
  c.strokeStyle=rgba('#c8d4ff',.3);c.lineWidth=.7;c.beginPath();c.moveTo(x,b-h-rh);c.lineTo(x+w/2+4,b-h);c.stroke();
  c.fillStyle=C.gold;c.beginPath();c.moveTo(x-1.4,b-h-rh);c.lineTo(x,b-h-rh-8);c.lineTo(x+1.4,b-h-rh);c.fill();
  // the door: a pointed arch, dark, the gold vine round it
  const dw=14,dh=24,dx=x-dw/2,dy=b;c.fillStyle='#040406';c.beginPath();c.moveTo(dx,dy);c.lineTo(dx,dy-dh*.62);c.quadraticCurveTo(dx,dy-dh*.92,x,dy-dh);c.quadraticCurveTo(dx+dw,dy-dh*.92,dx+dw,dy-dh*.62);c.lineTo(dx+dw,dy);c.closePath();c.fill();
  vine(c,[{x:dx-2,y:dy},{x:dx-2,y:dy-dh*.6},{x:x,y:dy-dh-2.5},{x:dx+dw+2,y:dy-dh*.6},{x:dx+dw+2,y:dy}],{w:.5,amp:.8,wave:6,leaf:1.3,every:2,seed:3,col:C.gold});
  // the lantern by the door, warm
  const lx=x+w/2-6,ly=b-22;c.fillStyle='#0a0a0c';c.fillRect(lx-.6,ly-6,1.2,6);c.fillStyle=lin(c,0,ly,0,ly+7,[[0,'#fff3d2'],[1,'#ffb259']]);c.fillRect(lx-2,ly,4,6);c.fillStyle='#0a0a0c';c.fillRect(lx-2.6,ly-.6,5.2,1);c.fillRect(lx-2.6,ly+6,5.2,1);
  glow(c,lx,ly+3,46,'#ffc070',.5);glow(c,lx,ly+3,9,'#fff0d0',.7);
  return{lx,ly};}
// ---------- the scene ----------
function paint(c){
  const X0=-160,X1=W+240,T0=-110,r=rng(29);
  // ---- the sky: cold toward the moon over the crest, the city's warmth low on the left
  c.fillStyle=lin(c,0,T0,0,320,[[0,'#020309'],[.3,'#070a17'],[.62,'#10142a'],[.85,'#1d1b2e'],[1,'#2a2232']]);c.fillRect(X0,T0,X1-X0,430);
  glow(c,MOON.x,MOON.y,320,'#7c8ed0',.1);
  c.save();c.globalCompositeOperation='lighter';c.translate(230,250);c.scale(1,.7);c.fillStyle=rad(c,0,0,10,520,[[0,rgba('#ff9a5a',.22)],[.4,rgba('#ff8a50',.07)],[1,rgba('#ff8a50',0)]]);c.beginPath();c.arc(0,0,520,0,TAU);c.fill();c.restore();
  stars(c,X0,X1,T0,190,230,23,.75);
  for(let i=0;i<7;i++){const cx=X0+r()*(X1-X0),cy=40+r()*100,rx=60+r()*150,ry=2+r()*4.5,k=clamp(1-Math.hypot(cx-MOON.x,cy-MOON.y)/280,0,1);
    c.save();c.translate(cx,cy);c.scale(1,ry/rx);c.fillStyle=rad(c,0,-ry*2,0,rx,[[0,rgba('#d8e0ff',.3*k)],[1,rgba('#d8e0ff',0)]]);c.beginPath();c.arc(0,-ry*1.2,rx,0,TAU);c.fill();
    c.fillStyle=rad(c,0,0,0,rx,[[0,rgba('#141828',.85)],[.7,rgba('#141828',.5)],[1,rgba('#141828',0)]]);c.beginPath();c.arc(0,0,rx,0,TAU);c.fill();c.restore();}
  moon(c,MOON.x,MOON.y,MOON.r,{});
  // ---- the city below, past the brow of the hill
  cityBelow(c,X0,X1);
  // ---- the hill beyond the slope: the brow on the left, rising to the crest on the right, turf and the cemetery on it
  const hill=new Path2D();hill.moveTo(X0,crestY(X0));for(let x=X0;x<=X1;x+=8)hill.lineTo(x,crestY(x)-Math.sin(x*.06)*1.2-(x>300?Math.sin(x*.021)*3:0));hill.lineTo(X1,520);hill.lineTo(X0,520);hill.closePath();
  c.fillStyle=lin(c,0,120,0,300,[[0,'#0c120e'],[1,'#121a14']]);c.fill(hill);
  c.save();c.clip(hill);c.globalCompositeOperation='lighter';c.fillStyle=rad(c,MOON.x-60,MOON.y+120,10,420,[[0,rgba('#8ea0c8',.12)],[1,rgba('#8ea0c8',0)]]);c.fillRect(200,0,X1,400);c.restore();
  c.strokeStyle=rgba('#c8d4ff',.2);c.lineWidth=.7;c.stroke(hill);
  // cypresses on the crest and down its shoulder, a few in front of the city
  const cyp=[[548,84,15],[596,126,19],[636,104,16],[676,70,13],[936,136,21],[978,110,17],[1030,150,22],[1084,118,18],[1126,96,15],[132,64,12],[-60,74,14]];
  for(const [x,h,w] of cyp.slice(0,4))cypress(c,x,crestY(x)+6,h,w,x*3+1);
  // the tomb-house on the crest, an iron railing along the graves with gold finials
  const TH=tombHouse(c,800,crestY(800)+10);
  for(const [x,h,w] of cyp.slice(4))cypress(c,x,crestY(x)+6,h,w,x*3+1);
  {const y0=sx=>crestY(sx)+22;c.strokeStyle='#08090c';c.lineWidth=.8;c.beginPath();for(let x=440;x<=760;x+=4){c.moveTo(x,y0(x));c.lineTo(x,y0(x)-11);}c.stroke();
    c.lineWidth=1;c.beginPath();for(const k of [0,9]){for(let x=440;x<=760;x+=6){const y=y0(x)-k;x===440?c.moveTo(x,y):c.lineTo(x,y);}}c.stroke();
    c.fillStyle=rgba(C.gold,.75);for(let x=440;x<=760;x+=12){const y=y0(x)-11;c.beginPath();c.moveTo(x-1,y);c.lineTo(x,y-2.6);c.lineTo(x+1,y);c.fill();}}
  // old stones up on the hill behind the railing, small with distance
  for(let i=0;i<26;i++){const x=470+r()*640,y=crestY(x)+14+r()*36;if(Math.abs(x-800)<38&&y<crestY(800)+12)continue;stela(c,x,y,{h:7+r()*7,w:2.6+r()*2,tilt:(r()-.5)*.25,seed:900+i,plain:true,dark:.6});}
  // ---- the slope the fight stands on: turf in the tilted ground plane
  const sv=[gp(X0,FAR),gp(X1,FAR),gp(X1,-110),gp(X0,-110)];
  c.save();poly(c,sv);c.clip();c.save();c.transform(1,-SL,PSX,-PSY,0,G0());c.fillStyle=patAt(c,OutTex.meadow(11,{g0:'#0f1813',g1:'#1b261c',dry:'#2a2a1e',earth:'#1e1812'}),0,0,1/3);c.fillRect(X0-60,-120,X1-X0+120,FAR+130);
  // the gravel path climbing the hill, its edges set with old kerb stones
  {const d0=84,d1=106,rr=rng(8);c.beginPath();for(let x=X0;x<=X1;x+=6)c.lineTo(x,d1+Math.sin(x*.05)*1.2+rr()*.8);for(let x=X1;x>=X0;x-=6)c.lineTo(x,d0+Math.sin(x*.043+2)*1.2-rr()*.8);c.closePath();
    c.fillStyle=patAt(c,OutTex.pathEarth(17,{e0:'#2a2620',e1:'#3e3a32',stone:'#7a766a'}),0,0,1/4);c.fill();c.fillStyle=rgba('#000000',.12);c.fill();
    for(const d of [d0,d1]){for(let x=X0;x<X1;x+=9+rr()*4){c.fillStyle=rgba('#4e4a44',.8);c.fillRect(x,d-1,7+rr()*2,2);c.fillStyle=rgba('#c8d4ff',.08);c.fillRect(x,d+.6,7,.5);}}}
  // flat ledger stones sunk in the turf at the back, mossed at the edges
  for(let i=0;i<9;i++){const x=-40+i*118+rng(i)()*40,d=196+rng(i+9)()*50,w=22,l=12;c.fillStyle=patAt(c,stoneTex(50+i),x,d,.22);c.fillRect(x,d,w,l);c.fillStyle=rgba('#05060c',.5);c.fillRect(x,d,w,l);
    c.strokeStyle=rgba('#0e140e',.8);c.lineWidth=1;c.strokeRect(x,d,w,l);}
  c.restore();
  // the night over the slope: darker toward us, the moon's light lying across the upper ground
  c.fillStyle=lin(c,0,200,0,GB+60,[[0,rgba('#04060a',.28)],[.5,rgba('#04060a',.5)],[1,rgba('#010203',.78)]]);c.fillRect(X0,150,X1-X0,GB+130-150);
  c.globalCompositeOperation='lighter';{const q=gp(MOON.x-60,FAR-40);c.fillStyle=rad(c,q.x,q.y,10,520,[[0,rgba('#8ea0c8',.12)],[.5,rgba('#8ea0c8',.04)],[1,rgba('#8ea0c8',0)]]);c.fillRect(X0,150,X1-X0,GB+130-150);}
  c.restore();
  // ---- the turf: tufts of grass, the tips toward the moon catching it, clover and daisies, longer grass round the stones
  {const r2=rng(5),cols=['#070c09','#0f1710','#172018','#202a22','#34403a','#55625c'],paths=cols.map(()=>new Path2D());
    for(let i=0;i<2800;i++){const x=X0+r2()*(X1-X0),d=-72+r2()*(FAR+66);if(d>86&&d<104&&r2()<.94)continue;
      const q=gp(x,d),far=clamp(d/FAR,0,1),n=4+Math.floor(r2()*7),hh=(1.3+r2()*2.3)*(d>80&&d<110?.5:1)*(d<-18?2:1)*(d>180?1.4:1);
      for(let k=0;k<n;k++){const a=(k/(n-1)-.5)*1.3+(r2()-.5)*.35,h=hh*(.6+.55*r2()),bx=q.x+(r2()-.5)*2.6,ex=bx+Math.sin(a)*h*.9,ey=q.y-Math.cos(a)*h,v=r2();
        let ci=v<.3?1:v<.66?2:v<.88?3:v<.97?4:5;if(k===0&&r2()<.45)ci=0;if(ci>=4&&far<.35&&r2()<.55)ci=3;paths[ci].moveTo(bx,q.y);paths[ci].lineTo(ex,ey);}}
    c.lineCap='round';cols.forEach((col,i)=>{c.strokeStyle=rgba(col,i>=5?.5:.92);c.lineWidth=i>=4?.42:.55;c.stroke(paths[i]);});
    for(let i=0;i<260;i++){const x=X0+r2()*(X1-X0),d=40+Math.pow(r2(),.6)*(FAR-42);if(d>84&&d<108)continue;const q=gp(x,d);c.fillStyle=rgba(r2()<.8?'#dfe2ea':'#e8dca0',.18+.24*r2());c.fillRect(q.x,q.y-1.4-r2()*1.4,.85,.85);}}
  // ---- the old stones along the far side of the slope: slim stelae, some leaning, one broken; lamps of elven light on three
  const STONES=[[-90,236,30,9],[-30,262,26,8],[40,218,34,10],[118,250,24,8],[176,226,38,11],[262,244,28,9],[330,212,32,10],[402,258,22,8],[468,230,36,10],[548,248,26,9],[612,214,30,9],[690,236,34,10],[770,256,24,8],[842,222,32,10],[918,246,28,9],[990,228,30,9]];
  const lamps=[],KIND={3:'round',5:'obelisk',8:'round',11:'round',12:'obelisk',15:'round'};STONES.sort((a,b)=>b[1]-a[1]).forEach(([x,d,h,w],i)=>{const q=gp(x,d),rr=rng(x*7+d),kind=KIND[i]||'stela';stela(c,q.x,q.y,{h:kind==='obelisk'?h*1.5:kind==='round'?h*.75:h,w:kind==='round'?w*1.25:w,tilt:kind==='obelisk'?0:(rr()-.5)*.22,seed:300+i,broken:i===6,kind});if([2,9,13].includes(i)){lamps.push({x:q.x+w/2+5,y:q.y});graveLamp(c,q.x+w/2+5,q.y);}});
  // the cold light of the elven lamps on the turf about them
  c.save();c.globalCompositeOperation='lighter';for(const L of lamps){c.save();c.translate(L.x,L.y);c.scale(1,.36);c.fillStyle=rad(c,0,0,1,60,[[0,rgba(C.cyan,.16)],[1,rgba(C.cyan,0)]]);c.beginPath();c.arc(0,0,60,0,TAU);c.fill();c.restore();}c.restore();
  // mist in the hollows of the hill and over the brow, moonlit
  haze(c,X0,X1,150,210,'#8a98bc',.08);haze(c,X0,X1,210,310,'#8a98bc',.08,true);
  c.save();c.globalAlpha=.1;for(let i=0;i<10;i++){const x=X0+r()*(X1-X0),y=crestY(x)+20+r()*50;c.fillStyle=rad(c,x,y,0,90,[[0,'#9aa8c8'],[1,rgba('#9aa8c8',0)]]);c.save();c.translate(x,y);c.scale(1,.18);c.beginPath();c.arc(0,0,90,0,TAU);c.fill();c.restore();}c.restore();
  // ---- the corners nearest us: long grass and dock leaves, dark, a few blades catching the moon
  {const rc=rng(77),G2=gp;c.lineCap='round';for(const [cx0,cx1] of [[-120,110],[760,1060]])for(let i=0;i<150;i++){const x=cx0+rc()*(cx1-cx0),edge=Math.min(1,Math.min(Math.abs(x-cx0),Math.abs(cx1-x))/60),d=-34+rc()*24,q=G2(x,d),h=(9+rc()*16)*(.45+.55*edge),lean=(rc()-.5)*7;
      c.strokeStyle=rc()<.8?'#05080a':'#0b120d';c.lineWidth=.8+rc()*.7;c.beginPath();c.moveTo(q.x,q.y);c.quadraticCurveTo(q.x+lean*.3,q.y-h*.6,q.x+lean,q.y-h);c.stroke();
      if(rc()<.25){c.strokeStyle=rgba('#c8d4ff',.18);c.lineWidth=.35;c.beginPath();c.moveTo(q.x+lean*.6,q.y-h*.75);c.lineTo(q.x+lean,q.y-h);c.stroke();}
      if(rc()<.05){c.fillStyle='#070b08';c.save();c.translate(q.x,q.y-2);c.rotate((rc()-.5)*1.4);c.beginPath();c.ellipse(0,-6,2.6,7,0,0,TAU);c.fill();c.strokeStyle=rgba('#c8d4ff',.12);c.lineWidth=.4;c.beginPath();c.moveTo(0,0);c.lineTo(0,-12);c.stroke();c.restore();}}}
  // the dark toward us
  c.fillStyle=lin(c,0,GB-20,0,GB+110,[[0,rgba('#000000',0)],[1,rgba('#000000',.55)]]);c.fillRect(X0,GB-20,X1-X0,140);
  HILL.lamps=lamps;HILL.door=TH;}
const HILL={lamps:[],door:null};
// ---------- what moves: the elven lamps breathe, the tomb's lantern flickers, mist drifts low over the slope ----------
function live(){const t=S.t;ctx.save();
  for(const [i,L] of HILL.lamps.entries()){const k=.75+.25*Math.sin(t*2.1+i*1.7)*Math.sin(t*.7+i);glow(ctx,L.x,L.y-8,14,C.cyan,.25*k);}
  if(HILL.door){const k=.9+.1*Math.sin(t*9)*Math.sin(t*3.7);glow(ctx,HILL.door.lx,HILL.door.ly+3,18,'#ffb866',.25*k);}
  ctx.globalAlpha=.06;for(let i=0;i<5;i++){const x=((t*6+i*230)%1300)-200,q=gp(x,150+i*22);ctx.fillStyle=rad(ctx,q.x,q.y,0,120,[[0,'#a8b4d0'],[1,rgba('#a8b4d0',0)]]);ctx.save();ctx.translate(q.x,q.y);ctx.scale(1,.16);ctx.beginPath();ctx.arc(0,0,120,0,TAU);ctx.fill();ctx.restore();}
  ctx.restore();}
// the light that rims a fighter: the moon over the crest
function light(f){return{light:{x:MOON.x-f.dep*PSX,y:MOON.y+f.dep*PSY}};}
E.S.hill={paint,live,light,div:it=>it.dv.mat==='plank'&&typeof EnvProps!=='undefined'?EnvProps.plankFence(it,'rustic'):false,table:()=>typeof EnvProps!=='undefined'?EnvProps.fieldTable('rustic'):false};
})();
// ===== ENV HILL END =====
