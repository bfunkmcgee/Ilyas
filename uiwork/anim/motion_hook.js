// Preloaded into a node logic suite, this hashes every fighter's joints every few sim steps and appends the hashes to SK_MOTION when
// the suite exits, so two builds can be shown to move every body the same way through the same checks.
// usage: SK_MOTION=<out.jsonl> node -r <abs path>/uiwork/anim/motion_hook.js sk_test.js   (uiwork/anim/suites.js runs them all)
const Module=require('module'),OUT=process.env.SK_MOTION;
const TRACE=`
;(()=>{const H=[];let n=0;
  const h32=s=>{let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h;};
  V11.step.push(()=>{if(++n%6)return;
    H.push(h32(S.F.map(f=>f.p.map(q=>q.x.toFixed(6)+','+q.y.toFixed(6)).join(';')+'|'+f.hp+'|'+(+f.station||0).toFixed(6)+'|'+(+f.dep||0).toFixed(6)).join('#')));});
  process.on('exit',()=>{require('fs').appendFileSync(${JSON.stringify(OUT||'')},JSON.stringify({file:require('path').basename(process.argv[1]),n:H.length,h:H})+'\\n');});})();
`;
// (some suites play at random where they do not seed: the dice are seeded here so that every run of a suite is the same run)
if(OUT){let a=12345;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};const req=Module.prototype.require;
  Module.prototype.require=function(id){const r=req.apply(this,arguments);
    if(/(^|\/)sk_src(\.js)?$/.test(id)&&typeof r==='function'&&!r.__traced){const w=function(){return r.apply(this,arguments)+TRACE;};w.__traced=1;return w;}
    return r;};}
