// The stances' motion (sk_stnmotion.js, since V70). Every variant of the whip's blows and of Close's hilt-ring, spine and hook is
// the one picked, plays to its end and gets its edge to the man (the chain's tip held on the blade's tip, the ring, the spine, the
// hook), and the variants of a blow are drawn back differently; the whirl goes round over his head; the spine's collar puts the free
// hand on the man's collar. A combo's leads run out to where the man's parry meets them and ring off it, the whip's chain with them,
// and the blow lands after them. Each stance's answer is acted out when the blow it answers misses (Bound beats a thrust aside and
// takes a cut on the locked blade, Close steps inside a swing, Unbound's chain catches the arm of a man coming in), the beat and the
// catch go with a Slip or a Step back, and the answer stands in place of the elf's evasion. None of it throws the game's dice, and
// with the motion off the moves come as before.
// usage: node sk_stnmotion_page.js   (ONLY=1,3 runs those parts alone)
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[],rep=[];
  const expect=(label,cond,info)=>{rep.push((cond?'ok   ':'FAIL ')+label+(info?'  '+info:''));if(!cond)errs.push(label+(info?' ('+info+')':''));};
  const p=await (await b.newContext({viewport:{width:1100,height:640}})).newPage();
  p.on('pageerror',e=>errs.push('page: '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts|ERR_|net::/.test(m.text()))errs.push('console: '+m.text());});
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+path.join(__dirname,process.env.PAGE||'test_page.html'));await p.waitForTimeout(400);
  await p.evaluate(()=>{S.soundOn=false;let a=17;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
    window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(!f)continue;
      const R=window.render;window.render=()=>{};try{f(window.__now);}finally{window.render=R;}}};
    window.mine=()=>{const g=S.game;return g.phase==='input'&&g.active===0&&!S.opening&&!isAI(0);};
    window.untilMine=max=>{let n=0;while(n<max&&!mine()){if(S.opening&&!isAI(S.opening.f.idx))resolveOpening(aiOpening(S.opening));step(1);n++;if(S.game.phase==='over')break;}return n;};
    // a forced outcome for the next attack roll (the die picked to give it)
    window.FORCE=[];const ra=resolveAttack;resolveAttack=function(A,D,kind,op,T){T=T||pickTechnique(A,D,kind);const want=FORCE.shift();if(!want)return ra(A,D,kind,op,T);
      const c=computeMods(A,D,kind,op,T);let pick=null;for(let v=2;v<20;v++){if(outcomeOf(v,v+c.bonus,c.def)===want){pick=v;break;}}if(pick==null)return ra(A,D,kind,op,T);
      const save=S.rng;let first=true;S.rng=()=>{if(first){first=false;return(pick-.5)/20;}return save();};try{return ra(A,D,kind,op,T);}finally{S.rng=save;}};
    // the game's dice thrown while a blow is planned
    window.PLAN_DICE=0;const pa=planAttack;planAttack=function(){const mr=Math.random,sr=S.rng;let n=0;Math.random=()=>{n++;return mr();};S.rng=()=>{n++;return sr();};
      try{return pa.apply(this,arguments);}finally{Math.random=mr;S.rng=sr;PLAN_DICE+=n;}};
    // one man to fight, who does not die, on his feet and at full balance when it is Ilyas's turn
    // (a new fight each time: the last one's blows leave men disarmed, held or down)
    window.ready=()=>{S.cfg.n=1;S.cfg.crew=false;S.F=[];restart();for(const f of S.F){f.maxHp=f.hp=999;}
      untilMine(6000);const K=hero(),D=S.F[1];if(D.downed)standUp(D);if(K.downed)standUp(K);for(const f of [K,D]){f.foot=footMaxOf(f);f.broken=null;f.daze=0;}D.glare=null;return mine();};
    window.stance=s=>{const b=document.querySelector(`#stnBar .stn-b[data-s="${s}"]`);if(b&&!b.disabled)b.click();step(2);return stanceOf(hero());};
    // A at gap past his striking distance from D, the two of them out in the open
    window.place=(A,D,gap)=>{const fa=Math.sign(D.station-A.station)||1,mid=W/2;D.station=clampSt(D,mid+fa*(engageGap(A,D)+gap)*.5);A.station=clampSt(A,D.station-fa*(engageGap(A,D)+gap));
      A.lane=A.dep=A.stepDep=D.lane=D.dep=D.stepDep=clamp(D.lane,DEP_MIN+20,DEP_MAX-20);A.build();D.build();step(14);};
    // the point a blow's edge meets him with: the chain's or the blade's tip, the ring at the end of the hilt, or a point along the blade
    window.edgeOf=(A,T)=>{const h=A.p[HAF],t=A.p[TIP],L=Math.hypot(t.x-h.x,t.y-h.y)||1,ux=(t.x-h.x)/L,uy=(t.y-h.y)/L;
      if(T.lash)return{x:t.x,y:t.y};const al=T.along!=null?T.along:A.wp.len*.8;return{x:h.x+ux*al,y:h.y+uy*al};};
    // his blow, played to its end: the variant and the combo picked, how near its edge came to the man at the impact (along its path from one frame to the next), how far the
    // drawn chain's end ever was from the blade's tip while the blow held, where his hand was at the top of the windup (from the chest)
    // and its highest point in the windup, where the leads met the man's parry and the chain's end then, and the flashes at them
    window.his=(st,kind,gap,force,out)=>{if(!ready())return{none:true};const K=hero(),D=S.F[1];if(stance(st)!==st)return{none:true,st:stanceOf(K)};place(K,D,gap);
      S.animForce=force||null;if(out)FORCE.push(out);const T0=pickTechnique(K,D,kind);document.getElementById('cmd-'+kind).click();
      let n=0;while(n<200&&!(S.game.ex&&S.game.ex.plan)){if(S.opening&&!isAI(S.opening.f.idx))resolveOpening('hold');step(1);n++;}
      S.animForce=null;const ex=S.game.ex;if(!ex||!ex.plan)return{none:true,n,tech:T0.name};
      const P=ex.plan,act=K.action,T=ex.res.tech,L=K.lash&&K.lash.t0===act.t0?K.lash:null,KA=attackTable(K).tilt;
      const wk=act.arm.filter(k=>k.t<P.Timp-1e-9&&k.v&&k.v.tilt===KA.wind).pop(),Tw1=wk?wk.t:null;
      const r={tech:T.name,key:T.key,out:ex.res.out,variant:P.anim.variant,combo:P.anim.combo,edge:1e9,pin:0,top:null,high:0,leads:[],off:1e9};
      const leads=L&&L.leads?L.leads.map(w=>({...w,pin:1e9,flash:false})):[],hits=P.combo?P.combo.hits:[];let flashes=0,e0=null;
      n=0;while(n<600&&S.game.ex===ex){step(1);n++;const u=S.t-act.t0;
        if(u>=P.Timp-.02&&u<=P.Td+.02){const e=edgeOf(K,T),C=P.Cfn();r.edge=Math.min(r.edge,segDist(C,e0||e,e));e0=e;}
        const W=K._whip,j=W?W.x.length-1:0;
        if(L&&W&&u>=L.b+.005&&u<L.c-.005){const d=Math.hypot(W.x[j]-K.p[TIP].x,W.y[j]-K.p[TIP].y);if(d>r.pin){r.pin=d;r.pinAt={u:+u.toFixed(3),a:+L.a.toFixed(3),b:+L.b.toFixed(3),c:+L.c.toFixed(3),
          win:(()=>{const w=whipWin(K,whipFrame(K));return w?(w.id===L?'main':'lead'):null;})(),R:+W.R.toFixed(1),rigid:W.rigid,mode:(arcState(K)||{}).mode};}}
        for(const w of leads)if(W&&u>=w.b+.005&&u<w.c-.005)w.pin=Math.min(w.pin,Math.hypot(W.x[j]-w.B.x,W.y[j]-w.B.y));
        for(const h of hits)if(Math.abs(u-h.IL)<.05&&S.flashes.some(f=>Math.hypot(f.x-h.B.x,f.y-h.B.y)<24))h._fl=true;
        if(Tw1!=null){const c=K.p[CHE],q=K.p[HAF];if(u<=Tw1+.01)r.high=Math.min(r.high,(q.y-c.y)/K.arm);if(!r.top&&u>=Tw1-.009)r.top={x:Math.round((q.x-c.x)*K.facing),y:Math.round(q.y-c.y)};}
        if(force&&force.variant==='collar'&&u>=P.Timp&&u<=P.Td+.06){const c=D.p[CHE],hd=D.p[HEAD],q=K.p[HAB],co={x:lerp(c.x,hd.x,.3),y:lerp(c.y,hd.y,.3)};r.off=Math.min(r.off,Math.hypot(q.x-co.x,q.y-co.y));}}
      r.edge=Math.round(r.edge*10)/10;r.pin=Math.round(r.pin*100)/100;r.high=+r.high.toFixed(2);
      r.leads=hits.map((h,i)=>({kind:h.kind,flash:!!h._fl,pin:leads[i]?Math.round(leads[i].pin*100)/100:null}));r.off=Math.round(r.off);return r;};
    // his man's blow on him: in Ilyas's stance, the blow and its outcome forced, his answer in the window; what the plan acts out for him,
    // and how it went: his hands and his pelvis against where the answer puts them, and the chain round the man's arm
    window.onHim=(st,kind,gap,out,answer,wp)=>{if(!ready())return{none:true};const K=hero(),E=S.F[1];if(stance(st)!==st)return{none:true,st:stanceOf(K)};
      if(wp&&E.weaponKey!==wp)E.setWeapon(wp);place(E,K,gap);
      const g=S.game;g.phase='input';g.active=E.idx;g.aiAt=null;S.opening=null;g.ex=null;setTgt(E,K.idx);E.intent=null;E._came=null;FORCE.push(out);
      if(!command(E.idx,kind))return{none:true,why:'command'};let n=0;while(n<200&&!(S.game.ex&&S.game.ex.plan)){if(S.opening&&S.opening.f===K)resolveOpening(answer||'parry');step(1);n++;}
      const ex=S.game.ex;if(!ex||!ex.plan)return{none:true,n};const P=ex.plan,R=K.action,x0=K.p[PEL].x,toE=Math.sign(E.station-K.station);
      const r={tech:ex.res.tech.name,out:ex.res.out,react:R&&R.stn||null,with:R&&R.stnWith||null,evade:null,inside:0,offArm:1e9,brace:1e9,beatMove:0,pin:1e9,wrap:false,lane0:K.lane};
      let meet=null;n=0;while(n<600&&S.game.ex===ex){step(1);n++;const u=S.t-R.t0;
        if(ex.evade)r.evade=ex.evade.style;
        if(Math.abs(u-P.Timp)<.03){r.inside=Math.max(r.inside,(K.p[PEL].x-x0)*toE);
          const a=stnForearm(E,.45),q=K.p[HAB];r.offArm=Math.min(r.offArm,Math.hypot(q.x-a.x,q.y-a.y));if(!meet&&u>=P.Timp-.02)meet={x:K.p[HAF].x,y:K.p[HAF].y};}
        if(u>=P.Timp&&u<=P.Timp+.2){const h=K.p[HAF],t=K.p[TIP],q=K.p[HAB],bb={x:lerp(h.x,t.x,.62),y:lerp(h.y,t.y,.62)};r.brace=Math.min(r.brace,Math.hypot(q.x-bb.x,q.y-bb.y));}
        if(meet&&u>=P.Timp+.06&&u<=P.Timp+.1)r.beatMove=Math.max(r.beatMove,Math.hypot(K.p[HAF].x-meet.x,K.p[HAF].y-meet.y));
        const C=K.stnCatch,W=K._whip;if(C&&W&&u>=C.b+.005&&u<C.c-.005){const j=W.x.length-1,fa=stnForearm(E,.62);r.pin=Math.min(r.pin,Math.hypot(W.x[j]-fa.x,W.y[j]-fa.y));
          const st=arcState(K);if(st&&st.wrap)r.wrap=true;}}
      r.lane1=K.lane;for(const k of ['inside','offArm','brace','beatMove','pin'])r[k]=Math.round(r[k]*10)/10;return r;};
    S.cfg.n=1;S.cfg.crew=false;S.F=[];restart();});

  const VAR=await p.evaluate(()=>Object.fromEntries(Object.entries(STN_VAR).map(([g,o])=>[g,Object.fromEntries(Object.entries(o).map(([k,l])=>[k,l.map(v=>v.key)]))])));
  // (ONLY=1,3 runs those parts alone)
  const on=k=>!process.env.ONLY||process.env.ONLY.split(',').includes(String(k));
  const distinct=(o,keys,d)=>{const t=keys.map(k=>o[k]&&o[k].top).filter(Boolean);for(let i=0;i<t.length;i++)for(let j=i+1;j<t.length;j++)if(Math.hypot(t[i].x-t[j].x,t[i].y-t[j].y)<d)return false;return t.length===keys.length;};
  let r;
  if(on(1)){
  // 1. the whip's blows, each variant: picked, the chain's tip on the man at the impact, held on the blade's tip, drawn back its own way
  const whip={};
  for(const kind of ['slash','overhead','thrust','sweep'])for(const v of VAR.whip[kind]){
    const r=await p.evaluate(([kind,v])=>his('unbound',kind,92,{variant:v},'hit'),[kind,v]);whip[kind+':'+v]=r;}
  // (reaches him: within 18 px of the point it is aimed at, in his chest or at his legs; the crack is a touch, the chain's end on him for
  // a frame or two)
  const wbad=Object.entries(whip).filter(([k,r])=>r.none||r.variant!==k.split(':')[1]||!(r.edge<18)||!(r.pin<2));
  expect('every variant of the whip\'s blows is picked, its chain\'s tip reaches the man and is held on the blade\'s tip ('+Object.keys(whip).length+')',!wbad.length,
    JSON.stringify(wbad.length?Object.fromEntries(wbad):Object.fromEntries(Object.entries(whip).map(([k,r])=>[k,r.tech+' '+r.edge]))));
  expect('the whip\'s throws are drawn back each their own way: from the side, over the head, backhand, low',distinct(whip,['slash:side','slash:over','slash:back','slash:low'],8),
    JSON.stringify(['side','over','back','low'].map(v=>whip['slash:'+v]&&whip['slash:'+v].top)));
  expect('the dart comes in line, from above, from below or off the wrist',distinct(whip,['thrust:line','thrust:high','thrust:low','thrust:snap'],8),
    JSON.stringify(['line','high','low','snap'].map(v=>whip['thrust:'+v]&&whip['thrust:'+v].top)));
  expect('the whirl goes round over his head before the high crack',whip['overhead:circle']&&whip['overhead:circle'].high<-.75,JSON.stringify({circle:whip['overhead:circle']&&whip['overhead:circle'].high,loop:whip['overhead:loop']&&whip['overhead:loop'].high}));
  }
  if(on(2)){
  // 2. Close's moves, each variant: picked, the ring, the spine or the hook on the man at the impact, drawn back its own way
  const close={};
  for(const [g,kind] of [['ring','slash'],['ring','overhead'],['spine','thrust'],['hook','sweep']])for(const v of VAR[g][kind]){
    const r=await p.evaluate(([kind,v])=>his('close',kind,-28,{variant:v},'hit'),[kind,v]);close[g+':'+kind+':'+v]=r;}
  // (the ring's end: as near as the plain blow gets it, the game's own, with the motion off)
  const plain=await p.evaluate(()=>{STN_MOTION.on=false;try{return{slash:his('close','slash',-28,null,'hit').edge,overhead:his('close','overhead',-28,null,'hit').edge};}finally{STN_MOTION.on=true;}});
  const lim=(g,kind)=>g==='ring'?Math.max(14,(plain[kind]||14)+10):14;
  const cbad=Object.entries(close).filter(([k,r])=>{const [g,kind,v]=k.split(':');return r.none||r.variant!==v||!(r.edge<lim(g,kind));});
  expect('every variant of the hilt-ring, the spine and the inside hook is picked and gets its edge to the man as the plain blow does ('+Object.keys(close).length+')',!cbad.length,
    JSON.stringify(cbad.length?{plain,...Object.fromEntries(cbad)}:{plain,...Object.fromEntries(Object.entries(close).map(([k,r])=>[k,r.tech+' '+r.edge]))}));
  expect('the ring is driven straight, hooked round or brought up from below, each drawn back its own way',distinct(close,['ring:slash:straight','ring:slash:hook','ring:slash:upper'],8),
    JSON.stringify(['straight','hook','upper'].map(v=>close['ring:slash:'+v]&&close['ring:slash:'+v].top)));
  expect('the spine with the free hand on his collar',close['spine:thrust:collar']&&close['spine:thrust:collar'].off<12,JSON.stringify(close['spine:thrust:collar']));
  }
  if(on(3)){
  // 3. the combos: the whip's flicks run out to where his parry meets them and ring off it; Close's short ring before the hammer
  r=await p.evaluate(()=>his('unbound','slash',92,{variant:'side',combo:['thrust:line','overhead:loop']},'hit'));
  expect('a whip combo: each flick of the chain runs out to his parry and rings off it, then the crack lands',!r.none&&r.combo&&r.combo.length===2&&r.leads.every(l=>l.flash&&l.pin<2.5)&&r.edge<18&&r.pin<2,JSON.stringify(r));
  r=await p.evaluate(()=>his('close','overhead',-28,{variant:'hammer',combo:['slash:straight']},'hit'));
  expect('a Close combo: a jab of the ring he parries, then the hammer lands',!r.none&&r.combo&&r.combo[0]==='slash:straight'&&r.leads.length===1&&r.leads[0].flash&&r.edge<45,JSON.stringify(r));
  }
  if(on(4)){
  // 4. the answers, acted out when the blow they answer misses
  r=await p.evaluate(()=>onHim('bound','thrust',4,'block','parry'));
  expect('Bound beats a thrust aside: the locked blade meets the point out in front and knocks it off its line',!r.none&&r.react==='beat'&&r.beatMove>6,JSON.stringify(r));
  r=await p.evaluate(()=>onHim('bound','slash',4,'block','parry'));
  expect('Bound takes a cut on the locked blade, the free hand braced on its back',!r.none&&r.react==='blade'&&r.brace<9,JSON.stringify(r));
  r=await p.evaluate(()=>onHim('close','overhead',4,'dodge','parry','sword'));
  expect('Close gets inside a swing: a step in under it with the free hand on his arm (in place of the elf\'s evasion)',!r.none&&r.react==='inside'&&r.inside>4&&r.offArm<16&&!r.evade,JSON.stringify(r));
  r=await p.evaluate(()=>onHim('close','overhead',4,'dodge','parry','axe'));
  expect('Close gets inside an axe\'s swing too, jammed on its haft',!r.none&&r.react==='inside'&&/Choked|Haft/.test(r.tech),JSON.stringify(r));
  r=await p.evaluate(()=>onHim('unbound','overhead',110,'dodge','parry','sword'));
  expect('Unbound catches the raised arm of a man coming in: the chain thrown round his forearm and wound on it',!r.none&&r.react==='catch'&&r.pin<2.5&&r.wrap&&!r.evade,JSON.stringify(r));
  r=await p.evaluate(()=>onHim('unbound','overhead',110,'dodge','slip','sword'));
  expect('with a Slip the catch goes with its footwork',!r.none&&r.react==='catch'&&r.with==='slip'&&r.pin<2.5,JSON.stringify(r));
  r=await p.evaluate(()=>onHim('bound','thrust',4,'dodge','back'));
  expect('with a Step back the beat goes with its footwork',!r.none&&r.react==='beat'&&r.with==='back',JSON.stringify(r));
  r=await p.evaluate(()=>onHim('close','overhead',4,'dodge','back','sword'));
  expect('a Step back is acted out as it is in Close (stepping inside is no part of it)',!r.none&&!r.react,JSON.stringify(r));
  }
  if(on(5)){
  // 5. the game's dice, and the motion off
  const dice=await p.evaluate(()=>PLAN_DICE);
  expect('none of it throws the game\'s dice: nothing is drawn from them while a blow is planned',dice===0,String(dice));
  r=await p.evaluate(()=>{STN_MOTION.on=false;try{return{whip:his('unbound','slash',92,{variant:'over'},'hit'),ans:onHim('bound','thrust',4,'block','parry')};}finally{STN_MOTION.on=true;}});
  expect('with the motion off the whip has no variant and the answer is the game\'s own',!r.whip.none&&r.whip.variant===null&&!r.ans.none&&!r.ans.react,JSON.stringify({w:r.whip.variant,a:r.ans.react}));
  }
  for(const l of rep)console.log(l);
  console.log('errors',errs.length,JSON.stringify(errs.slice(0,8)));
  await b.close();})();
