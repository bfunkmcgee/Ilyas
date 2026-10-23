// The game's page as a player sees it: screenshots at a viewport, of the screen and of the whole page
// usage: node uiwork/shots.js <prefix> <w> <h> <dpr> [mobile 0|1] [mode: load|fight|story] [wait ms]
const {chromium}=require('playwright');
const [PRE,W,H,DPR,MOB,MODE,WAIT]=[process.argv[2],+process.argv[3],+process.argv[4],+process.argv[5],process.argv[6]==='1',process.argv[7]||'load',+(process.argv[8]||2500)];
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[];
  const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:DPR,isMobile:MOB,hasTouch:MOB});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+process.cwd()+'/'+(process.env.PAGE||'ragdoll-skirmish-lab.html'));await p.waitForTimeout(WAIT);
  const info=await p.evaluate(MODE=>{const r={};
    if(MODE==='fight'){if(typeof storyMenu==='function')storyMenu(false);document.body.classList.remove('story');S.storyAuto=false;if(typeof storyQuit==='function'&&S.story)storyQuit();S.arenaKey='street';S.cfg.n=2;S.cfg.crew=false;S.cfg.ally.on=true;S.auto=false;S.F=[];rosterBuild();restart();}
    if(MODE==='story'){storyGo('vargo');}
    const q=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();return[Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)];};
    r.cv=q('#cv');r.stage=q('#stageWrap');r.status=q('.status');r.commands=q('.commands');r.log=q('.log');r.side=q('.side-col');r.top=q('header.top');r.doc=[document.documentElement.scrollWidth,document.documentElement.scrollHeight];
    return r;},MODE);
  await p.waitForTimeout(MODE==='load'?100:4500);
  const info2=await p.evaluate(()=>{const q=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();return[Math.round(b.x),Math.round(b.y+scrollY),Math.round(b.width),Math.round(b.height)];};
    return{cv:q('#cv'),status:q('.status'),commands:q('.commands'),log:q('.log'),side:q('.side-col'),top:q('header.top'),doc:[document.documentElement.scrollWidth,document.documentElement.scrollHeight],phase:S.game.phase,active:S.game.active,story:S.story?S.story.key+':'+S.story.step:null};});
  await p.screenshot({path:PRE+'_view.png'});await p.screenshot({path:PRE+'_full.png',fullPage:true});
  console.log(JSON.stringify(info2),'errors',errs.length,errs.slice(0,2).join(' | '));await b.close();})();
