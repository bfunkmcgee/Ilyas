
const errs=[],rep=[];let base=mulberry32(21),FORCE=[],ROLLS=[],READS=[],FORCED=null;
S.rng=()=>base();
const _ra=resolveAttack;
resolveAttack=function(A,D,kind,op,T){T=T||pickTechnique(A,D,kind);const want=FORCE.shift();if(!want)return _ra(A,D,kind,op,T);
  const c=computeMods(A,D,kind,op,T);let pick=null;
  for(let v=1;v<=20;v++){const tot=v+c.bonus,o=v===1?'fumble':isCrit(v,tot,c.def)?'crit':tot>=c.def?'hit':tot>=c.def-4?'block':'dodge';if(o===want){pick=v;if(want!=='hit')break;}}
  if(want==='hit'){for(let v=2;v<20;v++){const tot=v+c.bonus;if(tot>=c.def&&!isCrit(v,tot,c.def)){pick=v;break;}}}
  FORCED=pick!=null;if(pick==null)return _ra(A,D,kind,op,T);
  const save=S.rng;let first=true;S.rng=()=>{if(first){first=false;return(pick-.5)/20;}return base();};const r=_ra(A,D,kind,op,T);S.rng=save;return r;};
const _rv=rollVs;
rollVs=function(c,extra){const w=ROLLS.shift();if(w==null)return _rv(c,extra);
  const need=c.dc-c.bonus,pick=w==='crush'?20:w==='fail'?1:need<=2?2:need>=20?20:need;
  const save=S.rng;let first=true;S.rng=()=>{if(first){first=false;return(pick-.5)/20;}return base();};const r=_rv(c,extra);S.rng=save;return r;};
const _rs=resolveShove;let SHOVE=null;
resolveShove=function(A,D,op){if(!SHOVE)return _rs(A,D,op);const c=shoveMods(A,D,op),pick=SHOVE==='fail'?1:Math.max(2,Math.min(19,c.dc-c.bonus+1));
  const save=S.rng;let first=true;S.rng=()=>{if(first){first=false;return(pick-.5)/20;}return base();};const r=_rs(A,D,op);S.rng=save;SHOVE=null;return r;};
const _rr=readRoll;readRoll=function(f,o,src,depth){const w=READS.shift();if(w==null)return _rr(f,o,src,depth);return{roll:w?15:2,bonus:5,total:w?20:7,dc:15,ok:!!w};};
styleRoll=()=>0;
// pos: Kael, foes..., Amri (ally last)
function setup(hero,foes,ally,pos,o={}){S.arenaKey=o.arena||'field';S.auto=true;S.allyAuto=false;S.tableOn=false;S.cfg.n=foes.length;S.gore='red';
  S.cfg.hero={seed:2207,weapon:hero[0],skill:hero[1]};foes.forEach((f,i)=>{S.cfg.foes[i]={seed:[5113,7741,3190][i],weapon:f[0],skill:f[1]};});
  S.cfg.ally={on:!!ally,seed:6427,weapon:ally?ally[0]:'spear',skill:ally?ally[1]:3};
  S.F=[];rosterBuild();initDuel();if(S.table)S.table.on=false;
  S.F.forEach((f,i)=>{const q=pos[i];f.station=q[0];f.lane=q[1];f.dep=q[1];if(f.team){f.side=q[2];f.facing=-q[2];}else if(q[2])f.facing=q[2];f.build();});
  S.target=o.target||1;warm(80);S.game.phase='input';startTurn(0);S.game.aiAt=null;S.game.active=0;for(const f of S.F){f.intent=null;f.ready=0;}
  FORCE=[];ROLLS=[];READS=[];SHOVE=null;S.forceStuck=null;}
let PICKS=[],opened=[];
function run(max=120*12){let n=0;for(;n<max;n++){simStep();
    if(S.opening){const p=PICKS.shift()||'hold';opened.push(S.opening.f.name+':'+S.opening.source+'>'+p);resolveOpening(p);}
    for(const f of S.F)for(const q of f.p)if(!Number.isFinite(q.x+q.y)){errs.push('NaN '+f.name);return -1;}
    if(S.game.phase!=='exchange'&&!S.opening)return n;}return n;}
function act(i,cmd,label){const g=S.game;g.phase='input';g.active=i;g.aiAt=null;S.opening=null;const ok=command(i,cmd);if(!ok)errs.push(label+': refused '+S.F[i].name+' '+cmd);return ok;}
function settle(n){const a=S.auto;S.auto=false;const g=S.game;if(g.phase!=='exchange'){g.phase='input';g.active=0;g.aiAt=null;}for(let i=0;i<n;i++)simStep();S.auto=a;}
function check(label,extra){
  if(S.game.phase==='exchange')errs.push(label+': stuck exchange');
  for(const c of S.clinches){if(c.a.clinch!==c||c.b.clinch!==c)errs.push(label+': clinch link');if(c.a.dead||c.b.dead)errs.push(label+': dead in clinch');}
  for(const f of S.F){if(f.sidearm==='offhand'&&!f.clinch&&S.game.phase!=='exchange')errs.push(label+': dagger left in off hand');
    if(f.lane<DEP_MIN-1||f.lane>DEP_MAX+1)errs.push(label+': lane '+f.name);if(!Number.isFinite(f.hp))errs.push(label+': hp');}
  rep.push(label+' '+(extra||''));}
const st=()=>S.F.map(f=>(f.dead?'X':f.downed?'D':'')+(f.clinch?(f.clinch.a===f?'H':'h'):'')+f.name[0]+':'+f.hp+(f.sidearm?'/'+f.sidearm[0]:'')).join(' ');
const OUTS=['hit','crit','block','dodge','fumble'];

// ---- the off-hand dagger: front clinch, holding from behind, held from behind; drawn and already out; every outcome
for(const role of ['front','rear','back'])for(const out of OUTS)for(const sk of [4,5]){
  setup(['sword',sk],[['axe',2]],null,[[330,92],[400,92,1]]);const K=S.F[0],V=S.F[1];
  if(role==='front')makeClinch(K,V,false);else if(role==='rear')makeClinch(K,V,true);else{V.station=K.station-60;V.side=-1;V.facing=1;K.facing=1;makeClinch(V,K,true);}
  resolveStations();settle(30);
  const si=stabInfo(K);if(!si)errs.push('stab '+role+': not offered');
  const slot=slotAction(K,targetOf(K),'advance');if(slot!=='stab')errs.push('stab '+role+': advance slot is '+slot);
  const T=stabTech(K,V),hp0=V.hp;FORCE=[out];FORCED=null;act(0,'stab','stab '+role);const ex=S.game.ex;run();settle(20);
  if(!FORCED){rep.push('stab '+role+' sk'+sk+' '+out+' (not possible: got '+ex.res.out+')');continue;}
  const land=out==='hit'||out==='crit';
  if(land&&V.hp>=hp0)errs.push('stab '+role+' '+out+': no damage');
  if(!land&&V.hp<hp0)errs.push('stab '+role+' '+out+': damage on a miss');
  if(role==='back'&&land&&K.clinch)errs.push('stab back '+out+': still held');
  if(role!=='back'&&!K.clinch&&!V.dead&&!V.downed)errs.push('stab '+role+' '+out+': clinch lost');
  check('stab '+role+' sk'+sk+' '+out,T.name+' dmg '+(hp0-V.hp)+' '+st());}
// second stab with the dagger already out is quicker
{setup(['sword',4],[['axe',2]],null,[[330,92],[400,92,1]]);const K=S.F[0],V=S.F[1];makeClinch(K,V,false);resolveStations();settle(20);
 const c1=actionCost(K,'stab');FORCE=['block'];act(0,'stab','stab1');run();settle(10);const c2=actionCost(K,'stab');
 if(K.sidearm!=='offhand')errs.push('dagger not kept in the off hand during the clinch: '+K.sidearm);
 if(!(c2<c1))errs.push('second stab not cheaper '+c1+' '+c2);
 const T=stabTech(K,V);if(T.name!=='Dagger stab')errs.push('drawn name '+T.name);
 act(0,'push','push');run();settle(20);if(K.sidearm!=='sheathed')errs.push('dagger not sheathed after the clinch: '+K.sidearm);
 check('stab twice',`cost ${c1}->${c2} then push: ${st()}`);}
// killing stabs: knifed, throat slit, stabbed behind
for(const role of ['front','rear','back']){
  setup(['sword',4],[['axe',2]],null,[[330,92],[400,92,1]]);const K=S.F[0],V=S.F[1];
  if(role==='front')makeClinch(K,V,false);else if(role==='rear')makeClinch(K,V,true);else{V.station=K.station-60;V.side=-1;V.facing=1;K.facing=1;makeClinch(V,K,true);}
  resolveStations();settle(30);V.hp=1;FORCE=['hit'];act(0,'stab','kill '+role);const T=S.game.ex.res.tech;run();settle(30);
  if(!V.dead)errs.push('stab kill '+role+': alive');
  check('stab kill '+role,(T.fin?T.fin.name+'/'+T.fin.type:'-')+' '+st());}
// not for a Veteran, not with the dagger gone, not for foes
{setup(['sword',3],[['axe',2]],null,[[330,92],[400,92,1]]);makeClinch(S.F[0],S.F[1],false);if(stabInfo(S.F[0]))errs.push('veteran can stab');
 S.F[0].skill=4;S.F[0].sidearm='lost';if(stabInfo(S.F[0]))errs.push('stab without the dagger');S.F[0].sidearm='sheathed';if(!stabInfo(S.F[0]))errs.push('expert cannot stab');
 if(stabInfo(S.F[1]))errs.push('foe can stab');rep.push('stab gating ok');}
// opening card in a clinch offers the dagger
{setup(['sword',4],[['axe',2]],null,[[330,92],[430,92,1]]);ROLLS=['ok'];PICKS=['stab'];FORCE=['hit'];act(0,'grab','grab then stab');run();settle(20);
 check('grab then stab','opened '+opened.splice(0).join(',')+' '+st());}

// ---- the ally: roster, spawn, facing, HP
for(const n of [1,2,3])for(const ak of Object.keys(ARENAS)){S.arenaKey=ak;S.cfg.n=n;S.cfg.ally={on:true,seed:6427,weapon:'spear',skill:3};S.F=[];rosterBuild();initDuel();
  const M=S.F.find(f=>f.ally);if(!M||M.idx!==n+1||M.team!==0)errs.push('ally roster '+n);
  const near=foes().reduce((b,f)=>!b||Math.abs(f.station-M.station)<Math.abs(b.station-M.station)?f:b,null);
  if(Math.sign(near.station-M.station)!==M.facing)errs.push('ally facing '+ak+n);
  for(const f of S.F)for(const o of S.F)if(f!==o&&Math.abs(f.lane-o.lane)<20&&Math.abs(f.station-o.station)<40)errs.push('spawn overlap '+ak+n+' '+f.name+' '+o.name);
  if(foes()[0].maxHp!==FOE_HP_ALLY[n])errs.push('foe hp');}
rep.push('ally spawns ok');

// ---- pincer: Amri is on Qadir with Kael, then circles behind; Kael can do it too
{setup(['sword',4],[['axe',2]],['spear',3],[[300,92],[420,92,1],[290,140,1]],{});const K=S.F[0],V=S.F[1],M=S.F[2];
 M.tgt=1;const pi=pincerInfo(M);if(!pi)errs.push('pincer: not offered to Amri');
 if(slotAction(M,targetOf(M),'team')!=='pincer')errs.push('pincer: team slot');
 act(2,'pincer','pincer');run();settle(40);startTurn(0);
 if(!pincered(V))errs.push('pincer: Qadir not pincered');
 if(Math.sign(M.station-V.station)!==1)errs.push('pincer: Amri not past Qadir');
 // Qadir faces one of them: the other gets the back bonus
 const t=targetOf(V),other=t===K?M:K,m=computeMods(other,V,'slash',false,pickTechnique(other,V,'slash')).mods.find(x=>x[0]==='from behind');
 if(!m||m[1]!==2)errs.push('pincer: no back bonus for '+other.name);
 check('pincer Amri',`Qadir faces ${t.name}, ${other.name} from behind +${m?m[1]:0} · ${st()} M@${M.station.toFixed(0)} V@${V.station.toFixed(0)}`);}
{setup(['sword',4],[['axe',2],['spear',1]],['spear',3],[[300,92],[420,92,1],[160,100,-1],[300,140,1]],{});const K=S.F[0],V=S.F[1],M=S.F[3];
 M.station=V.station-100;M.lane=V.lane+30;M.tgt=1;settle(60);S.target=1;
 const pi=pincerInfo(K);if(pi){act(0,'pincer','kael pincer');run();settle(40);startTurn(0);
  if(V.side!==Math.sign(V.station-K.station))errs.push('kael pincer: side not resynced');check('pincer Kael',`V side ${V.side} · pincered ${pincered(V)} · ${st()}`);}
 else rep.push('pincer Kael: not available here');}

// ---- tandem: Kael lands a hit, Amri follows up
for(const pick of ['slash','thrust','overhead','hold']){
  setup(['sword',4],[['axe',2]],['spear',3],[[300,92],[410,92,1],[300,140,1]],{});const M=S.F[2];M.station=520;M.lane=100;M.facing=-1;settle(40);
  FORCE=['hit','hit'];READS=[false,true];PICKS=[pick];const hp0=S.F[1].hp;act(0,'slash','tandem '+pick);run();settle(20);
  const o=opened.splice(0);if(!o.some(x=>x.startsWith(ALLY_NAME+':gang')))errs.push('tandem '+pick+': no follow-up opening ('+o.join(',')+')');
  check('tandem '+pick,'Qadir -'+(hp0-S.F[1].hp)+' opened '+o.join(','));}
// Kael holds Qadir from behind: a free strike for Amri
{setup(['sword',4],[['axe',2]],['spear',3],[[300,92],[380,92,1],[520,100,-1]],{});const K=S.F[0],V=S.F[1];V.facing=1;settle(10);
 ROLLS=['ok'];PICKS=['thrust'];FORCE=['hit'];act(0,'grab','hold for Amri');run();settle(20);
 const o=opened.splice(0);if(!o.some(x=>x.startsWith(ALLY_NAME+':gang')))errs.push('hold for partner: no free strike ('+o.join(',')+')');
 check('hold for Amri',o.join(',')+' '+st());}

// ---- pull off: Qadir holds Kael, Amri hits Qadir or shoves him off
for(const how of ['slash','shove','miss']){
  setup(['sword',4],[['axe',2]],['spear',3],[[330,92],[400,92,1],[520,92,-1]],{});const K=S.F[0],V=S.F[1],M=S.F[2];makeClinch(V,K,false);resolveStations();settle(30);M.tgt=1;
  if(how==='shove'){if(!cmdValid(M,V,'shove'))errs.push('pull off: shove not allowed');SHOVE='ok';act(2,'shove','pull off');}
  else{FORCE=[how==='miss'?'block':'hit'];FORCED=null;act(2,'slash','pull off '+how);}
  run();settle(30);
  if(how==='miss'&&!FORCED){rep.push('pull off miss: not possible here');continue;}
  if(how!=='miss'&&K.clinch)errs.push('pull off '+how+': Kael still held');
  if(how==='miss'&&!K.clinch)errs.push('pull off miss: freed anyway');
  check('pull off '+how,st());}

// ---- cover: Amri covers Kael; Qadir's attack on Kael hits Amri
for(const out of ['hit','block']){
  setup(['sword',4],[['axe',2]],['spear',3],[[300,92],[420,92,1],[200,140,1]],{});const K=S.F[0],V=S.F[1],M=S.F[2];
  if(slotAction(M,targetOf(M),'cover')!=='cover')errs.push('cover slot');
  act(2,'cover','cover');run();settle(30);if(M.covering!==K)errs.push('cover: not covering');
  V.tgt=0;FORCE=[out];const hk=K.hp,hm=M.hp;act(1,'overhead','attack covered');const ex=S.game.ex;run();settle(20);
  if(ex.D!==M)errs.push('cover: attack not redirected');if(K.hp!==hk)errs.push('cover: Kael hurt');if(M.covering)errs.push('cover: still covering after stepping in');
  check('cover '+out,`attack landed on ${ex.D.name} (${ex.res.out}) Amri -${hm-M.hp} · ${st()}`);}
// cover ends on the coverer's next turn
{setup(['sword',4],[['axe',2]],['spear',3],[[300,92],[420,92,1],[200,140,1]],{});const M=S.F[2];act(2,'cover','cover2');run();settle(20);startTurn(2);if(M.covering)errs.push('cover: survives own next turn');rep.push('cover expiry ok');}

// ---- help up: Kael down, Amri pulls him up and he keeps his turn
{setup(['sword',4],[['axe',2]],['spear',3],[[300,92],[440,92,1],[200,140,1]],{});const K=S.F[0],M=S.F[2];knockDown(K);settle(90);
 const r0=K.ready;if(slotAction(M,targetOf(M),'team')!=='helpup')errs.push('help up: team slot is '+slotAction(M,targetOf(M),'team'));
 act(2,'helpup','help up');run();settle(30);if(K.downed)errs.push('help up: still down');if(K.ready!==r0)errs.push('help up: Kael charged tempo');
 check('help up',`Kael ready ${r0}->${K.ready} · ${st()}`);}

// ---- enemies choose between Kael and Amri
{setup(['sword',4],[['axe',2],['spear',2]],['spear',3],[[440,92],[690,80,1],[190,106,-1],[322,142,-1]],{});
 for(const f of foes())retargetFoe(f);rep.push('foe targets: '+foes().map(f=>f.name+'->'+S.F[f.tgt].name).join(', '));
 const B=S.F[2];if(S.F[B.tgt]!==S.F[3])errs.push('Brask should take Amri on his side');
 // Amri holding Brask: Qadir goes to free him
 makeClinch(S.F[3],B,false);resolveStations();retargetFoe(S.F[1]);rep.push('with Amri holding Brask, Qadir -> '+S.F[S.F[1].tgt].name);}

// ---- Amri dies: the fight goes on; Kael dies: it ends
{setup(['sword',4],[['axe',2]],['spear',3],[[300,92],[420,92,1],[200,140,1]],{});const M=S.F[2];M.hp=1;S.F[1].tgt=2;S.F[1].station=M.station+100;S.F[1].lane=M.lane;settle(40);FORCE=['hit'];act(1,'thrust','kill Amri');run();settle(40);
 if(!M.dead)errs.push('Amri not dead');if(S.game.phase==='over')errs.push('fight ended on Amri');check('Amri falls',M.finName+' '+st()+' phase '+S.game.phase);
 const K=S.F[0];K.hp=1;S.F[1].tgt=0;FORCE=['hit'];act(1,'slash','kill Kael');run();if(S.game.phase!=='over')errs.push('fight not over on Kael');rep.push('Kael falls: '+S.game.phase);}

// ---- every slot maps to a valid action, for both heroes, in many states
function slotsOK(A,label){const D=targetOf(A);for(const sl of SLOTS){const a=slotAction(A,D,sl);if(a&&!cmdValid(A,D,a)&&!['advance','withdraw','sidestep','flank','pickup','shove','feint'].includes(a))errs.push(label+': '+A.name+' slot '+sl+' -> '+a);}}
{let bad=0,n=0;for(let s=0;s<240;s++){setup(['sword',4+(s%2)],[['axe',2],['spear',2]],['spear',3],[[400,92],[470,92,1],[300,96,-1],[250,140,-1]]);
  const K=S.F[0],V=S.F[1],B=S.F[2],M=S.F[3],k=s%8;
  if(k===0)makeClinch(V,K,false);else if(k===1)makeClinch(B,K,true);else if(k===2)makeClinch(K,V,false);else if(k===3)makeClinch(K,V,true);
  else if(k===4)knockDown(K);else if(k===5)knockDown(M);else if(k===6)makeClinch(B,M,false);else{M.covering=K;}
  resolveStations();settle(10);slotsOK(K,'state '+k);slotsOK(M,'state '+k);
  for(const i of [0,1,2,3]){const A=S.F[i];if(A.dead)continue;n++;const c=aiChoice(i);if(!cmdValid(A,targetOf(A),c)){bad++;if(bad<8)errs.push('ai '+A.name+' chose '+c+' in state '+k);}}}
 rep.push('ai choices '+n+' bad '+bad);}
console.log(rep.filter(r=>!/^stab (front|rear|back) sk/.test(r)).join('\n'));
console.log('stab runs',rep.filter(r=>/^stab (front|rear|back) sk/.test(r)).length,'· sample:',rep.filter(r=>/^stab (rear|back) sk4 hit/.test(r)).join(' | '));
console.log('errors',errs.length,[...new Set(errs)].slice(0,40));
