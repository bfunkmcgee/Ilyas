// node uiwork/gore/cost.js : what the blood's drawing costs a frame beside the old drawing, on the test page, each on a sheet at
// three times the world's scale (a phone's), this machine's software canvas. Run it alone.
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
(async()=>{const b=await chromium.launch({executablePath:fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined});
  const p=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true})).newPage();
  p.on('pageerror',e=>console.log('page: '+e.message));
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+path.join(__dirname,'..','..','test_page.html'));await p.waitForTimeout(400);
  const r=await p.evaluate(()=>{S.soundOn=false;let a=13;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
    window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    try{storyMenu(false);document.body.classList.remove('story');}catch(e){}
    window.FORCE=[];const _ra=resolveAttack;resolveAttack=function(A,D,kind,op,T){T=T||pickTechnique(A,D,kind);const want=FORCE.shift();if(!want)return _ra(A,D,kind,op,T);const c=computeMods(A,D,kind,op,T);let pick=null;
      for(let v=2;v<=20;v++){const tot=v+c.bonus,o=isCrit(v,tot,c.def)?'crit':tot>=c.def?'hit':tot>=c.def-4?'block':'dodge';if(o===want){pick=v;break;}}
      if(pick==null)return _ra(A,D,kind,op,T);const save=S.rng;let first=true;S.rng=()=>{if(first){first=false;return(pick-.5)/20;}return save();};const r=_ra(A,D,kind,op,T);S.rng=save;return r;};
    S.gore='red';S.arenaKey='street';S.introOn=false;S.tableOn=false;S.divOn=false;S.cfg.n=1;S.cfg.crew=false;S.cfg.ally.on=false;S.auto=false;S.cfg.hero.weapon='spear';S.cfg.hero.skill=4;
    S.cfg.foes[0].weapon='sword';S.cfg.foes[0].skill=3;S.cfg.foes[0].temper='plain';S.F=[];rosterBuild();restart();step(40);
    const K=S.F[0],V=S.F[1];V.station=K.station+engageGap(K,V)*K.facing;V.lane=K.lane;V.dep=V.lane;V.stepDep=V.lane;step(30);
    const c=document.createElement('canvas');c.width=2700;c.height=1800;const g=c.getContext('2d');g.scale(3,3);
    const time=(fn,n)=>{const main=ctx;ctx=g;try{for(let i=0;i<30;i++)fn();g.getImageData(0,0,1,1);const t0=performance.now();for(let i=0;i<n;i++)fn();g.getImageData(0,0,1,1);return+((performance.now()-t0)/n).toFixed(3);}finally{ctx=main;}};
    const o={};
    o.weapon_dry=time(()=>drawWeapon(K),300);
    V.hp=1;K.foot=FOOT_MAX;const gm=S.game;gm.phase='input';gm.active=0;gm.aiAt=null;S.opening=null;gm.ex=null;FORCE=['hit'];command(0,slotAction(K,V,'thrust'));if(S.opening&&S.opening.source==='react')resolveOpening('back');
    let n=0;while(n++<500&&!(V.impaled&&V.impaled.u0!=null))step(1);n=0;while(n++<160){const i=GoreLook.probe.inside(K);if(!V.impaled||(i&&i.u1<.93))break;step(1);}
    o.inside=!!GoreLook.probe.inside(K);o.weapon_in_body=time(()=>drawWeapon(K),300);o.weapon_in_body_old=GoreLook.plain(()=>time(()=>drawWeapon(K),300));
    o.drops_n=S.blood.length;o.drops=time(()=>GoreLook.drops(),300);o.drops_old=GoreLook.plain(()=>time(()=>drawBlood(),300));
    n=0;while(n++<600&&V.impaled)step(1);step(30);o.wet=+GoreLook.probe.wet(K).toFixed(2);o.weapon_wet=time(()=>drawWeapon(K),300);o.weapon_wet_old=GoreLook.plain(()=>time(()=>drawWeapon(K),300));
    o.marks_wounds=GoreLook.probe.wounds(V);o.marks=time(()=>drawMarks(V),300);o.marks_old=GoreLook.plain(()=>time(()=>drawMarks(V),300));
    // the floor at its fullest: 360 stains (the game's cap), one of them a pool
    while(S.stains.length<360)S.stains.push({x:200+Math.random()*500,d:20+Math.random()*90,r:2+Math.random()*4,a:.45+Math.random()*.35,grow:0,rot:Math.random()*Math.PI});
    o.stains_n=S.stains.length;o.stains=time(()=>drawStains(),100);o.stains_old=GoreLook.plain(()=>time(()=>drawStains(),100));
    // a burst at its fullest
    const B0=S.blood.slice();S.blood.length=0;for(let i=0;i<120;i++)S.blood.push({x:400+Math.random()*80,y:300+Math.random()*80,d:60,vx:(Math.random()-.5)*400,vy:(Math.random()-.5)*400,r:1+Math.random()*2.4,age:Math.random()*.4});
    o.burst_n=120;o.burst=time(()=>GoreLook.drops(),300);o.burst_old=GoreLook.plain(()=>time(()=>drawBlood(),300));S.blood.length=0;for(const x of B0)S.blood.push(x);
    return o;});
  console.log(JSON.stringify(r,null,1));await b.close();})();
