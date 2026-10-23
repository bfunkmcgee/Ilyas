// ===== ENV ROOF =====
// The top of the Hallowell tower at night, in a high wind. A deck of black granite slabs seamed with brass; on it the family's
// helipad, a dark disc with the gold H inside a gold ring and a ring of landing lights round its edge. Across the back a low parapet
// of black stone capped in gold, and behind it the tower's crown: tall blades of brass round a drum of glass that holds the house's
// cyan light, its beam going up into the cloud. At the back left the stair head the roof is reached by, its door lit; at the back
// right the antenna mast with its red aviation lights. On the right the roof simply ends: a gold-lipped edge with blue lights along
// it, the sheer face of the tower below it, and beyond, very far down, the city's lights spread to the horizon. The moon is up on
// the left. live() blows: wind streaks, cloud tearing past, the lights blinking, the crown's light breathing, searchlights sweeping
// from the crown, the windsock snapping.
(()=>{const E=EnvLook,{C,pp,poly,lin,rad,rgba,mix,glow,haze,stars,moon,rng,lerp,clamp,TAU}=E;
const FAR=230;
const EDGE=868;                                // the roof ends here, in plane x: beyond it, the drop
const PAR_D=236,PAR_H=30;                      // the parapet along the back: its depth and height
const PAD={x:420,d:104,r:112};                 // the helipad: centre and radius, in plane units
const KIOSK={x0:-40,x1:96,d0:178,d1:226,h:122,door:[8,52]};   // the stair head at the back left and its door (plane x from, to)
const CROWN={x:250,d:262};                     // the crown rising behind the parapet
const MAST={x:742,d:258};                      // the antenna mast at the back right
const SOCK={x:812,d:204};                      // the windsock's pole, by the edge
const FLOOD=[{x:178,d:214},{x:668,d:214}];     // floodlights on poles at the back, lighting the pad
const MOON={x:118,y:62,r:15};
const HOR=238;                                 // the horizon, far beyond the parapet
const VP={x:1040,y:HOR};                       // where the city's avenues meet, out past the edge
const g2=(x,d)=>pp(x,GB,d);
function patAt(c,cv,x,y,u){const p=c.createPattern(cv,'repeat');if(p.setTransform)p.setTransform(new DOMMatrix().translate(x,y).scale(u));return p;}
// the deck's granite: big black slabs in running bond, a brass line in every third joint, a little weather in the stone
// (drawn with plain fills, not pixel by pixel: it is made the moment the roof first comes up)
let DECK=null;
function deckTex(){if(DECK)return DECK;const L=52,D=26,cols=4,rows=6,sc=2,TW=cols*L,TH=rows*D,cv=document.createElement('canvas');cv.width=TW*sc;cv.height=TH*sc;
  const g=cv.getContext('2d'),r=rng(31);g.scale(sc,sc);g.fillStyle='#060608';g.fillRect(0,0,TW,TH);
  for(let j=0;j<rows;j++){const off=r()*TW,ws=[];let sum=0;for(let i=0;i<cols;i++){const w=.75+r()*.5;ws.push(w);sum+=w;}let x=off;
    for(let i=0;i<cols;i++){const w=ws[i]/sum*TW,col=mix('#0e0e12','#19191f',r()),dark=r()<.08;
      for(const xx of [x,x-TW]){g.fillStyle=dark?mix(col,'#000000',.35):col;g.fillRect(xx+.4,j*D+.4,w-.8,D-.8);
        // the grain of the granite, and the polish catching a little light along the slab's far edge
        g.fillStyle=lin(g,0,j*D,0,j*D+D,[[0,rgba('#ffffff',.035)],[.3,rgba('#ffffff',0)],[1,rgba('#000000',.12)]]);g.fillRect(xx+.4,j*D+.4,w-.8,D-.8);}
      const rs=rng((j*31+i)*7+3);for(let k=0;k<70;k++){const px=x+rs()*w,py=j*D+rs()*D,v=rs();g.fillStyle=v<.5?rgba('#000000',.25):rgba('#9a98a8',.06+.06*rs());for(const xx of [px,px-TW])g.fillRect(xx,py,.5+rs(),.5+rs()*.6);}
      x+=w;}
    // every third course joint has a line of brass let into it
    if(j%3===0){g.fillStyle='#6a5226';g.fillRect(0,j*D-.25,TW,.7);g.fillStyle=rgba('#e2b65a',.35);g.fillRect(0,j*D-.25,TW,.25);}}
  return DECK=cv;}
function blackStone(){return EnvTex.granite(41,128,128,{base:'#17171d'});}

// ---------- the sky: the moon on the left, the city's light warming the haze low down, high cloud ----------
function sky(c,X0,X1,T0){
  c.fillStyle=lin(c,0,T0,0,HOR+40,[[0,'#010208'],[.3,'#040611'],[.62,'#0b0f1e'],[.86,'#191a2b'],[1,'#2a2030']]);c.fillRect(X0,T0,X1-X0,HOR+40-T0);
  glow(c,MOON.x,MOON.y,330,'#7c8ed0',.12);
  stars(c,X0,X1,T0,HOR-60,260,73,.8);
  // the city lights the haze from below, all round the horizon
  c.save();c.globalCompositeOperation='lighter';c.translate(560,HOR+10);c.scale(1,.3);
  c.fillStyle=rad(c,0,0,10,900,[[0,rgba('#ff9a5a',.24)],[.35,rgba('#ff8a50',.09)],[1,rgba('#ff8a50',0)]]);c.beginPath();c.arc(0,0,900,0,TAU);c.fill();c.restore();
  // long bands of high cloud, the moon on their edges, the city under them
  const r=rng(23);
  for(let i=0;i<12;i++){const cx=X0+r()*(X1-X0),cy=22+r()*150,rx=90+r()*220,ry=3+r()*7,dm=Math.hypot(cx-MOON.x,cy-MOON.y),k=clamp(1-dm/360,0,1);
    c.save();c.translate(cx,cy);c.scale(1,ry/rx);
    c.fillStyle=rad(c,0,-ry*2,0,rx,[[0,rgba('#d8e0ff',.28*k)],[1,rgba('#d8e0ff',0)]]);c.beginPath();c.arc(0,-ry*1.3,rx,0,TAU);c.fill();
    c.fillStyle=rad(c,0,0,0,rx,[[0,rgba('#0e1120',.9)],[.7,rgba('#0e1120',.5)],[1,rgba('#0e1120',0)]]);c.beginPath();c.arc(0,0,rx,0,TAU);c.fill();
    c.globalCompositeOperation='lighter';c.fillStyle=rad(c,0,ry*3,0,rx,[[0,rgba('#ff9a5a',.08+.1*(cy/170))],[1,rgba('#ff9a5a',0)]]);c.beginPath();c.arc(0,ry*1.6,rx,0,TAU);c.fill();c.restore();}
  moon(c,MOON.x,MOON.y,MOON.r,{});}
// ---------- the city at the horizon: seen from this high it is a carpet of light, thickest where it meets the sky ----------
function farCity(c,X0,X1){const r=rng(9);
  c.fillStyle=lin(c,0,HOR-2,0,HOR+40,[[0,'#1a1622'],[1,'#0c0b12']]);c.fillRect(X0,HOR-1,X1-X0,60);
  for(let i=0;i<900;i++){const x=X0+r()*(X1-X0),u=Math.pow(r(),2.2),y=HOR+u*36,s=.5+u*.9;c.fillStyle=rgba(r()<.86?'#ffcf86':r()<.5?'#dfeeff':'#7ff3e3',(.25+.6*r())*(1-u*.4));c.fillRect(x,y,s,s*.8);}
  haze(c,X0,X1,HOR-10,HOR+14,'#5a3a40',.35);}
// ---------- the crown: a lantern of glass full of the house's cyan light, gold blades rising from round it to the needle ----------
function crown(c){const b=g2(CROWN.x,CROWN.d),cx=b.x,base=b.y,top=-150,dw=104,dh=118,dt=base-dh;
  // the beam it throws up into the cloud
  c.save();c.globalCompositeOperation='lighter';
  c.fillStyle=lin(c,0,top-60,0,dt,[[0,rgba(C.cyan,0)],[.4,rgba(C.cyan,.06)],[1,rgba(C.cyan,.12)]]);c.beginPath();c.moveTo(cx-20,dt-120);c.lineTo(cx+20,dt-120);c.lineTo(cx+70,top-80);c.lineTo(cx-70,top-80);c.closePath();c.fill();
  c.restore();
  glow(c,cx,dt-40,200,C.cyan,.18,.9);
  // the lantern: a drum of dark glass in gold mullions, the cyan light deep inside it
  c.fillStyle=lin(c,cx-dw,0,cx+dw,0,[[0,'#030a0c'],[.3,'#072226'],[.5,'#0e4448'],[.7,'#072226'],[1,'#02080a']]);c.fillRect(cx-dw,dt,dw*2,dh);
  c.save();c.globalCompositeOperation='lighter';c.fillStyle=rad(c,cx,dt+dh*.45,4,dw*.9,[[0,rgba(C.cyanL,.4)],[.3,rgba(C.cyan,.18)],[1,rgba(C.cyan,0)]]);c.fillRect(cx-dw,dt,dw*2,dh);c.restore();
  c.strokeStyle='#7a5c26';c.lineWidth=1.2;c.beginPath();for(let k=-7;k<=7;k++){const x=cx+Math.sin(k/7*1.35)/Math.sin(1.35)*dw;c.moveTo(x,dt);c.lineTo(x,base);}c.stroke();
  c.strokeStyle=rgba(C.goldL,.35);c.lineWidth=.5;c.beginPath();for(let k=-7;k<=-1;k++){const x=cx+Math.sin(k/7*1.35)/Math.sin(1.35)*dw;c.moveTo(x-.7,dt);c.lineTo(x-.7,base);}c.stroke();
  c.strokeStyle='#4a3818';c.lineWidth=.7;c.beginPath();for(let y=dt+dh/4;y<base-1;y+=dh/4){c.moveTo(cx-dw,y);c.lineTo(cx+dw,y);}c.stroke();
  c.fillStyle=lin(c,0,dt-6,0,dt+2,[[0,C.goldL],[.6,C.gold],[1,C.goldD]]);c.fillRect(cx-dw-8,dt-5,dw*2+16,6);c.fillStyle='#050608';c.fillRect(cx-dw-8,dt+1,dw*2+16,1.4);
  // the blades: tall gold fins standing round the lantern's rim and sweeping in to meet the needle high above
  const nx=cx,ny=top+10,ring=dt-150;
  for(const [k,w] of [[-4,8],[-3,9],[-2,10],[-1,11],[1,11],[2,10],[3,9],[4,8],[0,13]]){const x0=cx+k*dw*.25,sd=Math.sign(k)||0,mx=lerp(x0,nx,.35)+sd*26,my=lerp(dt,ny,.5);
    const P=new Path2D();P.moveTo(x0-w/2,dt+2);P.quadraticCurveTo(mx-w*.4,my,nx-1.2,ny);P.lineTo(nx+1.2,ny);P.quadraticCurveTo(mx+w*.4,my,x0+w/2,dt+2);P.closePath();
    c.fillStyle=lin(c,x0-w,0,x0+w,0,[[0,'#2a2010'],[.35,'#9a7630'],[.5,'#f2d080'],[.65,'#9a7630'],[1,'#20180a']]);c.fill(P);c.strokeStyle=rgba('#000000',.5);c.lineWidth=.6;c.stroke(P);
    c.save();c.globalCompositeOperation='lighter';c.strokeStyle=rgba(C.cyan,.35);c.lineWidth=.7;c.beginPath();c.moveTo(x0-sd*w*.5,dt);c.quadraticCurveTo(mx-sd*w*.3,my,nx,ny+8);c.stroke();c.restore();
    }
  // the ring of light held inside the blades
  c.save();c.globalCompositeOperation='lighter';c.strokeStyle=rgba(C.cyan,.85);c.lineWidth=2.2;c.beginPath();c.ellipse(cx,ring,dw*.62,10,0,0,TAU);c.stroke();
  c.strokeStyle=rgba(C.cyanL,.6);c.lineWidth=.8;c.beginPath();c.ellipse(cx,ring,dw*.62,10,0,Math.PI,TAU);c.stroke();c.restore();
  glow(c,cx,ring,110,C.cyan,.3,.35);
  // the needle at the very top, with its own small light
  c.fillStyle='#0b0b10';c.fillRect(nx-2,ny-60,4,64);c.fillStyle=C.goldL;c.fillRect(nx-.8,ny-110,1.6,60);
  glow(c,nx,ny-110,26,C.cyanL,.7);}
// ---------- the antenna mast: a tapering lattice of steel, guyed, red lights up it ----------
function mast(c){const b=g2(MAST.x,MAST.d),x=b.x,base=b.y,top=-120,col='#06070b';c.lineCap='round';
  const w=y=>lerp(14,2.2,clamp((base-y)/(base-top),0,1));
  c.strokeStyle=col;c.lineWidth=1.4;c.beginPath();c.moveTo(x-w(base),base);c.lineTo(x-w(top),top);c.moveTo(x+w(base),base);c.lineTo(x+w(top),top);c.stroke();
  c.lineWidth=.6;c.beginPath();for(let y=base;y>top;y-=16){const y2=y-16;c.moveTo(x-w(y),y);c.lineTo(x+w(y2),y2);c.moveTo(x+w(y),y);c.lineTo(x-w(y2),y2);c.moveTo(x-w(y2),y2);c.lineTo(x+w(y2),y2);}c.stroke();
  c.strokeStyle=rgba('#c8d4ff',.18);c.lineWidth=.5;c.beginPath();c.moveTo(x-w(base)+.6,base);c.lineTo(x-w(top)+.4,top);c.stroke();
  // dishes and a whip antenna part way up
  c.fillStyle=col;c.beginPath();c.ellipse(x-14,base-150,7,10,-.3,0,TAU);c.fill();c.beginPath();c.ellipse(x+12,base-230,5,8,.3,0,TAU);c.fill();
  c.strokeStyle=rgba('#c8d4ff',.2);c.lineWidth=.5;c.beginPath();c.ellipse(x-14,base-150,7,10,-.3,Math.PI*.6,Math.PI*1.4);c.stroke();
  // guy wires to the parapet's top
  c.strokeStyle=rgba('#05060a',.8);c.lineWidth=.45;c.beginPath();for(const [gx,gy] of [[x-160,base-6],[x+120,base-6]]){c.moveTo(x,base-250);c.lineTo(gx,gy);}c.stroke();
  // the lamp housings (the lights are live)
  for(const y of MAST_LIGHTS(base))c.fillStyle='#200606',c.fillRect(x-2.2,y-1.6,4.4,3.2);}
const MAST_LIGHTS=base=>[base-90,base-210,base-330,base-450];
// ---------- the parapet: black stone, a gold coping, small cyan uplights, ending in a post at the edge ----------
function parapet(c,X0){const d=PAR_D,a=g2(X0,d),b=g2(EDGE,d),h=PAR_H;
  c.fillStyle=patAt(c,blackStone(),0,0,1);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineTo(b.x,b.y-h);c.lineTo(a.x,a.y-h);c.closePath();c.fill();
  c.fillStyle=lin(c,0,a.y-h,0,a.y,[[0,rgba('#000000',.1)],[1,rgba('#000000',.55)]]);c.fill();
  // panels in the stone, each with a little gold
  c.strokeStyle=rgba('#000000',.5);c.lineWidth=.8;c.beginPath();for(let x=X0+40;x<EDGE;x+=64){const q=g2(x,d);c.moveTo(q.x,q.y-2);c.lineTo(q.x,q.y-h+5);}c.stroke();
  c.strokeStyle=rgba(C.gold,.22);c.lineWidth=.5;c.beginPath();for(let x=X0+40;x<EDGE;x+=64){const q=g2(x,d);c.moveTo(q.x+1,q.y-4);c.lineTo(q.x+1,q.y-h+7);}c.stroke();
  // the coping: a gold rail along the top, its top edge catching the moon and the crown
  c.fillStyle=lin(c,0,a.y-h-4,0,a.y-h+2,[[0,C.goldL],[.5,C.gold],[1,C.goldDD]]);c.fillRect(a.x,a.y-h-3,b.x-a.x,4.5);
  c.fillStyle=rgba('#000000',.6);c.fillRect(a.x,a.y-h+1.5,b.x-a.x,1.4);
  // uplights let into its foot, washing the stone (lit in live)
  for(let x=X0+72;x<EDGE-20;x+=128){const q=g2(x,d-2);c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,0,q.y,0,q.y-h,[[0,rgba(C.cyan,.32)],[1,rgba(C.cyan,0)]]);c.beginPath();c.moveTo(q.x-3,q.y);c.lineTo(q.x+3,q.y);c.lineTo(q.x+9,q.y-h);c.lineTo(q.x-9,q.y-h);c.closePath();c.fill();c.restore();}
  // the end post at the edge, taller, a gold finial on it
  const e=g2(EDGE,d+2);c.fillStyle='#0a0a0f';c.fillRect(e.x-6,e.y-h-22,12,h+22);c.fillStyle=C.gold;c.fillRect(e.x-7,e.y-h-24,14,3);
  c.beginPath();c.moveTo(e.x-4,e.y-h-24);c.lineTo(e.x,e.y-h-34);c.lineTo(e.x+4,e.y-h-24);c.closePath();c.fill();}
// ---------- the stair head: a black stone box with a lit door, the way up from the office floors ----------
function kiosk(c){const K=KIOSK,h=K.h,fl=g2(K.x0,K.d0),fr=g2(K.x1,K.d0),br=g2(K.x1,K.d1);
  // the side toward the pad, in shadow
  c.fillStyle='#08080c';c.beginPath();c.moveTo(fr.x,fr.y);c.lineTo(br.x,br.y);c.lineTo(br.x,br.y-h);c.lineTo(fr.x,fr.y-h);c.closePath();c.fill();
  c.fillStyle=rgba(C.cyan,.06);c.fill();
  // the roof, a gold edge round it
  const tl=g2(K.x0,K.d1);c.fillStyle='#121218';c.beginPath();c.moveTo(fl.x,fl.y-h);c.lineTo(fr.x,fr.y-h);c.lineTo(br.x,br.y-h);c.lineTo(tl.x,tl.y-h);c.closePath();c.fill();
  c.strokeStyle=C.gold;c.lineWidth=1.2;c.stroke();
  // the face toward us: black stone, a brass frame round the door
  c.fillStyle=patAt(c,blackStone(),0,0,1);c.fillRect(fl.x,fl.y-h,fr.x-fl.x,h);c.fillStyle=lin(c,0,fl.y-h,0,fl.y,[[0,rgba('#000000',.05)],[1,rgba('#000000',.45)]]);c.fillRect(fl.x,fl.y-h,fr.x-fl.x,h);
  const d0=g2(K.door[0],K.d0),d1=g2(K.door[1],K.d0),dh=96,dw=d1.x-d0.x;
  // the stair going down inside, in warm light
  c.fillStyle=lin(c,0,d0.y-dh,0,d0.y,[[0,'#ffd9a0'],[.5,'#e09a52'],[1,'#7a4220']]);c.fillRect(d0.x,d0.y-dh,dw,dh);
  c.fillStyle=rgba('#3a1c0a',.6);for(let k=0;k<6;k++){const y=d0.y-k*9;c.fillRect(d0.x+dw*.12,y-3,dw*(.76-k*.06),2);}
  c.fillStyle=rgba('#2a1406',.7);c.fillRect(d0.x+dw*.82,d0.y-dh,dw*.18,dh);
  // the door leaf swung in, and the brass frame
  c.fillStyle='#0c0b0e';c.beginPath();c.moveTo(d0.x,d0.y-dh);c.lineTo(d0.x+dw*.22,d0.y-dh+6);c.lineTo(d0.x+dw*.22,d0.y-4);c.lineTo(d0.x,d0.y);c.closePath();c.fill();
  c.strokeStyle=C.gold;c.lineWidth=1.6;c.strokeRect(d0.x-1,d0.y-dh-1,dw+2,dh+1);c.strokeStyle=rgba(C.goldL,.6);c.lineWidth=.5;c.strokeRect(d0.x-2.4,d0.y-dh-2.4,dw+4.8,dh+2.4);
  // the light spilling out across the deck
  c.save();c.globalCompositeOperation='lighter';const sp=g2((K.door[0]+K.door[1])/2,K.d0-40);
  c.fillStyle=rad(c,sp.x,sp.y,4,90,[[0,rgba('#ffb866',.26)],[1,rgba('#ffb866',0)]]);c.save();c.translate(sp.x,sp.y);c.scale(1,.42);c.beginPath();c.arc(0,0,90,0,TAU);c.fill();c.restore();
  glow(c,d0.x+dw/2,d0.y-dh*.55,60,'#ffb866',.25);c.restore();
  // a brass plaque, and the lamp over the door
  c.fillStyle=C.goldD;c.fillRect(d1.x+8,d1.y-62,16,10);c.fillStyle='#ffe9c0';c.fillRect(d0.x+dw/2-3,d0.y-dh-9,6,3);glow(c,d0.x+dw/2,d0.y-dh-8,22,'#ffc070',.5);}
// ---------- a floodlight on its pole at the back, aimed down at the pad ----------
function flood(c,F){const b=g2(F.x,F.d),top=b.y-150;c.strokeStyle='#05060a';c.lineWidth=2.4;c.beginPath();c.moveTo(b.x,b.y);c.lineTo(b.x,top);c.stroke();
  c.fillStyle=C.goldD;c.fillRect(b.x-2,b.y-40,4,3);c.fillRect(b.x-2,top+10,4,3);
  const s=Math.sign(PAD.x-F.x)||1;c.fillStyle='#0a0b10';c.save();c.translate(b.x,top);c.rotate(s*.5);c.fillRect(-9,-5,18,10);c.fillStyle=rgba('#eaf2ff',.9);c.fillRect(-7,4,14,2);c.restore();
  glow(c,b.x+s*3,top+6,26,'#dfe9ff',.45);}
// ---------- the helipad, painted flat on the deck (in plane units: x and depth) ----------
function pad(c){const {x,d,r}=PAD;
  // the touchdown disc: a smoother, darker stone, a fine pale rim and a dashed inner ring
  c.fillStyle='#101116';c.beginPath();c.arc(x,d,r,0,TAU);c.fill();
  c.fillStyle=patAt(c,blackStone(),0,0,.5);c.globalAlpha=.55;c.beginPath();c.arc(x,d,r,0,TAU);c.fill();c.globalAlpha=1;
  c.strokeStyle=rgba('#e8e4da',.55);c.lineWidth=2.2;c.beginPath();c.arc(x,d,r-2,0,TAU);c.stroke();
  c.setLineDash([7,6]);c.strokeStyle=rgba('#e8e4da',.25);c.lineWidth=1.2;c.beginPath();c.arc(x,d,r-12,0,TAU);c.stroke();c.setLineDash([]);
  // the gold ring
  const ro=r*.7,ri=r*.6;c.fillStyle=lin(c,x-ro,d-ro,x+ro,d+ro,[[0,C.goldD],[.35,C.gold],[.5,C.goldL],[.65,C.gold],[1,C.goldD]]);
  c.beginPath();c.arc(x,d,ro,0,TAU);c.arc(x,d,ri,0,TAU,true);c.fill();
  c.strokeStyle=rgba('#000000',.5);c.lineWidth=.8;c.beginPath();c.arc(x,d,ro,0,TAU);c.stroke();c.beginPath();c.arc(x,d,ri,0,TAU);c.stroke();
  // a vine running round inside the ring
  {const pts=[];for(let a=0;a<=TAU+.01;a+=TAU/80)pts.push({x:x+Math.cos(a)*(ri+ro)/2,y:d+Math.sin(a)*(ri+ro)/2});E.vine(c,pts,{w:.7,amp:1.2,leaf:2,col:'#3a2a0e',seed:5,shadow:false,every:3});}
  // the H, its bars along the depth so it reads from the approach
  const hw=46,hh=64,bw=13;c.fillStyle=lin(c,x-hw/2,d,x+hw/2,d,[[0,C.goldD],[.4,C.gold],[.55,C.goldL],[1,C.goldD]]);
  c.fillRect(x-hw/2,d-hh/2,bw,hh);c.fillRect(x+hw/2-bw,d-hh/2,bw,hh);c.fillRect(x-hw/2,d-bw/2,hw,bw);
  c.strokeStyle=rgba('#000000',.45);c.lineWidth=.7;c.strokeRect(x-hw/2,d-hh/2,bw,hh);c.strokeRect(x+hw/2-bw,d-hh/2,bw,hh);
  // the edge lights' housings round the rim
  for(let k=0;k<PAD_N;k++){const a=k/PAD_N*TAU;c.fillStyle='#050508';c.beginPath();c.arc(x+Math.cos(a)*(r+5),d+Math.sin(a)*(r+5),2.8,0,TAU);c.fill();}}
const PAD_N=20;
// ---------- the edge: a gold lip with blue lights on it, the tower's face falling away below, the city far beneath ----------
function edge(c){
  // the drop: straight past the lip, the city's plain far below, its avenues running out to the horizon. (The tower's face
  // under the lip is only a band of shadow going down into it: the eye goes to the city.)
  {const top=HOR,a=g2(EDGE,PAR_D),b=g2(EDGE,-300);c.save();c.beginPath();c.moveTo(a.x,HOR-2);c.lineTo(W+400,HOR-2);c.lineTo(W+400,H+200);c.lineTo(b.x,H+200);c.lineTo(b.x,b.y);c.lineTo(a.x,a.y);c.closePath();c.clip();
    c.fillStyle=lin(c,0,top,0,H+200,[[0,'#241e2a'],[.15,'#16121c'],[1,'#0a080d']]);c.fillRect(b.x-80,top-2,W+500-b.x,H+300);
    const r=rng(61);
    // the avenues fan out from the vanishing point; the cross streets crowd together toward the horizon
    for(let k=-16;k<=16;k++){const ang=Math.PI/2+k*.075,len=900,ex=VP.x+Math.cos(ang)*len,ey=VP.y+Math.sin(ang)*len,main=k%4===0;
      c.strokeStyle=rgba(main?'#ffb866':'#e8a860',main?.4:.15);c.lineWidth=main?1.5:.6;c.beginPath();c.moveTo(VP.x,VP.y);c.lineTo(ex,ey);c.stroke();
      // the lamps along it
      for(let i=0;i<44;i++){const u=Math.pow(r(),.7),x=lerp(VP.x,ex,u),y=lerp(VP.y,ey,u);if(r()<.3)continue;c.fillStyle=rgba(r()<.85?'#ffd59a':'#dff4ff',.45+.5*u);c.fillRect(x,y,.6+u*1.4,.6+u*1.4);}}
    for(let j=1;j<44;j++){const y=VP.y+Math.pow(j/44,2.1)*400;c.strokeStyle=rgba('#e8a860',.12+.14*(j/44));c.lineWidth=.4+j/40;c.beginPath();c.moveTo(b.x-60,y);c.lineTo(W+400,y);c.stroke();}
    // blocks between them: lit windows as specks, a few cyan ones where elves keep house
    for(let i=0;i<1800;i++){const u=Math.pow(r(),1.3),y=lerp(HOR+2,H+160,u),x=b.x-60+r()*(W+460-b.x);c.fillStyle=rgba(r()<.8?'#ffcf86':r()<.6?'#ffe9c0':'#7ff3e3',(.25+.5*r())*(.45+.55*u));const s2=.5+u*1.3;c.fillRect(x,y,s2,s2);}
    // the river, a dark band holding the lights in streaks
    c.fillStyle=rgba('#05070c',.85);c.beginPath();c.moveTo(VP.x-30,HOR+3);c.quadraticCurveTo(VP.x-80,HOR+60,VP.x-260,H+200);c.lineTo(VP.x-170,H+200);c.quadraticCurveTo(VP.x-40,HOR+60,VP.x-12,HOR+3);c.closePath();c.fill();
    c.globalCompositeOperation='lighter';for(let i=0;i<70;i++){const u=r(),x=lerp(VP.x-24,VP.x-210,u)+(r()-.5)*30*u,y=lerp(HOR+5,H+150,u);c.fillStyle=rgba(r()<.7?'#ffb866':'#7ff3e3',.2*r());c.fillRect(x,y,2+u*6,.6+u*.6);}
    c.fillStyle=lin(c,0,HOR,0,H+200,[[0,rgba('#ff9a5a',.06)],[1,rgba('#ff9a5a',.18)]]);c.fillRect(b.x-80,HOR,W+500-b.x,H+200-HOR);c.globalCompositeOperation='source-over';
    haze(c,b.x-80,W+400,HOR-2,HOR+70,'#4a3440',.5);
    // the tower's face going down under the lip: a band of shadow with a few lit windows, quickly lost
    const fr=24;c.fillStyle=lin(c,0,0,0,1,[[0,'#000']]);
    for(let d=-300;d<PAR_D;d+=6){const x=EDGE+d*PSX,y=GB-d*PSY;c.fillStyle=lin(c,0,y,0,y+fr+30,[[0,'#09090d'],[.5,rgba('#09090d',.7)],[1,rgba('#09090d',0)]]);c.fillRect(x,y,6*PSX+.6,fr+30);}
    for(let d=-290;d<PAR_D;d+=22){const x=EDGE+d*PSX,y=GB-d*PSY+12;if(r()<.5)continue;c.fillStyle=rgba(r()<.8?'#ffcf86':'#7ff3e3',.35);c.fillRect(x,y,1.6,5);}
    c.restore();}
  // the gold fin down the tower's corner, under the lip
  {const a=g2(EDGE,PAR_D);c.fillStyle=lin(c,0,a.y,0,a.y+60,[[0,rgba(C.gold,.8)],[1,rgba(C.gold,0)]]);c.fillRect(a.x-.6,a.y,1.6,60);}
  // the lip along the edge: its inner face, a gold top, its blue lights' housings
  {const a=g2(EDGE-7,PAR_D),b=g2(EDGE-7,-300),a2=g2(EDGE,PAR_D),b2=g2(EDGE,-300),h=9;
    c.fillStyle='#0b0b10';c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineTo(b.x,b.y-h);c.lineTo(a.x,a.y-h);c.closePath();c.fill();
    c.fillStyle='#16161c';c.beginPath();c.moveTo(a.x,a.y-h);c.lineTo(b.x,b.y-h);c.lineTo(b2.x,b2.y-h);c.lineTo(a2.x,a2.y-h);c.closePath();c.fill();
    c.strokeStyle=C.gold;c.lineWidth=1.3;c.beginPath();c.moveTo(a2.x,a2.y-h);c.lineTo(b2.x,b2.y-h);c.stroke();
    c.strokeStyle=rgba(C.goldL,.55);c.lineWidth=.5;c.beginPath();c.moveTo(a.x,a.y-h);c.lineTo(b.x,b.y-h);c.stroke();
    for(const d of EDGE_LIGHTS){const q=g2(EDGE-3.5,d);c.fillStyle='#04050a';c.fillRect(q.x-2,q.y-h-2.2,4,2.4);}}}
const EDGE_LIGHTS=[-120,-80,-40,0,40,80,120,160,200];
// ---------- the deck ----------
function deck(c,X0){
  const fv=[g2(X0,PAR_D),g2(EDGE,PAR_D),g2(EDGE,-300),g2(X0,-300)];
  c.save();poly(c,fv);c.clip();c.save();c.transform(1,0,PSX,-PSY,0,GB);
  c.fillStyle=patAt(c,deckTex(),0,0,1/2);c.fillRect(X0-80,-320,EDGE-X0+160,PAR_D+340);
  // grit and wear: the deck is swept, but the wind brings the city's dust up here
  {const r=rng(13);c.fillStyle=rgba('#2a2a33',.5);for(let i=0;i<500;i++){const x=X0+r()*(EDGE-X0),d=-300+r()*(PAR_D+300);c.fillRect(x,d,.6+r()*1.4,.4+r());}}
  // a puddle or two, holding the crown's cyan and the moon
  for(const [px,pd,pr] of [[150,40,34],[640,150,26],[700,10,40]]){c.save();c.translate(px,pd);c.scale(1,.5);
    c.fillStyle=rad(c,0,0,0,pr,[[0,'#0a1a20'],[.8,'#0c1418'],[1,rgba('#0c1418',0)]]);c.beginPath();c.arc(0,0,pr,0,TAU);c.fill();c.restore();}
  pad(c);
  // a gold line inlaid in the deck a stride in from the edge: the line not to cross
  c.fillStyle=rgba(C.gold,.55);c.fillRect(EDGE-34,-300,1.8,PAR_D+300);
  c.restore();
  // the light on the deck: the crown's cyan over the back of it, the moon cold from the left, the pad's own glow
  c.save();c.globalCompositeOperation='lighter';
  {const q=g2(CROWN.x,PAR_D-20);c.save();c.translate(q.x,q.y);c.scale(1,.32);c.fillStyle=rad(c,0,0,10,620,[[0,rgba(C.cyan,.09)],[.4,rgba(C.cyan,.035)],[1,rgba(C.cyan,0)]]);c.beginPath();c.arc(0,0,620,0,TAU);c.fill();c.restore();}
  {const q=g2(MOON.x+60,PAR_D-120);c.fillStyle=rad(c,q.x,q.y,10,600,[[0,rgba('#8ea0c8',.06)],[.5,rgba('#8ea0c8',.02)],[1,rgba('#8ea0c8',0)]]);c.fillRect(X0,GB-PAR_D*PSY-40,EDGE+300-X0,PAR_D*PSY+260);}
  for(const F of FLOOD){const q=g2(lerp(F.x,PAD.x,.55),lerp(F.d,PAD.d,.6));c.save();c.translate(q.x,q.y);c.scale(1,.42);c.fillStyle=rad(c,0,0,4,150,[[0,rgba('#dfe9ff',.07)],[1,rgba('#dfe9ff',0)]]);c.beginPath();c.arc(0,0,150,0,TAU);c.fill();c.restore();}
  c.restore();
  c.restore();}
// ---------- the vent stack and plant at the back: louvred boxes, a fan housing ----------
function plant(c){for(const [x0,x1,d0,d1,h] of [[118,196,196,228,44],[214,250,206,228,30],[560,628,204,230,36]]){const fl=g2(x0,d0),fr=g2(x1,d0),br=g2(x1,d1),bl=g2(x0,d1);
    c.fillStyle='#09090d';c.beginPath();c.moveTo(fr.x,fr.y);c.lineTo(br.x,br.y);c.lineTo(br.x,br.y-h);c.lineTo(fr.x,fr.y-h);c.closePath();c.fill();
    c.fillStyle='#15151b';c.beginPath();c.moveTo(fl.x,fl.y-h);c.lineTo(fr.x,fr.y-h);c.lineTo(br.x,br.y-h);c.lineTo(bl.x,bl.y-h);c.closePath();c.fill();
    c.fillStyle='#0f0f14';c.fillRect(fl.x,fl.y-h,fr.x-fl.x,h);
    c.strokeStyle=rgba('#000000',.7);c.lineWidth=.8;c.beginPath();for(let y=fl.y-h+5;y<fl.y-3;y+=4){c.moveTo(fl.x+3,y);c.lineTo(fr.x-3,y);}c.stroke();
    c.strokeStyle=rgba('#c8d4ff',.14);c.lineWidth=.5;c.beginPath();c.moveTo(fl.x,fl.y-h);c.lineTo(fr.x,fr.y-h);c.stroke();
    c.strokeStyle=rgba(C.cyan,.16);c.beginPath();c.moveTo(fl.x,fl.y-h+.5);c.lineTo(bl.x,bl.y-h+.5);c.stroke();}
  // a fan's round housing on the big box
  const f=g2(157,212);c.fillStyle='#050508';c.beginPath();c.ellipse(f.x,f.y-44,16,6,0,0,TAU);c.fill();c.strokeStyle=rgba('#c8d4ff',.2);c.lineWidth=.6;c.beginPath();c.ellipse(f.x,f.y-44,16,6,0,Math.PI,TAU);c.stroke();}
// ---------- the scene ----------
function paint(c){
  const X0=-160,X1=W+240,T0=-110;
  sky(c,X0,X1,T0);farCity(c,X0,X1);
  crown(c);mast(c);
  parapet(c,X0-40);
  // the stuff of the roof at the back: the stair head, the plant, the floodlights, the windsock's pole
  for(const F of FLOOD)flood(c,F);plant(c);kiosk(c);
  {const b=g2(SOCK.x,SOCK.d);c.strokeStyle='#05060a';c.lineWidth=2;c.beginPath();c.moveTo(b.x,b.y);c.lineTo(b.x,b.y-118);c.stroke();c.fillStyle=C.gold;c.fillRect(b.x-2.5,b.y-120,5,3);
    c.strokeStyle=rgba('#c8d4ff',.18);c.lineWidth=.5;c.beginPath();c.moveTo(b.x-.8,b.y);c.lineTo(b.x-.8,b.y-118);c.stroke();}
  deck(c,X0-40);edge(c);
  // the near edge of the picture: the deck going on toward us into the dark
  c.fillStyle=lin(c,0,GB-30,0,GB+140,[[0,rgba('#000000',0)],[1,rgba('#000000',.7)]]);c.fillRect(X0,GB-30,X1-X0,170);}
// ---------- what moves ----------
// The moving lights are stamped from small sprites made once (a glow, a soft cloud, a searchlight's beam), so a frame costs little.
const SPR={};function sprite(key,w,h,fn){if(SPR[key])return SPR[key];const cv=document.createElement('canvas');cv.width=w;cv.height=h;fn(cv.getContext('2d'),w,h);return SPR[key]=cv;}
const glowSpr=col=>sprite('g'+col,64,64,(g,w)=>{g.fillStyle=rad(g,w/2,w/2,0,w/2,[[0,rgba(col,1)],[.25,rgba(col,.45)],[.6,rgba(col,.12)],[1,rgba(col,0)]]);g.fillRect(0,0,w,w);});
const cloudSpr=()=>sprite('cloud',128,64,(g,w,h)=>{g.save();g.scale(1,h/w);g.fillStyle=rad(g,w/2,w/2,0,w/2,[[0,rgba('#2a2c40',.9)],[.6,rgba('#2a2c40',.4)],[1,rgba('#2a2c40',0)]]);g.fillRect(0,0,w,w);g.restore();});
const beamSpr=()=>sprite('beam',512,32,(g,w,h)=>{const gr=g.createLinearGradient(0,0,w,0);gr.addColorStop(0,'rgba(223,246,255,.9)');gr.addColorStop(1,'rgba(223,246,255,0)');g.fillStyle=gr;
  g.beginPath();g.moveTo(0,h/2-1);g.lineTo(w,0);g.lineTo(w,h);g.lineTo(0,h/2+1);g.closePath();g.fill();});
function glowAt(x,y,r,col,a,sq){ctx.globalAlpha=a;ctx.drawImage(glowSpr(col),x-r,y-r*(sq||1),r*2,r*2*(sq||1));}
const STREAKS=(()=>{const r=rng(5),a=[];for(let i=0;i<46;i++)a.push({y:-90+r()*560,len:30+r()*120,sp:500+r()*700,ph:r()*3000,a:.05+r()*.12,w:.4+r()*.6});return a;})();
const WISPS=(()=>{const r=rng(7),a=[];for(let i=0;i<7;i++)a.push({y:120+r()*150,rx:90+r()*160,ry:4+r()*8,sp:40+r()*70,ph:r()*1600});return a;})();
const GRIT=(()=>{const r=rng(9),a=[];for(let i=0;i<40;i++)a.push({d:-20+r()*230,sp:180+r()*260,ph:r()*1200,hop:1+r()*4});return a;})();
function live(){const t=S.t;ctx.save();
  // cloud tearing past at the height of the roof
  const cs=cloudSpr();for(const w of WISPS){const x=((w.ph+t*w.sp)%1700)-300;ctx.globalAlpha=.4;ctx.drawImage(cs,x-w.rx,w.y-w.ry*4,w.rx*2,w.ry*8);}
  ctx.globalCompositeOperation='lighter';
  // the crown breathes, and two searchlights sweep the cloud from it
  {const b=g2(CROWN.x,CROWN.d),pulse=.55+.45*Math.sin(t*1.3),y0=b.y-118-150;glowAt(b.x,y0,170,C.cyan,.06+.06*pulse,.7);
    const bs=beamSpr();for(const [ph,sp] of [[0,.35],[2.4,.27]]){const a=-Math.PI/2+Math.sin(t*sp+ph)*.85;ctx.save();ctx.translate(b.x,y0-60);ctx.rotate(a);ctx.globalAlpha=.13;ctx.drawImage(bs,0,-34,900,68);ctx.restore();}}
  // the pad's edge lights, a slow chase round the ring
  {const {x,d,r}=PAD;for(let k=0;k<PAD_N;k++){const a=k/PAD_N*TAU,q=g2(x+Math.cos(a)*(r+5),d+Math.sin(a)*(r+5)),ch=Math.pow(Math.max(0,Math.cos((k/PAD_N-t*.35)*TAU)),6),on=.45+.55*ch;
    glowAt(q.x,q.y,7+5*ch,k%2?'#ffcf86':'#7ff3e3',.45*on);ctx.globalAlpha=.7*on;ctx.fillStyle='#fffaf0';ctx.fillRect(q.x-.8,q.y-.8,1.6,1.6);}}
  // blue lights along the edge, steady
  for(const d of EDGE_LIGHTS){const q=g2(EDGE-3.5,d);glowAt(q.x,q.y-11,9,'#6fb7ff',.5);ctx.globalAlpha=.8;ctx.fillStyle='#e0f0ff';ctx.fillRect(q.x-.8,q.y-12,1.6,1.6);}
  // red lights: up the mast, on the parapet's end post, on the stair head; they blink together
  {const on=Math.pow(Math.max(0,Math.sin(t*2.2)),10),b=g2(MAST.x,MAST.d);if(on>.02){for(const y of MAST_LIGHTS(b.y)){glowAt(b.x,y,12,'#ff3a2a',.8*on);ctx.globalAlpha=on;ctx.fillStyle='#ffd0c0';ctx.fillRect(b.x-1,y-1,2,2);}
      const e=g2(EDGE,PAR_D+2);glowAt(e.x,e.y-PAR_H-36,10,'#ff3a2a',.8*on);const k=g2((KIOSK.x0+KIOSK.x1)/2,KIOSK.d0+20);glowAt(k.x,k.y-KIOSK.h-4,9,'#ff3a2a',.7*on);}}
  // the city's lights far below twinkle
  {const r=rng(Math.floor(t*6));ctx.fillStyle='#ffe9c0';for(let i=0;i<10;i++){const x=900+r()*230,y=HOR+20+r()*300;ctx.globalAlpha=.5*r();ctx.fillRect(x,y,1.2,1.2);}}
  // wind: streaks of it across everything, grit skittering over the deck
  ctx.globalAlpha=1;ctx.strokeStyle='#c8d4ff';for(const s2 of STREAKS){const x=((s2.ph+t*s2.sp)%1600)-300;ctx.globalAlpha=s2.a;ctx.lineWidth=s2.w;ctx.beginPath();ctx.moveTo(x,s2.y);ctx.lineTo(x+s2.len,s2.y+s2.len*.04);ctx.stroke();}
  ctx.fillStyle='#8a8478';for(const g of GRIT){const x=((g.ph+t*g.sp)%1300)-200;if(x>EDGE)continue;const q=g2(x,g.d),hop=Math.abs(Math.sin(t*9+g.ph))*g.hop;ctx.globalAlpha=.35;ctx.fillRect(q.x,q.y-hop,1.2,.8);}
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  // the windsock, snapping out from its pole
  {const b=g2(SOCK.x,SOCK.d),y=b.y-112,L=40,fl=t*13;ctx.save();ctx.translate(b.x,y);
    const pts=[];for(let i=0;i<=8;i++){const u=i/8;pts.push({x:u*L,y:Math.sin(fl-u*4)*u*3+u*3});}
    for(let i=0;i<8;i++){const a=pts[i],q=pts[i+1],w0=lerp(6,3,i/8),w1=lerp(6,3,(i+1)/8);ctx.fillStyle=i%2?'#0d0c10':C.gold;
      ctx.beginPath();ctx.moveTo(a.x,a.y-w0);ctx.lineTo(q.x,q.y-w1);ctx.lineTo(q.x,q.y+w1);ctx.lineTo(a.x,a.y+w0);ctx.closePath();ctx.fill();}
    ctx.restore();}
  ctx.restore();}
// over the fighters (optional): the nearest of the wind, fast and faint
const NEAR=(()=>{const r=rng(15),a=[];for(let i=0;i<14;i++)a.push({y:150+r()*360,len:80+r()*160,sp:900+r()*800,ph:r()*3000,a:.04+r()*.07});return a;})();
function fore(){const t=S.t;ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='#d8e2ff';ctx.lineWidth=.6;
  for(const s2 of NEAR){const x=((s2.ph+t*s2.sp)%1800)-400;ctx.globalAlpha=s2.a;ctx.beginPath();ctx.moveTo(x,s2.y);ctx.lineTo(x+s2.len,s2.y+s2.len*.03);ctx.stroke();}
  ctx.restore();}
// the light that rims a fighter: the moon over the left of the sky
function light(f){return{light:{x:MOON.x-f.dep*PSX,y:MOON.y+f.dep*PSY}};}
// where things are, for the scenes that use the roof
const LAYOUT={edge:EDGE,parapet:PAR_D,pad:PAD,door:{x:(KIOSK.door[0]+KIOSK.door[1])/2,dep:KIOSK.d0},crown:CROWN,mast:MAST,horizon:HOR};
E.S.roof={paint,live,fore,light,LAYOUT};
})();
// ===== ENV ROOF END =====
