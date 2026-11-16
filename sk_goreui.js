// ===== GORE UI START =====
// The blood and the wounds as they are drawn (since V120). The game's side is untouched: its drops (S.blood), its stains (S.stains),
// its bodies on blades (D.impaled, an item's `stuck`) and its marks are read here and never written, and nothing here draws a die:
// what varies from one drop or stain to the next is taken from its own numbers (a drop's size, a stain's turn).
//   the drops    each a bead with a tail along the path it has flown, in three reds, a haze where a burst has just left the wound
//   the stains   blots thrown out round a middle, and under a body a pool with its own edge and a wet light on it
//   a blade in a body   the stretch of the weapon inside the trunk is not drawn; where the point has come out it is red; the wound
//                it made stays on the body and runs
//   a blade that has cut   carries the blood for a few seconds
// S.gore is respected throughout: 'off' draws no blood at all (a blade in a body is still out of sight inside it), 'ink' its own colours.
const GoreLook=(()=>{
const fr=x=>x-Math.floor(x),ez=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
const mkc=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
// mid is the game's own spatter colour (GORE_COL, sk_ui.js); the stain is a little lighter than its flat one was, with a dark middle.
// cut is the middle of a cut on a body and the wound seen in a tear of Kael's clothes (V121: both were the game's bright mark colour,
// brighter than any blood here; red's is the spatter colour, ink's a step up from its spatter, which is lost on a dark coat)
const PAL={red:{deep:'#5c0916',mid:'#a5132b',lite:'#cc3a53',wet:'#ffb9c2',cut:'#a5132b',stain:'110,9,24',core:'60,5,13'},
  ink:{deep:'#2c1b55',mid:'#4b3184',lite:'#8571c4',wet:'#dcd2ff',cut:'#6a54ab',stain:'76,50,132',core:'42,26,82'}};
const pal=()=>PAL[S.gore]||null;
// the old drawing stays where there is no real canvas to work on (the headless checks: sk_dom.js's stub has a document, and its
// context answers nothing; asked once) and with the classic look; `plain` runs a drawing as it was before this file (the checks
// compare the two)
let OFF=false,REAL=null;
const real=()=>{if(REAL==null){try{const g=typeof document!=='undefined'&&document.createElement&&document.createElement('canvas').getContext('2d'),m=g&&g.getTransform&&g.getTransform();REAL=!!(m&&typeof m.a==='number');}catch(e){REAL=false;}}return REAL;};
const ok=()=>!OFF&&!S.classicLook&&real();
const plain=fn=>{const o=OFF;OFF=true;try{return fn();}finally{OFF=o;}};

// ---------- 1. the drops ----------
const PUFF={};
function puffOf(g){if(PUFF[g])return PUFF[g];const c=mkc(32,32),x=c.getContext('2d'),p=PAL[g],gr=x.createRadialGradient(16,16,0,16,16,16);
  gr.addColorStop(0,`rgba(${p.stain},.9)`);gr.addColorStop(.5,`rgba(${p.stain},.35)`);gr.addColorStop(1,`rgba(${p.stain},0)`);x.fillStyle=gr;x.fillRect(0,0,32,32);return PUFF[g]=c;}
// a drop's bead and its tail: where it is, and where it was a moment ago on the path it is flying (the game's own gravity on it)
function dropPath(b){
  const k=fr(b.r*917.31),rr=b.r*(.3+.26*k),tau=Math.min(b.age,.011+.02*k);
  const q=P(b.x,b.y,b.d),q1=P(b.x-b.vx*tau,b.y-b.vy*tau+.45*G*tau*tau,b.d);
  let dx=q.x-q1.x,dy=q.y-q1.y,L=Math.hypot(dx,dy);
  if(L<rr*.9){ctx.moveTo(q.x+rr,q.y);ctx.arc(q.x,q.y,rr,0,TAU);return;}
  if(L>8.5){q1.x=q.x-dx*8.5/L;q1.y=q.y-dy*8.5/L;}
  // (the tail's sides are drawn in toward its line: a bead with a thread behind it, not a dart)
  dx/=L;dy/=L;if(L>8.5)L=8.5;const a=Math.atan2(dy,dx),mx=q.x-dx*L*.42,my=q.y-dy*L*.42,w=rr*.2;
  ctx.moveTo(q1.x,q1.y);ctx.quadraticCurveTo(mx-dy*w,my+dx*w,q.x-dy*rr,q.y+dx*rr);ctx.arc(q.x,q.y,rr,a+Math.PI/2,a-Math.PI/2,true);ctx.quadraticCurveTo(mx+dy*w,my-dx*w,q1.x,q1.y);ctx.closePath();}
function drops(){
  const p=pal();if(!p)return;const B=S.blood,D=dripsNow();if(!B.length&&!D.length)return;
  ctx.save();ctx.globalCompositeOperation='source-over';
  // the haze of a burst that has just left the wound
  if(B.length){const pf=puffOf(S.gore);for(const b of B){if(b.age>=.1)continue;const q=P(b.x,b.y,b.d),R=3.5+5.5*fr(b.r*917.31);ctx.globalAlpha=(1-b.age/.1)*.17;ctx.drawImage(pf,q.x-R,q.y-R,R*2,R*2);}}
  ctx.globalAlpha=.96;const tones=[p.mid,p.deep,p.lite];
  for(let t=0;t<3;t++){ctx.fillStyle=tones[t];ctx.beginPath();
    for(const L of [B,D])for(const b of L){const k2=fr(b.r*351.7+.37);if((k2<.5?0:k2<.88?1:2)===t)dropPath(b);}
    ctx.fill();}
  // the wet light on the big ones
  ctx.fillStyle=p.wet;ctx.globalAlpha=.5;ctx.beginPath();
  for(const b of B){const rr=b.r*(.3+.26*fr(b.r*917.31));if(rr<.95)continue;const q=P(b.x,b.y,b.d),hx=q.x-rr*.3,hy=q.y-rr*.34;ctx.moveTo(hx+rr*.27,hy);ctx.arc(hx,hy,rr*.27,0,TAU);}
  ctx.fill();ctx.restore();}

// ---------- 2. the stains ----------
// The blots are painted once for each setting: six thrown ones and three pools, each on a sheet four of its radii wide and squashed
// as the floor is seen. Their shapes come from a small die of their own, seeded, so they are the same everywhere.
const BLOT={},SQ=.34;let F0=null;
// (each blot is kept four ways: as painted and mirrored, and both again at three eighths the size for the small stains, which are
// most of them: no stain then needs a transform of its own or a big picture drawn small. A floor at the game's cap of 360 stains cost
// 3.7 ms a frame here before this and the old ellipses 1.6.)
const pack=cv=>{const mk2=(w,h,flip)=>{const c=mkc(w,h),x=c.getContext('2d');if(flip){x.translate(w,0);x.scale(-1,1);}x.drawImage(cv,0,0,w,h);return c;},w2=Math.round(cv.width*.375),h2=Math.round(cv.height*.375);
  return{w:cv.width,h:cv.height,im:[cv,mk2(cv.width,cv.height,true)],sm:[mk2(w2,h2,false),mk2(w2,h2,true)]};};
function blob(c,cx,cy,r,n,amp,rnd){const pt=[];for(let i=0;i<n;i++){const a=i/n*TAU,rr=r*(1-amp/2+amp*rnd());pt.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*SQ]);}
  c.beginPath();const m=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];let s=m(pt[n-1],pt[0]);c.moveTo(s[0],s[1]);
  for(let i=0;i<n;i++){const e=m(pt[i],pt[(i+1)%n]);c.quadraticCurveTo(pt[i][0],pt[i][1],e[0],e[1]);}c.closePath();}
function blots(g){if(BLOT[g])return BLOT[g];const p=PAL[g],out=[];let s=0x2F6E2B1;const rnd=()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return((s>>>0)%65536)/65536;};
  for(let v=0;v<6;v++){const W=128,Hh=44,cv=mkc(W,Hh),c=cv.getContext('2d'),cx=W/2,cy=Hh/2,U=W/4;
    c.fillStyle=`rgb(${p.stain})`;blob(c,cx,cy,U*(.84+.14*rnd()),9+v%3,.34,rnd);c.fill();
    // thrown out round it: beads, the far ones long, each pointing away from the middle
    const n=3+Math.floor(rnd()*5);for(let i=0;i<n;i++){const a=rnd()*TAU,d=U*(1.12+.78*rnd()),r=U*(.045+.1*rnd()),x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d*SQ;
      c.beginPath();c.ellipse(x,y,r*(1.1+1.5*rnd()),Math.max(.6,r*SQ*1.4),Math.atan2(Math.sin(a)*SQ,Math.cos(a)),0,TAU);c.fill();}
    c.globalAlpha=.5;c.fillStyle=`rgb(${p.core})`;blob(c,cx+(rnd()-.5)*5,cy,U*.5,7,.3,rnd);c.fill();out.push(pack(cv));}
  for(let v=0;v<3;v++){const W=256,Hh=88,cv=mkc(W,Hh),c=cv.getContext('2d'),cx=W/2,cy=Hh/2,U=W/4;
    c.fillStyle=`rgb(${p.stain})`;blob(c,cx,cy,U*.9,13,.22,rnd);c.fill();
    // a tongue or two where it has found the floor's fall
    for(let i=0;i<2+v%2;i++){const a=rnd()*TAU,d=U*(.55+.3*rnd());blob(c,cx+Math.cos(a)*d,cy+Math.sin(a)*d*SQ,U*(.34+.2*rnd()),9,.3,rnd);c.fill();}
    c.globalAlpha=.55;c.fillStyle=`rgb(${p.core})`;blob(c,cx+(rnd()-.5)*8,cy+2,U*.6,10,.22,rnd);c.fill();
    // the wet light lying on it: along its far edge (a filled sliver between two arcs, widest in the middle: as a stroke it was
    // under the drawing guide's width at the size a pool is drawn), and two streaks on its face
    {const rx=U*.86,ry=rx*SQ,y0=cy+1.5;c.globalAlpha=.3;c.fillStyle=p.lite;c.beginPath();c.ellipse(cx,y0,rx,ry,0,Math.PI*1.08,Math.PI*1.92);c.ellipse(cx,y0+4.2,rx,ry,0,Math.PI*1.92,Math.PI*1.08,true);c.closePath();c.fill();}
    c.globalAlpha=.3;c.fillStyle=p.wet;c.beginPath();c.ellipse(cx-U*.26,cy-U*SQ*.38,U*.3,U*SQ*.07,-.06,0,TAU);c.fill();
    c.globalAlpha=.2;c.beginPath();c.ellipse(cx+U*.32,cy-U*SQ*.16,U*.13,U*SQ*.045,.05,0,TAU);c.fill();out.push(pack(cv));}
  return BLOT[g]=out;}
// (a stain the game has just made lands: it spreads to its size in a moment and throws up a bead or two. When each was first seen
// is the drawing's own note, by the game's clock.)
const BORN=new WeakMap();
function stains(){
  const p=pal();if(S.F[0]!==F0){F0=S.F[0];reset();}if(!p)return;const L=S.stains;if(!L.length&&!DSTAIN.length)return;const B=blots(S.gore);
  ctx.save();ctx.globalCompositeOperation='source-over';const T0=ctx.getTransform(),SCL=Math.hypot(T0.a,T0.b)||1,now=S.t;
  // (a pool is drawn half as wide again as the game's own measure of it: at that measure a body lying on it hid it)
  const put=(x,d,r,a,rot,pool)=>{const q=P(x,S.arena.ground(x,d)+.5,d),bl=pool?B[6+Math.floor(fr(rot*7.13)*3)]:B[Math.floor(fr(rot*3.713)*6)],w=r*(pool?6:4),h=w*bl.h/bl.w;
    ctx.globalAlpha=Math.min(1,a*(pool?1.32:1.18));ctx.drawImage((w*SCL<52?bl.sm:bl.im)[fr(rot*11.9)>.5?1:0],q.x-w/2,q.y-h/2,w,h);return q;};
  for(const st of L){let t0=BORN.get(st);if(t0==null){t0=now;BORN.set(st,t0);}const age=now-t0;
    if(age>=.24||st.grow>0||S.warming){put(st.x,st.d,st.r,st.a,st.rot,st.grow>0);continue;}
    const q=put(st.x,st.d,st.r*(.5+.5*ez(age/.13)),st.a,st.rot,false);if(st.r<1.9)continue;
    const u=age/.24;ctx.fillStyle=p.mid;ctx.globalAlpha=(1-u)*.9;ctx.beginPath();
    for(let i=0;i<3;i++){const an=fr(st.rot*(1.7+i*.93))*TAU,ds=st.r*(.7+1.7*u),hh=u*(1-u)*st.r*2.2,x=q.x+Math.cos(an)*ds,y=q.y+Math.sin(an)*ds*SQ-hh,rr=.2+.38*(1-u);ctx.moveTo(x+rr,y);ctx.arc(x,y,rr,0,TAU);}
    ctx.fill();}
  for(const st of DSTAIN)put(st.x,st.d,st.r,st.a,st.rot,false);
  ctx.restore();}

// ---------- 3. a blade in a body, and a blade that has cut ----------
const KR=.6;   // the trunk's half-width as it is drawn, in body.torsoW's
const dseg=(x,y,a,b)=>{const vx=b.x-a.x,vy=b.y-a.y,l2=vx*vx+vy*vy||1,u=Math.max(0,Math.min(1,((x-a.x)*vx+(y-a.y)*vy)/l2));return Math.hypot(x-a.x-vx*u,y-a.y-vy*u);};
// the victim's trunk in the drawer's own frame (ox, oy: from his depth to the drawer's), from the hips to a little past the chest
function trunk(D,ox,oy){const p=D.p[PEL],c=D.p[CHE];return{P:{x:p.x+ox,y:p.y+oy},C:{x:c.x+(c.x-p.x)*.12+ox,y:c.y+(c.y-p.y)*.12+oy},R:D.body.torsoW*KR};}
// the stretch of the weapon (h to t) inside the trunk, as shares of its length: {u0, u1}, or null where it is not in it
function inBody(h,t,T){const dx=t.x-h.x,dy=t.y-h.y,N=32,ins=u=>dseg(h.x+dx*u,h.y+dy*u,T.P,T.C)<T.R;let a=-1,b=-1;
  for(let i=0;i<=N;i++)if(ins(i/N)){if(a<0)a=i;b=i;}
  if(a<0)return null;const edge=(lo,hi)=>{for(let k=0;k<6;k++){const m=(lo+hi)/2;if(ins(m)===ins(hi))hi=m;else lo=m;}return(lo+hi)/2;};
  return{u0:a>0?edge((a-1)/N,a/N):0,u1:b<N?edge((b+1)/N,b/N):1};}
function capsule(g,T){const a=Math.atan2(T.C.y-T.P.y,T.C.x-T.P.x);g.beginPath();g.arc(T.C.x,T.C.y,T.R,a-Math.PI/2,a+Math.PI/2);g.arc(T.P.x,T.P.y,T.R,a+Math.PI/2,a-Math.PI/2);g.closePath();}
// (the game lets the body go when the hold is over, with the blade still on its way back out of it: the drawing keeps the body it
// was in for as long as the blade still crosses its trunk, INB)
const INB=new WeakMap();
function victimOf(f){for(const D of S.F){const im=D.impaled;if(im&&im.A===f&&im.u0!=null&&!D.gone&&D.p[PEL]&&D.p[CHE]&&D.body&&D.body.torsoW>0){INB.set(f,{D,t:S.t});return D;}}
  const k=INB.get(f);if(!k)return null;if(S.t-k.t>1.6||k.D.gone||S.F.indexOf(k.D)<0){INB.delete(f);return null;}return k.D;}
// blood on steel: who cut or ran someone through, and when (the game's own clock). It thins over WET_FOR seconds.
const WET=new WeakMap(),WET_FOR=9;
const wetOf=o=>{const w=WET.get(o);if(!w)return 0;const u=(S.t-w.t)/WET_FOR;return u<0||u>=1?0:w.k*(1-u)*(1-u*.4);};
// (the game's hooks are its word to the drawing: each is heard here first and passed on as it was)
if(S.hooks&&S.hooks.rip){const r=S.hooks.rip;S.hooks.rip=function(A,D,res,C,zone,edge){try{if(edge&&A&&A.wp&&!A.wp.unarmed)WET.set(A,{t:S.t,k:res&&res.out==='crit'?1:.72});}catch(e){}return r.apply(this,arguments);};}
// the weapon drawn apart from the picture, so that what is done to it here (the part inside a body taken out, the blood laid on its
// steel) touches nothing else; then set down where it would have been drawn. What the drawing found set on the context and what it
// leaves set are carried across both ways: the picture's next strokes find the context as they always did.
let SC=null;const CARRY=['fillStyle','strokeStyle','lineWidth','lineCap','lineJoin','miterLimit','globalAlpha','globalCompositeOperation'];
function apart(box,draw,work){
  const main=ctx,m=main.getTransform(),cw=main.canvas.width,ch=main.canvas.height;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for(const [x,y] of [[box[0],box[1]],[box[2],box[1]],[box[0],box[3]],[box[2],box[3]]]){const X=m.a*x+m.c*y+m.e,Y=m.b*x+m.d*y+m.f;if(X<x0)x0=X;if(X>x1)x1=X;if(Y<y0)y0=Y;if(Y>y1)y1=Y;}
  x0=Math.max(0,Math.floor(x0));y0=Math.max(0,Math.floor(y0));x1=Math.min(cw,Math.ceil(x1));y1=Math.min(ch,Math.ceil(y1));const w=x1-x0,h=y1-y0;
  if(!(w>=2&&h>=2)||w*h>4e6){draw();return false;}
  if(!SC)SC=mkc(Math.max(64,w),Math.max(64,h));if(SC.width<w||SC.height<h){SC.width=Math.max(w,SC.width);SC.height=Math.max(h,SC.height);}
  const g=SC.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.globalAlpha=1;g.clearRect(0,0,w,h);
  g.setTransform(m.a,m.b,m.c,m.d,m.e-x0,m.f-y0);for(const k of CARRY)g[k]=main[k];
  ctx=g;try{draw();}finally{ctx=main;}
  const keep={};for(const k of CARRY)keep[k]=g[k];
  g.save();g.globalAlpha=1;try{work(g);}finally{g.restore();}
  main.save();main.setTransform(1,0,0,1,0,0);main.globalAlpha=1;main.globalCompositeOperation='source-over';main.drawImage(SC,0,0,w,h,x0,y0,w,h);main.restore();
  for(const k of CARRY)main[k]=keep[k];return true;}
// blood laid on the steel from s0 to s1 along it (units from the grip), a strong, hw each side: over the weapon's own pixels only.
// whole: one coat (the point that has come out of a body); else in patches, with steel between them (what a cut leaves)
function coat(g,h,ux,uy,s0,s1,hw,a,whole,seed){const p=pal();if(!p||a<=.01||s1-s0<1)return;const nx=-uy,ny=ux;
  g.globalCompositeOperation='source-atop';
  const band=(a0,a1,w)=>{g.beginPath();g.moveTo(h.x+ux*a0+nx*w,h.y+uy*a0+ny*w);g.lineTo(h.x+ux*a1+nx*w,h.y+uy*a1+ny*w);g.lineTo(h.x+ux*a1-nx*w,h.y+uy*a1-ny*w);g.lineTo(h.x+ux*a0-nx*w,h.y+uy*a0-ny*w);g.closePath();g.fill();};
  if(whole){g.fillStyle=p.mid;g.globalAlpha=a*.3;band(s0,s1,hw);g.fillStyle=p.deep;g.globalAlpha=a*.5;band(s0,s0+2.5,hw);g.fillStyle=p.mid;g.globalAlpha=a*.55;band(s0+1,s1,hw*.24);}
  else{const n=6,Ls=s1-s0;for(let i=0;i<n;i++){const k=fr(Math.sin(seed*12.9898+i*78.233)*43758.5453),k2=fr(k*57.31),c=s0+Ls*(.12+.88*(i+.5*k)/n),l=Ls*(.05+.09*k2),al=a*(.5+.5*k2)*Math.min(1,(c-s0)/(Ls*.35)+.25);
      g.fillStyle=p.deep;g.globalAlpha=al*.55;band(Math.max(s0,c-l),Math.min(s1,c+l),hw);g.fillStyle=p.mid;g.globalAlpha=al*.45;band(Math.max(s0,c-l*.7),Math.min(s1,c+l*.7),hw*.4);}
    g.fillStyle=p.deep;g.globalAlpha=a*.5;band(s0+Ls*.72,s1,hw);}
  g.globalAlpha=1;g.globalCompositeOperation='source-over';}
// a fighter's weapon: as ever, unless it is in someone or has blood on it
function weapon(base,f){
  if(!ok()||!f.wp||f.wp.unarmed||f.wp.fam==='gun')return base(f);
  const D=victimOf(f),wet=pal()?wetOf(f):0;if(!D&&wet<.03)return base(f);
  const h=f.p[HAF],t=f.p[TIP],wp=f.wp,L=Math.hypot(t.x-h.x,t.y-h.y)||1,ux=(t.x-h.x)/L,uy=(t.y-h.y)/L,mg=wp.key==='axe'?34:16,bx=h.x-ux*(wp.butt||0),by=h.y-uy*(wp.butt||0);
  const hw=wp.key==='axe'?30:wp.key==='spear'?6:5;
  apart([Math.min(bx,t.x)-mg,Math.min(by,t.y)-mg,Math.max(bx,t.x)+mg,Math.max(by,t.y)+mg],()=>base(f),g=>{
    if(D){const T=trunk(D,(D.dep-f.dep)*PSX,-(D.dep-f.dep)*PSY),io=inBody(h,t,T);
      if(io){g.globalCompositeOperation='destination-out';g.fillStyle='#000';capsule(g,T);g.fill();g.globalCompositeOperation='source-over';
        if(io.u1<.985)coat(g,h,ux,uy,L*io.u1-1,L+4,hw,.9,true,0);
        // (on its way out it comes away red as far as it was in)
        if(!D.impaled&&pal())coat(g,h,ux,uy,L*.25,L*io.u0,hw,.55,false,f.idx+1);
        wound(D,T,h,t,io,f);}
      else if(!D.impaled){INB.delete(f);if(wet>.03)coat(g,h,ux,uy,L*.3,L+3,hw,wet*.85,false,f.idx+1);}}
    else coat(g,h,ux,uy,wp.key==='axe'?L*.62:wp.key==='spear'?L-20:L*.3,L+3,hw,wet*.85,false,f.idx+1);});
  if(pal()&&!D&&wet>.3&&!S.warming)drip(f,t,wet);}
// a weapon left in a body (the game's item with `stuck`): the same, in the picture's own frame
function item(base,it){
  const st=it.stuck,D=st?S.F[st.f]:null;if(!ok()||!D||D.gone||!D.p[PEL]||!D.p[CHE]||!(D.body&&D.body.torsoW>0))return base(it);
  const wp=WEAPONS[it.key];if(!wp)return base(it);
  const a=P(it.a.x,it.a.y,it.dep),b=P(it.b.x,it.b.y,it.dep),L0=Math.hypot(b.x-a.x,b.y-a.y)||1,ux=(b.x-a.x)/L0,uy=(b.y-a.y)/L0,h={x:a.x+ux*wp.butt,y:a.y+uy*wp.butt},L=L0-wp.butt,mg=wp.key==='axe'?34:16;
  const p=P(D.p[PEL].x,D.p[PEL].y,D.dep),c=P(D.p[CHE].x,D.p[CHE].y,D.dep),T={P:p,C:{x:c.x+(c.x-p.x)*.12,y:c.y+(c.y-p.y)*.12},R:D.body.torsoW*KR},hw=wp.key==='axe'?30:wp.key==='spear'?6:5;
  apart([Math.min(a.x,b.x)-mg,Math.min(a.y,b.y)-mg,Math.max(a.x,b.x)+mg,Math.max(a.y,b.y)+mg],()=>base(it),g=>{const io=inBody(h,b,T);if(!io)return;
    g.globalCompositeOperation='destination-out';g.fillStyle='#000';capsule(g,T);g.fill();g.globalCompositeOperation='source-over';
    if(io.u1<.985)coat(g,h,ux,uy,L*io.u1-1,L+4,hw,.8,true,0);});}

// ---------- 4. the wound a blade leaves ----------
// Where it went in and where it came out, kept on the body in the trunk's own frame (u along hips to chest, o off that line), so
// they go where the body goes. Made once for each blade in a body, when it is first drawn in it; drawn with the body's marks.
const WND=new WeakMap(),SEENIN=new WeakMap(),SOAK={};
// the cloth soaking round a wound: a cloud with no edge to it (an edge made it a badge), painted once for each setting
function soaks(g){if(SOAK[g])return SOAK[g];const p=PAL[g],out=[],m=[parseInt(p.mid.slice(1,3),16),parseInt(p.mid.slice(3,5),16),parseInt(p.mid.slice(5,7),16)].join(',');
  let s=0x51A3C7;const rnd=()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return((s>>>0)%65536)/65536;};
  for(let v=0;v<3;v++){const cv=mkc(64,64),c=cv.getContext('2d');
    for(let i=0;i<7;i++){const a=rnd()*TAU,d=i?4+rnd()*9:0,x=32+Math.cos(a)*d*.8,y=30+Math.sin(a)*d+(i?5:0),r=i?7+rnd()*8:11,gr=c.createRadialGradient(x,y,0,x,y,r);
      gr.addColorStop(0,`rgba(${m},${i?.5:.8})`);gr.addColorStop(.55,`rgba(${p.stain},${i?.4:.6})`);gr.addColorStop(1,`rgba(${p.stain},0)`);c.fillStyle=gr;c.fillRect(0,0,64,64);}
    out.push(cv);}
  return SOAK[g]=out;}
function wound(D,T,h,t,io,A){if(!pal())return;const im=D.impaled;if(!im)return;
  const px=D.p[PEL],cx=D.p[CHE],ox=T.P.x-px.x,oy=T.P.y-px.y,vx=cx.x-px.x,vy=cx.y-px.y,l2=vx*vx+vy*vy||1,Lb=Math.sqrt(l2);
  const at=(w,u)=>{const x=h.x+(t.x-h.x)*u-ox,y=h.y+(t.y-h.y)*u-oy;w.u=((x-px.x)*vx+(y-px.y)*vy)/l2;w.o=((x-px.x)*-vy+(y-px.y)*vx)/Lb;
    // which way is down, from the line of the body as it is now: it runs that way on him from here on
    w.dn=Math.PI/2-Math.atan2(vy,vx);return w;};
  let W=SEENIN.get(im);
  if(!W){W={a:{t0:S.t,k:1},b:null};SEENIN.set(im,W);const list=WND.get(D)||[];list.push(W.a);if(list.length>8)list.splice(0,list.length-8);WND.set(D,list);}
  at(W.a,io.u0);
  if(io.u1<.985){if(!W.b){W.b={t0:S.t,k:.85,out:1};const list=WND.get(D);list.push(W.b);}at(W.b,io.u1);}}
// (in a fighter's own sprite, where the light module draws him (its canvas says so: ownFigure), the wound and what runs from it are laid on him alone, 'source-atop':
// the cloth takes them and nothing round him does; drawn straight into the picture they are kept small instead)
function wounds(f){const list=WND.get(f),p=pal();if(!list||!p)return;const a=f.p[PEL],b=f.p[CHE],vx=b.x-a.x,vy=b.y-a.y,Lb=Math.hypot(vx,vy)||1,ux=vx/Lb,uy=vy/Lb,nx=-uy,ny=ux,ba=Math.atan2(uy,ux);
  const own=!!ctx.canvas.ownFigure,B=own?soaks(S.gore):null;
  ctx.save();if(own)ctx.globalCompositeOperation='source-atop';
  for(const w of list){const x=a.x+vx*w.u+nx*w.o,y=a.y+vy*w.u+ny*w.o,age=S.t-w.t0,g=ez(age/1.5),r=ez(age/3),sz=(f.body.h||1)*w.k,da=ba+w.dn,dx=Math.cos(da),dy=Math.sin(da);
    // the cloth soaking round it
    if(own){const R=(2.6+3.6*g)*sz*(w.out?1.15:1),im=B[w.out?1:(w.u*97|0)%2*2];ctx.save();ctx.translate(x,y);ctx.rotate(da-Math.PI/2);ctx.globalAlpha=.92;ctx.drawImage(im,-R*1.5,-R*1.35,R*3,R*3*(1+.45*g));ctx.restore();}
    // running down him from it: down as it was along the body when it was made
    ctx.fillStyle=p.mid;ctx.globalAlpha=.8;
    for(let i=0;i<(own?3:1);i++){const h=fr(w.u*37.7+i*.37+w.o*.11),off=(i-1)*.95*sz,Ld=(2+(5+9*h)*r)*sz,x0=x-dy*off,y0=y+dx*off,wd=(.42+.26*h)*sz;
      ctx.beginPath();ctx.moveTo(x0-dy*wd,y0+dx*wd);ctx.lineTo(x0+dx*Ld,y0+dy*Ld);ctx.lineTo(x0+dy*wd,y0-dx*wd);ctx.closePath();ctx.fill();}
    // the wound itself: a dark slit across the way the blade lies, a wet thread in it
    ctx.globalAlpha=.95;ctx.fillStyle=p.deep;ctx.beginPath();ctx.ellipse(x,y,.7*sz,1.8*sz,ba+Math.PI/2,0,TAU);ctx.fill();
    ctx.fillStyle=p.lite;ctx.globalAlpha=.6;ctx.beginPath();ctx.ellipse(x,y,.17*sz,1.05*sz,ba+Math.PI/2,0,TAU);ctx.fill();}
  ctx.restore();}
// the cuts and bruises the game keeps on a body (f.marks): a cut dark and open with the blood's red down its middle and a run from its lower end,
// a bruise a dark bloom. (They were one bright line and one dot.) The tears the looks draw themselves are left to them, as before.
function marks(base,f){if(!ok())return base(f);const p=pal();
  if(p&&f.marks.length){const look=typeof lookOn==='function'&&lookOn(f);ctx.save();ctx.lineCap='round';
    const ln=(x0,y0,x1,y1)=>{ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();};
    for(const m of f.marks){if(m.rip&&look)continue;const a=f.p[m.a],b=f.p[m.b],L=Math.hypot(b.x-a.x,b.y-a.y)||1,o=m.off||0,x=lerp(a.x,b.x,m.u)-(b.y-a.y)/L*f.facing*o,y=lerp(a.y,b.y,m.u)+(b.x-a.x)/L*f.facing*o,ang=Math.atan2(b.y-a.y,b.x-a.x)+m.ang;
      if(m.edge){const cx=Math.cos(ang)*m.len/2,cy=Math.sin(ang)*m.len/2,lo=cy>0?1:-1,lx=x+cx*lo,ly=y+cy*lo,run=2.2+3.4*fr(m.u*91.7);
        // (the widths are the drawing guide's: a line lands on a phone at about .83 of its width here, and 1.5 is the least)
        ctx.strokeStyle=p.deep;ctx.globalAlpha=.92;ctx.lineWidth=3.1;ln(x-cx,y-cy,x+cx,y+cy);
        ctx.strokeStyle=p.mid;ctx.globalAlpha=.85;ctx.lineWidth=1.9;ln(lx,ly,lx+.3,ly+run);
        ctx.strokeStyle=p.cut;ctx.globalAlpha=.95;ctx.lineWidth=1.9;ln(x-cx*.78,y-cy*.78,x+cx*.78,y+cy*.78);}
      else{ctx.globalAlpha=.55;ctx.fillStyle=p.deep;ctx.beginPath();ctx.arc(x,y,2.5,0,TAU);ctx.fill();ctx.globalAlpha=.5;ctx.fillStyle=p.mid;ctx.beginPath();ctx.arc(x,y,1.25,0,TAU);ctx.fill();}}
    ctx.restore();}
  wounds(f);}
// where a head has come off (it was one bright disc on the chest's top): the cut seen from the side, a dark face with a wet rim, and
// in his own sprite the collar and shoulders soaked under it
function stump(f){const p=pal();if(!p)return;const a=f.p[PEL],b=f.p[CHE],L=Math.hypot(b.x-a.x,b.y-a.y)||1,ux=(b.x-a.x)/L,uy=(b.y-a.y)/L,an=Math.atan2(uy,ux),W=f.body.torsoW,R=W*.3;
  const own=!!ctx.canvas.ownFigure,age=f.fountain?S.t-f.fountain.t0:9,g=ez(age/1.2);
  // (the head, while it flies: it leaves a line of drops behind it, the drawing's own like a blade's)
  if(age<1.2&&!S.warming&&S.arena&&!S.arena.scroll){const hp=f.p[HEAD],n=Math.floor(S.t/.045);
    if(DLAST.get(hp)!==n&&DRIPS.length<56&&hp.y<S.arena.ground(hp.x,f.dep)-6){DLAST.set(hp,n);const k=fr(n*.6180339),k2=fr(n*.7548776);
      DRIPS.push({x:hp.x,y:hp.y+2,d:f.dep+(k2-.5)*4,vx:(hp.x-hp.px)/DT*.45+(k-.5)*46,vy:(hp.y-hp.py)/DT*.45+20*k2,r:.9+1.3*k*k2+.3*k,age:0});}}
  ctx.save();
  if(own){ctx.globalCompositeOperation='source-atop';ctx.translate(b.x,b.y);ctx.rotate(an+Math.PI/2);ctx.globalAlpha=.9;
    const im=soaks(S.gore)[1],w=W*(1.5+.9*g),h=W*(1.3+1.5*g);ctx.drawImage(im,-w/2,-W*.75,w,h);ctx.rotate(-an-Math.PI/2);ctx.translate(-b.x,-b.y);ctx.globalCompositeOperation='source-over';}
  const cx=b.x+ux*R*.7,cy=b.y+uy*R*.7;
  ctx.globalAlpha=.96;ctx.fillStyle=p.mid;ctx.beginPath();ctx.ellipse(cx,cy,R*.5,R*1.02,an,0,TAU);ctx.fill();
  ctx.fillStyle=p.deep;ctx.beginPath();ctx.ellipse(cx+ux*R*.08,cy+uy*R*.08,R*.3,R*.74,an,0,TAU);ctx.fill();
  // the head's own cut, on the side it came off: across the line from where the neck was
  {const hp=f.p[HEAD],dx=hp.x-b.x,dy=hp.y-b.y,d=Math.hypot(dx,dy)||1,hr=f.body.headR||6,hx=hp.x-dx/d*hr*.86,hy=hp.y-dy/d*hr*.86,ha=Math.atan2(dy,dx);
    ctx.globalAlpha=.95;ctx.fillStyle=p.mid;ctx.beginPath();ctx.ellipse(hx,hy,hr*.2,hr*.46,ha,0,TAU);ctx.fill();
    ctx.fillStyle=p.deep;ctx.beginPath();ctx.ellipse(hx,hy,hr*.11,hr*.32,ha,0,TAU);ctx.fill();}
  ctx.restore();}

// ---------- 5. what leaves a wet blade ----------
// While the blood on it is fresh a blade lets go of it: flung off the point while the swing goes on after a cut (in the line the
// point is moving, a moment long), then a few drops falling from the point. These are the drawing's own (the game knows nothing of
// them), let go by the game's clock and a count, never a die, and each leaves a small stain of its own where it lands.
const DRIPS=[],DSTAIN=[],DLAST=new WeakMap();let DT0=null,DN=0;
function drip(f,t,wet){if(!S.arena||S.arena.scroll)return;const w=WET.get(f),age=w?S.t-w.t:9,vx=(t.x-t.px)/DT,vy=(t.y-t.py)/DT,sp=Math.hypot(vx,vy);
  if(age<.3&&sp>240){if(DLAST.get(f)===S._rf||DRIPS.length>=56)return;DLAST.set(f,S._rf);
    for(let i=0;i<2;i++){const n=++DN,k=fr(n*.6180339),k2=fr(n*.7548776),u=.72+.28*k;
      DRIPS.push({x:lerp(f.p[HAF].x,t.x,u),y:lerp(f.p[HAF].y,t.y,u),d:f.dep+(k2-.5)*5,vx:vx*(.3+.3*k)*u+(k2-.5)*70,vy:vy*(.3+.3*k)*u-30*k2,r:.8+1.5*k*k2,age:0});}
    return;}
  const n=Math.floor(S.t/(.34+.5*(1-wet))+f.idx*.37);if(DLAST.get(f)===-n-1)return;DLAST.set(f,-n-1);
  if(DRIPS.length<56){const k=fr(n*.6180339+f.idx*.21);DRIPS.push({x:t.x,y:t.y+1,d:f.dep,vx:0,vy:14,r:.95+.5*k,age:0});}}
function dripsNow(){const t=S.t,dt=DT0==null?0:Math.max(0,Math.min(.05,t-DT0));DT0=t;if(!S.arena){DRIPS.length=0;return DRIPS;}
  for(let i=DRIPS.length-1;i>=0;i--){const d=DRIPS[i];d.age+=dt;d.vy+=G*.9*dt;d.x+=d.vx*dt;d.y+=d.vy*dt;const gy=S.arena.ground(d.x,d.d);
    if(d.y>=gy-1||d.age>3){DRIPS.splice(i,1);if(d.y>=gy-1){DSTAIN.push({x:d.x,d:d.d,r:d.r*(1.3+fr(d.r*5.3)),a:.5,rot:fr(d.r*7.7)*3.1});if(DSTAIN.length>64)DSTAIN.shift();}}}
  return DRIPS;}
// a new fight starts clean
function reset(){DRIPS.length=0;DSTAIN.length=0;DT0=null;}
// What the old drawings left set on the context when they were done is part of the picture (GUIDE, pitfalls): the new ones draw
// inside save and restore, then leave the same things set that the old ones did, under the same conditions.
const left={
  stains(){if(S.gore==='off'||!S.stains.length)return;const st=S.stains[S.stains.length-1];ctx.fillStyle=`rgba(${GORE_COL[S.gore].stain},${st.a})`;},
  blood(){if(S.gore==='off'||!S.blood.length)return;const c=GORE_COL[S.gore];ctx.fillStyle=c.spat;ctx.strokeStyle=c.spat;ctx.lineCap='round';
    for(const b of S.blood)if(Math.hypot(b.vx,b.vy)>140)ctx.lineWidth=b.r*1.3;ctx.globalAlpha=1;},
  marks(f){if(S.gore==='off'||!f.marks.length)return;const c=GORE_COL[S.gore];ctx.strokeStyle=c.mark;ctx.fillStyle=c.mark;ctx.lineCap='round';
    const look=typeof lookOn==='function'&&lookOn(f);for(const m of f.marks){if(m.rip&&look)continue;if(m.edge)ctx.lineWidth=1.7;else ctx.globalAlpha=1;}}};
// (for the checks, sk_gore_page.js: where a fighter's blade or a weapon left in a body is inside it, how wet a blade is, the wounds
// kept on a body, the drawing's own drops and their stains)
const probe={inside(f){const D=victimOf(f);if(!D)return null;const T=trunk(D,(D.dep-f.dep)*PSX,-(D.dep-f.dep)*PSY),io=inBody(f.p[HAF],f.p[TIP],T);return io?{D:D.idx,u0:io.u0,u1:io.u1,T}:null;},
  itemInside(it){const st=it.stuck,D=st?S.F[st.f]:null,wp=WEAPONS[it.key];if(!D||!wp)return null;const a=P(it.a.x,it.a.y,it.dep),b=P(it.b.x,it.b.y,it.dep),L0=Math.hypot(b.x-a.x,b.y-a.y)||1,h={x:a.x+(b.x-a.x)/L0*wp.butt,y:a.y+(b.y-a.y)/L0*wp.butt};
    const p=P(D.p[PEL].x,D.p[PEL].y,D.dep),c=P(D.p[CHE].x,D.p[CHE].y,D.dep),T={P:p,C:{x:c.x+(c.x-p.x)*.12,y:c.y+(c.y-p.y)*.12},R:D.body.torsoW*KR},io=inBody(h,b,T);return io?{D:D.idx,u0:io.u0,u1:io.u1,T}:null;},
  wet:wetOf,wounds:f=>(WND.get(f)||[]).length,own:()=>({drops:DRIPS.length,stains:DSTAIN.length})};
return{ok,plain,drops,stains,weapon,item,marks,stump,reset,left,probe,PAL};
})();
// ---------- in the game ----------
// The blood goes over the blow's flash (it was under it: at a kill the light hid the wound). Where the light module draws the
// effects (FXL.fx, sk_lightui.js) the drops follow it; where it does not, they are drawn where they always were.
{const b=drawBlood;drawBlood=function(){if(!GoreLook.ok())return b();if(!(typeof FXL!=='undefined'&&FXL.on()&&FXL.fx))GoreLook.drops();GoreLook.left.blood();};}
if(typeof FXL!=='undefined'&&FXL.fx){const fx=FXL.fx;FXL.fx=function(){const r=fx.apply(this,arguments);if(GoreLook.ok()&&FXL.on())GoreLook.drops();return r;};}
{const b=drawStains;drawStains=function(){if(!GoreLook.ok())return b();GoreLook.stains();GoreLook.left.stains();};}
{const b=drawWeapon;drawWeapon=function(f){return GoreLook.weapon(b,f);};}
{const b=drawItem;drawItem=function(it){return GoreLook.item(b,it);};}
{const b=drawMarks;drawMarks=function(f){if(!GoreLook.ok())return b(f);GoreLook.marks(b,f);GoreLook.left.marks(f);};}
{const b=drawStump;drawStump=function(f){if(!GoreLook.ok())return b(f);GoreLook.stump(f);if(GORE_COL[S.gore])ctx.fillStyle=GORE_COL[S.gore].mark;};}
{const b=woundInk;woundInk=function(){const c=b();return c&&GoreLook.ok()&&GoreLook.PAL[S.gore]?GoreLook.PAL[S.gore].cut:c;};}
// ===== GORE UI END =====
