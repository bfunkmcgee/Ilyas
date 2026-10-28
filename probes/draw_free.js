// The game never depends on its drawing: the prologue played through from its opening at sundown (every stage's opening and closing scenes, its fight ended by
// killing its enemies) and on into Act I as far as it goes (the scenes he walks about in walked through by the auto explorer), a seeded auto-battle on every ground and with a crew, and the restaurant run through its four rooms to the
// end of the last scene, once drawing one frame in eight and once drawing none. The two must give the same lines; a stage that sticks fails as well. (The page suites draw one frame in eight to save time,
// which is sound only while this holds.)
// usage: node probes/draw_free.js             both ways, compared (the check)
//        DRAW_EVERY=1|8|0 node probes/draw_free.js   one way only, its lines printed (1 draws every frame, as the page does)
//        PART=story|lab|rooms                   one part only
const {chromium}=require('playwright');
const ONE=process.env.DRAW_EVERY!=null&&process.env.DRAW_EVERY!=='',MODES=ONE?[+process.env.DRAW_EVERY]:[8,0];
const PAGE=process.env.PAGE||'test_page.html',PART=process.env.PART||'all';
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[];
  const open=async(every)=>{const p=await (await b.newContext({viewport:{width:1100,height:760}})).newPage();
    p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|Failed to load/.test(m.text()))errs.push(m.text());});
    await p.addInitScript(e=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};window.__drawEvery=e;},every);
    await p.goto('file://'+process.cwd()+'/'+PAGE);await p.waitForTimeout(300);
    await p.evaluate(()=>{S.soundOn=false;window.__now=performance.now()+1000;
      // a frame stepped by hand, drawn or only simulated (render stood down for it)
      window.step=k=>{const ev=window.__drawEvery;for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(!f)continue;
        if(ev===1||(ev>1&&(window.__fc=(window.__fc||0)+1)%ev===0))f(window.__now);else{const R=window.render;window.render=()=>{};try{f(window.__now);}finally{window.render=R;}}}};
      window.runUntil=(pred,max)=>{let n=0;while(!pred()&&n<max){step(1);n++;}return n;};
      window.seed=s=>{let a=s;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;};});
    return p;};
  const story=async every=>{const p=await open(every);
    const rows=await p.evaluate(()=>{seed(5);const rows=[];S.storyAuto=true;S.auto=true;storyBegin(null,{auto:true});step(2);
      for(let guard=0;guard<26;guard++){const SV=S.story;if(!SV||SV.step==='done')break;const key=SV.key,row={key};
        row.intro=runUntil(()=>S.story.step==='fight'||S.story.step==='explore'||S.story.step==='done'||S.story.key!==key,6000);
        if(S.story.key!==key){row.note='went on';rows.push(row);continue;}
        const st=STAGES[S.story.i];
        // (a stage he walks about in: the auto explorer uses each thing in turn until the stage's goal is met)
        if(S.story.step==='explore')row.explore=runUntil(()=>S.story.step!=='explore',9000);
        else if(!st.noFight&&S.story.step!=='done'){runUntil(()=>S.game.phase==='input'||S.game.phase==='exchange',4000);step(10);
          if(S.crew)S.crew.queue.length=0;S.opening=null;S.game.ex=null;
          for(const f of S.F)if(f.team===1&&!f.dead&&!f.npc&&!f.inHeli){f.hp=0;kill(f,1);f.walkIn=false;}
          if(key==='office'){S.game.phase='exchange';finishExchange();row.finale=!!S.finale;}else{step(30);storyCleared();}}
        row.outro=runUntil(()=>!S.story||S.story.key!==key||S.story.step==='done',9000);
        const K=hero();row.next=S.story&&S.story.key;row.K=K?{x:Math.round(K.p[PEL].x),y:Math.round(K.p[PEL].y),hid:!!K.hidden}:null;
        rows.push(row);if(row.outro>=9000){row.note='stuck';break;}}
      return rows;});
    await p.context().close();return rows.map(r=>'story '+JSON.stringify(r));};
  const lab=async every=>{const p=await open(every);
    const rows=await p.evaluate(()=>{const out=[];
      for(const [ar,n,crew,sd] of [['street',2,false,3],['field',2,false,5],['hill',2,false,7],['ledge',2,false,9],['wall',3,false,11],['restaurant',3,false,13],['street',1,true,17]]){
        seed(sd);S.arenaKey=ar;S.introOn=true;S.cfg.n=n;S.cfg.crew=crew;S.cfg.ally.on=true;S.auto=true;S.allyAuto=true;S.backroom=ar==='restaurant';S.deep=false;S.F=[];rosterBuild();restart();
        for(let i=0;i<2400&&S.game.phase!=='over';i++)step(1);
        out.push({ar,crew,t:S.t.toFixed(3),phase:S.game.phase,room:S.room,F:S.F.map(f=>[f.name,f.hp,Math.round(f.station),Math.round(f.dep*10),f.dead?1:0,f.foot].join(':')).join(' ')});}
      return out;});
    await p.context().close();return rows.map(r=>'fight '+JSON.stringify(r));};
  // the restaurant run on auto: the dining room, the kitchen and the lobby cleared by hand (the hidden lift and the blown door between
  // them), then the office fought out on auto, the last scene and its choice included
  const rooms=async every=>{const p=await open(every);
    const rows=await p.evaluate(()=>{seed(7);S.arenaKey='restaurant';S.backroom=true;S.deep=true;S.introOn=false;S.cfg.n=1;S.cfg.crew=false;S.cfg.ally.on=true;S.allyAuto=true;
      S.auto=true;S.F=[];rosterBuild();restart();
      const clearNow=()=>{if(S.crew)S.crew.queue.length=0;S.opening=null;S.game.ex=null;for(const f of foes()){f.hp=0;kill(f,1);}if(nextRoom())beginTransit();};
      const st=()=>({t:S.t.toFixed(3),phase:S.game.phase,room:S.room,F:S.F.map(f=>[f.name,f.hp,Math.round(f.station),Math.round(f.dep*10),f.dead?1:0].join(':')).join(' ')});
      const out=[];let n=0;
      for(const r of ['dining','kitchen','lobby','office']){n+=runUntil(()=>S.room===r&&!S.stage.tr&&(S.game.phase==='input'||S.game.phase==='exchange'),20000);
        out.push({at:r,n,...st()});if(r!=='office')clearNow();}
      n+=runUntil(()=>S.game.phase==='over',30000);out.push({at:'end',n,...st(),finale:!!S.finaleDone,end:S.endText||''});
      return out;});
    await p.context().close();return rows.map(r=>'rooms '+JSON.stringify(r));};
  const runs=[];
  for(const ev of MODES){const lines=[];if(PART==='all'||PART==='story')lines.push(...await story(ev));if(PART==='all'||PART==='lab')lines.push(...await lab(ev));
    if(PART==='all'||PART==='rooms')lines.push(...await rooms(ev));runs.push(lines);}
  for(const l of runs[0])console.log(l);
  let bad=0;
  for(const l of runs[0])if(/"note":"stuck"/.test(l)){bad++;console.log('FAIL the prologue sticks: '+l.slice(0,160));}
  for(const l of runs[0])if(/^rooms .*"at":"end"/.test(l)&&!/"phase":"over"/.test(l)){bad++;console.log('FAIL the restaurant run does not reach its end: '+l.slice(0,200));}
  if(runs.length>1){const [a,c]=runs;
    for(let i=0;i<Math.max(a.length,c.length);i++)if(a[i]!==c[i]){bad++;console.log('FAIL drawn one frame in '+MODES[0]+' and never drawn differ:\n  '+(a[i]||'(nothing)').slice(0,240)+'\n  '+(c[i]||'(nothing)').slice(0,240));}
    if(!bad)console.log('ok   the same '+a.length+' lines drawn one frame in '+MODES[0]+' and never drawn');}
  console.log('errors',errs.length,JSON.stringify(errs.slice(0,6)));await b.close();process.exit(bad||errs.length?1:0);})();
