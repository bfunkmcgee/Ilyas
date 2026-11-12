// The line widths: every stroke the game draws in every place of the look audit, measured in world units as it lands on the screen
// (through the scene's still layer, scaled sprites and bitmaps baked offscreen), and put down to the place in the page (line and
// column) that set the context's lineWidth. The drawing guide's rule 2 wants 1.5 units at the least (1 for a highlight on a lit
// edge). lines.py reads the result: each assignment's typical width, colour and alpha, and its line of source.
// usage: node uiwork/look/lines.js <outdir> [w h dpr] [id,id,...]   (PAGE=<page>, default test_page.html; NF=<n> frames drawn at each
// moment, default 24). Writes <outdir>/<id>.json, one for each place. (V83 measured the fine marks, T1 of the remediation list, so.)
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const OUT=process.argv[2],VW=+(process.argv[3]||412),VH=+(process.argv[4]||714),DPR=+(process.argv[5]||2),ONLY=process.argv[6]?process.argv[6].split(','):null;
const PAGE=process.env.PAGE||'test_page.html',NF=+(process.env.NF||24);fs.mkdirSync(OUT,{recursive:true});
// the places and moments: uiwork/look/places.js (the look audit's)
const {SHOTS,chromiumPath}=require('./places.js');
// (in the page) the instrument: window.__LW gathers what it sees; window.__LWF {'line:col': k}, set before it, multiplies what those
// assignments set (a preview of a change before it is made in the sources)
function instrument(){if(window.__LW)return;const R=window.__LW={sites:{},edges:{},roots:{}};let nid=1;const ids=new WeakMap();const F=window.__LWF||null;
  const idOf=c=>{let i=ids.get(c);if(!i){i=nid++;ids.set(c,i);}return i;};
  const here=()=>{const s=new Error().stack.split('\n');for(let i=2;i<s.length;i++){const m=s[i].match(/\.html:(\d+):(\d+)/);if(m)return m[1]+':'+m[2];}return '?';};
  const scl=t=>Math.sqrt(Math.abs(t.a*t.d-t.b*t.c));
  const mainPPU=()=>{try{return cv.width/cam.viewW;}catch(e){return null;}};
  const isMain=c=>{try{return c===cv;}catch(e){return false;}};
  const isSrc=img=>img&&((typeof HTMLCanvasElement!=='undefined'&&img instanceof HTMLCanvasElement)||(typeof OffscreenCanvas!=='undefined'&&img instanceof OffscreenCanvas)||(typeof ImageBitmap!=='undefined'&&img instanceof ImageBitmap));
  for(const P of [CanvasRenderingContext2D.prototype,typeof OffscreenCanvasRenderingContext2D!=='undefined'?OffscreenCanvasRenderingContext2D.prototype:null]){if(!P)continue;
    const d=Object.getOwnPropertyDescriptor(P,'lineWidth');
    Object.defineProperty(P,'lineWidth',{get(){return d.get.call(this);},set(v){const h=here();this.__lws=h;if(F&&F[h]&&typeof v==='number')v=v*F[h];d.set.call(this,v);},configurable:true});
    const sv=P.save,rs=P.restore;
    P.save=function(){(this.__lwst||(this.__lwst=[])).push(this.__lws);return sv.call(this);};
    P.restore=function(){if(this.__lwst&&this.__lwst.length)this.__lws=this.__lwst.pop();return rs.call(this);};
    // a stroke: its width in device pixels on its canvas, in world units at once on the game's canvas (resolved later elsewhere)
    const rec=function(ctx,how){const C=ctx.canvas,id=idOf(C),t=ctx.getTransform(),lw=d.get.call(ctx),px=lw*scl(t),key=(ctx.__lws||'default')+'|'+here().split(':')[0];
      const ppu=isMain(C)?mainPPU():null,k=key+'|'+id;let e=R.sites[k];
      if(!e){e=R.sites[k]={key,id,main:!!ppu,n:0,mn:1e9,mx:0,col:String(ctx.strokeStyle).slice(0,28),a:+ctx.globalAlpha.toFixed(2),lw:+lw.toFixed(3),how,op:ctx.globalCompositeOperation};}
      e.n++;const w=ppu?px/ppu:px;if(w<e.mn)e.mn=w;if(w>e.mx)e.mx=w;const b=Math.round(Math.log2(Math.max(w,1e-4))*16);(e.h||(e.h={}))[b]=(e.h[b]||0)+1;};
    for(const f of ['stroke','strokeRect','strokeText']){const o=P[f];P[f]=function(){rec(this,f);return o.apply(this,arguments);};}
    // a canvas or a bitmap set down on another: how many of the other's device pixels each of its pixels covers
    const di=P.drawImage;P.drawImage=function(img){if(isSrc(img)&&img.width>0){const a=arguments,m=scl(this.getTransform());let sw,dw;
        if(a.length<=3){sw=img.width;dw=img.width;}else if(a.length<=5){sw=img.width;dw=a[3];}else{sw=a[3];dw=a[7];}
        const k=Math.abs(dw)*m/Math.max(1e-6,Math.abs(sw)),sid=idOf(img),did=idOf(this.canvas),ek=sid+'>'+did,pd=isMain(this.canvas)?mainPPU():null;
        let e=R.edges[ek];if(!e)e=R.edges[ek]={s:sid,d:did,kmn:1e9,kmx:0,pd:pd,n:0};e.n++;if(k<e.kmn)e.kmn=k;if(k>e.kmx)e.kmx=k;if(pd)e.pd=pd;
        // (set down on the game's canvas: its own pixels a unit, read each time it is set down (rlo, rhi), since V117. The last
        // camera's pixels a unit over the least and the most it was ever scaled by made a sprite's lines read thinner than they are
        // wherever the camera's width changed between a place's moments: the yard's shots)
        if(pd&&k>0){const r=pd/k;if(!(e.rlo<=r))e.rlo=r;if(!(e.rhi>=r))e.rhi=r;}}
      return di.apply(this,arguments);};}
  // a bitmap taken off an offscreen canvas carries what was drawn on it; the canvas starts again as a new one
  if(typeof OffscreenCanvas!=='undefined'&&OffscreenCanvas.prototype.transferToImageBitmap){const tb=OffscreenCanvas.prototype.transferToImageBitmap;
    OffscreenCanvas.prototype.transferToImageBitmap=function(){const b=tb.apply(this,arguments);ids.set(b,idOf(this));ids.set(this,nid++);return b;};}
  // the scene's still layer: its pixels a unit are known
  if(typeof sceneLayer==='function'){const SL=sceneLayer;sceneLayer=function(){const L=SL.apply(this,arguments);if(L&&L.cv)R.roots[idOf(L.cv)]=L.sc;return L;};}}
(async()=>{const b=await chromium.launch({executablePath:chromiumPath()});
  const F=process.env.LWF?JSON.parse(fs.readFileSync(process.env.LWF,'utf8')):null;
  for(const sh of SHOTS){if(ONLY&&!ONLY.includes(sh.id))continue;const t0=Date.now();
    const p=await (await b.newContext({viewport:{width:VW,height:VH},deviceScaleFactor:DPR,isMobile:VW<700,hasTouch:VW<700})).newPage(),errs=[];
    p.on('pageerror',e=>errs.push(e.message));await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
    await p.goto('file://'+path.resolve(PAGE));await p.waitForTimeout(300);if(F)await p.evaluate(f=>{window.__LWF=f;},F);await p.evaluate(instrument);
    await p.evaluate(()=>{S.soundOn=false;let a=5;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
      window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
      window.R0=window.render;window.drawing=on=>{window.render=on?window.R0:()=>{};};});
    if(sh.lab){await p.evaluate(([g,nf])=>{S.arenaKey=g;S.backroom=false;S.deep=false;S.introOn=false;S.cfg.n=2;S.cfg.crew=false;S.cfg.ally.on=true;S.auto=true;S.allyAuto=true;S.F=[];rosterBuild();restart();
        drawing(false);let n=0,t0=null;while(n<9000){step(1);n++;if(S.game.phase==='exchange'&&S.game.ex){if(t0==null)t0=S.t;if(S.t>t0+2)break;}}drawing(true);step(nf);},[sh.lab,NF]);}
    else{await p.evaluate(([k,all])=>{storyGo(k);S.storyAuto=true;S.auto=true;step(2);window.__t0=S.t;window.__tf=null;window.__to=null;window.__tc=null;window.__key=k;drawing(!!all);},[sh.stage,sh.draw==='all']);
      // (an 'x', 'o' or 'c' moment drawn until its time comes, as places.js shoots it)
      for(const m of sh.at){await p.evaluate(([m,all,nf])=>{const k=m[0],fight=k==='f',outro=k==='o',cut=k==='c',exact=k==='x'||outro||cut,T=+m.slice(1),key=window.__key,still=()=>S.story&&S.story.key===key&&!S.story.ended;
          const inFight=()=>S.story&&S.story.step==='fight'&&(S.game.phase==='input'||S.game.phase==='exchange');let n=0;
          const base=()=>{if(fight){if(window.__tf==null&&inFight())window.__tf=S.t;return window.__tf;}
            if(outro){if(window.__to==null&&S.story&&S.story.step==='outro')window.__to=S.t;return window.__to;}
            if(cut){const C=S.cut;if(window.__tc==null&&C&&S.story&&S.story.step==='fight'&&C.name!==key+':intro'&&C.name!==key+':outro')window.__tc=S.t;return window.__tc;}
            return window.__t0;};
          const due=()=>{const b=base();return b!=null&&S.t>=b+T-(all?0:.5);};
          while(still()&&!due()&&n<12000){step(1);n++;}if(!still())return;
          if(!all){drawing(true);if(exact){let i=0;const b=base();while(still()&&S.t<b+T&&i<240){step(1);i++;}}else step(nf);drawing(false);}},[m,sh.draw==='all',NF]);}}
    const R=await p.evaluate(()=>window.__LW);R.errs=errs.slice(0,3);fs.writeFileSync(path.join(OUT,sh.id+'.json'),JSON.stringify(R));
    console.log(sh.id,Object.keys(R.sites).length,'sites',((Date.now()-t0)/1000).toFixed(0)+'s',errs.slice(0,2).join(' | '));
    await p.context().close();}
  await b.close();})();
