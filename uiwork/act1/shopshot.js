// Scene 5's screens as a player sees them: the map from Tamm's list, a stall's shop on the Shelf with things bought, the satchel alone
// usage: node uiwork/act1/shopshot.js <outdir> [w,h,dpr,mobile;...]
const {chromium}=require('playwright');const fs=require('fs');
const OUT=process.argv[2],SIZES=(process.argv[3]||'1100,620,2,0;844,390,3,1;390,844,3,1').split(';').map(s=>s.split(',').map(Number));
fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)});
  for(const [w,h,dpr,mob] of SIZES){const errs=[];const p=await (await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:dpr,isMobile:!!mob,hasTouch:!!mob})).newPage();
    p.on('pageerror',e=>errs.push(e.message));
    await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
    await p.goto('file://'+process.cwd()+'/'+(process.env.PAGE||'uiwork/qa_test.html'));await p.waitForTimeout(300);
    await p.evaluate(()=>{S.soundOn=false;window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
      storyGo('list');S.storyAuto=true;S.auto=true;step(2);let n=0;while(!(S.act1&&S.act1.map&&S.act1.map.open)&&n<3000){step(1);n++;}S.storyAuto=false;S.auto=false;step(6);});
    await p.screenshot({path:`${OUT}/map_${w}x${h}.png`});
    const r=await p.evaluate(()=>{storyGo('shelf');S.storyAuto=false;S.auto=false;step(2);let n=0;while(S.story.step!=='explore'&&n<3000){step(1);n++;}
      errandBuy('oil','oil','chit');act1ShopOpen('grain');step(4);act1ShopBuy('rice','coin');act1ShopBuy('salt','coin');a1ShopFill();step(4);return{errand:JSON.stringify(S.act1.errand)};});
    await p.screenshot({path:`${OUT}/shop_${w}x${h}.png`});
    await p.evaluate(()=>{act1ShopClose();step(4);A1M.bagOnly=true;errandToHand(S.act1.errand.bag.indexOf('rice'));a1ShopFill();step(4);});
    await p.screenshot({path:`${OUT}/bag_${w}x${h}.png`});
    console.log(w,h,JSON.stringify(r),'errors',errs.length,errs.slice(0,2));await p.context().close();}
  await b.close();})();
