// The push-in as a player meets it on an upright phone, in real time: a story stage's fight (or a lab ground: lab_<arena>) run to the
// player's turn, a move picked, then the action played on with the player's opening cards answered; three shots, his turn
// (<out>_1turn.jpg), the action with no card up (<out>_2act.jpg, once the camera has settled) and his card up (<out>_3card.jpg), each
// with the camera's width and top, the card's height met, the scene layer's measured foot, scale and paint time, and `empty`: the share
// of the canvas's rows below the top bar that are flat black (the audit's test). Shots are of the page, HUD and all.
// usage: node uiwork/look/push.js <stage|lab_arena> <outprefix> [w h] [reduce]   (PAGE=uiwork/qa_test.html for a copy: build.py --qa)
const {chromium}=require('playwright'),path=require('path');const [K,OUT,WW,HH,RED]=process.argv.slice(2);const PAGE=process.env.PAGE||'test_page.html';
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)});
  const ctx=await b.newContext({viewport:{width:+WW||412,height:+HH||714},deviceScaleFactor:2,isMobile:true,hasTouch:true,reducedMotion:RED?'reduce':'no-preference'});
  const p=await ctx.newPage(),errs=[];p.on('pageerror',e=>errs.push(e.message));await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+path.resolve(PAGE));await p.waitForTimeout(300);
  const ok=await p.evaluate(K=>{S.soundOn=false;let a=5;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
    window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    window.R0=window.render;window.render=()=>{};
    if(K.startsWith('lab_')){S.arenaKey=K.slice(4);S.introOn=false;S.cfg.n=3;S.auto=false;S.F=[];rosterBuild();restart();}else{storyGo(K);S.storyAuto=true;}S.auto=false;step(2);let n=0,run=0;
    while(n<30000){step(1);n++;if((K.startsWith('lab_')||S.story&&S.story.step==='fight')&&S.game.phase==='input'&&!isAI(S.game.active)){run++;if(run>200)break;}else run=0;}
    window.render=window.R0;step(40);
    window.__empty=()=>{const d=ctx.getImageData(0,0,cv.width,cv.height).data,W2=cv.width,H2=cv.height,lum=(r,g,b)=>.2126*r+.7152*g+.0722*b,yh=Math.round(HUD_IN.top*H2/Math.max(1,cssH));let er=0,rows=0;
      for(let y=yh;y<H2;y+=4){let s2=0,q2=0,c=0;for(let x=0;x<W2;x+=4){const i=(y*W2+x)*4,L=lum(d[i]/255,d[i+1]/255,d[i+2]/255);s2+=L;q2+=L*L;c++;}rows++;const mu=s2/c;if(mu<.035&&Math.sqrt(Math.max(0,q2/c-mu*mu))<.006)er++;}
      return+(er/Math.max(1,rows)).toFixed(2);};
    window.__st=()=>{const L=typeof SCENE_LY!=='undefined'?SCENE_LY:null;return{empty:__empty(),ph:S.game.phase,drop:HUD.drop,op:document.getElementById('wrap').dataset.op||'',hu:!!(S.opening&&!isAI(S.opening.f.idx)),
      vw:Math.round(cam.viewW),T:Math.round(cam.T),card:Math.round(camCardH()),foot:L?Math.round(L.foot):null,sc:L?+L.sc.toFixed(2):null,ms:L?Math.round(L.ms):null};};
    window.__hold=false;window.__iv=setInterval(()=>{if(!window.__hold)step(1);if(S.opening&&!isAI(S.opening.f.idx)&&S.opening.left<S.opening.dur*.5&&!window.__keep){const ob=[...document.querySelectorAll('#opBtns button')].find(x=>!x.disabled);if(ob)ob.click();}},16);
    return S.game.phase==='input';},K);
  if(!ok){console.log(K,'no turn came');await b.close();return;}
  const st=()=>p.evaluate(()=>__st());
  console.log('turn',JSON.stringify(await st()));await p.screenshot({path:`${OUT}_1turn.jpg`,type:'jpeg',quality:80});
  await p.evaluate(()=>{const btn=[...document.querySelectorAll('#cmds .cmd')].find(x=>x.offsetParent&&!x.disabled);if(btn)btn.click();});
  let gotA=false,gotC=false,since=0;const t0=Date.now();
  while(Date.now()-t0<20000&&!(gotA&&gotC)){await p.waitForTimeout(100);const s=await st();
    if(s.drop&&!s.op){since+=100;if(!gotA&&since>=1200){gotA=true;await p.evaluate(()=>{window.__hold=true;});console.log('action',JSON.stringify(s));await p.screenshot({path:`${OUT}_2act.jpg`,type:'jpeg',quality:80});await p.evaluate(()=>{window.__hold=false;});}}else since=0;
    if(s.hu&&!gotC){await p.evaluate(()=>{window.__keep=true;window.__hold=true;});await p.waitForTimeout(400);console.log('card',JSON.stringify(await st()));await p.screenshot({path:`${OUT}_3card.jpg`,type:'jpeg',quality:80});gotC=true;await p.evaluate(()=>{window.__keep=false;window.__hold=false;});}}
  await p.evaluate(()=>clearInterval(__iv));if(errs.length)console.log('errors',errs.slice(0,3));await b.close();})();
