// The blood as it is drawn (sk_goreui.js, since V120), at a phone held upright, in the lab's street. A spear's thrust that kills: the part of
// the blade inside the body is not drawn (the old drawing drew it there), the point is out the far side and red, the body keeps the
// wound, and the blade comes away wet and dries. The drops, the stains and a body's marks draw in the setting's colours and not at
// all with the blood off, when a blade in a body is still out of sight inside it. A weapon left in a body, the same. A head cut
// off leaves a stump. And what the old drawings left set on the context, the new ones leave set.
// Every picture here is drawn by the page's own functions on a clear sheet of the world's size and read from it.
// usage: node sk_gore_page.js [outdir]   (the sheets go to outdir as PNGs when one is named)
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const OUT=process.argv[2]||null;if(OUT)fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[],rep=[];
  const expect=(label,cond,info)=>{rep.push((cond?'ok   ':'FAIL ')+label+(info?'  '+info:''));if(!cond)errs.push(label+(info?' ('+info+')':''));};
  const p=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true})).newPage();
  p.on('pageerror',e=>errs.push('page: '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts|ERR_|net::/.test(m.text()))errs.push('console: '+m.text());});
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+path.join(__dirname,process.env.PAGE||'test_page.html'));await p.waitForTimeout(400);
  await p.evaluate(()=>{S.soundOn=false;let a=13;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
    // (every frame is drawn: the wounds and the wet blade are the drawing's own notes)
    window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    // (frames stepped and not drawn, where only the game's clock is waited on)
    window.fast=k=>{const R=window.render;window.render=()=>{};try{step(k);}finally{window.render=R;}};
    try{storyMenu(false);document.body.classList.remove('story');}catch(e){}
    // the next blow's dice, forced to an outcome (as the film tools do it)
    window.FORCE=[];const _ra=resolveAttack;resolveAttack=function(A,D,kind,op,T){T=T||pickTechnique(A,D,kind);const want=FORCE.shift();if(!want)return _ra(A,D,kind,op,T);const c=computeMods(A,D,kind,op,T);let pick=null;
      for(let v=2;v<=20;v++){const tot=v+c.bonus,o=isCrit(v,tot,c.def)?'crit':tot>=c.def?'hit':tot>=c.def-4?'block':'dodge';if(o===want){pick=v;break;}}
      if(pick==null)return _ra(A,D,kind,op,T);const save=S.rng;let first=true;S.rng=()=>{if(first){first=false;return(pick-.5)/20;}return save();};const r=_ra(A,D,kind,op,T);S.rng=save;return r;};
    // one man against him in the street, at the distance of a blow
    window.duel=(hero,foe)=>{S.gore='red';S.forceStuck=false;S.arenaKey='street';S.introOn=false;S.tableOn=false;S.divOn=false;S.cfg.n=1;S.cfg.crew=false;S.cfg.ally.on=false;S.auto=false;S.cfg.hero.weapon=hero;S.cfg.hero.skill=4;
      S.cfg.foes[0].weapon=foe||'sword';S.cfg.foes[0].skill=3;S.cfg.foes[0].temper='plain';S.F=[];rosterBuild();restart();step(40);
      const K=S.F[0],V=S.F[1];V.station=K.station+engageGap(K,V)*K.facing;V.lane=K.lane;V.dep=V.lane;V.stepDep=V.lane;step(30);};
    window.blow=(kind,hp,o)=>{o=o||{};const K=S.F[0],V=S.F[1],g=S.game;V.hp=hp;K.foot=FOOT_MAX;g.phase='input';g.active=0;g.aiAt=null;S.opening=null;g.ex=null;for(const f of S.F){f.guarding=false;f.counter=false;f.intent=null;}
      if(o.fin){let n=0;while(n++<60&&((finVar(K,V)<.6)!==(o.fin==='behead')))S.game.turnNo++;}
      FORCE=[o.out||'hit'];command(0,slotAction(K,V,kind));if(S.opening&&S.opening.source==='react')resolveOpening('back');};
    window.until=(f,max)=>{let n=0;while(n<max&&!f()){step(1);n++;}return n<max;};
    // a drawing on a clear sheet of the world's size at the world's own scale, and what it left set on the sheet's context
    window.sheet=draw=>{const c=document.createElement('canvas');c.width=900;c.height=600;const g=c.getContext('2d'),main=ctx;ctx=g;try{draw();}finally{ctx=main;}
      return{c,d:g.getImageData(0,0,900,600).data,left:{fillStyle:g.fillStyle,strokeStyle:g.strokeStyle,lineCap:g.lineCap,lineWidth:g.lineWidth,globalAlpha:g.globalAlpha,comp:g.globalCompositeOperation}};};
    // its drawn pixels: how many, their mean colour, how many are blood (red or, in ink, violet: far from any grey), how many are
    // reddened (blood thin over steel), how many pass `inside`
    window.read=(sh,inside)=>{const d=sh.d;let n=0,r=0,g=0,b=0,red=0,ink=0,warm=0,inT=0;
      for(let y=0;y<600;y++)for(let x=0;x<900;x++){const i=(y*900+x)*4;if(d[i+3]<48)continue;n++;r+=d[i];g+=d[i+1];b+=d[i+2];
        if(d[i]>d[i+1]*2.2&&d[i]>d[i+2]*1.5&&d[i]>70)red++;if(d[i+2]>d[i+1]*1.5&&d[i+2]>d[i]*1.15&&d[i+2]>70)ink++;if(d[i]>d[i+1]*1.3&&d[i]>d[i+2]*1.15)warm++;if(inside&&inside(x+.5,y+.5))inT++;}
      return{n,r:n?Math.round(r/n):0,g:n?Math.round(g/n):0,b:n?Math.round(b/n):0,red,ink,warm,inT};};
    window.inCap=(T,m)=>(x,y)=>{const vx=T.C.x-T.P.x,vy=T.C.y-T.P.y,l2=vx*vx+vy*vy||1,u=Math.max(0,Math.min(1,((x-T.P.x)*vx+(y-T.P.y)*vy)/l2));return Math.hypot(x-T.P.x-vx*u,y-T.P.y-vy*u)<T.R-(m||0);};
    window.png=sh=>sh.c.toDataURL('image/png');
  });
  const save=async(name,js)=>{if(!OUT)return;const u=await p.evaluate(js);fs.writeFileSync(path.join(OUT,name+'.png'),Buffer.from(u.split(',')[1],'base64'));};

  // ---------- a thrust that kills (with the spear: its point comes out his back whatever way he hangs on it; a sword's point may stay
  // in him, and the sword is seen below, left in him) ----------
  let r=await p.evaluate(()=>{duel('spear');blow('thrust',1);const K=S.F[0],V=S.F[1];
    const got=until(()=>V.impaled&&V.impaled.u0!=null,500);
    // (he slides up the blade to where the game holds him: on until its point is out his back)
    until(()=>{const i=GoreLook.probe.inside(K);return!V.impaled||(i&&i.u1<.93);},160);const io=GoreLook.probe.inside(K);if(!got||!io)return{ok:GoreLook.ok(),got,io:null,fin:V.finType,dead:V.dead};
    const inT=inCap(io.T,1.5),neu=read(sheet(()=>drawWeapon(K)),inT);const old=GoreLook.plain(()=>read(sheet(()=>drawWeapon(K)),inT));
    // past where it comes out of him: the steel there, and how much of it is red
    const h=K.p[HAF],t=K.p[TIP],L=Math.hypot(t.x-h.x,t.y-h.y),ux=(t.x-h.x)/L,uy=(t.y-h.y)/L,past=(x,y)=>{const s=(x-h.x)*ux+(y-h.y)*uy;return s>L*io.u1+1&&Math.abs((x-h.x)*-uy+(y-h.y)*ux)<5;};
    const sh=sheet(()=>drawWeapon(K)),d=sh.d;let tipN=0,tipRed=0;for(let y=0;y<600;y++)for(let x=0;x<900;x++){const i=(y*900+x)*4;if(d[i+3]<48||!past(x+.5,y+.5))continue;tipN++;if(d[i]>d[i+1]*1.15&&d[i]>d[i+2]*1.1)tipRed++;}
    S.gore='off';const off=read(sheet(()=>drawWeapon(K)),inT);S.gore='red';
    return{ok:GoreLook.ok(),got,fin:V.finType,u0:+io.u0.toFixed(3),u1:+io.u1.toFixed(3),neu,old,tipN,tipRed,off,wounds:GoreLook.probe.wounds(V)};});
  expect('the new drawing is on',r.ok===true);
  expect('a thrust that kills holds him on the blade',r.got&&!!r.u0,JSON.stringify({got:r.got,fin:r.fin}));
  if(r.neu){
    expect('a stretch of the blade is inside him, and its point is out the far side',r.u1-r.u0>.12&&r.u1<.985,r.u0+' to '+r.u1);
    expect('nothing of the blade is drawn inside him (the old drawing drew it there)',r.neu.inT===0&&r.old.inT>20,'new '+r.neu.inT+', old '+r.old.inT);
    expect('the rest of the weapon is drawn',r.neu.n>r.old.n*.4&&r.neu.n<r.old.n,'new '+r.neu.n+', old '+r.old.n);
    expect('the point that has come out is red',r.tipN>8&&r.tipRed>r.tipN*.5,r.tipRed+' of '+r.tipN);
    expect('with the blood off the blade is still out of sight inside him, and nothing on it is red',r.off.inT===0&&r.off.warm<=r.old.warm,JSON.stringify({inT:r.off.inT,warm:r.off.warm,old:r.old.warm}));
    expect('the body keeps where it went in and where it came out',r.wounds===2,String(r.wounds));}
  await save('thrust_weapon','png(sheet(()=>drawWeapon(S.F[0])))');
  r=await p.evaluate(()=>{const K=S.F[0],V=S.F[1];until(()=>!V.impaled,600);step(40);const wet=GoreLook.probe.wet(K),w=read(sheet(()=>drawWeapon(K)));
    const old=GoreLook.plain(()=>read(sheet(()=>drawWeapon(K))));
    const wd=sheet(()=>drawMarks(V)),wn=read(wd);const t0=S.t;let n=0;while(n++<1400&&S.t-t0<9.6)fast(1);
    return{free:!V.impaled,wet:+wet.toFixed(2),red:w.warm,oldRed:old.warm,wn,later:+GoreLook.probe.wet(K).toFixed(3),dt:+(S.t-t0).toFixed(1),stains:S.stains.length,own:GoreLook.probe.own()};});
  expect('pulled out, the blade is wet and red',r.free&&r.wet>.3&&r.red>r.oldRed+12,JSON.stringify({wet:r.wet,red:r.red,old:r.oldRed}));
  expect('the wound is drawn on him',r.wn.n>6&&r.wn.red>3,JSON.stringify(r.wn));
  expect('ten seconds on the blade is dry',r.dt>=9.5&&r.later===0,JSON.stringify({dt:r.dt,wet:r.later}));

  // ---------- the stains and the drops, in each setting ----------
  r=await p.evaluate(()=>{const o={n:S.stains.length};for(const g of ['red','ink','off']){S.gore=g;const sh=sheet(()=>drawStains());o[g]=read(sh);o[g].left=sh.left.fillStyle;}
    GoreLook.plain(()=>{for(const g of ['red','off']){S.gore=g;o['old_'+g]=sheet(()=>drawStains()).left.fillStyle;}});S.gore='red';return o;});
  expect('the floor is stained where he bled',r.n>0&&r.red.n>20&&r.red.r>r.red.b*1.6,JSON.stringify({n:r.n,px:r.red.n,r:r.red.r,b:r.red.b}));
  expect('in ink the stains are violet',r.ink.n>20&&r.ink.b>r.ink.r,JSON.stringify({px:r.ink.n,r:r.ink.r,b:r.ink.b}));
  expect('with the blood off no stain is drawn',r.off.n===0,String(r.off.n));
  expect('the stains leave the context as the old ones did',r.red.left===r.old_red&&r.off.left===r.old_off,JSON.stringify([r.red.left,r.old_red,r.off.left,r.old_off]));
  await save('stains','png(sheet(()=>drawStains()))');
  r=await p.evaluate(()=>{duel('sword');blow('slash',99);const V=S.F[1];const got=until(()=>S.blood.length>6,500);step(2);const o={got,n:S.blood.length};
    for(const g of ['red','ink','off']){S.gore=g;o[g]=read(sheet(()=>GoreLook.drops()));}S.gore='red';
    const a=sheet(()=>drawBlood()).left;const b=GoreLook.plain(()=>sheet(()=>drawBlood()).left);o.same=JSON.stringify(a)===JSON.stringify(b);o.a=a;o.b=b;return o;});
  expect('a cut throws drops',r.got&&r.red.n>10&&r.red.red>5,JSON.stringify({n:r.n,px:r.red.n,red:r.red.red}));
  expect('in ink the drops are violet, with the blood off there are none',r.ink.ink>5&&r.ink.red===0&&r.off.n===0,JSON.stringify({ink:r.ink.ink,red:r.ink.red,off:r.off.n}));
  expect('the drops leave the context as the old ones did',r.same,JSON.stringify([r.a,r.b]));
  await save('drops','png(sheet(()=>GoreLook.drops()))');

  // ---------- a body's marks: a cut and a bruise put on him by hand, at a pose that is set ----------
  r=await p.evaluate(()=>{const V=S.F[1];until(()=>S.game.phase==='input',600);V.marks.length=0;V.marks.push({a:PEL,b:CHE,u:.55,ang:.7,len:7,edge:true,off:1},{a:PEL,b:CHE,u:.3,ang:0,len:0,edge:false,off:-1});
    const o={};for(const g of ['red','ink','off']){S.gore=g;const sh=sheet(()=>drawMarks(V));o[g]=read(sh);o[g].left=sh.left;}
    GoreLook.plain(()=>{for(const g of ['red','off']){S.gore=g;o['old_'+g]=sheet(()=>drawMarks(V)).left;}});S.gore='red';V.marks.length=0;return o;});
  expect('a cut and a bruise are drawn on him',r.red.n>20&&r.red.red>8,JSON.stringify({px:r.red.n,red:r.red.red}));
  expect('in ink they are violet, with the blood off there are none',r.ink.ink>8&&r.ink.red===0&&r.off.n===0,JSON.stringify({ink:r.ink.ink,red:r.ink.red,off:r.off.n}));
  expect('the marks leave the context as the old ones did',JSON.stringify(r.red.left)===JSON.stringify(r.old_red)&&JSON.stringify(r.off.left)===JSON.stringify(r.old_off),JSON.stringify([r.red.left,r.old_red]));
  await save('marks','(()=>{const V=S.F[1];V.marks.push({a:PEL,b:CHE,u:.55,ang:.7,len:7,edge:true,off:1},{a:PEL,b:CHE,u:.3,ang:0,len:0,edge:false,off:-1});const u=png(sheet(()=>drawMarks(V)));V.marks.length=0;return u;})()');

  // ---------- a weapon left in the body ----------
  r=await p.evaluate(()=>{duel('sword');S.forceStuck=true;blow('thrust',1);const V=S.F[1];const got=until(()=>S.items&&S.items.some(it=>it.stuck),900);S.forceStuck=false;if(!got)return{got};step(30);
    const it=S.items.find(i=>i.stuck),io=GoreLook.probe.itemInside(it);if(!io)return{got,io:null};const inT=inCap(io.T,1.5),neu=read(sheet(()=>drawItem(it)),inT);
    const old=GoreLook.plain(()=>read(sheet(()=>drawItem(it)),inT));return{got,u0:+io.u0.toFixed(3),u1:+io.u1.toFixed(3),neu,old};});
  expect('a sword left in him stays in him',r.got&&r.u0!=null,JSON.stringify({got:r.got,u0:r.u0}));
  if(r.neu)expect('and nothing of it is drawn inside him (the old drawing drew it there)',r.neu.inT===0&&r.old.inT>20&&r.neu.n>r.old.n*.3,'new '+r.neu.inT+' of '+r.neu.n+', old '+r.old.inT+' of '+r.old.n);
  await save('stuck','png(sheet(()=>drawItem(S.items.find(i=>i.stuck))))');

  // ---------- a head cut off ----------
  r=await p.evaluate(()=>{duel('sword');blow('slash',1,{fin:'behead'});const V=S.F[1];const got=until(()=>V.severed,900);if(!got)return{got,fin:V.finType};step(4);
    const neu=sheet(()=>drawStump(V)),o={got,neu:read(neu),left:neu.left.fillStyle};GoreLook.plain(()=>{const old=sheet(()=>drawStump(V));o.old=read(old);o.oldLeft=old.left.fillStyle;});
    step(50);o.trail=GoreLook.probe.own();return o;});
  expect('a head cut off leaves a stump, not the old disc',r.got&&r.neu.n>8&&r.neu.red>4&&(r.neu.r!==r.old.r||r.neu.n!==r.old.n),JSON.stringify({got:r.got,fin:r.fin,neu:r.neu,old:r.old}));
  if(r.got){expect('the stump leaves the context as the old disc did',r.left===r.oldLeft,r.left+' '+r.oldLeft);
    expect('the head leaves drops behind it as it flies',r.trail.drops+r.trail.stains>3,JSON.stringify(r.trail));}
  await save('stump','png(sheet(()=>drawStump(S.F[1])))');

  console.log(rep.join('\n'));
  if(errs.length){console.log('\nFAILED '+errs.length+':\n'+errs.join('\n'));await b.close();process.exit(1);}
  console.log('\ngore page: all '+rep.length+' checks pass');await b.close();})();
