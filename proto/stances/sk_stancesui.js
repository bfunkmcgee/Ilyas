// ===== STANCES UI (test) START =====
// The test page's side of its two rules (sk_downfork.js, sk_stances.js). The dock gets a stance bar over the moves: Bound, Unbound and
// Close, the one he holds lit, the one that answers his target marked with the reason; tapping one on his turn (or Z, X and C) changes
// it at once, his guard and his blade with it, and the four strikes show that stance's moves and odds. In Unbound the blade is drawn
// loose on its thread. A man on the floor is labelled for what comes next (he rises free at his turn, or he was struck and must get
// up), and the tip line says what the stance or the fall means now. The page opens straight on a fight; the Setup button changes the
// fight and turns either rule off for comparison.
const STNUI={bsig:'',t:0,set:false,el:{},mix:'mixed'};
const STN_X='<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2 L10 10 M10 2 L2 10"></path></svg>';
const STN_KEYS={z:'bound',x:'unbound',c:'close'};
function stnEsc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

// ---------- the blade, unbound ----------
// (only the drawing is loose: the blade's stick keeps its length, so nothing the game reads changes)
{const as=arcState;arcState=function(f){const st=as.apply(this,arguments);if(st)return st;
  if(stanceOf(f)==='unbound'&&!f.downed&&!f.dead)return{mode:'lash',L:f.wp.len+14};return st;};}

// ---------- the stance bar ----------
function stnBarHtml(){const K=hero();if(!stanceOn(K)||K.dead)return'';const cur=stanceOf(K),can=stanceCanSwitch(K)&&!isAI(K.idx),D=targetOf(K),m=D?stanceMatch(K,D):null;
  let h=`<span class="stn-lbl">Stance</span><div class="stn-seg" role="group" aria-label="Stance">`;
  for(const s of STANCE_ORDER){const why=m===s?stanceReason(K,D,s):'';
    h+=`<button type="button" class="stn-b${s===cur?' on':''}${m===s&&why?' fit':''}" data-s="${s}" aria-pressed="${s===cur}"${can?'':' disabled'} title="${stnEsc(STANCES[s].line)}">`+
      `<span class="stn-n">${STANCES[s].name}</span><small>${stnEsc(why||STANCES[s].good)}</small></button>`;}
  return h+'</div>';}
function stnUiNow(){STNUI.t=0;}
function stnPick(s){const K=hero();if(!K||isAI(K.idx))return;ensureAudio();if(setStance(K,s)){updateStatus();stnUiNow();}}

// ---------- what the moment means: the tip line ----------
function stnTip(K,D){if(!K||K.dead)return'';const ob=DOWNF.rise==='off'?', off balance':'';
  if(DOWNF.on&&K.downed)return K.noRise?'Struck on the floor: no free rise. Get up or roll clear.':`You are down: you rise free at your turn${ob}. A blow on the floor takes that away.`;
  if(!D||D.dead)return'';
  if(DOWNF.on&&D.downed)return D.noRise?`${D.name} was struck on the floor: his next turn goes on getting up.`
    :D.hench?`${D.name} is down: a blow that lands now finishes him. Leave him and he rises at his turn${ob}.`
    :`${D.name} is down: strike him now and he loses his free rise. Leave him and he rises at his turn${ob}.`;
  const s=stanceOf(K);if(!s||K.clinch)return'';const w=stanceWord(D);
  if(s==='unbound')return lashReady(K,D)?`Unbound: you lash from where you stand${D.weaponKey==='spear'?', and his spear cannot parry it':''}. A man who closes runs onto the chain. Your Parry ${STN_SIGNED(STN.parry)}, Counter ${STN_SIGNED(STN.counter)}.`
    :`Too close for the lash: your blows relock at ${STN_SIGNED(STN.relock)}. Step back, or change stance.`;
  if(s==='close'){const others=foes().some(o=>o!==D&&upright(o)&&Math.abs(o.station-K.station)-engageGap(K,o)<90);
    if(stanceHeavy(D))return`Close: inside the ${w}, his blows come jammed (${STN_SIGNED(-2)}). Hilt and spine +1, grab +2.${others?` ${STN_SIGNED(STN.tied)} DEF to the others.`:''}`;
    return`Close: hilt and spine +1, grab +2. A ${w} is no worse inside.${others?` ${STN_SIGNED(STN.tied)} DEF to the others.`:''}`;}
  if(outreaches(K,D))return`Bound: the ${w} runs onto your point as he closes, and strikes at ${STN_SIGNED(STN.point)}. Grabs on you ${STN_SIGNED(-STN.grabDef)}.`;
  if(D.weaponKey==='spear')return`Bound: the spear outreaches you, so closing in hands him a stop-hit. Unbound outranges it.`;
  if(stanceHeavy(D))return`Bound: the blade at full length. Close gets inside the ${w}.`;
  return'';}
// a tip of the stance's or the fall's takes the place of the plain ones, never of the urgent ones (held, disarmed, out of balance)
{const fl=footingLine;footingLine=function(){const h=fl.apply(this,arguments);const K=cmdHero(),g=S.game;if(!h||!K||K!==hero()||K.dead)return h;
  const human=g.phase==='input'&&!isAI(g.active)&&!S.opening&&S.F[g.active]===K;if(!human)return h;const D=targetOf(K);
  const urgent=K.clinch||heldBy(K)||K.wp.unarmed||K.wp.improv||K.sidearm==='drawn'||K.foot<1||(D&&D.broken&&!D.downed);
  const t=stnTip(K,D);if(!t||(urgent&&!K.downed))return h;
  return h.indexOf('class="fl-tip')>=0?h.replace(/<span class="fl-tip[^"]*">[\s\S]*<\/span>$/,`<span class="fl-tip">${t}</span>`):h.replace(/(<\/span>)$/,'.$1')+` <span class="fl-tip">${t}</span>`;};}
// the preview strip names what a stance's move does
{const rt=roleTextBase;roleTextBase=function(A,D,k){if(ATTACKS.includes(k)&&D&&!D.downed&&A===hero()&&stanceOf(A)){const T=pickTechnique(A,D,k);if(T.stanceWhy)return`${T.name}: ${T.stanceWhy}`;}return rt.apply(this,arguments);};}
// his plate names the stance
{const us=updateStatus;updateStatus=function(){us.apply(this,arguments);const K=hero(),el=K?$('meta'+K.idx):null;if(el&&stanceOn(K)&&!K.dead)el.textContent=STANCES[stanceOf(K)].name+' · '+el.textContent;stnUiNow();};}

// ---------- a man on the floor ----------
{const il=intentLabel;intentLabel=function(f){if(DOWNF.on&&f&&f.downed&&!f.dead)return freeRiseOK(f)?'Rises free':'Must get up';return il.apply(this,arguments);};}
{const ui=updateIntents;updateIntents=function(){ui.apply(this,arguments);if(!DOWNF.on)return;
  for(const f of foes())if(f.downed)f._when=freeRiseOK(f)?(DOWNF.rise==='off'?'at his turn, off balance':'at his turn'):'struck on the floor';};}

// ---------- the setup ----------
const STN_ARENAS=[['street','Lamplight Street'],['field','Meadow'],['hill','Hillside'],['ledge','Broken ledge'],['wall','Ruin wall'],['restaurant','The bistro']];
const STN_MIX={mixed:null,brute:{weapon:'axe',temper:'brute'},keeper:{weapon:'spear',temper:'keeper'},rusher:{weapon:'dagger',temper:'rusher'}};
const STN_BASE=[{seed:5113,weapon:'axe',skill:3,temper:'brute'},{seed:7741,weapon:'spear',skill:2,temper:'keeper'},{seed:3190,weapon:'dagger',skill:2,temper:'rusher'}];
function stnApplyMix(){const m=STN_MIX[STNUI.mix];S.cfg.foes=STN_BASE.map(f=>m?{...f,...m}:{...f});}
function stnSetupHtml(){const opt=(grp,val,cur,label)=>`<button type="button" class="st-o" data-g="${grp}" data-v="${val}" aria-pressed="${String(cur)===String(val)}">${label}</button>`;
  const nOpt=S.cfg.crew?'crew':S.cfg.n;
  return`<div class="ss-in" role="dialog" aria-label="Test setup"><div class="ss-head"><span>Stance and rise test</span><button type="button" class="ss-x" aria-label="Close">${STN_X}</button></div>`+
    `<p class="ss-how"><b>Stances.</b> On your turn, before you act, pick Bound, Unbound or Close (or Z, X, C). It is free and holds till your next turn. <b>Bound</b> locks the blade: crescents and two-man strokes, and a dagger strikes at −2 to get past your point. <b>Unbound</b> looses it: lashes from past your reach that a spear cannot parry, and a man who closes runs onto the chain, but your Parry is at −1 and Counter at −2. <b>Close</b> chokes it up: hilt and spine, grab +2, and an axe that hits you is jammed. The marked stance answers your target.</p>`+
    `<p class="ss-how"><b>Falls.</b> A man knocked down rises free at his turn, off balance. Strike him on the floor and he loses that rise; a crew man is finished.</p>`+
    `<div class="ss-g"><span>Stances</span>${opt('stance',1,STANCE.on?1:0,'On')}${opt('stance',0,STANCE.on?1:0,'Off (today’s)')}</div>`+
    `<div class="ss-g"><span>Falls</span>${opt('down',1,DOWNF.on?1:0,'Rise free')}${opt('down',0,DOWNF.on?1:0,'Today’s')}</div>`+
    `<div class="ss-g"><span>Rise</span>${opt('rise','off',DOWNF.rise,'Off balance')}${opt('rise','committed',DOWNF.rise,'Committed')}</div>`+
    `<div class="ss-g"><span>Enemies</span>${[1,2,3].map(n=>opt('n',n,nOpt,n)).join('')}${opt('n','crew',nOpt,'Crew')}</div>`+
    `<div class="ss-g ss-wrap"><span>Who</span>${opt('mix','mixed',STNUI.mix,'Mixed')}${opt('mix','brute',STNUI.mix,'Axes (brutes)')}${opt('mix','keeper',STNUI.mix,'Spears (keepers)')}${opt('mix','rusher',STNUI.mix,'Daggers (rushers)')}</div>`+
    `<div class="ss-g ss-wrap"><span>Arena</span>${STN_ARENAS.map(([k,l])=>opt('arena',k,S.arenaKey,l)).join('')}</div>`+
    `<p class="ss-note">Enemies, who and arena start a new fight. The rules change at once.</p>`+
    `<div class="ss-foot"><button type="button" class="ss-go">New fight</button></div></div>`;}
function stnSetup(on){const E=STNUI.el;STNUI.set=on;E.setup.hidden=!on;S.paused=on;if(on)E.setup.innerHTML=stnSetupHtml();
  if(!on){try{localStorage.setItem('stn_seen','1');}catch(e){}}}
function stnNewFight(){stnSetup(false);stnApplyMix();S.F=[];restart();updateStatus();stnUiNow();}
function stnSetupPick(g,v){
  if(g==='n'){if(v==='crew'){S.cfg.n=1;S.cfg.crew=true;}else{S.cfg.n=+v;S.cfg.crew=false;}stnNewFight();return;}
  if(g==='mix'){STNUI.mix=v;stnNewFight();return;}
  if(g==='arena'){S.arenaKey=v;stnNewFight();return;}
  if(g==='stance'){STANCE.on=v==='1';const K=hero();if(K&&!STANCE.on)K.stance='bound';}
  if(g==='down')DOWNF.on=v==='1';
  if(g==='rise')DOWNF.rise=v;
  STNUI.el.setup.innerHTML=stnSetupHtml();updateStatus();stnUiNow();}
function stnSetBtnAt(){const E=STNUI.el,st=hudEl('stageWrap');if(!E.sb||!st)return;const R=st.getBoundingClientRect();let b=0;
  for(const el of [hudEl('hudTop'),...document.querySelectorAll('.wrap.hud .frow')]){if(!el||!el.offsetParent)continue;const r=el.getBoundingClientRect();if(r.height>0&&r.top<R.top+R.height*.4)b=Math.max(b,r.bottom-R.top);}
  const top=Math.round(b+8)+'px';if(E.sb.style.top!==top)E.sb.style.top=top;}
function stnUiFrame(){const E=STNUI.el;if(!E.bar)return;const on=STANCE.on&&HUD.state==='play'&&!S.story&&stanceOn(hero());
  E.bar.hidden=!on;E.wrap.classList.toggle('stn-on',on);
  const now=performance.now();if(now-STNUI.t<90)return;STNUI.t=now;stnSetBtnAt();if(!on)return;
  const b=stnBarHtml();if(b!==STNUI.bsig){STNUI.bsig=b;E.bar.innerHTML=b;}}

// ---------- put it on the page ----------
V11UI.init.push(()=>{
  // (the test opens on a fight, not the story's title)
  if(typeof storyMenu==='function')storyMenu(false);
  S.cfg.n=2;S.cfg.crew=false;S.cfg.ally.on=false;S.arenaKey='street';S.tableOn=true;stnApplyMix();
  const wrap=$('wrap'),cmds=$('commands');if(!wrap||!cmds)return;
  const bar=document.createElement('div');bar.id='stnBar';bar.className='stn-bar';cmds.insertBefore(bar,cmds.firstChild);
  const sb=document.createElement('button');sb.type='button';sb.id='stnSetBtn';sb.className='stn-setbtn';sb.textContent='Setup';wrap.appendChild(sb);
  const setup=document.createElement('div');setup.id='stnSetup';setup.className='stn-setup';setup.hidden=true;wrap.appendChild(setup);
  STNUI.el={wrap,bar,setup,sb};
  bar.addEventListener('click',e=>{const b=e.target.closest('.stn-b');if(b&&!b.disabled)stnPick(b.dataset.s);});
  sb.addEventListener('click',()=>stnSetup(!STNUI.set));
  setup.addEventListener('click',e=>{if(e.target===setup||e.target.closest('.ss-x')){stnSetup(false);return;}if(e.target.closest('.ss-go')){stnNewFight();return;}
    const o=e.target.closest('.st-o');if(o)stnSetupPick(o.dataset.g,o.dataset.v);});
  document.addEventListener('keydown',e=>{if(typingIn(e.target)||e.ctrlKey||e.metaKey||e.altKey||S.opening||STNUI.set)return;const s=STN_KEYS[e.key&&e.key.toLowerCase()];if(s){stnPick(s);e.preventDefault();}});
  // a stance taken: his name for it over him, and the blade's own sound
  S.hooks.stance=(K,s)=>{S.callouts.push({i:K.idx,text:STANCES[s].name,age:0,life:1.1,dx:0,dy:-26});S.hooks.sound(s==='unbound'?'unroll':s==='bound'?'lock':'shing',s==='close'?.5:.7);
    const h=K.p[HAF],t=K.p[TIP];flash({x:lerp(h.x,t.x,.5),y:lerp(h.y,t.y,.5)},s==='close'?14:24,'#8ff5e8',K.dep);stnUiNow();};
  S.hooks.freeRise=()=>stnUiNow();S.hooks.downStruck=()=>stnUiNow();
  // the log: a free rise is no Get up, and a stance taken is a line of its own
  const lg=S.hooks.log;S.hooks.log=function(e){if(e&&e.type==='getup'&&e.free){const li=newEntry(false);
      li.innerHTML=`<div class="lg-l">${who(e.A)}<span>rises free</span></div><div class="lg-perf">${DOWNF.rise==='off'?'off balance':'Committed'}, and the turn is his</div>`;pushEntry(li);return;}
    return lg.apply(this,arguments);};
  const sh=S.hooks.stance;S.hooks.stance=function(K,s){sh.apply(this,arguments);const li=newEntry(false);
    li.innerHTML=`<div class="lg-l">${who(K)}<span>takes ${STANCES[s].name}</span></div><div class="lg-perf">${STANCES[s].line}</div>`;pushEntry(li);};
  // the answer window says what the stance does to his answers
  const base=S.hooks.opening;
  S.hooks.opening=function(o){base.apply(this,arguments);if(!o||o.source!=='react'||o.f!==hero())return;const s=stanceOf(o.f),r=$('opReason');if(!r)return;
    if(s==='unbound')r.textContent+=` Unbound: Parry ${STN_SIGNED(STN.parry)}, Counter ${STN_SIGNED(STN.counter)}.`;
    else if(s==='close'&&S.F[getTgt(o.f)]!==o.opp)r.textContent+=` Tied up inside ${S.F[getTgt(o.f)]?S.F[getTgt(o.f)].name:'his man'}: ${STN_SIGNED(STN.tied)}.`;};
  V11UI.tick.push(stnUiFrame);
  // the first time, the setup opens with what the test is
  let seen=false;try{seen=localStorage.getItem('stn_seen')==='1';}catch(e){}
  if(!seen&&!window.SK_TEST)setTimeout(()=>{if(HUD.state==='play')stnSetup(true);},600);
});
// ===== STANCES UI (test) END =====
