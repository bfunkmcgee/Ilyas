// scene 7 on auto: the beats, the moves the engine played (S.hooks.short), what the collectors and Tamm were left with
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[];
  const p=await (await b.newContext({viewport:{width:1100,height:620}})).newPage();
  p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+process.cwd()+'/'+(process.env.PAGE||'uiwork/act1/mine7_test.html'));await p.waitForTimeout(400);
  const r=await p.evaluate(()=>{S.soundOn=false;let a=5;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
    window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    const ev=[];const sh=S.hooks.short;S.hooks.short=(e,d)=>{ev.push(e+(d&&d.res&&d.res.threat?'(threat)':'')+' '+(d&&d.A?d.A.name:'')+'>'+(d&&d.D?d.D.name:''));if(sh)sh(e,d);};
    const cmds=[];const cm=command;command=function(i,c){const ok=cm.apply(this,arguments);if(ok&&S.story&&S.story.key==='tamm')cmds.push(S.F[i].name+':'+c);return ok;};
    storyGo('tamm');S.storyAuto=true;S.auto=true;step(2);let n=0;while(n<12000&&S.story.step!=='done'){step(1);n++;}
    return{n,ev,cmds,beat:S.act1.t7,hp:S.F.map(f=>f.name+':'+f.hp+(f.downed?'(down)':'')),ended:S.story.ended};});
  console.log(JSON.stringify(r));console.log('errors',errs.length,JSON.stringify(errs.slice(0,4)));await b.close();})();
