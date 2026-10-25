// The side-by-side sheets for the motion styles test: each blow, landing, in each style, photographed at the same moments of its own
// plan (the guard before it, the windup, the impact, the follow-through and back in guard), cropped round the two men, and written as
// one picture per blow (rows: the styles; columns: the moments) into proto/styles/sheets/<blow>.jpg.
// usage: node proto/styles/styles_sheet.js [blow,...] [style,...]      (needs styles_test_page.html: python3 proto/styles/build_styles.py)
//        then python3 proto/styles/styles_sheet.py   (lays the cells out with their labels)
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const HERE=__dirname,OUT=path.join(HERE,'sheets','cells');fs.mkdirSync(OUT,{recursive:true});
const BLOWS=(process.argv[2]||'slash,thrust,overhead,sweep').split(','),STYLES=(process.argv[3]||'regular,tactical,wire').split(',');
const W=480,H=380;   // a cell, in pixels: the two men cropped to fill it (the page at 1200 x 760, drawn at twice that)
(async()=>{const b=await chromium.launch({executablePath:fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined}),errs=[];
  const p=await (await b.newContext({viewport:{width:1200,height:760},deviceScaleFactor:2})).newPage();
  p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};window.__drawEvery=1;});
  await p.goto('file://'+path.join(HERE,'styles_test_page.html'));await p.waitForTimeout(400);
  await p.evaluate(WH=>{S.soundOn=false;window.__now=performance.now()+1000;window.__WH=WH;
    window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    // the two men's middle on the canvas, in canvas pixels, and a crop of the canvas round it
    // (the numbers over a struck man are left out, so the bodies are what is seen)
    window.cellAt=(w,h)=>{S.popups=[];S.callouts=[];render();const s=cv.width/cam.viewW,L=cam.x-cam.viewW/2,T=camTop();
      const pts=[];for(const f of S.F.slice(0,2))for(const q of f.p)pts.push({x:(q.x+f.dep*PSX-L)*s,y:(q.y-f.dep*PSY-T)*s});
      const xs=pts.map(q=>q.x),ys=pts.map(q=>q.y),K=S.F[0],ht=(K.leg+K.body.torso+K.body.neck+K.body.headR*2)*s;
      const ch=ht*1.5,cw=ch*w/h,cx=(Math.min(...xs)+Math.max(...xs))/2,by=Math.max(...ys)+ht*.12;
      const x0=Math.min(Math.max(0,cx-cw/2),cv.width-cw),y0=Math.min(Math.max(0,by-ch),cv.height-ch);
      const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(cv,x0,y0,cw,ch,0,0,w,h);return c.toDataURL('image/png');};
    // (the page's own first frames put its opening blow up: they are let go before the first stage)
    window.step(6);},[W,H]);
  for(const blow of BLOWS)for(const st of STYLES){
    // the stage up and settled, then the blow; its moments come from the plan Kael is given
    const plan=await p.evaluate(([blow,st])=>{SLAB.style=st;SLAB.flourish=false;S.userSlow=false;SLAB.on=true;slabStage();step(30);
      window.__guard=cellAt(...window.__WH);
      SLAB.force='hit';command(0,blow);const K=S.F[0],a=K.action;if(!a)return null;
      const ks=a.arm.map(k=>k.t),Ti=S.game.ex.plan.Timp,i=ks.findIndex(t=>Math.abs(t-Ti)<1e-9);
      return{t0:a.t0,wind:ks[i-1],imp:Ti,fol:ks[i+2],end:a.end,out:S.game.ex.res.out,name:S.game.ex.res.tech.name};},[blow,st]);
    if(!plan){console.log('no plan',blow,st);continue;}
    const cells={guard:await p.evaluate(()=>window.__guard)};
    // (the impact a hair before the blade arrives, ahead of the flash of the blow)
    for(const [k,t] of [['wind',plan.wind],['imp',plan.imp-.03],['fol',plan.fol],['back',plan.end-.02]]){
      cells[k]=await p.evaluate(([t0,t])=>{let n=0;while(S.t-t0<t&&n<2000){step(1);n++;}return cellAt(...window.__WH);},[plan.t0,t]);}
    for(const k in cells)fs.writeFileSync(path.join(OUT,`${blow}_${st}_${k}.png`),Buffer.from(cells[k].split(',')[1],'base64'));
    console.log(blow,st,plan.name,plan.out,JSON.stringify({wind:+plan.wind.toFixed(2),imp:+plan.imp.toFixed(2),fol:+plan.fol.toFixed(2),end:+plan.end.toFixed(2)}));}
  console.log('errors',errs.length,JSON.stringify(errs.slice(0,3)));await b.close();})();
