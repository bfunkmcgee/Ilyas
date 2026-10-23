// ===== TEAM START =====
// An optional teammate for Kael and the moves two fighters make together: pincers, tandem strikes, holding an enemy
// for your partner, pulling a hold off your partner, covering them and helping them up. Also Kael's off-hand dagger in a clinch.
const ALLY_NAME='Amri',ALLY_COLOR='#8bdc6a',ALLY_HP=100;
// enemies are tougher when Kael has help
const FOE_HP_ALLY={1:200,2:150,3:85};
function allyOn(){return!!(S.cfg.ally&&S.cfg.ally.on);}
function foeHp(){return crewOn()?CREW.named[allyOn()?'ally':'solo']:(allyOn()?FOE_HP_ALLY:FOE_HP)[S.cfg.n];}
function rosterSize(){return S.cfg.n+1+(allyOn()?1:0);}
function heroes(){return S.F.filter(f=>f.team===0&&!f.dead);}
function partnerOf(f){if(!f||f.team!==0)return null;return S.F.find(o=>o!==f&&o.team===0&&!o.dead)||null;}
function getTgt(f){return f===S.F[0]?S.target:f.tgt;}
function setTgt(f,i){if(f===S.F[0])S.target=i;else f.tgt=i;}
function nearestHero(f){let best=null,bd=1e9;for(const h of heroes()){const d=Math.abs(h.station-f.station)+Math.abs(h.lane-f.lane)*.8;if(d<bd){bd=d;best=h;}}return best;}
// the ally starts beside Kael against one enemy, otherwise on the side with fewer enemies
function allySpawn(sp){
  const K=sp[0],n=sp.length-1;
  if(n===1)return[K[0]-26,clamp(K[1]+56,DEP_MIN+6,DEP_MAX-12)];
  const L=sp.slice(1).filter(s=>s[2]<0).length,dir=L<=n-L?-1:1;
  return[clampStage(K[0]+dir*118),clamp(K[1]+58,DEP_MIN+6,DEP_MAX-12)];
}
function allyFacing(sp,s){let best=null,bd=1e9;for(const q of sp.slice(1)){const d=Math.abs(q[0]-s[0])+Math.abs(q[1]-s[1])*.6;if(d<bd){bd=d;best=q;}}return best?(Math.sign(best[0]-s[0])||1):1;}
// an enemy picks which of the two to fight: close, hurt or down, held by a friend, or holding a friend
function retargetFoe(A){
  const hs=heroes();if(!hs.length){A.tgt=null;return;}if(hs.length<2){A.tgt=hs[0].idx;return;}
  const K=hero();let best=null,bs=-1e9;
  for(const h of hs){let s=-Math.abs(h.station-A.station)*.12-Math.abs(h.lane-A.lane)*.08+(1-h.hp/h.maxHp)*25;
    if(h.idx===A.tgt)s+=22;if(h.downed)s+=30;
    const hb=heldBy(h);if(hb&&hb.team===1&&hb!==A)s+=55;
    if(h.clinch&&h.clinch.a===h&&clinchPartner(h).team===1)s+=60;
    // Kael stands in the way of the one behind him
    if(h!==K&&!K.dead&&A.side&&Math.abs(h.lane-K.lane)<40&&Math.sign(h.station-K.station)===-A.side)s-=80;
    if(s>bs){bs=s;best=h;}}
  A.tgt=best.idx;
}

// ---------- pincer ----------
// one enemy with a fighter on each side of it can only face one of them
function pincered(f){
  if(!f||f.dead||f.downed)return false;let L=false,R=false;
  for(const h of S.F){if(h.team===f.team||h.dead||h.clinch||!upright(h))continue;const dx=h.station-f.station;
    if(Math.abs(dx)-engageGap(h,f)>50||Math.abs(h.lane-f.lane)>44)continue;if(dx<0)L=true;else R=true;}
  return L&&R;
}
function pincerInfo(A){
  const P=partnerOf(A);if(!P||A.downed||A.clinch||P.downed||A.dead)return null;
  const D=targetOf(A);if(!D||D.downed||D.clinch||D.dead)return null;
  if(Math.abs(P.station-D.station)-engageGap(P,D)>60||Math.abs(P.lane-D.lane)>44)return null;   // the partner has to be on it already
  const s=Math.sign(D.station-P.station)||-D.facing;
  if(Math.sign(A.station-D.station)===s&&Math.abs(A.station-D.station)-engageGap(A,D)<70)return null;   // already behind it
  const tx=clampStage(D.station+s*(engageGap(A,D)+8));if((tx-D.station)*s<engageGap(A,D)*.8)return null;
  const cands=[D.lane+60,D.lane-60].filter(z=>z>=DEP_MIN&&z<=DEP_MAX);cands.sort((a,b)=>Math.abs(a-A.lane)-Math.abs(b-A.lane));
  for(const dz of cands){
    if(inTableLane(dz,10)){const b=tableBox(),lo=Math.min(A.station,tx),hi=Math.max(A.station,tx);if(b.r>lo&&b.l<hi)continue;}
    const tz=clamp(D.lane+(dz>D.lane?10:-10),DEP_MIN,DEP_MAX);
    if(S.divs.length){const dir=Math.sign(tx-A.station)||A.facing;if(divOnPath([[A.station,A.lane],[A.station+dir*16,dz],[tx,dz],[tx,tz]]))continue;}
    if(laneOK(A,tz,tx))return{x:tx,z:tz,dz,D,P,side:s};}
  return null;
}
function planPincer(A,info){
  const z0=A.dep,x0=A.station,D=info.D,run=lerp(250,360,A.sk)*(1-.12*A.wounds.leg),st=(x,y)=>({stF:x*A.leg,stB:y*A.leg});
  const dir=Math.sign(info.x-x0)||A.facing,w1={x:x0+dir*16,z:info.dz},L1=Math.hypot(16,(info.dz-z0)*.9),L2=Math.abs(info.x-w1.x),L3=Math.abs(info.z-info.dz)*.9;
  const t1=Math.max(.18,L1/run),t2=t1+Math.max(.2,L2/run),t3=t2+Math.max(.16,L3/run),Tend=t3+.35;
  A.station=info.x;A.lane=info.z;A.facing=dir;A.guarding=false;
  if(A===hero())resyncSides();
  const body=[{t:0,v:{...A.curBody,pz:z0}},{t:t1,v:{px:w1.x,pz:w1.z,crouch:.84,lean:.16,...st(.3,-.32),th:.24}},
    {t:t2,v:{px:info.x,pz:info.dz,crouch:.84,lean:.12,...st(.3,-.32),th:.24}},{t:t3,v:()=>A.guardBody(),e:sstep},{t:Tend,v:()=>A.guardBody()}];
  const arm=[{t:0,v:{...A.curArm}},{t:Tend,v:()=>A.guardArm()}];
  const events=[{t:t2-.04,fn:()=>faceToward(A,D.station)},
    {t:t3,fn:()=>{if(pincered(D))popup(D,'Pincered','#a9e88c',`${info.P.name} and ${A.name}`,19,-30);S.hooks.status();}}];
  S.callouts.push({i:A.idx,text:'Pincer',age:0,life:1,dx:-dir*18});
  return{att:{t0:S.t,end:Tend,body,arm},Tend:Tend+.05,events,dash:Math.round(L1+L2+L3),strikeX:info.x,Cfn:()=>({x:info.x,y:S.arena.ground(info.x,info.z)-80})};
}

// ---------- cover ----------
// stand beside your partner with your guard up: the next attack aimed at them hits you instead
function coverInfo(A){
  const P=partnerOf(A);if(!P||A.downed||A.clinch||A.dead||A.covering===P)return null;
  if(Math.abs(P.station-A.station)>340)return null;
  let X=null,bd=1e9;for(const f of foes()){if(f.downed||f.walkIn)continue;const d=Math.abs(f.station-P.station)+Math.abs(f.lane-P.lane)*.6-(targetOf(f)===P?60:0);if(d<bd){bd=d;X=f;}}
  if(!X)return null;const s=Math.sign(X.station-P.station)||P.facing;
  for(const dz of [32,-32,46,-46]){const z=clamp(P.lane+(A.lane>=P.lane?dz:-dz),DEP_MIN,DEP_MAX);if(Math.abs(z-P.lane)<24)continue;
    const x=clampSt(A,P.station+s*26,z);if(Math.abs(X.station-x)<46&&Math.abs(X.lane-z)<26)continue;
    if(S.divs.length&&divOnSeg(A.station,A.lane,x,z))continue;
    return{P,X,x,z,side:s};}
  return null;
}
function planCover(A,info){
  const z0=A.dep,x0=A.station,dist=Math.hypot(info.x-x0,(info.z-z0)*.9),run=lerp(260,380,A.sk)*(1-.12*A.wounds.leg),t1=Math.max(.15,dist/run),Tend=t1+.4;
  A.station=info.x;A.lane=info.z;A.facing=info.side;A.guarding=true;gainFoot(A,FOOT_GAIN.cover);A.circleGuard=false;A.covering=info.P;
  const body=[{t:0,v:{...A.curBody,pz:z0}},{t:t1,v:()=>({...A.guardBody(),px:info.x,pz:info.z}),e:sstep},{t:Tend,v:()=>A.guardBody()}];
  const arm=[{t:0,v:{...A.curArm}},{t:t1,v:()=>A.guardArm(),e:sstep},{t:Tend,v:()=>A.guardArm()}];
  popup(info.P,'Covered','#a9e88c',`by ${A.name}`,18,-30);
  return{att:{t0:S.t,end:Tend,body,arm},Tend:Tend+.05,events:[],dash:Math.round(dist),strikeX:info.x,Cfn:()=>({x:info.x,y:A.gr(info.x)-80})};
}
function coverFor(X,D){
  for(const o of S.F){if(o===D||o===X||o.team!==D.team||o.covering!==D||o.dead||o.downed||o.clinch||!upright(o))continue;
    if(Math.abs(o.station-D.station)<160&&Math.abs(o.lane-D.lane)<80)return o;}
  return null;
}

// ---------- help up ----------
function helpInfo(A){
  const P=partnerOf(A);if(!P||!P.downed||P.dead||P.carry||A.downed||A.clinch||A.dead)return null;
  const px=P.p[PEL].x;if(Math.abs(px-A.station)>330||Math.abs(P.dep-A.lane)>130)return null;
  const s=Math.sign(A.station-px)||-P.facing,z=clamp(P.dep+(A.lane>=P.dep?18:-18),DEP_MIN,DEP_MAX);
  const x=clampSt(A,px+s*34,z);if(S.divs.length&&divOnSeg(A.station,A.lane,x,z,6))return null;
  return{P,x,z};
}
function planHelp(A,info){
  const P=info.P,z0=A.dep,x0=A.station,dist=Math.hypot(info.x-x0,(info.z-z0)*.9),run=lerp(260,380,A.sk)*(1-.12*A.wounds.leg);
  const t1=Math.max(.14,dist/run),Tc=t1+.28,Tend=Tc+.75,a=A.arm;
  A.station=info.x;A.lane=info.z;A.facing=Math.sign(P.p[PEL].x-info.x)||A.facing;A.guarding=false;
  const reach=()=>{const c=P.p[CHE],h=P.p[HAF];return{x:lerp(c.x,h.x,.5),y:lerp(c.y,h.y,.5)};};
  const body=[{t:0,v:{...A.curBody,pz:z0}},{t:t1,v:()=>({...A.guardBody(),px:info.x,pz:info.z,crouch:.8})},
    {t:Tc,v:()=>({...A.guardBody(),px:info.x,pz:info.z,crouch:.6,lean:.45,th:.9}),e:eOut},
    {t:Tc+.35,v:()=>({...A.guardBody(),px:info.x,pz:info.z,crouch:.78,lean:-.06,th:.9}),e:eIn},{t:Tend,v:()=>A.guardBody(),e:sstep}];
  const arm=[{t:0,v:{...A.curArm}},{t:Tc,v:{hand:{sh:[.3*a,.25*a]},wAng:1.2,off:{fn:reach},tilt:.2},e:eOut},
    {t:Tc+.35,v:{hand:{sh:[.3*a,.05*a]},wAng:.9,off:{sh:[.25*a,-.15*a]},tilt:0}},{t:Tend,v:()=>A.guardArm(),e:sstep}];
  const events=[{t:Tc,fn:()=>{if(!P.downed||P.dead)return;standUp(P);P.foot=Math.max(P.foot,FOOT_RISE);
    for(const i of [CHE,HEAD,PEL])P.p[i].py+=(i===PEL?80:140)*DT;
    popup(P,'Back up','#a9e88c',`pulled up by ${A.name}`,19,-30);S.hooks.sound('thud',120);S.hooks.helped(S.game.ex,{A,P});S.hooks.status();}}];
  return{att:{t0:S.t,end:Tend,body,arm},Tend:Tend+.05,events,dash:Math.round(dist),strikeX:info.x,Cfn:reach};
}

// ---------- rescue ----------
// a blow or a shove on the one holding your partner makes them let go
function rescueFrom(A,D){
  const c=D&&D.clinch;if(!c||c.a!==D||D.dead)return null;const H=c.b;if(!H||H===A||H.team!==A.team)return null;
  endClinch(D);popup(H,'Freed','#a9e88c',`by ${A.name}`,19,-30);S.hooks.status();return H;
}
function rescueShoveOK(A,D){const c=D&&D.clinch;return!!(c&&c.a===D&&c.b!==A&&c.b.team===A.team);}

// ---------- the off-hand dagger in a clinch ----------
// an expert can draw the hip dagger with the free hand while locked chest to chest, or while held from behind
function stabInfo(A){
  const c=A.clinch;if(!c||A.dead||A.downed||A.skill<RANK.expert)return null;
  if(A.sidearm!=='sheathed'&&A.sidearm!=='offhand')return null;
  const P=clinchPartner(A);if(!P||P.dead||P.downed)return null;
  const holder=c.a===A;return{P,drawn:A.sidearm==='offhand',rear:holder&&c.behind,back:!holder&&c.behind};
}
function stabTech(A,D){
  const i=stabInfo(A)||{};
  const T={kind:'stab',key:'stab',name:'',why:'',tags:['Clinch','Sidearm'],acc:2+(A.skill>=RANK.master?1:0),dmg:1,along:null,ang:null,amp:1,overlap:0,reach:null,anchor:null,kick:false,vault:false,around:null,
    rising:false,descend:false,windCap:null,passing:false,flair:null,multi:null,knock:.3,kdEase:0,dirty:true,stab:true,edge:true,dice:[2,4,10],zone:'body',rear:!!i.rear,back:!!i.back,drawn:!!i.drawn};
  if(i.back)Object.assign(T,{name:'Backward stab',why:'Pinned from behind, the free hand finds the hip dagger and stabs back into the one holding him. If it lands, the grip breaks.',
    onHit:(A2,D2)=>{if(A2.clinch&&heldBy(A2)===D2){endClinch(A2);const d=Math.sign(D2.station-A2.station)||-A2.facing;D2.station=clampSt(D2,D2.station+d*22);knockBalance(D2,FOOT_HIT,A2);
      for(const q of [D2.p[CHE],D2.p[HEAD]])q.px-=d*90*DT;A2.facing=d;popup(A2,'Breaks free','#a5dcff',null,19,-30);S.hooks.status();}}});
  else if(i.rear)Object.assign(T,{name:i.drawn?'Knife to the ribs':'Draw and stab',why:'Holding them from behind, the free hand draws the dagger and drives it into their side.'});
  else Object.assign(T,{name:i.drawn?'Dagger stab':'Draw and stab',why:'Chest to chest, the free hand pulls the dagger from the hip and stabs up under the ribs.'});
  return T;
}
function launchStab(A,D,ex,opening){
  const T=stabTech(A,D),res=resolveAttack(A,D,'stab',opening,T);
  A.guarding=false;A.counter=false;beginAction(A,'stab');
  const plan=planStab(A,D,res,res.tech);A.action=plan.att;D.action=plan.react;
  ex.res=res;ex.plan=plan;ex.dur=plan.Tend;ex.perf={dash:0,windup:plan.tWind};
}
function planStab(A,D,res,T){
  const dir=Math.sign(D.station-A.station)||A.facing,ls=dir===A.facing?1:-1,a=A.arm,out=res.out,sp=A.skill>=RANK.master?.85:1,drawn=!!T.drawn;
  const Tr0=.15*sp,Tdraw=.25*sp,Tcock=(drawn?.1:.35)*sp,Timp=Tcock+.11*sp,Td=Timp+.08,Tret=Td+.32,Tend=Tret+.28,len=WEAPONS.dagger.len;
  const neck=!!(T.fin&&T.fin.type==='throatcut'),land=out==='hit'||out==='crit';
  const aimPt=()=>{const P=D.p[PEL],C=D.p[CHE],H=D.p[HEAD];if(neck)return{x:lerp(C.x,H.x,.5),y:lerp(C.y,H.y,.5)};const u=T.back?.42:.58;
    return{x:lerp(P.x,C.x,u)-dir*D.body.torsoW*.25,y:lerp(P.y,C.y,u)};};
  // the hand stops short of the point it aims at by part of the blade, so the blade does the reaching
  const short=(fn,u)=>()=>{const X=fn(),c=A.p[CHE],dx=X.x-c.x,dy=X.y-c.y,L=Math.hypot(dx,dy)||1;return{x:X.x-dx/L*len*u,y:X.y-dy/L*len*u};};
  let Cfn=aimPt;
  if(!land){const M=aimPt();Cfn=()=>({x:M.x-dir*(out==='block'?10:5),y:M.y-(out==='dodge'?10:0)});}
  const gA=()=>A.guardArm(),gB=()=>A.guardBody(),off=(o,tilt)=>()=>{const g=A.guardArm();return{...g,off:o,tilt:tilt??g.tilt};};
  const armK=[{t:0,v:{...A.curArm}}];
  if(!drawn)armK.push({t:Tr0,v:off({fn:()=>sheathPts(A).grip}),e:eOut},
    {t:Tdraw,v:off({fn:()=>{const k=sheathPts(A);return{x:k.grip.x+(k.grip.x-k.tip.x)*.45,y:k.grip.y+(k.grip.y-k.tip.y)*.45};}})});
  armK.push({t:Tcock,v:off({sh:[-.06*a,.3*a]}),e:eOut},
    {t:Timp,v:off({fn:short(Cfn,land?(neck?.35:.55):.95)}),e:eIn},
    {t:Td,v:off({fn:short(aimPt,neck?.05:.5)})},
    {t:Tret,v:gA,e:sstep},{t:Tend,v:gA});
  const body=[{t:0,v:{...A.curBody}},{t:Tcock,v:()=>{const g=gB();return{...g,lean:g.lean-.06*ls};}},{t:Timp,v:()=>{const g=gB();return{...g,lean:g.lean+.16*ls,crouch:g.crouch-.03};},e:eIn},
    {t:Tret,v:gB,e:sstep},{t:Tend,v:gB}];
  const db={...D.curBody},da={...D.curArm},rk=out==='block'?{t:Timp,v:()=>({...D.guardBody(),lean:-.08})}:out==='dodge'||out==='fumble'?{t:Timp,v:()=>({...D.guardBody(),lean:-.26,crouch:.8})}:{t:Timp,v:()=>D.guardBody()};
  const react={t0:S.t,end:Timp+.5,body:[{t:0,v:db},{t:Math.max(.02,Timp-.1),v:()=>D.guardBody()},rk,{t:Timp+.5,v:()=>D.guardBody(),e:sstep}],arm:[{t:0,v:da},{t:Timp+.5,v:()=>D.guardArm(),e:sstep}]};
  const events=[{t:Tcock+.02,fn:()=>S.hooks.sound('swoosh',.5)}];
  if(!drawn)events.push({t:Tdraw-.03,fn:()=>{if(A.sidearm==='sheathed'){A.sidearm='offhand';const g=sheathPts(A).grip;flash(g,10,'#fff3cf',A.dep);sparks(g,4,'#fff3cf',A.dep);S.hooks.sound('clang',.35);}}});
  if(out==='fumble')events.push({t:Td+.05,fn:()=>{spendFoot(A,FOOT_HIT);popup(A,'Fumble','#c9d0f5',null,20);}});
  S.callouts.push({i:A.idx,text:T.name,age:0,life:clamp(Timp+.3,.75,1.2),dx:-A.facing*20});
  const hand=A.p[HAB],contactSeg=()=>{const e=A.p[ELB],h=A.p[HAB],L=Math.hypot(h.x-e.x,h.y-e.y)||1;return[h,{x:h.x+(h.x-e.x)/L*len,y:h.y+(h.y-e.y)/L*len}];};
  return{att:{t0:S.t,end:Tend,body,arm:armK},react,Timp,Td,Tend,strikeX:A.station,Cfn,contactSeg,contactVel:()=>({x:(hand.x-hand.px)/DT,y:(hand.y-hand.py)/DT}),dash:0,theta:0,events,tWind:Tcock,dir,slip:null};
}
// the off-hand dagger: held along the forearm, with a bright edge so it reads against the other body
function offDaggerPts(f){const e=f.p[ELB],h=f.p[HAB],L=Math.hypot(h.x-e.x,h.y-e.y)||1,len=WEAPONS.dagger.len,ux=(h.x-e.x)/L,uy=(h.y-e.y)/L;return{h,t:{x:h.x+ux*len,y:h.y+uy*len},ux,uy};}
function drawOffDagger(f){
  const k=offDaggerPts(f);drawWeaponAt('dagger',k.h,k.t,f.facing);
  ctx.save();ctx.lineCap='round';ctx.strokeStyle='rgba(255,243,220,.8)';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(k.h.x+k.ux*5,k.h.y+k.uy*5);ctx.lineTo(k.t.x,k.t.y);ctx.stroke();ctx.restore();
}
// the off-hand blade leaves a short streak when it moves fast
function offTrailStep(f){
  const tr=f.offTrail||(f.offTrail=[]);for(const e of tr)e.age+=DT;while(tr.length&&tr[0].age>tr[0].life)tr.shift();
  if(f.sidearm!=='offhand'||f.dead)return;const k=offDaggerPts(f),q=f.p[HAB],sp=Math.hypot(q.x-q.px,q.y-q.py)/DT;
  if(sp>170)tr.push({hx:lerp(k.h.x,k.t.x,.25),hy:lerp(k.h.y,k.t.y,.25),tx:k.t.x,ty:k.t.y,age:0,life:.14,c:null,t:S.t});
}
// once the clinch is over, the dagger goes back in its scabbard
function afterExchange(){for(const f of S.F){if(f.sidearm==='offhand'&&!f.clinch)f.sidearm='sheathed';}}

// ---------- what the two of them do on their own ----------
function teamChoice(A,D,ok,r){
  const P=partnerOf(A);if(!P||A.clinch||A.downed)return null;
  if(ok('helpup')&&r()<.8)return'helpup';
  const hb=heldBy(P);if(hb&&D===hb){if(ok('shove')&&r()<.35)return'shove';return null;}
  const threats=foes().filter(f=>!f.downed&&!f.walkIn&&targetOf(f)===P).length;
  if(ok('cover')&&P.hp<P.maxHp*.35&&threats>=2&&A.hp>A.maxHp*.4&&r()<.35)return'cover';
  if(ok('pincer')&&!pincered(D)&&r()<.32)return'pincer';
  return null;
}
// ===== TEAM END =====
