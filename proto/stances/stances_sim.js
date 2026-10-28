// The test's rules, headless: auto fights over six arenas and one to three enemies (or a crew), with the two rules on or off, and Ilyas
// playing the stances by a policy. It counts wins, how close the fights are, the turns spent on the floor and getting up, the free
// rises and the blows on the floor, and how each stance is used, and stops on any error. motion: the game's motion (V67) as it comes
// in these fights: each blow's variant by who throws it and in which stance, the combos, and how Ilyas's answers are acted out.
// usage (from the repo): node proto/stances/stances_sim.js [fights per setup, default 4] [key=value ...]
//   down=1|0  rise=off|committed  stance=1|0  policy=match|bound|unbound|close|worst|weapon  jam=2 crowdafter=0  mix=mixed|brute|keeper|rusher|swords  temper=brute|keeper|rusher|plain (all foes)  spells=1|0 (the new spells and Overdrive)  nospell=edge,ward,glare,line,overdrive (any left out)  crew=0|1  n=1,2,3
//   step= (how often Ilyas on auto steps back to put a man who holds off on the whip's tip), tip= (where the tip starts)
//   policy=weapon: the first test's match, on the weapon and the crowd alone (match reads the range and the blow he shows too)
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..');process.chdir(ROOT);
const N=+(process.argv[2]||4),O={down:'1',rise:'off',stance:'1',policy:'match',mix:'mixed',crew:'0',n:'1,2,3',spells:'1'};
for(const a of process.argv.slice(3)){const m=a.match(/^(\w+)=(.*)$/);if(m)O[m[1]]=m[2];}
const core=require(path.join(ROOT,'sk_src.js'))()+fs.readFileSync(path.join(__dirname,'sk_downfork.js'),'utf8')+fs.readFileSync(path.join(__dirname,'sk_stances.js'),'utf8')+fs.readFileSync(path.join(__dirname,'sk_spells.js'),'utf8')+fs.readFileSync(path.join(__dirname,'sk_stnmotion.js'),'utf8');
eval(core+`
const O=${JSON.stringify(O)};
DOWNF.on=O.down==='1';DOWNF.rise=O.rise;STANCE.on=O.stance==='1';STANCE.policy=O.policy;if(O.step!=null)WHIP_AI.step=+O.step;if(O.tip!=null)STN.tip=+O.tip;if(O.jam!=null)STN_W.jam=+O.jam;if(O.crowdafter!=null)STN_W.crowdAfter=O.crowdafter==='1';SPELL2.on=O.spells!=='0';if(O.nospell)SPELL2.off=O.nospell.split(',');
const MIX={mixed:null,brute:{weapon:'axe',temper:'brute'},keeper:{weapon:'spear',temper:'keeper'},rusher:{weapon:'dagger',temper:'rusher'},swords:{weapon:'sword'}};
const inc=(o,k,n=1)=>{o[k]=(o[k]||0)+n;};
const R={fights:0,wins:0,hp:0,secs:0,turns:0,heroTurns:0,foeTurns:0,foeFloorTurns:0,heroFloorTurns:0,rises:{hero:0,foe:0},struck:{hero:0,foe:0},crewOut:0,downs:{hero:0,foe:0},
  stance:{},tech:{},land:{n:0,h:0},byN:{},blowsOnHero:0,heroHits:0,dmgOnHero:0,close:{under30:0,over70:0},ans:{for:0,against:0,none:0},spell:{},spellOut:{},odHp:0};
let curN=0;
S.hooks.over=w=>{if(w)R.wins++;const b=R.byN[curN]||(R.byN[curN]={f:0,w:0,hp:0});b.f++;if(w)b.w++;b.hp+=hero().hp/hero().maxHp;};
S.hooks.freeRise=F=>{R.rises[F===hero()?'hero':'foe']++;};
S.hooks.downStruck=D=>{R.struck[D===hero()?'hero':'foe']++;};
{const kd=knockDown;knockDown=function(D){const was=D.downed;kd.apply(this,arguments);if(!was&&!D.dead)R.downs[D===hero()?'hero':'foe']++;};}
V11.kill.push(D=>{if(D.hench&&D.downed)R.crewOut++;});
{const cm=command;command=function(i,c){const A=S.F[i];const ok=cm.apply(this,arguments);if(!ok)return ok;
  if(A.team===1){R.foeTurns++;if(c==='getup'||c==='roll')R.foeFloorTurns++;}
  else if(A===hero()){if(c==='getup'||c==='roll')R.heroFloorTurns++;if(ATTACKS.includes(c)){inc(R.stance,stanceOf(A)||'off');}if(SPELLS[c])inc(R.spell,c);}
  return ok;};}
{const la=launchAttack;launchAttack=function(A,D,kind,ex){const r=la.apply(this,arguments);
  if(ex&&ex.res&&!ex.reactPending){const o=ex.res.out,land=o==='hit'||o==='crit';
    if(A===hero()){R.land.n++;if(land)R.land.h++;const T=ex.res.tech;if(T)inc(R.tech,(T.stance?T.stance+':':'')+T.name);}
    if(D===hero()&&A.team===1){R.blowsOnHero++;if(land){R.heroHits++;R.dmgOnHero+=ex.res.dmg||0;}
      const st=stanceOf(D),a=st&&ex.res.tech?stnAnswer(st,kind,ex.res.tech,A,cameFar(A,D)):null;R.ans[!a?'none':a[1]>0?'for':'against']++;}}
  return r;};}
V11.turnStart.push(i=>{R.turns++;if(i===0)R.heroTurns++;});
// the new spells: the edge lit, the wards, Overdrive and what the spells did
{const le=lightEdge;lightEdge=function(A){const r=le.apply(this,arguments);if(r)inc(R.spell,'edge');return r;};}
{const ar=applyReaction;applyReaction=function(D,k,A){if(k==='ward'&&D===hero())inc(R.spell,'ward');return ar.apply(this,arguments);};}
S.hooks.overdrive=(A,hp)=>{inc(R.spell,'overdrive');R.odHp+=hp;};
S.hooks.spell2=(ex,i)=>{inc(R.spellOut,ex.cmd+': '+i.label);};
// the motion: variants, combos and the answers acted out (animation only: none of it reads or throws the game's dice)
const MO={variant:{},combo:{hero:0,heroOK:0,foe:0,foeOK:0},react:{},planDice:0};
{const bv=blowVariant;blowVariant=function(A,D,kind){const V=bv.apply(this,arguments);if(A===hero()||D===hero())inc(MO.variant,(A===hero()?(stanceOf(A)||'off'):'on him')+' '+kind+':'+(V?V.key:'none'));return V;};}
{const bc=blowCombo;blowCombo=function(A,D){const L=bc.apply(this,arguments),n=L&&L.length?1:0;if(A===hero()){MO.combo.heroOK++;MO.combo.hero+=n;}else if(D===hero()){MO.combo.foeOK++;MO.combo.foe+=n;}return L;};}
{const pr=planReaction;planReaction=function(D,A,kind,res){const r=pr.apply(this,arguments);if(D!==hero()||!res)return r;const ans=D.react||null,o=res.out;let t;
  if(r&&r.stn)t='answer: '+r.stn;else if(o==='block')t=D.counter?'counter':ans==='turn'?'turn him':D.skill>=RANK.expert?'parry, bind':'parry';
  else if(o==='dodge'||o==='fumble')t=o==='dodge'&&kind==='sweep'&&ans==='back'?'hop over':o==='dodge'&&(ans==='parry'||ans==='counter')?'beat aside':r.slip!=null?'slip':'step back';
  else if(['parry','counter','turn','slip','back'].includes(ans))t='late '+ans;else t=o==='hit'||o==='crit'?'takes it':o;
  inc(MO.react,(stanceOf(D)||'off')+' '+t);return r;};}
// the game's dice thrown while a blow is planned (the motion's own are the animation's: this stays 0)
{const pa=planAttack;planAttack=function(){const mr=Math.random,sr=S.rng;let n=0;Math.random=()=>{n++;return mr();};S.rng=()=>{n++;return sr();};
  try{return pa.apply(this,arguments);}finally{Math.random=mr;S.rng=sr;MO.planDice+=n;}};}
const arenas=Object.keys(ARENAS),ns=O.crew==='1'?[1]:O.n.split(',').map(Number);
for(const ak of arenas)for(const n of ns)for(let seed=1;seed<=${N};seed++){
  Math.random=mulberry32(seed*977+5);S.arenaKey=ak;S.cfg.n=n;S.cfg.crew=O.crew==='1';S.cfg.ally.on=false;S.auto=true;S.tableOn=true;S.rng=mulberry32(seed*31+n);
  const base=[{seed:5113,weapon:'axe',skill:3,temper:'brute'},{seed:7741,weapon:'spear',skill:2,temper:'keeper'},{seed:3190,weapon:'dagger',skill:2,temper:'rusher'}];
  S.cfg.foes=base.map(f=>MIX[O.mix]?{...f,...MIX[O.mix]}:f).map(f=>O.temper?{...f,temper:O.temper}:f);
  S.F=[];rosterBuild();initDuel();curN=n;
  let k=0;while(k<120*500&&S.game.phase!=='over'){simStep();tickOpening(DT);k++;}
  R.fights++;R.secs+=k*DT;const K=hero();R.hp+=K.hp/K.maxHp;if(!K.dead&&K.hp/K.maxHp<.3)R.close.under30++;if(!K.dead&&K.hp/K.maxHp>.7)R.close.over70++;}
const r1=x=>+x.toFixed(2),pc=x=>Math.round(x*100);
const share=o=>{const t=Object.values(o).reduce((s,x)=>s+x,0)||1;return Object.fromEntries(Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,14).map(([k,v])=>[k,pc(v/t)]));};
console.log(JSON.stringify({opts:O,fights:R.fights,winPct:pc(R.wins/R.fights),byN:Object.fromEntries(Object.entries(R.byN).map(([n,b])=>[n,pc(b.w/b.f)+'% hp'+pc(b.hp/b.f)])),
  hpLeftPct:pc(R.hp/R.fights),wonUnder30Pct:pc(R.close.under30/R.fights),wonOver70Pct:pc(R.close.over70/R.fights),secsPerFight:r1(R.secs/R.fights),heroTurnsPerFight:r1(R.heroTurns/R.fights),
  foeFloorTurnPct:pc(R.foeFloorTurns/Math.max(1,R.foeTurns)),heroFloorTurnsPerFight:r1(R.heroFloorTurns/R.fights),downsPerFight:{hero:r1(R.downs.hero/R.fights),foe:r1(R.downs.foe/R.fights)},
  freeRisesPerFight:{hero:r1(R.rises.hero/R.fights),foe:r1(R.rises.foe/R.fights)},struckOnFloorPerFight:{hero:r1(R.struck.hero/R.fights),foe:r1(R.struck.foe/R.fights)},crewOutPerFight:r1(R.crewOut/R.fights),
  heroLandPct:pc(R.land.h/Math.max(1,R.land.n)),blowsOnHeroPerTurn:r1(R.blowsOnHero/Math.max(1,R.heroTurns)),dmgOnHeroPerFight:r1(R.dmgOnHero/R.fights),stanceUse:share(R.stance),answered:share(R.ans),spellsPerFight:Object.fromEntries(Object.entries(R.spell).map(([k,v])=>[k,r1(v/R.fights)])),spellOut:R.spellOut,overdriveHpPerFight:r1(R.odHp/R.fights),heroTech:share(R.tech),
  motion:{variants:Object.fromEntries(Object.entries(MO.variant).sort()),combos:MO.combo,answers:Object.fromEntries(Object.entries(MO.react).sort()),planDice:MO.planDice}}));
`);
