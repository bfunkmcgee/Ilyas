// ===== FINISHERS START =====
// Killing blows. A lethal hit becomes a finisher that suits the weapon, the attack, where it lands and how the target
// stands: the choreography is bent to match (aimed at the neck, driven through the body) and the impact plays it out.
// Piercing and cleaving kills can leave the weapon stuck in the body. Kael also carries a dagger on his hip.

// pierce: how far past the contact the point is driven (share of the blade); hold: how long the blade stays in the body;
// stuck: how likely the weapon is to stay in (scaled by skill and weapon); dying: a last pose before the body goes limp
const FIN={
  behead:{knock:.85,anchor:'neck',ang:a=>a+.08},
  execution:{knock:.3,anchor:'neck'},
  cutdown:{knock:1.15},
  runthrough:{knock:.22,anchor:'chest',pierce:.42,hold:.42,stuck:1},
  impale:{knock:.2,anchor:'chest',pierce:.46,hold:.5,stuck:1.1,lift:1},
  heartstab:{knock:.2,anchor:'chest',pierce:.24,hold:.36,stuck:.65,dying:'clutch'},
  cleave:{knock:.3,bite:1,hold:.4,stuck:1,dying:'kneel'},
  throatcut:{knock:.45,anchor:'neck',dying:'throat'},
  knockout:{knock:1.3},
  pin:{knock:0,pierce:.32,hold:.42,stuck:1.25},
  knifed:{knock:.1,dying:'clutch'},
};
// by skill 1 to 5: a novice often leaves the blade in the body, a master never does
const STUCK_SKILL=[0,.55,.38,.22,.1,0];
const STUCK_WEAPON={sword:1,axe:1.25,spear:1.1,dagger:.6,shard:.5};

function finVar(A,D){return hash32('fin|'+A.idx+'|'+D.idx+'|'+S.game.turnNo+'|'+A.seed)/4294967296;}
function pickFinisher(A,D,kind,T){
  const wp=A.wp,k=wp.key==='elven'?'sword':wp.key,fam=wp.fam,butt=T.along!==null&&T.along<0,down=!!D.downed&&!D.dead,back=!down&&backExposed(D,A),gore=S.gore!=='off';
  const mk=(type,name)=>({type,name,...FIN[type]});
  if(T.stab)return T.rear?mk('throatcut',gore?'Throat slit':'Knifed'):mk('knifed',T.back?'Stabbed behind':'Knifed');
  // the back thrust has its own motion, so its kill is a plain one
  if(T.backT)return mk('cutdown','Reverse thrust');
  if(T.dirty||T.kick)return mk('knockout',T.stomp?'Stomped out':T.dirty?'Knocked out':'Felled');
  if(butt||fam==='fist'||fam==='blunt'||(wp.improv&&fam==='heavy'))return mk('knockout',fam==='fist'?'Knockout':'Knocked out');
  if(down){
    if(kind==='thrust'||(kind==='overhead'&&fam==='short'))return mk('pin','Pinned');
    if(kind==='overhead'&&(k==='sword'||k==='axe'))return mk('execution',gore?'Execution':'Finished');
    return mk('cutdown','Finished');}
  if(kind==='thrust'){
    if(k==='spear')return mk('impale','Impaled');
    if(k==='sword')return mk('runthrough','Run through');
    if(fam==='short')return mk('heartstab',back?'Stabbed in the back':'Heart stab');
    return mk('impale','Spiked');}
  if(kind==='overhead'){
    if(k==='axe'||k==='sword')return mk('cleave','Cleaved');
    if(fam==='short')return mk('heartstab','Stabbed down');
    return mk('cutdown','Struck down');}
  if(kind==='slash'){
    if(fam==='short'||k==='spear')return mk('throatcut',gore?(back?'Throat slit':'Throat cut'):'Struck down');
    if(k==='sword'||k==='axe')return finVar(A,D)<.6?mk('behead',gore?'Beheaded':'Struck down'):mk('cutdown',k==='axe'?'Hewn down':'Cut down');}
  return mk('cutdown','Cut down');
}
function stuckChance(A,F){if(!F||!F.stuck)return 0;return Math.min(.85,(STUCK_SKILL[A.skill]||0)*(STUCK_WEAPON[A.weaponKey]||0)*F.stuck);}

// the moment of the kill
function finisherImpact(ex,A,D,res,C,fa){
  const F=res.tech.fin;if(!F||!D.dead)return;
  const gore=S.gore!=='off'&&!S.warming;
  D.finName=F.name;D.finType=F.type;D.finBy=A.name;D.action=null;
  for(const c of S.callouts)if(c.i===A.idx&&c.age<c.life-.12)c.age=c.life-.12;
  S.callouts.push({i:A.idx,text:F.name,age:0,life:1.6,dx:-A.facing*8,big:true});
  S.slowT=Math.max(S.slowT,.75);S.freeze=Math.max(S.freeze,.09);
  if(!S.warming)S.punch={x:prjX(C.x,D.dep),t:0};
  const h=D.p[HEAD];
  switch(F.type){
    case'behead':case'execution':
      if(gore)sever(D,fa,F.type==='execution');
      else{h.px-=fa*(F.type==='execution'?60:240)*DT;h.py+=40*DT;}
      break;
    case'runthrough':case'impale':case'heartstab':case'pin':case'cleave':
      impaleOn(D,A,F,ex);
      if(gore&&F.pierce&&F.type!=='pin'){const ex2={x:C.x+fa*(D.body.torsoW+6),y:C.y};bleed(ex2,fa,14,D.dep,1.1);}
      break;
    case'knifed':
      dyingPose(D,'clutch');if(gore)bleed(C,-fa,16,D.dep,.9);
      break;
    case'throatcut':
      dyingPose(D,'throat');
      if(gore)D.fountain={t0:S.t,until:S.t+.9,from:'neck',ang:Math.atan2(-.25,D.facing),spread:.5};
      break;
    case'cutdown':{const s=(res.seed&2)?1:-1;D.vdep+=s*95;for(const i of [CHE,HEAD,ELF,ELB])D.p[i].px-=fa*90*DT;
      if(gore){bleed(C,fa,22,D.dep,1.25);bleed(C,-fa,8,D.dep,.7);}break;}
    case'knockout':{const s=(res.seed&2)?1:-1;h.px-=fa*280*DT;h.py+=70*DT;D.vdep+=s*80;
      sparks(h,10,'#fff3cf',D.dep);break;}
  }
  S.hooks.sound('crit',30);
  S.hooks.fin(ex,{A,D,F});
}
// the neck gives way: the head is free and the stump spurts
function sever(D,fa,ground){
  if(D.severed)return;D.severed=true;
  for(const s of D.sticks)if(s[0]===CHE&&s[1]===HEAD)s[3]=1;
  const h=D.p[HEAD],k=ground?.6:1,vx=fa*(150+Math.random()*90)*k,vy=-(230+Math.random()*120)*k;
  h.px=h.x-vx*DT;h.py=h.y-vy*DT;
  D.fountain={t0:S.t,until:S.t+1.5,from:'stump',spread:.55};
  bleed(D.p[CHE],fa,26,D.dep,1.2);
}
// a blade through the body (or bitten into it): the body hangs on it until it is pulled out, or it stays in
function impaleOn(D,A,F,ex){
  const lt=ex?S.t-ex.t0:0,rel=ex&&ex.plan&&ex.plan.Td!=null?Math.max(.06,ex.plan.Td-lt):(F.hold||.3);
  const k=F.type==='cleave'?.96:F.type==='pin'?.5:.62;
  D.impaled={A,k,until:S.t+rel+.05,soft:F.type==='cleave'?.16:.3,lift:F.lift?16:5};
  const p=stuckChance(A,F),stuck=p>0&&(S.forceStuck!=null?!!S.forceStuck:S.rng()<p);
  A.finRelease={at:S.t+rel,D,F,stuck,ex};
  if(F.dying)dyingPose(D,F.dying);
}
// a dying body keeps a little strength for a moment: hands to the throat, to the wound, or down on its knees
function dyingPose(D,kind){
  D.motor=Math.max(D.motor,.85);D.dyingUntil=S.t+(kind==='kneel'?.8:.7);
  const cb={...(D.curBody||D.guardBody())},ca={...(D.curArm||D.guardArm())},a=D.arm,back=kind==='kneel'?0:-D.facing*16,lb=v=>({...cb,px:cb.px+back,...v});
  const neck=()=>{const c=D.p[CHE],h=D.p[HEAD];return{x:lerp(c.x,h.x,.45)+D.facing*3,y:lerp(c.y,h.y,.45)};};
  const gut=()=>{const c=D.p[CHE],p=D.p[PEL];return{x:lerp(p.x,c.x,.6)+D.facing*5,y:lerp(p.y,c.y,.6)};};
  let body,arm;
  if(kind==='throat'){body=[{t:0,v:cb},{t:.2,v:lb({crouch:.74,lean:.08})},{t:.68,v:lb({crouch:.46,lean:.42})}];
    arm=[{t:0,v:ca},{t:.13,v:{hand:{fn:neck},wAng:1.5,off:{fn:neck},tilt:.25},e:eOut},{t:.68,v:{hand:{fn:neck},wAng:1.6,off:{fn:neck},tilt:.45}}];}
  else if(kind==='clutch'){body=[{t:0,v:cb},{t:.22,v:lb({crouch:.68,lean:.45})},{t:.68,v:lb({crouch:.5,lean:.6})}];
    arm=[{t:0,v:ca},{t:.15,v:{hand:{fn:gut},wAng:1.5,off:{fn:gut},tilt:.3},e:eOut},{t:.68,v:{hand:{fn:gut},wAng:1.5,off:{fn:gut},tilt:.4}}];}
  else{body=[{t:0,v:cb},{t:.28,v:lb({crouch:.5,lean:.06})},{t:.75,v:lb({crouch:.42,lean:.22})}];
    arm=[{t:0,v:ca},{t:.3,v:{hand:{sh:[.12*a,.86*a]},wAng:1.4,off:{sh:[.04*a,.86*a]},tilt:.3},e:eOut}];}
  D.action={t0:S.t,end:.9,body,arm};
}
// every step: the bodies on blades, the releases, the fountains. A body further than IMPALE_GAP from the blade is not hung on it,
// and the hold never shifts it more than IMPALE_STEP in one step
// IMPALE_VMAX: the most speed a body on a blade can carry (a body dragged along a blade fights its own limbs, and the solver's
// corrections pile up as speed it would keep and let go all at once: it flew off the top of the screen)
const IMPALE_GAP=40,IMPALE_STEP=10,IMPALE_VMAX=420;
function impaleSolve(){
  for(const D of S.F){const im=D.impaled;if(!im)continue;if(S.t>im.until||im.A.wp.unarmed){D.impaled=null;continue;}
    const A=im.A,h=A.p[HAF],t=A.p[TIP],P=D.p[PEL],C=D.p[CHE],X={x:lerp(P.x,C.x,im.k),y:lerp(P.y,C.y,im.k)};
    const dx=t.x-h.x,dy=t.y-h.y,l2=dx*dx+dy*dy||1,u1=((X.x-h.x)*dx+(X.y-h.y)*dy)/l2;
    // the body stays about where the blade went in: it can't slide down onto the hilt or off the point
    if(im.u0==null){im.u0=clamp(u1,.35,.92);im.y0=X.y;
      // a blade that is not actually in him (the killing blow landed from an odd angle) does not drag the body over to it
      const q0={x:h.x+dx*im.u0,y:h.y+dy*im.u0};if(Math.hypot(q0.x-X.x,q0.y-X.y)>IMPALE_GAP){D.impaled=null;continue;}}
    const u=clamp(u1,im.u0-.1,im.u0+.08),Q={x:h.x+dx*u,y:h.y+dy*u};
    let cx=(Q.x-X.x)*im.soft,cy=(Q.y-X.y)*im.soft;
    {const m=Math.hypot(cx,cy);if(m>IMPALE_STEP){cx*=IMPALE_STEP/m;cy*=IMPALE_STEP/m;}}
    // carried, not flung: the shift moves the body without giving it speed, and never lifts it far
    if(X.y+cy<im.y0-im.lift)cy=Math.min(0,im.y0-im.lift-X.y);
    for(const q of [P,C]){q.x+=cx;q.y+=cy;q.px+=cx;q.py+=cy;}
    // the weight drags the blade down a little
    t.x-=cx*.08;t.y-=cy*.08;
    {const vm=IMPALE_VMAX*DT;for(const q of D.p){const vx=q.x-q.px,vy=q.y-q.py,v=Math.hypot(vx,vy);if(v>vm){q.px=q.x-vx*vm/v;q.py=q.y-vy*vm/v;}}}}
}
function finTick(){
  for(const f of S.F){
    if(f.finRelease&&S.t>=f.finRelease.at)releaseBlade(f);
    const ft=f.fountain;
    if(ft){if(S.t>ft.until||S.gore==='off'||S.warming){f.fountain=null;}
      else{const u=(S.t-ft.t0)/(ft.until-ft.t0),pulse=.55+.45*Math.sin((S.t-ft.t0)*13),P=f.p[PEL],C=f.p[CHE];
        let o,ang;
        if(ft.from==='stump'){o=C;ang=Math.atan2(C.y-P.y,C.x-P.x);}
        else{const h=f.p[HEAD];o={x:lerp(C.x,h.x,.45),y:lerp(C.y,h.y,.45)};ang=ft.ang;}
        if(Math.random()<(1-u*.6)*.9){const sp=((1-u)*230+50)*pulse,a=ang+(Math.random()-.5)*ft.spread;
          S.blood.push({x:o.x,y:o.y,d:f.dep+(Math.random()-.5)*4,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:.9+Math.random()*1.7,age:0});}}}
  }
}
// the blade comes out, or stays where it is
function releaseBlade(A){
  const R=A.finRelease;A.finRelease=null;if(!R)return;const D=R.D,wk=A.weaponKey;
  if(R.stuck&&!A.dead&&!A.wp.unarmed&&STUCK_WEAPON[wk]){makeStuck(A,D,R);return;}
  if(D.impaled&&D.impaled.A===A){D.impaled=null;
    if(S.gore!=='off'&&!S.warming){const P=D.p[PEL],C=D.p[CHE],k=R.F.type==='cleave'?.96:.62;bleed({x:lerp(P.x,C.x,k),y:lerp(P.y,C.y,k)},-A.facing,8,D.dep,.8);}}
}
// the weapon stays in the body, fixed to the torso at the angle it went in
function makeStuck(A,D,R){
  const wk=A.weaponKey,wp=A.wp,h=A.p[HAF],t=A.p[TIP],P=D.p[PEL],C=D.p[CHE];
  const L=Math.hypot(t.x-h.x,t.y-h.y)||1,ux=(t.x-h.x)/L,uy=(t.y-h.y)/L,k=D.impaled&&D.impaled.A===A?D.impaled.k:R.F.type==='cleave'?.96:.62;
  const X={x:lerp(P.x,C.x,k),y:lerp(P.y,C.y,k)},s=clamp((X.x-h.x)*ux+(X.y-h.y)*uy,4,wp.len-2);
  const ta=Math.atan2(C.y-P.y,C.x-P.x),ba=Math.atan2(uy,ux),mk=(x,y)=>({x,y,px:x,py:y,r:2,im:1,vx0:0,vy0:0});
  const side=A.sidearm==='drawn'&&wk==='dagger';
  const it={key:wk,owner:A.idx,dep:D.dep-.01,a:mk(h.x-ux*wp.butt,h.y-uy*wp.butt),b:mk(t.x,t.y),len:wp.len+wp.butt,stuck:{f:D.idx,k,rel:ba-ta,s,fixed:R.F.type==='pin'},h:{x:h.x,y:h.y},sidearm:side,wdes:A.wdes||null};
  S.items.push(it);D.impaled=null;
  // let go of the grip and the body topples back off the attacker, the weapon still in it
  const fa=A.facing;for(const i of [CHE,HEAD,ELF,ELB,HAF,HAB])D.p[i].px-=fa*70*DT;for(const i of [KNF,FTF,KNB,FTB])D.p[i].px+=fa*25*DT;
  if(side)A.sidearm='lost';else if(realWeapon(wk)&&!A.ownWeapon)A.ownWeapon=wk;
  A.setWeapon('fists');
  popup(A,'Stuck','#ffc163',`${wp.short} stuck in ${D.name}`,20,-30);S.hooks.sound('thud',200);
  S.hooks.stuck(R.ex,{A,D,key:wk});S.hooks.status();
}
function stuckStep(){
  for(const it of S.items){const st=it.stuck;if(!st)continue;const D=S.F[st.f];if(!D){it.stuck=null;continue;}
    if(st.fixed){it.dep=D.dep-.01;continue;}
    const P=D.p[PEL],C=D.p[CHE],X={x:lerp(P.x,C.x,st.k),y:lerp(P.y,C.y,st.k)},ta=Math.atan2(C.y-P.y,C.x-P.x),wp=WEAPONS[it.key];
    // the point may go on into the ground under the body, but the grip never does: if the body rolls onto it, the weapon levers round
    const clear=a=>{const bx=X.x-Math.cos(a)*(st.s+wp.butt),by=X.y-Math.sin(a)*(st.s+wp.butt);return by<=S.arena.ground(bx,D.dep)-3;};
    let ba=ta+st.rel;
    if(!clear(ba)){for(let d=.06;d<3.2;d+=.06){if(clear(ba+d)){ba+=d;break;}if(clear(ba-d)){ba-=d;break;}}st.rel=ba-ta;}
    const ux=Math.cos(ba),uy=Math.sin(ba),h={x:X.x-ux*st.s,y:X.y-uy*st.s};
    it.a.x=it.a.px=h.x-ux*wp.butt;it.a.y=it.a.py=h.y-uy*wp.butt;it.b.x=it.b.px=h.x+ux*wp.len;it.b.y=it.b.py=h.y+uy*wp.len;
    it.h=h;it.dep=D.dep-.01;}
}
function stuckIn(f){return S.items.find(it=>it.stuck&&it.owner===f.idx&&(it.key===f.ownWeapon||it.sidearm))||null;}

// ---------- the sidearm ----------
// a dagger in a scabbard at the back of Kael's hip, in the torso's frame
function sheathPts(f){
  const P=f.p[PEL],C=f.p[CHE],dx=C.x-P.x,dy=C.y-P.y,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,fx=-uy*f.facing,fy=ux*f.facing;
  const pt=(a,b)=>({x:P.x+ux*a+fx*b,y:P.y+uy*a+fy*b});
  return{pommel:pt(10,-3),grip:pt(5,-5),guard:pt(2,-6.5),tip:pt(-15,-20),cross:[pt(4,-9),pt(0,-4)]};
}
function canDraw(A){return A.sidearm==='sheathed'&&!A.dead&&!A.downed&&!A.clinch&&(A.wp.unarmed||A.wp.improv);}
function planDraw(A){
  const a=A.arm,T1=.17,T2=.44,Tend=.72,grip=()=>sheathPts(A).grip;
  const body=[{t:0,v:{...A.curBody}},{t:T1,v:()=>({...A.guardBody(),lean:A.guardBody().lean+.08,crouch:A.guardBody().crouch-.03})},{t:Tend,v:()=>A.guardBody(),e:sstep}];
  const arm=[{t:0,v:{...A.curArm}},{t:T1,v:{hand:{fn:grip},wAng:1.9,off:{sh:[.32*a,.12*a]},tilt:.05},e:eOut},{t:T2,v:()=>A.guardArm(),e:eOut},{t:Tend,v:()=>A.guardArm()}];
  return{att:{t0:S.t,end:Tend,body,arm},Tend:Tend+.05,events:[{t:T1+.02,fn:()=>drawSidearm(A)}],dash:0,strikeX:A.station,Cfn:grip};
}
function drawSidearm(A){
  if(A.sidearm!=='sheathed')return;
  if(!A.wp.unarmed)dropWeapon(A,-A.facing,false);
  A.setWeapon('dagger');A.sidearm='drawn';
  const h=A.p[HAF],t=A.p[TIP];t.x=t.px=h.x-A.facing*4;t.y=t.py=h.y+A.wp.len*.95;
  popup(A,'Dagger drawn','#ffd9a8',null,19,-26);S.hooks.sound('clang',.4);S.hooks.status();
}
// ===== FINISHERS END =====
