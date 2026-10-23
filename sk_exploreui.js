// ===== EXPLORE UI =====
// (loaded ahead of the main UI script; everything here runs only once the UI is up)
// Exploring on the page. A tap on the floor sends him there at a walk; a second tap on the same spot while he walks, or the Jog
// button, makes it a jog. A tap on a thing's marker sends him to it and uses it. Keys: the arrows or WASD walk him, Shift jogs, E (or
// Enter, or Space) uses the thing nearest him; Q sets down what he holds. The goal and the place's name sit at the top; the action for
// the nearest thing sits at the bottom right; what his hand holds sits at the bottom in the middle, with Set down beside it, and a
// short note over it when something cannot be done. The markers are small gold diamonds over the things he can use, with a name over
// the one nearest him.

const EX_UI={tap:null,touch:typeof matchMedia==='function'&&matchMedia('(pointer:coarse)').matches};
function exUiWrap(){return storyStageWrap();}
V11UI.init.push(()=>{const W=exUiWrap();if(!W)return;
  const g=stEl('div','ex-goal');g.id='exGoal';g.hidden=true;g.innerHTML='<span class="ex-where" id="exWhere"></span><span class="ex-what" id="exWhat"></span><span class="ex-hint" id="exHint" hidden></span>';W.appendChild(g);EX_UI.goal=g;
  const a=stEl('button','ex-act','');a.type='button';a.id='exAct';a.hidden=true;W.appendChild(a);EX_UI.act=a;
  a.addEventListener('click',()=>{const s=exNear();if(s)exUse(s.id);});
  const j=stEl('button','ex-jog','Jog');j.type='button';j.id='exJog';j.hidden=true;j.setAttribute('aria-pressed','false');W.appendChild(j);EX_UI.jog=j;
  j.addEventListener('click',()=>{if(!S.ex)return;S.ex.run=!S.ex.run;j.setAttribute('aria-pressed',String(S.ex.run));});
  // what his hand holds, and the button to set it down
  const h=stEl('div','ex-hand');h.id='exHand';h.hidden=true;h.innerHTML='<span class="ex-hand-k">Hand</span><span class="ex-hand-v" id="exHandV"></span>';
  const d=stEl('button','ex-drop','Set down');d.type='button';d.id='exDrop';h.appendChild(d);W.appendChild(h);EX_UI.hand=h;EX_UI.drop=d;
  d.addEventListener('click',()=>exSetDown());
  // the note: why something cannot be done
  const n=stEl('div','ex-note');n.id='exNote';n.hidden=true;W.appendChild(n);EX_UI.note=n;
  // a tap or a click on the picture
  cv.addEventListener('pointerdown',e=>{if(!exOn()||S.cut||busyExplore())return;const w=toWorld(e),s=exSpotAt(w);
    if(s){exUse(s.id);EX_UI.tap=null;return;}
    const fl=floorAt(w),now=performance.now(),T=EX_UI.tap,again=!!T&&now-T.at<420&&Math.hypot(fl.x-T.x,(fl.d-T.d)*.8)<40;
    exGo(fl.x,fl.d,{run:S.ex.run||again});EX_UI.tap={at:now,x:fl.x,d:fl.d};});
  // the keys
  const dir={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,1],ArrowDown:[0,-1],a:[-1,0],d:[1,0],w:[0,1],s:[0,-1],A:[-1,0],D:[1,0],W:[0,1],S:[0,-1]},held=new Set();
  const sync=()=>{if(!S.ex)return;let x=0,z=0;for(const k of held){const v=dir[k];if(v){x+=v[0];z+=v[1];}}S.ex.keys.x=Math.sign(x);S.ex.keys.z=Math.sign(z);};
  document.addEventListener('keydown',e=>{if(!exOn()||typingIn(e.target)||e.ctrlKey||e.metaKey||e.altKey)return;
    if(dir[e.key]){held.add(e.key);sync();e.preventDefault();return;}
    if(e.key==='Shift'){S.ex.keys.run=true;return;}
    if((e.key==='e'||e.key==='E'||e.key==='Enter'||e.key===' ')&&!S.cut&&!S.say){const s=exNear();if(s){exUse(s.id);e.preventDefault();}}
    if((e.key==='q'||e.key==='Q')&&!S.cut&&!S.say&&S.ex.hand){exSetDown();e.preventDefault();}});
  document.addEventListener('keyup',e=>{if(dir[e.key]){held.delete(e.key);sync();}if(e.key==='Shift'&&S.ex)S.ex.keys.run=false;});
  window.addEventListener('blur',()=>{held.clear();sync();if(S.ex)S.ex.keys.run=false;});});
// nothing to send him anywhere while a line is up or a scene runs
function busyExplore(){return!!S.say||!!S.cut;}
// the marker nearest a point of the picture, if the point is on one
function exSpotAt(w){if(!S.ex)return null;let best=null,bd=26;
  for(const s of S.ex.spots){if(!exShown(s)||!s.at)continue;const q=P(s.at.x,s.at.y,s.at.d),d=Math.hypot(q.x-w.x,q.y-w.y);if(d<bd){bd=d;best=s;}}return best;}
// the top line, the action, the jog button
V11UI.tick.push(()=>{const g=EX_UI.goal;if(!g)return;const on=exOn()&&!S.card,E=S.ex;
  if(g.hidden===on)g.hidden=!on;if(EX_UI.jog.hidden===on)EX_UI.jog.hidden=!on;
  if(!on){if(!EX_UI.act.hidden)EX_UI.act.hidden=true;if(!EX_UI.hand.hidden)EX_UI.hand.hidden=true;if(!EX_UI.note.hidden)EX_UI.note.hidden=true;return;}
  const where=S.arena&&S.arena.name||'',what=E.goal?(typeof E.goal.text==='function'?E.goal.text():E.goal.text):'';
  // (the hint under the goal: how he is walked, for a finger or for keys)
  {let h=E.goal&&E.goal.hint;if(typeof h==='function')h=h();if(h&&typeof h==='object')h=EX_UI.touch?h.touch:h.keys;h=h||'';const el=$('exHint');if(el.hidden===!!h)el.hidden=!h;if(h&&el.textContent!==h)el.textContent=h;}if($('exWhere').textContent!==where)$('exWhere').textContent=where;if($('exWhat').textContent!==what)$('exWhat').textContent=what;
  const s=!S.cut&&!S.say?exNear():null,lab=s?`${s.verb||'Use'}: ${s.label}`:'';EX_UI.act.hidden=!s;if(s&&EX_UI.act.textContent!==lab)EX_UI.act.textContent=lab;
  const jr=String(!!E.run);if(EX_UI.jog.getAttribute('aria-pressed')!==jr)EX_UI.jog.setAttribute('aria-pressed',jr);
  // the hand, and the note (it shows for two and a half seconds)
  const H=E.hand,hv=H?H.name:'';if(EX_UI.hand.hidden===!!H)EX_UI.hand.hidden=!H;if(H&&$('exHandV').textContent!==hv)$('exHandV').textContent=hv;
  EX_UI.drop.disabled=!!S.cut||!!S.say;
  const N=E.note,non=!!N&&S.t-N.t0<2.5;if(EX_UI.note.hidden===non)EX_UI.note.hidden=!non;if(non&&EX_UI.note.textContent!==N.text)EX_UI.note.textContent=N.text;});
// the markers, over the things he can use: a small gold diamond, brighter and named on the one nearest him
V11UI.world.push(()=>{const E=S.ex;if(!E||!E.on||S.cut||S.card)return;const near=exNear(),k=cam.viewW/(cv.width||1),t=S.t;
  ctx.save();ctx.textAlign='center';ctx.textBaseline='alphabetic';
  for(const s of E.spots){if(!exShown(s)||!s.at)continue;const q=P(s.at.x,s.at.y,s.at.d),n=s===near,r=(n?5:3.6)*Math.max(1,k*1.6),bob=Math.sin(t*2.4+s.at.x)*1.2,y=q.y-14+bob;
    ctx.globalAlpha=n?1:.75;ctx.fillStyle=n?'#fff0c6':'#e2b65a';ctx.strokeStyle='rgba(5,5,10,.8)';ctx.lineWidth=1.2*Math.max(1,k*1.6);
    ctx.beginPath();ctx.moveTo(q.x,y-r);ctx.lineTo(q.x+r*.75,y);ctx.lineTo(q.x,y+r);ctx.lineTo(q.x-r*.75,y);ctx.closePath();ctx.stroke();ctx.fill();
    if(n){ctx.font=`600 ${Math.round(11*Math.max(1,k*1.5))}px "Barlow Semi Condensed",Arial,sans-serif`;ctx.lineWidth=3*Math.max(1,k*1.5);ctx.strokeText(s.label,q.x,y-r-5);ctx.fillStyle='#f3ead2';ctx.fillText(s.label,q.x,y-r-5);}}
  // where he was sent: a ring on the floor
  if(E.to){const q=P(E.to.x,S.arena.ground(E.to.x,E.to.z),E.to.z);ctx.globalAlpha=.55+.25*Math.sin(t*6);ctx.strokeStyle='#e2b65a';ctx.lineWidth=1.2*Math.max(1,k*1.4);ctx.beginPath();ctx.ellipse(q.x,q.y,9,3.2,0,0,TAU);ctx.stroke();}
  ctx.restore();});
// ===== EXPLORE UI END =====
