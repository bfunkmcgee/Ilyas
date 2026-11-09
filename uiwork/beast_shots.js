// The beasts as the player sees them: a story stage stepped through its fight, each still the whole frame and a crop round every
// goblin and the lizard (and Ilyas, to set them beside), at full size.
// usage: node uiwork/beast_shots.js <out> [w h dpr] [stage] [frames per still] [stills] [moment]
//   PAGE=uiwork/qa_test.html to shoot a copy; the stills start at the moment (default 'f2': two seconds into the fight)
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const {chromiumPath,pageSetup,stageStart,toMoment}=require('./look/places.js');
const [OUT,W,H,DPR,STAGE,EVERY,N,MOM]=[process.argv[2]||'test_out/beasts',+(process.argv[3]||412),+(process.argv[4]||714),+(process.argv[5]||2.6),
  process.argv[6]||'deep',+(process.argv[7]||24),+(process.argv[8]||10),process.argv[9]||'f2'];
fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:chromiumPath()}),errs=[];
  const p=await (await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:DPR})).newPage();p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+process.cwd()+'/'+(process.env.PAGE||'test_page.html'));await p.waitForTimeout(300);
  await p.evaluate(([a,b2,c])=>{window.pageSetup=eval('('+a+')');window.stageStart=eval('('+b2+')');window.toMoment=eval('('+c+')');pageSetup();},
    [pageSetup.toString(),stageStart.toString(),toMoment.toString()]);
  await p.evaluate(k=>stageStart([k,false]),STAGE);
  const g=await p.evaluate(m=>toMoment([m,false]),MOM);if(g&&g.gone){console.log('stage ended first');await b.close();return;}
  for(let i=0;i<N;i++){
    const r=await p.evaluate(()=>{drawing(true);window.R0();const out=[];
      const who=S.F.filter(f=>!f.gone&&!f.hidden&&(f.beast||f.idx===0));
      for(const f of who){const R=FXL.sprite&&FXL.sprite(f);if(!R||!R.w)continue;const m=Math.round(30*cv.width/Math.max(1,cssW)),x0=Math.max(0,R.x-m),y0=Math.max(0,R.y-m),
          w=Math.min(cv.width,R.x+R.w+m)-x0,h=Math.min(cv.height,R.y+R.h+m)-y0;if(w<8||h<8)continue;
        const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(cv,x0,y0,w,h,0,0,w,h);
        out.push({who:f.beast?f.beast+f.idx:'ilyas',png:c.toDataURL('image/png'),pose:f.downed?'down':f.dead?'dead':(f.anim&&f.anim.kind)||''});}
      drawing(false);return{t:+S.t.toFixed(2),phase:S.game.phase,out};});
    await p.screenshot({path:path.join(OUT,`s${String(i).padStart(2,'0')}_frame.png`)});
    for(const o of r.out)fs.writeFileSync(path.join(OUT,`s${String(i).padStart(2,'0')}_${o.who}.png`),Buffer.from(o.png.split(',')[1],'base64'));
    console.log(i,r.t,r.phase,r.out.map(o=>o.who+':'+o.pose).join(' '));
    await p.evaluate(k=>{step(k);},EVERY);}
  console.log('errors',errs.length,errs.slice(0,3).join(' | '));await b.close();})();
