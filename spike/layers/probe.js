// The layers test's first promise, checked: painting the picture onto sheets changes nothing the game computes. Each scene is played
// three times from a fresh page, every frame painted: twice flat (the game against itself: is this scene the same twice at all?)
// and once on the sheets (every seam crossed, every foot read, the focus followed, the bloom made). Every so many frames the game's
// state is summed up, as the motion test's probe sums it (spike/motion/probe.js): every figure's joints, scarf, strength, footing
// and place, the clock, the turn, the story's step and the dice. The sums must agree.
//   NODE_PATH=node_modules node spike/layers/probe.js [frames] [scene ...]      (scenes: motion yard lab story act1 toll)
// Phaser has to be up for the sheets to be used, and here it draws in software, slowly: it is stepped once in every EVERY frames
// (20), which is as often as its side of the test needs to run for its part to be covered.
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const FR=+(process.argv[2]||900),WANT=process.argv.slice(3),PAGE=process.env.PAGE||'spike/layers/out/layers-test.html',EVERY=+(process.env.EVERY||20);
const SCENES={
  motion:"storyGo('motion');",
  yard:"S.auto=true;storyGo('yard1',{auto:true});",
  lab:"S.arenaKey='restaurant';S.cfg.n=3;S.cfg.ally.on=true;S.divOn=true;S.tableOn=true;S.auto=true;S.F=[];rosterBuild();restart();",
  story:"S.auto=true;storyGo(null,{auto:true});",
  act1:"S.auto=true;storyGo('roof1',{auto:true});",
  toll:"S.auto=true;storyGo('toll',{auto:true});"};
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined),
    args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const play=async(scene,on)=>{const p=await (await b.newContext({viewport:{width:412,height:714}})).newPage(),errs=[];
    p.on('pageerror',e=>errs.push(e.message.slice(0,200)));
    await p.addInitScript(()=>{window.__rafs=[];window.requestAnimationFrame=cb=>{window.__rafs.push(cb);return window.__rafs.length;};
      // (the same dice for every play: a page's own Math.random would make two plays differ whatever the test did)
      let a=0x2F6E2B1;Math.random=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
      window.__now=1e6;performance.now=()=>window.__now;Date.now=()=>1.7e12+window.__now;});
    await p.goto('file://'+path.resolve(PAGE)+'?host=2&scene=none');await p.waitForTimeout(1500);
    await p.evaluate(([js,on])=>{S.soundOn=false;LayerTest.on=on;window.__q={out:[],errs:0,msg:'',i:0,why:{}};
      window.__sum=()=>{let h=0x811c9dc5;const add=v=>{const s=String(v);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}};
        add(S.t);add(S.game.phase);add(S.game.turnNo);add(S.story?S.story.key+':'+S.story.step:'-');add(S.rng?S.rng():0);
        for(const f of S.F){for(const v of [f.hp,f.station,f.lane,f.dep,f.vdep,f.facing,f.motor,f.foot,f.ready,f.velX,f.dead,f.downed,!!f.action,f.look?f.look.t0:0])add(v);
          for(const q of f.p){add(q.x);add(q.y);add(q.px);add(q.py);}if(f.scarf)for(const q of f.scarf){add(q.x);add(q.y);}for(const s of f.steps){add(s.active);add(s.plant.x);}}
        return h;};
      window.__run=(n,every)=>{const Q=window.__q;for(let k=0;k<n;k++){Q.i++;window.__now+=1000/60;const L=window.__rafs;window.__rafs=[];const all=Q.i<4||Q.i%every===0;
          for(const f of L){if(all||f.name==='frame'){try{f(window.__now);}catch(e){Q.errs++;Q.msg=String(e&&e.stack||e).slice(0,300);}}else window.__rafs.push(f);}
          if(S.say&&S.story)storyAdvance();
          const w=LayerTest.live?'':(LayerTest.why||'flat');if(w)Q.why[w]=(Q.why[w]||0)+1;
          if(Q.i%300===0)Q.out.push(window.__sum());}};
      new Function(js)();},[SCENES[scene],on]);
    for(let i=0;i<FR;i+=60)await p.evaluate(([n,e])=>window.__run(n,e),[Math.min(60,FR-i),EVERY]);
    const r=await p.evaluate(()=>Object.assign({},window.__q,{t:S.t,key:S.story?S.story.key+':'+S.story.step:'-',n:LayerTest.n,ly:LayerTest.err,ph:PHOST.err}));
    await p.close();if(errs.length)r.page=errs.slice(0,3);return r;};
  let bad=0;
  for(const sc of (WANT.length?WANT:Object.keys(SCENES))){
    const a=await play(sc,false),a2=await play(sc,false),c=await play(sc,true);
    const same=(x,y)=>{for(let i=0;i<x.out.length;i++)if(x.out[i]!==y.out[i])return i;return -1;};
    const self=same(a,a2),on=same(a,c),ok=self<0&&on<0&&!c.errs&&!c.ly&&!c.page;if(!ok)bad++;
    const flat=Object.entries(c.why).map(([k,v])=>v+' '+k).join(', ');
    console.log((ok?'PASS ':'FAIL ')+sc+': '+a.out.length+' sums over '+a.t.toFixed(0)+' s, ended '+a.key+'; frames on the sheets '+c.n+(flat?' (flat: '+flat+')':'')+
      (self>=0?'; THE GAME DIFFERS FROM ITSELF at sum '+self:'')+(on>=0?'; differs on the sheets at sum '+on:'')+
      (c.errs?'; errors '+c.errs+' '+c.msg:'')+(c.ly?'; the test stopped: '+c.ly:'')+(c.ph?'; Phaser: '+c.ph:'')+(c.page?'; page '+JSON.stringify(c.page):''));}
  await b.close();process.exit(bad?1:0);})();
