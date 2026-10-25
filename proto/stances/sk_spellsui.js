// ===== SPELLS (test): UI =====
// The new spells on the page: their buttons in the Aether row (keys R, L, G) with what each reads and costs, Overdrive on a button
// the store cannot pay for, the Ward in the answer window, their lines in the log, the light they make (the flash, the thread, the
// lit blade, the disc on the forearm) and the setup's switch.
MG_KEYS.r='glare';MG_KEYS.l='line';MG_KEYS.g='edge';
const SP2_EDGE={bound:'+1, cuts through a guard',unbound:'the tip burns (+3)',close:'the hilt sears: dazes'};
// (the same, short enough for a phone's button)
const SP2_EDGE_S={bound:'+1, through guards',unbound:'Tip burns, +3',close:'Hilt sears, dazes'};
// ---------- the Aether row ----------
{const si=spellInfo;spellInfo=function(K,D,k){if(!SPELL_NEW.includes(k))return si.apply(this,arguments);
  const c=actionCost(K,k,0),pct=x=>Math.round(x*100)+'%',cost=c?`${c} tempo`:'free';
  if(K.wp&&K.wp.gun)return{tq:'Hands full',h:'',ok:false};
  if(K.downed)return{tq:'You are down',h:'',ok:false};
  if(K.clinch)return{tq:'Locked in a clinch',h:'',ok:false};
  if(k==='edge'){const s=edgeStance(K);return K.edge?{tq:'Lit',h:SP2_EDGE_S[s],ok:false}:{tq:SP2_EDGE_S[s],h:'free · this turn',ok:true};}
  if(!D||D.dead)return{tq:'No target',h:cost,ok:false};
  if(k==='glare'){if(D.glare)return{tq:`${D.name} is dazzled`,h:cost,ok:false};
    if(lashGap(K,D)>GLARE.reach||Math.abs(D.lane-K.lane)>GLARE.dz)return{tq:'Out of the light',h:`close in · ${cost}`,ok:false};
    if(facingAway(D,K))return{tq:'His back is to you',h:cost,ok:false};
    const it=D.intent,b=it&&it.tgt===K.idx&&ATTACKS.includes(it.cmd)?it.cmd:null;
    return{tq:b?`${ACTIONS[b].name} at ${signed(glareMod(b))}`:`Blows at ${signed(GLARE.blow)}`,h:`def ${signed(GLARE.def)} · ${cost}`,ok:true};}
  const g=lashGap(K,D),d=Math.round(Math.abs(D.station-K.station));
  if(g<LINE.min)return{tq:'Too close',h:cost,ok:false};
  if(d>LINE.max)return{tq:'Too far',h:`${d}u · ${cost}`,ok:false};
  return{tq:`${D.name} · ${d}u`,h:`${pct(chanceOf(lineMods(K,D)))} · ${cost}`,ok:true};};}
{const sr=spellRole;spellRole=function(K,D,k){if(!SPELL_NEW.includes(k))return sr.apply(this,arguments);const dn=D?D.name:'him';
  if(k==='glare')return`A flash of gilt in ${dn}'s eyes, only within your striking distance: till he has acted his blows are at ${GLARE.blow} (a Thrust at ${GLARE.thrust}) and his defence against you at ${GLARE.def}.`;
  if(k==='line')return`A thread of gilt to ${dn} and a yank: he lands where your stance strikes best (Bound at blade's length, Close in his chest, Unbound on the tip), two pips off balance. A man who holds comes half way.`;
  const s=edgeStance(K);return`Free, before you act: the gilt runs down the blade till your next turn. ${STANCES[s].name}: ${SP2_EDGE[s]}.`;};}
// Gilt edge is lit, not cast: his turn goes on
{const hs=humanSpell;humanSpell=function(k){if(k!=='edge')return hs.apply(this,arguments);ensureAudio();const g=S.game,K=S.F[0];
  if(g.phase!=='input'||isAI(g.active)||S.opening||S.F[g.active]!==K)return;if(lightEdge(K)){previewCmd=null;updateCommands();}};}
// the new buttons only while the new spells are on; Overdrive opens a button the store cannot pay for, at its price in health
{const um=updateMagic;updateMagic=function(){um.apply(this,arguments);const K=S.F[0],g=S.game,box=$('magic');if(!K||!box||box.hidden)return;
  const human=g.phase==='input'&&!isAI(g.active)&&!S.opening&&S.F[g.active]===K,D=targetOf(K);
  for(const k of Object.keys(SPELLS)){const b=$('mg-'+k);if(!b)continue;if(SPELL_NEW.includes(k))b.hidden=!SPELL2.on;if(b.hidden)continue;
    const n=aetherShort(K,k);if(!n||!SPELL2.on)continue;const inf=spellInfo(K,D,k),od=overdriveOK(K,k),ok=human&&inf.ok&&od&&spellOK(K,D,k);
    b.disabled=!ok;b.classList.toggle('od',ok);
    if(inf.ok){$('mgt-'+k).textContent=od?'Overdrive':`Needs ${SPELLS[k].cost} Aether`;$('mgh-'+k).textContent=od?`−${n*OVERDRIVE.hp} health · ${inf.tq}`:inf.h;}}
  const eb=$('mg-edge');if(eb)eb.classList.toggle('lit',!!K.edge);};}
// ---------- the Ward in the answer window ----------
REACT_SUB.ward='1 Aether';
{const rb=reactBonus;reactBonus=function(o,k){const b=rb.apply(this,arguments);if(k!=='ward')return b;
  return b+withReact(o.f,k,()=>computeMods(o.opp,o.f,o.attack,reactOpening(o),o.tech).defMods.filter(m=>m[0]==='the ward cracks').reduce((s,m)=>s+m[1],0));};}
{const rt=reactText;reactText=function(o,k){if(k!=='ward')return rt.apply(this,arguments);const A=o.opp,nm=ACTIONS[o.attack].name;
  return`${signed(reactBonus(o,k))} against his ${nm}: a disc of gilt on the forearm, for 1 Aether. Best against an Overhead (+5) or a Cut (+4), less a Thrust (+2), nothing against a Sweep${stanceHeavy(A)?`, and his ${stanceWord(A)} cracks it (${signed(WARD.heavy)})`:''}. The whip's weak guard does not touch it.`;};}
// ---------- the light ----------
// a lit blade: the gilt along the arc-blade's curve (or the chain, Unbound), pulsing
function sp2BladePts(f){const W=f._whip;
  if(W&&stanceOf(f)==='unbound'&&W.x&&W.x.length>2){const out=[];for(let i=0;i<W.x.length;i++)out.push(P(W.x[i],W.y[i],f.dep));return out;}
  const h=f.p[HAF],t=f.p[TIP],L=Math.hypot(t.x-h.x,t.y-h.y)||1,ux=(t.x-h.x)/L,uy=(t.y-h.y)/L,sd=f.facing,nx=-uy*sd,ny=ux*sd,len=f.wp.len,out=[];
  for(let i=0;i<=10;i++){const s=i/10,a=4.5+s*(len-4.5),b=5.2*4*s*(1-s);out.push(P(h.x+ux*a+nx*b,h.y+uy*a+ny*b,f.dep));}
  return out;}
function sp2Stroke(pts,w,col,a){if(pts.length<2)return;ctx.globalAlpha=a;ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i].x,pts[i].y);ctx.stroke();}
function sp2Star(x,y,r,a,rot){ctx.globalAlpha=a;ctx.beginPath();for(let i=0;i<8;i++){const ang=rot+i*Math.PI/4,rr=i%2?r*.28:r;ctx.lineTo(x+Math.cos(ang)*rr,y+Math.sin(ang)*rr);}ctx.closePath();ctx.fill();}
function drawSpell2Fx(){if(S.cut)return;const now=S.t;ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.globalCompositeOperation='lighter';
  try{
    // the lit blade
    const K=S.F[0];if(K&&K.edge&&!K.dead&&K.p&&K.p[TIP]){const pts=sp2BladePts(K),u=.5+.5*Math.sin(now*9);
      sp2Stroke(pts,6,'#e2b65a',.18+.1*u);sp2Stroke(pts,2.4,'#ffe299',.5+.2*u);sp2Stroke(pts,.9,'#fff6dc',.8);
      if(Math.random()<.25){const q=K.p[TIP];addMotes(q.x,q.y,K.dep,1,{spread:16,vy:-20,life:.35,r:.8,cyan:0});}}
    // the flash off the palm, and a dazzled man's eyes
    S.glares=(S.glares||[]).filter(g=>now-g.t0<g.life);
    for(const g of S.glares){const u=(now-g.t0)/g.life,h=g.A.p[HAB],e=g.D.p[HEAD],a=P(h.x,h.y,g.A.dep),b=P(e.x,e.y,g.D.dep),dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,w=10+18*u;
      ctx.globalAlpha=.55*(1-u);ctx.fillStyle='#ffe9b0';ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x+nx*w,b.y+ny*w);ctx.lineTo(b.x-nx*w,b.y-ny*w);ctx.closePath();ctx.fill();}
    for(const f of S.F){if(!f.glare||f.dead||!f.p)continue;const e=f.p[HEAD],c=P(e.x,e.y-2,f.dep);ctx.fillStyle='#ffe299';
      for(let i=0;i<3;i++){const ang=now*2.4+i*TAU/3;sp2Star(c.x+Math.cos(ang)*(f.body.headR+5),c.y+Math.sin(ang)*(f.body.headR+3)*.6,3.2,.75,now*3+i);}}
    // the thread: taut till the yank, then breaking up
    S.lines=(S.lines||[]).filter(l=>now-(l.ty??l.t0)<(l.ty!=null?.35:1.2));
    for(const l of S.lines){const h=l.A.p[HAB],c=l.D.p[CHE],a=P(h.x,h.y,l.A.dep),b=P(c.x,c.y,l.D.dep),after=l.ty!=null,u=after?(now-l.ty)/.35:Math.min(1,(now-l.t0)/.08);
      const pts=[];for(let i=0;i<=12;i++){const s=i/12,sag=after?Math.sin(s*Math.PI)*10*u:0;pts.push({x:lerp(a.x,b.x,s),y:lerp(a.y,b.y,s)+sag});}
      if(after){ctx.setLineDash([5,4+10*u]);}
      const k=after?1-u:u;sp2Stroke(pts,4.5,'#e2b65a',.22*k);sp2Stroke(pts,1.4,'#fff1c9',.9*k);ctx.setLineDash([]);
      if(!after){ctx.globalAlpha=.8;ctx.fillStyle='#fff1c9';ctx.beginPath();ctx.arc(b.x,b.y,2.6,0,TAU);ctx.fill();}}
    // the ward: a disc of gilt on the forearm, from the answer till the blow, flaring as it lands
    for(const f of S.F){if(!f.p||f.dead)continue;const held=f.react==='ward',hit=f.wardHitT!=null&&now-f.wardHitT<.35;if(!held&&!hit)continue;
      const h=f.p[HAB],c=P(h.x,h.y,f.dep),u=hit?(now-f.wardHitT)/.35:.5+.5*Math.sin(now*12),r=hit?11+8*u:10,a=hit?.9*(1-u):.55+.2*u;
      ctx.globalAlpha=a*.35;ctx.fillStyle='#e2b65a';ctx.beginPath();ctx.ellipse(c.x,c.y,r*.55,r,0,0,TAU);ctx.fill();
      ctx.globalAlpha=a;ctx.strokeStyle='#ffe299';ctx.lineWidth=1.6;ctx.stroke();ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(c.x,c.y,r*.32,r*.62,0,0,TAU);ctx.stroke();}
  }catch(e){if(S.debug)console.error(e);}
  ctx.restore();}
V11UI.world.push(drawSpell2Fx);
// ---------- the log ----------
V11UI.init.push(()=>{
  const lg=S.hooks.log;S.hooks.log=e=>{if(e.type!=='spell2')return lg(e);const li=newEntry(false),nm=SPELLS[e.spell].name,R=e.roll;
    li.innerHTML=`<div class="lg-l">${who(e.A)}<span>Magic</span><span class="lg-tech">${nm}</span><span class="out out-crit pending">${e.D?e.D.name:''}</span></div>
      <div class="lg-why">${e.ex.res.tech.why}</div>${R?`<div class="lg-roll">${e.D.name}: d20 <b>${R.roll}</b> ${modsText(R.mods)} = <b>${R.total}</b> vs ${R.dc}${defNote(R.defMods)}</div>`:''}<div class="lg-perf">performing…</div>`;
    e.ex.li=li;pushEntry(li);};
  S.hooks.spell2=(ex,i)=>{if(!ex||!ex.li)return;const o=ex.li.querySelector('.out');if(o){o.classList.remove('pending');o.textContent=i.label;}
    const p=ex.li.querySelector('.lg-perf');if(p)p.textContent=`${i.D.name}: ${i.label}${i.moved?` · ${i.moved}u`:''}`;};
  // the stance test's setup: the new spells on or off
  {const sh=stnSetupHtml;stnSetupHtml=function(){let h=sh.apply(this,arguments);const opt=(v,label)=>`<button type="button" class="st-o" data-g="spells" data-v="${v}" aria-pressed="${String(SPELL2.on?1:0)===String(v)}">${label}</button>`;
    h=h.replace('<p class="ss-how"><b>Falls.</b>',`<p class="ss-how"><b>Spells.</b> Four new ones beside the Gilt bolt, Gale and Glimmer step. Gilt ward (1 Aether) is an answer in the window: +5 against an Overhead, +4 a Cut, +2 a Thrust, and an axe cracks it. Glare (1) dazzles a man in your face: his blows at −3, a Thrust −4. Gilt line (2) yanks a man who holds off to where your stance strikes best. Gilt edge (1, free) lights the blade till your next turn: Bound +1 and through a guard, Unbound's tip burns, Close's hilt sears. Short of Aether by one or two, a spell burns 8 health a point (Overdrive).</p><p class="ss-how"><b>Falls.</b>`);
    return h.replace('<div class="ss-g"><span>Falls</span>',`<div class="ss-g"><span>Spells</span>${opt(1,'New ones too')}${opt(0,'Today’s three')}</div><div class="ss-g"><span>Falls</span>`);};}
  {const sp=stnSetupPick;stnSetupPick=function(g,v){if(g!=='spells')return sp.apply(this,arguments);SPELL2.on=v==='1';const K=hero();if(!SPELL2.on&&K)K.edge=null;
    STNUI.el.setup.innerHTML=stnSetupHtml();updateStatus();stnUiNow();updateCommands();};}
});
// ===== SPELLS (test): UI END =====
