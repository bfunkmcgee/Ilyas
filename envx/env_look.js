// ===== ENV LOOK =====
// The fighting grounds in the Noir Gilt look: night, lit by the things in the scene (lanterns, lamps, windows, the stove, the
// city), silhouettes picked out by warm rim light, gold where elves have worked, cyan only where elven light is at work. Detail
// lives above the fight; the floor the fighters stand on stays calm, mid-dark and warm so a black suit reads against it.
// World coordinates and the game's projection: a point (x, y) at depth d is drawn at (x + d*PSX, y - d*PSY).
// Each scene paints its still parts once into a layer (paint) and draws what moves over it every frame (live), with an optional
// pass over the fighters (fore). Scenes register in EnvLook.S by key.
const EnvLook=(()=>{
const TAU=Math.PI*2,lerp=(a,b,t)=>a+(b-a)*t,clamp=(v,a,b)=>v<a?a:v>b?b:v,ss=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
// the palette: shadow and ink, the warm practical light, gold, the cool night, and the elven cyan
const C={ink:'#050508',shadow:'#0b0b11',soot:'#120f13',umber:'#1c140f',backdrop:'#40291a',brown:'#2a1c16',
  gold:'#e2b65a',goldL:'#ffe2a3',goldD:'#8a6a2e',goldDD:'#4a3818',rim:'#ffcf86',amber:'#ffb25e',lamp:'#ffdca6',ember:'#ff8a3c',
  night0:'#04050a',night1:'#0a0d18',night2:'#151a2b',night3:'#222a40',slate:'#1a1f2c',haze:'#2c2433',
  cyan:'#7ff3e3',cyanD:'#2a8a80',cyanL:'#d9fffa',red:'#a8282c',wine:'#5a1420'};
const PX=()=>typeof PSX==='number'?PSX:.2,PY=()=>typeof PSY==='number'?PSY:.75,G0=()=>typeof GB==='number'?GB:470;
const pp=(x,y,d)=>({x:x+d*PX(),y:y-d*PY()});
// ---------- small drawing helpers ----------
function poly(c,pts,fill){c.beginPath();c.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)c.lineTo(pts[i].x,pts[i].y);c.closePath();if(fill){c.fillStyle=fill;c.fill();}}
function line(c,pts,col,w,a){c.save();if(a!=null)c.globalAlpha*=a;c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)c.lineTo(pts[i].x,pts[i].y);c.stroke();c.restore();}
function rect(c,x,y,w,h,col,a){if(a!=null){c.save();c.globalAlpha*=a;}c.fillStyle=col;c.fillRect(x,y,w,h);if(a!=null)c.restore();}
function lin(c,x0,y0,x1,y1,stops){const g=c.createLinearGradient(x0,y0,x1,y1);for(const [o,col] of stops)g.addColorStop(o,col);return g;}
function rad(c,x,y,r0,r1,stops){const g=c.createRadialGradient(x,y,r0,x,y,r1);for(const [o,col] of stops)g.addColorStop(o,col);return g;}
const rgba=(hex,a)=>{const n=parseInt(hex.slice(1),16);return`rgba(${n>>16&255},${n>>8&255},${n&255},${a})`;};
function mix(a,b,t){const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16),f=s=>Math.round(lerp(A>>s&255,B>>s&255,t));return'#'+((1<<24)|(f(16)<<16)|(f(8)<<8)|f(0)).toString(16).slice(1);}
// a soft light added to what is there: sq squashes it vertically
function glow(c,x,y,r,col,a,sq){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=a==null?1:a;c.translate(x,y);if(sq)c.scale(1,sq);
  c.fillStyle=rad(c,0,0,0,r,[[0,rgba(col,1)],[.25,rgba(col,.45)],[.6,rgba(col,.12)],[1,rgba(col,0)]]);c.beginPath();c.arc(0,0,r,0,TAU);c.fill();c.restore();}
// ---------- light: the one soft piece (the style guide's rule 5) ----------
// Every lamp's cone, every beam and searchlight and every spill across a floor is this piece, made once for each colour, spread (its
// source's width over its foot's, in twentieths) and fall, and stamped, scaled and turned. Across it a bell with a brighter core
// whose sides feather from full to nothing over a quarter of its width at the foot (from three quarters to five quarters of the
// nominal half-width: w0 and w1 below are the widths where it is half gone); along it the light fades with the distance from its
// source, coming up softly at the source (lead) so it never starts on a hard line, and gone at its far end (gain: brighter all
// through, the core held at full). Made row by row with a
// gradient across each, so a canvas with no pixel access makes it too.
const SOFT=new Map();
function softSpr(col,r,fall,lead,gain){r=Math.round(clamp(r,0,1)*20)/20;fall=fall||1.3;lead=lead==null?.06:lead;gain=gain||1;const key=col+'|'+r+'|'+fall+'|'+lead+'|'+gain;let cv=SOFT.get(key);if(cv)return cv;
  const w=64,h=192;cv=document.createElement('canvas');cv.width=w;cv.height=h;const g=cv.getContext('2d');if(!g)return cv;const hw=w/2;
  for(let y=0;y<h;y++){const v=(y+.5)/h,e=.8*(r+(1-r)*v)*hw,k=gain*Math.pow(1-v,fall)*(lead>0?ss(v/lead):1);if(k<.002||e<.05)continue;
    const gr=g.createLinearGradient(hw-1.25*e,0,hw+1.25*e,0),at=u=>(u+1.25)/2.5;
    for(const [u,f] of [[-1.25,0],[-.75,.78],[-.3,.95],[0,1],[.3,.95],[.75,.78],[1.25,0]])gr.addColorStop(at(u),rgba(col,clamp(f*k,0,1)));
    g.fillStyle=gr;g.fillRect(hw-1.25*e,y,2.5*e,1.02);}
  SOFT.set(key,cv);return cv;}
// a cone of light from (x, y): w0 across at its source and w1 at its foot (the widths where it is half gone), h long, turned ang from
// straight down (radians, clockwise on the screen); fall: how fast it fades along (1.3 by default)
function softCone(c,x,y,w0,w1,h,col,a,ang,fall){if(!(a>0)||!(h>0)||!(w1>0))return;const S=softSpr(col,w0/w1,fall);c.save();c.globalCompositeOperation='lighter';
  c.globalAlpha=Math.min(1,a);c.translate(x,y);if(ang)c.rotate(ang);c.drawImage(S,-w1*.625,0,w1*1.25,h);c.restore();}
// the same light laid in the ground plane: a spill from a door at (x, depth d) out across the floor toward us, w0 across at the
// door and w1 at its far end, len deep; it is full right at the sill (no lead) and fades more slowly than a cone (g: the floor's
// height on the screen, GB by default; ang: which way it runs in the ground plane, toward us by default, -π/2 along +x)
function softSpill(c,x,d,w0,w1,len,col,a,g,ang){if(!(a>0)||!(len>0)||!(w1>0))return;const S=softSpr(col,w0/w1,.9,.015);c.save();c.globalCompositeOperation='lighter';
  c.globalAlpha=Math.min(1,a);c.transform(1,0,PX(),-PY(),0,g==null?G0():g);c.translate(x,d);c.rotate(ang==null?Math.PI:ang);c.drawImage(S,-w1*.625,0,w1*1.25,len);c.restore();}
// a cone of light falling from (x, y): w0 wide at the top, w1 at the bottom, h tall (the soft piece, as bright at its source as the
// old hard cone was)
function beam(c,x,y,w0,w1,h,col,a){softCone(c,x,y,w0,w1,h,col,a*.92);}
// a band of haze between two heights
function haze(c,x0,x1,y0,y1,col,a,up){c.save();c.globalAlpha=a;c.fillStyle=lin(c,0,y0,0,y1,up?[[0,rgba(col,1)],[1,rgba(col,0)]]:[[0,rgba(col,0)],[1,rgba(col,1)]]);c.fillRect(x0,y0,x1-x0,y1-y0);c.restore();}
// ---------- the gold vine: Kael's trim and the arc-blade's engraving, at the scale of ironwork and frames ----------
// along a path of points: a stem that weaves, a leaf at every few, now and then a curl
function vine(c,pts,o){o=o||{};const col=o.col||C.gold,w=o.w||1,amp=o.amp==null?2:o.amp,every=o.every||3,leaf=o.leaf||3.2,r=rng(o.seed||7);
  const P2=[];for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],n=Math.max(2,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/4));for(let k=0;k<n;k++)P2.push({x:lerp(a.x,b.x,k/n),y:lerp(a.y,b.y,k/n)});}
  P2.push(pts[pts.length-1]);const S=[];let s=0;for(let i=0;i<P2.length;i++){if(i)s+=Math.hypot(P2[i].x-P2[i-1].x,P2[i].y-P2[i-1].y);
    const j=Math.min(P2.length-1,i+1),k=Math.max(0,i-1),tx=P2[j].x-P2[k].x,ty=P2[j].y-P2[k].y,tl=Math.hypot(tx,ty)||1,nx=-ty/tl,ny=tx/tl,wv=Math.sin(s/(o.wave||18)*TAU)*amp;
    S.push({x:P2[i].x+nx*wv,y:P2[i].y+ny*wv,tx:tx/tl,ty:ty/tl,nx,ny,s});}
  c.save();c.lineCap='round';c.lineJoin='round';if(o.shadow!==false){c.strokeStyle=rgba('#000000',.55);c.lineWidth=w+1;c.beginPath();S.forEach((q,i)=>i?c.lineTo(q.x+.4,q.y+.6):c.moveTo(q.x+.4,q.y+.6));c.stroke();}
  c.strokeStyle=col;c.lineWidth=w;c.beginPath();S.forEach((q,i)=>i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y));c.stroke();
  const step=(o.wave||18)/2;let next=step*(.5+r()*.5),side=1;c.fillStyle=col;
  for(const q of S){if(q.s<next)continue;next=q.s+step*(every/2)*(.7+r()*.6);side=-side;const ang=Math.atan2(q.ty,q.tx)+side*.75,L=leaf*(.8+r()*.4);
    c.save();c.translate(q.x+q.nx*side*w*.6,q.y+q.ny*side*w*.6);c.rotate(ang);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(L*.5,-L*.42,L,0);c.quadraticCurveTo(L*.5,L*.42,0,0);c.fill();c.restore();
    if(o.curl&&r()<o.curl){const cr=leaf*.8;c.beginPath();for(let a=0;a<=TAU*1.1;a+=.3){const rr=cr*(1-a/(TAU*1.25));c.lineTo(q.x+q.nx*-side*(cr+rr*Math.cos(a)),q.y+q.ny*-side*(cr+rr*Math.cos(a))+rr*Math.sin(a));}c.lineWidth=w*.8;c.strokeStyle=col;c.stroke();}}
  if(o.hi){c.globalAlpha=.6;c.strokeStyle=o.hi;c.lineWidth=w*.4;c.beginPath();S.forEach((q,i)=>i?c.lineTo(q.x-.3,q.y-.4):c.moveTo(q.x-.3,q.y-.4));c.stroke();}
  c.restore();}
// a wrought scroll: a spiral of iron or gold that ends in a leaf
function scroll(c,x,y,r,dir,col,w,turns){c.save();c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.beginPath();const T=turns||1.6;
  for(let a=0;a<=TAU*T;a+=.12){const rr=r*(1-a/(TAU*T+.6)),q={x:x+dir*Math.cos(a)*rr,y:y-Math.sin(a)*rr};a?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y);}c.stroke();c.restore();}
// lettering in gold leaf: a dark bed, the gilt, a bright edge on top
function gilt(c,text,x,y,size,o){o=o||{};c.save();c.font=(o.style||'italic 700')+' '+size+'px '+(o.font||'"Alegreya SC", Georgia, serif');c.textAlign=o.align||'center';c.textBaseline='alphabetic';
  if(o.track){c.letterSpacing=o.track+'px';}
  c.fillStyle='rgba(0,0,0,.6)';c.fillText(text,x+size*.04,y+size*.06);
  c.fillStyle=lin(c,0,y-size*.8,0,y,[[0,o.hi||C.goldL],[.5,o.col||C.gold],[1,o.lo||C.goldD]]);c.fillText(text,x,y);
  if(o.glow){c.globalCompositeOperation='lighter';c.globalAlpha=o.glow;c.fillStyle=o.col||C.gold;c.shadowColor=o.col||C.gold;c.shadowBlur=size*.6;c.fillText(text,x,y);}
  c.restore();}
// ---------- windows ----------
// a window at (x, y) w by h, in screen units. lit 0..1; o.arch rounds the top; o.mull the panes; o.curtain draws drapes; o.figure a
// silhouette inside; o.cool a cold lit window
function windowPane(c,x,y,w,h,lit,o){o=o||{};const r=o.r||rng((x*13+y*7)|0),arch=o.arch?w/2:0,frame=o.frame||C.ink;
  c.save();c.beginPath();if(arch){c.moveTo(x,y+h);c.lineTo(x,y+arch);c.arc(x+w/2,y+arch,w/2,Math.PI,0);c.lineTo(x+w,y+h);c.closePath();}else c.rect(x,y,w,h);c.clip();
  if(lit>0){const warm=o.cool?['#cfe8ff','#7aa0c8','#2a3550']:['#fff0c8','#ffb866','#7a3a1c'];
    c.fillStyle=lin(c,0,y,0,y+h,[[0,mix(warm[2],warm[1],lit*.45)],[.6,mix(warm[2],warm[1],lit*.85)],[1,mix(warm[2],warm[0],lit*.55)]]);c.fillRect(x,y,w,h);
    if(o.curtain){c.fillStyle=o.curtain;for(const s of [-1,1]){c.beginPath();const x0=s<0?x:x+w;c.moveTo(x0,y);c.lineTo(x0+s*-w*.3,y);c.quadraticCurveTo(x0+s*-w*.18,y+h*.5,x0+s*-w*.26,y+h);c.lineTo(x0,y+h);c.closePath();c.fill();}}
    if(o.figure){c.fillStyle=rgba(C.ink,.85);const fx=x+w*(.3+r()*.4),fy=y+h*.35;c.beginPath();c.arc(fx,fy,w*.09,0,TAU);c.fill();c.beginPath();c.moveTo(fx-w*.16,y+h);c.quadraticCurveTo(fx-w*.15,fy+w*.08,fx,fy+w*.1);c.quadraticCurveTo(fx+w*.15,fy+w*.08,fx+w*.16,y+h);c.fill();}
    if(o.lamp){c.fillStyle=rgba('#fff3d0',.9);c.beginPath();c.arc(x+w*o.lamp,y+h*.3,Math.max(1,w*.05),0,TAU);c.fill();}
  }else{c.fillStyle=lin(c,0,y,0,y+h,[[0,o.sky||'#1c2235'],[1,'#07080d']]);c.fillRect(x,y,w,h);
    // a dark pane catches a streak of the city's light
    c.globalAlpha=.25;c.strokeStyle=o.refl||'#8a7a8a';c.lineWidth=w*.12;c.beginPath();c.moveTo(x+w*.2,y+h);c.lineTo(x+w*.75,y);c.stroke();c.globalAlpha=1;}
  c.restore();
  // the frame and the glazing bars
  c.save();c.strokeStyle=frame;c.lineWidth=o.fw||Math.max(1,w*.07);c.beginPath();if(arch){c.moveTo(x,y+h);c.lineTo(x,y+arch);c.arc(x+w/2,y+arch,w/2,Math.PI,0);c.lineTo(x+w,y+h);c.closePath();}else c.rect(x,y,w,h);c.stroke();
  const mull=o.mull==null?2:o.mull;c.lineWidth=Math.max(.6,w*.04);c.beginPath();
  if(mull>=1){c.moveTo(x+w/2,y+(arch?0:0));c.lineTo(x+w/2,y+h);}if(mull>=2){for(const f of o.rows||[.45]){c.moveTo(x,y+h*f);c.lineTo(x+w,y+h*f);}}c.stroke();
  if(lit>0&&o.spill!==false){c.globalCompositeOperation='lighter';c.globalAlpha=(o.spillA||.08)*lit;c.fillStyle=rad(c,x+w/2,y+h/2,0,Math.max(w,h)*.85,[[0,'rgba(255,200,130,1)'],[1,'rgba(255,170,100,0)']]);c.fillRect(x-w,y-h*.5,w*3,h*2);}
  c.restore();}
// ---------- textures ----------
// courses of brick on a flat face from (x0, y0) to (x1, y1) in screen units
function bricks(c,x0,y0,x1,y1,o){o=o||{};const bh=o.h||5,bw=o.w||12,r=rng(o.seed||3);c.save();c.beginPath();c.rect(x0,y0,x1-x0,y1-y0);c.clip();
  c.fillStyle=o.base||'#2a1a18';c.fillRect(x0,y0,x1-x0,y1-y0);
  for(let y=y0,row=0;y<y1;y+=bh,row++)for(let x=x0-(row%2)*bw/2;x<x1;x+=bw){const v=r();c.fillStyle=v<.33?o.c1||'#33201c':v<.66?o.c2||'#2c1c19':o.c3||'#3a2420';c.fillRect(x+.5,y+.5,bw-1,bh-1);}
  c.strokeStyle=o.mortar||'rgba(0,0,0,.35)';c.lineWidth=.5;c.beginPath();for(let y=y0;y<y1;y+=bh){c.moveTo(x0,y);c.lineTo(x1,y);}c.stroke();c.restore();}
// a floor of setts (cobbles) between depths d0 and d1 from x0 to x1 at ground height g: each a rounded stone, each catching
// its share of light; wet ones mirror what is above them
function setts(c,x0,x1,d0,d1,g,o){o=o||{};const r=rng(o.seed||11),rowD=o.rowD||5.5,len=o.len||11;
  for(let d=d1;d>=d0;d-=rowD){const rowOff=r()*len;const fade=clamp((d-d0)/(d1-d0),0,1);
    for(let x=x0-rowOff;x<x1;x+=len*(.8+r()*.4)){const w=len*(.75+r()*.25),a=pp(x,g,d),b=pp(x+w,g,d),e=pp(x+w,g,d-rowD*.82),f=pp(x,g,d-rowD*.82);
      const v=r(),base=mix(o.c0||'#2a2226',o.c1||'#3e3236',v*.8+.1);c.fillStyle=mix(base,o.far||'#1d1a22',fade*.5);
      c.beginPath();c.moveTo(a.x+1,a.y);c.lineTo(b.x-1,b.y);c.quadraticCurveTo(b.x,b.y,e.x,e.y-.4);c.lineTo(f.x+1,f.y);c.quadraticCurveTo(a.x,a.y,a.x+1,a.y);c.fill();
      if(r()<.55){c.fillStyle=rgba(o.hi||'#e8c9a0',.06+.08*r());c.fillRect(f.x+1,f.y-.2,(e.x-f.x)*.7,.8);}}}}
// flagstones on a pavement
function flags(c,x0,x1,d0,d1,g,o){o=o||{};const r=rng(o.seed||17),fl=o.len||34,fd=o.dep||16;
  for(let d=d1;d>d0;d-=fd)for(let x=x0-(r()*fl);x<x1;x+=fl){const a=pp(x,g,d),b=pp(x+fl,g,d),e=pp(x+fl,g,Math.max(d0,d-fd)),f=pp(x,g,Math.max(d0,d-fd));
    c.fillStyle=mix(o.c0||'#3a3036',o.c1||'#4a3e40',r());poly(c,[a,b,e,f]);c.fill();c.strokeStyle=rgba('#000000',.35);c.lineWidth=.6;c.stroke();}}
// a reflection on wet stone below a light: short bright dashes on the tops of the stones, thinning out away from the light
function wetStreak(c,x,y0,y1,w,col,a,seed){const r=rng(seed||51);c.save();c.globalCompositeOperation='lighter';
  const n=Math.floor((y1-y0)*1.4);for(let i=0;i<n;i++){const u=Math.pow(r(),1.3),y=lerp(y0,y1,u),k=Math.pow(1-u,1.6),ww=w*(.35+.65*k)*(.4+r()*.9),xx=x+(r()-.5)*w*(.5+u*1.4);
    c.fillStyle=rgba(col,a*k*(.4+.6*r()));c.fillRect(xx-ww/2,y,ww,.6+r()*1.1);}
  c.fillStyle=lin(c,0,y0,0,y1,[[0,rgba(col,a*.35)],[1,rgba(col,0)]]);c.beginPath();c.moveTo(x-w*.2,y0);c.lineTo(x+w*.2,y0);c.lineTo(x+w*.7,y1);c.lineTo(x-w*.7,y1);c.closePath();c.fill();c.restore();}
// ---------- skies ----------
function stars(c,x0,x1,y0,y1,n,seed,a){const r=rng(seed||5);for(let i=0;i<n;i++){const x=lerp(x0,x1,r()),y=lerp(y0,y1,Math.pow(r(),1.4)),s=r()<.9?.7:1.4;c.fillStyle=rgba('#fff4e0',(a||.7)*(.3+r()*.7));c.fillRect(x,y,s,s);}}
// a moon with its halo; phase 0 full
function moon(c,x,y,r,o){o=o||{};glow(c,x,y,r*7,o.halo||'#ffe7c0',.16);glow(c,x,y,r*2.6,o.halo||'#ffe7c0',.3);
  c.save();c.fillStyle=rad(c,x-r*.3,y-r*.3,r*.1,r*1.2,[[0,'#fffaf0'],[1,'#f0dcb8']]);c.beginPath();c.arc(x,y,r,0,TAU);c.fill();
  c.fillStyle=rgba('#c8b090',.35);for(const [dx,dy,rr] of [[-.3,-.1,.22],[.25,.2,.16],[.05,-.35,.12],[.32,-.25,.09]]){c.beginPath();c.arc(x+dx*r,y+dy*r,rr*r,0,TAU);c.fill();}
  if(o.phase){c.globalCompositeOperation='destination-out';c.beginPath();c.arc(x+r*o.phase,y-r*.1,r*1.02,0,TAU);c.fill();}c.restore();}
// clouds as long soft bands, their undersides lit by the city
function cloudBank(c,x0,x1,y,h,o){o=o||{};const r=rng(o.seed||21);c.save();
  for(let i=0;i<(o.n||14);i++){const cx=lerp(x0,x1,r()),cw=60+r()*160,ch=h*(.4+r()*.6),cy=y+(r()-.5)*h;
    c.fillStyle=rad(c,cx,cy,0,cw,[[0,rgba(o.col||'#1d1e2e',.85)],[1,rgba(o.col||'#1d1e2e',0)]]);c.save();c.translate(cx,cy);c.scale(1,ch/cw);c.beginPath();c.arc(0,0,cw,0,TAU);c.fill();c.restore();
    if(o.under){c.globalCompositeOperation='lighter';c.fillStyle=rad(c,cx,cy+ch*.6,0,cw*.8,[[0,rgba(o.under,.2)],[1,rgba(o.under,0)]]);c.save();c.translate(cx,cy+ch*.6);c.scale(1,.25);c.beginPath();c.arc(0,0,cw*.8,0,TAU);c.fill();c.restore();c.globalCompositeOperation='source-over';}}
  c.restore();}
// ---------- the city ----------
// a row of distant towers on a base line, hazed by distance (0 near, 1 far): lit windows as specks
function skyline(c,x0,x1,base,o){o=o||{};const r=rng(o.seed||31),far=o.far==null?.6:o.far,col=mix(o.col||'#151827',o.hazeCol||'#2a2436',far*.7);let x=x0;
  while(x<x1){const w=(o.w0||18)+r()*(o.w1||40),h=(o.h0||30)+Math.pow(r(),1.6)*(o.h1||120),top=base-h;c.fillStyle=col;c.fillRect(x,top,w,h+2);
    const roof=r();if(roof<.18){c.beginPath();c.moveTo(x,top);c.lineTo(x+w/2,top-w*.7);c.lineTo(x+w,top);c.fill();}
    else if(roof<.3){c.beginPath();c.arc(x+w/2,top,w/2,Math.PI,0);c.fill();if(r()<.6){c.fillRect(x+w/2-.6,top-w/2-8,1.2,8);}}
    else if(roof<.45){c.fillRect(x+w*.3,top-6-r()*10,w*.4,8);}
    if(o.lights!==false){const n=Math.floor(w*h/90*(o.dens||1));for(let i=0;i<n;i++){if(r()>.38)continue;const wx=x+2+r()*(w-4),wy=top+4+r()*(h-6);c.fillStyle=rgba(r()<.85?'#ffcf86':'#cfe8ff',(.25+.5*r())*(1-far*.6));c.fillRect(wx,wy,1.1,1.4);}}
    if(o.rim){c.fillStyle=rgba(o.rim,.25*(1-far));c.fillRect(x+w-1,top,1,h);}
    x+=w+(r()<.25?r()*14:0);}
  if(o.haze!==false)haze(c,x0,x1,base-(o.hazeH||60),base+2,o.hazeCol||'#2a2436',o.hazeA==null?.55:o.hazeA);}
// the Hallowell tower: a black elven spire with gold fins, ranks of lit floors and a crown that holds a ring of cyan light
function hallTower(c,x,base,top,w,o){o=o||{};const h=base-top,s=w/40,dark=o.col||'#0d0f18',lit=o.lit==null?1:o.lit;c.save();
  // the shaft, stepping in as it rises
  const steps=[[0,1],[.55,.86],[.78,.72],[.9,.56]];
  for(let i=0;i<steps.length;i++){const [f,k]=steps[i],y0=base-h*f,y1=i+1<steps.length?base-h*steps[i+1][0]:top+h*.04,ww=w*k;
    c.fillStyle=lin(c,x-ww/2,0,x+ww/2,0,[[0,mix(dark,'#000000',.3)],[.5,dark],[.85,mix(dark,'#2a2a3a',.5)],[1,mix(dark,'#000000',.2)]]);c.fillRect(x-ww/2,y1,ww,y0-y1+1);
    // floors lit in ranks
    const rows=Math.floor((y0-y1)/(4*s)),cols=Math.max(2,Math.floor(ww/(5*s)));const r=rng(77+i);
    for(let j=1;j<rows;j++)for(let k2=0;k2<cols;k2++){if(r()<.42)continue;const wx=x-ww/2+(k2+.5)*ww/cols-.8*s,wy=y0-j*4*s;c.fillStyle=rgba(r()<.9?'#ffcf86':'#e8f4ff',(.35+.5*r())*lit);c.fillRect(wx,wy,1.6*s,1.6*s);}
    // gold fins at the corners of each stage
    c.fillStyle=rgba(C.gold,.75);c.fillRect(x-ww/2,y1,.9*s,y0-y1);c.fillRect(x+ww/2-.9*s,y1,.9*s,y0-y1);
    c.fillStyle=rgba(C.goldL,.9);c.fillRect(x-ww/2-1*s,y1,ww+2*s,1.1*s);}
  // the crown: gold blades rising to a needle, a ring of cyan light inside them
  const cy=top+h*.04,cw=w*.56;c.fillStyle=C.gold;
  for(let k2=-2;k2<=2;k2++){const bx=x+k2*cw*.22,bh=h*.07*(1-Math.abs(k2)*.25);c.beginPath();c.moveTo(bx-cw*.06,cy);c.lineTo(bx,cy-bh);c.lineTo(bx+cw*.06,cy);c.closePath();c.fill();}
  c.fillStyle=dark;c.fillRect(x-.8*s,top-h*.16,1.6*s,h*.16);c.fillStyle=C.goldL;c.fillRect(x-.4*s,top-h*.2,.8*s,h*.1);
  glow(c,x,cy-h*.03,w*.9,C.cyan,.55*lit,.5);glow(c,x,top-h*.19,w*.4,C.cyanL,.8*lit);
  c.strokeStyle=rgba(C.cyan,.9*lit);c.lineWidth=1.2*s;c.beginPath();c.ellipse(x,cy-h*.025,cw*.42,cw*.1,0,0,TAU);c.stroke();
  // the house's H, gilt, high on the shaft
  if(o.H!==false){const hy=base-h*.62,hs=w*.34;c.fillStyle=rgba(C.goldL,.95*lit);c.fillRect(x-hs/2,hy-hs*.6,hs*.2,hs*1.2);c.fillRect(x+hs/2-hs*.2,hy-hs*.6,hs*.2,hs*1.2);c.fillRect(x-hs/2,hy-hs*.08,hs,hs*.16);glow(c,x,hy,hs*2.2,C.amber,.35*lit);}
  c.restore();}
// the ground in front of the fight: an upright phone's push-in shows it down to y 870, the foot of a still layer (RC, sk_envui.js), so
// each place's floor runs on to FOOT (depth NEAR on the ground plane), its material calm and the light falling off toward us
const NEAR=-540,FOOT=875;
// the light falling off toward us over the ground in front: a darkening from y0 down to FOOT, its stops at world heights ([y, alpha])
function fallOff(c,x0,x1,y0,stops,col){const g=c.createLinearGradient(0,y0,0,FOOT);for(const [y,a] of stops)g.addColorStop(clamp((y-y0)/(FOOT-y0),0,1),rgba(col||'#000000',a));
  c.fillStyle=g;c.fillRect(x0,y0,x1-x0,FOOT-y0);}
// A place's darkening toward us as it always was down to the fight's front (y GB+20; its stops at world heights), then held there and
// deepening only by k more at FOOT: the ground in front of the fight stays in the fight's light rather than going to black (it was
// the edge of the world, faded out under the black at the world's foot).
function fallKeep(c,x0,x1,y0,stops,col,k){const yk=G0()+20;let v=stops[stops.length-1][1];
  for(let i=0;i<stops.length;i++){const [ya,a]=stops[i];if(ya>=yk){const [yp,ap]=i?stops[i-1]:[ya,a];v=ya>yp?ap+(a-ap)*(yk-yp)/(ya-yp):a;break;}}
  const kk=k==null?.08:k;fallOff(c,x0,x1,y0,stops.filter(s=>s[0]<yk).concat([[yk,v],[G0()+110,v+kk*.4],[FOOT,v+kk]]),col);}
// ---------- the finish (the style guide's rule 6) ----------
// The picture as a camera takes it, in every place from this one pass (since V79; before, the fall's alone), once the world and its
// sparks are drawn and before the fight's words, the head bars and the labels (drawFx, sk_ui.js), the badges, the story's words and
// its bars: the light blooms (the frame shrunk to an eighth, its bright parts drawn
// out by multiplying it by itself), and in a set piece runs out sideways from every bright point in the long streaks a cinema lens
// makes; the edges of the picture darken (along both sides and the foot, not the top, where the moon and the sun are; the corners
// where two bands cross the darkest), between the story's bars; and on a screen 640 points and up a fine grain moves over it (still
// where motion is reduced). Full effects: all of it. Lite: the edges. Off: none. The frame is gone over whole only twice (the light,
// the grain), the dark only along the edges, and nothing in a blend that costs more than laying one picture over another. It only
// draws: the game never reads what it keeps.
// o: {glow (the bloom's strength), streak (the streaks', 0 for none), streakCol, edges (the dark's strength at the edge), edgeCol}
const FN={B:null,S:null,C:null,M:null,E:null,pat:null,last:{bloom:0,vig:0,n:0}};
function fnCv(c,w,h){c=c||document.createElement('canvas');if(c.width!==w||c.height!==h){c.width=w;c.height=h;}return c;}
// the grain, a tile drawn once: specks a little lighter or a little darker than what is under them, laid plainly over it
function grainPat(x){if(FN.pat&&FN.pat.x===x)return FN.pat.p;const c=fnCv(null,128,128),g=c.getContext('2d'),im=g.createImageData(128,128),r=rng(907);
  for(let i=0;i<128*128;i++){const v=(r()+r()+r()-1.5)/1.5,lv=v>0?255:0;im.data[i*4]=im.data[i*4+1]=im.data[i*4+2]=lv;im.data[i*4+3]=Math.round(Math.min(1,Math.abs(v)*1.4)*255);}
  g.putImageData(im,0,0);FN.pat={x,p:x.createPattern(c,'repeat')};return FN.pat.p;}
// how far the story's bars are in (sk_storyui.js draws them after this, a tenth of the height each at full)
function fnBars(){return typeof ST_LB==='number'?clamp(ST_LB,0,1):0;}
// (the bands drawn once at half the size for each strength, colour and place of the bars, and laid on a band at a time without
// smoothing: soft as they are, the halving does not show, and a gradient filled at full size costs a CPU canvas three times as much)
function fnEdges(x,W2,H2,a,col){const bar=Math.floor(H2*.105*fnBars()),y0=bar,ih=H2-2*bar;if(ih<8||!(a>0))return;FN.last.vig=a;
  const w=Math.ceil(W2/2),h=Math.ceil(H2/2),y0h=Math.floor(y0/2),ihh=Math.max(1,h-2*y0h),vw=Math.ceil(w*.16),vh=Math.ceil(ihh*.16),key=w+'|'+h+'|'+y0h+'|'+a.toFixed(3)+'|'+col;
  let E=FN.E;if(!E||E.key!==key){const c=fnCv(E&&E.cv,w,h),g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.clearRect(0,0,w,h);
    const band=(x0,y0g,x1,y1g)=>{const gr=g.createLinearGradient(x0,y0g,x1,y1g);gr.addColorStop(0,rgba(col,a));gr.addColorStop(.4,rgba(col,a*.38));gr.addColorStop(1,rgba(col,0));return gr;};
    g.fillStyle=band(0,0,vw,0);g.fillRect(0,y0h,vw,ihh);g.fillStyle=band(w,0,w-vw,0);g.fillRect(w-vw,y0h,vw,ihh);
    g.fillStyle=band(0,y0h+ihh,0,y0h+ihh-vh);g.fillRect(0,y0h+ihh-vh,w,vh);E=FN.E={key,cv:c};}
  x.globalCompositeOperation='source-over';x.globalAlpha=1;const sm=x.imageSmoothingEnabled;x.imageSmoothingEnabled=false;
  x.drawImage(E.cv,0,y0h,vw,ihh,0,y0h*2,vw*2,ihh*2);x.drawImage(E.cv,w-vw,y0h,vw,ihh,(w-vw)*2,y0h*2,vw*2,ihh*2);
  if(w>2*vw)x.drawImage(E.cv,vw,y0h+ihh-vh,w-2*vw,vh,vw*2,(y0h+ihh-vh)*2,(w-2*vw)*2,vh*2);x.imageSmoothingEnabled=sm;}
function finish(o){const x=typeof ctx!=='undefined'?ctx:null,cv0=x&&x.canvas;if(!cv0||!cv0.width||!o)return;const q=typeof FXL!=='undefined'?FXL.q:'full';if(q==='off')return;
  const W2=cv0.width,H2=cv0.height,edgeCol=o.edgeCol||'#04030a';x.save();x.setTransform(1,0,0,1,0,0);FN.last.n++;
  if(q==='full'&&o.glow>0){
    // the light alone: the frame an eighth the size, multiplied by itself twice
    const bw=Math.max(24,Math.round(W2/8)),bh=Math.max(24,Math.round(H2/8)),B=FN.B=fnCv(FN.B,bw,bh),g=B.getContext('2d');
    g.globalCompositeOperation='copy';g.globalAlpha=1;g.imageSmoothingEnabled=true;g.drawImage(cv0,0,0,bw,bh);
    g.globalCompositeOperation='multiply';g.drawImage(B,0,0);g.drawImage(B,0,0);
    const Cc=FN.C=fnCv(FN.C,bw,bh),h3=Cc.getContext('2d');h3.globalCompositeOperation='copy';
    if(o.streak>0){
      // the streaks: that light smeared out sideways, and coloured
      const SS=FN.S=fnCv(FN.S,bw,bh),h2=SS.getContext('2d');h2.globalCompositeOperation='copy';h2.globalAlpha=1;h2.drawImage(B,0,0);h2.globalCompositeOperation='lighter';
      for(const [f,a] of [[.012,.55],[.028,.36],[.055,.22],[.1,.12],[.17,.06]])for(const sg of [-1,1]){h2.globalAlpha=a;h2.drawImage(B,sg*f*bw,0);}
      h2.globalCompositeOperation='multiply';h2.globalAlpha=1;h2.fillStyle=o.streakCol||'#7fb0ff';h2.fillRect(0,0,bw,bh);
      h3.globalAlpha=clamp(o.streak,0,1);h3.drawImage(SS,0,0);h3.globalCompositeOperation='lighter';}
    h3.globalAlpha=clamp(o.glow,0,1);h3.drawImage(B,0,0);FN.last.bloom=o.glow;
    // the moment's big glows and a crit's flash, soft, in the light at its size (FXL.glows: they are not drawn over the frame then)
    if(typeof FXL!=='undefined'&&FXL.glows){const G=FXL.glows();if(G.length){h3.globalCompositeOperation='lighter';const k=bw/W2;for(const q of G){h3.globalAlpha=clamp(q.a,0,1);h3.drawImage(q.img,(q.x-q.R)*k,(q.y-q.R)*k,q.R*2*k,q.R*2*k);}}}
    // (the dark at the edges first, so that a lamp or the sun in a corner keeps its glow; only between the bars: what they cover is
    // not drawn)
    fnEdges(x,W2,H2,o.edges,edgeCol);
    // (the light brought up to half the size smoothly, then laid over the frame at twice that without smoothing: soft as it is,
    // nothing of the last doubling shows, and an eighth's picture smoothed up over a whole frame costs a CPU canvas half as much again)
    const y0=Math.floor(H2*.105*fnBars()),mw=Math.ceil(W2/2),mh=Math.ceil(H2/2),Mc=FN.M=fnCv(FN.M,mw,mh),mg=Mc.getContext('2d');
    mg.globalCompositeOperation='copy';mg.globalAlpha=1;mg.imageSmoothingEnabled=true;mg.drawImage(Cc,0,0,bw,bh,0,0,mw,mh);
    const sm=x.imageSmoothingEnabled;x.imageSmoothingEnabled=false;x.globalCompositeOperation='screen';x.globalAlpha=1;
    const y0h=Math.floor(y0/2);x.drawImage(Mc,0,y0h,mw,mh-2*y0h,0,y0h*2,mw*2,(mh-2*y0h)*2);x.imageSmoothingEnabled=sm;}
  else fnEdges(x,W2,H2,o.edges,edgeCol);
  // the grain, moving (still where motion is reduced), a pixel of the canvas (not on a phone's small screen, where it would not show
  // and the frame cannot spare it)
  if(q==='full'&&typeof cssW==='number'&&cssW>=640){const pt=grainPat(x),f=(typeof S!=='undefined'&&S._rf)||0,rm=typeof reduceMotion!=='undefined'&&reduceMotion,ox=rm?0:(f*53)%128,oy=rm?0:(f*97)%128,y0=Math.floor(H2*.105*fnBars());
    x.globalCompositeOperation='source-over';x.globalAlpha=.05;x.fillStyle=pt;x.translate(-ox,-oy);x.fillRect(ox,y0+oy,W2,H2-2*y0);}
  x.restore();}
return{TAU,lerp,clamp,ss,rng,C,pp,poly,line,rect,lin,rad,rgba,mix,glow,beam,softCone,softSpill,softSpr,haze,vine,scroll,gilt,windowPane,bricks,setts,flags,wetStreak,stars,moon,cloudBank,skyline,hallTower,NEAR,FOOT,fallOff,fallKeep,finish,finishLast:FN.last,S:{}};
})();
// ===== ENV LOOK END =====
