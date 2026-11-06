// ==================== THE RULES ====================
// One list of every change a feature makes to the rules (since V91). A feature does not wrap the dice or the costs: it adds an entry
// here, and the one function that works the number out reads the list. The log shows which entries applied (sk_ui.js, ruleLine).
//
//   RULES.add({id, src, on, when, ...})
//     id    unique, '<module>.<name>' ('elf.reflexes')
//     src   the system it belongs to, as the log names it ('Elven', 'Stance', 'Spell', 'Short Hand', 'Gear', 'Act I'...)
//     on    what it changes (below)
//     when  when(x): whether it applies (x below; no dice, nothing changed: the planners and the drawing ask it too)
//
// What an entry changes, and what x holds:
//   A roll: 'attack' (computeMods), 'shot' (shotMods), 'grab', 'shove', 'throw', 'break', 'disarm', 'feint', 'toss', 'bottle', 'kick',
//     'gale', 'room', 'line'. x: the roll's own arguments by their names (A, D, kind, opening, T...) and c, the roll so far (mods and
//     bonus: the roller's side; defMods and def, or dc: the other man's). An entry gives a modifier: to 'hit' (the roller's) or 'def'
//     (the other's), with label and v (a number, or v(x)), or mod(x) giving [label, v]; null or undefined leaves it out this time.
//     It goes in as [label, v, src]. Or edit(x) changes the roll another way (puts a modifier to nothing, puts one in another's place)
//     and gives what the log says: a label, or [label, v]; nothing when it changed nothing.
//   'tempo' (actionCost; x {f, cmd, extra}), 'approach' (approachCost; x {A, D, cmd}), 'foot' (footDelta, the balance a move costs,
//     a negative number; x {A, cmd, T}), 'footmax' (footMaxOf; x {f}), 'hpmax' (the story's hero's most health as a stage sets him
//     up, storyDuel; x {f}): set (the number, or set(x)) takes the place of the game's own; mul (rounded) and add change it.
//   'dmg' (resolveAttack, every result it gives; x {A, D, kind, opening, T, r}): add (a number, or add(x)) with min (the least it
//     leaves), or edit(x) for the rest, giving what the log says as a roll's edit does.
//   'cmd' (cmdValid; x {A, D, cmd}): when(x) bars the command; why (a word, or why(x)) says why.
//
// The entries apply in the order they were added, which is the order the modules load (build.py): the order the wrappers they took
// the place of ran in, the innermost first. Of the sets that apply, the last added wins (as the outermost wrapper did), and then every
// mul and add applies in order. Each applied entry is recorded as {id, src, on, to, label, v}: a roll's in c.rules, and so in the
// result's rules (with the damage entries after them).
//
// What stays a wrapper: what a scene does to a fight (a stage that spares everyone, the toll, a forced outcome, a lesson's blows), what
// needs the state of an exchange in hand (the Short Hand's cap on the balance a glancing blow takes, the pip a missed answer costs),
// how a command is carried out and what the AI picks. A new command is defined here too (cmdDef, below), so the bars apply to it.
// An entry is checked as it is added (what it changes, and that it says how), so a new system's mistake shows when the page loads.
// RULES.off(id) puts one out of play and RULES.off(id, false) back (the rules suite measures each that way; nothing in the game does).
const RULES={list:[],on:{},ids:{},
  add(r){const no=w=>{throw new Error('RULES.add'+(r&&r.id?' '+r.id:'')+': '+w);};
    if(!r||!r.id)no('a rule needs an id');if(this.ids[r.id])no('added twice');if(!r.src)no('needs its src');
    const on=r.on,roll=RULE_ROLLS.includes(on),num=RULE_NUMS.includes(on);
    if(!roll&&!num&&on!=='dmg'&&on!=='cmd')no('changes nothing the rules know ('+on+')');
    if(r.when!=null&&typeof r.when!=='function')no('when must be a test');
    if(roll&&!r.edit&&!((r.to==='hit'||r.to==='def')&&(r.mod||(r.v!==undefined&&r.label))))no('a roll\'s entry needs to:hit or def and v and a label, or mod, or edit');
    if(num&&[r.set,r.mul,r.add].filter(v=>v!==undefined).length!==1)no('a number\'s entry needs one of set, mul or add');
    if(on==='dmg'&&!r.edit&&!(r.add!==undefined&&r.label))no('a damage entry needs add and a label, or edit');
    if(on==='cmd'&&!r.why)no('a bar needs its why');
    if(!r.when)r.when=()=>true;this.ids[r.id]=r;this.list.push(r);(this.on[on]||(this.on[on]=[])).push(r);return r;},
  of(on){return this.on[on]||[];},
  off(id,v){const r=this.ids[id];if(!r)throw new Error('RULES.off: no rule '+id);r.off=v!==false;return r;}};
// the rolls a rule can change (each is read by ruleRoll at the end of the function named), and the numbers (ruleNum)
const RULE_ROLLS=['attack','shot','grab','shove','throw','break','disarm','feint','toss','bottle','kick','gale','room','line'];
const RULE_NUMS=['tempo','approach','foot','footmax','hpmax'];
function ruleVal(v,x){return typeof v==='function'?v(x):v;}
function ruleOn(e,x){return!e.off&&e.when(x);}
function ruleNote(e,on,note,to){const n=Array.isArray(note)?note:[typeof note==='string'?note:e.label||e.id,null];
  return{id:e.id,src:e.src,on,to:to||e.to||null,label:n[0],v:n[1]};}

// ---------- a roll ----------
// c: the roll as the game builds it ({mods, bonus, defMods, def} or {mods, bonus, defMods, dc}); x: the roll's arguments. Gives c.
function ruleRoll(on,c,x){const L=RULES.on[on];if(!L)return c;x.c=c;const dk='dc' in c?'dc':'def';
  for(const e of L){if(!ruleOn(e,x))continue;let rec;
    if(e.edit){const note=e.edit(x);if(!note)continue;rec=ruleNote(e,on,note);}
    else{const m=e.mod?e.mod(x):[e.label,ruleVal(e.v,x)];if(!m||m[1]==null)continue;const t=[m[0],m[1],e.src];
      if(e.to==='def'){x.c.defMods.push(t);x.c[dk]+=m[1];}else{x.c.mods.push(t);x.c.bonus+=m[1];}rec=ruleNote(e,on,t,e.to==='def'?'def':'hit');}
    (x.c.rules||(x.c.rules=[])).push(rec);}
  return x.c;}

// ---------- a number: a cost, the balance a move takes, the most balance a man has ----------
// base(): the game's own number. The last set that applies takes its place; every mul and add that applies then changes it.
function ruleNum(on,x,base){const L=RULES.on[on];if(!L)return base();let s=null;
  for(let i=L.length-1;i>=0;i--){const e=L[i];if(e.set!==undefined&&ruleOn(e,x)){s=e;break;}}
  let v=s?ruleVal(s.set,x):base();
  for(const e of L){if(e.set!==undefined||!ruleOn(e,x))continue;v=e.mul!==undefined?Math.round(v*ruleVal(e.mul,x)):v+ruleVal(e.add,x);}
  return v;}
// which entries apply (the set that wins, then the rest): for the log and the tempo line, which show them
function ruleWhich(on,x){const L=RULES.on[on];if(!L)return[];const out=[];let s=null;
  for(let i=L.length-1;i>=0;i--){const e=L[i];if(e.set!==undefined&&ruleOn(e,x)){s=e;break;}}
  if(s)out.push(s);for(const e of L)if(e.set===undefined&&ruleOn(e,x))out.push(e);return out;}

// the entries that changed a number (none when it came out as the game's own: a rule that applied and changed nothing is not shown)
function ruleChanged(on,x,base){const L=ruleWhich(on,x);if(!L.length)return L;return ruleNum(on,x,base)!==base()?L:[];}

// ---------- a blow's damage ----------
// r: what resolveAttack gives, on each of its paths (a blow into a wall, a blow at the weapon, a blow at the man). Gives r.
function ruleDmg(r,x){if(x.c&&x.c.rules)r.rules=x.c.rules;const L=RULES.on.dmg;if(!L)return r;x.r=r;
  for(const e of L){if(!ruleOn(e,x))continue;let rec;
    if(e.edit){const note=e.edit(x);if(!note)continue;rec=ruleNote(e,'dmg',note);}
    else{const d0=x.r.dmg;x.r.dmg+=ruleVal(e.add,x);if(e.min!=null)x.r.dmg=Math.max(e.min,x.r.dmg);rec=ruleNote(e,'dmg',[e.label,x.r.dmg-d0]);}
    (x.r.rules||(x.r.rules=[])).push(rec);}
  return x.r;}

// ---------- the commands ----------
// the first entry that bars the command (null: none does)
function ruleBar(A,D,cmd){const L=RULES.on.cmd;if(!L)return null;const x={A,D,cmd};for(const e of L)if(ruleOn(e,x))return e;return null;}
function ruleBarWhy(A,D,cmd){const e=ruleBar(A,D,cmd);return e?ruleVal(e.why,{A,D,cmd})||e.label||e.id:null;}
// The commands a feature brings (a gun's shots and cover, the spells, the beast's toss, the room's two moves): match is a command, a
// list of them or a test of one; ok(A, D, cmd) says whether he may (undefined: the game's own rule decides). cmdValid asks the bars
// first, then these (the last added first), then its own rules.
const CMD_DEFS=[];
function cmdDef(src,match,ok){const m=typeof match==='function'?match:Array.isArray(match)?(c=>match.includes(c)):(c=>c===match);
  CMD_DEFS.push({src,match:m,ok});}
function cmdDefOK(A,D,cmd){for(let i=CMD_DEFS.length-1;i>=0;i--){const d=CMD_DEFS[i];if(!d.match(cmd))continue;const v=d.ok(A,D,cmd);if(v!==undefined)return v;}
  return undefined;}
