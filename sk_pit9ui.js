// ===== ACT I, SCENE 9 UI =====
// (loaded ahead of the main UI script; everything here runs only once the UI is up)
// Short Hand on the page: the lesson's box under the top bar (the morning and the move, the drill's count and how to do it, then the
// bout's touches), a gold flash when a rep counts, the styles screen (after the first lesson, and from its button between turns), and
// the yard's barrels and crates left to the painter (they are fixed props in these fights: `painted`, drawn by envx/env_yard.js).

// ---------- the yard's props are the painter's ----------
{const dp=drawProp;drawProp=function(Pp){if(Pp&&Pp.painted)return;return dp.apply(this,arguments);};}
{const ds=drawEnvShadows;drawEnvShadows=function(){const all=S.props;if(!all.some(p=>p.painted))return ds.apply(this,arguments);
  S.props=all.filter(p=>!p.painted);try{return ds.apply(this,arguments);}finally{S.props=all;}};}

// ---------- the lesson's box ----------
const A9={};
V11UI.init.push(()=>{const W=storyStageWrap();if(!W)return;
  const g=stEl('div','a9-goal');g.id='a9Goal';g.hidden=true;
  g.innerHTML='<span class="a9-k" id="a9K"></span><span class="a9-t" id="a9T"></span><span class="a9-n" id="a9N"></span><span class="a9-h" id="a9H"></span>';W.appendChild(g);A9.goal=g;
  const b=stEl('button','ex-side a9-sbtn','Styles');b.type='button';b.id='a9StylesBtn';b.hidden=true;W.appendChild(b);A9.btn=b;
  b.addEventListener('click',()=>{const A=S.act1;if(A&&a9CanOpen())A.styles={open:true,t0:S.t,first:false};});
  // the styles screen
  const s=stEl('div','a1-panel a9-styles');s.id='a9Styles';s.hidden=true;s.setAttribute('role','dialog');s.setAttribute('aria-label','Styles');
  s.innerHTML='<div class="a1-panel-in"><p class="st-kick" id="a9SK">Ilyas</p><h2 class="a1-panel-t">Styles</h2><p class="a9-lead" id="a9Lead"></p>'+
    '<div class="a9-cards" id="a9Cards"></div><div class="st-btns"><button type="button" class="st-btn st-go" id="a9Close">Back to the yard</button></div></div>';
  W.appendChild(s);A9.styles=s;document.getElementById('a9Close').addEventListener('click',()=>act1StylesClose());
  document.addEventListener('keydown',e=>{if(!A9.styles||A9.styles.hidden||typingIn(e.target))return;if(e.key==='Escape'||e.key==='Enter'){act1StylesClose();e.preventDefault();}});});
// the camera frames the fight below the box, as it does below the top bar
{const hm=hudMeasure;hudMeasure=function(){hm.apply(this,arguments);const g=A9.goal;if(!g||g.hidden||!g.getBoundingClientRect)return;
  const st=document.getElementById('stageWrap');if(!st||!st.getBoundingClientRect)return;const r=g.getBoundingClientRect(),R=st.getBoundingClientRect();
  if(r.height>0)HUD_IN.top=Math.max(HUD_IN.top,r.bottom-R.top+4);};}
// his turn, with nothing moving: the screen can come up
function a9CanOpen(){const g=S.game,L=typeof shLesson==='function'?shLesson():null;return!!L&&!!S.story&&S.story.step==='fight'&&g.phase==='input'&&!isAI(g.active)&&!S.opening&&!S.cut;}
function a9Fill(){document.getElementById('a9Lead').textContent='What he has, what he lost, and what comes back.';document.getElementById('a9Cards').innerHTML=a9CardsHtml();}
// the style cards: Short Hand with the moves he has learned, the Wire dark, Sareth's locked (the menu's Styles section shows them too)
function a9CardsHtml(){const K=S.F[0],known=K&&K.styleMoves||(typeof shKnown==='function'&&shKnown())||{},n=SHORT_MOVES.filter(m=>known[m.key]).length;
  const card=(st,cls,now,body)=>`<section class="a9-card ${cls}"><div class="a9-c-head"><h3>${st.name}</h3><span class="a9-now">${now}</span></div>`+
    `<p class="a9-w">${st.weapon}</p><p class="a9-o">${st.origin}</p>${body||''}</section>`;
  const moves='<ul class="a9-moves">'+SHORT_MOVES.map(m=>`<li class="${known[m.key]?'got':''}"><span class="a9-m">${m.name}</span><span class="a9-l">${known[m.key]?'learned':'Lesson '+m.lesson}</span></li>`).join('')+'</ul>';
  return card(STYLES.shorthand,'on',n>=SHORT_MOVES.length?'Novice, all lessons':'Novice, learning',moves)+
    card(STYLES.wire,'dark','Dark: needs the gilt')+
    card(STYLES.sareth,'locked','Locked: needs two hands');}
V11UI.tick.push(()=>{if(!A9.goal)return;const L=typeof shLesson==='function'?shLesson():null,R=L&&S.act1?S.act1.sh:null,A=S.act1;
  // the box: in the fight, not while a scene plays
  const on=!!R&&!!S.story&&S.story.step==='fight'&&!S.cut&&!S.card;if(A9.goal.hidden===on){A9.goal.hidden=!on;if(typeof HUD!=='undefined')HUD.measAt=0;}
  if(on){const drill=R.phase==='drill',k=drill?'Morning '+L.morning+' · '+L.name:L.key==='sh6'?'Morning '+L.morning+' · The bout':'Morning '+L.morning+' · The bout',
      // (the bout's count, each against what ends it: his touches, and hers, which end the morning too)
      t=drill?L.goal(R.n):(L.touches?'Three touches':'First touch'),
      nn=drill?'':`You ${R.his} of ${L.touches||SH_TOUCH.lesson} · Tamm ${R.hers} of ${L.touches?SH_TOUCH.hersLast:SH_TOUCH.hersLesson}`,
      // (her word on what to do, when a few of her turns have gone by with nothing counted; else the lesson's own hint at the start)
      coach=drill&&R.coach&&S.t-R.coach.t0<9?'Tamm: '+R.coach.text:'',
      hint=coach||(drill&&R.turns<4?(EX_UI&&EX_UI.touch?L.hint.touch:L.hint.keys):'');
    const set=(id,v)=>{const e=document.getElementById(id);if(e.textContent!==v)e.textContent=v;e.hidden=!v;};set('a9K',k);set('a9T',t);set('a9N',nn);set('a9H',hint);
    if(A9.coach!==!!coach){A9.coach=!!coach;A9.goal.classList.toggle('coach',!!coach);}
    const fl=R.flash&&S.t-R.flash.t0<.9||R.touch&&S.t-R.touch.t0<.9;if(A9.flash!==!!fl){A9.flash=!!fl;A9.goal.classList.toggle('flash',!!fl);}}
  // the button and the screen
  const can=a9CanOpen()&&L&&L.key!=='sh1';if(A9.btn.hidden===can)A9.btn.hidden=!can;
  const so=!!A&&!!A.styles&&A.styles.open;if(A9.styles.hidden===so){A9.styles.hidden=!so;if(so)a9Fill();}
  const W=document.getElementById('wrap');if(W&&W.classList&&!!A9.modal!==so){A9.modal=so;W.classList.toggle('a9-modal',so);}});
// (the screen pauses nothing in a fight: it opens only on his turn, and the turn waits for him)

// ---------- what the lesson asks for, marked ----------
// In a drill the answer Tamm is teaching is marked in the answer window (and in the toll's), and what she wants of him on his turn is
// marked in the dock: a gold edge and a small Lesson tag. The Hinge is what gets him inside her reach for the ladder and the check.
function a9Want(){const L=typeof shLesson==='function'?shLesson():null,R=L&&S.act1?S.act1.sh:null;
  if(!L||!R||R.phase!=='drill'||R.drillDone||!S.story||S.story.step!=='fight'||S.cut)return null;
  const K=S.F[0],T=shTamm(),o=S.opening;if(!K||!T)return null;
  if(o){if(o.f!==K)return null;if(o.source==='toll')return L.drill==='reach'?{win:'toll'}:null;if(o.source!=='react')return null;const k=o.attack;
    if(L.drill==='reach')return k==='thrust'?{win:'toll'}:null;
    return(k==='slash'||k==='overhead')&&L.drill!=='shove'?{win:'hinge'}:null;}
  const g=S.game;if(g.phase!=='input'||g.active!==0||isAI(0)||K.downed||K.clinch)return null;
  if(L.drill==='ladder')return{cmd:shortInside(K,T)?'thrust':'wait'};
  if(L.drill==='checkhook')return{cmd:!R.got.check?(moveName(K,T,'shove')==='Blind-side check'?'shove':'wait'):'sweep'};
  return{cmd:'wait'};}
// (the button marked is remembered, not searched for: the mark moves when the wanted button changes or is drawn anew)
V11UI.tick.push(()=>{const w=a9Want(),want=w?(w.win?document.querySelector(`#opBtns button[data-c="${w.win}"]`):document.getElementById('cmd-'+w.cmd)):null,was=A9.marked;
  if(was&&was!==want&&was.classList)was.classList.remove('sh-lesson');
  if(want&&want.classList&&!want.classList.contains('sh-lesson'))want.classList.add('sh-lesson');A9.marked=want||null;});
// ===== ACT I, SCENE 9 UI END =====
