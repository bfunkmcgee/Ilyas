// Kael drawn by KaelLook alone on a canvas of its own, at a chosen scale: node uiwork/wind/portrait.js <out.png> <scale> <drain,...> [frames] [pose:guard|easy]
const {chromium}=require('playwright');const fs=require('fs');
const OUT=process.argv[2],SC=+process.argv[3],DS=process.argv[4].split(',').map(Number),FR=+(process.argv[5]||60),POSE=process.argv[6]||'guard';
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[];
  const p=await (await b.newContext({viewport:{width:1300,height:900},deviceScaleFactor:1})).newPage();
  p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+process.cwd()+'/'+(process.env.PAGE||'uiwork/qa_test.html'));await p.waitForTimeout(300);
  const urls=await p.evaluate(([SC,DS,FR,POSE])=>{S.soundOn=false;let a=11;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
    window.__now=performance.now()+1000;const step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    S.arenaKey='field';S.introOn=false;S.tableOn=false;S.divOn=false;S.cfg.n=1;S.cfg.crew=false;S.cfg.ally.on=false;S.auto=false;S.cfg.hero.weapon='elven';S.cfg.foes[0].weapon='sword';
    S.F=[];rosterBuild();restart();step(3);const K=S.F[0],V=S.F[1];const put=(f,x,z,fa)=>{f.station=x;f.lane=z;f.dep=z;f.stepDep=z;f.vdep=0;f.facing=fa;f.build();};
    put(K,420,92,1);put(V,760,92,-1);K.coatOff=true;if(POSE==='easy'||POSE==='out')standEasy(K);step(FR);
    if(POSE==='out'){const C=K.p[CHE],set=(i,x,y)=>{K.p[i].x=K.p[i].px=C.x+x;K.p[i].y=K.p[i].py=C.y+y;};set(ELF,13,17);set(HAF,30,30);set(TIP,72,52);set(ELB,-13,17);set(HAB,-24,34);}
    const out=[];for(const d of DS){K.drain=d;const P=K.p[CHE],w=Math.round(110*SC),h=Math.round(120*SC),cv=document.createElement('canvas');cv.width=w;cv.height=h;const c=cv.getContext('2d');
      c.fillStyle='#1a1d22';c.fillRect(0,0,w,h);c.setTransform(SC,0,0,SC,w/2-P.x*SC,h*.42-P.y*SC);
      KaelLook.draw(c,K,{light:{x:P.x+300,y:P.y-200},now:S.t,wind:0});out.push(cv.toDataURL('image/png'));}
    return out;},[SC,DS,FR,POSE]);
  urls.forEach((u,i)=>{fs.writeFileSync(OUT.replace('.png','_'+DS[i]+'.png'),Buffer.from(u.split(',')[1],'base64'));});
  console.log('errors',errs.length,JSON.stringify(errs.slice(0,3)));await b.close();})();
