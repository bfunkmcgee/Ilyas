"use strict";
// ===== CORE START =====
const W=900,H=500,G=820,DT=1/120,TAU=Math.PI*2;
const PEL=0,CHE=1,HEAD=2,ELF=3,HAF=4,ELB=5,HAB=6,KNF=7,FTF=8,KNB=9,FTB=10,TIP=11;
const lerp=(a,b,t)=>a+(b-a)*t;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const sstep=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const eOut=t=>1-Math.pow(1-clamp(t,0,1),3);
const eIn=t=>Math.pow(clamp(t,0,1),1.7);
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1),lowFirst=s=>s.charAt(0).toLowerCase()+s.slice(1);
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

// ---------- the floor ----------
// Bodies stay flat, side-on ragdolls. Each one stands at a depth on the floor: deeper is drawn higher up and a little to the right.
const PSX=.2,PSY=.75,DEP_MIN=12,DEP_MAX=170,GB=470;
const prjX=(x,d)=>x+d*PSX,prjY=(y,d)=>y-d*PSY;
const CURB0=120,CURB1=126,KERB_H=22;
const ARENAS={
  street:{label:'Street',name:'Lamplight Street',ground:(x,d)=>GB-KERB_H*clamp((d-CURB0)/(CURB1-CURB0),0,1),wall:null,far:190},
  field:{label:'Field',name:'Open Field',ground:()=>GB,wall:null,far:278},
  ledge:{label:'Ledge',name:'Broken Ledge',ground:x=>x<440?GB-50:x>500?GB:GB-50+sstep((x-440)/60)*50,wall:null,far:278},
  hill:{label:'Hillside',name:'Hillside',ground:x=>GB+18-x*.085,wall:null,far:278},
  wall:{label:'Wall',name:'Ruin Wall',ground:()=>GB,wall:770,far:278},
  restaurant:{label:'Restaurant',name:'Lantern Bistro',ground:()=>GB,wall:null,far:236,indoor:true},
};
// [x, depth, side] for Kael then each enemy (side: which side of Kael the enemy holds)
const SPAWN={
  street:{1:[[300,84],[600,84,1]],2:[[440,84],[690,70,1],[190,146,-1]],3:[[430,84],[680,56,1],[700,146,1],[180,96,-1]]},
  field:{1:[[300,92],[600,92,1]],2:[[440,92],[690,80,1],[190,106,-1]],3:[[430,92],[680,60,1],[700,128,1],[180,98,-1]]},
  ledge:{1:[[320,92],[560,92,1]],2:[[370,92],[600,80,1],[150,106,-1]],3:[[370,92],[600,60,1],[640,128,1],[150,98,-1]]},
  hill:{1:[[290,92],[600,92,1]],2:[[440,92],[690,80,1],[190,106,-1]],3:[[430,92],[680,60,1],[700,128,1],[180,98,-1]]},
  wall:{1:[[360,92],[650,92,1]],2:[[420,92],[660,80,1],[180,106,-1]],3:[[400,92],[640,60,1],[690,128,1],[170,98,-1]]},
  restaurant:{1:[[360,92],[560,92,1]],2:[[440,92],[640,80,1],[260,104,-1]],3:[[430,92],[630,64,1],[680,124,1],[250,98,-1]]},
};
const WALL_T=26,WALL_GAP=190,WALL_TOP=260;
const WEAPONS={
  sword:{key:'sword',name:'Longsword',short:'Sword',len:56,butt:9,mass:1.3,off:null,dice:[2,6,10],acc:0,tempo:1,fam:'blade',edge:true},
  axe:{key:'axe',name:'Greataxe',short:'Greataxe',len:66,butt:22,mass:3.4,off:-18,dice:[2,8,14],acc:-1,tempo:1.25,fam:'heavy',edge:true},
  spear:{key:'spear',name:'Spear',short:'Spear',len:92,butt:38,mass:1.7,off:-34,dice:[2,6,12],acc:1,tempo:1.05,fam:'pole',edge:true},
  dagger:{key:'dagger',name:'Dagger',short:'Dagger',len:26,butt:5,mass:.6,off:null,dice:[2,4,10],acc:0,tempo:.85,fam:'short',edge:true},
  // what a fighter ends up with after a disarm: fists, or whatever they can grab
  fists:{key:'fists',name:'Bare hands',short:'Fists',len:7,butt:2,mass:.35,off:null,dice:[1,4,4],acc:1,tempo:.8,fam:'fist',unarmed:true},
  bottle:{key:'bottle',name:'Bottle',short:'Bottle',len:24,butt:3,mass:.6,off:null,dice:[1,6,4],acc:0,tempo:.9,fam:'blunt',improv:true,shatter:'shard'},
  shard:{key:'shard',name:'Broken bottle',short:'Broken bottle',len:15,butt:3,mass:.4,off:null,dice:[1,6,6],acc:1,tempo:.85,fam:'short',improv:true,edge:true},
  mug:{key:'mug',name:'Tankard',short:'Tankard',len:12,butt:2,mass:.7,off:null,dice:[1,6,5],acc:0,tempo:.9,fam:'blunt',improv:true},
  club:{key:'club',name:'Table leg',short:'Table leg',len:44,butt:5,mass:1.2,off:null,dice:[2,4,5],acc:0,tempo:1,fam:'heavy',improv:true},
  chairleg:{key:'chairleg',name:'Chair leg',short:'Chair leg',len:40,butt:5,mass:1,off:null,dice:[2,4,4],acc:0,tempo:.95,fam:'heavy',improv:true},
  stone:{key:'stone',name:'Stone',short:'Stone',len:9,butt:2,mass:1.1,off:null,dice:[1,8,5],acc:-1,tempo:1,fam:'blunt',improv:true},
  // what is left of a spear once its head has been cut off: a long pole
  shaft:{key:'shaft',name:'Spear shaft',short:'Shaft',len:66,butt:38,mass:1.3,off:-30,dice:[2,4,6],acc:0,tempo:1,fam:'blunt',improv:true},
};
const REAL_WEAPONS=['sword','axe','spear','dagger'];
const SKILLS=['Novice','Trained','Veteran','Expert','Master'];
const ACTIONS={
  slash:{name:'Slash',acc:0,mult:1,cost:100},
  overhead:{name:'Overhead',acc:-1,mult:1.3,cost:120},
  thrust:{name:'Thrust',acc:2,mult:.85,cost:90},
  sweep:{name:'Sweep',acc:0,mult:.5,cost:95},
  guard:{name:'Take cover',cost:50},
  advance:{name:'Advance',cost:70},
  sidestep:{name:'Sidestep',cost:55},
  withdraw:{name:'Withdraw',cost:70},
  shove:{name:'Shove',cost:70},
  wait:{name:'Hold',cost:45},
  feint:{name:'Feint',cost:40},
  bind:{name:'Weapon control',cost:65},
  flank:{name:'Flank',cost:80},
  // brawling
  grab:{name:'Grab',cost:65},
  elbow:{name:'Elbow',acc:2,mult:1,cost:50},
  headbutt:{name:'Headbutt',acc:1,mult:1,cost:55},
  knee:{name:'Knee',acc:1,mult:1,cost:55},
  throw:{name:'Throw',cost:85},
  push:{name:'Push away',cost:55},
  breakfree:{name:'Break free',cost:50},
  shield:{name:'Human shield',cost:60},
  getup:{name:'Get up',cost:30},
  roll:{name:'Roll away',cost:45},
  pickup:{name:'Pick up',cost:60},
  draw:{name:'Draw dagger',cost:35},
  stab:{name:'Dagger stab',acc:0,mult:1,cost:50},
  // teamwork
  team:{name:'Team move',cost:0},
  pincer:{name:'Pincer',cost:75},
  helpup:{name:'Help up',cost:60},
  cover:{name:'Cover',cost:55},
};
const DIRTY=['elbow','headbutt','knee'];
const ATTACKS=['slash','overhead','thrust','sweep'];
// How far off the line (in depth) each move still connects
const BAND={slash:18,overhead:14,thrust:10,sweep:16,shove:18,bind:16};
// Balance (footing, in the code) is a bar of pips: six for a named fighter, four for a crew man, eight for a boss. What the other side
// does takes it: a blow that lands, a parry or a counter that meets your attack, a dodge that leaves you reaching, a shove. Your own
// heavy moves spend a little. It comes back by itself, two pips at the start of each of your turns, so nobody spends a turn on it.
// Knocked to nothing by the other side, a fighter is Broken: no answers until his next turn, and whoever broke him gets a free move.
// 4 pips or more is Set, 2 or 3 Committed, 0 or 1 Off balance.
const FOOT_MAX=6,FOOT_RISE=3;
const POSTURES={
  set:{name:'Set',color:'#7fdca0',def:0,atk:1,resist:2,tip:'Planted feet (4 pips or more): +1 to hit, resists shoves.'},
  committed:{name:'Committed',color:'#ffc163',def:-1,atk:0,resist:0,tip:'Weight forward (2 or 3 pips): −1 DEF.'},
  off:{name:'Off balance',color:'#ff8a5c',def:-3,atk:-2,resist:-3,tip:'0 or 1 pip: −3 DEF, −2 to hit, lighter blows. Two pips come back at the start of each turn.'}};
const PORDER=['set','committed','off'];
function footBand(n){return n>=4?'set':n>=2?'committed':'off';}
function post(f){return POSTURES[f.posture]||POSTURES.set;}
// the footing term in a roll line: "+1 set footing", "−2 off balance"
function footLabel(f){return f.posture==='off'?'off balance':f.posture==='committed'?'committed':'set';}
function spendFoot(f,n){if(n>0)f.foot=Math.max(0,f.foot-n);}
function gainFoot(f,n){if(n>0)f.foot=Math.min(footMaxOf(f),f.foot+n);}
// how many pips a fighter has: a crew man four, a boss eight, everyone else six
function footMaxOf(f){return f&&f.hench?4:f&&f.boss?8:FOOT_MAX;}
// what wears balance down, in pips
const BAL={recover:2,hit:2,parried:2,countered:2,blocked:1,dodged:1,dodgedOver:2,stepBack:1};
// balance knocked out by the other side (by): at nothing a standing fighter is Broken
function knockBalance(D,n,by){
  if(!D||n<=0)return;const was=D.foot;spendFoot(D,n);
  if(was>0&&D.foot<=0&&!D.dead&&!D.downed&&!D.clinch&&!D.broken&&!D.npc&&by&&by!==D&&by.team!==D.team)breakFighter(D,by);}
// one free move a break: once the other side has had it, the break gives no more (his own turn ends it)
function freshBreak(f){return!!(f&&f.broken&&!f.broken.paid);}
function breakFighter(D,by){
  D.broken={by:by.idx,t:S.t,paid:false};D.guarding=false;D.counter=false;D.react=null;D.motor=Math.min(D.motor,.45);
  popup(D,'Broken','#ffb347','no answer till his turn',26,-46);S.slowT=Math.max(S.slowT,.45);S.shake=Math.max(S.shake,5);
  S.hooks.sound('thud',260);if(S.hooks.broken)S.hooks.broken(D,by);}
// a blow or a stumble caps footing at the top of a band
function worsen(f,s){f.foot=Math.min(f.foot,s==='off'?1:s==='committed'?3:footMaxOf(f));}
// a heavy blow, a crit, a slam or a bad miss knocks three pips out of you
const FOOT_HIT=3;
// Rank counts. A fighter two or more ranks below the one he goes for is outclassed: for each rank of the gap beyond the first he takes
// OUTCLASS_HIT off his attacks, grabs, shoves, throws and attempts to break free, his blows and shoves put the better fighter down only
// with a crit, and a blow of his that lands knocks one pip of footing out of the better fighter instead of three (two across a gap of
// two ranks). It works both ways, and fighters of equal or neighbouring rank are untouched.
const OUTCLASS_HIT=2;
function outclass(A,D){return A&&D&&!A.npc&&!D.npc?Math.max(0,(D.skill||0)-(A.skill||0)-1):0;}
function outclassMod(A,D){return-OUTCLASS_HIT*outclass(A,D);}
function hitFoot(A,D){return Math.max(1,FOOT_HIT-outclass(A,D));}
function kdBlocked(A,D,crit){return!crit&&outclass(A,D)>=1;}
// Patterns get read. Each attack of the same kind in a row on the same man gives him +1 DEF against it, up to READ_MAX; a different
// attack, or a feint, resets the count. Kept per pair: D.reads[A.idx] = {kind, n}, n being how many he has just seen.
const READ_MAX=3;
function readOf(A,D){return A&&D&&D.reads?D.reads[A.idx]||null:null;}
function readBonus(A,D,kind){if(!A||!D||D.downed||!ATTACKS.includes(kind))return 0;const r=readOf(A,D);return r&&r.kind===kind?Math.min(READ_MAX,r.n):0;}
function noteRead(A,D,kind){if(!A||!D||D.downed||!ATTACKS.includes(kind))return;const R=D.reads||(D.reads={}),r=R[A.idx];if(r&&r.kind===kind)r.n++;else R[A.idx]={kind,n:1};}
function clearRead(A,D){if(A&&D&&D.reads)delete D.reads[A.idx];}
// Every attack has an answer. Against the next attack: a raised guard covers a Slash or Thrust (+4), only +2 against an Overhead
// (which breaks it) and +1 against a Sweep (which goes under it); a counter stance is +3 against an Overhead and -1 against a Thrust;
// a Thrust from off the line is at -4 rather than -2; a Sweep straight after its target withdrew is at -4.
const ANSWER={guardSweep:1,ctrOverhead:3,ctrThrust:-1,offLineThrust:-4,hopBack:4};
// the shown attack each defensive command answers, and the ones it is weak against
const ANSWERS={guard:['slash','thrust'],wait:['overhead'],sidestep:['thrust'],withdraw:['sweep']};
const WEAK_TO={guard:['overhead','sweep'],wait:['thrust']};
// Reactions (sk_react.js): every blow on a fighter gets an answer, picked as it comes. Parry and Counter are the guard and the
// counter stance above, held for that one blow; Slip, Step back and Turn add these to DEF against each kind of attack.
const REACT_DEF={slip:{slash:1,thrust:4,overhead:2,sweep:-1},back:{slash:2,thrust:1,overhead:1,sweep:4},turn:{slash:2,thrust:2,overhead:1,sweep:-1}};
const REACT_NAME={parry:'Parry',counter:'Counter',slip:'Slip',back:'Step back',turn:'Turn him'};
function reactDef(D,kind){const t=D&&D.react&&REACT_DEF[D.react];return t?t[kind]||0:0;}
// a feint: a fake that strips a raised guard or a counter stance unless he reads it, and leaves the next attack on him at +2
// (or, if he reads it, him at +1 against it). Its reach: how far outside striking distance it still sells.
const FEINT={bonus:2,read:1,reach:60};
function feintBonus(A,D){return A&&D&&A.feint&&A.feint.tgt===D.idx?FEINT.bonus:0;}
function feintRead(A,D){return A&&D&&A.feintRead&&A.feintRead.tgt===D.idx?FEINT.read:0;}
function stepDown(f){spendFoot(f,1);}
function stepUp(f){gainFoot(f,1);}
// what your own moves spend, in pips: the heavy ones only (a flourish or a crowd cut one more); nothing buys pips back
const FOOT_COST={overhead:1,shove:1,throw:1};
const FOOT_GAIN={};
function footDelta(A,cmd,T){
  if(T&&T.recov)return 1;
  if(T&&T.foot!=null)return -T.foot;
  if(cmd==='withdraw'&&!A.downed&&breakoutInfo(A))return -1;
  let c=FOOT_COST[cmd]||0;
  if(T&&(T.vault||T.multi||T.lash||(T.flair&&T.flair!=='twirl')))c+=1;
  return -c;}
// strikes, shoves and grabs need at least one pip of footing; at zero only recovering, moving and clinch work are left
const NEEDS_FOOT=['slash','overhead','thrust','sweep','shove','grab','bind','feint'];
// D: the target, so a Slash that becomes a Recovering cut stays open at no footing (it buys a pip back)
function outOfFooting(A,cmd,D){return A.foot<1&&!A.downed&&!A.clinch&&NEEDS_FOOT.includes(cmd)&&!(cmd==='slash'&&recoverOK(A,D));}
function recoverOK(A,D){return!!D&&!D.dead&&!D.downed&&!A.downed&&!A.clinch&&A.posture==='off'&&!!pickTechnique(A,D,'slash').recov;}
function beginAction(A,cmd,chain,T){const d=footDelta(A,cmd,T);if(d>0)gainFoot(A,d);else if(!chainFoot(A,chain))spendFoot(A,-d);}
const GUARD={
  sword:{hx:.46,hy:.42,w:-1.0,gw:-.45,off:[.12,.62],crouch:.9,lean:.06,sf:.26,sb:-.3},
  axe:{hx:.3,hy:.36,w:-1.8,gw:.3,off:null,crouch:.9,lean:.04,sf:.26,sb:-.3},
  spear:{hx:.36,hy:.5,w:-.14,gw:-.3,off:null,crouch:.88,lean:.08,sf:.3,sb:-.32},
  dagger:{hx:.5,hy:.3,w:-.55,gw:-.35,off:[.4,.12],crouch:.84,lean:.14,sf:.24,sb:-.3},
  fists:{hx:.46,hy:.2,w:-1.3,gw:-.2,off:[.3,.1],crouch:.85,lean:.12,sf:.25,sb:-.3},
  bottle:{hx:.44,hy:.28,w:-1.25,gw:-.3,off:[.3,.2],crouch:.86,lean:.1,sf:.25,sb:-.3},
  shard:{hx:.5,hy:.3,w:-.6,gw:-.35,off:[.36,.14],crouch:.84,lean:.14,sf:.24,sb:-.3},
  mug:{hx:.44,hy:.28,w:-.9,gw:-.3,off:[.3,.18],crouch:.86,lean:.1,sf:.25,sb:-.3},
  club:{hx:.4,hy:.34,w:-1.35,gw:-.3,off:[.22,.4],crouch:.88,lean:.08,sf:.26,sb:-.3},
  chairleg:{hx:.42,hy:.32,w:-1.3,gw:-.3,off:[.24,.38],crouch:.88,lean:.08,sf:.26,sb:-.3},
  stone:{hx:.42,hy:.28,w:-1.0,gw:-.3,off:[.3,.2],crouch:.86,lean:.1,sf:.25,sb:-.3},
  shaft:{hx:.36,hy:.5,w:-.14,gw:-.3,off:null,crouch:.88,lean:.08,sf:.3,sb:-.32},
};

function genBody(seed){
  const r=mulberry32(seed*7919+13);
  const h=lerp(.88,1.14,r()),bulk=lerp(.78,1.4,r());
  const v=()=>lerp(.9,1.12,r());
  return{seed,h,bulk,torso:44*h*v(),neck:15*h,headR:10.5*h*lerp(.86,1.18,r()),ua:27*h*v(),fa:25*h*v(),th:35*h*v(),sh:35*h*v(),
    limbW:6*bulk,torsoW:11.5*bulk,mass:bulk*h,posture:lerp(-.04,.1,r()),stance:lerp(.85,1.2,r())};
}
function describeBody(b){
  const cm=Math.round((b.th+b.sh+b.torso+b.neck+b.headR)*1.23);
  return `${cm} cm · ${b.bulk<.95?'wiry':b.bulk<1.18?'medium':'heavy'} build`;
}

// (the hero's name is who he is to the code too: his look, his elven speed and his magic go by it)
const FOE_NAMES=['Qadir','Brask','Iyla'],FOE_COLORS=['#ff6b5b','#b591ff','#ff7eb6'],HERO_COLOR='#45d8c8',HERO_NAME='Ilyas';
// how each enemy likes to fight
const TEMPERS={
  brute:{name:'Brute',tip:'Charges in, answers a raised guard with an Overhead, shoves people into things, and only stops to recover when spent.'},
  keeper:{name:'Keeper',tip:'Holds the reach of his weapon: gives ground when you get inside it, waits for you to come onto the point, and recovers early.'},
  rusher:{name:'Rusher',tip:'Closes fast and gets inside, grabs whenever she is close, and takes the legs of anyone unsteady.'},
  plain:{name:'Plain',tip:'No particular habits.'}};
const TEMPER_ORDER=['brute','keeper','rusher','plain'],DEFAULT_TEMPER=['brute','keeper','rusher'];
const FOE_HP={1:120,2:60,3:42};
const S={arenaKey:'street',arena:null,t:0,F:[],flashes:[],sparks:[],dusts:[],popups:[],trails:[],ghosts:[],rings:[],callouts:[],punch:null,
  items:[],blood:[],stains:[],clinches:[],gore:'red',shakeDir:{x:0,y:0},camKick:null,
  shake:0,freeze:0,slowT:0,userSlow:false,auto:false,allyAuto:false,debug:false,warming:false,rng:Math.random,pending:[],opening:null,
  table:null,debris:[],rubble:[],tableOn:true,wall:null,target:1,
  divs:[],props:[],wares:[],lamps:[],shards:[],spills:[],bill:{total:0,items:{}},divOn:true,showcase:false,
  cfg:{n:2,ally:{on:false,seed:6427,weapon:'spear',skill:3},hero:{seed:2207,weapon:'sword',skill:4},foes:[{seed:5113,weapon:'axe',skill:3,temper:'brute'},{seed:7741,weapon:'spear',skill:2,temper:'keeper'},{seed:3190,weapon:'dagger',skill:2,temper:'rusher'}]},
  game:{phase:'idle',turnNo:1,active:0,ex:null,aiAt:null},
  hooks:{body(f,b){return b;},skill(f,s){return s;},arms(){return null;},feint(){},sound(){},log(){},perf(){},perf2(){},domino(){},status(){},turn(){},over(){},read(){},opening(){},shove(){},wound(){},rip(){},grab(){},throwLand(){},breakfree(){},pickup(){},fin(){},stuck(){},cover(){},helped(){},bill(){},kick(){},bottle(){}}};
S.arena=ARENAS[S.arenaKey];
// V11 extension points: each feature module pushes its own listeners here instead of editing the functions that call them
// exchangeEnd(last): an exchange has finished, before the end-of-fight checks; kill(D,dir): someone has just died;
// turnStart(i): a turn is about to start for fighter i. The UI lists run in the page only: init() once before the first fight,
// world() inside the camera transform after the effects, screen() in screen pixels at the very end of a frame.
// V12 adds step() (every sim step outside the warm-up, after the exchange has stepped) and duelStart() (initDuel, before the warm-up).
const V11={exchangeEnd:[],kill:[],turnStart:[],step:[],duelStart:[]},V11UI={init:[],world:[],screen:[],tick:[]};
function hero(){return S.F[0];}
// an enemy who does not fight (the executive) is never one of the foes: no turns, no target, never in the way of the end of a fight
function foes(){return S.F.filter(f=>f.team===1&&!f.dead&&!f.npc);}
function wallStanding(){return!!(S.arena.wall&&(!S.wall||S.wall.state==='standing'));}
function wallSolid(){return!!(S.arena.wall&&S.wall&&S.wall.state!=='breached');}
function maxStation(){if(!S.arena.wall)return S.arena.maxX||W-60;return wallStanding()?S.arena.wall-30:W-40;}
function clampStage(x){return clamp(x,60,maxStation());}
function clampFoot(x){return clamp(x,14,wallStanding()?S.arena.wall-5:W-14);}
// once it is broken through, the wall has come down along the whole stretch where anyone fights: nothing of it is left to hit there
function wallCollide(q){
  const wx=S.arena.wall;if(!wx)return;
  if(!S.wall||S.wall.state!=='breached'){if(q.x>wx-q.r)q.x=wx-q.r;return;}
}

// ---------- lines, angles and facing ----------
function band(kind,A){return(BAND[kind]||16)+(kind==='slash'&&A.wp.key==='axe'?4:0);}
function offLine(A,D,kind){return Math.abs(A.lane-D.lane)>band(kind,A);}
function holdsAngle(A,D){return A.laneT>D.laneT;}
function strikeLane(A,D,kind){
  const bnd=band(kind,A),dz=A.lane-D.lane,side=Math.sign(A.station-D.station);
  let z=Math.abs(dz)<=bnd?A.lane:D.lane+Math.sign(dz||1)*Math.max(0,bnd-5);
  const busy=zz=>S.F.some(o=>o!==A&&o!==D&&!o.dead&&o.team===A.team&&Math.abs(o.lane-zz)<12&&Math.sign(o.station-D.station)===side&&Math.abs(o.station-D.station)<150);
  if(busy(z))for(const c of [D.lane+bnd-5,D.lane-(bnd-5),D.lane])if(c>=DEP_MIN&&c<=DEP_MAX&&!busy(c)){z=c;break;}
  return clamp(z,DEP_MIN,DEP_MAX);
}
function angleMod(A,D,kind){return offLine(A,D,kind)?(holdsAngle(A,D)?1:-2):0;}
function facingAway(D,A){const dx=D.station-A.station;return Math.abs(dx)>4&&D.facing===Math.sign(dx);}
function backExposed(D,A){return facingAway(D,A)&&!(D.guarding&&D.circleGuard);}
function faceToward(f,x){const dx=x-f.station;if(Math.abs(dx)>4)f.facing=Math.sign(dx);}
// a henchman still walking in from the door is nobody's target while anyone else is standing
function notHereYet(f){return!!f.walkIn&&foes().some(o=>!o.walkIn);}
function targetOf(f){
  if(f.clinch){const P=clinchPartner(f);if(P&&!P.dead){if(f.team===0)setTgt(f,P.idx);else f.tgt=P.idx;return P;}}
  if(f.team===1){let t=S.F[f.tgt];if(!t||t.dead||t.team!==0){t=nearestHero(f);f.tgt=t?t.idx:null;}return t||null;}
  let t=S.F[getTgt(f)];if(!t||t.dead||t.team!==1||t.npc||notHereYet(t)){t=pickDefaultTarget(f);setTgt(f,t?t.idx:-1);}
  return t||null;
}
function pickDefaultTarget(K=hero()){let best=null,bd=1e9;
  for(const f of foes()){if(notHereYet(f))continue;const d=Math.abs(f.station-K.station)+Math.abs(f.lane-K.lane)*.8+(Math.sign(f.station-K.station)===K.facing?0:140);if(d<bd){bd=d;best=f;}}
  return best;}
function retargetHero(K=hero()){const P=partnerOf(K);let best=null,bs=-1e9;
  for(const f of foes()){if(notHereYet(f))continue;const front=Math.sign(f.station-K.station)===K.facing;
    let s=(1-f.hp/f.maxHp)*50+(front?30:0)+(f.downed?45:0)+(heldBy(K)===f?60:0)-Math.abs(f.station-K.station)*.06-Math.abs(f.lane-K.lane)*.1;
    // with a partner: get the one holding them off, work on what they are fighting, finish what is caught between you
    if(P){if(heldBy(P)===f)s+=70;if(P.clinch&&P.clinch.a===P&&clinchPartner(P)===f)s+=25;if(!P.downed&&S.F[getTgt(P)]===f)s+=12;if(pincered(f))s+=15;}
    if(s>bs){bs=s;best=f;}}
  if(best)setTgt(K,best.idx);}
// The attacker turns to the target; the defender turns to face the attack.
function engage(A,D){faceToward(A,D.station);D.facing=-A.facing;if(D.holdFace!=null&&D.holdFace!==A.idx)D.holdFace=null;if(D.team===0)setTgt(D,A.idx);}

// ---------- skill techniques and crowd context ----------
// Veteran unlocks the simple crowd moves, Expert the flourishes and the rest, Master uses flourishes on nearly every open attack.
const RANK={veteran:3,expert:4,master:5};
function hash32(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}h^=h>>>13;h=Math.imul(h,0x5bd1e995);h^=h>>>15;return h>>>0;}
// stable for the whole turn, so the command preview names the technique the fighter will perform
function styleRoll(A,kind){return hash32(kind+'|'+A.idx+'|'+A.seed+'|'+S.game.turnNo)/4294967296;}
function upright(o){return!o.dead&&!o.npc&&S.t>=o.knockUntil&&o.motor>.45;}
function rivals(A){return S.F.filter(o=>o.team!==A.team&&upright(o));}
// Whirlwind: the target in front and another enemy close behind
function whirlPartner(A,D){
  if(A.skill<RANK.expert||Math.abs(D.station-A.station)-engageGap(A,D)>48)return null;
  const fa=Math.sign(D.station-A.station)||A.facing,reach=estReach(A,'slash')+26;let best=null,bd=1e9;
  for(const o of rivals(A)){if(o===D)continue;const dx=(o.station-A.station)*fa;if(dx>-24)continue;
    const dz=Math.abs(o.lane-A.lane),d=Math.hypot(dx,dz*.8);if(dz<=46&&d<=reach&&d<bd){bd=d;best=o;}}
  return best;}
// Cleave: a second enemy beside the target, inside the same arc
function cleavePartner(A,D){
  if(A.skill<RANK.veteran||A.wp.key==='dagger')return null;
  const fa=Math.sign(D.station-A.station)||A.facing;let best=null,bd=1e9;
  for(const o of rivals(A)){if(o===D)continue;if((o.station-A.station)*fa<24)continue;
    const sx=Math.abs(o.station-D.station),dz=Math.abs(o.lane-D.lane);
    if(sx<=62&&dz<=48&&Math.abs(o.lane-A.lane)<=52){const d=sx+dz*.6;if(d<bd){bd=d;best=o;}}}
  return best;}
// Domino shove: an ally standing just behind the fighter being shoved
function dominoPartner(A,D){
  if(!D||A.skill<RANK.veteran)return null;
  const fa=Math.sign(D.station-A.station)||A.facing;let best=null,bd=1e9;
  for(const o of S.F){if(o===D||o===A||o.team!==D.team||!upright(o))continue;
    const dx=(o.station-D.station)*fa,dz=Math.abs(o.lane-D.lane);if(dx>=8&&dx<=96&&dz<=34&&dx+dz<bd){bd=dx+dz;best=o;}}
  return best;}
function sideTo(o,A){return A===hero()?o.side:(Math.sign(o.station-A.station)||o.side);}
function surrounded(A,range=220){const fs=foes().filter(o=>upright(o)&&Math.abs(o.station-A.station)<range);return A.team===0&&fs.some(o=>sideTo(o,A)<0)&&fs.some(o=>sideTo(o,A)>0);}
// (a circle guard was a raised guard against a crowd: no guard is raised in a melee now, every blow is answered as it comes)
function circleGuardOK(A){return false;}
// Flow: after a takedown, the next enemy within reach
function flowTarget(A,D){
  if(A===hero())return chainTarget(A,D);
  if(A.skill<RANK.expert)return null;let best=null,bd=1e9;
  for(const o of rivals(A)){if(o===D)continue;const d=Math.abs(o.station-A.station)-engageGap(A,o),dz=Math.abs(o.lane-A.lane);if(d<=60&&dz<=56&&d+dz<bd){bd=d+dz;best=o;}}
  return best;}
// Break out: caught between enemies, dive past the smaller group so everyone ends up in front
function breakoutInfo(A){
  if(A!==hero()||A.skill<RANK.expert||!surrounded(A))return null;
  const fs=foes(),L=fs.filter(o=>o.side<0),R=fs.filter(o=>o.side>0);if(!L.length||!R.length)return null;
  const opts=[];
  for(const [grp,dir] of [[L,-1],[R,1]]){
    const edge=dir<0?Math.min(...grp.map(o=>o.station)):Math.max(...grp.map(o=>o.station));
    if((edge-A.station)*dir>260)continue;
    const tx=clampStage(edge+dir*92);if((tx-edge)*dir<72)continue;
    const avg=grp.reduce((s,o)=>s+o.lane,0)/grp.length,lo=Math.min(A.station,tx),hi=Math.max(A.station,tx);
    for(const dz of [avg+58,avg-58]){if(dz<DEP_MIN||dz>DEP_MAX)continue;
      if(inTableLane(dz,10)){const b=tableBox();if(b.r>lo-30&&b.l<hi+30)continue;}
      const tz=clamp(lerp(dz,avg,.6),DEP_MIN,DEP_MAX);
      if(!laneOK(A,tz,tx))continue;
      if(S.divs.length&&divOnPath([[A.station,A.lane],[A.station+dir*16,dz],[tx,dz],[tx,tz]]))continue;
      opts.push({x:tx,z:tz,dz,dir,pass:grp,score:grp.length*100+Math.abs(dz-A.lane)*.3-Math.abs(tx-edge)*.05});}}
  if(!opts.length)return null;opts.sort((a,b)=>a.score-b.score);return opts[0];}
function flourish(A,D,kind,c){
  const wk=A.wp.key,app=c.gap-engageGap(A,D),chance=A.skill>=RANK.master?.85:.55;
  if(styleRoll(A,kind)>chance)return null;
  if(kind==='slash')return{key:'whirl',flair:'spin',name:{sword:'Whirling cut',axe:'Whirling cleave',spear:'Whirling shaft cut',dagger:'Spinning backhand',elven:'Moonwheel'}[wk],dmg:1.15,knock:1.3,
    why:'An expert turns the cut into a full spin, so it lands with the whole body behind it.'};
  if(kind==='overhead'){
    if(wk==='spear')return{key:'twirlcrash',flair:'twirl',name:'Twirling crash',acc:-1,dmg:1.2,why:'The spear spins overhead to build speed before it crashes down.'};
    if(app>=46&&app<=340&&c.dh>-18)return{key:'leap',flair:'leap',name:{sword:'Leaping cleave',axe:'Leaping chop',dagger:'Leaping stab',elven:'Falling moon'}[wk],acc:-1,dmg:1.25,knock:1.2,
      why:'With room to close, an expert leaps in and brings the blow down on landing.'};
    return null;}
  if(kind==='thrust'){
    if(wk==='spear')return{key:'twirlthrust',flair:'twirl',name:'Twirling thrust',acc:1,why:'The spear spins once to hide its line, then drives straight in.'};
    if(app>=40)return{key:'fleche',flair:'burst',name:{sword:'Flèche',axe:'Charging spike',dagger:'Darting stab',elven:'Silver dart'}[wk],acc:1,dmg:1.05,passing:true,overlap:.14,
      why:'An explosive running lunge that closes the gap before they can set.'};
    return null;}
  if(kind==='sweep'){
    if(wk==='dagger')return app>=30?{key:'slide',flair:'slide',name:'Sliding reap',acc:1,kdEase:2,why:'Drops into a slide and reaps the ankle on the way in.'}:null;
    return{key:'spinsweep',flair:'spin',name:{sword:'Spinning low cut',axe:'Spinning hook',spear:'Spinning shaft sweep',elven:'Crescent reap'}[wk],dmg:1.1,kdEase:2,
      why:'Spins low to the ground so the sweep arrives with the whole body behind it.'};}
  return null;}

// ---------- table prop ----------
const TABLE_W=92,TABLE_H=44,TD=22,TABLE_SEGS=[[0,1,3.5],[0,3,2.5],[1,2,2.5]];
function tableIntact(){const T=S.table;return!!(T&&T.on&&T.state==='intact');}
function inTableLane(d,pad=12){return tableIntact()&&Math.abs(d-S.table.dep)<TD+pad;}
function tableBox(){let l=1e9,r=-1e9,t=1e9,b=-1e9;for(const q of S.table.pts){if(q.x<l)l=q.x;if(q.x>r)r=q.x;if(q.y<t)t=q.y;if(q.y>b)b=q.y;}return{l,r,t,b,cx:(l+r)/2};}
function tableTopAt(x){const a=S.table.pts[0],b=S.table.pts[1];return lerp(a.y,b.y,clamp((x-a.x)/((b.x-a.x)||1),0,1));}
function tableMaxX(){return wallStanding()?S.arena.wall-6:W-12;}
function tableDefault(){
  if(S.arenaKey==='wall')return{x:250,d:136};
  if(S.arenaKey==='restaurant')return S.room==='kitchen'?{x:430,d:142}:S.room==='lobby'?LOBBY_TABLE:S.room==='office'?null:{x:330,d:50};
  const fs=S.F.filter(f=>f.team===1),r=fs.find(f=>f.side>0)||fs[0];
  return r?{x:Math.min(r.station+105,tableMaxX()-50),d:r.lane}:{x:600,d:92};
}
function buildTable(cx,dep){
  const gr=x=>S.arena.ground(x,dep),hw=TABLE_W/2,g0=gr(cx-hw+7),g1=gr(cx+hw-7);
  const mk=(x,y)=>({x,y,px:x,py:y,m:3,im:1/3,r:2,vx0:0,vy0:0});
  const T={on:true,state:'intact',breakBy:0,breakFrom:null,breakDir:1,slamT:-9,dep};
  T.pts=[mk(cx-hw,g0-TABLE_H),mk(cx+hw,g1-TABLE_H),mk(cx+hw-7,g1-2),mk(cx-hw+7,g0-2)];
  T.sticks=[];for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)T.sticks.push([i,j,Math.hypot(T.pts[i].x-T.pts[j].x,T.pts[i].y-T.pts[j].y)]);
  const a=T.pts[0],b=T.pts[1],topAt=x=>lerp(a.y,b.y,(x-a.x)/(b.x-a.x));
  T.props=(S.arenaKey==='restaurant'?[]:[{kind:'mug',x:cx-20,r:4.5},{kind:'bottle',x:cx+19,r:4}]).map(q=>{const y=topAt(q.x)-3.5-q.r;return{...q,y,px:q.x,py:y,im:2,ang:0,spin:0,vx0:0,vy0:0};});
  S.table=T;S.debris=[];
  if(S.wares)tableWares();
}
function tableSpotOK(cx,dep){
  const hw=TABLE_W/2;if(cx<hw+12||cx>tableMaxX()-hw||dep<DEP_MIN||dep>DEP_MAX)return false;
  for(const w of S.divs)if(divSolid(w)&&divBand(w,dep,TD+8)&&Math.abs(cx-w.x)<hw+w.t/2+14)return false;
  const live=S.F.filter(f=>!f.dead),near=f=>Math.abs(f.lane-dep)<TD+16;
  for(const f of live)if(near(f)&&Math.abs(f.station-cx)<hw+30)return false;
  const K=hero();
  if(K&&!K.dead&&near(K))for(const f of live){if(f.team!==1||!near(f))continue;
    const lo=Math.min(K.station,f.station),hi=Math.max(K.station,f.station);
    if(cx>lo&&cx<hi&&(cx-hw<lo+84||cx+hw>hi-84))return false;}
  return true;
}
function placeTable(cx,dep){
  for(let r=0;r<=W;r+=3)for(const dx of r?[-r,r]:[0])for(const dd of [0,-12,12,-26,26]){
    const d=clamp(dep+dd,DEP_MIN,DEP_MAX);if(tableSpotOK(cx+dx,d)){buildTable(cx+dx,d);return true;}}
  return false;
}
function tableBetween(A,D){if(!inTableLane(A.lane)||!inTableLane(D.lane))return false;const b=tableBox(),lo=Math.min(A.station,D.station),hi=Math.max(A.station,D.station);return b.l>lo&&b.r<hi;}
function detourLane(A,D){if(!tableIntact())return null;const T=S.table,c=[T.dep-TD-18,T.dep+TD+18].filter(z=>z>=DEP_MIN&&z<=DEP_MAX);
  if(!c.length)return null;const cost=z=>Math.abs(z-A.lane)+Math.abs(z-D.lane);c.sort((a,b)=>cost(a)-cost(b));return c[0];}
function clampSt(f,x,d){
  d=d??f.lane;x=clampStage(x);
  if(tableIntact()&&Math.abs(d-S.table.dep)<TD+14){const b=tableBox(),fs=f.p[PEL].x<b.cx?-1:1,tg=targetOf(f);let m=22;
    if(tg&&inTableLane(tg.lane,14)){const os=tg.p[PEL].x<b.cx?-1:1;if(os!==fs)m=84;}
    let nx=fs<0?Math.min(x,b.l-m):Math.max(x,b.r+m);
    if(nx<60||nx>maxStation())nx=fs<0?Math.max(x,b.r+22):Math.min(x,b.l-22);
    x=nx;}
  // nobody stands inside a fixture that never moves (the kitchen stove)
  for(const P of S.props){if(!P.fixed||P.broken||Math.abs(d-P.dep)>P.dz+16)continue;const b=P.box;if((f.p?f.p[PEL].x:x)<b.cx)x=Math.min(x,b.l-24);else x=Math.max(x,b.r+24);}
  return clampStage(S.divs.length?clampDiv(f,x,d):x);
}
function tableBehind(f){
  if(!inTableLane(f.lane))return null;const b=tableBox();
  if(f.facing>0)return b.r<=f.station?f.station-b.r:null;
  return b.l>=f.station?b.l-f.station:null;
}
function obstacleBehind(f){let d=Infinity;const t=tableBehind(f);if(t!==null)d=t;if(wallSolid()&&f.facing<0){const w=S.arena.wall-f.station;if(w>=0)d=Math.min(d,w);}
  const db=S.divs.length?divBehind(f):null;if(db)d=Math.min(d,db.d);return d;}
function obstacleKind(f,within){const t=tableBehind(f);if(t!==null&&t<within)return'table';if(wallSolid()&&f.facing<0&&S.arena.wall-f.station<within+14)return'wall';
  const db=S.divs.length?divBehind(f):null;if(db&&db.d<within+6)return divWord(db.w);return null;}
function pinnedBy(f){return obstacleKind(f,30);}
function pinned(f){return!!pinnedBy(f);}
function roomBehind(f){return Math.abs(clampSt(f,f.station-f.facing*1000)-f.station);}
function tableInPath(D,dir,dist){
  if(!inTableLane(D.lane))return null;const b=tableBox();
  if(dir>0){if(b.l<D.station)return null;const stop=b.l-22;return D.station+dist>stop?{stop:Math.max(D.station,stop)}:null;}
  if(b.r>D.station)return null;const stop=b.r+22;return D.station-dist<stop?{stop:Math.min(D.station,stop)}:null;
}
// Can f stand at depth z (and x) without stepping into the table or onto another fighter?
function laneOK(f,z,x=f.station){
  if(z<DEP_MIN||z>DEP_MAX)return false;
  if(tableIntact()&&Math.abs(z-S.table.dep)<TD+12){const b=tableBox();if(x>b.l-28&&x<b.r+28)return false;}
  if(S.divs.length&&divLaneBlock(z,x))return false;
  for(const o of S.F){if(o===f||o.dead)continue;if(Math.abs(o.lane-z)<20&&Math.abs(o.station-x)<46)return false;}
  return true;
}
// Keep enemies on their own side of Kael and stop allies from standing inside each other.
function resolveStations(){
  const K=hero();if(!K)return;const fs=foes();
  for(let it=0;it<6;it++){
    if(!K.dead)for(const f of fs){
      if(f.downed||(f.clinch&&clinchPartner(f)===K))continue;
      const same=Math.abs(f.lane-K.lane)<34,need=same?Math.max(70,52+(K.body.bulk+f.body.bulk)*9):30,want=K.station+f.side*need;
      if((f.station-want)*f.side<0){f.station=clampSt(f,want);
        if((f.station-want)*f.side<-1&&!K.downed&&!K.clinch)K.station=clampSt(K,f.station-f.side*need);}
    }
    for(const a of S.F){if(a.team!==0||a===K||a.dead||a.downed)continue;
      for(const f of fs){if(f.downed||(f.clinch&&clinchPartner(f)===a))continue;if(Math.abs(f.lane-a.lane)>=34)continue;
        const need=Math.max(64,50+(a.body.bulk+f.body.bulk)*9),dx=f.station-a.station;if(Math.abs(dx)>=need)continue;
        let sg=Math.sign(dx)||-f.facing;
        // deep in each other on the enemy's side of Kael: the enemy belongs beyond her, not between them
        if(Math.abs(dx)<need*.5&&!K.dead&&f.side&&Math.sign(a.station-K.station)===f.side)sg=f.side;
        if(!f.clinch)f.station=clampSt(f,a.station+sg*need);
        if(Math.abs(f.station-a.station)<need-1&&!a.clinch)a.station=clampSt(a,f.station-sg*need);}
      if(!K.dead&&!K.downed&&!a.clinch&&!K.clinch){const dzz=Math.abs(a.lane-K.lane);if(dzz<44){const dx=a.station-K.station,ov=(dzz<24?48:42)-Math.abs(dx);
        if(ov>0){const sg=dx>=0?1:-1;const nx=clampSt(a,a.station+sg*ov);if(Math.abs(nx-a.station)<ov*.5)K.station=clampSt(K,K.station-sg*ov);else a.station=nx;}}}
    }
    for(let i=0;i<fs.length;i++)for(let j=i+1;j<fs.length;j++){const a=fs[i],b=fs[j];
      if(a.downed||b.downed||a.clinch||b.clinch)continue;
      const dzz=Math.abs(a.lane-b.lane);if(dzz>=44)continue;const dx=b.station-a.station,ov=(dzz<24?48:42)-Math.abs(dx);
      if(ov>0){const s=dx>=0?1:-1;a.station=clampSt(a,a.station-s*ov/2);b.station=clampSt(b,b.station+s*ov/2);}}
  }
  // still standing inside someone (pinned in a corner): the ally steps aside in depth
  for(const a of S.F){if(a.team!==0||a===K||a.dead||a.downed||a.clinch)continue;
    for(const o of S.F){if(o===a||o.dead||o.downed||(o.clinch&&clinchPartner(o)===a))continue;
      const dzz=Math.abs(o.lane-a.lane),dx=Math.abs(a.station-o.station);if(dzz>=26||dx>=40)continue;
      const up=clamp(o.lane+30,DEP_MIN,DEP_MAX),dn=clamp(o.lane-30,DEP_MIN,DEP_MAX);
      a.lane=Math.abs(up-a.lane)<=Math.abs(dn-a.lane)&&up-o.lane>=26?up:dn-o.lane<=-26?dn:up;}}
  // locked together: the held fighter stays chest to chest with the holder
  for(const c of S.clinches){const dir=Math.sign(c.b.station-c.a.station)||c.a.facing;c.b.lane=c.a.lane;c.b.station=clampSt(c.b,c.a.station+dir*clinchGap(c.a,c.b),c.a.lane);}
  for(const f of S.F)if(!f.dead)f.lane=clamp(f.lane,DEP_MIN,DEP_MAX);
}

function ptIntegrate(q,damp){const vx=(q.x-q.px)*damp,vy=(q.y-q.py)*damp;q.px=q.x;q.py=q.y;q.x+=vx;q.y+=vy+G*DT*DT;q.vx0=q.x-q.px;q.vy0=q.y-q.py;}
function stickC(a,c,L){const dx=c.x-a.x,dy=c.y-a.y,d=Math.hypot(dx,dy)||1e-6,k=(d-L)/d/(a.im+c.im);a.x+=dx*k*a.im;a.y+=dy*k*a.im;c.x-=dx*k*c.im;c.y-=dy*k*c.im;}
function groundPt(q,final,fr,dep){
  const g=S.arena.ground(q.x,dep)-q.r;if(q.y>g)q.y=g;
  wallCollide(q);if(q.x<6)q.x=6;else if(q.x>W-6)q.x=W-6;
  if(final&&q.y>=g-.5){const vx=q.x-q.px;q.px=Math.abs(vx)<.06?q.x:q.x-vx*(1-fr);if(q.vy0>0)q.py=q.y+q.vy0*.12;}
}
function capsule(q,a,b,rad,tw,final){
  const dx=b.x-a.x,dy=b.y-a.y,l2=dx*dx+dy*dy||1,t=clamp(((q.x-a.x)*dx+(q.y-a.y)*dy)/l2,0,1);
  const cx=a.x+dx*t,cy=a.y+dy*t;let nx=q.x-cx,ny=q.y-cy;const d=Math.hypot(nx,ny),R=q.r+rad;
  if(d>=R||d<1e-6)return null;nx/=d;ny/=d;const pen=R-d;
  const ia=a.im*(1-t)*tw,ib=b.im*t*tw,iq=q.im,sum=iq+ia+ib;
  q.x+=nx*pen*iq/sum;q.y+=ny*pen*iq/sum;
  if(tw){a.x-=nx*pen*ia/sum;a.y-=ny*pen*ia/sum;b.x-=nx*pen*ib/sum;b.y-=ny*pen*ib/sum;}
  if(final){const vax=lerp(a.x-a.px,b.x-b.px,t),vay=lerp(a.y-a.py,b.y-b.py,t);
    const vx=(q.x-q.px)-vax,vy=(q.y-q.py)-vay,vn=vx*nx+vy*ny,tx=vx-vn*nx,ty=vy-vn*ny;
    q.px+=tx*.35;q.py+=ty*.35;
    if(vn>0&&(q.vx0*nx+q.vy0*ny)<0){q.px+=nx*vn*.8;q.py+=ny*vn*.8;}}
  return{nx,ny,t};
}
function propsIntegrate(){
  const T=S.table;
  if(T&&T.on){if(T.state!=='broken')for(const q of T.pts)ptIntegrate(q,.996);for(const q of T.props){ptIntegrate(q,.996);q.ang+=q.spin;q.spin*=.985;}}
  for(const d of S.debris){ptIntegrate(d.a,.996);ptIntegrate(d.b,.996);}
  for(const d of S.rubble){ptIntegrate(d.a,.996);ptIntegrate(d.b,.996);}
  for(const it of S.items){if(it.stuck)continue;ptIntegrate(it.a,.996);ptIntegrate(it.b,.996);}
}
function propsSolve(final){
  const T=S.table;
  if(T&&T.on){
    if(T.state!=='broken'){for(const s of T.sticks)stickC(T.pts[s[0]],T.pts[s[1]],s[2]);for(const q of T.pts)groundPt(q,final,.85,T.dep);}
    for(const q of T.props){if(T.state!=='broken')capsule(q,T.pts[0],T.pts[1],3.5,0,final);groundPt(q,final,.6,T.dep);if(final&&q.y>=S.arena.ground(q.x,T.dep)-q.r-.5)q.spin*=.8;}
  }
  for(const d of S.debris){stickC(d.a,d.b,d.len);groundPt(d.a,final,.7,d.dep);groundPt(d.b,final,.7,d.dep);}
  for(const d of S.rubble){stickC(d.a,d.b,d.len);groundPt(d.a,final,.5,d.dep);groundPt(d.b,final,.5,d.dep);}
  for(const it of S.items){if(it.stuck)continue;stickC(it.a,it.b,it.len);groundPt(it.a,final,.75,it.dep);groundPt(it.b,final,.75,it.dep);}
}
function fighterTable(final){
  const T=S.table;if(!T||!T.on||T.state==='broken'||T.state==='toppled')return;
  for(const f of S.F){if(f.gone||Math.abs(f.dep-T.dep)>TD+10)continue;
   const vt=f.vaulting,tw=vt?lerp(.5,.03,f.sk):1,climb=vt?lerp(.3,1.4,f.sk):0;
   for(let i=0;i<f.p.length;i++){const q=f.p[i];
    // a swinging blade's point passes over the table rather than catching on it (a backswing after a vault would snag on its top)
    if(i===TIP&&f.action&&f.action.swing)continue;
    for(const sg of TABLE_SEGS){const c=capsule(q,T.pts[sg[0]],T.pts[sg[1]],sg[2],tw,final);
      if(c&&vt&&i>=KNF&&i<=FTB)q.y-=climb;
      if(c&&final&&!vt){const spd=-(q.vx0*c.nx+q.vy0*c.ny)/DT;if(spd>60)onTableContact(f,q,spd);if(S.table.state==='broken')return;}}}}
}
function onTableContact(f,q,spd){
  const T=S.table,ex=S.game.ex;
  if(T.state==='breaking'&&f===T.breakFrom){breakTable();return;}
  if(spd>140&&S.t-T.slamT>.35){T.slamT=S.t;dust(q.x,q.y,.8,f.dep);S.shake=Math.max(S.shake,5);S.hooks.sound('thud',spd);kickProps(Math.sign(q.vx0)||-f.facing,.8);
    if(ex&&ex.res&&ex.res.table==='slam'&&ex.D===f&&!ex.tableShown){ex.tableShown=true;S.popups.push({x:q.x,y:q.y-14,d:f.dep,text:'+'+ex.res.tableDmg+' table',color:'#ffc163',sub:null,size:17,age:0});}}
}
function kickProps(dir,pow){const T=S.table;if(!T)return;const top=T.state!=='broken'?tableBox().t:1e9;
  for(const q of T.props){if(q.y>top+8)continue;q.px=q.x-dir*(1+Math.random()*2.2)*pow;q.py=q.y+(2+Math.random()*3)*pow;q.spin=(Math.random()-.5)*.5*pow;}
  kickWares('T',dir,pow);}
function breakTable(){
  const T=S.table;if(!T||T.state==='broken')return;T.state='broken';
  const P=T.pts,dir=T.breakDir||1,mid={x:(P[0].x+P[1].x)/2,y:(P[0].y+P[1].y)/2},lp=(a,b,u)=>({x:lerp(a.x,b.x,u),y:lerp(a.y,b.y,u)});
  const piece=(a,b,w,kick,dd)=>{const k=()=>({x:dir*(.8+Math.random()*3)*kick,y:-(1.2+Math.random()*3)*kick}),ka=k(),kb=k();
    S.debris.push({a:{x:a.x,y:a.y,px:a.x-ka.x,py:a.y-ka.y,r:2,im:.5,vx0:0,vy0:0},b:{x:b.x,y:b.y,px:b.x-kb.x,py:b.y-kb.y,r:2,im:.5,vx0:0,vy0:0},len:Math.hypot(b.x-a.x,b.y-a.y),w,dep:T.dep+dd,club:w<6});};
  piece(P[0],{x:mid.x-2,y:mid.y},7,1,-8);piece({x:mid.x+2,y:mid.y},P[1],7,1,8);
  piece(lp(P[0],P[1],.08),P[3],4.5,.6,-TD+4);piece(lp(P[0],P[1],.92),P[2],4.5,.6,TD-4);
  piece(lp(P[0],P[1],.1),lp(P[3],P[3],0),4.5,.5,TD-4);piece(lp(P[0],P[1],.9),P[2],4.5,.5,-TD+4);
  sparks(mid,26,'#d9a06a',T.dep);dust(mid.x,S.arena.ground(mid.x,T.dep),1.5,T.dep);S.shake=Math.max(S.shake,12);S.freeze=Math.max(S.freeze,.06);
  kickProps(dir,1.6);S.hooks.sound('crack',1);bill(S.room==='kitchen'?'preptable':S.room==='lobby'?'lobbytable':'table');
  const ex=S.game.ex;if(ex&&ex.tableDmg&&!ex.tableShown){ex.tableShown=true;S.popups.push({x:mid.x,y:mid.y-22,d:T.dep,text:'+'+ex.tableDmg+' table',color:'#ffc163',sub:'Crash',size:20,age:0});}
}
function breachWall(){
  const w=S.wall;if(!w||w.state==='breached')return;w.state='breached';w.hp=0;
  const wx=S.arena.wall,g=GB,dir=w.dir||1,dz=w.breakFrom?w.breakFrom.dep:90;
  // the stretch comes down whole: stone round where he went through, and more from the top of the wall all along it (that from its
  // own generator, so the fight's dice roll as they always did)
  const R2=mulberry32(4711+(dz|0));
  for(let i=0;i<22;i++){const rn=i<14?Math.random:R2,cy=g-10-rn()*(i<14?WALL_GAP-16:WALL_TOP-30),cx=wx+5+rn()*(WALL_T-10),l=7+rn()*9,a=rn()*Math.PI,kx=dir*(.8+rn()*4),ky=-rn()*3.5,ca=Math.cos(a)*l/2,sa=Math.sin(a)*l/2;
    S.rubble.push({a:{x:cx-ca,y:cy-sa,px:cx-ca-kx,py:cy-sa-ky,r:3.5,im:.35,vx0:0,vy0:0},b:{x:cx+ca,y:cy+sa,px:cx+ca-kx*1.1,py:cy+sa-ky,r:3.5,im:.35,vx0:0,vy0:0},len:l,w:9+rn()*7,dep:clamp(i<14?dz+(rn()-.5)*70:DEP_MIN+rn()*(DEP_MAX-DEP_MIN),DEP_MIN-10,DEP_MAX+10)});}
  for(let i=0;i<4;i++)dust(wx+13,g-i*40,1.6,dz);
  sparks({x:wx+10,y:g-90},18,'#cdb7a0',dz);S.shake=Math.max(S.shake,16);S.freeze=Math.max(S.freeze,.07);S.hooks.sound('crack',1);S.hooks.sound('thud',400);
  const ex=S.game.ex;if(ex&&ex.wallDmg&&!ex.wallShown){ex.wallShown=true;S.popups.push({x:wx-10,y:g-150,d:dz,text:'+'+ex.wallDmg+' wall',color:'#ffc163',sub:'Breach',size:20,age:0});}
  S.hooks.status();
}

class Fighter{
  constructor(idx,team,name,color){this.idx=idx;this.team=team;this.name=name;this.color=color;this.facing=team?-1:1;this.side=0;
    this.hp=120;this.maxHp=120;this.dead=false;this.guarding=false;this.foot=FOOT_MAX;this.counter=false;this.vaulting=false;
    this.action=null;this.dbg={};this.lastDust=new Array(12).fill(-9);this.motor=1;this.knockUntil=-1;this.wasDown=false;this.ready=0;this.curBody=null;this.curArm=null;
    this.station=300;this.lane=90;this.dep=90;this.vdep=0;this.laneT=-9;this.stepDep=90;this.lastFoot=1;this.intent=null;this.flair=null;this.spinFace=null;this.spin=null;this.circleGuard=false;
    this.wounds={head:0,arm:0,leg:0,body:0};this.daze=0;this.downed=false;this.clinch=null;this.carry=null;this.marks=[];this.dripT=1;this.ownWeapon=null;
    this.severed=false;this.impaled=null;this.finRelease=null;this.fountain=null;this.dyingUntil=0;this.finName=null;this.sidearm=null;
    this.tgt=null;this.ally=false;this.covering=null;}
  get sk(){return(this.skill-1)/4;}
  get posture(){return footBand(this.foot);}
  set posture(v){if(v==='set')this.foot=Math.max(this.foot,4);else if(v==='committed')this.foot=clamp(this.foot,2,3);else if(v==='off')this.foot=Math.min(this.foot,1);}
  get wp(){return WEAPONS[this.weaponKey];}
  get arm(){return this.body.ua+this.body.fa;}
  get leg(){return this.body.th+this.body.sh;}
  gr(x){return S.arena.ground(x,this.dep);}
  setup(seed,weaponKey,skill,station,lane){this.seed=seed;this.body=S.hooks.body(this,genBody(seed));this.weaponKey=weaponKey;this.wdes=S.hooks.arms(this,weaponKey);this.skill=S.hooks.skill(this,skill);this.station=station;
    this.lane=lane;this.dep=lane;this.vdep=0;this.stepDep=lane;this.build();}
  build(){
    const b=this.body,fa=this.facing,sx=this.station,leg=this.leg,bm=b.mass,wp=this.wp,gr=x=>this.gr(x);
    const mk=(x,y,m,r)=>({x,y,px:x,py:y,m,im:1/m,r,fx:0,fy:0,vx0:0,vy0:0});
    const py=gr(sx)-leg*.9,cy=py-b.torso,fx=sx+fa*leg*.26,bx=sx-fa*leg*.3;
    this.p=[
      mk(sx,py,3*bm,6),mk(sx+fa*3,cy,3*bm,6),mk(sx+fa*3,cy-b.neck,1.2*bm,b.headR),
      mk(sx+fa*14,cy+b.ua*.8,.8*bm,4),mk(sx+fa*30,cy+b.ua,.6*bm,3.5),
      mk(sx+fa*4,cy+b.ua*.9,.8*bm,4),mk(sx+fa*16,cy+b.ua*1.2,.6*bm,3.5),
      mk(sx+fa*12,py+b.th*.95,1.2*bm,4.5),mk(fx,gr(fx)-3,.9*bm,3),
      mk(sx-fa*6,py+b.th*.95,1.2*bm,4.5),mk(bx,gr(bx)-3,.9*bm,3),
      mk(sx+fa*40,cy+b.ua-wp.len*.8,wp.mass,2.5)];
    this.sticks=[[PEL,CHE,b.torso],[CHE,HEAD,b.neck],[CHE,ELF,b.ua],[ELF,HAF,b.fa],[CHE,ELB,b.ua],[ELB,HAB,b.fa],
      [PEL,KNF,b.th],[KNF,FTF,b.sh],[PEL,KNB,b.th],[KNB,FTB,b.sh],[HAF,TIP,wp.len]];
    if(this.severed)this.sticks[1][3]=1;
    this.steps=[{active:false,plant:{x:this.p[FTF].x,y:this.p[FTF].y}},{active:false,plant:{x:this.p[FTB].x,y:this.p[FTB].y}}];
    this.lastPelTX=sx;this.velX=0;this.motor=this.dead?0:1;this.knockUntil=this.dead?Infinity:-1;this.wasDown=false;this.action=null;this.vaulting=false;this.stepDep=this.dep;
    const c=this.p[CHE];this.scarf=[];
    for(let i=0;i<7;i++)this.scarf.push({x:c.x-fa*i*6,y:c.y-4,px:c.x-fa*i*6,py:c.y-4});
  }
  setWeapon(k){this.weaponKey=k;this.wdes=S.hooks.arms(this,k);const wp=this.wp,t=this.p[TIP],h=this.p[HAF];this.sticks[10][2]=wp.len;t.m=wp.mass;t.im=1/wp.mass;
    t.x=t.px=h.x+this.facing*wp.len*.3;t.y=t.py=h.y-wp.len*.95;}
  guardBody(){const g=tacGuard(this),b=this.body,leg=this.leg,br=Math.sin(S.t*2.1+this.idx*1.7),gd=this.guarding,us=this.posture==='off',cm=this.posture==='committed',w=us?1.25:cm?1.1:1;
    return brawlBody(this,{px:this.station,pz:this.lane,crouch:g.crouch-(gd?.07:0)-(us?.05:cm?.02:0)+br*.006,lean:g.lean+b.posture+(gd?.05:0)+(us?-.16+.05*Math.sin(S.t*4.3+this.idx):cm?.13:0),stF:(g.sf+(cm?.08:0))*leg*b.stance*w,stB:g.sb*leg*b.stance*w,th:.2});}
  guardArm(){const g=tacGuard(this),a=this.arm,br=Math.sin(S.t*2.1+this.idx*1.7),gd=this.guarding,us=this.posture==='off',cm=this.posture==='committed',cg=gd&&this.circleGuard;
    return brawlArm(this,{hand:{sh:[(g.hx+(cm?.14:0)-(cg?.14:0))*a,(g.hy-(gd?.18:0)-(cg?.3:0)+(us?.1:0))*a+br*.8]},wAng:cg?-1.85+br*.025:g.w+(gd?g.gw:0)+(us?.35:cm?.18:0)+br*.025,
      off:g.off?{sh:us?[.45*a,.15*a]:[g.off[0]*a,(g.off[1]-(gd?.22:0))*a]}:'grip',tilt:0});}
  resolve(s){if(s.sh){const c=this.p[CHE];return{x:c.x+this.facing*s.sh[0],y:c.y+s.sh[1]};}if(s.w)return s.w;if(s.fn)return s.fn();return s;}
  pelvisY(pelX,crouch){const s0=this.steps[0],s1=this.steps[1];
    const g0=this.gr(s0.active?s0.to.x:s0.plant.x),g1=this.gr(s1.active?s1.to.x:s1.plant.x),gp=this.gr(pelX),leg=this.leg;
    const dip=this.wounds&&this.wounds.leg&&s0.active?this.wounds.leg*2.6:0;
    return Math.max((g0+g1+gp*2)/4-leg*crouch,Math.max(g0,g1)-leg*.96)+dip;}
}

// ---------- physics ----------
function spring(q,T,mm,w,z,motor,parent,react){
  if(motor<=.001)return;
  const kp=mm*w*w*motor,kd=2*z*w*mm*Math.sqrt(motor);
  let vx=(q.x-q.px)/DT,vy=(q.y-q.py)/DT;
  if(parent){vx-=(parent.x-parent.px)/DT;vy-=(parent.y-parent.py)/DT;}
  const fx=kp*(T.x-q.x)-kd*vx,fy=kp*(T.y-q.y)-kd*vy;
  q.fx+=fx;q.fy+=fy-q.m*G*motor;
  if(parent&&react){parent.fx-=fx*react;parent.fy-=fy*react;}
}
function ik(Sp,T,a,c,fa,isArm){
  const dx=T.x-Sp.x,dy=T.y-Sp.y,d0=Math.hypot(dx,dy)||1e-6,ux=dx/d0,uy=dy/d0;
  const d=clamp(d0,Math.abs(a-c)+.5,a+c-.3);
  const x=(a*a-c*c+d*d)/(2*d),h=Math.sqrt(Math.max(0,a*a-x*x));
  let nx,ny;
  if(isArm){if(fa>0){nx=-uy;ny=ux;}else{nx=uy;ny=-ux;}}
  else{if(fa>0){nx=uy;ny=-ux;}else{nx=-uy;ny=ux;}}
  return{x:Sp.x+ux*x+nx*h,y:Sp.y+uy*x+ny*h};
}
function reachClamp(Sp,T,max){const dx=T.x-Sp.x,dy=T.y-Sp.y,d=Math.hypot(dx,dy);if(d<=max)return T;return{x:Sp.x+dx/d*max,y:Sp.y+dy/d*max};}
function val(k){return typeof k.v==='function'?k.v():k.v;}
function sample(kfs,t,blend){
  if(t<=kfs[0].t)return val(kfs[0]);
  for(let i=0;i<kfs.length-1;i++){const a=kfs[i],b=kfs[i+1];
    if(t<b.t){const u=(t-a.t)/Math.max(1e-6,b.t-a.t);return blend(val(a),val(b),(b.e||sstep)(u));}}
  return val(kfs[kfs.length-1]);
}
function kickPoint(f,s){if(s.pl){const p=f.p[PEL];return{x:p.x+f.facing*s.pl[0],y:p.y+s.pl[1]};}if(s.w)return s.w;return s.fn();}
function blendBody(f,a,b,u){
  const o={px:lerp(a.px,b.px,u),pz:lerp(a.pz??f.lane,b.pz??f.lane,u),crouch:lerp(a.crouch,b.crouch,u),lean:lerp(a.lean,b.lean,u),stF:lerp(a.stF,b.stF,u),stB:lerp(a.stB,b.stB,u),th:lerp(a.th??.2,b.th??.2,u),lift:lerp(a.lift||0,b.lift||0,u),kw:lerp(a.kw||0,b.kw||0,u)};
  if(a.kick&&b.kick){const ka=kickPoint(f,a.kick),kb=kickPoint(f,b.kick);o.kick={w:{x:lerp(ka.x,kb.x,u),y:lerp(ka.y,kb.y,u)}};}else o.kick=b.kick||a.kick||null;
  return o;
}
function blendArm(f,a,b,u){
  const ha=f.resolve(a.hand),hb=f.resolve(b.hand);let off;
  if(a.off==='grip'||b.off==='grip')off='grip';
  else{const oa=f.resolve(a.off),ob=f.resolve(b.off);off={w:{x:lerp(oa.x,ob.x,u),y:lerp(oa.y,ob.y,u)}};}
  return{hand:{w:{x:lerp(ha.x,hb.x,u),y:lerp(ha.y,hb.y,u)}},wAng:lerp(a.wAng,b.wAng,u),off,tilt:lerp(a.tilt||0,b.tilt||0,u)};
}

function updateSteps(f,pelTX,bp){
  const st=f.steps,p=f.p,fa=f.facing,leg=f.leg;
  if(f.motor<.45||f.dead){st[0].active=st[1].active=false;st[0].plant={x:p[FTF].x,y:p[FTF].y};st[1].plant={x:p[FTB].x,y:p[FTB].y};f.stepDep=f.dep;return;}
  for(const s of st){if(s.active&&S.t-s.t0>=s.dur){s.active=false;s.plant={x:s.to.x,y:f.gr(s.to.x)-3};}else if(!s.active)s.plant.y=f.gr(s.plant.x)-3;}
  if(st[0].active||st[1].active)return;
  const th=(bp.th??.2)*leg;
  const dF=pelTX+fa*bp.stF-st[0].plant.x,dB=pelTX+fa*bp.stB-st[1].plant.x;
  if(Math.abs(dF)<th&&Math.abs(dB)<th){
    if(Math.abs(f.dep-f.stepDep)<leg*.2)return;
    // walking in depth: alternate steps in place so the body doesn't glide
    const k=f.lastFoot?0:1,s=st[k],x=footClamp(f,pelTX+fa*(k?bp.stB:bp.stF));
    st[k]={active:true,t0:S.t,dur:lerp(.19,.13,f.sk)*(k===1?1+.35*f.wounds.leg:1),from:{x:s.plant.x,y:s.plant.y},to:{x},lift:k===1?7-1.5*f.wounds.leg:7,plant:s.plant};
    f.lastFoot=k;f.stepDep=f.dep;return;}
  const k=Math.abs(dF)>=Math.abs(dB)?0:1,s=st[k];
  const base=pelTX+fa*(k?bp.stB:bp.stF);
  const dur=lerp(.2,.13,f.sk)*(1+Math.min(1,Math.abs(base-s.plant.x)/(leg*1.6))*.35)*(k===1?1+.35*f.wounds.leg:1);
  let x=base+clamp(f.velX,-650,650)*dur*.55;
  x=footClamp(f,clamp(x,pelTX-leg*.9,pelTX+leg*.9));
  const dx=x-s.plant.x;
  st[k]={active:true,t0:S.t,dur,from:{x:s.plant.x,y:s.plant.y},to:{x},lift:6+Math.min(16,Math.abs(dx)*.14),plant:s.plant};
  f.lastFoot=k;f.stepDep=f.dep;
}

function controlAndForces(f){
  const p=f.p,b=f.body,fa=f.facing,wp=f.wp,sk=f.sk;
  if(f.dead)f.motor=Math.max(0,f.motor-DT*(S.t<f.dyingUntil?1:4));
  else if(S.t<f.knockUntil)f.motor=Math.min(f.motor,.04);
  else{f.motor=Math.min(1,f.motor+lerp(.75,1.9,sk)*DT*(f.wasDown?.8:1));
    if(f.wasDown&&f.motor>.15){f.wasDown=false;f.foot=Math.max(f.foot,FOOT_RISE);f.lane=clamp(f.dep,DEP_MIN,DEP_MAX);f.station=clampSt(f,p[PEL].x);resolveStations();}}
  // an elf's body answers faster (f.agile, sk_elf.js): the same pose, reached sooner
  const ag=f.agile||1,w=lerp(15,30,sk)*ag,z=lerp(.36,.8,sk),wB=lerp(9,16,sk)*ag,zB=lerp(.55,.95,sk);
  let bp,ap;
  if(f.action){const lt=S.t-f.action.t0;
    if(lt>f.action.end)f.action=null;
    else{const leadA=clamp(2*z/w,.035,.07)+(wp.mass>2?.025:0),leadB=clamp(2*zB/wB,.07,.13);
      bp=sample(f.action.body,lt+leadB,(a,c,u)=>blendBody(f,a,c,u));ap=sample(f.action.arm,lt+leadA,(a,c,u)=>blendArm(f,a,c,u));}}
  if(!f.action){bp=f.guardBody();ap=f.guardArm();}
  // a fighter in a scene may walk in from beyond the edge of the stage, or off it (f.offstage)
  const m=f.motor,pelTX=f.offstage?bp.px:f.entering?clamp(bp.px,8,W-8):clampStage(bp.px),lift=bp.lift||0,vaulting=lift>2&&m>.45;
  // depth: the whole body plane is carried toward its depth target by a damped spring
  const zMax=f.zMax||DEP_MAX,tz=clamp(bp.pz??f.lane,DEP_MIN,zMax),mz=Math.pow(m,.8);
  f.vdep+=(wB*wB*mz*(tz-f.dep)-2*zB*wB*Math.sqrt(Math.max(m,.02))*f.vdep)*DT;
  if(m<.35)f.vdep*=1-5*DT;
  f.dep=clamp(f.dep+f.vdep*DT,DEP_MIN-8,zMax+8);
  f.velX=lerp(f.velX,(pelTX-f.lastPelTX)/DT,.2);f.lastPelTX=pelTX;
  if(vaulting){f.vaulting=true;f.steps[0].active=f.steps[1].active=false;}
  else{
    if(f.vaulting){f.vaulting=false;
      f.steps[0]={active:false,plant:{x:p[FTF].x,y:Math.min(p[FTF].y,f.gr(p[FTF].x)-3)}};f.steps[1]={active:false,plant:{x:p[FTB].x,y:Math.min(p[FTB].y,f.gr(p[FTB].x)-3)}};}
    updateSteps(f,pelTX,bp);
  }
  const pelTY=f.pelvisY(pelTX,bp.crouch)-lift;
  for(const q of p){q.fx=0;q.fy=0;}
  const d=f.dbg;
  d.pel={x:pelTX,y:pelTY};spring(p[PEL],d.pel,3*b.mass,wB,zB,Math.pow(m,.8),null,0);
  const lean=bp.lean;
  d.che={x:p[PEL].x+fa*Math.sin(lean)*b.torso,y:p[PEL].y-Math.cos(lean)*b.torso};
  spring(p[CHE],d.che,3*b.mass,w*1.05,z,m,p[PEL],.35);
  let tx=p[CHE].x-p[PEL].x,ty=p[CHE].y-p[PEL].y;const tl=Math.hypot(tx,ty)||1;tx/=tl;ty/=tl;
  const tt=(ap.tilt||0)*fa,ct=Math.cos(tt),sn=Math.sin(tt);
  d.head=tacHead(f,{x:p[CHE].x+(tx*ct-ty*sn)*b.neck,y:p[CHE].y+(tx*sn+ty*ct)*b.neck});
  if(!f.severed)spring(p[HEAD],d.head,1.2*b.mass,w,z,m,p[CHE],.3);
  const arm=f.arm;
  const hand=reachClamp(p[CHE],f.resolve(ap.hand),arm*.985);
  d.elF=ik(p[CHE],hand,b.ua,b.fa,fa,true);
  const aw=1-.14*Math.min(2,f.wounds.arm);
  spring(p[ELF],d.elF,.8*b.mass,w*.9*aw,z,m,p[CHE],.4);
  spring(p[HAF],hand,.6*b.mass,w*aw,z,m,p[CHE],.4);d.hand=hand;
  const wa=ap.wAng,hbx=lerp(p[HAF].x,hand.x,.6),hby=lerp(p[HAF].y,hand.y,.6),wl=f.lash?f.sticks[10][2]:wp.len;
  d.tip={x:hbx+fa*Math.cos(wa)*wl,y:hby+Math.sin(wa)*wl};
  spring(p[TIP],d.tip,(wp.off?1.2:.8)*b.mass,w*aw,z,m,p[HAF],.3);
  let off;
  if(ap.off==='grip'){const h=p[HAF],t=p[TIP];off={x:h.x+(t.x-h.x)/wp.len*wp.off,y:h.y+(t.y-h.y)/wp.len*wp.off};}
  else off=f.resolve(ap.off);
  off=reachClamp(p[CHE],off,arm*.985);d.off=off;
  d.elB=ik(p[CHE],off,b.ua,b.fa,fa,true);
  spring(p[ELB],d.elB,.8*b.mass,w*.9,z,m,p[CHE],.4);
  spring(p[HAB],off,.6*b.mass,w,z,m,p[CHE],.4);
  for(let k=0;k<2;k++){
    const kn=k?KNB:KNF,ft=k?FTB:FTF,st=f.steps[k];let fT;
    if(vaulting)fT={x:p[PEL].x-fa*(k?10:2),y:p[PEL].y+f.leg*.45};
    else{
      if(st.active){const u=clamp((S.t-st.t0)/st.dur,0,1),e=sstep(u),ty=f.gr(st.to.x)-3;fT={x:lerp(st.from.x,st.to.x,e),y:lerp(st.from.y,ty,e)-Math.sin(Math.PI*u)*st.lift};}
      else fT={x:st.plant.x,y:st.plant.y};
      if(k===0&&bp.kick&&bp.kw>.01){const kp=kickPoint(f,bp.kick);fT={x:lerp(fT.x,kp.x,bp.kw),y:lerp(fT.y,kp.y,bp.kw)};}
    }
    const hip={x:p[PEL].x+fa*(k?-2:2),y:p[PEL].y};
    const knT=ik(hip,p[ft],b.th,b.sh,fa,false);
    spring(p[kn],knT,1.2*b.mass,w*.9,z,m,p[PEL],.3);
    spring(p[ft],fT,.9*b.mass,w*1.3,.9,m,p[PEL],.15);
    if(k){d.ftB=fT;d.knB=knT;}else{d.ftF=fT;d.knF=knT;}
  }
  f.curBody={px:pelTX,pz:tz,crouch:bp.crouch,lean:bp.lean,stF:bp.stF,stB:bp.stB,th:bp.th??.2,lift:0,kw:0};
  f.curArm={hand:{w:{x:hand.x,y:hand.y}},wAng:ap.wAng,off:ap.off==='grip'?'grip':{w:{x:off.x,y:off.y}},tilt:ap.tilt||0};
}
function integrate(f){
  for(const q of f.p){
    const vx=clamp((q.x-q.px)*.998,-30,30),vy=clamp((q.y-q.py)*.998,-30,30);
    q.px=q.x;q.py=q.y;
    q.x+=vx+q.fx*q.im*DT*DT;q.y+=vy+(q.fy*q.im+G)*DT*DT;
    q.vx0=q.x-q.px;q.vy0=q.y-q.py;
  }
}
function solve(f){
  const p=f.p;
  for(const s of f.sticks){if(s[3])continue;const a=p[s[0]],c=p[s[1]];const dx=c.x-a.x,dy=c.y-a.y,d=Math.hypot(dx,dy)||1e-6;const k=(d-s[2])/d/(a.im+c.im);
    a.x+=dx*k*a.im;a.y+=dy*k*a.im;c.x-=dx*k*c.im;c.y-=dy*k*c.im;}
  if(f.severed)return;
  const a=p[HEAD],c=p[PEL],dx=c.x-a.x,dy=c.y-a.y,d=Math.hypot(dx,dy)||1e-6,mn=(f.body.torso+f.body.neck)*.78;
  if(d<mn){const k=(d-mn)/d/(a.im+c.im);a.x+=dx*k*a.im;a.y+=dy*k*a.im;c.x-=dx*k*c.im;c.y-=dy*k*c.im;}
}
function collide(f,final){
  const p=f.p,wx=S.arena.wall;
  for(let i=0;i<p.length;i++){
    const q=p[i],g=f.gr(q.x)-q.r;
    if(q.y>g)q.y=g;
    wallCollide(q);
    if(S.divs.length)divCollideQ(f,q,i,final);
    if(!f.offstage){if(q.x<8)q.x=8;else if(q.x>W-8)q.x=W-8;}
    if(!final)continue;
    if(q.y>=g-.6){
      const isFoot=i===FTF||i===FTB,planted=isFoot&&!f.steps[i===FTF?0:1].active&&f.motor>=.45;
      const vx=q.x-q.px,fr=planted?1:isFoot?.6:.32;q.px=q.x-vx*(1-fr);
      if(q.vy0>0){q.py=q.y+q.vy0*.1;const spd=q.vy0/DT;
        if(spd>(isFoot?560:250)&&S.t-f.lastDust[i]>.3){f.lastDust[i]=S.t;dust(q.x,g+q.r,clamp(spd/600,.4,1.4),f.dep);if(!isFoot&&i!==TIP&&spd>300)S.hooks.sound('thud',spd);}}
    }
    if(wx&&wallSolid()&&q.x>=wx-q.r-.5&&q.vx0>0){const spd=q.vx0/DT;q.px=q.x+q.vx0*.25;
      if(spd>180&&i!==TIP&&S.t-f.lastDust[i]>.3){f.lastDust[i]=S.t;onWallHit(f,q,spd);}}
  }
}
function scarfStep(f){
  const s=f.scarf,c=f.p[CHE],hd=f.p[HEAD],fa=f.facing;
  const ax=f.severed?c.x-fa*2:lerp(c.x,hd.x,.3)-fa*2,ay=f.severed?c.y-2:lerp(c.y,hd.y,.3);
  s[0].x=s[0].px=ax;s[0].y=s[0].py=ay;
  for(let i=1;i<s.length;i++){const q=s[i];const vx=(q.x-q.px)*.95,vy=(q.y-q.py)*.95;q.px=q.x;q.py=q.y;
    q.x+=vx+(-45+Math.sin(S.t*1.7+i*.8)*30)*DT*DT;q.y+=vy+260*DT*DT;}
  for(let it=0;it<3;it++)for(let i=1;i<s.length;i++){const a=s[i-1],b=s[i];const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1e-6,k=(d-6.5)/d;
    if(i===1){b.x-=dx*k;b.y-=dy*k;}else{a.x+=dx*k*.5;a.y+=dy*k*.5;b.x-=dx*k*.5;b.y-=dy*k*.5;}}
  for(const q of s){const g=f.gr(q.x)-1;if(q.y>g)q.y=g;}
}
function recordTrail(f){
  const tr=S.trails[f.idx];if(!tr)return;for(const e of tr)e.age+=DT;while(tr.length&&tr[0].age>tr[0].life)tr.shift();
  // no blur for a blade that is not all there: rolled up, still in its scabbard, or strung out on the lash
  if(f.lash||(f.arc&&S.t<f.arc.t0+f.arc.lock[0])||(f.sheath&&S.t<f.sheath.t0+f.sheath.out))return;
  const h=f.p[HAF],t=f.p[TIP],pl=f.p[PEL],sp=Math.hypot(t.x-t.px,t.y-t.py)/DT,rel=Math.hypot(t.x-t.px-(pl.x-pl.px),t.y-t.py-(pl.y-pl.py))/DT,fl=f.flair&&S.t>=f.flair.from&&f.flair.trail!==false;
  if((fl?rel>240:sp>330)&&f.motor>.3)tr.push({hx:lerp(h.x,t.x,fl?.12:.3),hy:lerp(h.y,t.y,fl?.12:.3),tx:t.x,ty:t.y,age:0,life:fl?.24:.1,c:fl?f.color:null,t:S.t});
}
// afterimages while a flourish is in motion
function flairStep(f){
  const fl=f.flair;if(!fl)return;if(S.t>fl.until){f.flair=null;return;}
  if(!fl.ghost||S.t<fl.from||S.t<fl.next||(f.spin&&S.t>=f.spin.t0&&S.t<=f.spin.t1))return;fl.next=S.t+.045;
  const v=Math.hypot(f.p[PEL].x-f.p[PEL].px,f.p[PEL].y-f.p[PEL].py)/DT;
  if(v<150)return;
  S.ghosts.push({pts:f.p.map(q=>[q.x,q.y]),d:f.dep,fa:f.facing,color:f.color,wk:f.weaponKey,lw:f.body.limbW,tw:f.body.torsoW,hr:f.body.headR,age:0,life:.22});
  if(S.ghosts.length>48)S.ghosts.shift();
}

// ---------- effects (each one remembers its depth) ----------
function popup(f,text,color,sub,size,dy){const h=f.p[HEAD];S.popups.push({x:h.x,y:h.y-26+(dy||0),d:f.dep,text,color,sub:sub||null,size:size||22,age:0});}
function flash(c,r,color,d){S.flashes.push({x:c.x,y:c.y,d:d||0,r,color,age:0,life:.24});}
function sparks(c,n,color,d){for(let i=0;i<n;i++){const a=-Math.PI/2+(Math.random()-.5)*2.9,s=140+Math.random()*320;
  S.sparks.push({x:c.x,y:c.y,d:d||0,vx:Math.cos(a)*s,vy:Math.sin(a)*s,age:0,life:.22+Math.random()*.3,color});}}
function ring(x,d,r,color){S.rings.push({x,d,r,color,age:0,life:.5});}
function dust(x,y,k,d,c){for(let i=0;i<5;i++)S.dusts.push({x:x+(Math.random()-.5)*14*k,y:y-2,d:(d||0)+(Math.random()-.5)*6*k,vx:(Math.random()-.5)*70*k,vy:-Math.random()*34*k,r:4+Math.random()*5*k,age:0,life:.5+Math.random()*.4,c:c||null});}
function fxStep(dt){
  for(const e of S.flashes)e.age+=dt;for(const e of S.popups)e.age+=dt;
  for(const e of S.ghosts)e.age+=dt;for(const e of S.rings)e.age+=dt;for(const e of S.callouts)e.age+=dt;
  if(S.ghosts.length)S.ghosts=S.ghosts.filter(e=>e.age<e.life);if(S.rings.length)S.rings=S.rings.filter(e=>e.age<e.life);if(S.callouts.length)S.callouts=S.callouts.filter(e=>e.age<e.life);
  for(const s of S.sparks){s.age+=dt;s.vy+=700*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;}
  for(const d of S.dusts){d.age+=dt;d.x+=d.vx*dt;d.y+=d.vy*dt;d.vx*=.97;d.vy*=.97;}
  if(S.flashes.length)S.flashes=S.flashes.filter(e=>e.age<e.life);
  if(S.sparks.length)S.sparks=S.sparks.filter(e=>e.age<e.life);
  if(S.dusts.length)S.dusts=S.dusts.filter(e=>e.age<e.life);
  if(S.popups.length)S.popups=S.popups.filter(e=>e.age<1.35);
}
function onWallHit(f,q,spd){
  if(S.wall&&S.wall.state==='breaching'&&f===S.wall.breakFrom){breachWall();return;}
  dust(q.x-4,q.y,1.1,f.dep);S.shake=Math.max(S.shake,6);S.hooks.sound('thud',spd);
  const ex=S.game.ex;
  if(ex&&ex.res&&ex.res.wallRes==='slam'&&ex.D===f&&!ex.wallShown){ex.wallShown=true;S.popups.push({x:q.x-18,y:q.y-10,d:f.dep,text:'+'+ex.res.wall+' wall',color:'#ffc163',sub:null,size:17,age:0});}
}

// ---------- techniques: the command adapts to the moment ----------
function engageGap(A,D){return 30+(A.body.bulk+D.body.bulk)*9+.55*(A.arm+A.wp.len);}
function techContext(A,D){
  const gap=Math.abs(A.station-D.station),wp=A.wp,minGap=30+(A.body.bulk+D.body.bulk)*9;
  const clinch=!wp.improv&&!wp.unarmed&&wp.key!=='dagger'&&gap<minGap+wp.len*(wp.key==='spear'?.7:.6);
  return{gap,minGap,clinch,cramped:obstacleBehind(A)<38,dh:S.arena.ground(D.station,D.lane)-S.arena.ground(A.station,A.lane),between:tableBetween(A,D),back:facingAway(D,A)};
}
// ---------- reach ----------
// A weapon at least 20 longer outreaches the other: closing in on it hands its owner a stop-hit, and once inside it the
// shorter weapon is at +2 while a long weapon forced into its butt and haft strikes is at −2.
const REACH_MARGIN=20,APPROACH_FREE=40;let REACH_GIVE=.3;
function outreaches(D,A){return!!D&&!!A&&!D.wp.unarmed&&D.wp.len-A.wp.len>=REACH_MARGIN;}
function jammedTech(A,T){return A.wp.len>=60&&!!T&&['butt','haft','choked'].includes(T.key);}
// how far out D's point meets someone coming in
function stopRange(D,A){return 30+(A.body.bulk+D.body.bulk)*9+estReach(D,'thrust')*.95;}
// closing a long distance in the same command costs tempo
function approachCost(A,D,cmd){if(!D||D.dead||D.downed||A.clinch||!(ATTACKS.includes(cmd)||cmd==='shove'))return 0;if((cmd==='slash'||cmd==='sweep')&&lashReady(A,D))return 0;
  if(cmd==='shove'){const sv=shoveVariant(A,D);if(sv&&sv.kind!=='shoulder')return 0;}
  const ex=Math.abs(A.station-D.station)-engageGap(A,D);return ex>APPROACH_FREE?Math.min(30,Math.round((ex-APPROACH_FREE)/5)):0;}
// does closing in on D, to dest (or to A's own striking distance), run onto D's longer weapon?
function stopHitFor(A,D,cmd,dest){
  if(!D||D.dead||D.downed||D.clinch||A.clinch||A.downed||D.foot<1||!outreaches(D,A)||stuckIn(D))return false;
  if(!(ATTACKS.includes(cmd)||cmd==='shove'||cmd==='advance'))return false;
  if((cmd==='slash'||cmd==='sweep')&&lashReady(A,D))return false;
  if(cmd==='shove'){const sv=shoveVariant(A,D);if(sv&&sv.kind!=='shoulder')return false;}
  if(facingAway(D,A)||tableBetween(A,D)||(S.divs.length&&divBetween(A,D)))return false;
  const gap=Math.abs(A.station-D.station),sr=stopRange(D,A);if(gap<=sr+6)return false;
  const end=dest!=null?Math.abs(dest-D.station):engageGap(A,D);return end<sr-6;}
// ---------- contextual moves ----------
// Like the techniques, the game picks these from the command and the moment, and the button names them. Unlike most techniques they
// change what the command does, not only how it looks.
const MOVES={beat:4,beatExpert:6,beatKnock:.35,setSpear:{acc:3,knock:2},haftIn:6,snareYank:40,beatGuard:2,beatCost:10,beardTempo:20,murderDmg:.8,
  shoulderCost:-20,recoverDmg:.7,pinDmg:1.2,bottleCost:-10,kickNear:[10,74],kickFar:170,bottleReach:70,bottleDepth:44,bottleRange:340,backDmg:.8,
  kickFoot:1,kickFootHit:3,kickTempo:15,bottleFoot:1,bottleLong:260,bottleSpeed:560};
// Back thrust: a hero with an enemy close in front and his target at his back drives the point back under his arm without turning
function backThrustInfo(A,D){
  if(!A||!D||A.team!==0||A.skill<RANK.veteran||A.downed||A.clinch||A.dead||D.dead||D.downed||D.clinch||D.npc)return null;
  if(!['sword','dagger','elven'].includes(A.weaponKey))return null;
  if(Math.abs(D.station-A.station)>engageGap(A,D)+24||offLine(A,D,'thrust')||tableBetween(A,D)||(S.divs.length&&divBetween(A,D)))return null;
  const dD=Math.sign(D.station-A.station)||A.facing;let E=null,bd=1e9;
  for(const o of S.F){if(o===D||o.team===A.team||!upright(o)||o.walkIn||o.clinch)continue;
    const dx=(o.station-A.station)*dD;if(dx>-12)continue;const ax=Math.abs(o.station-A.station),dz=Math.abs(o.lane-A.lane);
    if(ax>engageGap(A,o)+150||dz>60)continue;const d=ax+dz*.6;if(d<bd){bd=d;E=o;}}
  return E?{E,dir:dD}:null;}
// Haft cut: a cutting blade inside a spearman's reach takes the head off his spear
function haftCutOK(A,D){
  if(!A||!D||D.dead||D.downed||D.weaponKey!=='spear'||A.downed||A.clinch||D.clinch)return false;
  if(!['sword','axe','elven'].includes(A.weaponKey))return false;
  const gap=Math.abs(A.station-D.station);
  return gap<=stopRange(D,A)-MOVES.haftIn&&gap-engageGap(A,D)<=APPROACH_FREE&&!tableBetween(A,D)&&!(S.divs.length&&divBetween(A,D));}
// Beat the point: stepping in past a longer weapon, a Trained fighter or better knocks the point aside on the way in
function beatPoint(A,D){if(!A||!D||A.skill<2||A.wp.unarmed)return 0;return A.skill>=RANK.expert?MOVES.beatExpert:MOVES.beat;}
// Set the spear: a spearman's counter stance against a man about to come onto the point
function setSpearOK(A){
  if(!A||A.weaponKey!=='spear'||A.downed||A.clinch||A.dead)return false;
  if(A.team===0){const th=threatOn(A);if(th&&stopHitFor(th.E,A,th.cmd))return true;
    for(const E of foes()){const it=E.intent;if(it&&it.cmd==='advance'&&targetOf(E)===A){const ai=advanceInfo(E,A);if(ai&&!ai.vault&&stopHitFor(E,A,'advance',ai.x))return true;}}
    return false;}
  const T=targetOf(A);if(!T||T.dead||T.downed||!outreaches(A,T))return false;const g=Math.abs(T.station-A.station),sr=stopRange(A,T);
  return g>sr+6&&g<sr+240;}
// Kick the chair: a chair, stool or cart just in front, with the target beyond it
function kickInfo(A,D){
  if(!A||!D||A.downed||A.clinch||D.dead||D.downed||D.clinch||D.npc||!S.props.length)return null;
  if(tableBetween(A,D)||(S.divs.length&&divBetween(A,D)))return null;
  const fa=Math.sign(D.station-A.station)||A.facing;let best=null,bd=1e9;
  for(const P of S.props){if(P.broken||P.fixed||!['chair','stool','cart'].includes(P.type))continue;
    const px=P.box.cx,ahead=(px-A.station)*fa,beyond=(D.station-px)*fa;
    if(ahead<MOVES.kickNear[0]||ahead>MOVES.kickNear[1]||beyond<16||beyond>MOVES.kickFar)continue;
    if(Math.abs(P.dep-A.lane)>P.dz+18||Math.abs(D.lane-P.dep)>44)continue;
    if(ahead+beyond<bd){bd=ahead+beyond;best={P,ahead,beyond,fa};}}
  return best;}
// Bottle throw: a bottle or tankard on a table beside you, and the target out of reach
function bottleInfo(A,D){
  if(!A||!D||A.downed||A.clinch||D.dead||D.downed||D.clinch||D.npc||D.walkIn)return null;
  const gap=Math.abs(D.station-A.station);if(gap-engageGap(A,D)<=APPROACH_FREE+10||gap>MOVES.bottleRange)return null;
  if(S.divs.length&&divBetween(A,D))return null;
  const near=(x,d)=>Math.abs(x-A.station)<=MOVES.bottleReach&&Math.abs(d-A.lane)<=MOVES.bottleDepth&&!(S.divs.length&&divOnSeg(A.station,A.lane,x,clamp(d,DEP_MIN,DEP_MAX),6));
  let best=null,bd=1e9;
  for(const it of S.wares){if(it.gone||it.fly||it.carry||it.kind!=='bottle'||!it.host||!near(it.x,it.dep))continue;const d=Math.abs(it.x-A.station);if(d<bd){bd=d;best={src:'ware',ref:it,what:'bottle'};}}
  const T=S.table;if(T&&T.on&&T.state==='intact')for(const q of T.props){if(!near(q.x,T.dep))continue;const d=Math.abs(q.x-A.station);if(d<bd){bd=d;best={src:'prop',ref:q,what:q.kind==='mug'?'mug':'bottle'};}}
  return best;}
// what Shove becomes: a kick that sends a chair into him, a thrown bottle, or a shoulder check on a man off balance
function shoveVariant(A,D,op){
  if(!A||!D||A.downed||A.clinch||A.dead||D.dead||D.downed||D.clinch||D.npc)return null;
  const k=op?null:kickInfo(A,D);if(k)return{kind:'kick',...k,cost:0};
  const b=op?null:bottleInfo(A,D);if(b)return{kind:'bottle',...b,cost:MOVES.bottleCost};
  if(D.posture==='off'&&!tableBetween(A,D)&&!(S.divs.length&&divBetween(A,D)))return{kind:'shoulder',cost:MOVES.shoulderCost};
  return null;}
// the change to a command's base tempo from the move it becomes
function moveCost(A,D,cmd,op){if(!A||!D||A.downed||A.clinch||D.dead)return 0;
  if(ATTACKS.includes(cmd)){const T=pickTechnique(A,D,cmd);return T.cost||0;}
  if(cmd==='shove'){const v=shoveVariant(A,D,op);return v?v.cost:0;}
  return 0;}
function estReach(A,kind,T){if(T&&T.kick)return A.leg*.8;const a=A.arm,l=A.wp.len;return kind==='thrust'?a*.9+l*.88:kind==='sweep'?a*.6+l*.7:a*.68+l*.72+6;}
function pickTechnique(A,D,kind){
  if(D.downed&&!D.dead)return groundTechnique(A,D,kind);
  const c=techContext(A,D),wk=A.wp.key,sk=A.sk,len=A.wp.len,butt=A.wp.butt,realW=!A.wp.improv&&!A.wp.unarmed;
  const longApp=c.gap-engageGap(A,D)>140,sw=sk<.2?'committed ':sk>.8?'measured ':'';
  const T={kind,key:'std',name:'',why:'',tags:[],acc:0,dmg:1,along:null,ang:null,amp:1,overlap:0,reach:null,anchor:null,kick:false,vault:false,around:null,rising:false,descend:false,windCap:null,passing:false,
    flair:null,multi:null,knock:1,kdEase:0};
  if(kind==='slash'&&realW&&haftCutOK(A,D)){T.key='haftcut';T.name='Haft cut';T.haftCut=true;T.move=true;T.anchor='haft';
    T.why=`Inside the reach of ${D.name}'s spear, the cut goes for the shaft: a hit takes the head off and leaves him a pole.`;T.tags.push('At the weapon');}
  else if(kind==='sweep'){
    T.anchor='shin';T.tags.push('Low line');
    if(wk==='elven'&&realW&&!c.cramped&&lashReady(A,D)){T.key='snare';T.lash=true;T.snare=true;T.move=true;T.name='Lash snare';T.acc=LASH.acc;T.dmg=LASH.dmg;T.knock=LASH.knock;
      T.why=`The segments unlock and wrap ${D.name}'s ankle, then yank him ${MOVES.snareYank} in: Committed or worse, he goes down.`;T.tags.push('Unbound');}
    else if(wk==='dagger'&&realW&&!c.clinch&&(c.back||(offLine(A,D,'sweep')&&holdsAngle(A,D)))){T.key='hamstring';T.name='Hamstring';T.hamstring=true;T.move=true;T.anchor='knee';T.along=len*.85;T.edge=true;
      T.why=`From ${c.back?'behind':'off his line'}, the dagger cuts the back of the knee: no knockdown, but he limps from now on.`;}
    else if(wk==='shaft'){T.key='shaftsweep';T.name='Low shaft sweep';T.why='The bare shaft sweeps along the ground at shin height.';T.along=len*.55;T.ang=a=>a-.1;}
    else if(wk==='dagger'){T.key='kick';T.name='Reaping kick';T.why='A dagger is too short to reach the legs, so the lead foot reaps the ankle instead.';T.kick=true;}
    else if(!realW){T.key='kick';T.name='Leg kick';T.why=A.wp.unarmed?'With bare hands, the lead foot goes for the leg.':'Too short to reach the legs, so the lead foot kicks the knee.';T.kick=true;}
    else if(wk==='spear'&&c.clinch){T.key='buttsweep';T.name='Butt sweep';T.why='Too close for the shaft, so the butt end hooks behind the ankle.';T.along=-butt*.9;T.ang=a=>a-Math.PI+.2;}
    else if(wk==='spear'){T.key='shaftsweep';T.name='Low shaft sweep';T.why='The long shaft sweeps along the ground at shin height.';T.along=len*.55;T.ang=a=>a-.1;}
    else if(wk==='axe'){T.key='hook';T.name='Hooking leg sweep';T.why='The axe head hooks behind the ankle and pulls the foot out.';T.along=len*.95;}
    else if(wk==='elven'){T.key='lowcut';T.name='Reaping arc';T.why='The curve of the blade hooks round the back of the ankle as it cuts: a Committed fighter goes down more easily.';T.along=len*.78;T.kdEase=1;}
    else{T.key='lowcut';T.name='Low-line cut';T.why='The blade drops under the guard to take the lead leg.';T.along=len*.75;}
  }else if(!realW){
    T.tags.push(A.wp.unarmed?'Unarmed':'Improvised');
    if(kind==='thrust')T.name=wn(A,{fists:'Straight punch',bottle:'Bottle jab',mug:'Tankard jab',stone:'Stone jab',club:'Club jab',chairleg:'Chair-leg jab',shard:'Glass stab',shaft:'Shaft jab'},'Jab');
    else if(kind==='slash')T.name=wn(A,{fists:'Hook punch',bottle:'Bottle swing',mug:'Tankard swing',stone:'Stone swing',club:'Club swing',chairleg:'Chair-leg swing',shard:'Glass slash',shaft:'Staff swing'},'Swing');
    else T.name=wn(A,{fists:'Hammer fist',bottle:'Bottle smash',mug:'Tankard smash',stone:'Stone smash',club:'Overhead club',chairleg:'Chair-leg smash',shard:'Downward stab',shaft:'Staff smash'},'Smash');
    T.why=A.wp.unarmed?'No weapon in hand, so it comes down to fists.':wk==='shaft'?'The head is gone, so what is left is fought like a staff.':`Whatever is in reach will do: a ${A.wp.name.toLowerCase()}.`;
  }else if(c.clinch){
    T.tags.push('Clinch range');
    if(wk==='spear'){T.key='butt';T.name=kind==='overhead'?'Butt slam':kind==='thrust'?'Butt jab':'Butt strike';T.why='Too close for the point, so the spear is reversed and driven butt-first.';T.along=-butt*.9;T.ang=kind==='overhead'?(a=>a-Math.PI+.7):(a=>a-Math.PI+.15);T.dmg=.8;}
    else if(wk==='axe'){
      if(kind==='overhead'){T.key='choked';T.name='Choked chop';T.why='Close in, the grip slides up the haft for a short chop.';T.along=len*.6;T.amp=.6;T.dmg=.85;}
      else{T.key='haft';T.name='Haft check';T.why='No room to swing the head, so both hands drive the haft into the chest.';T.along=-6;T.ang=()=>-1.45;T.anchor='chest';T.dmg=.75;}}
    else if(wk==='elven'&&kind==='thrust'){T.key='halfsword';T.name='Spine thrust';T.why='Inside its length, the back of the blade is braced along the forearm for a short thrust.';T.along=len*.55;T.reach=.7;T.acc=1;T.dmg=.9;}
    else if(wk==='elven'){T.key='pommel';T.name=kind==='overhead'?'Hilt-ring hammer':'Hilt-ring strike';T.why='Too close to cut, so the ring at the end of the hilt is driven into the face.';T.along=-butt;T.ang=kind==='overhead'?(a=>a-Math.PI+.9):(a=>a-Math.PI+.5);T.anchor='face';T.acc=1;T.dmg=.8;}
    else if(kind==='thrust'){T.key='halfsword';T.name='Half-sword thrust';T.why='Inside the blade’s length, the grip chokes up for a short, braced thrust.';T.along=len*.55;T.reach=.7;T.acc=1;T.dmg=.9;}
    else{T.key='pommel';T.name=kind==='overhead'?'Hammer pommel':'Pommel strike';T.why='Inside the blade’s arc, so the pommel is driven into the face instead.';T.along=-butt;T.ang=kind==='overhead'?(a=>a-Math.PI+.9):(a=>a-Math.PI+.5);T.anchor='face';T.acc=1;T.dmg=.8;}
  }else if(kind==='thrust'){
    const bt=backThrustInfo(A,D);
    if(bt){T.key='backthrust';T.name='Back thrust';T.acc=1;T.dmg=MOVES.backDmg;T.backT=bt.E;T.move=true;
      T.why=`${bt.E.name} stands in front, so ${A.name} keeps facing ${bt.E.name} and drives the point back under his arm.`;T.tags.push('Behind him');}
    else if(D.guarding&&A.skill>=RANK.veteran&&['sword','dagger','spear'].includes(wk)&&!longApp){T.key='beatthrust';T.name='Beat and thrust';T.beat=true;T.cost=MOVES.beatCost;T.move=true;
      T.why='The blade beats the guard aside and the point follows it in: the guard adds only +2, and a miss is no free riposte.';T.tags.push('Into the guard');}
    else if(pinned(D)&&!longApp){T.key='pinwall';T.name='Pin to the '+pinnedBy(D);T.dmg=MOVES.pinDmg;T.pinWall=true;T.move=true;
      T.why=`${D.name} has his back to the ${pinnedBy(D)}: the point pins him there, and he cannot step back or aside on his next turn.`;T.tags.push('Pinned');}
    else if(longApp){T.key='passing';T.name='Passing lunge';T.why='The long approach becomes a passing step that extends as the lead foot lands.';T.passing=true;T.overlap=.12;T.dmg=1.1;T.tags.push('Long approach');}
    else if(c.dh<-18){T.name='Rising thrust';T.why='Fighting uphill, the point drives upward under the guard.';T.tags.push('Uphill');}
    else if(c.dh>18){T.name='Downward stab';T.why='From higher ground the point is driven down over the guard.';T.tags.push('High ground');}
    else if(c.cramped){T.key='channel';T.name='Channelled thrust';T.why='An obstacle at the back keeps the thrust on a straight, compact line.';T.amp=.6;T.tags.push('Cramped');}
    else{T.name={spear:'Full-extension thrust',sword:'Straight thrust',axe:'Spike jab',dagger:'Gut stab',elven:'Hooking thrust'}[wk];T.why=wk==='spear'?'Open ground lets the spear use its full reach.':wk==='elven'?'The curve carries the point round a raised guard instead of into it.':'Open ground allows a full, straight extension.';}
  }else if(kind==='slash'){
    if(wk==='elven'&&!c.cramped&&lashReady(A,D)){
      if(A.skill>=RANK.expert&&realWeapon(D.weaponKey)&&!D.wp.improv&&(D.guarding||outreaches(D,A))){T.key='lashdisarm';T.lash=true;T.lashDisarm=true;T.move=true;T.name='Lash disarm';T.anchor='weapon';
        T.why=`The segments wrap ${D.name}'s ${D.guarding?'raised ':''}${D.wp.name.toLowerCase()} and pull: a hit or a block becomes a disarm roll, from out of reach.`;T.acc=LASH.acc;T.dmg=0;T.knock=0;T.tags.push('Unbound','At the weapon');}
      else{T.key='lash';T.lash=true;T.name='Unbound lash';T.why='Out of reach, so the segments unlock and the blade lashes out on a thread of light, then locks again.';
        T.acc=LASH.acc;T.dmg=LASH.dmg;T.knock=LASH.knock;T.tags.push('Unbound');}}
    else if(A.posture==='off'&&c.gap-engageGap(A,D)<=APPROACH_FREE){T.key='recover';T.name='Recovering cut';T.recov=true;T.move=true;T.dmg=MOVES.recoverDmg;T.amp=.6;
      T.why='Off balance, the cut is kept short so the weight comes back under him: it buys back a pip of balance instead of spending one.';T.tags.push('Recovering');}
    else if(wk==='axe'&&D.guarding){T.key='beard';T.name='Beard hook';T.beard=true;T.move=true;
      T.why=`The hooked beard of the axe catches ${D.name}'s raised weapon and drags it down: on a hit or a block his weapon is pinned (+${MOVES.beardTempo} tempo to him).`;T.tags.push('Into the guard');}
    else if(c.cramped){T.key='shortarc';T.name='Short-arc cut';T.why='With an obstacle at the back there is no room for a full windup.';T.amp=.6;T.windCap=-1.85;T.acc=-1;T.tags.push('Cramped');}
    else if(c.dh<-18){T.key='rising';T.name='Rising cut';T.why='From lower ground the blade comes up from under the guard.';T.rising=true;T.acc=-1;T.tags.push('Uphill');}
    else if(c.dh>18){T.key='descending';T.name='Descending cut';T.why='From higher ground the cut falls steeply onto the target.';T.descend=true;T.dmg=1.1;T.tags.push('High ground');}
    else if(longApp){T.key='running';T.name='Running cut';T.why='The windup starts mid-stride so the cut lands as the run ends.';T.overlap=.14;T.tags.push('Long approach');}
    else T.name=cap(sw+{sword:'diagonal cut',axe:'cleaving swing',spear:'shaft slash',dagger:'hooking cut',elven:'crescent cut'}[wk]);
  }else{
    if(wk==='sword'&&D.guarding&&A.skill>=RANK.expert){T.key='murder';T.name='Murder-stroke';T.murder=true;T.move=true;T.dmg=MOVES.murderDmg;T.along=-A.wp.butt*.9;T.ang=a=>a-Math.PI+.9;T.anchor='face';
      T.why=`The sword is reversed and swung by the blade, so the crossguard hammers through ${D.name}'s guard: guard broken and him dazed, hit or block.`;T.tags.push('Into the guard');}
    else if(c.cramped){T.key='chokedover';T.name='Choked overhead';T.why='An obstacle at the back cuts the windup short.';T.amp=.6;T.windCap=-2.2;T.acc=-1;T.tags.push('Cramped');}
    else if(c.dh>18){T.key='plunge';T.name='Plunging blow';T.why='Striking down from higher ground puts body weight behind the blow.';T.descend=true;T.tags.push('High ground');}
    else T.name=cap(sw+(wk==='axe'?'cleaving overhead':wk==='elven'?'falling crescent':'overhead blow'));
  }
  // the arc-blade: thrusts hook round a guard, the cut is drawn deeper, and it needs little room
  if(wk==='elven'&&realW){
    if(kind==='thrust'&&!c.clinch){T.hook=true;T.tags.push('Hooks the guard');}
    if(kind==='slash'&&T.key==='std'){T.dmg=1.1;T.why='The curved edge is drawn through the cut instead of chopped, so it bites deeper.';}
    if(kind==='slash'&&T.key==='shortarc'){T.name='Tight crescent';T.acc=0;T.why='A light curved blade needs little room: the cut is drawn short instead of swung.';}}
  // a divider between them: cut through it, go round the end of it, or hit it
  const dvp=!D.downed&&S.divs.length&&!T.lash?divAttackPlan(A,D,kind,T):null;
  // skill: crowd techniques first, then flourishes on open ground
  const openG=!c.clinch&&!c.cramped&&!c.between&&!dvp;
  if(openG&&realW&&kind==='slash'&&!T.lash&&!T.move){
    const W2=whirlPartner(A,D),C2=W2?null:cleavePartner(A,D);
    if(W2){Object.assign(T,{key:'whirlwind',name:'Whirlwind',flair:'whirl',multi:{type:'whirl',D2:W2},dmg:1.1,knock:1.2,rising:false,descend:false,amp:1,windCap:null,
      why:`${W2.name} is close behind, so the cut spins all the way round to take both.`});T.tags.push('Crowd');}
    else if(C2){Object.assign(T,{key:'cleave',name:wk==='axe'?'Wide cleave':wk==='spear'?'Wide shaft sweep':wk==='elven'?'Sweeping crescent':'Sweeping cleave',multi:{type:'cleave',D2:C2},
      why:`${C2.name} stands beside ${D.name}, so the cut carries on into both.`});T.tags.push('Crowd');}
  }
  if(openG&&realW&&!T.multi&&A.skill>=RANK.expert&&['std','running','passing','lowcut','hook','shaftsweep','kick'].includes(T.key)){
    const fl=flourish(A,D,kind,c);if(fl){Object.assign(T,fl);T.tags.push('Flourish');}}
  if(!T.why)T.why=sk<.2?'A novice telegraphs it: big windup, overswing and a slow recovery.':sk>.8?'A master keeps it compact and recovers at once.':'Open ground allows the full motion.';
  if(c.between){const b=tableBox(),fa=Math.sign(D.station-A.station)||A.facing,near=fa>0?b.l:b.r,far=fa>0?b.r:b.l,est=D.station-fa*estReach(A,kind,T);
    if((est-(near-fa*22))*fa>0){
      const z=detourLane(A,D),roomFar=(est-(far+fa*(30+A.leg*.3)))*fa>=0;
      if(z!==null&&roomFar&&(sk<.6||A.wp.mass>3)){T.around=z;T.name='Circling '+lowFirst(T.name);T.why='The table is in the way, so the approach goes around it. '+T.why;T.tags.push('Around the table');}
      else{T.vault=true;T.name='Vaulting '+lowFirst(T.name);T.why='The table is in the way, so the approach vaults it. '+T.why;T.acc-=1;T.tags.push('Vault');}}
    else T.tags.push('Over the table');}
  else if(dvp)divApplyPlan(T,dvp,D);
  else if(offLine(A,D,kind)){
    if(holdsAngle(A,D)){T.tags.push('From the angle');T.why='Already off the line, the attack comes in at an angle. '+T.why;}
    else{T.tags.push('Off line');T.why='Out of line, so the attacker has to turn and step in first. '+T.why;}}
  if(c.back){T.tags.push('From behind');T.why=D.name+' is facing the other way. '+T.why;}
  T.tags.push(A.wp.name,SKILLS[A.skill-1]);
  return T;
}

// ---------- rules ----------
// the bigger side acts a little slower, for each fighter more than the ones they face
function crowdFactor(f){const a=f.team===1?foes().length:heroes().length,b=f.team===1?heroes().length:foes().length;return 1+.22*Math.max(0,a-Math.max(1,b));}
// extra: a change to the base cost from the contextual move the command becomes (moveCost)
function actionCost(f,cmd,extra){const atk=ATTACKS.includes(cmd)||cmd==='shove';
  return Math.round((ACTIONS[cmd].cost+(extra||0)+(cmd==='stab'&&f.sidearm==='sheathed'?12:0))*(atk?f.wp.tempo:1)*lerp(1.25,.8,f.sk)*crowdFactor(f));}
function actorAt(r){let best=-1;for(const f of S.F){if(f.dead||f.npc)continue;const i=f.idx;
  if(best<0||r[i]<r[best]||(r[i]===r[best]&&(f.skill>S.F[best].skill||(f.skill===S.F[best].skill&&i<best))))best=i;}return best;}
function nextActor(){return actorAt(S.F.map(f=>f.ready));}
// pv previews a choice: {i, cost, delay, delayIdx, now (paid immediately, as in an opening)}
function turnOrder(n,pv){const r=S.F.map(f=>f.ready),c=S.F.map(f=>actionCost(f,'slash')),out=[];
  if(pv&&pv.now){r[pv.i]+=pv.cost;if(pv.delayIdx!=null)r[pv.delayIdx]+=pv.delay||0;}
  for(let i=0;i<n;i++){const k=actorAt(r);if(k<0)break;out.push(k);
    if(pv&&!pv.now&&i===0&&k===pv.i){r[k]+=pv.cost;if(pv.delayIdx!=null)r[pv.delayIdx]+=pv.delay||0;}else r[k]+=c[k];}
  return out;}
function openCost(f,k,o){if(k==='hold')return 0;const oo=o===undefined?S.opening:o,x=oo&&oo.opp?moveCost(f,oo.opp,k,true):0;return Math.round(actionCost(f,k,x)*.5*chainTempo(f,o));}
function computeMods(A,D,kind,opening,T){
  const act=ACTIONS[kind],hA=S.arena.ground(A.station,A.lane),hD=S.arena.ground(D.station,D.lane);
  const dirty=!!(T&&T.dirty),down=!!D.downed&&!D.dead,hgt=down?0:(hD-hA)>18?2:(hA-hD)>18?-2:0;
  let ang=down||dirty?0:angleMod(A,D,kind);if(kind==='thrust'&&ang<0)ang=ANSWER.offLineThrust;
  const held=heldBy(D),Sh=shieldFor(A,D);
  const mods=[['skill',A.skill],['weapon',dirty?0:A.wp.acc],['stance',act.acc],['height',hgt],['technique',T?T.acc:0],['opening',opening?3:0],['chain',chainHit(A,opening)],
    ['pinned',!down&&pinned(D)?2:0],[footLabel(A),post(A).atk],[ang>0?'angle':'off line',ang],['from behind',!down&&backExposed(D,A)?2:0],
    ['arm wound',-armPen(A)],['outclassed',outclassMod(A,D)],['dazed',A.daze?-2:0],['held',held&&held!==A?(D.clinch.behind?3:2):0],['shield',Sh?-4:0],
    [jammedTech(A,T)?'jammed':'inside the reach',down||dirty||A.clinch?0:jammedTech(A,T)?-2:outreaches(D,A)?2:0],['in shadow',!down&&inShadow(D)?-1:0],
    ['feint',down?0:feintBonus(A,D)],['set spear',T&&T.setSpear?MOVES.setSpear.acc:0],['point beaten',-(T&&T.beaten||0)]];
  const gb=D.guarding&&!down?(kind==='overhead'||(T&&T.hook)?2:T&&T.beat?MOVES.beatGuard:kind==='sweep'?ANSWER.guardSweep:4):0,pd=down?-2:post(D).def,dz=D.daze&&!down?-2:0;
  const ctr=D.counter&&!down&&!dirty?(kind==='overhead'?ANSWER.ctrOverhead:kind==='thrust'?ANSWER.ctrThrust:0):0;
  const hop=!down&&kind==='sweep'&&D.lastAct==='withdraw'&&!D.react?ANSWER.hopBack:0,rb=down?0:readBonus(A,D,kind),fr=down?0:feintRead(A,D);
  const rx=down||dirty?0:reactDef(D,kind);
  const defMods=[['parry',gb],[down?'on the ground':post(D).name.toLowerCase(),pd],['dazed',dz],['counter',ctr],['stepped back',hop],
    [D.react?REACT_NAME[D.react].toLowerCase():'reaction',rx],['read',rb],['saw the feint',fr]];
  return{mods,bonus:mods.reduce((s,m)=>s+m[1],0),def:10+D.skill+gb+pd+dz+ctr+hop+rx+rb+fr,defMods,hgt};
}
// a crit needs a natural 17 or better and a total 12 over DEF; a natural 20 always crits
const CRIT_ROLL=17,CRIT_OVER=12,OVER_FLOOR=6;
function isCrit(roll,total,def){return roll===20||(roll>=CRIT_ROLL&&total>=def+CRIT_OVER);}
function outcomeOf(roll,total,def){return roll===1?'fumble':isCrit(roll,total,def)?'crit':total>=def?'hit':total>=def-4?'block':'dodge';}
function critChance(c){let n=0;for(let r=2;r<=20;r++)if(isCrit(r,r+c.bonus,c.def))n++;return n/20;}
function hitChanceT(A,D,kind,opening,T){const c=computeMods(A,D,kind,opening,T);let n=0;for(let r=2;r<=20;r++)if(r===20||r+c.bonus>=c.def)n++;return n/20;}
function hitChance(A,D,kind,opening){return hitChanceT(A,D,kind,opening,pickTechnique(A,D,kind));}
function resolveAttack(A,D,kind,opening,T){
  T=T||pickTechnique(A,D,kind);
  if(T.into){const c=computeMods(A,D,kind,opening,T);return{roll:0,mods:c.mods,defMods:c.defMods,bonus:c.bonus,total:0,def:c.def,out:'wall',dmg:0,dice:[],wall:0,wallRes:null,wallStruct:0,knock:0,kd:false,hgDmg:0,
    table:null,tableDmg:0,mult:1,seed:(S.rng()*1e9)|0,kind,tech:T,guarded:false,guardBreak:false,back:false,shatter:false,div:T.into,divStruct:T.struct||1,divBreak:!!T.breaks,divRes:null,divDmg:0};}
  const act=ACTIONS[kind],wp=A.wp,r=S.rng,c=computeMods(A,D,kind,opening,T),fa=Math.sign(D.station-A.station)||A.facing;
  const roll=1+Math.floor(r()*20),total=roll+c.bonus,def=c.def;
  const out=outcomeOf(roll,total,def);
  noteRead(A,D,kind);A.feint=null;A.feintRead=null;
  // a blow at the weapon itself: a hit on the haft takes the spearhead off; a lash that meets the weapon, hit or block, wraps it
  if((T.haftCut&&(out==='hit'||out==='crit'))||(T.lashDisarm&&(out==='hit'||out==='crit'||out==='block')))
    return{roll,mods:c.mods,defMods:c.defMods,bonus:c.bonus,total,def,out,dmg:0,dice:[],wall:0,wallRes:null,wallStruct:0,knock:0,kd:false,hgDmg:0,table:null,tableDmg:0,mult:0,seed:(r()*1e9)|0,kind,tech:T,
      guarded:false,guardBreak:false,flat:false,drive:null,propDmg:0,back:false,shatter:false,div:null,divRes:null,divDmg:0,divStruct:0,kdSaved:false,weaponHit:T.haftCut?'haft':'wrap',crit:out==='crit'};
  // a fighter waiting in a counter stance takes the full weight of a blow that does land
  const flat=!!D.counter&&!D.downed&&ATTACKS.includes(kind);
  const mult=act.mult*T.dmg*(A.posture==='off'&&!T.recov?.75:1)*(flat?1.25:1)*(A.hench?CREW.dmg:1);
  let dmg=0,dice=[],wall=0,wallRes=null,wallStruct=0,knock=0,kd=false,hgDmg=0,table=null,tableDmg=0,shatter=false,divW=null,divRes=null,divDmg=0,divSt=0,drive=null,propDmg=0,kdSaved=false;
  if(out==='hit'||out==='crit'){
    const [n,s,base]=T.dice||wp.dice;let sum=0;for(let i=0;i<n;i++){const d=1+Math.floor(r()*s);dice.push(d);sum+=d;}
    let raw=(sum+base)*mult;if(kind==='overhead'&&c.hgt>0){hgDmg=3;raw+=3;}if(out==='crit')raw*=2;
    dmg=Math.max(1,Math.round(raw));
    if(wp.shatter&&!T.dirty){dmg+=3;shatter=true;}
    // a killing blow becomes a finisher that suits the weapon, the attack and how the target stands
    if(D.hp-dmg<=0&&!T.fin){const F=pickFinisher(A,D,kind,T);if(F)T={...T,fin:F,anchor:F.anchor||T.anchor,ang:F.ang||T.ang,knock:(T.knock||1)*F.knock};}
    const sweep=kind==='sweep';
    knock=(sweep?(out==='crit'?18:8):out==='crit'?32+dmg*.9:12+dmg*.75)*(T.knock||1);
    // the snare pulls him in rather than knocking him away
    if(T.snare)knock=0;
    // an aimed blow carries them toward the chosen hazard, further than they would fly on their own
    const dvo=!D.downed&&!sweep&&!T.lash?driveFor(A,D):null,L0=D.lane;
    if(dvo&&dvo.dist<=knock*1.6+12){drive=dvo;knock=Math.max(knock,dvo.dist+(dvo.kind==='prop'?16:8));D.lane=dvo.lane;}
    const big=!sweep&&(out==='crit'||dmg>=28),tb=D.downed?null:tableInPath(D,fa,knock);
    if(D.downed)knock=0;
    else if(tb){table=big?'break':'slam';tableDmg=big?6:4;dmg+=tableDmg;}
    else if(wallStanding()&&S.wall&&fa>0&&D.station+knock>S.arena.wall-34){wallStruct=big?2:1;if(S.wall.hp-wallStruct<=0){wallRes='breach';wall=8;}else{wallRes='slam';wall=5;}dmg+=wall;}
    else if(S.divs.length){const dv=divInPath(D,fa,knock);if(dv){const M=DIV_MAT[dv.w.mat];divW=dv.w;divSt=big?2:1;if(dv.w.hp-divSt<=0){divRes='breach';divDmg=M.breach;}else{divRes='slam';divDmg=M.slam;}dmg+=divDmg;}}
    if(drive&&drive.kind==='prop'&&!table&&!wallRes&&!divRes){propDmg=hotRef(drive.ref)?7:4;dmg+=propDmg;}
    if(D.hp-dmg<=0&&!T.fin){const env=table==='break'?'Through the table':table?'Into the table':wallRes==='breach'?'Through the wall':wallRes?'Into the wall':
      divRes==='breach'?'Through '+divThe(divW):divRes?'Into '+divThe(divW):propDmg?'Into the '+PROP[drive.ref.type].name:null;
      if(env)T={...T,fin:{type:'cutdown',name:env,...FIN.cutdown}};}
    D.lane=L0;
    if(T.fin&&(T.fin.type==='cutdown'||T.fin.type==='knockout')){if(table==='break')T={...T,fin:{...T.fin,name:'Through the table'}};else if(wallRes==='breach')T={...T,fin:{...T.fin,name:'Through the wall'}};
      else if(divRes==='breach')T={...T,fin:{...T.fin,name:'Through '+divThe(divW)}};}
    // knockdowns come from weight. A Sweep or an Overhead puts down anyone off balance, an Overhead also floors anyone it
    // catches solidly, and a Slash or Thrust floors only on a crit from a heavy weapon. Every other blow of that weight
    // knocks three pips of footing out of them instead. A badly hurt leg counts as one step less footing.
    const margin=total-def,band=PORDER.indexOf(D.posture)+(D.wounds.leg>=2?1:0);
    // the snare floors anyone Committed or worse
    if(sweep)kd=T.snare?out==='crit'||band>=1:out==='crit'||band>=2||(T.kdEase>0&&band===1&&margin>=4-T.kdEase);
    else if(kind==='overhead')kd=out==='crit'||band>=2||margin>=OVER_FLOOR;
    else kd=out==='crit'&&wp.fam==='heavy'&&kind==='slash';
    kd=(kd&&!D.downed)||D.hp-dmg<=0;
    // a hamstring cuts the leg instead of taking it
    if(T.hamstring)kd=D.hp-dmg<=0;
    // an outclassed attacker floors the better fighter only with a crit
    if(kd&&D.hp-dmg>0&&kdBlocked(A,D,out==='crit')){kd=false;kdSaved=true;}
  }
  return{roll,mods:c.mods,defMods:c.defMods,bonus:c.bonus,total,def,out,dmg,dice,wall,wallRes,wallStruct,knock,kd,hgDmg,table,tableDmg,mult,seed:(r()*1e9)|0,kind,tech:T,guarded:D.guarding&&!T.beat&&!T.beard,guardBreak:kind==='overhead'&&D.guarding&&!D.downed&&(out==='block'||out==='hit'||out==='crit'),flat,drive,propDmg,back:!D.downed&&backExposed(D,A),shatter,div:divW,divRes,divDmg,divStruct:divSt,kdSaved};
}
function shoveMods(A,D,opening){const build=Math.round((A.body.bulk-D.body.bulk)*4),ang=angleMod(A,D,'shove');
  const mods=[['skill',A.skill],['build',build],['opening',opening?3:0],[footLabel(A),post(A).atk],[ang>0?'angle':'off line',ang],['from behind',backExposed(D,A)?2:0],['dazed',A.daze?-2:0],['outclassed',outclassMod(A,D)]];
  const defMods=[['guard',D.guarding?2:0],[post(D).name.toLowerCase(),post(D).resist],['limp',-D.wounds.leg],['dazed',D.daze?-2:0]];
  return{mods,bonus:mods.reduce((s,m)=>s+m[1],0),dc:9+D.skill+defMods.reduce((s,m)=>s+m[1],0),defMods};}
function shoveChance(A,D,opening){const c=shoveMods(A,D,opening);let n=0;for(let r=2;r<=20;r++)if(r===20||r+c.bonus>=c.dc)n++;return n/20;}
function resolveShove(A,D,opening){const c=shoveMods(A,D,opening),roll=1+Math.floor(S.rng()*20),total=roll+c.bonus;
  const ok=roll!==1&&(roll===20||total>=c.dc),crush=ok&&(roll===20||total>=c.dc+10);
  return{kind:'shove',roll,mods:c.mods,defMods:c.defMods,bonus:c.bonus,total,dc:c.dc,ok,crush,seed:(S.rng()*1e9)|0};}
const READ_MOD={dodge:2,dodgeOver:3,block:0,hit:-3,break:1,brace:1,flow:-2,gang:-2};
function readRoll(f,opp,src,depth){
  const roll=1+Math.floor(S.rng()*20),mod=READ_MOD[src]??0,bonus=f.skill*2+mod+(f.posture==='off'?-2:0),dc=12+opp.skill+depth*3;
  return{roll,bonus,total:roll+bonus,dc,ok:roll+bonus>=dc};
}

// ---------- choreography ----------
function settleStation(A,D,sx){
  const fa=Math.sign(D.station-A.station)||A.facing,tgt=D.station-fa*engageGap(A,D),a=sx-fa*45,b=sx+fa*10;
  let x=clamp(tgt,Math.min(a,b),Math.max(a,b));
  const lim=D.station-fa*70;if((x-lim)*fa>0)x=lim;
  return clampSt(A,x);
}
function anchorFor(D,T,kind){
  const P=D.p[PEL],C=D.p[CHE],Hd=D.p[HEAD];
  if(T.anchor==='down')return()=>({x:lerp(P.x,C.x,.45),y:lerp(P.y,C.y,.45)});
  if(T.anchor==='shin'){const k=D.p[KNF],f=D.p[FTF];return()=>({x:lerp(k.x,f.x,.55),y:lerp(k.y,f.y,.55)});}
  if(T.anchor==='face')return()=>({x:lerp(C.x,Hd.x,.7),y:lerp(C.y,Hd.y,.7)});
  if(T.anchor==='neck')return()=>({x:lerp(C.x,Hd.x,.55),y:lerp(C.y,Hd.y,.55)});
  if(T.anchor==='chest')return()=>({x:lerp(P.x,C.x,.82),y:lerp(P.y,C.y,.82)});
  // the moves that go for the weapon or the back of the knee
  if(T.anchor==='haft'){const h=D.p[HAF],t=D.p[TIP];return()=>({x:lerp(h.x,t.x,.62),y:lerp(h.y,t.y,.62)});}
  if(T.anchor==='weapon'){const h=D.p[HAF],t=D.p[TIP];return()=>({x:lerp(h.x,t.x,.3),y:lerp(h.y,t.y,.3)});}
  if(T.anchor==='knee'){const k=D.p[KNB],p=D.p[PEL];return()=>({x:lerp(k.x,p.x,.12),y:lerp(k.y,p.y,.12)});}
  if(kind==='slash')return()=>({x:lerp(C.x,Hd.x,.2),y:lerp(C.y,Hd.y,.2)+3});
  if(kind==='overhead')return()=>({x:lerp(C.x,Hd.x,.75),y:lerp(C.y,Hd.y,.75)});
  return()=>({x:lerp(P.x,C.x,.62),y:lerp(P.y,C.y,.62)});
}
function impactAngle(T,kind,aim){
  if(T.ang)return T.ang(aim);
  if(kind==='thrust'||T.key==='halfsword')return aim;
  if(kind==='sweep')return aim+.25;
  if(kind==='overhead')return aim+(T.descend?1:.85);
  if(T.rising)return aim-.5;
  if(T.descend)return aim+.7;
  return aim+.45;
}
function windupFor(T,kind,arm,amp,theta,A){return tacWind(A,T,windupBase(T,kind,arm,amp,theta,A),theta);}
// the hand and the blade drawn back, by the form of the blow (ATTACK.windup, sk_anim.js); amp is the windup's size
function windupBase(T,kind,arm,amp,theta,A){
  const W=attackTable(A).windup,P=T.along!==null&&T.along<0?W.butt:kind==='sweep'?W.sweep:kind==='thrust'||T.key==='halfsword'?W.thrust:kind==='overhead'?W.overhead:T.rising?W.rising:W.slash;
  let x=P.hand[0]*arm,y=P.hand[1]*arm;
  if(P.amp){if(P.amp[0])x=x*amp;if(P.amp[1])y=y*(P.ampCap!=null?Math.min(P.ampCap,amp):amp);}
  if(P.half&&T.key==='halfsword')x=x*P.half;
  let a=P.w===null?theta:P.wAmp?P.w+P.wAmp*(amp-1):P.w;
  if(P.cap&&T.windCap!==null)a=Math.max(a,T.windCap);
  return{hand:{sh:[x,y]},ang:a};
}
function followFor(T,kind,out,arm,theta,impHand,A,fa){return tacFollow(A,T,followBase(T,kind,out,arm,theta,impHand,A,fa),theta,impHand,out);}
// where the follow-through carries the hand and the blade (ATTACK.follow, sk_anim.js)
function followBase(T,kind,out,arm,theta,impHand,A,fa){
  const butt=T.along!==null&&T.along<0,F=attackTable(A).follow,sh=P=>({sh:[P.hand[0]*arm,P.hand[1]*arm]});
  if(out==='fumble')return{hand:sh(F.fumble),ang:theta+F.fumble.turn};
  if(out==='block'||out==='wall')return{hand:sh(F.block),ang:theta+(butt?F.block.butt:F.block.turn)};
  if(butt||kind==='thrust'||T.key==='halfsword'){const k=F.thrust.push;return{hand:{fn:()=>{const h=A.resolve(impHand);return{x:h.x+fa*k*arm,y:h.y};}},ang:theta};}
  const P=kind==='sweep'?F.sweep:kind==='overhead'?F.overhead:T.rising?F.rising:F.slash;
  return{hand:sh(P),ang:P.dodge!=null?theta+P.turn+(out==='dodge'?P.dodge:0):theta+P.turn};
}
function vaultLand(A,far){return far+A.facing*(26+A.leg*.3);}
function vaultLift(A,mid){const gr=x=>S.arena.ground(x,A.lane),leg=A.leg,top=tableIntact()?tableTopAt(mid):gr(mid)-TABLE_H,clr=lerp(-4,10,A.sk);
  return Math.max(8,(gr(mid)-leg*.86)-(top-7-leg*.45-clr));}
function vaultKeys(A,startX,landX,t0,run){
  const fa=A.facing,b=tableBox(),near=fa>0?b.l:b.r,far=fa>0?b.r:b.l,mid=(b.l+b.r)/2,wp=A.wp;
  const gx=near-fa*30,t1=Math.max(.12,Math.abs(gx-startX)/run),span=Math.abs(landX-gx)||1,t2=span/(run*.7)+.1;
  const L=vaultLift(A,mid),Tg=t0+t1,at=x=>Tg+Math.abs(x-gx)/span*t2;
  const Te1=at(near+fa*4),Tm=at(mid),Te2=at(far-fa*4),Tl=Tg+t2;
  // the free hand is planted on the table top as he goes over it
  const plant=wp.off?'grip':{fn:()=>({x:mid-fa*4,y:(tableIntact()?tableTopAt(mid):S.arena.ground(mid,A.lane)-TABLE_H)-5})},air=armPose(A,poseA(A,'vault'),{off:plant});
  return{Tl,
    body:bodyKeys(A,[[Tg,'vaultGather',{px:gx,lift:L*.35}],[Te1,'vaultUp',{px:near+fa*4,lift:L*.9},eOut],[Tm,'vaultTop',{px:mid,lift:L}],
      [Te2,'vaultTop',{px:far-fa*4,lift:L*.85}],[Tl,'vaultLand',{px:landX},eIn]]),
    arm:armKeys(A,[[Tg,'guard'],[Te1,air],[Te2,air],[Tl,'guard']])};
}
function contactFor(A,D,T,kind,out,fa,jx,jy){
  const grD=x=>S.arena.ground(x,D.dep),anchor=anchorFor(D,T,kind);
  const sdx=D.station-D.p[PEL].x,sdy=grD(D.station)-grD(D.p[PEL].x),ar=anchor(),a0={x:ar.x+sdx,y:ar.y+sdy};let Cfn;
  if(out==='hit'||out==='crit')Cfn=()=>{const a=anchor();return{x:a.x+jx*.4,y:a.y+jy*.4};};
  else if(out==='block'){const B={x:a0.x-fa*(14+D.body.bulk*4),y:a0.y-(kind==='sweep'?0:2)};Cfn=()=>B;}
  else if(out==='dodge'){const M={x:a0.x+jx,y:a0.y+jy};Cfn=()=>M;}
  else{const gx=a0.x-fa*28,M={x:gx,y:grD(gx)-6};Cfn=()=>M;}
  return{Cfn,C0:(out==='hit'||out==='crit')?{x:a0.x+jx*.4,y:a0.y+jy*.4}:Cfn()};
}
// Where the body has to stand, and the weapon angle at impact, for the weapon to meet C0
function aimFrom(A,T,kind,C0,fa,along,reach,leanS,crouchS,z,ja,thrust,butt,sweep){
  const b=A.body,arm=A.arm,leg=A.leg,gr=x=>S.arena.ground(x,z);let theta=0,shX=C0.x-fa*(arm*reach+Math.max(along,0)*.9);
  for(let i=0;i<3;i++){
    const pelX=shX-fa*Math.sin(leanS)*b.torso,shY=gr(pelX)-leg*crouchS-Math.cos(leanS)*b.torso;
    theta=impactAngle(T,kind,Math.atan2(C0.y-shY,fa*(C0.x-shX)))+ja;
    const hi={x:C0.x-fa*Math.cos(theta)*along,y:C0.y-Math.sin(theta)*along};
    const aa=thrust||butt?Math.atan2(hi.y-shY,fa*(hi.x-shX)):kind==='overhead'?-.2:sweep?.7:.25;
    shX=hi.x-fa*Math.cos(aa)*arm*reach;
  }
  return{strikeX:shX-fa*Math.sin(leanS)*b.torso,theta};
}
function thetaAt(A,T,kind,C,fa,px,leanS,crouchS,z){
  const shX=px+fa*Math.sin(leanS)*A.body.torso,shY=S.arena.ground(px,z)-A.leg*crouchS-Math.cos(leanS)*A.body.torso;
  return impactAngle(T,kind,Math.atan2(C.y-shY,fa*(C.x-shX)));
}
function secondaryTech(T){return{...T,acc:T.acc-2,dmg:.6,knock:.8,multi:null,flair:null,tags:[...T.tags]};}
function planAttack(A,D,kind,res,opts){
  opts=opts||{};
  const T=res.tech,fa=A.facing,sk=A.sk,wp=A.wp,b=A.body,arm=A.arm,leg=A.leg,out=res.out,snap=!!opts.snap,quick=!!opts.quick,twoH=!!wp.off;
  const fl=T.flair,res2=opts.res2||null,multi=T.multi&&res2?T.multi:null,D2=multi?multi.D2:null,whirl=!!multi&&multi.type==='whirl';
  const rnd=mulberry32(res.seed),z0=A.dep;
  let zS=strikeLane(A,D,kind);
  if(multi&&!whirl){const bn=band(kind,A)-4;zS=clamp(D.lane+clamp((D2.lane-D.lane)*.5,-bn,bn),DEP_MIN,DEP_MAX);}
  const grS=x=>S.arena.ground(x,zS);
  A.lane=zS;
  const massF=clamp(Math.sqrt(wp.mass/1.4),.72,1.55),spd=lerp(1.28,.8,sk),tac=tacOf(A,T),amp=lerp(1.22,.86,sk)*(quick?.85:1)*T.amp*tac.amp;
  const jit=(1-sk)*10+2,jx=(rnd()*2-1)*jit,jy=(rnd()*2-1)*jit,ja=(rnd()*2-1)*(.04+.18*(1-sk));
  let {Cfn,C0}=contactFor(A,D,T,kind,out,fa,jx,jy);
  if(T.into){const w=T.into,nf=fa>0?divL(w):divR(w),Cw={x:nf-fa*1.5,y:S.arena.ground(nf,zS)-A.leg*.95-A.body.torso*.5+jy*.3};C0=Cw;Cfn=()=>Cw;}
  const sweep=kind==='sweep',thrust=kind==='thrust'||T.key==='halfsword',butt=T.along!==null&&T.along<0,slide=fl==='slide';
  const fin=(out==='hit'||out==='crit')&&T.fin?T.fin:null,pierce=fin&&fin.pierce?fin.pierce*wp.len:0,hold=fin&&fin.hold||0,bite=!!(fin&&fin.bite);
  let along=T.along!==null?T.along:wp.len*(thrust?.98:.8);
  // the shape of the blow (ATTACK, sk_anim.js): the body's lean and crouch at the impact and the share of the arm out
  const gnd=!!T.ground&&!T.kick,K=attackTable(A),F=K.form,form=attackForm(K,T,kind,sweep,thrust,butt,gnd),leanS=form.lean,crouchS=form.crouch,reach=form.reach;
  let theta=0,strikeX;
  if(T.kick)strikeX=C0.x-fa*leg*(T.stomp?F.stomp.reach:F.kick.reach);
  else{const s=aimFrom(A,T,kind,C0,fa,along-pierce*.5,reach,leanS,crouchS,zS,ja,thrust,butt,sweep);strikeX=s.strikeX;theta=s.theta;}
  const startX=snap?A.curBody.px:A.station;
  if(T.lash){strikeX=startX;const shX=strikeX+fa*Math.sin(leanS)*b.torso,shY=grS(strikeX)-leg*crouchS-Math.cos(leanS)*b.torso;
    // the chain runs straight from the outstretched hand to the target, so the blade angle is the line of aim itself
    along=clamp(Math.hypot(C0.x-shX,C0.y-shY)-arm*reach*.9,wp.len,wp.len+LASH.reach+70);theta=Math.atan2(C0.y-shY,fa*(C0.x-shX))+.05+ja*.5;}
  const minGap=D.downed?16:30+(A.body.bulk+D.body.bulk)*9,lim=D.station-fa*minGap;
  if((strikeX-lim)*fa>0)strikeX=lim;
  let vault=null,around=null;
  if(T.vault&&tableIntact()){const bx=tableBox(),far=fa>0?bx.r:bx.l;
    {const lx=vaultLand(A,far)+fa*4;if((strikeX-lx)*fa<0)strikeX=lx;}
    if((strikeX-lim)*fa>0)strikeX=lim;
    strikeX=clampStage(strikeX);vault={far};
    // the landing decides where the blow comes from, so the blade's angle is worked out again from there (a low sweep keeps its line)
    if(!T.kick&&!T.lash&&!sweep)theta=thetaAt(A,T,kind,C0,fa,strikeX-fa*6,leanS,crouchS,zS)+ja;}
  else if(T.around!=null&&(T.aroundW||tableIntact())){const aw=T.aroundW,bx=aw?{l:divL(aw),r:divR(aw)}:tableBox(),near=fa>0?bx.l:bx.r,far=fa>0?bx.r:bx.l;
    {const mn=far+fa*(aw?Math.max(DIV_M+6,30+leg*.3):30+leg*.3);if((strikeX-mn)*fa<0)strikeX=mn;}
    if((strikeX-lim)*fa>0)strikeX=lim;
    strikeX=clampStage(strikeX);around={z:T.around,near,far};}
  else{const back=startX-fa*(30+Math.abs(zS-z0)*.8);if((strikeX-back)*fa<0)strikeX=back;
    if((strikeX-lim)*fa>0)strikeX=lim;
    if(tableBetween(A,D)){const bx=tableBox(),near=fa>0?bx.l:bx.r;if((strikeX-(near-fa*22))*fa>0)strikeX=near-fa*22;strikeX=clampStage(strikeX);}
    else strikeX=clampSt(A,strikeX,zS);}
  let dist=Math.hypot(strikeX-startX,(zS-z0)*.9);const run=lerp(K.run[0],K.run[1],sk)*(fl==='burst'?1.75:slide?1.4:1)*(1-.12*A.wounds.leg);
  const kW=form.wind,kS=form.strike,KT=K.time;
  const tWind=KT.wind*massF*spd*kW*(quick?.6:1)*(T.amp<1?.8:1)*tac.wind,tStrike=KT.strike*massF*spd*kS*(T.kick?.9:1)*(T.lash?1.6:1)*tac.strike,dwell=KT.dwell+KT.dwellMass*massF+hold;
  const tFollow=KT.follow*massF*(out==='block'?.7:1)*(out==='fumble'?1.6:1)*tac.follow,tRecover=KT.recover*spd*tac.recover+(out==='fumble'?.5:0);
  const tSpin=fl==='spin'?lerp(.5,.36,sk)*Math.sqrt(massF):0,tTwirl=fl==='twirl'?lerp(.56,.42,sk):0,tPre=tSpin+tTwirl;
  const st=(x,y)=>({stF:x*leg,stB:y*leg}),stn=s=>st(s[0],s[1]);
  let T1=0,Tland=0,appBody=[],appArm=[],leapK=null,insP=null;
  if(vault){const lx=vaultLand(A,vault.far),vk=vaultKeys(A,startX,lx,0,run);Tland=vk.Tl;T1=Tland+Math.max(.1,Math.abs(strikeX-lx)/run);
    appBody=[...vk.body,...bodyKeys(A,[[T1,'run',{px:strikeX-fa*6}]])];appArm=vk.arm;}
  else if(around){
    // travel the detour lane until the whole body is clear of the table, then step sideways into line
    const p1={x:around.near-fa*(18+28*(1-sk)),z:around.z},p2={x:strikeX-fa*6,z:around.z};
    const L1=Math.hypot(p1.x-startX,(p1.z-z0)*.9),L2=Math.abs(p2.x-p1.x),L3=Math.hypot(strikeX-p2.x,(zS-p2.z)*.9);
    const t1=Math.max(.14,L1/run),t2=t1+Math.max(.1,L2/run),t3=t2+Math.max(.14,L3/run);
    appBody=bodyKeys(A,[[t1,'stalk',{px:p1.x,pz:p1.z}],[t2,'stalk',{px:p2.x,pz:p2.z}],[t3,'run',{px:strikeX-fa*6,pz:zS}]]);
    T1=t3;dist=L1+L2+L3;}
  else if(fl==='leap'&&dist>=40){
    // crouch, spring, hang with the weapon raised, and bring it down as the feet land
    const L=clamp(dist*.2,34,60)*lerp(.85,1.05,sk),air=clamp(dist/430,.4,.74),Tk=.12,Tt=.22,Tpk=Tt+air*.5,Tl=Tt+air;
    appBody=bodyKeys(A,[[Tk,'leapCrouch',{px:startX+fa*3,pz:z0}],[Tt,'leapSpring',{px:startX+fa*12,pz:lerp(z0,zS,.25)},eOut],
      [Tpk,'leapTop',{px:lerp(startX,strikeX,.56),pz:lerp(z0,zS,.75),lift:L},eOut]]);
    T1=Tl;leapK={Tt,Tpk,Tl,L};}
  else if(dist>=14){T1=clamp(dist/run,.16,1.3);
    if(slide)appBody=bodyKeys(A,[[T1*.5,'slideRun',{px:lerp(startX,strikeX,.55),pz:lerp(z0,zS,.7)}],[T1,'slideDrop',{px:strikeX-fa*4,pz:zS},eOut]]);
    else appBody=bodyKeys(A,[[T1,fl==='burst'?'burst':'run',{px:strikeX-fa*6,pz:zS}]]);
    // Kael runs past a man on the floor: a quick stab on the way through, then on to the strike (sk_insure.js)
    {const E=slide?null:insuranceFor(A,D,kind,startX,strikeX,z0,zS,T);if(E){insP=insurancePlan(A,E,fa,startX,appBody[0].v,z0,T1,snap);appBody=insP.body;appArm=insP.arm;Tland=insP.Tland;T1=insP.T1;}}}
  const overlap=T1>0?Math.min((T1-Tland)*.6,.05+.16*sk+T.overlap)*(around?.4:1)*(tSpin?.4:1):0;
  let Tw0,Tw1,Timp;
  if(leapK){Tw0=leapK.Tt*.6;Timp=leapK.Tl;Tw1=Math.max(leapK.Tpk,Timp-tStrike);}
  else{Tw0=Math.max(Tland,T1-overlap);Tw1=Math.max(Tw0+tPre+(tSpin?.04:tWind*(tPre?.6:1)),T1+.04);Timp=Tw1+tStrike;}
  const Td=Timp+dwell;
  const appEnd=T.kick?strikeX-fa*4:strikeX-fa*6;
  const appX=t=>insP?insP.px(t):T1>0&&t<T1?lerp(startX,appEnd,sstep(t/T1)):appEnd,appZ=t=>insP?insP.pz(t):T1>0&&t<T1?lerp(z0,zS,sstep(t/T1)):zS;
  const kickAt=T.stomp?Cfn:()=>{const k=D.p[KNF],f2=D.p[FTF];return{x:lerp(k.x,f2.x,.8),y:lerp(k.y,f2.y,.8)};};
  const kx=(spec,w)=>T.kick?{kick:spec,kw:w}:{};
  const kth=T.kick?.9:null;
  const impStance=stn(T.passing?F.passing.stance:slide?F.slide.stance:sweep?F.sweep.stance:kind==='overhead'?F.overhead.stance:thrust?F.thrust.stance:F.slash.stance);
  // the free hand: drawn back with the windup, forward at the impact, down in the follow-through
  const offAt=o=>twoH?'grip':{sh:[o[0]*arm,o[1]*arm]},offW=offAt(K.off.wind),offI=offAt(K.off.impact),offF=offAt(K.off.follow),KA=K.tilt;
  // a finisher that runs the target through drives the hand deeper, so the point comes out the other side
  const reachIn=along-pierce,impHand={fn:()=>{const C=Cfn();return{x:C.x-fa*Math.cos(theta)*reachIn,y:C.y-Math.sin(theta)*reachIn};}};
  const holdHand=fin&&fin.lift?{fn:()=>{const h=A.resolve(impHand);return{x:h.x-fa*.04*arm,y:h.y-.2*arm};}}:impHand;
  const events=[];
  // a spin is drawn as a full turn on the spot while the windup is held, then the strike comes out of it
  const spinBody=[],spinArm=[];let spinWin=null;
  const wndPose=T.kick?null:windupFor(T,kind,arm,amp,theta,A);
  if(tSpin){
    const ta=Tw0+tSpin*.3,hold=sweep?{hand:wndPose.hand,wAng:wndPose.ang,off:offW,tilt:KA.wind}:armPose(A,poseA(A,'spinHold'),{off:offW});
    spinArm.push({t:ta,v:hold,e:eOut},{t:Tw0+tSpin,v:hold});
    spinBody.push(...bodyKeys(A,[ta,Tw0+tSpin*.65,Tw0+tSpin].map(t=>[t,sweep?'spinLow':'spin',{px:appX(t),pz:appZ(t)}])));
    spinWin={t0:Tw0+tSpin*.1,t1:Tw0+tSpin+.02};
  }
  // a twirl spins the weapon once in the hand before the windup
  const twirlArm=[];
  if(tTwirl){
    const g=GUARD[wp.key],w0=g.w,hi=kind==='overhead',cx=(hi?.06:.34)*arm,cy=(hi?-.8:-.1)*arm,R=.09*arm,N=8,offT={sh:[-.06*arm,.36*arm]};
    for(let i=1;i<=N;i++){const u=i/N,a=TAU*u;twirlArm.push({t:Tw0+tTwirl*u,v:{hand:{sh:[cx+Math.sin(a)*R,cy-Math.cos(a)*R*.6]},wAng:w0-TAU*u,off:offT,tilt:0},e:i===1?(u=>u*u):(u=>u)});}
    twirlArm.push({t:Tw0+tTwirl,v:{hand:{sh:[cx,cy-R*.6]},wAng:w0,off:offT,tilt:0}});
  }
  // a second target: the cut carries on along the arc (cleave) or spins round to the one behind (whirlwind)
  let sec=null,Tpost=Td,endX=strikeX;const extraBody=[],extraArm=[];
  if(multi){
    const fa2=whirl?-fa:fa,r2=mulberry32(res2.seed),jx2=(r2()*2-1)*jit,jy2=(r2()*2-1)*jit,out2=res2.out,T2=res2.tech;
    const cf=contactFor(A,D2,T2,kind,out2,fa2,jx2,jy2),Cfn2=cf.Cfn;
    const want=whirl?D2.station+fa*(.5*arm+wp.len*.95)*.82:aimFrom(A,T2,kind,cf.C0,fa2,along,reach,leanS,crouchS,zS,0,false,false,false).strikeX;
    const base=strikeX+fa*(whirl?10:14);let s2X=clamp(want,base-46,base+46);
    const mg2=30+(A.body.bulk+D2.body.bulk)*9,l2=D2.station-fa2*mg2;if((s2X-l2)*fa2>0)s2X=l2;
    if(whirl){const l1=D.station-fa*minGap;if((s2X-l1)*fa>0)s2X=l1;}else if((s2X-lim)*fa>0)s2X=lim;
    s2X=clampStage(s2X);endX=s2X;
    const th2=thetaAt(A,T2,kind,cf.C0,fa2,s2X,leanS,crouchS,zS);
    const imp2={fn:()=>{const C=Cfn2();return{x:C.x-fa2*Math.cos(th2)*along,y:C.y-Math.sin(th2)*along};}};
    let Timp2,Td2;
    if(!whirl){
      Timp2=Td+tStrike*.8;Td2=Timp2+dwell*.8;Tpost=Td2;
      extraBody.push({t:Timp2,v:{px:s2X,crouch:crouchS,lean:leanS+.04,...impStance,th:.95},e:sstep},{t:Td2,v:{px:s2X+fa*3,crouch:crouchS,lean:leanS+.05,...impStance,th:.95}});
      extraArm.push({t:Timp2,v:{hand:imp2,wAng:th2,off:offI,tilt:KA.impact},e:sstep},{t:Td2,v:{hand:imp2,wAng:th2+.1,off:offI,tilt:KA.impact}});
    }else{
      const tW=lerp(.6,.46,sk)*Math.sqrt(massF),Ts0=Td+.03,Ts1=Ts0+tW;Timp2=Ts0+tW*.5;Td2=Timp2+dwell;Tpost=Ts1+.04;
      const E=armPose(A,poseA(A,'whirl'));
      extraArm.push({t:Ts0+.07,v:E,e:eOut},{t:Ts1,v:E});
      extraBody.push(...bodyKeys(A,[[Ts0+.07,'whirlIn',{px:lerp(strikeX+fa*12,s2X,.35)}],[Timp2,'whirlHit',{px:s2X}],[Ts1,'whirlOut',{px:s2X}]]));
      spinWin={t0:Ts0,t1:Ts1};
    }
    const react2=planReaction(D2,A,kind,res2,Timp2,Cfn2,th2,r2,false,fa2);
    sec={D:D2,res:res2,Cfn:Cfn2,Timp:Timp2,Td:Td2,dir:fa2,react:react2,slip:react2.slip??null,theta:th2,timed:whirl};
    events.push({t:Timp2-tStrike*.8,fn:()=>S.hooks.sound('swoosh',wp.mass)});
  }
  const Tf=whirl?Tpost:Tpost+tFollow,Tr=Tf+tRecover,Tend=Tr+tac.tail;
  // the blade swings forward whole, and the segments shoot out along the line of aim for the last part of the stroke
  if(T.lash){const La=Tw1+tStrike*.35;A.lash={t0:S.t,a:La,b:Timp,c:Td+.03,d:Tf+.06,L:along};S.callouts.push({i:A.idx,text:T.name,age:0,life:clamp(Timp+.04,.75,1.4),dx:-fa*24});
    events.push({t:La-.02,fn:()=>S.hooks.sound('unroll',.55)},{t:Tf+.06,fn:()=>{S.hooks.sound('lock',.5);A.relockT=S.t;}});}
  const body=[...bodyKeys(A,[[0,snap?'now':'guard',{pz:z0}]]),...appBody.filter(k=>!(tSpin&&k.t>Tw0&&k.t<Tw0+tSpin+.1))];
  body.push(...spinBody);
  // the windup, the impact, the hold and the follow-through, in the blow's form (ATTACK.form; the kicks' own)
  const wf=T.stomp?F.stomp:slide?F.slide:T.kick?F.kick:sweep?F.sweep:kind==='overhead'?F.overhead:thrust?F.thrust:F.slash,wk=T.stomp?F.stomp.wKick:slide?F.slide.wKick:F.kick.wKick;
  if(!leapK)body.push({t:Tw1,v:{px:slide?strikeX-fa*2:strikeX-fa*K.drawBack*amp,crouch:wf.wCrouch,lean:wf.wLean,
    ...stn(slide?F.slide.wStance:K.wStance),th:kth??(tSpin?.95:.2),...kx({pl:[wk[0]*leg,wk[1]*leg]},.9)},e:eOut});
  body.push({t:Timp,v:{px:strikeX+fa*(T.kick?K.kickDrive[0]:K.drive[0]),crouch:T.stomp?F.stomp.crouch:slide?F.slide.crouch:T.kick?F.kick.crouch:leapK?F.leap.crouch:crouchS,
    lean:T.stomp?F.stomp.lean:slide?F.slide.lean:T.kick?F.kick.lean:leanS,...impStance,th:kth??.07,...kx({fn:kickAt},1)},e:eIn});
  body.push({t:Td,v:{px:strikeX+fa*(T.kick?K.kickDrive[1]:K.drive[1]),crouch:slide?F.slide.dCrouch:T.kick?F.kick.crouch:crouchS,lean:(slide?F.slide.lean:T.kick?F.kick.lean:leanS)+K.dLean,
    ...impStance,th:kth??.07,...kx({fn:kickAt},1)}});
  body.push(...extraBody);
  if(!whirl)body.push({t:Tf,v:{px:endX+fa*(pierce||bite?2:K.carry[0]+K.carry[1]*(1-sk)+(out==='fumble'?20:0)+(out==='dodge'?8:0)),crouch:crouchS+K.fCrouch,
    lean:leanS+(kind==='overhead'?F.overhead.fLean:K.fLean),...stn(K.fStance),th:kth??.1,...kx({pl:[K.fKick[0]*leg,K.fKick[1]*leg]},.7)},e:eOut});
  body.push(...bodyKeys(A,[[Tr,'guard',{px:endX},sstep],[Tend,'guard',sstep]]));
  const armK=[...armKeys(A,[[0,snap?'now':'guard']]),...appArm];
  if(T.kick)armK.push(...armKeys(A,[[Tw1,'guard'],[Tend,'guard']]));
  else{
    const wnd=wndPose;
    const multiFol=multi&&!whirl?followFor(res2.tech,kind,res2.out,arm,sec.theta,{fn:()=>{const C=sec.Cfn();return{x:C.x-fa*Math.cos(sec.theta)*along,y:C.y-Math.sin(sec.theta)*along};}},A,fa):null;
    // the lash settles on its line and is drawn back along it while the segments run home, instead of being swung through
    const fol=multiFol||(T.lash?{hand:{fn:()=>{const h=A.resolve(impHand);return{x:h.x-fa*.22*arm,y:h.y+.05*arm};}},ang:theta+.3}
      :pierce||bite?{hand:{fn:()=>{const h=A.resolve(impHand);return{x:h.x-fa*.34*arm,y:h.y+.06*arm};}},ang:theta+(bite?-.5:0)}:followFor(T,kind,out,arm,theta,impHand,A,fa));
    if((!snap||Tw0>.06)&&(!appArm.length||Tw0>Tland+.01))armK.push(...armKeys(A,[[Tw0,'guard']]));
    armK.push(...spinArm,...twirlArm);
    if(leapK&&leapK.Tpk<Tw1-.01)armK.push({t:leapK.Tpk,v:{hand:wnd.hand,wAng:wnd.ang,off:offW,tilt:KA.leap},e:eOut});
    armK.push({t:Tw1,v:{hand:wnd.hand,wAng:wnd.ang,off:offW,tilt:KA.wind},e:leapK?null:eOut},
      {t:Timp,v:{hand:impHand,wAng:theta,off:offI,tilt:KA.impact},e:T.lash?sstep:eIn},
      {t:Td,v:{hand:holdHand,wAng:theta+(thrust||butt||pierce||bite?0:T.lash?K.lashTurn:K.dwellTurn),off:offI,tilt:KA.impact}},...extraArm);
    if(!whirl)armK.push({t:Tf,v:{hand:fol.hand,wAng:fol.ang,off:offF,tilt:KA.follow},e:eOut});
    armK.push(...armKeys(A,[[Tr,'guard',sstep],[Tend,'guard']]));
  }
  body.sort((a,c)=>a.t-c.t);armK.sort((a,c)=>a.t-c.t);
  const cp=T.kick?A.p[FTF]:butt?A.p[HAF]:A.p[TIP];
  const contactSeg=T.kick?()=>[A.p[KNF],A.p[FTF]]:butt?()=>{const h=A.p[HAF],t=A.p[TIP],L=wp.len;return[h,{x:h.x+(t.x-h.x)/L*along,y:h.y+(t.y-h.y)/L*along}];}:()=>[A.p[HAF],A.p[TIP]];
  const contactVel=()=>({x:(cp.x-cp.px)/DT,y:(cp.y-cp.py)/DT});
  const react=planReaction(D,A,kind,res,Timp,Cfn,theta,rnd,snap,fa);
  events.push({t:Tw1+tStrike*.2,fn:()=>S.hooks.sound('swoosh',T.kick?.8:wp.mass)},{t:Tr,fn:()=>{A.station=settleStation(A,D,endX);}});
  if(insP)events.push(...insP.evs);
  events.push(...(react.evs||[]));
  if(sec)events.push(...(sec.react.evs||[]));
  if(vault)events.push({t:Tland,fn:()=>{dust(A.p[FTF].x,A.gr(A.p[FTF].x),.7,A.dep);S.hooks.sound('thud',220);}});
  if(leapK)events.push({t:leapK.Tl-.02,fn:()=>{const x=A.p[FTF].x,g=A.gr(x);dust(x,g,1.3,A.dep);ring(x,A.dep,74,'#ffd9a8');S.shake=Math.max(S.shake,7);S.hooks.sound('thud',380);}});
  if(slide)for(let t=T1*.5;t<Td;t+=.05)events.push({t,fn:()=>{const q=A.p[FTB];dust(q.x,A.gr(q.x),.55,A.dep);}});
  if(out==='fumble')events.push({t:Tf-.05,fn:()=>{A.motor=Math.min(A.motor,.28);spendFoot(A,FOOT_HIT);popup(A,'Fumble','#c9d0f5',null,20);const ex=S.game.ex;if(ex)considerOpening(ex,D,A,'fumble');}});
  if(spinWin)A.spin={t0:S.t+spinWin.t0,t1:S.t+spinWin.t1};
  if(fl||multi){A.flair={until:S.t+(sec?sec.Td:Timp)+.12,ghost:fl!=='twirl',next:0,from:S.t+(leapK?leapK.Tt:fl==='burst'||slide?T1*.25:Tw1)};
    S.callouts.push({i:A.idx,text:T.name,age:0,life:clamp(Timp+.04,.75,1.4),dx:-fa*24});}
  return{att:{t0:S.t,end:Tend,body,arm:armK,swing:true},react,Timp,Td,Tend,strikeX,Cfn,contactSeg,contactVel,dash:dist,theta,events,tWind:tWind+tPre,vault:!!vault,around:!!around,slip:react.slip??null,dir:fa,sec,ins:insP};
}
function planReaction(D,A,kind,res,Timp,Cfn,theta,rnd,snap,faO){
  if(res.out==='wall')return{t0:S.t,end:.25,body:bodyKeys(D,[[0,'now'],[.25,'guard']]),arm:armKeys(D,[[0,'now'],[.25,'guard']]),slip:null};
  if(D.downed&&!D.dead){const f0=faO??A.facing,evs=res.out==='dodge'?[{t:Math.max(0,Timp-.06),fn:()=>{D.vdep+=(rnd()<.5?-1:1)*110;for(const q of D.p)q.px+=f0*60*DT;}}]
      :res.out==='block'?[{t:Math.max(0,Timp-.16),fn:()=>{const C=Cfn();for(const [i,ox,oy] of [[HAF,f0*-4,10],[ELF,f0*-10,22],[TIP,f0*10,-12]]){const q=D.p[i];if(!q)continue;
        const tx=C.x+ox,ty=C.y+oy;q.px=q.x-(tx-q.x)*DT/.11;q.py=q.y-(ty-q.y)*DT/.11;}}}]:[];
    return{t0:S.t,end:Timp+.3,body:bodyKeys(D,[[0,'now']]),arm:armKeys(D,[[0,'now']]),evs,slip:null};}
  const fa=faO??A.facing,sk=D.sk,out=res.out,now=snap?'now':'guard';
  if(out==='block'){
    const lead=lerp(.12,.32,sk),Ts=Math.max(0,Timp-lead);
    const u={x:fa*Math.cos(theta),y:Math.sin(theta)};let pv={x:-u.y,y:u.x};if(pv.y>0)pv={x:-pv.x,y:-pv.y};
    const B=Cfn(),L=D.wp.len*.55;
    if(B.y>D.p[PEL].y-4)pv={x:-pv.x,y:-pv.y};
    const wl=Math.atan2(pv.y,D.facing*pv.x);
    // the blade is put across the line of the blow, at the point it will arrive, and gives a little with it
    return{t0:S.t,end:Timp+.6,
      body:bodyKeys(D,[[0,now],[Ts,'guard'],[Timp,kind==='sweep'?'blockLow':'block',eOut],[Timp+.22,'blockGive',sstep],[Timp+.6,'guard']]),
      arm:armKeys(D,[[0,now],[Ts,'guard'],[Timp-.01,'block',{hand:{w:{x:B.x-pv.x*L,y:B.y-pv.y*L}},wAng:wl},eOut],
        [Timp+.18,'block',{hand:{w:{x:B.x-pv.x*L+fa*7,y:B.y-pv.y*L+3}},wAng:wl+.1},eOut],[Timp+.6,'guard']])};
  }
  if(out==='dodge'||out==='fumble'){
    // a dodge either slips sideways out of the line (depth) or steps back along it
    // (a Slip is always out of the line, a Step back always along it)
    const slipP=out!=='dodge'||D.react==='back'?0:D.react==='slip'?1:({overhead:.75,slash:.55,thrust:.45,sweep:0}[kind]??.4)+.15*sk;
    if(slipP>0&&(slipP>=1||rnd()<slipP)){
      const dd=lerp(28,42,sk)*(D.posture==='off'?.7:1),c=[D.lane+dd,D.lane-dd].filter(z=>laneOK(D,z));
      if(c.length){
        const to=c.length>1&&rnd()<.5?c[1]:c[0],z0=D.lane,lead=lerp(.16,.32,sk),Ts=Math.max(0,Timp-lead),endT=Timp+.7;
        D.laneT=S.t;
        return{t0:S.t,end:endT,slip:to,
          body:bodyKeys(D,[[0,now],[Ts,'guard',{pz:z0}],[Timp+.02,'slip',{pz:to},eOut],[Timp+.3,'slip',{pz:to}],[endT,'guard',{pz:to},sstep]]),
          arm:armKeys(D,[[0,now],[Ts,'guard'],[Timp+.02,'slip',eOut],[endT,'guard',sstep]]),
          evs:[{t:Timp+.3,fn:()=>{D.lane=to;}}]};
      }
    }
    const lead=out==='fumble'?.05:lerp(.06,.28,sk),Ts=Math.max(0,Timp-lead),s0=D.station;
    const room=roomBehind(D);
    const dd=Math.max(0,Math.min((out==='fumble'?12:lerp(30,52,sk))*(D.posture==='off'?.6:1),room-6));
    const duck=out==='dodge'&&kind!=='overhead'&&kind!=='sweep'&&(dd<22||rnd()<.45);
    const peak=duck?'duck':'stepBack',px=duck?s0+fa*dd*.35:s0+fa*dd,endT=Timp+.75;
    return{t0:S.t,end:endT,
      body:bodyKeys(D,[[0,now],[Ts,'guard'],[Timp+.04,peak,{px},eOut],[Timp+.3,peak,{px}],[endT,'guard',sstep]]),
      arm:armKeys(D,[[0,now],[Ts,'guard'],[Timp+.04,duck?'duck':'evade',eOut],[endT,'guard',sstep]]),
      evs:[{t:Timp+.3,fn:()=>{D.station=clampSt(D,s0+fa*dd*.55);}}]};
  }
  const brace=sk>.4&&kind!=='sweep';
  return{t0:S.t,end:Timp+.2,
    body:bodyKeys(D,[[0,now],[Math.max(.05,Timp-.12),'guard'],[Timp,brace?'brace':'guard',eOut],[Timp+.2,'guard']]),
    arm:armKeys(D,[[0,now],[Math.max(.1,Timp+.2),'guard']])};
}
function planVaultMove(A,D,landX){
  const run=lerp(220,330,A.sk),vk=vaultKeys(A,A.station,landX,0,run),Tend=vk.Tl+.45;
  const body=[...bodyKeys(A,[[0,'guard']]),...vk.body,...bodyKeys(A,[[Tend,'guard',sstep]])];
  const armK=[...armKeys(A,[[0,'guard']]),...vk.arm,...armKeys(A,[[Tend,'guard']])];
  const events=[{t:vk.Tl,fn:()=>{A.station=clampSt(A,landX);dust(A.p[FTF].x,A.gr(A.p[FTF].x),.7,A.dep);S.hooks.sound('thud',220);}}];
  return{att:{t0:S.t,end:Tend,body,arm:armK},Tend,events,dash:Math.abs(landX-A.station),strikeX:landX,vault:true,Cfn:()=>({x:landX,y:S.arena.ground(landX,A.lane)-80})};
}
function planSidestep(A,info){
  const z0=A.dep,x0=A.station,to=info.to,tx=info.x??x0,dist=Math.hypot(to-z0,(tx-x0)*.8);
  const dur=clamp(lerp(.5,.36,A.sk)*Math.sqrt(Math.max(dist,8)/40),.26,.7);
  A.lane=to;A.station=tx;
  const g=GUARD[A.weaponKey];
  const body=bodyKeys(A,[[0,'now',{pz:z0}],[dur*.55,'sidestep',{px:lerp(x0,tx,.6),pz:lerp(z0,to,.65),crouch:g.crouch-.06}],[dur,'guard',sstep],[dur+.2,'guard']]);
  const arm=armKeys(A,[[0,'now'],[dur+.2,'guard']]);
  const events=[{t:dur*.6,fn:()=>{if(!info.into)A.laneT=S.t;}}];
  return{att:{t0:S.t,end:dur+.2,body,arm},Tend:dur+.3,events,dash:Math.round(dist),strikeX:tx,Cfn:()=>({x:tx,y:S.arena.ground(tx,to)-80})};
}
function planShove(A,D,sres,kind='shove',D2=null){
  const fa=A.facing,arm=A.arm,wp=A.wp,spd=lerp(1.2,.85,A.sk),bind=kind==='bind',z0=A.dep,zS=strikeLane(A,D,bind?'bind':'shove');
  A.lane=zS;
  const startX=A.curBody.px;
  let sx=D.p[PEL].x-fa*(arm*(bind?.8:.62)+12+D.body.torsoW*.5);
  const back=startX-fa*(20+Math.abs(zS-z0)*.6);if((sx-back)*fa<0)sx=back;
  sx=clampSt(A,sx);
  const dist=Math.hypot(sx-startX,(zS-z0)*.9),tApp=dist<10?0:clamp(dist/420,.1,.55);
  const Tc=tApp+.2*spd,Tl=Math.max(.08,Tc-.12),Tend=Tc+.55;
  const chest=bind?()=>{const c=D.p[HAF];return{x:c.x-fa*4,y:c.y+2};}:()=>{const c=D.p[CHE];return{x:c.x-fa*(D.body.torsoW*.5+2),y:c.y+6};};
  // the free hand goes into his chest; with the weapon in both hands, the weapon itself is driven into it
  const push=armPose(A,poseA(A,'shovePush'),wp.off?{hand:{fn:()=>{const c=chest();return{x:c.x-fa*3,y:c.y+4};}}}:{off:{fn:chest}}),load=armPose(A,poseA(A,'shoveLoad'));
  const shd=!!(sres&&sres.shoulder);
  const body=bodyKeys(A,[[0,'now',{pz:z0}],[Tl,shd?'shoulderLoad':'shoveLoad',{px:sx-fa*8,pz:zS},sstep],
    [Tc,shd?'shoulderDrive':bind?'bindDrive':'shoveDrive',{px:sx+fa*(shd?12:8)},eIn],[Tc+.22,'guard',{px:sx},eOut],[Tend,'guard',sstep]]);
  const tuck=armPose(A,poseA(A,'shoulderTuck'));
  const armK=shd?armKeys(A,[[0,'now'],[Tl,tuck,sstep],[Tc,tuck,eIn],[Tc+.2,tuck],[Tend,'guard',sstep]])
    :armKeys(A,[[0,'now'],[Tl,load,sstep],[Tc,push,eIn],[Tc+.2,push],[Tend,'guard',sstep]]);
  const react={t0:S.t,end:Tc+.3,body:bodyKeys(D,[[0,'now'],[Tc+.3,'guard']]),arm:armKeys(D,[[0,'now'],[Tc+.3,'guard']])};
  const events=[{t:Tc,fn:()=>bind?doBind(A,D):doShove(A,D,sres)},{t:Tc+.24,fn:()=>{A.station=settleStation(A,D,sx);}}];
  if(D2&&!bind)events.push({t:Tc+.13,fn:()=>{if(sres&&sres.ok&&!D2.dead)dominoHit(A,D,D2,sres);}});
  return{att:{t0:S.t,end:Tend,body,arm:armK},react,Tend,strikeX:sx,dash:dist,events,shove:true,Cfn:chest};
}

function doImpact(ex){ex.impactDone=true;const P=ex.plan;applyImpact(ex,ex.A,ex.D,ex.res,P.Cfn,P.contactVel,P.slip,P.dir??ex.A.facing,true);}
function doImpact2(ex){ex.impact2Done=true;const P=ex.plan,Q=P.sec;applyImpact(ex,ex.A,Q.D,ex.res2,Q.Cfn,P.contactVel,Q.slip,Q.dir,false);}
// fa is the direction the blow travels (attacker toward defender); the second target of a two-target technique opens no reads
function applyImpact(ex,A,D,res,Cfn,contactVel,slip,fa,primary){
  const C=Cfn(),v=contactVel(),sp=Math.hypot(v.x,v.y),perf=primary?ex.perf:(ex.perf2=ex.perf2||{}),T=res.tech;
  perf.speed=Math.round(sp);
  if(res.weaponHit){applyWeaponHit(ex,A,D,res,C,fa,primary);return;}
  if(T.through&&primary&&divSolid(T.through))breakDivider(T.through,fa);
  if(res.out==='wall'){const broke=divStrike(res.div,A,C,fa,res.divStruct);perf.divBroke=broke;
    if(primary){A.motor=Math.min(A.motor,broke?.85:.7);if(!broke)stepDown(A);}
    for(const i of [TIP,HAF]){const q=A.p[i];q.px+=fa*(broke?50:200)*DT;}
    impactFeel(A,{dmg:broke?9:4,out:'hit'},fa,broke?'hit':'block');
    if(primary)S.hooks.perf(ex);S.hooks.status();return;}
  if(res.out==='hit'||res.out==='crit'){
    const crit=res.out==='crit',sweep=res.kind==='sweep',down=!!D.downed;
    D.hp=Math.max(0,D.hp-res.dmg);
    if(down){// a blow on someone already down drives them into the ground
      for(let i=0;i<D.p.length;i++){if(i===TIP)continue;const q=D.p[i],d2=(q.x-C.x)**2+(q.y-C.y)**2,w=Math.exp(-d2/(2*30*30)),k=(140+res.dmg*6)*w*DT/Math.sqrt(D.body.mass);q.px-=fa*k*.3;q.py-=k;}}
    else if(sweep){const m=(1+res.dmg/18)*(crit?1.3:1)/Math.sqrt(D.body.mass)*(T.snare?1.7:1);
      for(const i of [KNF,FTF,KNB,FTB]){const q=D.p[i],w=(i===FTF||i===KNF)?1:.6;q.px+=fa*230*w*m*DT;q.py+=150*w*m*DT;}
      for(const i of [PEL,CHE,HEAD,ELF,HAF,ELB,HAB]){const q=D.p[i];q.px-=fa*80*m*DT;q.py-=30*m*DT;}}
    else{let dx=(sp>1?v.x/sp:0)*.5+fa*.85,dy=(sp>1?v.y/sp:0)*.5-.1;const dl=Math.hypot(dx,dy)||1;dx/=dl;dy/=dl;
      const mag=(95+res.dmg*7.5)*(crit?1.45:1)*clamp(sp/520,.7,1.4)*(T.knock||1)/Math.sqrt(D.body.mass);
      for(let i=0;i<D.p.length;i++){if(i===TIP)continue;const q=D.p[i];const d2=(q.x-C.x)**2+(q.y-C.y)**2,w=Math.exp(-d2/(2*34*34)),k=mag*(.35+.65*w)*DT;q.px-=dx*k;q.py-=dy*k;}
      // heavy blows also spin the body a little off its line
      if(crit||res.dmg>=24){const s=(res.seed&1)?1:-1;D.vdep+=s*(crit?70:40);D.lane=clamp(D.lane+s*(crit?12:6),DEP_MIN,DEP_MAX);}}
    if(!down)D.motor=Math.min(D.motor,sweep?.3:clamp(1-res.dmg/38,.12,.75));
    if(res.drive&&!down){const dz=res.drive.lane-D.lane;D.lane=res.drive.lane;D.vdep+=Math.sign(dz)*Math.min(150,Math.abs(dz)*4.5);}
    const before=D.station;ex.tableDmg=res.tableDmg||0;ex.wallDmg=res.wall||0;
    if(down){}
    else if(res.table==='break'){const Tb=S.table;if(Tb&&Tb.state==='intact'){Tb.state='breaking';Tb.breakBy=S.t+.4;Tb.breakDir=fa;Tb.breakFrom=D;}D.station=clampStage(D.station+fa*res.knock);}
    else if(res.table==='slam'){const tb=tableInPath(D,fa,res.knock);D.station=tb?tb.stop:clampSt(D,D.station+fa*res.knock);}
    else if(res.wallRes==='breach'&&S.wall){S.wall.state='breaching';S.wall.breakBy=S.t+.45;S.wall.breakFrom=D;S.wall.dir=fa;
      D.station=clamp(Math.max(D.station+fa*res.knock,S.arena.wall+WALL_T+36),60,W-40);
      for(let i=0;i<D.p.length;i++){if(i!==TIP)D.p[i].px-=fa*120*DT;}}
    else if(res.wallRes==='slam'&&S.wall){S.wall.hp=Math.max(1,S.wall.hp-res.wallStruct);D.station=clampSt(D,D.station+fa*res.knock);}
    else if(res.divRes==='breach'&&res.div&&divSolid(res.div)){const w=res.div,far=fa>0?divR(w):divL(w);startBreach(w,D,fa,.45);ex.divSlam=w;ex.divDmg=res.divDmg;
      D.station=clampSt(D,fa>0?Math.max(D.station+fa*res.knock,far+36):Math.min(D.station+fa*res.knock,far-36));
      for(let i=0;i<D.p.length;i++){if(i!==TIP)D.p[i].px-=fa*120*DT;}}
    else if(res.divRes==='slam'&&res.div){divSlam(res.div,D,res.divStruct);ex.divSlam=res.div;ex.divDmg=res.divDmg;D.station=clampSt(D,D.station+fa*res.knock);}
    else D.station=clampSt(D,D.station+fa*res.knock);
    // the snare drags him in toward the one who threw it
    if(T.snare&&!down){D.station=clampSt(D,D.station-fa*MOVES.snareYank);for(let i=0;i<D.p.length;i++){if(i===TIP)continue;const q=D.p[i];q.px+=fa*(i===FTF||i===KNF||i===FTB||i===KNB?260:150)*DT;}
      popup(D,'Snared','#8ff5e8','yanked in',18,-60);}
    perf.knock=Math.round(Math.abs(D.station-before));
    if(res.propDmg&&res.drive&&!down){const P=res.drive.ref;D.station=clampSt(D,res.drive.x);if(P&&!P.broken)breakProp(P,fa,720);}
    // a slam into furniture or a wall leaves them dazed
    if(!down&&!D.dead&&D.hp>0&&(res.table||res.wallRes||res.divRes||res.propDmg)){D.daze=1;if(res.drive)popup(D,hotRef(res.drive.ref)?'Burned':'Into '+res.drive.label,hotRef(res.drive.ref)?'#ffb347':'#ffd9a8','dazed',17,-58);}
    const zone=hitZone(res),leg0=D.wounds.leg;let hurt=woundFx(A,D,res,C,fa,zone);
    // a hamstring always leaves him limping
    if(T.hamstring&&!down&&!D.dead&&D.hp>0){D.wounds.leg=Math.min(3,Math.max(D.wounds.leg,leg0+1));hurt=true;popup(D,'Hamstrung','#ff8a8a','limping',18,-60);}
    if(!D.dead&&D.hp>0){const fr=rescueFrom(A,D);if(fr&&primary)ex.freed=fr;if(T.onHit)T.onHit(A,D,res);}
    if(D.hp<=0){kill(D,fa);if(T.fin)finisherImpact(ex,A,D,res,C,fa);}
    else if((res.kd||(res.divRes==='breach'&&!kdBlocked(A,D,crit)))&&!down)knockDown(D);
    // every blow that lands takes balance: three pips for a heavy one (an Overhead, a Sweep, a crit, a slam), two for the rest
    else if(!down){const heavy=sweep||crit||res.kind==='overhead'||res.kind==='knee'||res.table==='slam'||res.wallRes==='slam'||res.divRes==='slam'||res.kdSaved;
      knockBalance(D,heavy?hitFoot(A,D):Math.max(1,BAL.hit-outclass(A,D)),A);
      if(res.kdSaved||res.divRes==='breach')popup(D,'Keeps his feet','#a9e88c',null,18,-52);}
    if(res.guardBreak&&!down&&!D.dead&&D.hp>0){D.ready+=15;popup(D,'Guard broken','#ffc163','+15 tempo',19,-40);S.hooks.sound('clang',.8);}
    if(T.stop&&!down&&!D.dead&&D.hp>0){knockBalance(D,hitFoot(A,D),A);popup(D,'Stopped','#ff8a5c','on the point',19,-40);}
    if(T.murder&&!down&&!D.dead&&D.hp>0){D.daze=1;popup(D,'Dazed','#ffd36b','the crossguard',17,-62);}
    if(T.beard&&!down&&!D.dead&&D.hp>0)beardPin(A,D,fa);
    if(T.pinWall&&!down&&!D.dead&&D.hp>0&&!D.downed){D.wallPin=true;popup(D,'Pinned','#ff8a5c','no step back next turn',18,-60);}
    // a big knockback can carry them over the curb or over someone already down
    let tripped=null;
    // only a blow that knocks them off balance carries them over it; a steadier fighter steps clear
    if(!D.dead&&!D.downed&&D.posture==='off'&&perf.knock>=20&&!res.table&&!res.wallRes&&!res.divRes&&!kdBlocked(A,D,res.out==='crit')){const tr=tripHazard(D,fa,before,D.station);if(tr){tripDown(D,tr,fa);tripped=tr;}}
    if(!D.dead&&!D.downed)hitReaction(D,zone,fa,res);
    const showy=!!(T.flair||T.multi||!primary);
    flash(C,crit?48:30,crit?'#fff1c9':'#ffffff',D.dep);sparks(C,crit?14:7,'#ffe3b0',D.dep);
    if(showy){flash(C,crit?70:50,A.color,D.dep);sparks(C,8,A.color,D.dep);}
    impactFeel(A,res,fa,'hit');if(crit)S.slowT=.5;
    if(!S.warming&&(T.flair==='leap'||!primary||(crit&&showy)||res.dmg>=26))S.punch={x:prjX(C.x,D.dep),t:0};
    popup(D,String(res.dmg),crit?'#ffd36b':'#ffffff',crit?'Critical':D.dead?'Out':down?'On the ground':D.downed?(sweep?'Swept':'Knocked down'):D.daze&&zone==='head'?'Dazed':res.back?'From behind':sweep?'Off balance':null,crit?34:28);
    if(res.shatter&&A.wp.shatter)shatterBottle(A,D,C);
    S.hooks.sound(crit?'crit':'hit',res.dmg);
    if(hurt||tripped)S.hooks.wound(ex,D,{zone,hurt,tripped,primary});
  }else if(res.out==='block'){
    flash(C,24,'#cfeaff',D.dep);sparks(C,18,'#fff3cf',D.dep);
    for(const i of [TIP,HAF]){const q=A.p[i],k=(i===TIP?300:150)*DT*(primary?1:.6);q.px+=fa*k;q.py+=k*.4;}
    for(const i of [TIP,HAF,ELF]){const q=D.p[i];q.px-=fa*110*DT;}
    if(res.guardBreak){for(const i of [TIP,HAF,ELF,CHE]){const q=D.p[i];q.px-=fa*(i===CHE?120:230)*DT;q.py+=(i===TIP?120:-30)*DT;}
      knockBalance(D,hitFoot(A,D),A);D.motor=Math.min(D.motor,.5);D.ready+=15;A.motor=Math.min(A.motor,.85);D.station=clampSt(D,D.station+fa*18);
      impactFeel(A,res,fa,'block');S.freeze=Math.max(S.freeze,.08);S.shake=Math.max(S.shake,7);popup(D,'Guard broken','#ffc163','+15 tempo',22);S.hooks.sound('clang',1);S.hooks.sound('thud',260);
      res.disarm=tryDisarm(A,D,'break',fa);}
    if(T.murder&&!D.dead&&!D.downed){D.daze=1;popup(D,'Dazed','#ffd36b','the crossguard',17,-62);}
    if(T.beard&&!D.dead&&!D.downed)beardPin(A,D,fa);
    if(res.guardBreak){}
    else{if(primary)A.motor=Math.min(A.motor,.72);D.station=clampSt(D,D.station+fa*8);
      impactFeel(A,res,fa,'block');popup(D,D.downed?'Blocked':res.guarded?'Parried':D.counter?'Countered':'Blocked','#a5dcff',null,22);S.hooks.sound('clang',1);
      if(primary&&!D.downed)knockBalance(A,res.guarded?BAL.parried:D.counter?BAL.countered:BAL.blocked,D);}
  }else if(res.out==='dodge'){
    // a miss leaves him reaching: one pip, two for an Overhead or into a counter; stepping back out of reach steadies the one who did
    if(primary&&!D.downed)knockBalance(A,D.counter?BAL.countered:res.kind==='overhead'?BAL.dodgedOver:BAL.dodged,D);
    if(primary&&D.react==='back')gainFoot(D,BAL.stepBack);
    popup(D,D.react==='back'?'Out of reach':slip!=null?'Slipped':'Miss','#c9d0f5',null,22);}
  D.guarding=false;const ctr=!!D.counter;D.counter=false;D.setSpear=false;const rx=D.react;D.react=null;
  if(primary){
    S.hooks.perf(ex);chainImpact(ex,A,D,res);
    if(ex.D2){}
    // broken: the attacker by the answer to his blow, or the target by the blow
    else if(freshBreak(A)&&!A.dead&&!A.downed&&!D.dead&&!D.downed&&D.team!==A.team)considerOpening(ex,D,A,'broken');
    else if(freshBreak(D)&&!D.dead&&!D.downed&&!A.dead&&D.team!==A.team)considerOpening(ex,A,D,'broken');
    // a blow turned aside sends him into his partner
    // (his partner is taken now: by the time the shove goes, the blow's lunge has moved the bodies)
    else if(rx==='turn'&&(res.out==='block'||res.out==='dodge')&&!D.downed&&turnPartner(D,A)){ex.turnTo=turnPartner(D,A);considerOpening(ex,D,A,'turn');}
    else if(res.guardBreak&&res.out==='block')considerOpening(ex,A,D,'break');
    // a beard hook that is blocked has still pinned his weapon, and a beaten guard has nothing to riposte with: no opening for him
    else if(res.out==='block'&&T.beard){}
    else if((res.out==='block'||res.out==='dodge')&&T.beat){}
    else if(res.out==='block')considerOpening(ex,D,A,res.guarded?'parry':ctr?'counter':'block');
    else if(res.out==='dodge')considerOpening(ex,D,A,ctr?'counter':res.guarded?'parry':res.kind==='overhead'?'dodgeOver':'dodge');
    else if((res.out==='hit'||res.out==='crit')&&!res.kd&&!D.dead&&!D.downed&&D.team!==A.team)considerOpening(ex,A,D,'hit');
    else if((res.out==='hit'||res.out==='crit')&&(D.dead||res.kd)&&(!(T.fin&&T.fin.hold)||chainFree(A))){const E=flowTarget(A,D);if(E)considerFlow(ex,A,E);}
    // the pack piles in: another enemy follows a landed blow on Kael
    if(A.team!==D.team&&!D.dead&&(res.out==='hit'||res.out==='crit')&&ex.openAt==null)considerGang(ex,gangPartner(A,D),D);
  }else{S.hooks.perf2(ex);chainSecond(ex,A,D,res);}
  S.hooks.status();
}
// a hit on the weapon itself: the spearhead comes off, or the lash wraps the weapon and pulls
function applyWeaponHit(ex,A,D,res,C,fa,primary){
  const perf=primary?ex.perf:(ex.perf2=ex.perf2||{});
  if(res.weaponHit==='haft'){cutHaft(D,fa);perf.haft=true;S.hooks.sound('crack',.9);S.shake=Math.max(S.shake,4);}
  else{let dr;
    if(res.crit){const it=dropWeapon(D,-fa,true);dr={roll:20,bonus:0,total:20,dc:0,ok:true,item:it,src:'lash',crit:true};sparks(D.p[HAF],12,'#8ff5e8',D.dep);popup(D,'Disarmed','#ffc163','torn from his hand',22,-30);S.hooks.sound('clang',1);}
    else dr=tryDisarm(A,D,'lash',-fa);
    res.disarm=dr;perf.wrap=true;
    if(!dr||!dr.ok){D.ready+=10;popup(D,'Weapon wrapped','#8ff5e8','kept hold, +10 tempo',19,-40);}
    for(const i of [TIP,HAF]){const q=D.p[i];if(q)q.px+=fa*120*DT;}}
  flash(C,26,'#cfeaff',D.dep);sparks(C,12,'#fff3cf',D.dep);impactFeel(A,{dmg:6,out:'hit'},fa,'block');
  D.guarding=false;D.counter=false;D.setSpear=false;
  if(primary){S.hooks.perf(ex);chainImpact(ex,A,D,res);if(!D.dead&&!D.downed&&D.team!==A.team)considerOpening(ex,A,D,'hit');}
  S.hooks.status();}
// the head comes off the spear and flies on; he is left holding the shaft
function cutHaft(D,fa){
  if(D.weaponKey!=='spear')return;
  const h=D.p[HAF],t=D.p[TIP],L=Math.hypot(t.x-h.x,t.y-h.y)||1,ux=(t.x-h.x)/L,uy=(t.y-h.y)/L,cut=WEAPONS.shaft.len,a={x:h.x+ux*cut,y:h.y+uy*cut};
  S.debris.push({a:{x:a.x,y:a.y,px:a.x-fa*2.6,py:a.y+2,r:2,im:.5,vx0:0,vy0:0},b:{x:t.x,y:t.y,px:t.x-fa*3.4,py:t.y+2.6,r:2,im:.5,vx0:0,vy0:0},len:Math.hypot(t.x-a.x,t.y-a.y)||6,w:3.4,dep:D.dep,col:'#c9d0d8'});
  D.setWeapon('shaft');const t2=D.p[TIP];t2.x=t2.px=a.x;t2.y=t2.py=a.y;
  sparks(a,10,'#fff3cf',D.dep);popup(D,'Haft cut','#ffc163','the spearhead is off',21,-40);}
// the axe's beard has his weapon: dragged down and held
function beardPin(A,D,fa){D.ready+=MOVES.beardTempo;D.guarding=false;
  for(const i of [TIP,HAF]){const q=D.p[i];q.px+=fa*160*DT;q.py-=40*DT;}
  popup(D,'Weapon hooked','#ffc163','+'+MOVES.beardTempo+' tempo',19,-52);S.hooks.sound('clang',.7);}
function doShove(A,D,sr){
  const fa=Math.sign(D.station-A.station)||A.facing,ex=S.game.ex,C=D.p[CHE];D.guarding=false;D.counter=false;
  if(!sr.ok){
    for(let i=0;i<D.p.length;i++){if(i===TIP)continue;const q=D.p[i];const d2=(q.x-C.x)**2+(q.y-C.y)**2,w=Math.exp(-d2/(2*40*40)),k=(170+210*w)*.3*DT/Math.sqrt(D.body.mass);q.px-=fa*k;}
    for(const i of [PEL,CHE,HEAD,HAF,HAB,TIP]){const q=A.p[i];q.px+=fa*(i===PEL?90:130)*DT;}
    const before=D.station;D.station=clampSt(D,D.station+fa*6);
    D.motor=Math.min(D.motor,.85);knockBalance(A,FOOT_HIT,D);A.ready+=15;A.motor=Math.min(A.motor,.6);
    flash({x:C.x,y:C.y},14,'#a5dcff',D.dep);S.shake=Math.max(S.shake,3);popup(D,'Braced','#a5dcff','Shover off balance',20);S.hooks.sound('thud',150);
    if(ex)ex.perf.knock=Math.round(Math.abs(D.station-before));
    S.hooks.shove(ex,{pushed:Math.round(Math.abs(D.station-before)),tableDmg:0,wallDmg:0,ok:false,label:'Braced'});
    if(ex)considerOpening(ex,D,A,freshBreak(A)?'broken':'brace');S.hooks.status();return;}
  const freed=rescueFrom(A,D);if(freed&&ex)ex.freed=freed;
  let push=sr.crush?64:48;const pow=sr.crush?1.35:1;
  for(let i=0;i<D.p.length;i++){if(i===TIP)continue;const q=D.p[i];const d2=(q.x-C.x)**2+(q.y-C.y)**2,w=Math.exp(-d2/(2*40*40)),k=(170+210*w)*pow*DT/Math.sqrt(D.body.mass);q.px-=fa*k;q.py+=k*.15;}
  const before=D.station;let tableDmg=0,wallDmg=0,divDmg=0,divRes=null,divW=null,propDmg=0;
  const drive=driveFor(A,D);if(drive&&drive.dist<=push*1.6+12){push=Math.max(push,drive.dist+(drive.kind==='prop'?16:8));const dz=drive.lane-D.lane;D.lane=drive.lane;D.vdep+=Math.sign(dz)*Math.min(150,Math.abs(dz)*4.5);}
  const tb=tableInPath(D,fa,push);
  let floored=false;
  if(tb&&sr.crush){const T=S.table;T.state='breaking';T.breakBy=S.t+.35;T.breakDir=fa;T.breakFrom=D;tableDmg=6;D.station=clampStage(D.station+fa*push);floored=true;}
  else if(tb){tableDmg=3;D.station=tb.stop;}
  else{const want=D.station+fa*push;
    if(wallStanding()&&S.wall&&fa>0&&want>maxStation()+4){const struct=sr.crush?2:1;
      if(S.wall.hp-struct<=0){S.wall.state='breaching';S.wall.breakBy=S.t+.4;S.wall.breakFrom=D;S.wall.dir=fa;wallDmg=8;D.station=clamp(Math.max(want,S.arena.wall+WALL_T+36),60,W-40);floored=true;}
      else{S.wall.hp-=struct;wallDmg=4;D.station=clampSt(D,want);}}
    else{const dv=S.divs.length?divInPath(D,fa,push):null;
      if(dv){const w=dv.w,M=DIV_MAT[w.mat],st=sr.crush?2:1;divW=w;
        if(w.hp-st<=0){divRes='breach';divDmg=M.breach;startBreach(w,D,fa,.4);const far=fa>0?divR(w):divL(w);D.station=clampSt(D,fa>0?Math.max(want,far+36):Math.min(want,far-36));floored=true;
          for(let i=0;i<D.p.length;i++)if(i!==TIP)D.p[i].px-=fa*90*DT;}
        else{divRes='slam';divDmg=Math.max(2,M.slam-1);divSlam(w,D,st);D.station=dv.stop;}
        if(ex){ex.divSlam=w;ex.divDmg=divDmg;}}
      else D.station=clampSt(D,want);}}
  if(drive&&drive.kind==='prop'&&!tableDmg&&!wallDmg&&!divDmg){propDmg=hotRef(drive.ref)?6:3;D.station=clampSt(D,drive.x);if(drive.ref&&!drive.ref.broken)breakProp(drive.ref,fa,720);}
  const dmg=tableDmg+wallDmg+divDmg+propDmg;
  if(dmg){D.hp=Math.max(0,D.hp-dmg);if(D.hp<=0)kill(D,fa);}
  // (a shoulder check floors him, and so does a blow turned clean into his partner: they both go down)
  if((sr.shoulder||(sr.turn&&sr.crush))&&!D.dead)floored=true;
  const keeps=floored&&!D.dead&&kdBlocked(A,D,sr.crush);
  if(floored&&!D.dead&&!keeps)knockDown(D);
  else if(dmg&&!D.dead)D.daze=1;
  if(keeps)popup(D,'Keeps his feet','#a9e88c',null,18,-52);
  knockBalance(D,hitFoot(A,D),A);if(!D.wasDown)D.motor=Math.min(D.motor,.5);
  D.ready+=sr.push?12:25;
  const pushed=Math.round(Math.abs(D.station-before));
  // shoved back over the curb or a fallen body
  let tripped=null;if(!D.dead&&!D.downed&&pushed>=20&&!divRes&&!kdBlocked(A,D,sr.crush)){const tr=tripHazard(D,fa,before,D.station);if(tr){tripDown(D,tr,fa);tripped=tr;}}
  impactFeel(A,{dmg:5+dmg,out:sr.crush?'crit':'hit'},fa,'hit');
  if(ex){ex.tableDmg=tableDmg;ex.wallDmg=wallDmg;if(ex.res){ex.res.table=tableDmg?(sr.crush?'break':'slam'):null;ex.res.tableDmg=tableDmg;}ex.perf.knock=pushed;}
  const label=sr.shoulder&&D.downed?'Floored':sr.shoulder?'Shouldered':tableDmg?(sr.crush?'Crashed':'Slammed'):wallDmg?(wallDmg>=8?'Through the wall':'Slammed'):divRes?(divRes==='breach'?'Through '+divThe(divW):'Slammed'):sr.push?'Pushed off':'Shoved';
  flash({x:C.x,y:C.y},20,'#ffe9c8',D.dep);
  if(!tripped)popup(D,label,'#ffd9a8',null,20);S.hooks.sound('thud',300);
  // a shove that leaves him Broken: one free move
  if(ex&&freshBreak(D)&&!D.downed&&!D.dead&&ex.openAt==null)considerOpening(ex,A,D,'broken');
  S.hooks.shove(ex,{pushed,tableDmg,wallDmg,divDmg,divRes,div:divW,ok:true,crush:sr.crush,shoulder:!!sr.shoulder,floored:!!(sr.shoulder&&D.downed),label:propDmg?'Into '+drive.label:label,push:!!sr.push,tripped,propDmg,drive:drive&&(tableDmg||wallDmg||divDmg||propDmg)?drive:null});S.hooks.status();
}
function dominoHit(A,D,D2,sr){
  const fa=Math.sign(D2.station-A.station)||A.facing,C=D2.p[CHE],pow=sr.crush?1.25:.9,ex=S.game.ex;
  for(let i=0;i<D2.p.length;i++){if(i===TIP)continue;const q=D2.p[i],d2=(q.x-C.x)**2+(q.y-C.y)**2,w=Math.exp(-d2/(2*40*40)),k=(150+170*w)*pow*DT/Math.sqrt(D2.body.mass);q.px-=fa*k;q.py+=k*.12;}
  D2.guarding=false;const before=D2.station;D2.station=clampSt(D2,D2.station+fa*(sr.crush?40:26));
  if(sr.crush&&!kdBlocked(A,D2,true))knockDown(D2);else D2.motor=Math.min(D2.motor,.55);
  knockBalance(D2,hitFoot(A,D2),A);D2.ready+=15;
  flash({x:C.x,y:C.y},24,A.color,D2.dep);dust(C.x,D2.gr(C.x),.9,D2.dep);S.shake=Math.max(S.shake,6);
  popup(D2,sr.crush?'Bowled over':'Knocked back','#ffd9a8','+15 tempo',19,-34);S.hooks.sound('thud',320);
  if(ex)S.hooks.domino(ex,D2,{pushed:Math.round(Math.abs(D2.station-before)),crush:sr.crush});S.hooks.status();
}
function doBind(A,D){
  const fa=Math.sign(D.station-A.station)||A.facing,ex=S.game.ex;D.guarding=false;D.counter=false;knockBalance(D,hitFoot(A,D),A);D.motor=Math.min(D.motor,.6);
  for(const i of [HAF,TIP,ELF]){const q=D.p[i];q.px-=fa*(i===ELF?80:160)*DT;q.py+=(i===TIP?140:30)*DT;}
  flash(D.p[HAF],18,'#a5dcff',D.dep);sparks(D.p[HAF],8,'#fff3cf',D.dep);S.hooks.sound('clang',1);
  // strong control twists the weapon right out of the hand
  const dr=tryDisarm(A,D,'bind',fa);
  if(dr&&dr.ok){D.ready+=10;S.hooks.shove(ex,{bind:true,ok:true,label:'Disarmed',pushed:0,tableDmg:0,wallDmg:0,disarm:dr});}
  else{D.ready+=20;popup(D,'Weapon pinned','#a5dcff','+20 tempo',20);S.hooks.shove(ex,{bind:true,ok:true,label:'Pinned',pushed:0,tableDmg:0,wallDmg:0,disarm:dr});}
  S.hooks.status();
}

// ---------- openings: mid-exchange decision moments ----------
// What caused the opening decides what it offers.
const OPEN_KIND={stop:'stop',parry:'riposte',counter:'riposte',block:'riposte',dodge:'riposte',dodgeOver:'riposte',brace:'riposte',hit:'press',break:'press',fumble:'punish',flow:'flow',clinch:'clinch',gang:'gang',
  broken:'broken',turn:'turn',react:'react'};
// (a man Broken gives one free move with the big payoffs: the heavy blow, his weapon, a shove into his partner or the furniture, his legs)
const OPEN_SETS={stop:['thrust','hold'],parry:['thrust','bind','slash','hold'],counter:['slash','thrust','sweep','hold'],block:['thrust','bind','slash','hold'],dodge:['slash','shove','thrust','hold'],dodgeOver:['shove','sweep','slash','hold'],
  hit:['slash','sweep','thrust','hold'],fumble:['overhead','sweep','shove','hold'],break:['thrust','sweep','shove','hold'],brace:['thrust','sweep','shove','hold'],
  broken:['overhead','bind','shove','sweep','hold'],turn:['shove'],
  flow:['slash','thrust','overhead','hold'],clinch:['headbutt','knee','elbow','throw','push'],gang:['slash','thrust','overhead','hold']};
// a fighter locked in a clinch can only answer with what works chest to chest
function openingChoices(o){const st=stabInfo(o.f)?['stab']:[];
  if(o.f.clinch&&o.source!=='clinch')return[...st,'elbow','headbutt','knee','hold'];
  if(o.source==='clinch')return[...st,...OPEN_SETS.clinch];
  return OPEN_SETS[o.source]||OPEN_SETS.block;}
function openValid(o,k){
  if(outOfFooting(o.f,k,o.opp))return false;
  if(k==='shove')return!tableBetween(o.f,o.opp)&&!(S.divs.length&&divBetween(o.f,o.opp))&&!o.opp.downed&&!o.opp.clinch;
  if(k==='throw')return!!throwInfo(o.f);
  if(k==='push')return!!(o.f.clinch&&o.f.clinch.a===o.f);
  if(DIRTY.includes(k))return!!o.f.clinch;
  if(k==='stab')return!!stabInfo(o.f);
  if(k==='bind')return!o.opp.wp.unarmed;
  return true;}
// a follow-up from an opening is at +3, except a stop-hit (it is the defender's own thrust) and the free move on a man Broken (the
// free move is the payoff, and his lost balance already counts against him)
function openBonus(o){return!!o&&o.source!=='stop'&&o.source!=='broken';}
function considerOpening(ex,f,opp,src){
  if(f.dead||opp.dead||f.downed||f.team===opp.team||(ex.depth||0)>=4)return;
  if(f.clinch&&clinchPartner(f)!==opp)return;
  if(src==='broken'&&opp.broken)opp.broken.paid=true;
  const read=src==='fumble'||src==='parry'||src==='counter'||src==='broken'||src==='turn'?{free:true,ok:true,src}:readRoll(f,opp,src,ex.depth||0);
  S.hooks.read(ex,f,read,src);
  if(read.ok){ex.openAt=S.t+.05;ex.openFor=f;ex.openSource=src;ex.openKind=OPEN_KIND[src]||'riposte';}
}
// Flow: a takedown carries straight on to the next enemy in reach
function considerFlow(ex,f,E){
  const K=f===hero();
  if(f.dead||E.dead||(ex.depth||0)>=(K?CHAIN.maxDepth:4)||ex.openAt!=null)return;
  const read=K||f.skill>=RANK.master?{free:true,ok:true,flow:true}:readRoll(f,E,'flow',ex.depth||0);
  S.hooks.read(ex,f,read,'flow',E);
  if(read.ok){ex.openAt=S.t+.14;ex.openFor=f;ex.openSource='flow';ex.openKind='flow';ex.openOpp=E;}
}
function restoreFacings(){for(const f of S.F)if(f.spinFace!=null){f.facing=f.spinFace;f.spinFace=null;}}
function startOpening(ex,f){
  const op=ex.openOpp||(ex.A===f?ex.D:ex.A),dur=lerp(2.6,4.2,f.sk);
  for(const q of[f,op])if(q.curBody&&!q.dead){q.station=clampSt(q,q.curBody.px);q.lane=clamp(q.curBody.pz??q.lane,DEP_MIN,DEP_MAX);}
  resolveStations();
  S.opening={f,opp:op,ex,depth:(ex.depth||0)+1,kind:ex.openKind,source:ex.openSource||'block',attack:ex.cmd,prev:ex.openOpp?ex.D:null,dur,left:dur,aiDelay:.5};
  chainOpening(S.opening);
  S.hooks.opening(S.opening);
  // a turned blow needs no second choice: the shove into his partner goes at once
  if(S.opening&&S.opening.source==='turn')resolveOpening('shove');
}
function tickOpening(rdt){
  const o=S.opening;if(!o)return;o.left-=rdt;
  if(isAI(o.f.idx)){if(o.dur-o.left>=o.aiDelay)resolveOpening(aiOpening(o));}
  else if(o.left<=0)resolveOpening('hold');
}
function aiOpening(o){
  const f=o.f,D=o.opp,r=S.rng,ch=openingChoices(o).filter(k=>openValid(o,k)),has=k=>ch.includes(k);
  const cl=chainAI(o,ch);if(cl)return cl;
  if(o.source==='stop')return has('thrust')&&(f.setSpear||r()<(f.temper==='rusher'?.6:.88))?'thrust':'hold';
  if(o.source==='clinch'||f.clinch){const th=has('throw')?throwInfo(f):null;
    if(has('stab')&&r()<(f.clinch&&f.clinch.b===f&&f.clinch.behind?.7:.45))return'stab';
    if(th&&(th.hazard?r()<.7:r()<.3))return'throw';if(has('push')&&r()<.12)return'push';
    const d=ch.filter(k=>DIRTY.includes(k));return d.length?d[Math.floor(r()*d.length)]:'hold';}
  if(r()<.08)return'hold';
  if(has('guard')&&(f.foot<=2||f.hp<f.maxHp*.3)&&r()<.65)return'guard';
  // a man off balance: the Sweep puts him down, and so does a shove (the shoulder check), so they share the one chance
  const sh=has('shove')&&D.posture==='off'&&!!shoveVariant(f,D,true);
  if(has('sweep')&&D.posture==='off'&&r()<(sh?.2:.35))return'sweep';
  if(sh&&r()<.18)return'shove';
  if(has('bind')&&D.posture!=='off'&&r()<.4)return'bind';
  if(!sh&&has('shove')&&(shoveChance(f,D,true)>.6||roomBehind(D)<70)&&r()<.5)return'shove';
  const atk=ch.filter(k=>ATTACKS.includes(k));
  return atk.length?atk[atk.length>1&&r()>.7?1:0]:'hold';
}
function resolveOpening(choice){
  const o=S.opening;if(!o)return;
  if(!openingChoices(o).includes(choice)||!openValid(o,choice))choice='hold';
  if(o.ex&&o.ex.dazedAtStart&&o.ex.A&&o.ex.A!==o.f&&o.source!=='stop')o.ex.A.daze=0;
  const si=o.source==='stop'?stopInfo(o):null;
  S.opening=null;o.f.counter=false;o.f.setSpear=false;if(choice!=='hold')o.f.holdFace=null;if(choice!=='hold')o.f.lastAct=choice;S.hooks.opening(null,choice);chainLaunch(o,choice);
  if(choice==='hold'){S.hooks.log({type:'hold',A:o.f,D:o.opp});S.hooks.status();return;}
  restoreFacings();
  const A=o.f,D=o.opp,g=S.game;
  A.station=clampSt(A,A.curBody.px);D.station=clampSt(D,D.curBody.px);resolveStations();
  A.ready+=openCost(A,choice,o);
  if(A.team===0)setTgt(A,D.idx);
  const ex={A,D,t0:S.t,cmd:choice,perf:{},depth:o.depth,chain:o.kind,link:o.link,dazedAtStart:A.daze>0,beat:si?si.beat:0,setSpear:si?si.setSpear:false};
  if(choice==='stab'){g.ex=ex;launchStab(A,D,ex,true);S.hooks.log({type:'attack',A,D,res:ex.res,ex});S.hooks.status();return;}
  if(DIRTY.includes(choice)){g.ex=ex;launchDirty(A,D,choice,ex,true);S.hooks.log({type:'attack',A,D,res:ex.res,ex});S.hooks.status();return;}
  if(choice==='throw'){g.ex=ex;launchThrow(A,D,ex,true);S.hooks.log({type:'throw',A,D,ex,res:ex.res});S.hooks.status();return;}
  if(choice==='push'){const pp=planPush(A,D);beginAction(A,'push');A.action=pp.plan.att;D.action=pp.plan.react;ex.res=pp.sres;ex.plan=pp.plan;ex.dur=pp.plan.Tend;ex.perf={dash:Math.round(pp.plan.dash)};
    g.ex=ex;S.hooks.log({type:'push',A,D,ex});S.hooks.status();return;}
  if(choice==='guard'){
    beginAction(A,'guard');A.guarding=true;A.circleGuard=circleGuardOK(A);ex.dur=.6;
    A.action={t0:S.t,end:.55,body:bodyKeys(A,[[0,'now'],[.55,'guard',sstep]]),arm:armKeys(A,[[0,'now'],[.55,'guard',sstep]])};
    g.ex=ex;S.hooks.log({type:'guard',A,D,ex,opening:true});
  }else if(choice==='shove'||choice==='bind'){
    // (a turned blow carries him round into his partner: the shove cannot fail, and a clean turn floors them both)
    faceToward(A,D.station);const sres=choice==='shove'?(o.source==='turn'?turnShove(o):resolveShove(A,D,openBonus(o))):null;
    if(sres&&!sres.turn){const sv=shoveVariant(A,D,true);if(sv&&sv.kind==='shoulder')sres.shoulder=true;}
    const tt=o.source==='turn'&&o.ex&&o.ex.turnTo&&upright(o.ex.turnTo)?o.ex.turnTo:null;
    const D2=choice==='shove'&&!(sres&&sres.shoulder)?(o.source==='turn'?tt||turnPartner(A,D):dominoPartner(A,D)):null;engage(A,D);
    A.guarding=false;beginAction(A,choice,o.kind);const plan=planShove(A,D,sres,choice,D2);
    A.action=plan.att;D.action=plan.react;ex.res=sres;ex.plan=plan;ex.dur=plan.Tend;ex.perf={dash:Math.round(plan.dash)};ex.domino=D2;
    if(D2)S.callouts.push({i:A.idx,text:'Domino shove',age:0,life:1,dx:-A.facing*18});
    g.ex=ex;S.hooks.log({type:choice,A,D,ex,res:sres});
  }else{
    g.ex=ex;launchAttack(A,D,choice,ex,openBonus(o),{snap:true,quick:true});
    if(!ex.reactPending)S.hooks.log({type:'attack',A,D:ex.D,res:ex.res,ex});
  }
  S.hooks.status();
}

// One path for every attack: pick the technique, roll the dice (twice for a two-target technique), then plan the motion
// roll so the outcome comes out as wanted (used when a blow is caught by a human shield)
function resolveForced(A,D,kind,opening,T,want){
  const c=computeMods(A,D,kind,opening,T);let pick=null;
  for(let v=2;v<=19;v++){const tot=v+c.bonus;if(want==='hit'&&tot>=c.def&&!isCrit(v,tot,c.def)){pick=v;break;}}
  if(pick==null)pick=20;const save=S.rng;let first=true;S.rng=()=>{if(first){first=false;return(pick-.5)/20;}return save();};
  try{return resolveAttack(A,D,kind,opening,T);}finally{S.rng=save;}
}
function launchDirty(A,D,kind,ex,opening){
  const T=dirtyTech(A,D,kind),res=resolveAttack(A,D,kind,opening,T);
  A.guarding=false;A.counter=false;beginAction(A,kind,null,T);
  const plan=planDirty(A,D,kind,res);A.action=plan.att;D.action=plan.react;
  ex.res=res;ex.plan=plan;ex.dur=plan.Tend;ex.perf={dash:0,windup:plan.tWind};
}
function launchThrow(A,D,ex,opening){
  const info=throwInfo(A),tr=resolveThrow(A,D,opening);
  if(tr.ok&&info&&info.hazard&&info.hazard.kind==='div'){const hz=info.hazard,w=hz.w,st=tr.crush?2:1;hz.st=st;
    if(w.hp-st<=0){hz.through=true;const far=hz.dir>0?divR(w):divL(w);info.x=clamp(far+hz.dir*34,40,W-40);startBreach(w,D,hz.dir,.8);ex.divSlam=w;}}
  A.guarding=false;A.counter=false;beginAction(A,'throw');
  const plan=planThrow(A,D,tr,info);A.action=plan.att;ex.res=tr;ex.plan=plan;ex.dur=plan.Tend;ex.info=info;ex.perf={dash:0};
}
function launchAttack(A,D,kind,ex,opening,popts){
  A.holdFace=null;faceToward(A,D.station);
  const Cv=coverFor(A,D);
  if(Cv){const W=D;D=Cv;ex.D=D;Cv.covering=null;faceToward(A,D.station);ex.covered=W;popup(Cv,'Steps in','#a9e88c',`covering ${W.name}`,19,-30);S.hooks.cover(ex,{C:Cv,W});}
  let T=pickTechnique(A,D,kind);
  if(ex.chain==='stop'&&kind==='thrust')T=stopTech(T,D,ex);
  let res=resolveAttack(A,D,kind,opening,T);
  // a human shield in the way: a blow that would have landed on Kael without it lands on the shield instead
  const Sh=shieldFor(A,D);
  if(Sh&&(res.out==='block'||res.out==='dodge')&&res.total+4>=res.def){const K=D;D=Sh;T=pickTechnique(A,D,kind);res=resolveForced(A,D,kind,opening,T,'hit');res.shielded=K;ex.D=D;}
  let D2=null,res2=null;
  if(T.multi){D2=T.multi.D2;res2=resolveAttack(A,D2,kind,opening,secondaryTech(T));if(res2.out==='fumble')res2.out='dodge';}
  engage(A,D);A.guarding=false;A.counter=false;beginAction(A,kind,ex.chain||null,T);
  // the back thrust: he keeps facing the man in front and drives the point back at the one behind
  if(res.tech.backT&&!D2){const E=res.tech.backT;A.facing=Math.sign(E.station-A.station)||-(Math.sign(D.station-A.station)||A.facing);A.holdFace=E.idx;
    const plan=planBackThrust(A,D,res,res.tech);A.action=plan.att;D.action=plan.react;ex.res=res;ex.plan=plan;ex.dur=plan.Tend;ex.perf={dash:plan.dash,windup:plan.tWind};return;}
  const plan=planAttack(A,D,kind,res,{...(popts||{}),res2});
  if(res.tech.through&&divSolid(res.tech.through))startBreach(res.tech.through,A,Math.sign(D.station-A.station)||A.facing,Math.max(.05,plan.Timp-.03),true);
  A.action=plan.att;D.action=plan.react;
  if(plan.sec){D2.action=plan.sec.react;ex.D2=D2;ex.res2=res2;}
  ex.res=res;ex.plan=plan;ex.dur=plan.Tend;
  ex.perf={dash:Math.round(plan.dash),windup:plan.tWind,vault:plan.vault,around:plan.around,slip:plan.slip};
}
function planBreakout(A,info){
  const z0=A.dep,run=lerp(300,430,A.sk),dir=info.dir,x0=A.station;
  const w1={x:x0+dir*16,z:info.dz},L1=Math.hypot(16,(info.dz-z0)*.9),L2=Math.abs(info.x-w1.x),L3=Math.abs(info.z-info.dz)*.9;
  const t1=Math.max(.18,L1/run),t2=t1+Math.max(.22,L2/run),t3=t2+Math.max(.16,L3/run),Tend=t3+.4;
  A.station=info.x;A.lane=info.z;
  for(const o of foes())o.side=-dir;
  const body=bodyKeys(A,[[0,'now',{pz:z0}],[t1,'breakRun',{px:w1.x,pz:w1.z}],[t2,'breakTurn',{px:info.x,pz:info.dz}],[t3,'guard',sstep],[Tend,'guard']]);
  const tuck=armPose(A,poseA(A,'breakRun'));
  const armK=armKeys(A,[[0,'now'],[t1,tuck,eOut],[t2,tuck],[Tend,'guard',sstep]]);
  const events=[{t:.01,fn:()=>{A.facing=dir;}},{t:t2-.06,fn:()=>{A.facing=-dir;for(const o of info.pass)if(!o.dead)faceToward(o,A.p[PEL].x);}},
    {t:t2+.04,fn:()=>{dust(A.p[FTF].x,A.gr(A.p[FTF].x),.8,A.dep);}}];
  A.flair={until:S.t+t2+.05,ghost:true,trail:false,next:0,from:S.t+.05};S.callouts.push({i:A.idx,text:'Break out',age:0,life:1.1});
  return{att:{t0:S.t,end:Tend,body,arm:armK},Tend:Tend+.05,events,dash:Math.round(L1+L2+L3),strikeX:info.x,Cfn:()=>({x:info.x,y:S.arena.ground(info.x,info.z)-80})};
}

// ---------- intent & commands ----------
function advanceInfo(A,D){
  const fa=Math.sign(D.station-A.station)||A.facing;
  // a divider between them: head for the end of it, then walk past it
  const wb=S.divs.length?divBetween(A,D):null;
  if(wb){const z=divDetour(wb,A,D);if(z==null)return null;const tz=clamp(z,A.lane-70,A.lane+70),out=!divBand(wb,A.lane,14),lim=D.station-fa*95;
    for(const [x0,z1] of out?[[A.station+fa*75,A.lane]]:[[A.station+fa*50,tz],[A.station,tz]]){let x=x0;if((x-lim)*fa>0)x=lim;x=clampSt(A,x,z1);
      if((Math.abs(x-A.station)>=8||Math.abs(z1-A.lane)>=8)&&!divOnSeg(A.station,A.lane,x,z1))return{x,z:z1,vault:false,around:wb};}
    return null;}
  let ns=A.station+fa*75*(1-.15*A.wounds.leg);const lim=D.station-fa*95;if((ns-lim)*fa>0)ns=lim;
  const dz=D.lane-A.lane,nz=Math.abs(dz)>8?A.lane+clamp(dz,-44,44):A.lane;
  ns=clampSt(A,ns,nz);
  if(((ns-A.station)*fa>=8||Math.abs(nz-A.lane)>=8)&&!divOnSeg(A.station,A.lane,ns,nz))return{x:ns,z:nz,vault:false};
  if(nz!==A.lane){const n2=clampSt(A,ns,A.lane);if((n2-A.station)*fa>=8&&!divOnSeg(A.station,A.lane,n2,A.lane))return{x:n2,z:A.lane,vault:false};}
  if(tableBetween(A,D)){const b=tableBox(),far=fa>0?b.r:b.l,lx=vaultLand(A,far),mg=30+(A.body.bulk+D.body.bulk)*9;
    if((D.station-lx)*fa>=mg&&!divOnSeg(A.station,A.lane,lx,A.lane))return{x:lx,z:A.lane,vault:true};}
  return null;
}
function withdrawInfo(A,D){const fa=Math.sign(D.station-A.station)||A.facing,nx=clampSt(A,A.station-fa*75*(1-.15*A.wounds.leg));return Math.abs(nx-A.station)>=8?{x:nx}:null;}
function sidestepInfo(A,D){
  const dz=D.lane-A.lane,fa=Math.sign(D.station-A.station)||A.facing;
  if(Math.abs(dz)>16){
    let x=A.station;if(Math.abs(D.station-x)<74)x=clampSt(A,D.station-fa*74,D.lane);
    for(const z of [D.lane,D.lane-Math.sign(dz)*10])if(laneOK(A,z,x)&&!divOnSeg(A.station,A.lane,x,z))return{to:z,x,into:true};
    return null;}
  const dist=lerp(38,48,A.sk),c=[A.lane+dist,A.lane-dist].filter(z=>laneOK(A,z));
  if(!c.length)return null;
  const g0=S.arena.ground(A.station,A.lane),score=z=>(g0-S.arena.ground(A.station,z))*.6-(inTableLane(z,20)?8:0)-Math.abs(z-(DEP_MIN+DEP_MAX)/2)*.03;
  c.sort((a,b)=>score(b)-score(a));
  return{to:c[0],into:false};
}
function flankInfo(A,D){
  if(A.team!==1||!D||D!==hero())return null;
  const same=foes().filter(o=>o.side===A.side).length,other=foes().filter(o=>o.side===-A.side).length,crowd=same>=2&&other<same;
  const gapNear=S.divs.some(w=>!divSolid(w)&&Math.abs(w.x-D.station)<240);
  if((!crowd&&!(gapNear&&other===0))||S.game.turnNo-(S.lastFlank??-99)<(crowd?6:4))return null;
  const ns=-A.side,tx=clampStage(D.station+ns*(engageGap(A,D)+12));
  if((tx-D.station)*ns<70)return null;
  const cands=[D.lane+58,D.lane-58].filter(z=>z>=DEP_MIN&&z<=DEP_MAX);if(!cands.length)return null;
  cands.sort((a,b)=>Math.abs(a-A.lane)-Math.abs(b-A.lane));
  for(const dz of cands){
    if(inTableLane(dz,10)){const b=tableBox(),lo=Math.min(A.station,tx),hi=Math.max(A.station,tx);if(b.r>lo&&b.l<hi)continue;}
    const tz=clamp(D.lane+(dz>D.lane?12:-12),DEP_MIN,DEP_MAX);
    const path=[[A.station,A.lane],[A.station-A.side*20,dz],[tx,dz],[tx,tz]];
    if(S.divs.length&&divOnPath(path))continue;
    const gap=S.divs.length?gapOnPath(path):null;if(!crowd&&!gap)continue;
    if(laneOK(A,tz,tx))return{x:tx,z:tz,dz,side:ns,gap};}
  return null;
}
function planFlank(A,D,info){
  const z0=A.dep,x0=A.station,run=lerp(230,340,A.sk),fa=-A.side;
  const w1={x:x0+fa*20,z:info.dz},L1=Math.hypot(20,(info.dz-z0)*.9),L2=Math.abs(info.x-w1.x),L3=Math.abs(info.z-info.dz)*.9;
  const t1=Math.max(.2,L1/run),t2=t1+Math.max(.2,L2/run),t3=t2+Math.max(.18,L3/run),Tend=t3+.35;
  A.station=info.x;A.lane=info.z;A.side=info.side;A.facing=fa;
  const body=bodyKeys(A,[[0,'now',{pz:z0}],[t1,'stalk',{px:w1.x,pz:w1.z}],[t2,'stalkTurn',{px:info.x,pz:info.dz}],[t3,'guard',sstep],[Tend,'guard']]);
  const arm=armKeys(A,[[0,'now'],[Tend,'guard']]);
  const events=[{t:t2-.05,fn:()=>{faceToward(A,D.station);}}];
  return{att:{t0:S.t,end:Tend,body,arm},Tend:Tend+.05,events,dash:Math.round(L1+L2+L3),strikeX:info.x,Cfn:()=>({x:info.x,y:S.arena.ground(info.x,info.z)-80})};
}
function cmdValid(A,D,cmd){
  if(!A||A.dead)return false;
  // (there is no guard to take in a melee: every blow is answered as it comes, sk_react.js; in a gunfight it is cover, sk_guns.js)
  if(cmd==='guard')return false;
  if(outOfFooting(A,cmd,D))return false;
  if(A.downed)return cmd==='getup'||cmd==='wait'||(cmd==='roll'&&!!rollInfo(A));
  if(A.clinch){const holder=A.clinch.a===A;
    if(DIRTY.includes(cmd)||cmd==='wait')return true;
    if(cmd==='stab')return!!stabInfo(A);
    if(cmd==='throw')return!!throwInfo(A);
    if(cmd==='push')return holder;
    if(cmd==='breakfree')return!holder;
    if(cmd==='shield')return!!shieldInfo(A);
    return false;}
  if(cmd==='stab')return!!stabInfo(A);
  if(['getup','roll','throw','push','breakfree','shield','bind','stab'].includes(cmd)||DIRTY.includes(cmd))return false;
  if(cmd==='pincer')return!!pincerInfo(A);
  if(cmd==='helpup')return!!helpInfo(A);
  if(cmd==='cover')return!!coverInfo(A);
  if(cmd==='draw')return canDraw(A);
  if(cmd==='pickup')return!!pickupInfo(A);
  if(!D)return cmd==='wait';
  // nobody closes on, grabs or swings at a man who has not arrived yet
  if(D.walkIn&&D.team!==A.team&&cmd!=='guard'&&cmd!=='wait'&&cmd!=='withdraw')return false;
  if(cmd==='grab')return!!grabInfo(A,D);
  if(cmd==='feint')return feintOK(A,D);
  if(cmd==='shove'){const sv=shoveVariant(A,D);if(sv&&sv.kind==='bottle')return true;return!tableBetween(A,D)&&!(S.divs.length&&divBetween(A,D))&&!D.downed&&(!D.clinch||rescueShoveOK(A,D));}
  // pinned to the wall by a thrust: no stepping back or aside this turn
  if(A.wallPin&&(cmd==='withdraw'||cmd==='sidestep'))return false;
  if(cmd==='advance')return!!advanceInfo(A,D);
  if(cmd==='withdraw')return!!(breakoutInfo(A)||withdrawInfo(A,D));
  if(cmd==='sidestep')return!!sidestepInfo(A,D);
  if(cmd==='flank')return!!flankInfo(A,D);
  return true;
}
// A Veteran or better sees his target's guard or counter stance come up or drop and re-plans. A re-plan the stance alone causes
// costs him REPLAN_COST tempo; one he would make anyway (the target moved, the footing changed, a brute's answer to a guard) is free.
const REPLAN_COST=15;
function ensureIntents(){
  const K=hero();
  for(const A of foes()){
    if(!K||K.dead){A.intent=null;continue;}
    const T0=targetOf(A),it=A.intent,pin=pinned(A),gap=T0?Math.abs(A.station-T0.station):0,dz=T0?A.lane-T0.lane:0;
    const other=!it||!T0||it.tgt!==A.tgt||!cmdValid(A,T0,it.cmd)||Math.abs(gap-it.gap)>60||Math.abs(dz-it.dz)>20||pin!==it.pinned||PORDER.indexOf(A.posture)>PORDER.indexOf(it.band)||PORDER.indexOf(T0.posture)>PORDER.indexOf(it.tband)||(A.temper==='brute'&&T0.guarding&&!it.tguard&&it.cmd!=='overhead');
    const stance=!other&&A.skill>=RANK.veteran&&(!!T0.guarding!==!!it.tguard||!!T0.counter!==!!it.tctr);
    if(other||stance){
      if(stance)A.ready+=REPLAN_COST;
      let cmd=aiChoice(A.idx);const T1=targetOf(A);
      // a plan it cannot carry out is never shown: it holds its ground instead
      if(!cmdValid(A,T1,cmd))cmd=cmdValid(A,T1,'wait')?'wait':cmd;
      A.intent={cmd,tgt:A.tgt,gap:T1?Math.abs(A.station-T1.station):0,dz:T1?A.lane-T1.lane:0,pinned:pin,band:A.posture,tband:T1?T1.posture:'set',tguard:!!(T1&&T1.guarding),tctr:!!(T1&&T1.counter),changed:!!it,paid:stance?REPLAN_COST:0};}
  }
}
function takeIntent(A){ensureIntents();const c=A.intent?A.intent.cmd:aiChoice(A.idx);A.intent=null;return c;}
function isAI(i){const f=S.F[i];return!f||f.team===1||S.auto||(!!f.ally&&S.allyAuto);}
function stepExchange(){
  const ex=S.game.ex;if(!ex)return;
  const lt=S.t-ex.t0;
  if(ex.plan){
    for(const e of ex.plan.events)if(!e.done&&lt>=e.t){e.done=true;e.fn();if(S.game.ex!==ex)return;}
    if(ex.plan.Timp!==undefined&&!ex.impactDone){const Ti=ex.plan.Timp,o=ex.res.out,contact=o==='hit'||o==='crit'||o==='block'||o==='wall';
      if(!contact){if(lt>=Ti)doImpact(ex);}
      else if(lt>=ex.plan.Td+.08)doImpact(ex);
      else if(lt>=Ti-.1){const sg=ex.plan.contactSeg(),d=segDist(ex.plan.Cfn(),sg[0],sg[1]);
        if(d<(ex.res.tech.kick?13:ex.res.tech.dirty?16:10)){ex.perf.contact=true;doImpact(ex);}
        else if(lt>=Ti-.02&&ex.lastD!==undefined&&d>ex.lastD+.4&&ex.lastD<36)doImpact(ex);
        ex.lastD=d;}}
    const Q=ex.plan.sec;
    if(Q&&ex.impactDone&&!ex.impact2Done){const o=ex.res2.out,contact=o==='hit'||o==='crit'||o==='block';
      if(!contact||Q.timed){if(lt>=Q.Timp)doImpact2(ex);}
      else if(lt>=Q.Td+.08)doImpact2(ex);
      else if(lt>=Q.Timp-.1){const sg=ex.plan.contactSeg(),d=segDist(Q.Cfn(),sg[0],sg[1]);
        if(d<10){(ex.perf2=ex.perf2||{}).contact=true;doImpact2(ex);}
        else if(lt>=Q.Timp-.02&&ex.lastD2!==undefined&&d>ex.lastD2+.4&&ex.lastD2<36)doImpact2(ex);
        ex.lastD2=d;}}
  }
  if(ex.approach&&!ex.approach.fired){const ap=ex.approach,A=ex.A,D=ap.D;
    if(Math.abs(A.p[PEL].x-ap.x)<18||lt>1.6){ap.fired=true;ex.dur=Math.min(ex.dur,lt+.25);
      if(!D.dead&&!D.downed&&!D.clinch&&!A.dead&&!A.downed&&D.foot>=1&&!facingAway(D,A)){ex.openAt=S.t;ex.openFor=D;ex.openOpp=A;ex.openSource='stop';ex.openKind='stop';S.hooks.read(ex,D,{free:true,ok:true,src:'stop'},'stop');}}}
  if(ex.openAt!=null&&!S.opening&&S.t>=ex.openAt){const f=ex.openFor,op=ex.openOpp||(ex.A===f?ex.D:ex.A);ex.openAt=null;
    if(!f.dead&&!op.dead&&S.t>=f.knockUntil)startOpening(ex,f);}
  if(lt>=ex.dur&&!S.opening&&ex.openAt==null){const ok=S.F.every(f=>f.dead||f.downed||(f.motor>.85&&S.t>f.knockUntil&&!f.carry));if(ok||lt>ex.dur+4)finishExchange();}
}
function segDist(c,a,b){const dx=b.x-a.x,dy=b.y-a.y,l2=dx*dx+dy*dy||1,t=clamp(((c.x-a.x)*dx+(c.y-a.y)*dy)/l2,0,1);return Math.hypot(a.x+dx*t-c.x,a.y+dy*t-c.y);}
function finishExchange(){
  const g=S.game,last=g.ex;g.ex=null;restoreFacings();afterExchange();
  if(last&&last.dazedAtStart)last.A.daze=0;
  const pend=S.pending.splice(0);for(const fn of pend)fn();
  for(const fn of V11.exchangeEnd)fn(last);
  const K=hero();
  if(!K.dead&&!foes().length&&nextRoom()){beginTransit();return;}
  // the head of security is down: the office's last scene, which ends the fight itself
  if(!K.dead&&!foes().length&&S.room==='office'&&S.arenaKey==='restaurant'&&!S.finaleDone){S.finaleDone=true;beginFinale();return;}
  if(K.dead||!foes().length){g.phase='over';for(const f of S.F)f.intent=null;S.hooks.status();S.hooks.over(!K.dead);return;}
  targetOf(K);
  if(S.queued){const q=S.queued;S.queued=null;
    if(q.A&&!q.A.dead&&!q.A.downed&&!q.A.clinch&&q.D&&!q.D.dead&&!q.D.clinch&&cmdValid(q.A,q.D,q.cmd)){g.phase='input';g.active=q.A.idx;g.aiAt=null;setTgtAny(q.A,q.D);if(command(q.A.idx,q.cmd,{prepaid:true}))return;}
    else if(q.A&&!q.A.dead&&!q.A.downed&&!q.A.clinch){popup(q.A,'Stopped cold','#ff8a5c',null,19);S.hooks.log({type:'stopped',A:q.A,D:q.D});}}
  g.turnNo++;startTurn(nextActor());
}
// run up to the edge of a longer weapon's reach; its owner gets a stop-hit before the paid-for attack goes in
function beginApproach(A,D,cmd,ex){
  const fa=Math.sign(D.station-A.station)||A.facing,sr=stopRange(D,A),x=clampSt(A,D.station-fa*(sr-10),A.lane);
  A.guarding=false;A.counter=false;engage(A,D);A.station=x;
  ex.approach={x,D,cmd,fired:false};ex.dur=2.5;S.queued={A,D,cmd};
  S.hooks.log({type:'approach',A,D,ex,cmd});}
function setTgtAny(A,D){if(A.team===0)setTgt(A,D.idx);else A.tgt=D.idx;}
function startTurn(i){
  for(const fn of V11.turnStart)fn(i);
  const g=S.game,alive=S.F.filter(f=>!f.dead&&!f.npc),mn=Math.min(...alive.map(f=>f.ready));for(const f of alive)f.ready-=mn;
  for(const f of alive){if(f.downed)f.station=clamp(f.p[PEL].x,40,W-40);f.station=clampSt(f,f.station);}
  resolveStations();
  const K=hero();
  // everyone turns to whoever they are fighting
  for(const f of foes())if(!f.downed&&!f.clinch){const t=targetOf(f);if(t)faceToward(f,t.station);}
  for(const c of S.clinches){const dir=Math.sign(c.b.station-c.a.station)||c.a.facing;c.a.facing=dir;c.b.facing=c.behind?dir:-dir;}
  for(const h of heroes())if(!h.downed&&!h.clinch){
    if(h.holdFace!=null){const E=S.F[h.holdFace];if(E&&upright(E)&&!E.clinch&&Math.abs(E.station-h.station)<engageGap(h,E)+200){faceToward(h,E.station);continue;}h.holdFace=null;}
    const t=targetOf(h);if(t)faceToward(h,t.station);}
  // a cover lasts until the coverer acts again
  if(S.F[i]&&S.F[i].covering)S.F[i].covering=null;
  g.active=i;g.phase='input';
  // his turn: a break is over, and two pips of balance come back (a crew man or a boss is held to his own bar)
  for(const f of alive)if(f.foot>footMaxOf(f))f.foot=footMaxOf(f);
  {const F=S.F[i];if(F&&!F.dead){F.broken=null;F.react=null;gainFoot(F,BAL.recover);}}
  {const F=S.F[i];if(F&&!F.dead&&!F.downed&&!F.clinch&&onGlass(F)){spendFoot(F,1);popup(F,'Glass underfoot','#d6f3f5','−1 balance',16,-30);S.hooks.sound('glass',.25);}}
  ensureIntents();
  g.aiAt=isAI(i)?S.t+.55:null;S.hooks.turn(i);S.hooks.status();
}
// ---------- the feint ----------
function feintOK(A,D){if(!A||!D||A.downed||A.clinch||D.dead||D.downed||D.clinch||D.npc)return false;
  if(tableBetween(A,D)||(S.divs.length&&divBetween(A,D)))return false;
  return Math.abs(D.station-A.station)<=engageGap(A,D)+APPROACH_FREE+FEINT.reach;}
// your d20 plus skill against 10 plus his: footing, a daze and being outclassed count, as on every other roll
function feintMods(A,D){const mods=[['skill',A.skill],[footLabel(A),post(A).atk],['dazed',A.daze?-2:0],['outclassed',outclassMod(A,D)]],defMods=[['dazed',D.daze?-2:0]];
  return{mods,bonus:mods.reduce((s,m)=>s+m[1],0),dc:10+D.skill+defMods.reduce((s,m)=>s+m[1],0),defMods};}
function resolveFeint(A,D){return rollVs(feintMods(A,D),{kind:'feint',stance:D.guarding?'guard':D.counter?'counter':null});}
// the fake: a half-step in with the point coming forward, then straight back to guard; he bites or he doesn't at the commit
function planFeint(A,D,res){
  const fa=Math.sign(D.station-A.station)||A.facing,T1=.16,T2=.3,Tend=.62;
  const body=bodyKeys(A,[[0,'now'],[T1,'feint',{px:()=>A.station+fa*10},eOut],[Tend,'guard',sstep]]);
  const arm=armKeys(A,[[0,'now'],[T1,'feint',eOut],[T2,'feintBack'],[Tend,'guard',sstep]]);
  return{att:{t0:S.t,end:Tend,body,arm},Tend:Tend+.05,events:[{t:T1,fn:()=>applyFeint(A,D,res)}],dash:0,strikeX:A.station,Cfn:()=>({x:D.p[CHE].x,y:D.p[CHE].y})};}
function applyFeint(A,D,res){
  clearRead(A,D);const ex=S.game.ex;if(D.dead||D.downed||A.dead||A.downed){if(S.hooks.feint)S.hooks.feint(ex,{...res,void:true});return;}
  if(res.ok){D.guarding=false;D.circleGuard=false;D.counter=false;D.setSpear=false;A.feint={tgt:D.idx};A.feintRead=null;
    popup(D,res.stance==='guard'?'Guard drawn':res.stance==='counter'?'Counter spent':'Bites','#ffd36b',`+${FEINT.bonus} to the next attack`,18,-40);
    // he flinches: the weapon jerks up to meet a blow that never comes
    if(!D.action)D.action={t0:S.t,end:.5,body:bodyKeys(D,[[0,'now'],[.12,'feintBite',eOut],[.5,'guard',sstep]]),arm:armKeys(D,[[0,'now'],[.12,'feintBite',eOut],[.5,'guard',sstep]])};
    S.hooks.sound('swoosh',.4);}
  else{A.feintRead={tgt:D.idx};A.feint=null;popup(D,'Reads the feint','#c9d0f5',`+${FEINT.read} against the next attack`,18,-40);}
  if(S.hooks.feint)S.hooks.feint(ex,res);S.hooks.status();}
function command(i,cmd,opts){
  opts=opts||{};const g=S.game;if(g.phase!=='input'||g.active!==i||S.opening)return false;
  const A=S.F[i],D=targetOf(A);
  if(!cmdValid(A,D,cmd))return false;
  g.phase='exchange';g.aiAt=null;if(!opts.prepaid)A.ready+=actionCost(A,cmd,moveCost(A,D,cmd))+approachCost(A,D,cmd);
  if(A.team===1)A.intent=null;
  const ex={A,D,t0:S.t,cmd,perf:{},depth:0,dazedAtStart:A.daze>0};g.ex=ex;if(cmd!=='cover')A.covering=null;A.counter=false;A.lastAct=cmd;
  // a set spear, a pin to the wall and a held facing all last until this fighter's next command
  A.setSpear=false;A.wallPin=false;A.holdFace=null;
  if(cmd!=='feint'&&!ATTACKS.includes(cmd)&&!DIRTY.includes(cmd)&&cmd!=='stab'){A.feint=null;A.feintRead=null;}
  if(D&&!A.downed&&!A.clinch)faceToward(A,D.station);
  if(!opts.prepaid&&(ATTACKS.includes(cmd)||cmd==='shove')&&stopHitFor(A,D,cmd)){beginApproach(A,D,cmd,ex);S.hooks.status();return true;}
  if(cmd==='guard'){A.guarding=true;beginAction(A,'guard');A.circleGuard=circleGuardOK(A);ex.dur=.7;S.hooks.log({type:'guard',A,D,ex,circle:A.circleGuard});}
  else if(cmd==='feint'){const res=resolveFeint(A,D),plan=planFeint(A,D,res);beginAction(A,'feint');A.guarding=false;A.circleGuard=false;
    A.action=plan.att;ex.res=res;ex.plan=plan;ex.dur=plan.Tend;S.hooks.log({type:'feint',A,D,ex,res});}
  else if(cmd==='wait'){beginAction(A,'wait');if(!A.downed&&!A.clinch){A.guarding=false;A.circleGuard=false;
      if(setSpearOK(A)){A.setSpear=true;popup(A,'Spear set','#9fd8ff','for whoever closes',17,-40);}}
    ex.dur=.45;S.hooks.log({type:'wait',A,D,ex,counter:false,setSpear:!!A.setSpear});}
  else if(cmd==='getup'){const plan=planGetUp(A);ex.plan=plan;ex.dur=plan.Tend;S.hooks.log({type:'getup',A,D,ex});}
  else if(cmd==='roll'){const info=rollInfo(A),plan=planRoll(A,info);ex.plan=plan;ex.dur=plan.Tend;S.hooks.log({type:'roll',A,D,ex});}
  else if(cmd==='grab'){const gr=resolveGrab(A,D,false);A.guarding=false;beginAction(A,'grab');D.counter=false;const plan=planGrab(A,D,gr);
    A.action=plan.att;D.action=plan.react;ex.res=gr;ex.plan=plan;ex.dur=plan.Tend;ex.perf={dash:Math.round(plan.dash)};S.hooks.log({type:'grab',A,D,ex,res:gr});}
  else if(DIRTY.includes(cmd)){launchDirty(A,D,cmd,ex,false);S.hooks.log({type:'attack',A,D,res:ex.res,ex});}
  else if(cmd==='throw'){launchThrow(A,D,ex,false);S.hooks.log({type:'throw',A,D,ex,res:ex.res});}
  else if(cmd==='push'){const pp=planPush(A,D);A.guarding=false;beginAction(A,'push');A.action=pp.plan.att;D.action=pp.plan.react;ex.res=pp.sres;ex.plan=pp.plan;ex.dur=pp.plan.Tend;ex.perf={dash:Math.round(pp.plan.dash)};
    S.hooks.log({type:'push',A,D,ex});}
  else if(cmd==='breakfree'){const br=resolveBreak(A,D,false),plan=planBreak(A,D,br);beginAction(A,'breakfree');A.action=plan.att;ex.res=br;ex.plan=plan;ex.dur=plan.Tend;S.hooks.log({type:'breakfree',A,D,ex,res:br});}
  else if(cmd==='shield'){const info=shieldInfo(A),P=clinchPartner(A),plan=planShield(A,info);beginAction(A,'shield');ex.plan=plan;ex.dur=plan.Tend;S.hooks.log({type:'shield',A,D:P,ex,X:info.X});}
  else if(cmd==='stab'){launchStab(A,D,ex,false);S.hooks.log({type:'attack',A,D,res:ex.res,ex});}
  else if(cmd==='pincer'){const info=pincerInfo(A),plan=planPincer(A,info);beginAction(A,'pincer');A.action=plan.att;ex.plan=plan;ex.dur=plan.Tend;S.hooks.log({type:'pincer',A,D:info.D,P:info.P,ex,moved:plan.dash});}
  else if(cmd==='cover'){const info=coverInfo(A),plan=planCover(A,info);A.action=plan.att;ex.plan=plan;ex.dur=plan.Tend;S.hooks.log({type:'cover',A,D:info.X,P:info.P,ex});}
  else if(cmd==='helpup'){const info=helpInfo(A),plan=planHelp(A,info);A.action=plan.att;ex.plan=plan;ex.dur=plan.Tend;S.hooks.log({type:'helpup',A,D,P:info.P,ex});}
  else if(cmd==='draw'){const plan=planDraw(A);A.guarding=false;A.action=plan.att;ex.plan=plan;ex.dur=plan.Tend;S.hooks.log({type:'draw',A,D,ex});}
  else if(cmd==='pickup'){const L=pickupInfo(A),label=lootLabel(A,L),plan=planPickup(A,L);A.guarding=false;A.action=plan.att;ex.plan=plan;ex.dur=plan.Tend;S.hooks.log({type:'pickup',A,D,ex,label});}
  else if(cmd==='shove'&&shoveVariant(A,D)&&shoveVariant(A,D).kind!=='shoulder'){const sv=shoveVariant(A,D);
    if(sv.kind==='kick'){launchKick(A,D,ex,sv);S.hooks.log({type:'kick',A,D,ex,res:ex.res,P:sv.P});}
    else{launchBottle(A,D,ex,sv);S.hooks.log({type:'bottle',A,D,ex,res:ex.res,what:sv.what});}
  }else if(cmd==='shove'){
    const sres=resolveShove(A,D,false),sv=shoveVariant(A,D);if(sv&&sv.kind==='shoulder')sres.shoulder=true;const D2=sres.shoulder?null:dominoPartner(A,D);
    engage(A,D);A.guarding=false;beginAction(A,cmd);const plan=planShove(A,D,sres,'shove',D2);
    A.action=plan.att;D.action=plan.react;ex.res=sres;ex.plan=plan;ex.dur=plan.Tend;ex.perf={dash:Math.round(plan.dash)};ex.domino=D2;
    if(D2)S.callouts.push({i:A.idx,text:'Domino shove',age:0,life:1,dx:-A.facing*18});
    S.hooks.log({type:'shove',A,D,ex,res:sres});
  }else if(cmd==='advance'){
    A.guarding=false;const info=advanceInfo(A,D),before=A.station;
    if(info&&info.vault){const plan=planVaultMove(A,D,info.x);A.action=plan.att;ex.plan=plan;ex.dur=plan.Tend;
      S.hooks.log({type:'move',A,D,ex,cmd,moved:Math.round(Math.abs(info.x-before)),vault:true,toX:info.x,toZ:A.lane});}
    else{const stop=!info.around&&stopHitFor(A,D,'advance',info.x),beat=stop?beatPoint(A,D):0;A.station=info.x;A.lane=info.z;ex.dur=.95;
      if(stop){ex.approach={x:info.x,D,cmd:'advance',fired:false,beat};ex.dur=2.5;}
      S.hooks.log({type:'move',A,D,ex,cmd,moved:Math.round(Math.hypot(A.station-before,(info.z-A.dep)*.8)),toX:A.station,toZ:A.lane,stop,beat});}
  }else if(cmd==='withdraw'){
    const bo=breakoutInfo(A);
    if(bo){A.guarding=false;beginAction(A,'withdraw');const plan=planBreakout(A,bo);A.action=plan.att;ex.plan=plan;ex.dur=plan.Tend;
      S.hooks.log({type:'breakout',A,D,ex,pass:bo.pass,moved:plan.dash});}
    else{beginAction(A,'withdraw');const before=A.station;A.station=withdrawInfo(A,D).x;ex.dur=.95;
    S.hooks.log({type:'move',A,D,ex,cmd,moved:Math.round(Math.abs(A.station-before)),toX:A.station,toZ:A.lane});}
  }else if(cmd==='flank'){
    beginAction(A,'flank');A.guarding=false;const info=flankInfo(A,D),from=A.side,plan=planFlank(A,D,info);A.action=plan.att;ex.plan=plan;ex.dur=plan.Tend;
    if(info.gap)S.callouts.push({i:A.idx,text:'Through the gap',age:0,life:1.1,dx:-A.facing*18});
    S.lastFlank=S.game.turnNo;S.hooks.log({type:'flank',A,D,ex,from,moved:plan.dash,gap:info.gap});
  }else if(cmd==='sidestep'){
    beginAction(A,'sidestep');const info=sidestepInfo(A,D),from=A.lane,plan=planSidestep(A,info);A.action=plan.att;ex.plan=plan;ex.dur=plan.Tend;
    S.hooks.log({type:'sidestep',A,D,ex,into:info.into,moved:Math.round(Math.abs(info.to-from)),toZ:info.to,toX:A.station});
  }else{
    launchAttack(A,D,cmd,ex,false,null);
    if(!ex.reactPending)S.hooks.log({type:'attack',A,D:ex.D,res:ex.res,ex});
  }
  S.hooks.status();return true;
}
// temperament moves that override the generic choice
function temperChoice(A,D,ok,r,dist,between){
  const t=A.temper,foot=A.foot;if(!t||t==='plain'||foot<1)return null;
  const unsteady=D.posture!=='set',kill=D.hp<D.maxHp*.35;
  if(t==='brute'){
    // anyone wobbling or nearly finished gets an Overhead
    if((unsteady||kill)&&ok('overhead')&&foot>=2&&r()<.55)return'overhead';
    // drive them into the furniture
    if(!between&&ok('shove')&&foot>=2&&(obstacleKind(D,90)||(typeof driveOptions==='function'&&driveOptions(A,D).length))&&r()<.35)return'shove';
    return null;}
  if(t==='keeper'){
    const jam=A.wp.len>=60&&techContext(A,D).clinch,sr=stopRange(A,D);
    // somebody inside the point: give ground or push them off it
    if(jam&&ok('withdraw')&&!breakoutInfo(A)&&r()<.65)return'withdraw';
    if(jam&&ok('shove')&&foot>=2&&r()<.5)return'shove';
    // out past the point: let them come onto it
    if(dist>sr+30&&!outreaches(D,A)&&foot>=2&&r()<.45)return'wait';
    if(!jam&&ok('thrust')&&r()<.5)return'thrust';
    return null;}
  if(t==='rusher'){
    // get hold of them, take the legs of the unsteady, and close the distance rather than wait
    if(ok('grab')&&r()<(facingAway(D,A)?.7:.4))return'grab';
    if(unsteady&&ok('sweep')&&r()<.5)return'sweep';
    if(dist>engageGap(A,D)+90&&ok('advance')&&r()<.3)return'advance';
    return null;}
  return null;}
// the next enemy due to act before A's next turn, if their shown plan is an attack on A
function threatOn(A){const ord=turnOrder(8);let i=ord[0]===A.idx?1:0;
  for(;i<ord.length;i++){const k=ord[i];if(k===A.idx)return null;const E=S.F[k];if(!E||E.dead||E.team===A.team)continue;
    const it=E.intent;return it&&ATTACKS.includes(it.cmd)&&targetOf(E)===A&&cmdValid(E,A,it.cmd)?{E,cmd:it.cmd}:null;}
  return null;}
function aiClinch(A,D){
  const r=S.rng,c=A.clinch,holder=c.a===A;
  if(stabInfo(A)&&r()<(c.b===A&&c.behind?.6:.42))return'stab';
  if(holder){
    if(c.behind&&gangPartner(A,D)&&r()<.6)return'wait';   // hold them still for a partner
    if(c.behind&&A.team===1)return r()<.5?'knee':'headbutt';
    if(A.team===0&&shieldInfo(A)&&r()<.3)return'shield';
    const th=throwInfo(A);if(th&&(th.hazard?r()<.6:r()<.28))return'throw';
    if(r()<.15)return'push';
    return DIRTY[Math.floor(r()*3)];}
  if(c.behind&&throwInfo(A)&&r()<.3)return'throw';
  if(r()<.5)return'breakfree';
  return DIRTY[Math.floor(r()*3)];
}
function aiChoice(i){
  const A=S.F[i],r=S.rng;
  if(A.downed){const E=nearestEnemy(A),close=E&&Math.abs(E.station-A.station)<130;return close&&r()<.35&&rollInfo(A)?'roll':'getup';}
  if(A.team===0&&!A.clinch)retargetHero(A);
  if(A.team===1&&!A.clinch)retargetFoe(A);
  const D=targetOf(A);if(!D)return'wait';
  if(A.clinch)return aiClinch(A,D);
  A.driveSel=aiPickDrive(A,D);
  const dist=Math.abs(A.station-D.station),k=A.weaponKey,between=tableBetween(A,D)||!!(S.divs.length&&divBetween(A,D)),dz=Math.abs(A.lane-D.lane),ok=c=>cmdValid(A,D,c);
  if(A.team===0){const tc=teamChoice(A,D,ok,r);if(tc)return tc;}
  // empty-handed: get something back in hand
  if(ok('draw')){const L=pickupInfo(A);if(!(L&&L.owner===A.idx&&Math.abs(L.x-A.station)<110)||r()<.3)return'draw';}
  if(A.sidearm==='drawn'&&ok('pickup')){const L=pickupInfo(A);if(L&&L.owner===A.idx&&Math.abs(L.x-A.station)<150&&r()<.55)return'pickup';}
  if((A.wp.unarmed||A.wp.improv)&&ok('pickup')&&r()<(A.wp.unarmed?.8:.35))return'pickup';
  // someone on the ground gets finished
  if(D.downed&&!D.dead){const w={thrust:3,overhead:2.5,sweep:2,slash:1},ks=['thrust','overhead','sweep','slash'].filter(ok);
    if(ks.length){let t=r()*ks.reduce((s,k)=>s+w[k],0);for(const key of ks){t-=w[key];if(t<=0)return key;}return ks[0];}}
  // the pack: hold Kael from behind while an ally faces him, and pile in while he is held
  if(A.team===1){
    const held=heldBy(D);
    if(held&&held!==A){const w={overhead:4,thrust:3,slash:2},ks=['overhead','thrust','slash'].filter(ok);
      if(ks.length){let t=r()*ks.reduce((s,k)=>s+w[k],0);for(const key of ks){t-=w[key];if(t<=0)return key;}return ks[0];}}
    if(ok('grab')&&facingAway(D,A)&&foes().some(o=>o!==A&&upright(o)&&!o.clinch&&Math.abs(o.station-D.station)<190)&&r()<.5)return'grab';
    if(shieldFor(A,D)&&ok('flank')&&r()<.5)return'flank';
  }
  // broken glass underfoot: get off it
  if(onGlass(A)&&A.foot<=4&&r()<.6){if(ok('sidestep'))return'sidestep';if(ok('withdraw')&&!breakoutInfo(A))return'withdraw';}
  // a broken divider is a way round: come through the gap at their side
  if(A.team===1&&ok('flank')){const fi=flankInfo(A,D);if(fi&&fi.gap&&r()<(A.temper==='rusher'?.6:.4))return'flank';}
  // temperament: how this enemy likes to fight
  const tc=A.team===1?temperChoice(A,D,ok,r,dist,between):null;if(tc)return tc;
  // balance comes back by itself and every blow is answered as it comes (sk_react.js): no turns spent recovering or guarding
  const foot=A.foot,tm=A.team===1?A.temper:null,kill=A.team===1&&D.hp<D.maxHp*.35;
  // a shoulder check shown on him while he is off balance would put him down: give ground
  if(A.team===0&&shoulderThreat(A)&&ok('withdraw')&&!breakoutInfo(A)&&r()<.5)return'withdraw';
  const easy=D.downed||D.posture==='off'||kill,keep=tm==='keeper',brute=tm==='brute';
  const pressed=feintBonus(A,D)>0;
  // off balance with a target in reach: the short cut that buys a pip back
  if(A.posture==='off'&&ok('slash')&&recoverOK(A,D)&&r()<(D.hp<=D.maxHp*.35?.5:.3))return'slash';
  // nothing left to strike with: get clear while it comes back
  if(foot<1)return ok('withdraw')&&!breakoutInfo(A)?'withdraw':ok('sidestep')?'sidestep':'wait';
  // a feint draws a wrong answer: the better fighters use it
  if(!pressed&&ok('feint')&&r()<(A.skill>=RANK.veteran?.12:.05))return'feint';
  // crowd reads: break out of a pincer, or knock one enemy into another
  const crowd=A.team===0&&foes().length>1;
  if(crowd&&A.skill>=RANK.expert&&surrounded(A)&&breakoutInfo(A)&&r()<(A.hp<A.maxHp*.5?.4:.22))return'withdraw';
  if(crowd&&!between&&dominoPartner(A,D)&&shoveChance(A,D,false)>.45&&r()<.4)return'shove';
  // lines: get back in line when the other side holds the angle, don't queue behind a partner, slip out of a pin
  if(offLine(A,D,'slash')&&holdsAngle(D,A)&&r()<.4&&ok('sidestep'))return'sidestep';
  if(A.team===1&&foes().some(o=>o!==A&&o.side===A.side&&Math.abs(o.station-D.station)<Math.abs(A.station-D.station))){
    if(r()<.45&&ok('flank'))return'flank';
    if(foes().some(o=>o!==A&&o.side===A.side&&Math.abs(o.lane-A.lane)<20)&&r()<.5&&ok('sidestep'))return'sidestep';}
  if(pinned(A)&&r()<.25&&ok('sidestep'))return'sidestep';
  if(dz<=16&&A.sk>=.5&&r()<.08&&ok('sidestep'))return'sidestep';
  // the contextual moves the moment offers: kick the chair, throw the bottle, shoulder check, set the spear, beat the point
  {const mv=moveChoice(A,D,ok,r,foot);if(mv)return mv;}
  if(dist>420&&r()<.35&&ok('advance'))return'advance';
  // reach: a longer weapon gives ground once the shorter one is inside it, so the next approach runs onto the point
  if(outreaches(A,D)&&!between&&!D.downed&&foot>=2&&dist<stopRange(A,D)-30&&ok('withdraw')&&!breakoutInfo(A)&&!(crowd&&surrounded(A))&&r()<(keep?.5:A.sk>=.5?REACH_GIVE:REACH_GIVE*.6))return'withdraw';
  if(k==='spear'&&dist<115&&r()<.3&&ok('withdraw'))return'withdraw';
  if(k==='dagger'&&dist>160&&r()<.3&&ok('advance'))return'advance';
  if(!between&&roomBehind(D)<60&&r()<(crowd?.2:.35))return'shove';
  {const ob=S.divs.length?divBehind(D):null;if(!between&&ob&&ob.d<80&&ok('shove')&&shoveChance(A,D,false)>.4&&r()<(S.showcase?.55:.3))return'shove';}
  // in a showcase brawl everyone fights dirty around the furniture: shove people into it and throw them onto it
  if(S.showcase&&!between){const fa=Math.sign(D.station-A.station)||A.facing,pr=S.props.some(Q=>!Q.broken&&Math.abs(Q.dep-D.lane)<Q.dz+14&&(Q.box.cx-D.station)*fa>0&&Math.abs(Q.box.cx-D.station)<90);
    if((pr||(tableIntact()&&tableInPath(D,fa,70)))&&ok('shove')&&r()<.4)return'shove';
    if(ok('grab')&&S.props.some(Q=>!Q.broken&&Math.abs(Q.dep-A.lane)<Q.dz+16&&Math.abs(Q.box.cx-A.station)<110)&&r()<.25)return'grab';}
  if(!between&&pinned(A)&&r()<(crowd?.15:.35))return'shove';
  // a shove knocks a Committed man off balance; one already off balance is floored by it (the shoulder check), so that one is
  // weighed with the other ways to put him down, in the attack pick below
  if(!crowd&&!between&&D.posture==='committed'&&shoveChance(A,D,false)>.55&&r()<.25)return'shove';
  if(A.team===1&&A.sk>=.25&&foot<=4&&r()<.07)return'wait';
  // chest to chest, sometimes grab instead of swinging
  if(ok('grab')&&r()<(A.wp.unarmed?.3:A.wp.improv?.15:.07)*(S.arena.indoor?1.7:1)*(S.showcase?1.5:1))return'grab';
  const hA=S.arena.ground(A.station,A.lane),hD=S.arena.ground(D.station,D.lane);
  // light blows are the efficient default; heavy ones need a reason
  const w={slash:k==='elven'?4.6:4,overhead:k==='axe'?1.7:.5,thrust:k==='spear'?5:k==='dagger'?4:3.5,sweep:.3};
  if(D.guarding){w.overhead+=6;w.slash*=.5;w.thrust*=k==='elven'?1.1:.5;}
  if(lashReady(A,D))w.slash+=4;
  if(D.counter){w.thrust+=2;w.overhead*=.2;w.sweep*=.3;}
  if(D.posture==='committed'){w.sweep+=3;w.overhead+=1;}
  if(D.posture==='off'){w.sweep+=5;w.overhead+=4;}
  if(D.wasDown||S.t<D.knockUntil)w.sweep=0;
  if(tm==='brute'){w.overhead+=2.5;w.slash+=1;}else if(tm==='keeper'){w.thrust+=3;w.slash*=.7;}else if(tm==='rusher'&&D.posture!=='set')w.sweep+=1.5;
  if(kill)w.overhead+=1.5;
  if(foot<=3&&!brute){w.overhead*=.5;w.sweep*=.7;}if(foot<=2){w.overhead*=.5;w.sweep*=.7;}
  if(backExposed(D,A)){w.slash+=2;w.overhead+=2;}
  const sT=pickTechnique(A,D,'slash');if(sT.multi)w.slash+=sT.multi.type==='whirl'?8:5;
  if(hD-hA>18)w.overhead+=2;if(hA-hD>18)w.thrust+=2;
  if(D.guarding)w.sweep+=2;
  if(D.lastAct==='withdraw')w.sweep*=.2;
  moveWeights(A,D,w,sT,ok);
  for(const key of ATTACKS){const rb=readBonus(A,D,key);if(rb)w[key]/=1+rb*1.5;}
  const keys=w.shove?[...ATTACKS,'shove']:ATTACKS;
  let t=r()*keys.reduce((s,k)=>s+w[k],0);
  for(const key of keys){t-=w[key];if(t<=0)return key;}
  return'slash';
}
function simStep(){
  S.t+=DT;divTrack();
  if(!S.warming){const g=S.game;
    if(g.phase==='input'&&g.aiAt!=null&&S.t>=g.aiAt&&!S.opening){g.aiAt=null;const A=S.F[g.active],c=A.team===1?takeIntent(A):aiChoice(g.active);
      if(!command(g.active,c))for(const f of ['getup','wait'])if(command(g.active,f))break;}
    stepExchange();if(S.stage.tr)transitStep();for(const fn of V11.step)fn();}
  if(!S.warming&&S.intro)introStep();
  const LF=S.F.some(f=>f.gone)?S.F.filter(f=>!f.gone):S.F;
  for(const f of LF){controlAndForces(f);if(f.lash)lashStep(f);}
  for(const f of LF)integrate(f);
  propsIntegrate();envIntegrate();
  for(const f of LF)if(f.carry)carryStep(f);
  for(let it=0;it<8;it++){for(const f of LF){solve(f);collide(f,it===7);}propsSolve(it===7);envSolve(it===7);if(it>=4){fighterTable(it===7);fighterEnv(it===7);}clinchSolve();impaleSolve();}
  stuckStep();finTick();envPost();
  if(S.table&&S.table.state==='breaking'&&S.t>=S.table.breakBy)breakTable();
  if(S.wall&&S.wall.state==='breaching'&&S.t>=S.wall.breakBy)breachWall();
  if(tableIntact()){const P=S.table.pts;if(Math.abs(Math.atan2(P[1].y-P[0].y,P[1].x-P[0].x))>.8){S.table.state='toppled';const b=tableBox();dust(b.cx,b.b,1.1,S.table.dep);S.hooks.sound('thud',300);S.hooks.status();}}
  for(const f of LF){if(!Number.isFinite(f.p[PEL].x+f.p[TIP].y+f.p[HEAD].x+f.dep)){f.dep=f.lane;f.vdep=0;f.carry=null;f.build();}scarfStep(f);recordTrail(f);offTrailStep(f);flairStep(f);dripStep(f);}
  fxStep(DT);bloodStep(DT);
}
function warm(n){S.warming=true;for(let i=0;i<n;i++)simStep();S.warming=false;S.flashes=[];S.sparks=[];S.dusts=[];S.popups=[];S.ghosts=[];S.rings=[];S.callouts=[];S.punch=null;S.camKick=null;S.blood=[];S.trails=S.F.map(()=>[]);}
function rosterBuild(){
  const c=S.cfg;S.F=[new Fighter(0,0,HERO_NAME,HERO_COLOR)];Object.assign(S.F[0],{seed:c.hero.seed,weaponKey:c.hero.weapon,skill:c.hero.skill});
  for(let i=0;i<c.n;i++){const f=new Fighter(i+1,1,FOE_NAMES[i],FOE_COLORS[i]),fc=c.foes[i];Object.assign(f,{seed:fc.seed,weaponKey:fc.weapon,skill:fc.skill,temper:fc.temper||DEFAULT_TEMPER[i]});S.F.push(f);}
  if(c.ally&&c.ally.on){const f=new Fighter(c.n+1,0,ALLY_NAME,ALLY_COLOR);Object.assign(f,{seed:c.ally.seed,weaponKey:c.ally.weapon,skill:c.ally.skill,ally:true});S.F.push(f);}
  S.trails=S.F.map(()=>[]);S.crew=null;
}
function initFighter(f,s,sp){
  f.maxHp=f.team?foeHp():f.ally?ALLY_HP:120;f.hp=f.maxHp;f.dead=false;f.gone=false;f.guarding=false;f.foot=footMaxOf(f);f.counter=false;f.react=null;f.broken=null;f.intent=null;f.laneT=-9;f.ready=0;
  f.wounds={head:0,arm:0,leg:0,body:0};f.daze=0;f.downed=false;f.clinch=null;f.carry=null;f.marks=[];f.dripT=1;f.ownWeapon=null;f.circleGuard=false;f.spin=null;f.flair=null;
  f.severed=false;f.impaled=null;f.finRelease=null;f.fountain=null;f.dyingUntil=0;f.goneFrom=null;f.reads={};f.feint=null;f.feintRead=null;f.lastAct=null;f.holdFace=null;f.setSpear=false;f.wallPin=false;f.finName=null;f.finType=null;f.finBy=null;f.sidearm=f.idx===0?'sheathed':null;
  f.weaponKey=f.team?foeCfg(f).weapon:f.ally?S.cfg.ally.weapon:S.cfg.hero.weapon;f.temper=f.team?(foeCfg(f).temper||foeDefaultTemper(f)):null;
  f.tgt=null;f.covering=null;f.driveSel=null;f.dsd={};f.lash=null;f.lashLen=0;f.relockT=-9;f.arc=null;f.sheath=null;f.introUntil=0;f.action=null;
  f.scab=f.weaponKey==='sword'||f.weaponKey==='dagger'?f.weaponKey:null;
  f.side=f.team?s[2]:0;f.facing=f.team?-f.side:f.ally?allyFacing(sp,s):1;f.setup(f.seed,f.weaponKey,f.skill,s[0],s[1]);}
function initDuel(){
  S.arena=ARENAS[S.arenaKey];S.opening=null;S.rubble=[];S.debris=[];S.items=[];S.blood=[];S.stains=[];S.clinches=[];
  S.wall=S.arena.wall?{hp:3,state:'standing',breakBy:0,breakFrom:null,dir:1}:null;
  S.room='dining';S.stage={phase:1,tr:null};
  if(S.F.length!==rosterSize()||S.F.some(f=>f.p2||f.p3||f.p4||f.npc))rosterBuild();
  S.finaleDone=false;S.endText=null;
  const sp=SPAWN[S.arenaKey][crewOn()?3:S.cfg.n],asp=allySpawn(sp);
  S.F.forEach((f,i)=>initFighter(f,f.ally?asp:sp[i],sp));
  crewSetup(sp);
  S.target=1;
  S.table=null;S.wares=[];if(S.tableOn){const td=tableDefault();if(td)placeTable(td.x,td.d);}
  envBuild();
  S.F.forEach(f=>{f.ready=Math.round(actionCost(f,'slash')*.5);});
  for(const fn of V11.duelStart)fn();
  S.pending=[];S.queued=null;S.shake=0;S.freeze=0;S.slowT=0;S.trails=S.F.map(()=>[]);S.lastFlank=-99;
  S.game={phase:'idle',turnNo:1,active:0,ex:null,aiAt:null};S.intro=null;
  // weapons start sheathed, upright or rolled up, and come out before the first turn
  const intro=S.introOn?prepIntro(S.F.filter(f=>!f.dead),S.t+150*DT+.1):null;
  warm(150);
  if(intro){S.game.phase='intro';S.hooks.intro('start');}else startTurn(nextActor());
}
// ===== CORE END =====
