// Runs the node logic suites in a repo folder with the motion hook (motion_hook.js: every fighter's joints hashed every few sim steps,
// the dice seeded) and writes their hashes to one file, so two builds can be compared with cmp_suites.js.
// usage: node uiwork/anim/suites.js <repo dir> <out.jsonl>        then   node uiwork/anim/cmp_suites.js <a.jsonl> <b.jsonl>
// (the repo must be built: python3 build.py)
const {spawnSync}=require('child_process'),fs=require('fs'),path=require('path');
const DIR=path.resolve(process.argv[2]||'.'),OUT=path.resolve(process.argv[3]||'suites.jsonl'),HOOK=path.join(__dirname,'motion_hook.js');
try{fs.unlinkSync(OUT);}catch(e){}
for(const t of ['sk_test.js','sk_v12test.js','sk_v12finale_test.js','sk_brawltest.js','sk_teamtest.js','sk_react_test.js','sk_room_test.js','sk_short_test.js','sk_envtest.js']){
  const t0=Date.now(),r=spawnSync('node',['-r',HOOK,t],{cwd:DIR,env:{...process.env,SK_MOTION:OUT},stdio:'ignore',timeout:900000});
  console.log(t,'exit',r.status,Math.round((Date.now()-t0)/1000)+'s');}
