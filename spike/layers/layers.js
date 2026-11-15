// ===== LAYERS TEST: THE PICTURE HANDED TO PHASER IN LAYERS =====
// Built as a test (README.md); since V118 a part of the game's published page, after its script and the Phaser host (build.py
// game_page; its switches: options.js). It changes only where the picture is painted and how it is put together: the game's clock, its rules and
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
  f0:30,f1:480,fMax:.7,fTop:260,fRoom:.2,fEase:.5,blur1:1.2,blur2:3,fMid:.45,
  // pull (since V119): the focus tightens as the camera comes close, as a lens does. The view's width in units against pullRef
  // says how close: nothing at 1 + pull0 times closer than pullRef across, all of it at 1 + pull1 (a phone's view of his turn is
  // 560 units or more across: none; its push-in for an exchange, about 404: a third; a scene's close shot at 250: all). Then what
  // lies pullSpan units or more from the depth the eye is at, nearer or further, and the wall behind, is pullK softer. pullAt: how
  // much of the pull the last frame had. A place can turn it down or off (PLACES: pull)
  pull:true,pullRef:600,pull0:.15,pull1:1.15,pullK:.75,pullSpan:110,pullAt:0,
  // soft: what stands on the stage takes the focus too. A piece of the place, or a man where he is walked about, that stands far
  // from the depth the eye is at is drawn small and set down enlarged, so it is as soft as the floor at its foot (softK: how much
  // of that softness it gets; under softMin of enlarging it is left sharp; softN: things so drawn in the last frame)
  soft:true,softK:1,softMin:1.08,softN:0,softUp:'high',
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
  // fireMax: with more fire than this in play (square units) the frame is painted flat (why(), FIRE)
  fireMax:32000,
  // lampSee: a place that lists no lamps has them read off its picture (seeLamps, below): seeEvery frames apart, seeMax of them at
  // most, each reaching seeR units at seeK of a lamp's strength (seeNow: at once, for a tool's still: they are eased in otherwise)
  lampSee:true,seeEvery:4,seeMax:4,seeR:200,seeK:.2,seeNow:false,
  // lampRoom (since V119): a room's own hanging lamps (S.lamps: the dining room's, the kitchen's, the lobby's, the office's) light
  // the people and the things under them, each where it swings, flickering as it flickers and gone when it is put out (roomK: a
  // lit lamp's strength; roomR: its reach in units)
  lampRoom:true,roomK:.24,roomR:160,
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
const MAIN=cv.getContext('2d'),A=mk(),B=mk(),BL=mk(),BM=mk(),BS=mk(),SH=mk(),SQ=mk(),M1=mk(3,255),M2=mk(3,255);
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
// Three short scenes of the prologue are all fire (the fire on the lift in its shaft, the Lantern going up, the shaft alight): what
// is lit by adding light to the one picture. A light drawn among the figures falls on a clear sheet here and is laid over the plate
// plainly (README, "where it falls short"): a lamp's glow loses little by that, a wall of flame loses its heat. They stay flat.
const FIRE={shaft:1,lanternup:1,shaftfire:1};
// (and any moment with as much fire as that: the game's fires, S.fires, by their sizes. The checkpoint's burning truck is 16,000
// square units and loses under 1 of 255; fireMax is twice that)
const fireArea=()=>{let a=0;for(const f of S.fires||[])if(f)a+=(f.w||0)*(f.h||0)*(f.k==null?1:f.k);return a;};
function why(){
  if(!LY.on)return'off';
  if(LY.err)return'stopped: '+LY.err;
  if(PHOST.err||!(PHOST.mode>0))return'Phaser view off';
  if(ctx!==MAIN)return'drawn elsewhere';
  if(!cv.width||!cv.height)return'no canvas';
  const k=envKey();if(!k)return'no scene here';
  const o=finishOf();if(o==='post')return'this place finishes its own picture';
  if(S.story&&FIRE[S.story.key]||fireArea()>LY.fireMax)return'this scene is lit by its fire';
  return'';}
// THE PLATE IS NOT WIPED WHERE NOTHING LIES UNDER IT (since V119). The game never clears its canvas: each frame is painted over the
// last. A place's picture is not solid everywhere (under the office's cornice a strip holds only the cove's added light, a third
// there; the dining room has the like), and painted over itself frame after frame such a strip comes up to its full colour: the
// bright line of the cove is that. On a plate wiped each frame it stayed a third there over nothing, 240 of 255 down to 100. So the
// plate keeps the last frame, as the canvas does, wherever it is the whole picture; under bands, which show through it or go into
// it, it is wiped as before. (plateAt: the frame and the place the plate was last painted in)
let frameN=0,plateAt={f:-9,k:''};
const _render=render;
render=function(){
  if(phase>=0)return _render.apply(this,arguments);
  frameN++;
  const t0=performance.now(),w=why();LY.why=w;
  const lay=!w&&!!G&&G.w===cv.width&&G.h===cv.height;
  LAMPS=lay?lampsNow():null;bandsFrame(lay);
  if(!lay){
    if(!w){LY.need=true;LY.why='making the sheets';}LY.live=false;
    try{return _render.apply(this,arguments);}finally{LY.ms+=(performance.now()-t0-LY.ms)*.05;}}
  phase=0;evOn=false;{const k=envKey()||'';if(planes||plateAt.k!==k||plateAt.f!==frameN-1)wipe(A);plateAt={f:frameN,k};}carry(MAIN,A.g);ctx=A.g;
  try{return _render.apply(this,arguments);}
  finally{LY.live=phase===2;ctx=MAIN;phase=-1;farT=null;LY.n++;LY.ms+=(performance.now()-t0-LY.ms)*.05;}};
function toStage(){
  const a=A.g,m=a.getTransform();TR={s:m.a,tx:m.e,ty:m.f,planes:planes&&!bake&&!!PX&&!!PX.far};
  wipe(B);carry(a,B.g);ctx=B.g;phase=1;LY.plateUnlit=!!SLID.unlit;
  try{keepPlate();shapeFrame();if(LY.plateUnlit)normalsFrame();if(TR.planes){if(farN!==LY.n){farDraw(m);farT=null;}else if(BT.n!==LY.n)bandsT(m);if(PX.soft!==softNow())bandsFar();}
    focusNow();feet();softFrame();
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
{const f=sceneFinish;sceneFinish=function(){if(phase===2){try{light();seeLamps();}catch(e){LY.err=String(e&&e.message||e);}}return f.apply(this,arguments);};
// (the game's finish then runs on the top sheet, which is clear but for the sparks and the words. Its streaks cannot be made there:
// it colours them by multiplying, and over a clear sheet that lays the colour itself over the whole frame, a veil a quarter thick.
// The streaks of the plate and the stage are made in light(), below; the top's own finish goes without.)
// (Nor its dark at the edges, since V119. The game lays that under its bloom, so that a lamp or the sun at the frame's edge keeps
// its glow (env_look.js, finish); on the top sheet it lay over Phaser's bloom and took the glow down: at the foot of the title's
// frame the low sun's light was 20 to 30 of 255 short. The dark is made here the game's way and shown under the bloom: edgesMake.)
if(typeof EnvLook.finish==='function'){const f=EnvLook.finish;EnvLook.finish=function(o){
  if(phase===2&&o){try{edgesMake(o);}catch(e){LY.err=String(e&&e.message||e);}return f.call(this,Object.assign({},o,{streak:0,edges:0}));}
  return f.call(this,o);};}}
// the dark at the frame's edges (env_look.js, fnEdges: left, right and foot, a sixth of the way in, between the scene's bars), at
// half the size, painted again only when its numbers change
const EV=mk();let evKey='',evOn=false,evNew=false;
function edgesMake(o){
  const a=+o.edges,col=o.edgeCol||'#04030a';if(!(a>0)||FXL.q==='off')return;
  const W2=cv.width,H2=cv.height,lb=typeof ST_LB==='number'?cl(ST_LB,0,1):0,bar=Math.floor(H2*.105*lb),ih=H2-2*bar;if(ih<8)return;
  const w=Math.ceil(W2/2),h=Math.ceil(H2/2),y0h=Math.floor(bar/2),ihh=Math.max(1,h-2*y0h),vw=Math.ceil(w*.16),vh=Math.ceil(ihh*.16),key=[w,h,y0h,a.toFixed(3),col].join('|');
  evOn=true;if(key===evKey)return;evKey=key;evNew=true;
  if(EV.cv.width!==w||EV.cv.height!==h){EV.cv.width=w;EV.cv.height=h;}
  const g=EV.g,R=EnvLook.rgba;g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.globalAlpha=1;g.clearRect(0,0,w,h);
  const band=(x0,y0g,x1,y1g)=>{const gr=g.createLinearGradient(x0,y0g,x1,y1g);gr.addColorStop(0,R(col,a));gr.addColorStop(.4,R(col,a*.38));gr.addColorStop(1,R(col,0));return gr;};
  g.fillStyle=band(0,0,vw,0);g.fillRect(0,y0h,vw,ihh);g.fillStyle=band(w,0,w-vw,0);g.fillRect(w-vw,y0h,vw,ihh);
  g.fillStyle=band(0,y0h+ihh,0,y0h+ihh-vh);g.fillRect(0,y0h+ihh-vh,w,vh);}
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
  const h=BM.g;h.setTransform(1,0,0,1,0,0);h.globalCompositeOperation='copy';
  if(o.streak>0){
    // a set piece's streaks, the game's way (env_look.js, finish): the light smeared out sideways and coloured, under the bloom
    const c=BS.cv,s=BS.g;if(c.width!==bw||c.height!==bh){c.width=bw;c.height=bh;}
    s.setTransform(1,0,0,1,0,0);s.globalCompositeOperation='copy';s.globalAlpha=1;s.drawImage(BL.cv,0,0);s.globalCompositeOperation='lighter';
    for(const [f,a] of [[.012,.55],[.028,.36],[.055,.22],[.1,.12],[.17,.06]])for(const sg of [-1,1]){s.globalAlpha=a;s.drawImage(BL.cv,sg*f*bw,0);}
    s.globalCompositeOperation='multiply';s.globalAlpha=1;s.fillStyle=o.streakCol||'#7fb0ff';s.fillRect(0,0,bw,bh);
    h.globalAlpha=cl(o.streak,0,1);h.drawImage(c,0,0);h.globalCompositeOperation='lighter';}
  h.globalAlpha=cl(o.glow,0,1);h.drawImage(BL.cv,0,0);lightOn=true;}

// ---------- focus ----------
// Where the eye is: the depth Ilyas stands at (the first man on the stage where he is not), followed over fEase seconds of the
// game's clock. A row of the floor is as deep as the game's own projection says (prjY, sk_core.js); the floor ends at the place's far
// depth, and above that row the plate is the far wall and what stands beyond it.
// The places the focus has been set for and looked at (the rest go onto the sheets all the same, and stay sharp). Where something
// rises behind a place's far wall: the wall's height (units over the far edge of the floor), and how much further up the softness
// is all there. Over the yard's roofs it is the far side of the Pit; the restaurant has its wall and no more.
const PLACES={yard:{wall:175,top:110,pull:0},dining:{room:0},
  // (since V118: the prologue's places. A fight's wall is its set, the richest part of the picture: it stays as sharp as the floor
  // at its foot (room: 0), and only what rises beyond it goes soft, to cap of the full softness by top units over the wall's
  // height (a skyline keeps its landmarks: the tower's H is read from every street). Out of doors
  // the wall is the house fronts, the maize, the parapet; a room has its wall and no more)
  // (since V119 the road at sundown, the field and the roof have their far bands apart, each soft by its own size, BANDS: no
  // softness by rows over their walls, which blurred the roof's crown and the field's maize with the sky behind them)
  outskirts:{room:0},crops:{room:0},chase:{wall:260,top:120,room:0,cap:.5},
  highway:{wall:60,top:160,room:0,cap:.5},roadblock:{wall:20,top:160,room:0,cap:.5},street:{wall:330,top:120,room:0,cap:.5},
  kitchen:{room:0},shaft:{room:0},station:{room:0},tunnel:{room:0},lobby:{room:0},office:{room:0},gondola:{room:0},roof:{room:0}};
const focusHere=()=>Object.prototype.hasOwnProperty.call(PLACES,envKey()||'');
// the pull this frame, 0 to pullK: by how close the camera has come (LY.pull, above)
let PK=0;
function pullNow(){
  const P0=PLACES[envKey()||''],k=!LY.pull||!P0?0:P0.pull!=null?+P0.pull:1,c=(+LY.pullRef||600)/Math.max(60,cam.viewW)-1;
  LY.pullAt=k>0?cl((c-LY.pull0)/Math.max(.01,LY.pull1-LY.pull0),0,1)*k:0;PK=LY.pullAt*cl(+LY.pullK||0,0,1);}
// how soft a thing at depth x is, 0 to 1, before focusK: by its distance from the eye's depth, and by the pull
const softD=(x,dF)=>{const a=Math.abs(x-dF)-LY.f0;return a<=0?0:cl(cl(a/LY.f1,0,1)*LY.fMax+PK*cl(a/Math.max(1,LY.pullSpan),0,1),0,1);};
function focusNow(){
  let f=null;for(const g of S.F||[])if(g&&!g.gone&&!g.hidden&&g.p){f=g;break;}
  const want=f?f.dep:LY.focusAt,dt=tPrev==null?1e3:S.t-tPrev;tPrev=S.t;
  LY.focusAt=dt<0||dt>1?want:LY.focusAt+(want-LY.focusAt)*(1-Math.exp(-dt/Math.max(.01,LY.fEase)));
  pullNow();
  const s=TR.s,ty=TR.ty,H=cv.height,far=(S.arena&&S.arena.far)||DEP_MAX+40,dF=LY.focusAt;
  const ek=envKey(),P0=PLACES[ek]||null,by=!TR.planes&&P0&&P0.wall?P0:null;
  const K=cl(+LY.focusK||0,0,1);
  const key=[ek,s.toFixed(3),ty.toFixed(1),H,far,dF.toFixed(1),LY.f0,LY.f1,LY.fMax,LY.fTop,LY.fRoom,LY.fMid,K,TR.planes,PK.toFixed(3),LY.pullSpan].join('|');if(key===maskKey)return;maskKey=key;
  const i1=M1.g.createImageData(3,255),i2=M2.g.createImageData(3,255),soft=x=>softD(x,dF),yFar=(GB-PSY*far)*s+ty,mFar=soft(far),mid=cl(LY.fMid,.05,.95);
  for(let i=0;i<255;i++){const y=(i+.5)/255*H;let m;
    if(y>=yFar)m=soft((GB-(y-ty)/s)/PSY);
    else{const hgt=(yFar-y)/s,up=Math.min(P0&&P0.room!=null?P0.room:LY.fRoom,1-mFar);
      if(!by)m=mFar+up*cl(hgt/LY.fTop,0,1);
      else if(hgt<=by.wall)m=mFar+up*hgt/by.wall;
      else{const u=cl((hgt-by.wall)/by.top,0,1),cap=Math.max(mFar+up,by.cap!=null?by.cap:1);m=mFar+up+(cap-mFar-up)*u*u*(3-2*u);}}
    m*=K;
    // (the light blur comes in up to fMid, and the heavy one over it from there)
    const a1=Math.round(cl(m/mid,0,1)*255),a2=Math.round(cl((m-mid)/(1-mid),0,1)*255);
    for(let x=0;x<3;x++){const o=(i*3+x)*4;i1.data[o]=i1.data[o+1]=i1.data[o+2]=i2.data[o]=i2.data[o+1]=i2.data[o+2]=255;i1.data[o+3]=a1;i2.data[o+3]=a2;}}
  M1.g.putImageData(i1,0,0);M2.g.putImageData(i2,0,0);maskNew=true;}

// ---------- PARALLAX ----------
// A place's far bands on sheets of their own. The game paints a place's still picture whole, back to front, onto one layer
// (sceneLayer, sk_scene_glue.js). The yard's painter is open (envx/env_yard.js, "THE LAYERS") to paint its bands
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
// left, behind the woodshed and the Sump (envx/env_yard.js): the whole picture hides that, and the band shows it as it slides out.
// (since V119: the prologue's places out of doors, each painter opened the same way. rect: the bands' rectangle where it is not the
// yard's; up: the far band's top row is drawn on up over a view that looks above it, as the game does with its whole picture.
// bake: the two bands are set into the plate itself each frame, under the place's own picture, each where its own view of the world
// puts it (bandsBake): the plate is then whole, as the game's own picture is, and whatever the place lays over its picture as it
// moves (a searchlight's beam, cloud lit from below, the sun's own glow) is added to a painted sky and not to a clear sheet. Their
// softness is then the plate's own, by rows (PLACES). The yard's bands stay on sheets of their own under the plate, as built.)
const BANDS={yard:{x0:470,y0:262,w0:820,top:-470,far:[.2,.65],mid:[.72,.88]}};
// The road at sundown (envx/env_outskirts.js): the sky with its hills and the Sprawl, then the valley, then the rise. The painter
// says how much of the camera's going each band follows (bandK) and paints each drawn in by as much; the bands stand on the horizon
{const X=EnvLook.S.outskirts,K=X&&X.bandK;if(K&&X.bands)BANDS.outskirts={x0:K.x0,y0:X.HOR+2,w0:346,top:-4000,far:[K.far,.8],mid:[K.mid,.93],rect:{x0:-160,y0:-100,w:W+410,h:530},up:true,bake:true};}
// The field (envx/env_crops.js): the night sky with the city and its tower, the land before the city, then the clearing and the crop
// along its back. The camera here follows a fight: the bands stand as painted where it most often is
{const X=EnvLook.S.crops;if(X&&X.bands)BANDS.crops={x0:560,y0:X.HOR+5,w0:696,top:-4000,far:[.6,.65],mid:[.82,.85],rect:{x0:-160,y0:-110,w:W+400,h:X.cropY()+50+110},up:true,bake:true};}
// The roof (envx/env_roof.js): the night sky and the city at the horizon, then the roof. No middle band
{const X=EnvLook.S.roof;if(X&&X.bands&&X.LAYOUT)BANDS.roof={x0:560,y0:X.LAYOUT.horizon,w0:700,top:-4000,far:[.55,.6],mid:[1,1],rect:{x0:-160,y0:-110,w:W+400,h:X.LAYOUT.horizon+62+110},up:true,bake:true};}
// The office (envx/env_office.js): the night city through its wall of glass, far below and far off: it hardly follows the camera,
// so it slides behind the mullions as the fight goes along the room. Its rectangle is the glass and the room the painter gives round it
{const X=EnvLook.S.office,Wn=X&&X.bands&&X.win&&X.win();if(Wn)BANDS.office={x0:520,y0:Wn.y1-30,w0:700,top:-4000,far:[.4,.72],mid:[1,1],
  rect:{x0:Wn.x0-Wn.m.l,y0:Wn.y0-Wn.m.t,w:Wn.x1-Wn.x0+Wn.m.l,h:Wn.y1-Wn.y0+Wn.m.t+Wn.m.b},clip:[Wn.x0,Wn.y0,Wn.x1,Wn.y1],bake:true,size:[.7,.5]};}
// The lobby (envx/env_lobby.js): the night city in its two windows, the same way
{const X=EnvLook.S.lobby,Wn=X&&X.bands&&X.wins&&X.wins();if(Wn){const A0=Wn.a,B1=Wn.b,M=Wn.m;BANDS.lobby={x0:500,y0:A0.y0+(A0.y1-A0.y0)*.6,w0:700,top:-4000,far:[.4,.72],mid:[1,1],
  rect:{x0:A0.x0-M.x,y0:A0.y0-M.t,w:B1.x1-A0.x0+2*M.x,h:A0.y1-A0.y0+M.t+M.b},clip:[[A0.x0,A0.y0,A0.x1,A0.y1],[B1.x0,B1.y0,B1.x1,B1.y1]],bake:true,size:[.7,.5]};}}
// (the far bands' rectangle in the world: as wide as the yard's backdrop is painted, and from just over the layer's top to 342,
// where the backdrop's own haze ends, well under the lowest roof)
const RECT_YARD={x0:-170,y0:-110,w:W+420,h:452};let RECT=RECT_YARD;
const bandBlur=i=>{const B0=PX&&BANDS[PX.k],b=B0&&B0.blur;return b?b[i]:i?LY.blurMid:LY.blurFar;};
const SLID=globalThis.__lyp={far:null,mid:null,end:null,ext:true,unlit:false,own:0};
let planes=false,bake=false,PX=null,farT=null;
const FAR=mk(4,4),BT={n:-1,far:{r:1,tx:0,ty:0},mid:{r:1,tx:0,ty:0}};
const bandsHere=()=>{const k=envKey(),X=k&&EnvLook.S[k];return!!(X&&X.bands&&BANDS[k]&&typeof X.paint==='function');};
const layerDrop=()=>{if(typeof SCENE_LY!=='undefined'&&SCENE_LY&&SCENE_LY.lyNear){SCENE_LY.cv.width=SCENE_LY.cv.height=0;SCENE_LY=null;}};
// before each frame: are the bands used in it
function bandsFrame(lay){
  planes=lay&&LY.parallax&&bandsHere();bake=false;if(planes){const B0=BANDS[envKey()];RECT=B0.rect||RECT_YARD;bake=!!B0.bake;}
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
// ---------- the stage in focus ----------
// The plate goes soft by rows. What stands on the stage is one sheet and stayed sharp: a barrel by the far wall was crisp against a
// wall gone soft behind it. So a thing that stands far from the eye's depth is drawn on a small sheet of its own, at one part in F
// of its size, and set down on the stage enlarged F times: the enlarging is its softness, and F follows the floor's softness at
// the thing's own depth (the light blur's reach up to fMid, the heavy one's from there), so it changes as smoothly as he walks.
// This is done for the place's pieces (each with what moves on it: the pump's handle, a fire's smoke) and for a man's own
// picture where he is walked about; in a fight every man stays sharp.
// Each soft thing keeps its small sheet from frame to frame, no bigger than the thing: a sheet shared by them all had to be
// copied whole each time one was set down from it. Where a thing falls on the stage is told by the painter's own calls (the
// piece set down, a glow, smoke, a gate, a bird: envx/env_yard.js), with room round a piece for what moves on it. It is noted
// the first time the thing is drawn, sharp, and kept in the place's own units; a thing that tells nothing stays sharp. A piece
// drawn at under half its size is taken from a copy of it made that small once (T.mp), so nothing has to be shrunk far.
const softAt=d=>softD(d,LY.focusAt)*cl(+LY.focusK||0,0,1);
function softF(d){const m=softAt(d),mid=cl(LY.fMid,.05,.95),r=m<mid?LY.blur1*m/mid:LY.blur1+(LY.blur2-LY.blur1)*(m-mid)/(1-mid),F=1+r*DPR*(+LY.softK||0);
  return F>=LY.softMin?Math.min(F,16):0;}
// SCS: the pieces' small sheets, by the piece's place in the painter's list; SCF: the men's, by their turn in the frame. PB: each
// piece's box in the place's units (0: it tells none). While a thing is drawn: SCg its context, scQ its scale there, (scX, scY)
// the stage's pixel at the sheet's corner, BX its box on the stage as told so far
const SCS=[],SCF=[],PB=[];let scF=0,scQ=1,scX=0,scY=0,SCg=null,BX=null,softOn=false;
function softFrame(){softOn=!!(LY.soft&&LY.focus&&focusHere());LY.softN=0;scF=0;}
const cls=n=>Math.max(64,Math.ceil((n+4)/64)*64);
function sheet(A0,i,w,h){let o=A0[i];if(!o)o=A0[i]=mk(64,64);const W=cls(w),H=cls(h);
  if(o.cv.width<W||o.cv.width>W*3)o.cv.width=W;if(o.cv.height<H||o.cv.height>H*3)o.cv.height=H;
  o.g.setTransform(1,0,0,1,0,0);o.g.globalAlpha=1;o.g.globalCompositeOperation='source-over';o.g.clearRect(0,0,o.cv.width,o.cv.height);return o;}
const grow=(x0,y0,x1,y1)=>{const b=BX;if(x0>x1){const t=x0;x0=x1;x1=t;}if(y0>y1){const t=y0;y0=y1;y1=t;}if(x0<b[0])b[0]=x0;if(y0<b[1])b[1]=y0;if(x1>b[2])b[2]=x1;if(y1>b[3])b[3]=y1;};
// (a box in the units the painter is drawing in, to the stage's pixels)
function growC(c,x0,y0,x1,y1){const m=c.getTransform(),k=1/scQ;grow((m.a*x0+m.e)*k+scX,(m.d*y0+m.f)*k+scY,(m.a*x1+m.e)*k+scX,(m.d*y1+m.f)*k+scY);}
// (i: the thing's sheet and its place in PB; box: where it falls, in the place's units, where that is known without asking)
function softDraw(i,d,run,box){
  const st=B.g,p=box||PB[i];if(i==null||p===0)return false;
  const m=st.getTransform(),told=()=>{const b=BX;BX=null;SCg=null;scQ=1;scX=scY=0;if(!box)PB[i]=b[2]>b[0]&&b[3]>b[1]?[(b[0]-m.e)/m.a,(b[1]-m.f)/m.d,(b[2]-m.e)/m.a,(b[3]-m.f)/m.d]:p||0;};
  // (the first time: as ever, with its box noted)
  if(!p){BX=[1e9,1e9,-1e9,-1e9];SCg=st;try{run();}finally{told();}return true;}
  const F=softF(d);if(!F)return false;
  const pad=F+3,x0=Math.max(0,Math.floor(p[0]*m.a+m.e-pad)),y0=Math.max(0,Math.floor(p[1]*m.d+m.f-pad)),x1=Math.min(cv.width,Math.ceil(p[2]*m.a+m.e+pad)),y1=Math.min(cv.height,Math.ceil(p[3]*m.d+m.f+pad));
  if(x1<=x0||y1<=y0)return false;
  const q=1/F,sw=Math.ceil((x1-x0)*q),sh=Math.ceil((y1-y0)*q),o=sheet(SCS,i,sw,sh),g=o.g;
  carry(st,g);g.setTransform(m.a*q,m.b*q,m.c*q,m.d*q,(m.e-x0)*q,(m.f-y0)*q);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='low';
  scQ=q;scX=x0;scY=y0;SCg=g;BX=[1e9,1e9,-1e9,-1e9];ctx=g;
  try{run();}finally{ctx=st;told();}
  st.save();st.setTransform(1,0,0,1,0,0);st.globalAlpha=1;st.globalCompositeOperation='source-over';st.imageSmoothingEnabled=true;st.imageSmoothingQuality=LY.softUp;
  st.drawImage(o.cv,0,0,sw,sh,x0,y0,sw*F,sh*F);st.restore();LY.softN++;return true;}
{const f=drawEnvItem;drawEnvItem=function(it){
  if(phase!==1||ctx!==B.g||!softOn||!it)return f.apply(this,arguments);
  let r;const run=()=>{r=f.call(this,it);};
  if(it.pitPiece){if(!it.pitPiece.sharp&&softDraw(it.lyI,it.d,run))return r;}
  // (the yard's bucket where it stands on the floor, with the pump's stream over it: sk_pit2ui.js)
  else if(it.act1b==='bucket'&&it.at&&!it.at.hand){const a=it.at,x=a.x+a.d*PSX,y=a.y-a.d*PSY;if(softDraw(63,a.d,run,[x-18,y-(a.spout?60:30),x+18,y+8]))return r;}
  // (since V119: a room's furniture, by the box the game keeps for it, with room round that for its shadow and what stands on it)
  else if(it.prop&&it.prop.box&&!it.prop.broken){const P0=it.prop,b=P0.box,d=it.d,ox=d*PSX,oy=d*PSY,i=S.props?S.props.indexOf(P0):-1;
    if(i>=0&&i<60&&b.r>b.l&&softDraw(100+i,d,run,[b.l+ox-16,Math.min(b.t,b.b)-oy-22,b.r+ox+16,Math.max(b.t,b.b)-oy+10]))return r;}
  return f.apply(this,arguments);};}
// (each piece's place in the painter's list, which does not change as the list is sorted by depth)
{const f=envItems;envItems=function(items){const r=f.apply(this,arguments);if(items&&items.length){let k=0;for(const it of items)if(it&&it.pitPiece)it.lyI=k++;}return r;};}
// What the painter and the light module call (envx/env_yard.js, sk_lightui.js). box(c, x0, y0, x1, y1): the painter is about to draw within
// this box of c. pieceDraw(c, T): a piece is about to be set down on c; true says it was set down here, from its small copy.
// put(f, R): the light module is about to set a man's own picture down; true says it was set down here, soft
SLID.box=function(c,x0,y0,x1,y1){if(BX&&c===SCg)growC(c,x0,y0,x1,y1);};
SLID.pieceDraw=function(c,T){
  if(!BX||c!==SCg||scQ>=1)return false;
  const m=c.getTransform(),r=Math.abs(m.a)*T.w/T.cv.width;if(!(r<.5))return false;
  let k=Math.min(4,Math.floor(Math.log2(1/r)));const M=T.mp||(T.mp=[]);
  for(let j=M.length;j<k;j++){const s0=j?M[j-1]:T.cv,w=Math.ceil(s0.width/2),h=Math.ceil(s0.height/2);if(w<6||h<6){k=j;break;}const o=mk(w,h);o.g.imageSmoothingEnabled=true;o.g.drawImage(s0,0,0,w,h);M.push(o.cv);}
  if(k<1)return false;c.drawImage(M[k-1],T.x,T.y,T.w,T.h);return true;};
SLID.put=function(f,R){
  if(phase!==1||ctx!==B.g||!softOn||!R||!R.cv||!(R.w>0)||!(R.h>0)||!(typeof exOn==='function'&&exOn()))return false;
  const F=softF(f.dep);if(!F)return false;
  const q=1/F,x0=Math.max(0,Math.floor(R.x)),y0=Math.max(0,Math.floor(R.y)),x1=Math.min(cv.width,Math.ceil(R.x+R.w)),y1=Math.min(cv.height,Math.ceil(R.y+R.h));
  if(x1<=x0||y1<=y0)return false;
  const sw=Math.ceil((x1-x0)*q)+1,sh=Math.ceil((y1-y0)*q)+1,o=sheet(SCF,scF++,sw,sh),g=o.g;g.imageSmoothingEnabled=true;g.imageSmoothingQuality='medium';
  g.drawImage(R.cv,0,0,R.w,R.h,(R.x-x0)*q,(R.y-y0)*q,R.w*q,R.h*q);
  const st=B.g;st.imageSmoothingEnabled=true;st.imageSmoothingQuality=LY.softUp;st.drawImage(o.cv,0,0,sw,sh,x0,y0,sw*F,sh*F);LY.softN++;return true;};

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
// what the yard's painter calls (envx/env_yard.js). piece(c, T): a piece has just been set down on c; on the stage, its map goes
// down on the sheet of facings at the same place. glowK(c, x, y): how much of a painted glow at (x, y) to paint, where the lamps
// are about to multiply it: a lamp's own halo is then as bright as its painter meant, not brighter by the lamp's own light
SLID.piece=function(c,T){
  // (on the small sheet: the piece's box, with room round it for what moves on it, and above it most)
  const sm=BX&&c===SCg;if(sm)growC(c,T.x-.25*T.w-20,T.y-.35*T.h-24,T.x+T.w+.25*T.w+20,T.y+T.h+.1*T.h+10);
  if(phase!==1||!(sm||c===B.g)||!shapeOn)return;
  const N=T.nm;if(N===undefined){T.nm=null;NMQ.push(T);return;}if(!N)return;
  const k=sm?1/scQ:1,m0=c.getTransform(),m={a:m0.a*k,b:m0.b*k,c:m0.c*k,d:m0.d*k,e:m0.e*k+(sm?scX:0),f:m0.f*k+(sm?scY:0)},qx=NB.cv.width/cv.width,qy=NB.cv.height/cv.height,g=NB.g;
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
SLID.glowK=function(c,x,y,r,sq){
  const sm=BX&&c===SCg;if(sm&&r>0)growC(c,x-r,y-r*(sq||1),x+r,y+r*(sq||1));
  // (own: the painter is at the glow of something lit from within, which is turned away from every lamp)
  const L=LAMPS;if(!L||!L.length||!LY.lamps||SLID.own||!(phase===1?sm||c===B.g:phase===0&&c===A.g&&SLID.unlit))return 1;
  const m=c.getTransform(),k=sm?1/scQ:1,wx=((m.a*x+m.c*y+m.e)*k+(sm?scX:0)-TR.tx)/TR.s,wy=((m.b*x+m.d*y+m.f)*k+(sm?scY:0)-TR.ty)/TR.s;let C=0;
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
// What the yard's painter asks for (envx/env_yard.js). far(c): the far band's sheet, cleared, with the still far band laid on it
// under the band's own view, for the painter to draw the far wall's moving things on (nothing where the bands are not apart: it
// then draws them on the plate as ever, inside its skyline). While it does, the camera's top is the band's own, so that the
// picture above the layer and the tram are drawn as far up as this band's view reaches. end(): those are down. mid(c): the middle
// band's view, laid on a context that holds the frame's own.
let farN=-1;
SLID.far=function(c0){
  if(!planes||bake||phase!==0||!PX||!PX.far)return null;
  const m=c0.getTransform();if(m.b||m.c||!(m.a>0))return null;
  return farDraw(m);};
function farDraw(m){
  bandsT(m);farN=LY.n;
  // (blurred, a part of the canvas is plenty: small enough that the blur costs little, and no smaller than the blur's reach can
  // hide; sharp, all of it, or half where the screen is dense enough to carry that)
  const reach=PX.soft?bandBlur(0)*cl(+LY.focusK||0,0,1):0,need=reach>0?1.8/(reach*DPR):9,f=!PX.soft?(DPR>=2.5?.5:1):need<=.26?.25:need<=.34?1/3:need<=.51?.5:1;
  const w=Math.max(8,Math.ceil(cv.width*f)),h=Math.max(8,Math.ceil(cv.height*f));
  if(FAR.cv.width!==w||FAR.cv.height!==h){FAR.cv.width=w;FAR.cv.height=h;}
  const g=FAR.g,o=BT.far,kx=w/cv.width,ky=h/cv.height;
  g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,w,h);
  g.setTransform(kx*m.a*o.r,0,0,ky*m.d*o.r,kx*(m.a*o.tx+m.e),ky*(m.d*o.ty+m.f));g.imageSmoothingEnabled=true;
  g.drawImage(PX.far.cv,RECT.x0,RECT.y0,RECT.w,RECT.h);
  upFill(g,m,o);
  farT=(cam.T-o.ty)/o.r;return g;}
SLID.end=function(){farT=null;};
// a view that looks above the far band: its top row drawn on up, as the game fills the sky over its whole picture (sceneTopFill),
// from the top of the game's own layer, RC: what the band holds above that is not in the game's picture. g holds the band's view
// (the band's row there, taken as 32 means across it, as the game takes a layer's top (sceneTopOf): one star in that row drawn on
// up as it is would run up the frame as a line)
function upRow(){const F=PX.far;if(F.up)return F.up;
  const y1=Math.max(RECT.y0,RC.y0),w=F.cv.width,h=Math.max(1,Math.round(2*F.q)),t=mk(w,h),u=mk(32,1);
  t.g.drawImage(F.cv,0,Math.min(F.cv.height-h,Math.max(0,Math.round((y1-RECT.y0)*F.q))),w,h,0,0,w,h);
  const d=t.g.getImageData(0,0,w,h).data,o=u.g.createImageData(32,1);
  for(let i=0;i<32;i++){const x0=Math.floor(i*w/32),x1=Math.max(x0+1,Math.floor((i+1)*w/32));let r=0,g=0,b=0,al=0;
    for(let y=0;y<h;y++)for(let x=x0;x<x1;x++){const j=(y*w+x)*4,q=d[j+3];r+=d[j]*q;g+=d[j+1]*q;b+=d[j+2]*q;al+=q;}
    o.data[i*4]=al?r/al:0;o.data[i*4+1]=al?g/al:0;o.data[i*4+2]=al?b/al:0;o.data[i*4+3]=al/((x1-x0)*h);}
  u.g.putImageData(o,0,0);t.cv.width=t.cv.height=0;return F.up=u.cv;}
function upFill(g,m,o){if(!BANDS[PX.k].up)return;const yT=-(m.d*o.ty+m.f)/(m.d*o.r)-2,y1=Math.max(RECT.y0,RC.y0);
  if(yT<y1){const sm=g.imageSmoothingEnabled;g.imageSmoothingEnabled=true;g.drawImage(upRow(),0,0,32,1,RECT.x0,yT,RECT.w,y1-yT+.6);g.imageSmoothingEnabled=sm;}}
// THE BANDS SET INTO THE PLATE (bake). Once the game has laid the place's own picture on the plate (sceneDraw: here that picture is
// the place without its far bands, clear where they show), the middle band and then the far one go in under it, each under its own
// view. From there on the frame is painted as the game paints it: what moves in the place is drawn over a whole picture.
function bandsBake(){
  const a=A.g,m=a.getTransform();if(m.b||m.c||!(m.a>0)||!PX||!PX.far)return;
  bandsT(m);a.save();a.globalAlpha=1;a.globalCompositeOperation='destination-over';a.imageSmoothingEnabled=true;
  // (clip: a room's bands show through its glass alone, not through whatever else of its wall is not solid)
  {const C=BANDS[PX.k].clip;if(C){a.beginPath();for(const q of (typeof C[0]==='number'?[C]:C))a.rect(q[0],q[1],q[2]-q[0],q[3]-q[1]);a.clip();}}
  for(const b of ['mid','far']){const o=BT[b],I=PX[b];if(!I||!I.cv.width)continue;
    a.setTransform(m.a*o.r,0,0,m.d*o.r,m.a*o.tx+m.e,m.d*o.ty+m.f);a.drawImage(I.cv,RECT.x0,RECT.y0,RECT.w,RECT.h);if(b==='far')upFill(a,m,o);}
  a.restore();}
{const f=sceneDraw;sceneDraw=function(){const r=f.apply(this,arguments);if(phase===0&&planes&&bake&&ctx===A.g){try{bandsBake();under();}catch(e){LY.err='bake: '+String(e&&e.message||e);}}return r;};}
// (a baked place whose picture is not solid: the last frame's plate goes in under this frame's, so that a strip of added light
// comes up to its full colour over the frames as it does on the game's own canvas. P0: that plate, kept at toStage)
const P0=mk();let p0At=-9;
function under(){
  const L=PX&&PX.L;if(!L||!L.leak||p0At!==frameN-1||P0.cv.width!==A.cv.width||P0.cv.height!==A.cv.height)return;
  const a=A.g;a.save();a.setTransform(1,0,0,1,0,0);a.globalAlpha=1;a.globalCompositeOperation='destination-over';a.drawImage(P0.cv,0,0);a.restore();}
function keepPlate(){
  const L=PX&&PX.L;if(!planes||!bake||!L||!L.leak)return;
  if(P0.cv.width!==A.cv.width||P0.cv.height!==A.cv.height){P0.cv.width=A.cv.width;P0.cv.height=A.cv.height;}
  P0.g.globalCompositeOperation='copy';P0.g.drawImage(A.cv,0,0);p0At=frameN;}
// what a painter whose bands are baked asks (envx/env_outskirts.js, env_crops.js): banded(): are the bands in the plate at their own
// views this frame; farOn(c), mid(c): the far band's view, the middle band's, laid on a context that holds the frame's own
SLID.banded=function(){return!!(planes&&bake&&phase===0&&PX&&BT.n===LY.n);};
SLID.farOn=function(c){if(SLID.banded()){const o=BT.far;c.translate(o.tx,o.ty);c.scale(o.r,o.r);return true;}return false;};
SLID.mid=function(c){if(planes&&phase===0&&PX&&BT.n===LY.n){const o=BT.mid;c.translate(o.tx,o.ty);c.scale(o.r,o.r);}};
// (where a point of the middle band stands on the plate this frame)
SLID.midAt=function(x,y){if(planes&&PX&&BT.n===LY.n){const o=BT.mid;return[o.r*x+o.tx,o.r*y+o.ty];}return[x,y];};
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
// (full: the baked places, since V119. Keeping a band by its own picture takes a part-clear pixel down again by as much as it is
// clear: an edge thins, and a strip that holds a third of a light is left with a ninth. So the picture it is kept by is first laid
// over itself four times, which brings whatever is there at all up toward solid, and leaves clear what is clear)
function keepOnly(c,M,full){if(full){plain(M.g);for(let i=0;i<4;i++)M.g.drawImage(M.cv,0,0);}
  plain(c);c.globalCompositeOperation='destination-in';c.drawImage(M.cv,0,0);c.globalCompositeOperation='source-over';M.cv.width=M.cv.height=0;}
function bandsMake(k,L){
  const X=EnvLook.S[k],sc=L.sc,c=L.cv.getContext('2d'),t0=performance.now(),world=()=>c.setTransform(sc,0,0,sc,-RC.x0*sc,-RC.y0*sc);
  // (above its top the game fills a tall view with the top row's colours as it measured them on the whole picture, and the
  // picture above the layer goes over that. Here that picture is on the far band's sheet, under the plate: no fill)
  // (is the game's whole picture solid everywhere? Where it is not, a room with a strip that holds only added light, the plate
  // has to keep the last frame under it as the game's canvas does: leak, and under() below)
  if(BANDS[k].bake&&L.leak==null){L.leak=false;try{const n=512,m=mk(n,n);m.g.imageSmoothingEnabled=false;m.g.drawImage(L.cv,0,0,n,n);const d=m.g.getImageData(0,0,n,n).data;let q=0;for(let i=3;i<d.length;i+=4)if(d[i]>10&&d[i]<235)q++;L.leak=q>n*n*.0004;m.cv.width=m.cv.height=0;}catch(e){/* unread: taken for solid */}}
  L.lyNear=true;L.row=null;
  // (a place whose bands go into the plate: nothing is filled over a view that looks above the layer. The layer's top rows hold
  // only what of the place itself reaches that high, the roof's crown and its mast, and run on up they are streaks; the far band's
  // own top row is run on up there instead, upFill)
  if(BANDS[k].bake)L.row={even:true,col:'rgba(0,0,0,0)'};
  plain(c);c.clearRect(0,0,L.cv.width,L.cv.height);world();X.paint(c,'near');
  // (the yard's painter lays some things over its light: the things along the walls again, what grows. As in the whole picture:
  // the light, then those, then the place's key light over it all; and the band keeps what either painting covered)
  const M=mk(L.cv.width,L.cv.height);M.g.drawImage(L.cv,0,0);M.g.setTransform(sc,0,0,sc,-RC.x0*sc,-RC.y0*sc);X.paint(M.g,'over');
  plain(c);world();X.paint(c,'light');X.paint(c,'over');if(!X.setLive){const G0=setOf(k);if(G0)setDraw(c,G0,RC.x0,RC.w);}keepOnly(c,M,!!BANDS[k].bake);world();
  for(const b of PX?[PX.far,PX.mid]:[])if(b)b.cv.width=b.cv.height=0;
  PX={k,L,soft:null,far:null,mid:null,up:false,ms:0};bandsFar();PX.ms=performance.now()-t0;}
// (a night sky that goes to black at its top is lifted toward a deep blue there: sceneNightLift, sk_scene_glue.js, which does it to
// the game's whole picture from the top of its layer; here to the far band alone, which holds that sky)
function nightLift(c,cn,q){try{const yr=Math.max(0,Math.round((RC.y0-RECT.y0)*q)),d=c.getImageData(0,yr,cn.width,Math.max(1,Math.round(3*q))).data;let R=0,G=0,B=0,n=0;
    for(let i=0;i<d.length;i+=36){R+=d[i];G+=d[i+1];B+=d[i+2];n++;}if(!n)return;
    const a=[[10,R],[13,G],[28,B]].map(([t,v])=>Math.max(0,Math.round(t-v/n)));if(a[0]+a[1]+a[2]<4)return;
    c.save();c.globalCompositeOperation='lighter';const g=c.createLinearGradient(0,RC.y0,0,RC.y0+240);g.addColorStop(0,`rgba(${a.join(',')},1)`);g.addColorStop(1,`rgba(${a.join(',')},0)`);
    c.fillStyle=g;c.fillRect(RECT.x0,RECT.y0,RECT.w,RC.y0+240-RECT.y0);c.restore();}catch(e){/* a canvas that cannot be read: no lift */}}
// the two far bands: small where the focus will blur them anyway (a quarter and a half of the layer's scale at full focus, a
// third and a half at a lighter one: smaller than that and the blur no longer hides the sheet's own grain), near the layer's
// own scale where it is off and they must be as sharp as the whole picture was. softNow: 0 sharp, 1 lightly blurred, 2 fully.
const softNow=()=>LY.focus&&focusHere()?(cl(+LY.focusK||0,0,1)>.75?2:1):0;
function bandsFar(){
  const k=PX.k,X=EnvLook.S[k],soft=BANDS[PX.k].bake?0:softNow(),sc=PX.L.sc,R=RECT;
  const one=(which,q,cut)=>{const cn=mk(Math.ceil(R.w*q),Math.ceil(R.h*q)),c=cn.g,world=()=>c.setTransform(q,0,0,q,-R.x0*q,-R.y0*q);
    world();X.paint(c,which);let M=null;if(cut){M=mk(cn.cv.width,cn.cv.height);M.g.drawImage(cn.cv,0,0);}
    // (the far bands keep the painter's own lamplight: Phaser's lamps do not reach them)
    plain(c);world();{const u=SLID.unlit;SLID.unlit=false;try{bandLight(k,c,R.x0,R.w);}finally{SLID.unlit=u;}}if(M)keepOnly(c,M,!!BANDS[k].bake);
    if(which==='far'&&BANDS[k].up&&typeof SCENE_NIGHT!=='undefined'&&SCENE_NIGHT[k]){plain(c);world();nightLift(c,cn.cv,q);}return{cv:cn.cv,q};};
  for(const b of [PX.far,PX.mid])if(b)b.cv.width=b.cv.height=0;
  // (a place whose bands are less soft than the yard's keeps them larger: a band a point soft at half the layer's scale)
  const B0=BANDS[k],own=!!B0.blur,qf=!soft?.75:!own?[.75,1/3,1/4][soft]:B0.blur[0]>=2?1/4:B0.blur[0]>=1.2?1/3:B0.blur[0]>=.6?1/2:.75,qm=!soft||(own&&B0.blur[1]<.6)?.75:1/2;
  // (a band that goes into the plate is soft by its size: painted small and set down enlarged, the far one more than the middle
  // one. B0.size: their sizes as parts of the layer's own scale)
  const zs=B0.bake?(B0.size||[.55,.7]):[qf,qm];
  PX.far=one('far',sc*zs[0],false);PX.mid=one('mid',sc*zs[1],true);PX.soft=soft;PX.up=true;}

// ---------- dust ----------
// Where the air has something in it: the yard, by the Pit's hour (AIR), and the places listed in AIRS (since V118), each with
// its own colours. Nothing moves where motion is reduced (the motes stand still, no puffs).
const still=()=>typeof reduceMotion!=='undefined'&&reduceMotion;
// (a band painted drawn in toward where it is held, for its sliding (the ride's sky, envx/env_outskirts.js), is painted as the
// picture has it where nothing slides: with motion reduced the tower else stood a third of the view off its place at the ride's
// end. flatBands set by hand: the same, for the check of the bands against the flat picture)
{let own=false;Object.defineProperty(SLID,'flatBands',{get:()=>own||still(),set:v=>{own=!!v;},configurable:true});}
// the dust's colour and the motes', and how much of them shows, by the Pit's time of day (S.act1). Soot and dry earth: no gold.
function tod(){const a=S.act1;return!a?'day':a.night?'night':a.morning?'morning':a.dusk?'dusk':'day';}
const AIR={day:{dust:0xb7a58b,mote:0xe9dcc4,k:1},morning:{dust:0x9aa3b4,mote:0xd3dbe8,k:.9},dusk:{dust:0xa8846c,mote:0xe2b79a,k:.8},night:{dust:0x55525e,mote:0x8088a8,k:.3}};
// The air of the other places, where the game's own light module puts none of this (sk_lightui.js, SC: it has motes in the rooms,
// on the road at sundown and underground, rain and mist in the streets, fireflies in the fields). dust: the colour of what a foot
// raises (puffs: false where the ground is stone, tile or boards); mote: the motes' colour (motes: false where the game has its
// own); k: how much shows. A place not listed is left as the game has it.
const AIRS={
  outskirts:{dust:0xc7a076,mote:0xffd9a6,k:1,motes:false},   // the road at sundown: a foot or a wheel's dust (its motes are the game's)
  crops:{dust:0x8a8266,mote:0xc9cfb6,k:.6,motes:false}};     // the field: dry earth between the rows
const airNow=()=>{const k=envKey()||'';return k==='yard'?AIR[tod()]:AIRS[k]||(LY.dustAll?AIR.day:null);};
const dusty=()=>!!airNow();
// a footfall: a foot that was off the floor and is down again. Read inside render(), where the joints are the ones being drawn.
const FEET=new WeakMap(),PUFFS=[];let puffN=0;
let puffKey='';
function feet(){
  // (another place, or another play of this one: its dust does not come along)
  const key=(S.story?S.story.key:'-')+'|'+envKey();if(key!==puffKey){puffKey=key;PUFFS.length=0;}
  const AK=airNow();if(!LY.dust||!AK||AK.puffs===false||still())return;
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
  for(const o of [G.plate,G.soft1,G.soft2,G.stage,G.bloom,G.back,G.front,G.far,G.mid,G.edges])try{if(o)o.destroy();}catch(e){/* gone with its scene */}G=null;}
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
  {const up=G.w/FAR.cv.width,r=PX.soft?bandBlur(0)*K*dpr/(1.9*up):0;G.far.setScale(up,G.h/FAR.cv.height);G.far.bl.setActive(r>.02);G.far.bl.x=G.far.bl.y=r;}
  {const o=BT.mid,b=PX.mid,up=s*o.r/b.q,r=PX.soft?bandBlur(1)*K*dpr/(1.9*up):0;
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
  G={w,h,sc,plate,soft1,soft2,back,stage,front,bloom,edges:null,edgesWH:'',motes:[],puffs:[],lamps:[],lit:false,seen:-1};maskKey='';evKey='';
  const mote=(i,fr)=>{const im=sc.add.image(0,0,'lyDot').setBlendMode(Phaser.BlendModes.ADD).setVisible(false);(fr?front:back).add(im);
    return{im,fr,x:hs(i*7+1),y:hs(i*7+2),ph:hs(i*7+3)*6.283,v:.5+hs(i*7+6),r:fr?4+hs(i*7+4)*5:.9+hs(i*7+4)*1,a:fr?.07+hs(i*7+5)*.08:.22+hs(i*7+5)*.28,p:fr?1.35+hs(i*7+4)*.5:.82+hs(i*7+4)*.14};};
  for(let i=0;i<LY.motesBack;i++)G.motes.push(mote(i,false));for(let i=0;i<LY.motesFront;i++)G.motes.push(mote(1000+i,true));}
function dust(){
  const K=airNow()||AIR.day,on=LY.dust&&dusty(),s=TR.s,t=still()?0:S.t,VW=G.w/s,L=-TR.tx/s,span=VW+120,yG=GB-PSY*LY.focusAt;
  for(const m of G.motes){if(!on||!(LY.moteA>0)||K.motes===false){m.im.setVisible(false);continue;}
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
// a wall, a large one lights all alike) and how strong it is (EnvLook.S[k].lampsAt(t, still): the yard's, envx/env_yard.js; a place
// without one has its lamps read off its picture, seeLamps below). The air is left white, so whatever no lamp reaches is as it was painted.
// A light multiplies what it falls on. So the plate under the lamps is painted without its own lamplight (__lyp.unlit, above),
// and both sheets carry a map of which way their surfaces face: the plate's from the place's painter (normalsFrame), the stage's
// from the pieces' outlines (shapeFrame). A lamp's flicker is the game's clock's, never the dice, and with motion reduced it
// burns steady. (README, "The lamps".)
// THE LAMPS OF A PLACE THAT LISTS NONE (since V118): read off its own picture. Every place but the yard paints its lamplight
// into its picture and says nothing of where its lamps are. So the plate is looked at, a sixteenth the size, every seeEvery frames:
// its brightest spots that are small enough to be a lamp, a fire or a low sun, and not a lit sky or a pale wall, are taken for
// lights, kept by their place in the world (so a lamp is the same lamp as the camera moves) and eased in and out over half a
// second. They light the stage alone: the plate keeps the light its painter gave it. seeK: their strength; seeR: their reach, in
// units; seeMax: how many. What is seen is the picture's own, never the dice, and the game reads none of it.
// (the road at sundown: its one light is the sun behind him, and he stands dark against it. And only the places that have been
// looked at with their seen lamps on: those with a focus set, PLACES. Act I's rooms and the lab's grounds are not among them yet)
const NOSEE={outskirts:1};
const LM={cv:document.createElement('canvas'),g:null},SEEN=[];let seenKey='',seenN=0,seenT=null;
function seeLamps(){
  const k=envKey()||'',X=k&&EnvLook.S[k];if(k!==seenKey){seenKey=k;SEEN.length=0;seenN=0;}
  if(!LY.lamps||!LY.lampSee||!X||typeof X.lampsAt==='function'||NOSEE[k]||!focusHere()){SEEN.length=0;return;}
  if(seenN++%Math.max(1,LY.seeEvery|0))return;
  const w=Math.max(16,Math.round(cv.width/16)),h=Math.max(16,Math.round(cv.height/16)),c=LM.cv;if(c.width!==w||c.height!==h||!LM.g){c.width=w;c.height=h;LM.g=c.getContext('2d',{willReadFrequently:true});}
  const g=LM.g;g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='copy';g.imageSmoothingEnabled=true;g.drawImage(A.cv,0,0,w,h);
  const d=g.getImageData(0,0,w,h).data,n=w*h,v=new Float32Array(n);let lit=0;
  // (a cell's light: how far its lightness stands over a middling one; a picture an eighth of which is light, a day or a sunset,
  // has no lamps to find: its light is the sky's, and the figures already stand against it)
  for(let i=0;i<n;i++){const r=d[i*4],gg=d[i*4+1],b=d[i*4+2],l=(.2126*r+.7152*gg+.0722*b)/255,x=l-.6;if(x>0){v[i]=x;lit++;}}
  const found=[];
  if(lit<n*.12){const R=Math.max(2,Math.round(70*TR.s/16));
    for(let pick=0;pick<LY.seeMax+3&&found.length<LY.seeMax;pick++){let bi=-1,bv=.05;for(let i=0;i<n;i++)if(v[i]>bv){bv=v[i];bi=i;}if(bi<0)break;
      const cx=bi%w,cy=(bi/w)|0;let sum=0,cnt=0,tot=0,sr=0,sg=0,sb=0,mx=0,my=0;
      for(let y=Math.max(0,cy-R);y<=Math.min(h-1,cy+R);y++)for(let x=Math.max(0,cx-R);x<=Math.min(w-1,cx+R);x++){const j=y*w+x,q=v[j];tot++;
        if(q>0){cnt++;sum+=q;mx+=x*q;my+=y*q;sr+=d[j*4]*q;sg+=d[j*4+1]*q;sb+=d[j*4+2]*q;}v[j]=0;}
      // (a spot that fills its neighbourhood is a sky or a wall, not a lamp)
      if(cnt>tot*.45||sum<=0)continue;
      const m=Math.max(sr,sg,sb)||1,px=(mx/sum+.5)*16,py=(my/sum+.5)*16;
      found.push({x:(px-TR.tx)/TR.s,y:(py-TR.ty)/TR.s,col:(Math.round(255*sr/m)<<16)|(Math.round(255*sg/m)<<8)|Math.round(255*sb/m),v:cl(bv*2.2+sum/tot*3,0,1)});}}
  for(const q of SEEN)q.want=0;
  for(const f of found){let best=null,bd=60*60;for(const q of SEEN){const dx=q.x-f.x,dy=q.y-f.y,dd=dx*dx+dy*dy;if(dd<bd){bd=dd;best=q;}}
    if(best){best.x+=(f.x-best.x)*.35;best.y+=(f.y-best.y)*.35;best.col=f.col;best.v+=(f.v-best.v)*.5;best.want=1;}
    else if(SEEN.length<LY.seeMax*2)SEEN.push({x:f.x,y:f.y,col:f.col,v:f.v,a:0,want:1});}}
function seenLamps(){
  const dt=seenT==null?0:cl(S.t-seenT,0,.2);seenT=S.t;const L=[],e=still()||LY.seeNow?1:1-Math.exp(-dt/.5);
  for(let i=SEEN.length-1;i>=0;i--){const q=SEEN[i];q.a+=((q.want||0)-q.a)*e;if(!q.want&&q.a<.02){SEEN.splice(i,1);continue;}
    if(q.a>.03)L.push({x:q.x,y:q.y,r:LY.seeR,col:q.col,k:LY.seeK*(.45+.55*q.v)*q.a,z:.22});}
  return L.length?L:null;}
// a room's own lamps (S.lamps, sk_env.js: each hangs from its anchor and swings; lampGlow, sk_envui.js, is how brightly it burns:
// 1 lit, wavering where it has been knocked, a last flicker as it goes out). Where the lamp's bulb is in the picture, warm
function roomLamps(){
  const L=[],A0=S.lamps;if(!LY.lampRoom||!A0||!A0.length||typeof lampGlow!=='function'||!focusHere())return L;
  for(const q of A0){if(!q||!q.p)continue;const k=lampGlow(q);if(!(k>0))continue;L.push({x:q.p.x+q.dep*PSX,y:q.p.y-q.dep*PSY,r:LY.roomR,col:0xffdcaa,k:LY.roomK*Math.min(1,k),z:.3});if(L.length>=6)break;}
  return L;}
function lampsNow(){const k=envKey(),X=k&&EnvLook.S[k];try{if(!LY.lamps||!X)return null;if(typeof X.lampsAt==='function')return X.lampsAt(S.t,still());
    const a=roomLamps(),b=LY.lampSee?seenLamps():null,r=b?a.concat(b).slice(0,8):a;return r.length?r:null;}catch(e){LY.lampErr=String(e&&e.message||e);return null;}}
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
  // (the dark at the edges, under the bloom: its picture is made again when the screen, the bars or the place's finish change)
  {const on=live&&evOn&&EV.cv.width>4,wh=EV.cv.width+'x'+EV.cv.height;
    if(on&&(!G.edges||G.edgesWH!==wh)){if(G.edges)G.edges.destroy();tex(sc,'lyEdges',EV.cv);G.edges=sc.add.image(0,0,'lyEdges').setOrigin(0,0).setDisplaySize(G.w,G.h).setDepth(-42);G.edgesWH=wh;evNew=false;}
    else if(on&&evNew){evNew=false;sc.textures.get('lyEdges').source[0].update();}
    if(G.edges)G.edges.setVisible(on);}
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
LY.info=()=>({live:LY.live,why:LY.why,focus:LY.focus&&focusHere(),dust:LY.dust&&dusty(),parallax:LY.live&&(TR.planes||planes&&bake),baked:LY.live&&planes&&bake,leak:!!(PX&&PX.L&&PX.L.leak)&&p0At-frameN,pull:+LY.pullAt.toFixed(2),bands:TR.planes?['far','mid'].map(b=>[+BT[b].r.toFixed(3),+BT[b].tx.toFixed(1),+BT[b].ty.toFixed(1)]):null,bandsMs:PX?Math.round(PX.ms):0,far:[FAR.cv.width,FAR.cv.height],n:LY.n,ms:+LY.ms.toFixed(2),host:+(PHOST.hostMs||0).toFixed(2),focusAt:+LY.focusAt.toFixed(1),puffs:PUFFS.length,err:LY.err,
  size:G?[G.w,G.h]:null,light:lightOn,soft:LY.softN,lamps:LY.lampsN,ground:LY.plateUnlit,shapes:LY.shapeN,shapeMs:Math.round(LY.shapeMs),lampErr:LY.lampErr});
// (for the checks: the sheets themselves)
LY.puffs=()=>PUFFS.map(p=>({x:+p.x.toFixed(1),y:+p.y.toFixed(1),a:+p.a.toFixed(2),r:+p.r.toFixed(1),age:+(S.t-p.t0).toFixed(2),life:+p.life.toFixed(2)}));
LY.sheets=()=>({far:FAR.cv,farStill:PX&&PX.far&&PX.far.cv,mid:PX&&PX.mid&&PX.mid.cv,plate:A.cv,stage:B.cv,plateN:NA.cv,stageN:NB.cv,top:cv,half:SH.cv,quarter:SQ.cv,mask1:M1.cv,mask2:M2.cv,bloom:BM.cv});
})();
