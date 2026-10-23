// The HUD as a player sees it: a street fight (Kael and Mara against Vargo and Brask) at a phone held sideways, a phone held upright and
// a desktop, with a state to show (input: Kael's turn; menu: the drawer open; log: the log open; riposte: an opening).
// usage: node uiwork/hud_shots.js <outdir> [states, comma separated] [sizes: land,port,desk,tab] [arena]
const {chromium}=require('playwright');const fs=require('fs');
const OUT=process.argv[2]||'uiwork/hud',STATES=(process.argv[3]||'input').split(','),SZ=(process.argv[4]||'land,port,desk').split(','),AR=process.argv[5]||'street';
const SIZES={land:{w:844,h:390,dpr:2,mob:true},port:{w:390,h:844,dpr:2,mob:true},desk:{w:1440,h:900,dpr:1,mob:false},tab:{w:820,h:1180,dpr:1,mob:true},small:{w:1280,h:560,dpr:1,mob:false}};
fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)});
  for(const sz of SZ){const Z=SIZES[sz];
    for(const st of STATES){const errs=[];
      const ctx=await b.newContext({viewport:{width:Z.w,height:Z.h},deviceScaleFactor:Z.dpr,isMobile:Z.mob,hasTouch:Z.mob});const p=await ctx.newPage();
      p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts|ERR_|net::/.test(m.text()))errs.push('console: '+m.text());});
      await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
      await p.goto('file://'+process.cwd()+'/'+(process.env.PAGE||'test_page.html'));await p.waitForTimeout(250);
      const info=await p.evaluate(([st,AR])=>{S.soundOn=false;window.__now=performance.now()+1000;
        const step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
        let a=11;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
        S.arenaKey=AR;S.introOn=false;S.cfg.n=st==='crew'?1:2;S.cfg.crew=st==='crew';S.cfg.ally.on=true;S.auto=false;S.F=[];rosterBuild();restart();step(90);
        if(st==='over'||st==='crew'){const R0=window.render;window.render=()=>{};S.auto=true;S.allyAuto=true;if(S.game.phase==='input')S.game.aiAt=S.t+.1;
          for(let t=0;t<60*(st==='over'?900:25)&&S.game.phase!=='over';t++)step(1);window.render=R0;S.auto=false;step(5);}
        if(st==='riposte'){const R0=window.render;window.render=()=>{};let got=null;
          for(let t=0;t<3000&&!got;t++){step(1);const G=S.game,k=S.F[0];if(S.opening&&S.opening.f===k){got=1;break;}if(S.opening)continue;
            if(G.phase==='input'&&G.active===k.idx){const V=S.F.find(f=>f.team===1&&!f.dead);command(k.idx,Math.abs(k.station-V.station)>engageGap(k,V)+30?'advance':'guard');}
            else if(G.phase==='input'&&!isAI(G.active))command(G.active,'guard');if(G.phase==='over')break;}
          window.render=R0;step(2);}
        if(st==='menu')document.getElementById('menuBtn').click();
        if(st==='log')document.getElementById('logBtn').click();
        if(st==='aether')document.querySelector('#cmdTabs [data-tab="aether"]').click();
        if(st==='move')document.querySelector('#cmdTabs [data-tab="move"]').click();
        step(30);
        const q=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)];};
        return{mode:document.getElementById('wrap').dataset.mode,hud:document.getElementById('wrap').dataset.hud,insets:HUD_IN,cam:{x:Math.round(cam.x),w:Math.round(cam.viewW),T:Math.round(cam.T)},
          cv:[cv.width,cv.height,cssW,cssH],top:q('#hudTop'),cmds:q('#cmds'),commands:q('#commands'),tabs:q('#cmdTabs'),opening:S.opening?q('#opening .op-dock'):null,
          sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight,phase:S.game.phase,act:S.F[S.game.active].name};},[st,AR]);
      await p.waitForTimeout(st==='menu'||st==='log'?600:st==='over'?1500:300);
      await p.evaluate(()=>{for(let i=0;i<2;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}});
      await p.screenshot({path:`${OUT}/${sz}_${st}.png`});
      console.log(sz,st,JSON.stringify(info),'errors',errs.length,errs.slice(0,3).join(' | '));
      await ctx.close();}}
  await b.close();})();
