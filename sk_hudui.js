// ===== HUD UI =====
// (loaded after the other UI files and ahead of the main UI script; everything that touches the page runs once the UI is up)
// The full-screen stage's controls, in the black and gold: the top bar (the menu, the fighters' plates, the turn order, the log), the
// command dock (one group at a time behind tabs on a phone, every group at once on a desktop), the menu drawer that pauses the fight
// (the bench, the arena, the codex), the log drawer, and what the HUD covers of the picture, which the camera frames the fighters
// around (HUD_IN, sk_ui.js).
const HUD={built:false,mode:'',tab:'strike',userTab:'strike',auto:false,menu:false,log:false,dtab:'fight',state:'',turnKey:'',op:'',measAt:0,billH:0,padR:10};
const HUD_GROUPS={strike:['slash','overhead','thrust','sweep','shove','feint'],move:['advance','sidestep','withdraw'],guard:['guard','wait','cover','team']};
const HUD_TABS=['strike','move','guard','aether'];
// the layout for a screen: a phone held sideways (short and wide), a phone held upright, a desktop, and a tablet between them
function hudModeOf(w,h){return h<=560&&w>h?'land':w<=640?'port':w>=1000?'desk':'tab';}
function hudEl(id){return document.getElementById(id);}
// called by resize() in sk_ui.js, from the first moment the canvas is sized
function hudResized(){const m=hudModeOf(cssW,cssH);if(m!==HUD.mode||!HUD.applied)hudApplyMode(m);HUD.measAt=0;}
function hudApplyMode(m){
  HUD.mode=m;const wr=hudEl('wrap');if(wr&&wr.dataset)wr.dataset.mode=m;
  if(!HUD.built)return;HUD.applied=true;
  // the desktop dock heads its strike group with the command line and the Drive choice, and has a foot for the preview and the field;
  // the phone docks keep them by the tabs
  const head=hudEl('cmdHead'),drv=hudEl('drives'),pv=hudEl('cmdPreview'),fl=hudEl('fieldLine'),c=hudEl('commands'),tabs=hudEl('cmdTabs'),cm=hudEl('cmds');
  try{
    if(m==='desk'){HUD.strikeHead.appendChild(head);HUD.strikeHead.appendChild(drv);HUD.foot.appendChild(pv);HUD.foot.appendChild(fl);}
    else{c.insertBefore(head,tabs);tabs.insertAdjacentElement('afterend',drv);cm.insertAdjacentElement('afterend',pv);hudEl('tempoLine').insertAdjacentElement('afterend',fl);}
  }catch(e){}
  hudScrimSync();HUD.measAt=0;}

// ---------- what the HUD covers ----------
// the top bar's foot and the dock's head, from the stage's edges, in CSS pixels; nothing while a scene plays or the title is up
function hudMeasure(){
  const st=hudEl('stageWrap');if(!st||typeof getComputedStyle!=='function'||!st.getBoundingClientRect)return;
  const R=st.getBoundingClientRect();if(!(R.height>0))return;let top=0,bottom=0;
  if(HUD.state==='play'){
    const ht=hudEl('hudTop').getBoundingClientRect();if(ht.height>0)top=Math.max(0,ht.bottom-R.top);
    const c=hudEl('commands'),cr=c.getBoundingClientRect();
    let ref=cr.height>0?cr.top:R.bottom;
    if(HUD.mode==='land'||HUD.mode==='tab'){const b=hudEl('cmds').getBoundingClientRect();if(b.height>0)ref=b.top;}
    else if(HUD.mode==='port'){const t=hudEl('cmdTabs').getBoundingClientRect();if(t.height>0)ref=Math.min(ref,t.top);}
    bottom=Math.max(0,R.bottom-ref);
    const lb=hudEl('logBtn').getBoundingClientRect();if(lb.width>0)HUD.padR=Math.max(4,R.right-lb.right);}
  const bl=hudEl('bill');HUD.billH=bl&&!bl.hidden?bl.offsetHeight||0:0;
  if(Math.abs(top-HUD_IN.top)>.5||Math.abs(bottom-HUD_IN.bottom)>.5){HUD_IN.top=top;HUD_IN.bottom=bottom;
    st.style.setProperty('--hud-top',top+'px');st.style.setProperty('--hud-bottom',bottom+'px');}}
// where the kill chain's badge goes: under the top bar on the right, under the damages if they are up
function hudBadgeAt(){return{top:HUD_IN.top+8+(HUD.billH?HUD.billH+6:0),right:HUD.padR};}

// ---------- the HUD's state, every frame ----------
// play: the fight's HUD; cut: a scene of the prologue (only the menu button stays); title and end: the prologue's title menu or end card
function hudStateNow(){
  if(typeof ST_UI!=='undefined'){if(ST_UI.menu&&!ST_UI.menu.hidden)return'title';if(ST_UI.end&&!ST_UI.end.hidden)return'end';}
  if(typeof storyQuiet==='function'&&storyQuiet())return'cut';
  return'play';}
function hudFrame(){
  const wr=hudEl('wrap');if(!wr||!wr.dataset)return;
  const st=hudStateNow();if(st!==HUD.state){HUD.state=st;wr.dataset.hud=st;if(st!=='play'&&HUD.log)hudLog(false);if(st==='title'&&HUD.menu)hudMenu(false);HUD.measAt=0;}
  // an opening or the last scene's choice docks in the commands' place; while the hero chooses, the enemies' plates fade
  const op=!hudEl('opening').hidden||!hudEl('finalePanel').hidden,ov=op?(S.opening&&S.opening.f&&S.opening.f.team===1?'e':'h'):'';if(ov!==HUD.op){HUD.op=ov;wr.dataset.op=ov;}
  const now=performance.now();if(now-HUD.measAt>500){HUD.measAt=now;hudMeasure();}}

// ---------- the command dock ----------
function hudSetTab(t,user){if(!HUD_TABS.includes(t))t='strike';HUD.tab=t;if(user){HUD.userTab=t;HUD.auto=false;}
  const c=hudEl('commands');if(c&&c.dataset)c.dataset.tab=t;
  for(const b of HUD.tabBtns||[])b.setAttribute('aria-selected',String(b.dataset.tab===t));
  if(HUD.mode==='port')HUD.measAt=0;}
// a group with something in it the player can press now
function hudGroupLive(t){
  if(t==='aether'){const m=hudEl('magic'),r=hudEl('mgRow');if(!m||m.hidden||!r)return false;return[...r.children].some(b=>!b.disabled);}
  return(HUD_GROUPS[t]||[]).some(k=>{const b=hudEl('cmd-'+k);return b&&!b.hidden&&!b.disabled;});}
function hudAfterCommands(){
  if(!HUD.built)return;
  // the Aether tab only while Kael has magic, with his Aether on it as pips
  const m=hudEl('magic'),on=!!m&&!m.hidden,ta=hudEl('tabAether');if(ta)ta.hidden=!on;if(!on&&HUD.tab==='aether')hudSetTab(HUD.userTab!=='aether'?HUD.userTab:'strike');
  const K=S.F[0],a=K&&K.aether||0,mx=typeof MAGIC!=='undefined'?MAGIC.max:5,pp=hudEl('tabPips');
  if(pp){const t='◆'.repeat(clamp(a,0,mx))+'◇'.repeat(clamp(mx-a,0,mx));if(pp.textContent!==t)pp.textContent=t;}
  // at the start of each of the player's turns: back to the group he chose if it was left only because it had nothing to press,
  // and on from a group with nothing to press to the first that has something
  const g=S.game,Hh=cmdHero(),human=g.phase==='input'&&!isAI(g.active)&&!S.opening&&S.F[g.active]===Hh,key=human?g.turnNo+':'+g.active:'';
  if(key&&key!==HUD.turnKey){HUD.turnKey=key;
    if(HUD.auto&&HUD.tab!==HUD.userTab&&hudGroupLive(HUD.userTab)){hudSetTab(HUD.userTab);HUD.auto=false;}
    if(!hudGroupLive(HUD.tab)){const t=['strike','guard','move','aether'].find(hudGroupLive);if(t&&t!==HUD.tab){hudSetTab(t);HUD.auto=true;}}}
  else if(!key)HUD.turnKey='';}
// whether the preview line has something worth a strip over the picture: a hovered command (a sideways phone shows only that), or a
// tip beyond the footing and the man at your back (a tablet shows that too)
function hudPreviewVis(){const pv=hudEl('cmdPreview');if(!pv||!pv.dataset||!pv.querySelector)return;
  const tip=pv.querySelector('.fl-tip:not(.fl-back)'),hv=previewCmd&&pv.textContent?'1':'',v=hv||(tip&&tip.textContent)?'1':'';
  if(pv.dataset.vis!==v)pv.dataset.vis=v;if(pv.dataset.hov!==hv)pv.dataset.hov=hv;}
// the buttons into their groups: Strike, Move, Tactics (Hold, the team moves, cover from the guns), and Kael's Aether (the magic row, which brings its own head)
function hudBuildDock(){
  const box=hudEl('cmds');if(!box)return;
  const mk=(g,title)=>{const s=document.createElement('section');s.className='cg';s.dataset.g=g;s.setAttribute('aria-label',title);
    const h=document.createElement('div');h.className='cg-head';const t=document.createElement('span');t.className='cg-t';t.textContent=title;h.appendChild(t);
    const grid=document.createElement('div');grid.className='cg-grid';s.appendChild(h);s.appendChild(grid);box.appendChild(s);return{s,h,grid};};
  for(const [g,keys] of Object.entries(HUD_GROUPS)){const G=mk(g,g==='strike'?'Strike':g==='move'?'Move':'Tactics');for(const k of keys){const b=hudEl('cmd-'+k);if(b)G.grid.appendChild(b);}
    if(g==='strike')HUD.strikeHead=G.h;}
  const sa=document.createElement('section');sa.className='cg';sa.dataset.g='aether';sa.setAttribute('aria-label','Aether');box.appendChild(sa);
  const mg=hudEl('magic');if(mg)sa.appendChild(mg);
  // the desktop dock's foot: the preview line and the field line
  const foot=document.createElement('div');foot.className='dock-foot';foot.id='dockFoot';hudEl('commands').appendChild(foot);HUD.foot=foot;
  HUD.tabBtns=[...hudEl('cmdTabs').querySelectorAll('button[data-tab]')];
  for(const b of HUD.tabBtns)b.addEventListener('click',()=>hudSetTab(b.dataset.tab,true));}

// ---------- the drawers ----------
function hudScrimSync(){const sc=hudEl('hudScrim');if(sc)sc.hidden=!(HUD.menu||(HUD.log&&HUD.mode!=='desk'));}
function hudMenu(on){on=!!on;if(on===HUD.menu)return;HUD.menu=on;S.paused=on;
  const wr=hudEl('wrap'),side=hudEl('sideCol'),mb=hudEl('menuBtn');wr.dataset.menu=on?'1':'';side.inert=!on;hudEl('stageWrap').inert=on;
  mb.setAttribute('aria-expanded',String(on));
  if(on){if(HUD.log)hudLog(false);hudDrawerSync();const r=hudEl('resumeBtn');if(r&&r.focus)r.focus({preventScroll:true});}
  else{const a=document.activeElement;if(!a||a===document.body||(side.contains&&side.contains(a)))mb.focus({preventScroll:true});}
  hudScrimSync();}
function hudLog(on){on=!!on;if(on===HUD.log)return;HUD.log=on;const wr=hudEl('wrap'),lp=hudEl('logPanel'),lb=hudEl('logBtn');
  wr.dataset.log=on?'1':'';lp.inert=!on;lb.setAttribute('aria-expanded',String(on));
  if(on){const x=hudEl('logClose');if(x&&x.focus)x.focus({preventScroll:true});}
  else{const a=document.activeElement;if(a&&lp.contains&&lp.contains(a))lb.focus({preventScroll:true});}
  hudScrimSync();}
function hudDrawerTab(t){HUD.dtab=t;const side=hudEl('sideCol');side.dataset.tab=t;
  for(const b of side.querySelectorAll('.drawer-tabs button'))b.setAttribute('aria-selected',String(b.dataset.dtab===t));side.scrollTop=0;}
// the drawer's head: where the fight is; in the prologue only the codex and the way back to the title
function hudDrawerSync(){
  const side=hudEl('sideCol'),story=!!S.story;side.dataset.story=story?'1':'';if(story&&HUD.dtab!=='codex')hudDrawerTab('codex');
  const sub=hudEl('drawerSub');let t;
  if(story){const st=typeof STAGES!=='undefined'&&S.story&&STAGES[S.story.i];t='The prologue'+(st&&st.title?' · '+st.title:'');}
  else t='Skirmish lab · '+(hudEl('fieldLine').textContent||'').split(' · ').slice(0,2).join(' · ');
  sub.textContent=t;}

// ---------- full screen, where the browser allows it ----------
function hudFullscreen(){
  const d=document,can=d.fullscreenEnabled&&d.documentElement&&d.documentElement.requestFullscreen;if(!can)return;
  const b=document.createElement('button');b.type='button';b.className='btn';b.id='fsBtn';const lbl=()=>{b.textContent=d.fullscreenElement?'Leave full screen':'Full screen';};lbl();
  b.addEventListener('click',()=>{try{if(d.fullscreenElement)d.exitFullscreen();else d.documentElement.requestFullscreen({navigationUI:'hide'}).catch(()=>{});}catch(e){}});
  d.addEventListener('fullscreenchange',lbl);const sc=hudEl('showcase');if(sc&&sc.parentNode)sc.parentNode.insertBefore(b,sc.nextSibling);}

// ---------- the plates on an upright phone ----------
// An upright phone has room for the plates only two by two, so a crowd of enemies stacked them down the screen. There the top bar
// keeps one plate a side: the hero whose commands are up, and his target (a tablet has room for them all in a row: the stylesheet). Everyone's hit points ride over his head in the picture (the
// head bars), and his footing is the ring at his feet. Dots on a plate count its side, the one shown lit in his colour; a tap on the
// enemy's plate hands the target to the next man along the screen, left to right and round again, and the crew's men still to come
// are a count beside the dots.
function hudFocusOn(){return HUD.mode==='port';}
// the enemies the hero can pick, left to right as the screen shows them
function hudFoes(){return foes().filter(f=>targetable(f)).sort((a,b)=>(a.station+a.dep*PSX)-(b.station+b.dep*PSX)||a.idx-b.idx);}
// the enemy plate on show: his target while he has one standing, or the first along; after the last of them, the last one picked
function hudShownFoe(H){const all=hudFoes(),t=S.F[getTgt(H)];if(t&&all.includes(t))return t;if(all.length)return all[0];
  return t&&t.team===1&&!t.npc?t:S.F.find(f=>f.team===1&&!f.npc)||null;}
function hudPager(r,list,cur,next){
  let h='';if(list.length>1||next){h=list.map(f=>`<i${f===cur?' class="on"':''} style="--c:${f.color}"></i>`).join('')+(next&&list.length>1?'<b>›</b>':'');
    const left=next&&typeof crewOn==='function'&&crewOn()&&typeof crewLeft==='function'?crewLeft():0;if(left>0)h+=`<em>+${left}</em>`;}
  let pg=r.querySelector('.fpager');
  if(!h){if(pg)pg.remove();return;}
  if(!pg){pg=document.createElement('div');pg.className='fpager';pg.setAttribute('aria-hidden','true');r.appendChild(pg);}
  if(pg.innerHTML!==h)pg.innerHTML=h;}
function hudFocus(){
  const fr=hudEl('frows');if(!fr||!fr.querySelectorAll)return;const on=hudFocusOn();
  if(HUD.focus!==on){HUD.focus=on;HUD.measAt=0;}
  const rows=fr.querySelectorAll('.frow');
  if(!on){for(const r of rows){r.classList.remove('is-tucked');const pg=r.querySelector('.fpager');if(pg)pg.remove();}return;}
  const H=cmdHero(),T=hudShownFoe(H),fs=hudFoes(),hs=heroes();
  for(const r of rows){const f=r.dataset.i!=null?S.F[+r.dataset.i]:null,show=!!f&&!r.classList.contains('crew-sum')&&(f.team===0?f===H:f===T);
    if(r.classList.contains('is-tucked')===show)r.classList.toggle('is-tucked',!show);if(!show)continue;
    if(f.team===0){hudPager(r,hs.includes(f)?hs:[f],f,false);continue;}
    hudPager(r,fs.includes(f)?fs:[f],f,true);
    const k=fs.indexOf(f),lbl=k>=0&&fs.length>1?`Target ${f.name}, ${k+1} of ${fs.length}: the next one along`:`Target ${f.name}`;if(r.getAttribute('aria-label')!==lbl)r.setAttribute('aria-label',lbl);}}
// a tap on the enemy's plate: the next one along the screen
function hudNextFoe(){const H=cmdHero(),fs=hudFoes();if(fs.length<2)return;const k=fs.indexOf(hudShownFoe(H));setTarget(fs[(k+1)%fs.length].idx);hudFocus();}

V11UI.init.push(()=>{
  hudBuildDock();HUD.built=true;hudApplyMode(hudModeOf(cssW,cssH));hudSetTab('strike');
  {const uc=updateCommands;updateCommands=function(){uc();try{hudAfterCommands();}catch(e){}};}
  {const uo=updateOrder;updateOrder=function(){uo.apply(this,arguments);try{hudPreviewVis();}catch(e){}};}
  V11UI.tick.push(hudFrame);
  // a crowded top bar (five plates or more, with the crew's count) sets its names smaller
  {const br=buildRows;buildRows=function(){br.apply(this,arguments);try{const n=hudEl('frows').children.length,c=n>=6?'2':n>=5?'1':'';const t=hudEl('hudTop');if(t.dataset.crowd!==c)t.dataset.crowd=c;}catch(e){}try{hudFocus();}catch(e){}};}
  {const ut=updateTags;updateTags=function(){ut.apply(this,arguments);try{hudFocus();}catch(e){}};}
  {const am=hudApplyMode;hudApplyMode=function(m){am(m);try{hudFocus();}catch(e){}};}
  // the plates: an enemy's plate picks him as the target, by click or by key
  const fr=hudEl('frows');
  // (upright, where only the target's plate is up, a tap hands the target on to the next man along)
  const pick=r=>{if(HUD.focus)hudNextFoe();else setTarget(+r.dataset.i);};
  fr.addEventListener('click',e=>{const r=e.target&&e.target.closest&&e.target.closest('.frow[data-team="1"]');if(r&&r.dataset.i!=null)pick(r);});
  fr.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const r=e.target&&e.target.closest&&e.target.closest('.frow[data-team="1"]');
    if(r&&r.dataset.i!=null){pick(r);e.preventDefault();e.stopPropagation();}});
  // the drawers
  const side=hudEl('sideCol');side.inert=true;hudEl('logPanel').inert=true;
  hudEl('menuBtn').addEventListener('click',()=>hudMenu(!HUD.menu));
  hudEl('resumeBtn').addEventListener('click',()=>hudMenu(false));
  hudEl('logBtn').addEventListener('click',()=>hudLog(!HUD.log));
  hudEl('logClose').addEventListener('click',()=>hudLog(false));
  hudEl('hudScrim').addEventListener('click',()=>{hudMenu(false);hudLog(false);});
  for(const b of side.querySelectorAll('.drawer-tabs button'))b.addEventListener('click',()=>hudDrawerTab(b.dataset.dtab));
  // a fresh fight from the menu goes straight back to it; the other settings leave the menu up until Resume
  for(const id of ['restart','showcase'])hudEl(id).addEventListener('click',()=>hudMenu(false));
  hudEl('titleBtn').addEventListener('click',()=>{hudMenu(false);if(typeof storyMenu!=='function')return;
    if(S.story&&typeof storyQuit==='function'){storyQuit();restart();}storyMenu(true);});
  hudFullscreen();
  // Escape closes a drawer, or opens the menu (a scene that can be skipped keeps Escape for that); while the menu is up the
  // fight's keys wait with it
  window.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      if(HUD.menu||HUD.log){hudMenu(false);hudLog(false);e.preventDefault();e.stopPropagation();return;}
      if(HUD.state==='title'||HUD.state==='end'||(S.cut&&S.cut.skip)||typingIn(e.target))return;
      hudMenu(true);e.preventDefault();e.stopPropagation();return;}
    if(HUD.menu&&e.key!=='Tab'&&!e.ctrlKey&&!e.metaKey&&!e.altKey)e.stopPropagation();},true);
  // a status refresh updates the drawer's head while it is open
  {const us=updateStatus;updateStatus=function(){us.apply(this,arguments);if(HUD.menu)try{hudDrawerSync();}catch(e){}try{hudFocus();}catch(e){}};}
  hudFrame();hudMeasure();
});
// ===== HUD UI END =====
