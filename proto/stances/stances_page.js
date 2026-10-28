// The stance and rise test page in a browser, at a phone held upright (or SIZE=land, desk). It opens on a fight with the stance bar;
// each stance changes the dock's moves, his guard and (Unbound) the blade; Unbound is a bladed whip that strikes from where he stands,
// its chain trailing the throw and landing its tip on the blade's tip with a crack, hardest at the tip, curling round a guard, hanging
// at rest and locking for a relocked blow; the blow a man shows and how far off he is mark the stance that answers him, and the dice
// and the tip line follow, and an answered blow that misses costs him a pip more; against a swordsman the same three decide; the new
// spells (Glare, Gilt line, Gilt edge, Overdrive, the Ward) each do what their button says; a Close blow leaves him in the man's chest, where an axe comes on its haft; a man knocked
// down rises free at his turn, off balance; struck on the floor, a named man must get up and a crew man is finished; the setup turns
// each rule off. Stills of each go to the out folder.
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
        if(mine()&&K.downed)humanCommand('guard');else if(mine()&&K.clinch)humanCommand(K.clinch.a===K?'shove':'shove');fast(1);n++;}
      // (a fight that has run out of men on their feet, or taken his blade from him, starts again: the check wants one to face, and him
      // with the arc-blade in his hand)
      if(S.game.phase==='over'||!foes().some(f=>!f.dead&&!f.downed&&!f.walkIn)||hero().weaponKey!=='elven'){S.F=[];restart();n+=untilMine(6000);}
      return n;};
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
  expect('the stance that answers his target is marked',r.match?!!r.fit&&r.fit.s===r.match:!r.fit,JSON.stringify({fit:r.fit&&r.fit.s,match:r.match,tgt:r.tgt,wp:r.wp}));
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
  expect('Unbound draws the blade as a bladed whip',r.st==='unbound'&&r.mode==='whip',JSON.stringify(r));
  expect('Unbound\'s strikes are whip blows at range, or relocked blows inside it',r.ready?/Whipcrack|Short lash/.test(r.slash)&&/High crack|Falling lash/.test(r.over)&&/Lash dart|Short dart/.test(r.thrust)&&/Ankle wrap/.test(r.sweep):/Relocked/.test(r.slash),JSON.stringify(r));
  await shot('3_unbound');
  // 4. the whip from range: he stays where he is and the chain goes out; drawn, it trails the throw and lands its tip on the blade's
  // tip (where the game has the blow land) with a crack
  r=await p.evaluate(()=>{const K=hero(),D=targetOf(K),fa=Math.sign(D.station-K.station)||1;
    // (put him out on the tip)
    K.station=clampSt(K,D.station-fa*(engageGap(K,D)+90));K.build();fast(20);const x0=K.station,ready=lashReady(K,D),slash=tq('slash');
    cmd('slash').click();let lash=false,n=0,hold=null,crack=false,thrown=null,mode=null;
    while(n<600&&S.game.ex){fast(1);n++;const L=K.lash,W=K._whip;if(L&&K.lashLen>K.wp.len+20)lash=true;if(!L||!W)continue;const u=S.t-L.t0,j=W.x.length-1,T=K.p[TIP];
      if(u>=L.a&&u<L.b&&thrown==null)thrown=Math.hypot(W.x[j]-T.x,W.y[j]-T.y);
      if(u>=L.b&&u<L.c){hold=Math.hypot(W.x[j]-T.x,W.y[j]-T.y);crack=S.flashes.some(e=>e.color==='#e6fffb'&&Math.hypot(e.x-T.x,e.y-T.y)<40);mode=(arcState(K)||{}).mode;break;}}
    return{ready,slash,x0,x1:K.station,lash,n,thrown:thrown&&Math.round(thrown),hold:hold&&+hold.toFixed(2),crack,mode};});
  expect('an Unbound whip goes from where he stands: the chain runs out and he does not run in',r.ready&&/Whipcrack/.test(r.slash)&&r.lash&&Math.abs(r.x1-r.x0)<12,JSON.stringify(r));
  expect('the drawn chain trails the throw, lands its tip on the blade\'s tip and cracks there',r.mode==='whip'&&r.thrown>8&&r.hold!=null&&r.hold<1.5&&r.crack,JSON.stringify(r));
  await shot('4_lash');
  // 4b. the tip does the cutting, and the cut curls round a raised guard
  r=await p.evaluate(()=>{untilFree(9000);const K=hero();if(!mine())return{none:true};const D=foes().find(f=>f.weaponKey==='axe'&&!f.dead&&!f.downed)||foes().find(f=>!f.dead&&!f.downed);setTgt(K,D.idx);
    stb('unbound').click();fast(4);const fa=Math.sign(D.station-K.station)||1,at=g=>{K.station=clampSt(K,D.station-fa*(engageGap(K,D)+g));K.build();fast(4);};
    at(100);const far=pickTechnique(K,D,'slash'),dart=pickTechnique(K,D,'thrust'),g0=D.guarding;D.guarding=true;
    const par=(k,T)=>(computeMods(K,D,k,false,T).defMods.find(m=>m[0]==='parry')||[0,0])[1],pS=par('slash',far),pD=par('thrust',dart);D.guarding=g0;
    at(20);const near=pickTechnique(K,D,'slash');at(100);
    return{far:far.name,fd:far.dmg,near:near.name,nd:near.dmg,pS,pD,dart:dart.name,wp:D.weaponKey};});
  expect('the whip cuts hardest at the tip: the Whipcrack out at the end of the chain, the Short lash inside it',r.far==='Whipcrack'&&r.near==='Short lash'&&r.fd>1&&r.nd<1,JSON.stringify(r));
  expect('the cut curls round a raised guard: a Parry adds +2 against it, +4 against the dart',r.wp==='spear'||(r.pS===2&&r.pD===4),JSON.stringify(r));
  // 4c. at rest the chain hangs from the hilt
  r=await p.evaluate(()=>{fast(150);const K=hero(),W=K._whip;if(!W)return{none:true,st:stanceOf(K)};const j=W.x.length-1,h=K.p[HAF],t=K.p[TIP],ux=t.x-h.x,uy=t.y-h.y,l=Math.hypot(ux,uy)||1;
    return{drop:Math.round(W.y[j]-W.y[0]),off:Math.round(Math.abs(((W.x[j]-h.x)*uy-(W.y[j]-h.y)*ux)/l)),mode:(arcState(K)||{}).mode};});
  expect('at rest the chain hangs from the hilt',r.mode==='whip'&&r.drop>25&&r.off>10,JSON.stringify(r));
  await shot('4c_rest');
  // 4d. inside his reach the blow relocks: the chain locks into the blade for it and comes loose after
  r=await p.evaluate(()=>{const K=hero(),D=targetOf(K);if(!mine())return{none:true};const fa=Math.sign(D.station-K.station)||1;
    K.station=clampSt(K,D.station-fa*(engageGap(K,D)-30));K.build();fast(10);const name=pickTechnique(K,D,'slash').name;cmd('slash').click();const modes={};let n=0;
    while(n<900&&S.game.ex){if(S.opening&&!isAI(S.opening.f.idx))resolveOpening('hold');fast(1);n++;const ex=S.game.ex;if(ex&&ex.A===K&&ex.res)modes[(arcState(K)||{mode:'rigid'}).mode]=1;}
    untilFree(9000);fast(20);return{name,modes:Object.keys(modes),after:(arcState(K)||{}).mode,st:stanceOf(K)};});
  expect('a relocked blow locks the chain into the blade, and it comes loose after',/Relocked/.test(r.name)&&r.modes.length>0&&!r.modes.includes('whip')&&r.after==='whip',JSON.stringify(r));
  // 4e. what he is gearing up and how far off he is decide the stance that answers him; the dice follow, and the tip line says so
  r=await p.evaluate(()=>{untilFree(9000);const K=hero();if(!mine())return{none:true};
    const D=foes().find(f=>f.weaponKey==='spear'&&!f.dead&&!f.downed)||foes().find(f=>!f.dead&&!f.downed&&!stanceHeavy(f)&&!stnShortBlade(f));if(!D)return{none:true};setTgt(K,D.idx);
    const fa=Math.sign(D.station-K.station)||1,at=g=>{K.station=clampSt(K,D.station-fa*(engageGap(K,D)+g));K.build();
      // (anyone else is put well away with nothing planned, so the man in front is the only one that counts: behind Ilyas, or past the
      // man when Ilyas has his back to the edge)
      for(const o of foes())if(o!==D){o.intent=null;const xs=[clampSt(o,K.station-fa*320),clampSt(o,D.station+fa*320)];o.station=Math.abs(xs[0]-K.station)>=Math.abs(xs[1]-K.station)?xs[0]:xs[1];o.build();}fast(3);};
    const show=cmd=>{for(const o of foes())if(o!==D)o.intent=null;D.intent={cmd,tgt:K.idx,gap:Math.abs(D.station-K.station),dz:D.lane-K.lane,pinned:pinned(D),band:D.posture,tband:K.posture,tguard:!!K.guarding,tctr:!!K.counter,changed:false,paid:0};
      updateStatus();stnUiNow();fast(3);const b=document.querySelector('#stnBar .stn-b.fit');
      return{fit:b?b.dataset.s:null,why:b?b.querySelector('small').textContent:'',tip:(document.querySelector('.fl-tip')||{}).textContent||''};};
    at(15);const thrust=show('thrust');at(90);const over=show('overhead');at(15);const close=show('overhead');
    // the dice, as each stance would meet the blow
    const as=(st,fn)=>stanceAs(K,st,fn),list=ms=>ms.filter(m=>m[1]).map(m=>m[0]+' '+m[1]).join(', ');
    const def=(st,kind,far)=>as(st,()=>{D._came={turn:S.game.turnNo,D:K,far};try{return list(computeMods(D,K,kind,false,pickTechnique(D,K,kind)).defMods);}finally{D._came=null;}});
    const dice={boundThrust:def('bound','thrust',false),unboundThrust:def('unbound','thrust',false),unboundOverFar:def('unbound','overhead',true),unboundOverNear:def('unbound','overhead',false),
      blade:as('bound',()=>list(computeMods(K,D,'slash',false,pickTechnique(K,D,'slash')).mods))};
    // the tip line, in Unbound against his thrust
    stb('unbound').click();fast(4);const tl=show('thrust').tip;
    // the thrust he showed comes on his turn, and the answer window says what Bound does to it
    stb('bound').click();fast(2);at(15);show('thrust');const it0=D.intent&&{cmd:D.intent.cmd,tgt:D.intent.tgt};cmd('wait').click();let win=null,n=0;const seen=[];
    // (another man may act before him, and his turn come round again first: then Ilyas waits again, in Bound, up to three turns, the man
    // put back at blade's length with the thrust shown, so it comes with the point and not the butt)
    let turns=0;
    while(n<12000&&!win&&!D.dead&&!D.downed){const o=S.opening;if(o&&seen.length<12&&!seen.some(x=>x.o===o))seen.push({o,src:o.source,f:o.f&&o.f.name,opp:o.opp&&o.opp.name,att:o.attack,ex:S.game.ex&&S.game.ex.cmd});
      if(o&&o.source==='react'&&o.f===K){if(o.opp===D){win={txt:(document.getElementById('opReason')||{}).textContent||'',kind:o.attack};}resolveOpening('parry');}
      else if(o&&!isAI(o.f.idx))resolveOpening('hold');
      if(mine()){if(++turns>3||K.downed||K.clinch)break;if(stanceOf(K)!=='bound')stb('bound').click();setTgt(K,D.idx);at(15);show('thrust');cmd('wait').click();}
      fast(1);n++;}
    return{tgt:D.name,wp:D.weaponKey,thrust,over,close,dice,tl,win,dbg:win?null:{n,it0,seen:seen.map(({o,...x})=>x),log:S.game.lastActs||null}};});
  expect('a thrust he is gearing up at blade\'s length marks Bound, which beats it aside',!r.none&&r.thrust.fit==='bound'&&/beats his thrust/.test(r.thrust.why),JSON.stringify(r.thrust||r));
  expect('an overhead he has to come in for marks Unbound, which catches his arm; the same overhead in reach marks Close, inside his swing',
    !r.none&&r.over.fit==='unbound'&&/catches his arm/.test(r.over.why)&&r.close.fit==='close'&&/inside his swing/.test(r.close.why),JSON.stringify({over:r.over,close:r.close}));
  expect('the dice follow: +3 beating a thrust aside, −2 when it comes inside the chain, +3 catching an overhead coming in (not one in reach), +1 at blade\'s length',
    !r.none&&/beats the point aside 3/.test(r.dice.boundThrust)&&/inside the chain -2/.test(r.dice.unboundThrust)&&/the chain catches his arm 3/.test(r.dice.unboundOverFar)&&
    !/catches his arm/.test(r.dice.unboundOverNear)&&/at blade’s length 1/.test(r.dice.blade),JSON.stringify(r.dice));
  expect('the tip line names the blow he is gearing up, what it does to your stance and the stance that answers it',!r.none&&/gearing up a thrust/.test(r.tl)&&/inside the chain/.test(r.tl)&&/Bound beats it aside/.test(r.tl),r.tl);
  expect('the blow he showed is the one he throws, and the answer window says what the stance does to it',!r.none&&!!r.win&&r.win.kind==='thrust'&&/Bound: beats the point aside, \+3/.test(r.win.txt),JSON.stringify(r.win||r.dbg));
  await shot('4e_answer');
  // 4f. a blow his stance answers that misses him costs the man a pip of balance more, named over him; one it does not answer costs the usual
  // (each stance in a fresh fight, so the two meet the same man the same way)
  r=await p.evaluate(()=>{const log=[];let D=null,K=null;
    const ai=applyImpact;applyImpact=function(ex,A,Dd,res){if(D&&A===D&&Dd===K&&res&&res.kind==='thrust'){A.foot=footMaxOf(A);const f0=A.foot,n0=S.popups.length;let base=0;
        // (what the miss costs him without the stance: blocked, parried or countered, as it fell)
        const kb=knockBalance;knockBalance=function(f,n,by){if(f===A&&by===K&&!base)base=n;return kb.apply(this,arguments);};
        let out;try{out=ai.apply(this,arguments);}finally{knockBalance=kb;}
        log.push({st:stanceOf(K),out:res.out,base,lost:f0-A.foot,pop:S.popups.slice(n0).filter(q=>q.sub==='\u22121 balance').map(q=>q.text).join('|')});return out;}
      return ai.apply(this,arguments);};
    const oo=outcomeOf;window.outcomeOf=outcomeOf=function(){const ex=S.game.ex;return ex&&D&&ex.A===D?'block':oo.apply(this,arguments);};
    try{for(const st of ['bound','close']){D=null;S.F=[];restart();untilMine(6000);K=hero();if(!mine())break;
        D=foes().find(f=>f.weaponKey==='spear'&&!f.dead&&!f.downed)||foes().find(f=>!f.dead&&!f.downed&&!stanceHeavy(f)&&!stnShortBlade(f));if(!D)break;
        setTgt(K,D.idx);stb(st).click();fast(2);const fa=Math.sign(D.station-K.station)||1;
        K.station=clampSt(K,D.station-fa*(engageGap(K,D)+15));K.build();
        for(const o of foes())if(o!==D){o.intent=null;o.station=clampSt(o,K.station-fa*320);o.build();}
        D.foot=footMaxOf(D);D.intent={cmd:'thrust',tgt:K.idx,gap:Math.abs(D.station-K.station),dz:D.lane-K.lane,pinned:pinned(D),band:D.posture,tband:K.posture,tguard:false,tctr:false,changed:false,paid:0};
        fast(3);const n0=log.length;cmd('wait').click();let n=0;
        while(n<4000&&log.length===n0){const o=S.opening;if(o&&!isAI(o.f.idx))resolveOpening('hold');if(S.game.phase==='over')break;fast(1);n++;}}}
    finally{applyImpact=ai;window.outcomeOf=outcomeOf=oo;}
    const out={tgt:D&&D.name,wp:D&&D.weaponKey,log};D=null;S.F=[];restart();untilMine(6000);return out;});
  {const lb=r.log.find(x=>x.st==='bound'),lc=r.log.find(x=>x.st==='close');
    expect('a thrust Bound beats aside costs him a pip of balance more when it misses, named over him; in Close, which it does not answer, the usual',
      !!lb&&!!lc&&lb.out==='block'&&lb.base>0&&lb.lost===lb.base+1&&lb.pop==='Beaten aside'&&lc.base>0&&lc.lost===lc.base&&lc.pop==='',JSON.stringify(r));}
  // 4g. sword against sword: the setup offers swordsmen, and against a lone one the three things still decide: his thrust marks Bound,
  // his cut inside marks Close, his overhead from range marks Unbound (each with the bar's reason)
  r=await p.evaluate(()=>{const opt=(()=>{stnSetup(true);const b=document.querySelector('#stnSetup .st-o[data-g="mix"][data-v="swords"]')||
      [...document.querySelectorAll('.st-o')].find(x=>x.dataset.g==='mix'&&x.dataset.v==='swords');const t=b?b.textContent:null;stnSetup(false);return t;})();
    STNUI.mix='swords';S.cfg.n=1;S.cfg.crew=false;stnApplyMix();S.F=[];restart();untilMine(6000);const K=hero(),D=targetOf(K);if(!mine()||!D)return{none:true,opt};
    const fa=Math.sign(D.station-K.station)||1,at=g=>{K.station=clampSt(K,D.station-fa*(engageGap(K,D)+g));K.build();fast(3);};
    const show=cmd=>{D.intent={cmd,tgt:K.idx,gap:Math.abs(D.station-K.station),dz:D.lane-K.lane,pinned:pinned(D),band:D.posture,tband:K.posture,tguard:false,tctr:false,changed:false,paid:0};
      updateStatus();stnUiNow();fast(3);const b=document.querySelector('#stnBar .stn-b.fit');return{fit:b?b.dataset.s:null,why:b?b.querySelector('small').textContent:''};};
    at(15);const thrust=show('thrust');at(-25);const cut=show('slash');at(110);const over=show('overhead');
    const out={opt,wp:D.weaponKey,name:D.name,thrust,cut,over};STNUI.mix='mixed';S.cfg.n=2;stnApplyMix();S.F=[];restart();untilMine(6000);return out;});
  expect('sword against sword: the setup offers swordsmen; his thrust marks Bound, his cut inside marks Close, his overhead from range marks Unbound',
    !r.none&&r.opt==='Swords'&&r.wp==='sword'&&r.thrust.fit==='bound'&&/beats his thrust/.test(r.thrust.why)&&r.cut.fit==='close'&&/inside his cut/.test(r.cut.why)&&
    r.over.fit==='unbound'&&/catches his arm/.test(r.over.why),JSON.stringify(r));
  // 4h. the new spells: six buttons in the Aether row (three while the setup says today's three), each reading the moment
  r=await p.evaluate(()=>{const fresh=(mix,n)=>{STNUI.mix=mix;S.cfg.n=n;S.cfg.crew=false;stnApplyMix();S.F=[];restart();untilMine(6000);};
    const place=g=>{const K=hero(),D=targetOf(K),fa=Math.sign(D.station-K.station)||1;K.station=clampSt(K,D.station-fa*(engageGap(K,D)+g));K.lane=D.lane;K.build();fast(4);};
    const btn=k=>document.getElementById('mg-'+k),vis=()=>[...document.querySelectorAll('#mgRow .cmd.mg')].filter(b=>!b.hidden).map(b=>b.dataset.k);
    const out={};fresh('keeper',1);const K=hero(),D=targetOf(K);K.aether=5;place(15);updateCommands();out.on=vis();
    STNUI.el.setup.innerHTML='';stnSetupPick('spells','0');updateCommands();out.off=vis();stnSetupPick('spells','1');stnSetup(false);updateCommands();
    // Glare: his thrust shown at blade's length, then out of the light
    D.intent={cmd:'thrust',tgt:K.idx,gap:Math.abs(D.station-K.station),dz:0,paid:0};updateCommands();out.glareTq=(btn('glare').querySelector('.tq')||{}).textContent;
    const T=pickTechnique(D,K,'thrust');btn('glare').click();fast(30);out.dazzled=!!D.glare;out.glareDice=computeMods(D,K,'thrust',false,T).mods.filter(m=>m[0]==='dazzled').map(m=>m[1]).join(',');
    untilMine(6000);fresh('keeper',1);hero().aether=5;place(150);updateCommands();out.glareFar=btn('glare').disabled&&/Out of the light/.test(btn('glare').textContent);
    // Gilt line from range in Close: he lands in his chest (or half way if he holds), two pips (one) off balance
    document.querySelector('#stnBar .stn-b[data-s="close"]').click();fast(2);updateCommands();const K2=hero(),D2=targetOf(K2),g0=lashGap(K2,D2),f0=D2.foot;out.lineOn=!btn('line').disabled;
    const ly=lineYank;let yank=null;lineYank=function(A,D,roll){const f1=D.foot;ly.apply(this,arguments);yank={ok:roll.ok,lost:f1-D.foot,g1:Math.round(lashGap(A,D))};};
    try{btn('line').click();fast(80);}finally{lineYank=ly;}
    out.line={g0:Math.round(g0),g1:yank?yank.g1:null,ok:yank?yank.ok:null,lost:yank?yank.lost:null,pop:S.popups.map(q=>q.text).filter(t=>/Pulled in|Holds the line/.test(t)).join('|')};
    untilMine(6000);fresh('keeper',1);hero().aether=5;place(15);updateCommands();out.lineNear=btn('line').disabled&&/Too close/.test(btn('line').textContent);
    // Gilt edge: free (his turn goes on), 1 Aether, Bound's dice +1, gone at his next turn
    const K3=hero(),D3=targetOf(K3),a0=K3.aether;btn('edge').click();fast(2);out.edge={lit:!!K3.edge,spent:a0-K3.aether,mine:mine(),dice:computeMods(K3,D3,'slash',false,pickTechnique(K3,D3,'slash')).mods.filter(m=>m[0]==='gilt edge').map(m=>m[1]).join(',')};
    cmd('wait').click();untilMine(6000);out.edge.after=!!hero().edge;
    // Overdrive: no Aether, and the Glare button burns 8 health for it
    fresh('keeper',1);const K4=hero(),D4=targetOf(K4);K4.aether=0;place(15);updateCommands();out.od={tq:(btn('glare').querySelector('.tq')||{}).textContent,h:(btn('glare').querySelector('small')||{}).textContent,on:!btn('glare').disabled};
    const hp0=K4.hp;btn('glare').click();fast(30);out.od.burn=hp0-K4.hp;out.od.dazzled=!!D4.glare;
    untilMine(6000);STNUI.mix='mixed';S.cfg.n=2;stnApplyMix();S.F=[];restart();untilMine(6000);return out;});
  expect('the Aether row holds the six spells, and three while the setup says today\'s three',r.on.join()==='bolt,gale,blink,glare,line,edge'&&r.off.join()==='bolt,gale,blink',JSON.stringify({on:r.on,off:r.off}));
  expect('Glare reads his blow (a thrust at -4), dazzles him at blade\'s length and puts the -4 on his dice; out of reach the light does not carry',
    /Thrust at .4/.test(r.glareTq)&&r.dazzled&&/-4/.test(r.glareDice)&&r.glareFar,JSON.stringify({tq:r.glareTq,d:r.dazzled,dice:r.glareDice,far:r.glareFar}));
  expect('Gilt line yanks a man who holds off into Close\'s chest, off balance (half way if he holds); a man in reach is too close for it',
    r.lineOn&&r.line.g0>=40&&(r.line.ok?r.line.g1<=-12&&r.line.lost>=2&&/Pulled in/.test(r.line.pop):r.line.g1<r.line.g0&&/Holds the line/.test(r.line.pop))&&r.lineNear,JSON.stringify({on:r.lineOn,line:r.line,near:r.lineNear}));
  expect('Gilt edge is lit for 1 Aether and his turn goes on; Bound\'s blows are +1 while it is lit, and it is gone at his next turn',
    r.edge.lit&&r.edge.spent===1&&r.edge.mine&&r.edge.dice==='1'&&!r.edge.after,JSON.stringify(r.edge));
  expect('with no Aether the Glare button reads Overdrive at 8 health, and casting it burns that and dazzles him',r.od.on&&r.od.tq==='Overdrive'&&/8 health/.test(r.od.h)&&r.od.burn===8&&r.od.dazzled,JSON.stringify(r.od));
  // 4i. the Ward in the answer window: an overhead coming, the Ward among the answers at +5, 1 Aether, and on the blow's dice
  r=await p.evaluate(()=>{STNUI.mix='keeper';S.cfg.n=1;S.cfg.crew=false;stnApplyMix();S.F=[];restart();untilMine(6000);const K=hero(),D=targetOf(K);K.aether=3;
    const fa=Math.sign(D.station-K.station)||1;K.station=clampSt(K,D.station-fa*(engageGap(K,D)+15));K.lane=D.lane;K.build();fast(4);
    D.intent={cmd:'overhead',tgt:K.idx,gap:Math.abs(D.station-K.station),dz:0,pinned:pinned(D),band:D.posture,tband:K.posture,tguard:false,tctr:false,changed:false,paid:0};
    cmd('wait').click();let n=0,o=null;while(n<4000){o=S.opening;if(o&&o.source==='react'&&o.f===K&&o.opp===D)break;if(o&&!isAI(o.f.idx))resolveOpening('hold');if(mine())break;fast(1);n++;}
    if(!o||o.source!=='react')return{none:true,n};const ch=openingChoices(o),bon=reactBonus(o,'ward'),a0=K.aether,kind=o.attack;
    const btn=[...document.querySelectorAll('#opBtns button')].find(b=>b.dataset.c==='ward');resolveOpening('ward');
    const dm=S.game.ex&&S.game.ex.res?S.game.ex.res.defMods.filter(m=>m[0]==='ward').map(m=>m[1]).join(','):'';const out={ch,bon,kind,spent:a0-K.aether,dm,btn:btn?btn.textContent:null};
    untilMine(6000);STNUI.mix='mixed';S.cfg.n=2;stnApplyMix();S.F=[];restart();untilMine(6000);return out;});
  expect('the Ward is an answer in the window: +5 against his Overhead for 1 Aether, and it is on the blow\'s dice',
    !r.none&&r.ch.includes('ward')&&r.kind==='overhead'&&r.bon===5&&r.spent===1&&r.dm==='5'&&/Ward/.test(r.btn||''),JSON.stringify(r));
  // 5. a Close blow: he strikes from inside the man's reach and stays there, and the axe that answers comes on its haft
  r=await p.evaluate(()=>{let n=untilFree(9000);const K=hero();if(!mine())return{none:true,n};
    const A0=foes().find(f=>f.weaponKey==='axe'&&!f.dead&&!f.downed);if(A0)setTgt(K,A0.idx);const D=targetOf(K);
    stb('close').click();fast(4);const tech=tq('slash');cmd('slash').click();let gi=null,end=null,res=null,mine0=null,pre=null;n=0;
    // (a stop-hit can come first: the blow itself is the exchange of his that has dice; the gap is the one the blow lands across, on the
    // frame before a hit drives him back)
    while(n<1500){if(S.opening&&!isAI(S.opening.f.idx))resolveOpening(aiOpening(S.opening));const ex=S.game.ex;
      if(ex&&ex.A===K&&ex.res&&ex.res.kind==='slash'){mine0=ex;if(!ex.impactDone)pre=Math.abs(K.curBody.px-D.curBody.px);else if(gi==null){gi=pre??Math.abs(K.curBody.px-D.curBody.px);res=ex.res.out;}}
      else if(mine0&&S.game.ex!==mine0&&end==null){end=Math.abs(K.station-D.station);break;}
      fast(1);n++;}
    const ax=foes().find(f=>f.weaponKey==='axe'&&!f.dead);
    return{tgt:D.name,tech,atImpact:Math.round(gi),end:Math.round(end),close:Math.round(clinchGap(K,D)+STN.closeGap),eng:Math.round(engageGap(K,D)),out:res,st:K.stance,
      axe:ax?pickTechnique(ax,K,'overhead').key+'/'+pickTechnique(ax,K,'slash').key:null,jam:ax?jammedTech(ax,pickTechnique(ax,K,'overhead')):null};});
  expect('a Close blow lands from inside the man\'s reach, and he settles there',!r.none&&r.atImpact<=r.close+24&&r.end<r.eng+30,JSON.stringify(r));
  expect('an axe striking him in Close comes on the haft, jammed',r.axe===null||(/choked|haft/.test(r.axe)&&r.jam),JSON.stringify(r));
  await shot('5_close');
  // 6. a fall: he rises free at his turn, off balance, and the turn is his own (in a fresh fight, whatever the checks before left)
  r=await p.evaluate(()=>{S.F=[];restart();untilMine(6000);let n=untilFree(9000);const E=foes().find(f=>!f.dead&&!f.downed&&!f.hench);if(!E)return{none:true};
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
  r=await p.evaluate(()=>{S.F=[];restart();untilMine(6000);let n=untilFree(9000);const K=hero();const E=foes().find(f=>!f.dead&&!f.downed&&!f.hench);if(!E||!mine())return{none:true};
    // (he is put in reach, and the blow on the floor is made to land: the rule is what happens after it)
    {const fa=Math.sign(E.station-K.station)||1;E.station=clampSt(E,K.station+fa*engageGap(K,E));E.build();fast(2);}
    knockDown(E);setTgt(K,E.idx);fast(2);const lbl0=intentLabel(E);let got=null;const getups=[];const c0=command;
    window.command=command=function(i,c){if(S.F[i]===E&&(c==='getup'||c==='roll'))getups.push(c);return c0.apply(this,arguments);};
    const oo=outcomeOf;window.outcomeOf=outcomeOf=function(){return S.game.ex&&S.game.ex.A===K?'hit':oo.apply(this,arguments);};
    try{cmd('thrust').click();n=0;while(n<900&&S.game.ex&&S.game.ex.A===K){fast(1);n++;}}finally{window.outcomeOf=outcomeOf=oo;}const struck=E.noRise,dead=E.dead,lbl=intentLabel(E);
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
