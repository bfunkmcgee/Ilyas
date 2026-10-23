// ===== FX GUNS =====
// The prologue's gunplay, in the Noir Gilt look: what a shot, a hit and an explosion look like (FxLook), and the guns themselves in a
// fighter's hands (GunLook).
// FxLook draws effects in world coordinates (x, y up from nothing: the game's y, down the screen) at a depth d, projected the game's
// way (x+d*PSX, y-d*PSY). Each effect is a record the sim keeps (where, when it started, a seed) and each drawing is a pure function of
// that record and o.now, so the same moment always looks the same. Soft shapes (fire, smoke, glow) are stamped from sprites painted
// once; sparks and streaks are drawn as lines.
// GunLook draws a gun along the line from the hand (the grip) to the weapon's tip point, the way ArmsLook draws a blade: the same
// calling convention, mirrored by the fighter's facing so the sights are always up. Kael's rifle is the rifle that rides in his bike's
// scabbard (VehLook.rifle), the same parts and the same colours.
const FxLook=(()=>{
const TAU=Math.PI*2,lerp=(a,b,t)=>a+(b-a)*t,clamp=(v,a,b)=>v<a?a:v>b?b:v,ss=(a,b,t)=>{t=clamp((t-a)/(b-a),0,1);return t*t*(3-2*t);};
const rgba=(hex,a)=>{const n=parseInt(hex.slice(1),16);return`rgba(${n>>16&255},${n>>8&255},${n&255},${clamp(a,0,1).toFixed(3)})`;};
const PX=()=>typeof PSX==='number'?PSX:.2,PY=()=>typeof PSY==='number'?PSY:.75,GY=()=>typeof GB==='number'?GB:470;
const pj=(x,y,d)=>({x:x+d*PX(),y:y-d*PY()});
function rng(a){a|=0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const seedOf=r=>r.seed!=null?r.seed|0:Math.round((r.t0||0)*1000)*2654435761|0;
function canvas(w,h){if(typeof OffscreenCanvas!=='undefined')return new OffscreenCanvas(w,h);const v=document.createElement('canvas');v.width=w;v.height=h;return v;}

// ---------- sprites, painted once ----------
const SPR={};
function sprite(key,w,h,fn){let s=SPR[key];if(!s){const cv=canvas(w,h),c=cv.getContext('2d');fn(c,w,h);s=SPR[key]=cv;}return s;}
// a soft round glow, bright in the middle
function glowSpr(col){return sprite('g'+col,64,64,(c,n)=>{const h=n/2,g=c.createRadialGradient(h,h,0,h,h,h);
  g.addColorStop(0,rgba(col,1));g.addColorStop(.18,rgba(col,.6));g.addColorStop(.45,rgba(col,.18));g.addColorStop(1,rgba(col,0));c.fillStyle=g;c.fillRect(0,0,n,n);});}
// a lumpy puff (four shapes): soft discs heaped together, coloured from ci in the middle to co at the rim; grain adds texture to smoke
function puffSpr(v,ci,co,grain){return sprite('p'+v+ci+co+(grain||0),96,96,(c,n)=>{const R=rng(17+v*131),h=n/2;
  // a body, then billows round its edge, then bites out of the rim: a cauliflower, not a ball
  for(let i=0;i<7;i++){const a=R()*TAU,r=R()*h*.22,x=h+Math.cos(a)*r,y=h+Math.sin(a)*r,rr=h*(.36+R()*.16),g=c.createRadialGradient(x,y,0,x,y,rr);
    g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.6,'rgba(255,255,255,.85)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,rr,0,TAU);c.fill();}
  for(let i=0;i<11;i++){const a=i/11*TAU+R()*.5,r=h*(.38+R()*.12),x=h+Math.cos(a)*r,y=h+Math.sin(a)*r,rr=h*(.13+R()*.12),g=c.createRadialGradient(x,y,0,x,y,rr);
    g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.7,'rgba(255,255,255,.6)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,rr,0,TAU);c.fill();}
  c.globalCompositeOperation='destination-out';for(let i=0;i<14;i++){const a=R()*TAU,r=h*(.6+R()*.3),x=h+Math.cos(a)*r,y=h+Math.sin(a)*r,rr=h*(.08+R()*.1);c.fillStyle='rgba(0,0,0,.55)';c.beginPath();c.arc(x,y,rr,0,TAU);c.fill();}
  c.globalCompositeOperation='source-over';
  c.globalCompositeOperation='source-in';const g=c.createRadialGradient(h*.92,h*.88,0,h,h,h*.95);g.addColorStop(0,ci);g.addColorStop(1,co);c.fillStyle=g;c.fillRect(0,0,n,n);
  if(grain){c.globalCompositeOperation='source-atop';for(let i=0;i<260;i++){const x=R()*n,y=R()*n;c.fillStyle=R()<.5?`rgba(0,0,0,${.12*grain})`:`rgba(255,255,255,${.05*grain})`;c.fillRect(x,y,1.6,1.6);}}});}
// a tongue of flame (three shapes): white-gold at the root, orange, a dark red tip that fades out
function tongueSpr(v){return sprite('t'+v,48,96,(c,w,h)=>{const R=rng(91+v*57),sw=(R()-.5)*14,k=R()*6;
  c.beginPath();c.moveTo(8,h);c.bezierCurveTo(-4+k,h*.62,14+sw,h*.38,24+sw,2);c.bezierCurveTo(30+sw,h*.34,52-k,h*.6,40,h);c.closePath();
  const g=c.createLinearGradient(0,h,0,0);g.addColorStop(0,'rgba(255,246,214,1)');g.addColorStop(.18,'rgba(255,214,120,.98)');g.addColorStop(.45,'rgba(255,142,48,.9)');
  g.addColorStop(.72,'rgba(214,66,24,.6)');g.addColorStop(1,'rgba(120,24,12,0)');c.fillStyle=g;c.fill();
  // a softer edge: the same shape a little wider and faint behind
  c.globalCompositeOperation='destination-over';c.scale(1.18,1);c.translate(-3.6,0);c.globalAlpha=.35;c.fill();
  // the root fades into whatever it burns on
  c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='destination-in';const m=c.createLinearGradient(0,h,0,h*.8);m.addColorStop(0,'rgba(0,0,0,.25)');m.addColorStop(1,'rgba(0,0,0,1)');c.fillStyle=m;c.fillRect(0,0,w,h);});}
// the fireball's colours by heat: 1 white-hot to 0 a smoky ember
const HEAT=[['#fffbe8','#ffe7a0'],['#fff1b0','#ffb347'],['#ffc861','#ff7a1c'],['#ff9a3a','#d8461a'],['#d8561e','#8a2410'],['#7a2a14','#2e1410']];
function heatOps(L,T,v,x,y,r,a,rot){const f=clamp(1-T,0,.9999)*(HEAT.length-1),i=Math.floor(f),u=f-i;
  if(u<.25){L.push({s:puffSpr(v,HEAT[i][0],HEAT[i][1]),x,y,r,a,rot});return;}if(u>.75){L.push({s:puffSpr(v,HEAT[i+1][0],HEAT[i+1][1]),x,y,r,a,rot});return;}
  const w=(u-.25)*2;L.push({s:puffSpr(v,HEAT[i][0],HEAT[i][1]),x,y,r,a:a*(1-w),rot});L.push({s:puffSpr(v,HEAT[i+1][0],HEAT[i+1][1]),x,y,r,a:a*w,rot});}
// a sprite centred on (x, y), radius r, turned by rot to the nearest quarter: the turned copies are painted once, so every stamp is a
// plain scaled copy (a turned draw costs a renderer without a GPU several times as much)
function quarter(s,q){const R=s.__q||(s.__q=[s]);if(!R[q]){const w=s.width,h=s.height,cv=canvas(w,h),c=cv.getContext('2d');c.translate(w/2,h/2);c.rotate(q*Math.PI/2);c.drawImage(s,-w/2,-h/2);R[q]=cv;}return R[q];}
function stamp(c,s,x,y,r,a,rot){if(a<=.004||r<=.2)return;c.globalAlpha=Math.min(1,a);
  if(rot){const q=((Math.round(rot/(Math.PI/2))%4)+4)%4;if(q)s=quarter(s,q);}c.drawImage(s,x-r,y-r,r*2,r*2);}
// Soft layers (smoke, dust, the fireball, glow) are stamped into a small offscreen at a fraction of the screen's resolution and laid
// over the scene in one draw: on a renderer without a GPU that costs a fraction of stamping them at full size. ops: {s,x,y,r,a,rot,comp}
// in the world's plane; div the divisor of the resolution; comp how the layer goes over the scene.
const BUF={};
function bufFor(name,w,h){let B=BUF[name];if(!B||B.cv.width<w||B.cv.height<h){const cv=canvas(Math.max(w,B?B.cv.width:0,64),Math.max(h,B?B.cv.height:0,64));B=BUF[name]={cv,c:cv.getContext('2d')};}return B;}
function soft(c,name,ops,div,comp){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for(const o of ops){if(o.a<=.004||o.r<=.2)continue;const r=o.r;if(o.x-r<x0)x0=o.x-r;if(o.y-r<y0)y0=o.y-r;if(o.x+r>x1)x1=o.x+r;if(o.y+r>y1)y1=o.y+r;}
  if(x1<=x0)return;const T=c.getTransform(),sc=Math.hypot(T.a,T.b)||1,cv=c.canvas;
  // only what the screen shows (a cloud risen off the top costs nothing up there)
  if(cv&&T.a>0&&T.d>0){x0=Math.max(x0,-T.e/T.a-8);x1=Math.min(x1,(cv.width-T.e)/T.a+8);y0=Math.max(y0,-T.f/T.d-8);y1=Math.min(y1,(cv.height-T.f)/T.d+8);if(x1<=x0||y1<=y0)return;}
  let k=sc/div;const big=Math.max((x1-x0)*k,(y1-y0)*k);if(big>2048)k*=2048/big;
  const w=Math.ceil((x1-x0)*k)+2,h=Math.ceil((y1-y0)*k)+2,B=bufFor(name,w,h),b=B.c;
  b.setTransform(1,0,0,1,0,0);b.globalAlpha=1;b.globalCompositeOperation='source-over';b.clearRect(0,0,w,h);b.setTransform(k,0,0,k,-x0*k,-y0*k);
  for(const o of ops){if(o.comp)b.globalCompositeOperation=o.comp;stamp(b,o.s,o.x,o.y,o.r,o.a,o.rot);if(o.comp)b.globalCompositeOperation='source-over';}
  c.save();c.globalAlpha=1;c.globalCompositeOperation=comp||'source-over';c.drawImage(B.cv,0,0,w,h,x0,y0,w/k,h/k);c.restore();}
const SMOKE=['#322d2f','#151216'],SMOKE_G=['#6c6662','#3b3735'],DUST=['#7c6c58','#4a3f33'],GSMOKE=['#a8a3a0','#6d6866'],SOOT=['#141113','#070607'];

// ---------- explosions ----------
// The kinds: a fuel tank (a big rolling fireball and a lot of black smoke), a grenade (a sharp flash, a short fireball, fragments
// and grey smoke) and a breaching charge (the brightest flash, a hard ring, dust and chunks, little fire).
const BK={
  fuel:{n:32,v:300,drag:5.4,vt:46,r0:13,r1:40,fire:[.5,1.1],smoke:[4.8,7],sa:.8,dark:1,sparks:44,bits:9,flash:1,ring:1,dust:10,glow:'#ffb347',life:7.4,bitCol:'#16151a'},
  grenade:{n:16,v:360,drag:6.8,vt:34,r0:9,r1:28,fire:[.16,.36],smoke:[3.4,5.4],sa:.62,dark:.4,sparks:64,bits:12,flash:1.2,ring:1.1,dust:12,glow:'#ffd27a',life:5.8,bitCol:'#2a2a26'},
  charge:{n:12,v:320,drag:7.4,vt:30,r0:9,r1:26,fire:[.1,.24],smoke:[3.6,5.6],sa:.6,dark:.25,sparks:34,bits:18,flash:1.45,ring:1.35,dust:16,glow:'#fff1c4',life:6,bitCol:'#5a5148'}};
const BOOMS=new Map();
function boomSpec(b){const K=BK[b.kind]||BK.fuel,z=b.size||1,sd=seedOf(b),key=sd+'|'+(b.kind||'fuel')+'|'+z;let s=BOOMS.get(key);if(s)return s;
  const R=rng(sd*7919+13),zs=Math.pow(z,.6),few=z<.7?.7:1,P=[],SP=[],BT=[],DU=[];
  for(let i=0;i<Math.round(K.n*few);i++){const a=-Math.PI/2+(R()*2-1)*Math.PI*.92,f=.3+R()*.7,v=K.v*zs*f;
    // the outer puffs (thrown hardest) burn out first and go to soot at the edges; the heart burns longest
    P.push({vx:Math.cos(a)*v,vy:Math.sin(a)*v*.8-K.v*zs*.15,dz:(R()*2-1)*36*z,r0:K.r0*z*(.7+R()*.6),r1:K.r1*z*(.75+R()*.55),fl:lerp(K.fire[0],K.fire[1],R()*.6+(1-f)*.4),T0:.74+R()*.26,
      sl:lerp(K.smoke[0],K.smoke[1],R()),vt:K.vt*(.7+R()*.6)*zs,v:i%4,rot:R()*TAU,spin:(R()-.5)*.6,wind:(R()-.3)*14});}
  // the cooler, outer puffs first, the hot heart last
  P.sort((p,q)=>Math.hypot(q.vx,q.vy)-Math.hypot(p.vx,p.vy));
  for(let i=0;i<Math.round(K.sparks*few);i++){const a=-Math.PI/2+(R()*2-1)*Math.PI*.85,v=(320+R()*620)*Math.sqrt(z);
    SP.push({vx:Math.cos(a)*v,vy:Math.sin(a)*v,dz:(R()*2-1)*30,L:.45+R()*.85,w:.8+R()*.9,hot:R()});}
  for(let i=0;i<Math.round(K.bits*few);i++){const a=-Math.PI/2+(R()*2-1)*Math.PI*.7,v=(230+R()*330)*Math.sqrt(z);
    BT.push({vx:Math.cos(a)*v,vy:Math.sin(a)*v,dz:(R()*2-1)*40,L:1.3+R()*1.3,s:(2.2+R()*3.4)*Math.sqrt(z),spin:(R()-.5)*16,sh:[R(),R(),R(),R()],burn:R()<(b.kind==='charge'?.25:.75)});}
  for(let i=0;i<Math.round(K.dust*few);i++){const a=(i+R()*.6)/K.dust*TAU;DU.push({ca:Math.cos(a),sa:Math.sin(a),v:(170+R()*240)*zs,r0:12*z,r1:(30+R()*22)*z,L:1.3+R()*1.2,v2:i%4});}
  s={K,z,P,SP,BT,DU,R:R()};BOOMS.set(key,s);if(BOOMS.size>24)BOOMS.delete(BOOMS.keys().next().value);return s;}
// where a fireball puff is at time t: thrown out and slowed by the air, then carried up by the heat at its own rising speed
function puffAt(b,p,t,K){const e=(1-Math.exp(-K.drag*t))/K.drag,tau=.8,up=p.vt*(t-tau*(1-Math.exp(-t/tau)));
  return{x:b.x+p.vx*e+p.wind*t*t*.5,y:b.y+p.vy*e-up,d:b.dep+p.dz*(1-Math.exp(-3*t))};}
// a spark's path, with one bounce off the floor
function sparkAt(b,p,t,gy){const G=900;let x=b.x+p.vx*t,y=b.y+p.vy*t+.5*G*t*t;
  if(y>gy){const A=.5*G,B2=p.vy,C=b.y-gy,th=(-B2+Math.sqrt(Math.max(0,B2*B2-4*A*C)))/(2*A),vy=-(p.vy+G*th)*.32,vx=p.vx*.45,u=t-th;
    x=b.x+p.vx*th+vx*u;y=Math.min(gy,gy+vy*u+.5*G*u*u);}
  return{x,y};}
function boom(c,b,o){o=o||{};const t=(o.now??0)-b.t0;const S=boomSpec(b),K=S.K,z=S.z;if(t<0)return true;if(t>K.life)return false;
  const gy=b.gy??GY(),dep=b.dep||0;c.save();
  // the shock ring along the floor, and the dust it throws up
  if(t<.5){const R=260*z*K.ring*(1-Math.exp(-t*8)),a=Math.pow(1-t/.5,2)*.75,g=pj(b.x,gy,dep);
    c.globalCompositeOperation='lighter';c.strokeStyle=rgba('#e8d6b8',a*.32);c.lineWidth=(3.4-t*5)*z+.7;c.beginPath();
    for(let i=0;i<=40;i++){const th=i/40*TAU,q=pj(b.x+Math.cos(th)*R,gy,dep+Math.sin(th)*R*.36);i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y);}c.stroke();
    c.globalCompositeOperation='source-over';
    // the flash on the ground under it
    if(t<.3){c.save();c.translate(g.x,g.y);c.scale(1,.28);c.globalCompositeOperation='lighter';stamp(c,glowSpr('#ffd9a0'),0,0,Math.min(R*.9+40*z,190*z),(1-t/.3)*.55);c.restore();}}
  const SM=[],FI=[],GL=[];
  for(const p of S.DU){const u=t/p.L;if(u>=1)continue;const e=(1-Math.exp(-3*t))/3,x=b.x+p.ca*p.v*e,d=dep+p.sa*p.v*e*.45,r=lerp(p.r0,p.r1,1-Math.exp(-2.2*t)),q=pj(x,gy-r*.42-t*14,d);
    SM.push({s:puffSpr(p.v2,DUST[0],DUST[1],1),x:q.x,y:q.y,r,a:.42*ss(0,.08,t)*Math.pow(1-u,1.4),rot:p.v2});}
  // the smoke the fireball turns into, behind the fire
  for(const p of S.P){if(t<p.fl*.45)continue;const q0=puffAt(b,p,t,K),q=pj(q0.x,q0.y,q0.d),r=p.r1+(t-p.fl*.45)*15*z,a=K.sa*ss(p.fl*.45,p.fl*1.05,t)*(1-ss(p.sl*.62,p.sl,t));
    if(a<=.005)continue;const sm=K.dark>.6?SMOKE:SMOKE_G;SM.push({s:puffSpr(p.v,sm[0],sm[1],1),x:q.x,y:q.y,r,a:a*(K.dark>.6?1:.9),rot:p.rot});}
  // the fireball: every puff by its own heat, soot rolling over each as it cools
  for(const p of S.P){if(t>p.fl*1.1)continue;const q0=puffAt(b,p,t,K),q=pj(q0.x,q0.y,q0.d),T=p.T0-t/p.fl,r=lerp(p.r0,p.r1,1-Math.exp(-6*t))*(1+.15*Math.max(0,-T)),a=1-ss(.75,1.1,t/p.fl);
    heatOps(FI,T,p.v,q.x,q.y,r,a,p.rot);
    if(K.dark>.6&&T<.42)FI.push({s:puffSpr((p.v+1)%4,SOOT[0],SOOT[1],1),x:q.x+r*.12,y:q.y-r*.1,r:r*.9,a:clamp((.42-T)*1.6,0,.75)*a,rot:p.rot*1.7});}
  // the heat's glow over it, and the white flash at the start
  {const cy=b.y-K.vt*z*Math.max(0,t-.3)*.6,q=pj(b.x,cy,dep),a=K.flash*(t<.06?1:Math.exp(-(t-.06)*3.2))*(.85+.15*Math.sin(t*37+S.R*9));
    GL.push({s:glowSpr(K.glow),x:q.x,y:q.y,r:(110+50*Math.min(1,t*4))*z,a:a*.85});
    if(t<.14){const u=t/.14,q2=pj(b.x,b.y,dep);GL.push({s:glowSpr('#ffffff'),x:q2.x,y:q2.y,r:(30+170*u)*z*K.flash,a:(1-u)*(1-u)*1.1});GL.push({s:glowSpr('#fffbe8'),x:q2.x,y:q2.y,r:(18+60*u)*z,a:1-u});}}
  soft(c,'sm',SM,4);soft(c,'fi',FI,3);
  // the glows are single stamps: straight onto the scene
  c.globalCompositeOperation='lighter';for(const g of GL)stamp(c,g.s,g.x,g.y,g.r,g.a);
  c.globalAlpha=1;c.globalCompositeOperation='lighter';
  // sparks and fragments: streaks along their paths, white going to orange going to red
  c.lineCap='round';
  for(const p of S.SP){if(t>p.L)continue;const a=pj(...Object.values(sparkAt(b,p,Math.max(0,t-.035),gy)),dep+p.dz),e=pj(...Object.values(sparkAt(b,p,t,gy)),dep+p.dz),u=t/p.L;
    c.strokeStyle=u<.3?rgba('#fff6d8',1-u*.8):u<.65?rgba('#ffc861',1-u*.7):rgba('#ff6a26',(1-u)*1.6);c.lineWidth=p.w*(1-u*.5);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(e.x,e.y);c.stroke();}
  c.globalCompositeOperation='source-over';
  // burning bits arcing out, each with its smoke behind it
  for(const p of S.BT){if(t>p.L+.6)continue;const tt=Math.min(t,p.L),q0=sparkAt(b,p,tt,gy-1),q=pj(q0.x,q0.y,dep+p.dz),fade=1-ss(p.L,p.L+.6,t);
    for(let k=5;k>=1;k--){const t2=tt-k*.07;if(t2<0)continue;const w=sparkAt(b,p,t2,gy-1),wq=pj(w.x,w.y,dep+p.dz);stamp(c,puffSpr(k%4,SMOKE_G[0],SMOKE_G[1]),wq.x,wq.y,p.s*(1+k*.5),(.32-k*.05)*fade*(p.burn?1:.5));}
    c.save();c.translate(q.x,q.y);c.rotate(p.spin*tt);c.globalAlpha=fade;c.fillStyle=K.bitCol;c.beginPath();const s=p.s;
    c.moveTo(-s,-s*p.sh[0]);c.lineTo(s*p.sh[1],-s*.8);c.lineTo(s,s*p.sh[2]*.8);c.lineTo(-s*p.sh[3],s*.9);c.closePath();c.fill();c.restore();
    if(p.burn){c.globalCompositeOperation='lighter';stamp(c,glowSpr('#ff9a3a'),q.x,q.y,p.s*3.4,.75*fade*(.8+.2*Math.sin(t*30+p.spin)));c.globalCompositeOperation='source-over';}}
  c.restore();return true;}
// the explosion as a light: where it is, how far it reaches, how strong it is now (x, y on the screen's plane; wx, wy, dep in the world)
function boomLight(b,o){const t=(o&&o.now||0)-b.t0,S=boomSpec(b),K=S.K,z=S.z;if(t<0||t>2.6)return null;
  const a=K.flash*(t<.06?1:Math.exp(-(t-.06)*2.4))*(.88+.12*Math.sin(t*41+S.R*7)),wy=b.y-K.vt*z*Math.max(0,t-.3)*.6,q=pj(b.x,wy,b.dep||0);
  return{x:q.x,y:q.y,wx:b.x,wy,dep:b.dep||0,r:(320+120*Math.min(1,t*3))*z,a:clamp(a,0,1.4),col:t<.1?'#fff6e0':K.glow};}

// ---------- fire and smoke ----------
// flames standing on a base (x, y) of width w, up to h high: tongues that lick and sway, a hot core, glow and embers
function fire(c,f,o){o=o||{};const now=o.now??0,k=clamp(f.k??1,0,1);if(k<=0)return true;const sd=seedOf(f),R=rng(sd*31+7),dep=f.dep||0,w=f.w||40,h=f.h||60,N=clamp(Math.round(w/15),3,14);
  const base=pj(f.x,f.y,dep);c.save();c.globalCompositeOperation='lighter';stamp(c,glowSpr('#ff9a3a'),base.x,base.y-h*.35*k,Math.max(w,h)*1.05,.42*k*(.85+.15*Math.sin(now*9+sd)));
  c.globalCompositeOperation='source-over';
  const T=[];for(let j=0;j<N;j++){const ph=R()*TAU,sp=4+R()*5,x=f.x-w/2+(j+.5)/N*w+(R()-.5)*w/N*.6,hf=.36+R()*.64,ww=w/N*(1.8+R()*1.1),v=j%3;T.push({ph,sp,x,hf,ww,v});}
  for(const pass of [0,1]){if(pass)c.globalCompositeOperation='lighter';
    for(const q of T){const hh=h*k*q.hf*(.62+.24*Math.sin(now*q.sp+q.ph)+.14*Math.sin(now*q.sp*2.3+q.ph*1.7))*(pass?.55:1),ww=q.ww*(pass?.55:1)*(.75+.25*k),sw=Math.sin(now*1.9+q.ph)*.32;
      const p0=pj(q.x,f.y,dep);c.save();c.translate(p0.x,p0.y+2);c.transform(1,0,sw,1,0,0);c.globalAlpha=pass?.55*k:.92*k;c.drawImage(tongueSpr(q.v),-ww/2,-hh,ww,hh);c.restore();}}
  // tongues that tear loose and burn out above the rest
  c.globalCompositeOperation='lighter';const nl=2+Math.round(w/30);
  for(let i=0;i<nl;i++){const r1=R(),r2=R(),sp=1.1+R()*.8,u=(now*sp+r1)%1,x=f.x+(r2-.5)*w*.7+Math.sin(now*3+r1*9)*4,y=f.y-h*k*(.45+u*.75),ww=w/N*1.1*(1-u),hh=h*k*.34*(1-u*.6),q=pj(x,y,dep);
    if(ww<.5)continue;c.globalAlpha=(1-u)*.6*k;c.drawImage(tongueSpr(i%3),q.x-ww/2,q.y-hh,ww,hh);}
  c.globalCompositeOperation='source-over';c.globalAlpha=1;
  // embers going up out of it
  const ne=2+Math.round(w/10);for(let i=0;i<ne;i++){const r1=R(),r2=R(),sp=.35+R()*.4,u=(now*sp+r1)%1,x=f.x+(r2-.5)*w+Math.sin(now*2.3+r1*10)*7*u,y=f.y-u*h*1.7*k,q=pj(x,y,dep);
    c.fillStyle=rgba(u<.5?'#ffe2a3':'#ff8a3a',(1-u)*k);c.globalAlpha=1;c.beginPath();c.arc(q.x,q.y,.7+r2*.8,0,TAU);c.fill();}
  c.restore();return true;}
// a column of smoke going up from (x, y): puffs born at the foot one after another, growing and fading as they rise and drift
function smoke(c,s,o){o=o||{};const now=o.now??0,k=clamp(s.k??1,0,1);if(k<=0)return true;const sd=seedOf(s),R=rng(sd*53+11),dep=s.dep||0,N=11,L=4.4,dark=s.dark??1;
  const P=[];for(let j=0;j<N;j++){const r1=R(),r2=R();const u=((now/L)+j/N+r1*.04)%1;P.push({u,r2,v:j%4,rot:r1*TAU});}
  P.sort((a,b)=>b.u-a.u);const SM=[],LT=[];
  for(const p of P){const t=p.u*L,x=s.x+(p.r2-.5)*10+(s.wind??10)*t*t*.5,y=s.y-(30*t+5*t*t)*(s.rise??1),r=(9+t*15)*(.7+.3*k),a=k*.6*ss(0,.5,t)*Math.pow(1-p.u,1.2),q=pj(x,y,dep);
    SM.push({s:puffSpr(p.v,dark?SMOKE[0]:GSMOKE[0],dark?SMOKE[1]:GSMOKE[1],1),x:q.x,y:q.y,r,a,rot:p.rot});
    // a fire under it lights the smoke's belly
    if(s.lit&&t<1.4)LT.push({s:puffSpr(p.v,'#ff9a3a','#8a2410'),x:q.x,y:q.y+r*.15,r:r*.9,a:a*s.lit*.32*(1-t/1.4),rot:p.rot,comp:'lighter'});}
  soft(c,'smk',SM,4);if(LT.length)soft(c,'smkl',LT,4,'lighter');return true;}

// ---------- shots ----------
// muzzle flashes by gun: how long the flash lasts, how big it is, its colours, and the jets the muzzle throws out
const MZ={pistol:{fl:.05,s:10.5,core:'#fff6d8',glow:'#ffcf86',jets:[[0,1,.34],[.6,.45,.18],[-.6,.45,.18]],smoke:.5},
  smg:{fl:.045,s:12,core:'#fff3c8',glow:'#ffbf6a',jets:[[0,1,.3],[.78,.55,.16],[-.78,.55,.16],[1.57,.3,.12],[-1.57,.3,.12]],smoke:.55},
  rifle:{fl:.06,s:17,core:'#d9fffa',glow:'#7ff3e3',gold:'#fff3c8',jets:[[0,1.7,.26],[.55,.9,.14],[-.55,.9,.14],[1.35,.75,.16],[-1.35,.75,.16]],smoke:.7},
  mg:{fl:.06,s:18,core:'#fff6d8',glow:'#ffb347',jets:[[0,1.5,.3],[.8,.7,.2],[-.8,.7,.2],[1.57,.45,.16],[-1.57,.45,.16]],smoke:.8},
  hex:{fl:.14,s:20,core:'#f6eeff',glow:'#b98cff',gold:'#ffe2a3',jets:[[0,1.9,.22],[.42,1.1,.12],[-.42,1.1,.12]],smoke:.4}};
function jets(c,J,s,f,col,w0){c.fillStyle=col;for(const [a,l,w] of J){const L=s*l*f*(w0||1),W=s*w*Math.max(.3,f);c.save();c.rotate(a);c.beginPath();c.moveTo(0,-W);c.quadraticCurveTo(L*.45,-W*.7,L,0);c.quadraticCurveTo(L*.45,W*.7,0,W);c.closePath();c.fill();c.restore();}}
function muzzle(c,m,o){o=o||{};const t=(o.now??0)-m.t0,M=MZ[m.kind]||MZ.pistol,sd=seedOf(m),R=rng(sd*13+5);if(t<0)return true;if(t>.75)return false;
  const q=pj(m.x,m.y,m.dep||0),ang=m.ang||0;c.save();
  // the gun smoke: a few puffs pushed out along the shot and drifting up
  for(let i=0;i<3;i++){const r1=R(),r2=R(),u=t/(.55+r1*.2);if(u>=1||t<M.fl*.6)continue;const dd=(6+i*7)*(1-Math.exp(-6*t))*(M.s/12),x=q.x+Math.cos(ang)*dd,y=q.y+Math.sin(ang)*dd-t*14-i*2;
    stamp(c,puffSpr(i%4,GSMOKE[0],GSMOKE[1],1),x,y,(3+t*16+i*1.5)*(M.s/12),M.smoke*.42*(1-u)*ss(0,.06,t),r2*TAU+t);}
  if(t<M.fl){const u=t/M.fl,f=Math.pow(1-u,1.4)*(u<.25?1:.92+.08*Math.sin(t*240+sd));
    c.save();c.globalCompositeOperation='lighter';stamp(c,glowSpr(M.glow),q.x,q.y,M.s*3.4*f+4,.9*f);c.globalAlpha=1;
    c.translate(q.x,q.y);c.rotate(ang);
    const flip=(sd&1)?1:.82;jets(c,M.jets,M.s*flip,f,rgba(M.glow,.5),1.08);jets(c,M.jets,M.s*flip,f,rgba(M.gold||M.core,.55),.8);jets(c,M.jets,M.s*flip*.9,f,rgba('#ffffff',.65),.42);
    c.fillStyle=rgba('#ffffff',.9*f);c.beginPath();c.arc(M.s*.12,0,M.s*.14*f+.5,0,TAU);c.fill();c.restore();}
  // the hex round: a ring of runes opens round the muzzle, seen edge on along the shot, and turns as it fades
  if(m.kind==='hex'&&t<.42){const u=t/.42,r=8+u*26,a=Math.pow(1-u,1.2);c.save();c.translate(q.x,q.y);c.rotate(ang);c.scale(.45,1);c.rotate(u*1.6);
    c.globalCompositeOperation='lighter';c.globalAlpha=1;c.strokeStyle=rgba('#c9a0ff',a);c.lineWidth=1.4;c.beginPath();c.arc(0,0,r,0,TAU);c.stroke();
    c.strokeStyle=rgba('#ffe2a3',a);c.lineWidth=1.1;for(let i=0;i<12;i++){const th=i/12*TAU;c.save();c.rotate(th);c.translate(r+3,0);glyph(c,i+sd,2.2);c.restore();}c.restore();}
  c.restore();return true;}
// a small rune: a few strokes, the same every time for the same number
function glyph(c,n,s){const R=rng(n*977+3);c.beginPath();const k=2+Math.floor(R()*2);let x=(R()-.5)*s,y=(R()-.5)*s;c.moveTo(x,y);
  for(let i=0;i<k;i++){x=(R()-.5)*s*1.6;y=(R()-.5)*s*1.6;c.lineTo(x,y);}c.stroke();if(R()<.5){c.beginPath();c.arc((R()-.5)*s,(R()-.5)*s,s*.22,0,TAU);c.stroke();}}
// tracers: a round's streak from a to b (a.dep and b.dep, when given, let a shot cross from one depth to another)
const TR={pistol:{dur:.04,len:.45,w:1,glow:'#ffcf86',core:'#fff6d8'},smg:{dur:.035,len:.45,w:.9,glow:'#ffbf6a',core:'#fff3c8'},mg:{dur:.035,len:.5,w:1.4,glow:'#ffb347',core:'#fff6d8'},
  rifle:{dur:.03,len:.55,w:1.5,glow:'#7ff3e3',core:'#fff3c8'},hex:{dur:.25,len:1,w:2.4,glow:'#b98cff',core:'#f6eeff'}};
function tracer(c,tr,o){o=o||{};const T=TR[tr.kind]||TR.pistol,dur=tr.dur??T.dur,t=(o.now??0)-tr.t0,dep=tr.dep||0,hex=tr.kind==='hex',after=hex?.7:.09;
  if(t<0)return true;if(t>dur+after)return false;
  // the head runs from a to b; the tail follows it a share of the way behind, and after the round arrives it catches up and fades
  const A=pj(tr.a.x,tr.a.y,tr.a.dep??dep),B=pj(tr.b.x,tr.b.y,tr.b.dep??dep),u1=clamp(t/dur,0,1),
    u0=hex?0:t<dur?Math.max(0,u1-T.len):lerp(Math.max(0,1-T.len),1,clamp((t-dur)/(after*.5),0,1)),
    at=u=>({x:lerp(A.x,B.x,u),y:lerp(A.y,B.y,u)}),h=at(u1),tl=at(Math.min(u0,u1)),fade=t<dur?1:1-(t-dur)/after;
  c.save();c.globalCompositeOperation='lighter';c.lineCap='round';
  if(!hex){c.strokeStyle=rgba(T.glow,.5*fade);c.lineWidth=T.w*3.2;c.beginPath();c.moveTo(tl.x,tl.y);c.lineTo(h.x,h.y);c.stroke();
    c.strokeStyle=rgba(T.core,fade);c.lineWidth=T.w;c.beginPath();c.moveTo(tl.x,tl.y);c.lineTo(h.x,h.y);c.stroke();
    if(tr.kind==='rifle'){c.strokeStyle=rgba('#ffe2a3',.7*fade);c.lineWidth=T.w*.45;c.beginPath();const m=at(lerp(Math.min(u0,u1),u1,.5));c.moveTo(m.x,m.y);c.lineTo(h.x,h.y);c.stroke();}
    if(t<dur)stamp(c,glowSpr(T.glow),h.x,h.y,T.w*6,.8);c.restore();return true;}
  // the hex bolt: a charged core, a spiral of runes turning round it, a trail that lingers and shimmers
  const L=Math.hypot(B.x-A.x,B.y-A.y)||1,ux=(B.x-A.x)/L,uy=(B.y-A.y)/L,nx=-uy,ny=ux,head=u1*L;
  const g=fade*(t<dur?1:.85);c.strokeStyle=rgba(T.glow,.45*g);c.lineWidth=7*g+1;c.beginPath();c.moveTo(A.x,A.y);c.lineTo(h.x,h.y);c.stroke();
  c.strokeStyle=rgba(T.core,g);c.lineWidth=2.2*g+.4;c.beginPath();c.moveTo(A.x,A.y);c.lineTo(h.x,h.y);c.stroke();
  for(const [col,ph] of [['#c9a0ff',0],['#ffe2a3',Math.PI]]){c.strokeStyle=rgba(col,.85*g);c.lineWidth=1.1;c.beginPath();
    for(let s=Math.max(0,head-L);s<=head;s+=3){const amp=5*(1-Math.max(0,(head-s)/L)*.6)*g,w=Math.sin(s*.09-(o.now||0)*30+ph)*amp,x=A.x+ux*s+nx*w,y=A.y+uy*s+ny*w;s===Math.max(0,head-L)?c.moveTo(x,y):c.lineTo(x,y);}c.stroke();}
  c.strokeStyle=rgba('#f6eeff',.9*g);c.lineWidth=.8;for(let s=10,i=0;s<head;s+=16,i++){const x=A.x+ux*s+nx*(i%2?7:-7)*g,y=A.y+uy*s+ny*(i%2?7:-7)*g;c.save();c.translate(x,y);c.rotate((o.now||0)*4+i);glyph(c,i,3);c.restore();}
  if(t<dur){stamp(c,glowSpr('#b98cff'),h.x,h.y,26,.95);stamp(c,glowSpr('#ffffff'),h.x,h.y,9,1);}
  c.restore();return true;}
// a hit: on flesh a mist (o.gore its colour, or a cloth puff without it), on metal sparks, on the ground dust and chips, on a wall
// chips and dust, on glass glinting shards. ang is the way the round was going; what flies off goes back against it.
function impact(c,im,o){o=o||{};const t=(o.now??0)-im.t0,kind=im.kind||'ground',sd=seedOf(im),R=rng(sd*29+3),dep=im.dep||0,q=pj(im.x,im.y,dep),back=(im.ang??0)+Math.PI;
  if(t<0)return true;if(t>.7)return false;c.save();c.lineCap='round';
  const fly=(n,v0,v1,spread,G,dirA)=>{const out=[];for(let i=0;i<n;i++){const a=dirA+(R()*2-1)*spread,v=v0+R()*(v1-v0);out.push({vx:Math.cos(a)*v,vy:Math.sin(a)*v,G,s:R()});}return out;};
  const at=(p,tt)=>({x:q.x+p.vx*tt,y:q.y+p.vy*tt+.5*p.G*tt*tt});
  if(kind==='metal'||kind==='glass'||kind==='wall'){if(t<.06){c.globalCompositeOperation='lighter';stamp(c,glowSpr(kind==='metal'?'#fff1c4':'#ffffff'),q.x,q.y,kind==='metal'?16:9,(1-t/.06));c.globalCompositeOperation='source-over';}}
  if(kind==='metal'){c.globalCompositeOperation='lighter';for(const p of fly(11,110,360,.9,700,back)){const L=.12+p.s*.2;if(t>L)continue;const a=at(p,Math.max(0,t-.025)),e=at(p,t),u=t/L;
      c.strokeStyle=rgba(u<.4?'#fff6d8':'#ffb347',1-u);c.lineWidth=1.1;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(e.x,e.y);c.stroke();}
    c.globalCompositeOperation='source-over';stamp(c,puffSpr(sd&3,GSMOKE[0],GSMOKE[1]),q.x-t*10,q.y-t*18,4+t*18,.35*(1-t/.7));}
  else if(kind==='ground'||kind==='wall'){const col=kind==='wall'?['#9a9286','#5d574f']:DUST;
    stamp(c,puffSpr(sd&3,col[0],col[1],1),q.x+Math.cos(back)*t*20,q.y-t*26,4+t*26,.55*Math.pow(1-t/.7,1.3)*ss(0,.03,t));
    c.fillStyle=kind==='wall'?'#b4ab9c':'#2a241e';for(const p of fly(9,70,220,1,900,kind==='wall'?back:-Math.PI/2)){const e=at(p,t);if(kind==='ground'&&e.y>q.y+2)continue;c.globalAlpha=1-t/.7;c.fillRect(e.x-.7,e.y-.7,1.1+p.s,1.1+p.s);}}
  else if(kind==='glass'){c.globalCompositeOperation='lighter';for(const p of fly(9,80,260,1.1,800,back)){const e=at(p,t),u=t/.7;c.save();c.translate(e.x,e.y);c.rotate(p.s*12+t*14);
      c.fillStyle=rgba('#d9f2ff',(1-u)*(.5+.5*Math.sin(t*40+p.s*20)));c.beginPath();c.moveTo(-1.6,-.6);c.lineTo(1.4,-1);c.lineTo(.2,1.4);c.closePath();c.fill();c.restore();}}
  else{// flesh
    const gc=o.gore;if(gc){const u=t/.55;if(u<1){stamp(c,puffSpr(sd&3,gc,gc),q.x+Math.cos(back)*t*14+Math.cos(back+Math.PI)*t*30,q.y-t*8,3+t*20,.55*Math.pow(1-u,1.5)*ss(0,.03,t));
        c.strokeStyle=gc;for(const p of fly(8,60,190,.8,850,im.ang??0)){const a=at(p,Math.max(0,t-.012)),e=at(p,t);c.globalAlpha=1-u;c.lineWidth=1.1;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(e.x,e.y);c.stroke();}}}
    else stamp(c,puffSpr(sd&3,'#7a6e62','#4a4038',1),q.x+Math.cos(back)*t*12,q.y-t*10,3+t*14,.5*(1-t/.7)*ss(0,.03,t));}
  c.restore();return true;}
// an ejected casing, brass, tumbling: drawn where the sim has it
const CS={rifle:[4.6,1.25],pistol:[2,1],smg:[2.2,1],mg:[5.4,1.45]};
function casing(c,cs,o){const d=CS[cs.kind]||CS.pistol,q=pj(cs.x,cs.y,cs.dep||0);c.save();c.translate(q.x,q.y);c.rotate(cs.ang||0);
  c.fillStyle='#8a6a2e';c.fillRect(-d[0]/2,-d[1]/2,d[0],d[1]);c.fillStyle='#e2b65a';c.fillRect(-d[0]/2,-d[1]/2,d[0]*.85,d[1]*.55);c.fillStyle='#fff0bf';c.fillRect(-d[0]*.3,-d[1]/2,d[0]*.4,d[1]*.22);
  c.fillStyle='#4a3818';c.fillRect(d[0]/2-.45,-d[1]/2,.45,d[1]);c.restore();return true;}

// paint every sprite (and its turned copies) ahead, so the first explosion does not stall a frame: call it while a stage loads
function prewarm(){const t0=typeof performance!=='undefined'?performance.now():0;
  for(let v=0;v<4;v++){for(const h of HEAT)puffSpr(v,h[0],h[1]);for(const pr of [SMOKE,SMOKE_G,DUST,GSMOKE,SOOT])puffSpr(v,pr[0],pr[1],1);puffSpr(v,SMOKE_G[0],SMOKE_G[1]);puffSpr(v,GSMOKE[0],GSMOKE[1]);puffSpr(v,'#ff9a3a','#8a2410');}
  for(const k in SPR){const s=SPR[k];if(k[0]==='p')for(let q=1;q<4;q++)quarter(s,q);}
  for(const col of ['#ffb347','#ffd27a','#fff1c4','#ffffff','#fffbe8','#ffd9a0','#ff9a3a','#fff6e0','#7ff3e3','#b98cff','#ffcf86','#ffbf6a','#d9fffa'])glowSpr(col);
  for(let v=0;v<3;v++)tongueSpr(v);return typeof performance!=='undefined'?performance.now()-t0:0;}
return{boom,boomLight,fire,smoke,muzzle,tracer,impact,casing,prewarm,BK,MZ,TR,glyph,ok:typeof Path2D==='function'};
})();

// ===== GUN LOOK =====
// Each gun is drawn in its own design frame: u along the bore from the gun's own reference point, v up, in world units (the rifle in
// the units of VehLook's rifle, scaled by its K). H is where the hand closes on the grip: the gun's line in the game runs through H
// parallel to the bore, so the bore sits BORE above the line and the muzzle LEN along it. Still parts are built once as paths; the
// light's rim, the glint and the moving parts (the slide, the hammer, the charge in the hex runes) are drawn over them every time.
const GunLook=(()=>{
const TAU=Math.PI*2,lerp=(a,b,t)=>a+(b-a)*t,clamp=(v,a,b)=>v<a?a:v>b?b:v;
const rgba=(hex,a)=>{const n=parseInt(hex.slice(1),16);return`rgba(${n>>16&255},${n>>8&255},${n&255},${clamp(a,0,1).toFixed(3)})`;};
// the bike painter's colours, so the rifle is the same rifle
const K={gold:'#e2b65a',goldL:'#ffe2a3',goldD:'#8a6a2e',cyan:'#7ff3e3',cyanL:'#d9fffa',cyanD:'#2a8a80',rim:'#ffcf86',lac:'#0b0a0e'};
function cr(P,pts,closed=true){const n=pts.length,g=i=>pts[closed?(i+n)%n:clamp(i,0,n-1)];P.moveTo(g(0)[0],g(0)[1]);
  for(let i=0;i<(closed?n:n-1);i++){const p0=g(i-1),p1=g(i),p2=g(i+1),p3=g(i+2);
    P.bezierCurveTo(p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6,p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6,p2[0],p2[1]);}
  if(closed)P.closePath();return P;}
function poly(pts,P){P=P||new Path2D();P.moveTo(pts[0][0],pts[0][1]);for(const q of pts.slice(1))P.lineTo(q[0],q[1]);P.closePath();return P;}
function line(pts,P){P=P||new Path2D();P.moveTo(pts[0][0],pts[0][1]);for(const q of pts.slice(1))P.lineTo(q[0],q[1]);return P;}
function rr(x0,y0,x1,y1,r,P){P=P||new Path2D();if(P.roundRect)P.roundRect(x0,y0,x1-x0,y1-y0,r);else P.rect(x0,y0,x1-x0,y1-y0);return P;}
function lgr(c,x0,y0,x1,y1,st){const g=c.createLinearGradient(x0,y0,x1,y1);for(const [o,col] of st)g.addColorStop(o,col);return g;}
// gradients live in the design frame, so each is made once and kept
const GC=new Map();function G(c,key,fn){let g=GC.get(key);if(!g){g=fn(c);GC.set(key,g);}return g;}
// the gold vine engraving (the same hand as the bike's), small
function vine(c,pts,w,leaf,col,seed){const S=[];for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],n=Math.max(2,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.8));for(let k=0;k<n;k++)S.push([lerp(a[0],b[0],k/n),lerp(a[1],b[1],k/n)]);}
  S.push(pts[pts.length-1]);const Q=[],wl=leaf*5.2,amp=leaf*.34;let s=0;
  for(let i=0;i<S.length;i++){if(i)s+=Math.hypot(S[i][0]-S[i-1][0],S[i][1]-S[i-1][1]);const a=S[Math.max(0,i-1)],b=S[Math.min(S.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;
    const ph=s/wl*TAU+(seed||0);Q.push({x:S[i][0]-dy/l*Math.sin(ph)*amp,y:S[i][1]+dx/l*Math.sin(ph)*amp,tx:dx/l,ty:dy/l,nx:-dy/l,ny:dx/l,ph});}
  c.save();c.strokeStyle=col;c.fillStyle=col;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.beginPath();Q.forEach((q,i)=>i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y));c.stroke();
  let k=0;for(let i=1;i<Q.length-1;i++){const q=Q[i],a=Math.sin(Q[i-1].ph),b=Math.sin(q.ph),c2=Math.sin(Q[i+1].ph);if(!((b>a&&b>=c2)||(b<a&&b<=c2)))continue;k++;
    const side=b>0?1:-1,ang=Math.atan2(q.ty,q.tx)+side*.62,L=leaf*(.85+.3*((k*7)%3)/2);
    c.save();c.translate(q.x+q.nx*side*w*.4,q.y+q.ny*side*w*.4);c.rotate(ang);c.beginPath();c.moveTo(0,0);c.bezierCurveTo(L*.3,L*.36,L*.75,L*.3,L,0);c.bezierCurveTo(L*.75,-L*.22,L*.3,-L*.26,0,0);c.fill();c.restore();}
  c.restore();}

// ---------- the guns ----------
// H the hand on the grip, M the muzzle on the bore (v=0), B the back end, F the foregrip (or null), all in design units; k the scale
const D={
  rifle:{k:.88,H:[-1.6,-6.6],M:62.4,B:-31.4,F:33,stock:true,name:'Veskar VS-8 Scour'},
  pistol:{k:1,H:[-1.1,-4.4],M:12.6,B:-3.2,F:null,stock:false,name:'Hallowell Guardian Nine'},
  smg:{k:1,H:[.6,-5.6],M:26,B:-16.6,F:17,stock:true,name:'Hallowell Skyline PDX'},
  hexpistol:{k:1,H:[-3,-4.8],M:24.4,B:-9.2,F:null,stock:false,name:'Maben Register pistol'}};
const SPEC={};
function specOf(key){const d=D[key];return{len:+(d.k*(d.M-d.H[0])).toFixed(2),butt:+(d.k*(d.H[0]-d.B)).toFixed(2),fore:d.F==null?null:+(d.k*(d.F-d.H[0])).toFixed(2),stock:d.stock,bore:+(-d.k*d.H[1]).toFixed(2)};}
for(const k in D)SPEC[k]=specOf(k);
// the rifle is drawn at K of the scabbard's size (the scabbard on the bike draws it at 1); setRifleScale(1) matches it exactly
function setRifleScale(k){D.rifle.k=k;SPEC.rifle=specOf('rifle');}

// ----- Kael's rifle: VehLook's rifle, part for part -----
let RP=null;
function riflePaths(){if(RP)return RP;const R={};
  R.stock=(()=>{const P=new Path2D();cr(P,[[-30,3.2],[-24,4.8],[-12,4.6],[-5,3.4],[-3.6,-2.4],[-10,-3.2],[-20,-5.4],[-30,-7.2]]);P.ellipse(-12.6,-.8,4.6,1.5,-.08,0,TAU);return P;})();
  R.butt=poly([[-31.4,3.4],[-29.4,3.4],[-29.4,-7.4],[-31.4,-7.4]]);
  R.grip=cr(new Path2D(),[[-2.4,-2.6],[2.6,-2.6],[.6,-7],[-1,-11.2],[-5.8,-10.6],[-4.6,-6]]);
  R.guard=line([[2.2,-3.2],[2.8,-6.8],[6.8,-7.2],[9.4,-3.6]]);
  R.trig=line([[4.6,-3.4],[4.2,-5],[3.4,-5.8]]);
  R.recv=rr(-6,-3.4,24.6,3.8,1.6);
  R.cell=poly([[12,-3.4],[18.6,-3.4],[20.6,-12.4],[14,-13]]);
  R.scope=cr(new Path2D(),[[1,5.6],[1.4,9.8],[4.6,9.6],[18,9.6],[21,10.8],[25.6,11],[25.6,4.4],[21,4.6],[18,5.6],[4.6,5.6]]);
  R.guardH=rr(24,-3,46.4,2.8,1);
  R.barrel=poly([[46,1.3],[56.6,1.2],[56.6,-1.2],[46,-1.3]]);
  R.brake=rr(56,-2.2,62.4,2.2,.6);
  R.bolt=rr(-1.6,1.2,1.4,2.6,.5);
  // the edges the light catches: along the top, along the bottom
  R.top=[line([[-29.6,3.6],[-24,4.9],[-13,4.7],[-5.6,3.6]]),line([[-5,3.8],[24,3.8]]),line([[2,10],[18,10],[21,11],[25.4,11.1]]),line([[24.6,2.8],[46,2.8]]),line([[46.2,1.3],[56.6,1.2]]),line([[56.2,2.2],[62.2,2.2]])];
  R.bot=[line([[-29.6,-7.3],[-20,-5.5],[-10,-3.3],[-6,-3.4]]),line([[9.6,-3.4],[12,-3.4]]),line([[20.6,-3.4],[24.6,-3.4]]),line([[24.6,-3],[46,-3]]),line([[46.2,-1.3],[56.6,-1.2]]),line([[-5.8,-10.7],[-1,-11.3]])];
  R.glint={u0:26,u1:45,v:2.5};
  RP=R;return R;}
function rifleDraw(c,o){const R=riflePaths(),now=o.now||0,k=o.alpha??1;
  c.fillStyle=G(c,'rs',c=>lgr(c,0,-7,0,5,[[0,'#060509'],[.7,'#17161c'],[1,'#2a2932']]));c.fill(R.stock,'evenodd');c.strokeStyle='rgba(0,0,0,.6)';c.lineWidth=.3;c.stroke(R.stock);
  c.fillStyle=G(c,'rb',c=>lgr(c,-31,0,-29,0,[[0,K.goldD],[.5,K.goldL],[1,K.goldD]]));c.fill(R.butt);
  vine(c,[[-27,.2],[-18,1.4],[-8,1]],.24,1,rgba(K.gold,.85),2);
  c.fillStyle=G(c,'rg',c=>lgr(c,-6,-11,2,-3,[[0,'#060509'],[1,'#1e1d24']]));c.fill(R.grip);
  c.strokeStyle='#0d0c10';c.lineWidth=.9;c.lineCap='round';c.lineJoin='round';c.stroke(R.guard);c.lineWidth=.6;c.stroke(R.trig);
  // the cell: cyan crystal in a gold frame, glowing
  c.fillStyle=G(c,'rc',c=>lgr(c,12,-13,19,-3,[[0,K.cyanD],[.5,K.cyan],[1,K.cyanL]]));c.fill(R.cell);c.strokeStyle=K.gold;c.lineWidth=.45;c.stroke(R.cell);
  c.save();c.globalCompositeOperation='lighter';c.globalAlpha=k*(.35+.15*Math.sin(now*3))/.5;c.fillStyle=G(c,'rcg',c=>{const g=c.createRadialGradient(16,-8,0,16,-8,9);g.addColorStop(0,rgba(K.cyanL,.5));g.addColorStop(1,rgba(K.cyan,0));return g;});
  c.beginPath();c.arc(16,-8,9,0,TAU);c.fill();c.restore();
  c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=.3;c.beginPath();c.moveTo(13.4,-4.4);c.lineTo(15.2,-11.6);c.stroke();
  // the receiver, engraved, the bolt riding in it; the scope on two gold rings, its cyan lens
  c.fillStyle=G(c,'rr',c=>lgr(c,0,-3.4,0,3.8,[[0,'#060509'],[.6,'#16151b'],[1,'#2a2932']]));c.fill(R.recv);
  vine(c,[[-3.6,.2],[6,.9],[14,.3],[22,.7]],.24,1,rgba(K.gold,.9),5);
  c.fillStyle=K.gold;c.fillRect(6,-2.6,5,.5);
  c.save();c.translate(-(o.recoil||0)*3.2,0);c.fillStyle='#2a2932';c.fill(R.bolt);c.fillStyle=K.goldD;c.fillRect(-.9,1.6,1.6,.6);c.restore();
  for(const u of [6.2,17.4]){c.fillStyle=G(c,'rring',c=>lgr(c,-1,0,1,0,[[0,K.goldD],[.5,K.goldL],[1,K.goldD]]));c.save();c.translate(u,0);c.fillRect(-1.2,3.6,2.4,2.4);c.restore();}
  c.fillStyle=G(c,'rsc',c=>lgr(c,0,4.4,0,11,[[0,'#060509'],[.6,'#1a1920'],[1,'#3a3944']]));c.fill(R.scope);
  c.fillStyle=G(c,'rln',c=>lgr(c,25.6,4.4,25.6,11,[[0,K.cyanD],[.5,K.cyanL],[1,K.cyan]]));c.beginPath();c.ellipse(25.8,7.7,.8,3.2,0,0,TAU);c.fill();
  c.strokeStyle=rgba(K.gold,.8);c.lineWidth=.35;c.beginPath();c.moveTo(18,5.6);c.lineTo(18,9.6);c.moveTo(4.6,5.6);c.lineTo(4.6,9.6);c.stroke();
  // the handguard with its slots, the gold rail line, the barrel and the ported brake
  c.fillStyle=G(c,'rh',c=>lgr(c,0,-3,0,3,[[0,'#060509'],[.6,'#17161c'],[1,'#2a2932']]));c.fill(R.guardH);
  c.fillStyle='#020203';for(let u=27;u<44;u+=4.4)c.fillRect(u,-1.5,2.6,1.6);
  c.fillStyle=K.gold;c.fillRect(24.4,2.6,21.6,.55);
  c.fillStyle=G(c,'rbr',c=>lgr(c,0,-1.3,0,1.3,[[0,'#111117'],[.6,'#4a4c56'],[1,'#1a1a20']]));c.fill(R.barrel);
  c.fillStyle=G(c,'rbk',c=>lgr(c,0,-2.2,0,2.2,[[0,'#08080a'],[.6,'#2a2a32'],[1,'#121218']]));c.fill(R.brake);
  c.fillStyle='#000000';c.fillRect(57.6,-1.6,1.2,3.2);c.fillRect(60,-1.6,1.2,3.2);c.fillStyle=K.gold;c.fillRect(55.8,-2.3,.7,4.6);}

// ----- the police service pistol: blackened steel, a polymer grip, the city's small gold badge -----
let PP=null;
function pistolPaths(){if(PP)return PP;const R={};
  R.slide=rr(-3.2,-.9,12.6,1.9,.45);
  R.frame=poly([[-2.6,-.9],[10.4,-.9],[10.6,-1.9],[6,-2.1],[5.4,-2.4],[1.6,-2.4],[1.2,-1.9],[-2.6,-1.9]]);
  R.rail=rr(6.2,-2.3,10.4,-1.7,.2);
  R.grip=cr(new Path2D(),[[-3.4,-1.2],[1.4,-1.4],[1.2,-2.6],[.5,-7.4],[-.1,-8.2],[-4,-8],[-4.2,-7],[-3.2,-2.6]]);
  R.tail=poly([[-3.4,-.9],[-4.4,-1.6],[-3.6,-2.2],[-2.8,-1.9]]);
  R.mag=rr(-4.4,-8.8,.1,-7.9,.25);
  R.tg=(()=>{const P=new Path2D();cr(P,[[1.5,-1.9],[1.4,-3.6],[2.6,-4.6],[5.4,-4.5],[6.4,-2.1],[5.6,-2],[4.8,-3.7],[2.8,-3.9],[2.3,-3.1],[2.4,-1.9]]);return P;})();
  R.trig=line([[3.4,-2.1],[3.1,-3],[2.6,-3.5]]);
  R.port=rr(3.2,1.25,6.6,1.9,.15);
  R.sightF=rr(11.1,1.9,11.9,2.5,.1);R.sightR=poly([[-2.7,1.9],[-1.5,1.9],[-1.5,2.6],[-1.85,2.6],[-1.95,2.25],[-2.25,2.25],[-2.35,2.6],[-2.7,2.6]]);
  R.top=[line([[-3,1.9],[12.4,1.9]])];R.slideRim=1;R.bot=[line([[-2.4,-1.95],[1.2,-1.95]]),line([[6.2,-2.3],[10.4,-2.3]]),line([[-4.3,-8.7],[0,-8.7]]),line([[1.6,-4.4],[5.4,-4.6]])];
  R.glint={u0:-1,u1:11,v:1.6};
  PP=R;return R;}
function pistolDraw(c,o){const R=pistolPaths(),rc=clamp(o.recoil||0,0,1);
  c.fillStyle='#141417';c.fill(R.frame);c.fillStyle='#0c0c0e';c.fill(R.rail);c.strokeStyle='#26272d';c.lineWidth=.18;c.beginPath();for(let u=6.6;u<10.2;u+=.7){c.moveTo(u,-2.25);c.lineTo(u,-1.75);}c.stroke();
  c.fillStyle='#101012';c.fill(R.tg,'evenodd');c.strokeStyle='rgba(74,77,87,.55)';c.lineWidth=.14;c.stroke(R.tg);c.strokeStyle='#2c2d33';c.lineWidth=.35;c.lineCap='round';c.stroke(R.trig);
  c.fillStyle=G(c,'pg',c=>lgr(c,-4,-8,1,-1,[[0,'#08080a'],[1,'#1d1e22']]));c.fill(R.grip);c.strokeStyle='rgba(74,77,87,.45)';c.lineWidth=.14;c.stroke(R.grip);c.fillStyle='#0a0a0c';c.fill(R.tail);
  // the grip's stipple, and the badge
  c.fillStyle='rgba(255,255,255,.07)';for(let i=0;i<28;i++){const u=-3.2+((i*37)%41)/41*3.6,v=-2.6-((i*53)%47)/47*4.8;c.fillRect(u-(v+2.6)*.08,v,.22,.22);}
  c.fillStyle=G(c,'pmg',c=>lgr(c,0,-8.8,0,-7.9,[[0,'#2a2b31'],[1,'#0a0a0c']]));c.fill(R.mag);
  c.fillStyle=K.goldD;c.beginPath();c.arc(-1.9,-4.6,.62,0,TAU);c.fill();c.fillStyle=K.gold;c.beginPath();c.arc(-1.9,-4.6,.38,0,TAU);c.fill();
  // the slide, back with the shot
  c.save();c.translate(-rc*3.2,0);
  c.fillStyle=G(c,'ps',c=>lgr(c,0,-.9,0,1.9,[[0,'#0c0c0f'],[.55,'#1c1d22'],[1,'#3a3c44']]));c.fill(R.slide);
  c.strokeStyle='#050506';c.lineWidth=.16;c.beginPath();for(let u=-2.7;u<.2;u+=.45){c.moveTo(u,-.5);c.lineTo(u,1.55);}c.stroke();
  c.fillStyle='#030304';c.fill(R.port);c.fillStyle='#0b0b0d';c.fill(R.sightF);c.fill(R.sightR);
  c.fillStyle=K.gold;c.fillRect(11.35,2.25,.3,.18);c.fillRect(-2.55,2.32,.22,.16);c.fillRect(-1.9,2.32,.22,.16);
  c.fillStyle='#000';c.fillRect(12.35,-.5,.25,1.4);c.restore();
  if(rc>0){c.fillStyle='#3a3c44';c.fillRect(12.6-rc*3.2,-.55,rc*3.2,1.1);}}

// ----- the lobby guards' submachine gun: dark slate steel, a short stock, a vertical foregrip, Hallowell's gold H -----
let SP=null;
function smgPaths(){if(SP)return SP;const R={};
  R.recv=rr(-4,-2.6,16,2.2,.8);R.hg=rr(10,-2.4,22,1.9,.7);R.comp=rr(22,-1.1,26,1.1,.3);
  R.rail=rr(-2,2.2,18,2.9,.2);R.sight=rr(4,2.9,9.4,5.8,.7);R.hood=poly([[19,1.9],[21,1.9],[21,3.5],[20.2,3.9],[19.4,3.5]]);
  R.mag=cr(new Path2D(),[[5.6,-2.6],[9.6,-2.6],[11.4,-9],[12.8,-13.2],[9.2,-13.8],[7.8,-9.4]]);
  R.grip=poly([[-.6,-2.6],[3,-2.6],[2.4,-4],[1.4,-9.6],[-2.4,-9.4],[-1.8,-4.2]]);
  R.tg=(()=>{const P=new Path2D();cr(P,[[2.8,-2.5],[2.6,-4.4],[4.2,-5.2],[5.8,-4.6],[5.8,-2.6],[5,-2.6],[5,-4],[4.2,-4.4],[3.4,-3.9],[3.5,-2.5]]);return P;})();
  R.fore=rr(15.6,-9.6,18.6,-2.4,.9);
  R.rods=[rr(-15,.9,-4,1.6,.3),rr(-15,-1.9,-4,-1.2,.3)];R.pad=rr(-16.6,-4.8,-14.6,2.8,.6);R.knob=rr(14.6,1.9,16.4,3.6,.5);
  R.top=[line([[-3.6,2.3],[16,2.3]]),line([[4.4,5.8],[9.2,5.8]]),line([[10.4,1.95],[21.6,1.95]]),line([[22,1.1],[26,1.1]]),line([[-16.4,2.8],[-14.8,2.8]])];
  R.bot=[line([[-3.8,-2.6],[-.8,-2.6]]),line([[9.8,-2.6],[10.2,-2.4]]),line([[18.8,-2.4],[21.8,-2.4]]),line([[22,-1.1],[26,-1.1]]),line([[-2.2,-9.5],[1.2,-9.6]]),line([[15.8,-9.6],[18.4,-9.6]])];
  R.glint={u0:10.5,u1:21.5,v:1.4};
  SP=R;return R;}
function smgDraw(c,o){const R=smgPaths(),rc=clamp(o.recoil||0,0,1);
  for(const r of R.rods){c.fillStyle='#1b1e24';c.fill(r);}c.fillStyle='#0d0e10';c.fill(R.pad);c.strokeStyle='#26282d';c.lineWidth=.2;c.beginPath();for(let v=-4.2;v<2.4;v+=.8){c.moveTo(-16.4,v);c.lineTo(-14.8,v);}c.stroke();
  c.fillStyle=G(c,'sm',c=>lgr(c,8,-3,12,-13,[[0,'#262930'],[1,'#121317']]));c.fill(R.mag);c.strokeStyle='rgba(89,96,110,.6)';c.lineWidth=.18;c.stroke(R.mag);
  c.fillStyle=G(c,'sg',c=>lgr(c,-2,-9,3,-3,[[0,'#101013'],[1,'#24252a']]));c.fill(R.grip);c.strokeStyle='rgba(89,96,110,.5)';c.lineWidth=.16;c.stroke(R.grip);
  c.fillStyle='#0f1013';c.fill(R.tg,'evenodd');
  c.fillStyle=G(c,'sr',c=>lgr(c,0,-2.6,0,2.2,[[0,'#101216'],[.55,'#22262e'],[1,'#3d4350']]));c.fill(R.recv);
  c.fillStyle=G(c,'sh',c=>lgr(c,0,-2.4,0,1.9,[[0,'#0e1014'],[.55,'#1d2128'],[1,'#363b47']]));c.fill(R.hg);
  c.fillStyle='#050608';for(let u=11.4;u<20.4;u+=2.2)c.fillRect(u,-1.3,1.3,1.9);
  c.fillStyle='#0b0c0f';c.fill(R.comp);c.fillStyle='#000';c.fillRect(23.2,-.7,.5,1.4);c.fillRect(24.4,-.7,.5,1.4);
  c.fillStyle='#14161a';c.fill(R.rail);c.strokeStyle='#2c3038';c.lineWidth=.16;c.beginPath();for(let u=-1.6;u<17.8;u+=.8){c.moveTo(u,2.25);c.lineTo(u,2.85);}c.stroke();
  c.fillStyle='#111317';c.fill(R.sight);c.fillStyle=G(c,'sl',c=>lgr(c,9,3.2,9,5.6,[[0,'#7a3a12'],[.5,'#ffb347'],[1,'#a8561a']]));c.fillRect(9,3.3,.4,2.2);
  c.fillStyle='#0e0f12';c.fill(R.hood);c.fillStyle='#22262d';c.fill(R.fore);c.strokeStyle='rgba(89,96,110,.5)';c.lineWidth=.16;c.stroke(R.fore);c.stroke(R.recv);c.stroke(R.hg);c.strokeStyle='#08090b';c.lineWidth=.3;c.beginPath();for(const v of [-4.6,-6.4,-8.2]){c.moveTo(15.7,v);c.lineTo(16.4,v-.4);}c.stroke();
  c.save();c.translate(-rc*2.4,0);c.fillStyle='#2a2e36';c.fill(R.knob);c.restore();
  // the gold H on the receiver, and a gold line along it
  c.fillStyle=K.gold;c.fillRect(6.6,-1.4,.26,1.6);c.fillRect(7.6,-1.4,.26,1.6);c.fillRect(6.6,-.7,1.26,.24);c.fillStyle=rgba(K.gold,.6);c.fillRect(-3.6,-2.05,19.2,.22);}

// ----- the man in white's pistol: an antique one-shot made new, ivory and gold, an octagonal barrel cut with runes -----
let HP=null;
function hexPaths(){if(HP)return HP;const R={};
  R.fTop=poly([[5,1.5],[22.8,1.3],[22.8,.5],[5,.55]]);R.fMid=poly([[5,.55],[22.8,.5],[22.8,-.5],[5,-.55]]);R.fBot=poly([[5,-.55],[22.8,-.5],[22.8,-1.3],[5,-1.5]]);
  R.crown=rr(22.6,-1.95,24.4,1.95,.45);R.bands=[9.4,15.4,20.6].map(u=>rr(u-.5,-1.78,u+.5,1.78,.25));
  R.lock=cr(new Path2D(),[[-3.6,-1.9],[5.6,-1.8],[5.8,1.7],[2.4,2.5],[-1.2,2.7],[-3.9,1.3]]);
  R.grip=cr(new Path2D(),[[-3.4,-1.6],[1.6,-1.8],[.4,-3.9],[-2.2,-7.4],[-4.4,-9.6],[-7.4,-10.2],[-8.8,-8.8],[-7.2,-6.6],[-5.2,-3.6]]);
  R.pommel=(()=>{const P=new Path2D();P.ellipse(-7.6,-9.5,1.9,1.4,-.5,0,TAU);return P;})();
  R.tg=(()=>{const P=new Path2D();cr(P,[[2.8,-1.8],[2.6,-4.4],[.8,-5.2],[-.8,-4.2],[-.6,-3.6],[.7,-4.3],[1.8,-3.9],[2,-1.8]]);return P;})();
  R.trig=line([[1.2,-1.9],[.9,-2.9],[.3,-3.4]]);
  R.gem=(()=>{const P=new Path2D();P.ellipse(1.4,2.75,1,.75,0,0,TAU);return P;})();
  R.top=[line([[5,1.5],[22.8,1.3]]),line([[-3.4,1.4],[-1.2,2.7],[2.4,2.5],[5.6,1.7]])];R.bot=[line([[5,-1.5],[22.8,-1.3]]),line([[-4.4,-9.6],[-7.4,-10.2]])];
  R.glint={u0:6,u1:22,v:1};
  HP=R;return R;}
function hexDraw(c,o){const R=hexPaths(),ch=clamp(o.charge||0,0,1),now=o.now||0,rc=clamp(o.recoil||0,0,1);
  // the grip in ivory with gold filigree, a gold pommel
  c.fillStyle=G(c,'hg',c=>lgr(c,-8,-10,1,-2,[[0,'#b5a582'],[.45,'#e9dfc6'],[1,'#fff8e6']]));c.fill(R.grip);c.strokeStyle=K.goldD;c.lineWidth=.3;c.stroke(R.grip);
  vine(c,[[-1.2,-2.6],[-3,-5.4],[-5.4,-8.2]],.2,.9,rgba(K.gold,.95),1);
  c.fillStyle=G(c,'hp',c=>lgr(c,-9,-11,-6,-8,[[0,K.goldD],[.5,K.goldL],[1,K.goldD]]));c.fill(R.pommel);
  c.fillStyle=G(c,'ht',c=>lgr(c,0,-5,0,-2,[[0,K.goldD],[1,K.gold]]));c.fill(R.tg,'evenodd');c.strokeStyle='#3a3020';c.lineWidth=.35;c.lineCap='round';c.stroke(R.trig);
  // the lock in ivory under a gold border, scrolled, the gem where a flint pan would be
  c.fillStyle=G(c,'hl',c=>lgr(c,0,-2,0,2.7,[[0,'#c9bb98'],[.6,'#ece2ca'],[1,'#fffaf0']]));c.fill(R.lock);c.strokeStyle=K.gold;c.lineWidth=.4;c.stroke(R.lock);
  vine(c,[[-2.6,0],[1,.6],[4.6,-.2]],.18,.8,rgba(K.goldD,.9),3);
  c.fillStyle=ch>0?'#d9c2ff':'#6a4aa8';c.fill(R.gem);c.strokeStyle=K.gold;c.lineWidth=.25;c.stroke(R.gem);
  // the hammer: cocked back, or down on the shot
  c.save();c.translate(-2.4,1.8);c.rotate(rc>0?-.9:0);c.fillStyle=G(c,'hh',c=>lgr(c,-2,0,1,4,[[0,K.goldD],[.5,K.goldL],[1,K.gold]]));c.beginPath();c.moveTo(-.4,0);c.quadraticCurveTo(-1.8,2.2,-1.2,3.6);
  c.quadraticCurveTo(.2,4.4,1.2,3.6);c.quadraticCurveTo(.2,3.4,-.2,2.6);c.quadraticCurveTo(-.2,1.2,.8,0);c.closePath();c.fill();c.restore();
  // the barrel: three faces of the octagon, dark blued steel, gold bands, a flared gold crown
  c.fillStyle='#2c2e3c';c.fill(R.fTop);c.fillStyle='#1a1b24';c.fill(R.fMid);c.fillStyle='#0e0f15';c.fill(R.fBot);
  c.fillStyle=G(c,'hb',c=>lgr(c,0,-1.8,0,1.8,[[0,K.goldD],[.55,K.goldL],[1,K.goldD]]));for(const b of R.bands)c.fill(b);c.fill(R.crown);c.fillStyle='#000';c.fillRect(24.2,-.55,.2,1.1);
  // the rune channel: cut along the middle face; with a charge in it, it burns violet-white
  c.strokeStyle='#07070b';c.lineWidth=.42;c.beginPath();c.moveTo(6,0);c.lineTo(22,0);c.stroke();
  const glow=ch>0;c.lineWidth=.22;c.lineCap='round';
  for(let i=0;i<10;i++){const u=6.6+i*1.55;c.strokeStyle=glow?rgba('#f2e6ff',.4+.6*ch*(.6+.4*Math.sin(now*14-i*.9))):rgba(K.gold,.55);c.save();c.translate(u,0);FxLook.glyph(c,i+7,.9);c.restore();}
  if(glow){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=ch;c.strokeStyle=rgba('#b98cff',.32);c.lineWidth=1.3+ch*.5;c.beginPath();c.moveTo(6,0);c.lineTo(22.4,0);c.stroke();
    c.strokeStyle=rgba('#f6eeff',.75);c.lineWidth=.3;c.beginPath();c.moveTo(6,0);c.lineTo(22.4,0);c.stroke();
    const g=c.createRadialGradient(1.4,2.75,0,1.4,2.75,2.4+ch*2.2);g.addColorStop(0,rgba('#e6d4ff',.6*ch));g.addColorStop(1,rgba('#b98cff',0));c.fillStyle=g;c.beginPath();c.arc(1.4,2.75,2.4+ch*2.2,0,TAU);c.fill();
    // sparks crawl along the barrel
    c.fillStyle=rgba('#ffe2a3',ch);for(let i=0;i<6;i++){const u=6+((now*9+i*2.9)%16.4),v=Math.sin(now*23+i*2)*1.6;c.fillRect(u,v,.35,.35);}
    if(ch>.6){const a=(ch-.6)/.4;c.save();c.scale(1,.45);const g2=c.createRadialGradient(14,0,0,14,0,14);g2.addColorStop(0,rgba('#c9a0ff',.16*a));g2.addColorStop(1,rgba('#c9a0ff',0));c.fillStyle=g2;c.fillRect(0,-14,28,28);c.restore();}
    c.restore();}}

const DRAW={rifle:rifleDraw,pistol:pistolDraw,smg:smgDraw,hexpistol:hexDraw},PATHS={rifle:riflePaths,pistol:pistolPaths,smg:smgPaths,hexpistol:hexPaths};
function toLight(o,p){if(o&&o.dir){const l=Math.hypot(o.dir.x,o.dir.y)||1;return{x:o.dir.x/l,y:o.dir.y/l};}
  if(o&&o.light){const dx=o.light.x-p.x,dy=o.light.y-p.y,l=Math.hypot(dx,dy)||1;return{x:dx/l,y:dy/l};}return{x:.45,y:-.89};}
// The gun between the hand h and the tip t (the same call as ArmsLook.draw: h and t where the fighter's frame has them, fa the facing).
// o: light, dir, now, recoil (0..1), charge (0..1, the hex pistol), alpha. Returns false for a key it does not know.
function draw(c,key,h,t,fa,o){const d=D[key];if(!d)return false;o=o||{};
  const dx=t.x-h.x,dy=t.y-h.y,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,s=fa<0?-1:1,nx=-uy*s,ny=ux*s,k=d.k,R=PATHS[key](),rc=clamp(o.recoil||0,0,1);
  // the light in the design frame (v up)
  const Lw=toLight(o,{x:h.x+dx*.5,y:h.y+dy*.5}),lu=Lw.x*ux+Lw.y*uy,lv=-(Lw.x*nx+Lw.y*ny);
  c.save();c.globalAlpha=o.alpha??1;c.transform(ux,uy,nx,ny,h.x,h.y);
  // the kick: the muzzle comes up about the hand and the gun goes back a little
  if(rc){c.rotate(-rc*(key==='hexpistol'?.16:key==='pistol'?.11:.05));c.translate(-rc*(key==='rifle'?1.8:.9),0);}
  c.transform(k,0,0,-k,-d.H[0]*k,d.H[1]*k);c.lineCap='round';c.lineJoin='round';
  DRAW[key](c,o);
  // the light's edge along whichever side faces it, faint on the other; a glint that slides along the top as the gun turns
  c.globalCompositeOperation='lighter';c.lineWidth=.42/k;
  const at=clamp(.12+lv*.62,.05,key==='hexpistol'?.5:.75),ab=clamp(.1-lv*.55,.04,.6);
  c.strokeStyle=rgba(K.rim,at*(o.alpha??1));if(R.slideRim&&rc){c.save();c.translate(-rc*3.2,0);for(const p of R.top)c.stroke(p);c.restore();}else for(const p of R.top)c.stroke(p);
  c.strokeStyle=rgba(K.rim,ab*(o.alpha??1));for(const p of R.bot)c.stroke(p);
  const ang=Math.atan2(uy,ux)*s,fl=Math.pow(Math.max(0,Math.sin(ang*3.1+1.3)),3);
  if(fl>.05&&R.glint){const g=.5+.5*Math.sin(ang*2.3+(o.now||0)*.35),x=lerp(R.glint.u0,R.glint.u1,g);c.globalAlpha=fl*.75*(o.alpha??1);c.strokeStyle='#ffffff';c.lineWidth=.55;
    c.beginPath();c.moveTo(x-2,R.glint.v);c.lineTo(x+2,R.glint.v);c.stroke();}
  c.restore();return true;}
// the muzzle of a gun drawn between h and t: where the shot comes out and which way (ux, uy along the bore)
function muzzleAt(key,h,t,fa){const sp=SPEC[key];if(!sp)return null;const dx=t.x-h.x,dy=t.y-h.y,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,s=fa<0?-1:1,nx=-uy*s,ny=ux*s;
  return{x:h.x+ux*sp.len-nx*sp.bore,y:h.y+uy*sp.len-ny*sp.bore,ang:Math.atan2(uy,ux),ux,uy};}
// where the other hand goes (the foregrip) and where the stock meets the shoulder, on the gun's line
function foreAt(key,h,t){const sp=SPEC[key];if(!sp||sp.fore==null)return null;const L=Math.hypot(t.x-h.x,t.y-h.y)||1;return{x:h.x+(t.x-h.x)/L*sp.fore,y:h.y+(t.y-h.y)/L*sp.fore};}
function buttAt(key,h,t){const sp=SPEC[key];if(!sp)return null;const L=Math.hypot(t.x-h.x,t.y-h.y)||1;return{x:h.x-(t.x-h.x)/L*sp.butt,y:h.y-(t.y-h.y)/L*sp.butt};}
// for an ejected casing: where the port is
function portAt(key,h,t,fa){const P={rifle:[4,1.5],pistol:[4.8,1.6],smg:[6,1.6]}[key];if(!P)return null;const d=D[key],sp=SPEC[key],dx=t.x-h.x,dy=t.y-h.y,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,s=fa<0?-1:1,nx=-uy*s,ny=ux*s;
  const a=(P[0]-d.H[0])*d.k,b=-(P[1]-d.H[1])*d.k;return{x:h.x+ux*a+nx*b,y:h.y+uy*a+ny*b};}
function has(key){return!!D[key];}
return{draw,muzzleAt,foreAt,buttAt,portAt,has,setRifleScale,SPEC,D,ok:typeof Path2D==='function'};
})();
// ===== FX GUNS END =====
