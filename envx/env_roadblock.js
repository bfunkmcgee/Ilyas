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
(()=>{const E=EnvLook,{C,pp,poly,line,rect,lin,rad,rgba,mix,glow,beam,softCone,haze,gilt,windowPane,wetStreak,stars,cloudBank,skyline,rng,lerp,clamp,TAU}=E;
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
    c.strokeStyle=rgba(C.cyanL,.7);c.lineWidth=.99;c.beginPath();c.ellipse(x,cy-13,cw*.46,cw*.1,0,Math.PI*.1,Math.PI*.9);c.stroke();
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
  if(r()<.5){c.save();c.globalAlpha=.35;c.strokeStyle=r()<.5?'#8a2a3a':'#2a6a6a';c.lineWidth=1.46;c.lineCap='round';const tx=x0+6+r()*(w-30),ty=sy+8+r()*10;c.beginPath();
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
  c.lineWidth=1.48;c.beginPath();c.moveTo(top.x,top.y);c.lineTo(arm.x,arm.y-.5);c.stroke();
  c.fillStyle='#1a1a22';c.fillRect(arm.x-1.4,arm.y,2.8,3);
  if(withLamp){const L=lampHead({x:px,d});c.fillStyle='#0a0a0e';c.beginPath();c.moveTo(L.x-7,L.y-1.4);c.quadraticCurveTo(L.x,L.y-5,L.x+8,L.y-1);c.lineTo(L.x+6,L.y+1.6);c.lineTo(L.x-6,L.y+1.6);c.closePath();c.fill();
    c.fillStyle=lin(c,0,L.y+.6,0,L.y+3,[[0,'#fff2c8'],[1,'#ffb050']]);c.fillRect(L.x-5,L.y+.8,10,2);}}
// the light tower on its trailer: a mast, a bank of four lamps aimed down the road at whoever comes, the generator
function lightTower(c){const d=MAST.d,base=g0(),q=x=>pp(x,base,d),b0=q(MAST.x-26),b1=q(MAST.x+30);
  c.fillStyle='#0b0b10';c.fillRect(b0.x,b0.y-18,b1.x-b0.x,14);c.fillStyle=rgba('#ffcf86',.25);c.fillRect(b0.x,b0.y-18,b1.x-b0.x,.8);
  c.fillStyle='#050508';for(const xx of [b0.x+8,b1.x-8]){c.beginPath();c.arc(xx,b0.y-4,4.2,0,TAU);c.fill();}
  c.fillStyle=rgba('#d8a64e',.6);c.fillRect(b0.x+4,b0.y-14,8,3);c.fillStyle=rgba('#c8d2e8',.3);c.font='700 4px "Alegreya SC", Georgia, serif';c.fillText('POLICE',b0.x+16,b0.y-10);
  const m0=q(MAST.x),m1=pp(MAST.x,base-MAST.h+6,d);c.strokeStyle='#08080c';c.lineWidth=3;c.beginPath();c.moveTo(m0.x,m0.y-18);c.lineTo(m1.x,m1.y);c.stroke();
  c.strokeStyle=rgba('#cfe0ff',.2);c.lineWidth=.99;c.beginPath();c.moveTo(m0.x+1.3,m0.y-18);c.lineTo(m1.x+1.3,m1.y);c.stroke();
  // the outriggers and the cable
  c.strokeStyle='#06060a';c.lineWidth=1.51;c.beginPath();c.moveTo(b0.x+4,b0.y-6);c.lineTo(b0.x-12,b0.y+1);c.moveTo(b1.x-4,b1.y-6);c.lineTo(b1.x+12,b1.y+1);c.stroke();
  // the lamp bank: four heads on a cross bar, their faces turned to the left and down the avenue, burning white
  const L=mastLamp();c.fillStyle='#08080c';c.fillRect(L.x-18,L.y-1,36,3);
  for(const [dx,dy] of [[-13,-6],[-4,-6],[5,-6],[14,-6]]){const hx=L.x+dx,hy=L.y+dy;c.fillStyle='#0c0c12';c.beginPath();c.moveTo(hx-4,hy-4);c.lineTo(hx+3,hy-5);c.lineTo(hx+4,hy+4);c.lineTo(hx-4,hy+4);c.closePath();c.fill();
    c.fillStyle=lin(c,hx-4,0,hx,0,[[0,'#ffffff'],[1,'#c8dcff']]);c.fillRect(hx-4.6,hy-3.4,1.8,6.8);}}
// a floodlight on a tripod in the far lane, turned down the road
function tripod(c){const d=TRI.d,b=gq(TRI.x,d),hd=gq(TRI.x,d);hd.y-=TRI.h;
  c.strokeStyle='#07070b';c.lineWidth=1.6;c.lineCap='round';c.beginPath();for(const [dx,dd] of [[-16,6],[14,8],[2,-10]]){const f=gq(TRI.x+dx,d+dd);c.moveTo(hd.x,hd.y+16);c.lineTo(f.x,f.y);}c.stroke();
  c.lineWidth=2.4;c.beginPath();c.moveTo(hd.x,hd.y+18);c.lineTo(hd.x,hd.y+4);c.stroke();
  // the lamp head: a deep box with its yoke, the face turned down the road, burning white behind its grille
  c.strokeStyle='#08080c';c.lineWidth=1.48;c.beginPath();c.moveTo(hd.x-3,hd.y+10);c.lineTo(hd.x-9,hd.y);c.moveTo(hd.x+3,hd.y+10);c.lineTo(hd.x+9,hd.y);c.stroke();
  c.fillStyle='#0b0b11';c.beginPath();c.moveTo(hd.x-12,hd.y-9);c.lineTo(hd.x+9,hd.y-11);c.lineTo(hd.x+11,hd.y+7);c.lineTo(hd.x-12,hd.y+8);c.closePath();c.fill();
  c.fillStyle=rgba('#cfe0ff',.3);c.fillRect(hd.x-11,hd.y-9.6,19,.8);
  c.fillStyle=lin(c,hd.x-14,0,hd.x-9,0,[[0,'#ffffff'],[1,'#c4d8ff']]);c.fillRect(hd.x-14,hd.y-8,3.4,15);
  c.strokeStyle=rgba('#0b0b11',.6);c.lineWidth=1.5;c.beginPath();for(let k=0;k<4;k++){c.moveTo(hd.x-14,hd.y-6+k*4);c.lineTo(hd.x-10.6,hd.y-6+k*4);}c.stroke();
  c.strokeStyle='#050508';c.lineWidth=1.48;c.beginPath();c.moveTo(hd.x+2,hd.y+5);c.quadraticCurveTo(hd.x+16,b.y-6,hd.x+30,b.y+2);c.stroke();}
// a police sawhorse: two splayed legs each end, a board striped white and police blue, POLICE LINE on it, a flasher on top
function sawhorse(c,s,o){const d=s.d,h=s.h||38,L=s.w/2,q=(x,y)=>pp(x,GB-y,d),near=d<0;
  c.strokeStyle='#08080c';c.lineWidth=near?2.4:1.6;c.lineCap='round';c.beginPath();
  for(const ex of [s.x-L+6,s.x+L-6])for(const sp of [-1,1]){const a=q(ex,h-6),f=pp(ex+sp*7,GB,d+sp*5);c.moveTo(a.x,a.y);c.lineTo(f.x,f.y);}c.stroke();
  const b0=q(s.x-L,h),b1=q(s.x+L,h),bh=near?9:7;c.save();c.beginPath();c.rect(b0.x,b0.y-bh,b1.x-b0.x,bh);c.clip();
  c.fillStyle='#e8ecf2';c.fillRect(b0.x,b0.y-bh,b1.x-b0.x,bh);c.fillStyle='#1b2a4e';for(let x=b0.x-bh;x<b1.x+bh;x+=bh*1.4){c.beginPath();c.moveTo(x,b0.y);c.lineTo(x+bh*.7,b0.y);c.lineTo(x+bh*1.4,b0.y-bh);c.lineTo(x+bh*.7,b0.y-bh);c.closePath();c.fill();}
  c.fillStyle=rgba('#000000',.32);c.fillRect(b0.x,b0.y-bh,b1.x-b0.x,bh);c.restore();
  // the lettering band under the stripes
  const lb=q(s.x-L,h-9);c.fillStyle='#0d1424';c.fillRect(lb.x,lb.y-5,b1.x-b0.x,5);c.save();c.font=`700 ${near?4.6:3.6}px "Alegreya SC", Georgia, serif`;c.textAlign='center';c.fillStyle=rgba('#e8ecf2',.75);c.fillText('POLICE LINE   DO NOT CROSS',(b0.x+b1.x)/2,lb.y-1.2);c.restore();
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
  c.fillStyle='#050507';c.fillRect(p0.x,p0.y,p1.x-p0.x,p1.y-p0.y);c.strokeStyle='#1a1a22';c.lineWidth=1.48;c.strokeRect(p0.x,p0.y,p1.x-p0.x,p1.y-p0.y);
  c.fillStyle=rgba('#ffb030',.14);for(let y=p0.y+3;y<p1.y-2;y+=2.2)for(let x=p0.x+3;x<p1.x-2;x+=2.2)c.fillRect(x,y,1,1);}
// the cruiser at the back, facing the checkpoint (since V112, asked for: drawn in detail, by the drawing guide's eight steps). A
// full-size police sedan, long in the hood and the deck, in the city police's black-navy (the carrier's) with white doors and POLICE
// across them, Hallowell's gold H on the rear quarter and a gold line along the crease. It is drawn in its own frame: x from the tail
// (0) to the nose (300), y up from the road. Its lacquer takes the light as the guide's polished things do: the street mirrored soft in
// the flank, dark under the shoulder's crease and lighter over it, the tripod's flood bright along its top toward the nose, the sodium
// lamp overhead warm on the roof. The glass is dark and holds the street; through it the headrests, the cage and the terminal's screen.
// It stands on its tyres in their wells with a contact shadow, wet: beads along its top, runs down the doors, spray behind the wheels,
// its lamps mirrored in the road. The lightbar's lamps, the push bar's, the exhaust and the fire's light on its nose are live.
const CR={RW:58,FW:246,WR:15,AR:19.5,belt:54.2};
const crP=(x,y)=>pp(CRUISER.x-CRUISER.len/2+x,GB-y,CRUISER.d);
// the top line, tail to nose: the trunk's edge, the deck, the rear glass, the roof, the windshield, the hood
function crTop(c){c.lineTo(9.5,46.2);c.quadraticCurveTo(50,49.6,88,50.6);c.quadraticCurveTo(99,61,111.5,72.6);c.quadraticCurveTo(116,76.6,127,77);
  c.quadraticCurveTo(160,78.3,190,76.7);c.quadraticCurveTo(196.5,76.2,199.5,73.6);c.lineTo(226.5,54.6);c.quadraticCurveTo(229.5,52.9,237,52.7);
  c.quadraticCurveTo(270,51.9,290,47.9);c.quadraticCurveTo(297,46.1,298.6,42);}
const crTopY=x=>x<88?46.2+(x-9.5)/78.5*4.4:x<127?50.6+(x-88)/39*26.4:x<190?77.6:x<237?76.7-(x-190)/47*24:52.7-(x-237)/53*4.8;
// the body's outline, the wheel arches cut out of it
function crBody(c){const {RW,FW,AR}=CR,a=.05;c.beginPath();c.moveTo(2,16);c.lineTo(0,20);c.lineTo(0,32);c.quadraticCurveTo(0,35.5,2.2,36.4);c.lineTo(4.2,40.5);
  c.quadraticCurveTo(5.2,45.4,9.5,46.2);crTop(c);c.lineTo(300.6,36.2);c.lineTo(302,33.4);c.lineTo(302.6,22.4);c.quadraticCurveTo(302.6,17.2,298,16);
  c.lineTo(FW+AR,16);c.arc(FW,15,AR,a,Math.PI-a);c.lineTo(FW-AR-1.5,13.6);c.lineTo(RW+AR+1.5,13.6);c.lineTo(RW+AR,16);c.arc(RW,15,AR,a,Math.PI-a);c.closePath();}
// the side glass inside its pillars
function crGlass(c){c.beginPath();c.moveTo(104,54.2);c.lineTo(114,68.6);c.quadraticCurveTo(117.6,73.4,127,73.7);c.lineTo(189.5,73.5);c.quadraticCurveTo(194,73.3,195.6,71.6);c.lineTo(220.2,54.2);c.closePath();}
// the white doors: the rear door's shut line leans back, the front door's runs down behind the front wheel
function crDoors(c){c.beginPath();c.moveTo(121.2,18);c.lineTo(126.2,40);c.lineTo(128.6,54.2);c.lineTo(221.8,54.2);c.lineTo(223.6,46);c.lineTo(223.4,18);c.closePath();}
function crWheel(c,wx){const R=CR.WR,cy=15;
  c.fillStyle='#07080b';c.beginPath();c.arc(wx,cy,R,0,TAU);c.fill();
  // the sidewall, a shade lighter than the tread, and the light along its top toward the floods
  c.strokeStyle='#15171e';c.lineWidth=3;c.beginPath();c.arc(wx,cy,R-3.6,0,TAU);c.stroke();
  c.strokeStyle=rgba('#cfe0ff',.24);c.lineWidth=1;c.beginPath();c.arc(wx,cy,R-.8,.2,1.3);c.stroke();
  // the black steel wheel, its vent holes and nuts, the chrome cap
  c.fillStyle=rad(c,wx-2,cy+2,1,10.4,[[0,'#2c313c'],[.6,'#171b24'],[1,'#0c0e14']]);c.beginPath();c.arc(wx,cy,10.4,0,TAU);c.fill();
  c.strokeStyle='#05060a';c.lineWidth=1.5;c.beginPath();c.arc(wx,cy,10.4,0,TAU);c.stroke();
  c.fillStyle='#040508';for(let i=0;i<8;i++){const a=i/8*TAU+.2;c.beginPath();c.arc(wx+Math.cos(a)*7.3,cy+Math.sin(a)*7.3,1.7,0,TAU);c.fill();}
  c.fillStyle='#3a404c';for(let i=0;i<5;i++){const a=i/5*TAU+.6;c.beginPath();c.arc(wx+Math.cos(a)*5,cy+Math.sin(a)*5,.95,0,TAU);c.fill();}
  c.fillStyle=lin(c,wx-3.6,cy-3.6,wx+3.6,cy+3.6,[[0,'#3a4050'],[.55,'#a8b0c0'],[1,'#e8eef8']]);c.beginPath();c.arc(wx,cy,3.6,0,TAU);c.fill();
  c.strokeStyle=rgba('#f4f8ff',.7);c.lineWidth=1;c.beginPath();c.arc(wx,cy,3.1,.3,1.3);c.stroke();
  // the top of the tyre in the arch's shadow
  c.save();c.beginPath();c.arc(wx,cy,R+.5,0,TAU);c.clip();c.fillStyle=lin(c,0,cy+R,0,cy+3,[[0,'rgba(0,0,0,.55)'],[1,'rgba(0,0,0,0)']]);c.fillRect(wx-R-1,cy,2*R+2,R+1);c.restore();}
function cruiser(c){const d=CRUISER.d,o=crP(0,0),{RW,FW,AR}=CR,r=rng(191);
  // its lamps in the wet road below it: the headlamp longest, the tail lamp, the white doors faint
  {const b=o.y+1;wetStreak(c,crP(297,0).x,b,b+46,14,'#fff0cc',.26,31);wetStreak(c,crP(3,0).x,b,b+30,10,'#ff3a2a',.2,33);wetStreak(c,crP(172,0).x,b,b+22,80,'#c8cedb',.05,35);}
  c.save();c.translate(o.x,o.y);c.scale(1,-1);
  // the contact shadow, darkest under the tyres; the dark under the sills, and what hangs there: the exhaust run back to the tail
  c.fillStyle='rgba(0,0,0,.5)';c.beginPath();c.ellipse(151,0,168,5,0,0,TAU);c.fill();
  c.fillStyle=lin(c,0,14.5,0,0,[[0,'rgba(3,3,6,.92)'],[1,'rgba(3,3,6,.5)']]);c.fillRect(4,.5,296,14);
  c.fillStyle='#101218';c.fillRect(96,6.6,34,4.4);c.strokeStyle='#14161c';c.lineWidth=2;c.beginPath();c.moveTo(-1,10.6);c.lineTo(30,10.2);c.lineTo(96,8.8);c.moveTo(130,8.8);c.lineTo(214,9.4);c.stroke();
  c.fillStyle='#0b0c11';c.fillRect(-2.8,9,4.2,3.2);c.strokeStyle=rgba('#cfe0ff',.22);c.lineWidth=1;c.beginPath();c.moveTo(-2.6,12.6);c.lineTo(1.2,12.6);c.stroke();
  for(const wx of [RW,FW]){c.fillStyle='rgba(0,0,0,.75)';c.beginPath();c.ellipse(wx,0,15,2.6,0,0,TAU);c.fill();}
  // the wheel wells, the tyres in them
  for(const wx of [RW,FW]){c.fillStyle='#030407';c.beginPath();c.arc(wx,15,AR,0,Math.PI);c.lineTo(wx-AR,12);c.lineTo(wx+AR,12);c.closePath();c.fill();
    c.strokeStyle='#0c0e14';c.lineWidth=1.5;c.beginPath();c.arc(wx,15,AR-2,.15,Math.PI-.15);c.stroke();crWheel(c,wx);}
  // 1-2: the silhouette in the lacquer's own light: the street mirrored in the flank, a hard horizon at the crease, the roof rail lit
  crBody(c);c.fillStyle=lin(c,0,13.6,0,78,[[0,'#090c13'],[.07,'#141a27'],[.26,'#0b0f19'],[.45,'#0e1320'],[.47,'#20283f'],[.6,'#1b2236'],[.72,'#161c2d'],[1,'#253049']]);c.fill();
  c.save();crBody(c);c.clip();
  c.fillStyle=rgba('#05070c',.55);c.fillRect(0,13,304,5);
  // the near lane's lamps and flashers mirrored soft in the flank below the crease
  c.globalCompositeOperation='lighter';
  for(const [x,col,a,w] of [[40,'#ffb060',.07,13],[96,'#ffb030',.05,9],[262,'#cfe0ff',.08,15],[284,'#5a8cff',.05,8]]){c.save();c.translate(x,30);c.scale(w/12,1.15);c.fillStyle=rad(c,0,0,0,12,[[0,rgba(col,a)],[1,rgba(col,0)]]);c.fillRect(-12,-12,24,24);c.restore();}
  c.fillStyle=lin(c,0,14,0,21,[[0,rgba('#9fb4d8',.07)],[1,rgba('#9fb4d8',0)]]);c.fillRect(0,14,304,7);
  c.globalCompositeOperation='source-over';
  // the white doors: the same horizon in a lighter paint, grime at their foot, rain run down from the glass
  c.save();crDoors(c);c.fillStyle=lin(c,0,18,0,54.2,[[0,'#5c6370'],[.22,'#7d8491'],[.7,'#a0a6b3'],[.72,'#bdc2cc'],[1,'#cbd0d9']]);c.fill();c.clip();
  c.fillStyle=lin(c,0,18,0,29,[[0,rgba('#2a241e',.42)],[1,rgba('#2a241e',0)]]);c.fillRect(118,18,108,11);
  c.strokeStyle=rgba('#3c4352',.13);c.lineWidth=1.5;c.beginPath();for(let i=0;i<14;i++){const x=124+r()*96,l=5+r()*16;c.moveTo(x,54);c.lineTo(x+(r()-.5)*.8,54-l);}c.stroke();
  c.fillStyle=rgba('#0d1326',.92);c.fillRect(128,23.4,92,1.6);
  c.save();c.translate(172.5,27.4);c.scale(1,-1);c.font='700 17px "Alegreya SC", Georgia, serif';c.textAlign='center';c.fillStyle='#0d1326';c.fillText('POLICE',0,0);c.restore();
  c.restore();
  // the light over the crease: the floods cold toward the nose, the sodium lamp overhead warm on the roof, a soft band under the top line
  c.globalCompositeOperation='lighter';
  c.fillStyle=lin(c,60,0,302,0,[[0,rgba('#cfe0ff',0)],[1,rgba('#cfe0ff',.11)]]);c.fillRect(0,43.8,304,36);
  c.save();c.translate(150,92);c.scale(1.4,1);c.fillStyle=rad(c,0,0,0,62,[[0,rgba('#ffb060',.12)],[1,rgba('#ffb060',0)]]);c.fillRect(-62,-62,124,124);c.restore();
  c.strokeStyle=lin(c,0,0,300,0,[[0,rgba('#d6e4ff',.03)],[.6,rgba('#d6e4ff',.07)],[1,rgba('#d6e4ff',.12)]]);c.lineWidth=6;c.beginPath();c.moveTo(9.5,46.2);crTop(c);c.stroke();
  for(const [x,y,w,col,a] of [[262,47.4,30,'#e6eeff',.2],[278,46.6,12,'#ffffff',.18],[58,47.4,30,'#ffc890',.09],[150,47.6,40,'#e6eeff',.06]]){c.save();c.translate(x,y);c.scale(w/10,.3);c.fillStyle=rad(c,0,0,0,10,[[0,rgba(col,a)],[1,rgba(col,0)]]);c.fillRect(-10,-10,20,20);c.restore();}
  c.globalCompositeOperation='source-over';
  // road spray thrown up behind each wheel
  for(const wx of [RW,FW]){c.save();c.translate(wx-AR-7,19);c.scale(1.5,.8);c.fillStyle=rad(c,0,0,0,15,[[0,rgba('#2a241e',.5)],[1,rgba('#2a241e',0)]]);c.fillRect(-15,-15,30,30);c.restore();}
  c.restore();
  // 3-4: the glass, dark, and through it the cabin: the headrests, the cage behind the front seats, the wheel and the terminal's screen
  c.save();crGlass(c);c.fillStyle=lin(c,0,54.2,0,73.7,[[0,'#05070c'],[.75,'#0e1422'],[1,'#18203a']]);c.fill();c.clip();
  c.fillStyle='#121826';for(const [x,y,w,h] of [[182.6,60.6,9,9.4],[137.6,60,8.6,8.8]]){c.beginPath();c.moveTo(x+2,y);c.lineTo(x+w-2,y);c.quadraticCurveTo(x+w,y,x+w,y+2.4);c.lineTo(x+w,y+h-2.4);c.quadraticCurveTo(x+w,y+h,x+w-2,y+h);c.lineTo(x+2,y+h);c.quadraticCurveTo(x,y+h,x,y+h-2.4);c.lineTo(x,y+2.4);c.quadraticCurveTo(x,y,x+2,y);c.fill();}
  c.strokeStyle='#05060a';c.lineWidth=1.6;c.beginPath();c.moveTo(177.4,54.2);c.lineTo(178.6,73.6);c.stroke();
  c.strokeStyle=rgba('#2a3448',.16);c.lineWidth=1.5;c.beginPath();for(let x=170.6;x<177;x+=3.2){c.moveTo(x,54.2);c.lineTo(x+1,73.6);}c.stroke();
  c.strokeStyle='#0a0d14';c.lineWidth=1.8;c.beginPath();c.arc(209,60.4,6.2,.5,2.7);c.stroke();
  c.fillStyle=rgba('#8fb6dc',.3);c.beginPath();c.moveTo(198.8,57.6);c.lineTo(205.4,58.4);c.lineTo(204.9,62.8);c.lineTo(198.4,62);c.closePath();c.fill();glow(c,202,60.2,13,'#8fb6dc',.12);
  c.globalCompositeOperation='lighter';
  c.fillStyle=rgba('#cfe0ff',.07);c.beginPath();c.moveTo(171,54.2);c.lineTo(179.6,54.2);c.lineTo(196.2,73.6);c.lineTo(187.6,73.6);c.closePath();c.fill();
  c.fillStyle=rgba('#cfe0ff',.1);c.beginPath();c.moveTo(183,54.2);c.lineTo(185.6,54.2);c.lineTo(202,73.6);c.lineTo(199.4,73.6);c.closePath();c.fill();
  c.save();c.translate(140,70.6);c.scale(1.6,1);c.fillStyle=rad(c,0,0,0,12,[[0,rgba('#ffb060',.1)],[1,rgba('#ffb060',0)]]);c.fillRect(-12,-12,24,24);c.restore();
  c.fillStyle=rgba('#ffd9a0',.13);for(let i=0;i<8;i++)c.fillRect(110+r()*104,64+r()*8.6,1.5,1.5);
  c.strokeStyle=rgba('#9fb4d8',.07);c.lineWidth=1.5;c.beginPath();for(let i=0;i<9;i++){const x=110+r()*104,y=56+r()*16;c.moveTo(x,y);c.lineTo(x+.3,y-3-r()*6);}c.stroke();
  c.globalCompositeOperation='source-over';c.restore();
  // the black trim round the glass, the posts, the belt line lit along its top
  c.strokeStyle='#05060a';c.lineWidth=2;crGlass(c);c.stroke();
  c.fillStyle='#0a0c12';c.fillRect(164.4,54.2,5.6,19.4);c.fillRect(126.6,54.2,2.8,19.5);
  c.fillStyle='#05060a';c.fillRect(104,53.4,117.4,2);
  c.strokeStyle=rgba('#cfe0ff',.32);c.lineWidth=1;c.beginPath();c.moveTo(169.6,55.4);c.lineTo(169.6,73);c.moveTo(129,55.4);c.lineTo(129,73.2);c.stroke();
  c.strokeStyle=rgba('#d6e4ff',.42);c.beginPath();c.moveTo(105,55.8);c.lineTo(219.6,55.8);c.stroke();
  // the shut lines, dark: the doors, their foot, the deck lid, the bumper covers
  c.strokeStyle=rgba('#03050a',.85);c.lineWidth=1.5;c.beginPath();
  c.moveTo(167.2,54.2);c.lineTo(167.2,18.4);c.moveTo(128.6,54.2);c.lineTo(126.2,40);c.lineTo(121.2,18.4);c.moveTo(221.8,54.2);c.lineTo(223.6,46);c.lineTo(223.4,18.4);
  c.moveTo(121.2,18.2);c.lineTo(223.4,18.2);c.moveTo(87,49.2);c.quadraticCurveTo(48,47.9,10.5,44.4);c.moveTo(289.5,17);c.lineTo(290.8,36);c.moveTo(7.6,17);c.lineTo(6.8,36);c.stroke();
  // the crease: its shadow, the gold line along it and the light on the gold
  c.strokeStyle=rgba('#070a12',.45);c.lineWidth=1.5;c.beginPath();c.moveTo(6,43);c.lineTo(294,43);c.stroke();
  c.strokeStyle=rgba('#8a6a2e',.85);c.beginPath();c.moveTo(7,44.2);c.lineTo(293,44.2);c.stroke();
  c.strokeStyle=rgba('#e2b65a',.5);c.lineWidth=1;c.beginPath();c.moveTo(7,45);c.lineTo(293,45);c.stroke();
  // the door handles, the mirror, the spotlight on the pillar
  for(const x of [131,172.6]){c.fillStyle=rgba('#000000',.25);c.fillRect(x-.6,43.6,9.6,1.6);c.fillStyle='#0a0c12';c.fillRect(x,45.2,8.4,2.6);
    c.strokeStyle=rgba('#d6e4ff',.5);c.lineWidth=1;c.beginPath();c.moveTo(x+.3,48);c.lineTo(x+8.1,48);c.stroke();}
  c.fillStyle='#05060a';c.beginPath();c.moveTo(217.6,54.2);c.lineTo(222.6,54.2);c.lineTo(220,56.6);c.closePath();c.fill();
  c.fillStyle=lin(c,0,55.6,0,63.6,[[0,'#0b0f1a'],[.7,'#1c2438'],[1,'#2c3854']]);c.beginPath();c.moveTo(213.4,56.6);c.lineTo(214,61.8);c.quadraticCurveTo(214.4,63.6,216.6,63.6);c.lineTo(222.6,63);c.quadraticCurveTo(225.2,62.4,225,59.4);c.lineTo(224.2,56.6);c.quadraticCurveTo(223.8,55.6,222.4,55.6);c.closePath();c.fill();
  c.strokeStyle=rgba('#d6e4ff',.4);c.lineWidth=1;c.beginPath();c.moveTo(215.4,63.9);c.lineTo(222.6,63.3);c.quadraticCurveTo(225.4,62.6,225.3,59.6);c.stroke();
  c.save();c.translate(202.6,64.6);c.strokeStyle='#07080c';c.lineWidth=1.6;c.beginPath();c.moveTo(-4,0);c.lineTo(-9,-1.8);c.stroke();
    c.fillStyle=lin(c,0,-2.4,0,2.4,[[0,'#0c0e14'],[.7,'#1e2430'],[1,'#3a4252']]);c.fillRect(-4.6,-2.4,8.2,4.8);
    c.fillStyle=lin(c,0,-2.8,0,2.8,[[0,'#2a303c'],[.6,'#6a7282'],[1,'#b8c0cc']]);c.fillRect(3.6,-2.8,1.6,5.6);
    c.strokeStyle=rgba('#e6eeff',.45);c.lineWidth=1;c.beginPath();c.moveTo(-4.2,2.1);c.lineTo(5,2.1);c.stroke();c.restore();
  // Hallowell's gold H on the rear quarter: the shield, its dark edge, the H, the light on its edge toward the key
  {c.save();c.translate(101,32.6);const sh=()=>{c.beginPath();c.moveTo(0,8.4);c.lineTo(6.6,6.4);c.lineTo(5.6,-3.2);c.lineTo(0,-8.6);c.lineTo(-5.6,-3.2);c.lineTo(-6.6,6.4);c.closePath();};
    sh();c.fillStyle=rad(c,1.5,2.5,0,10,[[0,C.goldL],[.55,C.gold],[1,C.goldD]]);c.fill();c.strokeStyle='#4a3814';c.lineWidth=1.5;c.stroke();
    c.fillStyle='#3a2a10';c.fillRect(-3.4,-4.4,1.7,8.8);c.fillRect(1.7,-4.4,1.7,8.8);c.fillRect(-3.4,-.8,6.8,1.6);
    c.strokeStyle=rgba('#ffe2a3',.85);c.lineWidth=1;c.beginPath();c.moveTo(.4,8);c.lineTo(6.1,6.2);c.lineTo(5.2,-3);c.stroke();c.restore();}
  // the unit's number on the front wing, small
  c.save();c.translate(279,26);c.scale(1,-1);c.font='700 8px "Alegreya SC", Georgia, serif';c.textAlign='center';c.fillStyle=rgba('#d8dce6',.7);c.fillText('214',0,0);c.restore();
  // the bumpers' rub strips, the push bar on the nose, its two lamps dark till they flash
  c.fillStyle='#07080c';c.fillRect(290.6,22,12.2,4.4);c.fillRect(-.3,22,8.2,4.4);
  c.strokeStyle=rgba('#cfe0ff',.3);c.lineWidth=1;c.beginPath();c.moveTo(291,26.9);c.lineTo(302.2,26.9);c.moveTo(0,26.9);c.lineTo(7.6,26.9);c.stroke();
  c.fillStyle='#0b0d12';c.beginPath();c.moveTo(300.6,14.6);c.lineTo(304.6,15.4);c.lineTo(307.6,17.4);c.lineTo(308.2,40.4);c.quadraticCurveTo(308.2,45,303.8,45.2);c.lineTo(297.4,45.4);
  c.lineTo(297.8,42.6);c.lineTo(303.4,42.4);c.quadraticCurveTo(304.6,42.2,304.6,40.6);c.lineTo(304.2,19.8);c.lineTo(300.4,18.4);c.closePath();c.fill();
  c.fillRect(301.8,29.6,3,2.4);
  c.strokeStyle=rgba('#cfe0ff',.42);c.lineWidth=1;c.beginPath();c.moveTo(308.6,18.4);c.lineTo(309.1,40.4);c.quadraticCurveTo(309.1,45.9,303.8,46.1);c.lineTo(298,46.3);c.stroke();
  c.fillStyle='#5a3a10';c.fillRect(304.9,34.4,2.8,3.4);c.fillStyle='#16285a';c.fillRect(304.9,24.4,2.8,3.4);
  // the antennas: two whips off the deck, a fin on the roof
  c.fillStyle='#07080c';c.fillRect(25.6,47.4,5,2.4);c.fillRect(43.6,48.2,4.6,2.4);c.beginPath();c.moveTo(113.6,76.4);c.lineTo(117.6,83.6);c.lineTo(121.6,77);c.closePath();c.fill();
  c.strokeStyle='#161a24';c.lineWidth=1.5;c.beginPath();c.moveTo(28,49);c.quadraticCurveTo(26.6,70,21.4,90);c.stroke();
  c.strokeStyle=rgba('#cfe0ff',.38);c.lineWidth=1;c.beginPath();c.moveTo(28.9,50);c.quadraticCurveTo(27.5,70,22.3,89.4);c.stroke();
  c.fillStyle='#161a24';c.fillRect(45,50,1.8,9.6);c.fillRect(44.3,53.4,3.2,2.6);c.fillStyle=rgba('#cfe0ff',.3);c.fillRect(46.3,50.4,1,9);
  // the lightbar on its two feet: chrome caps, an amber lens and a blue one, the reflectors behind them; its lamps turn in live()
  c.fillStyle='#07080c';c.fillRect(135,77.4,3,2.6);c.fillRect(170,77.6,3,2.4);c.fillStyle='#0c0e14';c.fillRect(131.4,79,45.2,2);
  {const lens=()=>{c.beginPath();c.moveTo(134,80.8);c.lineTo(174,80.8);c.quadraticCurveTo(176,80.8,176,83);c.quadraticCurveTo(176,86.2,173.6,86.2);c.lineTo(134.4,86.2);c.quadraticCurveTo(132,86.2,132,83);c.quadraticCurveTo(132,80.8,134,80.8);};
    c.save();lens();c.clip();c.fillStyle=lin(c,0,80.8,0,86.2,[[0,'#2e1c08'],[1,'#5e3e14']]);c.fillRect(131,80,23,7);c.fillStyle=lin(c,0,80.8,0,86.2,[[0,'#0a142e'],[1,'#20305e']]);c.fillRect(154,80,23,7);
      c.strokeStyle=rgba('#05060a',.55);c.lineWidth=1.5;c.beginPath();for(const x of [137.5,143,148.5,159.5,165,170.5]){c.moveTo(x,80.8);c.lineTo(x,86.2);}c.stroke();
      c.fillStyle='#05060a';c.fillRect(153.2,80.8,1.8,5.4);c.restore();
    c.strokeStyle=rgba('#e6eeff',.5);c.lineWidth=1;c.beginPath();c.moveTo(134.2,85.7);c.lineTo(173.8,85.7);c.stroke();
    for(const x of [130.6,175.6]){c.fillStyle=lin(c,0,80.6,0,86.4,[[0,'#3a404c'],[.6,'#9aa2b2'],[1,'#dfe6f2']]);c.fillRect(x,80.6,2,5.8);}}
  // 6: beads of rain along the top, catching the floods the more toward the nose
  c.globalCompositeOperation='lighter';
  for(let i=0;i<46;i++){const x=12+r()*280;if(x>196&&x<232)continue;const y=crTopY(x)-.9-r()*2.4,k=.25+.6*x/300;c.fillStyle=rgba('#e6eeff',k*(.3+.5*r()));c.fillRect(x,y,1.5,1.5);}
  c.globalCompositeOperation='source-over';
  // the scuffs on the tail's corner
  c.strokeStyle=rgba('#9aa2b2',.16);c.lineWidth=1.5;c.beginPath();c.moveTo(1.4,29.6);c.lineTo(5.6,28.4);c.moveTo(1.2,27);c.lineTo(4.4,26.4);c.moveTo(2.2,31.4);c.lineTo(6.6,30.2);c.stroke();
  // 7: the light catch: the top line lit, brightest toward the flood at the nose; the arches' lips dark with a light along their tops
  c.globalCompositeOperation='lighter';c.strokeStyle=lin(c,0,0,300,0,[[0,rgba('#d6e4ff',.12)],[.55,rgba('#d6e4ff',.3)],[1,rgba('#e6eeff',.56)]]);c.lineWidth=1;c.beginPath();c.moveTo(9.5,46.2);crTop(c);c.lineTo(300.6,36.2);c.stroke();c.globalCompositeOperation='source-over';
  for(const wx of [RW,FW]){c.strokeStyle='#04060b';c.lineWidth=1.6;c.beginPath();c.arc(wx,15,AR+.2,.05,Math.PI-.05);c.stroke();
    c.strokeStyle=rgba('#cfe0ff',.3);c.lineWidth=1;c.beginPath();c.arc(wx,15,AR+1.1,.35,1.3);c.stroke();}
  // 8: into the air: the street's haze over it, before its lamps
  c.fillStyle=rgba('#2a2c40',.07);crBody(c);c.fill();
  // the lamps: the headlamp lit, the parking lamp and the side markers, the tail lamp
  c.fillStyle='#fff4dc';c.beginPath();c.moveTo(293.2,41.8);c.lineTo(298.5,42);c.lineTo(300.5,36.3);c.lineTo(294,35.6);c.closePath();c.fill();
  c.strokeStyle='#05060a';c.lineWidth=1.5;c.beginPath();c.moveTo(294,35);c.lineTo(301,35);c.stroke();
  glow(c,297.4,38.8,26,'#fff0cc',.5);glow(c,297.4,38.8,7,'#ffffff',.7);
  c.fillStyle='#ffb030';c.fillRect(291.8,29.2,4.2,2.4);glow(c,294,30.4,7,'#ffb030',.35);c.fillStyle=rgba('#ffb030',.85);c.fillRect(285.6,39.4,3,1.8);
  c.fillStyle=lin(c,0,33.4,0,41.6,[[0,'#5a1012'],[1,'#9a2024']]);c.beginPath();c.moveTo(.8,41.2);c.lineTo(5.2,41.6);c.lineTo(4.4,33.6);c.lineTo(.2,33.4);c.closePath();c.fill();
  c.fillStyle=rgba('#ff4a3a',.9);c.fillRect(1.4,35.6,2.6,4);glow(c,2.6,37.6,14,'#ff3a2a',.35);c.fillStyle=rgba('#c42a28',.9);c.fillRect(8.6,38.8,3.4,1.8);
  c.restore();void d;}
// ---------- the floor ----------
function road(c,X0,X1){
  const rv=[gq(X0,196),gq(X1,196),gq(X1+110,E.NEAR),gq(X0,E.NEAR)];
  c.save();poly(c,rv);c.clip();c.save();c.transform(1,0,PSX,-PSY,0,GB);
  c.fillStyle=patAt(c,asphalt(31,{U:64,sc:4}),0,0,1/4);c.fillRect(X0-60,E.NEAR-10,X1-X0+280,210-E.NEAR);
  // patched strips where the road has been dug and filled, darker
  {const r=rng(14);for(let i=0;i<5;i++){const x=X0+r()*(X1-X0),d=-60+r()*230,w=40+r()*120,h=10+r()*26;c.fillStyle=rgba('#07080b',.28);c.fillRect(x,d,w,h);c.strokeStyle=rgba('#000000',.25);c.lineWidth=1.7;c.strokeRect(x,d,w,h);}}
  // the lane paint, worn: a broken line down the middle, solid edge lines, the stop line before the checkpoint
  {const paint=(x0,x1,d,wd,col,dash)=>{c.fillStyle=col;if(!dash){c.fillRect(x0,d-wd/2,x1-x0,wd);return;}for(let x=x0;x<x1;x+=dash[0]+dash[1])c.fillRect(x,d-wd/2,dash[0],wd);};
    paint(X0,X1,92,3.2,rgba('#e8e4d8',.34),[38,30]);paint(X0,X1,186,2.6,rgba('#d8b040',.3));paint(X0,X1,2,2.6,rgba('#e8e4d8',.22));
    c.fillStyle=rgba('#e8e4d8',.32);c.fillRect(SPIKE.x-42,E.NEAR,7,196-E.NEAR);
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
  {c.fillStyle='#0b0c10';c.fillRect(SPIKE.x-5,E.NEAR,10,196-E.NEAR);c.fillStyle=rgba('#9aa4b8',.5);for(let d=E.NEAR+2;d<196;d+=5){c.beginPath();c.moveTo(SPIKE.x-3,d);c.lineTo(SPIKE.x,d+2.4);c.lineTo(SPIKE.x+3,d);c.closePath();c.fill();}
    c.fillStyle=rgba('#000000',.5);for(let d=-110;d<196;d+=22)c.fillRect(SPIKE.x-5.4,d,10.8,.8);for(let d=-132;d>E.NEAR;d-=22)c.fillRect(SPIKE.x-5.4,d,10.8,.8);}
  // the manhole: a cast iron lid in its frame, its pattern, the wet ring round it
  {const h=HOLE;c.fillStyle='#08080a';c.beginPath();c.ellipse(h.x,h.d,15,11,0,0,TAU);c.fill();c.fillStyle=lin(c,h.x-12,h.d-12,h.x+12,h.d+12,[[0,'#2a2c32'],[.5,'#3a3c44'],[1,'#1c1d22']]);c.beginPath();c.ellipse(h.x,h.d,12.4,9.2,0,0,TAU);c.fill();
    c.strokeStyle=rgba('#000000',.6);c.lineWidth=1.76;c.beginPath();for(let k=-3;k<=3;k++){c.moveTo(h.x+k*3.2,h.d-8.6+Math.abs(k)*.4);c.lineTo(h.x+k*3.2,h.d+8.6-Math.abs(k)*.4);}c.stroke();
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
  {const L=mastLamp(),p=gq(MAST.x-120,110);c.save();c.translate(p.x,p.y);c.scale(1,.32);c.fillStyle=rad(c,0,0,0,520,[[0,rgba('#c8dcff',.2)],[.45,rgba('#c8dcff',.075)],[1,rgba('#c8dcff',0)]]);c.beginPath();c.arc(0,0,520,0,TAU);c.fill();c.restore();void L;}
  for(const Lp of LAMPS){const p=gq(Lp.x+44,84);c.save();c.translate(p.x,p.y);c.scale(1,.34);c.fillStyle=rad(c,0,0,0,180,[[0,rgba('#ffb060',.14)],[1,rgba('#ffb060',0)]]);c.beginPath();c.arc(0,0,180,0,TAU);c.fill();c.restore();}
  c.restore();}
// the far pavement and its kerb
function pavement(c,X0,X1){const g=g0(),pv=[pp(X0,g,DF),pp(X1,g,DF),pp(X1,g,200),pp(X0,g,200)];
  // concrete slabs, wet: the asphalt's grain lightened, the joints between the slabs, a few cracked
  c.save();poly(c,pv);c.clip();c.transform(1,0,PSX,-PSY,0,g);c.fillStyle=patAt(c,asphalt(31,{U:64,sc:4}),0,0,1/4);c.fillRect(X0,200,X1-X0,DF-200);
  c.fillStyle=rgba('#6a6870',.22);c.fillRect(X0,200,X1-X0,DF-200);
  const r=rng(12);c.strokeStyle=rgba('#000000',.5);c.lineWidth=1.76;c.beginPath();for(let x=X0;x<X1;x+=28+r()*4){c.moveTo(x,200);c.lineTo(x,DF);}c.moveTo(X0,220);c.lineTo(X1,220);c.stroke();
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
    glow(c,(x0+x1)/2,base-10,90,'#ffcf86',.25,.35);c.strokeStyle='#07070b';c.lineWidth=1.5;c.beginPath();for(let x=x0;x<=x1;x+=4){c.moveTo(x,base);c.lineTo(x,base-14);}c.moveTo(x0,base-12);c.lineTo(x1,base-12);c.stroke();
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
      c.strokeStyle=rgba('#040406',a);c.lineWidth=1.51;c.beginPath();c.moveTo(X0,pts[0].y+6);for(let i=0;i<pts.length;i++){const p=pts[i];if(i)c.quadraticCurveTo((pts[i-1].x+p.x)/2,(pts[i-1].y+p.y)/2+6,p.x,p.y);else c.lineTo(p.x,p.y);}c.lineTo(X1,pts[pts.length-1].y+6);c.stroke();
      c.strokeStyle=rgba('#cfe0ff',.14*a);c.lineWidth=.4;c.stroke();void wy;}}
  // the floods' light: soft cones down the avenue from the mast and from the tripod (the shared piece: a cone from the lamp to the
  // stretch of road it lands on, as wide there as that stretch is across it), dimmer in the air than the pools they leave on the
  // road; the glare of the lamp faces
  {const L=mastLamp(),o={x:L.x-14,y:L.y-4},cone=(o,a,b,al)=>{const Ax=(a.x+b.x)/2-o.x,Ay=(a.y+b.y)/2-o.y,len=Math.hypot(Ax,Ay)||1,fw=Math.abs(((b.x-a.x)*Ay-(b.y-a.y)*Ax)/len);
      softCone(c,o.x,o.y,9,fw*.82,len,'#d6e4ff',al,Math.atan2(Ay,Ax)-Math.PI/2,.9);};
    // the mast's falls down the avenue onto the road, a little of it caught in the drizzle on the way
    cone(o,gq(-40,10),gq(560,190),.09);cone(o,gq(120,50),gq(480,160),.07);
    // and the tripod's, low and flat along the far lane, with its own pool there
    {const T=triLamp(),h={x:T.x-12,y:T.y-TRI.h};cone(h,gq(TRI.x-420,110),gq(TRI.x-300,196),.11);
      const p=gq(TRI.x-360,150);c.save();c.globalCompositeOperation='lighter';c.translate(p.x,p.y);c.scale(1,.3);c.fillStyle=rad(c,0,0,0,150,[[0,rgba('#c8dcff',.15)],[.5,rgba('#c8dcff',.05)],[1,rgba('#c8dcff',0)]]);c.beginPath();c.arc(0,0,150,0,TAU);c.fill();c.restore();}
    glow(c,o.x,o.y,90,'#dce8ff',.5);glow(c,o.x,o.y,22,'#ffffff',.9);
    const T=triLamp();glow(c,T.x-12,T.y-TRI.h,56,'#dce8ff',.6);glow(c,T.x-12,T.y-TRI.h,12,'#ffffff',.9);}
  for(const Lp of LAMPS){const L=lampHead(Lp);glow(c,L.x,L.y+2,48,'#ffb050',.45);glow(c,L.x,L.y+2,10,'#fff0c8',.8);beam(c,L.x,L.y+3,10,90,120,'#ffb860',.06);}
  // the near lane: sawhorses and cones toward us, left of where the carrier stands
  sawhorse(c,{...BARR[2],col:'a'});for(const k of CONES)if(k.d<0)cone(c,k);sawhorse(c,{...BARR[3],col:'b'});
  // the dark toward us
  E.fallKeep(c,X0,X1+120,GB-20,[[GB-20,0],[GB+110,.42]],null,.05);}
// ---------- what moves: the searchlights, the flashers and the lightbar, the board, the steam, the drizzle ----------
const STEAM=(()=>{const r=rng(5),a=[];for(let i=0;i<14;i++)a.push({ph:r(),dx:(r()-.5)*8,sp:.18+r()*.14,w:5+r()*6});return a;})();
const EXH=(()=>{const r=rng(17),a=[];for(let i=0;i<7;i++)a.push({ph:r(),sp:.35+r()*.2,dy:r()*6});return a;})();
const RAIN=(()=>{const r=rng(8),a=[];for(let i=0;i<70;i++)a.push({x:r()*1100-100,y:r()*560-40,sp:280+r()*160,l:5+r()*5,a:.06+r()*.1});return a;})();
// the message board's two faces: a grid of lamps 1.75 units apart, the message's lamps lit (five by seven to a letter, a column
// between letters), the rest dark; painted once each at four pixels a unit and stamped
const DOTS={C:['.###.','#...#','#....','#....','#....','#...#','.###.'],H:['#...#','#...#','#...#','#####','#...#','#...#','#...#'],E:['#####','#....','#....','####.','#....','#....','#####'],
  K:['#...#','#..#.','#.#..','##...','#.#..','#..#.','#...#'],P:['####.','#...#','#...#','####.','#....','#....','#....'],O:['.###.','#...#','#...#','#...#','#...#','#...#','.###.'],
  I:['.###.','..#..','..#..','..#..','..#..','..#..','.###.'],N:['#...#','##..#','#.#.#','#..##','#...#','#...#','#...#'],T:['#####','..#..','..#..','..#..','..#..','..#..','..#..'],
  S:['.####','#....','#....','.###.','....#','....#','####.'],'<':['....#','...##','..###','.####','..###','...##','....#'],' ':['.....','.....','.....','.....','.....','.....','.....']};
const BOARD_MSG=[['CHECK','POINT'],['STOP','< < <']],BOARD_FACE=[];
function boardFace(ph,w,h){const F=BOARD_FACE[ph];if(F&&F.w===w&&F.h===h)return F.cv;const k=4,cv=document.createElement('canvas');cv.width=Math.ceil(w*k);cv.height=Math.ceil(h*k);
  const g=cv.getContext('2d'),pt=1.75,cols=Math.floor((w-4)/pt),rows=Math.floor((h-4)/pt),ox=(w-cols*pt)/2+pt/2,oy=(h-rows*pt)/2+pt/2,lit=new Set();g.scale(k,k);
  BOARD_MSG[ph].forEach((ln,li)=>{const c0=Math.floor((cols-(ln.length*6-1))/2),r0=li?rows-8:1;
    for(let i=0;i<ln.length;i++){const G=DOTS[ln[i]]||DOTS[' '];for(let r=0;r<7;r++)for(let q=0;q<5;q++)if(G[r][q]==='#')lit.add((r0+r)*cols+c0+i*6+q);}});
  for(let r=0;r<rows;r++)for(let q=0;q<cols;q++){const on=lit.has(r*cols+q);g.fillStyle=on?rgba('#ffb030',.9):rgba('#2a1c0c',.5);g.beginPath();g.arc(ox+q*pt,oy+r*pt,.75,0,TAU);g.fill();
    if(on){g.fillStyle=rgba('#fff0c0',.55);g.beginPath();g.arc(ox+q*pt-.2,oy+r*pt-.2,.35,0,TAU);g.fill();}}
  BOARD_FACE[ph]={cv,w,h};return cv;}
function live(){const t=S.t;ctx.save();ctx.globalCompositeOperation='lighter';
  // the searchlights out of the crown, two pale arms sweeping the cloud
  // (the shared soft piece, as the fall's searchlights: a bell across, fading out into the cloud)
  {const cw=TOWER.w*.62,oy=TOWER.top-8;for(const [sd,ph,sp,col] of [[-1,0,.23,'#e4ecff'],[1,2.1,.17,'#cfeeff']]){const ox=TOWER.x+sd*cw*.47,a=-Math.PI/2+sd*.42+Math.sin(t*sp+ph)*.5;
    softCone(ctx,ox,oy,5,100,700,col,.38,a-Math.PI/2,1.8);glow(ctx,ox,oy,14,'#f4f8ff',.6);}}
  // the flashers on the sawhorses, amber and blue by turns
  for(let i=0;i<BARR.length;i++){const s=BARR[i],d=s.d,h=38,L=s.w/2,q=pp(s.x+L*.55,GB-h,d),blue=i%2===1,on=Math.pow(Math.max(0,Math.sin(t*(blue?5.2:4.6)+i*1.7)),6);
    if(on<.02)continue;const col=blue?'#5a8cff':'#ffb030',y=q.y-(d<0?9:7)-2.2;glow(ctx,q.x,y,d<0?30:22,col,.75*on);ctx.fillStyle=rgba('#ffffff',.85*on);ctx.fillRect(q.x-1.6,y-1,3.2,2);}
  // the cruiser's lightbar turning (since V112: lamp by lamp behind its lenses, each side flashing twice in its half turn), its colour
  // on the roof under it and washing the road and the shutters behind; the push bar's two lamps wig-wag against it
  {const ph=t*7,on1=Math.max(0,Math.sin(ph)),on2=Math.max(0,Math.sin(ph+Math.PI)),st=Math.sin(t*41)>0?1:.5,
    seg=[[132.6,137.2],[137.8,142.7],[143.3,148.2],[148.8,153.2],[155,159.2],[159.8,164.7],[165.3,170.2],[170.8,175.4]];
    for(let i=0;i<8;i++){const amber=i<4,on=(amber?on1:on2)*(i%2?st:1.5-st);if(on<.05)continue;const a=crP(seg[i][0],85.6),b=crP(seg[i][1],81.4);
      ctx.fillStyle=amber?rgba('#ffd890',on):rgba('#cfdcff',on);ctx.fillRect(a.x,a.y,b.x-a.x,b.y-a.y);if(on>.6){ctx.fillStyle=rgba('#ffffff',on-.5);ctx.fillRect(a.x+1,a.y+1.2,b.x-a.x-2,b.y-a.y-2.4);}}
    const a=crP(143,83.5),b=crP(165,83.5),m=Math.max(on1,on2),col=on1>on2?'#ffb030':'#5a8cff';
    glow(ctx,a.x,a.y,30,'#ffb030',.85*on1);glow(ctx,b.x,b.y,30,'#5a8cff',.95*on2);
    const rf=crP(154,77.6);glow(ctx,rf.x,rf.y,46,col,.24*m,.22);glow(ctx,(a.x+b.x)/2,a.y-10,180,col,.05*m,.6);
    const wa=Math.max(0,Math.sin(t*9.4)),wb=Math.max(0,Math.sin(t*9.4+Math.PI)),pa=crP(306.3,36.1),pb=crP(306.3,26.1);
    if(wa>.05){ctx.fillStyle=rgba('#ffe0a0',wa);ctx.fillRect(pa.x-1.4,pa.y-1.7,2.8,3.4);glow(ctx,pa.x,pa.y,13,'#ffb030',.6*wa);}
    if(wb>.05){ctx.fillStyle=rgba('#dfe8ff',wb);ctx.fillRect(pb.x-1.4,pb.y-1.7,2.8,3.4);glow(ctx,pb.x,pb.y,13,'#5a8cff',.7*wb);}
    // the burning carrier's light on its nose and its windshield, flickering, the nearer the fire the more
    const F0=(typeof S!=='undefined'&&S.fires)||[];if(F0.length){const n=crP(292,44);let k=0;
      for(const F of F0){const fx=F.x+(F.dep||0)*PSX,fy=F.y-(F.h||60)*.45-(F.dep||0)*PSY;k=Math.max(k,clamp(1-Math.hypot(fx-n.x,fy-n.y)/460,0,1)*Math.min(1,F.k||1));}
      if(k>.02){const fl=.78+.22*Math.sin(t*13.7)*Math.sin(t*7.3+1),w=crP(214,63);glow(ctx,n.x,n.y,64,'#ff9a4a',.15*k*fl,.55);glow(ctx,w.x,w.y,20,'#ffb070',.12*k*fl);}}}
  // the message board: CHECK POINT in its amber lamps, then STOP and arrows, by turns (boardFace: the letters hand-drawn on the
  // board's own grid of lamps, five by seven each and twelve units tall, the drawing guide's least for a sign meant to be read)
  {const d=BOARD.d,p0=pp(BOARD.x-30,GB-112,d),p1=pp(BOARD.x+30,GB-78,d),ph=Math.floor(t/1.6)%2,w=p1.x-p0.x,h=p1.y-p0.y;
    ctx.drawImage(boardFace(ph,w,h),p0.x,p0.y,w,h);glow(ctx,p0.x+w/2,p0.y+h/2,w*.7,'#ffb030',.07);}
  ctx.globalCompositeOperation='source-over';
  // steam out of the manhole, rising and leaning with the air
  {const q=gq(HOLE.x,HOLE.d);for(const s of STEAM){const u=(t*s.sp+s.ph)%1,y=q.y-u*90,x=q.x+s.dx+Math.sin(t*.9+s.ph*6)*6*u+u*18,r=s.w*(1+u*2.4),a=.11*(1-u)*Math.min(1,u*6);
    ctx.fillStyle=rad(ctx,x,y,0,r,[[0,rgba('#c8d0e0',a)],[1,rgba('#c8d0e0',0)]]);ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();}}
  // the cruiser idling: its exhaust breathing out under the tail into the cold
  {const q=crP(-2.6,10.6);for(const s of EXH){const u=(t*s.sp+s.ph)%1,x=q.x-u*30+Math.sin(t*1.3+s.ph*5)*2*u,y=q.y-u*(18+s.dy),rr=2.2+u*8,a=.09*(1-u)*Math.min(1,u*8);
    ctx.fillStyle=rad(ctx,x,y,0,rr,[[0,rgba('#c8d0e0',a)],[1,rgba('#c8d0e0',0)]]);ctx.beginPath();ctx.arc(x,y,rr,0,TAU);ctx.fill();}}
  // the drizzle, catching the floods
  {ctx.strokeStyle='#dfe8ff';ctx.lineWidth=.5;ctx.beginPath();for(const p of RAIN){const y=((p.y+t*p.sp)%560+560)%560-40,x=p.x-y*.06;ctx.moveTo(x,y);ctx.lineTo(x-p.l*.12,y+p.l);}ctx.globalAlpha=.16;ctx.stroke();ctx.globalAlpha=1;}
  // the red light on the tower's needle
  {const x=TOWER.x,y=TOWER.top-75,on=Math.pow(Math.max(0,Math.sin(t*2.4)),8);if(on>.02){glow(ctx,x,y,10,'#ff3a2a',.8*on);ctx.fillStyle=rgba('#ffd0c0',on);ctx.fillRect(x-.7,y-.7,1.4,1.4);}}
  ctx.restore();}
// the light that rims a fighter: the floods on the light tower, high on the right; near the burning carrier its fire (since V82: the
// officers there were dark against it), its flames' orange on their planes and rims, the nearer the more, from where the fire stands
function light(f){const L=mastLamp(),d=f.dep||0,pel=f.p&&f.p[typeof PEL==='number'?PEL:0],px=pel?pel.x+d*PSX:0;let best=null,bk=0;
  for(const F of (typeof S!=='undefined'&&S.fires)||[]){const fx=F.x+(F.dep||0)*PSX,k=clamp(1-Math.hypot(fx-px,((F.dep||0)-d)*1.6)/340,0,1)*Math.min(1,F.k||1);if(k>bk){bk=k;best=F;}}
  if(best&&bk>.08){const u=clamp(bk*1.5,0,1),fx=best.x+(best.dep||0)*PSX,fy=best.y-(best.h||60)*.45-(best.dep||0)*PSY;
    return{light:{x:lerp(L.x-14,fx,u)-d*PSX,y:lerp(L.y-4,fy,u)+d*PSY},col:mix('#e0eaff','#ff9a4a',u)};}
  return{light:{x:L.x-14-d*PSX,y:L.y-4+d*PSY},col:'#e0eaff'};}
// the light on the fight (the style guide's rule 8, sceneSet in sk_scene_glue.js): the floods' light on the road behind the fight
const SET={col:'#e8efff',soft:.5,y:[GB-360,GB-280,GB-60,GB+20]};
E.S.roadblock={set:SET,paint,live,light,mast:MAST,div:it=>it.dv&&it.dv.mat==='plank'&&typeof EnvProps!=='undefined'?EnvProps.plankFence(it,'town'):false,table:()=>typeof EnvProps!=='undefined'?EnvProps.fieldTable('town'):false};
})();
// ===== ENV ROADBLOCK END =====
