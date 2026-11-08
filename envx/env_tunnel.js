// ===== ENV TUNNEL =====
// The line: the open flatcar of Hallowell's train, running at speed down the old tunnel under the city. The fight stands on the car's
// deck, riveted iron plate with a tread worked into it, which does not move; everything else goes by. The tunnel's wall rushes past
// in sooted brick ribbed with rings of blue engineering brick that turn over into the dark of the vault, cables slung along it, caged
// crystal lamps that flash by and throw their light across the deck as they pass (a few of them dead), arched refuges, the mouths of
// side passages with eyes in them now and then, a gilt mile plate, red and green signals at the vault's spring, and every nine seconds
// or so at speed (since V90; it was half as often) the lit platform of Lamplight Street's
// old station, long shut, going by. At speed the wall smears along the line. The car carries a brass lantern on its far rail; the
// engine's breath and the tunnel's dust stream back over the deck; under the car's near side its wheels turn and throw sparks.
// Layout, world units: the deck from depth 0 (its near edge) to 186 (its far edge, with a low rail along it), the track bed 40 below
// the deck, the tunnel's wall at depth 250 standing 170 above the deck before its vault turns over. S.scroll (how far the train has
// come, world units) moves the tunnel; S.scrollV (its speed, about 900) sets the smear, the streaks and the sparks.
(()=>{const E=EnvLook,{C,pp,lin,rad,rgba,glow,gilt,rng,lerp,clamp,TAU,poly,line}=E;
const DN=0,DF=186,WD=250,BED=40,SPR=170,SILL=18;
const PER=840,LAMP=420,PASS=2310,PLATE=1050;                  // the wall's repeat; how often lamps, side passages and mile plates come
const STN=8400,STN_AT=5200,STN_L=900,SD=330,PE=196;            // the old station: how often, where the first one is, its length, its back wall and platform edge depths
const SIG=LAMP;                                               // a signal on the wall at the vault's spring halfway between each two lamps (since V90)
const q=(x,y,d)=>pp(x,y,d);
const yS=()=>GB-SPR-WD*PSY,yWB=()=>GB+BED-WD*PSY,yDF=()=>GB-DF*PSY;   // on the screen: the vault's spring, the wall's foot, the deck's far edge
const LANTERN={x:806,d:DF-4};                                          // the car's own lantern, on its far rail
const LANTERNS=[LANTERN,{x:236,d:DF-4}];                              // (and since V90 a second one along it, nearer the car's middle)
const STN_LAMPS=[{x:180,lit:1},{x:360,lit:0},{x:540,lit:1},{x:720,lit:1}].map(L=>({...L,d:290,h:120}));
const frac=v=>v-Math.floor(v),hash=i=>frac(Math.abs(Math.sin(i*12.9898+.7)*43758.5453));
const bucket=k=>clamp(Math.round(k*20)/20,1,2.5);   // made at the screen's own scale, so a smeared picture can be set down unfiltered
function mk(w,h,sc){const cv=document.createElement('canvas');cv.width=Math.ceil(w*sc);cv.height=Math.ceil(h*sc);return cv;}
function patAt(c,cv,x,y,u){const p=c.createPattern(cv,'repeat');if(p.setTransform)p.setTransform(new DOMMatrix().translate(x,y).scale(u));return p;}
function floorT(c,h){c.transform(1,0,PSX,-PSY,0,GB+(h||0));}
// the light on the fight (SET, below) laid into a made picture that stands in its band, as a still place has it laid into its layer
// (setDraw, sk_scene_glue.js; the deck gets it in the layer): it runs the same all along the line, so it goes by with the wall, its
// passages, the old station and the far rail (since V79; before, it was laid over each frame, 8 to 11 ms on a phone). keep: the
// picture has clear parts, kept clear
function lit(cv,c,x0,x1,keep){if(typeof setDraw!=='function')return;let k=null;
  if(keep){k=document.createElement('canvas');k.width=cv.width;k.height=cv.height;k.getContext('2d').drawImage(cv,0,0);}
  setDraw(c,SET,x0,x1-x0);
  if(k){c.save();c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='destination-in';c.globalAlpha=1;c.drawImage(k,0,0);c.restore();}}
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
function deck(c){const X0=REAR,X1=DX1;
  c.save();floorT(c,0);c.fillStyle=patAt(c,tread(),0,0,1/6);c.fillRect(X0,DN,X1-X0,DF-DN);
  // dark toward both edges, a worn lane down the middle where boots go
  c.fillStyle=lin(c,0,DN,0,DF,[[0,rgba('#030305',.5)],[.22,rgba('#050507',.3)],[.55,rgba('#06060a',.26)],[1,rgba('#030305',.6)]]);c.fillRect(X0,DN,X1-X0,DF-DN);
  c.fillStyle=rgba('#9aa4c0',.05);c.fillRect(X0,62,X1-X0,46);
  {const r=rng(29);for(let i=0;i<40;i++){const x=X0+r()*(X1-X0),d=DN+8+r()*(DF-DN-16);c.fillStyle=rgba(r()<.6?'#050406':'#2a1408',.14+.16*r());c.beginPath();c.ellipse(x,d,8+r()*40,3+r()*10,r()*.4,0,TAU);c.fill();}}
  // the iron angle along both edges, and the stake pockets in it
  c.fillStyle='#0a0a0e';c.fillRect(X0,DN,X1-X0,3);c.fillRect(X0,DF-3,X1-X0,3);c.fillStyle=rgba(C.gold,.42);c.fillRect(X0,DN+3,X1-X0,.8);c.fillRect(X0,DF-3.8,X1-X0,.8);
  for(const d of [DN+1.5,DF-1.5])for(let x=X0+20;x<X1;x+=64){c.fillStyle='#030304';c.fillRect(x-3,d-1.4,6,2.8);}
  // (since V105 the tail end is in the picture: the angle iron across it, its lip catching the light)
  c.fillStyle='#0a0a0e';c.fillRect(X0,DN,3.4,DF-DN);c.fillStyle=rgba(C.gold,.42);c.fillRect(X0+3.4,DN,.9,DF-DN);
  c.restore();
  // the car's near side: its sole bar, riveted, stake pockets in it, the house's mark stencilled; under it the dark
  {const a=q(X0,GB,DN),b=q(X1,GB,DN);c.fillStyle=lin(c,0,a.y,0,a.y+SILL,[[0,'#1c1c24'],[.4,'#111117'],[1,'#07070a']]);c.fillRect(a.x,a.y,b.x-a.x,SILL);
    c.fillStyle=rgba('#6a6a7c',.5);for(let x=a.x+4;x<b.x;x+=9){c.fillRect(x,a.y+3,1.1,1.1);c.fillRect(x,a.y+SILL-4,1.1,1.1);}
    for(let x=a.x+20;x<b.x;x+=64){c.fillStyle='#040406';c.fillRect(x-4,a.y+5,8,9);c.fillStyle=rgba(C.gold,.3);c.fillRect(x-4,a.y+13.4,8,.8);}
    c.fillStyle=rgba(C.gold,.5);c.fillRect(a.x,a.y,b.x-a.x,.9);
    for(const x of [120,560]){const p=q(x,GB+9,DN);c.fillStyle=rgba(C.gold,.5);c.fillRect(p.x,p.y-4,1.4,8);c.fillRect(p.x+5,p.y-4,1.4,8);c.fillRect(p.x,p.y-.7,6.4,1.4);}
    c.fillStyle='#040405';c.fillRect(a.x,a.y+SILL,b.x-a.x,60);}}

// ---------- the lamps' light up the wall ----------
// Thrown up the wall and over into the vault, leaning over as the vault does (since V90: between the lamps the wall and the vault over
// the fight were one dark smear): the brick, the rings and the cables at the spring brought up under it (color-dodge, a little toward
// the crystals' cyan). It is made into the wall's picture at each lamp and into the vault's first course (UP), so it costs nothing a
// frame (drawn live it was 3 to 8 ms on a phone); a dead lamp's is taken out again live by its inverse, laid on with multiply (upDark)
const UP={r:215,sy:1.19,cy:-41,col:[104,156,166],tint:C.cyan,st:[[0,.95,.11],[.35,.6,.05],[.72,.18,.014],[1,0,0]]};
// (its inverse, worked out on the sooted brick's own value: a brighter or darker stone comes back a little off)
const UPX=(()=>{const B=[.07,.045,.035],T=[1,3,5].map(k=>parseInt(UP.tint.slice(k,k+2),16)/255);
  return UP.st.map(([t,a,b])=>[t,'rgb('+[0,1,2].map(i=>{const m=1+a*(1/(1-UP.col[i]/255)-1);return Math.round(255*B[i]/(B[i]*m+b*T[i]));}).join(',')+')']);})();
function upLight(c,x,y,dark){c.save();c.transform(1,0,VLEAN,1,x,y);c.scale(1,UP.sy);const R=UP.r,fill=(op,st)=>{c.globalCompositeOperation=op;c.fillStyle=rad(c,0,UP.cy,0,R,st);c.fillRect(-R,UP.cy-R,R*2,R*2);};
  if(dark)fill('multiply',UPX);else{fill('color-dodge',UP.st.map(([t,a])=>[t,'rgba('+UP.col+','+a+')']));fill('lighter',UP.st.map(([t,,b])=>[t,rgba(UP.tint,b)]));}
  c.restore();}

// ---------- the tunnel's wall: one repeat of it, made once a scale, and its smear ----------
// sooted brick; rings of blue brick every 140 that turn over into the vault; a string course at the spring; arched refuges; cables in
// their brackets and junction boxes; the lamps' brackets and cages (their crystals are lit live, as they pass)
let WT=null;
function wallTile(k){const sc=bucket(k);if(WT&&WT.sc===sc)return WT;
  const bt=EnvTex.brick(13,{base:'#2e1a14',alt:'#1e100c',hot:'#3a2018',mortar:'#0a0706'});if(!bt||bt.width<16)return null;
  const y0=-12,y1=yWB()+2,h=y1-y0,sh=yS(),cv=mk(PER,h,sc),c=cv.getContext('2d'),r=rng(7),st=v=>(v-y0)/h;c.scale(sc,sc);c.translate(0,-y0);
  c.fillStyle=patAt(c,bt,0,0,1/6);c.fillRect(0,y0,PER,h);
  // (dark, deepest toward the vault, where the brick still shows dimly: the vault goes on over it, vaultTile)
  c.fillStyle=lin(c,0,y0,0,y1,[[0,rgba('#020203',.44)],[st(sh-60),rgba('#020203',.56)],[st(sh),rgba('#040404',.68)],[st(sh+70),rgba('#060505',.58)],[.92,rgba('#060505',.6)],[1,rgba('#020202',.88)]]);c.fillRect(0,y0,PER,h);
  // seepage: lime run white from the joints, and wet black under it
  for(let i=0;i<16;i++){const x=r()*PER,w=1.5+r()*5,L=40+r()*160,pale=r()<.35,col=pale?'#9a9a88':'#000000';c.fillStyle=lin(c,0,sh+4,0,sh+4+L,[[0,rgba(col,pale?.09:.4)],[1,rgba(col,0)]]);c.fillRect(x,sh+4,w,L);}
  // the rings
  for(let x=40;x<PER;x+=140){c.fillStyle='#0f1218';c.beginPath();c.moveTo(x,y1);c.lineTo(x,sh);c.quadraticCurveTo(x,sh-70,x-26,y0);c.lineTo(x-14,y0);c.quadraticCurveTo(x+12,sh-70,x+12,sh);c.lineTo(x+12,y1);c.closePath();c.fill();
    c.fillStyle=rgba('#7a8aa8',.15);c.fillRect(x+11,sh,1.2,y1-sh);c.fillStyle=rgba('#000000',.55);c.fillRect(x-4,sh,4,y1-sh);
    c.strokeStyle=rgba('#000000',.5);c.lineWidth=1.51;c.beginPath();for(let y=y1;y>sh;y-=5.2){c.moveTo(x,y);c.lineTo(x+12,y);}c.stroke();}
  c.fillStyle=lin(c,0,y0,0,sh,[[0,rgba('#010102',.1)],[.6,rgba('#010102',.06)],[1,rgba('#010102',0)]]);c.fillRect(0,y0,PER,sh-y0);
  // the string course at the spring of the vault
  c.fillStyle='#0d1016';c.fillRect(0,sh-3,PER,6);c.fillStyle=rgba('#8a94b0',.16);c.fillRect(0,sh-3,PER,.8);c.fillStyle=rgba('#000000',.5);c.fillRect(0,sh+3,PER,2);
  // two heavy cables slung over the spring on hooks in the rings, their tops catching what light there is (since V90)
  for(let x=40;x<PER;x+=140){c.fillStyle='#16161c';c.fillRect(x+2,sh-46,8,4);c.fillRect(x+4.6,sh-43,2.6,12);}
  for(const [o,col,w] of [[-31,'#07070a',3.4],[-23,'#0a0a0d',2.6]]){c.strokeStyle=col;c.lineWidth=w;c.beginPath();for(let x=46-140;x<PER+140;x+=140){c.moveTo(x,sh+o);c.quadraticCurveTo(x+70,sh+o+11,x+140,sh+o);}c.stroke();}
  c.strokeStyle=rgba('#9aa8c8',.24);c.lineWidth=1.01;c.beginPath();for(const o of [-32.6,-24.2])for(let x=46-140;x<PER+140;x+=140){c.moveTo(x,sh+o);c.quadraticCurveTo(x+70,sh+o+11,x+140,sh+o);}c.stroke();
  // arched refuges low in the wall
  for(const x of [96,516]){c.fillStyle='#030304';c.beginPath();c.moveTo(x,y1);c.lineTo(x,y1-40);c.arc(x+13,y1-40,13,Math.PI,0);c.lineTo(x+26,y1);c.closePath();c.fill();
    c.strokeStyle='#10131a';c.lineWidth=3;c.beginPath();c.moveTo(x-1.5,y1);c.lineTo(x-1.5,y1-40);c.arc(x+13,y1-40,14.5,Math.PI,0);c.lineTo(x+27.5,y1);c.stroke();
    c.strokeStyle=rgba('#8a94b0',.14);c.lineWidth=.6;c.beginPath();c.arc(x+13,y1-40,16,Math.PI,0);c.stroke();}
  // cables sagging between brackets on the rings, a junction box now and then
  for(let x=40;x<PER;x+=140){c.fillStyle='#16161a';c.fillRect(x+2,sh+48,8,26);c.fillStyle=rgba(C.goldD,.5);c.fillRect(x+2,sh+48,8,.8);}
  c.lineWidth=1.8;for(const [o,col] of [[56,'#07070a'],[62,'#0a0a0d'],[69,'#08080b']]){c.strokeStyle=col;c.beginPath();for(let x=46-140;x<PER+140;x+=140){c.moveTo(x,sh+o);c.quadraticCurveTo(x+70,sh+o+12,x+140,sh+o);}c.stroke();}
  c.strokeStyle=rgba('#8a94b0',.13);c.lineWidth=.5;c.beginPath();for(let x=46-140;x<PER+140;x+=140){c.moveTo(x,sh+55);c.quadraticCurveTo(x+70,sh+66,x+140,sh+55);}c.stroke();
  for(const x of [300,720]){c.fillStyle='#14141a';c.fillRect(x,sh+52,16,22);c.strokeStyle=rgba(C.gold,.4);c.lineWidth=1.01;c.strokeRect(x+1,sh+53,14,20);c.fillStyle=rgba('#ffcf86',.5);c.fillRect(x+6,sh+57,4,1.2);}
  // the lamps: soot over each, a bracket, a brass cage with its crystal dark
  for(let x=LAMP/2;x<PER;x+=LAMP){const y=sh+28;c.fillStyle=rad(c,x,y-30,0,40,[[0,rgba('#000000',.5)],[1,rgba('#000000',0)]]);c.fillRect(x-40,y-70,80,80);
    c.strokeStyle='#0a0a0d';c.lineWidth=2.2;c.beginPath();c.moveTo(x-14,y-24);c.quadraticCurveTo(x-14,y-13,x,y-13);c.lineTo(x,y-9);c.stroke();
    c.fillStyle=C.goldD;c.fillRect(x-5,y-10,10,2.2);c.fillRect(x-4,y+9,8,2);c.strokeStyle=rgba(C.gold,.8);c.lineWidth=.99;c.beginPath();for(const kx of [-4.5,-1.5,1.5,4.5]){c.moveTo(x+kx,y-8);c.lineTo(x+kx*.8,y+9);}c.stroke();
    c.fillStyle='#14262a';c.beginPath();c.moveTo(x,y-6);c.lineTo(x+3.4,y);c.lineTo(x,y+6);c.lineTo(x-3.4,y);c.closePath();c.fill();}
  // their light up the wall (upLight, above; the lamps past the repeat's ends lend theirs over the joins)
  for(let x=LAMP/2-LAMP;x<PER+LAMP;x+=LAMP)upLight(c,x,sh+28);
  lit(cv,c,0,PER);
  WT={sc,cv,blur:smear(cv,22*sc,true),y0,h};return WT;}
// the vault over the wall: the rings going on over toward us, leaning as they come, the brick between them in its soot; made once a
// scale at half the wall's (it is dim, and smeared at speed). live() lays it on up over the wall as far as the view goes (an upright
// phone sees a long way up), each repeat a ring's lean further on and a little darker.
const VH=150,VLEAN=PSX/PSY;
let VT=null;
function vaultTile(k){const sc=bucket(k)*.5;if(VT&&VT.sc===sc)return VT;
  const bt=EnvTex.brick(13,{base:'#2e1a14',alt:'#1e100c',hot:'#3a2018',mortar:'#0a0706'});if(!bt||bt.width<16)return null;
  const y1=-12,y0=y1-VH,cv=mk(PER,VH,sc),c=cv.getContext('2d'),r=rng(17);c.scale(sc,sc);c.translate(0,-y0);
  c.fillStyle=patAt(c,bt,0,0,1/6);c.fillRect(0,y0,PER,VH);c.fillStyle=rgba('#020203',.3);c.fillRect(0,y0,PER,VH);
  // soot in long stains along the line, where the engines' breath has gone over it for a century
  for(let i=0;i<10;i++){const y=lerp(y0,y1,r()),L=120+r()*360,x=r()*PER;c.fillStyle=rgba('#000000',.18+.18*r());c.fillRect(x,y,L,2+r()*5);c.fillRect(x-PER,y,L,2+r()*5);}
  const s=VH*VLEAN;for(let x=40;x<PER+s+40;x+=140){const xa=x-26,xb=x-14;
    c.fillStyle='#0f1218';c.beginPath();c.moveTo(xa,y1);c.lineTo(xb,y1);c.lineTo(xb-s+3,y0);c.lineTo(xa-s-3,y0);c.closePath();c.fill();
    c.strokeStyle=rgba('#7a8aa8',.12);c.lineWidth=1;c.beginPath();c.moveTo(xb,y1);c.lineTo(xb-s+3,y0);c.stroke();
    c.strokeStyle=rgba('#000000',.5);c.lineWidth=1.51;c.beginPath();for(let u=0;u<1;u+=.04){const yy=lerp(y1,y0,u),xx=lerp(xa,xa-s-3,u);c.moveTo(xx,yy);c.lineTo(xx+12+u*6,yy);}c.stroke();}
  c.fillStyle=rgba('#010102',.1);c.fillRect(0,y0,PER,VH);
  // the first course over the wall again, with the lamps' light going on up into it (upLight)
  const cv0=mk(PER,VH,sc),c0=cv0.getContext('2d');c0.drawImage(cv,0,0);c0.scale(sc,sc);c0.translate(0,-y0);for(let x=LAMP/2-LAMP;x<PER+LAMP;x+=LAMP)upLight(c0,x,yS()+28);
  VT={sc,cv,blur:smear(cv,11*sc,true),l0:{cv:cv0,blur:smear(cv0,11*sc,true)},y0,h:VH};return VT;}
// the far rail along the deck's far edge: posts in their pockets and a top rail, the car's lantern on its hook (made once a scale)
let RT=null;
function railTile(k){const sc=bucket(k);if(RT&&RT.sc===sc)return RT;
  const x0=REAR-20,x1=1180,a=q(0,GB,DF),y0=a.y-44,y1=a.y+3,cv=mk(x1-x0,y1-y0,sc),c=cv.getContext('2d');c.scale(sc,sc);c.translate(-x0,-y0);
  for(let x=REAR+4;x<DX1;x+=64){const p=q(x,GB,LANTERN.d);c.fillStyle='#0b0b10';c.fillRect(p.x-1.8,p.y-24,3.6,24);c.fillStyle=rgba(C.goldD,.85);c.fillRect(p.x-2.4,p.y-24.5,4.8,2.4);c.fillStyle=rgba('#8a94b0',.16);c.fillRect(p.x+1,p.y-22,.7,20);}
  const L=q(REAR+2,GB,LANTERN.d),R=q(DX1,GB,LANTERN.d);c.strokeStyle='#121218';c.lineWidth=2.2;c.beginPath();c.moveTo(L.x,L.y-22);c.lineTo(R.x,R.y-22);c.stroke();
  c.strokeStyle=rgba(C.gold,.5);c.lineWidth=.99;c.beginPath();c.moveTo(L.x,L.y-23.2);c.lineTo(R.x,R.y-23.2);c.stroke();
  for(const Ln of LANTERNS){const p=q(Ln.x,GB,Ln.d);c.strokeStyle='#14141a';c.lineWidth=1.51;c.beginPath();c.moveTo(p.x,p.y-22);c.lineTo(p.x+4,p.y-31);c.stroke();
    c.fillStyle='#16120c';c.fillRect(p.x+1,p.y-41,8,10);c.fillStyle=C.goldD;c.fillRect(p.x,p.y-42,10,2);c.fillRect(p.x+2,p.y-31,6,1.4);c.fillStyle=rgba('#ffe7b0',.9);c.fillRect(p.x+3,p.y-39,4,6);}
  lit(cv,c,x0,x1,true);
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
      c.fillStyle=rgba('#000000',.16);c.fill();c.strokeStyle=rgba(C.gold,.42);c.lineWidth=1.01;c.stroke();}
    // the station's name, twice, on black enamel
    for(const cx of [270,630]){const x=a+cx,y=fy(98);c.fillStyle='#09090b';c.fillRect(x-76,y,152,21);c.strokeStyle=rgba(C.gold,.85);c.lineWidth=1;c.strokeRect(x-74,y+2,148,17);
      c.fillStyle=rgba('#ffffff',.04);c.fillRect(x-76,y,152,6);gilt(c,'LAMPLIGHT  STREET',x,y+14.6,10.5,{style:'700',track:1});}
    // torn posters, faded
    for(const [cx,col] of [[60,'#4a2a28'],[120,'#2a3040'],[380,'#5a4a2a'],[520,'#3a2230'],[780,'#2a3a30'],[840,'#4a3a26']]){const x=a+cx-17,y=fy(96);
      c.fillStyle=col;c.fillRect(x,y,34,46);c.fillStyle=rgba('#d8cfb0',.12);c.beginPath();c.arc(x+17,y+17,9,0,TAU);c.fill();c.fillRect(x+5,y+31,24,1.6);c.fillRect(x+7,y+35,20,1.2);c.fillRect(x+9,y+39,16,1.2);
      c.fillStyle=rgba('#000000',.3);c.fillRect(x,y,34,46);c.fillStyle='#5e5442';c.beginPath();c.moveTo(x+34,y+46);c.lineTo(x+34,y+30-r()*10);c.lineTo(x+22-r()*8,y+46);c.closePath();c.fill();
      c.strokeStyle=rgba(C.goldD,.8);c.lineWidth=1.5;c.strokeRect(x-1,y-1,36,48);}}
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
    c.strokeStyle=rgba(C.gold,.4);c.lineWidth=1.01;c.beginPath();c.moveTo(a.x,a.y+3);c.lineTo(b.x,b.y+3);c.stroke();c.fillStyle=rgba(C.gold,.5);for(let u=.1;u<1;u+=.2)c.fillRect(lerp(a.x,b.x,u)-.5,lerp(a.y,b.y,u)-.5,1,1);}
  {const p=q(450,GB-150,262);c.strokeStyle='#0c0c10';c.lineWidth=1.51;c.beginPath();c.moveTo(p.x,y0);c.lineTo(p.x,p.y-12);c.stroke();
    c.fillStyle='#0a0a0c';c.beginPath();c.arc(p.x,p.y,12.5,0,TAU);c.fill();c.fillStyle='#b8ae90';c.beginPath();c.arc(p.x,p.y,10.5,0,TAU);c.fill();c.fillStyle=rgba('#000000',.25);c.beginPath();c.arc(p.x+1,p.y+1,10.5,0,TAU);c.fill();
    c.strokeStyle=C.gold;c.lineWidth=1.2;c.beginPath();c.arc(p.x,p.y,11.6,0,TAU);c.stroke();c.fillStyle='#1a1410';for(let i=0;i<12;i++){const an=i/12*TAU;c.fillRect(p.x+Math.cos(an)*8.8-.5,p.y+Math.sin(an)*8.8-.5,1,1);}
    c.strokeStyle='#14100c';c.lineCap='round';c.lineWidth=1.51;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x-4.6,p.y-3.4);c.moveTo(p.x,p.y);c.lineTo(p.x+1.4,p.y-7.6);c.stroke();c.lineCap='butt';}
  for(const L of STN_LAMPS){const p=q(L.x,GB-L.h,L.d),top=q(L.x,GB-178,L.d);c.strokeStyle='#0c0c10';c.lineWidth=1.51;c.beginPath();c.moveTo(p.x,top.y);c.lineTo(p.x,p.y-10);c.stroke();
    c.fillStyle=C.goldD;c.fillRect(p.x-5,p.y-11,10,2.2);c.fillRect(p.x-4,p.y+8,8,2);c.strokeStyle=rgba(C.gold,.8);c.lineWidth=1.01;c.beginPath();for(const kx of [-4.5,-1.5,1.5,4.5]){c.moveTo(p.x+kx,p.y-9);c.lineTo(p.x+kx*.8,p.y+8);}c.stroke();
    c.fillStyle=L.lit?C.cyanL:'#14262a';c.beginPath();c.moveTo(p.x,p.y-6);c.lineTo(p.x+3.4,p.y);c.lineTo(p.x,p.y+6);c.lineTo(p.x-3.4,p.y);c.closePath();c.fill();
    if(L.lit){glow(c,p.x,p.y+4,110,'#ffcf86',.24);glow(c,p.x,p.y,22,C.cyan,.5);}}
  c.restore();
  // the platform's near part, in front of the wall's line, its coping, and the end of it
  flags(PE,WD);
  {const a=q(0,GB,PE),b=q(STN_L,GB,PE);c.fillStyle='#1c1812';c.fillRect(a.x,a.y,b.x-a.x,12);c.fillStyle=rgba('#d8cfb0',.25);c.fillRect(a.x,a.y,b.x-a.x,.9);
    const e=[q(STN_L,GB,PE),q(STN_L,GB,WD),q(STN_L,GB+BED,WD),q(STN_L,GB+BED,PE)];c.fillStyle='#120f0c';c.beginPath();e.forEach(p=>c.lineTo(p.x,p.y));c.closePath();c.fill();
    c.strokeStyle=rgba('#d8cfb0',.2);c.lineWidth=1.01;c.beginPath();c.moveTo(e[0].x,e[0].y);c.lineTo(e[1].x,e[1].y);c.stroke();}
  // the side of the recess at its start, facing down the line
  {const P=[q(0,GB,WD),q(0,GB,SD),q(0,y0+SD*PSY,SD),q(0,y0+WD*PSY,WD)];c.fillStyle=patAt(c,EnvTex.brick(13,{base:'#2e1a14',alt:'#1e100c',hot:'#3a2018',mortar:'#0a0706'}),0,0,1/6);
    c.beginPath();P.forEach(p=>c.lineTo(p.x,p.y));c.closePath();c.fill();c.fillStyle=lin(c,0,y0,0,yO,[[0,rgba('#010101',.95)],[1,rgba('#060404',.55)]]);c.fill();
    c.strokeStyle=rgba('#ffcf86',.18);c.lineWidth=1;c.beginPath();c.moveTo(P[3].x+.5,P[3].y);c.lineTo(P[0].x+.5,P[0].y);c.stroke();}
  // the warm air of the place
  c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,0,fy(160),0,yO+40,[[0,rgba('#ffcf86',0)],[.6,rgba('#ffcf86',.035)],[1,rgba('#ffcf86',0)]]);c.fillRect(oL,fy(160),oR-oL,yO+40-fy(160));c.restore();
  lit(cv,c,x0,x1,true);
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
  lit(cv,c,0,w,true);
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
function warm(k,force){if(force){WT=VT=RT=ST=PS=SMK=LG=PL=null;}if(k==null)k=(typeof cv!=='undefined'&&typeof cam!=='undefined'&&cam&&cam.viewW)?cv.width/cam.viewW:2;wallTile(k);vaultTile(k);railTile(k);stnSprite(k);passSprite(k);smokeBand();lampSprite(k);poolSprite(k);}

// ---------- the scene ----------
function paint(c){const X0=-160,X1=W+260,T0=-140;
  try{warm();}catch(e){}
  c.fillStyle='#030304';c.fillRect(X0,T0,X1-X0+120,E.FOOT-T0);
  deck(c);
  // the car's lantern: its light on the deck rides with the car
  c.save();floorT(c,0);c.beginPath();c.rect(X0,DN,X1-X0,DF-DN);c.clip();c.globalCompositeOperation='lighter';
  for(const Ln of LANTERNS){c.fillStyle=rad(c,Ln.x,DF-14,0,230,[[0,rgba('#ffc070',.14)],[.4,rgba('#ffc070',.05)],[1,rgba('#ffc070',0)]]);c.fillRect(Ln.x-230,DN,460,DF-DN);}c.restore();}
// where things stand along the line (world x, from where the line starts); on the screen at depth 0 a thing is at its x less S.scroll
const lampAt=i=>i*LAMP+LAMP/2,lampOn=i=>hash(i)>.16,passAt=i=>i*PASS+900;
function cisAt2(xw,m){const Cs=S.cistern;return!!Cs&&xw>=Cs.x0-(m||0)&&xw<=Cs.x1+(m||0);}
// (no old station comes by the cistern: one in its tunnels either side is left out, its lamps and all, since V105)
function stnAt(xw,m){m=m||0;const i=Math.floor((xw-STN_AT+m)/STN);if(i<0)return null;const s=i*STN+STN_AT;if(cisAt2(s+STN_L/2,1600))return null;return xw>=s-m&&xw<=s+STN_L+m?s:null;}
function live(){const t=S.t,v=Math.abs(S.scrollV||0),s0=S.scroll||0,sh=yS(),wb=yWB(),df=yDF(),Tr=ctx.getTransform(),k=Math.hypot(Tr.a,Tr.b)||1;
  const vx0=-Tr.e/Tr.a-80,vx1=(ctx.canvas.width-Tr.e)/Tr.a+80,blurA=clamp((v-150)/500,0,1),ox=WD*PSX;
  const WT0=wallTile(k),CSw=cisSpan(s0,WD);
  // (where the line is over the old cistern the tunnel is not: its span is left out of the wall, the vault and the bed beyond the car)
  ctx.save();ctx.beginPath();ctx.rect(vx0,-400,vx1-vx0,df+400);if(CSw&&CSw.b>vx0&&CSw.a<vx1)ctx.rect(CSw.a,-400,CSw.b-CSw.a,df+400);ctx.clip('evenodd');
  // the wall, the made repeat set down at the train's distance as often as it takes; smeared as the speed comes up
  if(WT0){let x=ox-frac(s0/PER)*PER;while(x>vx0)x-=PER;
    for(;x<vx1;x+=PER){if(blurA<1)ctx.drawImage(WT0.cv,x,WT0.y0,PER+.6,WT0.h);if(blurA>0){ctx.globalAlpha=blurA;ctx.imageSmoothingEnabled=false;ctx.drawImage(WT0.blur,x,WT0.y0,PER+.6,WT0.h);ctx.imageSmoothingEnabled=true;ctx.globalAlpha=1;}}}
  else{ctx.fillStyle='#0a0606';ctx.fillRect(vx0,sh-130,vx1-vx0,wb-sh+130);}
  // the vault over it, on up as far as the view goes
  {const V=vaultTile(k),vy0=Math.max(-400,-Tr.f/Tr.d-20);if(V)for(let j=0,yb=V.y0+V.h;yb>vy0&&j<6;j++,yb-=V.h){const y=yb-V.h,sx=j*V.h*VLEAN;let x=ox-sx-frac(s0/PER)*PER;while(x>vx0)x-=PER;
      const T=j?V:V.l0;for(;x<vx1;x+=PER){if(blurA<1)ctx.drawImage(T.cv,x,y,PER+.6,V.h+.6);if(blurA>0){ctx.globalAlpha=blurA;ctx.drawImage(T.blur,x,y,PER+.6,V.h+.6);ctx.globalAlpha=1;}}
      if(j){ctx.fillStyle=rgba('#020203',Math.min(.3,.075*j));ctx.fillRect(vx0,y,vx1-vx0,V.h+.6);}}}
  // a dead lamp's light taken out of the wall and the vault again (upLight, made into them)
  {const i0=Math.floor((s0+vx0-ox-UP.r-90)/LAMP),i1=Math.ceil((s0+vx1-ox+UP.r)/LAMP);
    for(let i=i0;i<=i1;i++){if(lampOn(i))continue;const xw=lampAt(i);if(stnAt(xw,40)!=null||cisAt2(xw,200))continue;upLight(ctx,xw-s0+ox,sh+28,true);}}
  // the strip of track bed at the wall's foot beyond the car, streaming by
  // (in the light on the fight: the near black it was, as that light leaves it)
  ctx.fillStyle='#131c1a';ctx.fillRect(vx0,wb-1,vx1-vx0,df-wb+1);
  {const r=rng(3),span=1500;for(let i=0;i<30;i++){const x=-300+frac(r()-s0/span)*span,L=4+r()*10+v*.03;ctx.fillStyle=rgba('#4a4238',.18+.2*r());ctx.fillRect(x,wb+1+r()*(df-wb-2),L,.8);}}
  // side passages: a dark arched mouth, a light far down it, eyes in some
  {const i0=Math.floor((s0+vx0-ox-112-900)/PASS),i1=Math.floor((s0+vx1-ox-900)/PASS)+1,P=passSprite(k);
    if(P)for(let i=i0;i<=i1;i++){const xw=passAt(i);if(stnAt(xw,120)!=null||cisAt2(xw,160))continue;const x=xw-s0+ox;if(x+P.w<vx0||x>vx1)continue;
      if(blurA<1)ctx.drawImage(P.cv,x,P.y0,P.w,P.h);if(blurA>0){ctx.globalAlpha=blurA;ctx.imageSmoothingEnabled=false;ctx.drawImage(P.blur,x,P.y0,P.w,P.h);ctx.imageSmoothingEnabled=true;ctx.globalAlpha=1;}
      if(blurA<.6&&hash(i+.5)<.45){const ey=wb-74+hash(i+.3)*36,ex=x+30+hash(i+.9)*40;ctx.fillStyle='#d8e04a';ctx.fillRect(ex,ey,1.8,1.1);ctx.fillRect(ex+4,ey,1.8,1.1);glow(ctx,ex+2,ey,6,'#d8e04a',.3);}}}
  // the old station going by
  {const i0=Math.max(0,Math.floor((s0+vx0-STN_L-80-STN_AT)/STN)),i1=Math.floor((s0+vx1-STN_AT)/STN);
    if(i1>=i0){const SP=stnSprite(k);if(SP)for(let i=i0;i<=i1;i++){const x=i*STN+STN_AT-s0;if(x+SP.x0+SP.w<vx0||x+SP.x0>vx1||cisAt2(i*STN+STN_AT+STN_L/2,1600))continue;
      if(blurA<1)ctx.drawImage(SP.cv,x+SP.x0,SP.y0,SP.w,SP.h);if(blurA>0){ctx.globalAlpha=blurA;ctx.imageSmoothingEnabled=false;ctx.drawImage(SP.blur,x+SP.x0,SP.y0,SP.w,SP.h);ctx.imageSmoothingEnabled=true;ctx.globalAlpha=1;}}}}
  // mile plates: gilt numbers on black, a gold smear at speed
  {const i0=Math.floor((s0+vx0-ox-620)/PLATE),i1=Math.floor((s0+vx1-ox-620)/PLATE)+1;for(let i=i0;i<=i1;i++){const xw=i*PLATE+620;if(stnAt(xw,60)!=null||cisAt2(xw,60))continue;const x=xw-s0+ox;if(x<vx0-40||x>vx1)continue;
    if(blurA<.5){ctx.fillStyle='#08080a';ctx.fillRect(x,sh+96,26,15);ctx.strokeStyle=rgba(C.gold,.7);ctx.lineWidth=.8;ctx.strokeRect(x+1.5,sh+97.5,23,12);gilt(ctx,String(1+((i%9)+9)%9),x+13,sh+107.6,10,{style:'700'});}
    else{ctx.fillStyle=lin(ctx,x-14,0,x+40,0,[[0,rgba('#08080a',0)],[.3,rgba('#08080a',.7)],[.7,rgba('#08080a',.7)],[1,rgba('#08080a',0)]]);ctx.fillRect(x-14,sh+96,54,15);ctx.fillStyle=rgba(C.gold,.22);ctx.fillRect(x-10,sh+102,46,2);}}}
  // the lamps flash by: each crystal lit, its light on the brick round it; a streak behind it at speed
  {const i0=Math.floor((s0+vx0-ox-200)/LAMP),i1=Math.ceil((s0+vx1-ox+200)/LAMP),LS=lampSprite(k);
    for(let i=i0;i<=i1;i++){const xw=lampAt(i);if(!lampOn(i)||stnAt(xw,40)!=null||cisAt2(xw,60))continue;const x=xw-s0+ox,y=sh+28;if(x<vx0-100||x>vx1+100)continue;
      ctx.globalCompositeOperation='lighter';ctx.imageSmoothingEnabled=false;ctx.drawImage(LS.cv,x-LS.R,y-4-LS.R,2*LS.R,2*LS.R);ctx.imageSmoothingEnabled=true;ctx.globalCompositeOperation='source-over';
      const L=Math.min(70,v*.06);if(L>4){ctx.fillStyle=lin(ctx,x,0,x+L,0,[[0,rgba(C.cyanL,.55)],[1,rgba(C.cyanL,0)]]);ctx.fillRect(x,y-1.6,L,3.2);}
      ctx.fillStyle=C.cyanL;ctx.beginPath();ctx.moveTo(x,y-6);ctx.lineTo(x+3.4,y);ctx.lineTo(x,y+6);ctx.lineTo(x-3.4,y);ctx.closePath();ctx.fill();}}
  // the signals on their brackets at the spring of the vault: a red lamp, one in three green, going by in a streak at speed; and the
  // car's own lantern lighting the wall it passes, a warm pool that rides with the car while the brick streams through it (since V90:
  // between the lamps the wall and the vault over the fight were one dark smear)
  {const i0=Math.floor((s0+vx0-ox-80)/SIG),i1=Math.ceil((s0+vx1-ox+80)/SIG),y=sh-14;
    for(let i=i0;i<=i1;i++){const xw=i*SIG;if(stnAt(xw,60)!=null||cisAt2(xw,60))continue;const x=xw-s0+ox;if(x<vx0-80||x>vx1+80)continue;const col=hash(i+.21)<.34?'#5aff9a':'#ff4a3a';
      ctx.fillStyle='#08080b';ctx.fillRect(x-4.5,y-10,9,20);ctx.fillRect(x-1.2,y+10,2.4,12);ctx.fillRect(x-6,y-11,12,2.6);
      ctx.globalCompositeOperation='lighter';glow(ctx,x,y-3,56,col,.12);glow(ctx,x,y-3,22,col,.42);const L=Math.min(60,v*.05);if(L>4){ctx.fillStyle=lin(ctx,x,0,x+L,0,[[0,rgba(col,.45)],[1,rgba(col,0)]]);ctx.fillRect(x,y-4.4,L,2.8);}
      ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y-3,2.5,0,TAU);ctx.fill();ctx.globalCompositeOperation='source-over';}}
  for(const Ln of LANTERNS){const p=q(Ln.x,GB,WD),cy=(sh+wb)/2,fl=.9+.1*Math.sin(t*9+Ln.x)*Math.sin(t*3.7);ctx.save();ctx.globalCompositeOperation='lighter';ctx.translate(p.x,cy);ctx.scale(1.6,1);
    ctx.fillStyle=rad(ctx,0,0,0,150,[[0,rgba('#ffc070',.13*fl)],[.45,rgba('#ffb060',.05*fl)],[1,rgba('#ffb060',0)]]);ctx.fillRect(-150,-150,300,300);ctx.restore();}
  ctx.restore();
  // the old cistern's hall where the line crosses it (since V105)
  cisBack(ctx,vx0,vx1,s0,t);
  // their light thrown across the deck, sliding past with them; the station's, broad and warm, as it goes by
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.imageSmoothingEnabled=false;
  {const PLs=poolSprite(k),pool=(x,P)=>{if(x+P.x0+P.w<vx0||x+P.x0>vx1)return;ctx.drawImage(P.cv,x+P.x0,P.y0,P.w,P.h);};
    const i0=Math.floor((s0+vx0-200)/LAMP),i1=Math.ceil((s0+vx1+200)/LAMP);
    for(let i=i0;i<=i1;i++){const xw=lampAt(i);if(!lampOn(i)||stnAt(xw,40)!=null||cisAt2(xw,60))continue;pool(xw-s0-12,PLs.lamp);}
    const s=stnAt(s0+(vx0+vx1)/2,STN_L);if(s!=null)for(const L of STN_LAMPS){if(L.lit)pool(s+L.x-s0,PLs.stn);}}
  ctx.restore();
  // the far rail, the car's lantern lit on it
  {const R=railTile(k);ctx.drawImage(R.cv,R.x0,R.y0,R.w,R.h);for(const Ln of LANTERNS){const p=q(Ln.x,GB,Ln.d),fl=.85+.15*Math.sin(t*9+Ln.x)*Math.sin(t*3.7);
    glow(ctx,p.x+5,p.y-36,56,'#ffc070',.42*fl);glow(ctx,p.x+5,p.y-36,10,'#fff0c8',.85*fl);}}
  // the engine's breath streaming back overhead, and the dust and grit of the tunnel going past at three depths
  {const B=smokeBand(),y=sh-104;let x=-frac((s0*.42+t*14)/B.SW)*B.SW-300;ctx.globalAlpha=.45;ctx.imageSmoothingEnabled=false;for(;x<vx1;x+=B.SW)if(x+B.SW>vx0)ctx.drawImage(B.cv,x,y,B.SW+.5,B.H2);ctx.imageSmoothingEnabled=true;ctx.globalAlpha=1;}
  {const r=rng(5),span=1500;for(const [f,n,y0,y1,a0,w0] of [[.7,24,sh,df,.07,.7],[1,20,sh+60,GB-20,.09,.9],[1.4,12,GB-120,GB+30,.12,1.3]]){
      for(let i=0;i<n;i++){const x=-300+frac(r()-s0*f/span)*span,y=lerp(y0,y1,r()),a=a0*(.5+r()),L=Math.min(46,1+v*.032*f*(.6+r()));
        ctx.fillStyle=rgba(i%4?'#c8bca8':'#cfe8ff',a);ctx.fillRect(x,y,L,w0);}}}
  // the line in front of the car, streaming by into the dark toward us: the near road's ballast, its sleepers in their beat, its two
  // rails glinting; smeared as the speed comes up (an upright phone's push-in shows it under the fight)
  {const gy=GB+43,Y0=gy+4,Y1=E.FOOT,ph=frac(s0/28)*28,sa=1-blurA*.75,CSn=cisSpan(s0,-90);ctx.save();
    if(CSn&&CSn.b>vx0&&CSn.a<vx1){ctx.beginPath();ctx.rect(vx0-300,Y0-20,vx1-vx0+600,Y1-Y0+40);ctx.rect(CSn.a,Y0-20,CSn.b-CSn.a,Y1-Y0+40);ctx.clip('evenodd');}
    ctx.fillStyle=lin(ctx,0,Y0,0,Y1,[[0,'#1e1b17'],[.4,'#1a1713'],[1,'#14120f']]);ctx.fillRect(vx0,Y0,vx1-vx0,Y1-Y0);
    ctx.save();ctx.transform(1,0,PSX,-PSY,0,gy);
    {const r=rng(17),span=1400;for(let i=0;i<90;i++){const x=-300+frac(r()-s0/span)*span,d=-8-r()*(-8-E.NEAR),L=2+r()*5+v*.05;ctx.fillStyle=rgba(r()<.5?'#5a5044':'#3a342e',.3+.35*r());ctx.fillRect(x,d,L,1+r()*1.4);}}
    ctx.fillStyle=rgba('#33261a',.9*sa);for(let x=vx0-200-ph;x<vx1+120;x+=28)ctx.fillRect(x,-168,7.5,122);
    if(blurA>0){ctx.fillStyle=rgba('#33261a',.4*blurA);ctx.fillRect(vx0-200,-168,vx1-vx0+320,122);}
    for(const d of [-62,-152]){ctx.fillStyle='#0a0a0d';ctx.fillRect(vx0-200,d-1.6,vx1-vx0+320,3.2);ctx.fillStyle=rgba('#b8c4dc',.32);ctx.fillRect(vx0-200,d+1,vx1-vx0+320,.7);}
    ctx.restore();
    ctx.fillStyle=lin(ctx,0,Y0,0,Y1,[[0,rgba('#000000',.08)],[.3,rgba('#000000',.22)],[1,rgba('#000000',.36)]]);ctx.fillRect(vx0,Y0,vx1-vx0,Y1-Y0);ctx.restore();}
  // the line behind the car's tail, the trestle over the cistern, the trolley on the line behind and its crew, the dark down the line
  // over them, the tail itself (since V105)
  behind(ctx,vx0,vx1,s0,v,t);trestle(ctx,vx0,vx1,s0,t);trolley(ctx,S.trolley,t,s0);lineDark(ctx,vx0,vx1,s0);tail(ctx,t);
  // under the car's near side: the tops of its wheels turning, sparks off them when it runs hard
  {const yb=q(0,GB,DN).y+SILL,wa=s0/12,CSu=cisSpan(s0,30);ctx.save();ctx.beginPath();ctx.rect(Math.max(vx0,REAR),yb,vx1-Math.max(vx0,REAR),60);ctx.clip();
    // (behind them the bed under the car, in its shadow: the near road's ballast going by, darker up under the sill)
    {const yt=GB+47;ctx.save();if(CSu&&CSu.b>vx0&&CSu.a<vx1){ctx.beginPath();ctx.rect(vx0-300,yb-5,vx1-vx0+600,70);ctx.rect(CSu.a,yb-5,CSu.b-CSu.a,70);ctx.clip('evenodd');}
      ctx.fillStyle=lin(ctx,0,yb,0,yt,[[0,'#08080a'],[1,'#17140f']]);ctx.fillRect(vx0,yb,vx1-vx0,yt-yb);
      const r=rng(23),span=1400;for(let i=0;i<70;i++){const x=-300+frac(r()-s0/span)*span,y=lerp(yb+4,yt,Math.sqrt(r())),L=2+r()*4+v*.04;ctx.fillStyle=rgba(r()<.5?'#4a4238':'#2e2a25',.25+.3*r());ctx.fillRect(x,y,L,.9+r()*.9);}ctx.restore();}
    for(let x=-188;x<1100;x+=150){for(const dx of [0,46]){const cx=x+dx,cy=yb+13;if(cx<vx0-20||cx>vx1+20||cx<REAR+16)continue;
      ctx.fillStyle='#09090c';ctx.beginPath();ctx.arc(cx,cy,12,0,TAU);ctx.fill();ctx.strokeStyle=C.goldD;ctx.lineWidth=1.48;ctx.beginPath();ctx.arc(cx,cy,10.6,0,TAU);ctx.stroke();
      if(v<260){ctx.strokeStyle='#24242e';ctx.lineWidth=1.2;ctx.beginPath();for(let k2=0;k2<6;k2++){const b=wa+k2*TAU/6;ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(b)*9.5,cy+Math.sin(b)*9.5);}ctx.stroke();}
      else{ctx.strokeStyle=rgba('#8a94b0',.22);ctx.lineWidth=.99;ctx.beginPath();ctx.arc(cx,cy,6.5,0,TAU);ctx.stroke();}
      ctx.strokeStyle=rgba(C.goldL,.65);ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(cx,cy,10.6,-Math.PI*.64,-Math.PI*.4);ctx.stroke();}
      if(x+52>REAR)ctx.fillStyle='#0c0c10',ctx.fillRect(Math.max(x-6,REAR),yb,x+52-Math.max(x-6,REAR),4);}
    if(v>300){const r=rng(Math.floor(t*24)),n=Math.floor(v/220);ctx.globalCompositeOperation='lighter';
      for(let i=0;i<n;i++){if(r()>.4){r();r();continue;}const x=-188+Math.floor(r()*8)*150+(r()<.5?0:46)-6,y=yb+24;if(x<vx0||x>vx1)continue;glow(ctx,x,y,16,'#ffb050',.45);
        for(let j=0;j<5;j++){const L=6+r()*18,an=Math.PI+.15+r()*.5;ctx.strokeStyle=rgba(r()<.5?'#ffd27a':'#fff3cf',.75);ctx.lineWidth=.99;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(an)*L,y-Math.sin(an)*L*.5-r()*6);ctx.stroke();}}
      ctx.globalCompositeOperation='source-over';}
    ctx.restore();}
  brakeGear(ctx,t);}
// ---------- the car's tail, and the line behind it (since V105) ----------
// The flatcar's tail is in the picture: its deck ends at REAR (the game's LINE_REAR), and behind it the line goes away into the dark,
// its bed 43 under the deck (RTOP) with its sleepers in their beat and its two rails (TRK: the car's own). On the tail: the end beam's
// two buffers, the coupling hook, a red tail lamp at the near corner, its light on the line behind. Behind it, from the line's second
// turn, the goblins' trolley (S.trolley); where the line crosses the old cistern, the trestle instead of the bed.
const REAR=typeof LINE_REAR!=='undefined'?LINE_REAR:-30,RTOP=typeof LINE_RT!=='undefined'?LINE_RT:GB+43,TRK=[16,170],DX1=1160;
// the deck and its near side on the screen (what is behind the tail or under the car is drawn outside it: notDeck)
function deckPath(c){const a=q(REAR,GB,DN),b=q(REAR,GB,DF),e=q(DX1,GB,DF),f=q(DX1,GB,DN);
  c.moveTo(a.x,a.y+SILL);c.lineTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineTo(e.x,e.y);c.lineTo(f.x,f.y);c.lineTo(f.x,f.y+SILL);c.closePath();}
function notDeck(c,vx0,vx1){c.beginPath();c.rect(vx0-500,-3000,vx1-vx0+1000,6000);deckPath(c);c.clip('evenodd');}
// the line behind the tail: the bed (outside the cistern) with its stones and sleepers going by, the two rails standing on it, the
// tail lamp's red on it near the car (the dark down the line is laid over it, and over the trolley coming up it, afterwards: lineDark)
function behind(c,vx0,vx1,s0,v,t){const a=q(REAR,GB,DN);if(vx0>a.x+DF*PSX)return;const blurA=clamp((v-150)/500,0,1),Cs=S.cistern;
  // (the bed's stretches out of the cistern, in the bed's own x)
  const runs=[];{let x=vx0-120;const xe=REAR;if(Cs){const p=Cs.x0-s0,r=Cs.x1-s0;if(p>x)runs.push([x,Math.min(p,xe)]);if(r<xe)runs.push([Math.max(r,x),xe]);}else runs.push([x,xe]);}
  c.save();notDeck(c,vx0,vx1);c.beginPath();c.rect(vx0-500,-3000,a.x+DF*PSX-vx0+500,6000);c.clip();
  for(const [x0,x1] of runs){if(x1<=x0)continue;
    c.save();c.transform(1,0,PSX,-PSY,0,RTOP);c.fillStyle='#16130f';c.fillRect(x0,-10,x1-x0,WD+10);
    {const r=rng(19),span=1300;for(let i=0;i<90;i++){const x=vx0-120+frac(r()-s0/span)*span,d=-8+r()*(WD+8),L=2+r()*5+v*.04;if(x<x0||x>x1)continue;c.fillStyle=rgba(r()<.5?'#5a5044':'#3a342e',.25+.3*r());c.fillRect(x,d,L,1+r()*1.4);}}
    const ph=frac(s0/28)*28;c.fillStyle=rgba('#33261a',.9*(1-blurA*.75));for(let x=vx0-160-ph;x<x1;x+=28){if(x+7.5<x0)continue;c.fillRect(Math.max(x,x0),TRK[0]-16,Math.min(7.5,x1-x),TRK[1]-TRK[0]+32);}
    if(blurA>0){c.fillStyle=rgba('#33261a',.4*blurA);c.fillRect(x0,TRK[0]-16,x1-x0,TRK[1]-TRK[0]+32);}
    c.restore();
    for(const d of TRK){const p0=q(x0,RTOP-4,d),p1=q(x1,RTOP-4,d);c.fillStyle='#0a0a0d';c.fillRect(p0.x,p0.y,p1.x-p0.x,4.6);c.fillStyle=rgba('#b8c4dc',.3);c.fillRect(p0.x,p0.y,p1.x-p0.x,1.2);}}
  // the tail lamp's light on what is behind the car
  {const f=.88+.12*Math.sin(t*5.1)*Math.sin(t*1.3+2);c.save();c.globalCompositeOperation='lighter';c.transform(1,0,PSX,-PSY,0,RTOP);
    c.fillStyle=rad(c,REAR-24,40,0,170,[[0,rgba('#ff4030',.16*f)],[.45,rgba('#ff4030',.05*f)],[1,rgba('#ff4030',0)]]);c.fillRect(REAR-200,-20,200,WD);c.restore();}
  c.restore();}
// the dark down the line behind the car, over the bed and whatever is on it (the trolley comes up out of it); a little way back from
// the tail, so what happens just behind the car is seen; not over the cistern, whose hall has its own light
function lineDark(c,vx0,vx1,s0){const a=q(REAR,GB,DN),x1=a.x+DF*PSX;if(vx0>x1)return;c.save();notDeck(c,vx0,vx1);
  const Cs=S.cistern;if(Cs){c.beginPath();c.rect(vx0-600,-3000,x1-vx0+700,6000);cisPath(c,Cs.x0-s0,Cs.x1-s0);c.clip('evenodd');}
  c.fillStyle=lin(c,REAR-580,0,REAR-190,0,[[0,rgba('#020203',.96)],[.6,rgba('#020203',.5)],[1,rgba('#020203',0)]]);c.fillRect(vx0-500,yDF()-60,x1-vx0+500,E.FOOT-yDF()+60);
  c.restore();}
// the car's tail: the end beam's two buffers out behind the deck, the coupling hook hanging between them, and the tail lamp at the near
// corner, its red lens to the line behind
function tail(c,t){
  for(const d of [40,146]){const p=q(REAR,GB+9,d);c.fillStyle='#121218';c.fillRect(p.x-13,p.y-4.5,13,9);c.fillStyle=rgba('#8a94b0',.24);c.fillRect(p.x-13,p.y-4.5,13,1.2);
    c.fillStyle='#1c1c24';c.beginPath();c.ellipse(p.x-13,p.y-1,2.8,7.2,.25,0,TAU);c.fill();c.strokeStyle=rgba(C.goldD,.85);c.lineWidth=1.5;c.stroke();}
  {const p=q(REAR,GB+11,93);c.strokeStyle='#121218';c.lineWidth=3;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x-14,p.y+1);c.stroke();
    c.strokeStyle='#22222a';c.lineWidth=2.2;c.beginPath();c.arc(p.x-17,p.y+3.4,3.6,-Math.PI*.2,Math.PI*1.3);c.stroke();}
  {const p=q(REAR-1,GB+4,DN+4),f=.88+.12*Math.sin(t*5.1)*Math.sin(t*1.3+2);c.fillStyle='#09090b';c.fillRect(p.x-6,p.y-7,7.5,13);c.fillStyle=rgba(C.goldD,.75);c.fillRect(p.x-6,p.y-7,7.5,1.5);
    c.fillStyle=rgba('#ff3a2a',.95*f);c.fillRect(p.x-8,p.y-4,2.4,7);glow(c,p.x-7,p.y-.5,24,'#ff3a2a',.5*f);glow(c,p.x-7.5,p.y-.5,6,'#ffb4a4',.75*f);}}
// the goblins' trolley: a deck of planks on four iron wheels on the line's rails, an A frame either side of its middle and the walking
// beam across them with a handle bar at each end, the stolen lamp swinging under the pivot, and its crew (drawn goblins: the game
// poses them, here they are drawn as the fight's own are, at their depth). Everything of it through the game's trolleyXf, so it goes
// over as the game says; the crew it throws off are drawn where the game has them (g.fling).
function trolley(c,T,t,s0){if(!T||T.state==='gone'||typeof trolleyXf!=='function')return;const TD=TROLLEY,xf=trolleyXf(T),dy=trolleyDeckY(),L=TD.L,H=TD.hw,D=TD.dep,B=trolleyBeam(T);
  const at=(x,y,dz)=>{const w=xf(x,y);return q(w.x,w.y,D+(dz||0));};
  c.save();c.lineJoin='round';
  if(!T.flipA&&!T.flipY){c.save();c.transform(1,0,PSX,-PSY,0,RTOP);c.fillStyle=rgba('#000000',.42);c.fillRect(T.x-L/2-4,D-H-2,L+8,2*H+4);c.restore();}
  const wa=s0/TD.wr;
  const wheel=(lx,dz)=>{const p=at(T.x+lx,RTOP-TD.wr,dz),r=TD.wr;c.fillStyle='#0b0b0e';c.beginPath();c.arc(p.x,p.y,r,0,TAU);c.fill();c.strokeStyle=rgba(C.goldD,.6);c.lineWidth=1.5;c.beginPath();c.arc(p.x,p.y,r-1.6,0,TAU);c.stroke();
    c.strokeStyle='#2a2a32';c.lineWidth=1.5;c.beginPath();for(let k=0;k<3;k++){const b=wa+k*TAU/3+(T.flipA||0);c.moveTo(p.x,p.y);c.lineTo(p.x+Math.cos(b)*(r-2.4),p.y+Math.sin(b)*(r-2.4));}c.stroke();};
  wheel(-L/2+18,H-8);wheel(L/2-18,H-8);
  // the deck: its planks across, their ends ragged, the frame's near beam under them
  {const P=[at(T.x-L/2,dy,-H),at(T.x+L/2,dy,-H),at(T.x+L/2,dy,H),at(T.x-L/2,dy,H)];poly(c,P,'#3a2a1a');
    c.fillStyle=lin(c,0,P[2].y,0,P[0].y,[[0,rgba('#000000',.35)],[1,rgba('#000000',0)]]);poly(c,P);c.fill();
    c.strokeStyle=rgba('#000000',.55);c.lineWidth=1.5;c.beginPath();for(let k=1;k<7;k++){const x=T.x-L/2+L*k/7,a=at(x,dy,-H),b=at(x,dy,H);c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);}c.stroke();
    const N=[at(T.x-L/2,dy,-H),at(T.x+L/2,dy,-H),at(T.x+L/2,dy+8,-H),at(T.x-L/2,dy+8,-H)];poly(c,N,'#22170d');line(c,[N[0],N[1]],rgba('#c89a5a',.35),1.5);
    // the tail lamp's red on its front edge
    {const a=at(T.x+L/2,dy,-H),b=at(T.x+L/2,dy,H);line(c,[a,b],rgba('#ff5a40',.4),1.5);}}
  // the two A frames, and the beam's axle across between them
  for(const dz of [-24,24]){const f0=at(T.x-14,dy,dz),f1=at(T.x+14,dy,dz),top=at(B.pv.x,B.pv.y,dz);c.strokeStyle='#17171d';c.lineWidth=3.2;c.beginPath();c.moveTo(f0.x,f0.y);c.lineTo(top.x,top.y);c.lineTo(f1.x,f1.y);c.stroke();
    c.strokeStyle=rgba('#8a94b0',.22);c.lineWidth=1.5;c.beginPath();c.moveTo(f0.x+1,f0.y);c.lineTo(top.x+1,top.y);c.stroke();}
  {const a=at(B.pv.x,B.pv.y,-26),b=at(B.pv.x,B.pv.y,26);line(c,[a,b],'#2a2a32',3);}
  // the beam rocking on its pivot, a handle bar across each end
  {const a=at(B.back.x,B.back.y,0),b=at(B.front.x,B.front.y,0);c.strokeStyle='#2c2c36';c.lineWidth=4;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
    c.strokeStyle=rgba(C.goldD,.6);c.lineWidth=1.5;c.beginPath();c.moveTo(a.x,a.y-1.6);c.lineTo(b.x,b.y-1.6);c.stroke();
    for(const e of [B.back,B.front]){const u=at(e.x,e.y,-22),w=at(e.x,e.y,22);line(c,[u,w],'#202028',3);}
    const p=at(B.pv.x,B.pv.y,0);c.fillStyle=C.goldD;c.beginPath();c.arc(p.x,p.y,3,0,TAU);c.fill();}
  // the stolen lamp: a crystal in a cage of bent wire, swinging under the pivot
  {const sw=Math.sin(t*4.1)*.35,h=at(B.pv.x,B.pv.y+2,0),lx=h.x+Math.sin(sw)*12,ly=h.y+Math.cos(sw)*12,k=T.lamp*(.85+.15*Math.sin(t*13));
    c.strokeStyle='#1a1a20';c.lineWidth=1.5;c.beginPath();c.moveTo(h.x,h.y);c.lineTo(lx,ly-4);c.stroke();
    glow(c,lx,ly,40,'#9cf5c8',.35*k);c.fillStyle=rgba('#d8fff0',.95*k);c.beginPath();c.moveTo(lx,ly-5);c.lineTo(lx+3,ly);c.lineTo(lx,ly+5);c.lineTo(lx-3,ly);c.closePath();c.fill();
    c.strokeStyle=rgba(C.goldD,.85);c.lineWidth=1.5;c.beginPath();c.moveTo(lx-4,ly-5);c.lineTo(lx-4,ly+5);c.moveTo(lx+4,ly-5);c.lineTo(lx+4,ly+5);c.stroke();}
  // its crew at their places on it
  crew(c,T,false);
  wheel(-L/2+18,-H+8);wheel(L/2-18,-H+8);
  c.restore();
  // and those it has thrown off
  crew(c,T,true);}
// (behind the car's tail: the car's deck and its near side, nearer, hide whatever of them is over it)
function crew(c,T,flung){if(typeof drawFighter!=='function')return;const Tr=c.getTransform(),vx0=-Tr.e/Tr.a-80,vx1=(c.canvas.width-Tr.e)/Tr.a+80;
  for(const g of T.crew){if(g.hidden||!!g.fling!==flung)continue;c.save();notDeck(c,vx0,vx1);c.translate(g.dep*PSX,-g.dep*PSY);try{drawFighter(g);}catch(e){}c.restore();}}
// the car's brake gear under its near side: the train pipe along under the sole bar, and the hose down from it, black rubber with a
// brass coupling, to the cylinder on the bogie's frame; cut, its ends whip, and the air goes out of it in a white blast (S.brakeCut,
// the game's)
function brakeGear(c,t){const B=S.brakeCut||{},X=typeof BRAKE!=='undefined'?BRAKE:{x:236,y:GB+30,dep:-8};const d=DN+2,top=q(X.x-30,GB+SILL+1,d),end=q(X.x+90,GB+SILL+1,d);
  c.strokeStyle='#1a1a20';c.lineWidth=3;c.beginPath();c.moveTo(top.x,top.y);c.lineTo(end.x,end.y);c.stroke();
  {const p=q(X.x+12,GB+36,d);c.fillStyle='#141418';c.fillRect(p.x-7,p.y-5,14,10);c.fillStyle=rgba(C.goldD,.6);c.fillRect(p.x-7,p.y-5,14,1.5);}
  const a=q(X.x,GB+SILL+1,d),b=q(X.x+6,GB+31,d);
  if(B.cut==null){c.strokeStyle='#202026';c.lineWidth=3.2;c.beginPath();c.moveTo(a.x,a.y);c.quadraticCurveTo(a.x-5,(a.y+b.y)/2,b.x,b.y);c.stroke();
    const m={x:lerp(a.x,b.x,.5)-2,y:lerp(a.y,b.y,.5)};c.fillStyle=C.goldD;c.fillRect(m.x-2.5,m.y-2,5,4);return;}
  const u=t-B.cut,w=Math.exp(-u*3)*Math.sin(u*38)*14,e={x:a.x-14+w*1.4,y:a.y+14+Math.abs(w)*.3};
  c.strokeStyle='#202026';c.lineWidth=3.2;c.beginPath();c.moveTo(a.x,a.y);c.quadraticCurveTo(a.x-6+w,a.y+8,e.x,e.y);c.stroke();
  c.beginPath();c.moveTo(b.x,b.y);c.quadraticCurveTo(b.x+4-w*.4,b.y-6,b.x+10-w*.6,b.y-4);c.stroke();
  // the air going out of it, white, in a blast that fades
  if(u<1.4){const k=1-u/1.4;c.save();c.globalCompositeOperation='lighter';
    for(let i=0;i<9;i++){const ph=frac(t*5+i/9),L=8+56*ph,an=Math.PI*.6+Math.sin(t*31+i*1.7)*.3;c.fillStyle=rgba('#e8f4f8',.3*k*(1-ph));c.beginPath();c.arc(e.x+Math.cos(an)*L,e.y+Math.sin(an)*L*.5,3+ph*13,0,TAU);c.fill();}c.restore();}
  if(u<.25){c.save();c.globalCompositeOperation='lighter';for(let i=0;i<6;i++){const an=-Math.PI*.2-i*.35,L=6+18*(u/.25);c.strokeStyle=rgba('#ffd27a',.8*(1-u/.25));c.lineWidth=1.5;c.beginPath();c.moveTo(a.x,a.y+10);c.lineTo(a.x+Math.cos(an)*L,a.y+10+Math.sin(an)*L);c.stroke();}c.restore();}}

// ---------- the cistern (since V105) ----------
// Where the line crosses the old cistern (S.cistern: x0 to x1 along the line), the tunnel's wall, its bed and the road beside it give
// way to a great flooded hall: black water a long way under the track (WY), a row of brick piers standing in it with an old crystal
// lamp on one here and there, its light in a long broken streak on the water, the street's light coming down in gold shafts through
// the drains' gratings far up in the vault, mist over the water; and the line goes over it on a timber trestle, a bent of posts and
// braces standing in the water every CW.sec. Behind the car's tail each section of the trestle goes down as the car leaves it
// (falls[k], the game's: when), and its timbers float where it went in; the hall's near wall (where the tunnel comes in) shows its face
// beyond the tunnel's own far wall.
const CW=typeof CIS!=='undefined'?CIS:{sec:80,water:150},WY=()=>RTOP+CW.water;
const PIERS=[{d:480,per:250,w:46,o:60,lamp:2},{d:760,per:300,w:42,o:190,lamp:3}],SHAFTS={per:520,o:250,d:455};
// the hall's span on the screen: from the tunnel's far wall at its near end to its far end, and down past the picture's foot
function cisPath(c,xa,xb){const top=-3000;c.moveTo(xa+WD*PSX,top);c.lineTo(xb+WD*PSX,top);c.lineTo(xb+WD*PSX,yDF());c.lineTo(xb,GB);c.lineTo(xb-400*PSX,E.FOOT+400);
  c.lineTo(xa-400*PSX,E.FOOT+400);c.lineTo(xa,GB);c.lineTo(xa+WD*PSX,yDF());c.closePath();}
// the cistern's swell, a picture made once: long broken crests catching the haze and dark troughs between, wandering, laid along the
// water (its x along the line, its y the depth going away); no two parts of it alike, so it does not repeat in the picture
let SWELL=null;
function swellTex(){if(SWELL)return SWELL;if(typeof EnvTex==='undefined'||!EnvTex.pix)return null;const T=EnvTex,n=T.noise2(4411,64),m=T.noise2(4419,64);
  SWELL=T.pix(512,256,(u,v,o)=>{const w=T.fbm(m,u*2.2,v*3,3),s=Math.sin((v*140+w*9+T.fbm(n,u*7,v*30,3)*4)*Math.PI),k=T.fbm(n,u*16,v*70,2);
    if(s>.45){o[0]=156;o[1]=202;o[2]=214;o[3]=Math.round((s-.45)/.55*(.3+.7*k)*58);}
    else if(s<-.35){o[0]=2;o[1]=5;o[2]=7;o[3]=Math.round((-s-.35)/.65*(.35+.65*k)*100);}
    else o[3]=0;});
  return SWELL;}
function cisBack(c,vx0,vx1,s0,t){const Cs=S.cistern;if(!Cs)return;const W0=WY(),xa=Cs.x0-s0,xb=Cs.x1-s0,top=-3000;
  if(xb+1200*PSX<vx0||xa-400*PSX>vx1)return;
  c.save();notDeck(c,vx0,vx1);c.beginPath();cisPath(c,xa,xb);c.clip();
  // the hall's air: cold, a little lighter far off where the haze holds the lamps' light
  c.fillStyle=lin(c,0,-400,0,E.FOOT,[[0,'#0c1a20'],[.45,'#09141a'],[1,'#05090c']]);c.fillRect(vx0-500,top,vx1-vx0+1000,E.FOOT+3000);
  // the water: black-green under us, taking the haze's light as it goes away; its slow swell in long lines of light, cold, and here
  // and there warm from the shafts
  c.save();c.transform(1,0,PSX,-PSY,0,W0);
  c.fillStyle=lin(c,0,-500,0,1300,[[0,'#060c0f'],[.28,'#0a171c'],[.6,'#10232b'],[1,'#18323b']]);c.fillRect(xa,-500,xb-xa,1800);
  // (the swell all over it, made once and laid on its plane in one draw: without it the far water, lit by the haze, lay flat on a
  // phone, where the finish has no grain: a flat lit patch over 15% of the trestle's frame at V105's review)
  {const SW=swellTex();if(SW)c.drawImage(SW,xa,-500,xb-xa,1800);}
  // (its swell: long dark troughs and lit crests, broken, in their thousands far off and a few near, rocking slowly)
  {const r=rng(71),n=Math.max(1,xb-xa);for(let i=0;i<240;i++){const x=xa+frac(r()+.004*Math.sin(t*.35+i))*n,d=-420+r()*1500,L=14+r()*70,w=r(),dk=r()<.45;if(x+L>xb)continue;
      if(dk){c.fillStyle=rgba('#020507',.2+.18*r());c.fillRect(x,d,L*1.4,2.2+r()*2.4);}
      else{c.fillStyle=rgba(w<.22?'#e8cc90':'#9ccad6',.06+.12*r());c.fillRect(x,d+Math.sin(t*.8+i)*.8,L,1.4);}}}
  c.restore();
  // the piers: the row going away, each a brick shaft standing in the water up out of the picture, lit down one side, its foot wet and
  // dark, a ring of ripples round it; now and then an old lamp on one, its light in a long broken streak on the water
  const BT=EnvTex.brick(13,{base:'#3e2418',alt:'#28160e',hot:'#4e2c1e',mortar:'#0a0706'});
  for(let rI=1;rI>=0;rI--){piers(c,PIERS[rI],Cs,vx0,vx1,s0,t,BT,W0);if(rI===1)shafts(c,Cs,vx0,vx1,s0,t,W0);}
  // mist lying on the water, thickest far off
  {c.save();c.transform(1,0,PSX,-PSY,0,W0-6);c.fillStyle=lin(c,0,-100,0,1300,[[0,rgba('#9ac0cc',0)],[.2,rgba('#9ac0cc',.06)],[.7,rgba('#9ac0cc',.1)],[1,rgba('#9ac0cc',.05)]]);c.fillRect(xa,-100,xb-xa,1400);c.restore();}
  // the hall's near wall, where the tunnel comes in: its face beyond the tunnel's far wall and under its bed, lit along its edge
  {const BC=EnvTex.brick(14,{base:'#3a2418',alt:'#28160e',hot:'#4a2c1e',mortar:'#120c08'}),fx=xa;c.save();
    const P=[q(fx,top,WD-10),q(fx,top,WD+260),q(fx,W0,WD+260),q(fx,W0,-420),q(fx,RTOP+8,-420),q(fx,RTOP+8,WD-10)];
    c.beginPath();P.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fillStyle=BC&&BC.width>16?patAt(c,BC,0,0,1/6):'#2a1810';c.fill();
    c.fillStyle=rgba('#030204',.66);c.fill();
    line(c,[q(fx,top,WD-10),q(fx,RTOP+8,WD-10)],rgba('#c8a070',.22),1.5);line(c,[q(fx,RTOP+8,WD-10),q(fx,RTOP+8,-420)],rgba('#c8a070',.18),1.5);c.restore();}
  c.restore();}
function piers(c,R,Cs,vx0,vx1,s0,t,BT,W0){const i0=Math.ceil((Math.max(Cs.x0+40,s0+vx0-R.d*PSX-R.w-80)-R.o)/R.per),i1=Math.floor((Math.min(Cs.x1-40-R.w,s0+vx1-R.d*PSX+80)-R.o)/R.per);
  for(let i=i0;i<=i1;i++){const x=i*R.per+R.o-s0,b0=q(x,W0,R.d),b1=q(x+R.w,W0,R.d);
    const far=R.d>600,yTop=-3000;
    c.fillStyle=BT&&BT.width>16?patAt(c,BT,b0.x,0,1/6):'#2a1810';c.fillRect(b0.x,yTop,R.w,b0.y-yTop);c.fillStyle=rgba('#03050a',far?.72:.5);c.fillRect(b0.x,yTop,R.w,b0.y-yTop);
    // lit down its far side by the hall's haze, its wet foot dark, the ripples round it
    c.fillStyle=lin(c,b0.x,0,b1.x,0,[[0,rgba('#000000',.35)],[.7,rgba('#000000',0)],[1,rgba('#9ab8c4',far?.06:.12)]]);c.fillRect(b0.x,yTop,R.w,b0.y-yTop);
    c.fillStyle=lin(c,0,b0.y-50,0,b0.y,[[0,rgba('#000000',0)],[1,rgba('#000000',.55)]]);c.fillRect(b0.x,b0.y-50,R.w,50);
    c.strokeStyle=rgba('#9ab8c4',far?.08:.16);c.lineWidth=1.5;c.beginPath();c.ellipse(b0.x+R.w/2,b0.y+1,R.w*.7,R.w*.12,0,0,TAU);c.stroke();
    // its reflection under it, broken by the swell
    if(!far){c.fillStyle=rgba('#020406',.32);for(let k=0;k<9;k++){const yy=b0.y+3+k*7,o=Math.sin(t*1.3+k*1.7+i)*2.2,w=R.w*(1-k*.06);c.fillRect(b0.x+(R.w-w)/2+o,yy,w,5);}}
    // an old lamp on one in so many, and its light on the shaft and in the water
    if(R.lamp&&((i%R.lamp)+R.lamp)%R.lamp===1){const ly=b0.y-74,lx=b0.x+R.w+4,f=.8+.2*Math.sin(t*2.3+i),on=hash(i+.77)>.2;
      c.fillStyle='#0c0c10';c.fillRect(lx-2,ly-12,8,3);c.fillStyle=rgba(on?C.cyanL:'#2a4a4a',.9);c.beginPath();c.moveTo(lx+2,ly-8);c.lineTo(lx+5,ly-2);c.lineTo(lx+2,ly+4);c.lineTo(lx-1,ly-2);c.closePath();c.fill();
      if(on){glow(c,lx+2,ly-2,far?44:70,C.cyan,.4*f);c.save();c.globalCompositeOperation='lighter';
        // the streak of it in the water, broken by the swell
        for(let k=0;k<14;k++){const yy=b0.y+4+k*7,w=6+k*1.8+Math.sin(t*2+k+i)*3;c.fillStyle=rgba(C.cyan,.16*(1-k/14)*f);c.fillRect(lx+2-w/2+Math.sin(t*3.1+k*1.3)*2,yy,w,2);}
        c.restore();}}}}
// the street's light coming down into the hall through the gratings of the drains far up in its vault: long gold shafts slanting down
// onto the water, a pool where each comes down and its broken streak toward us, dust turning in it
function shafts(c,Cs,vx0,vx1,s0,t,W0){const i0=Math.ceil((Cs.x0+80-SHAFTS.o)/SHAFTS.per),i1=Math.floor((Cs.x1-80-SHAFTS.o)/SHAFTS.per);if(i1<i0)return;
  c.save();c.globalCompositeOperation='lighter';
  for(let i=i0;i<=i1;i++){const x=i*SHAFTS.per+SHAFTS.o-s0,f=q(x,W0,SHAFTS.d);if(f.x<vx0-300||f.x>vx1+300)continue;
    const fl=.85+.15*Math.sin(t*.8+i*2.3),top=f.y-1100,dx=-160,cxAt=y=>f.x+dx*(f.y-y)/(f.y-top),wAt=y=>lerp(46,16,(f.y-y)/(f.y-top));
    c.fillStyle=lin(c,0,top,0,f.y,[[0,rgba('#ffc070',0)],[.5,rgba('#ffc070',.05*fl)],[1,rgba('#ffc070',.13*fl)]]);
    c.beginPath();c.moveTo(cxAt(top)-wAt(top),top);c.lineTo(cxAt(top)+wAt(top),top);c.lineTo(f.x+46,f.y);c.lineTo(f.x-46,f.y);c.closePath();c.fill();
    c.fillStyle=rgba('#ffc070',.14*fl);c.beginPath();c.ellipse(f.x,f.y,56,12,0,0,TAU);c.fill();c.fillStyle=rgba('#ffe2a8',.2*fl);c.beginPath();c.ellipse(f.x,f.y,24,5,0,0,TAU);c.fill();
    for(let k=0;k<10;k++){const yy=f.y+6+k*8,w=32-k*2.2+Math.sin(t*2.2+k*1.7+i)*6;c.fillStyle=rgba('#ffc070',.11*(1-k/10)*fl);c.fillRect(f.x-w/2+Math.sin(t*1.7+k)*3,yy,w,2);}
    for(let k=0;k<9;k++){const ph=frac(t*.05+k*.137+i*.31),y=lerp(f.y-420,f.y-12,ph),x=cxAt(y)+Math.sin(t*.5+k*2.1)*wAt(y)*.7;c.fillStyle=rgba('#fff2d0',.35*Math.sin(ph*Math.PI));c.fillRect(x,y,1.6,1.6);}}
  c.restore();}
// the trestle: from the hall's near wall to its far one, a bent of three posts every CW.sec standing in the water, braced across, a cap
// on them, the two stringers along under the rails, the sleepers and the rails; behind the tail, a section that has gone is drawn going
// down (its span tipping and dropping, its bent folding over) and then the splash and the rings where it went in, and its timbers
// floating there after
function trestle(c,vx0,vx1,s0,t){const Cs=S.cistern;if(!Cs)return;const W0=WY(),sec=CW.sec,n=Math.floor((Cs.x1-Cs.x0)/sec),FD=.8;
  const k0=Math.max(0,Math.floor((s0+vx0-Cs.x0-200)/sec)),k1=Math.min(n-1,Math.ceil((s0+vx1-Cs.x0+60)/sec));if(k1<k0)return;
  c.save();notDeck(c,vx0,vx1);
  for(let k=k0;k<=k1;k++){const xw=Cs.x0+k*sec,x=xw-s0,ft=Cs.falls[k],u=ft==null?0:(t-ft)/FD;
    // its timbers floating where it went in, turning slowly, lifting on the swell
    if(u>1){const r=rng(300+k),fade=clamp((u-1)/.4,0,1);for(let j=0;j<3;j++){const fx=x+sec/2+(r()-.5)*90+(u-1)*FD*(r()-.5)*12,fd=30+r()*120,bob=Math.sin(t*1.6+j+k)*1.5,p=q(fx,W0-2+bob,fd),L=18+r()*26,an=(r()-.5)*1.2+Math.sin(t*.4+k+j)*.08;
        c.save();c.globalAlpha=fade;c.translate(p.x,p.y);c.rotate(an*.35);c.fillStyle='#2a1c10';c.fillRect(-L/2,-2.5,L,5);c.fillStyle=rgba('#a07a4a',.3);c.fillRect(-L/2,-2.5,L,1.2);
        c.strokeStyle=rgba('#cfe4ec',.14);c.lineWidth=1.2;c.beginPath();c.ellipse(0,2.5,L*.62,3,0,0,TAU);c.stroke();c.restore();}}
    if(u>2.4)continue;
    const dr=u>0?Math.min(1,u)*Math.min(1,u)*(W0-RTOP+30):0,rot=u>0?Math.min(1,u)*(k%2?.5:-.38):0,lean=u>0?Math.min(1.2,Math.pow(Math.min(1,u*1.2),1.6)*1.2):0;
    // the bent at this section's near end: three posts down into the water, an X of braces between, a cap across their tops
    if(u<1.05){const fold=d=>{const yb=W0,yt=RTOP+10;const px=x+Math.sin(-lean)*(yb-yt),py=yb-Math.cos(lean)*(yb-yt);return{top:q(px,py,d),foot:q(x,yb,d)};};
      const posts=[10,93,176].map(d=>fold(d));c.strokeStyle='#1c130b';c.lineWidth=5;c.lineCap='round';c.beginPath();for(const p of posts){c.moveTo(p.top.x,p.top.y);c.lineTo(p.foot.x,p.foot.y);}c.stroke();
      c.strokeStyle=rgba('#c09060',.24);c.lineWidth=1.5;c.beginPath();for(const p of posts){c.moveTo(p.top.x+2,p.top.y);c.lineTo(p.foot.x+2,p.foot.y);}c.stroke();
      c.strokeStyle='#160f08';c.lineWidth=2.6;c.beginPath();const m=(p,f)=>({x:lerp(p.top.x,p.foot.x,f),y:lerp(p.top.y,p.foot.y,f)});
      for(let j=0;j<2;j++){const A=posts[j],Bp=posts[j+1];for(const [f0,f1] of [[.12,.62],[.62,.12]]){const a=m(A,f0),b=m(Bp,f1);c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);}}c.stroke();
      // the goblins' work: the posts gnawed through low down
      c.fillStyle='#050403';for(const p of posts){const g=m(p,.82);c.beginPath();c.ellipse(g.x,g.y,3.4,1.6,0,0,TAU);c.fill();}
      line(c,[posts[0].top,posts[2].top],'#24180e',4);
      // the ripples where the posts stand in the water
      if(!u){c.strokeStyle=rgba('#9ac0cc',.14);c.lineWidth=1.2;for(const p of posts){c.beginPath();c.ellipse(p.foot.x,p.foot.y+1,9,2.2,0,0,TAU);c.stroke();}}}
    // the span: the stringers, the sleepers across them, the rails on them
    if(u<1.05){const cx=x+sec/2,cy=RTOP+dr*.5;
      const sp=(lx,ly,d)=>{const ca=Math.cos(rot),sa=Math.sin(rot),X=cx+(lx-sec/2)*ca-(ly)*sa,Y=cy+(lx-sec/2)*sa+(ly)*ca+dr*.5;return q(X,Y,d);};
      for(const d of TRK){const a=sp(0,10,d),b=sp(sec,10,d),a2=sp(0,18,d),b2=sp(sec,18,d);poly(c,[a,b,b2,a2],'#20160c');}
      for(let j=0;j<3;j++){const lx=6+j*26;const a=sp(lx,2,-4),b=sp(lx,2,DF+4),e=sp(lx+8,2,DF+4),f=sp(lx+8,2,-4);poly(c,[a,b,e,f],'#33261a');line(c,[a,f],rgba('#c09060',.28),1.5);}
      for(const d of TRK){const a=sp(0,-3,d),b=sp(sec,-3,d);line(c,[a,b],'#0a0a0d',3.6);line(c,[sp(0,-4.4,d),sp(sec,-4.4,d)],rgba('#b8c4dc',.3),1.5);}}
    // where it went in: the column of the splash and its spray, and the rings going out
    if(u>.9){const k2=(u-.9)/1.5,p=q(x+sec/2,W0,93);c.strokeStyle=rgba('#cfe4ec',.5*(1-k2));c.lineWidth=1.5;for(const s of [1,.62,.3]){c.beginPath();c.ellipse(p.x,p.y,(14+70*k2)*s,(14+70*k2)*s*.28,0,0,TAU);c.stroke();}
      // (the crown: water thrown up in sheets and streaks round where it went in, falling back in drops)
      if(k2<.5){const e=k2/.5,r=rng(500+k),tt=e*1.1;c.lineCap='round';
        c.fillStyle=rgba('#cfe4ec',.16*(1-e));c.beginPath();c.ellipse(p.x,p.y-2,16+e*30,5+e*6,0,0,TAU);c.fill();
        for(let j=0;j<18;j++){const a=-Math.PI/2+(r()-.5)*1.5,v=70+r()*110,x0=p.x+(r()-.5)*22,vx=Math.cos(a)*v,vy=Math.sin(a)*v;
          const x1=x0+vx*tt,y1=p.y+vy*tt+300*tt*tt,x2=x0+vx*Math.max(0,tt-.12),y2=p.y+vy*Math.max(0,tt-.12)+300*Math.max(0,tt-.12)**2;if(y1>p.y+2)continue;
          c.strokeStyle=rgba('#e4f2f8',.55*(1-e));c.lineWidth=1.5+r()*1.2;c.beginPath();c.moveTo(x2,y2);c.lineTo(x1,y1);c.stroke();c.fillStyle=rgba('#f2fbff',.7*(1-e));c.fillRect(x1-1,y1-1,2.2,2.2);}}}}
  c.restore();}
// the cistern's span on the screen at a depth
function cisSpan(s0,d){const Cs=S.cistern;return Cs?{a:Cs.x0-s0+d*PSX,b:Cs.x1-s0+d*PSX}:null;}
// the light that rims a fighter: the station's lamps while it goes by, the nearest lamp passing if one is close, else the car's lantern
function light(f){const x=f.p[PEL].x,s0=S.scroll||0,sh=yS(),s=stnAt(x+s0,60);
  if(s!=null){let best=null,bd=1e9;for(const L of STN_LAMPS){if(!L.lit)continue;const d=Math.abs(s+L.x-s0-x);if(d<bd){bd=d;best=L;}}const p=q(s+best.x-s0,GB-best.h,best.d);return{light:{x:p.x-f.dep*PSX,y:p.y+f.dep*PSY},col:'#a6f2e8'};}
  const i=Math.round((x+s0-LAMP/2)/LAMP),lx=lampAt(i)-s0;
  if(lampOn(i)&&Math.abs(lx-x)<170)return{light:{x:lx+WD*PSX-f.dep*PSX,y:sh+28+f.dep*PSY},col:'#a6f2e8'};
  const p=q(LANTERN.x+5,GB-36,LANTERN.d);return{light:{x:p.x-f.dep*PSX,y:p.y+f.dep*PSY},col:'#ffc070'};}
// the light on the fight (the style guide's rule 8, sk_scene_glue.js): the passing lamps' cyan on the flatcar and the tunnel's walls
// round the fight, laid into the layer (the deck) and into the made pictures that go by (lit, above)
const SET={col:'#bcf5ee',soft:1,gain:1.3,air:.04,y:[GB-360,GB-280,GB-60,GB+20],x:[-400,2400]};
E.S.tunnel={set:SET,ground:.26,paint,live,light,warm,LAYOUT:{REAR,DN,DF,WD,BED,SPR,SILL,deckY:GB,railTop:GB-24,railDep:LANTERN.d,lantern:LANTERN,STN,STN_AT,STN_L,SIG,lampAt,lampOn,stnAt}};
})();
// ===== ENV TUNNEL END =====
