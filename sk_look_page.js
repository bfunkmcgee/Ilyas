// Page checks for Kael's look (sk_lookui.js): he is drawn by KaelLook and nobody else is, in every arena and room, with every weapon,
// in every state the fights put him in, and with the coat's own physics.
// usage: node sk_look_page.js   (needs test_page.html from build.py)
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
    await p.evaluate(()=>{S.soundOn=false;let a=11;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
      window.__now=performance.now()+1000;window.step=(k,o)=>{const ev=(o&&o.every)||window.__drawEvery||1;for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(!f)continue;if(ev===1||(window.__fc=(window.__fc||0)+1)%ev===0)f(window.__now);else{const R=window.render;window.render=()=>{};try{f(window.__now);}finally{window.render=R;}}}};window.__drawEvery=window.__drawEvery||8;window.drawAll=fn=>{const e=window.__drawEvery;window.__drawEvery=1;try{return fn();}finally{window.__drawEvery=e;}};
      // every call to KaelLook.draw is counted, with who it was for
      // (and the frames drawn: one in eight outside drawAll)
      window.CALLS={kael:0,other:0,ms:0,rips:0,frames:0,turned:0};const _rd=window.render;window.render=function(){CALLS.frames++;return _rd.apply(this,arguments);};const _d=KaelLook.draw;KaelLook.draw=function(c,F,o){if(F===S.F[0])CALLS.kael++;else CALLS.other++;
        const prev=o&&o.onRip,o2=Object.assign({},o,{onRip:(r,ctr,cc)=>{CALLS.rips++;if(prev)prev(r,ctr,cc);}});
        const t=performance.now();const r=_d.call(this,c,F,o2);CALLS.ms+=performance.now()-t;
        // (drawn turned, in a spin or a turn round: a tear on the side away from the viewer is not drawn)
        if(F===S.F[0]){const sn=KaelLook.seen.get(F);if(sn&&sn.turned)CALLS.turned++;}return r;};
      window.fight=(o)=>{S.arenaKey=o.arena||'field';S.introOn=!!o.intro;S.tableOn=!!o.table;S.divOn=false;S.cfg.n=o.n||1;S.cfg.crew=!!o.crew;S.cfg.ally.on=!!o.ally;S.auto=!!o.auto;
        S.cfg.hero.weapon=o.hero||'elven';S.cfg.hero.skill=o.hs||4;(o.foes||['sword']).forEach((w,i)=>{S.cfg.foes[i].weapon=w;S.cfg.foes[i].skill=3;S.cfg.foes[i].temper='plain';});
        S.F=[];rosterBuild();restart();step(3);};
      window.put=(f,x,z,fa)=>{f.station=x;f.lane=z;f.dep=z;f.stepDep=z;f.vdep=0;f.facing=fa;f.build();};
      window.mine=()=>{const g=S.game;g.phase='input';g.active=0;g.aiAt=null;S.opening=null;g.ex=null;for(const f of S.F){f.foot=FOOT_MAX;f.guarding=false;f.counter=false;f.intent=null;}updateStatus();};
      // the enemy lands a blow of a given kind on Kael with a forced outcome (the die is picked to give it)
      window.FORCE=[];const _ra=resolveAttack;resolveAttack=function(A,D,kind,op,T){T=T||pickTechnique(A,D,kind);const want=FORCE.shift();if(!want)return _ra(A,D,kind,op,T);const c=computeMods(A,D,kind,op,T);let pick=null;
        for(let v=2;v<=20;v++){const tot=v+c.bonus,o=isCrit(v,tot,c.def)?'crit':tot>=c.def?'hit':tot>=c.def-4?'block':'dodge';if(o===want){pick=v;break;}}
        if(pick==null)return _ra(A,D,kind,op,T);const save=S.rng;let first=true;S.rng=()=>{if(first){first=false;return(pick-.5)/20;}return save();};const r=_ra(A,D,kind,op,T);S.rng=save;return r;};
      window.foeHit=(k,out)=>{const g=S.game,V=S.F[1],K=S.F[0];V.station=K.station+engageGap(K,V)*K.facing;V.lane=K.lane;V.dep=V.lane;V.stepDep=V.lane;
        g.phase='input';g.active=1;g.aiAt=null;S.opening=null;g.ex=null;K.hp=K.maxHp;K.foot=FOOT_MAX;K.downed=false;FORCE=[out||'hit'];command(1,slotAction(V,targetOf(V),k));
        // (Kael answers the blow at once: a step back, which changes nothing about how it is made)
        if(S.opening&&S.opening.source==='react')resolveOpening('back');step(120);
        if(K.downed)standUp(K);g.phase='input';g.active=0;g.aiAt=null;S.opening=null;g.ex=null;step(40);};
      // where each tear was drawn on the last frame, in canvas pixels, and the colour there
      // (V38: Kael is drawn into a sprite of his own and set down on the canvas: a tear's place on the sprite is moved by where the sprite sits)
      window.tearPx=()=>{const out=[],_d=KaelLook.draw;KaelLook.draw=function(c,F,o){return _d.call(this,c,F,Object.assign({},o,{onRip:(r,ctr,cc)=>{const m=cc.getTransform();
          out.push({g:r.g,stab:r.stab,cc,x:Math.round(m.a*ctr.x+m.c*ctr.y+m.e),y:Math.round(m.b*ctr.x+m.d*ctr.y+m.f)});}}));};
        try{render();}finally{KaelLook.draw=_d;}const c=document.getElementById('cv').getContext('2d');
        for(const t of out){const o=typeof FXL!=='undefined'?FXL.offsetOf(t.cc):{x:0,y:0};t.x+=o.x;t.y+=o.y;delete t.cc;}
        // (the lining, too, is looked for round the tear's middle: a middle on the hole's edge or on a line of trim is no proof of none)
        for(const t of out){const d=c.getImageData(t.x,t.y,1,1).data;t.rgb=[d[0],d[1],d[2]];const w=c.getImageData(t.x-2,t.y-2,5,5).data;t.red=false;t.lining=false;
          for(let i=0;i<w.length;i+=4){if(w[i]>140&&w[i]-w[i+1]>55&&w[i]-w[i+2]>40)t.red=true;if(w[i+1]>150&&w[i+2]>140&&w[i]<140)t.lining=true;}}return out;};
      // pixels in a box round Kael's upper body, in canvas pixels: how many are gold and how many are his pale hair
      window.paint=()=>{const K=S.F[0],cv=document.getElementById('cv'),c=cv.getContext('2d'),s=cv.width/cam.viewW,viewH=cam.viewW/aspect,L=cam.x-cam.viewW/2,T=camTop();
        const cx=(prjX(K.p[CHE].x,K.dep)-L)*s,cy=(prjY(K.p[CHE].y,K.dep)-T)*s,w=Math.round(46*s),h=Math.round(60*s),x0=Math.round(cx-w/2),y0=Math.round(cy-h*.55);
        const d=c.getImageData(x0,y0,w,h).data;let gold=0,pale=0;
        for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],bb=d[i+2];if(r>190&&g>140&&g<215&&bb<130&&r-bb>90)gold++;if(r>215&&g>205&&bb>170&&bb<215)pale++;}return{gold,pale};};});
    return p;};
  const p=await open(1300,900,1);
  const ev=(fn,arg)=>p.evaluate(fn,arg);

  // ---- the setting ----
  const cfg=await ev(()=>({ok:KaelLook.ok,look:KaelLook.cfg.look,outfit:KaelLook.cfg.outfit,hair:KaelLook.cfg.hair}));
  expect('KaelLook can draw in the browser, set to Noir Gilt, the long coat and the swept-back hair',cfg.ok&&cfg.look==='noir'&&cfg.outfit==='coat'&&cfg.hair==='swept',JSON.stringify(cfg));

  // ---- Kael and only Kael ----
  const one=await ev(()=>drawAll(()=>{fight({n:2,foes:['sword','axe']});CALLS.kael=0;CALLS.other=0;step(40);return{...CALLS};}));
  expect('each frame draws Kael through KaelLook once, and nobody else through it',one.kael===40&&one.other===0,JSON.stringify(one));
  const px=await ev(()=>drawAll(()=>{fight({});const K=S.F[0],V=S.F[1];put(K,400,92,1);put(V,400+engageGap(K,V)+30,92,-1);step(30);const now=paint();
    S.classicLook=true;render();const old=paint();S.classicLook=false;CALLS.kael=0;render();return{now,old,calls:CALLS.kael};}));
  // (V34: the trim is as wide as it was, but it no longer runs over a rim of light the whole length of the edge, which used to lift its
  // softened pixels into the gold counted here, and the fuller arm covers some of it in this pose; so fewer pixels count, about 20)
  expect('the new look shows gold trim and pale hair on him; the old figure has neither',px.now.gold>12&&px.now.pale>15&&px.old.gold<6&&px.old.pale<6,JSON.stringify(px));
  const cl=await ev(()=>drawAll(()=>{S.classicLook=true;CALLS.kael=0;step(5);const n=CALLS.kael;S.classicLook=false;return n;}));
  expect('S.classicLook brings back the old figure',cl===0,cl);

  // ---- every arena and room ----
  const arenas=await ev(()=>{const out={};
    for(const a of ['street','field','ledge','hill','wall','restaurant']){fight({arena:a,n:2,auto:true,foes:['sword','spear']});CALLS.kael=0;CALLS.frames=0;step(240);
      const L=kaelLight(S.F[0]);out[a]={calls:CALLS.kael,frames:CALLS.frames,light:!!(L.light||L.dir)};}
    // through the restaurant room by room, the way the finale checks do it: clear each room and walk on
    S.arenaKey='restaurant';S.backroom=true;S.deep=true;S.introOn=false;S.cfg.n=1;S.cfg.crew=false;S.cfg.ally.on=false;S.auto=true;S.F=[];rosterBuild();restart();
    // a tear from the first room, to follow through the rest
    const tear={g:'torso',a:PEL,b:CHE,u:.5,off:-4,ang:1.4,stab:false,seed:7,len:11,wid:2.6};S.F[0].rips=[tear];
    const runUntil=(pred,max)=>{let n=0;while(!pred()&&n<(max||30000)){step(1);n++;}return n;};
    const clearNow=()=>{if(S.crew)S.crew.queue.length=0;S.opening=null;S.game.ex=null;for(const f of foes()){f.hp=0;kill(f,1);}if(nextRoom())beginTransit();};
    for(const r of ['dining','kitchen','lobby','office']){runUntil(()=>S.room===r&&!S.stage.tr&&(S.game.phase==='input'||S.game.phase==='exchange'));
      CALLS.kael=0;CALLS.rips=0;CALLS.frames=0;CALLS.turned=0;step(200);const L=kaelLight(S.F[0]);out[r]={calls:CALLS.kael,frames:CALLS.frames,light:!!(L.light||L.dir),indoor:!!S.arena.indoor,rips:CALLS.rips,turned:CALLS.turned,kept:S.F[0].rips.includes(tear)||S.F[0].rips.length===16};
      if(r!=='office'){CALLS.kael=0;CALLS.frames=0;clearNow();runUntil(()=>S.room!==r,4000);out[r].walk=CALLS.kael;out[r].walkFrames=CALLS.frames;}}
    return out;});
  // (every frame drawn draws him the new way: one frame in eight is drawn here)
  expect('he is drawn the new way in all five outdoor arenas and the four rooms of the restaurant',Object.values(arenas).every(v=>v.frames>=20&&v.calls===v.frames&&v.light),JSON.stringify(arenas));
  expect('indoors the light comes from the lamps overhead, and he walks from room to room drawn the new way',['dining','kitchen','lobby','office'].every(r=>arenas[r].indoor)&&['dining','kitchen','lobby'].every(r=>arenas[r].walkFrames>=4&&arenas[r].walk===arenas[r].walkFrames),
    JSON.stringify(['dining','kitchen','lobby'].map(r=>[arenas[r].walk,arenas[r].walkFrames])));
  // (every frame he is drawn in, unless drawn turned in a spin, when a tear in front is on the side away from the viewer)
  expect('a tear from the first room is still on him, and drawn, in every room after it',['dining','kitchen','lobby','office'].every(r=>arenas[r].kept&&arenas[r].rips>=arenas[r].frames-arenas[r].turned),
    JSON.stringify(['dining','kitchen','lobby','office'].map(r=>[arenas[r].kept,arenas[r].rips,arenas[r].frames,arenas[r].turned])));

  // ---- every weapon he can hold ----
  const wps=await ev(()=>drawAll(()=>{const out={};
    for(const w of ['elven','sword','axe','spear','dagger']){fight({hero:w});CALLS.kael=0;mine();setTgt(S.F[0],1);humanCommand('slash');step(90);out[w]=CALLS.kael;}
    for(const w of ['bottle','mug','chairleg','club','shard','stone','shaft','fists']){fight({});S.F[0].setWeapon(w);CALLS.kael=0;step(30);out[w]=CALLS.kael;}
    return out;}));
  expect('with the arc-blade, a sword, axe, spear, dagger, any improvised weapon or bare hands, he is drawn every frame',Object.values(wps).every(n=>n>=30),JSON.stringify(wps));

  // ---- the states fights put him in ----
  const st=await ev(()=>drawAll(()=>{const out={};const K=()=>S.F[0];
    fight({});put(K(),500,92,-1);CALLS.kael=0;step(20);out.facingLeft=CALLS.kael;
    fight({});knockDown(K());CALLS.kael=0;step(120);out.down=CALLS.kael;out.coatOnFloor=K()._coat.q.every(q=>q.y<=K().gr(q.x)+.01);
    fight({});K().daze=1;K().guarding=true;CALLS.kael=0;step(20);out.dazedGuard=CALLS.kael;
    fight({});K().sidearm='offhand';CALLS.kael=0;step(20);out.offhand=CALLS.kael;
    fight({});K().severed=true;kill(K());CALLS.kael=0;step(60);out.dead=CALLS.kael;
    fight({intro:true});CALLS.kael=0;const modes={};for(let i=0;i<120;i++){step(1);const m=arcState(K());modes[m?m.mode:'rigid']=1;}out.intro=CALLS.kael;out.introModes=Object.keys(modes).sort().join(',');
    // (the lash as it was before the stances, V70, with them off; in Unbound the blade is a bladed whip)
    STANCE.on=false;fight({});const V=S.F[1];put(K(),420,92,1);put(V,420+engageGap(K(),V)+100,92,-1);step(10);mine();V.foot=3;setTgt(K(),V.idx);humanCommand('sweep');
    const lm={};CALLS.kael=0;for(let i=0;i<60;i++){step(1);const m=arcState(K());lm[m?m.mode:'rigid']=1;}out.lash=CALLS.kael;out.lashModes=Object.keys(lm).sort().join(',');STANCE.on=true;
    fight({});const Vw=S.F[1];put(K(),420,92,1);put(Vw,420+engageGap(K(),Vw)+100,92,-1);step(10);mine();setStance(K(),'unbound');setTgt(K(),Vw.idx);humanCommand('slash');
    const wm={};CALLS.kael=0;for(let i=0;i<60;i++){step(1);const m=arcState(K());wm[m?m.mode:'rigid']=1;}out.whip=CALLS.kael;out.whipModes=Object.keys(wm).sort().join(',');
    fight({});const V2=S.F[1];put(K(),420,92,1);put(V2,420+engageGap(K(),V2),92,-1);step(10);mine();setTgt(K(),V2.idx);humanCommand('shove');CALLS.kael=0;step(60);out.shove=CALLS.kael;
    fight({});S.opening={f:K(),source:'test',left:1,dur:1};CALLS.kael=0;render();out.opening=CALLS.kael;S.opening=null;
    fight({});K().look={t0:S.t,end:5,keys:[[0,-1],[5,-1]],slow:true};CALLS.kael=0;step(5);out.glance=CALLS.kael;K().look=null;
    return out;}));
  expect('facing left, knocked down, dazed in guard, with the off-hand dagger, dead and beheaded, he is drawn every frame',
    st.facingLeft===20&&st.down===120&&st.dazedGuard===20&&st.offhand===20&&st.dead===60,JSON.stringify(st));
  expect('knocked down, the coat comes to rest on the floor and not through it',st.coatOnFloor,'');
  expect('the readying intro draws the blade rolled, unrolling and locking',st.intro===120&&/rolled/.test(st.introModes)&&/unroll/.test(st.introModes)&&/lock/.test(st.introModes),st.introModes);
  expect('the lash draws the blade strung out on its thread (the stances off)',st.lash===60&&/lash/.test(st.lashModes),st.lashModes);
  expect('in Unbound he is drawn every frame of a whip blow, the blade a bladed whip',st.whip===60&&/whip/.test(st.whipModes),st.whipModes);
  expect('a shove, an opening and a glance behind him all draw',st.shove===60&&st.opening===1&&st.glance===5,JSON.stringify([st.shove,st.opening,st.glance]));

  // ---- the coat has its own motion, and it behaves ----
  const coat=await ev(()=>drawAll(()=>{fight({});const K=S.F[0],V=S.F[1];put(K,400,92,1);put(V,400+engageGap(K,V)+40,92,-1);step(40);
    const before=K._coat.q.map(q=>({x:q.x,y:q.y}));mine();setTgt(K,V.idx);humanCommand('thrust');let moved=0,lag=0,pq=K._coat.q[1].x,pp=K.p[PEL].x;
    for(let i=0;i<30;i++){step(1);const q=K._coat.q[1];moved=Math.max(moved,Math.hypot(q.x-before[1].x,q.y-before[1].y));lag=Math.max(lag,Math.abs((K.p[PEL].x-pp)-(q.x-pq)));pq=q.x;pp=K.p[PEL].x;}
    return{moved:+moved.toFixed(1),lag:+lag.toFixed(2)};}));
  expect('on a thrust the coat swings and trails the body instead of moving with it',coat.moved>4&&coat.lag>.05,JSON.stringify(coat));
  const steady=await ev(()=>drawAll(()=>{const out={frames:0,jump:0,max:0,far:0,floor:0,bad:0};
    for(const a of ['field','street']){fight({arena:a,n:2,auto:true,foes:['sword','axe']});let prev=null,pp=null,pt=-1;
      for(let i=0;i<3000&&S.game.phase!=='over';i++){step(1);const K=S.F[0],st=K._coat;if(!st){prev=null;continue;}out.frames++;const q=st.q,P0=K.p[PEL];
        for(const z of q){if(!Number.isFinite(z.x)||!Number.isFinite(z.y))out.bad++;if(Math.hypot(z.x-P0.x,z.y-P0.y)>70)out.far++;if(z.y>K.gr(z.x)+.01)out.floor++;}
        // (a Glimmer step puts him somewhere else, turned round: the coat comes back hanging as it should, which is no jump across him)
        // (an elf's body covers ground fast, and a body thrown by one flies fast; the coat trailing it and catching up moves fast too:
        // a swing counts against the coat only by how far it outruns half of what the body itself moved that frame)
        if(prev&&!S.stage.tr&&!(K.warpAt!=null&&K.warpAt>pt)){const d=Math.max(...q.map((z,j)=>Math.hypot(z.x-prev[j].x-(P0.x-pp.x),z.y-prev[j].y-(P0.y-pp.y)))),mv=.5*Math.hypot(P0.x-pp.x,P0.y-pp.y);
          out.max=Math.max(out.max,d-mv);if(d>10+mv)out.jump++;}
        prev=q.map(z=>({x:z.x,y:z.y}));pp={x:P0.x,y:P0.y};pt=S.t;}}
    out.max=+out.max.toFixed(1);return out;}));
  expect('through two whole fights the coat stays on him, above the floor, and only ever swings (no corner jumps across him)',
    steady.frames>2000&&steady.bad===0&&steady.far===0&&steady.floor===0&&steady.max<25&&steady.jump<=steady.frames*.003,JSON.stringify(steady));
  // ---- the wind of a ride ----
  const kw=await ev(()=>{const a=S.arena,k=S.arenaKey,sv=S.scrollV,out=[];
    try{S.arena=Object.assign({},a,{scroll:true});S.scrollV=1050;out.push(kaelWind({mount:{vx:-20}}));S.arenaKey='tunnel';S.scrollV=900;out.push(kaelWind({}));
      S.arena=Object.assign({},a,{scroll:false});S.arenaKey='field';out.push(kaelWind({}),kaelWind({mount:{vx:640}}));}finally{S.arena=a;S.arenaKey=k;S.scrollV=sv;}return out;});
  expect('the wind of a ride: on a bike, the road going by and the bike\'s own speed; on the train in the tunnel, the line\'s; on foot, none',
    kw[0]===-1030&&kw[1]===-900&&kw[2]===0&&kw[3]===-640,JSON.stringify(kw));
  const wind=await ev(()=>drawAll(()=>{fight({});const K=S.F[0],V=S.F[1];put(K,420,92,1);put(V,760,92,-1);const w0=window.kaelWind;let W=-1050;window.kaelWind=()=>W;
    const rel=()=>K._coat.q.map(c=>({x:Math.round(c.x-K.p[PEL].x),y:Math.round(c.y-K.p[PEL].y)}));
    try{step(90);const blown=rel();W=1050;step(90);const behind=rel();W=0;step(120);return{blown,behind,still:rel()};}finally{window.kaelWind=w0;}}));
  expect('in a headwind the coat streams out behind him, its back corner near level with his hips; a wind from behind blows it out in front; when the wind drops it hangs again',
    wind.blown.every(c=>c.x<-20)&&Math.min(...wind.blown.map(c=>c.y))<22&&wind.behind.every(c=>c.x>20)&&wind.still.every(c=>Math.abs(c.x)<20&&c.y>35),JSON.stringify(wind));
  // ---- the coat off: the muscled arms, the tattoos, and the scars they become ----
  const mus=await ev(()=>{const P=(x,y)=>({x,y}),S0=P(0,0),E=P(0,30),W=P(14,52),fr=KaelLook.armFront(S0,E,W,P(1,0)),tb=KaelLook.bareTube(S0,E,W,1,false,fr);
    // (the upper arm runs straight down, the forearm bends toward +x: its front, the biceps' side, is +x; the width each side at a height)
    const side=(y0,y1)=>{let f=0,b=0;for(const q of tb.o)if(q.y>=y0&&q.y<=y1){f=Math.max(f,q.x);b=Math.max(b,-q.x);}return[+f.toFixed(2),+b.toFixed(2)];};
    return{frontIsPlusX:fr===false,high:side(6,10),biceps:side(17,21),elbow:side(28,31)};});
  expect('bare, his arm has a muscled outline: the triceps fuller behind high on the upper arm and flattening into the elbow, the biceps fuller in front lower down',
    mus.frontIsPlusX&&mus.high[1]>mus.high[0]&&mus.high[1]>mus.elbow[1]*1.3&&mus.biceps[0]>mus.biceps[1]*1.12&&mus.biceps[0]>mus.high[0]*1.15,JSON.stringify(mus));
  const tat=await ev(()=>drawAll(()=>{fight({});const K=S.F[0],V=S.F[1];put(K,420,92,1);put(V,760,92,-1);K.coatOff=true;
    const count=()=>{render();const cv=document.getElementById('cv'),c=cv.getContext('2d'),s=cv.width/cam.viewW,L=cam.x-cam.viewW/2,T=camTop();
      const cx=(prjX(K.p[CHE].x,K.dep)-L)*s,cy=(prjY(K.p[CHE].y,K.dep)-T)*s,w=Math.round(70*s),h=Math.round(80*s),x0=Math.round(cx-w/2),y0=Math.round(cy-h*.6),d=c.getImageData(x0,y0,w,h).data;
      let cyan=0,scar=0;for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2];if(g>170&&b>160&&r<170&&g-r>50)cyan++;if(r>70&&r<190&&b>60&&g<r&&g<b&&r-g>8&&b-g>4&&r-g<70)scar++;}return{cyan,scar};};
    try{K.drain=0;step(30);const lit=count();K.drain=1;step(30);const dark=count();return{lit,dark};}finally{K.drain=0;K.coatOff=false;}}));
  expect('with the coat off his tattoos glow; once the magic has gone out of him they are scars, and the glow is gone from his arms, his eye and the crystal clasps on his vest',
    tat.lit.cyan>40&&tat.dark.cyan<tat.lit.cyan*.15&&tat.dark.scar>tat.lit.scar+30,JSON.stringify(tat));
  // ---- the end of the fall: a faint light back in his eye, the arm left on the spike still lit ----
  const eye=await ev(()=>drawAll(()=>{fight({});const K=S.F[0],V=S.F[1];put(K,420,92,1);put(V,760,92,-1);K.coatOff=true;
    // (the cyan in a box round his head: how far each pixel's green and blue stand above its red)
    const glow=()=>{render();const cv=document.getElementById('cv'),c=cv.getContext('2d'),s=cv.width/cam.viewW,L=cam.x-cam.viewW/2,T=camTop(),H0=K.p[HEAD];
      const cx=(prjX(H0.x,K.dep)-L)*s,cy=(prjY(H0.y,K.dep)-T)*s,w=Math.round(30*s),h=Math.round(26*s),d=c.getImageData(Math.round(cx-w/2),Math.round(cy-h/2),w,h).data;
      let e=0;for(let i=0;i<d.length;i+=4)e+=Math.max(0,(d[i+1]+d[i+2])/2-d[i]-20);return Math.round(e);};
    try{K.drain=0;K.eyeLit=0;step(20);const lit=glow();K.drain=1;step(20);const dark=glow();K.eyeLit=FALL_EYE;step(20);const back=glow();return{lit,dark,back};}finally{K.drain=0;K.eyeLit=0;K.coatOff=false;}}));
  expect('drained, his eye has no light; at the end of the fall a faint light comes back into it, well short of what it had',
    eye.dark<eye.back*.5&&eye.back<eye.lit*.8,JSON.stringify(eye));
  const piece=await ev(()=>{const cv=document.createElement('canvas');cv.width=220;cv.height=220;const c=cv.getContext('2d');
    const draw=dr=>{c.setTransform(1,0,0,1,0,0);c.fillStyle='#000';c.fillRect(0,0,220,220);c.setTransform(3.4,0,0,3.4,100,30);
      KaelLook.armPiece(c,{S:{x:0,y:0},E:{x:2,y:24},H:{x:6,y:46}},{coatOff:true,sz:1,fa:1,drain:dr,gore:null});
      const d=c.getImageData(0,0,220,220).data;let e=0;for(let i=0;i<d.length;i+=4)e+=Math.max(0,(d[i+1]+d[i+2])/2-d[i]-20);return Math.round(e);};
    const A={t0:S.t},at0=pitArmDrain(A);A.t0=S.t-2.2;return{scars:draw(1),lit:draw(0),at0,after:pitArmDrain(A)};});
  expect('the arm left on the spike: its lines are scars while it is his, and light again once it has come away',
    piece.lit>piece.scars*4&&piece.at0===1&&piece.after===0,JSON.stringify(piece));
  const tent=await ev(()=>{const gy=()=>100,an=[{p:{x:0,y:80},len:46,pts:[{x:2,y:90},{x:4,y:98}],clear:4.2},{p:{x:-2,y:80},len:47,pts:[{x:2,y:90},{x:4,y:98},{x:-3,y:92},{x:-5,y:99}],clear:4.8}];
    const lift=y=>an.map(a=>({...a,p:{x:a.p.x,y}})),spread=T=>+Math.max(...T.map((t,i)=>Math.abs(t.x-an[i].p.x))).toFixed(1);
    const kneel=KaelLook.coatTargets(an,1,gy),lying=KaelLook.coatTargets(lift(99),1,gy),stand=KaelLook.coatTargets(lift(40),1,gy);
    return{kneel:spread(kneel),lying:spread(lying),stand:spread(stand),kneelFloor:kneel.every(t=>t.y>98&&t.y<=99),standFree:stand.every(t=>t.y<98)};});
  expect('kneeling or lying, the hem rests on the floor close round him instead of spreading the coat into a tent',
    tent.kneel<24&&tent.lying<24&&tent.kneelFloor&&tent.standFree&&tent.stand<12,JSON.stringify(tent));
  const hem=await ev(()=>{const tears=[{t:.85,d:9,w:4}],gy=()=>101,top=h=>Math.min(...h.pts.map(q=>q.y));
    const long=KaelLook.hemLine({x:0,y:100},{x:-40,y:100},2,tears,{x:-20,y:60},gy),short=KaelLook.hemLine({x:0,y:100},{x:-12,y:100},2,tears,{x:-6,y:60},gy);
    return{long:+top(long).toFixed(1),short:+top(short).toFixed(1),floor:[long,short].every(h=>h.pts.every(q=>q.y<=100.5+1e-9)),trim:long.runs.length>=2&&short.runs.length>=1};});
  expect('a notch torn in the hem stays there however short the hem gets, and the hem never sags through the floor',hem.long<93&&hem.short<93&&hem.floor&&hem.trim,JSON.stringify(hem));

  // ---- his clothes take the damage ----
  const real=await ev(()=>{fight({});const K=S.F[0],V=S.F[1];put(K,420,92,1);put(V,420+engageGap(K,V),92,-1);step(30);
    const log=[],_h=S.hooks.rip;S.hooks.rip=(A,D,res,C,zone,edge,m)=>{const n0=(D.rips||[]).length;_h(A,D,res,C,zone,edge,m);const r=(D.rips||[]).slice(-1)[0];
      log.push({kind:res.kind,key:res.tech&&res.tech.key,name:res.tech&&res.tech.name,zone,edge,added:(D.rips||[]).length-n0,g:r&&r.g,stab:r&&r.stab,mrip:!!(m&&m.rip)});};
    for(const [k,o] of [['slash','hit'],['thrust','hit'],['overhead','hit'],['sweep','crit'],['thrust','crit'],['slash','crit'],['sweep','hit']])foeHit(k,o);
    // (his coat moves only when he is drawn: settle him drawn every frame, so the picture does not hang on which frames earlier checks drew)
    S.hooks.rip=_h;drawAll(()=>step(40));const px=tearPx();return{log,n:(K.rips||[]).length,px};});
  const BL=['pommel','butt','buttsweep','haft','shaftsweep','murder','kick'],cutting=real.log.filter(l=>l.edge&&l.zone!=='head'&&!BL.includes(l.key));
  expect('every cut or stab that lands on his body, arms or legs tears the suit there, and the wound it leaves moves into the tear',
    cutting.length>=4&&cutting.every(l=>l.added===1&&l.mrip),JSON.stringify(real.log.map(l=>[l.kind,l.name,l.zone,l.added,l.g])));
  expect('a thrust or a stab leaves a torn hole, a cut a slit',cutting.some(l=>l.stab)&&cutting.some(l=>!l.stab)&&cutting.every(l=>l.stab===(l.kind==='thrust'||/stab/i.test(l.name))),'');
  const shown=real.px.filter(t=>Math.max(...t.rgb)>90&&t.red);
  expect('in his guard the tears show, with the wound inside them',real.px.length===real.n&&shown.length>=real.n*.7,JSON.stringify(real.px.map(t=>t.g+':'+t.rgb.join(',')+(t.red?':red':''))));
  const unit=await ev(()=>{fight({});const K=S.F[0],V=S.F[1];put(K,420,92,1);put(V,420+engageGap(K,V),92,-1);step(30);K.rips=[];K.hemTears=[];
    const at=j=>({x:K.p[j].x,y:K.p[j].y}),hit=(kind,zone,C,o)=>S.hooks.rip(V,K,Object.assign({kind,tech:{key:'std',name:'Cut'},out:'hit',dmg:10},o||{}),C,zone,true,null);
    hit('slash','body',at(CHE),{tech:{key:'pommel',name:'Pommel strike'}});hit('overhead','body',at(CHE),{tech:{key:'std',name:'Butt end',along:-5}});hit('sweep','leg',at(KNF),{tech:{key:'kick',name:'Leg kick',kick:true}});
    const mk={a:CHE,b:HEAD,u:.5,ang:0,len:6,edge:true};S.hooks.rip(V,K,{kind:'slash',tech:{key:'pommel',name:'Pommel strike'},out:'hit',dmg:8},at(CHE),'body',true,mk);
    const blunt=K.rips.length,bruise=!mk.edge&&!mk.rip;
    S.hooks.rip(V,K,{kind:'slash',tech:{key:'std',name:'Cut'},out:'hit',dmg:10},at(CHE),'body',false,null);
    S.hooks.rip(V,K,{kind:'slash',tech:{key:'std',name:'Cut'},out:'hit',dmg:10},at(HEAD),'head',true,null);
    S.hooks.rip(K,V,{kind:'slash',tech:{key:'std',name:'Cut'},out:'hit',dmg:10},at(CHE),'body',true,null);
    const none=K.rips.length+(V.rips?V.rips.length:0);
    hit('slash','body',at(CHE));hit('slash','body',at(CHE));const [r1,r2]=K.rips,sep=+Math.hypot((r1.u-r2.u)*30,r1.off-r2.off).toFixed(1);
    K.rips=[];for(let i=0;i<12;i++)hit('sweep','leg',{x:K.p[KNF].x,y:K.p[KNF].y+2},{out:'crit',dmg:16});
    const skirt=K.rips.filter(r=>r.g==='skirt').length,legs=K.rips.filter(r=>r.g==='legN').length,far=K.rips.filter(r=>r.g==='legF').length,notches=K.hemTears.length;
    for(let i=0;i<30;i++)hit(i%2?'thrust':'slash',['body','arm','leg'][i%3],at(CHE));
    const fin=K.rips.every(r=>[r.u??0,r.off??0,r.t??0,r.v??0,r.ang].every(Number.isFinite)&&(r.stab?r.r>1.5:r.len>=7&&r.wid>2));
    return{blunt,bruise,none,sep,skirt,legs,far,notches,n:K.rips.length,fin};});
  expect('blows with a pommel, a butt end or a foot do not tear it (the mark is a bruise); nor do blunt hits, blows to the head or blows to anyone else',
    unit.blunt===0&&unit.bruise&&unit.none===0,JSON.stringify(unit));
  expect('low blows tear the coat\'s skirt or the trouser leg in front of it, hard ones notch the hem; two blows to one place tear two places',
    unit.skirt>=3&&unit.legs>=2&&unit.far===0&&unit.notches>=3&&unit.notches<=5&&unit.sep>3,JSON.stringify(unit));
  expect('the tears are kept to sixteen and every one has a finite shape',unit.n===16&&unit.fin,JSON.stringify(unit));
  const goreOff=await ev(()=>{fight({});const K=S.F[0],V=S.F[1];put(K,420,92,1);put(V,420+engageGap(K,V),92,-1);step(30);const was=S.gore;S.gore='off';
    foeHit('slash','hit');foeHit('thrust','hit');const px=tearPx(),n=(K.rips||[]).length,marks=K.marks.length;S.gore=was;
    return{n,marks,px:px.map(t=>t.rgb),red:px.filter(t=>t.rgb[0]>150&&t.rgb[1]<90).length,lining:px.filter(t=>t.lining).length};});
  expect('with gore off the suit still tears, showing the lining and no blood',goreOff.n>=2&&goreOff.marks===0&&goreOff.red===0&&goreOff.lining>=1,JSON.stringify(goreOff));

  // ---- crews, an ally, a whole fight ----
  const crowd=await ev(()=>drawAll(()=>{fight({n:3,ally:true,auto:true,foes:['sword','axe','spear']});CALLS.kael=0;CALLS.other=0;step(400);
    const ally=S.F.find(f=>f.ally);return{kael:CALLS.kael,other:CALLS.other,ally:!!ally};}));
  expect('with Amri and three enemies, only Kael is drawn the new way',crowd.ally&&crowd.kael===400&&crowd.other===0,JSON.stringify(crowd));
  const whole=await ev(()=>{fight({arena:'restaurant',n:2,crew:true,auto:true,foes:['sword','dagger']});let n=0;while(S.game.phase!=='over'&&n<20000){step(1);n++;}return{n,phase:S.game.phase};});
  expect('a whole crew fight in the bistro plays out to the end with him drawn the new way',whole.phase==='over',JSON.stringify(whole));

  // ---- the cost: in sk_perf_page.js, run on its own at the end of a full run (python3 test.py perf), where nothing else loads the machine ----

  // ---- a phone ----
  const ph=await open(390,844,3);
  // (the gold and the hair are read with him standing in guard, as on the desktop above: where a fight leaves him at a given frame
  // depends on its dice, and turned away or crouched he shows little of either)
  const phone=await ph.evaluate(()=>drawAll(()=>{fight({n:2,auto:true,foes:['sword','axe']});CALLS.kael=0;step(240);const calls=CALLS.kael;
    fight({});const K=S.F[0],V=S.F[1];put(K,400,92,1);put(V,400+engageGap(K,V)+30,92,-1);step(30);return{calls,px:paint()};}));
  expect('on a phone he draws every frame and still shows the gold and the pale hair',phone.calls===240&&phone.px.gold>20&&phone.px.pale>10,JSON.stringify(phone));
  // the fall on a phone held upright: the floors and the night are drawn to the top of the picture (it sees far above the still layer's
  // top, whose edge was only stretched up there before V72: a band of bare piers over the windows)
  const phFall=await ph.evaluate(()=>{storyGo('fall');S.storyAuto=true;S.auto=true;step(2);const t0=S.t;while(S.t<t0+20)step(1);
    const r=drawAll(()=>{step(2);const sp=EnvLook.S.fall.span;return{top:Math.round(sp.top),camTop:Math.round(camTop()),layerTop:RC.y0,D:+fallDream().toFixed(2)};});storyQuit();return r;});
  expect('the fall on a phone held upright: the floors and the night are drawn to the top of the picture, past the still layer\'s top',phFall.camTop<phFall.layerTop&&phFall.top<=phFall.camTop-30,JSON.stringify(phFall));

  // the fall played to its end: his thoughts in order, face up in the hay with the faint light in his eye and no gilt lit on him, and the
  // last look up the wall to the arm on the spike, its lines lit. On the way down the face the desert in his head (fallDream, at the
  // start of each thought): none at the first, deeper with the wire and the wells, back a little with the Sprawl, all he sees by the
  // time he waits for water on the wire; the memory slows the face going by, and the speed is all back when the tower's foot comes up;
  // the first blow in the Pit wakes him and it is gone at once; the painter draws it while it lasts and never after
  const FALL_EYE_T=await ev(()=>FALL_EYE);
  const fallEnd=await ev(()=>{const seen=[],Dk=[],F=EnvLook.S.fall,dr={min:1e9,open:null,impAt:null,wokeAt:null,after:0,drawn:0,drawnAfter:0},cam0={post:F.pfx.n,drawn:F.span.n,bloom:0,sandMax:0,drained:false,sandAfter:0};storyGo('fall');S.storyAuto=true;S.auto=true;step(2);
    let n=0,last=null,n0=F.dream.n,nWoke=null;
    while(S.story&&!S.story.ended&&n<9000){step(1);n++;const th=S.thought,P=S.pit;if(th&&th.text!==last){last=th.text;seen.push(th.text);Dk.push(+fallDream().toFixed(2));}
      cam0.bloom=Math.max(cam0.bloom,F.pfx.bloom);if(P&&P.woke==null){if(F.sand.max<cam0.sandMax-1e-6)cam0.drained=true;cam0.sandMax=F.sand.max;}else cam0.sandAfter=F.sand.max;
      if(P&&!P.on&&seen.length>2)dr.min=Math.min(dr.min,Math.round(S.scrollYV));if(P&&P.on&&dr.open==null)dr.open=Math.round(P.cv);
      if(P&&P.impT>0&&dr.impAt==null)dr.impAt=S.t;if(P&&P.woke!=null){if(dr.wokeAt==null){dr.wokeAt=P.woke;nWoke=F.dream.n;}dr.after=Math.max(dr.after,fallDream());}}
    dr.drawn=F.dream.n-n0;dr.drawnAfter=nWoke==null?null:F.dream.n-nWoke;dr.same=dr.impAt!=null&&dr.wokeAt===dr.impAt;dr.Dk=Dk;
    dr.cam={frames:F.span.n-cam0.drawn,post:F.pfx.n-cam0.post,bloom:+cam0.bloom.toFixed(2),sandMax:+cam0.sandMax.toFixed(2),drained:cam0.drained,sandAfter:cam0.sandAfter};
    const K=hero(),P=S.pit,h=K.p[HEAD],c=K.p[CHE],ux=h.x-c.x,Q=P&&P.arm?P.arm.pts.map(q=>pitToW(q.x,q.y)):null;
    const r={n,ended:S.story&&S.story.ended,thoughts:seen.length+'/'+FALL_LINES.length,inOrder:seen.length===FALL_LINES.length&&seen.every((t,i)=>t===FALL_LINES[i][0]),
      eyeLit:K.eyeLit,drain:K.drain,faceUp:(K.facing>0?ux:-ux)<0,look:!!(P&&P.look),armY:Q?Math.round((Q[0].y+Q[1].y+Q[2].y)/3):null,armDrain:P&&P.arm?pitArmDrain(P.arm):null,dream:dr};
    storyQuit();return r;});
  expect('the fall: his twelve thoughts in order; he ends face up in the hay with a faint light in his eye and no gilt lit; the picture ends on the arm on the spike, still lit',
    fallEnd.ended==='fall'&&fallEnd.inOrder&&fallEnd.eyeLit===FALL_EYE_T&&fallEnd.drain===1&&fallEnd.faceUp&&fallEnd.look&&fallEnd.armY>300&&fallEnd.armY<420&&fallEnd.armDrain===0,JSON.stringify({...fallEnd,dream:undefined}));
  {const d=fallEnd.dream,k=d.Dk;
    expect('the desert in his head as he falls: none at the first thought, deeper with the wire and the wells, back a little with the Sprawl, all of it by the wire again; the face slows and is back to full speed for the Pit; the first blow wakes him, and it is drawn while it lasts and not after',
      k.length===12&&k[0]===0&&k[2]>=.3&&k[3]>k[4]&&k[11]>=.95&&d.min<900&&d.open>=1700&&d.same&&d.after===0&&d.drawn>40&&d.drawnAfter===0,JSON.stringify(d));
    // the picture as a camera takes it, over every frame the fall draws: the light blooms (and bursts as he wakes, never past three
    // times itself); the windows fill with sand as the dream deepens and never drain while it lasts, and the sand is gone with it
    const c=d.cam;expect('the fall as a camera takes it: the light blooming and the edges darkening over every frame; the windows\' sand only ever rising while the dream lasts, and gone when he wakes',
      c.frames>100&&c.post===c.frames&&c.bloom>.5&&c.bloom<=1.45&&c.sandMax>=.95&&!c.drained&&c.sandAfter===0,JSON.stringify(c));}
  // the effects setting: the fall's camera pass at Full and at Lite, and none of it at Off
  const fxFall=await ev(()=>{storyGo('fall');S.storyAuto=true;S.auto=true;step(2);const F=EnvLook.S.fall,q0=FXL.q,o={};
    for(const q of ['off','lite','full']){FXL.set(q);const n0=F.pfx.n,d0=F.span.n;step(64);o[q]=F.pfx.n-n0;o[q+'Drawn']=F.span.n-d0;}FXL.set(q0);storyQuit();return o;});
  expect('the effects setting: the fall\'s camera pass draws at Full and at Lite, and not at all at Off',fxFall.off===0&&fxFall.offDrawn>0&&fxFall.lite===fxFall.liteDrawn&&fxFall.full===fxFall.fullDrawn&&fxFall.full>0,JSON.stringify(fxFall));
  // the prologue opens at sundown: Begin plays it first (it is not a chapter of its own), him on his bike on the road above the farms,
  // upright in the saddle; his three lines in order; the sand blowing past the bike only while he talks about the wire (drawn then, and
  // never otherwise); the sun going down; then he rides off the right edge of the picture and the field begins with him on foot
  const SD=await ev(()=>{const out={first:STAGES[0].key,next:STAGES[0].next,chapter:!!STAGES[0].title,want:SUNDOWN.sand.dur};
    const wi=V11UI.world.indexOf(storySand);let strokes=0,strokesOff=0,on=0,t0=null,t1=null,at=null;
    V11UI.world[wi]=function(){const c=ctx,s0=c.stroke;let n=0;c.stroke=function(){n++;return s0.apply(this,arguments);};try{storySand();}finally{delete c.stroke;}if(S.story&&S.story.sand)strokes+=n;else strokesOff+=n;};
    try{storyGo(null);S.storyAuto=true;S.auto=true;step(2);
      const K=hero(),B=S.story.bike;out.start={key:S.story.key,scene:envKey(),mounted:!!B&&K.mount===B,lean:K.rideLean,facing:K.facing};out.y0=EnvLook.S.outskirts.sun().y;
      const lines=[];let last=null,n=0;out.turn={min:0,atLines:[],look:false};out.title={seen:false,withLine:false};
      while(S.story&&S.story.key==='sundown'&&n<4000){step(1);n++;const s=S.say,Kt=hero();if(s&&s!==last){last=s;lines.push(s.text);out.turn.atLines.push(+(Kt.headTurn||0).toFixed(2));}
        out.turn.min=Math.min(out.turn.min,Kt.headTurn||0);if(Kt.look)out.turn.look=true;
        if(S.story.title){out.title.seen=true;if(S.say)out.title.withLine=true;}
        if(S.story.sand){on++;if(t0==null){t0=S.t;at=lines.length;}t1=S.t;}
        if(S.story.key==='sundown'){out.y1=EnvLook.S.outskirts.sun().y;if(S.story.bike)out.bx=Math.round(S.story.bike.x);}}
      out.lines=lines;out.sand={frames:on,dur:t0==null?0:+(t1-t0).toFixed(2),line:at,strokes,strokesOff};
      const K2=hero();out.after={key:S.story&&S.story.key,mount:!!K2.mount,lean:K2.rideLean===undefined,x:Math.round(K2.station),z:Math.round(K2.lane)};}
    finally{V11UI.world[wi]=storySand;storyQuit();}
    return out;});
  expect('the prologue opens at sundown before the field: on his bike on the road above the farms, upright in the saddle, the scene its own (not a chapter)',
    SD.first==='sundown'&&SD.next==='field'&&!SD.chapter&&SD.start.key==='sundown'&&SD.start.scene==='outskirts'&&SD.start.mounted&&SD.start.lean===.1&&SD.start.facing===1,JSON.stringify(SD.start));
  expect('it opens on the sky under the prologue\'s title, gone before he speaks; he turns his head to the sun as he says the first line (his head alone, no glance tilting it back)',
    SD.title.seen&&!SD.title.withLine&&SD.turn.min<-2&&SD.turn.atLines[0]<-2&&SD.turn.atLines[1]>-.05&&!SD.turn.look,JSON.stringify({title:SD.title,turn:SD.turn}));
  expect('his three lines at sundown, in order',JSON.stringify(SD.lines)===JSON.stringify(['The sun takes its time out here.','On the wire it dropped like a stone, and the cold came up out of the ground.','Going to be a long night.']),SD.lines.join(' / '));
  expect('the sand blows past the bike only while he talks about the wire, for a moment, drawn then and never otherwise; the sun goes down',
    SD.sand.line===2&&Math.abs(SD.sand.dur-SD.want)<.06&&SD.sand.strokes>40&&SD.sand.strokesOff===0&&SD.y1>SD.y0+8,JSON.stringify({...SD.sand,y0:SD.y0,y1:SD.y1}));
  expect('he rides off the right edge of the picture, and the field begins with him on foot where it always has',
    SD.bx>900&&SD.after.key==='field'&&!SD.after.mount&&SD.after.lean&&SD.after.x===228&&SD.after.z===138,JSON.stringify({bx:SD.bx,...SD.after}));
  expect('no page errors',pageErrs.length===0,pageErrs.slice(0,3).join(' | '));
  console.log(rep.join('\n'));console.log(errs.length?`\n${errs.length} FAILED`:`\nall ${rep.length} checks passed`);
  await b.close();process.exit(errs.length?1:0);
})();
