// node uiwork/gore/kill.js <out dir> <scenario> <secs> <every> [name=js ...]  : a lab kill filmed through the game's page, stepped
//   env: PAGE (the built page), W H DSF, CLIP=x,y,w,h, ARENA, FLAT=1 (no Phaser view), PRE (frames stepped before filming starts)
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const {chromiumPath}=require(require('path').join(__dirname,'..','look','places.js'));
const A=process.argv,OUT=A[2],SC=A[3],SECS=+A[4]||3,EVERY=+A[5]||2,ways=A.slice(6).map(s=>[s.slice(0,s.indexOf('=')),s.slice(s.indexOf('=')+1)]);if(!ways.length)ways.push(['run','']);
const Wd=+(process.env.W||412),Ht=+(process.env.H||714),DSF=+(process.env.DSF||1),CLIP=process.env.CLIP?process.env.CLIP.split(',').map(Number):null,ARENA=process.env.ARENA||'street';
// each scenario: hero's weapon, the foe's, the blow, the foe's state (down: on the floor first)
const NN=+(process.env.N||1);const SCN0={thrust:{hero:'sword',foe:'sword',kind:'thrust'},arc:{hero:'elven',foe:'sword',kind:'thrust'},spear:{hero:'spear',foe:'sword',kind:'thrust'},dagger:{hero:'dagger',foe:'sword',kind:'thrust'},
  behead:{hero:'sword',foe:'sword',kind:'slash',fin:'behead'},cutdown:{hero:'sword',foe:'sword',kind:'slash',fin:'cutdown'},cleave:{hero:'axe',foe:'sword',kind:'overhead'},throat:{hero:'dagger',foe:'sword',kind:'slash'},pin:{hero:'sword',foe:'sword',kind:'thrust',down:1},
  cut:{hero:'sword',foe:'sword',kind:'slash',hp:99},foethrust:{hero:'sword',foe:'sword',kind:'thrust',rev:1}}[SC]||JSON.parse(SC);const SCN=Object.assign({n:NN},SCN0);
(async()=>{const b=await chromium.launch({executablePath:chromiumPath(),args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  for(const [way,js] of ways){const dir=path.join(OUT,way);fs.mkdirSync(dir,{recursive:true});
    const p=await (await b.newContext({viewport:{width:Wd,height:Ht},deviceScaleFactor:DSF,isMobile:Wd<700||Ht<500,hasTouch:true})).newPage();
    await p.addInitScript(()=>{window.__rafs=[];window.requestAnimationFrame=cb=>{window.__rafs.push(cb);return window.__rafs.length;};
      let a=0x2F6E2B1;Math.random=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
      window.__now=1e6;performance.now=()=>window.__now;Date.now=()=>1.7e12+window.__now;});
    await p.goto('file://'+path.resolve(process.env.PAGE||path.join(__dirname,'..','..','ragdoll-skirmish-lab.html'))+(process.env.FLAT?'?scene=none&layers=0&lamps=0':'?host=2&scene=none&layers=1&motion=1&lamps=1'));await p.waitForTimeout(1500);await p.addStyleTag({content:'#over{display:none!important}'});
    const info=await p.evaluate(([sc,arena,js])=>{S.soundOn=false;S.rng=Math.random;window.R1=window.R0=window.render;window.drawing=on=>{window.render=on?window.R1:()=>{};};
      const run=all=>{window.__now+=1000/60;const L=window.__rafs;window.__rafs=[];
        for(const f of L){if(all?(window.__all||f.name==='frame'):f.name!=='frame'){try{f(window.__now);}catch(e){window.__err=(window.__err||0)+1;window.__errm=String(e&&e.stack||e).slice(0,400);}}else window.__rafs.push(f);}};
      window.step=k=>{for(let i=0;i<k;i++)run(true);};window.again=k=>{for(let i=0;i<k;i++){window.R1();run(false);}};
      window.FORCE=[];const _ra=resolveAttack;resolveAttack=function(A,D,kind,op,T){T=T||pickTechnique(A,D,kind);const want=FORCE.shift();if(!want)return _ra(A,D,kind,op,T);const c=computeMods(A,D,kind,op,T);let pick=null;
        for(let v=2;v<=20;v++){const tot=v+c.bonus,o=isCrit(v,tot,c.def)?'crit':tot>=c.def?'hit':tot>=c.def-4?'block':'dodge';if(o===want){pick=v;break;}}
        if(pick==null)return _ra(A,D,kind,op,T);const save=S.rng;let first=true;S.rng=()=>{if(first){first=false;return(pick-.5)/20;}return save();};const r=_ra(A,D,kind,op,T);S.rng=save;return r;};
      drawing(false);window.__all=false;try{storyMenu(false);document.body.classList.remove('story');}catch(e){}
      S.arenaKey=arena;S.introOn=false;S.tableOn=false;S.divOn=false;S.cfg.n=+(sc.n||1);S.cfg.crew=false;S.cfg.ally.on=false;S.auto=false;S.cfg.hero.weapon=sc.hero;S.cfg.hero.skill=sc.hs||4;
      S.cfg.foes[0].weapon=sc.foe;S.cfg.foes[0].skill=3;S.cfg.foes[0].temper='plain';if(sc.n>1){S.cfg.foes[1].weapon='sword';S.cfg.foes[1].skill=1;S.cfg.foes[1].temper='plain';}S.F=[];rosterBuild();restart();step(40);
      const K=S.F[0],V=S.F[1],g=S.game,At=sc.rev?V:K,Df=sc.rev?K:V;
      V.station=K.station+engageGap(K,V)*K.facing;V.lane=K.lane;V.dep=V.lane;V.stepDep=V.lane;if(S.F[2]){const Z=S.F[2];Z.station=K.station+K.facing*330;Z.build&&Z.build();}step(30);
      if(sc.down){Df.hp=Df.maxHp;FORCE=['crit'];g.phase='input';g.active=At.idx;g.aiAt=null;S.opening=null;g.ex=null;command(At.idx,slotAction(At,Df,'overhead'));if(S.opening)resolveOpening('back');step(160);}
      Df.hp=sc.hp||1;At.foot=FOOT_MAX;g.phase='input';g.active=At.idx;g.aiAt=null;S.opening=null;g.ex=null;for(const f of S.F){f.guarding=false;f.counter=false;f.intent=null;}
      if(sc.fin){let n=0;while(n++<60&&((finVar(At,Df)<.6)!==(sc.fin==='behead')))S.game.turnNo++;}
      if(js)new Function(js)();
      FORCE=[sc.out||'hit'];command(At.idx,slotAction(At,Df,sc.kind));if(S.opening&&S.opening.source==='react')resolveOpening('back');
      drawing(true);window.__all=true;step(2);return{down:Df.downed,hp:Df.hp,ex:!!g.ex,phase:g.phase,gore:S.gore,env:typeof envKey==='function'?envKey():''};},[SCN,ARENA,js]);
    const n=Math.round(SECS*60/EVERY);let i=0,log=[];
    for(;i<n;i++){const st=await p.evaluate(k=>{window.__all=false;step(k-1);window.__all=true;step(1);const V=S.F[1],K=S.F[0];return (V.dead?'D':'-')+(V.finType||K.finType||'')+(V.impaled||K.impaled?'i':'')+':'+S.blood.length+'/'+S.stains.length;},EVERY);log.push(st);
      await p.screenshot({path:path.join(dir,String(i).padStart(4,'0')+(DSF>1?'.png':'.jpg')),type:DSF>1?'png':'jpeg',quality:DSF>1?undefined:90,clip:CLIP?{x:CLIP[0],y:CLIP[1],width:CLIP[2],height:CLIP[3]}:undefined});}
    const first=log.findIndex(s=>s[0]==='D');
    console.log(way,SC,'frames',i,'setup',JSON.stringify(info),'dead at frame',first,log[first]||'',' end',log[log.length-1],JSON.stringify(await p.evaluate(()=>({live:LayerTest.live,why:LayerTest.why,err:[window.__err||0,window.__errm||''],lerr:LayerTest.err||''}))));await p.close();}
  await b.close();})();
