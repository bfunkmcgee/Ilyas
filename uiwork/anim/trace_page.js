// Motion trace of the story (the prologue on into Act I, each stage's fight played on auto for a while before its enemies are put
// down) and of the restaurant's four rooms, on the real page and never drawn: every fighter's joints hashed every 6 sim steps. Two
// builds that give the same file move every body the same way through them.
// usage: node uiwork/anim/trace_page.js <repo dir> <out.json> [story|rooms]       (the repo must be built: python3 build.py)
//        node uiwork/anim/trace_page.js --cmp <a.json> <b.json>
const fs=require('fs'),path=require('path');
if(process.argv[2]==='--cmp'){const a=JSON.parse(fs.readFileSync(process.argv[3])),b=JSON.parse(fs.readFileSync(process.argv[4]));let bad=0;
  for(const k of new Set([...Object.keys(a),...Object.keys(b)])){const x=a[k],y=b[k];if(!x||!y){console.log(k,'missing in one');bad++;continue;}
    const n=Math.max(x.h.length,y.h.length);let i=0;while(i<n&&x.h[i]===y.h[i])i++;
    if(i<n){bad++;console.log(k,'first difference at checkpoint',i,'of',x.h.length,'/',y.h.length,'| a:',JSON.stringify(x.rows).slice(0,300),'| b:',JSON.stringify(y.rows).slice(0,300));}
    else console.log(k,'same',n,'checkpoints');}
  console.log(bad?'DIFFERENT: '+bad:'page traces identical');process.exit(bad?1:0);}
const {chromium}=require(path.join(__dirname,'..','..','node_modules','playwright'));
const ROOT=path.resolve(process.argv[2]),OUT=process.argv[3],PART=process.argv[4]||'all',FIGHT=+(process.env.FIGHT||1800);
(async()=>{const b=await chromium.launch({executablePath:fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined}),errs=[],out={};
  const open=async()=>{const p=await (await b.newContext({viewport:{width:1100,height:760}})).newPage();
    p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|Failed to load/.test(m.text()))errs.push(m.text());});
    await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
    await p.goto('file://'+ROOT+'/test_page.html');await p.waitForTimeout(300);
    await p.evaluate(()=>{S.soundOn=false;window.__now=performance.now()+1000;
      window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(!f)continue;const R=window.render;window.render=()=>{};try{f(window.__now);}finally{window.render=R;}}};
      window.runUntil=(pred,max)=>{let n=0;while(!pred()&&n<max){step(1);n++;}return n;};
      window.seed=s=>{let a=s;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;};
      const h32=s=>{let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h;};
      window.__H=[];let n=0;
      V11.step.push(()=>{if(++n%6)return;
        window.__H.push(h32(S.F.map(f=>f.p.map(q=>q.x.toFixed(6)+','+q.y.toFixed(6)).join(';')+'|'+f.hp+'|'+(+f.station||0).toFixed(6)+'|'+(+f.dep||0).toFixed(6)).join('#')));});});
    return p;};
  if(PART==='all'||PART==='story'){const p=await open();
    const r=await p.evaluate(FIGHT=>{seed(5);const rows=[];S.storyAuto=true;S.auto=true;S.allyAuto=true;storyBegin(null,{auto:true});step(2);
      for(let guard=0;guard<30;guard++){const SV=S.story;if(!SV||SV.step==='done')break;const key=SV.key,row={key};
        row.intro=runUntil(()=>S.story.step==='fight'||S.story.step==='explore'||S.story.step==='done'||S.story.key!==key,6000);
        if(S.story.key!==key){row.note='went on';rows.push(row);continue;}
        const st=STAGES[S.story.i];
        if(S.story.step==='explore')row.explore=runUntil(()=>S.story.step!=='explore',9000);
        else if(!st.noFight&&S.story.step!=='done'){
          // the fight on auto for a while (the hero's moves, the enemies' and every answer), then whoever is left is put down
          row.fight=runUntil(()=>S.story.key!==key||S.story.step!=='fight'||S.game.phase==='over',FIGHT);
          if(S.story.key===key&&S.story.step==='fight'&&S.game.phase!=='over'){
            if(S.crew)S.crew.queue.length=0;S.opening=null;S.game.ex=null;
            for(const f of S.F)if(f.team===1&&!f.dead&&!f.npc&&!f.inHeli){f.hp=0;kill(f,1);f.walkIn=false;}
            if(key==='office'){S.game.phase='exchange';finishExchange();}else{step(30);storyCleared();}}}
        row.outro=runUntil(()=>!S.story||S.story.key!==key||S.story.step==='done',9000);
        const K=hero();row.K=K?[Math.round(K.p[PEL].x),Math.round(K.p[PEL].y),K.hp]:null;rows.push(row);if(row.outro>=9000){row.note='stuck';break;}}
      return{rows,h:window.__H};},FIGHT);
    out.story=r;await p.context().close();}
  if(PART==='all'||PART==='rooms'){const p=await open();
    const r=await p.evaluate(()=>{seed(7);S.arenaKey='restaurant';S.backroom=true;S.deep=true;S.introOn=false;S.cfg.n=1;S.cfg.crew=false;S.cfg.ally.on=true;S.allyAuto=true;
      S.auto=true;S.F=[];rosterBuild();restart();const rows=[];let n=0;
      for(const r of ['dining','kitchen','lobby','office']){n+=runUntil(()=>S.room===r&&!S.stage.tr&&(S.game.phase==='input'||S.game.phase==='exchange'),20000);
        // each room fought on auto for a while, then cleared
        n+=runUntil(()=>S.game.phase==='over'||S.room!==r,2400);rows.push({at:r,n,t:S.t.toFixed(3)});
        if(r!=='office'&&S.room===r&&S.game.phase!=='over'){if(S.crew)S.crew.queue.length=0;S.opening=null;S.game.ex=null;for(const f of foes()){f.hp=0;kill(f,1);}if(nextRoom())beginTransit();}}
      n+=runUntil(()=>S.game.phase==='over',30000);rows.push({at:'end',n,t:S.t.toFixed(3)});
      return{rows,h:window.__H};});
    out.rooms=r;await p.context().close();}
  fs.writeFileSync(OUT,JSON.stringify(out));
  for(const k in out)console.log(k,out[k].h.length,'checkpoints',JSON.stringify(out[k].rows).slice(0,1500));
  console.log('errors',errs.length,JSON.stringify(errs.slice(0,4)));await b.close();})();
