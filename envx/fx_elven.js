// ===== FX ELVEN =====
// Elven speed and Kael's magic, in the Noir Gilt look. An elf moves faster than the eye: where he was a moment ago is left behind as
// an afterimage, a see-through copy of him in his light, and a dash leaves a streak and a scatter of gold flecks. Kael's magic
// is the light in his rune tattoos (gold leaves and runes in cyan ink) let out of him: a rune circle opens at his hand, a leaf-blade
// of light flies from it (the Gilt Bolt) and bursts on what it meets; a wave of air rolls out from his palm (the Gale), carrying
// leaves and dust and rippling the floor; and he can step out of the world and back into it somewhere else (the Glimmer Step).
// ElvenFX draws all of this in world coordinates: the caller has already moved the canvas for the depth, as for anything else on the
// floor. Every drawing is a pure function of the record it is given (where, how far through its life, a seed or a position), so the
// same moment always looks the same; nothing is kept between calls but a few glow sprites painted on first use. o.k is the vertical
// scale of the transform (read from the canvas when not given) and keeps thin lines from vanishing at game size.
// The cost: the canvas charges most for the length of slanting edges it has to smooth, and about twice as much for anything added
// as light ('lighter') or filled with a gradient as for a plain colour painted over. So the shapes here are few and simple, plain
// colour where that looks the same, light only for the glows and the few things that must burn, and every call's state is saved and
// put back.
const ElvenFX=(()=>{
const TAU=Math.PI*2,lerp=(a,b,t)=>a+(b-a)*t,clamp=(v,a,b)=>v<a?a:v>b?b:v;
const ss=(a,b,t)=>{t=clamp((t-a)/(b-a),0,1);return t*t*(3-2*t);};
const eOut=t=>{t=clamp(t,0,1);return 1-(1-t)*(1-t)*(1-t);},eIn=t=>{t=clamp(t,0,1);return t*t*t;};
// one palette for everything: the gold of the leaves and runes, the cyan of the ink, the warm rim light, the dark of the figures
const PAL={gold:'#e2b65a',goldHi:'#ffe299',goldDeep:'#a8782c',rim:'#ffcf86',cyan:'#7ff3e3',cyanHi:'#d9fffa',ink:'#2a8a80',
  core:'#fff8e6',shade:'#0b0a10',air:'#fff2d6',dust:'#b9a27c',spark:'#fff1c9'};
const RGB={};
function rgb(h){let v=RGB[h];if(!v){const n=parseInt(h.slice(1),16);v=RGB[h]=[n>>16&255,n>>8&255,n&255];}return v;}
function rgba(h,a){const v=rgb(h);return`rgba(${v[0]},${v[1]},${v[2]},${(a<0?0:a>1?1:a).toFixed(3)})`;}
function rng(a){a|=0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const seedAt=(x,y,s)=>(Math.round(x*7.31)*73856093^Math.round(y*5.17)*19349663^((s|0)*83492791))|0;
const ok=typeof Path2D==='function';
const DBG={};
function kOf(c,o){if(o&&o.k)return o.k;const t=c.getTransform?c.getTransform():null;return t?(Math.hypot(t.c,t.d)||1):2;}

// ---------- glow sprites, painted once ----------
const SPR={};
function canvas(w,h){if(typeof OffscreenCanvas!=='undefined')return new OffscreenCanvas(w,h);const v=document.createElement('canvas');v.width=w;v.height=h;return v;}
function glowSpr(col){let s=SPR[col];if(!s){const n=64,h=n/2,cv=canvas(n,n),c=cv.getContext('2d'),g=c.createRadialGradient(h,h,0,h,h,h);
    g.addColorStop(0,rgba(col,1));g.addColorStop(.2,rgba(col,.55));g.addColorStop(.5,rgba(col,.16));g.addColorStop(1,rgba(col,0));c.fillStyle=g;c.fillRect(0,0,n,n);s=SPR[col]=cv;}
  return s;}
// a glow is added to what is under it ('lighter'); everything else is painted over it, which the canvas does about twice as fast and
// which, over the dark of the game, looks the same
function stampOval(c,col,x,y,rx,ry,a){if(a<=.004||rx<=.2||ry<=.1||DBG.noGlow)return;const g0=c.globalAlpha,m=c.globalCompositeOperation;
  c.globalCompositeOperation='lighter';c.globalAlpha=g0*a;c.drawImage(glowSpr(col),x-rx,y-ry,rx*2,ry*2);c.globalAlpha=g0;c.globalCompositeOperation=m;}
function stamp(c,col,x,y,r,a){stampOval(c,col,x,y,r,r,a);}

// ---------- shapes ----------
// a capsule from a (radius ra) to b (radius rb) as a closed sub-path, each round end drawn as three straight segments (at the sizes
// a figure is drawn that is as round as an arc, and the canvas fills it far faster); every capsule winds the same way, so many of
// them in one path fill as one shape (overlaps are not darkened twice)
const CB=[[0,1],[.866,.5],[.866,-.5],[0,-1]],CA=[[0,-1],[-.866,-.5],[-.866,.5],[0,1]];
function capsule(P,a,b,ra,rb){
  let dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy);if(L<1e-3){dx=1e-3;dy=0;L=1e-3;}
  const ux=dx/L,uy=dy/L;
  for(let i=0;i<4;i++){const co=CB[i][0],si=CB[i][1],x=b.x+(ux*co-uy*si)*rb,y=b.y+(uy*co+ux*si)*rb;i?P.lineTo(x,y):P.moveTo(x,y);}
  for(let i=0;i<4;i++){const co=CA[i][0],si=CA[i][1];P.lineTo(a.x+(ux*co-uy*si)*ra,a.y+(uy*co+ux*si)*ra);}
  P.closePath();}
// a polygon as a sub-path wound the same way as the capsules (negative area in the canvas's y-down frame)
function poly(P,Q){let A=0;for(let i=0;i<Q.length;i++){const p=Q[i],q=Q[(i+1)%Q.length];A+=p.x*q.y-q.x*p.y;}
  const R=A>0?Q.slice().reverse():Q;P.moveTo(R[0].x,R[0].y);for(let i=1;i<R.length;i++)P.lineTo(R[i].x,R[i].y);P.closePath();}
// a leaf, long along d (unit), as a sub-path
function leaf(P,x,y,dx,dy,L,w){const nx=-dy,ny=dx;P.moveTo(x+dx*L*.5,y+dy*L*.5);P.quadraticCurveTo(x+nx*w,y+ny*w,x-dx*L*.5,y-dy*L*.5);P.quadraticCurveTo(x-nx*w,y-ny*w,x+dx*L*.5,y+dy*L*.5);P.closePath();}
// a four-point glint
function glint(P,x,y,r){P.moveTo(x,y-r);P.lineTo(x+r*.22,y-r*.22);P.lineTo(x+r,y);P.lineTo(x+r*.22,y+r*.22);P.lineTo(x,y+r);P.lineTo(x-r*.22,y+r*.22);P.lineTo(x-r,y);P.lineTo(x-r*.22,y-r*.22);P.closePath();}
const isCyan=t=>t===PAL.cyan||t===PAL.cyanHi||t===PAL.ink;

// ---------- 1. the afterimage ----------
// the figure as one shape: torso, neck, head, both arms, both legs and, for Kael, the tails of his long coat behind his legs; grow
// fattens every part (for the halo)
function figure(g,grow){
  const P=new Path2D(),Q=g.pts,p=i=>({x:Q[i][0],y:Q[i][1]}),b=g.body||{},fa=g.fa||1,lw=(b.limbW||6)*.5+grow,tw=(b.torsoW||11.5)*.5+grow,hr=(b.headR||10)*.95+grow;
  const PEL=p(0),CHE=p(1),HEAD=p(2);
  if(g.kael){// the coat: from the hips back and down past the knees, flaring out behind him as it goes
    const kn={x:(Q[7][0]+Q[9][0])/2,y:(Q[7][1]+Q[9][1])/2},ft={x:(Q[8][0]+Q[10][0])/2,y:(Q[8][1]+Q[10][1])/2},hem={x:lerp(kn.x,ft.x,.45),y:lerp(kn.y,ft.y,.45)};
    // the furthest back of the hip, the knees and the hem, by the way he faces
    const bx=fa>0?Math.min(PEL.x-tw*1.2,kn.x-tw*1.6,hem.x-tw*1.9):Math.max(PEL.x+tw*1.2,kn.x+tw*1.6,hem.x+tw*1.9);
    poly(P,[{x:PEL.x+fa*tw*.7,y:PEL.y-tw*.4},{x:PEL.x-fa*tw*1.05,y:PEL.y-tw*.5},{x:bx,y:hem.y+2},{x:hem.x+fa*tw*.2,y:hem.y}]);}
  capsule(P,PEL,CHE,tw*.86,tw);capsule(P,CHE,HEAD,lw*.75,lw*.62);
  P.moveTo(HEAD.x+hr,HEAD.y);P.arc(HEAD.x,HEAD.y,hr,TAU,0,true);P.closePath();// the head, wound like the rest
  capsule(P,CHE,p(5),lw*.95,lw*.8);capsule(P,p(5),p(6),lw*.8,lw*.62);capsule(P,CHE,p(3),lw*.95,lw*.8);capsule(P,p(3),p(4),lw*.8,lw*.62);
  capsule(P,PEL,p(9),lw*1.3,lw*1.02);capsule(P,p(9),p(10),lw*1.02,lw*.72);capsule(P,PEL,p(7),lw*1.3,lw*1.02);capsule(P,p(7),p(8),lw*1.02,lw*.72);
  return P;}
// a see-through copy of him in his light, fading as it ages, and close up a dark one edged in light; the weapon a line of light
function afterimage(c,g,o){if(!ok||!g||!g.pts||g.pts.length<12)return;
  const u=clamp((g.age||0)/(g.life||.25),0,1),a=Math.pow(1-u,1.6)*(g.alpha==null?1:g.alpha);if(a<=.01)return;
  const k=kOf(c,o),tint=g.tint||PAL.gold,grow=Math.max(.9,1.7/k),Q=g.pts;
  let top=Math.min(Q[2][1],Q[1][1])-(g.body&&g.body.headR||10),bot=Math.max(Q[8][1],Q[10][1]);if(bot-top<20)bot=top+20;
  c.save();
  // the halo: the figure a little fatter, added in his colour, brightest at the head and shoulders and thinning out toward the feet
  // (the eye reads it as motion, not a second man)
  const gr=c.createLinearGradient(0,top,0,bot);gr.addColorStop(0,rgba(tint,.42*a));gr.addColorStop(1,rgba(tint,.06*a));
  c.globalCompositeOperation='lighter';c.fillStyle=gr;c.fill(figure(g,grow));
  // the body: his dark inside the halo, seen through, so the copy is a dark one edged in light. It only shows close up, so it comes
  // in as the view closes in (between scales 1.9 and 2.3) and is left out of a faint copy or when the caller asks for the lite one
  c.globalCompositeOperation='source-over';
  const dk=a*ss(1.9,2.3,k);
  if(dk>=.12&&!(o&&o.lite)){c.fillStyle=rgba(PAL.shade,.24*dk);c.fill(figure(g,0));}
  // the weapon: a line of light from the hand to the tip, its core only while it is bright
  const h=Q[4],t=Q[11];
  if(h&&t&&!DBG.noWeapon){c.lineCap='round';
    c.strokeStyle=rgba(tint,.6*a);c.lineWidth=Math.max(1.6/k,1.3);c.beginPath();c.moveTo(h[0],h[1]);c.lineTo(t[0],t[1]);c.stroke();
    if(a>.4){c.strokeStyle=rgba(PAL.core,.45*a);c.lineWidth=Math.max(.6/k,.5);c.stroke();}}
  c.restore();}

// ---------- 2. a streak ----------
// a tapering streak of light, from nothing at a to its full width at b, a pale core down its middle
function streak(c,a,b,o){if(!ok||!a||!b)return;o=o||{};
  const dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy);if(L<.5)return;
  const k=kOf(c,o),ux=dx/L,uy=dy/L,nx=-uy,ny=ux,w=Math.max((o.w||6)/2,.8/k),tint=o.tint||PAL.gold,al=o.alpha==null?1:o.alpha,ang=Math.atan2(uy,ux);
  c.save();c.globalCompositeOperation='lighter';
  const g=c.createLinearGradient(a.x,a.y,b.x,b.y);g.addColorStop(0,rgba(tint,0));g.addColorStop(.6,rgba(tint,.28*al));g.addColorStop(1,rgba(tint,.6*al));
  c.fillStyle=g;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x+nx*w,b.y+ny*w);c.arc(b.x,b.y,w,ang+Math.PI/2,ang-Math.PI/2,true);c.closePath();c.fill();
  const w2=Math.max(w*.32,.45/k),g2=c.createLinearGradient(lerp(a.x,b.x,.35),lerp(a.y,b.y,.35),b.x,b.y);g2.addColorStop(0,rgba(PAL.core,0));g2.addColorStop(1,rgba(PAL.core,.75*al));
  c.fillStyle=g2;c.beginPath();c.moveTo(lerp(a.x,b.x,.35),lerp(a.y,b.y,.35));c.lineTo(b.x+nx*w2,b.y+ny*w2);c.arc(b.x,b.y,w2,ang+Math.PI/2,ang-Math.PI/2,true);c.closePath();c.fill();
  c.restore();}

// ---------- 3. motes ----------
// a scatter of flecks: gold leaves turning over as they fall or rise, and small cyan glints, all twinkling and fading; drawn in a few
// batches (a colour and four steps of brightness each) so a crowd of them stays cheap
function motes(c,list,o){if(!ok||!list||!list.length)return;
  const k=kOf(c,o),B={};
  for(const m of list){const u=clamp((m.age||0)/(m.life||1),0,1),sp=m.spin||0,tw=.58+.42*Math.sin(sp*3.1+(m.age||0)*17),a=(1-u)*(1-u*.4)*tw;if(a<.05)continue;
    const band=Math.min(3,Math.floor(a*4)),tint=m.tint||PAL.gold,key=tint+band;let e=B[key];if(!e)e=B[key]={P:new Path2D(),a:(band+.6)/4,t:tint};
    const r=Math.max(m.r||1.4,.75/k)*(1-u*.35);
    if(isCyan(tint))glint(e.P,m.x,m.y,r*1.25);
    else{// a leaf seen turning: long, its width breathing as it spins
      const d=sp+(m.age||0)*5,dx=Math.cos(d),dy=Math.sin(d),wd=r*(.18+.5*Math.abs(Math.sin(d*1.7)));leaf(e.P,m.x,m.y,dx,dy,r*2.3,wd);}}
  c.save();c.globalCompositeOperation='source-over';
  for(const key in B){const e=B[key];c.fillStyle=rgba(e.t,e.a);c.fill(e.P);}
  c.restore();}

// ---------- 4. the rune circle ----------
// a gold ring and a cyan one inside it, runes between, ticks outside, a bright core: a circle that stands square to the line of the
// cast, so from the side it is an ellipse turned to face where the spell goes. It flares open, holds, and fades as it swells.
function glyph(c,at,o){if(!ok||!at)return;o=o||{};
  const u=clamp(o.u||0,0,1),r0=o.r||14,k=kOf(c,o),tint=o.tint||PAL.gold,fin=ss(0,.18,u),fout=1-ss(.58,1,u),a=fin*fout;if(a<.02)return;
  const R=r0*(.55+.5*eOut(u/.32)-.05*ss(.32,.5,u)+.18*ss(.58,1,u)),rot=(o.rot||0)+u*1.4,ang=o.ang==null?((o.fa||1)>0?0:Math.PI):o.ang,lod=k*r0>18;
  c.save();c.translate(at.x,at.y);
  c.globalCompositeOperation='source-over';
  stamp(c,tint,0,0,R*1.25,.42*a);
  c.rotate(ang);c.scale(.34,1);c.rotate(rot);
  c.lineCap='round';
  // the outer ring, bright, and a fainter one just outside it
  c.strokeStyle=rgba(tint,.9*a);c.lineWidth=Math.max(1.6/k,R*.09);c.beginPath();c.arc(0,0,R,0,TAU);c.stroke();
  c.strokeStyle=rgba(PAL.goldHi,.35*a);c.lineWidth=Math.max(.8/k,R*.04);c.beginPath();c.arc(0,0,R*1.16,0,TAU);c.stroke();
  // the inner ring in the ink's cyan
  c.strokeStyle=rgba(PAL.cyan,.85*a);c.lineWidth=Math.max(1.1/k,R*.06);c.beginPath();c.arc(0,0,R*.64,0,TAU);c.stroke();
  // runes between the rings and ticks outside, in a close view
  if(lod&&!DBG.noRunes){const P=new Path2D(),T=new Path2D();
    for(let i=0;i<8;i++){const t=i/8*TAU,cx=Math.cos(t)*R*.82,cy=Math.sin(t)*R*.82,ux=Math.cos(t),uy=Math.sin(t),s=R*.085;
      // a rune: a small diamond with a bar through it
      P.moveTo(cx+ux*s*1.6,cy+uy*s*1.6);P.lineTo(cx-uy*s,cy+ux*s);P.lineTo(cx-ux*s*1.6,cy-uy*s*1.6);P.lineTo(cx+uy*s,cy-ux*s);P.closePath();}
    for(let i=0;i<24;i++){const t=(i+.5)/24*TAU,ux=Math.cos(t),uy=Math.sin(t),r1=R*1.03,r2=R*(i%3?1.09:1.14);T.moveTo(ux*r1,uy*r1);T.lineTo(ux*r2,uy*r2);}
    c.fillStyle=rgba(PAL.goldHi,.85*a);c.fill(P);c.strokeStyle=rgba(tint,.6*a);c.lineWidth=Math.max(.6/k,R*.03);c.stroke(T);}
  // the core
  c.fillStyle=rgba(PAL.core,.75*a*(1-u*.5));c.beginPath();c.arc(0,0,R*.2,0,TAU);c.fill();
  c.restore();}

// ---------- 5. the Gilt Bolt ----------
// a leaf-blade of light turning about its long axis as it flies (its width breathes with the spin), a white-gold core and a cyan
// edge, a ribbon of light behind it with beads of light strung along it, and gold flecks shed along the way
function bolt(c,B,o){if(!ok||!B)return;o=o||{};
  const k=kOf(c,o),ang=B.ang||0,sp=B.spin||0,tr=B.trail||[],dx=Math.cos(ang),dy=Math.sin(ang);
  c.save();c.globalCompositeOperation='lighter';c.lineCap='round';c.lineJoin='round';
  if(tr.length&&!DBG.noTrail){const pts=tr.concat([{x:B.x-dx*3,y:B.y-dy*3}]),n=pts.length;
    // the ribbon of light: from nothing at the oldest point to its full width just behind the blade, a wide faint one and a narrow
    // bright one inside it
    const X1=[],X2=[],Y1=[],Y2=[];
    for(let i=0;i<n;i++){const t=i/(n-1),p=pts[i],q=pts[Math.min(n-1,i+1)],pp=pts[Math.max(0,i-1)],sx=q.x-pp.x,sy=q.y-pp.y,sl=Math.hypot(sx,sy)||1,nx=-sy/sl,ny=sx/sl;
      const w1=Math.max(.45/k,2.6*Math.pow(t,1.3)),w2=Math.max(.3/k,1.15*t);
      X1.push(p.x+nx*w1,p.y+ny*w1);Y1.push(p.x-nx*w1,p.y-ny*w1);X2.push(p.x+nx*w2,p.y+ny*w2);Y2.push(p.x-nx*w2,p.y-ny*w2);}
    const rib=(X,Y)=>{const P=new Path2D();P.moveTo(X[0],X[1]);for(let i=1;i<n;i++)P.lineTo(X[2*i],X[2*i+1]);for(let i=n-1;i>=0;i--)P.lineTo(Y[2*i],Y[2*i+1]);P.closePath();return P;};
    c.fillStyle=rgba(PAL.gold,.32);c.fill(rib(X1,Y1));c.fillStyle=rgba(PAL.goldHi,.42);c.fill(rib(X2,Y2));
    // beads of light along it, where it was a moment ago
    const BD=new Path2D();for(let i=2;i<n-1;i++){const t=i/(n-1),r=Math.max(.7/k,(.6+1.1*t)*t),p=pts[i];BD.moveTo(p.x+r,p.y);BD.lineTo(p.x,p.y+r*.8);BD.lineTo(p.x-r,p.y);BD.lineTo(p.x,p.y-r*.8);BD.closePath();}
    c.globalCompositeOperation='source-over';c.fillStyle=rgba(PAL.core,.5);c.fill(BD);
    c.strokeStyle=rgba(PAL.core,.55);c.lineWidth=Math.max(.5/k,.9);c.beginPath();const s0=Math.max(0,n-5);c.moveTo(pts[s0].x,pts[s0].y);for(let i=s0+1;i<n;i++)c.lineTo(pts[i].x,pts[i].y);c.stroke();
    // flecks shed along the trail
    const F=new Path2D(),G=new Path2D();
    for(let i=0;i<n-1;i++){const R=rng(seedAt(pts[i].x,pts[i].y,7)),t=(i+1)/n,p=pts[i],q=pts[i+1],sx=q.x-p.x,sy=q.y-p.y,sl=Math.hypot(sx,sy)||1,nx=-sy/sl,ny=sx/sl,off=(R()-.5)*7*(1.2-t),r=(.9+R()*.8)*t;
      if(R()<.6)leaf(F,p.x+nx*off,p.y+ny*off+(1-t)*3,Math.cos(i*1.9+sp),Math.sin(i*1.9+sp),Math.max(r*2.6,1.2/k),r*.55);else glint(G,p.x-nx*off,p.y-ny*off,Math.max(r*1.6,.9/k));}
    c.fillStyle=rgba(PAL.goldHi,.75);c.fill(F);c.fillStyle=rgba(PAL.cyanHi,.7);c.fill(G);c.globalCompositeOperation='lighter';}
  stamp(c,PAL.gold,B.x,B.y,15,.55);stamp(c,PAL.core,B.x,B.y,6,.6);
  c.translate(B.x,B.y);c.rotate(ang);
  const L=15,Wd=5*(.22+.78*Math.abs(Math.cos(sp)));
  const P=new Path2D();P.moveTo(L*.58,0);P.quadraticCurveTo(L*.05,-Wd*1.15,-L*.42,0);P.quadraticCurveTo(L*.05,Wd*1.15,L*.58,0);P.closePath();
  const g=c.createLinearGradient(-L*.45,0,L*.6,0);g.addColorStop(0,rgba(PAL.gold,.35));g.addColorStop(.55,rgba(PAL.goldHi,.95));g.addColorStop(1,rgba(PAL.core,1));
  c.fillStyle=g;c.fill(P);
  c.strokeStyle=rgba(PAL.cyan,.85);c.lineWidth=Math.max(.55/k,.6);c.stroke(P);
  c.strokeStyle=rgba(PAL.core,.9);c.lineWidth=Math.max(.45/k,.45);c.beginPath();c.moveTo(-L*.36,0);c.lineTo(L*.5,0);c.stroke();
  c.restore();}

// ---------- 6. where it lands ----------
// a hit: a flash and a spray of gold leaves and sparks thrown on along its line; a block: a hard spark star, the bolt broken on a
// blade; a miss: a small fizzle of light
function burst(c,E,o){if(!ok||!E)return;o=o||{};
  const u=clamp(E.u||0,0,1),sz=E.size||14,k=kOf(c,o),kind=E.kind||'hit',ang=E.ang||0,R=rng(E.seed!=null?E.seed:seedAt(E.x,E.y,kind.length));
  c.save();c.globalCompositeOperation='source-over';c.lineCap='round';
  if(kind==='hit'){
    stamp(c,PAL.goldHi,E.x,E.y,sz*(1.5-.7*u),Math.pow(1-u,2)*.9);stamp(c,PAL.core,E.x,E.y,sz*.6*(1-u),Math.pow(1-u,3));
    const LV=new Path2D(),SP=new Path2D(),G=new Path2D();
    for(let i=0;i<16;i++){const d=ang+(R()-.5)*1.9,dist=sz*(.35+R()*1.7)*eOut(u*(1.1+R()*.4)),fall=sz*.9*u*u*R(),x=E.x+Math.cos(d)*dist,y=E.y+Math.sin(d)*dist+fall,r=(1.1+R()*1.1)*(1-u*.45),sp=R()*TAU+u*(4+R()*8);
      if(i%3===2)glint(G,x,y,Math.max(r*1.4,.8/k));else leaf(LV,x,y,Math.cos(sp),Math.sin(sp),Math.max(r*2.5,1.3/k),r*(.25+.5*Math.abs(Math.sin(sp*1.3))));}
    for(let i=0;i<8;i++){const d=ang+(R()-.5)*1.3,r1=sz*(.2+R()*.5)*eOut(u),r2=r1+sz*(.5+R()*.8)*(1-u);SP.moveTo(E.x+Math.cos(d)*r1,E.y+Math.sin(d)*r1);SP.lineTo(E.x+Math.cos(d)*r2,E.y+Math.sin(d)*r2);}
    c.fillStyle=rgba(PAL.goldHi,.9*(1-u));c.fill(LV);c.fillStyle=rgba(PAL.cyanHi,.8*(1-u));c.fill(G);
    c.strokeStyle=rgba(PAL.spark,.85*Math.pow(1-u,1.4));c.lineWidth=Math.max(.7/k,1);c.stroke(SP);}
  else if(kind==='block'){
    stamp(c,PAL.core,E.x,E.y,sz*(1.1-.5*u),Math.pow(1-u,2)*.85);
    const SP=new Path2D(),n=8;
    for(let i=0;i<n;i++){const d=i/n*TAU+R()*.3,len=sz*(i%2?.55:1.25)*(.7+R()*.5)*(1-u*.55),r0=sz*.08;SP.moveTo(E.x+Math.cos(d)*r0,E.y+Math.sin(d)*r0);SP.lineTo(E.x+Math.cos(d)*len,E.y+Math.sin(d)*len);}
    c.strokeStyle=rgba(PAL.core,.95*Math.pow(1-u,1.2));c.lineWidth=Math.max(.8/k,1.2*(1-u*.5));c.stroke(SP);
    c.strokeStyle=rgba(PAL.gold,.6*(1-u));c.lineWidth=Math.max(1.6/k,2.4*(1-u*.5));c.stroke(SP);
    // a few sparks flung back the way it came
    const S2=new Path2D();for(let i=0;i<6;i++){const d=ang+Math.PI+(R()-.5)*1.6,dist=sz*(.4+R()*1.2)*eOut(u),x=E.x+Math.cos(d)*dist,y=E.y+Math.sin(d)*dist+sz*.6*u*u;glint(S2,x,y,Math.max(1.2*(1-u),.7/k));}
    c.fillStyle=rgba(PAL.goldHi,.9*(1-u));c.fill(S2);}
  else{
    stamp(c,PAL.gold,E.x,E.y,sz*.6*(1+u),(1-u)*.4);
    const G=new Path2D();for(let i=0;i<9;i++){const d=i/9*TAU+R(),r=sz*.55*eOut(u)*(.6+R()*.5);glint(G,E.x+Math.cos(d)*r,E.y+Math.sin(d)*r-sz*.3*u,Math.max(1*(1-u),.6/k));}
    c.fillStyle=rgba(PAL.goldHi,.65*(1-u));c.fill(G);}
  c.restore();}

// ---------- 7. the Gale ----------
// a wave of air out of his palm: bright blades of air rolling out the way he faces (the middle of the first is where the wave has
// reached), fainter ones behind it, wind lines, the floor rippling under it in flattened arcs, and the leaves and dust it carries;
// all of it fading over its last part. Every blade and ripple is a sliver pointed at its ends, which reads as light fading out along
// it, and everything of one colour is filled in one go (every piece wound the same way, so where two cross they do not cancel).
// a blade of air: the sliver between an arc about (cx,cy) of radius RR+hw, span either side of the angle a0, and a flatter arc through
// the same two ends that runs 2hw inside it at the middle; so it is pointed at both ends, and the middle of it, halfway through its
// thickness, is at radius RR exactly. A handful of calls to the canvas, where a polygon would take dozens.
function blade(P,cx,cy,RR,a0,span,hw){
  const Ro=RR+hw,co=Math.cos(span),si=Math.sin(span),sag=Ro*(1-co);hw=Math.min(hw,sag*.45);
  // the inner arc's centre lies d back along the middle line (found so the arc passes through both ends and 2hw inside the middle)
  const d=2*hw*(hw-Ro)/(2*hw-sag),ex=Ro*co+d,Ri=Math.hypot(ex,Ro*si),ia=Math.atan2(Ro*si,ex),ux=Math.cos(a0),uy=Math.sin(a0);
  P.moveTo(cx+Math.cos(a0-span)*Ro,cy+Math.sin(a0-span)*Ro);P.arc(cx,cy,Ro,a0-span,a0+span,false);P.arc(cx-ux*d,cy-uy*d,Ri,a0+ia,a0-ia,true);P.closePath();}
function gale(c,G,o){if(!ok||!G)return;o=o||{};
  const u=clamp(G.u||0,0,1),fa=(G.fa||1)>0?1:-1,range=G.range||170,front=range*eOut(u),k=kOf(c,o),fade=1-ss(.5,1,u),dz=G.dz||40,gy=G.ground!=null?G.ground:G.y+80,h=Math.max(30,gy-G.y);
  if(fade<.01)return;
  const R=rng(seedAt(G.x,G.y,11)),AIR=new Path2D(),LEAD=new Path2D(),CORE=new Path2D();
  c.save();c.globalCompositeOperation='source-over';
  // the palm: a flash as it goes out
  if(u<.3)stamp(c,PAL.goldHi,G.x+fa*4,G.y,12+u*32,(1-u/.3)*.7);
  // the floor ripple: the front of two rings on the floor ahead of him, flattened as the floor is, widest at the front and thinning
  // to nothing as they come round toward his feet (the sliver between two flattened rings of the same depth)
  const a0=fa>0?0:Math.PI;
  if(!DBG.noFloor)for(let j=0;j<2;j++){const r=front*(1-j*.2);if(r<5)continue;const ry=clamp(Math.max(r*.12,dz*.6*(r/range)),2,dz*.8),hw=Math.max(.95-j*.25,.6/k),A=j?1.15:1.35;
    AIR.moveTo(G.x+Math.cos(a0-A)*(r+hw),gy+Math.sin(a0-A)*ry);AIR.ellipse(G.x,gy,r+hw,ry,0,a0-A,a0+A,false);AIR.ellipse(G.x,gy,Math.max(.5,r-hw),ry,0,a0+A,a0-A,true);AIR.closePath();}
  // the air: blades rolling out from the palm, flatter than circles (a wall of air, not a ball), tallest at the front
  const cy=lerp(G.y,gy,.18),hh=(gy-G.y)*.95;
  for(let j=0;j<3&&!DBG.noArcs;j++){const r=front*(1-j*.16)-j*2.5;if(r<6)continue;
    const off=r*.6,RR=r+off,span=clamp((hh*.62+r*.16)/RR,.14,.55)*(1-j*.18),cx=G.x-fa*off,lead=j===0;
    const hw=Math.max(.5/k,(lead?1.5:1.1-j*.25)*(1-u*.4));
    if(lead){blade(LEAD,cx,cy,RR,a0,span,hw);blade(CORE,cx,cy,RR,a0,span*.58,Math.max(.3/k,hw*.42));}
    else blade(AIR,cx,cy,RR,a0,span,hw);}
  // wind lines streaming behind the front: level bars, a thin tail and a thicker head (an edge that runs dead level costs the
  // canvas next to nothing)
  if(!DBG.noWind)for(let i=0;i<9;i++){const yy=G.y+(R()-.5)*h*1.1*Math.min(1,front/60),x1=G.x+fa*front*(.55+R()*.4),len=front*(.16+R()*.24),ww=Math.max(.3,.45/k),hl=len*.3;R();
    AIR.rect(fa>0?x1-len:x1,yy-ww,len,ww*2);AIR.rect(fa>0?x1-hl:x1,yy-ww*1.8,hl,ww*3.6);}
  // what it carries: leaves near the front, turning over (filled with the leading blade, in its colour), and dust off the floor
  const D=[];
  if(!DBG.noLeaves){
    for(let i=0;i<14;i++){const lag=R(),x=G.x+fa*front*(1-lag*.42)-fa*R()*4,yy=G.y+(R()-.5)*h*1.3*Math.min(1,front/50)+lag*lag*h*.3,sp=R()*TAU+u*(6+R()*10),r=1.2+R()*1.3;
      leaf(LEAD,x,Math.min(yy,gy-2),Math.cos(sp),Math.sin(sp),Math.max(r*2.6,1.3/k),r*(.2+.55*Math.abs(Math.sin(sp*1.4))));}
    for(let i=0;i<3;i++){const lag=R();D.push([G.x+fa*front*(.98-lag*.5),gy-2-R()*8*(1-lag),4+R()*5+u*8]);}}
  c.fillStyle=rgba(PAL.air,.36*fade);c.fill(AIR);
  c.fillStyle=rgba(PAL.goldHi,.85*fade);c.fill(LEAD);
  c.fillStyle=rgba(PAL.core,.62*fade);c.fill(CORE);
  for(const [x,y,r] of D)stampOval(c,PAL.dust,x,y,r*2.1,r*.8,.17*fade);
  c.restore();}

// ---------- 8. the Glimmer Step ----------
// out: where he stands opens into a slit of light that closes again while his place goes up in gold flecks; in: flecks rush together
// where he is going and the slit flashes open there, and he is in it
function blink(c,Bk,o){if(!ok||!Bk)return;o=o||{};
  const u=clamp(Bk.u||0,0,1),out=Bk.mode!=='in',tint=Bk.tint||PAL.gold,k=kOf(c,o),x=Bk.x,top=Bk.top!=null?Bk.top:Bk.y-62,bot=Bk.ground!=null?Bk.ground:Bk.y+52,hh=bot-top,mid=(top+bot)/2;
  const R=rng(seedAt(x,top,out?3:5));
  c.save();c.globalCompositeOperation='source-over';
  const open=out?Math.sin(Math.PI*clamp(u*1.1,0,1))*(1-u*.3):Math.sin(Math.PI*clamp((u-.3)/.7,0,1));
  if(open>.02){const w=8*open;
    if(open>.12)stampOval(c,tint,x,mid,hh*.15*(.6+.4*open),hh*.38*(.6+.4*open),.6*open);
    const P=new Path2D();P.moveTo(x,top-8);P.quadraticCurveTo(x+w,mid,x,bot+2);P.quadraticCurveTo(x-w,mid,x,top-8);P.closePath();
    const g=c.createLinearGradient(x-w*.5,0,x+w*.5,0);g.addColorStop(0,rgba(tint,.35*open));g.addColorStop(.5,rgba(PAL.core,.95*open));g.addColorStop(1,rgba(tint,.35*open));
    c.globalCompositeOperation='lighter';c.fillStyle=g;c.fill(P);c.globalCompositeOperation='source-over';}
  // the flecks: out, they go up from where he was and drift apart; in, they come together on where he will be
  const LV=new Path2D(),GL=new Path2D();
  for(let i=0;i<24&&!DBG.noFlecks;i++){const px=x+(R()-.5)*24,py=top+R()*hh,r=1+R()*1.2,sp=R()*TAU;let fx,fy,a;
    if(out){const t=eOut(u);fx=px+(R()-.5)*26*t;fy=py-(18+R()*44)*t;a=(1-u)*(.5+.5*R());}
    else{const sx=px+(R()-.5)*70,sy=py-(10+R()*40),t=eIn(Math.min(1,u*1.15));fx=lerp(sx,px,t);fy=lerp(sy,py,t);a=u<.85?.35+.65*u:(1-u)/.15;}
    if(a<.05)continue;
    if(i%4===3)glint(GL,fx,fy,Math.max(r*1.4*a,.7/k));else leaf(LV,fx,fy,Math.cos(sp+u*6),Math.sin(sp+u*6),Math.max(r*2.4*(.5+.5*a),1.2/k),r*.5);}
  c.fillStyle=rgba(PAL.goldHi,.85);c.fill(LV);c.fillStyle=rgba(PAL.cyanHi,.8);c.fill(GL);
  c.restore();}

return{afterimage,streak,motes,glyph,bolt,burst,gale,blink,PAL,DBG,ok};
})();
// ===== FX ELVEN END =====
