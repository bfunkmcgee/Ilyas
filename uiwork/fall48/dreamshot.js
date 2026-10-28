// The fall at chosen seconds from its start, on auto: the desert in his head coming up as he thinks, the Pit, the waking.
// usage: node uiwork/fall48/dreamshot.js <outprefix> <w> <h> <dpr> <secs,...>   (PAGE=uiwork/qa_test.html for a copy: build.py --qa)
// Each still is <outprefix>_<secs>.png; a line per still says the thought, the dream's depth, the face's speed and the camera's top.
const {chromium}=require('playwright');const fs=require('fs');
const [OUT,Wd,Ht,DPR,TS]=[process.argv[2],+process.argv[3],+process.argv[4],+process.argv[5],(process.argv[6]||'3,12,25,37,43.5,44.2').split(',').map(Number)],PAGE=process.env.PAGE||'test_page.html';
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)});
  const p=await (await b.newContext({viewport:{width:Wd,height:Ht},deviceScaleFactor:DPR,isMobile:Wd<700,hasTouch:Wd<700})).newPage(),errs=[];
  p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+process.cwd()+'/'+PAGE);await p.waitForTimeout(300);
  await p.evaluate(()=>{S.soundOn=false;let a=5;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;window.__now=performance.now()+1000;
    window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    storyGo('fall');S.storyAuto=true;S.auto=true;step(2);window.__t0=S.t;});
  for(const T of TS){const r=await p.evaluate(T=>{let n=0;while(S.t<window.__t0+T&&n<60000){step(1);n++;}
      return{t:+(S.t-window.__t0).toFixed(2),thought:S.thought&&S.thought.text.slice(0,40),dream:+fallDream().toFixed(2),speed:Math.round(S.scrollYV),stage:S.pit&&S.pit.stage,camTop:Math.round(camTop())};},T);
    await p.screenshot({path:OUT+'_'+T+'.png'});console.log(JSON.stringify(r));}
  console.log('errors',JSON.stringify(errs.slice(0,4)));await b.close();})();
