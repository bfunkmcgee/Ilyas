// Kael and one enemy placed by hand on a ground, still, for judging the shadows, reflections and light on them
// usage: node uiwork/pose_light.js <out.png> <arena|room> <kx> <kz> <ex> <ez> [w h] [crop x0,y0,x1,y1]
const {chromium}=require('playwright');
const [OUT,G,KX,KZ,EX,EZ]=[process.argv[2],process.argv[3]||'street',+(process.argv[4]||400),+(process.argv[5]||80),+(process.argv[6]||520),+(process.argv[7]||80)];
const VW=+(process.argv[8]||1440),VH=+(process.argv[9]||900),CROP=process.argv[10]?process.argv[10].split(',').map(Number):null;
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[];
  const p=await (await b.newContext({viewport:{width:VW,height:VH},deviceScaleFactor:1})).newPage();p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(([fk,q])=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};window.__FK=fk;window.__Q=q;},[+(process.env.FK||0),process.env.FXQ||'']);
  await p.goto('file://'+process.cwd()+'/'+(process.env.PAGE||'test_page.html'));await p.waitForTimeout(250);
  const r=await p.evaluate(([g,KX,KZ,EX,EZ])=>{S.soundOn=false;window.__now=performance.now()+1000;const step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    let a=9;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;if(window.__Q)FXL.set(window.__Q);if(window.__FK)FXL.fk.k=window.__FK;
    const room=['dining','kitchen','lobby','office'].includes(g);S.arenaKey=room?'restaurant':g;S.backroom=false;S.deep=false;S.introOn=false;S.cfg.n=1;S.cfg.crew=false;S.cfg.ally.on=false;S.auto=false;S.F=[];rosterBuild();restart();
    if(room&&g!=='dining'){S.room=g;}
    const put=(f,x,z,fa)=>{f.station=x;f.lane=z;f.dep=z;f.stepDep=z;f.vdep=0;f.facing=fa;f.build();};
    const K=S.F[0],V=S.F[1];put(K,KX,KZ,EX>KX?1:-1);put(V,EX,EZ,EX>KX?-1:1);
    const g0=S.game;g0.phase='input';g0.active=0;g0.aiAt=null;S.opening=null;g0.ex=null;step(60);
    return FXL.dbg();},[G,KX,KZ,EX,EZ]);
  if(CROP)await p.screenshot({path:OUT,clip:{x:CROP[0],y:CROP[1],width:CROP[2]-CROP[0],height:CROP[3]-CROP[1]}});else await p.screenshot({path:OUT});
  console.log(JSON.stringify(r).slice(0,900));console.log('errors',errs.length,errs.slice(0,3).join(' | '));await b.close();})();
