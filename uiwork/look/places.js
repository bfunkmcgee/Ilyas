// The places the look tools visit, and what the review needs to know of them: shared by audit.js, lines.js and costs.js.
// A shot is a story stage ('stage') at its moments ('at', in the order they come: seconds from the stage's start, 't8', or from its
// fight's first turn, 'f4'; shot on their times, seconds from the stage's start, 'x1.4', from the first scene in its fight, 'c3', or
// from its closing scene's start, 'o6': toMoment below),
// or one of the lab's grounds ('lab') fought free. The fall is drawn all the way (draw:'all': its sand and its pieces follow what was
// drawn). Every story stage in order, then the lab's own grounds (the four the story does not use, and the street it does).
const SHOTS=[
  {id:'sundown',stage:'sundown',at:['t6','t16']},{id:'field',stage:'field',at:['t2','f4']},{id:'chase',stage:'chase',at:['f3','f8']},{id:'highway',stage:'highway',at:['t4','f4']},
  {id:'roadblock',stage:'roadblock',at:['t2','f4']},{id:'vargo',stage:'vargo',at:['t3','f4']},{id:'dining',stage:'dining',at:['f2','f5']},
  {id:'kitchen',stage:'kitchen',at:['f2','f5']},{id:'shaft',stage:'shaft',at:['t2.2','t3']},{id:'lanternup',stage:'lanternup',at:['x1.4','x3.2']},
  {id:'shaftfire',stage:'shaftfire',at:['x1.2','x2.6']},{id:'platform',stage:'platform',at:['t3','t5.8']},{id:'line',stage:'line',at:['f2','f5','c3.7','o8','o14']},
  {id:'deep',stage:'deep',at:['t3','x4.6','f4']},{id:'lobby',stage:'lobby',at:['t3','f4']},{id:'office',stage:'office',at:['t3','f4']},{id:'kick',stage:'office',at:['c0.9']},{id:'gondola',stage:'gondola',at:['x1.2','f3','c1.8','c4.4','o3.2']},
  {id:'officeback',stage:'officeback',at:['x1','t8']},
  {id:'roof',stage:'roof',at:['t4','t10','t16','t22','t32.9','t33.9']},{id:'fall',stage:'fall',at:['t4','t9','t11.5','t24','t37','t46.5'],draw:'all'},
  {id:'roof1',stage:'roof1',at:['t3','t9']},{id:'kitchen1',stage:'kitchen1',at:['t3','t8']},{id:'backroom',stage:'backroom',at:['t4','t12']},
  {id:'lostprop',stage:'lostprop',at:['t4','t12']},{id:'yard1',stage:'yard1',at:['t7.5','t12','o4','o10']},{id:'list',stage:'list',at:['t5','t15']},
  {id:'stairsup',stage:'stairsup',at:['t5','t15']},{id:'shelfstair',stage:'shelfstair',at:['t5','t12']},{id:'shelf',stage:'shelf',at:['t5','t15']},
  {id:'stairsdown',stage:'stairsdown',at:['t5','t12']},{id:'toll',stage:'toll',at:['t3','f4']},{id:'tamm',stage:'tamm',at:['t3','f4']},
  {id:'night',stage:'night',at:['t5','t15']},{id:'sh1',stage:'sh1',at:['t3','f4']},
  {id:'lab_street',lab:'street'},{id:'lab_field',lab:'field'},{id:'lab_hill',lab:'hill'},{id:'lab_ledge',lab:'ledge'},{id:'lab_wall',lab:'wall'}];
// Act I, the Pit: the style guide's rule 3 wants no gold in its lit picture but what fell with him (under 1%)
const ACT1=['roof1','kitchen1','backroom','lostprop','yard1','list','stairsup','shelfstair','shelf','stairsdown','toll','tamm','night','sh1'];
// the family's rooms: gold at least matches sodium orange across their frames (rule 3)
const ROOMS=['lobby','office'];
// a frame's name: the shot's id and its moment (the lab's grounds by id alone)
const frameName=(id,m)=>m&&m!=='fight'?id+'_'+m:id;
// the browser the tools run (the machine's own Chromium when it has one)
const chromiumPath=()=>process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined);

// (in the page) the fake clock, the seeded dice, drawing on and off, and a frame's draw cost: the median of window.__costN draws.
// The page's own clock (performance.now) follows the fake one, so what the drawing times by it (a struck man's flash, a layer
// painted again once the zoom has held still, the shake) comes out the same however fast the machine runs the frames: the same
// build gives the same pictures. The cost alone is timed by the real clock. The fake clock starts at the same reading each time (10 s,
// past what the real one reads by then; since Nov 8): it started a second past the real clock's reading, so what the drawing swings by
// its reading (the shake, sk_ui.js, a pulse, a hover) came out a little different in every run, the cradle's f3 a few pixels over.
function pageSetup(){S.soundOn=false;let a=5;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
  const real=window.__realNow=window.__realNow||performance.now.bind(performance);
  window.__now=Math.max(10000,real()+1000);performance.now=()=>window.__now;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
  window.R0=window.render;window.drawing=on=>{window.render=on?window.R0:()=>{};};window.__costN=window.__costN||6;
  window.cost=()=>{const n=window.__costN,T=[];for(let i=0;i<n;i++){ctx.getImageData(0,0,1,1);const s0=real();window.R0();ctx.getImageData(0,0,1,1);T.push(real()-s0);}T.sort((x,y)=>x-y);return+((T[(n-1)>>1]+T[n>>1])/2).toFixed(1);};}
// (in the page) a lab ground fought free: two fighters a side on auto until an exchange has run two seconds, undrawn, then two
// seconds drawn (what eases in settles)
function labShot(g){S.arenaKey=g;S.backroom=false;S.deep=false;S.introOn=false;S.cfg.n=2;S.cfg.crew=false;S.cfg.ally.on=true;S.auto=true;S.allyAuto=true;S.F=[];rosterBuild();restart();
  drawing(false);let n=0,t0=null;while(n<9000){step(1);n++;if(S.game.phase==='exchange'&&S.game.ex){if(t0==null)t0=S.t;if(S.t>t0+2)break;}}drawing(true);step(120);}
// (in the page) a story stage from its start, on auto (drawn all the way when all is set)
function stageStart([k,all]){storyGo(k);S.storyAuto=true;S.auto=true;step(2);window.__t0=S.t;window.__tf=null;window.__to=null;window.__tc=null;window.__key=k;drawing(!!all);}
// (in the page) on to a moment of the stage: the fast-forward undrawn, then the last two seconds drawn (or drawn all the way); gives
// {gone:true} when the stage ended first. A 't' or 'f' moment's shot is where 120 frames drawn from the fast-forward's stop, two
// seconds short of it, take the game: about a third of a second past it (120 frames are about 2.35 s of the game's time), or later
// still for a moment under two seconds or one too close after the one before. An 'x' moment (since V104) is seconds from the stage's
// start, shot on its time: the frames drawn until it comes (a short stage's moments: the Lantern going up runs 4.4 s); an 'o' moment
// (since V105) seconds from the start of the stage's closing scene, and a 'c' moment seconds from the start of the first scene played
// in its fight (a set piece's), both shot on their times.
function toMoment([m,all]){const k=m[0],fight=k==='f',outro=k==='o',cut=k==='c',exact=k==='x'||outro||cut,T=+m.slice(1),key=window.__key,still=()=>S.story&&S.story.key===key&&!S.story.ended;
  const inFight=()=>S.story&&S.story.step==='fight'&&(S.game.phase==='input'||S.game.phase==='exchange');let n=0;
  // (where the moment counts from: null until that has come)
  const base=()=>{if(fight){if(window.__tf==null&&inFight())window.__tf=S.t;return window.__tf;}
    if(outro){if(window.__to==null&&S.story&&S.story.step==='outro')window.__to=S.t;return window.__to;}
    if(cut){const C=S.cut;if(window.__tc==null&&C&&S.story&&S.story.step==='fight'&&C.name!==key+':intro'&&C.name!==key+':outro')window.__tc=S.t;return window.__tc;}
    return window.__t0;};
  const due=()=>{const b=base();return b!=null&&S.t>=b+T-(all?0:2);};
  while(still()&&!due()&&n<12000){step(1);n++;}if(!still())return{gone:true};
  if(!all){drawing(true);if(exact){let i=0;const b=base();while(still()&&S.t<b+T&&i<240){step(1);i++;}}else step(120);drawing(false);if(exact&&!still())return{gone:true};}return null;}

module.exports={SHOTS,ACT1,ROOMS,frameName,chromiumPath,pageSetup,labShot,stageStart,toMoment};
