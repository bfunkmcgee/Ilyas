// The styles as a framework (sk_styles.js, sk_wire.js, sk_order.js; since V94). The registry: the four styles, each well made, a malformed one
// refused, their entries in the rules list. Who fights in what: his own Sareth cut by default, the Wire drill once picked, everyone
// else in none; each lock (the gilt, two hands, the weapon, the blade that will not lock drained) and the scrap arm's way in. The
// switch: only on his own turn, a beat of tempo, the meter emptied, the pick kept for the night and for the lab's next fight. The look:
// the Wire drill's guard and pace against the Sareth cut's, in every stance. The count: its cap by rank, a new blow adding one, the
// same blow twice, a miss and a blow on him ending it, each blow at its own impact (a follow-up from an opening too), back on the
// line, +1 to hit a count. The Long count: only at a full count with
// the Aether, no cost to close in, spent as it is thrown, 2 harder and 2 more pips; the count running on at Master. The drill's own
// rules (thrown whole, carried through, on the line) and its mastery in any style; the AI keeping the drill; the night's XP to the style
// he fights in; the pick through a stage and the record; the Sareth cut with the scrap arm; and Short Hand in the registry. And (since
// V95) the Order drill, the guards' baton course: not his to have; the baton; its look and pace; Cover by rank, from the partners in
// reach; alone; the limbs and the head; its answers; the baton push and the arm bar; a partner down; the AI; the lobby's guards.
const core=require('./sk_src.js')(process.argv[2]);
eval(core+`
const errs=[];let nOk=0,base=mulberry32(94);S.rng=()=>base();Math.random=()=>base();
function expect(label,ok,extra){if(ok)nOk++;else errs.push(label+(extra!=null?': '+extra:''));console.log((ok?'ok   ':'FAIL ')+label+(extra!=null?'  '+extra:''));}
const HOOK=[];S.hooks.style=(K,k,was)=>HOOK.push({K,k,was});S.hooks.note=()=>{};
function rolled(v,fn){const save=S.rng;let first=true;S.rng=()=>{if(first){first=false;return(v-.5)/20;}return save();};try{return fn();}finally{S.rng=save;}}
function without(pre,fn){const ids=RULES.list.filter(r=>r.id.startsWith(pre)).map(r=>r.id);for(const id of ids)RULES.off(id);try{return fn();}finally{for(const id of ids)RULES.off(id,false);}}
function step(){simStep();if(S.cut)cutSkip();if(S.opening)tickOpening(isAI(S.opening.f.idx)?DT:S.opening.left+.01);}
function run(max=120*12){let n=0;for(;n<max;n++){step();if(S.game.phase!=='exchange'&&!S.opening)return n;}return n;}
function act(i,cmd){const g=S.game;g.phase='input';g.active=i;g.aiAt=null;S.opening=null;g.ex=null;return command(i,cmd);}
function turn(i){const g=S.game;g.phase='input';g.active=i;g.aiAt=null;S.opening=null;g.ex=null;}
// a lab fight: Ilyas with the arc-blade (Master) and a man with a sword a step off (named so he is no elf)
function lab(o={}){base=mulberry32(o.seed||94);S.arenaKey='street';S.room=null;S.auto=false;S.tableOn=false;S.divOn=false;S.cfg.n=1;S.cfg.crew=false;S.cfg.ally.on=false;S.allyAuto=false;
  S.cfg.hero={seed:2207,weapon:o.weapon||'elven',skill:5};S.cfg.foes[0]={seed:5113,weapon:o.foe||'sword',skill:3,temper:'plain'};
  S.F=[];rosterBuild();initDuel();warm(20);turn(0);for(const f of S.F){f.intent=null;f.ready=f.idx?60:0;f.foot=footMaxOf(f);f.reads={};}S.F[1].name='Tobin';
  const K=S.F[0],D=S.F[1];D.hp=D.maxHp=9999;K.station=380;D.station=380+engageGap(K,D);K.aether=MAGIC.max;return{K,D};}
// the roll of a blow, as wanted (inside the blow's own resolution, so the answers and the reads before it keep their own dice): a
// plain hit, or one that finds nothing; and the answer a man gives, as wanted
let FORCE=null;const ANS=new Map(),METER=[];
{const ra=resolveAttack;resolveAttack=function(A,D,kind,opening,T){if(!FORCE||A!==FORCE.A)return ra.apply(this,arguments);
  const c=computeMods(A,D,kind,opening,T||pickTechnique(A,D,kind));let v=null;
  for(let i=2;i<=19&&v==null;i++){const t=i+c.bonus;if(FORCE.out==='hit'?t>=c.def&&!isCrit(i,t,c.def):t<c.def-4)v=i;}
  const args=arguments;return rolled(v!=null?v:FORCE.out==='hit'?20:1,()=>ra.apply(this,args));};}
{const ar=aiReact;aiReact=function(D){return ANS.has(D)?ANS.get(D):ar.apply(this,arguments);};}
S.hooks.meter=(f,k,n,was,why)=>METER.push({f,k,n,was,why});
// one blow of his, to its end: he parries it (no counter to land on him), and the blow lands or finds nothing as asked
// (the man set in reach, on whichever side has no wall, divider or table between them)
function place(K,D){const g=engageGap(K,D);for(const s of [1,-1]){D.station=K.station+s*g;D.lane=K.lane;
  if(D.station>60&&D.station<W-60&&!(S.divs.length&&divBetween(K,D))&&!tableBetween(K,D)&&!(wallStanding()&&S.wall&&D.station>S.arena.wall-40))return;}}
function blow(K,D,kind,out){turn(0);K.foot=footMaxOf(K);D.foot=footMaxOf(D);place(K,D);ANS.set(D,'parry');FORCE={A:K,out};
  try{act(0,kind);run();}finally{FORCE=null;ANS.delete(D);}return S.game;}
function lands(K,D,kind){return blow(K,D,kind,'hit');}
function misses(K,D,kind){return blow(K,D,kind,'miss');}

// ---------- the registry ----------
expect('four styles, in the screen\\'s order: Short Hand, the Wire drill, the Sareth cut, and the Order drill (the guards\\')',STYLE_ORDER.join()==='shorthand,wire,sareth,order'&&STYLE_ORDER.every(k=>{const d=STYLES[k];
  return d.key===k&&d.name&&d.weapon&&d.weapons.length&&(d.hands===1||d.hands===2)&&d.origin&&d.doctrine&&d.what;}),STYLE_ORDER.join());
{const bad=[{},{key:'sareth',name:'x',weapons:['sword'],hands:2},{key:'q1',name:'Q',weapons:[],hands:1},{key:'q2',name:'Q',weapons:['sword'],hands:3},
    {key:'q3',name:'Q',weapons:['sword'],hands:1,colour:'red'},{key:'q4',name:'Q',weapons:['sword'],hands:1,meter:{name:'M'}}];
  const thrown=bad.filter(d=>{try{styleDef(d);return false;}catch(e){return true;}}).length;
  expect('a malformed style is refused as the page loads (no key, twice, no weapons, three hands, a field it does not know, a meter with no cap)',thrown===bad.length&&STYLE_ORDER.length===4,thrown+' of '+bad.length);}
{const want=['style.wire.count','style.wire.whole','style.wire.tempo','style.wire.long','style.wire.long.approach','style.wire.answer','style.wire.mastery.back','style.sareth.scrap.hit','style.sareth.scrap.def'];
  const miss=want.filter(id=>!RULES.ids[id]);
  expect('the styles\\' rules are entries in the one list, under the style\\'s name',!miss.length&&RULES.list.filter(r=>r.id.startsWith('style.wire.')&&!/\\.(hit|def)$/.test(r.id)).every(r=>r.src==='Wire drill'),miss.join());}
expect('where he starts each comes from the registry (growth reads it)',STYLE_GROWTH.start.wire===13&&STYLE_GROWTH.start.sareth===17&&STYLE_GROWTH.start.shorthand===1);

// ---------- who fights in what ----------
{const {K,D}=lab();
  expect('his own by default: the Sareth cut, in its tactical motion; the man with the sword in none',styleOf(K)==='sareth'&&K.animStyle==='tactical'&&styleOf(D)===null&&D.animStyle==='regular',[styleOf(K),K.animStyle,styleOf(D),D.animStyle].join());
  expect('with the arc-blade and the gilt he has two to fight in',stylesFor(K).join()==='wire,sareth',stylesFor(K).join());
  K.style='wire';expect('the Wire drill picked: he fights in it, and moves in its own motion',styleOf(K)==='wire'&&K.animStyle==='wire');
  K.drain=1;const g=styleNeeds(K,'wire'),b=styleNeeds(K,'sareth');K.drain=0;
  S.noMagic=true;const nm=styleNeeds(K,'wire');S.noMagic=false;
  expect('dark without the gilt; the arc-blade will not lock drained',g==='needs the gilt'&&b==='the blade will not lock'&&nm==='needs the gilt',[g,b,nm].join(' / '));
  K.oneArm=true;const oa=styleNeeds(K,'sareth');K.scrapArm=true;const sc=styleCan(K,'sareth')&&styleBadly(K,'sareth');K.oneArm=false;K.scrapArm=false;
  expect('one arm locks the two-handed styles; the scrap arm lets the Sareth cut work, badly',oa==='needs two hands'&&sc,oa);
  expect('Short Hand: a dagger in hand, and only once it is taught',styleNeeds(K,'shorthand')==='needs a dagger in hand'&&!styleKnown(K,'shorthand'));
  K.style=null;}
{const {K}=lab({weapon:'sword'});K.drain=1;const ok=styleOf(K);K.drain=0;
  expect('a sword: his own, drained or not (it is the arc-blade that needs the gilt); no Wire drill with it',ok==='sareth'&&styleNeeds(K,'wire')!=='',ok);}
{const {K}=lab();turn(0);setStyle(K,'wire');K.meter={k:'wire',n:2,t:S.t};K.setWeapon('sword');const a=styleOf(K),m=meterOf(K);step();const M=K.meter;K.setWeapon('elven');const b=styleOf(K);
  expect('the Wire drill picked and a sword in his hand: his own for as long, the count gone; the arc-blade back, the drill again',a==='sareth'&&!m&&!M&&b==='wire',[a,b,JSON.stringify(M)].join(' '));
  STYLE_PICK.lab=null;}

// ---------- the switch ----------
{const {K,D}=lab();HOOK.length=0;
  const g=S.game;g.phase='exchange';const a=setStyle(K,'wire');g.phase='input';g.active=1;const b=setStyle(K,'wire');turn(0);S.opening={f:K};const c=setStyle(K,'wire');S.opening=null;
  const e=setStyle(D,'wire'),f=setStyle(K,'shorthand'),h=setStyle(K,'sareth');
  expect('not in an exchange, not on another\\'s turn, not in an answer window; not for an enemy, not to a style he cannot use or the one he is in',!a&&!b&&!c&&!e&&!f&&!h&&styleOf(K)==='sareth');
  K.meter={k:'sareth',n:2};const r0=K.ready,ok=setStyle(K,'wire');
  expect('on his turn: in at once, a beat of tempo, the hook told, the pick kept for the lab\\'s next fight',ok&&styleOf(K)==='wire'&&K.ready-r0===STYLE_SW.tempo&&!K.meter&&HOOK.length===1&&HOOK[0].k==='wire'&&HOOK[0].was==='sareth'&&STYLE_PICK.lab==='wire',K.ready-r0);
  const n=lab();expect('the lab\\'s next fight starts in it',styleOf(n.K)==='wire');STYLE_PICK.lab=null;}

// ---------- the look ----------
{const {K}=lab();const g0=styleGuard(K),m0=styleMoves(K,null);K.style='wire';const g1=styleGuard(K),m1=styleMoves(K,null);
  expect('the Wire drill\\'s guard: the blade out on the line, the feet wide, the free hand back (against the Sareth cut\\'s tight guard)',g1.hx>g0.hx*1.4&&g1.sf>g0.sf*1.4&&g1.off[0]<0&&g0.off[0]>0,JSON.stringify({hx:[g0.hx,g1.hx],sf:[g0.sf,g1.sf],off:[g0.off,g1.off]}));
  expect('and its pace: a bigger windup, carried far through, held after',m1.amp>m0.amp&&m1.follow>m0.follow*1.5&&m1.reach>m0.reach*1.5&&m1.tail>m0.tail,JSON.stringify([m0.follow,m1.follow,m0.tail,m1.tail]));
  for(const s of ['unbound','close']){K.stance=s;const gw=styleGuard(K);K.style='sareth';const gs=styleGuard(K);K.style='wire';
    expect('in '+STANCES[s].name+' the stance keeps its hands and the drill its feet and free hand',gw.hx===gs.hx&&gw.w===gs.w&&gw.sf>gs.sf*1.3&&gw.off[0]<gs.off[0],JSON.stringify([gs.sf,gw.sf,gs.off,gw.off]));}
  K.stance='bound';K.style=null;}

// ---------- the count ----------
{const {K,D}=lab();K.style='wire';
  expect('the count: its cap by rank (an Expert to 3)',meterOf(K).max===3&&meterOf(K).n===0);
  lands(K,D,'slash');const a=wireCount(K);lands(K,D,'overhead');const b=wireCount(K);lands(K,D,'overhead');const c=wireCount(K);
  expect('a blow that lands adds one when it is a new kind; the same blow twice ends it',a===1&&b===2&&c===0,[a,b,c].join());
  lands(K,D,'slash');lands(K,D,'thrust');const d=wireCount(K);METER.length=0;misses(K,D,'overhead');const e=METER.find(m=>m.f===K);
  expect('a blow that finds nothing ends it',d===2&&!!e&&e.n===0&&e.was===2&&e.why==='the blow found nothing',d+' '+JSON.stringify(e&&[e.n,e.why]));
  K.meter={k:'wire',n:2,t:S.t};const hit=x=>computeMods(K,D,'slash',false).bonus-without('style.wire.count',()=>computeMods(K,D,'slash',false).bonus);
  expect('each count is +1 to hit',hit()===2,hit());
  // a blow that lands on him
  K.meter={k:'wire',n:2,t:S.t};for(let i=0;i<3;i++)step();K.hp-=5;step();
  expect('a blow that lands on him ends it',wireCount(K)===0);
  turn(0);K.meter={k:'wire',n:2,t:S.t};const sw=setStyle(K,'sareth');turn(0);setStyle(K,'wire');
  expect('a change of style empties it',sw&&wireCount(K)===0);
  // a follow-up is a blow of its own: the count moves at each blow's impact
  METER.length=0;K.meter=null;K._wireLast=null;turn(0);K.foot=footMaxOf(K);D.foot=footMaxOf(D);place(K,D);ANS.set(D,'parry');FORCE={A:K,out:'hit'};
  const rr=readRoll;readRoll=function(f,o,src){return f===K&&src==='hit'?{free:true,ok:true,src}:rr.apply(this,arguments);};
  let at=null,mid=-1,open=false;
  try{act(0,'slash');for(let n=0;n<600&&!S.opening;n++){simStep();if(S.game.phase!=='exchange')break;}
    at=METER.length?METER[METER.length-1]:null;mid=wireCount(K);open=!!S.opening&&S.opening.f===K;
    if(open){const ch=openingChoices(S.opening).filter(k=>openValid(S.opening,k));resolveOpening(ch.includes('overhead')?'overhead':'thrust');run();}}
  finally{readRoll=rr;FORCE=null;ANS.delete(D);}
  expect('the count moves as the blow lands, and a follow-up from the opening adds its own',!!at&&at.f===K&&at.n===1&&mid===1&&open&&wireCount(K)===2,JSON.stringify({mid,open,end:wireCount(K)}));}
// back on the line: a Step back that works (Veteran and on)
{const {K,D}=lab();K.style='wire';K.meter={k:'wire',n:1,t:S.t};S.auto=true;METER.length=0;ANS.set(K,'back');FORCE={A:D,out:'miss'};
  try{turn(1);D.foot=footMaxOf(D);K.foot=footMaxOf(K);act(1,'slash');run();}finally{FORCE=null;ANS.delete(K);S.auto=false;}
  const e=METER.find(m=>m.f===K&&m.why==='back on the line');
  expect('back on the line: a Step back that works adds one',!!e&&e.n===2&&e.was===1,JSON.stringify(METER.map(m=>[m.f.name,m.n,m.why])));}

// ---------- the Long count ----------
{const {K,D}=lab();K.style='wire';const pt=()=>pickTechnique(K,D,'slash');
  K.meter={k:'wire',n:2,t:S.t};const t2=pt();K.meter={k:'wire',n:3,t:S.t};K.aether=0;const t0=pt();K.aether=MAGIC.max;const t3=pt();
  expect('only at a full count, with the Aether for it: his next blow is the Long count',!t2.longCount&&!t0.longCount&&t3.longCount&&t3.name==='Long count');
  D.station=K.station+engageGap(K,D)+160;const far=approachCost(K,D,'slash');K.meter=null;const farNo=approachCost(K,D,'slash');
  expect('no cost to close in at a full count',far===0&&farNo>0,far+' / '+farNo);
  // thrown: a plain hit, measured against the same roll with its own damage entry out of play
  const kb=knockBalance,knocks=[];knockBalance=function(f,n,by){if(f===D)knocks.push(n);return kb.apply(this,arguments);};
  K.meter={k:'wire',n:3,t:S.t};const a0=K.aether;let hp0=D.hp;base=mulberry32(5);lands(K,D,'slash');const dLong=hp0-D.hp;const kl=knocks.slice();
  const spent=a0-K.aether,after=wireCount(K);knocks.length=0;
  K.meter={k:'wire',n:3,t:S.t};hp0=D.hp;base=mulberry32(5);without('style.wire.long',()=>lands(K,D,'slash'));const dNo=hp0-D.hp;knockBalance=kb;
  expect('thrown: the Aether spent, the count gone, 2 harder and 2 more pips',spent===WIRE.long.aether&&after===0&&kl.includes(WIRE.long.pips)&&dLong-dNo===WIRE.long.dmg,JSON.stringify({spent,after,kl,dLong,dNo}));}

// ---------- the drill's rules ----------
{const {K,D}=lab();K.style='wire';
  const c1=actionCost(K,'slash'),c0=without('style.wire.tempo',()=>actionCost(K,'slash'));
  expect('carried through: a tenth more tempo on his blows',c1===Math.round(c0*WIRE.tempo),c1+' / '+c0);
  base=mulberry32(9);let hp0=D.hp;lands(K,D,'overhead');const a=hp0-D.hp;base=mulberry32(9);hp0=D.hp;without('style.wire.whole',()=>lands(K,D,'overhead'));const b=hp0-D.hp;
  expect('thrown whole: an overhead that lands, 1 harder',a-b===WIRE.whole,a+' / '+b);
  const def=k=>withReact(K,k,()=>computeMods(D,K,'slash',false).def)-without('style.wire.answer',()=>withReact(K,k,()=>computeMods(D,K,'slash',false).def));
  expect('on the line: Step back +1, Parry -1',def('back')===1&&def('parry')===-1&&def('slip')===0,[def('back'),def('parry'),def('slip')].join());
  K.style=null;expect('none of it in his own style',def('back')===0&&actionCost(K,'slash')===c0);}

// ---------- the AI keeps the drill ----------
{const {K,D}=lab();K.style='wire';K._wireLast='slash';const w={slash:10,overhead:10,thrust:10,sweep:10};moveWeights(K,D,w,pickTechnique(K,D,'slash'),()=>true);
  expect('on auto: the blow he threw last is the one he least wants next',w.slash<w.overhead*.5,JSON.stringify(w));}

// ---------- a night ----------
function night(key){storyQuit();S.F=[];base=mulberry32(94);S.storyAuto=true;S.auto=true;S.allyAuto=true;storyBegin(key,{auto:true});
  for(let n=0;n<12000&&!(S.story.step==='fight'&&S.game.phase==='input'&&!S.cut&&!S.intro&&!S.opening);n++)step();
  S.auto=false;S.game.aiAt=null;for(const f of S.F){f.intent=null;f.ready=f.idx?60:0;f.reads={};}return S.story;}
{const SV=night('dining'),K=hero(),D=S.F.find(f=>f.team===1&&!f.npc&&!f.dead);for(const f of S.F)if(f.team===1)f.hp=f.maxHp=9999;
  turn(0);setStyle(K,'wire');
  expect('in the story the pick goes in the night\\'s flags',SV.flags.style==='wire'&&styleOf(K)==='wire');
  const g=growth(),w0=g.styles.wire,s0=g.styles.sareth;lands(K,D,'overhead');
  expect('a blow of his in the Wire drill gives the Wire drill its XP',g.styles.wire>w0&&g.styles.sareth===s0,(g.styles.wire-w0)+' / '+(g.styles.sareth-s0));
  // a follow-up from the opening a blow of his makes is a blow of its own: its XP too (on a man on his feet: the overhead floored this one)
  {const E=S.F.find(f=>f.team===1&&!f.npc&&!f.dead&&!f.downed&&f!==D)||D;
    const rr=readRoll;readRoll=function(f,o,src){return f===K&&src==='hit'?{free:true,ok:true,src}:rr.apply(this,arguments);};const w1=g.styles.wire;let open=false;
    try{turn(0);setTgt(K,E.idx);K.foot=footMaxOf(K);E.foot=footMaxOf(E);place(K,E);ANS.set(E,'parry');FORCE={A:K,out:'hit'};act(0,'thrust');
      for(let n=0;n<900&&!S.opening;n++){simStep();if(S.game.phase!=='exchange')break;}open=!!S.opening&&S.opening.f===K;
      if(open){const ch=openingChoices(S.opening).filter(k=>openValid(S.opening,k));resolveOpening(ch.includes('overhead')?'overhead':'sweep');run();}}
    finally{readRoll=rr;FORCE=null;ANS.delete(E);setTgt(K,D.idx);}
    expect('a follow-up from an opening gives the style its XP too (3 a blow, both counted)',open&&g.styles.wire-w1===2*XP_GAIN.style.hit,open+' '+(g.styles.wire-w1)+' '+E.name);}
  g.styles.wire=STYLE_XP_AT[5];expect('a Trained man\\'s count goes to 2',meterOf(K).max===2);g.styles.wire=STYLE_XP_AT[1];expect('a Novice\\'s to 1',meterOf(K).max===1);
  g.styles.wire=STYLE_XP_AT[17];K.meter={k:'wire',n:3,t:S.t};K.aether=MAGIC.max;lands(K,D,'thrust');
  expect('Master: after the Long count the count runs on from 1',wireCount(K)===1,wireCount(K));
  turn(0);setStyle(K,'sareth');const m=k=>withReact(K,k,()=>computeMods(D,K,'slash',false).def)-without('style.wire.mastery',()=>withReact(K,k,()=>computeMods(D,K,'slash',false).def));
  expect('mastered, the drill\\'s Step back goes with him into any style',m('back')===1&&m('parry')===0,m('back')+' '+m('parry'));
  g.styles.wire=STYLE_XP_AT[13];turn(0);setStyle(K,'wire');
  const R=saveTake(SV.key);expect('the record keeps the pick',R.flags.style==='wire');
  storyStage('kitchen');for(let i=0;i<5;i++)step();
  expect('the next stage begins in it',styleOf(hero())==='wire'&&hero().animStyle==='wire');
  storyQuit();}

// ---------- the Sareth cut with the scrap arm ----------
{const {K,D}=lab({weapon:'sword'});K.oneArm=true;K.scrapArm=true;
  const h=computeMods(K,D,'slash',false).bonus-without('style.sareth.scrap',()=>computeMods(K,D,'slash',false).bonus),d=computeMods(D,K,'slash',false).def-without('style.sareth.scrap',()=>computeMods(D,K,'slash',false).def);
  expect('the Sareth cut with the scrap arm: -2 to hit, -1 DEF',styleOf(K)==='sareth'&&h===SARETH.scrap.hit&&d===SARETH.scrap.def,h+' '+d);
  K.scrapArm=false;expect('without it, locked',styleOf(K)===null);K.oneArm=false;}

// ---------- Short Hand in the registry ----------
{const {K,D}=lab({weapon:'dagger'});K.style='shorthand';K.styleMoves={stance:true,hinge:true};
  expect('Short Hand: in it with the dagger, its moves by lesson',styleOf(K)==='shorthand'&&shortOn(K)&&styleKnows(K,'shorthand','hinge')&&!styleKnows(K,'shorthand','toll')&&styleKnown(K,'shorthand'));
  K.style=null;K.styleMoves=null;}

// ---------- the Order drill (since V95): the guards' baton course ----------
// a lab fight: Ilyas and three guards with batons in the drill (named, so they are no elves): A a step off him, B beside A in the next
// lane (in reach of him too), C on his other side; o.skill is their rank, o.hero his
function guards(o={}){base=mulberry32(o.seed||95);S.arenaKey='street';S.room=null;S.auto=false;S.tableOn=false;S.divOn=false;S.cfg.n=o.n||3;S.cfg.crew=false;S.cfg.ally.on=false;S.allyAuto=false;
  S.cfg.hero={seed:2207,weapon:'elven',skill:o.hero||5};for(let i=0;i<3;i++)S.cfg.foes[i]={seed:5113+i*31,weapon:'baton',skill:o.skill||1,temper:'plain'};
  S.F=[];rosterBuild();S.F.slice(1).forEach((g,i)=>{g.name='Guard '+'ABC'[i];});initDuel();warm(20);turn(0);const K=S.F[0],[A,B,C]=S.F.slice(1);
  for(const f of S.F){f.intent=null;f.ready=f.idx?60:0;f.foot=footMaxOf(f);f.reads={};f.hp=f.maxHp=9999;}
  for(const g of S.F.slice(1)){g.style='order';setTgt(g,0);}
  K.station=380;A.lane=K.lane;A.station=K.station+engageGap(K,A);
  if(B){B.lane=K.lane+(K.lane>120?-30:30);B.station=K.station+engageGap(K,B)+10;}if(C){C.lane=K.lane;C.station=K.station-engageGap(K,C);}
  setTgt(K,A.idx);K.aether=MAGIC.max;return{K,A,B,C};}
// let the drill's step see the room (who is a partner, the meter on the plate) as the game would, a beat at a time
function beat(n=30){for(let i=0;i<n;i++)step();}
{const {K,A}=guards();A.setWeapon('baton');
  expect('the Order drill: one of the styles only the others fight in (not on his cards or his chip, no level of his)',STYLES.order.enemy&&!heroStyles().includes('order')&&STYLE_GROWTH.start.order==null&&!styleKnown(K,'order')&&!stylesFor(K).includes('order'));
  const want=['style.order.cover','style.order.limbs','style.order.head','style.order.alone','style.order.answer','style.order.push'],miss=want.filter(id=>!RULES.ids[id]);
  expect('its rules are entries in the one list, under its name',!miss.length&&RULES.list.filter(r=>r.id.startsWith('style.order.')).every(r=>r.src==='Order drill'),miss.join());
  expect('the baton: one hand, blunt (a man it puts down is knocked out), a weapon in its own right (the lash can take it)',WEAPONS.baton.fam==='blunt'&&!WEAPONS.baton.off&&realWeapon('baton')&&!!GUARD.baton&&LOOT_RANK.baton>0);
  expect('a guard with a baton fights in it, and moves in its motion',styleOf(A)==='order'&&A.animStyle==='order');
  A.setWeapon('club');const cl=styleOf(A),why=styleNeeds(A,'order');A.setWeapon('baton');
  expect('with anything else in his hand, none (it needs a baton)',cl===null&&why==='needs a baton'&&styleOf(A)==='order',why);
  K.setWeapon('baton');const kb=styleOf(K);K.setWeapon('elven');expect('a baton in Ilyas\\'s hand is no Order drill for him',kb!=='order');
  const nm=k=>pickTechnique(A,K,k).name;
  expect('its blows are named for what they are: the Baton strike, the Baton jab, the High strike, the Leg strike',nm('slash')==='Baton strike'&&nm('thrust')==='Baton jab'&&nm('overhead')==='High strike'&&nm('sweep')==='Leg strike',['slash','thrust','overhead','sweep'].map(nm).join());}
// the look: against what the lobby's guards held before (a table leg, a Novice's arms) and a plain man's baton
{const {A}=guards();const g1=styleGuard(A),m1=styleMoves(A,null);A.style=null;const g0=styleGuard(A);A.setWeapon('club');const gc=styleGuard(A),mc=styleMoves(A,null);A.setWeapon('baton');A.style='order';
  expect('its guard: the baton up at the shoulder, the free hand out in front and up (the fence), stood taller than a Novice with a table leg',g1.hy<gc.hy-.1&&g1.hx<gc.hx&&g1.w<gc.w-.3&&g1.off[0]>gc.off[0]*1.5&&g1.off[1]<gc.off[1]-.3&&g1.crouch>gc.crouch,JSON.stringify({hy:[gc.hy,g1.hy],w:[gc.w,g1.w],off:[gc.off,g1.off],crouch:[gc.crouch,g1.crouch]}));
  expect('and against a plain man\\'s baton: the fence, and the feet set wider',g1.off[0]>g0.off[0]*1.4&&g1.off[1]<g0.off[1]-.2&&g1.sf>g0.sf*1.15,JSON.stringify({off:[g0.off,g1.off],sf:[g0.sf,g1.sf]}));
  expect('its pace, at any rank: from the shoulder and straight back to it (the follow-through short, the guard back sooner)',m1.follow<mc.follow*.7&&m1.reach<mc.reach*.5&&m1.recover<mc.recover*.7&&m1.follow<1&&m1.reach<1,JSON.stringify([mc.follow,m1.follow,mc.reach,m1.reach,mc.recover,m1.recover]));}
// Cover
{const {K,A,B,C}=guards();beat();
  expect('Cover, its meter: to 1 for a Novice',meterOf(A).name==='Cover'&&meterOf(A).max===1&&orderCover(A)===1,orderCover(A));
  const hit=()=>computeMods(A,K,'slash',false).bonus-without('style.order.cover',()=>computeMods(A,K,'slash',false).bonus);
  expect('each partner in cover is +1 to hit',hit()===1,hit());
  expect('on his plate, a beat behind the room',meterN(A,'order')===1);}
{const {K,A,B,C}=guards({skill:2});beat();const two=orderCover(A),m2=meterN(A,'order');
  B.station=K.station+engageGap(K,B)+ORDER_DRILL.reach+60;const one=orderCover(A);B.station=K.station+engageGap(K,B)+10;B.lane=K.lane+ORDER_DRILL.lanes+20;const lane=orderCover(A);
  B.lane=K.lane;B.downed=true;const dn=orderCover(A);B.downed=false;METER.length=0;C.station=K.station-900;beat();const e=METER.find(m=>m.f===A);
  expect('to 2 from Trained: two partners in reach of the man he is on',meterOf(A).max===2&&two===2&&m2===2,two+' '+m2);
  expect('a partner out of reach, in a lane well off, or on the ground is no cover; the plate follows',one===1&&lane===1&&dn===1&&!!e&&e.n===1&&e.why==='his cover gone',[one,lane,dn,JSON.stringify(e&&[e.n,e.why])].join(' '));}
// alone
{const {K,A,B,C}=guards();beat();const had=A._orderHad;B.dead=true;C.dead=true;const al=orderAlone(A);
  const hit=computeMods(A,K,'slash',false).bonus-without('style.order.alone',()=>computeMods(A,K,'slash',false).bonus);
  expect('once the partners he had this fight are down, the book is out: -1 to hit',had&&al&&hit===ORDER_DRILL.alone&&orderCover(A)===0,[had,al,hit].join());
  const one=guards({n:1});beat();const h1=computeMods(one.A,one.K,'slash',false).bonus-without('style.order.alone',()=>computeMods(one.A,one.K,'slash',false).bonus);
  expect('a man in it who had no partner this fight is not alone in its sense (a lone guard is no worse for it)',!orderAlone(one.A)&&h1===0,h1);}
// the blows: the damage as the blow is resolved (the same dice, its entry in and out); the pips at its impact (no partners to pile in,
// no opening after it)
{const {K,A,B,C}=guards({hero:1});B.dead=C.dead=true;
  const res=(kind,off)=>{base=mulberry32(7);const T=pickTechnique(A,K,kind),c=computeMods(A,K,kind,false,T);let v=null;
    for(let i=2;i<=19&&v==null;i++){const t=i+c.bonus;if(t>=c.def&&!isCrit(i,t,c.def))v=i;}const go=()=>rolled(v,()=>resolveAttack(A,K,kind,false,T));const r=off?without(off,go):go();return r.out==='hit'?r.dmg:'('+r.out+')';};
  const d={};for(const k of ['slash','sweep','thrust'])d[k]=[res(k),res(k,'style.order.limbs')];
  expect('to the limbs: a Baton strike or a Leg strike that lands does 1 less; the Baton jab is a plain blow',d.slash[0]-d.slash[1]===ORDER_DRILL.limbs.dmg&&d.sweep[0]-d.sweep[1]===ORDER_DRILL.limbs.dmg&&d.thrust[0]===d.thrust[1],JSON.stringify(d));
  const kb=knockBalance,co=considerOpening,knocks=[];knockBalance=function(f,n,by){if(f===K&&by===A)knocks.push(n);return kb.apply(this,arguments);};considerOpening=()=>{};
  const pips=kind=>{knocks.length=0;turn(1);A.foot=footMaxOf(A);K.foot=footMaxOf(K);place(A,K);ANS.set(K,'parry');FORCE={A,out:'hit'};try{act(1,kind);run();}finally{FORCE=null;ANS.delete(K);}return knocks.reduce((s,n)=>s+n,0);};
  let p1,p0,pt1,pt0;try{p1=pips('slash');pt1=pips('thrust');A.style=null;p0=pips('slash');pt0=pips('thrust');A.style='order';}finally{knockBalance=kb;considerOpening=co;}
  expect('and knocks a pip more (the jab no more than any)',p1-p0===ORDER_DRILL.limbs.pips&&pt1===pt0,[p1,p0,pt1,pt0].join());
  const hd=computeMods(A,K,'overhead',false).bonus-without('style.order.head',()=>computeMods(A,K,'overhead',false).bonus);
  expect('the head is a last resort: the High strike -1 to hit',hd===ORDER_DRILL.head,hd);}
// the answers it teaches, and the ones it does not
{const {K,A,B,C}=guards();beat();
  const def=k=>withReact(A,k,()=>computeMods(K,A,'slash',false).def)-without('style.order.answer',()=>withReact(A,k,()=>computeMods(K,A,'slash',false).def));
  expect('its answers: Parry +1 and Step back +1 (the block and the gap), Slip -1 and Counter -1 (the course has neither)',def('parry')===1&&def('back')===1&&def('slip')===-1&&def('counter')===-1,['parry','back','slip','counter'].map(def).join());
  B.dead=true;C.dead=true;expect('alone, his Parry and Step back are plain again',def('parry')===0&&def('back')===0&&def('slip')===-1,['parry','back','slip'].map(def).join());}
// the baton push (Trained) and the arm bar (Veteran)
let SHOVE=null;{const rs=resolveShove;resolveShove=function(A,D){const r=rs.apply(this,arguments);if(SHOVE&&A===SHOVE.A){r.ok=SHOVE.ok;r.crush=false;}return r;};}
function push(K,A,foot){const kb=knockBalance,knocks=[],ev=[];knockBalance=function(f,n,by){if(f===K&&by===A)knocks.push(n);return kb.apply(this,arguments);};
  const oh=S.hooks.order;S.hooks.order=(e,o)=>ev.push(e);let ok=false,plan=null;const ps=planShove;planShove=function(){const P=ps.apply(this,arguments);if(arguments[0]===A)plan=P;return P;};
  try{turn(1);A.foot=footMaxOf(A);K.foot=foot??footMaxOf(K);K.downed=false;place(A,K);SHOVE={A,ok:true};ok=act(1,'shove');for(let n=0;n<600&&S.game.phase==='exchange';n++){simStep();if(S.opening)tickOpening(S.opening.left+.01);}}
  finally{SHOVE=null;knockBalance=kb;S.hooks.order=oh;planShove=ps;}
  return{ok,knocks,ev,down:K.downed,two:!!(plan&&plan.batonPush)};}
{const {K,A}=guards({skill:2});
  const p=shoveMods(A,K,false).bonus-without('style.order.push',()=>shoveMods(A,K,false).bonus),r=push(K,A);
  expect('the baton push, its signature, from Trained: his shove +2, a pip more when it lands, both hands on the baton',p===ORDER_DRILL.push.hit&&r.ok&&r.knocks.includes(ORDER_DRILL.push.pips)&&r.two,JSON.stringify({p,r}));
  const c=push(K,A,3);expect('a Trained man\\'s push does not take a Committed man down',c.ok&&!c.down);}
{const {K,A}=guards();const p=shoveMods(A,K,false).bonus-without('style.order.push',()=>shoveMods(A,K,false).bonus),r=push(K,A);
  expect('a Novice has no push: a plain shove, one hand ("Get back!" all the same)',p===0&&r.ok&&!r.two&&r.ev.includes('shove')&&r.knocks.length===1,JSON.stringify({p,r}));}
{const {K,A}=guards({skill:3,hero:3});const r=push(K,A,3),s=push(K,A);
  expect('the arm bar, from Veteran: his push at a Committed man takes him down (a Set one stays up)',r.ok&&r.down&&s.ok&&!s.down,JSON.stringify([r.down,s.down]));}
{const {K,A}=guards({skill:3,hero:5});const r=push(K,A,3);expect('the better man is taken down by it only as any shove would (outclassed, it needs a crush)',r.ok&&!r.down);}
// a partner down
{const {K,A,B}=guards();const ev=[],oh=S.hooks.order;S.hooks.order=(e,o)=>ev.push([e,o&&o.A&&o.A.name]);try{for(const h of V11.kill)h(B);}finally{S.hooks.order=oh;}
  expect('a partner down: the one beside him says so ("Man down!")',ev.length===1&&ev[0][0]==='down'&&ev[0][1]!=='Guard B',JSON.stringify(ev));}
// on auto
{const {K,A,B,C}=guards({skill:2});beat();const w={slash:10,overhead:10,thrust:10,sweep:1};moveWeights(A,K,w,pickTechnique(A,K,'slash'),()=>true);
  const n={slash:10,overhead:10,thrust:10,sweep:1};A.style=null;moveWeights(A,K,n,pickTechnique(A,K,'slash'),()=>true);A.style='order';
  expect('on auto: the Baton strike and the Leg strike first, the High strike hardly ever, the push from Trained',w.slash>n.slash&&w.sweep>n.sweep&&w.overhead<n.overhead*.5&&w.shove>0&&!n.shove,JSON.stringify({w,n}));
  const share=()=>{let k=0;for(let i=0;i<400;i++){const a=aiReact(A,K,'slash',pickTechnique(K,A,'slash'),false);if(a==='parry'||a==='back')k++;}return k/400;};
  const s1=share();A.style=null;const s0=share();A.style='order';
  expect('its answers more often than not: a Parry or a Step back',s1>.6&&s1>s0+.2,s1.toFixed(2)+' / '+s0.toFixed(2));
  B.dead=true;C.dead=true;let wd=0;for(let i=0;i<200;i++)if(temperChoice(A,K,c=>c==='withdraw'||cmdValid(A,K,c),()=>i<40?.05:.9,Math.abs(A.station-K.station),false)==='withdraw')wd++;
  expect('alone, he gives ground now and then',wd>=40,wd);}
// the lobby: the guards' batons out after the volley, and the drill with them
{const SV=night('lobby'),G=S.F.filter(f=>/^Guard/.test(f.name)),Sb=S.F.find(f=>f.name==='Sable');
  expect('the lobby: the guns run dry, the batons come out, and the three guards fight in the Order drill (Sable in none)',G.length===3&&G.every(f=>f.weaponKey==='baton'&&styleOf(f)==='order'&&f.animStyle==='order')&&!!Sb&&styleOf(Sb)===null,G.map(f=>f.name+' '+f.weaponKey+' '+styleOf(f)).join(', '));
  expect('Guards A and B are Novices in it, Guard C Trained (the push his)',styleLevelFor(G[0],'order')===1&&styleLevelFor(G[2],'order')===5&&styleKnows(G[2],'order','push')&&!styleKnows(G[0],'order','push'));
  storyQuit();}

console.log('\\n'+nOk+' ok, '+errs.length+' failed');console.log('errors '+errs.length+' '+JSON.stringify(errs));
process.exit(errs.length?1:0);
`);
