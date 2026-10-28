// A still of a stage once he walks about: node uiwork/act1/placeshot.js <out.png> <stage> [heroX|-] [camX|-] [w h] [secs]
// He is put at heroX ('-': where the stage put him); the camera is held at camX ('-': the game's own camera follows him); the stage's
// people stay where the stage put them. PAGE=uiwork/qa_test.html points it at a copy (python3 build.py --qa).
const {chromium}=require('playwright');const fs=require('fs');
const [OUT,KEY]=[process.argv[2],process.argv[3]||'stairsup'],num=v=>v===undefined||v==='-'?NaN:+v,HX=num(process.argv[4]),CX=num(process.argv[5]);
const Wd=+(process.argv[6]||1440),Ht=+(process.argv[7]||900),AFT=+(process.argv[8]||1.5),PAGE=process.env.PAGE||'test_page.html';
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)});
  const p=await (await b.newContext({viewport:{width:Wd,height:Ht},deviceScaleFactor:1,isMobile:Wd<700,hasTouch:Wd<700})).newPage(),errs=[];
  p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+process.cwd()+'/'+PAGE);await p.waitForTimeout(300);
  const r=await p.evaluate(([K,HX,CX,AFT])=>{S.soundOn=false;let a=5;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;window.__now=performance.now()+1000;
    const step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    storyGo(K);S.storyAuto=false;S.auto=false;step(2);let n=0;while(S.story.step!=='explore'&&S.story.step!=='fight'&&n<9000){step(1);n++;}
    const H=hero();if(HX===HX){H.station=HX;H.build();}const E=S.ex;if(E&&CX===CX)E.on=false;
    const t0=S.t;while(S.t<t0+AFT){if(CX===CX)camTo(CX,760,9);step(1);}return{step:S.story.step,x:Math.round(H.station)};},[KEY,HX,CX,AFT]);
  await p.screenshot({path:OUT});console.log(JSON.stringify(r),'errors',JSON.stringify(errs.slice(0,4)));await b.close();})();
