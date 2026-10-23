// ===== ACT I, SCENE 8 UI =====
// (loaded ahead of the main UI script; everything here runs only once the UI is up)
// The yard at night on the page: the buttons for the old ways (Unroll, Glimmer step; keys U and G), the hilt in his hand as he flicks
// it, the nine plates out of it and into the dirt, and the two mugs of tea Tamm brings out. The buttons call the game's act1OldTry;
// the Glimmer step's failure shows as the Aether tab flickering out in the dock's place (the back room's flicker, S.act1.flicker).
const A8={};
V11UI.init.push(()=>{const W=storyStageWrap();if(!W)return;
  const u=stEl('button','ex-old','Unroll');u.type='button';u.id='a8Unroll';u.hidden=true;W.appendChild(u);
  const g=stEl('button','ex-old ex-old2','Glimmer step');g.type='button';g.id='a8Glimmer';g.hidden=true;W.appendChild(g);A8.u=u;A8.g=g;
  u.addEventListener('click',()=>act1OldTry('unroll'));g.addEventListener('click',()=>act1OldTry('glimmer'));
  document.addEventListener('keydown',e=>{if(!exOn()||!S.ex.old||typingIn(e.target)||e.ctrlKey||e.metaKey||e.altKey)return;
    if(e.key==='u'||e.key==='U'){act1OldTry('unroll');e.preventDefault();}else if(e.key==='g'||e.key==='G'){act1OldTry('glimmer');e.preventDefault();}});});
V11UI.tick.push(()=>{if(!A8.u)return;const on=exOn()&&!!S.ex.old&&!S.card;if(A8.u.hidden===on){A8.u.hidden=!on;A8.g.hidden=!on;}
  if(on){const busy=!!S.cut||!!S.say;if(A8.u.disabled!==busy){A8.u.disabled=busy;A8.g.disabled=busy;}}});
// the Glimmer step tried: the Aether tab in the dock's place, on and out
V11.step.push(()=>{const A=S.act1,N=A&&A.night8;if(N&&N.glimmer&&N.glimmer!==N.glimmerSeen){N.glimmerSeen=N.glimmer;A.flicker={t0:S.t};}});
// ---------- the things of the night ----------
{const ei=envItems;envItems=function(items){ei(items);const A=S.act1,N=A&&A.night8;if(!N||!act1On()||S.arenaKey!=='yard')return;
  for(const p of N.plates)if(!p.got)items.push({d:S.t<p.t0+.5&&N.from?N.from.d-.7:p.z,a8:'plate',p});
  if(A.hilt==='hand')items.push({d:hero().dep-.6,act1:'hilt'});
  if(N.mugs)items.push({d:N.mugs==='carry'?A.tamm.dep-.6:NIGHT_SEAT.mug.z,a8:'mugs'});};}
{const de=drawEnvItem;drawEnvItem=function(it){if(!it.a8)return de(it);ctx.save();try{A8_DRAW[it.a8](it);}catch(e){}ctx.restore();return true;};}
// a mug of tea: dark clay, a lighter lip, a handle, steam off it
function a8Mug(x,y,face){ctx.fillStyle='#3a2c22';ctx.fillRect(x-3,y-7,6,7);ctx.fillStyle='#5a4432';ctx.fillRect(x-3,y-7,6,1.3);
  ctx.strokeStyle='#3a2c22';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(x+face*3.6,y-3.6,2,-Math.PI/2,Math.PI/2,face<0);ctx.stroke();
  const t=(S.t*.5+x*.013)%1,yy=y-9-t*13;ctx.strokeStyle=`rgba(230,226,214,${(.22*(1-t)).toFixed(3)})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,yy);ctx.quadraticCurveTo(x+3,yy-3,x,yy-6);ctx.stroke();}
const A8_DRAW={
  // a plate of the arc-blade: out of the hilt in an arc and into the dirt, a hop, and still; dark, its edge catching the lantern
  plate(it){const p=it.p,N=S.act1.night8,F=N.from,u=clamp((S.t-p.t0)/.4,0,1);let x,y,d,a;
    if(F&&u<1){x=lerp(F.x,p.x,u);d=lerp(F.d,p.z,u);y=lerp(F.y,GB-1,u*u)-Math.sin(u*Math.PI)*12;a=p.a+(1-u)*7;}
    else{const h=clamp((S.t-p.t0-.4)/.22,0,1);x=p.x;d=p.z;y=GB-1-(h<1?Math.sin(h*Math.PI)*3:0);a=p.a;}
    const q=P(x,y,d);ctx.translate(q.x,q.y);ctx.rotate(a);ctx.scale(1.45,1.45);ctx.fillStyle='#1c2230';ctx.beginPath();ctx.moveTo(-4.4,-1.3);ctx.lineTo(4.2,-1.7);ctx.lineTo(4.6,1.2);ctx.lineTo(-4.4,1.5);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(150,170,210,.5)';ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(-4.4,-1.3);ctx.lineTo(4.2,-1.7);ctx.stroke();
    ctx.fillStyle='#6a5228';ctx.fillRect(-4.2,-.2,8.6,.45);
    // a glint off its edge as the lantern catches it
    const gl=.35+.3*Math.max(0,Math.sin(S.t*1.7+p.a*5));ctx.fillStyle=`rgba(226,214,180,${gl.toFixed(3)})`;ctx.fillRect(1.6,-1.75,1.6,.6);},
  // the two mugs: in Tamm's hands as she carries them out; then one in her lap and his on the step between them
  mugs(){const A=S.act1,N=A.night8,T=A.tamm;
    if(N.mugs==='carry'){for(const i of [HAF,HAB]){const h=T.p[i],q=P(h.x,h.y+3,T.dep);a8Mug(q.x,q.y+4,T.facing);}return;}
    const h=T.p[HAF],q=P(h.x,h.y+2,T.dep);a8Mug(q.x,q.y+4,T.facing);
    const m=NIGHT_SEAT.mug,q2=P(m.x,GB-ACT1_PLACES.yard.step.h,m.z);a8Mug(q2.x,q2.y,-1);}};
// ===== ACT I, SCENE 8 UI END =====
