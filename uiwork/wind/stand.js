// Kael standing in a set wind, cropped round him: node uiwork/wind/stand.js <out.png> <wind,wind,...> [facing] [frames]
const {chromium}=require('playwright');
const OUT=process.argv[2],WS=process.argv[3].split(',').map(Number),FA=+(process.argv[4]||1),FR=+(process.argv[5]||90);
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[];
  const p=await (await b.newContext({viewport:{width:1300,height:900},deviceScaleFactor:2})).newPage();
  p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.addInitScript(([l,t])=>{window.__lead=l;window.__trail=t;},[+(process.env.LEAD||0),+(process.env.TRAIL||0)]);await p.goto('file://'+process.cwd()+'/uiwork/qa_test.html');await p.waitForTimeout(300);
  await p.evaluate(()=>{S.soundOn=false;let a=11;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
    window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    window.fight=(o)=>{S.arenaKey=o.arena||'field';S.introOn=false;S.tableOn=false;S.divOn=false;S.cfg.n=1;S.cfg.crew=false;S.cfg.ally.on=false;S.auto=false;
      S.cfg.hero.weapon='elven';S.cfg.hero.skill=4;S.cfg.foes[0].weapon='sword';S.cfg.foes[0].skill=3;S.F=[];rosterBuild();restart();step(3);};
    window.put=(f,x,z,fa)=>{f.station=x;f.lane=z;f.dep=z;f.stepDep=z;f.vdep=0;f.facing=fa;f.build();};});
  const crops=[];
  for(const w of WS){const box=await p.evaluate(([w,fa,fr])=>{fight({arena:'field'});const K=S.F[0],V=S.F[1];put(K,420,92,fa);put(V,760,92,-1);
      window.kaelWind=()=>w;if(window.__lead)KaelLook.WIND.lead=window.__lead;if(window.__trail)KaelLook.WIND.trail=window.__trail;step(fr);const cvs=document.getElementById('cv'),s=cvs.width/cam.viewW,L=cam.x-cam.viewW/2,T=camTop(),r=cvs.getBoundingClientRect(),k=r.width/cvs.width;
      const cx=(prjX(K.p[PEL].x,K.dep)-L)*s*k+r.left,cy=(prjY(K.p[PEL].y,K.dep)-T)*s*k+r.top;return{x:cx-110,y:cy-120,w:220,h:200,coat:K._coat.q.map(q=>[Math.round(q.x-K.p[PEL].x),Math.round(q.y-K.p[PEL].y)])};},[w,FA,FR]);
    const f=OUT.replace('.png','_'+w+'.png');await p.screenshot({path:f,clip:{x:box.x,y:box.y,width:box.w,height:box.h}});crops.push(f);console.log(w,JSON.stringify(box.coat));}
  console.log('errors',errs.length,JSON.stringify(errs.slice(0,3)));await b.close();})();
