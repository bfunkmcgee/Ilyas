// the Act I menu as the player sees it: a stage played on auto for some seconds (or until a test), a still of the stage (the
// menu button's mark, the note), then the menu opened, a still of each tab asked for
// usage: node uiwork/act1/pmshot.js <outdir> <stage> <secs|js-test> [w,h,dpr,mob;...] [tabs,...]
const {chromium}=require('playwright');const fs=require('fs');
const OUT=process.argv[2],KEY=process.argv[3],UNTIL=process.argv[4]||'4',SIZES=(process.argv[5]||'390,844,3,1;1100,620,2,0').split(';').map(s=>s.split(',').map(Number)),TABS=(process.argv[6]||'').split(',').filter(Boolean);
fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)});
  for(const [w,h,dpr,mob] of SIZES){const errs=[];const p=await (await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:dpr,isMobile:!!mob,hasTouch:!!mob})).newPage();
    p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|Failed to load/.test(m.text()))errs.push(m.text());});
    await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
    await p.goto('file://'+process.cwd()+'/'+(process.env.PAGE||'uiwork/qa_test.html'));await p.waitForTimeout(300);
    const r=await p.evaluate(([K,U])=>{S.soundOn=false;let a=5;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
      window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
      storyGo(K);S.storyAuto=true;S.auto=true;step(2);const t0=S.t;let n=0;const test=isNaN(+U)?new Function('return ('+U+')'):null;
      while((test?!test():S.t<t0+(+U))&&n<30000){step(1);n++;}S.storyAuto=false;S.auto=false;step(3);
      const mb=document.getElementById('menuBtn'),t=document.getElementById('pmToast');
      return{n,t:+(S.t-t0).toFixed(1),key:S.story.key,step:S.story.step,ex:exOn(),open:pitMenuOpen().map(m=>m.id).join(','),badge:mb.dataset.new||'',toast:t&&!t.hidden?t.textContent:null};},[KEY,UNTIL]);
    await p.screenshot({path:`${OUT}/${KEY}_${w}x${h}_0stage.png`});console.log(w,h,JSON.stringify(r));
    await p.evaluate(()=>{document.getElementById('menuBtn').click();step(2);});await p.waitForTimeout(450);
    const m=await p.evaluate(()=>({tab:HUD.dtab,tabs:[...document.querySelectorAll('#sideCol .drawer-tabs button')].filter(b=>b.offsetParent).map(b=>b.textContent).join(','),title:document.querySelector('#sideCol .drawer-title').textContent,sub:document.getElementById('drawerSub').textContent,badge:document.getElementById('menuBtn').dataset.new||''}));
    console.log('  menu',JSON.stringify(m));await p.screenshot({path:`${OUT}/${KEY}_${w}x${h}_1menu.png`});
    for(const tb of TABS){await p.evaluate(tb=>{const b=document.querySelector(`#sideCol .drawer-tabs button[data-dtab="${tb}"]`);if(b)b.click();},tb);await p.waitForTimeout(150);
      await p.screenshot({path:`${OUT}/${KEY}_${w}x${h}_2${tb}.png`,fullPage:false});}
    console.log('  errors',errs.length,JSON.stringify(errs.slice(0,4)));await p.context().close();}
  await b.close();})();
