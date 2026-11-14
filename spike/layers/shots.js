// The layers test's pictures: the test page stepped by hand, shown through Phaser (in software here, so slowly).
//   NODE_PATH=node_modules node spike/layers/shots.js still <out prefix> <frame> <stage> '<name>=<js>;;<name>=<js>' [w h]
//       one moment drawn several ways: for each name the js is run, the same moment is painted again without the game's clock
//       moving, and the page is pictured to <out prefix>_<name>.png. The same moment painted twice the same way is not the same
//       picture to the last pixel (a walking figure's drawing moves on a little with each painting), so compare neighbours.
//   NODE_PATH=node_modules node spike/layers/shots.js strip <out dir> <first frame> <stage> '<name>=<js>' <every> <count> [w h]
//       <count> pictures, <every> frames apart, to <out dir>/<name>_NN.png. Run it once per way of drawing: the dice and the clock
//       are the same each time, so the same frames are the same moments of the same game.
// Stage '-' starts no story (PRE can start the lab). PRE: js run once the stage is up. WARM: frames painted before the first picture
// (4; more for dust, which a footfall has to raise). BOX: x,y,w,h of the screen to cut out, in points.
// DUMP: sheets to save beside each still as <out prefix>_<name>_<sheet>.png (LayerTest.sheets(): plate, stage, plateN, stageN...).
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const A=process.argv,KIND=A[2],OUT=A[3],FR=+(A[4]||200),STAGE=A[5]||'motion',VARS=(A[6]||'').split(';;').filter(Boolean).map(v=>{const i=v.indexOf('=');return[v.slice(0,i),v.slice(i+1)];});
const EVERY=KIND==='strip'?+(A[7]||3):0,COUNT=KIND==='strip'?+(A[8]||10):0,Wd=+(A[KIND==='strip'?9:7]||412),Ht=+(A[KIND==='strip'?10:8]||714);
const DUMP=(process.env.DUMP||'').split(',').filter(Boolean);
const PAGE=process.env.PAGE||'spike/layers/out/layers-test.html',WARM=Math.max(4,+(process.env.WARM||4)),BOX=process.env.BOX?process.env.BOX.split(',').map(Number):null;
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined),
    args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const p=await (await b.newContext({viewport:{width:Wd,height:Ht},deviceScaleFactor:2,isMobile:Wd<700||Ht<500,hasTouch:true})).newPage(),errs=[];
  p.on('pageerror',e=>errs.push(e.message.slice(0,300)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200));});
  await p.addInitScript(()=>{window.__rafs=[];window.requestAnimationFrame=cb=>{window.__rafs.push(cb);return window.__rafs.length;};
    let a=0x2F6E2B1;Math.random=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
    window.__now=1e6;performance.now=()=>window.__now;Date.now=()=>1.7e12+window.__now;});
  await p.goto('file://'+path.resolve(PAGE)+'?host=2&scene=none');await p.waitForTimeout(1500);
  await p.evaluate(()=>{S.soundOn=false;window.R1=window.render;window.drawing=on=>{window.render=on?window.R1:()=>{};};
    // step(k): the game and (while __all) Phaser; again(k): the game's picture painted once more, its clock still, then Phaser alone
    const run=all=>{window.__now+=1000/60;const L=window.__rafs;window.__rafs=[];
      for(const f of L){if(all?(window.__all||f.name==='frame'):f.name!=='frame'){try{f(window.__now);}catch(e){window.__err=(window.__err||0)+1;window.__errm=String(e&&e.stack||e).slice(0,500);}}else window.__rafs.push(f);}};
    window.step=k=>{for(let i=0;i<k;i++)run(true);};window.again=k=>{for(let i=0;i<k;i++){window.R1();run(false);}};drawing(false);});
  await p.evaluate(([st,pre])=>{if(st!=='-'){storyGo(st);S.storyAuto=true;S.auto=false;}if(pre)new Function(pre)();step(2);},[STAGE,process.env.PRE||'']);
  const steps=async k=>{for(let i=0;i<k;i+=30)await p.evaluate(m=>step(m),Math.min(30,k-i));};
  const shot=async file=>{await p.waitForTimeout(350);await p.screenshot(BOX?{path:file,clip:{x:BOX[0],y:BOX[1],width:BOX[2],height:BOX[3]}}:{path:file});};
  await steps(Math.max(0,FR-WARM));
  await p.evaluate(([js])=>{const bar=document.getElementById('moBar');if(bar)bar.style.display='none';if(js)new Function(js)();drawing(true);window.__all=true;},[KIND==='strip'&&VARS[0]?VARS[0][1]:'']);
  // (Phaser steps for the first two painted frames, so that the sheets get made, and for the last two; between them only the game)
  await steps(2);if(WARM>4){await p.evaluate(()=>{window.__all=false;});await steps(WARM-4);await p.evaluate(()=>{window.__all=true;});}await steps(2);
  if(KIND==='strip'){fs.mkdirSync(OUT,{recursive:true});const name=VARS[0]?VARS[0][0]:'on';
    for(let i=0;i<COUNT;i++){await shot(path.join(OUT,name+'_'+String(i).padStart(2,'0')+'.png'));
      if(i<COUNT-1){if(EVERY>1){await p.evaluate(()=>{window.__all=false;});await steps(EVERY-1);await p.evaluate(()=>{window.__all=true;});}await steps(1);}}
    console.log(name,COUNT,'pictures',JSON.stringify(await p.evaluate(()=>window.LayerTest&&LayerTest.info())));}
  else for(const [name,js] of VARS){await p.evaluate(s=>{new Function(s)();again(3);},js);await shot(OUT+'_'+name+'.png');
    for(const k of DUMP){const u=await p.evaluate(k=>{const c=window.LayerTest&&LayerTest.sheets()[k];return c&&c.width>4?c.toDataURL('image/png'):null;},k);
      if(u)fs.writeFileSync(OUT+'_'+name+'_'+k+'.png',Buffer.from(u.split(',')[1],'base64'));}
    console.log(name,JSON.stringify(await p.evaluate(()=>window.LayerTest&&LayerTest.info())));}
  console.log('t',await p.evaluate(()=>+S.t.toFixed(2)),'step errors',JSON.stringify(await p.evaluate(()=>[window.__err||0,window.__errm||''])),'errors',JSON.stringify(errs.slice(0,4)));await b.close();})();
