// ===== STYLE LAB (test) START =====
// The style trial's stage: one blow at a time, the same blow in each style. Kael with the arc-blade, in the style picked, and a
// master swordsman on the street a short step away; the blow's outcome is forced (it lands, he blocks it, or he slips it) the way
// the checks force one (the d20 that gives it is the one thrown), the swordsman cannot be put down and never takes his turn, and the
// dice are seeded for each blow, so the same blow can be watched again and again and in each style. The lab's own fights play with
// Kael in the style picked. Nothing here changes the game for anyone but Kael on this page.
const SLAB={style:null,force:null,on:false,kind:'slash',out:'hit',flourish:false,gap:24,seed:11};
// Kael's style: 'regular', 'tactical' (the Sareth cut, his own) or 'wire' (the Wire drill); null keeps his own
{const d=Object.getOwnPropertyDescriptor(Fighter.prototype,'animStyle');
  Object.defineProperty(Fighter.prototype,'animStyle',{configurable:true,
    get(){return SLAB.style&&this===S.F[0]&&this._anim===undefined?SLAB.style:d.get.call(this);},set(v){d.set.call(this,v);}});}
// the forced outcome
{const ra=resolveAttack;resolveAttack=function(A,D,kind,op,T){const want=SLAB.force;if(!want||!A||A!==S.F[0])return ra.apply(this,arguments);
  SLAB.force=null;T=T||pickTechnique(A,D,kind);const c=computeMods(A,D,kind,op,T);let pick=null;
  for(let v=2;v<=19;v++)if(outcomeOf(v,v+c.bonus,c.def)===want){pick=v;break;}
  if(pick==null)return ra.call(this,A,D,kind,op,T);
  const save=S.rng;let first=true;S.rng=()=>{if(first){first=false;return(pick-.5)/20;}return save();};
  try{return ra.call(this,A,D,kind,op,T);}finally{S.rng=save;}};}
// on the stage his flourishes (an expert's spin) come when they are asked for, and not otherwise
{const sr=styleRoll;styleRoll=function(A,kind){if(SLAB.on&&A===S.F[0])return SLAB.flourish?0:1;return sr.apply(this,arguments);};}
// the stage: a fresh duel, the two of them set in one line
function slabStage(){
  let a=SLAB.seed;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
  S.arenaKey='street';S.cfg.n=1;S.cfg.crew=false;S.cfg.ally.on=false;S.introOn=false;S.auto=false;S.tableOn=false;S.divOn=false;S.showcase=false;
  S.cfg.hero={...S.cfg.hero,weapon:'elven'};S.cfg.foes[0]={...S.cfg.foes[0],weapon:'sword',skill:5,temper:'keeper'};
  S.F=[];rosterBuild();restart();
  const K=S.F[0],D=S.F[1];if(!K||!D)return null;
  D.maxHp=D.hp=999;D.ready=1e6;K.ready=0;
  const z=92,x=330;slabPut(K,x,z,1);slabPut(D,x+engageGap(K,D)+SLAB.gap,z,-1);
  slabHold();warm(90);slabHold();
  return{K,D};}
function slabPut(f,x,z,fa){f.station=x;f.lane=z;f.dep=z;f.stepDep=z;f.vdep=0;f.facing=fa;f.build();}
function slabHold(){const g=S.game;g.phase='input';g.active=0;g.aiAt=null;S.opening=null;g.ex=null;for(const f of S.F){f.foot=footMaxOf(f);f.intent=null;}}
// one blow: kind 'slash' | 'thrust' | 'overhead' | 'sweep', out 'hit' | 'block' | 'dodge'
function slabBlow(kind,out){SLAB.on=true;const st=slabStage();if(!st)return false;SLAB.kind=kind;SLAB.out=out;
  SLAB.force=out;const ok=command(0,kind);if(!ok)SLAB.force=null;return ok;}
// while the stage is up the swordsman answers the blow (he blocks it or slips it as it was forced) but never strikes back: no opening
// is his, and his turn never comes; a choice the blow opens for Kael is let go
{const co=considerOpening;considerOpening=function(ex,f,opp,src){if(SLAB.on&&f===S.F[1])return;return co.apply(this,arguments);};}
V11.turnStart.push(i=>{if(SLAB.on&&i===1&&S.F[1])S.F[1].ready=1e6;});
V11.step.push(()=>{if(SLAB.on&&S.opening&&S.opening.f===S.F[0]&&!S.warming)resolveOpening('hold');});
// ===== STYLE LAB (test) END =====
