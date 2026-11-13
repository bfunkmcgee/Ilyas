// The motion test's numbers: the test page stepped by hand with nothing painted, the joints of one figure written out each frame, as
// the game has them (sim) and as the page would draw them (out).
//   NODE_PATH=node_modules node spike/motion/trace.js <out.json> <frames> [stage] [who] [first frame]
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const [OUT,N,STAGE,WHO,F0]=[process.argv[2],+(process.argv[3]||600),process.argv[4]||'motion',+(process.argv[5]||0),+(process.argv[6]||0)];
const PAGE=process.env.PAGE||'spike/motion/out/motion-test.html',PRE=process.env.PRE||'';
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)});
  const p=await (await b.newContext({viewport:{width:412,height:714}})).newPage(),errs=[];
  p.on('pageerror',e=>errs.push(e.message.slice(0,300)));
  await p.addInitScript(()=>{window.__rafs=[];window.requestAnimationFrame=cb=>{window.__rafs.push(cb);return window.__rafs.length;};
    let a=0x2F6E2B1;Math.random=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};Date.now=()=>1.7e12;});
  await p.goto('file://'+path.resolve(PAGE)+'?host=0&scene=none');await p.waitForTimeout(2000);
  const rows=await p.evaluate(([st,pre,n,who,f0])=>{S.soundOn=false;let now=1e6;performance.now=()=>now;
    MotionTest.on=true;MotionTest.dry=true;
    const step=()=>{now+=1000/60;const L=window.__rafs;window.__rafs=[];for(const f of L)if(f.name==='frame')f(now);else window.__rafs.push(f);};
    if(st!=='-'){storyGo(st);S.storyAuto=true;}if(pre)new Function(pre)();
    const rows=[];for(let i=0;i<f0+n;i++){step();if(i<f0)continue;const f=S.F[who],J=MotionTest.joints(f),G=f.gait,r=v=>Math.round(v*100)/100;
      rows.push({t:r(S.t),fa:f.facing,w:r(J.w),g:G&&G.on?r((S.t-G.t0)/G.beat):-1,gk:G?G.k:-1,m:r(f.motor),act:f.action?1:0,gy:r(f.gr(f.p[0].x)),st:[f.steps[0].active?1:0,f.steps[1].active?1:0],
        out:J.out?J.out.map(q=>[r(q[0]),r(q[1])]):null,sim:J.sim.map(q=>[r(q[0]),r(q[1])])});}
    return rows;},[STAGE,PRE,N,WHO,F0]);
  fs.writeFileSync(OUT,JSON.stringify(rows));console.log('frames',rows.length,'errors',JSON.stringify(errs.slice(0,5)));await b.close();})();
