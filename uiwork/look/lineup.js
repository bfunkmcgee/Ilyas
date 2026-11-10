// The cast's line-up (since Nov 9): everyone the prologue fields and the lab's named few, each standing easy on a card of his own,
// filled black. A figure is told from the next by his outline before anything else, and at the sizes a phone draws him the outline is
// nearly all the player has: what cannot be told apart here cannot be told apart in a fight. One sheet, three bands: the outlines at
// K pixels a unit; the same at the two sizes an upright phone draws them (about 1 pixel a unit when the camera has pushed in, about
// half that on the player's turn, each on a 2x screen); and the same people as the game draws them, named, with their heights and
// builds. It also measures how alike every two named figures are at the push-in's size (the share of their two outlines that they
// have in common, their feet set together: 1 is the same outline) and names the closest pairs.
// The people come from the prologue's own rosters (STAGES' foes through the fall: every named elf, up to PER of each crew), then the named elves
// the story does not field (sk_cast.js ELVES) and Amri. They stand on the lab's open field, held in a scene that never ends, so
// nobody takes a turn; each is drawn again by his own painter on a clear card.
// usage: node uiwork/look/lineup.js <out folder> [K] [arms]     (arms: 1 leaves the weapons in their hands; default hidden)
//   PAGE=uiwork/qa_test.html to shoot a copy. Writes lineup.png, lineup.json (who, heights, builds, the pairs) and cards/<id>.png.
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const {chromiumPath,pageSetup}=require('./places.js');
const OUT=process.argv[2]||'test_out/lineup',K=+(process.argv[3]||3),ARMS=process.argv[4]==='1',PER=3,SETTLE=150;
fs.mkdirSync(path.join(OUT,'cards'),{recursive:true});
// (in the page) the people, stood easy in a row on the open field
function lineupStand([per,settle]){
  S.arenaKey='field';S.backroom=false;S.deep=false;S.introOn=false;S.cfg.n=1;S.cfg.crew=false;S.cfg.ally.on=false;S.auto=true;S.F=[];rosterBuild();restart();
  drawing(false);step(2);cutStart('lineup',(function*(){for(;;)yield;})());
  const K0=S.F[0];S.F=[K0];S.trails=[[]];
  const who=[],seen=new Set(),crew={};
  for(const st of STAGES.slice(0,stageIx('fall')+1))for(const e of st.foes||[]){if(e.beast)continue;
    if(e.human){const w=e.ward||'street';crew[w]=(crew[w]||0)+1;if(crew[w]>per)continue;who.push({...e,ward:w,id:w+crew[w],label:e.name});}
    else if(!seen.has(e.name)){seen.add(e.name);who.push({...e,id:e.name,label:e.name});}}
  let n=0;for(const name of Object.keys(ELVES))if(!seen.has(name)){seen.add(name);who.push({name,id:name,label:name,seed:9601+37*n++,weapon:'sword',skill:ELVES[name].min});}
  who.push({name:ALLY_NAME,id:ALLY_NAME,label:ALLY_NAME,ally:true,seed:S.cfg.ally.seed,weapon:S.cfg.ally.weapon,skill:S.cfg.ally.skill,color:ALLY_COLOR});
  const x0=-240,gap=190;
  K0.station=x0;K0.lane=K0.dep=K0.stepDep=120;K0.facing=1;K0.offstage=true;standEasy(K0);stowBlade(K0);K0.build();
  who.forEach((e,i)=>{const f=new Fighter(S.F.length,e.ally?0:1,e.name,e.color||FOE_COLORS[i%3]);f.npc=true;
    if(e.ally)f.ally=true;if(e.human){f.hench=true;f.ward=e.ward;f.armsRoom=e.arms||'street';}
    f.scfg={seed:e.seed,weapon:e.weapon||'fists',skill:e.skill||1,temper:e.temper||'plain'};if(e.human)f.hc=f.scfg;
    Object.assign(f,{seed:e.seed,weaponKey:f.scfg.weapon,skill:f.scfg.skill,temper:f.scfg.temper});
    f.setup(e.seed,f.weaponKey,f.skill,x0+gap*(i+1),120);f.maxHp=f.hp=20;f.facing=1;f.offstage=true;f.side=1;f.reads={};f.wounds={head:0,arm:0,leg:0,body:0};f.marks=[];
    standEasy(f);f.build();S.F.push(f);S.trails.push([]);e.f=f;});
  step(settle);
  window.__lineup=[{id:'Kael',label:HERO_NAME,named:true,f:K0}].concat(who.map(e=>({id:e.id.replace(/[^A-Za-z0-9]/g,''),label:e.label,named:!e.human,ward:e.ward||null,f:e.f})));
  return window.__lineup.map(o=>({id:o.id,label:o.label,named:o.named,ward:o.ward,cm:Math.round(bodyHeight(o.f.body)),bulk:+o.f.body.bulk.toFixed(2),weapon:o.f.weaponKey}));}
// (in the page) each of them drawn on a clear card at K pixels a unit, the sheet made of the cards, and how alike the named are
function lineupSheet([K,arms]){
  const L=window.__lineup,keep=ctx,dw=drawWeapon,CW=Math.round(118*K),CH=Math.round(178*K),errs=[];
  drawing(true);window.R0();if(!arms)drawWeapon=function(){};
  try{for(const o of L){const f=o.f,c=document.createElement('canvas');c.width=CW;c.height=CH;const x=c.getContext('2d');
    const gy=Math.max(...f.p.map(q=>q.y)),cx=(f.p[FTF].x+f.p[FTB].x)/2;x.setTransform(K,0,0,K,CW/2-cx*K,CH-8*K-gy*K);ctx=x;
    try{if(f.idx===0)drawKael(f);else drawCast(f);}catch(e){errs.push(o.id+': '+e);}finally{ctx=keep;}o.card=c;}}
  finally{drawWeapon=dw;drawing(false);}
  // an outline: the card's solid part (a glow round an eye or a lamp is not part of him), black
  const black=(c,s)=>{const w=Math.max(1,Math.round(c.width*s)),h=Math.max(1,Math.round(c.height*s)),b=document.createElement('canvas');b.width=w;b.height=h;const x=b.getContext('2d');
    const m=document.createElement('canvas');m.width=c.width;m.height=c.height;const mx=m.getContext('2d');mx.drawImage(c,0,0);const im=mx.getImageData(0,0,c.width,c.height),d=im.data;
    for(let i=0;i<d.length;i+=4){const a=d[i+3]>96?255:0;d[i]=14;d[i+1]=13;d[i+2]=16;d[i+3]=a;}mx.putImageData(im,0,0);
    x.imageSmoothingQuality='high';x.drawImage(m,0,0,w,h);return b;};
  // how alike two outlines are: the pixels both cover over the pixels either covers, the cards laid one on the other (feet together)
  const mask=b=>{const d=b.getContext('2d').getImageData(0,0,b.width,b.height).data,o=new Uint8Array(b.width*b.height);for(let i=0;i<o.length;i++)o[i]=d[i*4+3]>127?1:0;return o;};
  const s1=1/K*2,s2=.5/K*2,B=L.map(o=>black(o.card,1)),P1=L.map(o=>black(o.card,s1)),P2=L.map(o=>black(o.card,s2)),M=P1.map(mask),pairs=[];
  for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){if(!L[i].named&&!L[j].named&&L[i].ward!==L[j].ward)continue;
    let both=0,any=0;for(let q=0;q<M[i].length;q++){const a=M[i][q],b=M[j][q];both+=a&b;any+=a|b;}pairs.push({a:L[i].id,b:L[j].id,named:L[i].named&&L[j].named,alike:+(both/Math.max(1,any)).toFixed(3)});}
  pairs.sort((a,b)=>b.alike-a.alike);
  // the sheet
  const cols=Math.min(L.length,Math.ceil(L.length/3)),rows=Math.ceil(L.length/cols),pad=28,head=58,cw=CW*.62,Wd=Math.round(pad*2+cols*cw),sc=cw/CW,ch=CH*sc,lab=46;
  const Hh=Math.round(pad+(head+rows*(ch+8))+(head+P1[0].height+16)+(head+P2[0].height+16)+(head+rows*(ch+lab))+pad),S0=document.createElement('canvas');S0.width=Wd;S0.height=Hh;
  const x=S0.getContext('2d');x.fillStyle='#0c0b10';x.fillRect(0,0,Wd,Hh);let y=pad;
  const title=t=>{x.fillStyle='#f3ead6';x.font='600 26px sans-serif';x.textBaseline='top';x.fillText(t,pad,y+10);y+=head;};
  title('Black fill, standing easy'+(arms?'':', weapons hidden')+'. Who is who?');
  for(let r=0;r<rows;r++){x.fillStyle='#96928a';x.fillRect(pad,y,Wd-2*pad,ch+4);
    for(let i=r*cols;i<Math.min(L.length,(r+1)*cols);i++){x.drawImage(B[i],pad+(i-r*cols)*cw,y,cw,ch);x.fillStyle='#2a2826';x.font='700 20px sans-serif';x.fillText(String(i+1),pad+(i-r*cols)*cw+8,y+6);}y+=ch+8;}
  const strip=(P,t)=>{title(t);x.fillStyle='#96928a';x.fillRect(pad,y,Wd-2*pad,P[0].height+8);const step=Math.min((Wd-2*pad-16-P[0].width)/Math.max(1,L.length-1),P[0].width*1.1);
    P.forEach((b,i)=>x.drawImage(b,pad+8+i*step,y+4));y+=P[0].height+16;};
  strip(P1,'At a phone’s push-in (about 1 pixel a unit, on a 2x screen)');
  strip(P2,'On the player’s turn (about half a pixel a unit, on a 2x screen)');
  title('As the game draws them');
  for(let r=0;r<rows;r++){x.fillStyle='#16181f';x.fillRect(pad,y,Wd-2*pad,ch);
    for(let i=r*cols;i<Math.min(L.length,(r+1)*cols);i++){const cx=pad+(i-r*cols)*cw;x.drawImage(L[i].card,cx,y,cw,ch);
      x.fillStyle='#f3ead6';x.font='600 17px sans-serif';x.textAlign='center';x.fillText((i+1)+'  '+L[i].label,cx+cw/2,y+ch+6);
      x.fillStyle='#a09888';x.font='14px sans-serif';x.fillText(Math.round(bodyHeight(L[i].f.body))+' cm, build '+L[i].f.body.bulk.toFixed(2),cx+cw/2,y+ch+26);x.textAlign='left';}y+=ch+lab;}
  return{errs,pairs,sheet:S0.toDataURL('image/png'),cards:L.map(o=>({id:o.id,png:o.card.toDataURL('image/png')}))};}
(async()=>{const b=await chromium.launch({executablePath:chromiumPath()}),errs=[];
  const p=await (await b.newContext({viewport:{width:1200,height:800},deviceScaleFactor:1})).newPage();p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+process.cwd()+'/'+(process.env.PAGE||'test_page.html'));await p.waitForTimeout(300);
  await p.evaluate(([a,b2,c])=>{window.pageSetup=eval('('+a+')');window.lineupStand=eval('('+b2+')');window.lineupSheet=eval('('+c+')');pageSetup();},
    [pageSetup.toString(),lineupStand.toString(),lineupSheet.toString()]);
  const who=await p.evaluate(a=>lineupStand(a),[PER,SETTLE]),r=await p.evaluate(a=>lineupSheet(a),[K,ARMS]);
  fs.writeFileSync(path.join(OUT,'lineup.png'),Buffer.from(r.sheet.split(',')[1],'base64'));
  for(const c of r.cards)fs.writeFileSync(path.join(OUT,'cards',c.id+'.png'),Buffer.from(c.png.split(',')[1],'base64'));
  const named=r.pairs.filter(q=>q.named),mean=named.reduce((s,q)=>s+q.alike,0)/Math.max(1,named.length),crews=r.pairs.filter(q=>!q.named);
  fs.writeFileSync(path.join(OUT,'lineup.json'),JSON.stringify({K,arms:ARMS,who,pairs:r.pairs,namedMean:+mean.toFixed(3)},null,1));
  console.log(who.length+' people: '+who.map((w,i)=>(i+1)+' '+w.label+' '+w.cm+'cm/'+w.bulk).join(', '));
  console.log('named pairs, how alike at the push-in size (1 is the same outline): mean '+mean.toFixed(3)+', closest '+named.slice(0,6).map(q=>q.a+'/'+q.b+' '+q.alike).join(', '));
  if(crews.length)console.log('within a crew or against a named figure: closest '+crews.slice(0,5).map(q=>q.a+'/'+q.b+' '+q.alike).join(', '));
  console.log('errors',errs.concat(r.errs).length,errs.concat(r.errs).slice(0,3).join(' | '));await b.close();})();
