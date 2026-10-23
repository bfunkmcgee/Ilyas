// The timing checks: what drawing Kael, the cast, the weapons and the arc-blade costs a frame, raster included, on this
// software-rendered canvas. They run on their own (python3 test.py perf, the last step of a full run): with another suite loading the
// machine the times mean nothing. Each was the last section of its own suite (look, cast, arms, arc) and is unchanged here.
// usage: node sk_perf_page.js   (needs test_page.html from build.py). Ends with "errors 0 []".
const {chromium}=require('playwright');
const SK_T0=Date.now(),rep=[],errs=[];
function expect(label,cond,info){rep.push((cond?'ok   ':'FAIL ')+label+(process.env.SK_TIMING?' ['+((Date.now()-SK_T0)/1000).toFixed(1)+'s]':'')+(info!==undefined&&info!==''?'  '+info:''));if(!cond)errs.push(label+(info!==undefined?' ('+info+')':''));}
(async()=>{
  const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),pageErrs=[];
  // a page on the fake clock, the dice seeded, with the fight set up as the suite the check came from set it up
  const open=async(kind)=>{const p=await (await b.newContext({viewport:{width:1300,height:900},deviceScaleFactor:1})).newPage();
    p.on('pageerror',e=>pageErrs.push(e.message));
    await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
    await p.goto('file://'+process.cwd()+'/test_page.html');await p.waitForTimeout(300);
    await p.evaluate(kind=>{S.soundOn=false;let a={look:11,cast:17,arms:23,arc:31}[kind];Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
      window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
      if(kind==='look')window.fight=(o)=>{S.arenaKey=o.arena||'field';S.introOn=!!o.intro;S.tableOn=!!o.table;S.divOn=false;S.cfg.n=o.n||1;S.cfg.crew=!!o.crew;S.cfg.ally.on=!!o.ally;S.auto=!!o.auto;
        S.cfg.hero.weapon=o.hero||'elven';S.cfg.hero.skill=o.hs||4;(o.foes||['sword']).forEach((w,i)=>{S.cfg.foes[i].weapon=w;S.cfg.foes[i].skill=3;S.cfg.foes[i].temper='plain';});
        S.F=[];rosterBuild();restart();step(3);};
      else window.fight=(o)=>{S.arenaKey=o.arena||'restaurant';S.backroom=!!o.back;S.deep=!!o.deep;S.introOn=kind==='arms'&&!!o.intro;S.tableOn=false;S.divOn=false;S.cfg.n=o.n||1;S.cfg.crew=!!o.crew;S.cfg.ally.on=!!o.ally;S.auto=o.auto!==false;
        S.F=[];rosterBuild();restart();step(3);};},kind);
    return p;};
  {const p=await open('look'),ev=(fn,arg)=>p.evaluate(fn,arg);
  // ---- the cost ----
  // his own share of a frame: the canvas is flushed just before he is drawn (not counted) and just after (counted), so the raster
  // of his pieces is in the figure and nobody else's is; the median of five runs, plain and in a suit cut to ribbons
  const cost=await ev(()=>{fight({n:3,foes:['sword','axe','spear']});step(30);(()=>{const c=document.getElementById('cv');c.width=888;c.height=493;aspect=1.8;cssW=888;cssH=493;cam.T=H-cam.viewW/aspect;cam.tSet=true;})();const K=S.F[0],V=S.F[1],cv=document.getElementById('cv').getContext('2d');let ms=0,n=0,rb=0;
    const _k=KaelLook.draw;KaelLook.draw=function(c,F,o){if(F!==K)return _k.call(this,c,F,o);c.getImageData(0,0,1,1);let t=performance.now();c.getImageData(0,0,1,1);rb+=performance.now()-t;
      t=performance.now();const r=_k.call(this,c,F,o);c.getImageData(0,0,1,1);ms+=performance.now()-t;n++;return r;};
    const own=()=>{for(let i=0;i<30;i++)render();ms=0;n=0;rb=0;for(let i=0;i<150;i++)render();return(ms-rb)/n;},med=a=>a.sort((x,y)=>x-y)[a.length>>1];
    K.rips=[];K.hemTears=[];const plain=[],torn=[];
    for(let i=0;i<24;i++)S.hooks.rip(V,K,{kind:i%3?'slash':'thrust',tech:{key:'std',name:'Cut'},out:'crit',dmg:14},i%4===3?{x:K.p[KNF].x,y:K.p[KNF].y+3}:{x:K.p[CHE].x,y:K.p[CHE].y},['body','arm','leg','body'][i%4],true,null);
    const R=K.rips,HT=K.hemTears;S.dusts.length=0;
    for(let i=0;i<5;i++){K.rips=[];K.hemTears=[];plain.push(own());K.rips=R;K.hemTears=HT;torn.push(own());}
    KaelLook.draw=_k;return{plain:+med(plain).toFixed(3),torn:+med(torn).toFixed(3),rips:R.length,notches:HT.length};});
  expect('drawing him costs under 1.5 ms a frame, raster included, on this software-rendered canvas, and a suit cut to ribbons adds under 0.8 ms',
    cost.plain<1.5&&cost.torn<2&&cost.torn-cost.plain<.8&&cost.rips===16&&cost.notches>=1,JSON.stringify(cost));
  await p.context().close();}

  {const p=await open('cast'),ev=(fn,arg)=>p.evaluate(fn,arg);
  // ---- the cost ----
  // each figure's own share of a frame: the canvas is flushed before (not counted) and after (counted) it is drawn
  const cost=await ev(()=>{fight({n:3,ally:true});step(30);(()=>{const c=document.getElementById('cv');c.width=888;c.height=493;aspect=1.8;cssW=888;cssH=493;cam.T=H-cam.viewW/aspect;cam.tSet=true;})();const cv=document.getElementById('cv').getContext('2d');let ms=0,n=0,rb=0;
    const _c=CastLook.draw;CastLook.draw=function(c,F,spec,o){c.getImageData(0,0,1,1);let t=performance.now();c.getImageData(0,0,1,1);rb+=performance.now()-t;t=performance.now();const r=_c.call(this,c,F,spec,o);c.getImageData(0,0,1,1);ms+=performance.now()-t;n++;return r;};
    const run=()=>{for(let i=0;i<30;i++)render();ms=0;n=0;rb=0;for(let i=0;i<120;i++)render();return(ms-rb)/n;},med=a=>a.sort((x,y)=>x-y)[a.length>>1],r=[];
    for(let i=0;i<3;i++)r.push(run());CastLook.draw=_c;return{each:+med(r).toFixed(3)};});
  expect('each elf or crew member costs under 1.2 ms a frame, raster included, on this software-rendered canvas',cost.each<1.2,JSON.stringify(cost));
  await p.context().close();}

  {const p=await open('arms'),ev=(fn,arg)=>p.evaluate(fn,arg);
  // ---- the cost ----
  const cost=await ev(()=>{fight({n:3,crew:false,ally:true});step(30);(()=>{const c=document.getElementById('cv');c.width=888;c.height=493;aspect=1.8;cssW=888;cssH=493;cam.T=H-cam.viewW/aspect;cam.tSet=true;})();const cv=document.getElementById('cv').getContext('2d');let ms=0,n=0,rb=0;
    const _d=ArmsLook.draw;ArmsLook.draw=function(c){c.getImageData(0,0,1,1);let t=performance.now();c.getImageData(0,0,1,1);rb+=performance.now()-t;t=performance.now();const r=_d.apply(this,arguments);c.getImageData(0,0,1,1);ms+=performance.now()-t;n++;return r;};
    const run=()=>{for(let i=0;i<30;i++)render();ms=0;n=0;rb=0;for(let i=0;i<120;i++)render();return(ms-rb)/n;},med=a=>a.sort((x,y)=>x-y)[a.length>>1],r=[];
    for(let i=0;i<3;i++)r.push(run());ArmsLook.draw=_d;return{each:+med(r).toFixed(3)};});
  expect('each weapon costs under 0.3 ms a frame, raster included, on this software-rendered canvas',cost.each<.3,JSON.stringify(cost));
  await p.context().close();}

  {const p=await open('arc'),ev=(fn,arg)=>p.evaluate(fn,arg);
  // ---- the cost ----
  // timed on a canvas of its own with the blade in view at every scale (off the canvas the raster is skipped and the time means nothing)
  const cost=await ev(()=>{const cv=document.createElement('canvas');cv.width=1300;cv.height=900;const c=cv.getContext('2d');
    const time=(k,st,n)=>{c.setTransform(k,0,0,k,0,0);const h={x:420/k,y:420/k},t={x:h.x+40,y:h.y-30};
      for(let i=0;i<20;i++)ArmsLook.arc(c,h,t,1,st,null,{now:i*.016,L:{x:.3,y:-.9},k});c.getImageData(0,0,1,1);const t0=performance.now();
      for(let i=0;i<n;i++)ArmsLook.arc(c,h,t,1,st,null,{now:i*.016,L:{x:.3,y:-.9},k});c.getImageData(0,0,1,1);return+((performance.now()-t0)/n).toFixed(3);};
    return{game:time(1.4,null,300),close:time(4,null,200),lash:time(1.4,{mode:'lash',L:140},150),lashClose:time(4,{mode:'lash',L:140},80)};});
  expect('locked, the arc-blade costs under 0.2 ms a frame at game size and under 0.6 ms close up; out on the lash under 2 ms at game size and under 5 ms close up, raster included',
    cost.game<.2&&cost.close<.6&&cost.lash<2&&cost.lashClose<5,JSON.stringify(cost));
  await p.context().close();}

  expect('no page errors',pageErrs.length===0,pageErrs.slice(0,3).join(' | '));
  for(const l of rep)console.log(l);
  console.log('errors',errs.length,JSON.stringify(errs));
  await b.close();process.exit(errs.length?1:0);
})();
