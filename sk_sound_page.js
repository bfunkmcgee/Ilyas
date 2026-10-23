// The held sounds in the real page, heard: the page's own audio runs (no gesture needed for the check) and its output is measured at
// the master gain (the RMS of its last 4096 samples), with the game held still while the audio plays on. The bike's engine is heard
// while his bike runs and falls silent when the bike part is over (the opening's end, his bike into the APC at the checkpoint), and
// its voice is stopped; turning the sound off silences a running bike. (Before V62 the engine's throb was added onto its level, so the
// engine went on at full strength after every bike had stopped, from the opening to the end of the story.)
// usage: node sk_sound_page.js   (needs test_page.html from build.py; PAGE=... to point it at another copy)
const SK_T0=Date.now();
const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined),args:['--autoplay-policy=no-user-gesture-required']}),errs=[],rep=[];
const expect=(label,cond,info)=>{rep.push((cond?'ok   ':'FAIL ')+label+(process.env.SK_TIMING?' ['+((Date.now()-SK_T0)/1000).toFixed(1)+'s]':'')+(info?'  '+info:''));if(!cond)errs.push(label+(info?' ('+info+')':''));};
const p=await (await b.newContext({viewport:{width:1100,height:620}})).newPage();
p.on('pageerror',e=>errs.push('page: '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts|ERR_|net::/.test(m.text()))errs.push('console: '+m.text());});
await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
await p.goto('file://'+process.cwd()+'/'+(process.env.PAGE||'test_page.html'));await p.waitForTimeout(400);
await p.evaluate(()=>{let a=11;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
  // (frames stepped by hand and not drawn: the sounds follow the scene in the UI's tick, drawn or not)
  window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(!f)continue;
    const R=window.render;window.render=()=>{};try{f(window.__now);}finally{window.render=R;}}};
  window.runUntil=(pred,max)=>{let n=0;while(!pred()&&n<max){step(1);n++;}return n;};
  S.soundOn=true;ensureAudio();if(AC){const an=AC.createAnalyser();an.fftSize=4096;master.connect(an);window.__an=an;}
  window.level=()=>{const an=window.__an;if(!an)return-1;const d=new Float32Array(an.fftSize);an.getFloatTimeDomainData(d);let s=0;for(const v of d)s+=v*v;return+Math.sqrt(s/d.length).toFixed(5);};});
const level=()=>p.evaluate(()=>window.level()),wait=ms=>p.waitForTimeout(ms),QUIET=.0005,HEARD=.003;
await wait(300);
const st=await p.evaluate(()=>AC?AC.state:'none');
expect('the page\'s audio runs',st==='running',st);

// the opening: the engine once he starts the bike, and nothing of it once the opening is over
const o=await p.evaluate(()=>{storyGo('sundown');S.storyAuto=true;S.auto=true;step(2);const n=runUntil(()=>S.story.bike&&S.story.bike.run>0,8000);return{n,run:S.story.bike?S.story.bike.run:0};});
await wait(500);const ride=await level();
const o2=await p.evaluate(()=>{const n=runUntil(()=>S.story.key!=='sundown',30000);return{n,key:S.story.key,run:S.veh.filter(v=>v.kind==='bike'&&v.run>0).length};});
await wait(1500);const after=await level();
await p.evaluate(()=>step(2));await wait(200);await p.evaluate(()=>step(2));
const voice=await p.evaluate(()=>typeof ENG!=='undefined'&&ENG?'on':'stopped');
expect('the opening: the engine is heard once he starts the bike',o.run>0&&ride>HEARD,JSON.stringify({level:ride,frames:o.n}));
expect('the opening over, the engine is silent a second and a half later, and its voice is stopped',o2.key!=='sundown'&&o2.run===0&&after<QUIET&&voice==='stopped',
  JSON.stringify({level:after,voice,key:o2.key}));

// the checkpoint: his bike into the APC
const r=await p.evaluate(()=>{storyGo('roadblock');S.storyAuto=true;S.auto=true;step(2);const n=runUntil(()=>S.story.bike&&S.story.bike.wrecked,20000);return{n,wrecked:!!(S.story.bike&&S.story.bike.wrecked)};});
await wait(1500);const crash=await level();
expect('his bike into the APC: the engine is silent a second and a half later',r.wrecked&&crash<QUIET,JSON.stringify({level:crash,frames:r.n}));

// the chase: heard while he rides; the sound turned off silences it
const c=await p.evaluate(()=>{storyGo('chase');S.storyAuto=true;S.auto=true;step(2);return runUntil(()=>S.veh.some(v=>v.kind==='bike'&&v.run>0&&v.x>-160&&v.x<W+60),8000);});
await wait(500);const chaseOn=await level();
await p.evaluate(()=>{S.soundOn=false;step(2);});await wait(1000);const chaseOff=await level();
await p.evaluate(()=>{S.soundOn=true;storyQuit();});
expect('the chase: the engine is heard while he rides, and turning the sound off silences it',chaseOn>HEARD&&chaseOff<QUIET,JSON.stringify({on:chaseOn,off:chaseOff,frames:c}));

for(const l of rep)console.log(l);
console.log('errors',errs.length,JSON.stringify(errs));
await b.close();})();
