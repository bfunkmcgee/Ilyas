// The game's effects as they happen: an auto-battle on a fake clock, and when a sound fires (a hit, a crit, a clang, glass, a spell)
// a few frames are saved right after it, cropped round the fighters. For judging the look of hits, magic and light.
// usage: node uiwork/fx_shots.js <outdir> <arena> [seed] [kinds comma list] [max shots] [w h]
const {chromium}=require('playwright');const fs=require('fs');
const OUT=process.argv[2]||'uiwork/fx',AR=process.argv[3]||'street',SEED=+(process.argv[4]||7),KINDS=(process.argv[5]||'hit,crit,clang,glass,bolt,gale,blink').split(','),MAX=+(process.argv[6]||8),
  VW=+(process.argv[7]||1440),VH=+(process.argv[8]||900);
fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[];
  const p=await (await b.newContext({viewport:{width:VW,height:VH},deviceScaleFactor:1})).newPage();
  p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+process.cwd()+'/'+(process.env.PAGE||'test_page.html'));await p.waitForTimeout(250);
  await p.evaluate(([AR,SEED,KINDS])=>{S.soundOn=false;window.__now=performance.now()+1000;
    window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    let a=SEED;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
    S.arenaKey=AR;S.introOn=false;S.cfg.n=AR==='restaurant'?3:2;S.cfg.crew=false;S.cfg.ally.on=true;S.auto=true;S.allyAuto=true;S.F=[];rosterBuild();restart();
    if(S.game.phase==='input')S.game.aiAt=S.t+.1;
    window.__ev=[];const sd=S.hooks.sound;S.hooks.sound=(k,v)=>{if(KINDS.includes(k))window.__ev.push(k);return sd(k,v);};
  },[AR,SEED,KINDS]);
  let shots=0,frames=0;
  while(shots<MAX&&frames<60*240){
    const r=await p.evaluate(()=>{for(let i=0;i<20;i++){step(1);if(window.__ev.length)break;}const e=window.__ev.splice(0);return{e,phase:S.game.phase};});
    frames+=20;if(r.phase==='over')break;
    if(r.e.length){const k=r.e[0];
      for(const [d,tag] of [[2,'a'],[6,'b']]){await p.evaluate(d=>step(d),d);
        await p.screenshot({path:`${OUT}/${AR}_${String(shots).padStart(2,'0')}_${k}_${tag}.png`});}
      shots++;}}
  console.log('shots',shots,'frames',frames,'errors',errs.length,errs.slice(0,3).join(' | '));
  await b.close();})();
