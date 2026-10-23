// ===== MOVES UI START =====
// The contextual moves on the command buttons, in the preview strip, the intents, the tags and the exchange log.

// what each attack move does, for the preview strip
function moveRole(A,D,k){
  if(!D||D.downed||!ATTACKS.includes(k))return null;const T=pickTechnique(A,D,k);if(!T.move)return null;const dn=D.name;
  switch(T.key){
    case'backthrust':return`Back thrust: the point goes back at ${dn} without turning. +1 to hit, ×${MOVES.backDmg} damage, and you keep facing ${T.backT.name}, so he gets no attack at your back.`;
    case'beatthrust':return`Beat and thrust: the blade knocks ${dn}'s guard aside first. The guard adds +${MOVES.beatGuard} instead of +4, and a miss is no free riposte. ${MOVES.beatCost} more tempo.`;
    case'pinwall':return`${T.name}: ${dn} has the ${pinnedBy(D)} at his back. +${Math.round((MOVES.pinDmg-1)*100)}% damage, and a hit pins him there: no Withdraw or Sidestep on his next turn.`;
    case'haftcut':return`Haft cut: inside the reach of ${dn}'s spear, the cut goes for the shaft. A hit takes the head off and leaves him a bare shaft (shorter, blunt, no stop-hits). It does him no damage.`;
    case'beard':return`Beard hook: the axe's beard catches ${dn}'s raised weapon. On a hit or a block his guard drops and he loses ${MOVES.beardTempo} tempo, and a block hands him no riposte.`;
    case'murder':return`Murder-stroke: the sword is reversed and the crossguard hammers through ${dn}'s guard. Hit or block, the guard breaks and he is dazed. ×${MOVES.murderDmg} damage.`;
    case'recover':return`Recovering cut: a short cut that brings your weight back under you. It buys a pip of balance back instead of spending one, at ×${MOVES.recoverDmg} damage.`;
    case'snare':return`Lash snare: the segments wrap ${dn}'s ankle and yank him ${MOVES.snareYank} in. Committed or worse, a hit puts him down. No run in and no stop-hit.`;
    case'lashdisarm':return`Lash disarm: the segments wrap ${dn}'s ${D.wp.name.toLowerCase()} from out of reach. A hit or a block becomes a disarm roll (+2 leverage) and a crit tears it away; if he keeps hold, he loses 10 tempo. No damage.`;
    case'hamstring':return`Hamstring: from ${facingAway(D,A)?'behind':'off his line'}, the dagger cuts the back of ${dn}'s knee. No knockdown, but a hit leaves him limping.`;}
  return null;}
// the commands other than attacks that become a move: a shove, a counter with a spear, an advance onto a longer weapon
function moveCmdRole(A,D,k){
  if(!D||A.downed||A.clinch)return null;const dn=D.name;
  if(k==='shove'){const v=shoveVariant(A,D);if(!v)return null;
    if(v.kind==='kick')return`Kick the ${PROP[v.P.type].name} into ${dn}: ${Math.round(kickChance(A,D,v.P)*100)}%. If it lands he loses ${MOVES.kickFootHit} pips of balance and ${MOVES.kickTempo} tempo; a crushing kick trips him. One pip of balance.`;
    if(v.kind==='bottle')return`Throw the ${v.what==='mug'?'tankard':'bottle'} at ${dn}'s head: ${Math.round(bottleChance(A,D)*100)}% (a raised guard bats it away at +2). A hit does light damage and dazes him. One pip of balance.`;
    return`${dn} is off balance: a shoulder check that lands puts him down. ${-MOVES.shoulderCost} tempo cheaper than a shove.`;}
  if(k==='wait'&&setSpearOK(A))return`Set the spear: whoever closes on you before your next turn runs onto the point, and your stop-thrust is at +${MOVES.setSpear.acc} with twice the knockback.`;
  if(k==='advance'&&moveName(A,D,'advance'))return`Beat the point: ${dn}'s stop-hit still comes, but at −${beatPoint(A,D)}, and it barely moves you, so you end up inside his reach.`;
  return null;}
// the button for a shove, a counter or an advance that has become a move
function moveCmdInfo(A,D,k,c){
  if(!D||A.downed||A.clinch)return null;const pct=x=>Math.round(x*100);
  if(k==='shove'){const v=shoveVariant(A,D);if(!v)return null;
    if(v.kind==='kick')return{tq:'Kick the '+PROP[v.P.type].name,h:`${pct(kickChance(A,D,v.P))}% · ${c} tempo`,ok:true,mark:'move'};
    if(v.kind==='bottle')return{tq:v.what==='mug'?'Tankard throw':'Bottle throw',h:`${pct(bottleChance(A,D))}% · ${c} tempo`,ok:true,mark:'move'};
    return{tq:'Shoulder check',h:`${pct(shoveChance(A,D,false))}% · ${c} tempo`,ok:true,mark:'move'};}
  if(k==='wait'&&setSpearOK(A))return{tq:'Set the spear',h:`${c} tempo`,ok:true,mark:'move'};
  return null;}
// what an enemy's shown plan turns into
function moveIntent(f,V,cmd){return ATTACKS.includes(cmd)?null:moveName(f,V,cmd);}
// one line for the footing strip when a move is on offer
function moveTip(K,D){
  if(!D||D.downed||K.downed||K.clinch)return null;
  {const E=shoulderThreat(K);if(E)return`${E.name} is about to shoulder-check you: off balance, it puts you down if it lands. Guard, Counter or Withdraw gets your feet back under you first.`;}
  if(K.wallPin)return`You are pinned to the ${pinnedBy(K)||'wall'}: no Withdraw or Sidestep this turn.`;
  if(D.setSpear)return`${D.name} has set his spear: whoever closes on him runs onto the point, at +${MOVES.setSpear.acc} and twice the knockback.`;
  if(K.posture==='off'&&recoverOK(K,D))return`Off balance: Slash is now a Recovering cut, which buys a pip back instead of spending one. Guard, Counter or Withdraw buy back more.`;
  const v=cmdValid(K,D,'shove')?shoveVariant(K,D):null;
  if(v&&v.kind==='kick')return`A ${PROP[v.P.type].name} stands between you and ${D.name}: Shove kicks it into his legs.`;
  if(v&&v.kind==='bottle')return`A ${v.what==='mug'?'tankard':'bottle'} is within reach and ${D.name} is not: Shove throws it at his head.`;
  return null;}
// what a move added once it played out, for the log line under the dice
function movePerf(ex){const r=ex.res,T=r&&r.tech;if(!T)return'';const D=ex.D,land=r.out==='hit'||r.out==='crit';
  if(r.weaponHit==='haft')return` · the spearhead is off: ${D.name} fights on with the shaft`;
  if(r.weaponHit==='wrap')return r.disarm&&r.disarm.ok?'':` · weapon wrapped, ${D.name} kept hold, +10 tempo`;
  if(T.snare&&land)return` · ankle snared, yanked ${MOVES.snareYank}u in`;
  if(T.beard&&(land||r.out==='block'))return` · weapon hooked, +${MOVES.beardTempo} tempo${r.out==='block'?', no riposte':''}`;
  if(T.murder&&(land||r.out==='block'))return' · the crossguard dazes him';
  if(T.pinWall&&land&&D.wallPin)return' · pinned: no Withdraw or Sidestep next turn';
  if(T.backT)return` · still facing ${T.backT.name}`;
  if(T.recov)return' · balance +1';
  return'';}
// the log lines for a kick and a throw
function moveLog(li,e,tag){const r=e.res;
  const head=e.type==='kick'?`<span>kicks the ${PROP[e.P.type].name} at</span>${who(e.D)}<span class="out out-shove pending">Kick</span>`
    :`<span>throws a ${e.what==='mug'?'tankard':'bottle'} at</span>${who(e.D)}<span class="out out-shove pending">Throw</span>`;
  li.innerHTML=`<div class="lg-l">${tag}${who(e.A)}${head}</div>
    <div class="lg-roll">d20 <b>${r.roll}</b> ${modsText(r.mods)} = <b>${r.total}</b> vs ${r.dc}${defNote(r.defMods)}${r.crush?' · crushing':''}</div><div class="lg-perf">performing…</div>`;
  e.ex.li=li;}
function moveSettle(ex,out,cls,text){if(!ex||!ex.li)return;const o=ex.li.querySelector('.out');if(o){o.classList.remove('pending');o.className='out '+cls;o.textContent=out;}
  const p=ex.li.querySelector('.lg-perf');if(p)p.textContent=text;}
S.hooks.kick=(ex,i)=>{if(!ex)return;const D=ex.D,nm=PROP[i.P.type].name;
  if(i.void){moveSettle(ex,'Kick','out-dodge',`${D.name} was already down`);return;}
  moveSettle(ex,i.ok?(i.down?'Tripped':'Into his legs'):'Stepped past',i.ok?'out-shove':'out-dodge',
    i.ok?(i.down?`the ${nm} takes his legs: ${D.name} goes down`:`the ${nm} takes his legs: −${MOVES.kickFootHit} balance, +${MOVES.kickTempo} tempo`):`${D.name} steps past the ${nm}`);};
S.hooks.bottle=(ex,i)=>{if(!ex)return;const D=ex.D,w=i.what==='mug'?'tankard':'bottle';
  moveSettle(ex,i.ok?(D.dead?'Out':'Hit '+i.dmg):'Ducked',i.ok?'out-hit':'out-dodge',
    i.ok?`the ${w} ${i.what==='mug'?'bounces off':'breaks on'} his head${D.dead?'':': dazed'}`:`${D.name} ducks the ${w}`);};
// ===== MOVES UI END =====
