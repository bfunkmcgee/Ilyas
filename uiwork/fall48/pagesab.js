// Two builds of the game side by side at the same moments of the fall: each page held at the moment and its frame drawn again and
// again (render only, raster included), the two by turns, the median of six rounds. To time a build before a change, build a copy of
// the sources before it (git archive HEAD | tar -x -C <dir>, then python3 build.py --qa there).
// usage: node uiwork/fall48/pagesab.js w h dpr <secs,...> <pageA> <pageB> [full|lite|off]
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const [Wd,Ht,DPR,TS,PA,PB,Q]=[+process.argv[2],+process.argv[3],+process.argv[4],process.argv[5].split(',').map(Number),process.argv[6],process.argv[7],process.argv[8]||'full'];
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[];
  const open=async P=>{const p=await (await b.newContext({viewport:{width:Wd,height:Ht},deviceScaleFactor:DPR,isMobile:Wd<700,hasTouch:Wd<700})).newPage();
    p.on('pageerror',e=>errs.push(e.message));await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
    await p.goto('file://'+path.resolve(P));await p.waitForTimeout(300);
    await p.evaluate(Q=>{S.soundOn=false;let a=5;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;window.__now=performance.now()+1000;
      window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
      storyGo('fall');S.storyAuto=true;S.auto=true;step(2);window.__t0=S.t;window.__Q=Q;},Q);return p;};
  const A=await open(PA),B=await open(PB),out=[];
  for(const T of TS){for(const p of [A,B])await p.evaluate(T=>{let n=0;while(S.t<window.__t0+T&&n<60000){step(1);n++;}if(typeof FXL!=='undefined'&&FXL.q!==window.__Q)FXL.set(window.__Q);},T);
    const run=p=>p.evaluate(()=>{let L=0;for(let i=0;i<16;i++){ctx.getImageData(0,0,1,1);const s0=performance.now();render();ctx.getImageData(0,0,1,1);L+=performance.now()-s0;}return L/16;});
    const ra=[],rb=[];for(let k=0;k<6;k++){ra.push(await run(A));rb.push(await run(B));}
    const med=a=>{const s=a.slice().sort((x,y)=>x-y);return+((s[2]+s[3])/2).toFixed(2);};
    const D=await B.evaluate(()=>+(typeof fallDream==='function'?fallDream():0).toFixed(2));
    out.push({t:T,D,A:med(ra),B:med(rb),dB:+(med(rb)-med(ra)).toFixed(2)});}
  for(const o of out)console.log(JSON.stringify(o));console.log('errors',JSON.stringify(errs.slice(0,4)));await b.close();})();
