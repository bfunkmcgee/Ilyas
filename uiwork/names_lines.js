// the whole prologue in auto play, every spoken line in order: stage, speaker, text, whether the speaker stands on the floor, its colour
// usage: node uiwork/names_lines.js <outdir> [w h] [shot regex]
const {chromium}=require('playwright');const fs=require('fs');
const OUT=process.argv[2]||'uiwork/lines',VW=+(process.argv[3]||844),VH=+(process.argv[4]||390),SHOT=new RegExp(process.argv[5]||'^$');fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[];
  const p=await (await b.newContext({viewport:{width:VW,height:VH},deviceScaleFactor:2})).newPage();
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|Failed to load/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+process.cwd()+'/'+(process.env.PAGE||'test_page.html'));await p.waitForTimeout(300);
  await p.evaluate(()=>{S.soundOn=false;let a=5;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
    window.__now=performance.now()+1000;window.__last=null;window.__lines=[];
    window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);
      const s=S.say;if(s&&s!==window.__last){window.__last=s;const F=S.F.find(x=>x.name===s.who);
        window.__lines.push({stage:S.story&&S.story.key,step:S.story&&S.story.step,who:s.who,text:s.text,onFloor:!!F,col:s.col||storyCol(s.who),hero:!!(F&&F.idx===0)});}}};
    window.runUntil=(pred,max)=>{let n=0;while(!pred()&&n<max){step(1);n++;}return n;};
    storyGo('field');S.storyAuto=true;S.auto=true;step(2);});
  let shots=0;
  for(let guard=0;guard<16;guard++){
    // the scene before the fight, line by line; a shot of the box for the lines asked for
    for(let k=0;k<60;k++){
      const r=await p.evaluate(()=>{const SV=S.story;if(!SV||SV.ended)return{end:true};const key=SV.key,n0=__lines.length;
        runUntil(()=>__lines.length>n0||!S.story||S.story.key!==key||S.story.step==='fight'||S.story.ended,9000);
        return{key,line:__lines.length>n0?__lines[__lines.length-1]:null,step:S.story&&S.story.step};});
      if(!r.line)break;
      if(SHOT.test(r.line.text)){await p.evaluate(()=>step(Math.min(140,Math.ceil(S.say?S.say.text.length/STORY_CPS*60+10:10))));
        await p.screenshot({path:`${OUT}/${String(shots++).padStart(2,'0')}_${r.key}.png`});}
    }
    const done=await p.evaluate(()=>{const SV=S.story;if(!SV||SV.ended)return true;const key=SV.key,sti=STAGES[S.story.i];
      if(!sti.noFight&&S.story.step==='fight'){runUntil(()=>S.game.phase==='input'||S.game.phase==='exchange',4000);step(60);
        if(S.crew)S.crew.queue.length=0;S.opening=null;S.game.ex=null;for(const f of S.F)if(f.team===1&&!f.dead&&!f.npc&&!f.inHeli){f.hp=0;kill(f,1);f.walkIn=false;}
        if(key==='office'){S.game.phase='exchange';finishExchange();}else{step(30);storyCleared();}}
      // the scene after the fight: its lines are recorded as the frames run
      runUntil(()=>!S.story||S.story.key!==key||S.story.ended,20000);return !S.story||S.story.ended;});
    if(done)break;}
  const lines=await p.evaluate(()=>__lines);fs.writeFileSync(OUT+'/lines.json',JSON.stringify(lines,null,1));
  for(const l of lines)console.log([l.stage,l.step,l.who+(l.onFloor?'':' (off floor)')+(l.hero?' [hero]':''),l.col,l.text].join(' | '));
  console.log('errors',errs.length,JSON.stringify(errs.slice(0,5)));await b.close();})();
