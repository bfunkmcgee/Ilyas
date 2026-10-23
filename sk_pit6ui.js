// ===== ACT I, SCENE 6 UI =====
// (loaded ahead of the main UI script; everything here runs only once the UI is up)
// The toll on the page: the dock shows the gaps (the arc-blade's techniques listed but dark, in a group of their own; the Aether tab
// is already gone while he is drained), the clinch buttons one arm cannot use say why ("Needs two hands", "Arm pinned"), and the
// stair carries what he set down to fight: the good from his hand, and the rice across the steps when the sack splits.

// ---------- the buttons one arm cannot use ----------
{const ci=cmdInfo;cmdInfo=function(A,D,k){const why=oneArmLock(A,k);if(why)return{tq:why,h:'',ok:false,ft:0};return ci.apply(this,arguments);};}
// one arm shoves with the shoulder: the dock and the opening panel name it so
{const ci=cmdInfo;cmdInfo=function(A,D,k){const r=ci.apply(this,arguments);return A&&A.oneArm&&r&&r.tq==='Two-hand shove'?{...r,tq:'Shoulder shove'}:r;};}
{const os=openingSub;openingSub=function(o,k){const r=os.apply(this,arguments);return o&&o.f&&o.f.oneArm&&r==='Two-hand shove'?'Shoulder shove':r;};}
// (and the tip under the dock does not offer them)
{const fl=footingLine;footingLine=function(){const r=fl.apply(this,arguments),K=cmdHero();if(!K||!K.oneArm||!K.clinch||!K.clinch.behind)return r;
  return r.replace(/Twist free, throw .+? over your shoulder, or fight dirty\./,'With one arm there is no twisting free and no throw: the back of your head and a heel are what you have.');};}

// a man of the Pit who fights with his fists has not lost a weapon: his plate says Bare hands, not Disarmed
{const ut=updateTags;updateTags=function(){const r=ut.apply(this,arguments);
  for(const f of S.F){if(!f.pitCast||f.dead||!f.wp||!f.wp.unarmed||!f.scfg||f.scfg.weapon!=='fists')continue;const el=document.getElementById('tags'+f.idx);
    if(el&&el.innerHTML.includes('>Disarmed<'))el.innerHTML=el.innerHTML.replace(/<span class="tag" style="color:[^"]*">Disarmed<\/span>/,'<span class="tag" style="color:#ffd9a8">Bare hands</span>');}
  return r;};}

// ---------- the arc-blade, dark ----------
// The prologue's own techniques of the arc-blade, listed in the dock while he fights in the Pit: none of them can be pressed.
const A6_ARC=[{n:'Lash snare',w:'The segments unlock and reach'},{n:'Crescent cut',w:'The curve of the blade'},{n:'Moonwheel',w:'A whirling cut'},{n:'Silver dart',w:'A darting lunge'}];
const A6={};
HUD_TABS.push('arc');
{const hb=hudBuildDock;hudBuildDock=function(){
  const tabs=document.getElementById('cmdTabs');
  if(tabs&&!document.getElementById('tabArc')){const t=document.createElement('button');t.type='button';t.setAttribute('role','tab');t.dataset.tab='arc';t.id='tabArc';
    t.setAttribute('aria-selected','false');t.hidden=true;t.textContent='Arc-blade';tabs.appendChild(t);}
  const r=hb.apply(this,arguments);
  const box=document.getElementById('cmds');
  if(box&&!A6.sec){const s=document.createElement('section');s.className='cg cg-dark';s.dataset.g='arc';s.setAttribute('aria-label','Arc-blade, dark');s.hidden=true;
    s.innerHTML='<div class="cg-head"><span class="cg-t">Arc-blade</span><span class="cg-dark-n">Dark</span></div><div class="cg-grid">'+
      A6_ARC.map(a=>`<button type="button" class="cmd dark" disabled aria-disabled="true" title="${a.w}"><span>${a.n}</span><span class="ft"></span><span class="tq">Needs the gilt</span><small>${a.w}</small></button>`).join('')+'</div>';
    box.appendChild(s);A6.sec=s;A6.tab=document.getElementById('tabArc');}
  return r;};}
// shown in a fight of the Pit (he is drained), from the first turn to the last
V11UI.tick.push(()=>{if(!A6.sec)return;const g=S.game,K=S.F[0];
  const on=act1On()&&!!K&&!!K.drain&&!!S.story&&S.story.step==='fight'&&g&&['input','exchange'].includes(g.phase);
  if(A6.sec.hidden===on)A6.sec.hidden=!on;
  if(A6.tab&&A6.tab.hidden===on){A6.tab.hidden=!on;const tabs=document.getElementById('cmdTabs');
    if(tabs&&tabs.dataset){const v=String([...(tabs.children||[])].filter(b=>!b.hidden).length);if(tabs.dataset.n!==v)tabs.dataset.n=v;}}
  if(!on&&typeof HUD!=='undefined'&&HUD.tab==='arc')hudSetTab(HUD.userTab!=='arc'?HUD.userTab:'strike');});

// ---------- on the stair ----------
{const ei=envItems;envItems=function(items){ei(items);const A=S.act1;if(!A||!act1On()||S.arenaKey!=='stairs')return;
  if(A.tollDrop&&!A.tollDrop.gone)items.push({d:A.tollDrop.d,a6:'drop'});
  if(A.riceSpill)items.push({d:A.riceSpill.d+.5,a6:'spill'});};}
{const de=drawEnvItem;drawEnvItem=function(it){if(!it.a6)return de(it);ctx.save();try{A6_DRAW[it.a6](it);}catch(e){}ctx.restore();return true;};}
const A6_DRAW={
  // what he set down to fight, on the step where he stood: the rice sack (slumped and split once it spills), or the good he held
  drop(){const A=S.act1,D=A.tollDrop,q=P(D.x,GB-act1StairY(D.x),D.d),split=!!A.riceSpill;
    if(D.id==='rice'){ctx.fillStyle='#b8a47a';ctx.beginPath();
      if(split){ctx.moveTo(q.x-11,q.y);ctx.quadraticCurveTo(q.x-10,q.y-9,q.x-2,q.y-10);ctx.quadraticCurveTo(q.x+7,q.y-9,q.x+11,q.y);}
      else{ctx.moveTo(q.x-8,q.y);ctx.quadraticCurveTo(q.x-10,q.y-14,q.x-5,q.y-21);ctx.lineTo(q.x+5,q.y-21);ctx.quadraticCurveTo(q.x+10,q.y-13,q.x+8,q.y);}
      ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(60,45,25,.8)';ctx.lineWidth=.8;ctx.stroke();
      if(split){ctx.strokeStyle='#3a2c1a';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(q.x-4,q.y-8);ctx.lineTo(q.x+2,q.y-5);ctx.lineTo(q.x-1,q.y-2);ctx.stroke();}
      else{ctx.fillStyle='#8a7550';ctx.fillRect(q.x-3,q.y-23,6,3);}return;}
    const col=D.id==='oil'||D.id==='oilcheap'?'#3a3226':D.id==='linen'?'#d8d0bc':D.id==='valve'?'#5a5650':'#8a7a5a';
    ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(q.x,q.y-5,5,5.5,0,0,TAU);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.5)';ctx.lineWidth=.7;ctx.stroke();},
  // the rice: out of the split sack and down the steps, the grains catching what light is left
  spill(){const A=S.act1,R=A.riceSpill,u=clamp((S.t-R.t0)/1.4,0,1),r=mulberry32(4411);
    ctx.fillStyle='rgba(232,224,200,.85)';
    for(let i=0;i<170;i++){const a=r(),b=r(),c=r();const far=(.2+.8*a)*u,dx=-(8+70*far*far)*(b<.75?1:-.4)+(c-.5)*14,dz=(r()-.5)*26*u,x=R.x+dx,
        q=P(x,GB-act1StairY(x)-.6,R.d+dz);ctx.fillRect(q.x-.6,q.y-.5,1.3,1);}}};
// ===== ACT I, SCENE 6 UI END =====
