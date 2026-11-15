// The layers across the story's places (since V118): every stage the look review visits, at its moments, shown through Phaser
// three ways: flat (as before V118), on the sheets with every effect off, and in layers as the page is by default.
//   NODE_PATH=node_modules node spike/layers/scenes.js <out dir> [w h dsf] [id ...]
//       ids: uiwork/look/places.js SHOTS (default: the prologue's 21, sundown to the fall); FIRST=1 shoots each stage's first
//       moment only; PAGE=<page> (default the published page, ragdoll-skirmish-lab.html)
// Writes <id>_<moment>_{flat,plain,layers}.png (the page pictured), <id>_<moment>_{plate,stage}.png (the two sheets as painted, where
// the frame went onto them) and scenes.json: for each moment the place's key, the view's width and pixels a unit, the scale the place
// was painted at, the floor's rows, every figure's box, and for each way whether the frame went onto the sheets (why not, if not)
// and what was on. scenes.py reads the pictures: how far 'plain' is from 'flat' (the sheets alone must change nothing that is
// seen), and the ways side by side. uiwork/look/levels.py reads the sheets: the levels of detail (the drawing's rule 13).
// Phaser draws in software here, slowly: it is stepped only where a picture is taken.
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const {SHOTS,frameName,chromiumPath,stageStart,toMoment}=require('../../uiwork/look/places.js');
const A=process.argv,OUT=A[2],num=A.slice(3).filter(s=>/^[\d.]+$/.test(s)).map(Number),ids=A.slice(3).filter(s=>!/^[\d.]+$/.test(s));
if(!OUT){console.error('usage: node spike/layers/scenes.js <out dir> [w h dsf] [id ...]');process.exit(2);}
const Wd=num[0]||412,Ht=num[1]||714,DSF=num[2]||1,PAGE=process.env.PAGE||path.join(__dirname,'..','..','ragdoll-skirmish-lab.html');
const PROLOGUE=['sundown','field','chase','highway','roadblock','vargo','dining','kitchen','shaft','lanternup','shaftfire','platform','line','deep','lobby','office','kick','gondola','officeback','roof','fall'];
const WANT=(ids.length?ids:PROLOGUE).map(id=>SHOTS.find(s=>s.id===id)).filter(s=>s&&s.stage);
// (flat twice: what moves by itself between two paintings of one moment is the measure for what the sheets change)
const WAYS=[['flat','LayerTest.on=false;'],['flat2','LayerTest.on=false;'],
  ['plain','Object.assign(LayerTest,{on:true,focus:false,dust:false,parallax:false,lamps:false,soft:false});'],
  ['layers','Object.assign(LayerTest,{on:true,focus:true,focusK:1,dust:true,parallax:true,lamps:true,soft:true,seeNow:true,seeEvery:1});']];
// (ONLY=layers, or flat,layers: just those ways, for a quick look)
if(process.env.ONLY){const o=process.env.ONLY.split(',');for(let i=WAYS.length-1;i>=0;i--)if(!o.includes(WAYS[i][0]))WAYS.splice(i,1);}
fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:chromiumPath(),args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const out={w:Wd,h:Ht,dsf:DSF,frames:[]};
  for(const sh of WANT){
    const p=await (await b.newContext({viewport:{width:Wd,height:Ht},deviceScaleFactor:DSF,isMobile:Wd<700||Ht<500,hasTouch:true})).newPage(),errs=[];
    p.on('pageerror',e=>errs.push(e.message.slice(0,200)));
    await p.addInitScript(()=>{window.__rafs=[];window.requestAnimationFrame=cb=>{window.__rafs.push(cb);return window.__rafs.length;};
      let a=0x2F6E2B1;Math.random=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
      window.__now=1e6;performance.now=()=>window.__now;Date.now=()=>1.7e12+window.__now;});
    await p.goto('file://'+path.resolve(PAGE)+'?host=2&scene=none&layers=1&motion=1&lamps=1');await p.waitForTimeout(1500);
    await p.evaluate(()=>{S.soundOn=false;S.rng=Math.random;window.R1=window.R0=window.render;window.drawing=on=>{window.render=on?window.R1:()=>{};};
      // step(k): the game's own frames (and Phaser's while __all); again(k): the same moment painted once more, then Phaser alone
      const run=all=>{window.__now+=1000/60;const L=window.__rafs;window.__rafs=[];
        for(const f of L){if(all?(window.__all||f.name==='frame'):f.name!=='frame'){try{f(window.__now);}catch(e){window.__err=(window.__err||0)+1;window.__errm=String(e&&e.stack||e).slice(0,400);}}else window.__rafs.push(f);}};
      window.step=k=>{for(let i=0;i<k;i++)run(true);};window.again=k=>{for(let i=0;i<k;i++){window.R1();run(false);}};});
    await p.evaluate(stageStart,[sh.stage,sh.draw==='all']);
    for(const m of (process.env.FIRST?sh.at.slice(0,1):sh.at)){
      const g=await p.evaluate(toMoment,[m,sh.draw==='all']);if(g&&g.gone){console.log(sh.id,m,'gone');break;}
      const name=frameName(sh.id,m),fr={id:sh.id,moment:m,name,ways:{}};
      Object.assign(fr,await p.evaluate(()=>{const dpr=cv.width/Math.max(1,cssW),k=cssW/cam.viewW,L=cam.x-cam.viewW/2,T=cam.T,sx=X=>Math.round((X-L)*k*dpr),sy=Y=>Math.round((Y-T)*k*dpr);
        const far=(S.arena&&S.arena.far)||DEP_MAX+40,lb=typeof ST_LB==='number'?ST_LB:0;
        const people=(S.F||[]).filter(f=>f&&f.p&&!f.gone&&!f.hidden).map(f=>{const d=f.dep||0,xs=f.p.slice(0,11).map(q=>q.x+d*PSX),ys=f.p.slice(0,11).map(q=>q.y-d*PSY);
          return{name:f.name||f.pitCast||f.kind||'?',side:f.side,dead:!!f.dead,box:[sx(Math.min(...xs)-12),sy(Math.min(...ys)-14),sx(Math.max(...xs)+12),sy(Math.max(...ys)+6)]};});
        return{key:typeof envKey==='function'?envKey():null,step:S.story?S.story.step:'',cut:!!S.cut,across:+cam.viewW.toFixed(1),ppu:+(k*dpr).toFixed(3),painted:+sceneScale().toFixed(3),
          yFar:sy(GB-PSY*far),yNear:sy(GB-PSY*DEP_MIN),yFoot:sy(GB),bar:Math.floor(cv.height*.105*lb),size:[cv.width,cv.height],people,t:+S.t.toFixed(2)};}));
      for(const [way,js] of WAYS){
        await p.evaluate(s=>{new Function(s)();drawing(true);window.__all=true;again(3);drawing(false);window.__all=false;},js);
        await p.waitForTimeout(250);await p.screenshot({path:path.join(OUT,name+'_'+way+'.png')});
        fr.ways[way]=await p.evaluate(()=>{const I=LayerTest.info();return{live:I.live,why:I.why,focus:!!I.focus,dust:!!I.dust,parallax:!!I.parallax,lamps:I.lamps||0,soft:I.soft||0,ms:I.ms,err:I.err||''};});
        // (the plate and the stage as they were painted, for the detail's reader: the place without its people, the people without the place)
        if(way==='plain'&&fr.ways.plain.live&&!process.env.NOSHEETS)for(const k of ['plate','stage']){const u=await p.evaluate(k=>{const c=LayerTest.sheets()[k];return c&&c.width>4?c.toDataURL('image/png'):null;},k);
          if(u){fs.writeFileSync(path.join(OUT,name+'_'+k+'.png'),Buffer.from(u.split(',')[1],'base64'));fr[k]=true;}}}
      fr.errs=await p.evaluate(()=>[window.__err||0,window.__errm||'']);out.frames.push(fr);
      const Lw=fr.ways.layers||{};console.log(name,fr.key,fr.step+(fr.cut?'/cut':''),fr.across,fr.ppu+'px/u','| layers:',Lw.live?'live':'FLAT ('+Lw.why+')','focus',Lw.focus,'dust',Lw.dust,'lamps',Lw.lamps,fr.errs[0]?'ERR '+fr.errs[1]:'',errs.length?'PAGE '+errs[0]:'');}
    await p.close();}
  fs.writeFileSync(path.join(OUT,'scenes.json'),JSON.stringify(out,null,1));await b.close();})();
