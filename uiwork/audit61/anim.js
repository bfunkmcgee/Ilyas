// Every Act I stage on auto with the motion watched frame by frame, for everyone in it: steps taken on the spot (a walk that is not
// going anywhere), feet that slide while planted, a foot under the floor, a joint that jumps in one frame, a speaker turned away from
// the one he speaks to, and two people standing in one another. usage: node uiwork/audit61/anim.js [stages,...] [maxSecs]
const {chromium}=require('playwright');
const KEYS=(process.argv[2]||'roof1,kitchen1,backroom,lostprop,yard1,list,stairsup,shelf,stairsdown,toll,tamm,night,sh1,sh2,sh3,sh4,sh5,sh6').split(','),MAX=+(process.argv[3]||150);
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)});
  for(const KEY of KEYS){const p=await (await b.newContext({viewport:{width:1100,height:620}})).newPage();
    const errs=[];p.on('pageerror',e=>errs.push(e.message));
    await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
    await p.goto('file://'+process.cwd()+'/uiwork/qa_test.html');await p.waitForTimeout(300);
    const r=await p.evaluate(([KEY,MAX])=>{S.soundOn=false;let a=5;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
      window.__now=performance.now()+1000;let fc=0;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(!f)continue;fc++;
        if(fc%10===0)f(window.__now);else{const R=window.render;window.render=()=>{};try{f(window.__now);}finally{window.render=R;}}}};
      storyGo(KEY);S.storyAuto=true;S.auto=true;step(2);const t0=S.t,iss={},add=(k,who,t,info)=>{const key=k+'|'+who;const v=iss[key]||(iss[key]={k,who,n:0,first:null,info:null});v.n++;if(v.first==null){v.first=+t.toFixed(1);v.info=info||null;}};
      const W=new Map();let prevKey=S.story.key,n=0,lastSay=null,sayN=0,stageSwitch=0;
      const nm=f=>f.pitCast||f.name||('f'+f.idx);
      while(S.t-t0<MAX&&n<MAX*75){step(1);n++;if(S.story.key!==KEY||S.story.step==='done'||S.story.ended)break;
        const t=S.t-t0,vis=S.F.filter(f=>!f.hidden&&!f.offstage&&!f.dead);
        for(const f of vis){let w=W.get(f);if(!w){w={hist:[],steps:[!!f.steps[0].active,!!f.steps[1].active],P:f.p.map(q=>({x:q.x,y:q.y})),slide:0};W.set(f,w);}
          w.hist.push({t:S.t,x:f.station,z:f.lane});while(w.hist.length&&S.t-w.hist[0].t>.7)w.hist.shift();
          // a step begun while the body has gone nowhere over the last ~0.7 s, on a walk or a scene's walk
          // (judged when the step is down: how far the body went from the step before it began to the end of this one)
          for(let k=0;k<2;k++){const on=!!f.steps[k].active;
            if(on&&!w.steps[k]){w.st=w.st||[];w.st[k]={x:f.station,z:f.lane,t:S.t,walk:!!(f.cutWalk||(f.gait&&f.gait.on))};}
            if(!on&&w.steps[k]&&w.st&&w.st[k]){const s0=w.st[k],moved=Math.hypot(f.station-s0.x,f.lane-s0.z);
              if(s0.walk&&(f.cutWalk||(f.gait&&f.gait.on))&&moved<2&&S.fade<.9){w.inPlace=(w.inPlace||0)+1;if(w.inPlace>=2)add('step-in-place',nm(f),t,{cut:S.cut&&S.cut.name,moved:+moved.toFixed(1)});}else w.inPlace=0;}
            w.steps[k]=on;}
          // planted feet sliding: neither foot stepping, standing, and a foot moving along the floor
          const fl=[FTF,FTB].map(i=>f.p[i]);if(!f.steps[0].active&&!f.steps[1].active&&!f.downed&&!f.clinch&&!f.mount&&f.motor>.5){
            const sl=[FTF,FTB].map(i=>Math.abs(f.p[i].x-w.P[i].x)).reduce((a,b)=>Math.max(a,b),0);if(sl>1.6&&!f.action&&S.fade<.9){w.slide++;if(w.slide>8)add('feet-slide',nm(f),t,{cut:S.cut&&S.cut.name,v:+(sl/DT).toFixed(0)});}else w.slide=0;}else w.slide=0;
          // a foot under the floor
          for(const q of fl){const g=f.gr(q.x);if(q.y>g+5&&!f.dead&&S.fade<.9)add('foot-under-floor',nm(f),t,{by:+(q.y-g).toFixed(1),cut:S.cut&&S.cut.name});}
          // a joint that jumps
          let jump=0,ji=-1;for(let i=0;i<f.p.length;i++){if(i===TIP)continue;const d=Math.hypot(f.p[i].x-w.P[i].x,f.p[i].y-w.P[i].y);if(d>jump){jump=d;ji=i;}}
          if(jump>22&&S.story.key===prevKey&&S.fade<.9)add('joint-jump',nm(f),t,{d:+jump.toFixed(0),j:ji,cut:S.cut&&S.cut.name,fade:+S.fade.toFixed(2),act:!!f.action,down:!!f.downed});
          w.P=f.p.map(q=>({x:q.x,y:q.y}));}
        // the speaker and who he speaks to (the nearest other person in view)
        const s=S.say;if(s&&s!==lastSay){lastSay=s;sayN=0;}
        if(s){sayN++;if(sayN===40){const sp=vis.find(f=>nm(f)===s.who||(s.who===HERO_NAME&&f===S.F[0])||f.name===s.who);
            if(sp){const others=vis.filter(o=>o!==sp&&!o.downed);const near=others.sort((x,y)=>Math.abs(x.station-sp.station)-Math.abs(y.station-sp.station))[0];
              if(near&&Math.abs(near.station-sp.station)>8&&Math.abs(near.station-sp.station)<420&&Math.sign(near.station-sp.station)!==sp.facing&&!sp.downed&&!sp.lookBack)add('speaks-away',s.who,t,{to:nm(near),line:s.text.slice(0,40)});}}}
        // two people in one place
        for(let i=0;i<vis.length;i++)for(let j=i+1;j<vis.length;j++){const A=vis[i],B=vis[j];if(A.clinch||B.clinch||A.downed||B.downed)continue;
          if(Math.abs(A.station-B.station)<14&&Math.abs(A.lane-B.lane)<10)add('overlap',nm(A)+'+'+nm(B),t,{cut:S.cut&&S.cut.name});}
        prevKey=S.story.key;}
      return{secs:+(S.t-t0).toFixed(1),end:S.story.key+'/'+S.story.step,iss:Object.values(iss).sort((a,b)=>b.n-a.n)};},[KEY,MAX]);
    console.log(`== ${KEY} (${r.secs}s, ${r.end}) errors ${errs.length}`);for(const v of r.iss.slice(0,14))console.log(`  ${v.k} ${v.who} x${v.n} first ${v.first}s ${v.info?JSON.stringify(v.info):''}`);
    await p.context().close();}
  await b.close();})();
