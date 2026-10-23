// V12 finale, in the real page (Playwright, a fake clock): the page around the last scene (command panel, status rows, order, banner, log),
// the choice panel (buttons, keys 1 and 2, focus, auto, phone width), the victory card text, and a restart in the middle of it.
// Needs test_page.html (python3 build.py). Ends with "errors 0 []".
// Frames are drawn one in eight (window.step) and the game is the same either way (probes/draw_free.js); a check that counts or
// reads what is drawn runs inside drawAll(), which draws every frame.
const SK_T0=Date.now();
const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[],rep=[];
const expect=(label,cond,info)=>{rep.push((cond?'ok   ':'FAIL ')+label+(process.env.SK_TIMING?' ['+((Date.now()-SK_T0)/1000).toFixed(1)+'s]':'')+(info?'  '+info:''));if(!cond)errs.push(label+(info?' ('+info+')':''));};
// a fresh page at the executive's fall: the three rooms before the office are cleared at once, then Kade is down
async function scene(phone,gore,fight){
  const ctx=await b.newContext(phone?{viewport:{width:390,height:844}}:{viewport:{width:1300,height:900}}),p=await ctx.newPage();
  p.on('pageerror',e=>errs.push('page: '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts|ERR_|net::/.test(m.text()))errs.push('console: '+m.text());});
  await p.addInitScript(e=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};if(e)window.__drawEvery=e;},+process.env.SK_DRAW_EVERY||0);
  await p.goto('file://'+process.cwd()+'/test_page.html');await p.waitForTimeout(300);
  await p.evaluate(g=>{S.soundOn=false;let a=7;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
    S.arenaKey='restaurant';S.backroom=true;S.deep=true;S.introOn=false;S.cfg.n=1;S.cfg.crew=false;S.cfg.ally.on=false;S.allyAuto=false;if(g)S.gore=g;
    S.auto=true;S.F=[];rosterBuild();restart();
    window.__now=performance.now()+1000;window.step=(k,o)=>{const ev=(o&&o.every)||window.__drawEvery||1;for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(!f)continue;if(ev===1||(window.__fc=(window.__fc||0)+1)%ev===0)f(window.__now);else{const R=window.render;window.render=()=>{};try{f(window.__now);}finally{window.render=R;}}}};window.__drawEvery=window.__drawEvery||8;window.drawAll=fn=>{const e=window.__drawEvery;window.__drawEvery=1;try{return fn();}finally{window.__drawEvery=e;}};
    window.runUntil=(pred,max)=>{let n=0;while(!pred()&&n<(max||30000)){window.step(1);n++;}return n;};
    window.clearNow=()=>{if(S.crew)S.crew.queue.length=0;S.opening=null;S.game.ex=null;for(const f of foes()){f.hp=0;kill(f,1);}
      if(nextRoom()){beginTransit();return'transit';}if(S.room==='office'&&!S.finaleDone){S.finaleDone=true;beginFinale();return'finale';}return'none';};
    window.fightIn=room=>runUntil(()=>S.room===room&&!S.stage.tr&&(S.game.phase==='input'||S.game.phase==='exchange'));
  },gore||'');
  for(const r of ['dining','kitchen','lobby','office'])await p.evaluate(([r,f])=>{window.fightIn(r);if(!(f&&r==='office'))window.clearNow();},[r,!!fight]);
  await p.evaluate(()=>{S.auto=false;window.T0=S.t;});
  return p;}
const upto=(p,pred)=>p.evaluate(src=>{window.runUntil(new Function('return ('+src+')'));},pred);
const seconds=(p,s)=>p.evaluate(s=>{const T=S.t+s;window.runUntil(()=>S.t>=T);},s);
const auto=(p,on)=>p.evaluate(on=>{const c=document.getElementById('tAuto');c.checked=on;c.dispatchEvent(new Event('change',{bubbles:true}));},on);
const info=p=>p.evaluate(()=>({step:S.finale&&S.finale.step,phase:S.game.phase,head:document.getElementById('cmdHead').textContent,
  cmdsOff:[...document.querySelectorAll('#cmds button')].every(x=>x.disabled),targetsHidden:document.getElementById('targets').hidden,orderHidden:document.getElementById('order').parentNode.hidden,
  banner:document.getElementById('banner').textContent,bannerHidden:document.getElementById('banner').hidden,field:document.getElementById('fieldLine').textContent,
  panelHidden:document.getElementById('finalePanel').hidden,sub:document.getElementById('finSub').textContent,
  btns:[...document.querySelectorAll('#finalePanel button')].map(x=>({t:x.textContent,off:x.disabled})),focus:document.activeElement&&document.activeElement.dataset&&document.activeElement.dataset.c,
  hp:document.getElementById('hpn1').textContent,log:document.getElementById('log').textContent,endText:S.endText,over:!document.getElementById('over').hidden,overT:document.getElementById('overT').textContent,
  tempo:document.getElementById('tempoLine').textContent,preview:document.getElementById('cmdPreview').textContent,intents:document.getElementById('intents').textContent}));

// ---- the office fight itself: he is in the room but not in the page's fighter lists
{const p=await scene(false,null,true);await seconds(p,1.5);
  const r=await p.evaluate(()=>({tempo:document.getElementById('tempoLine').textContent,order:document.getElementById('order').textContent,tg:document.getElementById('targets').textContent,room:S.room,phase:S.game.phase}));
  expect('the office fight: the tempo line, the turn order and the targets leave him out',r.room==='office'&&/Tempo per slash/.test(r.tempo)&&!/Hallowell/.test(r.tempo+r.order+r.tg),JSON.stringify(r));
  await p.context().close();}

// ---- desktop: the page around the scene, the panel, key 1 (spare), the card
{const p=await scene(false);await seconds(p,.4);let i=await info(p);
  expect('the scene has begun and the panel is not up yet',i.phase==='finale'&&i.step==='settle'&&i.panelHidden,i.phase+' '+i.step);
  expect('the command panel is headed for the executive and nothing in it is clickable',i.head==='The executive'&&i.cmdsOff,i.head);
  expect('no target chips, no turn order, no tempo line, no preview, no intents',i.targetsHidden&&i.orderHidden&&i.tempo===''&&i.preview===''&&i.intents==='',JSON.stringify([i.targetsHidden,i.orderHidden,i.tempo,i.preview,i.intents]));
  expect('the banner names him',i.banner==='Mr. Hallowell'&&!i.bannerHidden,i.banner);
  expect('the field line says where we are',/Mr\. Hallowell/.test(i.field),i.field);
  expect('Kade\'s row is up to date: 0 HP',i.hp==='0',i.hp);
  expect('the log has the first entry',/is down/.test(i.log)&&/Ilyas goes for the executive/.test(i.log),i.log.slice(0,120));
  await p.evaluate(()=>{document.activeElement&&document.activeElement.blur();});
  await upto(p,'S.finale&&S.finale.step==="choice"');i=await info(p);
  expect('the panel comes up at the choice',i.step==='choice'&&!i.panelHidden&&i.btns.length===2,i.step);
  expect('two buttons, enabled, named and keyed',i.btns[0].t.startsWith('Spare him')&&i.btns[1].t.startsWith('Behead him')&&i.btns.every(x=>!x.off)&&/1/.test(i.btns[0].t)&&/2/.test(i.btns[1].t),JSON.stringify(i.btns));
  expect('nobody is deciding: the sub line is empty; the first button has the focus',i.sub===''&&i.focus==='spare',i.sub+' / '+i.focus);
  expect('the field line says on his knees',/on his knees/.test(i.field),i.field);
  await seconds(p,6);i=await info(p);
  expect('it waits (6 s on)',i.step==='choice'&&!i.panelHidden&&!i.over,i.step);
  await p.keyboard.press('3');await seconds(p,.2);i=await info(p);
  expect('another key does nothing',i.step==='choice',i.step);
  await p.keyboard.press('1');await seconds(p,.2);i=await info(p);
  expect('key 1 spares him and the panel goes',i.step==='spare'&&i.panelHidden&&i.endText==='Mr. Hallowell is spared.',i.step+' '+i.panelHidden+' '+i.endText);
  expect('the log says it',/spares/.test(i.log)&&/begs for his life/.test(i.log),i.log.slice(0,200));
  await upto(p,'S.game.phase==="over"');await p.waitForTimeout(1500);i=await info(p);
  expect('the card carries the ending',i.over&&/Mr\. Hallowell is spared\./.test(i.overT),i.overT);
  expect('the page after it: header "Fight over", the order row is back',i.head==='Fight over'&&!i.orderHidden&&!i.targetsHidden,i.head);
  expect('the tempo line counts Kael only, not the man he spared',/Tempo per slash/.test(i.tempo)&&!/Hallowell/.test(i.tempo),i.tempo);
  await p.context().close();}

// ---- desktop: key 2 and a click, gore on, then the card
{const p=await scene(false);await upto(p,'S.finale&&S.finale.step==="choice"');
  await p.keyboard.press('2');await seconds(p,.2);let i=await info(p);
  expect('key 2 beheads him',i.step==='behead'&&i.panelHidden&&i.endText==='Mr. Hallowell is beheaded.',i.step+' '+i.endText);
  await upto(p,'S.game.phase==="over"');await p.waitForTimeout(1500);i=await info(p);
  expect('the card says he was beheaded',i.over&&/Mr\. Hallowell is beheaded\./.test(i.overT),i.overT);
  expect('and he is dead and severed',await p.evaluate(()=>{const X=S.F.find(f=>f.npc);return X.dead&&!!X.severed;}));
  await p.context().close();}
{const p=await scene(false);await upto(p,'S.finale&&S.finale.step==="choice"');
  await p.click('#finalePanel button[data-c=spare]');await seconds(p,.2);let i=await info(p);
  expect('clicking Spare him spares him',i.step==='spare',i.step);await p.context().close();}
{const p=await scene(false,'off');await upto(p,'S.finale&&S.finale.step==="choice"');
  await p.click('#finalePanel button[data-c=behead]');await upto(p,'S.game.phase==="over"');await p.waitForTimeout(1500);const i=await info(p);
  expect('gore off: struck down, nothing severed',/Mr\. Hallowell is struck down\./.test(i.overT)&&await p.evaluate(()=>{const X=S.F.find(f=>f.npc);return X.dead&&!X.severed&&S.blood.length===0;}),i.overT);
  await p.context().close();}

// ---- desktop: on auto the panel says Kael is deciding, takes no clicks, and decides; turning auto off gives the choice back
{const p=await scene(false);await auto(p,true);await upto(p,'S.finale&&S.finale.step==="choice"');await seconds(p,.3);let i=await info(p);
  expect('on auto the panel says Kael is deciding, buttons off',!i.panelHidden&&/deciding/.test(i.sub)&&i.btns.every(x=>x.off),i.sub+' '+JSON.stringify(i.btns.map(x=>x.off)));
  await p.keyboard.press('1');await seconds(p,.1);i=await info(p);
  expect('keys do nothing while he decides',i.step==='choice',i.step);
  await auto(p,false);await seconds(p,.2);i=await info(p);
  expect('turning auto off gives it back: buttons on, no sub line, still waiting',i.step==='choice'&&i.sub===''&&i.btns.every(x=>!x.off),i.step+' '+i.sub);
  await seconds(p,3);i=await info(p);expect('and it still waits',i.step==='choice',i.step);
  await auto(p,true);await seconds(p,1);i=await info(p);
  expect('auto on again: it decides within about two seconds',i.step==='choice'&&/deciding/.test(i.sub),i.step);
  await seconds(p,2.5);i=await info(p);expect('the pick is made',i.step!=='choice'&&i.panelHidden,i.step);
  await p.context().close();}

// ---- desktop: a restart in the middle of it (the panel up; then a toggle during the beats) leaves the page clean
{const p=await scene(false);await upto(p,'S.finale&&S.finale.step==="choice"');
  await p.evaluate(()=>restart());await seconds(p,.5);let i=await info(p);
  expect('restart at the choice: panel gone, scene gone, page normal',i.panelHidden&&i.step===null&&i.phase!=='finale'&&i.head!=='The executive'&&!i.orderHidden&&!i.targetsHidden&&!i.bannerHidden,JSON.stringify([i.panelHidden,i.step,i.phase,i.head,i.orderHidden,i.targetsHidden]));
  await p.context().close();}
{const p=await scene(false);await seconds(p,3.2);let i=await info(p);
  expect('mid scene (the slam)',i.phase==='finale'&&['reach','slam','haul'].includes(i.step),i.step);
  // the ally switch is in the menu drawer, which pauses the fight until Resume
  await p.click('#menuBtn');await p.click('#allySeg [data-ally="1"]');await p.click('#resumeBtn');await seconds(p,.5);i=await info(p);
  expect('a toggle mid scene restarts clean',i.step===null&&i.phase!=='finale'&&i.panelHidden&&!i.orderHidden&&!i.targetsHidden&&await p.evaluate(()=>!S.F[0].entering&&!S.endText),JSON.stringify([i.step,i.phase,i.panelHidden]));
  await p.context().close();}

// ---- a phone-sized page: the panel docked at the foot of the screen in the commands' place, whole and in reach; key 2 works
{const p=await scene(true);await upto(p,'S.finale&&S.finale.step==="choice"');await seconds(p,.3);
  const r=await p.evaluate(()=>{const pn=document.getElementById('finalePanel').getBoundingClientRect(),top=document.getElementById('hudTop').getBoundingClientRect(),bs=[...document.querySelectorAll('#finalePanel button')].map(x=>x.getBoundingClientRect());
    return{pn:{l:pn.left,r:pn.right,t:pn.top,b:pn.bottom},top:top.bottom,vh:innerHeight,bs:bs.map(x=>({w:x.width,h:x.height})),sw:document.documentElement.scrollWidth,vw:innerWidth,
      cmds:getComputedStyle(document.getElementById('commands')).visibility,pos:getComputedStyle(document.getElementById('finalePanel')).position,band:[HUD_IN.top,HUD_IN.bottom]};});
  expect('phone: the panel is whole inside the width, no sideways scroll',r.pn.l>=0&&r.pn.r<=r.vw+.5&&r.sw<=r.vw+1,JSON.stringify([r.pn.l,r.pn.r,r.sw,r.vw]));
  expect('phone: it docks at the foot of the screen in the place of the commands, which step aside, and stays under the top bar',
    r.pn.b<=r.vh+.5&&r.vh-r.pn.b<=40&&r.pn.t>=r.top&&r.pn.t>=r.vh-r.band[1]-60&&r.cmds==='hidden',JSON.stringify([r.pn.t,r.pn.b,r.vh,r.top,r.band,r.cmds,r.pos]));
  expect('phone: the buttons are big enough to touch',r.bs.length===2&&r.bs.every(x=>x.h>=32&&x.w>=100),JSON.stringify(r.bs));
  await p.keyboard.press('2');await seconds(p,.2);const i=await info(p);expect('phone: key 2 beheads him',i.step==='behead',i.step);
  await p.context().close();}

for(const l of rep)console.log(l);
console.log('errors',errs.length,JSON.stringify(errs));
await b.close();})();
