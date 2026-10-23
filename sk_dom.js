const fs=require('fs');
const js=fs.readFileSync('sk_full.js','utf8');
const ctxProxy=new Proxy({},{get:(t,k)=>{if(k in t)return t[k];if(k==='createLinearGradient'||k==='createRadialGradient')return()=>({addColorStop(){}});return()=>{};},set:(t,k,v)=>{t[k]=v;return true;}});
const els={};
function mkEl(id){const e={id,_html:'',textContent:'',hidden:false,disabled:false,checked:id==='tSound'||id==='tTable',value:'3',style:{},dataset:{},className:'',children:[],
  classList:{add(){},remove(){},toggle(){}},addEventListener(t,f){(e._l=e._l||{})[t]=f;},
  querySelector(){return mkEl('q');},querySelectorAll(){return [];},appendChild(c){e.children.push(c);return c;},insertBefore(c){e.children.push(c);return c;},prepend(c){e.children.unshift(c);},
  get lastChild(){return{remove(){e.children.pop();}};},remove(){},focus(){},closest(){return null;},setAttribute(){},setPointerCapture(){},
  getBoundingClientRect(){return{left:0,top:0,width:900,height:500};},getContext(){return ctxProxy;},parentElement:{clientWidth:900},width:900,height:500,
  set innerHTML(v){e._html=v;},get innerHTML(){return e._html;}};return e;}
global.document={getElementById:id=>els[id]||(els[id]=mkEl(id)),createElement:()=>mkEl('new'),addEventListener(t,f){(global.docL=global.docL||{})[t]=f;},activeElement:null};
global.window={matchMedia:()=>({matches:false}),devicePixelRatio:1,addEventListener(){}};
global.ResizeObserver=class{observe(){}};
let now=0;global.performance={now:()=>now};
let rafCb=null;global.requestAnimationFrame=cb=>{rafCb=cb;};
global.setTimeout=(f)=>{f();return 1;};global.clearTimeout=()=>{};
eval(js+`
let errs=0,frames=0;const seen={};
// (one frame in eight is drawn: the game never depends on its drawing, and the drawing is most of a frame's time; the drawn ones keep the
// drawing's own code under the same scripted play)
const __R=render;let __fc=0;
const step=n=>{for(let i=0;i<n;i++){now+=16.7;const draw=(++__fc%8)===0;if(!draw)render=()=>{};try{rafCb(now);}catch(e){errs++;if(errs<6)console.log('ERR',e.stack.split('\\n').slice(0,4).join(' | '));}finally{if(!draw)render=__R;}frames++;}};
// one scripted human run: random targets, previews and commands, openings answered by hand
const play=frames=>{let r=0;
  for(let i=0;i<frames&&S.game.phase!=='over';i++){
    step(1);
    if(S.opening&&!isAI(S.opening.f.idx)&&i%7===3){const ch=openingChoices(S.opening);previewAction(ch[r%4]);seen['op_'+S.opening.source]=(seen['op_'+S.opening.source]||0)+1;previewAction(null);}
    if(S.opening&&!isAI(S.opening.f.idx)&&i%7===0)humanOpening(openingChoices(S.opening)[r++%4]);
    if(S.game.phase==='input'&&!isAI(S.game.active)&&!S.opening&&i%5===0){
      if(i%3===0){const fs=foes();if(fs.length)setTarget(fs[r%fs.length].idx);}
      previewAction(CMD_ORDER[r%CMD_ORDER.length]);if(/tempo|turn|line/.test(els.cmdPreview.innerHTML+els.tempoLine.textContent))seen._preview=(seen._preview||0)+1;previewAction(null);
      const ok=CMD_ORDER.filter(k=>!els['cmd-'+k].disabled);const k=ok[r++%ok.length];seen[k]=(seen[k]||0)+1;humanCommand(k);}
  }
};
for(const ally of [false,true])for(const n of [1,2,3])for(const ak of Object.keys(ARENAS)){
  S.cfg.n=n;S.cfg.crew=false;S.arenaKey=ak;S.cfg.ally.on=ally;S.allyAuto=ally&&n===2;S.F=[];rosterBuild();restart();S.auto=false;
  play(60*170);
  seen[(ally?'a':'')+'n'+n+'_'+S.game.phase]=(seen[(ally?'a':'')+'n'+n+'_'+S.game.phase]||0)+1;
  // (the panel is empty by design between rooms, in the intro and in the last scene, once Kael is dead while Amri fights on, and in
  // the moment the last foe is down before the fight is over, as updateIntents says)
  if(!els.intents.innerHTML&&!['over','transit','intro','finale'].includes(S.game.phase)){
    console.log('empty intents panel:',ak,(ally?'ally ':'')+'n'+n,S.game.phase,'Kael dead:',!!S.F[0].dead,'foes standing:',foes().length);
    if(!S.F[0].dead&&foes().length)seen._noIntents=(seen._noIntents||0)+1;}
}
// crew runs: Qadir and six henchmen in every arena, solo and with Amri, once by hand and once with the hero on auto
for(const ally of [false,true])for(const ak of Object.keys(ARENAS))for(const auto of [false,true]){
  S.cfg.n=1;S.cfg.crew=true;S.arenaKey=ak;S.cfg.ally.on=ally;S.allyAuto=ally;S.F=[];rosterBuild();restart();S.auto=auto;
  if(S.F.length!==4+!!ally||els.fieldLine.textContent.indexOf('v crew')<0)seen._crewSetup=(seen._crewSetup||0)+1;
  play(60*(auto?400:240));
  const rows=S.F.filter(f=>f.hench).length;if(rows&&!S.F.some(f=>f.hench&&f.dead))seen._crewNoDeaths=(seen._crewNoDeaths||0)+1;
  if(S.F.some(f=>!Number.isFinite(f.p[PEL].x+f.p[HEAD].y)))seen._crewNaN=(seen._crewNaN||0)+1;
  const k='crew'+(ally?'a':'')+(auto?'A':'')+'_'+S.game.phase;seen[k]=(seen[k]||0)+1;
}
S.auto=false;S.cfg.crew=false;
// the whole restaurant run on auto: four rooms and the last scene. The first run leaves the choice to auto; the others take
// the hero off auto in the last scene and choose by hand
for(const [n,ally,crew,pick] of [[1,false,false,null],[2,true,false,'behead'],[1,false,true,'spare']]){
  S.cfg.n=n;S.cfg.crew=crew;S.arenaKey='restaurant';S.backroom=true;S.deep=true;S.cfg.ally.on=ally;S.allyAuto=ally;S.F=[];rosterBuild();restart();S.auto=true;
  S.F[0].maxHp=S.F[0].hp=600;let fin=0,asked=0;
  for(let i=0;i<60*1500&&S.game.phase!=='over';i++){step(1);
    if(S.game.phase==='finale'){fin++;if(pick&&S.auto)S.auto=false;
      if(pick&&typeof finaleChoose==='function'&&S.finale&&S.finale.step==='choice'&&++asked===30)finaleChoose(pick);}}
  const k='run'+n+(ally?'a':'')+(crew?'c':'')+'_'+S.game.phase+'@'+S.room+(fin?'_fin':'');seen[k]=(seen[k]||0)+1;
  if(S.F.some(f=>!f.gone&&!Number.isFinite(f.p[PEL].x+f.p[HEAD].y)))seen._runNaN=(seen._runNaN||0)+1;
}
S.auto=false;S.cfg.crew=false;
// key handler + table drag + target click through the canvas
S.cfg.crew=false;S.cfg.ally.on=false;S.cfg.n=2;S.arenaKey='field';S.F=[];rosterBuild();restart();S.auto=false;step(5);
docL.keydown({key:'t',target:{tagName:'BODY'}});console.log('target after T:',S.target);
const tb=tableScreenBox();els.cv._l.pointerdown({clientX:(tb.l+tb.r)/2,clientY:(tb.t+tb.b)/2,pointerId:1,preventDefault(){}});
els.cv._l.pointermove({clientX:(tb.l+tb.r)/2-150,clientY:(tb.t+tb.b)/2+20,pointerType:'mouse'});els.cv._l.pointerup();
console.log('table moved to',tableIntact()?tableBox().cx.toFixed(0)+' dep '+S.table.dep.toFixed(0):'none');
const V=S.F[1],q=P(V.p[PEL].x,V.p[PEL].y,V.dep);els.cv._l.pointerdown({clientX:q.x,clientY:q.y,pointerId:2,preventDefault(){}});console.log('clicked target:',S.target);
console.log('fieldLine:',els.fieldLine.textContent);console.log('intents:',els.intents.innerHTML.replace(/<[^>]+>/g,''));
console.log('seen',JSON.stringify(seen),'frames',frames,'errors',errs);
`);
