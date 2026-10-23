// ===== ELVES: UI =====
// What the elves' speed and Kael's magic look and sound like: the afterimages, the motes, the rune circles, the bolts, the Gale, the
// Glimmer step and its streak (painted by ElvenFX, or plainly without it); the Magic row under the commands with its Aether pips and
// its keys (Q, W, E); the words for the spells in the preview strip, the opening panel and the log; and a short entry in the rules.

const EFX=()=>typeof ElvenFX!=='undefined'&&ElvenFX.ok&&!S.classicLook?ElvenFX:null;

// ---------- in the world ----------
// afterimages and bolts stand on the floor among everything else, by depth; the rest is light, laid over the scene
{const ei=envItems;envItems=function(items){ei(items);
  for(const g of S.afterimages||[])items.push({d:g.d+.02,elfGhost:g});
  for(const B of S.bolts||[])if(B.state==='fly'||B.state==='glance')items.push({d:B.dep-.01,elfBolt:B});};}
{const de=drawEnvItem;drawEnvItem=function(it){if(it.elfGhost){drawElfGhost(it.elfGhost);return true;}if(it.elfBolt){drawElfBolt(it.elfBolt);return true;}return de(it);};}
function drawElfGhost(g){const X=EFX();
  if(!X){drawGhost({pts:g.pts,d:g.d,color:g.tint,lw:g.body.limbW,tw:g.body.torsoW,hr:g.body.headR,age:g.age,life:g.life});return;}
  ctx.save();ctx.translate(g.d*PSX,-g.d*PSY);
  if(g.sx!=null&&Math.abs(g.sx)<.999){ctx.translate(g.px,0);ctx.scale(g.sx,1);ctx.translate(-g.px,0);}
  try{X.afterimage(ctx,g);}catch(e){}
  ctx.restore();}
function drawElfBolt(B){const X=EFX(),x=prjX(B.x,B.dep),y=prjY(B.y,B.dep),tr=B.trail,n=tr.length;
  const ang=n>=2?Math.atan2(tr[n-1].y-tr[n-2].y,tr[n-1].x-tr[n-2].x):Math.atan2(B.vy,B.vx);
  try{if(X)X.bolt(ctx,{x,y,ang,spin:B.spin,trail:tr.slice(0,-1)});
    else{ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='#ffe299';ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();
      tr.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();ctx.fillStyle='#fff8e6';ctx.beginPath();ctx.arc(x,y,3,0,TAU);ctx.fill();ctx.restore();}}catch(e){}}
function drawElfFx(){const X=EFX(),t=S.t;
  // the Gale
  for(const G of S.gales||[]){const u=(t-G.t0)/G.life;ctx.save();ctx.translate(G.d*PSX,-G.d*PSY);
    try{if(X)X.gale(ctx,{x:G.x,y:G.y,ground:G.ground,fa:G.fa,range:G.range,u,dz:G.dz});
      else{const r=G.range*eOut(u);ctx.globalAlpha=(1-u)*.7;ctx.strokeStyle='#fff2d6';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(G.x,G.y+20,r,60,0,G.fa>0?-.6:Math.PI-.6,G.fa>0?.6:Math.PI+.6);ctx.stroke();}}catch(e){}
    ctx.restore();}
  // the rune circles at the hand that casts
  for(const g of S.glyphs||[]){const f=g.f,q=f.p[g.hand],u=(t-g.t0)/g.dur;ctx.save();ctx.translate(f.dep*PSX,-f.dep*PSY);
    try{if(X)X.glyph(ctx,{x:q.x+f.facing*5,y:q.y-1},{u,r:13,fa:f.facing,tint:elfTint(f),rot:g.t0*3});
      else{ctx.globalAlpha=Math.max(0,1-u);ctx.strokeStyle='#ffe299';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(q.x+f.facing*5,q.y,4,12,0,0,TAU);ctx.stroke();}}catch(e){}
    ctx.restore();}
  // the Glimmer step: out where he was, in where he comes back
  // (one out past a wall of glass shows only through the glass: clip is in the picture's own frame)
  const clipTo=c=>{if(!c)return;ctx.beginPath();ctx.rect(c.x0,c.y0,c.x1-c.x0,c.y1-c.y0);ctx.clip();};
  for(const b of S.blinks||[]){const u=(t-b.t0)/b.dur;ctx.save();clipTo(b.clip);ctx.translate(b.d*PSX,-b.d*PSY);
    try{if(X)X.blink(ctx,{x:b.x,y:b.y,top:b.top,ground:b.ground,u,mode:b.mode,tint:'#e2b65a',fa:b.fa});}catch(e){}
    ctx.restore();}
  // the streak between the two
  for(const s of S.streaks||[]){const u=(t-s.t0)/s.life,a={x:prjX(s.a.x,s.d0),y:prjY(s.a.y,s.d0)},b={x:prjX(s.b.x,s.d1),y:prjY(s.b.y,s.d1)};ctx.save();clipTo(s.clip);
    try{if(X)X.streak(ctx,a,b,{w:s.w||12,alpha:1-u});else{ctx.globalAlpha=1-u;ctx.strokeStyle='#ffe299';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}}catch(e){}ctx.restore();}
  // where a bolt landed
  for(const B of S.bolts||[])if(B.burst){const E=B.burst,u=(t-E.t0)/.42;if(u>=1||u<0)continue;
    try{if(X)X.burst(ctx,{x:prjX(E.x,E.d),y:prjY(E.y,E.d),ang:E.ang,u,size:E.kind==='miss'?9:15,kind:E.kind});}catch(e){}}
  // the motes, each at its own depth
  const M=S.motes||[];if(M.length){
    try{if(X)X.motes(ctx,M.map(m=>({x:prjX(m.x,m.d),y:prjY(m.y,m.d),age:m.age,life:m.life,spin:m.spin,r:m.r,tint:m.tint})));
      else{ctx.save();ctx.globalCompositeOperation='lighter';for(const m of M){ctx.globalAlpha=Math.max(0,1-m.age/m.life)*.8;ctx.fillStyle=m.tint;ctx.fillRect(prjX(m.x,m.d)-1,prjY(m.y,m.d)-1,2,2);}ctx.restore();}}catch(e){}}}

// ---------- the Magic row ----------
const MG_KEYS={q:'bolt',w:'gale',e:'blink'};
function spellBlinkPct(K,D,info){const b=K.blinkBonus;K.blinkBonus=3+(info&&info.behind?2:0);try{return hitChanceT(K,D,'slash',false,pickTechnique(K,D,'slash'));}finally{K.blinkBonus=b;}}
function spellInfo(K,D,k){const s=SPELLS[k],c=actionCost(K,k,0),pct=x=>Math.round(x*100)+'%',cost=`${c} tempo`;
  if(K.wp&&K.wp.gun)return{tq:'Hands full',h:'',ok:false};
  if(K.mount&&(K.mountU<1||K.mount.ctl!=='rider'))return{tq:'Riding',h:'',ok:false};
  if(K.downed)return{tq:'You are down',h:'',ok:false};
  if(K.clinch)return{tq:'Locked in a clinch',h:'',ok:false};
  if(k==='gale'){const tg=galeTargets(K,D),n=tg.length,t0=tg[0];
    const tq=!n?'Nobody in front':n>1?`${n} in its path`:hazardBehind(K,t0)?`${t0.name}, into something`:t0.name;
    return{tq,h:n?`${pct(chanceOf(galeMods(K,t0)))} · ${cost}`:cost,ok:n>0};}
  if(!D)return{tq:'No target',h:cost,ok:false};
  if(D.walkIn&&notHereYet(D))return{tq:'Not here yet',h:'',ok:false};
  if(k==='bolt'){const dist=Math.round(Math.hypot(D.station-K.station,(D.lane-K.lane)*.6));return{tq:`At ${D.name} · ${dist}u`,h:`${pct(hitChanceT(K,D,'thrust',false,boltTech(K,D)))} · ${cost}`,ok:true};}
  const info=blinkInfo(K,D);if(!info)return{tq:K.mount?'No clear road past him':'No room at his back',h:cost,ok:false};
  return{tq:info.saddle?`Past ${D.name}`:info.behind?`Behind ${D.name}`:`Beside ${D.name}`,h:`${pct(spellBlinkPct(K,D,info))} · ${cost}`,ok:true};}
function spellRole(K,D,k){const dn=D?D.name:'him';
  if(k==='bolt')return`A blade of light off the hand at ${dn}: +1 and straight from where you stand, a thrown body on a hit. A block breaks it; a miss goes on past. No opening comes of it either way.`;
  if(k==='gale'){const n=galeTargets(K,D).length;return`A palm and a wall of wind out to ${GALE.range}u in front of you${n>1?`, ${n} of them in it`:''}: each rolls against it (balance and weight count). Thrown back into whatever is behind them; anyone caught squarely, off balance or slammed into something goes down. One who holds loses two pips of footing.`;}
  if(K.mount)return`Out like a lamp, bike and all, and back on the road past ${dn} with a Slash already moving: +3 out of nowhere, +2 from behind, and he has to turn in the saddle to answer you.`;
  return`Out like a lamp and back at ${dn}'s back with a Slash already moving: +3 out of nowhere, +2 from behind, and he has to turn to answer you.`;}
function buildMagic(){if($('magic'))return;const box=document.createElement('div');box.className='magic';box.id='magic';
  box.innerHTML=`<div class="mg-head"><span class="mg-lbl">Aether</span><span class="mg-pips" id="mgPips" aria-label="Aether"></span><span class="mg-note" id="mgNote"></span></div><div class="mg-row" id="mgRow"></div>`;
  $('cmds').insertAdjacentElement('afterend',box);
  for(const [key,k] of Object.entries(MG_KEYS)){const b=document.createElement('button');b.type='button';b.className='cmd mg';b.id='mg-'+k;b.dataset.k=k;
    b.innerHTML=`<span>${SPELLS[k].name}<b class="mg-cost" title="${SPELLS[k].cost} Aether">${'◆'.repeat(SPELLS[k].cost)}</b><kbd>${key.toUpperCase()}</kbd></span><span class="ft" id="mgf-${k}"></span><span class="tq" id="mgt-${k}"></span><small id="mgh-${k}"></small>`;
    b.addEventListener('click',()=>humanSpell(k));wirePreview(b,k);$('mgRow').appendChild(b);}}
function humanSpell(k){ensureAudio();const g=S.game;if(g.phase!=='input'||isAI(g.active)||S.opening)return;const A=S.F[g.active];if(A!==S.F[0]||!spellOK(A,targetOf(A),k))return;previewCmd=null;command(g.active,k);}
function updateMagic(){const box=$('magic');if(!box)return;const K=S.F[0],g=S.game;
  const show=!!K&&K.name===HERO_NAME&&!S.noMagic&&!drained(K)&&!K.dead&&g.phase!=='over';box.hidden=!show;if(!show)return;
  const human=g.phase==='input'&&!isAI(g.active)&&!S.opening&&S.F[g.active]===K,D=targetOf(K),a=K.aether||0;
  const spend=previewCmd&&SPELLS[previewCmd]?SPELLS[previewCmd].cost:0;
  let pips='';for(let i=0;i<MAGIC.max;i++)pips+=`<i class="${i<a?(i>=a-spend?'on spend':'on'):''}"></i>`;
  const pe=$('mgPips');if(pe.innerHTML!==pips)pe.innerHTML=pips;pe.title=`${a} of ${MAGIC.max} Aether: +${MAGIC.turn} each of your turns, +${MAGIC.kill} for each kill`;
  $('mgNote').textContent=`${a}/${MAGIC.max} · +1 a turn, +1 a kill`;
  for(const k of Object.keys(SPELLS)){const b=$('mg-'+k);if(!b)continue;const inf=spellInfo(K,D,k),short=a<SPELLS[k].cost;
    const ok=human&&inf.ok&&!short&&spellOK(K,D,k);b.disabled=!ok;
    $('mgt-'+k).textContent=short&&inf.ok?`Needs ${SPELLS[k].cost} Aether`:inf.tq;$('mgh-'+k).textContent=inf.h;
    const fd=ok?-SPELLS[k].foot:0,fe=$('mgf-'+k);fe.textContent=footGlyph(fd);fe.className='ft'+(fd<0?' cost':'');}}

// ---------- the opening panel: Glimmer step to the next of them ----------
{const os=openingSub;openingSub=function(o,k){if(k==='blink'){const i=blinkInfo(o.f,o.opp);return i?(i.saddle?`Past ${o.opp.name}`:i.behind?`To ${o.opp.name}'s back`:`Beside ${o.opp.name}`):'No room';}return os(o,k);};}
{const oh=openingHint;openingHint=function(o,k){if(k==='blink'){const i=blinkInfo(o.f,o.opp);return`${i?Math.round(spellBlinkPct(o.f,o.opp,i)*100)+'% · ':''}${openCost(o.f,k)} tempo · ${SPELLS.blink.cost} Aether`;}return oh(o,k);};}
{const of=openingFt0;openingFt0=function(o,k){if(k==='blink'){const d=footDelta(o.f,'slash',pickTechnique(o.f,o.opp,'slash'));return o.link?Math.max(0,d):d;}return of(o,k);};}
{const rt=roleText;roleText=function(A,D,k){if(SPELLS[k])return spellRole(A,D,k);return rt(A,D,k);};}
{const rx=reachText;reachText=function(A,D,k){if(SPELLS[k])return'';return rx(A,D,k);};}
{const pv=previewInfo;previewInfo=function(k){const g=S.game;
  if(SPELLS[k]&&!S.opening){if(g.phase!=='input'||isAI(g.active))return null;const A=S.F[g.active];if(A!==S.F[0])return null;const D=targetOf(A);
    return{A,D,act:k,label:SPELLS[k].name,ft:-SPELLS[k].foot,pv:{i:A.idx,now:false,cost:actionCost(A,k,0),delay:0}};}
  return pv(k);};}

// ---------- the rules ----------
function buildElfRules(){if($('elfRules'))return;const how=document.querySelector('.bench.how');if(!how)return;const d=document.createElement('div');d.className='win bench techs';d.id='elfRules';
  d.innerHTML=`<h2>Elven speed and magic</h2>
    <p class="tech-note">Ilyas and the elves of the families move faster than any man. Their moves play out quicker, they act a little more often (14% less tempo), a step takes them further, and a man's blow is harder to land on them (+1 DEF, +2 against a gun). At speed they leave afterimages and motes of light.</p>
    <dl class="tech-list">
      <dt>Dodges</dt><dd>An elf who dodges does it his own way: he leaps a low sweep or a tail, spins off a thrust, or goes up over the man who swung and lands at his back, where an opening finds that man facing the wrong way.</dd>
      <dt>Aether</dt><dd>Ilyas's magic. Five at most; he starts a fight with three and gets one back each turn and one for each kill. The Aether commands spend it (keys Q, W and E).</dd>
      <dt>Gilt bolt</dt><dd>2 Aether. A blade of light thrown from any distance: +1, and a hit throws the body. A block breaks it, a miss goes on past, and no opening comes of it either way. It cuts a goblin in half.</dd>
      <dt>Gale</dt><dd>3 Aether. A wall of wind out to ${GALE.range}u in front: everyone in it rolls against it and is thrown back into whatever is behind them, a table, a wall, a divider or each other. Anyone caught squarely, off balance or slammed into something goes down.</dd>
      <dt>Glimmer step</dt><dd>2 Aether. Ilyas goes out like a lamp and comes back at his target's back with a Slash already moving (+3, and +2 from behind). When a takedown leaves nobody in reach, the next link of the run can be a Glimmer step to whoever is.</dd>
      <dt>From the saddle</dt><dd>On a bike Ilyas casts with the hand off the bars. A Gale can blow a rider off his machine, and a Glimmer step takes the bike with him onto the road past his man.</dd>
    </dl>`;
  how.parentNode.insertBefore(d,how);}

// ---------- the words in the log, and the sounds ----------
V11UI.init.push(()=>{
  buildMagic();buildElfRules();
  {const df=drawFx;drawFx=function(){df();drawElfFx();};}
  {const uc=updateCommands;updateCommands=function(){uc();try{updateMagic();}catch(e){}};}
  {const uo=updateOrder;updateOrder=function(){uo();try{updateMagic();}catch(e){}};}
  document.addEventListener('keydown',e=>{if(typingIn(e.target)||e.ctrlKey||e.metaKey||e.altKey||S.opening)return;const k=MG_KEYS[e.key&&e.key.toLowerCase()];if(k){humanSpell(k);e.preventDefault();}});
  // a Gale in the log: the rolls, then each body as the wave reaches it
  const lg=S.hooks.log;S.hooks.log=e=>{if(e.type!=='spell')return lg(e);
    const li=newEntry(false),R=e.rolls||[];
    li.innerHTML=`<div class="lg-l">${who(e.A)}<span>Magic</span><span class="lg-tech">Gale</span><span class="out out-crit pending">${R.length?R.length+' in its path':'Nothing'}</span></div>
      <div class="lg-why">${e.ex.res.tech.why}</div>${R.map(q=>`<div class="lg-roll">${q.o.name}: d20 <b>${q.r.roll}</b> ${modsText(q.r.mods)} = <b>${q.r.total}</b> vs ${q.r.dc}${defNote(q.r.defMods)}${q.r.crush?' · crushing':''}</div>`).join('')}<div class="lg-perf">performing…</div>`;
    e.ex.li=li;pushEntry(li);};
  S.hooks.spellHit=(ex,i)=>{if(!ex||!ex.li)return;const o=ex.li.querySelector('.out');if(o)o.classList.remove('pending');const out=ex.galeOut;
    if(o&&out)o.textContent=out.down?`${out.down} down`:out.n?`${out.n} thrown`:'Held';
    const d=document.createElement('div');d.className='lg-perf';d.textContent=`${i.D.name}: ${i.label.toLowerCase()}${i.dmg?' · '+i.dmg+' damage':''}${i.sr&&!i.sr.ok?' · two pips of balance lost':i.D.downed&&!i.D.dead?' · down until his next turn':''}`;
    const p=ex.li.querySelector('.lg-perf');if(p&&p.textContent==='performing…')p.remove();ex.li.appendChild(d);};
  // how an elf got out of the way
  const pf=S.hooks.perf;S.hooks.perf=ex=>{pf(ex);if(!ex||!ex.li||!ex.evade||!ex.res||ex.res.out!=='dodge')return;const p=ex.li.querySelector('.lg-perf');if(!p)return;
    const n=ex.evade.D.name,t={vault:`${n} vaulted over him`,leap:`${n} leapt it`,spin:`${n} spun off the point`}[ex.evade.style];if(t)p.textContent+=' · '+t;};
  // the opening panel says why it is a Glimmer step
  const op=S.hooks.opening;S.hooks.opening=(o,choice)=>{op(o,choice);if(o&&openingChoices(o).includes('blink')){const el=$('opReason');
    if(el)el.textContent=`${o.prev?o.prev.name:'The target'} went down. ${o.opp.name} is out of reach: a Glimmer step puts ${o.f.name} at his back.`;}};
  const sd=S.hooks.sound;S.hooks.sound=(k,v)=>{
    if(k!=='bolt'&&k!=='gale'&&k!=='blink'&&k!=='vault'&&k!=='wow')return sd(k,v);
    if(!S.soundOn||!AC||AC.state!=='running')return;
    try{
      // a blade of light: a bright rising ring and a thin hiss
      if(k==='bolt'){tone(.22,'sine',1300,2700,.05);tone(.3,'triangle',660,1320,.025);nz(.24,'bandpass',4200,7000,5,.06);}
      // the wind: a broad rush and a low push under it
      else if(k==='gale'){nz(.7,'bandpass',260,1500,.7,.32);tone(.45,'sine',96,48,.09);setTimeout(()=>{try{nz(.5,'highpass',1800,600,.6,.08);}catch(e){}},120);}
      // out and back in: a falling note, then a rising one
      else if(k==='blink'){tone(.12,'sine',2400,520,.05);setTimeout(()=>{try{tone(.16,'triangle',480,2600,.045);nz(.12,'bandpass',3000,5000,4,.05);}catch(e){}},110);}
      // a body going up and over: a quick rush of air
      else if(k==='vault'){nz(.24,'bandpass',700,2400,1.2,.14*(v||1));}
      // a big moment: a low, soft chord
      else if(k==='wow'){tone(.7,'sine',196,196,.05);tone(.7,'sine',294,294,.035);tone(.5,'triangle',588,588,.015);}
    }catch(e){}};
});
// ===== ELVES: UI END =====
