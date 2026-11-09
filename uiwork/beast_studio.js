// The beasts on their own, large: a story stage's fight stepped, and at each still every goblin, the lizard and Ilyas drawn again by
// their own painters on a plain dark card at K pixels a unit (K under 3.4 is the game's own detail, as a phone or a desktop draws
// them; 3.4 and over is a close view's), side by side in one sheet per still, then all the stills of each in one strip.
// usage: node uiwork/beast_studio.js <out> [K] [stage] [frames per still] [stills] [moment]
//   PAGE=uiwork/qa_test.html to shoot a copy
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const {chromiumPath,pageSetup,stageStart,toMoment}=require('./look/places.js');
const [OUT,K,STAGE,EVERY,N,MOM]=[process.argv[2]||'test_out/beast_studio',+(process.argv[3]||3),process.argv[4]||'deep',+(process.argv[5]||22),+(process.argv[6]||10),process.argv[7]||'f2'];
fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:chromiumPath()}),errs=[];
  const p=await (await b.newContext({viewport:{width:1200,height:800},deviceScaleFactor:1})).newPage();p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+process.cwd()+'/'+(process.env.PAGE||'test_page.html'));await p.waitForTimeout(300);
  await p.evaluate(([a,b2,c])=>{window.pageSetup=eval('('+a+')');window.stageStart=eval('('+b2+')');window.toMoment=eval('('+c+')');pageSetup();},
    [pageSetup.toString(),stageStart.toString(),toMoment.toString()]);
  await p.evaluate(k=>stageStart([k,false]),STAGE);
  const g=await p.evaluate(m=>toMoment([m,false]),MOM);if(g&&g.gone){console.log('stage ended first');await b.close();return;}
  const strips={};
  for(let i=0;i<N;i++){
    const r=await p.evaluate(K=>{drawing(true);window.R0();const out=[],keep=ctx;
      const who=S.F.filter(f=>!f.gone&&!f.hidden&&(f.beast||f.idx===0));
      for(const f of who){const big=f.beast==='lizard',Wc=Math.round((big?190:120)*K),Hc=Math.round((big?250:150)*K),c=document.createElement('canvas');c.width=Wc;c.height=Hc;
        const x=c.getContext('2d');x.fillStyle='#16181f';x.fillRect(0,0,Wc,Hc);
        const ys=f.p.map(q=>q.y),gy=Math.max(...ys),cx=(f.p[0].x+f.p[1].x)/2;
        x.setTransform(K,0,0,K,Wc/2-cx*K,Hc-14*K-gy*K);ctx=x;
        try{if(f.beast)drawBeast(f);else drawKael(f);}catch(e){out.push({err:String(e)});}finally{ctx=keep;}
        out.push({who:f.beast?f.beast+f.idx:'ilyas',png:c.toDataURL('image/png'),pose:f.downed?'down':f.dead?'dead':''});}
      drawing(false);return{t:+S.t.toFixed(2),phase:S.game.phase,out};},K);
    for(const o of r.out){if(o.err){console.log('ERR',o.err);continue;}const f=path.join(OUT,`s${String(i).padStart(2,'0')}_${o.who}.png`);
      fs.writeFileSync(f,Buffer.from(o.png.split(',')[1],'base64'));(strips[o.who]=strips[o.who]||[]).push(f);}
    console.log(i,r.t,r.phase,r.out.map(o=>o.who+':'+o.pose).join(' '));
    await p.evaluate(k=>{step(k);},EVERY);}
  fs.writeFileSync(path.join(OUT,'strips.json'),JSON.stringify(strips));
  console.log('errors',errs.length,errs.slice(0,3).join(' | '));await b.close();})();
