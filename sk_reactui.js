// ===== REACT UI =====
// (loaded ahead of the main UI script; what touches the page runs once the UI is up)
// The answer window (sk_react.js): when a blow comes at a hero the player controls, time slows and the opening panel shows what is
// coming and the answers to it, each with the chance the blow still lands and what it costs; the best of them is ticked. While the
// window is open the man swinging is marked in the picture, and a fighter Broken gets a line in the log.

// what answers each kind of blow, for the tip under the commands when an enemy's next move is a blow at you
const REACT_TIP={slash:'a Parry (+4) or a Step back (+2).',thrust:'a Parry or a Slip (+4). Stepping off his line first puts it at −4.',
  overhead:'a Counter (+3) meets it, and it breaks through a Parry.',sweep:'a Step back (+4). It goes under a Parry.'};
// one line under each answer: what it pays (a phone has no hover to tell it)
const REACT_SUB={parry:'Riposte if he misses',counter:'Counter if he misses',slip:'Leaves him reaching',back:'Steadies you'};
function reactSub(o,k){if(k==='turn'){const P=turnPartner(o.f,o.opp);return P?'Into '+P.name:'Nobody behind him';}return REACT_SUB[k]||'';}
function reactOpening(o){return o&&o.ex&&o.ex.pendReact?o.ex.pendReact.opening:false;}
// the chance the blow still lands with this answer, in percent
function reactPct(o,k){return Math.round(reactLands(o.opp,o.f,o.attack,reactOpening(o),o.tech,k)*100);}
// what the answer adds to his DEF against this blow
function reactBonus(o,k){const A=o.opp,D=o.f,nm=REACT_NAME[k].toLowerCase();
  return withReact(D,k,()=>computeMods(A,D,o.attack,reactOpening(o),o.tech).defMods.filter(m=>m[0]==='parry'||m[0]==='counter'||m[0]===nm).reduce((s,m)=>s+m[1],0));}
// what it is worth against this blow, and what it does if he misses
function reactText(o,k){const A=o.opp,kind=o.attack,nm=ACTIONS[kind].name,b=`${signed(reactBonus(o,k))} against his ${nm}.`;
  if(k==='parry')return`${b} ${kind==='overhead'?'An Overhead breaks the parry if it lands or you block it. ':kind==='sweep'?'A Sweep goes under it. ':''}A blow you turn aside costs ${A.name} two pips of balance and opens a riposte.`;
  if(k==='counter')return`${b} If it misses, ${A.name} loses two pips of balance and you counter at once. If it lands, it lands 25% harder.`;
  if(k==='slip')return`${b} If it misses, ${A.name} is left reaching: a pip of his balance, two for an Overhead.`;
  if(k==='back')return`${b} If it misses, you steady yourself by a pip and ${A.name} loses one.`;
  const P=turnPartner(o.f,A);return`${b} If it misses or you block it, ${A.name} goes into ${P?P.name:'his partner'} with a shove that cannot fail, and a clean miss puts them both down.`;}
// the opening panel's parts, for the answer window
{const ol=openingLabel;openingLabel=function(o,k){return o&&o.source==='react'?REACT_NAME[k]||k:ol(o,k);};}
{const os=openingSub;openingSub=function(o,k){return o&&o.source==='react'?reactSub(o,k):os(o,k);};}
{const oh=openingHint;openingHint=function(o,k){return o&&o.source==='react'?`${reactPct(o,k)}% lands · ${openCost(o.f,k,o)} tempo`:oh(o,k);};}
{const of=openingFt0;openingFt0=function(o,k){return o&&o.source==='react'?0:of(o,k);};}
// the preview line when an answer is hovered
{const rt=roleText;roleText=function(A,D,k){const o=S.opening;return o&&o.source==='react'&&REACT_NAME[k]&&A===o.f?reactText(o,k):rt(A,D,k);};}
// the man swinging, marked while the window is open: a pulse at his weapon's point
function drawReactMark(){const o=S.opening;if(!o||o.source!=='react')return;const A=o.opp;if(!A||A.dead||!A.p||!A.p[TIP])return;
  const q=P(A.p[TIP].x,A.p[TIP].y,A.dep),u=.5+.5*Math.sin(performance.now()/110);
  ctx.save();ctx.strokeStyle=`rgba(255,122,92,${.5+.4*u})`;ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(q.x,q.y,7+u*4,0,TAU);ctx.stroke();
  ctx.globalAlpha=.25+.2*u;ctx.fillStyle='#ff7a5c';ctx.beginPath();ctx.arc(q.x,q.y,3.2,0,TAU);ctx.fill();ctx.restore();}
V11UI.world.push(drawReactMark);
V11UI.init.push(()=>{
  // the panel: what is coming, from whom, and which answer is best against it
  const base=S.hooks.opening;
  S.hooks.opening=function(o,choice){
    const re=!!(o&&o.source==='react');
    base.apply(this,arguments);
    const el=$('opening');if(o&&el&&el.classList)el.classList.toggle('react',re);
    if(!re)return;
    const A=o.opp,D=o.f,ai=isAI(D.idx),two=heroes().length>1,tn=o.tech&&o.tech.name&&o.tech.name!==ACTIONS[o.attack].name?' · '+o.tech.name:'';
    $('opTitle').textContent=`Incoming ${ACTIONS[o.attack].name}`;
    $('opSub').textContent=`${A.name}${tn}${facingAway(D,A)?(two?` · at ${D.name}'s back`:' · at your back'):''}${ai?' · deciding…':' · time slows, answer it'}`;
    $('opReason').textContent=`${A.name} ${post(A).name.toLowerCase()} · ${D.name} ${post(D).name.toLowerCase()}, ${D.foot} of ${footMaxOf(D)}. Too slow, and ${D.name} answers by his own read.`;
    const ch=openingChoices(o),ps=ch.map(k=>reactPct(o,k)),lo=Math.min(...ps);
    opBtns.querySelectorAll('button').forEach(b=>{const i=ch.indexOf(b.dataset.c);b.classList.toggle('best',i>=0&&ps[i]===lo);});
    if(!ai)S.hooks.sound('swoosh',3);};
  // the hint line under the title, when no answer is hovered
  const bo=updateOrder;
  updateOrder=function(){bo.apply(this,arguments);const o=S.opening;
    if(o&&o.source==='react'&&!previewCmd&&!isAI(o.f.idx))$('opHint').textContent=`Each answer costs ${REACT.cost} tempo of ${o.f.name}'s next turn (Turn him ${REACT.turnCost}). The ticked one is the safest.`;};
  // a fighter Broken, in the log
  S.hooks.broken=(D,by)=>S.hooks.log({type:'broken',A:by,D});
});
// ===== REACT UI END =====
