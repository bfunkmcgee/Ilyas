// Levels on the page (sk_growthui.js; since V93): his level on his plate in the story and none in the lab; the drawer's line with his
// level and the XP to the next; a level said over him (the word the drawing shows) and in the log, and the plate after it; each
// style's level on its card, on the styles screen and in the Pit menu's Styles, Short Hand's rank as its level makes it; the title's
// line for a kept night with its level; and a night's level through a reload and Continue.
// usage: node sk_growth_page.js   (needs test_page.html from build.py: the copy with the charset a file:// page needs; it opens on
// the lab, so the title is put up as the menu's Title screen puts it up)
const SK_T0=Date.now();
const {chromium}=require('playwright');const fs=require('fs');
const rep=[],errs=[];
function expect(label,cond,info){rep.push((cond?'ok   ':'FAIL ')+label+(process.env.SK_TIMING?' ['+((Date.now()-SK_T0)/1000).toFixed(1)+'s]':'')+(info!==undefined&&info!==''?'  '+info:''));if(!cond)errs.push(label+(info!==undefined?' ('+info+')':''));}
const PAGE='file://'+process.cwd()+'/'+(process.env.PAGE||'test_page.html');
(async()=>{
  const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),pageErrs=[];
  // the page on the fake clock with the dice seeded, after every load (a reload is a visit later on)
  const setup=async p=>{await p.waitForTimeout(250);await p.evaluate(()=>{S.soundOn=false;let a=43;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
    window.__now=performance.now()+1000;window.step=k=>{const R=window.render;window.render=()=>{};try{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}}finally{window.render=R;}};
    window.vis=id=>{const e=document.getElementById(id);return!!e&&!e.hidden&&getComputedStyle(e).display!=='none'&&e.offsetParent!==null;};
    window.kept=()=>{try{return JSON.parse(localStorage.getItem('ilyas.night')||'null');}catch(e){return'broken';}};
    window.plate=()=>{const K=hero(),n=document.querySelector('#fr'+K.idx+' .fname'),i=n&&n.querySelector('.flv');return{name:n&&n.firstChild&&n.firstChild.textContent,lv:i?i.textContent:null,title:i?i.title:null};};
    // the line the drawer should say for the XP he has
    window.lineFor=xp=>{const L=levelOf(xp);return'Level '+L+' · '+(xp-XP_AT[L])+' of '+xpNeed(L)+' XP to the next';};});};
  const open=async()=>{const ctx=await b.newContext({viewport:{width:1280,height:800},deviceScaleFactor:1});const p=await ctx.newPage();
    p.on('pageerror',e=>pageErrs.push(e.message));
    await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
    await p.goto(PAGE);await setup(p);return p;};
  const ev=(p,fn,arg)=>p.evaluate(fn,arg);

  const p=await open();
  // ---- the lab, then a night begun at the Dining Room ----
  let m=await ev(p,()=>({lab:!S.story,plate:plate(),line:vis('growthLine')}));
  expect('the lab: no level on his plate',m.lab&&m.plate.lv===null&&!!m.plate.name,JSON.stringify(m));
  m=await ev(p,()=>{storyMenu(true);storyGo('dining');step(40);const g=growth();return{key:S.story.key,xp:g&&g.xp,L:heroLevel(),plate:plate(),maxHp:hero().maxHp};});
  expect('in the story: his level after his name on his plate',m.key==='dining'&&m.L>=2&&m.plate.lv==='Lv '+m.L&&m.plate.title==='Level '+m.L&&m.plate.name==='Ilyas',JSON.stringify(m));
  m=await ev(p,()=>{hudMenu(true);const r={line:vis('growthLine'),t:document.getElementById('growthLine').textContent,want:lineFor(growth().xp),sub:document.getElementById('drawerSub').textContent};hudMenu(false);return r;});
  expect('the drawer: his level and the XP to the next, under where he is',m.line&&m.t===m.want&&/^The prologue/.test(m.sub),JSON.stringify(m));

  // ---- a level as it comes ----
  m=await ev(p,()=>{const L=heroLevel(),h0=hero().maxHp;xpGain(XP_AT[L+1]-growth().xp,'a test');step(2);
    const w=fightWords(),notes=[...document.querySelectorAll('.lg-note')].map(d=>d.textContent);
    return{L,L1:heroLevel(),word:w.r&&w.r.text,plate:plate(),notes:notes.slice(-3),hp:hero().maxHp-h0};});
  expect('a level: said over him (the word the drawing shows), in the log with what it gives, and on his plate',m.L1===m.L+1&&m.word==='Level '+m.L1&&m.plate.lv==='Lv '+m.L1&&m.hp===2&&
    m.notes.some(t=>t==='Ilyas: Level '+m.L1+', +2 health'||t.startsWith('Ilyas: Level '+m.L1+', +2 health,'))&&m.notes.some(t=>/^Ilyas: \+\d+ XP, a test$/.test(t)),JSON.stringify(m));

  // ---- the styles' levels ----
  m=await ev(p,()=>{storyGo('sh2');step(40);a9Fill();const cards=[...document.querySelectorAll('#a9Cards .a9-card')].map(c=>c.querySelector('h3').textContent+': '+c.querySelector('.a9-now').textContent+' | '+(c.querySelector('.a9-lv')||{}).textContent);
    const g=growth(),sh=g.styles.shorthand;g.styles.shorthand=STYLE_XP_AT[5];a9Fill();const after=document.querySelector('#a9Cards .a9-card').querySelector('.a9-now').textContent+' | '+document.querySelector('#a9Cards .a9-lv').textContent;
    hudMenu(true);hudDrawerTab('styles');pmFill();const pm=[...document.querySelectorAll('#pmCards .a9-lv')].map(e=>e.textContent);hudMenu(false);g.styles.shorthand=sh;
    return{key:S.story.key,sh,cards,after,pm};});
  // (at the start of the second lesson, the first one's move is his: Short Hand at 40 XP, its level 2)
  {const want=['Short Hand: Novice, learning | Level 2 · Novice · 0 of 60 to the next','Wire drill: Dark: needs the gilt | Level 13 · Expert · 0 of 280 to the next',
    'The Sareth cut: Locked: needs two hands | Level 17 · Master · 0 of 360 to the next'];
    expect('each style\'s card: its level, its rank and the XP to the next (Short Hand a lesson in)',m.key==='sh2'&&m.cards.join(' / ')===want.join(' / '),JSON.stringify(m.cards));
    expect('Short Hand\'s rank as its level makes it',m.after==='Trained, learning | Level 5 · Trained · 0 of 120 to the next',m.after);
    expect('the Pit menu\'s Styles: the same lines',m.pm.length===3&&m.pm[0].startsWith('Level 5 · Trained')&&m.pm[1]==='Level 13 · Expert · 0 of 280 to the next',JSON.stringify(m.pm));}

  // ---- the title, and a visit later ----
  m=await ev(p,()=>{storyQuit();restart();storyMenu(true);step(2);const k=kept();return{saved:document.getElementById('stSaved').textContent,key:k&&k.cp.key,xp:k&&k.cp.parts.growth&&k.cp.parts.growth.xp};});
  {const L=await ev(p,xp=>levelOf(xp),m.xp);
    expect('the title: where the night kept stands, and its level',m.key==='dining'&&m.saved==='Where you left off: Prologue · V · The Dining Room · Level '+L,JSON.stringify(m));}
  await p.reload();await setup(p);await ev(p,()=>{if(!S.story)storyMenu(true);});
  await p.click('#stContinue');
  {const c=await ev(p,()=>{step(40);return{key:S.story&&S.story.key,xp:growth()&&growth().xp,plate:plate(),L:heroLevel(),maxHp:hero().maxHp,want:STORY_KAEL.hp+GROWTH.hp*(heroLevel()-1)};});
    expect('Continue: the night at the level it was kept at, on his plate and in his health',c.key==='dining'&&c.xp===m.xp&&c.plate.lv==='Lv '+c.L&&c.maxHp===c.want,JSON.stringify(c));}
  await p.context().close();

  expect('no page errors',pageErrs.length===0,pageErrs.slice(0,3).join(' | '));
  console.log(rep.join('\n'));console.log(errs.length?`\n${errs.length} FAILED`:`\nall ${rep.length} checks passed`);
  console.log('errors '+errs.length+' '+JSON.stringify(errs));
  await b.close();process.exit(errs.length?1:0);
})();
