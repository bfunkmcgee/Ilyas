const fs=require('fs');
const core=require('./sk_src.js')(process.argv[2]);
eval(core+`
const tot={outcomes:{},cmds:{},techs:{},contact:0,contactN:0,sidesteps:0,slips:0,angleUse:0,offLineUse:0,backAttacks:0,around:0,vault:0,vaultTable:[],
  guardBreaks:0,binds:0,brawl:{},braces:0,wins:{hero:0,foes:0},timeouts:0,stuck:0,maxTurns:0,posture:{set:0,committed:0,off:0},sideViol:0,laneOut:0,inside:0,kds:0,overlap:0};
const problems=[];
const ALLY=process.argv[3]==='ally';tot.team={};
// (each run rolls its own dice, the game's handle and Math.random both, so a run comes out the same every time it is run)
function run(ak,n,seed,steps){
  Math.random=mulberry32(seed*977+5);
  S.arenaKey=ak;S.cfg.n=n;S.auto=true;S.tableOn=true;S.rng=mulberry32(seed);S.cfg.ally={on:ALLY,seed:6427,weapon:['spear','sword','axe','dagger'][seed%4],skill:3};S.F=[];rosterBuild();
  S.hooks.log=e=>{tot.cmds[e.type+(e.ex&&e.ex.cmd?':'+e.ex.cmd:'')]=(tot.cmds[e.type+(e.ex&&e.ex.cmd?':'+e.ex.cmd:'')]||0)+1;
    if(e.type==='attack'){const r=e.res;tot.outcomes[r.out]=(tot.outcomes[r.out]||0)+1;tot.techs[r.tech.name]=(tot.techs[r.tech.name]||0)+1;
      for(const m of r.mods){if(m[0]==='angle'&&m[1])tot.angleUse++;if(m[0]==='off line'&&m[1])tot.offLineUse++;if(m[0]==='from behind'&&m[1])tot.backAttacks++;}
      if(r.guardBreak)tot.guardBreaks++;if(r.tech.around!=null)tot.around++;if(r.tech.vault)tot.vault++;if(r.kd)tot.kds++;}
    if(e.type==='sidestep')tot.sidesteps++;if(e.type==='bind')tot.binds++;
    if(e.A&&e.A.ally)tot.team['mara:'+e.type+(e.ex&&e.ex.chain?':'+e.ex.chain:'')]=(tot.team['mara:'+e.type+(e.ex&&e.ex.chain?':'+e.ex.chain:'')]||0)+1;
    if(e.ex&&e.ex.chain==='gang'&&e.A.team===0)tot.team.tandem=(tot.team.tandem||0)+1;
    if(e.ex&&e.ex.covered)tot.team.intercept=(tot.team.intercept||0)+1;
    if(e.type==='attack'&&e.res.tech.stab)tot.team['stab:'+e.res.out]=(tot.team['stab:'+e.res.out]||0)+1;
    if(e.A&&e.A.team===1&&e.D&&e.D.ally)tot.team.foeOnMara=(tot.team.foeOnMara||0)+1;};
  S.hooks.helped=()=>{tot.team.helped=(tot.team.helped||0)+1;};
  S.hooks.perf=ex=>{if(ex.plan.slip!=null)tot.slips++;if(['hit','crit','block'].includes(ex.res.out)){tot.contactN++;const sg=ex.plan.contactSeg();if(segDist(ex.plan.Cfn(),sg[0],sg[1])<15)tot.contact++;}};
  S.hooks.shove=(ex,i)=>{if(i&&!i.ok)tot.braces++;};
  S.hooks.turn=i=>{tot.posture[S.F[i].posture]++;
    const K=S.F[0];for(const f of S.F){if(f.dead)continue;if(f.lane<DEP_MIN-1||f.lane>DEP_MAX+1)tot.laneOut++;
      if(f.team===1&&!K.dead&&!f.downed&&!K.downed&&!f.clinch&&!K.clinch&&(f.station-K.station)*f.side<20)tot.sideViol++;
      if(tableIntact()&&Math.abs(f.lane-S.table.dep)<TD+10){const b=tableBox();if(f.station>b.l-8&&f.station<b.r+8)tot.inside++;}}
    const fs=S.F.filter(f=>!f.dead&&!f.downed);for(let a=0;a<fs.length;a++)for(let b=a+1;b<fs.length;b++)if(Math.abs(fs[a].lane-fs[b].lane)<16&&Math.abs(fs[a].station-fs[b].station)<30)tot.overlap++;};
  for(const k of ['grab','throwLand','breakfree','pickup','wound'])S.hooks[k]=(ex,i)=>{const key=k+(i&&i.ok===false?':fail':i&&i.label?':'+i.label.split(' ')[0]:'');tot.brawl[key]=(tot.brawl[key]||0)+1;};
  S.hooks.over=heroWon=>{if(heroWon)tot.wins.hero++;else tot.wins.foes++;};
  initDuel();
  let n2=0,lastEx=null,lastChange=0;
  while(n2<steps&&S.game.phase!=='over'){
    simStep();tickOpening(DT*3);n2++;
    for(const f of S.F){for(const q of f.p)if(!Number.isFinite(q.x+q.y)){problems.push(ak+' NaN '+f.name);n2=steps;break;}
      if(!Number.isFinite(f.dep)){problems.push(ak+' NaN dep');n2=steps;}
      if(f.p[PEL].x<0||f.p[PEL].x>W||f.p[HEAD].y<20)problems.push(ak+' out of bounds '+f.name);}
    if(S.game.ex!==lastEx){if(lastEx&&lastEx.plan&&lastEx.plan.vault&&lastEx.res)tot.vaultTable.push(lastEx.A.skill+':'+(tableIntact()?'ok':S.table&&S.table.state));lastEx=S.game.ex;lastChange=n2;}
    if(n2-lastChange>120*14&&S.game.phase==='exchange'){problems.push(ak+' n'+n+' stuck cmd='+S.game.ex.cmd+' dur='+S.game.ex.dur.toFixed(1)+' motors='+S.F.map(f=>f.motor.toFixed(2)));tot.stuck++;break;}
  }
  if(S.game.phase!=='over')tot.timeouts++;
  tot.maxTurns=Math.max(tot.maxTurns,S.game.turnNo);
  for(const f of S.F)if(f.ally&&f.dead)tot.team.maraDied=(tot.team.maraDied||0)+1;
  return{phase:S.game.phase,t:(n2*DT).toFixed(0),turns:S.game.turnNo,hp:S.F.map(f=>f.hp).join('/'),table:S.table?S.table.state:'-',wall:S.wall?S.wall.state:'-'};
}
const rows=[];
for(const ak of Object.keys(ARENAS))for(const n of [1,2,3])for(const seed of [1,2,3]){
  const r=run(ak,n,seed*31+n,120*400);rows.push((ak.padEnd(6)+' 1v'+n+' s'+seed+': '+r.phase+' t='+r.t+'s turns='+r.turns+' hp '+r.hp+' table '+r.table+' wall '+r.wall));}
console.log(rows.join('\\n'));
const {techs,...rest}=tot;console.log(JSON.stringify(rest));
console.log('techs:',Object.entries(techs).sort((a,b)=>b[1]-a[1]).slice(0,40).map(([k,v])=>k+' '+v).join(', '));
console.log('problems',[...new Set(problems)].slice(0,12));
`);
