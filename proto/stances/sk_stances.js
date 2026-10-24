// ===== STANCES (test) START =====
// The second rule under test: Ilyas picks the family of his arc-blade's moves, and the engine still picks the move. Three stances:
//   Bound    the blade locked at its full length: the crescents, and two men in one stroke (the crowd strokes reach further). A man
//            with a short blade runs onto his point as he closes (the stop-hit the longer weapon has today), strikes at -2 instead
//            of the +2 a short blade has inside a long one's reach, and a grab on him is at -2. Against a longer weapon he has to
//            walk onto the point. No lash.
//   Unbound  the segments loose on their thread: every blow is a lash from where he stands, from just outside his reach to well past
//            it (no run in, no stop-hit on him, and a lash parried out there opens no riposte: the man is too far off): the Unbound
//            lash, the Falling lash, the Lash dart and the Lash snare. A spear's Parry and Counter hold nothing against a lash (a
//            shaft cannot turn a chain). A man who closes on him through the chain's reach runs onto
//            it: a stop-lash, as a spear's stop-hit. Inside his reach the blade relocks for the blow, at -2. A chain is no guard: his
//            Parry is at -1 and his Counter at -2 until he changes it.
//   Close    the blade choked short: the hilt-ring and the spine, a hook from inside, and his free hand at the collar (grab +2). He
//            stays in a man's chest after a blow. An axe that strikes him meets him inside its head: the blow comes on the haft, at -2
//            and lighter. Tied up inside one man, he is at -1 DEF to everyone else.
// Each answers one kind of enemy: Close the brute's axe, Unbound the keeper's spear, Bound the rusher's dagger and a crowd. Switching
// is free on his own turn, before he acts; it shows in his guard (and in the blade, drawn by the test's UI). STANCE.on false is today's
// arc-blade, where the engine picks from every family.
const STANCE={on:true,policy:'match'};
const STANCES={
  bound:{name:'Bound',short:'Locked blade',good:'Crowds, daggers',line:'The blade locked at full length: crescents, and two men in one stroke.'},
  unbound:{name:'Unbound',short:'The lash',good:'Spears, reach',line:'The segments loose on the thread: lash, dart and snare from past his reach.'},
  close:{name:'Close',short:'Inside',good:'Axes, one on one',line:'The blade choked short: hilt, spine and the grip, inside the reach.'}};
const STANCE_ORDER=['bound','unbound','close'];
// unboundMin/Max: the lash's reach, past his striking distance; relock: a blow inside it; parry/counter: a chain is no guard; tied: Close
// against everyone but his man; grab/grabDef: Close's grip, Bound's point; closeGap: how close Close stays after a blow; cleave/whirl:
// how much further Bound's two-man strokes reach; daze: the hilt-ring hammer dazes on a hit
const STN={unboundMin:-12,unboundMax:LASH.reach+60,relock:-2,parry:-1,counter:-2,tied:-1,grab:2,grabDef:2,point:-2,closeGap:14,cleaveX:84,cleaveZ:58,whirlR:30};
function stanceOn(f){return STANCE.on&&!!f&&f===hero()&&f.weaponKey==='elven'&&!f.wp.improv&&!(typeof drained==='function'&&drained(f));}
function stanceOf(f){return stanceOn(f)?(f.stance||'bound'):null;}
V11.duelStart.push(()=>{const K=hero();if(K){K.stance='bound';K.stanceT=-9;}});
// his own turn, before he acts: the only time it changes
function stanceCanSwitch(K){const g=S.game;return!!K&&stanceOn(K)&&!!g&&g.phase==='input'&&g.active===K.idx&&!S.opening&&!K.downed&&!K.clinch&&!K.dead;}
function setStance(K,s){if(!STANCES[s]||!stanceCanSwitch(K)||stanceOf(K)===s)return false;const was=stanceOf(K);K.stance=s;K.stanceT=S.t;
  if(was==='unbound')K.relockT=S.t;if(S.hooks.stance)S.hooks.stance(K,s,was);S.hooks.status();return true;}

// ---------- the moves each stance gives ----------
// while the hero's technique is picked under a stance, the moment's context is bent: Bound never counts as clinch range, Close always does
let STN_CTX=null;
{const tc=techContext;techContext=function(A,D){const c=tc.apply(this,arguments);
  if(STN_CTX&&A===hero()&&STN_CTX.clinch!=null)c.clinch=STN_CTX.clinch;
  // a heavy weapon (the axe) striking him while he is in Close meets him inside its head
  else if(D&&D===hero()&&stanceOf(D)==='close'&&A&&A.team!==D.team&&stanceHeavy(A)&&c.gap-engageGap(A,D)<=140)c.clinch=true;
  return c;};}
// the lash is Unbound's, and only Unbound's, and it reaches from just outside his striking distance
{const lr=lashReady;lashReady=function(A,D){const s=stanceOf(A);if(!s)return lr.apply(this,arguments);if(s!=='unbound')return false;
  if(!D||D.dead||D.downed||A.clinch||A.downed||D.clinch)return false;const g=lashGap(A,D);if(g<STN.unboundMin||g>STN.unboundMax)return false;
  return!tableBetween(A,D)&&!(S.divs.length&&divBetween(A,D));};}
// a lash built fresh (none of the moment's other moves carry over into it)
function stnLash(A,kind,o){return Object.assign({kind,key:'lash',name:'',why:'',tags:['Unbound',A.wp.name,SKILLS[A.skill-1]],acc:0,dmg:1,along:null,ang:null,amp:1,overlap:0,reach:null,anchor:null,
  kick:false,vault:false,around:null,rising:false,descend:false,windCap:null,passing:false,flair:null,multi:null,knock:1,kdEase:0,lash:true,move:true},o);}
const STN_SIGNED=n=>(n<0?'\u2212':'+')+Math.abs(n);
const STN_WHY={
  lash:'From where he stands the segments shoot out on their thread and the blade cuts at the end of it: no run in and no stop-hit.',
  fall:'The chain goes up and comes down over his guard: it breaks a Parry, and a man off balance goes down under it.',
  dart:'The point darts out on the thread straight at him.',
  hook:'From inside his reach the curve of the blade hooks behind his ankle and pulls: a Committed man goes down on a clean hit.',
  hammer:'Too close to cut, so the hilt-ring comes down on his face.'};
{const pt=pickTechnique;pickTechnique=function(A,D,kind){
  const s=stanceOf(A);if(!s||!D||D.downed||A.clinch||A.blinkBonus)return pt.apply(this,arguments);
  if(s==='bound'){STN_CTX={clinch:false};let T;try{T=pt.apply(this,arguments);}finally{STN_CTX=null;}return{...T,stance:'bound'};}
  if(s==='close'){STN_CTX={clinch:true};let T;try{T=pt.apply(this,arguments);}finally{STN_CTX=null;}T={...T,stance:'close',tags:T.tags.filter(t=>t!=='Clinch range').concat('Close')};
    if(kind==='sweep'&&!T.haftCut)T={...T,key:'insidehook',name:'Inside hook',anchor:'shin',along:A.wp.len*.5,amp:.7,acc:1,kdEase:2,why:STN_WHY.hook,stanceWhy:STN_WHY.hook};
    if(kind==='overhead'&&T.key==='pommel')T={...T,stanceWhy:STN_WHY.hammer,why:STN_WHY.hammer};
    return T;}
  // Unbound: a lash, or inside his reach the blade relocks for the blow
  const ready=lashReady(A,D)&&obstacleBehind(A)>=38;
  if(!ready){STN_CTX={clinch:false};let T;try{T=pt.apply(this,arguments);}finally{STN_CTX=null;}
    return{...T,stance:'unbound',relock:true,acc:(T.acc||0)+STN.relock,name:'Relocked '+lowFirst(T.name),tags:[...T.tags,'Relocking'],
      why:'Too close for the lash: the segments lock again for the blow, and it comes late. '+T.why,stanceWhy:'Too close for the lash: the blade relocks for the blow, at '+STN_SIGNED(STN.relock)+'.'};}
  let T;
  if(kind==='slash')T=stnLash(A,kind,{key:'lash',name:'Unbound lash',acc:LASH.acc,dmg:1,knock:LASH.knock,why:STN_WHY.lash,stanceWhy:STN_WHY.lash});
  else if(kind==='overhead')T=stnLash(A,kind,{key:'lashfall',name:'Falling lash',acc:-1,dmg:.9,knock:.5,why:STN_WHY.fall,stanceWhy:STN_WHY.fall});
  else if(kind==='thrust')T=stnLash(A,kind,{key:'lashdart',name:'Lash dart',acc:-1,dmg:.8,knock:.4,anchor:'chest',why:STN_WHY.dart,stanceWhy:STN_WHY.dart});
  else T=pt.apply(this,arguments);
  return{...T,stance:'unbound'};};}
// the chain is Unbound's own way to fight, not a trick: its lash spends no extra pip of balance (a heavy blow still spends its own)
{const fd=footDelta;footDelta=function(A,cmd,T){if(T&&T.lash&&T.stance==='unbound'&&A===hero())return-(FOOT_COST[cmd]||0);return fd.apply(this,arguments);};}
// Unbound strikes from where he stands: nothing to close, no stop-hit on the way in
{const ac=approachCost;approachCost=function(A,D,cmd){if(stanceOf(A)==='unbound'&&ATTACKS.includes(cmd)&&D&&!D.downed&&lashReady(A,D))return 0;return ac.apply(this,arguments);};}
{const sh=stopHitFor;stopHitFor=function(A,D,cmd,dest){
  if(A&&stanceOf(A)==='unbound'&&ATTACKS.includes(cmd)&&lashReady(A,D))return false;
  // Unbound: a man closing on him through the chain's reach runs onto it (the line it holds is just outside his striking distance)
  if(D&&stanceOf(D)==='unbound'){if(!A||A.team===D.team||D.dead||D.downed||D.clinch||A.clinch||A.downed||D.foot<1||stuckIn(D))return false;
    if(!(ATTACKS.includes(cmd)||cmd==='shove'||cmd==='advance'))return false;if(facingAway(D,A)||tableBetween(A,D)||(S.divs.length&&divBetween(A,D)))return false;
    const gap=Math.abs(A.station-D.station),r=stopRange(D,A);if(gap<=r+6)return false;const end=dest!=null?Math.abs(dest-D.station):engageGap(A,D);return end<r-6;}
  // Close holds the blade short: no point to run onto
  if(D&&stanceOf(D)==='close')return false;
  return sh.apply(this,arguments);};}
{const sr=stopRange;stopRange=function(D,A){if(D&&A&&stanceOf(D)==='unbound'&&A.team!==D.team)return engageGap(D,A)+APPROACH_FREE+16;return sr.apply(this,arguments);};}
// a lash parried or dodged out past the man's reach opens nothing for him: he is too far off to answer it
{const co=considerOpening;considerOpening=function(ex,f,opp,src){
  if(opp&&opp===hero()&&ex&&ex.A===opp&&ex.res&&ex.res.tech&&ex.res.tech.lash&&stanceOf(opp)==='unbound'&&['parry','block','counter','dodge','dodgeOver'].includes(src)&&
    Math.abs(f.station-opp.station)-engageGap(f,opp)>APPROACH_FREE)return;
  return co.apply(this,arguments);};}
// where he settles after a blow: Close stays in the man's chest, Unbound keeps its distance
{const ss=settleStation;settleStation=function(A,D,sx){const s=stanceOf(A);if(!s||s==='bound'||!D||D.dead)return ss.apply(this,arguments);
  if(s==='unbound')return clampSt(A,sx);
  const fa=Math.sign(D.station-A.station)||A.facing,cg=clinchGap(A,D),tgt=D.station-fa*(cg+STN.closeGap),a=sx-fa*45,b=sx+fa*10;
  let x=clamp(tgt,Math.min(a,b),Math.max(a,b));const lim=D.station-fa*(cg-2);if((x-lim)*fa>0)x=lim;return clampSt(A,x);};}
// Bound's two-man strokes reach further
{const wp=whirlPartner;whirlPartner=function(A,D){if(stanceOf(A)!=='bound')return wp.apply(this,arguments);
  if(A.skill<RANK.expert||Math.abs(D.station-A.station)-engageGap(A,D)>48+STN.whirlR)return null;
  const fa=Math.sign(D.station-A.station)||A.facing,reach=estReach(A,'slash')+26+STN.whirlR;let best=null,bd=1e9;
  for(const o of rivals(A)){if(o===D)continue;const dx=(o.station-A.station)*fa;if(dx>-24)continue;
    const dz=Math.abs(o.lane-A.lane),d=Math.hypot(dx,dz*.8);if(dz<=56&&d<=reach&&d<bd){bd=d;best=o;}}
  return best;};}
{const cp=cleavePartner;cleavePartner=function(A,D){if(stanceOf(A)!=='bound')return cp.apply(this,arguments);
  if(A.skill<RANK.veteran)return null;const fa=Math.sign(D.station-A.station)||A.facing;let best=null,bd=1e9;
  for(const o of rivals(A)){if(o===D)continue;if((o.station-A.station)*fa<24)continue;
    const sx=Math.abs(o.station-D.station),dz=Math.abs(o.lane-D.lane);
    if(sx<=STN.cleaveX&&dz<=STN.cleaveZ&&Math.abs(o.lane-A.lane)<=62){const d=sx+dz*.6;if(d<bd){bd=d;best=o;}}}
  return best;};}

// ---------- what each stance does to the dice ----------
{const cm=computeMods;computeMods=function(A,D,kind,opening,T){const c=cm.apply(this,arguments);const s=stanceOf(D);
  if(s==='unbound'&&!D.downed){const pen=(D.guarding?STN.parry:0)+(D.counter?STN.counter:0);if(pen){c.def+=pen;c.defMods.push(['unbound blade',pen]);}}
  if(s==='close'&&!D.downed&&A&&A.team!==D.team){const t=S.F[getTgt(D)];if(t&&t!==A&&!t.dead){c.def+=STN.tied;c.defMods.push(['tied up inside',STN.tied]);}}
  // Bound keeps a short blade at the point: instead of the +2 a shorter weapon has inside a long one's reach, he has to get past it
  if(s==='bound'&&!D.downed&&A&&A.team!==D.team){const m=c.mods.find(x=>x[0]==='inside the reach'&&x[1]>0);if(m){c.bonus-=m[1]-STN.point;m[1]=0;c.mods.push(['kept at the point',STN.point]);}}
  // a spear's shaft cannot turn a chain: against Unbound's lash his Parry and his Counter hold nothing
  if(A&&stanceOf(A)==='unbound'&&T&&T.lash&&T.stance==='unbound'&&D&&D.weaponKey==='spear'&&!D.downed){
    const pm=c.defMods.find(x=>x[0]==='parry'&&x[1]>0),cm2=c.defMods.find(x=>x[0]==='counter'&&x[1]>0);
    for(const m of [pm,cm2])if(m){c.def-=m[1];m[1]=0;}if(pm||cm2)c.defMods.push(['a shaft cannot turn a chain',0]);}
  return c;};}
{const gm=grabMods;grabMods=function(A,D,opening){const c=gm.apply(this,arguments);
  if(stanceOf(A)==='close'){c.mods.push(['close stance',STN.grab]);c.bonus+=STN.grab;}
  if(stanceOf(D)==='bound'){c.defMods.push(['the blade keeps him off',STN.grabDef]);c.dc+=STN.grabDef;}
  return c;};}

// ---------- the guard shows it ----------
const STANCE_GUARD={unbound:{hx:.6,hy:.52,w:.62,gw:0,off:[.14,.5],crouch:.9,lean:.02,sf:.25,sb:-.33},
  close:{hx:.3,hy:.2,w:-.18,gw:-.2,off:[.4,.12],crouch:.82,lean:.15,sf:.32,sb:-.27}};
{const tg=tacGuard;tacGuard=function(f){const s=stanceOf(f);if(s&&s!=='bound'&&!f.clinch&&!f.mount&&!f.downed&&!f.carry)return STANCE_GUARD[s];return tg.apply(this,arguments);};}

// ---------- the enemies ----------
// a man lashed at from out of his reach closes in instead of waiting for him (a keeper holds his reach, as he always does)
{const ac=aiChoice;aiChoice=function(i){const A=S.F[i];
  if(STANCE.on&&A&&A.team===1&&!A.downed&&!A.clinch&&!A.npc&&!A.walkIn&&A.temper!=='keeper'){const K=hero(),D=targetOf(A);
    if(D===K&&stanceOf(K)==='unbound'&&!K.downed&&cmdValid(A,D,'advance')){const g=Math.abs(A.station-D.station)-engageGap(A,D),p=A.temper==='rusher'?.7:A.temper==='brute'?.5:.45;
      if(g>APPROACH_FREE&&S.rng()<p)return'advance';
      const c=ac.apply(this,arguments);return c==='wait'&&g>0?'advance':c;}}
  // Ilyas on auto picks his stance at the start of his choice, and in Unbound uses what the chain is for
  if(A&&A===hero()&&stanceOn(A)&&isAI(i)&&stanceCanSwitch(A)){const s=stanceAuto(A);if(s)setStance(A,s);
    const D=targetOf(A);if(stanceOf(A)==='unbound'&&D&&!D.downed&&!D.dead&&lashReady(A,D)){const ok=c=>cmdValid(A,D,c),r=S.rng();
      if(D.posture==='off'&&ok('overhead')&&A.foot>=4)return'overhead';
      if(D.posture==='committed'&&ok('sweep')&&r<.5)return'sweep';
      if(ok('thrust')&&r<.35)return'thrust';}}
  return ac.apply(this,arguments);};}
// which stance answers the man he faces (STANCE.policy: 'match'; the test's checks also try one stance only, and the worst match)
// a heavy weapon: the axe (an improvised one, the table leg or the bare shaft, does not count)
function stanceHeavy(A){return!!A&&!!A.wp&&A.wp.fam==='heavy'&&A.wp.len>=60&&!A.wp.improv&&!A.wp.unarmed;}
function stanceMatch(K,D){if(!D||D.downed||D.dead)return null;
  const near=foes().filter(o=>o!==D&&upright(o)&&!o.walkIn&&Math.abs(o.station-K.station)-engageGap(K,o)<90).length;
  if(D.weaponKey==='spear')return near?'bound':Math.abs(D.station-K.station)-engageGap(K,D)<STN.unboundMin?'close':'unbound';
  if(stanceHeavy(D))return near>1?'bound':'close';
  return'bound';}
function stanceAuto(K){const p=STANCE.policy,D=targetOf(K);if(p==='bound'||p==='unbound'||p==='close')return p;const m=stanceMatch(K,D);if(!m)return null;
  if(p==='worst')return m==='close'?'unbound':m==='unbound'?'close':'unbound';return m;}
// why a stance answers this man, in a few words (the test's UI marks it)
function stanceWord(D){const k=D.weaponKey;return k==='axe'?'axe':k==='spear'?'spear':D.wp.short.toLowerCase();}
function stanceReason(K,D,s){if(!D||D.downed)return'';const w=stanceWord(D);
  if(s==='close'&&(stanceHeavy(D)||D.weaponKey==='spear'))return`inside the ${w}`;
  if(s==='unbound'&&D.weaponKey==='spear')return`past the ${w}`;
  if(s==='bound'&&foes().filter(o=>o!==D&&upright(o)&&Math.abs(o.station-K.station)-engageGap(K,o)<90).length)return'two in reach';
  if(s==='bound'&&outreaches(K,D))return`the ${w} runs on`;
  return'';}
// ===== STANCES (test) END =====
