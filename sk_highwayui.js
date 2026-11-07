// ===== THE TOWER ROAD ON THE PAGE (since V101) =====
// What the Tower Road (sk_highway.js) needs drawn besides the place itself (envx/env_highway.js): the ramp's bikes at their distance
// and heading, the truck (TruckLook, envx/veh_truck.js), the drums in the air and on the road and the one in the thrower's hands, and
// the door gun in the helicopter. Nothing here writes what the game reads (the drawfree suite).

// ---------- the ramp's bikes at their distance and heading ----------
// A bike on the ramp is drawn about the point where it meets the road: smaller for its distance (B.vk) and narrower as it heads at
// the camera, turned the other way as it heads east (B.vsx); its rider with it. Coming at the camera its lamp flares.
function hwyXf(B){if(!B||S.arenaKey!=='highway')return null;const k=B.vk??1,sx=B.vsx??1;return Math.abs(k-1)<.003&&Math.abs(sx-1)<.003?null:{k,sx};}
function hwyApply(px,py,X){ctx.translate(px,py);ctx.scale(X.k*X.sx,X.k);ctx.translate(-px,-py);}
{const dfi=drawFighterItem;drawFighterItem=function(f,tr){const B=f.mount,X=B&&hwyXf(B);if(!X)return dfi(f,tr);
  ctx.save();hwyApply(B.x,B.gy,X);try{return dfi(f,tr);}finally{ctx.restore();}};}
{const dv=drawVehicle;drawVehicle=function(B){if(B.hide)return;if(B.kind==='truck'){hwyTruck(B);return;}const X=hwyXf(B);if(!X){dv(B);return;}
  const px=prjX(B.x,B.dep),py=prjY(B.gy,B.dep);ctx.save();hwyApply(px,py,X);try{dv(B);}finally{ctx.restore();}hwyFlare(B,X,px,py);};}
{const ds=drawVehShadow;drawVehShadow=function(B){if(B.hide)return;
  if(B.kind==='truck'){if(typeof TruckLook!=='undefined'&&!S.classicLook){ctx.save();TruckLook.shadow(ctx,B);ctx.restore();}return;}
  const X=hwyXf(B);if(!X){ds(B);return;}if((B.air||0)>2)return;const px=prjX(B.x,B.dep),py=prjY(B.gy,B.dep);ctx.save();hwyApply(px,py,X);try{ds(B);}finally{ctx.restore();}};}
// the lamp coming at the camera: a flare on it, the narrower the bike is drawn the brighter, with the lens's streak across it
function hwyFlare(B,X,px,py){if(!(B.light>.05)||S.classicLook)return;const a=clamp(1-Math.abs(X.sx)*1.15,0,1);if(a<.04)return;
  const L=bikeAt(B,BIKE.lamp[0],BIKE.lamp[1]),x=px+(prjX(L.x,B.dep)-px)*X.k*X.sx,y=py+(prjY(L.y,B.dep)-py)*X.k,r=(30+46*a)*X.k;
  ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(255,248,232,${(.9*a).toFixed(3)})`);
  g.addColorStop(.16,`rgba(255,228,176,${(.42*a).toFixed(3)})`);g.addColorStop(1,'rgba(255,200,140,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r);
  const s=ctx.createLinearGradient(x-r*1.3,0,x+r*1.3,0);s.addColorStop(0,'rgba(255,236,206,0)');s.addColorStop(.5,`rgba(255,236,206,${(.3*a).toFixed(3)})`);s.addColorStop(1,'rgba(255,236,206,0)');
  ctx.fillStyle=s;ctx.fillRect(x-r*1.3,y-.7*X.k,r*2.6,1.4*X.k);ctx.restore();}

// ---------- the truck ----------
function hwyTruck(T){if(typeof TruckLook!=='undefined'&&!S.classicLook){const L=kaelLight({p:[{x:T.x-200,y:T.gy-90}],dep:T.dep,facing:T.fa,station:T.x-200});
    ctx.save();TruckLook.draw(ctx,T,{light:L.light,dir:L.dir,now:S.t,noShadow:true});ctx.restore();return;}
  // a plain truck for when its painter is not there: the cab, the bed, the wheels
  const d=T.dep,pt=(x,y)=>P(T.x+T.fa*x,T.gy-y,d);ctx.save();ctx.fillStyle=T.wreck?'#120e0c':'#1c2a24';
  const q=[pt(0,40),pt(266,40),pt(266,70),pt(0,70)];ctx.beginPath();q.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill();
  const c=[pt(272,40),pt(428,40),pt(428,120),pt(372,132),pt(360,186),pt(272,186)];ctx.beginPath();c.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill();
  ctx.strokeStyle='#e2b65a';ctx.lineWidth=1.5;ctx.stroke();for(const ax of [64,118,356]){const w=pt(ax,25);ctx.fillStyle='#07070a';ctx.beginPath();ctx.arc(w.x,w.y,25,0,TAU);ctx.fill();}ctx.restore();}

// ---------- the drums ----------
// a fuel drum seen side on at a point of the world and turned through ang: its body in oxide red shaded round, the two rolling hoops,
// the yellow band, its lit edge and its ends
function hwyDrumDraw(x,y,dep,ang){const q=P(x,y,dep),r=DRUM.r,h=DRUM.h;ctx.save();ctx.translate(q.x,q.y);ctx.rotate(ang);
  const g=ctx.createLinearGradient(0,-r,0,r);g.addColorStop(0,'#3a1008');g.addColorStop(.28,'#a8442a');g.addColorStop(.55,'#6e2216');g.addColorStop(1,'#1e0805');
  ctx.fillStyle=g;ctx.fillRect(-h/2,-r,h,r*2);
  ctx.fillStyle='rgba(0,0,0,.45)';for(const k of [-.2,.2])ctx.fillRect(h*k-.8,-r,1.6,r*2);
  ctx.fillStyle='rgba(200,150,44,.8)';ctx.fillRect(-2.3,-r,4.6,r*2);
  ctx.fillStyle='#1a0604';ctx.fillRect(-h/2-1.2,-r,2.4,r*2);ctx.fillRect(h/2-1.2,-r,2.4,r*2);
  ctx.fillStyle='rgba(255,217,168,.28)';ctx.fillRect(-h/2+2,-r*.55,h-4,1.2);
  ctx.strokeStyle='#070302';ctx.lineWidth=1.5;ctx.strokeRect(-h/2,-r,h,r*2);ctx.restore();}
{const ei=envItems;envItems=function(items){ei(items);if(S.arenaKey!=='highway')return;
  for(const o of S.drums||[])items.push({d:o.dep-.02,hwyDrum:o});
  for(const f of S.F)if(f.hold==='drum'&&!f.dead&&!f.hidden)items.push({d:f.dep-1,hwyHeld:f});
  for(const H of S.veh)if(H.kind==='heli'&&H.gunAng!=null&&(H.door||0)>.3)items.push({d:H.dep-HWY_GUN.dep,hwyGun:H});
  // the garage's parapet: in front of the riders still on its top deck, behind those in the air
  const X=envKey()==='highway'&&EnvLook.S.highway;if(X&&X.frontOn&&X.frontOn())items.push({d:GARAGE.dep-.4,hwyGarage:X});};}
{const de=drawEnvItem;drawEnvItem=function(it){if(it.hwyDrum){const o=it.hwyDrum;hwyDrumDraw(o.x,o.y,o.dep,o.ang);return true;}
  if(it.hwyHeld){const f=it.hwyHeld,a=f.p[HAF],b=f.p[HAB];hwyDrumDraw((a.x+b.x)/2,(a.y+b.y)/2-6,f.dep,Math.atan2(b.y-a.y,b.x-a.x));return true;}
  if(it.hwyGun){hwyDoorGun(it.hwyGun);return true;}if(it.hwyGarage){it.hwyGarage.front(ctx);return true;}return de(it);};}

// ---------- the door gun ----------
// A machine gun on a pintle in the helicopter's door: the post up from the sill, the cradle, the receiver with its feed and the belt
// out of the can hung on its side, the barrel in its cooling jacket and the flash hider; it turns on its pivot as the game lays it
// (H.gunAng: its heading in the picture) and kicks back at each round
function hwyDoorGun(H){const G0=hwyGun(H),d=G0.dep,pv=P(G0.piv.x,G0.piv.y,d),D=heliDoor(H),sill=P(D.x,D.y,d),a=H.gunAng,kick=(H.recoil||0)*4;
  ctx.save();
  // the pintle: up from the sill to the cradle
  ctx.strokeStyle='#0c0d11';ctx.lineWidth=3.4;ctx.beginPath();ctx.moveTo(sill.x+6,sill.y);ctx.lineTo(pv.x,pv.y+4);ctx.stroke();ctx.strokeStyle='rgba(200,204,212,.25)';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(sill.x+7,sill.y);ctx.lineTo(pv.x+1,pv.y+4);ctx.stroke();
  ctx.translate(pv.x,pv.y);ctx.rotate(a);ctx.translate(-kick,0);
  const dk='#0b0c10',md='#1d2029',hi='#4a5060';
  // the spade grips back toward him, the receiver, the sights
  ctx.strokeStyle=dk;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-22,0);ctx.lineTo(-34,0);ctx.moveTo(-31,-6);ctx.lineTo(-33,6);ctx.stroke();
  let g=ctx.createLinearGradient(0,-7,0,7);g.addColorStop(0,hi);g.addColorStop(.45,md);g.addColorStop(1,dk);ctx.fillStyle=g;ctx.fillRect(-24,-7,40,13);
  ctx.fillStyle='#030304';for(let x=-20;x<12;x+=4)ctx.fillRect(x,-2.5,2,5);ctx.fillStyle=dk;ctx.fillRect(-2,-11,2.4,4);
  // the can of belted rounds on its side, the belt running up into the feed, its brass
  ctx.fillStyle='#16180f';ctx.fillRect(-14,6,18,14);ctx.fillStyle='rgba(200,208,184,.2)';ctx.fillRect(-14,6,18,.8);
  ctx.fillStyle='#8a6a2e';for(let k=0;k<5;k++)ctx.fillRect(-12+k*3.4,4,1.8,3.4);
  // the barrel in its perforated jacket, the flash hider
  g=ctx.createLinearGradient(0,-4,0,4);g.addColorStop(0,dk);g.addColorStop(.4,hi);g.addColorStop(1,md);ctx.fillStyle=g;ctx.fillRect(16,-4,34,8);
  ctx.fillStyle='#030304';for(let x=19;x<48;x+=5)ctx.fillRect(x,-1.6,2.6,3.2);
  ctx.fillStyle=md;ctx.fillRect(50,-2.2,30,4.4);ctx.fillStyle=dk;ctx.fillRect(78,-3.6,12,7.2);ctx.fillStyle='#000';ctx.fillRect(84,-1.6,1.4,3.2);
  // the edge of the cabin's light along its top
  ctx.fillStyle='rgba(255,201,138,.35)';ctx.fillRect(-24,-7,40,.8);ctx.fillRect(16,-4,34,.7);
  ctx.restore();}
// ===== THE TOWER ROAD ON THE PAGE END =====
