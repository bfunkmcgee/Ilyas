// Forced tests for V12: the restaurant run on past the kitchen to the lobby and the executive's office
const core=require('./sk_src.js')(process.argv[2]);
eval(core+`
const errs=[],rep=[];let base=mulberry32(29),FORCE=[];
S.rng=()=>base();
const _ra=resolveAttack;
resolveAttack=function(A,D,kind,op,T){T=T||pickTechnique(A,D,kind);const want=FORCE.shift();if(!want)return _ra(A,D,kind,op,T);
  const c=computeMods(A,D,kind,op,T);let pick=null;
  for(let v=1;v<=20;v++){const o=outcomeOf(v,v+c.bonus,c.def);if(o===want){pick=v;break;}}
  if(pick==null){errs.push('cannot force '+want);return _ra(A,D,kind,op,T);}
  const save=S.rng;let first=true;S.rng=()=>{if(first){first=false;return(pick-.5)/20;}return base();};const r=_ra(A,D,kind,op,T);S.rng=save;return r;};
readRoll=function(){return{roll:2,bonus:0,total:2,dc:20,ok:false};};
styleRoll=()=>0;
function expect(label,cond,info){rep.push((cond?'ok   ':'FAIL ')+label+(info?'  '+info:''));if(!cond)errs.push(label+(info?' ('+info+')':''));}
const phases=[];S.hooks.phase=s=>phases.push(s+'@'+S.room);
let won=null;S.hooks.over=w=>{won=w;};
function setup(o={}){S.arenaKey='restaurant';S.auto=true;S.allyAuto=!!o.ally;S.tableOn=o.table!==false;S.divOn=true;S.showcase=false;S.backroom=true;S.deep=o.deep!==false;
  S.cfg.n=o.n||1;S.cfg.crew=!!o.crew;if(o.crew)S.cfg.n=1;S.introOn=false;won=null;
  S.cfg.ally={on:!!o.ally,seed:6427,weapon:'spear',skill:3};S.cfg.hero={seed:2207,weapon:'elven',skill:4};
  S.F=[];rosterBuild();initDuel();phases.length=0;S.hooks.log=()=>{};}
function act(i,cmd){const g=S.game;g.phase='input';g.active=i;g.aiAt=null;S.opening=null;return command(i,cmd);}
// the room is cleared: everyone but one enemy falls at once (and nobody is left waiting to come in), Kael finishes the last
// with a forced hit, and the sim runs until the next room's fight starts, the last scene begins, or the fight is over
function clearRoom(){const K=S.F[0];K.hp=K.maxHp;if(S.crew)S.crew.queue.length=0;
  const fs=foes();for(const f of fs.slice(1)){f.hp=0;kill(f,1);}
  const V=fs[0];if(!V)return-1;V.hp=1;K.station=V.station-engageGap(K,V)-4;K.lane=V.lane;K.build();setTgt(K,V.idx);
  FORCE=['hit'];act(0,'thrust');const ph=S.stage.phase,a=S.auto;S.auto=false;let n=0;
  for(;n<120*60;n++){simStep();if(S.opening)resolveOpening('hold');
    if(S.game.phase==='over'||S.game.phase==='finale'||(S.game.phase==='input'&&!S.stage.tr&&S.stage.phase>ph))break;}
  S.auto=a;return n;}
// the last scene: when it stops for the player's choice, choose; then run it to the end
function playFinale(choice){let n=0,asked=false;
  for(;n<120*60&&S.game.phase!=='over';n++){simStep();
    if(!asked&&typeof finaleChoose==='function'&&S.finale&&S.finale.step==='choice'){asked=true;finaleChoose(choice);}}
  return{n,asked};}
const roster=()=>S.F.map(f=>f.name+(f.npc?'(npc)':'')).join(',');

// ---------------- all four rooms ----------------
{setup({n:2});
  clearRoom();expect('the dining room leads to the kitchen',S.room==='kitchen'&&S.stage.phase===2,S.room);
  expect('the kitchen crew',foes().every(f=>f.p2)&&foes().map(f=>f.name).join()===FOE2_NAMES.slice(0,2).join(),foes().map(f=>f.name).join());
  clearRoom();expect('the kitchen leads to the lobby',S.room==='lobby'&&S.stage.phase===3&&S.arena===LOBBY,S.room);
  expect('a hidden door opens first',phases.some(s=>s==='reveal@kitchen'),phases.join(' '));
  const L=foes();
  expect('the lobby is held by its own security detail',L.length===2&&L.every(f=>f.p3&&!f.p2)&&L.map(f=>f.name).join()===FOE3_NAMES.slice(0,2).join()&&L.every((f,i)=>f.weaponKey===S.cfg.foes3[i].weapon),L.map(f=>f.name+':'+f.weaponKey).join());
  expect('sized like the other rooms',L.every(f=>f.maxHp===FOE_HP[2]&&f.hp===FOE_HP[2]),L.map(f=>f.maxHp).join());
  clearRoom();expect('the lobby leads to the office',S.room==='office'&&S.stage.phase===4&&S.arena===OFFICE,S.room);
  expect('the door is blown on the way',phases.some(s=>s==='breach@lobby')&&phases.indexOf('breach@lobby')<phases.indexOf('swap@office'),phases.join(' '));
  const K=S.F[0],B=S.F[1],X=S.F.find(f=>f.npc);
  expect('one man to fight: the head of security',foes().length===1&&B.boss&&B.p4&&B.name===BOSS.name&&B.weaponKey===S.cfg.boss.weapon&&B.skill===S.cfg.boss.skill,roster());
  expect('at a boss\\'s strength',B.maxHp===BOSS.hp.solo&&B.hp===BOSS.hp.solo,B.maxHp);
  expect('every fighter\\'s idx is its place in the roster',S.F.every((f,i)=>f.idx===i),S.F.map(f=>f.idx).join());
  expect('the executive is there and does not fight',!!X&&X.team===1&&!X.dead&&!foes().includes(X)&&!upright(X),roster());
  expect('he never gets a turn',turnOrder(24).every(i=>!S.F[i].npc),turnOrder(24).join());
  setTgt(K,X.idx);expect('he cannot be made the target',targetOf(K)===B,targetOf(K)&&targetOf(K).name);
  expect('nothing from the last rooms is left',S.F.every(f=>!f.p2&&!f.p3&&!f.hench),roster());
  // the head of security falls: the last scene, then the end
  clearRoom();
  expect('his fall starts the last scene',S.game.phase==='finale'||S.game.phase==='over',S.game.phase);
  const r=playFinale('behead');
  expect('the last scene ends the fight in a win',S.game.phase==='over'&&won===true,S.game.phase+' '+won);
  expect('it names how it ended',typeof S.endText==='string'&&S.endText.length>4,S.endText);
  expect('the executive is still not a foe at the end',!foes().includes(X));}
// ---------------- the choice ----------------
for(const choice of ['spare','behead']){setup({n:1});clearRoom();clearRoom();clearRoom();const X=S.F.find(f=>f.npc);clearRoom();
  if(typeof finaleChoose==='function'){const r=playFinale(choice);
    expect('the player is asked: '+choice,r.asked,S.finale&&S.finale.step);
    expect(choice==='spare'?'spared, he lives':'beheaded, he dies',choice==='spare'?!X.dead:X.dead&&(S.gore==='off'||X.severed),'dead '+X.dead+' severed '+X.severed);
    expect('and the fight is won',S.game.phase==='over'&&won===true,S.game.phase);}
  else rep.push('      (no finaleChoose yet: the finale module still has its stub)');}
// ---------------- the whole run switched off ----------------
{setup({n:1,deep:false});clearRoom();clearRoom();
  expect('without the lobby and the office the kitchen ends it',S.game.phase==='over'&&S.stage.phase===2&&S.room==='kitchen'&&won===true,S.game.phase+' '+S.room);}
// ---------------- crew mode ----------------
{setup({crew:true});clearRoom();clearRoom();
  const L=foes(),C=S.crew;
  expect('the lobby\\'s crew: Sable and two henchmen on the floor',S.room==='lobby'&&L.length===3&&L[0].name===FOE3_NAMES[0]&&L.slice(1).every(f=>f.hench&&f.p3),L.map(f=>f.name).join());
  expect('and more waiting',C&&C.room==='lobby'&&C.queue.length===CREW.lobby-CREW.floor,C&&C.queue.length);
  clearRoom();expect('no crew in the office',S.room==='office'&&!S.crew&&foes().length===1&&!S.F.some(f=>f.hench),roster());}
// ---------------- Amri comes along ----------------
{setup({n:2,ally:true});clearRoom();clearRoom();clearRoom();const M=S.F.find(f=>f.ally),B=S.F[1];
  expect('Amri follows into the office',S.room==='office'&&M&&!M.dead&&M.idx===2&&S.F[M.idx]===M,roster());
  expect('the head of security is sized for two',B.boss&&B.maxHp===BOSS.hp.ally,B.maxHp);
  expect('the executive comes after everyone',S.F[S.F.length-1].npc,roster());}
// ---------------- a restart from the office ----------------
{setup({n:1});clearRoom();clearRoom();clearRoom();S.F=[];rosterBuild();initDuel();
  expect('a restart goes back to the dining room',S.room==='dining'&&S.stage.phase===1&&!S.F.some(f=>f.p2||f.p3||f.p4||f.npc)&&S.F[1].name===FOE_NAMES[0]&&!S.secret&&!S.breach,S.room+' '+roster());}
// ---------------- whole runs ----------------
{let done=0,bad=[];
  for(const [n,ally,crew] of [[1,false,false],[3,false,false],[2,true,false],[1,false,true]]){
    setup({n,ally,crew});S.introOn=true;base=mulberry32(n*31+(ally?7:0)+(crew?3:0));S.F=[];rosterBuild();initDuel();S.F[0].maxHp=S.F[0].hp=500;
    let k=0;for(;k<120*1500&&S.game.phase!=='over';k++){simStep();tickOpening(DT*3);
      if(typeof finaleChoose==='function'&&S.finale&&S.finale.step==='choice'&&!S.auto)finaleChoose('spare');}
    const nan=S.F.some(f=>!f.gone&&!Number.isFinite(f.p[PEL].x+f.p[HEAD].y+f.p[TIP].x));
    if(S.game.phase==='over'&&!nan&&S.room==='office')done++;else bad.push(n+(ally?'a':'')+(crew?'c':'')+':'+S.game.phase+'@'+S.room+(nan?' NaN':''));}
  expect('four whole runs reach the end of the office',done===4,bad.join(' '));}
for(const l of rep)console.log(l);
console.log('errors',errs.length,JSON.stringify(errs));
`);
