// The yard scene (Act I scene 4) played through by hand, with a still at each of its moments.
// usage (from the repo): NODE_PATH=node_modules node uiwork/act1/yardshots.js <outdir> <w> <h> [only a,b,c]
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const OUT=process.argv[2],Wd=+(process.argv[3]||412),Ht=+(process.argv[4]||714),ONLY=(process.argv[5]||'').split(',').filter(Boolean),PAGE=process.env.PAGE||'test_page.html';
const {chromiumPath,pageSetup}=require(path.resolve('uiwork/look/places.js'));fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:chromiumPath()});
  const p=await (await b.newContext({viewport:{width:Wd,height:Ht},deviceScaleFactor:2,isMobile:Wd<700,hasTouch:Wd<700,reducedMotion:process.env.RM?'reduce':'no-preference'})).newPage(),errs=[];
  p.on('pageerror',e=>errs.push(e.message));await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+path.resolve(PAGE));await p.waitForTimeout(300);await p.evaluate(pageSetup);
  let n=0;const shot=async name=>{n++;const info=await p.evaluate(()=>{const K=hero(),E=S.ex;return{t:+(S.t-window.__t0).toFixed(1),step:S.story&&S.story.step,x:Math.round(K.station),d:Math.round(K.dep),camx:Math.round(cam.x),vw:Math.round(cam.viewW),hand:E&&E.hand&&E.hand.id,goal:(document.getElementById('exGoalT')||{}).textContent||'',say:S.say&&S.say.text&&S.say.text.slice(0,40)};});
    if(!ONLY.length||ONLY.includes(name))await p.screenshot({path:path.join(OUT,String(n).padStart(2,'0')+' '+name+'.jpg'),quality:86});console.log(String(n).padStart(2,'0'),name,JSON.stringify(info));};
  const run=async(cond,max)=>{for(let g=0;g<Math.ceil((max||3000)/60);g++){const d=await p.evaluate(c=>{const f=new Function('return ('+c+')');for(let i=0;i<60;i++){if(f())return true;step(1);}return f();},cond);if(d)return true;}return false;};
  const steps=async k=>{for(let i=0;i<k;i+=60)await p.evaluate(m=>step(m),Math.min(60,k-i));};
  await p.evaluate(()=>{storyGo('yard1');S.storyAuto=false;S.auto=false;step(2);window.__t0=S.t;drawing(true);});
  await steps(40);await shot('card');
  await run("!S.card&&S.fade<.05",900);await steps(20);await shot('opens');
  await run("!!S.say",600);await steps(30);await shot('tamm speaks');
  await p.evaluate(()=>{window.__adv=()=>{if(S.say)storyAdvance();};});
  for(let i=0;i<4;i++){await run("!S.say",400);await run("!!S.say||S.story.step==='explore'",600);await steps(25);if(i===1)await shot('second line');if(i===2)await shot('dob speaks');await p.evaluate(()=>window.__adv());}
  if(await run("S.act1.yardDoor>.75||S.story.step==='explore'",900))await shot('tamm goes in');
  await run("S.story.step==='explore'",2500);await steps(40);await shot('explore begins');
  const free="!S.ex.to&&!S.cut&&!hero().action";
  await p.evaluate(()=>exUse('bucket'));await steps(50);await shot('walking to the bucket');
  await run("!!S.cut||(!S.ex.to&&!hero().action)",900);await shot('drunk line or arrived');
  for(let i=0;i<3;i++){await run("!!S.say||!S.cut",400);if(await p.evaluate(()=>!!S.say)){await steps(20);await p.evaluate(()=>storyAdvance());await steps(5);}}
  await run("!S.cut",900);await p.evaluate(()=>exUse('bucket'));await run(free,1500);await steps(10);await shot('bucket taken');
  await p.evaluate(()=>exUse('pump'));await run("!!S.act1.pumping",1500);await steps(30);await shot('pumping');
  await run(free,1500);await steps(10);await shot('bucket full');
  await p.evaluate(()=>exUse('ladder'));await steps(120);await shot('to the ladder');
  await run("!!hero().action",1500);await steps(60);await shot('reaching for the ladder');
  await run("!!S.say",900);await steps(20);await shot('dob on the stairs');await p.evaluate(()=>storyAdvance());
  await run("!S.cut&&!hero().action",900);await steps(20);await shot('after the ladder');
  await p.evaluate(()=>exUse('stairgate'));await run(free,1800);await steps(10);await shot('at the gate, hand full');
  await p.evaluate(()=>document.getElementById('exDrop').click());await run(free,600);await steps(10);await shot('bucket set down');
  await p.evaluate(()=>exUse('stairgate'));await steps(30);await shot('opening the gate');await run(free,900);await steps(10);
  await p.evaluate(()=>{const fl=S.ex.spots.find(s=>s.floor&&!s.gone);if(fl)exUse(fl.id);});await run(free,900);await steps(10);await shot('bucket taken again');
  await p.evaluate(()=>exUse('stairs'));await steps(70);await shot('to the stairs');
  await run("S.fade>.3||S.story.key!=='yard1'",1500);await shot('going up');
  console.log('errors',JSON.stringify(errs.slice(0,3)));await b.close();})();
