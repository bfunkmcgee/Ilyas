// every stage of the story, a still a little way into its fight (and one in its opening scene), for judging the light in each
// usage: node uiwork/story_tour.js <outdir> [w h]
const {chromium}=require('playwright');const fs=require('fs');
const OUT=process.argv[2]||'uiwork/tour',VW=+(process.argv[3]||1440),VH=+(process.argv[4]||900);fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[];
  const p=await (await b.newContext({viewport:{width:VW,height:VH}})).newPage();
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|Failed to load/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+process.cwd()+'/'+(process.env.PAGE||'test_page.html'));await p.waitForTimeout(300);
  await p.evaluate(()=>{S.soundOn=false;let a=5;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
    window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    window.runUntil=(pred,max)=>{let n=0;while(!pred()&&n<max){step(1);n++;}return n;};
    S.storyAuto=true;S.auto=true;storyBegin('field',{auto:true});step(2);});
  for(let guard=0;guard<14;guard++){
    const st=await p.evaluate(()=>{const SV=S.story;if(!SV||SV.step==='done'||SV.ended)return null;const key=SV.key;
      runUntil(()=>S.story.step!=='intro'||S.story.key!==key||(S.t>(window.__t0??(window.__t0=S.t))+4),3000);return{key,scene:envKey()};});
    if(!st)break;await p.screenshot({path:`${OUT}/${String(guard).padStart(2,'0')}_${st.key}_intro.png`});
    const r=await p.evaluate(()=>{window.__t0=undefined;const SV=S.story,key=SV.key;runUntil(()=>S.story.step==='fight'||S.story.key!==key,6000);
      if(S.story.key!==key)return{key,went:true};const sti=STAGES[S.story.i];
      if(!sti.noFight){runUntil(()=>S.game.phase==='input'||S.game.phase==='exchange',4000);step(200);}
      return{key,scene:envKey(),noFight:!!sti.noFight};});
    await p.screenshot({path:`${OUT}/${String(guard).padStart(2,'0')}_${r.key}_fight.png`});console.log(JSON.stringify(r));
    const done=await p.evaluate(()=>{const SV=S.story;if(!SV)return true;const key=SV.key,sti=STAGES[S.story.i];
      if(!sti.noFight){if(S.crew)S.crew.queue.length=0;S.opening=null;S.game.ex=null;for(const f of S.F)if(f.team===1&&!f.dead&&!f.npc&&!f.inHeli){f.hp=0;kill(f,1);f.walkIn=false;}
        if(key==='office'){S.game.phase='exchange';finishExchange();}else{step(30);storyCleared();}}
      runUntil(()=>!S.story||S.story.key!==key||S.story.step==='done'||S.story.ended,9000);return !S.story||S.story.ended;});
    if(done)break;}
  console.log('errors',errs.length,JSON.stringify(errs.slice(0,5)));await b.close();})();
