// ===== BEASTS =====
// The things that live in Hallowell's dead railway: the feral goblins who swarm its tunnels, and the lizard-man who keeps them, in
// the Noir Gilt manner of the cast. A beast is a dark figure lit along one edge and built from shaped pieces that ride the ragdoll's
// twelve points, like Kael and the restaurant's people; what sets a beast apart is its body and its hide. Both are creatures, not
// men in costume: each limb one silhouette with its muscle in it and bone at its joints (a point at the elbow, a knobbed knee), and
// both stand on their toes, the leg bending back again at a hock above long clawed toes (since V113). A goblin is small and wiry,
// all arms and head: a mottled grey-green skin, forearms thick under the elbow and wrists like sticks, long swept-back ears, a
// scowling brow of bone over a small eye with a sick sheen, an underbite of big crooked teeth, and the ragged things it has
// scavenged from the line (sacking stitched with patches, a stolen waistcoat with its watch, a railwayman's jacket or cap,
// goggles, a gas-mask filter on a strap, bandage wraps, a belt hung with a rat's skull, keys or a pouch, a necklace of teeth). The
// lizard-man is half again a man's height: a barrel of a chest under a hump of shoulder, a scaled hide that turns bronze and
// gold-green where the light catches it, one row of hooked spines from the back of his skull down his neck, back and tail, horns
// swept back off the skull, a hooded brow over a slit eye and a crocodile's uneven teeth, a leather harness, an iron pauldron, a
// goblin's skull and a string of fangs on his belt and the brass collar of some old servitude.
// A goblin can be cut in half (F.half: the game's two halves, each drawn whole up to the cut, with the cut face). The lizard's tail
// is the game's own chain when the game runs one (F.tail), and can be cut short; a severed piece is drawn by tailPiece.
// BeastLook.body reshapes the game's generated body for a kind; BeastLook.draw paints a fighter whose f.beast names its kind;
// BeastLook.weapon paints their weapons on the arms painter's terms; BeastLook.WEAPONS and BeastLook.SPEC are the numbers to fight
// them with; BeastLook.TAIL and BeastLook.size are the tail's numbers, the same ones the game runs it with.
const BeastLook=(()=>{
const PEL=0,CHE=1,HEAD=2,ELF=3,HAF=4,ELB=5,HAB=6,KNF=7,FTF=8,KNB=9,FTB=10,TIP=11;
const V=(x,y)=>({x,y}),add=(a,b)=>V(a.x+b.x,a.y+b.y),sub=(a,b)=>V(a.x-b.x,a.y-b.y),mul=(a,k)=>V(a.x*k,a.y*k),len=a=>Math.hypot(a.x,a.y),
  nrm=a=>{const l=Math.hypot(a.x,a.y)||1;return V(a.x/l,a.y/l);},perp=a=>V(-a.y,a.x),mix=(a,b,u)=>V(a.x+(b.x-a.x)*u,a.y+(b.y-a.y)*u),
  dot=(a,b)=>a.x*b.x+a.y*b.y,rot=(v,t)=>V(v.x*Math.cos(t)-v.y*Math.sin(t),v.x*Math.sin(t)+v.y*Math.cos(t)),cl=(v,a,b)=>Math.max(a,Math.min(b,v)),
  lerp=(a,b,t)=>a+(b-a)*t,TAU=Math.PI*2;

// ---------- shapes (as in the cast) ----------
function smooth(Q,closed=true,t=.5,P=new Path2D()){
  const n=Q.length,g=i=>Q[closed?((i%n)+n)%n:cl(i,0,n-1)];P.moveTo(Q[0].x,Q[0].y);
  for(let i=0;i<(closed?n:n-1);i++){const p0=g(i-1),p1=g(i),p2=g(i+1),p3=g(i+2);
    P.bezierCurveTo(p1.x+(p2.x-p0.x)*t/3,p1.y+(p2.y-p0.y)*t/3,p2.x-(p3.x-p1.x)*t/3,p2.y-(p3.y-p1.y)*t/3,p2.x,p2.y);}
  if(closed)P.closePath();return P;}
// (the figure kit's shapes, which carry their outlines for the light: a piece marked lit is a main form and takes a plane of light)
function piece(Q,t=.5,lit=false){return FigKit.piece(Q,t,2,lit);}
function capsule(a,b,wa,wb){const q=FigKit.capsule(a,b,wa,wb);q.wa=wa;q.wb=wb;return q;}
// a stretch of a limb, for the mottling and the scales laid along it
function seg(a,b,wa,wb){return{a,b,wa,wb,c:mix(a,b,.5),r:Math.max(wa,wb)/2};}
// ---------- creature limbs ----------
// A beast's limb is one silhouette with its muscle in it (the figure kit's tube with an outline of its own down each segment, as
// Ilyas's bare arm has), and its joints are bone: a hard point at the elbow, a knobbed knee, a heel of bone at the hock, never a
// ball stuck on. The outlines are [t down the segment, width to the front, width to the back] as shares of the half-width there.
const MUS={
  // a goblin: wiry, a knot of shoulder, a stringy upper arm, a forearm thick under the elbow and a wrist like a stick; a ropy thigh,
  // a calf high up the shin, a long bare instep
  gob:{up:[[.05,1.3,1.22],[.22,1.02,1.12],[.45,1.18,.98],[.7,.9,.9],[.9,.8,.94]],lo:[[.07,1.12,1.24],[.24,1.46,1.16],[.45,1.24,.96],[.68,.8,.74],[.9,.56,.56]],
    th:[[.08,1.12,1.18],[.32,1.18,1.06],[.62,1.0,.9],[.88,.84,.8]],sh:[[.1,.96,1.06],[.28,.9,1.34],[.52,.8,1.08],[.82,.72,.74]],mt:[[.25,.86,.92],[.6,.78,.8],[.9,.86,.86]]},
  // the lizard: a heavy shoulder and a forearm like a club; a thigh like a ham, a calf that bulges behind, a long scaled shank
  liz:{up:[[.05,1.22,1.2],[.25,1.2,1.26],[.48,1.3,1.16],[.72,1.1,1.0],[.9,.88,.92]],lo:[[.07,1.18,1.3],[.24,1.36,1.22],[.5,1.16,1.04],[.76,.88,.88],[.92,.76,.8]],
    th:[[.08,1.14,1.26],[.34,1.26,1.2],[.62,1.1,1.0],[.88,.86,.8]],sh:[[.1,1.0,1.14],[.3,.92,1.38],[.6,.8,1.02],[.88,.7,.72]],mt:[[.2,.84,.9],[.6,.78,.82],[.9,.86,.88]]}};
// an outline put on its sides: frontA, the front of the limb is the tube's side A
function orient(P,frontA){return frontA?P:P.map(([t,a,b])=>[t,b,a]);}
// whether the inside of the bend at joint j of J is the tube's side A (with the limb near straight, the side toward fb)
function bendA(J,j,fb){const d0=nrm(sub(J[j],J[j-1])),d1=nrm(sub(J[j+1],J[j])),cr=d0.x*d1.y-d0.y*d1.x;return Math.abs(cr)>.08?cr>0:dot(perp(d0),fb)>0;}
// a point of bone out of a joint: from a base w across at B, out toward dir l long, a little hooked toward along
function spur(B,dir,along,w,l,hook){const q=perp(dir),tip=add(add(B,mul(dir,l)),mul(along,l*(hook||0)));
  return piece([add(B,mul(q,w)),add(add(B,mul(dir,l*.45)),mul(q,w*.42)),tip,add(add(B,mul(dir,l*.4)),mul(q,-w*.5)),sub(B,mul(q,w))],.3);}
// a row of hooked spines (down the lizard's back, neck and tail, along his forearms). Each: [B, out, along, w, h, sweep]: a base w
// long at B along `along`, standing h out toward `out`, its point swept along by sweep of its base. Dark horn, the edge that faces
// the light caught in it
function ridge(c,L,env,C,far,TV){const P=new Path2D(),HI=new Path2D(),Lt=env.L;
  for(const [B,out,al,w,h,sw] of L){if(h<.5)continue;const t0=add(B,mul(al,w*.5)),t1=sub(B,mul(al,w*.5)),tp=add(add(B,mul(out,h)),mul(al,(sw??-.55)*w)),k0=add(mix(t0,tp,.5),mul(out,h*.14)),k1=add(mix(tp,t1,.5),mul(out,-h*.06));
    if(TV){const Q=TV.fin([t0,k0,tp,k1,t1],1.3*env.sz);P.addPath(smooth(Q,true,.2));const A2=TV.VW.at(t0,0),K2=TV.VW.at(k0,0),T2=TV.VW.at(tp,0);HI.moveTo(A2.x,A2.y);HI.quadraticCurveTo(K2.x,K2.y,T2.x,T2.y);continue;}
    P.moveTo(t0.x,t0.y);P.quadraticCurveTo(k0.x,k0.y,tp.x,tp.y);P.quadraticCurveTo(k1.x,k1.y,t1.x,t1.y);P.closePath();
    const n0=perp(sub(tp,t0)),f0=dot(n0,out)>0?n0:mul(n0,-1);if(dot(f0,Lt)>=0){HI.moveTo(t0.x,t0.y);HI.quadraticCurveTo(k0.x,k0.y,tp.x,tp.y);}else{HI.moveTo(tp.x,tp.y);HI.quadraticCurveTo(k1.x,k1.y,t1.x,t1.y);}}
  c.fillStyle=far?C.crestFar:C.crest;c.fill(P);
  if(!far&&env.lod>=1){c.strokeStyle=rgba(C.rim,.38);c.lineWidth=Math.max(1,.7*env.sz);c.stroke(HI);}
  return P;}
// the hock of a leg that stands on its toes: up the shank from the foot (hk of the knee-to-foot length) and out behind it (hb), on
// the side the knee does not bend to. In the leg's own frame, so a leg kicked up or lying flat keeps its shape
function hockOf(hip,K,A,fa,hk,hb){const td=nrm(sub(K,hip)),sd=nrm(sub(A,K)),Ls=len(sub(A,K)),cr=td.x*sd.y-td.y*sd.x,sg=Math.sign(cr*4+fa*.5)||fa;
  return add(mix(K,A,1-hk),mul(perp(sd),sg*hb*Ls));}
// toes: from the ball of the foot A, the shank coming down to it along mt. Down on the floor they run along it the way he faces, the
// knuckles up off it and the claws hooked into it; off the floor they hang on from the shank. o: {s, n toes, toe (length), tw
// (thickness), fan, claw, dew (a claw behind), pad}
function toes(c,A,mt,env,mat,far,o){const fa=env.fa,s=o.s,g=env.gy(A.x),hA=g-A.y,C=env.col;
  let d;if(hA<o.toe*s*.9){const t=cl((hA-1.4*s)/(o.toe*s),0,.75);d=V(fa*Math.sqrt(1-t*t),t);}
  else{d=nrm(add(mt,V(fa*.6,.3)));if(dot(d,mt)<-.2)d=nrm(add(d,mt));}
  let up=perp(d);if(up.y>0)up=mul(up,-1);
  const ps=[disc(add(A,mul(up,-o.pad*.15*s)),o.pad*s)],tips=[];
  for(let i=0;i<o.n;i++){const f=o.n>1?i/(o.n-1):.5,sp=(f-.5)*o.fan,dir=nrm(add(mul(d,Math.cos(sp)),mul(up,Math.sin(sp)*.6))),L=o.toe*s*(1-Math.abs(f-.5)*.35),b0=add(A,mul(up,(f-.5)*.9*s));
    // (each toe two joints: up over its knuckle and down to the claw)
    const kn=add(add(b0,mul(dir,L*.5)),mul(up,o.tw*s*.4)),tp=add(add(b0,mul(dir,L)),mul(up,-o.tw*s*.1));
    // (at the game's own size one shape to a toe: the knuckle would be a pixel)
    if(env.lod>=2)ps.push(capsule(b0,kn,2.5*s*o.tw,2*s*o.tw),capsule(kn,tp,2*s*o.tw,1.35*s*o.tw));else ps.push(capsule(b0,tp,2.4*s*o.tw,1.4*s*o.tw));tips.push([tp,nrm(sub(tp,kn)),kn]);}
  if(o.dew){const b0=add(A,mul(up,.4*s)),tp=add(add(b0,mul(d,-o.dew*s)),mul(up,o.dew*.3*s));ps.push(capsule(b0,tp,2*s*o.tw,1.2*s*o.tw));tips.push([tp,nrm(sub(tp,b0)),b0,true]);}
  paint(c,ps,mat,env,far);
  if(!far&&env.lod>=2){c.strokeStyle=rgba('#000000',.42);c.lineWidth=Math.max(.6,.8*s);c.beginPath();for(const [,dd,kn,dw] of tips){if(dw)continue;const n2=perp(dd);c.moveTo(kn.x+n2.x*1.1*s*o.tw,kn.y+n2.y*1.1*s*o.tw);c.lineTo(kn.x-n2.x*1.1*s*o.tw,kn.y-n2.y*1.1*s*o.tw);}c.stroke();}
  // the claws: hooked down, a glint along the top of each
  const CL=new Path2D(),GL=new Path2D(),down=mul(up,-1);
  for(const [tp,dd,,dw] of tips){const k=o.claw*s*(dw?.7:1),e=add(add(tp,mul(dd,k*1.05)),mul(down,k*.5)),cpt=add(tp,mul(dd,k*.9)),q=perp(dd),w=.85*s*o.tw;
    CL.moveTo(tp.x+q.x*w,tp.y+q.y*w);CL.quadraticCurveTo(cpt.x+q.x*w*.4,cpt.y+q.y*w*.4,e.x,e.y);CL.quadraticCurveTo(cpt.x-q.x*w*.6,cpt.y-q.y*w*.6,tp.x-q.x*w,tp.y-q.y*w);CL.closePath();
    GL.moveTo(tp.x+up.x*w*.6,tp.y+up.y*w*.6);GL.quadraticCurveTo(cpt.x+up.x*w*.3,cpt.y+up.y*w*.3,lerp(cpt.x,e.x,.55),lerp(cpt.y,e.y,.55));}
  c.fillStyle=far?mid(C.claw,'#2a2632',.3):C.claw;c.fill(CL);if(!far&&env.lod>=1){c.strokeStyle=rgba(C.rim,.28);c.lineWidth=Math.max(1,.6*s);c.stroke(GL);}
  return d;}
// a band of light round a limb's bent joints and the creases there, not at the smallest size (they would be under a pixel)
function foldsAt(c,tb,env,o){if(env.lod>0)FigKit.folds(c,tb,env,o);}
// a main form made its own way (a path, the outline it follows, how wide the form is at each point of it), to take the light
function band(p,O,OW,c,r){let N=null;return{p,c,r,lit:true,o:O,get on(){return N||(N=FigKit.normals(O));},ow:OW,inside:q=>FigKit.inPoly(O,q.x,q.y)};}
// a limb's own outline: a smooth tube along Q, Wd[i] wide at Q[i] (thick where the muscle is, thin at the wrist), round at both ends
function tube(Q,Wd){if(DBG.noTube){const c0=capsule(Q[0],Q[Q.length-1],Wd[0],Wd[Wd.length-1]);return c0;}const n=Q.length,Lp=[],Rp=[],Nn=[];
  for(let i=0;i<n;i++){const a=Q[Math.max(0,i-1)],b=Q[Math.min(n-1,i+1)],nn=perp(nrm(sub(b,a)));Nn.push(nn);Lp.push(add(Q[i],mul(nn,Wd[i]/2)));Rp.push(sub(Q[i],mul(nn,Wd[i]/2)));}
  const out=Lp.slice(),de=nrm(sub(Q[n-1],Q[n-2])),ne=Nn[n-1],we=Wd[n-1]/2,ds=nrm(sub(Q[0],Q[1])),ns=Nn[0],ws=Wd[0]/2;
  for(const f of [.25,.5,.75]){const a=f*Math.PI;out.push(add(Q[n-1],add(mul(ne,we*Math.cos(a)),mul(de,we*Math.sin(a)))));}
  for(let i=n-1;i>=0;i--)out.push(Rp[i]);
  for(const f of [.25,.5,.75]){const a=f*Math.PI;out.push(add(Q[0],add(mul(ds,ws*Math.sin(a)),mul(ns,-ws*Math.cos(a)))));}
  let r=0;for(const w of Wd)r=Math.max(r,w/2);
  return{p:smooth(out,true,.42),c:mix(Q[0],Q[n-1],.5),r,a:Q[0],b:Q[n-1],wa:Wd[0],wb:Wd[n-1]};}
function disc(q,r){const P=new Path2D();P.moveTo(q.x+r,q.y);P.arc(q.x,q.y,r,0,TAU);return{p:P,c:q,r};}
function oval(q,rx,ry,ang){const P=new Path2D();P.ellipse(q.x,q.y,rx,ry,ang,0,TAU);return{p:P,c:q,r:Math.max(rx,ry)};}
function resample(Q,per){const out=[],n=Q.length,g=i=>Q[cl(i,0,n-1)];
  for(let i=0;i<n-1;i++)for(let j=0;j<per;j++){const t=j/per,p0=g(i-1),p1=g(i),p2=g(i+1),p3=g(i+2),t2=t*t,t3=t2*t;
    out.push(V(.5*(2*p1.x+(-p0.x+p2.x)*t+(2*p0.x-5*p1.x+4*p2.x-p3.x)*t2+(-p0.x+3*p1.x-3*p2.x+p3.x)*t3),.5*(2*p1.y+(-p0.y+p2.y)*t+(2*p0.y-5*p1.y+4*p2.y-p3.y)*t2+(-p0.y+3*p1.y-3*p2.y+p3.y)*t3)));}
  out.push(Q[n-1]);return out;}
function unionOf(ps){if(ps.length===1)return ps[0].p;const U=new Path2D();for(const q of ps)U.addPath(q.p);return U;}
function hx(h){return[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));}
function mid(a,b,u){const A=hx(a),B=hx(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*u).toString(16).padStart(2,'0')).join('');}
function rgba(h,a){const c=hx(h);return`rgba(${c[0]},${c[1]},${c[2]},${a})`;}
function line(c,Q,col,w){c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(Q[0].x,Q[0].y);for(const q of Q.slice(1))c.lineTo(q.x,q.y);c.stroke();}
function dotAt(c,q,r,col){c.fillStyle=col;c.beginPath();c.arc(q.x,q.y,r,0,TAU);c.fill();}
function rng(a){return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function pick(R,list){let t=R()*list.reduce((s,e)=>s+e[1],0);for(const e of list){t-=e[1];if(t<0)return e[0];}return list[0][0];}
// a drop of blood hanging from q, down the world
function drip(c,q,l,w){c.beginPath();c.moveTo(q.x-w,q.y);c.quadraticCurveTo(q.x-w*.9,q.y+l*.6,q.x,q.y+l);c.quadraticCurveTo(q.x+w*.9,q.y+l*.6,q.x+w,q.y);c.closePath();c.fill();}
// a ragged oval: rx along ax, ry across it, its edge pushed in and out a little (a cut through flesh is never clean)
function ragged(ctr,ax,rx,ry,jit,seed){const ay=perp(ax),Q=[],n=12;for(let i=0;i<n;i++){const a=i/n*TAU,j=1+jit*Math.sin(a*3+seed*1.7)*.6+jit*Math.cos(a*5+seed)*.4;Q.push(add(ctr,add(mul(ax,Math.cos(a)*rx*j),mul(ay,Math.sin(a)*ry*j))));}return smooth(Q,true,.5);}
// stitches along a seam, short ticks across it in thread
function stitch(c,a,b,col,lw,step,k){const d=sub(b,a),L=len(d)||1,u=mul(d,1/L),q=perp(u),n=Math.max(1,Math.floor(L/step));c.strokeStyle=col;c.lineWidth=lw;c.beginPath();
  for(let i=0;i<=n;i++){const m=add(a,mul(u,i*L/n));c.moveTo(m.x+q.x*k-u.x*k*.45,m.y+q.y*k-u.y*k*.45);c.lineTo(m.x-q.x*k+u.x*k*.45,m.y-q.y*k+u.y*k*.45);}c.stroke();}
// paths in a head's own frame, built once from point lists
const PC={};function P2(key,fn){return PC[key]||(PC[key]=fn());}
const HP=a=>a.map(([x,y])=>V(x,y));

// ---------- the bodies ----------
// A kind's height (the game's measure: thigh, shin, torso, neck and head radius), build, hunch (the posture the guard pose leans by)
// and stance. A goblin is about three quarters of a man: a big head and long arms on short legs, light, crouched forward. The
// lizard-man is half again as tall as Kael, heavy, with long arms, leaning in like something that hunts.
const KIND={goblin:{H:[106,119],bulk:[.72,.86],posture:[.2,.29],stance:[1.24,1.42]},
  lizard:{H:[206,218],bulk:[1.64,1.78],posture:[.1,.15],stance:[1.08,1.18]}};
function body(kind,b,seed){const K=KIND[kind];if(!K)return b;const R=rng(((seed||1)>>>0)*977+(kind==='lizard'?331:17)),o=Object.assign({},b),H=lerp(K.H[0],K.H[1],R());
  if(kind==='goblin'){o.headR=lerp(12.6,14.2,R());o.neck=lerp(8,9.4,R());o.torso=H*lerp(.28,.3,R());const legs=H-o.headR-o.neck-o.torso;o.th=legs*.53;o.sh=legs-o.th;
    o.ua=H*lerp(.238,.252,R());o.fa=H*lerp(.222,.236,R());}
  else{o.headR=lerp(15,16.4,R());o.neck=lerp(21,23.5,R());o.torso=H*lerp(.31,.322,R());const legs=H-o.headR-o.neck-o.torso;o.th=legs*.52;o.sh=legs-o.th;
    o.ua=H*lerp(.198,.206,R());o.fa=H*lerp(.188,.196,R());}
  o.h=H/139.5;o.bulk=lerp(K.bulk[0],K.bulk[1],R());o.mass=o.bulk*o.h;o.limbW=6*o.bulk;o.torsoW=11.5*o.bulk;
  o.posture=lerp(K.posture[0],K.posture[1],R());o.stance=lerp(K.stance[0],K.stance[1],R());o.beast=kind;o.tall=H;return o;}
// the drawing's own unit: how many world units one body unit of a beast is (the game runs the lizard's tail with it too)
function size(F){const b=F.body;return b.h*(.93+.07*b.bulk)*(F.beast==='lizard'?1:1.08);}

// ---------- who they are ----------
// a goblin's look from its seed: its skin, what it has scavenged, its ears and nose; a crowd of them is never two the same. What
// came first stays as it was (the same seed, the same goblin); the newer things are picked after it.
const GOB_SKIN=[['#26302a','#18201a','#3a4a3a'],['#2c3227','#1c2219','#43503a'],['#243026','#161f18','#384c3c'],['#30352a','#20241b','#4b5340'],['#283230','#192221','#3d4e4a'],['#2d2f26','#1d1f18','#474a3a'],
  ['#383d36','#262a24','#565c4e'],['#1f271f','#121812','#2f3c2c'],['#2a3236','#1a2124','#3e4a50']];
const GOB_CLOTH={sack:['#3a3122','#2a2318'],waistcoat:['#2c1416','#1c0c0e'],jacket:['#1a2131','#111724'],rag:['#2f2a24','#211d18'],britches:['#29241d','#1c1914']};
function goblinSpec(seed){const R=rng(((seed||7)>>>0)*7919+101),sk=GOB_SKIN[Math.floor(R()*GOB_SKIN.length)],top=pick(R,[['sack',3],['waistcoat',2],['jacket',2],['bare',1.4]]);
  const hat=pick(R,[['cap',2.6],[null,1.6],['tufts',1.6],['band',1.6],['hood',1.4],['goggles',1.2]]),ear=pick(R,[['bat',3],['droop',2],['torn',2]]),nose=pick(R,[['hook',3],['snub',1.5],['long',2]]);
  const col={skin:sk[0],skinFar:mid(sk[0],'#2e2a38',.35),mottle:sk[1],wart:sk[2],rim:'#ffcf86',eye:pick(R,[['#a8ffe2',3],['#8ff0ff',2],['#cbff9e',1]]),
    tooth:'#c9c0a0',toothShade:'#7d7560',claw:'#151311',
    top:(GOB_CLOTH[top]||GOB_CLOTH.rag)[0],topFar:(GOB_CLOTH[top]||GOB_CLOTH.rag)[1],sleeve:(GOB_CLOTH[top]||GOB_CLOTH.rag)[0],sleeveFar:(GOB_CLOTH[top]||GOB_CLOTH.rag)[1],
    britches:GOB_CLOTH.britches[0],britchesFar:GOB_CLOTH.britches[1],rag:'#3b3428',ragFar:'#28231c',rope:'#6b5a3a',brass:'#b28d3d',brassHi:'#ffe299',gold:'#e2b65a',
    cap:'#161b26',capShade:'#0d1018',hood:'#3a3122',strap:'#2b2620',canister:'#3c3f2c',canisterHi:'#6c7050'};
  const s={kind:'goblin',col,top,hat,ear,nose,filter:R()<.45,rag:R()<.42,earring:R()<.35,britches:R()<.75,tusk:R()<.7,ribs:top==='bare'||R()<.3,teeth:R()<.3,band:pick(R,[['#5a2a22',2],['#2f3a2a',1],['#3b3428',2]]),
    mottles:Array.from({length:9},()=>[R(),R()-.5,.5+R()*.8]),seed};
  // the newer things: a stitched patch, a belt and what hangs from it, a necklace of teeth, bandage wraps, a scar, a wart on the nose,
  // rings in the ear, a stolen watch, a few hairs
  s.patch=top!=='bare'&&R()<.65;s.patchCol=pick(R,[['#4a3a24',2],['#2c3446',1.5],['#4e2420',1.5],['#36422c',1.2],['#3c3c38',1]]);
  s.belt=top==='sack'?'rope':pick(R,[['strap',3],['rope',1.5],[null,1]]);
  s.trinkets=[];for(const [k,pp] of [['skull',.5],['keys',.35],['pouch',.5],['bone',.4]])if(R()<pp)s.trinkets.push(k);if(s.trinkets.length>2)s.trinkets.length=2;
  s.necklace=R()<.4;s.wrapArm=R()<.45;s.wrapLeg=R()<.35;s.scar=R()<.4;s.wart=R()<.6;s.rings=R()<.45;s.watch=top==='waistcoat'&&R()<.75;s.hair=R()<.45;s.gap=Math.floor(R()*7);
  Object.assign(col,{skinHi:mid(sk[0],'#9aa889',.32),flesh:'#552824',gum:'#5c1e22',nail:'#14110d',bone:'#d2c7aa',boneFar:'#8f8672',boneShade:'#8a7f66',thread:'#a8946a',
    leather:'#3a2a1c',leatherFar:'#291e15',bandage:'#857c66',bandageFar:'#4f4a3f',vein:mid(sk[0],'#07100a',.55),patch:s.patchCol,patchFar:mid(s.patchCol,'#2e2a38',.35)});
  return s;}
// the lizard-man is one creature: dark hide, a bronze and gold-green sheen, the collar's brass, the iron he wears
function lizardSpec(seed){const R=rng(((seed||3)>>>0)*131+5);
  const col={hide:'#1a1d17',hideFar:'#292a26',belly:'#352c1e',bellyFar:'#2a2620',scale:'#0d0f0b',sheenA:'#c08a3a',sheenB:'#7fd28a',rim:'#ffcf86',
    eye:'#e6f58a',eyeCore:'#fffbd0',tooth:'#d8cfb0',toothShade:'#80775f',claw:'#0e0c0b',crest:'#2b2116',crestFar:'#262019',crestHi:'#b07a36',
    iron:'#1d1e22',ironFar:'#28292d',ironHi:'#8e95a3',rust:'#5a3a22',brass:'#b28d3d',brassHi:'#ffe299',brassShade:'#634a19',leather:'#2a1a12',leatherFar:'#30241c',stud:'#b28d3d',chain:'#6f747e',
    horn:'#2b2116',paint:'#c9a26a',bone:'#bdb197',boneFar:'#7d7665',boneShade:'#7a705a',osteo:'#34362a',web:'#3e2416',gum:'#4a1a1c',flesh:'#5a2420'};
  return{kind:'lizard',col,seed,scar:R()<.6,paint:R()<.85,skulls:1+(R()<.6?1:0)};}
function specOf(F){const k=F.beast==='lizard'?'lizard':'goblin',s=F.seed||F.idx||1,c=F._bspec;if(c&&c.k===k&&c.s===s)return c.v;
  const v=k==='lizard'?lizardSpec(s):goblinSpec(s);F._bspec={k,s,v};return v;}

// ---------- materials ----------
// The noir fill, lit as the cast are (FigKit.light): a main shape (one marked lit, big enough) gets a plane of light along the side
// that faces the light, as broad as its material allows, and its rim only along the parts of its outline that face the light; a
// small part keeps the plain rim, the shape again nudged toward the light in the rim colour under the shape itself. The far side
// duller. fm = [centre, radius, strength] shades the fill itself into form: a touch warmer toward the light, dark away from it.
// the materials the light is worked out for, and as what: a goblin's skin as skin, the lizard's hide with a sheen, sacking and
// old coats as wool, leather sharper, iron and brass a thin bright line
const LIT={skin:'gskin',hide:'hide',belly:'hide',top:'wool',sleeve:'wool',britches:'wool',hood:'wool',cap:'wool',rag:'cotton',bandage:'cotton',
  leather:'leather',crest:'leather',iron:'steel',brass:'steel',canister:'steel',bone:'satin'};
function paint(c,ps,mat,env,far,ra,fm){const C=env.col,base=far?(C[mat+'Far']||mid(C[mat],'#2e2a38',.32)):C[mat],U=unionOf(ps),cls=LIT[mat];
  // (flat: what is on a turned torso, whose light its main shape carries)
  if(env.flat){c.fillStyle=base;c.fill(U);return U;}
  env.far=!!far;const old=cls?ps.filter(q=>!FigKit.litOK(q,env)):ps;
  // (the current path is let go first: a canvas carries whatever was left in it through every change of transform)
  c.beginPath();
  if(old.length){const a0=c.globalAlpha,dx=env.L.x*env.rw,dy=env.L.y*env.rw;c.globalAlpha=a0*Math.min(1,(far?.38:(ra??1))*FigKit.rimK());c.translate(dx,dy);c.fillStyle=C.rim;
    c.fill(old.length===ps.length?U:unionOf(old));c.translate(-dx,-dy);c.globalAlpha=a0;}
  // (a shape that takes a plane of light is filled flat under it, the plane doing the work the shading wash did)
  fillForm(c,U,base,far||old.length<ps.length?null:fm,env);
  // (at the smallest size the hide's sheen is left to the plane: a thin band there is under a pixel)
  if(cls&&old.length<ps.length&&base[0]==='#'&&base.length===7){FigKit.light(c,ps,env,{cls:env.lod===0&&cls==='hide'?'gskin':cls,base,light:C.rim,far:!!far});c.lineCap='round';c.lineJoin='round';}
  env.far=false;return U;}
function fillForm(c,U,base,fm,env){if(fm&&env.lod>=1&&!DBG.noForm){const [ctr,R,amt]=fm,A=amt??1,L=env.L,a=add(ctr,mul(L,R)),b=sub(ctr,mul(L,R)),g=c.createLinearGradient(a.x,a.y,b.x,b.y);
    g.addColorStop(0,mid(base,'#ffd696',.075*A));g.addColorStop(.42,base);g.addColorStop(1,mid(base,'#030209',Math.min(.8,.5*A)));c.fillStyle=g;}else c.fillStyle=base;c.fill(U);}
// many small round things in one colour, in one fill
function dots(c,list,col){c.fillStyle=col;c.beginPath();for(const [q,r] of list){c.moveTo(q.x+r,q.y);c.arc(q.x,q.y,r,0,TAU);}c.fill();}
// the form: one wash across a shape, a touch warmer toward the light and dark away from it, so it reads round instead of flat
const DBG={};
function form(c,U,ctr,R,env,amt){if(env.lod<1||DBG.noForm)return;amt=amt??1;const L=env.L,a=add(ctr,mul(L,R)),b=sub(ctr,mul(L,R)),g=c.createLinearGradient(a.x,a.y,b.x,b.y);
  g.addColorStop(0,`rgba(255,214,150,${(.075*amt).toFixed(3)})`);g.addColorStop(.42,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(3,2,9,${Math.min(.8,.5*amt).toFixed(3)})`);c.fillStyle=g;c.fill(U);}
// a goblin's mottled skin: darker blotches seeded along each limb, kept well inside its shape (no clipping: it is cheap that way)
function mottle(c,U,parts,env,sp,far){if(env.lod<1||far||DBG.noMottle)return;const C=env.col;c.fillStyle=C.mottle;c.globalAlpha=.72;c.beginPath();
  for(let j=0;j<parts.length;j++){const q=parts[j];if(!q.a)continue;const d=sub(q.b,q.a),L=len(d)||1,u=mul(d,1/L),nn=perp(u),w=Math.min(q.wa,q.wb);
    for(let i=0;i<3;i++){const m=sp.mottles[(i+j*3)%sp.mottles.length],at=add(add(q.a,mul(u,(.15+.7*m[0])*L)),mul(nn,m[1]*w*.42)),r=w*.13*m[2];
      c.moveTo(at.x+r*1.3,at.y);c.ellipse(at.x,at.y,r*1.3,r,Math.atan2(u.y,u.x),0,TAU);}}
  c.fill();c.globalAlpha=1;}
// a lizard's hide: rows of scales along each part, kept inside it, sparse at game size and full in a close view; and the sheen,
// one wash from the lit edge across the whole shape, bronze into gold-green
function scales(c,U,parts,env,far,big,limb,noSheen){const C=env.col,L=env.L;if(DBG.noScales)return;
  if(env.lod>=(limb?2:1)&&!far&&!DBG.noRows){const dense=env.lod>=2&&!limb,st=(big?3.4:2.6)*env.sz*(dense?1:1.7);c.strokeStyle=C.scale;c.lineWidth=Math.max(.96,1.51*env.sz);c.globalAlpha=.62;c.beginPath();
    for(const q of parts){if(!q.a)continue;const d=sub(q.b,q.a),Ll=len(d)||1,u=mul(d,1/Ll),nn=perp(u),w=Math.min(q.wa,q.wb),rows=Math.max(1,Math.round(w*.62/st)),h=st*.42;
      for(let r=0;r<rows;r++){const off=rows>1?(r/(rows-1)-.5)*w*.6:0,ph=(r%2)*st*.5;for(let s2=st*.4+ph;s2<Ll-st*.2;s2+=st){const at=add(add(q.a,mul(u,s2)),mul(nn,off));
        c.moveTo(at.x+u.x*h+nn.x*h*.55,at.y+u.y*h+nn.y*h*.55);c.quadraticCurveTo(at.x+nn.x*h*1.1,at.y+nn.y*h*1.1,at.x-u.x*h+nn.x*h*.55,at.y-u.y*h+nn.y*h*.55);}}}
    c.stroke();c.globalAlpha=1;}
  // the limbs take the sheen only in a close view (it is the big shapes that show it at game size)
  if(!far&&parts.length&&!DBG.noSheen&&!limb&&!noSheen){let cx=0,cy=0,R0=0,nn=0;for(const q of parts){const ctr=q.c||q.a;if(!ctr)continue;cx+=ctr.x;cy+=ctr.y;nn++;}
    if(nn){cx/=nn;cy/=nn;for(const q of parts){const ctr=q.c||q.a;if(ctr)R0=Math.max(R0,len(sub(ctr,V(cx,cy)))+(q.r||8));}
      const ctr=V(cx,cy),a=add(ctr,mul(L,R0)),b=sub(ctr,mul(L,R0*.6)),g=c.createLinearGradient(a.x,a.y,b.x,b.y);
      g.addColorStop(0,rgba(C.sheenA,.3));g.addColorStop(.3,rgba(C.sheenB,.13));g.addColorStop(.6,rgba(C.sheenB,0));c.globalCompositeOperation='lighter';c.fillStyle=g;c.fill(U);c.globalCompositeOperation='source-over';}}}

// ---------- hands and feet ----------
// a clawed hand. Open: a palm and fingers spread along g, a hooked claw on each. Holding something: a fist round the grip along g,
// the knuckles ridged and caught by the light, the claws curled over the front of the grip
function claw(c,H,g,s,env,mat,far,fingers,closed,clawLen){const q=perp(g),pt=(a,b)=>add(H,add(mul(g,a*s),mul(q,b*s))),C=env.col;
  const hook=(base,d,k)=>{const n2=perp(d),kk=k*s;c.moveTo(base.x+n2.x*.75*s,base.y+n2.y*.75*s);
    c.quadraticCurveTo(base.x+d.x*kk*.9+n2.x*.4*s,base.y+d.y*kk*.9+n2.y*.4*s,base.x+d.x*kk+n2.x*kk*.55,base.y+d.y*kk+n2.y*kk*.55);c.lineTo(base.x-n2.x*.75*s,base.y-n2.y*.75*s);c.closePath();};
  // (a fist with weight to it: the knuckles a broad ridge over the grip, the thumb wrapped round under them)
  if(closed){paint(c,[piece([pt(-3.7,-3.5),pt(-.4,-4.3),pt(2.4,-4.1),pt(4.1,-2),pt(4.4,1),pt(3.4,3.8),pt(-1.4,4.2),pt(-4.5,1.2)],.5,true)],mat,env,far);
    if(env.lod>=1&&!far){c.strokeStyle=rgba('#000000',.5);c.lineWidth=Math.max(.83,1.38*s);c.beginPath();for(let i=0;i<fingers-1;i++){const a=-1.4+i*2.2;const k0=pt(a,1.2),k1=pt(a+.6,3.6);c.moveTo(k0.x,k0.y);c.lineTo(k1.x,k1.y);}c.stroke();
      // the knuckle ridge, lit along its top
      const k0=pt(-1.8,-3.3),km=pt(2.6,-3.6),k1=pt(3.9,-.2);c.strokeStyle=rgba(C.rim,.38);c.lineWidth=Math.max(.46,.93*s);c.beginPath();c.moveTo(k0.x,k0.y);c.quadraticCurveTo(km.x,km.y,k1.x,k1.y);c.stroke();}
    c.fillStyle=C.claw;c.beginPath();for(let i=0;i<fingers;i++){const a=-2+i*(4.4/(fingers-1||1)),base=pt(a,3.4);hook(base,nrm(add(mul(q,1),mul(g,.35))),clawLen*.8);}c.fill();return;}
  // (open: long fingers of two joints each, curling a little toward the world's down, the knuckle between)
  const ps=[piece([pt(-3.3,-3.1),pt(2.6,-3.4),pt(3.8,0),pt(2.9,3.3),pt(-3,3.1),pt(-4.1,0)],.5,true)],tips=[],cu=dot(q,V(0,1))>0?1:-1;
  for(let i=0;i<fingers;i++){const sp=(i-(fingers-1)/2)*2.3,base=pt(2.4,sp*.85),dir=nrm(add(g,mul(q,sp*.09))),kn=add(base,mul(dir,3.8*s)),d2=nrm(add(dir,mul(q,cu*.45))),tip=add(kn,mul(d2,3.4*s));
    if(env.lod>=2)ps.push(capsule(base,kn,2.4*s,2*s),capsule(kn,tip,2*s,1.5*s));else ps.push(capsule(base,tip,2.3*s,1.5*s));tips.push([tip,d2,kn]);}
  paint(c,ps,mat,env,far);
  if(env.lod>=2&&!far){c.strokeStyle=rgba('#000000',.45);c.lineWidth=Math.max(.25,.35*s);c.beginPath();for(const [tp,d,b0] of tips){const m=mix(b0,tp,.5),n2=perp(d);c.moveTo(m.x+n2.x*.7*s,m.y+n2.y*.7*s);c.lineTo(m.x-n2.x*.7*s,m.y-n2.y*.7*s);}c.stroke();}
  c.fillStyle=C.claw;c.beginPath();for(const [tp,d] of tips)hook(tp,d,clawLen);c.fill();}
// ---------- the tail ----------
// The numbers the game runs the tail with too: N links, len of the body's height long, its root at root (along the spine as a
// share of the torso, across in body units, - toward the back), its width from w[0] at the root to w[1] at the tip in body units,
// tapering with the power w[2]
const TAIL={N:8,len:.5,root:[-.02,-7.4],w:[19,1.2,.85]};
function tailW(t,sz){return lerp(TAIL.w[0],TAIL.w[1],Math.pow(cl(t,0,1),TAIL.w[2]))*sz;}
// the lizard's tail when the game does not run it: a little chain of its own, kept on the fighter, run whenever he is drawn: pulled
// toward its rest shape (out behind him and down to the floor, in his own frame, so it follows him when he bends or falls),
// swinging with his motion, dragging on the floor; strong at the root, loose at the tip; a dead tail goes slack
function tailStep(F,root,back,down,L0,N,gy,now,slack,wOf){
  const seg=L0/N,targ=[];let pos=root;targ.push(pos);
  for(let i=1;i<=N;i++){const a=.12+.62*Math.pow(i/N,1.15),d=nrm(add(mul(back,Math.cos(a)),mul(down,Math.sin(a))));pos=add(pos,mul(d,seg));targ.push(pos);}
  // a new tail, or one that has jumped, starts at rest and is given half a second to settle; a gap between draws is caught up in
  // small fixed steps, so a body that lay still off screen still has its tail on the floor
  let st=F._tail;const fresh=!st||!st.q||st.q.length!==N+1||len(sub(st.q[0],root))>L0*.8;
  if(fresh)st=F._tail={t:now-.5,q:targ.map(t=>({x:t.x,y:t.y,px:t.x,py:t.y}))};
  const dt=cl(now-(st.t??now),0,1.5);st.t=now;if(!(dt>0))return st.q;
  const n=Math.ceil(dt*120),h=dt/n,q=st.q,stiff=slack?.035:1,grav=slack?760:520;
  for(let s=0;s<n;s++){
    q[0].px=q[0].x;q[0].py=q[0].y;q[0].x=root.x;q[0].y=root.y;
    for(let i=1;i<=N;i++){const p=q[i],T=targ[i],kk=lerp(260,30,i/N)*stiff;const vx=(p.x-p.px)*.982,vy=(p.y-p.py)*.982;p.px=p.x;p.py=p.y;
      p.x+=vx+(T.x-p.x)*kk*h*h;p.y+=vy+(T.y-p.y)*kk*h*h+grav*h*h;}
    for(let it=0;it<3;it++)for(let i=1;i<=N;i++){const a=q[i-1],b=q[i],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1e-6,k=(d-seg)/d;
      if(i===1){b.x-=dx*k;b.y-=dy*k;}else{a.x+=dx*k*.5;a.y+=dy*k*.5;b.x-=dx*k*.5;b.y-=dy*k*.5;}}
    for(let i=1;i<=N;i++){const p=q[i],g=gy(p.x)-(wOf?wOf(i/N)*.9:2);if(p.y>g){p.y=g;p.px=lerp(p.px,p.x,.35);}}}
  return q;}
// a cut through the tail, seen from the side: the hide's edge, the flesh, a ring of bone with the marrow in it, a wet glint.
// ctr the middle of the cut, d out of the cut, w the tail's width there
function tailCutFace(c,ctr,d,w,env){let nn=perp(d);if(nn.y>0)nn=mul(nn,-1);const rx=w/2,ry=Math.max(w*.2,.9),o=add(ctr,mul(d,ry*.3));
  c.fillStyle='#150806';c.fill(ragged(add(o,mul(d,-ry*.25)),nn,rx*1.06,ry*1.3,.08,3));
  c.fillStyle='#5e1215';c.fill(ragged(o,nn,rx*.94,ry,.1,5));
  c.fillStyle='#8f2429';c.fill(ragged(add(add(o,mul(d,ry*.1)),mul(nn,-rx*.12)),nn,rx*.6,ry*.62,.14,7));
  // the vertebra and the cord through it, up toward the back, and the muscle round it parted
  const vb=add(add(o,mul(nn,rx*.42)),mul(d,ry*.12));c.fillStyle='#d9cfb3';c.beginPath();c.ellipse(vb.x,vb.y,rx*.2,ry*.36,Math.atan2(nn.y,nn.x),0,TAU);c.fill();dotAt(c,vb,Math.max(.35,rx*.07),'#3a0c0b');
  if(env.lod>=1){c.strokeStyle='rgba(30,4,6,.7)';c.lineWidth=Math.max(.3,rx*.05);c.beginPath();c.moveTo(o.x+nn.x*rx*.1,o.y+nn.y*rx*.1);c.lineTo(o.x-nn.x*rx*.6,o.y-nn.y*rx*.6);c.stroke();
    c.strokeStyle='rgba(255,196,176,.45)';c.lineWidth=Math.max(.3,rx*.06);c.beginPath();c.ellipse(o.x+d.x*ry*.2,o.y+d.y*ry*.2,rx*.66,ry*.5,Math.atan2(nn.y,nn.x),Math.PI*.15,Math.PI*.6);c.stroke();}}
// the tail's body along R (points from the root end), each point ts[i] of the way down the whole tail (that sets its width):
// the hide and its scales, the keeled plates along the top, a paler underside, the dark bands; o.endCut / o.startCut square off that
// end with a cut face. Returns the outline.
function tailBody(c,R,ts,env,sp,o){
  const C=sp.col,lod=env.lod,sz=env.sz,N=R.length,A=[],B=[],nns=[],ws=[];
  // (a stretch seen end on, as when he turns his back and the tail comes at the viewer, keeps the way across it had before)
  let last=null;for(let i=0;i<N;i++){const a=R[Math.max(0,i-1)],bb=R[Math.min(N-1,i+1)],dd=sub(bb,a);let nn=len(dd)>.05?perp(nrm(dd)):(last||V(0,-1));last=nn;const w=tailW(ts[i],sz);nns.push(nn);ws.push(w);A.push(add(R[i],mul(nn,w/2)));B.push(sub(R[i],mul(nn,w/2)));}
  const TP=new Path2D();TP.moveTo(A[0].x,A[0].y);for(let i=1;i<N;i++)TP.lineTo(A[i].x,A[i].y);for(let i=N-1;i>=0;i--)TP.lineTo(B[i].x,B[i].y);TP.closePath();
  const parts=[];for(let i=0;i<N-1;i+=2){const w0=ws[i];parts.push({a:R[i],b:R[Math.min(N-1,i+2)],wa:w0,wb:w0*.85,c:R[i],r:w0*.6});}
  // the tail is a main form: its plane of light runs along whichever side faces the light, as wide as the tail is there
  const O=[...A,...B.slice().reverse()],OW=[...ws,...ws.slice().reverse()],ctr=R[Math.floor(N/3)];
  const U=paint(c,[band(TP,O,OW,ctr,ws[0]*.5)],'hide',env,false,1,[R[Math.floor(N/2)],len(sub(R[N-1],R[0]))*.5+ws[0],.8]);
  // the paler underside: a strip along whichever edge is lower in the world
  if(lod>=1){const lo=[],hi=[];for(let i=0;i<N;i++){let nn=nns[i];if(nn.y<0)nn=mul(nn,-1);const w=ws[i]/2;lo.push(add(R[i],mul(nn,w*.98)));hi.push(add(R[i],mul(nn,w*.5)));}
    const BP=new Path2D();BP.moveTo(lo[0].x,lo[0].y);for(let i=1;i<N;i++)BP.lineTo(lo[i].x,lo[i].y);for(let i=N-1;i>=0;i--)BP.lineTo(hi[i].x,hi[i].y);BP.closePath();
    c.fillStyle=rgba(C.belly,.72);c.fill(BP);
    if(lod>=2){c.strokeStyle=rgba('#000000',.4);c.lineWidth=Math.max(.35,.45*sz);c.beginPath();for(let i=1;i<N-1;i+=2){c.moveTo(lo[i].x,lo[i].y);c.lineTo(hi[i].x,hi[i].y);}c.stroke();}}
  scales(c,U,parts,env,false,true,lod<2);
  // the spines along the top, biggest at the root, swept toward the tip: the row down his back carried on to the end
  {const L=[];for(let i=1;i<N-1;i+=2){const a=R[i],d=nrm(sub(R[i+1],a));let nn=perp(d);if(nn.y>0)nn=mul(nn,-1);const hh=lerp(6.8,1.2,ts[i])*sz;
      L.push([add(a,mul(nn,ws[i]*.36)),nn,mul(d,-1),hh*2.5,hh,-.36]);}
    ridge(c,L,env,C,false);}
  // dark bands round it (one fill for all of them)
  if(lod>=1){const BD=new Path2D();for(let i=2;i<N-1;i+=3){const a=R[i],nn=nns[i],w=ws[i]*.44,d=nrm(sub(R[i+1],R[i-1])),h=Math.max(.3,w*.18);
      BD.moveTo(a.x+nn.x*w-d.x*h,a.y+nn.y*w-d.y*h);BD.lineTo(a.x+nn.x*w+d.x*h,a.y+nn.y*w+d.y*h);BD.lineTo(a.x-nn.x*w+d.x*h,a.y-nn.y*w+d.y*h);BD.lineTo(a.x-nn.x*w-d.x*h,a.y-nn.y*w-d.y*h);BD.closePath();}
    c.fillStyle=rgba('#000000',.42);c.fill(BD);}
  if(o&&o.endCut)tailCutFace(c,R[N-1],nrm(sub(R[N-1],R[N-2])),ws[N-1],env);
  if(o&&o.startCut)tailCutFace(c,R[0],nrm(sub(R[0],R[1])),ws[0],env);
  return TP;}

// ---------- lying on the floor ----------
// the torso outlines, along the spine from the pelvis (a) and across it in body units (s, + the side he faces)
const TORSO={
  goblin:T=>[[T+1.2,-6],[T*.86,-9.4],[T*.72,-11.2],[T*.5,-9.8],[T*.26,-8.4],[0,-8.2],[-T*.1,-6],[-T*.12,2],[0,8.4],[T*.22,10],[T*.42,9.2],[T*.66,7.2],[T*.86,6],[T+1,3.8],[T+2.4,0]],
  lizard:T=>[[T+4,-9.4],[T*.9,-15.6],[T*.72,-15.2],[T*.5,-12.6],[T*.26,-11.2],[T*.06,-10.6],[-T*.06,-8.8],[-T*.08,4],[T*.08,11],[T*.3,12.8],[T*.55,15.6],[T*.78,16.4],[T*.95,12.6],[T+2.4,7.6],[T+4.2,1]]};
// the back's line across from the spine at a height a (the knobs of a goblin's spine, the plates down a lizard's back)
const BACK={goblin:T=>[[-T*.1,-6],[0,-8.2],[T*.26,-8.4],[T*.5,-9.8],[T*.72,-11.2],[T*.86,-9.4],[T+1.2,-6]],lizard:T=>[[-T*.06,-8.8],[T*.06,-10.6],[T*.26,-11.2],[T*.5,-12.6],[T*.72,-15.2],[T*.9,-15.6],[T+4,-9.4]]};
function backAt(kind,T,a){const K=BACK[kind](T);if(a<=K[0][0])return K[0][1];for(let i=0;i<K.length-1;i++){const [a0,s0]=K[i],[a1,s1]=K[i+1];if(a<=a1)return lerp(s0,s1,cl((a-a0)/((a1-a0)||1),0,1));}return K[K.length-1][1];}
// half the drawn thickness at the elbows and knees, in body units
const JOINT={goblin:{el:2.4,kn:3},lizard:{el:4.2,kn:4.7}};
// the physics holds the pelvis and chest six units off the floor and the joints four; a beast is thicker than that, so when one lies
// down its drawn torso, elbows and knees are raised until the hide rests on the floor instead of sinking through it. The hands, feet
// and head keep their places (the weapon stays in the hand; the head has its own lift). Null when nothing touches
function restOn(F,kind,gy,sz){
  const p=F.p,P0=p[PEL],C0=p[CHE],u=nrm(sub(C0,P0)),n=mul(perp(u),F.facing||1),T=len(sub(C0,P0)),J=JOINT[kind];let dP=0,dC=0,q=null;
  for(const [a,s] of TORSO[kind](T)){const w=add(add(P0,mul(u,a)),mul(n,s*sz)),ov=w.y-gy(w.x)+.5;if(ov>0){if(a<T*.5)dP=Math.max(dP,ov);else dC=Math.max(dC,ov);}}
  const lift=(i,d)=>{if(d>0){q=q||p.slice();q[i]=V(p[i].x,p[i].y-d);}};
  lift(PEL,dP);lift(CHE,dC);
  for(const [i,r] of [[ELF,J.el],[ELB,J.el],[KNF,J.kn],[KNB,J.kn]])lift(i,p[i].y+r*sz-gy(p[i].x)+.5);
  return q;}
// the same for a goblin in two halves: each half's own torso, up to the cut and its face, lifted clear of the floor on its own
function restOnHalves(F,gy,sz){
  const p=F.p,H=F.half,T=F.body.torso,a=T*(H.a??.5),fa=F.facing||1,J=JOINT.goblin,q=p.slice(),pts=[...TORSO.goblin(T),[a,backAt('goblin',T,a)],[a,8.9]];
  const ov=(P0,u,keep)=>{const n=mul(perp(u),fa);let d=0;for(const [aa,s] of pts){if(!keep(aa))continue;const w=add(add(P0,mul(u,aa)),mul(n,s*sz)),o=w.y-gy(w.x)+.5;if(o>d)d=o;}return d;};
  const uL=nrm(sub(H.L,p[PEL])),dL=ov(p[PEL],uL,aa=>aa<=a+.01);
  const uU=nrm(sub(p[CHE],H.U)),dU=ov(sub(p[CHE],mul(uU,T)),uU,aa=>aa>=a-.01);
  if(dL>0)q[PEL]=V(p[PEL].x,p[PEL].y-dL);if(dU>0)q[CHE]=V(p[CHE].x,p[CHE].y-dU);
  for(const [i,r] of [[ELF,J.el],[ELB,J.el],[KNF,J.kn],[KNB,J.kn]]){const d=p[i].y+r*sz-gy(p[i].x)+.5;if(d>0)q[i]=V(p[i].x,p[i].y-d);}
  return{q,half:{U:V(H.U.x,H.U.y-dU),L:V(H.L.x,H.L.y-dL)}};}

// ---------- turned ----------
// A beast turning on the spot (the lizard bringing his tail round, a goblin's spinning cut) is drawn turned about its upright axis,
// as the cast are (CastLook): each joint has a place across the body, the shoulders and hips either side of the middle and the
// hands drawn in toward the middle as they come forward; p is where each is seen, dp how far toward the viewer a place is. The torso
// is drawn as its two halves (FigKit.torsoMap) from sections round its outline, the head in the round, the tail and the plates of
// the back along the line down the middle of him. yaw: 0 the profile the fights are drawn in, π/2 his back to the viewer.
// how far out either side the shoulders and the hips are, and how wide the torso is across, up it ([a, half-width across]), in body
// units: a goblin narrow and pot-bellied, the lizard a great barrel of a chest
const LATK={goblin:{ls:9.6,lh:5.2},lizard:{ls:16.4,lh:8.8}};
const WIDE={goblin:T=>[[-T*.12,8.2],[0,8.8],[T*.22,9.4],[T*.46,9.2],[T*.7,10.4],[T*.88,10.2],[T+.6,6.6],[T+1.6,4.6],[T+2.6,3.9]],
  lizard:T=>[[-T*.06,12.8],[0,13.6],[T*.2,13.4],[T*.4,15.2],[T*.62,17.8],[T*.84,18.8],[T+.6,14.6],[T+2,11],[T+3.2,9]]};
function tabAt(tab,a){let i=0;while(i<tab.length-2&&tab[i+1][0]<a)i++;const A=tab[i],B=tab[i+1],t=cl((a-A[0])/((B[0]-A[0])||1),0,1);return A.slice(1).map((v,j)=>v+(B[j+1]-v)*t);}
// the sections round a torso's outline: the back edge of each is the line down the middle of the back, the front edge the line
// down the front
function torsoSecs(Jl,wide){const bk=Jl.filter(q=>q[1]<0).slice().sort((x,y)=>x[0]-y[0]),fr=Jl.filter(q=>q[1]>=0).slice().sort((x,y)=>x[0]-y[0]);
  const as=[...new Set([...Jl.map(q=>q[0]),...wide.map(q=>q[0])])].sort((x,y)=>x-y);
  return as.map(a=>[a,tabAt(bk,a)[0],tabAt(fr,a)[0],tabAt(wide,a)[0]]);}
// Everything a turned beast is drawn with, or null in profile. fr: its frame; offOnGrip: the far hand is on the weapon's grip too.
function turnOf(c,F,env,kind,fr,offOnGrip,yaw){
  if(!(Math.abs(Math.sin(yaw))>.015||Math.cos(yaw)<0))return null;
  const p0=env.p||F.p,fa=F.facing,{P0,u,n,T,at}=fr,sz=env.sz,K=LATK[kind],px=(p0[PEL].x+p0[CHE].x)/2,VW=FigKit.view(px,fa,yaw);
  const LS=K.ls*sz,LH=K.lh*sz,fwd=q=>cl((q.x-px)*fa/(.55*T),0,1);
  const lHF=LS*(1-.5*fwd(p0[HAF])),lEF=LS*(1-.15*fwd(p0[ELF])),lHB=offOnGrip?lHF:-LS*(1-.5*fwd(p0[HAB])),lEB=offOnGrip?0:-LS*(1-.15*fwd(p0[ELB]));
  const LAT=[0,0,0,lEF,lHF,lEB,lHB,LH,LH,-LH,-LH,lHF],p=p0.map((q,i)=>VW.at(q,LAT[i]));
  const TAB=torsoSecs(TORSO[kind](T),WIDE[kind](T)),copies=[];
  {const aN=FigKit.torsoMap(VW,P0,u,n,sz,TAB,1),aF=FigKit.torsoMap(VW,P0,u,n,sz,TAB,-1);if(aF.vis>.04)copies.push([aF,-1]);if(aN.vis>.04)copies.push([aN,1]);}
  // something drawn in profile (a weapon, a foot, the rag at the neck) set out across the body at l and seen turned: squeezed about
  // its place, never thinner than min of itself (a foot seen from behind is still a foot's width)
  const across=(l,fn,min=.07)=>{const cc=Math.abs(VW.c)<min?(VW.c<0?-min:min):VW.c;c.save();c.translate(VW.px+fa*l*VW.s,0);c.scale(cc,1);c.translate(-VW.px,0);try{fn();}finally{c.restore();}};
  return{VW,yaw,p,LAT,LS,LH,fv:VW.fv,copies,across,secAt:a=>tabAt(TAB,a),dp:(q,l)=>VW.dep(q,l),SH:sh=>[VW.at(sh,LS),VW.at(sh,-LS)],HIP:[VW.at(P0,LH),VW.at(P0,-LH)],
    // the half toward the viewer (where the things hung on the front of him hang from)
    near:copies.length?copies[copies.length-1][0]:(a,s)=>VW.at(at(a,s),0),
    // a fin down the middle of him (a plate of the back or the neck), seen with a little thickness across
    fin:(Q,th)=>{const pts=[];for(const q of Q)for(const l of [-th,th])pts.push(VW.at(q,l));return FigKit.hull(pts);}};}
// the layers of a torso: in profile drawn once with at(); turned, the main shapes of the two halves together take the light and
// what is on them is drawn flat on each half, the far one first. base(g) gives the main shapes ({ps, mat, fm}), detail(g, U) draws
// what is on them; g: {at, P, side (0 in profile, 1 the near half, -1 the far)}
function layer(c,env,TV,fr,base,detail){
  if(!TV){const g={at:fr.at,P:fr.P,side:0},B=base?base(g):null;const U=B?paint(c,B.ps,B.mat,env,false,1,B.fm):null;if(detail)detail(g,U);return U;}
  const gs=TV.copies.map(([AT,side])=>({at:AT,P:Q=>Q.map(([a,s])=>AT(a,s)),side})),Bs=base?gs.map(base).filter(Boolean):[];let U=null;
  if(Bs.length){const ps=[];for(const B of Bs)ps.push(...B.ps);U=paint(c,ps,Bs[0].mat,env,false,1,Bs[Bs.length-1].fm);}
  if(detail){env.flat=true;try{for(const g of gs)detail(g,U);}finally{env.flat=false;}}
  return U;}
// a line on a turned torso: the runs of it that can be seen
function lineSeen(c,Q,col,w){for(const R of FigKit.seen(Q))line(c,R,col,w);}

// ---------- a goblin ----------
// a frame to draw a body in: a pelvis P0, the spine's direction u, the torso length T; at(a,s) is a along the spine, s across it in
// body units (+ the side it faces). A goblin in two halves has one frame for each.
function frame(F,env,P0,u,T){const n=mul(perp(u),F.facing),sz=env.sz,at=(a,s)=>add(add(P0,mul(u,a)),mul(n,s*sz));return{P0,u,n,T,at,P:Q=>Q.map(([a,s])=>at(a,s))};}
function goblin(c,F,sp,o,env){
  const p=env.p||F.p,H=env.half;
  if(!H){const P0=p[PEL],C0=p[CHE];gobBody(c,F,sp,o,env,frame(F,env,P0,nrm(sub(C0,P0)),len(sub(C0,P0))),'whole',1);return;}
  const T=F.body.torso,a=F.half.a??.5,uL=nrm(sub(H.L,p[PEL])),uU=nrm(sub(p[CHE],H.U));
  gobBody(c,F,sp,o,env,frame(F,env,p[PEL],uL,T),'lower',a);
  gobBody(c,F,sp,o,env,frame(F,env,sub(p[CHE],mul(uU,T)),uU,T),'upper',a);}
// part: 'whole', or the 'lower' half (legs, hips, the belt and what hangs from it) or the 'upper' one (arms, chest, head, weapon),
// each drawn up to the cut (cutA of the torso) with the cut face over it. A whole goblin in a spin is drawn turned (turnOf).
function gobBody(c,F,sp,o,env,fr,part,cutA){
  const C=sp.col,p0=env.p||F.p,fa=F.facing,lod=env.lod,sz=env.sz,W=w=>w*sz,now=env.now,{P0,u,n,T,at,P}=fr,dead=F.dead;
  const whole=part==='whole',UP=part!=='lower',LOW=part!=='upper',cutAt=T*cutA,pt=(ps,mat,far,fm)=>paint(c,ps,mat,env,far,1,fm);
  const armed=F.wp?!F.wp.unarmed:!!F.weaponKey,tipDir0=nrm(sub(p0[TIP],p0[HAF]));
  const offOnGrip=(()=>{if(!armed)return false;const h=p0[HAB],a=sub(p0[HAF],mul(tipDir0,9)),bq=p0[TIP],ab=sub(bq,a),t=cl(dot(sub(h,a),ab)/(dot(ab,ab)||1),0,1);return len(sub(h,add(a,mul(ab,t))))<4.5;})();
  // (turned: p is where each joint is seen, fv the way the goblin seems to face, nS across its spine toward that)
  const TV=whole&&env.yaw?turnOf(c,F,env,'goblin',fr,offOnGrip,env.yaw):null,TN=!!TV,p=TN?TV.p:p0,fv=TN?TV.fv:fa;
  const C0=p[CHE],uS=TN?nrm(sub(p[CHE],p[PEL])):u,nS=mul(perp(uS),fv),sh0=at(T-3,-1.6),SH=TN?TV.SH(sh0):[sh0,sh0],HIP=TN?TV.HIP:[P0,P0];
  const tipV=sub(p[TIP],p[HAF]),tipDir=!TN||len(tipV)>4?nrm(tipV):nrm(sub(p[HAF],p[ELF]));
  const across=TN?TV.across:(l,fn)=>fn();
  // creases where a limb bends: in the skin, in the cloth
  const foldSkin={lit:rgba(C.skinHi,.3),dark:rgba(C.mottle,.95)},foldSkinFar={lit:rgba(C.skinHi,.12),dark:rgba(C.mottle,.6),far:true},
    foldCloth={lit:rgba(C.rim,.2),dark:'rgba(0,0,0,.5)'};
  // a rag strip trailing from the neck on the game's own scarf chain
  const rag=()=>{if(!(UP&&sp.rag&&F.scarf&&F.scarf.length>2&&!F.severed))return;const Q=resample(F.scarf.map(q=>V(q.x,q.y)),2),N=Q.length,A=[],B=[];
    for(let i=0;i<N;i++){const a=Q[Math.max(0,i-1)],bb=Q[Math.min(N-1,i+1)],nn=perp(nrm(sub(bb,a))),w=W(3.4)*(1-.45*i/(N-1))*(.75+.25*Math.sin(i*2.3+sp.seed));A.push(add(Q[i],mul(nn,w/2)));B.push(sub(Q[i],mul(nn,w/2)));}
    const R=new Path2D();R.moveTo(A[0].x,A[0].y);for(const q of A.slice(1))R.lineTo(q.x,q.y);const e=Q[N-1];R.lineTo(e.x+(Math.sin(now*3+sp.seed)*1.5),e.y+2*sz);for(const q of B.reverse())R.lineTo(q.x,q.y);R.closePath();
    pt([{p:R,c:Q[Math.floor(N/2)],r:6}],'rag',true);};
  // ----- the arms: wiry, each one shape from the shoulder to the wrist, the shoulder's mass its round top (riding up with a raised
  // arm); the point of the elbow out of the back of the bend, a forearm that bulges and a thin wrist -----
  const sleeved=sp.top==='jacket';
  const armParts=(E,Hd,S)=>{const fd=nrm(sub(Hd,E)),Hh=sub(Hd,mul(fd,1.2*sz)),ud=nrm(sub(E,S)),S0=add(S,add(mul(uS,cl(dot(ud,uS),0,1)*1.2*sz),mul(ud,.5*sz))),d0=nrm(sub(E,S0));
    const fA=bendA([S0,E,Hh],1,V(fv,0));
    const tb=FigKit.tube([S0,E,Hh],[W(3.7),W(3.15),W(1.75)],{cap0:1.4,prof:[orient(MUS.gob.up,fA),orient(MUS.gob.lo,fA)],gather:.3,stretch:.08,lite:lod===0});
    let ko=sub(d0,fd);const bent=cl(len(ko)/1.2,0,1);if(len(ko)<.3){ko=perp(d0);if(dot(ko,V(-fv,.6))<0)ko=mul(ko,-1);}ko=nrm(ko);
    // the point of the elbow: bone out of the back of the bend, along the upper arm's line, small while the arm is straight
    const el=spur(add(E,mul(ko,W(1.6))),nrm(add(mul(ko,.75),mul(d0,.55))),fd,W(1.8),W(2.4+1.8*bent),-.15);
    return{tb,kn:el,E,H:Hd,fd,Hh,S:S0};};
  const arm=(A,far,holds,near)=>{
    const U=pt([A.tb,A.kn],'skin',far,[mix(A.E,A.S,.3),W(13),.9]);mottle(c,U,[seg(A.S,A.E,W(7.4),W(6.2)),seg(A.E,A.Hh,W(6.6),W(3.8))],env,sp,far);
    if(!sleeved)foldsAt(c,A.tb,env,far?foldSkinFar:foldSkin);
    if(sleeved){
      // the jacket's sleeve over the upper arm, torn off ragged at the elbow, a lighter piping above the tear
      const SL=FigKit.tube([A.S,A.E],[W(4.3),W(3.6)],{cap0:1.3,bulge:[.08],lite:lod===0});pt([SL],'sleeve',far,[SL.c,W(9),.9]);
      if(lod>=1){const e=A.E,d=nrm(sub(A.E,A.S)),q=perp(d),R=new Path2D();R.moveTo(e.x+q.x*W(4.2),e.y+q.y*W(4.2));for(let i=1;i<=5;i++){const t=i/5,s2=lerp(4.2,-4.2,t),dd=i%2?2.6:.6;const z=add(add(e,mul(q,W(s2))),mul(d,dd*sz));R.lineTo(z.x,z.y);}R.lineTo(e.x-q.x*W(4.2)-d.x*2*sz,e.y-q.y*W(4.2)-d.y*2*sz);R.lineTo(e.x+q.x*W(4.2)-d.x*2*sz,e.y+q.y*W(4.2)-d.y*2*sz);R.closePath();c.fillStyle=far?C.topFar:C.top;c.fill(R);
        if(!far){const m=sub(e,mul(d,2.6*sz));c.strokeStyle=rgba(C.brass,.55);c.lineWidth=Math.max(.3,.5*sz);c.beginPath();c.moveTo(m.x+q.x*W(3.4),m.y+q.y*W(3.4));c.lineTo(m.x-q.x*W(3.4),m.y-q.y*W(3.4));c.stroke();}}}
    if(!far&&lod>=2){
      // the muscle: the edge of the shoulder down the upper arm, the long muscle down the forearm; a vein down the forearm
      const ud=nrm(sub(A.E,A.S)),uq=perp(ud),sg=dot(uq,nS)>0?1:-1,fd=nrm(sub(A.Hh,A.E)),fq=perp(fd),fg=dot(fq,nS)>0?1:-1;c.strokeStyle=rgba(C.mottle,.9);c.lineWidth=Math.max(.3,.5*sz);c.beginPath();
      const m0=add(mix(A.S,A.E,.1),mul(uq,sg*W(2.7))),mc=add(mix(A.S,A.E,.3),mul(uq,sg*W(.6))),m1=add(mix(A.S,A.E,.52),mul(uq,-sg*W(.6)));c.moveTo(m0.x,m0.y);c.quadraticCurveTo(mc.x,mc.y,m1.x,m1.y);
      const f0=add(mix(A.E,A.Hh,.12),mul(fq,-fg*W(1.8))),fc=add(mix(A.E,A.Hh,.36),mul(fq,-fg*W(.3))),f1=add(mix(A.E,A.Hh,.66),mul(fq,fg*W(.6)));c.moveTo(f0.x,f0.y);c.quadraticCurveTo(fc.x,fc.y,f1.x,f1.y);c.stroke();
      const a0=add(mix(A.E,A.Hh,.18),mul(fq,W(.9))),a1=add(mix(A.E,A.Hh,.5),mul(fq,W(-.6))),a2=add(mix(A.E,A.Hh,.82),mul(fq,W(.4)));
      c.strokeStyle=rgba(C.vein,.8);c.lineWidth=Math.max(.3,.45*sz);c.beginPath();c.moveTo(a0.x,a0.y);c.quadraticCurveTo(a1.x,a1.y,a2.x,a2.y);c.stroke();}
    // bandage wrapped round the forearm, its turns slanting across it, a loose end hanging
    if(near&&sp.wrapArm&&lod>=1)wrapRound(c,A.E,A.Hh,.5,.97,W(6.6),W(3.9),5,env,C,now,sp,lod>=2);
    claw(c,A.H,holds?tipDir:A.fd,sz*1.3,env,'skin',far,3,holds,2.6);};
  const farArm=far=>{if(!UP)return;arm(armParts(p[ELB],p[HAB],SH[1]),far,offOnGrip,false);if(o.afterFarArm)across(TN?TV.LAT[HAB]:0,()=>o.afterFarArm(F));};
  const nearArm=far=>{if(!UP)return;if(armed&&o.drawOther)across(TN?TV.LAT[HAF]:0,()=>o.drawOther(F));arm(armParts(p[ELF],p[HAF],SH[0]),far,armed,true);};
  // ----- the legs: short and bowed, each one shape from the hip down the thigh, the shin back to the hock and the instep down to the
  // ball of the foot; a knobbed knee, a heel of bone, long clawed toes -----
  const leg=(kn,ft,side,far)=>{const K=p[kn],A=p[ft],hip=HIP[side>0?0:1],td=nrm(sub(K,hip));
    // up on its toes: the hock out behind the foot, the long instep down from it to the ball of the foot (turned: worked out in
    // profile and seen turned)
    const hk0=hockOf(P0,p0[kn],p0[ft],fa,.3,.16),hk=TN?TV.VW.at(hk0,side*TV.LH):hk0,sd=nrm(sub(hk,K));
    const kA=bendA([hip,K,hk],1,V(-fv,0));
    const tb=FigKit.tube([hip,K,hk,A],[W(5.3),W(3.2),W(2.1),W(1.6)],{gather:.26,stretch:.08,prof:[orient(MUS.gob.th,!kA),orient(MUS.gob.sh,!kA),MUS.gob.mt],lite:lod===0});
    let ko=sub(td,sd);if(len(ko)<.3){ko=perp(td);if(dot(ko,V(fv,0))<0)ko=mul(ko,-1);}ko=nrm(ko);
    // a knobbed knee and a heel of bone at the hock
    const kneeB=oval(add(K,mul(ko,W(1.6))),W(2.1),W(1.6),Math.atan2(ko.y,ko.x)),md=nrm(sub(A,hk));let ho=sub(sd,md);if(len(ho)<.2)ho=perp(sd);ho=nrm(ho);
    const heel=spur(add(hk,mul(ho,W(1))),nrm(add(ho,mul(sd,.5))),sd,W(1.4),W(2.8),.1);
    const U=pt([tb,kneeB,heel],'skin',far,[mix(hip,A,.45),W(24),.85]);mottle(c,U,[seg(hip,K,W(11),W(6.6)),seg(K,hk,W(6.6),W(4.2))],env,sp,far);
    if(!sp.britches)foldsAt(c,tb,env,far?foldSkinFar:foldSkin);
    if(!far&&lod>=2){const tq=perp(td),tg=dot(tq,nS)>0?1:-1,sq=perp(sd),sg=dot(sq,nS)>0?1:-1;c.strokeStyle=rgba(C.mottle,.9);c.lineWidth=Math.max(.3,.5*sz);c.beginPath();
      const a0=add(mix(hip,K,.24),mul(tq,tg*W(2.4))),ac=add(mix(hip,K,.55),mul(tq,tg*W(.6))),a1=add(mix(hip,K,.86),mul(tq,tg*W(1.4)));c.moveTo(a0.x,a0.y);c.quadraticCurveTo(ac.x,ac.y,a1.x,a1.y);
      const b0=add(mix(K,hk,.14),mul(sq,-sg*W(1.8))),bc=add(mix(K,hk,.3),mul(sq,-sg*W(.5))),b1=add(mix(K,hk,.56),mul(sq,-sg*W(.9)));c.moveTo(b0.x,b0.y);c.quadraticCurveTo(bc.x,bc.y,b1.x,b1.y);c.stroke();
      // the shin bone catches the light down its front
      const e0=add(mix(K,hk,.2),mul(sq,sg*W(1.6))),e1=add(mix(K,hk,.78),mul(sq,sg*W(1.1)));c.strokeStyle=rgba(C.skinHi,.55);c.lineWidth=Math.max(.3,.45*sz);c.beginPath();c.moveTo(e0.x,e0.y);c.lineTo(e1.x,e1.y);c.stroke();}
    // the foot (turned: drawn in profile and seen turned)
    const foot=()=>toes(c,TN?p0[ft]:A,nrm(sub(TN?p0[ft]:A,TN?hk0:hk)),env,'skin',far,{s:sz,n:3,toe:9,tw:1.15,fan:.5,claw:3.2,dew:3.4,pad:2.3});
    if(TN)across(side*TV.LH,foot,.38);else foot();
    // ragged britches over the thigh, torn below the knee, gathered behind the knee, patched at the knee in a close view
    if(sp.britches){const d=td,q=perp(d),e=add(K,mul(sd,3*sz)),wT=W(12),wK=W(10);
      const a0=add(hip,mul(q,wT/2)),a1=sub(hip,mul(q,wT/2)),hem=[];for(let i=0;i<=6;i++){const t=i/6,s2=lerp(wK/2,-wK/2,t),dd=(i%2?2.6:0)*sz;hem.push(add(add(e,mul(q,s2)),mul(sd,dd)));}
      const R=new Path2D();R.moveTo(a0.x,a0.y);R.lineTo(hem[0].x,hem[0].y);for(const h of hem.slice(1))R.lineTo(h.x,h.y);R.lineTo(a1.x,a1.y);R.closePath();
      const O=[a0,...FigKit.curvePts([a0,hem[0]],false,.5,3).pts.slice(1,-1),...hem,...FigKit.curvePts([hem[6],a1],false,.5,3).pts.slice(1,-1),a1,mix(a1,a0,.5)];
      pt([band(R,O,O.map(()=>wT*.85),mix(hip,K,.5),W(4.6))],'britches',far,lod>=1?[mix(hip,K,.5),W(9),.85]:null);
      foldsAt(c,tb,env,far?{lit:rgba(C.rim,.08),dark:'rgba(0,0,0,.28)',far:true}:foldCloth);
      if(lod>=1&&!far){c.strokeStyle=rgba(C.mottle,.6);c.lineWidth=Math.max(.8,1*sz);c.beginPath();const m=mix(hip,K,.55);c.moveTo(m.x+q.x*W(2),m.y+q.y*W(2));c.lineTo(m.x-q.x*W(1)+d.x*2,m.y-q.y*W(1)+d.y*2);c.stroke();
        if(lod>=2&&sp.patch){const m2=mix(hip,K,.78),pq=[add(add(m2,mul(q,W(2.6))),mul(d,-W(1.6))),add(add(m2,mul(q,W(2.4))),mul(d,W(1.6))),add(add(m2,mul(q,W(-2.2))),mul(d,W(1.4))),add(add(m2,mul(q,W(-2.4))),mul(d,-W(1.4)))];
          const pp=piece(pq,.15);c.fillStyle=C.patch;c.fill(pp.p);c.setLineDash([W(.8),W(.7)]);c.strokeStyle=rgba(C.thread,.8);c.lineWidth=Math.max(.25,.35*sz);c.stroke(pp.p);c.setLineDash([]);}}}
    // a strip of bandage round the shin above the ankle
    if(!far&&sp.wrapLeg&&lod>=1)wrapRound(c,K,hk,.5,.9,W(6.4),W(4.4),4,env,C,now,sp,false);
  };
  // ----- the seat: the weight of the hips, both thighs going into it (in its britches when it wears them) -----
  const seat=()=>{if(!LOW)return;const dn=nrm(add(sub(p0[KNF],P0),sub(p0[KNB],P0))),crotch=add(P0,mul(dn,4*sz)),mat=sp.britches?'britches':'skin';
    if(!TN){pt([piece([at(T*.1,-7.4),at(-T*.06,-8.2),add(at(-T*.16,-6),mul(dn,1.4*sz)),crotch,add(at(-T*.16,6.4),mul(dn,1.4*sz)),at(-T*.06,8.4),at(T*.1,8.6)],.45,true)],mat,false,[P0,W(10),.9]);return;}
    const pts=[TV.VW.at(crotch,0)];for(const a of [T*.06,-T*.1]){const R=TV.secAt(a),sc=(R[0]+R[1])/2,Dd=(R[1]-R[0])/2;for(let i=0;i<12;i++){const t=i/12*TAU;pts.push(TV.VW.at(at(a,sc+Dd*Math.cos(t)),R[2]*Math.sin(t)*sz));}}
    for(const hp of HIP)pts.push(add(hp,V(0,3*sz)));
    pt([piece(FigKit.hull(pts),.4,true)],mat,false,[TV.VW.at(P0,0),W(10),.9]);};
  // ----- the torso and what it wears (a half only up to the cut) -----
  // scrawny: a pot belly, a hunched back and, bare, the knobs of the spine standing out along it; then what it wears over it; then
  // the belt, the filter's strap and the necklace. In profile drawn once; turned, as its two halves (layer)
  const torso=()=>{
    layer(c,env,TV,fr,g=>({ps:[piece(g.P(TORSO.goblin(T)),.42,sp.top==='bare'||sp.top==='waistcoat')],mat:'skin',fm:[g.at(T*.55,1),W(16),1]}),
      (g,TU)=>{
        // (the knobs of the spine, catching a little of the light along the back)
        if(sp.top==='bare'&&lod>=1){const K=[];for(const f of [.44,.56,.68,.8,.92]){const a=T*f,q=g.at(a,backAt('goblin',T,a)+1.1);if(!q.h)K.push(disc(q,W(1.45)));}if(K.length)paint(c,K,'skin',env,false,.42);}
        mottle(c,TU,[seg(g.at(0,0),g.at(T,0),W(14),W(12))],env,sp,false);
        if(sp.ribs&&lod>=1){c.strokeStyle=C.mottle;c.lineWidth=Math.max(1.1,1.65*sz);c.beginPath();for(let i=0;i<4;i++){const a=T*(.46+i*.11),Q=resample(g.P([[a,5.6],[a-1.2,2],[a-.6,-2.2]]),2);for(const R of FigKit.seen(Q)){c.moveTo(R[0].x,R[0].y);for(const q of R.slice(1))c.lineTo(q.x,q.y);}}c.stroke();
          if(lod>=2){c.strokeStyle=rgba(C.rim,.22);c.lineWidth=Math.max(.3,.4*sz);c.beginPath();for(let i=0;i<4;i++){const a=T*(.46+i*.11)+.8,Q=resample(g.P([[a,5.2],[a-1.1,2.2]]),2);for(const R of FigKit.seen(Q)){c.moveTo(R[0].x,R[0].y);for(const q of R.slice(1))c.lineTo(q.x,q.y);}}c.stroke();}}
        if(sp.top==='bare'&&lod>=1){const nv=g.at(T*.17,8.6),nd=perp(uS);if(!nv.h&&g.side>=0){c.strokeStyle=rgba('#000000',.5);c.lineWidth=Math.max(.6,.9*sz);c.beginPath();c.arc(nv.x,nv.y,W(.9),Math.atan2(nd.y,nd.x)-1,Math.atan2(nd.y,nd.x)+1);c.stroke();}
          // warts and a scar or two on the bare back
          c.fillStyle=C.wart;c.beginPath();for(const [a,s] of [[T*.62,-6.4],[T*.34,-5.6],[T*.8,-4]]){const q=g.at(a,s);if(q.h)continue;c.moveTo(q.x+W(.75),q.y);c.arc(q.x,q.y,W(.75),0,TAU);}c.fill();}});
    // what it wears on its back
    if(sp.top==='sack'){const hem=[];for(let i=0;i<=8;i++){const t=i/8,s2=lerp(-8.4,9.6,t),dd=-T*.32-(i%2?T*.06:0)+Math.sin(i*1.7+sp.seed)*T*.02;hem.push([dd,s2]);}
      const Q=[[T+1.2,-6],[T*.86,-9.6],[T*.72,-11.4],[T*.5,-10],[T*.2,-9],[-T*.1,-8.8],...hem,[-T*.05,10.2],[T*.22,10.4],[T*.42,9.6],[T*.66,7.6],[T*.86,6.3],[T+1,4]];
      layer(c,env,TV,fr,g=>({ps:[piece(g.P(Q),.25,true)],mat:'top',fm:[g.at(T*.4,0),W(18),.95]}),g=>{
        if(lod>=1){c.strokeStyle=rgba('#000000',.3);c.lineWidth=Math.max(.3,.4*sz);c.beginPath();for(let i=0;i<5;i++){const a=-T*.12+i*T*.22,q0=g.at(a,-7.4),q1=g.at(a+T*.04,8.4);if(q0.h||q1.h)continue;c.moveTo(q0.x,q0.y);c.lineTo(q1.x,q1.y);}c.stroke();
          // folds dragged down from the belt
          c.strokeStyle=rgba('#000000',.36);c.lineWidth=Math.max(.35,.55*sz);c.beginPath();for(const [s0,s1] of [[-4.6,-6],[3.8,5.2],[.2,-.6]]){const q0=g.at(T*.08,s0),q1=g.at(-T*.24,s1),qc=g.at(-T*.06,(s0+s1)/2+1.2);if(q0.h||q1.h)continue;c.moveTo(q0.x,q0.y);c.quadraticCurveTo(qc.x,qc.y,q1.x,q1.y);}c.stroke();
          // the side seam, stitched
          if(lod>=2&&g.side>=0)stitch(c,g.at(T*.92,-3.6),g.at(-T*.22,-2.4),rgba(C.thread,.55),Math.max(.25,.35*sz),W(2.2),W(.9));
          // a patch sewn over a hole
          if(sp.patch&&g.side>=0){const pp=piece(g.P([[T*.6,-5.8],[T*.62,2.4],[T*.36,3.4],[T*.32,-4.8]]),.15);fillForm(c,pp.p,C.patch,lod>=2?[pp.c,W(7),.7]:null,env);
            c.setLineDash([W(1),W(.8)]);c.strokeStyle=rgba(C.thread,.85);c.lineWidth=Math.max(.6,.9*sz);c.stroke(pp.p);c.setLineDash([]);}
          // threads hanging off the hem
          if(lod>=2){c.strokeStyle=rgba(C.top,1);c.lineWidth=Math.max(.3,.4*sz);c.beginPath();for(let i=1;i<8;i+=2){const [dd,s2]=hem[i],q0=g.at(dd,s2);if(q0.h)continue;const q1=add(q0,V(Math.sin(now*1.6+i)*.6,W(2.2)));c.moveTo(q0.x,q0.y);c.lineTo(q1.x,q1.y);}c.stroke();}}
        // the rope round its middle, knotted at the front
        lineSeen(c,g.P(g.side?[[T*.12,-9.4],[T*.12,-5],[T*.12,0],[T*.12,5],[T*.12,10.4]]:[[T*.12,-9.4],[T*.12,10.4]]),C.rope,Math.max(.8,1.9*sz));
        if(lod>=1&&g.side>=0){const kq=g.at(T*.12,8.6);if(!kq.h){dotAt(c,kq,1.6*sz,C.rope);line(c,[kq,g.at(-T*.12,9.6)],C.rope,Math.max(.6,1.1*sz));line(c,[kq,g.at(-T*.06,7.4)],C.rope,Math.max(.6,1*sz));}}});}
    else if(sp.top==='waistcoat'){
      // a gentleman's waistcoat, far too big, taken off a body somewhere up the line
      const Q=[[T*.98,-5.6],[T*.8,-10],[T*.6,-11.6],[T*.36,-10],[T*.1,-9],[-T*.08,-8.6],[-T*.1,-2],[-T*.06,4.6],[T*.06,7.8],[T*.26,6.8],[T*.5,5.4],[T*.72,4.6],[T*.9,3.4]];
      layer(c,env,TV,fr,g=>({ps:[piece(g.P(Q),.35,true)],mat:'top',fm:[g.at(T*.45,-2),W(14),.95]}),(g,SU)=>{
        if(lod>=1){lineSeen(c,resample(g.P([[T*.9,3.4],[T*.72,4.6],[T*.5,5.4],[T*.26,6.8],[T*.06,7.8]]),2),C.gold,Math.max(.4,.55*sz));
          dots(c,[T*.62,T*.44,T*.26].map(a=>[g.at(a,5.6+(T*.62-a)*.04),.95*sz]).filter(d=>!d[0].h),C.gold);
          // the lapel, folded back and in shadow
          const LP=piece(g.P([[T*.98,-5.2],[T*.96,1.6],[T*.74,4.2],[T*.86,-1]]),.3);c.fillStyle=rgba('#000000',.32);c.fill(LP.p);
          if(SU&&g.side>=0){c.save();c.clip(SU);c.strokeStyle=rgba('#000000',.5);c.lineWidth=Math.max(1.15,1.72*sz);c.beginPath();const t0=g.at(T*.4,-4),t1=g.at(T*.3,-1.6);c.moveTo(t0.x,t0.y);c.lineTo(t1.x,t1.y);c.stroke();c.restore();}
          // a stolen watch on its chain, from a button to the pocket
          if(sp.watch&&g.side>=0){const b0=g.at(T*.44,5.5),pk=g.at(T*.2,2.2);if(!b0.h&&!pk.h){const m=mix(b0,pk,.5),sag=add(m,V(0,W(3)));c.strokeStyle=C.gold;c.lineWidth=Math.max(.6,.9*sz);c.beginPath();c.moveTo(b0.x,b0.y);c.quadraticCurveTo(sag.x,sag.y,pk.x,pk.y);c.stroke();
            line(c,[g.at(T*.26,-.6),g.at(T*.18,4.2)],rgba('#000000',.6),Math.max(.3,.5*sz));dotAt(c,pk,W(1.5),C.gold);dotAt(c,pk,W(.9),'#f3e2b0');if(lod>=2){dotAt(c,add(pk,V(-W(.4),-W(.4))),W(.35),'#ffffff');}}}}});}
    else if(sp.top==='jacket'){
      // a railwayman's jacket, the sleeves gone at the elbow, the buttons brass, the company's badge on the breast
      const Q=[[T+1.4,-6.4],[T*.86,-10],[T*.72,-11.8],[T*.5,-10.4],[T*.24,-9.2],[0,-9],[-T*.2,-8.6],[-T*.22,2],[-T*.16,9.6],[T*.2,10.6],[T*.42,9.8],[T*.66,7.8],[T*.86,6.6],[T+1.2,4.4],[T+2.6,0]];
      layer(c,env,TV,fr,g=>({ps:[piece(g.P(Q),.36,true)],mat:'top',fm:[g.at(T*.4,0),W(18),.95]}),g=>{
        if(lod>=1){dots(c,[T*.78,T*.56,T*.34,T*.12].map(a=>[g.at(a,7.4+(a<T*.4?1.2:0)),.95*sz]).filter(d=>!d[0].h),C.brass);
          if(lod>=2){c.strokeStyle=rgba('#000000',.4);c.lineWidth=Math.max(.35,.55*sz);c.beginPath();const q0=g.at(T*.78,-7.6),qc=g.at(T*.6,-4.6),q1=g.at(T*.42,-6.2);if(!q0.h&&!q1.h){c.moveTo(q0.x,q0.y);c.quadraticCurveTo(qc.x,qc.y,q1.x,q1.y);}const r0=g.at(T*.3,-8.4),rc=g.at(T*.2,-5.6),r1=g.at(T*.06,-7);if(!r0.h&&!r1.h){c.moveTo(r0.x,r0.y);c.quadraticCurveTo(rc.x,rc.y,r1.x,r1.y);}c.stroke();
            // the hem piped in faded brass, a pocket flap
            lineSeen(c,resample(g.P([[-T*.2,-8.4],[-T*.22,2],[-T*.15,9.4]]),2),rgba(C.brass,.45),Math.max(.3,.5*sz));
            if(g.side>=0){const PF=piece(g.P([[T*.18,1],[T*.2,6.8],[T*.08,7],[T*.06,1.2]]),.15);c.fillStyle=rgba('#000000',.3);c.fill(PF.p);}}
          const bd=g.at(T*.68,3.4);if(!bd.h&&g.side>=0){dotAt(c,bd,W(1.9),C.brass);dotAt(c,bd,W(1.1),'#4a3a18');if(lod>=2)dotAt(c,add(bd,V(-W(.5),-W(.6))),W(.45),C.brassHi);}}
        pt([piece(g.P([[T+.4,-5],[T+3.4,-5.4],[T+3.8,-1.4],[T+2.6,2.4],[T+.4,1.6]]),.5)],'top');});}
    layer(c,env,TV,fr,null,g=>{
      // a belt of its own when it wears no rope: a leather strap with a brass buckle, or a rope
      if(sp.top!=='sack'&&sp.belt){if(sp.belt==='strap'){pt([piece(g.P([[T*.16,-9.4],[T*.16,10.6],[T*.05,10.8],[T*.05,-9.2]]),.15)],'leather');
          if(lod>=1&&g.side>=0){const bk=g.at(T*.105,8.4),bs=W(1.05);if(!bk.h){c.strokeStyle=C.brass;c.lineWidth=Math.max(.8,1.14*sz);c.beginPath();c.ellipse(bk.x,bk.y,bs,bs*1.25,Math.atan2(uS.y,uS.x)+Math.PI/2,0,TAU);c.stroke();
            line(c,[g.at(T*.105,9.6),g.at(T*.02,11.2)],C.leather,Math.max(.5,W(1.4)));}}}
        else{lineSeen(c,g.P(g.side?[[T*.1,-9.4],[T*.1,-5],[T*.1,0],[T*.1,5],[T*.1,10.4]]:[[T*.1,-9.4],[T*.1,10.4]]),C.rope,Math.max(.8,1.7*sz));if(lod>=1&&g.side>=0){const kq=g.at(T*.1,8.4);if(!kq.h){dotAt(c,kq,1.5*sz,C.rope);line(c,[kq,g.at(-T*.1,9)],C.rope,Math.max(.6,1*sz));}}}}
      // a gas-mask filter on a strap: a canister at the hip on a strap across the chest
      if(sp.filter){lineSeen(c,resample(g.P([[T*.96,4.6],[T*.6,1.4],[T*.24,-4.8],[T*.06,-7.6]]),2),C.strap,Math.max(.7,1.5*sz));
        const cq=g.at(T*.02,-8.8);if(!cq.h&&g.side>=0){const cd=nrm(sub(g.at(-T*.2,-9.6),cq)),cn=perp(cd),k=sz,Q=[add(cq,mul(cn,3*k)),add(add(cq,mul(cn,3*k)),mul(cd,8.5*k)),add(add(cq,mul(cn,-3*k)),mul(cd,8.5*k)),add(cq,mul(cn,-3*k))];
          pt([piece(Q,.25)],'canister',false,lod>=2?[mix(Q[0],Q[2],.5),W(5),.9]:null);if(lod>=1){line(c,[add(cq,mul(cd,1.2*k)),add(add(cq,mul(cd,1.2*k)),mul(cn,0))].map((q,i)=>add(q,mul(cn,i?-3*k:3*k))),C.brass,Math.max(.4,.8*k));
            for(let i=0;i<3;i++)dotAt(c,add(add(cq,mul(cd,(3.6+i*1.6)*k)),mul(cn,.4*k)),.45*k,'#0b0c08');}}}
      // a necklace of teeth at the throat
      if(UP&&sp.necklace&&lod>=1&&g.side>=0){const a0=g.at(T+.6,-3.4),a1=g.at(T+.9,4.8),m=g.at(T*.76,5.2),Q=[];for(let i=0;i<=8;i++){const t=i/8,x=(1-t)*(1-t)*a0.x+2*(1-t)*t*m.x+t*t*a1.x,y=(1-t)*(1-t)*a0.y+2*(1-t)*t*m.y+t*t*a1.y,q=V(x,y);q.h=t<.5?a0.h&&m.h:m.h&&a1.h;Q.push(q);}
        lineSeen(c,Q,'#241b12',Math.max(.35,.5*sz));c.fillStyle=C.bone;c.beginPath();for(let i=2;i<=7;i++){const q=Q[i];if(q.h)continue;const d=nrm(add(mul(uS,-1),V(0,.6))),qq=perp(d),L=W(i%2?2.6:2);c.moveTo(q.x+qq.x*W(.65),q.y+qq.y*W(.65));c.quadraticCurveTo(q.x+d.x*L*.7+qq.x*W(.3),q.y+d.y*L*.7+qq.y*W(.3),q.x+d.x*L,q.y+d.y*L);c.lineTo(q.x-qq.x*W(.65),q.y-qq.y*W(.65));c.closePath();}c.fill();}});};
  // what hangs from the belt, swinging under it (turned: from the half toward the viewer; behind him if that is out of sight)
  const hang=TN?{at:TV.near,T}:fr,hangHid=TN&&TV.near(T*.09,7.4).h,trink=()=>{if(LOW&&sp.trinkets.length&&lod>=1)trinkets(c,F,sp,env,hang,dead);};
  // ----- neck and head -----
  const neck=()=>{if(F.severed)return;pt([capsule(add(C0,mul(uS,-2)),mix(C0,p[HEAD],.7),W(7.2),W(6))],'skin',false,lod>=2?[mix(C0,p[HEAD],.4),W(6),.8]:null);
    if(lod>=2){const d=nrm(sub(p[HEAD],C0)),q=perp(d),s2=dot(q,nS)>0?1:-1;c.strokeStyle=rgba(C.mottle,.85);c.lineWidth=Math.max(.3,.45*sz);c.beginPath();const a0=add(add(C0,mul(d,W(1))),mul(q,s2*W(1.6))),a1=add(mix(C0,p[HEAD],.6),mul(q,s2*W(1.2)));c.moveTo(a0.x,a0.y);c.lineTo(a1.x,a1.y);c.stroke();}};
  const head=()=>{if(!F.severed)goblinHead(c,F,sp,o,env,TN?{h:p[HEAD],C0,fa,hy:o.headYaw??FigKit.headYaw(TV.yaw)}:null);};
  if(!TN){
    // in profile: the rag, the far arm, the far leg, the seat, the near leg, the torso (up to the cut, with the cut face), what hangs
    // from the belt, the neck, the head, the weapon and the near arm over its grip
    rag();farArm(true);
    if(LOW){leg(KNB,FTB,-1,true);seat();leg(KNF,FTF,1,false);}
    if(!whole){c.save();const Q=P(part==='lower'?[[-T*3,-60],[cutAt,-60],[cutAt,60],[-T*3,60]]:[[cutAt,-60],[T*4,-60],[T*4,60],[cutAt,60]]);
      c.beginPath();c.moveTo(Q[0].x,Q[0].y);for(const q of Q.slice(1))c.lineTo(q.x,q.y);c.closePath();c.clip();}
    torso();
    if(!whole){c.restore();gobCut(c,fr,cutA,part==='lower',env,sp);}
    trink();
    if(!UP)return;
    neck();if(o.afterTorso)o.afterTorso(F);head();nearArm(false);return;}
  // turned: the arms and legs in the order of how far toward the viewer each is (as the cast's), the torso between
  const dp=TV.dp,LAT=TV.LAT,LS=TV.LS,LH=TV.LH;
  const dFarArm=(dp(sh0,-LS)+dp(p0[ELB],LAT[ELB])+dp(p0[HAB],LAT[HAB]))/3,dNA=(dp(sh0,LS)+dp(p0[ELF],LAT[ELF])+dp(p0[HAF],LAT[HAF]))/3,dNearArm=armed?(dNA*2+dp(p0[TIP],LAT[TIP]))/3:dNA;
  const dFarLeg=(dp(P0,-LH)+dp(p0[KNB],-LH)+dp(p0[FTB],-LH))/3,dNearLeg=(dp(P0,LH)+dp(p0[KNF],LH)+dp(p0[FTF],LH))/3;
  const arms=[{d:dFarArm,fn:()=>farArm(dFarArm<0)},{d:dNearArm,fn:()=>nearArm(dNearArm<0)}].sort((a,bb)=>a.d-bb.d);
  const legs=[{d:dFarLeg,fn:()=>leg(KNB,FTB,-1,dFarLeg<0)},{d:dNearLeg,fn:()=>leg(KNF,FTF,1,dNearLeg<0)}].sort((a,bb)=>a.d-bb.d);
  across(0,rag);
  for(const A of arms)if(A.d<0)A.fn();
  if(hangHid)trink();
  for(const L of legs)if(L.d<0)L.fn();
  seat();
  for(const L of legs)if(L.d>=0)L.fn();
  torso();
  if(!hangHid)trink();
  neck();if(o.afterTorso)across(LH,()=>o.afterTorso(F));
  head();
  for(const A of arms)if(A.d>=0)A.fn();
}
// a bandage wound round a limb between t0 and t1 of the way from a to b (w0 and w1 the limb's width there): one wrap a little wider
// than the limb, the edges of its turns slanting across it, and, in a close view, a loose end hanging
function wrapRound(c,a,b,t0,t1,w0,w1,turns,env,C,now,sp,end){const d=nrm(sub(b,a)),q=perp(d),m0=mix(a,b,t0),m1=mix(a,b,t1),h0=w0/2*1.1,h1=w1/2*1.14,sz=env.sz;
  const WR=piece([add(m0,mul(q,h0)),add(mix(m0,m1,.5),mul(q,(h0+h1)/2)),add(m1,mul(q,h1)),sub(m1,mul(q,h1)),sub(mix(m0,m1,.5),mul(q,(h0+h1)/2)),sub(m0,mul(q,h0))],.15);
  paint(c,[WR],'bandage',env,false,.7,env.lod>=2?[mix(m0,m1,.5),Math.max(h0,h1)*1.6,1]:null);
  c.strokeStyle=rgba('#000000',.42);c.lineWidth=Math.max(.6,.8*sz);c.beginPath();
  for(let i=1;i<turns;i++){const t=i/turns,m=mix(m0,m1,t),h=lerp(h0,h1,t),sl=lerp(w0,w1,t)*.32;c.moveTo(m.x+q.x*h-d.x*sl,m.y+q.y*h-d.y*sl);c.lineTo(m.x-q.x*h+d.x*sl,m.y-q.y*h+d.y*sl);}c.stroke();
  if(end){const e=add(m1,mul(q,-h1*.6)),hg=add(e,V(Math.sin(now*2+sp.seed)*sz,4*sz));c.strokeStyle=C.bandage;c.lineWidth=1.1*sz;c.beginPath();c.moveTo(e.x,e.y);c.quadraticCurveTo(e.x+1.5*sz,e.y+2*sz,hg.x,hg.y);c.stroke();}}
// what a goblin hangs off its belt: a rat's skull, a ring of keys, a pouch, a bone; each swings on a short cord under the world's
// pull, and lies on the floor when the floor is in the way
function trinkets(c,F,sp,env,fr,dead){const C=sp.col,sz=env.sz,W=w=>w*sz,now=env.now,{at,T}=fr;
  const spots=[at(T*.09,7.4),at(T*.07,2.6)];
  sp.trinkets.forEach((k,i)=>{const h=spots[i],sw=dead?0:Math.sin(now*2.2+i*1.7+sp.seed)*.22,d=rot(V(0,1),sw),q=perp(d),L=W(2.4);let cpt=add(h,mul(d,L+W(2.2)));
    const g=env.gy(cpt.x)-W(2);if(cpt.y>g)cpt=V(cpt.x,g);
    line(c,[h,cpt],'#2a2018',Math.max(.3,.45*sz));
    if(k==='skull'){const cr=oval(add(cpt,mul(d,W(.4))),W(2.2),W(1.8),Math.atan2(d.y,d.x)),sn=piece([add(cpt,mul(q,W(1))),add(add(cpt,mul(q,W(4.4))),mul(d,W(1.6))),add(add(cpt,mul(q,W(3.6))),mul(d,W(2.4))),add(add(cpt,mul(q,W(.4))),mul(d,W(2.2)))],.35);
      paint(c,[cr,sn],'bone',env,false);dotAt(c,add(add(cpt,mul(q,W(1.2))),mul(d,W(.5))),W(.75),'#16110c');if(env.lod>=2){line(c,[add(add(cpt,mul(q,W(3.2))),mul(d,W(2.2))),add(add(cpt,mul(q,W(3.4))),mul(d,W(2.9)))],C.bone,Math.max(.3,.4*sz));}}
    else if(k==='keys'){c.strokeStyle=C.brass;c.lineWidth=Math.max(.8,1.14*sz);c.beginPath();c.arc(cpt.x,cpt.y,W(1.4),0,TAU);c.stroke();
      for(const [o2,tw] of [[-.6,.15],[.7,-.2]]){const b0=add(cpt,add(mul(q,W(o2)),mul(d,W(1.2)))),dd=rot(d,tw),e=add(b0,mul(dd,W(3.4))),qq=perp(dd);c.strokeStyle=C.brass;c.lineWidth=Math.max(.67,W(1.15));c.beginPath();c.moveTo(b0.x,b0.y);c.lineTo(e.x,e.y);c.moveTo(e.x-dd.x*W(.8),e.y-dd.y*W(.8));c.lineTo(e.x-dd.x*W(.8)+qq.x*W(.9),e.y-dd.y*W(.8)+qq.y*W(.9));c.stroke();}}
    else if(k==='pouch'){const P1=piece([add(cpt,mul(q,W(1.3))),add(add(cpt,mul(q,W(2.4))),mul(d,W(2.6))),add(cpt,mul(d,W(3.8))),add(add(cpt,mul(q,W(-2.4))),mul(d,W(2.6))),add(cpt,mul(q,W(-1.3)))],.5);
      paint(c,[P1],'leather',env,false,1,env.lod>=2?[add(cpt,mul(d,W(2))),W(3),.9]:null);line(c,[add(cpt,mul(q,W(1.4))),add(cpt,mul(q,W(-1.4)))],C.rope,Math.max(.3,.5*sz));}
    else if(k==='bone'){const dd=rot(d,.7),a=add(cpt,mul(dd,W(.4))),b=add(cpt,mul(dd,W(4.6))),qq=perp(dd);
      paint(c,[capsule(a,b,W(1.1),W(1)),disc(add(a,mul(qq,W(.6))),W(.75)),disc(sub(a,mul(qq,W(.6))),W(.75)),disc(add(b,mul(qq,W(.6))),W(.7)),disc(sub(b,mul(qq,W(.6))),W(.7))],'bone',env,false);}});}
// the cut through a goblin's middle, seen from the side: wet flesh in a thin oval across the torso with the skin's edge round it,
// the spine's pale section near the back, the gut bulging out of the lower half or the ribs' ends in the upper, blood running
// down the world from its lowest edge. top: the face is on top of its half (the lower half), else under it
function gobCut(c,fr,cutA,top,env,sp){const {at,u,n,T}=fr,sz=env.sz,W=w=>w*sz,a=T*cutA,lod=env.lod,s0=backAt('goblin',T,a)+.4,s1=8.9,sm=(s0+s1)/2;
  const ctr=at(a,sm),hl=(s1-s0)/2*sz,th=W(2.1),dir=top?1:-1,off=mul(u,dir*th*.4),o=add(ctr,off),sd=sp.seed%7;
  // the skin's torn edge, the flesh, wet toward the middle
  c.fillStyle='#1a0a0a';c.fill(ragged(add(ctr,mul(off,.2)),n,hl+W(.7),th+W(.55),.06,sd));
  c.fillStyle='#661318';c.fill(ragged(o,n,hl,th,.1,sd+2));
  c.fillStyle='#972229';c.fill(ragged(add(o,mul(off,.3)),n,hl*.7,th*.55,.14,sd+4));
  if(lod>=1){if(top){
      // the gut, bulging out of the lower half: grey-pink loops, wet
      const G=[[2.6,1.8,1.25],[5.6,1.5,1.1],[-.4,1.35,.95],[4,1.2,1.7]];c.strokeStyle='#3e1414';c.lineWidth=Math.max(.6,.8*sz);
      for(const [s,r,k] of G){const q=add(at(a,s),mul(u,dir*W(k)));c.fillStyle=k>1.5?'#a0605e':'#8c4848';c.beginPath();c.ellipse(q.x,q.y,W(r*1.15),W(r*.85),Math.atan2(n.y,n.x),0,TAU);c.fill();c.stroke();}
      c.fillStyle='rgba(255,210,200,.4)';for(const [s,r,k] of G){const q=add(add(at(a,s),mul(u,dir*W(k))),mul(env.L,W(r*.4)));c.beginPath();c.arc(q.x,q.y,W(r*.32),0,TAU);c.fill();}}
    else{c.fillStyle='#d9ccb0';for(const s of [s0+1.4,s1-1.6]){const q=add(at(a,s),mul(u,dir*W(.6)));c.beginPath();c.ellipse(q.x,q.y,W(.7),W(1.1),Math.atan2(n.y,n.x),0,TAU);c.fill();}}}
  // the spine's pale section near the back
  const sq=add(at(a,s0+2.4),mul(off,1.1));c.fillStyle='#ddd1b4';c.beginPath();c.ellipse(sq.x,sq.y,W(1.75),W(1.2),Math.atan2(n.y,n.x),0,TAU);c.fill();dotAt(c,sq,W(.55),'#4a1812');
  if(lod>=1){c.strokeStyle='rgba(255,190,170,.42)';c.lineWidth=Math.max(.6,W(.7));c.beginPath();c.ellipse(o.x,o.y,hl*.62,th*.45,Math.atan2(n.y,n.x),Math.PI*1.05,Math.PI*1.7);c.stroke();
    // drips from the lowest edge of the cut
    c.fillStyle='#5a0d12';const E=[at(a,s0+.6),at(a,sm),at(a,s1-.6)].map(q=>add(q,mul(off,.5)));const lowY=Math.max(...E.map(q=>q.y));
    E.forEach((q,i)=>{if(q.y>=lowY-W(1.5))drip(c,q,W(1.6+((i*7+sp.seed)%3)*.8),W(.55));});}}
// the goblin head in its own frame: the cranium about 0,0, facing +x, crown to chin about 80, a long nose and an underbite
const GOB_SKULL={
  hook:[[-34,4],[-36,-14],[-27,-30],[-10,-38],[8,-38],[22,-31],[31,-21],[36,-12],[40,-7],[47,-4],[56,1],[63,8],[60,12],[52,12],[49,16],[50,21],[44,25],[50,28],[53,33],[47,40],[34,42],[18,40],[6,36],[-6,32],[-20,26],[-30,16]],
  snub:[[-34,4],[-36,-14],[-27,-30],[-10,-38],[8,-38],[22,-31],[31,-21],[36,-12],[40,-7],[46,-3],[51,3],[50,9],[46,12],[48,17],[44,24],[50,27],[52,33],[46,40],[33,42],[18,40],[6,36],[-6,32],[-20,26],[-30,16]],
  long:[[-34,4],[-36,-14],[-27,-30],[-10,-38],[8,-38],[22,-31],[31,-21],[36,-12],[40,-6],[50,-2],[62,4],[72,10],[66,13],[54,13],[50,17],[50,22],[44,25],[50,28],[53,33],[47,40],[34,42],[18,40],[6,36],[-6,32],[-20,26],[-30,16]]};
const GOB_EAR={
  bat:[[2,-2],[-8,-14],[-24,-28],[-44,-44],[-70,-62],[-58,-40],[-50,-26],[-38,-8],[-24,6],[-12,12],[0,8]],
  droop:[[2,-2],[-10,-9],[-30,-10],[-54,0],[-82,16],[-60,19],[-40,18],[-22,15],[-10,13],[0,8]],
  torn:[[2,-2],[-8,-13],[-24,-27],[-40,-42],[-52,-55],[-54,-45],[-63,-54],[-62,-34],[-50,-22],[-38,-6],[-24,6],[-12,12],[0,8]]};
// the inside of the ear, darker and fleshy, and where rings go through its edge
const GOB_EAR_INNER={bat:[[-4,1],[-14,-10],[-30,-25],[-56,-50],[-48,-29],[-36,-12],[-23,0],[-12,7]],droop:[[-4,3],[-18,-1],[-38,1],[-64,13],[-42,14],[-22,12],[-8,9]],torn:[[-4,1],[-14,-10],[-27,-21],[-42,-37],[-44,-24],[-34,-9],[-21,1],[-10,8]]};
const GOB_RINGS={bat:[[-21,-19],[-33,-30]],droop:[[-36,-3],[-54,4]],torn:[[-21,-18],[-32,-29]]};
const GOB_EAR_IN={bat:'M-6,2 Q-24,-16 -54,-48 Q-38,-18 -16,6',droop:'M-6,4 Q-32,-3 -64,12 Q-34,9 -12,10',torn:'M-6,2 Q-22,-14 -44,-36 Q-34,-14 -16,6'};
// the brow over the eye, a ridge of bone that scowls
const GOB_BROW=[[13,-13],[20,-21],[31,-24],[42,-17],[46,-10],[40,-10.5],[30,-15],[20,-12]];
const GOB_TUFTS='M-6,-37 L-2,-50 L2,-37 M8,-37 L16,-49 L15,-35 M-18,-33 L-24,-46 L-12,-35 M-28,-26 L-40,-34 L-28,-20';
const GOB_HAT={
  band:{knot:[[-30,-16],[-44,-22],[-52,-12],[-48,-2],[-56,8],[-44,4],[-36,-6],[-28,-8]],strip:[[38,-14],[38,-24],[-34,-20],[-36,-10]]},
  cap:{crown:[[38,-20],[35,-32],[22,-42],[4,-47],[-14,-45],[-28,-37],[-35,-25],[-30,-19],[-10,-26],[14,-27]],brim:[[34,-23],[58,-21],[60,-16],[35,-17]],badge:[22,-36]},
  hood:{crown:[[40,-16],[36,-32],[20,-45],[-4,-51],[-27,-45],[-42,-28],[-47,-6],[-42,14],[-33,28],[-22,26],[-28,10],[-27,-8],[-14,-24],[8,-29],[27,-26]]},
  goggles:{band:[[40,-17],[40,-28],[-36,-20],[-38,-10]],lens:[30,-24,7]}};
// how far a head drawn about h has to rise so its outline stays above the floor (a fallen goblin's jaw, a lizard's snout)
function headLift(h,pts,th,s,gy){const sn=Math.sin(th),cs=Math.cos(th);let m=-1e9;for(const [x,y] of pts)m=Math.max(m,(x*sn+y*cs)*s);return Math.max(0,h.y+m-gy(h.x)+.5);}
// the light and the sizes in a head's own frame (drawn s times the world's)
function headEnv(env,L,s){return{...env,L,rw:env.rw/s,k:env.k*s,litMin:(env.litMin||0)/s,planeMax:(env.planeMax||1e9)/s};}
// how thick a shape is at each point of its outline, straight in from the edge to the far side (for the shapes of a head, which are
// worked out once in its own frame, or for a head turned in the round)
function rayW(O,N,cap){const n=O.length,out=new Float32Array(n);
  for(let i=0;i<n;i++){const ox=O[i].x-N[i].x*.01,oy=O[i].y-N[i].y*.01,dx=-N[i].x,dy=-N[i].y;let best=cap;
    for(let j=0;j<n;j++){if(j===i||(j+1)%n===i)continue;const a=O[j],b=O[(j+1)%n],ex=b.x-a.x,ey=b.y-a.y,den=dx*ey-dy*ex;if(Math.abs(den)<1e-9)continue;
      const t=((a.x-ox)*ey-(a.y-oy)*ex)/den,s=((a.x-ox)*dy-(a.y-oy)*dx)/den;if(t>.05&&s>=0&&s<=1&&t<best)best=t;}
    out[i]=best;}return out;}
// a main shape round points (a skull, an ear, a cap), lit: its path, its outline and its thickness along it
function litShape(p,O,c0,r){const N=FigKit.normals(O);return{p,c:c0,r,lit:true,o:O,on:N,ow:rayW(O,N,r*2),inside:q=>FigKit.inPoly(O,q.x,q.y)};}
function headShape(key,pts,t,c0,r){return P2('o:'+key,()=>litShape(smooth(HP(pts),true,t),FigKit.curvePts(HP(pts),true,t,3).pts,c0,r));}
// hj (a turned goblin): {h, C0: the head and the chest as seen, fa, hy: the head's own turn}. Near the profile the profile drawing, a
// little narrower as it turns; further round, the head in the round (goblinHeadRound)
function goblinHead(c,F,sp,o,env,hj){
  const p=env.p||F.p,fa=hj?hj.fa:F.facing,C=sp.col,C0=hj?hj.C0:p[CHE],h=hj?hj.h:p[HEAD],v=sub(h,C0),thw=Math.atan2(v.x,-v.y)*.55,lod=env.lod,s=F.body.headR/33;
  if(hj&&Math.abs(Math.sin(hj.hy))>.42){goblinHeadRound(c,F,sp,o,env,h,thw,fa,hj.hy,s);return;}
  const back=hj?(Math.cos(hj.hy)<0?-1:1):(F.lookBack||o.lookBack?-1:1),sx=hj?.8+.2*Math.abs(Math.cos(hj.hy)):1;
  c.save();c.translate(h.x,h.y-headLift(h,GOB_SKULL[sp.nose],thw*fa*back,s,env.gy));c.scale(fa*back*sx,1);c.rotate(thw*fa*back);c.scale(s,s);
  const L=rot(V(env.L.x*fa*back,env.L.y),-thw*fa*back),he=headEnv(env,L,s);
  const pp=(key,pts,t)=>P2(key,()=>smooth(HP(pts),true,t??.45));
  // the skull and the ear take the light as the body does: a plane along the lit side, the rim only where the outline faces it
  const SK=headShape('gs:'+sp.nose,GOB_SKULL[sp.nose],.45,V(4,-2),38),EA=headShape('ge:'+sp.ear,GOB_EAR[sp.ear],.42,V(-26,-14),16),skull=SK.p,ear=EA.p;
  // the far ear's edge shows behind the skull
  c.save();c.translate(6,-3);paint(c,[EA],'skin',he,true);c.restore();
  const SU=paint(c,[SK],'skin',he,false,1,[V(10,-2),46,1.05]);
  if(lod>=1){c.fillStyle=C.mottle;c.globalAlpha=.7;c.beginPath();for(const [x,y,r] of [[-18,-18,7],[-4,-27,4.6],[-22,6,6],[10,-20,3.6],[-10,20,4]]){const xx=x+(sp.seed%5);c.moveTo(xx+r*1.3,y);c.ellipse(xx,y,r*1.3,r,.4,0,TAU);}c.fill();
    c.globalAlpha=1;c.fillStyle=C.wart;c.beginPath();for(const [x,y] of [[40,4],[16,-28],[-26,-6]]){c.moveTo(x+1.6,y);c.arc(x,y,1.6,0,TAU);}c.fill();
    // the bald crown takes a dull sheen
    if(lod>=2){const cs=add(V(-2,-20),mul(L,9)),g=c.createRadialGradient(cs.x,cs.y,0,cs.x,cs.y,24);g.addColorStop(0,rgba(C.skinHi,.42));g.addColorStop(1,rgba(C.skinHi,0));c.fillStyle=g;c.fill(skull);}
    // the creases of a hard life: across the brow, under the eye, from the nose down to the mouth, each with the light along its lip
    const CR=P2('gcr',()=>{const P=new Path2D();P.moveTo(9,-25);P.quadraticCurveTo(21,-30,33,-26);P.moveTo(21,-1.5);P.quadraticCurveTo(29,2.6,37,-1.5);P.moveTo(45,10);P.quadraticCurveTo(38,15,34,22);return P;});
    if(lod>=2){c.save();c.translate(0,1.5);c.strokeStyle=rgba(C.skinHi,.38);c.lineWidth=1.3;c.stroke(CR);c.restore();}c.strokeStyle=rgba(C.mottle,1);c.lineWidth=3.73;c.stroke(CR);
    if(lod>=2){c.lineWidth=1.1;c.beginPath();c.moveTo(13,-31);c.quadraticCurveTo(22,-34,30,-31.5);c.moveTo(21,-9);c.lineTo(14,-12);c.moveTo(21,-6.5);c.lineTo(13.5,-6.5);c.moveTo(21.5,-4);c.lineTo(15,-1.5);
      c.moveTo(40,-8);c.quadraticCurveTo(43,-6,44,-2.5);c.stroke();
      // stubble round the chin
      c.fillStyle=rgba('#0a0c08',.7);c.beginPath();for(const [x,y] of [[40,35],[44,37],[38,38.5],[47,34.5],[42,32.5],[35,36]]){c.moveTo(x+.75,y);c.arc(x,y,.75,0,TAU);}c.fill();}
    // a scar across the scalp, stitched shut
    if(sp.scar){c.strokeStyle=rgba('#c9b89a',.55);c.lineWidth=2.44;c.beginPath();c.moveTo(-16,-33);c.quadraticCurveTo(-6,-24,4,-15);c.stroke();
      c.lineWidth=1.1;c.strokeStyle=rgba('#0a0a08',.7);c.beginPath();for(const [x,y] of [[-12,-29],[-6,-23.5],[0,-18.5]]){c.moveTo(x-2.4,y+1.6);c.lineTo(x+2.4,y-1.6);}c.stroke();}
    // a few long hairs off the crown
    if(sp.hair&&(!sp.hat||sp.hat==='band'||sp.hat==='tufts')){c.strokeStyle='#14110d';c.lineWidth=1.3;c.beginPath();c.moveTo(-4,-37);c.quadraticCurveTo(-12,-50,-26,-52);c.moveTo(4,-38);c.quadraticCurveTo(0,-52,-9,-58);c.moveTo(-14,-34);c.quadraticCurveTo(-24,-42,-34,-40);c.stroke();}}
  // the near ear over the skull, big and veined, dark and fleshy inside, rings through its edge
  paint(c,[EA],'skin',he,false,1,[V(-26,-14),30,.8]);
  if(lod>=1){c.fillStyle=rgba(C.flesh,.75);c.fill(pp('gei2:'+sp.ear,GOB_EAR_INNER[sp.ear],.42));c.strokeStyle=C.mottle;c.lineWidth=3.79;c.stroke(P2('gei:'+sp.ear,()=>new Path2D(GOB_EAR_IN[sp.ear])));
    if(lod>=2){c.strokeStyle=rgba('#2a0e0c',.6);c.lineWidth=.9;c.beginPath();c.moveTo(-10,2);c.quadraticCurveTo(-20,-8,-26,-20);c.moveTo(-16,-4);c.quadraticCurveTo(-24,-4,-30,-12);c.stroke();}}
  if(sp.earring&&lod>=1){c.strokeStyle=C.brass;c.lineWidth=2.48;c.beginPath();c.arc(-30,10,4.4,0,TAU);c.stroke();}
  if(sp.rings&&lod>=1){c.strokeStyle=C.brass;c.lineWidth=2.58;for(const [x,y] of GOB_RINGS[sp.ear]){c.beginPath();c.arc(x,y,3,0,TAU);c.stroke();}if(lod>=2){c.strokeStyle=rgba(C.brassHi,.7);c.lineWidth=.8;for(const [x,y] of GOB_RINGS[sp.ear]){c.beginPath();c.arc(x,y,3,3.6,4.6);c.stroke();}}}
  // the mouth: dark between the lips, gums under the jagged underbite, tusks up out of the jaw
  const mouthPts=sp.nose==='snub'?[[33,24],[44,23]]:[[33,25],[44,24]];
  c.fillStyle='#0a0605';c.beginPath();c.moveTo(18,28);c.quadraticCurveTo(30,31.5,mouthPts[1][0]+1,mouthPts[1][1]);c.quadraticCurveTo(30,27.2,18,28);c.closePath();c.fill();
  c.strokeStyle='#0b0d09';c.lineWidth=3.76;c.beginPath();c.moveTo(18,28);c.quadraticCurveTo(28,30,mouthPts[1][0],mouthPts[1][1]);c.stroke();
  if(lod>=2){c.strokeStyle=rgba(C.skinHi,.45);c.lineWidth=1.2;c.beginPath();c.moveTo(20,31);c.quadraticCurveTo(31,33.4,44,28.6);c.stroke();
    c.strokeStyle=rgba(C.mottle,.9);c.lineWidth=1.5;c.beginPath();c.moveTo(18,4);c.quadraticCurveTo(13,15,17,25);c.stroke();
    {c.fillStyle=rgba('#0a0c08',.45);c.beginPath();for(const [x,y] of [[6,-14],[12,-9],[2,-4],[10,2],[-2,8],[6,12],[14,-2],[-8,-2],[0,18]]){c.moveTo(x+(sp.seed%4)+.6,y);c.arc(x+(sp.seed%4),y,.6,0,TAU);}c.fill();}}
  if(lod>=1){c.fillStyle=C.gum;c.beginPath();c.moveTo(22,29.2);c.quadraticCurveTo(33,31,46,26.4);c.lineTo(46,25);c.quadraticCurveTo(33,28.6,22,27.4);c.closePath();c.fill();}
  {const H=[6.4,4.6,7.4,3.8,6,5],gap=sp.gap%5,lean=[.3,-.4,.5,-.2,.2,-.5];c.fillStyle=C.tooth;c.beginPath();
    for(let i=0;i<5;i++){if(sp.teeth&&i===2)continue;if(lod>=1&&i===gap)continue;const x=22.6+i*4.9,y0=27.8-i*.5,hh=H[(i+sp.seed)%6],l=lean[(i+sp.seed)%6]*2;c.moveTo(x,y0+.6);c.lineTo(x+.6+l*.4,y0-hh*.7);c.quadraticCurveTo(x+2+l,y0-hh-.8,x+3.4+l*.5,y0-hh*.62);c.lineTo(x+4,y0+.6);c.closePath();}c.fill();
    if(lod>=1){c.fillStyle=rgba(C.toothShade,.75);c.beginPath();for(let i=0;i<5;i++){if((sp.teeth&&i===2)||i===gap)continue;const x=22.6+i*4.9,y0=27.8-i*.5,hh=H[(i+sp.seed)%6],l=lean[(i+sp.seed)%6]*2;c.moveTo(x+2.4,y0+.6);c.lineTo(x+2.6+l*.6,y0-hh*.6);c.lineTo(x+3.4+l*.5,y0-hh*.62);c.lineTo(x+4,y0+.6);c.closePath();}c.fill();}}
  if(sp.tusk){for(const [x,hgt] of [[46,15],[37,10]]){c.fillStyle=C.tooth;c.beginPath();c.moveTo(x-2.6,30);c.quadraticCurveTo(x-1.6,30-hgt*.6,x+1.4,30-hgt);c.quadraticCurveTo(x+1.2,30-hgt*.4,x+2.6,30);c.closePath();c.fill();
    c.fillStyle=C.toothShade;c.beginPath();c.moveTo(x+.6,30);c.quadraticCurveTo(x+.8,30-hgt*.4,x+1.4,30-hgt);c.lineTo(x+2.6,30);c.closePath();c.fill();
    if(lod>=1){c.strokeStyle=rgba('#fff4d8',.55);c.lineWidth=1.6;c.beginPath();c.moveTo(x-1.8,29);c.quadraticCurveTo(x-1.1,30-hgt*.55,x+1,30-hgt+.8);c.stroke();}}}
  // the brow, heavy, the nostril, a wart on the nose
  {const BR=headShape('gbrow',GOB_BROW,.4,V(30,-17),11);paint(c,[BR],'skin',he,false,1,[V(30,-18),12,1]);}
  c.strokeStyle='#0c0f0b';c.lineWidth=4.2;c.beginPath();c.moveTo(17,-13.5);c.quadraticCurveTo(30,-17,43,-10.5);c.stroke();
  c.fillStyle='#0a0c08';c.beginPath();c.ellipse(sp.nose==='long'?58:sp.nose==='snub'?46:53,9.5,2.6,1.6,.3,0,TAU);c.fill();
  if(lod>=1){c.strokeStyle=rgba(C.mottle,.9);c.lineWidth=3.7;c.beginPath();c.moveTo(38,-2);c.quadraticCurveTo(42,2,40,8);c.moveTo(22,-4);c.quadraticCurveTo(26,2,34,0);c.stroke();
    if(sp.wart){const wx=sp.nose==='long'?52:sp.nose==='snub'?44:48,wy=sp.nose==='snub'?2:0;c.fillStyle=C.skinHi;c.beginPath();c.arc(wx,wy,2.6,0,TAU);c.fill();c.fillStyle=rgba('#0a0c08',.7);c.beginPath();c.arc(wx+.6,wy+.4,.8,0,TAU);c.fill();}}
  // the eye: in a dark socket, a sick cyan sheen with a slit, a scowling lid over it; dull and dark once it is dead
  const E=V(29,-8),open=!!o.opening||!!F.opening;
  if(lod>=1){c.fillStyle='rgba(0,0,0,.32)';c.beginPath();c.ellipse(E.x-.5,E.y+.5,9.5,7,-.12,0,TAU);c.fill();}
  if(!F.dead){c.save();c.globalCompositeOperation='lighter';const r=open?13:6.5,g=c.createRadialGradient(E.x,E.y,0,E.x,E.y,r*1.7);
    g.addColorStop(0,open?'rgba(255,214,140,1)':rgba(C.eye,.7));g.addColorStop(.35,open?'rgba(255,193,99,.7)':rgba(C.eye,.25));g.addColorStop(1,rgba(C.eye,0));c.fillStyle=g;c.beginPath();c.arc(E.x,E.y,r*1.7,0,TAU);c.fill();c.restore();
    c.fillStyle=open?'#ffc163':C.eye;c.beginPath();c.ellipse(E.x,E.y,4.8,3.2,-.15,0,TAU);c.fill();
    if(lod>=1){c.strokeStyle=open?'rgba(160,90,20,.8)':rgba(mid(C.eye,'#0a1a14',.55),.9);c.lineWidth=1.8;c.beginPath();c.ellipse(E.x+.6,E.y,3.4,3.2,0,0,TAU);c.stroke();}
    c.fillStyle='#061410';c.beginPath();c.ellipse(E.x+1.6,E.y,1.15,3.3,0,0,TAU);c.fill();
    if(lod>=1){c.fillStyle='rgba(255,255,255,.85)';c.beginPath();c.arc(E.x-1.2,E.y-1.4,.9,0,TAU);c.fill();}}
  else{c.fillStyle='#3a4038';c.beginPath();c.ellipse(E.x,E.y,4.4,1.4,-.15,0,TAU);c.fill();}
  c.strokeStyle='#070906';c.lineWidth=3.76;c.beginPath();c.moveTo(22.5,-10.6);c.quadraticCurveTo(29,-13.6,35.6,-9.4);c.stroke();
  // what it wears on its head
  const H=sp.hat?GOB_HAT[sp.hat]:null;
  if(H&&H.crown){const CR=headShape('gh:'+sp.hat,H.crown,.42,V(4,-30),26);paint(c,[CR],sp.hat==='hood'?'hood':'cap',{...he,col:{...C,cap:C.cap,hood:C.hood,capFar:C.capShade,hoodFar:C.hood}},false,1,[V(4,-36),34,1]);
    if(H.brim){c.fillStyle=C.capShade;c.fill(pp('ghb:'+sp.hat,H.brim,.35));if(lod>=1){c.strokeStyle=rgba(C.rim,.35);c.lineWidth=2.38;c.beginPath();c.moveTo(36,-22.6);c.lineTo(57,-20.6);c.stroke();}}
    if(H.badge&&lod>=1){c.fillStyle=C.brass;c.beginPath();c.arc(H.badge[0],H.badge[1],3.4,0,TAU);c.fill();c.fillStyle=C.brassHi;c.beginPath();c.arc(H.badge[0]-.8,H.badge[1]-.8,1.2,0,TAU);c.fill();}
    if(sp.hat==='cap'&&lod>=1){c.strokeStyle=rgba('#000000',.55);c.lineWidth=3.53;c.beginPath();c.moveTo(-28,-29);c.quadraticCurveTo(4,-34,34,-25);c.stroke();}
    if(sp.hat==='hood'&&lod>=1){c.setLineDash([2.4,2]);c.strokeStyle=rgba('#a8946a',.5);c.lineWidth=2;c.beginPath();c.moveTo(-6,-50);c.quadraticCurveTo(-34,-36,-38,-6);c.stroke();c.setLineDash([]);
      if(lod>=2){c.strokeStyle=C.hood;c.lineWidth=1.2;c.beginPath();for(const [x,y] of [[38,-20],[36,-28],[31,-35]]){c.moveTo(x,y);c.lineTo(x+3.2,y+1.6);}c.stroke();}}
    // the ear pokes out through the hood
    if(sp.hat==='hood'){paint(c,[EA],'skin',he);if(lod>=1){c.fillStyle=rgba(C.flesh,.75);c.fill(pp('gei2:'+sp.ear,GOB_EAR_INNER[sp.ear],.42));}}
    if(sp.hat==='cap'&&lod>=1){c.strokeStyle='#05070b';c.lineWidth=3.55;c.beginPath();c.moveTo(-6,-44);c.quadraticCurveTo(2,-38,10,-44);c.stroke();}}
  if(sp.hat==='tufts'){c.strokeStyle=C.mottle;c.lineWidth=3.2;c.lineJoin='round';c.stroke(P2('gtufts',()=>new Path2D(GOB_TUFTS)));c.strokeStyle=rgba(C.rim,.5);c.lineWidth=1;c.stroke(P2('gtufts',()=>new Path2D(GOB_TUFTS)));}
  if(sp.hat==='band'){c.fillStyle=sp.band;c.fill(pp('ghbk',GOB_HAT.band.knot,.45));c.fill(pp('ghbs',GOB_HAT.band.strip,.3));c.fillStyle=rgba('#000000',.3);c.fill(pp('ghbs',GOB_HAT.band.strip,.3));c.fillStyle=sp.band;c.fill(pp('ghbs2',[[38,-16],[38,-23],[-34,-19],[-35,-13]],.3));
    if(lod>=2){c.fillStyle=rgba('#000000',.25);for(const [x,y] of [[-20,-17],[0,-19],[22,-19.5]]){c.beginPath();c.arc(x,y,1.4,0,TAU);c.fill();}}}
  if(H&&H.band){c.fillStyle=C.strap;c.fill(pp('ghg',H.band,.3));const [lx,ly,lr]=H.lens;c.fillStyle=C.brass;c.beginPath();c.arc(lx,ly,lr+2,0,TAU);c.fill();
    const g=c.createRadialGradient(lx-2,ly-2,0,lx,ly,lr);g.addColorStop(0,'#cfe9d8');g.addColorStop(.5,'#2b4a40');g.addColorStop(1,'#0b1612');c.fillStyle=g;c.beginPath();c.arc(lx,ly,lr,0,TAU);c.fill();
    if(lod>=1){c.fillStyle=C.brassShade||'#634a19';for(let i=0;i<6;i++){const a=i*TAU/6;c.beginPath();c.arc(lx+Math.cos(a)*(lr+1),ly+Math.sin(a)*(lr+1),.7,0,TAU);c.fill();}
      c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=1;c.beginPath();c.arc(lx,ly,lr*.62,3.5,4.4);c.stroke();}}
  c.restore();}

// ---------- a goblin's head in the round ----------
// Turned well away from the profile (in a spin) the head is built from its parts in three dimensions (FigKit.headModel): the bald
// skull with its long nose and jutting jaw, the great ears standing off it, a hood over it or a cap on it, tufts of hair; then the
// eyes in their sockets, the nose and the underbite with its tusks, each as squarely as it faces the viewer.
// (tufts of hair: the profile's down the middle of the crown, a shorter row either side)
const GOB_TUFT3=[[[-2,-37,0],[-2,-51,0],2.4],[[11,-36,0],[16,-49,0],2.4],[[-15,-34,0],[-24,-47,0],2.4],[[-28,-23,0],[-40,-34,0],2.2],[[-6,-35,13],[-8,-47,17],2.1],[[-22,-28,13],[-32,-38,17],2]];
const GHM={};
function gobHeadModel(sp){const key=[sp.nose,sp.ear,sp.hat].join('|');if(GHM[key])return GHM[key];
  const sk=GOB_SKULL[sp.nose],nose=sk.reduce((a,q)=>q[1]>-2&&q[1]<16&&q[0]>a[0]?q:a,[0,0]),ear={pts:GOB_EAR[sp.ear],root:[-4,4],out:sp.ear==='droop'?20:30,flare:6,base:25};
  const hair=sp.hat==='hood'?{line:[[0,-26],[.7,-22],[1.15,-4],[1.5,14],[2.1,24],[3.15,28]],puff:5}:sp.hat==='tufts'?{spikes:GOB_TUFT3}:null;
  const M=FigKit.headModel({skull:sk,w:1.12,cran:{c:[0,-10],r:[36,30,35]},ear,eye:[29,-8,15],
    facePts:[[20,8,25],[-8,28,24],[4,36,20],[26,38,15],[40,34,9],[30,-10,16],[22,-24,19],[8,-32,21],[nose[0]-14,nose[1],7],[nose[0]-24,nose[1]+2,10]],
    hair,hat:sp.hat==='cap'?{top:-48,base:-20,puff:3,brim:{len:22,w:.62,y:-21}}:null});
  // the fleshy inside of the ear, as far off the head as the ear is there; the nose, a wedge down the middle of the face
  const root=ear.root,far=GOB_EAR[sp.ear].reduce((a,q)=>Math.max(a,Math.hypot(q[0]-root[0],q[1]-root[1])),1);
  M.earIn=GOB_EAR_INNER[sp.ear].map(([f,y])=>{const d=Math.hypot(f-root[0],y-root[1])/far;return[f,y,ear.base*1.12+ear.out*d*d-1];});
  M.nose=[[36,-11,0],[40,-6,4],[48,-2,5],[56,3,5.4],[nose[0]-2,nose[1]+2,4],nose.concat(0),[nose[0]-4,nose[1]+4,4.6],[50,12,5.6],[44,9,6]].map(q=>q.length===3?q:[q[0],q[1],0]);
  M.noseTip=[nose[0],nose[1],0];return GHM[key]=M;}
function goblinHeadRound(c,F,sp,o,env,h,thw,fa,hy,s){
  const C=sp.col,lod=env.lod,M=gobHeadModel(sp),HV=FigKit.headView(M,hy),cs=Math.cos(hy),sn=Math.sin(hy),P3=q=>V(q[0]*cs+q[2]*sn,q[1]),Z3=q=>-q[0]*sn+q[2]*cs;
  c.save();c.translate(h.x,h.y);c.scale(fa,1);c.rotate(thw*fa);c.scale(s,s);
  const he=headEnv(env,rot(V(env.L.x*fa,env.L.y),-thw*fa),s),hood=sp.hat==='hood';
  const hairFill=Pth=>{if(!Pth)return;if(hood)paint(c,[{p:Pth,c:V(0,-12),r:30}],'hood',{...he,col:{...C,hoodFar:C.hood}});else{c.fillStyle=C.mottle;c.fill(Pth);}};
  // both ways round a point of the face: a side toward the viewer, or the middle of the face when the face is
  const seen=q=>Z3(q)>-1;
  // behind the head: the far ear, the back of a hood, the tufts behind
  for(const E of HV.earsBack)paint(c,[{p:E.p,c:V(-22,-14),r:18}],'skin',he,true);
  hairFill(HV.hairBack);
  // the skull and the face round it, lit as in profile
  {const O=FigKit.curvePts(HV.skullPts,true,.42,2).pts;paint(c,[litShape(HV.skull,O,V(4,-4),38)],'skin',he,false,1,[V(8,-4),46,1.05]);}
  // the eyes in their dark sockets, the heavy brow over each, a sick cyan sheen with a slit
  const open=!!o.opening||!!F.opening;
  for(const e of HV.eyes){if(e.face<.05)continue;const f=cl(e.face*1.5,.2,1),E=e.p;
    if(lod>=1){c.fillStyle='rgba(0,0,0,.32)';c.beginPath();c.ellipse(E.x-.5,E.y+.5,9.5*f,7,0,0,TAU);c.fill();}
    if(!F.dead){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=Math.min(1,.35+f*.75);const r=open?13:10,g=c.createRadialGradient(E.x,E.y,0,E.x,E.y,r*1.7);
      g.addColorStop(0,open?'rgba(255,214,140,1)':rgba(C.eye,1));g.addColorStop(.35,open?'rgba(255,193,99,.7)':rgba(C.eye,.5));g.addColorStop(1,rgba(C.eye,0));c.fillStyle=g;c.beginPath();c.arc(E.x,E.y,r*1.7,0,TAU);c.fill();c.restore();
      c.fillStyle=open?'#ffc163':C.eye;c.beginPath();c.ellipse(E.x,E.y,5.4*f,3.6,0,0,TAU);c.fill();c.fillStyle='#061410';c.beginPath();c.ellipse(E.x+.6*f,E.y,1.15*f,3.3,0,0,TAU);c.fill();}
    else{c.fillStyle='#3a4038';c.beginPath();c.ellipse(E.x,E.y,4.4*f,1.4,0,0,TAU);c.fill();}
    c.strokeStyle='#0c0f0b';c.lineWidth=5.2;c.beginPath();c.moveTo(E.x-8*f,E.y-6);c.quadraticCurveTo(E.x,E.y-13,E.x+8*f,E.y-7);c.stroke();}
  // the nose: a wedge down the middle of the face, lit, its nostrils under the tip
  if(Z3([1,0,0])>-.35){const pts=M.nose.flatMap(q=>q[2]?[P3(q),P3([q[0],q[1],-q[2]])]:[P3(q)]);
    paint(c,[piece(FigKit.hull(pts),.4)],'skin',he,false,1,[P3(M.noseTip),14,.9]);
    c.fillStyle='#0a0c08';for(const sd of [1,-1]){const q=[M.noseTip[0]-9,M.noseTip[1]+2,2.6*sd];if(!seen(q))continue;const z=P3(q);c.beginPath();c.ellipse(z.x,z.y,1.8,1.3,0,0,TAU);c.fill();}}
  // the mouth across the lower face, the underbite's crooked teeth up out of it, the tusks
  {const mp=[];for(let i=0;i<=10;i++){const t=i/5-1,q=[44-22*t*t,27+.6*t*t,17*t];mp.push({q,p:P3(q),v:seen(q)});}
    c.strokeStyle='#0b0d09';c.lineWidth=2.4;c.beginPath();let on=false;for(const m of mp){if(!m.v){on=false;continue;}if(!on){c.moveTo(m.p.x,m.p.y);on=true;}else c.lineTo(m.p.x,m.p.y);}c.stroke();
    if(lod>=1){c.fillStyle=C.tooth;c.beginPath();for(let i=1;i<10;i++){const m=mp[i];if(!m.v||(i+sp.seed)%4===0)continue;const hh=3+((i*7+sp.seed)%3);c.moveTo(m.p.x-1.4,m.p.y+.4);c.lineTo(m.p.x,m.p.y-hh);c.lineTo(m.p.x+1.4,m.p.y+.4);c.closePath();}c.fill();}
    if(sp.tusk)for(const [f,l,hg] of [[45,6,13],[36,12,9]])for(const sd of [1,-1]){const q=[f,30,l*sd];if(!seen(q))continue;const b=P3(q);
      c.fillStyle=C.tooth;c.beginPath();c.moveTo(b.x-2.4,b.y);c.quadraticCurveTo(b.x-1.4,b.y-hg*.6,b.x+.8,b.y-hg);c.quadraticCurveTo(b.x+1.2,b.y-hg*.4,b.x+2.4,b.y);c.closePath();c.fill();}}
  // the hood or the tufts over the skull, the ears toward the viewer (through the hood), the cap, a band, the goggles
  hairFill(HV.hairFront);
  for(const E of HV.earsFront){paint(c,[{p:E.p,c:V(-24,-14),r:18}],'skin',he,false,1,[P3([-26,-14,30*E.sd]),30,.8]);
    if(lod>=1&&Math.abs(cs)>.08){c.globalAlpha=.75*Math.min(1,Math.abs(cs)*1.6);c.fillStyle=C.flesh;c.fill(FigKit.loopPath(M.earIn.map(([f,y,l])=>P3([f,y,l*E.sd])),.42));c.globalAlpha=1;}}
  const HT=HV.hat;
  if(HT){paint(c,[{p:HT.crown,c:V(0,-34),r:26}],'cap',{...he,col:{...C,capFar:C.capShade}},false,1,[V(0,-36),34,1]);if(HT.brim){c.fillStyle=C.capShade;c.fill(HT.brim);}
    const bq=[22,-36,0];if(lod>=1&&Z3(bq)>0){const b=P3(bq);c.fillStyle=C.brass;c.beginPath();c.arc(b.x,b.y,3.4,0,TAU);c.fill();}}
  // (a band or the goggles' strap: a band round the skull, the front of it as seen; the goggles' lenses on the brow)
  if(sp.hat==='band'||sp.hat==='goggles'){const cr=M.cran,r=[cr.r[0]+1.5,cr.r[1]+1.5,cr.r[2]+1.5],po=y=>Math.acos(cl((cr.c[1]-y)/r[1],-1,1)),[y0,y1]=sp.hat==='band'?[-24,-14]:[-28,-18];
    const B=FigKit.ellPatch(cr.c,r,-Math.PI,Math.PI,po(y0),po(y1),cs,sn,18,1);if(B.front){c.fillStyle=sp.hat==='band'?sp.band:C.strap;c.fill(B.front);}
    if(sp.hat==='band'){const kq=[-38,-18,0],k=P3(kq);if(Z3(kq)>-4){c.fillStyle=sp.band;c.beginPath();c.ellipse(k.x,k.y,6*Math.max(.3,Math.abs(cs)),5,0,0,TAU);c.fill();}}
    else for(const sd of [1,-1]){const q=[30,-24,11*sd];if(Z3(q)<-2)continue;const z=P3(q),rx=7*Math.max(.35,Math.abs(Math.sin(Math.atan2(11*sd,30)-hy))),ry=7;
      c.fillStyle=C.brass;c.beginPath();c.ellipse(z.x,z.y,rx+2,ry+2,0,0,TAU);c.fill();const g=c.createRadialGradient(z.x-2,z.y-2,0,z.x,z.y,ry);g.addColorStop(0,'#cfe9d8');g.addColorStop(.5,'#2b4a40');g.addColorStop(1,'#0b1612');c.fillStyle=g;c.beginPath();c.ellipse(z.x,z.y,rx,ry,0,0,TAU);c.fill();}}
  c.restore();}

// ---------- the lizard-man ----------
// the plates of his back, from the base of the neck to the hips, and the scales at the knees, the forearms and the jaw
function lizard(c,F,sp,o,env){
  const C=sp.col,p0=env.p||F.p,fa=F.facing,b=F.body,now=env.now,lod=env.lod,P0=p0[PEL],u=nrm(sub(p0[CHE],P0)),n=mul(perp(u),fa),T=len(sub(p0[CHE],P0)),sz=env.sz,W=w=>w*sz;
  const at=(a,s)=>add(add(P0,mul(u,a)),mul(n,s*sz)),P=Q=>Q.map(([a,s])=>at(a,s)),fr={P0,u,n,T,at,P};
  const pt=(ps,mat,far,fm)=>paint(c,ps,mat,env,far,1,fm);
  // hide: the shapes painted as hide, the scales laid along the stretches of them given (parts)
  const hide=(ps,far,big,fc,frr,parts)=>{const U=pt(ps,'hide',far,fc?[fc,frr,1]:null);scales(c,U,parts||ps,env,far,big,true);return U;};
  const armed=F.wp?!F.wp.unarmed:!!F.weaponKey,tipDir0=nrm(sub(p0[TIP],p0[HAF]));
  const offOnGrip=(()=>{if(!armed)return false;const h=p0[HAB],a=sub(p0[HAF],mul(tipDir0,(F.wp&&F.wp.butt||9)+4)),bq=p0[TIP],ab=sub(bq,a),t=cl(dot(sub(h,a),ab)/(dot(ab,ab)||1),0,1);return len(sub(h,add(a,mul(ab,t))))<7;})();
  // (turned: p is where each joint is seen, fv the way he seems to face, nS across his spine toward that)
  const TV=env.yaw?turnOf(c,F,env,'lizard',fr,offOnGrip,env.yaw):null,TN=!!TV,p=TN?TV.p:p0,fv=TN?TV.fv:fa;
  const C0=p[CHE],uS=TN?nrm(sub(p[CHE],p[PEL])):u,nS=mul(perp(uS),fv),sh0=at(T-4,-2.6),SH=TN?TV.SH(sh0):[sh0,sh0],HIP=TN?TV.HIP:[P0,P0];
  const tipV=sub(p[TIP],p[HAF]),tipDir=!TN||len(tipV)>6?nrm(tipV):nrm(sub(p[HAF],p[ELF]));
  const across=TN?TV.across:(l,fn)=>fn();
  const foldHide={lit:rgba(C.sheenA,.3),dark:'rgba(0,0,0,.55)'},foldHideFar={lit:rgba(C.sheenA,.12),dark:'rgba(0,0,0,.3)',far:true};
  // ----- the arms: each one heavy shape from the shoulder (its mass riding with the arm) to the wrist, a horn of bone at the elbow;
  // hooked spines down the back of the forearm, leather at the wrist, war paint, a clawed hand of four fingers; a pauldron over the
  // near shoulder -----
  const armParts=(E,H,S)=>{const fd=nrm(sub(H,E)),Hh=sub(H,mul(fd,2.2*sz)),ud=nrm(sub(E,S)),S0=add(S,add(mul(uS,cl(dot(ud,uS),0,1)*2*sz),mul(ud,.8*sz))),d0=nrm(sub(E,S0));
    const fA=bendA([S0,E,Hh],1,V(fv,0));
    const tb=FigKit.tube([S0,E,Hh],[W(6.4),W(5.2),W(3.1)],{cap0:1.32,prof:[orient(MUS.liz.up,fA),orient(MUS.liz.lo,fA)],gather:.3,stretch:.08,lite:lod===0});
    let ko=sub(d0,fd);const bent=cl(len(ko)/1.2,0,1);if(len(ko)<.3){ko=perp(d0);if(dot(ko,V(-fv,.6))<0)ko=mul(ko,-1);}ko=nrm(ko);
    // the point of the elbow, a horn of bone along the line of the upper arm
    const el=spur(add(E,mul(ko,W(2.8))),nrm(add(mul(ko,.7),mul(d0,.6))),fd,W(2.6),W(3.4+2.6*bent),-.2);
    return{tb,el,E,H,fd,Hh,S:S0,ko};};
  const arm=(A,far,holds)=>{hide([A.tb,A.el],far,false,mix(A.E,A.S,.3),W(26),[seg(A.S,A.E,W(13.4),W(10.4)),seg(A.E,A.Hh,W(11),W(6.6))]);foldsAt(c,A.tb,env,far?foldHideFar:foldHide);
    const d=nrm(sub(A.Hh,A.E)),q0=perp(d),q=dot(q0,A.ko)>0?q0:mul(q0,-1);
    // a ridge of hooked spines down the back of the forearm, swept toward the elbow
    ridge(c,[0,1,2].map(i=>{const t=.22+i*.22;return[add(mix(A.E,A.Hh,t),mul(q,W(lerp(4.6,3.2,t)))),q,d,W(lerp(4.4,2.8,t)),W(lerp(3.4,2.2,t)),-.6];}),env,C,far);
    // leather wound round the wrist
    {const w0=mix(A.E,A.Hh,.74),w1=mix(A.E,A.Hh,.96),h0=W(3.9),h1=W(3.5),Q=[add(w0,mul(q0,h0)),add(w1,mul(q0,h1)),sub(w1,mul(q0,h1)),sub(w0,mul(q0,h0))];pt([piece(Q,.15)],'leather',far,null);
      if(!far&&lod>=1){c.strokeStyle=rgba('#000000',.5);c.lineWidth=Math.max(1.5,.95*sz);c.beginPath();const m=mix(w0,w1,.5);c.moveTo(m.x+q0.x*h0+d.x*W(1.4),m.y+q0.y*h0+d.y*W(1.4));c.lineTo(m.x-q0.x*h0-d.x*W(1.4),m.y-q0.y*h0-d.y*W(1.4));c.stroke();}}
    // ochre war paint across the upper arm
    if(sp.paint&&!far&&lod>=1){const dU=nrm(sub(A.E,A.S)),qU=perp(dU);c.strokeStyle=rgba(C.paint,.62);c.lineWidth=W(1.3);c.beginPath();for(const t of [.3,.44,.58]){const m=mix(A.S,A.E,t),hw=W(4.4)*lerp(1,.82,t);c.moveTo(m.x+qU.x*hw,m.y+qU.y*hw);c.lineTo(m.x-qU.x*hw+dU.x*W(1.4),m.y-qU.y*hw+dU.y*W(1.4));}c.stroke();}
    claw(c,A.H,holds?tipDir:A.fd,sz*1.32,env,'hide',far,4,holds,3.8);};
  // a pauldron: three curved iron lames over the round of the near shoulder, stepping down the arm, the top one the biggest with a
  // horn of iron off it; strapped under the arm
  const pauldron=(A,far)=>{const sh=A.S,d=nrm(sub(A.E,sh)),q=perp(d),sd=dot(q,nS)>0?1:-1,qq=mul(q,sd),Z=(a,b2)=>add(sh,add(mul(d,a*sz),mul(qq,b2*sz)));
    line(c,[Z(11,-6.2),Z(16,-2),Z(17,3.6)],C.leather,Math.max(1.5,1.7*sz));
    for(const [a0,a1,wd] of [[3.4,9,5],[-.4,5.6,5.8],[-4.6,2,6.4]]){const Qp=[Z(a0,-wd),Z(a0-3,-wd*.45),Z(a0-3.8,0),Z(a0-3,wd*.5),Z(a0,wd*1.02),Z(a1,wd*.92),Z(a1+1.5,0),Z(a1,-wd*.92)];
      const PL=piece(Qp,.42,true);pt([PL],'iron',far,[PL.c,W(8),1.1]);
      if(!far){c.strokeStyle=rgba(C.rust,.5);c.lineWidth=Math.max(1,1*sz);c.stroke(PL.p);if(lod>=2)dots(c,[-.55,.55].map(t=>[Z(a1-1.4,wd*t),.8*sz]),C.brassShade);}}
    {const b0=Z(-5,-3.2),t0=Z(-11.2,-8),b1=Z(-2.4,-6.2),k0=Z(-8.4,-3.8);c.fillStyle=far?C.ironFar:C.iron;c.beginPath();c.moveTo(b0.x,b0.y);c.quadraticCurveTo(k0.x,k0.y,t0.x,t0.y);c.lineTo(b1.x,b1.y);c.closePath();c.fill();
      if(!far&&lod>=1){c.strokeStyle=rgba(C.ironHi,.5);c.lineWidth=Math.max(1,.9*sz);c.beginPath();c.moveTo(b1.x,b1.y);c.lineTo(t0.x,t0.y);c.stroke();}}};
  const farArm=far=>{arm(armParts(p[ELB],p[HAB],SH[1]),far,offOnGrip);if(o.afterFarArm)across(TN?TV.LAT[HAB]:0,()=>o.afterFarArm(F));};
  const nearArm=far=>{if(armed&&o.drawOther)across(TN?TV.LAT[HAF]:0,()=>o.drawOther(F));const AF=armParts(p[ELF],p[HAF],SH[0]);arm(AF,far,armed);pauldron(AF,far);};
  // ----- the legs: each one shape from the hip down the heavy thigh, the shin back to a hock and the long shank down to the ball of
  // the foot; a scute on the knee, a heel of bone at the hock, the toes forward to the claws -----
  const leg=(kn,ft,side,far)=>{const K=p[kn],A=p[ft],hip=HIP[side>0?0:1],hk0=hockOf(P0,p0[kn],p0[ft],fa,.4,.25),hock=TN?TV.VW.at(hk0,side*TV.LH):hk0;
    const td=nrm(sub(K,hip)),sd=nrm(sub(hock,K)),md=nrm(sub(A,hock)),kA=bendA([hip,K,hock],1,V(-fv,0));
    const tb=FigKit.tube([hip,K,hock,A],[W(7.6),W(4.8),W(2.8),W(2.2)],{gather:.26,stretch:.08,prof:[orient(MUS.liz.th,!kA),orient(MUS.liz.sh,!kA),MUS.liz.mt],lite:lod===0});
    let ko=sub(td,sd);if(len(ko)<.3){ko=perp(td);if(dot(ko,V(fv,0))<0)ko=mul(ko,-1);}ko=nrm(ko);
    let ho=sub(sd,md);if(len(ho)<.2)ho=mul(ko,-1);ho=nrm(ho);
    // the hock: a heel of bone out behind, where the shank meets the shin
    const heel=spur(add(hock,mul(ho,W(1.4))),nrm(add(ho,mul(sd,.6))),sd,W(2.3),W(4.4),.1);
    hide([tb,heel],far,true,mix(hip,hock,.4),W(32),[seg(hip,K,W(15),W(10)),seg(K,hock,W(9.6),W(5.6)),seg(hock,A,W(5.4),W(4.4))]);foldsAt(c,tb,env,far?foldHideFar:foldHide);
    // a horny scute over the knee
    {const Z=(a,b2)=>add(K,add(mul(ko,a*sz),mul(sd,b2*sz))),KP=piece([Z(2.6,-3.8),Z(4.4,-.4),Z(3.6,2.8),Z(1.2,4.2),Z(-.4,.8)],.32);pt([KP],'hide',far);
      if(!far&&lod>=1){c.strokeStyle=rgba(C.rim,.42);c.lineWidth=Math.max(1,.8*sz);c.beginPath();const a=Z(2.6,-4),b2=Z(4.4,-.6),e=Z(3.8,3);c.moveTo(a.x,a.y);c.quadraticCurveTo(b2.x,b2.y,e.x,e.y);c.stroke();}}
    if(!far&&lod>=1){const q=perp(sd);if(lod>=2){c.strokeStyle=rgba('#000000',.42);c.lineWidth=Math.max(.35,.55*sz);c.beginPath();for(const t of [.38,.58,.78]){const m=mix(K,hock,t),hw=W(lerp(9,6.4,t))*.46;c.moveTo(m.x+q.x*hw,m.y+q.y*hw);c.quadraticCurveTo(m.x+sd.x*W(1.2),m.y+sd.y*W(1.2),m.x-q.x*hw,m.y-q.y*hw);}c.stroke();}
      if(sp.paint){const td=nrm(sub(K,hip)),tq=perp(td);c.strokeStyle=rgba(C.paint,.55);c.lineWidth=W(1.4);c.beginPath();for(const t of [.4,.56]){const m=mix(hip,K,t),hw=W(12.8)*.42;c.moveTo(m.x+tq.x*hw,m.y+tq.y*hw);c.lineTo(m.x-tq.x*hw+td.x*W(1.6),m.y-tq.y*hw+td.y*W(1.6));}c.stroke();}}
    // the toes (turned: drawn in profile and seen turned)
    const foot=()=>toes(c,TN?p0[ft]:A,nrm(sub(TN?p0[ft]:A,TN?hk0:hock)),env,'hide',far,{s:sz*1.05,n:3,toe:11.5,tw:1.3,fan:.55,claw:4.8,dew:4.6,pad:3});
    if(TN)across(side*TV.LH,foot,.38);else foot();};
  // ----- the seat: the weight of his hips, both thighs going into it -----
  const seat=()=>{const dk=nrm(add(sub(p0[KNF],P0),sub(p0[KNB],P0))),crotch=add(P0,mul(dk,6*sz));
    if(!TN){hide([piece([at(T*.12,-10.4),at(-T*.06,-10.8),add(at(-T*.14,-8.4),mul(dk,2*sz)),crotch,add(at(-T*.14,9),mul(dk,2*sz)),at(-T*.04,11.2),at(T*.12,11.6)],.45,true)],false,true,P0,W(16),[seg(at(T*.12,0),crotch,W(22),W(14))]);return;}
    const pts=[TV.VW.at(crotch,0)];for(const a of [T*.06,-T*.08]){const R=TV.secAt(a),sc=(R[0]+R[1])/2,Dd=(R[1]-R[0])/2;for(let i=0;i<12;i++){const t=i/12*TAU;pts.push(TV.VW.at(at(a,sc+Dd*Math.cos(t)),R[2]*Math.sin(t)*sz));}}
    for(const hp of HIP)pts.push(add(hp,V(0,4*sz)));
    hide([piece(FigKit.hull(pts),.4,true)],false,true,TV.VW.at(P0,0),W(16),[seg(TV.VW.at(at(T*.12,0),0),TV.VW.at(crotch,0),W(22),W(14))]);};
  // ----- the tail: the game's own chain when it runs one, else his own; out of the small of his back, heavy, down to the floor
  // (turned: along the line down the middle of him, as it is seen) -----
  let tailQ=null,tailN=TAIL.N,tailCut=null;
  if(!DBG.noTail){const tl=F.tail;
    if(tl&&tl.q&&tl.q.length>1){tailN=tl.N||TAIL.N;tailCut=tl.cut!=null?tl.cut:null;tailQ=tailCut!=null?tl.q.slice(0,tailCut+1):tl.q;}
    else{const root=at(TAIL.root[0]*T,TAIL.root[1]);tailQ=tailStep(F,root,mul(n,-1),mul(u,-1),(b.tall||210)*TAIL.len,tailN,env.gy,now,F.dead||F.downed||F.motor<.3,t=>tailW(t,sz)/2);}}
  const dTail=TN&&tailQ?tailQ.reduce((s2,q)=>s2+TV.dp(q,0),0)/tailQ.length:0;
  const tail=()=>{if(!tailQ||tailQ.length<2)return;const Q=tailQ,N=tailN,cut=tailCut;
    const R=resample(Q.map(q=>TN?TV.VW.at(q,0):V(q.x,q.y)),3),m=R.length,kept=(Q.length-1)/N,ts=R.map((_,j)=>j/(m-1)*kept);
    // (seen end on, the tail coming straight at the viewer or going straight away, it is the round of it)
    if(TN){let ext=0;for(const q of R)ext=Math.max(ext,len(sub(q,R[0])));const w0=tailW(0,sz);if(ext<w0*1.5)pt([oval(mix(R[0],R[m-1],.35),w0*.5,w0*.46,0)],'hide',false,[R[0],w0,.9]);}
    const TP=tailBody(c,R,ts,env,sp,{endCut:cut!=null&&cut<N});
    // the strike: the tail smeared along its sweep and a few speed lines while it moves fastest
    const act=F.tailAct;if(act&&act.ti!=null&&lod>=1&&!DBG.noSmear){const w=.17,dT=Math.abs(now-act.ti);if(dT<w){const al=1-dT/w;
      c.save();c.globalCompositeOperation='lighter';c.globalAlpha=al*.1;c.fillStyle=C.rim;for(const dy of [-2.6,2.6]){c.save();c.translate(0,W(dy));c.fill(TP);c.restore();}c.restore();
      c.strokeStyle=rgba(C.rim,.32*al);c.lineWidth=Math.max(.4,.6*sz);c.beginPath();for(const [f0,f1,o2] of [[.35,.8,-.8],[.5,.95,.9],[.62,1,0]]){const i0=Math.round(f0*(m-1)),i1=Math.round(f1*(m-1));const a0=R[i0],a1=R[i1];c.moveTo(a0.x,a0.y+W(o2*4));c.lineTo(a1.x,a1.y+W(o2*4));}c.stroke();}}};
  // ----- a war-kilt of leather strips on a broad belt, the trophies hung from it (turned: the strips round his hips, those on the
  // far side behind his legs) -----
  const dn=nrm(add(mul(nrm(add(sub(p0[KNF],P0),sub(p0[KNB],P0))),.7),V(0,.3))),ln=T*.56;
  // a strip of leather cut to a point, its end on the floor when the floor is in the way
  const strip=(a0,e,w)=>{const fl=env.gy(e.x)-W(2.6);if(e.y>fl)e=V(e.x+(e.y-fl)*.6*Math.sign(e.x-a0.x||1),fl);const d=nrm(sub(e,a0)),q=perp(d),L=len(sub(e,a0)),w0=W(w),w1=W(w*.74);
    const P=piece([add(a0,mul(q,w0/2)),add(add(a0,mul(d,L*.55)),mul(q,w0*.47)),add(add(a0,mul(d,L*.86)),mul(q,w1/2)),e,add(add(a0,mul(d,L*.88)),mul(q,-w1/2)),add(add(a0,mul(d,L*.55)),mul(q,-w0*.48)),sub(a0,mul(q,w0/2))],.22);P.a=a0;P.b=e;return P;};
  const KL=[1,.84,.97,.78,.9];
  const kilt=which=>{const S=[];
    if(!TN){if(which<0)return;for(let i=0;i<5;i++){const sOff=lerp(-10,11,i/4),a0=at(0,sOff);S.push(strip(a0,add(a0,mul(dn,ln*KL[i])),4.9));}}
    else{const R=TV.secAt(0),sc=(R[0]+R[1])/2,Dd=(R[1]-R[0])/2;
      for(let k=0;k<9;k++){const t=k/9*TAU,top=at(0,sc+Dd*Math.cos(t)),l=R[2]*Math.sin(t)*sz;if((TV.dp(top,l)<0)!==(which<0))continue;
        S.push(strip(TV.VW.at(top,l),TV.VW.at(add(top,mul(dn,ln*KL[k%5])),l*1.12),4.9));}}
    if(!S.length)return;pt(S,'leather',TN&&which<0,[TN?TV.VW.at(at(-T*.2,0),0):at(-T*.2,0),W(16),.9]);if(lod>=1)dots(c,S.map(s2=>[mix(s2.a,s2.b,.22),.95*sz]),C.stud);};
  const belt=()=>layer(c,env,TV,fr,null,g=>{pt([piece(g.P([[T*.12,-11.8],[T*.12,12.8],[-T*.04,12.4],[-T*.04,-11.4]]),.25)],'leather');
    if(g.side>=0){const bk=g.at(T*.04,11.8);if(!bk.h){c.strokeStyle=C.iron;c.lineWidth=Math.max(1.5,1.6*sz);c.beginPath();c.arc(bk.x,bk.y,2.8*sz,0,TAU);c.stroke();if(lod>=1){c.strokeStyle=rgba(C.ironHi,.5);c.lineWidth=Math.max(1,.8*sz);c.beginPath();c.arc(bk.x,bk.y,2.8*sz,3.6,4.8);c.stroke();}}}});
  const skH=TN&&TV.near(T*.02,10.4).h,skulls=()=>{if(!DBG.noTrophy)lizSkulls(c,F,sp,env,TN?TV.near:at,T,u);};
  // ----- the spines down his back, rooted under the torso's edge (turned: a row of them down the middle of his back) -----
  const plates=()=>{const L=[];for(let i=0;i<8;i++){const f=lerp(1.02,.04,i/7),a=T*f,sb=backAt('lizard',T,a);
      L.push([at(a,sb+2),mul(n,-1),u,T*.19,W(lerp(7,4.4,i/7)),-.36]);}
    ridge(c,L,env,C,false,TN?TV:null);};
  // ----- the torso: a barrel of a chest under the hump of his shoulders, the bony bumps along the back; the belly plates down the
  // front; a harness of leather strapped over him -----
  const torso=()=>{
    layer(c,env,TV,fr,g=>({ps:[piece(g.P(TORSO.lizard(T)),.42,true)],mat:'hide',fm:[g.at(T*.55,0),W(22),1]}),(g,TU)=>{
      scales(c,TU,[{a:g.at(0,0),b:g.at(T,0),wa:W(22),wb:W(24),c:g.at(T*.5,0),r:W(16)}],env,false,true,false,g.side<0&&TV&&TV.copies.length>1);
      if(lod>=2&&DBG.osteo){const OS=new Path2D(),HL=new Path2D();const rows=[3.6,7];for(const [ri,dd] of rows.entries()){for(let j=0;j<6;j++){const f=lerp(.88,.18,j/5)+(ri%2?.05:0),a=T*f,sb=backAt('lizard',T,a)+dd,q=g.at(a,sb),r=W(lerp(1.3,.9,j/5));if(q.h)continue;
          OS.moveTo(q.x+r*1.3,q.y);OS.ellipse(q.x,q.y,r*1.3,r,Math.atan2(uS.y,uS.x),0,TAU);HL.moveTo(q.x+env.L.x*r*.5+r*.4,q.y+env.L.y*r*.5);HL.arc(q.x+env.L.x*r*.5,q.y+env.L.y*r*.5,r*.4,0,TAU);}}
        c.fillStyle=C.osteo;c.fill(OS);if(lod>=2){c.strokeStyle=rgba('#000000',.3);c.lineWidth=Math.max(.3,.35*sz);c.stroke(OS);}c.fillStyle=rgba(C.rim,.3);c.fill(HL);}});
    // the belly plates down the front
    layer(c,env,TV,fr,g=>{const BP=piece(g.P([[T*.94,10.6],[T*.74,15.4],[T*.5,14.6],[T*.24,11.8],[-T*.04,7],[T*.06,5],[T*.34,8.4],[T*.62,10],[T*.86,8.6]]),.4,true);return{ps:[BP],mat:'belly',fm:[BP.c,W(10),.8]};},g=>{
      c.strokeStyle=rgba('#000000',.34);c.lineWidth=Math.max(.93,1.49*sz);c.beginPath();for(let i=1;i<8;i++){const a=T*i/8.2,q0=g.at(a,lerp(6.6,9.4,a/T)),q1=g.at(a+T*.02,lerp(11,15,Math.sin(Math.PI*(i/8.2+.08))));if(q0.h||q1.h)continue;c.moveTo(q0.x,q0.y);c.lineTo(q1.x,q1.y);}c.stroke();});
    // a harness: a broad strap over the near shoulder and down across his chest to the belt, another round his ribs, an iron ring
    // where they cross, a few studs
    if(!DBG.noArmour)layer(c,env,TV,fr,null,g=>{
      const S1=resample(g.P([[T*1.04,-9],[T*.86,-1.4],[T*.66,7.4],[T*.44,13.4],[T*.3,14.6]]),2),R1=resample(g.P([[T*.6,-14.8],[T*.6,-7],[T*.6,1],[T*.6,9],[T*.6,15.6]]),2);
      lineSeen(c,R1,C.leather,W(3.4));lineSeen(c,S1,C.leather,W(4.6));
      if(lod>=1&&g.side>=0){lineSeen(c,S1.map(q=>{const r=add(q,mul(env.L,W(1.6)));r.h=q.h;return r;}),rgba(C.rim,.22),Math.max(1,.8*sz));
        dots(c,[[T*.94,-5.4],[T*.78,2.6],[T*.38,13.8]].map(([a,s2])=>[g.at(a,s2),1*sz]).filter(d=>!d[0].h),C.stud);}
      const rq=g.at(T*.62,8.2);if(!rq.h&&g.side>=0){c.strokeStyle=C.iron;c.lineWidth=Math.max(1.5,1.7*sz);c.beginPath();c.arc(rq.x,rq.y,3.2*sz,0,TAU);c.stroke();
        if(lod>=1){c.strokeStyle=rgba(C.ironHi,.55);c.lineWidth=Math.max(1,.8*sz);c.beginPath();c.arc(rq.x,rq.y,3.2*sz,3.5,5);c.stroke();}}});};
  // ----- the neck, thick, spined behind and folded under the jaw, and the brass collar -----
  const neckPlates=()=>{if(F.severed)return;const C00=p0[CHE],H0=p0[HEAD],nd=nrm(sub(H0,C00)),nq0=perp(nd),bk=dot(nq0,n)>0?-1:1,nq=mul(nq0,bk),L=[];
    for(let i=0;i<4;i++){const t=.1+i*.21;L.push([add(mix(C00,H0,t),mul(nq,W(7.4-i*.5))),nq,nd,W(7.4-i*.6),W(5.4-i*.5),-.36]);}
    ridge(c,L,env,C,false,TN?TV:null);};
  const neck=()=>{if(F.severed)return;const nd=nrm(sub(p[HEAD],C0)),nq0=perp(nd),bk=dot(nq0,nS)>0?-1:1,nq=mul(nq0,bk);
    const n0=add(C0,mul(uS,-4)),n1=mix(C0,p[HEAD],.74),nk=FigKit.tube([n0,n1],[W(8.8),W(6.9)],{lite:lod===0});hide([nk],false,true,mix(C0,p[HEAD],.4),W(11),[seg(n0,n1,W(17),W(13.6))]);
    if(lod>=2){c.strokeStyle=rgba('#000000',.45);c.lineWidth=Math.max(.35,.55*sz);c.beginPath();for(const t of [.5,.62,.74]){const m=add(mix(C0,p[HEAD],t),mul(nq,-W(5.4))),e=add(m,add(mul(nq,W(3.2)),mul(nd,-W(1.4))));c.moveTo(m.x,m.y);c.quadraticCurveTo(m.x+nq.x*W(1.8)+nd.x*W(.4),m.y+nq.y*W(1.8)+nd.y*W(.4),e.x,e.y);}c.stroke();}
    const cA=mix(C0,p[HEAD],.16),cB=mix(C0,p[HEAD],.36),cn=perp(nrm(sub(p[HEAD],C0))),wc=W(18.6)/2,CL=new Path2D();
    CL.moveTo(cA.x+cn.x*wc,cA.y+cn.y*wc);CL.lineTo(cB.x+cn.x*wc,cB.y+cn.y*wc);CL.lineTo(cB.x-cn.x*wc,cB.y-cn.y*wc);CL.lineTo(cA.x-cn.x*wc,cA.y-cn.y*wc);CL.closePath();
    const cO=[];for(const [a,s2] of [[0,1],[.5,1],[1,1],[1,0],[1,-1],[.5,-1],[0,-1],[0,0]])cO.push(add(mix(cA,cB,a),mul(cn,wc*s2)));
    pt([band(CL,cO,cO.map(()=>len(sub(cB,cA))),mix(cA,cB,.5),wc)],'brass',false,[mix(cA,cB,.5),wc,.9]);
    dots(c,[-.55,0,.55].map(t=>[add(mix(cA,cB,.5),mul(cn,wc*t)),.9*sz]),C.brassShade);
    // a broken chain link hanging off the front of the collar (when the front of him can be seen)
    if(lod>=1&&(!TN||TV.VW.s<.3)){const f0=add(mix(cA,cB,.5),mul(cn,wc*.95*fv*Math.sign(dot(cn,nS)*fv||1)));c.strokeStyle=C.chain;c.lineWidth=Math.max(.82,1.51*sz);
      for(let i=0;i<2;i++){c.beginPath();c.ellipse(f0.x+fv*1*sz,f0.y+(3+i*4.4)*sz,1.5*sz,2.6*sz,0,0,i?Math.PI*1.4:TAU);c.stroke();}}};
  const head=()=>{if(!F.severed&&!DBG.noHead)lizardHead(c,F,sp,o,env,TN?{h:p[HEAD],C0,fa,hy:o.headYaw??FigKit.headYaw(TV.yaw)}:null);};
  if(!TN){
    // in profile: the far arm, the far leg, the tail, the seat, the near leg, the kilt and its belt and trophies, the plates of his
    // back, the torso, the neck, the head, the weapon, the near arm over its grip and the pauldron on it
    farArm(true);leg(KNB,FTB,-1,true);tail();seat();leg(KNF,FTF,1,false);
    kilt(1);belt();skulls();plates();torso();neckPlates();neck();if(o.afterTorso)o.afterTorso(F);head();nearArm(false);return;}
  // turned: the arms and legs in the order of how far toward the viewer each is, the tail behind him or coming at the viewer, the
  // fins of his back over it when his back is to the viewer
  const dp=TV.dp,LAT=TV.LAT,LS=TV.LS,LH=TV.LH,backV=TV.VW.s>0;
  const dFarArm=(dp(sh0,-LS)+dp(p0[ELB],LAT[ELB])+dp(p0[HAB],LAT[HAB]))/3,dNA=(dp(sh0,LS)+dp(p0[ELF],LAT[ELF])+dp(p0[HAF],LAT[HAF]))/3,dNearArm=armed?(dNA*2+dp(p0[TIP],LAT[TIP]))/3:dNA;
  const dFarLeg=(dp(P0,-LH)+dp(p0[KNB],-LH)+dp(p0[FTB],-LH))/3,dNearLeg=(dp(P0,LH)+dp(p0[KNF],LH)+dp(p0[FTF],LH))/3;
  const arms=[{d:dFarArm,fn:()=>farArm(dFarArm<0)},{d:dNearArm,fn:()=>nearArm(dNearArm<0)}].sort((a,bb)=>a.d-bb.d);
  const legs=[{d:dFarLeg,fn:()=>leg(KNB,FTB,-1,dFarLeg<0)},{d:dNearLeg,fn:()=>leg(KNF,FTF,1,dNearLeg<0)}].sort((a,bb)=>a.d-bb.d);
  for(const A of arms)if(A.d<0)A.fn();
  if(dTail<0)tail();
  kilt(-1);if(skH)skulls();
  for(const L of legs)if(L.d<0)L.fn();
  seat();
  for(const L of legs)if(L.d>=0)L.fn();
  kilt(1);belt();if(!skH)skulls();
  if(!backV)plates();
  torso();
  if(backV)plates();
  if(dTail>=0)tail();
  if(!backV)neckPlates();neck();if(backV)neckPlates();
  if(o.afterTorso)across(LH,()=>o.afterTorso(F));
  head();
  for(const A of arms)if(A.d>=0)A.fn();
}
// trophies on cords from the front of his belt, swinging as he moves: a goblin's skull (the long snout, the slanted socket, the jaw
// hanging a little open) and, on the second cord, a string of fangs
function lizSkulls(c,F,sp,env,at,T,u){const C=sp.col,sz=env.sz,W=w=>w*sz,now=env.now,dead=F.dead;
  const spots=[[at(T*.02,10.4),1],[at(T*.0,4.8),.8]].slice(0,sp.skulls);
  spots.forEach(([h,k],i)=>{const sw=dead?0:Math.sin(now*1.7+i*2.1)*.16,d=rot(V(0,1),sw),q=mul(perp(d),-F.facing),Lc=W(3.4+i*2.4);let cc=add(h,mul(d,Lc+W(3*k)));
    const g=env.gy(cc.x)-W(4.4*k);if(cc.y>g)cc=V(cc.x,g);
    line(c,[h,sub(cc,mul(d,W(2.6*k)))],'#21160e',Math.max(.4,.6*sz));
    const Z=(x,y)=>add(cc,add(mul(q,W(x*k)),mul(d,W(y*k))));
    if(i===0){
      const cr=piece([Z(-3.4,-.6),Z(-2.6,-2.6),Z(0,-3.3),Z(2.6,-2.6),Z(4,-1.4),Z(7.4,-.6),Z(8,.8),Z(6.6,1.6),Z(2.4,1.8),Z(-.6,2.4),Z(-3,1.6)],.4),
        jaw=piece([Z(.6,2.6),Z(6.4,2.8),Z(6.8,3.8),Z(2,4.6),Z(-.8,3.6)],.35);
      paint(c,[cr,jaw],'bone',env,false,1,[cc,W(5*k),1]);
      // the socket slanting down to the snout, the nose's hole, the teeth between the jaws
      c.fillStyle='#120d09';c.fill(piece([Z(.4,-1.6),Z(3.4,-.9),Z(3,.4),Z(.8,.1)],.4).p);c.fill(piece([Z(6.2,-.2),Z(7.3,.4),Z(6.3,.9)],.2).p);
      if(env.lod>=1){c.fillStyle='#120d09';c.beginPath();const a0=Z(1.4,2),a1=Z(6.4,1.9),b1=Z(6.2,2.8),b0=Z(1.6,2.8);c.moveTo(a0.x,a0.y);c.lineTo(a1.x,a1.y);c.lineTo(b1.x,b1.y);c.lineTo(b0.x,b0.y);c.closePath();c.fill();
        c.fillStyle=C.bone;c.beginPath();for(let j=0;j<4;j++){const t0=Z(2.2+j*1.2,1.8),t1=Z(2.7+j*1.2,2.7),t2=Z(3.1+j*1.2,1.8);c.moveTo(t0.x,t0.y);c.lineTo(t1.x,t1.y);c.lineTo(t2.x,t2.y);c.closePath();}c.fill();}
      if(env.lod>=2){c.strokeStyle=rgba(C.boneShade,.8);c.lineWidth=Math.max(.3,W(.35*k));c.beginPath();const z0=Z(-1.6,-2.6),z1=Z(-.4,-1),z2=Z(-1,.4);c.moveTo(z0.x,z0.y);c.lineTo(z1.x,z1.y);c.lineTo(z2.x,z2.y);c.stroke();}}
    else{
      // a string of fangs, hooked, on a thong
      const ps=[];for(let j=0;j<3;j++){const b0=Z(-2.4+j*2.4,-1.2+Math.abs(j-1)*.6),dd=nrm(add(d,mul(q,(j-1)*.25))),qq=perp(dd);
        ps.push(piece([add(b0,mul(qq,W(.9*k))),add(add(b0,mul(dd,W(3*k))),mul(qq,W(.2*k))),add(add(b0,mul(dd,W(4.6*k))),mul(q,W(.9*k))),add(add(b0,mul(dd,W(2.6*k))),mul(qq,W(-.6*k))),sub(b0,mul(qq,W(.8*k)))],.35));}
      line(c,[Z(-3.2,-1.4),Z(0,-1.9),Z(3.2,-1.4)],'#21160e',Math.max(.4,.6*sz));
      paint(c,ps,'bone',env,false);}});}
// the lizard's head in its own frame: the cranium about 0,0, facing +x, the snout out to about 96, horns swept back off the back
const LIZ_SKULL=[[-30,10],[-35,-6],[-28,-22],[-12,-31],[8,-32],[22,-30],[32,-27],[40,-22],[52,-16],[70,-12],[85,-8],[94,-4],[98,1],[97,6],[90,11],[72,13],[52,15],[36,16],[44,21],[64,23],[82,21],[88,26],[74,33],[50,37],[28,38],[10,36],[-6,32],[-20,25]];
// horns swept back off the skull, each [root x, y, width at the root, the way it points (radians), length, how far it bends], the
// biggest on top; the far side's pair shows behind them
const LIZ_HORN=[[-12,-25,19,-2.72,42,-.32],[-26,-10,16,-3.0,33,-.28],[-31,6,11,2.92,20,-.2],[-2,31,9,2.72,13,-.12]];
// the brow: a ridge of bone over the eye, hooded, and the knobs down the snout
const LIZ_BROW=[[11,-27],[24,-32],[37,-28],[44,-20],[37,-16.5],[26,-18.5],[15,-19.5]],LIZ_SNOUT=[[52,-13.6,2.4],[60,-12,2.2],[68,-10.6,2],[76,-9,1.9],[84,-7.2,1.7]];
// the teeth along the jaw line: the top row hanging over the lower jaw, the bottom row up outside the top, the big one fourth from
// the front ([x, length])
const LIZ_TOP=[[40,5.6],[46.6,7.4],[53,4.6],[59.6,9.2],[66,5.2],[72.6,7.8],[79,5.4],[85.6,4.2]],LIZ_LOW=[[43.4,5],[50,6.6],[56.4,5],[63,4.6],[69.4,6.2],[76,10],[82.4,4.6],[88.6,3.6]];
function lizJawY(x){const t=cl((x-34)/58,0,1);return(1-t)*(1-t)*17+2*t*(1-t)*19.5+t*t*12;}
// a horn in a head's frame: from a root w wide at b, along ang, L long, its point bent by bend over its length
// a horn as a main form, lit: its path and its outline (the two curves of it, sampled)
function hornShape(h,key){const r=hornPath(...h),qp=(a,k,b,t)=>V((1-t)*(1-t)*a.x+2*(1-t)*t*k.x+t*t*b.x,(1-t)*(1-t)*a.y+2*(1-t)*t*k.y+t*t*b.y),O=[];
  for(let i=0;i<8;i++)O.push(qp(r.a0,r.c0,r.tip,i/8));for(let i=0;i<8;i++)O.push(qp(r.tip,r.c1,r.a1,i/8));O.push(r.a1);
  const sh=litShape(r.P,O,mix(V(h[0],h[1]),r.tip,.35),Math.max(h[2]*.7,h[4]*.32));sh.key=key;return sh;}
function hornPath(bx,by,w,ang,L,bend,P){const d=V(Math.cos(ang),Math.sin(ang)),q=perp(d),dt=rot(d,bend),b=V(bx,by),tip=add(b,mul(dt,L)),m=add(b,mul(rot(d,bend*.45),L*.5));
  const a0=add(b,mul(q,w/2)),a1=sub(b,mul(q,w/2)),c0=add(m,mul(q,w*.4)),c1=sub(m,mul(q,w*.3));P=P||new Path2D();P.moveTo(a0.x,a0.y);P.quadraticCurveTo(c0.x,c0.y,tip.x,tip.y);P.quadraticCurveTo(c1.x,c1.y,a1.x,a1.y);P.closePath();
  return{P,a0,c0,tip,a1,c1};}
// hj (turned): as the goblin's; further round than the profile can show, the head in the round (lizardHeadRound)
function lizardHead(c,F,sp,o,env,hj){
  const p=env.p||F.p,fa=hj?hj.fa:F.facing,C=sp.col,C0=hj?hj.C0:p[CHE],h=hj?hj.h:p[HEAD],v=sub(h,C0),thw=Math.atan2(v.x,-v.y)*.5,lod=env.lod,s=F.body.headR/30;
  if(hj&&Math.abs(Math.sin(hj.hy))>.42){lizardHeadRound(c,F,sp,o,env,h,thw,fa,hj.hy,s);return;}
  const back=hj?(Math.cos(hj.hy)<0?-1:1):(F.lookBack||o.lookBack?-1:1),sx=hj?.8+.2*Math.abs(Math.cos(hj.hy)):1;
  c.save();c.translate(h.x,h.y-headLift(h,LIZ_SKULL,thw*fa*back,s,env.gy));c.scale(fa*back*sx,1);c.rotate(thw*fa*back);c.scale(s,s);
  const L=rot(V(env.L.x*fa*back,env.L.y),-thw*fa*back),he={...headEnv(env,L,s),sz:1/s*.9};
  const SKL=headShape('ls',LIZ_SKULL,.4,V(30,0),40),skull=SKL.p;
  // the horns behind the skull: the far side's pair first, darker, then the near side's, each lit along its upper edge
  {const HS=P2('lhornS',()=>LIZ_HORN.map((h,i)=>hornShape(h,'n'+i))),FS=P2('lhornFS',()=>LIZ_HORN.slice(0,2).map((h,i)=>hornShape([h[0]+7,h[1]-4,h[2]*.9,h[3]+.08,h[4]*.92,h[5]],'f'+i)));
    paint(c,FS,'crest',he,true);paint(c,HS,'crest',he,false,1);
    // the ridges round each horn's root, in a close view
    if(lod>=2){c.strokeStyle=rgba('#000000',.5);c.lineWidth=2;c.stroke(P2('lhornR',()=>{const P=new Path2D();for(const [bx,by,w,ang,Lh] of LIZ_HORN.slice(0,3)){const d=V(Math.cos(ang),Math.sin(ang)),q=perp(d);for(const t of [.14,.26]){const m=add(V(bx,by),mul(d,Lh*t)),hw=w*.5*(1-t*.7);P.moveTo(m.x+q.x*hw,m.y+q.y*hw);P.quadraticCurveTo(m.x+d.x*2,m.y+d.y*2,m.x-q.x*hw,m.y-q.y*hw);}}return P;}));}}
  const SU=paint(c,[SKL],'hide',he,false,1,[V(30,0),66,1]);
  scales(c,SU,[{a:V(-30,-8),b:V(90,0),wa:40,wb:22,c:V(30,0),r:46}],{...he,sz:2.2},false,false);
  // the lower jaw in shadow under the jaw line, the muscle that shuts it rounding out the back of the head
  if(lod>=1){const g=c.createLinearGradient(0,14,0,38);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.12,'rgba(0,0,0,0)');g.addColorStop(.22,'rgba(0,0,0,.34)');g.addColorStop(1,'rgba(0,0,0,.5)');c.fillStyle=g;c.fill(skull);
    c.strokeStyle=rgba('#000000',.3);c.lineWidth=3;c.beginPath();c.moveTo(-14,24);c.quadraticCurveTo(-4,12,12,16);c.stroke();}
  // the knobs down the snout, in a close view
  if(lod>=2){const SN=new Path2D(),HL=new Path2D();for(const [x,y,r] of LIZ_SNOUT){SN.moveTo(x+r*1.3,y);SN.ellipse(x,y,r*1.3,r,-.15,0,TAU);HL.moveTo(x-r*.3+r*.45,y-r*.35);HL.arc(x-r*.3,y-r*.35,r*.45,0,TAU);}
    c.fillStyle=C.osteo;c.fill(SN);c.strokeStyle=rgba('#000000',.5);c.lineWidth=.8;c.stroke(SN);c.fillStyle=rgba(C.rim,.3);c.fill(HL);}
  // the lip scales along the jaw, paler
  if(lod>=1){c.strokeStyle=rgba(C.belly,.8);c.lineWidth=4.8;c.beginPath();c.moveTo(30,13.2);c.quadraticCurveTo(62,15.6,92,8.6);c.stroke();
    c.strokeStyle=rgba('#000000',.4);c.lineWidth=.8;c.beginPath();for(let i=0;i<9;i++){const x=36+i*6.6,y=lerp(14.6,10.6,i/8);c.moveTo(x,y-1.6);c.lineTo(x+.6,y+1.6);}c.stroke();}
  if(lod>=2){c.fillStyle=rgba('#000000',.35);for(const [x,y,r] of [[-14,-14,3.2],[-4,-22,2.6],[-20,2,2.8],[6,-12,2],[46,-6,2.2],[-8,10,2.4]]){c.beginPath();c.ellipse(x,y,r*1.3,r,.3,0,TAU);c.fill();}}
  // the jaw line, the smile of it rising behind the eye; the gums; the teeth, uneven, the top row down over the lower jaw and the
  // bottom row up outside it, the big one fourth from the front
  if(lod>=1){c.fillStyle=C.gum;c.beginPath();c.moveTo(36,15.4);c.quadraticCurveTo(62,18.6,90,11.4);c.lineTo(90,13.2);c.quadraticCurveTo(62,20.4,36,17.4);c.closePath();c.fill();}
  c.strokeStyle='#060705';c.lineWidth=4.64;c.beginPath();c.moveTo(18,9);c.quadraticCurveTo(24,17,34,17);c.quadraticCurveTo(62,19.5,92,12);c.stroke();
  {const TT=P2('lteeth2',()=>{const P=new Path2D(),S=new Path2D();
      for(const [x,l] of LIZ_TOP){const y=lizJawY(x)-.6,w=l>8?2.4:1.9;P.moveTo(x-w,y);P.quadraticCurveTo(x-w*.6,y+l*.7,x-.6,y+l);P.quadraticCurveTo(x+w*.5,y+l*.5,x+w,y);P.closePath();S.moveTo(x+.2,y);S.quadraticCurveTo(x+w*.3,y+l*.5,x-.6,y+l);S.quadraticCurveTo(x+w*.5,y+l*.5,x+w,y);S.closePath();}
      for(const [x,l] of LIZ_LOW){const y=lizJawY(x)+1.4,w=l>8?2.6:1.9;P.moveTo(x-w,y);P.quadraticCurveTo(x-w*.5,y-l*.7,x+.4,y-l);P.quadraticCurveTo(x+w*.6,y-l*.5,x+w,y);P.closePath();S.moveTo(x+.3,y);S.quadraticCurveTo(x+w*.3,y-l*.5,x+.4,y-l);S.quadraticCurveTo(x+w*.6,y-l*.5,x+w,y);S.closePath();}
      return{P,S};});
    c.fillStyle=C.tooth;c.fill(TT.P);if(lod>=1){c.fillStyle=C.toothShade;c.fill(TT.S);}}
  // the nostril, a scar across the snout, ochre claw-marks of war paint down the cheek
  c.fillStyle='#050604';c.beginPath();c.ellipse(89,-1.6,3,1.6,-.2,0,TAU);c.fill();if(lod>=1){c.strokeStyle=rgba(C.rim,.35);c.lineWidth=2;c.beginPath();c.ellipse(89,-1.6,3.8,2.4,-.2,Math.PI*1.1,Math.PI*1.8);c.stroke();}
  if(sp.scar&&lod>=1){c.strokeStyle=rgba('#c9b89a',.5);c.lineWidth=2;c.beginPath();c.moveTo(56,-14);c.lineTo(66,4);c.moveTo(58,-6);c.lineTo(63,-8);c.moveTo(61,0);c.lineTo(66,-2);c.stroke();}
  // the eye: a slit in molten gold-green deep under the brow; shut and dull once he is dead. The light of an opening on him is
  // the old warm one
  const E=V(27,-11),open=!!o.opening||!!F.opening;
  if(lod>=1){c.fillStyle='rgba(0,0,0,.5)';c.beginPath();c.ellipse(E.x,E.y+.4,9,6.6,-.1,0,TAU);c.fill();}
  if(!F.dead){c.save();c.globalCompositeOperation='lighter';const r=open?14:8,g=c.createRadialGradient(E.x,E.y,0,E.x,E.y,r*(open?1.8:1.3));
    g.addColorStop(0,open?'rgba(255,214,140,1)':rgba(C.eye,.7));g.addColorStop(.35,open?'rgba(255,193,99,.7)':rgba(C.eye,.22));g.addColorStop(1,rgba(C.eye,0));c.fillStyle=g;c.beginPath();c.arc(E.x,E.y,r*(open?1.8:1.3),0,TAU);c.fill();c.restore();
    c.fillStyle=open?'#ffc163':C.eye;c.beginPath();c.ellipse(E.x,E.y,5.6,3.8,-.1,0,TAU);c.fill();
    if(lod>=1){c.strokeStyle=rgba('#1a1606',.7);c.lineWidth=3;c.beginPath();c.ellipse(E.x,E.y,5.6,3.8,-.1,0,TAU);c.stroke();}
    c.fillStyle='#0a0904';c.beginPath();c.ellipse(E.x+1,E.y,1,3.5,0,0,TAU);c.fill();
    if(lod>=1){c.fillStyle='rgba(255,255,255,.8)';c.beginPath();c.arc(E.x-2.4,E.y-1.6,.9,0,TAU);c.fill();}}
  else{c.fillStyle='#2a2a20';c.beginPath();c.ellipse(E.x,E.y,5,1.4,-.1,0,TAU);c.fill();}
  // the brow over it: a hood of bone, its underside in shadow over the eye, its top lit
  {const BR=headShape('lbrow',LIZ_BROW,.38,V(28,-23),16);paint(c,[BR],'hide',he,false,1,[V(28,-24),14,1]);
    c.strokeStyle='#060705';c.lineWidth=3.6;c.beginPath();c.moveTo(17,-19.4);c.quadraticCurveTo(28,-18.4,38.6,-16.6);c.stroke();}
  c.restore();}

// ---------- the lizard's head in the round ----------
// Turned well away from the profile (as his tail comes round) his head is built in three dimensions: a narrow skull drawn out into
// a long snout (FigKit.headModel, with the sides of the snout and the jaw set out from its middle line), a pair of each horn out
// either side of it, the eyes on the sides of the head under their brows, the jaw line and its teeth along whichever side faces the
// viewer.
// (the jaw down each side: [x along the head, y of the jaw line, how far out from the middle])
const LIZ_JAW=[[34,16,16],[46,17.6,14.4],[58,17.8,12],[70,16.6,9.8],[80,14.6,8],[90,12,5.6]];
const LHM={};
function lizHeadModel(){return LHM.m||(LHM.m=FigKit.headModel({skull:LIZ_SKULL,w:1,cran:{c:[0,-6],r:[33,27,22]},eye:[27,-11,17],
  facePts:[[24,-25,13],[36,-19,11],[52,-12,9],[70,-8,8],[86,-4,6.5],[95,2,4.5],[40,12,15],[60,13,11.5],[80,10,8.5],[90,8,6],[30,30,16],[50,33,13],[70,28,9.5],[84,24,6.5],
    [14,4,22],[0,16,22],[-16,12,21],[-24,-6,20],[8,24,20],[-10,24,18]]}));}
function lizardHeadRound(c,F,sp,o,env,h,thw,fa,hy,s){
  const C=sp.col,lod=env.lod,M=lizHeadModel(),HV=FigKit.headView(M,hy),cs=Math.cos(hy),sn=Math.sin(hy),P3=q=>V(q[0]*cs+q[2]*sn,q[1]),Z3=q=>-q[0]*sn+q[2]*cs;
  c.save();c.translate(h.x,h.y-headLift(h,LIZ_SKULL,thw*fa,s,env.gy));c.scale(fa,1);c.rotate(thw*fa);c.scale(s,s);
  const L=rot(V(env.L.x*fa,env.L.y),-thw*fa),he={...headEnv(env,L,s),sz:1/s*.9};
  // the horns, a pair of each, out either side of the skull and swept back; those on the far side behind the skull, the near ones
  // over it
  const horns=near=>{const P=new Path2D();let any=false;
    for(const sd of [1,-1])for(const [bx,by,w,ang,Lh,bend] of LIZ_HORN.slice(0,3)){const z0=9*sd,z1=15*sd;if((Z3([bx,by,z0])>=0)!==near)continue;
      const r=hornPath(bx,by,w,ang,Lh,bend),Z=(q,t)=>P3([q.x,q.y,lerp(z0,z1,t)]),a0=Z(r.a0,0),c0=Z(r.c0,.5),tp=Z(r.tip,1),c1=Z(r.c1,.5),a1=Z(r.a1,0);
      P.moveTo(a0.x,a0.y);P.quadraticCurveTo(c0.x,c0.y,tp.x,tp.y);P.quadraticCurveTo(c1.x,c1.y,a1.x,a1.y);P.closePath();any=true;}
    if(any){c.fillStyle=near?C.horn:mid(C.horn,'#2e2a38',.3);c.fill(P);}};
  horns(false);
  // the skull, lit; the sheen of the hide on it; the lower jaw in shadow
  const O=FigKit.curvePts(HV.skullPts,true,.42,2).pts,SU=paint(c,[litShape(HV.skull,O,P3([30,0,0]),40)],'hide',he,false,1,[P3([30,0,0]),66,1]);
  scales(c,SU,[{a:P3([-30,-8,0]),b:P3([90,0,0]),wa:40,wb:22,c:P3([30,0,0]),r:46}],{...he,sz:2.2},false,false);
  if(lod>=1){const g=c.createLinearGradient(0,14,0,36);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.22,'rgba(0,0,0,.34)');g.addColorStop(1,'rgba(0,0,0,.5)');c.fillStyle=g;c.fill(SU);}
  // the knobs down the top of the snout, the bony plates over each eye that faces the viewer
  if(lod>=1){c.fillStyle=C.osteo;c.beginPath();for(const [x,y,r] of LIZ_SNOUT){const q=P3([x,y-.5,0]);c.moveTo(q.x+r*1.1,q.y);c.ellipse(q.x,q.y,r*1.1,r*.9,0,0,TAU);}c.fill();}
  {const BR=[];for(const sd of [1,-1]){const Q=LIZ_BROW.map(([x,y])=>[x,y,13*sd]);if(Z3(Q[2])<0)continue;BR.push(piece(Q.map(P3),.38));}if(BR.length)paint(c,BR,'hide',he);}
  // along each side of the jaw that faces the viewer: the pale lip scales, the gum, the jaw line, the teeth over it and up from below
  for(const sd of [1,-1]){const J=LIZ_JAW.map(([x,y,l])=>[x,y,l*sd]);if(Z3(J[2])<-3)continue;const Jp=J.map(P3);
    if(lod>=1){c.strokeStyle=rgba(C.belly,.8);c.lineWidth=3.2;c.beginPath();Jp.forEach((q,i)=>i?c.lineTo(q.x,q.y-2.4):c.moveTo(q.x,q.y-2.4));c.stroke();
      c.strokeStyle=C.gum;c.lineWidth=2;c.beginPath();Jp.forEach((q,i)=>i?c.lineTo(q.x,q.y+1):c.moveTo(q.x,q.y+1));c.stroke();}
    c.strokeStyle='#060705';c.lineWidth=2.6;c.beginPath();Jp.forEach((q,i)=>i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y));c.stroke();
    const at3=x=>{const j=Math.min(J.length-2,Math.max(0,Math.floor((x-34)/11.2))),t=cl((x-J[j][0])/(J[j+1][0]-J[j][0]),0,1);return[lerp(J[j][1],J[j+1][1],t),lerp(J[j][2],J[j+1][2],t)];};
    c.fillStyle=C.tooth;c.beginPath();
    for(const [x,l] of LIZ_TOP){const [y,zl]=at3(x),w=l>8?2.4:1.9,a=P3([x-w,y,zl]),b2=P3([x+w,y,zl]),tp=P3([x-.6,y+l,zl]);c.moveTo(a.x,a.y);c.lineTo(tp.x,tp.y);c.lineTo(b2.x,b2.y);c.closePath();}
    for(const [x,l] of LIZ_LOW){const [y,zl]=at3(x),w=l>8?2.6:1.9,a=P3([x-w,y+2,zl]),b2=P3([x+w,y+2,zl]),tp=P3([x+.4,y+2-l,zl]);c.moveTo(a.x,a.y);c.lineTo(tp.x,tp.y);c.lineTo(b2.x,b2.y);c.closePath();}
    c.fill();}
  // the nostrils, either side of the end of the snout
  c.fillStyle='#050604';for(const sd of [1,-1]){const q=[88,-1.6,4.5*sd];if(Z3(q)<-1)continue;const z=P3(q);c.beginPath();c.ellipse(z.x,z.y,2.4*Math.max(.5,Math.abs(cs)),1.6,0,0,TAU);c.fill();}
  // the eyes, each as squarely as it faces the viewer: a slit in molten gold-green ringed bright, under a heavy lid; dull once he is dead
  const open=!!o.opening||!!F.opening;
  for(const e of HV.eyes){if(e.face<.05)continue;const f=cl(e.face*1.5,.2,1),E=e.p;
    if(lod>=1){c.fillStyle='rgba(0,0,0,.4)';c.beginPath();c.ellipse(E.x,E.y+.6,10.5*f,7.6,0,0,TAU);c.fill();}
    if(!F.dead){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=Math.min(1,.35+f*.75);const r=open?14:11,g=c.createRadialGradient(E.x,E.y,0,E.x,E.y,r*1.8);
      g.addColorStop(0,open?'rgba(255,214,140,1)':rgba(C.eye,1));g.addColorStop(.3,open?'rgba(255,193,99,.7)':rgba(C.eye,.45));g.addColorStop(1,rgba(C.eye,0));c.fillStyle=g;c.beginPath();c.arc(E.x,E.y,r*1.8,0,TAU);c.fill();c.restore();
      c.fillStyle=open?'#ffc163':C.eye;c.beginPath();c.ellipse(E.x,E.y,6.2*f,4,0,0,TAU);c.fill();c.fillStyle='#0a0904';c.beginPath();c.ellipse(E.x,E.y,1.1*f,3.7,0,0,TAU);c.fill();}
    else{c.fillStyle='#2a2a20';c.beginPath();c.ellipse(E.x,E.y,5*f,1.4,0,0,TAU);c.fill();}
    c.strokeStyle='#060705';c.lineWidth=2.4;c.beginPath();c.moveTo(E.x-7.5*f,E.y-3.2);c.quadraticCurveTo(E.x,E.y-6.4,E.x+7.6*f,E.y-2);c.stroke();}
  horns(true);
  c.restore();}

// ---------- the whole figure ----------
// F: a fighter whose F.beast is 'goblin' or 'lizard'. o: {light or dir, now, opening, lookBack, drawOther (the weapon), afterFarArm,
// afterTorso}, as the game passes them to the cast painter. The detail is chosen by the scale the canvas draws at (the vertical
// one, so the game's spin, an x-scale, does not change it): below LOD[0] the plain figure, below LOD[1] the game's own detail (the
// play view on a phone or an ordinary screen), above it all of it (a sharp screen, a close view). (LOD[1] was 1.9 until V79: an
// upright phone's pushed-in view, since V74 about 2.3 a unit, drew a goblin or the lizard at a close view's cost in every frame)
const LOD=[.9,3.4];
function envFor(c,F,o,sp,ctr){const tr=c.getTransform?c.getTransform():null,k=tr&&tr.d!=null?Math.hypot(tr.c,tr.d)||1:2;
  const Ld=o.dir?nrm(o.dir):o.light?nrm(sub(o.light,ctr)):nrm(V(.5,-1));
  const sz=size(F);
  // (litMin: the smallest shape that takes a plane of light, planeMax the widest a plane is; yaw: turned in a spin, o.yaw or the
  // game's own F._yaw)
  return{k,fa:F.facing||1,L:Ld,col:sp.col,rw:Math.max(.9,1.25/k)*1.05,lod:k<LOD[0]?0:k<LOD[1]?1:2,sz,now:o.now??(F.t||0),litMin:3.1*sz,planeMax:5.4*sz,far:false,flat:false,
    yaw:+(o.yaw??F._yaw??0)||0};}
// (the place's key light, sk_figui.js: the rim in its colour; a view of the spec with that rim, kept on the spec for each colour)
function keyed(sp){const r=FigKit.rimCol(sp.col.rim);if(r===sp.col.rim)return sp;let K=sp._key;if(!K||K.r!==r)K=sp._key={r,v:{...sp,col:{...sp.col,rim:r}}};return K.v;}
function draw(c,F,o={}){FigKit.useKey(o);
  const sp=keyed(specOf(F)),p=F.p,env=envFor(c,F,o,sp,mix(p[PEL],p[CHE],.5));
  env.gy=typeof F.gr==='function'?(x=>F.gr(x)):(x=>F.ground??(Math.max(p[FTF].y,p[FTB].y)+3));
  if(sp.kind==='goblin'&&F.half&&F.half.U&&F.half.L){const r=restOnHalves(F,env.gy,env.sz);env.p=r.q;env.half=r.half;}
  else env.p=restOn(F,sp.kind,env.gy,env.sz);
  c.save();c.lineCap='round';c.lineJoin='round';
  if(sp.kind==='lizard')lizard(c,F,sp,o,env);else goblin(c,F,sp,o,env);
  c.restore();}
// a severed piece of the lizard's tail, where the game has it: P = {F: the lizard (colours, size), q: points from the cut end to the
// tip, i0: the link it was cut at, N}; o as for draw
function tailPiece(c,P,o={}){const F=P&&P.F;if(!F||!P.q||P.q.length<2)return;FigKit.useKey(o);const sp=keyed(specOf(F));if(sp.kind!=='lizard')return;
  const env=envFor(c,F,o,sp,P.q[0]);env.gy=x=>1e9;
  const N=P.N||TAIL.N,i0=P.i0||0,R=resample(P.q.map(q=>V(q.x,q.y)),3),m=R.length,span=P.q.length-1,ts=R.map((_,j)=>(i0+j/(m-1)*span)/N);
  c.save();c.lineCap='round';c.lineJoin='round';tailBody(c,R,ts,env,sp,{startCut:true});c.restore();}

// ---------- their weapons ----------
// drawn along the line from the grip h to the tip t, the arms painter's way: x along the weapon from the grip, y across it, +y the
// side the fighter faces; fa mirrors it. o: {light or dir, now, alpha, seed}
const IRON={b:'#3a3632',s:'#211e1b',l:'#8a8278',o:'#0b0a09'},RUST='#6b4226',BONE={b:'#a89c80',s:'#5d5442',l:'#e8dcc0',o:'#1b1710'},WOOD={b:'#3a2a1c',s:'#22180f',l:'#7a5a3a',o:'#0d0905'};
function weapon(c,key,h,t,fa,o){o=o||{};const W=WEAPONS[key];if(!W)return false;
  const dx=t.x-h.x,dy=t.y-h.y,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,s=fa<0?-1:1,nx=-uy*s,ny=ux*s,k=o.alpha==null?1:o.alpha;
  const Ld=o.dir?nrm(o.dir):o.light?nrm(sub(o.light,V(h.x+dx*.5,h.y+dy*.5))):V(.45,-.89),lit=nx*Ld.x+ny*Ld.y;
  c.save();c.transform(ux,uy,nx,ny,h.x,h.y);c.lineCap='round';c.lineJoin='round';c.globalAlpha*=k;
  const fill=(P,col,ol,lw)=>{if(ol){c.strokeStyle=ol;c.lineWidth=lw||1.99;c.stroke(P);}c.fillStyle=col;c.fill(P);};
  const poly=pts=>{const P=new Path2D();P.moveTo(pts[0][0],pts[0][1]);for(const q of pts.slice(1))P.lineTo(q[0],q[1]);P.closePath();return P;};
  const rim=(pts,col)=>{c.strokeStyle=col;c.lineWidth=.97;c.globalAlpha=k*cl(.2+Math.abs(lit)*.7,0,.9);c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(const q of pts.slice(1))c.lineTo(q[0],q[1]);c.stroke();c.globalAlpha=k;};
  const len0=W.len,butt=W.butt,side=lit>0?-1:1;
  if(key==='shiv'){
    // a railway spike ground to a point: square iron, a flat head at the butt, the grip wound with rag and twine, pitted with rust
    const body=poly([[-butt+1.2,-2.2],[-butt+1.2,2.2],[8,1.8],[len0-6,1.1],[len0+1.2,0],[len0-6,-1.1],[8,-1.8]]);fill(body,IRON.b,IRON.o,.9);
    c.fillStyle=RUST;c.globalAlpha=k*.55;c.fill(poly([[2,-1.6],[9,1.2],[14,-1.3]]));c.globalAlpha=k;
    c.fillStyle='#120f0d';for(const [x,y] of [[11,.5],[15.5,-.4],[18,.3]]){c.beginPath();c.arc(x,y,.35,0,TAU);c.fill();}
    fill(poly([[-butt-.6,-3.6],[-butt+1.6,-3.6],[-butt+1.6,3.6],[-butt-.6,3.6]]),IRON.s,IRON.o,.8);
    const wrap=poly([[-butt+1.2,-2.8],[5.2,-2.6],[5.2,2.6],[-butt+1.2,2.8]]);fill(wrap,'#3b3428','#0d0b08',.7);
    c.strokeStyle='#6b5a3a';c.lineWidth=.9;c.beginPath();for(let x=-butt+1.6;x<5;x+=1.4){c.moveTo(x,-2.7);c.lineTo(x+1.1,2.7);}c.stroke();
    // the rag's loose end
    c.fillStyle='#3b3428';c.beginPath();c.moveTo(4.6,2.4);c.quadraticCurveTo(3.6,5.6+Math.sin((o.now||0)*3)*.6,1.4,7);c.lineTo(2.6,4.4);c.lineTo(2.8,2.6);c.closePath();c.fill();
    rim([[8,1.6*side],[len0-6,1.0*side],[len0+1.2,0]],'#e8e0d0');}
  else if(key==='hook'){
    // a meat hook, rusted, on a short chain from a wooden T-handle
    fill(poly([[-butt,-1.6],[0,-1.6],[0,1.6],[-butt,1.6]]),WOOD.b,WOOD.o,.7);fill(poly([[-1.2,-4.4],[1.2,-4.4],[1.2,4.4],[-1.2,4.4]]),WOOD.s,WOOD.o,.7);
    c.strokeStyle=WOOD.l;c.lineWidth=.7;c.globalAlpha=k*.6;c.beginPath();c.moveTo(-butt+.6,-.6);c.lineTo(-.6,-.4);c.moveTo(-butt+1.4,.7);c.lineTo(-1,.8);c.stroke();c.globalAlpha=k;
    c.strokeStyle=IRON.l;c.lineWidth=1.03;for(let i=0;i<3;i++){c.beginPath();c.ellipse(2.6+i*3.4,0,2.2,i%2?.7:1.3,0,0,TAU);c.stroke();}
    const HK=new Path2D();HK.moveTo(11,0);HK.lineTo(len0-12,0);HK.bezierCurveTo(len0-3,0,len0+2,4,len0,9);HK.bezierCurveTo(len0-2,13,len0-9,13,len0-11,8.4);HK.lineTo(len0-12.4,5.6);
    c.strokeStyle=IRON.o;c.lineWidth=3.4;c.stroke(HK);c.strokeStyle=IRON.b;c.lineWidth=2.2;c.stroke(HK);c.strokeStyle=RUST;c.lineWidth=1.57;c.globalAlpha=k*.7;c.setLineDash([2,3]);c.stroke(HK);c.setLineDash([]);c.globalAlpha=k;
    c.fillStyle=IRON.l;c.beginPath();c.moveTo(len0-12.4,5.6);c.lineTo(len0-13.6,3.6);c.lineTo(len0-10.6,4.6);c.closePath();c.fill();
    c.strokeStyle='rgba(232,224,208,.5)';c.lineWidth=1.04;c.beginPath();c.moveTo(13,-.9*side);c.lineTo(len0-13,-.9*side);c.stroke();}
  else if(key==='boneclub'){
    // a great femur: the round head at the butt, the long shaft, the two knuckles of the knee at the end, nails hammered through
    // them; or an old iron pipe
    if((o.seed|0)%3===2){fill(poly([[-butt,-2.6],[len0-4,-2.6],[len0-4,2.6],[-butt,2.6]]),IRON.b,IRON.o,.9);fill(poly([[len0-6,-4.2],[len0+1.6,-4.2],[len0+1.6,4.2],[len0-6,4.2]]),IRON.s,IRON.o,.9);
      fill(poly([[len0-2.2,-6],[len0,-6],[len0,6],[len0-2.2,6]]),IRON.b,IRON.o,.7);c.fillStyle=RUST;c.globalAlpha=k*.6;c.fill(poly([[6,-2.4],[18,2.4],[28,-2.4]]));c.globalAlpha=k;rim([[-butt,2.4*side],[len0-4,2.4*side]],'#cfc8bb');
      fill(poly([[-butt+.4,-3.1],[6,-3.1],[6,3.1],[-butt+.4,3.1]]),'#2e261c','#0d0b08',.6);}
    else{const sh=new Path2D();sh.moveTo(-butt+2,-2.6);sh.bezierCurveTo(8,-2,len0*.55,-1.8,len0-8,-3.2);sh.lineTo(len0-6,-6.4);sh.bezierCurveTo(len0-2,-8,len0+3.4,-6,len0+3.2,-2.4);sh.bezierCurveTo(len0+4,0,len0+3.6,2.6,len0+2.6,3.4);
      sh.bezierCurveTo(len0+3,7,len0-2,8.6,len0-6,6.8);sh.lineTo(len0-8,3.6);sh.bezierCurveTo(len0*.55,2.4,8,2.6,-butt+2,3);sh.closePath();fill(sh,BONE.b,BONE.o,.9);
      c.fillStyle=BONE.b;c.beginPath();c.arc(-butt+1.6,-.6,4.2,0,TAU);c.fill();c.strokeStyle=BONE.o;c.lineWidth=1.41;c.stroke();
      c.fillStyle=BONE.s;c.globalAlpha=k*.7;c.beginPath();c.ellipse(len0*.4,1.2,len0*.3,.9,0,0,TAU);c.fill();c.globalAlpha=k;
      c.strokeStyle='#4a3f2c';c.lineWidth=1.44;c.beginPath();c.moveTo(len0*.3,-1.2);c.lineTo(len0*.36,.4);c.moveTo(len0*.62,1.6);c.lineTo(len0*.7,-.6);c.stroke();
      // nails through the knee end, heads and points
      c.strokeStyle=IRON.b;c.lineWidth=1.41;c.beginPath();c.moveTo(len0-3,-7.6);c.lineTo(len0-1.6,-11);c.moveTo(len0+1.4,4.6);c.lineTo(len0+3.6,8.2);c.moveTo(len0+2.6,-3.6);c.lineTo(len0+6.4,-5.2);c.stroke();
      c.fillStyle=IRON.l;for(const [x,y] of [[len0-3,-7.6],[len0+1.4,4.6],[len0+2.6,-3.6]]){c.beginPath();c.arc(x,y,.75,0,TAU);c.fill();}
      // a strip of hide bound round the grip
      fill(poly([[-butt+3.6,-3],[4,-2.8],[4,3],[-butt+3.6,3.2]]),'#3a2c1e','#0d0b08',.6);c.strokeStyle='#6b5a3a';c.lineWidth=.4;c.beginPath();for(let x=-butt+4;x<4;x+=1.5){c.moveTo(x,-2.8);c.lineTo(x+1,2.9);}c.stroke();
      rim([[-butt+2,-2.6*-side],[len0-8,-3.2*-side]],BONE.l);}}
  else if(key==='glaive'){
    // the boss's cleaver-glaive: a haft bound in iron, a spiked butt, and a cleaver's blade broad as a door-plate at the end
    const bl=W.blade||34;fill(poly([[-butt,-2.4],[len0-bl+2,-2.2],[len0-bl+2,2.2],[-butt,2.4]]),WOOD.b,WOOD.o,1);
    c.strokeStyle=WOOD.l;c.lineWidth=.8;c.globalAlpha=k*.5;c.beginPath();c.moveTo(-butt+4,-.8);c.lineTo(len0*.5,-1);c.moveTo(-butt+10,.9);c.lineTo(len0*.6,.8);c.stroke();c.globalAlpha=k;
    for(const x of [-butt+5,len0*.3,len0*.55])fill(poly([[x-1.8,-3],[x+1.8,-3],[x+1.8,3],[x-1.8,3]]),IRON.s,IRON.o,.7);
    fill(poly([[-butt-7,0],[-butt+.4,-2.8],[-butt+.4,2.8]]),IRON.b,IRON.o,.8);
    const B=poly([[len0-bl,-4],[len0+6,-4.6],[len0+8.4,-2.4],[len0+8.6,24],[len0+6.4,27.6],[len0-bl+6,29.6],[len0-bl+1,27],[len0-bl-1,20],[len0-bl+1,6]]);
    fill(B,IRON.b,IRON.o,1.1);
    // the bevel along the edge, the rust running down from the spine, a cleaver's hole near the nose, marks scratched in the iron
    c.fillStyle=IRON.l;c.globalAlpha=k*.28;c.fill(poly([[len0+8.6,19],[len0+6.4,27.6],[len0-bl+6,29.6],[len0-bl+5,25],[len0+3,23.6]]));
    c.fillStyle=RUST;c.globalAlpha=k*.55;c.beginPath();for(const [x0,w0] of [[len0-22,2.4],[len0-12,1.8],[len0-2,2.6]]){c.moveTo(x0,-3.6);c.lineTo(x0+w0,-3.6);c.lineTo(x0+w0*.5,12+w0*3);c.closePath();}c.fill();
    c.fillStyle='#7fd28a';c.globalAlpha=k*.18;c.beginPath();c.ellipse(len0-10,8,9,4,.1,0,TAU);c.fill();c.globalAlpha=k;
    c.strokeStyle='rgba(10,9,8,.7)';c.lineWidth=1.2;c.beginPath();c.moveTo(len0-24,10);c.lineTo(len0-18,16);c.lineTo(len0-12,10);c.lineTo(len0-6,16);c.moveTo(len0-24,18);c.lineTo(len0-8,18);c.stroke();
    c.fillStyle='#08070a';c.beginPath();c.arc(len0+2.4,4,2.6,0,TAU);c.fill();c.strokeStyle=IRON.s;c.lineWidth=1.2;c.stroke();
    // the edge, notched from use
    c.strokeStyle='#e4ddd0';c.lineWidth=1.65;c.globalAlpha=k*cl(.35+lit*.6,.25,.95);c.beginPath();c.moveTo(len0+8.6,2);c.lineTo(len0+8.6,24);c.lineTo(len0+6.4,27.6);c.lineTo(len0-bl+6,29.6);c.stroke();c.globalAlpha=k;
    c.fillStyle='#0b0a09';for(const [x,y] of [[len0+8.8,12],[len0-8,29.2],[len0-20,29.6]]){c.beginPath();c.arc(x,y,1.2,0,TAU);c.fill();}
    fill(poly([[len0-bl+3,-3.6],[len0-bl-4,-11],[len0-bl+8,-5.6]]),IRON.s,IRON.o,.8);
    fill(poly([[len0-bl-1,-3.4],[len0-bl+5,-3.4],[len0-bl+5,3.4],[len0-bl-1,3.4]]),'#b28d3d','#2a1f0a',.8);
    for(const [x,y] of [[len0-4,-1],[len0-4,10],[len0-16,20]])dotAt(c,V(x,y),1,'#b28d3d');}
  c.restore();return true;}

// ---------- the numbers ----------
// what their weapons are in the game: kind (the game weapon whose rules they use), length to the tip and back to the butt, a name,
// and a guard that suits who carries it (goblins low and forward)
const WEAPONS={
  shiv:{kind:'dagger',len:24,butt:5,mass:.6,off:null,name:'Railway spike',short:'Spike',guard:{hx:.52,hy:.32,w:-.5,gw:-.35,off:[.42,.16],crouch:.76,lean:.16,sf:.3,sb:-.34}},
  hook:{kind:'dagger',len:27,butt:6,mass:.7,off:null,name:'Meat hook',short:'Hook',guard:{hx:.5,hy:.3,w:-.7,gw:-.35,off:[.4,.18],crouch:.76,lean:.16,sf:.3,sb:-.34}},
  boneclub:{kind:'club',len:42,butt:6,mass:1.2,off:null,name:'Femur club',short:'Femur',guard:{hx:.42,hy:.3,w:-1.4,gw:-.3,off:[.3,.32],crouch:.78,lean:.14,sf:.3,sb:-.34}},
  glaive:{kind:'axe',len:98,butt:30,mass:4.4,off:-26,blade:34,name:'Cleaver-glaive',short:'Glaive',guard:{hx:.32,hy:.42,w:-1.15,gw:.25,off:null,crouch:.86,lean:.08,sf:.3,sb:-.34}}};
// hit points, rank, temper and what they carry: goblins come weak and many, the boss alone holds the station
const SPEC={
  goblin:{hp:16,skill:1,temper:'rusher',weapons:['shiv','hook','boneclub'],note:'One clean blow from Ilyas kills one; they come in threes and fours'},
  lizard:{hp:160,skill:4,temper:'brute',weapons:['glaive'],note:'An Expert: Ilyas outclasses him by one rank only, so his crits can still floor Ilyas'}};
// (turns: a beast in a spin is drawn turned in the round, given yaw)
return{body,draw,weapon,WEAPONS,SPEC,specOf,DBG,TAIL,size,tailW:(F,t)=>tailW(t,size(F)),tailPiece,LOD,turns:true,ok:typeof Path2D==='function'};
})();
// ===== BEASTS END =====
