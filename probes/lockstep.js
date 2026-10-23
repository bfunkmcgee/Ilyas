// Two pages of the same seeded restaurant run (four rooms, Mara along, the office fought on auto) stepped side by side, one drawing
// one frame in eight and one never drawing: the first frame where they part, and every field that differs there.
// usage: node probes/lockstep.js [draw every in the first page, default 8]
const {chromium}=require('playwright');
const DE=+(process.argv[2]||8);
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),errs=[];
  const open=async ev=>{const p=await (await b.newContext({viewport:{width:1100,height:760}})).newPage();p.on('pageerror',e=>errs.push(e.message));
    await p.addInitScript(e=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};window.__drawEvery=e;},ev);
    await p.goto('file://'+process.cwd()+'/test_page.html');await p.waitForTimeout(300);
    await p.evaluate(()=>{S.soundOn=false;window.__now=performance.now()+1000;let a=7;window.__rolls=0;
      Math.random=()=>{window.__rolls++;a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
      window.step1=()=>{const ev=window.__drawEvery;window.__now+=16.7;const f=window.__raf;window.__raf=null;if(!f)return;
        if(ev===1||(ev>1&&(window.__fc=(window.__fc||0)+1)%ev===0))f(window.__now);else{const R=window.render;window.render=()=>{};try{f(window.__now);}finally{window.render=R;}}};
      window.flat=(root,name,maxD)=>{const o={},seen=new Set();const walk=(v,pth,d)=>{if(d>maxD)return;
          if(v===null||typeof v!=='object'){if(typeof v!=='function')o[pth]=v;return;}
          if(seen.has(v))return;if(v instanceof Node||v instanceof CanvasRenderingContext2D||v instanceof HTMLCanvasElement||(typeof OffscreenCanvas!=='undefined'&&v instanceof OffscreenCanvas)||v instanceof Path2D||v instanceof ImageData)return;
          seen.add(v);if(Array.isArray(v)){o[pth+'.length']=v.length;v.forEach((x,i)=>walk(x,pth+'['+i+']',d+1));return;}
          if(v instanceof Map){o[pth+'.size']=v.size;let i=0;for(const [k,x] of v){walk(x,pth+'{'+(typeof k==='object'?i:k)+'}',d+1);i++;}return;}
          if(v instanceof Set||v instanceof WeakMap)return;
          for(const k of Object.keys(v))walk(v[k],pth+'.'+k,d+1);};walk(root,name,0);return o;};
      window.sig=()=>[S.t.toFixed(4),S.game.phase,S.game.active,window.__rolls,S.F.map(f=>f.hp+':'+f.p.map(q=>q.x.toFixed(3)+','+q.y.toFixed(3)).join(';')).join('|')].join('#');
      S.arenaKey='restaurant';S.backroom=true;S.deep=true;S.introOn=false;S.cfg.n=1;S.cfg.crew=false;S.cfg.ally.on=true;S.allyAuto=true;
      S.auto=true;S.F=[];rosterBuild();restart();
      window.clearNow=()=>{if(S.crew)S.crew.queue.length=0;S.opening=null;S.game.ex=null;for(const f of foes()){f.hp=0;kill(f,1);}if(nextRoom())beginTransit();};
      window.rooms=['dining','kitchen','lobby','office'];window.ri=0;
      // one frame of the run: clear each of the first three rooms once its fight is up
      // (in the office: a hash of every field, to the twelfth level)
      window.hash=str=>{let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}return(h>>>0).toString(16);};
      window.adv=()=>{const r=rooms[ri];if(r&&S.room===r&&!S.stage.tr&&(S.game.phase==='input'||S.game.phase==='exchange')){if(r!=='office')clearNow();ri++;}step1();
        if(ri>=4){const fl=flat(S,'S',12);delete fl['S._rf'];for(const k of Object.keys(fl))if(/\._|\.nx$|smear\.a$|\.fl0$|^S\.popups\[\d+\]\.(?!age$|text$|x$|y$|d$)/.test(k))delete fl[k];return sig()+'#'+hash(JSON.stringify(fl));}return sig();};});
    return p;};
  const A=await open(DE),B=await open(0);let n=0,first=-1,prevA='',prevB='';
  while(n<12000){const [sa,sb]=await Promise.all([A.evaluate(()=>adv()),B.evaluate(()=>adv())]);n++;
    if(sa!==sb){first=n;break;}prevA=sa;if(/#over#/.test(sa))break;}
  if(first<0){console.log('the same for',n,'frames');}
  else{console.log('they part at frame',first);
    const [fa,fb]=await Promise.all([A.evaluate(()=>({f:flat(S,'S',12),drawnAt:window.__fc})),B.evaluate(()=>({f:flat(S,'S',12)}))]);
    const keys=[...new Set([...Object.keys(fa.f),...Object.keys(fb.f)])].filter(k=>!/\._|\.nx$|smear\.a$|\.fl0$|^S\.popups\[\d+\]\.(?!age$|text$|x$|y$|d$)/.test(k)),diff=keys.filter(k=>fa.f[k]!==fb.f[k]&&!(Number.isNaN(fa.f[k])&&Number.isNaN(fb.f[k])));
    console.log('fields that differ:',diff.length,'(first page drew frame counter',fa.drawnAt,')');
    for(const k of diff.slice(0,50))console.log('  ',k.slice(0,110),':',String(fa.f[k]).slice(0,40),'/',String(fb.f[k]).slice(0,40));}
  console.log('errors',errs.length,JSON.stringify(errs.slice(0,4)));await b.close();})();
