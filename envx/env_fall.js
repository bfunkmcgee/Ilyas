// ===== ENV FALL =====
// The fall: looking along the face of the Hallowell tower as a body drops past it. The face fills the left of the picture, black
// stone piers with a gold fin on every other one, a floor of glass between spandrels, lit warm or dark or cyan; its corner stands up
// the middle right, a line of gold. Beyond the corner is the open night: the moon, the cloud, and the city spread out far below to
// the horizon. S.scrollY is how far he has fallen (world units, from the roof's edge), S.scrollYV how fast: the floors, the setback
// ledges and the house's gold H (once, about 1350 down) rush up past him, smeared by the speed, and the wind goes by in streaks.
// When his thoughts run out the tower's foot comes up (S.pit.base) and under it is the Pit: the far side of it shacks on shacks to the
// floor, its near walls the city's junk packed into the rock, and on its floor the Sump, a bar with hay heaped on its roof
// and the birds roosting along it (the layout is the story's, pitLayout()). fore() draws what goes over him: the spike's point
// through his arm, the front of the heap, and what flies.
// The still parts (the night, the city, the piers) are painted once; live() draws everything that moves with the fall.
(()=>{const E=EnvLook,{C,lin,rad,rgba,mix,glow,haze,stars,moon,rng,lerp,clamp,TAU}=E;
const CORNER=596;                 // the tower's corner, in x: the face to its left, the night to its right
const X0F=-170;                   // the face runs off the left of the picture
const BAY=58,FH=100,SPAN=40;      // a bay's width, a floor's height, the spandrel between floors
const YREF=170;                   // where the roof's edge is on the screen before he has fallen at all
const HOR=200;                    // the horizon, out past the corner
const HMARK={F:1350,h:300,w:220,x:286};   // the gold H on the face: how far down it starts, its size, its centre
const LEDGE=10;                   // every tenth floor a setback ledge
const MOON={x:776,y:84,r:13};
const fy=F=>YREF+F-(S.scrollY||0);       // where a point F down the face is on the screen now
const WARM_W=['#ffe2b0','#c98848'],CYAN_W=['#c8fbf3','#3a9e98'];
// the haze that hangs off the face where he falls, as pieces drawn once: cold, and warmer by steps to the warm one the desert in his head
// hangs there
const HZS=[];function hazeSpr(D){const k=Math.round(clamp(D,0,1)*8);if(HZS[k])return HZS[k];const u=k/8,cv=document.createElement('canvas');cv.width=cv.height=128;const g=cv.getContext('2d');
  const c0=mix('#5a6a90','#ffd89a',u),c1=mix('#3a4a6a','#e8b070',u);g.fillStyle=rad(g,64,64,0,64,[[0,rgba(c0,lerp(.32,.28,u))],[.5,rgba(c1,lerp(.12,.11,u))],[1,rgba(c1,0)]]);g.fillRect(0,0,128,128);return HZS[k]=cv;}
// a floor's windows, the same every time for the same floor and bay: 0 dark, 1 warm, 2 cyan, 3 warm with someone at the glass
function cell(i,j){let h=(i*73856093^j*19349663)>>>0;h=(h^(h>>>13))*1274126177>>>0;const v=(h>>>8)/16777216;return v<.62?0:v<.9?1:v<.97?2:3;}
// the range the last frame's moving parts covered (the look suite checks that it reaches the top of an upright phone's picture), and
// how many frames have been drawn
const SPAN_LAST={top:0,bot:0,n:0};
// the night out past the corner above the still layer's top: its dark and its stars (the layer's top row is only stretched up there,
// and a star in that row stretches into a line)
function upperNight(top){const x0=CORNER+6,x1=W+240,y1=RC.y0+2;ctx.fillStyle='#020309';ctx.fillRect(x0,top,x1-x0,y1-top);
  const r=rng(61);for(let y=y1;y>top;y-=7){const x=x0+r()*(x1-x0),a=.2+.5*r(),s=r()<.9?.8:1.4,dy=r()*7;if(r()<.35)continue;ctx.fillStyle=rgba('#fff4e0',a*.7);ctx.fillRect(x,y-dy,s,s);}}
// the city's other towers far out over the plain, low on the horizon in the haze, a few lights in them (TOWERS: their tops, where the
// live picture blinks their red lights)
const TOWERS=[];
function farTowers(c){const r=rng(97),X1=W+240;TOWERS.length=0;
  for(let i=0;i<18;i++){const x=CORNER+16+r()*(X1-CORNER-30),u=Math.pow(r(),1.8),base=HOR+1+u*24,s=.35+.65*u,h=(16+r()*62)*s,w=(4+r()*12)*s,top=base-h;
    c.fillStyle=lin(c,0,top,0,base,[[0,'#0f0c18'],[1,'#2a1e2c']]);c.fillRect(x-w/2,top,w,h);
    let tip=top;if(r()<.45){const mh=h*(.12+r()*.16);c.fillRect(x-.35,top-mh,.7,mh);tip=top-mh;}
    for(let q=0;q<h*w/18;q++){if(r()<.5)continue;c.fillStyle=rgba(r()<.85?'#ffd59a':'#bff6ff',.3+.45*r());c.fillRect(x-w/2+r()*w,top+r()*h,.55,.55);}
    c.fillStyle=lin(c,x-w/2,0,x+w/2,0,[[0,rgba('#000000',.35)],[.5,rgba('#000000',0)],[1,rgba('#ffb070',.08)]]);c.fillRect(x-w/2,top,w,h);
    TOWERS.push([x,tip]);}
  // the haze they stand in, thick along the horizon
  c.fillStyle=lin(c,0,HOR-46,0,HOR+34,[[0,rgba('#3a2a3a',0)],[.6,rgba('#4a3442',.32)],[1,rgba('#3a2a3a',0)]]);c.fillRect(CORNER,HOR-46,X1-CORNER,80);}
// soft puffs, made once for each colour: a cloud, or the dust of the dream's tide, is many of them heaped together
const CPF=new Map();function cpuff(col){let p=CPF.get(col);if(p)return p;p=document.createElement('canvas');p.width=p.height=64;const g=p.getContext('2d');
  g.fillStyle=rad(g,32,32,0,32,[[0,rgba(col,1)],[.35,rgba(col,.72)],[.7,rgba(col,.22)],[1,rgba(col,0)]]);g.fillRect(0,0,64,64);CPF.set(col,p);return p;}
// a bank of cloud along a line: thick in its middle and torn thin at its ends, its body dark, its underside lit by what is under it
// and its top by the moon
function cloudBank(c,cx,cy,w,h,seed,o){const r=rng(seed),N=Math.round(w/4),P=[];
  for(let i=0;i<N;i++){const u=r(),env=Math.pow(Math.sin(Math.PI*u),.7),x=cx+(u-.5)*w,y=cy+(r()-.5)*h*env,rx=(5+r()*15)*(.35+env),ry=rx*(.28+r()*.24);P.push([x,y,rx,ry]);}
  for(const [x,y,rx,ry] of P){c.globalAlpha=.4*o.dens;c.drawImage(cpuff(o.body),x-rx,y-ry,rx*2,ry*2);}
  c.save();c.globalCompositeOperation='lighter';
  for(const [x,y,rx,ry] of P){if(y>=cy){c.globalAlpha=.09*o.dens;c.drawImage(cpuff(o.under),x-rx*1.1,y-ry*.2,rx*2.2,ry*1.5);}
    else if(y<cy-h*.12){c.globalAlpha=.05*o.dens;c.drawImage(cpuff(o.top),x-rx,y-ry*1.5,rx*2,ry*1.3);}}
  c.restore();c.globalAlpha=1;}
// ---------- the still parts ----------
function paint(c){const X1=W+240,T0=-110,B0=H+120;
  // the night beyond the corner: cold at the top, the city's warmth low down
  c.fillStyle=lin(c,0,T0,0,B0,[[0,'#020309'],[.28,'#060916'],[.42,'#141729'],[.5,'#2a1f2c'],[.56,'#1a1520'],[1,'#07060a']]);c.fillRect(CORNER-20,T0,X1-CORNER+20,B0-T0);
  stars(c,CORNER,X1,T0,HOR-50,90,29,.75);
  glow(c,MOON.x,MOON.y,220,'#7c8ed0',.14);
  moon(c,MOON.x,MOON.y,MOON.r,{});
  // its corona, and the faint ring round it the high ice makes
  glow(c,MOON.x,MOON.y,70,'#c8d4ff',.1);c.strokeStyle=rgba('#c8d4ff',.045);c.lineWidth=5;c.beginPath();c.arc(MOON.x,MOON.y,62,0,TAU);c.stroke();
  // high thin cloud, one wisp of it across the moon, its edges silvered; and banks of it low over the city, lit from under by it
  cloudBank(c,MOON.x-10,MOON.y+9,190,8,31,{body:'#0c1020',top:'#d8e0ff',under:'#2a2a44',dens:.55});
  {const r=rng(33);for(let i=0;i<3;i++)cloudBank(c,CORNER+60+r()*(X1-CORNER-120),36+r()*90,150+r()*170,8+r()*8,41+i*7,{body:'#0c1020',top:'#b8c4f0',under:'#2a2a44',dens:.7});}
  {const r=rng(37);for(let i=0;i<5;i++)cloudBank(c,CORNER+40+r()*(X1-CORNER-60),HOR-24-r()*64,190+r()*220,14+r()*14,61+i*11,{body:'#0a0810',top:'#7a86b8',under:'#ff9a5a',dens:1});}
  // the city far below: a plain of light to the horizon, avenues running out to it, the river dark through it
  {const vx=880,r=rng(43);c.save();c.beginPath();c.rect(CORNER,HOR,X1-CORNER,B0-HOR);c.clip();
    c.fillStyle=lin(c,0,HOR,0,B0,[[0,'#2a2030'],[.12,'#151019'],[1,'#08070b']]);c.fillRect(CORNER,HOR,X1-CORNER,B0-HOR);
    // the streets are only their lamps: dotted lines running out to the horizon, the main ones brighter; between them the blocks'
    // windows, scattered
    for(let k=-12;k<=12;k++){const ang=Math.PI/2+k*.12,L=700,ex=vx+Math.cos(ang)*L,ey=HOR+Math.sin(ang)*L,main=k%3===0;c.strokeStyle=rgba('#ffb866',main?.08:.03);c.lineWidth=main?1:.5;c.beginPath();c.moveTo(vx,HOR);c.lineTo(ex,ey);c.stroke();
      const n=main?70:34;for(let i=0;i<n;i++){const u=Math.pow(i/n+r()*.01,1.6),x=lerp(vx,ex,u),y=lerp(HOR,ey,u);if(r()<.25)continue;c.fillStyle=rgba(r()<.85?'#ffd59a':'#dff4ff',(.35+.55*u)*(main?1:.75));c.fillRect(x,y,.5+u*1.6,.5+u*1.3);}}
    for(let j=1;j<26;j++){const y=HOR+Math.pow(j/26,2)*360,n=Math.floor(8+j*3);for(let i=0;i<n;i++){if(r()<.4)continue;const x=CORNER+r()*(X1-CORNER);c.fillStyle=rgba('#ffcf86',.25+.4*(j/26));c.fillRect(x,y,.6+j/26,.6);}}
    c.fillStyle=rgba('#05070c',.85);c.beginPath();c.moveTo(vx+20,HOR+2);c.quadraticCurveTo(vx+80,HOR+70,vx+260,B0);c.lineTo(vx+150,B0);c.quadraticCurveTo(vx+40,HOR+70,vx+8,HOR+2);c.closePath();c.fill();
    // the plain thick with light toward the horizon, where it all runs together
    c.globalCompositeOperation='lighter';for(let i=0;i<1600;i++){const u=Math.pow(r(),3),y=HOR+1+u*120,x=CORNER+r()*(X1-CORNER);c.fillStyle=rgba(r()<.85?'#ffcf86':'#e8f4ff',(.18+.4*r())*(1-u*.5));c.fillRect(x,y,.7,.6);}
    c.fillStyle=lin(c,0,HOR,0,HOR+50,[[0,rgba('#ff9a5a',.16)],[1,rgba('#ff9a5a',0)]]);c.fillRect(CORNER,HOR,X1-CORNER,50);
    // the districts: pools of sodium light, and here and there the cold of an elven quarter
    for(let i=0;i<9;i++){const u=Math.pow(r(),1.3),y=HOR+8+u*230,x=CORNER+r()*(X1-CORNER),rr=(30+r()*60)*(.4+u),col=r()<.25?'#5ff0e0':'#ff9a4a';glow(c,x,y,rr,col,.1+.08*r(),.34);}
    // the river holding the lights along it
    for(let i=0;i<70;i++){const u=r(),y=HOR+2+u*u*(B0-HOR),x=vx+14+u*u*170+(r()-.5)*(10+u*70);c.fillStyle=rgba('#ffd59a',.18+.3*r());c.fillRect(x,y,.5+u*1.2,.4+u*.6);}
    c.globalCompositeOperation='source-over';c.restore();}
  farTowers(c);
  // the city's glow going up into the haze over it
  c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,0,HOR-110,0,HOR+4,[[0,rgba('#ff9a5a',0)],[1,rgba('#ff9a5a',.2)]]);c.fillRect(CORNER,HOR-110,X1-CORNER,114);c.restore();
  // the face: the stone between the piers is dark glass and spandrels (drawn live); here the piers, which run straight down and do
  // not change as he falls, and the corner's gold fin
  c.fillStyle=lin(c,X0F,0,CORNER,0,[[0,'#0c0d14'],[.7,'#10111a'],[1,'#151622']]);c.fillRect(X0F,T0,CORNER-X0F,B0-T0);
  for(let x=X0F,j=0;x<CORNER;x+=BAY,j++){const w=j%2?7:11;c.fillStyle=lin(c,x-w/2,0,x+w/2,0,[[0,'#07070b'],[.4,'#1b1b24'],[.6,'#20202a'],[1,'#07070b']]);c.fillRect(x-w/2,T0,w,B0-T0);
    if(j%2===0){c.fillStyle=lin(c,x-1.4,0,x+1.4,0,[[0,C.goldD],[.5,C.goldL],[1,C.goldD]]);c.fillRect(x-1.2,T0,2.4,B0-T0);}}
  // the corner: a broad gold fin up the edge, catching the city's light, and its glow
  c.fillStyle=lin(c,CORNER-8,0,CORNER+6,0,[[0,'#3a2c12'],[.4,C.gold],[.6,C.goldL],[1,'#5a4420']]);c.fillRect(CORNER-8,T0,14,B0-T0);
  glow(c,CORNER,HOR+80,180,'#ffb866',.12,3);
  // the light on the face: cold from above, the city's warmth up from below, darker away from the corner
  c.fillStyle=lin(c,X0F,0,CORNER,0,[[0,rgba('#000000',.45)],[1,rgba('#000000',0)]]);c.fillRect(X0F,T0,CORNER-X0F,B0-T0);}
// ---------- the desert in his head ----------
// While he thinks of the wire (fallDream() in sk_story.js: 0 awake, 1 the dream all he sees) the night out past the corner turns by
// degrees to the noon he rode it in. The sand comes in over the city on a tide, a wall of dust rolling in from the horizon over its
// lights; behind it the dunes lie dark under the night still, a dawn comes up over them and the sky goes to the white-hot noon with the
// sun where the moon was, sand to the horizon, the heat wavering over it and a mirage of water on it, the border wire running out
// across the dunes, a buried fortress's glass domes, a cistern, and a well with people waiting at it. The tower's windows fill with
// sand like the glass of an hourglass, more of them as the dream deepens, a thread of it running in, and pour it down the face; it
// lies in drifts on the setbacks and falls off their lips in curtains; it blows up past him on the wind of the fall, the noon comes
// down across the face in shafts, the sun throws its ghosts in the lens, and it rims him instead of the city. The first blow in the
// Pit (S.pit.woke) wakes him: it is gone in a white flash, the last of the sand blown off him. (Phones first: the view is one piece
// painted once, a window's sand one piece of six, the frames over the sand, the threads and the sand in the air in batches.)
const SUN={x:MOON.x,y:MOON.y,r:15};
const DREAM_LAST={D:0,n:0};          // the last frame's depth of the dream, and how many frames have drawn it (for the checks)
function dreamK(){return typeof fallDream==='function'?fallDream():0;}
// the view, painted once (at most 1.5 times the world's units, only as far right as the fall's camera ever looks): the sky deep at the
// top and white with the heat at the horizon, the sun where the moon was and its glare, then ridge on ridge of dunes, pale and flat far
// off and bigger and warmer toward the foot of the picture, each lit where it turns to the sun and in its own shadow where it turns
// away, glittering near, with what stands on them drawn among them at their distances
const DES={cv:null,sc:0,x0:CORNER+6,x1:880,y0:-760,y1:H+120,top:'#4f86c0'};
function desertView(){const sc=clamp(jkScale()*.8,1,1.5);if(DES.cv&&DES.cv.width&&Math.abs(DES.sc/sc-1)<.15)return DES.cv;
  const w=DES.x1-DES.x0,h=DES.y1-DES.y0,cn=DES.cv||document.createElement('canvas');cn.width=Math.ceil(w*sc);cn.height=Math.ceil(h*sc);DES.cv=cn;DES.sc=sc;
  const g=cn.getContext('2d');g.setTransform(sc,0,0,sc,-DES.x0*sc,-DES.y0*sc);desertPaint(g,DES.x0-20,DES.x1+20);return cn;}
// the desert itself, into g (set to the world's units) from X0 to X1
function desertPaint(g,X0,X1){const r=rng(83),Y1=DES.y1;
  g.fillStyle=lin(g,0,-40,0,HOR+2,[[0,DES.top],[.45,'#8fb8d8'],[.8,'#d8d6c8'],[1,'#f4e8cc']]);g.fillRect(X0,DES.y0,X1-X0,HOR+2-DES.y0);
  glow(g,SUN.x,SUN.y,300,'#fff2d0',.24);glow(g,SUN.x,SUN.y,80,'#ffffff',.6);g.fillStyle='#fffdf4';g.beginPath();g.arc(SUN.x,SUN.y,SUN.r,0,TAU);g.fill();
  g.fillStyle=lin(g,0,HOR-18,0,HOR+2,[[0,rgba('#fff4dc',0)],[1,'#fff2d8']]);g.fillRect(X0,HOR-18,X1-X0,20);
  g.fillStyle=lin(g,0,HOR,0,Y1,[[0,'#efdcb6'],[.25,'#e2c48e'],[1,'#c0915a']]);g.fillRect(X0,HOR,X1-X0,Y1-HOR);
  // the mirage: the sky lying on the sand at the horizon like water, in broken bands
  {const r2=rng(89);for(let q=0;q<4;q++){const y=HOR+1.2+q*1.6;for(let x=X0;x<X1;){const L=10+r2()*60;if(r2()<.5){g.fillStyle=rgba('#d8e8f4',.24-.05*q);g.fillRect(x,y,L,.5+r2()*.5);}x+=L+r2()*40;}}}
  const SH=dsShade();
  for(let k=0;k<11;k++){const u=k/10,base=HOR+3+Math.pow(u,1.7)*(Y1-HOR+40),amp=1.2+u*u*34,wl=34+u*170,ph=r()*TAU,ph2=r()*TAU;
    const lit=mix('#f8e6c0','#f2c88a',u),dark=mix('#d9bc8e','#9a6630',u),pts=[],Yr=x=>base-amp*(.65*Math.sin(x/wl+ph)+.35*Math.sin(x/(wl*.41)+ph2));
    for(let x=X0;x<=X1;x+=5)pts.push([x,Yr(x)]);
    g.fillStyle=lin(g,0,base-amp,0,base+amp+14+u*36,[[0,lit],[.3,mix(lit,dark,.25)],[1,dark]]);
    g.beginPath();g.moveTo(X0,Y1+40);for(const [x,y] of pts)g.lineTo(x,y);g.lineTo(X1,Y1+40);g.closePath();g.fill();
    // the light on its face: where the crest runs down to the right the sand turns to the sun (out past the corner, to the right) and
    // is bright under it, where it runs up to the right it turns away into its own shadow, darkest just under the crest
    // (in the canvas's own pixels, two at a time, edge to edge: strips in the world's units would overlap and show as seams)
    const M=g.getTransform?g.getTransform():null;
    if(M&&u>.08){const dep=(8+u*46)*M.d,sm=amp/wl*1.5,st=2;g.save();g.setTransform(1,0,0,1,0,0);
      for(let px=0;px<g.canvas.width;px+=st){const x=(px+st/2-M.e)/M.a,s=(Yr(x+1)-Yr(x-1))/2,sh=clamp(s/sm*1.3,-1,1);if(Math.abs(sh)<.05)continue;
        g.globalAlpha=Math.abs(sh)*(sh>0?.5:.42)*(.55+.45*u);g.drawImage(sh>0?SH.lit:SH.lee,px,Yr(x)*M.d+M.f-.3*M.d,st,dep*(sh>0?.7:1));}g.restore();g.globalAlpha=1;}
    // the crest catching the noon
    g.strokeStyle=rgba('#fffaf0',.3+.4*u);g.lineWidth=.5+u*.9;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke();
    // the wind's ripples on the nearer ones, and the glitter of the grains in the sun
    if(u>.45){g.strokeStyle=rgba('#a87a44',.16);g.lineWidth=.5;for(let q=0;q<8;q++){const yy=base+5+q*(3+u*4);g.beginPath();
      for(let x=X0;x<=X1;x+=6){const y=yy+Math.sin(x/(9+u*8)+q+ph)*1.2;x===X0?g.moveTo(x,y):g.lineTo(x,y);}g.stroke();}
      g.fillStyle='#fffdf4';for(let q=0;q<(X1-X0)*u*.35;q++){const x=X0+r()*(X1-X0),y=Yr(x)+2+r()*(10+u*30);g.globalAlpha=.25+.6*r();g.fillRect(x,y,.5,.5);}g.globalAlpha=1;}
    if(k===1)desFort(g,HOR+7);
    if(k===3)desCistern(g,700,HOR+30);
    if(k===6)desWell(g,775,HOR+128);}
  // the heat's haze lying over the far sand
  g.fillStyle=lin(g,0,HOR,0,HOR+80,[[0,rgba('#fbf2e2',.55)],[.4,rgba('#f6e6c8',.18)],[1,rgba('#f6e6c8',0)]]);g.fillRect(X0,HOR,X1-X0,80);
  desWire(g,Y1);}
// the light and the shadow laid down a dune's face from its crest, made once: strongest at the crest
let DSH=null;function dsShade(){if(DSH)return DSH;const mk=col=>{const c=document.createElement('canvas');c.width=2;c.height=48;const g=c.getContext('2d');
    g.fillStyle=lin(g,0,0,0,48,[[0,rgba(col,1)],[.18,rgba(col,.7)],[.55,rgba(col,.22)],[1,rgba(col,0)]]);g.fillRect(0,0,2,48);return c;};
  return DSH={lit:mk('#fff6e0'),lee:mk('#7a4a24')};}
// a buried fortress far out: the line of its wall just over the sand, its glass domes catching the sun
function desFort(g,y){g.fillStyle='#cfb488';g.fillRect(618,y-2,104,2.6);
  for(const [x,rx] of [[634,7],[662,10],[700,6]]){g.fillStyle=lin(g,0,y-rx*.55,0,y,[[0,'#f2fbff'],[1,'#8fb2c0']]);g.beginPath();g.ellipse(x,y,rx,rx*.5,0,Math.PI,TAU);g.fill();
    g.fillStyle=rgba('#ffffff',.8);g.fillRect(x-rx*.35,y-rx*.42,rx*.3,.8);}}
// a cistern's dome, half in the sand, the sand drifted against it
function desCistern(g,x,y){g.fillStyle=lin(g,0,y-11,0,y,[[0,'#eefaff'],[.6,'#a9c9d4'],[1,'#6f8e98']]);g.beginPath();g.ellipse(x,y,22,11,0,Math.PI,TAU);g.fill();
  g.strokeStyle=rgba('#4a5e66',.6);g.lineWidth=.6;for(let k=-2;k<=2;k++){g.beginPath();g.ellipse(x,y,Math.abs(k)*5+.1,11*Math.sqrt(1-(k*k)/9),0,Math.PI,TAU);g.stroke();}
  g.fillStyle=rgba('#ffffff',.85);g.beginPath();g.ellipse(x-7,y-7,4,1.4,-.4,0,TAU);g.fill();
  g.fillStyle='#e6cc98';g.beginPath();g.moveTo(x-30,y+2);g.quadraticCurveTo(x-18,y-4,x-10,y+1);g.lineTo(x+20,y+1);g.quadraticCurveTo(x+28,y-3,x+36,y+2);g.closePath();g.fill();}
// a well: its ring of stones, the dark of the shaft, a frame and a rope over it, and the people waiting at it with their jars
function desWell(g,x,y){g.fillStyle='#8a6a48';g.beginPath();g.ellipse(x,y,9,3.4,0,0,TAU);g.fill();g.fillStyle='#1a120c';g.beginPath();g.ellipse(x,y-.4,5.6,1.9,0,0,TAU);g.fill();
  g.strokeStyle='#5a4028';g.lineWidth=1.1;g.beginPath();g.moveTo(x-7,y);g.lineTo(x-6,y-13);g.moveTo(x+7,y);g.lineTo(x+6,y-13);g.moveTo(x-7.5,y-13);g.lineTo(x+7.5,y-13);g.stroke();
  g.lineWidth=.5;g.beginPath();g.moveTo(x,y-13);g.lineTo(x,y-5);g.stroke();
  // the line of them, the nearest the tallest, each with a short noon shadow
  for(let i=0;i<5;i++){const fx=x+14+i*7.5,fy=y-1-i*.8,h=8.6-i*.5;g.fillStyle=rgba('#6a4a2a',.35);g.beginPath();g.ellipse(fx+1.5,fy+.4,2.6,.8,0,0,TAU);g.fill();
    g.fillStyle=i%2?'#3a2a20':'#4a3426';g.fillRect(fx-1.3,fy-h*.72,2.6,h*.72);g.beginPath();g.arc(fx,fy-h*.82,1.25,0,TAU);g.fill();
    if(i!==2){g.fillStyle='#9a6a3a';g.beginPath();g.ellipse(fx+(i%2?-1.6:1.6),fy-h*1.02,1.2,1.5,0,0,TAU);g.fill();}}}
// the border wire: its posts running out across the dunes to the horizon, nearer and taller toward the foot of the picture, the wire
// strung between them
function desWire(g,Y1){const N=34,c=.09,F=1-1/(1+N*c),P=[];for(let k=0;k<=N;k++){const s=(1-1/(1+k*c))/F;P.push({x:lerp(760,540,s),y:lerp(HOR+1.5,Y1+40,s),h:1.2+s*22,w:.5+s*2});}
  g.strokeStyle='#4a3626';for(const p of P){g.lineWidth=p.w;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x,p.y-p.h);g.stroke();}
  g.strokeStyle=rgba('#3a2a1e',.85);for(const f of [.92,.6,.3]){g.lineWidth=.45;g.beginPath();for(let k=0;k<P.length;k++){const p=P[k],y=p.y-p.h*f;
    if(!k){g.moveTo(p.x,y);continue;}const q=P[k-1],qy=q.y-q.h*f;g.quadraticCurveTo((p.x+q.x)/2,(y+qy)/2+.6+p.h*.04,p.x,y);}g.stroke();}
  // the glint of the wire in the sun, here and there
  g.strokeStyle=rgba('#fff6dc',.7);g.lineWidth=.5;for(let k=6;k<P.length;k+=5){const p=P[k],q=P[k-1];g.beginPath();g.moveTo(q.x,q.y-q.h*.92);g.lineTo((p.x+q.x)/2,(p.y-p.h*.92+q.y-q.h*.92)/2);g.stroke();}}
// The sky and the sun over it, and the land, out past the corner, over the night as deep as the dream is. The land comes in on a
// tide: a wall of dust rolling in from the horizon over the city's lights toward him (lit from under by them at night, by the sun as
// the dream deepens), the sand behind it at first dark under the night still; the sky gives way more slowly, by a dawn low over the
// sand to the noon.
function tideY(D,bot){const k=clamp(D/.72,0,1);return HOR+(bot+90-HOR)*k*k;}
// its wall's height where it is (taller the nearer, to a point)
function wh0(fr){return Math.min(16+(fr-HOR)*.42,84);}
function desert(D,top,bot,t){const x0=DES.x0,x1=DES.x1,cn=desertView(),sc=DES.sc,ya=Math.max(top,DES.y0),yh=HOR+2,yb=Math.min(bot,DES.y1),fr=tideY(D,bot);ctx.save();
  const sa=D*D*(3-2*D);if(top<DES.y0){ctx.globalAlpha=sa;ctx.fillStyle=DES.top;ctx.fillRect(x0,top,x1-x0,DES.y0-top+.5);}
  if(yh>ya){ctx.globalAlpha=sa;ctx.drawImage(cn,0,(ya-DES.y0)*sc,cn.width,(yh-ya)*sc,x0,ya,x1-x0,yh-ya);}
  {const dw=Math.sin(Math.PI*clamp((D-.1)/.72,0,1));if(dw>.02){ctx.globalCompositeOperation='screen';ctx.globalAlpha=dw*.6;
    ctx.fillStyle=lin(ctx,0,HOR-170,0,HOR+3,[[0,rgba('#ff8a5a',0)],[.55,rgba('#ffa070',.3)],[1,rgba('#ffd8a8',.75)]]);ctx.fillRect(x0,HOR-170,x1-x0,173);ctx.globalCompositeOperation='source-over';}}
  const fe=Math.min(fr,yb);
  if(fe>yh){ctx.globalAlpha=1;ctx.drawImage(cn,0,(yh-DES.y0)*sc,cn.width,(fe-yh)*sc,x0,yh,x1-x0,fe-yh);
    const nk=(1-sa)*.62;if(nk>.01){ctx.globalAlpha=nk;ctx.fillStyle='#0c1838';ctx.fillRect(x0,yh,x1-x0,fe-yh);}}
  if(bot>DES.y1&&fr>DES.y1){ctx.globalAlpha=1;ctx.fillStyle='#c0915a';ctx.fillRect(x0,DES.y1,x1-x0,Math.min(bot,fr)-DES.y1);}
  if(fr-wh0(fr)*.9<yb){const wh=wh0(fr),dc=mix('#2a1e1c','#e6c494',sa),lc=mix('#ff9a5a','#fff2d8',sa),P=cpuff(dc),Q=cpuff(lc),n=11,dr=reduceMotion?0:t*7,span=x1-x0+90;
    ctx.globalAlpha=1;ctx.fillStyle=lin(ctx,0,fr-wh*.75,0,fr+wh*.3,[[0,rgba(dc,0)],[.45,rgba(dc,.85)],[.78,rgba(dc,.8)],[1,rgba(dc,0)]]);ctx.fillRect(x0,fr-wh*.75,x1-x0,wh*1.05);
    // its billows, the light catching their tops (the moon's at night, from under by the city: their feet)
    for(let i=0;i<n;i++){const hx=hsh(i,601),x=x0-45+((i+hx)/n*span+dr*(.5+hx))%span,s=wh*(.75+.7*hsh(i,607)),y=fr-wh*(.3+.6*hsh(i,613))+(reduceMotion?0:Math.sin(t*.7+i*1.3)*wh*.05);
      ctx.globalAlpha=.72;ctx.drawImage(P,x-s,y-s*.6,s*2,s*1.2);
      ctx.globalCompositeOperation='screen';ctx.globalAlpha=.24;ctx.drawImage(Q,x-s*.85,y-s*lerp(-.1,.62,sa),s*1.7,s*.7);ctx.globalCompositeOperation='source-over';}}
  // the heat over the horizon, shimmering: the sand and the mirage on it wavering in strips (each laid over itself a little to the
  // side), and the glare in the air over it
  if(D>.5&&!reduceMotion&&fe>HOR+30){const k=clamp((D-.5)/.3,0,1);for(let y=HOR-4;y<HOR+28;y+=2){const dx=(.5+.5*Math.sin(t*3.1+y*.83))*1.1*k;if(dx<.15)continue;
    ctx.globalAlpha=1;ctx.drawImage(cn,0,(y-DES.y0)*sc,cn.width,2*sc,x0+dx,y,x1-x0,2);}}
  ctx.globalCompositeOperation='lighter';ctx.fillStyle='#fff4dc';for(let k=0;k<6;k++){const y=HOR-5+k*2.4+(reduceMotion?0:Math.sin(t*2.6+k*1.7)*.7);ctx.globalAlpha=D*.07;ctx.fillRect(x0,y,x1-x0,.7);}
  ctx.restore();}
// the sand's pieces, made once: three streams pouring off a sill (a sheet at the lip breaking into ropes that wander, thin and run
// out each at its own length, grains and clumps falling out of them and a haze of dust about their ends), and a long drift as it
// lies along a setback
let SANDS=null;
function sandSprites(){if(SANDS)return SANDS;const mk=(w,h,fn)=>{const cv=document.createElement('canvas');cv.width=w;cv.height=h;fn(cv.getContext('2d'),w,h);return cv;};
  // (a stream: a short sheet at the lip, then ropes that wander apart as it falls, thinning, and the ropes into grains; the sun on
  // its right side)
  const stream=[0,1,2].map(v=>mk(32,192,(g,w,h)=>{const r=rng(91+v*17),N=3+v,R=[];
    for(let i=0;i<N;i++)R.push({p:(i+.5)/N*2-1+(r()-.5)*.3,w:.1+r()*.12,a:.5+.5*r(),end:.55+.45*r(),ph:r()*TAU});
    const env=u=>lerp(.13,.36,Math.pow(u,.85)),sway=u=>Math.sin(u*5.5+v*2)*u*1.6;
    g.fillStyle=rad(g,w/2,h*.8,0,w*.7,[[0,rgba('#e8c088',.12)],[1,rgba('#e8c088',0)]]);g.fillRect(0,h*.45,w,h*.55);
    for(let y=0;y<h;y++){const u=y/h,e=env(u)*w,cx=w/2+sway(u),fall=(u<.02?u/.02:1)*Math.pow(1-u,1.15),sheet=u<.06?1:Math.max(.2,1-(u-.06)*2.6);
      g.fillStyle=rgba(u<.15?'#f0c47c':'#d8a864',.8*fall*sheet);g.fillRect(cx-e,y,e*2,1);
      g.fillStyle=rgba('#fff0c8',.4*fall*sheet);g.fillRect(cx+e*.15,y,e*.55,1);
      if(u>.08)for(const s of R){if(u>s.end)continue;const k=u/s.end,fa=fall*Math.pow(1-k,.9)*s.a*(.8+.2*Math.sin(y*.4+s.ph))*clamp((u-.08)/.12,0,1),hw=Math.max(.45,s.w*w*.5*(1-.35*u)),xr=cx+s.p*e*.75;
        g.fillStyle=rgba('#e0b070',.75*fa);g.fillRect(xr-hw,y,hw*2,1);}}
    for(let i=0;i<80;i++){const y=h*(.2+.8*r()),u=y/h,x=w/2+sway(u)+(r()-.5)*env(u)*w*2.4;g.fillStyle=rgba(r()<.5?'#fff2cc':'#a8743c',Math.pow(1-u,.8)*.7);g.fillRect(x,y,.8+r()*.6,1.4+r()*4);}}));
  const drift=mk(512,32,(g,w,h)=>{const r=rng(113),Y=x=>h-h*.9*Math.pow(Math.max(0,.5+.5*Math.sin(x/41+1.3)),1.4)*(.45+.55*(.5+.5*Math.sin(x/127+.4)))-h*.08-r()*.5;
    g.fillStyle=lin(g,0,0,0,h,[[0,'#f2c88a'],[.55,'#d49c56'],[1,'#a06a34']]);g.beginPath();g.moveTo(0,h);for(let x=0;x<=w;x+=4)g.lineTo(x,Y(x));g.lineTo(w,h);g.closePath();g.fill();
    g.strokeStyle=rgba('#fff2d4',.7);g.lineWidth=1;g.beginPath();for(let x=0;x<=w;x+=4)x?g.lineTo(x,Y(x)+.6):g.moveTo(x,Y(x)+.6);g.stroke();});
  return SANDS={stream,drift};}
// how full of sand a window is as the dream deepens: each window its own moment (and a few never fill: their glass holds the noon)
function sandAt(i,j,D){const th=.04+hsh(i*131+j,977)*.9;return clamp((D-th)/.25,0,1);}
// how deep the dream has gone in this fall (the sand in the windows follows it: it does not drain)
const DMX={pit:null,max:0};function dreamMax(D){const P=typeof S!=='undefined'?S.pit:null;if(DMX.pit!==P){DMX.pit=P;DMX.max=0;}if(D<.004)DMX.max=0;DMX.max=Math.max(DMX.max,D);return DMX.max;}
// the streams of the frame, poured after the floors so that each runs down over the stone and the glass below it: x, the top, width,
// length, strength, and which it is (its piece, and the grains running down it, quicker the further down)
function sandPour(L,t){if(!L.length)return;const SP=sandSprites(),sp=reduceMotion?.3:1,G=new Path2D();
  for(let n=0;n<L.length;n+=6){const x=L[n],y=L[n+1],w=L[n+2],len=L[n+3],a=L[n+4],id=L[n+5];ctx.globalAlpha=a;ctx.drawImage(SP.stream[id%3],x-w/2,y,w,len);
    if(a>.4)for(let q=0;q<3;q++){const h=hsh(id*3+q,431),f=((t*(.5+.4*h)*sp+h)%1),gy=y+f*f*len*.8;G.rect(x+(h-.5)*w*(.3+.5*f),gy,.9,1.6+f*4);}}
  ctx.globalAlpha=.8;ctx.fillStyle='#fff3d0';ctx.fill(G);ctx.globalAlpha=1;}
// ---------- the face's pieces, painted once ----------
// Every window is one piece from a set painted once at the screen's scale: the house's rooms lit warm (desks under the ceiling's
// light and the glow of their screens, someone at work, a meeting table under a screen, shelves of files and a lamp, a lounge, blinds
// half down, a corridor to a lit door, a panelled office with a banker's lamp), an elf's cyan rooms (racks of lights, a bench of
// glowing glass), someone standing at the glass with the light behind, and the dark rooms (chairs and desks against the city's glow
// on the back wall, a screen asleep, an exit sign); each behind its glass (the sky in it high up, the city's warmth low, a sheen
// across) in its frame, and once more smeared down the face for the speed. The spandrel between the floors and the setbacks' ledge
// are a strip each: the stone veined, the gold threads and the fluting catching the light. In the dream, the sand that fills them.
const FP={sc:0,lit:[],cyan:[],man:[],dark:[],sandIn:[],span:null,spanS:null,ledge:null,ledgeS:null,sm:new Map()};
const WW=40,WH=60,WTR=16.8;          // a window's width and height, and where its transom is
function fpMk(w,h,sc){const c=document.createElement('canvas');c.width=Math.ceil(w*sc);c.height=Math.ceil(h*sc);const g=c.getContext('2d');g.setTransform(sc,0,0,sc,0,0);return{c,g};}
// a man or a woman: head, neck, shoulders and body to the waist, dark against the light, lit along the edge toward it
function fpFig(g,x,y,s,col,rim,o){o=o||{};g.save();g.translate(x,y);g.scale(s,s);g.fillStyle=col;
  g.beginPath();g.ellipse(0,-17,3.1,3.7,0,0,TAU);g.fill();g.fillRect(-1.2,-14,2.4,2.4);
  g.beginPath();g.moveTo(-6.2,-10.6);g.quadraticCurveTo(-6.6,-12.4,-3,-12.2);g.lineTo(3,-12.2);g.quadraticCurveTo(6.6,-12.4,6.2,-10.6);g.lineTo(o.sit?5.4:5,o.sit?-2:2);g.lineTo(o.sit?-5.4:-5,o.sit?-2:2);g.closePath();g.fill();
  if(rim){g.strokeStyle=rim;g.lineWidth=.55;g.beginPath();g.ellipse(0,-17,3.1,3.7,0,-Math.PI*.9,-Math.PI*.1);g.stroke();g.beginPath();g.moveTo(-6,-10.8);g.quadraticCurveTo(-6.4,-12.2,-3,-12);g.lineTo(3,-12);g.quadraticCurveTo(6.4,-12.2,6,-10.8);g.stroke();}
  g.restore();}
// a desk with a screen on it (its glow col), a chair before it
function fpDesk(g,x,y,w,dark,lit,scr,chair){g.fillStyle=dark;g.fillRect(x,y,w,1.6);g.fillRect(x+.8,y+1.6,1,60-y);g.fillRect(x+w-1.8,y+1.6,1,60-y);
  g.fillStyle=lit;g.fillRect(x,y,w,.4);
  if(scr){const sx=x+w*.3,sw=w*.42;g.fillStyle=dark;g.fillRect(sx-.5,y-7.2,sw+1,6.4);g.fillStyle=scr;g.fillRect(sx,y-6.8,sw,5.4);g.fillStyle=rgba('#ffffff',.25);g.fillRect(sx,y-6.8,sw,.8);g.fillStyle=dark;g.fillRect(sx+sw/2-.5,y-1.4,1,1.4);
    g.save();g.globalCompositeOperation='lighter';g.fillStyle=rad(g,sx+sw/2,y-4,0,sw*1.4,[[0,rgba(scr,.35)],[1,rgba(scr,0)]]);g.fillRect(sx-sw,y-12,sw*3,14);g.restore();}
  if(chair){const cx=chair;g.fillStyle=dark;g.beginPath();g.ellipse(cx,y-1,3.2,4.2,0,0,TAU);g.fill();g.fillRect(cx-3,y+3,6,1.4);g.fillRect(cx-.5,y+4,1,4);g.fillRect(cx-3.4,y+8,6.8,.9);}}
// the glass over a room, and the frame: the sky in it high up, the city's warmth low, a sheen across, the mullion and the transom
function fpGlass(g,o){o=o||{};
  g.fillStyle=lin(g,0,0,0,26,[[0,rgba(o.sky||'#b8c8e8',o.skyA??.16)],[1,rgba(o.sky||'#b8c8e8',0)]]);g.fillRect(0,0,WW,26);
  g.fillStyle=lin(g,0,40,0,WH,[[0,rgba(o.low||'#ff9a5a',0)],[1,rgba(o.low||'#ff9a5a',o.lowA??.07)]]);g.fillRect(0,40,WW,20);
  g.save();g.globalCompositeOperation='lighter';g.fillStyle=rgba('#ffffff',o.sheen??.05);g.beginPath();g.moveTo(9,0);g.lineTo(17,0);g.lineTo(4,WH);g.lineTo(-4,WH);g.closePath();g.fill();
  g.fillStyle=rgba('#ffffff',(o.sheen??.05)*.6);g.beginPath();g.moveTo(22,0);g.lineTo(24.5,0);g.lineTo(11.5,WH);g.lineTo(9,WH);g.closePath();g.fill();g.restore();
  const fr=o.frame||'#07070c';g.fillStyle=fr;g.fillRect(19.2,0,1.6,WH);g.fillRect(0,WTR,WW,1.5);g.fillRect(0,0,WW,.7);g.fillRect(0,WH-.9,WW,.9);g.fillRect(0,0,.7,WH);g.fillRect(WW-.7,0,.7,WH);
  g.fillStyle=rgba(o.edge||C.goldL,o.edgeA??.22);g.fillRect(19.2,0,.35,WH);g.fillRect(0,WTR,WW,.3);
  g.fillStyle=lin(g,0,0,3,0,[[0,rgba('#000000',.45)],[1,rgba('#000000',0)]]);g.fillRect(.7,0,3,WH);g.fillStyle=lin(g,0,0,0,3,[[0,rgba('#000000',.4)],[1,rgba('#000000',0)]]);g.fillRect(0,.7,WW,3);}
// a lit room of the house: its back wall in the ceiling's light, and what is in it
function fpLit(kind,seed,sc){const {c,g}=fpMk(WW,WH,sc),r=rng(seed),dk='#1e130c',rim='#ffd9a0';
  const top=mix('#f7d9a4','#ffe8c2',r()),mid=mix('#c98a4c','#b8743c',r()),low='#4a2e1a';
  g.fillStyle=lin(g,0,0,0,WH,[[0,top],[.3,mid],[.75,mix(mid,low,.6)],[1,low]]);g.fillRect(0,0,WW,WH);
  // the ceiling's light: a strip, and its fall down the wall
  g.fillStyle='#fff6e0';g.fillRect(3,1.4,WW-6,1.1);g.save();g.globalCompositeOperation='lighter';g.fillStyle=lin(g,0,2,0,24,[[0,rgba('#fff0d0',.35)],[1,rgba('#fff0d0',0)]]);g.fillRect(0,2,WW,22);g.restore();
  // the side walls going back, in shadow
  g.fillStyle=lin(g,0,0,7,0,[[0,rgba('#000000',.38)],[1,rgba('#000000',0)]]);g.fillRect(0,0,7,WH);g.fillStyle=lin(g,WW,0,WW-7,0,[[0,rgba('#000000',.3)],[1,rgba('#000000',0)]]);g.fillRect(WW-7,0,7,WH);
  if(kind==='desks'||kind==='desks2'){fpDesk(g,2,44,15,dk,rim,r()<.5?'#cfefff':'#fff1c8',r()<.6?9:0);fpDesk(g,22,45,15,dk,rim,'#d8f2ff',r()<.5?29:0);
    if(kind==='desks2')fpFig(g,10,46,.9,dk,rgba(rim,.7),{sit:1});else if(r()<.5)fpFig(g,31,48,.85,dk,rgba(rim,.6),{sit:1});}
  else if(kind==='meeting'){g.fillStyle='#16202c';g.fillRect(9,12,22,11);g.fillStyle='#9fd8ff';g.fillRect(10,13,20,9);g.save();g.globalCompositeOperation='lighter';g.fillStyle=rad(g,20,18,0,22,[[0,rgba('#9fd8ff',.3)],[1,rgba('#9fd8ff',0)]]);g.fillRect(0,0,WW,40);g.restore();
    g.fillStyle=dk;g.fillRect(3,45,34,2);g.fillStyle=rim;g.fillRect(3,45,34,.4);for(let i=0;i<4;i++){const cx=6+i*9.4;g.fillStyle=dk;g.beginPath();g.ellipse(cx,42.5,2.6,3.6,0,0,TAU);g.fill();}
    for(let i=0;i<3;i++){g.fillStyle='#fff4dc';g.fillRect(8+i*12,3,3.2,.9);g.fillStyle=dk;g.fillRect(9.2+i*12,0,.6,3);}}
  else if(kind==='files'){g.fillStyle=mix(dk,mid,.25);g.fillRect(2,14,22,46);const B=['#5a3a2a','#2a3a4a','#4a4a2a','#6a2a22','#3a2a4a','#2a4a3a'];
    for(let row=0;row<4;row++){const yy=16+row*10;g.fillStyle=dk;g.fillRect(2,yy+8,22,1.2);for(let xx=3;xx<23;){const bw=1.2+r()*1.4;g.fillStyle=mix(B[(r()*B.length)|0],top,.25);g.fillRect(xx,yy+1+r()*1.5,bw,7-r()*1.5);xx+=bw+.3;}}
    fpDesk(g,25,46,13,dk,rim,0,0);g.fillStyle=dk;g.fillRect(33,38,.9,8);g.beginPath();g.moveTo(30.4,38.6);g.lineTo(35.6,38.6);g.lineTo(34.4,35.6);g.lineTo(31.6,35.6);g.closePath();g.fill();
    g.save();g.globalCompositeOperation='lighter';g.fillStyle=rad(g,33,42,0,12,[[0,rgba('#ffcf86',.5)],[1,rgba('#ffcf86',0)]]);g.fillRect(20,30,20,22);g.restore();}
  else if(kind==='lounge'){g.fillStyle=dk;g.beginPath();g.moveTo(4,50);g.quadraticCurveTo(4,40,10,41);g.lineTo(26,41);g.quadraticCurveTo(31,40,31,50);g.lineTo(31,56);g.lineTo(4,56);g.closePath();g.fill();g.fillStyle=rim;g.fillRect(9,41,17,.4);
    g.fillStyle=dk;g.fillRect(35,24,.8,32);g.beginPath();g.moveTo(32.2,25);g.lineTo(38.6,25);g.lineTo(37.2,20);g.lineTo(33.6,20);g.closePath();g.fill();
    g.save();g.globalCompositeOperation='lighter';g.fillStyle=lin(g,0,25,0,56,[[0,rgba('#ffd890',.42)],[1,rgba('#ffd890',0)]]);g.beginPath();g.moveTo(32.6,25);g.lineTo(38.2,25);g.lineTo(42,56);g.lineTo(28,56);g.closePath();g.fill();g.restore();
    g.fillStyle=dk;g.fillRect(1.5,47,3.4,9);for(let i=0;i<7;i++){g.beginPath();g.ellipse(3.2+(r()-.5)*5,36+r()*10,1.4,3.6,(r()-.5)*1.6,0,TAU);g.fill();}}
  else if(kind==='blinds'){fpDesk(g,3,45,16,dk,rim,'#d8f2ff',11);fpDesk(g,22,45,15,dk,rim,0,0);
    for(let q=0;q<18;q++){const yy=.8+q*2.1;g.fillStyle=rgba(q%2?'#e8c896':'#a87844',.92);g.fillRect(0,yy,WW,1.2);g.fillStyle=rgba('#000000',.22);g.fillRect(0,yy+1.2,WW,.35);}
    g.fillStyle=dk;g.fillRect(0,38.6,WW,.9);}
  else if(kind==='corridor'){g.fillStyle=mix(mid,low,.5);g.fillRect(0,0,WW,WH);g.fillStyle=lin(g,0,0,0,WH,[[0,rgba('#000000',.5)],[1,rgba('#000000',.1)]]);g.fillRect(0,0,WW,WH);
    g.fillStyle='#fff0cc';g.fillRect(15,20,10,30);g.save();g.globalCompositeOperation='lighter';g.fillStyle=rad(g,20,36,0,20,[[0,rgba('#ffe2b0',.5)],[1,rgba('#ffe2b0',0)]]);g.fillRect(0,10,WW,50);g.restore();
    g.strokeStyle=rgba('#000000',.35);g.lineWidth=.5;g.beginPath();g.moveTo(0,60);g.lineTo(15,50);g.moveTo(40,60);g.lineTo(25,50);g.moveTo(0,0);g.lineTo(15,20);g.moveTo(40,0);g.lineTo(25,20);g.stroke();
    if(r()<.7)fpFig(g,21,50,.62,'#2a1a10',0);for(let i=0;i<3;i++){g.fillStyle='#fff4dc';g.fillRect(18.6,3+i*6,2.8,.7);}}
  else if(kind==='panelled'){g.fillStyle=lin(g,0,0,0,WH,[[0,'#6a3c1e'],[1,'#2a160a']]);g.fillRect(0,0,WW,WH);g.strokeStyle=rgba('#1a0c06',.6);g.lineWidth=.6;for(let x=4;x<WW;x+=8){g.strokeRect(x-3,6,6,20);g.strokeRect(x-3,30,6,26);}
    g.fillStyle='#d8b064';g.fillRect(14,9,12,9);g.fillStyle='#2a3a2a';g.fillRect(15,10,10,7);
    fpDesk(g,7,46,26,'#140a04','#e8b070',0,0);g.fillStyle='#1a5a2a';g.beginPath();g.ellipse(20,43,3.6,1.6,0,Math.PI,TAU);g.fill();g.fillStyle='#c8a040';g.fillRect(19.6,43,.8,3);
    g.save();g.globalCompositeOperation='lighter';g.fillStyle=rad(g,20,45,0,14,[[0,rgba('#9fe8a0',.35)],[.4,rgba('#ffcf86',.25)],[1,rgba('#ffcf86',0)]]);g.fillRect(4,30,32,24);g.restore();
    if(r()<.6)fpFig(g,28,48,.92,'#120804',rgba('#e8b070',.6),{sit:1});}
  fpGlass(g,{});return c;}
// an elf's rooms in their cyan
function fpCyan(kind,seed,sc){const {c,g}=fpMk(WW,WH,sc),r=rng(seed),dk='#061214';
  g.fillStyle=lin(g,0,0,0,WH,[[0,'#c8fff8'],[.3,'#4ac0bc'],[1,'#0a2a2e']]);g.fillRect(0,0,WW,WH);g.fillStyle='#effffd';g.fillRect(3,1.4,WW-6,1);
  if(kind==='racks'){for(let i=0;i<4;i++){const x=2+i*9.6;g.fillStyle=dk;g.fillRect(x,10,7.4,50);for(let q=0;q<22;q++){if(r()<.35)continue;g.fillStyle=r()<.7?'#8ffff0':r()<.5?'#9cff8a':'#ffd070';g.fillRect(x+1+r()*5,12+q*2.1,.8,.6);}}
    g.save();g.globalCompositeOperation='lighter';g.fillStyle=lin(g,0,10,0,60,[[0,rgba('#7ff3e3',.25)],[1,rgba('#7ff3e3',0)]]);g.fillRect(0,10,WW,50);g.restore();}
  else if(kind==='bench'){g.fillStyle=dk;g.fillRect(3,44,34,2);for(let i=0;i<5;i++){const x=6+i*6.4,h=3+r()*5;g.fillStyle=rgba('#bffff6',.85);g.beginPath();g.ellipse(x,44-h/2,1.6,h/2,0,0,TAU);g.fill();}
    g.save();g.globalCompositeOperation='lighter';g.fillStyle=rad(g,20,40,0,22,[[0,rgba('#7ff3e3',.5)],[1,rgba('#7ff3e3',0)]]);g.fillRect(0,20,WW,40);g.restore();fpFig(g,28,52,.95,dk,rgba('#c8fff8',.8));}
  else{g.strokeStyle=rgba('#e8fffc',.35);g.lineWidth=.5;g.strokeRect(6,10,28,40);fpDesk(g,7,45,26,dk,'#c8fff8',0,0);for(let i=0;i<3;i++)fpFig(g,12+i*8,45,.8,dk,rgba('#c8fff8',.6),{sit:1});}
  fpGlass(g,{low:'#7ff3e3',lowA:.05});return c;}
// someone standing at the glass, the room's light behind
function fpMan(seed,sc){const {c,g}=fpMk(WW,WH,sc),r=rng(seed);g.fillStyle=lin(g,0,0,0,WH,[[0,'#ffe2b0'],[.4,'#c4824a'],[1,'#3a2414']]);g.fillRect(0,0,WW,WH);g.fillStyle='#fff6e0';g.fillRect(3,1.4,WW-6,1);
  fpDesk(g,22,46,15,'#1a100a','#ffd9a0','#d8f2ff',0);fpFig(g,9+r()*8,64,1.75,'#0e0806',rgba('#ffe2b0',.85));fpGlass(g,{sheen:.035});return c;}
// a dark room: the city's glow on its back wall, what stands in it against that, the glass full of the night
function fpDark(kind,seed,sc){const {c,g}=fpMk(WW,WH,sc),r=rng(seed),dk='#020306';
  g.fillStyle=lin(g,0,0,0,WH,[[0,'#06080e'],[.55,'#0a0b12'],[1,'#1a120e']]);g.fillRect(0,0,WW,WH);
  if(kind!=='empty'){fpDesk(g,2+r()*4,45,15,dk,rgba('#5a3a28',.6),kind==='screen'?'#2a3a5a':0,r()<.6?10:0);if(r()<.6)fpDesk(g,22,46,14,dk,rgba('#5a3a28',.5),0,0);}
  if(kind==='exit'){g.fillStyle='#168a54';g.fillRect(30,9,4,1.5);g.save();g.globalCompositeOperation='lighter';g.fillStyle=rad(g,32,9.8,0,5,[[0,rgba('#1fd07a',.22)],[1,rgba('#1fd07a',0)]]);g.fillRect(26,5,12,10);g.restore();}
  if(kind==='standby'){g.fillStyle='#ff8a3c';g.fillRect(12,41,.8,.8);}
  if(kind==='lamp'){g.save();g.globalCompositeOperation='lighter';g.fillStyle=rad(g,30,44,0,9,[[0,rgba('#ffb070',.4)],[1,rgba('#ffb070',0)]]);g.fillRect(20,34,20,20);g.restore();}
  // the glass: the sky high in it, the city's warmth low, a few of its lights
  fpGlass(g,{sky:'#5a6e98',skyA:.28,low:'#ff9a5a',lowA:.16,sheen:.06,edgeA:.16});
  g.save();g.globalCompositeOperation='lighter';for(let i=0;i<6;i++){g.fillStyle=rgba(r()<.8?'#ffcf86':'#dff4ff',.25+.4*r());g.fillRect(r()*WW,42+r()*16,.6,.6);}g.restore();return c;}
// A window the dream has fills with sand like the glass of an hourglass, as deep as the dream is: the sand pressed against the glass,
// the layers it came in by, its surface lit by the noon under the glass's top. One piece of sand for each shape of its surface (flat
// and tilted, or heaped where it pours in from above), its top at the piece's top, drawn only as deep as the window holds it; each
// once more softened for the speed, a little or a lot. Over it the window's frame again.
function fpSandIn(seed,sc,kind){const {c,g}=fpMk(WW,WH,sc),r=rng(seed),pk=8+r()*24,tilt=(r()-.5)*7,heap=kind?4+r()*4:0;
  const S=x=>clamp(4.5+tilt*(x/WW-.5)-heap*Math.pow(Math.max(0,1-Math.abs(x-pk)/15),1.6)+Math.sin(x*.7+seed)*.3,0,10);
  g.beginPath();g.moveTo(0,S(0));for(let x=1;x<=WW;x++)g.lineTo(x,S(x));g.lineTo(WW,WH);g.lineTo(0,WH);g.closePath();
  g.fillStyle=lin(g,0,0,0,WH,[[0,'#f2cf94'],[.35,'#dcaa6a'],[1,'#9e6c40']]);g.fill();g.save();g.clip();
  // the layers, following the surface near it and flattening with depth
  const LC=['#fff0d0','#8a5228','#f6dcae','#b0623a','#fff4dc','#6a4426','#e8b878'];
  for(let q=1;q<15;q++){const k=q/15;g.strokeStyle=rgba(LC[(q+((r()*2)|0))%LC.length],.16+.12*r());g.lineWidth=.8+r()*1.8;g.beginPath();
    for(let x=0;x<=WW;x+=2){const y=S(x)*(1-k)+q*4+Math.sin(x*.22+q*1.7)*.8*(1-k*.6);x?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();}
  for(let i=0;i<220;i++){g.fillStyle=r()<.5?rgba('#fff6e0',.2+.3*r()):rgba('#5a3418',.18+.3*r());g.fillRect(r()*WW,r()*WH,.45,.45);}
  g.fillStyle=lin(g,0,WH*.5,0,WH,[[0,rgba('#2a1408',0)],[1,rgba('#2a1408',.3)]]);g.fillRect(0,WH*.5,WW,WH*.5);
  // the noon on its skin, and the crest
  g.strokeStyle=rgba('#ffe8b8',.32);g.lineWidth=1.6;g.beginPath();for(let x=0;x<=WW;x++)x?g.lineTo(x,S(x)+1):g.moveTo(x,S(x)+1);g.stroke();g.restore();
  g.strokeStyle=rgba('#fff4dc',.7);g.lineWidth=.45;g.beginPath();for(let x=0;x<=WW;x++)x?g.lineTo(x,S(x)):g.moveTo(x,S(x));g.stroke();
  // the glass over it, catching the sun
  g.save();g.globalCompositeOperation='lighter';g.fillStyle=rgba('#fff8e8',.07);g.beginPath();g.moveTo(9+r()*5,0);g.lineTo(18+r()*5,0);g.lineTo(4,WH);g.lineTo(-5,WH);g.closePath();g.fill();g.restore();
  return{c,pk};}
// softened up and down by d of its own height (the speed), the top no longer a line
function fpBlurV(src,d){const c=document.createElement('canvas');c.width=src.width;c.height=src.height;const g=c.getContext('2d'),N=8,px=src.height*d;
  for(let i=0;i<N;i++){g.globalAlpha=1/(i+1);g.drawImage(src,0,(i/(N-1)-.5)*px);}return c;}
// the stone between the floors: a strip for the whole face, veined, its gold thread along the top and its fluting in each bay
function fpSpan(sc){const w=CORNER-X0F,{c,g}=fpMk(w,SPAN,sc),r=rng(631);
  g.fillStyle=lin(g,0,0,0,SPAN,[[0,'#1a1a22'],[.18,'#121218'],[.6,'#0c0c11'],[1,'#07070a']]);g.fillRect(0,0,w,SPAN);
  for(let i=0;i<90;i++){const x=r()*w,y=r()*SPAN;g.strokeStyle=rgba(r()<.5?'#3a3a48':'#000000',.12+.12*r());g.lineWidth=.3+r()*.4;g.beginPath();g.moveTo(x,y);g.bezierCurveTo(x+6,y+(r()-.5)*6,x+12,y+(r()-.5)*6,x+18+r()*20,y+(r()-.5)*8);g.stroke();}
  g.fillStyle=lin(g,0,2.4,0,4.6,[[0,C.goldL],[.5,C.gold],[1,C.goldDD]]);g.fillRect(0,2.4,w,2.2);g.fillStyle=rgba('#fff4d8',.5);g.fillRect(0,2.4,w,.4);
  for(let x=BAY/2-6;x<w-8;x+=BAY)for(let q=0;q<3;q++){const xx=x+q*6;g.fillStyle=rgba('#000000',.55);g.fillRect(xx,11,1.6,SPAN-20);g.fillStyle=rgba(C.gold,.32);g.fillRect(xx+1.6,11,.5,SPAN-20);g.fillStyle=rgba('#fff0c8',.12);g.fillRect(xx-.4,11,.4,SPAN-20);}
  g.fillStyle=rgba(C.gold,.35);g.fillRect(0,SPAN-5.4,w,.9);g.fillStyle=lin(g,0,SPAN-4,0,SPAN,[[0,rgba('#000000',0)],[1,rgba('#000000',.7)]]);g.fillRect(0,SPAN-4,w,4);
  for(let x=BAY/2;x<w;x+=BAY){g.fillStyle=lin(g,0,SPAN-6,0,SPAN+2,[[0,rgba('#000000',0)],[1,rgba('#1a1208',.25)]]);g.fillRect(x-14,SPAN-10,28,10);}
  return c;}
// a setback's ledge: stone, its gold lip, the housings of the lights let into it
function fpLedge(sc){const w=CORNER-X0F,{c,g}=fpMk(w,16,sc);g.fillStyle=lin(g,0,0,0,16,[[0,'#20202a'],[.3,'#17171f'],[1,'#0a0a0e']]);g.fillRect(0,0,w,16);
  g.fillStyle=lin(g,0,0,0,3.6,[[0,'#fff0c8'],[.35,C.goldL],[1,C.goldD]]);g.fillRect(0,0,w,3.6);g.fillStyle=rgba('#000000',.5);g.fillRect(0,3.6,w,.8);
  for(let x=BAY/2;x<w;x+=BAY*2){g.fillStyle='#050507';g.fillRect(x-4,12,8,3);g.fillStyle='#bffff6';g.fillRect(x-3,14,6,1);}
  return c;}
// a piece smeared down the face, as the speed of the fall smears it, a little (lv 0) or a lot (lv 1): painted once for each piece the
// first time it is wanted, in two passes of eight so that the smear runs smooth
function fpSmear(src,lv){const key=lv?'h':'l';let m=FP.sm.get(src);if(!m){m={};FP.sm.set(src,m);}if(m[key])return m[key];
  const e=lv?.45:.16,ext=Math.round(src.height*e),mid=document.createElement('canvas'),c=document.createElement('canvas');
  mid.width=c.width=src.width;mid.height=src.height+Math.round(ext/8)+1;c.height=src.height+ext+1;
  let g=mid.getContext('2d');for(let i=0;i<8;i++){g.globalAlpha=1/(i+1);g.drawImage(src,0,ext/8*i/7);}
  g=c.getContext('2d');for(let i=0;i<8;i++){g.globalAlpha=1/(i+1);g.drawImage(mid,0,ext*i/8);}
  return m[key]={c,ext:(c.height-src.height)/src.height};}
// the strips softened up and down for the speed, in their own height
function fpSoft(src){const c=document.createElement('canvas');c.width=src.width;c.height=src.height;const g=c.getContext('2d'),N=8,d=src.height*.12;
  for(let i=0;i<N;i++){g.globalAlpha=1/(i+1);g.drawImage(src,0,(i/(N-1)-.5)*d);}return c;}
function facePieces(){const sc=clamp((typeof cv!=='undefined'&&typeof cam!=='undefined'?cv.width/cam.viewW:2)*1.1,1.4,2.6);if(FP.lit.length&&Math.abs(FP.sc/sc-1)<.15)return FP;
  FP.sc=sc;FP.sm=new Map();
  FP.lit=['desks','desks2','meeting','files','lounge','blinds','corridor','panelled','desks','blinds'].map((k,i)=>fpLit(k,301+i*17,sc));
  FP.cyan=['racks','bench','glass'].map((k,i)=>fpCyan(k,401+i*13,sc));FP.man=[0,1,2].map(i=>fpMan(451+i*7,sc));
  FP.dark=['empty','desk','screen','exit','standby','lamp','desk','empty'].map((k,i)=>fpDark(k,501+i*11,sc));
  FP.sandIn=[0,1,0,1,1,0].map((k,i)=>{const p=fpSandIn(601+i*19,sc,k);return{c:[p.c,fpBlurV(p.c,.07),fpBlurV(p.c,.18)],pk:p.pk};});FP.span=fpSpan(sc);FP.spanS=fpSoft(FP.span);FP.ledge=fpLedge(sc);FP.ledgeS=fpSoft(FP.ledge);return FP;}
// a window's piece where it stands, sharp, a little smeared or much smeared by the speed (crossed over from each to the next), at
// strength a
function fpDraw(spr,x0,gy,w,h,blur,a){
  if(blur<6){ctx.globalAlpha=a;ctx.drawImage(spr,x0,gy,w,h);ctx.globalAlpha=1;return;}
  const k1=clamp((blur-6)/3,0,1),k2=clamp((blur-21)/3,0,1);
  if(k1<1){ctx.globalAlpha=a*(1-k1);ctx.drawImage(spr,x0,gy,w,h);}
  if(k2<1){const L=fpSmear(spr,0);ctx.globalAlpha=a*k1*(1-k2);ctx.drawImage(L.c,x0,gy,w,h*(1+L.ext));}
  if(k2>0){const Hh=fpSmear(spr,1);ctx.globalAlpha=a*k2;ctx.drawImage(Hh.c,x0,gy,w,h*(1+Hh.ext));}
  ctx.globalAlpha=1;}
// the top of a window's piece, down to lv, as smeared as the speed has it
function fpTop(spr,x0,gy,w,lv,blur){const c=blur<8?spr:fpSmear(spr,blur<21?0:1).c;ctx.drawImage(c,0,0,c.width,spr.height*lv/WH,x0,gy,w,lv);}
const FXL_full=()=>typeof FXL!=='undefined'&&FXL.q==='full';
// What the glass holds (full effects): the night behind him, the sky high in it, the dark of the street, the city's lights out of focus
// low down, the moon long in the glass's waver, a broad sheen across; the noon's white and the sand's gold in the dream. One small
// picture for each depth of the dream, made once, fixed to the screen and laid over the glass column by column, so that it stands
// still while the face goes by under it, as a reflection does.
const GLS=[];
function glassSpr(D){const k=Math.round(clamp(D,0,1)*8);if(GLS[k])return GLS[k];const u=k/8,w=96,h=160,c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d'),r=rng(941);
  g.fillStyle=lin(g,0,0,0,h,[[0,rgba(mix('#4a5a88','#fff2d8',u),lerp(.4,.2,u))],[.36,rgba(mix('#141a30','#ffe6b8',u),lerp(.1,.06,u))],[.68,rgba(mix('#1e1614','#f0c080',u),.06)],[1,rgba(mix('#ff9a5a','#e8a860',u),lerp(.3,.12,u))]]);g.fillRect(0,0,w,h);
  g.save();g.translate(w*.82,h*.11);g.scale(1,2.8);g.fillStyle=rad(g,0,0,0,w*.13,[[0,rgba(mix('#dfe6ff','#ffffff',u),lerp(.5,.6,u))],[.35,rgba(mix('#9fb0e8','#fff0c8',u),lerp(.16,.24,u))],[1,rgba('#ffffff',0)]]);g.fillRect(-w*.13,-w*.13,w*.26,w*.26);g.restore();
  g.globalCompositeOperation='lighter';for(const [x0,x1,a] of [[.08,.32,.06],[.4,.45,.07]]){g.fillStyle=rgba('#ffffff',a*(1+.3*u));g.beginPath();g.moveTo(w*(x0+.32),0);g.lineTo(w*(x1+.32),0);g.lineTo(w*(x1-.12),h);g.lineTo(w*(x0-.12),h);g.closePath();g.fill();}
  for(let i=0;i<46;i++){const x=r()*w,y=h*(.6+.38*r()),s=.5+r()*1.3,col=r()<.8?'#ffcf86':r()<.5?'#8fe8ff':'#ff8ad0';g.globalAlpha=(.15+.35*r())*(1-u);g.fillStyle=rad(g,x,y,0,s,[[0,rgba(col,1)],[1,rgba(col,0)]]);g.fillRect(x-s,y-s,s*2,s*2);}
  g.globalAlpha=1;return GLS[k]=c;}
function glassSky(D,yA,yB,cT,cH){const R=glassSpr(D),y0=cT-60,y1=cT+cH+60,a=Math.max(yA,y0),b=Math.min(yB,y1);if(b<=a)return;const sx=R.width/(CORNER-X0F),sy=R.height/(y1-y0);
  ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=1;
  for(let x=X0F;x<CORNER-BAY*.4;x+=BAY){const x0=x+9,w=BAY-18;ctx.drawImage(R,(x0-X0F)*sx,(a-y0)*sy,w*sx,(b-a)*sy,x0,a,w,b-a);}
  ctx.restore();}
// the wash of a light let into a setback's ledge down the face under it, made once: bright at the lamp, spreading down in a soft curve
let SCAL=null;function scallop(){if(SCAL)return SCAL;const w=64,h=128,c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
  const wash=a=>{g.save();g.translate(w/2,0);g.scale(.5,1);g.fillStyle=rad(g,0,0,0,h,[[0,rgba(C.cyan,.6*a)],[.1,rgba(C.cyan,.34*a)],[.42,rgba(C.cyan,.1*a)],[1,rgba(C.cyan,0)]]);g.fillRect(-w,0,w*2,h);g.restore();};
  wash(.35);g.save();g.beginPath();g.moveTo(w/2-2.5,0);g.quadraticCurveTo(w/2-26,h*.3,w/2-30,h);g.lineTo(w/2+30,h);g.quadraticCurveTo(w/2+26,h*.3,w/2+2.5,0);g.closePath();g.clip();wash(.65);g.restore();
  return SCAL=c;}
// a lit window's light smeared down the stone under it at speed, made once for each colour: strongest at the window
const SPILL=new Map();function spill(col){let s=SPILL.get(col);if(s)return s;s=document.createElement('canvas');s.width=4;s.height=64;const g=s.getContext('2d');
  g.fillStyle=lin(g,0,0,0,64,[[0,rgba(col,1)],[.15,rgba(col,.5)],[.45,rgba(col,.14)],[1,rgba(col,0)]]);g.fillRect(0,0,4,64);SPILL.set(col,s);return s;}
// ---------- the night's own movement, and the lens ----------
// soft dots of light, made once for each colour
const DOTS=new Map();function dot(col){let d=DOTS.get(col);if(d)return d;d=document.createElement('canvas');d.width=d.height=32;const g=d.getContext('2d');
  g.fillStyle=rad(g,16,16,0,16,[[0,rgba(col,1)],[.2,rgba(col,.55)],[.5,rgba(col,.14)],[1,rgba(col,0)]]);g.fillRect(0,0,32,32);DOTS.set(col,d);return d;}
// out past the corner the night goes on: two searchlights sweep up out of the city, the far towers' red lights blink, traffic runs
// out along the avenues and back, and a plane crosses high up (all of it as deep as he is awake)
// a searchlight's beam, made once for each colour: across it a soft bell brighter in its core, along it fading out, faint bands in
// it where the haze it lights is thicker
const BEAMS=new Map();function beamSpr(col){let b=BEAMS.get(col);if(b)return b;const w=48,h=256,c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d'),im=g.createImageData(w,h),n=parseInt(col.slice(1),16);
  for(let y=0;y<h;y++){const u=y/h,hw=.04+.96*u,a0=Math.pow(1-u,1.6)*(u<.015?u/.015:1)*(.8+.2*Math.sin(y*.09+1.3)*Math.sin(y*.031+.4));
    for(let x=0;x<w;x++){const d=Math.abs((x+.5)/w*2-1)/hw;if(d>=1)continue;const v=a0*(Math.exp(-d*d*4)*.75+.25*(1-d*d)),p=(y*w+x)*4;im.data[p]=n>>16&255;im.data[p+1]=n>>8&255;im.data[p+2]=n&255;im.data[p+3]=Math.round(clamp(v,0,1)*255);}}
  g.putImageData(im,0,0);BEAMS.set(col,c);return c;}
// the moon's light come down into the Pit's air, made once: like a beam, but carrying far down before it fades, and softer at its sides
let SHAFT=null;function shaftSpr(){if(SHAFT)return SHAFT;const w=48,h=256,c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d'),im=g.createImageData(w,h);
  for(let y=0;y<h;y++){const u=y/h,hw=.25+.75*u,a0=Math.pow(1-u,.7)*(u<.05?u/.05:1)*(.85+.15*Math.sin(y*.07));
    for(let x=0;x<w;x++){const d=Math.abs((x+.5)/w*2-1)/hw;if(d>=1)continue;const v=a0*Math.exp(-d*d*3)*(1-d*d),p=(y*w+x)*4;im.data[p]=184;im.data[p+1]=200;im.data[p+2]=240;im.data[p+3]=Math.round(clamp(v,0,1)*255);}}
  g.putImageData(im,0,0);return SHAFT=c;}
// (fr: how far the dream's tide of sand has come in over the city: what is behind it is gone)
function nightLive(t,top,bot,a,yMax,fr){const x0=CORNER+6,x1=W+240,yb=Math.min(bot,yMax);if(yb<=top||a<.02)return;
  ctx.save();ctx.beginPath();ctx.rect(x0,top,x1-x0,yb-top);ctx.clip();ctx.globalCompositeOperation='screen';
  {const k=1-clamp((fr-HOR)/70,0,1);if(k>0)for(const [bx,ph,per,col] of [[690,0,19,'#c8d8ff'],[940,2.1,27,'#ffe6c4']]){const by=HOR+70,ang=-Math.PI/2+Math.sin(t*TAU/per+ph)*.4,Lb=560,w1=56;
    ctx.save();ctx.translate(bx,by);ctx.rotate(ang-Math.PI/2);ctx.globalAlpha=a*k*.3;ctx.drawImage(beamSpr(col),-w1,0,w1*2,Lb);ctx.restore();
    ctx.globalAlpha=a*k*.6;ctx.drawImage(dot(col),bx-5,by-3,10,6);}}
  ctx.globalCompositeOperation='lighter';
  if(fr<HOR+6)for(let i=0;i<TOWERS.length;i++){const [x,y]=TOWERS[i];if(((t*.55+i*.37)%1)>.42)continue;ctx.globalAlpha=a;ctx.fillStyle='#ff5040';ctx.fillRect(x-.55,y-.55,1.1,1.1);ctx.globalAlpha=a*.45;ctx.drawImage(dot('#ff4a3a'),x-4,y-4,8,8);}
  {const vx=880,r=rng(733);for(const k of [3,5,7,9,11])for(let n=0;n<4;n++){const ang=Math.PI/2+k*.12,ex=vx+Math.cos(ang)*700,ey=HOR+Math.sin(ang)*700,sp=.025+r()*.035,ph=r(),out=r()<.5;
    let u=(t*sp+ph)%1;if(!out)u=1-u;u=u*u;const x=lerp(vx,ex,u),y=lerp(HOR,ey,u),sz=.5+u*2.2;if(y<fr)continue;ctx.globalAlpha=a*(.35+.5*u);ctx.drawImage(dot(out?'#ffe8c0':'#ff3a2a'),x-sz,y-sz,sz*2,sz*2);}}
  {const per=70,u=(t%per)/per,x=lerp(1180,560,u),y=58+u*22;if(((t*1.3)%1)<.12){ctx.globalAlpha=a;ctx.drawImage(dot('#ffffff'),x-4,y-4,8,8);}ctx.globalAlpha=a*.8;ctx.drawImage(dot(((t*.9)%1)<.5?'#ff4a3a':'#5aff7a'),x-1.6,y-1.6,3.2,3.2);}
  ctx.restore();}
// near the lens: out-of-focus motes of light going up past him, soft discs with a brighter rim (warm and cold at night, gold in the
// dream, the Pit's dust in the Pit), and the fewer the less the screen should move
const BOK=new Map();function bokSpr(col){let b=BOK.get(col);if(b)return b;b=document.createElement('canvas');b.width=b.height=64;const g=b.getContext('2d');
  g.beginPath();for(let i=0;i<6;i++){const an=i/6*TAU+.3;g.lineTo(32+Math.cos(an)*29,32+Math.sin(an)*29);}g.closePath();
  g.fillStyle=rad(g,32,32,0,30,[[0,rgba(col,.5)],[.8,rgba(col,.62)],[.94,rgba(col,.9)],[1,rgba(col,0)]]);g.fill();BOK.set(col,b);return b;}
function bokeh(t,v,D,pit){if(typeof cam==='undefined')return;const vw=cam.viewW,L=cam.x-vw/2,T=camTop(),Hv=vw/(typeof aspect==='number'?aspect:1.8),n=reduceMotion?3:8,r=rng(211);
  ctx.save();ctx.globalCompositeOperation='screen';
  for(let i=0;i<n;i++){const x=L+r()*vw,sz=24+r()*64,sp=(pit?90:220+v*1.15)*(.7+r()*.6)*(reduceMotion?.4:1),span=Hv+sz*2+500,y=T+Hv+sz-((r()*3000+t*sp)%span),k=r();
    const col=D>.5?(k<.6?'#ffd890':'#fff0c8'):pit?(k<.5?'#c8b8a8':'#ffb070'):(k<.45?'#ffcf86':k<.75?'#8fd8ff':'#ff9ad8');
    ctx.globalAlpha=(.035+.05*r())*(pit?.7:1);ctx.drawImage(bokSpr(col),x-sz/2,y-sz/2,sz,sz);}
  ctx.restore();}
// ---------- what moves ----------
function live(){const t=S.t,sy=S.scrollY||0,v=Math.abs(S.scrollYV||0),blur=clamp(v*.022,0,70);ctx.save();
  // (what moves covers all the screen shows: a phone held upright sees far above the still layer's top, where the layer's edge is only
  // stretched up, and there the floors, the night and the stars are drawn here)
  const cT=typeof camTop==='function'?camTop():0,cH=typeof cam!=='undefined'&&typeof aspect==='number'?cam.viewW/aspect:H;
  const top=Math.min(-110,cT-40),bot=Math.max(H+120,cT+cH+40),pit=pitOn(),rimY=pit?fy(S.pit.base):1e9,faceBot=Math.min(bot,rimY-36);
  SPAN_LAST.top=top;SPAN_LAST.bot=bot;
  if(top<RC.y0+2)upperNight(top);
  // the desert in his head, out past the corner over the night, as deep as the dream is
  const D=dreamK(),DM=dreamMax(D);DREAM_LAST.D=D;SPAN_LAST.n++;if(D>.004){DREAM_LAST.n++;desert(D,top,bot,t);}
  const i0=Math.floor((top-YREF+sy)/FH)-1,i1=Math.min(pit?Math.floor(S.pit.base/FH)-1:1e9,Math.ceil((bot-YREF+sy)/FH)+1);
  if(faceBot>top){
  ctx.save();ctx.beginPath();ctx.rect(X0F,top,CORNER-8-X0F,faceBot-top);ctx.clip();
  // above the roof's edge: the sky over the tower (only while he is still near the top)
  if(fy(0)>top){const y=fy(0);ctx.fillStyle=lin(ctx,0,top,0,y,[[0,'#04060e'],[1,'#141828']]);ctx.fillRect(X0F,top,CORNER-X0F,y-top);stars(ctx,X0F,CORNER,top,y-10,60,7,.6);}
  const FRM=new Path2D(),FRE=new Path2D(),lit=[],pour=[],thr=[],FPc=facePieces(),fl0=Math.max(0,i0),wTop=Math.max(top,fy(0)+SPAN),sbv=blur<8?0:blur<22?1:2;
  // the glass of every floor first, a window to a bay, split by a mullion and a transom: dark, lit warm, lit by an elf's cyan, someone
  // at the glass. A lit room shows its ceiling's light along the top and the dark of its desks along the bottom; some have blinds.
  // In the dream the windows fill with sand, each its own moment, like the glass of an hourglass (as deep as the dream has gone: it
  // does not drain when he comes back a little), a thread of it running in from the top of some while they fill, and many of them
  // pour it out over the sill
  for(let i=fl0;i<=i1;i++){const y=fy(i*FH),gy=y+SPAN;if(y>bot||gy+FH<top)continue;
    for(let x=X0F,j=0;x<CORNER-BAY*.4;x+=BAY,j++){const k=cell(i,j),x0=x+9,w=BAY-18,h=FH-SPAN,id=i*131+j,sd=D>.04?sandAt(i,j,DM):0,vr=hsh(id,173);
      const L=k===0?FPc.dark:k===2?FPc.cyan:k===3?FPc.man:FPc.lit,spr=L[(vr*L.length)|0],f=sd*sd*(3-2*sd),lv=h*(1-.9*f),hh=h-lv;
      // (the room only above the sand once the sand has much of it)
      if(f>.3)fpTop(spr,x0,gy,w,lv,blur);else fpDraw(spr,x0,gy,w,h,blur,1);if(k!==0&&sd<.8)lit.push(x0,gy+h,w,k===2?1:0);
      if(sd>0){const P=FPc.sandIn[(hsh(id,211)*FPc.sandIn.length)|0];
        if(hh>.4){const cS=P.c[sbv],a=clamp(D/.08,0,1),kx=w/WW,ya=gy+lv;ctx.globalAlpha=a;ctx.drawImage(cS,0,0,cS.width,cS.height*hh/WH,x0,ya,w,hh);ctx.globalAlpha=1;
          FRM.rect(x0+19.2*kx,ya,1.6*kx,hh);FRM.rect(x0,ya,.8*kx,hh);FRM.rect(x0+w-.8*kx,ya,.8*kx,hh);FRE.rect(x0+20.4*kx,ya,.4*kx,hh);if(lv<WTR*h/WH){FRM.rect(x0,gy+WTR*h/WH,w,1.5);FRE.rect(x0,gy+WTR*h/WH,w,.35);}}
        if(f<.97&&hsh(id,307)<.45)thr.push(x0+P.pk*w/WW,gy+WTR+1.6,gy+lv+2.5,id);
        if(hsh(id,491)<.5){const pa=sd*clamp((D-.16-hsh(id,977)*.9)/.2,0,1);
          if(pa>.02)pour.push(x0+w*(.25+.5*hsh(id,17)),gy+h-1,6+9*hsh(id,23)+3*D,(70+120*hsh(id,29))*(.6+.4*D)+blur*.8,pa,id);}}}}
  // the frames over the sand, in one batch (the noon on their gold), and the threads of sand running in, and the grains in them
  if(D>.04){ctx.fillStyle='#120c08';ctx.fill(FRM);ctx.fillStyle=rgba('#ffe8b0',.6);ctx.fill(FRE);}
  if(thr.length){const G=new Path2D(),Q=new Path2D(),sp=reduceMotion?.3:1;for(let n=0;n<thr.length;n+=4){const x=thr[n],y0=thr[n+1],y1=thr[n+2],id=thr[n+3];if(y1<=y0)continue;
      G.rect(x-.55+Math.sin(t*9+id)*.15,y0,1.1,y1-y0);for(let q=0;q<2;q++){const h2=hsh(id*2+q,433),u=(t*(1.4+h2)*sp+h2)%1;Q.rect(x-.9+h2*1.8,y0+u*(y1-y0),.7,1.4);}}
    ctx.globalAlpha=.85;ctx.fillStyle='#f0c880';ctx.fill(G);ctx.fillStyle='#fff4d6';ctx.fill(Q);ctx.globalAlpha=1;}
  // what the glass holds: the night behind him (the noon in the dream), still on the screen while the face goes by under it
  if(FXL_full())glassSky(D,wTop,faceBot,cT,cH);
  // then the stone over the glass's edges: the spandrel, black stone, veined, a thread of gold along its top, fluting in the middle of
  // each bay (one strip, softened at speed); and every tenth floor a setback, a ledge of stone with gold on its lip and cyan lights let
  // into it that wash the face under them
  for(let i=fl0;i<=i1;i++){const y=fy(i*FH);if(y>bot||y+SPAN+FH<top)continue;
    ctx.drawImage(blur>10?FPc.spanS:FPc.span,X0F,y,CORNER-X0F,SPAN);
    if(i%LEDGE===0){ctx.drawImage(blur>10?FPc.ledgeS:FPc.ledge,X0F,y-12,CORNER-X0F,16);
      {ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.85;const sc=scallop(),lh=96+blur*1.3;for(let x=X0F+BAY/2;x<CORNER;x+=BAY*2)ctx.drawImage(sc,x-27,y+3,54,lh);ctx.restore();}
      // dreaming: the sand drifted along the setback, and falling off its lip in curtains
      if(D>.05){const a=clamp((D-.05)/.3,0,1),dh=10+16*D;ctx.globalAlpha=a;ctx.drawImage(sandSprites().drift,X0F,y-10-dh,CORNER-X0F,dh+2);ctx.globalAlpha=1;
        for(let x=X0F+BAY*.5,q=0;x<CORNER-10;x+=BAY,q++){const h2=hsh(i*31+q,557);if(h2>.2+.75*D)continue;pour.push(x+(h2-.5)*20,y+3,16+18*h2,(110+160*h2)*D+blur,a*.9,i*31+q+7);}}}}
  sandPour(pour,t);
  // at speed each lit window smears down over the stone below it, where it just was
  if(blur>2){const a=clamp((blur-2)/30,0,1);ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.18*a;const L=blur*1.9,sw=spill(WARM_W[1]),sc2=spill(CYAN_W[1]);
    for(let n=0;n<lit.length;n+=4)ctx.drawImage(lit[n+3]?sc2:sw,lit[n],lit[n+1],lit[n+2],L);
    ctx.restore();}
  // the roof's edge itself, the gold coping he went over
  {const y=fy(0);if(y>top&&y<bot){ctx.fillStyle=lin(ctx,0,y-8,0,y+2,[[0,C.goldL],[.5,C.gold],[1,C.goldDD]]);ctx.fillRect(X0F,y-8,CORNER-X0F+14,8);ctx.fillStyle='#08080c';ctx.fillRect(X0F,y,CORNER-X0F+14,10);}}
  // the house's gold H on the face, once, rushing up past him
  {const y0=fy(HMARK.F),y1=y0+HMARK.h;if(y1>top&&y0<bot){const {x,w,h}=HMARK,bw=w*.24;
    glow(ctx,x,(y0+y1)/2,w*1.2,C.amber,.35,1.2);
    ctx.fillStyle=lin(ctx,x-w/2,0,x+w/2,0,[[0,C.goldD],[.3,C.gold],[.5,C.goldL],[.7,C.gold],[1,C.goldD]]);
    ctx.fillRect(x-w/2,y0,bw,h+blur*.4);ctx.fillRect(x+w/2-bw,y0,bw,h+blur*.4);ctx.fillRect(x-w/2,y0+h*.44,w,h*.14+blur*.3);
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=rgba(C.goldL,.35);ctx.fillRect(x-w/2+2,y0,3,h);ctx.fillRect(x+w/2-bw+2,y0,3,h);ctx.restore();
    ctx.strokeStyle=rgba('#000000',.5);ctx.lineWidth=1;ctx.strokeRect(x-w/2,y0,bw,h);ctx.strokeRect(x+w/2-bw,y0,bw,h);}}
  ctx.restore();
  // the face's shading over the moving parts: dark away from the corner, the city's warmth coming up from below (in the dream the noon
  // takes some of the dark off it, and the city's warmth goes)
  ctx.globalAlpha=1-.45*D;ctx.fillStyle=lin(ctx,X0F,0,CORNER,0,[[0,rgba('#000000',.42)],[.6,rgba('#000000',.1)],[1,rgba('#000000',0)]]);ctx.fillRect(X0F,top,CORNER-X0F,faceBot-top);ctx.globalAlpha=1;
  if(D<1){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=1-D;ctx.fillStyle=lin(ctx,0,H*.55,0,bot,[[0,rgba('#ff9a5a',0)],[1,rgba('#ff9a5a',.1)]]);ctx.fillRect(X0F,Math.min(H*.55,faceBot),CORNER-X0F,Math.max(0,faceBot-H*.55));ctx.restore();}
  // dreaming: the sun's glare along the corner, and the gold of the fins burning in it
  if(D>.004){ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=lin(ctx,CORNER,0,CORNER-220,0,[[0,rgba('#ffe6b8',.16*D)],[1,rgba('#ffe6b8',0)]]);ctx.fillRect(CORNER-220,top,220,faceBot-top);
    ctx.fillStyle=rgba('#ffe7a8',.24*D);for(let x=X0F,j=0;x<CORNER;x+=BAY,j++)if(j%2===0)ctx.fillRect(x-1.2,top,2.4,faceBot-top);
    ctx.fillStyle=rgba('#fff2cc',.4*D);ctx.fillRect(CORNER-5,top,6,faceBot-top);ctx.restore();}}
  // under the tower's foot: the Pit
  if(pit)pitLive(rimY,top,bot,t,v);
  // a cold haze hangs off the face in the middle of the picture, where he falls: the body reads dark against it (in the dream a warm one)
  {ctx.save();ctx.globalCompositeOperation='lighter';ctx.translate(450,250);ctx.scale(1,.8);ctx.globalAlpha=lerp(pit&&rimY<H?.32:.5,.34,D);ctx.drawImage(hazeSpr(D),-320,-320,640,640);ctx.restore();}
  // the city far below drifts up a little as he drops toward it (until the far side of the Pit stands up in front of it; in the dream
  // only what the tide of sand has not reached)
  const tf=D>.004?tideY(D,bot):HOR;
  {const fr=pit?HOR+(rimY-HOR)*KF:1e9,yb=Math.min(bot,fr-10),ya=Math.max(HOR+30,tf);if(yb>ya&&D<1){const r=rng(5);ctx.save();ctx.beginPath();ctx.rect(CORNER+6,ya,W+260-CORNER,yb-ya);ctx.clip();ctx.globalCompositeOperation='lighter';
    for(let i=0;i<40;i++){const x=CORNER+r()*(W+260-CORNER),y=HOR+40+((r()*500-sy*.05)%500+500)%500;ctx.fillStyle=rgba('#ffd59a',.25*r()*(1-D));ctx.fillRect(x,y,1.2,1.2);}ctx.restore();}}
  // the night going on out past the corner (as far down as the Pit's far side lets it show)
  if(D<1)nightLive(t,top,bot,1-D,pit?HOR+(rimY-HOR)*KF-10:1e9,tf);
  // the noon's light coming down through the sand in the air, in shafts from the sun across the face
  if(D>.7){const a=(D-.7)/.3,B=beamSpr('#fff0c8');ctx.save();ctx.globalCompositeOperation='screen';
    for(const [dx,w1,k] of [[-190,170,.16],[-380,120,.11]]){const L=Math.hypot(dx,bot-SUN.y),ang=Math.atan2(bot-SUN.y,dx);
      ctx.save();ctx.translate(SUN.x,SUN.y);ctx.rotate(ang-Math.PI/2);ctx.globalAlpha=k*a;ctx.drawImage(B,-w1/2,0,w1,L);ctx.restore();}ctx.restore();}
  // the wind of the fall: streaks going up past him, faster the faster he falls (warm with the sand in the dream)
  {const r=rng(17),col=D>.004?jmix('#d8e2ff','#ffe2b0',D):'#d8e2ff';ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<34;i++){const x=-140+r()*1220,L=40+r()*120+blur*2,sp=(400+v*.9)*(.7+r()*.6),y=bot-((r()*900+t*sp)%(bot-top+L+200));
    ctx.strokeStyle=rgba(col,(.03+r()*.08)*clamp(v/600+.3,0,1)*(pit&&rimY<H?clamp(v/500,0,1):1));ctx.lineWidth=.5+r()*.6;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(r()-.5)*4,y+L);ctx.stroke();}ctx.restore();}
  // and the sand on that wind, blowing up past him as thick as the dream is deep
  if(D>.02){const r=rng(23),n=Math.round((reduceMotion?26:90)*D),k=reduceMotion?.4:1,B=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
    for(let i=0;i<n;i++){const x=-140+r()*1220,sp=(300+v*.75)*(.6+r()*.8)*k,L=1.5+r()*3.5+blur*.35,y=bot-((r()*1300+t*sp)%(bot-top+200)),sw=r()*2.4,b=(r()<.5?1:0)+(r()<.55?0:2);
      B[b].rect(x+(reduceMotion?0:Math.sin(t*3+i)*sw),y,1.1,L);}
    for(let q=0;q<4;q++){ctx.fillStyle=rgba(q<2?'#f6dfae':'#c8995e',(q%2?.75:.42)*D);ctx.fill(B[q]);}}
  ctx.restore();}

// ---------- the Pit ----------
// Under the tower the city falls away into the Pit, an old quarry the city has filled with its junk for a hundred years and the poor
// have built down: its far side is shacks on junk to the floor, every row on a walkway, lamps in the windows, washing between them;
// its near walls are junk packed into the rock, with a girder, the floor of a hut, a car, pipes, a sign, a shelf of rubble and the
// cliff with the spike at its end sticking out of them. On the floor
// the Sump, a bar of boards and tin with hay heaped on its roof and the birds roosting along it. The layout is the story's
// (pitLayout), in the picture's x and in y down from the rim; S.pit is the fall in progress.
const KF=.45;                     // the far side goes by at this share of the speed of the near walls
const SHACK=['#181216','#1e171b','#221a1c','#16141a','#241b18','#1a1614','#1c1a1e'],TIN=['#3a3030','#2e2a2c','#463830','#30302e','#3e2c26'];
function pitOn(){return typeof S!=='undefined'&&!!S.pit&&S.pit.base!=null&&typeof pitLayout==='function';}
function hsh(i,s){let h=(Math.imul(i|0,374761393)+Math.imul(s|0,668265263))>>>0;h=Math.imul(h^(h>>>13),1274126177)>>>0;return((h^(h>>>16))>>>0)/4294967296;}
// a frame along a line: x out along it, y down across it (whichever way the line runs)
function axis(x0,y0,x1,y1,fn){const L=Math.hypot(x1-x0,y1-y0),a=Math.atan2(y1-y0,x1-x0);ctx.save();ctx.translate(x0,y0);ctx.rotate(a);if(Math.cos(a)<0)ctx.scale(1,-1);fn(L);ctx.restore();}
function path(Q){ctx.beginPath();ctx.moveTo(Q[0][0],Q[0][1]);for(let i=1;i<Q.length;i++)ctx.lineTo(Q[i][0],Q[i][1]);ctx.closePath();}
// a soft puff of smoke, made once
let PUFF=null;function puff(){if(PUFF)return PUFF;const cv=document.createElement('canvas');cv.width=cv.height=64;const g=cv.getContext('2d');
  g.fillStyle=rad(g,32,32,0,32,[[0,'rgba(120,112,112,.55)'],[.5,'rgba(100,94,96,.25)'],[1,'rgba(90,86,90,0)']]);g.fillRect(0,0,64,64);return PUFF=cv;}
// a neon word, its glow worked out once into its own canvas
const NEON={};
function neonImg(text,col,size){const key=text+col+size;if(NEON[key])return NEON[key];
  const cv=document.createElement('canvas'),g=cv.getContext('2d'),font='700 '+size+'px "Alegreya SC", Georgia, serif';g.font=font;const tw=g.measureText(text).width,pad=size*.7,w=tw+pad*2,h=size*1.5+pad,s=3;
  cv.width=Math.ceil(w*s);cv.height=Math.ceil(h*s);g.scale(s,s);g.font=font;g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';g.globalCompositeOperation='lighter';
  for(const [lw,a] of [[size*.55,.06],[size*.32,.12],[size*.16,.28]]){g.strokeStyle=rgba(col,a);g.lineWidth=lw;g.strokeText(text,w/2,h/2);}
  g.strokeStyle=rgba(col,.95);g.lineWidth=size*.075;g.strokeText(text,w/2,h/2);g.strokeStyle='rgba(255,246,236,.8)';g.lineWidth=size*.025;g.strokeText(text,w/2,h/2);
  return NEON[key]={cv,w,h};}
function neonAt(text,col,size,x,y,a){const N=neonImg(text,col,size);ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a;ctx.drawImage(N.cv,x-N.w/2,y-N.h/2,N.w,N.h);ctx.restore();}
function pitLive(rimY,top,bot,t,v){const L=pitLayout(),P=S.pit,farRim=HOR+(rimY-HOR)*KF;jkFrame();if(farRim>bot+60){jkAhead(rimY,top,bot,v,L);return;}
  pitDraw(rimY,top,bot,t,v,L,P,farRim);jkLater();}
function pitDraw(rimY,top,bot,t,v,L,P,farRim){
  // the far side, through the open air under the tower's foot and out past its corner
  ctx.save();ctx.beginPath();const fa=Math.max(top,farRim-70);ctx.rect(CORNER-8,fa,W+420-CORNER,bot-fa);if(rimY<bot)ctx.rect(X0F-80,Math.max(top,rimY),CORNER+72-X0F,bot-Math.max(top,rimY));ctx.clip();
  farWall(farRim,top,bot,L,t,v);ctx.restore();
  rimBand(rimY,top,bot,t);
  if(rimY>bot){jkAhead(rimY,top,bot,v,L);return;}
  junkWalls(rimY,top,bot);
  for(const it of P.items){if(rimY+it.top-160>bot||rimY+it.bot+160<top)continue;
    if(it.key==='girder')drawGirder(it,rimY,t);else if(it.key==='balcony')drawBalcony(it,rimY,t);else if(it.key==='car')drawCar(it,rimY,t);
    else if(it.key==='pipes')drawPipes(it,rimY,t);else if(it.key==='neon')drawNeon(it,rimY,t);else if(it.key==='rubble')drawRubble(it,rimY,t);
    else if(it.key==='cliff')drawCliff(it,rimY,t,P,L);}
  drawBar(rimY,top,bot,L,P,t);
  for(const b of P.birds)if(!b.fly)drawBird(b,b.x,rimY+b.y,t);
  // the air of the Pit: cold up by the rim, the warmth of its fires coming up from the floor
  {const u=clamp((top-rimY)/L.floor,0,1);ctx.save();ctx.globalCompositeOperation='lighter';
    ctx.fillStyle=lin(ctx,0,top,0,bot,[[0,rgba('#5a6a9a',.05*(1-u))],[1,rgba('#ff8a4a',.03+.07*u)]]);ctx.fillRect(-200,Math.max(top,rimY),1400,bot-Math.max(top,rimY));ctx.restore();}}
// The air of the Pit between its far side and him (its haze and the glow of the windows are painted into the far side's pieces,
// farTile): the pools of the lamps and the braziers on the boards, the glow of the signs, mist lying in bands at three depths and
// drifting, and (full effects) the moon's light coming down into it in two shafts from the far rim with the dust turning in them.
// All of it slides with the far side.
function pitAir(farRim,fl,y0,y1,t,signs){if(y1<=y0)return;
  // (only across what the screen shows)
  const vw=typeof cam!=='undefined'?cam.viewW:W,cx=typeof cam!=='undefined'?cam.x:W/2,XL=cx-vw/2-40,XR=cx+vw/2+40,inX=(x,r)=>x+r>XL&&x-r<XR;
  ctx.save();ctx.globalCompositeOperation='lighter';const WC=['#ffcf86','#7ff3e3','#ff6ad0'];
  // the pools of the lamps hung along the walkways and of the braziers, warm on the boards round them (a few in each stretch of the
  // far side, flickering)
  {const m0=Math.floor((y0-farRim)/120)-1,m1=Math.ceil((y1-farRim)/120)+1;for(let m=Math.max(0,m0);m<=m1;m++)for(let q=0;q<2;q++){const h1=hsh(m*7+q,877);if(h1<.35)continue;
    const x=-150+hsh(m*7+q,881)*1250,y=farRim+m*120+hsh(m*7+q,887)*120,R=40+h1*50;if(!inX(x,R))continue;const fl2=reduceMotion?1:.85+.15*Math.sin(t*(3+h1*4)+m+q);ctx.globalAlpha=.12*fl2;ctx.drawImage(dot(h1<.85?'#ffb060':'#ff7a40'),x-R,y-R*.75,R*2,R*1.5);}}
  for(let n=0;n<signs.length;n+=4){const x=signs[n],y=signs[n+1],w=signs[n+2],s=w*2.2;if(!inX(x,s))continue;ctx.globalAlpha=.16;ctx.drawImage(dot(WC[(signs[n+3]+1)%3]),x-s,y-s*.7,s*2,s*1.4);}
  ctx.globalCompositeOperation='screen';const dr=reduceMotion?0:t;
  for(let b=0;b<3;b++){const yb=farRim+(fl-farRim)*(.22+.27*b);if(yb<y0-40||yb>y1+40)continue;const P=cpuff(b===2?'#7a5a5a':'#6a7088');
    for(let i=0;i<6;i++){const h1=hsh(b*17+i,811),x=((h1*1500+dr*(5+3*b)*(h1<.5?1:-1))%1500+1500)%1500-260,w=180+h1*160,hh=18+hsh(i,823)*18;if(!inX(x,w/2))continue;ctx.globalAlpha=.08+.05*hsh(b+i,829);ctx.drawImage(P,x-w/2,yb-hh/2+hsh(i,831)*16,w,hh);}}
  if(FXL_full()){const B=shaftSpr(),L=(fl-farRim)*.95,tn=Math.tan(.4);
    for(const [x,w1,k] of [[640,96,.12],[860,74,.09]]){const xa=x-(y0-farRim)*tn,xb=x-(y1-farRim)*tn;if(Math.max(xa,xb)+w1<XL||Math.min(xa,xb)-w1>XR)continue;
      ctx.save();ctx.translate(x,farRim-6);ctx.rotate(.4);ctx.globalAlpha=k;ctx.drawImage(B,-w1/2,0,w1,L);ctx.restore();}
    ctx.globalCompositeOperation='lighter';ctx.fillStyle='#e6ecff';
    for(let i=0;i<30;i++){const h1=hsh(i,841),h2=hsh(i,853),sh=i%2,bx=[640,860][sh],u=(h1+dr*.012*(.5+h2))%1,ux=-Math.sin(.4),uy=Math.cos(.4),d=u*L,o=(h2-.5)*(30+120*u);
      const x=bx+ux*d+uy*o,y=farRim-6+uy*d-ux*o;if(y<y0||y>y1)continue;ctx.globalAlpha=(.18+.3*hsh(i,859))*(1-u);ctx.fillRect(x,y,.9,.9);}}
  ctx.restore();}
// the far side: rows of shacks on junk, down to the floor
function farWall(farRim,top,bot,L,t,v){const y0=Math.max(top,farRim),fl=farRim+L.floor*KF,y1=Math.min(bot,fl),sm=clamp(v*KF*.018,0,26);
  if(y1>y0){ctx.fillStyle=lin(ctx,0,farRim,0,fl,[[0,'#181825'],[.45,'#0f0c14'],[.8,'#150e10'],[1,'#281611']]);ctx.fillRect(-200,y0,1400,y1-y0);}
  // the far rim against the night: a ragged line of shacks, poles and a water tank
  if(farRim>top-60&&farRim<bot+10){const r=rng(4411);let x=CORNER-30;ctx.fillStyle='#0a080c';
    while(x<1120){const w=20+r()*46,h=8+r()*22;ctx.fillRect(x,farRim-h,w,h+2);if(r()<.25){ctx.fillRect(x+w*.5,farRim-h-16,1.4,16);}
      if(r()<.3){ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=rgba('#ffcf86',.6);ctx.fillRect(x+4,farRim-h+4,4,3);ctx.restore();ctx.fillStyle='#0a080c';}x+=w+r()*14;}}
  // the rows, from pieces painted once (the next piece down painted ahead of need); what lights up in them is drawn over them below
  const lit=[],signs=[],bulbs=[];
  if(y1>y0){const m0=Math.max(0,Math.floor((y0-farRim)/FW.FT)),m1=Math.floor((y1-farRim)/FW.FT);
    if(S.pit&&S.pit.look&&m0>0)jkGet('f:'+(m0-1),()=>farTile(m0-1,L),false);
    for(let m=m0;m<=m1+1;m++){const T=jkGet('f:'+m,()=>farTile(m,L),m<=m1);if(!T||m>m1)continue;ctx.drawImage(T.cv,T.x0,farRim+T.y0,T.w,T.h);
      for(let n=0;n<T.lit.length;n+=5)lit.push(T.lit[n],farRim+T.lit[n+1],T.lit[n+2],T.lit[n+3],T.lit[n+4]);
      for(let n=0;n<T.signs.length;n+=4)signs.push(T.signs[n],farRim+T.signs[n+1],T.signs[n+2],T.signs[n+3]);
      for(let n=0;n<T.bulbs.length;n+=4)bulbs.push(T.bulbs[n],farRim+T.bulbs[n+1],T.bulbs[n+2],T.bulbs[n+3]);}}
  // (the far side sits back in the air of the Pit, painted into its pieces; its windows burn through it)
  ctx.save();ctx.globalCompositeOperation='lighter';const WC=['#ffcf86','#7ff3e3','#ff6ad0'];
  for(let n=0;n<lit.length;n+=5){const x=lit[n],y=lit[n+1],w=lit[n+2],h2=lit[n+3];ctx.fillStyle=WC[lit[n+4]];ctx.globalAlpha=.5;ctx.fillRect(x,y,w,h2);if(sm>1){ctx.globalAlpha=.14;ctx.fillRect(x,y+h2,w,sm);}}
  // signs over a door or two, glowing; strings of bulbs from shack to shack
  for(let n=0;n<signs.length;n+=4){const x=signs[n],y=signs[n+1],w=signs[n+2],col=WC[(signs[n+3]+1)%3];ctx.globalAlpha=.55+.25*Math.sin(t*3+x);ctx.fillStyle=col;ctx.fillRect(x-w/2,y-2,w,4);ctx.globalAlpha=.12;ctx.fillRect(x-w,y-7,w*2,14);}
  for(let n=0;n<bulbs.length;n+=4){const x0=bulbs[n],y0=bulbs[n+1],w=bulbs[n+2],k=bulbs[n+3];for(let q=0;q<=10;q++){const u=q/10,x=x0+w*u,y=y0+Math.sin(u*Math.PI)*7;ctx.globalAlpha=.4+.3*Math.sin(t*2+q+k*9);ctx.fillStyle=WC[(q+((k*3)|0))%3===0?2:0];ctx.fillRect(x-.8,y,1.6,1.8);}}
  ctx.restore();
  pitAir(farRim,fl,y0,y1,t,signs);
  // the floor far across: mud, and the fires the Pit cooks on
  if(fl<bot){ctx.fillStyle='#0d0a0b';ctx.fillRect(-200,fl,1400,bot-fl);const r=rng(66);
    for(let i=0;i<12;i++){const x=-100+r()*1200,y=fl+4+r()*30,a=.5+.3*Math.sin(t*(5+r()*4)+i);glow(ctx,x,y,14+r()*10,'#ff9a4a',.25*a,.7);ctx.fillStyle=rgba('#ffcf86',.7*a);ctx.fillRect(x-1,y-2,2,2);}}}
// the tower's foot and the lip of the Pit, the width of the picture
function rimBand(rimY,top,bot,t){if(rimY<top-80||rimY>bot+60)return;
  // the plinth: black granite, gold along its top
  ctx.fillStyle=lin(ctx,0,rimY-36,0,rimY,[[0,'#141219'],[1,'#07060a']]);ctx.fillRect(X0F,rimY-36,CORNER+6-X0F,36);
  ctx.fillStyle=lin(ctx,0,rimY-38,0,rimY-34,[[0,C.goldL],[1,C.goldD]]);ctx.fillRect(X0F,rimY-38,CORNER+6-X0F,3);
  ctx.fillStyle=rgba(C.gold,.3);ctx.fillRect(X0F,rimY-6,CORNER+6-X0F,1);
  // out past the corner the street runs to the edge: its kerb, a rail along it, bent where something went through it
  ctx.fillStyle='#17161b';ctx.fillRect(CORNER+6,rimY-9,W+420-CORNER,9);ctx.fillStyle='rgba(255,207,134,.18)';ctx.fillRect(CORNER+6,rimY-9,W+420-CORNER,1);
  ctx.strokeStyle='#3a3a40';ctx.lineWidth=2;ctx.beginPath();for(let x=CORNER+30;x<W+400;x+=46){ctx.moveTo(x,rimY-9);ctx.lineTo(x,rimY-30);}
  ctx.moveTo(CORNER+20,rimY-28);ctx.lineTo(760,rimY-28);ctx.quadraticCurveTo(790,rimY-14,812,rimY+6);ctx.moveTo(840,rimY-22);ctx.lineTo(W+400,rimY-28);ctx.stroke();
  // a sign on the rail: keep out
  ctx.fillStyle='#c8a03a';ctx.fillRect(700,rimY-44,26,16);ctx.fillStyle='#1a1408';for(let q=0;q<4;q++)ctx.fillRect(702+q*6,rimY-43,3,14);
  // the lip: broken concrete, the rebar hanging out of its underside
  ctx.beginPath();ctx.moveTo(-220,rimY);ctx.lineTo(1320,rimY);for(let x=1320;x>=-220;x-=18)ctx.lineTo(x,rimY+16+hsh(x,5)*16);ctx.closePath();
  ctx.fillStyle=lin(ctx,0,rimY,0,rimY+32,[[0,'#3a3a40'],[.5,'#26262b'],[1,'#151518']]);ctx.fill();
  ctx.strokeStyle='#4a3022';ctx.lineWidth=1.3;ctx.beginPath();for(let x=-210;x<1300;x+=26){const r=hsh(x,9);if(r<.4)continue;const L=8+r*26;ctx.moveTo(x,rimY+20);ctx.lineTo(x+(r-.7)*10,rimY+20+L);}ctx.stroke();
  ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(-220,rimY+30,1540,26);
  rimJunk(rimY);}
// ---------- the junk the Pit is made of ----------
// The Pit's walls are the city's junk, packed in over the years and built on: crushed cars, fridges and washers, oil drums, tyres in
// stacks, crates and pallets, sheets of tin, mattresses, doors, bed frames, televisions, bags of rubbish, and the small stuff in every
// gap. The near walls stand in from the Pit's own line (what he hits is the story's, pitLayout(); the junk is the picture) and the far
// side is the same junk with the shacks built on it. Both are painted once in pieces at the screen's scale and slid up the picture
// as he falls: one piece a frame ahead of need, one more if the screen shows one not painted yet; a piece not painted stands in as a
// plain dark mass until it is.
const JK={sc:0,tiles:new Map(),pit:null,budget:0,spare:0,later:[],max:34,painted:0,miss:0,ms:{},pool:[]};
function jkScale(){const w=typeof cv!=='undefined'&&cv&&cv.width?cv.width:1800,cw=typeof cssW==='number'&&cssW>0?cssW:900;return clamp(w/(cw<640?560:W),1,2.4);}
function jkFree(){if(!JK.tiles.size&&!JK.pool.length)return;for(const T of JK.tiles.values())if(T.cv)T.cv.width=T.cv.height=0;JK.tiles.clear();
  for(const cn of JK.pool)cn.width=cn.height=0;JK.pool.length=0;JK.pit=null;}
// a piece by its key, painted now if the frame has budget left; the least recently used go first when there are too many. One piece
// a frame is painted ahead of need; one more may be painted for a piece the screen shows now.
function jkGet(key,make,need){const T=JK.tiles.get(key);if(T){JK.tiles.delete(key);JK.tiles.set(key,T);return T;}
  if(!need){JK.later.push([key,make]);return null;}
  if(JK.budget<=0&&JK.spare<=0){JK.miss++;return null;}if(JK.budget>0)JK.budget--;else JK.spare--;
  // (painted, miss and ms are for the tools: how many pieces were painted, how often one the screen showed was not ready, the time)
  JK.painted++;const t0=performance.now(),N=make(),k0=key[0];JK.ms[k0]=(JK.ms[k0]||0)+performance.now()-t0;JK.ms[k0+'#']=(JK.ms[k0+'#']||0)+1;
  JK.tiles.set(key,N);
  // (a piece let go keeps its canvas for the next one of its size, a few at most)
  while(JK.tiles.size>JK.max){const k=JK.tiles.keys().next().value,o=JK.tiles.get(k);if(o&&o.cv){if(JK.pool.length<4)JK.pool.push(o.cv);else o.cv.width=o.cv.height=0;}JK.tiles.delete(k);}
  return N;}
// every frame: a new fall or a new screen scale starts the pieces over
function jkFrame(){const sc=jkScale();if(JK.pit!==S.pit||!JK.sc||Math.abs(sc/JK.sc-1)>.15){jkFree();JK.sc=sc;JK.pit=S.pit;}JK.budget=1;JK.spare=1;JK.later.length=0;}
// the end of the frame: the first piece wanted ahead that is not painted yet, if the frame has not painted one already
function jkLater(){for(const [key,make] of JK.later){if(JK.tiles.has(key))continue;if(JK.budget>0)jkGet(key,make,true);return;}}
function jkCanvas(w,h,sc,x0,y0){const W2=Math.max(1,Math.ceil(w*sc)),H2=Math.max(1,Math.ceil(h*sc)),i=JK.pool.findIndex(c=>c.width===W2&&c.height===H2);let cn,g;
  if(i>=0){cn=JK.pool.splice(i,1)[0];g=cn.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,W2,H2);}
  else{cn=document.createElement('canvas');cn.width=W2;cn.height=H2;g=cn.getContext('2d');}
  g.setTransform(W2/w,0,0,H2/h,-x0*W2/w,-y0*H2/h);return{cn,g};}
function gpath(g,Q){g.beginPath();g.moveTo(Q[0][0],Q[0][1]);for(let i=1;i<Q.length;i++)g.lineTo(Q[i][0],Q[i][1]);g.closePath();}
function rrect(g,x,y,w,h,r){r=Math.min(r,w/2,h/2);g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
// colours: car paint, white goods gone grey, drums, wood, tin, rubbish bags, mattress ticking, a painted door
const JC={car:['#4a2222','#22383a','#4a4436','#262c3c','#4a301c','#2e3a26','#565046'],appl:['#6a665e','#5a5e5c','#4e5650','#6a5e4a','#5e5a52'],
  drum:['#5a2418','#1f3048','#5a4a1c','#22382a','#3a3a3e','#4a1e14'],wood:['#4a3424','#5a3e28','#3e2c1e','#6a4a30'],tin:['#4a2c1c','#3a3a3e','#4e3626','#2e3034','#3a3226'],
  bag:['#0e0e10','#13171a','#1a2018','#1c1a20','#26262c'],mat:['#3a4250','#4a4a52','#4e4638','#3e3a48'],door:['#3a2a20','#2a3a3a','#4a3a2a','#3a2e3a'],metal:['#4a4a52','#3e3a3a','#52504a']};
const JDARK='#060509';
// (colours are mixed a great many times over; the blend is taken to a sixteenth and each mix kept)
const JMC=new Map();
function jmix(a,b,t){let A=JMC.get(a);if(!A){A=new Map();JMC.set(a,A);}let R=A.get(b);if(!R){R=[];A.set(b,R);}const q=Math.round(clamp(t,0,1)*16);return R[q]||(R[q]=mix(a,b,q/16));}
function jCol(k,r){const L=k==='car'?JC.car:k==='fridge'||k==='washer'||k==='tv'?JC.appl:k==='drum'?JC.drum:k==='crate'||k==='pallet'||k==='plank'||k==='chair'?JC.wood:
  k==='tin'?JC.tin:k==='bags'?JC.bag:k==='mat'?JC.mat:k==='door'?JC.door:JC.metal;return L[(r()*L.length)|0];}
// the lit top edge of a piece: the cold of the sky high up, the fires' warmth from below further down
function rimTop(g,pts,o){const a=o.lt*o.lt*(o.rimK??1);if(a<.04)return;g.strokeStyle=rgba(jmix('#9fb4e6','#ffa060',o.warm||0),.12+.26*a);g.lineWidth=1.1*(o.u||1);
  g.beginPath();pts.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.stroke();}
// one piece of junk, centred on (x, y), turned by a, w across and h high in its own frame. lt is how much light reaches it (1 at the
// face of the wall, less deeper in), u the size of its small details (1 near, less on the far side)
// a piece a few pixels across (the far side's): its shape and the one mark that says what it is, nothing smaller
function junkSmall(g,o){const {k,x,y,w,h}=o,lt=o.lt,base=jmix(o.col,JDARK,1-lt),hw=w/2,hh=h/2;
  g.save();g.translate(x,y);if(o.a)g.rotate(o.a);g.fillStyle=base;
  if(k==='car'){gpath(g,[[-hw,hh],[-hw,-hh*.1],[-hw*.62,-hh*.24],[-hw*.36,-hh],[hw*.3,-hh],[hw*.56,-hh*.22],[hw,-hh*.06],[hw,hh]]);g.fill();
    g.fillStyle='#07080a';g.fillRect(-hw*.5,-hh*.84,hw,hh*.54);g.beginPath();g.arc(-hw*.62,hh,hh*.55,Math.PI,0);g.arc(hw*.64,hh,hh*.55,Math.PI,0);g.fill();}
  else if(k==='tyre'){g.strokeStyle=jmix('#121214',JDARK,1-lt);g.lineWidth=Math.max(.5,w*.16);const n=o.n||1;
    if(n===1){g.beginPath();g.arc(0,0,hw*.74,0,TAU);g.stroke();}else{const th=h/n;g.beginPath();for(let i=0;i<n;i++){const yy=-hh+th*(i+.5);g.moveTo(hw*.9,yy);g.ellipse(0,yy,hw*.9,th*.36,0,0,TAU);}g.stroke();}}
  else if(k==='bags'){const r=rng(o.seed|0),n=2+Math.floor(r()*3);for(let i=0;i<n;i++){g.fillStyle=jmix(JC.bag[(r()*JC.bag.length)|0],JDARK,(1-lt)*.6);g.beginPath();g.ellipse(-hw+w*(i+.5)/n,hh-h*.45,w/n*.48,h*.42,0,0,TAU);g.fill();}}
  else if(k==='washer'){g.fillRect(-hw,-hh,w,h);g.fillStyle='#08090b';g.beginPath();g.arc(0,hh*.12,Math.min(w,h)*.3,0,TAU);g.fill();}
  else if(k==='drum'){g.fillRect(-hw,-hh,w,h);g.fillStyle=jmix(base,'#000000',.42);g.fillRect(-hw,-hh+h*.3,w,h*.09);g.fillRect(-hw,-hh+h*.63,w,h*.09);}
  else if(k==='fridge'){g.fillRect(-hw,-hh,w,h);g.fillStyle=jmix(base,'#000000',.45);g.fillRect(-hw,-hh*.4,w,Math.max(.4,h*.05));}
  else if(k==='tin'){g.fillRect(-hw,-hh,w,h);g.fillStyle='rgba(0,0,0,.35)';for(let xx=-hw+1.2;xx<hw;xx+=2.4)g.fillRect(xx,-hh,.5,h);}
  else g.fillRect(-hw,-hh,w,h);
  g.restore();}
function junk(g,o){if((o.u||1)<.3){junkSmall(g,o);return;}const {k,x,y,w,h}=o,lt=o.lt,u=o.u||1,base=jmix(o.col,JDARK,1-lt),edge=jmix(base,'#000000',.55),r=rng(o.seed|0),hw=w/2,hh=h/2,dim=c=>jmix(c,JDARK,1-lt);
  g.save();g.translate(x,y);g.rotate(o.a||0);g.lineJoin='round';
  if(k==='car'){
    const Q=[[-hw,hh],[-hw,-hh*.1],[-hw*.62,-hh*.24],[-hw*.36,-hh],[hw*.3,-hh],[hw*.56,-hh*.22],[hw,-hh*.06],[hw,hh]];
    gpath(g,Q);g.fillStyle=base;g.fill();g.strokeStyle=edge;g.lineWidth=1.2*u;g.stroke();
    // the windows, a glint on one; the wheel arches and what is left of a tyre in them; rust; the dents of the press
    g.fillStyle='#07080a';gpath(g,[[-hw*.58,-hh*.26],[-hw*.34,-hh*.86],[-hw*.03,-hh*.86],[-hw*.03,-hh*.26]]);g.fill();
    gpath(g,[[hw*.03,-hh*.26],[hw*.03,-hh*.86],[hw*.27,-hh*.86],[hw*.5,-hh*.26]]);g.fill();
    g.fillStyle=rgba('#a8c0c8',.1*lt);gpath(g,[[hw*.1,-hh*.8],[hw*.15,-hh*.8],[hw*.08,-hh*.32],[hw*.03,-hh*.32]]);g.fill();
    for(const s of [-.62,.64]){g.fillStyle='#040405';g.beginPath();g.arc(hw*s,hh,hh*.6,Math.PI,0);g.fill();
      if(r()<.6){g.fillStyle=dim('#1a1a1e');g.beginPath();g.arc(hw*s,hh,hh*.48,Math.PI,0);g.fill();g.fillStyle=dim('#4a4a50');g.beginPath();g.arc(hw*s,hh,hh*.17,Math.PI,0);g.fill();}}
    g.strokeStyle=dim('#7a7a80');g.lineWidth=2.4*u;g.beginPath();g.moveTo(hw*.86,hh*.42);g.lineTo(hw,hh*.42);g.stroke();
    for(let i=0;i<9;i++){g.fillStyle=rgba('#6a3218',.22+.3*r());g.fillRect(-hw+r()*w,-hh*.2+r()*hh*1.1,(3+r()*12)*u,(2+r()*6)*u);}
    g.strokeStyle=rgba('#000000',.42);g.lineWidth=u;g.beginPath();for(let i=0;i<3;i++){const s=-hw+r()*w;g.moveTo(s,-hh*.2);g.lineTo(s+(r()-.5)*20*u,hh*.6);}g.stroke();
    rimTop(g,[[-hw,-hh*.1],[-hw*.62,-hh*.24],[-hw*.36,-hh],[hw*.3,-hh],[hw*.56,-hh*.22],[hw,-hh*.06]],o);}
  else if(k==='fridge'){rrect(g,-hw,-hh,w,h,w*.12);g.fillStyle=base;g.fill();g.strokeStyle=edge;g.lineWidth=1.2*u;g.stroke();
    g.strokeStyle=jmix(base,'#000000',.45);g.lineWidth=1.4*u;g.beginPath();g.moveTo(-hw+3*u,-hh*.38);g.lineTo(hw-3*u,-hh*.38);g.stroke();
    g.fillStyle=dim('#2a2a2e');g.fillRect(hw*.62,-hh*.78,w*.08,h*.16);g.fillRect(hw*.62,-hh*.26,w*.08,h*.28);
    for(let i=0;i<7;i++){g.fillStyle=rgba('#5a3a1e',.18+.3*r());g.fillRect(-hw+r()*w,-hh+r()*h,(2+r()*8)*u,(2+r()*10)*u);}
    if(r()<.45){g.fillStyle=rgba('#000000',.35);gpath(g,[[-hw*.7,-hh*.1],[hw*.2,-hh*.02],[hw*.1,hh*.12],[-hw*.6,hh*.06]]);g.fill();}
    rimTop(g,[[-hw,-hh+w*.12],[-hw+w*.12,-hh],[hw-w*.12,-hh],[hw,-hh+w*.12]],o);}
  else if(k==='washer'){g.fillStyle=base;g.fillRect(-hw,-hh,w,h);g.strokeStyle=edge;g.lineWidth=1.2*u;g.strokeRect(-hw,-hh,w,h);
    g.fillStyle=jmix(base,'#000000',.35);g.fillRect(-hw,-hh,w,h*.18);
    const R=Math.min(w,h)*.3;g.beginPath();g.arc(0,hh*.12,R,0,TAU);g.fillStyle='#08090b';g.fill();g.strokeStyle=dim('#7a7a80');g.lineWidth=2*u;g.stroke();
    g.fillStyle=rgba('#a8c0c8',.12*lt);g.beginPath();g.arc(-R*.25,hh*.04,R*.38,0,TAU);g.fill();
    rimTop(g,[[-hw,-hh],[hw,-hh]],o);}
  else if(k==='drum'){g.fillStyle=base;g.fillRect(-hw,-hh,w,h);
    g.fillStyle=jmix(base,'#ffffff',.07);g.fillRect(-hw+w*.12,-hh,w*.12,h);g.fillStyle=jmix(base,'#000000',.38);g.fillRect(hw-w*.24,-hh,w*.24,h);
    g.strokeStyle=jmix(base,'#000000',.45);g.lineWidth=2*u;g.beginPath();for(const s of [1/3,2/3]){g.moveTo(-hw,-hh+h*s);g.lineTo(hw,-hh+h*s);}g.stroke();
    g.strokeStyle=edge;g.lineWidth=1.1*u;g.strokeRect(-hw,-hh,w,h);
    g.fillStyle=jmix(base,'#000000',.2);g.beginPath();g.ellipse(0,-hh,hw,Math.max(1,h*.07),0,0,TAU);g.fill();g.stroke();
    for(let i=0;i<8;i++){g.fillStyle=rgba('#7a3a14',.2+.35*r());g.fillRect(-hw+r()*w,-hh+r()*h,(2+r()*6)*u,(3+r()*12)*u);}
    rimTop(g,[[-hw,-hh],[hw,-hh]],o);}
  else if(k==='tyre'){const n=o.n||1;
    if(n===1){g.beginPath();g.arc(0,0,hw,0,TAU);g.arc(0,0,hw*.52,0,TAU,true);g.fillStyle=dim('#121214');g.fill('evenodd');
      g.strokeStyle=rgba('#6a6a72',.3*lt);g.lineWidth=u;g.beginPath();g.arc(0,0,hw*.8,Math.PI*1.1,Math.PI*1.7);g.stroke();
      if(r()<.5){g.beginPath();g.arc(0,0,hw*.5,0,TAU);g.arc(0,0,hw*.28,0,TAU,true);g.fillStyle=dim('#3a3a40');g.fill('evenodd');}}
    else{const th=h/n;for(let i=0;i<n;i++){const yy=-hh+i*th,dx=(r()-.5)*w*.12;rrect(g,-hw+dx,yy,w,th*.96,th*.45);g.fillStyle=dim(i%2?'#151517':'#101012');g.fill();
        g.strokeStyle=rgba('#4a4a52',.32*lt);g.lineWidth=.8*u;g.beginPath();for(let q=1;q<6;q++){const xx=-hw+dx+w*q/6;g.moveTo(xx,yy+th*.2);g.lineTo(xx-2*u,yy+th*.8);}g.stroke();}
      rimTop(g,[[-hw+th*.4,-hh],[hw-th*.4,-hh]],o);}}
  else if(k==='crate'){g.fillStyle=base;g.fillRect(-hw,-hh,w,h);g.strokeStyle=edge;g.lineWidth=1.2*u;g.strokeRect(-hw,-hh,w,h);
    g.strokeStyle=jmix(base,'#000000',.45);g.lineWidth=u;g.beginPath();const n=Math.max(2,Math.round(h/(12*u)));for(let i=1;i<n;i++){g.moveTo(-hw,-hh+h*i/n);g.lineTo(hw,-hh+h*i/n);}g.stroke();
    g.strokeStyle=jmix(base,'#ffffff',.06);g.lineWidth=3*u;g.beginPath();g.moveTo(-hw+3*u,-hh+3*u);g.lineTo(hw-3*u,hh-3*u);if(r()<.5){g.moveTo(hw-3*u,-hh+3*u);g.lineTo(-hw+3*u,hh-3*u);}g.stroke();
    if(r()<.4){g.fillStyle='#050405';g.fillRect(-hw+w*.2,-hh+h*.2,w*.3,h*.25);}
    rimTop(g,[[-hw,-hh],[hw,-hh]],o);}
  else if(k==='pallet'){g.fillStyle=base;for(let i=0;i<5;i++)g.fillRect(-hw+i*w/4.6,-hh,w/7,h);g.fillRect(-hw,-hh,w,h*.26);g.fillRect(-hw,hh-h*.26,w,h*.26);
    g.strokeStyle=edge;g.lineWidth=.8*u;g.strokeRect(-hw,-hh,w,h);rimTop(g,[[-hw,-hh],[hw,-hh]],o);}
  else if(k==='tin'){gpath(g,[[-hw,-hh],[hw,-hh+h*.08*(r()-.5)],[hw*1.02,hh],[-hw,hh*.96]]);g.fillStyle=base;g.fill();
    g.save();g.clip();g.strokeStyle=jmix(base,'#000000',.5);g.lineWidth=1.2*u;g.beginPath();for(let xx=-hw+5*u;xx<hw;xx+=6*u){g.moveTo(xx,-hh);g.lineTo(xx+(r()-.5)*2*u,hh);}g.stroke();
    g.strokeStyle=jmix(base,'#ffffff',.08);g.lineWidth=.8*u;g.beginPath();for(let xx=-hw+2*u;xx<hw;xx+=6*u){g.moveTo(xx,-hh);g.lineTo(xx,hh);}g.stroke();
    for(let i=0;i<6;i++){g.fillStyle=rgba('#7a3a14',.22+.3*r());g.fillRect(-hw+r()*w,-hh+r()*h,(4+r()*14)*u,(3+r()*8)*u);}g.restore();
    if(r()<.4){g.fillStyle='#050405';gpath(g,[[hw*.4,-hh],[hw,-hh],[hw,-hh*.2]]);g.fill();}
    rimTop(g,[[-hw,-hh],[hw,-hh]],o);}
  else if(k==='mat'){rrect(g,-hw,-hh,w,h,h*.4);g.fillStyle=base;g.fill();g.strokeStyle=edge;g.lineWidth=1.1*u;g.stroke();
    g.save();rrect(g,-hw,-hh,w,h,h*.4);g.clip();g.fillStyle=jmix(base,'#ffffff',.08);for(let xx=-hw;xx<hw;xx+=9*u)g.fillRect(xx,-hh,3*u,h);
    g.fillStyle=rgba('#4a3a1a',.35);for(let i=0;i<3;i++){g.beginPath();g.ellipse(-hw+r()*w,-hh+r()*h,(8+r()*16)*u,(4+r()*6)*u,0,0,TAU);g.fill();}g.restore();
    g.fillStyle=jmix(base,'#000000',.35);for(let xx=-hw+14*u;xx<hw-6*u;xx+=22*u)g.fillRect(xx,-u,2*u,2*u);
    rimTop(g,[[-hw+h*.4,-hh],[hw-h*.4,-hh]],o);}
  else if(k==='door'){g.fillStyle=base;g.fillRect(-hw,-hh,w,h);g.strokeStyle=edge;g.lineWidth=1.2*u;g.strokeRect(-hw,-hh,w,h);
    g.strokeStyle=jmix(base,'#000000',.4);g.lineWidth=1.4*u;g.strokeRect(-hw+w*.16,-hh+h*.08,w*.68,h*.36);g.strokeRect(-hw+w*.16,-hh+h*.52,w*.68,h*.4);
    g.fillStyle=dim('#8a7a4a');g.beginPath();g.arc(hw*.7,0,2.4*u,0,TAU);g.fill();
    for(let i=0;i<6;i++){g.fillStyle=rgba('#000000',.18+.2*r());g.fillRect(-hw+r()*w,-hh+r()*h,(2+r()*10)*u,(1+r()*4)*u);}
    rimTop(g,[[-hw,-hh],[hw,-hh]],o);}
  else if(k==='frame'){g.strokeStyle=dim('#5a5a62');g.lineWidth=2.2*u;g.strokeRect(-hw,-hh,w,h);g.lineWidth=u;g.beginPath();
    const nx=Math.max(2,Math.round(w/(14*u))),ny=Math.max(1,Math.round(h/(14*u)));for(let i=1;i<nx;i++){g.moveTo(-hw+w*i/nx,-hh);g.lineTo(-hw+w*i/nx,hh);}for(let i=1;i<ny;i++){g.moveTo(-hw,-hh+h*i/ny);g.lineTo(hw,-hh+h*i/ny);}g.stroke();
    rimTop(g,[[-hw,-hh],[hw,-hh]],o);}
  else if(k==='wheel'){g.strokeStyle=dim('#141416');g.lineWidth=w*.07;g.beginPath();g.arc(0,0,hw,0,TAU);g.stroke();
    g.strokeStyle=dim('#6a6a72');g.lineWidth=.7*u;g.beginPath();for(let i=0;i<12;i++){const t=i/12*TAU;g.moveTo(0,0);g.lineTo(Math.cos(t)*hw*.9,Math.sin(t)*hw*.9);}g.stroke();
    g.fillStyle=dim('#4a4a50');g.beginPath();g.arc(0,0,3*u,0,TAU);g.fill();}
  else if(k==='tv'){rrect(g,-hw,-hh,w,h,6*u);g.fillStyle=base;g.fill();g.strokeStyle=edge;g.lineWidth=1.1*u;g.stroke();
    rrect(g,-hw+w*.1,-hh+h*.12,w*.62,h*.72,8*u);g.fillStyle='#08090b';g.fill();g.fillStyle=rgba('#7ff3e3',.04+.05*lt);g.fill();
    g.strokeStyle=rgba('#c8e0e8',.14*lt);g.lineWidth=u;g.beginPath();g.moveTo(-hw+w*.18,-hh+h*.24);g.lineTo(-hw+w*.36,-hh+h*.24);g.stroke();
    g.fillStyle=jmix(base,'#000000',.4);for(let i=0;i<3;i++)g.fillRect(hw-w*.2,-hh+h*(.2+i*.2),w*.1,h*.08);
    rimTop(g,[[-hw+6*u,-hh],[hw-6*u,-hh]],o);}
  else if(k==='bags'){const n=2+Math.floor(r()*4);for(let i=0;i<n;i++){const bx=-hw+w*(i+.5)/n+(r()-.5)*w*.1,by=hh-h*(.3+r()*.35),bw=w/n*.75+r()*8*u,bh=h*(.45+r()*.3),
      ang=(r()-.5)*.5,c=jmix(JC.bag[(r()*JC.bag.length)|0],JDARK,(1-lt)*.6);
      g.beginPath();g.ellipse(bx,by,bw*.6,bh*.55,ang,0,TAU);g.fillStyle=c;g.fill();
      g.strokeStyle=rgba('#a8b4c8',.16*lt);g.lineWidth=u;g.beginPath();g.ellipse(bx,by,bw*.48,bh*.42,ang,Math.PI*1.15,Math.PI*1.6);g.stroke();
      g.fillStyle=c;g.beginPath();g.moveTo(bx-2*u,by-bh*.5);g.lineTo(bx,by-bh*.7);g.lineTo(bx+2*u,by-bh*.5);g.fill();}}
  else if(k==='plank'){g.fillStyle=base;g.fillRect(-hw,-hh,w,h);g.strokeStyle=edge;g.lineWidth=.8*u;g.strokeRect(-hw,-hh,w,h);
    g.strokeStyle=rgba('#000000',.3);g.beginPath();g.moveTo(-hw,0);g.lineTo(hw,(r()-.5)*2*u);g.stroke();g.fillStyle='#1a1410';g.fillRect(hw-w*.05,-hh,w*.05,h);
    rimTop(g,[[-hw,-hh],[hw,-hh]],o);}
  else if(k==='pipe'){g.fillStyle=base;g.fillRect(-hw,-hh,w,h);g.fillStyle=jmix(base,'#ffffff',.08);g.fillRect(-hw,-hh,w,h*.3);
    g.fillStyle='#050405';g.beginPath();g.ellipse(hw,0,Math.max(1,h*.2),hh,0,0,TAU);g.fill();rimTop(g,[[-hw,-hh],[hw,-hh]],o);}
  else if(k==='chair'){g.strokeStyle=base;g.lineWidth=3*u;g.beginPath();g.moveTo(-hw,-hh);g.lineTo(-hw,hh);g.moveTo(-hw,0);g.lineTo(hw,0);g.lineTo(hw,hh);
    g.moveTo(-hw*.55,0);g.lineTo(-hw*.55,hh);g.moveTo(hw*.55,0);g.lineTo(hw*.55,hh);g.stroke();g.lineWidth=1.4*u;g.beginPath();g.moveTo(-hw,-hh*.55);g.lineTo(-hw*.3,-hh*.55);g.stroke();}
  else{const fade=c=>jmix(c,JDARK,1-lt*.55);for(let i=0;i<7;i++){const bx=(r()-.5)*w,by=(r()-.5)*h,q=r();
      if(q<.2){g.fillStyle=rgba('#d8d0c0',.16*lt);g.fillRect(bx,by,(3+r()*4)*u,(2+r()*3)*u);}
      else if(q<.38){g.fillStyle=fade(['#6a2a1e','#2a3e56','#6a5e34'][(r()*3)|0]);g.fillRect(bx,by,3*u,5*u);}
      else if(q<.6){g.fillStyle=fade(r()<.5?'#2a4434':'#4a3a24');g.save();g.translate(bx,by);g.rotate(r()*TAU);g.fillRect(0,-1.6*u,9*u,3.2*u);g.fillRect(9*u,-.8*u,3*u,1.6*u);g.restore();}
      else{g.fillStyle=jmix('#2a2420',JDARK,1-lt*.8);g.fillRect(bx,by,(4+r()*6)*u,(3+r()*4)*u);}}}
  g.restore();}
function jPick(r,list){let t=r()*list.reduce((s,e)=>s+e[1],0);for(const e of list){t-=e[1];if(t<0)return e[0];}return list[0][0];}
// a piece's size, near the eye (u = 1: a car is about 4 m, 330 units): w across, h high, n tyres in a stack
function jSize(k,r){switch(k){
  case 'car':{const w=300+r()*80;return[w,r()<.5?44+r()*24:70+r()*36];}
  case 'fridge':return[70+r()*14,150+r()*25];case 'washer':return[70+r()*10,78+r()*12];case 'drum':return[56+r()*8,78+r()*12];
  case 'tyre':{const n=r()<.45?1:2+Math.floor(r()*3);return n===1?[50+r()*10,0,1]:[56+r()*6,n*22,n];}
  case 'crate':return[50+r()*30,40+r()*24];case 'pallet':return[100+r()*20,13+r()*3];case 'mat':return[150+r()*25,24+r()*10];
  case 'tin':return[110+r()*110,50+r()*50];case 'door':return[66+r()*10,155+r()*15];case 'frame':return[120+r()*60,40+r()*30];
  case 'tv':return[60+r()*16,48+r()*12];case 'bags':return[70+r()*50,40+r()*24];case 'pipe':return[80+r()*80,8+r()*6];
  case 'plank':return[100+r()*80,8+r()*4];case 'chair':return[40+r()*8,66+r()*10];case 'wheel':{const d=52+r()*8;return[d,d];}
  default:return[60+r()*30,30+r()*20];}}
const J_FACE=[['car',.13],['fridge',.1],['washer',.06],['drum',.12],['tyre',.12],['crate',.08],['mat',.07],['tin',.09],['door',.05],['frame',.05],['tv',.04],['bags',.07],['wheel',.02]];
const J_MID=[['car',.08],['fridge',.08],['washer',.06],['drum',.13],['tyre',.13],['crate',.11],['pallet',.05],['mat',.06],['tin',.12],['door',.04],['frame',.04],['tv',.04],['bags',.09],['chair',.03]];
const J_DEEP=[['car',.14],['tin',.18],['crate',.12],['pallet',.08],['drum',.1],['tyre',.1],['fridge',.07],['mat',.08],['bags',.08],['door',.05]];
// ---------- the near walls ----------
// The junk's face: the Pit's wall line brought in toward the middle and roughened. It never comes nearer the middle than LIM, which
// keeps it clear of everywhere his body goes on the way down.
const JW={inset:56,rough:12,CH:30,TH:128,w:240,LIM:{'-1':236,'1':688}};
function jFace(sd,y){const T=sd<0?pitLayout().wallL:pitLayout().wallR,k=y/40,i=Math.floor(k),f=k-i,a=hsh(i,sd<0?71:73),b=hsh(i+1,sd<0?71:73);
  return pitWallX(T,y)-sd*JW.inset+(lerp(a,b,f*f*(3-2*f))-.5)*2*JW.rough;}
function jTurn(k,r){let a=(r()-.5)*.5;if((k==='fridge'||k==='door'||k==='drum'||k==='washer'||k==='tv')&&r()<.35)a+=(r()<.5?-1:1)*Math.PI/2;
  if(k==='car'&&r()<.2)a+=Math.PI;if(k==='car')a*=.6;return a;}
// the pieces in one band of the wall (CH high), on one side: the oldest deep in it and dark, nearer ones lighter, the face's pieces
// sticking out over the Pit, the small stuff in the gaps behind them
function jCell(sd,c){const r=rng(((c*7919)^(sd<0?0x5bd1:0x2c4f))>>>0),out=[],y0=c*JW.CH,L=pitLayout();if(y0<60||y0>L.floor+40)return out;
  const warm=y=>clamp((y-1200)/2600,0,1),mk=(list,band,lt0,lt1,rimK,layer)=>{const k=jPick(r,list),sz=jSize(k,r),w=sz[0],h=k==='tyre'&&sz[2]===1?sz[0]:sz[1],a=jTurn(k,r),y=y0+r()*JW.CH,fx=jFace(sd,y);
      const ex=Math.abs(w/2*Math.cos(a))+Math.abs(h/2*Math.sin(a));let x;
      if(band==='face'){const lim=sd<0?JW.LIM['-1']-fx:fx-JW.LIM['1'],pr=Math.min(lim,6+r()*34);x=fx-sd*(pr-ex);}
      else x=fx+sd*(band==='mid'?20+r()*70:70+r()*200);
      out.push({k,x,y,w,h,a,n:sz[2]||1,col:jCol(k,r),lt:lt0+r()*(lt1-lt0),warm:warm(y),rimK,layer,seed:(r()*1e9)|0,u:1});};
  for(let i=0;i<3;i++)mk(J_DEEP,'deep',.2,.38,.4,0);
  for(let i=0;i<2;i++)mk(J_MID,'mid',.42,.66,.7,1);
  if(r()<.85)mk(J_FACE,'face',.74,1,1,2);
  if(r()<.25){const k=r()<.5?'pipe':'plank',sz=jSize(k,r),y=y0+r()*JW.CH,fx=jFace(sd,y),lim=sd<0?JW.LIM['-1']-fx:fx-JW.LIM['1'],pr=Math.min(lim,10+r()*30),a=(r()-.5)*.4;
    out.push({k,x:fx-sd*(pr-sz[0]/2),y,w:sz[0],h:sz[1],a,col:k==='pipe'?JC.metal[(r()*3)|0]:JC.wood[(r()*4)|0],lt:.7+r()*.3,warm:warm(y),rimK:1,layer:2,seed:(r()*1e9)|0,u:1});}
  if(r()<.6){const y=y0+r()*JW.CH,fx=jFace(sd,y);out.push({k:'bits',x:fx+sd*(4+r()*24),y,w:60+r()*30,h:30+r()*20,a:0,col:'#2a2420',lt:.5+r()*.3,warm:warm(y),rimK:0,layer:1.5,seed:(r()*1e9)|0,u:1});}
  return out;}
// one piece of a near wall: TH of the Pit's height on one side, the dark mass and every piece of junk that reaches into it
function nearTile(sd,j){const TH=JW.TH,y0=j*TH-1,h=TH+2,x0=sd<0?20:650,w=JW.w;
  let fmin=1e9,fmax=-1e9;for(let y=y0;y<=y0+h;y+=16){const f=jFace(sd,y);fmin=Math.min(fmin,f);fmax=Math.max(fmax,f);}
  if(sd<0?fmax+50<x0:fmin-50>x0+w)return{cv:null,x0,y0,w,h,empty:true};
  const {cn,g}=jkCanvas(w,h,JK.sc,x0,y0),outer=sd<0?x0-10:x0+w+10;
  g.beginPath();g.moveTo(outer,y0-4);for(let y=y0-4;y<=y0+h+4;y+=8)g.lineTo(jFace(sd,y),y);g.lineTo(outer,y0+h+4);g.closePath();
  const fm=(fmin+fmax)/2;g.fillStyle=lin(g,fm+sd*240,0,fm,0,[[0,'#040306'],[.65,'#0c090c'],[1,'#161015']]);g.fill();
  const items=[];for(let c=Math.floor((y0-200)/JW.CH);c<=Math.ceil((y0+h+200)/JW.CH);c++)for(const it of jCell(sd,c))items.push(it);
  items.sort((a,b)=>a.layer-b.layer);
  for(const it of items){const ex=Math.max(it.w,it.h)*.6;if(it.y+ex<y0||it.y-ex>y0+h||it.x+ex<x0||it.x-ex>x0+w)continue;junk(g,it);}
  // the light on it: dark back toward the rock, the moon's cold on its edge toward the open Pit, darker the deeper it is
  g.save();g.globalCompositeOperation='source-atop';
  g.fillStyle=lin(g,outer,0,fm,0,[[0,rgba('#000000',.5)],[.55,rgba('#000000',.14)],[.9,rgba('#000000',0)],[1,rgba('#9ab0e0',.12)]]);g.fillRect(x0-20,y0,w+40,h);
  {const F=pitLayout().floor,d0=clamp(y0/F,0,1),d1=clamp((y0+h)/F,0,1);g.fillStyle=lin(g,0,y0,0,y0+h,[[0,rgba('#05040a',.32*d0)],[1,rgba('#05040a',.32*d1)]]);g.fillRect(x0-20,y0,w+40,h);}
  g.restore();
  return{cv:cn,x0,y0,w,h};}
// the near walls on the screen: the pieces in view, then the next one down on each side painted ahead of need
function junkWalls(rimY,top,bot){const ya=Math.max(0,top-rimY),yb=bot-rimY;if(yb<60)return;
  const j0=Math.floor(ya/JW.TH),j1=Math.floor(yb/JW.TH),want=[];
  for(let j=j0;j<=j1;j++)for(const sd of [-1,1])want.push([sd,j,true]);
  if(S.pit&&S.pit.look&&j0>0)for(const sd of [-1,1])want.push([sd,j0-1,false]);
  for(const sd of [-1,1])want.push([sd,j1+1,false]);
  // (no further up or down than the rest of the picture goes: a tall screen sees past both)
  ctx.save();ctx.beginPath();ctx.rect(-300,rimY+ya,1500,yb-ya);ctx.clip();
  for(const [sd,j,show] of want){const T=jkGet('n'+sd+':'+j,()=>nearTile(sd,j),show);if(!show||(T&&T.empty))continue;
    if(T)ctx.drawImage(T.cv,T.x0,rimY+T.y0,T.w,T.h);
    else{const y0=j*JW.TH,fx=jFace(sd,y0+JW.TH/2);ctx.fillStyle='#0c090c';if(sd<0)ctx.fillRect(-200,rimY+y0,fx+200,JW.TH);else ctx.fillRect(fx,rimY+y0,1400-fx,JW.TH);}}
  ctx.restore();}
// before the rim comes up: paint the first pieces it will show
function jkAhead(rimY,top,bot,v,L){const farRim=HOR+(rimY-HOR)*KF;if(farRim<bot+900)jkGet('f:0',()=>farTile(0,L),false);
  const yb=bot-rimY+Math.max(300,v*.6);if(yb>=60)for(let j=0;j*JW.TH<yb;j++)for(const sd of [-1,1])jkGet('n'+sd+':'+j,()=>nearTile(sd,j),false);
  jkLater();}
// ---------- the far side ----------
// Rows of shacks on walkways down to the floor, every walkway laid on a course of packed junk and every row with junk heaped in its
// gaps: tyres holding the tin roofs down, tarps, drums by the doors, bags along the walls. Painted in pieces of four rows; the lit windows, the signs and the strings of
// bulbs are drawn over them every frame, as they flicker and smear.
const FW={RS:44,FT:176,x0:50,w:800,FB:9};
const FAR_HEAP=[['car',.18],['fridge',.12],['washer',.08],['drum',.14],['tyre',.14],['bags',.14],['tin',.1],['mat',.06],['crate',.06]];
function farSize(k,r){switch(k){case 'car':return[34+r()*12,10+r()*4];case 'fridge':return[7,14+r()*2];case 'washer':return[7,8];case 'drum':return[6,8];
  case 'tyre':{const n=r()<.5?1:2+Math.floor(r()*2);return n===1?[6,6,1]:[6.4,n*2.4,n];}case 'bags':return[10+r()*6,6+r()*3];case 'tin':return[12+r()*8,6+r()*4];
  case 'mat':return[16,3.4];default:return[7,6];}}
function farHeap(g,x,ry,w,rj){const n=2+Math.floor(rj()*4),hh=7+rj()*12;g.fillStyle='#0d0a0c';g.beginPath();g.moveTo(x,ry+1);g.quadraticCurveTo(x+w/2,ry-hh*1.5,x+w,ry+1);g.closePath();g.fill();
  for(let i=0;i<n;i++){const k=jPick(rj,FAR_HEAP),sz=farSize(k,rj),cx=x+w*(.15+.7*rj()),cy=ry-sz[1]*.35-rj()*hh*.55;
    junk(g,{k,x:cx,y:cy,w:sz[0],h:k==='tyre'&&sz[2]===1?sz[0]:sz[1],n:sz[2]||1,a:(rj()-.5)*.6,col:jCol(k,rj),lt:.55+rj()*.3,warm:0,rimK:.5,seed:(rj()*1e9)|0,u:.14});}}
// the walkway: boards laid over junk packed under it
function farLedge(g,ry,rj,xa,xb){let x=-200;while(x<1110){const s=4+rj()*12,k=rj(),c=rj(),yy=ry+1+rj()*4.5;
    if(x>xa-20&&x<xb+20){
      if(k<.22){g.strokeStyle=jmix('#141216','#2a2628',c*.5);g.lineWidth=1.5;g.beginPath();g.ellipse(x,yy+1,2.6+c,2.2+c*.6,0,0,TAU);g.stroke();}
      else if(k<.4){g.fillStyle=jmix(JC.wood[(c*4)|0],'#000000',.45);g.fillRect(x-s*.4,yy-1,s*.8,3.2);}
      else if(k<.56){g.fillStyle=jmix(JC.bag[(c*5)|0],'#000000',.2);g.beginPath();g.ellipse(x,yy+1,2.8+c*2,2.2+c,0,0,TAU);g.fill();}
      else if(k<.68){g.fillStyle=jmix(JC.drum[(c*6)|0],'#000000',.5);g.beginPath();g.arc(x,yy+1.2,2.6,0,TAU);g.fill();}
      else if(k<.8){g.fillStyle=jmix(JC.appl[(c*5)|0],'#000000',.55);g.fillRect(x-3,yy-1.5,6,4.4);}
      else if(k<.9){g.fillStyle=rgba('#d8d0c0',.16);g.fillRect(x,yy,2+c*2,1.4);}
      else{g.fillStyle=jmix(JC.car[(c*7)|0],'#000000',.5);g.fillRect(x-6,yy-1,12,4);}}
    x+=s;}}
// under each walkway, the junk it is built on: crushed cars, the ends of tyres and drums, the fronts of fridges and washers, tin,
// bags and boards, packed in two courses, dark under the boards
function farBand(g,ry,j,xa,xb){const rb=rng(7717+j*389),y0=ry+2,y1=ry+FW.FB;
  g.fillStyle='#0b090b';g.fillRect(xa-20,y0,xb-xa+40,y1-y0);
  for(let course=0;course<2;course++){let x=xa-24+rb()*8;const cy=course?y1-2.6:y0+2.4,shade=course?.44:.32;
    while(x<xb+24){const k=rb(),c=rb(),lt=shade+rb()*.16;let w;
      if(k<.24){w=18+rb()*14;const h=4+rb()*1.6;g.fillStyle=jmix(JC.car[(c*7)|0],JDARK,1-lt);g.fillRect(x,cy-h/2,w,h);
        g.fillStyle='#050405';g.fillRect(x+w*.25,cy-h/2+.6,w*.4,1.1);g.beginPath();g.arc(x+w*.18,cy+h/2,1.5,Math.PI,0);g.arc(x+w*.82,cy+h/2,1.5,Math.PI,0);g.fill();}
      else if(k<.44){w=6.4;g.strokeStyle='#141417';g.lineWidth=1.6;g.beginPath();g.arc(x+3.2,cy,2.3,0,TAU);g.stroke();}
      else if(k<.56){w=6.6;g.fillStyle=jmix(JC.drum[(c*6)|0],JDARK,1-lt);g.beginPath();g.arc(x+3.3,cy,3,0,TAU);g.fill();g.strokeStyle='rgba(0,0,0,.5)';g.lineWidth=.6;g.beginPath();g.arc(x+3.3,cy,2.1,0,TAU);g.stroke();}
      else if(k<.68){w=7;g.fillStyle=jmix(JC.appl[(c*5)|0],JDARK,1-lt);g.fillRect(x,cy-3.2,6.4,6.4);g.fillStyle='#060507';if(c<.5){g.beginPath();g.arc(x+3.2,cy+.3,1.8,0,TAU);g.fill();}else g.fillRect(x+.8,cy-1.2,4.8,.6);}
      else if(k<.8){w=12+rb()*12;g.fillStyle=jmix(JC.tin[(c*5)|0],JDARK,1-lt);g.fillRect(x,cy-2,w,4);g.fillStyle='rgba(0,0,0,.4)';for(let q=x+1.5;q<x+w;q+=2.2)g.fillRect(q,cy-2,.6,4);}
      else if(k<.9){w=6+rb()*4;g.fillStyle=jmix(JC.bag[(c*5)|0],JDARK,.3);g.beginPath();g.ellipse(x+w/2,cy+.4,w/2,2.6,0,0,TAU);g.fill();}
      else{w=8+rb()*8;g.fillStyle=jmix(JC.wood[(c*4)|0],JDARK,1-lt);g.fillRect(x,cy-1.4,w,2.8);}
      x+=w+rb()*1.6;}}
  // the shadow of the boards over it
  g.fillStyle='rgba(0,0,0,.35)';g.fillRect(xa-20,y0,xb-xa+40,2);}
// one row of the far side, its walkway at ry (in the far side's own y, down from its rim); what lights up is kept for the frame
function farRow(g,j,ry,T,own0,own1){const RS=FW.RS,r=rng(9001+j*131),rj=rng(5003+j*977),xa=FW.x0,xb=FW.x0+FW.w,mine=y=>y>=own0&&y<own1;
  farBand(g,ry,j,xa,xb);
  g.fillStyle='#0a080a';g.fillRect(-200,ry,1400,2.5);
  farLedge(g,ry,rj,xa,xb);
  if(r()<.35){const bx=-150+r()*900,bw=120+r()*220,k=r();if(mine(ry-RS+8))T.bulbs.push(bx,ry-RS+8,bw,k);}
  let x=-200+r()*30;
  while(x<1110){const w=26+r()*50,h=16+r()*(RS-FW.FB-16),k=r();
    if(k<.12){const gw=w+r()*30;if(x+gw>xa-20&&x<xb+20)farHeap(g,x+2,ry,gw-4,rj);x+=gw;continue;}
    const vis=x+w>xa-20&&x<xb+20;
    g.fillStyle=SHACK[(r()*SHACK.length)|0];if(vis)g.fillRect(x,ry-h,w,h);
    // a wall of tin sheet, or a car's door let into it
    const tin=rj()<.22,door=rj()<.12,dx=rj();
    if(vis&&tin){g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=.6;g.beginPath();for(let q=x+2;q<x+w;q+=3){g.moveTo(q,ry-h+2);g.lineTo(q,ry);}g.stroke();}
    if(vis&&door){g.fillStyle=jmix(JC.car[(dx*7)|0],'#000000',.45);g.fillRect(x+dx*(w-10),ry-h*.72,9,h*.55);}
    const tip=(r()-.5)*7,ta=Math.max(0,tip),tb=Math.max(0,-tip);g.fillStyle=TIN[(r()*TIN.length)|0];
    if(vis){g.beginPath();g.moveTo(x-2,ry-h-ta);g.lineTo(x+w+2,ry-h-tb);g.lineTo(x+w+2,ry-h+2-tb);g.lineTo(x-2,ry-h+2-ta);g.closePath();g.fill();}
    const nw=w>46?2:1;for(let n=0;n<nw;n++){const ww=5+r()*4,wh=4+r()*4,wx=x+5+n*(w*.5)+r()*3,wy=ry-h+5+r()*3,q=r();
      if(q<.52){if(mine(wy))T.lit.push(wx,wy,ww,wh,q<.44?0:q<.48?1:2);}else if(vis){g.fillStyle='#08070a';g.fillRect(wx,wy,ww,wh);}}
    if(r()<.25&&vis){g.fillStyle='#070608';g.fillRect(x+w-11,ry-12,7,12);}
    if(r()<.05){const sx=x+w*.5,sy=ry-h-7,sw=8+r()*10,sc=(r()*3)|0;if(mine(sy))T.signs.push(sx,sy,sw,sc);}
    if(r()<.16){const x2=x+w+18+r()*30,sag=4+r()*5;if(vis){g.strokeStyle='rgba(150,140,130,.35)';g.lineWidth=.5;g.beginPath();g.moveTo(x+w,ry-h+3);g.quadraticCurveTo(x+w+(x2-x-w)/2,ry-h+3+sag*2,x2,ry-h+5);g.stroke();}
      for(let q=0;q<3;q++){const s=.25+q*.25,cx=lerp(x+w,x2,s),cy=ry-h+3+sag*2*(1-Math.pow(2*s-1,2))*.5+1,col=['#5a3a4a','#3a4a5a','#6a5a3a','#4a5a4a'][(r()*4)|0],hh2=4+r()*3;if(vis){g.fillStyle=col;g.fillRect(cx-2,cy,4,hh2);}}}
    if(r()<.1&&vis){const lx=x+w*.5;g.strokeStyle='#241c1a';g.lineWidth=.9;g.beginPath();g.moveTo(lx,ry);g.lineTo(lx,ry+RS-2);g.moveTo(lx+5,ry);g.lineTo(lx+5,ry+RS-2);for(let q=4;q<RS;q+=6){g.moveTo(lx,ry+q);g.lineTo(lx+5,ry+q);}g.stroke();}
    // tyres holding the roof down, a tarp over it, a drum by the wall, bags along it
    const ty=rj(),tn=1+Math.floor(rj()*3),tp=rj(),tc=rj(),dr=rj(),bg=rj(),bx=rj();
    if(vis){const roof=s=>ry-h-lerp(ta,tb,s)-1;
      if(tp<.18){g.fillStyle=rgba(['#24405a','#2e4a2e','#5a3424'][(tc*3)|0],.75);const a0=tc*.5,a1=a0+.3+tc*.3;g.beginPath();g.moveTo(x+w*a0,roof(a0)-1);g.lineTo(x+w*a1,roof(a1)-1);g.lineTo(x+w*a1+2,roof(a1)+6);g.lineTo(x+w*a0-1,roof(a0)+5);g.closePath();g.fill();}
      if(ty<.32){g.strokeStyle='#0c0b0d';g.lineWidth=1.3;for(let q=0;q<tn;q++){const s=.2+.6*((q+.5)/tn);g.beginPath();g.ellipse(x+w*s,roof(s)-1.2,2.8,1.3,0,0,TAU);g.stroke();}}
      if(dr<.28)junk(g,{k:'drum',x:x+w-4-bx*6,y:ry-4,w:5,h:8,a:0,col:JC.drum[(bx*6)|0],lt:.6,warm:0,rimK:.4,seed:j*31+((x*7)|0),u:.12});
      if(bg<.34)junk(g,{k:'bags',x:x+4+bx*(w-8),y:ry-3,w:10,h:6,a:0,col:'#13171a',lt:.6,warm:0,rimK:0,seed:j*37+((x*5)|0),u:.12});}
    const gap=r()<.2?8+r()*40:1+r()*4;
    if(gap>12&&x+w+gap>xa-20&&x+w<xb+20)farHeap(g,x+w+1,ry,gap-2,rj);
    x+=w+gap;}}
// four rows of the far side (and what of the rows above and below reaches into them), its lit windows, signs and bulbs kept
function farTile(m,L){const RS=FW.RS,FT=FW.FT,y0=m*FT-1,h=FT+2,{cn,g}=jkCanvas(FW.w,h,Math.min(JK.sc,1.6),FW.x0,y0),T={cv:cn,x0:FW.x0,y0,w:FW.w,h,lit:[],signs:[],bulbs:[]};
  // (a row's drawing reaches about 41 up from its walkway, to its roofs and heaps, and 42 down, to the foot of its ladders)
  const jmax=Math.floor(L.floor*KF/RS)-1;g.save();g.beginPath();g.rect(FW.x0,y0,FW.w,h);g.clip();
  for(let j=Math.max(0,Math.ceil((y0-46)/RS)-1);j<=Math.min(jmax,Math.floor((y0+h+48)/RS)-1);j++)farRow(g,j,(j+1)*RS,T,m*FT,(m+1)*FT);
  // the air it stands back in (cold up by the rim, the fires' smoke warm by the floor) and the glow of its lit windows on the boards
  // round them, painted with it (its windows' own light is drawn over it live, burning through)
  {const F=L.floor*KF,a=farAir(clamp(y0/F,0,1)),b=farAir(clamp((y0+h)/F,0,1));g.globalCompositeOperation='source-atop';
    g.fillStyle=lin(g,0,y0,0,y0+h,[[0,rgba(a[0],a[1])],[1,rgba(b[0],b[1])]]);g.fillRect(FW.x0,y0,FW.w,h);
    g.globalCompositeOperation='lighter';const WC=['#ffcf86','#7ff3e3','#ff6ad0'];
    for(let n=0;n<T.lit.length;n+=5){const x=T.lit[n]+T.lit[n+2]/2,y=T.lit[n+1]+T.lit[n+3]/2,s=Math.max(T.lit[n+2],T.lit[n+3])*2.6;g.globalAlpha=.13;g.drawImage(dot(WC[T.lit[n+4]]),x-s,y-s,s*2,s*2);}
    g.globalAlpha=1;g.globalCompositeOperation='source-over';}
  g.restore();return T;}
// the air over the far side at a depth u (0 the rim, 1 the floor): its colour and how thick
function farAir(u){const K=[[0,[28,31,47],.58],[.35,[14,11,21],.54],[.8,[19,12,18],.55],[1,[42,21,19],.6]];let i=0;while(i<K.length-2&&u>K[i+1][0])i++;
  const A=K[i],B=K[i+1],f=clamp((u-A[0])/(B[0]-A[0]),0,1),c=A[1].map((v,k)=>Math.round(lerp(v,B[1][k],f)));return['#'+c.map(v=>v.toString(16).padStart(2,'0')).join(''),lerp(A[2],B[2],f)];}
// rubbish over the lip of the Pit, hanging into it
const RIMJ=[[128,'bags',96,52,.12],[206,'mat',160,28,1.15],[316,'tin',150,64,-.28],[452,'frame',130,48,.85],[600,'bags',84,46,-.12],[690,'door',70,160,-1.38],[842,'tyre',56,56,0],[900,'crate',70,54,.3]];
function rimJunk(rimY){for(const [x,k,w,h,a] of RIMJ){const r=rng(x*13+7),ey=Math.abs(w/2*Math.sin(a))+Math.abs(h/2*Math.cos(a));
    junk(ctx,{k,x,y:rimY+18+ey*.55,w,h,a,n:1,col:jCol(k,r),lt:.62,warm:0,rimK:.9,seed:x*31,u:1});}}
// ---------- what sticks out of the walls ----------
function drawGirder(it,rimY,t){const c=it.caps[0];
  axis(c[0],rimY+c[1],c[2],rimY+c[3],L=>{
    ctx.fillStyle='#2a1e1a';ctx.fillRect(0,-7,L,14);
    ctx.fillStyle=lin(ctx,0,-11,0,-6,[[0,'#8a6a50'],[.3,'#5e4434'],[1,'#3a2a22']]);ctx.fillRect(0,-11,L+1,5);
    ctx.fillStyle=lin(ctx,0,6,0,11,[[0,'#2a1e18'],[1,'#120c0a']]);ctx.fillRect(0,6,L+1,5);
    const r=rng(31);for(let i=0;i<16;i++){const u=r()*L;ctx.fillStyle=rgba('#8a4a22',.16+r()*.22);ctx.fillRect(u,-6,1.5+r()*3,8+r()*7);}
    ctx.fillStyle='#a08060';for(let u=8;u<L-4;u+=17){ctx.fillRect(u-.6,-9.4,1.2,1.2);ctx.fillRect(u-.6,7.6,1.2,1.2);}
    ctx.fillStyle='#4a3428';path([[L,-11],[L+4,-7],[L+1,-2],[L+5,3],[L+1,11],[L,11]]);ctx.fill();
    if(it.hitT0){const u=clamp(((it.hx??c[2])-c[0])/(c[2]-c[0])*L,16,L-12),a=clamp(1-(t-it.hitT)*.35,.35,1);ctx.fillStyle=rgba('#ffd9a0',.55*a);ctx.fillRect(u-16,-11,32,1.5);ctx.fillStyle=rgba('#ffd9a0',.25*a);ctx.fillRect(u-8,-9.5,20,1);}});
  // its end in the wall: a block of the old foundation, its rebar bent out
  const x=c[0]+30,y=rimY+c[1];ctx.fillStyle=lin(ctx,0,y-26,0,y+26,[[0,'#3c3c42'],[1,'#1a1a1e']]);path([[x-70,y-24],[x+4,y-28],[x+16,y-8],[x+8,y+22],[x-70,y+30]]);ctx.fill();
  ctx.strokeStyle='#5a3826';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x+6,y-20);ctx.lineTo(x+22,y-30);ctx.moveTo(x+10,y+12);ctx.lineTo(x+24,y+26);ctx.stroke();}
function drawBalcony(it,rimY,t){const c=it.caps[0],x0=c[0],x1=c[2],yA=x=>rimY+lerp(c[1],c[3],(x0-x)/(x0-x1)),br=!!it.broken,xe=br?lerp(x0,x1,.42):x1;
  // the hut it belongs to, built into the wall over it: a door with the lamp lit inside
  {const y=yA(x0-30);ctx.fillStyle='#1c1416';ctx.fillRect(x0-92,y-74,96,70);ctx.fillStyle='#3a2e2c';path([[x0-98,y-74],[x0+8,y-82],[x0+8,y-77],[x0-98,y-70]]);ctx.fill();
    ctx.fillStyle='#0b0708';ctx.fillRect(x0-66,y-52,18,47);ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(255,180,100,.45)';ctx.fillRect(x0-50,y-50,2,44);ctx.restore();
    ctx.fillStyle='rgba(255,207,134,.5)';ctx.fillRect(x0-34,y-58,12,9);}
  // its braces, from the wall to the deck
  ctx.strokeStyle='#2a1c14';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x0-6,yA(x0)+56);ctx.lineTo(lerp(x0,x1,br?.3:.45),yA(lerp(x0,x1,br?.3:.45))+5);ctx.moveTo(x0-6,yA(x0)+30);ctx.lineTo(lerp(x0,x1,.2),yA(lerp(x0,x1,.2))+5);ctx.stroke();
  if(br){ctx.save();ctx.translate(lerp(x0,x1,.45),yA(lerp(x0,x1,.45))+5);ctx.rotate(1.25);ctx.fillStyle='#2a1c14';ctx.fillRect(0,-1.5,60,3);ctx.restore();}
  // the deck: planks, their ends broken off where he went through it
  ctx.beginPath();ctx.moveTo(x0+8,yA(x0)-5);ctx.lineTo(xe,yA(xe)-5);
  if(br){for(let k=0;k<5;k++)ctx.lineTo(xe+(k%2?7:-3),yA(xe)-5+k*2.5);}
  ctx.lineTo(xe,yA(xe)+5);ctx.lineTo(x0+8,yA(x0)+5);ctx.closePath();
  ctx.fillStyle=lin(ctx,0,yA(x0)-5,0,yA(x0)+5,[[0,'#7a5638'],[.4,'#5a3e28'],[1,'#2e1e12']]);ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.5)';ctx.lineWidth=.8;ctx.beginPath();for(let x=x0-6;x>xe+4;x-=13){ctx.moveTo(x,yA(x)-5);ctx.lineTo(x,yA(x)+5);}ctx.stroke();
  // the railing along its front
  ctx.strokeStyle='#4a3424';ctx.lineWidth=2.2;ctx.beginPath();for(let x=x0-24;x>xe+6;x-=38){ctx.moveTo(x,yA(x)-5);ctx.lineTo(x,yA(x)-34);}
  const re=br?xe+10:x1+4;ctx.moveTo(x0-4,yA(x0)-33);ctx.lineTo(re,yA(re)-33);ctx.moveTo(x0-4,yA(x0)-19);ctx.lineTo(re,yA(re)-19);ctx.stroke();
  if(br){ctx.save();ctx.translate(xe+10,yA(xe)-33);ctx.rotate(1.1+.05*Math.sin(t*2));ctx.strokeStyle='#4a3424';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(70,0);ctx.moveTo(0,14);ctx.lineTo(70,14);ctx.moveTo(30,-2);ctx.lineTo(30,16);ctx.stroke();ctx.restore();}
  // washing from the hut's eave to a pole on the rail, and a lamp hung at the end
  if(!br){const ax=x0-60,ay=yA(x0)-76,bx=lerp(x0,x1,.62),by=yA(bx)-36;ctx.strokeStyle='rgba(170,160,150,.4)';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(ax,ay);ctx.quadraticCurveTo((ax+bx)/2,(ay+by)/2+14,bx,by);ctx.stroke();
    for(let q=1;q<5;q++){const u=q/5,cx=lerp(ax,bx,u),cy=lerp(ay,by,u)+14*4*u*(1-u)*.5;ctx.fillStyle=['#6a3a3a','#3a4a6a','#8a7a5a','#4a5a3a'][q%4];ctx.fillRect(cx-3,cy,6,7+q%2*3);}
    const lx=x1+16,ly=yA(x1)-20,sw=Math.sin(t*1.3)*.08;ctx.save();ctx.translate(lx,yA(x1)-33);ctx.rotate(sw);ctx.strokeStyle='#2a2020';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,10);ctx.stroke();
    ctx.fillStyle='#2a2020';ctx.fillRect(-3,10,6,8);ctx.fillStyle='rgba(255,196,110,.9)';ctx.fillRect(-2,11.5,4,5);ctx.restore();glow(ctx,lx,ly+5,26,'#ffb25e',.5);}}
function drawCar(it,rimY,t){const c=it.caps[0];
  axis(c[0],rimY+c[1],c[2],rimY+c[3],L=>{const k=L/392,X=u=>u*k;
    const body=[[24,-16],[60,-19],[250,-19],[316,0],[380,3],[392,10],[393,32],[396,40],[24,44]].map(([u,v])=>[X(u),v]);
    path(body);ctx.fillStyle=lin(ctx,0,-19,0,44,[[0,'#3c5254'],[.35,'#2a3c3e'],[1,'#121a1c']]);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.6)';ctx.lineWidth=1;ctx.stroke();
    path([[48,-15],[244,-15],[300,-1],[48,-1]].map(([u,v])=>[X(u),v]));ctx.fillStyle='#0b1216';ctx.fill();
    ctx.fillStyle='rgba(160,200,210,.12)';path([[X(120),-15],[X(150),-15],[X(110),-1],[X(80),-1]]);ctx.fill();
    path([[252,-17],[312,0],[300,0],[244,-15]].map(([u,v])=>[X(u),v]));ctx.fillStyle=it.glass?'#050708':'#1a2a30';ctx.fill();
    if(it.glass){ctx.strokeStyle='rgba(200,230,240,.45)';ctx.lineWidth=.6;ctx.beginPath();const o=[X(270),-8];for(let q=0;q<6;q++){const a=q*1.05+.3;ctx.moveTo(o[0],o[1]);ctx.lineTo(o[0]+Math.cos(a)*14,o[1]+Math.sin(a)*8);}ctx.stroke();}
    else{ctx.fillStyle='rgba(200,230,240,.2)';ctx.fillRect(X(262),-12,X(20),1.2);}
    ctx.strokeStyle='rgba(150,165,168,.5)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(X(40),4);ctx.lineTo(X(388),6);ctx.stroke();
    const r=rng(61);for(let i=0;i<14;i++){ctx.fillStyle=rgba('#6a3a20',.25+r()*.3);ctx.fillRect(X(30+r()*350),r()*36-8,2+r()*7,1.5+r()*5);}
    ctx.fillStyle='#09090b';ctx.beginPath();ctx.arc(X(304),46,15,0,TAU);ctx.fill();ctx.fillStyle='#3e3e44';ctx.beginPath();ctx.arc(X(304),46,6,0,TAU);ctx.fill();
    ctx.fillStyle='#c8c0a0';ctx.fillRect(X(366),20,14,6);
    const on=Math.sin(t*9.3)+Math.sin(t*3.1+1)>-.7;ctx.fillStyle=on?'#ff3a3a':'#4a1212';ctx.fillRect(X(384),11,6,7);
    if(on){ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=rad(ctx,X(387),14,0,22,[[0,rgba('#ff3a3a',.4)],[1,rgba('#ff3a3a',0)]]);ctx.fillRect(X(365),-8,44,44);ctx.restore();}
    if(it.hitT0){const u=clamp(((it.hx??c[2])-c[0])/(c[2]-c[0])*L,30,L-30);ctx.fillStyle='rgba(0,0,0,.6)';path([[u-24,-19],[u,-13],[u+22,-19],[u+18,-17],[u,-11],[u-20,-17]]);ctx.fill();}});
  // the front of it is buried in the wall, in rubble
  const x=c[0]+20,y=rimY+c[1]+18,r=rng(62);ctx.fillStyle='#1a1618';ctx.beginPath();ctx.moveTo(x-60,y-40);for(let q=0;q<8;q++)ctx.lineTo(x+q*6+r()*8,y-40+q*12);ctx.lineTo(x-60,y+70);ctx.closePath();ctx.fill();
  for(let q=0;q<9;q++){ctx.fillStyle=r()<.5?'#2c2628':'#3a3234';ctx.fillRect(x+r()*30-10,y-30+r()*80,5+r()*8,4+r()*6);}}
function drawPipes(it,rimY,t){
  for(const c of it.caps)axis(c[0],rimY+c[1],c[2],rimY+c[3],L=>{
    ctx.fillStyle=lin(ctx,0,-7,0,7,[[0,'#7a5444'],[.35,'#5a3a2c'],[1,'#1e120c']]);ctx.fillRect(-30,-7,L+30,14);
    ctx.fillStyle='#24160e';for(let u=40;u<L-10;u+=72)ctx.fillRect(u,-9,5,18);
    const r=rng(c[1]);for(let i=0;i<8;i++){ctx.fillStyle=rgba('#8a4a22',.25);ctx.fillRect(r()*L,2,1.4,5+r()*6);}
    ctx.fillStyle='#0a0606';ctx.beginPath();ctx.ellipse(L,0,2.5,6.5,0,0,TAU);ctx.fill();ctx.strokeStyle='#3a2418';ctx.lineWidth=1.2;ctx.stroke();});
  // water out of the lower one, all the way down
  const c=it.caps[1],x=c[2]-3,y=rimY+c[3];ctx.save();ctx.globalCompositeOperation='lighter';
  ctx.fillStyle=lin(ctx,0,y,0,y+460,[[0,'rgba(170,210,235,.32)'],[1,'rgba(170,210,235,0)']]);ctx.beginPath();ctx.moveTo(x-3,y-2);ctx.lineTo(x+4,y-2);ctx.lineTo(x+14,y+460);ctx.lineTo(x-12,y+460);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(225,242,255,.32)';for(let k=0;k<12;k++){const yy=y+((t*560+k*41)%440);ctx.fillRect(x-3+(k%3)*2.4,yy,1.1,12);}ctx.restore();}
function drawNeon(it,rimY,t){const c0=it.caps[0],y=rimY+c0[1],dead=!!it.dead;
  ctx.fillStyle='#241c20';ctx.fillRect(c0[0],y-3,c0[2]-c0[0],6);ctx.strokeStyle='#241c20';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(c0[0]+8,y+64);ctx.lineTo(c0[0]+196,y+2);ctx.stroke();
  ctx.save();ctx.translate(382,y+2);ctx.rotate(it.swing||0);
  ctx.strokeStyle='#4a3e44';ctx.lineWidth=1;ctx.setLineDash([2,1.5]);ctx.beginPath();ctx.moveTo(-60,0);ctx.lineTo(-60,22);ctx.moveTo(60,0);ctx.lineTo(60,22);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#160d14';ctx.fillRect(-90,22,180,50);ctx.strokeStyle='#3a2632';ctx.lineWidth=2;ctx.strokeRect(-90,22,180,50);
  if(!dead){const fl=Math.sin(t*23)*Math.sin(t*7.3)>.85?.35:1;neonAt('ROOMS','#ff4fd2',30,0,48,fl);ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=rgba('#ff4fd2',.06*fl);ctx.fillRect(-140,-10,280,120);ctx.restore();
    ctx.strokeStyle=rgba('#7ff3e3',.8*fl);ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-74,64);ctx.lineTo(74,64);ctx.stroke();}
  else{ctx.font='700 30px "Alegreya SC", Georgia, serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.strokeStyle='#3a1a30';ctx.lineWidth=2;ctx.strokeText('ROOMS',0,48);
    ctx.strokeStyle='#1e1a1c';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-74,64);ctx.lineTo(-10,64);ctx.moveTo(20,66);ctx.lineTo(74,64);ctx.stroke();
    if(hsh(Math.floor(t*5),3)<.22){const sx=-70+hsh(Math.floor(t*5),4)*140;glow(ctx,sx,48,14,'#ffd0f4',.7);}}
  ctx.restore();}
function drawRubble(it,rimY,t){const c=it.caps[0];
  axis(c[0],rimY+c[1],c[2],rimY+c[3],L=>{const r=rng(77);
    ctx.beginPath();ctx.moveTo(-20,-18);for(let u=0;u<=L;u+=20)ctx.lineTo(u,-13-r()*7);ctx.lineTo(L+10,-4);ctx.lineTo(L+6,10);for(let u=L;u>=0;u-=24)ctx.lineTo(u,13+r()*9);ctx.lineTo(-20,24);ctx.closePath();
    ctx.fillStyle=lin(ctx,0,-18,0,22,[[0,'#3c3438'],[.4,'#251f23'],[1,'#120e10']]);ctx.fill();ctx.strokeStyle='rgba(255,190,140,.14)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,-14);ctx.lineTo(L,-12);ctx.stroke();
    for(let i=0;i<9;i++){const u=20+r()*(L-30),s=3+r()*5;ctx.fillStyle=r()<.5?'#3a3236':'#4c4246';ctx.beginPath();ctx.moveTo(u-s,-14);ctx.lineTo(u-s*.4,-14-s);ctx.lineTo(u+s*.7,-14-s*.7);ctx.lineTo(u+s,-14);ctx.closePath();ctx.fill();}
    ctx.fillStyle='#4a3424';for(let q=0;q<3;q++){ctx.save();ctx.translate(L*.55+q*18,-16);ctx.rotate(-.3+q*.25);ctx.fillRect(-14,-2,28,3.5);ctx.restore();}
    ctx.strokeStyle='#0c0b0d';ctx.lineWidth=3.4;ctx.beginPath();ctx.ellipse(L*.25,-23,9,9,0,0,TAU);ctx.stroke();});}
// the spike, from s0 to s1 of the way up it (the point is drawn again over his arm when it is through it)
function spikeSeg(rimY,s0,s1,blood,pinS){const A=pitLayout().spike,ax=A.a[0],ay=rimY+A.a[1],bx=A.b[0],by=rimY+A.b[1],dx=bx-ax,dy=by-ay,Lh=Math.hypot(dx,dy),ux=dx/Lh,uy=dy/Lh,nx=-uy,ny=ux;
  const at=s=>({x:ax+dx*s,y:ay+dy*s,w:lerp(3,1,s)});s0=clamp(s0,0,1);s1=clamp(s1,0,1);if(s1<=s0)return;
  const a=at(s0),b=at(s1);ctx.beginPath();ctx.moveTo(a.x+nx*a.w,a.y+ny*a.w);ctx.lineTo(b.x+nx*b.w,b.y+ny*b.w);ctx.lineTo(b.x+ux*(s1>.99?3:0),b.y+uy*(s1>.99?3:0));ctx.lineTo(b.x-nx*b.w,b.y-ny*b.w);ctx.lineTo(a.x-nx*a.w,a.y-ny*a.w);ctx.closePath();
  ctx.fillStyle='#6a3a22';ctx.fill();ctx.strokeStyle='#160c08';ctx.lineWidth=.7;ctx.stroke();
  ctx.strokeStyle='rgba(255,190,140,.55)';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(a.x+nx*a.w*.4,a.y+ny*a.w*.4);ctx.lineTo(b.x+nx*b.w*.4,b.y+ny*b.w*.4);ctx.stroke();
  ctx.strokeStyle='#2a1810';ctx.lineWidth=.6;ctx.beginPath();for(let s=s0+.04;s<s1;s+=.07){const q=at(s);ctx.moveTo(q.x+nx*q.w*1.3+ux*1.4,q.y+ny*q.w*1.3+uy*1.4);ctx.lineTo(q.x-nx*q.w*1.3-ux*1.4,q.y-ny*q.w*1.3-uy*1.4);}ctx.stroke();
  if(blood){const pc=typeof GORE_COL!=='undefined'&&GORE_COL[S.gore]?GORE_COL[S.gore].mark:'#d22a43',ps=pinS??1,e=Math.min(s1,ps+.08);
    if(e>s0){const p0=at(s0),p1=at(e);ctx.strokeStyle=rgba(pc,.85);ctx.lineWidth=p0.w*1.5;ctx.beginPath();ctx.moveTo(p0.x,p0.y);ctx.lineTo(p1.x,p1.y);ctx.stroke();}}}
function drawCliff(it,rimY,t,P,L){const c=it.caps[0],y0=rimY+c[1],r=rng(53),Q=[[c[0]-60,y0-34]];
  for(let x=c[0];x<=c[2];x+=22)Q.push([x,y0-15-r()*7+(x-c[0])*.02]);
  Q.push([c[2]+12,y0-9],[c[2]+19,y0+6],[c[2]+8,y0+19],[c[2]-26,y0+28],[c[2]-110,y0+44],[c[0]+60,y0+70],[c[0]-60,y0+96]);
  path(Q);ctx.fillStyle=lin(ctx,0,y0-24,0,y0+60,[[0,'#3a3034'],[.3,'#241d21'],[1,'#0e0b0d']]);ctx.fill();
  ctx.save();path(Q);ctx.clip();for(let k=0;k<6;k++){ctx.fillStyle=k%2?'rgba(0,0,0,.25)':'rgba(80,64,68,.18)';ctx.fillRect(c[0]-80,y0-10+k*12+r()*4,c[2]-c[0]+120,4+r()*5);}ctx.restore();
  ctx.strokeStyle='rgba(255,190,140,.2)';ctx.lineWidth=1.1;ctx.beginPath();for(let i=1;i<Q.length-6;i++)i===1?ctx.moveTo(Q[i][0],Q[i][1]):ctx.lineTo(Q[i][0],Q[i][1]);ctx.stroke();
  // roots and an old cable hanging off its underside
  ctx.strokeStyle='#1a1214';ctx.lineWidth=1;ctx.beginPath();for(let q=0;q<5;q++){const x=c[2]-40-q*48,yy=y0+30+q*7,sw=Math.sin(t*.8+q)*2;ctx.moveTo(x,yy);ctx.quadraticCurveTo(x+sw,yy+20,x+3+sw,yy+30+q*6);}ctx.stroke();
  const on=!!(P.pin||P.arm),gore=S.gore!=='off',ps=P.pin?P.pin.s:P.arm?P.arm.s:null;
  spikeSeg(rimY,0,1,on&&gore,ps);
  // blood off the spike onto the rock
  if(on&&gore){const pc=typeof GORE_COL!=='undefined'&&GORE_COL[S.gore]?GORE_COL[S.gore].mark:'#d22a43',k=clamp((t-P.pinT0)/2.5,0,1);ctx.fillStyle=rgba(pc,.7);
    ctx.beginPath();ctx.ellipse(c[2]-4,y0-14,6+10*k,1.6+1.6*k,0,0,TAU);ctx.fill();ctx.fillRect(c[2]+10,y0-6,2,10+30*k);}}
// the Sump, its roof and its hay, and the floor of the Pit round it
function drawBar(rimY,top,bot,L,P,t){const rf=L.roof,yR=rimY+rf.y,fl=rimY+L.floor,HY=L.hay;if(yR-140>bot||fl+40<top)return;
  // the floor: mud, puddles that hold the neon, the huts round the bar, a fire in a drum
  ctx.fillStyle=lin(ctx,0,fl,0,fl+80,[[0,'#1a1212'],[1,'#0c0909']]);ctx.fillRect(-200,fl,1400,Math.max(0,bot-fl+20));
  for(const [x0,x1,h2,s] of [[96,246,150,1],[716,830,170,2]]){ctx.fillStyle=s===1?'#1e1618':'#1a1416';ctx.fillRect(x0,fl-h2,x1-x0,h2);ctx.fillStyle='#2e2626';path([[x0-8,fl-h2],[x1+8,fl-h2-10],[x1+8,fl-h2-5],[x0-8,fl-h2+5]]);ctx.fill();
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(255,190,110,.5)';ctx.fillRect(x0+22,fl-h2+30,16,12);ctx.fillRect(x1-40,fl-h2+70,12,16);ctx.restore();}
  {const x=790,y=fl-4,a=.75+.25*Math.sin(t*11)*Math.sin(t*3.7);ctx.fillStyle='#241a16';ctx.fillRect(x-10,y-24,20,24);glow(ctx,x,y-30,46,'#ff8a3c',.5*a,.8);
    ctx.save();ctx.globalCompositeOperation='lighter';for(let q=0;q<4;q++){const fx=x-6+q*4,fh=8+6*Math.abs(Math.sin(t*9+q*1.7));ctx.fillStyle=rgba('#ffb25e',.7);ctx.beginPath();ctx.moveTo(fx-2,y-24);ctx.lineTo(fx,y-24-fh);ctx.lineTo(fx+2,y-24);ctx.fill();}ctx.restore();}
  // the bar: boards and tin, two windows up, the long window and the door below, the lamp by the door
  const x0=rf.x0,x1=rf.x1;ctx.fillStyle=lin(ctx,0,yR,0,fl,[[0,'#2c1f1c'],[1,'#191111']]);ctx.fillRect(x0,yR,x1-x0,fl-yR);
  ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1;ctx.beginPath();for(let x=x0+9;x<x1;x+=9){ctx.moveTo(x,yR+8);ctx.lineTo(x,fl);}ctx.stroke();
  ctx.fillStyle='rgba(120,90,70,.12)';for(let x=x0;x<x1;x+=60)ctx.fillRect(x,yR+8,30,fl-yR-8);
  const win=(x,y,w,h2)=>{ctx.fillStyle='#0c0807';ctx.fillRect(x-2,y-2,w+4,h2+4);ctx.fillStyle='#ffb25e';ctx.globalAlpha=.75;ctx.fillRect(x,y,w,h2);ctx.globalAlpha=1;ctx.fillStyle='rgba(60,30,20,.8)';ctx.fillRect(x+w*.5-.6,y,1.2,h2);glow(ctx,x+w/2,y+h2/2,w*1.1,'#ffb25e',.35);};
  win(x0+40,yR+66,34,24);win(x1-80,yR+66,34,24);win(x0+218,yR+110,96,40);
  ctx.fillStyle='rgba(30,16,12,.85)';for(let q=0;q<6;q++)ctx.fillRect(x0+226+q*14,yR+120+(q%2)*4,4,20-(q%2)*4);
  ctx.fillStyle='#120a08';ctx.fillRect(x0+150,yR+100,34,fl-yR-100);ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(255,170,90,.35)';ctx.fillRect(x0+176,yR+102,7,fl-yR-104);ctx.restore();
  {const lx=x0+136,ly=yR+104,a=.85+.15*Math.sin(t*6.3);ctx.fillStyle='#1a1414';ctx.fillRect(lx-3,ly,6,9);ctx.fillStyle=rgba('#ffd59a',a);ctx.fillRect(lx-2,ly+1.5,4,6);glow(ctx,lx,ly+5,40,'#ffb25e',.55*a);}
  // the sign under the eaves: THE SUMP in amber, a bird in pink
  {const sx0=x0+42,sx1=x0+212,sy=yR+26;ctx.fillStyle='#120b0c';ctx.fillRect(sx0,sy,sx1-sx0,30);ctx.strokeStyle='#3a2a22';ctx.lineWidth=1.6;ctx.strokeRect(sx0,sy,sx1-sx0,30);
    ctx.strokeStyle='#2a2020';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(sx0+10,yR+8);ctx.lineTo(sx0+10,sy);ctx.moveTo(sx1-10,yR+8);ctx.lineTo(sx1-10,sy);ctx.stroke();
    const fl2=Math.sin(t*17.3)*Math.sin(t*5.1)>.9?.4:1;neonAt('THE SUMP','#ffb04a',17,(sx0+sx1)/2+8,sy+15.5,fl2);neonAt('v','#ff5ad8',16,sx0+16,sy+13,.9);
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=rad(ctx,(sx0+sx1)/2,sy+15,0,120,[[0,rgba('#ffb04a',.16*fl2)],[1,rgba('#ffb04a',0)]]);ctx.fillRect(sx0-100,sy-80,sx1-sx0+200,180);ctx.restore();}
  // the roof: tin over the boards, its ridges, its eaves out past the walls
  ctx.fillStyle=lin(ctx,0,yR-4,0,yR+8,[[0,'#5a4a42'],[.4,'#3a2e2a'],[1,'#1a1414']]);ctx.fillRect(x0-12,yR-4,x1-x0+24,12);
  ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=.8;ctx.beginPath();for(let x=x0-10;x<x1+12;x+=6){ctx.moveTo(x,yR-4);ctx.lineTo(x,yR+8);}ctx.stroke();
  ctx.fillStyle='rgba(140,70,30,.3)';for(let x=x0;x<x1;x+=37)ctx.fillRect(x+hsh(x,2)*20,yR,8,7);
  // the stovepipe, its smoke going up
  {const px=645;ctx.fillStyle='#2a2422';ctx.fillRect(px-4,yR-56,8,56);ctx.fillStyle='#3a322e';ctx.fillRect(px-7,yR-60,14,4);
    const Pf=puff();ctx.save();for(let q=0;q<8;q++){const u=((t*.3+q/8)%1),sy=yR-62-u*170,sx=px+Math.sin(u*5+q)*10*u+u*22,r=8+u*30;ctx.globalAlpha=.42*(1-u)*Math.min(1,u*6);ctx.drawImage(Pf,sx-r,sy-r,r*2,r*2);}ctx.restore();}
  // the hay heaped on the roof: a mound of it, straws every way, a fork left in it, a bale burst at its side
  hayMound(rimY,L,P,t,false);
  {const bx=HY.x+HY.w+6,by=yR;ctx.fillStyle='#a8843e';ctx.fillRect(bx,by-14,30,14);ctx.strokeStyle='#5a4220';ctx.lineWidth=.8;ctx.strokeRect(bx,by-14,30,14);ctx.beginPath();ctx.moveTo(bx+9,by-14);ctx.lineTo(bx+9,by);ctx.moveTo(bx+21,by-14);ctx.lineTo(bx+21,by);ctx.stroke();}
  // a string of lamps from the eaves to the wall
  {const ax=x1+12,ay=yR+4,bx=jFace(1,rf.y-40)-4,by=yR-30;ctx.strokeStyle='rgba(60,50,50,.8)';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(ax,ay);ctx.quadraticCurveTo((ax+bx)/2,ay+18,bx,by);ctx.stroke();
    for(let q=1;q<6;q++){const u=q/6,x=lerp(ax,bx,u),y=lerp(ay,by,u)+18*2*u*(1-u),a=.6+.4*Math.sin(t*3+q*2);ctx.fillStyle=rgba(['#ffcf86','#ff7ae0','#7ff3e3'][q%3],a);ctx.fillRect(x-1.2,y,2.4,2.6);}}}
// the heap: the whole of it (behind him), or only its front (over him, once he is in it)
function hayMound(rimY,L,P,t,front){const HY=L.hay,rf=L.roof,yR=rimY+rf.y,N=28,pts=[];
  for(let i=0;i<=N;i++){const u=i/N*2-1,x=HY.x+u*HY.w,lump=front?0:Math.sin(u*9+1)*1.6;pts.push([x,rimY+(front?rf.y-HY.h*.42*(1-u*u):pitHayTop(x))+lump]);}
  ctx.beginPath();ctx.moveTo(HY.x-HY.w-6,yR);for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.lineTo(HY.x+HY.w+6,yR);ctx.closePath();
  ctx.fillStyle=lin(ctx,0,yR-HY.h,0,yR,[[0,'#dcb860'],[.5,'#b8913e'],[1,'#7a5a22']]);ctx.fill();
  const r=rng(front?303:202),n=front?70:150,SP=[new Path2D(),new Path2D(),new Path2D()];ctx.lineWidth=.7;
  for(let i=0;i<n;i++){const u=r()*2-1,x=HY.x+u*HY.w*.98,ty=rimY+(front?rf.y-HY.h*.42*(1-u*u):pitHayTop(x)),y=lerp(ty,yR,r()*.92),a=r()*TAU,l=3+r()*5,k=r()<.5?0:r()<.5?1:2;
    SP[k].moveTo(x,y);SP[k].lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l*.6);}
  ['#f0d488','#a07a30','#c8a050'].forEach((col,k)=>{ctx.strokeStyle=col;ctx.stroke(SP[k]);});
  // straws sticking up out of its top
  ctx.strokeStyle='#e8cc7a';ctx.lineWidth=.6;ctx.beginPath();for(let i=0;i<(front?16:30);i++){const u=r()*2-1,x=HY.x+u*HY.w*.9,y=rimY+(front?rf.y-HY.h*.42*(1-u*u):pitHayTop(x))+1,a=-Math.PI/2+(r()-.5)*1.6;ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*(3+r()*4),y+Math.sin(a)*(3+r()*4));}ctx.stroke();
  if(!front){ctx.fillStyle='rgba(60,36,10,.25)';ctx.beginPath();ctx.ellipse(HY.x,yR-HY.h*.2,HY.w*.8,HY.h*.25,0,0,TAU);ctx.fill();
    // the fork
    const fx=HY.x+HY.w*.55,fy0=rimY+pitHayTop(fx)+4;ctx.strokeStyle='#5a4028';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(fx,fy0);ctx.lineTo(fx+22,fy0-54);ctx.stroke();
    ctx.strokeStyle='#6a6a70';ctx.lineWidth=.8;ctx.beginPath();for(let q=-1;q<=1;q++){ctx.moveTo(fx+q*2.4,fy0+2);ctx.lineTo(fx+q*2.4-2,fy0+12);}ctx.stroke();}}
// a bird: sitting (a plump body, the head going down to peck now and then) or flying (wings beating)
function drawBird(b,x,y,t){const s=b.sz*1.75,col=b.tone<.3?'#4a4e5c':b.tone<.7?'#3a3e4a':'#5c5e6a';ctx.save();ctx.translate(x,y);ctx.scale(b.fa,1);ctx.fillStyle=col;
  if(!b.fly){const bob=Math.sin(b.ph*1.7)*.35,peck=Math.sin(b.ph*.9+b.tone*6)>.93?1.6:0;
    ctx.beginPath();ctx.ellipse(0,-3*s,3.6*s,2.4*s,-.15,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(2.9*s,-5.4*s+bob+peck,1.6*s,0,TAU);ctx.fill();
    ctx.beginPath();ctx.moveTo(-3*s,-3.6*s);ctx.lineTo(-6.6*s,-2.2*s);ctx.lineTo(-3*s,-1.4*s);ctx.closePath();ctx.fill();
    ctx.fillStyle='#8a7a58';ctx.fillRect(4.3*s,-5.7*s+bob+peck,1.4*s,.7*s);ctx.fillStyle='rgba(255,176,110,.32)';ctx.beginPath();ctx.ellipse(.6*s,-1.6*s,2.8*s,.8*s,-.1,0,TAU);ctx.fill();
    ctx.fillStyle='rgba(150,220,200,.35)';ctx.beginPath();ctx.arc(2.4*s,-4.3*s+bob+peck*.5,.9*s,0,TAU);ctx.fill();}
  else{const f=Math.sin(b.ph),w=5*s;
    ctx.beginPath();ctx.ellipse(0,0,3.4*s,1.5*s,0,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(3.3*s,-.5*s,1.3*s,0,TAU);ctx.fill();
    ctx.beginPath();ctx.moveTo(-3*s,0);ctx.lineTo(-5.8*s,-.8*s);ctx.lineTo(-5.4*s,1*s);ctx.closePath();ctx.fill();
    ctx.globalAlpha=.7;ctx.beginPath();ctx.moveTo(.6*s,-.4*s);ctx.quadraticCurveTo(1.2*s,-w*f*.9,-1.6*s,-w*f-.6*s);ctx.lineTo(-1.4*s,-.2*s);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
    ctx.fillStyle=b.tone<.5?'#6a6e7a':'#787a86';ctx.beginPath();ctx.moveTo(-.4*s,-.4*s);ctx.quadraticCurveTo(-.4*s,-w*f*1.1,-3.2*s,-w*f*1.2-.4*s);ctx.lineTo(1.4*s,-.6*s);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,176,110,.3)';ctx.beginPath();ctx.ellipse(0,.7*s,2.6*s,.6*s,0,0,TAU);ctx.fill();}
  ctx.restore();}
// ---------- over him ----------
// the spike's point over the arm it is through, the heap's front over him once he is in it, and what flies: splinters, glass, straw,
// feathers, the birds going up
// over him: the noon of the dream warm on all of it; and when he wakes, a white flash and the last of the sand blown off him
function dreamFore(){const P=S.pit,woke=P&&P.woke!=null?S.t-P.woke:-1;if(!(woke>=0&&woke<.5))return;
  const vw=typeof cam!=='undefined'?cam.viewW:W,L=(typeof cam!=='undefined'?cam.x:W/2)-vw/2-30,T=(typeof camTop==='function'?camTop():0)-30,Wv=vw+60,Hv=(typeof aspect==='number'?vw/aspect:H)+60;ctx.save();
  {const u=woke/.5,K=typeof hero==='function'?hero():null,f=Math.max(0,1-woke/.32);ctx.globalCompositeOperation='source-over';
    ctx.globalAlpha=1;ctx.fillStyle=rgba('#fff6e6',(reduceMotion?.45:.85)*f*f*f);ctx.fillRect(L,T,Wv,Hv);
    if(K&&K.p&&typeof CHE==='number'){const c0=K.p[CHE],cx=c0.x+K.dep*PSX,cy=c0.y-K.dep*PSY,n=reduceMotion?30:80;
      for(let i=0;i<n;i++){const a=hsh(i,733)*TAU,sp=(220+620*hsh(i,739))*(reduceMotion?.5:1),d=sp*woke*(1-woke*.7),x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d+woke*woke*120;
        ctx.globalAlpha=(1-u)*(.4+.5*hsh(i,743));ctx.fillStyle=hsh(i,751)<.5?'#f6dfae':'#c8995e';ctx.fillRect(x,y,1.3,1.3+sp*.004);}}}
  ctx.restore();}
// the sun's ghosts in the lens as the dream gets to noon: faint discs along the line from it through the middle of the picture
function flare(D){if(D<.45||typeof cam==='undefined')return;const k=clamp((D-.45)/.4,0,1),vw=cam.viewW,Hv=vw/(typeof aspect==='number'?aspect:1.8),cx=cam.x,cy=camTop()+Hv/2,dx=cx-SUN.x,dy=cy-SUN.y;
  ctx.save();ctx.globalCompositeOperation='screen';
  for(const [f,sz,col,a] of [[.42,26,'#ffe0a0',.07],[.7,14,'#a8f0e0',.06],[1.18,44,'#ffd890',.05],[1.42,22,'#ffb070',.06],[1.75,64,'#fff0c8',.035]]){
    ctx.globalAlpha=a*k;ctx.drawImage(bokSpr(col),SUN.x+dx*f-sz/2,SUN.y+dy*f-sz/2,sz,sz);}
  ctx.restore();}
function fore(c){flare(dreamK());bokeh(S.t,Math.abs(S.scrollYV||0),dreamK(),pitOn()&&fy(S.pit.base)<H);dreamFore();if(!pitOn())return;const P=S.pit,L=pitLayout(),rimY=fy(P.base),t=S.t,gore=S.gore!=='off';ctx.save();
  // (the spike only inside the picture, as the walls are: a phone held upright sees past its ends)
  if(P.pin||P.arm){const s=P.pin?P.pin.s:P.arm.s;ctx.save();ctx.beginPath();ctx.rect(-1e4,-110,2e4,H+230);ctx.clip();spikeSeg(rimY,s-.05,1,gore,s);ctx.restore();}
  if(P.scrap){const q=pitSpike(P.scrap.s),x=q.x,y=rimY+q.y,sw=Math.sin(t*2.2)*.12;ctx.save();ctx.translate(x,y);ctx.rotate(sw);ctx.fillStyle='#0c0b11';path([[-5,-3],[5,-2],[4,12],[1,22],[-2,15],[-4,24],[-6,10]]);ctx.fill();
    ctx.strokeStyle='#45d8c8';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(-5,-3);ctx.lineTo(5,-2);ctx.stroke();ctx.restore();spikeSeg(rimY,P.scrap.s-.05,1,false,null);}
  for(const b of P.bits){const x=b.x,y=rimY+b.y,a=clamp((b.life-b.age)/.5,0,1);ctx.globalAlpha=a;
    if(b.k==='plank'||b.k==='splinter'){ctx.save();ctx.translate(x,y);ctx.rotate(b.a);ctx.fillStyle=b.col;ctx.fillRect(-b.w/2,-b.h/2,b.w,b.h);ctx.restore();}
    else if(b.k==='glass'){ctx.save();ctx.translate(x,y);ctx.rotate(b.a);ctx.fillStyle=b.col;ctx.beginPath();ctx.moveTo(-b.w/2,0);ctx.lineTo(0,-b.h);ctx.lineTo(b.w/2,b.h*.4);ctx.closePath();ctx.fill();ctx.restore();}
    else if(b.k==='drop'){ctx.fillStyle=b.col;ctx.fillRect(x-.7,y-.7,1.4,2.2);}
    else{ctx.save();ctx.translate(x,y);ctx.rotate(b.a);ctx.fillStyle=b.col;ctx.fillRect(-b.w/2,-b.h/2,b.w,b.h);ctx.restore();}}
  ctx.globalAlpha=1;
  if(rimY+L.roof.y-80<H+120)hayMound(rimY,L,P,t,true);
  // the straw in the air, in a few batches by colour and by how far it has faded
  if(P.hay.length){const B=[];for(let i=0;i<9;i++)B.push(new Path2D());
    for(const h of P.hay){const a=clamp((h.life-h.age)/1,0,1),k=(h.tone<.5?0:h.tone<.8?1:2)*3+(a>.66?0:a>.33?1:2),Q=B[k];Q.moveTo(h.x,rimY+h.y);Q.lineTo(h.x+Math.cos(h.a)*h.len,rimY+h.y+Math.sin(h.a)*h.len);}
    ctx.lineWidth=.8;const C3=['#e8c870','#c8a050','#f4dc98'];for(let k=0;k<9;k++){ctx.globalAlpha=[1,.55,.22][k%3];ctx.strokeStyle=C3[(k/3)|0];ctx.stroke(B[k]);}ctx.globalAlpha=1;}
  for(const fe of P.feathers){const a=clamp((fe.life-fe.age)/1.2,0,1);ctx.globalAlpha=a*.85;ctx.save();ctx.translate(fe.x,rimY+fe.y);ctx.rotate(fe.a);ctx.strokeStyle=fe.tone<.5?'#8a8a94':'#c8c8d0';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(-3,0);ctx.quadraticCurveTo(0,-1.2,3,0);ctx.stroke();ctx.restore();}
  ctx.globalAlpha=1;
  for(const b of P.birds)if(b.fly)drawBird(b,b.x,rimY+b.y,t);
  ctx.restore();}
// the light that rims him: the city's glow from out past the corner, low on the right; in the dream the sun, high on the right
function light(f){const D=dreamK(),x=lerp(1040,SUN.x+60,D),y=lerp(420,SUN.y-60,D);return{light:{x:x-f.dep*PSX,y:y+f.dep*PSY}};}
const LAYOUT={corner:CORNER,floor:FH,yRef:YREF,hMark:HMARK,horizon:HOR};
// ---------- the picture as a camera takes it ----------
// Once the world is drawn (before his thoughts and the bars, sk_storyui.js), over the whole fall: the light blooms (the frame shrunk to
// an eighth, its bright parts drawn out by multiplying it by itself) and runs out sideways from every bright point in the long streaks
// a cinema lens makes (cold at night, warm in the dream), the two laid over the frame at once; the edges of the picture darken (cold
// at night, a burnt brown in the dream, deepest in the Pit); and a fine grain moves over it. Full effects: all of it. Lite: the dark
// at the edges. Off: none. Phones first: the frame is gone over whole only twice (the light, the grain), the dark only along the
// edges, and nothing in a blend that costs more than laying one picture over another. It only draws: the game never reads what it
// keeps.
const PFX={B:null,S:null,C:null,pat:null,last:{bloom:0,vig:0,n:0}};
function pfxCv(c,w,h){c=c||document.createElement('canvas');if(c.width!==w||c.height!==h){c.width=w;c.height=h;}return c;}
// the grain, a tile drawn once: specks a little lighter or a little darker than what is under them, laid plainly over it
function grainPat(){if(PFX.pat)return PFX.pat;const c=pfxCv(null,128,128),g=c.getContext('2d'),im=g.createImageData(128,128),r=rng(907);
  for(let i=0;i<128*128;i++){const v=(r()+r()+r()-1.5)/1.5,lv=v>0?255:0;im.data[i*4]=im.data[i*4+1]=im.data[i*4+2]=lv;im.data[i*4+3]=Math.round(Math.min(1,Math.abs(v)*1.4)*255);}
  g.putImageData(im,0,0);PFX.pat=cv.getContext('2d').createPattern(c,'repeat');return PFX.pat;}
// how far the story's bars are in (sk_storyui.js draws them after this, a tenth of the height each at full)
function bars(){return typeof ST_LB==='number'?clamp(ST_LB,0,1):0;}
// the dark falling in from the edges, in three bands inside the bars (not along the top, where the moon and the sun are; the corners
// where two bands cross the darkest)
function vignette(W2,H2,D,pit){const bar=Math.floor(H2*.105*bars()),y0=bar,ih=H2-2*bar;if(ih<8)return;
  const col=pit?'#020308':mix('#02040b','#1c1006',D),a=pit?.62:lerp(.5,.3,D),vw=W2*.16,vh=ih*.16;PFX.last.vig=a;
  const band=(x0,y0g,x1,y1g)=>{const g=ctx.createLinearGradient(x0,y0g,x1,y1g);g.addColorStop(0,rgba(col,a));g.addColorStop(.4,rgba(col,a*.38));g.addColorStop(1,rgba(col,0));return g;};
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  ctx.fillStyle=band(0,0,vw,0);ctx.fillRect(0,y0,vw,ih);ctx.fillStyle=band(W2,0,W2-vw,0);ctx.fillRect(W2-vw,y0,vw,ih);
  ctx.fillStyle=band(0,y0+ih,0,y0+ih-vh);ctx.fillRect(0,y0+ih-vh,W2,vh);}
function post(){if(typeof cv==='undefined'||!cv.width)return;const q=typeof FXL!=='undefined'?FXL.q:'full';if(q==='off')return;
  const W2=cv.width,H2=cv.height,P=S.pit,D=dreamK(),woke=P&&P.woke!=null?S.t-P.woke:9,pit=P&&P.on&&P.base!=null&&fy(P.base)<H?1:0;
  ctx.save();ctx.setTransform(1,0,0,1,0,0);PFX.last.n++;
  if(q==='full'){
    // the light alone: the frame an eighth the size, multiplied by itself twice
    const bw=Math.max(24,Math.round(W2/8)),bh=Math.max(24,Math.round(H2/8)),B=PFX.B=pfxCv(PFX.B,bw,bh),g=B.getContext('2d');
    g.globalCompositeOperation='copy';g.globalAlpha=1;g.imageSmoothingEnabled=true;g.drawImage(cv,0,0,bw,bh);
    g.globalCompositeOperation='multiply';g.drawImage(B,0,0);g.drawImage(B,0,0);
    // the streaks: that light smeared out sideways, and coloured
    const SS=PFX.S=pfxCv(PFX.S,bw,bh),h2=SS.getContext('2d');h2.globalCompositeOperation='copy';h2.globalAlpha=1;h2.drawImage(B,0,0);h2.globalCompositeOperation='lighter';
    for(const [f,a] of [[.012,.55],[.028,.36],[.055,.22],[.1,.12],[.17,.06]])for(const sg of [-1,1]){h2.globalAlpha=a;h2.drawImage(B,sg*f*bw,0);}
    h2.globalCompositeOperation='multiply';h2.globalAlpha=1;h2.fillStyle=D>.3?'#ffcf96':pit?'#8aa6d8':'#7fb0ff';h2.fillRect(0,0,bw,bh);
    // (less of it as the picture grows bright: the dream is all light, and he stays dark against it; a burst of it as he wakes)
    const kb=(pit?.48:lerp(.6,.34,D))*(woke<.35?1+2*(1-woke/.35):1),ks=kb*(.75-.3*D);PFX.last.bloom=kb;
    // the two in one small picture, laid over the frame once
    const Cc=PFX.C=pfxCv(PFX.C,bw,bh),h3=Cc.getContext('2d');h3.globalCompositeOperation='copy';h3.globalAlpha=clamp(ks,0,1);h3.drawImage(SS,0,0);
    h3.globalCompositeOperation='lighter';h3.globalAlpha=clamp(kb,0,1);h3.drawImage(B,0,0);
    // (the dark at the edges first, so that a lamp or the sun in a corner keeps its glow; only between the bars: what they cover is
    // not drawn)
    vignette(W2,H2,D,pit);
    const y0=Math.floor(H2*.105*bars()),sh=bh*y0/H2;
    ctx.imageSmoothingEnabled=true;ctx.globalCompositeOperation='screen';ctx.globalAlpha=1;ctx.drawImage(Cc,0,sh,bw,bh-2*sh,0,y0,W2,H2-2*y0);}
  else vignette(W2,H2,D,pit);
  // the grain, moving (still where motion is reduced), a pixel of the canvas (not on a phone's small screen, where it would not show
  // and the frame cannot spare it)
  if(q==='full'&&cssW>=640){const pt=grainPat(),f=(S._rf||0),ox=reduceMotion?0:(f*53)%128,oy=reduceMotion?0:(f*97)%128,y0=Math.floor(H2*.105*bars());
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.05;ctx.fillStyle=pt;ctx.translate(-ox,-oy);ctx.fillRect(ox,y0+oy,W2,H2-2*y0);}
  ctx.restore();}
// (away from the fall its pieces are let go: the junk's tiles and the desert's view)
function free(){jkFree();if(DES.cv){DES.cv.width=DES.cv.height=0;DES.cv=null;}}
E.S.fall={paint,live,light,fore,post,LAYOUT,free,jk:JK,span:SPAN_LAST,dream:DREAM_LAST,pfx:PFX.last,sand:DMX,views:{des:DES}};
})();
// ===== ENV FALL END =====
