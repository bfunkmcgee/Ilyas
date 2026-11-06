// The rules (sk_rules.js): the one list every feature's change to the dice, the costs, a blow's damage and the commands is in. That
// each entry the old wrappers became is there, well made and in the order the modules load (the order the wrappers ran in); that
// each reader does what the list says (a modifier added to a roll and recorded, an edit, a cost set, scaled and added to, the most
// balance, a blow's damage and the least it leaves, a bar, a command a feature brings); and the systems' own entries measured against
// the game without them (RULES.off), with what the log reads off the result.
const core=require('./sk_src.js')(process.argv[2]);
eval(core+`
const errs=[];let nOk=0,base=mulberry32(91);S.rng=()=>base();Math.random=()=>base();
function expect(label,ok,extra){if(ok)nOk++;else errs.push(label+(extra!=null?': '+extra:''));console.log((ok?'ok   ':'FAIL ')+label+(extra!=null?'  '+extra:''));}
// Ilyas (the arc-blade, Expert) and one man with a sword (a man: his seed draws an elf's name, so he is given another), in the street;
// the dice start from the seed given, so two runs of the same thing come out the same
function setup(o={}){base=mulberry32(o.seed||91);S.arenaKey='street';S.room=null;S.auto=false;S.tableOn=false;S.divOn=false;S.cfg.n=1;S.cfg.crew=false;S.cfg.ally.on=false;S.allyAuto=false;
  S.cfg.hero={seed:2207,weapon:o.weapon||'elven',skill:4};S.cfg.foes[0]={seed:5113,weapon:o.foe||'sword',skill:3,temper:'plain'};
  S.F=[];rosterBuild();initDuel();warm(20);const g=S.game;g.phase='input';startTurn(0);g.aiAt=null;g.active=0;S.opening=null;
  for(const f of S.F){f.intent=null;f.ready=f.idx?60:0;f.foot=footMaxOf(f);f.reads={};}if(!o.elf)S.F[1].name='Tobin';return S.F;}
// the next roll comes up v
function rolled(v,fn){const save=S.rng;let first=true;S.rng=()=>{if(first){first=false;return(v-.5)/20;}return save();};try{return fn();}finally{S.rng=save;}}
// a plain hit (not a crit) with technique T, or null when none can be had
function hitWith(A,D,kind,T){const c=computeMods(A,D,kind,false,T);for(let v=2;v<20;v++){const t=v+c.bonus;if(t>=c.def&&!isCrit(v,t,c.def))return rolled(v,()=>resolveAttack(A,D,kind,false,T));}return null;}
// the same thing worked out with one entry out of play
function without(id,fn){RULES.off(id);try{return fn();}finally{RULES.off(id,false);}}

// ---------- the list ----------
const KNOWN=new Set([...RULE_ROLLS,...RULE_NUMS,'dmg','cmd']);
const WANT=['elf.pace','elf.reflexes','elf.blink','elf.magic','elf.reflexes.shot','stance.lash.foot','stance.unbound.approach','stance.unbound.blade',
  'stance.close.tied','stance.bound.point','stance.answer','stance.range','stance.chain.spear','stance.close.grab','stance.bound.grab','spell.edge.cmd',
  'spell.edge.tip','spell.glare.hit','spell.glare.def','spell.ward.heavy','spell.edge.hit','short.low.shove','short.low.sweep','short.inside',
  'short.hook.parry','short.blow','act1.pace','gear.whet','act1.onearm','gear.armour','gear.weight','gear.weight.step','gear.grip','gear.footing',
  'gear.snag','rise.finish','act1.foot','ride.no','cover.barrier','lesson.shove','gun.noblade'];
const miss=WANT.filter(id=>!RULES.ids[id]);
expect('every change the wrappers made is an entry in the list',!miss.length,miss.join(', ')||RULES.list.length+' entries');
expect('each with its system, what it changes and its test',RULES.list.every(r=>r.src&&KNOWN.has(r.on)&&typeof r.when==='function'));
const order=(on,ids)=>{const L=RULES.of(on).map(r=>r.id);return ids.every((id,i)=>L.includes(id)&&(i===0||L.indexOf(ids[i-1])<L.indexOf(id)));};
expect('a blow\\'s dice in the order the modules load: the elf, the stance, the spells, the Short Hand',
  order('attack',['elf.reflexes','elf.blink','elf.magic','stance.unbound.blade','stance.bound.point','stance.chain.spear','spell.glare.hit','spell.edge.hit','short.low.sweep','short.inside','short.hook.parry']),
  RULES.of('attack').map(r=>r.id).join(' '));
expect('a blow\\'s damage: the floor, the burning tip, what he wears, the Short Hand, the whetstone',order('dmg',['rise.finish','spell.edge.tip','gear.armour','short.blow','gear.whet']),
  RULES.of('dmg').map(r=>r.id).join(' '));
expect('a shot: the barrier, then the elf',order('shot',['cover.barrier','elf.reflexes.shot']));
expect('a shove: the Short Hand\\'s low stance, then the lesson',order('shove',['short.low.shove','lesson.shove']));
expect('tempo: the elf\\'s, the weight he wears, then a man\\'s own pace',order('tempo',['elf.pace','gear.weight','act1.pace']));
expect('the commands the features bring: the guns\\', the toss, the spells, the room\\'s',CMD_DEFS.map(d=>d.src).join()==='Gun,Gun,Beast,Elven,Room',CMD_DEFS.map(d=>d.src).join());
const bad=[{id:'t.bad1',src:'T',on:'nothing',when:()=>true},{id:'t.bad2',src:'T',on:'attack',v:1},{id:'t.bad3',src:'T',on:'tempo',mul:1,add:1},
  {id:'t.bad4',src:'T',on:'cmd'},{id:'elf.pace',src:'T',on:'tempo',mul:1},{id:'t.bad5',on:'tempo',mul:1},{id:'t.bad6',src:'T',on:'dmg',add:1}];
expect('a malformed entry is refused as it is added',bad.every(r=>{try{RULES.add(r);return false;}catch(e){return true;}}));

// ---------- the readers ----------
let [K,E]=setup();const T=pickTechnique(K,E,'slash'),c0=computeMods(K,E,'slash',false,T);
RULES.add({id:'t.hit',src:'Test',on:'attack',to:'hit',label:'test hit',v:3,when:x=>x.A.__rt===1});
RULES.add({id:'t.def',src:'Test',on:'attack',to:'def',label:'test def',v:x=>2,when:x=>x.A.__rt===1});
RULES.add({id:'t.none',src:'Test',on:'attack',to:'hit',mod:x=>null,when:x=>x.A.__rt===1});
RULES.add({id:'t.edit',src:'Test',on:'attack',to:'hit',when:x=>x.A.__rt===2,edit:x=>{const m=x.c.mods.find(y=>y[0]==='skill'),d=-m[1];x.c.bonus-=m[1];m[1]=0;return['no skill',d];}});
K.__rt=1;const c1=computeMods(K,E,'slash',false,T);
expect('a modifier on the roller\\'s side: +3, among his modifiers with its system',c1.bonus===c0.bonus+3&&c1.mods.some(m=>m[0]==='test hit'&&m[1]===3&&m[2]==='Test'),c1.bonus-c0.bonus);
expect('one on the other man\\'s: DEF +2',c1.def===c0.def+2&&c1.defMods.some(m=>m[0]==='test def'&&m[1]===2));
expect('one that gives nothing this time adds nothing',c1.mods.length===c0.mods.length+1&&c1.defMods.length===c0.defMods.length+1);
expect('what applied is recorded in order, with its side',(c1.rules||[]).filter(r=>r.src==='Test').map(r=>r.id+':'+r.to+':'+r.v).join()==='t.hit:hit:3,t.def:def:2');
K.__rt=2;const c2=computeMods(K,E,'slash',false,T);
expect('an edit (his skill put to nothing), recorded with what it took',c2.bonus===c0.bonus-K.skill&&(c2.rules||[]).some(r=>r.id==='t.edit'&&r.v===-K.skill));
K.__rt=1;const c3=without('t.hit',()=>computeMods(K,E,'slash',false,T));expect('an entry out of play changes nothing',c3.bonus===c0.bonus&&c3.def===c0.def+2);
K.__rt=0;
const a0=actionCost(E,'slash');
RULES.add({id:'t.tempo.mul',src:'Test',on:'tempo',label:'test pace',mul:.5,when:x=>x.f.__rt===3});
RULES.add({id:'t.tempo.add',src:'Test',on:'tempo',label:'test add',add:7,when:x=>x.f.__rt===3});
E.__rt=3;expect('tempo: scaled and rounded, then added to',actionCost(E,'slash')===Math.round(a0*.5)+7,actionCost(E,'slash')+' from '+a0);
RULES.add({id:'t.tempo.set',src:'Test',on:'tempo',label:'test set',set:40,when:x=>x.f.__rt===3});
expect('a set takes the place of the game\\'s own; the others still apply after it',actionCost(E,'slash')===27);
expect('which apply, for the tempo line: the set, then the rest in order',ruleWhich('tempo',{f:E,cmd:'slash',extra:0}).map(e=>e.id).join()==='t.tempo.set,t.tempo.mul,t.tempo.add');
E.__rt=0;expect('and nothing of it for a man it does not apply to',actionCost(E,'slash')===a0);
const fd0=footDelta(E,'overhead',null),fm0=footMaxOf(E);
RULES.add({id:'t.foot',src:'Test',on:'foot',label:'test foot',set:-5,when:x=>x.A.__rt===4});
RULES.add({id:'t.fmax',src:'Test',on:'footmax',label:'test max',add:2,when:x=>x.f&&x.f.__rt===4});
E.__rt=4;expect('the balance a move costs, set',footDelta(E,'overhead',null)===-5);expect('the most balance a man has, added to',footMaxOf(E)===fm0+2);
expect('a rule that changed a number is named; the game\\'s own number names none',ruleChanged('foot',{A:E,cmd:'overhead',T:null},()=>footBase(E,'overhead',null)).length===1);
E.__rt=0;expect('both back without it',footDelta(E,'overhead',null)===fd0&&footMaxOf(E)===fm0);
RULES.add({id:'t.dmg',src:'Test',on:'dmg',label:'test cut',add:-1000,min:2,when:x=>x.A.__rt===5});
RULES.add({id:'t.dmg.edit',src:'Test',on:'dmg',when:x=>x.A.__rt===5&&x.r.out==='hit',edit:x=>{x.r.knock=0;return'test: no knock';}});
K.__rt=5;const r5=hitWith(K,E,'slash',T);K.__rt=0;
expect('damage: added to, never under the least it leaves, and an edit after it',r5&&r5.dmg===2&&r5.knock===0,r5&&r5.dmg);
expect('the result carries what the damage entries did: the change each made, and the edit\\'s words',r5&&(r5.rules||[]).some(r=>r.id==='t.dmg'&&r.on==='dmg'&&r.v<0)&&(r5.rules||[]).some(r=>r.id==='t.dmg.edit'&&r.label==='test: no knock'));
const ok0=cmdValid(K,E,'slash');
RULES.add({id:'t.bar',src:'Test',on:'cmd',label:'test bar',why:'not now',when:x=>x.A&&x.A.__rt===6&&x.cmd==='slash'});
K.__rt=6;expect('a bar: the command is not his, and the bar says why',ok0&&!cmdValid(K,E,'slash')&&ruleBarWhy(K,E,'slash')==='not now');K.__rt=0;
const w0=cmdValid(K,E,'wait');cmdDef('Test','wait',(A,D)=>A.__rt===7?false:undefined);
K.__rt=7;expect('a command\\'s own rule from a feature',w0&&!cmdValid(K,E,'wait'));K.__rt=0;expect('and the game\\'s own when it says nothing',cmdValid(K,E,'wait')===w0);
cmdDef('Test','wait',(A,D)=>A.__rt===8?true:undefined);
RULES.add({id:'t.bar2',src:'Test',on:'cmd',label:'test bar 2',why:'barred',when:x=>x.A&&x.A.__rt===8&&x.cmd==='wait'});
K.__rt=8;expect('the bars come before any feature\\'s own rule',!cmdValid(K,E,'wait'));K.__rt=0;

// ---------- the systems, each against the game without it ----------
[K,E]=setup();const TK=pickTechnique(K,E,'slash'),TE=pickTechnique(E,K,'slash');
{const on=computeMods(E,K,'slash',false,TE),off=without('elf.reflexes',()=>computeMods(E,K,'slash',false,TE));
  expect('Elven: a man\\'s blow at Ilyas is at DEF +1 (elven reflexes)',on.def===off.def+1&&on.defMods.some(m=>m[0]==='elven reflexes'&&m[2]==='Elven'),on.def+' '+off.def);}
{const on=actionCost(K,'slash'),off=without('elf.pace',()=>actionCost(K,'slash'));
  expect('Elven: his tempo is the game\\'s \\u00d7'+ELVEN.tempo,on===Math.round(off*ELVEN.tempo),on+' from '+off);}
{E.tempoK=.5;const on=actionCost(E,'slash'),off=without('act1.pace',()=>actionCost(E,'slash'));E.tempoK=null;
  expect('Act I: a man with a pace of his own pays that share of every cost',on===Math.round(off*.5),on+' from '+off);}
{K.edge={t0:S.t};K.stance='bound';const on=computeMods(K,E,'slash',false,TK),off=without('spell.edge.hit',()=>computeMods(K,E,'slash',false,TK));K.edge=null;
  expect('Spell: the gilt edge in Bound is +'+EDGE.hit+' to hit',on.bonus===off.bonus+EDGE.hit&&on.mods.some(m=>m[0]==='gilt edge'));}
{[K,E]=setup({seed:77});K.whet=true;const on=hitWith(K,E,'slash',pickTechnique(K,E,'slash'));
  [K,E]=setup({seed:77});K.whet=true;const off=without('gear.whet',()=>hitWith(K,E,'slash',pickTechnique(K,E,'slash')));K.whet=false;
  expect('Gear: the whetted edge cuts '+ACT1_GOODS.whet+' deeper, and the result says so',on&&off&&on.dmg===off.dmg+ACT1_GOODS.whet&&(on.rules||[]).some(r=>r.id==='gear.whet'&&r.src==='Gear'&&r.v===ACT1_GOODS.whet),
    on&&off&&on.dmg+' '+off.dmg);}
[K,E]=setup();
{[K,E]=setup({seed:78});E.hench=true;E.downed=true;E.hp=E.maxHp;const on=hitWith(K,E,'thrust',pickTechnique(K,E,'thrust'));[K,E]=setup({seed:78});E.hench=true;E.downed=true;E.hp=E.maxHp;
  const off=without('rise.finish',()=>hitWith(K,E,'thrust',pickTechnique(K,E,'thrust')));
  expect('The free rise: a crew man struck on the floor is finished (the blow takes all he has left)',on&&off&&on.dmg===E.maxHp&&off.dmg<E.maxHp&&!!on.tech.fin,on&&off&&on.dmg+' '+off.dmg);}
[K,E]=setup();
{K.mount={};const why=ruleBarWhy(K,E,'grab');K.mount=null;expect('Riding: no grab from the saddle',why==='not from the saddle',why);}
{expect('Spell: the gilt edge is lit, never a command',!cmdValid(K,E,'edge')&&ruleBarWhy(K,E,'edge')==='lit, never a command');}
{E.setWeapon('pistol');expect('Gun: a gun is not a blade (no slash), and it shoots',!cmdValid(E,K,'slash')&&ruleBarWhy(E,K,'slash')==='a gun is not a blade'&&cmdDefOK(E,K,'shoot')!==undefined);
  const on=shotMods(E,K,'shoot',0),off=without('elf.reflexes.shot',()=>shotMods(E,K,'shoot',0));
  expect('Elven: a round at Ilyas is at DEF +2',on.def===off.def+2);}
{K.oneArm=true;const why=ruleBarWhy(K,E,'throw');K.oneArm=false;expect('Act I: one arm cannot throw',why==='Needs two hands',why);}

// ---------- the gear (sk_gear.js): what he wears, against the game without it ----------
// (him dressed in the crate's first choices with these put on; a blow at him from the man, measured with the gear's entry and without)
const kitW=k=>kitWear(Object.assign(gearDefault(),k)),statsW=k=>kitStats(Object.assign(gearDefault(),k));
function blowAt(seed,foe,kind,kit,off){let [k,e]=setup({seed,foe});k.wear=kitW(kit);const T=pickTechnique(e,k,kind);
  const r=off?without('gear.armour',()=>hitWith(e,k,kind,T)):hitWith(e,k,kind,T);return r&&{r,z:gearZone(kind,r.tech),k:gearKind(e,kind,r.tech)};}
const FULL={head:'helmet',armour:'stabvest',hands:'gauntlet',legs:'shins',feet:'dockboots'};
for(const [seed,foe,kind] of [[81,'sword','slash'],[82,'sword','thrust'],[83,'club','slash'],[84,'sword','overhead'],[85,'sword','sweep'],[86,'fists','slash']]){
  const on=blowAt(seed,foe,kind,FULL),off=blowAt(seed,foe,kind,FULL,true),G=statsW(FULL),v=on?G.def[on.z][on.k]:0,rec=on&&(on.r.rules||[]).find(x=>x.id==='gear.armour');
  expect('Gear: a '+(foe==='fists'?'fist':foe)+'\\'s '+kind+' lands on the '+(on&&on.z)+' as '+(on&&on.k)+': '+v+' off it, never under one, and the result names what stopped it',
    on&&off&&v>0&&on.r.dmg===Math.max(1,off.r.dmg-v)&&!!rec&&rec.src==='Gear'&&rec.v===on.r.dmg-off.r.dmg&&/^the /.test(rec.label),on&&off&&[on.r.dmg,off.r.dmg,v,rec&&rec.label].join(' '));}
{const a=blowAt(91,'sword','slash',{coat:'oilcloth'}),b=blowAt(91,'club','slash',{coat:'oilcloth'}),G=statsW({});
  expect('the crate\\'s first choices: the oilcloth coat takes 1 off a blade on the body, nothing off a club, and weighs under '+GEAR_FREE,
    G.def.body.cut===1&&G.def.body.thrust===1&&G.def.body.blunt===0&&G.wt<GEAR_FREE&&G.pace===1&&!!a&&(a.z!=='body'||(a.r.rules||[]).some(x=>x.id==='gear.armour'))&&!!b&&!(b.r.rules||[]).some(x=>x.id==='gear.armour'),
    JSON.stringify(G.def)+' '+G.wt);}
{// a blow that would kill him, that his gear keeps him alive under: no finisher
  let [k,e]=setup({seed:92});k.wear=kitW(FULL);const T=pickTechnique(e,k,'slash'),c=computeMods(e,k,'slash',false,T);let r=null,hp0=0;
  for(let v=2;v<20&&!r;v++){const t=v+c.bonus;if(t<c.def||isCrit(v,t,c.def))continue;const dmg=without('gear.armour',()=>rolled(v,()=>resolveAttack(e,k,'slash',false,T))).dmg;
    [k,e]=setup({seed:92});k.wear=kitW(FULL);hp0=dmg-1;k.hp=hp0;r=rolled(v,()=>resolveAttack(e,k,'slash',false,T));}
  expect('Gear: a blow that would have killed him, that his gear keeps him alive under, is no finisher',!!r&&hp0-r.dmg>0&&!(r.tech&&r.tech.fin),r&&[hp0,r.dmg,r.tech&&r.tech.fin&&r.tech.fin.name].join(' '));}
{[K,E]=setup();const HV={head:'helmet',armour:'tyres',hands:'gauntlet',legs:'shins',feet:'dockboots'};K.wear=kitW(HV);const G=gearOf(K);
  const on=actionCost(K,'slash'),off=without('gear.weight',()=>actionCost(K,'slash'));
  expect('Gear: past '+GEAR_FREE+' in weight every move costs more ('+G.wt+': \u00d7'+G.pace.toFixed(3)+')',G.wt>GEAR_FREE&&on===Math.round(off*G.pace)&&on>off,on+' from '+off);
  E.station=K.station+K.facing*320;const ap=approachCost(K,E,'slash'),ap0=without('gear.weight.step',()=>approachCost(K,E,'slash'));
  expect('and so does closing a long way to strike',ap0>0&&ap===Math.round(ap0*G.pace),ap+' from '+ap0);
  K.wear=kitW({});expect('the crate\\'s first choices: nothing slower',actionCost(K,'slash')===without('gear.weight',()=>actionCost(K,'slash')));}
{[K,E]=setup();K.wear=kitW({hands:'gauntlet'});const on=disarmMods(E,K,'bind'),off=without('gear.grip',()=>disarmMods(E,K,'bind'));
  expect('Gear: the gauntlet\\'s grip is DC +2 against a disarm',on.dc===off.dc+2&&on.defMods.some(m=>m[0]==='his grip'&&m[2]==='Gear'),on.dc+' '+off.dc);}
{[K,E]=setup();const T=pickTechnique(E,K,'sweep');K.wear=kitW({feet:'dockboots'});const on=computeMods(E,K,'sweep',false,T),off=without('gear.footing',()=>computeMods(E,K,'sweep',false,T));
  K.wear=kitW({feet:'sandals'});const lo=computeMods(E,K,'sweep',false,T),sl=computeMods(E,K,'slash',false,pickTechnique(E,K,'slash')),sl0=without('gear.footing',()=>computeMods(E,K,'slash',false,pickTechnique(E,K,'slash')));
  expect('Gear: dock boots hold against a sweep (DEF +1), rope sandals slip (\u22121), and neither changes a slash',on.def===off.def+1&&lo.def===off.def-1&&sl.def===sl0.def,[on.def,off.def,lo.def].join(' '));}
{[K,E]=setup();K.wear=kitW({armour:'tyres'});const on=grabMods(E,K,false),off=without('gear.snag',()=>grabMods(E,K,false));
  expect('Gear: the tyre plates\\' laces give a hand a hold (DC \u22121 against a grab)',on.dc===off.dc-1&&on.defMods.some(m=>m[0]==='a hold on his gear'),on.dc+' '+off.dc);}
{[K,E]=setup();K.wear='kael';expect('Gear: a fighter who wears none of it (the lab\\'s, the cast) has none of it',gearOf(K)===null&&gearOf(E)===null);}
{const a=kitRead({body:1,coat:2,hands:2,feet:1,belt:1}),b=kitRead('canvas'),c=kitRead({head:'helmet',armour:'cap',feet:'dockboots'});
  expect('Gear: a kit kept before V97 (a place in each old list) reads as what it was; anything else, as the crate\\'s first choices',
    a.body==='jersey'&&a.coat==='scarf'&&a.hands==='wrap'&&a.feet==='sandals'&&a.belt==='rope'&&a.head==='nohat'&&a.armour==='noarmour'&&a.legs==='trousers'&&
    JSON.stringify(b)===JSON.stringify(gearDefault())&&c.head==='helmet'&&c.armour==='noarmour'&&c.feet==='dockboots',JSON.stringify([a,c]));}
{const W=kitW(FULL);expect('Gear: what he wears is drawn: the helmet, the stab vest, the gauntlet, the shin guards, the dock boots, over the crate\\'s shirt and coat',
  W.head==='helmet'&&W.vest==='stab'&&W.hands==='gauntlet'&&W.legs==='shins'&&W.feet==='dock'&&W.top==='shirt'&&W.coat==='oilcloth'&&W.gear.length===GEAR_SLOTS.length,JSON.stringify(W));}

console.log('\\n'+nOk+' ok, '+errs.length+' failed');console.log('errors '+errs.length+' '+JSON.stringify(errs));
process.exit(errs.length?1:0);
`);
