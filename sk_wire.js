// ===== WIRE DRILL START =====
// (since V94) The Wire drill: Noon Company's drill on the Confederacy's border wire in the 2270s, the only Ranger cohort ever gilded.
// A line held across open sand to keep the wells: the blade out on the line between him and the man, the feet wide and low, every
// cut thrown whole from the shoulder and carried through, the finish held a beat before the blade comes back onto the line. It was
// drilled for a gilded body, so it needs the gilt (Act I's "Dark: needs the gilt"), and he has not fought in it since he walked out
// in A.V. 2290: he comes back to it an Expert (STYLES.wire.start).
//   The count   its meter, 0 to 3 (1 for a Novice, 2 Trained, 3 from Expert): a blow of his that lands or is met on a blade adds one
//               when it is not the kind of his last (the drill runs its cuts in turn: a cut, an overhead, a point, a low cut); the
//               same blow twice running, a blow that finds nothing, a blow that lands on him, a hold on him, a fall or a break ends
//               it. Each count is +1 to hit.
//   Thrown whole  his Slashes and Overheads land 1 harder, and every blow of his costs a tenth more tempo (the carry-through).
//   On the line  Step back +1 and Parry -1: the blade is out on the line, not in a guard, and he gives ground in a straight line.
//   Back on the line (Veteran)  a Step back that works adds a count.
//   The Long count (Expert, its signature)  at a full count, and 1 Aether, his next blow is a lunge the gilt carries across the sand:
//               no cost to close in, 2 harder when it lands and 2 more pips of balance knocked. The count empties.
//   The count runs on (Master)  after the Long count the count starts again at 1.
//   Mastered    Step back +1 in any style.
// Everything here is the hero's while he fights in it (styleIn(f,'wire'), sk_styles.js); a fighter in any other style, or none,
// passes straight through every wrapper below.
const WIRE={tempo:1.1,whole:1,back:1,parry:-1,long:{aether:1,dmg:2,pips:2},cap:[[1,1],[5,2],[13,3]],
  // in Unbound and Close the stance's own guard keeps its hands and its blade; the drill's feet and free hand go over it
  stanceGuard:{stance:1.35,crouch:-.07,lean:-.04,off:-.5,offUp:.28},ai:{again:.3}};
// how it moves (the style trial of Oct 25, Motion Styles Test): a bigger windup with the blade cocked further back, a fast strike, a
// long follow-through carried further, a slower return and a held guard after; the guard with the blade out level on the line and
// the hand well forward, the free hand back and raised behind him, the stance wide and low, the back straight; a low run in
ANIM_STYLE.wire={name:'Wire drill',full:3,
  moves:{amp:1.2,cock:1.25,wind:1.08,strike:.88,follow:1.35,reach:1.3,recover:1.2,tail:.7},
  guard:{hand:1.4,up:-.02,off:-.5,offUp:.3,crouch:-.1,lean:-.05,stance:1.5,w:.62},
  pose:{body:{run:{crouch:.8,lean:.26,sf:.36,sb:-.38},burst:{crouch:.74,lean:.38},stalk:{crouch:.8,lean:.2}}},
  attack:{
    // a long lunge at the impact, and the body drawn well back in the windup
    form:{slash:{lean:.3,crouch:.72,reach:.76,stance:[.6,-.5],wLean:-.18,wCrouch:.78},
      thrust:{lean:.38,crouch:.66,reach:1,stance:[.7,-.52],wLean:-.12,wCrouch:.78},
      overhead:{lean:.42,crouch:.72,stance:[.58,-.5],wLean:-.24,wCrouch:.78},
      sweep:{crouch:.56,stance:[.64,-.5],wCrouch:.66}},
    wStance:[.4,-.46],drawBack:16,drive:[18,20],carry:[30,14],fLean:.12,fCrouch:-.06,fStance:[.62,-.5],
    // the cut cocked back behind the shoulder, the point chambered at the hip, the overhead taken right back
    windup:{slash:{hand:[-.3,-.5],w:-2.75},thrust:{hand:[-.6,.24]},overhead:{hand:[-.16,-1.04],w:-3.05}},
    // and carried through
    follow:{slash:{hand:[.66,.44],turn:1.6},overhead:{hand:[.66,.78],turn:1.2},sweep:{hand:[.62,.6],turn:-.9}},
    // the free hand thrown back behind him for balance through the lunge
    off:{wind:[-.3,.3],impact:[-.45,.15],follow:[-.35,.3]},
    tilt:{wind:-.1,impact:.16,follow:.14}}};
const WIRE_KIND={slash:'cut',overhead:'overhead',thrust:'point',sweep:'low cut'};
function landedR(r){return!!r&&(r.out==='hit'||r.out==='crit')&&r.dmg>0;}
styleDef({key:'wire',name:'Wire drill',short:'Wire drill',weapon:'Arc-blade',weapons:['elven'],weaponNeed:'the arc-blade',hands:2,gilt:true,order:2,start:13,
  origin:"Noon Company, on the Confederacy's border wire, the 2270s",
  doctrine:'Hold the line. The wire does not go to the man; he comes to it.',
  what:'The blade out on the line, the feet wide and low, every cut thrown whole and carried through, the finish held a beat.',
  motion:'wire',signature:'long',
  meter:{key:'count',name:'Count',cap:WIRE.cap,what:'A blow that lands or is met on a blade adds one when it is a new kind: a cut, an overhead, a point, a low cut in turn. The same blow twice, a miss, a blow on him, a hold, a fall or a break ends it. Each count is +1 to hit.'},
  ranks:[{level:1,key:'line',name:'On the line',what:'The guard on the line, the wide low stance, the four blows thrown whole and carried through. A count of 1.'},
    {level:5,key:'drill',name:'The drill',what:'A count of 2.'},
    {level:9,key:'backline',name:'Back on the line',what:'A Step back that works adds a count.'},
    {level:13,key:'long',name:'The Long count',what:'A count of 3. At a full count and 1 Aether, the next blow is a lunge the gilt carries across the sand: no cost to close in, 2 harder, 2 more pips of balance.'},
    {level:17,key:'runon',name:'The count runs on',what:'After the Long count the count starts again at 1.'}],
  answers:{back:WIRE.back,parry:WIRE.parry},
  rules:[{id:'count',on:'attack',to:'hit',who:'A',when:x=>ATTACKS.includes(x.kind)&&meterN(x.A,'wire')>0,mod:x=>['the count',meterN(x.A,'wire')]},
    {id:'whole',on:'dmg',who:'A',label:'thrown whole',add:WIRE.whole,when:x=>(x.kind==='slash'||x.kind==='overhead')&&landedR(x.r)},
    {id:'tempo',on:'tempo',who:'f',label:'carried through',mul:WIRE.tempo,when:x=>ATTACKS.includes(x.cmd)},
    {id:'long',on:'dmg',who:'A',label:'the Long count',add:WIRE.long.dmg,when:x=>!!x.T&&!!x.T.longCount&&landedR(x.r)},
    {id:'long.approach',on:'approach',who:'A',label:'the Long count',set:0,when:x=>ATTACKS.includes(x.cmd)&&wireLongReady(x.A)}],
  mastery:{what:'Step back +1, in any style.',rules:[{id:'back',on:'attack',to:'def',who:'D',label:'the wire, mastered',v:WIRE.back,when:x=>!!x.D&&x.D.react==='back'&&ATTACKS.includes(x.kind)}]}});
function wireCount(f){return meterN(f,'wire');}
// the full count, the Long count known, and the Aether for it
function wireLongReady(f){if(!styleIn(f,'wire')||!styleKnows(f,'wire','long'))return false;const m=meterOf(f);return!!m&&m.n>=3&&m.n>=m.max&&(f.aether||0)>=WIRE.long.aether;}
if(!S.hooks.wire)S.hooks.wire=()=>{};

// ---------- the count ----------
// at each blow's impact (a follow-up from an opening is a blow of its own): a blow of his that lands or is met on a blade, one more
// when it is a new kind; the same kind twice running, or a blow that finds nothing, ends it. A Step back of his that works, once he
// has it: one more. The Long count's own blow only spends (as it is thrown, below), and the one that lands knocks two more pips.
// (the answer is read as the blow arrives: the impact clears it)
{const ap=applyImpact;applyImpact=function(ex,A,D,res,Cfn,cv,slip,fa,primary){const rx=D?D.react:null,r=ap.apply(this,arguments);
  if(!primary||!res||!ATTACKS.includes(res.kind)||(res.tech&&res.tech.threat)||res.out==='wall')return r;
  const long=!!(res.tech&&res.tech.longCount),met=res.out==='hit'||res.out==='crit'||res.out==='block';
  if(A&&styleIn(A,'wire')){const kind=res.kind,was=A._wireLast;A._wireLast=kind;
    if(!long){if(!met)meterClear(A,'the blow found nothing');else if(was===kind)meterClear(A,'the same blow twice');else meterAdd(A,1,'a new '+(WIRE_KIND[kind]||kind));}}
  if(D&&D!==A&&rx==='back'&&res.out==='dodge'&&!D.dead&&styleIn(D,'wire')&&styleKnows(D,'wire','backline'))meterAdd(D,1,'back on the line');
  if(long&&(res.out==='hit'||res.out==='crit')&&D&&!D.dead&&A&&A.team!==D.team)knockBalance(D,WIRE.long.pips,A);
  return r;};}
// a blow that lands on him, a hold on him, a fall or a break ends it
V11.step.push(()=>{for(const f of S.F){if(!f||!f.meter||f.meter.k!=='wire')continue;
  const hp=f._wireHp;f._wireHp=f.hp;if(hp!=null&&f.hp<hp){meterClear(f,'a blow landed on him');continue;}
  if(f.downed||f.clinch||f.broken)meterClear(f,f.downed?'down':f.clinch?'held':'broken');}});
V11.duelStart.push(()=>{for(const f of S.F)if(f){f._wireLast=null;f._wireHp=null;}});

// ---------- the Long count ----------
// at a full count his blow is the Long count (the stance's own move under it: a lash in Unbound is a Long count lash)
{const pt=pickTechnique;pickTechnique=function(A,D,kind){const T=pt.apply(this,arguments);
  if(!T||!ATTACKS.includes(kind)||!D||D.dead||T.threat||!wireLongReady(A))return T;
  return{...T,longCount:true,name:'Long count',why:'The full count: the gilt carries the lunge across the sand. No cost to close in, 2 harder, and 2 more pips of balance.',
    tags:['Wire drill','Full count',...(T.tags||[]).filter(t=>t!=='Long approach')]};};}
// spent as it is thrown: the Aether and the count (Master: the count runs on from 1)
{const ra=resolveAttack;resolveAttack=function(A,D,kind,opening,T){const spend=!!(T&&T.longCount&&!T._spent&&A);if(spend)T._spent=true;
  const r=ra.apply(this,arguments);
  if(spend){A.aether=Math.max(0,(A.aether||0)-WIRE.long.aether);A.flare=Math.max(A.flare||0,1.3);A.castT=S.t;
    meterClear(A,'the Long count');if(styleKnows(A,'wire','runon'))meterSet(A,1,'the count runs on');S.hooks.wire('long',{A,D,res:r});}
  return r;};}

// ---------- how it stands in Unbound and Close ----------
{const sg=styleGuard;styleGuard=function(f){const g=sg.apply(this,arguments);const s=typeof stanceOf==='function'?stanceOf(f):null;
  if(!s||s==='bound'||!g||f.clinch||f.mount||f.downed||f.carry||!styleIn(f,'wire'))return g;const k=WIRE.stanceGuard;
  return{...g,sf:g.sf*k.stance,sb:g.sb*k.stance,crouch:g.crouch+k.crouch,lean:g.lean+k.lean,off:g.off?[g.off[0]*k.off,g.off[1]-k.offUp]:g.off};};}

// ---------- the AI ----------
// on auto, he keeps the drill: the blow he threw last is the one he least wants next
{const mw=moveWeights;moveWeights=function(A,D,w,sT,ok){mw.apply(this,arguments);
  if(A&&A===S.F[0]&&A._wireLast&&w&&w[A._wireLast]!=null&&styleIn(A,'wire'))w[A._wireLast]*=WIRE.ai.again;};}
// ===== WIRE DRILL END =====
