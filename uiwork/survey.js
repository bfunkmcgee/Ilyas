// One still of every ground and room at a fighting moment, for judging light and atmosphere.
// usage: node uiwork/survey.js <outdir> [w h dpr] [list of grounds: street,field,hill,ledge,wall,dining,kitchen,lobby,office]
const {chromium}=require('playwright');const fs=require('fs');
const OUT=process.argv[2]||'uiwork/survey',VW=+(process.argv[3]||1440),VH=+(process.argv[4]||900),DPR=+(process.argv[5]||1),
  LIST=(process.argv[6]||'street,field,hill,ledge,wall,dining,kitchen,lobby,office').split(',');
fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[];
  for(const g of LIST){
    const p=await (await b.newContext({viewport:{width:VW,height:VH},deviceScaleFactor:DPR})).newPage();p.on('pageerror',e=>errs.push(g+': '+e.message));
    await p.addInitScript(q=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};window.__FXQ=q;},process.env.FXQ||'');
    await p.goto('file://'+process.cwd()+'/'+(process.env.PAGE||'test_page.html'));await p.waitForTimeout(250);
    const r=await p.evaluate(g=>{S.soundOn=false;window.__now=performance.now()+1000;const step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
      let a=9;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;if(window.__FXQ)FXL.set(window.__FXQ);
      const room=['dining','kitchen','lobby','office'].includes(g);
      S.arenaKey=room?'restaurant':g;S.backroom=room;S.deep=room;S.introOn=false;S.cfg.n=g==='office'?1:2;S.cfg.crew=false;S.cfg.ally.on=true;S.auto=true;S.allyAuto=true;S.F=[];rosterBuild();restart();
      const R0=window.render;window.render=()=>{};
      const clearNow=()=>{if(S.crew)S.crew.queue.length=0;S.opening=null;S.game.ex=null;for(const f of foes()){f.hp=0;kill(f,1);}if(nextRoom()){beginTransit();return true;}return false;};
      const runUntil=(pred,max)=>{let n=0;while(!pred()&&n<max){step(1);n++;}return n;};
      if(room&&g!=='dining'){for(const r of ['dining','kitchen','lobby']){if(r===g)break;runUntil(()=>S.room===r&&!S.stage.tr&&(S.game.phase==='input'||S.game.phase==='exchange'),20000);clearNow();}
        runUntil(()=>S.room===g&&!S.stage.tr&&(S.game.phase==='input'||S.game.phase==='exchange'),20000);}
      if(S.game.phase==='input')S.game.aiAt=S.t+.1;
      // into the fight a little, until someone is mid-swing
      runUntil(()=>S.game.phase==='exchange'&&S.game.ex&&S.t>(window.__t0||(window.__t0=S.t))+3,6000);step(14);
      window.render=R0;step(2);return{room:S.room,arena:S.arenaKey,phase:S.game.phase};},g);
    await p.screenshot({path:`${OUT}/${g}.png`});console.log(g,JSON.stringify(r));await p.context().close();}
  console.log('errors',errs.length,errs.slice(0,4).join(' | '));await b.close();})();
