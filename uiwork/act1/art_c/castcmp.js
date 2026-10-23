// Does the existing cast still draw the same? Every CastLook.CAST entry the page has (the prologue's elves, Amri, the man in white)
// and every crew's men (crewSpec for each room, six seeds) drawn by CastLook.draw from fixed poses, in profile and turned, at the
// three levels of detail, each image hashed. `save` keeps the hashes (and the pictures) as the baseline; `check` compares.
// usage: node uiwork/act1/art_c/castcmp.js save|check [page]   (names that are new since the baseline are skipped in check)
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const MODE=process.argv[2]||'check',PAGE=process.argv[3]||process.env.PAGE||'uiwork/qa_test.html',DIR=path.join(__dirname,'cmp');
fs.mkdirSync(path.join(DIR,MODE==='save'?'before':'after'),{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[];
  const p=await (await b.newContext({viewport:{width:800,height:600},deviceScaleFactor:1})).newPage();
  p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+process.cwd()+'/'+PAGE);await p.waitForTimeout(300);
  const PF=path.join(DIR,'poses.json'),poses=fs.existsSync(PF)?JSON.parse(fs.readFileSync(PF,'utf8')):null;
  const base=MODE==='check'?JSON.parse(fs.readFileSync(path.join(DIR,'base.json'),'utf8')):null;
  const r=await p.evaluate(([poses,keep])=>{S.soundOn=false;let a=5;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
    window.__now=performance.now()+1000;const step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    if(!poses){step(150);poses=S.F.slice(0,2).map(f=>({p:f.p.map(q=>({x:q.x,y:q.y})),facing:f.facing,body:Object.assign({},f.body),scarf:f.scarf.map(q=>({x:q.x,y:q.y})),ground:Math.max(f.p[8].y,f.p[10].y)+3}));}
    const specs=[];for(const k of Object.keys(CastLook.CAST))specs.push([k,CastLook.CAST[k]]);
    for(const room of Object.keys(CastLook.CREWS))for(let s=1;s<=6;s++)specs.push(['crew:'+room+':'+s,CastLook.crewSpec(room,s)]);
    const OPTS=[['p1',{k:1.6}],['p3',{k:3.2}],['p6',{k:6}],['t08',{k:3.2,yaw:.8}],['t20',{k:3.2,yaw:2}],['t31',{k:1.6,yaw:3.1}],['op',{k:3.2,opening:1}],['lb',{k:3.2,lookBack:1}],['hy',{k:6,yaw:1.2,headYaw:1.4}]];
    const out={},pics={};const cv=document.createElement('canvas');cv.width=260;cv.height=300;const c=cv.getContext('2d');
    const hash=d=>{let h=2166136261>>>0;for(let i=0;i<d.length;i+=1){h^=d[i];h=Math.imul(h,16777619)>>>0;}return h.toString(16);};
    for(const [name,sp] of specs)for(const [on,o] of OPTS)for(let pi=0;pi<poses.length;pi++){if(keep&&!(name+'|'+on+'|'+pi in keep))continue;
      const P0=poses[pi],F={p:P0.p.map(q=>({x:q.x,y:q.y})),facing:P0.facing,body:Object.assign({},P0.body),scarf:P0.scarf.map(q=>({x:q.x,y:q.y})),ground:P0.ground,t:0,weaponKey:'sword',wp:{unarmed:false}};
      const C0=F.p[1];c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv.width,cv.height);c.fillStyle='#20242a';c.fillRect(0,0,cv.width,cv.height);
      c.setTransform(o.k,0,0,o.k,cv.width/2-C0.x*o.k,cv.height*.45-C0.y*o.k);
      try{CastLook.draw(c,F,sp,{dir:{x:.55,y:-.83},now:0,yaw:o.yaw||0,headYaw:o.headYaw,opening:!!o.opening,lookBack:!!o.lookBack,drawOther:null});}catch(e){out[name+'|'+on+'|'+pi]='ERR '+e.message;continue;}
      const id=name+'|'+on+'|'+pi;out[id]=hash(c.getImageData(0,0,cv.width,cv.height).data);
      if(!keep||keep[id]!==out[id])pics[id]=cv.toDataURL('image/png');}
    return{out,pics,poses};},[poses,base]);
  if(!poses)fs.writeFileSync(PF,JSON.stringify(r.poses));
  const safe=id=>id.replace(/[^a-zA-Z0-9]+/g,'_');
  if(MODE==='save'){fs.writeFileSync(path.join(DIR,'base.json'),JSON.stringify(r.out));
    for(const [id,u] of Object.entries(r.pics))if(/\|(p3|t08)\|0$/.test(id))fs.writeFileSync(path.join(DIR,'before',safe(id)+'.png'),Buffer.from(u.split(',')[1],'base64'));
    console.log('saved',Object.keys(r.out).length,'images');}
  else{let same=0;const diff=[];for(const [id,h] of Object.entries(r.out)){if(base[id]===h)same++;else diff.push(id);}
    for(const id of diff.slice(0,40))if(r.pics[id])fs.writeFileSync(path.join(DIR,'after',safe(id)+'.png'),Buffer.from(r.pics[id].split(',')[1],'base64'));
    const missing=Object.keys(base).filter(id=>!(id in r.out));
    console.log('same',same,'different',diff.length,'missing',missing.length);if(diff.length)console.log('first differences:',diff.slice(0,20).join(', '));if(missing.length)console.log('missing:',missing.slice(0,10).join(', '));}
  console.log('errors',errs.length,JSON.stringify(errs.slice(0,3)));await b.close();})();
