// The full-screen HUD in the real page (Playwright, a fake clock): the layouts by screen, the canvas filling the stage, the camera's
// framing between the top bar and the dock, the plates (target by click and by key), the tabs (and the turn that finds its tab), the
// menu drawer (it pauses the fight, Escape, Resume, the bench inside it, the title screen), the log drawer, the riposte window docked
// in the commands' place, the prologue's scenes hiding the HUD, and no sideways scroll anywhere.
// usage: node sk_hud_page.js   (needs test_page.html from build.py; PAGE=... for another build). Ends with "errors 0 []".
// Frames are drawn one in eight (window.step) and the game is the same either way (probes/draw_free.js); a check that counts or
// reads what is drawn runs inside drawAll(), which draws every frame.
const SK_T0=Date.now();
const {chromium}=require('playwright');
const PAGE=process.env.PAGE||'test_page.html';
(async()=>{
const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[],rep=[];
const expect=(label,cond,info)=>{rep.push((cond?'ok   ':'FAIL ')+label+(process.env.SK_TIMING?' ['+((Date.now()-SK_T0)/1000).toFixed(1)+'s]':'')+(info?'  '+info:''));if(!cond)errs.push(label+(info?' ('+info+')':''));};
const SIZES={land:[844,390,true],port:[390,844,true],desk:[1440,900,false],tab:[820,1180,true],small:[1280,560,false]};
async function open(sz,page){const [w,h,mob]=SIZES[sz];const ctx=await b.newContext({viewport:{width:w,height:h},isMobile:mob,hasTouch:mob}),p=await ctx.newPage();
  p.on('pageerror',e=>errs.push(sz+' page: '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts|ERR_|net::/.test(m.text()))errs.push(sz+' console: '+m.text());});
  await p.addInitScript(e=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};if(e)window.__drawEvery=e;},+process.env.SK_DRAW_EVERY||0);
  await p.goto('file://'+process.cwd()+'/'+(page||PAGE));await p.waitForTimeout(250);
  await p.evaluate(()=>{S.soundOn=false;window.__now=performance.now()+1000;window.step=(k,o)=>{const ev=(o&&o.every)||window.__drawEvery||1;for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(!f)continue;if(ev===1||(window.__fc=(window.__fc||0)+1)%ev===0)f(window.__now);else{const R=window.render;window.render=()=>{};try{f(window.__now);}finally{window.render=R;}}}};window.__drawEvery=window.__drawEvery||8;window.drawAll=fn=>{const e=window.__drawEvery;window.__drawEvery=1;try{return fn();}finally{window.__drawEvery=e;}};
    window.seed=s=>{let a=s;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;};
    window.fight=o=>{seed(o.seed||11);S.arenaKey=o.arena||'street';S.introOn=false;S.cfg.n=o.n||2;S.cfg.crew=!!o.crew;S.cfg.ally.on=o.ally!==false;S.auto=false;S.allyAuto=false;S.F=[];rosterBuild();restart();step(60);};
    window.rect=s=>{const e=typeof s==='string'?document.querySelector(s):s;if(!e)return null;const r=e.getBoundingClientRect();return{l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height};};});
  return p;}
const ev=(p,f,a)=>p.evaluate(f,a);

// ---- the layouts: each screen gets its own, the canvas fills it, nothing scrolls, the HUD frames the picture
for(const sz of Object.keys(SIZES)){const p=await open(sz);
  const r=await ev(p,()=>{fight({});step(30);const cvR=rect('#cv'),w=document.getElementById('wrap'),st=rect('#stageWrap');
    // the band the fighters stand in, on the screen
    const k=cssW/cam.viewW,T=camTop(),ys=S.F.filter(f=>!f.gone).map(f=>({head:(prjY(f.p[HEAD].y-f.body.headR,f.dep)-T)*k,feet:(prjY(f.gr(f.p[PEL].x),f.dep)-T)*k}));
    return{mode:w.dataset.mode,hud:w.dataset.hud,cv:cvR,vw:innerWidth,vh:innerHeight,sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight,px:[cv.width,cv.height],
      ins:[HUD_IN.top,HUD_IN.bottom],top:rect('#hudTop'),dock:rect('#commands'),bar:rect('#cmds'),ys,cmdBtns:[...document.querySelectorAll('#cmds .cmd')].filter(b=>b.offsetParent).length};});
  const want={land:'land',port:'port',desk:'desk',tab:'tab',small:'land'}[sz];
  expect(`${sz}: the ${want} layout, the HUD up`,r.mode===want&&r.hud==='play',r.mode+' '+r.hud);
  expect(`${sz}: the canvas fills the screen, no scroll either way`,Math.abs(r.cv.w-r.vw)<1&&Math.abs(r.cv.h-r.vh)<1&&r.sw<=r.vw&&r.sh<=r.vh,JSON.stringify([r.cv,r.vw,r.vh,r.sw,r.sh]));
  expect(`${sz}: its pixels within the budget`,r.px[0]*r.px[1]<=2.7e6,JSON.stringify(r.px));
  expect(`${sz}: the insets are the top bar's foot and the dock's head`,Math.abs(r.ins[0]-(r.top.b))<2&&r.ins[1]>40&&r.ins[1]<r.vh*.45,JSON.stringify([r.ins,r.top.b,r.dock&&r.dock.t]));
  // every fighter's feet above the dock and his head under the top bar (a short screen lets a head reach a little under the bar)
  const feetOK=r.ys.every(y=>y.feet<=r.vh-r.ins[1]+2),headsOK=r.ys.every(y=>y.head>=r.ins[0]-(r.vh<500?24:2));
  expect(`${sz}: the fighters stand between the top bar and the dock`,feetOK&&headsOK,JSON.stringify(r.ys.map(y=>[Math.round(y.head),Math.round(y.feet)]))+' '+JSON.stringify(r.ins));
  expect(`${sz}: commands on show: ${want==='desk'?'every group':'one group'}`,want==='desk'?r.cmdBtns>=13:r.cmdBtns>=4&&r.cmdBtns<=6,String(r.cmdBtns));
  await p.context().close();}

// ---- the plates, the target, the tabs (sideways phone)
{const p=await open('land');
  const a=await ev(p,()=>{fight({});const H=cmdHero(),before=getTgt(H),other=foes().find(f=>f.idx!==before);
    const row=document.getElementById('fr'+other.idx);row.click();step(2);const afterClick=getTgt(H);
    const back=document.getElementById('fr'+before);back.focus();back.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));step(2);
    return{before,other:other.idx,afterClick,afterKey:getTgt(H),cls:document.getElementById('fr'+before).className,rows:[...document.querySelectorAll('#frows .frow')].map(r=>r.dataset.team+':'+r.dataset.i)};});
  expect('a click on an enemy plate picks him, Enter on a plate picks him back',a.afterClick===a.other&&a.afterKey===a.before&&/is-target/.test(a.cls),JSON.stringify(a));
  const t=await ev(p,()=>{const c=document.getElementById('commands'),tab=k=>document.querySelector(`#cmdTabs [data-tab="${k}"]`);
    tab('move').click();step(2);const m={tab:c.dataset.tab,vis:[...document.querySelectorAll('#cmds .cmd')].filter(b=>b.offsetParent).map(b=>b.id)};
    tab('aether').click();step(2);const ae={tab:c.dataset.tab,vis:[...document.querySelectorAll('#cmds .cmd')].filter(b=>b.offsetParent).map(b=>b.id)};
    tab('strike').click();step(2);return{m,ae,sel:tab('strike').getAttribute('aria-selected'),pips:document.getElementById('tabPips').textContent};});
  expect('the Move tab shows Advance, Sidestep and Withdraw; Aether the three spells; the tab carries the Aether as pips',
    t.m.tab==='move'&&t.m.vis.join()==='cmd-advance,cmd-sidestep,cmd-withdraw'&&t.ae.vis.join()==='mg-bolt,mg-gale,mg-blink'&&t.sel==='true'&&/^◆+◇*$/.test(t.pips),JSON.stringify(t));
  // a hero knocked down on his turn: the Strike tab has nothing to press, the Guard tab has Get up; up again, back to Strike
  const d=await ev(p,()=>{const K=S.F[0],g=S.game;let n=0;while(!(g.phase==='input'&&g.active===0)&&n<3000){if(g.phase==='input'&&isAI(g.active)===false&&g.active!==0)command(g.active,'guard');step(1);n++;}
    K.downed=true;g.turnNo++;updateStatus();step(1);const t1=document.getElementById('commands').dataset.tab,gu=document.getElementById('n-guard').textContent;
    K.downed=false;g.turnNo++;updateStatus();step(1);return{t1,gu,t2:document.getElementById('commands').dataset.tab};});
  expect('down on his turn the dock opens on Guard (Get up), and on Strike again once he is up',d.t1==='guard'&&/Get up/.test(d.gu)&&d.t2==='strike',JSON.stringify(d));
  await p.context().close();}

// ---- the menu drawer: pauses the fight, Escape, the bench in it, Resume; the log drawer
{const p=await open('land');await ev(p,()=>{fight({});});
  await p.click('#menuBtn');await p.waitForTimeout(350);
  let m=await ev(p,()=>{const t0=S.t;step(60);return{paused:S.paused,dt:+(S.t-t0).toFixed(3),open:document.getElementById('wrap').dataset.menu,side:rect('#sideCol'),sub:document.getElementById('drawerSub').textContent,
    focus:document.activeElement&&document.activeElement.id,inert:document.getElementById('stageWrap').inert};});
  expect('the menu button opens the drawer and the fight stands still behind it',m.paused&&m.dt===0&&m.open==='1'&&m.side.l>=-1&&m.inert,JSON.stringify(m));
  expect('the drawer says where the fight is and Resume has the focus',/Skirmish lab · Lamplight Street · 2 vs 2/.test(m.sub)&&m.focus==='resumeBtn',m.sub+' / '+m.focus);
  await p.keyboard.press('1');m=await ev(p,()=>({ex:S.game.phase,ex2:!!S.game.ex}));
  expect('a command key does nothing while the menu is up',m.ex==='input'&&!m.ex2,JSON.stringify(m));
  await p.click('#sideCol [data-dtab="arena"]');await p.click('#arenaSeg [data-a="field"]');
  m=await ev(p,()=>({arena:S.arenaKey,paused:S.paused,tab:document.getElementById('sideCol').dataset.tab}));
  expect('the Arena tab changes the ground and the menu stays up, paused',m.arena==='field'&&m.paused&&m.tab==='arena',JSON.stringify(m));
  await p.keyboard.press('Escape');await p.waitForTimeout(350);
  m=await ev(p,()=>{const t0=S.t;step(30);return{paused:S.paused,dt:S.t-t0,open:document.getElementById('wrap').dataset.menu,side:rect('#sideCol'),focus:document.activeElement&&document.activeElement.id};});
  expect('Escape closes it, the fight runs again, the focus back on the menu button',!m.paused&&m.dt>.3&&m.open===''&&m.side.r<=1&&m.focus==='menuBtn',JSON.stringify(m));
  await p.keyboard.press('Escape');await p.waitForTimeout(350);
  m=await ev(p,()=>({paused:S.paused,open:document.getElementById('wrap').dataset.menu}));
  expect('Escape with nothing open opens the menu',m.paused&&m.open==='1',JSON.stringify(m));
  await p.click('#resumeBtn');await p.waitForTimeout(350);
  await p.click('#logBtn');await p.waitForTimeout(350);
  m=await ev(p,()=>{const t0=S.t;step(30);return{paused:S.paused,dt:S.t-t0,log:document.getElementById('wrap').dataset.log,lp:rect('#logPanel'),vw:innerWidth,scrim:!document.getElementById('hudScrim').hidden};});
  expect('the log drawer slides in from the right and does not pause the fight',!m.paused&&m.dt>.3&&m.log==='1'&&m.lp.r<=m.vw+1&&m.lp.l>=0&&m.scrim,JSON.stringify(m));
  await p.click('#logClose');await p.waitForTimeout(350);
  m=await ev(p,()=>({log:document.getElementById('wrap').dataset.log,lp:rect('#logPanel'),vw:innerWidth}));
  expect('and its close button sends it away',m.log===''&&m.lp.l>=m.vw-1,JSON.stringify(m));
  // the title screen from the drawer, and back to the lab
  await p.click('#menuBtn');await p.waitForTimeout(300);await p.click('#titleBtn');await p.waitForTimeout(100);
  m=await ev(p,()=>{step(2);return{hud:document.getElementById('wrap').dataset.hud,menu:!document.getElementById('stMenu').hidden,paused:S.paused,top:getComputedStyle(document.getElementById('hudTop')).display};});
  expect('Title screen puts the prologue\'s title up, the HUD away',m.hud==='title'&&m.menu&&!m.paused&&m.top==='none',JSON.stringify(m));
  await p.click('#stLab');m=await ev(p,()=>{step(2);return{hud:document.getElementById('wrap').dataset.hud,top:getComputedStyle(document.getElementById('hudTop')).display};});
  expect('and Skirmish lab brings the HUD back',m.hud==='play'&&m.top!=='none',JSON.stringify(m));
  await p.context().close();}

// ---- a crowd in the top bar: an upright phone keeps one plate a side (the hero whose commands are up, his target) with dots counting
// each side, a tap on the enemy's plate hands the target to the next one along the screen; a tablet lays every plate in one row; a
// phone held sideways keeps them all in its one row
{const p=await open('port');
  const r=await ev(p,()=>{fight({n:3});const vis=()=>[...document.querySelectorAll('#frows .frow')].filter(r=>r.offsetParent);
    const v=vis(),H=cmdHero(),fs=hudFoes(),T=S.F[getTgt(H)],E=v.find(r=>r.dataset.team==='1'),K=v.find(r=>r.dataset.team==='0');
    const dots=r=>[...r.querySelectorAll('.fpager i')].map(i=>i.classList.contains('on')?1:0).join('');
    const out={n:v.length,same:Math.abs(rect(E).t-rect(K).t)<1,hero:K.dataset.i==String(H.idx),shown:E.dataset.i==String(T.idx),order:fs.map(f=>f.idx),
      edots:dots(E),kdots:dots(K),chev:!!E.querySelector('.fpager b'),barFoot:Math.round(rect('#hudTop').b),ins:HUD_IN.top,focus:HUD.focus,picks:[]};
    // a tap on it, three times: round the three, left to right
    for(let i=0;i<3;i++){const el=vis().find(r=>r.dataset.team==='1');el.click();step(2);const t=getTgt(cmdHero()),e2=vis().find(r=>r.dataset.team==='1');out.picks.push([t,+e2.dataset.i,dots(e2)]);}
    return out;});
  const k=r.order.indexOf(+r.picks[2][0]);
  expect('port: with three enemies and an ally the top bar keeps one plate a side, in one row: the hero whose commands are up and his target',
    r.n===2&&r.same&&r.hero&&r.shown&&r.focus&&r.barFoot<=130&&Math.abs(r.ins-r.barFoot)<2,JSON.stringify(r));
  expect('port: dots count each side (three enemies, two heroes), the shown one lit, a chevron on the enemy\'s',r.edots.length===3&&r.edots.split('1').length===2&&r.kdots==='10'&&r.chev,JSON.stringify([r.edots,r.kdots,r.chev]));
  const seq=r.picks.map(q=>q[0]),wantSeq=[1,2,0].map(j=>r.order[(r.order.indexOf(r.picks[2][0])+j)%3]);
  expect('port: a tap on the enemy\'s plate hands the target to the next one along the screen, round all three, the plate and its lit dot following',
    r.picks.every(q=>q[0]===q[1])&&new Set(seq).size===3&&r.picks.every((q,i)=>q[2].indexOf('1')===r.order.indexOf(q[0])),JSON.stringify({order:r.order,picks:r.picks,wantSeq,k}));
  await p.context().close();}
for(const sz of ['tab','land']){const p=await open(sz);
  const r=await ev(p,()=>{fight({n:3});const v=[...document.querySelectorAll('#frows .frow')].filter(r=>r.offsetParent);
    return{n:v.length,tops:[...new Set(v.map(r=>Math.round(rect(r).t)))],pagers:document.querySelectorAll('#frows .fpager').length,focus:!!HUD.focus};});
  expect(`${sz}: with three enemies and an ally every plate is up, in one row`,r.n===5&&r.tops.length===1&&r.pagers===0&&!r.focus,JSON.stringify(r));
  await p.context().close();}

// ---- the riposte window docks in the commands' place, the enemies' plates fade, and it stays on the screen (each layout)
for(const sz of ['land','port','desk']){const p=await open(sz);
  const r=await ev(p,()=>{const R0=window.render;window.render=()=>{};let got=false;
    // Kael closes in and guards (whatever his guard has become: getting up, drawing his dagger) until a miss on him opens a riposte
    const act=(f,s)=>slotAction(f,targetOf(f),s)||['guard','wait','withdraw','advance'].map(x=>slotAction(f,targetOf(f),x)).find(Boolean);
    for(let sd=11;sd<17&&!got;sd++){fight({seed:sd});
      for(let t=0;t<4000&&!got;t++){step(1);const G=S.game,k=S.F[0];if(S.opening&&S.opening.f===k){got=true;break;}if(S.opening)continue;
        if(G.phase==='input'&&G.active===k.idx){const V=targetOf(k)||S.F.find(f=>f.team===1&&!f.dead);command(k.idx,act(k,Math.abs(k.station-V.station)>engageGap(k,V)+30?'advance':'guard'));}
        else if(G.phase==='input'&&!isAI(G.active))command(G.active,act(S.F[G.active],'guard'));if(G.phase==='over')break;}}
    window.render=R0;step(2);if(!got)return{got};
    const op=rect('#opening .op-dock'),tab=rect('#opening .op-tab'),bs=[...document.querySelectorAll('#opBtns button')].map(x=>rect(x));
    return{got,op,tab,bs,vw:innerWidth,vh:innerHeight,cmds:getComputedStyle(document.getElementById('commands')).visibility,dataop:document.getElementById('wrap').dataset.op,
      fade:getComputedStyle(document.querySelector('.frow[data-team="1"]')).opacity,top:rect('#hudTop').b,ins:HUD_IN.bottom};});
  if(!r.got){expect(`${sz}: a riposte window came up`,false,'none in six fights');await p.context().close();continue;}
  expect(`${sz}: the riposte window docks at the foot in the commands' place, whole on the screen`,r.op.b<=r.vh+.5&&r.vh-r.op.b<=40&&r.op.l>=0&&r.op.r<=r.vw+.5&&r.tab.t>=r.top&&r.cmds==='hidden',JSON.stringify([r.op,r.tab.t,r.top,r.cmds]));
  expect(`${sz}: its choices are big enough to touch`,r.bs.length>=2&&r.bs.every(x=>x.h>=40&&x.w>=80),JSON.stringify(r.bs.map(x=>[Math.round(x.w),Math.round(x.h)])));
  expect(`${sz}: the enemies' plates fade while the hero chooses`,r.dataop==='h'&&+r.fade<.5,r.dataop+' '+r.fade);
  await p.context().close();}

// ---- the prologue: its title hides the HUD, a scene keeps only the menu, its fight brings the HUD back
{const p=await open('land',PAGE.replace('test_page.html','ragdoll-skirmish-lab.html').replace('qa_test.html','qa_full.html'));
  let m=await ev(p,()=>{step(5);return{hud:document.getElementById('wrap').dataset.hud,top:getComputedStyle(document.getElementById('hudTop')).display,ins:[HUD_IN.top,HUD_IN.bottom]};});
  expect('the page opens on the prologue\'s title with the HUD away',m.hud==='title'&&m.top==='none'&&m.ins[0]===0&&m.ins[1]===0,JSON.stringify(m));
  await p.click('#stBegin');
  m=await ev(p,()=>{for(let i=0;i<4000&&!S.say;i++)step(1);step(10);const vis=id=>getComputedStyle(document.getElementById(id)).visibility;
    return{hud:document.getElementById('wrap').dataset.hud,menu:vis('menuBtn'),plates:[...document.querySelectorAll('.frow')].every(r=>getComputedStyle(r).visibility==='hidden'),
      dock:getComputedStyle(document.getElementById('commands')).display,log:vis('logBtn'),quit:getComputedStyle(document.getElementById('stQuit')).display};});
  expect('in a scene only the menu button stays (the corner Menu button gives way to it)',m.hud==='cut'&&m.menu==='visible'&&m.plates&&m.dock==='none'&&m.log==='hidden'&&m.quit==='none',JSON.stringify(m));
  await p.click('#menuBtn');await p.waitForTimeout(350);
  m=await ev(p,()=>({story:document.getElementById('sideCol').dataset.story,tab:document.getElementById('sideCol').dataset.tab,tabs:[...document.querySelectorAll('.drawer-tabs button')].filter(b=>b.offsetParent).map(b=>b.dataset.dtab),sub:document.getElementById('drawerSub').textContent,paused:S.paused}));
  expect('the menu in the prologue: paused, the codex only, the stage named',m.story==='1'&&m.tab==='codex'&&m.tabs.join()==='codex'&&/prologue/i.test(m.sub)&&m.paused,JSON.stringify(m));
  await p.click('#resumeBtn');await p.waitForTimeout(300);
  m=await ev(p,()=>{for(let i=0;i<60000;i++){step(1);if(S.cut&&S.cut.skip&&i%30===0)cutSkip();if(S.say&&i%20===0)storyAdvance();if(S.story&&S.story.step==='fight'&&S.game.phase==='input'&&!isAI(S.game.active))break;}step(5);
    return{hud:document.getElementById('wrap').dataset.hud,step:S.story&&S.story.step,ins:[HUD_IN.top,HUD_IN.bottom],plates:document.querySelectorAll('.frow').length};});
  expect('its first fight brings the HUD back',m.hud==='play'&&m.step==='fight'&&m.ins[0]>0&&m.ins[1]>0&&m.plates>=2,JSON.stringify(m));
  await p.context().close();}

for(const l of rep)console.log(l);
console.log('errors',errs.length,JSON.stringify(errs));
await b.close();})();
