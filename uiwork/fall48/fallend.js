// The fall's thoughts and its end: a still of the longest thought, then stills after he lands (seconds after the landing), with
// close-ups of his head and of the arm on the spike.
// usage: node uiwork/fall48/fallend.js <outdir> <w> <h> <dpr> [secs after landing, comma separated] [gore off|ink|red]
const {chromium}=require('playwright');const fs=require('fs');
const OUT=process.argv[2],Wd=+process.argv[3],Ht=+process.argv[4],DPR=+process.argv[5],SECS=(process.argv[6]||'.6,2.4,4,5.2,6.8,8.4,10').split(',').map(Number),GORE=process.argv[7]||'';
fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[];
  const p=await (await b.newContext({viewport:{width:Wd,height:Ht},deviceScaleFactor:DPR,isMobile:Wd<700,hasTouch:Wd<700})).newPage();
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|Failed to load/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+process.cwd()+'/'+(process.env.PAGE||'uiwork/qa_test.html'));await p.waitForTimeout(400);
  await p.evaluate(g=>{S.soundOn=false;let a=5;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;if(g)S.gore=g;
    window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    window.runUntil=(pred,max)=>{let n=0;while(!pred()&&n<max){step(1);n++;}return n;};
    window.scr=(x,y,d)=>{const cv=document.getElementById('cv'),s=cv.width/cam.viewW,L=cam.x-cam.viewW/2,T=camTop(),dpr=cv.width/cssW;return{x:(prjX(x,d)-L)*s/dpr,y:(prjY(y,d)-T)*s/dpr};};
    storyGo('fall');S.storyAuto=true;S.auto=true;step(2);},GORE);
  // the longest thought, half way through
  const th=await p.evaluate(()=>{runUntil(()=>S.thought&&/^The Rangers/.test(S.thought.text),4000);runUntil(()=>(S.t-S.thought.t0)/S.thought.dur>.5,600);return{t:+S.t.toFixed(2),text:S.thought.text};});
  await p.screenshot({path:`${OUT}/thought.png`});console.log('thought',JSON.stringify(th));
  const land=await p.evaluate(()=>{const n=runUntil(()=>S.pit&&S.pit.stage==='landed',6000);window.__land=S.t;return{n,t:+S.t.toFixed(2),arm:!!S.pit.arm};});console.log('landed',JSON.stringify(land));
  for(const sec of SECS){const r=await p.evaluate(sec=>{runUntil(()=>S.t>=window.__land+sec,2000);const K=hero(),P=S.pit,H=K.p[HEAD],hs=scr(H.x,H.y,K.dep);
      let arm=null;if(P.arm){const Q=P.arm.pts.map(q=>pitToW(q.x,q.y)),m={x:(Q[0].x+Q[1].x+Q[2].x)/3,y:(Q[0].y+Q[1].y+Q[2].y)/3};arm=scr(m.x,m.y,PIT_DEP);}
      const J=EnvLook.S.fall.jk;return{sec,t:+S.t.toFixed(2),eyeLit:+(K.eyeLit||0).toFixed(3),drain:K.drain,look:!!P.look,sy:Math.round(S.scrollY),head:hs,arm,miss:J.miss,painted:J.painted,fade:+S.fade.toFixed(2),ended:S.story&&S.story.ended};},sec);
    await p.screenshot({path:`${OUT}/end_${sec}.png`});
    const cl=(c,nm)=>{if(!c)return null;const w=150,h=110,x=Math.max(0,Math.min(Wd-w,c.x-w/2)),y=Math.max(0,Math.min(Ht-h,c.y-h/2));return p.screenshot({path:`${OUT}/${nm}_${sec}.png`,clip:{x,y,width:w,height:h}});};
    if(r.head.y>0&&r.head.y<Ht)await cl(r.head,'head');if(r.arm&&r.arm.y>0&&r.arm.y<Ht)await cl(r.arm,'arm');
    console.log(JSON.stringify(r));}
  console.log('errors',errs.length,JSON.stringify(errs.slice(0,5)));await b.close();})();
