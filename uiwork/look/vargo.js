// Lamplight Street (the vargo stage) from its intro to its outro, shot at its moments on auto: Qadir at his door, the fight on the
// bistro's flags, the coat swept back on the grenade, the pin, the toss, the turn and the throw over the shoulder, the blast at
// 0 to 3 s, and the walk in. node uiwork/look/vargo.js <page> <outprefix> <w> <h> <dpr> [marks,comma]   (since V75)
const {chromium}=require('playwright'),path=require('path');const [PAGE,OUT,WW,HH,DPR,ONLY]=process.argv.slice(2);
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:+WW,height:+HH},deviceScaleFactor:+DPR,isMobile:+WW<900,hasTouch:+WW<900});const p=await ctx.newPage(),errs=[];
  p.on('pageerror',e=>errs.push(e.message));await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});await p.goto('file://'+path.resolve(PAGE));await p.waitForTimeout(300);
  await p.evaluate(()=>{S.soundOn=false;let a=5;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
    window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    window.R0=window.render;storyGo('vargo');S.storyAuto=true;S.auto=true;step(2);});
  const shots=[];const snap=async(tag)=>{if(ONLY&&!ONLY.split(',').includes(tag))return;await p.screenshot({path:`${OUT}_${tag}.jpg`,type:'jpeg',quality:84});shots.push(tag);};
  const run=async(fn,max,draw)=>p.evaluate(([fn,max,draw])=>{const f=eval(fn);if(!draw)window.render=()=>{};let ok=false;for(let i=0;i<max;i++){if(f()){ok=true;break;}step(1);if(S.say&&i%20===0)storyAdvance();}window.render=window.R0;step(1);return ok;},[fn.toString(),max,draw]);
  const B=t=>`()=>S.bistroBlast!=null&&S.t-S.bistroBlast>=${t}`;
  const marks=[['intro0',()=>S.t>1.2,400],['intro1',()=>S.F[0]&&!S.F[0].offstage&&S.say,3000],['introQ',()=>S.F[1]&&S.F[1].station>330&&S.say,6000],['fight',()=>S.story&&S.story.step==='fight',8000],
    ['fight2',()=>S.story&&S.story.step==='fight'&&(window.__tf=window.__tf||S.t)&&S.t>window.__tf+5,3000],['outro0',()=>S.story&&S.story.key==='vargo'&&S.story.step==='outro',60000],
    ['sweep',()=>hero().coatOpen>=.6,4000],['reveal',()=>hero().coatOpen>=1&&!hero().action,400],['hand',()=>hero().grenade==='hand',600],['pin',()=>S.thrown.some(o=>o.kind==='pin'),600],
    ['flip',()=>hero().nadeUp>24,300],['turn',()=>hero().facing===1&&hero().grenade==='hand'&&hero().action&&S.t-hero().action.t0>.3,600],['thrown',()=>S.thrown.some(o=>o.kind==='grenade'&&S.t-o.t0>.35),600],
    ['b00',B(0),600],['b05',B(.05),40],['b12',B(.12),40],['b25',B(.25),40],['b45',B(.45),40],['b80',B(.8),60],['b150',B(1.5),90],['b300',B(3),120],['in0',()=>hero().facing===-1&&S.bistroBlast!=null&&S.t-S.bistroBlast>2,400],['in1',()=>hero().offstage,900]];
  for(const [tag,fn,max] of marks){const ok=await run(fn,max,tag.startsWith('b')||['sweep','reveal','hand','pin','flip','turn','thrown'].includes(tag));if(ok)await snap(tag);else console.log("missed",tag);}
  console.log(shots.join(' '),errs.slice(0,3));await b.close();})();
