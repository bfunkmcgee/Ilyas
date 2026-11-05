// The draw cost of chosen frames, timed by turns against the fall's (the style guide's rule 6: no place's frame costs more than the
// fall's in the same run, its dearest, as the audit of Nov 2 and V79 read it): node uiwork/look/costs.js <out.json> <frame,...> [w h dpr]
// Each frame (as the look audit names it: id_moment, a lab ground by its id) is held where the audit shoots it, in a page of its own.
// The fall plays, drawn all the way, in another page and stops at each of its four moments; at each, the fall's frame and every held
// frame are timed in turn, ROUNDS times (default 3), each timing the median of COSTN draws (default 6). A frame's cost is the median
// of all its timings, the fall's that of its dearest moment (each moment the median of its timings). Timed by turns, the machine's
// drift (another job, the heat) falls on both alike: single runs of the audit wander by a quarter. (PAGE=<page>, default test_page.html)
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const {SHOTS,chromiumPath,pageSetup,labShot,stageStart,toMoment}=require('./places.js');
const OUT=process.argv[2],WANT=(process.argv[3]||'').split(',').filter(Boolean),VW=+(process.argv[4]||412),VH=+(process.argv[5]||714),DPR=+(process.argv[6]||2);
const PAGE=process.env.PAGE||'test_page.html',ROUNDS=Math.max(1,+(process.env.ROUNDS||3)),COSTN=Math.max(2,+(process.env.COSTN||6));
const med=a=>{const b=[...a].sort((x,y)=>x-y),n=b.length;return n?(b[(n-1)>>1]+b[n>>1])/2:null;};
(async()=>{const b=await chromium.launch({executablePath:chromiumPath()}),errs=[];
  const open=async()=>{const p=await (await b.newContext({viewport:{width:VW,height:VH},deviceScaleFactor:DPR,isMobile:VW<700,hasTouch:VW<700})).newPage();
    p.on('pageerror',e=>errs.push(e.message));await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
    await p.goto('file://'+path.resolve(PAGE));await p.waitForTimeout(300);await p.evaluate(pageSetup);await p.evaluate(n=>{window.__costN=n;},COSTN);return p;};
  // the frames, each held at its moment (nothing steps them again: a held page does no work between its timings)
  const held=[];
  for(const name of WANT){const sh=SHOTS.find(s=>s.lab?s.id===name:name.startsWith(s.id+'_')&&s.at.includes(name.slice(s.id.length+1)));
    if(!sh||sh.id==='fall'){console.log('not a frame of the audit:',name);continue;}
    const p=await open();
    if(sh.lab)await p.evaluate(labShot,sh.lab);
    else{await p.evaluate(stageStart,[sh.stage,false]);const g=await p.evaluate(toMoment,[name.slice(sh.id.length+1),false]);
      if(g&&g.gone){console.log(name,'gone');errs.push(name+': the stage ended before its moment');await p.context().close();continue;}}
    held.push({name,p,T:[]});}
  // the fall, drawn all the way, stopping at each of its moments
  const F=SHOTS.find(s=>s.id==='fall'),fp=await open(),fall={};await fp.evaluate(stageStart,[F.stage,true]);
  for(const m of F.at){const g=await fp.evaluate(toMoment,[m,true]);if(g&&g.gone){errs.push('fall '+m+': the stage ended before its moment');break;}
    const T=fall[m]=[];
    for(let r=0;r<ROUNDS;r++){T.push(await fp.evaluate(()=>cost()));for(const h of held)h.T.push(await h.p.evaluate(()=>cost()));}}
  const fm=Object.fromEntries(Object.entries(fall).map(([m,T])=>[m,+med(T).toFixed(1)])),line=+Math.max(0,...Object.values(fm)).toFixed(1);
  const out={w:VW,h:VH,dpr:DPR,rounds:ROUNDS,costN:COSTN,when:new Date().toISOString(),fall:{ms:line,moments:fm,timings:fall},
    frames:Object.fromEntries(held.map(h=>[h.name,{ms:+med(h.T).toFixed(1),of:line?+(med(h.T)/line).toFixed(3):null,lo:Math.min(...h.T),hi:Math.max(...h.T),timings:h.T}])),errors:errs.slice(0,5)};
  fs.writeFileSync(OUT,JSON.stringify(out,null,0));
  console.log('the fall\'s dearest frame',line,'ms',JSON.stringify(fm));for(const h of held)console.log(' ',h.name,out.frames[h.name].ms,'ms,',out.frames[h.name].of+' of the fall\'s');
  console.log('errors',JSON.stringify(errs.slice(0,5)));await b.close();})();
