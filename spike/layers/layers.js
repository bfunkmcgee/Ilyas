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
//   - the finish's bloom, worked out from the sheets as the game works it out from its one picture, and laid over them as it is.
// Where the sheets cannot be used (Phaser's view off, a place that finishes its own picture, a screen changing size) the frame is
// painted flat, as published, and LayerTest.why says which.
(function(){
'use strict';
if(typeof Phaser==='undefined'||typeof cv==='undefined'||typeof PHOST==='undefined'||!PHOST.game||typeof FXL==='undefined'||typeof envKey!=='function')return;
const LY=window.LayerTest={
  on:true,focus:true,focusK:1,dust:true,
  // focus. Depths are the game's own (units into the picture). Within f0 of where he stands nothing is soft; f1 further it is fMax
  // soft. What stands at the far edge of the floor is one wall: as soft as the floor at its foot, and fRoom more by its top (fTop
  // units up, where the place does not say: BEYOND, below). fEase: the seconds the focus takes to follow him to another depth. The
  // two blurs' reach, in points of the screen; fMid: the softness at which the light one is all there and the heavy one begins.
  // focusK (above) is how much of all this softness is laid on: 1 for all of it.
  f0:30,f1:340,fMax:.9,fTop:260,fRoom:.2,fEase:.5,blur1:1.2,blur2:3.6,fMid:.45,
  // dust: how many motes behind the stage and in front of it, how bright they are and how thick a footfall's puff is (0: none)
  motesBack:40,motesFront:9,moteA:1,puffA:1,dustAll:false,
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
// what one context hands the next, so that the three behave as the one the painters think they have
const KEEP=['globalAlpha','globalCompositeOperation','fillStyle','strokeStyle','lineWidth','lineCap','lineJoin','miterLimit','lineDashOffset','font','textAlign','textBaseline',
  'imageSmoothingEnabled','shadowBlur','shadowColor','shadowOffsetX','shadowOffsetY'];
function carry(a,b){b.setTransform(a.getTransform());for(const k of KEEP){const v=a[k];if(b[k]!==v)b[k]=v;}
  const d=a.getLineDash();if(d.length||b.getLineDash().length)b.setLineDash(d);}
function wipe(L){const g=L.g||L,c=g.canvas;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,c.width,c.height);}

// phase: -1 outside a frame on the sheets, 0 the plate, 1 the stage, 2 the top. TR: the frame's world-to-canvas transform, read off
// the plate's context where the stage begins (the camera's place, its scale and its shake, as render() set them).
let phase=-1,G=null,TR={s:1,tx:0,ty:0},tPrev=null,maskKey='',maskNew=false,lightOn=false;
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
  if(w||!G||G.w!==cv.width||G.h!==cv.height){
    if(!w){LY.need=true;LY.why='making the sheets';}LY.live=false;
    try{return _render.apply(this,arguments);}finally{LY.ms+=(performance.now()-t0-LY.ms)*.05;}}
  phase=0;wipe(A);carry(MAIN,A.g);ctx=A.g;
  try{return _render.apply(this,arguments);}
  finally{LY.live=phase===2;ctx=MAIN;phase=-1;LY.n++;LY.ms+=(performance.now()-t0-LY.ms)*.05;}};
function toStage(){
  const a=A.g,m=a.getTransform();TR={s:m.a,tx:m.e,ty:m.f};
  wipe(B);carry(a,B.g);ctx=B.g;phase=1;
  try{focusNow();feet();
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
  g.globalCompositeOperation='copy';g.drawImage(A.cv,0,0,bw,bh);g.globalCompositeOperation='source-over';g.drawImage(B.cv,0,0,bw,bh);
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
  const ek=envKey(),P0=PLACES[ek]||null,by=P0&&P0.wall?P0:null;
  const K=cl(+LY.focusK||0,0,1);
  const key=[ek,s.toFixed(3),ty.toFixed(1),H,far,dF.toFixed(1),LY.f0,LY.f1,LY.fMax,LY.fTop,LY.fRoom,LY.fMid,K].join('|');if(key===maskKey)return;maskKey=key;
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
function drop(){if(!G)return;for(const o of [G.plate,G.soft1,G.soft2,G.stage,G.bloom,G.back,G.front])try{o.destroy();}catch(e){/* gone with its scene */}G=null;}
function build(sc){
  drop();const w=cv.width,h=cv.height,bw=Math.max(24,Math.round(w/8)),bh=Math.max(24,Math.round(h/8));
  for(const L of [A,B]){L.cv.width=w;L.cv.height=h;}for(const L of [BL,BM]){L.cv.width=bw;L.cv.height=bh;}
  SH.cv.width=Math.ceil(w/2);SH.cv.height=Math.ceil(h/2);SQ.cv.width=Math.ceil(w/4);SQ.cv.height=Math.ceil(h/4);
  tex(sc,'ly0',A.cv);tex(sc,'ly1',B.cv);tex(sc,'lyH',SH.cv);tex(sc,'lyQ',SQ.cv);tex(sc,'lyBloom',BM.cv);tex(sc,'lyM1',M1.cv);tex(sc,'lyM2',M2.cv);
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
  G={w,h,sc,plate,soft1,soft2,back,stage,front,bloom,motes:[],puffs:[],seen:-1};maskKey='';
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
function sync(){
  const sc=scn();if(!sc)return;
  if(LY.need||(G&&G.sc!==sc)){LY.need=false;build(sc);}
  if(!G)return;
  const live=LY.live&&PHOST.mode>0&&!PHOST.err;
  G.plate.setVisible(live);G.stage.setVisible(live);G.back.setVisible(live);G.front.setVisible(live);const foc=live&&LY.focus&&focusHere();G.soft1.setVisible(foc);G.soft2.setVisible(foc);
  G.bloom.setVisible(live&&lightOn);
  if(!live)return;
  if(G.seen!==LY.n){G.seen=LY.n;const T=sc.textures,up=k=>T.get(k).source[0].update();up('ly0');up('ly1');if(lightOn)up('lyBloom');
    if(foc){up('lyH');up('lyQ');if(maskNew){maskNew=false;up('lyM1');up('lyM2');}}}
  // (a blur's reach is in points of the screen: the canvas holds more pixels than that where the screen is dense, and each small
  // copy fewer than the canvas. One pass of Phaser's medium blur spreads a picture about 1.9 of its own pixels at a setting of 1)
  const r=cv.getBoundingClientRect(),dpr=r.width>0?cv.width/r.width:1;
  G.soft1.bl.x=G.soft1.bl.y=LY.blur1*dpr/(1.9*G.soft1.scaleX);G.soft2.bl.x=G.soft2.bl.y=LY.blur2*dpr/(1.9*G.soft2.scaleX);
  dust();}
PHOST.game.events.on('prestep',()=>{try{sync();}catch(e){LY.err=String(e&&e.message||e);}});
LY.info=()=>({live:LY.live,why:LY.why,focus:LY.focus&&focusHere(),dust:LY.dust&&dusty(),n:LY.n,ms:+LY.ms.toFixed(2),host:+(PHOST.hostMs||0).toFixed(2),focusAt:+LY.focusAt.toFixed(1),puffs:PUFFS.length,err:LY.err,
  size:G?[G.w,G.h]:null,light:lightOn});
// (for the checks: the sheets themselves)
LY.puffs=()=>PUFFS.map(p=>({x:+p.x.toFixed(1),y:+p.y.toFixed(1),a:+p.a.toFixed(2),r:+p.r.toFixed(1),age:+(S.t-p.t0).toFixed(2),life:+p.life.toFixed(2)}));
LY.sheets=()=>({plate:A.cv,stage:B.cv,top:cv,half:SH.cv,quarter:SQ.cv,mask1:M1.cv,mask2:M2.cv,bloom:BM.cv});
})();
