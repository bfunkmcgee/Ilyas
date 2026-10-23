// the toll's dock as the player sees it while held from behind, at phone sizes: the strike group (Needs two hands, Arm pinned) and
// the Arc-blade tab (dark)
const {chromium}=require('playwright');const fs=require('fs');
const OUT=process.argv[2]||'uiwork/act1/v51/dock',SEED=+(process.argv[3]||11),PAGE=process.env.PAGE||'uiwork/act1/mine6_test.html';
const SIZES=(process.argv[4]||'390,844,2,1;844,390,2,1;1100,620,1,0').split(';').map(s=>s.split(',').map(Number));
fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)});
  for(const [w,h,dpr,mob] of SIZES){const errs=[];const p=await (await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:dpr,isMobile:!!mob,hasTouch:!!mob})).newPage();
    p.on('pageerror',e=>errs.push(e.message));
    await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
    await p.goto('file://'+process.cwd()+'/'+PAGE);await p.waitForTimeout(300);
    const r=await p.evaluate(SEED=>{S.soundOn=false;let a=SEED;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
      window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
      // the player at the controls: the scenes' lines move on by themselves, and on each of his turns he presses a strike
      storyGo('toll');S.storyAuto=true;S.auto=false;step(2);let n=0;
      while(n<40000&&!(S.act1&&S.act1.toll&&S.act1.toll.gang==='held'&&S.game.phase==='input'&&S.game.active===0&&!S.opening)){
        // (a window of his own: the first answer it offers)
        if(S.opening&&S.opening.f===S.F[0]){const ch=openingChoices(S.opening);if(ch&&ch.length)resolveOpening(ch[0]);}
        if(S.story.step==='fight'&&S.game.phase==='input'&&S.game.active===0&&!S.opening&&!isAI(0)){for(const k of ['slash','thrust','overhead','advance','wait']){const b=document.getElementById('cmd-'+k);if(b&&!b.hidden&&!b.disabled){humanCommand(k);break;}}}
        step(1);n++;}
      step(8);
      const btn=k=>{const b=document.getElementById('cmd-'+k);return b?(b.hidden?'hidden':(document.getElementById('n-'+k).textContent+': '+document.getElementById('t-'+k).textContent+(b.disabled?' [off]':''))):null;};
      const wr=document.getElementById('wrap'),cm=document.getElementById('commands'),cs=getComputedStyle(cm);
      const dbg={op:wr.dataset.op,hud:wr.dataset.hud,mode:wr.dataset.mode,tab:cm.dataset.tab,vis:cs.visibility,disp:cs.display,opening:!document.getElementById('opening').hidden,S_op:!!S.opening,phase:S.game.phase,active:S.game.active,cut:!!S.cut,quiet:typeof storyQuiet==='function'?storyQuiet():null,rect:JSON.stringify(cm.getBoundingClientRect())};
      return{dbg,n,held:S.act1.toll.gang,cmds:['slash','overhead','thrust','sweep','shove','guard','advance','wait'].map(btn)};},SEED);
    await p.waitForTimeout(500);await p.evaluate(()=>{const t=document.querySelector('#cmdTabs button[data-tab="strike"]');if(t)t.click();step(4);});await p.waitForTimeout(700);await p.evaluate(()=>step(2));await p.screenshot({path:`${OUT}/held_strike_${w}x${h}.png`});
    if(w<1000){await p.evaluate(()=>{const t=document.getElementById('tabArc');if(t)t.click();step(4);});await p.waitForTimeout(700);await p.evaluate(()=>step(2));await p.screenshot({path:`${OUT}/held_arc_${w}x${h}.png`});}
    console.log(w,h,JSON.stringify(r),'errors',errs.length,JSON.stringify(errs.slice(0,3)));await p.close();}
  await b.close();})();
