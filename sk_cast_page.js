// Page checks for the restaurant cast (sk_cast.js, sk_castui.js): the named enemies are elves and the crews humans. Who is drawn
// how in every room and arena, the elves' heights and rank floors, the crews' bodies and wardrobes, the bench, the old figures on
// request, and Mr. Hallowell at his desk.
// usage: node sk_cast_page.js   (needs test_page.html from build.py)
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
    await p.evaluate(()=>{S.soundOn=false;let a=17;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
      window.__now=performance.now()+1000;window.step=(k,o)=>{const ev=(o&&o.every)||window.__drawEvery||1;for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(!f)continue;if(ev===1||(window.__fc=(window.__fc||0)+1)%ev===0)f(window.__now);else{const R=window.render;window.render=()=>{};try{f(window.__now);}finally{window.render=R;}}}};window.__drawEvery=window.__drawEvery||8;window.drawAll=fn=>{const e=window.__drawEvery;window.__drawEvery=1;try{return fn();}finally{window.__drawEvery=e;}};
      // who was drawn by what, this frame and in total
      window.DRAWN={cast:{},kael:0,ms:0,n:0};const _c=CastLook.draw;CastLook.draw=function(c,F,spec,o){DRAWN.cast[F.name]=(DRAWN.cast[F.name]||0)+1;DRAWN.n++;const t=performance.now();const r=_c.call(this,c,F,spec,o);DRAWN.ms+=performance.now()-t;return r;};
      const _k=KaelLook.draw;KaelLook.draw=function(c,F,o){DRAWN.kael++;return _k.call(this,c,F,o);};
      window.reset=()=>{DRAWN.cast={};DRAWN.kael=0;DRAWN.ms=0;DRAWN.n=0;};
      window.cm=f=>Math.round(bodyHeight(f.body));
      window.fight=(o)=>{S.arenaKey=o.arena||'restaurant';S.backroom=!!o.back;S.deep=!!o.deep;S.introOn=false;S.tableOn=false;S.divOn=false;S.cfg.n=o.n||1;S.cfg.crew=!!o.crew;S.cfg.ally.on=!!o.ally;S.auto=o.auto!==false;
        S.F=[];rosterBuild();restart();step(3);};
      window.runUntil=(pred,max)=>{let n=0;while(!pred()&&n<(max||30000)){step(1);n++;}return n;};
      window.clearNow=()=>{if(S.crew)S.crew.queue.length=0;S.opening=null;S.game.ex=null;for(const f of foes()){f.hp=0;kill(f,1);}if(nextRoom())beginTransit();};
      window.inRoom=r=>runUntil(()=>S.room===r&&!S.stage.tr&&(S.game.phase==='input'||S.game.phase==='exchange'));});
    return p;};
  const p=await open(1300,900,1);
  const ev=(fn,arg)=>p.evaluate(fn,arg);

  // ---- the table ----
  const t0=await ev(()=>({ok:CastLook.ok,named:Object.keys(ELVES).length,cast:Object.keys(CastLook.CAST).length,crews:Object.keys(CastLook.CREWS).sort().join(','),
    names:[...FOE_NAMES,...FOE2_NAMES,...FOE3_NAMES,BOSS.name,EXEC.name].every(n=>!!ELVES[n])}));
  // (the prologue adds its own: the man in white, and the crews of the field, the avenue and the checkpoint)
  expect('every named enemy is an elf with a design, and each room has a crew wardrobe',t0.ok&&t0.named>=11&&t0.cast>=11&&t0.names&&['dining','kitchen','lobby','street'].every(k=>t0.crews.split(',').includes(k)),JSON.stringify(t0));

  // ---- who is drawn how ----
  const who=await ev(()=>drawAll(()=>{fight({crew:true,ally:true});reset();step(60);const f=S.F;return{cast:{...DRAWN.cast},kael:DRAWN.kael,named:f.filter(isElf).map(x=>x.name),crew:f.filter(isHuman).length,ally:f.find(x=>x.ally).name};}));
  expect('in a crew fight Kael is drawn by his own look, and Qadir, the crew and Amri beside Kael by the cast',
    who.kael===60&&who.cast.Qadir===60&&Object.keys(who.cast).filter(n=>/Henchman/.test(n)).length===who.crew&&who.crew>=2&&who.cast[who.ally]===60,JSON.stringify(who));

  // ---- every room of the run ----
  const rooms=await ev(()=>{const out={};fight({back:true,deep:true,n:3,ally:false});
    const look=r=>{reset();step(60);out[r]={drawn:Object.keys(DRAWN.cast).sort().join(','),cm:Object.fromEntries(S.F.filter(f=>f.team===1).map(f=>[f.name,cm(f)])),skill:Object.fromEntries(S.F.filter(f=>f.team===1).map(f=>[f.name,f.skill]))};};
    look('dining');for(const r of ['kitchen','lobby','office']){clearNow();inRoom(r);look(r);}
    const X=S.F.find(f=>f.npc);out.office.exec=X?{drawn:!!DRAWN.cast[X.name],puppet:!!X.puppet,feet:Math.round(Math.max(X.p[FTF].y,X.p[FTB].y)),floor:Math.round(X.gr(X.p[FTF].x)),seat:Math.round(X.p[PEL].y)}:null;
    return out;});
  expect('the dining room\'s, kitchen\'s and lobby\'s elves, Kade and Mr. Hallowell are all drawn as the cast',
    rooms.dining.drawn==='Brask,Iyla,Qadir'&&rooms.kitchen.drawn==='Hesk,Odile,Orrin'&&rooms.lobby.drawn==='Doran,Kessa,Sable'&&/Kade/.test(rooms.office.drawn)&&/Hallowell/.test(rooms.office.drawn),
    JSON.stringify(['dining','kitchen','lobby','office'].map(r=>rooms[r].drawn)));
  const want={Qadir:192,Brask:194,Iyla:180,Orrin:196,Hesk:195,Odile:178,Sable:196,Doran:193,Kessa:186,Kade:198,'Mr. Hallowell':185};
  const got=Object.assign({},rooms.dining.cm,rooms.kitchen.cm,rooms.lobby.cm,rooms.office.cm);
  expect('each elf stands at his or her designed height',Object.keys(want).every(n=>Math.abs(got[n]-want[n])<=1),JSON.stringify(got));
  const ex=rooms.office.exec;
  expect('Mr. Hallowell still sits behind his desk with his feet on the floor',!!ex&&ex.drawn&&ex.puppet&&Math.abs(ex.feet-ex.floor)<=6&&ex.seat<ex.floor-20,JSON.stringify(ex));

  // ---- the crews ----
  const crews=await ev(()=>{const out={h:[],rooms:{}};fight({back:true,deep:true,crew:true,ally:false});
    const grab=r=>{reset();step(30);for(const f of S.F.filter(isHuman)){out.h.push(cm(f));out.rooms[castRoom(f)]=(out.rooms[castRoom(f)]||0)+1;}};
    grab('dining');for(const r of ['kitchen','lobby']){clearNow();inRoom(r);grab(r);}
    fight({arena:'street',crew:true});grab('street');
    out.kael=cm(S.F[0]);return out;});
  expect('every crew member is a human between 160 and 176 cm, dressed for his room, and the open-air crew for the street',
    crews.h.length>=8&&crews.h.every(h=>h>=159&&h<=177)&&crews.rooms.dining>=2&&crews.rooms.kitchen>=2&&crews.rooms.lobby>=2&&crews.rooms.street>=2,JSON.stringify(crews));
  expect('Kael keeps his own body',crews.kael===183,crews.kael);

  // ---- the ranks ----
  const ranks=await ev(()=>{const save=JSON.stringify([S.cfg.foes,S.cfg.foes2,S.cfg.foes3,S.cfg.boss]);
    for(const c of [...S.cfg.foes,...S.cfg.foes2,...S.cfg.foes3,S.cfg.boss])c.skill=1;
    const out={};fight({back:true,deep:true,n:3});const note=()=>{for(const f of S.F.filter(isElf))out[f.name]=f.skill;};note();
    for(const r of ['kitchen','lobby','office']){clearNow();inRoom(r);note();}
    fight({crew:true});out.crewNovices=S.F.filter(isHuman).some(f=>f.skill===1);
    const [a,b2,c,d]=JSON.parse(save);S.cfg.foes=a;S.cfg.foes2=b2;S.cfg.foes3=c;S.cfg.boss=d;
    out.defaults=[...S.cfg.foes,...S.cfg.foes2,...S.cfg.foes3,S.cfg.boss].map(x=>x.skill).join('');return out;});
  expect('set to Novice, the elves still fight at their floor: Trained, and Veteran for each room\'s leader',
    ranks.Qadir===3&&ranks.Brask===2&&ranks.Iyla===2&&ranks.Orrin===3&&ranks.Hesk===2&&ranks.Odile===2&&ranks.Sable===3&&ranks.Doran===2&&ranks.Kessa===2&&ranks.Kade===3,JSON.stringify(ranks));
  expect('the crews can still be Novices, and the defaults start the elves where the proposal put them',ranks.crewNovices&&ranks.defaults==='3223223224',JSON.stringify([ranks.crewNovices,ranks.defaults]));

  // ---- the bench ----
  const bench=await ev(()=>{S.arenaKey='restaurant';S.backroom=true;S.deep=true;S.cfg.n=3;S.cfg.crew=false;S.F=[];rosterBuild();restart();buildBench();
    const mins=[...document.querySelectorAll('.fcfg')].map(d=>{const r=d.querySelector('input[type=range]');return d.querySelector('b').textContent+':'+r.min+':'+r.value;});
    // a new body for Qadir changes his proportions, not his height
    const V=S.F[1],h0=cm(V);const nb=[...document.querySelectorAll('.fcfg')].find(d=>d.querySelector('b').textContent==='Qadir').querySelector('button.btn');nb.click();step(2);
    return{mins,h0,h1:cm(S.F[1]),seedChanged:S.F[1].seed!==5113,desc:document.querySelector('.fcfg .bdesc')?.textContent||''};});
  const minOf=n=>{const e=bench.mins.find(s=>s.startsWith(n+':'));return e?+e.split(':')[1]:null;};
  expect('the bench\'s skill sliders stop at each elf\'s floor and still start at Novice for Kael',
    minOf('Ilyas')===1&&minOf('Qadir')===3&&minOf('Brask')===2&&minOf('Iyla')===2&&minOf('Orrin')===3&&minOf('Hesk')===2&&minOf('Sable')===3&&minOf('Kade')===3,bench.mins.join(' '));
  expect('a new body for a named elf keeps his height',bench.seedChanged&&Math.abs(bench.h1-bench.h0)<=1,JSON.stringify([bench.h0,bench.h1]));

  // ---- the help ----
  const help=await ev(()=>{const how=[...document.querySelectorAll('.how li')].map(x=>x.textContent),txt=document.body.textContent;
    return{eh:how.find(x=>/^Elves and humans/.test(x))||'',grey:/grey suits/.test(txt),kitchen:/Hesk, a Trained keeper/.test(txt)&&/Odile, a Trained rusher/.test(txt)};});
  expect('the help says who is an elf and who a human, gives the floors and the heights, and has the kitchen\'s ranks as they are now',
    /every henchman a human/.test(help.eh)&&/below Trained/.test(help.eh)&&/Veteran or better/.test(help.eh)&&/178 to 198 cm/.test(help.eh)&&/160 to 176/.test(help.eh)&&!help.grey&&help.kitchen,help.eh.slice(0,140));

  // ---- the open arenas ----
  const outdoors=await ev(()=>{const out={};for(const a of ['street','field','ledge','hill','wall']){fight({arena:a,n:3});reset();step(30);out[a]=Object.keys(DRAWN.cast).sort().join(',');}return out;});
  expect('outside the restaurant, Qadir, Brask and Iyla are drawn as themselves in every arena',Object.values(outdoors).every(v=>v==='Brask,Iyla,Qadir'),JSON.stringify(outdoors));

  // ---- the old figures ----
  const classic=await ev(()=>drawAll(()=>{fight({crew:true,ally:true});S.classicLook=true;reset();step(20);const n=DRAWN.n+DRAWN.kael;S.classicLook=false;reset();step(5);return{off:n,on:DRAWN.n};}));
  expect('S.classicLook brings back every old figure, and switching it off brings the cast back',classic.off===0&&classic.on>=10,JSON.stringify(classic));

  // ---- whole runs ----
  const whole=await ev(()=>{const out={};for(const [k,o] of [['crew',{back:true,deep:true,crew:true,ally:true}],['three',{back:true,deep:true,n:3}],['field',{arena:'field',n:2}]]){fight(o);let n=0;while(S.game.phase!=='over'&&n<40000){step(1);n++;}out[k]={n,phase:S.game.phase,room:S.room};}return out;});
  expect('whole fights play out to the end with the cast: a crew run through every room, the three-elf run, and the open field',Object.values(whole).every(v=>v.phase==='over'),JSON.stringify(whole));

  // ---- the cost: in sk_perf_page.js, run on its own at the end of a full run (python3 test.py perf), where nothing else loads the machine ----

  // ---- a phone ----
  const ph=await open(390,844,3);
  const phone=await ph.evaluate(()=>drawAll(()=>{fight({crew:true,ally:true});reset();step(120);return{n:DRAWN.n,kael:DRAWN.kael};}));
  expect('on a phone the cast draws every frame',phone.n>=240&&phone.kael===120,JSON.stringify(phone));

  expect('no page errors',pageErrs.length===0,pageErrs.slice(0,3).join(' | '));
  console.log(rep.join('\n'));console.log(errs.length?`\n${errs.length} FAILED`:`\nall ${rep.length} checks passed`);
  await b.close();process.exit(errs.length?1:0);
})();
