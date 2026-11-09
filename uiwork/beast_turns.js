// The beasts turned about their upright axis (the lizard's tail coming round, a goblin's spinning cut), drawn on a plain card at
// several turns, side by side: a stage's fight run to a moment, then each beast and Ilyas drawn at each yaw by their own painters.
// usage: node uiwork/beast_turns.js <out.png> [K] [stage] [moment] [yaws, comma separated]
//   PAGE=uiwork/qa_test.html to shoot a copy
const {chromium}=require('playwright'),fs=require('fs');
const {chromiumPath,pageSetup,stageStart,toMoment}=require('./look/places.js');
const [OUT,K,STAGE,MOM,YAWS]=[process.argv[2]||'test_out/beast_turns.png',+(process.argv[3]||3),process.argv[4]||'deep',process.argv[5]||'f2',(process.argv[6]||'0,0.7,1.4,2.2,3.14,4.1,5.2').split(',').map(Number)];
(async()=>{const b=await chromium.launch({executablePath:chromiumPath()}),errs=[];
  const p=await (await b.newContext({viewport:{width:1200,height:800},deviceScaleFactor:1})).newPage();p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+process.cwd()+'/'+(process.env.PAGE||'test_page.html'));await p.waitForTimeout(300);
  await p.evaluate(([a,b2,c])=>{window.pageSetup=eval('('+a+')');window.stageStart=eval('('+b2+')');window.toMoment=eval('('+c+')');pageSetup();},
    [pageSetup.toString(),stageStart.toString(),toMoment.toString()]);
  await p.evaluate(k=>stageStart([k,false]),STAGE);await p.evaluate(m=>toMoment([m,false]),MOM);
  const png=await p.evaluate(([K,Y])=>{drawing(true);window.R0();const keep=ctx,who=S.F.filter(f=>!f.gone&&!f.hidden&&f.beast);
    const cw=f=>Math.round((f.beast==='lizard'?200:120)*K),ch=Math.round(260*K),W=who.reduce((s,f)=>s+cw(f),0)*Y.length,c=document.createElement('canvas');c.width=Math.min(W,16000);c.height=ch*1;
    const x=c.getContext('2d');x.fillStyle='#16181f';x.fillRect(0,0,c.width,c.height);let ox=0;
    for(const y of Y)for(const f of who){const ys=f.p.map(q=>q.y),gy=Math.max(...ys),cx=(f.p[0].x+f.p[1].x)/2,w=cw(f);
      x.setTransform(K,0,0,K,ox+w/2-cx*K,ch-14*K-gy*K);ctx=x;const y0=f._yaw;f._yaw=y;
      try{drawBeast(f);}catch(e){window.__err=String(e);}finally{ctx=keep;f._yaw=y0;}ox+=w;}
    drawing(false);return c.toDataURL('image/png');},[K,YAWS]);
  fs.writeFileSync(OUT,Buffer.from(png.split(',')[1],'base64'));
  console.log('errors',errs.length,errs.slice(0,3).join(' | '),await p.evaluate(()=>window.__err||''));await b.close();})();
