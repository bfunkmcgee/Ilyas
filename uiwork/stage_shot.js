// one story stage begun directly, a still every so many frames: node uiwork/stage_shot.js <outdir> <stage key> [frames per still] [stills]
const {chromium}=require('playwright');const fs=require('fs');
const OUT=process.argv[2]||'uiwork/stage',K=process.argv[3]||'roof',EV=+(process.argv[4]||300),N=+(process.argv[5]||4);fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[];
  const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|Failed to load/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+process.cwd()+'/'+(process.env.PAGE||'test_page.html'));await p.waitForTimeout(300);
  await p.evaluate(K=>{S.soundOn=false;let a=5;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
    window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    S.storyAuto=true;S.auto=true;storyBegin(K,{auto:true});step(2);},K);
  for(let i=0;i<N;i++){const r=await p.evaluate(EV=>{step(EV);return{key:S.story&&S.story.key,step:S.story&&S.story.step,scene:envKey(),fade:S.fade};},EV);
    await p.screenshot({path:`${OUT}/${K}_${i}.png`});console.log(i,JSON.stringify(r));}
  console.log('errors',errs.length,JSON.stringify(errs.slice(0,5)));await b.close();})();
