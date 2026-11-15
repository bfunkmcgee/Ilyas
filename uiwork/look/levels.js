// The levels of detail across the story (since V118; the drawing's rule 13): every stage the look review visits, at its moments,
// as the published page draws it (Phaser's view off, so the picture is the game's own), with what levels.py needs to read it: the
// view's width and its pixels a unit, the scale the place was painted at (sceneScale), the floor's far and near rows, the story's
// bars, and every figure's box. detail.js is the yard's closer look (its things boxed by hand); this is every place, by region.
//   node uiwork/look/levels.js <out dir> [w h dpr] [id ...]     ids: places.js SHOTS (default: the prologue's 21)
//   PAGE=<page> (default ragdoll-skirmish-lab.html)
// Writes <w>x<h>/<id>_<moment>.png and <w>x<h>/levels.json. Nothing here is a check.
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const {SHOTS,frameName,chromiumPath,stageStart,toMoment}=require('./places.js');
const A=process.argv,OUT0=A[2],num=A.slice(3).filter(s=>/^[\d.]+$/.test(s)).map(Number),ids=A.slice(3).filter(s=>!/^[\d.]+$/.test(s));
if(!OUT0){console.error('usage: node uiwork/look/levels.js <out dir> [w h dpr] [id ...]');process.exit(2);}
const Wd=num[0]||412,Ht=num[1]||714,DPR=num[2]||2,PAGE=process.env.PAGE||path.join(__dirname,'..','..','ragdoll-skirmish-lab.html'),OUT=path.join(OUT0,Wd+'x'+Ht);
const PROLOGUE=['sundown','field','chase','highway','roadblock','vargo','dining','kitchen','shaft','lanternup','shaftfire','platform','line','deep','lobby','office','kick','gondola','officeback','roof','fall'];
const WANT=(ids.length?ids:PROLOGUE).map(id=>SHOTS.find(s=>s.id===id)).filter(s=>s&&s.stage);
fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:chromiumPath()});const out={w:Wd,h:Ht,dpr:DPR,frames:[]};
  for(const sh of WANT){
    const p=await (await b.newContext({viewport:{width:Wd,height:Ht},deviceScaleFactor:DPR,isMobile:Wd<700,hasTouch:Wd<700})).newPage(),errs=[];
    p.on('pageerror',e=>errs.push(e.message.slice(0,200)));
    await p.addInitScript(()=>{window.__rafs=[];window.requestAnimationFrame=cb=>{window.__rafs.push(cb);return window.__rafs.length;};
      let a=5;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};window.__now=1e6;performance.now=()=>window.__now;Date.now=()=>1.7e12+window.__now;});
    await p.goto('file://'+path.resolve(PAGE)+'?host=0&scene=none&layers=0');await p.waitForTimeout(1200);
    await p.evaluate(()=>{S.soundOn=false;S.rng=Math.random;window.R0=window.render;window.drawing=on=>{window.render=on?window.R0:()=>{};};
      window.step=k=>{for(let i=0;i<k;i++){window.__now+=1000/60;const L=window.__rafs;window.__rafs=[];for(const f of L){if(f.name==='frame'){try{f(window.__now);}catch(e){window.__errm=String(e&&e.stack||e).slice(0,300);}}else window.__rafs.push(f);}}};});
    await p.evaluate(stageStart,[sh.stage,sh.draw==='all']);
    for(const m of sh.at){
      const g=await p.evaluate(toMoment,[m,sh.draw==='all']);if(g&&g.gone){console.log(sh.id,m,'gone');break;}
      const r=await p.evaluate(()=>{drawing(true);window.R0();drawing(false);
        const dpr=cv.width/Math.max(1,cssW),k=cssW/cam.viewW,L=cam.x-cam.viewW/2,T=cam.T,sx=X=>Math.round((X-L)*k*dpr),sy=Y=>Math.round((Y-T)*k*dpr);
        const far=(S.arena&&S.arena.far)||DEP_MAX+40,lb=typeof ST_LB==='number'?ST_LB:0;
        const people=(S.F||[]).filter(f=>f&&f.p&&!f.gone&&!f.hidden).map(f=>{const d=f.dep||0,xs=f.p.slice(0,11).map(q=>q.x+d*PSX),ys=f.p.slice(0,11).map(q=>q.y-d*PSY);
          return{name:f.name||f.pitCast||f.kind||'?',side:f.side,dead:!!f.dead,box:[sx(Math.min(...xs)-12),sy(Math.min(...ys)-14),sx(Math.max(...xs)+12),sy(Math.max(...ys)+6)]};});
        return{key:typeof envKey==='function'?envKey():null,step:S.story?S.story.step:'',cut:!!S.cut,across:+cam.viewW.toFixed(1),ppu:+(k*dpr).toFixed(3),painted:+sceneScale().toFixed(3),
          ly:typeof SCENE_LY!=='undefined'&&SCENE_LY?+SCENE_LY.sc.toFixed(3):null,yFar:sy(GB-PSY*far),yNear:sy(GB-PSY*DEP_MIN),yFoot:sy(GB),bar:Math.floor(cv.height*.105*lb),
          size:[cv.width,cv.height],people,err:window.__errm||'',png:cv.toDataURL('image/png')};});
      const name=frameName(sh.id,m);fs.writeFileSync(path.join(OUT,name+'.png'),Buffer.from(r.png.split(',')[1],'base64'));delete r.png;
      out.frames.push({id:sh.id,moment:m,name,...r});
      console.log(name,r.key,r.step+(r.cut?'/cut':''),r.across+' across',r.ppu+' px/unit, painted '+r.painted,'people '+r.people.length,r.err?'ERR '+r.err:'',errs.length?'PAGE '+errs[0]:'');}
    await p.close();}
  fs.writeFileSync(path.join(OUT,'levels.json'),JSON.stringify(out,null,1));await b.close();})();
