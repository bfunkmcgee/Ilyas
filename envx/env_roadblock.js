// ===== ENV ROADBLOCK =====
// The checkpoint: the far end of the city avenue where it runs into the tower district, an hour before midnight, after rain. Office
// towers in black stone and glass close the street on the far side, their ground floors shuttered for the night; over them, close now
// and filling the sky, the Hallowell tower: a black elven spire with gold fins, its gold H high on the shaft, its crown a ring of cyan
// light with searchlights sweeping out of it. Trolley wires hang over the road from bracket poles on the far kerb, and a sodium lamp or
// two still burns. The police have closed the road: a light tower on the far pavement and a floodlight on a tripod throw cold white
// light down the avenue toward whoever comes, striped sawhorses with amber and blue flashers stand across the far lane and the near
// one, a lit message board says CHECKPOINT, a spike strip lies across the asphalt, and a cruiser waits at the back with its lightbar
// turning. The asphalt is wet: worn lane paint, puddles holding the lights, a manhole breathing steam. The fighting band (depth 12 to
// 170) is clear, and the right third of the floor is plain asphalt for the armoured carrier (ApcLook) that stands there.
(()=>{const E=EnvLook,{C,pp,poly,line,rect,lin,rad,rgba,mix,glow,beam,haze,gilt,windowPane,wetStreak,stars,cloudBank,skyline,rng,lerp,clamp,TAU}=E;
const KB=12,DF=240;                           // the kerb's height and the facade line (depth)
const g0=()=>GB-KB,fy=d=>g0()-d*PSY,fx=(x,d)=>x+d*PSX;
const gq=(x,d)=>pp(x,GB,d);                   // a point on the road
const TOWER={x:650,base:300,top:34,w:134};    // the Hallowell tower, close: screen x of its axis, the top of the shaft, its width at the foot
const MAST={x:796,d:214,h:226};               // the light tower on the far pavement (plane x, depth, height of the lamp bank)
const TRI={x:452,d:184,h:118};                // a floodlight on a tripod in the far lane
const LAMPS=[{x:-80,d:206},{x:214,d:206}];    // sodium lamps on the bracket poles, left of the checkpoint
const POLES=[-80,214,466,880];                // trolley bracket poles along the far kerb (plane x)
const CRUISER={x:262,d:191,len:300};          // the police cruiser at the back, facing the checkpoint
const BOARD={x:62,d:194};                     // the message board trailer
const BARR=[{x:470,d:180,w:84},{x:520,d:196,w:84},{x:396,d:-28,w:96},{x:500,d:-44,w:96}];   // sawhorses: centre x, depth, length
const CONES=[{x:366,d:186},{x:396,d:178},{x:600,d:182},{x:322,d:-24},{x:288,d:-34},{x:566,d:-30}];
const SPIKE={x:548};                          // the spike strip runs across the road at this x
const HOLE={x:236,d:58};                      // the manhole that steams
const mastLamp=()=>pp(MAST.x,g0()-MAST.h,MAST.d),triLamp=()=>gq(TRI.x+14,TRI.d-0),lampHead=L=>pp(L.x+44,g0()-196,L.d-122);
// ---------- materials ----------
function patAt(c,cv,x,y,u,rot){const p=c.createPattern(cv,'repeat');if(p.setTransform){let m=new DOMMatrix().translate(x,y);if(rot)m=m.rotate(rot);p.setTransform(m.scale(u));}return p;}
// wet asphalt seen from above: fine aggregate in a dark binder, tar patches, cracks; U plane units square at sc px a unit
const TEXC={};
function asphalt(seed,o){o=o||{};const key='asph'+seed+JSON.stringify(o);if(TEXC[key])return TEXC[key];const T=EnvTex,U=o.U||64,sc=o.sc||4,N=Math.round(U*sc);
  const n=T.noise2(seed,8),n2=T.noise2(seed+1,32),n3=T.noise2(seed+2,128),b0=T.hex(o.b0||'#14161c'),b1=T.hex(o.b1||'#23262d'),ag=T.hex(o.ag||'#50535c'),pa=T.hex(o.patch||'#0c0d11');
  const cv=T.pix(N,N,(u,v,out)=>{const a=T.fbm(n,u*8,v*8,4),g=n3(u*128,v*128),m=T.fbm(n2,u*32,v*32,2);let cc=T.lerp3(b0,b1,clamp(a*1.25-.12,0,1));
    if(g>.8)cc=T.lerp3(cc,ag,clamp((g-.8)*3.4,0,.7));else if(g<.16)cc=T.lerp3(cc,[5,5,7],.55);
    if(m<.28)cc=T.lerp3(cc,pa,clamp((.28-m)*3.2,0,.7));out[0]=cc[0];out[1]=cc[1];out[2]=cc[2];});
  // cracks that wander across the tile and come back in on the far side
  const c=cv.getContext('2d'),r=rng(seed+9);c.lineCap='round';
  for(let k=0;k<5;k++){let x=r()*N,y=r()*N,a=r()*TAU;const pts=[[x,y]];for(let i=0;i<22;i++){a+=(r()-.5)*.9;x+=Math.cos(a)*6;y+=Math.sin(a)*6;pts.push([x,y]);}
    for(const [ox,oy] of [[0,0],[-N,0],[N,0],[0,-N],[0,N]]){c.strokeStyle='rgba(0,0,0,.55)';c.lineWidth=1.3;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0]+ox,p[1]+oy):c.moveTo(p[0]+ox,p[1]+oy));c.stroke();
      c.strokeStyle='rgba(160,170,190,.08)';c.lineWidth=.5;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0]+ox+.8,p[1]+oy-.6):c.moveTo(p[0]+ox+.8,p[1]+oy-.6));c.stroke();}}
  return TEXC[key]=cv;}
// the windows of an office block at night: panes cw by ch in rows (one row a floor), each floor lit or dark as a whole with a few
// panes against it, cold office light mostly and a warm desk lamp here and there; the dark panes hold a little of the street's light
function officeLights(c,x0,x1,y0,y1,o){const r=rng(o.seed||3),cw=o.cw||5,ch=o.ch||6.5,gap=o.gap||1.1,P={warm:new Path2D(),cold:new Path2D(),dim:new Path2D(),dark:new Path2D()};
  for(let y=y0;y<y1-ch*.6;y+=ch){const fl=r(),floorLit=fl<(o.lit||.25)?.8:fl<(o.lit||.25)+.15?.35:.04;
    for(let x=x0;x<x1-cw*.5;x+=cw){const v=r(),w=cw-gap,h=ch-gap-(o.spand||1.4);
      const p=v<floorLit?(r()<(o.coldP||.6)?P.cold:P.warm):v<floorLit+.1?P.dim:P.dark;p.rect(x,y,w,h);}}
  c.fillStyle=o.dark||'#06070c';c.fill(P.dark);c.fillStyle=rgba('#3a4866',.4);c.fill(P.dim);
  c.globalAlpha=o.bright||.62;c.fillStyle=lin(c,0,y0,0,y1,[[0,'#c4d4f0'],[1,'#8ea2c8']]);c.fill(P.cold);c.fillStyle=lin(c,0,y0,0,y1,[[0,'#ffd9a0'],[1,'#e0a060']]);c.fill(P.warm);c.globalAlpha=1;}
// ---------- the sky, the far city, the tower ----------
function sky(c,X0,X1,T0,base){
  c.fillStyle=lin(c,0,T0,0,base,[[0,'#020309'],[.3,'#070916'],[.62,'#121527'],[.85,'#1f1b2c'],[1,'#2e2230']]);c.fillRect(X0,T0,X1-X0,base-T0+6);
  stars(c,X0,X1,T0,90,90,23,.5);
  // cloud over the district, its underside lit by the city and the tower's cyan
  cloudBank(c,X0,X1,26,34,{seed:8,n:16,col:'#121424',under:'#6a6a9a'});
  {const g=rad(c,TOWER.x,TOWER.top+10,10,420,[[0,rgba(C.cyan,.12)],[.4,rgba(C.cyan,.04)],[1,rgba(C.cyan,0)]]);c.save();c.globalCompositeOperation='lighter';c.fillStyle=g;c.fillRect(X0,T0,X1-X0,base-T0);c.restore();}
  glow(c,TOWER.x,base,520,'#ff9a5a',.12,.4);}
// the Hallowell tower near: a stepped black shaft, gold fins up its corners and in ranks across its face, lit floors in bands, the gold
// vine along each setback, the gilt H in its frame high on the shaft, and the crown: gold blades round a ring of cyan light, a needle,
// and the housings of the searchlights; the blocks in front of it hide its foot
function nearTower(c){const {x,base,top,w}=TOWER,h=base-top,r=rng(71);c.save();
  const stages=[[0,1],[.28,.9],[.5,.78],[.68,.66],[.84,.52]];
  for(let i=0;i<stages.length;i++){const [f,k]=stages[i],y0=base-h*f,y1=i+1<stages.length?base-h*stages[i+1][0]:top,ww=w*k,xl=x-ww/2,xr=x+ww/2;
    c.fillStyle=lin(c,xl,0,xr,0,[[0,'#030409'],[.2,'#0a0c15'],[.55,'#0f121c'],[.82,'#181b28'],[1,'#06070d']]);c.fillRect(xl,y1,ww,y0-y1+1);
    // the floors, in bands between the fins: most dark this late, the lit ones in runs
    {const nf=5,fw=ww/nf,P=new Path2D(),Q=new Path2D();for(let y=y0-4;y>y1+5;y-=4.4){const run=r()<.3;for(let j=0;j<nf;j++){if(!run&&r()<.72)continue;if(run&&r()<.15)continue;
      const wx=xl+j*fw+3,ww2=fw-6;for(let k2=0;k2<3;k2++)(r()<.82?P:Q).rect(wx+k2*ww2/3,y-2.1,ww2/3-.9,2.2);}}
      c.fillStyle=rgba('#ffcf86',.5);c.fill(P);c.fillStyle=rgba('#d8ecff',.45);c.fill(Q);}
    // the gold fins: the corners heavy, the ranks across the face slender
    for(let j=0;j<=5;j++){const fxp=xl+j*ww/5-(j===5?2.6:j===0?0:.7),fw2=j===0||j===5?2.6:1.4;
      c.fillStyle=lin(c,fxp,0,fxp+fw2,0,[[0,C.goldDD],[.45,C.gold],[.7,C.goldL],[1,C.goldD]]);c.globalAlpha=j===0||j===5?1:.7;c.fillRect(fxp,y1,fw2,y0-y1);}c.globalAlpha=1;
    // the setback's ledge, gold, with the vine running along it
    c.fillStyle=lin(c,0,y1,0,y1+3,[[0,C.goldL],[1,C.goldD]]);c.fillRect(xl-4,y1,ww+8,2.8);c.fillStyle=rgba('#000000',.45);c.fillRect(xl-4,y1+2.8,ww+8,1.4);
    E.vine(c,[{x:xl-2,y:y1+6.4},{x:xr+2,y:y1+6.4}],{w:.6,amp:1.1,wave:9,leaf:1.6,every:2,seed:i+3,col:rgba(C.gold,.75)});}
  // the floods catch the shaft's right edge
  c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,x+w*.36,0,x+w*.5,0,[[0,rgba('#cfe0ff',0)],[1,rgba('#cfe0ff',.12)]]);c.fillRect(x+w*.36,base-h*.34,w*.14,h*.34);c.restore();
  // the H, gilt, in its frame, its glow on the stone round it
  {const hy=base-h*.7,hs=w*.2;c.fillStyle='#04050a';c.fillRect(x-hs/2-7,hy-hs*.6-7,hs+14,hs*1.2+14);
    c.fillStyle=lin(c,0,hy-hs*.6,0,hy+hs*.6,[[0,C.goldL],[.45,C.gold],[1,C.goldD]]);
    c.fillRect(x-hs/2,hy-hs*.6,hs*.24,hs*1.2);c.fillRect(x+hs/2-hs*.24,hy-hs*.6,hs*.24,hs*1.2);c.fillRect(x-hs/2,hy-hs*.09,hs,hs*.18);
    c.fillStyle=rgba('#fff6d6',.6);c.fillRect(x-hs/2,hy-hs*.6,hs*.24,.8);c.fillRect(x+hs/2-hs*.24,hy-hs*.6,hs*.24,.8);
    c.strokeStyle=rgba(C.gold,.9);c.lineWidth=1;c.strokeRect(x-hs/2-5,hy-hs*.6-5,hs+10,hs*1.2+10);glow(c,x,hy,hs*2.8,C.amber,.3);}
  // the crown
  {const cy=top,cw=w*.62;c.fillStyle='#06070d';c.fillRect(x-4,cy-50,8,50);c.fillStyle=lin(c,x-1.6,0,x+1.6,0,[[0,C.goldD],[.5,C.goldL],[1,C.goldD]]);c.fillRect(x-1.6,cy-74,3.2,44);
    for(let k2=-3;k2<=3;k2++){const bx=x+k2*cw*.15,bh=34-Math.abs(k2)*7;c.fillStyle=lin(c,0,cy-bh,0,cy,[[0,C.goldL],[1,C.goldD]]);c.beginPath();c.moveTo(bx-cw*.05,cy);c.lineTo(bx,cy-bh);c.lineTo(bx+cw*.05,cy);c.closePath();c.fill();}
    glow(c,x,cy-13,w*1.2,C.cyan,.48,.5);glow(c,x,cy-13,w*.36,C.cyanL,.7);
    c.strokeStyle=rgba(C.cyan,.95);c.lineWidth=2.2;c.beginPath();c.ellipse(x,cy-13,cw*.46,cw*.1,0,0,TAU);c.stroke();
    c.strokeStyle=rgba(C.cyanL,.7);c.lineWidth=.8;c.beginPath();c.ellipse(x,cy-13,cw*.46,cw*.1,0,Math.PI*.1,Math.PI*.9);c.stroke();
    for(const sd of [-1,1]){const hx=x+sd*cw*.47;c.fillStyle='#0b0c12';c.beginPath();c.moveTo(hx-5,cy);c.lineTo(hx-4,cy-8);c.lineTo(hx+4,cy-8);c.lineTo(hx+5,cy);c.closePath();c.fill();
      c.fillStyle=rgba('#f4f8ff',.95);c.beginPath();c.ellipse(hx,cy-8,3.4,1.2,0,0,TAU);c.fill();glow(c,hx,cy-8,10,'#e6f0ff',.6);}}
  c.restore();}
// ---------- the blocks across the street ----------
// a block: x0..x1 on screen at the facade line, its top; a glass curtain wall of black glass and steel, or dark stone with deco piers
// and gold chevrons in the spandrels; a setback crown with a lit band on some; the edge toward the floods catches them
function block(c,b,base){const {x0,x1,top}=b,w=x1-x0,r=rng(b.seed),gTop=base-(b.shopH||52);
  if(b.glass){c.fillStyle=lin(c,x0,0,x1,0,[[0,'#05060a'],[.55,'#0b0d15'],[1,'#07080d']]);c.fillRect(x0,top,w,gTop-top);
    officeLights(c,x0+2,x1-2,top+5,gTop-9,{seed:b.seed,cw:b.cw||5.2,ch:b.ch||6.6,lit:b.lit||.24,coldP:.65});
    // the steel: a mullion every few panes, a spandrel band every floor, darker
    c.fillStyle=rgba('#000000',.55);for(let x=x0+(b.cw||5.2)*3;x<x1;x+=(b.cw||5.2)*3)c.fillRect(x-.4,top,1,gTop-top);
    c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,x0,0,x1,0,[[0,rgba('#9ab4e0',0)],[.7,rgba('#9ab4e0',.03)],[1,rgba('#9ab4e0',.09)]]);c.fillRect(x0,top,w,gTop-top);c.restore();
    c.fillStyle=rgba('#cfe0ff',.22);c.fillRect(x0,top,w,.8);}
  else{c.fillStyle=lin(c,x0,0,x1,0,[[0,'#08080d'],[.5,'#111119'],[1,'#09090f']]);c.fillRect(x0,top,w,gTop-top);
    const n=Math.max(3,Math.floor(w/20)),sw=w/n;
    for(let i=0;i<n;i++){const sx=x0+i*sw;
      officeLights(c,sx+5,sx+sw-1.5,top+7,gTop-11,{seed:b.seed*7+i,cw:(sw-6.5)/2,ch:8.6,lit:b.lit||.22,coldP:.35,spand:3});
      c.fillStyle=lin(c,sx,0,sx+4,0,[[0,'#1d1c26'],[1,'#0a0a10']]);c.fillRect(sx,top,4,gTop-top);
      for(let y=top+14.6;y<gTop-12;y+=8.6){c.fillStyle=rgba(C.gold,.22);c.beginPath();c.moveTo(sx+5,y);c.lineTo(sx+sw/2,y-1.8);c.lineTo(sx+sw-1.5,y);c.lineTo(sx+sw/2,y-.8);c.closePath();c.fill();}}
    c.fillStyle=rgba(C.gold,.5);c.fillRect(x0,top,w,1.1);}
  if(b.cap){const cw=w*.66,cx=x0+w*.17;c.fillStyle='#0a0a11';c.fillRect(cx,top-b.cap,cw,b.cap);c.fillStyle=rgba(C.gold,.55);c.fillRect(cx,top-b.cap,cw,1.1);
    c.fillStyle=rgba('#ffd9a0',.3);c.fillRect(cx+3,top-b.cap*.55,cw-6,1.4);glow(c,cx+cw/2,top-b.cap*.5,cw*.6,'#ffb866',.1,.3);
    if(b.mast){c.fillStyle='#08080d';c.fillRect(cx+cw/2-.8,top-b.cap-b.mast,1.6,b.mast);}}
  c.fillStyle=lin(c,x1-6,0,x1,0,[[0,rgba('#cfe0ff',0)],[1,rgba('#cfe0ff',.12)]]);c.fillRect(x1-6,top,6,gTop-top);
  // the ground floor: a stone band, then the shops, shut
  c.fillStyle='#0d0c12';c.fillRect(x0,gTop-7,w,7);c.fillStyle=rgba(C.gold,.36);c.fillRect(x0,gTop-7,w,.9);
  const shops=b.shops||[[x0+4,x1-4,null]];for(const [s0,s1,name] of shops)shutter(c,s0,s1,gTop,base,name,r);
  return{gTop};}
// a shop closed for the night: a roller shutter of ribbed steel pulled down (one left a foot up, light under it), a dead sign over it
function shutter(c,x0,x1,gTop,base,name,r){const w=x1-x0,sy=gTop+12,up=r()<.35?4+r()*6:0;
  c.fillStyle='#08070b';c.fillRect(x0,gTop,w,base-gTop);
  // the sign box: dark, its letters unlit but catching the floods
  c.fillStyle=lin(c,0,gTop+1,0,gTop+10,[[0,'#16151d'],[1,'#0a090e']]);c.fillRect(x0+2,gTop+1,w-4,9);
  if(name){c.save();c.font='700 6.4px "Alegreya SC", Georgia, serif';c.textAlign='center';c.fillStyle=rgba('#c8d2e8',.32);c.fillText(name,(x0+x1)/2,gTop+7.8);c.restore();}
  // the shutter: ribs, a bottom bar and lock, grime toward the street, a tag sprayed on it now and then
  const sb=base-up;c.fillStyle=lin(c,0,sy,0,sb,[[0,'#1d1f26'],[1,'#121319']]);c.fillRect(x0+3,sy,w-6,sb-sy);
  c.fillStyle=rgba('#000000',.45);for(let y=sy+2;y<sb-1;y+=2.4)c.fillRect(x0+3,y,w-6,.7);c.fillStyle=rgba('#a8b4cc',.08);for(let y=sy+1.2;y<sb-1;y+=2.4)c.fillRect(x0+3,y,w-6,.5);
  c.fillStyle='#0a0a0e';c.fillRect(x0+3,sb-2.6,w-6,2.6);c.fillStyle=rgba('#c8d2e8',.25);c.fillRect((x0+x1)/2-1.5,sb-2.4,3,1.6);
  if(up){c.fillStyle=lin(c,0,sb,0,base,[[0,'#ffd9a0'],[1,'#b8783a']]);c.fillRect(x0+3,sb,w-6,up);glow(c,(x0+x1)/2,base,w*.7,'#ffb866',.25,.25);}
  if(r()<.5){c.save();c.globalAlpha=.35;c.strokeStyle=r()<.5?'#8a2a3a':'#2a6a6a';c.lineWidth=1.3;c.lineCap='round';const tx=x0+6+r()*(w-30),ty=sy+8+r()*10;c.beginPath();
    for(let k=0;k<6;k++)c.lineTo(tx+k*4+r()*2,ty+(k%2?-5:3)+r()*2);c.stroke();c.restore();}
  c.fillStyle='#0d0c12';c.fillRect(x0,gTop,3,base-gTop);c.fillRect(x1-3,gTop,3,base-gTop);}
// ---------- the street furniture ----------
// a trolley bracket pole on the far kerb: a steel mast, an arm out over the road carrying the wire, a sodium lamp hung under some
function pole(c,px,withLamp){const d=204,b=pp(px,g0(),d),top=pp(px,g0()-214,d),arm=pp(px+44,g0()-196,d-122);
  c.lineCap='round';c.strokeStyle='#07070b';c.lineWidth=3.2;c.beginPath();c.moveTo(b.x,b.y);c.lineTo(top.x,top.y);c.stroke();
  c.strokeStyle=rgba('#9ab0d8',.18);c.lineWidth=.8;c.beginPath();c.moveTo(b.x+1.2,b.y);c.lineTo(top.x+1.2,top.y);c.stroke();
  c.fillStyle='#0a0a0e';c.fillRect(b.x-3.4,b.y-14,6.8,14);c.fillStyle=rgba(C.gold,.35);c.fillRect(b.x-3.4,b.y-14,6.8,.8);
  // the bracket arm out over the road, its tie rod, the insulators
  const t2=pp(px,g0()-202,d);c.strokeStyle='#06060a';c.lineWidth=1.8;c.beginPath();c.moveTo(t2.x,t2.y);c.lineTo(arm.x,arm.y);c.stroke();
  c.lineWidth=.7;c.beginPath();c.moveTo(top.x,top.y);c.lineTo(arm.x,arm.y-.5);c.stroke();
  c.fillStyle='#1a1a22';c.fillRect(arm.x-1.4,arm.y,2.8,3);
  if(withLamp){const L=lampHead({x:px,d});c.fillStyle='#0a0a0e';c.beginPath();c.moveTo(L.x-7,L.y-1.4);c.quadraticCurveTo(L.x,L.y-5,L.x+8,L.y-1);c.lineTo(L.x+6,L.y+1.6);c.lineTo(L.x-6,L.y+1.6);c.closePath();c.fill();
    c.fillStyle=lin(c,0,L.y+.6,0,L.y+3,[[0,'#fff2c8'],[1,'#ffb050']]);c.fillRect(L.x-5,L.y+.8,10,2);}}
// the light tower on its trailer: a mast, a bank of four lamps aimed down the road at whoever comes, the generator
function lightTower(c){const d=MAST.d,base=g0(),q=x=>pp(x,base,d),b0=q(MAST.x-26),b1=q(MAST.x+30);
  c.fillStyle='#0b0b10';c.fillRect(b0.x,b0.y-18,b1.x-b0.x,14);c.fillStyle=rgba('#ffcf86',.25);c.fillRect(b0.x,b0.y-18,b1.x-b0.x,.8);
  c.fillStyle='#050508';for(const xx of [b0.x+8,b1.x-8]){c.beginPath();c.arc(xx,b0.y-4,4.2,0,TAU);c.fill();}
  c.fillStyle=rgba('#d8a64e',.6);c.fillRect(b0.x+4,b0.y-14,8,3);c.fillStyle=rgba('#c8d2e8',.3);c.font='700 4px Arial';c.fillText('POLICE',b0.x+16,b0.y-10);
  const m0=q(MAST.x),m1=pp(MAST.x,base-MAST.h+6,d);c.strokeStyle='#08080c';c.lineWidth=3;c.beginPath();c.moveTo(m0.x,m0.y-18);c.lineTo(m1.x,m1.y);c.stroke();
  c.strokeStyle=rgba('#cfe0ff',.2);c.lineWidth=.7;c.beginPath();c.moveTo(m0.x+1.3,m0.y-18);c.lineTo(m1.x+1.3,m1.y);c.stroke();
  // the outriggers and the cable
  c.strokeStyle='#06060a';c.lineWidth=1.2;c.beginPath();c.moveTo(b0.x+4,b0.y-6);c.lineTo(b0.x-12,b0.y+1);c.moveTo(b1.x-4,b1.y-6);c.lineTo(b1.x+12,b1.y+1);c.stroke();
  // the lamp bank: four heads on a cross bar, their faces turned to the left and down the avenue, burning white
  const L=mastLamp();c.fillStyle='#08080c';c.fillRect(L.x-18,L.y-1,36,3);
  for(const [dx,dy] of [[-13,-6],[-4,-6],[5,-6],[14,-6]]){const hx=L.x+dx,hy=L.y+dy;c.fillStyle='#0c0c12';c.beginPath();c.moveTo(hx-4,hy-4);c.lineTo(hx+3,hy-5);c.lineTo(hx+4,hy+4);c.lineTo(hx-4,hy+4);c.closePath();c.fill();
    c.fillStyle=lin(c,hx-4,0,hx,0,[[0,'#ffffff'],[1,'#c8dcff']]);c.fillRect(hx-4.6,hy-3.4,1.8,6.8);}}
// a floodlight on a tripod in the far lane, turned down the road
function tripod(c){const d=TRI.d,b=gq(TRI.x,d),hd=gq(TRI.x,d);hd.y-=TRI.h;
  c.strokeStyle='#07070b';c.lineWidth=1.6;c.lineCap='round';c.beginPath();for(const [dx,dd] of [[-16,6],[14,8],[2,-10]]){const f=gq(TRI.x+dx,d+dd);c.moveTo(hd.x,hd.y+16);c.lineTo(f.x,f.y);}c.stroke();
  c.lineWidth=2.4;c.beginPath();c.moveTo(hd.x,hd.y+18);c.lineTo(hd.x,hd.y+4);c.stroke();
  // the lamp head: a deep box with its yoke, the face turned down the road, burning white behind its grille
  c.strokeStyle='#08080c';c.lineWidth=1.4;c.beginPath();c.moveTo(hd.x-3,hd.y+10);c.lineTo(hd.x-9,hd.y);c.moveTo(hd.x+3,hd.y+10);c.lineTo(hd.x+9,hd.y);c.stroke();
  c.fillStyle='#0b0b11';c.beginPath();c.moveTo(hd.x-12,hd.y-9);c.lineTo(hd.x+9,hd.y-11);c.lineTo(hd.x+11,hd.y+7);c.lineTo(hd.x-12,hd.y+8);c.closePath();c.fill();
  c.fillStyle=rgba('#cfe0ff',.3);c.fillRect(hd.x-11,hd.y-9.6,19,.8);
  c.fillStyle=lin(c,hd.x-14,0,hd.x-9,0,[[0,'#ffffff'],[1,'#c4d8ff']]);c.fillRect(hd.x-14,hd.y-8,3.4,15);
  c.strokeStyle=rgba('#0b0b11',.6);c.lineWidth=.5;c.beginPath();for(let k=0;k<4;k++){c.moveTo(hd.x-14,hd.y-6+k*4);c.lineTo(hd.x-10.6,hd.y-6+k*4);}c.stroke();
  c.strokeStyle='#050508';c.lineWidth=.7;c.beginPath();c.moveTo(hd.x+2,hd.y+5);c.quadraticCurveTo(hd.x+16,b.y-6,hd.x+30,b.y+2);c.stroke();}
// a police sawhorse: two splayed legs each end, a board striped white and police blue, POLICE LINE on it, a flasher on top
function sawhorse(c,s,o){const d=s.d,h=s.h||38,L=s.w/2,q=(x,y)=>pp(x,GB-y,d),near=d<0;
  c.strokeStyle='#08080c';c.lineWidth=near?2.4:1.6;c.lineCap='round';c.beginPath();
  for(const ex of [s.x-L+6,s.x+L-6])for(const sp of [-1,1]){const a=q(ex,h-6),f=pp(ex+sp*7,GB,d+sp*5);c.moveTo(a.x,a.y);c.lineTo(f.x,f.y);}c.stroke();
  const b0=q(s.x-L,h),b1=q(s.x+L,h),bh=near?9:7;c.save();c.beginPath();c.rect(b0.x,b0.y-bh,b1.x-b0.x,bh);c.clip();
  c.fillStyle='#e8ecf2';c.fillRect(b0.x,b0.y-bh,b1.x-b0.x,bh);c.fillStyle='#1b2a4e';for(let x=b0.x-bh;x<b1.x+bh;x+=bh*1.4){c.beginPath();c.moveTo(x,b0.y);c.lineTo(x+bh*.7,b0.y);c.lineTo(x+bh*1.4,b0.y-bh);c.lineTo(x+bh*.7,b0.y-bh);c.closePath();c.fill();}
  c.fillStyle=rgba('#000000',.32);c.fillRect(b0.x,b0.y-bh,b1.x-b0.x,bh);c.restore();
  // the lettering band under the stripes
  const lb=q(s.x-L,h-9);c.fillStyle='#0d1424';c.fillRect(lb.x,lb.y-5,b1.x-b0.x,5);c.save();c.font=`700 ${near?4.6:3.6}px Arial`;c.textAlign='center';c.fillStyle=rgba('#e8ecf2',.75);c.fillText('POLICE LINE   DO NOT CROSS',(b0.x+b1.x)/2,lb.y-1.2);c.restore();
  c.fillStyle=rgba('#cfe0ff',.35);c.fillRect(b0.x,b0.y-bh,b1.x-b0.x,.6);
  // the flasher's housing: the lamp itself burns in live()
  const fq=q(s.x+L*.55,h);c.fillStyle='#0a0a0e';c.fillRect(fq.x-2.6,fq.y-bh-4.4,5.2,4.4);c.fillStyle=rgba(s.col==='b'?'#4a7cff':'#ffb030',.55);c.fillRect(fq.x-2,fq.y-bh-3.8,4,3.2);}
// a traffic cone, orange with two reflective bands
function cone(c,k){const q=gq(k.x,k.d),h=k.d<0?24:18,w=h*.42;c.fillStyle='#0a0a0e';c.fillRect(q.x-w*.75,q.y-2,w*1.5,2);
  c.fillStyle=lin(c,q.x-w/2,0,q.x+w/2,0,[[0,'#5a1e08'],[.6,'#c8561a'],[1,'#6a240a']]);c.beginPath();c.moveTo(q.x-w/2,q.y-2);c.lineTo(q.x-1,q.y-h);c.lineTo(q.x+1,q.y-h);c.lineTo(q.x+w/2,q.y-2);c.closePath();c.fill();
  c.fillStyle=rgba('#e8ecf2',.8);for(const f of [.35,.62]){const y=q.y-2-(h-2)*f,ww=w*(1-f)*.95;c.fillRect(q.x-ww/2,y-1.6,ww,2);}
  c.fillStyle=rgba('#cfe0ff',.3);c.beginPath();c.moveTo(q.x+w*.15,q.y-3);c.lineTo(q.x+.6,q.y-h+1);c.lineTo(q.x+1,q.y-h+1);c.lineTo(q.x+w*.4,q.y-3);c.closePath();c.fill();}
// the message board trailer: a frame of amber dots on black, CHECKPOINT and an arrow
function msgBoard(c){const d=BOARD.d,q=(x,y)=>pp(x,GB-y,d),b=q(BOARD.x,0),p0=q(BOARD.x-30,112),p1=q(BOARD.x+30,78);
  c.strokeStyle='#07070b';c.lineWidth=2.4;c.beginPath();c.moveTo(b.x,b.y-14);c.lineTo(b.x,p1.y);c.stroke();
  c.fillStyle='#0a0a0e';c.fillRect(b.x-24,b.y-16,48,10);c.fillStyle='#050508';for(const xx of [b.x-14,b.x+14]){c.beginPath();c.arc(xx,b.y-5,4.6,0,TAU);c.fill();}
  c.fillStyle='#050507';c.fillRect(p0.x,p0.y,p1.x-p0.x,p1.y-p0.y);c.strokeStyle='#1a1a22';c.lineWidth=1.4;c.strokeRect(p0.x,p0.y,p1.x-p0.x,p1.y-p0.y);
  c.fillStyle=rgba('#ffb030',.14);for(let y=p0.y+3;y<p1.y-2;y+=2.2)for(let x=p0.x+3;x<p1.x-2;x+=2.2)c.fillRect(x,y,1,1);}
// the cruiser at the back: long and low, dark blue with white doors, a gold badge on the door, the lightbar on its roof
function cruiser(c){const d=CRUISER.d,L=CRUISER.len,x0=CRUISER.x-L/2,q=(x,y)=>pp(x0+x,GB-y,d);
  const body=[[0,22],[6,40],[44,46],[78,50],[104,74],[192,76],[222,52],[284,46],[298,36],[300,22],[292,14],[0,14]];
  c.fillStyle='rgba(0,0,0,.5)';{const a=q(-10,0),b=q(L+10,0);c.beginPath();c.ellipse((a.x+b.x)/2,a.y,(b.x-a.x)/2,5,0,0,TAU);c.fill();}
  c.beginPath();body.forEach((p,i)=>{const s=q(p[0],p[1]);i?c.lineTo(s.x,s.y):c.moveTo(s.x,s.y);});c.closePath();
  c.fillStyle=lin(c,0,q(0,76).y,0,q(0,14).y,[[0,'#1d2436'],[.45,'#121726'],[1,'#07080d']]);c.fill();
  // the white doors, the windows dark with the street's light in them
  {const d0=q(108,22),d1=q(200,58);c.fillStyle=lin(c,0,d1.y,0,d0.y,[[0,'#c8ccd6'],[1,'#7a808e']]);c.fillRect(d0.x,d1.y,d1.x-d0.x,d0.y-d1.y);
    c.strokeStyle='#05060a';c.lineWidth=.8;c.beginPath();const mid=q(154,22),mt=q(154,58);c.moveTo(mid.x,mid.y);c.lineTo(mt.x,mt.y);c.stroke();
    c.save();c.translate((d0.x+mid.x)/2,(d0.y+d1.y)/2+2);c.fillStyle=rad(c,0,0,0,7,[[0,C.goldL],[.6,C.gold],[1,C.goldD]]);c.beginPath();c.moveTo(0,-7);c.lineTo(5.6,-4);c.lineTo(4.4,4);c.lineTo(0,7.4);c.lineTo(-4.4,4);c.lineTo(-5.6,-4);c.closePath();c.fill();
      c.fillStyle='#3a2a10';c.fillRect(-2.4,-3.6,1,7);c.fillRect(1.4,-3.6,1,7);c.fillRect(-2.4,-.4,4.8,.9);c.restore();
    c.save();c.font='700 5px Arial';c.textAlign='center';c.fillStyle='#0b1022';c.fillText('POLICE',(mid.x+d1.x)/2,(d0.y+d1.y)/2+2);c.restore();}
  {const w0=q(108,60),w1=q(192,73),wb=q(196,60);c.fillStyle=lin(c,0,w1.y,0,w0.y,[[0,'#2a3448'],[1,'#080a12']]);c.beginPath();c.moveTo(w0.x,w0.y);c.lineTo(q(110,72).x,w1.y);c.lineTo(w1.x,w1.y);c.lineTo(wb.x+8,wb.y);c.closePath();c.fill();
    c.strokeStyle='#05060a';c.lineWidth=1.4;const pm=q(156,60),pt=q(156,73);c.beginPath();c.moveTo(pm.x,pm.y);c.lineTo(pt.x,pt.y);c.stroke();
    c.save();c.globalCompositeOperation='lighter';c.fillStyle=rgba('#cfe0ff',.12);c.beginPath();c.moveTo(pt.x-20,pt.y);c.lineTo(pt.x-12,pt.y);c.lineTo(pm.x-22,pm.y);c.lineTo(pm.x-30,pm.y);c.closePath();c.fill();c.restore();}
  // wheels under the arches, the chrome bumper, the lamps
  for(const wx of [52,238]){const w=q(wx,14);c.fillStyle='#030305';c.beginPath();c.arc(w.x,w.y,15,0,TAU);c.fill();c.fillStyle=lin(c,w.x-8,w.y-8,w.x+8,w.y+8,[[0,'#3a3e48'],[.5,'#9aa2b2'],[1,'#2a2e36']]);c.beginPath();c.arc(w.x,w.y,7,0,TAU);c.fill();
    c.fillStyle='#0a0b10';c.beginPath();c.arc(w.x,w.y,2.4,0,TAU);c.fill();}
  {const a=q(286,26),b=q(302,30);c.fillStyle=lin(c,0,b.y,0,a.y,[[0,'#e8ecf2'],[1,'#5a606c']]);c.fillRect(a.x-2,b.y,b.x-a.x+4,4);
    c.fillStyle='#fff6e0';c.fillRect(q(294,38).x-2,q(294,38).y-2,4,3.4);glow(c,q(296,37).x,q(296,37).y,24,'#fff0cc',.5);
    c.fillStyle='#a8282c';c.fillRect(q(2,34).x-1,q(2,34).y-2,3,3);}
  // the lightbar's housing; its lamps turn in live()
  {const l0=q(130,76),l1=q(170,82);c.fillStyle='#0c0d12';c.fillRect(l0.x,l1.y,l1.x-l0.x,l0.y-l1.y);}
  // the floods catch its roof and its back
  c.strokeStyle=rgba('#cfe0ff',.35);c.lineWidth=.8;c.beginPath();[[104,74],[192,76],[222,52],[284,46],[298,36]].forEach((p,i)=>{const s=q(p[0],p[1]);i?c.lineTo(s.x,s.y):c.moveTo(s.x,s.y);});c.stroke();}
// ---------- the floor ----------
function road(c,X0,X1){
  const rv=[gq(X0,196),gq(X1,196),gq(X1,-110),gq(X0,-110)];
  c.save();poly(c,rv);c.clip();c.save();c.transform(1,0,PSX,-PSY,0,GB);
  c.fillStyle=patAt(c,asphalt(31,{U:64,sc:4}),0,0,1/4);c.fillRect(X0-60,-120,X1-X0+160,330);
  // patched strips where the road has been dug and filled, darker
  {const r=rng(14);for(let i=0;i<5;i++){const x=X0+r()*(X1-X0),d=-60+r()*230,w=40+r()*120,h=10+r()*26;c.fillStyle=rgba('#07080b',.28);c.fillRect(x,d,w,h);c.strokeStyle=rgba('#000000',.25);c.lineWidth=.8;c.strokeRect(x,d,w,h);}}
  // the lane paint, worn: a broken line down the middle, solid edge lines, the stop line before the checkpoint
  {const paint=(x0,x1,d,wd,col,dash)=>{c.fillStyle=col;if(!dash){c.fillRect(x0,d-wd/2,x1-x0,wd);return;}for(let x=x0;x<x1;x+=dash[0]+dash[1])c.fillRect(x,d-wd/2,dash[0],wd);};
    paint(X0,X1,92,3.2,rgba('#e8e4d8',.34),[38,30]);paint(X0,X1,186,2.6,rgba('#d8b040',.3));paint(X0,X1,2,2.6,rgba('#e8e4d8',.22));
    c.fillStyle=rgba('#e8e4d8',.32);c.fillRect(SPIKE.x-42,-110,7,306);
    // the paint is broken up where the traffic wears it
    const r=rng(4);c.fillStyle=rgba('#14161c',.7);for(let i=0;i<260;i++){const x=X0+r()*(X1-X0),d=[92,186,2][i%3]+(r()-.5)*4;c.fillRect(x,d-1,1+r()*4,2+r()*1.6);}}
  // tyre marks: the carrier's, braking in on the right, and old ones down the lanes
  {const r=rng(22);c.lineCap='round';for(let i=0;i<9;i++){const x0=560+r()*240,d0=40+r()*120,len=60+r()*180,cv=(r()-.5)*30;
      c.strokeStyle=rgba('#050507',.32+r()*.2);c.lineWidth=3+r()*2.4;c.beginPath();c.moveTo(x0,d0);c.quadraticCurveTo(x0+len*.5,d0+cv,x0+len,d0+cv*.4);c.stroke();}
    for(let i=0;i<6;i++){const d0=20+r()*160;c.strokeStyle=rgba('#050507',.14);c.lineWidth=2.6;c.beginPath();c.moveTo(X0,d0);c.lineTo(X1,d0+(r()-.5)*8);c.stroke();}}
  // oil under where the carrier stands and spilt by the cruiser: dark, with a film of colour at the edge
  {const r=rng(9);for(const [x,d,s] of [[700,96,1.4],[760,128,1],[640,70,.8],[262,184,.7],[120,40,.6]]){c.fillStyle=rgba('#030304',.55);c.beginPath();c.ellipse(x,d,26*s,12*s,r()*.6,0,TAU);c.fill();
    c.strokeStyle=rgba('#7a5aa8',.12);c.lineWidth=1.2;c.beginPath();c.ellipse(x+2,d+1,24*s,10.5*s,0,0,TAU);c.stroke();c.strokeStyle=rgba('#4ab0a0',.08);c.beginPath();c.ellipse(x-1,d-1,22*s,9.5*s,0,0,TAU);c.stroke();}}
  // the spike strip across the road: a hinged strip of steel teeth, from the far kerb to the near side
  {c.fillStyle='#0b0c10';c.fillRect(SPIKE.x-5,-110,10,306);c.fillStyle=rgba('#9aa4b8',.5);for(let d=-108;d<196;d+=5){c.beginPath();c.moveTo(SPIKE.x-3,d);c.lineTo(SPIKE.x,d+2.4);c.lineTo(SPIKE.x+3,d);c.closePath();c.fill();}
    c.fillStyle=rgba('#000000',.5);for(let d=-110;d<196;d+=22)c.fillRect(SPIKE.x-5.4,d,10.8,.8);}
  // the manhole: a cast iron lid in its frame, its pattern, the wet ring round it
  {const h=HOLE;c.fillStyle='#08080a';c.beginPath();c.ellipse(h.x,h.d,15,11,0,0,TAU);c.fill();c.fillStyle=lin(c,h.x-12,h.d-12,h.x+12,h.d+12,[[0,'#2a2c32'],[.5,'#3a3c44'],[1,'#1c1d22']]);c.beginPath();c.ellipse(h.x,h.d,12.4,9.2,0,0,TAU);c.fill();
    c.strokeStyle=rgba('#000000',.6);c.lineWidth=.7;c.beginPath();for(let k=-3;k<=3;k++){c.moveTo(h.x+k*3.2,h.d-8.6+Math.abs(k)*.4);c.lineTo(h.x+k*3.2,h.d+8.6-Math.abs(k)*.4);}c.stroke();
    c.strokeStyle=rgba('#b8c4dc',.16);c.beginPath();c.ellipse(h.x,h.d,12.4,9.2,0,Math.PI*.9,Math.PI*1.7);c.stroke();}
  c.restore();
  // the wet: everything lit is mirrored in the road, the floods longest, and the puddles hold the colours
  const yK=gq(0,196).y+2;
  {const L=mastLamp();wetStreak(c,L.x-16,yK,GB+60,44,'#dce8ff',.5,7);wetStreak(c,L.x+20,yK,GB+50,30,'#dce8ff',.32,11);}
  {const T=triLamp();wetStreak(c,T.x-10,T.y+10,GB+40,26,'#dce8ff',.36,13);}
  for(const Lp of LAMPS){const L=lampHead(Lp);wetStreak(c,L.x,L.y+60,GB+50,22,'#ffb860',.3,Lp.x+3);}
  {const cr=pp(CRUISER.x,GB-80,CRUISER.d);wetStreak(c,cr.x-14,yK,GB+20,16,'#ffb030',.16,21);wetStreak(c,cr.x+14,yK,GB+20,16,'#5a8cff',.16,23);}
  wetStreak(c,TOWER.x+6,yK,GB+40,40,'#7ff3e3',.08,29);
  // puddles: dark mirrors, the sky and the lights in them
  {const r=rng(41);for(const [x,d,w] of [[120,30,34],[330,128,40],[520,150,26],[44,150,28],[690,40,46],[840,150,36],[400,-40,50],[200,-70,60]]){const q=gq(x,d);
    c.fillStyle=rgba('#05060c',.32);c.beginPath();c.ellipse(q.x,q.y,w,w*.17,0,0,TAU);c.fill();
    c.save();c.beginPath();c.ellipse(q.x,q.y,w,w*.17,0,0,TAU);c.clip();c.globalCompositeOperation='lighter';
      c.fillStyle=lin(c,q.x-w,0,q.x+w,0,[[0,rgba('#ff9a5a',.05)],[.5,rgba('#cfe0ff',.12)],[1,rgba('#7ff3e3',.06)]]);c.fillRect(q.x-w,q.y-w*.2,w*2,w*.4);
      c.fillStyle=rgba('#ffffff',.1);c.fillRect(q.x-w*.6+r()*w*.4,q.y-1,w*.5,1.2);c.restore();
    c.strokeStyle=rgba('#cfe0ff',.14);c.lineWidth=.6;c.beginPath();c.ellipse(q.x,q.y,w,w*.17,0,Math.PI*1.05,Math.PI*1.95);c.stroke();}}
  c.restore();
  // the light on the road: the cold pool of the floods across the checkpoint and down the lanes, the sodium lamps' warm pools behind
  c.save();c.globalCompositeOperation='lighter';
  {const L=mastLamp(),p=gq(MAST.x-120,110);c.save();c.translate(p.x,p.y);c.scale(1,.32);c.fillStyle=rad(c,0,0,0,520,[[0,rgba('#c8dcff',.16)],[.45,rgba('#c8dcff',.06)],[1,rgba('#c8dcff',0)]]);c.beginPath();c.arc(0,0,520,0,TAU);c.fill();c.restore();void L;}
  for(const Lp of LAMPS){const p=gq(Lp.x+44,84);c.save();c.translate(p.x,p.y);c.scale(1,.34);c.fillStyle=rad(c,0,0,0,180,[[0,rgba('#ffb060',.14)],[1,rgba('#ffb060',0)]]);c.beginPath();c.arc(0,0,180,0,TAU);c.fill();c.restore();}
  c.restore();}
// the far pavement and its kerb
function pavement(c,X0,X1){const g=g0(),pv=[pp(X0,g,DF),pp(X1,g,DF),pp(X1,g,200),pp(X0,g,200)];
  // concrete slabs, wet: the asphalt's grain lightened, the joints between the slabs, a few cracked
  c.save();poly(c,pv);c.clip();c.transform(1,0,PSX,-PSY,0,g);c.fillStyle=patAt(c,asphalt(31,{U:64,sc:4}),0,0,1/4);c.fillRect(X0,200,X1-X0,DF-200);
  c.fillStyle=rgba('#6a6870',.22);c.fillRect(X0,200,X1-X0,DF-200);
  const r=rng(12);c.strokeStyle=rgba('#000000',.5);c.lineWidth=.7;c.beginPath();for(let x=X0;x<X1;x+=28+r()*4){c.moveTo(x,200);c.lineTo(x,DF);}c.moveTo(X0,220);c.lineTo(X1,220);c.stroke();
  c.strokeStyle=rgba('#cfe0ff',.06);c.beginPath();for(let x=X0+1;x<X1;x+=30){c.moveTo(x,200);c.lineTo(x,DF);}c.stroke();c.restore();
  c.fillStyle=rgba('#05050a',.5);poly(c,pv);c.fill();
  // the kerb's face, granite, the floods along its edge
  const a=pp(X0,g,200),b=pp(X1,g,200),e=gq(X1,196),f=gq(X0,196);c.save();poly(c,[a,b,e,f]);c.clip();
  c.fillStyle=patAt(c,EnvTex.granite(77,128,64,{base:'#5a565e'}),0,a.y,.25);c.fillRect(X0-40,a.y,X1-X0+80,f.y-a.y+2);
  c.fillStyle=lin(c,0,a.y,0,f.y,[[0,rgba('#05040a',.25)],[1,rgba('#05040a',.82)]]);c.fillRect(X0-40,a.y,X1-X0+80,f.y-a.y+2);c.restore();
  line(c,[a,b],rgba('#cfe0ff',.32),1);}
// ---------- the scene ----------
function paint(c){
  const X0=-160,X1=W+240,T0=-110,base=fy(DF);
  sky(c,X0,X1,T0,base);
  // the far city round the tower, low in its haze
  skyline(c,X0,X1,base-30,{seed:41,far:.92,h0:40,h1:120,w0:16,w1:30,col:'#0f111c',hazeCol:'#1e1a2a',hazeH:90,hazeA:.45,dens:.5});
  nearTower(c);
  // the blocks across the street: towers in black stone and glass, shuttered at street level
  const B=[{x0:-160,x1:-20,top:96,glass:true,seed:3,lit:.22,shops:[[-156,-92,'DELI'],[-88,-24,'LOANS']]},
    {x0:-20,x1:150,top:150,seed:5,lit:.2,cap:20,shops:[[-16,66,'PHARMACY'],[70,146,'SHOE REPAIR']]},
    {x0:150,x1:330,top:72,glass:true,seed:7,lit:.26,shops:[[154,240,'DINER'],[244,326,'NEWS']]},
    {x0:330,x1:520,top:168,seed:11,lit:.2,cap:14,mast:34,shops:[[334,426,'TAILOR'],[430,516,'BANK']]},
    {x0:520,x1:564,top:206,seed:13,lit:.16,shops:[[522,562,null]]},
    {x0:736,x1:790,top:212,seed:17,lit:.16,shops:[[738,788,null]]},
    {x0:790,x1:960,top:118,glass:true,seed:19,lit:.24,shops:[[794,876,'JEWELLER'],[880,956,'TICKETS']]},
    {x0:960,x1:1140,top:150,seed:23,lit:.22,cap:20,shops:[[964,1050,'CAFE'],[1054,1136,'TOBACCO']]}];
  // the tower's foot between the blocks: a plaza behind a gilt fence, its doors lit
  {const x0=564,x1=736,gTop=base-46;c.fillStyle='#0b0b11';c.fillRect(x0,gTop-30,x1-x0,base-gTop+30);
    for(let k=0;k<6;k++){const dx=x0+16+k*25;windowPane(c,dx,gTop-14,13,base-gTop+12,.72,{mull:1,fw:.8,spill:false});}
    glow(c,(x0+x1)/2,base-10,90,'#ffcf86',.25,.35);c.strokeStyle='#07070b';c.lineWidth=1;c.beginPath();for(let x=x0;x<=x1;x+=4){c.moveTo(x,base);c.lineTo(x,base-14);}c.moveTo(x0,base-12);c.lineTo(x1,base-12);c.stroke();
    c.fillStyle=C.gold;for(let x=x0;x<=x1;x+=8){c.beginPath();c.moveTo(x-1,base-14);c.lineTo(x,base-17);c.lineTo(x+1,base-14);c.fill();}}
  for(const b of B)block(c,b,base);
  // the haze in the street's far end, cold where the floods reach it
  haze(c,X0,X1,base-90,base+6,'#2a2c40',.32);
  pavement(c,X0,X1);
  for(const px of POLES)pole(c,px,LAMPS.some(L=>L.x===px));
  lightTower(c);
  road(c,X0,X1);
  // the things on the far lane, far to near
  msgBoard(c);cruiser(c);
  for(const k of CONES)if(k.d>0)cone(c,k);
  sawhorse(c,{...BARR[1],col:'b'});tripod(c);sawhorse(c,{...BARR[0],col:'a'});
  // the trolley wires over the road, sagging between the arms, the floods catching them
  {const wy=d=>g0()-196-d*PSY;for(const [d,a] of [[82,.85],[96,.6]]){const pts=POLES.map(px=>pp(px+44,g0()-196,204-122+(d-82)));
      c.strokeStyle=rgba('#040406',a);c.lineWidth=.8;c.beginPath();c.moveTo(X0,pts[0].y+6);for(let i=0;i<pts.length;i++){const p=pts[i];if(i)c.quadraticCurveTo((pts[i-1].x+p.x)/2,(pts[i-1].y+p.y)/2+6,p.x,p.y);else c.lineTo(p.x,p.y);}c.lineTo(X1,pts[pts.length-1].y+6);c.stroke();
      c.strokeStyle=rgba('#cfe0ff',.14*a);c.lineWidth=.4;c.stroke();void wy;}}
  // the floods' light: the cone down the avenue from the mast, and from the tripod; the glare of the lamp faces
  {const L=mastLamp(),o={x:L.x-14,y:L.y-4};c.save();c.globalCompositeOperation='lighter';
    // the mast's cone falls down the avenue onto the road, a little of it caught in the drizzle on the way
    for(const [a,b,al] of [[gq(-40,10),gq(560,190),.05],[gq(120,50),gq(480,160),.05]]){const m={x:(a.x+b.x)/2,y:(a.y+b.y)/2},gr=c.createLinearGradient(o.x,o.y,m.x,m.y);
      gr.addColorStop(0,rgba('#e6efff',al*2));gr.addColorStop(.55,rgba('#c8dcff',al));gr.addColorStop(1,rgba('#c8dcff',al*.25));c.fillStyle=gr;
      c.beginPath();c.moveTo(o.x,o.y-4);c.lineTo(o.x,o.y+4);c.lineTo(a.x,a.y);c.lineTo(b.x,b.y);c.closePath();c.fill();}
    // and the tripod's, low and flat along the far lane
    {const T=triLamp(),h={x:T.x-12,y:T.y-TRI.h},a=gq(TRI.x-420,110),b=gq(TRI.x-300,196),gr=c.createLinearGradient(h.x,h.y,(a.x+b.x)/2,(a.y+b.y)/2);
      gr.addColorStop(0,rgba('#e6efff',.14));gr.addColorStop(1,rgba('#c8dcff',0));c.fillStyle=gr;c.beginPath();c.moveTo(h.x,h.y-4);c.lineTo(h.x,h.y+5);c.lineTo(a.x,a.y);c.lineTo(b.x,b.y-30);c.closePath();c.fill();}
    c.restore();glow(c,o.x,o.y,90,'#dce8ff',.5);glow(c,o.x,o.y,22,'#ffffff',.9);
    const T=triLamp();glow(c,T.x-12,T.y-TRI.h,56,'#dce8ff',.6);glow(c,T.x-12,T.y-TRI.h,12,'#ffffff',.9);}
  for(const Lp of LAMPS){const L=lampHead(Lp);glow(c,L.x,L.y+2,48,'#ffb050',.45);glow(c,L.x,L.y+2,10,'#fff0c8',.8);beam(c,L.x,L.y+3,10,90,120,'#ffb860',.06);}
  // the near lane: sawhorses and cones toward us, left of where the carrier stands
  sawhorse(c,{...BARR[2],col:'a'});for(const k of CONES)if(k.d<0)cone(c,k);sawhorse(c,{...BARR[3],col:'b'});
  // the dark toward us
  c.fillStyle=lin(c,0,GB-20,0,GB+110,[[0,rgba('#000000',0)],[1,rgba('#000000',.55)]]);c.fillRect(X0,GB-20,X1-X0,130);}
// ---------- what moves: the searchlights, the flashers and the lightbar, the board, the steam, the drizzle ----------
const STEAM=(()=>{const r=rng(5),a=[];for(let i=0;i<14;i++)a.push({ph:r(),dx:(r()-.5)*8,sp:.18+r()*.14,w:5+r()*6});return a;})();
const RAIN=(()=>{const r=rng(8),a=[];for(let i=0;i<70;i++)a.push({x:r()*1100-100,y:r()*560-40,sp:280+r()*160,l:5+r()*5,a:.06+r()*.1});return a;})();
function live(){const t=S.t;ctx.save();ctx.globalCompositeOperation='lighter';
  // the searchlights out of the crown, two pale arms sweeping the cloud
  {const cw=TOWER.w*.62,oy=TOWER.top-8;for(const [sd,ph,sp,col] of [[-1,0,.23,'#e4ecff'],[1,2.1,.17,'#cfeeff']]){const ox=TOWER.x+sd*cw*.47,a=-Math.PI/2+sd*.42+Math.sin(t*sp+ph)*.5,len=700,ex=ox+Math.cos(a)*len,ey=oy+Math.sin(a)*len,nx=-Math.sin(a),ny=Math.cos(a);
    const g=ctx.createLinearGradient(ox,oy,ex,ey);g.addColorStop(0,rgba(col,.36));g.addColorStop(.35,rgba(col,.12));g.addColorStop(1,rgba(col,0));ctx.fillStyle=g;
    ctx.beginPath();ctx.moveTo(ox+nx*2.4,oy+ny*2.4);ctx.lineTo(ex+nx*54,ey+ny*54);ctx.lineTo(ex-nx*54,ey-ny*54);ctx.lineTo(ox-nx*2.4,oy-ny*2.4);ctx.closePath();ctx.fill();
    glow(ctx,ox,oy,14,'#f4f8ff',.6);}}
  // the flashers on the sawhorses, amber and blue by turns
  for(let i=0;i<BARR.length;i++){const s=BARR[i],d=s.d,h=38,L=s.w/2,q=pp(s.x+L*.55,GB-h,d),blue=i%2===1,on=Math.pow(Math.max(0,Math.sin(t*(blue?5.2:4.6)+i*1.7)),6);
    if(on<.02)continue;const col=blue?'#5a8cff':'#ffb030',y=q.y-(d<0?9:7)-2.2;glow(ctx,q.x,y,d<0?30:22,col,.75*on);ctx.fillStyle=rgba('#ffffff',.85*on);ctx.fillRect(q.x-1.6,y-1,3.2,2);}
  // the cruiser's lightbar turning, its colour washing the road and the shutters behind it
  {const d=CRUISER.d,x0=CRUISER.x-CRUISER.len/2,a=pp(x0+136,GB-80,d),b=pp(x0+164,GB-80,d),ph=t*7;
    const on1=Math.max(0,Math.sin(ph)),on2=Math.max(0,Math.sin(ph+Math.PI));glow(ctx,a.x,a.y,26,'#ffb030',.8*on1);glow(ctx,b.x,b.y,26,'#5a8cff',.9*on2);
    ctx.fillStyle=rgba('#fff2d0',on1);ctx.fillRect(a.x-4,a.y-1.6,8,2.6);ctx.fillStyle=rgba('#dfe8ff',on2);ctx.fillRect(b.x-4,b.y-1.6,8,2.6);
    glow(ctx,(a.x+b.x)/2,a.y-10,180,on1>on2?'#ffb030':'#5a8cff',.05*Math.max(on1,on2),.6);}
  // the message board: CHECKPOINT AHEAD in amber dots, then STOP and arrows, by turns
  {const d=BOARD.d,p0=pp(BOARD.x-30,GB-112,d),p1=pp(BOARD.x+30,GB-78,d),ph=Math.floor(t/1.6)%2,w=p1.x-p0.x,h=p1.y-p0.y;ctx.save();ctx.beginPath();ctx.rect(p0.x+2,p0.y+2,w-4,h-4);ctx.clip();
    ctx.fillStyle=rgba('#ffb030',.78);ctx.textAlign='center';const fit=(txt,y,sz)=>{ctx.font=`700 ${sz}px Arial`;const k=Math.min(1,(w-8)/ctx.measureText(txt).width);ctx.save();ctx.translate(p0.x+w/2,y);ctx.scale(k,1);ctx.fillText(txt,0,0);ctx.restore();};
    if(ph===0){fit('CHECKPOINT',p0.y+h*.44,h*.3);fit('AHEAD',p0.y+h*.84,h*.3);}else{fit('STOP',p0.y+h*.44,h*.32);fit('◀ ◀ ◀',p0.y+h*.86,h*.28);}
    // the dots: a dark grid laid over the letters
    ctx.globalCompositeOperation='source-over';ctx.fillStyle='rgba(5,5,7,.55)';for(let x=p0.x;x<p1.x;x+=1.6)ctx.fillRect(x,p0.y,.55,h);for(let y=p0.y;y<p1.y;y+=1.6)ctx.fillRect(p0.x,y,w,.55);
    ctx.restore();glow(ctx,p0.x+w/2,p0.y+h/2,w*.7,'#ffb030',.07);}
  ctx.globalCompositeOperation='source-over';
  // steam out of the manhole, rising and leaning with the air
  {const q=gq(HOLE.x,HOLE.d);for(const s of STEAM){const u=(t*s.sp+s.ph)%1,y=q.y-u*90,x=q.x+s.dx+Math.sin(t*.9+s.ph*6)*6*u+u*18,r=s.w*(1+u*2.4),a=.11*(1-u)*Math.min(1,u*6);
    ctx.fillStyle=rad(ctx,x,y,0,r,[[0,rgba('#c8d0e0',a)],[1,rgba('#c8d0e0',0)]]);ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();}}
  // the drizzle, catching the floods
  {ctx.strokeStyle='#dfe8ff';ctx.lineWidth=.5;ctx.beginPath();for(const p of RAIN){const y=((p.y+t*p.sp)%560+560)%560-40,x=p.x-y*.06;ctx.moveTo(x,y);ctx.lineTo(x-p.l*.12,y+p.l);}ctx.globalAlpha=.16;ctx.stroke();ctx.globalAlpha=1;}
  // the red light on the tower's needle
  {const x=TOWER.x,y=TOWER.top-75,on=Math.pow(Math.max(0,Math.sin(t*2.4)),8);if(on>.02){glow(ctx,x,y,10,'#ff3a2a',.8*on);ctx.fillStyle=rgba('#ffd0c0',on);ctx.fillRect(x-.7,y-.7,1.4,1.4);}}
  ctx.restore();}
// the light that rims a fighter: the floods on the light tower, high on the right
function light(f){const L=mastLamp(),d=f.dep||0;return{light:{x:L.x-14-d*PSX,y:L.y-4+d*PSY}};}
E.S.roadblock={paint,live,light,mast:MAST,div:it=>it.dv&&it.dv.mat==='plank'&&typeof EnvProps!=='undefined'?EnvProps.plankFence(it,'town'):false,table:()=>typeof EnvProps!=='undefined'?EnvProps.fieldTable('town'):false};
})();
// ===== ENV ROADBLOCK END =====
