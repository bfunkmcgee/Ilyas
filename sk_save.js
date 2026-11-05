// ==================== SAVES (since V92) ====================
// A night of the story is kept at the start of every stage: the stage, the run's flags, his health as he came to it, and what each
// part of the game says a run carries from one stage to the next (savePart: the Act I record, the tears in his suit). The game only
// makes the record (S.story.at, at each storyStage) and starts a stage from one (storyBegin(key, {resume: record})); the page keeps
// it in the browser and puts Continue on the title (sk_saveui.js). Continue starts the stage from its record as Try again starts it
// from the stage's own start: a fresh body for him (as a chapter has), with the night's flags, health and record put back.
const SAVE_V=1;
// what a run carries besides its flags and his health: take() gives it as data (null: nothing), put(data) puts it back before the
// stage is set up
const SAVE_PARTS=[];
function savePart(name,take,put){SAVE_PARTS.push({name,take,put});}
// a copy of what is only data (numbers, strings, true and false, null, lists and plain objects): a fighter, a function, an object
// with ways of its own or anything met twice on the way down is left out (the stage sets its own up again, as a chapter's does)
function saveData(v,seen){if(v===null||typeof v==='string'||typeof v==='boolean'||(typeof v==='number'&&isFinite(v)))return v;
  if(typeof v!=='object')return undefined;seen=seen||new Set();if(seen.has(v))return undefined;seen.add(v);
  try{if(Array.isArray(v))return v.map(x=>{const y=saveData(x,seen);return y===undefined?null:y;});
    const pr=Object.getPrototypeOf(v);if(pr!==Object.prototype&&pr!==null)return undefined;
    for(const k in v)if(typeof v[k]==='function')return undefined;
    const out={};for(const k of Object.keys(v)){const y=saveData(v[k],seen);if(y!==undefined)out[k]=y;}return out;}
  finally{seen.delete(v);}}
// the record of a stage's start (key: the stage). A stage not built yet (the end of what is built) is kept as the stage it came after
// (after), so a later build that goes on from there continues the night.
function saveTake(key){const SV=S.story,st=STAGES[stageIx(key)],ready=stageReady(st);
  const cp={v:SAVE_V,key:ready?key:null,after:ready?null:SV.key||null,flags:saveData(SV.flags)||{},hp:SV.hp==null?null:SV.hp,healAt:SV.healAt||null,t:S.t,parts:{}};
  for(const p of SAVE_PARTS){try{const d=p.take();if(d!=null)cp.parts[p.name]=d;}catch(e){}}
  return cp;}
// the stage a record starts, in this build: its own, or the one that now comes after the stage it was kept after; null when neither
function saveResumeKey(cp){if(!cp||cp.v!==SAVE_V)return null;
  if(cp.key){const st=STAGES[stageIx(cp.key)];return stageReady(st)?cp.key:null;}
  if(cp.after){const a=STAGES[stageIx(cp.after)],st=a&&STAGES[stageIx(a.next)];return a&&stageReady(st)?st.key:null;}
  return null;}
// where a record stands, whether or not the stage is built: its stage, or the one it was kept after
function saveWhere(cp){const k=cp&&(cp.key||cp.after);return k&&stageIx(k)>=0?k:null;}
// (the record's times are on the game's clock, S.t: a visit later starts it again from nothing, so it is put on to the night's own
// first, and a time in the record stands where it stood; within one visit the clock has only gone on)
function saveRestore(R){const SV=S.story;SV.flags=JSON.parse(JSON.stringify(R.flags||{}));SV.hp=R.hp==null?null:R.hp;SV.healAt=R.healAt||null;
  if(typeof R.t==='number'&&isFinite(R.t)&&S.t<R.t)S.t=R.t;
  for(const p of SAVE_PARTS){const d=R.parts&&R.parts[p.name];if(d==null)continue;try{p.put(JSON.parse(JSON.stringify(d)));}catch(e){}}}
// storyBegin(key, {resume}): the run is begun as a chapter is, then its first stage starts from the record
let SAVE_RESUME=null;
{const sb=storyBegin;storyBegin=function(key,o){SAVE_RESUME=o&&o.resume||null;try{return sb.apply(this,arguments);}finally{SAVE_RESUME=null;}};}
{const ss=storyStage;storyStage=function(key){const SV=S.story;
  if(SV&&SAVE_RESUME){const R=SAVE_RESUME;SAVE_RESUME=null;saveRestore(R);}
  if(SV)SV.at=saveTake(key);
  return ss.apply(this,arguments);};}
// the Pit's record of what each scene did (S.act1: the crate's choice is a flag; the errand, the satchel, the map, the toll's count...)
savePart('act1',()=>S.act1?saveData(S.act1):null,v=>{S.act1=v;});
// the tears the night has put in his suit (in the Pit each stage dresses him anew)
savePart('suit',()=>{const K=S.story&&S.story.K;if(!K||!((K.rips&&K.rips.length)||(K.hemTears&&K.hemTears.length)))return null;
  return{rips:saveData(K.rips||[])||[],hem:saveData(K.hemTears||[])||[]};},v=>{const K=storyKael();K.rips=v.rips||[];K.hemTears=v.hem||[];});
