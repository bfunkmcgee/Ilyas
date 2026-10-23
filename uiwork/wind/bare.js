// Kael with his coat off, cropped round him: node uiwork/wind/bare.js <out.png> <drain,...> <dpr> [frames] [facing] [arena]
const {chromium}=require('playwright');
const OUT=process.argv[2],DS=process.argv[3].split(',').map(Number),DPR=+process.argv[4],FR=+(process.argv[5]||90),FA=+(process.argv[6]||1),AR=process.argv[7]||'field';
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[];
  const p=await (await b.newContext({viewport:{width:1300,height:900},deviceScaleFactor:DPR})).newPage();
  p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+process.cwd()+'/'+(process.env.PAGE||'uiwork/qa_test.html'));await p.waitForTimeout(300);
  await p.evaluate(()=>{S.soundOn=false;let a=11;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
    window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};});
  for(const d of DS){const box=await p.evaluate(([d,fa,fr,ar])=>{S.arenaKey=ar;S.introOn=false;S.tableOn=false;S.divOn=false;S.cfg.n=1;S.cfg.crew=false;S.cfg.ally.on=false;S.auto=false;
      S.cfg.hero.weapon='elven';S.cfg.foes[0].weapon='sword';S.F=[];rosterBuild();restart();step(3);const K=S.F[0],V=S.F[1];
      const put=(f,x,z,fa)=>{f.station=x;f.lane=z;f.dep=z;f.stepDep=z;f.vdep=0;f.facing=fa;f.build();};put(K,420,92,fa);put(V,760,92,-1);K.coatOff=true;K.drain=d;step(fr);
      const cvs=document.getElementById('cv'),s=cvs.width/cam.viewW,L=cam.x-cam.viewW/2,T=camTop(),r=cvs.getBoundingClientRect(),k=r.width/cvs.width;
      const cx=(prjX(K.p[CHE].x,K.dep)-L)*s*k+r.left,cy=(prjY(K.p[CHE].y,K.dep)-T)*s*k+r.top;return{x:cx-80,y:cy-80,width:160,height:150,s:+s.toFixed(2)};},[d,FA,FR,AR]);
    const f=OUT.replace('.png','_'+d+'.png');await p.screenshot({path:f,clip:{x:box.x,y:box.y,width:box.width,height:box.height}});console.log(d,'scale',box.s,f);}
  console.log('errors',errs.length,JSON.stringify(errs.slice(0,3)));await b.close();})();
