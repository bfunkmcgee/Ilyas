// An Act I stage played on auto in the QA page: stills at chosen seconds, and what was said and thought, in order.
// usage: node uiwork/act1/play.js <outdir> <stage> <w> <h> <dpr> <secs,...> [until stage]
const {chromium}=require('playwright');const fs=require('fs');
const OUT=process.argv[2],KEY=process.argv[3],Wd=+process.argv[4],Ht=+process.argv[5],DPR=+process.argv[6],SECS=(process.argv[7]||'1,3,6').split(',').map(Number),UNTIL=process.argv[8]||'';
fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[];
  const p=await (await b.newContext({viewport:{width:Wd,height:Ht},deviceScaleFactor:DPR,isMobile:Wd<700,hasTouch:Wd<700})).newPage();
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|Failed to load/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+process.cwd()+'/'+(process.env.PAGE||'uiwork/qa_test.html'));await p.waitForTimeout(400);
  await p.evaluate(K=>{S.soundOn=false;let a=5;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
    window.__now=performance.now()+1000;window.__log=[];let last=null,lastT=null;
    window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);
      const s=S.say;if(s&&s!==last){last=s;__log.push(`${S.story&&S.story.key} | ${s.who}: ${s.text}`);}
      const th=S.thought;if(th&&th!==lastT){lastT=th;__log.push(`${S.story&&S.story.key} | (thought) ${th.text}`);}}};
    storyGo(K);S.storyAuto=true;S.auto=true;step(2);window.__t0=S.t;},KEY);
  for(const sec of SECS){const r=await p.evaluate(sec=>{let n=0;while(S.t<__t0+sec&&n<20000){step(1);n++;}const K=hero();
      return{sec,t:+(S.t-__t0).toFixed(2),key:S.story&&S.story.key,step:S.story&&S.story.step,phase:S.game.phase,fade:+S.fade.toFixed(2),
        K:K?{x:Math.round(K.station),z:Math.round(K.lane),pel:[Math.round(K.p[PEL].x),Math.round(K.p[PEL].y)],head:[Math.round(K.p[HEAD].x),Math.round(K.p[HEAD].y)],one:!!K.oneArm,off:!!K.armOff,w:K.weaponKey,foot:K.foot,hp:K.hp}:null,
        ex:S.ex?{on:S.ex.on,used:S.ex.spots.map(s=>s.id+':'+s.used).join(' ')}:null,ended:S.story&&S.story.ended};},sec);
    await p.screenshot({path:`${OUT}/${KEY}_${String(sec).padStart(5,'0')}.png`});console.log(JSON.stringify(r));}
  const log=await p.evaluate(()=>__log);console.log(log.join('\n'));
  console.log('errors',errs.length,JSON.stringify(errs.slice(0,6)));await b.close();})();
