// ===== STRINGS (test) START =====
// Strings on a timeline: a test of a new turn, run on the game's own engine and loaded only by the test page (proto/strings). Nothing
// here is in the game's build.
//   A turn is a string. A fighter has beats each turn (Ilyas three, a crew man two, a named man three, a boss four): a light move takes
//   one, a heavy move two (STR_HEAVY). He plans the string, and it plays as one piece: each move after the first is at +1 to hit, up to
//   +3. A move that does not land ends it, and so does a blow that lands on him; the beats left in it are kept. A takedown in it gives a
//   beat back, and the rest of the string goes on to the nearest man.
//   Kept beats are counters: when one of his answers wins, a kept beat strikes back at once (today's riposte, with no tempo). With no
//   beat kept he is overextended: his answers are at -2 until his next turn. One unused kept beat carries into his next turn.
//   Every blow at a fighter is answered, for nothing. Ilyas answers by his read of the blow's tell (High: an Overhead or a Slash; Point:
//   a Thrust or a Feint; Low: a Sweep or a Shove), or with the answer the player set for it on the timeline. A feint that bites draws a
//   kept beat. A break takes a man's kept beats and pushes his next turn back.
//   A turn costs the same tempo whatever the string (STR.cost 'fixed'), or each move its own (STR.cost 'string': the moves after the
//   first 15% cheaper each, 45% at most).
// The follow-ups that were openings (press, flow, the free move on a broken man) are the string's now; the openings left are counters,
// and each needs a kept beat (a gang-up too).
const STR={on:true,beats:3,answers:'ahead',cost:'fixed',breakSlide:40,overext:2,linkMax:3,carry:1};
// the moves that take two beats
const STR_HEAVY=['overhead','throw','toss','room1','room2','gale'];
function strBeatsOf(cmd){return!cmd||cmd==='wait'?0:STR_HEAVY.includes(cmd)?2:1;}
function strBeatsFor(f){return f===hero()?STR.beats:f.hench?2:f.boss?4:3;}
function strSt(f){return f.str||(f.str={plan:[],next:null,i:0,playing:false,hp0:0,res:null,takedowns:0,carry:0,approach:false});}
// a turn's tempo: what a Slash costs him (his weapon, his rank and the crowd count, as the turn order has always reckoned it)
function strTurnCost(f){return actionCost(f,'slash');}
function strSpent(plan){return(plan||[]).reduce((s,m)=>s+strBeatsOf(m.cmd),0);}
function strOpp(f){return S.F.filter(o=>o.team!==f.team&&!o.dead&&!o.npc&&!o.walkIn);}
// the man a string goes on to when its target is down: the nearest one standing, else the nearest one down
function strNextTarget(A,D){if(D&&!D.dead&&!D.downed&&!D.walkIn)return D;
  const os=strOpp(A).sort((a,b)=>(Math.abs(a.station-A.station)+Math.abs(a.lane-A.lane)*.6)-(Math.abs(b.station-A.station)+Math.abs(b.lane-A.lane)*.6));
  return os.find(o=>!o.downed)||(D&&!D.dead?D:os[0])||null;}

// ---------- tells and his read ----------
// what a blow looks like before it comes, and what it could be (the share each move has under it)
const TELLS={high:{name:'High',what:'an Overhead or a Slash',kinds:{overhead:.5,slash:.5}},
  point:{name:'Point',what:'a Thrust or a Feint',kinds:{thrust:.8,feint:.2}},
  low:{name:'Low',what:'a Sweep or a Shove',kinds:{sweep:.6,shove:.4}},
  close:{name:'Close',what:'a grab or a blow chest to chest',kinds:{}},
  step:{name:'Step',what:'he moves',kinds:{}},
  hold:{name:'Waits',what:'he holds his ground',kinds:{}}};
function tellOf(cmd){if(cmd==='overhead'||cmd==='slash')return'high';if(cmd==='thrust'||cmd==='feint'||cmd==='stab'||cmd==='bolt')return'point';
  if(cmd==='sweep'||cmd==='shove')return'low';if(cmd==='grab'||cmd==='throw'||DIRTY.includes(cmd))return'close';if(cmd==='wait')return'hold';return'step';}
// what Ilyas has seen each man do under each tell this fight
function strHist(A){const H=S.strHist||(S.strHist={});return H[A.idx]||(H[A.idx]=[]);}
// how a man's tell leans: his temper, then what he has done under it before
function tellWeights(A,tell){const w={...(TELLS[tell]||TELLS.step).kinds};
  if(tell==='high'){if(A.temper==='brute'){w.overhead=.7;w.slash=.3;}else if(A.temper==='keeper'){w.overhead=.3;w.slash=.7;}}
  for(const h of strHist(A))if(h.tell===tell&&w[h.kind]!=null)w[h.kind]+=.25;
  const s=Object.values(w).reduce((a,b)=>a+b,0)||1;for(const k in w)w[k]/=s;return w;}
// his read: the answer that costs him least over the moves the tell could be. The cost is the chance the blow lands (25% more for a
// Counter, which a landed blow hits harder), plus the risk of an Overhead breaking a Parry, less what the answer pays when the blow misses
const STR_READ={guardBreak:.15,ctrFlat:.25,pay:{parry:.06,counter:.1,slip:.04,back:.04,turn:.12}};
function strRead(A,D,tell){const ch=reactChoices(D,A),w=tellWeights(A,tell);let best=ch[0],bv=9;
  for(const k of ch){let v=0,n=0;for(const kind in w){if(!ATTACKS.includes(kind))continue;const p=reactLands(A,D,kind,false,pickTechnique(A,D,kind),k);
      v+=w[kind]*(p*(k==='counter'?1+STR_READ.ctrFlat:1)+(k==='parry'&&kind==='overhead'?STR_READ.guardBreak:0)-(1-p)*(STR_READ.pay[k]||0));n+=w[kind];}
    v=n?v/n:0;if(v<bv-1e-9){bv=v;best=k;}}
  return best;}
// the answers the player set on the timeline: S.strAns[man][move of his next string]
function strAnsSet(){return S.strAns||(S.strAns={});}
// the move of his string a blow is (0 for the first), or null for a counter or a gang-up
function strMoveOf(A,ex){return ex&&ex.A===A&&(ex.depth||0)===0?(ex.strMove!=null?ex.strMove:S._strMoveNext!=null&&S.strCur===A?S._strMoveNext:null):null;}
function strAnswerFor(A,D,kind,ex){const ch=reactChoices(D,A),mv=strMoveOf(A,ex);
  if(mv!=null){const s=(strAnsSet()[A.idx]||{})[mv];if(s&&ch.includes(s))return s;}
  return strRead(A,D,tellOf(kind));}

// ---------- the hero's plan (the test page builds it; the headless checks play Ilyas through strAutoPlan) ----------
function strPlan(){return S.strPlan||(S.strPlan=[]);}
function strPlanLeft(){return strBeatsFor(hero())-strSpent(strPlan());}
function strPlanAdd(cmd){const K=hero(),D=targetOf(K);if(!cmd||strBeatsOf(cmd)>strPlanLeft())return false;strPlan().push({cmd,tgt:D?D.idx:null});return true;}
function strPlanUndo(){strPlan().pop();}
function strPlanClear(){S.strPlan=[];}
// Go: the string starts with its first move (an empty plan is a Hold: every beat kept)
function strGo(){const K=hero(),plan=strPlan().slice(),st=strSt(K);
  st.next=plan.length?plan:[{cmd:'wait',tgt:null}];
  const m=st.next[0];if(m.tgt!=null&&S.F[m.tgt]&&!S.F[m.tgt].dead)setTgt(K,m.tgt);
  const ok=command(0,m.cmd);if(ok)S.strPlan=[];else st.next=null;return ok;}
// Ilyas on auto: two blows and a kept beat against a crowd, three on a lone man
const STR_OFFENCE=['shove','feint','stab','bolt',...DIRTY];
function strOffence(c){return ATTACKS.includes(c)||STR_OFFENCE.includes(c);}
function strAutoPlan(first,ac){const K=hero(),n=strOpp(K).length,plan=[first];
  if(strOffence(first)||first==='advance'){const want=n>=2?2:3,keep=n>=2?1:0;let used=strBeatsOf(first);
    for(let t=0;t<6&&plan.length<want;t++){const c=ac(0);if(!strOffence(c))continue;if(used+strBeatsOf(c)>strBeatsFor(K)-keep)continue;plan.push(c);used+=strBeatsOf(c);}}
  return plan.map(c=>({cmd:c,tgt:getTgt(K)}));}
// an enemy's string, planned with his intent: how many blows by his temper, and a kept beat unless he is a brute
function strPlanMore(A,first){if(!(ATTACKS.includes(first)||first==='shove'))return[];
  const want=A.hench?1:A.temper==='brute'||A.temper==='rusher'?2:A.temper==='keeper'?1:A.skill>=3?2:1,keep=A.temper==='brute'?0:1;
  const more=[];let used=strBeatsOf(first);
  for(let t=0;t<6&&1+more.length<want;t++){const c=aiChoice(A.idx);if(!(ATTACKS.includes(c)||c==='shove'))continue;if(used+strBeatsOf(c)>strBeatsFor(A)-keep)continue;more.push(c);used+=strBeatsOf(c);}
  return more;}

// ---------- the turn ----------
// a new fight starts clean
V11.duelStart.push(()=>{for(const f of S.F){f.str=null;f.kept=0;f.overext=false;}S.strHist={};S.strAns={};S.strPlan=[];S.strCur=null;S._strMoveNext=null;});
// a turn starts: any string still open is over (the beats left in it kept), and the man whose turn it is carries one kept beat in
V11.turnStart.push(i=>{if(!STR.on)return;for(const f of S.F)if(f.str&&f.str.playing)strEnd(f,'turn');S.strCur=null;
  const f=S.F[i];if(!f)return;const st=strSt(f);st.carry=Math.min(STR.carry,f.kept||0);f.kept=0;f.overext=false;st.res=null;
  if(f===hero())S.strPlan=[];});
// the first move of a turn starts the string (the turn's tempo replaces the move's); a later one comes through the engine's own queue
{const cm=command;command=function(i,cmd,opts){
  const g=S.game,A=S.F[i];if(!STR.on||!A||g.phase!=='input'||g.active!==i||S.opening)return cm.apply(this,arguments);
  opts=opts||{};const st=strSt(A),D=targetOf(A);
  if(!opts.prepaid){
    const c0=actionCost(A,cmd,D?moveCost(A,D,cmd):0)+approachCost(A,D,cmd);
    st.plan=st.next&&st.next.length&&st.next[0].cmd===cmd?st.next:[{cmd,tgt:D?D.idx:null}];
    st.i=0;st.playing=true;st.hp0=A.hp;st.res=null;st.takedowns=0;S.strCur=A;S._strMoveNext=0;
    let ok=false;try{ok=cm.apply(this,arguments);}finally{S._strMoveNext=null;}
    if(!ok){st.playing=false;S.strCur=null;return ok;}
    st.next=null;st.approach=!!(g.ex&&g.ex.approach);if(g.ex)g.ex.strMove=0;
    A.kept=Math.max(0,strBeatsFor(A)-strSpent(st.plan))+(st.carry||0);st.carry=0;A.overext=A.kept<=0;
    if(STR.cost==='fixed')A.ready+=strTurnCost(A)-c0;
    if(S.hooks.strStart)S.hooks.strStart(A);
    return ok;}
  if(!st.playing||S.strCur!==A)return cm.apply(this,arguments);
  S._strMoveNext=st.i;let ok=false;try{ok=cm.apply(this,arguments);}finally{S._strMoveNext=null;}
  if(ok&&g.ex){g.ex.strMove=st.i;
    // (the blow an approach was paid for is not a second move)
    if(st.approach)st.approach=false;
    else if(STR.cost==='string')A.ready+=Math.round(actionCost(A,cmd,D?moveCost(A,D,cmd):0)*(1-Math.min(st.i*.15,.45)));}
  return ok;};}
// what the enemies play, and Ilyas on auto: the intent, and the rest of the string planned with it
{const ti=takeIntent;takeIntent=function(A){const it=A.intent,c=ti.apply(this,arguments);
  if(STR.on)strSt(A).next=[{cmd:c,tgt:A.tgt},...(it&&it.cmd===c&&it.more?it.more:[]).map(m=>({cmd:m,tgt:null}))];return c;};}
{const ac=aiChoice;aiChoice=function(i){const c=ac.apply(this,arguments);
  if(STR.on&&i===0&&!S._strAuto&&isAI(0)&&S.game.phase==='input'&&S.game.active===0&&!S.opening){S._strAuto=true;try{strSt(S.F[0]).next=strAutoPlan(c,ac);}finally{S._strAuto=false;}}
  return c;};}
{const ei=ensureIntents;ensureIntents=function(){ei.apply(this,arguments);if(!STR.on)return;
  for(const A of foes()){const it=A.intent;if(it&&!it.strPlanned){it.strPlanned=true;it.more=strPlanMore(A,it.cmd);}}};}
// a string ends: the beats left in it are kept (none when it ran out), and each takedown in it gives one back
function strEnd(A,why){const st=A.str;if(!st||!st.playing)return;st.playing=false;st.endWhy=why;if(S.strCur===A)S.strCur=null;
  const rest=st.plan.slice(st.i+1),back=(why==='done'?0:strSpent(rest))+(st.takedowns||0);
  if(back>0){A.kept=(A.kept||0)+back;A.overext=false;}
  if(A.team===1&&S.strAns)delete S.strAns[A.idx];
  if(S.hooks.strEnd)S.hooks.strEnd(A,why,rest);}
// after each exchange the string goes on with its next move, or ends
V11.exchangeEnd.push(()=>{if(!STR.on||S.queued)return;const A=S.strCur;if(!A)return;const st=A.str;if(!st||!st.playing){S.strCur=null;return;}
  if(A.dead){st.playing=false;S.strCur=null;return;}
  const r=st.res;st.res=null;
  if(A.hp<st.hp0){strEnd(A,'hit');return;}
  if(A.broken||A.clinch||A.downed){strEnd(A,A.clinch?'held':A.broken?'broken':'down');return;}
  if(r&&!(r.out==='hit'||r.out==='crit'||r.out==='wall')){strEnd(A,'missed');return;}
  const nx=st.plan[st.i+1];if(!nx||!strOpp(A).length){strEnd(A,'done');return;}
  const prev=nx.tgt!=null?S.F[nx.tgt]:targetOf(A),D=strNextTarget(A,prev||targetOf(A));
  if(!D){strEnd(A,'done');return;}
  if(nx.tgt!=null)nx.tgt=D.idx;
  if(!cmdValid(A,D,nx.cmd)||D.clinch){strEnd(A,'blocked');return;}
  st.i++;S.queued={A,D,cmd:nx.cmd};});
// the hero's answer to a blow, given as it comes; what came of each blow of a string, and the takedowns in it; what he has seen
{const la=launchAttack;launchAttack=function(A,D,kind,ex){
  if(STR.on&&ex&&(ex.depth||0)===0&&ex.A===A&&ex.strMove==null&&S._strMoveNext!=null&&S.strCur===A)ex.strMove=S._strMoveNext;
  if(STR.on&&STR.answers==='ahead'&&ex&&!ex.reacted&&D===hero()&&!isAI(D.idx)&&canReact(A,D,kind)){
    ex.reacted=true;const ans=strAnswerFor(A,D,kind,ex);applyReaction(D,ans,A);if(S.hooks.strAnswer)S.hooks.strAnswer(D,A,ans,kind);}
  const r=la.apply(this,arguments);
  if(STR.on&&ex&&ex.res&&!ex.reactPending){
    if(ex.D===hero()&&!ex._seen&&ATTACKS.includes(kind)){ex._seen=true;strHist(A).push({tell:tellOf(kind),kind});}
    if(A&&A.str&&A.str.playing&&S.strCur===A&&ex.strMove!=null&&(ex.depth||0)===0){A.str.res={out:ex.res.out};
      const T=ex.D||D;if((ex.res.out==='hit'||ex.res.out==='crit')&&T&&T.team!==A.team&&(ex.res.kd||T.hp-(ex.res.dmg||0)<=0))A.str.takedowns++;}}
  return r;};}
// Ilyas on auto, and a live answer left too long, answer by the tell, never by the blow itself
{const ar=aiReact;aiReact=function(D,A,kind){if(STR.on&&D===hero())return strRead(A,D,tellOf(kind));return ar.apply(this,arguments);};}
// answers cost nothing
{const ap=applyReaction;applyReaction=function(D){const r0=D.ready;ap.apply(this,arguments);if(STR.on)D.ready=r0;};}
// the string's links, and an overextended man's answers
{const cmo=computeMods;computeMods=function(A,D,kind,opening){const c=cmo.apply(this,arguments);if(!STR.on)return c;const ex=S.game&&S.game.ex,mv=strMoveOf(A,ex);
  if(A&&A.str&&A.str.playing&&S.strCur===A&&mv!=null&&mv>0&&!opening){const l=Math.min(mv,STR.linkMax);c.mods.push(['link',l]);c.bonus+=l;}
  if(D&&D.overext&&!D.downed){c.defMods.push(['overextended',-STR.overext]);c.def-=STR.overext;}
  return c;};}

// ---------- counters: the openings left, each paid for with a kept beat ----------
const STR_COUNTER=['parry','counter','block','dodge','dodgeOver','brace','fumble','turn','stop','broken'];
{const co=considerOpening;considerOpening=function(ex,f,opp,src){if(!STR.on)return co.apply(this,arguments);
  // (a break by his own blow is no counter: the string goes on into the man)
  if(!STR_COUNTER.includes(src)||(src==='broken'&&ex&&ex.A===f))return;
  if((f.kept||0)<=0)return;
  return co.apply(this,arguments);};}
{const cf=considerFlow;considerFlow=function(){if(STR.on)return;return cf.apply(this,arguments);};}
{const cg=considerGang;considerGang=function(ex,E){if(STR.on&&(!E||(E.kept||0)<=0))return;return cg.apply(this,arguments);};}
{const so=startOpening;startOpening=function(ex,f){so.apply(this,arguments);const o=S.opening;
  if(!STR.on||!o||o.f!==f||o.source==='react')return;
  o.counter=true;f.kept=Math.max(0,(f.kept||0)-1);
  if(f===hero()&&!isAI(f.idx)){o.auto=strCounterPick(o);o.aiDelay=.22;}
  if(S.hooks.strCounter)S.hooks.strCounter(o);};}
{const to=tickOpening;tickOpening=function(rdt){const o=S.opening;if(STR.on&&o&&o.auto){o.left-=rdt;if(o.dur-o.left>=o.aiDelay)resolveOpening(o.auto);return;}return to.apply(this,arguments);};}
{const oc=openCost;openCost=function(f,k,o){const oo=o===undefined?S.opening:o;if(STR.on&&oo&&oo.counter)return 0;return oc.apply(this,arguments);};}
// the counter Ilyas throws: the blow worth the most, at its chance
function strCounterPick(o){const f=o.f,D=o.opp,ch=openingChoices(o).filter(k=>openValid(o,k));let best=null,bv=-1;
  for(const k of ch){if(!ATTACKS.includes(k))continue;const T=pickTechnique(f,D,k),[n,s,b]=T.dice||f.wp.dice,v=hitChanceT(f,D,k,true,T)*((n*(s+1)/2+b)*(ACTIONS[k].mult||1)*(T.dmg||1));if(v>bv){bv=v;best=k;}}
  return best||ch.find(k=>k!=='hold')||'hold';}

// ---------- breaks and feints ----------
{const bf=breakFighter;breakFighter=function(D){const r=bf.apply(this,arguments);if(STR.on&&D){D.kept=0;D.ready+=STR.breakSlide;if(D.str&&D.str.playing)strEnd(D,'broken');}return r;};}
{const af=applyFeint;applyFeint=function(A,D,res){const k0=D&&D.kept||0;af.apply(this,arguments);
  if(STR.on&&res&&res.ok&&D&&!D.dead&&!D.downed&&k0>0){D.kept=k0-1;popup(D,'Counter drawn','#ffd36b','a kept beat spent',17,-58);}};}

// ---------- the tells, held while Ilyas plans ----------
// each enemy who means to strike holds the start of it: the weapon raised, the point drawn back, the weight dropped
function strTellAction(A,kind){const K=hero(),T=pickTechnique(A,K,kind),arm=A.arm,wb=windupBase(T,kind,arm,T&&T.amp||1,kind==='thrust'?-.15:.2),off=A.wp.off?'grip':{sh:[.1*arm,.3*arm]};
  return{t0:S.t,end:99,tell:true,body:[{t:0,v:{...A.curBody}},{t:.3,v:()=>({...A.guardBody(),crouch:A.guardBody().crouch-.05,lean:A.guardBody().lean+.08}),e:eOut}],
    arm:[{t:0,v:{...A.curArm}},{t:.3,v:{hand:wb.hand,wAng:wb.ang,off,tilt:0},e:eOut}]};}
function strPlanning(){const g=S.game;return STR.on&&!!g&&g.phase==='input'&&g.active===0&&!S.opening&&!isAI(0)&&!!S.F[0]&&!S.F[0].dead;}
V11.step.push(()=>{if(!STR.on||S.warming)return;const on=strPlanning();
  for(const A of S.F){if(A.team!==1||A.dead||A.npc)continue;
    if(on){const it=A.intent;if(it&&ATTACKS.includes(it.cmd)&&!A.action&&!A.downed&&!A.clinch&&!A.carry&&A.curBody&&A.curArm)A.action=strTellAction(A,it.cmd);}
    else if(A.action&&A.action.tell)A.action=null;}});
// ===== STRINGS (test) END =====
