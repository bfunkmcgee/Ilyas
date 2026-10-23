// The light and the effects (sk_lightui.js) in the real page (Playwright, a fake clock): the setting (Full by default, Lite and Off in the
// menu, kept for the next visit, the vignette following it), the game never touched by them (the same fight to the last joint with the
// effects on or off), each fighter drawn once a frame into his own sprite and set down exactly where he was drawn before, the shadows the
// lamps throw, the reflections on a wet street, a man struck going white, a blow's light on the floor, Lite without sprites, every ground
// and room drawn without an error, and a device that cannot keep up moved down to Lite on its own (and not when the player chose).
// usage: node sk_light_page.js   (needs test_page.html from build.py; PAGE=... for another build). Ends with "errors 0 []".
// Every check here is about the picture, so this suite draws every frame (the others draw one in eight; see GUIDE.md).
const SK_T0=Date.now();
const {chromium}=require('playwright');
const PAGE=process.env.PAGE||'test_page.html';
(async()=>{
const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[],rep=[];
const expect=(label,cond,info)=>{rep.push((cond?'ok   ':'FAIL ')+label+(process.env.SK_TIMING?' ['+((Date.now()-SK_T0)/1000).toFixed(1)+'s]':'')+(info?'  '+info:''));if(!cond)errs.push(label+(info?' ('+info+')':''));};
async function open(w,h,o={}){const ctx=await b.newContext({viewport:{width:w||1300,height:h||860},deviceScaleFactor:1,...o}),p=await ctx.newPage();
  p.on('pageerror',e=>errs.push('page: '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts|ERR_|net::/.test(m.text()))errs.push('console: '+m.text());});
  await p.addInitScript(e=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};if(e)window.__drawEvery=e;},+process.env.SK_DRAW_EVERY||0);
  await p.goto('file://'+process.cwd()+'/'+PAGE);await p.waitForTimeout(250);
  await p.evaluate(()=>{S.soundOn=false;window.__now=performance.now()+1000;window.step=(k,o)=>{const ev=(o&&o.every)||window.__drawEvery||1;for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(!f)continue;if(ev===1||(window.__fc=(window.__fc||0)+1)%ev===0)f(window.__now);else{const R=window.render;window.render=()=>{};try{f(window.__now);}finally{window.render=R;}}}};window.__drawEvery=window.__drawEvery||1;window.drawAll=fn=>{const e=window.__drawEvery;window.__drawEvery=1;try{return fn();}finally{window.__drawEvery=e;}};
    window.seed=s=>{let a=s;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;};
    window.fight=o=>{seed(o.seed||11);const room=['dining','kitchen','lobby','office'].includes(o.arena);S.arenaKey=room?'restaurant':(o.arena||'street');S.backroom=false;S.deep=false;
      S.introOn=false;S.cfg.n=o.n||1;S.cfg.crew=false;S.cfg.ally.on=!!o.ally;S.auto=!!o.auto;S.allyAuto=!!o.auto;S.F=[];rosterBuild();restart();};
    window.put=(f,x,z,fa)=>{f.station=x;f.lane=z;f.dep=z;f.stepDep=z;f.vdep=0;f.facing=fa;f.build();};
    // two men standing still, placed by hand, and the frame settled
    window.pose=(arena,kx,kz,ex,ez)=>{fight({arena});const K=S.F[0],V=S.F[1];put(K,kx,kz,ex>kx?1:-1);put(V,ex,ez,ex>kx?-1:1);
      const g=S.game;g.phase='input';g.active=0;g.aiAt=null;S.opening=null;g.ex=null;step(60);};
    window.px=(x0,y0,w,h)=>Array.from(document.getElementById('cv').getContext('2d').getImageData(x0,y0,w,h).data);
    window.lum=(x0,y0,w,h)=>{const d=px(x0,y0,w,h);let s=0;for(let i=0;i<d.length;i+=4)s+=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];return s/(d.length/4);};
    // where a fighter's feet are on the canvas, and his height there
    window.feet=f=>{const s=cv.width/cam.viewW,L=cam.x-cam.viewW/2,T=camTop(),x=(f.p[FTF].x+f.p[FTB].x)/2;return{x:(prjX(x,f.dep)-L)*s,y:(prjY(f.gr(x),f.dep)-T)*s,h:(f.gr(x)-f.p[HEAD].y)*s,s};};});
  return p;}
const ev=(p,f,a)=>p.evaluate(f,a);

// ---- the setting
{const p=await open();
  const r=await ev(p,()=>{const seg=document.getElementById('fxSeg');return{q:FXL.q,on:FXL.on(),full:FXL.full(),fx:document.getElementById('wrap').dataset.fx,
    btns:seg?[...seg.querySelectorAll('button')].map(b=>b.textContent+':'+b.getAttribute('aria-pressed')).join(' '):null,inArena:!!document.querySelector('.b-arena #fxSeg'),
    vig:getComputedStyle(document.querySelector('.stage'),'::before').backgroundImage.slice(0,15)};});
  expect('the effects are Full in a new browser, set in the menu\'s Arena panel (Off, Lite, Full), the vignette over the stage',
    r.q==='full'&&r.on&&r.full&&r.fx==='full'&&r.btns==='Off:false Lite:false Full:true'&&r.inArena&&/gradient/.test(r.vig),JSON.stringify(r));
  const r2=await ev(p,()=>{document.querySelector('#fxSeg [data-fx="lite"]').click();const a={q:FXL.q,fx:document.getElementById('wrap').dataset.fx,ls:localStorage.getItem('sk_fx'),user:FXL.user};
    document.querySelector('#fxSeg [data-fx="off"]').click();const vg=getComputedStyle(document.querySelector('.stage'),'::before').backgroundImage;
    return{a,q:FXL.q,on:FXL.on(),vg,pressed:document.querySelector('#fxSeg [data-fx="off"]').getAttribute('aria-pressed')};});
  expect('Lite and Off are chosen from the menu and kept; with Off the effects and the vignette are gone',
    r2.a.q==='lite'&&r2.a.fx==='lite'&&r2.a.ls==='lite'&&r2.a.user&&r2.q==='off'&&!r2.on&&r2.vg==='none'&&r2.pressed==='true',JSON.stringify(r2));
  await p.reload();await p.waitForTimeout(250);
  const r3=await ev(p,()=>({q:FXL.q,fx:document.getElementById('wrap').dataset.fx}));
  expect('the choice is there on the next visit',r3.q==='off'&&r3.fx==='off',JSON.stringify(r3));
  await ev(p,()=>{localStorage.removeItem('sk_fx');});await p.context().close();}

// ---- the game is never touched: the same fight, frame for frame, with the effects on and off
{const st=async q=>{const p=await open();const r=await ev(p,q=>{FXL.set(q);fight({arena:'street',n:2,ally:true,auto:true,seed:7});S.introOn=false;step(1500);
    return{h:S.F.map(f=>[f.hp,Math.round(f.station*100),Math.round(f.dep*100),f.p.map(q=>Math.round(q.x*10)+','+Math.round(q.y*10)).join(';')].join('|')).join('#'),t:S.t.toFixed(4),turn:S.game.turn,log:S.log?S.log.length:0};},q);
    await p.context().close();return r;};
  const a=await st('full'),o=await st('off');
  expect('the same seeded fight, 1500 frames, comes out the same with the effects Full and Off (every joint, hit point and turn)',a.h===o.h&&a.t===o.t&&a.turn===o.turn,JSON.stringify({t:[a.t,o.t],turn:[a.turn,o.turn],same:a.h===o.h}));}

// ---- each fighter drawn once a frame, into his own sprite, set down where he was drawn before
{const p=await open();
  const r=await ev(p,()=>{pose('street',360,90,470,90);let n=0;const _k=KaelLook.draw;KaelLook.draw=function(c,F,o){n++;return _k.call(this,c,F,o);};step(20);KaelLook.draw=_k;
    const K=S.F[0],R=FXL.sprite(K),V=FXL.sprite(S.F[1]);
    // the frame with only the sprites (no light on them, no shadows cast, no reflections, no air) against the frame without the effects
    Object.assign(FXL.skip,{lit:true,refl:true,cast:true,floor:true,air:true,fx:true});render();const box=[R.x,R.y,R.w,Math.round(R.h*.62)],A=px(...box);
    FXL.set('off');render();const B=px(...box);FXL.set('full');for(const k in FXL.skip)FXL.skip[k]=false;
    let big=0,sum=0;for(let i=0;i<A.length;i+=4){const d=Math.max(Math.abs(A[i]-B[i]),Math.abs(A[i+1]-B[i+1]),Math.abs(A[i+2]-B[i+2]));sum+=d;if(d>24)big++;}
    return{calls:n,sprite:!!R&&!!V,box,mean:+(sum/(A.length/4)).toFixed(3),bigShare:+(big/(A.length/4)).toFixed(4)};});
  expect('each frame draws Kael through his look once, into a sprite of his own (his enemy too)',r.calls===20&&r.sprite,JSON.stringify(r));
  expect('set down from the sprite, his picture is the one drawn straight onto the canvas (all but the edges of his glows)',r.mean<1.2&&r.bigShare<.01,JSON.stringify(r));
  await p.context().close();}

// ---- the shadows the lamps throw, the reflections on the wet street
{const p=await open();
  const r=await ev(p,()=>{pose('dining',300,80,430,62);const V=S.F[1],D=FXL.dbg(),sv=D.sprites.find(s=>s.i===V.idx);const sh=sv&&sv.sh[0],F=feet(V);
    // the middle of the main shadow: halfway up him, laid out along the floor
    const mx=Math.round(F.x+sh.vx*F.h*.4),my=Math.round(F.y+sh.vy*F.h*.4+sh.ay*0),box=[mx-8,my-6,16,12];
    const full=lum(...box);FXL.set('lite');render();const lite=lum(...box);FXL.set('full');render();
    return{casters:D.casters.length,sh,box,full:+full.toFixed(1),lite:+lite.toFixed(1)};});
  expect('in the dining room each lit lamp near a man throws his shadow: the floor where it falls is darker than without it',
    r.casters>=6&&r.sh&&r.sh.a>.2&&r.full<r.lite*.9,JSON.stringify(r));
  // (the knees and hips: further down, the world's foot fades out into the dark under the floor)
  const w=await ev(p,()=>{pose('street',360,110,520,110);const K=S.F[0],F=feet(K),hy=Math.round(F.y+(F.y-(prjY(K.p[PEL].y,K.dep)-camTop())*F.s));
    Object.assign(FXL.skip,{air:true});render();const box=[Math.round(F.x)-30,hy-24,60,40],full=px(...box);FXL.set('lite');render();const lite=px(...box);FXL.set('full');FXL.skip.air=false;
    let d=0;for(let i=0;i<full.length;i++)d+=Math.abs(full[i]-lite[i]);return{box,diff:+(d/full.length).toFixed(2),wet:FXL.dbg().cfg.wet};});
  expect('on the wet street a man\'s reflection hangs from his feet: his hips show as far below the flags as they stand above them',w.wet>=.3&&w.diff>2,JSON.stringify(w));
  await p.context().close();}

// ---- a man struck goes white for a moment; a blow's light falls on the floor and on the men by it
{const p=await open();
  const r=await ev(p,()=>{pose('street',360,90,470,90);const V=S.F[1],R0=FXL.sprite(V);const box=()=>{const R=FXL.sprite(V);return[R.x+Math.round(R.w*.3),R.y+Math.round(R.h*.2),Math.round(R.w*.4),Math.round(R.h*.4)];};
    render();const b0=lum(...box());V.hp-=12;render();const b1=lum(...box());const f1=FXL.sprite(V)?1:0;
    // and after it, back to himself
    step(30);const b2=lum(...box());
    // a flash of the game's at the floor between them
    const F=feet(V),gx=(S.F[0].p[CHE].x+V.p[CHE].x)/2,fy=V.gr(gx);
    const fl0=lum(Math.round(F.x)-120,Math.round(F.y)-6,100,14);S.flashes.push({x:gx,y:fy-60,d:90,r:48,color:'#fff1c9',age:0,life:.24});render();
    const lights=FXL.dbg().lights,fl1=lum(Math.round(F.x)-120,Math.round(F.y)-6,100,14);S.flashes.length=0;
    return{b0:+b0.toFixed(1),b1:+b1.toFixed(1),b2:+b2.toFixed(1),f1,lights,fl0:+fl0.toFixed(1),fl1:+fl1.toFixed(1)};});
  expect('struck (his hit points drop), a man goes white for an instant and then is himself again',r.b1>r.b0+25&&Math.abs(r.b2-r.b0)<6,JSON.stringify(r));
  expect('the flash of a blow is a light: it throws a pool on the floor round it',r.lights>=1&&r.fl1>r.fl0+4,JSON.stringify(r));
  await p.context().close();}

// ---- Lite: no sprites; every ground and room draws without an error in each setting
{const p=await open();
  const r=await ev(p,()=>{const out={};for(const q of ['lite','full','off']){FXL.set(q);
      for(const a of ['street','field','hill','ledge','wall','dining']){fight({arena:a,n:2,ally:true,auto:true,seed:5});step(90);out[q+':'+a]=S.F.filter(f=>FXL.sprite(f)).length;}}
    return out;});
  expect('Lite and Off draw no sprites; Full draws one for each man on the ground (every ground and room drawn in all three)',
    Object.entries(r).every(([k,n])=>k.startsWith('full')?n>=3:n===0),JSON.stringify(r));
  await p.context().close();}

// ---- a device that cannot keep up goes down to Lite on its own, unless the player has chosen
{const p=await open();
  const r=await ev(p,()=>{const T=window.SK_TEST;window.SK_TEST=0;FXL.set('full');
    for(let i=0;i<120;i++)FXL.done(6,17);const fast=FXL.q;for(let i=0;i<120;i++)FXL.done(15,34);const slow=FXL.q,note=!document.getElementById('fxNote').hidden;
    FXL.set('full',true);for(let i=0;i<240;i++)FXL.done(15,34);const chosen=FXL.q;window.SK_TEST=T;localStorage.removeItem('sk_fx');return{fast,slow,note,chosen};});
  expect('frames at sixty a second keep Full; slow frames that take long to draw move it to Lite (with a note in the menu); a choice made in the menu stays',
    r.fast==='full'&&r.slow==='lite'&&r.note&&r.chosen==='full',JSON.stringify(r));
  await p.context().close();}

for(const l of rep)console.log(l);
console.log('errors',errs.length,JSON.stringify(errs));
await b.close();})();
