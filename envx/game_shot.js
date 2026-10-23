// The built game, drawn by its own code: steps from a script, each returning a data URL (or nothing for the canvas as it stands).
// usage (from the game folder): node envx/game_shot.js <script.json> [outdir]   script: {dpr, vw, vh, steps:[{name, js}]}
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
(async()=>{
  const C=JSON.parse(fs.readFileSync(process.argv[2],'utf8')),OUT=process.argv[3]||'envx/game_out';fs.mkdirSync(OUT,{recursive:true});
  const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[];
  const p=await (await b.newContext({viewport:{width:C.vw||1300,height:C.vh||900},deviceScaleFactor:C.dpr||2,isMobile:!!C.mobile,hasTouch:!!C.mobile})).newPage();
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|Failed to load resource/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  if(C.mobile&&!fs.existsSync('test_page_m.html')||C.mobile&&fs.statSync('test_page_m.html').mtimeMs<fs.statSync('test_page.html').mtimeMs)fs.writeFileSync('test_page_m.html','<meta name="viewport" content="width=device-width,initial-scale=1">\n'+fs.readFileSync('test_page.html','utf8'));
  await p.goto('file://'+process.cwd()+(C.mobile?'/test_page_m.html':'/test_page.html'));await p.waitForTimeout(400);
  const F='file://'+process.cwd()+'/envx/node_modules/@fontsource/';
  await p.addStyleTag({content:`@font-face{font-family:"Alegreya SC";font-style:normal;font-weight:700;src:url(${F}alegreya-sc/files/alegreya-sc-latin-700-normal.woff2)}
@font-face{font-family:"Alegreya SC";font-style:italic;font-weight:700;src:url(${F}alegreya-sc/files/alegreya-sc-latin-700-italic.woff2)}
@font-face{font-family:"Alegreya SC";font-style:normal;font-weight:500;src:url(${F}alegreya-sc/files/alegreya-sc-latin-500-normal.woff2)}
@font-face{font-family:"Cormorant Garamond";font-style:normal;font-weight:700;src:url(${F}cormorant-garamond/files/cormorant-garamond-latin-700-normal.woff2)}`});
  await p.evaluate(async()=>{for(const f of ['700 12px "Alegreya SC"','italic 700 12px "Alegreya SC"','500 12px "Alegreya SC"','700 12px "Cormorant Garamond"'])await document.fonts.load(f);});
  await p.evaluate(()=>{S.soundOn=false;let a=11;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
    window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;f(window.__now);}};
    window.put=(f,x,z,fa)=>{f.station=x;f.lane=z;f.dep=z;f.stepDep=z;f.vdep=0;f.facing=fa;f.build();};
    window.hold=()=>{const g=S.game;g.phase='input';g.active=0;g.aiAt=null;S.opening=null;g.ex=null;for(const f of S.F){f.foot=FOOT_MAX;f.intent=null;}};
    window.fight=(o)=>{S.arenaKey=o.arena||'restaurant';S.backroom=!!o.back;S.deep=!!o.deep;S.introOn=!!o.intro;S.tableOn=o.table!==false;S.divOn=o.divs!==false;S.cfg.n=o.n||1;S.cfg.crew=!!o.crew;S.cfg.ally.on=!!o.ally;S.auto=o.auto!==false;
      S.F=[];rosterBuild();restart();step(3);};
    window.runUntil=(pred,max)=>{let n=0;while(!pred()&&n<(max||30000)){step(1);n++;}return n;};
    window.clearNow=()=>{if(S.crew)S.crew.queue.length=0;S.opening=null;S.game.ex=null;for(const f of foes()){f.hp=0;kill(f,1);}if(nextRoom())beginTransit();};
    window.inRoom=r=>runUntil(()=>S.room===r&&!S.stage.tr&&(S.game.phase==='input'||S.game.phase==='exchange'));
    window.shot=()=>document.getElementById('cv').toDataURL('image/png');
  });
  const log={};
  for(const st of C.steps){
    const t0=Date.now();const r=await p.evaluate(code=>{try{return(new Function(code))();}catch(e){return{err:e.message+' '+(e.stack||'').split('\n').slice(1,3).join(' ')};}},st.js);
    if(r&&r.err){console.log('ERR',st.name,r.err);continue;}
    if(r&&r.info){console.log('INFO',st.name,JSON.stringify(r.info));if(!r.url)continue;}
    const url=(r&&r.url)||(typeof r==='string'?r:null)||await p.evaluate(()=>{render();return document.getElementById('cv').toDataURL('image/png');});
    const file=path.join(OUT,st.name+'.png');fs.writeFileSync(file,Buffer.from(url.split(',')[1],'base64'));console.log('wrote',file,(Date.now()-t0)+'ms');}
  console.log('errors',JSON.stringify(errs.slice(0,8)));await b.close();
})();
