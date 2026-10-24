// The stance and rise test page in a browser, at a phone held upright (or SIZE=land, desk). It opens on a fight with the stance bar;
// each stance changes the dock's moves, his guard and (Unbound) the blade; an Unbound lash goes from where he stands and a Close blow
// leaves him in the man's chest, where an axe comes on its haft; a man knocked down rises free at his turn, off balance; struck on the
// floor, a named man must get up and a crew man is finished; the setup turns each rule off. Stills of each go to the out folder.
// usage (from the repo, after build_stances.py): node proto/stances/stances_page.js [outdir]
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const OUT=process.argv[2]||path.join(__dirname,'out'),SZ=process.env.SIZE||'port';fs.mkdirSync(OUT,{recursive:true});
const SIZES={port:{w:390,h:844,dpr:2,mob:true},land:{w:844,h:390,dpr:2,mob:true},desk:{w:1440,h:900,dpr:1,mob:false}};
(async()=>{const Z=SIZES[SZ],b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[],rep=[];
  const expect=(label,cond,info)=>{rep.push((cond?'ok   ':'FAIL ')+label+(info?'  '+info:''));if(!cond)errs.push(label+(info?' ('+info+')':''));};
  const p=await (await b.newContext({viewport:{width:Z.w,height:Z.h},deviceScaleFactor:Z.dpr,isMobile:Z.mob,hasTouch:Z.mob})).newPage();
  p.on('pageerror',e=>errs.push('page: '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts|ERR_|net::/.test(m.text()))errs.push('console: '+m.text());});
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+path.join(__dirname,'stances_test_page.html'));await p.waitForTimeout(400);
  await p.evaluate(()=>{S.soundOn=false;let a=13;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
    window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    window.fast=k=>{const R=window.render;window.render=()=>{};try{step(k);}finally{window.render=R;}};
    // his turn, the windows on him answered by his own read on the way
    window.mine=()=>{const g=S.game;return g.phase==='input'&&g.active===0&&!S.opening&&!isAI(0);};
    window.untilMine=max=>{let n=0;while(n<max&&!mine()){if(S.opening&&!isAI(S.opening.f.idx))resolveOpening(aiOpening(S.opening));fast(1);n++;if(S.game.phase==='over')break;}return n;};
    // his turn on his feet and free (a turn on the floor goes on getting up, a hold is broken), and the fight kept going
    window.untilFree=max=>{let n=0;const K=hero();K.hp=Math.max(K.hp,K.maxHp*.8);
      while(n<max){if(S.game.phase==='over')break;if(mine()&&!K.downed&&!K.clinch)break;if(S.opening&&!isAI(S.opening.f.idx))resolveOpening(aiOpening(S.opening));
        if(mine()&&K.downed)humanCommand('guard');else if(mine()&&K.clinch)humanCommand(K.clinch.a===K?'shove':'shove');fast(1);n++;}return n;};
    window.cmd=k=>document.getElementById('cmd-'+k);window.tq=k=>(document.getElementById('t-'+k)||{}).textContent||'';
    window.stb=s=>document.querySelector(`#stnBar .stn-b[data-s="${s}"]`);
    window.gapX=(A,D)=>Math.abs(A.station-D.station)-engageGap(A,D);
    S.F=[];restart();});
  const shot=async name=>{await p.evaluate(()=>step(3));await p.waitForTimeout(150);await p.screenshot({path:`${OUT}/${SZ}_${name}.png`});};
  // 1. his first turn: the stance bar, Bound held, the stance that answers his target marked
  let r=await p.evaluate(()=>{const n=untilMine(6000);fast(30);const bar=document.getElementById('stnBar'),K=hero(),D=targetOf(K);
    return{n,mine:mine(),bar:!!bar&&!bar.hidden&&bar.getBoundingClientRect().height,btns:bar?bar.querySelectorAll('.stn-b').length:0,on:(bar.querySelector('.stn-b.on')||{}).dataset.s,
      fit:(bar.querySelector('.stn-b.fit')||{}).dataset||null,match:stanceMatch(K,D),tgt:D&&D.name,wp:D&&D.weaponKey,menu:typeof ST_UI!=='undefined'&&ST_UI.menu?!ST_UI.menu.hidden:null,
      slash:tq('slash'),meta:document.getElementById('meta0').textContent};});
  expect('the page opens on a fight with the stance bar on his turn, Bound held, the story menu put away',r.mine&&r.bar>30&&r.btns===3&&r.on==='bound'&&r.menu===false,JSON.stringify({n:r.n,bar:r.bar,on:r.on}));
  expect('the stance that answers his target is marked',!!r.fit&&r.fit.s===r.match,JSON.stringify({fit:r.fit&&r.fit.s,match:r.match,tgt:r.tgt,wp:r.wp}));
  expect('his plate names the stance',/^Bound/.test(r.meta),r.meta);
  await shot('1_bound');
  // 2. Close: the four strikes become the hilt, the spine and the hook, and the guard comes in
  r=await p.evaluate(()=>{const K=hero(),g0=K.guardArm(),h0=g0.hand.sh.slice();stb('close').click();fast(30);const g1=K.guardArm();
    return{st:K.stance,slash:tq('slash'),over:tq('overhead'),thrust:tq('thrust'),sweep:tq('sweep'),h0,h1:g1.hand.sh,on:(document.querySelector('#stnBar .stn-b.on')||{}).dataset.s,meta:document.getElementById('meta0').textContent};});
  expect('Close turns the strikes into the hilt-ring, the spine and the inside hook',r.st==='close'&&/Hilt-ring|Haft cut/.test(r.slash)&&/Hilt-ring/.test(r.over)&&/Spine/.test(r.thrust)&&/Inside hook/.test(r.sweep),JSON.stringify(r));
  expect('his guard comes in close',Math.abs(r.h1[0]-r.h0[0])>3,JSON.stringify({h0:r.h0,h1:r.h1}));
  await shot('2_close');
  // 3. Unbound: the blade drawn loose, and the strikes are lashes or relocked blows
  r=await p.evaluate(()=>{const K=hero(),D=targetOf(K);stb('unbound').click();fast(30);
    return{st:K.stance,mode:(arcState(K)||{}).mode,ready:lashReady(K,D),gap:Math.round(gapX(K,D)),slash:tq('slash'),over:tq('overhead'),thrust:tq('thrust'),sweep:tq('sweep')};});
  expect('Unbound draws the blade loose on its thread',r.st==='unbound'&&r.mode==='lash',JSON.stringify(r));
  expect('Unbound\'s strikes are lashes at range, or relocked blows inside it',r.ready?/Unbound lash/.test(r.slash)&&/Falling lash/.test(r.over)&&/Lash/.test(r.thrust)&&/snare/i.test(r.sweep):/Relocked/.test(r.slash),JSON.stringify(r));
  await shot('3_unbound');
  // 4. a lash from range: he stays where he is, the chain goes out, and nothing runs in
  r=await p.evaluate(()=>{const K=hero(),D=targetOf(K),fa=Math.sign(D.station-K.station)||1;
    // (put him at lash range)
    K.station=clampSt(K,D.station-fa*(engageGap(K,D)+90));K.build();fast(20);const x0=K.station,ready=lashReady(K,D),slash=tq('slash');
    cmd('slash').click();let lash=false,n=0,mid=null;while(n<600&&S.game.ex){fast(1);n++;if(K.lash&&K.lashLen>K.wp.len+20){lash=true;if(!mid)mid=n;}if(mid&&n===mid+3)break;}
    return{ready,slash,x0,x1:K.station,lash,n};});
  expect('an Unbound lash goes from where he stands: the chain runs out and he does not run in',r.ready&&/Unbound lash/.test(r.slash)&&r.lash&&Math.abs(r.x1-r.x0)<12,JSON.stringify(r));
  await shot('4_lash');
  // 5. a Close blow: he strikes from inside the man's reach and stays there, and the axe that answers comes on its haft
  r=await p.evaluate(()=>{let n=untilFree(9000);const K=hero();if(!mine())return{none:true,n};
    const A0=foes().find(f=>f.weaponKey==='axe'&&!f.dead&&!f.downed);if(A0)setTgt(K,A0.idx);const D=targetOf(K);
    stb('close').click();fast(4);const tech=tq('slash');cmd('slash').click();let gi=null,end=null,res=null,mine0=null;n=0;
    // (a stop-hit can come first: the blow itself is the exchange of his that has dice)
    while(n<1500){if(S.opening&&!isAI(S.opening.f.idx))resolveOpening(aiOpening(S.opening));const ex=S.game.ex;
      if(ex&&ex.A===K&&ex.res&&ex.res.kind==='slash'){mine0=ex;if(ex.impactDone&&gi==null){gi=Math.abs(K.curBody.px-D.curBody.px);res=ex.res.out;}}
      else if(mine0&&S.game.ex!==mine0&&end==null){end=Math.abs(K.station-D.station);break;}
      fast(1);n++;}
    const ax=foes().find(f=>f.weaponKey==='axe'&&!f.dead);
    return{tgt:D.name,tech,atImpact:Math.round(gi),end:Math.round(end),close:Math.round(clinchGap(K,D)+STN.closeGap),eng:Math.round(engageGap(K,D)),out:res,st:K.stance,
      axe:ax?pickTechnique(ax,K,'overhead').key+'/'+pickTechnique(ax,K,'slash').key:null,jam:ax?jammedTech(ax,pickTechnique(ax,K,'overhead')):null};});
  expect('a Close blow lands from inside the man\'s reach, and he settles there',!r.none&&r.atImpact<=r.close+24&&r.end<r.eng+30,JSON.stringify(r));
  expect('an axe striking him in Close comes on the haft, jammed',r.axe===null||(/choked|haft/.test(r.axe)&&r.jam),JSON.stringify(r));
  await shot('5_close');
  // 6. a fall: he rises free at his turn, off balance, and the turn is his own
  r=await p.evaluate(()=>{let n=untilFree(9000);const E=foes().find(f=>!f.dead&&!f.downed&&!f.hench);if(!E)return{none:true};
    knockDown(E);const lbl=intentLabel(E);let rose=false;const fr=S.hooks.freeRise;S.hooks.freeRise=f=>{if(f===E)rose=true;fr&&fr(f);};
    const getups=[];const c0=command;window.command=command=function(i,c){if(S.F[i]===E&&(c==='getup'||c==='roll'))getups.push(c);return c0.apply(this,arguments);};
    // (Ilyas holds, so nobody strikes him on the floor)
    stb('bound').click();cmd('wait').click();n=0;let foot=null,acted=null;
    while(n<9000){if(S.opening&&!isAI(S.opening.f.idx))resolveOpening(aiOpening(S.opening));if(mine())cmd('wait').click();fast(1);n++;if(rose&&foot==null&&S.game.phase==='input'&&S.game.active===E.idx){foot=E.foot;}
      if(foot!=null&&S.game.ex&&S.game.ex.A===E&&!S.game.ex.rise){acted=S.game.ex.cmd;break;}if(S.game.phase==='over')break;}
    window.command=command=c0;S.hooks.freeRise=fr;return{lbl,rose,foot,acted,getups,name:E.name};});
  expect('a man knocked down is labelled to rise free',r.lbl==='Rises free',r.lbl);
  expect('he rises free at his turn, off balance, and acts in the same turn',r.rose&&r.foot<=1&&r.acted&&r.getups.length===0,JSON.stringify(r));
  // 7. struck on the floor: a named man loses the free rise and must get up
  r=await p.evaluate(()=>{let n=untilFree(9000);const K=hero();const E=foes().find(f=>!f.dead&&!f.downed&&!f.hench);if(!E||!mine())return{none:true};
    knockDown(E);setTgt(K,E.idx);fast(2);const lbl0=intentLabel(E);let got=null;const getups=[];const c0=command;
    window.command=command=function(i,c){if(S.F[i]===E&&(c==='getup'||c==='roll'))getups.push(c);return c0.apply(this,arguments);};
    cmd('thrust').click();n=0;while(n<900&&S.game.ex&&S.game.ex.A===K){fast(1);n++;}const struck=E.noRise,dead=E.dead,lbl=intentLabel(E);
    n=0;while(n<9000&&!E.dead&&E.downed){if(S.opening&&!isAI(S.opening.f.idx))resolveOpening(aiOpening(S.opening));if(mine()){setTgt(K,foes().find(f=>f!==E&&!f.dead)?.idx??E.idx);cmd('wait').click();}fast(1);n++;if(S.game.phase==='over')break;}
    window.command=command=c0;return{lbl0,struck,dead,lbl,getups,up:!E.downed};});
  await shot('7_after');
  expect('struck on the floor, a named man loses the free rise and his turn goes on getting up',r.none||(r.dead||(r.struck&&r.lbl==='Must get up'&&r.getups.length>=1)),JSON.stringify(r));
  // 8. a crew: a crew man struck on the floor is finished
  r=await p.evaluate(()=>{S.cfg.n=1;S.cfg.crew=true;stnApplyMix();S.F=[];restart();let n=untilMine(9000);const K=hero();
    const E=foes().find(f=>f.hench&&!f.dead&&!f.walkIn);if(!E||!mine())return{none:true,n};E.hp=40;E.maxHp=40;knockDown(E);setTgt(K,E.idx);fast(2);
    cmd('thrust').click();n=0;while(n<900&&S.game.ex&&S.game.ex.A===K){fast(1);n++;}return{dead:E.dead,hp:E.hp,fin:E.finName||null};});
  expect('a crew man struck on the floor is finished',r.dead,JSON.stringify(r));
  await shot('8_crew');
  // 9. a downed man, drawn, with his label
  r=await p.evaluate(()=>{S.cfg.n=2;S.cfg.crew=false;stnApplyMix();S.F=[];restart();untilMine(9000);const E=foes()[0];knockDown(E);ensureIntents();updateStatus();fast(60);return{lbl:intentLabel(E),when:E._when,it:E.intent&&E.intent.cmd};});
  expect('a downed man is labelled over his head for what comes next',r.lbl==='Rises free'&&!!r.it&&/at his turn/.test(r.when||''),JSON.stringify(r));
  await shot('9_down');
  // 10. the setup: the rules off are today's
  r=await p.evaluate(()=>{document.getElementById('stnSetBtn').click();step(2);const open=!document.getElementById('stnSetup').hidden;
    const o=(g,v)=>document.querySelector(`#stnSetup .st-o[data-g="${g}"][data-v="${v}"]`);o('stance','0').click();o('down','0').click();step(2);
    const bar=document.getElementById('stnBar');const out={open,stance:STANCE.on,down:DOWNF.on};document.querySelector('#stnSetup .ss-x').click();fast(10);
    const E=foes()[0];knockDown(E);out.lbl=intentLabel(E);out.bar=!bar.hidden;out.slash=tq('slash');
    o('stance','1')&&0;STANCE.on=true;DOWNF.on=true;return out;});
  expect('the setup turns the stances and the free rise off',r.open&&!r.stance&&!r.down&&!r.bar&&r.lbl!=='Rises free',JSON.stringify(r));
  await p.evaluate(()=>{document.getElementById('stnSetBtn').click();step(2);});await shot('10_setup');
  console.log(rep.join('\n'));console.log('errors',errs.length,JSON.stringify(errs.slice(0,6)));await b.close();process.exit(errs.length?1:0);})();
