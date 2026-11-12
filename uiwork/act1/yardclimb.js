// The yard's close (the climb to the lofts), a still every EVERY steps. usage (from the repo):
// NODE_PATH=node_modules node uiwork/act1/yardclimb.js <outdir> <w> <h> [every=90] ; env RM=1 reduced motion, GATE=1 starts at the gate's opening
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const OUT=process.argv[2],Wd=+(process.argv[3]||412),Ht=+(process.argv[4]||714),EVERY=+(process.argv[5]||90),PAGE=process.env.PAGE||'test_page.html';
const {chromiumPath,pageSetup}=require(path.resolve('uiwork/look/places.js'));fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:chromiumPath()});
  const p=await (await b.newContext({viewport:{width:Wd,height:Ht},deviceScaleFactor:2,isMobile:Wd<700,hasTouch:Wd<700,reducedMotion:process.env.RM?'reduce':'no-preference'})).newPage(),errs=[];
  p.on('pageerror',e=>errs.push(e.message));await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+path.resolve(PAGE));await p.waitForTimeout(300);await p.evaluate(pageSetup);
  const run=async(cond,max)=>{for(let g=0;g<Math.ceil((max||3000)/60);g++){const d=await p.evaluate(c=>{const f=new Function('return ('+c+')');for(let i=0;i<60;i++){if(f())return true;step(1);}return f();},cond);if(d)return true;}return false;};
  const steps=async k=>{for(let i=0;i<k;i+=60)await p.evaluate(m=>step(m),Math.min(60,k-i));};
  await p.evaluate(()=>{storyGo('yard1');S.storyAuto=false;S.auto=false;step(2);window.__t0=S.t;drawing(true);});
  for(let i=0;i<8;i++){await run("!!S.say||S.story.step==='explore'",900);if(await p.evaluate(()=>S.story.step==='explore'))break;await steps(10);await p.evaluate(()=>{if(S.say)storyAdvance();});await steps(5);}
  await run("S.story.step==='explore'",2500);await steps(20);
  await p.evaluate(g=>{const A=S.act1,YD=A.yard;YD.ladderTried=true;YD.drunk=true;YD.filled=true;YD.step=3;A.bucket.where='hand';A.bucket.full=true;S.ex.hand={id:'water',name:'Bucket of water'};
    const K=hero(),G=ACT1_PLACES.yard.stairGate;K.station=G.x+60;K.lane=K.dep=150;K.lurch=.2;if(!g)A.stairGate=1;},!!process.env.GATE);
  await steps(30);let n=0;
  const shot=async name=>{n++;const info=await p.evaluate(()=>{const K=hero();return{t:+(S.t-window.__t0).toFixed(1),x:Math.round(K.station),pel:Math.round(K.p[PEL].x),d:Math.round(K.dep),h:Math.round(GB-K.gr(K.station)),vw:Math.round(cam.viewW),fade:+S.fade.toFixed(2),key:S.story.key,top:Math.round(camTop()),band:S.camCut&&S.camCut.band?[Math.round(S.camCut.band.top),Math.round(S.camCut.band.foot)]:null,fy:Math.round(prjY(K.gr(K.p[PEL].x),K.dep)),bar:Math.round((S.letter?cssH*.105:0)),tgt:Math.round(camTarget()),pelh:Math.round(GB-K.p[PEL].y),ft:[Math.round(K.p[FTF].x)+'/'+Math.round(GB-K.p[FTF].y),Math.round(K.p[FTB].x)+'/'+Math.round(GB-K.p[FTB].y)]};});
    await p.screenshot({path:path.join(OUT,String(n).padStart(2,'0')+' '+name+'.jpg'),quality:86});console.log(String(n).padStart(2,'0'),name,JSON.stringify(info));};
  if(process.env.GATE){await p.evaluate(()=>{S.ex.hand=null;S.act1.bucket.where='floor';S.act1.bucket.x=200;S.act1.bucket.d=150;exUse('stairgate');});
    for(let i=0;i<6;i++){await steps(45);await shot('gate '+i);}await b.close();return;}
  await p.evaluate(()=>exUse('stairs'));
  for(let i=0;i<40;i++){await steps(EVERY);await shot('climb');if(await p.evaluate(()=>S.story.key!=='yard1'||S.fade>.97))break;}
  console.log('errors',JSON.stringify(errs.slice(0,3)));await b.close();})();
