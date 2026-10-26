// Strips of single blows on a stage, for looking at the motion. An attacker and the man he strikes stand on the street a step apart;
// the outcome (it lands, it is blocked, it is slipped), the man's answer, and the blow's variant and combo where the game has them are
// forced; the blow is photographed every few hundredths of a second from his first move to the end of the action and the frames are
// laid out in rows, each with its time. Nothing is played but the one blow: neither man takes an opening or a turn after it.
// usage: node uiwork/anim/moves.js <out dir> <shots.json> [page]      (page: test_page.html by default; build it first)
// a shot: {name, a:{who:'hero'|'foe', weapon, skill, style}, d:{weapon, skill}, kind, out, react, variant, combo, tech, every, gap,
//          cols, w, h, flourish, back}
//   who      the attacker: 'hero' (Ilyas, index 0) or 'foe' (the lab's first enemy); the other is the man struck
//   style    the attacker's animation style ('regular', 'tactical', ...); left out, his own
//   variant  a key of the blow's variants (ATTACK.variant), combo the leads as ["kind:variant", ...] (S.animForce, sk_anim.js)
//   flourish true lets an expert's flourish come; otherwise it does not (styleRoll forced high)
//   back     the man struck faces away
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const OUT=process.argv[2],SHOTS=JSON.parse(fs.readFileSync(process.argv[3],'utf8')),PAGE=path.resolve(process.argv[4]||path.join(__dirname,'..','..','test_page.html'));
if(!OUT||!SHOTS){console.log('usage: node uiwork/anim/moves.js <out dir> <shots.json> [page]');process.exit(1);}
fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined}),errs=[];
  const p=await (await b.newContext({viewport:{width:1200,height:760},deviceScaleFactor:1})).newPage();
  p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};window.__drawEvery=1;});
  await p.goto('file://'+PAGE);await p.waitForTimeout(400);
  await p.evaluate(()=>{S.soundOn=false;window.__now=performance.now()+1000;
    window.step=k=>{for(let i=0;i<k;i++){window.__now+=1000/120;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    // the stage's own rules: the outcome, the answer and the flourish forced; no opening, flow or gang for anyone; no turn after
    const ST=window.__st={on:false,force:null,react:null,flourish:false,A:null};
    {const ra=resolveAttack;resolveAttack=function(A,D,kind,op,T){const want=ST.force;if(!ST.on||!want||A!==ST.A)return ra.apply(this,arguments);
      ST.force=null;T=T||pickTechnique(A,D,kind);const c=computeMods(A,D,kind,op,T);let pick=null;
      for(let v=2;v<=19;v++)if(outcomeOf(v,v+c.bonus,c.def)===want){pick=v;break;}
      if(pick==null)return ra.call(this,A,D,kind,op,T);
      const save=S.rng;let first=true;S.rng=()=>{if(first){first=false;return(pick-.5)/20;}return save();};
      try{return ra.call(this,A,D,kind,op,T);}finally{S.rng=save;}};}
    {const ar=aiReact;aiReact=function(D,A,kind,T,op){if(ST.on&&ST.react&&reactChoices(D,A).includes(ST.react))return ST.react;return ar.apply(this,arguments);};}
    {const sr=styleRoll;styleRoll=function(A,kind){if(ST.on&&A===ST.A)return ST.flourish?0:1;return sr.apply(this,arguments);};}
    {const co=considerOpening;considerOpening=function(){if(ST.on)return;return co.apply(this,arguments);};}
    {const cf=considerFlow;considerFlow=function(){if(ST.on)return;return cf.apply(this,arguments);};}
    {const cg=considerGang;considerGang=function(){if(ST.on)return;return cg.apply(this,arguments);};}
    V11.turnStart.push(()=>{if(ST.on)for(const f of S.F)if(f!==ST.A)f.ready=1e6;});
    const put=(f,x,z,fa)=>{f.station=x;f.lane=z;f.dep=z;f.stepDep=z;f.vdep=0;f.facing=fa;f.build();};
    window.animStage=c=>{
      let s=c.seed||11;Math.random=()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff;};S.rng=Math.random;
      S.arenaKey='street';S.cfg.n=c.n||1;S.cfg.crew=false;S.cfg.ally.on=false;S.introOn=false;S.auto=true;S.tableOn=false;S.divOn=false;S.showcase=false;
      const pick=o=>{const r={};for(const k of ['seed','weapon','skill'])if(o&&o[k]!=null)r[k]=o[k];return r;};
      S.cfg.hero={...S.cfg.hero,...pick(c.hero)};S.cfg.foes[0]={...S.cfg.foes[0],temper:'plain',...pick(c.foe)};
      S.F=[];rosterBuild();restart();
      const K=S.F[0],F=S.F[1];if(!K||!F)return null;
      // (a named elf fights at no less than his rank: the stage sets the skill asked for)
      if(c.human){F.name='Field hand';F.human=true;F.ward='field';}
      if(c.foe&&c.foe.skill!=null)F.skill=c.foe.skill;if(c.hero&&c.hero.skill!=null)K.skill=c.hero.skill;
      for(const f of [K,F]){f.maxHp=f.hp=999;f.ready=1e6;f.foot=footMaxOf(f);}
      const A=c.who==='foe'?F:K,D=A===K?F:K;A.ready=0;
      if(c.style)A.animStyle=c.style;
      const z=92,x=c.who==='foe'?560:330,fa=c.who==='foe'?-1:1;put(A,x,z,fa);put(D,x+fa*(engageGap(A,D)+(c.gap??20)),z,c.back?fa:-fa);
      if(c.back)D.holdFace=A.idx;
      // (a second enemy just behind the attacker, for Turn him)
      if(S.F[2]){const E=S.F[2];E.maxHp=E.hp=999;E.ready=1e6;put(E,x-fa*40,z+18,fa*-1);E.facing=-fa;if(A===K)put(E,D.station+fa*40,z+18,-fa);}
      warm(90);
      const g=S.game;g.phase='input';g.active=A.idx;g.aiAt=null;S.opening=null;g.ex=null;for(const f of S.F){f.intent=null;f.foot=footMaxOf(f);}
      if(c.back){D.facing=fa;}
      ST.A=A;return{A,D};};
    // the two men's middle on the canvas, and a crop of the canvas round it (the numbers over a struck man left out)
    window.cellAt=(w,h)=>{S.popups=[];S.callouts=[];render();const s=cv.width/cam.viewW,L=cam.x-cam.viewW/2,T=camTop();
      const pts=[];for(const f of S.F.slice(0,2))for(const q of f.p)pts.push({x:(q.x+f.dep*PSX-L)*s,y:(q.y-f.dep*PSY-T)*s});
      const xs=pts.map(q=>q.x),ys=pts.map(q=>q.y),K=S.F[0],ht=(K.leg+K.body.torso+K.body.neck+K.body.headR*2)*s;
      const ch=ht*(window.__zoom||1.45),cw=ch*w/h,cx=(Math.min(...xs)+Math.max(...xs))/2,by=Math.max(...ys)+ht*.1;
      const x0=Math.min(Math.max(0,cx-cw/2),cv.width-cw),y0=Math.min(Math.max(0,by-ch),cv.height-ch);
      return{x0,y0,cw,ch};};
    window.step(6);});
  // FX=off|lite|full: the lighting (off draws the plain figures, clearest for reading a pose)
  if(process.env.FX)await p.evaluate(q=>{if(typeof FXL!=='undefined'&&FXL.set)FXL.set(q,true);},process.env.FX);
  for(const sh of SHOTS){
    const r=await p.evaluate(sh=>{window.__zoom=sh.zoom||1.3;const ST=window.__st,W=sh.w||300,H=sh.h||240,cols=sh.cols||8,every=sh.every||.06;
      ST.on=true;ST.flourish=!!sh.flourish;ST.react=sh.react||null;S.animForce=sh.variant||sh.combo||sh.hit!=null?{variant:sh.variant||null,combo:sh.combo||null,hit:sh.hit??null}:null;
      const st=animStage({who:sh.a&&sh.a.who||'hero',hero:sh.a&&sh.a.who==='foe'?(sh.d||{}):(sh.a||{}),foe:sh.a&&sh.a.who==='foe'?(sh.a||{}):(sh.d||{}),
        style:sh.a&&sh.a.style,gap:sh.gap,back:sh.back,seed:sh.seed,n:sh.n,human:sh.human});
      if(!st)return{err:'no stage'};
      window.step(20);
      ST.force=sh.out||'hit';const ok=command(st.A.idx,sh.kind||'slash');if(!ok){ST.on=false;return{err:'command refused'}}
      const ex=S.game.ex,A=st.A,t0=S.t;const frames=[],tEnd=(A.action?A.action.end:1.5)+.15;
      const cells=[];let t=0;
      while(t<=tEnd&&cells.length<(sh.max||48)){while(S.t-t0<t-1e-6)window.step(1);const c=cellAt(W,H);
        const can=document.createElement('canvas');can.width=W;can.height=H;const g=can.getContext('2d');g.drawImage(cv,c.x0,c.y0,c.cw,c.ch,0,0,W,H);
        g.fillStyle='rgba(0,0,0,.55)';g.fillRect(0,0,58,18);g.fillStyle='#e9c46e';g.font='12px monospace';g.fillText((S.t-t0).toFixed(2)+'s',5,13);cells.push(can);t+=every;}
      const rows=Math.ceil(cells.length/cols),out=document.createElement('canvas');out.width=cols*W;out.height=rows*H+22;const g=out.getContext('2d');
      g.fillStyle='#08070b';g.fillRect(0,0,out.width,out.height);
      const res=ex&&ex.res,plan=ex&&ex.plan,T=res&&res.tech;
      g.fillStyle='#f3ead6';g.font='14px sans-serif';
      g.fillText(`${sh.name}: ${A.name} (${A.weaponKey}, skill ${A.skill}, ${A.animStyle}) ${sh.kind} ${res?res.out:'?'} ${T?T.name:''} ${plan&&plan.anim?JSON.stringify(plan.anim):''} react ${ex&&ex.D?(ex.D.lastReact||''):''}`,6,16);
      cells.forEach((c,i)=>g.drawImage(c,(i%cols)*W,22+Math.floor(i/cols)*H));
      ST.on=false;S.animForce=null;
      return{png:out.toDataURL('image/png'),info:{out:res&&res.out,tech:T&&T.name,Timp:plan&&plan.Timp,end:A.action?A.action.end:null,anim:plan&&plan.anim||null}};},sh);
    if(r.err){console.log(sh.name,'ERR',r.err);continue;}
    fs.writeFileSync(path.join(OUT,sh.name+'.png'),Buffer.from(r.png.split(',')[1],'base64'));
    console.log(sh.name,JSON.stringify(r.info));}
  console.log('errors',errs.length,JSON.stringify(errs.slice(0,3)));await b.close();})();
