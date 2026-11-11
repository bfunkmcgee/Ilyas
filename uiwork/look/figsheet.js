// The figures, before and after (since Nov 10): everyone the game draws with the cast's painter, each on a card of his own as the
// game draws him and again with the finer figures on (FigKit.fine), set one above the other on sheets of five. The people: Ilyas,
// the prologue's named elves and up to PER of each crew (as the line-up takes them), the named elves the story does not field,
// Amri, and the Pit's people (three each of the beggars, the townsfolk and the children).
// usage: node uiwork/look/figsheet.js <out folder> [K] [easy|guard] [cast|pit|all]
//   K: pixels a unit (3.4; 2 is an upright phone's push-in). easy: standing easy, their hands empty; guard: in their guard, armed.
//   PAGE=uiwork/qa_test.html to shoot a copy. Writes cards/<id>.<0|1>.png, sheet-<n>.png and figsheet.json; ends with "errors 0".
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const {chromiumPath,pageSetup}=require('./places.js');
const OUT=process.argv[2]||'test_out/figsheet',K=+(process.argv[3]||3.4),GUARD=process.argv[4]==='guard',SET=process.argv[5]||'all',PER=3,SETTLE=150;
fs.mkdirSync(path.join(OUT,'cards'),{recursive:true});
// (in the page) the people, stood in a row on the open field, held in a scene that never ends
function stand([per,settle,guard,set]){
  S.arenaKey='field';S.backroom=false;S.deep=false;S.introOn=false;S.cfg.n=1;S.cfg.crew=false;S.cfg.ally.on=false;S.auto=true;S.F=[];rosterBuild();restart();
  drawing(false);step(2);cutStart('figsheet',(function*(){for(;;)yield;})());
  const K0=S.F[0];S.F=[K0];S.trails=[[]];
  const who=[],seen=new Set(),crew={},x0=-240,gap=190;let n=0;
  K0.station=x0;K0.lane=K0.dep=K0.stepDep=120;K0.facing=1;K0.offstage=true;if(!guard){standEasy(K0);stowBlade(K0);}K0.build();
  if(set!=='pit'){
    for(const st of STAGES.slice(0,stageIx('fall')+1))for(const e of st.foes||[]){if(e.beast)continue;
      if(e.human){const w=e.ward||'street';crew[w]=(crew[w]||0)+1;if(crew[w]>per)continue;who.push({...e,ward:w,id:w+crew[w]});}
      else if(!seen.has(e.name)){seen.add(e.name);who.push({...e,id:e.name});}}
    for(const name of Object.keys(ELVES))if(!seen.has(name)){seen.add(name);who.push({name,id:name,seed:9601+37*n++,weapon:'sword',skill:ELVES[name].min});}
    who.push({name:ALLY_NAME,id:ALLY_NAME,ally:true,seed:S.cfg.ally.seed,weapon:S.cfg.ally.weapon,skill:S.cfg.ally.skill,color:ALLY_COLOR});
    who.forEach((e,i)=>{const f=new Fighter(S.F.length,e.ally?0:1,e.name,e.color||FOE_COLORS[i%3]);f.npc=true;
      if(e.ally)f.ally=true;if(e.human){f.hench=true;f.ward=e.ward;f.armsRoom=e.arms||'street';}
      f.scfg={seed:e.seed,weapon:e.weapon||'fists',skill:e.skill||1,temper:e.temper||'plain'};if(e.human)f.hc=f.scfg;
      Object.assign(f,{seed:e.seed,weaponKey:f.scfg.weapon,skill:f.scfg.skill,temper:f.scfg.temper});
      f.setup(e.seed,f.weaponKey,f.skill,x0+gap*(i+1),120);f.maxHp=f.hp=20;f.facing=1;f.offstage=true;f.side=1;f.reads={};f.wounds={head:0,arm:0,leg:0,body:0};f.marks=[];
      if(!guard)standEasy(f);f.build();S.F.push(f);S.trails.push([]);e.f=f;});}
  if(set!=='cast'&&typeof ACT1_CAST!=='undefined')for(const name of Object.keys(ACT1_CAST)){const reps=name==='Beggar'||name==='Townsfolk'||name==='Child'?3:1;
    for(let j=0;j<reps;j++){const f=act1Npc(name,{x:x0+gap*(who.length+1),dep:120,facing:1,seed:(ACT1_CAST[name].seed||1)+j*17});f.offstage=true;f.build();who.push({id:name+(reps>1?j+1:''),f,pit:true});}}
  step(settle);
  window.__figs=(set==='pit'?[]:[{id:'Ilyas',f:K0}]).concat(who.map(e=>({id:e.id.replace(/[^A-Za-z0-9]/g,''),f:e.f,pit:!!e.pit})));
  return window.__figs.map(o=>({id:o.id,cm:Math.round(bodyHeight(o.f.body)),bulk:+o.f.body.bulk.toFixed(2),weapon:o.f.weaponKey}));}
// (in the page) each drawn on a clear card at K pixels a unit, as the game draws him and with the finer figures on; the sheets
function sheets([K,guard,per]){
  const L=window.__figs,keep=ctx,dw=drawWeapon,CW=Math.round(150*K),CH=Math.round(215*K),errs=[],fine0=FigKit.fine;
  drawing(true);window.R0();if(!guard)drawWeapon=function(){};
  const box=c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let x0=c.width,x1=0,y0=c.height,y1=0;
    for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(d[(y*c.width+x)*4+3]>8){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}return x1<x0?[0,0,c.width,c.height]:[x0,y0,x1+1,y1+1];};
  try{for(const o of L){o.cards=[];for(const fine of [false,true]){FigKit.fine=fine;const f=o.f,c=document.createElement('canvas');c.width=CW;c.height=CH;const x=c.getContext('2d');
      const gy=Math.max(...f.p.map(q=>q.y)),cx=(f.p[FTF].x+f.p[FTB].x)/2;x.setTransform(K,0,0,K,CW/2-cx*K,CH-8*K-gy*K);ctx=x;
      try{if(f.idx===0)drawKael(f);else drawCast(f);}catch(e){errs.push(o.id+(fine?' (fine)':'')+': '+e);}finally{ctx=keep;}o.cards.push(c);}
    const a=box(o.cards[0]),b=box(o.cards[1]);o.box=[Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[2],b[2]),Math.max(a[3],b[3])];}}
  finally{drawWeapon=dw;drawing(false);FigKit.fine=fine0;}
  // the sheets: `per` people across, as the game draws them above, the finer figures below, on the lab's slate
  const out=[],pad=Math.round(6*K),lab=30,gapY=Math.round(4*K);
  for(let i=0;i<L.length;i+=per){const G=L.slice(i,i+per),ws=G.map(o=>o.box[2]-o.box[0]+2*pad),h=Math.max(...G.map(o=>o.box[3]-o.box[1]))+pad,W=ws.reduce((a,b)=>a+b,0),H=lab+2*(h+gapY)+lab;
    const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.fillStyle='#8f8a82';x.fillRect(0,0,W,H);
    // (a lit ground behind them, as a place's is: the figures are dark and read against light)
    const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#a9a399');g.addColorStop(1,'#7d776f');x.fillStyle=g;x.fillRect(0,0,W,H);
    let px=0;x.textBaseline='middle';
    G.forEach((o,j)=>{for(let r=0;r<2;r++){const y=lab+r*(h+gapY+lab*0)+ (r?gapY:0)+(h-(o.box[3]-o.box[1]));x.drawImage(o.cards[r],o.box[0],o.box[1],o.box[2]-o.box[0],o.box[3]-o.box[1],px+pad,y,o.box[2]-o.box[0],o.box[3]-o.box[1]);}
      x.fillStyle='#1b1a1d';x.font='600 17px sans-serif';x.fillText(o.id,px+pad,lab/2);px+=ws[j];});
    x.fillStyle='rgba(20,19,22,.72)';x.font='600 14px sans-serif';x.fillText('now',4,lab+12);x.fillText('finer',4,lab+h+gapY+12);
    out.push(c.toDataURL('image/png'));}
  return{sheets:out,cards:L.map(o=>({id:o.id,urls:o.cards.map(c=>c.toDataURL('image/png'))})),errs};}
(async()=>{const b=await chromium.launch({executablePath:chromiumPath()});
  const p=await (await b.newContext({viewport:{width:1200,height:800},deviceScaleFactor:1})).newPage(),perr=[];p.on('pageerror',e=>perr.push(e.message));
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+process.cwd()+'/'+(process.env.PAGE||'test_page.html'));await p.waitForTimeout(300);
  await p.evaluate(a=>{window.pageSetup=eval('('+a+')');pageSetup();},pageSetup.toString());
  const who=await p.evaluate(stand,[PER,SETTLE,GUARD,SET]),r=await p.evaluate(sheets,[K,GUARD,5]);
  r.sheets.forEach((u,i)=>fs.writeFileSync(path.join(OUT,'sheet-'+(i+1)+'.png'),Buffer.from(u.split(',')[1],'base64')));
  for(const o of r.cards)o.urls.forEach((u,i)=>fs.writeFileSync(path.join(OUT,'cards',o.id+'.'+i+'.png'),Buffer.from(u.split(',')[1],'base64')));
  fs.writeFileSync(path.join(OUT,'figsheet.json'),JSON.stringify({K,guard:GUARD,set:SET,who},null,1));
  const errs=r.errs.concat(perr);console.log(who.length+' people, '+r.sheets.length+' sheets in '+OUT);console.log('errors '+errs.length+(errs.length?' '+JSON.stringify(errs.slice(0,6)):''));
  await b.close();process.exit(errs.length?1:0);})();
