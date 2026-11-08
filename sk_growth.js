// ==================== LEVELS AND GROWTH (since V93) ====================
// Ilyas grows over the night. Experience (XP) comes from the enemies he defeats and from what he does (a fight's end, a scene
// passed, the list got, a collector put down, a lesson learned, a man broken or disarmed, two or three down in one move);
// it makes his level, 1 to 100 (GROWTH.max), and each level gives what the rules read (sk_rules.js entries, src 'Level'): health,
// to hit and DEF in every roll, a pip of balance at a few levels, damage, and a hundredth off every cost at each tenth level. Each
// fighting style has an expertise of its own (STYLE_GROWTH: levels 1 to 20, Novice to Master), from fighting in it and learning
// it, with perks counted from where he starts it: the prologue is tuned for the Sareth cut at Master and the Wire drill at Expert,
// and Short Hand starts at Novice. All of it is the night's (S.story.growth: kept with the night by the saves, put back on Try
// again, a chapter's from what the stages before it give, growthPar); the lab has none.
const GROWTH={max:100,
  hp:2,                          // health a level, after the first
  hit:[5,12,20,30,42,56,72,90],  // +1 to hit in every roll he makes, at each of these levels
  def:[8,18,32,50,70,95],        // +1 to his DEF in every roll made at him, at each
  foot:[25,60,100],              // a pip more balance at each
  dmg:[10,35,65,90],             // +1 on every blow of his that lands, at each
  tempo:[11,21,31,41,51,61,71,81,91]};  // a hundredth off every cost he pays at each (nine at 91)
// the XP from level L to the next, and the XP at which each level starts (XP_AT[1] is 0; XP_AT[100] is the most there is)
function xpNeed(L){return 80+18*(L-1)+(L-1)*(L-1);}
const XP_AT=(()=>{const a=[0,0];for(let L=1;L<GROWTH.max;L++)a[L+1]=a[L]+xpNeed(L);return a;})();
function levelOf(xp){let lo=1,hi=GROWTH.max;while(lo<hi){const m=(lo+hi+1)>>1;if(xp>=XP_AT[m])lo=m;else hi=m-1;}return lo;}
function growthCount(list,L){let n=0;for(const x of list)if(L>=x)n++;return n;}
// a style's expertise: levels 1 to 20, a rank every four (SKILLS: Novice, Trained, Veteran, Expert, Master); where he starts each
// (the prologue's numbers are his at these); its perks: +1 to hit fighting in it at each of hit's levels, +1 DEF at each of def's
// (where he starts each is the style's own, in the registry: sk_styles.js)
const STYLE_GROWTH={max:20,start:Object.fromEntries(heroStyles().map(k=>[k,STYLES[k].start])),hit:[5,10,15,20],def:[8,16]};
function styleNeed(L){return 40+20*(L-1);}
const STYLE_XP_AT=(()=>{const a=[0,0];for(let L=1;L<STYLE_GROWTH.max;L++)a[L+1]=a[L]+styleNeed(L);return a;})();
function styleLevelOf(xp){let L=1;while(L<STYLE_GROWTH.max&&xp>=STYLE_XP_AT[L+1])L++;return L;}
function styleRank(L){return SKILLS[Math.min(SKILLS.length-1,Math.floor((L-1)/4))];}
// what each thing is worth. foe: an enemy defeated, by his rank (1 to 5), times crew (a crew man), elf (one of the named elves)
// or boss, times his health against sixty (a half to three); fight: a fight's end, and perFoe for each enemy in it; scene: a scene
// with no fight passed; list: the errand's list got; putDown: a collector put down in the toll; move: a Short Hand move learned;
// break, disarm: done to an enemy; multi: by how many are down in one move of his. The styles': a blow of his that lands in it
// (hit, crit), an answer of the style that he uses (answer), a share of an enemy's XP when he fights in it (kill), a move (move).
const XP_GAIN={foe:[12,20,32,50,75],crew:.75,elf:1.25,boss:1.5,fight:10,perFoe:4,scene:8,list:25,putDown:30,move:30,break:4,disarm:6,multi:[0,0,6,10],
  style:{hit:3,crit:5,answer:4,kill:.4,move:40}};

// ---------- the night's record ----------
function growthOn(){return!!(S.story&&S.story.growth);}
function growth(){return S.story&&S.story.growth||null;}
function growthNew(xp,styles){const s={};for(const k of Object.keys(STYLE_GROWTH.start))s[k]=STYLE_XP_AT[STYLE_GROWTH.start[k]];
  return{xp:xp||0,styles:Object.assign(s,styles||{}),got:{}};}
function heroLevel(){const g=growth();return g?levelOf(g.xp):1;}
function styleLevel(k){const g=growth();return styleLevelOf(g&&g.styles&&g.styles[k]!=null?g.styles[k]:STYLE_XP_AT[STYLE_GROWTH.start[k]||1]);}
// the style he fights in now (since V94 the one he picks, sk_styles.js: his own Sareth cut unless he has picked another; in V93 it
// was read off the arc-blade's stance)
function heroStyle(f){return f&&f===S.F[0]?styleOf(f):null;}
function heroIn(f){return!!f&&f===S.F[0]&&growthOn();}

// ---------- gaining it ----------
// what an enemy is worth
function xpFoe(f){if(!f)return 0;const elf=typeof isElf==='function'&&isElf(f);
  const k=(f.hench?XP_GAIN.crew:elf?XP_GAIN.elf:1)*(f.boss?XP_GAIN.boss:1);
  return Math.round(XP_GAIN.foe[clamp(f.skill||1,1,5)-1]*k*clamp((f.maxHp||60)/60,.5,3));}
// XP for him: why says what for (the log's words); a level that comes of it is put on him at once (the health with it)
// (gives what it added: none past the top)
function xpGain(n,why){const g=growth(),K=hero();n=Math.round(n);if(!g||!K||!(n>0))return 0;const L0=levelOf(g.xp);n=Math.min(n,XP_AT[GROWTH.max]-g.xp);if(!(n>0))return 0;
  g.xp+=n;const L1=levelOf(g.xp);logNote(K,'+'+n+' XP',why||null);if(S.hooks.growth)S.hooks.growth('xp',{n,why,L0,L1});
  if(L1>L0)growthLevelUp(K,L0,L1);return n;}
function growthGainText(L0,L1){const out=['+'+GROWTH.hp*(L1-L0)+' health'];
  for(const [list,w] of [[GROWTH.hit,'to hit'],[GROWTH.def,'DEF'],[GROWTH.foot,'balance'],[GROWTH.dmg,'damage'],[GROWTH.tempo,'']]){const d=growthCount(list,L1)-growthCount(list,L0);
    if(d)out.push(w?'+'+d+' '+w:d+'% off every cost');}
  return out.join(', ');}
function growthLevelUp(K,L0,L1){const dh=GROWTH.hp*(L1-L0);K.maxHp+=dh;if(!K.dead)K.hp=Math.min(K.maxHp,K.hp+dh);
  growthSay(K,'Level '+L1,'#ffd36b',growthGainText(L0,L1),24,-46,4.7,true);if(S.hooks.growth)S.hooks.growth('level',{L0,L1});S.hooks.status();}
// a level said over him, its second line in the log: when the move it came of is over (the drawing shows a move's biggest word
// only, and a kill's is bigger), at once when none is under way; in the log alone while the game warms up or once he is gone
const GROWTH_SAY=[];
function growthSay(K,text,color,sub,size,dy,rank,sound){
  const say=()=>{if(S.warming||!K||K.dead||!S.F.includes(K))return logNote(K,text,sub);
    // (the popup puts its own note in the log; the hero's level is said over a style's when both come of one move)
    popup(K,text,color,sub,size,dy);const p=S.popups[S.popups.length-1];if(p&&p.text===text)p.rank=rank;if(sound)S.hooks.sound('lock',.8);};
  if(S.game&&S.game.ex&&!S.warming)GROWTH_SAY.push(say);else say();}
V11.exchangeEnd.push(()=>{for(const fn of GROWTH_SAY.splice(0))fn();});
// style XP: k a style of STYLES
function styleGain(k,n,why){const g=growth();n=Math.round(n);if(!g||!k||!STYLES[k]||!(n>0))return 0;const s=g.styles;n=Math.min(n,STYLE_XP_AT[STYLE_GROWTH.max]-(s[k]||0));if(!(n>0))return 0;
  const L0=styleLevelOf(s[k]||0);s[k]=(s[k]||0)+n;const L1=styleLevelOf(s[k]);
  if(L1>L0){growthSay(hero(),STYLES[k].name+' '+L1,'#9fd8d0',styleRank(L1)+(why?', '+why:''),20,-70,4.6,false);if(S.hooks.growth)S.hooks.growth('style',{k,L0,L1});}
  return n;}
// once a night
function growthOnce(id){const g=growth();if(!g)return false;const got=g.got||(g.got={});if(got[id])return false;got[id]=true;return true;}

// ---------- where it comes from ----------
// an enemy defeated (the night's: any that dies, whoever puts him down); by his own move also two or three down in it, and a share
// for the style he fights in
V11.kill.push(D=>{if(!growthOn()||!D||D.team!==1||D.npc||S.warming)return;const K=hero();if(!K)return;
  let n=xpFoe(D);const why=[D.name+' defeated'],ex=S.game&&S.game.ex;
  if(ex&&ex.A===K){ex.xpDown=(ex.xpDown||0)+1;const m=XP_GAIN.multi[Math.min(3,ex.xpDown)];if(m){n+=m;why.push(ex.xpDown>=3?'three down':'two down');}
    const st=heroStyle(K);if(st)styleGain(st,xpFoe(D)*XP_GAIN.style.kill);}
  xpGain(n,why.join(', '));});
// a man broken or disarmed by him
{const bf=breakFighter;breakFighter=function(D,by){const was=!!(D&&D.broken);const r=bf.apply(this,arguments);
  if(growthOn()&&D&&!was&&D.broken&&D.team===1&&!D.npc&&by&&by===hero())xpGain(XP_GAIN.break,D.name+' broken');return r;};}
{const td=tryDisarm;tryDisarm=function(A,D){const r=td.apply(this,arguments);if(growthOn()&&r&&r.ok&&A===hero()&&D&&D.team===1)xpGain(XP_GAIN.disarm,D.name+' disarmed');return r;};}
// a blow of his that lands, for the style he fights in (at its impact, since V94: a follow-up from an opening is a blow of its own,
// and an exchange's end comes only after the last of them); a Short Hand answer he uses
{const ap=applyImpact;applyImpact=function(ex,A,D,res){const r=ap.apply(this,arguments);
  if(growthOn()&&A&&A===hero()&&res&&!res.weaponHit&&(res.out==='hit'||res.out==='crit')){const st=heroStyle(A);if(st)styleGain(st,res.out==='crit'?XP_GAIN.style.crit:XP_GAIN.style.hit);}
  return r;};}
{const sh=S.hooks.short;S.hooks.short=(ev,d)=>{if(sh)sh(ev,d);if(!growthOn()||!d)return;const K=hero();
  if((ev==='hinge'||ev==='toll')&&d.D===K)styleGain('shorthand',XP_GAIN.style.answer);};}
// a lesson learned: each move new to him
{const sl=shLearn;shLearn=function(K,moves){const had=S.story&&S.story.flags.short||{},fresh=(moves||[]).filter(m=>!had[m]);const r=sl.apply(this,arguments);
  if(growthOn()&&fresh.length){xpGain(XP_GAIN.move*fresh.length,(fresh.length>1?fresh.length+' moves':'a move')+' learned');styleGain('shorthand',XP_GAIN.style.move*fresh.length,'learned');}
  return r;};}
// the list got (the last of it bought), and a collector put down in the toll
{const eb=errandBuy;errandBuy=function(){const r=eb.apply(this,arguments);
  if(r===null&&growthOn()&&errandCount()>=ERRAND_LIST.length&&growthOnce('list'))xpGain(XP_GAIN.list,'Tamm’s list got');return r;};}
V11.exchangeEnd.push(()=>{if(growthOn()&&S.story.flags.downedOne&&growthOnce('putDown'))xpGain(XP_GAIN.putDown,'a collector put down');});
// a stage's end: a fight's (with each enemy in it), or a scene passed
// (a scene that is a moment of another chapter's, with no card of its own, is that chapter's: the kitchen's way out, since V104)
function growthStageXP(st){if(!st)return 0;if(st.part&&st.noFight)return 0;const n=(st.foes||[]).length;return n&&!st.noFight?XP_GAIN.fight+XP_GAIN.perFoe*n:XP_GAIN.scene;}
{const sc=storyCleared;storyCleared=function(){const SV=S.story,st=SV&&STAGES[SV.i];
  if(growthOn()&&st&&growthOnce('stage:'+st.key))xpGain(growthStageXP(st),st.title||'the scene');return sc.apply(this,arguments);};}

// ---------- a chapter's, Try again, and the saves ----------
// what the stages before a stage give a night that played them (each enemy that dies, each stage's end, the list, the collector,
// the lessons' moves): a chapter starts with it, as it starts with their flags
function growthPar(key){let xp=0,moves=0;const i=Math.max(0,stageIx(key));
  for(const st of STAGES.slice(0,i)){if(!st.spare)for(const e of st.foes||[])xp+=xpFoe({skill:e.skill,maxHp:e.hp,hench:!!e.human,beast:e.beast,name:e.name,team:1});
    xp+=growthStageXP(st);if(st.key==='list')xp+=XP_GAIN.list;if(st.key==='toll')xp+=XP_GAIN.putDown;
    const sh=st.flagsOut&&st.flagsOut.short;if(sh){const n=Object.keys(sh).length;xp+=XP_GAIN.move*(n-moves);moves=n;}}
  return growthNew(xp,{shorthand:STYLE_XP_AT[STYLE_GROWTH.start.shorthand]+XP_GAIN.style.move*moves});}
{const ss=storyStage;storyStage=function(key){const SV=S.story;if(SV&&!SV.growth)SV.growth=growthPar(key);GROWTH_SAY.length=0;return ss.apply(this,arguments);};}
// a record's growth as the night holds it (a kept night's, a stage's start): the numbers in their bounds, anything else left out
// (null when there is nothing usable in it)
function growthFrom(v){if(!v||typeof v!=='object'||typeof v.xp!=='number'||!isFinite(v.xp))return null;
  const g=growthNew(clamp(Math.round(v.xp),0,XP_AT[GROWTH.max]));
  if(v.styles&&typeof v.styles==='object')for(const k of Object.keys(g.styles)){const x=v.styles[k];if(typeof x==='number'&&isFinite(x))g.styles[k]=clamp(Math.round(x),0,STYLE_XP_AT[STYLE_GROWTH.max]);}
  if(v.got&&typeof v.got==='object')for(const k of Object.keys(v.got))if(v.got[k]===true)g.got[k]=true;
  return g;}
// Try again: the stage as it began, his growth with it (what the try gave goes with the try)
{const sr=storyRetry;storyRetry=function(){const SV=S.story,at=SV&&SV.at,g=at&&at.parts&&growthFrom(at.parts.growth);if(g)SV.growth=g;return sr.apply(this,arguments);};}
savePart('growth',()=>growth()?saveData(growth()):null,v=>{const g=growthFrom(v);if(S.story&&g)S.story.growth=g;});

// ---------- what a level gives (the rules) ----------
// every roll: to hit when he rolls, DEF when it is rolled at him
for(const on of RULE_ROLLS){
  RULES.add({id:'level.hit.'+on,src:'Level',on,to:'hit',label:'level',v:()=>growthCount(GROWTH.hit,heroLevel())||null,when:x=>heroIn(x.A)});
  RULES.add({id:'level.def.'+on,src:'Level',on,to:'def',label:'level',v:()=>growthCount(GROWTH.def,heroLevel())||null,when:x=>heroIn(x.D)});}
RULES.add({id:'level.hp',src:'Level',on:'hpmax',label:'level',add:()=>GROWTH.hp*(heroLevel()-1),when:x=>heroIn(x.f)&&heroLevel()>1});
RULES.add({id:'level.tempo',src:'Level',on:'tempo',label:'level',mul:()=>1-.01*growthCount(GROWTH.tempo,heroLevel()),when:x=>heroIn(x.f)&&growthCount(GROWTH.tempo,heroLevel())>0});
RULES.add({id:'level.foot',src:'Level',on:'footmax',label:'level',add:()=>growthCount(GROWTH.foot,heroLevel()),when:x=>heroIn(x.f)&&growthCount(GROWTH.foot,heroLevel())>0});
RULES.add({id:'level.dmg',src:'Level',on:'dmg',label:'level',add:()=>growthCount(GROWTH.dmg,heroLevel()),
  when:x=>heroIn(x.A)&&x.r&&(x.r.out==='hit'||x.r.out==='crit')&&x.r.dmg>0&&growthCount(GROWTH.dmg,heroLevel())>0});
// a style's perks, past where he started it: to hit fighting in it, DEF while he stands in it
function stylePerk(k,list){return growthCount(list,styleLevel(k))-growthCount(list,STYLE_GROWTH.start[k]||1);}
for(const k of heroStyles()){const name=STYLES[k].name;
  RULES.add({id:'style.'+k+'.hit',src:name,on:'attack',to:'hit',label:name,v:()=>stylePerk(k,STYLE_GROWTH.hit)||null,when:x=>heroIn(x.A)&&heroStyle(x.A)===k});
  RULES.add({id:'style.'+k+'.def',src:name,on:'attack',to:'def',label:name,v:()=>stylePerk(k,STYLE_GROWTH.def)||null,when:x=>heroIn(x.D)&&heroStyle(x.D)===k});}
