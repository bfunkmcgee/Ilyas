// The test's rules, headless: auto fights over six arenas and one to three enemies (or a crew), with the two rules on or off, and Ilyas
// playing the stances by a policy. It counts wins, how close the fights are, the turns spent on the floor and getting up, the free
// rises and the blows on the floor, and how each stance is used, and stops on any error.
// usage (from the repo): node proto/stances/stances_sim.js [fights per setup, default 4] [key=value ...]
//   down=1|0  rise=off|committed  stance=1|0  policy=match|bound|unbound|close|worst|weapon  jam=2  mix=mixed|brute|keeper|rusher  crew=0|1  n=1,2,3
//   step= (how often Ilyas on auto steps back to put a man who holds off on the whip's tip), tip= (where the tip starts)
//   policy=weapon: the first test's match, on the weapon and the crowd alone (match reads the range and the blow he shows too)
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..');process.chdir(ROOT);
const N=+(process.argv[2]||4),O={down:'1',rise:'off',stance:'1',policy:'match',mix:'mixed',crew:'0',n:'1,2,3'};
for(const a of process.argv.slice(3)){const m=a.match(/^(\w+)=(.*)$/);if(m)O[m[1]]=m[2];}
const core=require(path.join(ROOT,'sk_src.js'))()+fs.readFileSync(path.join(__dirname,'sk_downfork.js'),'utf8')+fs.readFileSync(path.join(__dirname,'sk_stances.js'),'utf8');
eval(core+`
const O=${JSON.stringify(O)};
DOWNF.on=O.down==='1';DOWNF.rise=O.rise;STANCE.on=O.stance==='1';STANCE.policy=O.policy;if(O.step!=null)WHIP_AI.step=+O.step;if(O.tip!=null)STN.tip=+O.tip;if(O.jam!=null)STN_W.jam=+O.jam;
const MIX={mixed:null,brute:{weapon:'axe',temper:'brute'},keeper:{weapon:'spear',temper:'keeper'},rusher:{weapon:'dagger',temper:'rusher'}};
const inc=(o,k,n=1)=>{o[k]=(o[k]||0)+n;};
const R={fights:0,wins:0,hp:0,secs:0,turns:0,heroTurns:0,foeTurns:0,foeFloorTurns:0,heroFloorTurns:0,rises:{hero:0,foe:0},struck:{hero:0,foe:0},crewOut:0,downs:{hero:0,foe:0},
  stance:{},tech:{},land:{n:0,h:0},byN:{},blowsOnHero:0,heroHits:0,dmgOnHero:0,close:{under30:0,over70:0},ans:{for:0,against:0,none:0}};
let curN=0;
S.hooks.over=w=>{if(w)R.wins++;const b=R.byN[curN]||(R.byN[curN]={f:0,w:0,hp:0});b.f++;if(w)b.w++;b.hp+=hero().hp/hero().maxHp;};
S.hooks.freeRise=F=>{R.rises[F===hero()?'hero':'foe']++;};
S.hooks.downStruck=D=>{R.struck[D===hero()?'hero':'foe']++;};
{const kd=knockDown;knockDown=function(D){const was=D.downed;kd.apply(this,arguments);if(!was&&!D.dead)R.downs[D===hero()?'hero':'foe']++;};}
V11.kill.push(D=>{if(D.hench&&D.downed)R.crewOut++;});
{const cm=command;command=function(i,c){const A=S.F[i];const ok=cm.apply(this,arguments);if(!ok)return ok;
  if(A.team===1){R.foeTurns++;if(c==='getup'||c==='roll')R.foeFloorTurns++;}
  else if(A===hero()){if(c==='getup'||c==='roll')R.heroFloorTurns++;if(ATTACKS.includes(c)){inc(R.stance,stanceOf(A)||'off');}}
  return ok;};}
{const la=launchAttack;launchAttack=function(A,D,kind,ex){const r=la.apply(this,arguments);
  if(ex&&ex.res&&!ex.reactPending){const o=ex.res.out,land=o==='hit'||o==='crit';
    if(A===hero()){R.land.n++;if(land)R.land.h++;const T=ex.res.tech;if(T)inc(R.tech,(T.stance?T.stance+':':'')+T.name);}
    if(D===hero()&&A.team===1){R.blowsOnHero++;if(land){R.heroHits++;R.dmgOnHero+=ex.res.dmg||0;}
      const st=stanceOf(D),a=st&&ex.res.tech?stnAnswer(st,kind,ex.res.tech,A,cameFar(A,D)):null;R.ans[!a?'none':a[1]>0?'for':'against']++;}}
  return r;};}
V11.turnStart.push(i=>{R.turns++;if(i===0)R.heroTurns++;});
const arenas=Object.keys(ARENAS),ns=O.crew==='1'?[1]:O.n.split(',').map(Number);
for(const ak of arenas)for(const n of ns)for(let seed=1;seed<=${N};seed++){
  Math.random=mulberry32(seed*977+5);S.arenaKey=ak;S.cfg.n=n;S.cfg.crew=O.crew==='1';S.cfg.ally.on=false;S.auto=true;S.tableOn=true;S.rng=mulberry32(seed*31+n);
  const base=[{seed:5113,weapon:'axe',skill:3,temper:'brute'},{seed:7741,weapon:'spear',skill:2,temper:'keeper'},{seed:3190,weapon:'dagger',skill:2,temper:'rusher'}];
  S.cfg.foes=base.map(f=>MIX[O.mix]?{...f,...MIX[O.mix]}:f);
  S.F=[];rosterBuild();initDuel();curN=n;
  let k=0;while(k<120*500&&S.game.phase!=='over'){simStep();tickOpening(DT);k++;}
  R.fights++;R.secs+=k*DT;const K=hero();R.hp+=K.hp/K.maxHp;if(!K.dead&&K.hp/K.maxHp<.3)R.close.under30++;if(!K.dead&&K.hp/K.maxHp>.7)R.close.over70++;}
const r1=x=>+x.toFixed(2),pc=x=>Math.round(x*100);
const share=o=>{const t=Object.values(o).reduce((s,x)=>s+x,0)||1;return Object.fromEntries(Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,14).map(([k,v])=>[k,pc(v/t)]));};
console.log(JSON.stringify({opts:O,fights:R.fights,winPct:pc(R.wins/R.fights),byN:Object.fromEntries(Object.entries(R.byN).map(([n,b])=>[n,pc(b.w/b.f)+'% hp'+pc(b.hp/b.f)])),
  hpLeftPct:pc(R.hp/R.fights),wonUnder30Pct:pc(R.close.under30/R.fights),wonOver70Pct:pc(R.close.over70/R.fights),secsPerFight:r1(R.secs/R.fights),heroTurnsPerFight:r1(R.heroTurns/R.fights),
  foeFloorTurnPct:pc(R.foeFloorTurns/Math.max(1,R.foeTurns)),heroFloorTurnsPerFight:r1(R.heroFloorTurns/R.fights),downsPerFight:{hero:r1(R.downs.hero/R.fights),foe:r1(R.downs.foe/R.fights)},
  freeRisesPerFight:{hero:r1(R.rises.hero/R.fights),foe:r1(R.rises.foe/R.fights)},struckOnFloorPerFight:{hero:r1(R.struck.hero/R.fights),foe:r1(R.struck.foe/R.fights)},crewOutPerFight:r1(R.crewOut/R.fights),
  heroLandPct:pc(R.land.h/Math.max(1,R.land.n)),blowsOnHeroPerTurn:r1(R.blowsOnHero/Math.max(1,R.heroTurns)),dmgOnHeroPerFight:r1(R.dmgOnHero/R.fights),stanceUse:share(R.stance),answered:share(R.ans),heroTech:share(R.tech)}));
`);
