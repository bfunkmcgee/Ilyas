// ===== LOOK UI =====
// Kael's look: Noir Gilt, the long coat and the swept-back hair. He is drawn as shaped pieces that ride the ragdoll's joints: a head in
// profile with the long ear and the spiked hair, a tailored jacket under a long coat with gold vine trim, sleeves, cuffs and hands,
// trousers and shoes, and the arc-blade. Every piece is rebuilt from the joints each frame, so whatever pose the physics makes, the
// costume follows it. The look decides how the pieces are lit and filled; the outfit and the hair are settings on top. The other looks,
// outfits and cuts from the art rounds stay here as settings. Everyone else is still drawn by drawFighter.
const KaelLook=(()=>{
const PEL=0,CHE=1,HEAD=2,ELF=3,HAF=4,ELB=5,HAB=6,KNF=7,FTF=8,KNB=9,FTB=10,TIP=11;
const V=(x,y)=>({x,y}),add=(a,b)=>V(a.x+b.x,a.y+b.y),sub=(a,b)=>V(a.x-b.x,a.y-b.y),mul=(a,k)=>V(a.x*k,a.y*k),
  len=a=>Math.hypot(a.x,a.y),nrm=a=>{const l=Math.hypot(a.x,a.y)||1;return V(a.x/l,a.y/l);},perp=a=>V(-a.y,a.x),
  mix=(a,b,u)=>V(a.x+(b.x-a.x)*u,a.y+(b.y-a.y)*u),dot=(a,b)=>a.x*b.x+a.y*b.y,rot=(v,t)=>V(v.x*Math.cos(t)-v.y*Math.sin(t),v.x*Math.sin(t)+v.y*Math.cos(t)),
  cl=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp0=(a,b,t)=>a+(b-a)*t,TAU=Math.PI*2;

// ---------- shapes ----------
// a smooth outline through points (Catmull-Rom as cubic Beziers)
function smooth(Q,closed=true,t=.5,P=new Path2D()){
  const n=Q.length,g=i=>Q[closed?((i%n)+n)%n:cl(i,0,n-1)];P.moveTo(Q[0].x,Q[0].y);
  for(let i=0;i<(closed?n:n-1);i++){const p0=g(i-1),p1=g(i),p2=g(i+1),p3=g(i+2);
    P.bezierCurveTo(p1.x+(p2.x-p0.x)*t/3,p1.y+(p2.y-p0.y)*t/3,p2.x-(p3.x-p1.x)*t/3,p2.y-(p3.y-p1.y)*t/3,p2.x,p2.y);}
  if(closed)P.closePath();return P;}
// a piece is a path plus a centre and a half-width, which the looks use to light it
// (the shapes are the figure kit's: the same paths, carrying their outlines for the light)
function piece(Q,t=.5,lit=false){return FigKit.piece(Q,t,2,lit);}
// a limb segment: two circles joined by their outer tangents, so a thick end can taper to a thin one
function capsule(a,b,wa,wb){return FigKit.capsule(a,b,wa,wb);}
// points along a polyline, evenly spaced, with the direction there
function along(Q,step,off=0){const out=[];let carry=off;for(let i=1;i<Q.length;i++){const a=Q[i-1],b=Q[i],L=len(sub(b,a));if(L<1e-6)continue;const u=nrm(sub(b,a));
  let s=carry;for(;s<L;s+=step)out.push({p:add(a,mul(u,s)),u});carry=s-L;}return out;}
// a Catmull-Rom resample of a chain, for ribbons and trims
function resample(Q,per){const out=[],n=Q.length,g=i=>Q[cl(i,0,n-1)];
  for(let i=0;i<n-1;i++)for(let j=0;j<per;j++){const t=j/per,p0=g(i-1),p1=g(i),p2=g(i+1),p3=g(i+2),t2=t*t,t3=t2*t;
    out.push(V(.5*(2*p1.x+(-p0.x+p2.x)*t+(2*p0.x-5*p1.x+4*p2.x-p3.x)*t2+(-p0.x+3*p1.x-3*p2.x+p3.x)*t3),.5*(2*p1.y+(-p0.y+p2.y)*t+(2*p0.y-5*p1.y+4*p2.y-p3.y)*t2+(-p0.y+3*p1.y-3*p2.y+p3.y)*t3)));}
  out.push(Q[n-1]);return out;}
// a leaf: almond with a point, base at p, along v, size k
function leafPath(P,p,v,k){const u=nrm(v),n=perp(u),tip=add(p,mul(u,2.4*k)),m=add(p,mul(u,1.15*k));
  P.moveTo(p.x,p.y);let q=add(m,mul(n,1.05*k));P.quadraticCurveTo(q.x,q.y,tip.x,tip.y);q=sub(m,mul(n,1.05*k));P.quadraticCurveTo(q.x,q.y,p.x,p.y);P.closePath();}

// ---------- the head, in its own frame: cranium centred on 0,0, facing +x, about 94 units crown to chin ----------
const R1=v=>Math.round(v*10)/10,Sp=p=>`${R1(p.x)},${R1(p.y)}`;
function smoothD(Q,closed=true,t=.5){const n=Q.length;let d=`M${Sp(Q[0])}`;const g=i=>Q[closed?(i+n)%n:Math.max(0,Math.min(n-1,i))];
  for(let i=0;i<(closed?n:n-1);i++){const p0=g(i-1),p1=g(i),p2=g(i+1),p3=g(i+2);
    d+=` C${Sp(V(p1.x+(p2.x-p0.x)*t/3,p1.y+(p2.y-p0.y)*t/3))} ${Sp(V(p2.x-(p3.x-p1.x)*t/3,p2.y-(p3.y-p1.y)*t/3))} ${Sp(p2)}`;}
  return d+(closed?' Z':'');}
const HP=a=>a.map(([x,y])=>V(x,y));
const HD={};
const SKULL_PTS=[[4,-37],[-18,-33],[-33,-18],[-37,2],[-33,20],[-25,36],[-10,40],[-3,44],[12,52],[29,57],[37,52],[38,46],[35,43],[39,39],[37,36.5],[41,33],[40,29.5],[50,24],[48,20],[37,3],[39,-3],[35,-20],[24,-31]];
HD.skull=smoothD(HP(SKULL_PTS),true,.42);
HD.skullShade=smoothD(HP([[-33,-18],[-37,2],[-33,20],[-25,36],[-10,40],[-3,44],[12,52],[8,40],[-6,26],[-14,8],[-20,-12]]),true,.45);
const EAR_PTS=[[3,4],[-10,-3],[-30,-16],[-54,-32],[-43,-17],[-30,-1],[-19,16],[-8,30],[1,28]];
HD.ear=smoothD(HP(EAR_PTS),true,.48);
HD.earIn='M-5,8 Q-23,-4 -44,-25 Q-31,-8 -12,19';
HD.jawLine='M-4,42 Q12,52 30,56';
HD.eye='M17,6 Q23.5,0.5 31,4.5 Q24.5,9.5 17,6 Z';HD.lid='M16,5.8 Q23.5,0 31.6,4.4';HD.lash='M31.4,4.4 L34.6,3';
HD.brow='M12,-3.5 Q24,-10 37.5,-2.5';
HD.nostril='M39.5,27.5 Q42.5,29.4 44,27';HD.mouth='M30.5,37 Q35,35.6 39.2,36.4';HD.chinLine='M33,46 Q36,44.6 37.6,45.6';
const IRIS=V(27.6,5.6);
// hair: one silhouette from the forehead over the crown to the nape, alternating spike tips (t) and the valleys between them
const HAIRS={
  swept:{name:'Swept back',pts:[[31,-19],[50,-40,1],[26,-42],[12,-66,1],[2,-50],[-24,-74,1],[-20,-50],[-58,-68,1],[-38,-42],[-88,-48,1],[-46,-24],[-104,-22,1],[-48,-6],[-94,4,1],[-44,10],[-70,26,1],[-30,24]]},
  crown:{name:'Crown',pts:[[31,-19],[54,-46,1],[26,-42],[28,-72,1],[6,-50],[-6,-80,1],[-16,-50],[-42,-74,1],[-36,-42],[-72,-56,1],[-46,-24],[-86,-26,1],[-48,-6],[-80,2,1],[-42,12],[-62,24,1],[-30,24]]},
  tall:{name:'Tall spikes',pts:[[31,-19],[60,-56,1],[26,-44],[34,-90,1],[6,-54],[-6,-100,1],[-18,-54],[-46,-94,1],[-38,-46],[-82,-70,1],[-48,-26],[-100,-36,1],[-50,-8],[-92,0,1],[-44,12],[-66,26,1],[-30,24]]}};
const HAIRLINE=' Q-24,30 -14,14 Q-6,2 4,-2 Q8,-4 9,4 L13,5 Q14,-10 22,-18 Q28,-22 31,-19 Z';
for(const k in HAIRS){const Q=HAIRS[k].pts.map(([x,y,t])=>({x,y,t:!!t})),C0=V(-8,-8);let d=`M${Sp(Q[0])}`;
  for(let i=1;i<Q.length;i++){const a=Q[i-1],b=Q[i],m=mix(a,b,.5),seg=len(sub(b,a));let nn=nrm(perp(sub(b,a)));if(dot(nn,sub(m,C0))<0)nn=mul(nn,-1);
    const bulge=b.t?.13:a.t?-.09:0;d+=` Q${Sp(add(m,mul(nn,bulge*seg)))} ${Sp(b)}`;}
  HAIRS[k].d=d+HAIRLINE;
  // a strand line inside each spike, from near its root out toward its tip
  const tips=Q.filter(q=>q.t),lines=[],hi=[];
  tips.forEach((t,i)=>{const j=Q.indexOf(t),a=Q[j-1],b=Q[j+1]||Q[j-1],root=mix(mix(a,b,.5),C0,.25),s0=mix(root,t,.18),s1=mix(root,t,.78),nn=perp(nrm(sub(s1,s0)));
    lines.push(`M${Sp(s0)} Q${Sp(add(mix(s0,s1,.5),mul(nn,2.4)))} ${Sp(s1)}`);if(i<5)hi.push(`M${Sp(mix(root,t,.32))} L${Sp(mix(root,t,.62))}`);});
  HAIRS[k].lines=lines.join(' ');HAIRS[k].hi=hi.join(' ');}
let HPATH=null;
function headPaths(){if(HPATH)return HPATH;HPATH={};for(const k in HD)HPATH[k]=new Path2D(HD[k]);
  for(const k in HAIRS){HAIRS[k].p=new Path2D(HAIRS[k].d);HAIRS[k].pl=new Path2D(HAIRS[k].lines);HAIRS[k].ph=new Path2D(HAIRS[k].hi);}return HPATH;}

// ---------- outfits ----------
const OUTFITS={
  suit:{name:'Tailored suit',scarf:false,coat:false},
  scarf:{name:'Suit and silk scarf',scarf:true,coat:false},
  coat:{name:'Long coat',scarf:false,coat:true}};

// ---------- looks: how a group of pieces is filled and lit ----------
// every look gets paint(c,pieces,material,env); env.L points toward the light, env.far marks the limbs on the far side
const RIMMED={suit:1,skin:1,shoe:1,coat:1,lapel:1,shirt:1,vest:1,plate:1};
// the materials the light is worked out for, and as what: the suit and the coat are wool, the lapel satin, the shirt cotton; shoes,
// the vest, the belt and the sheath leather; the vest's plates steel
const LIT={suit:'wool',coat:'wool',lapel:'satin',shirt:'cotton',skin:'skin',shoe:'leather',vest:'leather',band:'leather',sheath:'leather',plate:'steel'};
// a rim of light along the lit edge: the outline shifted away from the light, stroked, and kept inside the piece
function rimEdge(c,ps,L,w,col,a){c.save();c.globalAlpha*=a;c.strokeStyle=col;c.lineWidth=w*2;c.lineJoin='round';
  for(const q of ps){c.save();c.clip(q.p);c.translate(-L.x*w,-L.y*w);c.stroke(q.p);c.restore();}c.restore();}
// a colour between two hex colours
function mid(a,b,u){const h=x=>[1,3,5].map(i=>parseInt(x.slice(i,i+2),16)),A=h(a),B=h(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*u).toString(16).padStart(2,'0')).join('');}
function rgbaHex(h,a){const n=parseInt(h.slice(1),16);return`rgba(${n>>16&255},${n>>8&255},${n&255},${a})`;}
function unionOf(ps){if(ps.length===1)return ps[0].p;const U=new Path2D();for(const q of ps)U.addPath(q.p);return U;}
const LOOKS={
  noir:{name:'Noir Gilt',
    col:{suit:'#0e0c14',suitFar:'#231b32',skin:'#100d16',skinFar:'#231b32',shoe:'#09080d',shoeFar:'#1d1629',shirt:'#0a090f',shirtFar:'#1d1629',lapel:'#1a1720',
      coat:'#0c0b11',coatFar:'#1e1729',hair:'#ece2c2',hairShade:'#b3a37c',hairLine:'#8f8060',hairHi:'#fffaea',gold:'#e2b65a',goldDim:'#9c7428',
      rim:'#ffcf86',scarf:'#efe9dc',scarfShade:'#c9c0ad',lining:'#45d8c8',liningFar:'#1b4a46',under:'#47202a',underFar:'#2a141b',square:'#45d8c8',eye:'#c8fbff',open:'#ffc163',
      blade:'#10151d',bladeEdge:'#ffd89a',glow:'#7ff3e3',glow2:'#d9fffa',sheath:'#0b0a10',
      vest:'#0b0a10',vestFar:'#211a2e',plate:'#1b1824',plateFar:'#2a2238',band:'#120d0b',bandFar:'#231a14'},
    paint(c,ps,mat,env){const C=this.col,base=C[mat+(env.far?'Far':'')]||C[mat],U=unionOf(ps),lit=(this.lit&&this.lit[mat])||LIT[mat],old=lit?ps.filter(q=>!FigKit.litOK(q,env)):ps;
      if(env.flat){c.fillStyle=base;c.fill(U);return;}
      // a shape the light can be worked out for gets its plane of light and a rim where it faces the light (FigKit.light); any other
      // keeps the old rim, the whole shape again nudged toward the light under the shape itself
      if(RIMMED[mat]&&old.length){const a0=c.globalAlpha,dx=env.L.x*env.rw,dy=env.L.y*env.rw;c.globalAlpha=a0*(env.far?.4:1);c.translate(dx,dy);c.fillStyle=C.rim;c.fill(old.length===ps.length?U:unionOf(old));c.translate(-dx,-dy);c.globalAlpha=a0;}
      c.fillStyle=base;c.fill(U);
      if(lit)FigKit.light(c,ps,env,{cls:lit,base,light:C.rim,far:env.far});}},
  cel:{name:'Clean Cel',line:'#0d0c13',
    col:{suit:['#2b2e3f','#181a25'],suitFar:['#1f2131','#13141c'],skin:['#f3e4d7','#d4b9a8'],skinFar:['#c9b6aa','#a8968c'],shoe:['#23232d','#101016'],shoeFar:['#18181f','#0d0d12'],
      shirt:['#3a3d50','#262838'],shirtFar:['#2a2c3c','#1c1d28'],lapel:['#383d54','#23273b'],coat:['#272a3a','#16171f'],coatFar:['#1e2030','#121219'],hair:['#f6e9b5','#d6bc72'],hairLine:'#c2a95e',hairHi:'#fffbe8',
      gold:['#e8b84f','#b8862e'],scarf:['#f4efe4','#cbc3b3'],lining:['#45d8c8','#2a9d92'],square:['#45d8c8','#2a9d92'],rim:'#ffdcb0',
      eye:'#ffffff',iris:'#2fb7a6',open:'#ffc163',blade:'#2b3342',bladeEdge:'#d8f0ff',glow:'#7ff3e3',glow2:'#d9fffa',sheath:'#1b1c25',
      vest:['#262938','#15161f'],vestFar:['#1c1e2b','#111219'],plate:['#343849','#1f2130'],plateFar:['#262938','#16171f'],band:['#3a2a20','#1f1610'],bandFar:['#2a1f18','#150f0b']},
    paint(c,ps,mat,env){const C=this.col[mat+(env.far?'Far':'')]||this.col[mat],base=Array.isArray(C)?C[0]:C,shade=Array.isArray(C)?C[1]:C,L=env.L;
      if(env.flat){c.fillStyle=base;c.fill(unionOf(ps));return;}
      c.lineJoin='round';c.strokeStyle=this.line;c.lineWidth=env.ow*2;for(const q of ps)c.stroke(q.p);
      // the pieces as one shape, so joints show no seams: rim along the lit edge, shadow on the far side, the light tone between
      const U=unionOf(ps),rim=RIMMED[mat]&&!env.far&&env.k>1.2,wr=rim?Math.max(.3,.7/env.k):0;
      c.fillStyle=rim?this.col.rim:shade;c.fill(U);
      if(rim){c.save();c.clip(U);c.translate(-L.x*wr,-L.y*wr);c.fillStyle=shade;c.fill(U);c.restore();}
      for(const q of ps){c.save();c.clip(q.p);if(rim){c.translate(-L.x*wr,-L.y*wr);c.clip(U);c.translate(L.x*wr,L.y*wr);}
        const d=Math.max(.6,q.r*.62);c.translate(L.x*d,L.y*d);c.fillStyle=base;c.fill(q.p);c.restore();}}},
  paint:{name:'Painted Noir',
    col:{suit:['#3a3744','#101118'],suitFar:['#262230','#0d0d14'],skin:['#ffe6d0','#a88a92'],skinFar:['#c8b0aa','#6e5d6c'],shoe:['#3a3640','#0a0a0f'],shoeFar:['#26222c','#0a0a0f'],
      shirt:['#2c2a33','#0b0b10'],shirtFar:['#201e26','#08080c'],lapel:['#4c4858','#15151d'],coat:['#383540','#09090e'],coatFar:['#242130','#08080c'],hair:['#fff2c8','#a8976e'],hairLine:'#fff8e2',hairHi:'#ffffff',
      gold:['#f8d98c','#9c7128'],scarf:['#fffaf0','#a59d93'],lining:['#5fe6d6','#1f6e68'],square:['#5fe6d6','#1f6e68'],rim:'#c9925e',rimSkin:'#ffd2a0',
      eye:'#ffffff',iris:'#2fd8c6',open:'#ffc163',blade:'#1a212c',bladeEdge:'#ffe6b8',glow:'#7ff3e3',glow2:'#d9fffa',sheath:'#121118',
      vest:['#34313d','#0b0b10'],vestFar:['#22202a','#08080c'],plate:['#484452','#121218'],plateFar:['#2c2934','#0b0b10'],band:['#4a3426','#140d09'],bandFar:['#33241b','#0e0907']},
    paint(c,ps,mat,env){const C=this.col[mat+(env.far?'Far':'')]||this.col[mat],lit=Array.isArray(C)?C[0]:C,dark=Array.isArray(C)?C[1]:C,L=env.L;
      if(env.flat){c.fillStyle=mid(dark,lit,.45);c.fill(unionOf(ps));return;}
      // the rim colour under everything, then each piece's light-to-shadow gradient over all of it but the lit edge
      const U=unionOf(ps),rim=RIMMED[mat]&&!env.far,w=rim?Math.max(.4,.9/env.k):0;
      if(rim){c.fillStyle=mat==='skin'?this.col.rimSkin:this.col.rim;c.fill(U);}
      for(const q of ps){c.save();if(rim){c.translate(-L.x*w,-L.y*w);c.clip(U);c.translate(L.x*w,L.y*w);}
        // a limb is lit across its width only, so the shading runs down it unbroken from one segment to the next
        let G=L,str=1;if(q.u){const lp=sub(L,mul(q.u,dot(L,q.u))),m=len(lp);G=m>.05?mul(lp,1/m):perp(q.u);str=cl(.35+m,0,1);}
        const r=Math.max(1,q.r)*1.15,lt=mid(dark,lit,str),g=c.createLinearGradient(q.c.x+G.x*r,q.c.y+G.y*r,q.c.x-G.x*r,q.c.y-G.y*r);
        g.addColorStop(0,lt);g.addColorStop(.55,mid(lt,dark,.62));g.addColorStop(1,dark);c.fillStyle=g;c.fill(q.p);c.restore();}}}};
const tone=(look,mat,far,i=0)=>{const C=look.col[mat+(far?'Far':'')]||look.col[mat];return Array.isArray(C)?C[i]:C;};

// ---------- the Pit: soot, oilcloth and rust ----------
// With the arm gone the gilt went out of him, and the Noir Gilt gold with it. In the Pit (F.wear: what Tamm's lost property gave him)
// he is drawn in the same light as ever, but in soot, oilcloth and rust, and there is no gold on him anywhere: each look has its Pit
// colours over its own (linen: the dressings; horn: the toggles and buttons; pin: Tamm's pin and the iron fittings; stain: the old
// wound come through the linen). The oilcloth takes the light as leather does, with a sheen along its edge.
const PIT_COL={
  noir:{suit:'#120f0d',suitFar:'#29221b',shirt:'#2f2c26',shirtFar:'#48433a',coat:'#181a12',coatFar:'#2e3224',lining:'#2c2719',liningFar:'#1e1b12',
    scarf:'#7c3b1f',scarfShade:'#57291a',scarfBack:'#4a2214',gold:'#7c3b1f',goldDim:'#57291a',band:'#1c140d',bandFar:'#2e2117',shoe:'#2a1e15',shoeFar:'#3a2b1e',
    linen:'#bdb4a0',linenFar:'#8e8776',horn:'#4a3d2e',pin:'#9a958a',stain:'#5e2d1d',
    jersey:'#1c1d24',jerseyFar:'#33343e',under:'#4a463d',underFar:'#5e594e',canvas:'#2f2a1f',canvasFar:'#463f30',glove:'#1d140d',gloveFar:'#2f2318',rope:'#5c4c33',ropeFar:'#433827'},
  cel:{suit:['#3d3832','#25211d'],suitFar:['#2e2a25','#1b1815'],shirt:['#7d7465','#5a5348'],shirtFar:['#5f584d','#433e36'],coat:['#454a34','#2b2f20'],coatFar:['#353a29','#22251a'],
    lining:['#6a6048','#4a4232'],liningFar:['#4f4836','#363024'],scarf:['#a4532e','#743a20'],scarfBack:['#6e341c','#4e2414'],gold:['#a4532e','#743a20'],
    band:['#3a2a20','#1f1610'],bandFar:['#2a1f18','#150f0b'],shoe:['#2c241e','#16120e'],shoeFar:['#211b16','#110e0b'],linen:['#ebe3cf','#c2b9a5'],linenFar:['#c9c1ad','#a39b89'],
    horn:'#6b5a44',pin:'#b8b3a6',stain:'#7a3a24',
    jersey:['#3a3d4c','#262833'],jerseyFar:['#2c2e3a','#1c1d26'],under:['#cfc8b6','#a49d8b'],underFar:['#a8a292','#857f70'],canvas:['#8a7a58','#62563d'],canvasFar:['#6b5f45','#4c4331'],
    glove:['#3a2a20','#1f1610'],gloveFar:['#2a1f18','#150f0b'],rope:['#a08a5e','#76643f'],ropeFar:['#7c6b49','#5a4d33']},
  paint:{suit:['#3d3731','#111010'],suitFar:['#29241f','#0c0b0a'],shirt:['#4c463b','#14120e'],shirtFar:['#36312a','#0e0d0b'],coat:['#3e4433','#0c0e09'],coatFar:['#2b3024','#0a0b08'],
    lining:['#4c4434','#14110c'],liningFar:['#36301f','#0e0c08'],scarf:['#b4592e','#3c1a0c'],scarfBack:['#7a3618','#2a1208'],gold:['#b4592e','#4a2412'],
    band:['#4a3426','#140d09'],bandFar:['#33241b','#0e0907'],shoe:['#3a3430','#0a0908'],shoeFar:['#28231f','#080706'],linen:['#f2ead6','#8c8474'],linenFar:['#cfc7b3','#6e675a'],
    horn:'#5e4e3a',pin:'#c4bfb2',stain:'#7a3a24',
    jersey:['#3c3f4e','#0e0f14'],jerseyFar:['#2a2c37','#0b0b10'],under:['#d8d0bc','#6e685a'],underFar:['#b4ad9a','#58534a'],canvas:['#8c7c5a','#221d13'],canvasFar:['#6a5e44','#18140e'],
    glove:['#4a3426','#140d09'],gloveFar:['#33241b','#0e0907'],rope:['#a89060','#3e331f'],ropeFar:['#84714c','#2e2617']}};
const PIT_LOOKS={};
function pitLook(key){if(PIT_LOOKS[key])return PIT_LOOKS[key];const L0=LOOKS[key]||LOOKS.noir,L=Object.create(L0);
  L.of=L0;L.noGold=true;L.col=Object.assign({},L0.col,PIT_COL[key]||PIT_COL.noir);L.lit={coat:'leather',linen:'cotton',jersey:'wool',under:'cotton',canvas:'cotton',glove:'leather',rope:'cotton'};
  return PIT_LOOKS[key]=L;}
const isNoir=l=>l===LOOKS.noir||l.of===LOOKS.noir,isCel=l=>l===LOOKS.cel||l.of===LOOKS.cel;

const cfg={look:'noir',outfit:'coat',hair:'swept'};

// ---------- the coat's skirt ----------
// Each corner of the hem chases a target with a damped spring. The target hangs from the hip at the coat's length and is pushed
// clear of the legs: the front corner clears the far leg, which the skirt covers (the near leg is drawn over it), and the back
// corner clears both. When his hips are low (kneeling, getting up, lying down) the hem rests on the floor a little way out from
// him and the rest of the cloth pools there; it does not lay out flat at its full length, which spread the coat into a tent round
// him. A corner is only ever pulled, by the spring or by the coat's length, never moved straight to a new place, so it cannot jump
// from one side of him to the other: it swings there.
const COAT={w:21,z:.8,vmax:1100,snap:160};
function coatTargets(an,fa,gy){
  return an.map((a,i)=>{const X0=a.p.x*fa,hemY=a.p.y+a.len*.82;let ext=null;
    for(const q of a.pts){if(q.y>hemY+6)continue;const X=q.x*fa;ext=ext==null?X:i?Math.min(ext,X):Math.max(ext,X);}
    const X=i?Math.min(X0-1.5,ext==null?X0:ext-a.clear):Math.max(X0+1.5,ext==null?X0:ext+a.clear);
    let dX=cl(X-X0,-a.len*.95,a.len*.95),y=a.p.y+Math.sqrt(a.len*a.len-dX*dX),x=(X0+dX)*fa;
    const fl=gy(x)-1;
    if(y>fl){const room=Math.max(0,fl-a.p.y),flat=Math.sqrt(Math.max(0,a.len*a.len-room*room)),spread=Math.min(flat,a.len*.22+flat*.25);
      dX=(i?-1:1)*Math.max(Math.abs(dX),spread);x=(X0+dX)*fa;y=Math.min(a.p.y+room,gy(x)-1);}
    return{x,y};});}
// The wind (wind: the air going past him, world units a second, + toward +x; riding a bike, or standing on a train that is moving)
// blows each corner's target round to the downwind side of where it would hang: the corner further downwind furthest, nearly level
// at a fast ride, the other less, as his legs hold that side of the coat. The springs carry the corners there, so the coat swings
// back as he gets up to speed and falls again as he slows. How far the wind takes it goes as the drag on the cloth against its weight.
const WIND={v0:420,lead:1.3,trail:.9};
function windK(w){const a=Math.abs(w||0);return a<30?0:cl(Math.atan((a/WIND.v0)**2)/1.4,0,1);}
function windTargets(tg,an,wind,gy){const s=windK(wind);if(!s)return tg;const dn=Math.sign(wind),lead=an[0].p.x*dn>an[1].p.x*dn?0:1;
  return tg.map((t,i)=>{const a=an[i],dx=t.x-a.p.x,dy=t.y-a.p.y,L0=Math.hypot(dx,dy),L=L0+(a.len-L0)*s,
      phi0=Math.atan2(dx*dn,Math.max(dy,0)),phi=phi0+((i===lead?WIND.lead:WIND.trail)-phi0)*s,x=a.p.x+dn*Math.sin(phi)*L;
    return{x,y:Math.min(a.p.y+Math.cos(phi)*L,gy(x)-1)};});}
function coatStep(F,an,fa,gy,now,wind){
  const tg=windTargets(coatTargets(an,fa,gy),an,wind||0,gy),st=F._coat;
  // a fresh coat, or a body that was just put somewhere new (or stepped out of the world and back in, F.warpAt), starts hanging
  // where it should.
  if(!st||!st.q||st.q.length!==2||st.warp!==F.warpAt||tg.some((t,i)=>Math.hypot(t.x-st.q[i].x,t.y-st.q[i].y)>COAT.snap)){F._coat={t:now,warp:F.warpAt,q:tg.map(t=>({x:t.x,y:t.y,vx:0,vy:0}))};return F._coat.q;}
  const dt=cl(now-(st.t??now),0,1/15);st.t=now;if(!(dt>0))return st.q;
  const n=Math.ceil(dt*120),h=dt/n,w=COAT.w,z=COAT.z,vm=COAT.vmax;
  for(let k=0;k<n;k++)st.q.forEach((q,i)=>{const t=tg[i],a=an[i];
    q.vx+=(w*w*(t.x-q.x)-2*z*w*q.vx)*h;q.vy+=(w*w*(t.y-q.y)-2*z*w*q.vy)*h;
    const sp=Math.hypot(q.vx,q.vy);if(sp>vm){q.vx*=vm/sp;q.vy*=vm/sp;}
    q.x+=q.vx*h;q.y+=q.vy*h;
    // the coat is only so long: a corner left behind by a fast move is pulled along at its full length
    const dx=q.x-a.p.x,dy=q.y-a.p.y,d=Math.hypot(dx,dy),L=a.len*1.04;
    if(d>L){const kx=dx/d,ky=dy/d;q.x=a.p.x+kx*L;q.y=a.p.y+ky*L;const vr=q.vx*kx+q.vy*ky;if(vr>0){q.vx-=vr*kx;q.vy-=vr*ky;}}
    const fl=gy(q.x)-1;if(q.y>fl){q.y=fl;if(q.vy>0)q.vy=0;}});
  return st.q;}
// a smooth run through points, continuing a path that is already at the first of them
function curveThrough(P,Q,t=.45){const n=Q.length,g=i=>Q[cl(i,0,n-1)];
  for(let i=0;i<n-1;i++){const p0=g(i-1),p1=g(i),p2=g(i+1),p3=g(i+2);
    P.bezierCurveTo(p1.x+(p2.x-p0.x)*t/3,p1.y+(p2.y-p0.y)*t/3,p2.x-(p3.x-p1.x)*t/3,p2.y-(p3.y-p1.y)*t/3,p2.x,p2.y);}}
// the hem from the front corner to the back one, sagging a little (but not through the floor), with any notches torn out of it;
// runs is where the gold trim survives. A notch is kept on the hem however short the hem gets, narrower if need be, so it never
// blinks out and back as he moves. wave, if given, moves each point of it (the wind's flutter).
function hemLine(fr,bk,sag,tears,toward,gy,wave){
  const base=t=>{let q=add(mix(fr,bk,t),V(0,sag*4*t*(1-t)));if(wave)q=wave(q);if(gy)q.y=Math.min(q.y,Math.max(gy(q.x)-.5,fr.y+(bk.y-fr.y)*t));return q;},hl=Math.max(1,len(sub(bk,fr))),keys=[];
  for(let i=0;i<=10;i++)keys.push({t:i/10,d:0});
  const cuts=[];for(const n of tears||[]){const w=Math.min(n.w/hl,.12),t=cl(n.t,.04+w,.96-w);cuts.push([t-w,t+w]);keys.push({t:t-w,d:0,e:1},{t,d:Math.min(n.d,hl*.6+2)},{t:t+w,d:0,e:1});}
  const inside=t=>cuts.some(([a,b])=>t>a+1e-6&&t<b-1e-6);
  const pts=keys.filter(k=>k.d||k.e||!inside(k.t)).sort((a,b)=>a.t-b.t).map(k=>{const q=base(k.t);return k.d?add(q,mul(nrm(sub(toward,q)),k.d)):q;});
  const runs=[];let cur=[];for(let i=0;i<=20;i++){const t=i/20;if(inside(t)){if(cur.length>1)runs.push(cur);cur=[];}else cur.push(base(t));}if(cur.length>1)runs.push(cur);
  return{pts,runs,base};}

// ---------- tears in the cloth ----------
// a small seeded random number source, so a tear keeps its ragged shape from frame to frame
function rng(a){return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
// A cut is a ragged slit along d, a stab a torn hole drawn out along the line of the blade. Each adds its outline to acc.hole
// (filled with what shows through: the lining, or what is under the trousers), the wound inside it to acc.gore, and its torn edges
// and loose threads to acc.rim (stroked in the rim light), so all the tears on one piece of cloth draw in three strokes of the pen.
// Every outline winds the same way round, so where two tears overlap the hole stays open.
function ripShape(ctr,d,r,acc,gmin=0){
  const q=perp(d),R=rng(r.seed),at=(a,b)=>add(ctr,add(mul(d,a),mul(q,b)));
  if(r.stab){const N=11;
    for(let i=0;i<N;i++){const a=i/N*TAU+(R()-.5)*.4,rr=r.r*(.5+R()*.55)*(i%3?1:1.18),z=at(Math.cos(a)*rr*1.2,Math.sin(a)*rr*.66);
      if(i){acc.hole.lineTo(z.x,z.y);acc.rim.lineTo(z.x,z.y);}else{acc.hole.moveTo(z.x,z.y);acc.rim.moveTo(z.x,z.y);}}
    acc.hole.closePath();acc.rim.closePath();
    const an=Math.atan2(d.y,d.x),e=at(r.r*.62,0);acc.gore.moveTo(e.x,e.y);acc.gore.ellipse(ctr.x,ctr.y,r.r*.62,Math.max(r.r*.22,gmin),an,0,TAU);acc.gore.closePath();return;}
  const N=6,up=[],dn=[];
  for(let i=0;i<=N;i++){const s=i/N,al=(s-.5)*r.len,w=r.wid*Math.sin(Math.PI*s)*(.65+R()*.7);up.push(at(al+(R()-.5)*.6,w*.55));dn.push(at(al+(R()-.5)*.6,-w*.45));}
  acc.hole.moveTo(dn[0].x,dn[0].y);for(const z of dn.slice(1))acc.hole.lineTo(z.x,z.y);for(let i=N;i>=0;i--)acc.hole.lineTo(up[i].x,up[i].y);acc.hole.closePath();
  // the wound: a thin lens down the middle of the slit
  const gl=r.len*.36,gw=Math.max(.3,r.wid*.21,gmin),g=[at(-gl,0),at(0,-gw),at(gl,0),at(0,gw)];acc.gore.moveTo(g[0].x,g[0].y);for(const z of g.slice(1))acc.gore.lineTo(z.x,z.y);acc.gore.closePath();
  for(const E of [up,dn]){acc.rim.moveTo(E[0].x,E[0].y);for(const z of E.slice(1))acc.rim.lineTo(z.x,z.y);}
  // a few loose threads at the ends
  for(const [e,sg] of [[up[0],-1],[up[N],1]])for(let j=0;j<2;j++){const t=add(e,add(mul(d,sg*(.6+R()*1.2)),mul(q,(R()-.5)*1.4)));acc.rim.moveTo(e.x,e.y);acc.rim.lineTo(t.x,t.y);}}

// ---------- the arc-blade, in the look's colours ----------
function blade(c,h,t,sd,st,P,lineC,lw,now,Ld,k,vel){
  // drawn in full by the weapons' renderer when it is there (sk_armsui.js); the plain blade below otherwise
  if(typeof ArmsLook!=='undefined'&&ArmsLook.ok&&ArmsLook.arc){ArmsLook.arc(c,h,t,sd,st,P,{line:lineC,lw,now,L:Ld,k,vel});return;}
  const LEN=58,BUTT=9,SEGS=9,Lr=len(sub(t,h))||1,ux=(t.x-h.x)/Lr,uy=(t.y-h.y)/Lr,nx=-uy*sd,ny=ux*sd,mode=st?st.mode:'rigid';
  const pt=(a,b=0)=>V(h.x+ux*a+nx*b,h.y+uy*a+ny*b);const poly=Q=>{c.beginPath();c.moveTo(Q[0].x,Q[0].y);for(let i=1;i<Q.length;i++)c.lineTo(Q[i].x,Q[i].y);c.closePath();};
  const fillQ=Q=>{poly(Q);if(lineC){c.strokeStyle=lineC;c.lineWidth=lw*2;c.lineJoin='round';c.stroke();}c.fillStyle=P.blade;c.fill();};
  c.lineCap='round';c.lineJoin='round';
  // hilt: wrapped grip, ring pommel, slim angular guard
  const g0p=pt(-BUTT+2),g1p=pt(1);
  if(lineC){c.strokeStyle=lineC;c.lineWidth=3.2+lw*2;c.beginPath();c.moveTo(g0p.x,g0p.y);c.lineTo(g1p.x,g1p.y);c.stroke();}
  c.strokeStyle=P.blade;c.lineWidth=3.2;c.beginPath();c.moveTo(g0p.x,g0p.y);c.lineTo(g1p.x,g1p.y);c.stroke();
  {const pr=pt(-BUTT-1.2);c.strokeStyle=P.goldDim||P.blade;c.lineWidth=1.5;c.beginPath();c.arc(pr.x,pr.y,2.1,0,TAU);c.stroke();}
  fillQ([pt(1,-7.5),pt(4.5,-5.2),pt(4.2,6.5),pt(1.8,8.8),pt(.4,4)]);
  const L=mode==='lash'?st.L:LEN,g0=4.5,bow=5.2,half=s=>s<.86?2.4+.7*(1-s/.86):2.4*(1-(s-.86)/.14);
  if(mode==='rolled'){coil(c,pt(7),5.4,ux,uy,sd,P,now);return;}
  if(mode==='lash'){chain(c,h,ux,uy,nx,ny,L,g0,LEN,P,lineC,lw,now);return;}
  const cut=mode==='unroll'?st.p:1,wob=mode==='unroll'?1:mode==='lock'?1-st.q:0;
  const cAt=(s,j)=>{const a=g0+s*(LEN-g0),off=bow*4*s*(1-s)+(wob?Math.sin(now*38+j*1.9)*1.6*wob*s:0);return pt(a,off);};
  const gap=.55/(LEN-g0),segs=[];
  for(let i=0;i<SEGS;i++){const s0=i/SEGS,s1=(i+1)/SEGS;if(s0>=cut)break;const e1=Math.min(s1,cut),a0=s0+(i?gap:0),a1=e1-(e1<1?gap:0);
    const A0=cAt(a0,i),A1=cAt(a1,i),w0=half(a0),w1=half(a1);segs.push([V(A0.x+nx*w0,A0.y+ny*w0),V(A1.x+nx*w1,A1.y+ny*w1),V(A1.x-nx*w1*.9,A1.y-ny*w1*.9),V(A0.x-nx*w0*.9,A0.y-ny*w0*.9)]);}
  if(lineC){c.strokeStyle=lineC;c.lineWidth=lw*2;for(const Q of segs){poly(Q);c.stroke();}}
  c.fillStyle=P.blade;for(const Q of segs){poly(Q);c.fill();}
  // the edge catches the light along the convex side
  c.strokeStyle=P.bladeEdge;c.lineWidth=.8;c.globalAlpha=.85;c.beginPath();for(let k=0;k<=14;k++){const s=.04+k/14*(Math.min(cut,1)*.92),cc=cAt(s,Math.floor(s*SEGS)),w=half(s)*.7,q=V(cc.x+nx*w,cc.y+ny*w);k?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y);}c.stroke();c.globalAlpha=1;
  // seams and the thread of light that holds the segments
  c.save();c.globalCompositeOperation='lighter';
  const lockAt=mode==='lock'||mode==='pulse'?st.q:mode==='unroll'?0:1.01;
  for(let i=1;i<SEGS;i++){const s=i/SEGS;if(s>cut)break;const cc=cAt(s,i),w=half(s),lit=s<=lockAt;
    c.globalAlpha=lit?(mode==='rigid'||lockAt>1?.55:.85):.25;c.strokeStyle=lit?P.glow:'#3a9f95';c.lineWidth=1;c.beginPath();c.moveTo(cc.x+nx*w,cc.y+ny*w);c.lineTo(cc.x-nx*w,cc.y-ny*w);c.stroke();}
  c.globalAlpha=mode==='rigid'?.32:.45;c.strokeStyle=P.glow;c.lineWidth=.9;c.beginPath();for(let k=0;k<=10;k++){const s=.05+k/10*(Math.min(cut,1)*.86),cc=cAt(s,0);k?c.lineTo(cc.x,cc.y):c.moveTo(cc.x,cc.y);}c.stroke();
  if(mode==='lock'||mode==='pulse'){const s=cl(lockAt,0,1),cc=cAt(s,0),r=mode==='pulse'?9:13,gr=c.createRadialGradient(cc.x,cc.y,0,cc.x,cc.y,r);
    gr.addColorStop(0,'rgba(217,255,250,.95)');gr.addColorStop(.4,'rgba(127,243,227,.55)');gr.addColorStop(1,'rgba(127,243,227,0)');c.globalAlpha=1;c.fillStyle=gr;c.beginPath();c.arc(cc.x,cc.y,r,0,TAU);c.fill();}
  c.restore();
  if(mode==='unroll'&&cut<1){const cc=cAt(cut,Math.floor(cut*SEGS));coil(c,V(cc.x-nx*(1.5+3.8*(1-cut)),cc.y-ny*(1.5+3.8*(1-cut))),1.6+3.8*(1-cut),ux,uy,sd,P,now);}
}
function coil(c,ce,r,ux,uy,sd,P,now){c.fillStyle=P.blade;c.beginPath();c.arc(ce.x,ce.y,r+1.6,0,TAU);c.fill();
  c.save();c.globalCompositeOperation='lighter';c.strokeStyle=P.glow;c.globalAlpha=.6;c.lineWidth=.9;c.beginPath();
  const a0=Math.atan2(uy,ux);for(let i=0;i<=28;i++){const u=i/28,a=a0+sd*u*TAU*1.6+now*9*sd,rr=r*(1-u*.8),q=V(ce.x+Math.cos(a)*rr,ce.y+Math.sin(a)*rr);i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y);}c.stroke();c.restore();}
function chain(c,h,ux,uy,nx,ny,L,g0,LEN,P,lineC,lw,now){
  const N=9,sl=(LEN-g0)/N,gapL=(L-g0-sl*N)/(N-1),A=Math.min(9,gapL*.22),ph=now*34,pts=[];
  for(let i=0;i<N;i++){const a=g0+i*(sl+gapL),s=(a+sl/2)/L,w=A*Math.sin(Math.PI*s)*Math.sin(ph-s*9);
    const cc=V(h.x+ux*(a+sl/2)+nx*w,h.y+uy*(a+sl/2)+ny*w),dw=A*Math.PI/L*Math.cos(Math.PI*s)*Math.sin(ph-s*9)-A*9/L*Math.sin(Math.PI*s)*Math.cos(ph-s*9);
    const tx=ux+nx*dw,ty=uy+ny*dw,tl=Math.hypot(tx,ty)||1;pts.push({c:cc,tx:tx/tl,ty:ty/tl});}
  c.save();c.globalCompositeOperation='lighter';c.strokeStyle=P.glow;c.lineWidth=2.4;c.globalAlpha=.35;c.beginPath();c.moveTo(h.x+ux*g0,h.y+uy*g0);for(const q of pts)c.lineTo(q.c.x,q.c.y);c.stroke();
  c.lineWidth=1;c.globalAlpha=.85;c.strokeStyle=P.glow2;c.stroke();c.restore();
  pts.forEach((q,i)=>{const hl=sl*.5,w=i===N-1?1.8:2.4+.6*(1-i/N),qx=-q.ty,qy=q.tx,a=V(q.c.x-q.tx*hl,q.c.y-q.ty*hl),b=V(q.c.x+q.tx*hl,q.c.y+q.ty*hl);
    const Q=i===N-1?[V(a.x+qx*w,a.y+qy*w),V(b.x+q.tx*3,b.y+q.ty*3),V(a.x-qx*w,a.y-qy*w)]:[V(a.x+qx*w,a.y+qy*w),V(b.x+qx*w,b.y+qy*w),V(b.x-qx*w,b.y-qy*w),V(a.x-qx*w,a.y-qy*w)];
    c.beginPath();c.moveTo(Q[0].x,Q[0].y);for(const z of Q.slice(1))c.lineTo(z.x,z.y);c.closePath();if(lineC){c.strokeStyle=lineC;c.lineWidth=lw*2;c.stroke();}c.fillStyle=P.blade;c.fill();
    c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.6;c.strokeStyle=P.glow;c.lineWidth=.8;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();c.restore();});}

// ---------- the coat under fire, swept round as a shield, and thrown off ----------
// F.coatShield (0..1) sweeps the coat's front round in front of him, its edges in his two hands; F.coatShred (0..1) is the damage it
// has taken; F.coatOff takes it off him for good, and what he wears under it shows: the sleeveless vest, the bare arms and their
// tattoos, the dagger at the small of his back and (F.charge==='belt') the breaching charge on his belt.
const ease=t=>{t=cl(t,0,1);return t*t*(3-2*t);};
// The damage is placed once for every coat: each mark sits on a piece of the coat in that piece's own terms (u across it, v down
// it) with a size and a turn, and appears when the damage passes its share (th), so the coat goes from whole to rags one hole at a
// time and every hole stays where it went in, worn or held up.
let SHRED=null;
function shredMarks(){if(SHRED)return SHRED;const R=rng(90210),M=[];
  for(let i=0;i<50;i++){const r=R(),th=Math.pow((i+R())/50,1.25);let kind=r<.62?'hole':r<.8?'slash':'scorch';
    // late in the damage some of the holes are whole pieces gone
    if(kind==='hole'&&th>.5&&R()<.3)kind='chunk';
    M.push({kind,u:.06+R()*.88,v:.05+R()*.9,s:kind==='scorch'?3+R()*3.6:kind==='slash'?3.2+R()*4.2:kind==='chunk'?3.4+R()*3:1.1+R()*.9,ang:R()*TAU,th,seed:Math.floor(R()*2147483647)});}
  return SHRED=M;}
// An offscreen layer as big as a piece of cloth on the canvas, so the holes go right through it and show what is behind. One canvas
// serves every layer in turn: open, draw, close.
let LAYER=null;
function layerOpen(c,Q,pad){if(typeof document==='undefined'||!c.getTransform)return null;const m=c.getTransform();let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for(const q of Q){const X=m.a*q.x+m.c*q.y+m.e,Y=m.b*q.x+m.d*q.y+m.f;if(X<x0)x0=X;if(Y<y0)y0=Y;if(X>x1)x1=X;if(Y>y1)y1=Y;}
  x0=Math.floor(x0-pad);y0=Math.floor(y0-pad);const w=Math.ceil(x1+pad)-x0,h=Math.ceil(y1+pad)-y0;if(!(w>0&&h>0)||w>4096||h>4096)return null;
  if(!LAYER)LAYER=document.createElement('canvas');if(LAYER.width<w||LAYER.height<h){LAYER.width=Math.max(w,LAYER.width);LAYER.height=Math.max(h,LAYER.height);}
  const g=LAYER.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,w,h);g.setTransform(m.a,m.b,m.c,m.d,m.e-x0,m.f-y0);g.lineCap='round';g.lineJoin='round';
  return{g,x0,y0,w,h};}
function layerClose(c,Ly){c.save();c.setTransform(1,0,0,1,0,0);c.drawImage(LAYER,0,0,Ly.w,Ly.h,Ly.x0,Ly.y0,Ly.w,Ly.h);c.restore();}
// the hem torn up into strips: notches up into it, more and deeper with the damage, on top of the cuts the fights left
function shredHem(tears,shred){const out=(tears||[]).slice();if(shred<=0)return out;const R=rng(4242);
  for(let i=0;i<18;i++){const t=.04+R()*.92,d=(5+R()*12)*(.3+shred*1.05),w=.8+R()*1.4,th=R()*.92;if(th<shred)out.push({t,d,w});}return out;}
// the marks on one piece: map(u,v) places a mark on it (null when that piece is not there), clip keeps the marks inside it; a hole shows
// what is under the cloth (dark), its frayed rim catches the light, and the newest holes still smoke and glow at the edge
// cut: the piece is in its own layer (layerOpen), and a hole goes through it; otherwise a hole is filled with what is under (dark)
function shredOn(c,look,clip,map,shred,now,k,sz,under,cut){if(shred<=0)return;const M=shredMarks(),hole=new Path2D(),rimP=new Path2D(),dummy=new Path2D(),sc=[],hot=[],lod=k<2.4?0:k<5?1:2,grow=.85+.45*shred;
  for(const m of M){if(m.th>shred)continue;const p=map(m.u,m.v);if(!p)continue;
    if(m.kind==='scorch'){sc.push({p,r:m.s*sz*(.7+.5*cl((shred-m.th)*3,0,1))});continue;}
    const d=V(Math.cos(m.ang),Math.sin(m.ang)),ch=m.kind==='chunk',R0={stab:m.kind==='hole'||ch,r:m.s*sz*grow,len:m.s*1.5*sz*grow,wid:(1.8+m.s*.42)*sz,seed:m.seed};
    ripShape(p,d,R0,{hole,gore:dummy,rim:rimP},0);
    if(m.kind==='hole'&&shred-m.th<.2)hot.push({p,a:1-(shred-m.th)/.2,r:m.s*sz,seed:m.seed});}
  c.save();c.clip(clip);
  // the burns darken the cloth where they are, and only the cloth
  if(cut)c.globalCompositeOperation='source-atop';
  for(const s of sc){if(lod){const g=c.createRadialGradient(s.p.x,s.p.y,0,s.p.x,s.p.y,s.r);g.addColorStop(0,'rgba(6,4,3,.85)');g.addColorStop(.55,'rgba(40,20,8,.5)');g.addColorStop(1,'rgba(40,20,8,0)');c.fillStyle=g;}
    else c.fillStyle='rgba(30,16,8,.45)';c.beginPath();c.arc(s.p.x,s.p.y,s.r*(lod?1:.7),0,TAU);c.fill();}
  if(cut){c.globalCompositeOperation='destination-out';c.fillStyle='#000';c.fill(hole);c.globalCompositeOperation='source-over';}
  else{c.fillStyle=under;c.fill(hole);}
  // the frayed edges: dark threads round each hole, close up
  if(lod>=1){c.globalAlpha*=cut?.7:.5;c.strokeStyle='#050407';c.lineWidth=Math.max(.3,.6/k);c.stroke(rimP);}
  c.restore();
  return hot;}
// the newest holes: a dull glow at the burnt edge and a thread of smoke off each, rising and thinning
function shredHot(c,hot,now,sz){if(!hot||!hot.length)return;
  c.save();c.globalCompositeOperation='lighter';
  const k=c.getTransform?Math.hypot(c.getTransform().a,c.getTransform().b):2;
  for(const h of hot){if(k>=2.4){const g=c.createRadialGradient(h.p.x,h.p.y,h.r*.5,h.p.x,h.p.y,h.r*1.7);g.addColorStop(0,`rgba(255,140,50,${(.42*h.a).toFixed(3)})`);g.addColorStop(1,'rgba(255,90,30,0)');c.fillStyle=g;}
    else c.fillStyle=`rgba(255,120,40,${(.3*h.a).toFixed(3)})`;c.beginPath();c.arc(h.p.x,h.p.y,h.r*(k>=2.4?1.7:1.2),0,TAU);c.fill();}
  c.restore();
  c.save();c.lineCap='round';for(const h of hot){const P=new Path2D();let first=true;
    for(let i=0;i<=8;i++){const t=i/8,y=h.p.y-t*16*sz,x=h.p.x+Math.sin(now*2.6+h.seed%13+t*5)*2.2*sz*t;first?P.moveTo(x,y):P.lineTo(x,y);first=false;}
    c.strokeStyle=`rgba(170,165,172,${(.22*h.a).toFixed(3)})`;c.lineWidth=(1.4+h.a)*sz;c.stroke(P);c.strokeStyle=`rgba(200,196,204,${(.18*h.a).toFixed(3)})`;c.lineWidth=.6*sz;c.stroke(P);}c.restore();}
// a gold trim that the damage has torn: runs of it with gaps, and the loose ends hanging and swaying
function tornTrim(c,look,env,Q,lod,w,shred,now,seed,hang=true){
  if(look.noGold)return;
  if(Q.some(q=>q.h)){for(const R of FigKit.seen(Q))tornTrim(c,look,env,R,lod,w,shred,now,seed,hang);return;}
  if(shred<.25){goldLine(c,look,env,Q,lod,w);return;}
  const pts=resample(Q,4),N=pts.length,R=rng(seed),gaps=[];const n=1+Math.floor(shred*3);
  for(let i=0;i<n;i++){const a=.12+R()*.7,b=a+.05+R()*.08*shred;gaps.push([a,b]);}
  const inGap=t=>gaps.some(([a,b])=>t>a&&t<b);let run=[];
  for(let i=0;i<N;i++){const t=i/(N-1);if(inGap(t)){if(run.length>1)goldLine(c,look,env,run,lod,w,true);run=[];}else run.push(pts[i]);}
  if(run.length>1)goldLine(c,look,env,run,lod,w,true);
  // where it parted, the end hangs down (on a coat that is worn or held up)
  if(!hang)return;
  c.strokeStyle=tone(look,'gold',false,lod?1:0);c.lineWidth=Math.max(.45,.7*w);
  for(const [a] of gaps){const q=pts[Math.round(a*(N-1))],sw=Math.sin(now*2.6+a*20)*.35;c.beginPath();c.moveTo(q.x,q.y);c.quadraticCurveTo(q.x+sw*3,q.y+4,q.x+sw*5,q.y+8+R()*3);c.stroke();}}

// ---------- the coat held up as a shield ----------
// The front of the coat leaves his front and goes out to his hands: one edge in each hand, the cloth hanging from the lower hand to
// a flared corner at his shins and back under the hem to the front of his legs. e is how far it has come round (0: hanging as it
// always does, where this piece lies along the coat's front and does not show). It returns the piece and what draws on it.
function shieldShape(p,at,T,sz,fa,P0,fr,hb,e,now,gy){
  let h1=p[HAF],h2=p[HAB];if(h2.y<h1.y){const t=h1;h1=h2;h2=t;}
  const fl=Math.sin(now*7.1)*1.2*sz*e,fl2=Math.sin(now*5.3+1.3)*1.6*sz*e;
  const A0=at(T*.95,4.6),Wf=at(T*.05,8.4),U=mix(at(T*.62,8.8),add(h1,V(fa*1.2*sz,-1.5*sz)),e),L=mix(at(T*.12,8.8),add(h2,V(fa*1.5*sz,0)),e);
  // the free corner flares forward past the lower hand and hangs to the shins
  const gF=gy(h2.x+fa*12*sz),Fh=mix(fr,V(h2.x+fa*(13*sz+fl2),gF-17*sz+fl),e);
  const kf=V(p[KNF].x+fa*3.5*sz,p[KNF].y),Bh=mix(hb,V(kf.x+fa*1.5*sz,gy(kf.x)-20*sz),e),Kf=mix(mix(hb,Wf,.45),kf,e);
  const top=mix(A0,U,.5),bow=V(fa*1.5*sz*e,-4*sz*e);
  return{A0,Wf,U,L,Fh,Bh,Kf,top:add(top,bow),h1,h2};}

// ---------- under the coat ----------
// The vest's colours are read from the look (vest, plate, band, the tattoo inks); a look without them uses these.
const VEST_DEF={vest:'#0b0a10',vestFar:'#1c1628',plate:'#15131c',plateFar:'#221b30',band:'#100c0a',bandFar:'#1f1712',ink:'#7ff3e3',ink2:'#d9fffa',inkGold:'#e2b65a',crystal:'#9ffcf0',charge:'#0c0b10',brass:'#b28d3d'};
const vcol=(look,key,far)=>{const C=look.col[key+(far?'Far':'')]||look.col[key];return Array.isArray(C)?C[0]:C||VEST_DEF[key+(far?'Far':'')]||VEST_DEF[key];};
// The tattoos: a band round the upper arm and one above the wrist, each two rings with a row of runes between them, and between and
// beyond the bands a vine that winds down the arm with gold leaves and small curls, all in glowing ink, cyan with gold. The light
// breathes and runs slowly down the arm; an opening or a fast swing brightens it.
// With the magic gone out of him (o.dr, 0..1) the ink burns out and leaves scars in its pattern: an ember runs along the lines as the
// light goes, and then there is scar tissue, raised and paler than his skin, a little ragged, catching the light along one edge and
// dark along the other. o: {dr, L (toward the light), scar: [tissue, its lit edge, its shadow], clip (the arm, which the scars keep to)}
function rune(P,m,u,q,s){P.moveTo(m.x+u.x*s*1.7,m.y+u.y*s*1.7);P.lineTo(m.x+q.x*s,m.y+q.y*s);P.lineTo(m.x-u.x*s*1.7,m.y-u.y*s*1.7);P.lineTo(m.x-q.x*s,m.y-q.y*s);P.closePath();}
const SCAR_DEF=['#5f4c56','#a88c8a','#020103'],SCAR_LIGHT=['#c79a96','#f4d6cc','#6b4448'];
function tattoo(c,S0,E,Wr,wU,wL,k,lod,glow,far,now,seed,o={}){
  const dr=cl(o.dr||0,0,1),segs=[[S0,E,wU,0],[E,Wr,wL,1]],core=[],coreN=[],bands=[],leaves=new Path2D(),runes=new Path2D(),curls=new Path2D(),dots=[];
  for(const [a,b,w,j] of segs){const d=sub(b,a),Ls=len(d)||1,u=mul(d,1/Ls),q=perp(u),N=lod?18:9,f=j?7.4:6,ph=seed*.7+j*2.1,tb=j?.74:.3;
    // the band: two rings across the limb and the runes between them
    for(const dt of [-.055,.055]){const m=add(a,mul(u,(tb+dt)*Ls));bands.push([add(m,mul(q,w*.47)),sub(m,mul(q,w*.47))]);}
    if(lod)for(let i=-2;i<=2;i++)rune(runes,add(add(a,mul(u,tb*Ls)),mul(q,i*w*.19)),u,q,w*.055);
    // the vine, broken where the band crosses it
    for(let i=0;i<=N;i++){const t=.05+.9*i/N;if(Math.abs(t-tb)<.085){core.push(null);coreN.push(null);continue;}
      const sw=Math.sin(t*f+ph),pt=add(add(a,mul(u,t*Ls)),mul(q,sw*w*.33));core.push(pt);coreN.push(mul(q,w));
      if(lod&&i%3===1){const tw=Math.cos(t*f+ph);leafPath(leaves,pt,add(mul(u,.55),mul(q,tw>0?.85:-.85)),.38*w/4.5);}
      if(lod&&i%4===3){const sd=Math.sign(sw||1),cc=add(pt,mul(q,-sd*w*.13)),r=w*.1;curls.moveTo(cc.x+q.x*sd*r,cc.y+q.y*sd*r);curls.arc(cc.x,cc.y,r,Math.atan2(q.y*sd,q.x*sd),Math.atan2(q.y*sd,q.x*sd)+4.2,sd<0);}
      if(!lod&&i%3===0)dots.push(pt);}
    core.push(null);coreN.push(null);}
  const wave=t=>.66+.34*Math.sin(now*2.1-t*5+seed),G=glow*(far?.5:1)*(1-dr),em=dr>0&&dr<1?Math.sin(Math.PI*dr)*(far?.5:1):0,sc=dr>.3?ease((dr-.3)/.6):0;
  const poly=(Q=core)=>{c.beginPath();let first=true;for(const q of Q){if(!q){first=true;continue;}first?c.moveTo(q.x,q.y):c.lineTo(q.x,q.y);first=false;}for(const [a,b] of bands){c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);}};
  c.save();c.lineCap='round';c.lineJoin='round';
  if(G>.004||em>.004){c.globalCompositeOperation='lighter';
    if(G>.004){poly();c.strokeStyle='#2a8a80';c.lineWidth=Math.max(1.8,3.4/k);c.globalAlpha=(lod?.42:.6)*G*wave(0);c.stroke();
      c.strokeStyle='#7ff3e3';c.lineWidth=Math.max(.55,1.05/k);c.globalAlpha=Math.min(1,.85*G*wave(.5));c.stroke();
      if(lod){c.globalAlpha=Math.min(1,.9*G*wave(1));c.fillStyle='#e2b65a';c.fill(leaves);c.fill(runes);c.strokeStyle='#d9fffa';c.lineWidth=Math.max(.3,.5/k);c.globalAlpha=.7*G*wave(.8);c.stroke(curls);}
      else{c.fillStyle='#e2b65a';c.globalAlpha=.85*G;for(const q of dots){c.beginPath();c.arc(q.x,q.y,Math.max(.5,.8/k),0,TAU);c.fill();}}}
    // (the ember, as the light goes out of the ink)
    if(em>.004){poly();c.strokeStyle='#ff6a2a';c.lineWidth=Math.max(1.6,3/k);c.globalAlpha=.5*em;c.stroke();c.strokeStyle='#ffd7a8';c.lineWidth=Math.max(.5,.95/k);c.globalAlpha=.8*em;c.stroke();}
    c.globalCompositeOperation='source-over';}
  if(sc>0){
    // the scar: the vine a little ragged (each point moved off its line by its own small amount, the same every frame)
    const R=rng(seed*977+13),J=core.map((q,i)=>q?add(q,mul(coreN[i],(R()-.5)*.16)):(R(),null)),col=o.scar||SCAR_DEF,L=o.L||V(.3,-1),sw=Math.max(.7,1.3/k),a0=sc*(far?.6:1);
    if(o.clip)c.clip(o.clip);
    // its shadow away from the light, the tissue, its lit edge toward the light
    c.translate(-L.x*sw*.35,-L.y*sw*.35);poly(J);c.strokeStyle=col[2];c.globalAlpha=.7*a0;c.lineWidth=sw*1.55;c.stroke();c.translate(L.x*sw*.35,L.y*sw*.35);
    poly(J);c.strokeStyle=col[0];c.globalAlpha=.95*a0;c.lineWidth=sw;c.stroke();
    if(lod){c.fillStyle=col[0];c.fill(leaves);c.fill(runes);c.lineWidth=Math.max(.3,.55/k);c.strokeStyle=col[0];c.stroke(curls);}
    else for(const q of dots){c.fillStyle=col[0];c.beginPath();c.arc(q.x,q.y,Math.max(.45,.75/k),0,TAU);c.fill();}
    c.translate(L.x*sw*.3,L.y*sw*.3);poly(J);c.strokeStyle=col[1];c.globalAlpha=.55*a0;c.lineWidth=sw*.42;c.stroke();}
  c.restore();}
// ---------- the bare arm ----------
// With the coat off his arms are bare, and they are a fighter's: their outline is the muscles'. MUS gives the width each side at
// points down the arm, as a share of the arm's half-width there ([t, in front, behind]): the shoulder's cap; the biceps in front of the
// upper arm, peaking two thirds of the way down, and the triceps behind it, fullest high up and flattening into its tendon at the
// elbow; the forearm full near the elbow, its long outer muscle a little higher than the flexors inside, and slim at the wrist.
const MUS={up:[[.08,1.16,1.14],[.27,.98,1.2],[.44,1.22,1.3],[.63,1.42,1.1],[.82,1.08,.9],[.92,.94,.86]],lo:[[.12,1.3,1.38],[.3,1.3,1.12],[.5,1.02,.96],[.72,.88,.86],[.88,.82,.84]]};
// which side of the arm is its front (the biceps' side): the inside of the elbow's bend, or with the arm near straight, the side
// toward fwd (the way he faces); true when that is the tube's side A
function armFront(S0,E,W,fwd){const d0=nrm(sub(E,S0)),d1=nrm(sub(W,E)),cr=d0.x*d1.y-d0.y*d1.x;return Math.abs(cr)>.12?cr>0:dot(perp(d0),fwd)>0;}
function bareTube(S0,E,W,sz,lite,frontA){const sw=r=>frontA?r:[r[0],r[2],r[1]];
  const tb=FigKit.tube([S0,E,W],[4.25*sz*1.22,3.2*sz*1.12,2.55*sz*1.05],{cap0:1.36,prof:[MUS.up.map(sw),MUS.lo.map(sw)],gather:.34,stretch:.14,lite});
  tb.pf=.55;tb.frontA=frontA;return tb;}
// the light along the muscles' edges: where the shoulder's cap ends in its point between the biceps and the triceps, and close up the
// groove down the outside of the upper arm between them, the crease over the inside of the elbow and the forearm's long muscle
// across it; each a fine dark crease with the rim's light along its lit side. At the game's own size only the shoulder's cap, faintly.
// And on each muscle's belly that faces the light, a stroke of the light just inside its outline: the shoulder's cap, the biceps, the
// triceps, the forearm, so each reads as a round mass of its own.
function muscleLines(c,tb,rimCol,L,lod,k,far){
  const S0=tb.J[0],E=tb.J[1],W=tb.J[2],R=tb.R,fs=tb.frontA?1:-1;
  const seg=(a,b,ra,rb)=>{const d=sub(b,a),Ls=len(d)||1,u=mul(d,1/Ls),nf=mul(perp(u),fs);return(t,s)=>add(add(a,mul(u,t*Ls)),mul(nf,s*(ra+(rb-ra)*t)));};
  const U=seg(S0,E,R[0],R[1]),F=seg(E,W,R[1],R[2]);
  const lines=[[U(.15,.8),U(.3,.38),U(.43,.04)],[U(.12,-.84),U(.3,-.46),U(.43,.04)]];
  if(lod>=1)lines.push([U(.47,-.05),U(.64,-.17),U(.82,-.36)],[U(.84,.62),U(.9,.4),U(.95,.12)],[F(.06,-.74),F(.3,-.12),F(.6,.4)]);
  // (each a curve through its three points)
  const P=new Path2D();for(const [a,m,b] of lines){const cp=sub(mul(m,2),mix(a,b,.5));P.moveTo(a.x,a.y);P.quadraticCurveTo(cp.x,cp.y,b.x,b.y);}
  const al=far?.5:1,w=Math.max(.35,.55/k);
  c.save();c.clip(tb.p);c.lineCap='round';
  c.strokeStyle='#000000';c.globalAlpha=al*(lod?.6:.5);c.lineWidth=w*1.7;c.stroke(P);
  c.translate(L.x*w*1.2,L.y*w*1.2);c.strokeStyle=rimCol;c.globalAlpha=al*(lod?.48:.34);c.lineWidth=w*1.1;c.stroke(P);c.translate(-L.x*w*1.2,-L.y*w*1.2);
  // (the bellies: [the segment, from, to, which side])
  const nfU=mul(perp(nrm(sub(E,S0))),fs),nfF=mul(perp(nrm(sub(W,E))),fs);
  for(const [G,nf,t0,t1,sd] of [[U,nfU,.02,.3,1],[U,nfU,.02,.28,-1],[U,nfU,.46,.8,1],[U,nfU,.3,.62,-1],[F,nfF,.06,.42,1],[F,nfF,.04,.4,-1]]){
    const f=dot(mul(nf,sd),L);if(f<.12)continue;const a=G(t0,sd*.8),m=G((t0+t1)/2,sd*.95),b=G(t1,sd*.8),cp=sub(mul(m,2),mix(a,b,.5));
    c.beginPath();c.moveTo(a.x,a.y);c.quadraticCurveTo(cp.x,cp.y,b.x,b.y);c.strokeStyle=rimCol;c.globalAlpha=al*Math.min(1,f*1.3)*(lod?.42:.36);c.lineWidth=w*(lod?1.6:1.4);c.stroke();}
  c.restore();}
// the vest: close fitting, plate panels set into it, gold vine along its edges, cyan crystal fastenings down the front, a high collar
function vestOutline(at,T){return[[T+3.4,-3.6],[T*.97,-6.4],[T*.80,-8.3],[T*.55,-7.0],[T*.40,-6.2],[T*.18,-7.2],[T*.02,-8.1],[-T*.02,-7.7],[-T*.03,-1],
  [-T*.02,7.3],[T*.18,7.1],[T*.33,6.9],[T*.48,7.7],[T*.64,8.9],[T*.80,8.8],[T*.92,7.0],[T+.9,4.8],[T+3.6,3.7],[T+4.0,0]].map(([a,s])=>at(a,s));}
// the dagger in its sheath at the small of his back (where the game reaches for it: sheathPts), or the sheath alone once it is out
// (pt(a, b): a point a up his back from the hips and b out from it; on a turned torso a point out of sight is flagged h)
function sheathedDagger(c,pt,look,lod,k,full){const ink=Math.max(.35,.7/k);
  const g=pt(2,-6.5),t=pt(-15,-20);if(g.h||t.h)return;const d=nrm(sub(t,g)),q=perp(d),sh=[add(g,mul(q,2.1)),add(t,mul(q,.6)),add(t,mul(d,1.4)),sub(t,mul(q,.6)),sub(g,mul(q,2.1))];
  c.fillStyle=vcol(look,'band',false);c.beginPath();c.moveTo(sh[0].x,sh[0].y);for(const z of sh.slice(1))c.lineTo(z.x,z.y);c.closePath();c.fill();
  c.strokeStyle=tone(look,'gold',false,lod?1:0);c.lineWidth=ink;c.stroke();
  // the throat and the chape in gold
  const gc=tone(look,'gold',false,0);c.fillStyle=gc;const th=add(g,mul(d,1.2));c.beginPath();c.arc(th.x,th.y,1.5,0,TAU);c.fill();c.beginPath();c.arc(t.x,t.y,1.1,0,TAU);c.fill();
  if(!full)return;
  // the hilt standing out of it: a black grip, a small guard and a gold pommel
  const pm=pt(10,-3),gr=pt(5,-5);c.strokeStyle='#060509';c.lineWidth=2.6;c.beginPath();c.moveTo(g.x,g.y);c.lineTo(pm.x,pm.y);c.stroke();
  const x0=pt(4,-9),x1=pt(0,-4);c.strokeStyle=gc;c.lineWidth=1.2;c.beginPath();c.moveTo(x0.x,x0.y);c.lineTo(x1.x,x1.y);c.stroke();
  c.fillStyle=gc;c.beginPath();c.arc(pm.x,pm.y,1.4,0,TAU);c.fill();if(lod){c.strokeStyle='rgba(255,226,170,.45)';c.lineWidth=.4;c.beginPath();c.moveTo(gr.x,gr.y);c.lineTo(mix(gr,pm,.7).x,mix(gr,pm,.7).y);c.stroke();}}
// the breaching charge on his belt: a compact black and brass case with a cyan core behind a grille, a pull ring at its top
function beltCharge(c,pt,sz,look,lod,k,now){const box=[pt(3.4,-3.6),pt(3.4,3.8),pt(-3.6,3.8),pt(-3.6,-3.6)];if(box.some(q=>q.h))return;
  c.fillStyle=vcol(look,'charge',false);c.beginPath();c.moveTo(box[0].x,box[0].y);for(const z of box.slice(1))c.lineTo(z.x,z.y);c.closePath();c.fill();
  c.strokeStyle=vcol(look,'brass',false);c.lineWidth=Math.max(.45,.9/k);c.stroke();
  // the core
  const cc=pt(-.2,.2),pulse=.65+.35*Math.sin(now*4.2);c.save();c.globalCompositeOperation='lighter';
  if(lod){const g=c.createRadialGradient(cc.x,cc.y,0,cc.x,cc.y,3.6*sz);g.addColorStop(0,`rgba(217,255,250,${(.9*pulse).toFixed(3)})`);g.addColorStop(.45,`rgba(127,243,227,${(.55*pulse).toFixed(3)})`);g.addColorStop(1,'rgba(127,243,227,0)');c.fillStyle=g;c.beginPath();c.arc(cc.x,cc.y,3.6*sz,0,TAU);c.fill();}
  else{c.fillStyle=`rgba(127,243,227,${(.5*pulse).toFixed(3)})`;c.beginPath();c.arc(cc.x,cc.y,2.6*sz,0,TAU);c.fill();c.fillStyle=`rgba(217,255,250,${(.8*pulse).toFixed(3)})`;c.beginPath();c.arc(cc.x,cc.y,1.2*sz,0,TAU);c.fill();}c.restore();
  if(lod){c.strokeStyle='rgba(10,9,14,.85)';c.lineWidth=.45;for(let i=-1;i<=1;i++){const a=pt(-1.8,i*1.2),b=pt(1.8,i*1.2);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}}
  // the pull ring and its wire
  const r0=pt(3.4,2.4),ring=pt(5.6,3.4);c.strokeStyle=tone(look,'gold',false,0);c.lineWidth=Math.max(.45,.8/k);c.beginPath();c.moveTo(r0.x,r0.y);c.lineTo(ring.x,ring.y);c.stroke();
  c.beginPath();c.arc(ring.x,ring.y,1.5*sz,0,TAU);c.stroke();}


// ---------- the Pit's clothes ----------
// The work shirt (and his bare torso under the dressings) in profile, as the vest's outline is: collarless, the neck lower, looser
// through the body by B
function shirtOutline(at,T,B=1){return[[T+2.2,-3.4],[T*.97,-6.6*B],[T*.80,-8.6*B],[T*.55,-7.4*B],[T*.40,-6.6*B],[T*.18,-7.6*B],[T*.02,-8.4*B],[-T*.04,-8.2*B],[-T*.05,-1],
  [-T*.04,7.6*B],[T*.18,7.4*B],[T*.33,7.2*B],[T*.48,8.0*B],[T*.64,9.2*B],[T*.80,9.1*B],[T*.92,7.3*B],[T+.9,5],[T+2.4,3.6],[T+2.8,0]].map(([a,s])=>at(a,s));}
// a band of cloth w wide along a line of points (the dressings)
function stripPts(Q,w){const A=[],B=[];for(let i=0;i<Q.length;i++){const a=Q[Math.max(0,i-1)],b=Q[Math.min(Q.length-1,i+1)],nn=mul(perp(nrm(sub(b,a))),w/2);A.push(add(Q[i],nn));B.push(sub(Q[i],nn));}return[...A,...B.reverse()];}
// The near shoulder with the arm gone from it. bandStump: what is left of the shoulder, round, and (dressed) wrapped in linen, the old
// wound come through at its end. pinnedSleeve: the empty sleeve folded up and pinned at the shoulder with Tamm's pin, the fold of it
// swinging back a little as he moves (mat: the shirt's or the coat's; C: his chest, whose motion swings it)
function bandStump(c,look,env,Sh,u,n,sz,lod,k,gore,dressed,lift=0){
  if(lift)Sh=add(Sh,mul(u,1.2*sz*lift));
  const d=nrm(mix(nrm(add(mul(u,-1),mul(n,.2))),nrm(add(n,mul(u,.5))),lift*.7)),q=perp(d),top=add(Sh,mul(u,1.2*sz)),end=add(Sh,mul(d,4.4*sz)),P=capsule(top,end,9.4*sz,8.2*sz);
  look.paint(c,[P],dressed?'linen':'skin',env);
  c.save();c.strokeStyle='rgba(0,0,0,.55)';c.lineWidth=Math.max(.45,.7/k);c.stroke(P.p);
  if(!dressed){c.restore();return;}
  c.clip(P.p);
  // the turns of the dressing, on the slant round it
  c.strokeStyle='rgba(0,0,0,.34)';c.lineWidth=Math.max(.4,.55/k);
  for(const t of [.3,.58,.86]){const m=mix(top,end,t),a=add(m,add(mul(q,5.4*sz),mul(d,-1.1*sz))),b=add(m,add(mul(q,-5.4*sz),mul(d,1.1*sz)));c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
  // the old wound, come through the linen at the end
  if(gore){c.fillStyle=tone(look,'stain');c.globalAlpha*=.42;c.beginPath();c.ellipse(end.x+d.x*2.2*sz,end.y+d.y*2.2*sz,2.6*sz,1.6*sz,Math.atan2(q.y,q.x),0,TAU);c.fill();}
  c.restore();}
function pinnedSleeve(c,look,env,Sh,u,n,sz,lod,k,mat,C,ua,pinned=true,fa=25*sz,lift=0){const s=mat==='coat'?1.15:1,L=pinned?Math.max(13*sz,.72*(ua||27*sz))*s:((ua||27*sz)+fa*.8)*s;
  const vx=C&&C.px!=null&&typeof DT!=='undefined'?cl((C.x-C.px)/DT,-400,400):0,hd0=nrm(add(mix(mul(u,-1),V(0,1),.5),V(-vx*.0012,0)));
  // (lift: the reach of the arm that is not there, the shoulder up and the sleeve swung forward)
  if(lift)Sh=add(Sh,mul(u,1.2*sz*lift));const hd=nrm(mix(hd0,nrm(add(n,mul(u,.6))),lift*.85));let q=perp(hd);if(dot(q,n)<0)q=mul(q,-1);
  // (a: down the sleeve from the shoulder, as a share of its length; b: across it, forward +. Empty, it narrows and its foot trails a
  // little behind)
  const pt=(a,b)=>add(Sh,add(mul(hd,a*L),mul(q,(b-(pinned?.9:2.2)*a*a)*sz*s)));
  // (not pinned yet: the whole empty sleeve hangs from the shoulder, narrowing to the cuff, and swings)
  if(!pinned){const sl=piece([pt(0,4.6),pt(.3,3.6),pt(.6,2.9),pt(.9,2.5),pt(1,1.8),pt(1.02,-.4),pt(.98,-2.2),pt(.6,-2.8),pt(.3,-3.8),pt(0,-4.6)],.5,k>=2.4);look.paint(c,[sl],mat,env);
    const cap=capsule(add(Sh,mul(u,1.4*sz)),pt(.06,0),9.6*sz*s,8.8*sz*s);look.paint(c,[cap],mat,env);
    c.save();c.strokeStyle='rgba(0,0,0,.6)';c.lineWidth=Math.max(.5,.85/k);c.stroke(sl.p);c.clip(sl.p);c.strokeStyle='rgba(0,0,0,.4)';c.lineWidth=Math.max(.4,.6/k);
    for(const [a0,b0,a1,b1] of [[.1,1.6,.4,.4],[.3,-1.4,.62,-.2],[.66,1.2,.86,.2],[.92,2,.94,-2]]){const A=pt(a0,b0),Z=pt(a1,b1);c.beginPath();c.moveTo(A.x,A.y);c.lineTo(Z.x,Z.y);c.stroke();}c.restore();return;}
  // the empty sleeve hanging from the shoulder, its foot folded up and pinned
  const sl=piece([pt(0,4.6),pt(.3,3.9),pt(.62,3.2),pt(.9,2.7),pt(1,1),pt(1.01,-1),pt(.92,-2.5),pt(.62,-3.1),pt(.3,-3.9),pt(0,-4.6)],.5,k>=2.4);
  look.paint(c,[sl],mat,env);
  // over the shoulder: the sleeve's head round the top of it
  const cap=capsule(add(Sh,mul(u,1.4*sz)),pt(.1,0),9.6*sz*s,8.8*sz*s);look.paint(c,[cap],mat,env);
  c.save();c.strokeStyle='rgba(0,0,0,.6)';c.lineWidth=Math.max(.5,.85/k);c.stroke(sl.p);
  c.clip(sl.p);
  // the cuff folded up over its foot: the top edge of the doubled cloth (dark under a lit edge), and the creases of the empty cloth
  {const f0=pt(.58,3.4),f1=pt(.6,-3.3),m=pt(.66,0);c.beginPath();c.moveTo(f0.x,f0.y);c.quadraticCurveTo(m.x,m.y,f1.x,f1.y);c.stroke();
    c.strokeStyle=rgbaHex(look.col.rim||'#ffcf86',.3);c.lineWidth=Math.max(.4,.6/k);c.beginPath();c.moveTo(f0.x-hd.x*.9*sz,f0.y-hd.y*.9*sz);c.quadraticCurveTo(m.x-hd.x*.9*sz,m.y-hd.y*.9*sz,f1.x-hd.x*.9*sz,f1.y-hd.y*.9*sz);c.stroke();}
  c.strokeStyle='rgba(0,0,0,.4)';c.lineWidth=Math.max(.4,.6/k);for(const [a0,b0,a1,b1] of [[.14,1.8,.5,.6],[.2,-1.6,.48,-.4],[.7,1.6,.94,.4]]){const A=pt(a0,b0),Z=pt(a1,b1);c.beginPath();c.moveTo(A.x,A.y);c.lineTo(Z.x,Z.y);c.stroke();}
  c.restore();
  // Tamm's pin, through the fold
  const p0=pt(.5,1.4),p1=pt(.66,.9),pc=tone(look,'pin');c.strokeStyle=pc;c.lineWidth=Math.max(.55,.65*sz);c.lineCap='round';c.beginPath();c.moveTo(p0.x,p0.y);c.lineTo(p1.x,p1.y);c.stroke();
  c.fillStyle=pc;c.beginPath();c.arc(p0.x,p0.y,.9*sz,0,TAU);c.fill();
  if(lod>=1){c.fillStyle='rgba(255,250,235,.85)';c.beginPath();c.arc(p0.x-.25*sz,p0.y-.25*sz,.34*sz,0,TAU);c.fill();}}

// ---------- the coat on its own ----------
// Thrown off, the coat is its own cloth: a grid of points (rows from the collar down to the hem, columns from the centre of the back
// round his near side to the front edge), each with a depth z of its own (+z away from the viewer, as the game's depths go), joined
// to its neighbours and across each cell. coatCloth takes its shape from the coat as it hangs on him that moment; the caller gives
// the points their throw (px, py, pz) and steps it; on the floor it spreads out in x and depth like cloth does. coatFly draws it.
const CLOTH={rows:7,cols:5,iters:6};
const PJX=()=>typeof PSX==='number'?PSX:.2,PJY=()=>typeof PSY==='number'?PSY:.75;
function coatCloth(F){const p=F.p,fa=F.facing,b=F.body,P0=p[PEL],C0=p[CHE],u=nrm(sub(C0,P0)),n=mul(perp(u),fa),T=len(sub(C0,P0)),sz=b.h*(.93+.07*b.bulk);
  const at=(a,s)=>add(add(P0,mul(u,a)),mul(n,s*sz));
  const st=F._coat&&F._coat.q;let fr=st?V(st[0].x,st[0].y):at(-T*1.6,10),bk=st?V(st[1].x,st[1].y):at(-T*1.6,-12);if(fr.x*fa<bk.x*fa){const t=fr;fr=bk;bk=t;}
  // the back edge and the front edge, collar to hem
  const back=[at(T+1.5,-3.6),at(T*.8,-8.6),at(T*.4,-6.6),at(-T*.06,-9.2),mix(at(-T*.06,-9.2),bk,.5),bk],front=[at(T+1,4.2),at(T*.8,9.4),at(T*.4,7.4),at(T*.05,8.8),mix(at(T*.05,8.8),fr,.5),fr];
  const R=CLOTH.rows,Cn=CLOTH.cols,pts=[],edge=(E,v)=>{const s0=v*(E.length-1),i=Math.min(E.length-2,Math.floor(s0)),f=s0-i;return mix(E[i],E[i+1],f);};
  for(let r=0;r<R;r++){const v=r/(R-1),a=edge(back,v),bq=edge(front,v);
    // round his near side: nearest the viewer halfway from the back to the front, the skirt standing out further than the shoulders
    for(let j=0;j<Cn;j++){const w=j/(Cn-1),q=mix(a,bq,w),z=-Math.sin(Math.PI*Math.min(1,w*1.15))*(8+5*v)*sz;pts.push({x:q.x,y:q.y,z,px:q.x,py:q.y,pz:z});}}
  const links=[],L=(i,j)=>links.push([i,j,Math.hypot(pts[i].x-pts[j].x,pts[i].y-pts[j].y,pts[i].z-pts[j].z)]);
  for(let r=0;r<R;r++)for(let j=0;j<Cn;j++){const i=r*Cn+j;if(j<Cn-1)L(i,i+1);if(r<R-1)L(i,i+Cn);if(r<R-1&&j<Cn-1){L(i,i+Cn+1);L(i+1,i+Cn);}}
  let z0=0,z1=0;for(const q of pts){z0=Math.min(z0,q.z);z1=Math.max(z1,q.z);}
  return{pts,links,rows:R,cols:Cn,shred:cl(F.coatShred||0,0,1),fa,sz,t:0,z0,z1};}
// one step: gravity (a cloth falls slower than a body, the air under it), a little drift, the links (stretch hardly at all, crumple
// freely), and the floor, where it slides to a stop
function coatClothStep(C,dt,groundY){const g=820,d=Math.pow(.985,dt*120),gy=typeof groundY==='function'?groundY:(()=>groundY),N=C.pts.length;C.t+=dt;
  // the air: going fast, the cloth opens out across its own motion like a cape, instead of trailing edge-on like a flag in no wind
  let mx=0,my=0,mz=0,ux=0,uy=0,uz=0;for(const q of C.pts){mx+=q.x;my+=q.y;mz+=q.z;ux+=q.x-q.px;uy+=q.y-q.py;uz+=q.z-q.pz;}mx/=N;my/=N;mz/=N;ux/=N;uy/=N;uz/=N;
  const us=Math.hypot(ux,uy,uz),air=us>.4?Math.min(.05,.02*us)*dt*120:0;
  for(const q of C.pts){const vx=(q.x-q.px)*d,vy=(q.y-q.py)*d,vz=(q.z-q.pz)*d;q.px=q.x;q.py=q.y;q.pz=q.z;
    q.x+=vx+Math.sin(C.t*3.1+q.px*.05)*.03;q.y+=vy+g*dt*dt*.55;q.z+=vz;
    if(air){let rx=q.x-mx,ry=q.y-my,rz=q.z-mz;const al=(rx*ux+ry*uy+rz*uz)/(us*us);rx-=ux*al;ry-=uy*al;rz-=uz*al;q.x+=rx*air;q.y+=ry*air*.6;q.z+=rz*air*.7;}
    // it never spreads further in depth than a coat lying on a floor would
    q.z=cl(q.z,C.z0-14*C.sz,C.z1+14*C.sz);}
  for(let it=0;it<CLOTH.iters;it++){for(const [i,j,L0] of C.links){const a=C.pts[i],b=C.pts[j],dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z,dd=Math.hypot(dx,dy,dz)||1e-6;if(dd<=L0*1.02&&dd>=L0*.62)continue;
      const tgt=dd>L0?L0*1.02:L0*.62,k=(dd-tgt)/dd*.5;a.x+=dx*k;a.y+=dy*k;a.z+=dz*k;b.x-=dx*k;b.y-=dy*k;b.z-=dz*k;}
    for(const q of C.pts){const fl=gy(q.x)-1;if(q.y>fl){q.y=fl;if(q.py<q.y)q.py=q.y;q.px=q.x-(q.x-q.px)*.55;q.pz=q.z-(q.z-q.pz)*.55;}}}}
// drawn where the caller has put the cloth's depth: each point drawn at its own depth on top of that
function coatFly(c,C,o={}){const look=LOOKS[o.look||cfg.look],R=C.rows,Cn=C.cols,tr=c.getTransform?c.getTransform():null,k=tr&&tr.a!=null?Math.hypot(tr.a,tr.b)||1:2,lod=k<2.4?0:k<5?1:2,now=o.now??C.t;
  const Ld=o.dir?nrm(o.dir):V(.3,-1),env={k,fa:C.fa,L:Ld,far:false,rw:Math.max(.9,1.25/k)*1.05,ow:Math.max(.55,1.05/k)},sx=PJX(),sy=PJY();
  const P=C.pts.map(q=>V(q.x+q.z*sx,q.y-q.z*sy)),at=(r,j)=>P[r*Cn+j],Z=(r,j)=>C.pts[r*Cn+j].z;
  const Ly=C.shred>0?layerOpen(c,P,12):null,c0=c;if(Ly)c=Ly.g;
  c.save();c.lineJoin='round';
  // cell by cell, far ones first; a cell turned over shows the lining
  const cells=[];for(let r=0;r<R-1;r++)for(let j=0;j<Cn-1;j++)cells.push({r,j,z:(Z(r,j)+Z(r,j+1)+Z(r+1,j)+Z(r+1,j+1))/4});
  cells.sort((A,B)=>B.z-A.z);
  const coatC=tone(look,'coat',false,0),coatD=tone(look,'coat',false,1)||coatC,lin=mid(tone(look,'lining',false,0),coatC.length===7?coatC:'#0c0b11',.62),rimC=look.col.rim||'#ffcf86';
  for(const e of cells){const a=at(e.r,e.j),b=at(e.r,e.j+1),d=at(e.r+1,e.j+1),f=at(e.r+1,e.j),ar=((b.x-a.x)*(f.y-a.y)-(b.y-a.y)*(f.x-a.x))*C.fa;
    const Q=new Path2D();Q.moveTo(a.x,a.y);Q.lineTo(b.x,b.y);Q.lineTo(d.x,d.y);Q.lineTo(f.x,f.y);Q.closePath();
    c.fillStyle=ar<0?lin:coatC;c.globalAlpha=ar<0?.8:1;c.fill(Q);c.globalAlpha=1;c.strokeStyle=ar<0?lin:coatC;c.lineWidth=Math.max(.6,1.1/k);c.stroke(Q);
    // a fold catches the light along its top edge
    if(ar>=0&&lod){c.strokeStyle=rimC;c.globalAlpha=.18;c.lineWidth=Math.max(.3,.5/k);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();c.globalAlpha=1;}
    if(ar>=0&&coatD!==coatC){c.fillStyle=coatD;c.globalAlpha=.25;c.fill(Q);c.globalAlpha=1;}}
  const map=(u,v)=>{const s0=cl(v,0,1)*(R-1),r=Math.min(R-2,Math.floor(s0)),f=s0-r,t=cl(u,0,1)*(Cn-1),j=Math.min(Cn-2,Math.floor(t)),g=t-j;
    return mix(mix(at(r,j),at(r,j+1),g),mix(at(r+1,j),at(r+1,j+1),g),f);};
  const outline=new Path2D();{const ring=[];for(let j=0;j<Cn;j++)ring.push(at(0,j));for(let r=1;r<R;r++)ring.push(at(r,Cn-1));for(let j=Cn-2;j>=0;j--)ring.push(at(R-1,j));for(let r=R-2;r>0;r--)ring.push(at(r,0));
    outline.moveTo(ring[0].x,ring[0].y);for(const q of ring.slice(1))outline.lineTo(q.x,q.y);outline.closePath();}
  // the rags at the hem: strips cut up into it
  if(Ly&&C.shred>0){const tears=shredHem([],C.shred);c.save();c.globalCompositeOperation='destination-out';c.fillStyle='#000';
    for(const tn of tears){const w=tn.w/26,dv=Math.min(.45,tn.d/70),u0=1-tn.t,A=map(u0-w,1.02),B=map(u0+w,1.02),Tp=map(u0,1-dv);c.beginPath();c.moveTo(A.x,A.y);c.lineTo(Tp.x,Tp.y);c.lineTo(B.x,B.y);c.closePath();c.fill();}c.restore();}
  const hot=shredOn(c,look,outline,map,C.shred,now,k,C.sz,'#07060a',!!Ly);
  c.restore();if(Ly){c=c0;layerClose(c,Ly);}shredHot(c,hot,now,C.sz);
  // the gold down the front edge and round what is left of the hem
  const frontE=[];for(let r=0;r<R;r++)frontE.push(at(r,Cn-1));tornTrim(c,look,env,frontE,lod,.9,C.shred,now,77,false);
  const hemE=[];for(let j=0;j<Cn;j++)hemE.push(at(R-1,j));tornTrim(c,look,env,hemE,lod,.9,Math.max(C.shred,.3),now,91,false);}

// ---------- the whole figure ----------
// F: a fighter, or a snapshot of one (snap below). o: {look, outfit, hair, light (a point in the fighter's drawing frame) or dir, now,
// yaw: turned about his upright axis (FigKit.view; 0, the profile the fights are drawn in, unless F.yaw says otherwise), headYaw: his
// head's own turn (by default it leads the body's, FigKit.headYaw), spin: how far through a spin he is, 0..1 (the coat flares)}
// The torso as elliptical sections up it, for a turned view. How wide he is across, up the torso ([a, half-width across])
function torsoWide(T,D){return[[-.17*T,11.6*D],[-.1*T,12.6*D],[0,12.8*D],[.2*T,11.6*D],[.4*T,10.9*D],[.55*T,11.8*D],[.72*T,13.2*D],[.86*T,14.6*D],[.97*T,15.2*D],[T+.4,11],[T+1.4,6],[T+2.6,4.8]];}
// a value along a table of rows [a, ...], straight between rows, held at the ends
function tabAt(tab,a){let i=0;while(i<tab.length-2&&tab[i+1][0]<a)i++;const A=tab[i],B=tab[i+1],t=cl((a-A[0])/((B[0]-A[0])||1),0,1);return A.slice(1).map((v,j)=>v+(B[j+1]-v)*t);}
// The sections of a torso drawn round an outline (points [a, s] in order round it): at each height, from where the outline crosses it
// at the back to where it crosses it at the front, as wide across as wide() says; above or below the outline (the hips under a short
// vest), the body's own sections (body). So the outline's back edge is the line down the middle of his back, its front edge the line
// down his front, and turned, its two halves meet on them.
function torsoSecs(Jl,wide,body){let a0=1e9,a1=-1e9;for(const q of Jl){a0=Math.min(a0,q[0]);a1=Math.max(a1,q[0]);}
  const cross=a=>{let lo=1e9,hi=-1e9;for(let i=0;i<Jl.length;i++){const p=Jl[i],q=Jl[(i+1)%Jl.length];if((p[0]-a)*(q[0]-a)>0||p[0]===q[0])continue;const s=p[1]+(q[1]-p[1])*(a-p[0])/(q[0]-p[0]);lo=Math.min(lo,s);hi=Math.max(hi,s);}return lo<hi?[lo,hi]:null;};
  const as=[...new Set([...Jl.map(q=>q[0]),...wide.map(q=>q[0]),...body.map(q=>q[0])])].sort((x,y)=>x-y);
  return as.map(a=>{const e=a>a0+.01&&a<a1-.01?cross(a):null,B=tabAt(body,a);return[a,e?e[0]:B[0],e?e[1]:B[1],tabAt(wide,a)[0]];});}
// the body's own sections where no garment's outline says otherwise: [a, s at the back, s at the front]
function torsoBody(T,D){return[[-.25*T,-6.6,4.2],[-.17*T,-8.4,5.8],[-.1*T,-8.8*D,6.6*D],[0,-9.3*D,7.7*D],[.2*T,-7.6*D,7.7*D],[.4*T,-6.5*D,8.2*D],[.55*T,-7.3*D,9*D],
  [.72*T,-8.9*D,10*D],[.86*T,-8.8*D,9.2*D],[.97*T,-6.2,7.8*D],[T+.4,-4.4,5.2],[T+1.4,-3.3,3],[T+2.6,-2.6,1]];}
const SEEN=new WeakMap();
function draw(c,F,o={}){
  headPaths();
  // (F.wear: Act I, the Pit, and what he wears there, in the Pit's colours: {top: 'bare' or 'shirt', coat ('oilcloth'), scarf, feet:
  // 'bare' or 'boots', belt, bandage}. F.oneArm: the arm he has left is the rig's front arm, the one that holds a weapon, and it is his
  // left: it is drawn on his far side, and the near shoulder carries what is left of the other)
  const WEAR=F.wear&&typeof F.wear==='object'?F.wear:null,ONE=!!F.oneArm,lk=o.look||cfg.look;
  const look=WEAR?pitLook(lk):LOOKS[lk],out=WEAR?{coat:WEAR.coat==='oilcloth',scarf:!!WEAR.scarf}:OUTFITS[o.outfit||cfg.outfit],hair=HAIRS[o.hair||cfg.hair],now=o.now??(F.t||0);
  const p0=F.p,fa=F.facing,b=F.body,tr=c.getTransform?c.getTransform():null,k=tr&&tr.a!=null?Math.hypot(tr.a,tr.b)||1:2;
  const P0=p0[PEL],C0=p0[CHE],u0=nrm(sub(C0,P0)),n0=mul(perp(u0),fa),T=len(sub(C0,P0)),sz=b.h*(.93+.07*b.bulk);
  const at=(a,s)=>add(add(P0,mul(u0,a)),mul(n0,s*sz));
  const Ld=o.dir?nrm(o.dir):o.light?nrm(sub(o.light,mix(P0,C0,.5))):nrm(V(.5,-1));
  const env={k,fa,L:Ld,far:false,rw:Math.max(.9,1.25/k)*1.05,ow:Math.max(.55,1.05/k),planeMax:5.4*sz,litMin:3.1*sz};
  const lod=Math.max(o.lodMin||0,k<2.4?0:k<5?1:2);  // 0: game size, 1: close, 2: portrait (o.lodMin: a close-up that is small on the screen)
  const gy=typeof F.gr==='function'?(x=>F.gr(x)):(x=>F.ground??(Math.max(p0[FTF].y,p0[FTB].y)+3));
  const paint=(ps,mat,far=false)=>{env.far=far;look.paint(c,ps,mat,env);env.far=false;};
  // ----- turned (in a spin): how he is seen. Each joint has a place across him: the near arm and leg toward the viewer at yaw 0, the
  // far ones away from him, a far hand on the grip where the grip is. p is where each joint is seen, fv the way he seems to face, and
  // dp how far toward the viewer a place on him is, which decides what is drawn over what -----
  const yaw=+(o.yaw??F.yaw??0)||0,TN=Math.abs(Math.sin(yaw))>.015||Math.cos(yaw)<0;
  const onGrip=(P,td)=>{const h=P[HAB],a=sub(P[HAF],mul(td,9)),bq=P[TIP],ab=sub(bq,a),t=cl(dot(sub(h,a),ab)/(dot(ab,ab)||1),0,1);return len(sub(h,add(a,mul(ab,t))))<4.5;};
  const tipDir0=nrm(sub(p0[TIP],p0[HAF])),offOnGrip=!ONE&&onGrip(p0,tipDir0);
  // (o.latArm, o.latLeg: how far out from his middle his hands and elbows, and his legs, are drawn, as a share of where they would be: in
  // a turn round, his hands come in to the middle of him and his feet in under him as he faces the viewer)
  const kA=o.latArm??1,kE=.3+.7*kA;
  const pxs=(P0.x+C0.x)/2,VW=TN?FigKit.view(pxs,fa,yaw):null,LS=12*sz,LH=5.6*sz*(o.latLeg??1),fwd=q=>cl((q.x-pxs)*fa/(.55*T),0,1);
  // (a hand out in front of him comes in toward his middle, an elbow a little; a far hand on the grip is with the near one)
  const sw=ONE?-1:1,lHF=sw*LS*(1-.5*fwd(p0[HAF]))*kA,lEF=sw*LS*(1-.15*fwd(p0[ELF]))*kE,lHB=offOnGrip?lHF:-LS*(1-.5*fwd(p0[HAB]))*kA,lEB=offOnGrip?0:-LS*(1-.15*fwd(p0[ELB]))*kE;
  // (o.latKnee, o.latFoot: his knees and feet set further out than his hips, sitting with his knees apart as he faces the viewer; the
  // near leg's and the far leg's own, o.latKneeN/F and o.latFootN/F, standing easy with one foot out)
  const LKn=LH*(o.latKneeN??o.latKnee??1),LKf=LH*(o.latKneeF??o.latKnee??1),LFn=LH*(o.latFootN??o.latFoot??1),LFf=LH*(o.latFootF??o.latFoot??1),
    LAT=[0,0,0,lEF,lHF,lEB,lHB,LKn,LFn,-LKf,-LFf,lHF];
  const p=TN?p0.map((q,i)=>VW.at(q,LAT[i])):p0,fv=TN?VW.fv:fa,u=TN?nrm(sub(p[CHE],p[PEL])):u0,n=mul(perp(u),fv);
  // (where his hand and hips were drawn, turned or not: for a scene's own things that go in his hand or his lap)
  SEEN.set(F,{haf:V(p[HAF].x,p[HAF].y),pel:V(p[PEL].x,p[PEL].y),turned:TN});
  const dp=(q,l)=>TN?VW.dep(q,l):l;
  // a thing held at one place across him (the weapon in the near hand, the dagger in the far one, what hangs at his hip) is drawn as
  // its profile drawing, squeezed and shifted as he turns
  const across=(l,fn)=>{if(!TN){fn();return;}const cc=Math.abs(VW.c)<.07?(VW.c<0?-.07:.07):VW.c;c.save();c.translate(VW.px+fa*l*VW.s,0);c.scale(cc,1);c.translate(-VW.px,0);fn();c.restore();};
  const sh0=at(T-2.8*sz,-.6),SH=TN?[VW.at(sh0,LS),VW.at(sh0,-LS)]:[sh0,sh0],HIP=TN?[VW.at(P0,LH),VW.at(P0,-LH)]:[P0,P0],shoulder=SH[0];
  const D=out.coat?(WEAR?1.16:1.07):1,WIDE=torsoWide(T,D);
  // the jacket's outline in profile (or the coat's body); turned, the torso's sections are drawn round whatever he wears over it
  const J=[[T+1.2,-3.4],[T*.97,-6.2],[T*.80,-8.6*D],[T*.55,-7.0*D],[T*.40,-6.1*D],[T*.18,-7.4*D],[T*.0,-8.9*D],[-T*.12,-8.6],[-T*.16,-6.5],[-T*.15,2.0],
    [-T*.11,5.4],[T*.05,7.4*D],[T*.20,7.3*D],[T*.33,7.0*D],[T*.48,7.9*D],[T*.64,9.4*D],[T*.80,9.4*D],[T*.92,7.6*D],[T+.9,4.2],[T+2.4,.4]];
  const TAB=TN?torsoSecs(WEAR&&WEAR.coat!=='oilcloth'?shirtOutline((a,s)=>[a,s],T,WEAR.top==='shirt'?1.05:.94):F.coatOff&&!WEAR?vestOutline((a,s)=>[a,s],T):J,WIDE,torsoBody(T,D)):null,secAt=a=>tabAt(TAB,a);
  // the coat: worn (out.coat), swept round as a shield, shot to rags; or off, and the vest and bare arms under it
  const goldC=tone(look,'gold',false,0);
  const coatOff=!WEAR&&!!F.coatOff,coatOn=out.coat&&!coatOff,shield=coatOn&&!TN&&!WEAR?ease(F.coatShield||0):0,shred=coatOn&&!WEAR?cl(F.coatShred||0,0,1):0;let shieldAt=null;
  const hq0=p0[HAF],hsp=hq0.px!=null&&typeof DT!=='undefined'?Math.hypot(hq0.x-hq0.px,hq0.y-hq0.py)/DT:0,glowK=(1+((o.opening||F.opening)?.8:0)+cl(hsp/800,0,.6)+cl(F.flare||0,0,1.4));
  // the tears on one piece of cloth, kept inside it (AT: where a place on a turned torso is seen)
  const rips=F.rips||[],gore=o.gore||null,rim=look.col.rim||'#ffcf86',colOf=(key,f)=>{const v=look.col[key];return Array.isArray(v)?v[1]:v||f;};let skirt=null;
  const tear=(g,clip,under,cc=c,AT=null)=>{if(!rips.some(r=>r.g===g))return;const acc={hole:new Path2D(),gore:new Path2D(),rim:new Path2D()};
    for(const r of rips){if(r.g!==g)continue;let ctr,d;
      if(g==='skirt'){if(!skirt)continue;const top=mix(skirt.HF,skirt.HB,r.t),bot=skirt.base(r.t);ctr=mix(top,bot,r.v);const h=nrm(sub(skirt.bk,skirt.fr));d=add(mul(h,Math.cos(r.ang)),mul(perp(h),Math.sin(r.ang)*fa));}
      else if(AT){const a=dot(sub(mix(p0[r.a],p0[r.b],r.u),P0),u0);ctr=AT(a,r.off);if(ctr.h)continue;const e=AT(a+Math.cos(r.ang)*3,r.off+Math.sin(r.ang)*3/sz);d=nrm(sub(e,ctr));}
      else{const A=p[r.a],B=p[r.b],sd=nrm(sub(B,A)),nn=mul(perp(sd),fv);ctr=add(mix(A,B,r.u),mul(nn,r.off*sz));d=add(mul(sd,Math.cos(r.ang)),mul(nn,Math.sin(r.ang)));}
      ripShape(ctr,d,r,acc,.7/k);if(o.onRip)o.onRip(r,ctr,cc);}
    cc.save();cc.clip(clip);cc.fillStyle=under;cc.fill(acc.hole);if(gore){cc.fillStyle=gore;cc.fill(acc.gore);}
    cc.strokeStyle=rim;cc.globalAlpha*=.72;cc.lineWidth=Math.max(.5,.95/k);cc.stroke(acc.rim);cc.restore();};
  c.save();c.lineCap='round';c.lineJoin='round';

  // the scarf trails from the back of the neck, behind everything
  if(out.scarf&&F.scarf&&F.scarf.length>2&&!F.severed)across(0,()=>scarfRibbon(c,F,look,env,now,sz));

  // ----- the arms -----
  // An arm is one shape from the shoulder to the wrist: the shoulder's mass is its rounded top, so it turns with the upper arm, and it
  // rides up the body a little as the arm is raised; the elbow gathers the sleeve on its inside and is pulled round on its outside.
  const shoulderFor=(E,S)=>{const d=nrm(sub(E,S)),up=dot(d,u);return add(S,add(mul(u,cl(up,0,1)*1.5*sz),mul(d,.6*sz)));};
  const armParts=(E,H,bare,S)=>{const fd=nrm(sub(H,E)),W=sub(H,mul(fd,3.6*sz)),S0=shoulderFor(E,S),W0=sub(W,mul(fd,.2*sz));
    // (lit across about half its width: the plane down the top of the forearm and over the shoulder; bare, the muscles' outline)
    const tb=bare?bareTube(S0,E,W0,sz,lod===0,armFront(S0,E,W0,n)):FigKit.tube([S0,E,W0],[4.25*sz,3.2*sz,2.55*sz],{cap0:1.16,bulge:[.1,.05],gather:.34,stretch:.14,lite:lod===0});tb.pf=.55;
    return{tb,up:tb,lo:tb,cuff:capsule(sub(W,mul(fd,.4*sz)),add(W,mul(fd,1*sz)),4.9*sz,4.6*sz),W,fd,H,E,S:S0};};
  // (turned, a blade pointed at the viewer is seen end on: the fist then lies along the forearm)
  const tipV=sub(p[TIP],p[HAF]),tipDir=!TN||len(tipV)>6?nrm(tipV):nrm(sub(p[HAF],p[ELF])),armed=F.wp?!F.wp.unarmed:!!(F.weaponKey&&F.weaponKey!=='unarmed');
  // a hand with some weight to it: a full fist, the thumb's knuckle along the top of the grip
  const fist=(H,g,s)=>{const q=perp(g),k=1.22,pt=(a,bb)=>add(H,add(mul(g,a*s*k),mul(q,bb*s*k)));
    return piece([pt(-3.2,-2.7),pt(.4,-3.3),pt(2.5,-3.7),pt(3.9,-1.5),pt(3.8,1.4),pt(2.7,3),pt(-2.8,3),pt(-3.8,.2)],.55);};
  // a hand at rest, open (F.openHand, when it holds nothing): the palm and the fingers together, a little curled, the thumb along it
  const openHand=(H,g,s)=>{const q=perp(g),k=1.12,pt=(a,bb)=>add(H,add(mul(g,a*s*k),mul(q,bb*s*k)));
    return piece([pt(-2.8,-2.5),pt(1.4,-2.8),pt(4.8,-2.5),pt(7.8,-1.8),pt(9.6,-.6),pt(9.5,.9),pt(7.6,1.9),pt(4.2,2.5),pt(1.6,2.9),pt(-.6,4.3),pt(-2.4,3.9),pt(-3.3,.6)],.5);};
  const foldCol={lit:rgbaHex(look.col.rim||'#ffcf86',.26),dark:'rgba(0,0,0,.55)'},foldFar={lit:rgbaHex(look.col.rim||'#ffcf86',.12),dark:'rgba(0,0,0,.3)',far:true};
  // a bare arm: the shoulder's swell, the upper arm and the forearm in skin, the tattoos in their light, a leather wrap at the wrist
  const bareArm=(A,far)=>{const wr=capsule(sub(A.W,mul(A.fd,.7*sz)),add(A.W,mul(A.fd,.9*sz)),5.9*sz,5.6*sz);
    paint([A.tb],'skin',far);muscleLines(c,A.tb,look.col.rim||'#ffcf86',env.L,lod,k,far);
    tattoo(c,A.S,A.E,A.W,8.8*sz,6.2*sz,k,lod,glowK,far,now,far?3:7,{dr:F.drain,L:env.L,scar:isNoir(look)?SCAR_DEF:SCAR_LIGHT,clip:A.tb.p});if(!WEAR)paint([wr],'band',far);
    if(!far){const q=perp(A.fd),e=sub(A.W,mul(A.fd,.2*sz));goldLine(c,look,env,[add(e,mul(q,2.9*sz)),sub(e,mul(q,2.9*sz))],lod,.7,true);}};
  // the far arm, and the dagger in its hand
  const farArm=far=>{const AB=armParts(p[ELB],p[HAB],coatOff,SH[1]);
    if(coatOff)bareArm(AB,far);
    else{paint([AB.tb],'suit',far);FigKit.folds(c,AB.tb,env,far?foldFar:foldCol);tear('armF',AB.tb.p,colOf(far?'liningFar':'lining',far?'#123d39':'#1d625c'));paint([AB.cuff],'shirt',far);}
    paint([fist(p[HAB],offOnGrip?tipDir:AB.fd,sz*.95)],'skin',far);
    if(o.afterFarArm)across(LAT[HAB],()=>o.afterFarArm(F));};
  // the weapon, then the near arm over its grip
  const nearArm=far=>{
    if(armed&&F.weaponKey==='elven'&&o.bladeOK!==false){const pal=Object.assign({},look.col,{gold:tone(look,'gold',false,0),goldDim:tone(look,'gold',false,1)});
      const hv=hq0.px!=null&&typeof DT!=='undefined'?V((hq0.x-hq0.px)/DT,(hq0.y-hq0.py)/DT):V(0,0);
      across(LAT[HAF],()=>blade(c,p0[HAF],p0[TIP],fa,o.arcSt!==undefined?o.arcSt:(F.arcSt||null),pal,isCel(look)?look.line:null,env.ow,now,env.L,env.k,hv));}
    else if(armed&&o.drawOther)across(LAT[HAF],()=>o.drawOther(F));
    // (F.armOff: the near arm is gone at the shoulder, and what is left of the sleeve is a torn stub)
    if(F.armOff){armStump(c,look,env,shoulder,u,n,sz,coatOff,gore,lod,k,!!F.seared);return;}
    const AF=armParts(p[ELF],p[HAF],coatOff,SH[0]);
    if(coatOff)bareArm(AF,far);
    else{paint([AF.tb],'suit',far);FigKit.folds(c,AF.tb,env,far?foldFar:foldCol);tear('armN',AF.tb.p,colOf(far?'liningFar':'lining',far?'#123d39':'#1d625c'));paint([AF.cuff],'shirt',far);
      {const q=perp(AF.fd),W=AF.W,e=sub(W,mul(AF.fd,1.3*sz));goldLine(c,look,env,[add(W,mul(q,2.55*sz)),add(e,mul(q,2.65*sz)),sub(e,mul(q,2.65*sz)),sub(W,mul(q,2.55*sz))],lod,.8,true);}}
    paint([fist(p[HAF],armed?tipDir:AF.fd,sz)],'skin',far);
    if(lod>=1&&!look.noGold){const rg=add(p[HAF],mul(perp(tipDir),-3.1*sz));c.fillStyle=goldC;c.beginPath();c.arc(rg.x,rg.y,.75*sz,0,TAU);c.fill();}
    // (F.armTear 0..1: the arm giving at the shoulder under the weight of him: the seam opening and, with blood on, the flesh under it)
    if(F.armTear>0)shoulderTear(c,look,shoulder,AF.E,sz,F.armTear,gore,coatOff,k);};
  // Act I (F.oneArm): the arm he has left, in what he wears: bare (the scars of the tattoos down it), the work shirt's sleeve rolled to
  // the elbow over it, or the oilcloth coat's sleeve, too long and too wide, down over the wrist
  const pitArm=(E,H,S,far)=>{const W0=WEAR||{};let A=null;
    // (the oilcloth coat's sleeve too long and too wide, down over the wrist; the canvas jacket's to the wrist)
    if(W0.coat==='oilcloth'||W0.coat==='canvas'){const big=W0.coat==='oilcloth',mat=big?'coat':'canvas',fd=nrm(sub(H,E)),S0=shoulderFor(E,S),W1=sub(H,mul(fd,(big?1.5:2.8)*sz)),
        tb=FigKit.tube([S0,E,W1],big?[5.0*sz,4.0*sz,3.7*sz]:[4.6*sz,3.6*sz,3.0*sz],{cap0:1.12,bulge:[.08,.06],gather:.42,stretch:.16,lite:lod===0});tb.pf=.55;
      paint([tb],mat,far);FigKit.folds(c,tb,env,far?foldFar:foldCol);paint([capsule(sub(W1,mul(fd,(big?1.4:.8)*sz)),add(W1,mul(fd,.5*sz)),(big?8.8:6.8)*sz,(big?8.4:6.6)*sz)],mat,far);
      A={fd,W:W1,E,S:S0,tb};}
    // (the jersey's sleeve to the wrist, a ribbed cuff, and the darn at the elbow)
    else if(W0.top==='jersey'){const fd=nrm(sub(H,E)),S0=shoulderFor(E,S),W1=sub(H,mul(fd,3*sz)),tb=FigKit.tube([S0,E,W1],[4.4*sz,3.4*sz,2.8*sz],{cap0:1.14,bulge:[.08,.05],gather:.36,stretch:.14,lite:lod===0});tb.pf=.55;
      paint([tb],'jersey',far);FigKit.folds(c,tb,env,far?foldFar:foldCol);
      const cf=capsule(sub(W1,mul(fd,.6*sz)),add(W1,mul(fd,.9*sz)),6.4*sz,6.2*sz);paint([cf],'jersey',far);
      if(lod>=1||k>1.6){c.save();c.strokeStyle='rgba(0,0,0,.4)';c.lineWidth=Math.max(.3,.45/k);c.clip(cf.p);const q=perp(fd);for(let i=-3;i<=3;i++){const m=add(W1,mul(q,i*.9*sz));c.beginPath();c.moveTo(m.x-fd.x*sz,m.y-fd.y*sz);c.lineTo(m.x+fd.x*sz,m.y+fd.y*sz);c.stroke();}c.restore();
        c.save();c.clip(tb.p);c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=Math.max(.3,.45/k);const e=E,q2=perp(nrm(sub(E,S0)));for(let i=-2;i<=2;i++){const a=add(e,mul(q2,i*.9*sz));c.beginPath();c.moveTo(a.x-1.6*sz,a.y-1.2*sz);c.lineTo(a.x+1.6*sz,a.y+1.2*sz);c.stroke();}c.restore();}
      A={fd,W:W1,E,S:S0,tb};}
    else{A=armParts(E,H,true,S);bareArm(A,far);}
    if(W0.top==='shirt'&&!W0.coat){const R0=mix(A.S,A.E,.78),R1=mix(A.S,A.E,.94);paint([capsule(A.S,R0,9.4*sz,8.4*sz)],'shirt',far);paint([capsule(R0,R1,9.8*sz,9.4*sz)],'shirt',far);
      if(lod>=1||k>1.6){const q=perp(nrm(sub(A.E,A.S))),m=mix(R0,R1,.5);c.save();c.strokeStyle='rgba(0,0,0,.45)';c.lineWidth=Math.max(.4,.6/k);c.beginPath();c.moveTo(m.x+q.x*4.6*sz,m.y+q.y*4.6*sz);c.lineTo(m.x-q.x*4.6*sz,m.y-q.y*4.6*sz);c.stroke();c.restore();}}
    // (a strip of linen round the wrist; the glove is the fist's own colour)
    if(W0.hands==='wrap')paint([capsule(sub(A.W,mul(A.fd,.6*sz)),add(A.W,mul(A.fd,1.6*sz)),6.0*sz,5.6*sz)],'linen',far);
    return A;};
  // the arm he has left and what is in its hand, drawn as the far arm is
  const weaponArm=far=>{if(armed&&o.drawOther)across(LAT[HAF],()=>o.drawOther(F));
    const A=pitArm(p[ELF],p[HAF],SH[1],far),op=!!F.openHand&&!(armed&&o.drawOther);
    paint([op?openHand(p[HAF],A.fd,sz):fist(p[HAF],armed?tipDir:A.fd,sz)],WEAR&&WEAR.hands==='glove'?'glove':'skin',far);
    // (the open hand's fingers, close up)
    if(op&&(lod>=1||k>1.6)){const g=A.fd,q=perp(g),H=p[HAF],pt=(a,bb)=>add(H,add(mul(g,a*sz*1.12),mul(q,bb*sz*1.12)));c.save();c.strokeStyle='rgba(0,0,0,.5)';c.lineWidth=Math.max(.3,.45/k);c.lineCap='round';c.beginPath();
      for(const bb of [-1.2,.1,1.3]){const a0=pt(4.6,bb),a1=pt(8.6,bb*.75);c.moveTo(a0.x,a0.y);c.lineTo(a1.x,a1.y);}c.stroke();c.restore();}};
  // the near shoulder: the dressed stump (three weeks on), or the empty sleeve pinned up
  const lostArm=()=>{const W0=WEAR||{};env.far=false;
    const lift=cl(F.phantom||0,0,1);
    if(!W0.coat&&(!W0.top||W0.top==='bare'||W0.top==='under'))bandStump(c,look,env,shoulder,u,n,sz,lod,k,gore,!!W0.bandage,lift);
    else pinnedSleeve(c,look,env,shoulder,u,n,sz,lod,k,W0.coat==='oilcloth'?'coat':W0.coat==='canvas'?'canvas':W0.top==='jersey'?'jersey':'shirt',p0[CHE],b.ua,W0.pinned!==false,b.fa,lift);};

  // ----- the legs -----
  // the leg is one shape from the hip to the ankle: the knee gathers the trouser in behind it and pulls it round in front, the calf
  // swells at the back of the shin
  const legParts=(K,A,hip)=>{const sd=nrm(sub(A,K)),calf=dot(perp(sd),V(-fv,0))>0?1:-1,tb=FigKit.tube([hip,K,A],[6.1*sz,4.2*sz,3.4*sz],{gather:.3,stretch:.12,bulge:[.06,.16],bulgeSide:[0,calf],lite:lod===0});
    return{tb,th:tb,sh:tb};};
  const shoeOf=(K,A)=>{const sd=nrm(sub(A,K)),g=gy(A.x);let d;const planted=A.y>g-6&&Math.abs(Math.atan2(sd.x,sd.y))<.95;
    if(planted)d=V(fa,0);else{d=perp(sd);if(dot(d,n0)<0)d=mul(d,-1);}
    let w=perp(d);if(dot(w,sub(K,A))<0)w=mul(w,-1);const pt=(a,bb)=>add(A,add(mul(d,a*sz),mul(w,bb*sz)));
    const Q=[pt(-3.4,-3),pt(-3.6,0),pt(-1.6,2.2),pt(2.4,1.4),pt(6.4,-.4),pt(9.6,-1.4),pt(11.8,-2.5),pt(11,-3.2),pt(3,-3.3)];
    return{pc:piece(Q,.45,k>=2.4),Q,sole:[pt(-3.2,-3.1),pt(11.1,-3.15)],toe:pt(9,-1.6),d,pt};};
  // turned, a shoe is the outline round its profile set out either side of the foot; turned to face the viewer, its front: the toe
  // wider than the ankle, the sole flat on the floor
  const shoeAt=(kn,ft,l)=>{const S0=shoeOf(p0[kn],p0[ft]);if(!TN)return S0;
    if(VW.s<-.5&&Math.abs(VW.c)<.5&&Math.abs(S0.d.y)<.6){const A=VW.at(p0[ft],l),pt=(x,y)=>V(A.x+x*sz,A.y+y*sz),skinFt=!!WEAR&&(WEAR.feet==='bare'||WEAR.feet==='sandals');
      return{pc:piece(skinFt?[pt(-2.2,-2.2),pt(2.2,-2.2),pt(2.8,-.5),pt(3.4,1.3),pt(3.3,2.9),pt(2.6,3.35),pt(-2.6,3.35),pt(-3.3,2.9),pt(-3.4,1.3),pt(-2.8,-.5)]
        :[pt(-2.7,-2.2),pt(2.7,-2.2),pt(3.4,-.4),pt(3.9,1.6),pt(3.7,3.3),pt(-3.7,3.3),pt(-3.9,1.6),pt(-3.4,-.4)],.45,k>=2.4),
        sole:[pt(-3.6,3.25),pt(3.6,3.25)],toe:pt(.7,1.2),d:V(1,0),front:true,pt};}
    const pts=[];for(const q of S0.Q)for(const w of [-2.4*sz,2.4*sz])pts.push(VW.at(q,l+w));
    return{pc:piece(FigKit.hull(pts),.4,k>=2.4),sole:null,toe:null,d:S0.d};};
  // the foot close up: the boot's sole and welt, its heel, the seam over the toe and the laces up the front; the sandal's rope sole and
  // its straps, the toes; a bare foot's toes and ankle bone (S.pt: the foot's own frame, in profile along it, from the front square on)
  const footDetail=(S,kind,far,Kn,A)=>{const pt=S.pt,ln=(pts,col,w,a=1)=>{c.strokeStyle=col;c.lineWidth=w;c.globalAlpha=a*(far?.7:1);c.beginPath();c.moveTo(pts[0].x,pts[0].y);
      if(pts.length===3)c.quadraticCurveTo(pts[1].x,pts[1].y,pts[2].x,pts[2].y);else for(const q of pts.slice(1))c.lineTo(q.x,q.y);c.stroke();},
      fill=(pts,col,a=1)=>{c.fillStyle=col;c.globalAlpha=a*(far?.75:1);c.beginPath();c.moveTo(pts[0].x,pts[0].y);for(const q of pts.slice(1))c.lineTo(q.x,q.y);c.closePath();c.fill();},
      rimC=look.col.rim||'#ffcf86',lace=tone(look,'rope',far)||'#5c4c33',fr=!!S.front,
      // (the toes from the front: the big toe on the inside, each smaller out to the little one, along the front of the foot)
      toes=y0=>{const inn=TN&&VW?(VW.px>A.x?1:-1):1,sk=tone(look,'skin',far);c.globalAlpha=far?.8:1;
        const T=[[0,1.05],[1,.82],[2,.74],[3,.66],[4,.57]].map(([i,r])=>({i,r,t:pt(inn*(2.5-i*1.27)+inn*(i?0:.1),y0+(1-r)*.7)}));
        // (filled side by side, then the creases between them, then the nail on each catching the light)
        for(const {r,t} of T){c.fillStyle=sk;c.beginPath();c.ellipse(t.x,t.y,r*.76*sz,r*.98*sz,0,0,TAU);c.fill();}
        c.strokeStyle='rgba(0,0,0,.5)';c.lineWidth=.2*sz;c.beginPath();for(let j=0;j<T.length-1;j++){const a=T[j],b=T[j+1],m=mix(a.t,b.t,a.r/(a.r+b.r));c.moveTo(m.x,m.y-.5*sz);c.lineTo(m.x,m.y+.9*sz);}c.stroke();
        for(const {r,t} of T){c.fillStyle=rimC;c.globalAlpha=(far?.1:.22);c.beginPath();c.ellipse(t.x,t.y-.3*r*sz,.36*r*sz,.3*r*sz,0,0,TAU);c.fill();}c.globalAlpha=far?.8:1;};
    c.save();c.lineCap='round';c.lineJoin='round';
    if(kind==='boots'){
      if(fr){fill([pt(-3.7,2.35),pt(3.7,2.35),pt(3.7,3.35),pt(-3.7,3.35)],'#0c0907');ln([pt(-3.75,2.3),pt(3.75,2.3)],'#7a5c3e',.55*sz,.85);
        ln([pt(-3.1,1.1),pt(0,-.8),pt(3.1,1.1)],'rgba(0,0,0,.55)',.4*sz);
        // laces up the front from the instep to the top of the shaft
        const up=nrm(sub(Kn,A));for(let i=0;i<4;i++){const m=add(A,mul(up,(-1.4+i*2.2)*sz)),r=perp(up);const a=add(m,mul(r,1.3*sz)),b=sub(m,mul(r,1.3*sz)),a2=add(add(m,mul(up,1.1*sz)),mul(r,-1.3*sz)),b2=add(add(m,mul(up,1.1*sz)),mul(r,1.3*sz));
          ln([a,a2],lace,.38*sz,.9);ln([b,b2],lace,.38*sz,.9);}}
      else{fill([pt(-3.6,-3.4),pt(11.5,-3.4),pt(11.8,-2.4),pt(-3.6,-2.2)],'#0c0907');fill([pt(-3.7,-3.45),pt(-.3,-3.45),pt(-.2,-2.15),pt(-3.7,-2.15)],'#080605');
        ln([pt(-3.5,-2.2),pt(11.6,-2.35)],'#7a5c3e',.5*sz,.85);ln([pt(7.4,-.7),pt(8,-1.9),pt(8.7,-2.4)],'rgba(0,0,0,.55)',.38*sz);
        // laces over the instep and up the front of the shaft
        for(let i=0;i<3;i++){const t=i/2,m=add(mul(pt(1.8,1.7),1-t),mul(pt(5.6,0),t)),w=nrm(sub(pt(0,1),pt(0,0)));ln([sub(m,mul(w,.9*sz)),add(m,mul(w,.9*sz))],lace,.4*sz,.9);}
        const up=nrm(sub(Kn,A)),fw=S.d;for(let i=0;i<3;i++){const m=add(add(A,mul(up,(1.6+i*2)*sz)),mul(fw,3.2*sz));ln([sub(m,mul(up,.7*sz)),add(add(m,mul(up,.7*sz)),mul(fw,.6*sz))],lace,.38*sz,.9);}}}
    else if(kind==='sandals'){
      if(fr){fill([pt(-3.8,2.6),pt(3.8,2.6),pt(3.8,3.5),pt(-3.8,3.5)],lace);toes(1.9);ln([pt(-3.4,-.6),pt(3.4,-.6)],lace,.6*sz);ln([pt(-3.3,1.05),pt(3.3,1.05)],lace,.5*sz,.9);}
      else{ln([pt(-3.4,-3.15),pt(11.3,-3.15)],lace,1.4*sz);c.globalAlpha=1;for(let a=-2.8;a<11;a+=1.6)ln([pt(a,-3.7),pt(a+.8,-2.6)],'rgba(0,0,0,.35)',.25*sz);
        ln([pt(3.4,1.3),pt(4.6,-2.8)],lace,.6*sz);ln([pt(10.2,-1.3),pt(11.2,-2.7)],'rgba(0,0,0,.45)',.3*sz);}}
    else{
      if(fr){toes(2.45);ln([pt(-1.6,-1.6),pt(-2.1,-.6)],rimC,.35*sz,.3);}
      else{ln([pt(9.8,-1.1),pt(10.4,-2.9)],'rgba(0,0,0,.5)',.28*sz);ln([pt(10.9,-1.5),pt(11.4,-3)],'rgba(0,0,0,.5)',.28*sz);
        const ab=pt(-.6,1.4);c.globalAlpha=far?.15:.28;c.fillStyle=rimC;c.beginPath();c.ellipse(ab.x,ab.y,.9*sz,.7*sz,0,0,TAU);c.fill();}}
    c.restore();};
  const leg=(kn,ft,side,far)=>{const L=legParts(p[kn],p[ft],HIP[side>0?0:1]),S=shoeAt(kn,ft,side*LH),bare=!!WEAR&&WEAR.feet==='bare';
    // (seen from the front the foot is nearer the viewer than the end of the leg: it is drawn over the trouser and the boot's shaft)
    const sand=!!WEAR&&WEAR.feet==='sandals',footMat=bare||sand?'skin':'shoe';if(!S.front)paint([S.pc],footMat,far);paint([L.tb],'suit',far);
    // (the rope sandals: a sole under the foot, a strap over the toes and one round the ankle)
    if(sand&&S.sole){c.save();c.strokeStyle=tone(look,'rope',far);c.lineCap='round';c.lineWidth=Math.max(.6,1.1*sz);c.beginPath();c.moveTo(S.sole[0].x,S.sole[0].y);c.lineTo(S.sole[1].x,S.sole[1].y);c.stroke();
      c.lineWidth=Math.max(.5,.8*sz);const t0=S.toe,a0=p[ft];c.beginPath();if(S.front){c.moveTo(t0.x-4.3*sz,t0.y+.3*sz);c.lineTo(t0.x+2.9*sz,t0.y+.1*sz);}else{c.moveTo(t0.x-1.4*sz,t0.y+1.6*sz);c.lineTo(t0.x-.6*sz,t0.y-1.6*sz);}c.stroke();
      c.beginPath();c.moveTo(a0.x-2.2*sz,a0.y);c.lineTo(a0.x+2.2*sz,a0.y+.4*sz);c.stroke();c.restore();}
FigKit.folds(c,L.tb,env,far?foldFar:foldCol);tear(side>0?'legN':'legF',L.tb.p,far?colOf('underFar','#2a141b'):colOf('under','#3b1a22'));
    // (the Pit's boots: the trousers tucked into them, the shaft up the shin)
    if(WEAR&&WEAR.feet==='boots'){const A=p[ft],sd=nrm(sub(p[kn],A)),b0=add(A,mul(sd,(S.front?2.2:-.4)*sz)),b1=add(A,mul(sd,7.4*sz));paint([capsule(b0,b1,7.4*sz,7.8*sz)],'shoe',far);
      if(lod>=1||k>1.6){const q=perp(sd);c.strokeStyle='rgba(0,0,0,.55)';c.lineWidth=Math.max(.4,.6/k);c.beginPath();c.moveTo(b1.x+q.x*3.9*sz,b1.y+q.y*3.9*sz);c.lineTo(b1.x-q.x*3.9*sz,b1.y-q.y*3.9*sz);c.stroke();}}
    if(S.front)paint([S.pc],footMat,far);
    if(WEAR&&S.pt&&(lod>=1||k>1.6))footDetail(S,bare?'bare':sand?'sandals':'boots',far,p[kn],p[ft]);
    if(!far&&S.sole&&!bare&&!sand){if(lod>=1){c.strokeStyle=isCel(look)?look.line:'rgba(255,230,190,.3)';c.lineWidth=.55;c.beginPath();c.moveTo(S.sole[0].x,S.sole[0].y);c.lineTo(S.sole[1].x,S.sole[1].y);c.stroke();}
      {c.save();c.globalAlpha*=isCel(look)?.7:.85;c.fillStyle=isCel(look)?'#8d93ad':'#ffe2ad';c.beginPath();c.ellipse(S.toe.x,S.toe.y,1.6*sz,.55*sz,Math.atan2(S.d.y,S.d.x),0,TAU);c.fill();c.restore();}}};
  // the seat of the trousers: the weight of the hips, both thighs going into it (turned: round the hips as they are seen, down to the
  // crotch and the tops of the thighs)
  const seat=()=>{const dn=nrm(add(sub(p0[KNF],P0),sub(p0[KNB],P0))),crotch=add(P0,mul(dn,5.4*sz));
    if(!TN){paint([piece([at(T*.06,-8.2),at(-T*.1,-9.4),add(at(-T*.2,-7.6),mul(dn,1.6*sz)),crotch,add(at(-T*.2,6.8),mul(dn,1.6*sz)),at(-T*.08,8.3),at(T*.06,7.9)],.45,k>=2.4)],'suit');return;}
    const pts=[VW.at(crotch,0)];for(const a of [T*.04,-T*.12]){const R=secAt(a),sc=(R[0]+R[1])/2,Dd=(R[1]-R[0])/2;for(let i=0;i<12;i++){const t=i/12*TAU;pts.push(VW.at(at(a,sc+Dd*Math.cos(t)),R[2]*Math.sin(t)*sz));}}
    for(const hp of HIP)pts.push(add(hp,V(0,4*sz)));
    paint([piece(FigKit.hull(pts),.4,k>=2.4)],'suit');};

  // ----- the long coat's skirt -----
  // In profile it hangs between the legs: in front of the far leg, behind the near one. Turned, it is a cone of cloth round both legs
  // from the hips to the hem (FigKit.cone), open down the front; the inside of its back shows through the opening, the legs in it,
  // the panels over them, and in a spin the hem flares out and lifts.
  let skirtDraw=null,SK=null,skirtOver=false;
  if(coatOn){
    // (the coat's own motion runs on the body the game has, whichever way he is drawn: turning round (o.phys: the game's joints and
    // facing) he may be drawn in the frame of the way he faced, and the hem is carried over into it, mirrored about his middle)
    const PH=o.phys,pr=PH?PH.p:p0,faR=PH?PH.fa:fa,PR=pr[PEL],ur=PH?nrm(sub(pr[CHE],PR)):u0,nr=mul(perp(ur),faR),atR=PH?(a,s)=>add(add(PR,mul(ur,a)),mul(nr,s*sz)):at;
    const farPts=[mix(PR,pr[KNB],.5),pr[KNB],mix(pr[KNB],pr[FTB],.45)],allPts=[...farPts,mix(PR,pr[KNF],.5),pr[KNF],mix(pr[KNF],pr[FTF],.45)];
    const lc=WEAR?1.1:1,an=[{p:atR(-T*.06,7.4),len:46*sz*lc,pts:farPts,clear:4.2*sz},{p:atR(-T*.08,-8.6),len:47*sz*lc,pts:allPts,clear:4.8*sz}];
    const Qc=coatStep(F,an,faR,gy,now,o.wind);let fr0=V(Qc[0].x,Qc[0].y),bk0=V(Qc[1].x,Qc[1].y);
    // (in a wind the hem is where the wind holds it, whichever way he is drawn as he turns: mirrored, it would swing into the wind)
    const ws=windK(o.wind);
    if(PH&&PH.mir){const k=cl(ws*2,0,1);fr0=mix(V(2*PH.cx-fr0.x,fr0.y),fr0,k);bk0=mix(V(2*PH.cx-bk0.x,bk0.y),bk0,k);}
    // whichever corner is further forward is the front one, so the skirt never twists
    if(fr0.x*fa<bk0.x*fa){const t=fr0;fr0=bk0;bk0=t;}
    // (a wind from behind him blows the skirt out in front of him: then its near side is over the near leg, not behind it)
    skirtOver=windK(o.wind)>.3&&((fr0.x+bk0.x)/2-P0.x)*fa>14*sz;
    // in the wind the cloth flutters: a wave runs down it from the hips to the hem, across the line it streams along, growing toward
    // the hem, quicker and bigger the harder the wind, and the tail of it whips up and down as a whole, with gusts in both (drawn
    // only: the springs carry the swing, this is the flapping on top of it)
    const FL=ws>0?(()=>{const H=at(-T*.02,0),D=nrm(sub(mix(fr0,bk0,.5),H)),Nn=perp(D),Ls=Math.max(8,len(sub(mix(fr0,bk0,.5),H))),fq=1.8+2.6*ws,
        gust=.8+.13*Math.sin(now*1.7)+.1*Math.sin(now*4.3+1),A=10*sz*ws*gust,B=5.5*sz*ws*gust*Math.sin(TAU*(1.3+1.1*ws)*now+.7);
      return q=>{const r=sub(q,H),s=cl(dot(r,D)/Ls,0,1.2),ph=TAU*(s-fq*now)+2.4*dot(r,Nn)/Ls;
        return add(q,mul(Nn,A*Math.pow(s,1.4)*(Math.sin(ph)+.3*Math.sin(2.2*ph+1.3))/1.3+B*s*s));};})():null;
    if(TN){const R0=secAt(-T*.06),top={F:at(-T*.06,R0[1]),B:at(-T*.06,R0[0]),w:R0[2]*sz},fl=o.spin!=null?Math.sin(Math.PI*cl(o.spin,0,1)):0;
      const hem={F:FL?FL(fr0):fr0,B:FL?FL(bk0):bk0,w:Math.max(R0[2]*sz*1.12,len(sub(fr0,bk0))*.42)+fl*9*sz,lift:fl*7*sz};
      SK=FigKit.cone(VW,top,hem,{open:[.14,.5+.45*fl],gy});}
    else skirtDraw=()=>{
    const WF=at(T*.33,7.4),HF=at(T*.05,8.8),HB=at(-T*.06,-9.2),WB=at(T*.3,-7),mid0=mix(HF,HB,.5);
    // swept round as a shield, the skirt keeps only its back part (the front of it is the shield), and the back comes in to his legs
    let fr=fr0,bk=bk0,hb=null;
    if(shield>0){hb=hemLine(fr0,bk0,2.2*sz,null,mid0,gy).base(.32);fr=mix(fr0,hb,shield);bk=mix(bk0,V(P0.x-fa*5*sz,gy(P0.x)-24*sz),shield*.55);shieldAt={fr:fr0,hb};}
    const hem=hemLine(fr,bk,2.2*sz,shredHem(WEAR?null:F.hemTears,shred),mid0,gy,FL);
    // (in the wind the edges carry the flutter too, so they take more points)
    const frD=FL?FL(fr):fr,bkD=FL?FL(bk):bk,
      frE=FL?[WF,HF,FL(mix(HF,fr,.3)),FL(mix(HF,fr,.55)),FL(mix(HF,fr,.8)),frD]:[WF,HF,mix(HF,fr,.55),fr],
      bkE=FL?[bkD,FL(mix(HB,bk,.75)),FL(mix(HB,bk,.5)),FL(mix(HB,bk,.25)),HB,WB]:[bk,mix(HB,bk,.5),HB,WB];
    const SP=new Path2D();SP.moveTo(WF.x,WF.y);curveThrough(SP,frE,.4);for(const q of hem.pts.slice(1))SP.lineTo(q.x,q.y);
    curveThrough(SP,bkE,.4);SP.closePath();
    let cx=0,cy=0;for(const q of [WF,HF,frD,bkD,HB,WB]){cx+=q.x;cy+=q.y;}
    // (its outline, for the light: down the front edge, along the hem, up the back)
    const skO=[...FigKit.curvePts(frE,false,.4,4).pts,...hem.pts.slice(1),...FigKit.curvePts(bkE,false,.4,4).pts.slice(1)];
    const sk=FigKit.outlined(SP,skO,V(cx/6,cy/6),len(sub(frD,bkD))*.4);sk.pw=6.5*sz;
    // shot through, it is drawn in a layer of its own so its holes show what is behind it
    const Ly=shred>0?layerOpen(c,[WF,HF,frD,bkD,HB,WB,...hem.pts],8):null,cc=Ly?Ly.g:c;
    env.far=false;look.paint(cc,[sk],'coat',env);
    skirt={p:SP,HF,HB,fr:frD,bk:bkD,base:hem.base};
    tear('skirt',SP,colOf('lining','#1d625c'),cc);
    const hotS=shredOn(cc,look,SP,(uu,vv)=>mix(mix(HF,HB,uu),hem.base(uu),.12+vv*.86),shred,now,k,sz,'#07060a',!!Ly);
    if(Ly)layerClose(c,Ly);shredHot(c,hotS,now,sz);
    if(shield<.6)tornTrim(c,look,env,FL?[at(T*.2,7.8),...frE.slice(2)]:[at(T*.2,7.8),mix(HF,fr,.5),fr],lod,.9,shred,now,31);
    for(const run of hem.runs)goldLine(c,look,env,run,lod,.9);};}
  // turned: the inside of its back, then (after the legs) the panels with the gold down their front edges and round the hem
  const skirtInner=()=>{if(!SK)return;const lc=tone(look,'liningFar',false,0)||'#1b4a46',cf=tone(look,'coatFar',false,0)||'#1e1729';c.fillStyle=mid(mid(cf,lc,.4),'#000000',.3);c.fill(FigKit.pathOf(SK.inner));};
  const skirtOuter=()=>{if(!SK)return;
    const ps=SK.panels.map(P=>{let cx=0,cy=0;for(const q of P.pts){cx+=q.x;cy+=q.y;}const pc=FigKit.outlined(FigKit.pathOf(P.pts),P.pts,V(cx/P.pts.length,cy/P.pts.length),Math.max(4,len(sub(P.pts[0],P.pts[Math.floor(P.pts.length/2)]))*.4));pc.pw=6.5*sz;return pc;});
    // shot through, the panels are drawn in a layer of their own and the holes cut through them, as in profile: the marks run round the
    // cloth from one front edge to the other and down it from the hips to the hem
    const Ly=shred>0&&ps.length?layerOpen(c,[].concat(...SK.panels.map(P=>P.pts)),8):null,cc=Ly?Ly.g:c;
    if(ps.length){env.far=false;look.paint(cc,ps,'coat',env);}
    if(shred>0&&ps.length){const clip=new Path2D();for(const P of SK.panels)clip.addPath(FigKit.pathOf(P.pts));
      const hot=shredOn(cc,look,clip,(uu,vv)=>{const v=.12+vv*.86,o0=SK.open(v),t=o0+uu*(TAU-2*o0);return SK.vis(t,v)?SK.at(t,v):null;},shred,now,k,sz,'#07060a',!!Ly);
      if(Ly)layerClose(c,Ly);shredHot(c,hot,now,sz);}
    for(const E of SK.edges)goldLine(c,look,env,E,lod,.9);for(const P of SK.panels)goldLine(c,look,env,P.hem,lod,.9);};

  // ----- the torso -----
  // In profile it is drawn once with at(). Turned, it is drawn as its two halves (FigKit.torsoMap): the far half, then the near one,
  // each as much of it as can be seen; the main shape of the two together carries the light, and what is on it is drawn flat.
  const copies=TN?(()=>{const L=[],aN=FigKit.torsoMap(VW,P0,u0,n0,sz,TAB,1),aF=FigKit.torsoMap(VW,P0,u0,n0,sz,TAB,-1);if(aF.vis>.04)L.push([aF,-1]);if(aN.vis>.04)L.push([aN,1]);return L;})():[[at,0]];
  const neck=()=>{
    if(!F.severed){paint([capsule(add(p[CHE],mul(u,-1.5)),mix(p[CHE],p[HEAD],.7),6.9*sz,6.1*sz)],'skin');}
    if(!coatOff&&!WEAR){if(TN)env.flat=true;for(const [AT] of copies)paint([piece([AT(T+.4,-3.7),AT(T+4.3,-3.3),AT(T+4.5,-.4),AT(T+3.1,3.1),AT(T+.6,5.0),AT(T-1,1.5)],.45)],'shirt');env.flat=false;}};
  // the vest, when the coat is off: the plates, filigree and fastenings, the belt, the dagger at the small of his back, the charge
  const vestDetails=(AT,side,vp)=>{
    // the plates: over the chest, two down the belly, one across the back
    const plate=Q=>piece(Q.map(([a,s2])=>AT(a,s2)),.35),PL=[plate([[T*.80,2.2],[T*.80,8.4],[T*.62,8.6],[T*.44,7.4],[T*.44,2.6]]),plate([[T*.38,3.2],[T*.38,7.0],[T*.24,7.0],[T*.24,3.0]]),
      plate([[T*.20,3.0],[T*.20,7.0],[T*.06,7.2],[T*.06,3.0]]),plate([[T*.86,-2.6],[T*.84,-7.6],[T*.46,-6.6],[T*.42,-2.8]])];
    paint(PL,'plate');
    if(lod>=1){c.save();c.clip(vp.p);c.strokeStyle=tone(look,'gold',false,1)||'#9c7428';c.globalAlpha*=.55;c.lineWidth=Math.max(.3,.5/k);for(const q of PL)c.stroke(q.p);c.restore();}
    // gold vine round the armhole, down the front, along the plates' edges and the hem
    goldLine(c,look,env,[AT(T+.9,4.8),AT(T*.92,7.0),AT(T*.80,8.8),AT(T*.64,8.9),AT(T*.48,7.7),AT(T*.33,6.9),AT(T*.18,7.1),AT(-T*.02,7.3)],lod,.85);
    goldLine(c,look,env,[AT(T*.97,-6.4),AT(T*.96,-2.4),AT(T+1.2,1.6),AT(T*.96,4.4)],lod,.7);
    goldLine(c,look,env,[AT(-T*.02,7.3),AT(-T*.03,-1),AT(-T*.02,-7.7)],lod,.7,true);
    if(lod>=1)for(const [a0,a1] of [[T*.80,T*.44],[T*.38,T*.06]])goldLine(c,look,env,[AT(a0,2.4),AT(a1,2.6)],lod,.5,true);
    // the high collar's gold edge
    goldLine(c,look,env,[AT(T+3.4,-3.6),AT(T+4.1,0),AT(T+3.6,3.7)],lod,.6,true);
    // the fastenings: cyan crystals down the front, each in a gold setting; lit by the gilt, they go dull with it (F.drain)
    c.save();const cdr=cl(F.drain||0,0,1),cry=cdr>0?mid(VEST_DEF.crystal,CRYSTAL_DULL,cdr):VEST_DEF.crystal;
    for(const a0 of [T*.72,T*.56,T*.40,T*.24]){const q=AT(a0,6.3),r=.95*sz;if(q.h)continue;c.fillStyle=tone(look,'gold',false,1)||tone(look,'gold',false,0);c.beginPath();c.arc(q.x,q.y,r*1.35,0,TAU);c.fill();
      c.fillStyle=cry;c.beginPath();c.moveTo(q.x,q.y-r);c.lineTo(q.x+r*.7,q.y);c.lineTo(q.x,q.y+r);c.lineTo(q.x-r*.7,q.y);c.closePath();c.fill();
      if(cdr>.98)continue;c.globalCompositeOperation='lighter';c.globalAlpha=1-cdr;if(lod){const g=c.createRadialGradient(q.x,q.y,0,q.x,q.y,r*3);g.addColorStop(0,'rgba(127,243,227,.5)');g.addColorStop(1,'rgba(127,243,227,0)');c.fillStyle=g;}else c.fillStyle='rgba(127,243,227,.22)';
      c.beginPath();c.arc(q.x,q.y,r*(lod?3:2.2),0,TAU);c.fill();c.globalCompositeOperation='source-over';c.globalAlpha=1;}c.restore();
    // the belt, its buckle, and what rides on it
    paint([piece([AT(-T*.015,-8.5),AT(T*.075,-8.7),AT(T*.08,7.9),AT(-T*.01,7.6)],.3)],'band');
    {const bq=AT(T*.03,7.2);if(!bq.h){c.fillStyle=tone(look,'gold',false,0);c.fillRect(bq.x-1.3*sz,bq.y-1.5*sz,2.6*sz,3*sz);}}
    if(side>=0){
      sheathedDagger(c,side?(a,bb)=>AT(a,bb/sz):(a,bb)=>add(add(P0,mul(u0,a)),mul(n0,bb)),look,lod,k,F.sidearm==='sheathed');
      if(F.charge==='belt')beltCharge(c,(a,bb)=>AT(T*.02+a*sz,3.4+bb),sz,look,lod,k,now);
      tear('torso',vp.p,colOf('lining','#1d625c'),c,side?AT:null);}};
  // the jacket (or the coat's body): the lapel, the collar, the breast pocket and its square, the buttons, the gold trim
  const jacketDetails=(AT,side,jk)=>{
    // the lapel: the satin band along the front, from the collar down to the button
    paint([piece([AT(T+.9,4.2),AT(T*.92,7.6*D),AT(T*.80,9.4*D),AT(T*.64,9.4*D),AT(T*.48,7.9*D),AT(T*.33,7.0*D),AT(T*.40,5.0*D),AT(T*.55,6.6*D),AT(T*.72,7.0*D),AT(T*.86,5.6*D),AT(T+.2,2.4)],.45)],'lapel');
    // the collar behind the neck
    paint([piece([AT(T-1.2,-3.8),AT(T+2.9,-3.8),AT(T+3.5,-.9),AT(T+2.0,2.6),AT(T-.4,2.3)],.5)],out.coat?'coat':'suit');
    // breast pocket and its square, the buttons, the gold trim down the front and round the hem
    if(side>=0){const a0=T*.66;paint([piece([AT(a0,5.6),AT(a0+2.6,6.3),AT(a0+1.4,7.1),AT(a0+3.0,7.9),AT(a0,8.6)],.3)],'square');if(lod>=1)goldLine(c,look,env,[AT(a0,5.4),AT(a0,8.9)],lod,.6,true);}
    for(const bt of [AT(T*.33,7.25*D),AT(T*.20,7.55*D)]){if(bt.h)continue;c.fillStyle=goldC;c.beginPath();c.arc(bt.x,bt.y,.9*sz,0,TAU);c.fill();}
    // (turned, the hem runs round his side from the front to the back, so it is given the points between)
    tornTrim(c,look,env,[AT(T+.7,3.9),AT(T*.92,7.3*D),AT(T*.80,9.0*D),AT(T*.64,9.0*D),AT(T*.48,7.55*D),AT(T*.33,6.65*D),AT(T*.20,6.95*D),AT(T*.05,7.05*D),AT(-T*.10,5.1),AT(-T*.14,1.9),
      ...(side?[AT(-T*.143,-.2),AT(-T*.146,-2.3),AT(-T*.149,-4.3)]:[]),AT(-T*.15,-6.3),AT(-T*.115,-8.3)],lod,1,shred,now,17);
    if(side>=0)tear('torso',jk.p,colOf('lining','#1d625c'),c,side?AT:null);
    if(coatOn)shredHot(c,shredOn(c,look,jk.p,(uu,vv)=>{const q=AT(lerp0(T*.95,-T*.14,vv),lerp0(9*D,-8.8,uu));return q.h?null:q;},shred,now,k,sz,vcol(look,'plate',false)),now,sz);};
  // Act I: the Pit's clothes. Bare to the waist under the dressings (scene 2), the collarless work shirt tucked into the trousers with
  // the belt over it (the hip dagger's sheath on it is the weapon's own: drawScabbard), or the oilcloth coat over all of it, two
  // sizes too big
  const line=Q=>{if(Q.some(q=>q.h))return;c.beginPath();c.moveTo(Q[0].x,Q[0].y);for(const q of Q.slice(1))c.lineTo(q.x,q.y);c.stroke();};
  const waist=()=>paint(copies.map(([AT])=>piece([AT(-T*.16,-8.4),AT(T*.05,-8.7),AT(T*.06,7.7),AT(-T*.12,7.2),AT(-T*.21,.4)],.45)),'suit');
  const belt=(AT,side)=>{if(WEAR.belt==='rope'){paint([piece([AT(T*.0,-8.6),AT(T*.05,-8.7),AT(T*.055,8.0),AT(T*.005,7.8)],.3)],'rope');
      const kq=AT(T*.03,7.6),e1=AT(-T*.12,7.9),e2=AT(-T*.1,6.6);if(!kq.h&&!e1.h&&!e2.h){c.fillStyle=tone(look,'rope');c.beginPath();c.arc(kq.x,kq.y,1.2*sz,0,TAU);c.fill();
        c.strokeStyle=tone(look,'rope');c.lineWidth=Math.max(.5,.9*sz);c.lineCap='round';c.beginPath();c.moveTo(kq.x,kq.y);c.lineTo(e1.x,e1.y);c.moveTo(kq.x,kq.y);c.lineTo(e2.x,e2.y);c.stroke();}return;}
    paint([piece([AT(-T*.015,-8.5),AT(T*.075,-8.7),AT(T*.08,7.9),AT(-T*.01,7.6)],.3)],'band');
    const bq=AT(T*.03,7.2);if(!bq.h){c.strokeStyle=tone(look,'pin');c.lineWidth=Math.max(.45,.6*sz);c.strokeRect(bq.x-1.2*sz,bq.y-1.4*sz,2.4*sz,2.8*sz);}};
  const shirtDetails=(AT,side,sp)=>{
    c.save();c.clip(sp.p);c.strokeStyle='rgba(0,0,0,.5)';c.lineWidth=Math.max(.5,.9/k);
    // the collarless neckline, the placket, and where the shirt gathers into the belt
    line([AT(T+2.0,-3.2),AT(T+2.8,0),AT(T+2.4,3.3)]);c.lineWidth=Math.max(.35,.6/k);line([AT(T+2.2,3.4),AT(T*.86,6.6),AT(T*.62,8.2)]);
    if(lod>=1||k>1.6){c.strokeStyle='rgba(0,0,0,.32)';for(const s0 of [-5,-1,3.5,6.4])line([AT(T*.09,s0),AT(T*.2,s0+.6)]);}
    c.restore();
    for(const a0 of [T*.9,T*.74]){const q=AT(a0,6.9);if(q.h)continue;c.fillStyle=tone(look,'horn');c.beginPath();c.arc(q.x,q.y,.75*sz,0,TAU);c.fill();}
    if(side>=0)tear('torso',sp.p,colOf('lining','#1d625c'),c,side?AT:null);};
  // the drawstring of the linen trousers Tamm found him (when nothing is over it)
  const drawstring=AT=>{const a=AT(T*.07,5.2),b=AT(T*.0,6.4);if(!a.h&&!b.h){c.strokeStyle=tone(look,'linen');c.lineWidth=Math.max(.4,.5*sz);c.beginPath();c.moveTo(a.x,a.y);c.quadraticCurveTo((a.x+b.x)/2+1,(a.y+b.y)/2+2,b.x,b.y+1.5*sz);c.stroke();}};
  const bareDetails=(AT,side,sp)=>{
    if(!WEAR.bandage)return;
    // the dressings: round his chest under the arms, and from the stump forward and back across him (in profile)
    const bands=[[[AT(T*.75,-9.2),AT(T*.735,0),AT(T*.72,9.8)],3.8*sz]];
    if(!side)bands.push([[AT(T-1.2*sz,1.2),AT(T*.8,6.2),AT(T*.6,9.8)],3.2*sz],[[AT(T-1.6*sz,-2.2),AT(T*.8,-6.8),AT(T*.6,-9.6)],3.2*sz]);
    c.save();c.clip(sp.p);
    for(const [Q,w] of bands){if(Q.some(q=>q.h))continue;const pc=piece(stripPts(Q,w),.25,k>=2.4);paint([pc],'linen');
      c.save();c.clip(pc.p);c.strokeStyle='rgba(0,0,0,.3)';c.lineWidth=Math.max(.35,.5/k);c.stroke(pc.p);
      if(lod>=1||k>1.6){const L0=len(sub(Q[Q.length-1],Q[0])),d0=nrm(sub(Q[Q.length-1],Q[0])),q0=perp(d0);for(let s0=3;s0<L0;s0+=4.4*sz){const m=add(Q[0],mul(d0,s0));c.beginPath();c.moveTo(m.x+q0.x*w*.6,m.y+q0.y*w*.6);c.lineTo(m.x-q0.x*w*.6+d0.x*1.6*sz,m.y-q0.y*w*.6+d0.y*1.6*sz);c.stroke();}}
      c.restore();}
    c.restore();};
  const coatDetails=(AT,side,jk)=>{
    // the collar, turned up behind his neck; the shirt at his throat
    paint([piece([AT(T-1.8,-4.6),AT(T+4.4,-4.4),AT(T+5.2,-1.0),AT(T+3.6,3.2),AT(T-.6,3.0)],.5)],'coat');
    paint([piece([AT(T+1.4,2.4),AT(T+2.4,4.4),AT(T*.9,6.8*D),AT(T*.84,4.6)],.4)],'shirt');
    // the front edge where it laps over, and the patch pocket at the hip
    c.save();c.clip(jk.p);c.strokeStyle='rgba(0,0,0,.5)';c.lineWidth=Math.max(.45,.8/k);line([AT(T*.9,7.4*D),AT(T*.6,8.6*D),AT(T*.3,7.0*D),AT(-T*.1,5.4)]);
    if(lod>=1||k>1.6)line([AT(T*.24,1.8),AT(T*.24,6.6*D),AT(-T*.04,6.2*D),AT(-T*.04,1.6),AT(T*.24,1.8)]);c.restore();
    // three horn toggles down the front
    for(const a0 of [T*.72,T*.52,T*.32]){const q=AT(a0,6.6*D),q2=AT(a0,8.0*D);if(q.h||q2.h)continue;c.strokeStyle=tone(look,'horn');c.lineWidth=Math.max(.8,1.5*sz);c.lineCap='round';c.beginPath();c.moveTo(q.x,q.y);c.lineTo(q2.x,q2.y);c.stroke();}
    if(side>=0)tear('torso',jk.p,colOf('lining','#1d625c'),c,side?AT:null);};
  // the knitted jersey: worn over the trousers, a rib at the neck and the hem
  const jerseyDetails=(AT,side,sp)=>{c.save();c.clip(sp.p);c.strokeStyle='rgba(0,0,0,.45)';c.lineWidth=Math.max(.6,1.6*sz);line([AT(T+1.8,-3.4),AT(T+2.6,0),AT(T+2.2,3.5)]);
    c.lineWidth=Math.max(.5,1.2*sz);line([AT(T*.02,-8.6),AT(-T*.02,0),AT(T*.02,7.8)]);
    if(lod>=1||k>1.6){c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=Math.max(.3,.4/k);for(const s0 of [-6,-3,0,3,6])line([AT(T*.1,s0),AT(T*.86,s0*.95)]);}c.restore();
    if(side>=0)tear('torso',sp.p,colOf('lining','#1d625c'),c,side?AT:null);};
  // the sleeveless undershirt: a scoop at the neck; the dressings show above it
  const underOutline=AT=>[[T*.97,-4.6],[T*.96,-6.4],[T*.80,-8.5],[T*.55,-7.3],[T*.40,-6.5],[T*.18,-7.5],[T*.02,-8.3],[-T*.04,-8.1],[-T*.05,-1],[-T*.04,7.5],[T*.18,7.3],[T*.33,7.1],[T*.48,7.9],[T*.64,9.0],
    [T*.74,8.6],[T*.80,6.2],[T*.85,2.6],[T*.9,-1.4]].map(([a,s])=>AT(a,s));
  const underDetails=(AT,side,up)=>{c.save();c.clip(up.p);c.strokeStyle='rgba(0,0,0,.45)';c.lineWidth=Math.max(.5,.8/k);line([AT(T*.97,-4.6),AT(T*.9,-1.4),AT(T*.85,2.6),AT(T*.8,6.2),AT(T*.74,8.6)]);c.restore();
    if(side>=0)tear('torso',up.p,colOf('lining','#1d625c'),c,side?AT:null);};
  // the short canvas jacket: to the hips, buttoned, a small collar and a pocket flap
  const JC=[[T+1.2,-3.4],[T*.97,-6.4],[T*.80,-8.9],[T*.55,-7.4],[T*.40,-6.5],[T*.18,-7.8],[T*.0,-9.1],[-T*.06,-8.8],[-T*.09,-6.5],[-T*.09,2.0],[-T*.06,5.8],[T*.05,7.8],[T*.20,7.7],[T*.33,7.4],
    [T*.48,8.3],[T*.64,9.7],[T*.80,9.6],[T*.92,7.8],[T+.9,4.4],[T+2.4,.4]];
  const canvasDetails=(AT,side,jk)=>{paint([piece([AT(T-1.2,-4.0),AT(T+3.0,-4.0),AT(T+3.8,-1.0),AT(T+2.4,2.8),AT(T-.4,2.4)],.5)],'canvas');
    c.save();c.clip(jk.p);c.strokeStyle='rgba(0,0,0,.5)';c.lineWidth=Math.max(.45,.8/k);line([AT(T*.9,7.6),AT(T*.6,8.9),AT(T*.3,7.5),AT(-T*.05,6.2)]);
    if(lod>=1||k>1.6){line([AT(T*.78,3.2),AT(T*.78,7.2),AT(T*.7,7.3),AT(T*.7,3.3)]);line([AT(T*.06,-8.4),AT(T*.06,7.4)]);}c.restore();
    for(const a0 of [T*.78,T*.6,T*.42,T*.24]){const q=AT(a0,7.4);if(q.h)continue;c.fillStyle=tone(look,'horn');c.beginPath();c.arc(q.x,q.y,.75*sz,0,TAU);c.fill();}
    if(side>=0)tear('torso',jk.p,colOf('lining','#1d625c'),c,side?AT:null);};
  const pitTorso=()=>{const top=WEAR.top||'bare';
    if(WEAR.coat==='oilcloth'){waist();const jks=copies.map(([AT])=>{const jk=piece(J.map(([a,s])=>AT(a,s)),.42,true);jk.pw=7.6*sz;jk.pf=.55;return jk;});
      paint(jks,'coat');if(TN)env.flat=true;copies.forEach(([AT,side],i)=>coatDetails(AT,side,jks[i]));env.flat=false;scarfWrap();return;}
    // (under the rest: his skin, dressed or not; the jersey hangs over the trousers, the shirt and the undershirt tuck into them)
    const skin=top==='bare'||top==='under',sps=copies.map(([AT])=>piece(shirtOutline(AT,T,top==='shirt'?1.05:top==='jersey'?1.08:.94),.42,true));
    if(top==='jersey')waist();
    paint(sps,skin?'skin':top);if(TN)env.flat=true;
    if(skin)copies.forEach(([AT,side],i)=>bareDetails(AT,side,sps[i]));
    if(top==='under'){const ups=copies.map(([AT])=>piece(underOutline(AT),.42,true));paint(ups,'under');copies.forEach(([AT,side],i)=>underDetails(AT,side,ups[i]));}
    if(top!=='jersey')waist();
    if(top==='bare')copies.forEach(([AT])=>drawstring(AT));
    copies.forEach(([AT,side],i)=>top==='shirt'?shirtDetails(AT,side,sps[i]):top==='jersey'?jerseyDetails(AT,side,sps[i]):null);
    if(top!=='bare')copies.forEach(([AT,side])=>belt(AT,side));
    if(WEAR.coat==='canvas'){const jks=copies.map(([AT])=>{const jk=piece(JC.map(([a,s])=>AT(a,s)),.42,true);jk.pw=7*sz;jk.pf=.55;return jk;});paint(jks,'canvas');copies.forEach(([AT,side],i)=>canvasDetails(AT,side,jks[i]));}
    env.flat=false;scarfWrap();};
  // the rust scarf: wound round his neck over the collar, one end hanging down his front (the other trails behind him, scarfRibbon).
  // Turned to face the viewer: the wrap from the side of his neck round to the middle, on each half of him, and the end down the near
  // half of his chest
  const scarfWrap=()=>{if(!WEAR.scarf)return;
    if(TN&&VW.s<-.35){for(const [AT,side] of copies){
        if(side>0){const tail=[AT(T+1.4,3.6),AT(T*.93,6.2),AT(T*.8,7.2),AT(T*.7,7.5)];if(!tail.some(q=>q.h))paint([piece(stripPts(tail,3.4*sz),.35,k>=2.4)],'scarf');}
        const R=[AT(T+5.4,-.6),AT(T+4.6,4.0),AT(T+1.6,4.8),AT(T+.2,.2)],wp=piece(R,.5,k>=2.4);paint([wp],'scarf');
        c.save();c.clip(wp.p);c.strokeStyle='rgba(0,0,0,.45)';c.lineWidth=Math.max(.4,.6/k);line([AT(T+3.4,-.2),AT(T+3.0,4.4)]);c.restore();}
      return;}
    for(const [AT,side] of copies){if(side<0)continue;
    const R=[AT(T+1.2,-4.8),AT(T+4.4,-4.4),AT(T+5.4,-.6),AT(T+4.6,4.0),AT(T+1.6,4.8),AT(T+.2,.2)];if(R.some(q=>q.h))continue;
    const tail=[AT(T+1.4,3.6),AT(T*.93,6.2),AT(T*.8,7.2),AT(T*.7,7.5)];
    if(!tail.some(q=>q.h))paint([piece(stripPts(tail,3.4*sz),.35,k>=2.4)],'scarf');
    const wp=piece(R,.5,k>=2.4);paint([wp],'scarf');
    c.save();c.clip(wp.p);c.strokeStyle='rgba(0,0,0,.45)';c.lineWidth=Math.max(.4,.6/k);line([AT(T+.9,-2.2),AT(T+3.4,-1.6),AT(T+4.6,1.6)]);line([AT(T+.8,1.6),AT(T+2.6,2.6),AT(T+3.6,4.2)]);c.restore();}};
  const torso=()=>{
    if(WEAR){pitTorso();return;}
    if(coatOff){
      paint(copies.map(([AT])=>piece([AT(-T*.16,-8.4),AT(T*.05,-8.7),AT(T*.06,7.7),AT(-T*.12,7.2),AT(-T*.21,.4)],.45)),'suit');
      const vps=copies.map(([AT])=>piece(vestOutline(AT,T),.42,true));paint(vps,'vest');
      if(TN)env.flat=true;copies.forEach(([AT,side],i)=>vestDetails(AT,side,vps[i]));env.flat=false;}
    else{
      const jks=copies.map(([AT])=>{const jk=piece(J.map(([a,s])=>AT(a,s)),.42,true);jk.pw=7.6*sz;jk.pf=.55;return jk;});
      paint(jks,out.coat?'coat':'suit');
      if(TN)env.flat=true;copies.forEach(([AT,side],i)=>jacketDetails(AT,side,jks[i]));env.flat=false;}};
  // the coat held up as a shield: in front of him, under his head, his near arm over it (in profile only)
  const shieldDraw=()=>{if(!(shield>0&&shieldAt))return;const Sh=shieldShape(p,at,T,sz,fa,P0,shieldAt.fr,shieldAt.hb,shield,now,gy);
    const hemS=hemLine(Sh.Fh,Sh.Bh,3*sz*shield,shredHem(null,shred),mix(Sh.L,Sh.Kf,.5),gy);
    const SPs=new Path2D();SPs.moveTo(Sh.A0.x,Sh.A0.y);curveThrough(SPs,[Sh.A0,Sh.top,Sh.U],.45);curveThrough(SPs,[Sh.U,Sh.L,Sh.Fh],.45);
    for(const q of hemS.pts.slice(1))SPs.lineTo(q.x,q.y);curveThrough(SPs,[Sh.Bh,Sh.Kf,Sh.Wf,Sh.A0],.4);SPs.closePath();
    const Ly=shred>0?layerOpen(c,[Sh.A0,Sh.top,Sh.U,Sh.L,Sh.Fh,Sh.Bh,Sh.Kf,Sh.Wf,...hemS.pts],8):null,cc=Ly?Ly.g:c;
    env.far=false;look.paint(cc,[{p:SPs,c:mix(Sh.L,Sh.Kf,.5),r:Math.max(4,len(sub(Sh.U,Sh.Bh))*.35)}],'coat',env);
    // the lining shows along the turned front edge; folds run down from the hands
    cc.save();cc.clip(SPs);cc.strokeStyle=tone(look,'lining',false,0);cc.globalAlpha*=.55*shield;cc.lineWidth=2.2*sz;cc.beginPath();cc.moveTo(Sh.U.x,Sh.U.y);curveThrough(cc,[Sh.U,Sh.L,Sh.Fh],.45);cc.stroke();cc.restore();
    if(lod>=1||k>1.6){cc.save();cc.clip(SPs);cc.strokeStyle='rgba(0,0,0,.42)';cc.lineWidth=Math.max(.5,.9/k);
      for(const f0 of [.25,.5,.75]){const a0=mix(Sh.U,Sh.L,f0),b0=hemS.base(cl(f0*.9,0,1));cc.beginPath();cc.moveTo(a0.x,a0.y);cc.quadraticCurveTo(mix(a0,b0,.5).x-fa*2*sz,mix(a0,b0,.5).y,b0.x,b0.y);cc.stroke();}cc.restore();}
    const lineAt=(E,v)=>{const s0=cl(v,0,1)*(E.length-1),i=Math.min(E.length-2,Math.floor(s0));return mix(E[i],E[i+1],s0-i);};
    const hotH=shredOn(cc,look,SPs,(uu,vv)=>mix(lineAt([Sh.A0,Sh.Wf,Sh.Kf,Sh.Bh],vv),lineAt([Sh.top,Sh.U,Sh.L,Sh.Fh],vv),.08+uu*.84),shred,now,k,sz,'#07060a',!!Ly);
    if(Ly)layerClose(c,Ly);shredHot(c,hotH,now,sz);
    tornTrim(c,look,env,[Sh.U,Sh.L,Sh.Fh],lod,.9,shred,now,55);for(const run of hemS.runs)goldLine(c,look,env,run,lod,.9);};
  // (in profile his head can still turn on its own: o.headYaw, a scene's turn of the head alone, f.headTurn)
  const head=()=>drawHead(c,F,look,hair,env,lod,o,sz,TN?{h:p[HEAD],C0:p[CHE],fa,hy:o.headYaw??FigKit.headYaw(yaw)}:o.headYaw?{h:p[HEAD],C0:p[CHE],fa,hy:o.headYaw}:null);

  if(!TN){
    // in profile: the far arm, the far leg, the seat, the coat's skirt, the near leg, the neck, the torso, the head, the near arm
    if(ONE)weaponArm(true);else farArm(true);leg(KNB,FTB,-1,true);seat();if(skirtDraw&&!skirtOver)skirtDraw();leg(KNF,FTF,1,false);if(skirtDraw&&skirtOver)skirtDraw();
    neck();torso();if(o.afterTorso)o.afterTorso(F);shieldDraw();head();if(ONE)lostArm();else nearArm(false);}
  else{
    // turned: the arms and legs in the order of how far toward the viewer each is, the ones behind him first; the coat's skirt round
    // the legs (nearly side on, the near leg still steps in front of it, as in profile)
    const dFarArm=(dp(sh0,-LS)+dp(p0[ELB],LAT[ELB])+dp(p0[HAB],LAT[HAB]))/3,dNA=(dp(sh0,LS)+dp(p0[ELF],LAT[ELF])+dp(p0[HAF],LAT[HAF]))/3,dNearArm=armed?(dNA*2+dp(p0[TIP],LAT[TIP]))/3:dNA;
    const dFarLeg=(dp(P0,-LH)+dp(p0[KNB],-LH)+dp(p0[FTB],-LH))/3,dNearLeg=(dp(P0,LH)+dp(p0[KNF],LH)+dp(p0[FTF],LH))/3;
    const dW=(dp(sh0,-LS)+dp(p0[ELF],LAT[ELF])+dp(p0[HAF],LAT[HAF]))/3,dWeap=armed?(dW*2+dp(p0[TIP],LAT[TIP]))/3:dW,dLost=dp(sh0,LS);
    const arms=(ONE?[{d:dWeap,fn:()=>weaponArm(dWeap<0)},{d:dLost,fn:()=>lostArm()}]:[{d:dFarArm,fn:()=>farArm(dFarArm<0)},{d:dNearArm,fn:()=>nearArm(dNearArm<0)}]).sort((a,bb)=>a.d-bb.d);
    const legs=[{d:dFarLeg,fn:()=>leg(KNB,FTB,-1,dFarLeg<0)},{d:dNearLeg,fn:()=>leg(KNF,FTF,1,dNearLeg<0)}].sort((a,bb)=>a.d-bb.d);
    const prof=Math.abs(VW.s)<.35;
    for(const A of arms)if(A.d<0)A.fn();
    skirtInner();
    for(const L of legs)if(L.d<0)L.fn();
    seat();
    if(!(SK&&prof))for(const L of legs)if(L.d>=0)L.fn();
    skirtOuter();
    if(SK&&prof)for(const L of legs)if(L.d>=0)L.fn();
    neck();torso();if(o.afterTorso)across(LH,()=>o.afterTorso(F));
    head();
    for(const A of arms)if(A.d>=0)A.fn();}
  c.restore();
}
// the shoulder giving: the seam of the sleeve splits round the top of the arm, and the wound opens in it, strands across it
function shoulderTear(c,look,Sh,E,sz,tr,gore,coatOff,k){const d=nrm(sub(E,Sh)),q=perp(d),m=add(Sh,mul(d,1.6*sz)),Lg=(2.4+6.2*tr)*sz,Wd=(.8+2.6*tr)*sz;
  c.save();
  if(!coatOff){c.fillStyle=tone(look,'lining',false,0)||'#45d8c8';c.globalAlpha=.75;c.beginPath();c.ellipse(m.x,m.y,Wd*1.25+.6*sz,Lg*.62+sz,Math.atan2(d.y,d.x)+Math.PI/2,0,TAU);c.fill();c.globalAlpha=1;}
  if(gore){c.fillStyle=gore;c.beginPath();c.ellipse(m.x,m.y,Wd,Lg*.55,Math.atan2(d.y,d.x)+Math.PI/2,0,TAU);c.fill();
    c.fillStyle='rgba(40,0,6,.55)';c.beginPath();c.ellipse(m.x,m.y,Wd*.45,Lg*.4,Math.atan2(d.y,d.x)+Math.PI/2,0,TAU);c.fill();
    c.strokeStyle=gore;c.lineWidth=Math.max(.35,.5*sz);c.beginPath();for(let i=-1;i<=1;i++){const a=add(m,mul(q,i*Lg*.32));c.moveTo(a.x-d.x*Wd*.9,a.y-d.y*Wd*.9);c.lineTo(a.x+d.x*Wd*.9,a.y+d.y*Wd*.9);}c.stroke();}
  c.restore();}
// what is left at the shoulder once the arm is torn away: the sleeve's torn end, and in it the flesh and the end of the bone
function armStump(c,look,env,Sh,u,n,sz,coatOff,gore,lod,k,seared){const d=nrm(add(u,mul(n,.35))),q=perp(d),tip=add(Sh,mul(d,3.4*sz));
  look.paint(c,[capsule(sub(Sh,mul(d,1.2*sz)),tip,coatOff?10*sz:9.4*sz,coatOff?8.8*sz:8.6*sz)],coatOff?'skin':'suit',env);
  // (seared: the skillet has sealed it, a black crust with a wet shine where the flesh was)
  if(gore&&seared){c.fillStyle='#22110b';c.beginPath();for(let i=0;i<10;i++){const a=i/10*TAU,rr=(3.4+((i*7)%3)*.35)*sz,pt=add(add(tip,mul(d,Math.cos(a)*rr*.45)),mul(q,Math.sin(a)*rr));i?c.lineTo(pt.x,pt.y):c.moveTo(pt.x,pt.y);}c.closePath();c.fill();
    c.strokeStyle='#6a2e16';c.lineWidth=Math.max(.4,.6*sz);c.stroke();c.fillStyle='rgba(255,226,190,.22)';c.beginPath();c.ellipse(tip.x-q.x*1.2*sz,tip.y-q.y*1.2*sz,.9*sz,1.8*sz,Math.atan2(d.y,d.x),0,TAU);c.fill();}
  else if(gore){c.fillStyle=gore;c.beginPath();for(let i=0;i<10;i++){const a=i/10*TAU,rr=(3.6+((i*5)%3)*.45)*sz,pt=add(add(tip,mul(d,Math.cos(a)*rr*.45)),mul(q,Math.sin(a)*rr));i?c.lineTo(pt.x,pt.y):c.moveTo(pt.x,pt.y);}c.closePath();c.fill();
    c.fillStyle='rgba(50,0,8,.55)';c.beginPath();c.ellipse(tip.x,tip.y,1.2*sz,2.4*sz,Math.atan2(d.y,d.x),0,TAU);c.fill();
    c.fillStyle='#e9ddc6';c.beginPath();c.arc(tip.x+d.x*.9*sz,tip.y+d.y*.9*sz,1.25*sz,0,TAU);c.fill();}
  // the sleeve's ragged edge round it
  c.strokeStyle=coatOff?(tone(look,'band',false,0)||'#120d0b'):(tone(look,'suit',false,0)||'#0e0c14');c.lineWidth=Math.max(.5,1.1*sz);c.beginPath();
  for(let i=0;i<=6;i++){const s=i/6*2-1,a=add(tip,mul(q,s*4.1*sz)),b=add(a,mul(d,(i%2?1.8:.5)*sz));i?c.lineTo(b.x,b.y):c.moveTo(b.x,b.y);}c.stroke();
  if(!coatOff){c.strokeStyle=tone(look,'lining',false,0)||'#45d8c8';c.globalAlpha=.6;c.lineWidth=Math.max(.3,.45*sz);c.stroke();c.globalAlpha=1;}}
// the arm itself, torn away and left behind (on the spike in the Pit): its torn top at A.S, the elbow at A.E, the hand at A.H, in the
// frame it is drawn in. o: {look, light, gore (its colour), coatOff, sz (the man's size), fa, drain (as F.drain: its tattoos scars)}
function armPiece(c,A,o={}){
  const look=LOOKS[o.look||cfg.look],tr=c.getTransform?c.getTransform():null,k=tr&&tr.a!=null?Math.hypot(tr.a,tr.b)||1:2,sz=o.sz||1,lod=k<2.4?0:k<5?1:2;
  const env={k,fa:o.fa||1,L:o.light?nrm(sub(o.light,A.E)):V(.5,-1),far:false,rw:Math.max(.9,1.25/k)*1.05,ow:Math.max(.55,1.05/k)},paint=(ps,mat)=>look.paint(c,ps,mat,env);
  const S0=A.S,E=A.E,Hd=A.H,fd=nrm(sub(Hd,E)),W=sub(Hd,mul(fd,3.6*sz)),ud=nrm(sub(S0,E)),q=perp(ud);
  c.save();c.lineCap='round';c.lineJoin='round';
  if(o.coatOff){const W0=sub(W,mul(fd,.2*sz)),tb=bareTube(S0,E,W0,sz,lod===0,armFront(S0,E,W0,V(o.fa||1,0)));paint([tb],'skin');muscleLines(c,tb,look.col.rim||'#ffcf86',env.L,lod,k,false);
    tattoo(c,S0,E,W,8.8*sz,6.2*sz,k,lod,1,false,0,7,{dr:o.drain??1,L:env.L,scar:isNoir(look)?SCAR_DEF:SCAR_LIGHT,clip:tb.p});
    paint([capsule(sub(W,mul(fd,.7*sz)),add(W,mul(fd,.9*sz)),5.9*sz,5.6*sz)],'band');}
  else{paint([capsule(S0,E,8.4*sz,6.4*sz),capsule(E,sub(W,mul(fd,.2*sz)),6.3*sz,5.1*sz)],'suit');paint([capsule(sub(W,mul(fd,.4*sz)),add(W,mul(fd,1*sz)),4.9*sz,4.6*sz)],'shirt');
    const qq=perp(fd),e=sub(W,mul(fd,1.3*sz));goldLine(c,look,env,[add(W,mul(qq,2.55*sz)),add(e,mul(qq,2.65*sz)),sub(e,mul(qq,2.65*sz)),sub(W,mul(qq,2.55*sz))],lod,.8,true);}
  // the hand, gone slack
  {const g=fd,qq=perp(g),pt=(a,b)=>add(Hd,add(mul(g,a*sz),mul(qq,b*sz)));paint([piece([pt(-3.1,-2.6),pt(3.6,-2.6),pt(5.2,-.4),pt(4.6,2.2),pt(-2.8,2.7),pt(-3.5,0)],.55)],'skin');}
  // the torn top: flesh, the end of the bone, the sleeve's ragged edge
  const tip=add(S0,mul(ud,.8*sz));
  if(o.gore){c.fillStyle=o.gore;c.beginPath();for(let i=0;i<10;i++){const a=i/10*TAU,rr=(3.4+((i*7)%3)*.5)*sz,pt=add(add(tip,mul(ud,Math.cos(a)*rr*.5)),mul(q,Math.sin(a)*rr));i?c.lineTo(pt.x,pt.y):c.moveTo(pt.x,pt.y);}c.closePath();c.fill();
    c.fillStyle='rgba(50,0,8,.55)';c.beginPath();c.ellipse(tip.x,tip.y,1.1*sz,2.2*sz,Math.atan2(ud.y,ud.x),0,TAU);c.fill();
    c.fillStyle='#e9ddc6';c.beginPath();c.arc(tip.x+ud.x*1.1*sz,tip.y+ud.y*1.1*sz,1.2*sz,0,TAU);c.fill();
    c.strokeStyle=o.gore;c.lineWidth=Math.max(.35,.5*sz);c.beginPath();for(let i=-1;i<=1;i++){const a=add(tip,mul(q,i*1.8*sz));c.moveTo(a.x,a.y);c.lineTo(a.x+ud.x*(2.5+i*i)*sz,a.y+ud.y*(2.5+i*i)*sz);}c.stroke();}
  c.strokeStyle=o.coatOff?(tone(look,'band',false,0)||'#120d0b'):(tone(look,'suit',false,0)||'#0e0c14');c.lineWidth=Math.max(.5,1.1*sz);c.beginPath();
  for(let i=0;i<=6;i++){const s=i/6*2-1,a=add(S0,mul(q,s*3.9*sz)),b=add(a,mul(ud,(i%2?1.6:.3)*sz));i?c.lineTo(b.x,b.y):c.moveTo(b.x,b.y);}c.stroke();
  c.restore();}
// the gold trim: a line at game size; leaves on a vine when there is room to see them
function goldLine(c,look,env,Q,lod,w=1,plain=false){
  if(look.noGold)return;
  if(Q.some(q=>q.h)){for(const R of FigKit.seen(Q))goldLine(c,look,env,R,lod,w,plain);return;}
  const pts=resample(Q,4),gc=tone(look,'gold',false,0),gs=tone(look,'gold',false,1)||gc;
  c.strokeStyle=lod?gs:gc;c.lineWidth=Math.max(.45,(lod?.45:.75)*w);c.beginPath();c.moveTo(pts[0].x,pts[0].y);for(const q of pts.slice(1))c.lineTo(q.x,q.y);c.stroke();
  if(!lod||plain)return;
  const P=new Path2D();
  along(pts,lod>=2?1.7:2.2,.6).forEach((q,i)=>{const s=i%2?1:-1;leafPath(P,q.p,rot(q.u,s*.85),lod>=2?.62*w:.55*w);});
  c.fillStyle=gc;c.fill(P);
}
// the glow round the pale hair: blurred once into a small canvas per cut and size, then laid under the hair each frame
// (a live shadow blur every frame costs more than the rest of him put together)
const GLOW={};
function hairGlow(hair,col,ks){const q=Math.pow(2,Math.round(Math.log2(Math.max(.15,ks))*2)/2),key=hair.name+col+q;if(GLOW[key])return GLOW[key];
  const x0=-130,y0=-125,w=210,h=190,cv=document.createElement('canvas');cv.width=Math.ceil(w*q);cv.height=Math.ceil(h*q);
  const g=cv.getContext('2d');g.scale(q,q);g.translate(-x0,-y0);g.shadowColor='rgba(255,236,190,.55)';g.shadowBlur=13*q;g.fillStyle=col;g.fill(hair.p);
  return GLOW[key]={cv,x0,y0,w,h};}
// hj (a turned figure): {h, C0: the head and the chest as seen, fa, hy: the head's own turn}. Near the profile (either side of him)
// the profile drawing is used, a little narrower as it turns; further round, the head in the round (headRound).
function drawHead(c,F,look,hair,env,lod,o,sz,hj){
  const H=HPATH,fa=hj?hj.fa:F.facing,C0=hj?hj.C0:F.p[CHE],h=hj?hj.h:F.p[HEAD],v=sub(h,C0),thw=Math.atan2(v.x,-v.y),s=F.body.headR*.0198*(sz/F.body.h);
  if(hj&&Math.abs(Math.sin(hj.hy))>.42){headRound(c,F,look,hair,env,lod,o,s,h,thw,fa,hj.hy);return;}
  const back=hj?(Math.cos(hj.hy)<0?-1:1):(F.lookBack||o.lookBack?-1:1),sx=hj?.8+.2*Math.abs(Math.cos(hj.hy)):1;
  c.save();c.translate(h.x,h.y);c.scale(fa*back*sx,1);c.rotate(thw*fa*back);c.scale(s,s);c.translate(0,-8);
  // light in the head's frame
  const Lw=env.L,Lh=rot(V(Lw.x*fa*back,Lw.y),-thw*fa*back),he={...env,L:Lh,rw:env.rw/s,ow:env.ow/s,k:env.k*s};
  const noir=isNoir(look),cel=isCel(look);
  // the skull, then the hair over it, then the ear in front of the hair
  look.paint(c,[{p:H.skull,c:V(6,10),r:42}],'skin',he);
  if(!noir&&lod>=1){c.save();c.clip(H.skull);c.globalAlpha=cel?.85:.5;c.fillStyle=tone(look,'skin',false,1);c.fill(H.skullShade);c.restore();}
  if(noir){const G=hairGlow(hair,look.col.hair,env.k*s);c.drawImage(G.cv,G.x0,G.y0,G.w,G.h);}
  if(noir){// pale, with the underside a step darker away from the light
    c.fillStyle=look.col.hairShade;c.fill(hair.p);c.save();c.clip(hair.p);c.translate(Lh.x*9,Lh.y*9);c.fillStyle=look.col.hair;c.fill(hair.p);c.restore();}
  else look.paint(c,[{p:hair.p,c:V(-24,-34),r:40}],'hair',he);
  if(lod>=1){c.save();c.clip(hair.p);c.strokeStyle=look.col.hairHi;c.lineWidth=2.2;c.globalAlpha=noir?.8:.55;c.stroke(hair.ph);c.restore();}
  look.paint(c,[{p:H.ear,c:V(-26,-2),r:16}],'skin',he);
  if(lod>=1){c.strokeStyle=noir?'#2b2128':cel?'#b8978a':'rgba(120,90,100,.7)';c.lineWidth=noir?5:4.4;c.stroke(new Path2D(HD.earIn));}
  // the face
  // (drained, F.drain, his eye is a dull grey, unlit; F.eyeLit gives it back a little light of its own)
  const dr=eyeDr(F),open=!!o.opening||!!F.opening,eyeC=mid(open?look.col.open:noir?look.col.eye:look.col.iris,EYE_DULL,dr);
  if(lod>=1&&!noir){c.strokeStyle=cel?'#3a2a2c':'rgba(70,45,55,.85)';c.lineWidth=4.4;c.stroke(H.brow);c.lineWidth=3;
    for(const k of ['nostril','mouth','chinLine'])c.stroke(H[k]);c.globalAlpha=.55;c.stroke(H.jawLine);c.globalAlpha=1;
    c.fillStyle=look.col.eye;c.fill(H.eye);c.save();c.clip(H.eye);c.fillStyle=eyeC;c.beginPath();c.arc(IRIS.x,IRIS.y,3.6,0,TAU);c.fill();c.fillStyle='#0b0b10';c.beginPath();c.arc(IRIS.x+.6,IRIS.y,1.7,0,TAU);c.fill();c.restore();
    c.strokeStyle='#1b1418';c.lineWidth=3.2;c.stroke(H.lid);c.stroke(H.lash);}
  if(noir&&lod>=1){c.strokeStyle='#22202a';c.lineWidth=6;c.stroke(H.brow);}
  // the eye glows: always in the noir look, and at game size in every look, where it does the work the old eye dot did
  // (F.drain 0..1: the magic gone out of him, and the light of his eyes with it)
  if((noir||lod===0||open)&&!F.dead&&dr<.98){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=1-dr;const r=open?13:9,g=c.createRadialGradient(IRIS.x-2,IRIS.y,0,IRIS.x-2,IRIS.y,r*1.8);
    g.addColorStop(0,open?'rgba(255,214,140,1)':'rgba(214,251,255,1)');g.addColorStop(.35,open?'rgba(255,193,99,.75)':'rgba(127,243,227,.7)');g.addColorStop(1,'rgba(127,243,227,0)');
    c.fillStyle=g;c.beginPath();c.arc(IRIS.x-2,IRIS.y,r*1.8,0,TAU);c.fill();c.restore();
    if(noir&&lod>=1){c.fillStyle=eyeC;c.fill(H.eye);}}
  if(noir&&lod>=1&&dr>.02&&!F.dead){c.save();c.globalAlpha=dr;c.fillStyle=EYE_DULL;c.fill(H.eye);c.restore();}
  c.restore();
}
const EYE_DULL='#3b4349',CRYSTAL_DULL='#34413f';
// how dark his eye is: the drain, less what light has come back into it of its own (F.eyeLit, the end of the fall)
function eyeDr(F){return cl((F.drain||0)-(F.eyeLit||0),0,1);}
// ---------- his head in the round ----------
// Turned well away from the profile, his head is built from its parts (FigKit.headModel): the skull with its face, the long ears
// standing off it, the cap of pale hair and the spikes swept back from it. The spikes down the middle are the profile's own; a row
// either side of them is a little shorter and turned out, and a row over the temples shorter again.
const HMODEL={};
function headModelOf(hair){if(HMODEL[hair.name])return HMODEL[hair.name];
  const Q=hair.pts,C0=V(-8,-8),sp=[];
  Q.forEach((q,j)=>{if(!q[2])return;const a=Q[j-1],b=Q[j+1]||Q[j-1],m=mix(mix(V(a[0],a[1]),V(b[0],b[1]),.5),C0,.25),R=[m.x,m.y],Tp=[q[0],q[1]];
    sp.push([[R[0],R[1],0],[Tp[0],Tp[1],0],9]);
    sp.push([[R[0]*.9,R[1]*.9+2,15],[R[0]+(Tp[0]-R[0])*.8,R[1]+(Tp[1]-R[1])*.8,20],8.5]);
    if(R[0]<12&&R[1]<12)sp.push([[R[0]*.82,R[1]*.75+7,26],[R[0]+(Tp[0]-R[0])*.58,R[1]+(Tp[1]-R[1])*.58+5,31],7]);});
  return HMODEL[hair.name]=FigKit.headModel({skull:SKULL_PTS,w:.97,ear:{pts:EAR_PTS,root:[-4,14],out:15,flare:4.5,base:27},eye:[IRIS.x,IRIS.y,12.5],
    hair:{line:[[0,-19],[.45,-12],[.75,-2],[1.05,8],[1.25,8],[1.42,-4],[1.7,-4],[1.95,12],[2.4,22],[3.15,25]],puff:3.5,spikes:sp}});}
function roundGlow(hair,hy,M,col,ks){if(typeof document==='undefined')return null;const st=Math.round(((hy%TAU)+TAU)%TAU/(Math.PI/12))%24,q=Math.pow(2,Math.round(Math.log2(Math.max(.15,ks))*2)/2),key='r'+hair.name+col+q+'|'+st;
  if(GLOW[key])return GLOW[key];const HV=FigKit.headView(M,st*Math.PI/12),x0=-120,y0=-125,w=240,h=200,cv=document.createElement('canvas');cv.width=Math.ceil(w*q);cv.height=Math.ceil(h*q);
  const g=cv.getContext('2d');g.scale(q,q);g.translate(-x0,-y0);g.shadowColor='rgba(255,236,190,.55)';g.shadowBlur=13*q;g.fillStyle=col;if(HV.hairBack)g.fill(HV.hairBack);if(HV.hairFront)g.fill(HV.hairFront);
  return GLOW[key]={cv,x0,y0,w,h};}
function headRound(c,F,look,hair,env,lod,o,s,h,thw,fa,hy){
  const M=headModelOf(hair),HV=FigKit.headView(M,hy),noir=isNoir(look);
  c.save();c.translate(h.x,h.y);c.scale(fa,1);c.rotate(thw*fa);c.scale(s,s);c.translate(0,-8);
  const Lw=env.L,Lh=rot(V(Lw.x*fa,Lw.y),-thw*fa),he={...env,L:Lh,rw:env.rw/s,ow:env.ow/s,k:env.k*s};
  // the hair: pale, the side away from the light a step darker
  const hairFill=P=>{if(!P)return;if(noir){c.fillStyle=look.col.hairShade;c.fill(P);c.save();c.clip(P);c.translate(Lh.x*9,Lh.y*9);c.fillStyle=look.col.hair;c.fill(P);c.restore();}
    else look.paint(c,[{p:P,c:V(-10,-30),r:40}],'hair',he);};
  // the glow round the pale hair, then the hair behind his head and the ear on the far side, the skull and face, the hair over them
  // and the ear toward the viewer
  if(noir){const G=roundGlow(hair,hy,M,look.col.hair,env.k*s);if(G)c.drawImage(G.cv,G.x0,G.y0,G.w,G.h);}
  hairFill(HV.hairBack);
  for(const E of HV.earsBack)look.paint(c,[{p:E.p,c:V(-26,-2),r:16}],'skin',{...he,far:true});
  look.paint(c,[{p:HV.skull,c:V(6,10),r:42}],'skin',he);
  hairFill(HV.hairFront);
  for(const E of HV.earsFront)look.paint(c,[{p:E.p,c:V(-26,-2),r:16}],'skin',he);
  // the face: the brow over each eye that can be seen, the eye, its glow, each as squarely as it faces the viewer
  const open=!!o.opening||!!F.opening,dr=eyeDr(F),eyeC=mid(open?look.col.open:noir?look.col.eye:look.col.iris,EYE_DULL,dr);
  // (close up and facing the viewer, the face's own shapes: on the dark skin they are where the light catches them, on the side it
  // comes from (lit: that side's lateral sign), and in shadow across from it; his brows as pale as his hair)
  const hc=Math.cos(hy),hs=Math.sin(hy),Pm=(f,y,l)=>V(f*hc+l*hs,y),front=cl((HV.noseZ-.25)/.5,0,1),lit=(Lh.x*hs<0?-1:1),rimC=look.col.rim||'#ffcf86';
  const face=lod>=1&&front>0,dark=noir||isNoir(look);
  if(face){c.save();c.clip(HV.skull);c.lineCap='round';
    const ln=(pts,col,w,a)=>{c.strokeStyle=col;c.lineWidth=w;c.globalAlpha=a*front;c.beginPath();c.moveTo(pts[0].x,pts[0].y);if(pts.length===3)c.quadraticCurveTo(pts[1].x,pts[1].y,pts[2].x,pts[2].y);else for(const q of pts.slice(1))c.lineTo(q.x,q.y);c.stroke();};
    // the cheekbone in the light, the chin
    ln([Pm(27,19,14*lit),Pm(21,16,20*lit),Pm(14,17,24*lit)],rimC,1.7,dark?.17:.12);
    ln([Pm(31,54,-3.5),Pm(33,55.5,0),Pm(31,54,3.5)],rimC,2.2,dark?.28:.18);
    // the nose: its bridge lit down the one side from between the eyes to the tip, the tip, the nostrils
    ln([Pm(36,8,2*lit),Pm(43,16,2.4*lit),Pm(48,22.5,2.4*lit)],rimC,1.8,dark?.42:.25);
    {const t=Pm(49,24.5,1.6*lit);c.globalAlpha=(dark?.34:.2)*front;c.fillStyle=rimC;c.beginPath();c.ellipse(t.x,t.y,2.4,1.7,0,0,TAU);c.fill();}
    c.globalAlpha=.55*front;c.fillStyle='#000000';for(const sd of [-1,1]){const n=Pm(45,28.5,3.8*sd);c.beginPath();c.ellipse(n.x,n.y,1.5,.9,0,0,TAU);c.fill();}
    // the lower lip catching the light under the line of the mouth
    ln([Pm(M.chin[0]+6,41.2,-4.2),Pm(M.chin[0]+8,42.6,0),Pm(M.chin[0]+6,41.2,4.2)],rimC,1.8,dark?.28:.18);
    c.globalAlpha=1;c.restore();}
  for(const e of HV.eyes){if(e.face<.05)continue;const f=cl(e.face*1.5,.2,1),q=e.p,out=e.sd*Math.sign(hs||1)>0?1:-1;
    if(lod>=1){
      // (facing the viewer the brow is pale, a little higher at its outer end; turned off, the old dark stroke)
      if(face){c.strokeStyle=look.col.hairShade||'#b3a37c';c.globalAlpha=.85;c.lineWidth=2.9;c.lineCap='round';c.beginPath();c.moveTo(q.x-7*f*out,q.y-8.5);c.quadraticCurveTo(q.x,q.y-12,q.x+8*f*out,q.y-11.5);c.stroke();c.globalAlpha=1;}
      else{c.strokeStyle=noir?'#22202a':'rgba(70,45,55,.85)';c.lineWidth=5;c.beginPath();c.moveTo(q.x-7*f,q.y-7);c.quadraticCurveTo(q.x,q.y-12,q.x+7*f,q.y-8);c.stroke();}
      c.fillStyle=eyeC;c.beginPath();c.moveTo(q.x-6.5*f,q.y);c.quadraticCurveTo(q.x,q.y-5,q.x+6.5*f,q.y-.5);c.quadraticCurveTo(q.x,q.y+3.6,q.x-6.5*f,q.y);c.fill();
      // (and the eye itself: its dark middle, a point of light in it, the lid over it)
      if(face){c.save();c.beginPath();c.moveTo(q.x-6.5*f,q.y);c.quadraticCurveTo(q.x,q.y-5,q.x+6.5*f,q.y-.5);c.quadraticCurveTo(q.x,q.y+3.6,q.x-6.5*f,q.y);c.clip();
        c.fillStyle='#0b0d10';c.beginPath();c.arc(q.x+.4*f,q.y-.3,2.5*Math.max(.6,f),0,TAU);c.fill();c.fillStyle='rgba(255,255,255,.75)';c.beginPath();c.arc(q.x-.5*f,q.y-1.2,.8,0,TAU);c.fill();c.restore();
        c.strokeStyle='#020104';c.lineWidth=2.4;c.beginPath();c.moveTo(q.x-7*f,q.y+.3);c.quadraticCurveTo(q.x,q.y-5.6,q.x+7*f,q.y-.6);c.stroke();}}
    if((noir||lod===0||open)&&!F.dead&&dr<.98){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=(1-dr)*Math.min(1,.35+f*.75);const r=open?13:9,g=c.createRadialGradient(q.x,q.y,0,q.x,q.y,r*1.8);
      g.addColorStop(0,open?'rgba(255,214,140,1)':'rgba(214,251,255,1)');g.addColorStop(.35,open?'rgba(255,193,99,.75)':'rgba(127,243,227,.7)');g.addColorStop(1,'rgba(127,243,227,0)');
      c.fillStyle=g;c.beginPath();c.arc(q.x,q.y,r*1.8,0,TAU);c.fill();c.restore();}}
  // the mouth, close up, when he faces the viewer
  if(lod>=1&&HV.noseZ>.3){c.strokeStyle=noir?'#020104':'rgba(70,45,55,.85)';c.lineWidth=2;c.beginPath();c.moveTo(HV.mouth[0].x,HV.mouth[0].y);c.quadraticCurveTo(HV.mouth[1].x,HV.mouth[1].y+.6,HV.mouth[2].x,HV.mouth[2].y);c.stroke();}
  c.restore();}
function scarfRibbon(c,F,look,env,now,sz){
  const s=F.scarf,pts=resample(s.map(q=>V(q.x,q.y)),3),N=pts.length,cel=isCel(look);
  const A=[],B=[],side=[];
  for(let i=0;i<N;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(N-1,i+1)],nn=perp(nrm(sub(b,a))),u=i/(N-1),tw=Math.cos(u*4.2+now*2.4),w=(4-1.4*u)*sz*(.3+.7*Math.abs(tw));
    A.push(add(pts[i],mul(nn,w/2)));B.push(sub(pts[i],mul(nn,w/2)));side.push(tw);}
  const quad=i=>{const P=new Path2D();P.moveTo(A[i].x,A[i].y);P.lineTo(A[i+1].x,A[i+1].y);P.lineTo(B[i+1].x,B[i+1].y);P.lineTo(B[i].x,B[i].y);P.closePath();return P;};
  if(cel){c.strokeStyle=look.line;c.lineWidth=env.ow*2;c.lineJoin='round';for(let i=0;i<N-1;i++)c.stroke(quad(i));}
  for(let i=0;i<N-1;i++){const front=(side[i]+side[i+1])>=0;c.fillStyle=tone(look,front?'scarf':look.col.scarfBack?'scarfBack':'lining',false,front&&(side[i]<.35)?1:0);c.fill(quad(i));}
  const e=pts[N-1],d=nrm(sub(pts[N-1],pts[N-3])),q=perp(d);c.strokeStyle=tone(look,'gold',false,0);c.lineWidth=.45;c.beginPath();
  for(let j=-2;j<=2;j++){const a=add(e,mul(q,j*.6*sz)),b=add(a,mul(d,2.4*sz));c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);}c.stroke();
}

// a copy of what a fighter needs to be drawn, so a pose can be drawn again later at any size
function snap(f,extra={}){
  const st=typeof arcState==='function'&&f.weaponKey==='elven'?arcState(f):null;
  return Object.assign({p:f.p.map(q=>V(q.x,q.y)),facing:f.facing,body:{...f.body},scarf:(f.scarf||[]).map(q=>V(q.x,q.y)),weaponKey:f.weaponKey,
    arcSt:st?{...st}:null,sidearm:f.sidearm,dead:f.dead,downed:f.downed,severed:f.severed,lookBack:f.look&&typeof tacLook==='function'?tacLook(f)<-.4:false,
    ground:Math.max(f.gr(f.p[FTF].x),f.gr(f.p[FTB].x)),t:typeof S!=='undefined'?S.t:0,dep:f.dep,opening:typeof S!=='undefined'&&S.opening&&S.opening.f===f,
    coatShield:f.coatShield,coatShred:f.coatShred,coatOff:f.coatOff,charge:f.charge,hemTears:f.hemTears,armOff:f.armOff,armTear:f.armTear,wear:f.wear,oneArm:f.oneArm,seared:f.seared,drain:f.drain,eyeLit:f.eyeLit,phantom:f.phantom},extra);}
// drawing needs Path2D and a context that reports its transform; without them (the headless checks) Kael keeps the old figure
const ok=typeof Path2D==='function'&&typeof CanvasRenderingContext2D!=='undefined'&&!!CanvasRenderingContext2D.prototype.getTransform;
return{draw,snap,cfg,ok,rng,LOOKS,OUTFITS,HAIRS,seen:SEEN,capsule,piece,coatTargets,hemLine,COAT,coatCloth,coatClothStep,coatFly,CLOTH,armPiece,windK,WIND,bareTube,armFront,MUS};
})();
// ---------- in the game ----------
// Kael (HERO_NAME on the screen: Ilyas) is S.F[0]; S.classicLook brings back the old figure
function lookOn(f){return KaelLook.ok&&f===S.F[0]&&f.name===HERO_NAME&&!S.classicLook;}
// the light that rims him, in his own drawing frame: the low sun outdoors, the nearest lamp on the street, the lamps overhead indoors
function kaelLight(f){
  if(S.arena.indoor)return{dir:{x:.18,y:-1}};
  if(S.arenaKey==='street'){const d=200,base=prjY(GB-KERB_H,d),px=f.p[PEL].x+f.dep*PSX;let best=null,bd=1e9;
    for(const lx of LAMPS){const x=prjX(lx,d)+16,dd=Math.abs(x-px);if(dd<bd){bd=dd;best=x;}}
    return{light:{x:best-f.dep*PSX,y:base-151+f.dep*PSY}};}
  return{light:{x:W*.62-f.dep*PSX,y:222+f.dep*PSY}};}
// the air going past him (world units a second, + toward +x): on a bike, or on the train, the wind of the ride. On the scrolling
// stages the road or the line goes by at S.scrollV while the bikes keep their places in the picture; in the tunnel he stands on the
// flatcar the whole stage, so the line's speed is his.
function kaelWind(f){const sc=S.arena&&S.arena.scroll?(S.scrollV||0):0;
  if(f.mount)return -((f.mount.vx||0)+sc);
  if(S.arenaKey==='tunnel')return -sc;
  for(const T of S.veh||[])if(T.kind==='train'&&T.riders&&T.riders.includes(f))return -((T.v||0)+sc);
  return 0;}
function drawKael(f){
  const L=kaelLight(f),drawing=f.sheath&&S.t<f.sheath.t0+f.sheath.out&&f.scab===f.weaponKey;
  KaelLook.draw(ctx,f,{light:L.light,dir:L.dir,now:S.t,wind:kaelWind(f),yaw:f._yaw||0,spin:f._spinU,headYaw:f._headYaw??(f.headTurn||undefined),latArm:f._latArm,latLeg:f._latLeg,latKnee:f._latKnee,latFoot:f._latFoot,phys:f._phys,opening:!!(S.opening&&S.opening.f===f),arcSt:f.weaponKey==='elven'?arcState(f):null,gore:S.gore!=='off'?GORE_COL[S.gore].mark:null,
    lookBack:!!(f.look&&tacLook(f)<-.4),bladeOK:!drawing,drawOther:drawWeapon,afterFarArm:f.sidearm==='offhand'?drawOffDagger:null,afterTorso:f.scab&&!f.dead?drawScabbard:null});
  if(f.severed&&S.gore!=='off'){ctx.fillStyle=GORE_COL[S.gore].mark;circ(f.p[CHE],f.body.torsoW*.34);}
  drawMarks(f);}
// ---------- the suit takes the damage ----------
// A blade that lands tears his clothes where it struck: a cut leaves a ragged slit, a stab a torn hole. A blow below the hips lands on
// the coat's skirt or the trouser leg in front of it, and a hard one on the skirt tears a notch out of the hem. Each tear rides on the
// part it struck for the rest of the fight, room to room. The cut mark the blow leaves is moved into the tear, so the wound shows
// through the cloth and the blood drips from there.
const RIP_MAX=16,HEM_MAX=5;
// The point of contact says which part was struck and roughly where, but it is where the blade met him, often off the cloth (a cut
// aimed at the body can meet him at the shoulder). So a few places are drawn round it on that part, and the tear goes in the one
// furthest from the tears already there, which keeps a run of hits from stacking in one spot.
function ripPlace(rips,cands){let best=null,bd=-1;
  for(const c of cands){let d=1e9;
    for(const r of rips){if(r.g!==c.g)continue;d=Math.min(d,c.g==='skirt'?Math.hypot((r.t-c.t)*32,(r.v-c.v)*40):r.a===c.a&&r.b===c.b?Math.hypot((r.u-c.u)*c.L,r.off-c.off):1e9);}
    if(d>bd){bd=d;best=c;}}
  delete best.L;return best;}
// blows that land with the butt, the pommel, the haft or a foot bruise him but do not cut cloth, even from a bladed weapon
const RIP_BLUNT=['pommel','butt','buttsweep','haft','shaftsweep','murder','kick'];
S.hooks.rip=(A,D,res,C,zone,edge,mark)=>{
  if(!edge||!C||!D||D!==S.F[0]||D.name!==HERO_NAME||zone==='head'||!res)return;
  const T=res.tech||{};if(T.kick||(T.along!=null&&T.along<0)||RIP_BLUNT.includes(T.key)){if(mark)mark.edge=false;return;}
  const p=D.p,fa=D.facing,crit=res.out==='crit',dmg=res.dmg||0,stab=res.kind==='thrust'||!!T.stab||/stab/i.test(T.name||''),rips=D.rips||(D.rips=[]),kind=res.kind;
  const R=KaelLook.rng((rips.length+1)*7919+Math.round(C.x*13)+Math.round(C.y*7)*31+dmg*101+(stab?17:0));
  const P0=p[PEL],C0=p[CHE],ux=C0.x-P0.x,uy=C0.y-P0.y,UL=Math.hypot(ux,uy)||1,along=((C.x-P0.x)*ux+(C.y-P0.y)*uy)/UL;
  // (whether the coat takes it is the outfit's say, never whether he has been drawn yet: the tear and the wound's place are records
  // the game keeps. The hem's corners place the tear on the skirt; before his first frame is drawn they are taken at his knees.)
  const coat=KaelLook.cfg.outfit==='coat'&&!D.coatOff,low=(zone==='leg'||zone==='body')&&along<-2,cands=[];let rip;
  if(coat&&low&&(zone==='body'||R()<.55)){
    const q=D._coat&&D._coat.q||[p[KNF],p[KNB]],Xf=Math.max(q[0].x*fa,q[1].x*fa),Xb=Math.min(q[0].x*fa,q[1].x*fa),hemY=(q[0].y+q[1].y)/2;
    const t0=clamp((Xf-C.x*fa)/Math.max(6,Xf-Xb),.25,.85),v0=clamp((C.y-P0.y)/Math.max(6,hemY-P0.y),.25,.8);
    for(let i=0;i<5;i++)cands.push({g:'skirt',t:clamp(t0+(R()-.5)*.36,.22,.85),v:clamp(v0*.45+(.28+R()*.5)*.55,.25,.8)});
    rip=ripPlace(rips,cands);
    // a sweep opens the coat across, anything else down or on the slant
    rip.ang=kind==='sweep'?(R()-.5)*.6:Math.PI/2+(R()-.5)*(kind==='overhead'?.5:1.3);
    // a hard blow also tears a notch out of the hem, toward the back where the coat flares
    const tears=D.hemTears||(D.hemTears=[]);if((crit||dmg>=10||R()<.5)&&tears.length<HEM_MAX)tears.push({t:.32+R()*.55,d:5+R()*5+(crit?3:0),w:2.6+R()*2.4});}
  else{
    // the near arm; the near leg unless the far one took it squarely; the torso on his flank behind the line of his arm, where the arm
    // does not cover it in guard (a blow from in front lands nearer the arm, one from behind further back)
    if(zone==='arm'&&D.coatOff){if(mark)mark.edge=true;return;}
    const segs=zone==='arm'?[['armN',CHE,ELF],['armN',ELF,HAF]]:zone==='leg'?[['legN',PEL,KNF],['legN',KNF,FTF],['legF',PEL,KNB],['legF',KNB,FTB]]:[['torso',PEL,CHE]];
    let best=null;const info=segs.map(([g,a,b])=>{const A0=p[a],B0=p[b],abx=B0.x-A0.x,aby=B0.y-A0.y,L2=abx*abx+aby*aby||1,L=Math.sqrt(L2),u=clamp(((C.x-A0.x)*abx+(C.y-A0.y)*aby)/L2,.15,.85),qx=A0.x+abx*u,qy=A0.y+aby*u;
      const s={g,a,b,u,L,d:Math.hypot(C.x-qx,C.y-qy)+(g==='legF'?(coat?40:6):0),off:(C.x-qx)*(-aby/L*fa)+(C.y-qy)*(abx/L*fa)};if(!best||s.d<best.d)best=s;return s;});
    for(let i=0;i<5;i++){
      if(best.g==='torso'){cands.push({g:'torso',a:PEL,b:CHE,L:best.L,u:clamp(clamp(best.u,.25,.78)*.4+(.25+R()*.53)*.6,.25,.78),off:clamp(-4.3+clamp(best.off/8,-1,1)*1.3+(R()-.5)*1.8,-6.4,-2.4)});continue;}
      // most often the part nearest the contact, sometimes the other half of the same limb
      const same=info.filter(s=>s.g===best.g),s=R()<.65||same.length<2?best:same.find(z=>z!==best),arm=s.g[0]==='a',thigh=s.a===PEL;
      // (short of the cuff on the forearm and the shoe on the shin)
      cands.push({g:s.g,a:s.a,b:s.b,L:s.L,u:arm?(s.a===CHE?.22+R()*.6:.18+R()*.44):thigh?.32+R()*.5:.2+R()*.5,off:(R()-.5)*(arm?2.6:3.8)});}
    rip=ripPlace(rips,cands);
    const torso=rip.g==='torso';
    // across the part for a cut, along it for a blow from above; on the torso a slash runs on the slant and a sweep straight across
    rip.ang=torso?(kind==='overhead'?(R()-.5)*.5:Math.PI/2+(kind==='sweep'?(R()-.5)*.3:(R()<.5?-1:1)*(.3+R()*.45))):kind==='overhead'?(R()-.5)*.8:Math.PI/2+(R()-.5);}
  rip.stab=stab;rip.seed=Math.floor(R()*2147483647);
  // a stab hole runs with the blade's edge, up and down him
  if(stab){rip.r=(2.1+R()*.8)*(crit?1.3:1);rip.ang=(rip.g==='skirt'?Math.PI/2:0)+(R()-.5)*.9;}
  else{const torso=rip.g==='torso';rip.len=clamp((torso?9:7)+dmg*.3,7,torso?16:12)*(crit?1.2:1);rip.wid=2.2+R()*1.2;}
  rips.push(rip);if(rips.length>RIP_MAX)rips.shift();
  const away=Math.sign(C.x-(A?A.p[PEL].x:C.x-fa))||-fa;
  for(let i=0;i<5;i++)S.dusts.push({x:C.x,y:C.y,d:D.dep,vx:away*(40+R()*90),vy:-30-R()*70,r:.9+R()*1.1,age:0,life:.35+R()*.25,c:i%2?'#0d0b12':'#1f6b64'});
  if(mark){mark.rip=true;if(rip.g==='skirt'){mark.a=PEL;mark.b=KNF;mark.u=.45;mark.off=0;}else{mark.a=rip.a;mark.b=rip.b;mark.u=rip.u;mark.off=rip.off;}}
};
// ===== LOOK UI END =====
