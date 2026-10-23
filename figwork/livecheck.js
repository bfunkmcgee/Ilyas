// the published page itself: loads, plays a few seconds of its own animation loop, no page errors
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[];
  const p=await (await b.newContext({viewport:{width:1280,height:800}})).newPage();p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|Failed to load/.test(m.text()))errs.push(m.text());});
  await p.goto('file://'+process.cwd()+'/ragdoll-skirmish-lab.html');await p.waitForTimeout(4000);
  const r=await p.evaluate(()=>({t:typeof S!=='undefined'?+S.t.toFixed(2):null,figs:typeof FigKit!=='undefined',turns:typeof turnsRound==='function',F:typeof S!=='undefined'?S.F.length:0}));
  console.log(JSON.stringify(r));if(!(r.t>0&&r.F>0))console.log('FAIL the page did not run its own loop');
  console.log('errors',errs.length,JSON.stringify(errs.slice(0,5)));await b.close();process.exit(errs.length||!(r.t>0&&r.F>0)?1:0);})();
