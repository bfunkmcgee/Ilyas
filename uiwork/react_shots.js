// The answer window and a break, as a player sees them: a street fight (Kael and Mara against Vargo and Brask, or Kael against a
// crew) at a phone held sideways, a phone held upright and a desktop. States: react (the first blow at Kael: the answer window),
// broken (the first time Kael breaks an enemy: his free move), flow (a link of his flow two or more into the run), input (Kael's turn a
// few exchanges in).
// usage: node uiwork/react_shots.js <outdir> [states] [sizes] [arena] [crew]
const {chromium}=require('playwright');const fs=require('fs');
const OUT=process.argv[2]||'uiwork/react',STATES=(process.argv[3]||'react,broken').split(','),SZ=(process.argv[4]||'land,port,desk').split(','),AR=process.argv[5]||'street',CREW=process.argv[6]==='crew';
const SIZES={land:{w:844,h:390,dpr:2,mob:true},port:{w:390,h:844,dpr:2,mob:true},desk:{w:1440,h:900,dpr:1,mob:false}};
fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)});
  for(const sz of SZ){const Z=SIZES[sz];
    for(const st of STATES){const errs=[];
      const ctx=await b.newContext({viewport:{width:Z.w,height:Z.h},deviceScaleFactor:Z.dpr,isMobile:Z.mob,hasTouch:Z.mob});const p=await ctx.newPage();
      p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts|ERR_|net::/.test(m.text()))errs.push('console: '+m.text());});
      await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
      await p.goto('file://'+process.cwd()+'/'+(process.env.PAGE||'test_page.html'));await p.waitForTimeout(250);
      const info=await p.evaluate(([st,AR,CREW])=>{S.soundOn=false;window.__now=performance.now()+1000;
        const step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
        let a=CREW?23:11;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
        S.arenaKey=AR;S.introOn=false;S.cfg.n=CREW?1:2;S.cfg.crew=CREW;S.cfg.ally.on=!CREW;S.cfg.ally.auto=true;S.allyAuto=true;S.auto=false;S.F=[];rosterBuild();restart();step(90);
        const R0=window.render;window.render=()=>{};let got=null,seen=[];const K=S.F[0];
        // Kael closes and strikes; every window that is not the one wanted is answered by his own read
        for(let t=0;t<9000&&!got;t++){step(1);const G=S.game;
          if(S.opening){const o=S.opening;if(o.f===K&&((st==='react'&&o.source==='react')||(st==='broken'&&o.source==='broken')||(st==='flow'&&o.source==='flow'&&(o.link||0)>=2))){got=o.source;break;}
            if(o.f===K&&!isAI(K.idx)){seen.push(o.source);resolveOpening(aiOpening(o));}continue;}
          if(st==='input'&&G.phase==='input'&&G.active===K.idx&&G.turnNo>=6){got='input';break;}
          if(G.phase==='input'&&G.active===K.idx){let V=targetOf(K);if(!V||V.dead||!targetable(V)){V=S.F.filter(f=>f.team===1&&!f.dead&&!f.npc&&targetable(f)).sort((a,b)=>Math.abs(a.station-K.station)-Math.abs(b.station-K.station))[0];if(V)setTarget(V.idx);}if(!V)continue;
            const d=Math.abs(K.station-V.station);if(!command(K.idx,d>engageGap(K,V)+30?'advance':['slash','thrust','overhead'][G.turnNo%3]))command(K.idx,aiChoice(K.idx));}
          if(G.phase==='over')break;}
        window.render=R0;step(st==='react'?8:3);
        const q=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)];};
        const tx=s=>{const e=document.querySelector(s);return e?e.textContent.replace(/\s+/g,' ').trim():null;};
        return{got,seen:seen.slice(0,12),mode:document.getElementById('wrap').dataset.mode,turn:S.game.turnNo,
          card:S.opening?{title:tx('#opTitle'),sub:tx('#opSub'),reason:tx('#opReason'),hint:tx('#opHint'),btns:[...document.querySelectorAll('#opBtns button')].map(b=>[...b.children].map(c=>c.textContent.trim()).join(' | ')+(b.classList.contains('best')?' (best)':''))}:null,
          opening:S.opening?q('#opening .op-dock'):null,sw:document.documentElement.scrollWidth,
          F:S.F.map(f=>`${f.name} ${Math.round(f.hp)}/${f.maxHp} bal ${f.foot}/${footMaxOf(f)}${f.broken?' broken':''}${f.dead?' dead':''}`)};},[st,AR,CREW]);
      await p.waitForTimeout(300);
      await p.evaluate(()=>{for(let i=0;i<2;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}});
      await p.screenshot({path:`${OUT}/${sz}_${st}${CREW?'_crew':''}.png`});
      console.log(sz,st,JSON.stringify(info),'errors',errs.length,errs.slice(0,3).join(' | '));
      await ctx.close();}}
  await b.close();})();
