// Compares two motion files written by uiwork/anim/suites.sh: same suites, same evals, same hashes in the same order.
// usage: node uiwork/anim/cmp_suites.js <a.jsonl> <b.jsonl>    (exit 1 on any difference)
const fs=require('fs'),rd=f=>fs.readFileSync(f,'utf8').split('\n').filter(Boolean).map(l=>JSON.parse(l));
const A=rd(process.argv[2]),B=rd(process.argv[3]);let bad=0;
const key=r=>r.file,group=L=>{const g={};for(const r of L)(g[key(r)]=g[key(r)]||[]).push(r);return g;},GA=group(A),GB=group(B);
for(const f of new Set([...Object.keys(GA),...Object.keys(GB)])){const a=GA[f]||[],b=GB[f]||[];
  if(a.length!==b.length){console.log(f,'runs',a.length,'vs',b.length);bad++;continue;}
  let n=0;const b0=bad;for(let i=0;i<a.length;i++){const x=a[i].h,y=b[i].h;n+=x.length;
    if(x.length!==y.length){console.log(f,'run',i,'checkpoints',x.length,'vs',y.length);bad++;}
    const k=x.findIndex((h,j)=>h!==y[j]);if(k>=0){console.log(f,'run',i,'first difference at checkpoint',k,'of',x.length);bad++;}}
  console.log(f,'runs',a.length,'checkpoints',n,bad>b0?'DIFFERENT':'same');}
console.log(bad?'DIFFERENT: '+bad:'suites identical');process.exit(bad?1:0);
