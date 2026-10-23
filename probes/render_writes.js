// What a call of render() changes in the game's records: the restaurant run through its four rooms, then the office with the hero's
// turn left to the player. Every few frames the records are copied, render() is called once more, and they are compared.
// usage: node probes/render_writes.js [frames after the office starts, default 300] [check every N frames, default 3]
//        ALLY=1 with Mara; AUTO=1 the office fought on auto (to its end and the last scene)
const {chromium}=require('playwright');
const EXTRA=+(process.argv[2]||300),EV=+(process.argv[3]||3);
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[];
  const p=await (await b.newContext({viewport:{width:1300,height:900}})).newPage();
  p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+process.cwd()+'/test_page.html');await p.waitForTimeout(300);
  const out=await p.evaluate(([EXTRA,EV,ALLY,AUTO])=>{S.soundOn=false;let a=7;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
    // a flat copy of plain data: path -> value (numbers, strings, booleans, null), through objects and arrays, cycles skipped
    const flat=(root,name)=>{const o={},seen=new Set();const walk=(v,pth,d)=>{if(d>7)return;
        if(v===null||typeof v!=='object'){if(typeof v!=='function')o[pth]=v;return;}
        if(seen.has(v))return;if(v instanceof Node||v instanceof CanvasRenderingContext2D||v instanceof HTMLCanvasElement||(typeof OffscreenCanvas!=='undefined'&&v instanceof OffscreenCanvas)||v instanceof Path2D||v instanceof ImageData)return;
        seen.add(v);if(Array.isArray(v)){o[pth+'.length']=v.length;v.forEach((x,i)=>walk(x,pth+'['+i+']',d+1));return;}
        if(v instanceof Map||v instanceof Set||v instanceof WeakMap)return;
        for(const k of Object.keys(v))walk(v[k],pth+'.'+k,d+1);};walk(root,name,0);return o;};
    const snap=()=>Object.assign({},flat(S,'S'));
    S.arenaKey='restaurant';S.backroom=true;S.deep=true;S.introOn=false;S.cfg.n=1;S.cfg.crew=false;S.cfg.ally.on=ALLY;S.allyAuto=ALLY;
    S.auto=true;S.F=[];rosterBuild();restart();
    window.__now=performance.now()+1000;
    const step=()=>{window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);};
    const clearNow=()=>{if(S.crew)S.crew.queue.length=0;S.opening=null;S.game.ex=null;for(const f of foes()){f.hp=0;kill(f,1);}if(nextRoom())beginTransit();};
    const changed={};let checks=0,k=0;
    const look=tag=>{const A=snap();render();const B=snap();checks++;
      for(const key of new Set([...Object.keys(A),...Object.keys(B)]))if(A[key]!==B[key]&&!(Number.isNaN(A[key])&&Number.isNaN(B[key]))){
        const g=key.replace(/\[\d+\]/g,'[]');if(!changed[g])changed[g]={n:0,first:tag+' '+key+': '+String(A[key]).slice(0,40)+' -> '+String(B[key]).slice(0,40)};changed[g].n++;}};
    for(const r of ['dining','kitchen','lobby','office']){
      while(!(S.room===r&&!S.stage.tr&&(S.game.phase==='input'||S.game.phase==='exchange'))&&k<40000){step();k++;if(k%(EV*10)===0)look(S.room+'@'+k);}
      if(r!=='office')clearNow();}
    S.auto=AUTO;for(let i=0;i<EXTRA&&S.game.phase!=='over';i++){step();k++;if(i%EV===0)look(S.game.phase+'@'+k);}
    return{checks,changed:Object.entries(changed).sort((x,y)=>y[1].n-x[1].n)};},[EXTRA,EV,!!process.env.ALLY,!!process.env.AUTO]);
  console.log('render() called',out.checks,'times between frames; records it changed:',out.changed.length);
  for(const [g,v] of out.changed.slice(0,60))console.log(String(v.n).padStart(5),g.slice(0,90),' | first:',v.first.slice(0,200));
  console.log('errors',errs.length,JSON.stringify(errs.slice(0,4)));await b.close();})();
