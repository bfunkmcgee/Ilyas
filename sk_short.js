// ===== SHORT HAND START =====
// Short Hand: short a hand, and short with the knife. Caliphate soldiers who lost hands and arms in the Poisoned River war (A.V. 1950
// to 1983) came south in the dispersals and built a dagger style out of what they had left; the Tarkesh veterans gave it its name.
// It is a style a fighter has (f.style 'shorthand') and learns a move at a time (f.styleMoves), and it works with a dagger in hand:
//   Stance       low, the weight forward, the knife tight to the chest, short chopping steps that never cross. Shoves and sweeps at
//                him are at -2, and a shove takes a pip less.
//   The Hinge    an answer in place of the Parry: the empty side turns into the blow and takes it glancing on the shoulder, and he
//                ends inside the man's reach (f.inside), +2 on his next attack on him. The man loses a pip. No riposte.
//   Wrist toll   an answer to a Thrust or a Grab: he cuts the hand that reaches. A grab that meets it fails for two pips.
//   Short ladder the Thrust becomes a rising stab from the low stance, under the guard; hardest from inside his reach.
//   Blind-side check and Ankle hook: the empty shoulder into a man not set (a cheaper Shoulder check), and the foot behind his ankle
//                while the knife threatens high; a barrel or a crate behind him puts him over it.
// Nothing here touches a fighter without the style: every wrapper below passes straight through for him, and draws no dice.

// ---------- the styles ----------
// (for the styles screen: each weapon has its styles, each with its own origin)
const STYLES={
  shorthand:{key:'shorthand',name:'Short Hand',weapon:'Dagger, one hand',origin:'Tarkesh veterans of the Poisoned River war, A.V. 1950 to 1983'},
  wire:{key:'wire',name:'Wire drill',weapon:'Arc-blade',origin:"Noon Company, on the Confederacy's border wire, the 2270s"},
  sareth:{key:'sareth',name:'The Sareth cut',weapon:'Arc-blade, sword',origin:'Thirty years of Eclipsera enforcement'}};
// Short Hand's moves in the order they are taught (lesson: the lesson that teaches it; key: its key in f.styleMoves)
const SHORT_MOVES=[
  {key:'stance',lesson:1,name:'Stance',what:'Low, the weight forward, the knife tight to the chest, the steps short. Shoves and sweeps at him are at −2, and a shove takes a pip less.'},
  {key:'hinge',lesson:2,name:'The Hinge',what:'An answer in place of the Parry. The empty side turns into the blow and takes it glancing on the shoulder, and he ends inside the man’s reach: +2 on his next attack on him.'},
  {key:'toll',lesson:3,name:'The Wrist toll',what:'An answer to a Grab or a Thrust: he cuts the hand that reaches. A grab that meets it fails and costs the grabber two pips.'},
  {key:'ladder',lesson:4,name:'The Short ladder',what:'A rising stab from the low stance, under the guard. It hits hardest from inside his reach.'},
  {key:'check',lesson:5,name:'The Blind-side check',what:'The empty shoulder drives into a man who is not set: a cheaper Shoulder check.'},
  {key:'hook',lesson:5,name:'The Ankle hook',what:'The foot hooks behind his ankle while the knife threatens high. A barrel or a crate behind him puts him over it.'}];
// the numbers
//   guard: the stance, as the GUARD entry it replaces (hx, hy: the knife hand, in arm lengths from the shoulder; w: the blade's angle)
//   step: dur and lift scale a step, len caps it (in leg lengths), gap keeps the feet apart (in leg lengths)
//   lowStance: off a shove or a sweep at him. hinge.def: its DEF by kind; glance: what a blow that lands still does; pips: the most a
//   glancing blow takes; cost: what the Hinge costs the man swinging. inside.bonus: on his next attack on that man; margin: how far
//   inside both men's striking distance he must stand to count as inside without a Hinge; keep: how far off the man may get before
//   the Hinge's inside is gone. toll.cut: the cut, as [dice, sides, base]. ladder.dmg: from inside. check.cost: off a shove's tempo
//   (the Shoulder check's is -20); pips, push and tempo: what it does to a man it does not floor. hook.prop: how far behind him a
//   barrel or a crate still takes his heels. pay: what the AI weighs each answer at (sk_react.js aiReact's table).
const SHORT_HAND={
  guard:{hx:.26,hy:.3,w:-.85,crouch:.74,lean:.24,sf:.28,sb:-.3},
  step:{dur:.8,lift:.55,len:.5,gap:.12},
  lowStance:2,
  hinge:{def:{slash:2,overhead:2,thrust:1,sweep:-1},glance:.45,pips:1,cost:1},
  inside:{bonus:2,margin:8,keep:12},
  toll:{def:2,pips:2,cut:[1,4,2]},
  ladder:{acc:1,reach:.7,threatReach:.8,along:.6,dmg:1.35},
  check:{cost:-30,pips:2,push:24,tempo:12},
  hook:{kdEase:1,prop:40},
  pay:{parry:.3,counter:.25,slip:.2,back:.1,turn:.4,hinge:1,toll:1.2}};

// ---------- who has it ----------
// the style is on: f.style, a dagger in hand, on his feet and not in the saddle
function shortOn(f){return!!f&&f.style==='shorthand'&&f.weaponKey==='dagger'&&!f.mount&&!f.downed&&!f.dead;}
// and this move of it learned (stance, hinge, toll, ladder, check, hook)
function shortKnows(f,m){return shortOn(f)&&!!(f.styleMoves&&f.styleMoves[m]);}
// anybody in the fight with the style (every wrapper that has to look round the fight passes straight through without one)
function shortAny(){for(const f of S.F)if(f&&f.style==='shorthand')return true;return false;}
// the minimum spacing the stations keep between two men in one line (resolveStations, sk_core.js), and a hair over it
function shortNeed(A,D){return Math.max(70,52+(A.body.bulk+D.body.bulk)*9)+2;}
// inside D's reach by a Hinge (f.inside, until his own next action); near: and still standing close to him
function shortInsideFlag(A,D,near){const I=A&&A.inside;if(!I||!D||I.on!==D.idx||A.downed||A.dead||D.downed||D.dead)return false;
  return!near||Math.abs(A.station-D.station)<=engageGap(D,A)+SHORT_HAND.inside.keep;}
// inside his reach: by a Hinge, or already standing closer than either man strikes from
function shortInside(A,D){if(!A||!D)return false;if(shortInsideFlag(A,D,true))return true;
  return Math.abs(A.station-D.station)<Math.min(engageGap(A,D),engageGap(D,A))-SHORT_HAND.inside.margin;}

// ---------- the answers ----------
REACT_NAME.hinge='Hinge';REACT_NAME.toll='Wrist toll';
REACT_DEF.hinge={...SHORT_HAND.hinge.def};REACT_DEF.toll={slash:0,thrust:SHORT_HAND.toll.def,overhead:0,sweep:0};
REACT_GOOD.hinge=['slash','overhead'];REACT_GOOD.toll=['thrust'];
// what the scenes hear: 'hinge', 'toll', 'ladder', 'check' and 'hook', with {A, D, kind, res} (A the one whose blow, grab or shove it
// is: for the Hinge and the toll the man swinging or reaching, for the rest the Short Hand fighter himself)
if(!S.hooks.short)S.hooks.short=function(){};
// what is going on right now: the blow being launched (its kind, for the toll), a blind-side check being made, the toll picked in a
// window, the cap on a glancing blow's balance, the man being shoved, an AI answer being weighed; and the command chain under this
// module's own wrapper (for a held grab)
const SH={kind:null,blind:null,toll:null,cap:null,shove:null,ai:null,cmd:null};
// the kind of the blow coming at D: the window's, the one being launched, or the command's
function shortBlowKind(D){const o=S.opening;if(o&&o.source==='react'&&o.f===D)return o.attack;const k=SH.kind;if(k&&k.D===D)return k.kind;
  const ex=S.game&&S.game.ex;return ex&&ex.D===D?ex.cmd:null;}
// the Hinge in the Parry's place; the Wrist toll after it, against a Thrust
{const rc=reactChoices;reactChoices=function(D,A){const ch=rc(D,A);if(!shortOn(D))return ch;let out=ch;
  if(shortKnows(D,'hinge'))out=out.map(k=>k==='parry'?'hinge':k);
  if(shortKnows(D,'toll')&&shortBlowKind(D)==='thrust'){out=out.slice();out.splice(1,0,'toll');}
  return out;};}
// a Short Hand fighter's own read: aiReact (sk_react.js) with the style's answers in its table. The Hinge pays most against a Slash or
// an Overhead and the toll against a Thrust, so those are what a good read picks; a wrong read is the same as anyone's.
function shortAiReact(D,A,kind,T,opening,ch){
  const r=S.rng,pay=SHORT_HAND.pay;let best=ch[0],bv=99;
  for(const k of ch){const v=reactLands(A,D,kind,opening,T,k)-(pay[k]??.2)*.15;if(v<bv){bv=v;best=k;}}
  const read=clamp(.25+.14*(D.skill||0)-.05*(A.skill||0)+(kind==='thrust'?-.1:kind==='overhead'?.1:0)-(D.daze?.15:0)-(feintBonus(A,D)>0?.3:0),.1,.92);
  if(r()<read)return best;
  const others=ch.filter(k=>k!==best&&k!=='turn'),habit=D.temper==='keeper'?'back':D.temper==='brute'?'counter':D.temper==='rusher'?'slip':null;
  if(habit&&others.includes(habit)&&r()<.5)return habit;
  return others.length?others[Math.floor(r()*others.length)]:best;}
// (whatever answers for him further in, a scene forcing his answer, is kept: only the core's own pick, which cannot weigh the style's
// answers, is replaced. The core is known by the chances it weighs, reactLands.)
{const rl=reactLands;reactLands=function(){if(SH.ai)SH.ai.n++;return rl.apply(this,arguments);};}
{const ar=aiReact;aiReact=function(D,A,kind,T,opening){if(!shortOn(D))return ar.apply(this,arguments);const ch=reactChoices(D,A);
  if(!ch.includes('hinge')&&!ch.includes('toll'))return ar.apply(this,arguments);
  const prev=SH.ai,me={n:0};SH.ai=me;let k;try{k=ar.apply(this,arguments);}finally{SH.ai=prev;}
  return me.n>0||!ch.includes(k)?shortAiReact(D,A,kind,T,opening,ch):k;};}
// the toll against a grab: by his own read, as an answer is (a scene can wrap this to force it)
function aiToll(D,A){const read=clamp(.3+.14*(D.skill||0)-.05*(A.skill||0)-(D.daze?.15:0)-(D.posture==='off'?.15:0),.1,.92);return S.rng()<read;}
// a grab he can answer with the toll: he knows it, he sees it coming, and he has an answer at all (sk_react.js canReact)
function canToll(A,D){return!!(A&&D&&shortKnows(D,'toll')&&A.team!==D.team&&!D.dead&&!D.downed&&!D.clinch&&!D.broken&&!D.npc&&!D.hidden&&
  !S.warming&&!S.cut&&!facingAway(D,A));}

// ---------- the stance ----------
// low, the weight forward, the knife hand close to the chest and angled up and forward; Committed, the hand still does not reach. A
// one-armed man's back hand is pinned at his chest (sk_pit.js), so it is left where it is.
{const tg=tacGuard;tacGuard=function(f){const g=tg(f);if(!shortOn(f))return g;const G=SHORT_HAND.guard;
  return{...g,hx:G.hx-(f.posture==='committed'?.14:0),hy:G.hy,w:G.w,crouch:G.crouch,lean:G.lean,sf:G.sf,sb:G.sb,
    off:f.oneArm||!g.off?g.off:[g.off[0]*.55,g.off[1]+.12]};};}
// short chopping steps, low and quick, and the feet never cross: the front foot lands ahead of the back one and the back foot behind
// the front one (a scene's walk keeps its own gait)
{const us=updateSteps;updateSteps=function(f,pelTX,bp){us(f,pelTX,bp);
  if(!shortOn(f)||f.cutWalk||f.motor<.45)return;
  const st=f.steps,fa=f.facing,leg=f.leg,K=SHORT_HAND.step;
  for(let k=0;k<2;k++){const s=st[k];if(!s.active||s.t0!==S.t||s._sh||s.walk)continue;s._sh=1;
    s.dur*=K.dur;s.lift=Math.min(s.lift,6+(s.lift-6)*K.lift);
    const mx=leg*K.len,o=st[1-k],ox=o.active?o.to.x:o.plant.x,kx=s.from.x;let x=clamp(s.to.x,kx-mx,kx+mx);
    if((k===0?(kx-ox):(ox-kx))*fa>0){const g=leg*K.gap;if(k===0&&(x-ox)*fa<g)x=ox+fa*g;if(k===1&&(ox-x)*fa<g)x=ox-fa*g;}
    s.to={x:footClamp(f,x)};}};}
// shoves and sweeps at him are at -2
{const sm=shoveMods;shoveMods=function(A,D,opening){const c=sm(A,D,opening);
  if(D&&shortOn(D)){c.mods.push(['low stance',-SHORT_HAND.lowStance]);c.bonus-=SHORT_HAND.lowStance;}return c;};}
// (and one pip less to a shove, below in knockBalance)

// ---------- the dice ----------
{const cm=computeMods;computeMods=function(A,D,kind,opening,T){const c=cm(A,D,kind,opening,T);if(!A||!D)return c;
  const down=!!D.downed&&!D.dead;
  if(kind==='sweep'&&!down&&shortOn(D)){c.mods.push(['low stance',-SHORT_HAND.lowStance]);c.bonus-=SHORT_HAND.lowStance;}
  // inside his reach: the dagger's +2 (the one it already has inside a longer weapon's reach does not come twice)
  if(!down&&ATTACKS.includes(kind)&&shortOn(A)&&shortInsideFlag(A,D,true)){const ir=c.mods.find(m=>m[0]==='inside the reach'),add=SHORT_HAND.inside.bonus-Math.max(0,ir?ir[1]:0);
    if(add>0){c.mods.push(['Inside his reach',add]);c.bonus+=add;}}
  // the ankle hook: a raised guard is guarding high
  if(T&&T.key==='anklehook'&&!down){const g=c.defMods.find(m=>m[0]==='parry');if(g&&g[1]>0){c.def-=g[1];g[1]=0;}}
  return c;};}

// ---------- the Short ladder and the Ankle hook ----------
// The Thrust becomes the Short ladder (not the back thrust, a pin to the wall or a haft cut, which are the moment's own); the dagger's
// Reaping kick becomes the Ankle hook (not the hamstring). With f.shortThreat the next Short ladder is a threat, not a stab.
{const pt=pickTechnique;pickTechnique=function(A,D,kind){const T=pt(A,D,kind);
  if(!shortOn(A)||!D||D.downed||D.dead||A.clinch||T.ground)return T;
  if(kind==='thrust'&&(A.shortThreat||(shortKnows(A,'ladder')&&!['backthrust','pinwall','haftcut'].includes(T.key))))return shortLadder(A,D,T);
  if(kind==='sweep'&&shortKnows(A,'hook')&&(T.key==='kick'||T.key==='slide'))return shortHook(A,D,T);
  return T;};}
const SHORT_DROP=['Long approach','Cramped','Uphill','High ground','Flourish'];
function shortLadder(A,D,T){const L=SHORT_HAND.ladder,thr=!!A.shortThreat,inside=shortInside(A,D);
  const nm=T.vault?'Vaulting short ladder':T.around!=null?'Circling short ladder':'Short ladder';
  return{...T,key:'shortladder',name:nm,why:'A rising stab from the low stance, under the guard. Hardest from inside his reach.',
    acc:L.acc+(T.vault?-1:0),dmg:thr?0:inside?L.dmg:1,along:A.wp.len*L.along,ang:a=>a-.3,reach:thr?L.threatReach:L.reach,anchor:thr?'neck':'belly',hook:true,move:true,
    passing:false,flair:null,overlap:0,amp:1,multi:null,rising:false,descend:false,windCap:null,beat:false,cost:0,pinWall:false,backT:null,
    inside,threat:thr,tags:['Short Hand',...(inside?['From inside']:[]),...T.tags.filter(t=>!SHORT_DROP.includes(t))]};}
// a barrel or a crate just behind him (within hook.prop of his heels), in his depth
function shortHookProp(A,D){if(!A||!D||!S.props||!S.props.length)return null;const fa=Math.sign(D.station-A.station)||A.facing;let best=null,bd=1e9;
  for(const P of S.props){if(P.broken||(P.type!=='barrel'&&P.type!=='crate')||Math.abs(P.dep-D.dep)>P.dz+12)continue;
    const b=P.box,near=fa>0?b.l:b.r,d=(near-D.station)*fa;if(d<-(b.r-b.l)*.5||d>SHORT_HAND.hook.prop)continue;if(d<bd){bd=d;best=P;}}
  return best;}
function shortHook(A,D,T){const P=shortHookProp(A,D);
  return{...T,key:'anklehook',name:'Ankle hook',flair:null,kick:true,acc:0,kdEase:SHORT_HAND.hook.kdEase,move:true,anchor:'shin',
    why:P?`The foot hooks behind ${D.name}'s ankle while the knife threatens high, and the ${PROP[P.type].name} behind him does the rest.`
      :`The foot hooks behind ${D.name}'s ankle while the knife threatens high: he guards his face and loses his feet.`,
    tags:['Short Hand',...(P?['Over the '+PROP[P.type].name]:[]),...T.tags.filter(t=>!SHORT_DROP.includes(t))]};}

// ---------- the blind-side check ----------
// A Shove from the empty side: against a man who is not set (committed or off balance), or one he stands inside, at close range. Off
// balance it floors him as the Shoulder check does; otherwise it drives him back a step for two pips. It costs less tempo than the
// Shoulder check. Shown to everyone as kind 'blindcheck'; while the command itself runs it goes to the engine as a shoulder check
// (SH.blind), so the shove's own path (approach, tempo, no domino, the tucked shoulder) carries it.
{const sv=shoveVariant;shoveVariant=function(A,D,op){const v=sv(A,D,op);
  if(!D||!shortKnows(A,'check')||(v&&(v.kind==='kick'||v.kind==='bottle')))return v;
  if(A.clinch||D.dead||D.downed||D.clinch||D.npc||tableBetween(A,D)||(S.divs.length&&divBetween(A,D)))return v;
  if(Math.abs(D.station-A.station)>engageGap(A,D)+APPROACH_FREE)return v;
  const floor=D.posture==='off';if(!floor&&D.posture==='set'&&!shortInside(A,D))return v;
  const b=SH.blind;if(b&&b.A===A&&b.D===D)return{kind:'shoulder',blind:true,floor:b.floor,cost:SHORT_HAND.check.cost};
  return{kind:'blindcheck',floor,cost:SHORT_HAND.check.cost};};}
{const rs=resolveShove;resolveShove=function(A,D,opening){const r=rs(A,D,opening),b=SH.blind;if(r&&b&&b.A===A&&b.D===D){r.blind=true;r.blindFloor=!!b.floor;}return r;};}
{const mn=moveName;moveName=function(A,D,k){if(k==='shove'&&A&&D&&!A.dead&&!A.downed&&!A.clinch){const v=shoveVariant(A,D);if(v&&v.kind==='blindcheck')return'Blind-side check';}return mn(A,D,k);};}
// the check that does not floor him: a step back and two pips (one for a man in the stance himself)
function shortBlindDrive(A,D,sr){
  const fa=Math.sign(D.station-A.station)||A.facing,ex=S.game.ex,C=D.p[CHE],K=SHORT_HAND.check;D.guarding=false;D.counter=false;
  for(let i=0;i<D.p.length;i++){if(i===TIP)continue;const q=D.p[i],d2=(q.x-C.x)**2+(q.y-C.y)**2,w=Math.exp(-d2/(2*40*40)),k=(150+170*w)*.8*DT/Math.sqrt(D.body.mass);q.px-=fa*k;q.py+=k*.1;}
  const before=D.station;D.station=clampSt(D,D.station+fa*K.push);
  knockBalance(D,Math.max(0,K.pips-(shortOn(D)?1:0)),A);if(!D.wasDown)D.motor=Math.min(D.motor,.6);D.ready+=K.tempo;
  const pushed=Math.round(Math.abs(D.station-before));let tripped=null;
  if(!D.dead&&!D.downed&&pushed>=20&&!kdBlocked(A,D,sr.crush)){const tr=tripHazard(D,fa,before,D.station);if(tr){tripDown(D,tr,fa);tripped=tr;}}
  impactFeel(A,{dmg:4,out:'hit'},fa,'hit');flash({x:C.x,y:C.y},18,'#ffe9c8',D.dep);
  if(!tripped)popup(D,'Driven back','#ffd9a8',`−${K.pips} balance`,20);S.hooks.sound('thud',260);
  if(ex){ex.perf.knock=pushed;if(freshBreak(D)&&!D.downed&&!D.dead&&ex.openAt==null)considerOpening(ex,A,D,'broken');}
  S.hooks.shove(ex,{pushed,tableDmg:0,wallDmg:0,divDmg:0,ok:true,crush:sr.crush,shoulder:false,floored:false,label:'Blind-side check',push:false,blind:true,tripped,propDmg:0,drive:null});
  S.hooks.short('check',{A,D,kind:'shove',res:sr});S.hooks.status();}
{const ds=doShove;doShove=function(A,D,sr){
  if(sr&&sr.blind&&sr.ok&&!sr.blindFloor&&!sr.turn&&!D.dead&&!D.downed)return shortBlindDrive(A,D,sr);
  const prev=SH.shove;SH.shove={D,used:false};
  try{return ds.apply(this,arguments);}finally{SH.shove=prev;if(sr&&sr.blind&&sr.ok)S.hooks.short('check',{A,D,kind:'shove',res:sr});}};}
// a glancing blow takes one pip at most; a man in the stance loses one pip less to a shove
{const kb=knockBalance;knockBalance=function(D,n,by){
  if(D&&n>0){const c=SH.cap;if(c&&c.D===D){n=Math.min(n,c.left);c.left-=n;}
    const s=SH.shove;if(s&&s.D===D&&!s.used&&shortOn(D)){s.used=true;n=Math.max(0,n-1);}}
  return kb.call(this,D,n,by);};}

// ---------- the blow ----------
// what a blow at a Short Hand fighter, or from one, comes to: the Hinge's glancing blow, the threat, and the hook's barrel
{const ra=resolveAttack;resolveAttack=function(A,D,kind,opening,T){
  const hinge=!!(D&&D.react==='hinge'&&shortOn(D));
  if(!hinge&&!shortOn(A))return ra.apply(this,arguments);
  T=T||pickTechnique(A,D,kind);const r=ra.call(this,A,D,kind,opening,T);
  // inside his reach: spent on this attack
  if(A.inside&&D&&A.inside.on===D.idx&&ATTACKS.includes(kind))A.inside=null;
  if(!r||r.out==='wall'||r.weaponHit)return r;
  if(T.threat)return shortThreatRes(D,r,T);
  const land=r.out==='hit'||r.out==='crit';
  if(hinge&&land)shortGlance(A,D,r,T);
  if(T.key==='anklehook'&&land&&!D.downed){const P=shortHookProp(A,D);if(P&&!kdBlocked(A,D,r.out==='crit')){r.hookProp=P;r.kd=D.hp-r.dmg<=0;}}
  return r;};}
// on the shoulder: under half the damage, never a crit's double, no finisher, no knockdown, nothing driven into the furniture
function shortGlance(A,D,r,T){
  const dc=T.dice||A.wp.dice,base=dc[2],sum=(r.dice||[]).reduce((s,d)=>s+d,0),pre=(sum+base)*(r.mult||1)+(r.hgDmg||0),crit=r.out==='crit';
  // (what another module took off it, the oilcloth coat's cut, still comes off)
  const core=Math.max(1,Math.round(pre*(crit?2:1)))+(r.shatter?3:0)+(r.tableDmg||0)+(r.wall||0)+(r.divDmg||0)+(r.propDmg||0),adj=r.dmg-core;
  r.glance=true;r.glanceFrom=r.out;r.out='hit';
  r.dmg=Math.max(1,Math.round(pre*SHORT_HAND.hinge.glance)+(r.shatter?3:0)+adj);
  r.table=null;r.tableDmg=0;r.wall=0;r.wallRes=null;r.wallStruct=0;r.div=null;r.divRes=null;r.divDmg=0;r.divStruct=0;r.drive=null;r.propDmg=0;
  r.knock=0;r.kdSaved=false;r.kd=D.hp-r.dmg<=0;r.guardBreak=false;r.tech={...T,fin:null,zone:'arm',glance:true};}
// the threat: it lands, and does nothing but put the point under his chin
function shortThreatRes(D,r,T){
  Object.assign(r,{out:'hit',dmg:0,dice:[],kd:false,kdSaved:false,knock:0,hgDmg:0,table:null,tableDmg:0,wall:0,wallRes:null,wallStruct:0,div:null,divRes:null,divDmg:0,divStruct:0,
    drive:null,propDmg:0,shatter:false,flat:false,guardBreak:false,threat:true,tech:{...T,fin:null,knock:.001}});
  return r;}
// the threat is not answered: it is a scene's
{const la=launchAttack;launchAttack=function(A,D,kind,ex,opening,popts){
  if(!(A&&A.style==='shorthand')&&!(D&&D.style==='shorthand'))return la.apply(this,arguments);
  const prev=SH.kind,thr=!!(ex&&A.shortThreat&&shortOn(A)&&kind==='thrust'&&D&&!D.downed&&!D.dead);
  if(thr){ex.reacted=true;ex._threat=true;}
  SH.kind={A,D,kind};
  try{return la.apply(this,arguments);}
  finally{SH.kind=prev;if(thr&&ex.res&&ex.res.threat){A.shortThreat=false;A._threat={D:ex.D,ex};}}};}

// ---------- the motion ----------
// the Short ladder starts low with the hand at the hip and rises under the guard, and neither the hand nor the body reaches past the
// stab; the threat stops there and holds. The Ankle hook's foot goes behind the ankle while the knife comes up at his face.
{const pa=planAttack;planAttack=function(A,D,kind,res,opts){const P=pa(A,D,kind,res,opts),T=res&&res.tech;
  if(!T||!P||!P.att)return P;
  if(T.key==='shortladder')shortLadderPlan(A,D,res,P);else if(T.key==='anklehook')shortHookPlan(A,D,res,P);
  return P;};}
function shortLadderPlan(A,D,res,P){
  const att=P.att,fa=P.dir??A.facing,a=A.arm,Ti=P.Timp,Td=P.Td,arm=att.arm,obj=k=>k&&k.v&&typeof k.v==='object';
  const iImp=arm.findIndex(k=>Math.abs(k.t-Ti)<1e-9);
  if(iImp>0){const wk=arm[iImp-1];if(obj(wk)&&wk.t<Ti&&wk.v.hand)wk.v={...wk.v,hand:{sh:[.04*a,.66*a]},wAng:-.55,tilt:-.08};
    const ih=arm[iImp].v.hand,th=arm[iImp].v.wAng,fol=arm.find(k=>k.t>Td+1e-9&&obj(k)&&k.v.hand);
    if(fol&&res.out!=='fumble')fol.v={...fol.v,hand:{fn:()=>{const h=A.resolve(ih);return{x:h.x+fa*.03*a,y:h.y-.07*a};}},wAng:th-.2};}
  for(const k of att.body){if(!obj(k)||k.t<=0)continue;
    if(k.t<Ti-1e-9)k.v={...k.v,crouch:Math.min(k.v.crouch,.72),lean:Math.max(k.v.lean,.28)};
    else if(k.t<=Td+1e-9)k.v={...k.v,crouch:.79,lean:.2,stF:.36*A.leg,stB:-.34*A.leg,...(P.strikeX!=null&&k.v.px!=null?{px:P.strikeX+fa*2}:{})};
    else k.v={...k.v,crouch:Math.min(k.v.crouch,.76),lean:Math.max(k.v.lean,.24),stF:.36*A.leg,stB:-.34*A.leg,...(P.strikeX!=null&&k.v.px!=null?{px:P.strikeX+fa*8}:{})};}
  S.callouts.push({i:A.idx,text:res.tech.name,age:0,life:clamp(Ti+.04,.75,1.4),dx:-fa*24});
  if(res.threat){att.body=att.body.filter(k=>k.t<=Td+1e-9);att.arm=att.arm.filter(k=>k.t<=Td+1e-9);att.end=1e9;
    for(const e of P.events)if(e.t>Td+.02){e.t=1e9;e.held=true;}P.Tend=1e9;}}
function shortHookPlan(A,D,res,P){
  const att=P.att,fa=P.dir??A.facing,a=A.arm,Ti=P.Timp,Td=P.Td,obj=k=>k&&k.v&&typeof k.v==='object';
  const behind={fn:()=>{const f2=D.p[FTF];return{x:f2.x+fa*6,y:f2.y-6};}};
  for(const k of att.body)if(obj(k)&&k.v.kick&&k.v.kick.fn&&k.t>=Ti-1e-9&&k.t<=Td+1e-9)k.v={...k.v,kick:behind,crouch:Math.min(k.v.crouch,.8),lean:Math.max(k.v.lean,.06)};
  if(att.arm.length<=3){const first=att.arm[0],last=att.arm[att.arm.length-1];
    const high={hand:{fn:()=>{const c=A.p[CHE];return{x:c.x+fa*.4*a,y:c.y-.16*a};}},wAng:-.15,off:A.wp.off?'grip':{sh:[.1*a,.3*a]},tilt:-.04};
    att.arm=[first,{t:Math.max(.05,Ti*.55),v:high,e:eOut},{t:Td+.05,v:high},{t:Math.max(Td+.1,last.t),v:last.v,e:sstep}];}
  S.callouts.push({i:A.idx,text:'Ankle hook',age:0,life:clamp(Ti+.04,.75,1.4),dx:-fa*24});}
// the answers' own motion: the Hinge turns the near shoulder into the blow with a small duck and then steps in (the step itself comes
// with his station, moved in where the blow lands); the toll meets the reaching wrist with the knife
{const pr=planReaction;planReaction=function(D,A,kind,res,Timp,Cfn,theta,rnd,snap,faO){
  if(!D||!res||D.downed||D.dead||res.out==='wall'||!shortOn(D))return pr.apply(this,arguments);
  if(D.react==='hinge')return shortHingePose(D,res,Timp,snap);
  if(D.react==='toll'&&kind==='thrust'&&res.out!=='hit'&&res.out!=='crit')return shortTollPose(D,A,Timp,snap,faO??A.facing);
  return pr.apply(this,arguments);};}
// (the step in waits for the swing to go past: his station moves where the blow lands, and the body follows it only after)
function shortHingePose(D,res,Ti,snap){
  const a=D.arm,gB=()=>D.guardBody(),gA=()=>D.guardArm(),b0=snap?{...D.curBody}:gB,a0=snap?{...D.curArm}:gA,x0=D.station;
  const Ts=Math.max(.03,Ti-lerp(.16,.28,D.sk)),Tt=Math.max(Ts+.02,Ti-.02),Te=Ti+.8;
  const turn=()=>({...D.guardBody(),px:x0,crouch:.68,lean:.34,th:.12}),tuck={hand:{sh:[.1*a,.18*a]},wAng:-1.3,off:D.wp.off?'grip':{sh:[.04*a,.32*a]},tilt:.32};
  return{t0:S.t,end:Te,slip:null,evs:[],
    body:[{t:0,v:b0},{t:Ts,v:gB},{t:Tt,v:turn,e:eOut},{t:Ti+.26,v:turn},{t:Ti+.56,v:()=>({...D.guardBody(),crouch:.71,lean:.3,th:.32}),e:sstep},{t:Te,v:gB,e:sstep}],
    arm:[{t:0,v:a0},{t:Ts,v:gA},{t:Tt,v:tuck,e:eOut},{t:Ti+.4,v:tuck},{t:Te,v:gA,e:sstep}]};}
function shortTollPose(D,A,Ti,snap,fa){
  const a=D.arm,gB=()=>D.guardBody(),gA=()=>D.guardArm(),b0=snap?{...D.curBody}:gB,a0=snap?{...D.curArm}:gA;
  const Ts=Math.max(.03,Ti-lerp(.12,.22,D.sk)),Tc=Math.max(Ts+.02,Ti-.01),Te=Ti+.6,off=D.wp.off?'grip':{sh:[.1*a,.32*a]};
  const cut={hand:{fn:()=>{const h=A.p[HAF];return{x:h.x-fa*2,y:h.y+5};}},wAng:.75,off,tilt:-.05},after={hand:{sh:[.22*a,.24*a]},wAng:-.9,off,tilt:0};
  const lean=()=>({...D.guardBody(),crouch:.74,lean:.06,th:.12});
  return{t0:S.t,end:Te,slip:null,evs:[],
    body:[{t:0,v:b0},{t:Ts,v:gB},{t:Tc,v:lean,e:eOut},{t:Ti+.25,v:lean},{t:Te,v:gB,e:sstep}],
    arm:[{t:0,v:a0},{t:Ts,v:gA},{t:Tc,v:cut,e:eOut},{t:Ti+.14,v:after,e:eOut},{t:Te,v:gA,e:sstep}]};}
// after a glancing blow that landed: a jolt on the shoulder, then the step in
function shortHingeAfterPose(D,fa){const a=D.arm,gB=()=>D.guardBody(),gA=()=>D.guardArm(),c0={...D.curBody},jolt={...c0,px:c0.px+fa*3,crouch:.66,lean:.2,th:.08};
  const tuck={hand:{sh:[.1*a,.18*a]},wAng:-1.3,off:D.wp.off?'grip':{sh:[.04*a,.32*a]},tilt:.3};
  return{t0:S.t,end:.76,body:[{t:0,v:c0},{t:.07,v:jolt,e:eOut},{t:.24,v:jolt},{t:.52,v:()=>({...gB(),crouch:.71,lean:.3,th:.3}),e:sstep},{t:.76,v:gB,e:sstep}],
    arm:[{t:0,v:{...D.curArm}},{t:.07,v:tuck,e:eOut},{t:.36,v:tuck},{t:.76,v:gA,e:sstep}]};}

// ---------- where it lands ----------
// the Hinge: inside his reach (the station steps in to the closest the stations allow), and he stays there while the man swinging
// settles (settleStation would otherwise take him back out to his own striking distance)
function shortStepIn(A,D,fa,P){if(D.downed||D.dead||D.clinch||A.clinch)return;
  const ax=P&&P.strikeX!=null?P.strikeX:A.station,want=ax+fa*shortNeed(A,D);if((D.station-want)*fa>0)D.station=clampSt(D,want);}
{const ss=settleStation;settleStation=function(A,D,sx){if(!A||!D||!shortInsideFlag(D,A))return ss(A,D,sx);
  const fa=Math.sign(D.station-A.station)||A.facing,lim=D.station-fa*shortNeed(A,D);let x=sx;if((x-lim)*fa>0)x=lim;return clampSt(A,x);};}
// the toll: the hand that reached is cut. A little damage (a crew man's cut is a crew man's, x CREW.dmg), an arm wound and two pips;
// never a killing cut. The die comes off the blow's own seed, so nothing more is drawn.
function shortCutHand(A,D,seed,fa){
  const C=SHORT_HAND.toll.cut,die=1+((seed>>>4)%C[1]),raw=Math.max(1,Math.round((die+C[2])*(D.hench?CREW.dmg:1))),dmg=Math.min(raw,Math.max(0,A.hp-1));
  A.hp=Math.max(0,A.hp-dmg);A.wounds.arm=Math.min(3,(A.wounds.arm||0)+1);
  const h=A.p[HAF];bleed({x:h.x,y:h.y},-fa,6,A.dep,.6);addMark(A,'arm',true);
  for(const i of [HAF,ELF,TIP]){const q=A.p[i];q.px+=fa*120*DT;}
  flash(h,16,'#ffe3b0',A.dep);popup(A,String(dmg),'#ffffff','Hand cut',22);S.hooks.sound('hit',dmg);
  knockBalance(A,SHORT_HAND.toll.pips,D);return dmg;}
// the threat lands: every pip of his (Broken, the engine's way, with the knife at his throat for the free move), and he freezes
function shortThreatImpact(ex,A,D,res){
  D.guarding=false;D.counter=false;D.react=null;D.setSpear=false;ex._shortHold=true;
  if(D.foot>0)knockBalance(D,D.foot,A);else if(!D.broken&&!D.clinch)breakFighter(D,A);
  if(D.broken)D.broken.paid=true;
  popup(D,'At his throat','#ffd36b','not a muscle',20,-40);
  const a=D.arm,chin=()=>({...D.guardBody(),lean:-.14,crouch:.93,th:.2});
  D.action={t0:S.t,end:1e9,quiet:true,body:[{t:0,v:{...D.curBody}},{t:.25,v:chin,e:eOut}],
    arm:[{t:0,v:{...D.curArm}},{t:.25,v:{hand:{sh:[.3*a,.3*a]},wAng:.9,off:D.wp.off?'grip':{sh:[.2*a,.32*a]},tilt:-.3},e:eOut}]};D.frozen=true;
  S.hooks.perf(ex);S.hooks.short('ladder',{A,D,kind:'thrust',res});S.hooks.status();}
// the knife comes away: he lowers it and steps back, the man breathes again, and the exchange is allowed to end
function shortRelease(A){const h=A&&A._threat;if(!h)return false;A._threat=null;A.shortThreat=false;const ex=h.ex,D=h.D;
  if(!A.dead){A.action={t0:S.t,end:.7,body:[{t:0,v:{...A.curBody}},{t:.7,v:()=>A.guardBody(),e:sstep}],arm:[{t:0,v:{...A.curArm}},{t:.7,v:()=>A.guardArm(),e:sstep}]};
    if(D&&!D.dead&&A.curBody)A.station=settleStation(A,D,A.curBody.px);}
  if(D&&!D.dead){D.frozen=false;D.action={t0:S.t,end:.6,body:[{t:0,v:{...D.curBody}},{t:.6,v:()=>D.guardBody(),e:sstep}],arm:[{t:0,v:{...D.curArm}},{t:.6,v:()=>D.guardArm(),e:sstep}]};}
  if(ex){ex._shortHold=false;if(ex.plan)for(const e of ex.plan.events)if(e.held)e.done=true;if(S.game.ex===ex)ex.dur=Math.max(0,S.t-ex.t0)+.75;}
  S.hooks.status();return true;}
{const ap=applyImpact;applyImpact=function(ex,A,D,res,Cfn,cv,slip,fa,primary){
  if(!ex||!res||!A||!D||!(shortOn(A)||shortOn(D)||res.threat))return ap.apply(this,arguments);
  if(res.threat&&primary)return shortThreatImpact(ex,A,D,res);
  const T=res.tech||{},clean=!res.weaponHit&&res.out!=='wall',land=res.out==='hit'||res.out==='crit',rx=D.react;
  const hinge=primary&&clean&&rx==='hinge'&&shortOn(D),toll=primary&&clean&&rx==='toll'&&res.kind==='thrust'&&shortOn(D);
  // (before the blow's own effects, so a break they cause is one the opening logic sees)
  if(hinge&&!A.dead)knockBalance(A,SHORT_HAND.hinge.cost,D);
  let cut=0;if(toll&&!land&&!A.dead){cut=shortCutHand(A,D,res.seed,fa);popup(D,'Wrist toll','#ffc163',`${A.name} −${SHORT_HAND.toll.pips} balance`,20,-40);}
  const n=S.popups.length,prevCap=SH.cap;
  if(hinge){ex._shortNoRiposte=D;if(land)SH.cap={D,left:SHORT_HAND.hinge.pips};}
  try{ap.apply(this,arguments);}finally{SH.cap=prevCap;if(ex._shortNoRiposte===D)ex._shortNoRiposte=null;}
  if(hinge||(toll&&!land))for(let i=S.popups.length-1;i>=n;i--){const p=S.popups[i];if(['Blocked','Miss','Slipped','Out of reach'].includes(p.text))S.popups.splice(i,1);}
  if(hinge&&!D.dead){
    popup(D,'Hinge','#9fd8ff',land?'glancing · inside':'inside his reach',land?18:20,land?-44:0);
    shortStepIn(A,D,fa,ex.plan);D.inside={on:A.idx,t:S.t};
    if(land&&!D.downed)D.action=shortHingeAfterPose(D,fa);
    S.hooks.short('hinge',{A,D,kind:res.kind,res});}
  if(toll)S.hooks.short('toll',{A,D,kind:'thrust',res,ok:!land,dmg:cut});
  if(primary&&clean&&T.key==='shortladder')S.hooks.short('ladder',{A,D,kind:'thrust',res});
  if(primary&&clean&&T.key==='anklehook'){if(res.hookProp&&land&&!D.dead&&!D.downed)tripDown(D,{what:'prop',p:res.hookProp},fa);S.hooks.short('hook',{A,D,kind:'sweep',res});}};}
// the Hinge opens no riposte (a break still gives its free move), and a knife held at a throat opens nothing at all
{const co=considerOpening;considerOpening=function(ex,f,opp,src){
  if(ex&&(ex._shortHold||(ex._shortNoRiposte&&ex._shortNoRiposte===f&&src!=='broken')))return;return co.apply(this,arguments);};}

// ---------- the toll against a grab ----------
// The toll is decided without seeing the grab's roll: an enemy (or a hero on auto) by aiToll, a hero the player controls in a window of
// its own before the grab is rolled (source 'toll': Wrist toll or let it come; the time running out takes his own read). Taken, the
// grab fails, and the grabber pays two pips (not the engine's three) and a cut hand.
{const rg=resolveGrab;resolveGrab=function(A,D,opening){const r=rg(A,D,opening);if(!r||!D||!shortKnows(D,'toll'))return r;
  const t=SH.toll;let use=false;
  if(t&&t.A===A&&t.D===D)use=!!t.use;else if(canToll(A,D)&&isAI(D.idx))use=aiToll(D,A);
  if(use){r.ok=false;r.crush=false;r.toll=true;}return r;};}
// the knife meets the reaching hand
{const pg=planGrab;planGrab=function(A,D,gr){const P=pg(A,D,gr);if(!gr||!gr.toll||!P)return P;
  const Tc=P.events[0]?P.events[0].t:.3,a=D.arm,off=D.wp.off?'grip':{sh:[.1*a,.32*a]};
  const cut={hand:{fn:()=>{const h=A.oneArm?A.p[HAF]:A.p[HAB];return{x:h.x,y:h.y+5};}},wAng:.8,off,tilt:-.05};
  P.react={t0:S.t,end:Tc+.6,body:[{t:0,v:{...D.curBody}},{t:Math.max(.04,Tc-.14),v:()=>D.guardBody()},{t:Tc,v:()=>({...D.guardBody(),crouch:.72,lean:.3,th:.12}),e:eOut},{t:Tc+.6,v:()=>D.guardBody(),e:sstep}],
    arm:[{t:0,v:{...D.curArm}},{t:Math.max(.05,Tc-.05),v:cut,e:eOut},{t:Tc+.16,v:{hand:{sh:[.24*a,.22*a]},wAng:-.9,off,tilt:0},e:eOut},{t:Tc+.6,v:()=>D.guardArm(),e:sstep}]};
  return P;};}
{const dg=doGrab;doGrab=function(A,D,gr,fa){if(!gr||!gr.toll)return dg.apply(this,arguments);
  const ex=S.game.ex;if(A.dead||D.dead){S.hooks.status();return;}
  const dmg=shortCutHand(A,D,gr.seed||0,fa);A.motor=Math.min(A.motor,.7);
  popup(D,'Wrist toll','#ffc163',`${A.name} −${SHORT_HAND.toll.pips} balance`,20,-40);
  S.hooks.grab(ex,{ok:false,toll:true,dmg});
  if(ex&&!A.downed)considerOpening(ex,D,A,freshBreak(A)?'broken':'brace');
  S.hooks.short('toll',{A,D,kind:'grab',res:gr,ok:true,dmg});S.hooks.status();};}
// a grab at a hero the player controls, who answers it: the turn is held (the exchange begun, the hand coming up) and nothing else
// happens until he has answered; then the command goes in as it always does, through every command wrapper under this one, with his
// answer already decided (its tempo, its roll, its log and its motion all come then)
function shortHoldGrab(i,A,D,opts){const g=S.game;
  g.phase='exchange';g.aiAt=null;const ex={A,D,t0:S.t,cmd:'grab',perf:{},depth:0,tollPending:true,dur:99};g.ex=ex;
  if(!A.downed&&!A.clinch)faceToward(A,D.station);
  // he reaches: the free hand comes up for the collar
  const a=A.arm,T1=.3;A.action={t0:S.t,end:T1,body:[{t:0,v:{...A.curBody}},{t:T1,v:()=>({...A.guardBody(),lean:A.guardBody().lean+.1}),e:eOut}],
    arm:[{t:0,v:{...A.curArm}},{t:T1,v:{hand:{sh:[-.04*a,-.1*a]},wAng:-1.5,off:{sh:[.55*a,.05*a]},tilt:.05},e:eOut}]};
  const dur=reactDur(D);S.opening={f:D,opp:A,ex,depth:0,kind:'toll',source:'toll',attack:'grab',dur,left:dur,aiDelay:.35,cmdIdx:i,cmdOpts:opts||null};
  S.hooks.opening(S.opening);S.hooks.status();return true;}
function shortResolveToll(choice){const o=S.opening,ex=o.ex,D=o.f,A=o.opp,g=S.game;
  if(choice!=='toll'&&choice!=='let')choice=aiOpening(o);
  if(choice==='toll'&&!openValid(o,'toll'))choice='let';
  S.opening=null;S.hooks.opening(null,choice);ex.tollPending=false;
  if(choice==='toll'){D.ready+=REACT.cost;D.lastReact='toll';if(S.hooks.react)S.hooks.react(D,A,'toll');}
  // the grab goes in now
  g.phase='input';g.active=o.cmdIdx;g.aiAt=null;g.ex=null;
  const prev=SH.toll;SH.toll={A,D,use:choice==='toll'};let r=false;
  try{r=SH.cmd(o.cmdIdx,'grab',{...(o.cmdOpts||{}),shortHeld:true});}finally{SH.toll=prev;}
  // (no longer possible: the turn ends with nothing done)
  if(!r){g.phase='exchange';g.ex=ex;ex.t0=S.t;ex.dur=.2;S.hooks.status();}}
// the window is an opening of its own kind (sk_react.js's pattern)
{const oc=openingChoices;openingChoices=function(o){return o&&o.source==='toll'?['toll','let']:oc(o);};}
{const ov=openValid;openValid=function(o,k){return o&&o.source==='toll'?(k==='toll'?canToll(o.opp,o.f):k==='let'):ov(o,k);};}
{const oc=openCost;openCost=function(f,k,o){const oo=o===undefined?S.opening:o;if(oo&&oo.source==='toll')return k==='toll'?REACT.cost:0;return oc(f,k,o);};}
{const ao=aiOpening;aiOpening=function(o){return o&&o.source==='toll'?(canToll(o.opp,o.f)&&aiToll(o.f,o.opp)?'toll':'let'):ao(o);};}

// ---------- his own actions ----------
// A command or an opening of his is his next action: the Hinge's inside goes with it (an attack on that man, held for the man's
// answer, keeps it until it lands). A shove that is a blind-side check goes in as one; a grab at a man who answers it waits for him.
function shortKeepInside(A,ins){const ex=S.game.ex;return!!(ex&&ex.A===A&&ex.reactPending&&ex.pendReact&&ex.pendReact.D&&ex.pendReact.D.idx===ins.on);}
{const cm=command;SH.cmd=cm;command=function(i,cmd,opts){
  if(!shortAny())return cm.apply(this,arguments);
  const A=S.F[i];if(!A)return cm.apply(this,arguments);
  if(cmd==='grab'&&!(opts&&opts.shortHeld)){const g=S.game;if(g.phase==='input'&&g.active===i&&!S.opening){const D=targetOf(A);
    if(D&&canToll(A,D)&&!isAI(D.idx)&&cmdValid(A,D,'grab'))return shortHoldGrab(i,A,D,opts);}}
  let blind=null;if(cmd==='shove'){const D=targetOf(A),v=D?shoveVariant(A,D):null;if(v&&v.kind==='blindcheck')blind={A,D,floor:v.floor};}
  const ins=A.inside,prev=SH.blind;if(blind)SH.blind=blind;let r;
  try{r=cm.apply(this,arguments);}finally{SH.blind=prev;}
  if(r){const ex=S.game.ex;if(blind&&ex&&ex.A===A&&ex.res&&ex.res.blind)S.callouts.push({i:A.idx,text:'Blind-side check',age:0,life:1,dx:-A.facing*18});
    if(ins&&A.inside===ins&&!shortKeepInside(A,ins))A.inside=null;}
  return r;};}
{const ro=resolveOpening;resolveOpening=function(choice){const o=S.opening;
  if(o&&o.source==='toll')return shortResolveToll(choice);
  if(!o||o.source==='react'||!shortAny())return ro.apply(this,arguments);
  const A=o.f,ins=A.inside;let blind=null;
  if(choice==='shove'&&o.source!=='turn'&&o.opp){const v=shoveVariant(A,o.opp,true);if(v&&v.kind==='blindcheck')blind={A,D:o.opp,floor:v.floor};}
  const prev=SH.blind;if(blind)SH.blind=blind;let r;
  try{r=ro.apply(this,arguments);}finally{SH.blind=prev;}
  const ex=S.game.ex;if(blind&&ex&&ex.A===A&&ex.res&&ex.res.blind)S.callouts.push({i:A.idx,text:'Blind-side check',age:0,life:1,dx:-A.facing*18});
  if(ins&&A.inside===ins&&choice!=='hold'&&!shortKeepInside(A,ins))A.inside=null;
  return r;};}

// ---------- the AI ----------
// what a Short Hand fighter reaches for when it pays: the Short ladder from inside (inside a man's reach he stabs rather than cuts),
// the hook with a barrel or a crate behind him or a man unsteady, the check on a man who is not set (the answers are in shortAiReact
// and aiToll)
{const mw=moveWeights;moveWeights=function(A,D,w,sT,ok){mw(A,D,w,sT,ok);
  if(!A||!D||D.downed||!shortOn(A))return;
  if(shortKnows(A,'ladder')&&shortInside(A,D)){w.thrust+=6;w.slash*=.5;}
  if(shortKnows(A,'hook')&&(!ok||ok('sweep'))&&!D.wasDown&&S.t>=D.knockUntil){if(shortHookProp(A,D))w.sweep+=4;else if(D.posture==='committed')w.sweep+=1.5;}
  if(shortKnows(A,'check')&&ok&&ok('shove')&&A.foot>=2){const v=shoveVariant(A,D);
    if(v&&v.kind==='blindcheck'&&shoveChance(A,D,false)>=.45)w.shove=Math.max(w.shove||0,v.floor?5:2.5);}};}

// a new fight: nobody is inside anybody's reach, and no knife is held at anyone's throat
V11.duelStart.push(()=>{for(const f of S.F)if(f&&(f.inside||f._threat||f.frozen)){f.inside=null;f._threat=null;f.frozen=false;}});
// ===== SHORT HAND END =====
