// ===== MOTION TEST: ITS PAGE =====
// The test's own scene and its switches (README.md). Not part of the game.
(function(){
'use strict';
const MO=window.MotionTest;
// The test keeps no night: its scenes are started the way a chapter is picked, and a page that kept the place would leave the title's
// Continue pointing into a test (sk_saveui.js). Nothing is written.
if(typeof saveWrite==='function')saveWrite=function(){return false;};
// ---------- the walk ----------
// Ilyas in the Sump's yard, in front of the pump, going through what the test is about: a walk across and back, a jog across and
// back, squaring up and standing easy again, round and round, while Tamm crosses the yard behind him the other way. Nothing here is
// the game's: the stage exists only on this page.
YARD_SHOTS.motion={x:470,w:560,ws:640,wn:380,band:[228,418]};
const WALK={x0:330,x1:610,z:92,tz:150};
const yard1=STAGES[stageIx('yard1')];
STAGES.push({key:'motion',act:1,num:'',title:'',sub:'',arena:'yard',next:null,weapon:'fists',wear:'kit',cardDur:0,foes:[],
  spawn:[[WALK.x0,WALK.z]],
  setup(st){yard1.setup(st);const K=hero(),A=act1State(),T=A.tamm;S.fade=0;K.lurch=0;K.station=WALK.x0;K.lane=K.dep=K.stepDep=WALK.z;K.facing=1;K.build();
    T.station=WALK.x1+30;T.lane=T.dep=T.stepDep=WALK.tz;T.facing=-1;T.build();},
  *intro(st){const K=hero(),T=act1State().tamm;letter(0);yardShot('motion',0);
    const hers=function*(){for(;;){yield* wait(1.4);yield* goTo(T,WALK.x0-20,WALK.tz,70,{direct:true});yield* wait(2.2);yield* goTo(T,WALK.x1+30,WALK.tz,70,{direct:true});yield* wait(.8);}};
    const his=function*(){for(;;){
      yield* wait(.8);
      yield* goTo(K,WALK.x1,WALK.z,84,{direct:true});yield* wait(.9);
      yield* goTo(K,WALK.x0,WALK.z,84,{direct:true});yield* wait(.9);
      yield* goTo(K,WALK.x1,WALK.z,142,{direct:true});yield* wait(.7);
      yield* goTo(K,WALK.x0,WALK.z,142,{direct:true});yield* wait(.9);
      K.facing=1;yield* wait(.8);
      standEasy(K,false);yield* wait(1.6);
      standEasy(K,true);yield* wait(1.2);}};
    yield* all(his(),hers());}});
// ---------- the switches ----------
// Two buttons at the right edge: the drawing (new, old) and the rest. The rest: how a blow is drawn, the two bodies as lines, and
// the three scenes (the walk above, the yard as the game plays it, a fight in the lab that plays itself).
const css=`
#moBar{position:fixed;right:max(6px,env(safe-area-inset-right,0px));bottom:21%;z-index:2147483000;display:flex;flex-direction:column;gap:6px;align-items:flex-end;
  font:600 12px/1.15 system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:.03em;-webkit-user-select:none;user-select:none;touch-action:manipulation}
#moBar button{appearance:none;-webkit-appearance:none;border:1px solid rgba(201,176,128,.6);background:rgba(14,12,10,.82);color:#eadfc6;border-radius:9px;padding:0 10px;
  min-width:58px;min-height:40px;font:inherit;text-align:center;cursor:pointer}
#moBar button.on{background:#d8c08a;color:#17130c;border-color:#d8c08a}
#moBar button:focus-visible{outline:2px solid #fff;outline-offset:2px}
#moSheet{display:none;flex-direction:column;gap:8px;padding:10px;border:1px solid rgba(201,176,128,.6);background:rgba(14,12,10,.92);border-radius:11px;color:#eadfc6;max-width:232px;max-height:66vh;overflow-y:auto}
#moBar.open #moSheet{display:flex}
#moSheet .r{display:flex;flex-direction:column;gap:4px}
#moSheet .r>span{font-weight:500;opacity:.78}
#moSheet .b{display:flex;gap:5px}
#moSheet .b button{flex:1;min-width:0;padding:0 6px}
/* a phone on its side: the buttons half way up the right edge, the sheet beside them, in two columns */
@media (max-height:480px){#moBar{bottom:34%;flex-direction:row;align-items:flex-end}#moSheet{max-width:min(470px,70vw);max-height:86vh;flex-direction:row;flex-wrap:wrap}#moSheet .r{flex:1 1 200px}#moBar button{min-height:36px}}
`;
const el=(t,p,k)=>{const e=document.createElement(t);if(p)Object.assign(e,p);if(k)for(const c of k)e.appendChild(c);return e;};
const bar=el('div',{id:'moBar'}),sheet=el('div',{id:'moSheet'});
const style=el('style',{textContent:css});document.head.appendChild(style);
const state={scene:null};
const pick=(label,opts,get,set)=>{const row=el('div',{className:'r'},[el('span',{textContent:label})]),b=el('div',{className:'b'});
  const btns=opts.map(([name,v])=>{const x=el('button',{type:'button',textContent:name});x.addEventListener('click',()=>{set(v);paint();});b.appendChild(x);return[x,v];});
  row.appendChild(b);sheet.appendChild(row);return()=>{for(const [x,v] of btns){const on=get()===v;x.classList.toggle('on',on);x.setAttribute('aria-pressed',on?'true':'false');}};};
const paints=[];
paints.push(pick('Drawing',[['New',true],['Old',false]],()=>MO.on,v=>{MO.on=v;}));
paints.push(pick('Blows in a fight',[['Ragdoll above the hips','upper'],['Drawn','drawn']],()=>MO.blows,v=>{MO.blows=v;}));
paints.push(pick('The two bodies as lines',[['Off',false],['On',true]],()=>!!MO.bones,v=>{MO.bones=v;}));
paints.push(pick('Scene',[['Walk','walk'],['Yard','yard'],['Fight','fight']],()=>state.scene,v=>go(v)));
const quick=el('button',{type:'button'}),more=el('button',{type:'button',textContent:'Test'});
quick.addEventListener('click',()=>{MO.on=!MO.on;paint();});
more.addEventListener('click',()=>{bar.classList.toggle('open');paint();});
bar.appendChild(sheet);bar.appendChild(el('div',{className:'b',style:'display:flex;gap:6px'},[more,quick]));
function paint(){quick.textContent=MO.on?'New':'Old';quick.classList.toggle('on',MO.on);quick.setAttribute('aria-label',MO.on?'Drawing: new. Tap for old':'Drawing: old. Tap for new');
  more.setAttribute('aria-expanded',bar.classList.contains('open')?'true':'false');for(const p of paints)p();}
// the three scenes
function go(v){
  state.scene=v;
  if(v==='fight'){
    if(S.story)storyQuit();
    storyMenu(false);document.body.classList.remove('story');
    S.arenaKey='restaurant';S.cfg.n=1;S.cfg.ally.on=false;S.tableOn=false;S.divOn=false;S.auto=true;const t=document.getElementById('tAuto');if(t)t.checked=true;
    S.F=[];rosterBuild();restart();}
  else{S.auto=false;const t=document.getElementById('tAuto');if(t)t.checked=false;storyGo(v==='walk'?'motion':'yard1');}
  bar.classList.remove('open');paint();}
MO.go=go;
const start=()=>{document.body.appendChild(bar);paint();if(!/[?&]scene=none/.test(location.search))go('walk');};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else setTimeout(start,0);
})();
