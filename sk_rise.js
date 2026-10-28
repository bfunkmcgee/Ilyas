// ===== THE FREE RISE START =====
// (since V70, tried first in the stance and rise test) Down is a fork, not a loop. A fighter knocked down stays down until the start
// of his own next turn, and then he rises free: no Get up, no tempo spent, straight into his turn, Off balance (DOWNF.rise
// 'committed': three pips, as Get up gives). Struck on the floor (a blow that lands on him while he is down) it goes the other way: a
// crew man is out (the blow kills him, with the finisher his weapon and the blow suit), and anyone else, a named elf or Ilyas, takes
// the blow and loses the free rise, so his next turn goes on Get up or Roll as a fall's did before. A stage that spares everyone
// (st.spare, sk_pit6.js) keeps its crew men alive. DOWNF.on false is the old rule.
const DOWNF={on:true,rise:'off'};
// a fighter who will rise free at the start of his turn
function freeRiseOK(f){return DOWNF.on&&!!f&&f.downed&&!f.dead&&!f.npc&&!f.noRise&&!f.clinch&&!f.carry;}
// standing up by any means clears the mark
{const su=standUp;standUp=function(D){su.apply(this,arguments);if(D)D.noRise=false;};}
V11.duelStart.push(()=>{for(const f of S.F)f.noRise=false;S._riseCont=null;S._riseTurnNo=null;});

// ---------- struck on the floor ----------
// a crew man does not get up from it: the blow is made a killing one before the motion is planned, so the finisher plays
{const ra=resolveAttack;resolveAttack=function(A,D,kind,opening,T){const r=ra.apply(this,arguments);
  if(DOWNF.on&&A&&D&&D.downed&&!D.dead&&D.hench&&A.team!==D.team&&(r.out==='hit'||r.out==='crit')&&!r.weaponHit&&r.dmg<D.hp&&
    !(typeof act1Spare==='function'&&act1Spare(D))){r.dmg=D.hp;
    if(r.tech&&!r.tech.fin){const F=pickFinisher(A,D,kind,r.tech);if(F)r.tech={...r.tech,fin:F,anchor:F.anchor||r.tech.anchor,ang:F.ang||r.tech.ang,knock:(r.tech.knock||1)*F.knock};}}
  return r;};}
// anyone else takes the blow and loses the free rise
{const ai=applyImpact;applyImpact=function(ex,A,D,res){const was=!!(D&&D.downed&&!D.dead);const r=ai.apply(this,arguments);
  if(DOWNF.on&&was&&!D.dead&&D.downed&&res&&(res.out==='hit'||res.out==='crit')&&!res.weaponHit&&!D.noRise){D.noRise=true;
    popup(D,'No free rise','#ff9a7a','struck on the floor',17,-62);if(S.hooks.downStruck)S.hooks.downStruck(D,A);}
  return r;};}
// Kael's stab on the way past a man on the floor counts the same (a crew man never gets up from it already)
{const is=insuranceStab;insuranceStab=function(I){const r=is.apply(this,arguments);if(r&&DOWNF.on&&I&&I.E&&!I.E.dead&&I.E.downed)I.E.noRise=true;return r;};}

// ---------- the free rise ----------
// At the start of his turn he gets up as an exchange of its own that costs nothing; when it ends the same turn goes on (the turn's
// own start, its balance coming back and the rest, has already happened once and does not happen again).
{const st=startTurn;startTurn=function(i){
  if(S._riseCont!=null){const F=S.F[S._riseCont];S._riseCont=null;if(F&&!F.dead&&!F.downed){riseContinue(F);return;}}
  st.apply(this,arguments);
  const F=S.F[i],g=S.game;if(!freeRiseOK(F)||g.active!==i||g.phase!=='input')return;
  g.phase='exchange';g.aiAt=null;F.intent=null;F.lastAct='getup';
  const D=targetOf(F),ex={A:F,D,t0:S.t,cmd:'getup',perf:{},depth:0,rise:true},plan=planGetUp(F);g.ex=ex;ex.plan=plan;ex.dur=plan.Tend;
  popup(F,'Rises','#cfe3ff',DOWNF.rise==='off'?'off balance':'committed',18,-44);
  if(S.hooks.freeRise)S.hooks.freeRise(F);
  S.hooks.log({type:'getup',A:F,D,ex,free:true});S.hooks.status();};}
{const fe=finishExchange;finishExchange=function(){const ex=S.game.ex;
  if(ex&&ex.rise&&ex.A&&!ex.A.dead){S._riseCont=ex.A.idx;S._riseTurnNo=S.game.turnNo;}
  try{return fe.apply(this,arguments);}finally{if(S._riseCont!=null&&S.game.phase!=='input'){S._riseCont=null;S._riseTurnNo=null;}}};}
function riseContinue(F){const g=S.game;if(S._riseTurnNo!=null){g.turnNo=S._riseTurnNo;S._riseTurnNo=null;}
  if(DOWNF.rise==='off')F.foot=Math.min(F.foot,1);else F.foot=Math.max(F.foot,FOOT_RISE);
  resolveStations();const t=targetOf(F);if(t&&!F.clinch)faceToward(F,t.station);
  g.active=F.idx;g.phase='input';ensureIntents();g.aiAt=isAI(F.idx)?S.t+.35:null;S.hooks.turn(F.idx);S.hooks.status();}
// ===== THE FREE RISE END =====
