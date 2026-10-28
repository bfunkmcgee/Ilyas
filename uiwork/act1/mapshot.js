// The Pit map as it opens on a stage of scene 5: node uiwork/act1/mapshot.js <out.png> [stage] [w h]
// PAGE=uiwork/qa_test.html points it at a copy (python3 build.py --qa).
const {chromium}=require('playwright');const fs=require('fs');
const OUT=process.argv[2],KEY=process.argv[3]||'list',W=+(process.argv[4]||1000),H=+(process.argv[5]||800),PAGE=process.env.PAGE||'test_page.html';
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)});
  const p=await (await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,isMobile:W<700,hasTouch:W<700})).newPage(),errs=[];
  p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+process.cwd()+'/'+PAGE);await p.waitForTimeout(400);
  await p.evaluate(K=>{S.soundOn=false;window.__now=performance.now()+1000;const step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    storyGo(K);S.storyAuto=false;S.auto=false;step(2);let n=0;while(S.story.step!=='explore'&&n<6000){step(1);n++;}
    act1MapOpen();step(3);},KEY);
  const el=await p.$('#a1Map');await p.waitForTimeout(100);await (el||p).screenshot({path:OUT});console.log('errors',JSON.stringify(errs));await b.close();})();
