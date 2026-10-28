// A still of a stage some seconds after it starts, on auto, cuts and all: node uiwork/act1/cutshot.js <out.png> <stage> <secs> [w h]
// PAGE=uiwork/qa_test.html points it at a copy (python3 build.py --qa).
const {chromium}=require('playwright');const fs=require('fs');
const [OUT,KEY]=[process.argv[2],process.argv[3]||'stairsdown'],T=+(process.argv[4]||2),Wd=+(process.argv[5]||1440),Ht=+(process.argv[6]||900),PAGE=process.env.PAGE||'test_page.html';
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)});
  const p=await (await b.newContext({viewport:{width:Wd,height:Ht},deviceScaleFactor:1,isMobile:Wd<700,hasTouch:Wd<700})).newPage(),errs=[];
  p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+process.cwd()+'/'+PAGE);await p.waitForTimeout(300);
  const r=await p.evaluate(([K,T])=>{S.soundOn=false;let a=5;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;window.__now=performance.now()+1000;
    const step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    storyGo(K);S.storyAuto=true;S.auto=true;step(2);const t0=S.t;let n=0;while(S.t<t0+T&&n<40000){step(1);n++;}
    return{key:S.story.key,step:S.story.step,x:Math.round(hero().station),cut:!!S.cut,camTop:Math.round(camTop())};},[KEY,T]);
  await p.screenshot({path:OUT});console.log(JSON.stringify(r),'errors',JSON.stringify(errs.slice(0,4)));await b.close();})();
