// Forced tests for every brawl action and outcome: grabs, dirty strikes, throws and their hazards, push, break free,
// human shield, getting up, rolling, ground attacks, disarms, loot, improvised weapons and gang-ups.
const core=require('./sk_src.js')(process.argv[2]);
eval(core+`
const errs=[],rep=[];let base=mulberry32(5),FORCE=[],ROLLS=[],READS=[];
S.rng=()=>base();
const _ra=resolveAttack;
resolveAttack=function(A,D,kind,op,T){T=T||pickTechnique(A,D,kind);const want=FORCE.shift();if(!want)return _ra(A,D,kind,op,T);
  const c=computeMods(A,D,kind,op,T);let pick=null;
  for(let v=1;v<=20;v++){const tot=v+c.bonus,o=v===1?'fumble':isCrit(v,tot,c.def)?'crit':tot>=c.def?'hit':tot>=c.def-4?'block':'dodge';if(o===want){pick=v;if(want!=='hit')break;}}
  if(want==='hit'){for(let v=2;v<20;v++){const tot=v+c.bonus;if(tot>=c.def&&!isCrit(v,tot,c.def)){pick=v;break;}}}
  if(pick==null)return _ra(A,D,kind,op,T);
  const save=S.rng;let first=true;S.rng=()=>{if(first){first=false;return(pick-.5)/20;}return base();};const r=_ra(A,D,kind,op,T);S.rng=save;return r;};
const _rv=rollVs;
rollVs=function(c,extra){const w=ROLLS.shift();if(w==null)return _rv(c,extra);
  const need=c.dc-c.bonus,pick=w==='crush'?20:w==='fail'?1:need<=2?2:need>=20?20:need;
  const save=S.rng;let first=true;S.rng=()=>{if(first){first=false;return(pick-.5)/20;}return base();};const r=_rv(c,extra);S.rng=save;return r;};
const _rr=readRoll;readRoll=function(f,o,src,depth){const w=READS.shift();if(w==null)return _rr(f,o,src,depth);return{roll:w?15:2,bonus:5,total:w?20:7,dc:15,ok:!!w};};
// a forced answer to the next blow (sk_react.js)
let REACTS=[];const _aR=aiReact;aiReact=function(D,A,kind,T,op){const w=REACTS.shift();return w&&reactChoices(D,A).includes(w)?w:_aR(D,A,kind,T,op);};
styleRoll=()=>0;
function setup(arena,hero,foes,pos,o={}){S.arenaKey=arena;S.auto=true;S.tableOn=!!o.table;S.divOn=!!o.divs;S.cfg.n=foes.length;
  S.cfg.hero={seed:2207,weapon:hero[0],skill:hero[1]};foes.forEach((f,i)=>{S.cfg.foes[i]={seed:[5113,7741,3190][i],weapon:f[0],skill:f[1]};});
  S.F=[];rosterBuild();initDuel();if(!o.table&&S.table)S.table.on=false;
  S.F.forEach((f,i)=>{const q=pos[i];f.station=q[0];f.lane=q[1];f.dep=q[1];if(f.team){f.side=q[2];f.facing=-q[2];}f.build();});
  if(o.table)placeTable(o.table[0],o.table[1]);
  if(o.kface)S.F[0].facing=o.kface;S.target=o.target||1;
  warm(80);S.game.phase='input';startTurn(0);S.game.aiAt=null;S.game.active=0;for(const f of S.F){f.intent=null;f.ready=0;}
  FORCE=[];ROLLS=[];READS=[];REACTS=[];}
let PICKS=[],opened=[];
function run(max=120*10){let n=0;for(;n<max;n++){simStep();
    if(S.opening){const p=PICKS.shift()||'hold';opened.push(S.opening.f.name+':'+S.opening.source+'>'+p);resolveOpening(p);}
    for(const f of S.F)for(const q of f.p)if(!Number.isFinite(q.x+q.y)){errs.push('NaN '+f.name);return -1;}
    if(S.game.phase!=='exchange'&&!S.opening)return n;}return n;}
function act(i,cmd,label){const g=S.game;g.phase='input';g.active=i;g.aiAt=null;S.opening=null;
  const ok=command(i,cmd);if(!ok)errs.push(label+': refused '+S.F[i].name+' '+cmd);return ok;}
function settle(n){const a=S.auto;S.auto=false;const g=S.game;if(g.phase!=='exchange'){g.phase='input';g.active=0;g.aiAt=null;}for(let i=0;i<n;i++)simStep();S.auto=a;}
function check(label,extra){const K=S.F[0];
  if(S.game.phase==='exchange'){errs.push(label+': stuck');return;}
  for(const c of S.clinches){if(c.a.clinch!==c||c.b.clinch!==c)errs.push(label+': clinch link broken');if(c.a.dead||c.b.dead||c.a.downed||c.b.downed)errs.push(label+': clinch with a fallen fighter');}
  for(const f of S.F){
    if(f.clinch&&!S.clinches.includes(f.clinch))errs.push(label+': stale clinch on '+f.name);
    if(f.carry)errs.push(label+': carry left on '+f.name);
    if(f.downed&&f.knockUntil!==Infinity)errs.push(label+': downed without knockUntil '+f.name);
    if(f.dead&&f.clinch)errs.push(label+': dead in clinch '+f.name);
    if(!WEAPONS[f.weaponKey])errs.push(label+': bad weapon '+f.weaponKey);
    if(!f.dead&&!f.downed&&f.motor<.85&&S.t>f.knockUntil+1.5)errs.push(label+': '+f.name+' motor '+f.motor.toFixed(2));
    if(f.lane<DEP_MIN-1||f.lane>DEP_MAX+1)errs.push(label+': lane out '+f.name);
    if(f.team===1&&!f.dead&&!f.downed&&!f.clinch&&!K.dead&&!K.downed&&!K.clinch&&(f.station-K.station)*f.side<20)errs.push(label+': side violation '+f.name);
    if(!Number.isFinite(f.hp)||f.hp<0)errs.push(label+': hp '+f.hp);}
  for(const it of S.items)if(!Number.isFinite(it.a.x+it.a.y+it.b.x+it.b.y))errs.push(label+': item NaN');
  rep.push(label+' '+(extra||''));}
const st=()=>S.F.map(f=>(f.dead?'X':f.downed?'D':'')+(f.clinch?(f.clinch.a===f?'H':'h'):'')+f.weaponKey+':'+f.hp).join(' ');
const OUTS=['hit','crit','block','dodge','fumble'];

// --- grabs: Kael on Qadir, Qadir on Kael, Qadir from behind with Brask in reach (free gang-up)
for(const r of ['ok','crush','fail']){
  setup('field',['sword',3],[['axe',2]],[[330,92],[420,92,1]]);ROLLS=[r];PICKS=['knee'];FORCE=['hit'];
  act(0,'grab','grab K '+r);run();check('grab K '+r,st()+' opened '+opened.splice(0).join(','));
  setup('field',['sword',3],[['axe',2]],[[330,92],[420,92,1]]);ROLLS=[r];PICKS=['headbutt'];FORCE=['hit'];
  act(1,'grab','grab V '+r);run();check('grab V '+r,st()+' opened '+opened.splice(0).join(','));
  setup('field',['sword',3],[['axe',2],['spear',2]],[[400,92],[322,92,-1],[512,96,1]],{kface:1,target:2});ROLLS=[r];PICKS=['slash'];FORCE=['hit'];
  act(1,'grab','grab behind '+r);run();check('grab behind '+r,st()+' behind='+!!(S.F[0].clinch&&S.F[0].clinch.behind)+' opened '+opened.splice(0).join(','));}

// --- dirty strikes from every clinch role, every outcome
const ROLES={front:[0,1,false],held:[1,0,false],kaelBehind:[0,1,true],heldBehind:[1,0,true]};
for(const [role,[hi,ti,behind]] of Object.entries(ROLES))for(const kind of DIRTY)for(const out of OUTS)for(const who of ['holder','held']){
  setup('field',['sword',3],[['axe',2]],[[330,92],[400,92,1]]);makeClinch(S.F[hi],S.F[ti],behind);resolveStations();
  const A=who==='holder'?S.F[hi]:S.F[ti],T=dirtyTech(A,clinchPartner(A),kind);FORCE=[out];const hp0=S.F.map(f=>f.hp);
  act(A.idx,kind,role+' '+who+' '+kind+' '+out);run();
  const dealt=hp0.map((h,i)=>h-S.F[i].hp).join('/');
  if((out==='hit'||out==='crit')&&hp0.every((h,i)=>h===S.F[i].hp))errs.push(role+' '+kind+' '+out+': no damage');
  check(role+' '+who+' '+kind+' '+out,T.name+' dmg '+dealt+' '+st());}

// --- throws: no hazard, table, wall, a bystander, the curb; Kael holding, Kael held from behind (shoulder throw), Qadir throwing Kael
const THROWS=[
  ['plain','field',[[330,92],[400,92,1]],{}],
  ['table','field',[[330,92],[400,92,1]],{table:[476,92]}],
  ['wall','wall',[[640,92],[700,92,1]],{}],
  ['body','field',[[330,92],[400,92,1],[452,96,1]],{}],
  ['curb','street',[[330,122],[400,122,1]],{}]];
for(const [hz,arena,pos,o] of THROWS)for(const r of ['ok','crush','fail']){
  const foes=pos.length>2?[['axe',2],['dagger',1]]:[['axe',2]];
  setup(arena,['sword',3],foes,pos,o);makeClinch(S.F[0],S.F[1],false);resolveStations();
  const info=throwInfo(S.F[0]),w0=S.wall?S.wall.hp:null;ROLLS=[r];
  act(0,'throw','throw '+hz+' '+r);run();settle(60);
  const V=S.F[1];if(r!=='fail'&&!V.downed&&!V.dead)errs.push('throw '+hz+' '+r+': Qadir still up');
  if(r!=='fail'&&hz!=='plain'&&(!info||!info.hazard||info.hazard.kind!==hz))errs.push('throw '+hz+': hazard not chosen ('+(info&&info.hazard?info.hazard.kind:'none')+')');
  if(r!=='fail'&&hz==='table'&&S.table.state==='intact')errs.push('throw table: table intact');
  if(r!=='fail'&&hz==='wall'&&S.wall.hp>=w0&&S.wall.state==='standing')errs.push('throw wall: wall unhurt');
  if(r!=='fail'&&hz==='body'&&!S.F[2].downed&&!S.F[2].dead)errs.push('throw body: bystander still up');
  if(r==='fail'&&(S.F[0].clinch||S.F[0].foot>FOOT_MAX-FOOT_COST.throw-FOOT_HIT))errs.push('throw fail: thrower kept his balance / still clinched');
  check('throw '+hz+' '+r,(info?info.how+'@'+info.x.toFixed(0):'-')+' '+st()+' table '+(S.table?S.table.state:'-')+' wall '+(S.wall?S.wall.hp+'/'+S.wall.state:'-'));}
for(const r of ['ok','fail']){
  setup('field',['sword',3],[['axe',2]],[[400,92],[330,92,-1]],{kface:1});makeClinch(S.F[1],S.F[0],true);resolveStations();
  const info=throwInfo(S.F[0]);ROLLS=[r];act(0,'throw','shoulder '+r);run();settle(60);
  check('shoulder throw '+r,(info?info.how:'-')+' '+st());
  setup('field',['sword',3],[['axe',2]],[[330,92],[400,92,1]]);makeClinch(S.F[1],S.F[0],false);resolveStations();
  ROLLS=[r];act(1,'throw','V throws K '+r);run();settle(60);check('V throws K '+r,st());}

// --- push, break free (both ways), human shield and redirected blows
setup('field',['sword',3],[['axe',2]],[[330,92],[400,92,1]]);makeClinch(S.F[0],S.F[1],false);resolveStations();
act(0,'push','push');run();if(S.F[0].clinch)errs.push('push: still clinched');check('push',st()+' gap '+Math.abs(S.F[1].station-S.F[0].station).toFixed(0));
for(const r of ['ok','crush','fail'])for(const behind of [false,true]){
  setup('field',['sword',3],[['axe',2]],[[330,92],[400,92,1]]);makeClinch(S.F[1],S.F[0],behind);resolveStations();
  ROLLS=[r];act(0,'breakfree','K breakfree '+r);run();
  if(r!=='fail'&&S.F[0].clinch)errs.push('breakfree '+r+': still held');if(r==='fail'&&!S.F[0].clinch)errs.push('breakfree fail: freed');
  check('K breakfree '+(behind?'behind ':'')+r,st()+' opened '+opened.splice(0).join(','));
  setup('field',['sword',3],[['axe',2]],[[330,92],[400,92,1]]);makeClinch(S.F[0],S.F[1],behind);resolveStations();
  ROLLS=[r];act(1,'breakfree','V breakfree '+r);run();check('V breakfree '+(behind?'behind ':'')+r,st());}
for(const out of OUTS){
  setup('field',['sword',3],[['axe',2],['spear',2]],[[400,92],[460,92,1],[282,96,-1]]);makeClinch(S.F[0],S.F[1],false);resolveStations();
  if(!shieldInfo(S.F[0]))errs.push('shield: unavailable');
  act(0,'shield','shield');run();
  const c=S.F[0].clinch;if(!c||!c.behind||c.a!==S.F[0])errs.push('shield: hold not taken');
  const sh=shieldFor(S.F[2],S.F[0]);if(!sh)errs.push('shield: not between');
  FORCE=[out];const hp0=S.F.map(f=>f.hp);act(2,'thrust','shield thrust '+out);const ex=S.game.ex;run();
  check('shield vs thrust '+out,'res '+(ex.res&&ex.res.out)+' on '+ex.D.name+(ex.res&&ex.res.shielded?' (shielded)':'')+' dmg '+hp0.map((h,i)=>h-S.F[i].hp).join('/')+' '+st());}
setup('field',['sword',3],[['axe',2],['spear',2]],[[400,92],[330,92,-1],[510,96,1]],{kface:1,target:2});makeClinch(S.F[1],S.F[0],true);resolveStations();
if(shieldInfo(S.F[0]))errs.push('shield offered while held from behind');

// --- down: get up, roll, and every attack on a downed fighter
for(const cmd of ['getup','roll','wait']){
  setup('field',['sword',3],[['axe',2]],[[380,92],[460,92,1]]);knockDown(S.F[0]);settle(90);
  act(0,cmd,'down '+cmd);run();settle(40);
  if(cmd!=='wait'&&S.F[0].downed)errs.push('down '+cmd+': still down');
  check('down '+cmd,st()+' at '+S.F[0].station.toFixed(0));}
for(const w of ['sword','axe','spear','dagger','fists','club'])for(const kind of ATTACKS)for(const out of ['hit','crit','dodge']){
  setup('field',[w,3],[['axe',2]],[[330,92],[430,92,1]]);knockDown(S.F[1]);settle(90);
  const T=pickTechnique(S.F[0],S.F[1],kind);FORCE=[out];act(0,kind,'ground '+w+' '+kind);run();
  if(!S.F[1].dead&&!S.F[1].downed)errs.push('ground '+w+' '+kind+': target got up');
  check('ground '+w+' '+kind+' '+out,T.name+' '+st());}

// --- disarms: guard break and bind, then picking things up
for(const r of ['ok','fail']){
  setup('field',['axe',3],[['sword',2]],[[300,92],[400,92,1]]);
  REACTS=['parry'];FORCE=['block'];ROLLS=[r];act(0,'overhead','dis '+r);run();settle(120);
  const V=S.F[1];if(r==='ok'&&!V.wp.unarmed)errs.push('disarm ok: still armed');
  check('disarm break '+r,st()+' items '+S.items.length);
  if(r==='ok'){const L=pickupInfo(V);if(!L||L.owner!==1)errs.push('disarm: own weapon not offered');
    act(1,'pickup','retrieve');run();if(V.weaponKey!=='sword')errs.push('retrieve failed');check('retrieve',st()+' items '+S.items.length);}}
{setup('field',['sword',3],[['axe',2]],[[330,92],[430,92,1]]);FORCE=['block'];READS=[true];ROLLS=['ok'];PICKS=['bind'];
 act(0,'slash','bind');run();settle(120);check('bind disarm',st()+' opened '+opened.splice(0).join(',')+' items '+S.items.length);
 if(!S.F[0].wp.unarmed)errs.push('bind: Kael not disarmed');
 const L=pickupInfo(S.F[0]);act(0,'pickup','K retrieve');run();check('K retrieve',(L?lootLabel(S.F[0],L):'-')+' '+st());}
// enemy weapon: Kael unarmed with only Qadir's dropped axe nearby
{setup('field',['sword',3],[['axe',2],['spear',2]],[[330,92],[440,92,1],[200,96,-1]]);dropWeapon(S.F[1],-1,false);S.F[0].setWeapon('fists');S.F[0].ownWeapon=null;
 const L=pickupInfo(S.F[0]);act(0,'pickup','take axe');run();check('take enemy axe',(L?lootLabel(S.F[0],L):'-')+' '+st());if(S.F[0].weaponKey!=='axe')errs.push('take axe failed');}
// table props, a table leg, and rubble
{setup('field',['sword',3],[['axe',2]],[[220,92],[520,92,1]],{table:[420,92]});S.F[1].setWeapon('fists');
 const L=pickupInfo(S.F[1]);act(1,'pickup','prop');run();check('pickup prop',(L?lootLabel(S.F[1],L):'-')+' '+st()+' props '+S.table.props.length);
 FORCE=['hit'];act(1,'overhead','bottle smash');run();check('bottle smash',st());
 const Tb=S.table;Tb.state='breaking';Tb.breakBy=S.t;Tb.breakDir=1;Tb.breakFrom=null;settle(200);
 S.F[0].setWeapon('fists');S.F[0].ownWeapon=null;const L2=pickupInfo(S.F[0]);check('debris',(L2?lootLabel(S.F[0],L2)+' '+L2.src:'none')+' debris '+S.debris.filter(p=>p.club).length);
 if(L2){act(0,'pickup','club');run();check('pickup club',st());}}
{setup('wall',['sword',3],[['axe',2]],[[660,92],[540,92,-1]]);S.wall.state='breaching';S.wall.breakBy=S.t;S.wall.dir=1;S.wall.breakFrom=null;settle(240);
 S.F[0].station=740;S.F[0].build();settle(30);S.F[0].setWeapon('fists');S.F[0].ownWeapon=null;const L=pickupInfo(S.F[0]);check('rubble',(L?lootLabel(S.F[0],L)+' '+L.src:'none')+' rubble '+S.rubble.length);
 if(L){act(0,'pickup','stone');run();check('pickup stone',st());}}

// --- improvised weapons: every kind of blow, every outcome
for(const w of ['fists','bottle','shard','mug','club','stone'])for(const kind of ATTACKS)for(const out of OUTS){
  setup('field',[w,3],[['axe',2]],[[300,92],[420,92,1]]);const T=pickTechnique(S.F[0],S.F[1],kind);FORCE=[out];
  act(0,kind,'improv '+w+' '+kind+' '+out);run();check('improv '+w+' '+kind+' '+out,T.name+' -> '+S.F[0].weaponKey+' '+st());
  if(T.flair||T.multi)errs.push('improv '+w+' '+kind+': got a flourish/crowd move '+T.name);}

// --- gang-ups: a landed blow on Kael lets the next enemy in reach follow up
for(const pick of ['slash','thrust','overhead','hold']){
  setup('field',['sword',3],[['axe',2],['spear',2]],[[400,92],[505,92,1],[540,128,1]]);
  FORCE=['hit','hit'];READS=[false,true];PICKS=[pick];const hp0=S.F[0].hp;
  act(1,'slash','gang '+pick);run();check('gang '+pick,'K -'+(hp0-S.F[0].hp)+' opened '+opened.splice(0).join(',')+' '+st());}

// --- every command slot maps to a valid action in every state
function slotsOK(label){const A=S.F[0],D=targetOf(A);for(const sl of SLOTS){const a=slotAction(A,D,sl);if(a&&!cmdValid(A,D,a)&&!['advance','withdraw','sidestep','flank','pickup','shove','feint'].includes(a))errs.push(label+': slot '+sl+' -> '+a+' invalid');}}
setup('field',['sword',3],[['axe',2],['spear',2]],[[400,92],[460,92,1],[300,96,-1]]);slotsOK('normal');
makeClinch(S.F[0],S.F[1],false);resolveStations();slotsOK('holding');
makeClinch(S.F[1],S.F[0],false);resolveStations();slotsOK('held');
makeClinch(S.F[1],S.F[0],true);resolveStations();slotsOK('held behind');
endClinch(S.F[0]);knockDown(S.F[0]);settle(60);slotsOK('downed');
// --- the AI only ever picks valid commands
{let bad=0,n=0;for(let s=0;s<200;s++){setup('field',['sword',3],[['axe',2],['spear',2]],[[400,92],[460,92,1],[330,96,-1]]);
  const roll=s%5;if(roll===0)makeClinch(S.F[1],S.F[0],false);else if(roll===1)makeClinch(S.F[2],S.F[0],true);else if(roll===2)makeClinch(S.F[0],S.F[1],false);else if(roll===3)knockDown(S.F[1]);
  resolveStations();for(const i of [0,1,2]){S.auto=true;const A=S.F[i],c=aiChoice(i);n++;if(!cmdValid(A,targetOf(A),c)){bad++;if(bad<6)errs.push('ai '+A.name+' chose '+c+' in state '+roll);}}}
 rep.push('ai choices '+n+' bad '+bad);}

console.log(rep.filter(r=>!/^(improv|ground|front|held|kaelBehind|heldBehind) /.test(r)).join('\\n'));
const cnt=p=>rep.filter(r=>r.startsWith(p)).length;
console.log('dirty runs',cnt('front')+cnt('held')+cnt('kaelBehind')+cnt('heldBehind'),'ground runs',cnt('ground'),'improv runs',cnt('improv'));
const nm={};for(const r of rep.filter(r=>/^(improv|ground) /.test(r))){const m=r.match(/^(\\w+) (\\w+) (\\w+) \\w+ (.+?) (->|[A-Z]?[a-z]+:\\d)/);if(m){const k=m[1]+' '+m[2]+' '+m[3]+': '+m[4];nm[k]=1;}}
console.log(Object.keys(nm).join(' | '));
console.log('errors',errs.length,[...new Set(errs)].slice(0,30));
`);
