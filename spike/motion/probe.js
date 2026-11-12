// The motion test's first promise, checked: the page's drawing changes nothing the game computes. Each scene is played three times
// from a fresh page with nothing painted: twice with the test off (the game against itself: is this scene the same twice at all?) and
// once with it on (every pose read, every joint placed, every swap made and put back). Every so many frames the game's state is
// summed up: every figure's joints, scarf, strength, footing and place, the clock, the turn, the story's step and the dice. The
// sums must agree.
//   NODE_PATH=node_modules node spike/motion/probe.js [frames] [scene ...]      (scenes: lab story act1 toll motion yard)
// With PAINT=1 every frame is painted as well (slow: a few hundred frames), so that the painters run on the drawn joints too.
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const FR=+(process.argv[2]||6000),WANT=process.argv.slice(3),PAGE=process.env.PAGE||'spike/motion/out/motion-test.html',PAINT=!!process.env.PAINT;
const SCENES={
  lab:"S.arenaKey='restaurant';S.cfg.n=3;S.cfg.ally.on=true;S.divOn=true;S.tableOn=true;S.auto=true;S.F=[];rosterBuild();restart();",
  story:"S.auto=true;storyGo(null,{auto:true});",
  act1:"S.auto=true;storyGo('roof1',{auto:true});",
  toll:"S.auto=true;storyGo('toll',{auto:true});",
  motion:"storyGo('motion');",
  yard:"S.auto=true;storyGo('yard1',{auto:true});"};
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)});
  const play=async(scene,on,twos)=>{const p=await (await b.newContext({viewport:{width:412,height:714}})).newPage(),errs=[];
    p.on('pageerror',e=>errs.push(e.message.slice(0,200)));
    await p.addInitScript(()=>{window.__rafs=[];window.requestAnimationFrame=cb=>{window.__rafs.push(cb);return window.__rafs.length;};
      // (the same dice for every play: a page's own Math.random would make two plays differ whatever the test did)
      let a=0x2F6E2B1;Math.random=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};});
    await p.goto('file://'+path.resolve(PAGE)+'?host=0&scene=none');await p.waitForTimeout(1500);
    const r=await p.evaluate(([js,n,on,twos,paint])=>{S.soundOn=false;let now=1e6;performance.now=()=>now;Date.now=()=>1.7e12+now;
      MotionTest.on=on;MotionTest.dry=!paint;MotionTest.twos=twos;
      const step=()=>{now+=1000/60;const L=window.__rafs;window.__rafs=[];for(const f of L)if(f.name==='frame')f(now);else window.__rafs.push(f);};
      const sum=()=>{let h=0x811c9dc5;const add=v=>{const s=String(v);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}};
        add(S.t);add(S.game.phase);add(S.game.turnNo);add(S.story?S.story.key+':'+S.story.step:'-');add(S.rng?S.rng():0);
        for(const f of S.F){for(const v of [f.hp,f.station,f.lane,f.dep,f.vdep,f.facing,f.motor,f.foot,f.ready,f.velX,f.dead,f.downed,!!f.action,f.look?f.look.t0:0])add(v);
          for(const q of f.p){add(q.x);add(q.y);add(q.px);add(q.py);}if(f.scarf)for(const q of f.scarf){add(q.x);add(q.y);}for(const s of f.steps){add(s.active);add(s.plant.x);}}
        return h;};
      new Function(js)();const out=[];let drawn=0,errs=0,msg='';
      for(let i=1;i<=n;i++){try{step();}catch(e){errs++;msg=String(e&&e.stack||e).slice(0,300);}drawn+=MotionTest.n||0;
        if(S.say&&S.story)storyAdvance();
        if(i%300===0)out.push(sum());}
      return{out,drawn,errs,msg,t:S.t,key:S.story?S.story.key+':'+S.story.step:'-',far:MotionTest.far,farHip:MotionTest.farHip};},[SCENES[scene],FR,on,!!twos,PAINT]);
    await p.close();if(errs.length)r.page=errs.slice(0,3);return r;};
  let bad=0;
  for(const sc of (WANT.length?WANT:Object.keys(SCENES))){
    const a=await play(sc,false),a2=await play(sc,false),c=await play(sc,true),d=await play(sc,true,true);
    const same=(x,y)=>{for(let i=0;i<x.out.length;i++)if(x.out[i]!==y.out[i])return i;return -1;};
    const self=same(a,a2),on=same(a,c),tw=same(a,d);
    const ok=self<0&&on<0&&tw<0;if(!ok)bad++;
    console.log((ok?'PASS ':'FAIL ')+sc+': '+a.out.length+' sums over '+a.t.toFixed(0)+' s, ended '+a.key+'; figures drawn in the pose '+c.drawn+
      (self>=0?'; THE GAME DIFFERS FROM ITSELF at sum '+self:'')+(on>=0?'; differs with the test on at sum '+on:'')+(tw>=0?'; differs on twos at sum '+tw:'')+
      (c.errs?'; errors '+c.errs+' '+c.msg:'')+(c.page?'; page '+JSON.stringify(c.page):'')+'; furthest foot '+c.far.toFixed(0)+', hips '+c.farHip.toFixed(0));}
  await b.close();process.exit(bad?1:0);})();
