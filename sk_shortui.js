// ===== SHORT HAND UI =====
// (loaded ahead of the main UI script; what touches the page runs once the UI is up)
// Short Hand on the page (sk_short.js): the Hinge and the Wrist toll in the answer window (their names, the line under each, what each
// is worth against the blow and what it does), the tip for a blow on its way at a man in the stance, the window a grab at him opens
// (Wrist toll or let it come), the Short ladder, the Ankle hook and the Blind-side check on the command buttons, in the opening panel
// and in the preview strip, the log's lines for them, and his tags (the style, and whose reach he is inside). The moves' names over
// the fighters are the game's own popups and callouts. Nothing here changes the game: it only reads it.

// ---------- the answer window ----------
REACT_SUB.hinge='Ends inside his reach';REACT_SUB.toll='Cuts the reaching hand';
// what the answer is worth against this blow, and what it does
{const rt=reactText;reactText=function(o,k){if(k!=='hinge'&&k!=='toll')return rt(o,k);
  const A=o.opp,b=`${signed(reactBonus(o,k))} against his ${ACTIONS[o.attack].name}.`;
  if(k==='hinge')return`${b} Turn the empty side into it and take it on the shoulder: a blow that lands comes in glancing, at under half its damage and a pip of balance at most. Hit or miss, you end inside ${A.name}'s reach (+${SHORT_HAND.inside.bonus} on your next attack on him) and he loses a pip. No riposte.`;
  return`${b} If it misses, you cut the hand that reached: ${A.name} takes a cut and an arm wound and loses ${SHORT_HAND.toll.pips} pips of balance. If it lands, it lands in full.`;};}
// the tip under the commands when a blow is on its way at a hero in the stance (the plain tips for anyone else)
{const base={slash:REACT_TIP.slash,thrust:REACT_TIP.thrust,overhead:REACT_TIP.overhead,sweep:REACT_TIP.sweep};
  const hero=()=>typeof cmdHero==='function'?cmdHero():S.F[0];
  const tip=(k,fn)=>Object.defineProperty(REACT_TIP,k,{configurable:true,enumerable:true,get(){const K=hero();return(K&&fn(K))||base[k];}});
  tip('slash',K=>shortKnows(K,'hinge')?'a Hinge (+2): take it glancing on the shoulder and end up inside his reach. A Step back is +2 too.':null);
  tip('overhead',K=>shortKnows(K,'hinge')?'a Hinge (+2) takes it glancing on the shoulder; a Counter (+3) meets it.':null);
  tip('thrust',K=>shortKnows(K,'toll')?'a Wrist toll (+2) cuts the hand that reaches; a Slip is +4. Stepping off his line first puts it at −4.':null);
  tip('sweep',K=>shortOn(K)?'a Step back (+4). The low stance puts it at −2 already.':null);}

// ---------- the window a grab opens ----------
function tollText(o,k){const A=o.opp,D=o.f,p=Math.round(chanceOf(grabMods(A,D,false))*100);
  return k==='toll'?`Cut the hand that reaches for you: the grab fails, ${A.name} takes a cut and an arm wound and loses ${SHORT_HAND.toll.pips} pips of balance. ${REACT.cost} tempo of your next turn.`
    :`Let the grab come: ${p}% it gets hold of you and locks you in a clinch; if it fails, ${A.name} loses three pips. No tempo.`;}
{const ol=openingLabel;openingLabel=function(o,k){if(o&&o.source==='toll')return k==='toll'?'Wrist toll':'Let it come';return ol(o,k);};}
{const os=openingSub;openingSub=function(o,k){if(o&&o.source==='toll')return k==='toll'?'Cuts the reaching hand':'Take the grab';
  if(o&&k==='shove'&&o.f&&o.opp){const v=shoveVariant(o.f,o.opp,true);if(v&&v.kind==='blindcheck')return'Blind-side check';}return os(o,k);};}
{const oh=openingHint;openingHint=function(o,k){if(o&&o.source==='toll')return k==='toll'?`grab fails · ${openCost(o.f,k,o)} tempo`:`${Math.round(chanceOf(grabMods(o.opp,o.f,false))*100)}% he has you · no tempo`;return oh(o,k);};}
{const of=openingFt0;openingFt0=function(o,k){return o&&o.source==='toll'?0:of(o,k);};}
{const rt=roleText;roleText=function(A,D,k){const o=S.opening;if(o&&o.source==='toll'&&A===o.f&&(k==='toll'||k==='let'))return tollText(o,k);return rt(A,D,k);};}
// the hand reaching for him, marked while the window is open
function drawTollMark(){const o=S.opening;if(!o||o.source!=='toll')return;const A=o.opp;if(!A||A.dead||!A.p)return;const h=A.p[A.oneArm?HAF:HAB];if(!h)return;
  const q=P(h.x,h.y,A.dep),u=.5+.5*Math.sin(performance.now()/110);
  ctx.save();ctx.strokeStyle=`rgba(255,122,92,${.5+.4*u})`;ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(q.x,q.y,7+u*4,0,TAU);ctx.stroke();
  ctx.globalAlpha=.25+.2*u;ctx.fillStyle='#ff7a5c';ctx.beginPath();ctx.arc(q.x,q.y,3.2,0,TAU);ctx.fill();ctx.restore();}
V11UI.world.push(drawTollMark);

// ---------- the moves on the buttons and in the preview strip ----------
{const mr=moveRole;moveRole=function(A,D,k){if(A&&D&&!D.downed&&ATTACKS.includes(k)&&shortOn(A)){const T=pickTechnique(A,D,k),dn=D.name;
    if(T.key==='shortladder')return T.threat?`Short ladder: the point comes up under ${dn}'s chin and stays there. No damage: he loses his balance and does not move.`
      :`Short ladder: a rising stab from the low stance, under ${dn}'s guard (a Parry adds only +2). +${SHORT_HAND.ladder.acc} to hit${T.inside?`, and ×${SHORT_HAND.ladder.dmg} damage from inside his reach`:'; from inside his reach it hits ×'+SHORT_HAND.ladder.dmg}.`;
    if(T.key==='anklehook'){const pr=shortHookProp(A,D);return`Ankle hook: the foot goes behind ${dn}'s ankle while the knife threatens high, so a Parry is worth nothing against it. Off balance, or Committed on a good hit, he goes down${pr?`, and with the ${PROP[pr.type].name} behind him any hit puts him over it`:''}.`;}}
  return mr(A,D,k);};}
{const mcr=moveCmdRole;moveCmdRole=function(A,D,k){if(k==='shove'&&A&&D&&!A.downed&&!A.clinch){const v=shoveVariant(A,D);
    if(v&&v.kind==='blindcheck')return v.floor?`Blind-side check: the empty shoulder drives into ${D.name}. He is off balance: a check that lands puts him down. ${-SHORT_HAND.check.cost} tempo cheaper than a shove.`
      :`Blind-side check: the empty shoulder drives into ${D.name}. A check that lands drives him back a step and costs him ${SHORT_HAND.check.pips} pips of balance. ${-SHORT_HAND.check.cost} tempo cheaper than a shove.`;}
  return mcr(A,D,k);};}
{const mci=moveCmdInfo;moveCmdInfo=function(A,D,k,c){if(k==='shove'&&A&&D&&!A.downed&&!A.clinch){const v=shoveVariant(A,D);
    if(v&&v.kind==='blindcheck')return{tq:'Blind-side check',h:`${Math.round(shoveChance(A,D,false)*100)}% · ${c} tempo`,ok:true,mark:'move'};}
  return mci(A,D,k,c);};}

// ---------- his tags ----------
// the style, while it is on, and the man whose reach the Hinge has put him inside
{const ut=updateTags;updateTags=function(){ut.apply(this,arguments);
  for(const f of S.F){if(!f||f.dead||f.style!=='shorthand'||!shortOn(f))continue;const el=$('tags'+f.idx);if(!el)continue;
    const T=f.inside?S.F[f.inside.on]:null,ins=!!T&&shortInsideFlag(f,T,true);
    let h='<span class="tag sh-tag" style="color:#9fd8ff" title="Short Hand: low, the weight forward, the knife tight to the chest. Shoves and sweeps at him are at −2, and a shove takes a pip less.">Short Hand</span>';
    if(ins)h+=`<span class="tag sh-tag" style="color:#a9e88c" title="+${SHORT_HAND.inside.bonus} on his next attack on ${T.name}; gone with his next action">Inside ${T.name}'s reach</span>`;
    if(!el.innerHTML.endsWith(h))el.insertAdjacentHTML('beforeend',h);}};}

V11UI.init.push(()=>{
  // the panel for a grab: what is coming, from whom
  const base=S.hooks.opening;
  S.hooks.opening=function(o,choice){base.apply(this,arguments);if(!o||o.source!=='toll')return;
    const el=$('opening');if(el&&el.classList)el.classList.add('react');
    const A=o.opp,D=o.f,ai=isAI(D.idx),two=heroes().length>1;
    $('opTitle').textContent='Incoming Grab';
    $('opSub').textContent=`${A.name} reaches for ${two?D.name:'you'}${ai?' · deciding…':' · time slows, answer it'}`;
    $('opReason').textContent=`${A.name} ${post(A).name.toLowerCase()} · ${D.name} ${post(D).name.toLowerCase()}, ${D.foot} of ${footMaxOf(D)}. Too slow, and ${D.name} answers by his own read.`;
    if(!ai)S.hooks.sound('swoosh',2);};
  const bo=updateOrder;
  updateOrder=function(){bo.apply(this,arguments);const o=S.opening;
    if(o&&o.source==='toll'&&!previewCmd&&!isAI(o.f.idx))$('opHint').textContent=`The Wrist toll costs ${REACT.cost} tempo of ${o.f.name}'s next turn; letting the grab come costs nothing.`;};
  // the log: the glancing blow, the threat, the toll on a grab, the blind-side check
  const bl=S.hooks.log;
  S.hooks.log=function(e){bl.apply(this,arguments);const li=e&&e.ex&&e.ex.li;if(!li)return;const r=e.res;
    if(e.type==='attack'&&r&&r.glance){const d=li.querySelector('.lg-roll');if(d)d.textContent+=` · Hinge: glancing, ×${SHORT_HAND.hinge.glance}${r.glanceFrom==='crit'?' and no crit':''}`;}
    if(e.type==='attack'&&r&&r.threat){const o=li.querySelector('.out');if(o)o.textContent='At his throat';}
    if(e.type==='grab'&&r&&r.toll){const o=li.querySelector('.out');if(o)o.textContent='Wrist toll';}
    if(e.type==='shove'&&r&&r.blind){for(const s of li.querySelectorAll('.lg-l span'))if(s.textContent==='shoulder-checks'||s.textContent==='shoves'){s.textContent='checks blind-side';break;}
      const o=li.querySelector('.out');if(o)o.textContent='Check';}};
  const bp=S.hooks.perf;
  S.hooks.perf=function(ex){bp.apply(this,arguments);if(!ex||!ex.li||!ex.res||!ex.res.threat)return;const o=ex.li.querySelector('.out'),p=ex.li.querySelector('.lg-perf');
    if(o){o.className='out out-crit';o.textContent='At his throat';}if(p)p.textContent=`the point under ${ex.D.name}'s chin · ${ex.D.name} broken, and does not move`;};
  const bg=S.hooks.grab;
  S.hooks.grab=function(ex,i){bg.apply(this,arguments);if(!i||!i.toll||!ex||!ex.li)return;const o=ex.li.querySelector('.out'),p=ex.li.querySelector('.lg-perf');
    if(o)o.textContent='Wrist toll';if(p)p.textContent=`${ex.D.name} cuts the reaching hand · ${ex.A.name} takes ${i.dmg}, an arm wound, and loses ${SHORT_HAND.toll.pips} pips of balance`;};
  const bs=S.hooks.shove;
  S.hooks.shove=function(ex,i){bs.apply(this,arguments);if(!i||!i.blind||!ex||!ex.li)return;const p=ex.li.querySelector('.lg-perf');
    if(p)p.textContent=`blind-side check · driven back ${i.pushed}u${i.tripped?', '+tripText(i.tripped):''} · ${ex.D.name} loses ${SHORT_HAND.check.pips} pips of balance, +${SHORT_HAND.check.tempo} tempo`;};
});
// ===== SHORT HAND UI END =====
