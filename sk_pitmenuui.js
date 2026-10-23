// ===== ACT I MENU UI =====
// (loaded ahead of the main UI script; everything here runs only once the UI is up)
// The menu drawer in the Pit (what is open is sk_pitmenu.js's pitMenuOpen): his name at its head with the act and the scene, and a
// tab for each section that is open. Gear: him drawn three ways in what he wears (a1FigDraw, as the crate's screen draws him) and
// each slot, the right arm hatched and marked Missing, and his one hand. Satchel: the purse, the satchel's grid and its weight, his
// hand (a good goes to his hand and back while he walks about) and Tamm's list. Map: the Pit map with him marked. Styles: the style
// cards. Codex: the lab's own codex. Before anything is open the drawer says so and keeps only the way back to the title. A section
// newly open marks the menu button until the menu is next opened (it opens on that section), and a note under the button says so
// once he is the player's again. Outside Act I the drawer is the lab's and the prologue's, as it was.
const PM={built:false,run:undefined,known:null,unseen:[],want:[],newest:null,tab:null,toast:null,note:null,figKey:null,lbl:'Menu'};
const PM_TABS=['gear','satchel','map','styles'];
const PM_HATCH='<svg class="pm-hatch" viewBox="0 0 40 64" aria-hidden="true"><defs><pattern id="pmh" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">'+
  '<line x1="0" y1="0" x2="0" y2="5" stroke="#8a6a2e" stroke-width="1.4"/></pattern></defs>'+
  '<path d="M14 3 C24 1 31 6 30 15 L28 34 C30 40 29 46 27 52 C26 58 23 62 18 62 C13 62 11 58 12 53 L14 36 C10 30 9 22 10 14 C10 8 11 4 14 3 Z" fill="url(#pmh)" stroke="#8a6a2e" stroke-width="1.4" stroke-dasharray="3 2"/></svg>';
function pmOn(){return typeof act1On==='function'&&act1On();}
function pmName(id){const m=PIT_MENU.find(x=>x.id===id);return m?m.name:id;}
V11UI.init.push(()=>{const side=hudEl('sideCol'),tabs=side&&side.querySelector('.drawer-tabs'),foot=side&&side.querySelector('.drawer-foot');if(!side||!tabs||!foot)return;
  // the tabs, ahead of the codex's own
  const cx=tabs.querySelector('[data-dtab="codex"]');
  for(const id of PM_TABS){const b=document.createElement('button');b.type='button';b.setAttribute('role','tab');b.dataset.dtab=id;b.dataset.pm='1';b.setAttribute('aria-selected','false');b.hidden=true;
    b.textContent=pmName(id);tabs.insertBefore(b,cx);b.addEventListener('click',()=>{PM.tab=id;hudDrawerTab(id);pmFill();});}
  if(cx)cx.addEventListener('click',()=>{if(side.dataset.pit)PM.tab='codex';});
  // the sections, ahead of the drawer's foot
  const pane=(id,html)=>{const d=document.createElement('div');d.className='pm-pane pm-'+id;d.dataset.pm=id;d.innerHTML=html;side.insertBefore(d,foot);return d;};
  pane('none','<p class="pm-empty">Nothing yet. What he wears and what he carries will be here once he has them.</p>');
  pane('gear','<canvas class="pm-fig" id="pmFig" width="400" height="260" aria-hidden="true"></canvas><ul class="pm-slots" id="pmSlots"></ul>');
  pane('satchel','<div class="pm-bagbox"><p class="a1-purse" id="pmPurse"></p><div class="a1-bag" id="pmBag"></div><p class="a1-wt" id="pmWt"></p><div class="a1-handrow" id="pmHand"></div>'+
    '<p class="pm-note" id="pmBagNote" aria-live="polite"></p></div><h2 class="pm-h">Tamm’s list</h2><ul class="pm-list" id="pmList"></ul>');
  pane('map','<div class="pm-mapbox" id="pmMap"></div><p class="pm-cap">The stair-streets go up to the Shelf. The ladders are shorter and need two hands.</p>');
  pane('styles','<p class="a9-lead">What he has, what he lost, and what comes back.</p><div class="a9-cards" id="pmCards"></div>');
  // the satchel: a good to his hand, his hand's good into the satchel (while he walks about; not in a fight or a scene)
  side.querySelector('.pm-satchel').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(!(exOn()&&!S.cut)){PM.note='Not now';pmBag();return;}
    PM.note=b.dataset.tohand!=null?errandToHand(+b.dataset.tohand):b.dataset.tobag!=null?errandToBag():null;pmBag();});
  // the note under the menu button
  const t=stEl('div','pm-toast'),host=document.body||hudEl('wrap');t.id='pmToast';t.hidden=true;t.setAttribute('role','status');if(host)host.appendChild(t);PM.toastEl=t;
  PM.built=true;});
// the tabs shown: in the Pit those of the sections open (the codex's too only once it is), elsewhere the drawer's own
function pmTabsShow(open){const side=hudEl('sideCol'),tabs=side.querySelector('.drawer-tabs'),pit=!!side.dataset.pit;let n=0;
  for(const b of tabs.querySelectorAll('button')){const id=b.dataset.dtab;
    if(b.dataset.pm){const on=pit&&open.includes(id);if(b.hidden===on)b.hidden=!on;if(on)n++;}
    else if(id==='codex'){const on=!pit||open.includes('codex');if(b.hidden===on)b.hidden=!on;if(on&&pit)n++;}}
  tabs.style.gridTemplateColumns=pit?`repeat(${Math.max(1,n)},minmax(0,1fr))`:'';tabs.dataset.n=pit?String(n):'';}
// the drawer's head and its tab, in the Pit
{const ds=hudDrawerSync;hudDrawerSync=function(){const side=hudEl('sideCol');if(!PM.built||!side)return ds.apply(this,arguments);
  const ttl=side.querySelector('.drawer-title');
  if(!pmOn()){if(side.dataset.pit){delete side.dataset.pit;pmTabsShow([]);if(ttl)ttl.textContent='Paused';}return ds.apply(this,arguments);}
  const open=pitMenuOpen().map(m=>m.id);side.dataset.story='1';side.dataset.pit='1';pmTabsShow(open);if(ttl&&ttl.textContent!==HERO_NAME)ttl.textContent=HERO_NAME;
  const sc=pitScene(act1Stage()),sub=hudEl('drawerSub');if(sub)sub.textContent='Act I'+(sc&&sc.num?' · Scene '+sc.num:'')+(sc&&sc.title?' · '+sc.title:'');
  // the section: one newly open first, else the one he last chose, else the first
  const t=PM.newest&&open.includes(PM.newest)?PM.newest:PM.tab&&open.includes(PM.tab)?PM.tab:open[0]||'none';PM.newest=null;
  if(HUD.dtab!==t)hudDrawerTab(t);pmFill();};}
// opened: what was new has been seen, and the note goes
{const hm=hudMenu;hudMenu=function(on){const was=HUD.menu;hm.apply(this,arguments);if(!PM.built)return;
  if(HUD.menu&&!was){PM.unseen=[];PM.want=[];PM.note=null;if(PM.toastEl)PM.toastEl.hidden=true;PM.toast=null;pmBadge();}};}
function pmFill(){const side=hudEl('sideCol');if(!side||!side.dataset.pit)return;const t=HUD.dtab;
  try{if(t==='gear')pmGear();else if(t==='satchel')pmBag();else if(t==='map')pmMap();else if(t==='styles')pmStyles();}catch(e){console.error('menu '+t,e);}}
// what his one hand holds: what he carries about, a good from the errand, or the blade he fights with
function pmHand(){const E=S.ex,K=hero();if(E&&E.on)return E.hand?E.hand.name:null;
  const er=S.act1&&S.act1.errand;if(er&&er.hand&&GOODS[er.hand])return GOODS[er.hand].name;
  if(K&&K.weaponKey&&typeof ARMS_NAME!=='undefined'&&ARMS_NAME[K.weaponKey]&&S.story&&S.story.step==='fight')return ARMS_NAME[K.weaponKey];return null;}
function pmGear(){const K=hero();if(!K)return;const kit=kitOf(),wear=K.wear&&typeof K.wear==='object'?K.wear:kitWear(kit);
  const row=(k,v,w,cls='')=>`<li class="pm-slot${cls}"><span class="pm-k">${k}</span><span class="pm-v">${v}</span>${w?`<span class="pm-w">${w}</span>`:''}</li>`;
  const rows=KIT_SLOTS.map(s=>{const it=kitItem(s,kit[s]);return row(KIT_NAMES[s],it.name,it.what);});
  rows.push(row('Right arm',PM_HATCH+'<span>Missing</span>',wear.pinned?'The sleeve pinned up.':'The sleeve hangs empty.',' pm-miss'));
  const h=pmHand();rows.push(row('Hand',h||'Free',h?'His one hand is full.':'His one hand.',h?'':' pm-free'));
  const L=hudEl('pmSlots'),html=rows.join('');if(L.innerHTML!==html)L.innerHTML=html;
  // (him drawn again only when what he wears or the room for him has changed)
  const cv=hudEl('pmFig'),r=cv.getBoundingClientRect(),key=JSON.stringify(wear)+'|'+Math.round(r.width)+'x'+Math.round(r.height);if(PM.figKey!==key){PM.figKey=key;a1FigDraw(cv,wear);}}
function pmBag(){const E=S.act1&&S.act1.errand,el=hudEl;if(!E)return;const live=exOn()&&!S.cut,C=SATCHEL.cols,G=satchelGrid(E.bag)||{items:[]};
  el('pmPurse').textContent=`Coin ${E.coin} · Chits ${E.chits}`;
  el('pmBag').innerHTML=Array.from({length:SATCHEL.cols*SATCHEL.rows},(_,i)=>`<span class="a1-cell" style="grid-column:${i%C+1};grid-row:${Math.floor(i/C)+1}"></span>`).join('')+
    G.items.map(it=>`<button type="button" class="a1-item" data-tohand="${it.i}" style="grid-column:${it.cell%C+1}/span ${it.n};grid-row:${Math.floor(it.cell/C)+1}"${live?' title="Carry in hand"':' disabled'}>${GOODS[it.id].name}</button>`).join('');
  el('pmWt').textContent=`Weight ${satchelWeight(E.bag)} of ${SATCHEL.wt}`;
  el('pmHand').innerHTML=E.hand?`<span class="a1-hand-k">Hand</span><span class="a1-hand-v">${GOODS[E.hand].name}</span><button type="button" class="a1-buy" data-tobag="1"${live?'':' disabled'}>Into the satchel</button>`
    :'<span class="a1-hand-k">Hand</span><span class="a1-hand-v a1-free">Free</span>';
  el('pmBagNote').textContent=PM.note||'';
  el('pmList').innerHTML=ERRAND_LIST.map(l=>`<li class="${E.got[l.id]?'got':''}"><span class="pm-tick" aria-hidden="true"></span><span class="pm-li">${l.name}</span><span class="pm-st">${E.got[l.id]?'Got':''}</span></li>`).join('');}
// where he is on the map: the stage's own place, the stair-street for the fights on it, else the yard
function pmMap(){const k=S.story&&S.story.key,at=PITMAP_AT[k]||{toll:'stairs',tamm:'stairs'}[k]||'yard';const M=hudEl('pmMap'),html=a1MapSvg(at);if(M.innerHTML!==html)M.innerHTML=html;}
function pmStyles(){const C=hudEl('pmCards'),html=a9CardsHtml();if(C.innerHTML!==html)C.innerHTML=html;}
// the menu button marked while a section newly open has not been seen
function pmBadge(){const mb=hudEl('menuBtn');if(!mb||!mb.dataset)return;const on=PM.unseen.length>0&&pmOn()?'1':'';if((mb.dataset.new||'')!==on){if(on)mb.dataset.new=on;else delete mb.dataset.new;}
  const lbl=on?'Menu, new: '+PM.unseen.map(pmName).join(', '):'Menu';if(PM.lbl!==lbl&&mb.setAttribute){PM.lbl=lbl;mb.setAttribute('aria-label',lbl);}}
// he is the player's: walking about, or his turn in a fight; no scene, card, line or screen over it
function pmFree(){if(S.cut||S.card||S.say||S.paused||HUD.menu)return false;const A=S.act1;
  if(A&&((A.gear&&A.gear.open)||(A.map&&A.map.open)||(A.shop&&A.shop.open)||(A.styles&&A.styles.open)))return false;
  if(exOn())return true;const g=S.game;return!!S.story&&S.story.step==='fight'&&g&&g.phase==='input'&&typeof isAI==='function'&&!isAI(g.active)&&!S.opening;}
// (under the menu button, and under what else sits at the top there: the goal's box, the lesson's box, the fighters' plates)
function pmToast(text){const t=PM.toastEl,mb=hudEl('menuBtn');if(!t||!mb)return;const r=mb.getBoundingClientRect();let top=r.bottom;
  for(const e of document.querySelectorAll('.ex-goal,.a9-goal,.frow,#turnOrder,.order')){if(e.hidden||!e.getBoundingClientRect)continue;const q=e.getBoundingClientRect(),cs=getComputedStyle(e);
    if(q.height>0&&q.top<r.bottom+60&&cs.visibility!=='hidden'&&cs.display!=='none')top=Math.max(top,q.bottom);}
  t.textContent=text;t.style.left=Math.round(Math.max(8,r.left))+'px';t.style.top=Math.round(top+8)+'px';t.hidden=false;PM.toast={t0:S.t};}
V11UI.tick.push(()=>{if(!PM.built)return;
  // a run of the story starts over what is known (S.act1 is the run's record of the Pit)
  const run=S.story?S.act1||null:undefined;if(run!==PM.run){PM.run=run;PM.known=null;PM.unseen=[];PM.want=[];PM.tab=null;}
  const open=pmOn()?pitMenuOpen().map(m=>m.id):[];
  // (what is open when he first comes into the Pit, or when a chapter starts, is new to the button but needs no note)
  if(PM.known===null){if(pmOn()){PM.known=new Set(open);PM.unseen=open.slice();PM.newest=open[open.length-1]||null;}}
  else{const fresh=open.filter(id=>!PM.known.has(id));if(fresh.length){for(const id of fresh)PM.known.add(id);PM.unseen.push(...fresh);PM.want.push(...fresh);PM.newest=fresh[fresh.length-1];}}
  pmBadge();
  if(PM.want.length&&pmOn()&&pmFree()){pmToast('New in the menu: '+PM.want.map(pmName).join(', '));PM.want=[];}
  if(PM.toast&&(S.t-PM.toast.t0>4.5||!pmOn()||HUD.menu)){PM.toastEl.hidden=true;PM.toast=null;}});
// ===== ACT I MENU UI END =====
