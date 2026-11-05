// ==================== SAVES ON THE PAGE (since V92) ====================
// The night is kept in this browser (localStorage 'ilyas.night'): the record of each stage's start of a kept night (S.story.at,
// sk_save.js) is written as the stage begins, and the title's Continue starts it again, naming where it stands. A night is kept when
// it was begun from the title (Begin, Continue, Play again from the top) or picked from Chapters while none is kept; a chapter picked
// while one is kept is a replay and leaves it as it was. Begin asks first when one is kept. A night kept at the end of what is built
// says so on the title, and goes on from there once a later build does. The settings picked are kept too ('ilyas.settings': gore,
// sound; the effects keep their own, sk_lightui.js). Where the browser keeps nothing (a private window, storage refused) nothing is
// kept and the game plays as it always has.
const SAVE_KEY='ilyas.night',SAVE_SET='ilyas.settings';
// keep: the night on now is kept; force: the next storyGo keeps its night whatever is kept (Begin, Continue)
const SAVE_UI={keep:false,force:null};
function saveRead(){let s=null;try{s=localStorage.getItem(SAVE_KEY);}catch(e){return null;}if(!s)return null;
  try{const o=JSON.parse(s);return o&&o.cp&&typeof o.cp==='object'&&o.cp.v===SAVE_V?o:null;}catch(e){return null;}}
function saveWrite(cp){try{localStorage.setItem(SAVE_KEY,JSON.stringify({t:Date.now(),label:saveLabel(saveWhere(cp)),cp}));return true;}catch(e){return false;}}
// the night kept, when this build knows where it stands: o (what is kept), at (its stage, or the one it was kept after), go (the
// stage Continue starts; null at the end of what is built)
function saveHeld(){const o=saveRead();if(!o)return null;const at=saveWhere(o.cp);if(!at)return null;return{o,at,go:saveResumeKey(o.cp)};}
// where a stage stands, as the title says it: the act, the scene's number and title (a stage without them has the last before it
// in the same act that has them)
function saveLabel(key){const i=stageIx(key);if(i<0)return'';const act=STAGES[i].act||0;let num='',title='';
  for(let j=i;j>=0&&(!num||!title);j--){const s=STAGES[j];if((s.act||0)!==act)break;if(!title&&s.title)title=s.title;if(!num&&s.num)num=s.num;}
  const head=act?'Act '+(['','I','II','III'][act]||act):'Prologue';
  if(!title)return head+' · The opening';
  return head+' · '+(act?'Scene '+num:num)+' · '+title;}

// ---------- the title ----------
// Continue (the first button when a night is kept), the line that says where it stands, and Begin's question
function saveMenuSync(){const go=document.getElementById('stContinue');if(!go)return;
  const at=document.getElementById('stSaved'),begin=document.getElementById('stBegin'),h=saveHeld(),can=!!(h&&h.go);
  go.hidden=!can;go.classList.toggle('st-go',can);begin.classList.toggle('st-go',!can);
  at.hidden=!h;at.textContent=!h?'':can?'Where you left off: '+saveLabel(h.go):'Your night has reached the end of what is built: '+saveLabel(h.at)+'.';}
function saveAsk(on,h){const m=ST_UI.menu,ask=document.getElementById('stAsk');if(!m||!ask)return;m.querySelector('.st-btns').hidden=on;ask.hidden=!on;
  if(on){document.getElementById('stSaved').hidden=true;document.getElementById('stChapList').hidden=true;
    document.getElementById('stAskT').textContent='A new night takes the place of the one kept at '+saveLabel(h.at)+'.';}else saveMenuSync();}
V11UI.init.push(()=>{const m=ST_UI.menu;if(!m)return;const btns=m.querySelector('.st-btns'),begin=m.querySelector('#stBegin'),inner=m.querySelector('.st-menu-in'),list=m.querySelector('#stChapList');
  const go=stEl('button','st-btn','Continue');go.type='button';go.id='stContinue';go.hidden=true;btns.insertBefore(go,begin);
  // (under the buttons, over the chapters)
  const at=stEl('p','st-saved');at.id='stSaved';at.hidden=true;inner.insertBefore(at,list);
  const ask=stEl('div','st-ask','<p class="st-ask-t" id="stAskT"></p><div class="st-btns"><button type="button" class="st-btn st-go" id="stAskNew">Begin anew</button>'+
    '<button type="button" class="st-btn" id="stAskBack">Back</button></div>');ask.id='stAsk';ask.hidden=true;inner.insertBefore(ask,list);
  go.addEventListener('click',()=>{const h=saveHeld();if(!h||!h.go)return;ensureAudio();SAVE_UI.force=true;storyGo(h.go,{resume:h.o.cp});});
  ask.querySelector('#stAskNew').addEventListener('click',()=>{saveAsk(false);ensureAudio();SAVE_UI.force=true;storyGo(null);});
  ask.querySelector('#stAskBack').addEventListener('click',()=>saveAsk(false));
  saveMenuSync();});
{const bp=storyBeginPressed;storyBeginPressed=function(){const h=saveHeld();if(h){saveAsk(true,h);return;}SAVE_UI.force=true;return bp.apply(this,arguments);};}
{const sm=storyMenu;storyMenu=function(on){sm.apply(this,arguments);if(on){saveAsk(false);SAVE_UI.keep=false;}};}
// which nights are kept (above): decided as the night begins
{const sg=storyGo;storyGo=function(key){SAVE_UI.keep=SAVE_UI.force!=null?SAVE_UI.force:(key==null||!saveHeld());SAVE_UI.force=null;return sg.apply(this,arguments);};}
// each stage of a kept night as it begins, and the end of what is built when the night reaches it
{const sh=S.hooks.story;S.hooks.story=(k,a)=>{sh(k,a);if(k==='quit'){SAVE_UI.keep=false;return;}
  if((k==='stage'||k==='end')&&SAVE_UI.keep&&S.story&&S.story.at)saveWrite(S.story.at);};}

// ---------- the settings ----------
function saveSettings(){try{localStorage.setItem(SAVE_SET,JSON.stringify({gore:S.gore,sound:!!S.soundOn}));}catch(e){}}
V11UI.init.push(()=>{let o=null;try{o=JSON.parse(localStorage.getItem(SAVE_SET)||'null');}catch(e){o=null;}
  if(o&&typeof o==='object'){if(['off','ink','red'].includes(o.gore))S.gore=o.gore;
    if(typeof o.sound==='boolean'){S.soundOn=o.sound;const t=document.getElementById('tSound');if(t)t.checked=o.sound;}
    if(typeof updateBench==='function')updateBench();}
  const gs=document.getElementById('goreSeg'),ts=document.getElementById('tSound');
  if(gs)gs.addEventListener('click',e=>{if(e.target.closest('[data-g]'))saveSettings();});if(ts)ts.addEventListener('change',()=>saveSettings());});
