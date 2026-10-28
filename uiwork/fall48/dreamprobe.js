// The desert in his head through the whole fall: its depth and the face's speed every second, when the first blow came and when he
// woke, and what the painter's moving picture costs (live(), on average and while the dream is deep), raster included.
// usage: node uiwork/fall48/dreamprobe.js [w h]   (PAGE=uiwork/qa_test.html for a copy: build.py --qa)
const {chromium}=require('playwright');const fs=require('fs');const Wd=+(process.argv[2]||1440),Ht=+(process.argv[3]||900),PAGE=process.env.PAGE||'test_page.html';
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)});
  const p=await (await b.newContext({viewport:{width:Wd,height:Ht},deviceScaleFactor:Wd<700?2:1,isMobile:Wd<700,hasTouch:Wd<700})).newPage(),errs=[];
  p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+process.cwd()+'/'+PAGE);await p.waitForTimeout(300);
  const r=await p.evaluate(()=>{S.soundOn=false;let a=5;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;window.__now=performance.now()+1000;
    const step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    const F=EnvLook.S.fall,lv=F.live;let ms=0,nf=0,msD=0,nD=0;
    F.live=function(){ctx.getImageData(0,0,1,1);const t0=performance.now();lv();ctx.getImageData(0,0,1,1);const d=performance.now()-t0;ms+=d;nf++;if(F.dream.D>.5){msD+=d;nD++;}};
    storyGo('fall');S.storyAuto=true;S.auto=true;step(2);const t0=S.t,log=[];let n=0,firstHit=null,woke=null;
    while(S.story&&S.story.key==='fall'&&!S.story.ended&&n<9000){step(1);n++;const P=S.pit,u=S.t-t0;
      if(P&&P.impT>0&&firstHit==null)firstHit=+u.toFixed(2);if(P&&P.woke!=null&&woke==null)woke=+(P.woke-t0).toFixed(2);
      if(n%60===0)log.push([Math.round(u),+fallDream().toFixed(2),Math.round(S.scrollYV),P&&P.stage]);}
    F.live=lv;return{log,firstHit,woke,ms:+(ms/nf).toFixed(2),msDream:nD?+(msD/nD).toFixed(2):null};});
  console.log('[seconds, depth, speed, stage]: '+JSON.stringify(r.log));console.log(JSON.stringify({firstHit:r.firstHit,woke:r.woke,msLive:r.ms,msDream:r.msDream}));
  console.log('errors',JSON.stringify(errs.slice(0,4)));await b.close();})();
