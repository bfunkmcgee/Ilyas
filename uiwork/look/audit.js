// The look audit: every place the game draws, at chosen moments, shot as a player sees it (the page, HUD and all), with numbers for
// each frame read from the game's canvas: its average colour and its main colours (for a colour script), how light it is and how much
// its light varies, how saturated, how much of it is near black or near white, how far Ilyas stands out from what is right round
// him, and what the frame costs to draw (the headless canvas draws without a graphics chip: a worst case).
// usage: node uiwork/look/audit.js <outdir> [w h dpr] [id,id,...]   (PAGE=uiwork/qa_test.html for a copy: build.py --qa; INJ=<file.js>
// runs that script in the page once it has loaded, to try a change before it is made in the sources; COSTN=<n> times each frame n
// times instead of 6, the median kept: single draws here wander by several milliseconds)
// Writes <outdir>/<id>_<moment>.jpg (the page), <id>_<moment>_canvas.png (the game's picture between the bars, a quarter size) and
// <id>_<moment>_hero.png (the frame round Ilyas at full size, as he is measured: without the rings and head bars), and
// <outdir>/audit.json. A moment is seconds from the stage's start ('t8') or from its fight's
// first turn ('f4'). The fast-forward to a moment is not drawn (drawing never changes the game: the drawfree suite), then two seconds
// are drawn before the shot so that what eases in (the bars, the coat, the pieces painted ahead) has settled; the fall is drawn
// all the way (its sand and its pieces follow what was drawn).
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const OUT=process.argv[2]||'uiwork/look/out',VW=+(process.argv[3]||412),VH=+(process.argv[4]||714),DPR=+(process.argv[5]||2),ONLY=process.argv[6]?process.argv[6].split(','):null;
const PAGE=process.env.PAGE||'test_page.html';fs.mkdirSync(OUT,{recursive:true});
// every story stage in order, then the lab's own grounds (the four the story does not use, and the street it does, fought free)
const SHOTS=[
  {id:'sundown',stage:'sundown',at:['t6','t16']},{id:'field',stage:'field',at:['t2','f4']},{id:'chase',stage:'chase',at:['f3','f8']},
  {id:'roadblock',stage:'roadblock',at:['t2','f4']},{id:'vargo',stage:'vargo',at:['t3','f4']},{id:'dining',stage:'dining',at:['f2','f5']},
  {id:'kitchen',stage:'kitchen',at:['f2','f5']},{id:'platform',stage:'platform',at:['t3','t8']},{id:'line',stage:'line',at:['f2','f5']},
  {id:'deep',stage:'deep',at:['t3','f4']},{id:'lobby',stage:'lobby',at:['t3','f4']},{id:'office',stage:'office',at:['t3','f4']},
  {id:'roof',stage:'roof',at:['t4','t10','t16','t22','t32.9','t33.9']},{id:'fall',stage:'fall',at:['t4','t24','t37','t46.5'],draw:'all'},
  {id:'roof1',stage:'roof1',at:['t3','t9']},{id:'kitchen1',stage:'kitchen1',at:['t3','t8']},{id:'backroom',stage:'backroom',at:['t4','t12']},
  {id:'lostprop',stage:'lostprop',at:['t4','t12']},{id:'yard1',stage:'yard1',at:['t5','t15']},{id:'list',stage:'list',at:['t5','t15']},
  {id:'stairsup',stage:'stairsup',at:['t5','t15']},{id:'shelfstair',stage:'shelfstair',at:['t5','t12']},{id:'shelf',stage:'shelf',at:['t5','t15']},
  {id:'stairsdown',stage:'stairsdown',at:['t5','t12']},{id:'toll',stage:'toll',at:['t3','f4']},{id:'tamm',stage:'tamm',at:['t3','f4']},
  {id:'night',stage:'night',at:['t5','t15']},{id:'sh1',stage:'sh1',at:['t3','f4']},
  {id:'lab_street',lab:'street'},{id:'lab_field',lab:'field'},{id:'lab_hill',lab:'hill'},{id:'lab_ledge',lab:'ledge'},{id:'lab_wall',lab:'wall'}];
// (in the page) the frame's numbers
function frameStats(){const W2=cv.width,H2=cv.height,lb=typeof ST_LB==='number'?ST_LB:0,y0=Math.floor(H2*.105*lb)+2,y1=H2-y0,d=ctx.getImageData(0,y0,W2,y1-y0).data;
  const lum=(r,g,b)=>.2126*r+.7152*g+.0722*b;let n=0,sr=0,sg=0,sb=0,sL=0,sL2=0,sS=0,dk=0,br=0;const hue=new Array(12).fill(0),lit=[];
  for(let i=0;i<d.length;i+=4*5){const r=d[i]/255,g=d[i+1]/255,b=d[i+2]/255,L=lum(r,g,b),mx=Math.max(r,g,b),mn=Math.min(r,g,b),s=mx?(mx-mn)/mx:0;
    n++;sr+=r;sg+=g;sb+=b;sL+=L;sL2+=L*L;sS+=s;if(L<.06)dk++;if(L>.9)br++;
    if(mx-mn>.04){let h=mx===r?(g-b)/(mx-mn):mx===g?2+(b-r)/(mx-mn):4+(r-g)/(mx-mn);h=((h*60)+360)%360;hue[Math.floor(h/30)]+=s*mx;}
    if(L>=.04)lit.push(r,g,b);}
  const hx=c=>'#'+c.map(v=>Math.round(Math.min(1,Math.max(0,v))*255).toString(16).padStart(2,'0')).join('');
  // what the light is made of: the lit pixels (all but the near black) in six clusters, each with its share of them (k-means from a
  // fixed start, so the same frame gives the same colours)
  const pick=[],np=lit.length/3;if(np>=6){const st=Math.max(1,Math.floor(np/6000)),P=[];for(let i=0;i<np;i+=st)P.push([lit[i*3],lit[i*3+1],lit[i*3+2]]);
    let a=7;const rnd=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;},d2=(p,q)=>(p[0]-q[0])**2+(p[1]-q[1])**2+(p[2]-q[2])**2;
    const Cn=[P[Math.floor(rnd()*P.length)].slice()];while(Cn.length<6){let tot=0;const D=P.map(p=>{const m=Math.min(...Cn.map(c=>d2(p,c)));tot+=m;return m;});let t=rnd()*tot,k=0;while(k<P.length-1&&t>D[k]){t-=D[k];k++;}Cn.push(P[k].slice());}
    let lab=new Array(P.length).fill(0);for(let it=0;it<12;it++){const S2=Cn.map(()=>[0,0,0,0]);P.forEach((p,i)=>{let b=0,bd=1e9;Cn.forEach((c,j)=>{const q=d2(p,c);if(q<bd){bd=q;b=j;}});lab[i]=b;const s3=S2[b];s3[0]+=p[0];s3[1]+=p[1];s3[2]+=p[2];s3[3]++;});
      S2.forEach((s3,j)=>{if(s3[3])Cn[j]=[s3[0]/s3[3],s3[1]/s3[3],s3[2]/s3[3]];});}
    const cnt=Cn.map(()=>0);lab.forEach(j=>cnt[j]++);Cn.forEach((c,j)=>{if(cnt[j])pick.push({hex:hx(c),w:+(cnt[j]/P.length).toFixed(3),L:+lum(c[0],c[1],c[2]).toFixed(3)});});pick.sort((x,y)=>y.w-x.w);}
  const m=sL/n,ht=hue.reduce((a,b)=>a+b,0)||1;let er=0,rows=0;
  // (a row counts as empty when it is near black and flat: nothing painted there, not a dark sky with its stars and its gradient)
  for(let y=0;y<y1-y0;y+=4){let s2=0,q2=0,c=0;for(let x=0;x<W2;x+=4){const i=(y*W2+x)*4,L=lum(d[i]/255,d[i+1]/255,d[i+2]/255);s2+=L;q2+=L*L;c++;}rows++;const mu=s2/c;if(mu<.035&&Math.sqrt(Math.max(0,q2/c-mu*mu))<.006)er++;}
  return{mean:'#'+[sr,sg,sb].map(v=>Math.round(v/n*255).toString(16).padStart(2,'0')).join(''),L:+m.toFixed(3),Lsd:+Math.sqrt(Math.max(0,sL2/n-m*m)).toFixed(3),
    sat:+(sS/n).toFixed(3),dark:+(dk/n).toFixed(3),bright:+(br/n).toFixed(3),empty:+(er/rows).toFixed(2),hues:hue.map(v=>+(v/ht).toFixed(3)),lit:+(np/n).toFixed(3),main:pick.map(p=>[p.hex,p.w,p.L])};}
// (in the page) Ilyas against what is right round him: his drawn pixels (where his sprite is solid) against the ring just outside.
// He is measured on the frame drawn again without the page's marks on the fight (the footing rings, the head bars,
// the intent labels: a ring under him is not his outline reading), once more without him, and once without anyone (the shadows all
// kept): where the first two differ is where he shows, so a part of him behind something (a blanket over him, a counter in front, a
// word of the fight's over his shoulder) is left out of his outline instead of read as a part of it that does not stand out; where
// the last two differ is where someone else is, so his outline against another man (Tamm holding him up) is left out too: the rule is
// about him against the ground. The frame is drawn once more with everything for the shot.
function heroStats(){const K=typeof hero==='function'?hero():null;if(!K||typeof FXL==='undefined'||!FXL.sprite)return null;
  const MARKS=['drawFooting','drawHeadBars','drawLabels'],keep=MARKS.map(k=>window[k]);
  window.drawFooting=()=>null;window.drawHeadBars=()=>{};window.drawLabels=()=>{};let M=null;
  // (the finish's grain moves each frame on a wide screen: held still while he is measured, or the frames drawn again differ by it
  // everywhere and it reads as him)
  const fin=EnvLook.finish,rf=S._rf||0;EnvLook.finish=function(o){const r=S._rf;S._rf=rf;try{return fin.call(this,o);}finally{S._rf=r;}};
  try{window.R0();const R=FXL.sprite(K);if(R&&R.cv){
      const pad=Math.round(14*cv.width/Math.max(1,cssW)),x0=Math.max(0,R.x-pad),y0=Math.max(0,R.y-pad),x1=Math.min(cv.width,R.x+R.w+pad),y1=Math.min(cv.height,R.y+R.h+pad);
      if(x1-x0>=4&&y1-y0>=4){M={R:{x:R.x,y:R.y,w:R.w,h:R.h},st:FXL.struck?FXL.struck(K):0,pad,x0,y0,x1,y1,S:R.cv.getContext('2d').getImageData(0,0,R.w,R.h).data,A:ctx.getImageData(x0,y0,x1-x0,y1-y0).data};
        let crop=null;{const m=Math.round(40*cv.width/Math.max(1,cssW)),cx0=Math.max(0,R.x-m),cy0=Math.max(0,R.y-m),w=Math.min(cv.width,R.x+R.w+m)-cx0,hh=Math.min(cv.height,R.y+R.h+m)-cy0,c=document.createElement('canvas');
          c.width=w;c.height=hh;c.getContext('2d').drawImage(cv,cx0,cy0,w,hh,0,0,w,hh);crop=c.toDataURL('image/png');}M.crop=crop;
        // (a figure left out is not set down; its sprite is still made, so its shadow and its reflection stay where they were)
        const put=FXL.put,frame=skip=>{FXL.put=function(f){return skip(f)?true:put.apply(this,arguments);};
          try{window.R0();}finally{FXL.put=put;}return ctx.getImageData(x0,y0,x1-x0,y1-y0).data;};
        M.B=frame(f=>f===K);M.C=frame(()=>true);}}}
  finally{MARKS.forEach((k,i)=>{window[k]=keep[i];});EnvLook.finish=fin;}
  try{const h=M?heroRead(M):null;if(h)h.crop=M.crop;return h;}finally{window.R0();}}
function heroRead(M){const {R,pad,x0,y0,x1,y1,S:S2,A:F,B,C:Cf}=M,W2=x1-x0,a=(x,y)=>{const sx=x-R.x,sy=y-R.y;return sx<0||sy<0||sx>=R.w||sy>=R.h?0:S2[(sy*R.w+sx)*4+3];};
  const df=(P,Q,i)=>Math.abs(P[i]-Q[i])+Math.abs(P[i+1]-Q[i+1])+Math.abs(P[i+2]-Q[i+2])>9,lum=i=>(.2126*F[i]+.7152*F[i+1]+.0722*F[i+2])/255,seen=i=>df(F,B,i),other=i=>df(B,Cf,i);let nh=0,Lh=0,nb=0,Lb=0,nv=0;
  // (every pixel: a sample of one in four moves with where his sprite's box starts, and two builds whose boxes differ by a pixel read
  // up to a tenth apart on the same picture; the counts are kept in quarters, the old sample's units)
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const A=a(x,y),i=((y-y0)*W2+(x-x0))*4;if(A>200){if(!seen(i))continue;nh++;Lh+=lum(i);}
    else if(A<4){let near=false;for(const [dx,dy] of [[pad,0],[-pad,0],[0,pad],[0,-pad],[pad*.7|0,pad*.7|0],[-(pad*.7|0),pad*.7|0],[pad*.7|0,-(pad*.7|0)],[-(pad*.7|0),-(pad*.7|0)]])if(a(x+dx,y+dy)>200){near=true;break;}
      if(near){nb++;Lb+=lum(i);}}}
  if(nh<80||nb<80)return null;Lh/=nh;Lb/=nb;
  // his outline: where solid meets clear within a few pixels and he shows there, the light just inside against just outside (a rim
  // or a lit ground both count); 'read' is the share of the outline with a step of at least .08
  const e=Math.max(2,Math.round(2*cv.width/Math.max(1,cssW)));let ne=0,se=0,ok=0,hid=0,fig=0;
  for(let y=y0+e;y<y1-e;y++)for(let x=x0+e;x<x1-e;x++){if(a(x,y)<=200)continue;for(const [dx,dy] of [[e,0],[-e,0],[0,e],[0,-e]]){if(a(x+dx,y+dy)>=4||a(x+2*dx,y+2*dy)>=4)continue;
      const i=((y-y0)*W2+(x-x0))*4;if(!seen(i)){hid++;break;}const j=((y+2*dy-y0)*W2+(x+2*dx-x0))*4;if(other(j)){fig++;break;}const d=Math.abs(lum(i)-lum(j));ne++;se+=d;if(d>=.08)ok++;break;}}
  // (the drawing guide's rule 8: a frame fails when under two thirds of his outline reads, or when the ground round him is under .2;
  // an outline mostly hidden is not judged, nor one in the flash of a blow landing on him or by him: struck)
  const rd=ne>=96?ok/ne:null,hit=M.st>.25;
  return{Lh:+Lh.toFixed(3),Lb:+Lb.toFixed(3),ratio:+((Math.max(Lh,Lb)+.05)/(Math.min(Lh,Lb)+.05)).toFixed(2),edge:ne?+(se/ne).toFixed(3):null,read:rd!=null?+rd.toFixed(2):null,px:Math.round(nh/4),
    shown:ne+hid+fig?+((ne+fig)/(ne+hid+fig)).toFixed(2):null,alone:ne+fig?+(ne/(ne+fig)).toFixed(2):null,struck:+M.st.toFixed(2),box:[R.x,R.y,R.w,R.h],fails:[...(rd!=null&&rd<2/3&&!hit?['outline']:[]),...(Lb<.2?['ground']:[])]};}
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),res=[];
  for(const sh of SHOTS){if(ONLY&&!ONLY.includes(sh.id))continue;
    const p=await (await b.newContext({viewport:{width:VW,height:VH},deviceScaleFactor:DPR,isMobile:VW<700,hasTouch:VW<700})).newPage(),errs=[];
    p.on('pageerror',e=>errs.push(e.message));await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
    await p.goto('file://'+path.resolve(PAGE));await p.waitForTimeout(300);if(process.env.INJ)await p.evaluate(fs.readFileSync(process.env.INJ,'utf8'));
    await p.evaluate(([fs1,fs2,fs3])=>{window.frameStats=eval('('+fs1+')');window.heroStats=eval('('+fs2+')');window.heroRead=eval('('+fs3+')');S.soundOn=false;let a=5;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
      window.__now=performance.now()+1000;window.step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
      window.R0=window.render;window.drawing=on=>{window.render=on?window.R0:()=>{};};
      window.small=()=>{const lb=typeof ST_LB==='number'?ST_LB:0,y0=Math.floor(cv.height*.105*lb),h=cv.height-2*y0,c=document.createElement('canvas');c.width=Math.round(cv.width/4);c.height=Math.round(h/4);
        c.getContext('2d').drawImage(cv,0,y0,cv.width,h,0,0,c.width,c.height);return c.toDataURL('image/png');};
      // the fight's words over the fighters (the style guide's rule 7): how many are drawn, and how many the game has said and keeps
      window.words=()=>typeof fightWords==='function'?{n:fightWords().n,said:S.popups.length+S.callouts.length}:null;
      window.cost=()=>{const n=window.__costN,T=[];for(let i=0;i<n;i++){ctx.getImageData(0,0,1,1);const s0=performance.now();window.R0();ctx.getImageData(0,0,1,1);T.push(performance.now()-s0);}T.sort((x,y)=>x-y);return+((T[(n-1)>>1]+T[n>>1])/2).toFixed(1);};},
      [frameStats.toString(),heroStats.toString(),heroRead.toString()]);
    await p.evaluate(n=>{window.__costN=n;},Math.max(2,+(process.env.COSTN||6)));
    if(sh.lab){const r=await p.evaluate(g=>{S.arenaKey=g;S.backroom=false;S.deep=false;S.introOn=false;S.cfg.n=2;S.cfg.crew=false;S.cfg.ally.on=true;S.auto=true;S.allyAuto=true;S.F=[];rosterBuild();restart();
        drawing(false);let n=0,t0=null;while(n<9000){step(1);n++;if(S.game.phase==='exchange'&&S.game.ex){if(t0==null)t0=S.t;if(S.t>t0+2)break;}}drawing(true);step(120);
        return{scene:envKey(),stats:frameStats(),hero:heroStats(),ms:cost(),fx:FXL.q,words:words(),canvas:small()};},sh.lab);
      const file=sh.id+'.jpg';await p.screenshot({path:path.join(OUT,file),type:'jpeg',quality:82});
      fs.writeFileSync(path.join(OUT,sh.id+'_canvas.png'),Buffer.from(r.canvas.split(',')[1],'base64'));delete r.canvas;
      if(r.hero&&r.hero.crop){fs.writeFileSync(path.join(OUT,sh.id+'_hero.png'),Buffer.from(r.hero.crop.split(',')[1],'base64'));delete r.hero.crop;}res.push({id:sh.id,moment:'fight',file,...r,errs:errs.slice(0,3)});console.log(sh.id,r.scene,JSON.stringify(r.stats.L),r.ms);}
    else{await p.evaluate(([k,all])=>{storyGo(k);S.storyAuto=true;S.auto=true;step(2);window.__t0=S.t;window.__tf=null;window.__key=k;drawing(!!all);},[sh.stage,sh.draw==='all']);
      for(const m of sh.at){const r=await p.evaluate(([m,all])=>{const fight=m[0]==='f',T=+m.slice(1),key=window.__key,still=()=>S.story&&S.story.key===key&&!S.story.ended;
          const inFight=()=>S.story&&S.story.step==='fight'&&(S.game.phase==='input'||S.game.phase==='exchange');let n=0;
          const due=()=>{if(fight){if(window.__tf==null){if(inFight())window.__tf=S.t;else return false;}return S.t>=window.__tf+T-(all?0:2);}return S.t>=window.__t0+T-(all?0:2);};
          while(still()&&!due()&&n<12000){step(1);n++;}if(!still())return{gone:true};
          if(!all){drawing(true);step(120);drawing(false);}
          return{scene:envKey(),t:+(S.t-window.__t0).toFixed(1),step:S.story.step,phase:S.game.phase,stats:frameStats(),hero:heroStats(),ms:cost(),fx:FXL.q,words:words(),canvas:small()};},[m,sh.draw==='all']);
        if(r.gone){res.push({id:sh.id,moment:m,gone:true});console.log(sh.id,m,'gone');continue;}
        // (the shot is of the frame just drawn; the cost's six draws are of the same moment)
        const file=sh.id+'_'+m+'.jpg';await p.screenshot({path:path.join(OUT,file),type:'jpeg',quality:82});
        fs.writeFileSync(path.join(OUT,sh.id+'_'+m+'_canvas.png'),Buffer.from(r.canvas.split(',')[1],'base64'));delete r.canvas;
        if(r.hero&&r.hero.crop){fs.writeFileSync(path.join(OUT,sh.id+'_'+m+'_hero.png'),Buffer.from(r.hero.crop.split(',')[1],'base64'));delete r.hero.crop;}
        res.push({id:sh.id,stage:sh.stage,moment:m,file,...r,errs:errs.slice(0,3)});console.log(sh.id,m,r.scene,r.t,r.stats.L,r.hero&&r.hero.ratio,r.ms);}}
    await p.context().close();}
  fs.writeFileSync(path.join(OUT,'audit.json'),JSON.stringify({w:VW,h:VH,dpr:DPR,when:new Date().toISOString(),shots:res},null,0));
  const bad=res.filter(r=>r.hero&&r.hero.fails&&r.hero.fails.length).map(r=>r.id+(r.moment&&r.moment!=='fight'?'_'+r.moment:'')+' '+r.hero.fails.join('+')+' (read '+r.hero.read+', ground '+r.hero.Lb+')');
  {const W=res.map(r=>r.words).filter(Boolean);if(W.length)console.log('words over the fighters: at most',Math.max(...W.map(w=>w.n)),'of',Math.max(...W.map(w=>w.said)),'said');}
  console.log('shots',res.length,'errors',JSON.stringify(res.flatMap(r=>r.errs||[]).slice(0,5)));console.log('rule 8 fails',bad.length+(bad.length?':\n  '+bad.join('\n  '):''));await b.close();})();
