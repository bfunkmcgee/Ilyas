// the roof's last moments: frames round the drain, cropped round him: node uiwork/wind/drainshots.js <outdir> <w> <h> <dpr>
const {chromium}=require('playwright');const fs=require('fs');
const OUT=process.argv[2],Wd=+process.argv[3],Ht=+process.argv[4],DPR=+process.argv[5];fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[];
  const p=await (await b.newContext({viewport:{width:Wd,height:Ht},deviceScaleFactor:DPR,isMobile:Wd<700,hasTouch:Wd<700})).newPage();
  p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+process.cwd()+'/'+(process.env.PAGE||'uiwork/qa_test.html'));await p.waitForTimeout(400);
  await p.evaluate(()=>{S.soundOn=false;let a=5;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
    window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    S.storyAuto=true;S.auto=true;storyBegin('roof',{auto:true});step(2);});
  // run on until the drain starts, then take pictures as it goes and after
  const first=await p.evaluate(()=>{for(let i=0;i<30000;i++){step(1);const K=S.F[0];if(K.drain>0.001||S.story&&S.story.key!=='roof')return{i,t:+S.t.toFixed(2),d:K.drain,key:S.story&&S.story.key};}return null;});
  console.log('drain starts',JSON.stringify(first));
  for(const n of [0,8,16,24,40,70,110]){const r=await p.evaluate(n=>{step(n);const K=S.F[0],cvs=document.getElementById('cv'),s=cvs.width/cam.viewW,L=cam.x-cam.viewW/2,T=camTop(),R=cvs.getBoundingClientRect(),k=R.width/cvs.width;
      const cx=(prjX(K.p[CHE].x,K.dep)-L)*s*k+R.left,cy=(prjY(K.p[CHE].y,K.dep)-T)*s*k+R.top;return{d:+(K.drain||0).toFixed(2),t:+S.t.toFixed(2),box:{x:Math.max(0,cx-110),y:Math.max(0,cy-100),width:220,height:200}};},n);
    await p.screenshot({path:`${OUT}/roof_${String(r.t).replace('.','_')}.png`,clip:r.box});console.log(n,r.t,r.d);}
  console.log('errors',errs.length,JSON.stringify(errs.slice(0,5)));await b.close();})();
