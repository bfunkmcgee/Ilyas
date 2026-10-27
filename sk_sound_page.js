// The held sounds in the real page, heard: the page's own audio runs (no gesture needed for the check) and its output is measured at
// the master gain (the RMS of its last 4096 samples), with the game held still while the audio plays on. The bike's engine is heard
// while his bike runs and falls silent when the bike part is over (the opening's end, his bike into the APC at the checkpoint), and
// its voice is stopped; turning the sound off silences a running bike. (Before V62 the engine's throb was added onto its level, so the
// engine went on at full strength after every bike had stopped, from the opening to the end of the story.) The prologue's song
// (music/lepers_ascent.mp3, sk_storyui.js): it starts with the first scene and only there, plays on into the field, is held by the
// sound switch and let go when the story is left; over http (a server started here, as the published page has it) it goes through
// the audio graph at its level, and a copy handed over from another origin without leave plays on as a plain element.
// The recorded sounds (sfx/, sk_sfxui.js, since V69): a page opened as a file has none and plays the synthesized ones. Over http the
// fights' own and the stage's load beside the page; a call plays its recording, or the one it names, and is silent when it says
// another carries it; the stage's background plays, the bike's recordings take over from the synthesized engine, the sound switch
// silences them at once, and leaving the story lets every held sound go. Footsteps come from the feet coming down: none from men
// standing still in the lab, the field's floor under the men walking out of the maize.
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
const setup=()=>{let a=11;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
  // (frames stepped by hand and not drawn: the sounds follow the scene in the UI's tick, drawn or not)
  window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(!f)continue;
    const R=window.render;window.render=()=>{};try{f(window.__now);}finally{window.render=R;}}};
  window.runUntil=(pred,max)=>{let n=0;while(!pred()&&n<max){step(1);n++;}return n;};
  S.soundOn=true;ensureAudio();if(AC){const an=AC.createAnalyser();an.fftSize=4096;master.connect(an);window.__an=an;}
  window.level=()=>{const an=window.__an;if(!an)return-1;const d=new Float32Array(an.fftSize);an.getFloatTimeDomainData(d);let s=0;for(const v of d)s+=v*v;return+Math.sqrt(s/d.length).toFixed(5);};};
await p.evaluate(setup);
const level=()=>p.evaluate(()=>window.level()),wait=ms=>p.waitForTimeout(ms),QUIET=.0005,HEARD=.003;
await wait(300);
const st=await p.evaluate(()=>AC?AC.state:'none');
expect('the page\'s audio runs',st==='running',st);
{const f=await p.evaluate(()=>{step(4);const n=SFX.voices.length;S.hooks.sound('swoosh',1.5,{A:hero()});return{can:sfxCan(),bufs:Object.keys(SFX.bufs).length,voices:SFX.voices.length-n};});
  expect('a page opened as a file has no recordings and plays the synthesized sounds',!f.can&&!f.bufs&&!f.voices,JSON.stringify(f));}

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

// the prologue's song. This page is a local file, where it plays as a plain element (the audio graph would hear only silence). The
// song the first run of the opening started is let go now that the chase has left the story
await wait(1300);await p.evaluate(()=>step(2));
const q=await p.evaluate(()=>({el:!!MUSIC.el,on:MUSIC.on}));
expect('the song: leaving the story fades it out and lets it go',!q.el&&!q.on,JSON.stringify(q));
const ch=await p.evaluate(()=>{storyGo('field');step(2);const r={el:!!MUSIC.el,on:MUSIC.on};storyQuit();step(2);return r;});
expect('the song: a chapter picked from the menu does not start it',!ch.el&&!ch.on,JSON.stringify(ch));
await p.evaluate(()=>{storyGo(null);S.storyAuto=true;S.auto=true;step(2);});await wait(900);
const s1=await p.evaluate(()=>{step(2);const M=MUSIC,e=M.el;return{on:M.on,src:e?e.src.split('/').slice(-2).join('/'):'',playing:!!e&&!e.paused,t:e?+e.currentTime.toFixed(2):-1,vol:e?+e.volume.toFixed(2):-1};});
expect('the song: Begin starts it with the first scene, from the top, at its level',s1.on&&s1.src==='music/lepers_ascent.mp3'&&s1.playing&&s1.t>.2&&s1.t<5&&s1.vol===.5,JSON.stringify(s1));
const s2=await p.evaluate(()=>{const n=runUntil(()=>S.story.key!=='sundown',30000);step(2);const e=MUSIC.el;return{n,key:S.story.key,on:MUSIC.on,playing:!!e&&!e.paused};});
expect('the song: it plays on into the field',s2.key==='field'&&s2.on&&s2.playing,JSON.stringify(s2));
const h0=await p.evaluate(()=>{S.soundOn=false;step(2);return MUSIC.el?+MUSIC.el.currentTime.toFixed(2):-1;});
await wait(1300);
const h1=await p.evaluate(()=>{step(2);const e=MUSIC.el;return{on:MUSIC.on,paused:!!e&&e.paused,t:e?+e.currentTime.toFixed(2):-1};});
await p.evaluate(()=>{S.soundOn=true;step(2);});await wait(600);
const h2=await p.evaluate(()=>{step(2);const e=MUSIC.el;return{playing:!!e&&!e.paused,t:e?+e.currentTime.toFixed(2):-1,vol:e?+e.volume.toFixed(2):-1};});
expect('the song: sound off holds it where it is, and sound on carries it on from there',h1.on&&h1.paused&&h1.t-h0<1.6&&h2.playing&&h2.t>=h1.t&&h2.vol===.5,
  JSON.stringify({h0,h1,h2}));
await p.evaluate(()=>{storyQuit();step(2);});

// over http, as the published page has it: a server here hands over the page and the song from this folder (fresh each time). The
// song goes through the audio graph and is heard there at its level. Then the server hands the song over from another origin
// without leave: it will not load for the graph, and plays on as a plain element at its level
{const http=require('http'),fs=require('fs'),path=require('path'),root=process.cwd(),types={'.html':'text/html','.mp3':'audio/mpeg'};
  let away=false,portB=0;
  const send=(res,f)=>fs.readFile(f,(e,d)=>{if(e){res.writeHead(404);res.end();return;}
    res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream','Content-Length':d.length,'Cache-Control':'no-store'});res.end(d);});
  const listen=fn=>new Promise(r=>{const s=http.createServer(fn);s.listen(0,'127.0.0.1',()=>r(s));});
  const A=await listen((q,res)=>{const u=decodeURIComponent(q.url.split('?')[0]);
    if(away&&u==='/'+'music/lepers_ascent.mp3'){res.writeHead(302,{Location:'http://127.0.0.1:'+portB+'/song.mp3','Cache-Control':'no-store'});res.end();return;}
    const f=path.join(root,path.normalize(u));if(!f.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}send(res,f);});
  const B=await listen((q,res)=>send(res,path.join(root,'music','lepers_ascent.mp3')));portB=B.address().port;
  const h=await (await b.newContext({viewport:{width:1100,height:620}})).newPage();
  h.on('pageerror',e=>errs.push('http page: '+e.message));
  await h.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await h.goto('http://127.0.0.1:'+A.address().port+'/'+(process.env.PAGE||'test_page.html'));await h.waitForTimeout(400);
  await h.evaluate(setup);
  // the lab: its recordings load, and men standing still make no footsteps
  const loaded=async st=>{let r;for(let i=0;i<40;i++){r=await h.evaluate(st=>{step(1);const ks=[...SFX_FIGHT,...(st?SFX_STAGE[st]:['step_'+sfxFloor()])];
      return{miss:ks.filter(k=>!SFX.bufs[k]),bad:Object.keys(SFX.bad),queue:SFX.queue.length,busy:SFX.busy};},st);
    if(!r.miss.length&&!r.busy)break;await h.waitForTimeout(150);}return r;};
  const l0=await loaded(null);
  const l1=await h.evaluate(()=>{const seen=new Set(),out=[];for(let i=0;i<240;i++){step(1);for(const v of SFX.voices)if(!seen.has(v)){seen.add(v);out.push(v.key);}}
    return{floor:sfxFloor(),phase:S.game.phase,heard:out.filter(k=>/^step_|^scuff/.test(k))};});
  expect('the recordings over http: the fights\' own and the lab ground\'s footsteps load, and none fails',!l0.miss.length&&!l0.bad.length,JSON.stringify(l0));
  expect('the lab: men standing still make no footsteps (four seconds)',!l1.heard.length,JSON.stringify(l1));
  const g1=await h.evaluate(()=>{storyGo(null);S.storyAuto=true;S.auto=true;step(2);return{plain:MUSIC.plain,node:!!MUSIC.node};});
  await h.waitForTimeout(3500);
  const g2=await h.evaluate(()=>{step(2);const M=MUSIC,e=M.el,an=AC.createAnalyser();an.fftSize=4096;M.g.connect(an);window.__man=an;
    return{playing:!!e&&!e.paused,t:e?+e.currentTime.toFixed(2):-1,gain:+M.g.gain.value.toFixed(3)};});
  await h.waitForTimeout(250);
  const g3=await h.evaluate(()=>{const an=window.__man,d=new Float32Array(an.fftSize);an.getFloatTimeDomainData(d);let s=0;for(const v of d)s+=v*v;MUSIC.g.disconnect(an);return+Math.sqrt(s/d.length).toFixed(5);});
  expect('the song over http: through the audio graph, at its level, and heard there',!g1.plain&&g1.node&&g2.playing&&Math.abs(g2.gain-.5)<.01&&g3>HEARD,
    JSON.stringify({g1,g2,level:g3}));
  // the opening's recordings: loaded, played by the calls, the background and the bike held, the sound switch closing them at once
  const l2=await loaded('sundown');
  expect('the opening\'s recordings load with it',!l2.miss.length&&!l2.bad.length,JSON.stringify(l2));
  const c1=await h.evaluate(()=>{const K=hero(),keys=()=>SFX.voices.map(v=>v.key),call=(k,v,c)=>{const n=SFX.voices.length;S.hooks.sound(k,v,c);return keys().slice(n).join();};
    return{swoosh:call('swoosh',1.5,{A:K}),named:call('crit',30,{s:'finish_neck'}),carried:call('swoosh',1.5,{skip:'swing_mid'}),heavy:call('thud',500)};});   // (the road at sundown is dirt)
  expect('a call plays its recording, or the one it names; one that another recording carries is silent',
    c1.swoosh==='swing_mid'&&c1.named==='finish_neck'&&c1.carried===''&&c1.heavy==='thud_dirt',JSON.stringify(c1));
  const b1=await h.evaluate(()=>{const n=runUntil(()=>S.story.bike&&S.story.bike.run>0,8000);step(40);const an=AC.createAnalyser();an.fftSize=4096;SFX.bus.connect(an);window.__san=an;
    return{n,bed:!!SFX.loops['bed:amb_sundown_loop'],lo:!!SFX.loops.bikeLo,eng:!!ENG};});
  await h.waitForTimeout(500);
  const busLevel=()=>h.evaluate(()=>{const an=window.__san,d=new Float32Array(an.fftSize);an.getFloatTimeDomainData(d);let s=0;for(const v of d)s+=v*v;return+Math.sqrt(s/d.length).toFixed(5);});
  const b2=await busLevel();
  expect('the opening: the background and the bike\'s recordings play, and the synthesized engine stands down',b1.bed&&b1.lo&&!b1.eng&&b2>HEARD,JSON.stringify({b1,level:b2}));
  await h.evaluate(()=>{S.soundOn=false;step(2);});await h.waitForTimeout(400);const b3=await busLevel();
  await h.evaluate(()=>{S.soundOn=true;step(2);});
  expect('the sound switch silences the recordings at once',b3<QUIET,JSON.stringify({on:b2,off:b3}));
  await h.evaluate(()=>{storyQuit();step(2);});await h.waitForTimeout(1300);await h.evaluate(()=>step(2));
  const q1=await h.evaluate(()=>({loops:Object.keys(SFX.loops),bed:SFX.bed}));
  expect('leaving the story lets every held recording go',!q1.loops.length&&!q1.bed,JSON.stringify(q1));
  // the field: the men walking out of the maize, on its floor
  const w1=await h.evaluate(()=>{storyGo('field');S.storyAuto=true;S.auto=true;step(2);return 1;});
  await loaded('field');
  const w2=await h.evaluate(()=>{const seen=new Set(),out={};for(let i=0;i<600;i++){step(1);for(const v of SFX.voices)if(!seen.has(v)){seen.add(v);out[v.key]=(out[v.key]||0)+1;}}
    return{floor:sfxFloor(),heard:out};});
  const ws2=Object.keys(w2.heard).filter(k=>/^step_/.test(k));
  expect('the field: the men coming out of the maize are heard, and their steps on its floor',w1&&w2.heard.maize_push>0&&ws2.length===1&&ws2[0]==='step_dirt'&&w2.heard.step_dirt>2,JSON.stringify(w2));
  await h.evaluate(()=>{storyQuit();step(2);});await h.waitForTimeout(1300);await h.evaluate(()=>step(2));
  away=true;
  await h.evaluate(()=>{storyGo(null);S.storyAuto=true;S.auto=true;step(2);});await h.waitForTimeout(1500);
  const f2=await h.evaluate(()=>{step(2);const M=MUSIC,e=M.el;return{plain:M.plain,node:!!M.node,playing:!!e&&!e.paused,t:e?+e.currentTime.toFixed(2):-1,vol:e?+e.volume.toFixed(2):-1};});
  expect('the song over http, handed over from another origin without leave: a plain element plays it on, at its level',f2.plain&&!f2.node&&f2.playing&&f2.vol===.5,
    JSON.stringify(f2));
  await h.evaluate(()=>{storyQuit();step(2);});await h.close();
  for(const s of [A,B]){s.close();if(s.closeAllConnections)s.closeAllConnections();}}

for(const l of rep)console.log(l);
console.log('errors',errs.length,JSON.stringify(errs));
await b.close();})();
