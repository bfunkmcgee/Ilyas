// Stills from a story stage at chosen frames: node uiwork/wind/shots.js <out> <stage> <w> <h> <dpr> <frame,frame,...> [clip x,y,w,h]
const {chromium}=require('playwright');const fs=require('fs');
const OUT=process.argv[2],K=process.argv[3],Wd=+process.argv[4],Ht=+process.argv[5],DPR=+process.argv[6],FR=process.argv[7].split(',').map(Number);fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[];
  const p=await (await b.newContext({viewport:{width:Wd,height:Ht},deviceScaleFactor:DPR,isMobile:Wd<700,hasTouch:Wd<700})).newPage();
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|Failed to load/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+process.cwd()+'/'+(process.env.PAGE||'uiwork/qa_test.html'));await p.waitForTimeout(400);
  await p.evaluate(K=>{S.soundOn=false;let a=5;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
    window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    S.storyAuto=true;S.auto=true;storyBegin(K,{auto:true});step(2);},K);
  let at=0;for(const fr of FR){const r=await p.evaluate(n=>{step(n);const K=S.F[0],B=K&&K.mount;return{t:+S.t.toFixed(2),key:S.story&&S.story.key,step:S.story&&S.story.step,scroll:S.scrollV,bvx:B?B.vx:null,pit:S.pit?S.pit.stage:null,coat:K&&K._coat?K._coat.q.map(q=>[Math.round(q.x),Math.round(q.y)]):null,pel:K?[Math.round(K.p[PEL].x),Math.round(K.p[PEL].y)]:null};},fr-at);at=fr;
    await p.screenshot({path:`${OUT}/${K}_${fr}.png`});console.log(fr,JSON.stringify(r));}
  console.log('errors',errs.length,JSON.stringify(errs.slice(0,5)));await b.close();})();
