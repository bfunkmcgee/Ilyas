// The people of the Pit standing in a row on an Act I ground, seen in the QA page (Ilyas at the left for scale).
// usage: node uiwork/act1/castview.js <out.png> <names, comma separated> [w h dpr] [arena] [view width] [frames] [js]
// e.g. node uiwork/act1/castview.js /tmp/c.png "Tamm,Dob,Nim" 1100 620 2 yard 520
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const OUT=process.argv[2],NAMES=(process.argv[3]||'Tamm,Dob').split(','),Wd=+(process.argv[4]||1100),Ht=+(process.argv[5]||620),DPR=+(process.argv[6]||1),AR=process.argv[7]||'yard',VW=+(process.argv[8]||760),FR=+(process.argv[9]||70),JS=process.argv[10]||'';
fs.mkdirSync(path.dirname(OUT),{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[];
  const p=await (await b.newContext({viewport:{width:Wd,height:Ht},deviceScaleFactor:DPR})).newPage();
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|Failed to load/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+process.cwd()+'/'+(process.env.PAGE||'uiwork/qa_test.html'));await p.waitForTimeout(400);
  const r=await p.evaluate(([NAMES,AR,VW,FR,JS])=>{S.soundOn=false;let a=5;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
    window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    const n=NAMES.length,x0=450-(n*70)/2;
    STAGES.push({key:'__cast',act:1,num:'',title:'',sub:'',arena:AR,noFight:true,cardDur:0,foes:[],spawn:[[x0-60,100]],
      setup(){S.fade=0;const K=hero();standEasy(K);K.facing=1;NAMES.forEach((nm,i)=>{act1Npc(nm,{x:x0+30+i*70,dep:100,facing:-1});});},
      *intro(){letter(0);camTo(450,VW,0);while(true)yield;}});
    storyBegin('__cast',{auto:true});if(JS)eval(JS);step(FR);
    return{names:S.F.map(f=>f.name+(f.pitCast?'['+(CastLook.CAST[f.pitCast]?'cast':'stand-in')+']':'')),arena:S.arenaKey};},[NAMES,AR,VW,FR,JS]);
  await p.screenshot({path:OUT});console.log(JSON.stringify(r));console.log('errors',errs.length,JSON.stringify(errs.slice(0,5)));await b.close();})();
