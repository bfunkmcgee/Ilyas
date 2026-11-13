// The motion test's pictures: the test page stepped by hand, a tile cut out round a figure every few frames.
//   NODE_PATH=node_modules node spike/motion/strip.js <outdir> <on|off> <first frame> <every> <count> [stage] [who] [w h]
// TW, TH: the tile in the game's units; FIX: a place on the floor to hold the tile on, where it should not follow the figure.
// Frames are the page's own (a sixtieth of a second, two steps of the game's clock). The same frames with `on` and `off` show the same
// moment of the same game, drawn the two ways.
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const [OUT,MODE,F0,EV,N,STAGE,WHO,Wd,Ht]=[process.argv[2],process.argv[3]||'on',+(process.argv[4]||0),+(process.argv[5]||6),+(process.argv[6]||10),process.argv[7]||'motion',+(process.argv[8]||0),+(process.argv[9]||412),+(process.argv[10]||714)];
const PAGE=process.env.PAGE||'spike/motion/out/motion-test.html',TW=+(process.env.TW||170),TH=+(process.env.TH||200),PRE=process.env.PRE||'',FIX=+(process.env.FIX||0);
fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)});
  const p=await (await b.newContext({viewport:{width:Wd,height:Ht},deviceScaleFactor:2,isMobile:Wd<700,hasTouch:Wd<700})).newPage(),errs=[];
  p.on('pageerror',e=>errs.push(e.message.slice(0,300)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200));});
  await p.addInitScript(()=>{window.__rafs=[];window.requestAnimationFrame=cb=>{window.__rafs.push(cb);return window.__rafs.length;};
    // (the same dice and the same clock each time, so that `on` and `off` are the same game)
    let a=0x2F6E2B1;Math.random=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
    window.__now=1e6;performance.now=()=>window.__now;Date.now=()=>1.7e12+window.__now;});
  await p.goto('file://'+path.resolve(PAGE)+'?host=0&scene=none');await p.waitForTimeout(1500);
  await p.evaluate(([mode])=>{S.soundOn=false;window.R1=window.render;window.drawing=on=>{window.render=on?window.R1:()=>{};};
    MotionTest.on=mode!=='off';
    // (the layer's twelfths of a second go by the page's clock: the harness's own here)
    window.step=k=>{for(let i=0;i<k;i++){window.__now+=1000/60;const L=window.__rafs;window.__rafs=[];for(const f of L){if(window.__all||f.name==='frame'){try{f(window.__now);}catch(e){window.__err=(window.__err||0)+1;window.__errm=String(e&&e.stack||e).slice(0,400);}}else window.__rafs.push(f);}}};drawing(false);},[MODE]);
  await p.evaluate(([st,pre])=>{if(st!=='-'){storyGo(st);S.storyAuto=true;S.auto=false;}if(pre)new Function(pre)();step(2);},[STAGE,PRE]);
  const steps=async k=>{for(let i=0;i<k;i+=40)await p.evaluate(m=>step(m),Math.min(40,k-i));};
  await steps(Math.max(0,F0-24));await p.evaluate(()=>{drawing(true);window.__all=true;});await steps(Math.min(24,F0));await p.waitForTimeout(1200);
  const rows=[];
  for(let i=0;i<N;i++){
    const d=await p.evaluate(([who,fix])=>{const f=S.F[who],r=cv.getBoundingClientRect(),s=r.width/cam.viewW,L=cam.x-cam.viewW/2,T=camTop(),P=f.p,
        X=((fix||P[0].x)+f.dep*PSX-L)*s+r.left,Y=(f.gr(P[0].x)-f.dep*PSY-T)*s+r.top,G=f.gait;
      return{X,Y,s,t:+S.t.toFixed(3),x:+P[0].x.toFixed(1),st:+f.station.toFixed(1),m:+(f.motor||0).toFixed(2),g:G&&G.on?+(((S.t-G.t0)/G.beat).toFixed(2)):null,n:MotionTest.n,far:+MotionTest.far.toFixed(1),act:!!f.action,err:window.__err||0,errm:window.__errm||''};},[WHO,FIX]);
    rows.push(d);
    const w=TW*d.s,h=TH*d.s;
    await p.screenshot({path:path.join(OUT,MODE+'_'+String(i).padStart(2,'0')+'.png'),clip:{x:Math.max(0,d.X-w/2),y:Math.max(0,d.Y-h*.9),width:w,height:h}});
    if(i<N-1)await steps(EV);}
  console.log(rows.map(d=>[d.t,d.x,d.g,d.m,d.n,d.far,d.act?'A':''].join(' ')).join(' | '));
  if(rows.some(d=>d.err))console.log('step errors',rows[rows.length-1].err,rows[rows.length-1].errm);
  console.log('errors',JSON.stringify(errs.slice(0,5)));await b.close();})();
