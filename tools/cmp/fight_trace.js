// one auto fight, traced: every attack with its answer and outcome, every break and opening, HP and balance after each turn.
// usage: node tools/cmp/fight_trace.js <arena> <n foes> <seed> [core file]
const [,,AK='street',N='2',SEED='1',CF]=process.argv;
const core=require('../../sk_src.js')(CF);
process.chdir(__dirname+'/../..');
eval(core+`
const L=[];const nm=f=>f?f.name:'-';const bal=()=>S.F.filter(f=>!f.npc).map(f=>nm(f)+' '+f.hp+'hp '+f.foot+'/'+footMaxOf(f)+(f.broken?'B':'')+(f.downed?'D':'')+(f.dead?'X':'')).join(' | ');
S.hooks.react=(D,A,k)=>L.push('    '+nm(D)+' answers '+nm(A)+' with '+k);
S.hooks.broken=(D,by)=>L.push('    ** '+nm(D)+' BROKEN by '+nm(by));
S.hooks.log=e=>{if(e.type==='attack'&&e.res)L.push('  '+nm(e.A)+' '+e.res.kind+(e.res.tech?' ('+e.res.tech.name+')':'')+' on '+nm(e.D)+(e.ex&&e.ex.chain?' ['+e.ex.chain+']':'')+': '+e.res.out+(e.res.dmg?' '+e.res.dmg:'')+' d20 '+e.res.roll+' tot '+e.res.total+' vs '+e.res.def+' '+JSON.stringify((e.res.defMods||[]).filter(m=>m[1]))) ;else if(e.type)L.push('  '+nm(e.A)+' '+e.type+(e.D?' '+nm(e.D):''));};
S.hooks.opening=o=>{if(o)L.push('    > opening '+o.source+' for '+nm(o.f)+' on '+nm(o.opp));};
S.hooks.turn=i=>L.push('TURN '+S.game.turnNo+' '+nm(S.F[i])+' :: '+bal());
Math.random=mulberry32(${SEED}*977+5);S.arenaKey='${AK}';S.cfg.n=${N};S.auto=true;S.tableOn=true;S.rng=mulberry32(${SEED}*31+${N});S.F=[];rosterBuild();initDuel();
let k=0;while(k<120*400&&S.game.phase!=='over'){simStep();tickOpening(DT*3);k++;}
L.push('END '+S.game.phase+' turns '+S.game.turnNo+' :: '+bal());
console.log(L.join('\\n'));
`);
