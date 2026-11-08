// The saves (sk_save.js, sk_saveui.js; since V92), on the title: a fresh page keeps nothing and Begin starts
// at once; a night begun is kept from its first stage; what a stage begins with (the flags, his health as he came to it, the tears in
// his suit, the Act I record) comes back the same through a reload and Continue as in the night that kept it; a chapter picked while
// a night is kept leaves it as it was; Begin asks first, and Begin anew takes its place; a night kept at the end of what is built says
// so and goes on once a later build goes on; a broken or unknown record, or storage refused, leaves the title as it always was; the
// settings picked (gore, sound) come back; and the record throws none of the game's dice.
// usage: node sk_save_page.js   (needs test_page.html from build.py: the copy with the charset a file:// page needs; it opens on the
// lab, so the title is put up as the menu's Title screen puts it up)
const SK_T0=Date.now();
const {chromium}=require('playwright');const fs=require('fs');
const rep=[],errs=[];
function expect(label,cond,info){rep.push((cond?'ok   ':'FAIL ')+label+(process.env.SK_TIMING?' ['+((Date.now()-SK_T0)/1000).toFixed(1)+'s]':'')+(info!==undefined&&info!==''?'  '+info:''));if(!cond)errs.push(label+(info!==undefined?' ('+info+')':''));}
const PAGE='file://'+process.cwd()+'/'+(process.env.PAGE||'test_page.html');
(async()=>{
  const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),pageErrs=[];
  // the page on the fake clock with the dice seeded, after every load (a reload is a visit later on)
  const setup=async p=>{await p.waitForTimeout(250);await p.evaluate(()=>{if(!S.story)storyMenu(true);S.soundOn=false;let a=41;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
    window.__now=performance.now()+1000;window.step=k=>{const R=window.render;window.render=()=>{};try{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}}finally{window.render=R;}};
    window.vis=id=>{const e=document.getElementById(id);return!!e&&!e.hidden&&getComputedStyle(e).display!=='none'&&e.offsetParent!==null;};
    window.kept=()=>{try{return JSON.parse(localStorage.getItem('ilyas.night')||'null');}catch(e){return'broken';}};
    // the level of the night kept (since V93: the title says it after where the night stands)
    window.lvKept=()=>{const k=kept(),g=k&&k.cp&&k.cp.parts&&k.cp.parts.growth;return g?levelOf(g.xp):null;};
    // what a stage begins with, as the game holds it (the record's own copy of the Act I part, so a live thing left out on both sides)
    window.state=()=>{const K=hero(),SV=S.story;return{key:SV&&SV.key,flags:SV&&JSON.stringify(SV.flags),hp:K.hp,rips:JSON.stringify(K.rips||[]),hem:JSON.stringify(K.hemTears||[]),
      act1:S.act1?JSON.stringify(saveData(S.act1)):null,t:S.t};};});};
  const open=async(o={})=>{const ctx=o.ctx||await b.newContext({viewport:{width:1280,height:800},deviceScaleFactor:1});const p=await ctx.newPage();
    p.on('pageerror',e=>pageErrs.push(e.message));
    await p.addInitScript(blocked=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};
      if(blocked)Object.defineProperty(window,'localStorage',{configurable:true,get(){throw new Error('storage refused');}});},!!o.blocked);
    await p.goto(PAGE);await setup(p);return p;};
  const reload=async p=>{await p.reload();await setup(p);};
  const ev=(p,fn,arg)=>p.evaluate(fn,arg);

  // ---- a fresh page, Begin, and the title after it ----
  {const p=await open();
    let m=await ev(p,()=>({menu:vis('stMenu'),cont:vis('stContinue'),saved:vis('stSaved'),kept:kept(),beginGo:document.getElementById('stBegin').classList.contains('st-go')}));
    expect('a fresh page: the title, nothing kept, no Continue, Begin the first button',m.menu&&!m.cont&&!m.saved&&m.kept===null&&m.beginGo,JSON.stringify(m));
    await p.click('#stBegin');
    m=await ev(p,()=>{step(2);const k=kept();return{story:S.story&&S.story.key,ask:vis('stAsk'),k:k&&k.cp&&k.cp.key,label:k&&k.label,v:k&&k.cp&&k.cp.v};});
    expect('Begin with nothing kept starts the prologue at once, and the night is kept from its first stage',m.story==='sundown'&&!m.ask&&m.k==='sundown'&&m.v===1&&m.label==='Prologue · The opening',JSON.stringify(m));
    await ev(p,()=>{storyQuit();restart();storyMenu(true);step(2);});
    m=await ev(p,()=>({cont:vis('stContinue'),contGo:document.getElementById('stContinue').classList.contains('st-go'),beginGo:document.getElementById('stBegin').classList.contains('st-go'),
      saved:document.getElementById('stSaved').textContent,lv:lvKept()}));
    expect('back on the title: Continue first, and where the night stands, at its level',m.cont&&m.contGo&&!m.beginGo&&m.lv===1&&m.saved==='Where you left off: Prologue · The opening · Level 1',JSON.stringify(m));
    const before=await ev(p,()=>localStorage.getItem('ilyas.night'));
    await p.click('#stBegin');
    m=await ev(p,()=>({ask:vis('stAsk'),t:document.getElementById('stAskT').textContent,btns:vis('stBegin'),story:!!S.story}));
    expect('Begin with a night kept asks first, naming it',m.ask&&!m.btns&&!m.story&&m.t==='A new night takes the place of the one kept at Prologue · The opening.',JSON.stringify(m));
    await p.click('#stAskBack');
    m=await ev(p,()=>({ask:vis('stAsk'),cont:vis('stContinue'),story:!!S.story,same:localStorage.getItem('ilyas.night')}));
    expect('Back leaves the night as it was',!m.ask&&m.cont&&!m.story&&m.same===before);
    await p.context().close();}

  // ---- the prologue: a night carried into the next stage, then a reload and Continue ----
  {const p=await open();
    const a=await ev(p,()=>{storyGo('vargo');step(30);const K=hero(),V=S.F[1];
      // a night's worth of it: hurt, the suit cut, then the stage handed on as its end does (his health as he left it, the next stage)
      for(let i=0;i<6;i++)S.hooks.rip(V,K,{kind:i%2?'slash':'thrust',tech:{key:'std',name:'Cut'},out:'crit',dmg:14},{x:K.p[CHE].x,y:K.p[CHE].y},['body','arm','leg'][i%3],true,null);
      K.hp=Math.round(K.maxHp*.45);S.story.hp=K.hp;S.story.flags.grenade=false;S.story.flags.blown=true;storyStage('dining');step(2);
      const k=kept();return{st:state(),k:k&&k.cp&&k.cp.key,label:k&&k.label,parts:k&&Object.keys(k.cp.parts||{}),rips:hero().rips.length};});
    expect('a chapter picked with nothing kept is kept, and each stage as it begins: the next one, its tears with it',a.k==='dining'&&a.label==='Prologue · V · The Dining Room'&&a.parts.includes('suit')&&a.rips>=4,JSON.stringify(a).slice(0,300));
    await reload(p);
    let m=await ev(p,()=>({cont:vis('stContinue'),saved:document.getElementById('stSaved').textContent,lv:lvKept()}));
    expect('a visit later: Continue, at the stage the night reached',m.cont&&m.lv>1&&m.saved==='Where you left off: Prologue · V · The Dining Room · Level '+m.lv,JSON.stringify(m));
    await p.click('#stContinue');
    const c=await ev(p,()=>{step(2);return{st:state()};});
    const same=['key','flags','hp','rips','hem'].filter(k=>a.st[k]!==c.st[k]);
    expect('Continue begins it as the night that kept it began it: the stage, the flags, his health, the tears in his suit',!same.length,same.map(k=>k+': '+String(a.st[k]).slice(0,80)+' / '+String(c.st[k]).slice(0,80)).join('; '));
    await p.context().close();}

  // ---- Act I: the record of what he did, a chapter while a night is kept, Begin anew ----
  {const p=await open();
    const a=await ev(p,()=>{storyGo('list');step(30);const A=act1State(),E=errand();
      // what scene 5 leaves him with: the purse spent down, a salve and the whetstone in the satchel, the map got
      E.coin=Math.max(0,(E.coin||0)-3);E.bag=(E.bag||[]).concat(['salve']);E.salve=1;E.sharp=true;A.satchel=true;A.map=A.map||{got:true};S.story.flags.kit=S.story.flags.kit||'canvas';
      S.story.hp=hero().hp;storyStage('stairsup');step(2);const k=kept();return{st:state(),k:k&&k.cp&&k.cp.key,label:k&&k.label,size:JSON.stringify(k).length};});
    expect('in the Pit: the night kept at the next stage, named by its scene',a.k==='stairsup'&&a.label==='Act I · Scene 5 · Tamm’s List',JSON.stringify({k:a.k,label:a.label}));
    expect('what is kept is small (under 24 KB)',a.size<24000,a.size+' bytes');
    await reload(p);await p.click('#stContinue');
    const c=await ev(p,()=>{step(2);return{st:state(),E:JSON.stringify(S.act1&&S.act1.errand)};});
    const same=['key','flags','hp','act1'].filter(k=>a.st[k]!==c.st[k]);
    expect('Continue in the Pit: the Act I record as the night had it (the purse, the satchel, the map, the crate\'s choice)',!same.length&&/salve/.test(c.E),
      same.map(k=>k+': '+String(a.st[k]).slice(0,120)+' / '+String(c.st[k]).slice(0,120)).join('; '));
    const k0=await ev(p,()=>{storyQuit();restart();storyMenu(true);step(2);return localStorage.getItem('ilyas.night');});
    await p.click('#stChapters');await p.click('#stChapList .st-chapbtn');
    let m=await ev(p,()=>{step(40);const st=S.story&&S.story.key;storyQuit();restart();storyMenu(true);step(2);return{st,same:localStorage.getItem('ilyas.night'),saved:document.getElementById('stSaved').textContent,lv:lvKept()};});
    expect('a chapter picked while a night is kept is a replay: the night stays as it was',m.st==='field'&&m.same===k0&&m.saved==='Where you left off: Act I · Scene 5 · Tamm’s List · Level '+m.lv,JSON.stringify({st:m.st,saved:m.saved}));
    await p.click('#stBegin');await p.click('#stAskNew');
    m=await ev(p,()=>{step(2);const k=kept();return{st:S.story&&S.story.key,k:k&&k.cp&&k.cp.key,act1:k&&k.cp.parts&&k.cp.parts.act1};});
    expect('Begin anew: the prologue from its start, kept in the old night\'s place',m.st==='sundown'&&m.k==='sundown'&&!m.act1,JSON.stringify(m));
    await p.context().close();}

  // ---- the end of what is built, and a build that goes on from there ----
  {const p=await open();
    let m=await ev(p,()=>{storyGo('sh6');step(20);S.story.hp=hero().hp;S.story.ended='act1';storyStage(STAGES[stageIx('sh6')].next);step(2);const k=kept();return{k:k&&k.cp,end:S.story&&S.story.step};});
    expect('the night that reaches the end of what is built is kept as the stage it came after',m.k&&m.k.key===null&&m.k.after==='sh6'&&m.end==='done',JSON.stringify(m.k&&{key:m.k.key,after:m.k.after}));
    await reload(p);
    m=await ev(p,()=>({cont:vis('stContinue'),saved:vis('stSaved'),t:document.getElementById('stSaved').textContent,beginGo:document.getElementById('stBegin').classList.contains('st-go'),lv:lvKept()}));
    expect('on the title: no Continue, and the line says the night has reached the end of what is built',!m.cont&&m.saved&&m.beginGo&&m.lv>=7&&m.t==='Your night has reached the end of what is built: Act I · Scene 9 · Three Touches · Level '+m.lv+'.',JSON.stringify(m));
    m=await ev(p,()=>{STAGES[stageIx('sh6')].next='sh5';saveMenuSync();return{cont:vis('stContinue'),t:document.getElementById('stSaved').textContent,lv:lvKept()};});
    expect('a build that goes on from there continues it (a stage after it stood in for one)',m.cont&&m.t==='Where you left off: Act I · Scene 9 · Check and Hook · Level '+m.lv,JSON.stringify(m));
    await p.click('#stContinue');
    m=await ev(p,()=>{step(2);return{st:S.story&&S.story.key,short:JSON.stringify(S.story&&S.story.flags.short)};});
    expect('and starts the new stage with the night\'s own record',m.st==='sh5'&&/"hook":true/.test(m.short),JSON.stringify(m));
    await p.context().close();}

  // ---- a whole night on auto (the prologue on into Act I), its record taken at every stage: each begins again from its record as
  // the night began it, and plays on without an error ----
  {const p=await open();
    const r=await ev(p,()=>{const recs=[],sh=S.hooks.story;S.hooks.story=(k,a)=>{sh(k,a);if(k==='stage'&&S.story&&S.story.at)recs.push({cp:JSON.parse(JSON.stringify(S.story.at)),st:state()});};
      const runUntil=(pred,max)=>{let n=0;while(!pred()&&n<max){step(1);n++;}return n;};
      S.storyAuto=true;S.auto=true;S.allyAuto=true;storyBegin(null,{auto:true});step(2);
      for(let guard=0;guard<60;guard++){const SV=S.story;if(!SV||SV.step==='done')break;const key=SV.key;
        runUntil(()=>S.story.step==='fight'||S.story.step==='explore'||S.story.step==='done'||S.story.key!==key,6000);if(S.story.key!==key)continue;
        const st=STAGES[S.story.i];
        if(S.story.step==='explore')runUntil(()=>S.story.step!=='explore',9000);
        else if(!st.noFight&&S.story.step!=='done'){runUntil(()=>S.story.key!==key||S.story.step!=='fight'||S.game.phase==='over',900);
          if(S.story.key===key&&S.story.step==='fight'&&S.game.phase!=='over'){if(S.crew)S.crew.queue.length=0;S.opening=null;S.game.ex=null;
            for(const f of S.F)if(f.team===1&&!f.dead&&!f.npc&&!f.inHeli){f.hp=0;kill(f,1);f.walkIn=false;}
            if(key==='office'){S.game.phase='exchange';finishExchange();}else{step(30);storyCleared();}}}
        if(runUntil(()=>!S.story||S.story.key!==key||S.story.step==='done',9000)>=9000)break;}
      S.hooks.story=sh;const keys=recs.map(x=>x.cp.key),bad=[];let big=0;
      for(const R of recs){big=Math.max(big,JSON.stringify(R.cp).length);
        // (as on a visit later: the clock starts from nothing, and Continue puts it on to the night's own)
        try{storyQuit();S.F=[];S.t=0;storyBegin(R.cp.key,{resume:R.cp,auto:true});const c=state();const d=['key','flags','hp','rips','hem','act1','t'].find(k=>c[k]!==R.st[k]);
          if(d)bad.push(R.cp.key+': '+d+' '+String(R.st[d]).slice(0,90)+' / '+String(c[d]).slice(0,90));else step(240);}
        catch(e){bad.push(R.cp.key+': '+e.message);}}
      return{n:recs.length,keys,bad,big};});
    expect('a whole night, the prologue on into Act I, kept at each of its stages',r.n>=30&&r.keys[0]==='sundown'&&r.keys.includes('sh6'),r.n+' records: '+r.keys.join(' '));
    expect('every stage begins again from its record as the night began it, and plays on',!r.bad.length,r.bad.slice(0,4).join(' | '));
    expect('the biggest record is small (under 24 KB)',r.big<24000,r.big+' bytes');
    await p.context().close();}

  // ---- what is broken, unknown or refused ----
  {const p=await open();
    for(const [what,val] of [['a record that does not parse','{oops'],['a stage this build does not know',JSON.stringify({t:1,label:'x',cp:{v:1,key:'nowhere',flags:{},parts:{}}})],
      ['a record of another kind',JSON.stringify({t:1,label:'x',cp:{v:99,key:'field',flags:{},parts:{}}})]]){
      await ev(p,v=>localStorage.setItem('ilyas.night',v),val);await reload(p);
      const m=await ev(p,()=>({menu:vis('stMenu'),cont:vis('stContinue'),saved:vis('stSaved')}));
      expect(`${what}: the title as it always was, no Continue`,m.menu&&!m.cont&&!m.saved,JSON.stringify(m));}
    await p.click('#stBegin');
    const m=await ev(p,()=>{step(2);return{st:S.story&&S.story.key,ask:vis('stAsk')};});
    expect('and Begin starts at once',m.st==='sundown'&&!m.ask,JSON.stringify(m));
    await p.context().close();}
  {const p=await open({blocked:true});
    await p.click('#stBegin');
    const m=await ev(p,()=>{step(30);const st=S.story&&S.story.key;storyStage('field');step(2);const st2=S.story.key;storyQuit();restart();storyMenu(true);step(2);return{st,st2,cont:vis('stContinue'),menu:vis('stMenu')};});
    expect('storage refused (a private window): the night plays and nothing is kept',m.st==='sundown'&&m.st2==='field'&&!m.cont&&m.menu,JSON.stringify(m));
    await p.context().close();}

  // ---- the settings ----
  {const p=await open();
    await ev(p,()=>{document.querySelector('#goreSeg [data-g="off"]').click();const t=document.getElementById('tSound');if(t.checked)t.click();});
    await reload(p);
    const m=await ev(p,()=>({gore:S.gore,sound:S.soundOn,box:document.getElementById('tSound').checked,pressed:document.querySelector('#goreSeg [data-g="off"]').getAttribute('aria-pressed')}));
    expect('the settings picked come back on the next visit: no gore, the sound off',m.gore==='off'&&m.sound===false&&m.box===false&&m.pressed==='true',JSON.stringify(m));
    // (the record throws none of the game's dice)
    const d=await ev(p,()=>{storyGo('field');step(5);let n=0;const r=S.rng,mr=Math.random;S.rng=()=>{n++;return r();};Math.random=()=>{n++;return mr();};
      try{saveTake('chase');saveData(S.act1);return n;}finally{S.rng=r;Math.random=mr;}});
    expect('making the record throws none of the game\'s dice',d===0,String(d));
    await p.context().close();}

  expect('no page errors',pageErrs.length===0,pageErrs.slice(0,3).join(' | '));
  console.log(rep.join('\n'));console.log(errs.length?`\n${errs.length} FAILED`:`\nall ${rep.length} checks passed`);
  console.log('errors '+errs.length+' '+JSON.stringify(errs));
  await b.close();process.exit(errs.length?1:0);
})();
