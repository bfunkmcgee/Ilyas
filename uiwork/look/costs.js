// The draw cost of chosen frames, timed by turns against the fall's (the style guide's rule 6: no place's frame costs more than the
// fall's in the same run, its dearest, as the audit of Nov 2 and V79 read it): node uiwork/look/costs.js <out.json> <frame,...> [w h dpr]
// Each frame (as the look audit names it: id_moment, a lab ground by its id) is held where the audit shoots it, in a page of its own.
// The fall plays, drawn all the way, in another page and stops at each of its four moments; at each, the held frames are timed in
// turn, the fall before the first of them and again after every FALLEVERY of them (default 3), round after round until ROUNDS rounds
// (default 3) and SPAN seconds (default 20) have gone by; each timing is the median of COSTN draws (default 6). A cost is the least
// of its timings (since Nov 8): a frame's the least of all of them, at all four stops; the fall's the least at its dearest moment (each
// moment the least of its timings there). This machine runs everything a third to a half slower for seconds at a time, and
// sometimes for minutes: in four runs of the fall on Nov 8, nine timings running at each moment, t24 read 35 to 69 ms in one and
// 47 to 52 all through t37 in another, and the Lantern's x1.4 held beside it 54 to 94. A median of a few timings, the fall's three a
// moment as it was, wandered by half from run to run (its dearest frame 34.8 to 51.9 ms in V105's and V106's reviews); the least of
// timings spread over the stops is the drawing without that, the same to a few percent from run to run (the fall's t24 at 34.7 to
// 36.7 in those four runs, the Lantern's x1.4 against the fall's dearest 1.56 and 1.51 in the two that held it).
// A frame the review would fail on its cost (over the fall's by more than the timing's 5%, and past what kept.json keeps it to) has
// a second look (since Nov 8): a held page can draw slow all through a run (the line's o8 at 60.1 ms the least of its twelve timings
// in one, where a page of its own read 43.5 to 44.6 and the run before 46.1), so its page is made again and it is timed TWICE times
// (default 12), the fall before each, where the fall stopped, that stop taken to the fall's dearest as this run read the two; the
// lower of its two readings stands, and both are kept. (PAGE=<page>, default test_page.html; KEPT=<kept.json>, default the one
// beside this file)
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const {SHOTS,chromiumPath,pageSetup,labShot,stageStart,toMoment}=require('./places.js');
const OUT=process.argv[2],WANT=(process.argv[3]||'').split(',').filter(Boolean),VW=+(process.argv[4]||412),VH=+(process.argv[5]||714),DPR=+(process.argv[6]||2);
const PAGE=process.env.PAGE||'test_page.html',ROUNDS=Math.max(1,+(process.env.ROUNDS||3)),COSTN=Math.max(2,+(process.env.COSTN||6));
const EVERY=Math.max(1,+(process.env.FALLEVERY||3)),SPAN=Math.max(0,+(process.env.SPAN||20))*1000,TWICE=Math.max(3,+(process.env.TWICE||12));
const OVER=1.05;   // the review's COST_OVER (review.py): the timing's own wander
const KEPT=(()=>{try{return JSON.parse(fs.readFileSync(process.env.KEPT||path.join(__dirname,'kept.json'),'utf8')).cost||{};}catch(e){return {};}})();
const med=a=>{const b=[...a].sort((x,y)=>x-y),n=b.length;return n?(b[(n-1)>>1]+b[n>>1])/2:null;},least=a=>a.length?Math.min(...a):null;
const shotOf=name=>SHOTS.find(s=>s.lab?s.id===name:name.startsWith(s.id+'_')&&s.at.includes(name.slice(s.id.length+1)));
// (as review.py judges a cost: kept by the frame at this size, the frame, or its place, up to the keep's max)
const fails=(name,of)=>{if(of==null||of<=OVER)return false;const sh=shotOf(name),k=KEPT[name+'@'+VW+'x'+VH]||KEPT[name]||(sh&&KEPT[sh.id]);
  return !k||(typeof k==='object'&&of>(k.max||0));};
(async()=>{const b=await chromium.launch({executablePath:chromiumPath()}),errs=[];
  const open=async()=>{const p=await (await b.newContext({viewport:{width:VW,height:VH},deviceScaleFactor:DPR,isMobile:VW<700,hasTouch:VW<700})).newPage();
    p.on('pageerror',e=>errs.push(e.message));await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
    await p.goto('file://'+path.resolve(PAGE));await p.waitForTimeout(300);await p.evaluate(pageSetup);await p.evaluate(n=>{window.__costN=n;},COSTN);return p;};
  // a frame held at its moment, in a page of its own (nothing steps it again: a held page does no work between its timings)
  const hold=async name=>{const sh=shotOf(name);
    if(!sh||sh.id==='fall'){console.log('not a frame of the audit:',name);return null;}
    const p=await open();
    if(sh.lab)await p.evaluate(labShot,sh.lab);
    else{await p.evaluate(stageStart,[sh.stage,false]);const g=await p.evaluate(toMoment,[name.slice(sh.id.length+1),false]);
      if(g&&g.gone){console.log(name,'gone');errs.push(name+': the stage ended before its moment');await p.context().close();return null;}}
    return p;};
  const held=[];
  for(const name of WANT){const p=await hold(name);if(p)held.push({name,p,T:[]});}
  // the fall, drawn all the way, stopping at each of its moments; at each, the held frames by turns with the fall among them
  const F=SHOTS.find(s=>s.id==='fall'),fp=await open(),fall={},rounds={},fallCost=()=>fp.evaluate(()=>cost());await fp.evaluate(stageStart,[F.stage,true]);
  for(const m of F.at){const g=await fp.evaluate(toMoment,[m,true]);if(g&&g.gone){errs.push('fall '+m+': the stage ended before its moment');break;}
    const T=fall[m]=[],t0=Date.now();let r=0;
    for(;(r<ROUNDS||Date.now()-t0<SPAN)&&r<60;r++){T.push(await fallCost());
      for(let i=0;i<held.length;i++){held[i].T.push(await held[i].p.evaluate(()=>cost()));if((i+1)%EVERY===0&&i+1<held.length)T.push(await fallCost());}}
    rounds[m]=r;}
  const fm=Object.fromEntries(Object.entries(fall).map(([m,T])=>[m,+least(T).toFixed(1)])),line=+Math.max(0,...Object.values(fm)).toFixed(1);
  // the second look: each frame the review would fail, its page made again, by turns with the fall where it stopped
  const stop=Object.keys(fall).slice(-1)[0],again={};
  if(line&&stop)for(const h of held){if(!fails(h.name,least(h.T)/line))continue;
    await h.p.context().close();h.p=null;const p=await hold(h.name);if(!p)continue;
    const T=[],FL=[];for(let i=0;i<TWICE;i++){FL.push(await fallCost());T.push(await p.evaluate(()=>cost()));}
    const yard=least(FL)*line/least(fall[stop]);again[h.name]={ms:+(least(T)*line/yard).toFixed(1),of:+(least(T)/yard).toFixed(3),least:least(T),fall:FL,timings:T};
    await p.context().close();}
  const frame=h=>{const a=again[h.name],ms=least(h.T),one={ms:+ms.toFixed(1),of:line?+(ms/line).toFixed(3):null};
    const best=a&&a.of<one.of?{ms:a.ms,of:a.of,by:'again'}:one;
    return {...best,med:+med(h.T).toFixed(1),lo:ms,hi:Math.max(...h.T),timings:h.T,...(a?{first:one,again:a}:{})};};
  const out={w:VW,h:VH,dpr:DPR,how:'least',rounds:ROUNDS,span:SPAN/1000,fallEvery:EVERY,costN:COSTN,when:new Date().toISOString(),
    fall:{ms:line,moments:fm,medians:Object.fromEntries(Object.entries(fall).map(([m,T])=>[m,+med(T).toFixed(1)])),rounds,timings:fall},
    frames:Object.fromEntries(held.map(h=>[h.name,frame(h)])),again:Object.keys(again),errors:errs.slice(0,5)};
  fs.writeFileSync(OUT,JSON.stringify(out,null,0));
  console.log('the fall\'s dearest frame',line,'ms (the least of its timings at each moment)',JSON.stringify(fm),'rounds',JSON.stringify(rounds));
  for(const h of held){const f=out.frames[h.name];console.log(' ',h.name,f.ms,'ms,',f.of+' of the fall\'s (median '+f.med+')'+(f.again?', looked at again: '+f.first.of+' then '+f.again.of:''));}
  console.log('errors',JSON.stringify(errs.slice(0,5)));for(const h of held)if(h.p)await h.p.context().close().catch(()=>{});await b.close();})();
