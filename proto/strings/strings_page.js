// The strings test page in a browser, at a phone held upright (or SIZE=land, desk): it opens on a fight with the timeline and the string
// bar; Ilyas plans a string from the dock (Thrust, then Slash) and plays it; the enemies' turns play without a window; an answer is
// picked on the timeline; the setup starts a fight against three; answers picked live open a window that shows the tell only; today's
// turn still plays. Stills of each go to the out folder.
// usage (from the repo, after build_strings.py): node proto/strings/strings_page.js [outdir]
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const OUT=process.argv[2]||path.join(__dirname,'out'),SZ=process.env.SIZE||'port';fs.mkdirSync(OUT,{recursive:true});
const SIZES={port:{w:390,h:844,dpr:2,mob:true},land:{w:844,h:390,dpr:2,mob:true},desk:{w:1440,h:900,dpr:1,mob:false}};
(async()=>{const Z=SIZES[SZ],b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[],rep=[];
  const expect=(label,cond,info)=>{rep.push((cond?'ok   ':'FAIL ')+label+(info?'  '+info:''));if(!cond)errs.push(label+(info?' ('+info+')':''));};
  const p=await (await b.newContext({viewport:{width:Z.w,height:Z.h},deviceScaleFactor:Z.dpr,isMobile:Z.mob,hasTouch:Z.mob})).newPage();
  p.on('pageerror',e=>errs.push('page: '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts|ERR_|net::/.test(m.text()))errs.push('console: '+m.text());});
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+path.join(__dirname,'strings_test_page.html'));await p.waitForTimeout(400);
  await p.evaluate(()=>{S.soundOn=false;let a=13;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
    window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    // (frames stepped undrawn, then a few drawn before each still)
    window.fast=k=>{const R=window.render;window.render=()=>{};try{step(k);}finally{window.render=R;}};
    window.untilPlan=max=>{let n=0;while(n<max&&!strPlanning()){fast(1);n++;}return n;};
    S.F=[];restart();});
  const shot=async name=>{await p.evaluate(()=>step(3));await p.waitForTimeout(150);await p.screenshot({path:`${OUT}/${SZ}_${name}.png`});};
  // 1. his first turn: the timeline, the bar, the tells over their heads
  let r=await p.evaluate(()=>{const n=untilPlan(6000);fast(40);const tl=document.getElementById('strTL'),bar=document.getElementById('strBar');
    return{n,plan:strPlanning(),tl:!!tl&&!tl.hidden&&tl.getBoundingClientRect().height,bar:!!bar&&!bar.hidden,rows:tl?tl.querySelectorAll('.tl-row').length:0,
      marks:tl?tl.querySelectorAll('.tl-mv[data-e]').length:0,tells:foes().map(f=>f.intent?intentLabel(f):'-'),held:foes().filter(f=>f.action&&f.action.tell).length,
      menu:typeof ST_UI!=='undefined'&&ST_UI.menu?!ST_UI.menu.hidden:null,btn:document.getElementById('h-thrust').textContent};});
  expect('the page opens on a fight and Ilyas plans his turn, the story menu put away',r.plan&&r.menu===false,JSON.stringify({n:r.n,menu:r.menu}));
  expect('the timeline shows a row for him and each enemy, with their next moves as marks',r.tl>40&&r.rows===3&&r.marks>=1,JSON.stringify(r));
  expect('the enemies hold their tells while he plans, and the labels over their heads name them',r.held>=1&&r.tells.every(t=>t==='-'||/High|Point|Low|Step|Close|Waits/.test(t)),JSON.stringify(r.tells));
  expect('the dock\'s moves show their cost in beats',/beat/.test(r.btn),r.btn);
  await shot('1_plan');
  // 2. a string of two: Thrust, then Slash; one beat kept
  r=await p.evaluate(()=>{document.getElementById('cmd-thrust').click();document.getElementById('cmd-slash').click();fast(8);
    const bar=document.getElementById('strBar');return{plan:strPlan().map(m=>m.cmd),left:strPlanLeft(),chips:bar.querySelectorAll('.sb-chip').length,note:bar.querySelector('.sb-note').textContent,
      keep:(document.querySelector('#strTL .tl-keep')||{}).textContent||''};});
  expect('tapping Thrust then Slash builds a string of two, with one beat kept to counter',r.plan.join()==='thrust,slash'&&r.left===1&&r.chips===2&&/kept/.test(r.note)&&r.keep.trim()==='1',JSON.stringify(r));
  await shot('2_string');
  // 3. an answer picked on the timeline for an enemy's move
  r=await p.evaluate(()=>{const m=[...document.querySelectorAll('#strTL .tl-mv[data-e]')].find(x=>x.getAttribute('tabindex')!=='-1');if(!m)return{none:true};m.click();fast(8);
    const pk=document.getElementById('strPick'),bs=pk?[...pk.querySelectorAll('.pk-a')]:[];const pick=bs.find(x=>!x.classList.contains('on'))||bs[0];
    const out={open:!!pk&&!pk.hidden,btns:bs.length,who:pk&&pk.querySelector('.pk-who')?pk.querySelector('.pk-who').textContent:'',k:pick&&pick.dataset.k,e:+m.dataset.e,n:+m.dataset.n};
    return out;});
  await shot('3_pick');
  if(!r.none){const r2=await p.evaluate(r=>{const pk=document.getElementById('strPick');const b=pk.querySelector(`.pk-a[data-k="${r.k}"]`);if(b)b.click();fast(8);
      return{set:(strAnsSet()[r.e]||{})[r.n],shut:pk.hidden};},r);
    expect('tapping an enemy\'s mark opens the answer picker, and a pick is kept for that move',r.open&&r.btns>=4&&r2.set===r.k&&r2.shut,JSON.stringify({r,r2}));}
  else expect('an enemy\'s move to answer is on the timeline',false,'none');
  // 4. Go: the string plays as one piece, no window opens, and the turn comes back to him
  r=await p.evaluate(()=>{const K=hero(),hp=foes().map(f=>f.hp);let windows=0,cmds=[],mid=null;const c0=S.hooks.log;
    document.querySelector('#strBar .sb-go').click();
    let n=0;while(n<9000){fast(1);n++;if(S.opening&&!S.opening.auto)windows++;if(!mid&&K.str&&K.str.playing&&K.str.i===1&&S.game.ex&&S.game.ex.A===K)mid={i:K.str.i};if(strPlanning())break;}
    return{n,back:strPlanning(),windows,mid,turn:S.game.turnNo,dmg:foes().reduce((s,f,i)=>s+Math.max(0,(hp[i]||0)-f.hp),0),ends:K.str&&K.str.endWhy,kept:K.kept,over:S.game.phase};});
  expect('Go plays the string and the enemies\' turns with no window, and his next turn comes',r.back&&r.windows===0,JSON.stringify(r));
  await shot('4_next');
  // 5. mid-string, drawn: plan Thrust, Slash, Thrust and stop on the second move
  r=await p.evaluate(()=>{const K=hero();strPlanClear();for(const k of ['thrust','slash','thrust'])document.getElementById('cmd-'+k).click();const plan=strPlan().map(m=>m.cmd);
    const carry=K.str?K.str.carry||0:0;document.querySelector('#strBar .sb-go').click();const at={kept:K.kept,over:!!K.overext};
    let n=0;while(n<4000){fast(1);n++;const ex=S.game.ex;if(K.str&&K.str.playing&&K.str.i>=1&&ex&&ex.A===K&&ex.plan&&S.t-ex.t0>ex.plan.Timp*.9)break;if(strPlanning()||S.game.phase==='over')break;}
    return{n,plan,carry,at,i:K.str&&K.str.i,playing:K.str&&K.str.playing};});
  expect('a string of three spends every beat: all in (answers at -2) unless a beat was carried in, and it plays its second move',
    r.plan.length===3&&r.at.kept===r.carry&&r.at.over===(r.carry===0)&&(r.i>=1||!r.playing),JSON.stringify(r));
  await shot('5_mid');
  await p.evaluate(()=>untilPlan(9000));
  // 6. the setup: three enemies on Lamplight Street
  r=await p.evaluate(()=>{document.getElementById('strSetBtn').click();fast(2);const st=document.getElementById('strSetup');const open=!st.hidden;
    const b=st.querySelector('.st-o[data-g="n"][data-v="3"]');if(b)b.click();fast(2);const n=untilPlan(6000);fast(30);
    return{open,foes:foes().length,closed:st.hidden,n,plan:strPlanning(),rows:document.querySelectorAll('#strTL .tl-row').length};});
  expect('the setup starts a fight against three',r.open&&r.closed&&r.foes===3&&r.plan&&r.rows===4,JSON.stringify(r));
  await shot('6_three');
  // a few turns against three: Ilyas plays two moves and keeps a beat each turn
  r=await p.evaluate(()=>{let turns=0,counters=0,errs=0;const sc=S.hooks.strCounter;S.hooks.strCounter=o=>{if(o.f===hero())counters++;sc(o);};
    for(let t=0;t<6&&S.game.phase!=='over';t++){if(!strPlanning()){untilPlan(9000);if(!strPlanning())break;}const K=hero();strPlanClear();
      const ks=K.downed?['guard','thrust']:['thrust','slash'];for(const k of ks){const b=document.getElementById('cmd-'+k);if(b&&!b.disabled)b.click();}
      document.querySelector('#strBar .sb-go').click();turns++;fast(30);untilPlan(9000);}
    S.hooks.strCounter=sc;return{turns,counters,phase:S.game.phase,hp:hero().hp};});
  expect('six turns against three play through',r.turns>=3,JSON.stringify(r));
  await shot('7_crowd');
  // 7. answers picked live: the window shows the tell, not the blow, and no odds
  r=await p.evaluate(()=>{STR.answers='live';S.F=[];S.cfg.n=2;restart();let n=0,win=null;
    while(n<12000&&!win){fast(1);n++;const o=S.opening;if(o&&o.source==='react'&&o.f===hero()){win={title:document.getElementById('opTitle').textContent,sub:document.getElementById('opSub').textContent,
        small:[...document.querySelectorAll('#opBtns button small')].map(s=>s.textContent).join('|'),best:document.querySelectorAll('#opBtns button.best').length};break;}
      if(strPlanning()){strPlanClear();document.getElementById('cmd-thrust').click();document.querySelector('#strBar .sb-go').click();}}
    return{n,win};});
  expect('answers picked live open a window that names the tell, with no odds and no tick',!!r.win&&/^Incoming: (High|Point|Low)/.test(r.win.title)&&!/%/.test(r.win.small)&&r.win.best===0,JSON.stringify(r));
  await shot('8_live');
  await p.evaluate(()=>{const o=S.opening;if(o)humanOpening(openingChoices(o)[0]);fast(4);STR.answers='ahead';});
  // 8. today's turn, for comparison: the timeline goes, a command plays at once
  r=await p.evaluate(()=>{STR.on=false;S.F=[];restart();let n=0;while(n<6000&&!(S.game.phase==='input'&&S.game.active===0&&!S.opening)){fast(1);n++;}fast(10);
    const tl=document.getElementById('strTL');const t0=S.game.turnNo;document.getElementById('cmd-thrust').click();
    return{n,tl:tl.hidden,phase:S.game.phase,t0};});
  expect('today\'s turn still plays: no timeline, and a command goes at once',r.tl===true&&r.phase==='exchange',JSON.stringify(r));
  await p.evaluate(()=>{STR.on=true;});
  for(const l of rep)console.log(l);
  console.log('errors',errs.length,JSON.stringify(errs.slice(0,8)));
  await b.close();})();
