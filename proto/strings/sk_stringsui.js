// ===== STRINGS UI (test) START =====
// The test page's side of strings on a timeline (sk_strings.js). On Ilyas's turn the dock's moves go into his string instead of being
// played at once; the string bar under them shows the string, his beats (gold spent, cyan kept) and Go. The timeline over the dock shows
// the turn in time: his string now, his kept beats up to his next turn, and each enemy's next moves at their time as tells, with the
// answer Ilyas will give each (his read, or the one picked by tapping the mark). The enemies hold their tells in the picture while he
// plans, and the labels over their heads name them. The page opens straight on a fight; the Setup button changes the fight and the
// rules under test (beats, answers set ahead or picked live, the turn's tempo, or today's turn for comparison).
const STRUI={sig:'',bsig:'',psig:'',t:0,pick:null,set:false,el:{}};
const STR_SHORT={slash:'Slash',overhead:'Overhead',thrust:'Thrust',sweep:'Sweep',shove:'Shove',feint:'Feint',advance:'Advance',sidestep:'Sidestep',withdraw:'Withdraw',
  flank:'Flank',wait:'Hold',getup:'Get up',roll:'Roll',grab:'Grab',elbow:'Elbow',knee:'Knee',headbutt:'Headbutt',throw:'Throw',push:'Push',breakfree:'Break free',
  stab:'Stab',bolt:'Bolt',gale:'Gale',blink:'Glimmer',room1:'Room',room2:'Room',draw:'Draw',pickup:'Pick up',shield:'Shield',toss:'Toss'};
function strShort(c){return STR_SHORT[c]||(ACTIONS[c]&&ACTIONS[c].name)||c;}
const STR_SVG=(d,vb)=>`<svg viewBox="${vb||'0 0 12 12'}" aria-hidden="true"><path d="${d}"></path></svg>`;
const STR_ICON={high:STR_SVG('M2 8.5 L6 4 L10 8.5'),point:STR_SVG('M4 2 L8.5 6 L4 10'),low:STR_SVG('M2 4 L6 8.5 L10 4'),close:STR_SVG('M2 3 L5 6 L2 9 M10 3 L7 6 L10 9'),
  step:STR_SVG('M2 6 H10 M7 3 L10 6 L7 9'),hold:STR_SVG('M3 6 H9'),shield:STR_SVG('M5.5 1 L10 2.6 V6 C10 8.6 8 10.4 5.5 11.2 C3 10.4 1 8.6 1 6 V2.6 Z','0 0 11 12'),
  counter:STR_SVG('M2 3 H7.5 C9.5 3 10.5 4.4 10.5 6 C10.5 7.6 9.5 9 7.5 9 H2.5 M4.5 7 L2.5 9 L4.5 11'),x:STR_SVG('M2 2 L10 10 M10 2 L2 10')};
const STR_WHY={missed:'Answered: the string ends',hit:'Hit: the string ends',broken:'Broken: the string ends',held:'Held: the string ends',down:'Down: the string ends',blocked:'No way on: the string ends'};
const STR_ANS_LINE={parry:'Turns a Slash or a Thrust. An Overhead breaks it.',counter:'Meets an Overhead. Risky against a Slash.',slip:'Off the line. Good against a Thrust or an Overhead.',
  back:'Out of reach. Best against a Sweep.',turn:'Into the man behind him.'};
function strEsc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

// ---------- the plan from the dock ----------
{const hc=humanCommand;humanCommand=function(k){if(!STR.on)return hc.apply(this,arguments);
  const g=S.game;if(g.phase!=='input'||isAI(g.active)||S.opening)return;const K=S.F[g.active];if(K!==hero())return hc.apply(this,arguments);
  const D=targetOf(K),act=slotAction(K,D,k);if(!act)return;ensureAudio();
  if(act==='wait'&&!K.downed&&!K.clinch){strGo();updateStatus();return;}
  if(!cmdValid(K,D,act))return;
  if(strPlanAdd(act)){STRUI.pick=null;updateStatus();strUiNow();}};}
{const hs=humanSpell;humanSpell=function(k){if(!STR.on)return hs.apply(this,arguments);
  const g=S.game;if(g.phase!=='input'||isAI(g.active)||S.opening)return;const K=S.F[g.active];if(K!==hero()||!spellOK(K,targetOf(K),k))return;ensureAudio();
  if(strPlanAdd(k)){updateStatus();strUiNow();}};}
// the dock's buttons: what each costs in beats, and the ones that no longer fit the string
{const uc=updateCommands;updateCommands=function(){uc.apply(this,arguments);if(!STR.on)return;
  const K=cmdHero(),D=K&&!K.dead?targetOf(K):null,plan=strPlanning(),left=strPlanLeft();
  for(const k of CMD_ORDER){const b=$('cmd-'+k);if(!b||b.hidden)continue;const act=K&&!K.dead?slotAction(K,D,k):null;if(!act)continue;
    const bt=strBeatsOf(act),h=$('h-'+k);if(!h)continue;const pm=(h.textContent.match(/(\d+)%/)||[])[1];
    h.textContent=act==='wait'&&!K.downed&&!K.clinch?(strPlan().length?'keep the rest':'keep every beat'):(bt===1?'1 beat':bt+' beats')+(pm?' · '+pm+'%':'');
    if(plan&&bt>left)b.disabled=true;}
  strUiNow();};}
// the tells over their heads
{const il=intentLabel;intentLabel=function(f){if(!STR.on)return il.apply(this,arguments);const it=f.intent;if(!it)return'';
  return[it.cmd,...(it.more||[])].map(c=>TELLS[tellOf(c)].name).join(', then ');}}
{const ui=updateIntents;updateIntents=function(){ui.apply(this,arguments);if(!STR.on)return;
  for(const f of foes()){const it=f.intent;if(it)f._when=TELLS[tellOf(it.cmd)].what;}};}
// the HUD keeps the fighters clear of the timeline as well as the dock
{const hm=hudMeasure;hudMeasure=function(){hm.apply(this,arguments);const tl=STRUI.el.tl,st=hudEl('stageWrap');
  if(!STR.on||!tl||tl.hidden||!st||HUD.state!=='play')return;const R=st.getBoundingClientRect(),r=tl.getBoundingClientRect();if(!(r.height>0))return;
  const b=Math.max(HUD_IN.bottom,R.bottom-r.top+6);if(Math.abs(b-HUD_IN.bottom)>.5){HUD_IN.bottom=b;st.style.setProperty('--hud-bottom',b+'px');}};}

// ---------- the timeline ----------
function strHeroNext(){const K=hero();if(strPlanning()){if(STR.cost==='fixed')return strTurnCost(K);
    return strPlan().reduce((s,m,i)=>s+Math.round(actionCost(K,m.cmd)*(i?1-Math.min(i*.15,.45):1)),0)||actionCost(K,'wait');}
  return Math.max(0,K.ready);}
// the moves of a man's next turn: the intent and the rest of the string planned with it
function strNextMoves(f){const it=f.intent;return it?[it.cmd,...(it.more||[])]:[];}
function strAnsFor(E,n,cmd){const K=hero(),s=(strAnsSet()[E.idx]||{})[n];if(s&&reactChoices(K,E).includes(s))return{k:s,set:true};
  return ATTACKS.includes(cmd)?{k:strRead(E,K,tellOf(cmd)),set:false}:null;}
function strTLHtml(){
  const g=S.game,K=hero();if(!STR.on||!K||K.dead||!g||['over','intro','transit','finale','idle'].includes(g.phase)||S.story)return'';
  const fs=foes().filter(f=>!f.walkIn),plan=strPlanning(),st=strSt(K),hn=strHeroNext();
  const moves=plan?strPlan():(st.playing?st.plan:[]),cur=st.playing?st.i:-1;
  const kept=plan?strPlanLeft()+(st.carry||0):(K.kept||0),over=plan?kept<=0&&moves.length>0:!!K.overext;
  let tmax=Math.max(hn*1.4,120);for(const f of fs)tmax=Math.max(tmax,f.ready+30);tmax=Math.min(tmax,hn*2.2+60);
  const X=t=>clamp(t/tmax*100,0,100).toFixed(2)+'%';
  // the hero's lane: the string now, what he keeps up to his next turn, the next turn
  const blocks=moves.length?moves.map((m,i)=>`<b class="${i<cur?'done':i===cur?'now':''}${strBeatsOf(m.cmd)>1?' two':''}">${strEsc(strShort(m.cmd))}${i>0?`<i>+${Math.min(i,STR.linkMax)}</i>`:''}</b>`).join('')
    :`<b class="empty">${plan?'plan':'—'}</b>`;
  let hero1=`<span class="tl-str">${blocks}</span>`;
  hero1+=`<span class="tl-keep${over?' over':''}" style="left:calc(${X(0)} + ${Math.min(150,24+moves.length*44)}px);right:calc(100% - ${X(hn)})">${over?'−2':`${STR_ICON.counter}${kept}`}</span>`;
  hero1+=`<span class="tl-next" style="left:${X(hn)}"></span>`;
  let rows=`<div class="tl-row hero"><span class="tl-name" style="--c:${K.color}">${strEsc(K.name)}</span><div class="tl-track">${hero1}</div></div>`;
  for(const f of fs){let tr='';const actNow=g.active===f.idx&&f.str&&f.str.playing,ts=actNow?0:f.ready;
    const ms=actNow?f.str.plan.map(m=>m.cmd):strNextMoves(f),before=ts<hn-1e-6;
    if(f.downed&&!actNow)tr+=`<span class="tl-turn" style="left:${X(ts)}"><span class="tl-mv down">down</span></span>`;
    else if(ms.length){let cells='';ms.forEach((c,n)=>{const t=tellOf(c),a=before&&!actNow?strAnsFor(f,n,c):null,done=actNow&&n<f.str.i;
      cells+=`<button type="button" class="tl-mv${done?' done':''}${actNow&&n===f.str.i?' now':''}${STRUI.pick&&STRUI.pick.e===f.idx&&STRUI.pick.n===n?' sel':''}" data-e="${f.idx}" data-n="${n}" style="--c:${f.color}" aria-label="${strEsc(f.name)}: ${TELLS[t].name}${a?', answered with '+REACT_NAME[a.k]:''}"${plan&&before&&ATTACKS.includes(c)?'':' tabindex="-1"'}>`+
        `<span class="tl-tell">${STR_ICON[t]||''}</span>${a?`<span class="tl-ans${a.set?' set':''}${over?' over':''}">${STR_ICON.shield}${REACT_NAME[a.k]}${over?'<i>−2</i>':''}</span>`:''}</button>`;});
      tr+=`<span class="tl-turn${before||actNow?'':' later'}" style="left:${X(ts)}">${cells}</span>`;}
    const t2=(actNow?f.ready:f.ready+strTurnCost(f));if(t2<tmax)tr+=`<span class="tl-turn later" style="left:${X(t2)}"><span class="tl-mv ghost" style="--c:${f.color}"></span></span>`;
    rows+=`<div class="tl-row"><span class="tl-name" style="--c:${f.color}">${strEsc(f.name)}${f.kept?`<em>${STR_ICON.counter}${f.kept}</em>`:''}${f.broken?'<em class="br">broken</em>':''}</span><div class="tl-track">${tr}</div></div>`;}
  const ticks=[0,.25,.5,.75,1].map(u=>`<i style="left:${(u*100).toFixed(1)}%"></i>`).join('');
  return`<div class="tl-axis"><span class="tl-now">now</span><span class="tl-nextlbl" style="left:${X(hn)}">next turn</span><div class="tl-ticks">${ticks}</div></div>`+
    `<div class="tl-rows">${rows}<div class="tl-dashbox"><div class="tl-dash" style="left:${X(hn)}"></div></div></div>`;}
// the answer picker for one of an enemy's moves
function strPickHtml(){const p=STRUI.pick,K=hero();if(!p||!strPlanning())return'';const E=S.F[p.e];if(!E||E.dead)return'';
  const c=strNextMoves(E)[p.n];if(!c||!ATTACKS.includes(c))return'';const t=tellOf(c),w=tellWeights(E,t),ch=reactChoices(K,E),read=strRead(E,K,t),cur=strAnsFor(E,p.n,c);
  const over=strPlanLeft()+(strSt(K).carry||0)<=0&&strPlan().length>0,ov=K.overext;K.overext=over;
  const kinds=Object.keys(w).filter(k=>ATTACKS.includes(k));
  const seen=strHist(E).filter(h=>h.tell===t),cnt={};for(const h of seen)cnt[h.kind]=(cnt[h.kind]||0)+1;
  const seenTxt=seen.length?`Seen under ${TELLS[t].name}: `+Object.entries(cnt).map(([k,n])=>`${ACTIONS[k].name} ×${n}`).join(', ')+'.':'Nothing seen from him under this tell yet.';
  let btns='';for(const k of ch){const pc=kinds.map(kd=>`${ACTIONS[kd].name} ${Math.round(reactLands(E,K,kd,false,pickTechnique(E,K,kd),k)*100)}%`).join(' · ');
    btns+=`<button type="button" class="pk-a${cur&&cur.k===k?' on':''}" data-k="${k}" aria-pressed="${cur&&cur.k===k}"><span class="pk-n">${REACT_NAME[k]}${k===read?'<em>his read</em>':''}</span><span class="pk-l">${STR_ANS_LINE[k]||''}</span><span class="pk-p">lands ${pc}</span></button>`;}
  K.overext=ov;
  return`<div class="pk-head"><span class="pk-who" style="--c:${E.color}">${strEsc(E.name)}</span><span class="pk-tell">${STR_ICON[t]}${TELLS[t].name}</span>`+
    `<button type="button" class="pk-x" aria-label="Close">${STR_ICON.x}</button></div><p class="pk-what">${cap(TELLS[t].what)}. ${seenTxt}</p><div class="pk-grid">${btns}</div>`;}
// the string bar: his beats, the string, what he keeps, Undo and Go
function strBarHtml(){const K=hero(),g=S.game;if(!STR.on||!K||K.dead||!g)return'';const plan=strPlanning(),st=strSt(K),total=strBeatsFor(K);
  const moves=plan?strPlan():(st.playing?st.plan:[]),spent=plan?strSpent(moves):0,carry=st.carry||0;
  const kept=plan?total-spent+carry:(K.kept||0);
  let pips='';for(let i=0;i<total;i++)pips+=`<i class="${plan?(i<spent?'used':'keep'):(i<kept?'keep':'')}"></i>`;if(plan&&carry)pips+='<i class="keep carry"></i>';
  const chips=moves.length?moves.map((m,i)=>`<span class="sb-chip${st.playing&&i<st.i?' done':''}${st.playing&&i===st.i?' now':''}"${m.tgt!=null&&S.F[m.tgt]?` style="--c:${S.F[m.tgt].color}"`:''}>${strEsc(strShort(m.cmd))}${i>0?`<i>+${Math.min(i,STR.linkMax)}</i>`:''}</span>`).join('<span class="sb-sep">›</span>')
    :`<span class="sb-hint">${plan?'Tap moves to build his string.':g.active===K.idx?'':'The enemies move.'}</span>`;
  const note=plan?(moves.length?(kept>0?`${kept} kept to counter`:'All in: answers at −2'):`${total+carry} beats to spend or keep`)
    :st.playing?'Playing his string':K.overext?'Overextended: answers at −2':`${kept} kept to counter`;
  return`<div class="sb-beats" aria-label="Beats">${pips}</div><div class="sb-mid"><div class="sb-chips">${chips}</div><div class="sb-note${plan&&moves.length&&kept<=0?' over':''}">${note}</div></div>`+
    `<button type="button" class="sb-undo"${plan&&moves.length?'':' disabled'}>Undo</button><button type="button" class="sb-go"${plan?'':' disabled'}>${plan&&!moves.length?'Hold':'Go'}</button>`;}
function strUiNow(){STRUI.t=0;}
function strSetBtnAt(){const E=STRUI.el,st=hudEl('stageWrap');if(!E.sb||!st)return;const R=st.getBoundingClientRect();let b=0;
  for(const el of [hudEl('hudTop'),...document.querySelectorAll('.wrap.hud .frow')]){if(!el||!el.offsetParent)continue;const r=el.getBoundingClientRect();if(r.height>0&&r.top<R.top+R.height*.4)b=Math.max(b,r.bottom-R.top);}
  const top=Math.round(b+8)+'px';if(E.sb.style.top!==top)E.sb.style.top=top;}
function strUiFrame(){const E=STRUI.el;if(!E.tl)return;const on=STR.on&&HUD.state==='play'&&!S.story;
  E.tl.hidden=!on;E.bar.hidden=!on;E.wrap.classList.toggle('str-on',on);if(!on){E.pick.hidden=true;return;}
  const now=performance.now();if(now-STRUI.t<90)return;STRUI.t=now;strSetBtnAt();
  const h=strTLHtml();if(h!==STRUI.sig){STRUI.sig=h;E.tlIn.innerHTML=h;}E.tl.hidden=!h;
  const b=strBarHtml();if(b!==STRUI.bsig){STRUI.bsig=b;E.bar.innerHTML=b;}
  const p=strPickHtml();if(!p)STRUI.pick=null;if(p!==STRUI.psig){STRUI.psig=p;E.pick.innerHTML=p;}E.pick.hidden=!p;}

// ---------- the setup ----------
const STR_ARENAS=[['street','Lamplight Street'],['field','Meadow'],['hill','Hillside'],['ledge','Broken ledge'],['wall','Ruin wall'],['restaurant','The bistro']];
function strSetupHtml(){const opt=(grp,val,cur,label)=>`<button type="button" class="st-o" data-g="${grp}" data-v="${val}" aria-pressed="${String(cur)===String(val)}">${label}</button>`;
  return`<div class="ss-in" role="dialog" aria-label="Test setup"><div class="ss-head"><span>Strings test</span><button type="button" class="ss-x" aria-label="Close">${STR_ICON.x}</button></div>`+
    `<div class="ss-g"><span>Turn</span>${opt('on',1,STR.on?1:0,'Strings')}${opt('on',0,STR.on?1:0,'Today’s')}</div>`+
    `<div class="ss-g"><span>Enemies</span>${[1,2,3].map(n=>opt('n',n,S.cfg.n,n)).join('')}</div>`+
    `<div class="ss-g ss-wrap"><span>Arena</span>${STR_ARENAS.map(([k,l])=>opt('arena',k,S.arenaKey,l)).join('')}</div>`+
    `<div class="ss-g"><span>Beats</span>${opt('beats',2,STR.beats,'2')}${opt('beats',3,STR.beats,'3')}</div>`+
    `<div class="ss-g"><span>Answers</span>${opt('answers','ahead',STR.answers,'Set ahead')}${opt('answers','live',STR.answers,'Picked live')}</div>`+
    `<div class="ss-g"><span>Turn cost</span>${opt('cost','fixed',STR.cost,'Same each turn')}${opt('cost','string',STR.cost,'By the string')}</div>`+
    `<p class="ss-note">Enemies, arena and beats start a new fight. Answers and turn cost change at once.</p>`+
    `<div class="ss-foot"><button type="button" class="ss-go">New fight</button></div></div>`;}
function strSetup(on){const E=STRUI.el;STRUI.set=on;E.setup.hidden=!on;S.paused=on;if(on)E.setup.innerHTML=strSetupHtml();}
function strNewFight(){strSetup(false);STRUI.pick=null;S.F=[];restart();updateStatus();strUiNow();}
function strSetupPick(g,v){
  if(g==='on'){STR.on=v==='1';const g0=S.game;if(g0&&g0.phase==='input')g0.aiAt=isAI(g0.active)?S.t+.4:null;strNewFight();return;}
  if(g==='n'){S.cfg.n=+v;strNewFight();return;}
  if(g==='arena'){S.arenaKey=v;strNewFight();return;}
  if(g==='beats'){STR.beats=+v;strNewFight();return;}
  if(g==='answers')STR.answers=v;if(g==='cost')STR.cost=v;
  STRUI.el.setup.innerHTML=strSetupHtml();strUiNow();}

// ---------- put it on the page ----------
V11UI.init.push(()=>{
  // (the test opens on a fight, not the story's title)
  if(typeof storyMenu==='function')storyMenu(false);
  S.cfg.n=2;S.cfg.ally.on=false;S.arenaKey='street';S.tableOn=true;
  const wrap=$('wrap'),cmds=$('commands');if(!wrap||!cmds)return;
  const tl=document.createElement('div');tl.id='strTL';tl.className='str-tl';tl.setAttribute('aria-label','Timeline');
  tl.innerHTML='<div class="tl-in"></div><div class="str-pick" id="strPick" hidden></div>';cmds.appendChild(tl);
  const bar=document.createElement('div');bar.id='strBar';bar.className='str-bar';cmds.appendChild(bar);
  const sb=document.createElement('button');sb.type='button';sb.id='strSetBtn';sb.className='str-setbtn';sb.textContent='Setup';wrap.appendChild(sb);
  const setup=document.createElement('div');setup.id='strSetup';setup.className='str-setup';setup.hidden=true;wrap.appendChild(setup);
  STRUI.el={wrap,tl,tlIn:tl.querySelector('.tl-in'),pick:tl.querySelector('.str-pick'),bar,setup,sb};
  tl.addEventListener('click',e=>{const m=e.target.closest('.tl-mv[data-e]');if(!m||!strPlanning())return;const p={e:+m.dataset.e,n:+m.dataset.n};
    const c=strNextMoves(S.F[p.e]||{})[p.n];if(!c||!ATTACKS.includes(c))return;STRUI.pick=STRUI.pick&&STRUI.pick.e===p.e&&STRUI.pick.n===p.n?null:p;strUiNow();});
  STRUI.el.pick.addEventListener('click',e=>{if(e.target.closest('.pk-x')){STRUI.pick=null;strUiNow();return;}
    const b=e.target.closest('.pk-a');if(!b||!STRUI.pick)return;const A=strAnsSet(),p=STRUI.pick;(A[p.e]||(A[p.e]={}))[p.n]=b.dataset.k;STRUI.pick=null;strUiNow();});
  bar.addEventListener('click',e=>{if(e.target.closest('.sb-undo')){strPlanUndo();updateStatus();strUiNow();return;}
    if(e.target.closest('.sb-go')&&strPlanning()){ensureAudio();STRUI.pick=null;strGo();updateStatus();strUiNow();}});
  sb.addEventListener('click',()=>strSetup(!STRUI.set));
  setup.addEventListener('click',e=>{if(e.target===setup||e.target.closest('.ss-x')){strSetup(false);return;}if(e.target.closest('.ss-go')){strNewFight();return;}
    const o=e.target.closest('.st-o');if(o)strSetupPick(o.dataset.g,o.dataset.v);});
  document.addEventListener('keydown',e=>{if(!STR.on||typingIn(e.target)||e.ctrlKey||e.metaKey||e.altKey||!strPlanning())return;
    if(e.key==='Enter'){strGo();updateStatus();strUiNow();e.preventDefault();}else if(e.key==='Backspace'){strPlanUndo();updateStatus();strUiNow();e.preventDefault();}});
  // a counter needs no panel: it goes at once, named over him; a string that ends early says why
  const base=S.hooks.opening;
  S.hooks.opening=function(o){if(STR.on&&o&&o.auto)return;base.apply(this,arguments);
    if(STR.on&&o&&o.source==='react'&&STR.answers==='live'){const t=tellOf(o.attack);$('opTitle').textContent='Incoming: '+TELLS[t].name;
      $('opSub').textContent=`${o.opp.name} · ${TELLS[t].what}`;$('opReason').textContent='Read the tell. Too slow, and he answers by his own read.';
      $('opBtns').querySelectorAll('button').forEach(b=>{b.classList.remove('best');const sm=b.querySelector('small');if(sm)sm.textContent='';});}};
  S.hooks.strCounter=o=>{S.callouts.push({i:o.f.idx,text:'Counter',age:0,life:1.1,dx:-(o.f.facing||1)*10,dy:-22,big:o.f===hero()});};
  S.hooks.strEnd=(A,why)=>{if(A===hero()&&STR_WHY[why])S.callouts.push({i:A.idx,text:STR_WHY[why],age:0,life:1.4,dx:0,dy:-40});strUiNow();};
  S.hooks.strStart=()=>strUiNow();
  V11UI.tick.push(strUiFrame);
});
// ===== STRINGS UI (test) END =====
