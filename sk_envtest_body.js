
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
  for(const f of S.F)f.dsd={};if(o.divs){envReset();for(const d of o.divs)addDiv(...d);}else if(o.env)envBuild();
  S.target=o.target||1;warm(80);S.game.phase='input';startTurn(0);S.game.aiAt=null;S.game.active=0;for(const f of S.F){f.intent=null;f.ready=0;}
  FORCE=[];ROLLS=[];READS=[];SHOVE=null;S.forceStuck=null;}
let PICKS=[],opened=[];
function run(max=120*12){let n=0;for(;n<max;n++){simStep();
    if(S.opening){const p=PICKS.shift()||'hold';opened.push(S.opening.f.name+':'+S.opening.source+'>'+p);resolveOpening(p);}
    for(const f of S.F)for(const q of f.p)if(!Number.isFinite(q.x+q.y)){errs.push('NaN '+f.name);return -1;}
    if(S.game.phase!=='exchange'&&!S.opening)return n;}return n;}
// (since V70 a man put down rises free at the start of his own turn, sk_rise.js, and the runs here play on into it: what a move did to
// him is read where its exchange ends)
let DOWNED=new Set();V11.exchangeEnd.push(ex=>{if(ex&&!ex.rise)DOWNED=new Set(S.F.filter(f=>f.downed||f.dead));});
const wasDown=f=>f.downed||f.dead||DOWNED.has(f);
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


const bodySide=(f,w)=>Math.sign(f.p[PEL].x-w.x);
const inside=()=>{for(const w of S.divs)if(divSolid(w))for(const f of S.F){if(f.dead||!divBand(w,f.dep,0))continue;if(Math.abs(f.p[PEL].x-w.x)<w.t/2+2)return f.name+' in '+w.mat;}return null;};
// ---- shoves: paper goes at once, glass on the second, plaster takes three (a crushing shove counts double)
for(const [mat,need] of [['paper',1],['glass',2],['plaster',3],['plank',2]]){
  setup(['sword',4],[['axe',2]],null,[[330,92],[262,92,-1]],{divs:[[mat,200,20,150]]});const K=S.F[0],V=S.F[1],w=S.divs[0];
  let n=0,thru=false;
  for(let k=0;k<4&&!thru;k++){if(V.downed){V.downed=false;standUp(V);settle(40);}
    const s0=bodySide(V,w);SHOVE='ok';act(0,'shove','shove '+mat);run();settle(60);n++;
    if(w.state==='broken'){thru=true;if(bodySide(V,w)===s0)errs.push('shove '+mat+': broke but body stayed on the near side');if(!wasDown(V))errs.push('shove '+mat+': not floored after going through');}
    else{if(bodySide(V,w)!==s0)errs.push('shove '+mat+': body passed a standing divider');if(V.station>divL(w)-DIV_M+1&&V.station<divR(w)+DIV_M-1)errs.push('shove '+mat+': station inside the margin');
      K.station=clampSt(K,V.station+70);settle(30);}
    const ii=inside();if(ii)errs.push('shove '+mat+': '+ii);}
  if(!thru)errs.push('shove '+mat+': never broke');
  if(n!==need)errs.push('shove '+mat+': took '+n+' shoves, expected '+need);
  if(!S.bill.total)errs.push('shove '+mat+': no bill');
  check('shove '+mat,n+' shoves, bill '+S.bill.total+' '+st());}
// a crushing shove takes two strength
{setup(['sword',4],[['axe',2]],null,[[330,92],[262,92,-1]],{divs:[['plaster',200,20,150]]});const w=S.divs[0];
  const _r=resolveShove;resolveShove=(A,D,op)=>{resolveShove=_r;const r=_r(A,D,op);r.ok=true;r.crush=true;return r;};act(0,'shove','crush');run();settle(40);
  if(w.hp!==1)errs.push('crush plaster: hp '+w.hp+' expected 1');check('crushing shove into plaster','hp '+w.hp);}
// ---- knockbacks from blows: a big crit drives through glass, a plain hit slams
for(const out of ['hit','crit']){
  setup(['axe',4],[['sword',2]],null,[[600,92],[668,92,1]],{divs:[['glass',720,20,150]]});const K=S.F[0],V=S.F[1],w=S.divs[0],s0=bodySide(V,w);
  FORCE=[out];act(0,'overhead','knock '+out);const ex=S.game.ex;run();settle(80);const r=ex.res;
  if(r.out!==out){rep.push('knock '+out+' (not possible)');continue;}
  if(!r.divRes)errs.push('knock '+out+': no divider result, knock '+r.knock);
  if(r.divRes==='breach'&&w.state!=='broken')errs.push('knock '+out+': breach but glass stands');
  if(r.divRes==='slam'&&(w.state==='broken'||w.hp!==1))errs.push('knock '+out+': slam left hp '+w.hp);
  if(w.state!=='broken'&&bodySide(V,w)!==s0)errs.push('knock '+out+': through a standing pane');
  if(r.divRes==='breach'&&!wasDown(V))errs.push('knock '+out+': breach without a fall');
  check('knockback '+out+' into glass',r.divRes+' +'+r.divDmg+' glass '+w.state+w.hp+' '+st());}
// ---- throws: into a solid divider (slam) and through a weak one
for(const [mat,hp] of [['plaster',3],['paper',1],['glass',1]]){
  setup(['sword',4],[['axe',2]],null,[[236,92,1],[296,92,1]],{divs:[[mat,176,20,150]]});const K=S.F[0],V=S.F[1],w=S.divs[0];w.hp=hp;
  makeClinch(K,V,false);resolveStations();settle(30);const th=throwInfo(K);
  if(!th||!th.hazard||th.hazard.kind!=='div')errs.push('throw '+mat+': divider not chosen '+JSON.stringify(th&&{how:th.how,x:th.x,hz:th.hazard&&th.hazard.kind}));
  const hp0=V.hp;ROLLS=['ok'];act(0,'throw','throw '+mat);run();settle(80);
  const thru=w.state==='broken';
  if(hp===1&&!thru)errs.push('throw '+mat+': should go through');if(hp>1&&(thru||w.hp!==hp-1))errs.push('throw '+mat+': should slam, hp '+w.hp);
  if(thru&&bodySide(V,w)>0)errs.push('throw '+mat+': went through but landed on the near side');
  if(!thru&&bodySide(V,w)<0)errs.push('throw '+mat+': landed beyond a standing divider');
  const ii=inside();if(ii)errs.push('throw '+mat+': '+ii);
  check('throw into '+mat,(thru?'through':'slam')+' dmg '+(hp0-V.hp)+' '+st());}
// ---- attacks with a divider in the way
{ // through a paper screen
  setup(['sword',4],[['axe',2]],null,[[140,92,1],[214,92,1]],{divs:[['paper',176,20,150]]});const K=S.F[0],V=S.F[1],w=S.divs[0];
  const T=pickTechnique(K,V,'slash');if(!T.through)errs.push('through: technique '+T.name);
  const hp0=V.hp;FORCE=['hit'];act(0,'slash','through');run();settle(30);
  if(w.state!=='broken')errs.push('through: screen still up');if(V.hp>=hp0)errs.push('through: no damage');if(bodySide(K,w)>0)errs.push('through: attacker crossed');
  check('slash through the screen',T.name+' dmg '+(hp0-V.hp));}
{ // into a solid booth wall: the wall takes it, Qadir doesn't
  setup(['sword',4],[['axe',2]],null,[[140,92,1],[214,92,1]],{divs:[['plaster',176,20,150]]});const K=S.F[0],V=S.F[1],w=S.divs[0];
  const T=pickTechnique(K,V,'slash');if(!T.into)errs.push('into: technique '+T.name);
  const hp0=V.hp;act(0,'slash','into');const ex=S.game.ex;run();settle(30);
  if(ex.res.out!=='wall')errs.push('into: outcome '+ex.res.out);if(w.hp!==2)errs.push('into: wall hp '+w.hp);if(V.hp!==hp0)errs.push('into: Qadir hurt');
  FORCE=[];act(0,'overhead','into 2');run();settle(30);if(w.state!=='broken')errs.push('into: overhead should break hp 2 wall, hp '+w.hp);
  check('blows into the booth wall','wall '+w.state+' '+st());}
{ // around the end of a divider when the target is out of reach behind it
  setup(['sword',4],[['axe',2]],null,[[120,92,1],[330,92,1]],{divs:[['plaster',176,40,140]]});const K=S.F[0],V=S.F[1],w=S.divs[0];
  const T=pickTechnique(K,V,'thrust');if(!T.aroundW)errs.push('around: technique '+T.name+' through '+!!T.through+' into '+!!T.into);
  FORCE=['hit'];READS=[false];act(0,'thrust','around');const ex=S.game.ex;let maxIn=0;
  for(let n=0;n<120*8&&(S.game.phase==='exchange');n++){simStep();const x=K.p[PEL].x;if(divBand(w,K.dep,0)&&Math.abs(x-w.x)<w.t/2+4)maxIn++;}
  settle(30);if(maxIn)errs.push('around: walked through the wall '+maxIn+' steps');if(w.state==='broken')errs.push('around: broke the wall');
  check('thrust round the booth wall','contact '+!!ex.perf.contact+' '+st());}
// ---- moves never pass through a divider
{ setup(['sword',4],[['axe',2],['spear',1]],null,[[150,92,1],[300,92,1],[360,40,1]],{divs:[['plaster',220,20,170]]});const K=S.F[0];
  const ai=advanceInfo(K,S.F[1]);if(ai&&divOnSeg(K.station,K.lane,ai.x,ai.z))errs.push('advance crosses the wall');
  if(cmdValid(K,S.F[1],'shove'))errs.push('shove across a wall allowed');if(grabInfo(K,S.F[1]))errs.push('grab across a wall allowed');
  const si=sidestepInfo(K,S.F[2]);if(si&&divOnSeg(K.station,K.lane,si.x??K.station,si.to))errs.push('sidestep crosses');
  const x=clampSt(K,400,92);if(x>220-6-DIV_M+.5)errs.push('clampSt let Kael past the wall: '+x);
  if(laneOK(K,92,222))errs.push('laneOK inside a wall');
  check('no walking through walls',ai?'advance '+Math.round(ai.x)+'/'+Math.round(ai.z):'no advance');}
// ---- the restaurant: furniture rests, breaks under a body, wares shatter, lamps burst
{ setup(['sword',4],[['axe',2]],null,[[360,92],[560,92,1]],{arena:'restaurant',env:true});
  const snap=S.props.map(P=>P.pts.map(q=>q.x.toFixed(2)+','+q.y.toFixed(2)).join(';'));settle(120*6);
  let moved=0;S.props.forEach((P,i)=>{if(P.pts.map(q=>q.x.toFixed(2)+','+q.y.toFixed(2)).join(';')!==snap[i])moved++;});
  if(moved)errs.push('restaurant: '+moved+' props drifted at rest');
  const broken=S.props.filter(P=>P.broken).length;if(broken)errs.push('restaurant: '+broken+' props broke at rest');
  if(S.wares.some(w=>w.gone))errs.push('restaurant: wares broke at rest');
  // fling a body into a bistro table
  const B=S.props.find(P=>P.type==='bistro');const V=S.F[1];V.station=B.box.cx+60;V.lane=V.dep=B.dep;V.build();for(const f of S.F)f.dsd={};knockDown(V);
  for(const q of V.p){q.px=q.x+9;q.py=q.y+1;}let n=0;for(;n<240&&!B.broken;n++)simStep();
  if(!B.broken)errs.push('restaurant: flung body did not break the table');settle(240);
  const fell=S.wares.filter(w=>w.host===null&&!w.gone).length,gone=S.wares.filter(w=>w.gone).length;
  if(!gone)errs.push('restaurant: nothing shattered when the table broke');
  // a lamp struck hard goes out
  const L=S.lamps[0];lampHit(L,200,V);if(!L.lit)errs.push('restaurant: lamp broke on a light knock');lampHit(L,500,V);
  if(L.lit)errs.push('restaurant: lamp survived a hard hit');
  // and an overhead swung right under a lamp catches it
  {const L2=S.lamps.find(l=>l.lit&&Math.abs(l.dep-92)<6);if(L2){const K=S.F[0],V2=S.F[1];V2.downed=false;standUp(V2);V2.hp=200;K.station=L2.x-40;K.lane=K.dep=L2.dep;V2.station=L2.x+40;V2.lane=V2.dep=L2.dep;
    K.build();V2.build();for(const f of S.F)f.dsd={};settle(60);let hitL=false;const _lh=lampHit;lampHit=(LL,vn,f)=>{if(LL===L2)hitL=true;_lh(LL,vn,f);};
    for(let k=0;k<3&&!hitL;k++){FORCE=['block'];act(0,'overhead','lamp overhead');run();settle(30);}lampHit=_lh;
    rep.push('overhead under a lamp: touched '+hitL+' lit '+L2.lit);}}
  check('restaurant props','broken '+S.props.filter(P=>P.broken).length+' wares gone '+gone+' bill '+S.bill.total+' lamps out '+S.lamps.filter(l=>!l.lit).length);}
// ---- loot: chair legs and bottles
{ setup(['sword',4],[['axe',2]],null,[[360,92],[560,92,1]],{arena:'restaurant',env:true});
  const C=S.props.find(P=>P.type==='chair');breakProp(C,1,600);settle(120);const L=lootList();
  if(!L.some(l=>l.kind==='chairleg'))errs.push('loot: no chair legs');if(!L.some(l=>l.kind==='bottle'&&l.src==='ware'))errs.push('loot: no bottles');
  const K=S.F[0];dropWeapon(K,1,false);const pi=pickupInfo(K);if(!pi)errs.push('loot: nothing to pick up');
  else{act(0,'pickup','pickup');run();settle(40);if(K.wp.unarmed)errs.push('loot: still unarmed');}
  check('loot',K.weaponKey);}
// ---- tripping over a chair, landing on furniture
{ setup(['axe',4],[['sword',2]],null,[[360,92],[440,92,1]],{arena:'field'});envReset();const V=S.F[1];V.posture='off';
  const C=addProp('chair',V.station+40,92,-1);settle(30);V.posture='off';
  FORCE=['hit'];act(0,'slash','trip');const ex=S.game.ex;run();settle(40);
  rep.push('trip check: knock '+ex.perf.knock+' downed '+V.downed);
  check('trip over a chair','');}
{ setup(['sword',4],[['axe',2]],null,[[300,92,1],[360,92,1]],{arena:'field'});envReset();const K=S.F[0],V=S.F[1];
  const B=addProp('bistro',K.station-62,92,1);settle(20);makeClinch(K,V,false);resolveStations();settle(20);
  const th=throwInfo(K);if(!th||!th.hazard||th.hazard.kind!=='prop')errs.push('throw onto table: hazard '+(th&&th.hazard&&th.hazard.kind));
  ROLLS=['ok'];act(0,'throw','throw prop');run();settle(60);if(!B.broken)errs.push('throw onto table: table intact');
  check('throw onto a bistro table',st());}
// ---- a long restaurant brawl: nobody ends up inside a divider, nothing goes NaN
{ setup(['sword',4],[['axe',2],['spear',1],['dagger',1]],['spear',3],[[430,92],[630,64,1],[680,124,1],[250,98,-1],[312,150]],{arena:'restaurant',env:true});
  S.auto=true;S.allyAuto=true;S.game.aiAt=S.t+.1;let bad=0,n=0,lastEx=null,since=0;
  for(;n<120*150&&S.game.phase!=='over';n++){simStep();tickOpening(DT*3);if(n%10===0){const ii=inside();if(ii){bad++;if(bad<3)errs.push('brawl: '+ii+' at t '+S.t.toFixed(1));}}
    if(S.game.ex!==lastEx){lastEx=S.game.ex;since=n;}else if(S.game.phase==='exchange'&&n-since>120*14){errs.push('brawl: exchange stuck '+lastEx.cmd);break;}
    for(const f of S.F)for(const q of f.p)if(!Number.isFinite(q.x+q.y)){errs.push('brawl NaN');n=1e9;break;}}
  rep.push('restaurant brawl: '+S.game.phase+' turn '+S.game.turnNo+' bill '+S.bill.total+' divs '+S.divs.map(w=>w.mat+':'+w.state).join(',')+' '+st());}
console.log(rep.join('\n'));console.log('errors',errs.length,errs.slice(0,30));
