// ===== ENV CHASE =====
// The avenue: the chase runs east down a four-lane avenue of the Lamplight Street city at night, after rain. The riders keep to the
// middle of the frame and the city goes past them in bands, each painted once into a strip that repeats and slid along by S.scroll at
// its own pace: far towers in the haze, the tall houses of the middle city, then the avenue's own row in brick and stucco (a tailor, an
// elven café under cyan light, the Lyric picture house, a pawnbroker shut for the night, a little square, books, an oyster bar in red
// neon, the Hotel Argent, a barber) behind elven gas lamps on the far kerb; the wet asphalt with its lanes, seams and manholes holding
// every light; and the near kerb's bollards, quickest of all. The sky, the moon and the Hallowell tower stay put, far off to the right.
// Brick, stucco, granite and flags come from EnvTex; the asphalt is made here, pixel by pixel, the same way.
(()=>{const E=EnvLook,{C,pp,poly,line,rect,lin,rad,rgba,mix,glow,beam,haze,vine,scroll,gilt,windowPane,wetStreak,stars,moon,cloudBank,skyline,hallTower,rng,lerp,clamp,TAU}=E;
const TX=()=>EnvTex;
// ---------- the avenue ----------
// the road at GB between the near kerb (NK) and the far (FK), both pavements a kerb (KH) above it, the houses' fronts at DF, the lamps
// a little back from the far kerb
const KH=7,NK=-16,FK=206,DF=244,LAMPD=216;
const yR=d=>GB-d*PSY,yP=d=>GB-KH-d*PSY,FB=()=>yP(DF);
// the bands, back to front: the length after which each repeats (P, world units across), how fast it goes by as a share of the riders'
// speed (f), and the rows it covers (y0..y1). 130 goes into every P, so the paving and the asphalt tile across the seams. Each band is
// kept in parts by rows: [y0, y1, solid, square]. A solid part has no sky in it and goes on as an opaque copy, the cheapest there is;
// a square part lies behind the houses everywhere but the little square, and is only drawn where the square has come round
const BAND={far:{P:2600,f:.15,y0:40,y1:176,parts:[[40,146],[146,176,0,1]]},mid:{P:1950,f:.45,y0:4,y1:214,parts:[[4,146],[146,214,0,1]]},
  street:{P:1560,f:1,y0:26,y1:484,parts:[[26,212],[212,484,1]]},near:{P:1170,f:1.15,y0:440,y1:510,parts:[[440,476],[476,510,1]]}};
const ORDER=['far','mid','street','near'],SQ=[712,834];
// the lamps on the far kerb, by where each post stands in the street's strip: one every 260, but none by the shut pawnshop and the
// square, where the moon has the light
const LX=[130,390,910,1170,1430],lampHead=lx=>({x:lx+16,y:yP(LAMPD)-141});
const lampNear=x=>{let k=0;for(const lx of LX){const dd=Math.abs(lampHead(lx).x-x);k=Math.max(k,clamp(1-dd/120,0,1));}return k;};
const MOON={x:196,y:38,r:11},TOWER={x:720,base:238,top:6,w:46},MARQ={x:459,y:228};
// what the fronts give out as they are drawn: light onto the flags (SPILL), lights the wet road mirrors (REFL), the marquee's bulbs
let SPILL=[],REFL=[],BULBS=[];
// lengths that fill 0..P exactly, each w0..w1
function fitRow(r,P,w0,w1){const out=[];let x=0;while(x<P-.01){let w=w0+r()*(w1-w0);if(P-x-w<w0)w=P-x;out.push([x,x+w]);x+=w;}return out;}
// ---------- materials ----------
// a texture laid from (x, y), u units to a texture pixel, turned rot degrees
function patAt(c,cn,x,y,u,rot){const p=c.createPattern(cn,'repeat');if(p.setTransform){let m=new DOMMatrix().translate(x,y);if(rot)m=m.rotate(rot);p.setTransform(m.scale(u));}return p;}
// dressed stone: pale granite darkened for the night, its top arris lit
function stone(c,x,y,w,h,o){o=o||{};c.fillStyle=patAt(c,TX().granite(61,96,96,{base:o.base||'#6e6660'}),x,y,.25);c.fillRect(x,y,w,h);
  c.fillStyle=rgba('#05040a',o.dark==null?.5:o.dark);c.fillRect(x,y,w,h);
  if(o.lit!==false){c.fillStyle=rgba(C.rim,o.lit||.22);c.fillRect(x,y,w,Math.min(.6,h*.3));}c.fillStyle=rgba('#000000',.35);c.fillRect(x,y+h-Math.min(.5,h*.2),w,Math.min(.5,h*.2));}
// timber for the shopfronts: mahogany where o.wood says so, paint (o.paint) for the rest
function timber(c,o,x,y,w,h,vert){if(w<=0||h<=0)return;
  if(o.wood){c.fillStyle=patAt(c,TX().wood(o.woodSeed||11,256,128,o.wood),x,y,.25,vert?90:0);c.fillRect(x,y,w,h);c.fillStyle=rgba('#000000',o.woodDark==null?.3:o.woodDark);c.fillRect(x,y,w,h);}
  else{const p=o.paint||'#141018';c.fillStyle=lin(c,0,y,0,y+h,[[0,mix(p,'#000000',.25)],[1,p]]);c.fillRect(x,y,w,h);}}
// a raised and fielded panel
function panel(c,o,x,y,w,h){if(w<2||h<2)return;timber(c,o,x,y,w,h);const m=Math.min(1.4,w*.2,h*.2);
  c.fillStyle=rgba('#000000',.5);c.fillRect(x,y,w,m*.7);c.fillRect(x,y,m*.6,h);c.fillStyle=rgba(C.rim,.14);c.fillRect(x,y+h-.5,w,.5);
  c.fillStyle=rgba('#ffe0c0',.035);c.fillRect(x+m,y+m,w-2*m,h-2*m);c.fillStyle=rgba(C.rim,.22);c.fillRect(x+m,y+m,w-2*m,.45);c.fillStyle=rgba('#000000',.35);c.fillRect(x+m,y+h-m-.45,w-2*m,.45);}
// a black glass fascia with the name gilded behind the glass
function fascia(c,x,y,w,h,o){c.fillStyle=lin(c,0,y,0,y+h,[[0,'#121118'],[.4,'#07060a'],[1,'#030305']]);c.fillRect(x,y,w,h);
  c.save();c.beginPath();c.rect(x,y,w,h);c.clip();c.globalCompositeOperation='lighter';c.fillStyle=rgba('#ffe8d0',.045);
  for(let sx=x+w*.18;sx<x+w+h;sx+=Math.max(24,w*.33)){c.beginPath();c.moveTo(sx,y);c.lineTo(sx+h*.35,y);c.lineTo(sx-h*.25,y+h);c.lineTo(sx-h*.6,y+h);c.closePath();c.fill();}c.restore();
  c.strokeStyle=rgba(C.gold,.7);c.lineWidth=.45;c.strokeRect(x+1.3,y+1.3,w-2.6,h-2.6);c.fillStyle=rgba(C.gold,.85);c.fillRect(x,y+h-.8,w,.8);c.fillRect(x,y,w,.6);
  if(o.name)gilt(c,o.name,x+w/2,y+h*.74,o.size||8.5,{style:o.style||'700',track:o.track||1.2,glow:o.glowName});}
// glass seen from the street at night: a long sheen across it, its top in the shade of the fascia
function glassSheen(c,x,y,w,h,a){c.save();c.beginPath();c.rect(x,y,w,h);c.clip();c.globalCompositeOperation='lighter';c.fillStyle=rgba('#fff0e0',a||.05);
  for(let sx=x+w*.12;sx<x+w+h;sx+=Math.max(30,w*.42)){c.beginPath();c.moveTo(sx,y);c.lineTo(sx+4,y);c.lineTo(sx+4-h*.45,y+h);c.lineTo(sx-h*.45,y+h);c.closePath();c.fill();}
  c.restore();const sh=Math.min(10,h*.3);c.fillStyle=lin(c,0,y,0,y+sh,[[0,rgba('#000000',.3)],[1,rgba('#000000',0)]]);c.fillRect(x,y,w,sh);}
// a door: stiles and rails, glazed above a panel, brass knob and kick plate, a stone step
function shopDoor(c,o,dx,dy,dw,base,lit){timber(c,o,dx,dy,dw,base-dy,true);c.strokeStyle='#040305';c.lineWidth=.5;c.strokeRect(dx+.25,dy+.25,dw-.5,base-dy-.5);
  const gh=(base-dy)*.55;windowPane(c,dx+2,dy+2,dw-4,gh,lit,{mull:0,fw:.7,spill:false});glassSheen(c,dx+2,dy+2,dw-4,gh,.05);
  panel(c,o,dx+2,dy+gh+4,dw-4,base-dy-gh-9);
  c.fillStyle=lin(c,0,base-4,0,base-1.4,[[0,C.goldL],[1,C.goldD]]);c.fillRect(dx+1,base-4,dw-2,2.4);
  c.fillStyle=C.goldL;c.beginPath();c.arc(dx+dw-3,dy+gh+2.6,.8,0,TAU);c.fill();
  stone(c,dx-2,base-1.2,dw+4,2.4,{lit:.38});}
// asphalt, 130 world units square at two pixels to the unit: a dark warm binder with the aggregate's stones standing out of it pale and
// dark, the rain lying darker in the hollows
let ASPH=null;
function asphalt(){if(ASPH)return ASPH;const T=TX(),n=T.noise2(41,4),n2=T.noise2(43,16),n3=T.noise2(47,64),r=rng(45);
  return ASPH=T.pix(260,260,(u,v,out)=>{const big=n(u*4,v*4),mid=n2(u*16,v*16),fine=n3(u*64,v*64),q=r();
    let k=.86+(big-.5)*.14+(mid-.5)*.12+(fine-.5)*.24;if(q<.06)k*=1.45;else if(q<.14)k*=.62;if(mid<.3)k*=.9;
    out[0]=34*k;out[1]=29*k;out[2]=33*k;});}
// the pavements' flags: one texture for both sides, 130 units to its repeat so it tiles across every band's seam
const flags=()=>TX().flagstones(41,{L:32.5,cols:4,rows:2,sc:2.5,c0:'#3a3236',c1:'#544a4c'});
// a soft glow drawn small and blurred apart from the strip, then added to it: what shadowBlur gives, for a fraction of the cost (a
// blur on the strip itself is worked over the whole strip)
function bloom(c,x,y,w,h,blur,a,draw){const k=c.getTransform().a,pad=blur*2.4,W2=Math.ceil((w+2*pad)*k),H2=Math.ceil((h+2*pad)*k);if(W2<1||H2<1)return;
  const A=document.createElement('canvas');A.width=W2;A.height=H2;const g=A.getContext('2d');g.setTransform(k,0,0,k,(pad-x)*k,(pad-y)*k);draw(g);
  const B=document.createElement('canvas');B.width=W2;B.height=H2;const gb=B.getContext('2d');gb.filter='blur('+(blur*k).toFixed(1)+'px)';gb.drawImage(A,0,0);
  c.save();c.globalCompositeOperation='lighter';c.globalAlpha=a;c.drawImage(B,x-pad,y-pad,W2/k,H2/k);c.restore();A.width=B.width=0;}
// a reflection on the wet road under a light: short broken dashes thinning out away from the kerb, a faint wash behind them
function streak(c,x,y0,y1,w,col,a,seed,dens){const r=rng(seed||51),n=Math.floor((y1-y0)*(dens||1));c.save();c.globalCompositeOperation='lighter';
  for(let i=0;i<n;i++){const u=Math.pow(r(),1.3),y=lerp(y0,y1,u),k=Math.pow(1-u,1.6),ww=w*(.35+.65*k)*(.4+r()*.9),xx=x+(r()-.5)*w*(.5+u*1.4);
    c.fillStyle=rgba(col,a*k*(.4+.6*r()));c.fillRect(xx-ww/2,y,ww,.6+r()*1.1);}
  c.fillStyle=lin(c,0,y0,0,y1,[[0,rgba(col,a*.35)],[1,rgba(col,0)]]);c.beginPath();c.moveTo(x-w*.2,y0);c.lineTo(x+w*.2,y0);c.lineTo(x+w*.7,y1);c.lineTo(x-w*.7,y1);c.closePath();c.fill();c.restore();}
// ---------- the houses ----------
function roofOf(c,b,x0,x1,top,r){const w=x1-x0;
  if(b.roof==='mansard'){const rh=b.rh||26,roof=()=>{c.beginPath();c.moveTo(x0-3,top);c.lineTo(x0+6,top-rh);c.lineTo(x1-6,top-rh);c.lineTo(x1+3,top);c.closePath();};
    roof();c.fillStyle=b.slate||'#0e1018';c.fill();
    // slates in courses, each course's joints broken against the one below
    c.save();roof();c.clip();c.strokeStyle=rgba('#2a3046',.5);c.lineWidth=.5;c.beginPath();for(let y=top-rh+3;y<top;y+=3){c.moveTo(x0-3,y);c.lineTo(x1+3,y);}c.stroke();
    c.strokeStyle=rgba('#000000',.55);c.lineWidth=.35;c.beginPath();for(let y=top-rh,k=0;y<top;y+=3,k++)for(let x=x0-3+(k%2)*2;x<x1+3;x+=4){c.moveTo(x,y);c.lineTo(x,y+3);}c.stroke();
    c.fillStyle=lin(c,0,top-rh,0,top,[[0,rgba('#8a96b8',.07)],[1,rgba('#000000',.25)]]);c.fillRect(x0-3,top-rh,w+6,rh);c.restore();
    for(let dx=x0+18;dx<x1-14;dx+=b.dorm||38){c.fillStyle='#0b0d13';c.beginPath();c.moveTo(dx-6,top-2);c.lineTo(dx-6,top-rh+8);c.lineTo(dx,top-rh+3);c.lineTo(dx+6,top-rh+8);c.lineTo(dx+6,top-2);c.fill();
      line(c,[{x:dx-6.5,y:top-rh+8.4},{x:dx,y:top-rh+3.2},{x:dx+6.5,y:top-rh+8.4}],rgba('#9aa4bc',.35),.6);
      windowPane(c,dx-3.5,top-rh+9,7,10,r()<.35?.75:0,{mull:1,fw:.8,spill:false});}
    line(c,[{x:x0+6,y:top-rh},{x:x1-6,y:top-rh}],rgba(C.rim,.45),.8);
    for(const cx of b.chim||[x0+8,x1-16]){const cy=top-rh-14;c.fillStyle=patAt(c,TX().brick(3,{base:'#3a2420',alt:'#2a1816',hot:'#4a2a20',mortar:'#26221f',sc:3}),cx,cy,1/3);c.fillRect(cx,cy,8,16);
      c.fillStyle=lin(c,cx,0,cx+8,0,[[0,rgba('#04030a',.82)],[1,rgba('#04030a',.62)]]);c.fillRect(cx,cy,8,16);stone(c,cx-1,cy-1.6,10,2.4,{lit:.3,dark:.6});
      for(const px of [cx+1.2,cx+4.8]){c.fillStyle=lin(c,px,0,px+2,0,[[0,'#1a0c08'],[.6,'#3a1c12'],[1,'#140906']]);c.fillRect(px,cy-5,2,3.5);c.fillStyle=rgba(C.rim,.3);c.fillRect(px-.2,cy-5.2,2.4,.5);}}}
  else if(b.roof==='gable'){const rh=b.rh||36,cx=(x0+x1)/2;c.fillStyle=b.slate||'#0f0e15';c.beginPath();c.moveTo(x0-4,top);c.lineTo(cx,top-rh);c.lineTo(x1+4,top);c.closePath();c.fill();
    c.save();c.beginPath();c.moveTo(x0-1,top);c.lineTo(cx,top-rh+3);c.lineTo(x1+1,top);c.closePath();c.clip();c.fillStyle=patAt(c,TX().plaster(b.seed,128,128,{base:b.stucco||'#3a3440'}),x0,top-rh,.7);c.fillRect(x0,top-rh,w,rh);
      c.fillStyle=rgba('#04030a',.8);c.fillRect(x0,top-rh,w,rh);c.restore();
    line(c,[{x:x0-4,y:top},{x:cx,y:top-rh},{x:x1+4,y:top}],rgba(C.rim,.35),.9);windowPane(c,cx-5,top-rh*.62,10,12,r()<.5?.7:0,{arch:true,mull:1,fw:.8});}
  else{if(b.cornice){stone(c,x0-4,top-6,w+8,6,{dark:.55,lit:.35});c.fillStyle=rgba('#000000',.65);for(let x=x0-3;x<x1+3;x+=3.2)c.fillRect(x,top-1.6,1.3,1.6);stone(c,x0-2,top-10,w+4,4,{dark:.6,lit:.25});}
    else stone(c,x0-4,top-5,w+8,6,{dark:.6,lit:.35});
    if(b.balus){for(let bx=x0;bx<x1;bx+=4){c.fillStyle=lin(c,bx,0,bx+2,0,[[0,'#1c1a22'],[1,'#0a090d']]);c.fillRect(bx,top-13,2,8);}stone(c,x0-2,top-15,w+4,3,{dark:.6,lit:.3});}
    if(b.urns)for(const ux of [x0+6,x1-6]){c.fillStyle=lin(c,ux-5,0,ux+5,0,[[0,'#0c0b10'],[.6,'#262230'],[1,'#0c0b10']]);c.beginPath();c.moveTo(ux-3,top-15);c.quadraticCurveTo(ux-5,top-22,ux,top-25);c.quadraticCurveTo(ux+5,top-22,ux+3,top-15);c.fill();}}}
// a house across the avenue: x0..x1 on screen at the house line, the wall's top on screen; floors of windows over the ground floor's shop
function house(c,b){const base=FB(),x0=b.x0,x1=b.x1,w=x1-x0,top=b.top,r=rng(b.seed||1),gTop=base-(b.shopH||58);
  // the wall: brick in courses, or stucco scored as ashlar
  if(b.brick){c.fillStyle=patAt(c,TX().brick(b.bs||b.seed,{base:b.bc||'#3a2420',alt:b.bc2||'#2a1816',hot:b.bc3||'#4a2a20',mortar:'#26221f',sc:3}),x0,top,1/3);c.fillRect(x0,top,w,base-top);
    c.fillStyle=lin(c,0,top,0,base,[[0,rgba('#04030a',.72)],[1,rgba('#04030a',.55)]]);c.fillRect(x0,top,w,base-top);}
  else{c.fillStyle=patAt(c,TX().plaster(b.seed,128,128,{base:b.stucco||'#3a3440'}),x0,top,.7);c.fillRect(x0,top,w,base-top);
    c.fillStyle=lin(c,0,top,0,base,[[0,rgba('#04030a',.78)],[1,rgba('#04030a',.6)]]);c.fillRect(x0,top,w,base-top);
    c.strokeStyle=rgba('#000000',.5);c.lineWidth=.6;c.beginPath();for(let y=top+8,k=0;y<gTop-6;y+=8,k++){c.moveTo(x0,y);c.lineTo(x1,y);for(let x=x0+(k%2)*14;x<x1;x+=28){c.moveTo(x,y);c.lineTo(x,Math.min(y+8,gTop-6));}}c.stroke();
    c.strokeStyle=rgba('#ffcf9a',.06);c.beginPath();for(let y=top+8.7;y<gTop-6;y+=8){c.moveTo(x0,y);c.lineTo(x1,y);}c.stroke();}
  // soot under the eaves; quoins at the corners of the brick houses
  c.fillStyle=lin(c,0,top,0,top+24,[[0,rgba('#030206',.5)],[1,rgba('#030206',0)]]);c.fillRect(x0,top,w,24);
  if(b.brick)for(const [qx,dir] of [[x0,1],[x1,-1]])for(let y=top+1,k=0;y+6<gTop-7;y+=6.4,k++){const qw=k%2?5.5:9.5;stone(c,dir>0?qx:qx-qw,y,qw,6,{dark:.6,lit:.1});}
  roofOf(c,b,x0,x1,top,r);
  // a cornice over the ground floor: dressed stone on a row of dentils
  stone(c,x0-3,gTop-7,w+6,4.6,{lit:.32,dark:.5});stone(c,x0-2,gTop-2.4,w+4,2.2,{lit:.1,dark:.58});c.fillStyle=rgba('#000000',.7);for(let x=x0-.4;x<x1+1;x+=2.8)c.fillRect(x,gTop-2.4,1.1,2.2);
  if(b.gild)vine(c,[{x:x0+4,y:gTop-4.6},{x:x1-4,y:gTop-4.6}],{w:.55,amp:1,wave:9,leaf:1.5,every:2,seed:b.seed});
  // the floors: windows on stone sills under stone heads, a few lit
  const fl=b.floors||2,flH=(gTop-7-top-6)/fl,cols=b.cols||Math.max(2,Math.floor(w/34));
  for(let i=0;i<fl;i++)for(let j=0;j<cols;j++){const ww=Math.min(15,w/cols*.46),wh=flH*.64,wx=x0+(j+.5)*w/cols-ww/2,wy=top+6+i*flH+flH*.15,arch=b.arch&&i===0;
    if(!arch){c.fillStyle=rgba('#000000',.55);c.fillRect(wx-1,wy-.5,ww+2,wh+.5);}
    const lit=r()<(b.litP||.25)?.5+r()*.5:0;windowPane(c,wx,wy,ww,wh,lit,{arch,mull:2,rows:[.38],curtain:lit&&r()<.6?rgba(r()<.5?'#4a1218':'#1a2a24',.85):null,figure:lit&&r()<.15,fw:1.1,r,sky:'#121628'});
    if(lit>.6)REFL.push({x:wx+ww/2,w:ww*.8,y:wy+wh/2,col:'#ffb866',a:.07*lit});
    stone(c,wx-2.2,wy+wh,ww+4.4,2.4,{lit:.32});
    {const rr=rng(b.seed*131+i*17+j*3);for(let k=0;k<3;k++){const sx=wx-1+rr()*(ww+2),sw=.5+rr()*1.3,sl=5+rr()*12;c.fillStyle=lin(c,0,wy+wh+2.4,0,wy+wh+2.4+sl,[[0,rgba('#000000',.32)],[1,rgba('#000000',0)]]);c.fillRect(sx,wy+wh+2.4,sw,sl);}}
    if(arch){const cx=wx+ww/2,cy=wy+ww/2,R0=ww/2+.4,R1=ww/2+2.6;c.save();c.beginPath();c.arc(cx,cy,R1,Math.PI,0);c.arc(cx,cy,R0,0,Math.PI,true);c.closePath();c.clip();stone(c,cx-R1,cy-R1,R1*2,R1,{lit:.25});
      c.strokeStyle=rgba('#000000',.55);c.lineWidth=.4;c.beginPath();for(let k=1;k<7;k++){const a=Math.PI+k*Math.PI/7;c.moveTo(cx+Math.cos(a)*R0,cy+Math.sin(a)*R0);c.lineTo(cx+Math.cos(a)*R1,cy+Math.sin(a)*R1);}c.stroke();c.restore();
      stone(c,cx-1.5,cy-R1-.8,3,3.4,{lit:.35});}
    else{stone(c,wx-1.8,wy-3.4,ww+3.6,3.2,{lit:.2});if(b.gild)stone(c,wx+ww/2-1.7,wy-4.4,3.4,4.6,{lit:.35});}
    if(b.boxes&&i===fl-1&&r()<.6){c.fillStyle='#120d0b';c.fillRect(wx-1,wy+wh+2.4,ww+2,3.4);c.fillStyle=rgba(C.rim,.2);c.fillRect(wx-1,wy+wh+2.4,ww+2,.4);
      for(let k=0;k<9;k++){c.fillStyle=mix('#14241a','#3a5a2c',r()*.7);c.beginPath();c.arc(wx+r()*ww,wy+wh+1.8+r()*.8,1+r()*.7,0,TAU);c.fill();}
      for(let k=0;k<3;k++){c.fillStyle=r()<.5?'#a8282c':'#c87a3a';c.fillRect(wx+r()*ww,wy+wh+.6+r(),1.1,1.1);}}
    if(b.balcony===i){const by=wy+wh+2.4;stone(c,wx-7,by,ww+14,1.8,{lit:.3,dark:.55});c.strokeStyle=C.ink;c.lineWidth=1;c.beginPath();c.moveTo(wx-6,by-8);c.lineTo(wx+ww+6,by-8);for(let bx=wx-6;bx<=wx+ww+6;bx+=2.5){c.moveTo(bx,by);c.lineTo(bx,by-8);}c.stroke();
      vine(c,[{x:wx-5,y:by-4},{x:wx+ww+5,y:by-4}],{w:.6,amp:1.5,wave:8,leaf:1.6,every:2,seed:b.seed});}}
  lampWash(c,x0,x1,top,base);
  return{gTop,base};}
// the faces turned to a lamp catch it: a warm wash low down, a rim on the edge toward it
function lampWash(c,x0,x1,top,base){c.save();c.globalCompositeOperation='lighter';
  for(const lx of LX){const q=lampHead(lx);if(q.x<x0-130||q.x>x1+130)continue;const a0=Math.max(x0,q.x-150),a1=Math.min(x1,q.x+150),b0=Math.max(top,q.y-130),b1=Math.min(base,q.y+170);if(a1<=a0||b1<=b0)continue;
    c.fillStyle=rad(c,q.x,q.y+10,0,110,[[0,rgba('#ffb866',.13)],[.5,rgba('#ffb866',.04)],[1,rgba('#ffb866',0)]]);c.fillRect(a0,b0,a1-a0,b1-b0);}c.restore();
  for(const [ex,side] of [[x0,1],[x1,-1]]){const k=lampNear(ex);if(k<=0)continue;c.fillStyle=lin(c,ex,0,ex+side*5,0,[[0,rgba(C.rim,.45*k)],[1,rgba(C.rim,0)]]);c.fillRect(side>0?ex:ex-5,top,5,base-top);}}
// a shopfront: pilasters with consoles, a black glass fascia, a lit window in lights over a panelled stallriser, a half-glazed door; or,
// shut for the night, a steel shutter down over the lot
function shopfront(c,x0,x1,gTop,base,o){const w=x1-x0,fh=o.fasciaH||11,P=o.pil||4,st=o.stall||7;
  timber(c,o,x0+P,gTop+fh,w-2*P,base-gTop-fh);
  for(const px of [x0,x1-P]){timber(c,o,px,gTop,P,base-gTop,true);c.fillStyle=rgba('#000000',.4);c.fillRect(px+P*.45,gTop+fh+4,.5,base-gTop-fh-10);c.fillStyle=rgba(C.rim,.2);c.fillRect(px+P-.6,gTop+fh,.5,base-gTop-fh-4);
    stone(c,px-.4,base-4,P+.8,4,{lit:.2,dark:.55});}
  fascia(c,x0+P,gTop,w-2*P,fh,o);
  for(const px of [x0,x1-P]){timber(c,o,px-.8,gTop-2,P+1.6,fh+4,true);c.fillStyle=rgba(C.rim,.3);c.fillRect(px-.8,gTop-2,P+1.6,.5);c.fillStyle=rgba('#000000',.45);c.fillRect(px-.8,gTop+fh+1.6,P+1.6,.5);scroll(c,px+P/2,gTop+fh*.6,1.5,px===x0?1:-1,C.gold,.45,1.3);}
  timber(c,o,x0-1.5,gTop-3.4,w+3,2);c.fillStyle=rgba(C.rim,.32);c.fillRect(x0-1.5,gTop-3.4,w+3,.5);
  const wy=gTop+fh+2;if(o.shut){shutter(c,x0+P,wy-1.5,x1-P,base-1,o.seed||7);return{wy};}
  const door=o.door||[x1-P-16,14],left=door[0]<x0+w/2,win0=left?door[0]+door[1]+3:x0+P+1,win1=left?x1-P-1:door[0]-3,wh=base-st-wy,lit=o.lit==null?.9:o.lit;
  windowPane(c,win0,wy,win1-win0,wh,lit,{mull:0,fw:.01,frame:'#0a0808',spill:false});
  if(o.inside)o.inside(c,win0,wy,win1-win0,wh);
  const n=o.lights||3,lw=(win1-win0)/n;
  timber(c,o,win0,wy+wh*.22,win1-win0,1.4);for(let i=1;i<n;i++){timber(c,o,win0+i*lw-.7,wy,1.4,wh,true);c.fillStyle=rgba(C.rim,.18);c.fillRect(win0+i*lw+.3,wy,.4,wh);}
  c.strokeStyle='#060405';c.lineWidth=.8;c.strokeRect(win0,wy,win1-win0,wh);glassSheen(c,win0,wy,win1-win0,wh,.045);
  for(let i=0;i<n;i++)panel(c,o,win0+i*lw+1,wy+wh+2.4,lw-2,st-3.6);
  timber(c,o,win0-1.5,wy+wh,win1-win0+3,1.4);c.fillStyle=rgba(C.rim,.35);c.fillRect(win0-1.5,wy+wh,win1-win0+3,.45);
  shopDoor(c,o,door[0],wy-2,door[1],base,o.doorLit==null?.5:o.doorLit);
  if(lit>0){SPILL.push({x0:win0,x1:win1,a:lit*.6});REFL.push({x:(win0+win1)/2,w:(win1-win0)*.5,y:wy+wh*.55,col:o.reflCol||'#ffb866',a:.1+.1*lit});}
  return{wy,win0,win1,wh};}
// a roller shutter of ribbed steel, padlocked at the foot, a bill pasted on it, rust run down from the ribs
function shutter(c,x0,y0,x1,y1,seed){const r=rng(seed),w=x1-x0;
  c.fillStyle=lin(c,0,y0,0,y1,[[0,'#2a2c35'],[1,'#1b1c23']]);c.fillRect(x0,y0,w,y1-y0);
  for(let y=y0+1.6;y<y1-2;y+=2){c.fillStyle=rgba('#000000',.55);c.fillRect(x0,y,w,.5);c.fillStyle=rgba('#a8b0c8',.08);c.fillRect(x0,y+.5,w,.35);}
  for(let k=0;k<9;k++){const rx=x0+2+r()*(w-4),ry=y0+r()*(y1-y0)*.7,rl=4+r()*16;c.fillStyle=lin(c,0,ry,0,ry+rl,[[0,rgba('#6a3416',.38)],[1,rgba('#6a3416',0)]]);c.fillRect(rx,ry,.6+r()*.9,rl);}
  for(let k=0;k<3;k++){const dx=x0+4+r()*(w-8),dy=y0+4+r()*(y1-y0-8);c.fillStyle=rad(c,dx,dy,0,3,[[0,rgba('#000000',.35)],[1,rgba('#000000',0)]]);c.fillRect(dx-3,dy-3,6,6);}
  c.fillStyle='#0c0c10';c.fillRect(x0,y0,1.6,y1-y0);c.fillRect(x1-1.6,y0,1.6,y1-y0);c.fillRect(x0,y1-2.4,w,2.4);c.fillStyle=rgba('#a8b0c8',.18);c.fillRect(x0,y1-2.4,w,.4);
  // the padlock, brass gone dull
  const px=x0+w*.5;c.strokeStyle=C.goldD;c.lineWidth=.5;c.beginPath();c.arc(px,y1-4.4,1,Math.PI,0);c.stroke();c.fillStyle=lin(c,0,y1-4.4,0,y1-2,[[0,C.gold],[1,C.goldDD]]);c.fillRect(px-1.4,y1-4.4,2.8,2.4);
  // a bill pasted on and half torn away
  const bx=x0+w*(.18+r()*.2),by=y0+(y1-y0)*.18;c.save();c.translate(bx,by);c.rotate(-.05);c.fillStyle=rgba('#cbbb98',.5);c.beginPath();c.moveTo(0,0);c.lineTo(14,0);c.lineTo(14,12);c.lineTo(9,18);c.lineTo(0,18);c.closePath();c.fill();
  c.fillStyle=rgba('#1a1410',.55);c.fillRect(1.6,2,10.8,2.8);for(let k=0;k<5;k++)c.fillRect(1.6,7+k*2,5+r()*5,.6);c.restore();
  // the moon along its ribs
  c.fillStyle=lin(c,x0,0,x1,0,[[0,rgba('#9aa6d0',.07)],[1,rgba('#9aa6d0',0)]]);c.fillRect(x0,y0,w,y1-y0);}
// what the shops show in their windows, dark against the light inside
const GOODS={
  tailor:(c,x,y,w,h)=>{c.fillStyle=rgba(C.ink,.9);for(const f of [.28,.7]){const mx=x+w*f,my=y+h*.26;c.beginPath();c.arc(mx,my,2.2,0,TAU);c.fill();c.beginPath();c.moveTo(mx-5,my+3);c.lineTo(mx+5,my+3);c.lineTo(mx+3.5,my+h*.6);c.lineTo(mx-3.5,my+h*.6);c.fill();c.fillRect(mx-.5,my+h*.6,1,h*.3);c.fillRect(mx-3,y+h*.92,6,1);}
    const r=rng(8);for(let k=0;k<5;k++){c.fillStyle=rgba(mix('#2a1418','#14202a',r()),.9);c.fillRect(x+w*.42+k*2.4,y+h*.62-r()*2,2,h*.38);}},
  books:(c,x,y,w,h)=>{const r=rng(12),cols=['#5a1420','#1a3a2a','#3a2a14','#14243a','#4a3a18','#2a1430'];
    for(const f of [.36,.66,.94]){const sy=y+h*f;c.fillStyle=rgba(C.ink,.88);c.fillRect(x+1.5,sy,w-3,.9);for(let bx=x+2;bx<x+w-3;){const bw=1+r()*1.3,bh=4+r()*3.4;c.fillStyle=rgba(mix(cols[(r()*cols.length)|0],'#000000',.3),.94);c.fillRect(bx,sy-bh,bw,bh);if(r()<.3){c.fillStyle=rgba(C.gold,.55);c.fillRect(bx,sy-bh*.7,bw,.3);}bx+=bw+.25;}}
    const gx=x+w*.82,gy=y+h*.14;c.fillStyle=rgba(C.ink,.9);c.fillRect(gx-.4,gy,1,4);c.beginPath();c.arc(gx,gy-1.5,3,0,TAU);c.fill();c.strokeStyle=rgba(C.gold,.6);c.lineWidth=.35;c.beginPath();c.arc(gx,gy-1.5,3.6,-2.4,.8);c.stroke();},
  oyster:(c,x,y,w,h)=>{const r=rng(14);
    // the bar along the window: a marble top, figures on stools, the ice and its shells catching the light
    c.fillStyle=rgba(C.ink,.85);for(const f of [.16,.38,.62,.84]){const fx=x+w*f+(r()-.5)*3,fy=y+h*.36;c.beginPath();c.arc(fx,fy,2,0,TAU);c.fill();c.beginPath();c.moveTo(fx-3.2,y+h*.78);c.quadraticCurveTo(fx-3,fy+3,fx,fy+2.4);c.quadraticCurveTo(fx+3,fy+3,fx+3.2,y+h*.78);c.fill();c.fillRect(fx-.4,y+h*.78,.8,h*.22);}
    c.fillStyle=lin(c,0,y+h*.7,0,y+h*.78,[[0,'#d8d0c8'],[1,'#7a7270']]);c.fillRect(x+1,y+h*.7,w-2,h*.06);c.fillStyle=rgba(C.ink,.8);c.fillRect(x+1,y+h*.76,w-2,h*.24);
    for(let k=0;k<26;k++){c.fillStyle=rgba(r()<.5?'#f0e8e0':'#c8c0c8',.7);c.beginPath();c.ellipse(x+3+r()*(w-6),y+h*.69,1,.45,0,0,TAU);c.fill();}},
  barber:(c,x,y,w,h)=>{c.fillStyle=rgba(C.ink,.9);const cx=x+w*.42,cy=y+h*.62;
    // the chair, a mirror behind it with the room in it
    c.fillRect(cx-5,cy,10,2);c.fillRect(cx-4.5,cy-8,2,8);c.fillRect(cx-1,cy+2,2,h*.3);c.fillRect(cx-4,y+h*.94,8,1.4);c.fillRect(cx+4,cy-3,1.6,4);c.fillRect(cx-6,cy-3,1.6,4);
    c.fillStyle=rgba('#d8e4ec',.16);c.fillRect(x+w*.62,y+h*.12,w*.3,h*.46);c.strokeStyle=rgba(C.gold,.55);c.lineWidth=.5;c.strokeRect(x+w*.62,y+h*.12,w*.3,h*.46);
    c.fillStyle=rgba(C.ink,.9);c.fillRect(x+2,y+h*.62,w*.18,1);for(let k=0;k<4;k++)c.fillRect(x+3+k*2.2,y+h*.62-2.6,1.2,2.6);}};
// a striped awning out over the pavement: the cloth sloping down from the fascia to a scalloped valance, its shadow on the glass below
function awning(c,a0,a1,ay,o){o=o||{};const dx=o.dx||-2.4,dy=o.dy||9,val=o.val||3.6,vy=ay+dy,cl=TX().awningCloth(o.seed||3,{a:o.a||'#6a141c',b:o.b||'#45101a',stripe:o.stripe||16});
  c.fillStyle=lin(c,0,ay,0,vy+12,[[0,rgba('#000000',.5)],[1,rgba('#000000',0)]]);c.fillRect(a0,ay,a1-a0,dy+12);
  c.save();c.beginPath();c.moveTo(a0,ay);c.lineTo(a1,ay);c.lineTo(a1+dx,vy);c.lineTo(a0+dx,vy);c.closePath();c.clip();
  const p=c.createPattern(cl,'repeat');if(p.setTransform)p.setTransform(new DOMMatrix([1,0,dx/dy,1,a0,ay]).scale(.25));c.fillStyle=p;c.fillRect(a0-6,ay,a1-a0+12,dy);
  c.fillStyle=lin(c,0,ay,0,vy,[[0,rgba('#000000',.6)],[1,rgba('#000000',.16)]]);c.fillRect(a0-6,ay,a1-a0+12,dy);
  // the cloth sags between the ribs of its frame
  const nr=Math.max(2,Math.round((a1-a0)/30)),rw=(a1-a0)/nr;c.strokeStyle=rgba('#000000',.4);c.lineWidth=.6;for(let i=1;i<nr;i++){const x=a0+i*rw;c.beginPath();c.moveTo(x,ay);c.lineTo(x+dx,vy);c.stroke();}
  c.restore();
  c.save();c.beginPath();c.moveTo(a0+dx,vy);for(let x=a0+dx;x<a1+dx-.1;x+=6){const x2=Math.min(x+6,a1+dx);c.lineTo(x,vy+val-1.2);c.quadraticCurveTo((x+x2)/2,vy+val+1.4,x2,vy+val-1.2);}c.lineTo(a1+dx,vy);c.closePath();c.clip();
  const p2=c.createPattern(cl,'repeat');if(p2.setTransform)p2.setTransform(new DOMMatrix().translate(a0+dx,vy).scale(.25));c.fillStyle=p2;c.fillRect(a0+dx,vy,a1-a0,val+2);
  c.fillStyle=rgba('#000000',.3);c.fillRect(a0+dx,vy,a1-a0,val+2);c.restore();
  c.fillStyle=rgba(C.gold,.6);c.fillRect(a0+dx,vy-.3,a1-a0,.6);c.fillStyle=rgba(C.rim,.22);c.fillRect(a0+dx,vy-.9,a1-a0,.5);}
// letters in elven light: cyan, burning a little into the glass round them
function elvenName(c,text,x,y,size){const font='italic 700 '+size+'px "Alegreya SC", Georgia, serif';c.save();c.font=font;const tw=c.measureText(text).width;c.restore();
  glow(c,x,y-size*.35,size*3.6,C.cyan,.2,.32);
  bloom(c,x-tw/2-2,y-size,tw+4,size*1.3,size*.4,.95,g=>{g.font=font;g.textAlign='center';g.fillStyle=C.cyan;g.fillText(text,x,y);});
  c.save();c.font=font;c.textAlign='center';c.globalCompositeOperation='lighter';c.fillStyle=rgba(C.cyanL,.92);c.fillText(text,x,y);c.restore();}
// neon: a glass tube bent to the letters, its colour bleeding into the dark round it
function neon(c,text,x,y,size,col,o){o=o||{};const font=(o.style||'italic 700')+' '+size+'px "Alegreya SC", Georgia, serif';c.save();c.font=font;const tw=c.measureText(text).width;c.restore();
  const tube=(g,lw,cl)=>{g.font=font;g.textAlign='center';g.lineJoin='round';g.strokeStyle=cl;g.lineWidth=lw;g.strokeText(text,x,y);};
  glow(c,x,y-size*.35,size*3.2,col,.26,.4);bloom(c,x-tw/2-2,y-size,tw+4,size*1.35,size*.45,1,g=>tube(g,size*.18,col));
  c.save();c.globalCompositeOperation='lighter';tube(c,size*.12,rgba(col,.8));tube(c,size*.05,rgba(o.core||'#ffd0d4',.95));c.restore();}
// a bulb of a sign's border: lit and noted, so the chaser can run along them
let BULB=null;function bulb(c,x,y){BULBS.push({x,y});if(BULB){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.5;c.drawImage(BULB,x-4,y-4,8,8);c.restore();}c.fillStyle=rgba('#ffe7b8',.85);c.beginPath();c.arc(x,y,.7,0,TAU);c.fill();}
// ---------- the shops ----------
const SHOP={
  tailor(c,b,gTop,base){shopfront(c,b.x0+6,b.x1-6,gTop,base,{name:'TAILOR',paint:'#16121c',size:7.5,lit:.6,lights:3,door:[b.x1-28,14],inside:GOODS.tailor});},
  books(c,b,gTop,base){const f=shopfront(c,b.x0+6,b.x1-6,gTop,base,{name:'BOOKS · MAPS',paint:'#0f1a14',size:6.5,lit:.6,lights:3,door:[b.x0+12,14],inside:GOODS.books});
    awning(c,b.x0+10,b.x1-10,gTop+12,{a:'#1c3a2c',b:'#c8bfa0',stripe:16,seed:5});},
  oyster(c,b,gTop,base){const f=shopfront(c,b.x0+6,b.x1-6,gTop,base,{name:'OYSTER BAR',paint:'#0c1418',size:6.8,lit:.7,lights:2,door:[b.x1-28,15],inside:GOODS.oyster,reflCol:'#ffa070'});
    // the name again in red neon, hung in the window
    neon(c,'Oysters',(f.win0+f.win1)/2,f.wy+10,9.5,'#ff3a50');REFL.push({x:(f.win0+f.win1)/2,w:28,y:f.wy+8,col:'#ff4a5a',a:.2});
    // and a little neon shell over the door
    const sx=b.x1-21,sy=gTop-12,shell=(g,lw,cl)=>{g.strokeStyle=cl;g.lineWidth=lw;g.lineCap='round';g.beginPath();for(let k=-3;k<=3;k++){g.moveTo(sx,sy+4);g.lineTo(sx+k*1.6,sy-1.8+Math.abs(k)*.5);}g.moveTo(sx-5.4,sy);g.quadraticCurveTo(sx,sy-6.5,sx+5.4,sy);g.stroke();};
    bloom(c,sx-7,sy-8,14,14,2,1,g=>shell(g,1.2,'#ff3a50'));c.save();c.globalCompositeOperation='lighter';shell(c,.6,rgba('#ffc8cc',.9));c.restore();},
  barber(c,b,gTop,base){shopfront(c,b.x0+6,b.x1-6,gTop,base,{name:'BARBER',paint:'#14141c',size:7,lit:.45,lights:2,door:[b.x0+14,14],inside:GOODS.barber});
    barberPole(c,b.x0+40,gTop+16,24);},
  pawn(c,b,gTop,base){shopfront(c,b.x0+6,b.x1-6,gTop,base,{name:'PAWN · LOANS',paint:'#1a1410',size:6.4,shut:true,seed:b.seed});
    // the three gilt balls on their bracket
    c.strokeStyle=C.gold;c.lineWidth=.8;c.beginPath();c.moveTo(b.x0+10,gTop-4);c.lineTo(b.x0+10,gTop-15);c.lineTo(b.x0+21,gTop-15);c.stroke();scroll(c,b.x0+13,gTop-11,2.4,1,C.gold,.5,1.2);
    for(const [dx,dy] of [[-4,0],[4,0],[0,6]]){c.fillStyle=rad(c,b.x0+20+dx,gTop-10+dy,0,2.8,[[0,C.goldL],[.6,C.gold],[1,C.goldDD]]);c.beginPath();c.arc(b.x0+21+dx,gTop-9+dy,2.4,0,TAU);c.fill();}},
  cafe(c,b,gTop,base){cafe(c,b,gTop,base);},
  hotel(c,b,gTop,base){hotelFront(c,b,gTop,base);}};
// the barber's pole: a glass drum striped red and cream, lit from within, under a gilt cap
function barberPole(c,x,y,h){const w=4.6;c.save();c.beginPath();c.rect(x-w/2,y,w,h);c.clip();c.fillStyle='#e8dcc4';c.fillRect(x-w/2,y,w,h);
  c.fillStyle='#b02830';for(let k=-3;k<h/4+3;k++){c.beginPath();c.moveTo(x-w/2,y+k*4);c.lineTo(x+w/2,y+k*4-2.8);c.lineTo(x+w/2,y+k*4-1.2);c.lineTo(x-w/2,y+k*4+1.6);c.closePath();c.fill();}
  c.fillStyle=lin(c,x-w/2,0,x+w/2,0,[[0,rgba('#000000',.4)],[.38,rgba('#ffffff',.14)],[1,rgba('#000000',.55)]]);c.fillRect(x-w/2,y,w,h);c.restore();
  for(const yy of [y-2.2,y+h]){c.fillStyle=lin(c,x-3,0,x+3,0,[[0,C.goldD],[.5,C.goldL],[1,C.goldD]]);c.fillRect(x-3,yy,6,2.2);}
  c.fillStyle=C.gold;c.beginPath();c.arc(x,y-3.4,1.4,0,TAU);c.fill();c.fillStyle='#0a0709';c.fillRect(x-.5,y+h+2.2,1,3);c.fillRect(x-2,y+h+4.4,4,1);
  glow(c,x,y+h/2,15,'#ffc0a0',.28,1.6);REFL.push({x,w:6,y:y+h/2,col:'#ff8a7a',a:.12});}
// the elven café: mahogany and black glass, the house's name burning in elven light, a striped awning over two big lights full of
// people at little tables with cyan lamps on them, a glazed door between
function cafe(c,b,gTop,base){const x0=b.x0+5,x1=b.x1-5,w=x1-x0,o={paint:'#0d1a15'},fh=13,P=6,cx=(x0+x1)/2;
  timber(c,o,x0,gTop,w,base-gTop);
  fascia(c,x0+P,gTop,w-2*P,fh,{});elvenName(c,'Vaelis',cx,gTop+fh*.78,10);
  vine(c,[{x:x0+P+3,y:gTop+fh/2},{x:cx-18,y:gTop+fh/2}],{w:.5,amp:1.2,wave:7,leaf:1.4,every:2,seed:3,shadow:false});vine(c,[{x:cx+18,y:gTop+fh/2},{x:x1-P-3,y:gTop+fh/2}],{w:.5,amp:1.2,wave:7,leaf:1.4,every:2,seed:4,shadow:false});
  for(const px of [x0,x1-P]){timber(c,o,px,gTop,P,base-gTop,true);c.fillStyle=rgba(C.rim,.22);c.fillRect(px+P-.7,gTop,.5,base-gTop);stone(c,px-.4,base-4,P+.8,4,{lit:.2,dark:.55});scroll(c,px+P/2,gTop+fh+3,1.8,px===x0?1:-1,C.gold,.5,1.3);}
  const wy=gTop+fh+4,st=9,wh=base-st-wy,dw=16,dx=cx-dw/2;
  for(const [a,bb] of [[x0+P+1,dx-3],[dx+dw+3,x1-P-1]]){windowPane(c,a,wy,bb-a,wh,.95,{mull:0,fw:.01,frame:'#0a0808',spill:false});cafeInside(c,a,wy,bb-a,wh,a);
    timber(c,o,a,wy+wh*.3,bb-a,1.3);c.strokeStyle='#060405';c.lineWidth=.8;c.strokeRect(a,wy,bb-a,wh);glassSheen(c,a,wy,bb-a,wh,.04);
    c.save();c.font='italic 700 3.6px "Alegreya SC", Georgia, serif';c.textAlign='center';c.fillStyle=rgba(C.goldL,.75);c.fillText(a<cx?'café · thé':'patisserie',(a+bb)/2,wy+wh*.3+5);c.restore();
    panel(c,o,a+1,wy+wh+2.2,bb-a-2,st-3.6);timber(c,o,a-1.5,wy+wh,bb-a+3,1.3);c.fillStyle=rgba(C.rim,.35);c.fillRect(a-1.5,wy+wh,bb-a+3,.45);
    SPILL.push({x0:a,x1:bb,a:.75});REFL.push({x:(a+bb)/2,w:(bb-a)*.5,y:wy+wh*.6,col:'#ffb866',a:.2});}
  shopDoor(c,o,dx,wy-2,dw,base,.85);
  awning(c,x0+P,x1-P,gTop+fh+1,{a:'#173028',b:'#d8cfb4',stripe:16,seed:7,dy:10});
  REFL.push({x:cx,w:30,y:gTop+6,col:C.cyan,a:.16});}
// inside the café: the far wall's warm light, people at little tables, a cyan lamp of elven glass on each table
function cafeInside(c,x,y,w,h,seed){const r=rng(seed|0);c.save();c.beginPath();c.rect(x,y,w,h);c.clip();
  c.fillStyle=rgba('#3a1a10',.35);c.fillRect(x,y,w,h*.25);
  for(let k=0;k<3;k++){const tx=x+w*(.2+k*.3)+(r()-.5)*3,ty=y+h*.74;
    for(const s of [-1,1]){if(r()<.25)continue;const fx=tx+s*5.2,fy=ty-11;c.fillStyle=rgba(C.ink,.88);c.beginPath();c.arc(fx,fy,2,0,TAU);c.fill();
      c.beginPath();c.moveTo(fx-s*1.6,fy-.6);c.lineTo(fx-s*3.6,fy-2.6);c.lineTo(fx-s*1.4,fy+.6);c.fill();  // the ear
      c.beginPath();c.moveTo(fx-3.2,ty+6);c.quadraticCurveTo(fx-3,fy+3,fx,fy+2.4);c.quadraticCurveTo(fx+3,fy+3,fx+3.2,ty+6);c.fill();}
    c.fillStyle=rgba(C.ink,.92);c.fillRect(tx-4,ty,8,1.1);c.fillRect(tx-.5,ty,1,h*.3);
    c.fillStyle=rgba(C.cyanL,.95);c.beginPath();c.arc(tx,ty-1.6,.9,0,TAU);c.fill();glow(c,tx,ty-1.6,7,C.cyan,.5);}
  c.restore();}
// the Lyric: a picture house in pale stucco, its middle bay stepping up to a crown, the name on black ringed with bulbs, a tall window
// with a gilt sunburst, and over the doors a marquee with tonight's picture on its board, bulbs along every edge
function cinema(c,b){const base=FB(),x0=b.x0,x1=b.x1,w=x1-x0,top=b.top,gTop=base-66,cx=(x0+x1)/2,r=rng(b.seed),B0=cx-44,B1=cx+44;
  const wall=()=>{c.beginPath();c.moveTo(x0,base);c.lineTo(x0,top);c.lineTo(B0,top);c.lineTo(B0,top-10);c.lineTo(B0+15,top-10);c.lineTo(B0+15,top-21);c.lineTo(B1-15,top-21);c.lineTo(B1-15,top-10);c.lineTo(B1,top-10);c.lineTo(B1,top);c.lineTo(x1,top);c.lineTo(x1,base);c.closePath();};
  c.save();wall();c.clip();c.fillStyle=patAt(c,TX().plaster(b.seed,128,128,{base:'#4a3e44'}),x0,top-21,.7);c.fillRect(x0,top-21,w,base-top+21);
  c.fillStyle=lin(c,0,top-21,0,base,[[0,rgba('#04030a',.76)],[1,rgba('#04030a',.6)]]);c.fillRect(x0,top-21,w,base-top+21);
  c.strokeStyle=rgba('#000000',.42);c.lineWidth=.55;c.beginPath();for(let y=top+6;y<gTop-8;y+=6){c.moveTo(x0,y);c.lineTo(B0-8,y);c.moveTo(B1+8,y);c.lineTo(x1,y);}c.stroke();
  c.fillStyle=lin(c,0,top-21,0,top+10,[[0,rgba('#030206',.5)],[1,rgba('#030206',0)]]);c.fillRect(x0,top-21,w,31);c.restore();
  // the copings, each step's edge gilt
  for(const [a,bb,y] of [[x0-2,B0+2,top],[B1-2,x1+2,top],[B0-2,B0+17,top-10],[B1-17,B1+2,top-10],[B0+13,B1-13,top-21]]){stone(c,a,y-2.6,bb-a,3,{dark:.55,lit:.3});c.fillStyle=rgba(C.gold,.55);c.fillRect(a,y+.4,bb-a,.5);}
  // pilasters between the bays, fluted, each under a gilt fin
  for(const px of [x0,B0-8,B1,x1-8]){stone(c,px,top+1,8,gTop-top-7,{dark:.56,lit:.2});c.fillStyle=rgba('#000000',.3);for(const f of [2,4,6])c.fillRect(px+f-.2,top+4,.4,gTop-top-14);
    c.fillStyle=lin(c,px,0,px+8,0,[[0,C.goldD],[.5,C.goldL],[1,C.goldD]]);c.beginPath();c.moveTo(px+1.5,top+1);c.lineTo(px+4,top-13);c.lineTo(px+6.5,top+1);c.closePath();c.fill();}
  // the side bays: two floors of windows
  for(const [a,bb] of [[x0+8,B0-8],[B1+8,x1-8]])for(let i=0;i<2;i++)for(let j=0;j<2;j++){const ww=13,wh=24,wx=a+(j+.5)*(bb-a)/2-ww/2,wy=top+16+i*46,lit=r()<.35?.5+r()*.4:0;
    c.fillStyle=rgba('#000000',.55);c.fillRect(wx-1,wy-.5,ww+2,wh+.5);windowPane(c,wx,wy,ww,wh,lit,{mull:2,rows:[.36],fw:1,r,sky:'#121628'});stone(c,wx-2,wy+wh,ww+4,2.2,{lit:.3});
    c.fillStyle=rgba(C.gold,.5);c.fillRect(wx-1,wy-2.6,ww+2,.6);}
  // the name: LYRIC in gilt on black, ringed with bulbs
  const ny0=top+6,ny1=top+38,nx0=B0+5,nx1=B1-5;c.fillStyle='#050407';c.fillRect(nx0,ny0,nx1-nx0,ny1-ny0);c.strokeStyle=rgba(C.gold,.85);c.lineWidth=.8;c.strokeRect(nx0+2.4,ny0+2.4,nx1-nx0-4.8,ny1-ny0-4.8);
  bloom(c,nx0,ny0,nx1-nx0,ny1-ny0,3.2,.55,g=>{g.font='700 19px "Alegreya SC", Georgia, serif';g.textAlign='center';g.letterSpacing='3px';g.fillStyle=C.amber;g.fillText('LYRIC',cx,ny1-8.5);});gilt(c,'LYRIC',cx,ny1-8.5,19,{style:'700',track:3});
  for(let x=nx0+1.5;x<=nx1-1.4;x+=3.6)bulb(c,x,ny0-1.6);for(let y=ny0+2;y<=ny1-1;y+=3.6)bulb(c,nx1+1.6,y);for(let x=nx1-1.5;x>=nx0+1.4;x-=3.6)bulb(c,x,ny1+1.6);for(let y=ny1-2;y>=ny0+1;y-=3.6)bulb(c,nx0-1.6,y);
  REFL.push({x:cx,w:44,y:(ny0+ny1)/2,col:'#ffd890',a:.12});
  // the tall window under it: dim inside, a gilt sunburst in its head
  {const wx0=cx-20,wx1=cx+20,wy0=ny1+10,wy1=gTop-20,ar=20,yc=wy0+ar;c.fillStyle=rgba('#000000',.6);c.fillRect(wx0-2,yc,44,wy1-yc+2);c.beginPath();c.arc(cx,yc,ar+2,Math.PI,0);c.fill();
    windowPane(c,wx0,wy0,40,wy1-wy0,.35,{arch:true,mull:0,fw:1.2,spill:false});
    c.save();c.beginPath();c.arc(cx,yc,ar,Math.PI,0);c.clip();c.strokeStyle=rgba(C.gold,.7);c.lineWidth=.7;c.beginPath();for(let k=0;k<=8;k++){const a=Math.PI+k*Math.PI/8;c.moveTo(cx,yc);c.lineTo(cx+Math.cos(a)*ar,yc+Math.sin(a)*ar);}c.stroke();
    c.beginPath();c.arc(cx,yc,ar*.45,Math.PI,0);c.stroke();c.restore();c.fillStyle=rgba(C.gold,.75);c.fillRect(wx0,yc-.4,40,.8);
    c.strokeStyle=rgba(C.gold,.55);c.lineWidth=.5;c.beginPath();for(let x=wx0+8;x<wx1;x+=8){c.moveTo(x,yc);c.lineTo(x,wy1);}c.stroke();stone(c,wx0-3,wy1,46,2.4,{lit:.32});}
  // the entrance: doors of lit glass either side of the ticket booth, the posters for what is coming in lit cases
  const mx0=cx-98,mx1=cx+98,my=gTop-14,ddx=-2.8,ddy=10.5,fh=18,fy0=my+ddy,fy1=fy0+fh;
  {const ey=fy1;c.fillStyle=lin(c,0,ey,0,base,[[0,'#140d0c'],[1,'#0a0708']]);c.fillRect(mx0+4,my,mx1-mx0-8,base-my);
    for(const k of [-3,-2,1,2]){const dx=cx+k*17-(k>0?17:0)+ (k>0?2:-2);windowPane(c,dx,ey+5,15,base-ey-7,.95,{mull:1,fw:.9,rows:[.5],spill:false});c.fillStyle=lin(c,0,ey+20,0,ey+24,[[0,C.goldL],[1,C.goldD]]);c.fillRect(dx+2,ey+(base-ey)*.5,11,1.4);}
    // the booth: a little glass house with an arched top, a face at its grille
    const bx=cx-9;c.fillStyle='#1a0e0a';c.fillRect(bx-1,ey+3,20,base-ey-3);windowPane(c,bx+2,ey+6,14,18,.95,{arch:true,mull:0,fw:.8,spill:false});c.fillStyle=rgba(C.ink,.85);c.beginPath();c.arc(cx,ey+16,2.2,0,TAU);c.fill();c.fillRect(cx-3.4,ey+19,6.8,5);
    c.fillStyle=lin(c,0,ey+24,0,ey+26,[[0,C.goldL],[1,C.goldD]]);c.fillRect(bx,ey+24,18,1.6);panel(c,{paint:'#2a120c'},bx+1,ey+27,16,base-ey-30);
    for(const px of [mx0+10,mx1-38]){c.fillStyle=lin(c,0,ey+8,0,ey+44,[[0,C.goldL],[1,C.goldD]]);c.fillRect(px-1.2,ey+7,30.4,38.4);c.fillStyle='#0a0708';c.fillRect(px,ey+8,28,36);
      const pr=rng(px|0),hue=px<cx?['#7a2a1c','#e8b060','#1a0c0a']:['#1a3a4a','#e0d0a0','#08101a'];c.fillStyle=lin(c,0,ey+9,0,ey+43,[[0,hue[0]],[.6,mix(hue[0],hue[2],.5)],[1,hue[2]]]);c.fillRect(px+1.5,ey+9.5,25,33);
      c.fillStyle=rgba(hue[1],.8);c.beginPath();c.arc(px+14,ey+19,5,0,TAU);c.fill();c.fillStyle=rgba('#050407',.9);c.beginPath();c.moveTo(px+6,ey+42.5);c.quadraticCurveTo(px+8,ey+24,px+12,ey+23);c.lineTo(px+12.8,ey+20);c.lineTo(px+14,ey+22.5);c.quadraticCurveTo(px+19,ey+26,px+20,ey+42.5);c.fill();
      c.fillStyle=rgba(hue[1],.9);c.fillRect(px+4,ey+37.5,20,1.4);c.fillRect(px+7,ey+40,14,.8);glassSheen(c,px,ey+8,28,36,.05);
      glow(c,px+14,ey+26,26,'#ffd8a0',.12);}
    for(let i=0;i<2;i++)stone(c,mx0+8-i*3,base-3.8+i*1.9,mx1-mx0-16+i*6,2.2,{lit:.32,dark:.48});}
  // the marquee: its top seen from above, the board on its face lit from behind, bulbs along both edges, gilt between
  c.fillStyle='#0c0a0e';c.beginPath();c.moveTo(mx0,my);c.lineTo(mx1,my);c.lineTo(mx1+ddx,fy0);c.lineTo(mx0+ddx,fy0);c.closePath();c.fill();
  c.fillStyle=lin(c,0,my,0,fy0,[[0,rgba('#ffcf86',.05)],[1,rgba('#ffcf86',.16)]]);c.fill();
  const fx0=mx0+ddx,fx1=mx1+ddx;c.fillStyle=lin(c,0,fy0,0,fy1,[[0,'#1c1418'],[1,'#0a080b']]);c.fillRect(fx0,fy0,fx1-fx0,fh);
  c.fillStyle=lin(c,0,fy0+3.6,0,fy1-3.6,[[0,'#f6e8c6'],[1,'#e0c690']]);c.fillRect(fx0+7,fy0+3.6,fx1-fx0-14,fh-7.2);
  c.save();c.textAlign='center';c.fillStyle='#1a0f0c';c.font='700 6.6px "Alegreya SC", Georgia, serif';c.letterSpacing='.8px';c.fillText('TONIGHT · THE GILDED HOUR',cx+ddx,fy0+11.6);c.restore();
  c.fillStyle=lin(c,0,fy0,0,fy0+2,[[0,C.goldL],[1,C.goldD]]);c.fillRect(fx0,fy0,fx1-fx0,1.2);c.fillRect(fx0,fy1-1.2,fx1-fx0,1.2);c.fillRect(fx0,fy0,1.2,fh);c.fillRect(fx1-1.2,fy0,1.2,fh);
  for(let x=fx0+3.5;x<=fx1-3.4;x+=3.6)bulb(c,x,fy0+2.2);for(let x=fx1-3.5;x>=fx0+3.4;x-=3.6)bulb(c,x,fy1-2.2);
  // its light on the doors under it and out over the flags
  glow(c,cx+ddx,fy1+8,120,'#ffd58a',.32,.32);
  SPILL.push({x0:mx0+10,x1:mx1-10,a:1.5});REFL.push({x:cx+ddx,w:120,y:fy1+6,col:'#ffd890',a:.22},{x:cx+ddx,w:60,y:fy0+8,col:'#fff0c8',a:.14});
  lampWash(c,x0,x1,top-21,base);}
// the Hotel Argent's ground floor: rusticated stone, the lounge's tall arched windows with chandeliers in them, glass doors under a
// canopy on gilt rods with the house's name along its edge, bay trees in tubs either side, and the house's banners over all
function hotelFront(c,b,gTop,base){const x0=b.x0,x1=b.x1,w=x1-x0,cx=(x0+x1)/2;
  c.save();c.beginPath();c.rect(x0,gTop,w,base-gTop);c.clip();c.fillStyle=patAt(c,TX().granite(61,96,96,{base:'#6e6660'}),x0,gTop,.25);c.fillRect(x0,gTop,w,base-gTop);c.fillStyle=rgba('#05040a',.6);c.fillRect(x0,gTop,w,base-gTop);
  c.beginPath();for(let y=gTop,k=0;y<base;y+=6.4,k++){c.moveTo(x0,y);c.lineTo(x1,y);for(let x=x0-(k%2)*9;x<x1;x+=18){c.moveTo(x,y);c.lineTo(x,y+6.4);}}c.strokeStyle=rgba('#000000',.7);c.lineWidth=.7;c.stroke();
  c.fillStyle=rgba(C.rim,.16);for(let y=gTop+.7;y<base;y+=6.4)c.fillRect(x0,y,w,.45);c.restore();
  for(const ax of [x0+12,x0+44,x1-66,x1-34]){c.fillStyle=rgba('#000000',.6);c.fillRect(ax-2,gTop+9,26,base-gTop-11);windowPane(c,ax,gTop+11,22,base-gTop-21,.9,{arch:true,mull:2,rows:[.32],fw:1,spillA:.05});
    glow(c,ax+11,gTop+25,13,'#ffd9a0',.5);c.fillStyle=rgba('#fff1cf',.9);for(let k=-2;k<=2;k++)c.fillRect(ax+11+k*2.1-.35,gTop+24+Math.abs(k)*.7,.7,.7);c.fillStyle=rgba(C.ink,.7);c.fillRect(ax+10.7,gTop+11,.6,12);
    stone(c,ax-2.4,base-10,26.8,2.4,{lit:.35});SPILL.push({x0:ax,x1:ax+22,a:.55});REFL.push({x:ax+11,w:12,y:gTop+38,col:'#ffc070',a:.15});}
  const dw=40,dx=cx-dw/2;c.fillStyle='#07060a';c.fillRect(dx-4,gTop+6,dw+8,base-gTop-6);stone(c,dx-6,gTop+3,dw+12,3.4,{lit:.35});
  for(let k=0;k<2;k++)windowPane(c,dx+k*dw/2+1,gTop+12,dw/2-2,base-gTop-15,.95,{mull:1,rows:[.5],fw:.8,spill:false});c.fillStyle=C.gold;c.fillRect(cx-.4,gTop+12,.8,base-gTop-15);
  c.fillStyle=lin(c,0,base-30,0,base-27,[[0,C.goldL],[1,C.goldD]]);c.fillRect(dx+4,base-30,dw-8,1.4);
  for(let i=0;i<3;i++)stone(c,dx-6-i*4,base-5.6+i*1.9,dw+12+i*8,2.2,{lit:.34,dark:.48});
  SPILL.push({x0:dx,x1:dx+dw,a:1.1});REFL.push({x:cx,w:30,y:gTop+30,col:'#ffd090',a:.18});
  // the canopy
  const ay=gTop+1,ax0=dx-16,ax1=dx+dw+16,ddx=-4,ddy=15,fh=6.4;
  c.fillStyle='#0c0a0f';c.beginPath();c.moveTo(ax0,ay);c.lineTo(ax1,ay);c.lineTo(ax1+ddx,ay+ddy);c.lineTo(ax0+ddx,ay+ddy);c.closePath();c.fill();c.fillStyle=lin(c,0,ay,0,ay+ddy,[[0,rgba('#ffcf86',.04)],[1,rgba('#ffcf86',.14)]]);c.fill();
  c.strokeStyle=C.gold;c.lineWidth=.6;c.beginPath();for(const f of [.15,.85]){const px=lerp(ax0,ax1,f);c.moveTo(px,ay-14);c.lineTo(px+ddx,ay+ddy);}c.stroke();
  const fx0=ax0+ddx,fx1=ax1+ddx,fy=ay+ddy;c.fillStyle=lin(c,0,fy,0,fy+fh,[[0,'#1c171d'],[1,'#08070a']]);c.fillRect(fx0,fy,fx1-fx0,fh);c.fillStyle=lin(c,0,fy,0,fy+1.2,[[0,C.goldL],[1,C.goldD]]);c.fillRect(fx0,fy,fx1-fx0,1);c.fillRect(fx0,fy+fh-.8,fx1-fx0,.8);
  gilt(c,'HOTEL  ARGENT',(fx0+fx1)/2,fy+fh-1.6,4.6,{style:'700',track:1});
  for(let x=fx0+3;x<=fx1-3;x+=4.5){c.fillStyle=rgba('#fff0cf',.9);c.fillRect(x-.4,fy+fh+.2,.8,.8);}glow(c,cx+ddx,fy+fh+6,46,'#ffd9a0',.3,.5);
  // the banners down the front, wine and gold
  for(const bx of [x0+70,x1-78]){const by=b.top+14,bh=60;c.fillStyle=rgba('#000000',.4);c.fillRect(bx+1,by+1,9,bh);c.fillStyle=lin(c,bx,0,bx+8,0,[[0,'#3a0c14'],[.5,'#6a1a24'],[1,'#2a080e']]);c.beginPath();c.moveTo(bx,by);c.lineTo(bx+8,by);c.lineTo(bx+8,by+bh);c.lineTo(bx+4,by+bh-4);c.lineTo(bx,by+bh);c.closePath();c.fill();
    c.fillStyle=C.gold;c.fillRect(bx-1,by-1.4,10,1.4);c.fillRect(bx+.8,by+3,.5,bh-8);c.fillRect(bx+6.7,by+3,.5,bh-8);c.beginPath();c.arc(bx+4,by+18,2.4,0,TAU);c.fill();c.fillStyle='#4a1018';c.beginPath();c.arc(bx+4.9,by+17.4,2,0,TAU);c.fill();
    c.fillStyle=rgba(C.goldL,.9);c.fillRect(bx+3.6,by+24,.8,8);}
  bayTree(c,dx-14,yP(236));bayTree(c,dx+dw+14,yP(236));}
// a clipped bay tree in a black tub with brass bands
function bayTree(c,x,y){const r=rng((x*7)|0),cy=y-21,R=5.5;
  c.fillStyle=rgba('#000000',.5);c.beginPath();c.ellipse(x+1,y,6.5,1.5,0,0,TAU);c.fill();
  c.fillStyle=lin(c,x-4,0,x+4,0,[[0,'#060508'],[.62,'#1c1820'],[1,'#08070a']]);c.beginPath();c.moveTo(x-4,y-7);c.lineTo(x+4,y-7);c.lineTo(x+3.3,y);c.lineTo(x-3.3,y);c.closePath();c.fill();
  c.fillStyle=lin(c,x-4,0,x+4,0,[[0,C.goldD],[.6,C.goldL],[1,C.goldD]]);c.fillRect(x-3.9,y-6.3,7.8,.7);c.fillRect(x-3.5,y-1.8,7,.7);
  c.fillStyle='#0a0705';c.fillRect(x-4.3,y-7.6,8.6,1);c.fillStyle='#120c08';c.fillRect(x-.5,y-16,1,9);
  c.fillStyle='#070c08';c.beginPath();c.arc(x,cy,R,0,TAU);c.fill();
  for(let i=0;i<80;i++){const a=r()*TAU,rr=Math.sqrt(r())*R,lx=x+Math.cos(a)*rr,ly=cy+Math.sin(a)*rr*.95,k=clamp((cy-ly)/R*.35+(lx-x)/R*.25+.35,0,1);
    c.fillStyle=mix('#0a140c',r()<.5?'#3e5a2e':'#56682f',k*.55);c.beginPath();c.ellipse(lx,ly,1,.55,r()*Math.PI,0,TAU);c.fill();}
  c.strokeStyle=rgba('#ffb866',.35);c.lineWidth=.6;c.beginPath();c.arc(x,cy,R-.2,-Math.PI*.95,-Math.PI*.15);c.stroke();}
// a café table on the pavement: a marble top on an iron foot, a bentwood chair either side
function cafeTable(c,x,y){c.fillStyle=rgba('#000000',.45);c.beginPath();c.ellipse(x+1,y,11,1.8,0,0,TAU);c.fill();
  for(const s of [-1,1]){const cx=x+s*8;c.strokeStyle='#0b080a';c.lineWidth=1;c.lineCap='round';c.beginPath();c.moveTo(cx-2.8*s,y);c.lineTo(cx-2.2*s,y-9);c.lineTo(cx+2.6*s,y-9.5);c.lineTo(cx+3*s,y);c.moveTo(cx+2.6*s,y-9.5);c.quadraticCurveTo(cx+4.4*s,y-16,cx+3*s,y-20);c.quadraticCurveTo(cx+.6*s,y-21,cx-.2*s,y-17);c.stroke();
    c.strokeStyle=rgba(C.rim,.32);c.lineWidth=.4;c.beginPath();c.moveTo(cx-2.2*s,y-9.3);c.lineTo(cx+2.6*s,y-9.8);c.stroke();}
  c.fillStyle='#0a0709';c.fillRect(x-.7,y-13,1.4,13);c.beginPath();c.ellipse(x,y-.4,3.4,.9,0,0,TAU);c.fill();
  c.fillStyle=lin(c,x-7,0,x+7,0,[[0,'#5a5258'],[.45,'#8a8288'],[1,'#3e383c']]);c.beginPath();c.ellipse(x,y-13.6,6.6,1.5,0,0,TAU);c.fill();c.fillStyle=rgba('#000000',.3);c.fill();
  c.fillStyle=rgba(C.rim,.45);c.fillRect(x-5.5,y-15,11,.45);c.fillStyle=rgba('#ffe6b0',.55);c.fillRect(x-2.4,y-17.2,1,2.6);c.fillStyle=rgba('#f0e8e0',.6);c.fillRect(x+1.2,y-16,2,1.4);}
// the menu in chalk on a slate, on a mahogany easel
function chalkBoard(c,x,y){const bw=10,bh=14,tx=x-bw/2,ty=y-bh-1;
  c.fillStyle=rgba('#000000',.5);c.beginPath();c.ellipse(x+1,y,7.5,1.5,0,0,TAU);c.fill();
  c.fillStyle='#1c0d08';c.beginPath();c.moveTo(tx+.8,ty);c.lineTo(tx+bw-.8,ty);c.lineTo(tx+bw,y);c.lineTo(tx+bw-1.4,y);c.lineTo(tx+bw-1.7,ty+bh);c.lineTo(tx+1.7,ty+bh);c.lineTo(tx+1.4,y);c.lineTo(tx,y);c.closePath();c.fill();
  c.fillStyle=rgba(C.rim,.32);c.fillRect(tx+.8,ty,bw-1.6,.5);c.fillStyle=lin(c,0,ty,0,ty+bh,[[0,'#1a1c20'],[1,'#101216']]);c.fillRect(tx+1.5,ty+1.4,bw-3,bh-2.8);
  c.save();c.font='italic 700 2.7px "Alegreya SC", Georgia, serif';c.textAlign='center';c.fillStyle=rgba('#ece6da',.82);c.fillText('ce soir',x,ty+4.2);c.restore();
  const r=rng(5);c.strokeStyle=rgba('#ece6da',.5);c.lineWidth=.32;for(let k=0;k<4;k++){const ly=ty+5.8+k*1.8,l=4+r()*2.4;c.beginPath();c.moveTo(x-l/2,ly);for(let s=0;s<=l;s+=.6)c.lineTo(x-l/2+s,ly+(r()-.5)*.35);c.stroke();}}
// an alley between two houses: a dark slot, a back door's glow deep in it, a fire escape zigzagging up one wall, bins
function alley(c,a0,a1,top){const base=FB();c.fillStyle=lin(c,0,top,0,base,[[0,'#07060b'],[1,'#140c0e']]);c.fillRect(a0,top,a1-a0,base-top);
  glow(c,(a0+a1)/2,base-16,30,'#ff9a5a',.32,1.3);c.strokeStyle='#040306';c.lineWidth=.8;for(let y=base-118;y<base-30;y+=22){c.beginPath();c.moveTo(a0,y);c.lineTo(a1,y-7);c.stroke();c.beginPath();c.moveTo(a0,y+.5);c.lineTo(a1,y+.5);c.stroke();}
  c.strokeStyle=rgba(C.rim,.12);c.lineWidth=.4;for(let y=base-118;y<base-30;y+=22){c.beginPath();c.moveTo(a0,y-.6);c.lineTo(a1,y-7.6);c.stroke();}
  for(const bx of [a0+4,a0+10]){c.fillStyle=lin(c,bx,0,bx+5,0,[[0,'#08080b'],[.6,'#1a1a20'],[1,'#08080b']]);c.fillRect(bx,base-9,5,9);c.fillStyle='#0e0e12';c.fillRect(bx-.5,base-10,6,1.4);c.fillStyle=rgba(C.rim,.25);c.fillRect(bx-.5,base-10,6,.4);}}
// the little square between the pawnshop and the bookshop: gilt-tipped railings, two trees and a hedge, and on its plinth an elf in
// bronze holding up a lantern that still burns with elven light
function square(c,x0,x1){const base=FB(),r=rng(19),bk=base-34,hT=BAND.mid.y1-8,cx=(x0+x1)/2;
  c.fillStyle=lin(c,0,bk,0,base,[[0,'#100d12'],[1,'#1a1418']]);c.fillRect(x0,bk,x1-x0,base-bk+1);
  for(let i=0;i<60;i++){c.fillStyle=rgba(r()<.5?'#2a2228':'#06050a',.5);c.fillRect(x0+r()*(x1-x0),bk+r()*(base-bk),1+r()*2,.6);}
  // the hedge at the back, clipped flat, the moon along its top
  c.fillStyle=lin(c,0,hT,0,bk,[[0,'#0b120d'],[1,'#070a08']]);c.fillRect(x0,hT,x1-x0,bk-hT+2);
  for(let i=0;i<260;i++){const lx=x0+r()*(x1-x0),ly=hT+r()*(bk-hT),k=clamp(1-(ly-hT)/14,0,1);c.fillStyle=mix('#070c08',r()<.5?'#2e4630':'#3a4a34',.25+k*.45*r());c.beginPath();c.ellipse(lx,ly,1.2,.6,r()*Math.PI,0,TAU);c.fill();}
  c.fillStyle=rgba('#9aa6d0',.14);c.fillRect(x0,hT,x1-x0,.8);
  // two trees, their crowns over the hedge against the city behind
  for(const [tx,tr] of [[x0+24,30],[x1-22,26]]){c.fillStyle='#08070a';c.fillRect(tx-1.6,hT-6,3.2,bk-hT+6);
    const cyy=hT-tr*.7;for(let k=0;k<11;k++){const a=k/11*TAU,px=tx+Math.cos(a)*tr*.62,py=cyy+Math.sin(a)*tr*.42;c.fillStyle=lin(c,0,py-tr*.5,0,py+tr*.5,[[0,'#0d1310'],[1,'#080b09']]);c.beginPath();c.arc(px,py,tr*.48,0,TAU);c.fill();}
    for(let i=0;i<140;i++){const a=r()*TAU,rr=Math.sqrt(r())*tr,lx=tx+Math.cos(a)*rr*1.05,ly=cyy+Math.sin(a)*rr*.82,k=clamp((cyy-ly)/tr*.5+(tx-lx)/tr*.35+.3,0,1);
      c.fillStyle=mix('#070b08',r()<.5?'#2a3c30':'#34443a',k*.6);c.beginPath();c.ellipse(lx,ly,1.5,.8,r()*Math.PI,0,TAU);c.fill();}
    c.strokeStyle=rgba('#a8b4d8',.22);c.lineWidth=.6;c.beginPath();c.arc(tx-2,cyy-2,tr*.95,-Math.PI*.9,-Math.PI*.45);c.stroke();}
  // the statue on its plinth
  const sx=cx+4,py=bk+5;stone(c,sx-8,py-16,16,16,{dark:.45,lit:.2});stone(c,sx-10,py-18,20,2.6,{lit:.3});stone(c,sx-9.5,py-1,19,2.4,{lit:.2});
  c.fillStyle=rgba(C.gold,.6);c.fillRect(sx-4,py-10,8,.5);c.fillRect(sx-4,py-7,8,.5);
  {const fy=py-18;c.fillStyle='#16191a';c.beginPath();c.moveTo(sx-5.5,fy);c.quadraticCurveTo(sx-4,fy-14,sx-2.2,fy-22);c.lineTo(sx-1.4,fy-25.5);c.arc(sx-.6,fy-27.2,2,Math.PI*.8,Math.PI*2.25);c.lineTo(sx+1.6,fy-23);c.lineTo(sx+3.8,fy-26);c.lineTo(sx+5.6,fy-35);c.lineTo(sx+7,fy-34.6);c.lineTo(sx+5.4,fy-24);c.quadraticCurveTo(sx+4.4,fy-12,sx+5.5,fy);c.closePath();c.fill();
    c.beginPath();c.moveTo(sx-2.2,fy-27.6);c.lineTo(sx-5,fy-30.4);c.lineTo(sx-1.8,fy-28.4);c.fill();
    c.strokeStyle=rgba('#6ab0a0',.35);c.lineWidth=.5;c.beginPath();c.moveTo(sx-5.3,fy-1);c.quadraticCurveTo(sx-3.8,fy-14,sx-2,fy-22);c.stroke();
    c.strokeStyle=rgba('#a8b4d8',.3);c.beginPath();c.arc(sx-.6,fy-27.2,2,Math.PI*1.1,Math.PI*1.6);c.stroke();
    const lx=sx+6.4,ly=fy-37.5;c.fillStyle='#16191a';c.fillRect(lx-1.6,ly-1,3.2,4.2);c.beginPath();c.moveTo(lx-2,ly-1);c.lineTo(lx,ly-3);c.lineTo(lx+2,ly-1);c.fill();
    c.fillStyle=rgba(C.cyanL,.95);c.fillRect(lx-.9,ly,1.8,2.6);glow(c,lx,ly+1.2,9,C.cyanL,.6);glow(c,lx,ly+1.2,36,C.cyan,.22);
    c.strokeStyle=rgba(C.cyan,.4);c.lineWidth=.5;c.beginPath();c.moveTo(sx+6,fy-33);c.lineTo(sx+4.6,fy-24);c.quadraticCurveTo(sx+3.8,fy-12,sx+4.8,fy-1);c.stroke();
    REFL.push({x:lx,w:8,y:ly,col:C.cyan,a:.12});}
  // a bench under the left tree
  {const bx=x0+44,by=bk+12;c.fillStyle='#0a090c';c.fillRect(bx,by-5,18,1.4);c.fillRect(bx,by-9,18,1.2);c.fillRect(bx+1,by-5,1,5);c.fillRect(bx+16,by-5,1,5);c.fillStyle=rgba('#a8b4d8',.25);c.fillRect(bx,by-9,18,.4);}
  // the railings along the pavement, gilt spikes on them, and the square's name on a post at the corner
  const ry=base+.5;c.strokeStyle='#08070b';c.lineWidth=1;c.beginPath();c.moveTo(x0,ry-13);c.lineTo(x1,ry-13);c.moveTo(x0,ry-3);c.lineTo(x1,ry-3);for(let x=x0+1;x<=x1-1;x+=3.4){c.moveTo(x,ry);c.lineTo(x,ry-16);}c.stroke();
  c.strokeStyle=rgba('#a8b4d8',.16);c.lineWidth=.4;c.beginPath();c.moveTo(x0,ry-13.6);c.lineTo(x1,ry-13.6);c.stroke();
  c.fillStyle=C.gold;for(let x=x0+1;x<=x1-1;x+=3.4){c.beginPath();c.moveTo(x-.9,ry-16);c.lineTo(x,ry-19);c.lineTo(x+.9,ry-16);c.fill();}
  for(const px of [x0+1,x1-1]){stone(c,px-3,ry-20,6,20,{dark:.5,lit:.25});c.fillStyle=lin(c,px-3,0,px+3,0,[[0,C.goldD],[.5,C.goldL],[1,C.goldD]]);c.beginPath();c.arc(px,ry-22,2.4,Math.PI,0);c.fill();}
  {const sx2=x1-12,sy2=ry-34;c.fillStyle='#0a090c';c.fillRect(sx2-.6,sy2,1.2,34);c.fillStyle='#08070a';c.fillRect(sx2-12,sy2+1,24,6);c.strokeStyle=rgba(C.gold,.7);c.lineWidth=.4;c.strokeRect(sx2-11.4,sy2+1.6,22.8,4.8);
    c.save();c.font='700 3.4px "Alegreya SC", Georgia, serif';c.textAlign='center';c.fillStyle=C.goldL;c.fillText('ARGENT SQ.',sx2,sy2+5.3);c.restore();}}
// ---------- the avenue's row, laid out along the street's strip ----------
const ROW=[
  {x0:0,x1:156,top:126,roof:'mansard',rh:26,floors:2,seed:3,brick:true,litP:.35,boxes:true,shop:'tailor',chim:[8,138]},
  {x0:156,x1:318,top:118,roof:'flat',balus:true,urns:true,floors:2,seed:5,stucco:'#3e3a36',arch:true,litP:.45,shop:'cafe',shopH:64,balcony:0},
  {alley:[318,340],top:120},
  {x0:340,x1:584,top:92,seed:8,cinema:true},
  {x0:584,x1:712,top:140,roof:'flat',cornice:true,floors:2,seed:13,brick:true,bc:'#33242a',bc2:'#261a20',bc3:'#3e2a26',litP:.12,shop:'pawn'},
  {square:[712,834]},
  {x0:834,x1:1000,top:124,roof:'mansard',rh:24,floors:2,seed:17,stucco:'#3a3440',litP:.35,shop:'books',gild:true,boxes:true,chim:[842,978]},
  {x0:1000,x1:1166,top:102,roof:'flat',cornice:true,floors:3,seed:21,brick:true,bc:'#4a2620',bc2:'#341a16',bc3:'#5a3020',litP:.3,shop:'oyster'},
  {alley:[1166,1188],top:104},
  {x0:1188,x1:1404,top:82,roof:'mansard',rh:30,floors:3,seed:29,stucco:'#3c3632',litP:.5,shop:'hotel',gild:true,dorm:34,shopH:70,chim:[1196,1384]},
  {x0:1404,x1:1560,top:134,roof:'gable',rh:36,floors:2,seed:31,bs:3,brick:true,litP:.28,shop:'barber'}];
// ---------- the lamps ----------
// an elven gas lamp: a cast-iron post wound with the gold vine, a scrolled bracket, a lantern of glass burning warm
function lampPost(c,lx){const x=lx,base=yP(LAMPD),top=base-150;
  c.save();c.lineCap='round';
  c.fillStyle=rgba('#000000',.45);c.beginPath();c.ellipse(x+1,base,8,1.6,0,0,TAU);c.fill();
  c.fillStyle=lin(c,x-5.5,0,x+5.5,0,[[0,'#060509'],[.65,'#18161e'],[1,'#07060a']]);c.fillRect(x-4,base-12,8,12);c.fillRect(x-5.5,base-3,11,3);c.fillStyle=rgba(C.rim,.4);c.fillRect(x-4,base-12,8,.7);c.fillRect(x-5.5,base-3,11,.5);
  c.fillStyle=lin(c,x-2.2,0,x+2.2,0,[[0,'#060609'],[.6,'#121017'],[1,'#08070a']]);c.fillRect(x-2.2,top+8,4.4,base-12-top-8);
  c.fillStyle=rgba('#000000',.5);c.fillRect(x-.9,top+12,.4,base-26-top);c.fillStyle=rgba(C.rim,.5);c.fillRect(x+1.4,top+10,.7,base-24-top);
  vine(c,[{x,y:base-14},{x,y:top+22}],{w:.6,amp:1.6,wave:14,leaf:2,every:2,seed:lx,col:C.gold});
  c.strokeStyle='#09080c';c.lineWidth=2.4;c.beginPath();c.moveTo(x,top+10);c.quadraticCurveTo(x+6,top-2,x+16,top+1);c.stroke();
  scroll(c,x+5,top+8,4,1,C.gold,.7,1.3);
  c.fillStyle='#09080c';c.fillRect(x-3,top+6,6,4);c.beginPath();c.arc(x,top+5,2.2,0,TAU);c.fill();
  const lx2=x+16,ly=top+1;c.fillStyle='#09080c';c.beginPath();c.moveTo(lx2-6,ly+4);c.lineTo(lx2,ly-1);c.lineTo(lx2+6,ly+4);c.closePath();c.fill();
  c.fillStyle=C.gold;c.fillRect(lx2-.6,ly-4,1.2,3);
  c.fillStyle=lin(c,0,ly+4,0,ly+14,[[0,'#fff6dc'],[1,'#ffc272']]);c.beginPath();c.moveTo(lx2-5,ly+4);c.lineTo(lx2+5,ly+4);c.lineTo(lx2+3.6,ly+14);c.lineTo(lx2-3.6,ly+14);c.closePath();c.fill();
  c.strokeStyle='#09080c';c.lineWidth=.8;c.beginPath();c.moveTo(lx2,ly+4);c.lineTo(lx2,ly+14);c.stroke();c.fillStyle='#09080c';c.fillRect(lx2-4,ly+14,8,2);
  c.restore();
  // the light it puts out, which goes by with it: a halo, a cone down to the flags
  const q=lampHead(lx);glow(c,q.x,q.y,70,'#ffb866',.3);beam(c,q.x,q.y+8,10,110,140,'#ffcf86',.06);}
// ---------- the street's strip ----------
// a point of the road (world x, depth) for one seen at (sx, sy) on the screen
const onRoad=(sx,sy)=>{const d=(GB-sy)/PSY;return{x:sx-d*PSX,d};};
function paintStreet(c,P){SPILL=[];REFL=[];BULBS=[];const base=FB();
  // the row: alleys and the square first, the houses over their edges
  for(const b of ROW)if(b.alley)alley(c,b.alley[0],b.alley[1],b.top);else if(b.square)square(c,b.square[0],b.square[1]);
  for(const b of ROW){if(b.alley||b.square)continue;if(b.cinema){cinema(c,b);continue;}const f=house(c,b);SHOP[b.shop](c,b,f.gTop,f.base);}
  // the far pavement: flags in the ground plane, wet, darker toward the kerb
  {const g=GB-KH;c.save();c.transform(1,0,PSX,-PSY,0,g);const pf=c.createPattern(flags(),'repeat');if(pf.setTransform)pf.setTransform(new DOMMatrix().translate(0,FK).scale(.4));
    c.fillStyle=pf;c.fillRect(-80,FK,P+120,DF-FK+2);c.restore();
    c.fillStyle=lin(c,0,yP(DF),0,yP(FK),[[0,rgba('#06040a',.62)],[1,rgba('#06040a',.48)]]);c.fillRect(0,yP(DF+2),P,yP(FK)-yP(DF+2));
    // the windows' light out across the flags, and the lamps' pools
    c.save();c.transform(1,0,PSX,-PSY,0,g);c.globalCompositeOperation='lighter';for(const s of SPILL){const a=s.x0-DF*PSX,bb=s.x1-DF*PSX;
      c.fillStyle=lin(c,0,DF,0,FK+2,[[0,rgba('#ffb060',.2*s.a)],[1,rgba('#ffb060',0)]]);c.beginPath();c.moveTo(a,DF);c.lineTo(bb,DF);c.lineTo(bb+8,FK+2);c.lineTo(a-8,FK+2);c.closePath();c.fill();}c.restore();
    for(const lx of LX){glow(c,lx+6,yP(LAMPD+2),64,'#ffb866',.2,.22);wetStreak(c,lx+16,base+2,yP(FK)-.5,14,'#ffc477',.3,lx);}
    const r=rng(29);for(let i=0;i<30;i++){const lx=r()*P,ly=yP(FK+2+r()*(DF-FK-4));c.fillStyle=rgba(r()<.5?'#3a2414':'#4a3018',.6);c.beginPath();c.ellipse(lx,ly,1.1,.5,r()*Math.PI,0,TAU);c.fill();}}
  // on the flags: the café's tables and its board, the hotel's bay trees
  cafeTable(c,190,yP(229));cafeTable(c,284,yP(229));chalkBoard(c,236,yP(230));
  // the kerb: granite blocks of uneven length, a chipped arris lit along the top
  {const yt=yP(FK),yb=yR(FK);c.fillStyle=patAt(c,TX().granite(77,128,64,{base:'#5e5860'}),0,yt,32.5/128);c.fillRect(0,yt,P,yb-yt+.6);
    c.fillStyle=lin(c,0,yt,0,yb,[[0,rgba('#05040a',.22)],[.18,rgba('#05040a',.45)],[1,rgba('#05040a',.8)]]);c.fillRect(0,yt,P,yb-yt+.6);
    const r=rng(81);c.strokeStyle=rgba('#000000',.6);c.lineWidth=.6;for(let x=8+r()*12;x<P-6;x+=30+r()*26){c.beginPath();c.moveTo(x,yt);c.lineTo(x,yb);c.stroke();
      if(r()<.4){c.fillStyle=rgba('#000000',.55);c.beginPath();c.moveTo(x+5,yt);c.lineTo(x+8,yt);c.lineTo(x+6.4,yt+1.6);c.fill();}}
    c.fillStyle=rgba(C.rim,.5);c.fillRect(0,yt-.5,P,1);
    c.save();c.globalCompositeOperation='lighter';for(const lx of LX){const qx=lx+16;c.fillStyle=lin(c,qx-70,0,qx+70,0,[[0,rgba('#ffb866',0)],[.5,rgba('#ffb866',.2)],[1,rgba('#ffb866',0)]]);c.fillRect(qx-70,yt-1,140,yb-yt+1.6);}c.restore();}
  road(c,P);
  for(const lx of LX)lampPost(c,lx);
  // a low mist along the kerb
  haze(c,0,P,yP(FK)-26,yP(FK)+22,'#5a3a40',.13);}
// the road: asphalt, the wheels' polished tracks, the gutter under the kerb, lanes in worn paint, seams of tar, iron covers, puddles;
// every light in the street lying on it in broken streaks; the dark coming up off it toward us
function road(c,P){const r=rng(61),T=yR(FK),Bt=484;
  // the asphalt, laid flat on the screen: its grain has no direction to give the slant away
  const pa=c.createPattern(asphalt(),'repeat');if(pa.setTransform)pa.setTransform(new DOMMatrix().translate(0,T).scale(.5,.375));c.fillStyle=pa;c.fillRect(0,T,P,Bt-T);
  c.save();c.transform(1,0,PSX,-PSY,0,GB);
  const wrap=fn=>{for(const k of [-P,0,P]){c.save();c.translate(k,0);fn();c.restore();}};
  // two tracks to a lane, darker and smoother where the tyres have polished the stone in the binder
  for(const lc of [12.5,68,123.5,178.5])for(const sd of [-11,11]){const d=lc+sd;c.fillStyle=lin(c,0,d-4.5,0,d+4.5,[[0,rgba('#000000',0)],[.5,rgba('#000000',.17)],[1,rgba('#000000',0)]]);c.fillRect(-70,d-4.5,P+90,9);}
  // patches where the road was opened and closed again, a shade lighter, their edges sealed
  for(const [px,pd,pl,pw] of [[480,128,140,24],[1120,4,90,34],[60,64,60,20]])wrap(()=>{c.fillStyle=rgba('#b0a098',.04);c.fillRect(px,pd,pl,pw);c.strokeStyle=rgba('#040306',.55);c.lineWidth=.8;c.strokeRect(px,pd,pl,pw);});
  // the gutter under the kerb: wetter, darker, a drain at intervals
  c.fillStyle=lin(c,0,FK-12,0,FK,[[0,rgba('#05040a',0)],[1,rgba('#05040a',.6)]]);c.fillRect(-70,FK-12,P+90,12.5);
  for(const gx of [150,700,1250])wrap(()=>{c.fillStyle='#040306';c.fillRect(gx,FK-7,18,6);c.fillStyle=rgba('#b8a898',.22);for(let k=0;k<8;k++)c.fillRect(gx+1+k*2.2,FK-6.4,1,4.8);c.fillStyle=rgba(C.rim,.18);c.fillRect(gx,FK-1.4,18,.4);});
  // the lanes: white dashes either side, worn where the wheels cross them; the crown's double line in old gold
  for(const d of [41,151])for(let k=-1;k<=20;k++){const x=k*78,rr=rng(((k%20)+20)%20*7+d);c.fillStyle=rgba('#e2dacb',.48);c.fillRect(x,d-1.3,36,2.6);
    c.fillStyle=rgba('#1e1a1d',.7);for(let i=0;i<8;i++)c.fillRect(x+rr()*35,d-1.3+rr()*2.2,.6+rr()*1.8,.5+rr()*.8);c.fillStyle=rgba('#fff4e0',.08);c.fillRect(x,d+.9,36,.4);}
  for(const d of [93.2,98.2]){c.fillStyle=rgba('#d6ad5a',.42);c.fillRect(-70,d-.75,P+90,1.5);}
  {const rr=rng(77);c.fillStyle=rgba('#1e1a1d',.7);for(let i=0;i<280;i++){const d=rr()<.5?93.2:98.2;c.fillRect(rr()*P,d-.75+rr()*1.2,.6+rr()*2,.5+rr()*.6);}}
  // seams of tar, glossy, catching what light there is
  for(let i=0;i<5;i++){const along=i<3,x0=r()*P,d0=along?18+r()*170:FK-4,len=along?120+r()*200:120+r()*60;const pts=[];
    for(let s2=0;s2<=len;s2+=6)pts.push(along?{x:x0+s2,y:d0+Math.sin(s2*.05+i)*2.2+(r()-.5)*1.2}:{x:x0+Math.sin(s2*.08+i)*3+(r()-.5)*1.4+s2*.12,y:d0-s2});
    wrap(()=>{c.lineJoin='round';c.strokeStyle=rgba('#050406',.6);c.lineWidth=1.1;c.beginPath();pts.forEach((q,j)=>j?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y));c.stroke();
      c.strokeStyle=rgba(C.rim,.08);c.lineWidth=.4;c.beginPath();pts.forEach((q,j)=>j?c.lineTo(q.x,q.y+.5):c.moveTo(q.x,q.y+.5));c.stroke();});}
  // the iron covers: a ring of rim, the city's arms in raised work, wet
  for(const [mx,md] of [[250,74],[1000,130],[1388,24]])wrap(()=>{c.save();c.translate(mx,md);c.fillStyle='#09080b';c.beginPath();c.arc(0,0,10.5,0,TAU);c.fill();
    c.fillStyle=lin(c,0,-9,0,9,[[0,'#17171c'],[1,'#222127']]);c.beginPath();c.arc(0,0,9.2,0,TAU);c.fill();
    c.strokeStyle=rgba('#08070a',.9);c.lineWidth=.6;for(const rr of [3.2,6.2]){c.beginPath();c.arc(0,0,rr,0,TAU);c.stroke();}
    c.beginPath();for(let k=-8;k<=8;k+=2){const h=Math.sqrt(Math.max(0,81-k*k));c.moveTo(k,-h);c.lineTo(k,h);}c.globalAlpha=.55;c.stroke();c.globalAlpha=1;
    c.strokeStyle=rgba(C.gold,.22);c.lineWidth=.5;c.beginPath();c.arc(0,0,4.6,0,TAU);c.stroke();
    c.strokeStyle=rgba(C.rim,.3);c.lineWidth=.7;c.beginPath();c.arc(0,0,10,Math.PI*.15,Math.PI*.85);c.stroke();c.restore();});
  // puddles: darker and smoother, the sky faint in their far halves, light along their far lips
  const PUD=[];for(const [sx,sy,rw] of [[409,456,26],[1189,450,22],[640,404,18],[1500,392,20],[90,430,16]]){const q=onRoad(sx,sy);PUD.push({x:q.x,d:q.d,rw,sx,sy});}
  for(const p of PUD){const rr=rng(p.x|0),bl=[];for(let k=0;k<4;k++)bl.push([p.x+(rr()-.5)*p.rw*.8,p.d+(rr()-.5)*4,p.rw*(.45+rr()*.35),3+rr()*3]);p.path=()=>{c.beginPath();for(const [bx,bd,ra,rb] of bl){c.moveTo(bx+ra,bd);c.ellipse(bx,bd,ra,rb,0,0,TAU);}};
    p.path();c.fillStyle=rgba('#050509',.55);c.fill();c.save();p.path();c.clip();c.fillStyle=lin(c,0,p.d-6,0,p.d+8,[[0,rgba('#2a3048',0)],[1,rgba('#2a3048',.38)]]);c.fillRect(p.x-p.rw*1.6,p.d-10,p.rw*3.2,20);c.restore();
    c.strokeStyle=rgba('#ffd8a0',.2);c.lineWidth=.55;c.beginPath();c.ellipse(p.x,p.d,p.rw*.74,4.6,0,Math.PI*.1,Math.PI*.9);c.stroke();}
  c.restore();
  // the near side falls into the dark; the far side holds the warmth of the shops
  c.fillStyle=lin(c,0,T,0,Bt,[[0,rgba('#05040a',.04)],[.4,rgba('#05040a',.18)],[1,rgba('#05040a',.55)]]);c.fillRect(0,T,P,Bt-T);
  c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,0,T,0,T+40,[[0,rgba('#ffb878',.06)],[1,rgba('#ffb878',0)]]);c.fillRect(0,T,P,40);c.restore();
  // the lights on the wet: each lamp a long broken streak and a pool where its light reaches the road, the windows and signs shorter
  const y0=T+1.5;
  for(const lx of LX){const q=lampHead(lx),ym=2*yR(LAMPD)-q.y;streak(c,q.x+2,y0,Math.min(Bt,ym+26),26,'#ffc477',.45,lx*3,1.2);glow(c,q.x-4,yR(180),84,'#ffb866',.12,.16);}
  for(const s2 of REFL){const ym=2*yR(DF)-s2.y;streak(c,s2.x,y0,Math.min(Bt,ym+14),s2.w,s2.col,s2.a,(s2.x*7)|0,.8);}
  // in the puddles under the lamps, the lanterns themselves, sharper than on the open road, broken by the ripples
  const base0=c.getTransform();
  for(const p of PUD){for(const lx of LX){const q=lampHead(lx);if(Math.abs(q.x-p.sx)>p.rw)continue;const ym=2*yR(LAMPD)-q.y,rr=rng(lx);
    c.save();c.transform(1,0,PSX,-PSY,0,GB);p.path();c.clip();c.setTransform(base0);c.globalCompositeOperation='lighter';glow(c,q.x,ym,16,'#ffb866',.45,.7);
    for(let k=-4;k<=4;k++){const w2=7-k*k*.32+rr()*1.2;c.fillStyle=rgba(Math.abs(k)<2?'#fff3d6':'#ffc272',.75-Math.abs(k)*.13);c.fillRect(q.x-w2/2+(rr()-.5)*1.4,ym+k*1.9,w2,.9);}c.restore();}}}
// ---------- the middle city ----------
// a tall house of the middle distance: a block with a grid of windows, a few lit, the roof's clutter against the sky
function midBlock(c,x0,x1,top,base,r,bare){const w=x1-x0,h=base-top,col=mix('#13141f','#201c2a',r());
  c.fillStyle=lin(c,0,top,0,base,[[0,col],[1,mix(col,'#2a2030',.55)]]);c.fillRect(x0,top,w,h);
  c.fillStyle=rgba('#000000',.4);c.fillRect(x0,top+2.6,w,1);c.fillStyle=rgba('#a8b0d0',.1);c.fillRect(x0,top,w,.6);
  const fl=11,bw=7,nb=Math.max(1,Math.floor((w-4)/bw)),ox=x0+(w-nb*bw)/2,lp=.12+r()*.2;
  for(let y=top+7;y<base-6;y+=fl)for(let j=0;j<nb;j++){const wx=ox+j*bw+2;if(r()<lp){c.fillStyle=rgba(r()<.88?'#ffc879':'#d8e8ff',.4+.4*r());c.fillRect(wx,y,3,4.6);}else{c.fillStyle=rgba('#05060c',.5);c.fillRect(wx,y,3,4.6);}}
  c.fillStyle=rgba('#9aa6d0',.1);c.fillRect(x0,top,.8,h);
  if(bare)return;const v=r();
  if(v<.28)waterTank(c,x0+w*(.25+r()*.5),top);
  else if(v<.5){c.fillStyle=col;c.fillRect(x0+w*.14,top-8,w*.3,8.5);c.fillStyle=rgba('#a8b0d0',.08);c.fillRect(x0+w*.14,top-8,w*.3,.5);}
  else if(v<.66){for(const f of [.2,.7]){c.fillStyle=col;c.fillRect(x0+w*f,top-11,3.6,11.5);}if(r()<.6)smoke(c,x0+w*.2+1.8,top-12,r);}}
function waterTank(c,x,top){const w=12,h=10,leg=7,col='#0c0d14';c.fillStyle=col;c.fillRect(x-w/2,top-leg-h,w,h);c.beginPath();c.moveTo(x-w/2-1,top-leg-h);c.lineTo(x,top-leg-h-6);c.lineTo(x+w/2+1,top-leg-h);c.fill();
  c.strokeStyle=col;c.lineWidth=.9;c.beginPath();for(const f of [-.4,.4]){c.moveTo(x+f*w,top-leg);c.lineTo(x+f*w*1.2,top);}c.moveTo(x-w*.45,top-1.5);c.lineTo(x+w*.45,top-leg+.5);c.stroke();
  c.strokeStyle=rgba('#9aa6d0',.12);c.lineWidth=.4;for(let k=1;k<4;k++){c.beginPath();c.moveTo(x-w/2,top-leg-h+k*2.6);c.lineTo(x+w/2,top-leg-h+k*2.6);c.stroke();}}
// smoke off a chimney, leaning away on the wind, lit from below by the city
function smoke(c,x,y,r){for(let k=0;k<7;k++){const t=k/6,px=x-t*30-r()*4,py=y-t*20-r()*3,rr=3+t*9;c.fillStyle=rad(c,px,py,0,rr,[[0,rgba('#4a3c48',.22*(1-t*.6))],[1,rgba('#4a3c48',0)]]);c.beginPath();c.arc(px,py,rr,0,TAU);c.fill();}}
const LAND={
  // a domed hall: a colonnade, a drum of lit windows, a dome of dark copper ribbed in gilt, a lantern burning on top
  dome(c,a,b,base,r){const cx=(a+b)/2,w=b-a,ht=base-86;
    c.fillStyle=lin(c,0,ht,0,base,[[0,'#211c27'],[1,'#30252e']]);c.fillRect(a,ht,w,base-ht);
    for(let k=0;k<9;k++){const px=a+9+k*(w-18)/8;c.fillStyle=rgba('#e0c8a8',.1);c.fillRect(px-1.3,ht+12,2.6,base-ht-24);c.fillStyle=rgba('#000000',.45);c.fillRect(px+1.3,ht+12,1.2,base-ht-24);}
    for(let k=0;k<8;k++){const px=a+9+(k+.5)*(w-18)/8;c.fillStyle=rgba('#ffc879',.32);c.fillRect(px-1.6,ht+40,3.2,9);}
    c.fillStyle='#2a2430';c.fillRect(a-2,ht,w+4,10);c.fillStyle=rgba(C.rim,.18);c.fillRect(a-2,ht,w+4,.6);
    c.fillStyle='#262030';c.beginPath();c.moveTo(a-2,ht);c.lineTo(cx,ht-15);c.lineTo(b+2,ht);c.closePath();c.fill();line(c,[{x:a-2,y:ht},{x:cx,y:ht-15},{x:b+2,y:ht}],rgba(C.rim,.28),.7);
    const dw=w*.5,dt=ht-36;c.fillStyle=lin(c,cx-dw/2,0,cx+dw/2,0,[[0,'#16131c'],[.6,'#241e2a'],[1,'#120f17']]);c.fillRect(cx-dw/2,dt,dw,ht-dt);
    for(let k=0;k<6;k++){const wx=cx-dw/2+5+k*(dw-10)/5;c.fillStyle=rgba('#ffc879',.5);c.beginPath();c.moveTo(wx-1.6,dt+20);c.lineTo(wx-1.6,dt+10);c.arc(wx,dt+10,1.6,Math.PI,0);c.lineTo(wx+1.6,dt+20);c.fill();}
    c.fillStyle='#2a2430';c.fillRect(cx-dw/2-2,dt-2,dw+4,3);
    const R=dw*.55,dy=dt-1;c.fillStyle=lin(c,cx-R,0,cx+R,0,[[0,'#1a140c'],[.3,'#4a3818'],[.5,'#6a5024'],[.72,'#3a2c14'],[1,'#120d08']]);c.beginPath();c.ellipse(cx,dy,R,R*.95,0,Math.PI,0);c.closePath();c.fill();
    c.strokeStyle=rgba(C.gold,.55);c.lineWidth=.6;for(const ph of [-.75,-.4,0,.4,.75]){c.beginPath();for(let t=0;t<=1.0001;t+=.1){const th=t*Math.PI/2,x=cx+R*Math.sin(th)*Math.sin(ph*Math.PI/2),y=dy-R*.95*Math.cos(th);t?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}
    c.fillStyle=rgba(C.goldL,.3);c.beginPath();c.ellipse(cx-R*.38,dy-R*.5,R*.1,R*.28,-.35,0,TAU);c.fill();
    const lt=dy-R*.95;c.fillStyle='#16131c';c.fillRect(cx-3,lt-8,6,8);glow(c,cx,lt-4,14,'#ffc879',.4);c.fillStyle=rgba('#ffd9a0',.75);c.fillRect(cx-1.6,lt-6.5,3.2,4);
    c.fillStyle=C.gold;c.beginPath();c.moveTo(cx-1,lt-8);c.lineTo(cx,lt-16);c.lineTo(cx+1,lt-8);c.fill();},
  // a clock tower: an opal face lit from behind, gilt hands at a quarter to midnight, a steep slate roof and a gilt finial
  clock(c,a,b,base,r){const cx=(a+b)/2,w=b-a,top=base-168;
    c.fillStyle=lin(c,a,0,b,0,[[0,'#14121b'],[.65,'#221d29'],[1,'#100e15']]);c.fillRect(a,top,w,base-top);
    for(let y=top+40;y<base-20;y+=16){c.fillStyle=rgba('#000000',.4);c.fillRect(a,y,w,1.2);c.fillStyle=rgba(C.rim,.08);c.fillRect(a,y-.5,w,.5);if(r()<.5){c.fillStyle=rgba('#ffc879',.4);c.fillRect(cx-1.5,y+4,3,6);}}
    c.fillStyle='#06050a';for(const f of [-.25,.25]){const ax=cx+f*w;c.beginPath();c.moveTo(ax-3.5,top+40);c.lineTo(ax-3.5,top+33);c.arc(ax,top+33,3.5,Math.PI,0);c.lineTo(ax+3.5,top+40);c.fill();}
    c.fillStyle='#0e0d15';c.beginPath();c.moveTo(a-3,top+2);c.lineTo(cx,top-30);c.lineTo(b+3,top+2);c.closePath();c.fill();line(c,[{x:a-3,y:top+2},{x:cx,y:top-30}],rgba('#9aa6d0',.25),.6);
    c.fillStyle='#16141e';c.fillRect(a-3,top,w+6,3);c.fillStyle=rgba(C.rim,.2);c.fillRect(a-3,top,w+6,.5);
    line(c,[{x:cx,y:top-30},{x:cx,y:top-40}],C.gold,.9);c.fillStyle=C.goldL;c.beginPath();c.arc(cx,top-35,1.3,0,TAU);c.fill();
    const cy=top+17,R=w*.3;glow(c,cx,cy,R*3.2,'#ffc879',.3);c.fillStyle=rad(c,cx,cy,0,R,[[0,'#fff3d6'],[.8,'#f1d9a6'],[1,'#c8a066']]);c.beginPath();c.arc(cx,cy,R,0,TAU);c.fill();
    c.strokeStyle=C.gold;c.lineWidth=1.1;c.stroke();c.strokeStyle='#2a1c10';c.lineWidth=.5;for(let k=0;k<12;k++){const a2=k/12*TAU;c.beginPath();c.moveTo(cx+Math.cos(a2)*R*.78,cy+Math.sin(a2)*R*.78);c.lineTo(cx+Math.cos(a2)*R*.92,cy+Math.sin(a2)*R*.92);c.stroke();}
    c.lineWidth=.9;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx-R*.62,cy-R*.06);c.moveTo(cx,cy);c.lineTo(cx-R*.05,cy-R*.74);c.stroke();},
  // a block with the Hallowell name on its roof in gilt letters on an iron frame, lit
  sign(c,a,b,base,r){const top=base-110;midBlock(c,a,b,top,base,r,true);const cx=(a+b)/2,sy=top-26;
    c.strokeStyle='#0a0b11';c.lineWidth=.9;c.beginPath();for(let x=a+10;x<=b-10;x+=14){c.moveTo(x,top);c.lineTo(x,sy);}c.moveTo(a+10,sy+4);c.lineTo(b-10,sy+4);c.moveTo(a+10,sy+21);c.lineTo(b-10,sy+21);for(let x=a+10;x<b-11;x+=14){c.moveTo(x,sy+21);c.lineTo(x+14,sy+4);}c.stroke();
    glow(c,cx,sy+12,(b-a)*.6,'#ffc070',.16,.25);
    c.save();c.font='700 19px "Alegreya SC", Georgia, serif';c.textAlign='center';c.letterSpacing='3px';c.fillStyle=rgba('#000000',.6);c.fillText('HALLOWELL',cx+.8,sy+19.6);
    c.fillStyle=lin(c,0,sy+4,0,sy+19,[[0,C.goldL],[.5,C.gold],[1,C.goldD]]);c.fillText('HALLOWELL',cx,sy+19);c.restore();
    for(let x=a+12;x<b-12;x+=3.4){c.fillStyle=rgba('#ffe7b8',.75);c.fillRect(x-.4,sy+21.6,.8,.8);}
    c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,0,top,0,top+20,[[0,rgba('#ffc070',.16)],[1,rgba('#ffc070',0)]]);c.fillRect(a,top,b-a,20);c.restore();},
  // a temple of the old faith: a steep nave over lancets of coloured glass, a tower with a rose window and a spire with a gilt star
  temple(c,a,b,base,r){const w=b-a,tx=a+w*.3,tw=24,nt=base-70;
    c.fillStyle=lin(c,0,nt,0,base,[[0,'#1a1722'],[1,'#2a2230']]);c.fillRect(a,nt,w,base-nt);
    c.fillStyle='#0f0d16';c.beginPath();c.moveTo(a-2,nt);c.lineTo(a+8,nt-18);c.lineTo(b-8,nt-18);c.lineTo(b+2,nt);c.closePath();c.fill();line(c,[{x:a+8,y:nt-18},{x:b-8,y:nt-18}],rgba('#9aa6d0',.2),.6);
    for(let x=tx+tw/2+10;x<b-8;x+=13){c.fillStyle=rgba('#e0a860',.42);c.beginPath();c.moveTo(x-2,nt+38);c.lineTo(x-2,nt+14);c.lineTo(x,nt+10);c.lineTo(x+2,nt+14);c.lineTo(x+2,nt+38);c.fill();
      c.fillStyle=rgba('#8a2a3a',.35);c.fillRect(x-2,nt+20,4,5);c.fillStyle=rgba('#2a7a70',.3);c.fillRect(x-2,nt+29,4,4);}
    const tt=base-128;c.fillStyle=lin(c,tx-tw/2,0,tx+tw/2,0,[[0,'#14121b'],[.6,'#221d2a'],[1,'#100e15']]);c.fillRect(tx-tw/2,tt,tw,base-tt);
    const ry=tt+26;glow(c,tx,ry,22,'#ffb070',.22);c.fillStyle=rad(c,tx,ry,0,7,[[0,'#ffd9a0'],[.5,'#c87a3a'],[1,'#5a2030']]);c.beginPath();c.arc(tx,ry,7,0,TAU);c.fill();
    c.strokeStyle='#120f17';c.lineWidth=.6;c.beginPath();for(let k=0;k<8;k++){const a2=k/8*TAU;c.moveTo(tx,ry);c.lineTo(tx+Math.cos(a2)*7,ry+Math.sin(a2)*7);}c.stroke();c.strokeStyle=rgba(C.gold,.5);c.beginPath();c.arc(tx,ry,7.4,0,TAU);c.stroke();
    c.fillStyle='#100e16';c.beginPath();c.moveTo(tx-tw/2-1,tt);c.lineTo(tx,tt-74);c.lineTo(tx+tw/2+1,tt);c.closePath();c.fill();line(c,[{x:tx-tw/2-1,y:tt},{x:tx,y:tt-74}],rgba('#9aa6d0',.24),.6);
    for(const s of [-1,1]){c.fillStyle='#100e16';c.beginPath();c.moveTo(tx+s*tw/2-2.4,tt);c.lineTo(tx+s*tw/2,tt-12);c.lineTo(tx+s*tw/2+2.4,tt);c.fill();}
    c.fillStyle=C.goldL;const sy=tt-78;c.beginPath();for(let k=0;k<8;k++){const a2=k/8*TAU-Math.PI/2,rr=k%2?1.1:3;c.lineTo(tx+Math.cos(a2)*rr,sy+Math.sin(a2)*rr);}c.closePath();c.fill();glow(c,tx,sy,8,C.goldL,.3);}};
function paintMid(c,P){const r=rng(97),base=BAND.mid.y1;
  const LM=[[250,382,'dome'],[862,926,'clock'],[1240,1440,'sign'],[1640,1760,'temple']];
  let x=0;const spans=[];for(const [a,b] of LM){if(a>x)spans.push([x,a]);x=b;}if(x<P)spans.push([x,P]);
  for(const [a,b] of spans)for(const [s0,s1] of fitRow(r,b-a,34,92)){if(r()<.12)continue;midBlock(c,a+s0,a+s1,base-(58+Math.pow(r(),1.25)*98),base,r);}
  for(const [a,b,k] of LM)LAND[k](c,a,b,base,r);
  c.fillStyle=lin(c,0,base-120,0,base,[[0,rgba('#3a2833',0)],[.55,rgba('#3a2833',.42)],[1,rgba('#3a2833',.92)]]);c.fillRect(0,base-120,P,120);}
// ---------- the far city ----------
function paintFar(c,P){const r=rng(53),base=BAND.far.y1,col=mix('#181a2a','#3a2a36',.45);
  for(const [x0,x1] of fitRow(r,P,16,44)){if(r()<.16)continue;const w=x1-x0,h=34+Math.pow(r(),1.4)*100,top=base-h,v=r();
    c.fillStyle=mix(col,'#2a2436',r()*.4);c.fillRect(x0,top,w,h);
    if(v<.14){c.beginPath();c.moveTo(x0+w*.2,top);c.lineTo(x0+w*.5,top-w*.9);c.lineTo(x0+w*.8,top);c.fill();}
    else if(v<.32){c.fillRect(x0+w*.2,top-h*.1,w*.6,h*.1+1);c.fillRect(x0+w*.36,top-h*.17,w*.28,h*.07+1);}
    else if(v<.44){c.fillRect(x0+w/2-.5,top-18,1,18);if(r()<.5){c.fillStyle=rgba('#ff4a3a',.7);c.fillRect(x0+w/2-.7,top-19,1.4,1.4);}}
    const rows=Math.floor(h/5),cols=Math.max(1,Math.floor(w/4));for(let i=1;i<rows;i++)for(let j=0;j<cols;j++){if(r()>.18)continue;c.fillStyle=rgba(r()<.86?'#ffcf86':'#cfe8ff',.16+.3*r());c.fillRect(x0+(j+.5)*w/cols-.5,top+i*5,1,1.3);}
    c.fillStyle=rgba('#9aa6d0',.08);c.fillRect(x0,top,.8,h);}
  c.fillStyle=lin(c,0,base-90,0,base,[[0,rgba('#3a2a36',0)],[.6,rgba('#3a2a36',.45)],[1,rgba('#3a2a36',.85)]]);c.fillRect(0,base-90,P,90);}
// ---------- the near kerb ----------
// what stands at the edge of our own pavement, close enough to go by quickest of all: cast-iron bollards with a gilt band, an elven
// pillar box, a short lamp of the pavement's own. Each is dark toward us and lit round its edges from the lamps across the road
function bollard(c,x,y){const h=30;c.fillStyle=rgba('#000000',.5);c.beginPath();c.ellipse(x+1.5,y+.5,7,1.7,0,0,TAU);c.fill();
  const body=()=>{c.beginPath();c.moveTo(x-4.4,y);c.lineTo(x-3.6,y-h+7);c.quadraticCurveTo(x-3.8,y-h,x,y-h-.6);c.quadraticCurveTo(x+3.8,y-h,x+3.6,y-h+7);c.lineTo(x+4.4,y);c.closePath();};
  body();c.fillStyle=lin(c,x-4.4,0,x+4.4,0,[[0,'#060509'],[.66,'#141219'],[1,'#050408']]);c.fill();
  c.fillStyle='#0a090d';c.fillRect(x-5,y-3,10,3);c.fillStyle=rgba(C.rim,.25);c.fillRect(x-5,y-3,10,.5);
  c.fillStyle=lin(c,x-4,0,x+4,0,[[0,C.goldDD],[.55,C.goldL],[1,C.goldDD]]);c.fillRect(x-3.75,y-h+9,7.5,1.5);c.fillRect(x-4.1,y-6,8.2,.8);
  c.save();body();c.clip();c.strokeStyle=rgba(C.rim,.55);c.lineWidth=1;c.beginPath();c.moveTo(x-3.6,y-h+7);c.quadraticCurveTo(x-3.8,y-h,x,y-h-.6);c.quadraticCurveTo(x+3.8,y-h,x+3.6,y-h+7);c.stroke();
  c.fillStyle=lin(c,x+1.5,0,x+4.4,0,[[0,rgba(C.rim,0)],[1,rgba(C.rim,.3)]]);c.fillRect(x+1.5,y-h,3,h);c.restore();}
function pillarBox(c,x,y){const w=15,h=38,x0=x-w/2;c.fillStyle=rgba('#000000',.5);c.beginPath();c.ellipse(x+1.5,y+.5,10,2,0,0,TAU);c.fill();
  c.fillStyle='#09070a';c.fillRect(x0-1.4,y-3,w+2.8,3);c.fillStyle=rgba(C.rim,.22);c.fillRect(x0-1.4,y-3,w+2.8,.5);
  c.fillStyle=lin(c,x0,0,x0+w,0,[[0,'#200508'],[.6,'#541019'],[.85,'#3a0a10'],[1,'#160306']]);c.fillRect(x0,y-h+4,w,h-7);
  // the cap: a dome over a gilt rim, a crown of the city on top
  c.fillStyle=lin(c,x0,0,x0+w,0,[[0,'#1a0407'],[.6,'#460c14'],[1,'#120305']]);c.beginPath();c.moveTo(x0-1.6,y-h+5);c.quadraticCurveTo(x0-1.6,y-h-3.4,x,y-h-3.6);c.quadraticCurveTo(x0+w+1.6,y-h-3.4,x0+w+1.6,y-h+5);c.closePath();c.fill();
  c.fillStyle=lin(c,x0,0,x0+w,0,[[0,C.goldDD],[.55,C.goldL],[1,C.goldDD]]);c.fillRect(x0-1.6,y-h+4,w+3.2,1.2);c.beginPath();c.arc(x,y-h-4.6,1.6,0,TAU);c.fill();
  c.strokeStyle=rgba(C.rim,.5);c.lineWidth=.8;c.beginPath();c.moveTo(x0-1.6,y-h+4.4);c.quadraticCurveTo(x0-1.6,y-h-3.4,x,y-h-3.6);c.quadraticCurveTo(x0+w+1.6,y-h-3.4,x0+w+1.6,y-h+4.4);c.stroke();
  // the slot, the door with its gilt crest and keyhole, the collection plate
  c.fillStyle='#040203';c.fillRect(x-4.4,y-h+8.6,8.8,1.4);c.fillStyle=rgba(C.goldL,.6);c.fillRect(x-4.4,y-h+10,8.8,.4);
  c.strokeStyle=rgba('#000000',.55);c.lineWidth=.5;c.strokeRect(x-5,y-h+14,10,15);c.fillStyle=rgba(C.gold,.8);c.beginPath();c.arc(x,y-h+18.5,1.8,0,TAU);c.fill();c.fillStyle='#2a0609';c.beginPath();c.arc(x+.5,y-h+18.1,1.2,0,TAU);c.fill();
  c.fillStyle=rgba('#e8dcc0',.5);c.fillRect(x-3,y-h+23,6,3.2);c.fillStyle=rgba('#1a0a0a',.6);for(let k=0;k<3;k++)c.fillRect(x-2.4,y-h+23.6+k*.9,4.8,.35);
  c.fillStyle=lin(c,x0+w-3,0,x0+w,0,[[0,rgba(C.rim,0)],[1,rgba(C.rim,.32)]]);c.fillRect(x0+w-3,y-h+4,3,h-7);}
function pavementLamp(c,x,y){c.fillStyle=rgba('#000000',.5);c.beginPath();c.ellipse(x+1.5,y+.5,8,1.8,0,0,TAU);c.fill();
  c.fillStyle=lin(c,x-5,0,x+5,0,[[0,'#060509'],[.66,'#15131a'],[1,'#050408']]);c.fillRect(x-5,y-6,10,6);c.beginPath();c.moveTo(x-3.4,y-6);c.lineTo(x-2,y-12);c.lineTo(x+2,y-12);c.lineTo(x+3.4,y-6);c.fill();c.fillRect(x-1.8,y-34,3.6,23);
  c.fillStyle=rgba(C.rim,.3);c.fillRect(x-5,y-6,10,.5);c.fillRect(x+1.2,y-33,.6,21);
  vine(c,[{x,y:y-13},{x,y:y-32}],{w:.55,amp:1.1,wave:9,leaf:1.5,every:2,seed:(x|0)+3,shadow:false});
  const ly=y-44;c.fillStyle='#09080c';c.fillRect(x-4.4,ly+9,8.8,2);c.beginPath();c.moveTo(x-5.6,ly);c.lineTo(x,ly-4.6);c.lineTo(x+5.6,ly);c.closePath();c.fill();
  c.fillStyle=lin(c,0,ly,0,ly+9,[[0,'#fff6dc'],[1,'#ffc272']]);c.beginPath();c.moveTo(x-4.4,ly);c.lineTo(x+4.4,ly);c.lineTo(x+3.6,ly+9);c.lineTo(x-3.6,ly+9);c.closePath();c.fill();
  c.strokeStyle='#09080c';c.lineWidth=.6;c.beginPath();c.moveTo(x,ly);c.lineTo(x,ly+9);c.stroke();c.fillStyle=C.gold;c.fillRect(x-.6,ly-7.6,1.2,3);
  glow(c,x,ly+4,30,'#ffb866',.42);glow(c,x,ly+4,9,'#fff0cc',.7);glow(c,x+3,y+1,46,'#ffb866',.2,.2);
  glow(c,x-3,yP(NK)-7,74,'#ffb866',.13,.2);streak(c,x+1,y+1.5,y+22,7,'#ffc477',.32,(x|0)+9,1.4);}
function paintNear(c,P){const g=GB-KH,r=rng(17);
  c.save();c.transform(1,0,PSX,-PSY,0,g);const pf=c.createPattern(flags(),'repeat');if(pf.setTransform)pf.setTransform(new DOMMatrix().translate(0,NK+3).scale(.4));
  c.fillStyle=pf;c.fillRect(-60,NK-64,P+120,64.5);c.restore();
  c.fillStyle=lin(c,0,yP(NK),0,510,[[0,rgba('#05040a',.5)],[1,rgba('#05040a',.78)]]);c.fillRect(0,yP(NK),P,510-yP(NK));
  // the kerb stones, the edge toward the road catching the far lamps
  {const yt=yP(NK),yb=yP(NK-6);c.fillStyle=patAt(c,TX().granite(77,128,64,{base:'#5e5860'}),0,yt,32.5/128);c.fillRect(0,yt,P,yb-yt);c.fillStyle=lin(c,0,yt,0,yb,[[0,rgba('#05040a',.3)],[1,rgba('#05040a',.6)]]);c.fillRect(0,yt,P,yb-yt);
    c.strokeStyle=rgba('#000000',.6);c.lineWidth=.6;for(let x=6+r()*10;x<P-6;x+=34+r()*24){c.beginPath();c.moveTo(x,yt);c.lineTo(x-1.2,yb);c.stroke();}
    c.fillStyle=rgba(C.rim,.45);c.fillRect(0,yt-.4,P,.9);c.fillStyle=rgba('#000000',.45);c.fillRect(0,yb,P,.7);}
  for(let i=0;i<16;i++){const lx=r()*P,ly=yP(NK-9-r()*30);c.fillStyle=rgba(r()<.5?'#4a2c16':'#5a3a1c',.55);c.beginPath();c.ellipse(lx,ly,1.5,.65,r()*Math.PI,0,TAU);c.fill();}
  const y=yP(-31);
  for(const x of [56,104,152,640,688,1050,1098])bollard(c,x,y);
  pillarBox(c,312,y+1);pavementLamp(c,470,y);pavementLamp(c,880,y);}
// ---------- the strips: made once at the screen's scale, slid along every frame ----------
let ST=null;
function wantScale(){const w=typeof cv!=='undefined'&&cv&&cv.width?cv.width:1800,cw=typeof cssW==='number'&&cssW>0?cssW:900;return clamp(w/(cw<640?560:W),1,2.4);}
function makeBand(k,sc,draw){const b=BAND[k],w=Math.round(b.P*sc),s=w/b.P,h=Math.ceil((b.y1-b.y0)*s),cn=document.createElement('canvas');cn.width=w;cn.height=h;
  const c=cn.getContext('2d');c.setTransform(s,0,0,s,0,-b.y0*s);draw(c,b.P);
  const parts=[];for(const [a,bb,solid,sq] of b.parts){const r0=Math.round((a-b.y0)*s),r1=Math.min(h,Math.round((bb-b.y0)*s));if(r1<=r0)continue;const pc=document.createElement('canvas');pc.width=w;pc.height=r1-r0;
    pc.getContext('2d',solid?{alpha:false}:undefined).drawImage(cn,0,r0,w,r1-r0,0,0,w,r1-r0);parts.push({cv:pc,y0:b.y0+r0/s,sq:!!sq});}
  cn.width=cn.height=0;return{parts,sc:s,P:b.P,f:b.f};}
function bulbSprite(sc){const n=Math.ceil(8*sc),cn=document.createElement('canvas');cn.width=cn.height=n;const c=cn.getContext('2d');c.setTransform(n/8,0,0,n/8,4*n/8,4*n/8);
  glow(c,0,0,4,'#ffcf86',.8);c.fillStyle='#fff6e0';c.beginPath();c.arc(0,0,.8,0,TAU);c.fill();return cn;}
function strips(){const sc=wantScale();if(ST&&Math.abs(sc/ST.sc-1)<.15)return ST;
  if(ST)for(const k of ORDER)for(const p of ST[k].parts)p.cv.width=p.cv.height=0;
  const t0=performance.now();ST={sc};BULB=bulbSprite(wantScale());for(const k of ORDER)ST[k]=makeBand(k,sc,k==='far'?paintFar:k==='mid'?paintMid:k==='street'?paintStreet:paintNear);
  ST.bulb=BULB;ST.ms=performance.now()-t0;return ST;}
const scrollAt=()=>{const v=typeof S!=='undefined'&&S?+S.scroll:0;return isFinite(v)?v:0;};
const offOf=b=>{const o=(scrollAt()*b.f)%b.P;return o<0?o+b.P:o;};
// one part of a band on the screen, over the given stretches of the world's x (all of the view if none): in whole device pixels when the
// screen's scale is the strip's own, else drawn to the world's units
function blitPart(p,b,o,wins){const m=ctx.getTransform(),cw=ctx.canvas.width,ch=ctx.canvas.height,W0=p.cv.width,H0=p.cv.height,L=-m.e/m.a,R=(cw-m.e)/m.a;
  const rs=[];for(const [a,bb] of wins||[[L,R]]){const a2=Math.max(a,L),b2=Math.min(bb,R);if(b2>a2)rs.push([a2,b2]);}if(!rs.length)return;
  if(Math.abs(m.a/b.sc-1)<.004&&!m.b&&!m.c){const dy=Math.round(m.d*p.y0+m.f);if(dy>=ch||dy+H0<=0)return;ctx.save();ctx.setTransform(1,0,0,1,0,0);
    let dx=Math.round(m.a*(-o)+m.e);while(dx>0)dx-=W0;
    for(;dx<cw;dx+=W0)for(const [a,bb] of rs){const sx=Math.max(0,Math.floor(m.a*a+m.e)-dx),ex=Math.min(W0,Math.ceil(m.a*bb+m.e)-dx);if(ex>sx)ctx.drawImage(p.cv,sx,0,ex-sx,H0,dx+sx,dy,ex-sx,H0);}
    ctx.restore();return;}
  const u=1/b.sc;let x=-o;while(x>L)x-=b.P;
  for(;x<R;x+=b.P)for(const [a,bb] of rs){const sx=Math.max(0,Math.floor((a-x)*b.sc)),ex=Math.min(W0,Math.ceil((bb-x)*b.sc));if(ex>sx)ctx.drawImage(p.cv,sx,0,ex-sx,H0,x+sx*u,p.y0,(ex-sx)*u,H0*u);}}
function blit(b,sqWin){const o=offOf(b);for(const p of b.parts)blitPart(p,b,o,p.sq?sqWin:null);}
// ---------- the scene ----------
// what stays still: the night sky with its stars and moon and the clouds lit from under by the city, the farthest towers low in the
// haze, and the Hallowell tower with its ring of cyan light, far off to the right
function paint(c){const X0=RC.x0-20,X1=RC.x0+RC.w+20,T0=RC.y0-30,B0=RC.y0+RC.h+20;
  c.fillStyle=lin(c,0,T0,0,290,[[0,C.night0],[.32,'#090c18'],[.58,'#161828'],[.8,'#30202c'],[1,'#4a2c26']]);c.fillRect(X0,T0,X1-X0,290-T0);
  stars(c,X0,X1,T0,170,170,13,.6);
  moon(c,MOON.x,MOON.y,MOON.r,{phase:.55});
  cloudBank(c,X0,X1,98,30,{seed:9,n:18,col:'#171726',under:'#ff9a5a'});
  skyline(c,X0,X1,252,{seed:44,far:.98,h0:26,h1:96,w0:14,w1:30,col:'#1a1b2b',hazeCol:'#3a2a36',hazeH:110,hazeA:.62,dens:.35});
  hallTower(c,TOWER.x,TOWER.base,TOWER.top,TOWER.w,{lit:.9});
  glow(c,TOWER.x,TOWER.base-50,250,'#ff9a5a',.1,.45);
  haze(c,X0,X1,170,290,'#4a2c30',.35);
  c.fillStyle='#0d0b0f';c.fillRect(X0,290,X1-X0,B0-290);
  strips();}
// what goes by: the bands at their own paces, then the lamps' flames and the Lyric's chasing bulbs over the street's strip
function live(){const T=strips(),t=(typeof S!=='undefined'&&S.t)||0,st=T.street,o=offOf(st),sq=[];
  for(let n=-1;n<=1;n++)sq.push([SQ[0]-o+n*st.P-1,SQ[1]-o+n*st.P+1]);
  blit(T.far,sq);blit(T.mid,sq);blit(st);
  const m=ctx.getTransform(),L=-m.e/m.a,R=(ctx.canvas.width-m.e)/m.a;
  ctx.save();
  for(let n=-1;n<=1;n++){const ox=-o+n*st.P;
    for(const lx of LX){const q=lampHead(lx),x=q.x+ox;if(x<L-40||x>R+40)continue;const f=.93+.07*Math.sin(t*7+lx)*Math.sin(t*3.1+lx*.3);glow(ctx,x,q.y,22,'#fff0cc',.9*f);}
    if(ox+584>L&&ox+340<R&&BULBS.length){ctx.globalCompositeOperation='lighter';const ph=Math.floor(t*9)%3;
      for(let i=0;i<BULBS.length;i++){if((i+ph)%3)continue;const bb=BULBS[i];ctx.drawImage(T.bulb,ox+bb.x-4,bb.y-4,8,8);}ctx.globalCompositeOperation='source-over';}}
  ctx.restore();
  blit(T.near);}
// the light that rims a rider: the lamps as they pass, the Lyric's marquee, and the moon when nothing nearer is lit
function light(f){const P=BAND.street.P,o=offOf(BAND.street),pel=f.p[typeof PEL==='number'?PEL:0],px=pel.x+f.dep*PSX;let wx=0,wy=0,ws=0;
  const add=(x,y,Rr,k)=>{for(let n=-1;n<=1;n++){const sx=x-o+n*P,dd=Math.abs(sx-px);if(dd>=Rr)continue;const w=k*(1-dd/Rr)*(1-dd/Rr);wx+=w*sx;wy+=w*y;ws+=w;}};
  for(const lx of LX){const q=lampHead(lx);add(q.x,q.y,210,1);}
  add(MARQ.x,MARQ.y,190,.8);
  wx+=.06*MOON.x;wy+=.06*MOON.y;ws+=.06;
  return{light:{x:wx/ws-f.dep*PSX,y:wy/ws+f.dep*PSY}};}
E.S.chase={paint,live,light,warm:strips,table:()=>false,div:()=>false};
})();
// ===== ENV CHASE END =====
