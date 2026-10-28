// Page checks for Kael's weapons drawn in full (sk_armsui.js, sk_lookui.js): the arc-blade in each of its states, lying on the
// floor, painted once while locked and drawn in full as it moves; his hip dagger in the hand and in the off hand; the common weapons
// he can be given; and the old figures on request. usage: node sk_arc_page.js   (needs test_page.html from build.py)
// Every check here counts what is drawn, so this suite draws every frame (the others draw one in eight; see GUIDE.md).
const SK_T0=Date.now();
const {chromium}=require('playwright');
const rep=[],errs=[];
function expect(label,cond,info){rep.push((cond?'ok   ':'FAIL ')+label+(process.env.SK_TIMING?' ['+((Date.now()-SK_T0)/1000).toFixed(1)+'s]':'')+(info!==undefined&&info!==''?'  '+info:''));if(!cond)errs.push(label+(info!==undefined?' ('+info+')':''));}
(async()=>{
  const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),pageErrs=[];
  const open=async(vw,vh,dpr)=>{const p=await (await b.newContext({viewport:{width:vw,height:vh},deviceScaleFactor:dpr})).newPage();
    p.on('pageerror',e=>pageErrs.push(e.message));
    await p.addInitScript(e=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};if(e)window.__drawEvery=e;},+process.env.SK_DRAW_EVERY||0);
    await p.goto('file://'+process.cwd()+'/test_page.html');await p.waitForTimeout(300);
    await p.evaluate(()=>{S.soundOn=false;let a=31;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
      window.__now=performance.now()+1000;window.step=(k,o)=>{const ev=(o&&o.every)||window.__drawEvery||1;for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(!f)continue;if(ev===1||(window.__fc=(window.__fc||0)+1)%ev===0)f(window.__now);else{const R=window.render;window.render=()=>{};try{f(window.__now);}finally{window.render=R;}}}};window.__drawEvery=window.__drawEvery||1;window.drawAll=fn=>{const e=window.__drawEvery;window.__drawEvery=1;try{return fn();}finally{window.__drawEvery=e;}};
      // every arc-blade drawn: by state, and whether it came from the painted-once blade; every other design by id
      window.AR={modes:{},sprite:0,vector:0,ids:{},n:0};
      const _a=ArmsLook.arc;ArmsLook.arc=function(c,h,t,sd,st,P,o){const m=st?st.mode:'rigid';AR.modes[m]=(AR.modes[m]||0)+1;AR.n++;
        const k=o&&o.k;if(m==='rigid'&&k!=null&&k<6&&!(o&&o.vector))AR.sprite++;else AR.vector++;return _a.apply(this,arguments);};
      const _d=ArmsLook.draw;ArmsLook.draw=function(c,id){AR.ids[id]=(AR.ids[id]||0)+1;return _d.apply(this,arguments);};
      window.reset=()=>{AR.modes={};AR.sprite=0;AR.vector=0;AR.ids={};AR.n=0;};
      window.put=(f,x,z,fa)=>{f.station=x;f.lane=z;f.dep=z;f.stepDep=z;f.vdep=0;f.facing=fa;f.build();};
      window.hold=()=>{const g=S.game;g.phase='input';g.active=0;g.aiAt=null;S.opening=null;g.ex=null;for(const f of S.F){f.foot=FOOT_MAX;f.intent=null;}};
      window.fight=(o)=>{S.arenaKey=o.arena||'field';S.backroom=false;S.deep=false;S.introOn=!!o.intro;S.tableOn=false;S.divOn=false;S.cfg.n=o.n||1;S.cfg.crew=false;S.cfg.ally.on=!!o.ally;S.auto=!!o.auto;
        S.cfg.hero.weapon=o.hero||'elven';S.F=[];rosterBuild();restart();step(3);};});
    return p;};
  const p=await open(1300,900,1);
  const ev=(fn,arg)=>p.evaluate(fn,arg);

  // ---- the states ----
  const intro=await ev(()=>{fight({intro:true});reset();step(150);return{...AR.modes};});
  expect('as a fight opens the arc-blade is drawn rolled up, unrolling and locking, then locked',intro.rolled>0&&intro.unroll>0&&intro.lock>0&&intro.rigid>0,JSON.stringify(intro));
  // (the lash as it was before the stances, V70: Ilyas's with the stances off, and an elven foe's; in the stance Unbound his blade is a
  // bladed whip, sk_stancesui.js, checked in sk_stances_page.js)
  const lash=await ev(()=>{STANCE.on=false;try{fight({});const K=S.F[0],V=S.F[1];put(K,300,92,1);put(V,300+engageGap(K,V)+110,92,-1);hold();step(20);hold();
    S.game.active=0;command(0,'slash');reset();let n=0,mx=0;
    // a read roll on the way pauses the exchange for a choice: hold, and carry on until the plates have relocked
    while(n<600&&!AR.modes.pulse){step(1);n++;if(S.opening)resolveOpening('hold');mx=Math.max(mx,K.lashLen||0);}return{...AR.modes,lashMax:Math.round(mx),relock:K.relockT>0};}finally{STANCE.on=true;}});
  expect('the lash draws the plates out on the thread, and they relock with a pulse (the stances off)',lash.lash>0&&lash.pulse>0,JSON.stringify(lash));
  // Unbound: the blade hangs from the hilt as a bladed whip, drawn every frame
  const whip=await ev(()=>{fight({});const K=S.F[0],V=S.F[1];put(K,300,92,1);put(V,300+engageGap(K,V)+110,92,-1);hold();step(20);hold();
    S.game.active=0;setStance(K,'unbound');reset();step(30);return{...AR.modes,st:stanceOf(K)};});
  expect('in Unbound the blade is drawn as a bladed whip',whip.st==='unbound'&&whip.whip>=25&&!whip.rigid,JSON.stringify(whip));

  // ---- painted once at game size and close up, as paths very close ----
  const lod=await ev(()=>{fight({});reset();step(20);const game={sprite:AR.sprite,vector:AR.vector};
    const K=S.F[0],at=s=>{reset();ctx.save();ctx.setTransform(s,0,0,s,0,0);drawFighter(K);ctx.restore();return{sprite:AR.sprite,vector:AR.vector};};
    return{game,close:at(4),near:at(8)};});
  expect('locked, the blade is painted once at game size and close up, and drawn as paths very close',lod.game.sprite>=20&&lod.game.vector===0&&lod.close.sprite===1&&lod.close.vector===0&&lod.near.vector===1&&lod.near.sprite===0,JSON.stringify(lod));

  // ---- on the floor ----
  const floor=await ev(()=>{fight({});const K=S.F[0];const it=dropWeapon(K,1,false);reset();step(20);return{key:it&&it.key,n:AR.n,kael:K.weaponKey};});
  expect('the arc-blade lying where it fell is drawn in full too',floor.key==='elven'&&floor.n>=20&&floor.kael==='fists',JSON.stringify(floor));

  // ---- the hip dagger ----
  const hip=await ev(()=>{fight({});const K=S.F[0];dropWeapon(K,-1,false);K.sidearm='sheathed';drawSidearm(K);reset();step(20);const inHand={des:K.wdes,n:AR.ids['sig:Kael']||0};
    K.sidearm='offhand';K.setWeapon('fists');reset();step(10);return{inHand,off:AR.ids['sig:Kael']||0};});
  expect('his hip dagger, drawn, is his own design, and in his off hand too',hip.inHand.des==='sig:Kael'&&hip.inHand.n>=20&&hip.off>=10,JSON.stringify(hip));

  // ---- the common weapons ----
  const common=await ev(()=>{const out={};for(const w of ['sword','axe','spear','dagger']){fight({hero:w});reset();step(10);out[w]={des:S.F[0].wdes,n:AR.ids[S.F[0].wdes]||0};}
    fight({hero:'elven'});return out;});
  expect('given a common weapon, Kael carries it in blackened steel and gold with the arc-blade\'s light',common.sword.des==='house:Kael:sword'&&common.axe.des==='house:Kael:axe'&&common.spear.des==='house:Kael:spear'&&common.dagger.des==='sig:Kael'&&Object.values(common).every(v=>v.n>=10),JSON.stringify(common));

  // ---- the old figures ----
  const classic=await ev(()=>{fight({});S.classicLook=true;reset();step(10);const n=AR.n;S.classicLook=false;reset();step(5);return{off:n,on:AR.n};});
  expect('S.classicLook brings back the old blade, and switching it off brings this one back',classic.off===0&&classic.on>=5,JSON.stringify(classic));

  // ---- the cost: in sk_perf_page.js, run on its own at the end of a full run (python3 test.py perf), where nothing else loads the machine ----

  // ---- a phone ----
  const ph=await open(390,844,3);
  const phone=await ph.evaluate(()=>{fight({});reset();step(60);return{n:AR.n};});
  expect('on a phone the arc-blade draws every frame',phone.n>=60,JSON.stringify(phone));

  expect('no page errors',pageErrs.length===0,pageErrs.slice(0,3).join(' | '));
  console.log(rep.join('\n'));console.log(errs.length?`\n${errs.length} FAILED`:`\nall ${rep.length} checks passed`);
  await b.close();process.exit(errs.length?1:0);
})();
