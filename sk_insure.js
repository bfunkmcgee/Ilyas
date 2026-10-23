// ===== INSURANCE START =====
// Kael never leaves a man alive on the floor behind him. When his attack run carries him past an enemy who is down but not dead,
// he drives a short stab into them on the way through, as part of the same move, and carries on to his real target.
// run: shortest run that counts; edge: how far in from each end of the run a body has to lie; band: how far off the run's depth it may lie;
// dur: seconds the stab adds to the run; reach: how close the weapon has to be to the body when it lands; touch: close enough to count as arrived;
// mult/min: the weapon's dice scaled down, and the least damage; ang: the weapon points down; lean/veer: the dip, and how far he steers toward the body in depth
const INS={run:60,edge:25,band:40,dur:.2,reach:45,touch:14,mult:.7,min:6,ang:1.35,lean:.36,veer:.6,grid:.025};
S.hooks.insurance=()=>{};

// the downed enemy Kael would stab on a run from startX to strikeX (null for none). T is the attack's technique, when it is known.
function insuranceFor(A,D,kind,startX,strikeX,z0,zS,T){
  if(A!==hero()||A.dead||A.downed||A.clinch||A.wp.unarmed||!ATTACKS.includes(kind))return null;
  if(T&&(T.kick||T.lash||T.vault||T.around!=null||T.into||T.through||T.multi||T.flair==='leap'||T.flair==='slide'))return null;
  const dx=strikeX-startX,dir=Math.sign(dx),len=Math.abs(dx);
  if(len<INS.run||dir!==(Math.sign(D.station-A.station)||A.facing))return null;
  // a divider or the table across the run makes it a different move
  if(S.divs.length&&divOnSeg(startX,z0,strikeX,zS,6))return null;
  if(tableIntact()&&[z0,zS].some(z=>inTableLane(z))){const b=tableBox();if(b.r>Math.min(startX,strikeX)&&b.l<Math.max(startX,strikeX))return null;}
  let best=null,bu=1e9;
  for(const f of S.F){
    if(f===A||f===D||f.team===A.team||f.dead||f.gone||!f.downed||f.clinch||f.carry||f.impaled||f.fountain||f.severed||S.t<f.dyingUntil)continue;
    const x=f.p[PEL].x,u=(x-startX)*dir;
    if(u<INS.edge||(strikeX-x)*dir<INS.edge||Math.abs(f.dep-lerp(z0,zS,u/len))>INS.band)continue;
    if(u<bu){bu=u;best=f;}}
  return best;
}
// the preview: would this attack on D stab someone on the way? The dice are not rolled yet, so the strike position is the simple estimate
function insurancePreview(A,D,kind){
  if(A!==hero()||!D||D.dead||D.team===A.team||!ATTACKS.includes(kind)||!S.F.some(f=>f.downed&&!f.dead&&f.team!==A.team))return null;
  const fa=Math.sign(D.station-A.station)||A.facing;
  return insuranceFor(A,D,kind,A.station,D.station-fa*engageGap(A,D),A.dep,strikeLane(A,D,kind),pickTechnique(A,D,kind));
}

// the chest of the body on the floor, in Kael's own frame at depth dep (a deeper body is drawn higher up and a little to the right)
function insureSpot(E,dep){const P=E.p[PEL],C=E.p[CHE],dz=E.dep-dep;return{x:lerp(P.x,C.x,.7)+dz*PSX,y:lerp(P.y,C.y,.7)-dz*PSY};}
// a point in Kael's frame, seen from the body's own depth
function insureLocal(E,dep,q){const dz=E.dep-dep;return{x:q.x-dz*PSX,y:q.y+dz*PSY};}
// the dip: how low he goes, and where his pelvis has to be, for the hand to hold the blade straight down over the spot with the arm nearly straight
function insureStance(A,fa,spot,zA){
  const arm=A.arm,tor=A.body.torso,leg=A.leg,lean=INS.lean,Lx=A.wp.len*.92,H={x:spot.x-fa*Math.cos(INS.ang)*Lx,y:spot.y-Math.sin(INS.ang)*Lx},gy=S.arena.ground(H.x-fa*40,zA);
  const crouch=clamp((gy-(H.y-.9*arm)-Math.cos(lean)*tor)/leg,.62,.74),dy=H.y-(gy-leg*crouch-Math.cos(lean)*tor),r=.96*arm,dxs=Math.sqrt(Math.max(r*r-dy*dy,(.25*arm)**2));
  return{px:H.x-fa*(dxs+Math.sin(lean)*tor),crouch,lean};
}
const insureInv=y=>{let a=0,b=1;for(let i=0;i<24;i++){const m=(a+b)/2;if(sstep(m)<y)a=m;else b=m;}return(a+b)/2;};

// The run, split round the stab. He runs on the same path and at the same pace, slows through a quick dip with the point driven down into the chest,
// and goes on to the strike: the dip adds INS.dur to the run, and everything after the run shifts by that much.
// endV is the run's last pose as planAttack built it. Returns the body and arm keys, the new end of the run (T1) and of the stab (Tland),
// the path (px, pz) for a flourish that turns on the spot, and the events.
function insurancePlan(A,E,fa,startX,endV,z0,T1,snap){
  const arm=A.arm,leg=A.leg,Lx=A.wp.len*.92,w=INS.ang,ds=INS.dur,endX=endV.px,zS=endV.pz,span=Math.abs(endX-startX)||1;
  const zPath=x=>lerp(z0,zS,clamp((x-startX)*fa/span,0,1)),clampX=x=>startX+fa*clamp((x-startX)*fa,14,span-26);
  // where he stands for the stab depends on his depth there, which depends on where he stands: two passes settle it
  let pS=E.p[CHE].x-fa*50,stn,zA;
  for(let i=0;i<2;i++){pS=clampX(pS);const zp=zPath(pS);zA=zp+INS.veer*(E.dep-zp);stn=insureStance(A,fa,insureSpot(E,zA),zA);pS=stn.px;}
  pS=clampX(pS);
  const zp=zPath(pS),dzV=INS.veer*(E.dep-zp),sS=T1*insureInv((pS-startX)*fa/span);
  // the slowdown: in run time it is a window round sS, in real time it takes ds longer
  const wv=clamp(Math.min(.09,sS-.01,T1-sS-.01),.03,.09),T1n=T1+ds;
  const tReal=s=>s<sS-wv?s:s>sS+wv?s+ds:s+ds*sstep((s-sS+wv)/(2*wv)),tc=tReal(sS);
  const sOf=t=>{if(t<=0)return 0;if(t>=T1n)return T1;let a=0,b=T1;for(let i=0;i<30;i++){const m=(a+b)/2;if(tReal(m)<t)a=m;else b=m;}return(a+b)/2;};
  // the dip comes in over the run-up to the stab, holds a moment and goes out again; the steer in depth is wider.
  // A slower body (low skill) answers its motors later, so it starts the dip earlier.
  const sl=1-A.sk,wIn=t=>sstep((t-(tc-.105-.25*sl))/(.09+.25*sl)),wOut=t=>1-sstep((t-(tc+.03))/.1),env=t=>wIn(t)*wOut(t);
  const zOut=clamp(T1n-.03-(tc+.02),.05,.22),envZ=t=>sstep((t-(tc-.26-.2*sl))/(.24+.2*sl))*(1-sstep((t-(tc+.02))/zOut));
  const dip={crouch:stn.crouch,lean:stn.lean,stF:.46*leg,stB:-.3*leg,th:.3,lift:0,kw:0};
  const from=snap?{...A.curBody,pz:z0}:null,base=u=>blendBody(A,from||{...A.guardBody(),pz:z0},endV,u);
  const at=t=>{const u=sstep(sOf(t)/T1),wd=env(t),wz=envZ(t);
    return()=>{const b=base(u),o=blendBody(A,b,{...dip,px:b.px,pz:b.pz},wd);o.pz=clamp(b.pz+dzV*wz,DEP_MIN,DEP_MAX);return o;};};
  const LIN=u=>u,body=[];
  for(let t=INS.grid;t<T1n-INS.grid*.6;t+=INS.grid)body.push({t,v:at(t),e:LIN});
  body.push({t:T1n,v:endV,e:LIN});
  // the arm: guard, the point plunges to the chest, holds, comes back to guard; a slow body holds it longer (its arm arrives late)
  const Tland=tc+.13+.08*sl,gA=()=>A.guardArm(),hand={fn:()=>{const s=insureSpot(E,A.dep);return{x:s.x-fa*Math.cos(w)*Lx,y:s.y-Math.sin(w)*Lx};}};
  const stab={hand,wAng:w,off:A.wp.off?'grip':{sh:[-.3*arm,.2*arm]},tilt:.15};
  const tA=Math.max(.045,tc-.08-.05*sl);
  const arms=[{t:Math.max(.02,Math.min(tc-.15-.05*sl,tA-.025)),v:gA},{t:tA,v:stab,e:eIn},{t:tc+.04+.08*sl,v:stab},{t:Tland,v:gA,e:sstep}];
  const I={A,E,dir:fa,body,arm:arms,T1:T1n,Tland,tc,tImp:tc,dur:ds,done:null,gap:null,pS,dip,
    px:t=>lerp(startX,endX,sstep(sOf(t)/T1)),pz:t=>lerp(z0,zS,sstep(sOf(t)/T1))};
  I.evs=[{t:tc-.1,fn:()=>S.hooks.sound('swoosh',A.wp.mass)}];
  for(let i=-3;i<=8;i++)I.evs.push({t:tc+i*.02,fn:()=>insureLook(I,i===8)});
  return I;
}

// How far the point or the hand is from the body's chest right now.
function insureGap(A,E){const sp=insureMid(E.p[PEL],E.p[CHE],.7);
  return Math.min(...[A.p[TIP],A.p[HAF]].map(q=>{const l=insureLocal(E,A.dep,q);return Math.hypot(l.x-sp.x,l.y-sp.y);}));}
// The point does not arrive at the same moment for every fighter (a slow body is late, a heavy weapon early), so the plan looks every .02 s
// through the stab's window: it lands when the point is at the body, or at its nearest approach if that comes within reach.
function insureLook(I,last){
  if(I.done)return;
  const d=insureGap(I.A,I.E),was=I.gap;I.gap=d;
  if(d<=INS.touch||(was!=null&&d>=was-.5&&was<=INS.reach)||(last&&d<=INS.reach))insuranceStab(I,true);
}

// the stab lands: damage, a body driven into the floor, blood and a small hit stop. It is not the attack's own result and opens nothing.
function insuranceStab(I,checked){
  const A=I.A,E=I.E,ex=S.game.ex,dir=I.dir;
  if(!ex||ex.A!==A||A.dead||E.dead||!E.downed)return false;
  const sp=insureMid(E.p[PEL],E.p[CHE],.7);
  if(!checked&&insureGap(A,E)>INS.reach)return false;
  // a henchman does not get up from this; anyone else takes the weapon's dice at 70%
  let dmg;
  if(E.hench)dmg=Math.max(1,E.hp);
  else{const [n,s,b]=A.wp.dice;let sum=0;for(let i=0;i<n;i++)sum+=1+Math.floor(S.rng()*s);dmg=Math.max(INS.min,Math.round((sum+b)*INS.mult));}
  E.hp=Math.max(0,E.hp-dmg);
  // the same drive into the floor as any blow on someone already down
  for(let i=0;i<E.p.length;i++){if(i===TIP)continue;const q=E.p[i],d2=(q.x-sp.x)**2+(q.y-sp.y)**2,k=(140+dmg*6)*Math.exp(-d2/1800)*DT/Math.sqrt(E.body.mass);q.px-=dir*k*.3;q.py-=k;}
  flash(sp,26,'#ffffff',E.dep);sparks(sp,6,'#ffe3b0',E.dep);
  woundFx(A,E,{dmg,out:'hit',kind:'thrust',tech:{},seed:0},sp,dir,'body');
  const fin=E.hp<=0;
  if(fin)kill(E,dir);
  S.freeze=Math.max(S.freeze,.04);S.hooks.sound('hit',Math.round(dmg*.6));
  popup(E,String(dmg),'#ffffff',fin?'Finished':'Insurance',22,-70);
  I.done={dmg,kill:fin};
  S.hooks.insurance(ex,{A,D:E,dmg,kill:fin,hench:!!E.hench});S.hooks.status();
  return true;
}
const insureMid=(a,b,u)=>({x:lerp(a.x,b.x,u),y:lerp(a.y,b.y,u)});
// ===== INSURANCE END =====
