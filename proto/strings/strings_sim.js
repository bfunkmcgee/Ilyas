// The strings test's rules, headless: auto fights with Ilyas and the enemies playing strings, against the same fights on today's turn.
// It counts wins, turns and the strings (how long, how they end, the counters thrown, the turns he went all in) and stops on any error.
// usage (from the repo): node proto/strings/strings_sim.js [fights per setup, default 4] [off]   (off: today's turn, for comparison)
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..');process.chdir(ROOT);
const N=+(process.argv[2]||4),OFF=process.argv[3]==='off';
const core=require(path.join(ROOT,'sk_src.js'))()+fs.readFileSync(path.join(__dirname,'sk_strings.js'),'utf8');
eval(core+`
STR.on=!${OFF};
const R={fights:0,wins:0,turns:0,heroTurns:0,strings:0,moves:0,ends:{},counters:{hero:0,foe:0},allIn:0,blowsOnHero:0,heroHits:0,secs:0,byN:{}};
let curN=0;
S.hooks.strEnd=(A,why,rest)=>{if(A===hero()){R.ends[why]=(R.ends[why]||0)+1;}};
S.hooks.strStart=A=>{if(A===hero()){R.strings++;R.moves+=A.str.plan.length;if(A.overext)R.allIn++;}else{R.fs=(R.fs||0)+1;R.fm=(R.fm||0)+A.str.plan.length;}};
S.hooks.strCounter=o=>{if(o.f===hero())R.counters.hero++;else R.counters.foe++;};
{const la=launchAttack;launchAttack=function(A,D,kind,ex){const r=la.apply(this,arguments);if(D===hero()&&ex&&ex.res&&!ex.reactPending){R.blowsOnHero++;if(ex.res.out==='hit'||ex.res.out==='crit')R.heroHits++;}return r;};}
V11.turnStart.push(i=>{if(i===0)R.heroTurns++;});
S.hooks.over=w=>{if(w)R.wins++;const b=R.byN[curN]||(R.byN[curN]={fights:0,wins:0});b.fights++;if(w)b.wins++;};
const arenas=Object.keys(ARENAS);
for(const ak of arenas)for(const n of [1,2,3])for(let seed=1;seed<=${N};seed++){
  Math.random=mulberry32(seed*977+5);S.arenaKey=ak;S.cfg.n=n;S.cfg.ally.on=false;S.auto=true;S.tableOn=true;S.rng=mulberry32(seed*31+n);S.F=[];rosterBuild();initDuel();curN=n;
  let k=0;while(k<120*400&&S.game.phase!=='over'){simStep();tickOpening(DT);k++;}
  R.fights++;R.turns+=S.game.turnNo;R.secs+=k*DT;}
const r1=x=>+x.toFixed(2);
console.log(JSON.stringify({strings:STR.on,fights:R.fights,winPct:Math.round(R.wins/R.fights*100),byN:Object.fromEntries(Object.entries(R.byN).map(([n,b])=>[n,Math.round(b.wins/b.fights*100)+'%'])),
  turnsPerFight:r1(R.turns/R.fights),heroTurnsPerFight:r1(R.heroTurns/R.fights),secsPerFight:r1(R.secs/R.fights),
  movesPerString:R.strings?r1(R.moves/R.strings):0,foeMovesPerString:R.fs?r1(R.fm/R.fs):0,allInPct:R.strings?Math.round(R.allIn/R.strings*100):0,ends:R.ends,
  countersPerFight:{hero:r1(R.counters.hero/R.fights),foe:r1(R.counters.foe/R.fights)},blowsOnHeroPerTurn:r1(R.blowsOnHero/Math.max(1,R.heroTurns)),blowsLandPct:Math.round(R.heroHits/Math.max(1,R.blowsOnHero)*100)}));
`);
