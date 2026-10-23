// tile paints through the fall: node uiwork/wind/tilecost.js <w> <h> <dpr> <from> <to> [budget]
const {chromium}=require('playwright');
const Wd=+process.argv[2],Ht=+process.argv[3],DPR=+process.argv[4],A=+process.argv[5],B=+process.argv[6];
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)});
  const p=await (await b.newContext({viewport:{width:Wd,height:Ht},deviceScaleFactor:DPR,isMobile:Wd<700,hasTouch:Wd<700})).newPage();
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+process.cwd()+'/uiwork/qa_test.html');await p.waitForTimeout(400);
  const r=await p.evaluate(([A,B])=>{S.soundOn=false;let a=5;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
    window.__now=performance.now()+1000;const step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    const F=EnvLook.S.fall,JK=F.jk,lv=F.live;let on=false;const rows=[];
    F.live=function(){const n0=JK.painted,t=performance.now();const r=lv.apply(this,arguments);if(on)rows.push([JK.painted-n0,performance.now()-t,Math.abs(S.scrollYV||0)]);return r;};
    S.storyAuto=true;S.auto=true;storyBegin('fall',{auto:true});step(2);step(A);on=true;step(B-A);
    const by=k=>rows.filter(r=>r[0]===k),av=L=>L.length?+(L.reduce((s,r)=>s+r[1],0)/L.length).toFixed(2):0,mx=L=>L.length?+Math.max(...L.map(r=>r[1])).toFixed(2):0;
    return{miss:JK.miss,ms:Object.fromEntries(Object.entries(JK.ms).map(([k,v])=>[k,+v.toFixed(1)])),frames:rows.length,painted:JK.painted,tiles:JK.tiles.size,sc:+JK.sc.toFixed(2),f0:[by(0).length,av(by(0)),mx(by(0))],f1:[by(1).length,av(by(1)),mx(by(1))],f2:[by(2).length,av(by(2)),mx(by(2))],vmax:Math.round(Math.max(...rows.map(r=>r[2]))),v1000:rows.filter(r=>r[2]>1000).length,v600:rows.filter(r=>r[2]>600).length};},[A,B]);
  console.log(Wd+'x'+Ht+'@'+DPR,JSON.stringify(r));await b.close();})();
