// The people of the Pit drawn by CastLook alone, each in a cell of one picture at a chosen scale, from their own bodies standing on
// an Act I ground (Ilyas first, for scale, when "Ilyas" is named).
// (HEAD=1: the heads alone, close)
// usage: node uiwork/act1/art_c/portrait.js <out.png> <names> <scale> [yaw] [frames] [js run before the stills] [seed,...]
// e.g. node uiwork/act1/art_c/portrait.js uiwork/act1/art_c/p.png "Tamm,Dob,Nim" 4
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const OUT=process.argv[2],NAMES=process.argv[3].split(','),SC=+(process.argv[4]||4),YAW=+(process.argv[5]||0),FR=+(process.argv[6]||70),JS=process.argv[7]||'',SEEDS=(process.argv[8]||'').split(',').filter(Boolean).map(Number);
fs.mkdirSync(path.dirname(OUT),{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[];
  const p=await (await b.newContext({viewport:{width:900,height:600},deviceScaleFactor:1})).newPage();
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|Failed to load/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(h=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};window.__HEAD=h;},!!process.env.HEAD);
  await p.goto('file://'+process.cwd()+'/'+(process.env.PAGE||'uiwork/qa_test.html'));await p.waitForTimeout(300);
  const r=await p.evaluate(([NAMES,SC,YAW,FR,JS,SEEDS])=>{S.soundOn=false;let a=5;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
    window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    const who=NAMES.filter(n=>n!=='Ilyas');
    STAGES.push({key:'__pt',act:1,num:'',title:'',sub:'',arena:'yard',noFight:true,cardDur:0,foes:[],spawn:[[120,100]],
      setup(){S.fade=0;const K=hero();standEasy(K);K.facing=1;who.forEach((nm,i)=>{act1Npc(nm,{x:220+i*80,dep:100,facing:-1,seed:SEEDS[i]});});},
      *intro(){letter(0);camTo(450,900,0);while(true)yield;}});
    storyBegin('__pt',{auto:true});if(JS)eval(JS);step(FR);
    const list=S.F.filter(f=>f.pitCast||(NAMES.includes('Ilyas')&&f===hero()));
    const HD=window.__HEAD,cw=Math.round((HD?54:72)*SC),ch=Math.round((HD?60:176)*SC),cv=document.createElement('canvas');cv.width=cw*list.length;cv.height=ch;const c=cv.getContext('2d');
    c.fillStyle='#1c1e24';c.fillRect(0,0,cv.width,cv.height);
    const info=[];
    list.forEach((f,i)=>{const P=f.p[CHE],g=Math.max(f.p[FTF].y,f.p[FTB].y);c.save();c.beginPath();c.rect(cw*i,0,cw,ch);c.clip();
      const Hh=f.p[HEAD];if(HD)c.setTransform(SC,0,0,SC,cw*i+cw/2-Hh.x*SC,ch*.66-Hh.y*SC);else c.setTransform(SC,0,0,SC,cw*i+cw/2-P.x*SC,ch-10*SC-g*SC);const L=kaelLight(f);
      if(f===hero())KaelLook.draw(c,f,{light:L.light,dir:L.dir,now:S.t,wind:0});
      else{const sp=castSpec(f);CastLook.draw(c,f,sp,{light:L.light,dir:L.dir,now:S.t,yaw:YAW,drawOther:null});info.push(f.name+(CastLook.CAST[f.pitCast]?'':'(stand-in)'));}
      c.restore();});
    return{url:cv.toDataURL('image/png'),info};},[NAMES,SC,YAW,FR,JS,SEEDS]);
  fs.writeFileSync(OUT,Buffer.from(r.url.split(',')[1],'base64'));console.log(JSON.stringify(r.info));
  console.log('errors',errs.length,JSON.stringify(errs.slice(0,5)));await b.close();})();
