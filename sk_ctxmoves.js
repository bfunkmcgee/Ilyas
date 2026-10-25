// ===== MOVES START =====
// The contextual moves that need their own motion or their own roll: the back thrust, the stop-thrust's beat and set spear, the
// chair kick and the bottle throw. Which command becomes which move, and what it does to the dice, is in sk_core.js (MOVES).

// ---------- the stop-hit ----------
// what the stop-hit opening carries in: the closer's beat and the spearman's set spear
function stopInfo(o){return{beat:o&&o.ex&&o.ex.approach?o.ex.approach.beat||0:0,setSpear:!!(o&&o.f&&o.f.setSpear)};}
function stopTech(T,D,s){const bt=(s&&s.beat)||0,ss=!!(s&&s.setSpear);
  return{...T,name:ss?'Set spear':'Stop-thrust',stop:true,beaten:bt,setSpear:ss,move:T.move||ss||bt>0,
    knock:(T.knock||1)*(bt?MOVES.beatKnock:1)*(ss?MOVES.setSpear.knock:1),
    why:ss?`The spear was set and waiting: ${D.name} runs straight onto the point, at +${MOVES.setSpear.acc} and twice the knockback.`
      :bt?`${D.name} beats the point aside on the way in: the stop-hit still comes, at −${bt}, and barely moves him.`
      :`${D.name} runs onto the point of the longer weapon.`};}

// ---------- the back thrust ----------
// the body stays turned to the man in front; the hand drives back past the hip and the point goes in behind
function planBackThrust(A,D,res,T){
  const dir=Math.sign(D.station-A.station)||-A.facing,fa=A.facing,a=A.arm,wp=A.wp,out=res.out,sp=lerp(1.15,.85,A.sk),land=out==='hit'||out==='crit';
  const Tc=.2*sp,Timp=Tc+.12*sp,Td=Timp+.07,Tr=Td+.34,Tend=Tr+.3;
  const anchor=anchorFor(D,T,'thrust');let Cfn=anchor;
  if(!land){const M=anchor();Cfn=out==='block'?(()=>({x:M.x-dir*(14+D.body.bulk*4),y:M.y-2})):(()=>({x:M.x-dir*6,y:M.y-(out==='dodge'?10:0)}));}
  const sh=A.p[CHE],C0=Cfn(),reachIn=wp.len*(land?.92:.85);
  // a step back toward him when the arm and blade would come up short
  const step=Math.min(34,Math.max(0,Math.abs(C0.x-sh.x)-(a*.85+reachIn)));
  const theta=Math.atan2(C0.y-sh.y,fa*(C0.x-(sh.x+dir*step)));
  const impHand={fn:()=>{const C=Cfn();return{x:C.x-fa*Math.cos(theta)*reachIn,y:C.y-Math.sin(theta)*reachIn};}};
  const armK=armKeys(A,[[0,'now'],[Tc,'backThrustCock',eOut],[Timp,'backThrust',{hand:impHand,wAng:theta},eIn],[Td,'backThrust',{hand:impHand,wAng:theta}],[Tr,'guard',sstep],[Tend,'guard']]);
  const at=A.station+dir*step;
  const body=bodyKeys(A,[[0,'now'],[Tc,'backThrustCock',eOut],[Timp,'backThrust',{px:at},eIn],[Td,'backThrust',{px:at}],[Tr,'guard',sstep],[Tend,'guard']]);
  // the defender sees a blade coming along the line from Kael toward him
  const th2=Math.PI-theta,react=planReaction(D,A,'thrust',res,Timp,Cfn,th2,mulberry32(res.seed),false,dir);
  const tip=A.p[TIP],events=[{t:Tc+.02,fn:()=>S.hooks.sound('swoosh',wp.mass)},...(react.evs||[])];
  if(out==='fumble')events.push({t:Td+.05,fn:()=>{A.motor=Math.min(A.motor,.28);spendFoot(A,FOOT_HIT);popup(A,'Fumble','#c9d0f5',null,20);const ex=S.game.ex;if(ex)considerOpening(ex,D,A,'fumble');}});
  S.callouts.push({i:A.idx,text:T.name,age:0,life:clamp(Timp+.3,.75,1.2),dx:-fa*20});
  return{att:{t0:S.t,end:Tend,body,arm:armK,swing:true},react,Timp,Td,Tend,strikeX:A.station,Cfn,contactSeg:()=>[A.p[HAF],A.p[TIP]],
    contactVel:()=>({x:(tip.x-tip.px)/DT,y:(tip.y-tip.py)/DT}),dash:Math.round(step),theta:th2,events,tWind:Tc,vault:false,around:false,slip:react.slip??null,dir,sec:null};}

// ---------- kick the chair ----------
// your d20 and skill against 9 and his skill; his footing and a limp count, a raised guard does not stop a chair in the legs
function kickMods(A,D,P){
  const mods=[['skill',A.skill],['kicked '+PROP[P.type].name,1],[footLabel(A),post(A).atk],['dazed',A.daze?-2:0],['outclassed',outclassMod(A,D)]];
  const defMods=[[post(D).name.toLowerCase(),post(D).resist],['limp',-D.wounds.leg],['dazed',D.daze?-2:0]];
  return{mods,bonus:sumMods(mods),dc:9+D.skill+sumMods(defMods),defMods};}
function launchKick(A,D,ex,sv){
  const r=rollVs(kickMods(A,D,sv.P),{kind:'kick',prop:sv.P.type});
  A.guarding=false;A.circleGuard=false;engage(A,D);beginAction(A,'shove',null,{foot:MOVES.kickFoot});
  const plan=planKick(A,D,sv,r);A.action=plan.att;D.action=plan.react;
  ex.res=r;ex.plan=plan;ex.dur=plan.Tend;ex.perf={dash:Math.round(plan.dash)};ex.kick=sv.P;}
function planKick(A,D,sv,r){
  const P=sv.P,fa=sv.fa,leg=A.leg,spd=lerp(1.15,.85,A.sk),x0=A.station,z0=A.dep;
  A.facing=fa;
  // step up until the lead foot meets the near side of it
  const want=P.box.cx-fa*(leg*.72+6),lo=Math.min(x0-fa*20,x0+fa*40),hi=Math.max(x0-fa*20,x0+fa*40),sx=clampSt(A,clamp(want,lo,hi),A.lane);
  const zk=clamp(A.lane+clamp(P.dep-A.lane,-14,14),DEP_MIN,DEP_MAX),dist=Math.hypot(sx-x0,(zk-z0)*.9);
  const tApp=dist<6?0:clamp(dist/300,.12,.4),Tl=tApp+.14*spd,Timp=Tl+.1*spd,Td=Timp+.06,Tr=Td+.3,Tend=Tr+.32;
  const v=r.ok?(r.crush?540:440):370,tFly=clamp((sv.beyond-24)/v,.06,.42),Thit=Timp+tFly;
  A.station=sx;
  const hitPt=()=>{const b=P.box;return{x:b.cx-fa*((b.r-b.l)*.5-2),y:lerp(b.t,b.b,.55)};};
  const at={px:sx,pz:zk},hit={px:sx+fa*4,pz:zk,kick:{fn:hitPt}};
  const body=bodyKeys(A,[[0,'now',{pz:z0}],...(tApp?[[tApp,'guard',at,sstep]]:[]),[Tl,'kickCock',at,eOut],[Timp,'kickProp',hit,eIn],[Td,'kickPropHold',hit],[Tr,'guard',at,sstep],[Tend,'guard',sstep]]);
  const armK=armKeys(A,[[0,'now'],[Tl,'kickProp',eOut],[Tr,'guard',sstep],[Tend,'guard']]);
  // the one in its path: legs taken out from under him, or a quick step that lets it go by
  const react={t0:S.t,end:Thit+.6,body:bodyKeys(D,[[0,'now'],[Math.max(.05,Thit-.18),'guard'],r.ok?[Thit+.04,'legsTaken',eOut]:[Thit,'letItBy',eOut],[Thit+.6,'guard',sstep]]),
    arm:armKeys(D,[[0,'now'],[Thit+.6,'guard',sstep]])};
  const events=[{t:Tl+.02,fn:()=>S.hooks.sound('swoosh',.8)},{t:Timp,fn:()=>kickLaunch(A,P,fa,v)},{t:Thit,fn:()=>kickHit(A,D,P,fa,r)}];
  S.callouts.push({i:A.idx,text:'Kick the '+PROP[P.type].name,age:0,life:clamp(Timp+.35,.75,1.3),dx:-fa*22});
  return{att:{t0:S.t,end:Tend,body,arm:armK},react,Tend:Math.max(Tend,Thit+.45),events,dash:dist,strikeX:sx,Cfn:hitPt};}
// the foot lands: the chair (or stool, or cart) goes skidding and hopping at him
function kickLaunch(A,P,fa,v){if(P.broken)return;
  for(const q of P.pts){q.px=q.x-fa*v*DT;q.py=q.y+150*DT;}P.sleep=0;P.kicked={by:A.idx,t:S.t};
  if(P.type==='cart')kickWares(P,fa,1.3);
  dust(P.box.cx,P.box.b,.8,P.dep);S.hooks.sound('thud',240);}
function kickHit(A,D,P,fa,r){
  const ex=S.game.ex;
  if(D.dead||D.downed){S.hooks.kick(ex,{ok:false,void:true,P});return;}
  if(r.ok){knockBalance(D,MOVES.kickFootHit,A);D.ready+=MOVES.kickTempo;D.motor=Math.min(D.motor,.55);
    for(const i of [KNF,FTF,KNB,FTB]){const q=D.p[i];q.px-=fa*150*DT;}for(const i of [CHE,HEAD]){const q=D.p[i];q.px+=fa*90*DT;}
    const nm=PROP[P.type].name;
    if(r.crush){knockDown(D);popup(D,'Tripped','#ffd9a8','over the '+nm,20,-40);}
    else popup(D,'Into his legs','#ffd9a8',`−${MOVES.kickFootHit} balance, +${MOVES.kickTempo} tempo`,19,-40);
    S.hooks.sound('thud',320);S.shake=Math.max(S.shake,r.crush?6:3);}
  else popup(D,'Steps past it','#a5dcff',null,19,-40);
  S.hooks.kick(ex,{ok:r.ok,crush:r.crush,P,down:D.downed});S.hooks.status();}

// ---------- the bottle throw ----------
// your d20 and skill against 10 and his skill; a raised guard bats it away (+2) and so does good footing
function bottleMods(A,D){const g=Math.abs(D.station-A.station);
  const mods=[['skill',A.skill],[footLabel(A),post(A).atk],['long throw',g>MOVES.bottleLong?-1:0],['dazed',A.daze?-2:0],['outclassed',outclassMod(A,D)]];
  const defMods=[['guard',D.guarding?2:0],[post(D).name.toLowerCase(),post(D).def],['dazed',D.daze?-2:0]];
  return{mods,bonus:sumMods(mods),dc:10+D.skill+sumMods(defMods),defMods};}
// a tankard or bottle from the table becomes a loose thing he can carry and throw
function takeBottle(sv){
  if(sv.src==='prop'){const T=S.table,q=sv.ref;T.props=T.props.filter(x=>x!==q);
    const it={kind:sv.what,x:q.x,y:q.y,px:q.x,py:q.y,r:WARE[sv.what].r,im:3,vx0:0,vy0:0,ang:q.ang||0,spin:0,dep:T.dep,host:null,rest:0,lit:false,gone:false,sil:true};
    S.wares.push(it);return it;}
  const it=sv.ref;it.host=null;it.rest=0;return it;}
function launchBottle(A,D,ex,sv){
  const r=rollVs(bottleMods(A,D),{kind:'bottle',what:sv.what});
  r.dmg=r.ok?Math.max(1,Math.round(((sv.what==='mug'?1:2)+1+Math.floor(S.rng()*4)+(r.crush?3:0))*(A.hench?CREW.dmg:1))):0;
  const it=takeBottle(sv);A.guarding=false;A.circleGuard=false;faceToward(A,D.station);beginAction(A,'shove',null,{foot:MOVES.bottleFoot});
  const plan=planBottleThrow(A,D,it,r);A.action=plan.att;D.action=plan.react;
  ex.res=r;ex.plan=plan;ex.dur=plan.Tend;ex.perf={dash:Math.round(plan.dash)};ex.bottle=it;}
function planBottleThrow(A,D,it,r){
  const fa=Math.sign(D.station-A.station)||A.facing,a=A.arm,sp=lerp(1.15,.85,A.sk),x0=A.station,z0=A.dep;
  A.facing=fa;
  // a short step toward it if it is past arm's length
  const dx=it.x-x0,bx=clampSt(A,x0+clamp(dx-Math.sign(dx||fa)*a*.55,-40,40),A.lane),bz=clamp(lerp(A.lane,it.dep,.5),DEP_MIN,DEP_MAX);
  const reach=Math.hypot(bx-x0,(bz-z0)*.9),Tg=clamp(reach/300,.16,.4)+.06*sp,Tw=Tg+.22*sp,Trel=Tw+.13*sp;
  const H=D.p[HEAD],dist=Math.hypot(H.x-it.x,H.y-it.y),Tfl=clamp(dist/MOVES.bottleSpeed,.2,.6),Timp=Trel+Tfl,Tend=Math.max(Trel+.55,Timp+.4);
  A.station=bx;
  const at={px:bx,pz:bz},out={px:bx+fa*6,pz:bz};
  const body=bodyKeys(A,[[0,'now',{pz:z0}],[Tg,'bottleReach',at,eOut],[Tw,'bottleWind',at,sstep],[Trel,'bottleThrow',out,eIn],[Trel+.2,'bottleFollow',out],[Tend,'guard',sstep]]);
  const armK=armKeys(A,[[0,'now'],[Tg,'guard',{off:{fn:()=>({x:it.x,y:it.y})}},eOut],[Tw,'bottleWind',sstep],[Trel,'bottleThrow',eIn],[Trel+.16,'bottleFollow',eOut],[Tend,'guard',sstep]]);
  it.carry={A:A.idx,from:S.t+Tg};
  // the one it is thrown at: a duck under it, or the head snapping back
  const rb=r.ok?[[Math.max(.05,Timp-.12),'guard'],[Timp+.05,'bottleHit',eOut]]:[[Math.max(.05,Timp-.24),'guard'],[Timp,'bottleDuck',eOut],[Timp+.28,'bottleDuckHold']];
  const react={t0:S.t,end:Timp+.6,body:bodyKeys(D,[[0,'now'],...rb,[Timp+.6,'guard',sstep]]),arm:armKeys(D,[[0,'now'],[Timp+.6,'guard',sstep]])};
  const events=[{t:Tg,fn:()=>S.hooks.sound('clang',.15)},
    {t:Trel,fn:()=>{const h=A.p[HAB];it.carry=null;it.x=it.px=h.x;it.y=it.py=h.y;it.fly={t0:S.t,T:Tfl,x0:h.x,y0:h.y,d0:it.dep,hit:r.ok,D:D.idx,h:clamp(dist*.1,10,34),dir:fa};S.hooks.sound('swoosh',.5);}},
    {t:Timp,fn:()=>bottleArrive(A,D,r,it,fa)}];
  S.callouts.push({i:A.idx,text:it.kind==='mug'?'Tankard throw':'Bottle throw',age:0,life:clamp(Trel+.4,.75,1.3),dx:-fa*22});
  return{att:{t0:S.t,end:Tend,body,arm:armK},react,Tend:Tend+.05,events,dash:reach,strikeX:bx,Cfn:()=>({x:D.p[HEAD].x,y:D.p[HEAD].y})};}
// where it is headed: his head, or just over it when it is going to miss
function missileTarget(f,D){if(!D)return{x:f.x0+f.dir*200,y:f.y0};const H=D.p[HEAD];return f.hit?{x:H.x,y:H.y}:{x:H.x+f.dir*26,y:H.y-30};}
// a carried or flying bottle is moved here, not by the physics
function missileStep(){
  if(!S.wares.length)return;
  for(const it of S.wares){if(it.gone)continue;
    if(it.carry){const A=S.F[it.carry.A];if(!A||A.dead||A.downed){it.carry=null;it.rest=0;continue;}if(S.t<it.carry.from)continue;
      const h=A.p[HAB];it.px=it.x;it.py=it.y;it.x=h.x;it.y=h.y-2;it.dep=A.dep+2;it.ang=-.5*A.facing;continue;}
    if(it.fly){const f=it.fly,D=S.F[f.D],u=clamp((S.t-f.t0)/f.T,0,1),tg=missileTarget(f,D);
      it.px=it.x;it.py=it.y;it.x=lerp(f.x0,tg.x,u);it.y=lerp(f.y0,tg.y,u)-4*f.h*u*(1-u);it.dep=lerp(f.d0,D?D.dep:f.d0,u);it.ang+=f.dir*.3;}}}
V11.step.push(missileStep);
function bottleArrive(A,D,r,it,fa){
  const ex=S.game.ex;it.fly=null;it.rest=0;
  if(!r.ok||D.dead){if(!D.dead)popup(D,'Ducks it','#c9d0f5',null,20,-30);S.hooks.bottle(ex,{ok:false,what:it.kind});S.hooks.status();return;}
  const H=D.p[HEAD];D.hp=Math.max(0,D.hp-r.dmg);
  // the head snaps back; a bottle breaks on it, a tankard bounces off
  H.px-=fa*150*DT;H.py+=30*DT;D.motor=Math.min(D.motor,.6);
  if(it.kind==='mug'){it.x=H.x-fa*6;it.y=H.y;it.px=it.x+fa*1.8;it.py=it.y+1.4;it.spin=.5;S.hooks.sound('clang',.6);}
  else{it.x=H.x;it.y=H.y;smashWare(it,fa);}
  flash(H,22,'#ffffff',D.dep);sparks(H,8,'#e8f6f8',D.dep);impactFeel(A,{dmg:r.dmg,out:r.crush?'crit':'hit'},fa,'hit');
  if(D.hp<=0){D.finName=it.kind==='mug'?'Tankard to the head':'Bottled';kill(D,fa);}else D.daze=1;
  popup(D,String(r.dmg),r.crush?'#ffd36b':'#ffffff',D.dead?'Out':'Dazed',r.crush?30:26);
  S.hooks.sound('hit',r.dmg);S.hooks.bottle(ex,{ok:true,dmg:r.dmg,dead:D.dead,what:it.kind,crush:r.crush});S.hooks.status();}

// ---------- the AI ----------
// what the moment offers before the usual attack weights: kick the chair, throw the bottle, shoulder check, set the spear, beat the point
function moveChoice(A,D,ok,r,foot){
  if(!D||D.dead||D.downed||A.clinch||A.downed)return null;
  const sv=ok('shove')?shoveVariant(A,D):null;
  if(sv&&foot>=1){
    if(sv.kind==='kick'&&r()<(A.temper==='brute'||A.temper==='rusher'?.45:.3))return'shove';
    if(sv.kind==='bottle'&&r()<(A.team===1?.3:.22))return'shove';
}
  if(A.team===1&&A.weaponKey==='spear'&&foot>=2&&!A.counter&&setSpearOK(A)&&r()<(A.temper==='keeper'?.45:.25))return'wait';
  // his spear is set: don't run onto it. Draw it with a feint, beat the point on the way in, or wait it out
  if(D.setSpear&&stopHitFor(A,D,'thrust')&&r()<.7){if(ok('feint')&&foot>=2&&r()<.5)return'feint';
    const ai=ok('advance')?advanceInfo(A,D):null;if(ai&&beatPoint(A,D)&&!ai.vault&&!ai.around&&r()<.4)return'advance';return ok('guard')?'guard':null;}
  if(beatPoint(A,D)&&foot>=2&&ok('advance')&&outreaches(D,A)){const ai=advanceInfo(A,D);
    if(ai&&!ai.vault&&!ai.around&&stopHitFor(A,D,'advance',ai.x)&&r()<.4)return'advance';}
  return null;}
// an attack that becomes one of the moves is worth more. A man off balance can also be floored with a shoulder check: it joins the
// pick as one more way to put him down, beside the Sweep and the Overhead that already weigh more against him
function moveWeights(A,D,w,sT,ok){
  if(!D||D.downed)return;
  // for the enemies it takes its share from the Sweep and the Overhead, so a man off balance is not put down any more often than before
  if(ok&&ok('shove')&&A.foot>=2){const v=shoveVariant(A,D);if(v&&v.kind==='shoulder'&&shoveChance(A,D,false)>=.5){
    if(A.team===1){w.shove=2;w.sweep=Math.max(.3,w.sweep-1);w.overhead=Math.max(.3,w.overhead-1);}else w.shove=5;}}
  const Tt=pickTechnique(A,D,'thrust'),To=pickTechnique(A,D,'overhead'),Tw=pickTechnique(A,D,'sweep');
  if(Tt.backT)w.thrust+=4;if(Tt.beat)w.thrust+=3;if(Tt.pinWall)w.thrust+=2;
  if(sT.haftCut)w.slash+=4;if(sT.beard)w.slash+=3;if(sT.lashDisarm)w.slash+=1;
  if(To.murder)w.overhead+=1;
  if(Tw.snare&&D.posture!=='set')w.sweep+=3;if(Tw.hamstring)w.sweep+=2.5;}
// the next enemy to act before A's turn, when his shown plan is a shoulder check on A (A off balance)
function shoulderThreat(A){if(!A||A.dead||A.downed||A.posture!=='off')return null;const ord=turnOrder(8);let i=ord[0]===A.idx?1:0;
  for(;i<ord.length;i++){const k=ord[i];if(k===A.idx)return null;const E=S.F[k];if(!E||E.dead||E.team===A.team)continue;
    const it=E.intent;return it&&it.cmd==='shove'&&targetOf(E)===A&&cmdValid(E,A,'shove')&&(shoveVariant(E,A)||{}).kind==='shoulder'?E:null;}
  return null;}
// the footing a shove costs when it becomes a kick or a throw (one pip, not two); used by the previews
function shoveTech(A,D,op){const v=shoveVariant(A,D,op);return v&&(v.kind==='kick'||v.kind==='bottle')?{foot:v.kind==='kick'?MOVES.kickFoot:MOVES.bottleFoot}:null;}
function kickChance(A,D,P){return chanceOf(kickMods(A,D,P));}
function bottleChance(A,D){return chanceOf(bottleMods(A,D));}
// the name a command takes this turn when it becomes one of the moves (null when it doesn't)
function moveName(A,D,k){
  if(!A||!D||A.dead||A.downed||A.clinch)return null;
  if(ATTACKS.includes(k)){if(D.downed)return null;const T=pickTechnique(A,D,k);return T.move?T.name:null;}
  if(k==='shove'){const v=shoveVariant(A,D);return!v?null:v.kind==='kick'?'Kick the '+PROP[v.P.type].name:v.kind==='bottle'?(v.what==='mug'?'Tankard throw':'Bottle throw'):'Shoulder check';}
  if(k==='wait')return setSpearOK(A)?'Set the spear':null;
  if(k==='advance'){const ai=advanceInfo(A,D);return ai&&!ai.vault&&!ai.around&&stopHitFor(A,D,'advance',ai.x)&&beatPoint(A,D)?'Beat the point':null;}
  return null;}
// ===== MOVES END =====
