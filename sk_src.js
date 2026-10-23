// the headless core = rules + physics + brawling systems + environment (no DOM), in the build's own order (build_modules.json, written
// by build.py); an argument replaces sk_core.js with another copy of it (for trying a variant of the rules against the same checks)
const fs=require('fs');
const LIST=(()=>{try{return JSON.parse(fs.readFileSync(__dirname+'/build_modules.json','utf8')).core;}catch(e){
  return['sk_core.js','sk_brawl.js','sk_fin.js','sk_team.js','sk_env.js','sk_phase.js','sk_arc.js'].concat(['crew','chain','insure','style','secret','lobby','breach','office','finale','ctxmoves','cast','arms','guns','story','beast','elf'].map(f=>'sk_'+f+'.js').filter(f=>fs.existsSync(f)));}})();
// SK_EXTRA=a,b (env): game modules not yet in the build (sk_a.js, sk_b.js), loaded after the rest, for trying one against the checks
const EXTRA=(process.env.SK_EXTRA||'').split(',').filter(Boolean).map(e=>'sk_'+e+'.js').filter(f=>!LIST.includes(f));
module.exports=(core)=>LIST.concat(EXTRA).map((f,i)=>fs.readFileSync(i===0&&core?core:f,'utf8')+'\n').join('');
