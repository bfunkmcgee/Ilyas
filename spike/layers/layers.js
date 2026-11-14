// ===== LAYERS TEST: THE PICTURE HANDED TO PHASER IN LAYERS =====
// A test, not part of the game (README.md). It goes into a copy of the built page after the game's script and the Phaser host
// (build_layers.py) and changes only where the picture is painted and how it is put together: the game's clock, its rules and
// every number it keeps are left as they are.
//
// The game paints one picture, and Phaser shows it. Here the same painters, in the same order, paint it onto three sheets:
//   - the plate: the place itself and everything laid on its floor (the scene's layer, its moving parts, the light and the shadows
//     on the ground): all that render() paints before it comes to what stands on the floor;
//   - the stage: everyone and everything that stands on the floor, far to near (the figures and the place's pieces);
//   - the top: what goes over them (the air in front, the sparks, the dark at the edges, the words, the bars, the labels). This is
//     the game's own canvas, so whatever is drawn outside render() lands on it as it always did.
// The game's painters all draw through one variable, ctx, and the game itself points it at another canvas when it draws a fighter
// into his sprite (sk_lightui.js). The sheets are changed the same way, at two places in render(): where it gathers what stands on
// the floor (envItems), and at the first thing it draws once they are down (FXL.front, FXL.grade or drawFx).
// Phaser then shows the three sheets one over the other, and between them what a flat picture has no room for:
//   - focus: two more copies of the plate, one a little blurred and one a good deal, laid over the first through masks that follow
//     depth: nothing at the depth he stands at, more the further a row of the floor lies from it, and more again up the far wall
//     to what rises beyond it. The copies are a half and a quarter the size, so the blurring costs little;
//   - dust: motes in the air behind the stage and in front of it, and a puff where a foot comes down on the yard's dirt;
//   - the finish's bloom, worked out from the sheets as the game works it out from its one picture, and laid over them as it is;
//   - parallax, in the yard: the Pit's far side, and the shacks round the yard with the lane beyond its fence, each on a sheet of
//     its own under the plate. As the camera goes along the yard they slide slower than it does, and as it pushes in they grow
//     less than it does (PARALLAX, below).
//   - the lamps, in the yard: the place's lamps as Phaser's own lights on the plate and on the stage, each sheet with a second one
//     that says which way its surfaces face (the ground and the walls as the place's painter gives them, each piece by its outline).
// Where the sheets cannot be used (Phaser's view off, a place that finishes its own picture, a screen changing size) the frame is
// painted flat, as published, and LayerTest.why says which.
(function(){
'use strict';
if(typeof Phaser==='undefined'||typeof cv==='undefined'||typeof PHOST==='undefined'||!PHOST.game||typeof FXL==='undefined'||typeof envKey!=='function')return;
const LY=window.LayerTest={
  on:true,focus:true,focusK:1,dust:true,parallax:true,
  // focus. Depths are the game's own (units into the picture). Within f0 of where he stands nothing is soft; f1 further it is fMax
  // soft. What stands at the far edge of the floor is one wall: as soft as the floor at its foot, and fRoom more by its top (fTop
  // units up, where the place does not say: BEYOND, below). fEase: the seconds the focus takes to follow him to another depth. The
  // two blurs' reach, in points of the screen; fMid: the softness at which the light one is all there and the heavy one begins.
  // focusK (above) is how much of all this softness is laid on: 1 for all of it.
  f0:30,f1:340,fMax:.9,fTop:260,fRoom:.2,fEase:.5,blur1:1.2,blur2:3.6,fMid:.45,
  // the far bands' softness where they are on sheets of their own, in points of the screen (at focusK 1: the far side less soft
  // than the heavy blur makes it on the plate, so that its rows of shacks can still be seen to slide); slide, push: how much
  // of their sliding and of their growing less is shown (1: all of it; both 0: the bands apart but standing as they were painted,
  // for checking them against the whole picture); ext: the middle band's row painted on behind the yard (off for that check)
  blurFar:2.4,blurMid:1.3,slide:1,push:1,ext:true,
  // dust: how many motes behind the stage and in front of it, how bright they are and how thick a footfall's puff is (0: none)
  motesBack:40,motesFront:9,moteA:1,puffA:1,dustAll:false,
  // lamps: the place's lamps as Phaser's own lights on the sheets (lampK: how much of their strength; lampsN: how many the last
  // frame had)
  lamps:true,lampK:1,lampsN:0,lampErr:null,
  // lampGround: the plate takes the lamps too (the place is then painted without its own lamplight, and a map of which way each
  // of its surfaces faces goes with the plate). plateUnlit: the last frame's plate was painted so
  lampGround:true,plateUnlit:false,
  // shape: the place's pieces (a barrel, the pump, a cart) take the lamps by their shape: each gets a map of which way its surface
  // faces, worked out once from its outline, and the stage carries those maps (shapeQ: that sheet's size as a part of the
  // canvas's; shapeK: how far a piece's edges turn away; shapeN: pieces so laid in the last frame; shapeMs: what the maps took)
  shape:true,shapeQ:.5,shapeK:1.6,shapeN:0,shapeMs:0,
  // read by the page: whether the last frame went onto the sheets, why not if not, frames so painted, what render() took (ms)
  live:false,why:'',n:0,ms:0,focusAt:92,err:null};
const cl=(x,a,b)=>x<a?a:x>b?b:x;
// the light module's own hash: what looks random here comes from a mote's or a puff's number, never from the game's dice
const hs=n=>{n=(n|0)^0x5bd1e995;n=Math.imul(n^(n>>>15),0x2c1b3c6d);n=Math.imul(n^(n>>>12),0x297a2d39);n^=n>>>15;return(n>>>0)/4294967296;};

// ---------- the sheets ----------
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w||2;c.height=h||2;return{cv:c,g:c.getContext('2d')};};
// MAIN: the game's canvas (the top). A: the plate. B: the stage. BL, BM: the bloom's light at an eighth the size, and that light at
// the finish's strength. SH, SQ: the plate at a half and at a quarter the size, for the two blurs. M1, M2: their masks, a column of
// 255 rows each (not a power of two: Phaser would wrap its ends round).
const MAIN=cv.getContext('2d'),A=mk(),B=mk(),BL=mk(),BM=mk(),SH=mk(),SQ=mk(),M1=mk(3,255),M2=mk(3,255);
// NA: which way the plate's surfaces face, this frame (a quarter the size: it is all flat fields). NL: the same for the place's
// whole still picture, painted once for an hour by the place's painter
const NA=mk();let NL=null;
// NB: which way the stage's things face, this frame: UPC everywhere (standing, leaning a little up, so that a lamp overhead lights a
// man about as it lights the ground he is on), and each piece's own map where the piece was set down. LAMPS: this frame's lamps
const NB=mk(),NMQ=[],UPT=.45,UPC='rgb(127,180,243)';let nbUsed=false,nbNew=true,shapeOn=false,LAMPS=null;
// what one context hands the next, so that the three behave as the one the painters think they have
const KEEP=['globalAlpha','globalCompositeOperation','fillStyle','strokeStyle','lineWidth','lineCap','lineJoin','miterLimit','lineDashOffset','font','textAlign','textBaseline',
  'imageSmoothingEnabled','shadowBlur','shadowColor','shadowOffsetX','shadowOffsetY'];
function carry(a,b){b.setTransform(a.getTransform());for(const k of KEEP){const v=a[k];if(b[k]!==v)b[k]=v;}
  const d=a.getLineDash();if(d.length||b.getLineDash().length)b.setLineDash(d);}
function wipe(L){const g=L.g||L,c=g.canvas;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,c.width,c.height);}

// phase: -1 outside a frame on the sheets, 0 the plate, 1 the stage, 2 the top. TR: the frame's world-to-canvas transform, read off
// the plate's context where the stage begins (the camera's place, its scale and its shake, as render() set them).
let phase=-1,G=null,TR={s:1,tx:0,ty:0,planes:false},tPrev=null,maskKey='',maskNew=false,lightOn=false,DPR=1;
function finishOf(){const k=envKey(),X=k&&EnvLook.S[k];if(!X)return null;if(X.post)return'post';
  return X.finish?(typeof X.finish==='function'?X.finish():X.finish):SCENE_FINISH[SCENE_WORLD[k]]||null;}
function why(){
  if(!LY.on)return'off';
  if(LY.err)return'stopped: '+LY.err;
  if(PHOST.err||!(PHOST.mode>0))return'Phaser view off';
  if(ctx!==MAIN)return'drawn elsewhere';
  if(!cv.width||!cv.height)return'no canvas';
  const k=envKey();if(!k)return'no scene here';
  const o=finishOf();if(o==='post')return'this place finishes its own picture';if(o&&o.streak>0)return'this place streaks its light';
  return'';}
const _render=render;
render=function(){
  if(phase>=0)return _render.apply(this,arguments);
  const t0=performance.now(),w=why();LY.why=w;
  const lay=!w&&!!G&&G.w===cv.width&&G.h===cv.height;
  LAMPS=lay?lampsNow():null;bandsFrame(lay);
  if(!lay){
    if(!w){LY.need=true;LY.why='making the sheets';}LY.live=false;
    try{return _render.apply(this,arguments);}finally{LY.ms+=(performance.now()-t0-LY.ms)*.05;}}
  phase=0;wipe(A);carry(MAIN,A.g);ctx=A.g;
  try{return _render.apply(this,arguments);}
  finally{LY.live=phase===2;ctx=MAIN;phase=-1;farT=null;LY.n++;LY.ms+=(performance.now()-t0-LY.ms)*.05;}};
function toStage(){
  const a=A.g,m=a.getTransform();TR={s:m.a,tx:m.e,ty:m.f,planes:planes&&!!PX&&!!PX.far};
  wipe(B);carry(a,B.g);ctx=B.g;phase=1;LY.plateUnlit=!!SLID.unlit;
  try{shapeFrame();if(LY.plateUnlit)normalsFrame();if(TR.planes){if(BT.n!==LY.n)bandsT(m);if(PX.soft!==softNow())bandsFar();}
    focusNow();feet();
    // (the plate is whole now: its two small copies for the blurs)
    if(LY.focus&&focusHere()){SH.g.globalCompositeOperation='copy';SH.g.drawImage(A.cv,0,0,SH.cv.width,SH.cv.height);SQ.g.globalCompositeOperation='copy';SQ.g.drawImage(SH.cv,0,0,SQ.cv.width,SQ.cv.height);}}
  catch(e){LY.err=String(e&&e.message||e);}}
function toTop(){const a=ctx;wipe(MAIN);carry(a,MAIN);ctx=MAIN;phase=2;}
{const f=envItems;envItems=function(){const r=f.apply(this,arguments);if(phase===0)toStage();return r;};}
for(const k of ['front','grade']){const f=FXL[k];FXL[k]=function(){if(phase===1)toTop();return f.apply(this,arguments);};}
{const f=drawFx;drawFx=function(){if(phase===1)toTop();return f.apply(this,arguments);};}
// the finish (sceneFinish, sk_scene_glue.js) comes once the world and its sparks are down. On the top sheet it finds only what the
// top holds, so it darkens the edges as ever and blooms the sparks; the bloom of the plate and the stage is made here, the game's
// way (env_look.js: the frame an eighth the size, multiplied by itself twice, at the place's strength), and Phaser lays it on.
{const f=sceneFinish;sceneFinish=function(){if(phase===2){try{light();}catch(e){LY.err=String(e&&e.message||e);}}return f.apply(this,arguments);};}
function light(){
  const o=finishOf();lightOn=false;if(!o||o==='post'||!(o.glow>0)||FXL.q!=='full')return;
  const bw=BL.cv.width,bh=BL.cv.height,g=BL.g;g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.imageSmoothingEnabled=true;
  if(TR.planes){const kx=bw/cv.width,ky=bh/cv.height,s=TR.s,o=BT.mid;g.globalCompositeOperation='source-over';g.clearRect(0,0,bw,bh);
    g.drawImage(FAR.cv,0,0,bw,bh);
    g.drawImage(PX.mid.cv,((o.r*RECT.x0+o.tx)*s+TR.tx)*kx,((o.r*RECT.y0+o.ty)*s+TR.ty)*ky,RECT.w*o.r*s*kx,RECT.h*o.r*s*ky);
    g.drawImage(A.cv,0,0,bw,bh);}
  else{g.globalCompositeOperation='copy';g.drawImage(A.cv,0,0,bw,bh);g.globalCompositeOperation='source-over';}
  g.drawImage(B.cv,0,0,bw,bh);
  g.globalCompositeOperation='multiply';g.drawImage(BL.cv,0,0);g.drawImage(BL.cv,0,0);
  const h=BM.g;h.setTransform(1,0,0,1,0,0);h.globalCompositeOperation='copy';h.globalAlpha=cl(o.glow,0,1);h.drawImage(BL.cv,0,0);lightOn=true;}

// ---------- focus ----------
// Where the eye is: the depth Ilyas stands at (the first man on the stage where he is not), followed over fEase seconds of the
// game's clock. A row of the floor is as deep as the game's own projection says (prjY, sk_core.js); the floor ends at the place's far
// depth, and above that row the plate is the far wall and what stands beyond it.
// The places the focus has been set for and looked at (the rest go onto the sheets all the same, and stay sharp). Where something
// rises behind a place's far wall: the wall's height (units over the far edge of the floor), and how much further up the softness
// is all there. Over the yard's roofs it is the far side of the Pit; the restaurant has its wall and no more.
const PLACES={yard:{wall:175,top:110},dining:{}};
const focusHere=()=>Object.prototype.hasOwnProperty.call(PLACES,envKey()||'');
function focusNow(){
  let f=null;for(const g of S.F||[])if(g&&!g.gone&&!g.hidden&&g.p){f=g;break;}
  const want=f?f.dep:LY.focusAt,dt=tPrev==null?1e3:S.t-tPrev;tPrev=S.t;
  LY.focusAt=dt<0||dt>1?want:LY.focusAt+(want-LY.focusAt)*(1-Math.exp(-dt/Math.max(.01,LY.fEase)));
  const s=TR.s,ty=TR.ty,H=cv.height,far=(S.arena&&S.arena.far)||DEP_MAX+40,dF=LY.focusAt;
  const ek=envKey(),P0=PLACES[ek]||null,by=!TR.planes&&P0&&P0.wall?P0:null;
  const K=cl(+LY.focusK||0,0,1);
  const key=[ek,s.toFixed(3),ty.toFixed(1),H,far,dF.toFixed(1),LY.f0,LY.f1,LY.fMax,LY.fTop,LY.fRoom,LY.fMid,K,TR.planes].join('|');if(key===maskKey)return;maskKey=key;
  const i1=M1.g.createImageData(3,255),i2=M2.g.createImageData(3,255),soft=x=>cl((Math.abs(x-dF)-LY.f0)/LY.f1,0,1)*LY.fMax,yFar=(GB-PSY*far)*s+ty,mFar=soft(far),mid=cl(LY.fMid,.05,.95);
  for(let i=0;i<255;i++){const y=(i+.5)/255*H;let m;
    if(y>=yFar)m=soft((GB-(y-ty)/s)/PSY);
    else{const hgt=(yFar-y)/s,up=Math.min(LY.fRoom,1-mFar);
      if(!by)m=mFar+up*cl(hgt/LY.fTop,0,1);
      else if(hgt<=by.wall)m=mFar+up*hgt/by.wall;
      else{const u=cl((hgt-by.wall)/by.top,0,1);m=mFar+up+(1-mFar-up)*u*u*(3-2*u);}}
    m*=K;
    // (the light blur comes in up to fMid, and the heavy one over it from there)
    const a1=Math.round(cl(m/mid,0,1)*255),a2=Math.round(cl((m-mid)/(1-mid),0,1)*255);
    for(let x=0;x<3;x++){const o=(i*3+x)*4;i1.data[o]=i1.data[o+1]=i1.data[o+2]=i2.data[o]=i2.data[o+1]=i2.data[o+2]=255;i1.data[o+3]=a1;i2.data[o+3]=a2;}}
  M1.g.putImageData(i1,0,0);M2.g.putImageData(i2,0,0);maskNew=true;}

// ---------- PARALLAX ----------
// A place's far bands on sheets of their own. The game paints a place's still picture whole, back to front, onto one layer
// (sceneLayer, sk_scene_glue.js). In this page's copy the yard's painter has been opened (build_layers.py) to paint its bands
// apart. The game still paints its layer whole and measures it (where the picture ends, how light the ground is behind a man: the
// camera and the rim light go by those). Then, the first time the layer is drawn in a frame on the sheets, it is painted over in
// place with the yard alone, lit as the whole was, and the two far bands are painted small on canvases of their own. A frame that
// has to be flat cannot use a layer with its far bands gone: the layer is dropped and the game paints it whole again.
//
// Each band has its own view of the world, worked out from the frame's own (bandsT). x0, y0: where the camera stands for the
// picture as it was painted, and the line the bands stand on (the far edge of the yard's ground). w0: the width of view at which
// the picture is as it was painted. Then for each band: how much of the camera's going along the yard it follows, and the power of
// the camera's push it grows by (the yard itself is 1 and 1; a band at 0 and 0 would hang still behind it). So from the yard's
// whole view to a close one the Pit's far side slides a fifth as far as the yard does and grows about two thirds as much, and the
// shacks round the yard keep nearer to it. top: how far up the far wall's picture goes before the sky begins over it. A band
// grown less than the yard shows more of itself, higher up, so in a view that looks high the bands are let grow until the far
// wall's own view stops at top, and a view that looks as high as that has them as they were painted: the sky comes into a shot
// only where the game's own picture has it.
// The far band: its still picture and everything that moves on the far wall, put together each frame on one sheet (FAR) the size
// of the screen's canvas or a part of it, which Phaser shows under everything. The middle band: its still picture, placed by
// Phaser; its chimneys' smoke is drawn on the plate where the band has gone. The middle band's row of shacks is painted on to the
// left, behind the woodshed and the Sump (build_layers.py): the whole picture hides that, and the band shows it as it slides out.
const BANDS={yard:{x0:470,y0:262,w0:820,top:-470,far:[.2,.65],mid:[.72,.88]}};
// (the far bands' rectangle in the world: as wide as the yard's backdrop is painted, and from just over the layer's top to 342,
// where the backdrop's own haze ends, well under the lowest roof)
const RECT={x0:-170,y0:-110,w:W+420,h:452};
const SLID=globalThis.__lyp={far:null,mid:null,end:null,ext:true,unlit:false,own:0};
let planes=false,PX=null,farT=null;
const FAR=mk(4,4),BT={n:-1,far:{r:1,tx:0,ty:0},mid:{r:1,tx:0,ty:0}};
const bandsHere=()=>{const k=envKey(),X=k&&EnvLook.S[k];return!!(X&&X.bands&&BANDS[k]&&typeof X.paint==='function');};
const layerDrop=()=>{if(typeof SCENE_LY!=='undefined'&&SCENE_LY&&SCENE_LY.lyNear){SCENE_LY.cv.width=SCENE_LY.cv.height=0;SCENE_LY=null;}};
// before each frame: are the bands used in it
function bandsFrame(lay){
  planes=lay&&LY.parallax&&bandsHere();
  if(!planes||SLID.ext!==(LY.ext!==false))layerDrop();
  SLID.ext=LY.ext!==false;
  // (the lamps on the plate: the painter then leaves its own pools of lamplight out of the still picture, which is painted again)
  {const ul=!!(lay&&LY.lampGround&&LAMPS&&LAMPS.length&&lampsHere());if(!!SLID.unlit!==ul){SLID.unlit=ul;if(typeof SCENE_LY!=='undefined'&&SCENE_LY){SCENE_LY.cv.width=SCENE_LY.cv.height=0;SCENE_LY=null;}}}}
const lampsHere=()=>{const k=envKey(),X=k&&EnvLook.S[k];return!!(X&&typeof X.lampsAt==='function'&&typeof X.normals==='function');};
// The plate's facing map for this frame: the place's own (EnvLook.S[k].normals(c), in the place's own coordinates: flat fields of
// a normal map's colours, the ground leaning up, what stands facing us, roofs leaning back, and what is lit from within or too far
// off turned away, so that no lamp adds to it), laid where the camera has the place. Painted again when the hour changes.
function normalsFrame(){
  const k=envKey(),X=k&&EnvLook.S[k],L=typeof SCENE_LY!=='undefined'?SCENE_LY:null,g=NA.g,q=NA.cv.width/cv.width;
  g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.fillStyle='rgb(127,127,255)';g.fillRect(0,0,NA.cv.width,NA.cv.height);
  if(!X||typeof X.normals!=='function'||!L||L.k!==k)return;
  const key=[k,L.v,L.lh,tod()].join('|');
  if(!NL||NL.key!==key){const ns=.5,w=Math.ceil(RC.w*ns),h=Math.ceil(L.lh*ns);if(!NL)NL=mk(w,h);if(NL.cv.width!==w||NL.cv.height!==h){NL.cv.width=w;NL.cv.height=h;}
    NL.key=key;NL.lh=L.lh;const c=NL.g;c.setTransform(ns,0,0,ns,-RC.x0*ns,-RC.y0*ns);X.normals(c);}
  g.setTransform(TR.s*q,0,0,TR.s*q,TR.tx*q,TR.ty*q);g.imageSmoothingEnabled=true;g.drawImage(NL.cv,RC.x0,RC.y0,RC.w,NL.lh);}
// ---------- the pieces' shapes ----------
// A piece is a small picture the place's painter keeps and sets down among the people (K.piece, K.drawPiece). Its map: the outline
// blurred is taken for a height (the middle high, the edge falling away over a fifth of the piece's width, 4 to 14 units), and the
// slope of that height turns the surface: flat and standing in the middle, turned outward at the edges. So a lamp to one side lights
// the near edge and leaves the far one. Worked out once for a piece, at half its size or less, a few pieces a frame.
function blur1(a,b,W,H,r){const k=1/(2*r+1);
  for(let y=0;y<H;y++){const o=y*W;let t=0;for(let x=0;x<=r&&x<W;x++)t+=a[o+x];
    for(let x=0;x<W;x++){b[o+x]=t*k;const i=x+r+1,j=x-r;if(i<W)t+=a[o+i];if(j>=0)t-=a[o+j];}}
  for(let x=0;x<W;x++){let t=0;for(let y=0;y<=r&&y<H;y++)t+=b[y*W+x];
    for(let y=0;y<H;y++){a[y*W+x]=t*k;const i=y+r+1,j=y-r;if(i<H)t+=b[i*W+x];if(j>=0)t-=b[j*W+x];}}}
function nmMake(T){
  const cw=T.cv.width,ch=T.cv.height;T.nm=false;if(cw<6||ch<6||!(T.w>0))return;
  const f=Math.min(.5,320/Math.max(cw,ch)),W=Math.max(4,Math.round(cw*f)),H=Math.max(4,Math.round(ch*f)),o=mk(W,H);
  o.g.imageSmoothingEnabled=true;o.g.drawImage(T.cv,0,0,W,H);
  const D=o.g.getImageData(0,0,W,H),px=D.data,n=W*H,a=new Float32Array(n),b=new Float32Array(n);
  for(let i=0;i<n;i++)a[i]=px[i*4+3]/255;
  const R=cl(.2*Math.min(T.w,T.h),4,14)*(W/T.w),rb=Math.max(1,Math.round(R*.5)),k=(+LY.shapeK||0)*R;
  for(let i=0;i<3;i++)blur1(a,b,W,H,rb);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x,j=i*4;if(!px[j+3])continue;
    const nx=-k*(a[i+(x<W-1?1:0)]-a[i-(x>0?1:0)])*.5,ny=k*(a[i+(y<H-1?W:0)]-a[i-(y>0?W:0)])*.5+UPT,l=127.5/Math.sqrt(nx*nx+ny*ny+1);
    px[j]=nx*l+127.5;px[j+1]=ny*l+127.5;px[j+2]=l+127.5;}
  o.g.putImageData(D,0,0);T.nm=o.cv;}
// each frame: the stage's sheet of facings wiped to the standing colour; a few of the waiting pieces worked out
function shapeFrame(){
  const on=!!(LY.lamps&&LY.shape&&LAMPS&&LAMPS.length),g=NB.g;shapeOn=on;LY.shapeN=0;
  if(!on&&!nbUsed)return;
  g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.fillStyle=UPC;g.fillRect(0,0,NB.cv.width,NB.cv.height);nbUsed=on;nbNew=true;
  if(on&&NMQ.length){const t0=performance.now();try{do{nmMake(NMQ.shift());}while(NMQ.length&&performance.now()-t0<4);}catch(e){LY.lampErr='shape: '+String(e&&e.message||e);NMQ.length=0;}
    LY.shapeMs+=performance.now()-t0;}}
// what the yard's painter calls (build_layers.py). piece(c, T): a piece has just been set down on c; on the stage, its map goes
// down on the sheet of facings at the same place. glowK(c, x, y): how much of a painted glow at (x, y) to paint, where the lamps
// are about to multiply it: a lamp's own halo is then as bright as its painter meant, not brighter by the lamp's own light
SLID.piece=function(c,T){
  if(phase!==1||c!==B.g||!shapeOn)return;
  const N=T.nm;if(N===undefined){T.nm=null;NMQ.push(T);return;}if(!N)return;
  const m=c.getTransform(),qx=NB.cv.width/cv.width,qy=NB.cv.height/cv.height,g=NB.g;
  g.setTransform(m.a*qx,m.b*qy,m.c*qx,m.d*qy,m.e*qx,m.f*qy);g.drawImage(N,T.x,T.y,T.w,T.h);LY.shapeN++;};
// fig(R): the light module has just set a man's own picture down on the stage (R.cv, at R.x, R.y on the canvas, R.w by R.h): his
// outline goes down on the sheet of facings in the standing colour, so that a piece behind him does not show through him there
const FG=mk();
SLID.fig=function(R){
  if(phase!==1||!shapeOn||ctx!==B.g||!R||!R.cv||!(R.w>0)||!(R.h>0))return;
  const qx=NB.cv.width/cv.width,qy=NB.cv.height/cv.height,w=Math.max(1,Math.ceil(R.w*qx)),h=Math.max(1,Math.ceil(R.h*qy)),g=FG.g;
  if(FG.cv.width<w)FG.cv.width=w;if(FG.cv.height<h)FG.cv.height=h;
  g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='copy';g.drawImage(R.cv,0,0,R.w,R.h,0,0,w,h);
  g.globalCompositeOperation='source-in';g.fillStyle=UPC;g.fillRect(0,0,w,h);
  const n=NB.g;n.setTransform(1,0,0,1,0,0);n.drawImage(FG.cv,0,0,w,h,R.x*qx,R.y*qy,w,h);};
SLID.glowK=function(c,x,y){
  // (own: the painter is at the glow of something lit from within, which is turned away from every lamp)
  const L=LAMPS;if(!L||!L.length||!LY.lamps||SLID.own||!(phase===1?c===B.g:phase===0&&c===A.g&&SLID.unlit))return 1;
  const m=c.getTransform(),wx=(m.a*x+m.c*y+m.e-TR.tx)/TR.s,wy=(m.b*x+m.d*y+m.f-TR.ty)/TR.s;let C=0;
  for(const q of L){const dx=q.x-wx,up=wy-q.y,z=(q.z||.55)*q.r,d2=dx*dx+up*up+z*z,at=1-d2/(q.r*q.r);if(at>0)C+=q.k*at*Math.max(0,UPT*.9*up+.9*z)/Math.sqrt(d2);}
  return 1/(1+.8*C*LY.lampK);};
// a band's view this frame. m is the frame's own (world to canvas: the camera's place, its width of view, its shake). A point
// X, Y of a band is drawn where the yard's point r*X+tx, r*Y+ty would be.
function bandsT(m){
  // (where motion is reduced the bands stand as they were painted: apart, each with its own softness, and still)
  const B0=BANDS[PX.k],cx=(cv.width/2-m.e)/m.a,vw=cv.width/m.a,rm=still(),sl=rm?0:cl(+LY.slide||0,0,1),pu=rm?0:cl(+LY.push||0,0,1);
  const need=cl((B0.y0+m.f/m.d)/(B0.y0-B0.top),0,1);
  for(const b of ['far','mid']){const k=1-(1-B0[b][0])*sl,r0=cl(Math.pow(vw/B0.w0,(1-B0[b][1])*pu),.4,1.6),r=r0<1?Math.max(r0,need):r0,o=BT[b];
    o.r=r;o.tx=cx-r*(B0.x0+k*(cx-B0.x0));o.ty=B0.y0*(1-r);}
  BT.n=LY.n;}
// What the yard's painter asks for (build_layers.py). far(c): the far band's sheet, cleared, with the still far band laid on it
// under the band's own view, for the painter to draw the far wall's moving things on (nothing where the bands are not apart: it
// then draws them on the plate as ever, inside its skyline). While it does, the camera's top is the band's own, so that the
// picture above the layer and the tram are drawn as far up as this band's view reaches. end(): those are down. mid(c): the middle
// band's view, laid on a context that holds the frame's own.
SLID.far=function(c0){
  if(!planes||phase!==0||!PX||!PX.far)return null;
  const m=c0.getTransform();if(m.b||m.c||!(m.a>0))return null;
  bandsT(m);
  // (blurred, a part of the canvas is plenty: small enough that the blur costs little, and no smaller than the blur's reach can
  // hide; sharp, all of it, or half where the screen is dense enough to carry that)
  const reach=PX.soft?LY.blurFar*cl(+LY.focusK||0,0,1):0,need=reach>0?1.8/(reach*DPR):9,f=!PX.soft?(DPR>=2.5?.5:1):need<=.26?.25:need<=.34?1/3:need<=.51?.5:1;
  const w=Math.max(8,Math.ceil(cv.width*f)),h=Math.max(8,Math.ceil(cv.height*f));
  if(FAR.cv.width!==w||FAR.cv.height!==h){FAR.cv.width=w;FAR.cv.height=h;}
  const g=FAR.g,o=BT.far,kx=w/cv.width,ky=h/cv.height;
  g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,w,h);
  g.setTransform(kx*m.a*o.r,0,0,ky*m.d*o.r,kx*(m.a*o.tx+m.e),ky*(m.d*o.ty+m.f));g.imageSmoothingEnabled=true;
  g.drawImage(PX.far.cv,RECT.x0,RECT.y0,RECT.w,RECT.h);
  farT=(cam.T-o.ty)/o.r;return g;};
SLID.end=function(){farT=null;};
SLID.mid=function(c){if(planes&&phase===0&&PX&&BT.n===LY.n){const o=BT.mid;c.translate(o.tx,o.ty);c.scale(o.r,o.r);}};
{const f=camTop;camTop=function(){return farT!=null?farT:f.apply(this,arguments);};}
{const f=sceneLayer;sceneLayer=function(k){const L=f.apply(this,arguments);
  if(planes&&phase===0&&L&&!L.lyNear&&k===envKey()){try{bandsMake(k,L);}catch(e){LY.err='bands: '+String(e&&e.message||e);}}
  return L;};}
// the light that goes over a place's whole picture, on one band of it: the painter's own pass, and the place's key light as
// sceneLayer lays it in
function bandLight(k,c,x0,w){const X=EnvLook.S[k];X.paint(c,'light');if(!X.setLive){const G0=setOf(k);if(G0)setDraw(c,G0,x0,w);}}
const plain=c=>{c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='source-over';c.globalAlpha=1;};
// (the light is laid over the whole canvas and then kept only where the band itself is painted: what it does to a pixel depends on
// that pixel alone, so each band comes out lit as it was in the whole picture)
function keepOnly(c,M){plain(c);c.globalCompositeOperation='destination-in';c.drawImage(M.cv,0,0);c.globalCompositeOperation='source-over';M.cv.width=M.cv.height=0;}
function bandsMake(k,L){
  const X=EnvLook.S[k],sc=L.sc,c=L.cv.getContext('2d'),t0=performance.now(),world=()=>c.setTransform(sc,0,0,sc,-RC.x0*sc,-RC.y0*sc);
  // (above its top the game fills a tall view with the top row's colours as it measured them on the whole picture, and the
  // picture above the layer goes over that. Here that picture is on the far band's sheet, under the plate: no fill)
  L.lyNear=true;L.row=null;
  plain(c);c.clearRect(0,0,L.cv.width,L.cv.height);world();X.paint(c,'near');
  // (the yard's painter lays some things over its light: the things along the walls again, what grows. As in the whole picture:
  // the light, then those, then the place's key light over it all; and the band keeps what either painting covered)
  const M=mk(L.cv.width,L.cv.height);M.g.drawImage(L.cv,0,0);M.g.setTransform(sc,0,0,sc,-RC.x0*sc,-RC.y0*sc);X.paint(M.g,'over');
  plain(c);world();X.paint(c,'light');X.paint(c,'over');if(!X.setLive){const G0=setOf(k);if(G0)setDraw(c,G0,RC.x0,RC.w);}keepOnly(c,M);world();
  for(const b of PX?[PX.far,PX.mid]:[])if(b)b.cv.width=b.cv.height=0;
  PX={k,L,soft:null,far:null,mid:null,up:false,ms:0};bandsFar();PX.ms=performance.now()-t0;}
// the two far bands: small where the focus will blur them anyway (a quarter and a half of the layer's scale at full focus, a
// third and a half at a lighter one: smaller than that and the blur no longer hides the sheet's own grain), near the layer's
// own scale where it is off and they must be as sharp as the whole picture was. softNow: 0 sharp, 1 lightly blurred, 2 fully.
const softNow=()=>LY.focus&&focusHere()?(cl(+LY.focusK||0,0,1)>.75?2:1):0;
function bandsFar(){
  const k=PX.k,X=EnvLook.S[k],soft=softNow(),sc=PX.L.sc,R=RECT;
  const one=(which,q,cut)=>{const cn=mk(Math.ceil(R.w*q),Math.ceil(R.h*q)),c=cn.g,world=()=>c.setTransform(q,0,0,q,-R.x0*q,-R.y0*q);
    world();X.paint(c,which);let M=null;if(cut){M=mk(cn.cv.width,cn.cv.height);M.g.drawImage(cn.cv,0,0);}
    // (the far bands keep the painter's own lamplight: Phaser's lamps do not reach them)
    plain(c);world();{const u=SLID.unlit;SLID.unlit=false;try{bandLight(k,c,R.x0,R.w);}finally{SLID.unlit=u;}}if(M)keepOnly(c,M);return{cv:cn.cv,q};};
  for(const b of [PX.far,PX.mid])if(b)b.cv.width=b.cv.height=0;
  PX.far=one('far',sc*[.75,1/3,1/4][soft],false);PX.mid=one('mid',sc*[.75,1/2,1/2][soft],true);PX.soft=soft;PX.up=true;}

// ---------- dust ----------
// Only where the ground is dirt: the yard. Nothing moves where motion is reduced (the motes stand still, no puffs).
const dusty=()=>LY.dustAll||envKey()==='yard';
const still=()=>typeof reduceMotion!=='undefined'&&reduceMotion;
// the dust's colour and the motes', and how much of them shows, by the Pit's time of day (S.act1). Soot and dry earth: no gold.
function tod(){const a=S.act1;return!a?'day':a.night?'night':a.morning?'morning':a.dusk?'dusk':'day';}
const AIR={day:{dust:0xb7a58b,mote:0xe9dcc4,k:1},morning:{dust:0x9aa3b4,mote:0xd3dbe8,k:.9},dusk:{dust:0xa8846c,mote:0xe2b79a,k:.8},night:{dust:0x55525e,mote:0x8088a8,k:.3}};
// a footfall: a foot that was off the floor and is down again. Read inside render(), where the joints are the ones being drawn.
const FEET=new WeakMap(),PUFFS=[];let puffN=0;
let puffKey='';
function feet(){
  // (another place, or another play of this one: its dust does not come along)
  const key=(S.story?S.story.key:'-')+'|'+envKey();if(key!==puffKey){puffKey=key;PUFFS.length=0;}
  if(!LY.dust||!dusty()||still())return;
  for(const f of S.F||[]){if(!f||f.gone||f.hidden||f.dead||!f.p||!f.p[FTF]||!f.gr)continue;
    let st=FEET.get(f);if(!st)FEET.set(f,st=[{},{}]);
    for(let k=0;k<2;k++){const q=f.p[k?FTB:FTF],e=st[k],g=f.gr(q.x),h=g-q.y,dt=e.t==null?-1:S.t-e.t;
      if(dt>0&&dt<.1){
        // (how high a foot rests is its own business: the lowest it has been lately is the floor for it)
        e.base=Math.min(e.base+dt*.6,h);const up=h-e.base;
        if(up>2.4){e.air=(e.air||0)+dt;e.vx=(q.x-e.x)/dt;}
        else if(up<1.1){if(e.air>.05)puff(f,q.x,g,e.vx||0);e.air=0;}}
      else{e.base=h;e.air=0;}
      e.x=q.x;e.t=S.t;}}}
function puff(f,x,g,vx){
  const X=prjX(x,f.dep),Y=prjY(g,f.dep),k=cl(Math.abs(vx)/260,.35,1.3),n=k>.8?4:3,sg=vx<0?-1:1;
  for(let i=0;i<n;i++){const j=puffN++,r=hs(j*5+11),r2=hs(j*5+12),r3=hs(j*5+13);
    PUFFS.push({x:X+(r-.5)*6,y:Y-1.5-r2*2,vx:-sg*(4+10*r3)*k+(r-.5)*6,vy:-(5+9*r2)*k,r:(3+2.4*r3)*(.8+.4*k),a:(.28+.18*r)*Math.sqrt(k),t0:S.t,life:.55+.5*r2});}
  if(PUFFS.length>64)PUFFS.splice(0,PUFFS.length-64);}

// ---------- Phaser's side ----------
function scn(){const g=PHOST.game,s=g&&g.scene&&g.scene.getScene('host');return s&&s.sys&&s.add&&s.textures&&s.sys.displayList?s:null;}
function tex(sc,key,c){if(sc.textures.exists(key))sc.textures.remove(key);sc.textures.create(key,c,c.width,c.height).add('__BASE',0,0,0,c.width,c.height);}
function dot(){const L=mk(60,60),g=L.g,r=g.createRadialGradient(30,30,0,30,30,29);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.5,'rgba(255,255,255,.5)');r.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=r;g.fillRect(0,0,60,60);return L.cv;}
function drop(){if(!G)return;for(const o of G.lamps||[])try{G.sc.lights.removeLight(o);}catch(e){/* gone with its scene */}
  for(const o of [G.plate,G.soft1,G.soft2,G.stage,G.bloom,G.back,G.front,G.far,G.mid])try{if(o)o.destroy();}catch(e){/* gone with its scene */}G=null;}
// the far band's sheet under everything, the size of the screen; over it the middle band, where its own view of the world puts
// it. Each is blurred by its own small amount where the focus is on (the textures are small, so the blurs are nearly free)
function bandsSync(sc,live,dpr){
  const on=live&&TR.planes&&!!PX&&!!PX.mid&&FAR.cv.width>4;
  if(G.far)G.far.setVisible(on);if(G.mid)G.mid.setVisible(on);
  if(!on)return;
  const im=(key,d)=>{const o=sc.add.image(0,0,key).setOrigin(0,0).setDepth(d);o.enableFilters();o.bl=o.filters.internal.addBlur(1,1,1,1,0xffffff,1);o.bl.setPaddingOverride(0,0,0,0);return o;};
  if(!G.far||G.farW!==FAR.cv.width||G.farH!==FAR.cv.height){if(G.far)G.far.destroy();tex(sc,'lyFar',FAR.cv);G.far=im('lyFar',-64);G.farW=FAR.cv.width;G.farH=FAR.cv.height;G.farSeen=LY.n;}
  else if(G.farSeen!==LY.n){G.farSeen=LY.n;sc.textures.get('lyFar').source[0].update();}
  if(PX.up||!G.mid||G.px!==PX){PX.up=false;G.px=PX;if(G.mid)G.mid.destroy();tex(sc,'lyMid',PX.mid.cv);G.mid=im('lyMid',-62);}
  const s=TR.s,K=cl(+LY.focusK||0,0,1);
  {const up=G.w/FAR.cv.width,r=PX.soft?LY.blurFar*K*dpr/(1.9*up):0;G.far.setScale(up,G.h/FAR.cv.height);G.far.bl.setActive(r>.02);G.far.bl.x=G.far.bl.y=r;}
  {const o=BT.mid,b=PX.mid,up=s*o.r/b.q,r=PX.soft?LY.blurMid*K*dpr/(1.9*up):0;
    G.mid.setPosition((o.r*RECT.x0+o.tx)*s+TR.tx,(o.r*RECT.y0+o.ty)*s+TR.ty).setScale(up);G.mid.bl.setActive(r>.02);G.mid.bl.x=G.mid.bl.y=r;}}
function build(sc){
  drop();const w=cv.width,h=cv.height,bw=Math.max(24,Math.round(w/8)),bh=Math.max(24,Math.round(h/8));
  for(const L of [A,B]){L.cv.width=w;L.cv.height=h;}for(const L of [BL,BM]){L.cv.width=bw;L.cv.height=bh;}
  SH.cv.width=Math.ceil(w/2);SH.cv.height=Math.ceil(h/2);SQ.cv.width=Math.ceil(w/4);SQ.cv.height=Math.ceil(h/4);NA.cv.width=Math.ceil(w/4);NA.cv.height=Math.ceil(h/4);
  {const q=cl(+LY.shapeQ||.5,.2,1);NB.cv.width=Math.ceil(w*q);NB.cv.height=Math.ceil(h*q);NB.g.fillStyle=UPC;NB.g.fillRect(0,0,NB.cv.width,NB.cv.height);nbUsed=false;nbNew=true;}
  tex(sc,'ly0',A.cv);tex(sc,'ly1',B.cv);tex(sc,'lyH',SH.cv);tex(sc,'lyQ',SQ.cv);tex(sc,'lyBloom',BM.cv);tex(sc,'lyM1',M1.cv);tex(sc,'lyM2',M2.cv);
  // (the plate's facing map is the normal map of the plate and of its two soft copies)
  NA.g.fillStyle='rgb(127,127,255)';NA.g.fillRect(0,0,NA.cv.width,NA.cv.height);for(const k of ['ly0','lyH','lyQ'])sc.textures.get(k).setDataSource(NA.cv);
  // (and the stage's sheet of facings is the stage's)
  sc.textures.get('ly1').setDataSource(NB.cv);
  if(!sc.textures.exists('lyDot'))tex(sc,'lyDot',dot());
  // (under the host's own picture of the game's canvas, which sits at depth 0: the plate, its two soft copies, the dust behind, the
  // stage, the dust in front, the bloom. A filter runs at its picture's own size, so the small copies are blurred small and only
  // then drawn out to the screen's size)
  const plate=sc.add.image(0,0,'ly0').setOrigin(0,0).setDepth(-60);
  const softOf=(key,c,mkey,d)=>{const im=sc.add.image(0,0,key).setOrigin(0,0).setScale(w/c.width,h/c.height).setDepth(d);im.enableFilters();
    const bl=im.filters.internal.addBlur(1,1,1,1,0xffffff,1);bl.setPaddingOverride(0,0,0,0);im.filters.internal.addMask(mkey);im.bl=bl;return im;};
  const soft1=softOf('lyH',SH.cv,'lyM1',-58),soft2=softOf('lyQ',SQ.cv,'lyM2',-57);
  const back=sc.add.container(0,0).setDepth(-55),stage=sc.add.image(0,0,'ly1').setOrigin(0,0).setDepth(-50),front=sc.add.container(0,0).setDepth(-45);
  const bloom=sc.add.image(0,0,'lyBloom').setOrigin(0,0).setDisplaySize(w,h).setBlendMode(Phaser.BlendModes.SCREEN).setDepth(-40);
  G={w,h,sc,plate,soft1,soft2,back,stage,front,bloom,motes:[],puffs:[],lamps:[],lit:false,seen:-1};maskKey='';
  const mote=(i,fr)=>{const im=sc.add.image(0,0,'lyDot').setBlendMode(Phaser.BlendModes.ADD).setVisible(false);(fr?front:back).add(im);
    return{im,fr,x:hs(i*7+1),y:hs(i*7+2),ph:hs(i*7+3)*6.283,v:.5+hs(i*7+6),r:fr?4+hs(i*7+4)*5:.9+hs(i*7+4)*1,a:fr?.07+hs(i*7+5)*.08:.22+hs(i*7+5)*.28,p:fr?1.35+hs(i*7+4)*.5:.82+hs(i*7+4)*.14};};
  for(let i=0;i<LY.motesBack;i++)G.motes.push(mote(i,false));for(let i=0;i<LY.motesFront;i++)G.motes.push(mote(1000+i,true));}
function dust(){
  const on=LY.dust&&dusty(),K=AIR[tod()],s=TR.s,t=still()?0:S.t,VW=G.w/s,L=-TR.tx/s,span=VW+120,yG=GB-PSY*LY.focusAt;
  for(const m of G.motes){if(!on||!(LY.moteA>0)){m.im.setVisible(false);continue;}
    // (a mote keeps its place in the air and drifts a little; the camera passing shifts the ones in front faster than the ones behind)
    const X=(((m.x*span+t*(m.fr?5:2.2)*m.v+Math.sin(t*.31*m.v+m.ph)*7-L*m.p)%span)+span)%span-60,
      Y=(m.fr?yG+70-m.y*230:yG-10-m.y*165)+Math.sin(t*.23*m.v+m.ph*1.7)*5;
    m.im.setVisible(true).setPosition(X*s,Y*s+TR.ty).setScale(m.r*s/30).setTint(K.mote).setAlpha(cl(m.a*LY.moteA*K.k*(.75+.25*Math.sin(t*1.3*m.v+m.ph)),0,1));}
  let n=0;
  for(let i=PUFFS.length-1;i>=0;i--){const p=PUFFS[i],age=S.t-p.t0,u=age/p.life;
    if(!(u>=0&&u<1)||!on||!(LY.puffA>0)){PUFFS.splice(i,1);continue;}
    let im=G.puffs[n];if(!im){im=G.sc.add.image(0,0,'lyDot');G.front.add(im);G.puffs.push(im);}n++;
    // (a puff lies low and wide, and thins as it spreads)
    const R=p.r*(1+1.6*u)*s/30;
    im.setVisible(true).setPosition((p.x+p.vx*age*(1-.35*u))*s+TR.tx,(p.y+p.vy*age*(1-.5*u))*s+TR.ty).setScale(R*1.5,R*.72).setTint(K.dust).setAlpha(cl(p.a*(1-u)*(1-u)*LY.puffA*(.6+.4*K.k),0,1));}
  for(let i=n;i<G.puffs.length;i++)G.puffs[i].setVisible(false);}
// ---------- the lamps ----------
// A place's lamps as Phaser's own lights: the people and the pieces near a lamp take its light, the ground and the walls take it,
// and the light moves as its flame does. The place's painter says where its lamps are in the picture, how far each reaches, how
// far it stands out of the sheet (z, as a part of its reach: a small one puts the light on the ground before the lamp and tight on
// a wall, a large one lights all alike) and how strong it is (EnvLook.S[k].lampsAt(t, still): the yard's, opened in this page's
// copy by build_layers.py). The air is left white, so whatever no lamp reaches is as it was painted.
// A light multiplies what it falls on. So the plate under the lamps is painted without its own lamplight (__lyp.unlit, above),
// and both sheets carry a map of which way their surfaces face: the plate's from the place's painter (normalsFrame), the stage's
// from the pieces' outlines (shapeFrame). A lamp's flicker is the game's clock's, never the dice, and with motion reduced it
// burns steady. (README, "The lamps".)
function lampsNow(){const k=envKey(),X=k&&EnvLook.S[k];try{return LY.lamps&&X&&typeof X.lampsAt==='function'?X.lampsAt(S.t,still()):null;}catch(e){LY.lampErr=String(e&&e.message||e);return null;}}
function lamps(sc,live){
  const L=live?LAMPS:null,on=!!(L&&L.length),s=TR.s;
  if(on&&!G.lit){sc.lights.enable();sc.lights.setAmbientColor(0xffffff);G.lit=true;}
  if(!!G.stage.lighting!==on)G.stage.setLighting(on);
  // (the plate and its soft copies only where the plate was painted without its own lamplight)
  {const gr=on&&LY.plateUnlit;for(const o of [G.plate,G.soft1,G.soft2])if(!!o.lighting!==gr)o.setLighting(gr);}
  let n=0;
  if(on)for(const q of L){let o=G.lamps[n];if(!o){o=sc.lights.addLight(0,0,100,0xffffff,0);G.lamps.push(o);}n++;
    const r=q.r*s;o.setPosition(q.x*s+TR.tx,q.y*s+TR.ty);o.setRadius(r).setColor(q.col).setIntensity(q.k*LY.lampK).setZ((q.z||.55)*r);
    if(q.cone)o.setCone(q.cone[0],q.cone[1],q.cone[2]);else if(o.coneEnabled)o.disableCone();}
  // (a light not in use is put where no screen is: Phaser counts only those that reach the view, ten at most)
  for(let i=n;i<G.lamps.length;i++){const o=G.lamps[i];o.setIntensity(0).setRadius(1);o.setPosition(-1e6,-1e6);}
  LY.lampsN=n;}
function sync(){
  const sc=scn();if(!sc)return;
  if(LY.need||(G&&G.sc!==sc)){LY.need=false;build(sc);}
  if(!G)return;
  const live=LY.live&&PHOST.mode>0&&!PHOST.err;
  G.plate.setVisible(live);G.stage.setVisible(live);G.back.setVisible(live);G.front.setVisible(live);const foc=live&&LY.focus&&focusHere();G.soft1.setVisible(foc);G.soft2.setVisible(foc);
  G.bloom.setVisible(live&&lightOn);
  const r=cv.getBoundingClientRect(),dpr=r.width>0?cv.width/r.width:1;DPR=dpr;
  bandsSync(sc,live,dpr);lamps(sc,live);
  if(!live)return;
  if(G.seen!==LY.n){G.seen=LY.n;const T=sc.textures,up=k=>T.get(k).source[0].update();up('ly0');up('ly1');if(lightOn)up('lyBloom');
    if(foc){up('lyH');up('lyQ');if(maskNew){maskNew=false;up('lyM1');up('lyM2');}}
    if(LY.plateUnlit)for(const k of foc?['ly0','lyH','lyQ']:['ly0']){const d=T.get(k).dataSource[0];if(d)d.update();}
    if(nbNew){nbNew=false;const d=T.get('ly1').dataSource[0];if(d)d.update();}}
  // (a blur's reach is in points of the screen: the canvas holds more pixels than that where the screen is dense, and each small
  // copy fewer than the canvas. One pass of Phaser's medium blur spreads a picture about 1.9 of its own pixels at a setting of 1)
  G.soft1.bl.x=G.soft1.bl.y=LY.blur1*dpr/(1.9*G.soft1.scaleX);G.soft2.bl.x=G.soft2.bl.y=LY.blur2*dpr/(1.9*G.soft2.scaleX);
  dust();}
PHOST.game.events.on('prestep',()=>{try{sync();}catch(e){LY.err=String(e&&e.message||e);}});
LY.info=()=>({live:LY.live,why:LY.why,focus:LY.focus&&focusHere(),dust:LY.dust&&dusty(),parallax:LY.live&&TR.planes,bands:TR.planes?['far','mid'].map(b=>[+BT[b].r.toFixed(3),+BT[b].tx.toFixed(1),+BT[b].ty.toFixed(1)]):null,bandsMs:PX?Math.round(PX.ms):0,far:[FAR.cv.width,FAR.cv.height],n:LY.n,ms:+LY.ms.toFixed(2),host:+(PHOST.hostMs||0).toFixed(2),focusAt:+LY.focusAt.toFixed(1),puffs:PUFFS.length,err:LY.err,
  size:G?[G.w,G.h]:null,light:lightOn,lamps:LY.lampsN,ground:LY.plateUnlit,shapes:LY.shapeN,shapeMs:Math.round(LY.shapeMs),lampErr:LY.lampErr});
// (for the checks: the sheets themselves)
LY.puffs=()=>PUFFS.map(p=>({x:+p.x.toFixed(1),y:+p.y.toFixed(1),a:+p.a.toFixed(2),r:+p.r.toFixed(1),age:+(S.t-p.t0).toFixed(2),life:+p.life.toFixed(2)}));
LY.sheets=()=>({far:FAR.cv,farStill:PX&&PX.far&&PX.far.cv,mid:PX&&PX.mid&&PX.mid.cv,plate:A.cv,stage:B.cv,plateN:NA.cv,stageN:NB.cv,top:cv,half:SH.cv,quarter:SQ.cv,mask1:M1.cv,mask2:M2.cv,bloom:BM.cv});
})();
