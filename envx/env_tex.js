// ===== ENV TEX =====
// Surfaces made pixel by pixel, once, into small canvases that tile: wood with its grain and pores, veined marble, flocked damask,
// woven pile, sooted plaster, aged silvering. Every one is tileable and is used as a pattern or sliced into planks.
const EnvTex=(()=>{const {rng,lerp,clamp,mix}=EnvLook,TAU=Math.PI*2;
// tileable value noise on an N by N lattice, and fractal sums of it
function noise2(seed,N){const r=rng(seed),g=new Float32Array(N*N);for(let i=0;i<N*N;i++)g[i]=r();
  return(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,x0=((xi%N)+N)%N,y0=((yi%N)+N)%N,x1=(x0+1)%N,y1=(y0+1)%N,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
    const a=g[y0*N+x0],b=g[y0*N+x1],c=g[y1*N+x0],d=g[y1*N+x1];return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;};}
function fbm(n,x,y,oct,gain){let s=0,amp=.5,f=1,nm=0;for(let i=0;i<oct;i++){s+=amp*n(x*f,y*f);nm+=amp;amp*=gain||.5;f*=2;}return s/nm;}
const hex=h=>{const n=parseInt(h.slice(1),16);return[n>>16&255,n>>8&255,n&255];};
const lerp3=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
// a canvas w by h filled pixel by pixel: fn(u, v, out) writes r, g, b (and optionally a) into out
function pix(w,h,fn){const cv=document.createElement('canvas');cv.width=w;cv.height=h;const c=cv.getContext('2d'),im=c.createImageData(w,h),d=im.data,o=[0,0,0,255];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){o[3]=255;fn(x/w,y/h,o);const i=(y*w+x)*4;d[i]=o[0];d[i+1]=o[1];d[i+2]=o[2];d[i+3]=o[3];}c.putImageData(im,0,0);return cv;}
const CACHE={};const memo=(k,fn)=>CACHE[k]||(CACHE[k]=fn());
// ---------- wood: the grain runs along x. rings wander with the noise, pores are fine dark dashes along the grain ----------
function wood(seed,w,h,o){o=o||{};return memo('wood'+seed+w+h+JSON.stringify(o),()=>{const n=noise2(seed,32),n2=noise2(seed+7,64),dk=hex(o.dark||'#1a0d07'),md=hex(o.mid||'#3a1f10'),lt=hex(o.light||'#5e3518'),rings=o.rings||9,str=o.stretch||.18;
  return pix(w,h,(u,v,out)=>{const warp=fbm(n,u*4,v*4,4)*2.2,t=(v*rings+warp+fbm(n,u*str*8,v*2,3)*.6)%1,ring=Math.pow(Math.abs(Math.sin(t*Math.PI)),o.sharp||3);
    const pores=fbm(n2,u*2,v*64,2),fine=fbm(n2,u*24,v*96,2);let col=lerp3(md,lt,ring*.85);col=lerp3(col,dk,clamp((pores-.55)*3,0,1)*.6+clamp(.45-fine,0,1)*.5);
    const fig=fbm(n,u*16,v*3,3);col=lerp3(col,lt,clamp(fig-.62,0,1)*.6);out[0]=col[0];out[1]=col[1];out[2]=col[2];});});}
// ---------- herringbone parquet: planks of wood laid at 45 degrees. T world units square, k planks long for one wide, sc px per unit ----------
function herringbone(o){o=o||{};return memo('herring'+JSON.stringify(o),()=>{const T=o.T||128,k=o.k||4,sc=o.sc||4,w=T/(2*k*Math.SQRT2),L=k*w,px=Math.round(T*sc),cv=document.createElement('canvas');cv.width=px;cv.height=px;const c=cv.getContext('2d');
  const wd=wood(o.seed||11,512,128,o.wood||{dark:'#140a05',mid:'#33190c',light:'#5a3018',rings:6}),r0=rng(o.seed||11),tone={};
  const R=(X,Y)=>({x:(X-Y)*w/Math.SQRT2*sc,y:(X+Y)*w/Math.SQRT2*sc});
  const plank=(type,i,j)=>{const key=type+'|'+(((i%2)+2)%2)+'|'+(((j%(2*k))+2*k)%(2*k));if(!tone[key]){const rr=rng(key.length*997+((i%2+2)%2)*131+(((j%(2*k))+2*k)%(2*k))*17+(type==='H'?7:3));tone[key]={sx:rr()*(512-L*sc*.9),sy:rr()*(128-w*sc*.9),k:(rr()-.5)*.28,red:rr()<.2};}
    const t=tone[key];let x0,y0,ang;if(type==='H'){x0=j+2*k*i;y0=j;ang=0;}else{x0=j+2*k*i;y0=j+1;ang=1;}
    const o0=R(x0,y0);c.save();c.translate(o0.x,o0.y);c.rotate(Math.PI/4+(ang?Math.PI/2:0)+(ang?0:0));
    // in the plank's own frame: along +x for L, across +y for w (a V plank runs along the 90 degree frame's y)
    const Lp=L*sc,Wp=w*sc;if(ang){c.scale(1,-1);}
    c.beginPath();c.rect(0,0,Lp,Wp);c.clip();c.drawImage(wd,t.sx,t.sy,Lp*.9,Wp*.9,0,0,Lp,Wp);
    c.fillStyle=t.k>0?`rgba(255,220,180,${t.k*.35})`:`rgba(0,0,0,${-t.k*.8})`;c.fillRect(0,0,Lp,Wp);if(t.red){c.fillStyle='rgba(90,20,10,.12)';c.fillRect(0,0,Lp,Wp);}
    c.fillStyle='rgba(0,0,0,.55)';c.fillRect(0,Wp-.9,Lp,.9);c.fillRect(Lp-.9,0,.9,Wp);c.fillStyle='rgba(255,230,190,.08)';c.fillRect(0,0,Lp,.8);c.restore();};
  const n=Math.ceil(T/w)+2*k+4;for(let j=-n;j<=n;j++)for(let i=-3;i<=3;i++){plank('H',i,j);plank('V',i,j);}
  return cv;});}
// ---------- brick: courses of brick in lime mortar, each brick its own colour, sooted, chipped at the arrises ----------
// one tile is cols bricks by rows courses; bw by bh world units per brick, sc px per unit
function brick(seed,o){o=o||{};return memo('brick'+seed+JSON.stringify(o),()=>{const cols=o.cols||6,rows=o.rows||10,bw=o.bw||10,bh=o.bh||4.2,sc=o.sc||6,W2=Math.round(cols*bw*sc),H2=Math.round(rows*bh*sc);
  const n=noise2(seed,64),n2=noise2(seed+5,16),r=rng(seed),tones=[],base=hex(o.base||'#3a2420'),alt=hex(o.alt||'#2a1816'),hot=hex(o.hot||'#4a2a20'),mort=hex(o.mortar||'#2a2622');
  for(let j=0;j<rows;j++)for(let i=0;i<=cols;i++){const v=r();tones.push({c:v<.5?lerp3(base,alt,r()):v<.85?lerp3(base,hot,r()*.8):lerp3(alt,[16,10,10],r()*.6),soot:r()});}
  const mw=o.mw||.55;
  return pix(W2,H2,(u,v,out)=>{const X=u*cols*bw,Y=v*rows*bh,row=Math.floor(Y/bh),off=(row%2)*bw/2,Xs=X+off,col=Math.floor(Xs/bw),bx=Xs-col*bw,by=Y-row*bh;
    const ci=((col%cols)+cols)%cols,t=tones[row*(cols+1)+ci];const inM=bx<mw||by<mw;
    if(inM){const k=.75+fbm(n,u*30,v*30,2)*.4;out[0]=mort[0]*k;out[1]=mort[1]*k;out[2]=mort[2]*k;return;}
    // the brick face: noise, a darker skin at its edges, the mortar's shadow under the course above
    const e=Math.min(bx-mw,bw-bx,by-mw,bh-by),edge=clamp(e/.8,0,1),nn=fbm(n,u*cols*6,v*rows*3,3),sp=fbm(n2,u*cols*20,v*rows*12,2);
    let k=(.72+nn*.5)*(.82+.18*edge)*(by<mw+.5?.8:1);let cc=t.c;cc=lerp3(cc,[10,8,8],clamp(t.soot-.7,0,1)*1.2+clamp(.3-v,0,1)*.0);
    if(sp>.72)k*=.75;out[0]=cc[0]*k;out[1]=cc[1]*k;out[2]=cc[2]*k;});});}
// ---------- setts: granite setts in floor units (x along the road, d into it). Uneven lengths, rounded arrises, ragged sand joints,
// a glint of mica in the grain, the far edge of each catching the lamps. Every noise runs at a whole number of cycles so the tile repeats clean ----------
function setts(seed,o){o=o||{};return memo('setts'+seed+JSON.stringify(o),()=>{const L=o.L||12,D=o.D||6,cols=o.cols||8,rows=o.rows||6,sc=o.sc||6,TW=cols*L,W2=Math.round(TW*sc),H2=Math.round(rows*D*sc);
  const n=noise2(seed,16),nj=noise2(seed+3,64),ng=noise2(seed+13,128),r=rng(seed),R=[];
  for(let j=0;j<rows;j++){const ws=[];let s=0;for(let i=0;i<cols;i++){const w=.7+r()*.6;ws.push(w);s+=w;}const cuts=[0];let a=0;for(let i=0;i<cols;i++){a+=ws[i]/s*TW;cuts.push(a);}
    const t=[];for(let i=0;i<cols;i++)t.push({t:r(),u:Math.floor(r()*16),v:Math.floor(r()*16),dark:r()<.12});R.push({off:r()*TW,cuts,t});}
  const c0=hex(o.c0||'#24202a'),c1=hex(o.c1||'#3a343c'),jc=hex(o.joint||'#0c0a0e');
  return pix(W2,H2,(u,v,out)=>{const X=u*TW,Y=v*rows*D,row=Math.min(rows-1,Math.floor(Y/D)),RR=R[row],xs=(X+RR.off)%TW;let ci=0;while(ci<cols-1&&xs>=RR.cuts[ci+1])ci++;
    const L2=RR.cuts[ci+1]-RR.cuts[ci],bx=xs-RR.cuts[ci],by=Y-row*D,t=RR.t[ci],ex=Math.min(bx,L2-bx),ey=Math.min(by,D-by),rr=1.3;
    const e=ex<rr&&ey<rr?rr-Math.hypot(rr-ex,rr-ey):Math.min(ex,ey),rag=fbm(nj,u*64,v*64,2)*.5;
    if(e<.3+rag){const k=.7+fbm(nj,u*128,v*128,2)*.6;out[0]=jc[0]*k;out[1]=jc[1]*k;out[2]=jc[2]*k;return;}
    const dome=clamp((e-.3-rag)/1.6,0,1),nn=fbm(n,u*16+t.u,v*16+t.v,4),g=ng(u*128,v*128);
    let cc=lerp3(c0,c1,clamp(t.t*.65+nn*.45,0,1));if(t.dark)cc=lerp3(cc,[20,16,20],.45);
    let k=(.55+.45*Math.sqrt(dome))*(.84+nn*.32)*(.9+g*.2);if(g>.86)k*=1.25;
    k*=1+clamp(((o.farX?bx/L2:by/D)-.5)/.5,0,1)*Math.sqrt(dome)*.22;
    out[0]=Math.min(255,cc[0]*k);out[1]=Math.min(255,cc[1]*k);out[2]=Math.min(255,cc[2]*k);});});}
// ---------- flagstones: big slabs, each its own length, soft old stains, a crack here and there, moss in some joints ----------
function flagstones(seed,o){o=o||{};return memo('flags'+seed+JSON.stringify(o),()=>{const L=o.L||34,D=o.D||16,cols=o.cols||4,rows=o.rows||4,sc=o.sc||5,TW=cols*L,W2=Math.round(TW*sc),H2=Math.round(rows*D*sc);
  const n=noise2(seed,16),n2=noise2(seed+9,32),ng=noise2(seed+4,128),r=rng(seed),R=[];
  for(let j=0;j<rows;j++){const ws=[];let s=0;for(let i=0;i<cols;i++){const w=.75+r()*.5;ws.push(w);s+=w;}const cuts=[0];let a=0;for(let i=0;i<cols;i++){a+=ws[i]/s*TW;cuts.push(a);}
    const t=[];for(let i=0;i<cols;i++)t.push({t:r(),u:Math.floor(r()*16),v:Math.floor(r()*16),crack:r()<.35?{a:.3+r()*2.5,p:.25+r()*.5,q:.2+r()*.6}:null});R.push({off:r()*TW,cuts,t});}
  const c0=hex(o.c0||'#2e2830'),c1=hex(o.c1||'#443a3e'),moss=hex(o.moss||'#1c2418'),jc=hex(o.joint||'#0d0b0e');
  return pix(W2,H2,(u,v,out)=>{const X=u*TW,Y=v*rows*D,row=Math.min(rows-1,Math.floor(Y/D)),RR=R[row],xs=(X+RR.off)%TW;let ci=0;while(ci<cols-1&&xs>=RR.cuts[ci+1])ci++;
    const L2=RR.cuts[ci+1]-RR.cuts[ci],bx=xs-RR.cuts[ci],by=Y-row*D,t=RR.t[ci],rag=fbm(n2,u*32,v*32,2)*.35,e=Math.min(bx,L2-bx,by,D-by);
    if(e<.35+rag){const m=fbm(n2,u*64,v*64,2),cc=m>.55?lerp3(jc,moss,clamp((m-.55)*4,0,1)):jc;out[0]=cc[0];out[1]=cc[1];out[2]=cc[2];return;}
    const nn=fbm(n,u*16+t.u,v*16+t.v,5,.55),st=fbm(n2,u*32+t.v,v*32+t.u,3),g=ng(u*128,v*128);
    let cc=lerp3(c0,c1,clamp(t.t*.55+nn*.5,0,1));if(st>.6)cc=lerp3(cc,[22,18,22],clamp((st-.6)*1.6,0,.45));
    let k=(.9+.1*clamp((e-.35)/1.5,0,1))*(.95+g*.1);if(e<1.2&&by>D-1.6)k*=1.12;
    if(t.crack){const cx=L2*t.crack.p,cy=D*t.crack.q,dd=Math.abs((bx-cx)*Math.sin(t.crack.a)-(by-cy)*Math.cos(t.crack.a))+(fbm(n2,u*64,v*64,2)-.5)*.5;if(dd<.16&&Math.hypot(bx-cx,by-cy)<L2*.45)k*=.45;}
    out[0]=cc[0]*k;out[1]=cc[1]*k;out[2]=cc[2]*k;});});}
// ---------- glazed subway tiles: cream gone amber, a pillowed glaze that darkens to the edge, fine crazing on some, chipped corners,
// grey grout. tw x th units a tile, laid in a running bond ----------
function subwayTiles(seed,o){o=o||{};return memo('subway'+seed+JSON.stringify(o),()=>{const tw=o.tw||12,th=o.th||6,cols=o.cols||8,rows=o.rows||8,sc=o.sc||6,gw=o.gw||.32,TW=cols*tw,TH=rows*th,W2=Math.round(TW*sc),H2=Math.round(TH*sc);
  const n=noise2(seed,16),nc=noise2(seed+5,64),r=rng(seed),T=[];
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++)T.push({t:r(),craze:r()<(o.craze==null?.3:o.craze),chip:r()<.07?{x:r()<.5?0:1,y:r()<.5?0:1}:null,dirt:r(),ph:r()*7});
  const c0=hex(o.c0||'#dcd2ba'),c1=hex(o.c1||'#c8b48c'),gr=hex(o.grout||'#9a9284'),bis=hex(o.biscuit||'#a88a6a');
  return pix(W2,H2,(u,v,out)=>{const X=u*TW,Y=v*TH,row=Math.min(rows-1,Math.floor(Y/th)),off=(row%2)*tw/2,xs=((X+off)%TW+TW)%TW,col=Math.min(cols-1,Math.floor(xs/tw)),bx=xs-col*tw,by=Y-row*th,t=T[row*cols+col];
    const ex=Math.min(bx,tw-bx),ey=Math.min(by,th-by),e=Math.min(ex,ey);
    if(e<gw){const k=.8+fbm(nc,u*64,v*64,2)*.4;out[0]=gr[0]*k;out[1]=gr[1]*k;out[2]=gr[2]*k;return;}
    if(t.chip){const cx=t.chip.x?tw:0,cy=t.chip.y?th:0;if(Math.hypot(bx-cx,by-cy)<1.1){out[0]=bis[0];out[1]=bis[1];out[2]=bis[2];return;}}
    let cc=lerp3(c0,c1,clamp(t.t*.25+fbm(n,u*16,v*16,3)*.35,0,1));
    const pill=clamp((e-gw)/1.1,0,1);let k=.7+.3*Math.sqrt(pill);
    if(by-gw<1&&ex>gw+.6)k*=1.1;if(th-by-gw<.9)k*=.84;
    {const gy=(by-gw)/(th-2*gw);k*=1+.16*Math.exp(-Math.pow((gy-.3)/.12,2))*clamp((ex-gw)/2,0,1);}
    if(t.craze&&Math.abs(fbm(nc,u*64+t.ph,v*64,3)-.5)<.008)k*=.8;
    cc=lerp3(cc,[90,70,40],t.dirt*.12);
    out[0]=Math.min(255,cc[0]*k);out[1]=Math.min(255,cc[1]*k);out[2]=Math.min(255,cc[2]*k);});});}
// ---------- quarry tiles: square terracotta, fired darker at the edges, worn paler in the middle, grease blooms, dark grout. L units square ----------
function quarryTiles(seed,o){o=o||{};return memo('quarry'+seed+JSON.stringify(o),()=>{const L=o.L||16,cols=o.cols||6,rows=o.rows||6,sc=o.sc||6,gw=o.gw||.6,TW=cols*L,TH=rows*L,W2=Math.round(TW*sc),H2=Math.round(TH*sc);
  const n=noise2(seed,16),n2=noise2(seed+3,64),n3=noise2(seed+7,32),r=rng(seed),T=[];for(let i=0;i<cols*rows;i++)T.push({t:r(),pale:r()<.18,u:Math.floor(r()*16),v:Math.floor(r()*16)});
  const c0=hex(o.c0||'#5a2a1a'),c1=hex(o.c1||'#7a3a22'),pale=hex(o.pale||'#9a6a4a'),gr=hex(o.grout||'#2a2622');
  return pix(W2,H2,(u,v,out)=>{const X=u*TW,Y=v*TH,ci=Math.min(cols-1,Math.floor(X/L)),ri=Math.min(rows-1,Math.floor(Y/L)),bx=X-ci*L,by=Y-ri*L,t=T[ri*cols+ci];
    const e=Math.min(bx,L-bx,by,L-by),rag=fbm(n2,u*64,v*64,2)*.3;
    if(e<gw+rag){const k=.75+fbm(n2,u*128,v*128,2)*.4;out[0]=gr[0]*k;out[1]=gr[1]*k;out[2]=gr[2]*k;return;}
    const nn=fbm(n,u*16+t.u,v*16+t.v,4);let cc=lerp3(c0,c1,clamp(t.t*.6+nn*.5,0,1));if(t.pale)cc=lerp3(cc,pale,.35+nn*.2);
    const k=(.8+.2*clamp((e-gw)/2.4,0,1))*(.92+fbm(n2,u*64,v*64,3)*.16);
    const st=fbm(n3,u*32+3,v*32+7,3);if(st>.62)cc=lerp3(cc,[30,16,10],clamp((st-.62)*2,0,.5));
    out[0]=cc[0]*k;out[1]=cc[1]*k;out[2]=cc[2]*k;});});}
// ---------- copper sheet, planished: hammer dimples catching the light from the upper left, a brushed grain, verdigris where it stays damp ----------
function copper(seed,w,h,o){o=o||{};return memo('copper'+seed+w+h+JSON.stringify(o),()=>{const n=noise2(seed,16),n2=noise2(seed+2,64),r=rng(seed),base=hex(o.base||'#b8763e'),hi=hex(o.hi||'#f0b27a'),lo=hex(o.lo||'#5a2e14'),vg=hex(o.verd||'#4a8a76');
  const D=o.dimple||26,nx=Math.max(1,Math.round(w/D)),ny=Math.max(1,Math.round(h/D)),pts=[];for(let j=0;j<ny;j++)for(let i=0;i<nx;i++)pts.push({x:(i+.5+(r()-.5)*.7)/nx,y:(j+.5+(r()-.5)*.7)/ny,rr:(.38+r()*.22)/nx});
  return pix(w,h,(u,v,out)=>{let best=9,bdx=0,bdy=0;const gi=Math.floor(u*nx),gj=Math.floor(v*ny);
    for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const ii=((gi+di)%nx+nx)%nx,jj=((gj+dj)%ny+ny)%ny,p=pts[jj*nx+ii];let dx=u-p.x,dy=v-p.y;if(dx>.5)dx-=1;if(dx<-.5)dx+=1;if(dy>.5)dy-=1;if(dy<-.5)dy+=1;const d=Math.hypot(dx,dy*h/w)/p.rr;if(d<best){best=d;bdx=dx;bdy=dy;}}
    let shade=0;if(best<1){const s=Math.sqrt(1-best*best);shade=(-bdx-bdy)/(Math.hypot(bdx,bdy)+1e-6)*(1-s)*(o.amp||.16);}
    const br=fbm(n2,u*64,v*64,2);let t=clamp(.45+shade+(br-.5)*.22+(fbm(n,u*16,v*16,3)-.5)*.3,0,1);
    let cc=t<.5?lerp3(lo,base,t*2):lerp3(base,hi,(t-.5)*2);
    const vv=fbm(n,u*16+5,v*16+9,4);if(vv>.7)cc=lerp3(cc,vg,clamp((vv-.7)*3,0,.6));
    out[0]=cc[0];out[1]=cc[1];out[2]=cc[2];});});}
// ---------- cast iron: a sand-cast grain, a little rust bloom, blacked with oil ----------
function castIron(seed,w,h,o){o=o||{};return memo('iron'+seed+w+h+(o.base||''),()=>{const n=noise2(seed,64),n2=noise2(seed+1,16),b=hex(o.base||'#1c1d22');
  return pix(w,h,(u,v,out)=>{const g=fbm(n,u*64,v*64,2),m=fbm(n2,u*16,v*16,3);const k=.78+g*.34+(m-.5)*.25;let cc=b;if(m>.68)cc=lerp3(b,[64,36,22],clamp((m-.68)*2.2,0,.6));out[0]=cc[0]*k;out[1]=cc[1]*k;out[2]=cc[2]*k;});});}
// ---------- awning cloth: woven cotton duck in two reds, the stripes running down the slope ----------
function awningCloth(seed,o){o=o||{};return memo('awn'+seed+JSON.stringify(o),()=>{const w=o.w||128,h=o.h||64,a=hex(o.a||'#6a141c'),b=hex(o.b||'#45101a'),st=o.stripe||16;
  return weave(w,h,(u)=>Math.floor(u*w/st)%2?b:a,seed);});}
// ---------- granite: grey speckled stone for kerbs, sills and steps ----------
function granite(seed,w,h,o){o=o||{};return memo('granite'+seed+w+h+(o.base||''),()=>{const n=noise2(seed,32),n2=noise2(seed+1,128),b=hex(o.base||'#3a3438');return pix(w,h,(u,v,out)=>{const t=fbm(n,u*4,v*4,4),sp=n2(u*128,v*128);let k=.85+t*.3;if(sp>.78)k*=1.4;else if(sp<.2)k*=.6;out[0]=b[0]*k;out[1]=b[1]*k;out[2]=b[2]*k;});});}
// ---------- marble: pale stone, soft clouds, a few sharp grey veins ----------
function marble(seed,w,h,o){o=o||{};return memo('marble'+seed+w+h,()=>{const n=noise2(seed,16),n2=noise2(seed+3,32),base=hex(o.base||'#ebe4d8'),cloud=hex(o.cloud||'#d2c8b8'),vein=hex(o.vein||'#6e645c');
  return pix(w,h,(u,v,out)=>{const t=fbm(n,u*2,v*2,5,.55),turb=Math.abs(fbm(n2,u*4,v*4,4)-.5)*2;
    const a=Math.abs(Math.sin(((u+v*.6)*2+t*.9+turb*.45)*Math.PI)),b=Math.abs(Math.sin(((u*.7-v)*3+t*1.1+turb*.3)*Math.PI));
    let col=lerp3(base,cloud,clamp((t-.42)*2.2,0,1));col=lerp3(col,vein,Math.pow(1-a,26)*.8+Math.pow(1-b,70)*.45);
    const sp=fbm(n2,u*40,v*40,2);col=lerp3(col,[255,255,255],clamp(sp-.7,0,1)*.4);out[0]=col[0];out[1]=col[1];out[2]=col[2];});});}
// ---------- flocked damask: the motif raised in velvet over a woven ground, gold thread at its heart ----------
function damask(o){o=o||{};return memo('damask'+JSON.stringify(o),()=>{const W2=o.w||144,H2=o.h||208,cv=document.createElement('canvas');cv.width=W2;cv.height=H2;const c=cv.getContext('2d');
  // the woven ground: fine vertical and horizontal threads
  const ground=pix(W2,H2,(()=>{const n=noise2(3,64),gr=hex(o.ground||'#2a0a10');return(u,v,out)=>{const th=.5+.5*Math.sin(u*W2*Math.PI*.9),tw=.5+.5*Math.sin(v*H2*Math.PI*.7),nn=fbm(n,u*8,v*8,3);
    const k=.86+th*.08+tw*.05+(nn-.5)*.16;out[0]=gr[0]*k;out[1]=gr[1]*k;out[2]=gr[2]*k;};})());c.drawImage(ground,0,0);
  // the motif, drawn as a path: a lyre of leaves round a pomegranate, mirrored, repeated on a half-drop
  const motif=(path,cx,cy,s)=>{c.save();c.translate(cx,cy);c.scale(s,s);path();c.restore();};
  const shape=()=>{c.beginPath();
    // the pomegranate
    c.moveTo(0,-30);c.bezierCurveTo(12,-22,14,-6,0,6);c.bezierCurveTo(-14,-6,-12,-22,0,-30);
    // the leaves that hold it, either side, curling out and down
    for(const s of [-1,1]){c.moveTo(0,4);c.bezierCurveTo(s*10,12,s*26,8,s*28,-6);c.bezierCurveTo(s*30,-18,s*20,-26,s*14,-20);c.bezierCurveTo(s*22,-14,s*20,-2,s*12,0);c.bezierCurveTo(s*8,2,s*4,3,0,4);
      c.moveTo(s*3,10);c.bezierCurveTo(s*12,24,s*28,30,s*34,22);c.bezierCurveTo(s*30,30,s*14,32,s*4,20);
      c.moveTo(s*2,-30);c.bezierCurveTo(s*6,-40,s*16,-44,s*20,-38);c.bezierCurveTo(s*14,-40,s*8,-36,s*4,-28);}
    c.moveTo(-3,22);c.lineTo(0,40);c.lineTo(3,22);c.closePath();};
  const place=(fn)=>{for(const [x,y] of [[W2/2,H2*.32],[0,H2*.82],[W2,H2*.82],[0,-H2*.18],[W2,-H2*.18],[W2/2,H2*1.32]])fn(x,y);};
  const sc=W2/72;
  // shadow below and to the right, light above and to the left: the pile stands up off the ground
  place((x,y)=>motif(()=>{shape();c.fillStyle='rgba(0,0,0,.55)';c.fill();},x+sc*.9,y+sc*1.1,sc));
  place((x,y)=>motif(()=>{shape();c.fillStyle='rgba(255,170,150,.22)';c.fill();},x-sc*.6,y-sc*.7,sc));
  place((x,y)=>motif(()=>{shape();c.fillStyle=o.pile||'#4a1420';c.fill();},x,y,sc));
  // velvet sheen inside the pile, and the gold thread round the pomegranate
  const pile=pix(W2,H2,(()=>{const n=noise2(9,32);return(u,v,out)=>{const k=fbm(n,u*6,v*6,3);out[0]=255;out[1]=200;out[2]=190;out[3]=Math.max(0,(k-.48))*120;};})());
  c.save();place((x,y)=>motif(()=>{shape();},x,y,sc));c.clip();c.globalCompositeOperation='lighter';c.drawImage(pile,0,0);c.restore();
  place((x,y)=>{c.save();c.translate(x,y);c.scale(sc,sc);c.beginPath();c.moveTo(0,-30);c.bezierCurveTo(12,-22,14,-6,0,6);c.bezierCurveTo(-14,-6,-12,-22,0,-30);c.strokeStyle='rgba(200,150,70,.55)';c.lineWidth=.7;c.stroke();
    c.fillStyle='rgba(220,170,80,.5)';for(let k=0;k<5;k++){c.beginPath();c.arc(0,-24+k*6,.9,0,TAU);c.fill();}c.restore();});
  // small sprigs between the motifs
  for(const [x,y] of [[0,H2*.32],[W2,H2*.32],[W2/2,H2*.82],[W2/2,-H2*.18]]){c.save();c.translate(x,y);c.scale(sc,sc);c.fillStyle='rgba(0,0,0,.45)';c.beginPath();c.arc(.6,.8,5,0,TAU);c.fill();c.fillStyle=o.pile||'#4a1420';c.beginPath();for(let k=0;k<4;k++){const a=k*Math.PI/2;c.ellipse(Math.cos(a)*4,Math.sin(a)*4,4,1.8,a,0,TAU);}c.fill();c.restore();}
  return cv;});}
// ---------- woven pile for a rug: knots in rows, the colour given by a pattern function, worn where it is walked on ----------
// a rug woven from weave, made once under its own name
function rug(key,w,h,colorAt,seed){return memo('rug'+key+w+h,()=>weave(w,h,colorAt,seed));}
function weave(w,h,colorAt,seed){return pix(w,h,(()=>{const n=noise2(seed||5,64);return(u,v,out)=>{const col=colorAt(u,v),kx=.5+.5*Math.sin(u*w*Math.PI*.8),ky=.5+.5*Math.sin(v*h*Math.PI*.8),nn=fbm(n,u*12,v*12,3);
  const k=.8+kx*.12+ky*.1+(nn-.5)*.22;out[0]=Math.min(255,col[0]*k);out[1]=Math.min(255,col[1]*k);out[2]=Math.min(255,col[2]*k);};})());}
// ---------- plaster: mottled, a little cracked, soot settling down from the top ----------
function plaster(seed,w,h,o){o=o||{};return memo('plaster'+seed+w+h+(o.base||''),()=>{const n=noise2(seed,32),b=hex(o.base||'#2a2018');return pix(w,h,(u,v,out)=>{const t=fbm(n,u*4,v*4,5,.6),k=.8+t*.4;out[0]=b[0]*k;out[1]=b[1]*k;out[2]=b[2]*k;});});}
// ---------- old silvering: a mirror going dark at its edges and spotted with age ----------
function silver(seed,w,h){return memo('silver'+seed+w+h,()=>{const n=noise2(seed,32),r=rng(seed);const cv=pix(w,h,(u,v,out)=>{const t=fbm(n,u*5,v*5,4),edge=Math.min(u,1-u,v,1-v),k=clamp(edge*6,0,1);
  const base=lerp3([24,18,16],[64,52,44],t*k);out[0]=base[0];out[1]=base[1];out[2]=base[2];});const c=cv.getContext('2d');
  for(let i=0;i<120;i++){const x=r()*w,y=r()*h,rr=.5+r()*2.2;c.fillStyle=`rgba(${r()<.5?'20,14,10':'90,80,60'},${.2+r()*.4})`;c.beginPath();c.arc(x,y,rr,0,TAU);c.fill();}return cv;});}
function pattern(c,cv,scale){const p=c.createPattern(cv,'repeat');if(p.setTransform)p.setTransform(new DOMMatrix().scale(scale));return p;}
return{noise2,fbm,pix,hex,lerp3,wood,marble,damask,weave,rug,plaster,silver,herringbone,brick,setts,flagstones,granite,awningCloth,subwayTiles,quarryTiles,copper,castIron,pattern};
})();
// ===== ENV TEX END =====
