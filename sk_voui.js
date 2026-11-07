// ===== VOICES UI (since V98) =====
// The page plays the cast's recorded lines (VO_LINES, sk_vo.js): a line's recording starts as its words come up (S.say.vo), stops
// when the line is moved on, gone or replaced, and is held with the game (the menu open, the page hidden), going on from where the
// line had got to. A recording that loads late starts only within a moment of its line. The files are loaded beside the page from
// vo/ by a relative path, the stage's lines and the next stage's (the published page needs them published with it: GUIDE.md,
// "Voices"); a page opened as a file plays none. They go through a gain of their own straight to the speakers, as the song does, and
// the song steps back under a line while it is said (MUSIC.duck, sk_storyui.js). The sound switch closes the gain. Nothing here
// writes what the game reads.
const VO_GAIN=.8,VO_DUCK=.55;
const VO_BY={};for(const L of VO_LINES)VO_BY[L.id]=L;
const VOX={bufs:{},loading:{},bad:{},want:new Set(),setKey:null,bus:null,cur:null,heard:null,done:null};
function voxCan(){return typeof AC!=='undefined'&&!!AC&&typeof fetch==='function'&&typeof location!=='undefined'&&/^https?:$/.test(location.protocol);}
function voxBus(){if(!VOX.bus){VOX.bus=AC.createGain();VOX.bus.connect(AC.destination);}return VOX.bus;}
// ---------- loading ----------
function voxFetch(id){if(!VO_BY[id]||!VO_BY[id].len||!voxCan()||VOX.bufs[id]||VOX.loading[id]||VOX.bad[id])return;VOX.loading[id]=true;const a=AC;
  const done=b=>{delete VOX.loading[id];if(b&&VOX.want.has(id))VOX.bufs[id]=b;else if(!b)VOX.bad[id]=true;};
  fetch('vo/'+id+'.mp3').then(r=>{if(!r.ok)throw new Error(r.status);return r.arrayBuffer();})
    .then(ab=>new Promise((ok,no)=>{try{const p=a.decodeAudioData(ab,ok,no);if(p&&p.catch)p.catch(no);}catch(e){no(e);}}))
    .then(b=>done(b),()=>done(null));}
// the lines of the stage the page shows and of the one after it; the rest is let go
function voxSets(){const SV=S.story,key=SV&&SV.key?SV.key:'';if(key===VOX.setKey)return;VOX.setKey=key;
  const st=key?STAGES[stageIx(key)]:null,nx=st&&st.next,W=new Set(VO_LINES.filter(L=>L.len>0&&key&&(L.stage===key||L.stage===nx)).map(L=>L.id));VOX.want=W;
  for(const id of Object.keys(VOX.bufs))if(!W.has(id)&&!(VOX.cur&&VOX.cur.id===id))delete VOX.bufs[id];
  for(const id of W)voxFetch(id);}
// ---------- playing ----------
function voxStart(L,from){const b=VOX.bufs[L.id];if(!b)return false;const a=AC,src=a.createBufferSource(),g=a.createGain();
  src.buffer=b;g.gain.value=VO_GAIN;src.connect(g);g.connect(voxBus());src.start(a.currentTime,clamp(from||0,0,Math.max(0,b.duration-.05)));
  const V={src,g,id:L.id,say:S.say};VOX.cur=V;
  src.onended=()=>{if(VOX.cur===V){VOX.cur=null;VOX.done=V.say;}try{g.disconnect();}catch(e){}};return true;}
function voxStop(fade){const V=VOX.cur;if(!V)return;VOX.cur=null;try{const t=AC.currentTime;V.g.gain.setTargetAtTime(0,t,(fade||.05)/3);V.src.stop(t+(fade||.05)+.03);}catch(e){}}
V11UI.tick.push(()=>{if(!voxCan())return;voxSets();
  const sy=S.say,hidden=typeof document!=='undefined'&&!!document.hidden,held=!!S.paused||hidden;
  if(VOX.bus)VOX.bus.gain.setTargetAtTime(S.soundOn&&!hidden?1:0,AC.currentTime,.02);
  // a line gone, moved on or replaced, or the game held: its voice stops
  if(VOX.cur&&(!sy||VOX.cur.say!==sy||sy.adv||held))voxStop(sy&&sy.adv?.08:.05);
  // the line's voice from where the line has got to: at its start (a file that loads late, within a moment of it), or on after a hold
  if(sy&&sy.vo&&!sy.adv&&!held&&!VOX.cur&&VOX.done!==sy&&S.soundOn&&!S.warming&&AC.state==='running'){const L=VO_BY[sy.vo],at=S.t-sy.t0;
    if(L&&VOX.bufs[L.id]&&at<L.len-.12&&(at<.4||VOX.heard===sy)&&voxStart(L,Math.max(0,at)))VOX.heard=sy;}
  // the song steps back while a line is said
  if(typeof MUSIC!=='undefined'){const d=VOX.cur?VO_DUCK:1;if(MUSIC.duck!==d){MUSIC.duck=d;musicSync();}}});
// leaving the story stops a line being said
{const sh=S.hooks.story;S.hooks.story=(k,a)=>{sh(k,a);if(k==='quit'||k==='end')voxStop(.1);};}
// ===== VOICES UI END =====
