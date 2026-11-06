// ===== STYLES START =====
// (since V94) A fighting style is data: what it is fought with, where it comes from, how it moves, what it changes in the rules, its
// meter, its moves by rank and its signature. styleDef(def) puts one in the registry (STYLES), and the game reads it from there:
//   key, name, short       its key, its name, and the short name the stance bar's chip shows
//   weapon, weapons, weaponNeed   the cards' words for what it is fought with, the weapon keys it takes, and what the lock says
//   hands                  1 or 2; a two-handed style is locked to a man with one arm (scrap: 'badly', with the scrap arm it
//                          works, at the cost its rules give; 'locked', it waits for the joining)
//   gilt                   it needs the gilt (the hero's lattice lit: mage, not drained)
//   origin, doctrine, what where and when it was born, the one idea it follows, and what it looks like in a line
//   motion                 the animation style it moves in (ANIM_STYLE, sk_anim.js), or null for the fighter's own
//   start, order           the expertise he starts it at (sk_growth.js), and its place on the styles screen
//   meter                  {key, name, cap: [[level, most], ...], what}: a meter of its own, 0 to 3, beside the balance pips; the
//                          style's own module fills and empties it (meterAdd, meterClear), and it empties on a change of style
//   ranks                  [{level, key, name, what}]: its moves, each from the expertise level that brings it (styleKnows)
//   lessons                for a style taught a move at a time (Short Hand: f.styleMoves), the moves in their order
//   signature              the key of its signature move
//   answers                {answer: n}: what the style does to each answer's DEF while he fights in it
//   rules                  RULES entries without src (who: 'A', 'D' or 'f', the one in the style; id within the style)
//   mastery                {what, rules}: what mastering it (level 17) gives in any style he fights in
//   known(f)               whether he has the style at all (default: yes)
//   enemy                  a style only the others fight in (since V95: the Order drill): never on the hero's cards, chip or
//                          levels; a stage's foe is given one by its entry (style: 'order'), and takes it whenever he holds what it needs
// A fighter's style is f.style, the one he picked; with none picked, or one he cannot use with what he holds now (a sword in his hand
// for the Wire drill), the hero fights in his own, the Sareth cut, whenever he can (styleOf); else in none. Switching is the hero's,
// on his own turn before he acts (the stance
// bar's chip, sk_stylesui.js): it costs a beat of tempo and empties the meter, and the pick holds for the night (the run's flags, so a
// save and Try again keep it) or, in the lab, for the next fight. The AI never switches.
const STYLES={},STYLE_ORDER=[];
const STYLE_SW={tempo:10};
const STYLE_FIELDS=['key','name','short','weapon','weapons','weaponNeed','hands','scrap','gilt','origin','doctrine','what','motion','start','order',
  'meter','ranks','lessons','signature','answers','rules','mastery','known','enemy'];
function styleDef(d){const no=w=>{throw new Error('styleDef'+(d&&d.key?' '+d.key:'')+': '+w);};
  if(!d||!d.key||!d.name)no('a style needs a key and a name');if(STYLES[d.key])no('defined twice');
  for(const k of Object.keys(d))if(!STYLE_FIELDS.includes(k))no('no such field '+k);
  if(!Array.isArray(d.weapons)||!d.weapons.length)no('needs the weapons it takes');if(d.hands!==1&&d.hands!==2)no('hands is 1 or 2');
  if(d.meter&&(!d.meter.name||!Array.isArray(d.meter.cap)))no('a meter needs a name and its cap by level');
  d.short=d.short||d.name;d.start=d.start||1;d.order=d.order||STYLE_ORDER.length+1;d.ranks=d.ranks||[];d.rules=d.rules||[];
  STYLES[d.key]=d;STYLE_ORDER.push(d.key);STYLE_ORDER.sort((a,b)=>STYLES[a].order-STYLES[b].order);
  const scoped=(e,test)=>{const who=e.who||'A',{id,who:_w,when,...r}=e;return{...r,id:'style.'+d.key+'.'+id,src:d.name,when:x=>test(x[who])&&(!when||when(x))};};
  for(const e of d.rules)RULES.add(scoped(e,f=>styleIn(f,d.key)));
  // the answers: each one's DEF in the style
  if(d.answers)RULES.add({id:'style.'+d.key+'.answer',src:d.name,on:'attack',to:'def',
    when:x=>x.D&&x.D.react&&d.answers[x.D.react]!=null&&ATTACKS.includes(x.kind)&&!x.D.downed&&styleIn(x.D,d.key),
    mod:x=>[REACT_NAME[x.D.react]||x.D.react,d.answers[x.D.react]]});
  // mastered: in any style he fights in
  if(d.mastery)for(const e of d.mastery.rules||[])RULES.add(scoped({...e,id:'mastery.'+e.id},f=>!!f&&styleLevelFor(f,d.key)>=STYLE_MASTER));
  return d;}
const STYLE_MASTER=17;
// the gilt is lit in him: the hero's lattice, not drained
function styleGilt(f){return typeof mage==='function'&&mage(f);}
// what keeps him from a style now, in the cards' words ('' when nothing does)
function styleNeeds(f,k){const d=STYLES[k];if(!d)return'no such style';if(!f)return'nobody';
  if(d.gilt&&!styleGilt(f))return'needs the gilt';
  if(d.hands===2&&f.oneArm&&!(f.scrapArm&&d.scrap==='badly'))return'needs two hands';
  if(!d.weapons.includes(f.weaponKey)||(f.wp&&(f.wp.improv||f.wp.gun)))return'needs '+(d.weaponNeed||d.weapon.toLowerCase());
  // (the arc-blade's plates lock on the gilt's thread of current: drained, they will not)
  if(f.weaponKey==='elven'&&typeof drained==='function'&&drained(f))return'the blade will not lock';
  return'';}
function styleCan(f,k){return!styleNeeds(f,k);}
// a two-handed style worked with the scrap arm: it works, badly
function styleBadly(f,k){const d=STYLES[k];return!!d&&!!f&&d.hands===2&&!!f.oneArm&&!!f.scrapArm&&d.scrap==='badly';}
// the style he fights in now
function styleOf(f){if(!f)return null;const k=f.style;
  if(k&&STYLES[k]&&styleCan(f,k))return k;
  return f===S.F[0]&&STYLES.sareth&&styleCan(f,'sareth')?'sareth':null;}
function styleIn(f,k){return styleOf(f)===k;}
function styleKnown(f,k){const d=STYLES[k];return!!d&&!!f&&!(d.enemy&&f===S.F[0])&&(!d.known||!!d.known(f));}
// the styles that are the hero's to have (the cards, the levels): all but the ones only the others fight in
function heroStyles(){return STYLE_ORDER.filter(k=>!STYLES[k].enemy);}
// the styles he could fight in with what he holds now
function stylesFor(f){return STYLE_ORDER.filter(k=>styleKnown(f,k)&&styleCan(f,k));}
// his expertise in a style: the night's (sk_growth.js) for the hero in the story, else where he starts it; another man's by his rank
function styleLevelFor(f,k){const d=STYLES[k];if(!d||!f)return 1;
  if(f===S.F[0])return typeof growthOn==='function'&&growthOn()?styleLevel(k):d.start;
  return clamp(((f.skill||1)-1)*4+1,1,20);}
// a move of the style, by rank (a style taught by lessons asks its lessons)
function styleKnows(f,k,move){const d=STYLES[k];if(!d||!styleIn(f,k))return false;
  if(d.lessons)return!!(f.styleMoves&&f.styleMoves[move]);
  const r=d.ranks.find(x=>x.key===move);return!!r&&styleLevelFor(f,k)>=r.level;}

// ---------- the meter ----------
// f.meter={k, n, t}: the style's own count, which goes with the style (another style, or none, reads nothing)
function meterMax(f,k){const d=STYLES[k];if(!d||!d.meter)return 0;const L=styleLevelFor(f,k);let m=0;for(const [lv,n] of d.meter.cap)if(L>=lv)m=n;return m;}
function meterOf(f){const k=styleOf(f),d=k&&STYLES[k];if(!d||!d.meter)return null;const M=f.meter&&f.meter.k===k?f.meter:null;return{k,n:M?M.n:0,max:meterMax(f,k),name:d.meter.name};}
function meterN(f,k){const m=meterOf(f);return m&&m.k===k?m.n:0;}
function meterSet(f,n,why){const m=meterOf(f);if(!m)return 0;const v=clamp(Math.round(n),0,m.max);if(v===m.n)return 0;f.meter={k:m.k,n:v,t:S.t};
  if(S.hooks.meter)S.hooks.meter(f,m.k,v,m.n,why||null);S.hooks.status();return v-m.n;}
function meterAdd(f,n,why){const m=meterOf(f);return m&&n>0?meterSet(f,m.n+n,why):0;}
function meterClear(f,why){const M=f&&f.meter;if(!M)return 0;f.meter=null;if(M.n>0){if(S.hooks.meter)S.hooks.meter(f,M.k,0,M.n,why||null);S.hooks.status();}return M.n;}

// ---------- switching ----------
// his own turn, before he acts (as a stance is changed)
function styleCanSwitch(K){const g=S.game;return!!K&&K===S.F[0]&&!!g&&g.phase==='input'&&g.active===K.idx&&!S.opening&&!K.downed&&!K.clinch&&!K.dead&&!S.cut;}
const STYLE_PICK={lab:null};
function setStyle(K,k){if(!STYLES[k]||!styleCanSwitch(K)||!styleKnown(K,k)||!styleCan(K,k)||styleOf(K)===k)return false;const was=styleOf(K);
  meterClear(K,'a change of style');K.style=k;K.styleT=S.t;K.ready+=STYLE_SW.tempo;
  if(S.story&&S.story.flags)S.story.flags.style=k;else STYLE_PICK.lab=k;
  if(S.hooks.style)S.hooks.style(K,k,was);S.hooks.status();return true;}
// a new fight: every meter empty; the hero in the style picked for the night (or, in the lab, the last fight's), where he can be
V11.duelStart.push(()=>{for(const f of S.F)if(f)f.meter=null;const K=S.F[0];if(!K||K.style)return;
  const want=S.story?(S.story.flags&&S.story.flags.style)||null:STYLE_PICK.lab;
  if(want&&STYLES[want]&&styleKnown(K,want)&&styleCan(K,want))K.style=want;});
// a meter goes with its style: out of it (another weapon in his hand, the gilt gone out), it is gone
V11.step.push(()=>{for(const f of S.F)if(f&&f.meter&&f.meter.k!==styleOf(f))meterClear(f,'out of the style');});
if(!S.hooks.meter)S.hooks.meter=()=>{};
// a stage's foe can be given a style by its entry (style: 'order'); one of the styles only the others fight in is told once a fight,
// the moment he first fights in it (the guards' batons out)
{const sr=storyRoster;storyRoster=function(st){const r=sr.apply(this,arguments);(st.foes||[]).forEach((e,i)=>{const f=S.F[i+1];if(f&&e.style)f.style=e.style;});return r;};}
V11.duelStart.push(()=>{for(const f of S.F)if(f)f._styOn=null;});
V11.step.push(()=>{for(const f of S.F){if(!f||f.dead||f===S.F[0]||!f.style||f._styOn===f.style)continue;const k=styleOf(f);
  if(k&&STYLES[k].enemy){f._styOn=k;S.hooks.styleOn(f,k);}}});
if(!S.hooks.styleOn)S.hooks.styleOn=()=>{};

// ---------- how a style moves ----------
// the animation style is the style's (a style without one keeps the fighter's own: Kael's tactical motion, everyone else's regular)
{const d=Object.getOwnPropertyDescriptor(Fighter.prototype,'animStyle');
  Object.defineProperty(Fighter.prototype,'animStyle',{configurable:true,
    get(){if(this._anim!==undefined)return this._anim;const k=styleOf(this),m=k&&STYLES[k].motion;return m&&ANIM_STYLE[m]?m:d.get.call(this);},set(v){d.set.call(this,v);}});}

// ---------- his own: the Sareth cut ----------
// Thirty years of Eclipsera enforcement for the Sareth family: the clipped motion the game has always given him (the tactical style,
// sk_style.js), and the prologue as it was tuned. With the scrap arm it works, badly (the open question of Act I's doc, settled as
// data: scrap 'locked' keeps it shut until the joining).
const SARETH={scrap:{hit:-2,def:-1}};
styleDef({key:'sareth',name:'The Sareth cut',short:'Sareth cut',weapon:'Arc-blade, sword',weapons:['elven','sword'],weaponNeed:'a blade',hands:2,scrap:'badly',order:3,
  origin:'Thirty years of Eclipsera enforcement',doctrine:'Do the job, and nothing past it.',
  what:'Short windups, a small follow-through, a quick return to a tight guard, and a glance round the room after every kill.',
  motion:'tactical',start:17,
  rules:[{id:'scrap.hit',on:'attack',to:'hit',who:'A',label:'the scrap arm',v:SARETH.scrap.hit,when:x=>ATTACKS.includes(x.kind)&&styleBadly(x.A,'sareth')},
    {id:'scrap.def',on:'attack',to:'def',who:'D',label:'the scrap arm',v:SARETH.scrap.def,when:x=>styleBadly(x.D,'sareth')}]});
// ===== STYLES END =====
