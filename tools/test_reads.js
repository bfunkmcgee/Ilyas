// What a check reads (since V99). test.py loads this before each node suite (node -r tools/test_reads.js): it notes every file of the
// repository the suite reads, every folder it lists and every file it only looks at (whether it is there, its size), and as the suite
// exits writes them to $SK_READS.<pid>.json. test.py keeps them with the suite's pass, and runs the suite again only when one of them
// has changed (python3 test.py --status says which). Nothing is noted under node_modules/, test_out/ or .git/, nor outside the
// repository; a file opened for writing is not a read. Without SK_READS it does nothing.
const fs=require('fs'),path=require('path'),Module=require('module');
const ROOT=path.resolve(__dirname,'..'),OUT=process.env.SK_READS;
if(OUT){
  const seen={},RANK={s:1,d:2,r:3};   // s: looked at (there or not, its size), d: listed, r: read (what it holds)
  const note=(p,k)=>{try{
      if(p==null||typeof p==='number')return;
      let s=p instanceof URL?p.href:Buffer.isBuffer(p)?p.toString():String(p);
      if(s.startsWith('file://'))s=decodeURIComponent(new URL(s).pathname);
      const a=path.resolve(s);if(a!==ROOT&&!a.startsWith(ROOT+path.sep))return;
      const r=path.relative(ROOT,a)||'.';if(/^(node_modules|test_out|\.git)(\/|$)/.test(r))return;
      if(!seen[r]||RANK[k]>RANK[seen[r]])seen[r]=k;}catch(e){}};
  const writing=fl=>typeof fl==='string'?/[wa+]/.test(fl):typeof fl==='number'?(fl&3)!==0:false;
  const wrap=(o,name,k)=>{const f=o&&o[name];if(typeof f!=='function')return;
    o[name]=function(p,...a){if(!((name==='open'||name==='openSync')&&writing(a[0])))note(p,k);return f.call(this,p,...a);};};
  for(const n of ['readFileSync','readFile','createReadStream','openSync','open'])wrap(fs,n,'r');
  for(const n of ['readdirSync','readdir','opendirSync','opendir'])wrap(fs,n,'d');
  for(const n of ['existsSync','statSync','lstatSync','stat','lstat','accessSync','access'])wrap(fs,n,'s');
  for(const n of ['readFile','open'])wrap(fs.promises,n,'r');
  for(const n of ['readdir','opendir'])wrap(fs.promises,n,'d');
  for(const n of ['stat','lstat','access'])wrap(fs.promises,n,'s');
  // (a module the suite requires is read too; node's own, like fs, are not files)
  const resolve=Module._resolveFilename;Module._resolveFilename=function(){const f=resolve.apply(this,arguments);if(path.isAbsolute(f))note(f,'r');return f;};
  if(process.argv[1])note(process.argv[1],'r');
  process.on('exit',()=>{try{fs.writeFileSync(OUT+'.'+process.pid+'.json',JSON.stringify(seen));}catch(e){}});
}
