// The styles on the page (sk_stylesui.js, sk_css_styles.css; since V94), at a phone held upright: in the lab, the chip on the stance
// bar (his own style, the next a tap away), the Wire drill taken with a tap (a beat of tempo, its name over him and in the log, its
// count on his plate and the chip, its name on his plate's line), the chip shut while he cannot change, the count at a blow's impact
// with its line in the log, V back to his own, the Long count named in the dock and over him as he goes, the menu's Styles tab with
// each card, a sword in his hand, and the pick kept for the lab's next fight; in the prologue the chip, the pick in the night's flags,
// the drawer's two tabs, the next stage in it, and Continue after a reload in it; in Act I no chip and the cards as they were; and
// at each screen (upright, sideways, desktop) the chip and the plate's count where they belong: the stances keep their names whole.
// usage: node sk_styles_page.js [outdir]   (stills of each screen go to outdir when one is named)
const SK_T0=Date.now();
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const OUT=process.argv[2]||null;if(OUT)fs.mkdirSync(OUT,{recursive:true});
const SIZES={port:{w:390,h:844,dpr:2,mob:true},land:{w:844,h:390,dpr:2,mob:true},desk:{w:1440,h:900,dpr:1,mob:false}};
const rep=[],errs=[];
function expect(label,cond,info){rep.push((cond?'ok   ':'FAIL ')+label+(process.env.SK_TIMING?' ['+((Date.now()-SK_T0)/1000).toFixed(1)+'s]':'')+(info!==undefined&&info!==''?'  '+info:''));if(!cond)errs.push(label+(info!==undefined?' ('+info+')':''));}
(async()=>{
  const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),pageErrs=[];
  // the page on the fake clock with the dice seeded, after every load (a reload is a visit later on)
  const setup=async p=>{await p.waitForTimeout(300);await p.evaluate(()=>{S.soundOn=false;let a=29;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
    window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    window.fast=k=>{const R=window.render;window.render=()=>{};try{step(k);}finally{window.render=R;}};
    // his turn: scenes skipped, lines read on, the windows on him answered (a parry, else let pass), and nobody he faces put down
    window.mine=()=>{const g=S.game;return!!g&&g.phase==='input'&&g.active===0&&!S.opening&&!S.cut&&!isAI(0)&&(!S.story||S.story.step==='fight');};
    window.untilMine=max=>{let n=0;while(n<max&&!mine()){if(S.cut&&S.cut.skip)cutSkip();if(S.say&&typeof storyAdvance==='function')storyAdvance();
      if(S.opening&&!isAI(S.opening.f.idx))resolveOpening(S.opening.source==='react'?'parry':'hold');
      for(const f of S.F)if(f&&f.team===1&&!f.npc&&f.maxHp<9999)f.hp=f.maxHp=9999;fast(1);n++;if(S.game&&S.game.phase==='over')break;}return n;};
    window.draw=()=>{stnUiNow();updateStatus();step(2);};
    // the roll of a blow of his, a plain hit (inside the blow's own resolution); the answer a man gives, as wanted
    window.FORCE=null;window.ANS=new Map();
    {const ra=resolveAttack;resolveAttack=function(A,D,kind,opening,T){if(!FORCE||A!==FORCE.A)return ra.apply(this,arguments);
      const c=computeMods(A,D,kind,opening,T||pickTechnique(A,D,kind));let v=20;for(let i=2;i<=19;i++){const t=i+c.bonus;if(t>=c.def&&!isCrit(i,t,c.def)){v=i;break;}}
      const save=S.rng;let first=true;S.rng=()=>{if(first){first=false;return(v-.5)/20;}return save();};try{return ra.apply(this,arguments);}finally{S.rng=save;}};}
    {const ar=aiReact;aiReact=function(D){return ANS.has(D)?ANS.get(D):ar.apply(this,arguments);};}
    window.chip=()=>document.querySelector('#stnBar .sty-b');
    window.chipInfo=()=>{const c=chip(),bar=document.getElementById('stnBar');if(!c||!bar||bar.hidden)return null;const n=c.querySelector('.sty-n');
      return{name:n.textContent,next:c.dataset.style,x:(c.querySelector('.sty-x')||{}).textContent||'',pips:c.querySelectorAll('.sty-m i').length,on:c.querySelectorAll('.sty-m i.on').length,dis:c.disabled,whole:n.scrollWidth<=n.clientWidth+1};};
    window.plateM=()=>{const K=hero(),fr=document.getElementById('fr'+K.idx),m=fr&&fr._fm;if(!m||m.hidden||!m.isConnected)return null;
      return{n:m.querySelectorAll('i.on').length,max:m.querySelectorAll('i').length,title:m.title};};
    window.notes=()=>[...document.querySelectorAll('#log .lg-note')].map(d=>d.textContent);
    window.logHas=t=>(document.getElementById('log').textContent||'').includes(t);
    window.called=t=>S.callouts.some(c=>c.text===t);
    window.tq=k=>(document.getElementById('t-'+k)||{}).textContent||'';
    // where the chip and the plate's count sit: inside their own, over nothing else, each stance's name whole
    window.geo=()=>{const bar=document.getElementById('stnBar'),c=chip(),R=e=>{const r=e.getBoundingClientRect();return{l:r.left,r:r.right,t:r.top,b:r.bottom,w:r.width,h:r.height};};
      const over=(a,b)=>a.l<b.r-1&&b.l<a.r-1&&a.t<b.b-1&&b.t<a.b-1,btns=[...bar.querySelectorAll('.stn-b')].map(R),cr=c?R(c):null,br=R(bar);
      const K=hero(),fr=document.getElementById('fr'+K.idx),m=fr&&fr._fm,F=fr?R(fr):null,M=m&&!m.hidden?R(m):null;
      const others=fr?[...fr.querySelectorAll('.fpips > *, .hpbar, .hp, .fname')].map(R).filter(r=>r.w>0):[];
      return{chip:cr&&{w:Math.round(cr.w),h:Math.round(cr.h),stanceH:Math.round(btns[0].h),inBar:cr.l>=br.l-1&&cr.r<=br.r+1&&cr.t>=br.t-1&&cr.b<=br.b+1,onStance:btns.some(b=>over(cr,b)),
          above:btns.every(b=>b.t>=cr.b-1),beside:btns.every(b=>b.l>=cr.r-1)},
        names:[...bar.querySelectorAll('.stn-b .stn-n')].every(n=>n.scrollWidth<=n.clientWidth+1),wide:bar.scrollWidth>bar.clientWidth+1,inView:br.r<=innerWidth+1&&br.l>=-1,
        meter:M&&{inPlate:M.l>=F.l&&M.r<=F.r&&M.t>=F.t&&M.b<=F.b,onOther:others.some(o=>over(M,o)),w:Math.round(M.w),h:Math.round(M.h)}};};
    // the lab: a man with a sword, a step off, on the open street
    window.lab=()=>{S.cfg.n=1;S.cfg.crew=false;S.cfg.ally.on=false;S.arenaKey='street';S.tableOn=false;S.cfg.hero.weapon='elven';
      S.cfg.foes[0]={seed:5113,weapon:'sword',skill:3,temper:'plain'};S.F=[];restart();};});};
  const open=async sz=>{const Z=SIZES[sz],ctx=await b.newContext({viewport:{width:Z.w,height:Z.h},deviceScaleFactor:Z.dpr,isMobile:Z.mob,hasTouch:Z.mob}),p=await ctx.newPage();
    p.on('pageerror',e=>pageErrs.push(sz+': '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts|ERR_|net::/.test(m.text()))pageErrs.push(sz+' console: '+m.text());});
    await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
    await p.goto('file://'+path.join(__dirname,process.env.PAGE||'test_page.html'));await setup(p);return p;};
  const ev=(p,fn,arg)=>p.evaluate(fn,arg);
  const shot=async(p,name)=>{if(!OUT)return;await ev(p,()=>{draw();step(2);});await p.waitForTimeout(120);await p.screenshot({path:`${OUT}/${name}.png`});};

  // ================= the lab, upright =================
  let p=await open('port');
  let m=await ev(p,()=>{lab();untilMine(6000);draw();return{mine:mine(),style:styleOf(hero()),c:chipInfo(),g:geo()};});
  expect('the lab: the chip on the stance bar on his turn, his own style named, the Wire drill a tap away',m.mine&&m.style==='sareth'&&!!m.c&&m.c.name==='Sareth cut'&&m.c.next==='wire'&&
    m.c.x==='⇄ Wire drill'&&m.c.pips===0&&!m.c.dis&&m.c.whole,JSON.stringify(m.c));
  expect('upright: the chip a row of its own over the three stances, their names whole, nothing past the screen',!!m.g.chip&&m.g.chip.inBar&&!m.g.chip.onStance&&m.g.chip.above&&m.g.chip.h<=34&&m.g.names&&!m.g.wide&&m.g.inView,JSON.stringify(m.g));
  await shot(p,'port_1_lab');
  // a tap
  m=await ev(p,()=>{const K=hero(),r0=K.ready,log0=logHas('fights in Wire drill');chip().click();fast(1);const cal=called('Wire drill');draw();
    return{style:styleOf(K),anim:K.animStyle,tempo:K.ready-r0,cal,log0,log:logHas('fights in Wire drill')&&logHas(STYLES.wire.doctrine),c:chipInfo(),pm:plateM(),meta:document.getElementById('meta'+K.idx).textContent,lab:STYLE_PICK.lab,g:geo()};});
  expect('a tap: the Wire drill, in its own motion, for a beat of tempo',m.style==='wire'&&m.anim==='wire'&&m.tempo===10,JSON.stringify({s:m.style,a:m.anim,t:m.tempo}));
  expect('its name over him and a line in the log with its doctrine',m.cal&&!m.log0&&m.log,JSON.stringify({cal:m.cal,log:m.log}));
  expect('the chip: the Wire drill, its count (an Expert\'s 3, empty), the Sareth cut next',!!m.c&&m.c.name==='Wire drill'&&m.c.next==='sareth'&&m.c.x==='⇄ Sareth cut'&&m.c.pips===3&&m.c.on===0,JSON.stringify(m.c));
  expect('his plate: the count beside the balance pips, and the style ahead of the weapon on its line',!!m.pm&&m.pm.max===3&&m.pm.n===0&&m.pm.title==='Count 0 of 3'&&m.meta.startsWith('Wire drill · '),JSON.stringify({pm:m.pm,meta:m.meta}));
  expect('upright: the count inside his plate, over nothing else on it',!!m.g.meter&&m.g.meter.inPlate&&!m.g.meter.onOther,JSON.stringify(m.g.meter));
  expect('the pick kept for the lab\'s next fight',m.lab==='wire');
  await shot(p,'port_2_wire');
  // a blow that lands: the chip shut while it goes, the count at its impact
  m=await ev(p,()=>{const K=hero(),D=targetOf(K);ANS.set(D,'parry');FORCE={A:K};const n0=notes().length;humanCommand('slash');fast(2);draw();const shut=chipInfo();let n=0;
    while(n<900&&!(K.meter&&K.meter.n>0)&&S.game.phase==='exchange'){fast(1);n++;}draw();const at={pm:plateM(),c:chipInfo(),notes:notes().slice(n0)};FORCE=null;ANS.delete(D);
    return{shut:shut&&shut.dis,n,count:wireCount(K),...at};});
  expect('the chip shut while the blow goes',m.shut===true);
  expect('the count at the blow\'s impact: 1 on his plate and on the chip, and in the log',m.count===1&&!!m.pm&&m.pm.n===1&&m.pm.title==='Count 1 of 3'&&!!m.c&&m.c.on===1&&
    m.notes.includes('Ilyas: Count 1, a new cut'),JSON.stringify(m));
  // V on his turn: his own again
  m=await ev(p,()=>{untilMine(6000);draw();return{mine:mine(),c:chipInfo()};});
  await p.keyboard.press('v');
  m=await ev(p,()=>{draw();const K=hero();return{style:styleOf(K),c:chipInfo(),pm:plateM(),meta:document.getElementById('meta'+K.idx).textContent,log:logHas('fights in The Sareth cut')};});
  expect('V on his turn: the Sareth cut again, the count gone from his plate and its name from the line',m.style==='sareth'&&!!m.c&&m.c.name==='Sareth cut'&&!m.pm&&!m.meta.startsWith('Wire drill')&&m.log,JSON.stringify(m));
  // the Long count: named in the dock at a full count, over him as he goes, the Aether and the count spent
  m=await ev(p,()=>{const K=hero(),D=targetOf(K);setStyle(K,'wire');K.meter={k:'wire',n:3,t:S.t};K.aether=MAGIC.max;draw();const dock=tq('thrust'),a0=K.aether;
    ANS.set(D,'parry');FORCE={A:K};humanCommand('thrust');let cal=called('Long count'),n=0;while(n<600&&!cal&&S.game.phase==='exchange'){fast(1);n++;cal=called('Long count');}
    FORCE=null;ANS.delete(D);draw();return{dock,cal,spent:a0-K.aether,count:wireCount(K),pm:plateM()};});
  expect('the Long count: named in the dock at a full count, called over him as he goes, 1 Aether and the count spent',m.dock==='Long count'&&m.cal&&m.spent===1&&m.count===0&&!!m.pm&&m.pm.n===0,JSON.stringify(m));
  // the menu's Styles tab
  m=await ev(p,()=>{untilMine(6000);hudMenu(true);step(2);const side=hudEl('sideCol'),tabs=[...side.querySelectorAll('.drawer-tabs button')].filter(b=>b.offsetParent!==null).map(b=>b.dataset.dtab);
    side.querySelector('.drawer-tabs [data-dtab="styles"]').click();step(2);const pane=side.querySelector('.pm-styles'),lead=pane.querySelector('.a9-lead').textContent;
    const cards=[...pane.querySelectorAll('.a9-card')].map(c=>({k:c.dataset.style,h:c.querySelector('h3').textContent,now:c.querySelector('.a9-now').textContent,lv:(c.querySelector('.a9-lv')||{}).textContent||'',
      mt:(c.querySelector('.a9-mt')||{}).textContent||'',ms:(c.querySelector('.a9-ms')||{}).textContent||'',wh:(c.querySelector('.a9-wh')||{}).textContent||'',
      li:c.querySelectorAll('.a9-moves li').length,got:c.querySelectorAll('.a9-moves li.got').length,sig:(c.querySelector('.a9-moves li.sig .a9-m')||{}).textContent||''}));
    const r={tabs,shown:getComputedStyle(pane).display!=='none',lead,cards,what:STYLES.wire.what};return r;});
  await shot(p,'port_3_styles_tab');
  await ev(p,()=>{hudMenu(false);step(2);});
  {const w=m.cards[0]||{},s=m.cards[1]||{};
    expect('the lab\'s menu: a Styles tab between the arena and the codex',m.tabs.join()==='fight,arena,styles,codex'&&m.shown,JSON.stringify(m.tabs));
    expect('its cards: the styles he has, in order, under the lab\'s line',m.cards.map(c=>c.k).join()==='wire,sareth'&&m.lead==='How he fights: each style its own, with its own level.',JSON.stringify(m.cards.map(c=>c.k)));
    expect('the Wire drill\'s card: in use, its level alone in the lab, how it looks, its count, its ranks to the Long count (its signature), its mastery',
      w.now==='Expert, in use'&&w.lv==='Level 13 · Expert'&&w.wh===m.what&&w.mt.startsWith('Count, 0 to 3: ')&&w.li===5&&w.got===4&&w.sig==='The Long count'&&w.ms==='Mastered: Step back +1, in any style.',JSON.stringify(w));
    expect('the Sareth cut\'s card: ready, a Master, no meter',s.h==='The Sareth cut'&&s.now==='Master, ready'&&s.lv==='Level 17 · Master'&&!s.mt&&s.li===0,JSON.stringify(s));}
  // a sword in his hand: one style, no chip; the lab's next fight with the arc-blade starts in the pick
  m=await ev(p,()=>{S.cfg.hero.weapon='sword';S.F=[];restart();untilMine(6000);draw();const a={style:styleOf(hero()),c:chipInfo(),n:stylesFor(hero()).length};
    S.cfg.hero.weapon='elven';S.F=[];restart();untilMine(6000);draw();return{...a,next:styleOf(hero()),c2:chipInfo()};});
  expect('a sword in his hand: his own, and no chip (one style)',m.style==='sareth'&&!m.c&&m.n===1,JSON.stringify(m));
  expect('the arc-blade again: the lab\'s next fight starts in the Wire drill',m.next==='wire'&&!!m.c2&&m.c2.name==='Wire drill',JSON.stringify(m.c2));
  await ev(p,()=>{STYLE_PICK.lab=null;});

  // ================= the prologue =================
  m=await ev(p,()=>{storyMenu(true);storyGo('dining');untilMine(9000);draw();const K=hero();const c=chipInfo();
    chip().click();fast(1);draw();hudMenu(true);step(2);const side=hudEl('sideCol'),tabs=[...side.querySelectorAll('.drawer-tabs button')].filter(b=>b.offsetParent!==null).map(b=>b.dataset.dtab);
    const at0=HUD.dtab;side.querySelector('.drawer-tabs [data-dtab="styles"]').click();step(2);updateStatus();step(2);const held=HUD.dtab;
    const cards=[...side.querySelectorAll('.pm-styles .a9-card')].map(e=>e.dataset.style+': '+e.querySelector('.a9-now').textContent);
    const lv=(side.querySelector('.pm-styles .a9-card[data-style="wire"] .a9-lv')||{}).textContent;hudMenu(false);step(2);hudMenu(true);step(2);const again=HUD.dtab;hudMenu(false);step(2);
    return{key:S.story.key,mine:mine(),c,style:styleOf(K),flag:S.story.flags.style,tabs,cards,lv,at0,held,again};});
  expect('the prologue: the chip in the night\'s fights, his own first',m.key==='dining'&&m.mine&&!!m.c&&m.c.name==='Sareth cut',JSON.stringify({key:m.key,c:m.c}));
  expect('the pick goes in the night\'s flags',m.style==='wire'&&m.flag==='wire');
  expect('the prologue\'s menu opens on the codex as before; the Styles tab, once chosen, holds while it is open',m.at0==='codex'&&m.held==='styles'&&m.again==='codex',JSON.stringify([m.at0,m.held,m.again]));
  expect('the prologue\'s menu: the Styles tab beside the codex, its cards with the night\'s level in each',m.tabs.join()==='styles,codex'&&m.cards.join(' / ')==='wire: Expert, in use / sareth: Master, ready'&&/^Level 13 · Expert · \d+ of \d+ to the next$/.test(m.lv||''),JSON.stringify(m));
  await shot(p,'port_4_prologue');
  m=await ev(p,()=>{storyStage('kitchen');untilMine(9000);draw();const k=JSON.parse(localStorage.getItem('ilyas.night')||'null');return{key:S.story.key,style:styleOf(hero()),c:chipInfo(),kept:k&&k.cp&&k.cp.key,flag:k&&k.cp&&k.cp.flags&&k.cp.flags.style};});
  expect('the next stage begins in it, and the record kept there has it',m.key==='kitchen'&&m.style==='wire'&&!!m.c&&m.c.name==='Wire drill'&&m.kept==='kitchen'&&m.flag==='wire',JSON.stringify(m));
  await p.reload();await setup(p);await ev(p,()=>{if(!S.story)storyMenu(true);step(2);});
  await p.click('#stContinue');
  m=await ev(p,()=>{untilMine(9000);draw();return{key:S.story&&S.story.key,style:styleOf(hero()),c:chipInfo()};});
  expect('Continue after a reload: the night goes on in the Wire drill',m.key==='kitchen'&&m.style==='wire'&&!!m.c&&m.c.name==='Wire drill',JSON.stringify(m));

  // ================= Act I =================
  m=await ev(p,()=>{storyGo('sh2');fast(90);draw();a9Fill();const now=[...document.querySelectorAll('#a9Cards .a9-card .a9-now')].map(e=>e.textContent);return{key:S.story.key,c:chipInfo(),style:styleOf(hero()),now};});
  expect('Act I: no chip (Short Hand is all he has), and the cards as they were',m.key==='sh2'&&!m.c&&m.style==='shorthand'&&m.now.join(' | ')==='Novice, learning | Dark: needs the gilt | Locked: needs two hands',JSON.stringify(m));
  await p.context().close();

  // ================= sideways and the desktop =================
  for(const sz of ['land','desk']){p=await open(sz);
    m=await ev(p,()=>{lab();untilMine(6000);draw();chip().click();fast(1);hero().meter={k:'wire',n:2,t:S.t};draw();return{c:chipInfo(),pm:plateM(),g:geo()};});
    expect(sz+': the chip beside the three stances and as low, inside the bar, their names whole',!!m.g.chip&&m.g.chip.inBar&&!m.g.chip.onStance&&m.g.chip.beside&&m.g.chip.h<=m.g.chip.stanceH+1&&
      m.g.names&&!m.g.wide&&m.g.inView&&m.c.whole,JSON.stringify(m.g.chip));
    expect(sz+': the count inside his plate, over nothing else on it',!!m.pm&&m.pm.n===2&&!!m.g.meter&&m.g.meter.inPlate&&!m.g.meter.onOther,JSON.stringify({pm:m.pm,g:m.g.meter}));
    await shot(p,sz+'_wire');
    await p.context().close();}

  expect('no page errors',pageErrs.length===0,pageErrs.slice(0,3).join(' | '));
  console.log(rep.join('\n'));console.log(errs.length?`\n${errs.length} FAILED`:`\nall ${rep.length} checks passed`);
  console.log('errors '+errs.length+' '+JSON.stringify(errs));
  await b.close();process.exit(errs.length?1:0);
})();
