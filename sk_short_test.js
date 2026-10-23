// Short Hand (sk_short.js): the stance and its steps, the Hinge and the inside of a man's reach, the Wrist toll against a Thrust and
// against a Grab (the enemy's read and the player's own window), the Short ladder and its threat, the blind-side check, the ankle hook
// over a crate, what the AI picks, whole fights with the style on either side, and the same fight twice from the same seed.
// Runs with the module loaded: SK_EXTRA=short node sk_short_test.js (once the build lists it, plain node).
const core=require('./sk_src.js')(process.argv[2]);
// (the checks are written as a function and run as source text in the game's own scope, so they can wrap the game's functions)
function suite(){
const errs=[];let nOk=0,base=mulberry32(17),FORCE=[],REACTS=[],PICKS=[],TOLLS=[],SHOVES=[],GRABS=[];const opened=[],R=[],EV=[],GRB=[],BR=[];
S.rng=()=>base();Math.random=()=>base();
function expect(label,ok,extra){if(ok)nOk++;else errs.push(label+(extra!=null?': '+extra:''));console.log((ok?'ok   ':'FAIL ')+label+(extra!=null?'  '+extra:''));}
if(typeof shortOn!=='function'){expect('sk_short.js is loaded (run with SK_EXTRA=short until the build lists it)',false);console.log('checks '+nOk);console.log('errors '+errs.length+' '+JSON.stringify(errs));return;}
// a forced outcome for the next attack roll (the die is picked to give it)
const _ra=resolveAttack;
resolveAttack=function(A,D,kind,op,T){T=T||pickTechnique(A,D,kind);const want=FORCE.shift();if(!want)return _ra(A,D,kind,op,T);
  const c=computeMods(A,D,kind,op,T);let pick=null;
  for(let v=2;v<=20;v++){const tot=v+c.bonus,o=isCrit(v,tot,c.def)?'crit':tot>=c.def?'hit':tot>=c.def-4?'block':'dodge';if(o===want){pick=v;if(want!=='hit')break;}}
  if(want==='hit'){for(let v=2;v<20;v++){const tot=v+c.bonus;if(tot>=c.def&&!isCrit(v,tot,c.def)){pick=v;break;}}}
  if(pick==null)return _ra(A,D,kind,op,T);
  const save=S.rng;let first=true;S.rng=()=>{if(first){first=false;return(pick-.5)/20;}return base();};const r=_ra(A,D,kind,op,T);S.rng=save;return r;};
// forced answers, tolls, shoves and grabs
const _aR=aiReact;aiReact=function(D,A,kind,T,op){const w=REACTS.shift();return w&&reactChoices(D,A).includes(w)?w:_aR(D,A,kind,T,op);};
const _aT=aiToll;aiToll=function(D,A){return TOLLS.length?TOLLS.shift():_aT(D,A);};
const _rS=resolveShove;resolveShove=function(A,D,op){const r=_rS(A,D,op);if(SHOVES.length){r.ok=SHOVES.shift();r.crush=false;}return r;};
const _rG=resolveGrab;resolveGrab=function(A,D,op){const r=_rG(A,D,op);if(GRABS.length&&!r.toll){r.ok=GRABS.shift();r.crush=false;}return r;};
styleRoll=()=>0;
S.hooks.react=(D,A,k)=>R.push(D.name+':'+k);
S.hooks.broken=(D,by)=>BR.push(D.name+' by '+by.name);
S.hooks.grab=(ex,i)=>GRB.push(i);
// what the scenes hear, with the state at that moment
S.hooks.short=(e,d)=>EV.push({e,A:d.A,D:d.D,kind:d.kind,res:d.res,ok:d.ok,Af:d.A.foot,Df:d.D.foot,Ahp:d.A.hp,Dhp:d.D.hp,Adown:d.A.downed,Ddown:d.D.downed,Aarm:d.A.wounds.arm,gap:Math.abs(d.A.station-d.D.station),Ain:d.A.inside,Din:d.D.inside});
const ev=e=>EV.filter(x=>x.e===e);
const ALL={stance:true,hinge:true,toll:true,ladder:true,check:true,hook:true};
// Ilyas (dagger, Expert) in Short Hand against the foes given, each at his striking distance on his right unless placed
function setup(foes,o={}){S.arenaKey='field';S.auto=!!o.auto;S.tableOn=false;S.divOn=false;S.cfg.n=foes.length;S.cfg.crew=false;S.cfg.ally.on=false;
  S.cfg.hero={seed:2207,weapon:'dagger',skill:4};foes.forEach((f,i)=>{S.cfg.foes[i]={seed:[5113,7741,3190][i],weapon:f[0],skill:f[1],temper:'plain'};});
  S.F=[];rosterBuild();initDuel();if(S.table)S.table.on=false;
  const K=S.F[0];K.style=o.style===undefined?'shorthand':o.style;K.styleMoves=Object.assign({},o.moves||ALL);K.oneArm=!!o.oneArm;
  K.station=380;K.lane=K.dep=K.stepDep=92;K.facing=1;K.build();
  S.F.forEach((f,i)=>{if(!f.team)return;const x=o.at&&o.at[i]!=null?o.at[i]:K.station+engageGap(K,f);f.station=x;f.lane=f.dep=f.stepDep=92;f.side=1;f.facing=-1;f.build();});
  warm(60);S.game.phase='input';startTurn(0);S.game.aiAt=null;S.game.active=0;for(const f of S.F){f.intent=null;f.ready=0;f.foot=footMaxOf(f);f.reads={};f.inside=null;}
  FORCE=[];REACTS=[];PICKS=[];TOLLS=[];SHOVES=[];GRABS=[];opened.length=0;R.length=0;EV.length=0;GRB.length=0;BR.length=0;}
// the exchange to its end; a window or an opening for a hero the player controls takes the next pick (none: the time runs out)
function run(max=120*12){let n=0;for(;n<max;n++){simStep();
    if(S.opening){const o=S.opening;opened.push(o.f.name+':'+o.source);
      if(!isAI(o.f.idx)){const p=PICKS.shift();if(p!=null)resolveOpening(p);else tickOpening(o.left+.01);}else tickOpening(1);}
    if(S.game.phase!=='exchange'&&!S.opening)return n;}return n;}
function act(i,cmd){const g=S.game;g.phase='input';g.active=i;g.aiAt=null;S.opening=null;g.ex=null;return command(i,cmd);}
const lastRes=()=>{const ex=S.game.ex;return ex&&ex.res;};
let K,V,B;

// ---------- the stance ----------
setup([['club',2]]);K=S.F[0];V=S.F[1];
{const g=tacGuard(K),G=SHORT_HAND.guard,d=GUARD.dagger;
  expect('Stance: the guard is low with the weight forward, the knife tight to the chest and angled up and forward',
    g.crouch===G.crouch&&g.lean===G.lean&&g.hx<d.hx&&g.hy<=d.hy&&g.w<d.w,JSON.stringify({crouch:g.crouch,lean:g.lean,hx:g.hx,hy:g.hy,w:g.w}));
  const b=K.guardBody();expect('Stance: his body takes it (crouch and lean)',Math.abs(b.crouch-G.crouch)<.02&&b.lean>=G.lean-.01,b.crouch.toFixed(3)+' '+b.lean.toFixed(3));
  K.foot=3;const gc=tacGuard(K);K.foot=6;
  expect('Stance: committed, the knife hand still does not reach (the guard takes back what a committed guard pushes out)',Math.abs(gc.hx+.14-G.hx)<1e-9,gc.hx);
  K.style=null;const g0=tacGuard(K);K.style='shorthand';
  expect('a fighter without the style keeps his own guard',g0.crouch===d.crouch+TACTICAL.guard.crouch&&tacGuard(V)===GUARD.club,g0.crouch);
  K.oneArm=true;K.build();const g1=tacGuard(K);K.style=null;const g2=tacGuard(K);K.style='shorthand';K.oneArm=false;K.build();
  expect('Stance: a one-armed man\'s back hand is left where it is pinned',JSON.stringify(g1.off)===JSON.stringify(g2.off),JSON.stringify(g1.off));}
// the steps: two advances, every step as it starts, and the feet whenever both are down
function stepStats(style){setup([['club',2]],{at:{1:900},style});const A=S.F[0],seen=new Set(),st={n:0,max:0,dur:0,cross:0,leg:A.leg};
  for(let a=0;a<2;a++){act(0,'advance');for(let n=0;n<180;n++){simStep();
    for(let k=0;k<2;k++){const s=A.steps[k];if(s.active&&!seen.has(s)){seen.add(s);st.n++;st.max=Math.max(st.max,Math.abs(s.to.x-s.from.x));st.dur+=s.dur;}}
    if(!A.steps[0].active&&!A.steps[1].active&&(A.steps[0].plant.x-A.steps[1].plant.x)*A.facing<=0)st.cross++;}}
  st.dur=+(st.dur/Math.max(1,st.n)).toFixed(3);st.max=Math.round(st.max);return st;}
{const a=stepStats('shorthand'),b=stepStats(null);
  expect('Stance: short chopping steps (shorter and quicker than without the style) and the feet never cross',
    a.max<=a.leg*SHORT_HAND.step.len+.5&&a.max<b.max&&a.dur<b.dur&&a.cross===0,JSON.stringify({style:a,plain:b}));}
// shoves and sweeps at him
setup([['club',2]]);K=S.F[0];V=S.F[1];
{const s1=shoveMods(V,K,false).bonus,w1=computeMods(V,K,'sweep',false).bonus,c1=computeMods(V,K,'slash',false).bonus;K.style=null;
  const s0=shoveMods(V,K,false).bonus,w0=computeMods(V,K,'sweep',false).bonus,c0=computeMods(V,K,'slash',false).bonus;K.style='shorthand';
  expect('Stance: shoves and sweeps at him are at −2, and nothing else is',s1===s0-2&&w1===w0-2&&c1===c0,[s1,s0,w1,w0,c1,c0].join(' '));}
{const lost=style=>{setup([['club',3]],{style});const D=S.F[0];let at=null;const sh=S.hooks.shove;S.hooks.shove=(ex,i)=>{if(at==null)at=D.foot;};
    SHOVES=[true];const f0=D.foot;act(1,'shove');run();S.hooks.shove=sh;return f0-at;};
  const a=lost('shorthand'),b=lost(null);expect('Stance: a shove that lands takes a pip less off him',a===b-1&&b>0,a+' vs '+b);}

// ---------- the Hinge ----------
setup([['club',2]],{moves:{stance:true}});K=S.F[0];V=S.F[1];
act(1,'slash');{const ch=S.opening?openingChoices(S.opening):[];expect('Hinge: not offered before it is learned (the Parry is)',ch[0]==='parry'&&!ch.includes('hinge'),ch.join());}
setup([['club',2]],{moves:{stance:true,hinge:true}});K=S.F[0];V=S.F[1];
act(1,'slash');{const ch=S.opening?openingChoices(S.opening):[];expect('Hinge: once learned it is offered in the Parry\'s place',ch[0]==='hinge'&&!ch.includes('parry')&&!ch.includes('toll'),ch.join());
  const r0=K.ready;FORCE=['crit'];resolveOpening('hinge');const r=lastRes(),T=r&&r.tech,dc=T&&(T.dice||V.wp.dice);
  const pre=r?(r.dice.reduce((s,d)=>s+d,0)+dc[2])*r.mult+(r.hgDmg||0):0,hm=r&&r.defMods.find(m=>m[0]==='hinge');
  expect('Hinge: +2 against a Slash, and the usual answer tempo',hm&&hm[1]===2&&K.ready-r0===REACT.cost,(hm&&hm[1])+' '+(K.ready-r0));
  expect('Hinge: a crit lands glancing: ×0.45, no double, no finisher, no knockdown, on the arm',
    r&&r.glance&&r.glanceFrom==='crit'&&r.out==='hit'&&r.dmg===Math.max(1,Math.round(pre*SHORT_HAND.hinge.glance))&&!r.kd&&!T.fin&&hitZone(r)==='arm',
    r&&JSON.stringify({dmg:r.dmg,pre:+pre.toFixed(2),out:r.out,from:r.glanceFrom,kd:r.kd,zone:hitZone(r)}));
  const k0=K.foot,v0=V.foot,hp0=K.hp,gap0=Math.abs(K.station-V.station);run();const e=ev('hinge')[0];
  expect('Hinge: he loses one pip to it at most, and the man swinging loses one',e&&k0-e.Df<=1&&e.Af===v0-1&&e.Dhp===hp0-r.dmg,e&&JSON.stringify({K:[k0,e.Df],V:[v0,e.Af],hp:[hp0,e.Dhp]}));
  expect('Hinge: he ends inside the man\'s reach (f.inside, his station in to the closest the stations allow)',
    !!K.inside&&K.inside.on===V.idx&&Math.abs(K.station-V.station)<=shortNeed(V,K)+1&&Math.abs(K.station-V.station)<gap0,Math.round(gap0)+' > '+Math.round(Math.abs(K.station-V.station)));
  expect('Hinge: no riposte opening',!opened.some(x=>x.startsWith(HERO_NAME+':')&&x!==HERO_NAME+':react'),opened.join());
  // his next attack on that man is at +2, once
  // (both blows land, so the man gets no riposte to swing into another Hinge with)
  V.foot=6;REACTS=['back'];FORCE=['hit'];act(0,'slash');const r1=lastRes(),m1=r1&&r1.mods.find(m=>m[0]==='Inside his reach');run();
  REACTS=['back'];FORCE=['hit'];act(0,'slash');const r2=lastRes(),m2=r2&&r2.mods.find(m=>m[0]==='Inside his reach');run();
  expect('Inside: +2 on his next attack on that man ("Inside his reach"), then gone',m1&&m1[1]===2&&!m2&&!K.inside,JSON.stringify({first:m1,second:m2}));}
// gone with any action of his, and no +2 twice where the dagger already has it inside a longer weapon
setup([['club',2]]);K=S.F[0];V=S.F[1];
{K.inside={on:V.idx,t:S.t};K.station=V.station-shortNeed(V,K);act(0,'wait');run();expect('Inside: gone at his next action of any kind (a Hold)',!K.inside);}
setup([['sword',2]]);K=S.F[0];V=S.F[1];
{K.inside={on:V.idx,t:S.t};K.station=V.station-shortNeed(V,K);const c=computeMods(K,V,'slash',false),a=c.mods.find(m=>m[0]==='inside the reach'),b=c.mods.find(m=>m[0]==='Inside his reach');
  expect('Inside: inside a sword\'s reach the dagger already has its +2, and it does not come twice',a&&a[1]===2&&!b,JSON.stringify([a,b]));}
// a blocked or dodged blow does him nothing, and he still ends inside
setup([['club',2]]);K=S.F[0];V=S.F[1];
{FORCE=['dodge'];PICKS=['hinge'];const k0=K.foot,hp0=K.hp,v0=V.foot;act(1,'overhead');run();const e=ev('hinge')[0];
  expect('Hinge: a blow that misses costs him nothing and the man two pips (his miss and the Hinge), and he ends inside',
    e&&e.Df===k0&&e.Dhp===hp0&&e.Af===v0-1-BAL.dodgedOver-1&&K.inside&&K.inside.on===V.idx,e&&JSON.stringify({K:[k0,e.Df],V:[v0,e.Af]}));}

// ---------- the Wrist toll ----------
setup([['dagger',3]],{moves:{stance:true,hinge:true,toll:true}});K=S.F[0];V=S.F[1];
act(1,'slash');expect('Wrist toll: not offered against a Slash',S.opening&&!openingChoices(S.opening).includes('toll'),S.opening&&openingChoices(S.opening).join());
setup([['dagger',3]],{moves:{stance:true,hinge:true,toll:true}});K=S.F[0];V=S.F[1];
act(1,'thrust');{const ch=S.opening?openingChoices(S.opening):[];expect('Wrist toll: offered against a Thrust, beside the Hinge',ch[0]==='hinge'&&ch[1]==='toll',ch.join());
  const v0=V.foot,hp0=V.hp,a0=V.wounds.arm;FORCE=['dodge'];resolveOpening('toll');const tm=lastRes().defMods.find(m=>m[0]==='wrist toll');run();const e=ev('toll')[0];
  expect('Wrist toll: +2 against the Thrust',tm&&tm[1]===SHORT_HAND.toll.def,JSON.stringify(tm));
  expect('Wrist toll vs a Thrust that misses: the hand is cut (a little damage, an arm wound) and two pips go, besides the miss\'s own one',
    e&&e.ok&&e.Af===v0-SHORT_HAND.toll.pips-BAL.dodged&&hp0-e.Ahp>=3&&hp0-e.Ahp<=6&&e.Aarm===a0+1,e&&JSON.stringify({V:[v0,e.Af],cut:hp0-e.Ahp,arm:e.Aarm}));}
setup([['dagger',3]],{moves:{stance:true,toll:true}});K=S.F[0];V=S.F[1];
{const v0=V.foot,hp0=V.hp,k0=K.hp;FORCE=['hit'];PICKS=['toll'];act(1,'thrust');run();const e=ev('toll')[0],cr=e&&e.res;
  expect('Wrist toll vs a Thrust that lands: the toll failed, normal damage',e&&!e.ok&&e.Af===v0&&e.Ahp===hp0&&cr&&!cr.glance&&e.Dhp===k0-cr.dmg,e&&JSON.stringify({ok:e.ok,V:[v0,e.Af],K:[k0,e.Dhp],dmg:cr&&cr.dmg}));}
// against a grab: the enemy's read (a hero on auto is the same)
setup([['club',2]],{auto:true});K=S.F[0];V=S.F[1];
{TOLLS=[true];const v0=V.foot,hp0=V.hp;act(1,'grab');const gr=lastRes();
  expect('Wrist toll vs a Grab (AI): no window, his own read decides before the roll is seen',!S.opening&&gr&&gr.toll===true&&gr.ok===false,gr&&JSON.stringify({toll:gr.toll,ok:gr.ok}));
  run();const e=ev('toll')[0];
  expect('Wrist toll vs a Grab (AI): the grab fails and costs the grabber exactly two pips, and a cut hand',
    e&&e.kind==='grab'&&!K.clinch&&!V.clinch&&e.Af===v0-2&&e.Ahp<hp0&&GRB.length===1&&GRB[0].toll,e&&JSON.stringify({V:[v0,e.Af],hp:[hp0,e.Ahp],clinch:!!K.clinch}));}
setup([['club',2]],{auto:true,moves:{stance:true,hinge:true}});K=S.F[0];V=S.F[1];
{TOLLS=[true];GRABS=[true];act(1,'grab');run();expect('Wrist toll vs a Grab: not before it is learned',!ev('toll').length&&GRB.length>0&&GRB[0].ok&&!GRB[0].toll,JSON.stringify(GRB));}
// against a grab: the player's own window
setup([['club',2]]);K=S.F[0];V=S.F[1];
{act(1,'grab');const o=S.opening;
  expect('Wrist toll vs a Grab (player): the grab is held and opens a window of its own',o&&o.source==='toll'&&o.f===K&&o.opp===V&&S.game.ex.tollPending&&!S.game.ex.plan&&JSON.stringify(openingChoices(o))==='["toll","let"]',
    o&&o.source+' '+openingChoices(o).join());
  const r0=K.ready,v0=V.foot;resolveOpening('toll');const r1=K.ready;run();const e=ev('toll')[0];
  expect('Wrist toll window: Wrist toll fails the grab for two pips, at the answer tempo',e&&e.kind==='grab'&&!K.clinch&&e.Af===v0-2&&r1-r0===REACT.cost,e&&JSON.stringify({V:[v0,e.Af],tempo:r1-r0}));}
setup([['club',2]]);K=S.F[0];V=S.F[1];
{act(1,'grab');const r0=K.ready;GRABS=[true];resolveOpening('let');const r1=K.ready;run();
  expect('Wrist toll window: Let it come, and the grab goes as it would (here it lands), at no tempo',!ev('toll').length&&GRB.length&&GRB[0].ok&&!GRB[0].toll&&r1===r0,JSON.stringify(GRB.map(i=>i.ok))+' tempo '+(r1-r0));}
setup([['club',2]]);K=S.F[0];V=S.F[1];
{act(1,'grab');TOLLS=[true];run();expect('Wrist toll window: if the time runs out, his own read answers',opened.includes(HERO_NAME+':toll')&&ev('toll').length===1,opened.join());}

// ---------- the Short ladder ----------
setup([['club',2]],{moves:{stance:true,hinge:true,toll:true}});K=S.F[0];V=S.F[1];
{const T=pickTechnique(K,V,'thrust');expect('Short ladder: not before it is learned',T.key!=='shortladder',T.name);}
setup([['club',2]]);K=S.F[0];V=S.F[1];
{const T=pickTechnique(K,V,'thrust');
  expect('Short ladder: once learned, the Thrust is the Short ladder (+1, the belly, a short reach, a rising line)',T.key==='shortladder'&&T.name==='Short ladder'&&T.acc===1&&T.anchor==='belly'&&T.reach===SHORT_HAND.ladder.reach&&T.move&&T.dmg===1,T.name+' '+T.acc+' '+T.dmg);
  V.guarding=true;const gp=computeMods(K,V,'thrust',false,T).defMods.find(m=>m[0]==='parry'),gs=computeMods(K,V,'thrust',false,{...T,hook:false}).defMods.find(m=>m[0]==='parry');V.guarding=false;
  expect('Short ladder: under the guard, so a Parry adds only +2',gp[1]===2&&gs[1]===4,gp[1]+' vs '+gs[1]);
  K.inside={on:V.idx,t:S.t};K.station=V.station-shortNeed(V,K);const Ti=pickTechnique(K,V,'thrust');K.inside=null;const Tc=pickTechnique(K,V,'thrust');
  K.station=V.station-engageGap(K,V);const To=pickTechnique(K,V,'thrust');
  expect('Short ladder: ×1.35 from inside his reach (by a Hinge, or standing in close), not at striking distance',Ti.dmg===SHORT_HAND.ladder.dmg&&Ti.tags.includes('From inside')&&Tc.dmg===SHORT_HAND.ladder.dmg&&To.dmg===1,[Ti.dmg,Tc.dmg,To.dmg].join(' '));
  K.inside={on:V.idx,t:S.t};K.station=V.station-shortNeed(V,K);REACTS=['back'];FORCE=['hit'];act(0,'thrust');const r=lastRes();run();const e=ev('ladder')[0];
  expect('Short ladder: it goes in at the bonus from inside, and the scenes hear it',r&&r.tech.key==='shortladder'&&Math.abs(r.mult-ACTIONS.thrust.mult*SHORT_HAND.ladder.dmg)<1e-9&&e&&e.res===r,r&&r.mult);}
// the threat
setup([['club',2]]);K=S.F[0];V=S.F[1];
{K.shortThreat=true;const hp0=V.hp;act(0,'thrust');const r=lastRes();
  expect('Threat: the next Short ladder is a threat: not answered, it lands for nothing',r&&r.threat&&r.out==='hit'&&r.dmg===0&&!r.kd&&!r.tech.fin&&!R.length&&!K.shortThreat,r&&JSON.stringify({out:r.out,dmg:r.dmg,R}));
  run(600);const nk=lerp(V.p[CHE].y,V.p[HEAD].y,.55),tip=K.p[TIP];
  expect('Threat: the point holds under his chin and the action does not end on its own',S.game.phase==='exchange'&&K.action&&K.action.end>1e8&&!!K._threat&&K._threat.D===V&&Math.abs(tip.y-nk)<22&&Math.abs(tip.x-V.p[CHE].x)<34,
    JSON.stringify({phase:S.game.phase,tip:[Math.round(tip.x),Math.round(tip.y)],neck:[Math.round(V.p[CHE].x),Math.round(nk)]}));
  expect('Threat: he loses every pip (Broken, the engine\'s way), takes nothing, and stands frozen; nobody gets an opening',
    V.hp===hp0&&V.foot===0&&!!V.broken&&BR.includes(V.name+' by '+HERO_NAME)&&V.frozen&&V.action&&V.action.end>1e8&&!opened.length,JSON.stringify({hp:[hp0,V.hp],foot:V.foot,opened}));
  const ok=shortRelease(K);run();
  expect('Threat: shortRelease ends it: the knife comes away, he breathes, and the next turn comes',ok&&S.game.phase==='input'&&!K._threat&&!V.frozen&&!K.shortThreat&&shortRelease(K)===false,S.game.phase);}

// ---------- the blind-side check ----------
setup([['club',2]]);K=S.F[0];V=S.F[1];
{const kind=()=>{const v=shoveVariant(K,V);return v?v.kind+(v.floor?'/floor':''):'none';},seen=[];
  V.foot=6;seen.push(kind());V.foot=3;seen.push(kind());V.foot=1;seen.push(kind());
  V.foot=6;K.inside={on:V.idx,t:S.t};K.station=V.station-shortNeed(V,K);seen.push(kind());K.inside=null;
  K.station=V.station-engageGap(K,V)-APPROACH_FREE-30;V.foot=3;seen.push(kind());K.station=V.station-engageGap(K,V);
  expect('Blind-side check: on a man committed or off balance, or set but with him inside; not a set man at arm\'s length, nor one out of reach',
    seen.join()==='none,blindcheck,blindcheck/floor,blindcheck,none',seen.join());
  V.foot=1;const cb=actionCost(K,'shove',moveCost(K,V,'shove'));K.styleMoves.check=false;const v2=shoveVariant(K,V),cs=actionCost(K,'shove',moveCost(K,V,'shove'));K.styleMoves.check=true;
  expect('Blind-side check: less tempo than the Shoulder check, and named for itself',moveCost(K,V,'shove')===SHORT_HAND.check.cost&&v2&&v2.kind==='shoulder'&&cb<cs&&moveName(K,V,'shove')==='Blind-side check',cb+' < '+cs);}
setup([['club',2]]);K=S.F[0];V=S.F[1];
{V.foot=3;SHOVES=[true];const x0=V.station;act(0,'shove');const sr=lastRes();run();const e=ev('check')[0];
  expect('Blind-side check on a committed man: two pips and a step back, and he keeps his feet',sr&&sr.blind&&!sr.blindFloor&&e&&e.Df===1&&!e.Ddown&&Math.abs(V.station-x0)>=20,e&&JSON.stringify({foot:e.Df,down:e.Ddown,moved:Math.round(Math.abs(V.station-x0))}));}
setup([['club',2]]);K=S.F[0];V=S.F[1];
{V.foot=1;SHOVES=[true];act(0,'shove');const sr=lastRes();run();const e=ev('check')[0];
  expect('Blind-side check on a man off balance: floored, like the Shoulder check',sr&&sr.blind&&sr.blindFloor&&sr.shoulder&&e&&e.Ddown,e&&JSON.stringify({down:e.Ddown}));}

// ---------- the ankle hook ----------
setup([['club',2]],{moves:{stance:true}});K=S.F[0];V=S.F[1];
{const T=pickTechnique(K,V,'sweep');expect('Ankle hook: not before it is learned (the Reaping kick)',T.key==='kick',T.name);}
setup([['club',2]]);K=S.F[0];V=S.F[1];
{const T=pickTechnique(K,V,'sweep');V.guarding=true;const gh=computeMods(K,V,'sweep',false,T).defMods.find(m=>m[0]==='parry')[1],gk=computeMods(K,V,'sweep',false,{...T,key:'kick'}).defMods.find(m=>m[0]==='parry')[1];V.guarding=false;
  expect('Ankle hook: the dagger\'s sweep is the Ankle hook (kdEase +1; the knife high, so a Parry is worth less)',T.key==='anklehook'&&T.name==='Ankle hook'&&T.kdEase===1&&T.kick&&gh<gk,T.name+' parry '+gh+' vs '+gk);
  const P=addProp('crate',V.station+V.body.torsoW+20,V.lane,1),T2=pickTechnique(K,V,'sweep');
  REACTS=['back'];FORCE=['hit'];const hp0=V.hp;act(0,'sweep');const r=lastRes();run();const e=ev('hook')[0];
  expect('Ankle hook: a crate just behind him, and a hit puts him over it',T2.tags.includes('Over the crate')&&r&&r.hookProp===P&&e&&e.Ddown&&S.popups.some(p=>p.text==='Tripped'&&p.sub==='over a crate'),
    JSON.stringify({tags:T2.tags,prop:!!(r&&r.hookProp),down:e&&e.Ddown,pops:S.popups.map(p=>p.text+'/'+p.sub)}));}

// ---------- the AI ----------
setup([['dagger',2]],{auto:true});K=S.F[0];V=S.F[1];
{const pick=(kind,n=300)=>{const g=S.game,ex0=g.ex;g.ex={A:V,D:K,cmd:kind};const T=pickTechnique(V,K,kind),c={};for(let i=0;i<n;i++){const k=aiReact(K,V,kind,T,false);c[k]=(c[k]||0)+1;}g.ex=ex0;return c;};
  const cs=pick('slash'),co=pick('overhead'),ct=pick('thrust');
  expect('AI: a Short Hand fighter answers a Slash and an Overhead with the Hinge',(cs.hinge||0)>150&&(co.hinge||0)>150,JSON.stringify({slash:cs,overhead:co}));
  expect('AI: and a Thrust with the Wrist toll',(ct.toll||0)>150,JSON.stringify(ct));
  let y=0;for(let i=0;i<300;i++)if(aiToll(K,V))y++;expect('AI: the toll against a grab, by his read',y>150&&y<300,y+' of 300');
  const count=(k,n=400)=>{let c=0;for(let i=0;i<n;i++){S.game.active=0;if(aiChoice(0)===k)c++;}return c;};
  // (the weights it picks its attack from, and what it picks over many turns)
  const ok=c=>cmdValid(K,V,c),wts=()=>{const w={slash:4,overhead:.5,thrust:4,sweep:.3};moveWeights(K,V,w,pickTechnique(K,V,'slash'),ok);return w;};
  K.station=V.station-engageGap(K,V);V.foot=6;const w0=wts(),t0=count('thrust',800);K.inside={on:V.idx,t:S.t};K.station=V.station-shortNeed(V,K);const w1=wts(),t1=count('thrust',800);K.inside=null;
  expect('AI: the Short ladder when inside (inside his reach he stabs rather than cuts)',w1.thrust===w0.thrust+6&&w1.slash===w0.slash/2&&t1>t0+40,JSON.stringify({out:w0,in:w1})+' picks '+t0+' → '+t1+' of 800');
  K.station=V.station-engageGap(K,V);V.foot=3;K.styleMoves.check=false;const s0=count('shove');K.styleMoves.check=true;const s1=count('shove');V.foot=6;
  expect('AI: the blind-side check on a man not set',s1>s0+20,s0+' → '+s1);
  const h0=count('sweep');const P=addProp('barrel',V.station+V.body.torsoW+22,V.lane,1);const h1=count('sweep');P.broken=true;
  expect('AI: the ankle hook with a barrel behind him',h1>h0+30,h0+' → '+h1);}

// ---------- whole fights ----------
// Short Hand on auto against two ordinary foes (and the same with a crate and a barrel about), and a Short Hand foe against Ilyas
// (every exchange as it ends: whose, what, how it came out, and everyone's health after it)
let TR=null;V11.exchangeEnd.push(ex=>{if(TR&&ex)TR.push(S.game.turnNo+':'+ex.A.name+':'+ex.cmd+':'+(ex.res&&ex.res.out||'')+':'+S.F.map(f=>f.hp).join(','));});
function fight(seed,o={}){base=mulberry32(seed);S.t=0;setup(o.foes||[['club',2],['club',3]],{auto:true,moves:ALL});
  if(o.props){addProp('crate',560,92,1);addProp('barrel',250,92,1);}
  // (drained: a man's speed and no magic, as in Act I, so the fight runs longer and closer)
  if(o.drain){S.F[0].drain=1;S.F[0].aether=0;}
  if(o.foeStyle){const F=S.F[1];S.F[0].style=null;F.style='shorthand';F.styleMoves=Object.assign({},ALL);F.setWeapon('dagger');}
  S.game.aiAt=S.t;
  const trace=[];let n=0,err=null;TR=trace;
  try{for(;n<120*600&&S.game.phase!=='over';n++){simStep();if(S.opening)tickOpening(1);
      for(const f of S.F)if(!Number.isFinite(f.hp+f.p[PEL].x+f.p[TIP].y))throw new Error('NaN '+f.name);}}
  catch(e){err=e.stack||String(e);}
  TR=null;
  return{err,over:S.game.phase==='over',turns:S.game.turnNo,trace,hp:S.F.map(f=>f.hp),ev:EV.map(x=>x.e)};}
{const tally={},runs=[];let bad=null;
  for(const [seed,o] of [[101,{}],[202,{props:true,drain:true}],[303,{drain:true,foes:[['club',2],['club',3],['dagger',2]]}],[404,{props:true,drain:true,foes:[['club',3],['dagger',3]]}],
      [505,{foeStyle:true,foes:[['dagger',3]]}],[606,{foeStyle:true,props:true,drain:true,foes:[['dagger',4]]}]]){
    const f=fight(seed,o);runs.push(seed+':'+(f.over?'over':'cut')+'/'+f.turns);if(f.err||!f.over)bad=bad||(seed+' '+(f.err||'never ended, turn '+f.turns));for(const e of f.ev)tally[e]=(tally[e]||0)+1;}
  expect('Whole fights: a Short Hand fighter against ordinary foes (and one in their ranks) runs to the end without errors',!bad,bad||runs.join(' '));
  expect('Whole fights: the AI uses every move in real fights (Hinge, Wrist toll, Short ladder, check, hook)',['hinge','toll','ladder','check','hook'].every(k=>tally[k]>0),JSON.stringify(tally));
  const o7={props:true,drain:true,foes:[['club',3],['dagger',3],['club',3]]},a=fight(777,o7),b=fight(777,o7);
  expect('The same seed gives the same fight twice',!a.err&&a.trace.length>=12&&JSON.stringify(a)===JSON.stringify(b),a.trace.length+' exchanges, turn '+a.turns+', hp '+a.hp.join('/')+', '+a.ev.length+' moves'+(a.err?' '+a.err:''));}

console.log('checks '+nOk);
console.log('errors '+errs.length+' '+JSON.stringify(errs));
}
const src=suite.toString();
eval(core+'\n('+src+')();');
