// The gear screen's figure alone: scene 3 stepped to the gear screen, then for each try (a snippet run in the page first) the canvas
// shot on its own. usage: node uiwork/act1/figshot.js <outdir> <w,h,dpr,mobile> [tries.js: module.exports=[{name,code}]]
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const OUT=process.argv[2],[w,h,dpr,mob]=(process.argv[3]||'390,844,3,1').split(',').map(Number),TRIES=process.argv[4]?require(path.resolve(process.argv[4])):[{name:'now',code:''}];
fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)});const errs=[];
  const p=await (await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:dpr,isMobile:!!mob,hasTouch:!!mob})).newPage();
  p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+process.cwd()+'/'+(process.env.PAGE||'uiwork/qa_test.html'));await p.waitForTimeout(300);
  const r=await p.evaluate(kit=>{S.soundOn=false;window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    storyGo('lostprop');S.storyAuto=true;S.auto=true;step(2);let n=0;while(!(S.act1&&S.act1.gear&&S.act1.gear.open)&&n<4000){step(1);n++;}
    S.storyAuto=false;S.auto=false;step(4);if(kit)for(const [k,v] of Object.entries(JSON.parse(kit)))act1GearSet(k,v);a1GearFill(true);step(4);return{n,open:!!S.act1.gear.open,kit:JSON.stringify(S.act1.gear.kit)};},process.env.KIT||'');
  console.log(JSON.stringify(r));
  for(const T of TRIES){await p.evaluate(code=>{if(code)(0,eval)(code);a1GearFill(true);},T.code);await p.waitForTimeout(50);
    await p.locator('#a1GearFig').screenshot({path:`${OUT}/${T.name}.png`});}
  console.log('errors',errs.length,errs.slice(0,3));await b.close();})();
