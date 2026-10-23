// ===== ENV TUNNEL =====
// The line: the open flatcar of Hallowell's train, running at speed down the old tunnel under the city. The fight stands on the car's
// deck, riveted iron plate with a tread worked into it, which does not move; everything else goes by. The tunnel's wall rushes past
// in sooted brick ribbed with rings of blue engineering brick that turn over into the dark of the vault, cables slung along it, caged
// crystal lamps that flash by and throw their light across the deck as they pass (a few of them dead), arched refuges, the mouths of
// side passages with eyes in them now and then, a gilt mile plate, and once in a long while the lit platform of Lamplight Street's
// old station, long shut, going by. At speed the wall smears along the line. The car carries a brass lantern on its far rail; the
// engine's breath and the tunnel's dust stream back over the deck; under the car's near side its wheels turn and throw sparks.
// Layout, world units: the deck from depth 0 (its near edge) to 186 (its far edge, with a low rail along it), the track bed 40 below
// the deck, the tunnel's wall at depth 250 standing 170 above the deck before its vault turns over. S.scroll (how far the train has
// come, world units) moves the tunnel; S.scrollV (its speed, about 900) sets the smear, the streaks and the sparks.
(()=>{const E=EnvLook,{C,pp,lin,rad,rgba,glow,gilt,rng,lerp,clamp,TAU}=E;
const DN=0,DF=186,WD=250,BED=40,SPR=170,SILL=18;
const PER=840,LAMP=420,PASS=2310,PLATE=1050;                  // the wall's repeat; how often lamps, side passages and mile plates come
const STN=12600,STN_AT=5200,STN_L=900,SD=330,PE=196;           // the old station: how often, where the first one is, its length, its back wall and platform edge depths
const q=(x,y,d)=>pp(x,y,d);
const yS=()=>GB-SPR-WD*PSY,yWB=()=>GB+BED-WD*PSY,yDF=()=>GB-DF*PSY;   // on the screen: the vault's spring, the wall's foot, the deck's far edge
const LANTERN={x:806,d:DF-4};                                          // the car's own lantern, on its far rail
const STN_LAMPS=[{x:180,lit:1},{x:360,lit:0},{x:540,lit:1},{x:720,lit:1}].map(L=>({...L,d:290,h:120}));
const frac=v=>v-Math.floor(v),hash=i=>frac(Math.abs(Math.sin(i*12.9898+.7)*43758.5453));
const bucket=k=>clamp(Math.round(k*20)/20,1,2.5);   // made at the screen's own scale, so a smeared picture can be set down unfiltered
function mk(w,h,sc){const cv=document.createElement('canvas');cv.width=Math.ceil(w*sc);cv.height=Math.ceil(h*sc);return cv;}
function patAt(c,cv,x,y,u){const p=c.createPattern(cv,'repeat');if(p.setTransform)p.setTransform(new DOMMatrix().translate(x,y).scale(u));return p;}
function floorT(c,h){c.transform(1,0,PSX,-PSY,0,GB+(h||0));}
// a made picture smeared along the line, as the eye sees it at speed: copies laid a little further along each time, averaged
function smear(src,B,wrap){const cv=document.createElement('canvas');cv.width=src.width;cv.height=src.height;const c=cv.getContext('2d'),n=9,w=src.width;
  for(let i=0;i<n;i++){const o=Math.round(-B/2+B*i/(n-1));c.globalAlpha=1/(i+1);c.drawImage(src,o,0);if(wrap){c.drawImage(src,o-w,0);c.drawImage(src,o+w,0);}}
  return cv;}

// ---------- the deck ----------
// iron plate: a diamond tread, plates 60 by 49 with welded seams and rivets along them, rust in the corners, oil
let TREAD=null;
function tread(){if(TREAD)return TREAD;const cv=mk(60,49,6),c=cv.getContext('2d'),w=60,h=49,r=rng(9);c.scale(6,6);
  c.fillStyle='#17171d';c.fillRect(0,0,w,h);
  for(let y=1.5;y<h;y+=3.2)for(let x=(Math.round(y/3.2)%2)*2.2+.6;x<w;x+=4.4){c.save();c.translate(x,y);c.rotate(.6);c.fillStyle=rgba(r()<.5?'#2e2e38':'#272731',.95);c.fillRect(-1.4,-.35,2.8,.7);
    c.fillStyle=rgba('#000000',.4);c.fillRect(-1.1,.35,2.8,.4);c.restore();}
  c.fillStyle='#08080b';c.fillRect(0,0,w,.8);c.fillRect(0,0,.8,h);c.fillStyle=rgba('#6a6a7a',.28);c.fillRect(0,.8,w,.4);c.fillRect(.8,0,.4,h);
  c.fillStyle='#34343f';for(let x=3;x<w;x+=6){c.beginPath();c.arc(x,2.3,.55,0,TAU);c.fill();}for(let y=6;y<h;y+=6){c.beginPath();c.arc(2.3,y,.55,0,TAU);c.fill();}
  for(let k=0;k<5;k++){c.fillStyle=rgba(r()<.5?'#3a1e10':'#0a0806',.18+.2*r());c.beginPath();c.ellipse(r()*w,r()*h,2+r()*7,1+r()*3,r()*3,0,TAU);c.fill();}
  return TREAD=cv;}
function deck(c){const X0=-220,X1=1160;
  c.save();floorT(c,0);c.fillStyle=patAt(c,tread(),0,0,1/6);c.fillRect(X0,DN,X1-X0,DF-DN);
  // dark toward both edges, a worn lane down the middle where boots go
  c.fillStyle=lin(c,0,DN,0,DF,[[0,rgba('#030305',.5)],[.22,rgba('#050507',.3)],[.55,rgba('#06060a',.26)],[1,rgba('#030305',.6)]]);c.fillRect(X0,DN,X1-X0,DF-DN);
  c.fillStyle=rgba('#9aa4c0',.05);c.fillRect(X0,62,X1-X0,46);
  {const r=rng(29);for(let i=0;i<40;i++){const x=X0+r()*(X1-X0),d=DN+8+r()*(DF-DN-16);c.fillStyle=rgba(r()<.6?'#050406':'#2a1408',.14+.16*r());c.beginPath();c.ellipse(x,d,8+r()*40,3+r()*10,r()*.4,0,TAU);c.fill();}}
  // the iron angle along both edges, and the stake pockets in it
  c.fillStyle='#0a0a0e';c.fillRect(X0,DN,X1-X0,3);c.fillRect(X0,DF-3,X1-X0,3);c.fillStyle=rgba(C.gold,.42);c.fillRect(X0,DN+3,X1-X0,.8);c.fillRect(X0,DF-3.8,X1-X0,.8);
  for(const d of [DN+1.5,DF-1.5])for(let x=X0+20;x<X1;x+=64){c.fillStyle='#030304';c.fillRect(x-3,d-1.4,6,2.8);}
  c.restore();
  // the car's near side: its sole bar, riveted, stake pockets in it, the house's mark stencilled; under it the dark
  {const a=q(X0,GB,DN),b=q(X1,GB,DN);c.fillStyle=lin(c,0,a.y,0,a.y+SILL,[[0,'#1c1c24'],[.4,'#111117'],[1,'#07070a']]);c.fillRect(a.x,a.y,b.x-a.x,SILL);
    c.fillStyle=rgba('#6a6a7c',.5);for(let x=a.x+4;x<b.x;x+=9){c.fillRect(x,a.y+3,1.1,1.1);c.fillRect(x,a.y+SILL-4,1.1,1.1);}
    for(let x=a.x+20;x<b.x;x+=64){c.fillStyle='#040406';c.fillRect(x-4,a.y+5,8,9);c.fillStyle=rgba(C.gold,.3);c.fillRect(x-4,a.y+13.4,8,.8);}
    c.fillStyle=rgba(C.gold,.5);c.fillRect(a.x,a.y,b.x-a.x,.9);
    for(const x of [120,560]){const p=q(x,GB+9,DN);c.fillStyle=rgba(C.gold,.5);c.fillRect(p.x,p.y-4,1.4,8);c.fillRect(p.x+5,p.y-4,1.4,8);c.fillRect(p.x,p.y-.7,6.4,1.4);}
    c.fillStyle='#040405';c.fillRect(a.x,a.y+SILL,b.x-a.x,60);}}

// ---------- the tunnel's wall: one repeat of it, made once a scale, and its smear ----------
// sooted brick; rings of blue brick every 140 that turn over into the vault; a string course at the spring; arched refuges; cables in
// their brackets and junction boxes; the lamps' brackets and cages (their crystals are lit live, as they pass)
let WT=null;
function wallTile(k){const sc=bucket(k);if(WT&&WT.sc===sc)return WT;
  const bt=EnvTex.brick(13,{base:'#2e1a14',alt:'#1e100c',hot:'#3a2018',mortar:'#0a0706'});if(!bt||bt.width<16)return null;
  const y0=-12,y1=yWB()+2,h=y1-y0,sh=yS(),cv=mk(PER,h,sc),c=cv.getContext('2d'),r=rng(7),st=v=>(v-y0)/h;c.scale(sc,sc);c.translate(0,-y0);
  c.fillStyle=patAt(c,bt,0,0,1/6);c.fillRect(0,y0,PER,h);
  c.fillStyle=lin(c,0,y0,0,y1,[[0,rgba('#010102',1)],[st(sh-60),rgba('#020203',.92)],[st(sh),rgba('#040404',.72)],[st(sh+70),rgba('#060505',.58)],[.92,rgba('#060505',.6)],[1,rgba('#020202',.88)]]);c.fillRect(0,y0,PER,h);
  // seepage: lime run white from the joints, and wet black under it
  for(let i=0;i<16;i++){const x=r()*PER,w=1.5+r()*5,L=40+r()*160,pale=r()<.35,col=pale?'#9a9a88':'#000000';c.fillStyle=lin(c,0,sh+4,0,sh+4+L,[[0,rgba(col,pale?.09:.4)],[1,rgba(col,0)]]);c.fillRect(x,sh+4,w,L);}
  // the rings
  for(let x=40;x<PER;x+=140){c.fillStyle='#0f1218';c.beginPath();c.moveTo(x,y1);c.lineTo(x,sh);c.quadraticCurveTo(x,sh-70,x-26,y0);c.lineTo(x-14,y0);c.quadraticCurveTo(x+12,sh-70,x+12,sh);c.lineTo(x+12,y1);c.closePath();c.fill();
    c.fillStyle=rgba('#7a8aa8',.15);c.fillRect(x+11,sh,1.2,y1-sh);c.fillStyle=rgba('#000000',.55);c.fillRect(x-4,sh,4,y1-sh);
    c.strokeStyle=rgba('#000000',.5);c.lineWidth=.6;c.beginPath();for(let y=y1;y>sh;y-=5.2){c.moveTo(x,y);c.lineTo(x+12,y);}c.stroke();}
  c.fillStyle=lin(c,0,y0,0,sh,[[0,rgba('#010102',.96)],[.6,rgba('#010102',.5)],[1,rgba('#010102',0)]]);c.fillRect(0,y0,PER,sh-y0);
  // the string course at the spring of the vault
  c.fillStyle='#0d1016';c.fillRect(0,sh-3,PER,6);c.fillStyle=rgba('#8a94b0',.16);c.fillRect(0,sh-3,PER,.8);c.fillStyle=rgba('#000000',.5);c.fillRect(0,sh+3,PER,2);
  // arched refuges low in the wall
  for(const x of [96,516]){c.fillStyle='#030304';c.beginPath();c.moveTo(x,y1);c.lineTo(x,y1-40);c.arc(x+13,y1-40,13,Math.PI,0);c.lineTo(x+26,y1);c.closePath();c.fill();
    c.strokeStyle='#10131a';c.lineWidth=3;c.beginPath();c.moveTo(x-1.5,y1);c.lineTo(x-1.5,y1-40);c.arc(x+13,y1-40,14.5,Math.PI,0);c.lineTo(x+27.5,y1);c.stroke();
    c.strokeStyle=rgba('#8a94b0',.14);c.lineWidth=.6;c.beginPath();c.arc(x+13,y1-40,16,Math.PI,0);c.stroke();}
  // cables sagging between brackets on the rings, a junction box now and then
  for(let x=40;x<PER;x+=140){c.fillStyle='#16161a';c.fillRect(x+2,sh+48,8,26);c.fillStyle=rgba(C.goldD,.5);c.fillRect(x+2,sh+48,8,.8);}
  c.lineWidth=1.8;for(const [o,col] of [[56,'#07070a'],[62,'#0a0a0d'],[69,'#08080b']]){c.strokeStyle=col;c.beginPath();for(let x=46-140;x<PER+140;x+=140){c.moveTo(x,sh+o);c.quadraticCurveTo(x+70,sh+o+12,x+140,sh+o);}c.stroke();}
  c.strokeStyle=rgba('#8a94b0',.13);c.lineWidth=.5;c.beginPath();for(let x=46-140;x<PER+140;x+=140){c.moveTo(x,sh+55);c.quadraticCurveTo(x+70,sh+66,x+140,sh+55);}c.stroke();
  for(const x of [300,720]){c.fillStyle='#14141a';c.fillRect(x,sh+52,16,22);c.strokeStyle=rgba(C.gold,.4);c.lineWidth=.6;c.strokeRect(x+1,sh+53,14,20);c.fillStyle=rgba('#ffcf86',.5);c.fillRect(x+6,sh+57,4,1.2);}
  // the lamps: soot over each, a bracket, a brass cage with its crystal dark
  for(let x=LAMP/2;x<PER;x+=LAMP){const y=sh+28;c.fillStyle=rad(c,x,y-30,0,40,[[0,rgba('#000000',.5)],[1,rgba('#000000',0)]]);c.fillRect(x-40,y-70,80,80);
    c.strokeStyle='#0a0a0d';c.lineWidth=2.2;c.beginPath();c.moveTo(x-14,y-24);c.quadraticCurveTo(x-14,y-13,x,y-13);c.lineTo(x,y-9);c.stroke();
    c.fillStyle=C.goldD;c.fillRect(x-5,y-10,10,2.2);c.fillRect(x-4,y+9,8,2);c.strokeStyle=rgba(C.gold,.8);c.lineWidth=.7;c.beginPath();for(const kx of [-4.5,-1.5,1.5,4.5]){c.moveTo(x+kx,y-8);c.lineTo(x+kx*.8,y+9);}c.stroke();
    c.fillStyle='#14262a';c.beginPath();c.moveTo(x,y-6);c.lineTo(x+3.4,y);c.lineTo(x,y+6);c.lineTo(x-3.4,y);c.closePath();c.fill();}
  WT={sc,cv,blur:smear(cv,22*sc,true),y0,h};return WT;}
// the far rail along the deck's far edge: posts in their pockets and a top rail, the car's lantern on its hook (made once a scale)
let RT=null;
function railTile(k){const sc=bucket(k);if(RT&&RT.sc===sc)return RT;
  const x0=-240,x1=1180,a=q(0,GB,DF),y0=a.y-44,y1=a.y+3,cv=mk(x1-x0,y1-y0,sc),c=cv.getContext('2d');c.scale(sc,sc);c.translate(-x0,-y0);
  for(let x=-220;x<1160;x+=64){const p=q(x,GB,LANTERN.d);c.fillStyle='#0b0b10';c.fillRect(p.x-1.8,p.y-24,3.6,24);c.fillStyle=rgba(C.goldD,.85);c.fillRect(p.x-2.4,p.y-24.5,4.8,2.4);c.fillStyle=rgba('#8a94b0',.16);c.fillRect(p.x+1,p.y-22,.7,20);}
  const L=q(-220,GB,LANTERN.d),R=q(1160,GB,LANTERN.d);c.strokeStyle='#121218';c.lineWidth=2.2;c.beginPath();c.moveTo(L.x,L.y-22);c.lineTo(R.x,R.y-22);c.stroke();
  c.strokeStyle=rgba(C.gold,.5);c.lineWidth=.7;c.beginPath();c.moveTo(L.x,L.y-23.2);c.lineTo(R.x,R.y-23.2);c.stroke();
  {const p=q(LANTERN.x,GB,LANTERN.d);c.strokeStyle='#14141a';c.lineWidth=1.2;c.beginPath();c.moveTo(p.x,p.y-22);c.lineTo(p.x+4,p.y-31);c.stroke();
    c.fillStyle='#16120c';c.fillRect(p.x+1,p.y-41,8,10);c.fillStyle=C.goldD;c.fillRect(p.x,p.y-42,10,2);c.fillRect(p.x+2,p.y-31,6,1.4);c.fillStyle=rgba('#ffe7b0',.9);c.fillRect(p.x+3,p.y-39,4,6);}
  RT={sc,cv,x0,y0,w:x1-x0,h:y1-y0};return RT;}

// ---------- the old station at Lamplight Street, made once a scale, and its smear ----------
// in its own frame (its start at x 0): through the opening in the tunnel's wall a platform of stone flags, a back wall of cream tile
// over an oxblood dado under blind arches, the station's name on black enamel twice, torn posters, a stopped clock, benches, crystal
// lamps (one dead) hanging from iron girders; rags and bones at the ends where the goblins sleep, and their eyes
let ST=null;
function stnSprite(k){const sc=bucket(k);if(ST&&ST.sc===sc)return ST;
  const tl=EnvTex.subwayTiles(41,{tw:12,th:6,cols:8,rows:8,sc:6,c0:'#8a7e62',c1:'#6e624a',grout:'#2a241c',biscuit:'#4a3a2a',craze:.45});if(!tl||tl.width<16)return null;
  const tm=EnvTex.subwayTiles(43,{tw:12,th:6,cols:8,rows:8,sc:6,c0:'#3e1818',c1:'#301212',grout:'#120808',biscuit:'#2a1a12',craze:.3});
  const x0=30,x1=STN_L+72,y0=-12,y1=yDF()+.5,cv=mk(x1-x0,y1-y0,sc),c=cv.getContext('2d'),r=rng(53);c.scale(sc,sc);c.translate(-x0,-y0);
  const oL=WD*PSX,oR=STN_L+WD*PSX,yO=GB-WD*PSY,wq=(x,hh)=>q(x,GB-hh,SD),fy=hh=>GB-hh-SD*PSY;
  c.save();c.beginPath();c.rect(oL,y0,oR-oL,yO-y0);c.clip();
  c.fillStyle='#050405';c.fillRect(oL,y0,oR-oL,yO-y0);
  // the back wall: cream tile, a black frieze ruled in gold, the oxblood dado; soot over it all from above
  {const a=wq(0,0).x;c.fillStyle=patAt(c,tl,a,0,1/6);c.fillRect(a,fy(150),STN_L,110);c.fillStyle=patAt(c,tm,a,0,1/6);c.fillRect(a,fy(34),STN_L,34);
    c.fillStyle='#08080a';c.fillRect(a,fy(40),STN_L,6);c.fillStyle=rgba(C.gold,.6);c.fillRect(a,fy(40)+1,STN_L,.7);c.fillRect(a,fy(34)-1.5,STN_L,.7);
    c.fillStyle='#0c0b0c';c.fillRect(a,fy(156),STN_L,7);c.fillStyle=rgba(C.gold,.45);c.fillRect(a,fy(150)-1,STN_L,.7);
    c.fillStyle=lin(c,0,fy(150),0,fy(40),[[0,rgba('#050404',.86)],[.45,rgba('#0a0807',.52)],[1,rgba('#0a0807',.38)]]);c.fillRect(a,fy(150),STN_L,110);c.fillStyle=rgba('#0a0807',.2);c.fillRect(a,fy(34),STN_L,34);
    for(let i=0;i<22;i++){const x=a+r()*STN_L,L=20+r()*70;c.fillStyle=lin(c,0,fy(150),0,fy(150)+L,[[0,rgba('#1a1208',.5)],[1,rgba('#1a1208',0)]]);c.fillRect(x,fy(150),1.5+r()*4,L);}
    // the blind arches, five bays
    for(let j=0;j<5;j++){const L=a+j*180+14,R=a+j*180+166,yb=fy(40),ys=fy(112);c.beginPath();c.moveTo(L,yb);c.lineTo(L,ys);c.quadraticCurveTo((L+R)/2,ys-34,R,ys);c.lineTo(R,yb);
      c.fillStyle=rgba('#000000',.16);c.fill();c.strokeStyle=rgba(C.gold,.42);c.lineWidth=.8;c.stroke();}
    // the station's name, twice, on black enamel
    for(const cx of [270,630]){const x=a+cx,y=fy(98);c.fillStyle='#09090b';c.fillRect(x-76,y,152,21);c.strokeStyle=rgba(C.gold,.85);c.lineWidth=1;c.strokeRect(x-74,y+2,148,17);
      c.fillStyle=rgba('#ffffff',.04);c.fillRect(x-76,y,152,6);gilt(c,'LAMPLIGHT  STREET',x,y+14.6,10.5,{style:'700',track:1});}
    // torn posters, faded
    for(const [cx,col] of [[60,'#4a2a28'],[120,'#2a3040'],[380,'#5a4a2a'],[520,'#3a2230'],[780,'#2a3a30'],[840,'#4a3a26']]){const x=a+cx-17,y=fy(96);
      c.fillStyle=col;c.fillRect(x,y,34,46);c.fillStyle=rgba('#d8cfb0',.12);c.beginPath();c.arc(x+17,y+17,9,0,TAU);c.fill();c.fillRect(x+5,y+31,24,1.6);c.fillRect(x+7,y+35,20,1.2);c.fillRect(x+9,y+39,16,1.2);
      c.fillStyle=rgba('#000000',.3);c.fillRect(x,y,34,46);c.fillStyle='#5e5442';c.beginPath();c.moveTo(x+34,y+46);c.lineTo(x+34,y+30-r()*10);c.lineTo(x+22-r()*8,y+46);c.closePath();c.fill();
      c.strokeStyle=rgba(C.goldD,.8);c.lineWidth=.8;c.strokeRect(x-1,y-1,36,48);}}
  // the platform's far part, behind the wall's line: stone flags, a pool of light under each lamp that still burns
  function flags(d0,d1){c.save();floorT(c,0);c.fillStyle='#2c261e';c.fillRect(0,d0,STN_L,d1-d0);
    const rr=rng(61+d0);for(let x=0;x<STN_L;x+=36)for(let d=PE;d<SD;d+=27){if(d+27<d0||d>d1)continue;c.fillStyle=rgba(rr()<.5?'#000000':'#5a4a36',.08+.12*rr());c.fillRect(x+1,d+1,34,25);}
    c.strokeStyle=rgba('#000000',.55);c.lineWidth=.8;c.beginPath();for(let x=0;x<=STN_L;x+=36){c.moveTo(x,d0);c.lineTo(x,d1);}for(let d=PE;d<=SD;d+=27){if(d<d0||d>d1)continue;c.moveTo(0,d);c.lineTo(STN_L,d);}c.stroke();
    if(d0<=PE+12){c.fillStyle='#4a4030';c.fillRect(0,PE,STN_L,10);c.fillStyle=rgba(C.gold,.6);c.fillRect(0,PE+10,STN_L,1);}
    c.fillStyle=lin(c,0,PE,0,SD,[[0,rgba('#000000',0)],[1,rgba('#000000',.45)]]);c.fillRect(0,d0,STN_L,d1-d0);
    c.globalCompositeOperation='lighter';for(const L of STN_LAMPS){if(!L.lit)continue;c.fillStyle=rad(c,L.x,L.d-25,0,110,[[0,rgba('#ffd49a',.28)],[.5,rgba('#ffd49a',.09)],[1,rgba('#ffd49a',0)]]);c.fillRect(L.x-110,d0,220,d1-d0);}
    c.restore();}
  flags(WD,SD);
  // benches against the back wall, and the rags and bones at the ends, and the eyes
  for(const bx of [292,592]){const leg=(x,d)=>{const p=q(x,GB,d),t=q(x,GB-16,d);c.strokeStyle='#0a0a0c';c.lineWidth=1.6;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(t.x,t.y);c.stroke();};
    leg(bx+6,316);leg(bx+58,316);c.fillStyle='#24180f';c.beginPath();for(const [x,d] of [[bx,306],[bx+64,306],[bx+64,318],[bx,318]]){const p=q(x,GB-16,d);c.lineTo(p.x,p.y);}c.closePath();c.fill();
    {const p=q(bx,GB-16,306);c.fillStyle='#160e08';c.fillRect(p.x,p.y,64,2.4);}
    {const p=q(bx,GB-36,322);c.fillStyle='#1c120b';c.fillRect(p.x,p.y,64,14);c.fillStyle=rgba('#000000',.4);c.fillRect(p.x,p.y+4.5,64,.8);c.fillRect(p.x,p.y+9,64,.8);c.fillStyle=rgba(C.gold,.5);c.fillRect(p.x,p.y,64,.8);}
    leg(bx+6,306);leg(bx+58,306);}
  for(const [x0r,x1r] of [[6,64],[820,890]]){for(let i=0;i<7;i++){const x=lerp(x0r,x1r,r()),d=302+r()*24,p=q(x,GB,d);c.fillStyle=r()<.5?'#1a1410':'#2a1e16';c.beginPath();c.ellipse(p.x,p.y-3,6+r()*8,3+r()*3,0,Math.PI,0);c.fill();}
    for(let i=0;i<3;i++){const p=q(lerp(x0r,x1r,r()),GB,300+r()*20);c.strokeStyle='#b8ae98';c.lineWidth=1.4;c.beginPath();c.moveTo(p.x-4,p.y-1);c.lineTo(p.x+4,p.y-2);c.stroke();}}
  for(const [x,d,hh] of [[24,322,24],[862,318,30]]){const p=q(x,GB-hh,d);c.fillStyle='#d8e04a';c.fillRect(p.x-2.6,p.y,1.6,1.1);c.fillRect(p.x+1,p.y,1.6,1.1);glow(c,p.x,p.y,6,'#d8e04a',.3);}
  // the girders the lamps hang from, the stopped clock, the lamps
  for(const L of STN_LAMPS){const a=q(L.x,GB-178,SD),b=q(L.x,GB-178,WD-6);c.strokeStyle='#0c0c10';c.lineWidth=6;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
    c.strokeStyle=rgba(C.gold,.4);c.lineWidth=.7;c.beginPath();c.moveTo(a.x,a.y+3);c.lineTo(b.x,b.y+3);c.stroke();c.fillStyle=rgba(C.gold,.5);for(let u=.1;u<1;u+=.2)c.fillRect(lerp(a.x,b.x,u)-.5,lerp(a.y,b.y,u)-.5,1,1);}
  {const p=q(450,GB-150,262);c.strokeStyle='#0c0c10';c.lineWidth=1.4;c.beginPath();c.moveTo(p.x,y0);c.lineTo(p.x,p.y-12);c.stroke();
    c.fillStyle='#0a0a0c';c.beginPath();c.arc(p.x,p.y,12.5,0,TAU);c.fill();c.fillStyle='#b8ae90';c.beginPath();c.arc(p.x,p.y,10.5,0,TAU);c.fill();c.fillStyle=rgba('#000000',.25);c.beginPath();c.arc(p.x+1,p.y+1,10.5,0,TAU);c.fill();
    c.strokeStyle=C.gold;c.lineWidth=1.2;c.beginPath();c.arc(p.x,p.y,11.6,0,TAU);c.stroke();c.fillStyle='#1a1410';for(let i=0;i<12;i++){const an=i/12*TAU;c.fillRect(p.x+Math.cos(an)*8.8-.5,p.y+Math.sin(an)*8.8-.5,1,1);}
    c.strokeStyle='#14100c';c.lineCap='round';c.lineWidth=1.3;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x-4.6,p.y-3.4);c.moveTo(p.x,p.y);c.lineTo(p.x+1.4,p.y-7.6);c.stroke();c.lineCap='butt';}
  for(const L of STN_LAMPS){const p=q(L.x,GB-L.h,L.d),top=q(L.x,GB-178,L.d);c.strokeStyle='#0c0c10';c.lineWidth=1;c.beginPath();c.moveTo(p.x,top.y);c.lineTo(p.x,p.y-10);c.stroke();
    c.fillStyle=C.goldD;c.fillRect(p.x-5,p.y-11,10,2.2);c.fillRect(p.x-4,p.y+8,8,2);c.strokeStyle=rgba(C.gold,.8);c.lineWidth=.7;c.beginPath();for(const kx of [-4.5,-1.5,1.5,4.5]){c.moveTo(p.x+kx,p.y-9);c.lineTo(p.x+kx*.8,p.y+8);}c.stroke();
    c.fillStyle=L.lit?C.cyanL:'#14262a';c.beginPath();c.moveTo(p.x,p.y-6);c.lineTo(p.x+3.4,p.y);c.lineTo(p.x,p.y+6);c.lineTo(p.x-3.4,p.y);c.closePath();c.fill();
    if(L.lit){glow(c,p.x,p.y+4,110,'#ffcf86',.24);glow(c,p.x,p.y,22,C.cyan,.5);}}
  c.restore();
  // the platform's near part, in front of the wall's line, its coping, and the end of it
  flags(PE,WD);
  {const a=q(0,GB,PE),b=q(STN_L,GB,PE);c.fillStyle='#1c1812';c.fillRect(a.x,a.y,b.x-a.x,12);c.fillStyle=rgba('#d8cfb0',.25);c.fillRect(a.x,a.y,b.x-a.x,.9);
    const e=[q(STN_L,GB,PE),q(STN_L,GB,WD),q(STN_L,GB+BED,WD),q(STN_L,GB+BED,PE)];c.fillStyle='#120f0c';c.beginPath();e.forEach(p=>c.lineTo(p.x,p.y));c.closePath();c.fill();
    c.strokeStyle=rgba('#d8cfb0',.2);c.lineWidth=.8;c.beginPath();c.moveTo(e[0].x,e[0].y);c.lineTo(e[1].x,e[1].y);c.stroke();}
  // the side of the recess at its start, facing down the line
  {const P=[q(0,GB,WD),q(0,GB,SD),q(0,y0+SD*PSY,SD),q(0,y0+WD*PSY,WD)];c.fillStyle=patAt(c,EnvTex.brick(13,{base:'#2e1a14',alt:'#1e100c',hot:'#3a2018',mortar:'#0a0706'}),0,0,1/6);
    c.beginPath();P.forEach(p=>c.lineTo(p.x,p.y));c.closePath();c.fill();c.fillStyle=lin(c,0,y0,0,yO,[[0,rgba('#010101',.95)],[1,rgba('#060404',.55)]]);c.fill();
    c.strokeStyle=rgba('#ffcf86',.18);c.lineWidth=1;c.beginPath();c.moveTo(P[3].x+.5,P[3].y);c.lineTo(P[0].x+.5,P[0].y);c.stroke();}
  // the warm air of the place
  c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,0,fy(160),0,yO+40,[[0,rgba('#ffcf86',0)],[.6,rgba('#ffcf86',.035)],[1,rgba('#ffcf86',0)]]);c.fillRect(oL,fy(160),oR-oL,yO+40-fy(160));c.restore();
  ST={sc,cv,blur:smear(cv,22*sc,false),x0,y0,w:x1-x0,h:y1-y0};return ST;}

// a side passage's mouth: a dark arch in the wall ringed in blue brick, its bore going back, a light far down it (made once a scale,
// and its smear)
let PS=null;
function passSprite(k){const sc=bucket(k);if(PS&&PS.sc===sc)return PS;
  const sh=yS(),wb=yWB(),y0=sh+22,y1=wb+1,w=112,cv=mk(w,y1-y0,sc),c=cv.getContext('2d');c.scale(sc,sc);c.translate(0,-y0);
  const cx=56,R=47,cy=sh+30+R,arch=(x,yb,r,cyy)=>{c.beginPath();c.moveTo(x-r,yb);c.lineTo(x-r,cyy);c.arc(x,cyy,r,Math.PI,0);c.lineTo(x+r,yb);c.closePath();};
  arch(cx,wb,R+5,cy);c.fillStyle='#10131a';c.fill();
  arch(cx,wb,R,cy);c.fillStyle='#020203';c.fill();
  for(const [u,a] of [[.82,.5],[.66,.35],[.52,.25]]){const yb=wb-(1-u)*30;arch(cx+(1-u)*22,yb,R*u,yb-(wb-cy)*u);c.strokeStyle=rgba('#2a3040',a);c.lineWidth=1.2;c.stroke();}
  glow(c,cx+12,wb-62,26,'#ffb866',.32);c.fillStyle=rgba('#ffcf86',.55);c.fillRect(cx+9,wb-66,6,2);
  c.strokeStyle=rgba('#8a94b0',.18);c.lineWidth=.8;c.beginPath();c.arc(cx,cy,R+5.5,Math.PI,0);c.stroke();
  c.fillStyle=rgba('#000000',.5);c.fillRect(cx-R-6,wb-3,2*R+12,4);
  PS={sc,cv,blur:smear(cv,22*sc,false),y0,w,h:y1-y0};return PS;}
// the engine's breath, a long band of it streaming back under the vault (made once)
let SMK=null;
function smokeBand(){if(SMK)return SMK;const SW=1500,H2=120,cv=mk(SW,H2,1),c=cv.getContext('2d'),r=rng(77);
  const P=mk(64,64,1),pc=P.getContext('2d');pc.fillStyle=rad(pc,32,32,0,32,[[0,'rgba(150,158,172,.55)'],[.5,'rgba(120,128,142,.22)'],[1,'rgba(100,108,120,0)']]);pc.fillRect(0,0,64,64);
  for(let i=0;i<34;i++){const x=r()*SW,y=24+r()*66,z=26+r()*60;c.globalAlpha=.22+.4*r();for(const o of [-SW,0,SW])c.drawImage(P,x+o-z*1.7,y-z*.42,z*3.4,z*.84);}
  return SMK={cv,SW,H2};}
// a wall lamp's light on the brick round it, and the pools the lamps throw on the deck (made once a scale)
let LG=null,PL=null;
function lampSprite(k){const sc=bucket(k);if(LG&&LG.sc===sc)return LG;const R=92,cv=mk(2*R,2*R,sc),c=cv.getContext('2d');c.scale(sc,sc);
  glow(c,R,R,90,'#ffcf86',.3);glow(c,R,R+4,24,C.cyan,.42);return LG={sc,cv,R};}
function poolSprite(k){const sc=bucket(k);if(PL&&PL.sc===sc)return PL;
  const one=(R,a,col)=>{const cd=DF-26,d0=Math.max(DN,cd-R),d1=DF,x0=-R+d0*PSX,x1=R+d1*PSX,y0=GB-d1*PSY,y1=GB-d0*PSY,cv=mk(x1-x0,y1-y0,sc),c=cv.getContext('2d');
    c.scale(sc,sc);c.translate(-x0,-y0);floorT(c,0);c.fillStyle=rad(c,0,cd,0,R,[[0,rgba(col,a)],[.45,rgba(col,a*.38)],[1,rgba(col,0)]]);c.fillRect(-R,d0,2*R,d1-d0);return{cv,x0,y0,w:x1-x0,h:y1-y0};};
  return PL={sc,lamp:one(150,.16,'#ffd9a0'),stn:one(230,.17,'#ffcf86')};}
// everything made once, ahead of the first frame: at the screen's scale if it is known
function warm(k,force){if(force){WT=RT=ST=PS=SMK=LG=PL=null;}if(k==null)k=(typeof cv!=='undefined'&&typeof cam!=='undefined'&&cam&&cam.viewW)?cv.width/cam.viewW:2;wallTile(k);railTile(k);stnSprite(k);passSprite(k);smokeBand();lampSprite(k);poolSprite(k);}

// ---------- the scene ----------
function paint(c){const X0=-160,X1=W+260,T0=-140;
  try{warm();}catch(e){}
  c.fillStyle='#030304';c.fillRect(X0,T0,X1-X0,GB+220-T0);
  deck(c);
  // the car's lantern: its light on the deck rides with the car
  c.save();floorT(c,0);c.beginPath();c.rect(X0,DN,X1-X0,DF-DN);c.clip();c.globalCompositeOperation='lighter';
  c.fillStyle=rad(c,LANTERN.x,DF-14,0,230,[[0,rgba('#ffc070',.14)],[.4,rgba('#ffc070',.05)],[1,rgba('#ffc070',0)]]);c.fillRect(LANTERN.x-230,DN,460,DF-DN);c.restore();}
// where things stand along the line (world x, from where the line starts); on the screen at depth 0 a thing is at its x less S.scroll
const lampAt=i=>i*LAMP+LAMP/2,lampOn=i=>hash(i)>.16,passAt=i=>i*PASS+900;
function stnAt(xw,m){m=m||0;const i=Math.floor((xw-STN_AT+m)/STN);if(i<0)return null;const s=i*STN+STN_AT;return xw>=s-m&&xw<=s+STN_L+m?s:null;}
function live(){const t=S.t,v=Math.abs(S.scrollV||0),s0=S.scroll||0,sh=yS(),wb=yWB(),df=yDF(),Tr=ctx.getTransform(),k=Math.hypot(Tr.a,Tr.b)||1;
  const vx0=-Tr.e/Tr.a-80,vx1=(ctx.canvas.width-Tr.e)/Tr.a+80,blurA=clamp((v-150)/500,0,1),ox=WD*PSX;
  const WT0=wallTile(k);
  ctx.save();ctx.beginPath();ctx.rect(vx0,-400,vx1-vx0,df+400);ctx.clip();
  // the wall, the made repeat set down at the train's distance as often as it takes; smeared as the speed comes up
  if(WT0){let x=ox-frac(s0/PER)*PER;while(x>vx0)x-=PER;
    for(;x<vx1;x+=PER){if(blurA<1)ctx.drawImage(WT0.cv,x,WT0.y0,PER+.6,WT0.h);if(blurA>0){ctx.globalAlpha=blurA;ctx.imageSmoothingEnabled=false;ctx.drawImage(WT0.blur,x,WT0.y0,PER+.6,WT0.h);ctx.imageSmoothingEnabled=true;ctx.globalAlpha=1;}}}
  else{ctx.fillStyle='#0a0606';ctx.fillRect(vx0,sh-130,vx1-vx0,wb-sh+130);}
  // the strip of track bed at the wall's foot beyond the car, streaming by
  ctx.fillStyle='#040404';ctx.fillRect(vx0,wb-1,vx1-vx0,df-wb+1);
  {const r=rng(3),span=1500;for(let i=0;i<30;i++){const x=-300+frac(r()-s0/span)*span,L=4+r()*10+v*.03;ctx.fillStyle=rgba('#4a4238',.18+.2*r());ctx.fillRect(x,wb+1+r()*(df-wb-2),L,.8);}}
  // side passages: a dark arched mouth, a light far down it, eyes in some
  {const i0=Math.floor((s0+vx0-ox-112-900)/PASS),i1=Math.floor((s0+vx1-ox-900)/PASS)+1,P=passSprite(k);
    if(P)for(let i=i0;i<=i1;i++){const xw=passAt(i);if(stnAt(xw,120)!=null)continue;const x=xw-s0+ox;if(x+P.w<vx0||x>vx1)continue;
      if(blurA<1)ctx.drawImage(P.cv,x,P.y0,P.w,P.h);if(blurA>0){ctx.globalAlpha=blurA;ctx.imageSmoothingEnabled=false;ctx.drawImage(P.blur,x,P.y0,P.w,P.h);ctx.imageSmoothingEnabled=true;ctx.globalAlpha=1;}
      if(blurA<.6&&hash(i+.5)<.45){const ey=wb-74+hash(i+.3)*36,ex=x+30+hash(i+.9)*40;ctx.fillStyle='#d8e04a';ctx.fillRect(ex,ey,1.8,1.1);ctx.fillRect(ex+4,ey,1.8,1.1);glow(ctx,ex+2,ey,6,'#d8e04a',.3);}}}
  // the old station going by
  {const i0=Math.max(0,Math.floor((s0+vx0-STN_L-80-STN_AT)/STN)),i1=Math.floor((s0+vx1-STN_AT)/STN);
    if(i1>=i0){const SP=stnSprite(k);if(SP)for(let i=i0;i<=i1;i++){const x=i*STN+STN_AT-s0;if(x+SP.x0+SP.w<vx0||x+SP.x0>vx1)continue;
      if(blurA<1)ctx.drawImage(SP.cv,x+SP.x0,SP.y0,SP.w,SP.h);if(blurA>0){ctx.globalAlpha=blurA;ctx.imageSmoothingEnabled=false;ctx.drawImage(SP.blur,x+SP.x0,SP.y0,SP.w,SP.h);ctx.imageSmoothingEnabled=true;ctx.globalAlpha=1;}}}}
  // mile plates: gilt numbers on black, a gold smear at speed
  {const i0=Math.floor((s0+vx0-ox-620)/PLATE),i1=Math.floor((s0+vx1-ox-620)/PLATE)+1;for(let i=i0;i<=i1;i++){const xw=i*PLATE+620;if(stnAt(xw,60)!=null)continue;const x=xw-s0+ox;if(x<vx0-40||x>vx1)continue;
    if(blurA<.5){ctx.fillStyle='#08080a';ctx.fillRect(x,sh+96,26,15);ctx.strokeStyle=rgba(C.gold,.7);ctx.lineWidth=.8;ctx.strokeRect(x+1.5,sh+97.5,23,12);gilt(ctx,String(1+((i%9)+9)%9),x+13,sh+107.6,10,{style:'700'});}
    else{ctx.fillStyle=lin(ctx,x-14,0,x+40,0,[[0,rgba('#08080a',0)],[.3,rgba('#08080a',.7)],[.7,rgba('#08080a',.7)],[1,rgba('#08080a',0)]]);ctx.fillRect(x-14,sh+96,54,15);ctx.fillStyle=rgba(C.gold,.22);ctx.fillRect(x-10,sh+102,46,2);}}}
  // the lamps flash by: each crystal lit, its light on the brick round it; a streak behind it at speed
  {const i0=Math.floor((s0+vx0-ox-200)/LAMP),i1=Math.ceil((s0+vx1-ox+200)/LAMP),LS=lampSprite(k);
    for(let i=i0;i<=i1;i++){const xw=lampAt(i);if(!lampOn(i)||stnAt(xw,40)!=null)continue;const x=xw-s0+ox,y=sh+28;if(x<vx0-100||x>vx1+100)continue;
      ctx.globalCompositeOperation='lighter';ctx.imageSmoothingEnabled=false;ctx.drawImage(LS.cv,x-LS.R,y-4-LS.R,2*LS.R,2*LS.R);ctx.imageSmoothingEnabled=true;ctx.globalCompositeOperation='source-over';
      const L=Math.min(70,v*.06);if(L>4){ctx.fillStyle=lin(ctx,x,0,x+L,0,[[0,rgba(C.cyanL,.55)],[1,rgba(C.cyanL,0)]]);ctx.fillRect(x,y-1.6,L,3.2);}
      ctx.fillStyle=C.cyanL;ctx.beginPath();ctx.moveTo(x,y-6);ctx.lineTo(x+3.4,y);ctx.lineTo(x,y+6);ctx.lineTo(x-3.4,y);ctx.closePath();ctx.fill();}}
  ctx.restore();
  // their light thrown across the deck, sliding past with them; the station's, broad and warm, as it goes by
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.imageSmoothingEnabled=false;
  {const PLs=poolSprite(k),pool=(x,P)=>{if(x+P.x0+P.w<vx0||x+P.x0>vx1)return;ctx.drawImage(P.cv,x+P.x0,P.y0,P.w,P.h);};
    const i0=Math.floor((s0+vx0-200)/LAMP),i1=Math.ceil((s0+vx1+200)/LAMP);
    for(let i=i0;i<=i1;i++){const xw=lampAt(i);if(!lampOn(i)||stnAt(xw,40)!=null)continue;pool(xw-s0-12,PLs.lamp);}
    const s=stnAt(s0+(vx0+vx1)/2,STN_L);if(s!=null)for(const L of STN_LAMPS){if(L.lit)pool(s+L.x-s0,PLs.stn);}}
  ctx.restore();
  // the far rail, the car's lantern lit on it
  {const R=railTile(k);ctx.drawImage(R.cv,R.x0,R.y0,R.w,R.h);const p=q(LANTERN.x,GB,LANTERN.d),fl=.85+.15*Math.sin(t*9)*Math.sin(t*3.7);
    glow(ctx,p.x+5,p.y-36,56,'#ffc070',.42*fl);glow(ctx,p.x+5,p.y-36,10,'#fff0c8',.85*fl);}
  // the engine's breath streaming back overhead, and the dust and grit of the tunnel going past at three depths
  {const B=smokeBand(),y=sh-104;let x=-frac((s0*.42+t*14)/B.SW)*B.SW-300;ctx.globalAlpha=.45;ctx.imageSmoothingEnabled=false;for(;x<vx1;x+=B.SW)if(x+B.SW>vx0)ctx.drawImage(B.cv,x,y,B.SW+.5,B.H2);ctx.imageSmoothingEnabled=true;ctx.globalAlpha=1;}
  {const r=rng(5),span=1500;for(const [f,n,y0,y1,a0,w0] of [[.7,24,sh,df,.07,.7],[1,20,sh+60,GB-20,.09,.9],[1.4,12,GB-120,GB+30,.12,1.3]]){
      for(let i=0;i<n;i++){const x=-300+frac(r()-s0*f/span)*span,y=lerp(y0,y1,r()),a=a0*(.5+r()),L=Math.min(46,1+v*.032*f*(.6+r()));
        ctx.fillStyle=rgba(i%4?'#c8bca8':'#cfe8ff',a);ctx.fillRect(x,y,L,w0);}}}
  // under the car's near side: the tops of its wheels turning, sparks off them when it runs hard
  {const yb=q(0,GB,DN).y+SILL,wa=s0/12;ctx.save();ctx.beginPath();ctx.rect(vx0,yb,vx1-vx0,60);ctx.clip();
    for(let x=-188;x<1100;x+=150){for(const dx of [0,46]){const cx=x+dx,cy=yb+13;if(cx<vx0-20||cx>vx1+20)continue;
      ctx.fillStyle='#09090c';ctx.beginPath();ctx.arc(cx,cy,12,0,TAU);ctx.fill();ctx.strokeStyle=C.goldD;ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(cx,cy,10.6,0,TAU);ctx.stroke();
      if(v<260){ctx.strokeStyle='#24242e';ctx.lineWidth=1.2;ctx.beginPath();for(let k2=0;k2<6;k2++){const b=wa+k2*TAU/6;ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(b)*9.5,cy+Math.sin(b)*9.5);}ctx.stroke();}
      else{ctx.strokeStyle=rgba('#8a94b0',.22);ctx.lineWidth=.8;ctx.beginPath();ctx.arc(cx,cy,6.5,0,TAU);ctx.stroke();}
      ctx.strokeStyle=rgba(C.goldL,.65);ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(cx,cy,10.6,-Math.PI*.64,-Math.PI*.4);ctx.stroke();}
      ctx.fillStyle='#0c0c10';ctx.fillRect(x-6,yb,58,4);}
    if(v>300){const r=rng(Math.floor(t*24)),n=Math.floor(v/220);ctx.globalCompositeOperation='lighter';
      for(let i=0;i<n;i++){if(r()>.4){r();r();continue;}const x=-188+Math.floor(r()*8)*150+(r()<.5?0:46)-6,y=yb+24;if(x<vx0||x>vx1)continue;glow(ctx,x,y,16,'#ffb050',.45);
        for(let j=0;j<5;j++){const L=6+r()*18,an=Math.PI+.15+r()*.5;ctx.strokeStyle=rgba(r()<.5?'#ffd27a':'#fff3cf',.75);ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(an)*L,y-Math.sin(an)*L*.5-r()*6);ctx.stroke();}}
      ctx.globalCompositeOperation='source-over';}
    ctx.restore();}}
// the light that rims a fighter: the station's lamps while it goes by, the nearest lamp passing if one is close, else the car's lantern
function light(f){const x=f.p[PEL].x,s0=S.scroll||0,sh=yS(),s=stnAt(x+s0,60);
  if(s!=null){let best=null,bd=1e9;for(const L of STN_LAMPS){if(!L.lit)continue;const d=Math.abs(s+L.x-s0-x);if(d<bd){bd=d;best=L;}}const p=q(s+best.x-s0,GB-best.h,best.d);return{light:{x:p.x-f.dep*PSX,y:p.y+f.dep*PSY}};}
  const i=Math.round((x+s0-LAMP/2)/LAMP),lx=lampAt(i)-s0;
  if(lampOn(i)&&Math.abs(lx-x)<170)return{light:{x:lx+WD*PSX-f.dep*PSX,y:sh+28+f.dep*PSY}};
  const p=q(LANTERN.x+5,GB-36,LANTERN.d);return{light:{x:p.x-f.dep*PSX,y:p.y+f.dep*PSY}};}
E.S.tunnel={paint,live,light,warm,LAYOUT:{DN,DF,WD,BED,SPR,SILL,deckY:GB,railTop:GB-24,railDep:LANTERN.d,lantern:LANTERN,STN,STN_AT,STN_L}};
})();
// ===== ENV TUNNEL END =====
