// The flow test (sk_flowui.js, sk_css_flow.css, tools/flow_test.py; a trial on the branch claude/flow-test), at a phone held upright.
// In the game's own page all of it is off: no Test button, a prompt's pace and length as they were, the dock its old size. In the
// page built as the flow test: it opens on its fight with the title put away; the dock and the top bar are smaller; an answer to a
// blow is a row of chips with his own pick marked, short, the game running on at a fifth, and let go the marked chip is taken; a
// chip tapped is the answer; a routine opening plays through the same way; a man Broken or a Flow link keeps the full card; an
// enemy's plan is one short line; a heavy man's motion is slower and a slight man's quicker; each part off is the game as it is;
// the panel pauses, switches and restarts; the three fights start.
// usage: node sk_flow_page.js [outdir]   (stills go to outdir when one is named)
const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const OUT=process.argv[2]||null;if(OUT)fs.mkdirSync(OUT,{recursive:true});
const TEST=path.join(os.tmpdir(),'sk-flow-test-'+process.pid+'.html');
cp.execFileSync('python3',[path.join(__dirname,'tools','flow_test.py'),TEST,path.join(__dirname,process.env.PAGE||'test_page.html')]);
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[],rep=[];
  const expect=(label,cond,info)=>{rep.push((cond?'ok   ':'FAIL ')+label+(info?'  '+info:''));if(!cond)errs.push(label+(info?' ('+info+')':''));};
  const open=async file=>{const p=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true})).newPage();
    p.on('pageerror',e=>errs.push('page: '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts|ERR_|net::/.test(m.text()))errs.push('console: '+m.text());});
    await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};try{localStorage.removeItem('sk_flow');}catch(e){}});
    await p.goto('file://'+file);await p.waitForTimeout(400);
    await p.evaluate(()=>{S.soundOn=false;let a=13;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
      window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
      window.fast=k=>{const R=window.render;window.render=()=>{};try{step(k);}finally{window.render=R;}};
      window.mine=()=>{const g=S.game;return g.phase==='input'&&g.active===0&&!S.opening&&!isAI(0);};
      window.toMine=()=>{let n=0;while(n<6000&&!mine()&&S.game.phase!=='over'){if(S.opening&&!isAI(S.opening.f.idx))resolveOpening(aiOpening(S.opening));fast(1);n++;}fast(45);if(typeof HUD!=='undefined'){HUD.measAt=0;step(2);}return n;};
      // on until a prompt of his of this kind is up ('ans', 'fol' or 'big'), his own turns played with the first move he has
      window.toPrompt=kind=>{let n=0;while(n<30000){if(S.game.phase==='over'){if(!FLOW.on)break;flowStart(FLOW.roster);fast(5);}const o=S.opening;
        if(o&&!isAI(o.f.idx)){const k=o.flow||(o.source==='react'?'ans0':'big');if(k===kind)return{k,src:o.source,dur:o.dur,left:o.left,pick:o.flowPick||null,ch:openingChoices(o)};resolveOpening(aiOpening(o));}
        else if(mine()){const K=hero();K.hp=K.maxHp;for(const c of ['slash','thrust','overhead','sweep','advance','wait']){const bt=document.getElementById('cmd-'+c);if(bt&&!bt.disabled&&!bt.hidden){bt.click();break;}}}
        fast(1);n++;}return null;};
      step(5);});
    return p;};
  const shot=async(p,name)=>{if(!OUT)return;await p.evaluate(()=>step(3));await p.waitForTimeout(150);await p.screenshot({path:`${OUT}/${name}.png`});};

  // 1. the game's own page: nothing of it
  let p=await open(path.join(__dirname,process.env.PAGE||'test_page.html'));
  let r=await p.evaluate(()=>{const lab=document.getElementById('stLab');if(lab)lab.click();S.cfg.n=2;S.cfg.crew=false;S.arenaKey='street';S.F=[];restart();toMine();
    const out={on:FLOW.on,btn:!!document.getElementById('flowBtn'),ds:document.getElementById('wrap').dataset.flow||'',build:ANIM_BUILD.on,hud:[HUD_IN.top,HUD_IN.bottom],scale:openScale({source:'react'}),label:flowLabel({_when:'after your next move'},{cmd:'slash'},'a','b')};
    const o=toPrompt('ans0');out.ans=o&&{dur:+o.dur.toFixed(2),pick:o.pick};out.q=document.getElementById('opening').classList.contains('flowq');return out;});
  expect('in the game\'s own page the trial is off: no Test button, no switches, the motion and the labels as they are',!r.on&&!r.btn&&r.ds===''&&!r.build&&r.label===null,JSON.stringify(r));
  expect('there a prompt runs at a twelfth and the answer window is as long as it was, the full card',r.scale===.08&&r.ans&&r.ans.dur>=2.2&&r.ans.dur<=3.4&&r.ans.pick===null&&!r.q,JSON.stringify(r));
  const old=r.hud;await p.close();

  // 2. the flow test's page: its fight, the smaller HUD
  p=await open(TEST);
  r=await p.evaluate(()=>{const n=toMine();return{on:FLOW.on,booted:FLOW.booted,menu:ST_UI.menu.hidden,story:document.body.classList.contains('story'),btn:!!document.getElementById('flowBtn'),ds:document.getElementById('wrap').dataset.flow,
    F:S.F.map(f=>f.name),arena:S.arenaKey,crew:S.cfg.crew,mine:mine(),hud:[HUD_IN.top,HUD_IN.bottom],build:ANIM_BUILD.on,tq:getComputedStyle(document.getElementById('t-slash')).display,cmdH:Math.round(document.getElementById('cmd-slash').getBoundingClientRect().height)};});
  expect('the flow test opens on its fight in the street, the title put away, every part on',r.on&&r.booted&&r.menu&&!r.story&&r.btn&&r.ds==='quick follow dock labels'&&r.build&&r.F[1]==='Qadir'&&r.arena==='street'&&r.crew&&r.mine,JSON.stringify(r));
  expect('its dock and top bar are smaller: over 100 px less of the screen, each move two lines',r.hud[0]<old[0]-10&&r.hud[1]<old[1]-100&&r.tq==='none'&&r.cmdH<=44,JSON.stringify({old,now:r.hud,cmdH:r.cmdH}));
  await shot(p,'1_turn');
  // an enemy's plan in one line
  r=await p.evaluate(()=>({a:flowLabel({_when:'after your next move',_back:true},{cmd:'slash'},'x','y'),b:flowLabel({_when:'after 2 of your moves'},{cmd:'overhead'},'x','y'),c:flowLabel({_when:'acting now'},{cmd:'wait'},'x','y')}));
  expect('an enemy\'s plan is one short line: the blow and how many moves away',/Slash · in 1$/.test(r.a.a)&&r.a.b==='at your back'&&/Overhead · in 2$/.test(r.b.a)&&r.b.b===''&&/Hold · now$/.test(r.c.a),JSON.stringify(r));

  // 3. an answer: chips, his pick marked, short, the game running on; let go, the marked chip is taken
  r=await p.evaluate(()=>{const o=toPrompt('ans');if(!o)return null;step(3);const op=S.opening,el=document.getElementById('opening'),bs=[...document.querySelectorAll('#opBtns button')];
    const out={...o,scale:openScale(op),q:el.classList.contains('flowq'),react:el.classList.contains('react'),reason:getComputedStyle(document.getElementById('opReason')).display,
      marked:bs.filter(x=>x.classList.contains('flow-pick')).map(x=>x.dataset.c),small:bs.map(x=>x.querySelector('small').textContent),h:Math.round(el.querySelector('.op-dock').getBoundingClientRect().height),t0:S.t,D:op.f,A:op.opp};
    return{...out,D:out.D.name,A:out.A.name};});
  expect('an answer to a blow is a short row of chips, his own pick marked, the reasons put away',!!r&&r.q&&r.react&&r.reason==='none'&&r.dur>=1.1&&r.dur<=1.6&&r.marked.length===1&&r.marked[0]===r.pick&&r.ch.includes(r.pick)&&r.small.every(t=>!/tempo/.test(t))&&r.h<=110,JSON.stringify(r));
  expect('while it is up the game runs on at about a fifth, not a twelfth',!!r&&r.scale>.15&&r.scale<.3,String(r&&r.scale));
  await shot(p,'2_answer');
  let r2=await p.evaluate(()=>{const o=S.opening,pick=o.flowPick,D=o.f,t0=S.t;let n=0;while(S.opening===o&&n<400){step(1);n++;}return{n,pick,react:D.lastReact,gone:S.opening!==o,dt:+(S.t-t0).toFixed(2),secs:+(n*.0167).toFixed(2)};});
  expect('let go, the marked chip is the answer he gives, in under two seconds, the blow having come on meanwhile',r2.gone&&r2.react===r2.pick&&r2.secs<1.9&&r2.dt>.15,JSON.stringify(r2));
  // a chip tapped is the answer
  r2=await p.evaluate(()=>{const o=toPrompt('ans');if(!o)return null;step(2);const other=o.ch.find(k=>k!==o.pick&&k!=='turn'&&k!=='ward'),D=S.opening.f;document.querySelector('#opBtns button[data-c="'+other+'"]').click();fast(2);return{other,react:D.lastReact,gone:!S.opening||S.opening.source!=='react'};});
  expect('a chip tapped is the answer instead',!!r2&&r2.react===r2.other&&r2.gone,JSON.stringify(r2));

  // 4. a routine opening plays through; a big one keeps the full card
  r=await p.evaluate(()=>{const o=toPrompt('fol');if(!o)return null;step(3);const op=S.opening,el=document.getElementById('opening');const out={...o,q:el.classList.contains('flowq'),scale:openScale(op),marked:[...document.querySelectorAll('#opBtns button.flow-pick')].map(x=>x.dataset.c)};
    const K=op.f;let n=0;while(S.opening===op&&n<400){step(1);n++;}return{...out,n,secs:+(n*.0167).toFixed(2),did:op.flowPick==='hold'?'hold':K.lastAct};});
  expect('a routine opening is the same row of chips, and let go he takes his own pick in about a second',!!r&&r.q&&FLOWR.includes(r.src)&&r.marked.length===1&&r.marked[0]===r.pick&&r.secs<1.3&&r.did===r.pick,JSON.stringify(r));
  r=await p.evaluate(()=>{const o=toPrompt('big');if(!o)return null;step(3);const op=S.opening,el=document.getElementById('opening');
    return{...o,q:el.classList.contains('flowq'),scale:openScale(op),reason:getComputedStyle(document.getElementById('opReason')).display,tq:getComputedStyle(document.querySelector('#opBtns button .tq')).display};});
  expect('a man Broken, a Flow link or a hold keeps the full card and the slow time',!!r&&!r.q&&!FLOWR.includes(r.src)&&r.src!=='react'&&r.scale===.08&&r.dur>=2.6&&r.reason!=='none'&&r.tq!=='none',JSON.stringify(r));
  await shot(p,'3_big');
  r=await p.evaluate(()=>({...FLOW.stat,wait:+FLOW.stat.wait.toFixed(1)}));
  expect('the panel\'s count has the prompts and the full cards among them',r.n>=4&&r.big>=1&&r.big<r.n&&r.wait>0,JSON.stringify(r));

  // 5. motion by build
  r=await p.evaluate(()=>{const mk=(bulk,gob)=>({idx:3,skill:3,body:{bulk,gob},animStyle:'regular'}),h=styleMoves(mk(1.42),null),s=styleMoves(mk(.95),null),m=styleMoves(mk(1.18),null),K=styleMoves(hero(),null);
    ANIM_BUILD.on=false;const off=styleMoves(mk(1.42),null)===ANIM_MOVES;ANIM_BUILD.on=true;
    return{h:[h.recover,h.cock],s:[s.recover,s.cock],m:[+m.recover.toFixed(3),+m.cock.toFixed(3)],off,runt:buildMix(mk(.65,'runt')),brute:buildMix(mk(1.05,'brute')),hero:buildMix(hero())};});
  expect('a heavy man winds up bigger and is slower back, a slight one quicker, a middling one as he was; a runt quick, a brute slow; Ilyas his own',r.h[0]>1.15&&r.h[1]>1.08&&r.s[0]<.9&&r.s[1]<.95&&Math.abs(r.m[0]-1)<.01&&r.off&&r.runt===-1&&r.brute>.8&&r.hero===0,JSON.stringify(r));

  // 6. the panel: pauses, a part off is the game as it is, the fights
  r=await p.evaluate(()=>{document.getElementById('flowBtn').click();step(2);const P=document.getElementById('flowPanel'),out={open:!P.hidden,paused:S.paused,parts:P.querySelectorAll('input[data-k]').length,ros:P.querySelectorAll('button[data-r]').length,stat:P.querySelector('.fw-stat').textContent};
    P.querySelector('button[data-a="close"]').click();out.closed=P.hidden;out.unpaused=!S.paused;toMine();const meas=()=>{HUD.measAt=0;step(3);return[HUD_IN.top,HUD_IN.bottom];};out.on=meas();
    document.getElementById('flowBtn').click();step(2);
    const c=P.querySelector('input[data-k="dock"]');c.click();const q=P.querySelector('input[data-k="quick"]');q.click();const bm=P.querySelector('input[data-k="build"]');bm.click();out.ds=document.getElementById('wrap').dataset.flow;out.build=ANIM_BUILD.on;
    P.querySelector('button[data-a="close"]').click();out.hud=meas();
    const o=toPrompt('ans0');out.ans=o&&+o.dur.toFixed(2);out.q=document.getElementById('opening').classList.contains('flowq');return out;});
  expect('the Test panel pauses the fight and has the five parts and the three fights',r.open&&r.paused&&r.parts===5&&r.ros===3&&/prompt/.test(r.stat)&&r.closed&&r.unpaused,JSON.stringify(r));
  expect('a part switched off is the game as it is: the dock and the top bar their old size, the answer the full card and its old length, the motion as it was',r.ds==='follow labels'&&!r.build&&r.hud[0]===old[0]&&r.hud[0]>r.on[0]+10&&r.hud[1]>r.on[1]+80&&r.ans>=2.2&&!r.q,JSON.stringify({ds:r.ds,on:r.on,hud:r.hud,old,ans:r.ans,q:r.q}));
  for(const [i,want] of [[1,/^Ilyas,Qadir,Brask,Iyla$/],[2,/^Ilyas,Goblin A,Goblin B,Goblin C$/]]){
    r=await p.evaluate(i=>{document.getElementById('flowBtn').click();step(2);document.querySelector('#flowPanel button[data-r="'+i+'"]').click();const n=toMine();
      return{F:S.F.map(f=>f.name).join(),kinds:S.F.map(f=>f.body.gob||'').join(),hp:S.F[1].maxHp,mine:mine(),roster:FLOW.roster,paused:S.paused,stat:FLOW.stat.n};},i);
    expect(`the fight picked in the panel starts: ${FLOW_NAMES[i]}`,want.test(r.F)&&r.mine&&r.roster===i&&!r.paused&&r.stat===0&&(i!==2||(/runt/.test(r.kinds)&&/brute/.test(r.kinds)&&r.hp===30)),JSON.stringify(r));}
  await shot(p,'4_goblins');
  await p.close();try{fs.unlinkSync(TEST);}catch(e){}

  console.log(rep.join('\n'));
  if(errs.length){console.log('\nFAILED '+errs.length+':\n'+errs.join('\n'));await b.close();process.exit(1);}
  console.log('\nflow page: all '+rep.length+' checks pass');await b.close();})();
const FLOWR=['stop','dodgeOver','parry','brace','dodge','hit','fumble','counter','block'],FLOW_NAMES=['Elf and his crew','Three elves','Goblin pack'];
