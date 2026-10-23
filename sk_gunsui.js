// ===== GUNS UI =====
// (loaded ahead of the main UI script; everything here runs only once the UI is up)
// Guns on the page: the gun in a fighter's hands and lying in the street, the flash, the round's streak, what it hits, the brass,
// the sound; the command panel's numbers for a shot and the log's line for it. GunLook and FxLook (the painters) draw when they are
// there; plain shapes stand in when they are not.

// ---------- the gun in his hands ----------
function gunPaint(key,h,t,fa,o){
  if(typeof GunLook!=='undefined'&&GunLook.draw&&!S.classicLook){ctx.save();const r=GunLook.draw(ctx,key,h,t,fa,o);ctx.restore();if(r!==false)return;}
  // Kael's rifle is the one from his bike's scabbard
  if(key==='rifle'&&typeof VehLook!=='undefined'&&VehLook.rifle&&!S.classicLook){ctx.save();VehLook.rifle(ctx,h,t,{fa,now:o.now,flash:o.recoil});ctx.restore();return;}
  // plain: a dark gun along the hand-to-muzzle line, with its stock behind the hand
  const wp=WEAPONS[key],L=Math.hypot(t.x-h.x,t.y-h.y)||1,ux=(t.x-h.x)/L,uy=(t.y-h.y)/L,nx=-uy*fa,ny=ux*fa,b={x:h.x-ux*wp.butt,y:h.y-uy*wp.butt};
  ctx.save();ctx.lineCap='round';ctx.strokeStyle='#0b0b0f';ctx.lineWidth=key==='pistol'?3.4:4.2;ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(t.x,t.y);ctx.stroke();
  ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(h.x-ux*2,h.y-uy*2);ctx.lineTo(h.x-ux*2+nx*7,h.y-uy*2+ny*7);ctx.stroke();
  ctx.strokeStyle=key==='rifle'?'#e2b65a':'#5b6170';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(lerp(h.x,t.x,.1),lerp(h.y,t.y,.1));ctx.lineTo(lerp(h.x,t.x,.92),lerp(h.y,t.y,.92));ctx.stroke();
  if(key==='rifle'){ctx.fillStyle='#7ff3e3';ctx.beginPath();ctx.arc(lerp(h.x,t.x,.3)-nx*3.4,lerp(h.y,t.y,.3)-ny*3.4,1.4,0,TAU);ctx.fill();}
  ctx.restore();}
{const dw=drawWeapon;drawWeapon=function(f){if(!isGun(f))return dw(f);const L=kaelLight(f),t=f.p[TIP];
  gunPaint(f.weaponKey,f.p[HAF],t,f.facing,{light:L.light,dir:L.dir,now:S.t,recoil:clamp(1-(S.t-(f.lastShot||-9))/.12,0,1),charge:f.charge||0});};}
// a gun lying in the street
{const di=drawItem;drawItem=function(it){const wp=WEAPONS[it.key];if(!wp||wp.fam!=='gun')return di(it);
  const a=P(it.a.x,it.a.y,it.dep),b=P(it.b.x,it.b.y,it.dep),L=Math.hypot(b.x-a.x,b.y-a.y)||1,h={x:a.x+(b.x-a.x)/L*wp.butt,y:a.y+(b.y-a.y)/L*wp.butt};
  gunPaint(it.key,h,b,1,{light:{x:.2,y:-1},dir:{x:.2,y:-1},now:S.t,lying:true});};}

// ---------- flash, streak, hit, brass ----------
function drawGunFx(){const now=S.t,o={now};
  const fx=typeof FxLook!=='undefined'&&!S.classicLook?FxLook:null;
  for(const t of S.tracers){if(fx&&fx.tracer){fx.tracer(ctx,t,o);continue;}
    const u=(now-t.t0)/(t.dur||.05);if(u<0||u>1.6)continue;const a=P(t.a.x,t.a.y,t.dep),b=P(t.b.x,t.b.y,t.dep1??t.dep),h=clamp(u,0,1),tl=clamp(u-.35,0,1);
    const x0=lerp(a.x,b.x,tl),y0=lerp(a.y,b.y,tl),x1=lerp(a.x,b.x,h),y1=lerp(a.y,b.y,h);
    ctx.save();ctx.lineCap='round';ctx.strokeStyle=t.kind==='rifle'?'rgba(127,243,227,.9)':'rgba(255,226,170,.85)';ctx.lineWidth=t.kind==='rifle'?2:1.3;
    ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();ctx.restore();}
  for(const m of S.muzzles){if(fx&&fx.muzzle){fx.muzzle(ctx,m,o);continue;}
    const u=(now-m.t0)/.07;if(u<0||u>1)continue;const q=P(m.x,m.y,m.dep),r=(m.kind==='rifle'?16:m.kind==='pistol'?9:11)*(1-u*.5);
    ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(q.x,q.y,0,q.x,q.y,r);g.addColorStop(0,'rgba(255,248,220,.95)');g.addColorStop(.4,m.kind==='rifle'?'rgba(127,243,227,.7)':'rgba(255,190,90,.7)');g.addColorStop(1,'rgba(255,140,60,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(q.x+Math.cos(m.ang)*r*.5,q.y+Math.sin(m.ang)*r*.5,r*1.2,r*.55,m.ang,0,TAU);ctx.fill();ctx.restore();}
  for(const i of S.impacts){if(fx&&fx.impact){fx.impact(ctx,i,o);continue;}
    const u=(now-i.t0)/.4;if(u<0||u>1)continue;const q=P(i.x,i.y,i.dep);ctx.save();ctx.globalAlpha=1-u;
    ctx.fillStyle=i.kind==='flesh'?'rgba(150,20,24,.8)':'rgba(170,160,150,.7)';ctx.beginPath();ctx.arc(q.x,q.y,3+u*9,0,TAU);ctx.fill();ctx.restore();}
  for(const c of S.casings){const u=now-c.t0;if(u<0)continue;
    // brass falls, bounces once and lies there
    let y=c.y+c.vy*u+.5*900*u*u,x=c.x+c.vx*Math.min(u,1.2),g=S.arena.ground(x,c.dep)-1.2;if(y>g){y=g;}
    if(fx&&fx.casing){fx.casing(ctx,{...c,x,y,ang:c.ang+c.spin*Math.min(u,.5)},o);continue;}
    const q=P(x,y,c.dep);ctx.save();ctx.translate(q.x,q.y);ctx.rotate(c.ang+c.spin*Math.min(u,.5));ctx.fillStyle='#d8a64e';ctx.fillRect(-1.6,-.7,3.2,1.4);ctx.restore();}}
{const df=drawFx;drawFx=function(){df();drawGunFx();};}

// ---------- the sounds ----------
// (the main UI sets its own hooks for sound, the log and the panels as it loads: these wrap them once it is up)
V11UI.init.push(()=>{
{const sd=S.hooks.sound;S.hooks.sound=(k,v)=>{
  if(k!=='shot'&&k!=='click'){sd(k,v);return;}
  if(!S.soundOn||!AC||AC.state!=='running')return;
  try{if(k==='click'){tone(.04,'square',1800,900,.06);return;}
    if(v==='mg'){nz(.16,'highpass',900,300,.6,.42);nz(.3,'lowpass',700,90,.8,.45);tone(.09,'square',120,50,.12);return;}
    const R=v==='rifle',Pi=v==='pistol';
    // the crack, the body of the report, and the street giving it back
    nz(R?.32:.2,'highpass',R?1600:2200,500,.7,R?.5:.36);nz(R?.5:.3,'lowpass',R?900:1300,120,.8,R?.5:.32);tone(R?.18:.1,'triangle',R?140:190,R?40:70,R?.32:.2);
    if(R)tone(.25,'sine',880,1760,.05);}catch(e){}};}
});

// ---------- the command panel and the log ----------
// with a gun in hand the guard is cover and the counter stance is steadying the aim
{const cn=cmdName;cmdName=function(A,act){if(GUN_KINDS.includes(act))return shotName(A,act);
  if(isGun(A)&&!A.downed&&!A.clinch){if(act==='guard')return'Take cover';if(act==='wait')return'Steady';}return cn(A,act);};}
{const ci=cmdInfo0;cmdInfo0=function(A,D,k){
  if(isGun(A)&&!A.downed&&!A.clinch&&(k==='guard'||k==='wait')){const c=actionCost(A,k);
    return k==='guard'?{tq:A.guarding?'Stay down':'Get behind something',h:`+4 DEF vs shots · ${c} tempo`,ok:true}:{tq:'Breathe, settle the aim',h:`${c} tempo`,ok:true};}
  if(!GUN_KINDS.includes(k))return ci(A,D,k);const c=actionCost(A,k);
  if(!D)return{tq:'No target',h:`${c} tempo`,ok:false};
  const pc=Math.round(shotChance(A,D,k)*100),n=shotCount(A,k),[dn,ds,db]=A.wp.dice,m=SHOT[k].mult,lo=Math.round((dn+db)*m),hi=Math.round((dn*ds+db)*m);
  const dist=Math.round(Math.hypot(D.station-A.station,(D.lane-A.lane)*.6));
  return{tq:`${n>1?n+' × ':''}${lo}–${hi} dmg${D.guarding?' · in cover':''}`,h:`${pc}% · ${dist}u · ${c} tempo`,ok:cmdValid(A,D,k),mark:k==='aimed'&&D.guarding?'answer':null};};}
{const rt=roleText;roleText=function(A,D,k){if(!GUN_KINDS.includes(k))return rt(A,D,k);const n=shotCount(A,k);
  return`${SHOT[k].why}${n>1?` ${n} rounds, each rolled on its own.`:''} ${D&&D.guarding?`${D.name} is in cover: +4 DEF.`:''}`.trim();};}
const SHOT_OUT={hit:'Hit',crit:'Critical',miss:'Miss',jam:'Jammed'};
V11UI.init.push(()=>{
{const lg=S.hooks.log;S.hooks.log=e=>{if(e.type!=='shot')return lg(e);
  const li=newEntry(false),r=e.res,wd=e.A.wp.dice;
  const rows=e.shots.map((s,i)=>`<div class="lg-roll">${e.shots.length>1?`round ${i+1}: `:''}d20 <b>${s.roll}</b> ${modsText(s.mods)} = <b>${s.total}</b> vs DEF ${s.def}${defNote(s.defMods)}${s.dmg?` · dmg ${s.dice.length}d${wd[1]} [${s.dice.join(',')}]+${wd[2]}${s.mult!==1?' ×'+s.mult:''}${s.out==='crit'?' ×2':''} = ${s.dmg}${s.zone?' · '+s.zone:''}`:''}</div>`).join('');
  const tot=e.shots.reduce((a,s)=>a+s.dmg,0),best=e.shots.some(s=>s.out==='crit')?'crit':e.shots.some(s=>s.out==='hit')?'hit':e.shots.some(s=>s.out==='jam')?'fumble':'dodge';
  li.innerHTML=`<div class="lg-l">${who(e.A)}<span>${shotName(e.A,r.kind)}</span><span class="lg-tech">${e.A.wp.name}</span><span>at</span>${who(e.D)}<span class="out out-${best} pending">${e.shots.length>1?e.shots.map(s=>SHOT_OUT[s.out]).join(', '):SHOT_OUT[r.out]}${tot?' '+tot:''}</span></div>
    <div class="lg-why">${SHOT[r.kind].why}</div>${rows}<div class="lg-perf">firing…</div>`;
  e.ex.li=li;pushEntry(li);};}
{const pf=S.hooks.perf;S.hooks.perf=ex=>{if(!ex||!ex.shots)return pf(ex);if(!ex.li)return;const o=ex.li.querySelector('.out');if(o)o.classList.remove('pending');
  const D=ex.D,k=ex.shots.reduce((a,s)=>a+(s.knock||0),0);
  ex.li.querySelector('.lg-perf').textContent=`${footNote(ex)}${D.dead?` · ${D.finName||'down for good'}`:D.downed?' · knocked down':k?` · knocked back ${Math.round(k)}u`:''}`;};}
});
// ===== GUNS UI END =====
