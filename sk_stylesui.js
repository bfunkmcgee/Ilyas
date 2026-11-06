// ===== STYLES UI START =====
// (since V94) The styles on the page: the chip on the stance bar that changes his style on his turn (V), the style's meter beside the
// balance pips on his plate and on the chip, its name on his plate's line, a callout and a line in the log when he changes it, the
// meter's changes in the log, the Long count's callout, and the style cards from the registry (sk_styles.js): the styles screen and
// the menu's Styles in the Pit, and a Styles tab of the menu in the prologue and the lab (the styles he has, with his level in each,
// its meter, its moves by rank and its signature).
const STYUI={plate:'',chip:'',picked:false,on:[]};
function styEsc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function styPips(m,cls){if(!m||!m.max)return'';return`<span class="${cls}" aria-hidden="true">`+Array.from({length:m.max},(_,i)=>`<i${i<m.n?' class="on"':''}></i>`).join('')+'</span>';}
// ---------- the chip on the stance bar ----------
// (shown while he has two styles or more to fight in with what he holds: the next one in turn is the one a tap takes)
function styChipHtml(K){const ks=stylesFor(K);if(ks.length<2)return'';const cur=styleOf(K),nxt=ks[(ks.indexOf(cur)+1)%ks.length],m=meterOf(K);
  const can=styleCanSwitch(K)&&!isAI(K.idx),d=STYLES[cur],n=STYLES[nxt];
  return`<button type="button" class="sty-b" data-style="${nxt}"${can?'':' disabled'} title="${styEsc(d.name+': '+d.doctrine+' Switch to '+n.name+' (V): +'+STYLE_SW.tempo+' tempo, and the meter empties.')}" `+
    `aria-label="Style: ${styEsc(d.name)}. Switch to ${styEsc(n.name)}"><span class="sty-n">${styEsc(d.short)}</span><small>${styPips(m,'sty-m')}<span class="sty-x">⇄ ${styEsc(n.short)}</span></small></button>`;}
{const sb=stnBarHtml;stnBarHtml=function(){const h=sb.apply(this,arguments);if(!h)return h;const K=hero(),c=K?styChipHtml(K):'';return c?c+h:h;};}
function styPick(k){const K=hero();if(!K||isAI(K.idx))return;if(typeof ensureAudio==='function')ensureAudio();
  if(setStyle(K,k)){updateStatus();if(typeof stnUiNow==='function')stnUiNow();}}
function styNext(){const K=hero();if(!K)return;const ks=stylesFor(K);if(ks.length<2)return;const cur=styleOf(K);styPick(ks[(ks.indexOf(cur)+1)%ks.length]);}

// ---------- the plates ----------
// a style's meter beside the balance pips, on his plate and on the plate of any man with one (since V95: the guards' Cover); the
// style's name on the plate's line (desktop): his when it is not his own, and an enemy's style (the Order drill)
// (the row is rebuilt with the plates, so the meter goes with it: kept on the row itself)
function styPlate(){for(const f of S.F)if(f)styPlateFor(f);}
// (its width on the row, --fmw: an upright phone's plate keeps its dots and chevron clear of it, sk_css_styles.css)
function styPlateFor(K){const fr=K&&!K.dead&&document.getElementById('fr'+K.idx);if(!fr)return;const m=meterOf(K),key=m&&m.max?m.k+'|'+m.n+'|'+m.max:'';
  let el=fr._fm||null;if(!key){if(el&&!el.hidden)el.hidden=true;return;}
  if(!el){el=document.createElement('span');el.className='fmeter';el._k='';if(fr.appendChild)fr.appendChild(el);fr._fm=el;}
  if(el.hidden)el.hidden=false;if(el._k!==key){el._k=key;el.innerHTML=styPips(m,'fm-p');el.title=`${m.name} ${m.n} of ${m.max}`;
    if(fr.style&&fr.style.setProperty)fr.style.setProperty('--fmw',(m.max*7-3)+'px');}}
{const br=buildRows;buildRows=function(){const r=br.apply(this,arguments);styPlate();return r;};}
{const us=updateStatus;updateStatus=function(){const r=us.apply(this,arguments);styPlate();const K=hero();
  for(const f of S.F){const el=f?$('meta'+f.idx):null,k=f&&!f.dead?styleOf(f):null;if(!el||!k||(f===K?k==='sareth':!STYLES[k].enemy))continue;
    if(el.textContent.indexOf(STYLES[k].short)!==0)el.textContent=STYLES[k].short+' · '+el.textContent;}
  return r;};}

// ---------- the cards ----------
// what keeps him from a style, or where he stands in it, as the card's corner says it
function styleNow(K,k){const d=STYLES[k];
  if(d.lessons){const known=K&&K.styleMoves||(typeof shKnown==='function'&&shKnown())||{},n=d.lessons.filter(m=>known[m.key]).length;
    return styleRank(styleLevelFor(K,k))+(n>=d.lessons.length?', all lessons':', learning');}
  const why=styleNeeds(K,k);if(why==='needs the gilt'||why==='the blade will not lock')return'Dark: '+why;if(why)return'Locked: '+why;
  if(styleBadly(K,k))return'Works badly: the scrap arm';
  return styleRank(styleLevelFor(K,k))+(styleOf(K)===k?', in use':', ready');}
function styleCls(K,k){const d=STYLES[k],why=d.lessons?'':styleNeeds(K,k);
  if(d.lessons||styleOf(K)===k)return'on';if(why==='needs the gilt'||why==='the blade will not lock')return'dark';return why?'locked':'';}
// a card: the name and its corner, the weapon, the origin, the doctrine, how it looks, his level in it, the meter, and the moves (by
// lesson or rank)
function styleCardHtml(K,k){const d=STYLES[k],L=styleLevelFor(K,k);
  let moves='';
  if(d.lessons){const known=K&&K.styleMoves||(typeof shKnown==='function'&&shKnown())||{};
    moves='<ul class="a9-moves">'+d.lessons.map(m=>`<li class="${known[m.key]?'got':''}" title="${styEsc(m.what)}"><span class="a9-m">${m.name}</span><span class="a9-l">${known[m.key]?'learned':'Lesson '+m.lesson}</span></li>`).join('')+'</ul>';}
  else if(d.ranks.length)moves='<ul class="a9-moves">'+d.ranks.map(r=>`<li class="${L>=r.level?'got':''}${r.key===d.signature?' sig':''}" title="${styEsc(r.what)}"><span class="a9-m">${r.name}</span><span class="a9-l">${styleRank(r.level)}</span></li>`).join('')+'</ul>';
  const meter=d.meter?`<p class="a9-mt"><b>${d.meter.name}</b>, 0 to ${d.meter.cap[d.meter.cap.length-1][1]}: ${styEsc(d.meter.what)}</p>`:'';
  const master=d.mastery?`<p class="a9-ms">Mastered: ${styEsc(d.mastery.what)}</p>`:'';
  const lv=typeof styleLine==='function'?styleLine(k):'';
  return`<section class="a9-card ${styleCls(K,k)}" data-style="${k}"><div class="a9-c-head"><h3>${d.name}</h3><span class="a9-now">${styleNow(K,k)}</span></div>`+
    `<p class="a9-w">${d.weapon}</p><p class="a9-o">${d.origin}</p><p class="a9-dc">${styEsc(d.doctrine)}</p><p class="a9-wh">${styEsc(d.what)}</p>${lv}${meter}${moves}${master}</section>`;}
function styleCardsHtml(keys){const K=hero();return keys.map(k=>styleCardHtml(K,k)).join('');}
// the styles a card shows: in the Pit all three (what he has, what he lost, and what comes back); elsewhere the ones he has
function styleCardKeys(){const K=hero();if(typeof act1On==='function'&&act1On())return heroStyles();return heroStyles().filter(k=>styleKnown(K,k));}

// ---------- the menu's Styles, in the prologue and the lab ----------
function styTabOn(){const side=hudEl('sideCol');return!!side&&!side.dataset.pit&&!!hero()&&styleCardKeys().length>0&&HUD.state!=='title';}
function styTabSync(){const side=hudEl('sideCol');if(!side)return;const on=styTabOn(),b=side.querySelector('.drawer-tabs [data-dtab="styles"]');
  if(on){if(side.dataset.styles!=='1')side.dataset.styles='1';if(b&&b.hidden)b.hidden=false;}
  else if(side.dataset.styles){delete side.dataset.styles;if(b&&!side.dataset.pit)b.hidden=true;if(HUD.dtab==='styles'&&!side.dataset.pit)hudDrawerTab(S.story?'codex':'fight');}}
function styTabFill(){const C=hudEl('pmCards');if(!C)return;const html=styleCardsHtml(styleCardKeys());if(C.innerHTML!==html)C.innerHTML=html;
  const lead=C.parentNode&&C.parentNode.querySelector?C.parentNode.querySelector('.a9-lead'):null;
  if(lead){const t=typeof act1On==='function'&&act1On()?'What he has, what he lost, and what comes back.':'How he fights: each style its own, with its own level.';if(lead.textContent!==t)lead.textContent=t;}}
// (in the prologue the drawer opens on the codex, as it always has: the Styles tab, once chosen, holds while the menu stays open)
{const ds=hudDrawerSync;hudDrawerSync=function(){const want=HUD.dtab==='styles'&&STYUI.picked;const r=ds.apply(this,arguments);styTabSync();
  if(want&&styTabOn()&&HUD.dtab!=='styles')hudDrawerTab('styles');if(HUD.dtab==='styles'&&styTabOn())styTabFill();return r;};}
{const dt=hudDrawerTab;hudDrawerTab=function(t){const r=dt.apply(this,arguments);if(t==='styles'&&styTabOn()){STYUI.picked=!!HUD.menu;styTabFill();}return r;};}
{const hm=hudMenu;hudMenu=function(){const was=HUD.menu,r=hm.apply(this,arguments);if(HUD.menu!==was)STYUI.picked=false;return r;};}
// the styles screen and the Pit menu's Styles: the registry's cards
{const pm=pmStyles;pmStyles=function(){styTabFill();};}

// ---------- the moments ----------
V11UI.init.push(()=>{const E=typeof STNUI!=='undefined'?STNUI.el:null,bar=E&&E.bar;
  if(bar)bar.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.sty-b');if(b&&!b.disabled)styPick(b.dataset.style);});
  document.addEventListener('keydown',e=>{if(typeof typingIn==='function'&&typingIn(e.target)||e.ctrlKey||e.metaKey||e.altKey||S.opening||(typeof exOn==='function'&&exOn()))return;
    if(e.key&&e.key.toLowerCase()==='v'&&HUD.state==='play'){styNext();e.preventDefault();}});
  // a style taken: its name over him, the blade's sound, and a line in the log
  const sh=S.hooks.style;S.hooks.style=function(K,k,was){if(sh)sh.apply(this,arguments);const d=STYLES[k];
    S.callouts.push({i:K.idx,text:d.name,age:0,life:1.2,dx:0,dy:-26});S.hooks.sound('shing',.6);
    const li=newEntry(false);li.innerHTML=`<div class="lg-l">${who(K)}<span>fights in ${styEsc(d.name)}</span></div><div class="lg-perf">${styEsc(d.doctrine)} +${STYLE_SW.tempo} tempo${was&&meterOf(K)?'; the meter starts empty':''}</div>`;pushEntry(li);
    styPlate();if(typeof stnUiNow==='function')stnUiNow();};
  // the meter: each change of his in the log, under the exchange it came of (another man's shows on his plate alone)
  const mh=S.hooks.meter;S.hooks.meter=function(f,k,n,was,why){if(mh)mh.apply(this,arguments);const d=STYLES[k];if(!d||!d.meter||S.warming)return;
    if(f!==hero()){styPlateFor(f);return;}
    const full=n>0&&n>=meterMax(f,k);logNote(f,n>0?`${d.meter.name} ${n}${full?', full':''}`:`${d.meter.name} gone`,why||null);styPlate();if(typeof stnUiNow==='function')stnUiNow();};
  // a style only the others fight in, taken: one line for all who take it at once (the guards' batons out), with its doctrine
  const so=S.hooks.styleOn;S.hooks.styleOn=function(f,k){if(so)so.apply(this,arguments);if(!S.warming)STYUI.on.push({f,k});};
  // the Long count: its name over him as he goes
  const wh=S.hooks.wire;S.hooks.wire=function(ev,o){if(wh)wh.apply(this,arguments);if(ev==='long'&&o&&o.A)S.callouts.push({i:o.A.idx,text:'Long count',age:0,life:1.1,dx:-(o.A.facing||1)*20,dy:-20});};});
V11UI.tick.push(()=>{if(!STYUI.on.length)return;const L=STYUI.on.splice(0);
  for(const k of [...new Set(L.map(o=>o.k))]){const d=STYLES[k],F=L.filter(o=>o.k===k).map(o=>o.f),N=F.map(f=>who(f));
    const list=N.length>1?N.slice(0,-1).join(', ')+' and '+N[N.length-1]:N[0];
    // (the names in one piece: the line's gap would open before each comma)
    const li=newEntry(false);li.innerHTML=`<div class="lg-l"><span>${list}</span><span>${F.length>1?'fight':'fights'} in the ${styEsc(d.name)}</span></div><div class="lg-perf">${styEsc(d.doctrine)}</div>`;pushEntry(li);}
  styPlate();});
// ===== STYLES UI END =====
