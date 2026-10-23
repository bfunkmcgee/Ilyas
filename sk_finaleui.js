// ===== FINALE UI =====
// (loaded ahead of the main UI script; everything here runs only once the UI is up)
// The executive in the silhouette: no scarf, a collar and a tie, the edge of his jacket in his colour and silver hair. The choice panel
// for the last scene, its keys, the banner, the log entries, the arc-blade rolling back into its hilt, the camera and the desk's blood.
const EXEC_LOOK={shirt:'#e4e1d6',tie:'#a8935a',hair:'rgba(226,230,242,.6)'};
function drawExecSuit(f){
  const p=f.p,b=f.body,fa=f.facing,C=p[CHE],P=p[PEL],dx=C.x-P.x,dy=C.y-P.y,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,fx=-uy*fa,fy=ux*fa,w=b.torsoW,H=p[HEAD];
  const at=(a,s)=>({x:C.x+ux*a+fx*s,y:C.y+uy*a+fy*s});
  ctx.save();ctx.globalAlpha=f.dead?.5:1;ctx.lineCap='round';ctx.lineJoin='round';
  // collar and tie
  const t0=at(w*.62,w*.02),t1=at(w*.5,w*.56),ap=at(-w*.42,w*.3);
  ctx.fillStyle=EXEC_LOOK.shirt;ctx.beginPath();ctx.moveTo(t0.x,t0.y);ctx.lineTo(t1.x,t1.y);ctx.lineTo(ap.x,ap.y);ctx.closePath();ctx.fill();
  const k=at(w*.12,w*.3),e=at(-w*.95,w*.32);
  ctx.strokeStyle=EXEC_LOOK.tie;ctx.lineWidth=Math.max(2,w*.2);ctx.beginPath();ctx.moveTo(k.x,k.y);ctx.lineTo(e.x,e.y);ctx.stroke();
  // the edge of the jacket, a thin line in his colour from the collar down the chest
  const l0=at(w*.45,w*.58),l1=at(-w*.2,w*.62),l2=at(-w*1.5,w*.5);
  ctx.strokeStyle=f.color;ctx.globalAlpha*=.8;ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(l0.x,l0.y);ctx.lineTo(l1.x,l1.y);ctx.lineTo(l2.x,l2.y);ctx.stroke();
  // silver hair: a lighter edge round the top and back of the head
  if(!f.severed||f.dead){const a0=Math.atan2(H.y-C.y,H.x-C.x),r=b.headR*.97;ctx.globalAlpha=f.dead?.35:1;ctx.strokeStyle=EXEC_LOOK.hair;ctx.lineWidth=1.7;
    ctx.beginPath();ctx.arc(H.x,H.y,r,a0-Math.PI/2*1.15,a0+Math.PI/2*1.15);ctx.stroke();}
  ctx.restore();
}
// how the panel's text goes: waiting for the player, or Kael deciding
let finBtns=null;
function finalePanelState(){
  const F=S.finale,pn=$('finalePanel');if(!pn)return;
  const show=!!F&&F.step==='choice';if(pn.hidden===show)pn.hidden=!show;
  if(!show)return;
  const auto=!!S.auto,sub=$('finSub'),txt=auto?HERO_NAME+' is deciding…':'';if(sub.textContent!==txt)sub.textContent=txt;
  if(!finBtns)finBtns=[...pn.querySelectorAll('button')];
  for(const b of finBtns)if(b.disabled!==auto)b.disabled=auto;
}
let finHid=false;
function finaleRows(){
  const F=S.finale,on=!!F&&S.game.phase==='finale';
  if(on!==finHid){finHid=on;$('order').parentElement.hidden=on;$('targets').hidden=on;}
  if(!on)return;
  const fl=$('fieldLine'),want=`${S.arena.name} · ${EXEC.name} · ${F.step==='choice'?'on his knees':'the last scene'}`;if(fl.textContent!==want)fl.textContent=want;
  const tl=$('tempoLine');if(tl.textContent)tl.textContent='';
  const cp=$('cmdPreview');if(cp.innerHTML)cp.innerHTML='';
}
V11UI.init.push(()=>{
  // no scarf for him; the suit goes on over the silhouette
  const df=drawFighter;drawFighter=function(f){if(f.npc&&f.puppet){const s=f.scarf;f.scarf=[];try{df(f);}finally{f.scarf=s;}}else df(f);};
  const ds=drawSuit;drawSuit=function(f){ds(f);if(f.npc&&f.puppet)drawExecSuit(f);};
  // the arc-blade rolling back up into its hilt: the unrolling played backwards
  const as=arcState;arcState=function(f){const R=f.arcRoll;if(R){const u=(S.t-R.t0)/R.dur;return u>=1?{mode:'rolled'}:{mode:'unroll',p:clamp(1-u,0,1)};}return as(f);};
  // the blade rolling up again has its own sound: the unrolling one the other way round
  const snd=S.hooks.sound;S.hooks.sound=(k,v)=>{
    if(k!=='reroll'){snd(k,v);return;}
    if(!S.soundOn||!AC||AC.state!=='running')return;
    try{const m=clamp(v,.3,1.4);for(let i=0;i<11;i++){const t0=AC.currentTime+i*.05,o=AC.createOscillator(),g=AC.createGain();o.type='square';
      o.frequency.setValueAtTime(2600-i*110,t0);g.gain.setValueAtTime(.035*m,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+.028);o.connect(g);g.connect(master);o.start(t0);o.stop(t0+.04);}}catch(e){}};
  // the log
  const log=S.hooks.log;
  S.hooks.log=e=>{
    if(e.type==='finale'){const F=S.finale,K=hero(),X=F?F.X:null,B=S.F.find(f=>f.boss),gore=S.gore!=='off',li=newEntry(false);
      const rows={
        down:`<div class="lg-l">${who(B)}<span>is down</span><span class="out out-move">Last scene</span></div><div class="lg-perf">${HERO_NAME} goes for the executive.</div>`,
        begs:`<div class="lg-l">${who(X)}<span>begs for his life</span></div>`,
        spare:`<div class="lg-l">${who(K)}<span>spares</span>${who(X)}<span class="out out-guard">Spared</span></div>`,
        behead:`<div class="lg-l">${who(K)}<span>${gore?'beheads':'strikes down'}</span>${who(X)}<span class="out out-crit">${gore?'Beheaded':'Struck down'}</span></div>`};
      li.innerHTML=rows[e.kind]||'';if(!li.innerHTML)return;pushEntry(li);return;}
    log(e);};
  // the scene tells the page what it is doing
  S.hooks.finale=(kind,F)=>{
    if(kind==='begin'){$('banner').textContent=EXEC.name;$('banner').hidden=false;S.hooks.status();}
    else if(kind==='reset'){const pn=$('finalePanel');if(pn)pn.hidden=true;}
    else if(kind==='choice'){finalePanelState();const b=$('finalePanel').querySelector('button'),a=document.activeElement;
      // the first button takes the focus unless the player is working in some other control (the commands have just been switched off)
      if(!S.auto&&b&&(!a||a===document.body||(a.closest&&a.closest('.commands,.op-card,#finalePanel'))))b.focus({preventScroll:true});}
    else if(kind==='decide'||kind==='hands')finalePanelState();
    else if(kind==='chosen'||kind==='end')finalePanelState();
    if(kind==='step'&&F)finalePanelState();
  };
  for(const b of $('finalePanel').querySelectorAll('button'))b.addEventListener('click',()=>{if(!S.auto)finaleChoose(b.dataset.c);});
  // keys 1 and 2 while the panel is up (on window, so the page's own key handler stays as it is)
  window.addEventListener('keydown',e=>{const F=S.finale;if(!F||F.step!=='choice'||S.auto||e.ctrlKey||e.metaKey||e.altKey)return;
    if(typingIn(e.target))return;
    if(e.key==='1'){finaleChoose('spare');e.preventDefault();}else if(e.key==='2'){finaleChoose('behead');e.preventDefault();}});
  // the camera on a narrow page frames the two of them: he stays in, a far-off Amri and the fallen are left out once the scene moves on
  const uc=updateCamera;updateCamera=function(rdt){
    const F=S.finale;if(!F){uc(rdt);return;}
    const X=F.X,M=F.M,sv=[],set=(f,v)=>{if(f&&f.entering!==v){sv.push([f,f.entering]);f.entering=v;}};
    set(X,false);if(M&&Math.abs(M.p[PEL].x-F.K.p[PEL].x)>260)set(M,true);
    if(F.step!=='settle')for(const f of S.F)if(f.dead&&f!==X&&f!==M)set(f,true);
    try{uc(rdt);}finally{for(const [f,v] of sv)f.entering=v;}};
  // his lines are the story: on a narrow page they are drawn larger and kept inside the picture
  const dcl=drawCallouts;drawCallouts=function(){
    if(!S.callouts.some(c=>c.fin)){dcl();return;}
    const all=S.callouts;S.callouts=all.filter(c=>!c.fin);try{dcl();}finally{S.callouts=all;}
    for(const c of all)if(c.fin)drawFinLine(c);};
  // the desk's blood: a smear under his face, drawn on the top between the desk's back and the people at it
  const items0=envItems,draw0=drawEnvItem;
  envItems=items=>{items0(items);const F=S.finale;if(F&&F.smear&&F.D&&F.D.P)items.push({d:F.D.P.dep+F.D.P.dz*.9,smear:F});};
  drawEnvItem=it=>{if(it.smear){drawDeskSmear(it.smear);return true;}return draw0(it);};
  // the tempo line counts the fighters, not the man at the desk
  const uo=updateOrder;updateOrder=function(){uo.apply(this,arguments);const tl=$('tempoLine');
    if(tl.textContent.startsWith('Tempo per slash')&&S.F.some(f=>f.npc&&!f.dead))tl.textContent=`Tempo per slash: ${S.F.filter(f=>!f.dead&&!f.npc).map(f=>`${f.name} ${actionCost(f,'slash')}`).join(' · ')} (lower acts sooner)`;};
  // the page around the scene: nothing stale, the panel follows the scene
  V11UI.tick.push(()=>{finaleRows();finalePanelState();});
});
function drawFinLine(c){
  const f=S.F[c.i];if(!f)return;const u=c.age/c.life,h=f.p[HEAD],q=P(h.x+(c.dx||0),h.y-f.body.headR-34,f.dep),t=c.text.toUpperCase(),big=!!c.big;
  const a=u<.1?u/.1:u>.62?1-(u-.62)/.38:1,wpp=cam.viewW/Math.max(1,cssW),L=cam.x-cam.viewW/2,R=cam.x+cam.viewW/2,T=camTop()+HUD_IN.top*wpp;
  ctx.save();ctx.font=big?'800 22px "Alegreya SC",Georgia,serif':'800 16px "Alegreya SC",Georgia,serif';ctx.textAlign='center';ctx.lineJoin='round';
  const m=ctx.measureText(t),m0=(m&&m.width)||t.length*(big?12:9);
  const sc=Math.max(.5,Math.min(clamp(13*wpp/(big?22:16),1,1.8),(R-L-16)/m0)),w=m0*sc/2,x=clamp(q.x,L+8+w,R-8-w),y=Math.max(q.y-12*eOut(u)-(big?8:0)-(cssW<640?8*wpp:0),T+20*sc);
  const pop=sc*(1+(big?.6:.35)*(1-eOut(Math.min(1,u/.1)))),k=eOut(Math.min(1,u/.3));
  ctx.globalAlpha=clamp(a,0,1);ctx.translate(x,y);ctx.scale(pop,pop);
  ctx.lineWidth=big?6:5;ctx.strokeStyle='rgba(11,8,32,.9)';ctx.strokeText(t,0,0);ctx.fillStyle=big?'#ffd36b':'#fff3dc';ctx.fillText(t,0,0);
  ctx.strokeStyle=f.color;ctx.lineWidth=2.4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-m0/2*k,6);ctx.lineTo(m0/2*k,6);ctx.stroke();
  ctx.restore();
}
function drawDeskSmear(F){
  const s=F.smear,D=F.D,d=F.X?F.X.dep:116,q=P(s.x,D.top+.5,d),g=S.gore;if(g==='off'||!GORE_COL[g])return;
  s.a=Math.min(1,s.a+.08);ctx.save();ctx.globalAlpha=.8*s.a;ctx.fillStyle=GORE_COL[g].spat;
  ctx.beginPath();ctx.ellipse(q.x,q.y,s.r,s.r*.3,0,0,TAU);ctx.fill();
  ctx.beginPath();ctx.ellipse(q.x+s.r*.9,q.y+.5,s.r*.7,s.r*.2,0,0,TAU);ctx.fill();ctx.restore();
}
// ===== FINALE UI END =====
