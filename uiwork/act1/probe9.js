// scene 9 on auto: each lesson's drill and bout, turn by turn
const {chromium}=require('playwright');
const KEY=process.argv[2]||'sh1',SECS=+(process.argv[3]||120),PAGE=process.env.PAGE||'test_page.html';
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[];
  const p=await (await b.newContext({viewport:{width:1100,height:620}})).newPage();
  p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+process.cwd()+'/'+PAGE);await p.waitForTimeout(400);
  const r=await p.evaluate(([KEY,SECS])=>{S.soundOn=false;let a=5;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
    window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    const ev=[];const cm=command;command=function(i,c){const ok=cm.apply(this,arguments);const R=S.act1&&S.act1.sh;if(ok&&R)ev.push(`${S.story.key} ${R.phase} n${R.n} his${R.his} hers${R.hers} | ${S.F[i].name}: ${c}`);return ok;};
    const sh=S.hooks.short;S.hooks.short=(e,d)=>{ev.push('   short:'+e+' '+(d&&d.A?d.A.name:'')+'>'+(d&&d.D?d.D.name:''));if(sh)sh(e,d);};
    storyGo(KEY);S.storyAuto=true;S.auto=true;step(2);const t0=S.t;let n=0;while(n<SECS*60&&S.story.step!=='done'){step(1);n++;}
    const R=S.act1&&S.act1.sh;return{key:S.story.key,step:S.story.step,R,K:{style:hero().style,moves:hero().styleMoves},ev:ev.slice(-60)};},[KEY,SECS]);
  console.log(JSON.stringify({key:r.key,step:r.step,R:r.R,K:r.K}));console.log(r.ev.join('\n'));console.log('errors',errs.length,JSON.stringify(errs.slice(0,4)));await b.close();})();
