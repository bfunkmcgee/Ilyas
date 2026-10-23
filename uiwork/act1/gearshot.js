// The gear screen as a player sees it: scene 3 stepped to it, a few slots changed, a still at each size
// usage: node uiwork/act1/gearshot.js <outdir> [w,h,dpr,mobile;...]
const {chromium}=require('playwright');const fs=require('fs');
const OUT=process.argv[2],SIZES=(process.argv[3]||'1100,620,2,0;844,390,3,1;390,844,3,1').split(';').map(s=>s.split(',').map(Number));
fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)});
  for(const [w,h,dpr,mob] of SIZES){const errs=[];const p=await (await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:dpr,isMobile:!!mob,hasTouch:!!mob})).newPage();
    p.on('pageerror',e=>errs.push(e.message));
    await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
    await p.goto('file://'+process.cwd()+'/'+(process.env.PAGE||'uiwork/qa_test.html'));await p.waitForTimeout(300);
    const r=await p.evaluate(()=>{S.soundOn=false;window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
      storyGo('lostprop');S.storyAuto=true;S.auto=true;step(2);let n=0;while(!(S.act1&&S.act1.gear&&S.act1.gear.open)&&n<4000){step(1);n++;}
      S.storyAuto=false;S.auto=false;step(4);act1GearStep('coat',1);act1GearStep('hands',1);a1GearFill(true);step(4);return{n,open:!!S.act1.gear.open};});
    await p.waitForTimeout(100);await p.evaluate(()=>{a1GearFill(true);});
    await p.screenshot({path:`${OUT}/gear_${w}x${h}.png`});console.log(w,h,JSON.stringify(r),'errors',errs.length,errs.slice(0,2));await p.context().close();}
  await b.close();})();
