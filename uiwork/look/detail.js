// The levels of detail, measured (since Nov 14; the drawing's rule 13): stills of the yard's walk about with Ilyas at one mark and
// the view at three widths (the whole yard, the walk, a close shot), each with the camera's pixels a unit, the scale the place was
// painted at (the still picture and the pieces: sceneScale), every figure's box and the boxes of a few things, a wall, the roof,
// the floor and the Pit's far wall in the picture's pixels. detail.py reads them: how busy and how loud each is, and how far the
// place is enlarged under the people. Nothing here is a check; the numbers are a guide, judged with the stills.
// usage: node uiwork/look/detail.js <out folder> [w h dpr] [day|dusk|night]   (PAGE=<page>, default ragdoll-skirmish-lab.html)
//   writes <out>/<w>x<h>_<hour>_<view>.png and <out>/<w>x<h>_<hour>.json
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');const {chromiumPath}=require('./places.js');
const OUT=process.argv[2],W=+(process.argv[3]||412),H=+(process.argv[4]||714),DPR=+(process.argv[5]||2),HOUR=process.argv[6]||'day';
if(!OUT){console.error('usage: node uiwork/look/detail.js <out folder> [w h dpr] [day|dusk|night]');process.exit(2);}
const PAGE=process.env.PAGE||path.join(__dirname,'..','..','ragdoll-skirmish-lab.html');fs.mkdirSync(OUT,{recursive:true});
// the views (units across): an upright phone's and a wide screen's own widths for the whole yard, the walk and a close shot
const VIEWS=W<640?[['whole',640],['walk',440],['close',280]]:[['whole',900],['door',600],['close',420]];
// where he stands (the yard's middle, before the ladder), and what is measured, in the picture's own units (x, y as drawn)
const AT={x:216,z:150},BOXES={barrels:[272,258,361,366],'rain barrel':[477,240,520,318],woodpile:[517,257,571,281],pump:[523,312,611,398],
  wall:[243,135,329,253],roof:[168,57,404,102],floor:[221,388,469,474],'far wall':[168,-188,611,16]};
(async()=>{const b=await chromium.launch({executablePath:chromiumPath()});
  const p=await (await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:DPR,isMobile:W<700,hasTouch:true})).newPage(),errs=[];
  p.on('pageerror',e=>errs.push(e.message.slice(0,300)));
  // (the page's clock and its frames are stepped from here, and the UI's dice seeded, so two runs draw the same)
  await p.addInitScript(()=>{window.__rafs=[];window.requestAnimationFrame=cb=>{window.__rafs.push(cb);return window.__rafs.length;};
    let a=0x2F6E2B1;Math.random=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
    window.__now=1e6;performance.now=()=>window.__now;Date.now=()=>1.7e12+window.__now;});
  await p.goto('file://'+path.resolve(PAGE)+'?host=0&scene=none');await p.waitForTimeout(1200);
  await p.evaluate(hour=>{S.soundOn=false;window.step=k=>{for(let i=0;i<k;i++){window.__now+=1000/60;const L=window.__rafs;window.__rafs=[];for(const f of L){if(f.name==='frame'){try{f(window.__now);}catch(e){window.__errm=String(e&&e.stack||e).slice(0,400);}}else window.__rafs.push(f);}}};
    S.auto=true;storyGo('yard1',{auto:true});step(60);
    S.auto=false;S.cut=null;S.say=null;S.fade=0;S.card=null;S.letter=0;storyFight();S.act1.yard.drunk=true;S.act1.yard.walked=999;
    S.act1.night=hour==='night';S.act1.dusk=hour==='dusk';S.act1.morning=false;step(60);},HOUR);
  const out={w:W,h:H,dpr:DPR,hour:HOUR,views:[]},tag=W+'x'+H+'_'+HOUR;
  for(const [name,w] of VIEWS){
    const r=await p.evaluate(([w,AT,BOXES])=>{const K=hero(),dx=AT.x-K.station;K.station=AT.x;K.lane=AT.z;K.dep=AT.z;for(const q of K.p){q.x+=dx;if(q.px!=null)q.px+=dx;if(q.ox!=null)q.ox+=dx;}
      const E=S.ex;if(E){E.to=null;if(!E.__cam0)E.__cam0=E.cam;const f=E.__cam0;E.cam=(C,K2,E2)=>{if(f)f(C,K2,E2);C.w=C.wn=C.ws=w;};E.view=w;E.viewN=w;}
      step(110);
      const dpr=cv.width/Math.max(1,cssW),k=cssW/cam.viewW,L=cam.x-cam.viewW/2,T=cam.T,sx=X=>Math.round((X-L)*k*dpr),sy=Y=>Math.round((Y-T)*k*dpr);
      const boxes={};for(const n in BOXES){const B=BOXES[n];boxes[n]=[sx(B[0]),sy(B[1]),sx(B[2]),sy(B[3])];}
      for(const f of S.F){const d=f.dep||0,xs=f.p.slice(0,11).map(q=>q.x+d*PSX),ys=f.p.slice(0,11).map(q=>q.y-d*PSY);
        boxes[f.name||f.pitCast||'?']=[sx(Math.min(...xs)-12),sy(Math.min(...ys)-14),sx(Math.max(...xs)+12),sy(Math.max(...ys)+6)];}
      return{across:+cam.viewW.toFixed(1),ppu:+(k*dpr).toFixed(3),painted:+sceneScale().toFixed(3),people:S.F.map(f=>f.name||f.pitCast||'?'),boxes,err:window.__errm||'',png:cv.toDataURL('image/png')};},[w,AT,BOXES]);
    fs.writeFileSync(path.join(OUT,tag+'_'+name+'.png'),Buffer.from(r.png.split(',')[1],'base64'));delete r.png;out.views.push({name,...r});}
  fs.writeFileSync(path.join(OUT,tag+'.json'),JSON.stringify(out,null,1));
  for(const v of out.views)console.log(tag,v.name,v.across+' across,',v.ppu+' pixels a unit, the place painted at '+v.painted+(v.ppu>v.painted?' and enlarged '+(v.ppu/v.painted).toFixed(2)+' times':'')+(v.err?'  ERR '+v.err:''));
  if(errs.length)console.log('page errors:',JSON.stringify(errs.slice(0,3)));await b.close();})();
