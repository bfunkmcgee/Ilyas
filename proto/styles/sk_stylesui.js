// ===== STYLES UI (test) START =====
// The style trial's page. The Motion button under the top bar opens the panel: the style Kael moves in (Regular, the Sareth cut,
// the Wire drill), a blow to watch (a cut, a thrust, an overhead or a low sweep, landing, blocked or slipped, with or without his
// flourish), at full speed or slowed; Again plays it once more. A fight starts the lab's own fight with Kael in the style picked, and
// Compare sets the three styles side by side at the same moments of the same blow.
const SUI={el:{},open:false,t:0};
const SUI_STYLES=[
  ['regular','Regular','Everyone else’s motion. The full windup and follow-through, no style.'],
  ['tactical','The Sareth cut','Thirty years of Eclipsera enforcement. A tight guard, short windups, a small follow-through and a quick return; a glance round the room after a kill. His motion today.'],
  ['wire','Wire drill','Noon Company, on the Confederacy’s border wire, the 2270s. The blade out on the line, the feet wide and low, every cut thrown whole and carried through, the finish held a beat.']];
const SUI_BLOWS=[['slash','Cut'],['thrust','Thrust'],['overhead','Overhead'],['sweep','Low sweep']];
const SUI_OUTS=[['hit','Lands'],['block','Blocked'],['dodge','Slipped']];
const SUI_X='<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2 L10 10 M10 2 L2 10"></path></svg>';
function suiStyle(){return SLAB.style||'tactical';}
function suiName(k){const s=SUI_STYLES.find(x=>x[0]===k);return s?s[1]:k;}
function suiHtml(){const cur=suiStyle(),o=(g,v,on,l)=>`<button type="button" class="su-o" data-g="${g}" data-v="${v}" aria-pressed="${on}">${l}</button>`;
  return`<div class="su-in" role="dialog" aria-label="Motion styles"><div class="su-head"><span>Motion styles</span><button type="button" class="su-x" aria-label="Close">${SUI_X}</button></div>`+
    `<p class="su-how">The same blow in each style. A style changes how he moves and nothing else: the dice, the tempo and the man he fights are the same.</p>`+
    `<div class="su-styles">${SUI_STYLES.map(([k,l,d])=>`<button type="button" class="su-st" data-g="style" data-v="${k}" aria-pressed="${cur===k}"><b>${l}</b><small>${d}</small></button>`).join('')}</div>`+
    `<div class="su-g"><span>Blow</span>${SUI_BLOWS.map(([k,l])=>o('kind',k,SLAB.kind===k,l)).join('')}</div>`+
    `<div class="su-g"><span>It is</span>${SUI_OUTS.map(([k,l])=>o('out',k,SLAB.out===k,l)).join('')}</div>`+
    `<div class="su-g"><span>Flourish</span>${o('flourish','0',!SLAB.flourish,'Plain')}${o('flourish','1',SLAB.flourish,'His spin')}</div>`+
    `<div class="su-g"><span>Speed</span>${o('slow','0',!S.userSlow,'Full')}${o('slow','1',!!S.userSlow,'Slowed')}</div>`+
    `<div class="su-foot"><button type="button" class="su-b su-fight">A fight</button><button type="button" class="su-b su-cmp">Compare</button><button type="button" class="su-go">Watch</button></div></div>`;}
function suiShow(on){const E=SUI.el;SUI.open=on;E.panel.hidden=!on;S.paused=on;if(on)E.panel.innerHTML=suiHtml();}
function suiPick(g,v){
  if(g==='style')SLAB.style=v;
  if(g==='kind')SLAB.kind=v;
  if(g==='out')SLAB.out=v;
  if(g==='flourish')SLAB.flourish=v==='1';
  if(g==='slow')S.userSlow=v==='1';
  SUI.el.panel.innerHTML=suiHtml();suiLabel();}
function suiLabel(){const E=SUI.el;if(!E.btn)return;E.btn.innerHTML=`<span>Motion</span><b>${suiName(suiStyle())}</b>`;E.again.hidden=!SLAB.on;}
function suiWatch(){suiShow(false);slabBlow(SLAB.kind,SLAB.out);suiLabel();}
function suiFight(){suiShow(false);SLAB.on=false;S.userSlow=false;S.introOn=true;S.auto=false;S.cfg.n=2;S.cfg.crew=false;S.cfg.ally.on=false;S.arenaKey='street';S.tableOn=true;
  S.cfg.foes[0]={...S.cfg.foes[0],weapon:'axe',skill:3,temper:'brute'};S.F=[];restart();suiLabel();}
function suiCompare(){suiShow(false);SUI.el.cmp.hidden=false;S.paused=true;}
// the button and Again sit under the top bar, whatever covers the top of the screen
function suiPlace(){const E=SUI.el,st=hudEl('stageWrap');if(!E.btn||!st)return;const R=st.getBoundingClientRect();let b=0;
  for(const el of [hudEl('hudTop'),...document.querySelectorAll('.wrap.hud .frow')]){if(!el||!el.offsetParent)continue;const r=el.getBoundingClientRect();if(r.height>0&&r.top<R.top+R.height*.4)b=Math.max(b,r.bottom-R.top);}
  const top=Math.round(b+8)+'px';if(E.btn.style.top!==top){E.btn.style.top=top;E.again.style.top=top;}}
V11UI.tick.push(()=>{const now=performance.now();if(now-SUI.t<150)return;SUI.t=now;suiPlace();});
V11UI.init.push(()=>{
  // (the trial opens on its stage, not on the story's title)
  if(typeof storyMenu==='function')storyMenu(false);
  const wrap=$('wrap');if(!wrap)return;
  const btn=document.createElement('button');btn.type='button';btn.className='su-btn';wrap.appendChild(btn);
  const again=document.createElement('button');again.type='button';again.className='su-again';again.textContent='Again';again.hidden=true;wrap.appendChild(again);
  const panel=document.createElement('div');panel.className='su-panel';panel.hidden=true;wrap.appendChild(panel);
  const cmp=document.createElement('div');cmp.className='su-panel su-cmpsheet';cmp.hidden=true;
  cmp.innerHTML=`<div class="su-in su-cmp-in" role="dialog" aria-label="Side by side"><div class="su-head"><span>Side by side</span><button type="button" class="su-x" aria-label="Close">${SUI_X}</button></div>`+
    `<p class="su-how">The same blow in each style, landing, at the same moments of it: the guard, the windup, the impact, the follow-through, and back.</p>`+
    SUI_BLOWS.map(([k,l])=>`<figure class="su-fig"><figcaption>${l}</figcaption><div class="su-scroll"><picture><source media="(max-width: 640px)" srcset="sheets/${k}_tall.jpg">`+
      `<img loading="lazy" alt="${l} in the three styles" src="sheets/${k}.jpg"></picture></div></figure>`).join('')+`</div>`;
  wrap.appendChild(cmp);
  SUI.el={wrap,btn,again,panel,cmp};
  btn.addEventListener('click',()=>suiShow(!SUI.open));
  again.addEventListener('click',()=>{slabBlow(SLAB.kind,SLAB.out);});
  panel.addEventListener('click',e=>{if(e.target===panel||e.target.closest('.su-x')){suiShow(false);return;}
    if(e.target.closest('.su-go')){suiWatch();return;}if(e.target.closest('.su-fight')){suiFight();return;}if(e.target.closest('.su-cmp')){suiCompare();return;}
    const o=e.target.closest('[data-g]');if(o)suiPick(o.dataset.g,o.dataset.v);});
  cmp.addEventListener('click',e=>{if(e.target===cmp||e.target.closest('.su-x')){cmp.hidden=true;S.paused=false;}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(SUI.open)suiShow(false);if(!cmp.hidden){cmp.hidden=true;S.paused=false;}}});
  suiLabel();});
// it opens on the stage, once the page is up: the Sareth cut's cut, landing
V11UI.tick.push(()=>{if(SUI.started)return;SUI.started=true;SLAB.style='tactical';slabBlow('slash','hit');suiLabel();});
// ===== STYLES UI (test) END =====
