// ===== FLOW UI =====
// (loaded after the other UI files and ahead of the main UI script; everything that touches the page runs once the UI is up)
// A trial of a quicker fight and a smaller HUD (since Nov 10; on the branch claude/flow-test, asked for: a test fight to try before
// any of it goes into the game). All of it is off in the game's own page: FLOW.on is true only in a page built as the flow test
// (tools/flow_test.py sets FLOW_TEST ahead of the script), which opens straight on a lab fight with a Test panel to switch each
// part on and off. The parts:
//   quick    an answer to a blow is a row of chips and the blow keeps coming: the window is short, time runs at a fifth, not a
//            twelfth, and if the player lets it go Ilyas answers by his own read, as he always has when the window ran out. The
//            chip he would take is marked from the start (the dice his read throws are the ones a hero on auto throws).
//   follow   a routine opening (a riposte, a counter, a stop-hit ...) plays through the same way: the chips, his own pick marked,
//            a second to change it. The big ones (a man Broken, a Flow link, a hold, a tandem) keep the full card and the slow time.
//   dock     the upright phone's dock and top bar made smaller: two-line moves, the stances and the style on one row, a one-line tip.
//   labels   an enemy's plan over his head as one short line (the blow and how many of your moves away).
//   build    motion by build (sk_anim.js ANIM_BUILD): heavy men swing bigger and recover slower, slight men are quicker, a goblin
//            by its kind; and a better man uses a blow's plain variant less.
//   fine     the finer figures (FigKit.fine, sk_figui.js; asked for: the character models' drawing improved): hands with fingers,
//            shaped boots, faces with planes to them, a rim that narrows as it turns from the light. Drawing only.
// The rules are not changed: every prompt is still offered, with the same choices at the same costs.
const FLOW={on:!!(typeof window!=='undefined'&&window.FLOW_TEST),quick:true,follow:true,dock:true,labels:true,build:true,fine:true,
  ans:{dur:[1.15,1.55],scale:.22},fol:{dur:.95,scale:.28},
  routine:['stop','dodgeOver','parry','brace','dodge','hit','fumble','counter','block'],
  parts:[['quick','Quick answers','A row of chips; the blow keeps coming'],['follow','Follow-ups play through','A full card only for Broken, Flow and holds'],
    ['dock','Compact HUD','Smaller dock and top bar (upright phone)'],['labels','Short enemy labels','The blow and how many moves away'],
    ['build','Motion by build','Heavy men slower and bigger, slight men quicker'],['fine','Finer figures','Hands, boots and faces drawn finer']],
  rosters:[['Elf and his crew','Qadir, a Veteran with an axe, and his crew as they come'],['Three elves','Qadir, Brask and Iyla'],['Goblin pack','A runt, a skulker and a brute']],
  roster:0,booted:false,stat:{n:0,wait:0,big:0,t:0},panel:null,btn:null};
function flowIs(k){return FLOW.on&&!!FLOW[k];}
// a prompt that plays through: the answer to a blow, or a routine opening; only the player's own hero's
function flowKind(o){if(!FLOW.on||!o||!o.f||o.f.team!==0||isAI(o.f.idx))return null;
  if(o.source==='react')return FLOW.quick?'ans':null;
  return FLOW.follow&&FLOW.routine.includes(o.source)?'fol':null;}
// an enemy's plan in one line: the blow, and how many of the player's moves away it is
function flowLabel(f,it,a,b){if(!flowIs('labels'))return null;const w=f._when||'',m=/after (\d+)/.exec(w);
  const when=w==='acting now'?'now':/^before/.test(w)?'next':/^after your next/.test(w)?'in 1':m?'in '+m[1]:'';
  const nm=it.cmd==='wait'?'Hold':(ACTIONS[it.cmd]&&ACTIONS[it.cmd].name)||it.cmd;
  return{a:'▸ '+nm+(when?' · '+when:''),b:f._back?'at your back':''};}
function flowSave(){try{const o={roster:FLOW.roster};for(const p of FLOW.parts)o[p[0]]=!!FLOW[p[0]];localStorage.setItem('sk_flow',JSON.stringify(o));}catch(e){}}
function flowLoad(){try{const o=JSON.parse(localStorage.getItem('sk_flow')||'null');if(!o)return;for(const p of FLOW.parts)if(typeof o[p[0]]==='boolean')FLOW[p[0]]=o[p[0]];
  if(o.roster>=0&&o.roster<FLOW.rosters.length)FLOW.roster=o.roster|0;}catch(e){}}
// the parts as they are now, put on the page: the stylesheet's switches, the motion, and the HUD measured again
function flowApply(){if(!FLOW.on)return;const wr=document.getElementById('wrap');
  if(wr&&wr.dataset)wr.dataset.flow=['quick','follow','dock','labels'].filter(k=>FLOW[k]).join(' ');
  ANIM_BUILD.on=!!FLOW.build;if(typeof FigKit!=='undefined')FigKit.fine=!!FLOW.fine;
  if(typeof HUD!=='undefined'){HUD.measAt=0;HUD.cardH=HUD.cardAH=0;}}
// the test's fights, in the lab's street
function flowStart(i){
  FLOW.roster=i=clamp(i|0,0,FLOW.rosters.length-1);flowSave();
  if(S.story&&typeof storyQuit==='function')storyQuit();
  if(typeof storyMenu==='function')storyMenu(false);document.body.classList.remove('story');
  S.auto=false;S.showcase=false;S.arenaKey='street';S.tableOn=true;S.divOn=false;S.cfg.ally.on=false;S.cfg.hero.weapon='elven';
  const foes=S.cfg.foes;
  if(i===0){S.cfg.n=1;S.cfg.crew=true;Object.assign(foes[0],{seed:5113,weapon:'axe',skill:3,temper:'brute'});}
  else if(i===1){S.cfg.n=3;S.cfg.crew=false;Object.assign(foes[0],{seed:5113,weapon:'axe',skill:3,temper:'brute'});Object.assign(foes[1],{seed:7741,weapon:'spear',skill:2,temper:'keeper'});
    Object.assign(foes[2],{seed:3190,weapon:'dagger',skill:2,temper:'rusher'});}
  else{S.cfg.n=3;S.cfg.crew=false;Object.assign(foes[0],{seed:8101,weapon:'shiv',skill:1,temper:'rusher'});Object.assign(foes[1],{seed:8533,weapon:'hook',skill:1,temper:'rusher'});
    Object.assign(foes[2],{seed:8133,weapon:'boneclub',skill:2,temper:'brute'});}
  S.F=[];rosterBuild();
  if(i===2)S.F.forEach((f,k)=>{if(f.team===1){f.beast='goblin';f.name='Goblin '+String.fromCharCode(64+k);}});
  restart();
  if(i===2)for(const f of S.F)if(f.team===1){f.maxHp=f.hp=30;}
  FLOW.stat={n:0,wait:0,big:0,t:performance.now()};flowApply();if(typeof updateStatus==='function')updateStatus();}
function flowPanel(on){const p=FLOW.panel;if(!p)return;if(on===!p.hidden)return;
  if(on){S.paused=true;flowPanelFill();p.hidden=false;}else{p.hidden=true;S.paused=typeof HUD!=='undefined'&&!!HUD.menu;}}
function flowPanelFill(){const p=FLOW.panel;if(!p)return;const s=FLOW.stat;
  p.querySelectorAll('input[data-k]').forEach(c=>{c.checked=!!FLOW[c.dataset.k];});
  p.querySelectorAll('button[data-r]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.r===FLOW.roster)));
  const el=p.querySelector('.fw-stat');if(el)el.textContent=`This fight so far: ${s.n} prompt${s.n===1?'':'s'} (${s.big} with the full card), ${s.wait.toFixed(1)} s waiting on you.`;}
function flowBuild(){
  if(!FLOW.on||FLOW.btn)return;const W=document.getElementById('stageWrap')||document.getElementById('wrap');if(!W)return;
  const b=document.createElement('button');b.type='button';b.id='flowBtn';b.className='fw-btn';b.textContent='Test';b.setAttribute('aria-label','Test options');W.appendChild(b);FLOW.btn=b;
  const p=document.createElement('div');p.id='flowPanel';p.className='fw-panel';p.hidden=true;
  p.innerHTML=`<div class="fw-in" role="dialog" aria-label="Test options"><p class="fw-k">Flow test</p>
    <p class="fw-t">A trial build. Switch a part off to feel the game as it is now.</p>
    <div class="fw-parts">${FLOW.parts.map(([k,n,d])=>`<label class="fw-part"><input type="checkbox" data-k="${k}"><span><b>${n}</b><small>${d}</small></span></label>`).join('')}</div>
    <p class="fw-h">Fight</p><div class="fw-ros">${FLOW.rosters.map(([n,d],i)=>`<button type="button" data-r="${i}"><b>${n}</b><small>${d}</small></button>`).join('')}</div>
    <p class="fw-stat"></p><div class="fw-foot"><button type="button" class="fw-go" data-a="restart">Restart fight</button><button type="button" class="fw-go" data-a="close">Back to the fight</button></div></div>`;
  W.appendChild(p);FLOW.panel=p;
  b.addEventListener('click',()=>{if(typeof ensureAudio==='function')ensureAudio();flowPanel(p.hidden);});
  p.addEventListener('change',e=>{const c=e.target;if(c&&c.dataset&&c.dataset.k){FLOW[c.dataset.k]=!!c.checked;flowSave();flowApply();}});
  p.addEventListener('click',e=>{const r=e.target.closest&&e.target.closest('button');if(!r){if(e.target===p)flowPanel(false);return;}
    if(r.dataset.r!=null){flowPanel(false);flowStart(+r.dataset.r);}else if(r.dataset.a==='restart'){flowPanel(false);flowStart(FLOW.roster);}else if(r.dataset.a==='close')flowPanel(false);});}
V11UI.init.push(()=>{
  if(!FLOW.on)return;
  flowLoad();
  // the prompt: its length and pace, the pick marked, the chips' short words
  const base=S.hooks.opening;
  S.hooks.opening=function(o,choice){
    const k=flowKind(o);
    if(k&&!o.flow){const F=FLOW[k];o.flow=k;o.flowScale=F.scale;o.dur=o.left=k==='ans'?lerp(F.dur[0],F.dur[1],o.f.sk||0):F.dur;
      const p=aiOpening(o);o.flowPick=openingChoices(o).includes(p)&&openValid(o,p)?p:'hold';}
    if(o&&o.f&&o.f.team===0&&!isAI(o.f.idx)&&!o.flowSeen){o.flowSeen=true;FLOW.stat.n++;if(!o.flow)FLOW.stat.big++;}
    base.apply(this,arguments);
    const el=$('opening');if(el&&el.classList)el.classList.toggle('flowq',!!(o&&o.flow));
    if(!o||!o.flow)return;
    $('opSub').textContent=$('opSub').textContent.replace(/ · time slows.*$/,'');
    const n=openingChoices(o).length;opBtns.style.setProperty('--fq-n',String(n<=4?n:3));
    opBtns.querySelectorAll('button').forEach(b=>{const s=b.querySelector('small');if(s)s.textContent=s.textContent.split(' · ')[0];
      b.classList.toggle('flow-pick',b.dataset.c===o.flowPick);});
    if(typeof HUD!=='undefined')HUD.measAt=0;};
  // let go, the marked chip is taken
  const to=tickOpening;
  tickOpening=function(rdt){const o=S.opening;
    if(o&&o.f&&o.f.team===0&&!isAI(o.f.idx))FLOW.stat.wait+=rdt;
    if(o&&o.flow&&o.flowPick&&!isAI(o.f.idx)&&o.left-rdt<=0){const p=o.flowPick;if(openingChoices(o).includes(p)&&openValid(o,p)){resolveOpening(p);return;}}
    return to.apply(this,arguments);};
  const os=openScale;openScale=function(o){return o&&o.flowScale?o.flowScale:os(o);};
  flowBuild();flowApply();
  // the test opens on its fight, once the title is up to put away
  V11UI.tick.push(()=>{if(FLOW.booted||typeof ST_UI==='undefined'||!ST_UI.menu)return;FLOW.booted=true;flowStart(FLOW.roster);});
});
// ===== FLOW UI END =====
