// ===== REACT START =====
// Reactions: every blow (a Slash, Overhead, Thrust or Sweep, whatever technique it comes as) aimed at a standing fighter gets an
// answer, picked as it comes. A hero the player controls gets the choice himself: the blow is held, time slows and the window shows
// what is coming; an enemy, or a hero on auto, answers at once by his own read of it. The answers:
//   Parry      the guard, for this one blow: +4 against a Slash or Thrust, +2 against an Overhead (which breaks it), +1 against a
//              Sweep. A parried blow costs the attacker two pips of balance and opens a riposte.
//   Counter    meet it with a cut: +3 against an Overhead, -1 against a Thrust; a blow that still lands lands 25% harder. A
//              countered blow costs the attacker two pips and opens a counter.
//   Slip       out of the line: +4 against a Thrust, +2 against an Overhead, +1 Slash, -1 Sweep (REACT_DEF in sk_core.js).
//   Step back  out of reach: +4 against a Sweep, +2 Slash, +1 Thrust and Overhead; a miss steadies you by a pip.
//   Turn him   with one of his own behind or beside him: +2 against a Slash or Thrust, +1 Overhead, -1 Sweep; a blow turned aside
//              sends him into his partner (a free shove that cannot fail; a blow that misses him entirely puts them both down).
// Each costs a little of the next turn (REACT.cost tempo). A fighter down, held in a clinch or Broken has no answer.
const REACT={cost:5,turnCost:12,durMin:2.2,durMax:3.4,order:['parry','counter','slip','back','turn']};
// what each answer is good against (its button says so)
const REACT_GOOD={parry:['slash','thrust'],counter:['overhead'],slip:['thrust'],back:['sweep'],turn:[]};
// whoever of his own stands nearest behind or beside the man swinging at D, on the far side of him from D (100 units on, 50 of depth)
function turnPartner(D,A){if(!A||!D)return null;const fa=Math.sign(A.station-D.station)||-A.facing;let best=null,bd=1e9;
  for(const o of S.F){if(o===A||o===D||o.team!==A.team||o.npc||o.clinch||!upright(o))continue;
    const dx=(o.station-A.station)*fa,dz=Math.abs(o.lane-A.lane);if(dx>=0&&dx<=100&&dz<=50&&dx+dz<bd){bd=dx+dz;best=o;}}
  return best;}
// the shove a turned blow becomes: it cannot fail, and a blow that missed him entirely carries them both down
function turnShove(o){const out=o.ex&&o.ex.res?o.ex.res.out:'block';
  return{kind:'shove',roll:20,mods:[],defMods:[],bonus:0,total:20,dc:0,ok:true,crush:out==='dodge',turn:true,seed:(S.rng()*1e9)|0};}
function reactChoices(D,A){return['parry','counter','slip','back',...(!D.mount&&!A.mount&&turnPartner(D,A)?['turn']:[])];}
// can this blow be answered at all, and by whom
function canReact(A,D,kind){
  return!!(A&&D&&ATTACKS.includes(kind)&&A.team!==D.team&&!D.dead&&!D.downed&&!D.clinch&&!D.broken&&!D.npc&&!D.hidden&&
    !S.warming&&!S.cut&&S.game&&S.game.phase==='exchange');}
// the answer's flags, for this one blow (cleared where the blow lands)
function withReact(D,k,fn){const g=D.guarding,c=D.counter,r=D.react;try{D.guarding=k==='parry';D.counter=k==='counter';D.react=k;return fn();}finally{D.guarding=g;D.counter=c;D.react=r;}}
// the chance the blow lands with this answer (a natural 20 always does)
function reactLands(A,D,kind,opening,T,k){return withReact(D,k,()=>{const c=computeMods(A,D,kind,opening,T);let n=0;for(let r=2;r<=20;r++)if(r===20||r+c.bonus>=c.def)n++;return n/20;});}
function applyReaction(D,k,A){
  D.guarding=k==='parry';D.circleGuard=false;D.counter=k==='counter';D.react=k;D.lastReact=k;D.ready+=k==='turn'?REACT.turnCost:REACT.cost;
  if(S.hooks.react)S.hooks.react(D,A,k);}
// An answer by a fighter's own read: the right one more often the better he is, the worse the man swinging, and the slower the blow
// (a Thrust is the hardest to read, an Overhead the easiest); a man who bit on a feint reads worse; a wrong read leans to his temper's habit
function aiReact(D,A,kind,T,opening){
  const r=S.rng,ch=reactChoices(D,A),pay={parry:.3,counter:.25,slip:.2,back:.1,turn:.4};
  // (the best answer weighs what it pays as well as the chance it still lands: a Turn is worth a few points of risk)
  let best=ch[0],bv=99;for(const k of ch){const v=reactLands(A,D,kind,opening,T,k)-pay[k]*.15;if(v<bv){bv=v;best=k;}}
  const read=clamp(.25+.14*(D.skill||0)-.05*(A.skill||0)+(kind==='thrust'?-.1:kind==='overhead'?.1:0)-(D.daze?.15:0)-(feintBonus(A,D)>0?.3:0),.1,.92);
  if(r()<read)return best;
  const others=ch.filter(k=>k!==best&&k!=='turn'),habit=D.temper==='keeper'?'back':D.temper==='brute'?'counter':D.temper==='rusher'?'slip':null;
  if(habit&&others.includes(habit)&&r()<.5)return habit;
  return others.length?others[Math.floor(r()*others.length)]:best;}
// how long the window stays open, in the player's own seconds
function reactDur(D){return lerp(REACT.durMin,REACT.durMax,D.sk||0);}
// the attacker draws back for the blow while time slows (.3 s of game time, about as long as the window in the player's own):
// the window shows it coming
function tellPose(A,kind,T){
  const arm=A.arm,wb=windupBase(T,kind,arm,T&&T.amp||1,kind==='thrust'?-.15:.2),off=A.wp.off?'grip':{sh:[.1*arm,.3*arm]};
  // (a rider keeps his seat: only the arm draws back)
  const T1=.3,body=A.mount?[{t:0,v:{...A.curBody}},{t:T1,v:()=>A.guardBody()}]:[{t:0,v:{...A.curBody}},{t:T1,v:()=>({...A.guardBody(),crouch:A.guardBody().crouch-.04,lean:A.guardBody().lean+.06}),e:eOut}];
  A.action={t0:S.t,end:T1,body,arm:[{t:0,v:{...A.curArm}},{t:T1,v:{hand:wb.hand,wAng:wb.ang,off,tilt:0},e:eOut}]};}
// The blow is held for the answer: an enemy (or a hero on auto) answers at once; a hero the player controls gets the window
{const la=launchAttack;launchAttack=function(A,D,kind,ex,opening,popts){
  if(!ex||ex.reacted||!canReact(A,D,kind))return la.apply(this,arguments);
  ex.reacted=true;const T=pickTechnique(A,D,kind);
  if(isAI(D.idx)){applyReaction(D,aiReact(D,A,kind,T,opening),A);return la.apply(this,arguments);}
  ex.pendReact={A,D,kind,opening,popts};ex.reactPending=true;ex.dur=99;
  faceToward(A,D.station);tellPose(A,kind,T);
  const dur=reactDur(D);
  S.opening={f:D,opp:A,ex,depth:ex.depth||0,kind:'react',source:'react',attack:kind,tech:T,dur,left:dur,aiDelay:.35};
  S.hooks.opening(S.opening);};}
// the answer is in: the blow goes on from here
function resolveReact(choice){
  const o=S.opening,ex=o.ex,P=ex.pendReact,D=o.f,A=o.opp;
  // (the time ran out: his own read answers for him)
  if(!reactChoices(D,A).includes(choice))choice=aiReact(D,A,o.attack,o.tech,P.opening);
  S.opening=null;S.hooks.opening(null,choice);
  ex.reactPending=false;ex.pendReact=null;ex.t0=S.t;
  if(A.dead||D.dead||A.downed||D.downed){ex.dur=.2;S.hooks.status();return;}
  applyReaction(D,choice,A);
  launchAttack(P.A,P.D,P.kind,ex,P.opening,{...(P.popts||{}),snap:true});
  S.hooks.log({type:'attack',A:P.A,D:ex.D,res:ex.res,ex});S.hooks.status();
  if(typeof afterLaunch==='function')afterLaunch(ex);}
// the window is an opening of its own kind: its choices, their cost, the AI's pick and its resolution
{const oc=openingChoices;openingChoices=function(o){return o&&o.source==='react'?reactChoices(o.f,o.opp):oc(o);};}
{const ov=openValid;openValid=function(o,k){return o&&o.source==='react'?reactChoices(o.f,o.opp).includes(k):ov(o,k);};}
{const oc=openCost;openCost=function(f,k,o){const oo=o===undefined?S.opening:o;
  if(oo&&oo.source==='react')return k==='turn'?REACT.turnCost:REACT.cost;if(oo&&oo.source==='turn')return 0;return oc(f,k,o);};}
{const ao=aiOpening;aiOpening=function(o){return o&&o.source==='react'?aiReact(o.f,o.opp,o.attack,o.tech,o.ex&&o.ex.pendReact&&o.ex.pendReact.opening):ao(o);};}
{const ro=resolveOpening;resolveOpening=function(choice){const o=S.opening;if(o&&o.source==='react')return resolveReact(choice);return ro(choice);};}
// the guard slot is empty in a melee: there is no guard to take (in a gunfight it is cover, sk_guns.js)
{const sa=slotAction;slotAction=function(A,D,slot){const s=sa(A,D,slot);return s==='guard'&&!cmdValid(A,D,'guard')?null:s;};}
// an answer that was never used (the blow went elsewhere) does not carry over; cover from the guns and a man covering his partner
// keep their guard
V11.exchangeEnd.push(()=>{for(const f of S.F)if(f.react){f.react=null;if(!f.covering)f.guarding=false;f.counter=false;}});
// ===== REACT END =====
