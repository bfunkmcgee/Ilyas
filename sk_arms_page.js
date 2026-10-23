// Page checks for the restaurant's weapons (sk_arms.js, sk_armsui.js): every design drawn where it should be (in the hand, on the floor,
// in the scabbard on its way out, Mr. Hallowell's cane by his desk), the names on the cards, the bench and in the help, the old
// silhouettes on request. usage: node sk_arms_page.js   (needs test_page.html from build.py)
// Frames are drawn one in eight (window.step) and the game is the same either way (probes/draw_free.js); a check that counts or
// reads what is drawn runs inside drawAll(), which draws every frame. The timing checks are in sk_perf_page.js.
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
    await p.evaluate(()=>{S.soundOn=false;let a=23;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
      window.__now=performance.now()+1000;window.step=(k,o)=>{const ev=(o&&o.every)||window.__drawEvery||1;for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(!f)continue;if(ev===1||(window.__fc=(window.__fc||0)+1)%ev===0)f(window.__now);else{const R=window.render;window.render=()=>{};try{f(window.__now);}finally{window.render=R;}}}};window.__drawEvery=window.__drawEvery||8;window.drawAll=fn=>{const e=window.__drawEvery;window.__drawEvery=1;try{return fn();}finally{window.__drawEvery=e;}};
      // what ArmsLook drew, by design: in the hand or on the floor, with a cut (out of the scabbard), and scabbards
      window.DR={ids:{},cut:{},scab:{},n:0};const _d=ArmsLook.draw;ArmsLook.draw=function(c,id,h,t,sd,o){DR.ids[id]=(DR.ids[id]||0)+1;if(o&&o.cut!=null)DR.cut[id]=(DR.cut[id]||0)+1;DR.n++;return _d.apply(this,arguments);};
      const _s=ArmsLook.scabbard;ArmsLook.scabbard=function(c,id){DR.scab[id]=(DR.scab[id]||0)+1;return _s.apply(this,arguments);};
      window.reset=()=>{DR.ids={};DR.cut={};DR.scab={};DR.n=0;};
      window.fight=(o)=>{S.arenaKey=o.arena||'restaurant';S.backroom=!!o.back;S.deep=!!o.deep;S.introOn=!!o.intro;S.tableOn=false;S.divOn=false;S.cfg.n=o.n||1;S.cfg.crew=!!o.crew;S.cfg.ally.on=!!o.ally;S.auto=o.auto!==false;
        S.F=[];rosterBuild();restart();step(3);};
      window.runUntil=(pred,max)=>{let n=0;while(!pred()&&n<(max||30000)){step(1);n++;}return n;};
      window.clearNow=()=>{if(S.crew)S.crew.queue.length=0;S.opening=null;S.game.ex=null;for(const f of foes()){f.hp=0;kill(f,1);}if(nextRoom())beginTransit();};
      window.inRoom=r=>runUntil(()=>S.room===r&&!S.stage.tr&&(S.game.phase==='input'||S.game.phase==='exchange'));
      window.ids=()=>Object.keys(DR.ids).sort().join(',');});
    return p;};
  const p=await open(1300,900,1);
  const ev=(fn,arg)=>p.evaluate(fn,arg);

  // ---- the table ----
  const t0=await ev(()=>{const bad=[];for(const r in ARMS.crew)for(const k in ARMS.crew[r])for(const [d,n] of ARMS.crew[r][k]){const D=ArmsLook.D[d];if(!D||D.name!==n||D.kind!==k)bad.push(r+':'+d);}
    for(const n in ARMS.sig){const s=ArmsLook.spec('sig:'+n);if(!s||s.name!==ARMS.sig[n].name||(ARMS.sig[n].key&&s.kind!==ARMS.sig[n].key))bad.push('sig:'+n);}
    const sigOf=k=>Object.keys(ARMS.sig).find(n=>ArmsLook.SIGKEY[n]===k),built=Object.keys(ArmsLook.D).map(k=>!!ArmsLook.get(sigOf(k)?'sig:'+sigOf(k):'crew:'+k));
    return{ok:ArmsLook.ok,bad,built:built.every(Boolean),n:Object.keys(ArmsLook.D).length,kael:!!ArmsLook.D.kaeldagger,dull:!!ArmsLook.D.kaeldull,broom:!!ArmsLook.D.broom};});
  expect('every design in the game has its drawing, under the same name and kind: the restaurant\'s 36, Kael\'s hip dagger, its dull Act I fittings and Tamm\'s broom',t0.ok&&!t0.bad.length&&t0.built&&t0.n===39&&t0.kael&&t0.dull&&t0.broom,JSON.stringify(t0));

  // ---- who is drawn how ----
  const who=await ev(()=>drawAll(()=>{fight({crew:true,ally:true});reset();step(40);const H=S.F.filter(f=>f.hench);
    return{ids:{...DR.ids},hench:H.map(f=>f.wdes),old:S.F.filter(f=>f.team===0).map(f=>f.wdes)};}));
  expect('in a crew fight Qadir\'s Last Orders and every crew member\'s weapon are drawn every frame; Kael\'s and Amri\'s are not',
    who.ids['sig:Qadir']===40&&who.hench.every(d=>who.ids[d]>=40)&&who.old.every(d=>d===null),JSON.stringify(who));

  // ---- every room ----
  const rooms=await ev(()=>{const out={};fight({back:true,deep:true,n:3});const look=r=>{reset();step(30);out[r]={ids:ids(),scab:Object.keys(DR.scab).sort().join(',')};};
    look('dining');for(const r of ['kitchen','lobby','office']){clearNow();inRoom(r);look(r);}return out;});
  expect('each room\'s elves are drawn with their own weapons, and Mr. Hallowell\'s cane leans on his desk',
    rooms.dining.ids==='sig:Brask,sig:Iyla,sig:Qadir'&&rooms.kitchen.ids==='sig:Hesk,sig:Odile,sig:Orrin'&&rooms.lobby.ids==='sig:Doran,sig:Kessa,sig:Sable'&&rooms.office.ids==='sig:Kade,sig:Mr. Hallowell',
    JSON.stringify(['dining','kitchen','lobby','office'].map(r=>rooms[r].ids)));
  expect('the elves with swords and daggers wear scabbards to match',rooms.dining.scab==='sig:Iyla'&&rooms.kitchen.scab==='sig:Hesk,sig:Odile,sig:Orrin'&&rooms.lobby.scab==='sig:Kessa,sig:Sable'&&rooms.office.scab==='sig:Kade',
    JSON.stringify(['dining','kitchen','lobby','office'].map(r=>rooms[r].scab)));
  const crews=await ev(()=>{const out={};fight({back:true,deep:true,crew:true});const look=r=>{reset();drawAll(()=>step(20));out[r]=S.F.filter(f=>f.hench).every(f=>DR.ids[f.wdes]>=20&&f.wdes&&f.wdes.startsWith('crew:'))&&S.F.filter(f=>f.hench).length>=2;};
    look('dining');for(const r of ['kitchen','lobby']){clearNow();inRoom(r);look(r);}fight({arena:'street',crew:true});look('street');return out;});
  expect('every crew is drawn with its room\'s weapons, in the restaurant and on the street',Object.values(crews).every(Boolean)&&Object.keys(crews).length===4,JSON.stringify(crews));

  // ---- out of the scabbard ----
  const draw=await ev(()=>drawAll(()=>{fight({n:3,intro:true});reset();step(150);return{cut:{...DR.cut},iyla:DR.ids['sig:Iyla']||0};}));
  expect('as the fight opens Iyla draws Corkscrew out of its scabbard, the blade showing only as far as its mouth',(draw.cut['sig:Iyla']||0)>=3,JSON.stringify(draw));

  // ---- on the floor ----
  const floor=await ev(()=>drawAll(()=>{fight({n:1});const V=S.F[1];const it=dropWeapon(V,1,true);reset();step(30);const lying=DR.ids['sig:Qadir']||0;
    // and stuck in a body
    fight({crew:true});const H=S.F.find(f=>f.hench),K=S.F[0],des=H.wdes;makeStuck(H,K,{F:{type:'thrust'},ex:null,stuck:true});reset();step(20);
    updateStatus();const meta=(document.getElementById('meta'+H.idx)||{}).textContent||'',tags=(document.getElementById('tags'+H.idx)||{}).textContent||'';
    return{lying,item:it&&it.wdes,stuck:DR.ids[des]||0,des,name:armsCrewName(des),meta,tags};}));
  expect('a disarmed elf\'s weapon lies on the floor as itself, and a blade left in a body too',floor.item==='sig:Qadir'&&floor.lying>=30&&floor.stuck>=20,JSON.stringify(floor));
  expect('the crew member\'s card says what is stuck: his own weapon, by its name',!!floor.name&&floor.tags.includes(floor.name+' stuck'),JSON.stringify([floor.name,floor.tags]));

  // ---- the cards ----
  const cards=await ev(()=>{fight({crew:true});updateStatus();return S.F.filter(f=>f.team===1).map(f=>({n:f.name,w:f.wp.name,meta:(document.getElementById('meta'+f.idx)||{}).textContent||''}));});
  expect('the cards call the crew\'s weapons by their names, and Qadir\'s by its kind',cards.filter(c=>/Henchman/.test(c.n)).every(c=>c.meta.startsWith(c.w)&&c.w!=='Longsword'&&c.w!=='Dagger')&&cards.find(c=>c.n==='Qadir').meta.startsWith('Greataxe'),JSON.stringify(cards));

  // ---- the bench ----
  const bench=await ev(()=>{S.arenaKey='restaurant';S.backroom=true;S.deep=true;S.cfg.n=3;S.cfg.crew=false;S.F=[];rosterBuild();restart();buildBench();
    const cap=n=>{const d=[...document.querySelectorAll('.fcfg')].find(x=>x.querySelector('b').textContent===n);return d?(d.querySelector('.wsig')||{}).textContent||'':'';};
    const caps={};for(const n of ['Qadir','Brask','Iyla','Orrin','Hesk','Odile','Sable','Doran','Kessa','Kade'])caps[n]=cap(n);
    const d=[...document.querySelectorAll('.fcfg')].find(x=>x.querySelector('b').textContent==='Qadir');d.querySelector('[data-w="sword"]').click();step(2);const after=cap('Qadir'),des=S.F[1].wdes;
    d.querySelector('[data-w="axe"]').click();step(2);return{caps,after,des,back:S.F[1].wdes,kael:cap('Ilyas')};});
  expect('the Fighters panel names each elf\'s own weapon',bench.caps.Qadir.startsWith('Last Orders')&&bench.caps.Kade.startsWith('Severance')&&Object.values(bench.caps).every(c=>c.length>12)&&bench.kael==='',JSON.stringify(bench.caps));
  expect('given a sword, Qadir carries elven work in his colours, and Last Orders again with his greataxe',/Elven longsword in Qadir/.test(bench.after)&&bench.des==='house:Qadir:sword'&&bench.back==='sig:Qadir',JSON.stringify([bench.after,bench.des,bench.back]));

  // ---- the help ----
  const help=await ev(()=>{const box=[...document.querySelectorAll('.win.bench.techs')].find(x=>/The restaurant's weapons/.test(x.querySelector('h2').textContent));const t=box?box.textContent:'';
    return{found:!!box,names:Object.values(ARMS.sig).every(s=>t.includes(s.name.replace('’',"'"))),crew:['champagne sabres','roasting spit','halberd','boat hook','skillets'].every(w=>t.includes(w))};});
  expect('the help names every elf\'s weapon and what each crew carries',help.found&&help.names&&help.crew,JSON.stringify(help));

  // ---- the old look ----
  const classic=await ev(()=>drawAll(()=>{fight({crew:true});S.classicLook=true;reset();step(20);const n=DR.n;S.classicLook=false;reset();step(5);return{off:n,on:DR.n};}));
  expect('S.classicLook brings back the old silhouettes, and switching it off brings the weapons back',classic.off===0&&classic.on>=10,JSON.stringify(classic));

  // ---- whole runs ----
  const whole=await ev(()=>{const out={};for(const [k,o] of [['crew',{back:true,deep:true,crew:true,ally:true}],['three',{back:true,deep:true,n:3}],['street',{arena:'street',crew:true}]]){fight(o);let n=0;while(S.game.phase!=='over'&&n<40000){step(1);n++;}out[k]={n,phase:S.game.phase,room:S.room};}return out;});
  expect('whole fights play out to the end: a crew run through every room, the three-elf run, a street crew',Object.values(whole).every(v=>v.phase==='over'),JSON.stringify(whole));

  // ---- the cost: in sk_perf_page.js, run on its own at the end of a full run (python3 test.py perf), where nothing else loads the machine ----

  // ---- a phone ----
  const ph=await open(390,844,3);
  const phone=await ph.evaluate(()=>drawAll(()=>{fight({crew:true,ally:true});reset();step(60);return{n:DR.n};}));
  expect('on a phone the weapons draw every frame',phone.n>=180,JSON.stringify(phone));

  expect('no page errors',pageErrs.length===0,pageErrs.slice(0,3).join(' | '));
  console.log(rep.join('\n'));console.log(errs.length?`\n${errs.length} FAILED`:`\nall ${rep.length} checks passed`);
  await b.close();process.exit(errs.length?1:0);
})();
