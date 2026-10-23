// the top bar with a crowd: Kael and Mara against three on the street (and against a crew), upright and sideways
// usage: node uiwork/focus_shots.js <outdir> [sizes]
const {chromium}=require('playwright');const fs=require('fs');
const OUT=process.argv[2]||'uiwork/focus',SZ=(process.argv[3]||'port,tab,land').split(',');fs.mkdirSync(OUT,{recursive:true});
const SIZES={land:{w:844,h:390,dpr:2,mob:true},port:{w:390,h:844,dpr:2,mob:true},tab:{w:820,h:1180,dpr:1,mob:true},desk:{w:1440,h:900,dpr:1,mob:false}};
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[];
  for(const sz of SZ)for(const kind of ['three','crew']){const Z=SIZES[sz];
    const p=await (await b.newContext({viewport:{width:Z.w,height:Z.h},deviceScaleFactor:Z.dpr,isMobile:Z.mob,hasTouch:Z.mob})).newPage();
    p.on('pageerror',e=>errs.push(sz+': '+e.message));
    await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
    await p.goto('file://'+process.cwd()+'/'+(process.env.PAGE||'test_page.html'));await p.waitForTimeout(250);
    const r=await p.evaluate(kind=>{S.soundOn=false;window.__now=performance.now()+1000;const step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
      let a=11;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
      S.arenaKey='street';S.introOn=false;S.cfg.n=kind==='crew'?1:3;S.cfg.crew=kind==='crew';S.cfg.ally.on=true;S.auto=false;S.F=[];rosterBuild();restart();step(90);
      if(kind==='crew'){const R0=window.render;window.render=()=>{};S.auto=true;S.allyAuto=true;if(S.game.phase==='input')S.game.aiAt=S.t+.1;for(let t=0;t<60*20&&S.game.phase!=='over';t++)step(1);window.render=R0;S.auto=false;step(5);}
      const vis=[...document.querySelectorAll('#frows .frow')].filter(r=>r.offsetParent).map(r=>{const q=r.getBoundingClientRect();return r.id+'@'+Math.round(q.top)+(r.querySelector('.fpager')?':'+r.querySelector('.fpager').textContent+'/'+r.querySelectorAll('.fpager i').length:'');});
      return{mode:document.getElementById('wrap').dataset.mode,vis,top:Math.round(document.getElementById('hudTop').getBoundingClientRect().bottom),ins:HUD_IN.top,focus:HUD.focus};},kind);
    await p.screenshot({path:`${OUT}/${sz}_${kind}.png`});console.log(sz,kind,JSON.stringify(r));await p.context().close();}
  console.log('errors',errs.length,errs.slice(0,3).join(' | '));await b.close();})();
