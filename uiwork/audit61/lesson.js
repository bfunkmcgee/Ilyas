// A Short Hand lesson played the way a player would (no auto): a policy picks his commands and his answers in the windows, and the
// run notes the drill's count, her turns, the bout's touches, and whether the lesson ends. usage:
//   node uiwork/audit61/lesson.js <stage> <policy> [maxSecs] [seed]
// policies: follow (what the goal and hint say), naive (the first command and the first answer), passive (Hold, and let every window
// run out), random (anything valid), literal (sh5: shove, then sweep, as the hint reads)
const {chromium}=require('playwright');
const KEY=process.argv[2]||'sh1',POL=process.argv[3]||'follow',MAX=+(process.argv[4]||600),SEED=+(process.argv[5]||5);
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)});const p=await (await b.newContext({viewport:{width:1100,height:620}})).newPage();
  const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|Failed to load/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(h=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};if(h)window.__HERS=h;},+(process.env.HERS||0));
  await p.goto('file://'+process.cwd()+'/'+(process.env.PAGE||'uiwork/qa_test.html'));await p.waitForTimeout(300);
  const r=await p.evaluate(([KEY,POL,MAX,SEED])=>{S.soundOn=false;let a=SEED;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
    window.__now=performance.now()+1000;let fc=0;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(!f)continue;fc++;
      if(fc%10===0)f(window.__now);else{const R=window.render;window.render=()=>{};try{f(window.__now);}finally{window.render=R;}}}};
    if(window.__HERS){SH_TOUCH.hersLesson=window.__HERS;SH_TOUCH.hersLast=window.__HERS;}storyGo(KEY);S.storyAuto=false;S.auto=false;step(2);
    const out={key:KEY,pol:POL,cmds:{},answers:{},events:{},trace:[],says:[]};let lastSay=null;
    {const sh=S.hooks.short;S.hooks.short=(ev,d)=>{if(sh)sh(ev,d);out.events[ev]=(out.events[ev]||0)+1;};}
    const L=shLesson(),rnd=()=>Math.random();
    // (a slot of the dock, as the player presses it: the command it is now, and whether that is allowed)
    const valid=k=>{const K=S.F[0],T=shTamm();if(!T)return false;const act=slotAction(K,T,k);return!!act&&cmdValid(K,T,act);};
    const pick=ks=>ks.find(valid)||'wait';
    function choose(){const K=S.F[0],T=shTamm(),R=shRec();if(!T)return'wait';
      if(K.downed)return valid('guard')?'guard':'wait';
      if(K.clinch){const c=['shove','overhead','thrust','slash'].find(valid);return c||'wait';}
      if(POL==='passive')return'wait';
      if(POL==='naive')return pick(['slash','overhead','thrust','sweep','shove','advance','wait']);
      if(POL==='random'){const all=['slash','overhead','thrust','sweep','shove','feint','advance','sidestep','withdraw','wait','guard'].filter(valid);return all[Math.floor(rnd()*all.length)]||'wait';}
      const d=R.phase==='drill'?L.drill:'bout';
      if(d==='shove'||d==='swing'||d==='reach')return'wait';
      if(d==='ladder'){if(shortInside(K,T))return pick(['thrust']);return'wait';}
      if(d==='checkhook'){
        if(POL==='literal')return pick([!R.got.check?'shove':'sweep','advance']);
        if(!R.got.check){if(moveName(K,T,'shove')==='Blind-side check')return pick(['shove']);return'wait';}
        return pick(['sweep','advance']);}
      // the bout: thrust from inside, else slash; now and then a sweep
      if(shortInside(K,T))return pick(['thrust','slash']);return pick(rnd()<.2?['sweep','slash']:['slash','thrust','advance']);}
    function answer(o){const K=S.F[0],ch=openingChoices(o).filter(k=>openValid(o,k));if(!ch.length)return null;
      if(POL==='passive')return null;
      if(o.source==='toll')return POL==='random'?(rnd()<.5?'toll':'let'):'toll';
      if(o.source==='react'){if(POL==='naive')return ch[0];if(POL==='random')return ch[Math.floor(rnd()*ch.length)];
        const kind=o.attack;if((kind==='slash'||kind==='overhead')&&ch.includes('hinge'))return'hinge';if(kind==='thrust'&&ch.includes('toll'))return'toll';
        const good={slash:'parry',thrust:'slip',overhead:'counter',sweep:'back'}[kind];return ch.includes(good)?good:ch[0];}
      // a follow-up of his own
      if(POL==='naive')return ch[0];if(POL==='random')return ch[Math.floor(rnd()*ch.length)];
      return ch.find(k=>k==='thrust')||ch.find(k=>ATTACKS.includes(k))||ch[0];}
    const t0=S.t;let n=0,lastPh=null,turnSeen=-1,heroTurns=0;
    while(S.t-t0<MAX&&n<MAX*70){step(1);n++;
      const s=S.say;if(s&&s!==lastSay){lastSay=s;out.says.push(s.who+': '+s.text);}
      if(S.story.key!==KEY||S.story.step==='done'||S.story.ended)break;
      const R=shRec();if(R&&R.phase==='bout'&&S.story.key===KEY)out.bout={his:R.his,hers:R.hers};if(R&&R.phase!==lastPh){lastPh=R.phase;out.trace.push({t:+(S.t-t0).toFixed(1),phase:R.phase,turns:R.turns,n:R.n});}
      {const K0=S.F[0],wk=K0.weaponKey+(shortOn(K0)?'+SH':'');if(wk!==out._wk){out._wk=wk;out.trace.push({t:+(S.t-t0).toFixed(1),weapon:wk,style:K0.style,down:!!K0.downed});}}
      const o=S.opening,g=S.game,K=S.F[0];
      if(o&&o.f===K&&!o._asked){o._asked=true;const k=answer(o);out.answers[(o.source||'?')+':'+(k||'timeout')]=(out.answers[(o.source||'?')+':'+(k||'timeout')]||0)+1;if(k!=null)humanOpening(k);continue;}
      if(!o&&g.phase==='input'&&g.active===0&&!S.cut&&!isAI(0)&&S.story.step==='fight'){if(turnSeen===g.turnId)continue;const k=choose();const before=g.phase;humanCommand(k);
        if(g.phase===before&&S.game.phase==='input'&&!S.opening){humanCommand('wait');}
        const act=slotAction(K,shTamm(),k)||k;out.cmds[act]=(out.cmds[act]||0)+1;heroTurns++;}}
    const R=shRec();out.secs=+(S.t-t0).toFixed(1);out.heroTurns=heroTurns;out.end={key:S.story.key,step:S.story.step,ended:S.story.ended||null,phase:R&&R.phase,n:R&&R.n,need:R&&R.need,turns:R&&R.turns,his:R&&R.his,hers:R&&R.hers,got:R&&JSON.stringify(R.got)};
    return out;},[KEY,POL,MAX,SEED]);
  console.log(JSON.stringify(r.end),'secs',r.secs,'heroTurns',r.heroTurns,'bout',JSON.stringify(r.bout||null));console.log('cmds',JSON.stringify(r.cmds),'answers',JSON.stringify(r.answers),'events',JSON.stringify(r.events));
  console.log('trace',JSON.stringify(r.trace));console.log('says',r.says.join(' / '));console.log('errors',errs.length,errs.slice(0,3));await b.close();})();
