// where a piece of the Pit's walls spends its time: node uiwork/wind/prof2.js <fnName> [w h dpr]
const {chromium}=require('playwright');
const FN=process.argv[2]||'farTile',Wd=+(process.argv[3]||1440),Ht=+(process.argv[4]||900),DPR=+(process.argv[5]||1);
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)});
  const ctx=await b.newContext({viewport:{width:Wd,height:Ht},deviceScaleFactor:DPR}),p=await ctx.newPage();
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+process.cwd()+'/uiwork/qa_test.html');await p.waitForTimeout(400);
  await p.evaluate(()=>{S.soundOn=false;let a=5;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
    window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    S.storyAuto=true;S.auto=true;storyBegin('fall',{auto:true});step(2);step(1700);});
  const cdp=await ctx.newCDPSession(p);await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:100});await cdp.send('Profiler.start');
  await p.evaluate(FN=>{const JK=EnvLook.S.fall.jk;for(let i=0;i<120;i++){if(FN==='nearTile'){for(const k of [...JK.tiles.keys()])if(k[0]==='n')JK.tiles.delete(k);}else EnvLook.S.fall.free();step(1);}},FN);
  const {profile}=await cdp.send('Profiler.stop');
  const byId={},parent={};for(const n of profile.nodes){byId[n.id]=n;for(const c of n.children||[])parent[c]=n.id;}
  const cnt={};profile.samples.forEach((id,i)=>{cnt[id]=(cnt[id]||0)+(profile.timeDeltas[i]||0);});
  const under=id=>{while(id!=null){if(byId[id].callFrame.functionName===FN)return true;id=parent[id];}return false;};
  const self={};let tot=0;for(const n of profile.nodes){const t=cnt[n.id]||0;if(!t||!under(n.id))continue;tot+=t;const k=n.callFrame.functionName||'(anon)';self[k]=(self[k]||0)+t;}
  console.log(FN,'total',(tot/1000).toFixed(0),'ms');console.log(Object.entries(self).sort((a,b)=>b[1]-a[1]).slice(0,26).map(([k,v])=>(v/1000).toFixed(1).padStart(7)+' ms '+k).join('\n'));await b.close();})();
