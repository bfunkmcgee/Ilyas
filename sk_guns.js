// ===== GUNS START =====
// Gunplay, from the prologue's roadblock on. A gun is fired from where the shooter stands: no closing in, no reach to beat. The
// gun is raised and laid on the target's chest, fired (one round, an aimed round, or two quick ones), and the round lands at once:
// in him on a hit, past him into the street on a miss. A hit pushes the body along the round's line, wounds where it goes in, and
// can put a man down; there are no ripostes and no follow-ups off a shot. Cover is the guard: a man crouched behind what he can
// find is harder to hit. Everything in the melee game still works for whoever holds a blade.

// ---------- the guns ----------
// len is the grip to the muzzle (the weapon's tip), butt the grip back to the end of the stock, off where the other hand holds it
// (forward of the grip; null when the off hand is free). gun: its own accuracy, the range it keeps it to, how fast its round goes.
Object.assign(WEAPONS,{
  rifle:{key:'rifle',name:'Veskar VS-8 Scour',short:'Scour',len:56,butt:26,mass:2.4,off:30,dice:[2,8,14],acc:0,tempo:1,fam:'gun',gun:{kind:'rifle',acc:3,range:1400,speed:5600}},
  pistol:{key:'pistol',name:'Hallowell Guardian Nine',short:'Guardian Nine',len:14,butt:2,mass:.9,off:null,dice:[2,6,4],acc:0,tempo:.9,fam:'gun',gun:{kind:'pistol',acc:0,range:520,speed:3600}},
  smg:{key:'smg',name:'Hallowell Skyline PDX',short:'Skyline PDX',len:25,butt:17,mass:1.7,off:16,dice:[2,6,5],acc:0,tempo:1,fam:'gun',gun:{kind:'smg',acc:-1,range:440,speed:3400,burst:3}},
  // the man in white's: one charged round, and nobody gets up from it
  hexpistol:{key:'hexpistol',name:'Maben Register pistol',short:'Register',len:27,butt:6,mass:1.2,off:null,dice:[10,10,60],acc:4,tempo:1,fam:'gun',gun:{kind:'hex',acc:6,range:2000,speed:1600}}});
// at the ready: the muzzle low and forward, both hands on a long gun, the support hand by a pistol
Object.assign(GUARD,{
  rifle:{hx:.3,hy:.3,w:.5,gw:.25,off:null,crouch:.9,lean:.05,sf:.28,sb:-.3},
  pistol:{hx:.34,hy:.34,w:.8,gw:.2,off:[.24,.36],crouch:.9,lean:.05,sf:.26,sb:-.3},
  smg:{hx:.3,hy:.3,w:.45,gw:.25,off:null,crouch:.9,lean:.05,sf:.26,sb:-.3},
  hexpistol:{hx:.36,hy:.3,w:.9,gw:.2,off:[.2,.4],crouch:.92,lean:.03,sf:.24,sb:-.28}});
function isGun(f){return!!(f&&f.wp&&f.wp.fam==='gun');}
// a fight with a gun in it, for this fighter: his own, or one on the other side
function gunFight(A){return isGun(A)||S.F.some(f=>f.team!==A.team&&!f.dead&&!f.npc&&isGun(f));}

// ---------- the shots ----------
// aim: how long the gun takes to come up and settle before the round goes; n rounds, gap seconds apart (a burst for a gun that has one)
const SHOT={
  shoot:{name:'Shoot',acc:0,mult:1,cost:80,aim:.24,why:'Up and fire: the quick shot.'},
  aimed:{name:'Aimed shot',acc:3,mult:1.35,cost:120,aim:.58,why:'Laid on the chest and squeezed off: slower, surer, harder.'},
  double:{name:'Double tap',acc:-2,mult:.9,cost:100,aim:.24,n:2,gap:.15,why:'Two rounds as fast as the trigger goes, each a little wilder.'}};
const GUN_KINDS=Object.keys(SHOT);
for(const k of GUN_KINDS)ACTIONS[k]={name:SHOT[k].name,cost:SHOT[k].cost};
FOOT_COST.double=1;
function shotName(A,kind){return kind==='double'&&A&&isGun(A)&&A.wp.gun.burst?'Burst':SHOT[kind].name;}
function shotCount(A,kind){return kind==='double'?(A.wp.gun.burst||2):1;}

// what each command slot is in a gunman's hands
{const sa=slotAction;slotAction=function(A,D,slot){
  if(A&&!A.dead&&!A.downed&&!A.clinch&&isGun(A)){const m={slash:'shoot',overhead:'aimed',thrust:'double',sweep:null,feint:null};if(slot in m)return m[slot];}
  return sa(A,D,slot);};}
// the rules: a gun fires at anyone standing in the open or in cover, never from the ground or a hold; a gun is not a blade
{const cv=cmdValid;cmdValid=function(A,D,cmd){
  // the one guard left in the game: cover, for a man with a gun or a man in the open against one
  if(cmd==='guard'&&A&&!A.dead&&gunFight(A))return!A.downed&&!A.clinch&&!A.mount;
  if(GUN_KINDS.includes(cmd))return!!(A&&!A.dead&&!A.downed&&!A.clinch&&isGun(A)&&D&&!D.dead&&!D.walkIn&&(cmd!=='double'||A.foot>=1));
  if(isGun(A)&&(ATTACKS.includes(cmd)||cmd==='feint'||cmd==='bind'||cmd==='grab'))return false;
  return cv(A,D,cmd);};}
// a gun never answers a man closing on it with a stop-thrust, and a man with a gun has no blade to riposte or flow with
{const sh=stopHitFor;stopHitFor=function(A,D,...r){return isGun(D)||isGun(A)?false:sh(A,D,...r);};}
{const co=considerOpening;considerOpening=function(ex,f,...r){if(isGun(f))return;return co(ex,f,...r);};}
{const cf=considerFlow;considerFlow=function(ex,f,...r){if(isGun(f))return;return cf(ex,f,...r);};}
{const cg=considerGang;considerGang=function(ex,E,...r){if(isGun(E))return;return cg(ex,E,...r);};}

// ---------- the roll ----------
// to hit: his skill, the gun, the shot, his footing; past half the gun's range every quarter of it costs one. DEF: the target's
// skill, his footing, and cover (a man guarding is crouched behind whatever he found).
function shotMods(A,D,kind,i){const g=A.wp.gun,K=SHOT[kind],dist=Math.hypot(D.station-A.station,(D.lane-A.lane)*.6),far=Math.max(0,dist-g.range*.5);
  const mods=[['skill',A.skill],[A.wp.short.toLowerCase(),g.acc],[lowFirst(shotName(A,kind)),K.acc-(kind==='double'&&i?1:0)],['range',-Math.floor(far/(g.range*.25))],
    [footLabel(A),post(A).atk],['dazed',A.daze?-2:0],['outclassed',outclassMod(A,D)],['arm wound',-Math.min(2,A.wounds.arm||0)]];
  const defMods=[['skill',Math.round(D.skill*.6)],['cover',D.guarding&&!D.downed?4:0],[footLabel(D),post(D).def],['down',D.downed?-3:0],['dazed',D.daze?-2:0]];
  return{mods,defMods,bonus:sumMods(mods),def:10+sumMods(defMods)};}
function shotChance(A,D,kind){const c=shotMods(A,D,kind,0);let n=0;for(let r=2;r<=20;r++)if(r===20||r+c.bonus>=c.def)n++;return n/20;}
// where a round goes in: the head on a crit's good luck, else the body, an arm or a leg
const SHOT_ZONES=[['body',6],['arm',2],['leg',2],['head',1]];
function resolveShot(A,D,kind,i){const c=shotMods(A,D,kind,i),r=S.rng,roll=1+Math.floor(r()*20),total=roll+c.bonus,def=c.def,K=SHOT[kind];
  const out=roll===1?'jam':isCrit(roll,total,def)?'crit':total>=def?'hit':'miss';
  let dmg=0,dice=[],zone=null,knock=0,kd=false;
  if(out==='hit'||out==='crit'){const [n,s,base]=A.wp.dice;let sum=0;for(let k=0;k<n;k++){const d=1+Math.floor(r()*s);dice.push(d);sum+=d;}
    dmg=Math.max(1,Math.round((sum+base)*K.mult*(A.hench?CREW.dmg:1)*(out==='crit'?2:1)));
    if(out==='crit'&&r()<.45)zone='head';else{let t=r()*11;for(const [z,w] of SHOT_ZONES){t-=w;if(t<=0){zone=z;break;}}zone=zone||'body';}
    knock=(out==='crit'?20:8)+dmg*.45*(A.wp.gun.kind==='rifle'?1.3:1);
    // a round floors a man already off balance, and anyone it hits hard enough; the outclassed only on a crit
    kd=!D.downed&&(D.posture==='off'||out==='crit'&&dmg>=24||zone==='leg'&&dmg>=18)&&D.hp-dmg>0;
    if(kd&&kdBlocked(A,D,out==='crit'))kd=false;}
  return{roll,mods:c.mods,defMods:c.defMods,bonus:c.bonus,total,def,out,dmg,dice,zone,knock,kd,kind,mult:K.mult,i,seed:(r()*1e9)|0};}

// ---------- the shooting ----------
{const cm=command;command=function(i,cmd,opts){if(!GUN_KINDS.includes(cmd))return cm(i,cmd,opts);
  opts=opts||{};const g=S.game;if(g.phase!=='input'||g.active!==i||S.opening)return false;
  const A=S.F[i],D=targetOf(A);if(!cmdValid(A,D,cmd))return false;
  g.phase='exchange';g.aiAt=null;if(!opts.prepaid)A.ready+=actionCost(A,cmd);
  if(A.team===1)A.intent=null;
  const ex={A,D,t0:S.t,cmd,perf:{},depth:0,dazedAtStart:A.daze>0};g.ex=ex;A.covering=null;A.counter=false;A.lastAct=cmd;
  A.setSpear=false;A.wallPin=false;A.holdFace=null;A.feint=null;A.feintRead=null;A.guarding=false;A.circleGuard=false;
  faceToward(A,D.station);beginAction(A,cmd);
  launchShot(A,D,cmd,ex);S.hooks.log({type:'shot',A,D,ex,res:ex.res,shots:ex.shots});S.hooks.status();return true;};}
function launchShot(A,D,kind,ex){const shots=[];for(let i=0;i<shotCount(A,kind);i++)shots.push(resolveShot(A,D,kind,i));
  ex.res=shots[0];ex.shots=shots;const plan=planShot(A,D,kind,shots);A.action=plan.att;ex.plan=plan;ex.dur=plan.Tend;}
// the point a gun is laid on: the middle of the chest
function aimPoint(D){const P=D.p[PEL],C=D.p[CHE];return{x:lerp(P.x,C.x,.72),y:lerp(P.y,C.y,.72)};}
// the pose that lays the gun on him: a rifle in the shoulder, a pistol out at arm's length in both hands, a submachine gun at the
// chest. rc 0..1 is the kick of the round going out (the muzzle climbs, the hands come back)
const AIM={rifle:{hx:.36,hy:.02,tilt:.18,kick:.17,back:.08},pistol:{hx:.86,hy:-.05,tilt:.06,kick:.32,back:.1},smg:{hx:.5,hy:.12,tilt:.08,kick:.13,back:.05}};
function aimArm(A,D,rc){return aimArmAt(A,aimPoint(D),rc);}
// the same, laid on a point (a scene's target: a fuel tank, a lock)
function aimArmAt(A,T,rc){const a=A.arm,g=A.wp.gun,fa=A.facing,C=A.p[CHE],Q=AIM[g.kind]||AIM.pistol;
  const H={x:C.x+fa*Q.hx*a,y:C.y+Q.hy*a},ang=clamp(Math.atan2(T.y-H.y,Math.max(10,(T.x-H.x)*fa)),-1.15,1.15);
  return{hand:{sh:[(Q.hx-rc*Q.back)*a,(Q.hy-rc*.03)*a]},wAng:ang-rc*Q.kick,off:g.kind==='pistol'?{sh:[(Q.hx-.07-rc*Q.back)*a,(Q.hy+.05)*a]}:'grip',tilt:Q.tilt};}
function aimBody(A){const b=A.guardBody();return{...b,crouch:b.crouch-(A.wp.gun.kind==='rifle'?.03:.01),lean:b.lean*.4+.03,stF:b.stF*1.08,stB:b.stB*1.08};}
// the gun comes up, settles, fires (each round's kick), holds on him a moment, comes down
function planShot(A,D,kind,shots){const K=SHOT[kind],g=A.wp.gun,tAim=K.aim*(A.skill>=4?.85:1),gap=kind==='double'?(g.burst?.075:K.gap):0;
  const fireT=shots.map((s,i)=>tAim+i*gap),last=fireT[fireT.length-1],Tend=last+.66,aim=()=>aimArm(A,D,0);
  const arm=[{t:0,v:A.curArm||A.guardArm()},{t:tAim*.82,v:aim,e:eOut}];
  for(const t of fireT){arm.push({t,v:aim},{t:t+.035,v:()=>aimArm(A,D,1),e:eOut},{t:t+Math.min(.13,gap||.13),v:aim,e:sstep});}
  arm.push({t:last+.42,v:aim},{t:Tend,v:()=>A.guardArm(),e:sstep});
  const body=[{t:0,v:A.curBody||A.guardBody()},{t:tAim*.82,v:()=>aimBody(A),e:eOut},{t:last+.42,v:()=>aimBody(A)},{t:Tend,v:()=>A.guardBody(),e:sstep}];
  const events=[];
  shots.forEach((s,i)=>{const t=fireT[i];events.push({t,fn:()=>fireShot(A,D,s)});
    events.push({t:t+clamp(Math.hypot(D.station-A.station,60)/g.speed,.012,.09),fn:()=>shotLands(A,D,s,i===shots.length-1)});});
  return{att:{t0:S.t,end:Tend,body,arm},events,Tend:Tend+.1};}
// the round goes: flash, smoke, the casing, the kick in his hands, the sound
S.muzzles=[];S.tracers=[];S.impacts=[];S.casings=[];
function gunMuzzle(f){const h=f.p[HAF],t=f.p[TIP];return{x:t.x,y:t.y,ang:Math.atan2(t.y-h.y,t.x-h.x)};}
function fireShot(A,D,s){const g=A.wp.gun;A.lastShot=S.t;
  if(s.out==='jam'){popup(A,'Jammed','#ffc163','the gun won’t fire',19,-40);S.hooks.sound('click',1);A.ready+=15;return;}
  const M=gunMuzzle(A);s.from={x:M.x,y:M.y};
  // where the round ends: in him, or past him into the street behind
  s.to=s.out==='hit'||s.out==='crit'?zonePoint(D,s.zone):missPoint(A,D,s,M);
  if(!S.warming){S.muzzles.push({x:M.x,y:M.y,dep:A.dep,ang:M.ang,kind:g.kind,t0:S.t});
    S.tracers.push({a:{x:M.x,y:M.y,dep:A.dep},b:{x:s.to.x,y:s.to.y,dep:s.toDep??D.dep},dep:A.dep,dep1:s.toDep??D.dep,t0:S.t,kind:g.kind,dur:clamp(Math.hypot(s.to.x-M.x,s.to.y-M.y)/g.speed,.03,.09)});
    S.casings.push({x:A.p[HAF].x,y:A.p[HAF].y-4,dep:A.dep,vx:-A.facing*(60+Math.random()*60),vy:-(140+Math.random()*80),ang:Math.random()*TAU,spin:(Math.random()-.5)*40,t0:S.t,kind:g.kind});}
  // the kick: back into the shoulder, up at the muzzle
  for(const i of [TIP,HAF]){const q=A.p[i];q.px+=A.facing*(i===TIP?110:60)*DT*(g.kind==='rifle'?1:.6);q.py+=(i===TIP?130:30)*DT;}
  S.hooks.sound('shot',g.kind);S.shake=Math.max(S.shake,g.kind==='rifle'?3.5:1.6);}
// a round fired in a scene, at a point: the flash, the streak, the brass, the kick and the sound, nothing rolled
function fireAt(A,T,o){o=o||{};const g=A.wp.gun,M=gunMuzzle(A);A.lastShot=S.t;
  if(!S.warming){S.muzzles.push({x:M.x,y:M.y,dep:A.dep,ang:M.ang,kind:g.kind,t0:S.t});
    S.tracers.push({a:{x:M.x,y:M.y,dep:A.dep},b:{x:T.x,y:T.y,dep:o.dep??A.dep},dep:A.dep,dep1:o.dep??A.dep,t0:S.t,kind:g.kind,dur:g.kind==='hex'?.25:clamp(Math.hypot(T.x-M.x,T.y-M.y)/g.speed,.03,.09)});
    S.casings.push({x:A.p[HAF].x,y:A.p[HAF].y-4,dep:A.dep,vx:-A.facing*(60+Math.random()*60),vy:-(140+Math.random()*80),ang:Math.random()*TAU,spin:(Math.random()-.5)*40,t0:S.t,kind:g.kind});}
  for(const i of [TIP,HAF]){const q=A.p[i];q.px+=A.facing*(i===TIP?110:60)*DT;q.py+=(i===TIP?130:30)*DT;}
  S.hooks.sound('shot',g.kind);S.shake=Math.max(S.shake,3);}
function zonePoint(D,zone){const p=D.p,j=()=>(Math.random()-.5)*6;
  if(zone==='head')return{x:p[HEAD].x+j(),y:p[HEAD].y+j()};
  if(zone==='arm')return{x:lerp(p[ELF].x,p[HAF].x,.4)+j(),y:lerp(p[ELF].y,p[HAF].y,.4)+j()};
  if(zone==='leg')return{x:lerp(p[KNF].x,p[PEL].x,.5)+j(),y:lerp(p[KNF].y,p[PEL].y,.5)+j()};
  return{x:lerp(p[PEL].x,p[CHE].x,.62)+j(),y:lerp(p[PEL].y,p[CHE].y,.62)+j()};}
// a miss goes by him high or low, on into the street: into the road surface beyond him, or off into the dark
function missPoint(A,D,s,M){const T=aimPoint(D),dx=T.x-M.x,dy=T.y-M.y,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,off=((s.seed%7)-3)*.035+(s.seed&1?.07:-.07);
  const c=Math.cos(off),sn=Math.sin(off),vx=ux*c-uy*sn,vy=ux*sn+uy*c;
  // follow the line until it meets the ground or runs 700 past him
  const g=S.arena.ground(T.x,D.dep);let k=L+700;if(vy>.01)k=Math.min(k,(g-M.y)/vy);
  s.toDep=D.dep+((s.seed>>3)%40-20);s.into=vy>.01&&k<L+700?'ground':'dark';
  return{x:M.x+vx*k,y:M.y+vy*k};}
// the round arrives
function shotLands(A,D,s,last){if(s.out==='jam')return;const fa=Math.sign(D.station-A.station)||A.facing;
  if(s.out==='hit'||s.out==='crit')shotHit(A,D,s,fa);
  else{if(!S.warming&&s.into==='ground')S.impacts.push({x:s.to.x,y:s.to.y,dep:s.toDep,t0:S.t,kind:'ground',ang:Math.atan2(s.to.y-s.from.y,s.to.x-s.from.x)});
    popup(D,D.guarding&&!D.downed?'Into cover':'Miss','#c9d0f5',null,21);if(!S.warming&&!s.cover)S.hooks.sound(s.into==='ground'?'bullet_ground':'bullet_whiz',1);
    // close by his head: he ducks
    if(!D.dead&&!D.downed&&!D.action)D.action=flinchAction(D,fa,false);}
  if(last){S.hooks.perf(S.game.ex);}
  S.hooks.status();}
function shotHit(A,D,s,fa){const crit=s.out==='crit',C=s.to,down=!!D.downed;
  D.hp=Math.max(0,D.hp-s.dmg);
  // the round's push, strongest where it went in, along its line
  const ux=C.x-s.from.x,uy=C.y-s.from.y,ul=Math.hypot(ux,uy)||1,dx=ux/ul,dy=uy/ul,mag=(70+s.dmg*6.5)*(crit?1.4:1)*(A.wp.gun.kind==='rifle'?1.25:1)/Math.sqrt(D.body.mass);
  for(let i=0;i<D.p.length;i++){if(i===TIP)continue;const q=D.p[i],d2=(q.x-C.x)**2+(q.y-C.y)**2,w=Math.exp(-d2/(2*24*24)),k=mag*(.25+.75*w)*DT;q.px-=dx*k;q.py-=dy*k;}
  if(!down){D.motor=Math.min(D.motor,clamp(1-s.dmg/34,.12,.72));D.station=clampSt(D,D.station+fa*s.knock);}
  const hurt=woundFx(A,D,{dmg:s.dmg,out:s.out,kind:'thrust',tech:{edge:true},seed:s.seed},C,fa,s.zone);
  if(!S.warming)S.impacts.push({x:C.x,y:C.y,dep:D.dep,t0:S.t,kind:'flesh',ang:Math.atan2(dy,dx)});
  flash(C,crit?38:22,'#fff1c9',D.dep);
  const sub=D.hp<=0?(s.zone==='head'?'Headshot':'Out'):crit?(s.zone==='head'?'Headshot':'Critical'):s.kd?'Knocked down':s.zone==='leg'?'In the leg':s.zone==='arm'?'In the arm':null;
  popup(D,String(s.dmg),crit?'#ffd36b':'#ffffff',sub,crit?32:27);
  if(D.hp<=0){D.finName=s.zone==='head'?'Headshot':'Shot down';D.finBy=A.name;kill(D,fa);
    if(crit||s.zone==='head'){S.callouts.push({i:A.idx,text:D.finName,age:0,life:1.4,dx:-A.facing*8,big:true});S.slowT=Math.max(S.slowT,.45);}}
  else if(s.kd)knockDown(D);
  else if(crit)knockBalance(D,hitFoot(A,D),A);
  if(!D.dead&&!D.downed&&!D.action)D.action=flinchAction(D,fa,true);
  impactFeel(A,{dmg:s.dmg,out:s.out},fa,'hit');
  S.hooks.sound(crit?'crit':'hit',s.dmg,{A,D});
  if(hurt)S.hooks.wound(S.game.ex,D,{zone:s.zone,hurt,primary:true});}
// a round that hits jerks him back; one that misses close makes him duck his head
function flinchAction(D,fa,hit){const b0=D.curBody||D.guardBody(),a0=D.curArm||D.guardArm(),back=-fa*D.facing;
  return{t0:S.t,end:.55,body:bodyKeys(D,[[0,b0],[.08,hit?'shotHit':'shotDuck',hit?{flip:back}:null,eOut],[.55,'guard',sstep]]),arm:armKeys(D,[[0,a0],[.55,'guard',sstep]])};}
// the effects records age out (they are drawn by the page)
V11.step.push(()=>{const t=S.t;
  if(S.muzzles.length)S.muzzles=S.muzzles.filter(m=>t-m.t0<.8);
  if(S.tracers.length)S.tracers=S.tracers.filter(m=>t-m.t0<(m.dur||.05)+(m.kind==='hex'?.9:.35));
  if(S.impacts.length)S.impacts=S.impacts.filter(m=>t-m.t0<1);
  if(S.casings.length)S.casings=S.casings.filter(m=>t-m.t0<2.5);});
V11.duelStart.push(()=>{S.muzzles=[];S.tracers=[];S.impacts=[];S.casings=[];});

// ---------- in cover ----------
// a gunman guarding is crouched low behind whatever he has
{const gb=Fighter.prototype.guardBody;Fighter.prototype.guardBody=function(){const b=gb.call(this);if(isGun(this)&&this.guarding&&!this.downed){b.crouch-=.12;b.lean+=.06;}return b;};}

// ---------- the gunmen's minds ----------
// They keep their distance and shoot: mostly quick shots, an aimed one when there is time, a double tap now and then; into cover
// when hurt or off balance; back off a man who gets too close. Kael with a rifle (on auto) does the same, better.
function gunChoice(A,D){const r=S.rng,ok=c=>cmdValid(A,D,c),dist=Math.abs(A.station-D.station),g=A.wp.gun;
  if(A.foot<=1&&!A.guarding&&r()<.65&&ok('guard'))return'guard';
  if(A.hp<A.maxHp*.45&&!A.guarding&&r()<.3&&ok('guard'))return'guard';
  if(dist<120&&r()<.45&&ok('withdraw'))return'withdraw';
  if(dist>g.range*.85&&r()<.5&&ok('advance'))return'advance';
  if(A.team===1&&r()<.1&&ok('sidestep'))return'sidestep';
  const w={shoot:5,aimed:A.skill>=3||A.team===0?3.2:1.4,double:A.foot>=3?(g.burst?3:1.8):0};
  if(D.downed){w.aimed+=3;w.double=0;}
  if(D.guarding)w.aimed+=2;
  const ks=GUN_KINDS.filter(k=>w[k]>0&&ok(k));if(!ks.length)return ok('guard')?'guard':'wait';
  let t=r()*ks.reduce((s,k)=>s+w[k],0);for(const k of ks){t-=w[k];if(t<=0)return k;}return ks[0];}
{const ac=aiChoice;aiChoice=function(i){const A=S.F[i];
  if(A&&isGun(A)&&!A.downed&&!A.clinch){if(A.team===0)retargetHero(A);else retargetFoe(A);const D=targetOf(A);if(D)return gunChoice(A,D);}
  return ac(i);};}
// ===== GUNS END =====
