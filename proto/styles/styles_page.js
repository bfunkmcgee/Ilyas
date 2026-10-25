// Checks for the motion styles test page (proto/styles): the page opens on its stage; every blow, in every style, lands, is blocked
// or is slipped as asked and plays to its end; the Wire drill is the style it says (the guard out on the line and wide, the blow
// bigger and carried further than the Sareth cut's) while the swordsman keeps the regular motion; the panel works; a fight plays.
// usage: node proto/styles/styles_page.js     (needs styles_test_page.html: python3 proto/styles/build_styles.py)
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const rep=[],errs=[];
function expect(label,cond,info){rep.push((cond?'ok   ':'FAIL ')+label+(info!==undefined&&info!==''?'  '+info:''));if(!cond)errs.push(label+(info!==undefined?' ('+info+')':''));}
(async()=>{const b=await chromium.launch({executablePath:fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined}),pageErrs=[];
  const p=await (await b.newContext({viewport:{width:1100,height:760}})).newPage();
  p.on('pageerror',e=>pageErrs.push(e.message));
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};window.__drawEvery=8;});
  await p.goto('file://'+path.join(__dirname,'styles_test_page.html'));await p.waitForTimeout(400);
  const ev=(fn,arg)=>p.evaluate(fn,arg);
  await ev(()=>{S.soundOn=false;window.__now=performance.now()+1000;
    window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(!f)continue;
      if((window.__fc=(window.__fc||0)+1)%8===0)f(window.__now);else{const R=window.render;window.render=()=>{};try{f(window.__now);}finally{window.render=R;}}}};
    // a blow on the stage, played to its end: what it was, how it came out, and Kael's reach and travel through it
    window.blow=(st,kind,out)=>{SLAB.style=st;SLAB.flourish=false;S.userSlow=false;slabBlow(kind,out);const K=S.F[0],ex=S.game.ex;if(!ex)return{none:true};
      // carry: how far the body goes on past where it was at the impact; hand: the weapon hand's farthest reach out from the chest
      const r={out:ex.res.out,name:ex.res.tech.name,end:K.action?K.action.end:0},t0=K.action?K.action.t0:S.t,Ti=ex.plan?ex.plan.Timp:0;let n=0,xi=null,mx=0,mh=0;
      while(n<900&&(S.game.ex||S.game.phase!=='input')){step(1);n++;if(xi===null&&S.t-t0>=Ti)xi=K.p[PEL].x;if(xi!==null)mx=Math.max(mx,(K.p[PEL].x-xi)*K.facing);
        mh=Math.max(mh,Math.abs(K.p[HAF].x-K.p[CHE].x));}
      return{...r,frames:n,done:!S.game.ex&&S.game.phase==='input'&&S.game.active===0,carry:Math.round(mx),hand:Math.round(mh),dummy:S.F[1].animStyle,hp:S.F[1].hp,wk:K.weaponKey};};});

  // ---- it opens on the stage ----
  const open=await ev(()=>{step(4);return{style:SLAB.style,on:SLAB.on,action:!!S.F[0].action,ex:!!S.game.ex,btn:!!document.querySelector('.su-btn'),story:!!S.story};});
  expect('the page opens on the stage, the Sareth cut picked, its cut playing, the Motion button up',open.on&&open.style==='tactical'&&open.ex&&open.btn&&!open.story,JSON.stringify(open));

  // ---- every blow, every style, every outcome ----
  const res={};let bad=[];
  for(const st of ['regular','tactical','wire'])for(const kind of ['slash','thrust','overhead','sweep'])for(const out of ['hit','block','dodge']){
    const r=await ev(([st,kind,out])=>blow(st,kind,out),[st,kind,out]);res[st+'/'+kind+'/'+out]=r;
    if(r.none||!r.done||r.out!==out&&!(out==='hit'&&r.out==='crit'))bad.push(st+'/'+kind+'/'+out+':'+JSON.stringify(r));}
  expect('every blow, in each style, comes out as asked and plays to its end, Kael\'s turn again',!bad.length,bad.slice(0,3).join(' | '));
  expect('the swordsman keeps the regular motion and is never put down',Object.values(res).every(r=>r.dummy==='regular'&&r.hp>0));

  // ---- the Wire drill is the style it says ----
  const g=await ev(()=>{const K=S.F[0],o={};for(const st of ['regular','tactical','wire']){SLAB.style=st;const q=styleGuard(K);o[st]={hx:q.hx,sf:q.sf,sb:q.sb,crouch:q.crouch,w:q.w};}return o;});
  expect('the Wire drill\'s guard is out on the line and wide: the hand further out, the feet wider, lower, the blade nearer level',
    g.wire.hx>g.tactical.hx*1.4&&g.wire.sf>g.tactical.sf*1.3&&g.wire.crouch<g.tactical.crouch&&g.wire.w>g.tactical.w,JSON.stringify(g));
  const cmp=k=>['regular','tactical','wire'].map(s=>res[s+'/'+k+'/hit']);
  const cut=cmp('slash'),thr=cmp('thrust');
  expect('the Wire drill\'s cut is carried further and lasts longer than the Sareth cut\'s',cut[2].carry>cut[1].carry&&cut[2].end>cut[1].end,JSON.stringify(cut.map(r=>[r.carry,+r.end.toFixed(2)])));
  expect('the Wire drill\'s thrust reaches further than the Sareth cut\'s',thr[2].hand>thr[1].hand,JSON.stringify(thr.map(r=>[r.carry,r.hand])));
  expect('Kael keeps his own blade through every blow',Object.values(res).every(r=>r.wk==='elven'),JSON.stringify(Object.values(res).map(r=>r.wk).filter(w=>w!=='elven').slice(0,3)));
  expect('the Sareth cut is quicker and tighter than the regular motion',cut[1].end<cut[0].end,JSON.stringify(cut.map(r=>+r.end.toFixed(2))));

  // ---- the panel ----
  const pan=await ev(()=>{document.querySelector('.su-btn').click();const P=document.querySelector('.su-panel'),open=!P.hidden&&S.paused;
    P.querySelector('[data-g="style"][data-v="wire"]').click();P.querySelector('[data-g="kind"][data-v="thrust"]').click();P.querySelector('.su-go').click();
    const ex=S.game.ex;return{open,closed:P.hidden&&!S.paused,style:SLAB.style,kind:ex&&ex.res&&ex.res.kind,label:document.querySelector('.su-btn').textContent};});
  expect('the panel opens, a style and a blow picked there play at once, and the button names the style',pan.open&&pan.closed&&pan.style==='wire'&&pan.kind==='thrust'&&/Wire drill/.test(pan.label),JSON.stringify(pan));
  // ---- a fight ----
  const f=await ev(()=>{SLAB.style='wire';suiFight();S.auto=true;let n=0;while(n<3000&&S.game.phase!=='over'){step(1);n++;}return{n,phase:S.game.phase,style:S.F[0].animStyle,on:SLAB.on};});
  expect('a fight plays with Kael in the style picked',!f.on&&f.style==='wire'&&f.n>200,JSON.stringify(f));
  expect('no page errors',!pageErrs.length,JSON.stringify(pageErrs.slice(0,3)));
  for(const l of rep)console.log(l);console.log('errors',errs.length,JSON.stringify(errs.slice(0,4)));await b.close();process.exit(errs.length?1:0);})();
