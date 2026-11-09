// ===== ENV HIGHWAY =====
// The Tower Road (since V101): the raised highway from the old city to the tower district, at night. Our deck runs across the picture
// between its two parapets, four lanes of wet asphalt under sodium lamps on the far parapet; past the far parapet the deck's edge and
// the drop to the city far below, its streets and roofs going by slowly, and over it the skyline with the Hallowell tower far off to
// the left, where the riders are going. The near parapet's outer face is at the picture's foot, the drop again under it.
// The set piece at the start: the ramp down from the interchange high on the right, bending toward the camera across the drop on its
// piers and round onto our far lanes (where it runs is the game's, RAMP and hwyBez in sk_highway.js), and the parking garage beyond
// the drop inside its bend, its top deck as high as the ramp's top, the rail the riders come through. Both are painted once and go
// away to the right with the road once the riders are on the straight (S.scroll). The ramp is built as the highway is (since V110,
// paintRamp): its slab on bents of two columns, parapets as the far one with their rails and its lamps, its joints; its two lanes run
// on as the highway's third and fourth, its lines onto the highway's, where its own paint gives way to the road's; the far parapet
// ends at its foot, its inner parapet taking it over, and east of that the highway is its two near lanes behind a barrier, the gore
// between them and the ramp with an impact cushion at its nose. Its markings lie still on it, as the road's do (since V107). The
// bands (the skyline, the city below, the far parapet, the road, the near parapet, the drop) are each painted once into a strip that
// repeats and is slid along by S.scroll at its own pace, as the avenue's are (env_chase.js).
(()=>{const E=EnvLook,{C,lin,rad,rgba,mix,glow,haze,stars,moon,cloudBank,skyline,hallTower,rng,lerp,clamp,TAU}=E;
// ---------- the deck ----------
// depths on the floor: the near parapet's face (NP) and its back (NP1), the road between the edge lines (EL0, EL1), the lane lines,
// the far parapet's face (FP) and its back (FP1); the lamps on the far parapet every LP along it
const NP=-26,NP1=-14,EL0=-6,EL1=228,LANES=[52,114,176],FP=236,FP1=246,PH=34,NPH=30,LP=300,LAMP0=30;
const yG=d=>GB-d*PSY;
// the bands, back to front: the length after which each repeats (P), how fast it goes by as a share of the riders' speed (f) and the
// rows it covers. The ramp and the garage go between them (live). The far parapet's band holds the parapet alone: its lamps stand
// up out of it over a lot of empty sky, so each is put down on its own (POST), and the band is a quarter of the height it was.
const BAND={sky:{P:3000,f:.06,y0:-40,y1:200},city:{P:2400,f:.28,y0:110,y1:300},far:{P:1200,f:1,y0:226,y1:300},road:{P:1200,f:1,y0:286,y1:496},
  near:{P:1200,f:1,y0:452,y1:506},drop:{P:2400,f:.28,y0:500,y1:1010,lo:.5}};
const ORDER=['sky','city','far','road','near','drop'];
// (the tower's needle and its glow stay under the layer's top row, which an upright phone's view draws on up over the sky)
const MOON={x:300,y:-12,r:10},TOWER={x:120,base:176,top:-14,w:46};
// ---------- the ramp's shape (the game's, else the same copied here) ----------
const RP=()=>typeof RAMP!=='undefined'?RAMP:[[820,-40],[905,220],[905,341.75],[610,341.75]];
function bez(s){if(typeof hwyBez==='function')return hwyBez(s);const u=1-s,a=u*u*u,b=3*u*u*s,c=3*u*s*s,d=s*s*s,P=RP();
  return{X:a*P[0][0]+b*P[1][0]+c*P[2][0]+d*P[3][0],Y:a*P[0][1]+b*P[1][1]+c*P[2][1]+d*P[3][1],
    tx:3*u*u*(P[1][0]-P[0][0])+6*u*s*(P[2][0]-P[1][0])+3*s*s*(P[3][0]-P[2][0]),ty:3*u*u*(P[1][1]-P[0][1])+6*u*s*(P[2][1]-P[1][1])+3*s*s*(P[3][1]-P[2][1])};}
const kOf=dep=>typeof hwyK==='function'?hwyK(dep):clamp(1-(dep-236)/540,.34,1);
// a point of the ramp in the picture: s along it (below 0 it goes on straight up out of the picture), off across it
function rampPt(s,off){let P;if(s<0){const P0=bez(0),L=Math.hypot(P0.tx,P0.ty)||1;P={X:P0.X+P0.tx/L*s*300,Y:P0.Y+P0.ty/L*s*300,tx:P0.tx,ty:P0.ty};}else P=bez(s);
  const L=Math.hypot(P.tx,P.ty)||1,nx=-P.ty/L,ny=P.tx/L,k=kOf((GB-P.Y)/PSY);return{x:P.X+nx*off*k,y:P.Y+ny*off*k*.62,k,nx,ny,P};}
// across it (rampPt's off, + toward the inside of its bend): its edge lines at RE (since V110, asked for: at its foot on the highway's
// lane line at depth 114 and its far edge line at 228, its two lanes running on as the highway's third and fourth; from V107 they lay
// on the lines at 52 and 176), the faces of its parapets at RW (the inner one at its foot on the far parapet's line, which it takes
// over); how high its parapets stand and how deep its slab is (each shrinking with the distance, k); where it runs (S_LO to S_HI) and
// the stretch at its foot over which its own paint gives way to the road's (S_FADE to S_HI)
const RE=69,RW=79,RPH=34,SLAB=22,S_LO=-.04,S_HI=1,S_FADE=.9;
// East of its foot the highway is its own two near lanes (since V110): behind a barrier (its face at depth HB, as high as the far
// parapet) with the drop beyond, which parts from the ramp's outer parapet at the gore's nose, where the gap between the lane line at
// 114 and the ramp's outer edge has opened to GAP across (S_NOSE along the ramp); the gore before that is paved and chevroned, and an
// impact cushion stands in front of the nose. The far parapet ends at the ramp's foot (XF: the picture's x), where the ramp's inner
// parapet takes it over and climbs away with it round the bend.
const HB=118,GAP=26;
function sOuterAt(d){let lo=0,hi=1;for(let i=0;i<32;i++){const m=(lo+hi)/2,dd=(GB-rampPt(m,-RE).y)/PSY;if(dd>d)lo=m;else hi=m;}return(lo+hi)/2;}
let S_NOSE=null;const sNose=()=>S_NOSE??(S_NOSE=sOuterAt(HB+GAP));
const XF=()=>rampPt(S_HI,RW).x,LAMP_ON=30;
const sst=u=>u*u*(3-2*u);
// the garage: its top deck's edge (the rail's foot) and its levels down to where the far parapet hides them, its two ends
const GAR={x0:180,x1:766,top:70,lev:100,k:.45};
// the set pieces' boxes in the world (what each canvas holds)
const SP={back:{x0:160,x1:1140,y0:-50,y1:300},front:{x0:540,x1:1140,y0:-280,y1:500},fly:{x0:-160,x1:1140,y0:-140,y1:-36}};

// ---------- materials ----------
function patAt(c,cn,x,y,u){const p=c.createPattern(cn,'repeat');if(p.setTransform)p.setTransform(new DOMMatrix().translate(x,y).scale(u));return p;}
let ASPH=null;
// asphalt, pixel by pixel: dark aggregate with paler stones in it, wet in places
function asphalt(){if(ASPH)return ASPH;const n=128,cv=document.createElement('canvas');cv.width=cv.height=n;const g=cv.getContext('2d'),im=g.createImageData(n,n),d=im.data,r=rng(73);
  for(let i=0;i<n*n;i++){const v=r(),s=v<.06?38+r()*30:v<.5?18+r()*8:13+r()*7,w=r()<.02?1.6:1;d[i*4]=s*w*.95;d[i*4+1]=s*w*.93;d[i*4+2]=s*w*1.05;d[i*4+3]=255;}
  g.putImageData(im,0,0);ASPH=cv;return cv;}
let CONC=null;
// concrete, cast and stained: soft mottling, a few pits and rust runs
function concrete(){if(CONC)return CONC;const n=96,cv=document.createElement('canvas');cv.width=cv.height=n;const g=cv.getContext('2d'),r=rng(91);
  g.fillStyle='#4a4846';g.fillRect(0,0,n,n);for(let i=0;i<220;i++){g.fillStyle=rgba(r()<.5?'#000000':'#8a8478',.04+r()*.07);g.beginPath();g.arc(r()*n,r()*n,1+r()*6,0,TAU);g.fill();}
  for(let i=0;i<60;i++){g.fillStyle=rgba('#000000',.3);g.fillRect(r()*n,r()*n,1,1);}
  for(let i=0;i<5;i++){const x=r()*n;g.fillStyle=lin(g,0,0,0,n,[[0,rgba('#3a2214',.25)],[1,rgba('#3a2214',0)]]);g.fillRect(x,0,1.4,n*(.3+r()*.6));}
  CONC=cv;return cv;}
// a run of wall in concrete between two lines of the picture, darkened for the night (dark) and its top edge lit (lit)
function wallFace(c,x0,y0,x1,y1,o){o=o||{};c.fillStyle=patAt(c,concrete(),x0,y0,o.u||.4);c.fillRect(x0,y0,x1-x0,y1-y0);c.fillStyle=rgba('#05040a',o.dark??.62);c.fillRect(x0,y0,x1-x0,y1-y0);}

// ---------- the bands ----------
// the skyline far off over the city, the Hallowell tower to the left with its cyan crown
function paintSky(c,P){const r=rng(41);
  skyline(c,-40,P+40,182,{seed:47,far:.98,h0:30,h1:120,w0:16,w1:34,col:'#181a2a',hazeCol:'#3a2836',hazeH:90,hazeA:.55,dens:.3});
  skyline(c,-40,P+40,196,{seed:53,far:.8,h0:26,h1:80,w0:20,w1:44,col:'#13141f',hazeCol:'#3a2a30',hazeH:60,hazeA:.5,dens:.45});
  for(let i=0;i<9;i++){const x=r()*P,y=150+r()*40;c.fillStyle=rgba('#ff3a26',.55);c.fillRect(x,y,1.4,1.4);}}
// the city far below the deck: roofs and streets seen from above, lit windows and lines of street lamps, a sign or two, in the haze
function paintCity(c,P){const r=rng(61),y0=118,y1=300;
  c.fillStyle=lin(c,0,y0,0,y1,[[0,'#140f17'],[.5,'#0d0a10'],[1,'#07060a']]);c.fillRect(0,y0,P,y1-y0);
  // the blocks, rows of them going away, each a roof with its edge lit from the streets below and a few windows
  for(let row=0;row<7;row++){const y=y0+12+row*24+r()*6,sz=.55+row*.08;let x=-20;
    while(x<P+20){const w=(26+r()*60)*sz,h=(10+r()*16)*sz,top=y-h;
      c.fillStyle=mix('#0f0c12','#1a1418',r()*.6);c.fillRect(x,top,w,h+18);
      c.fillStyle=rgba('#ffb25e',.1+.12*r());c.fillRect(x,top,w,.8);
      const n=Math.floor(w*h/40);for(let i=0;i<n;i++){if(r()>.32)continue;c.fillStyle=rgba(r()<.86?'#ffcf86':'#cfe8ff',.25+.45*r());c.fillRect(x+r()*w,top+2+r()*(h+12),1.1,1.2);}
      x+=w+3+r()*8*sz;}
    // the street in front of the row: a line of lamps, cars' lights crawling along it
    const sy=y+6;for(let x2=0;x2<P;x2+=22+r()*10){c.fillStyle=rgba('#ffd08a',.45+.3*r());c.fillRect(x2,sy,1.3,1.1);}
    for(let i=0;i<6;i++){const x2=r()*P;c.fillStyle=rgba(r()<.5?'#fff2d0':'#ff4a30',.5);c.fillRect(x2,sy+1.5,2.2,1);}}
  // a few signs in neon on the roofs
  for(let i=0;i<4;i++){const x=r()*P,y=y0+40+r()*100,col=r()<.5?C.cyan:'#ff5a7a';glow(c,x,y,16,col,.35,.4);c.fillStyle=rgba(col,.8);c.fillRect(x-6,y-1,12,2);}
  haze(c,0,P,y0-10,y0+60,'#3a2a34',.55,true);haze(c,0,P,y1-90,y1,'#05040a',.6);}
// the far parapet: its face toward us in concrete with its top edge lit, the lamps on it; the deck's edge beyond and the drop
function paintFar(c,P){const r=rng(83),base=yG(FP),top=base-PH;
  // its face, cast in panels, a drain slot at its foot every few panels
  wallFace(c,-10,top,P+10,base,{dark:.58});
  c.fillStyle=lin(c,0,top,0,base,[[0,rgba('#ffcf86',.12)],[.3,rgba('#ffcf86',0)],[1,rgba('#000000',.35)]]);c.fillRect(-10,top,P+20,base-top);
  for(let x=0;x<P;x+=60){c.fillStyle=rgba('#000000',.45);c.fillRect(x,top+2,1,base-top-2);c.fillStyle=rgba('#a89a88',.08);c.fillRect(x+1,top+2,.8,base-top-2);
    if((x/60)%4===2){c.fillStyle='#050406';c.fillRect(x+20,base-6,18,5);}}
  // the coping on top, its arris catching the lamps; a steel rail along it on short posts
  c.fillStyle=lin(c,0,top-5,0,top+1,[[0,'#7a7064'],[1,'#3a3632']]);c.fillRect(-10,top-5,P+20,6);c.fillStyle=rgba(C.rim,.45);c.fillRect(-10,top-5,P+20,.8);
  c.fillStyle='#0c0c10';c.fillRect(-10,top-15,P+20,2.2);for(let x=8;x<P;x+=24)c.fillRect(x,top-15,1.6,10);c.fillStyle=rgba('#c8ccd4',.3);c.fillRect(-10,top-15,P+20,.6);
  // beyond the parapet the deck's own edge, dark, and a little of its underside against the drop
  c.fillStyle=lin(c,0,top-30,0,top-14,[[0,rgba('#000000',0)],[1,rgba('#000000',.25)]]);c.fillRect(-10,top-30,P+20,16);}
// one of the lamps on the far parapet, standing at x 0 (put down every LP along it, live): a tapered pole up from the coping, the arm
// out over our lanes, the sodium head under its hood; its foot in the shadow of the deck's edge beyond, as the parapet's band is
const POST={x0:-58,x1:10,y0:86,y1:262};
function paintPost(c,bare){const top=yG(FP)-PH,h=150;
  c.fillStyle=lin(c,-3,0,3,0,[[0,'#0a0a0d'],[.6,'#2a2c32'],[1,'#121317']]);c.beginPath();c.moveTo(-3.4,top-4);c.lineTo(-1.6,top-4-h);c.lineTo(1.6,top-4-h);c.lineTo(3.4,top-4);c.closePath();c.fill();
  c.fillStyle=rgba(C.rim,.25);c.fillRect(1,top-4-h,.7,h);
  c.strokeStyle='#121317';c.lineWidth=2.4;c.beginPath();c.moveTo(0,top-4-h+4);c.quadraticCurveTo(-4,top-h-14,-22,top-h-14);c.lineTo(-40,top-h-12);c.stroke();
  c.fillStyle='#16171c';c.beginPath();c.ellipse(-44,top-h-11,9,3.4,0,0,TAU);c.fill();c.fillStyle='#fff0cc';c.beginPath();c.ellipse(-44,top-h-9,6,1.8,0,0,TAU);c.fill();
  c.fillStyle='#0c0c10';c.fillRect(-6,top-6,12,3);if(bare)return;
  c.globalCompositeOperation='source-atop';c.fillStyle=lin(c,0,top-30,0,top-14,[[0,rgba('#000000',0)],[1,rgba('#000000',.25)]]);c.fillRect(POST.x0,top-30,POST.x1-POST.x0,16);
  c.globalCompositeOperation='source-over';}
// the road: the asphalt from the far parapet to the near, its lane lines, the joints across it, wet, holding the lamps' light
function paintRoad(c,P){const r=rng(97);
  c.save();c.transform(1,0,PSX,-PSY,0,GB);
  for(let n=-1;n<=1;n++){const ox=n*P;
    c.fillStyle=patAt(c,asphalt(),ox,0,.32);c.fillRect(ox-60,NP1-4,P+120,FP-NP1+4);
    // the wheel tracks in each lane worn darker and smoother, a sheen of wet over everything
    for(const d of [20,82,144,206]){c.fillStyle=rgba('#000000',.18);c.fillRect(ox-60,d-9,P+120,7);c.fillRect(ox-60,d+5,P+120,7);}
    // the lines: solid along the edges, dashed between the lanes (a dash every 120, 54 long), the joints every 400
    c.fillStyle='#d8d2c0';c.fillRect(ox-60,EL0-1.6,P+120,3.2);c.fillRect(ox-60,EL1-1.6,P+120,3.2);
    for(const d of LANES)for(let x=0;x<P;x+=120)c.fillRect(ox+x,d-1.4,54,2.8);
    c.fillStyle=rgba('#000000',.5);for(let x=0;x<P;x+=400)c.fillRect(ox+x,NP1,2.4,FP-NP1);
    c.fillStyle=rgba('#a8a090',.12);for(let x=0;x<P;x+=400)c.fillRect(ox+x+2.4,NP1,1,FP-NP1);}
  // the lamps' light on the wet road: a pool under each, drawn out toward us
  for(let n=-1;n<=1;n++)for(let x=LAMP0-44;x<P+60;x+=LP){const px=n*P+x;c.save();c.translate(px,150);c.scale(1,2.2);
    c.fillStyle=rad(c,0,0,0,80,[[0,rgba('#ffcf86',.2)],[.5,rgba('#ffcf86',.07)],[1,rgba('#ffcf86',0)]]);c.beginPath();c.arc(0,0,80,0,TAU);c.fill();c.restore();}
  c.restore();
  // the lamps mirrored in the wet: a long smear of each down the road toward us
  c.save();c.globalCompositeOperation='lighter';for(let n=-1;n<=1;n++)for(let x=LAMP0-44;x<P+60;x+=LP){const px=n*P+x+FP*PSX,y=yG(FP)+4;
    c.fillStyle=lin(c,0,y,0,y+150,[[0,rgba('#ffcf86',.22)],[.6,rgba('#ffcf86',.06)],[1,rgba('#ffcf86',0)]]);c.fillRect(px-3-30*PSX,y,6,150);}c.restore();
  // the far parapet's foot in shadow, the near edge's gutter
  c.fillStyle=lin(c,0,yG(FP),0,yG(FP)+14,[[0,rgba('#000000',.55)],[1,rgba('#000000',0)]]);c.fillRect(-10,yG(FP),P+20,14);}
// the near parapet: its face toward us (away from the lamps, in its own shade), its coping lit along the top, scuffs from bumpers
function paintNear(c,P){const base=yG(NP),top=base-NPH,r=rng(101);
  wallFace(c,-10,top,P+10,base,{dark:.72});
  c.fillStyle=lin(c,0,top,0,base,[[0,rgba('#ffcf86',.08)],[.25,rgba('#000000',0)],[1,rgba('#000000',.4)]]);c.fillRect(-10,top,P+20,base-top);
  for(let x=0;x<P;x+=80){c.fillStyle=rgba('#000000',.5);c.fillRect(x,top,1.2,base-top);}
  c.fillStyle=lin(c,0,top-4,0,top+1,[[0,'#8a7e70'],[1,'#3a3430']]);c.fillRect(-10,top-4,P+20,5);c.fillStyle=rgba(C.rim,.5);c.fillRect(-10,top-4,P+20,.8);
  c.strokeStyle=rgba('#c8c0b0',.1);c.lineWidth=.7;c.beginPath();for(let i=0;i<40;i++){const x=r()*P,y=top+4+r()*(base-top-8);c.moveTo(x,y);c.lineTo(x+6+r()*20,y+(r()-.5)*2);}c.stroke();
  c.fillStyle=lin(c,0,base,0,506,[[0,'#08070b'],[1,'#050408']]);c.fillRect(-10,base,P+20,506-base);}
// under the near parapet the drop again, on an upright phone's view: the city far below, the haze over it lit warm by its streets,
// its roofs in rows with their windows, and its streets in lines of lamps with the cars' lights on them
function paintDrop(c,P){const r=rng(113);c.fillStyle=lin(c,0,500,0,1010,[[0,'#1c1418'],[.18,'#151016'],[.6,'#120e14'],[1,'#0f0c12']]);c.fillRect(0,500,P,510);
  for(let row=0;row<10;row++){const y=516+row*48+r()*10;let x=-10;
    while(x<P+10){const w=24+r()*50,h=12+r()*14;c.fillStyle=mix('#110d12','#21181a',r());c.fillRect(x,y-h,w,h+6);c.fillStyle=rgba('#ffb25e',.1+.1*r());c.fillRect(x,y-h,w,1);
      for(let i=0;i<w*h/50;i++){if(r()>.35)continue;c.fillStyle=rgba(r()<.85?'#ffcf86':'#cfe8ff',.25+.4*r());c.fillRect(x+r()*w,y-h+2+r()*(h-2),1.2,1.3);}
      x+=w+2+r()*6;}
    for(let x=0;x<P;x+=14+r()*12){c.fillStyle=rgba('#ffd08a',.35+.3*r());c.fillRect(x,y+3,1.4,1.2);}
    for(let i=0;i<5;i++){c.fillStyle=rgba(r()<.5?'#fff2d0':'#ff4a30',.5);c.fillRect(r()*P,y+4.6,2.2,1);}}
  haze(c,0,P,500,600,'#3a2620',.45,true);}

// ---------- the set pieces ----------
// the garage beyond the drop: open decks of cast concrete one over another, sodium lights inside and a few cars, its stair tower at
// the end toward the ramp with its sign, the top deck's rail the riders go through
function paintGarage(c){const r=rng(131),{x0,x1,top,lev}=GAR,sp=14;
  // behind it, the piers of the flyover going down into the drop
  for(const px of FLY.piers){const w=26;c.save();c.beginPath();c.rect(px-w/2,FLY.y1,w,300);c.clip();wallFace(c,px-w/2,FLY.y1,px+w/2,FLY.y1+300,{dark:.7,u:.25});c.restore();
    c.fillStyle=lin(c,px-w/2,0,px+w/2,0,[[0,rgba('#000000',.5)],[.7,rgba('#000000',0)],[.9,rgba(C.rim,.12)],[1,rgba('#000000',.3)]]);c.fillRect(px-w/2,FLY.y1,w,300);
    c.fillStyle=rgba('#2a2230',.3);c.fillRect(px-w/2,FLY.y1,w,300);}
  // its mass, dark against the city
  c.fillStyle='#0b0a0e';c.fillRect(x0,top,x1-x0,260);
  for(let i=0;i<3;i++){const y=top+i*lev,yo=y+sp,yb=y+lev;
    // the open storey: dark inside, the warm pools of its lights low on its ceiling, the columns and the cars standing in it
    c.fillStyle=lin(c,0,yo,0,yb,[[0,'#140e0b'],[.6,'#1c140e'],[1,'#0e0a08']]);c.fillRect(x0,yo,x1-x0,yb-yo);
    for(let x=x0+26;x<x1-40;x+=58){glow(c,x,yo+4,34,'#ffb25e',.16,.55);c.fillStyle=rgba('#ffe0a0',.55);c.fillRect(x-3,yo+1.5,6,1);}
    for(let n=0;n<7;n++){const cx=x0+12+r()*(x1-x0-60),cw=20+r()*6,cy=yb-3;c.fillStyle=mix('#09090b','#221c18',r()*.5);c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+1.5,cy-5);c.lineTo(cx+5,cy-8);c.lineTo(cx+cw-5,cy-8);c.lineTo(cx+cw-1.5,cy-5);c.lineTo(cx+cw,cy);c.closePath();c.fill();
      c.fillStyle=rgba('#ffcf86',.16);c.fillRect(cx+6,cy-7.6,cw-12,.6);}
    for(let x=x0+10;x<x1-30;x+=36){c.fillStyle='#09080a';c.fillRect(x,yo,4.4,yb-yo);c.fillStyle=rgba('#ffb25e',.1);c.fillRect(x+3.6,yo,.8,yb-yo);}
    // the spandrel across the front of the deck above it: cast concrete, its top edge lit
    c.save();c.beginPath();c.rect(x0,y,x1-x0,sp);c.clip();wallFace(c,x0,y,x1,yo,{dark:.6,u:.22});c.restore();
    c.fillStyle=rgba(C.rim,.24);c.fillRect(x0,y,x1-x0,.7);c.fillStyle=rgba('#000000',.4);c.fillRect(x0,yo-1.2,x1-x0,1.2);}
  // the stair tower at its end toward the ramp: a slot of lit glass up it, the sign at its head
  {const sx=x1-28;c.fillStyle='#0d0c10';c.fillRect(sx,top-34,30,300);c.fillStyle=lin(c,sx+11,0,sx+19,0,[[0,'#3a2a18'],[.5,'#ffcf86'],[1,'#3a2a18']]);
    for(let y=top-26;y<top+250;y+=19){c.globalAlpha=.45+.3*r();c.fillRect(sx+11,y,8,12);}c.globalAlpha=1;
    c.fillStyle=rgba(C.rim,.28);c.fillRect(sx+29,top-34,.8,300);
    c.fillStyle='#07060a';c.fillRect(sx+4,top-30,22,19);glow(c,sx+15,top-21,22,C.cyan,.3,.8);c.fillStyle=rgba(C.cyanL,.9);c.font='700 14px "Alegreya SC", Georgia, serif';c.textAlign='center';c.fillText('P',sx+15,top-16);}
  // the top deck's two lamp standards (its parapet and rail are drawn among the riders: garageFront)
  for(const lx of [x0+150,x0+400]){c.fillStyle='#0f0f13';c.fillRect(lx-1.2,top-62,2.4,53);c.fillRect(lx-10,top-64,12,2.6);glow(c,lx-8,top-61,26,'#ffcf86',.38,.6);c.fillStyle='#fff0cc';c.fillRect(lx-11,top-62,5,1.2);}
  // the air between it and us: the city's haze over all of it, thicker toward its foot behind the far parapet
  c.fillStyle=rgba('#2a2230',.22);c.fillRect(x0,top-70,x1-x0,340);
  c.fillStyle=lin(c,0,top+60,0,top+220,[[0,rgba('#05040a',0)],[1,rgba('#05040a',.55)]]);c.fillRect(x0,top+60,x1-x0,170);}
// the top deck's parapet and its steel rail on short posts, a gap torn in it wherever a rider has gone through: drawn among the riders
// (it stands in front of those still on the deck and behind those in the air)
function garageFront(c,ox,broke){const {x0,x1,top}=GAR,y=top-15;c.save();c.translate(ox,0);
  c.save();c.beginPath();c.rect(x0,top-9,x1-x0-28,9);c.clip();wallFace(c,x0,top-9,x1,top,{dark:.52,u:.22});c.restore();
  c.fillStyle=rgba(C.rim,.38);c.fillRect(x0,top-9,x1-x0-28,.8);c.strokeStyle='#0d0d11';c.lineWidth=1.6;
  const gaps=(broke||[]).map(x=>[x-14,x+16]),inGap=x=>gaps.some(([a,b])=>x>a&&x<b);
  c.beginPath();let on=false;for(let x=x0;x<=x1-28;x+=2){if(inGap(x)){on=false;continue;}if(!on){c.moveTo(x,y);on=true;}else c.lineTo(x,y);}c.stroke();
  c.fillStyle='#0d0d11';for(let x=x0+6;x<x1-30;x+=18)if(!inGap(x))c.fillRect(x,y,1.4,7);
  // the torn ends bent out over the drop
  c.strokeStyle='#1a1a20';c.lineWidth=1.6;for(const [a,b] of gaps){c.beginPath();c.moveTo(a,y);c.lineTo(a+6,y-5);c.moveTo(b,y);c.lineTo(b-5,y+4);c.stroke();}
  c.fillStyle=rgba('#c8ccd4',.25);c.fillRect(x0,y-.6,x1-x0-30,.5);c.restore();}
// The flyover across the top of the picture: the interchange's upper road, the ramp's top running under it. Its deck's fascia in
// concrete with the shadow under it, its parapet's coping lit, small lamps along it; its piers go down behind the garage (paintGarage).
const FLY={y0:-82,y1:-40,piers:[260,520,1020],clear:40};
// Over the ramp's top the flyover is put down among the riders while the stage runs (sk_highwayui.js, at FLY_D): in front of a rider
// still under it, so that he comes out from under it (since V111, asked for: it was part of the place's own layer, behind every rider,
// and Kael at the ramp's top was drawn across its face as though he rode over it). Its underside clears the ramp by about a rider's
// height where the ramp goes under it (clear), so a rider comes out from under its fascia from his wheels up, never at once.
const FLY_D=(GB-FLY.y1-FLY.clear)/PSY;
function flyFront(){const ox=pieceOff();if(ox>=1500)return;blitPiece(pieces().fly,ox*FAR_F);}
function paintFly(c){const {y0,y1}=FLY,X0=SP.fly.x0,X1=SP.fly.x1,r=rng(171);
  c.fillStyle='#0c0b0f';c.fillRect(X0,y0+10,X1-X0,y1-y0-10);
  c.save();c.beginPath();c.rect(X0,y0+14,X1-X0,18);c.clip();wallFace(c,X0,y0+14,X1,y0+32,{dark:.55,u:.3});c.restore();
  c.fillStyle=rgba(C.rim,.3);c.fillRect(X0,y0+14,X1-X0,.8);
  c.fillStyle=lin(c,0,y0+32,0,y1,[[0,'#100e12'],[1,'#060508']]);c.fillRect(X0,y0+32,X1-X0,y1-y0-32);
  c.save();c.beginPath();c.rect(X0,y0,X1-X0,10);c.clip();wallFace(c,X0,y0,X1,y0+10,{dark:.5,u:.25});c.restore();c.fillStyle=rgba(C.rim,.45);c.fillRect(X0,y0,X1-X0,.8);
  for(let x=X0+40;x<X1;x+=180){c.fillStyle='#0e0e12';c.fillRect(x-1,y0-46,2,46);c.fillRect(x-9,y0-48,10,2.2);glow(c,x-7,y0-46,22,'#ffcf86',.45,.6);c.fillStyle='#fff0cc';c.fillRect(x-10,y0-46,5,1.1);}
  // traffic on it going by in the night: a pair of tail lamps, a pair of headlamps
  for(let i=0;i<5;i++){const x=X0+r()*(X1-X0),red=r()<.5;c.fillStyle=rgba(red?'#ff3a26':'#fff2d0',.7);c.fillRect(x,y0+6,2,1.2);c.fillRect(x+7,y0+6,2,1.2);}
  // the air between: the city's haze over it
  c.fillStyle=rgba('#2a2230',.28);c.fillRect(X0,y0-50,X1-X0,y1-y0+50);}
// The ramp as it stands (since V110, asked for: it was a ribbon of road hung from under the flyover, with nothing under it and a
// parapet a few units high, its outer edge sweeping on across the highway's lanes). Back to front: the drop east of its foot (where
// the highway's far lanes and far parapet are not), its piers going down into it, the slab's edges under the deck, the deck (painted
// apart so that its foot can give way to the road's paint, the gore and the drop staying), the gore, its parapets, the highway's
// barrier east of its foot with the impact cushion at the gore's nose and the barrier's lamps, the ramp's own lamps; the city's haze
// over its high far end.
// along it: its lamps on the outer parapet (s), the barrier's lamps east of its foot (their x past the gore's nose)
const LAMP_S=[.05,.24,.43,.61],BAR_LAMPS=[150,450];
function paintRamp(c){const N=120,ss=[];for(let i=0;i<=N;i++)ss.push(lerp(S_LO,S_HI,i/N));
  const B=SP.front,sN=sNose(),xF=XF(),yHB=yG(HB),Bw=B.x1-B.x0,Bh=B.y1-B.y0;
  // the slab's depth: whole where it stands on its piers, nothing at its foot, where it is the highway's own deck
  const slab=s=>SLAB*rampPt(clamp(s,0,1),0).k*(1-sst(clamp((s-sN+.03)/.12,0,1)));
  // its outer side: the parapet's face from the gore's nose up, its edge line below that, where the gore is
  const oOut=s=>-lerp(RW,RE,sst(clamp((s-sN+.02)/.04,0,1)));
  // lengths along it from its foot (its length in the picture over its k: what is far is drawn small), and where a length falls
  const M=360,LT=[];for(let i=0;i<=M;i++){const s=lerp(S_HI,S_LO,i/M),p=rampPt(s,0);LT.push({s,p,l:0});}
  for(let i=1;i<=M;i++){const a=LT[i-1].p,b=LT[i].p;LT[i].l=LT[i-1].l+Math.hypot(b.x-a.x,b.y-a.y)/((a.k+b.k)/2);}
  const sAt=l=>{let i=1;while(i<M&&LT[i].l<l)i++;const a=LT[i-1],b=LT[i],u=clamp((l-a.l)/((b.l-a.l)||1),0,1);return lerp(a.s,b.s,u);},
    lOf=s=>{let i=1;while(i<M&&LT[i].s>s)i++;const a=LT[i-1],b=LT[i],u=clamp((a.s-s)/((a.s-b.s)||1),0,1);return lerp(a.l,b.l,u);},lTop=LT[M].l,lN=lOf(sN);
  const line=(P,o,f)=>{for(let i=0;i<P.length;i++){const p=P[i];if(i)o.lineTo(p.x,p.y+(f?f(i):0));else o.moveTo(p.x,p.y+(f?f(i):0));}};
  // the deck's outline: its outer side (oOut) up, its inner side down
  const PO=ss.map(s=>rampPt(s,oOut(s))),PI=ss.map(s=>rampPt(s,RW)),deck=new Path2D();line(PO,deck);for(let i=N;i>=0;i--)deck.lineTo(PI[i].x,PI[i].y);deck.closePath();
  // the drop east of its foot: the air over the city far below, its streets' lamps in rows in the haze, darker going down; not under
  // the deck, whose foot shows the road through it (the highway's own lanes there)
  {const x0=xF,x1=B.x1,y0=236,y1=yHB,r=rng(181),D=new Path2D();D.rect(x0,y0,x1-x0,y1-y0);D.addPath(deck);c.save();c.clip(D,'evenodd');
    c.fillStyle=lin(c,0,y0,0,y1,[[0,rgba('#0d0a10',0)],[.42,rgba('#0b0910',.97)],[1,'#07060a']]);c.fillRect(x0,y0,x1-x0,y1-y0);
    for(let row=0;row<4;row++){const y=y0+60+row*21+r()*4,a=.36-row*.06;for(let x=x0+6;x<x1;x+=8+r()*14){if(r()<.45)continue;c.fillStyle=rgba(r()<.86?'#ffcf86':'#cfe8ff',a*(.4+.6*r()));c.fillRect(x,y+r()*3,1.4,1.2);}}
    haze(c,x0,x1,y0+40,y0+96,'#3a2a34',.3,true);c.restore();}
  // its piers: a bent every 170 of its length from the gore's nose up, two columns under its edges from the slab down into the drop
  // (the highway's barrier hides their feet), a cap across the slab's underside on them; lit down the side toward us, the far ones in
  // the city's haze. Seen from above the deck hides them, all but the outer column of the one round its bend (at s .4, where they are
  // set from), which stands out past its outer edge over the barrier.
  const lB=lOf(.4),l0B=lB-170*Math.floor((lB-lN-30)/170);
  for(let l=l0B;l<lTop-24;l+=170){const s=sAt(l),k=rampPt(s,0).k,t=slab(s),w=Math.max(4,15*k),a=rampPt(s,-RE*.97),b=rampPt(s,RE*.97),ch=10*k,y1=yHB+6;
    for(const o of [-RE*.9,RE*.9]){const p=rampPt(s,o),x0=p.x-w/2,y0=p.y+t+ch-1;
      c.save();c.beginPath();c.rect(x0,y0,w,y1-y0);c.clip();wallFace(c,x0,y0,x0+w,y1,{dark:.6,u:.2+.2*k});
      c.fillStyle=lin(c,x0,0,x0+w,0,[[0,rgba('#ffcf86',.16)],[.22,rgba('#000000',0)],[.65,rgba('#000000',.28)],[1,rgba('#000000',.55)]]);c.fillRect(x0,y0,w,y1-y0);
      c.fillStyle=lin(c,0,y0,0,y0+70*k,[[0,rgba('#000000',.6)],[1,rgba('#000000',0)]]);c.fillRect(x0,y0,w,70*k);
      if(k<.97){c.fillStyle=rgba('#2a2230',(1-k)*.6);c.fillRect(x0,y0,w,y1-y0);}c.restore();}
    const Q=new Path2D();Q.moveTo(a.x,a.y+t);Q.lineTo(b.x,b.y+t);Q.lineTo(b.x,b.y+t+ch);Q.lineTo(a.x,a.y+t+ch);Q.closePath();
    c.fillStyle=lin(c,0,Math.min(a.y,b.y)+t,0,Math.max(a.y,b.y)+t+ch,[[0,'#2c2926'],[1,'#121114']]);c.fill(Q);if(k<.97){c.fillStyle=rgba('#2a2230',(1-k)*.6);c.fill(Q);}}
  // the slab: its two edges, as deep as it is (what shows is the face under the lower edge in the picture), cast and darkened
  for(const off of [RW,-RW]){const E=ss.map(s=>rampPt(s,off)),P=new Path2D();line(E,P);for(let i=N;i>=0;i--)P.lineTo(E[i].x,E[i].y+slab(ss[i]));P.closePath();
    c.save();c.clip(P);wallFace(c,B.x0,B.y0,B.x1,B.y1,{dark:.64,u:.22});c.fillStyle=rgba('#2a2230',.16);c.fillRect(B.x0,B.y0,Bw,Bh);c.restore();}
  // the gore where the ramp parts from the highway: paved and chevroned, between the lane line at 114 and the ramp's outer edge
  {const y114=yG(114),sA=.985,G=new Path2D(),O=[];for(let i=0;i<=40;i++)O.push(rampPt(lerp(sA,sN,i/40),-RE));line(O,G);
    const pN=O[O.length-1];G.lineTo(pN.x+30,y114);G.lineTo(O[0].x,y114);G.closePath();
    c.save();c.clip(G);c.fillStyle=patAt(c,asphalt(),0,0,.32);c.fillRect(B.x0,280,Bw,120);c.fillStyle=rgba('#d8d2c0',.72);
    for(let x=xF-10;x<pN.x+40;x+=22){c.beginPath();c.moveTo(x,y114);c.lineTo(x+18,y114-36);c.lineTo(x+25,y114-36);c.lineTo(x+7,y114);c.closePath();c.fill();}
    c.restore();
    // its lower edge, the highway's second lane's edge east of the ramp's foot: solid
    c.fillStyle='#d8d2c0';c.fillRect(O[0].x,y114-1.4,B.x1-O[0].x,2.8);}
  // the deck, painted apart
  {const dc=document.createElement('canvas');dc.width=c.canvas.width;dc.height=c.canvas.height;const d=dc.getContext('2d');d.setTransform(c.getTransform());
    d.save();d.clip(deck);d.fillStyle=patAt(d,asphalt(),0,0,.32);d.fillRect(B.x0,B.y0,Bw,Bh);
    // the wheels' tracks worn darker down each lane
    for(const o of [-RE*.66,-RE*.34,RE*.34,RE*.66]){const T=new Path2D(),a=ss.map(s=>rampPt(s,o-3.5)),b=ss.map(s=>rampPt(s,o+3.5));line(a,T);for(let i=N;i>=0;i--)T.lineTo(b[i].x,b[i].y);T.closePath();d.fillStyle=rgba('#000000',.16);d.fill(T);}
    // the lamps' light on it; darker away from them up the far end, and the city's haze over that
    for(const s of LAMP_S){const p=rampPt(s,RE*.15);d.save();d.translate(p.x,p.y);d.scale(1.1,.75);d.fillStyle=rad(d,0,0,0,95*p.k,[[0,rgba('#ffcf86',.2)],[1,rgba('#ffcf86',0)]]);d.beginPath();d.arc(0,0,95*p.k,0,TAU);d.fill();d.restore();}
    d.fillStyle=lin(d,0,B.y0,0,B.y1,[[0,rgba('#05040a',.6)],[.42,rgba('#05040a',.22)],[1,rgba('#05040a',.04)]]);d.fillRect(B.x0,B.y0,Bw,Bh);
    // its joints: where each span of the slab meets the next, between the piers, a steel strip across it
    for(let l=l0B+85-170*Math.floor((l0B+85-lN-20)/170);l<lTop-10;l+=170){const s0=sAt(l),s1=sAt(l+3),a=rampPt(s0,-RW),b=rampPt(s0,RW),b1=rampPt(s1,RW),a1=rampPt(s1,-RW);
      d.fillStyle=rgba('#08070a',.85);d.beginPath();d.moveTo(a.x,a.y);d.lineTo(b.x,b.y);d.lineTo(b1.x,b1.y);d.lineTo(a1.x,a1.y);d.closePath();d.fill();
      d.fillStyle=rgba(C.rim,.16);d.beginPath();d.moveTo(a1.x,a1.y);d.lineTo(b1.x,b1.y);d.lineTo(b1.x,b1.y+1);d.lineTo(a1.x,a1.y+1);d.closePath();d.fill();}
    d.fillStyle=lin(d,0,-60,0,170,[[0,rgba('#2a2230',.5)],[1,rgba('#2a2230',0)]]);d.fillRect(B.x0,-60,Bw,230);d.restore();
    // its lines: solid along its edges (on the highway's lane line at 114 and its far edge line at 228 at its foot), and down its
    // middle a dash every 120 of the world and 54 long as the highway's, shorter with the distance by its k. At its foot they are the
    // highway's own: its middle line goes over onto the lane line at 176 (OC across from its middle there; its two lanes as wide as
    // the highway's third and fourth), and its dashes are measured from its foot so that they fall on the road's (L0, the road still)
    d.strokeStyle='#d8d2c0';d.lineWidth=2.4;for(const off of [-RE,RE]){d.beginPath();line(ss.map(s=>rampPt(s,off)),d);d.stroke();}
    d.fillStyle='#d8d2c0';
    const OC=(LANES[2]-(GB-rampPt(S_HI,0).y)/PSY)*PSY/.62,oc=s=>OC*sst(clamp((s-.8)/.2,0,1)),L0=((-(rampPt(S_HI,OC).x-LANES[2]*PSX))%120+120)%120;
    for(let l0=L0;l0<lTop;l0+=120){const s0=sAt(l0),s1=sAt(Math.min(l0+54,lTop)),n=8;d.beginPath();
      for(let j=0;j<=n;j++){const s=lerp(s0,s1,j/n),p=rampPt(s,oc(s)+1.7);if(j)d.lineTo(p.x,p.y);else d.moveTo(p.x,p.y);}
      for(let j=n;j>=0;j--){const s=lerp(s0,s1,j/n),p=rampPt(s,oc(s)-1.7);d.lineTo(p.x,p.y);}d.closePath();d.fill();}
    // at its foot its own paint gives way to the road's, over the stretch where its lanes run on as the highway's: the road under it
    // shows through, its dashes and lines falling on the road's own
    {const xa=rampPt(S_FADE,0).x,xb=rampPt(S_HI,0).x,y0=yG(EL1)-8,y1=yG(EL0);d.save();d.globalCompositeOperation='destination-out';
      d.fillStyle=lin(d,xa,0,xb,0,[[0,rgba('#000000',0)],[1,rgba('#000000',1)]]);d.fillRect(B.x0,y0,xa-B.x0,y1-y0);d.restore();}
    c.save();c.setTransform(1,0,0,1,0,0);c.drawImage(dc,0,0);c.restore();dc.width=dc.height=0;}
  // its parapets, cast as the highway's: a face as high as the far parapet's (which the inner one goes on from at its foot), shaded
  // as that one's is (its top catching the lamps, its foot in shade: in rows along it, up its height) and cast in panels as it is (a
  // joint every 60 along it from its foot, the first where the two meet), the coping on top with its arris lit, a steel rail over it
  // on short posts, amber reflectors along the face; the outer one from the gore's nose up
  for(const [off,s1] of [[RW,S_HI],[-RW,sN]]){const sL=ss.filter(s=>s<=s1+1e-9),Pb=sL.map(s=>rampPt(s,off)),h=i=>-RPH*Pb[i].k,n=Pb.length-1;
    const F=new Path2D();line(Pb,F);for(let i=n;i>=0;i--)F.lineTo(Pb[i].x,Pb[i].y+h(i));F.closePath();
    c.save();c.clip(F);wallFace(c,B.x0,B.y0,B.x1,B.y1,{dark:.58});
    {const R=12;for(let j=0;j<R;j++){const f=(j+.5)/R,a=f<.3?.12*(1-f/.3):.35*(f-.3)/.7;if(a<.005)continue;const g=new Path2D();
      for(let i=0;i<=n;i++){const p=Pb[i],y=p.y+h(i)*(1-j/R);if(i)g.lineTo(p.x,y);else g.moveTo(p.x,y);}for(let i=n;i>=0;i--){const p=Pb[i];g.lineTo(p.x,p.y+h(i)*(1-(j+1)/R));}
      g.closePath();c.fillStyle=rgba(f<.3?'#ffcf86':mix('#ffcf86','#000000',(f-.3)/.7),a);c.fill(g);}}
    for(let l=lOf(s1);l<lTop;l+=60){const p=rampPt(sAt(l),off),k=p.k,y0=p.y-RPH*k+2*k;c.fillStyle=rgba('#000000',.45);c.fillRect(p.x,y0,Math.max(.6,k),p.y-y0);c.fillStyle=rgba('#a89a88',.08);c.fillRect(p.x+k,y0,.8*k,p.y-y0);}
    c.restore();
    // the coping
    const Cp=new Path2D();for(let i=0;i<=n;i++){const p=Pb[i],y=p.y+h(i)-5*p.k;if(i)Cp.lineTo(p.x,y);else Cp.moveTo(p.x,y);}for(let i=n;i>=0;i--){const p=Pb[i];Cp.lineTo(p.x,p.y+h(i)+1*p.k);}Cp.closePath();
    c.fillStyle='#4e4840';c.fill(Cp);
    c.strokeStyle=rgba(C.rim,.45);c.lineWidth=1.05;c.beginPath();for(let i=0;i<=n;i++){const p=Pb[i],y=p.y+h(i)-5*p.k;if(i)c.lineTo(p.x,y);else c.moveTo(p.x,y);}c.stroke();
    // the rail on its posts, and the reflectors
    const Rl=new Path2D();for(let i=0;i<=n;i++){const p=Pb[i],y=p.y+h(i)-15*p.k;if(i)Rl.lineTo(p.x,y);else Rl.moveTo(p.x,y);}for(let i=n;i>=0;i--){const p=Pb[i];Rl.lineTo(p.x,p.y+h(i)-12.8*p.k);}Rl.closePath();
    c.fillStyle='#0c0c10';c.fill(Rl);
    const l1=lOf(s1);for(let l=l1+12;l<lTop;l+=24){const s=sAt(l),p=rampPt(s,off),k=p.k,y=p.y-RPH*k;c.fillStyle='#0c0c10';c.fillRect(p.x-.8*k,y-14*k,Math.max(.8,1.6*k),9*k);}
    for(let l=l1+30;l<lTop;l+=60){const s=sAt(l),p=rampPt(s,off),k=p.k;c.fillStyle=rgba('#ffb25e',.55*Math.min(1,k+.2));c.fillRect(p.x-1.2*k,p.y-RPH*k*.55,2.4*k,1.6*k);}}
  // the highway's barrier east of the ramp's foot, its face toward us as the far parapet's is, its west end turned in to the outer
  // parapet at the gore's nose; the impact cushion in front of the nose; the barrier's lamps
  {const Np=rampPt(sN,-RW),xa=Np.x+28,x1=B.x1,base=yHB,top=base-PH,bP=[[Np.x,Np.y],[xa,base],[x1,base]];
    const F=new Path2D();F.moveTo(bP[0][0],bP[0][1]);for(const q of bP)F.lineTo(q[0],q[1]);for(let i=bP.length-1;i>=0;i--)F.lineTo(bP[i][0],bP[i][1]-PH*(i?1:Np.k));F.closePath();
    c.save();c.clip(F);wallFace(c,Np.x-4,top-60,x1,base+2,{dark:.58});c.fillStyle=lin(c,0,top,0,base,[[0,rgba('#ffcf86',.12)],[.3,rgba('#ffcf86',0)],[1,rgba('#000000',.35)]]);c.fillRect(Np.x-4,top-60,x1-Np.x+4,base-top+62);
    for(let x=xa+40;x<x1;x+=60){c.fillStyle=rgba('#000000',.45);c.fillRect(x,top+2,1,base-top-2);}c.restore();
    const Cp=new Path2D();Cp.moveTo(Np.x,Np.y-PH*Np.k-5);Cp.lineTo(xa,top-5);Cp.lineTo(x1,top-5);Cp.lineTo(x1,top+1);Cp.lineTo(xa,top+1);Cp.lineTo(Np.x,Np.y-PH*Np.k+1);Cp.closePath();
    c.fillStyle=lin(c,0,top-5,0,top+1,[[0,'#7a7064'],[1,'#3a3632']]);c.fill(Cp);c.fillStyle=rgba(C.rim,.45);c.fillRect(xa,top-5,x1-xa,.8);
    c.fillStyle='#0c0c10';c.fillRect(xa,top-15,x1-xa,2.2);for(let x=xa+8;x<x1;x+=24)c.fillRect(x,top-15,1.6,10);c.fillStyle=rgba('#c8ccd4',.3);c.fillRect(xa,top-15,x1-xa,.6);
    // the cushion: its yellow and black bands, its lit top and its reflector
    {const w=36,cx0=Np.x-w+6,cy1=Math.max(Np.y,base-14)+4,cy0=cy1-22;for(let i=0;i<6;i++){c.fillStyle=i%2?'#151316':'#a8822a';c.fillRect(cx0+i*w/6,cy0,w/6,cy1-cy0);}
      c.fillStyle=rgba('#000000',.3);c.fillRect(cx0,cy0+12,w,cy1-cy0-12);c.fillStyle=rgba('#ffcf86',.45);c.fillRect(cx0,cy0,w,1.2);c.fillStyle='#ffb25e';c.fillRect(cx0+3,cy0+6,3.2,3.2);}
    // its lamps: as the far parapet's (paintPost), each standing on it
    for(const dx of BAR_LAMPS){const x=xa+dx;if(x>x1-10)continue;c.save();c.translate(x,base-yG(FP));paintPost(c,true);c.restore();}}
  // the ramp's own lamps on its outer parapet: a pole up from it, the arm out over the deck, the head
  for(const s of LAMP_S){const p=rampPt(s,-RW),q=rampPt(s,RE*.15),k=p.k,h=150*k,y0=p.y-RPH*k,hx=q.x;
    c.fillStyle='#121317';c.fillRect(p.x-1.7*k,y0-h,3.4*k,h);c.fillStyle=rgba(C.rim,.22);c.fillRect(p.x+.6*k,y0-h,.9*k,h);
    c.strokeStyle='#121317';c.lineWidth=Math.max(1.6,2.4*k);c.beginPath();c.moveTo(p.x,y0-h);c.quadraticCurveTo((p.x+hx)/2,y0-h-10*k,hx,y0-h+2*k);c.stroke();
    c.fillStyle='#16171c';c.beginPath();c.ellipse(hx,y0-h+3*k,8*k,3*k,0,0,TAU);c.fill();c.fillStyle='#fff0cc';c.beginPath();c.ellipse(hx,y0-h+4.5*k,5*k,1.6*k,0,0,TAU);c.fill();}
  // the city's haze over its high far end (only over what is there)
  c.save();c.globalCompositeOperation='source-atop';c.fillStyle=lin(c,0,-80,0,200,[[0,rgba('#2a2230',.45)],[1,rgba('#2a2230',0)]]);c.fillRect(B.x0,-80,Bw,280);c.restore();}
// where the ramp's lamps' heads are, and the barrier's (in the picture, before the road moves them)
function rampLamps(){const out=[];for(const s of LAMP_S){const p=rampPt(s,-RW),q=rampPt(s,RE*.15),k=p.k;out.push({x:q.x,y:p.y-RPH*k-150*k+4.5*k,k});}
  const xa=rampPt(sNose(),-RW).x+28,top=yG(HB)-PH;for(const dx of BAR_LAMPS){const x=xa+dx;if(x>SP.front.x1-10)continue;out.push({x:x-44,y:top-159,k:1});}return out;}
let RLAMPS=null;
// what of the ramp burns live: its lamps' heads and the barrier's (its lines lie still on it, painted with it: paintRamp)
function rampLive(c,ox){c.save();c.translate(ox,0);
  for(const q of RLAMPS||(RLAMPS=rampLamps())){glow(c,q.x,q.y,30*q.k,'#ffcf86',.55);glow(c,q.x,q.y+40*q.k,70*q.k,'#ffb25e',.12,.5);}
  c.restore();}

// ---------- the strips and the set pieces: made once at the screen's scale ----------
let ST=null;
function wantScale(){const w=typeof cv!=='undefined'&&cv&&cv.width?cv.width:1800,cw=typeof cssW==='number'&&cssW>0?cssW:900;return clamp(w/(cw<640?560:W),1,2.4);}
function makeBand(k,sc,draw){const b=BAND[k],w=Math.round(b.P*sc),s=w/b.P,h=Math.ceil((b.y1-b.y0)*s),cn=document.createElement('canvas');cn.width=w;cn.height=h;
  const c=cn.getContext('2d');c.setTransform(s,0,0,s,0,-b.y0*s);draw(c,b.P);return{cv:cn,y0:b.y0,sc:s,P:b.P,f:b.f};}
function makePiece(box,sc,draw,spans){const w=Math.ceil((box.x1-box.x0)*sc),h=Math.ceil((box.y1-box.y0)*sc),cn=document.createElement('canvas');cn.width=w;cn.height=h;
  const c=cn.getContext('2d');c.setTransform(sc,0,0,sc,-box.x0*sc,-box.y0*sc);draw(c);return{cv:cn,box,sc,spans:spans?spansOf(cn,32):null};}
// where a set piece holds anything, 32 of its canvas's rows at a time: each frame puts down only that, not the empty air of its box
// (the ramp's box is half air beside its bend); read once, when the piece is made
function spansOf(cn,bh){const w=cn.width,h=cn.height;let d;try{d=cn.getContext('2d').getImageData(0,0,w,h).data;}catch(e){return null;}const out=[];
  for(let y0=0;y0<h;y0+=bh){const y1=Math.min(h,y0+bh);let a=w,b=-1;
    for(let y=y0;y<y1;y++){const row=y*w*4;for(let x=0;x<a;x++)if(d[row+x*4+3]){a=x;break;}for(let x=w-1;x>b;x--)if(d[row+x*4+3]){b=x;break;}}
    if(b<a)continue;const q=out[out.length-1];if(q&&q.y1===y0&&q.x0===a&&q.x1===b+1)q.y1=y1;else out.push({y0,y1,x0:a,x1:b+1});}
  return out;}
function strips(){const sc=wantScale();if(ST&&Math.abs(sc/ST.sc-1)<.15)return ST;
  if(ST)for(const k of [...ORDER,'post','nearFast'])ST[k].cv.width=ST[k].cv.height=0;
  const t0=performance.now();ST={sc};
  for(const k of ORDER)ST[k]=makeBand(k,sc*(BAND[k].lo||1),k==='sky'?paintSky:k==='city'?paintCity:k==='far'?paintFar:k==='road'?paintRoad:k==='near'?paintNear:paintDrop);
  ST.post=makePiece(POST,sc,paintPost);ST.nearFast=ghostOf(ST.near,12,.3);
  ST.ms=performance.now()-t0;return ST;}
// the set pieces are wanted only while they can be seen: made when the ramp is, let go once the road has taken them away
let PC=null;
function pieces(){const sc=wantScale();if(PC&&Math.abs(sc/PC.sc-1)<.15)return PC;if(PC)drop();
  PC={sc,back:makePiece(SP.back,sc,paintGarage,true),front:makePiece(SP.front,sc,paintRamp,true),fly:makePiece(SP.fly,sc,paintFly,true)};return PC;}
function drop(){if(FRS){FRS.cv.width=FRS.cv.height=0;FRS=null;}if(!PC)return;for(const k of ['back','front','fly'])PC[k].cv.width=PC[k].cv.height=0;PC=null;}
const scrollAt=()=>{const v=typeof S!=='undefined'&&S?+S.scroll:0;return isFinite(v)?v:0;};
const offOf=b=>{const o=(scrollAt()*b.f)%b.P;return o<0?o+b.P:o;};
// how far the set pieces have gone to the right with the road (they stand still until the road moves): the ramp with the road, the
// garage and the flyover beyond the drop more slowly
const pieceOff=()=>Math.max(0,-scrollAt()),FAR_F=.55;
// a band put down across the screen, or only between xa and xb (the world's x) and over its canvas's rows r0 to r1
function blit(b,xa,xb,r0,r1){const m=ctx.getTransform(),cw=ctx.canvas.width,L=Math.max(-m.e/m.a,xa??-1e9),R=Math.min((cw-m.e)/m.a,xb??1e9),o=offOf(b),u=1/b.sc,W0=b.cv.width;
  r0=Math.max(0,r0??0);r1=Math.min(b.cv.height,r1??b.cv.height);if(R<=L||r1<=r0)return;
  let x=-o;while(x>L)x-=b.P;for(;x<R;x+=b.P){const a=Math.max(L,x),bb=Math.min(R,x+b.P),sx=Math.max(0,Math.floor((a-x)*b.sc)),ex=Math.min(W0,Math.ceil((bb-x)*b.sc));
    if(ex>sx)ctx.drawImage(b.cv,sx,r0,ex-sx,r1-r0,x+sx*u,b.y0+r0*u,(ex-sx)*u,(r1-r0)*u);}}
// a band the garage stands in front of (G: its walls' ends and its roof's line, a little inside them): put down across the screen
// above the roof's line, below it only either side of the garage
// (and only down to the line yEnd below which the next band in front hides it)
function behind(b,G,yEnd){const e=yEnd==null?null:Math.ceil((yEnd-b.y0)*b.sc);if(!G){blit(b,null,null,0,e);return;}const r=Math.min(Math.round((G.y-b.y0)*b.sc),e??1e9);
  blit(b,null,null,0,r);blit(b,null,G.x0,r,e);blit(b,G.x1,null,r,e);}
// the rows each band's next one in front hides: the sky's under the city's fill, the city's under the far parapet's face, the road's
// under the near parapet's coping
const HIDE={sky:120,city:262,road:458};
// the near parapet going by at full speed: its band with the smear on it (its ghost 12 along, at .3) made once, put down in one go
function ghostOf(b,dx,a){const cn=document.createElement('canvas');cn.width=b.cv.width;cn.height=b.cv.height;const g=cn.getContext('2d'),o=dx*b.sc;
  g.drawImage(b.cv,0,0);g.globalAlpha=a;g.drawImage(b.cv,o,0);g.drawImage(b.cv,o-cn.width,0);return{cv:cn,y0:b.y0,sc:b.sc,P:b.P,f:b.f};}
function blitPiece(p,ox){const B=p.box,m=ctx.getTransform(),L=-m.e/m.a,R=(ctx.canvas.width-m.e)/m.a;if(B.x1+ox<L||B.x0+ox>R)return;
  if(!p.spans){ctx.drawImage(p.cv,B.x0+ox,B.y0,B.x1-B.x0,B.y1-B.y0);return;}
  const fx=(B.x1-B.x0)/p.cv.width,fy=(B.y1-B.y0)/p.cv.height,T=-m.f/m.d,Bt=(ctx.canvas.height-m.f)/m.d;
  for(const s of p.spans){const x=B.x0+ox+s.x0*fx,y=B.y0+s.y0*fy,w=(s.x1-s.x0)*fx,h=(s.y1-s.y0)*fy;if(x>R||x+w<L||y>Bt||y+h<T)continue;
    ctx.drawImage(p.cv,s.x0,s.y0,s.x1-s.x0,s.y1-s.y0,x,y,w,h);}}

// ---------- the scene ----------
// what stays still: the night sky, its stars and the moon, the clouds lit from under by the city, the Hallowell tower far off
function paint(c){const X0=RC.x0-20,X1=RC.x0+RC.w+20,T0=RC.y0-30,B0=RC.y0+RC.h+20;
  c.fillStyle=lin(c,0,T0,0,230,[[0,C.night0],[.35,'#0a0c18'],[.62,'#171828'],[.85,'#2c1e2a'],[1,'#3a2626']]);c.fillRect(X0,T0,X1-X0,230-T0);
  stars(c,X0,X1,T0,150,150,19,.6);moon(c,MOON.x,MOON.y,MOON.r,{phase:.5});
  cloudBank(c,X0,X1,84,30,{seed:13,n:16,col:'#171726',under:'#ff9a5a'});
  hallTower(c,TOWER.x,TOWER.base,TOWER.top,TOWER.w,{lit:.95});glow(c,TOWER.x,TOWER.base-60,240,'#ff9a5a',.08,.45);
  c.fillStyle='#0b0910';c.fillRect(X0,230,X1-X0,B0-230);
  strips();}
// the speed: the lamps' light streaking past on the wet road and the lines' dashes smeared while the road goes by fast
const RSTREAK=(()=>{const r=rng(151),a=[];for(let i=0;i<46;i++)a.push({x:r()*BAND.road.P,d:EL0+6+r()*(EL1-EL0-12),len:60+r()*200,a:.06+r()*.1,warm:r()<.7});return a;})();
const STK={};function streakSpr(col){let c0=STK[col];if(c0)return c0;c0=STK[col]=document.createElement('canvas');c0.width=64;c0.height=2;const g=c0.getContext('2d'),gr=g.createLinearGradient(64,0,0,0);
  gr.addColorStop(0,rgba(col,1));gr.addColorStop(.7,rgba(col,.25));gr.addColorStop(1,rgba(col,0));g.fillStyle=gr;g.fillRect(0,0,64,2);return c0;}
function speedOf(){const v=typeof S!=='undefined'&&S?Math.abs(+S.scrollV||0):0;return isFinite(v)?clamp((v-120)/900,0,1):0;}
function hw(){return typeof S!=='undefined'&&S&&S.hwy?S.hwy:null;}
function live(){const T=strips(),sp=speedOf(),H=hw(),m=ctx.getTransform(),L=-m.e/m.a,R=(ctx.canvas.width-m.e)/m.a;
  const ox=pieceOff(),show=ox<1500&&(!H||H.phase!=='road'||ox<1500);
  // the sky and the city, only where the garage does not stand in front of them
  const G=show?{x0:GAR.x0+ox*FAR_F+3,x1:GAR.x1+ox*FAR_F-3,y:GAR.top+2}:null;behind(T.sky,G,HIDE.sky);behind(T.city,G,HIDE.city);
  if(show){const p=pieces();blitPiece(p.back,ox*FAR_F);}else if(PC&&ox>1600)drop();
  // the far parapet, and the lamps on it each put down where it stands, their heads burning: while the ramp is there, only as far as
  // its foot, where its inner parapet takes the far parapet over and climbs away with it (since V110: east of it the highway is its two
  // near lanes behind their barrier, the ramp's piece paints them); its lamps as far as LAMP_ON past it, on the inner parapet's start
  // while that still runs along the far parapet's line
  const xEnd=show?XF()+ox:null;blit(T.far,null,xEnd);
  {const o=offOf(T.far),top=yG(FP)-PH,Q=T.post,B=Q.box;for(let x=LAMP0-o-T.far.P;x<R+60;x+=LP){if(x<L-60||(xEnd!=null&&x>xEnd+LAMP_ON))continue;const hx=x-44,hy=top-150-9;
    ctx.drawImage(Q.cv,x+B.x0,B.y0,Q.cv.width/Q.sc,Q.cv.height/Q.sc);glow(ctx,hx,hy,26,'#fff0cc',.85);glow(ctx,hx,hy+30,80,'#ffb25e',.1,.5);}}
  behind(T.road,null,HIDE.road);
  if(sp>0){const o=offOf(T.road),sw=streakSpr('#ffc98a'),sc=streakSpr('#cfe0ff');ctx.save();ctx.globalCompositeOperation='lighter';
    for(const q of RSTREAK){const y=yG(q.d)+1,len=q.len*sp;for(let n=-1;n<=1;n++){const x=q.x-o+n*T.road.P+q.d*PSX;if(x<L-len||x>R)continue;ctx.globalAlpha=q.a*sp;ctx.drawImage(q.warm?sw:sc,x,y-.5,len,1);}}
    ctx.restore();}
  // (the flyover, while the stage runs, among the riders instead: flyFront)
  if(show){const p=pieces();blitPiece(p.front,ox);rampLive(ctx,ox);if(!H)blitPiece(p.fly,ox*FAR_F);}
  blit(T.drop);
  if(sp>.995)blit(T.nearFast);else{blit(T.near);if(sp>0){ctx.save();ctx.globalAlpha=.3*sp;ctx.translate(12*sp,0);blit(T.near);ctx.restore();}}}
// the light that rims a rider: the lamps on the far parapet as they pass, the ramp's on the ramp, the moon when nothing nearer is lit
function light(f){const T=strips(),o=offOf(T.far),pel=f.p[typeof PEL==='number'?PEL:0],px=pel.x+f.dep*PSX,top=yG(FP)-PH-150;let wx=0,wy=0,ws=0;
  const add=(sx,y,Rr,k)=>{const dd=Math.abs(sx-px);if(dd>=Rr)return;const w=k*(1-dd/Rr)*(1-dd/Rr);wx+=w*sx;wy+=w*y;ws+=w;};
  const ox=pieceOff(),xEnd=ox<1500?XF()+ox:null;
  for(let x=LAMP0-o-LP*2;x<W+LP*2;x+=LP)if(xEnd==null||x<=xEnd+LAMP_ON)add(x-44,top,260,1);
  if(xEnd!=null)for(const q of RLAMPS||(RLAMPS=rampLamps()))add(q.x+ox,q.y,q.k<1?200:260,q.k<1?.8:1);
  wx+=.06*MOON.x;wy+=.06*MOON.y;ws+=.06;
  return{light:{x:wx/ws-f.dep*PSX,y:wy/ws+f.dep*PSY},col:'#ffc98a'};}
// (the drop runs on under the layer in live(); past even that, the dark it goes into)
function below(c,x0,x1,y0,y1){c.fillStyle='#060509';c.fillRect(x0,y0,x1-x0,y1-y0);}
// the light on the fight (the style guide's rule 8): the sodium lamps' light on the lanes going by
const SET={col:'#ffd6a7',soft:1,gain:1.6,air:.07,y:[GB-330,GB-250,GB-50,GB+20]};
// the garage's parapet among the riders, where the set piece is (sk_highwayui.js puts it in the draw list): painted once for each
// state of its rail (again when a rider tears another gap in it) and put down
const FRONT={x0:GAR.x0-10,x1:GAR.x1+10,y0:GAR.top-28,y1:GAR.top+3};let FRS=null;
function front(c){const ox=pieceOff();if(ox>=1500)return;const H=hw(),br=(H&&H.broke)||[],key=br.join(','),sc=wantScale();
  if(!FRS||FRS.key!==key||Math.abs(sc/FRS.sc-1)>=.15){if(FRS)FRS.cv.width=FRS.cv.height=0;FRS=makePiece(FRONT,sc,g=>garageFront(g,0,br));FRS.key=key;}
  c.drawImage(FRS.cv,FRONT.x0+ox*FAR_F,FRONT.y0,FRS.cv.width/FRS.sc,FRS.cv.height/FRS.sc);}
E.S.highway={set:SET,setLive:true,ground:.28,paint,live,light,warm:strips,table:()=>false,div:()=>false,below,front,frontOn:()=>pieceOff()<1500,fly:flyFront,flyD:FLY_D};
})();
// ===== ENV HIGHWAY END =====
