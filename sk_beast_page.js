// The goblins' three kinds, and the two things done to a goblin that go by its body: the toss and the cut in half (envx/beasts.js
// body and size, sk_beast.js; the kinds since Nov 10), at a phone held upright. A goblin's temper and seed say which kind it is and
// each kind keeps to its own sizes; the drawing's unit is the game's; a goblin of the old kind is the body it was. Then in the lab,
// with the smallest runt there is, a skulker and the biggest brute: he can get a hand on each, the odds of the throw go by its
// weight, a throw that takes carries it up and over and lands it where the throw was aimed, one that fails leaves it on its feet, a
// goblin thrown into another bowls it over; a cutting blow that kills takes each in two (the slash at the waist, the sweep low, the
// blow from above high), the two halves hold together as halves and come to rest on the floor, and all of it draws.
// usage: node sk_beast_page.js [outdir]   (stills of each part go to outdir when one is named)
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const OUT=process.argv[2]||null;if(OUT)fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[],rep=[];
  const expect=(label,cond,info)=>{rep.push((cond?'ok   ':'FAIL ')+label+(info?'  '+info:''));if(!cond)errs.push(label+(info?' ('+info+')':''));};
  const p=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true})).newPage();
  p.on('pageerror',e=>errs.push('page: '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts|ERR_|net::/.test(m.text()))errs.push('console: '+m.text());});
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+path.join(__dirname,process.env.PAGE||'test_page.html'));await p.waitForTimeout(400);
  await p.evaluate(()=>{S.soundOn=false;let a=13;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
    window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    window.fast=k=>{const R=window.render;window.render=()=>{};try{step(k);}finally{window.render=R;}};
    window.mine=()=>{const g=S.game;return g.phase==='input'&&g.active===0&&!S.opening&&!isAI(0);};
    // on to his turn: a window on him is answered by his own read, a turn on the floor or in a hold is spent getting out of it
    window.untilMine=max=>{let n=0;const K=hero();while(n<max){if(S.game.phase==='over')break;if(mine()&&!K.downed&&!K.clinch)break;
      if(S.opening&&!isAI(S.opening.f.idx))resolveOpening(aiOpening(S.opening));if(mine()&&K.downed)humanCommand('guard');else if(mine()&&K.clinch)humanCommand('shove');fast(1);n++;}return n;};
    const G=(seed,temper)=>BeastLook.body('goblin',genBody(seed),seed,temper);window.gob=G;
    // the smallest runt, the biggest brute and a middling skulker of the first 6000 seeds
    window.pickSeeds=()=>{let runt=null,brute=null,sk=null;
      for(let s=1;s<=6000;s++){const r=G(s,'rusher'),t=G(s,'brute'),m=r.tall*r.bulk,n=t.tall*t.bulk;
        if(r.gob==='runt'&&(!runt||m<runt.m))runt={seed:s,temper:'rusher',m};if(t.gob==='brute'&&(!brute||n>brute.m))brute={seed:s,temper:'brute',m:n};
        if(!sk&&t.gob==='skulker'&&Math.abs(t.tall-112.5)<1&&Math.abs(t.bulk-.79)<.01)sk={seed:s,temper:'brute',m:n};}
      return{runt,skulker:sk,brute};};
    // a fight in the lab's field against goblins: each {seed,temper,weapon}
    window.fight=gs=>{S.arenaKey='field';S.tableOn=false;S.divOn=false;S.cfg.n=gs.length;S.cfg.crew=false;S.cfg.ally.on=false;S.cfg.hero.weapon='elven';if(S.gore==='off')S.gore=window.__gore;
      gs.forEach((g,i)=>Object.assign(S.cfg.foes[i],{seed:g.seed,temper:g.temper,weapon:g.weapon||'shiv',skill:1}));
      S.F=[];rosterBuild();S.F.forEach(f=>{if(f.team===1){f.beast='goblin';f.name='Goblin';}});restart();untilMine(6000);
      const K=hero();K.hp=K.maxHp;K.foot=footMaxOf(K);K.daze=0;const gl=S.F.filter(f=>f.team===1);for(const f of gl)f.maxHp=f.hp=16;return gl;};
    // the two of them face to face at blade's length (or at a set distance), the others out of the way
    window.face=(D,gap)=>{const K=hero(),z=100;for(const f of S.F)if(f.team===1&&f!==D){f.station=clampSt(f,W-60,z+50);f.lane=f.dep=f.stepDep=z+50;f.build();}
      K.station=W/2-80;D.station=K.station+(gap||engageGap(K,D));for(const f of [K,D]){f.lane=f.dep=f.stepDep=z;f.downed=false;f.clinch=null;f.guarding=false;f.counter=false;f.daze=0;f.action=null;}
      K.facing=1;D.facing=-1;K.foot=footMaxOf(K);D.foot=footMaxOf(D);K.build();D.build();fast(40);S.game.tgt=D.idx;K.tgt=D.idx;};
    window.sane=f=>f.p.every(q=>isFinite(q.x)&&isFinite(q.y)&&q.x>-200&&q.x<W+200&&q.y>-600&&q.y<900);
    window.__gore=S.gore;window.withRng=(v,fn)=>{const r=S.rng;S.rng=()=>v;try{return fn();}finally{S.rng=r;}};});
  const shot=async name=>{if(!OUT)return;await p.evaluate(()=>step(2));await p.waitForTimeout(120);await p.screenshot({path:`${OUT}/${name}.png`});};

  // 1. the kinds
  let r=await p.evaluate(()=>{const K=BeastLook.GOB_KIND,out={n:{rusher:{},brute:{},plain:{},keeper:{}},bad:[],unit:0,old:0};
    for(let s=1;s<=3000;s++)for(const t of ['rusher','brute','plain','keeper']){const o=gob(s,t),k=K[o.gob];out.n[t][o.gob]=(out.n[t][o.gob]||0)+1;
      if(!k||o.tall<k.H[0]-.01||o.tall>k.H[1]+.01||o.bulk<k.bulk[0]-.001||o.bulk>k.bulk[1]+.001||o.headR<k.head[0]-.01||o.headR>k.head[1]+.01)out.bad.push([s,t,o.gob]);
      const F={beast:'goblin',body:o};out.unit=Math.max(out.unit,Math.abs(BeastLook.size(F)-beastSz(F)));
      // a skulker is the goblin there was: 106 to 119 cm and .72 to .86, its arms and legs in the old shares
      if(o.gob==='skulker'&&(o.tall<106||o.tall>119||o.bulk<.72||o.bulk>.86||Math.abs(o.th+o.sh+o.torso+o.neck+o.headR-o.tall)>.01))out.old++;}
    const a=gob(8101,'rusher'),c=gob(8133,'brute');out.first=[a.gob,Math.round(a.tall),c.gob,Math.round(c.tall)];out.kinds=Object.keys(K);
    const L=BeastLook.size({beast:'lizard',body:BeastLook.body('lizard',genBody(8501),8501,'brute')}),Lb=BeastLook.body('lizard',genBody(8501),8501,'brute');out.liz=[Math.round(Lb.tall),+Lb.bulk.toFixed(2),+L.toFixed(3),+(Lb.h*(.93+.07*Lb.bulk)).toFixed(3)];
    return out;});
  const share=(t,k)=>(r.n[t][k]||0)/3000;
  expect('three kinds of goblin, each inside its own sizes',r.kinds.join()==='skulker,runt,brute'&&r.bad.length===0,JSON.stringify(r.bad.slice(0,3)));
  expect('a rusher is a runt or a skulker, a brute a brute or a skulker, any other temper a skulker',!r.n.rusher.brute&&!r.n.brute.runt&&share('rusher','runt')>.48&&share('rusher','runt')<.62&&share('brute','brute')>.63&&share('brute','brute')<.77&&share('plain','skulker')===1&&share('keeper','skulker')===1,JSON.stringify(r.n));
  expect('a skulker is the goblin there was (106 to 119 cm, .72 to .86 in the build)',r.old===0,String(r.old));
  expect('the drawing\'s unit is the game\'s, for every goblin',r.unit<1e-9,String(r.unit));
  expect('the line\'s first two are a runt and a brute',r.first[0]==='runt'&&r.first[2]==='brute'&&r.first[3]-r.first[1]>25,JSON.stringify(r.first));
  expect('the lizard-man is who he was',r.liz[0]>=206&&r.liz[0]<=218&&r.liz[2]===r.liz[3],JSON.stringify(r.liz));

  // 2. the toss, on the smallest runt, a skulker and the biggest brute
  const seeds=await p.evaluate(()=>pickSeeds());
  expect('a smallest runt, a middling skulker and a biggest brute to try',!!(seeds.runt&&seeds.skulker&&seeds.brute),JSON.stringify(seeds));
  const odds={};
  for(const kind of ['runt','skulker','brute']){
    r=await p.evaluate(g=>{const [D]=fight([g]),K=hero();face(D);const ti=tossInfo(K,D),ok=cmdValid(K,D,'toss'),c=tossMods(K,D),need=c.dc-c.bonus,hp0=D.hp,x0=D.p[PEL].x,g0=D.gr(x0);
      const o={kind:D.body.gob,cm:Math.round(D.body.tall),bulk:+D.body.bulk.toFixed(2),ti:ti&&{x:Math.round(ti.x),hz:ti.hazard&&ti.hazard.kind},ok,build:(c.mods.find(m=>m[0]==='build')||[])[1],need,chance:Math.round(clamp(21-Math.max(2,need),1,19)/20*100),slot:slotAction(K,D,'advance')};
      if(!ti||!ok)return o;
      const done=withRng(.72,()=>command(0,'toss')),ex=S.game.ex;window.__ex=ex;o.done=done;o.res=ex&&ex.res&&{ok:ex.res.ok,dmg:ex.res.dmg,roll:ex.res.roll};
      let up=0,carried=0,spun=0,n=0;window.__mid=null;
      while(n<400&&S.game.phase==='exchange'&&S.game.ex===ex){fast(1);n++;if(D.carry){carried++;up=Math.max(up,g0-D.p[PEL].y);if(carried===14)window.__mid=1;}
        if(window.__mid===1){window.__mid=2;break;}}
      o.mid={carried,up:Math.round(up),sane:sane(D)&&sane(K)};return o;},seeds[kind]);
    odds[kind]=r.chance;
    expect(`${kind}: he can get a hand on it, and Advance is the toss`,!!r.ti&&r.ok&&r.slot==='toss'&&r.kind===kind,JSON.stringify(r));
    await shot('toss_'+kind+'_air');
    const r2=await p.evaluate(()=>{const D=S.F[1],K=hero(),ex=S.game.ex,info=ex&&ex.info,x0=info&&info.x;let up=0,carried=0,n=0,land=null,since=-1;const g0=D.gr(D.p[PEL].x);
      while(n<500&&S.game.phase==='exchange'&&S.game.ex===ex){fast(1);n++;if(D.carry){carried++;up=Math.max(up,g0-D.p[PEL].y);}else if(since<0)since=n;
        if(since>=0&&n===since+4)land={x:Math.round(D.p[PEL].x),downed:D.downed,dead:D.dead,hp:D.hp,low:Math.round(D.gr(D.p[PEL].x)-D.p[PEL].y)};}
      fast(30);return{n,carried,up:Math.round(up),aim:Math.round(x0),max:D.maxHp,started:info&&info.started,sane:sane(D)&&sane(K),half:!!D.half,...(land||{x:-999})};});
    expect(`${kind}: the throw takes it up and over`,r.res&&r.res.ok&&r2.started&&r.mid.carried+r2.carried>20&&Math.max(r.mid.up,r2.up)>60&&r.mid.sane,JSON.stringify({res:r.res,mid:r.mid,r2}));
    expect(`${kind}: it lands where the throw was aimed, hurt, on the floor and whole`,Math.abs(r2.x-r2.aim)<45&&r2.hp<r2.max&&(r2.downed||r2.dead)&&r2.sane&&r2.low<60&&!r2.half,JSON.stringify(r2));
    await shot('toss_'+kind+'_down');}
  expect('the odds of the throw go by the goblin\'s weight: best on the runt, least on the brute, and still better than even on the brute',odds.runt>=odds.skulker&&odds.skulker>=odds.brute&&odds.runt>odds.brute&&odds.brute>=50,JSON.stringify(odds));
  // a throw that fails leaves it on its feet; too far off there is no throw
  r=await p.evaluate(g=>{const [D]=fight([g]),K=hero();face(D,150);const far=tossInfo(K,D),slot=slotAction(K,D,'advance');face(D);const f0=K.foot,hp=D.hp;
    withRng(.1,()=>command(0,'toss'));const ex0=S.game.ex,ok=ex0.res.ok;let carried=0,n=0;while(n<400&&S.game.phase==='exchange'&&S.game.ex===ex0&&!S.opening){fast(1);n++;if(D.carry)carried++;}
    return{far:!!far,slot,ok,carried,foot:[f0,K.foot],hp:[hp,D.hp],downed:D.downed,sane:sane(D)};},seeds.brute);
  expect('out of reach there is no throw (Advance is a step); a throw that fails leaves the brute on its feet and costs him his footing',!r.far&&r.slot!=='toss'&&!r.ok&&r.carried===0&&!r.downed&&r.hp[1]===r.hp[0]&&r.foot[1]<r.foot[0]&&r.sane,JSON.stringify(r));
  // goblin bowling: the brute thrown into the runt, and the runt into the brute
  for(const [a,c] of [['brute','runt'],['runt','brute']]){
    r=await p.evaluate(([ga,gc])=>{const [D,O]=fight([ga,gc]),K=hero();face(D);O.station=clampSt(O,D.station+150,100);O.lane=O.dep=O.stepDep=100;O.facing=-1;O.build();fast(30);
      const ti=tossInfo(K,D),hp=O.hp;if(!ti)return{ti:null};withRng(.72,()=>command(0,'toss'));const ex=S.game.ex;let n=0,since=-1,land=null,seen=false;while(n<500&&S.game.phase==='exchange'&&S.game.ex===ex){fast(1);n++;if(D.carry)seen=true;else if(seen&&since<0)since=n;
        if(since>=0&&n===since+4)land={oDown:O.downed||O.dead,oHp:[hp,O.hp],dDown:D.downed||D.dead,near:Math.round(Math.abs(D.p[PEL].x-O.p[PEL].x))};}fast(30);
      return{hz:ti.hazard&&ti.hazard.kind,into:ti.hazard&&ti.hazard.o===O,ok:ex.res.ok,sane:sane(D)&&sane(O),...(land||{})};},[seeds[a],seeds[c]]);
    expect(`the ${a} thrown into the ${c} bowls it over`,r.hz==='body'&&r.into&&r.ok&&r.oDown&&r.oHp[1]<r.oHp[0]&&r.dDown&&r.sane,JSON.stringify(r));
    await shot(`bowl_${a}_into_${c}`);}

  // 3. cut in half: the slash, the sweep and the blow from above, on each kind
  for(const kind of ['runt','skulker','brute'])for(const [blow,cut] of [['slash',.5],['sweep',.24],['overhead',.62]]){
    r=await p.evaluate(([g,blow])=>{const [D]=fight([g]),K=hero();face(D);D.hp=1;
      // the blow lands (the dice are set for it, and for a blow from above the cut is the finish picked)
      const ra=resolveAttack,fv=finVar;let on=false;resolveAttack=function(A,D2,kind,op,T){if(on||A!==K)return ra(A,D2,kind,op,T);on=true;try{return resolveForced(A,D2,kind,op,T||pickTechnique(A,D2,kind),'hit');}finally{on=false;}};finVar=()=>.2;
      let o={valid:cmdValid(K,D,blow)};
      try{if(!o.valid)return o;command(0,blow);const ex0=S.game.ex;window.__ex=ex0;let n=0,t=null;while(n<500&&S.game.phase==='exchange'&&S.game.ex===ex0){if(S.opening&&!isAI(S.opening.f.idx))resolveOpening(aiOpening(S.opening));fast(1);n++;if(D.half&&t===null)t=n;if(t!==null&&n===t+9)break;}
        const h=D.half;o={...o,n,dead:D.dead,fin:D.finType,name:D.finName,half:!!h,a:h&&+h.a.toFixed(2),pts:D.p.length,torso:+D.body.torso.toFixed(1)};}
      finally{resolveAttack=ra;finVar=fv;}return o;},[seeds[kind],blow]);
    expect(`${kind}, ${blow}: the killing cut takes it in two${blow==='slash'?' at the waist':blow==='sweep'?', low':', high'}`,r.valid&&r.dead&&r.fin==='bisect'&&r.half&&Math.abs(r.a-cut)<.011&&r.pts>=14,JSON.stringify(r));
    await shot(`half_${kind}_${blow}_cut`);
    const r2=await p.evaluate(()=>{const D=S.F[1],h=D.half,p2=D.p,b=D.body;let n=0;while(n<500&&S.game.phase==='exchange'&&S.game.ex===window.__ex){fast(1);n++;}fast(150);
      const d=(a,c)=>Math.hypot(a.x-c.x,a.y-c.y),gy=q=>D.gr(q.x)-q.y;
      return{sane:sane(D),apart:Math.round(d(h.U,h.L)),up:[+(d(p2[CHE],h.U)/(b.torso*(1-h.a))).toFixed(2),+(d(p2[HEAD],p2[CHE])/b.neck).toFixed(2)],lo:[+(d(p2[PEL],h.L)/(b.torso*h.a)).toFixed(2),+(d(p2[PEL],p2[KNF])/b.th).toFixed(2),+(d(p2[KNF],p2[FTF])/b.sh).toFixed(2)],
        rest:[Math.round(gy(p2[CHE])),Math.round(gy(p2[PEL])),Math.round(gy(p2[HEAD]))],speed:+Math.max(...p2.map(q=>Math.hypot(q.x-q.px,q.y-q.py))).toFixed(2),over:S.game.phase};});
    const near=v=>v>.9&&v<1.1;
    expect(`${kind}, ${blow}: the halves come apart, each holds together as a half and comes to rest on the floor`,r2.sane&&r2.apart>12&&r2.up.every(near)&&r2.lo.every(near)&&r2.rest.every(v=>v>-4&&v<45)&&r2.speed<1.2,JSON.stringify(r2));
    await shot(`half_${kind}_${blow}_rest`);}
  // with the gore off there is no cut: the goblin is cut down whole
  r=await p.evaluate(g=>{const [D]=fight([g]),K=hero();face(D);D.hp=1;const was=S.gore;S.gore='off';const ra=resolveAttack;let on=false;resolveAttack=function(A,D2,kind,op,T){if(on||A!==K)return ra(A,D2,kind,op,T);on=true;try{return resolveForced(A,D2,kind,op,T||pickTechnique(A,D2,kind),'hit');}finally{on=false;}};
    try{command(0,'slash');const ex0=S.game.ex;let n=0;while(n<500&&S.game.phase==='exchange'&&S.game.ex===ex0){fast(1);n++;}fast(60);return{dead:D.dead,half:!!D.half,fin:D.finType,sane:sane(D)};}finally{resolveAttack=ra;S.gore=was;}},seeds.runt);
  expect('with the gore off the runt is cut down whole',r.dead&&!r.half&&r.fin!=='bisect'&&r.sane,JSON.stringify(r));

  console.log(rep.join('\n'));
  if(errs.length){console.log('\nFAILED '+errs.length+':\n'+errs.join('\n'));await b.close();process.exit(1);}
  console.log('\nbeast page: all '+rep.length+' checks pass');await b.close();})();
