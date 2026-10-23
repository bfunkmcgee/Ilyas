// ===== ENV OUTSKIRTS =====
// The road outside the Sprawl at sundown, where the prologue opens. A dirt road runs along the top of a rise, dry grass and stones on
// its verges and an old fence along the far side, and beyond the fence the land falls away to farms in the valley. Past them the Sprawl
// stands on the horizon on the right, its towers catching the last light on their western faces and their windows coming on, the
// Hallowell tower over all of them. On the left the sun is going down behind low hills, a windbreak of poplars on the brow: gold low
// down, violet over the top of the sky. The light is behind everything and low, so what stands up is a dark shape with a warm edge and
// the shadows run toward us. It is farm country, dry at the end of summer, with no sand anywhere: the sand that blows past his bike in
// the scene is his own (sk_story.js, the opening).
(()=>{const E=EnvLook,{pp,poly,lin,rad,rgba,mix,glow,haze,stars,rng,lerp,clamp,TAU}=E;
const FAR=150,EY=()=>GB-FAR*PSY;                 // the brow of the rise: the plane ends there and the land beyond it falls away
const HOR=330;                                    // the horizon, far off over the valley
const SUN={x:170,y0:296,y1:322,r:13,dur:22};      // the sun's disc as the scene opens, and how far it has sunk by its end (dur seconds)
const TOWER={x:706,base:HOR+1,top:206,w:20};     // the Hallowell tower over the city
const POPLARS=[[14,146,118,11],[40,148,134,13],[64,145,104,10]];   // the windbreak on the brow, on the left: x, depth, height, half-width
const ROAD_W=44;
// the road's middle in plane depth: along the rise, bending away over the brow on the right toward the farms
const roadD=typeof SUNDOWN!=='undefined'&&SUNDOWN.road?SUNDOWN.road:x=>114+Math.max(0,x-700)*.13+Math.sin(x*.011)*2.5;
const g2=(x,d)=>pp(x,GB,d);
// the hills under the sun: a far rank and a nearer, lower one, flattening out toward the city on the right
const hillA=x=>{const k=clamp(1-(x-380)/240,0,1);return HOR-k*(10+7*Math.sin(x*.0085+1.1)+3.5*Math.sin(x*.024+.3)+1.4*Math.sin(x*.07+2));};
const hillB=x=>{const k=clamp(1-(x-300)/260,0,1);return HOR+1-k*(4+3*Math.sin(x*.012+2.4)+1.6*Math.sin(x*.041+1));};
const skyFoot=x=>Math.min(hillA(x),hillB(x));
// where the sun is now: sinking from y0 to y1 over the scene (in the lab, half way)
function sunNow(){const S0=typeof S!=='undefined'&&S.story&&S.story.sun,u=S0?clamp((S.t-S0.t0)/SUN.dur,0,1):.4;return{x:SUN.x,y:lerp(SUN.y0,SUN.y1,u),u};}
// ---------- the sky ----------
// a long thin cloud: dark violet, its underside gold toward the sun
function streak(c,cx,cy,w,h,near){c.save();c.translate(cx,cy);c.scale(1,h/w);
  c.fillStyle=rad(c,0,0,0,w,[[0,rgba(mix('#2e1c3a','#5a2c3c',near),.75)],[.6,rgba(mix('#2e1c3a','#5a2c3c',near),.42)],[1,rgba('#2e1c3a',0)]]);c.beginPath();c.arc(0,0,w,0,TAU);c.fill();
  c.globalCompositeOperation='lighter';c.fillStyle=rad(c,0,w*.32,0,w*.85,[[0,rgba('#ff9a50',.34*near+.04)],[.5,rgba('#ff7a40',.12*near)],[1,rgba('#ff7a40',0)]]);c.beginPath();c.arc(0,w*.3,w*.85,0,TAU);c.fill();c.restore();}
// ---------- the city on the horizon ----------
// a row of towers on the horizon: hazed by distance (far 0 near, 1 far), each one's west face catching the sun, its windows coming on
function cityRow(c,x0,x1,base,o){const r=rng(o.seed),far=o.far;let x=x0;
  const col=mix('#1c1424','#5a3446',far*.6);
  while(x<x1){const w=(o.w0||7)+r()*(o.w1||16),h=(o.h0||8)+Math.pow(r(),1.7)*(o.h1||40),top=base-h,k=r();
    c.fillStyle=col;c.fillRect(x,top,w,h+2);
    if(k<.1){c.beginPath();c.moveTo(x+w*.3,top);c.lineTo(x+w*.5,top-h*.25);c.lineTo(x+w*.7,top);c.fill();}
    else if(k<.22){c.fillRect(x+w*.45,top-6-r()*6,1,7);}
    // the face toward the sun, lit; a thin bright edge down it and along the roof
    const lit=(1-far*.55)*(.55+.45*r());c.fillStyle=rgba('#ff9a58',.16*lit);c.fillRect(x,top,Math.min(w*.4,3.5),h);
    c.fillStyle=rgba('#ffc27a',.55*lit);c.fillRect(x,top,.8,h);c.fillRect(x,top-.4,w*.6,.8);
    // windows: a few already lit
    const cols=Math.max(1,Math.floor((w-2)/3)),rows=Math.max(1,Math.floor((h-3)/4));
    for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){if(r()>(o.lit||.12))continue;c.fillStyle=rgba(r()<.85?'#ffd08a':'#e8f0ff',(.3+.5*r())*(1-far*.5));c.fillRect(x+1.4+j*3,top+2.4+i*4,1,1.4);}
    x+=w+(r()<.25?r()*8:.4);}
  haze(c,x0,x1,base-(o.hazeH||30),base+2,'#b4604a',o.hazeA==null?.4:o.hazeA);}
// the Hallowell tower at sundown: the black elven spire stepping in as it rises, its gold fins burning on the side toward the sun, ranks of
// floors lit, the crown's ring of cyan light coming up as the light goes
function tower(c){const {x,base,top,w}=TOWER,h=base-top,s=w/40;c.save();
  const steps=[[0,1],[.55,.86],[.78,.72],[.9,.56]];
  for(let i=0;i<steps.length;i++){const [f,k]=steps[i],y0=base-h*f,y1=i+1<steps.length?base-h*steps[i+1][0]:top+h*.04,ww=w*k;
    c.fillStyle=lin(c,x-ww/2,0,x+ww/2,0,[[0,'#3a2228'],[.18,'#1a121c'],[.6,'#120d16'],[1,'#0c0910']]);c.fillRect(x-ww/2,y1,ww,y0-y1+1);
    const rows=Math.floor((y0-y1)/(4*s)),cols=Math.max(2,Math.floor(ww/(5*s))),r=rng(77+i);
    for(let j=1;j<rows;j++)for(let k2=0;k2<cols;k2++){if(r()<.62)continue;const wx=x-ww/2+(k2+.5)*ww/cols-.8*s,wy=y0-j*4*s;c.fillStyle=rgba(r()<.9?'#ffcf86':'#e8f4ff',.35+.45*r());c.fillRect(wx,wy,1.6*s,1.6*s);}
    // the fins: the west one burning gold in the sun, the east one dull
    c.fillStyle=rgba('#ffd27a',.95);c.fillRect(x-ww/2,y1,1.1*s,y0-y1);c.fillStyle=rgba('#8a6a2e',.6);c.fillRect(x+ww/2-.9*s,y1,.9*s,y0-y1);
    c.fillStyle=rgba('#ffe2a3',.9);c.fillRect(x-ww/2-1*s,y1,ww+2*s,1.1*s);}
  const cy=top+h*.04,cw=w*.56;c.fillStyle='#e2b65a';
  for(let k2=-2;k2<=2;k2++){const bx=x+k2*cw*.22,bh=h*.07*(1-Math.abs(k2)*.25);c.beginPath();c.moveTo(bx-cw*.06,cy);c.lineTo(bx,cy-bh);c.lineTo(bx+cw*.06,cy);c.closePath();c.fill();}
  c.fillStyle='#120d16';c.fillRect(x-.8*s,top-h*.16,1.6*s,h*.16);c.fillStyle='#ffe2a3';c.fillRect(x-.4*s,top-h*.2,.8*s,h*.1);
  glow(c,x,cy-h*.03,w*.9,'#7ff3e3',.3,.5);
  c.strokeStyle=rgba('#7ff3e3',.6);c.lineWidth=1.2*s;c.beginPath();c.ellipse(x,cy-h*.025,cw*.42,cw*.1,0,0,TAU);c.stroke();
  // the house's H, high on the shaft
  const hy=base-h*.62,hs=w*.34;c.fillStyle=rgba('#ffe2a3',.9);c.fillRect(x-hs/2,hy-hs*.6,hs*.2,hs*1.2);c.fillRect(x+hs/2-hs*.2,hy-hs*.6,hs*.2,hs*1.2);c.fillRect(x-hs/2,hy-hs*.08,hs,hs*.16);
  glow(c,x,hy,hs*2,'#ffb25e',.25);
  c.restore();}
// ---------- standing things, lit from behind ----------
// a grass tuft at (x, d): blades fanning up, dark, their tips caught by the sun; its shadow running toward us, away from the sun
function tuft(P,R,x,d,h,n){const q=g2(x,d);
  for(let i=0;i<n;i++){const a=(R()-.5)*1.1,L=h*(.55+R()*.45),bx=q.x+(R()-.5)*3,tx=bx+Math.sin(a)*L,ty=q.y-Math.cos(a)*L;
    P.dark.moveTo(bx,q.y);P.dark.quadraticCurveTo(bx+Math.sin(a)*L*.3,q.y-L*.6,tx,ty);
    if(R()<.7){P.tip.moveTo(bx+Math.sin(a)*L*.62,q.y-Math.cos(a)*L*.62);P.tip.lineTo(tx,ty);}
    if(R()<.25){P.seed.moveTo(tx,ty);P.seed.lineTo(tx+Math.sin(a)*2.6,ty-2.4);}}
  // the shadow: long, thin, toward us and away from the sun's side
  const sx=(x-SUN.x)*.035,len=h*2.1;P.shadow.moveTo(q.x-1.5,q.y+.3);P.shadow.lineTo(q.x+sx*len*.2+.6,q.y+len*.42);P.shadow.lineTo(q.x+sx*len*.2+2.2,q.y+len*.42);P.shadow.lineTo(q.x+1.5,q.y+.3);P.shadow.closePath();}
function strokeTufts(c,P,w){c.lineCap='round';c.fillStyle=rgba('#0a0604',.34);c.fill(P.shadow);c.strokeStyle='#120c08';c.lineWidth=w;c.stroke(P.dark);
  c.strokeStyle=rgba('#ffb45e',.55);c.lineWidth=w*.7;c.stroke(P.tip);c.strokeStyle=rgba('#ffe0a0',.6);c.lineWidth=w*.6;c.stroke(P.seed);}
const newTufts=()=>({dark:new Path2D(),tip:new Path2D(),seed:new Path2D(),shadow:new Path2D()});
// a windbreak on the brow on the left, the farms' kind: three tall poplars, narrow as flames, black against the sky and lit along the
// side toward the sun, the light coming through the leaves at their edges
function poplars(c){const R=rng(81),dark='#110a09';
  for(const [x,d,h,w] of POPLARS){const q=g2(x,d),bx=q.x,by=q.y;
    c.fillStyle=dark;c.fillRect(bx-1.8,by-16,3.6,17);
    // the crown: widest a third of the way up, ragged at the edges
    const N=30,L=[],Rt=[];for(let i=0;i<=N;i++){const t=i/N,yy=by-12-h*t,wid=w*Math.pow(Math.sin(Math.PI*Math.pow(t,.62)),.9)+.6;
      Rt.push([bx+wid*(.82+R()*.3)+Math.sin(t*9)*.8,yy]);L.push([bx-wid*(.82+R()*.3)+Math.sin(t*7+1)*.8,yy]);}
    const P=new Path2D();P.moveTo(bx,by-12);for(const [x2,y2] of Rt)P.lineTo(x2,y2);for(let i=L.length-1;i>=0;i--)P.lineTo(L[i][0],L[i][1]);P.closePath();c.fillStyle=dark;c.fill(P);
    // the sun's side: a warm edge, and specks where the leaves let it through
    c.save();c.globalCompositeOperation='lighter';c.strokeStyle=rgba('#ff9a48',.42);c.lineWidth=.9;c.lineJoin='round';c.beginPath();Rt.forEach(([x2,y2],i)=>i?c.lineTo(x2,y2):c.moveTo(x2,y2));c.stroke();
    for(let i=0;i<26;i++){const k=Math.floor(R()*Rt.length),[x2,y2]=Rt[k];c.fillStyle=rgba('#ffb060',.18+.22*R());c.fillRect(x2-1-R()*3,y2+(R()-.5)*3,1.1,1.1);}c.restore();
    // its long shadow down the rise toward us
    c.fillStyle=rgba('#0a0604',.2);c.beginPath();c.moveTo(bx-3,by+1);c.lineTo(bx-14,by+h*.42);c.lineTo(bx+6,by+h*.44);c.lineTo(bx+3,by+1);c.closePath();c.fill();}}
// a fence post at (x, d): split, leaning, its top and its sun side lit
const POSTS=[];   // where the fence's posts stand on the screen (the far light goes behind them)
function post(c,x,d,h,lean,R){const q=g2(x,d),w=3+R()*1.2;POSTS.push({x0:Math.min(q.x,q.x+lean)-w/2-.4,x1:Math.max(q.x,q.x+lean)+w/2+.4,y0:q.y-h-.5,y1:q.y+1});c.fillStyle='#120b08';c.beginPath();c.moveTo(q.x-w/2,q.y+1);c.lineTo(q.x-w/2+lean,q.y-h);c.lineTo(q.x+w/2+lean,q.y-h+1);c.lineTo(q.x+w/2,q.y+1);c.closePath();c.fill();
  c.strokeStyle=rgba('#ffa858',.5);c.lineWidth=.6;c.beginPath();c.moveTo(q.x-w/2+.3,q.y);c.lineTo(q.x-w/2+lean+.3,q.y-h);c.stroke();
  c.fillStyle=rgba('#ffc27a',.45);c.fillRect(q.x-w/2+lean,q.y-h-.4,w,.8);
  c.fillStyle=rgba('#0a0604',.25);c.beginPath();c.moveTo(q.x-w/2,q.y+1);c.lineTo(q.x+(x-SUN.x)*.02-w/2,q.y+h*.55);c.lineTo(q.x+(x-SUN.x)*.02+w/2,q.y+h*.55);c.lineTo(q.x+w/2,q.y+1);c.closePath();c.fill();
  return{x:q.x+lean,y:q.y-h};}
function patAt(c,cv,u){const p=c.createPattern(cv,'repeat');if(p.setTransform)p.setTransform(new DOMMatrix().scale(u));return p;}

function paint(c){
  const X0=-160,X1=W+250,T0=-100,ey=EY(),r=rng(29);
  // ---- the sky: violet over the top, rose, then the gold low down where the sun goes
  c.fillStyle=lin(c,0,T0,0,HOR+6,[[0,'#100b20'],[.24,'#1e1434'],[.42,'#3a1e44'],[.58,'#6e2a48'],[.7,'#a6403e'],[.8,'#d2683a'],[.89,'#ec9444'],[.96,'#f6b858'],[1,'#f8c870']]);
  c.fillRect(X0,T0,X1-X0,HOR+8-T0);
  // the east darkening: the sky over the city cooler, and low over it the rose band over the blue-grey of the coming night
  c.fillStyle=lin(c,360,0,X1,0,[[0,'rgba(16,14,40,0)'],[.6,'rgba(16,14,40,.32)'],[1,'rgba(16,14,40,.5)']]);c.fillRect(360,T0,X1-360,HOR+8-T0);
  c.save();c.translate(900,HOR-8);c.scale(1,.2);c.fillStyle=rad(c,0,0,0,520,[[0,rgba('#c87088',.3)],[.6,rgba('#c87088',.12)],[1,rgba('#c87088',0)]]);c.beginPath();c.arc(0,0,520,0,TAU);c.fill();c.restore();
  haze(c,520,X1,HOR-16,HOR+2,'#4a4466',.35);
  // a few first stars, high in the east
  stars(c,480,X1,T0,90,16,7,.32);stars(c,X0,X1,T0,10,14,11,.24);
  // the sun's light in the sky: a wide warm bloom round where it goes down, gold close in
  glow(c,SUN.x,SUN.y0+12,620,'#ff8a40',.3,.55);glow(c,SUN.x,SUN.y0+8,240,'#ffc070',.38,.8);glow(c,SUN.x,SUN.y0+6,90,'#fff0c0',.3);
  // shafts of the sun's light fanning up through the haze
  {c.save();c.globalCompositeOperation='lighter';const R=rng(52),ox=SUN.x,oy=SUN.y0+6,L=430;
    for(let i=0;i<9;i++){const a=-Math.PI/2+(i-4)*.3+(R()-.5)*.12,w=.016+R()*.022,g=c.createLinearGradient(ox,oy,ox+Math.cos(a)*L,oy+Math.sin(a)*L);
      g.addColorStop(0,rgba('#ffd890',.045));g.addColorStop(.4,rgba('#ffd890',.014));g.addColorStop(1,rgba('#ffd890',0));c.fillStyle=g;
      c.beginPath();c.moveTo(ox,oy);c.lineTo(ox+Math.cos(a-w)*L,oy+Math.sin(a-w)*L);c.lineTo(ox+Math.cos(a+w)*L,oy+Math.sin(a+w)*L);c.closePath();c.fill();}c.restore();}
  // clouds: long thin streaks, gold underneath near the sun, violet away from it
  for(const [cx,cy,w,h] of [[60,214,210,7],[300,186,260,6],[520,150,300,8],[-60,150,240,7],[760,212,240,5],[420,252,200,4],[180,120,280,9],[880,96,320,8],[40,268,150,3.5]]){
    const near=clamp(1-Math.hypot(cx-SUN.x,(cy-SUN.y0)*1.6)/520,0,1);streak(c,cx,cy,w,h,near);}
  // ---- the hills under the sun: the far rank hazed purple, its crest edged in gold; the nearer rank darker
  {c.beginPath();c.moveTo(X0,HOR+6);for(let x=X0;x<=640;x+=4)c.lineTo(x,hillA(x));c.lineTo(640,HOR+6);c.closePath();
    c.fillStyle=lin(c,0,HOR-26,0,HOR+6,[[0,'#5a2c3e'],[1,'#7a3e3e']]);c.fill();
    c.save();c.globalCompositeOperation='lighter';c.strokeStyle=rgba('#ffb460',.5);c.lineWidth=1;c.beginPath();
    for(let x=X0;x<=600;x+=4){const k=clamp(1-Math.abs(x-SUN.x)/260,0,1);if(k<=0){c.moveTo(x,hillA(x));continue;}c.lineTo(x,hillA(x));}c.stroke();c.restore();
    c.beginPath();c.moveTo(X0,HOR+6);for(let x=X0;x<=600;x+=4)c.lineTo(x,hillB(x));c.lineTo(600,HOR+6);c.closePath();
    c.fillStyle=lin(c,0,HOR-12,0,HOR+6,[[0,'#3e2030'],[1,'#5a2e30']]);c.fill();
    // the haze lying in the folds of the hills, lit
    c.save();c.globalCompositeOperation='lighter';c.translate(SUN.x,HOR-2);c.scale(1,.12);c.fillStyle=rad(c,0,0,0,360,[[0,rgba('#ff9a50',.3)],[1,rgba('#ff9a50',0)]]);c.beginPath();c.arc(0,0,360,0,TAU);c.fill();c.restore();}
  // ---- the Sprawl on the right horizon
  cityRow(c,470,X1,HOR+1,{seed:12,far:.9,h0:10,h1:46,w0:6,w1:14,lit:.1,hazeH:30,hazeA:.45});
  cityRow(c,500,X1,HOR+2,{seed:19,far:.7,h0:8,h1:30,w0:7,w1:16,lit:.16,hazeH:20,hazeA:.35});
  tower(c);
  cityRow(c,540,X1,HOR+3,{seed:5,far:.45,h0:4,h1:12,w0:9,w1:20,lit:.2,hazeH:10,hazeA:.3});
  glow(c,820,HOR,300,'#ffb070',.08,.25);
  // ---- the valley below the rise: farms in long bands toward the horizon, hedgerows, a farm with a light on, the power line to the city
  {const yA=HOR+2,yB=ey+6;c.fillStyle=lin(c,0,yA,0,yB,[[0,'#6a3e34'],[.35,'#4a2e22'],[1,'#2a1a12']]);c.fillRect(X0,yA,X1-X0,yB-yA);
    const rb=rng(8);for(let k=0;k<9;k++){const t0=Math.pow(k/9,1.5),t1=Math.pow((k+1)/9,1.5),y0=lerp(yA,yB,t0),y1=lerp(yA,yB,t1);
      c.fillStyle=k%2?rgba('#7a5230',.25+.1*rb()):rgba('#20140c',.25);c.fillRect(X0,y0,X1-X0,y1-y0+.3);
      // a hedgerow along some of the field edges: a dark band, bumped by its trees, their tops lit
      if(k>1&&rb()<.6){c.fillStyle=rgba('#1a0f0c',.85);c.beginPath();c.moveTo(X0,y0+.5);for(let x=X0;x<=X1;x+=5)c.lineTo(x,y0-.6-Math.max(0,Math.sin(x*.05+k)*1.6)-(rb()<.08?2.2*t1+1:0));c.lineTo(X1,y0+1.4);c.lineTo(X0,y0+1.4);c.closePath();c.fill();}}
    // the sun's light across the valley floor from the left
    c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,X0,0,760,0,[[0,rgba('#ff9a50',.16)],[.35,rgba('#ff9a50',.12)],[1,rgba('#ff9a50',0)]]);c.fillRect(X0,yA,760-X0,yB-yA);c.restore();
    haze(c,X0,X1,yA-2,yA+8,'#c0705a',.35,true);
    // the farm on the right, under the city: a barn, a silo, a window lit
    {const fx=588,fb=HOR+12;c.fillStyle='#1c120e';c.beginPath();c.moveTo(fx-9,fb);c.lineTo(fx-9,fb-6);c.lineTo(fx-4,fb-10);c.lineTo(fx+4,fb-10);c.lineTo(fx+9,fb-6);c.lineTo(fx+9,fb);c.closePath();c.fill();
      c.fillRect(fx+12,fb-17,4,17);c.beginPath();c.arc(fx+14,fb-17,2,Math.PI,0);c.fill();c.fillStyle=rgba('#ffc070',.85);c.fillRect(fx+3,fb-5,1.4,1.4);glow(c,fx+3.7,fb-4.3,6,'#ffb060',.4);
      c.fillStyle=rgba('#ffb060',.4);c.fillRect(fx-9,fb-6,.6,6);}
    // the power line going away to the city: poles shrinking toward the horizon, the wires sagging between them
    {const P=[];for(let i=0;i<7;i++){const t=i/6,e=Math.pow(t,.7);P.push({x:lerp(440,980,e),b:lerp(ey+5,HOR+4,e),h:lerp(46,8,e),s:lerp(1,.18,e)});}
      c.lineCap='round';for(const p of P){c.strokeStyle='#160e0b';c.lineWidth=Math.max(.5,1.6*p.s);c.beginPath();c.moveTo(p.x,p.b);c.lineTo(p.x,p.b-p.h);c.stroke();
        c.lineWidth=Math.max(.4,1.1*p.s);c.beginPath();c.moveTo(p.x-7*p.s,p.b-p.h+3*p.s);c.lineTo(p.x+7*p.s,p.b-p.h+3*p.s);c.stroke();
        c.strokeStyle=rgba('#ffa858',.4);c.lineWidth=Math.max(.3,.5*p.s);c.beginPath();c.moveTo(p.x-.6*p.s,p.b);c.lineTo(p.x-.6*p.s,p.b-p.h);c.stroke();}
      c.strokeStyle=rgba('#1a100c',.7);c.lineWidth=.45;for(let i=0;i<P.length-1;i++){const A=P[i],B=P[i+1];for(const k of [-6,0,6]){const ax=A.x+k*A.s,ay=A.b-A.h+3*A.s,bx=B.x+k*B.s,by=B.b-B.h+3*B.s;c.beginPath();c.moveTo(ax,ay);c.quadraticCurveTo((ax+bx)/2,(ay+by)/2+2.6*A.s+.6,bx,by);c.stroke();}}
      // and back off the near pole, to the left out over the rise
      for(const k of [-6,0,6]){const A=P[0],ax=A.x+k*A.s,ay=A.b-A.h+3*A.s;c.beginPath();c.moveTo(ax,ay);c.quadraticCurveTo(ax-90,ay+8,ax-200,ay-4);c.stroke();}}}
  // ---- the ground: the top of the rise, dry grass gone gold and brown, the road along it
  const fv=[g2(X0,-190),g2(X1,-190),g2(X1,FAR),g2(X0,FAR)];
  c.save();poly(c,fv);c.clip();c.save();c.transform(1,0,PSX,-PSY,0,GB);
  c.fillStyle=patAt(c,OutTex.meadow(37,{U:96,sc:3,g0:'#2a1c10',g1:'#45301c',dry:'#6e5430',earth:'#1e140b'}),1/3);c.fillRect(X0-60,-210,X1-X0+120,FAR+220);
  // the road: packed earth, two ruts and the grass between them, stones; it bends away over the brow on the right
  {const pts=[];for(let x=X0-40;x<=X1+40;x+=10)pts.push([x,roadD(x)]);const N=pts.length,tr=rng(5);
    c.beginPath();for(let i=0;i<N;i++)c.lineTo(pts[i][0],pts[i][1]-ROAD_W/2*(.94+.12*tr()));for(let i=N-1;i>=0;i--)c.lineTo(pts[i][0],pts[i][1]+ROAD_W/2*(.94+.12*tr()));c.closePath();
    c.fillStyle=patAt(c,OutTex.pathEarth(9,{U:64,sc:4,e0:'#4a3824',e1:'#6a5236',stone:'#8e7c60'}),1/4);c.fill();
    c.strokeStyle=rgba('#140c06',.3);c.lineWidth=1.2;c.stroke();
    c.lineCap='round';for(const off of [-9,9]){const ln=(k,col,w)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();for(let i=0;i<N;i++){const p=pts[i];i?c.lineTo(p[0],p[1]+k):c.moveTo(p[0],p[1]+k);}c.stroke();};
      ln(off,rgba('#1a0f06',.28),6);ln(off,rgba('#1a0f06',.32),2.6);ln(off-1.6,rgba('#ffb060',.14),.8);}
    const rc=rng(15);for(let i=0;i<N-1;i++)for(let k=0;k<4;k++){const u=rc(),x=lerp(pts[i][0],pts[i+1][0],u),d=lerp(pts[i][1],pts[i+1][1],u)+(rc()-.5)*30;
      c.fillStyle=rgba(rc()<.5?'#2a1c10':'#34240f',.55);c.beginPath();c.ellipse(x,d,.8+rc()*1.6,.6+rc()*.8,rc()*3,0,TAU);c.fill();}}
  c.restore();
  // the low sun lies along the rise from the left: a warm sheen on the ground, strongest at the brow, fading toward us
  c.save();c.globalCompositeOperation='lighter';{const q=g2(SUN.x+30,FAR-6);c.translate(q.x,q.y);c.scale(1,.32);c.fillStyle=rad(c,0,0,10,640,[[0,rgba('#ff9a50',.22)],[.45,rgba('#ff9a50',.08)],[1,rgba('#ff9a50',0)]]);c.beginPath();c.arc(0,0,640,0,TAU);c.fill();}c.restore();
  // dust on the road catching the light along its length
  {const rd=rng(44);c.save();c.globalCompositeOperation='lighter';for(let i=0;i<260;i++){const x=X0+rd()*(X1-X0),d=roadD(x)+(rd()-.5)*ROAD_W*.9,q=g2(x,d),k=clamp(1-Math.abs(x-SUN.x)/700,.15,1);c.fillStyle=rgba('#ffcf8a',.1*k+.04*rd());c.fillRect(q.x,q.y,.8,.6);}c.restore();}
  c.restore();
  // ---- stones and tufts across the verges, each with its shadow running toward us
  {const R=rng(61),P=newTufts(),S2=new Path2D(),S2t=new Path2D();
    for(let i=0;i<1900;i++){const x=X0+R()*(X1-X0),d=-176+R()*(FAR+168),rd=Math.abs(d-roadD(x));if(rd<ROAD_W/2+2){if(R()<.92)continue;}
      const near=1+clamp((80-d)/250,0,1)*1.4;if(R()<.85){tuft(P,R,x,d,(4+R()*7)*near*(rd<ROAD_W/2+6?.6:1),3+Math.floor(R()*4));}
      else{const q=g2(x,d),rr=1+R()*2.2;S2.moveTo(q.x+rr,q.y);S2.ellipse(q.x,q.y,rr,rr*.6,0,0,TAU);S2t.moveTo(q.x-rr,q.y-rr*.3);S2t.lineTo(q.x+rr*.5,q.y-rr*.55);}}
    strokeTufts(c,P,.7);c.fillStyle='#1a120c';c.fill(S2);c.strokeStyle=rgba('#ffb060',.4);c.lineWidth=.5;c.stroke(S2t);}
  // ---- the far verge at the brow: an old fence, broken where he has stopped, with two slack wires; weeds against the valley's haze
  {const R=rng(13),tops=[];POSTS.length=0;for(let x=X0;x<X1+30;x+=44+R()*10){if(x>204&&x<400)continue;const t=post(c,x,142,22+R()*7,(R()-.5)*3.4,R);tops.push([x,t]);}
    c.strokeStyle=rgba('#140c08',.85);c.lineWidth=.55;for(const h of [7,15]){c.beginPath();let prev=null;for(const [x,t] of tops){const q=g2(x,142);if(prev&&x-prev[0]<70){const pq=g2(prev[0],142);c.moveTo(pq.x,pq.y-h);c.quadraticCurveTo((pq.x+q.x)/2,(pq.y+q.y)/2-h+3,q.x,q.y-h);}prev=[x,t];}c.stroke();}
    // a strand of the wire hanging loose at each side of the break
    {const a=g2(204-20,142),b=g2(400+18,142);c.beginPath();c.moveTo(a.x,a.y-15);c.quadraticCurveTo(a.x+16,a.y-4,a.x+22,a.y+2);c.moveTo(b.x,b.y-15);c.quadraticCurveTo(b.x-14,b.y-6,b.x-22,b.y+1);c.stroke();}
    const P=newTufts();for(let i=0;i<240;i++){const x=X0+R()*(X1-X0),d=FAR-6+R()*6;tuft(P,R,x,d,4+R()*9,3+Math.floor(R()*3));}strokeTufts(c,P,.7);}
  poplars(c);
  // ---- the near edge, toward us: tall dry grass and seed heads, dark, lit through from behind; thick in the corners, thin in the middle
  {const R=rng(77),P=newTufts();
    for(let i=0;i<760;i++){const x=X0+R()*(X1-X0),edge=x<140?1:x>760?1:.35,d=-190+R()*36;if(R()>edge)continue;tuft(P,R,x,d,16+R()*26,4+Math.floor(R()*4));}
    strokeTufts(c,P,1);}
  // the dark toward us
  c.fillStyle=lin(c,0,GB,0,GB+150,[[0,rgba('#050304',0)],[.55,rgba('#050304',.3)],[1,rgba('#050304',.7)]]);c.fillRect(X0,GB,X1-X0,160);}

// ---------- what moves: the sun going down, a cloud across it, birds, the grass in the wind, the tower's light ----------
const BIRDS=(()=>{const r=rng(91),a=[];for(let i=0;i<6;i++)a.push({x:520+r()*120+i*14,y:190+r()*30,ph:r()*TAU,sp:16+r()*6,s:.8+r()*.4});return a;})();
function live(){const t=S.t,sn=sunNow();ctx.save();
  // the light going as the sun goes: the whole picture a little dimmer, a little more violet, toward the end
  if(sn.u>0){ctx.fillStyle=rgba('#140a22',.24*sn.u*sn.u);ctx.fillRect(-300,-500,W+700,1300);}
  // the sun, behind the hills as it sinks: its disc reddens and flattens as it goes down into the haze, its glow shrinking
  ctx.save();ctx.beginPath();ctx.moveTo(sn.x-70,sn.y-80);ctx.lineTo(sn.x+70,sn.y-80);for(let x=sn.x+70;x>=sn.x-70;x-=3)ctx.lineTo(x,skyFoot(x));ctx.closePath();ctx.clip();
  glow(ctx,sn.x,sn.y,SUN.r*3.4,'#ffd890',.55*(1-.45*sn.u));
  const core=mix('#fff6dc','#ffd8a0',sn.u),edge=mix('#ffb050','#ff7a38',sn.u);ctx.translate(sn.x,sn.y);ctx.scale(1,.94-.04*sn.u);
  ctx.fillStyle=rad(ctx,0,0,0,SUN.r,[[0,core],[.7,mix(core,edge,.5)],[1,edge]]);ctx.beginPath();ctx.arc(0,0,SUN.r,0,TAU);ctx.fill();ctx.restore();
  // a thin cloud across its face
  ctx.save();ctx.globalAlpha=.5;ctx.fillStyle='#5a2a3a';ctx.beginPath();ctx.ellipse(SUN.x-6,SUN.y0+4,46,1.5,0,0,TAU);ctx.fill();ctx.globalAlpha=.32;ctx.beginPath();ctx.ellipse(SUN.x+12,SUN.y0+10,34,1.1,0,0,TAU);ctx.fill();ctx.restore();
  // the low sun's streak across the lens, a long thin line of its light and a softer band round it
  {const k=1-.7*sn.u;ctx.save();ctx.globalCompositeOperation='lighter';
    ctx.fillStyle=lin(ctx,sn.x-280,0,sn.x+280,0,[[0,rgba('#ffd890',0)],[.5,rgba('#ffe4a8',.3*k)],[1,rgba('#ffd890',0)]]);ctx.fillRect(sn.x-280,sn.y-.6,560,1.2);
    ctx.fillStyle=lin(ctx,sn.x-190,0,sn.x+190,0,[[0,rgba('#ff9a50',0)],[.5,rgba('#ffb060',.09*k)],[1,rgba('#ff9a50',0)]]);ctx.fillRect(sn.x-190,sn.y-4,380,8);ctx.restore();}
  // birds going home across the sky, slow
  ctx.strokeStyle='#1a1018';ctx.lineWidth=.8;ctx.lineCap='round';
  for(const b of BIRDS){const x=b.x-t*b.sp,y=b.y+Math.sin(t*.5+b.ph)*2,f=Math.sin(t*7+b.ph)*1.6*b.s,w=3.2*b.s;if(x<-200)continue;ctx.beginPath();ctx.moveTo(x-w,y-f);ctx.quadraticCurveTo(x-w*.4,y-1.2,x,y);ctx.quadraticCurveTo(x+w*.4,y-1.2,x+w,y-f);ctx.stroke();}
  // at the end, far off, his tail light crossing the valley toward the city (S.story.far, the scene's), his lamp's glow on the road ahead
  {const F0=S.story&&S.story.far,D=typeof SUNDOWN!=='undefined'?SUNDOWN.far.dur:3.4;if(F0){const u=clamp((t-F0.t0)/D,0,1),e=1-Math.pow(1-u,1.6),x=lerp(935,772,e),y=lerp(357.5,336.5,e),
      a=clamp(u/.12,0,1)*clamp((1-u)/.25,0,1)*(POSTS.some(P=>x>P.x0&&x<P.x1&&y>P.y0&&y<P.y1)?0:1),k=1-.45*e;
    glow(ctx,x-7*k,y-1,10*k,'#fff0c8',.22*a);glow(ctx,x,y,6*k,'#ff3a2a',.6*a);ctx.fillStyle=rgba('#ff7058',.95*a);ctx.fillRect(x-.7*k,y-.6*k,1.4*k,1.2*k);}}
  // the red light on the tower's needle
  {const h=TOWER.base-TOWER.top,y=TOWER.top-h*.2,on=Math.pow(Math.max(0,Math.sin(t*2.4)),8);if(on>.02){glow(ctx,TOWER.x,y,7,'#ff3a2a',.8*on);ctx.fillStyle=rgba('#ffd0c0',on);ctx.fillRect(TOWER.x-.6,y-.6,1.2,1.2);}}
  ctx.restore();}
// the light that rims him and the bike: the sun, low behind on the left
function light(f){return{light:{x:SUN.x-f.dep*PSX,y:SUN.y0+8+f.dep*PSY}};}
E.S.outskirts={paint,live,light,sun:sunNow,road:roadD,SUN,HOR};
})();
// ===== ENV OUTSKIRTS END =====
