// scene 9 as the player sees it: the styles screen after the first lesson, a drill with its box, a bout, at the sizes given
const {chromium}=require('playwright');const fs=require('fs');
const OUT=process.argv[2]||'uiwork/act1/v52/shots',PAGE=process.env.PAGE||'test_page.html';
const SIZES=(process.argv[3]||'390,844,2,1;844,390,2,1;1100,620,1,0').split(';').map(s=>s.split(',').map(Number));
fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)});
  for(const [w,h,dpr,mob] of SIZES){const errs=[];const p=await (await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:dpr,isMobile:!!mob,hasTouch:!!mob})).newPage();
    p.on('pageerror',e=>errs.push(e.message));
    await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
    await p.goto('file://'+process.cwd()+'/'+PAGE);await p.waitForTimeout(300);
    const run=(c,m)=>p.evaluate(([c,m])=>{const f=new Function('return '+c);let n=0;while(n<m&&!f()){step(1);n++;}return n;},[c,m]);
    await p.evaluate(()=>{S.soundOn=false;let a=7;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
      window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
      storyGo('sh1');S.storyAuto=true;S.auto=true;step(2);});
    // the stance drill, at the player's turn (the box with its hint)
    await run("S.story.step==='fight'&&S.game.phase==='input'&&S.game.active===0&&S.act1.sh.turns>=1",4000);
    await p.evaluate(()=>{S.auto=false;S.hooks.status();step(4);});await p.waitForTimeout(600);await p.evaluate(()=>step(2));
    await p.screenshot({path:`${OUT}/drill_${w}x${h}.png`});
    await p.evaluate(()=>{S.auto=true;S.game.aiAt=S.t;});
    // the styles screen
    await run("S.act1&&S.act1.styles&&S.act1.styles.open",20000);await p.evaluate(()=>step(4));await p.waitForTimeout(400);
    await p.screenshot({path:`${OUT}/styles_${w}x${h}.png`});
    // the last bout
    await p.evaluate(()=>{storyGo('sh6');S.storyAuto=true;S.auto=true;step(2);});
    await run("S.story.step==='fight'&&S.game.phase==='input'&&S.game.active===0&&S.act1.sh.turns>=2",6000);
    await p.evaluate(()=>{S.auto=false;S.hooks.status();step(4);});await p.waitForTimeout(600);await p.evaluate(()=>step(2));
    await p.screenshot({path:`${OUT}/bout_${w}x${h}.png`});
    console.log(w,h,'errors',errs.length,JSON.stringify(errs.slice(0,3)));await p.close();}
  await b.close();})();
