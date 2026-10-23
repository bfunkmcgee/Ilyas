// the toll on auto: what happened (pins, breaks, who was down), turn by turn
const {chromium}=require('playwright');
const SEED=+(process.argv[2]||5),PAGE=process.env.PAGE||'uiwork/act1/mine6_test.html';
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[];
  const p=await (await b.newContext({viewport:{width:1100,height:620}})).newPage();
  p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+process.cwd()+'/'+PAGE);await p.waitForTimeout(400);
  const r=await p.evaluate(SEED=>{S.soundOn=false;let a=SEED;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
    window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    const ev=[];let lastT=null,lastG=null,lastB=0;
    storyGo('toll');S.storyAuto=true;S.auto=true;step(2);let n=0;
    while(n<30000&&S.story.step!=='done'){step(1);n++;const T=S.act1&&S.act1.toll;if(!T)continue;
      const g=S.game;const key=g.turnNo+':'+g.active;if(g.phase==='input'&&key!==lastT){lastT=key;const A=S.F[g.active];ev.push(`t${g.turnNo} ${A.name} hp:${S.F.map(f=>f.hp).join('/')} foot:${S.F.map(f=>f.foot).join('/')}`);}
      if(T.gang!==lastG){lastG=T.gang;ev.push('  gang:'+T.gang+' hits:'+T.hits);}
      if(T.breaks!==lastB){lastB=T.breaks;ev.push('  BROKEN #'+T.breaks);}}
    const T=S.act1.toll;return{n,secs:+(n/60).toFixed(1),toll:T,flags:S.story.flags,ended:S.story.ended,hp:S.F.map(f=>f.name+':'+f.hp),ev};},SEED);
  console.log(JSON.stringify({n:r.n,secs:r.secs,toll:r.toll,downedOne:r.flags.downedOne,ended:r.ended,hp:r.hp}));console.log(r.ev.join('\n'));console.log('errors',errs.length,JSON.stringify(errs.slice(0,4)));await b.close();})();
