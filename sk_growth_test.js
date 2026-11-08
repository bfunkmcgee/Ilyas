// Levels and growth (sk_growth.js; since V93). The curve to level 100 and the styles' to 20; what an enemy is worth; the lab with none
// of it; a night's growth: a chapter's par, his health by his level, the XP an enemy defeated gives (to him, logged, the hook told),
// a level and two at once and the top, a stage's end once, a man broken, a lesson's moves; what each level gives, read by the rules
// (to hit, DEF, health, balance, damage, cost) against the game without them; the style he fights in, what a blow of his gives it,
// its perks past where he starts it and its top; and Try again and the saves putting it back as the stage began.
const core=require('./sk_src.js')(process.argv[2]);
eval(core+`
const errs=[];let nOk=0,base=mulberry32(93);S.rng=()=>base();Math.random=()=>base();
function expect(label,ok,extra){if(ok)nOk++;else errs.push(label+(extra!=null?': '+extra:''));console.log((ok?'ok   ':'FAIL ')+label+(extra!=null?'  '+extra:''));}
const NOTES=[],HOOK=[];S.hooks.note=(f,t,s)=>NOTES.push({f:f&&f.name,t,s});S.hooks.growth=(k,d)=>HOOK.push({k,...d});
// the next roll comes up v
function rolled(v,fn){const save=S.rng;let first=true;S.rng=()=>{if(first){first=false;return(v-.5)/20;}return save();};try{return fn();}finally{S.rng=save;}}
// a plain hit (not a crit), or null when none can be had
function hitWith(A,D,kind){const c=computeMods(A,D,kind,false);for(let v=2;v<20;v++){const t=v+c.bonus;if(t>=c.def&&!isCrit(v,t,c.def))return rolled(v,()=>resolveAttack(A,D,kind,false));}return null;}
// the same thing with entries out of play (every one whose id starts so)
function without(pre,fn){const ids=RULES.list.filter(r=>r.id.startsWith(pre)).map(r=>r.id);for(const id of ids)RULES.off(id);try{return fn();}finally{for(const id of ids)RULES.off(id,false);}}
// a step of the game, an answer window played out as the page plays it (a man the game plays picks; for one it does not, the time runs out)
function step(){simStep();if(S.cut)cutSkip();if(S.opening)tickOpening(isAI(S.opening.f.idx)?DT:S.opening.left+.01);}
// an exchange to its end
function run(max=120*12){let n=0;for(;n<max;n++){step();if(S.game.phase!=='exchange'&&!S.opening)return n;}return n;}
function act(i,cmd){const g=S.game;g.phase='input';g.active=i;g.aiAt=null;S.opening=null;g.ex=null;return command(i,cmd);}
// a night begun at a stage (a chapter), up to its fight and his turn, the scenes skipped; then the game waits for him
function night(key){storyQuit();S.F=[];base=mulberry32(93);S.storyAuto=true;S.auto=true;S.allyAuto=true;storyBegin(key,{auto:true});
  for(let n=0;n<12000&&!(S.story.step==='fight'&&S.game.phase==='input'&&!S.cut&&!S.intro&&!S.opening);n++)step();
  S.auto=false;S.game.aiAt=null;for(const f of S.F){f.intent=null;f.ready=f.idx?60:0;f.reads={};}NOTES.length=0;HOOK.length=0;return S.story;}
const foe=()=>S.F.find(f=>f.team===1&&!f.dead&&!f.npc);
const setXP=xp=>{S.story.growth.xp=xp;};

// ---------- the curve ----------
{let up=true;for(let L=2;L<GROWTH.max;L++)if(xpNeed(L)<=xpNeed(L-1))up=false;
  expect('level 1 at nothing and level 2 at 80 XP; each level takes more than the one before',XP_AT[1]===0&&XP_AT[2]===80&&up,XP_AT.slice(1,6).join(' '));
  let at=true;for(let L=2;L<=GROWTH.max;L++)if(levelOf(XP_AT[L])!==L||levelOf(XP_AT[L]-1)!==L-1)at=false;
  expect('every level starts at its XP and not one before',at);
  expect('100 is the most: '+XP_AT[100]+' XP, and no XP makes another',GROWTH.max===100&&levelOf(XP_AT[100])===100&&levelOf(1e12)===100&&levelOf(-5)===1,XP_AT[100]);
  let sat=true;for(let L=2;L<=STYLE_GROWTH.max;L++)if(styleLevelOf(STYLE_XP_AT[L])!==L||styleLevelOf(STYLE_XP_AT[L]-1)!==L-1)sat=false;
  expect('a style: levels 1 to 20, a rank every four (Novice, Trained, Veteran, Expert, Master)',sat&&styleLevelOf(1e9)===20&&
    [1,4,5,9,13,16,17,20].map(styleRank).join()==='Novice,Novice,Trained,Veteran,Expert,Expert,Master,Master');
  expect('where he starts each style: Short Hand a Novice, the Wire drill an Expert, the Sareth cut a Master',
    styleRank(STYLE_GROWTH.start.shorthand)==='Novice'&&styleRank(STYLE_GROWTH.start.wire)==='Expert'&&styleRank(STYLE_GROWTH.start.sareth)==='Master');}

// ---------- what an enemy is worth ----------
{const x=o=>xpFoe(Object.assign({team:1,name:'Tobin',skill:3,maxHp:60},o));
  expect('an enemy: by his rank, at sixty health',[1,2,3,4,5].map(k=>x({skill:k})).join()===XP_GAIN.foe.join(),[1,2,3,4,5].map(k=>x({skill:k})).join());
  expect('a crew man three quarters, a boss half again, a named elf a quarter more',x({hench:true})===Math.round(32*.75)&&x({boss:true})===48&&x({name:'Qadir'})===40,[x({hench:true}),x({boss:true}),x({name:'Qadir'})].join());
  expect('by his health against sixty, from a half to three times',x({maxHp:30})===16&&x({maxHp:120})===64&&x({maxHp:6})===16&&x({maxHp:900})===96);}

// ---------- the lab: none of it ----------
{S.arenaKey='street';S.room=null;S.auto=false;S.tableOn=false;S.divOn=false;S.cfg.n=1;S.cfg.crew=false;S.cfg.ally.on=false;S.allyAuto=false;
  S.cfg.hero={seed:2207,weapon:'elven',skill:4};S.cfg.foes[0]={seed:5113,weapon:'sword',skill:3,temper:'plain'};
  S.F=[];rosterBuild();initDuel();warm(20);const g=S.game;g.phase='input';startTurn(0);g.aiAt=null;g.active=0;S.opening=null;
  for(const f of S.F){f.intent=null;f.ready=f.idx?60:0;f.foot=footMaxOf(f);f.reads={};}S.F[1].name='Tobin';
  const K=S.F[0],D=S.F[1],c=computeMods(K,D,'slash',false),d=computeMods(D,K,'slash',false);
  const lv=[...(c.rules||[]),...(d.rules||[])].filter(r=>r.src==='Level'||/^style\\./.test(r.id));
  expect('the lab: no growth, and no level or style entry in a roll',!growthOn()&&!lv.length&&heroLevel()===1,lv.map(r=>r.id).join());
  const n0=NOTES.length;D.hp=0;kill(D,1);expect('the lab: an enemy defeated gives nothing',!growthOn()&&NOTES.slice(n0).every(n=>!/XP$/.test(n.t)));}

// ---------- a night: a chapter's par, his health, an enemy defeated ----------
{const SV=night('dining'),K=hero(),g=SV.growth,par=growthPar('dining'),L=levelOf(par.xp);
  expect('a chapter begins with what the stages before it give (its par)',g&&g.xp===par.xp&&par.xp>0&&L>=2,par.xp+' XP, level '+L);
  expect('his health: the stage\\'s own and 2 a level after the first',K.maxHp===STORY_KAEL.hp+GROWTH.hp*(L-1),K.maxHp+' at level '+L);
  const D=foe(),x0=g.xp,want=xpFoe(D);D.hp=0;kill(D,1);
  expect('an enemy defeated: his worth in XP, logged as his and the hook told',g.xp===x0+want&&NOTES.some(n=>n.t==='+'+want+' XP'&&n.s===D.name+' defeated')&&HOOK.some(h=>h.k==='xp'&&h.n===want),
    want+' XP for '+D.name);
  // a level
  const E=foe();setXP(XP_AT[L+1]-1);const h0=K.maxHp,hp0=K.hp;HOOK.length=0;NOTES.length=0;E.hp=0;kill(E,1);
  expect('a level: 2 more health at once, healed by it, its note and the hook',heroLevel()===L+1&&K.maxHp===h0+2&&K.hp===Math.min(K.maxHp,hp0+2)&&
    NOTES.filter(n=>n.t==='Level '+(L+1)).length===1&&HOOK.some(h=>h.k==='level'&&h.L0===L&&h.L1===L+1),K.maxHp+' '+JSON.stringify(NOTES.map(n=>n.t)));
  // two at once, and the top
  const h1=K.maxHp;xpGain(XP_AT[L+3]-g.xp,'a test');
  expect('two levels at once: both counted, the health of both',heroLevel()===L+3&&K.maxHp===h1+4&&NOTES.some(n=>n.t==='Level '+(L+3)&&/\\+4 health/.test(n.s)),K.maxHp);
  setXP(XP_AT[100]-3);const top=xpGain(50,'a test'),more=xpGain(10,'a test');
  expect('at the top: the XP stops at '+XP_AT[100]+' and no more is taken',g.xp===XP_AT[100]&&heroLevel()===100&&more===0&&top===3);
  setXP(XP_AT[L]);}

// ---------- what a level gives (the rules) ----------
{const K=hero(),D=foe();D.name='Tobin';K.oneArm=false;const at=L=>{setXP(XP_AT[L]);K.foot=footMaxOf(K);D.foot=footMaxOf(D);};
  const ids=RULE_ROLLS.filter(on=>!RULES.ids['level.hit.'+on]||!RULES.ids['level.def.'+on]);
  expect('a level\\'s entries: to hit and DEF in every roll, and health, balance, damage and cost',!ids.length&&['level.hp','level.foot','level.dmg','level.tempo'].every(id=>RULES.ids[id]),ids.join());
  const hit=L=>{at(L);return computeMods(K,D,'slash',false).bonus-without('level.',()=>computeMods(K,D,'slash',false).bonus);};
  const def=L=>{at(L);return computeMods(D,K,'slash',false).def-without('level.',()=>computeMods(D,K,'slash',false).def);};
  expect('to hit: +1 at each of its levels',[1,4,5,11,12,20,56,90,100].map(hit).join()==='0,0,1,1,2,3,6,8,8',[1,4,5,11,12,20,56,90,100].map(hit).join());
  expect('DEF: +1 at each of its levels, in a roll made at him',[1,7,8,18,95].map(def).join()==='0,0,1,2,6',[1,7,8,18,95].map(def).join());
  {at(8);const c=computeMods(K,D,'slash',false),r=(c.rules||[]).find(x=>x.id==='level.hit.attack');
    expect('the roll records it, under the level',!!r&&r.label==='level'&&r.v===1&&c.mods.some(m=>m[0]==='level'&&m[2]==='Level'),JSON.stringify(r));}
  {at(12);const sh=shoveMods(K,D,false).bonus-without('level.',()=>shoveMods(K,D,false).bonus),gr=grabMods(K,D,false).bonus-without('level.',()=>grabMods(K,D,false).bonus);
    expect('and in his other rolls (a shove, a grab)',sh===2&&gr===2,sh+' '+gr);}
  const hp=L=>{at(L);return ruleNum('hpmax',{f:K},()=>100);};
  expect('health: 2 a level after the first',hp(1)===100&&hp(2)===102&&hp(50)===198&&hp(100)===298,[hp(1),hp(2),hp(50),hp(100)].join());
  const foot=L=>{at(L);return footMaxOf(K)-without('level.',()=>footMaxOf(K));};
  expect('balance: a pip more at 25, 60 and 100',[24,25,59,60,100].map(foot).join()==='0,1,1,2,3',[24,25,59,60,100].map(foot).join());
  const cost=L=>{at(L);return[actionCost(K,'slash'),without('level.',()=>actionCost(K,'slash'))];};
  {const [a10,b10]=cost(10),[a11,b11]=cost(11),[a51,b51]=cost(51),[a100,b100]=cost(100);
    expect('cost: a hundredth off at each tenth level (none to 10, one at 11, five at 51, nine at 91 on)',a10===b10&&a11===Math.round(b11*.99)&&a11<b11&&a51===Math.round(b51*.95)&&a100===Math.round(b100*.91),[a10,b10,a11,b11,a51,b51,a100,b100].join());
    const which=L=>{at(L);return ruleWhich('tempo',{f:K,cmd:'slash',extra:0}).some(e=>e.id==='level.tempo');};
    expect('the tempo line names it only once it takes something off (from 11)',!which(10)&&which(11));}
  // (the same dice both ways: only the damage entry is out of play the second time)
  const dmg=L=>{at(L);base=mulberry32(7);const a=hitWith(K,D,'slash');at(L);base=mulberry32(7);const b=without('level.dmg',()=>hitWith(K,D,'slash'));return a&&b?a.dmg-b.dmg:null;};
  expect('damage: +1 on a blow of his that lands, at 10, 35, 65 and 90',[9,10,35,90].map(dmg).join()==='0,1,2,4',[9,10,35,90].map(dmg).join());
  {const d0=(()=>{at(1);return computeMods(D,K,'slash',false);})();
    expect('an enemy\\'s own rolls are his as they were (only DEF at him)',d0.bonus===without('level.',()=>computeMods(D,K,'slash',false)).bonus);}
  at(levelOf(growthPar('dining').xp));}

// ---------- the style he fights in ----------
{const K=hero(),st0=K.stance,wk=K.weaponKey;
  expect('the arc-blade: the Sareth cut',heroStyle(K)==='sareth',heroStyle(K)+' '+K.weaponKey+' '+stanceOf(K));
  K.stance='unbound';const ub=heroStyle(K);K.stance=st0;K.style='wire';const w=heroStyle(K);K.style=null;K.drain=1;const dr=heroStyle(K);K.drain=0;K.oneArm=true;const oa=heroStyle(K);K.oneArm=false;
  expect('his own in any stance, the Wire drill once he picks it (since V94); drained, or one arm, no style',ub==='sareth'&&w==='wire'&&dr===null&&oa===null,[ub,w,dr,oa].join());
  const D=foe();expect('an enemy has none of his',heroStyle(D)===null);
  // a blow of his that lands, real, to its end; and what lands of his in the exchanges after it
  for(const f of S.F)if(f.team===1)f.hp=f.maxHp=9999;const g=growth(),s0=g.styles.sareth;let want=0;
  // (no set piece of the stage's plays while the blows are counted: since V109 the dining room's tank plays in every fight, and it put
  // the one crew man left here through the glass, which ended the fight, and the blows went on into the kitchen's)
  for(const p of SET_PIECES)if(p.stage===S.story.key)(S.story.pieces||(S.story.pieces={}))[p.key]=true;
  // (counted at each blow's impact, as the game counts it since V94)
  let tallyOn=true;{const ap=applyImpact;applyImpact=function(ex,A,D,res){const r=ap.apply(this,arguments);
    if(tallyOn&&A===K&&heroStyle(K)==='sareth'&&res&&!res.weaponHit&&(res.out==='hit'||res.out==='crit'))want+=res.out==='crit'?XP_GAIN.style.crit:XP_GAIN.style.hit;return r;};}
  for(let i=0;i<10;i++){K.foot=footMaxOf(K);const c=computeMods(K,D,'slash',false);let v=2;while(v<20&&v+c.bonus<c.def)v++;rolled(v,()=>act(0,'slash'));run();}
  tallyOn=false;
  expect('a blow of his that lands gives the style he fights in its XP (3 a hit, 5 a crit)',want>0&&g.styles.sareth-s0===want,(g.styles.sareth-s0)+' of '+want);
  g.styles.wire=STYLE_XP_AT[20]-1;const a=styleGain('wire',100),b=styleGain('wire',5);
  expect('a style stops at 20',g.styles.wire===STYLE_XP_AT[20]&&a===1&&b===0&&styleLevel('wire')===20);
  g.styles.sareth=STYLE_XP_AT[17];
  const perk=()=>{K.foot=footMaxOf(K);return computeMods(K,D,'slash',false).bonus-without('style.sareth',()=>computeMods(K,D,'slash',false).bonus);};
  const p17=perk();g.styles.sareth=STYLE_XP_AT[20];const p20=perk();g.styles.sareth=STYLE_XP_AT[17];
  expect('its perks count from where he starts it: none at Master 17, +1 to hit at 20',p17===0&&p20===1,p17+' '+p20);}

// ---------- a stage's end, once; a man broken by him ----------
{const SV=S.story,st=STAGES[SV.i],g=growth(),x0=g.xp;storyCleared();const x1=g.xp;
  expect('a stage\\'s end: a fight\\'s, with each enemy in it',x1-x0===XP_GAIN.fight+XP_GAIN.perFoe*st.foes.length&&!growthOnce('stage:'+st.key),(x1-x0)+' for '+st.foes.length+' enemies');}
{const SV=night('kitchen'),K=hero(),D=foe(),g=growth(),x0=g.xp;D.foot=0;breakFighter(D,K);const x1=g.xp;const E=S.F.find(f=>f.team===1&&f!==D&&!f.dead&&!f.npc);
  if(E){E.foot=0;breakFighter(E,D);}
  expect('a man broken by him: '+XP_GAIN.break+' XP (and none for one broken by another)',x1-x0===XP_GAIN.break&&g.xp===x1,(x1-x0)+'');
  // a level that comes of his killing blow: said once the move is over (in a stretch of its own, so the drawing shows it)
  const V=foe(),L=heroLevel();V.hp=1;setXP(XP_AT[L+1]-1);NOTES.length=0;let during=null;const spy=()=>{if(during===null)during=GROWTH_SAY.length;};V11.kill.push(spy);
  for(let i=0;i<10&&!V.dead;i++){K.foot=footMaxOf(K);const c=computeMods(K,V,'slash',false);let v=2;while(v<20&&v+c.bonus<c.def)v++;rolled(v,()=>act(0,'slash'));run();}
  V11.kill.splice(V11.kill.indexOf(spy),1);const p=S.popups.find(q=>q.text==='Level '+(L+1)),gMax=Math.max(...S.popups.map(q=>q.g||0));
  expect('a level that comes of his killing blow is said once the move is over, in a stretch of its own',V.dead&&during===1&&heroLevel()===L+1&&!!p&&p.g===gMax&&
    p.rank===4.7&&NOTES.filter(n=>n.t==='Level '+(L+1)).length===1,JSON.stringify({dead:V.dead,during,L:heroLevel(),p:p&&{g:p.g,rank:p.rank},gMax}));}

// ---------- Act I: a lesson's moves, and Short Hand ----------
{const SV=night('sh2'),K=hero(),g=growth(),par=growthPar('sh2'),moves=Object.keys(SV.flags.short||{}).length;
  // (the moves before it are in its par; the one its lesson teaches, as it begins)
  const before=Object.keys(Object.assign({},...STAGES.slice(0,stageIx('sh2')).map(st=>st.flagsOut&&st.flagsOut.short||{}))).length;
  expect('Act I: the par, with the lessons\\' moves before it, and the move its lesson teaches as it begins',before>=1&&moves>before&&g.xp===par.xp+XP_GAIN.move*(moves-before)&&
    g.styles.shorthand===STYLE_XP_AT[1]+XP_GAIN.style.move*moves&&heroLevel()>=7,g.xp+' XP, level '+heroLevel()+', Short Hand '+g.styles.shorthand+' ('+before+' then '+moves+' moves)');
  expect('in Act I he fights in Short Hand',heroStyle(K)==='shorthand');
  const fresh=SHORT_MOVES.map(m=>m.key).filter(k=>!(SV.flags.short||{})[k]).slice(0,2),x0=g.xp,s0=g.styles.shorthand;shLearn(K,fresh);
  expect('a lesson: each move new to him, '+XP_GAIN.move+' XP and '+XP_GAIN.style.move+' Short Hand XP',fresh.length===2&&g.xp-x0===2*XP_GAIN.move&&g.styles.shorthand-s0===2*XP_GAIN.style.move,fresh.join());
  const x1=g.xp;shLearn(K,fresh);expect('a move he has gives nothing again',g.xp===x1);
  const T=S.F.find(f=>f.team===1&&!f.npc);g.styles.shorthand=STYLE_XP_AT[5];
  const perk=()=>{K.foot=footMaxOf(K);return computeMods(K,T,'slash',false).bonus-without('style.shorthand',()=>computeMods(K,T,'slash',false).bonus);};
  const p5=perk();g.styles.shorthand=STYLE_XP_AT[4];const p4=perk();
  expect('Short Hand\\'s perks from Novice: +1 to hit at its level 5',p5===1&&p4===0,p4+' '+p5);}

// ---------- Try again, and the saves ----------
{const SV=night('vargo'),K=hero(),at=SV.at,g0=JSON.stringify(at.parts.growth),h0=K.maxHp;
  expect('the stage\\'s record holds his growth as it began',!!at.parts.growth&&at.parts.growth.xp===growth().xp);
  xpGain(XP_AT[heroLevel()+2]-growth().xp,'a test');const h1=K.maxHp;storyRetry();for(let i=0;i<5;i++)step();
  expect('Try again: his growth as the stage began, and his health with it',JSON.stringify(growth())===g0&&hero().maxHp===h0&&h1===h0+4,hero().maxHp+' '+h0+' '+h1);
  const R=saveTake(S.story.key);R.parts.growth.xp=XP_AT[12];R.parts.growth.got['stage:vargo']=true;
  storyQuit();S.F=[];storyBegin(R.key,{resume:R,auto:true});
  expect('a kept night begins with its growth, and its once-a-night marks',growth().xp===XP_AT[12]&&!growthOnce('stage:vargo')&&hero().maxHp===STORY_KAEL.hp+2*11,growth().xp+' '+hero().maxHp);
  const bad=[growthFrom({xp:'x'}),growthFrom({xp:NaN}),growthFrom(null),growthFrom({styles:{}})];
  const odd=growthFrom({xp:-50,styles:{wire:1e9,sareth:'x',other:5},got:{a:true,b:1}});
  expect('a record\\'s growth: unusable is nothing, numbers kept in their bounds, nothing else taken',bad.every(x=>x===null)&&odd.xp===0&&odd.styles.wire===STYLE_XP_AT[20]&&
    odd.styles.sareth===STYLE_XP_AT[STYLE_GROWTH.start.sareth]&&!('other' in odd.styles)&&odd.got.a===true&&!('b' in odd.got),JSON.stringify(odd));
  const R2=saveTake(S.story.key);delete R2.parts.growth;storyQuit();S.F=[];storyBegin(R2.key,{resume:R2,auto:true});
  expect('a night kept before levels (no growth in it): the chapter\\'s par',growth()&&growth().xp===growthPar(R2.key).xp);
  storyQuit();expect('back in the lab: no growth',!growthOn()&&heroLevel()===1);}

// ---------- the par along the night ----------
{let ok=true,prev=-1;const rows=[];for(const st of STAGES){const p=growthPar(st.key).xp;if(p<prev)ok=false;prev=p;rows.push(st.key+':'+levelOf(p));}
  const end=levelOf(growthPar(STAGES[STAGES.length-1].key).xp);
  expect('the par never goes down along the night, and what is built ends a little under level 10',ok&&end>=6&&end<10,rows.join(' '));}

console.log('\\n'+nOk+' ok, '+errs.length+' failed');console.log('errors '+errs.length+' '+JSON.stringify(errs));
process.exit(errs.length?1:0);
`);
