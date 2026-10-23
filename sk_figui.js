// ===== FIGURE KIT =====
// What Kael's look (sk_lookui.js) and the cast's (sk_castui.js) share in how a figure is shaped and lit.
// - A limb is one shape through its joints (shoulder, elbow, wrist; hip, knee, ankle), not a chain of cut-outs: on the inside of a
//   bent joint the cloth is gathered in and folds, on the outside it is pulled round the joint; the shoulder's mass rides on the
//   upper arm and turns with it.
// - Light falls in planes. Each shape gets a broad plane of light along the side that faces the light, as wide and as strong as its
//   material allows: wide and soft on wool, narrower and sharper on leather, a thin bright line on steel. The rim of light runs only
//   along the parts of an outline that actually face the light, and breaks where the outline turns away or where another part of
//   the same shape covers it.
// Every shape made here carries its outline (o, outward normals worked out from its winding), the width of the shape at each point
// of it (ow), and a test for whether a point is inside it, which is what the lighting works from.
const FigKit=(()=>{
const V=(x,y)=>({x,y}),add=(a,b)=>V(a.x+b.x,a.y+b.y),sub=(a,b)=>V(a.x-b.x,a.y-b.y),mul=(a,k)=>V(a.x*k,a.y*k),
  len=a=>Math.hypot(a.x,a.y),nrm=a=>{const l=Math.hypot(a.x,a.y)||1;return V(a.x/l,a.y/l);},perp=a=>V(-a.y,a.x),
  mix=(a,b,u)=>V(a.x+(b.x-a.x)*u,a.y+(b.y-a.y)*u),dot=(a,b)=>a.x*b.x+a.y*b.y,cross=(a,b)=>a.x*b.y-a.y*b.x,
  cl=(v,a,b)=>Math.max(a,Math.min(b,v)),TAU=Math.PI*2,ss=(a,b,x)=>{const t=cl((x-a)/(b-a),0,1);return t*t*(3-2*t);};
// ---------- outlines ----------
// the curve the looks draw through a run of points (cubic Beziers, Catmull-Rom with tension t), as points: `per` to a span. The
// same curve as their smooth(), so a path made from these points is the shape they would have drawn.
function curvePts(Q,closed=true,t=.5,per=3,W=null){const n=Q.length,g=i=>Q[closed?((i%n)+n)%n:cl(i,0,n-1)],gw=i=>W?W[closed?((i%n)+n)%n:cl(i,0,n-1)]:0,out=[],ow=[];
  for(let i=0;i<(closed?n:n-1);i++){const p0=g(i-1),p1=g(i),p2=g(i+1),p3=g(i+2),c1=V(p1.x+(p2.x-p0.x)*t/3,p1.y+(p2.y-p0.y)*t/3),c2=V(p2.x-(p3.x-p1.x)*t/3,p2.y-(p3.y-p1.y)*t/3);
    for(let j=0;j<per;j++){const s=j/per,a=(1-s)*(1-s)*(1-s),b=3*(1-s)*(1-s)*s,c=3*(1-s)*s*s,d=s*s*s;
      out.push(V(a*p1.x+b*c1.x+c*c2.x+d*p2.x,a*p1.y+b*c1.y+c*c2.y+d*p2.y));ow.push(gw(i)+(gw(i+1)-gw(i))*s);}}
  if(!closed){out.push(Q[n-1]);ow.push(gw(n-1));}
  return{pts:out,ow};}
function pathOf(P,closed=true){const D=new Path2D();D.moveTo(P[0].x,P[0].y);for(let i=1;i<P.length;i++)D.lineTo(P[i].x,P[i].y);if(closed)D.closePath();return D;}
// the outward normal at each point of a closed outline (from its winding)
function normals(P){const n=P.length;let A=0;for(let i=0;i<n;i++){const a=P[i],b=P[(i+1)%n];A+=a.x*b.y-b.x*a.y;}const sg=A>=0?1:-1,N=[];
  for(let i=0;i<n;i++){const a=P[(i-1+n)%n],b=P[(i+1)%n],d=nrm(sub(b,a));N.push(V(d.y*sg,-d.x*sg));}return N;}
function inPoly(P,x,y){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)c=!c;}return c;}
function segDist(p,a,b){const ab=sub(b,a),t=cl(dot(sub(p,a),ab)/(dot(ab,ab)||1e-9),0,1);return{d:len(sub(p,add(a,mul(ab,t)))),t};}
// a shape through points, as the looks' piece() (path, centre, half-width), with its outline
// (the path is drawn as the looks always drew it; the outline, its normals and its widths are only worked out when the light asks)
function piece(Q,t=.5,per=2,lit=false){let cx=0,cy=0;for(const q of Q){cx+=q.x;cy+=q.y;}const c=V(cx/Q.length,cy/Q.length);let r=0;for(const q of Q)r=Math.max(r,len(sub(q,c)));
  let P=null,N=null,T=null;const op=()=>P||(P=curvePts(Q,true,t,per).pts);
  return{p:smoothPath(Q,t),c,r:r*.62,lit,get o(){return op();},get on(){return N||(N=normals(op()));},get ow(){return T||(T=thick(op(),this.on,c,r*2));},inside:pt=>inPoly(op(),pt.x,pt.y)};}
function smoothPath(Q,t){const n=Q.length,g=i=>Q[((i%n)+n)%n],P=new Path2D();P.moveTo(Q[0].x,Q[0].y);
  for(let i=0;i<n;i++){const p0=g(i-1),p1=g(i),p2=g(i+1),p3=g(i+2);P.bezierCurveTo(p1.x+(p2.x-p0.x)*t/3,p1.y+(p2.y-p0.y)*t/3,p2.x-(p3.x-p1.x)*t/3,p2.y-(p3.y-p1.y)*t/3,p2.x,p2.y);}
  P.closePath();return P;}
// how thick a shape is at each point of its outline, roughly: twice the way in to its middle, straight in from the edge (exact for
// an ellipse, near enough for the rounded shapes of a figure, and capped)
function thick(P,N,c,cap){const n=P.length,out=new Float32Array(n);
  for(let i=0;i<n;i++){const d=-(N[i].x*(P[i].x-c.x)+N[i].y*(P[i].y-c.y));out[i]=cl(2*d,.5,cap);}
  return out;}
// a path a look has made its own way, given the outline it follows (points in order round it)
function outlined(p,P,c,r){const N=normals(P);let T=null;return{p,c,r,lit:true,o:P,on:N,get ow(){return T||(T=thick(P,N,c,r*3));},inside:pt=>inPoly(P,pt.x,pt.y)};}
// a limb segment: two circles joined by their outer tangents (the looks' capsule()), with its outline
function capsule(a,b,wa,wb){const d=sub(b,a),L=len(d)||1e-6,u=mul(d,1/L),n=perp(u),ra=wa/2,rb=wb/2,s=cl((ra-rb)/L,-.95,.95),co=Math.sqrt(1-s*s);
  const m=add(mul(u,s),mul(n,co)),m2=sub(mul(u,s),mul(n,co)),t1=Math.atan2(m.y,m.x),t2=Math.atan2(m2.y,m2.x),P=new Path2D();
  P.moveTo(a.x+m.x*ra,a.y+m.y*ra);P.lineTo(b.x+m.x*rb,b.y+m.y*rb);P.arc(b.x,b.y,rb,t1,t2,true);P.lineTo(a.x+m2.x*ra,a.y+m2.y*ra);P.arc(a.x,a.y,ra,t2,t1,true);P.closePath();
  // the outline (only worked out when the light asks): down one side, round the end, back up the other, round the start
  let O=null,W=null,N=null;const mk=()=>{O=[];W=[];const arc=(cx,r,from,to,k)=>{let span=to-from;while(span>0)span-=TAU;for(let i=1;i<k;i++){const t=from+span*i/k;O.push(V(cx.x+Math.cos(t)*r,cx.y+Math.sin(t)*r));W.push(r*2);}};
    for(let i=0;i<=3;i++){const f=i/3;O.push(V(lerp(a.x+m.x*ra,b.x+m.x*rb,f),lerp(a.y+m.y*ra,b.y+m.y*rb,f)));W.push(lerp(wa,wb,f));}
    arc(b,rb,t1,t2,6);for(let i=0;i<=3;i++){const f=i/3;O.push(V(lerp(b.x+m2.x*rb,a.x+m2.x*ra,f),lerp(b.y+m2.y*rb,a.y+m2.y*ra,f)));W.push(lerp(wb,wa,f));}arc(a,ra,t2,t1,6);};
  return{p:P,c:mix(a,b,.5),r:Math.max(ra,rb),a,b,u,lit:false,get o(){if(!O)mk();return O;},get on(){return N||(N=normals(this.o));},get ow(){if(!W)mk();return W;},
    inside:pt=>{const q=segDist(pt,a,b);return q.d<lerp(ra,rb,q.t)-.25;}};}
function lerp(a,b,t){return a+(b-a)*t;}
// ---------- the limb ----------
// J: the joints in order, R: the half-width at each. o.gather: how much the inside of a bent joint draws in; o.stretch: how far the
// outside is pulled round it; o.bulge[i]: the swell along segment i (a fraction of its width), o.bulgeSide[i]: +1 or -1 to put it
// on one side only (the calf behind the shin), 0 both; o.cap0 and o.cap1: the round ends' size (the shoulder's cap is the deltoid,
// so it swells and turns with the arm). o.prof[i], if given, is segment i's own outline instead of its swell: points [t, kA, kB] down
// it, the width out to side A and to side B there as a share of the half-width (a muscle's swell on one side, its tendon on the
// other); it is kept at the game's own size, where a muscled arm's outline is most of what shows of it. Returns a shape like the
// others, plus the fold places at its bent joints.
function tube(J,R,o={}){const n=J.length,D=[];for(let i=0;i<n-1;i++)D.push(nrm(sub(J[i+1],J[i])));
  const A=[],B=[],WA=[],WB=[],folds=[],gather=o.gather??.3,stretch=o.stretch??.12;
  const pushSide=(arr,warr,p,w)=>{arr.push(p);warr.push(w);};
  for(let i=0;i<n;i++){
    if(i>0&&o.prof&&o.prof[i-1]){const a=J[i-1],b=J[i],nn=perp(D[i-1]);
      for(const [t,kA,kB] of o.prof[i-1]){const p=mix(a,b,t),r=lerp(R[i-1],R[i],t);pushSide(A,WA,add(p,mul(nn,r*kA)),r*(kA+kB));pushSide(B,WB,sub(p,mul(nn,r*kB)),r*(kA+kB));}}
    // along each segment: its swell (not at the game's own size, where it would be under a pixel)
    else if(i>0&&!o.lite){const a=J[i-1],b=J[i],d=D[i-1],nn=perp(d),bl=(o.bulge&&o.bulge[i-1])||0,bs=(o.bulgeSide&&o.bulgeSide[i-1])||0;
      for(const t of [.3,.62]){const p=mix(a,b,t),r=lerp(R[i-1],R[i],t),sw=Math.sin(Math.PI*Math.min(1,t*1.15))*bl*r;
        pushSide(A,WA,add(p,mul(nn,r+(bs>=0?sw:0))),r*2);pushSide(B,WB,sub(p,mul(nn,r+(bs<=0?sw:0))),r*2);}}
    const r=R[i];
    if(i===0||i===n-1){const d=D[Math.min(i,n-2)],nn=perp(d);pushSide(A,WA,add(J[i],mul(nn,r)),r*2);pushSide(B,WB,sub(J[i],mul(nn,r)),r*2);continue;}
    // a joint: the inside gathers, the outside goes round
    const d0=D[i-1],d1=D[i],bend=Math.acos(cl(dot(d0,d1),-1,1)),cr=cross(d0,d1),m=nrm(add(perp(d0),perp(d1))),ch=Math.max(.6,dot(m,perp(d1)));
    const sb=Math.sin(Math.min(bend,1.5)),gi=1-gather*sb,so=1+stretch*sb,inA=cr>0;
    const inner=mul(m,(inA?1:-1)*r*gi/ch),innerP=add(J[i],inner);
    const outSide=inA?-1:1,o0=add(J[i],mul(perp(d0),outSide*r*so)),o1=add(J[i],mul(perp(d1),outSide*r*so)),oM=add(J[i],mul(m,outSide*r*so*1.04));
    if(inA){pushSide(A,WA,innerP,r*2);if(bend>.25){pushSide(B,WB,o0,r*2);pushSide(B,WB,oM,r*2);pushSide(B,WB,o1,r*2);}else pushSide(B,WB,oM,r*2);}
    else{pushSide(B,WB,innerP,r*2);if(bend>.25){pushSide(A,WA,o0,r*2);pushSide(A,WA,oM,r*2);pushSide(A,WA,o1,r*2);}else pushSide(A,WA,oM,r*2);}
    if(bend>.42)folds.push({J:J[i],inner:innerP,out:oM,m:mul(m,inA?1:-1),d0,d1,bend,r});}
  // the round ends: behind the start, beyond the end
  const r0=R[0]*(o.cap0??1),r1=R[n-1]*(o.cap1??1),dS=D[0],dE=D[n-2];
  // end cap from side A round the far end to side B; start cap from B round behind the start to A
  const nc=o.lite?3:5;
  const capE=[];for(let i=1;i<nc;i++){const t=Math.PI*i/nc,dir=add(mul(perp(dE),Math.cos(t)),mul(dE,Math.sin(t)));capE.push(add(J[n-1],mul(dir,r1)));}
  const capS=[];for(let i=1;i<nc;i++){const t=Math.PI*i/nc,dir=add(mul(perp(dS),-Math.cos(t)),mul(dS,-Math.sin(t)));capS.push(add(J[0],mul(dir,r0)));}
  const Q=[...A,...capE,...B.slice().reverse(),...capS],QW=[...WA,...capE.map(()=>R[n-1]*2),...WB.slice().reverse(),...capS.map(()=>R[0]*2)];
  let cx=0,cy=0;for(const q of J){cx+=q.x;cy+=q.y;}let C=null,N=null;const oc=()=>C||(C=curvePts(Q,true,o.t??.5,o.lite?1:2,QW));
  // at the game's own size the outline the light works from is the path itself (straight runs between the curve's points)
  return{p:o.lite?pathOf(oc().pts):smoothPath(Q,o.t??.5),c:V(cx/n,cy/n),r:Math.max(...R),lit:true,get o(){return oc().pts;},get on(){return N||(N=normals(oc().pts));},get ow(){return oc().ow;},J,R,folds,
    inside:pt=>{for(let i=0;i<n-1;i++){const q=segDist(pt,J[i],J[i+1]);if(q.d<lerp(R[i],R[i+1],q.t)-.25)return true;}return false;}};}
// ---------- light ----------
// how each material takes the light: plane (the lit plane's width, a share of the shape's width), mix (how far toward the light's
// colour the plane goes), spec and specW (a second, narrow and brighter band along the very edge: a sheen, a shine), rim (the rim's
// strength), th (how squarely an edge must face the light to carry the rim)
const CLS={
  wool:{plane:.44,mix:.13,spec:0,rim:.75,th:.5},
  cotton:{plane:.46,mix:.15,spec:0,rim:.6,th:.52},
  satin:{plane:.3,mix:.13,spec:.4,specW:.13,rim:.8,th:.48},
  leather:{plane:.26,mix:.12,spec:.5,specW:.1,rim:.9,th:.45},
  steel:{plane:.16,mix:.22,spec:.95,specW:.08,rim:1,th:.42},
  skin:{plane:.4,mix:.13,spec:0,rim:.7,th:.5},
  // (a scaled hide: a narrower plane than skin and a sheen along its edge, between leather's and satin's)
  hide:{plane:.32,mix:.2,spec:.42,specW:.09,rim:.85,th:.46},
  // (a goblin's skin: as skin, the plane a little stronger on so dark a green)
  gskin:{plane:.42,mix:.18,spec:0,rim:.72,th:.5}};
function hex(a){return[1,3,5].map(i=>parseInt(a.slice(i,i+2),16));}
const MIXC={};
function mixHex(a,b,u){const k=a+b+u.toFixed(3);if(MIXC[k])return MIXC[k];const A=hex(a),B=hex(b);return MIXC[k]='#'+A.map((v,i)=>Math.round(v+(B[i]-v)*u).toString(16).padStart(2,'0')).join('');}
// a shape the light is worked out for: one the look has marked as a main form, big enough to carry a plane (env.litMin; the small
// parts, a cuff, a collar, a button, keep the plain rim the look gives them), and at the game's own size not on the far side of him
function litOK(q,env){return!!q&&!!q.lit&&q.r>=(env.litMin||0)&&!(env.far&&(env.k||1)<2.4);}
// After a shape's base fill: its plane of light, its sheen (for the materials that have one), and its rim, along the lit runs of its
// outline. env: {L (toward the light, unit), rw (the rim's width), k (the drawing scale)}; o: {cls, base, light (its colour), far}
function light(c,ps,env,o){let some=false;for(const q of ps)if(litOK(q,env)){some=true;break;}if(!some)return;
  const K=CLS[o.cls]||CLS.wool,L=env.L,far=!!o.far,f0=far?.55:1;
  const planeCol=mixHex(o.base,o.light,K.mix*f0),specCol=K.spec?mixHex(o.base,o.light,Math.min(.9,K.mix+K.spec*(far?.25:.55))):null;
  const PL=new Path2D(),SP=K.spec?new Path2D():null,RM=[new Path2D(),new Path2D()];let any=false,anyR=[false,false],anyS=false;
  const rw=env.rw||1,th=K.th,pmax=env.planeMax||1e9,small=(env.k||1)<2.4;
  const many=ps.length>1;
  for(const q of ps){if(!litOK(q,env))continue;const O=q.o,N=q.on,n=O.length,W=q.ow,w0=q.w||q.r*1.8;
    // how squarely each point faces the light, nothing where another part of the same shape covers it
    // (the test is made a little way out from the edge, so where two shapes meet edge to edge, as the two halves of a turned torso
    // do down his middle, the edge between them is not taken for an outline)
    const f=new Float32Array(n);for(let i=0;i<n;i++){const lit=N[i].x*L.x+N[i].y*L.y;if(lit<=0)continue;let hid=false;
      if(many){const tp=V(O[i].x+N[i].x*.75,O[i].y+N[i].y*.75);for(const z of ps){if(z!==q&&z.inside&&z.inside(tp)){hid=true;break;}}}f[i]=hid?0:lit;}
    // the lit runs
    let i0=-1;for(let s=0;s<n;s++)if(f[s]<.12){i0=s;break;}
    const runs=[];if(i0<0)runs.push([...Array(n).keys()]);else{let run=null;for(let k=1;k<=n;k++){const i=(i0+k)%n;if(f[i]>=.12){if(!run)run=[];run.push(i);}else if(run){runs.push(run);run=null;}}if(run)runs.push(run);}
    for(const R of runs){if(R.length<2)continue;
      // the plane: a band along the run, as wide as the material lets it be (a share of the shape's width there, never more than a
      // plane's width on a figure) where the outline faces the light squarely, narrowing to nothing where it turns away; its inner
      // edge smoothed so it reads as one plane, not a copy of every bump in the outline
      const m=R.length,wd=new Float32Array(m),nx=new Float32Array(m),ny=new Float32Array(m);
      const pf=q.pf||K.plane,pm=q.pw||pmax;for(let k=0;k<m;k++){const i=R[k];wd[k]=Math.min((W?W[i]:w0)*pf,pm)*ss(.12,.62,f[i]);nx[k]=N[i].x;ny[k]=N[i].y;}
      for(let pass=0;pass<2;pass++)for(let k=1;k<m-1;k++){wd[k]=(wd[k-1]+wd[k]*2+wd[k+1])/4;nx[k]=(nx[k-1]+nx[k]*2+nx[k+1])/4;ny[k]=(ny[k-1]+ny[k]*2+ny[k+1])/4;}
      const inner=[];for(let k=0;k<m;k++){const i=R[k],l=Math.hypot(nx[k],ny[k])||1;inner.push(V(O[i].x-nx[k]/l*wd[k],O[i].y-ny[k]/l*wd[k]));}
      PL.moveTo(O[R[0]].x,O[R[0]].y);for(let k=1;k<R.length;k++)PL.lineTo(O[R[k]].x,O[R[k]].y);for(let k=inner.length-1;k>=0;k--)PL.lineTo(inner[k].x,inner[k].y);PL.closePath();any=true;
      if(SP){const sw=[];for(const i of R){const w=(W?W[i]:w0)*K.specW*ss(.35,.85,f[i]);sw.push(sub(O[i],mul(N[i],w)));}
        SP.moveTo(O[R[0]].x,O[R[0]].y);for(let k=1;k<R.length;k++)SP.lineTo(O[R[k]].x,O[R[k]].y);for(let k=sw.length-1;k>=0;k--)SP.lineTo(sw[k].x,sw[k].y);SP.closePath();anyS=true;}
      // the rim: only where the edge faces the light squarely, strongest where it faces it most; a line just inside the edge, drawn
      // as unbroken runs (one stroke each) so it costs little
      let cur=-1;for(let k=0;k<R.length-1;k++){const i=R[k],j=R[k+1],fm=(f[i]+f[j])/2,lv=fm<th?-1:(small||fm>th+(1-th)*.5)?1:0;
        if(lv<0){cur=-1;continue;}const b=V(O[j].x-N[j].x*rw*.5,O[j].y-N[j].y*rw*.5);
        if(lv!==cur){const a=V(O[i].x-N[i].x*rw*.5,O[i].y-N[i].y*rw*.5);RM[lv].moveTo(a.x,a.y);cur=lv;anyR[lv]=true;}RM[lv].lineTo(b.x,b.y);}}}
  if(any){c.fillStyle=planeCol;c.fill(PL);}
  if(anyS){c.fillStyle=specCol;c.fill(SP);}
  if(anyR[0]||anyR[1]){const a0=c.globalAlpha;c.lineCap='butt';c.lineJoin='bevel';c.strokeStyle=o.light;c.lineWidth=rw;
    if(anyR[0]){c.globalAlpha=a0*K.rim*.5*(far?.4:1);c.stroke(RM[0]);}if(anyR[1]){c.globalAlpha=a0*K.rim*(small?.85:1)*(far?.4:1);c.stroke(RM[1]);}c.globalAlpha=a0;}}
// folds where a limb is bent: the cloth bunched on the inside of the joint, a few short creases fanning from it, caught by the light
// on the lit side and dark on the other
function folds(c,tb,env,o){if(!tb.folds||!tb.folds.length)return;const L=env.L,k=env.k||1;if(o.far&&k<2.4)return;
  for(const F of tb.folds){const n=F.bend>1.1&&k>=2.4?3:2,lit=dot(F.m,L)>0,sp=F.r*.5;
    c.strokeStyle=lit?o.lit:o.dark;c.lineWidth=Math.max(.35,(o.w||.55)*F.r*.18);c.lineCap='round';c.beginPath();
    for(let i=0;i<n;i++){const s=(i-(n-1)/2)*sp,dd=nrm(add(F.d0,F.d1)),base=add(F.inner,mul(dd,s)),tip=add(base,mul(F.m,-F.r*(.65+.12*i))),mid=add(mix(base,tip,.5),mul(dd,F.r*.18));
      c.moveTo(base.x,base.y);c.quadraticCurveTo(mid.x,mid.y,tip.x,tip.y);}
    c.stroke();void k;}}
// ---------- turning ----------
// The fights are drawn in profile, the near side toward the viewer. A figure turning on the spot is drawn turned about its upright
// axis by yaw: 0 is that profile, π/2 has his back to the viewer, π is the profile from his other side, 3π/2 his front. A point of
// him has its place in the profile plane (x, y) and a lateral offset l, + toward the viewer at yaw 0. Turned, it is drawn at
// x' = px + (x − px)·cos + fa·l·sin, and lies toward the viewer by −(x − px)·fa·sin + l·cos.
function view(px,fa,yaw){const c=Math.cos(yaw),s=Math.sin(yaw);
  return{px,fa,yaw,c,s,fv:c>=0?fa:-fa,at:(q,l)=>V(px+(q.x-px)*c+fa*l*s,q.y),dep:(q,l)=>-(q.x-px)*fa*s+l*c};}
const wrap=x=>x-TAU*Math.round(x/TAU);
// a spin at a point of it (0..1) as a turn: his back comes round first, the turn gathers speed through the middle and eases into
// the end
function spinYaw(u){u=cl(u,0,1);return TAU*u-.45*Math.sin(TAU*u);}
// The head leads a turn: it holds on the man in front of him while the body comes round, whips round ahead of the body, and is
// there waiting when the body arrives.
function headYaw(phi){const a=.4*Math.PI,b=1.6*Math.PI;phi=((phi%TAU)+TAU)%TAU;if(phi<=a)return 0;if(phi>=b)return TAU;const t=(phi-a)/(b-a);return TAU*t*t*(3-2*t);}
// The torso as a stack of elliptical sections. tab: rows [a, s at the back, s at the front, half-width across] up the torso, a
// along it from the hips, the rest in the look's own units (times sz). A point the look places at (a, s) in profile is on the near
// half of the section at its height (side 1), or the far half (side −1, its mirror image). Turned, it is drawn where that place on
// the body is seen. A place the turn has carried out of sight is held at the edge of what can be seen and flagged h, so a shape that
// runs out of sight folds onto the outline instead of showing through it; a point standing off the section (a collar's point) keeps
// its distance from it.
function torsoMap(vw,P0,u,n,sz,tab,side){const nf=n.x*vw.fa,m=side*Math.PI/2,H=Math.PI/2;
  const sec=a=>{let i=0;while(i<tab.length-2&&tab[i+1][0]<a)i++;const A=tab[i],B=tab[i+1],t=cl((a-A[0])/((B[0]-A[0])||1),0,1);
    return[A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t,A[3]+(B[3]-A[3])*t];};
  const range=(D,wd)=>{const tv=Math.atan2(vw.c/wd,-nf*vw.s/D),tp=m+wrap(tv-m);return[Math.max(m-H,tp-H),Math.min(m+H,tp+H)];};
  // (a point well off the section, like a collar's point, keeps at most a little of its distance across: rho is capped)
  const f=(a,s)=>{const S=sec(a),sc=(S[0]+S[1])/2,D=Math.max(.4,(S[1]-S[0])/2),r=(s-sc)/D,rho=Math.min(1.35,Math.max(1,Math.abs(r))),R=range(D,S[2]);
    let t=side*Math.acos(cl(r,-1,1)),h=false;if(t<R[0]-1e-9){t=R[0];h=true;}else if(t>R[1]+1e-9){t=R[1];h=true;}
    const sx=h?sc+rho*D*Math.cos(t):(Math.abs(r)>1?s:sc+D*Math.cos(t)),q=add(add(P0,mul(u,a)),mul(n,sx*sz)),o=vw.at(q,rho*S[2]*Math.sin(t)*sz);o.h=h;return o;};
  // how much of this half can be seen (at the chest), and the depth toward the viewer of a place on it
  {const a=tab[Math.floor(tab.length*.6)][0],S=sec(a),R=range(Math.max(.4,(S[1]-S[0])/2),S[2]);f.vis=(R[1]-R[0])/Math.PI;}
  return f;}
// the runs of a line that can be seen (points flagged h are out of sight)
function seen(Q){if(!Q.some(q=>q&&q.h))return[Q];const out=[];let cur=[];for(const q of Q){if(q.h){if(cur.length>1)out.push(cur);cur=[];}else cur.push(q);}if(cur.length>1)out.push(cur);return out;}
// the convex hull of points, in order round it
function hull(P){const a=P.slice().sort((p,q)=>p.x-q.x||p.y-q.y);if(a.length<3)return a;const cr=(o,p,q)=>(p.x-o.x)*(q.y-o.y)-(p.y-o.y)*(q.x-o.x);
  const lo=[],up=[];for(const p of a){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p);}
  for(let i=a.length-1;i>=0;i--){const p=a[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p);}
  up.pop();lo.pop();return lo.concat(up);}
// A long coat's skirt, or an apron, as a cone of cloth from a ring at the hips to a ring at the hem. A ring: its front and back points
// in profile (F, B) and its half-width across (w); a point of it at angle t round from the front lies at mix(B, F, (1 + cos t)/2) in
// profile and w·sin t across, the hem's sides lifted by lift·sin²t. o.open: [at the top, at the hem], how far either side of the
// front the cloth parts (a coat's opening); o.span instead keeps only [−span, span] round the front (an apron). Returns, as seen in
// the view, the panels the viewer sees from outside (outline, the front edge, the hem), and the inside of the back.
function cone(vw,top,hem,o={}){const N=o.rows||5,H=Math.PI/2,fa=vw.fa;
  const ring=(R,t,lift)=>{const w=(1+Math.cos(t))/2,q=mix(R.B,R.F,w),st=Math.sin(t);return{q:V(q.x,q.y-(lift||0)*st*st),l:R.w*st};};
  const at=(t,v)=>{const A=ring(top,t,0),B=ring(hem,t,hem.lift),q=mix(A.q,B.q,v),l=A.l+(B.l-A.l)*v;let s=vw.at(q,l);
    if(v>.99&&o.gy){const g=o.gy(s.x)-.5;if(s.y>g)s=V(s.x,g);}return s;};
  // the half that faces the viewer at each height: centred on tv
  const tvAt=v=>{const F=mix(top.F,hem.F,v),B=mix(top.B,hem.B,v),D=Math.max(.5,Math.abs(F.x-B.x)/2+.3*Math.abs(F.y-B.y)),w=Math.max(.5,top.w+(hem.w-top.w)*v),nf=Math.sign((F.x-B.x)*fa)||1;
    return Math.atan2(vw.c/w,-nf*vw.s/D);};
  const vs=[];for(let i=0;i<=N;i++)vs.push(i/N);
  const op=v=>o.span!=null?o.span:(o.open[0]+(o.open[1]-o.open[0])*v);
  // a panel: the part of [a(v), b(v)] the viewer sees at each height
  const panel=(a,b)=>{const L=[],R=[];let any=false;
    for(const v of vs){const A=a(v),Bv=b(v),m=(A+Bv)/2,tv=tvAt(v),tp=m+wrap(tv-m);let lo=Math.max(A,tp-H),hi=Math.min(Bv,tp+H);if(lo>hi){const e=Math.abs(wrap(tp-A))<Math.abs(wrap(tp-Bv))?A:Bv;lo=hi=e;}else if(hi-lo>.02)any=true;L.push([lo,v]);R.push([hi,v]);}
    if(!any)return null;
    const pts=[],frontE=[],hemE=[];
    for(const [t,v] of L)pts.push(at(t,v));
    {const [t0]=L[N],[t1]=R[N];for(let j=1;j<6;j++){const p=at(t0+(t1-t0)*j/6,1);pts.push(p);}}
    for(let i=N;i>=0;i--)pts.push(at(R[i][0],R[i][1]));
    {const [t0]=R[0],[t1]=L[0];for(let j=1;j<6;j++)pts.push(at(t0+(t1-t0)*j/6,0));}
    for(let j=0;j<=6;j++){const [t0]=L[N],[t1]=R[N];hemE.push(at(t0+(t1-t0)*j/6,1));}
    return{pts,hem:hemE,L,R};};
  let panels;
  if(o.span!=null)panels=[panel(()=>-o.span,()=>o.span)];
  else panels=[panel(v=>op(v),()=>Math.PI),panel(()=>-Math.PI,v=>-op(v))];
  // the front edges, where they can be seen
  const edges=[];if(o.span==null)for(const sg of [1,-1]){const E=vs.map(v=>{const t=sg*op(v),p=at(t,v),tv=tvAt(v);p.h=Math.abs(wrap(t-tv))>H;return p;});edges.push(E);}
  // the inside of the back: the half that faces away, seen through the opening
  const inner=[];{const tv=tvAt(1),tv0=tvAt(0);for(let j=0;j<=8;j++)inner.push(at(tv+H+Math.PI*j/8,1));for(let j=8;j>=0;j--)inner.push(at(tv0+H+Math.PI*j/8,0));}
  // whether a place on the cloth (t round from the front, v down it) faces the viewer and is not in the opening
  const vis=(t,v)=>Math.abs(wrap(t-tvAt(v)))<H&&(o.span!=null?Math.abs(wrap(t))<=o.span:Math.abs(wrap(t))>=op(v));
  return{panels:panels.filter(Boolean),edges,inner,at,vis,open:op};}
// ---------- a head, turned ----------
// A head seen from any side, in the profile head's own frame (the cranium about 0,0, the face toward +x, y down, about 94 units from
// crown to chin), built from solid parts in three dimensions: f forward, y down, l across (+ toward the viewer at yaw 0). Seen at
// yaw hy a point is drawn at (f·cos + l·sin, y) and lies toward the viewer by −f·sin + l·cos.
// An ellipsoid's outline (centre [f, y], radii [f, y, l]) as seen, n points round it
function ellOutline(cen,r,c,s,n=18){const rx=Math.hypot(r[0]*c,r[2]*s),x0=cen[0]*c,out=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(V(x0+Math.cos(a)*rx,cen[1]+Math.sin(a)*r[1]));}return out;}
// a closed polygon added to a path, always wound the same way round (so the shapes of one path add up where they overlap)
function area(P){let A=0;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];A+=a.x*b.y-b.x*a.y;}return A/2;}
function poly(T,P){if(area(P)<0)P=P.slice().reverse();T.moveTo(P[0].x,P[0].y);for(let i=1;i<P.length;i++)T.lineTo(P[i].x,P[i].y);T.closePath();}
// a point on an ellipsoid: azimuth az round from the front (+ toward the near side), polar from the crown
function ellPt(cen,r,az,po){return[cen[0]+r[0]*Math.sin(po)*Math.cos(az),cen[1]-r[1]*Math.cos(po),r[2]*Math.sin(po)*Math.sin(az)];}
// A patch of an ellipsoid between azimuths az0..az1 and, at each azimuth, polar angles po0..po1(az), as a mesh of quads: the ones
// that face the viewer (front) and the others (back), each as one path, and all its points (for an outline round all of it).
function ellPatch(cen,r,az0,az1,po0,po1,c,s,na=14,np=5){const F=new Path2D(),B=new Path2D(),pts=[],P=(f,y,l)=>V(f*c+l*s,y),Z=(f,l)=>-f*s+l*c;let anyF=false,anyB=false;
  const g=[];for(let i=0;i<=na;i++){const az=az0+(az1-az0)*i/na,a=typeof po0==='function'?po0(az):po0,b=typeof po1==='function'?po1(az):po1,row=[];
    for(let j=0;j<=np;j++){const po=a+(b-a)*j/np,q=ellPt(cen,r,az,po),nf=(q[0]-cen[0])/(r[0]*r[0]),nl=q[2]/(r[2]*r[2]);row.push({p:P(q[0],q[1],q[2]),z:Z(nf,nl)});pts.push(row[j].p);}g.push(row);}
  for(let i=0;i<na;i++)for(let j=0;j<np;j++){const a=g[i][j],b=g[i+1][j],d=g[i+1][j+1],e=g[i][j+1],z=a.z+b.z+d.z+e.z,T=z>0?F:B;if(z>0)anyF=true;else anyB=true;
    poly(T,[a.p,b.p,d.p,e.p]);}
  return{front:anyF?F:null,back:anyB?B:null,pts};}
// a smooth closed path round points (as the looks' smooth outlines)
function loopPath(Q,t=.5){return smoothPath(Q,t);}
// A head's model, from a spec in its own terms:
//  skull: the profile outline (as the looks' skulls: [f, y] from the crown round the back to the chin and up the face) and w, how
//   wide the head is across for its length; the face's middle line is read off the outline, its sides are set out from it
//  ear: {pts: the profile outline of the ear, out: how far its tip stands off the head, flare: how far its back edge is turned out}
//  eye: [f, y, l]
//  hair: {line: [[azimuth, y], ...] the hairline round from the front, puff: the hair's depth over the skull, spikes: [[root], [tip],
//   half-width] (each set at its l and mirrored when l is not 0), bun: {c: [f, y, l], r}, fall: {top, bot, w0, w1, f0, f1} long hair
//   down the back, tail: {pts: [[f, y], ...], w}, strip: the half-width of a crest (the hair only on top), front: a quiff (only the
//   front half)}
//  hat: {top: y of its crown, base: y it comes down to, puff, flare (wider at the top), brim: {len, w, y}, band: [y0, y1], knot}
//  beard: {y0, y1, az: how far round it goes}
function headModel(S){const M={S},sk=S.skull.map(([f,y])=>[f,y]),W=S.w||1;
  // the cranium: the outline's extent above the cheek
  let f0=1e9,f1=-1e9,y0=1e9;for(const [f,y] of sk){if(y<22){f0=Math.min(f0,f);f1=Math.min(Math.max(f1,f),40);}y0=Math.min(y0,y);}
  M.cran=S.cran||{c:[(f0+f1)/2,(y0+20)/2-2],r:[(f1-f0)/2,(20-y0)/2+2,31*W]};
  // the face: its middle line (the front of the outline below the brow) and its sides
  const mid=sk.filter(([f,y])=>f>16&&y>-26),chin=sk.reduce((a,q)=>q[1]>a[1]?q:a,sk[0]),nose=sk.filter(([f,y])=>y>0&&y<34).reduce((a,q)=>q[0]>a[0]?q:a,[0,0]);
  const face=mid.map(([f,y])=>[f,y,0]);
  // (S.facePts: the sides of a face that is not a man's, a goblin's or a lizard's, in place of these)
  for(const [f,y,l] of (S.facePts||[[22,14,27],[-6,34,25],[14,48,17],[chin[0]-3,chin[1]-1,8],[nose[0]-12,12,10],[30,-6,13],[24,-24,15],[0,40,21],[8,-34,18]]))face.push([f,y,l*W],[f,y,-l*W]);
  M.face=face;M.chin=chin;M.nose=nose;
  // the ears: their outline with each point stood off the head by how far it is from the ear's root, the back edge turned out more
  if(S.ear){const E=S.ear.pts,root=S.ear.root||[-4,14],far=E.reduce((a,q)=>Math.max(a,Math.hypot(q[0]-root[0],q[1]-root[1])),1);
    const tipI=E.reduce((bi,q,i)=>Math.hypot(q[0]-root[0],q[1]-root[1])>Math.hypot(E[bi][0]-root[0],E[bi][1]-root[1])?i:bi,0),base=(S.ear.base||28)*W;
    M.ear=E.map(([f,y],i)=>{const d=Math.hypot(f-root[0],y-root[1])/far,back=i>tipI?1:0;return[f,y,base+(S.ear.out||10)*d*d+(S.ear.flare||3)*d*back];});}
  const H=S.hair;
  if(H&&H.line){const P=M.cran,r=[P.r[0]+H.puff,P.r[1]+H.puff,P.r[2]+H.puff],cen=[P.c[0],P.c[1]];
    const yl=az=>{const a=Math.abs(wrap(az)),L=H.line;let i=0;while(i<L.length-2&&L[i+1][0]<a)i++;const A=L[i],B=L[i+1],t=cl((a-A[0])/((B[0]-A[0])||1),0,1);return A[1]+(B[1]-A[1])*t;};
    M.cap={cen,r,po1:az=>Math.acos(cl((cen[1]-yl(az))/r[1],-1,1)),az:H.strip?null:H.front?[-1.35,1.35]:[-Math.PI,Math.PI],strip:H.strip||0};}
  if(H&&H.spikes){M.spikes=[];for(const [R,T,w] of H.spikes){M.spikes.push({R,T,w});if(R[2]||T[2])M.spikes.push({R:[R[0],R[1],-R[2]],T:[T[0],T[1],-T[2]],w});}}
  M.eye=S.eye;return M;}
// Everything of a head seen at yaw hy: the paths far to near and where the eyes are
function headView(M,hy){const c=Math.cos(hy),s=Math.sin(hy),P=q=>V(q[0]*c+q[2]*s,q[1]),Z=q=>-q[0]*s+q[2]*c,S=M.S,out={hairBack:new Path2D(),hairFront:new Path2D(),earsBack:[],earsFront:[],hat:null};
  let hb=false,hf=false;
  // the skull: round the cranium as seen and every point of the face
  const sk=hull([...ellOutline(M.cran.c,M.cran.r,c,s,20),...M.face.map(P)]);out.skull=loopPath(sk,.42);out.skullPts=sk;
  // the ears
  if(M.ear)for(const sd of [1,-1]){const Q=M.ear.map(([f,y,l])=>[f,y,l*sd]),pts=Q.map(P),z=Q.reduce((a,q)=>a+Z(q),0)/Q.length;
    (z<0?out.earsBack:out.earsFront).push({p:loopPath(pts,.48),z,sd,pts});}
  // the hair: all of it round behind, the part that faces the viewer over the skull
  if(M.cap){const C=M.cap;let patch;
    // (a crest: a narrow band over the top from the brow to the nape)
    if(C.strip)patch=ellPatch(C.cen,[C.r[0],C.r[1],C.strip],-Math.PI,Math.PI,0,1.05,c,s,12,3);
    else patch=ellPatch(C.cen,C.r,C.az[0],C.az[1],0,C.po1,c,s,16,4);
    if(patch.pts.length){poly(out.hairBack,hull(patch.pts));hb=true;}
    if(patch.front){out.hairFront.addPath(patch.front);hf=true;}}
  // spikes: a curved blade from a root on the scalp out to a tip, its base across the spike and the scalp
  if(M.spikes){const cen=M.cap?M.cap.cen:[0,-4];
    for(const k of M.spikes){const R=k.R,T=k.T,d=[T[0]-R[0],T[1]-R[1],T[2]-R[2]],rad=[R[0]-cen[0],R[1]-cen[1],R[2]];
      let ax=[d[1]*rad[2]-d[2]*rad[1],d[2]*rad[0]-d[0]*rad[2],d[0]*rad[1]-d[1]*rad[0]];const al=Math.hypot(...ax)||1;ax=ax.map(v=>v/al*k.w);
      const a=P([R[0]+ax[0],R[1]+ax[1],R[2]+ax[2]]),b=P([R[0]-ax[0],R[1]-ax[1],R[2]-ax[2]]),t=P(T),m=P([(R[0]+T[0])/2,(R[1]+T[1])/2,(R[2]+T[2])/2]);
      const z=Z([(R[0]+T[0])/2,0,(R[2]+T[2])/2]),D=z<-6?out.hairBack:out.hairFront;if(z<-6)hb=true;else hf=true;
      // the sides bow out a little toward the tip, as the profile spikes do
      const bow=mul(nrm(perp(sub(t,mix(a,b,.5)))),.13*len(sub(t,a)));let A=a,Bq=b;if(area([a,t,b])<0){A=b;Bq=a;}void m;
      const m1=add(mix(A,t,.5),dot(bow,sub(A,Bq))>0?bow:mul(bow,-1)),m2=add(mix(Bq,t,.5),dot(bow,sub(Bq,A))>0?bow:mul(bow,-1));
      D.moveTo(A.x,A.y);D.quadraticCurveTo(m1.x,m1.y,t.x,t.y);D.quadraticCurveTo(m2.x,m2.y,Bq.x,Bq.y);D.closePath();}}
  // a bun, a fall of long hair, a tail
  if(S.hair&&S.hair.bun){const B=S.hair.bun,z=Z(B.c),D=z<0?out.hairBack:out.hairFront,ctr=P(B.c);D.moveTo(ctr.x+B.r,ctr.y);D.ellipse(ctr.x,ctr.y,B.r,B.r*.9,0,0,TAU);if(z<0)hb=true;else hf=true;}
  // (a fall of long hair: a sheet down the back, widest just below the head, the ends gathering to a rounded point)
  if(S.hair&&S.hair.fall){const F=S.hair.fall,pts=[];for(const sd of [1,-1])for(let i=0;i<=6;i++){const v=i/6,y=F.top+(F.bot-F.top)*v+(v>.99?0:0),ww=F.w0+(F.w1-F.w0)*v,w=ww*(v<.2?.85+.75*v:1-.55*Math.pow((v-.2)/.8,2))*sd,f=F.f0+(F.f1-F.f0)*v;
      pts.push(P([f-Math.abs(w)*.25,y,w]),P([f+4,y,w*.92]));}
    pts.push(P([F.f1,F.bot+F.w1*.35,0]));
    const z=Z([F.f0,0,0]),D=z<0?out.hairBack:out.hairFront;poly(D,hull(pts));if(z<0)hb=true;else hf=true;}
  // (a tail: a rope of hair along a line from the head, as thick seen from any side, thinning to its end)
  if(S.hair&&S.hair.tail){const T=S.hair.tail,C=T.pts.map(([f,y])=>P([f,y,0])),n=C.length,Lf=[],Rt=[];
    for(let i=0;i<n;i++){const a=C[Math.max(0,i-1)],b=C[Math.min(n-1,i+1)],d=nrm(sub(b,a)),q=perp(d),w=T.w*(1-.5*i/(n-1));Lf.push(add(C[i],mul(q,w)));Rt.push(sub(C[i],mul(q,w)));}
    const e=C[n-1],d=nrm(sub(C[n-1],C[n-2]));const z=Z([T.pts[0][0],0,0]),D=z<0?out.hairBack:out.hairFront;poly(D,[...Lf,add(e,mul(d,T.w*.6)),...Rt.reverse()]);if(z<0)hb=true;else hf=true;}
  if(!hb)out.hairBack=null;if(!hf)out.hairFront=null;
  // a hat: its crown round all its points, the brim in front of it or behind, the band round it
  if(S.hat){const Ht=S.hat,cr=M.cran,R=[cr.r[0]+(Ht.puff||3),cr.r[1],cr.r[2]+(Ht.puff||3)],pts=[];
    for(let i=0;i<16;i++){const az=i/16*TAU;for(const [y,k] of [[Ht.base,1],[(Ht.base+Ht.top)/2,1+(Ht.flare||0)*.5],[Ht.top,(Ht.topW||.8)+(Ht.flare||0)],...(Ht.dome?[[Ht.top-Ht.dome,((Ht.topW||.8)+(Ht.flare||0))*.72]]:[])]){
      const cy=Math.min(y,cr.c[1]),po=Math.acos(cl((cr.c[1]-y)/R[1],-1,1)),rr=Math.max(Math.sin(po),Ht.tall?.95:0)*k;pts.push(P([cr.c[0]+R[0]*rr*Math.cos(az),y,R[2]*rr*Math.sin(az)]));void cy;}}
    const hh=hull(pts);out.hat={crown:loopPath(hh,.3)};
    if(Ht.band){const B=new Path2D(),[y0,y1]=Ht.band;let any=false;for(let i=0;i<16;i++){const a0=i/16*TAU,a1=(i+1)/16*TAU;
      const q=(az,y)=>{const po=Math.acos(cl((cr.c[1]-y)/R[1],-1,1)),rr=Math.max(Math.sin(po),Ht.tall?.95:0)*1.02;return[cr.c[0]+R[0]*rr*Math.cos(az),y,R[2]*rr*Math.sin(az)];};
      const A=q(a0,y0),Bq=q(a1,y0),C=q(a1,y1),D=q(a0,y1);if(Z([Math.cos((a0+a1)/2),0,Math.sin((a0+a1)/2)])<=0)continue;any=true;const pa=[A,Bq,C,D].map(P);B.moveTo(pa[0].x,pa[0].y);for(const z of pa.slice(1))B.lineTo(z.x,z.y);B.closePath();}
      if(any)out.hat.band=B;}
    if(Ht.brim){const Bm=Ht.brim,pts2=[];for(let i=0;i<=8;i++){const az=-Bm.w+2*Bm.w*i/8;pts2.push(P([cr.c[0]+R[0]*Math.cos(az)*.95,Bm.y,R[2]*Math.sin(az)*.95]));}
      for(let i=8;i>=0;i--){const az=-Bm.w+2*Bm.w*i/8,e=Math.cos(az*1.1);pts2.push(P([cr.c[0]+(R[0]+Bm.len*e)*Math.cos(az),Bm.y+1.5,(R[2]+Bm.len*e*.6)*Math.sin(az)]));}
      out.hat.brim=pathOf(pts2);out.hat.brimFront=Z([1,0,0])>-.2;}
    if(Ht.knot){const K=Ht.knot,z=Z(K.c),ctr=P(K.c);const Kp=new Path2D();Kp.ellipse(ctr.x,ctr.y,K.r,K.r*.7,0,0,TAU);out.hat.knot=Kp;out.hat.knotFront=z>0;}}
  // a beard: the lower face, as far round as it goes
  if(S.beard){const cen=[6,26],r=[36,34,28*(S.w||1)],BP=new Path2D();let any=false;
    for(const B of [].concat(S.beard)){const patch=ellPatch(cen,r,-B.az,B.az,()=>Math.acos(cl((cen[1]-B.y0)/r[1],-1,1)),()=>Math.acos(cl((cen[1]-B.y1)/r[1],-1,1)),c,s,10,3);if(patch.front){BP.addPath(patch.front);any=true;}}
    out.beard=any?BP:null;}
  // the eyes, and how squarely each faces the viewer
  if(M.eye){const [f,y,l]=M.eye;out.eyes=[1,-1].map(sd=>{const q=[f,y,l*sd],th=Math.atan2(l*sd*.9,Math.max(8,f));return{p:P(q),face:Math.sin(th-hy),sd};});}
  // the line of the mouth and the nose's tip
  out.mouth=[P([M.chin[0]+6,37,-6]),P([M.chin[0]+8,37.5,0]),P([M.chin[0]+6,37,6])];out.noseTip=P([M.nose[0],M.nose[1],0]);out.noseZ=Z([1,0,0]);
  return out;}
return{V,add,sub,mul,len,nrm,perp,mix,dot,cross,cl,ss,curvePts,pathOf,normals,piece,outlined,capsule,tube,light,litOK,folds,CLS,mixHex,inPoly,segDist,
  view,wrap,spinYaw,headYaw,torsoMap,seen,hull,cone,ellOutline,ellPt,ellPatch,loopPath,headModel,headView};
})();
// ===== FIGURE KIT END =====
