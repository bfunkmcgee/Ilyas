// ===== BEASTS IN THE FIGHT =====
// What the beasts of the old line do that men do not. A goblin is small and light: a blow throws it a long way, a cutting blow
// that kills it takes it in half (two bodies, each half its own ragdoll), and Kael can pick one up by the scruff and throw it,
// best of all into another. The lizard-man fights with his tail as well as his glaive: he turns on the spot and it comes round at
// the shins (a Tail sweep) or the body (a Tail whip). A tail blow that misses leaves him turned half round with the tail lying
// out behind him, and Kael can take it off; the piece goes on writhing on the floor and he has no tail to fight with after.
// The tail is a chain of points run here every step (the painter draws it as it is), so the game and the picture agree on where
// it is when it hits and where it is cut.

// ---------- the lizard's tail ----------
// its numbers are the painter's: N links over half his height, rooted at the small of his back; w: root and tip width and how it
// tapers (size units); cut: the link the tail comes off at (a stump of three links of eight)
const TAIL={N:8,len:.5,root:[-.02,-7.4],w:[19,1.2,.85],cut:3};
function beastSz(f){const b=f.body;return(b.h||1)*(.93+.07*(b.bulk||1))*(f.beast==='lizard'?1:1.08);}
function tailW(f,t){return beastSz(f)*lerp(TAIL.w[0],TAIL.w[1],Math.pow(clamp(t,0,1),TAIL.w[2]));}
function tailLen(f){return(f.body.tall||210)*TAIL.len;}
function hasTail(f){return!!f&&f.beast==='lizard'&&!f.gone;}
function tailIntact(f){return hasTail(f)&&!(f.tail&&f.tail.cut!=null);}
// the frame it hangs in: the root, 'back' away from where he faces and 'down' along the spine toward the hips
function tailFrame(f){const p=f.p,P=p[PEL],C=p[CHE],dx=C.x-P.x,dy=C.y-P.y,T=Math.hypot(dx,dy)||1,ux=dx/T,uy=dy/T,fa=f.facing,nx=-uy*fa,ny=ux*fa,sz=beastSz(f);
  return{root:{x:P.x+ux*T*TAIL.root[0]+nx*TAIL.root[1]*sz,y:P.y+uy*T*TAIL.root[0]+ny*TAIL.root[1]*sz},bx:-nx,by:-ny,dx:-ux,dy:-uy};}
// through a tail blow: coiled up behind him while he crouches into the turn, out straight as he comes round (down to the floor at
// the shins for a sweep, level at the hips for a whip), then let go back to rest
function tailPose(f,fr,L0){const A=f.tailAct;if(!A)return null;const t=S.t;if(t>=A.te||f.dead){f.tailAct=null;return null;}
  if(t<A.t0)return null;
  const h=Math.max(8,f.gr(fr.root.x)-fr.root.y),strike=A.low?Math.asin(clamp((h-10)/L0,0,.92)):-.05,coil=i=>-.32-.8*Math.pow(i/TAIL.N,1.2);
  if(t<A.tw){const u=clamp((t-A.t0)/Math.max(.01,A.tw-A.t0),0,1);return{w:sstep(u),a:coil,k:1+2*u,g:.6};}
  if(t<A.ti){const e=sstep(clamp((t-A.tw)/Math.max(.01,A.ti-A.tw),0,1));return{w:1,a:i=>lerp(coil(i),strike,e),k:4,g:.35};}
  const u=clamp((t-A.ti)/Math.max(.01,A.te-A.ti),0,1);return{w:1-sstep(clamp((u-.3)/.7,0,1)),a:()=>strike,k:lerp(4,1,u),g:lerp(.35,1,u)};}
// one step of the chain (the painter's own tail, run here): each link pulled toward its place in the pose, swinging with him,
// lying along the floor; a dead or fallen lizard's tail goes slack
function tailSim(f){
  if(!hasTail(f))return;
  const fr=tailFrame(f),N=TAIL.N,L0=tailLen(f),seg=L0/N,old=f.tail,cut=old&&old.cut!=null?old.cut:null,keep=cut!=null?cut:N,pose=tailPose(f,fr,L0);
  const targ=[fr.root];let pos=fr.root;
  for(let i=1;i<=keep;i++){let a=.12+.62*Math.pow(i/N,1.15);if(pose)a=lerp(a,pose.a(i),pose.w);
    const c=Math.cos(a),s=Math.sin(a);pos={x:pos.x+(fr.bx*c+fr.dx*s)*seg,y:pos.y+(fr.by*c+fr.dy*s)*seg};targ.push(pos);}
  let st=old;
  if(!st||!st.q||st.q.length!==keep+1||!Number.isFinite(st.q[keep].x)||Math.hypot(st.q[0].x-fr.root.x,st.q[0].y-fr.root.y)>L0*.8)
    st=f.tail={q:targ.map(t=>({x:t.x,y:t.y,px:t.x,py:t.y})),N,cut};
  const q=st.q,slack=f.dead||f.downed||f.motor<.3,stiff=(slack?.035:1)*(pose&&!slack?pose.k:1),grav=(slack?760:520)*(pose&&!slack?pose.g:1),h=DT;
  q[0].px=q[0].x;q[0].py=q[0].y;q[0].x=fr.root.x;q[0].y=fr.root.y;
  for(let i=1;i<=keep;i++){const p=q[i],T=targ[i],kk=lerp(260,30,i/N)*stiff,vx=(p.x-p.px)*.982,vy=(p.y-p.py)*.982;p.px=p.x;p.py=p.y;
    p.x+=vx+(T.x-p.x)*kk*h*h;p.y+=vy+(T.y-p.y)*kk*h*h+grav*h*h;}
  for(let it=0;it<3;it++)for(let i=1;i<=keep;i++){const a=q[i-1],b=q[i],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1e-6,k=(d-seg)/d;
    if(i===1){b.x-=dx*k;b.y-=dy*k;}else{a.x+=dx*k*.5;a.y+=dy*k*.5;b.x-=dx*k*.5;b.y-=dy*k*.5;}}
  for(let i=1;i<=keep;i++){const p=q[i],g=f.gr(p.x)-tailW(f,i/N)*.45;if(p.y>g){p.y=g;p.px=lerp(p.px,p.x,.35);}}
  // the stump bleeds for a while after the cut
  if(f.tailBleed&&cut!=null&&S.t<f.tailBleed.until&&S.gore!=='off'&&!S.warming){const e=q[keep],b=q[keep-1],u=1-(f.tailBleed.until-S.t)/1.8;
    if(Math.random()<(1-u)*.7){const a=Math.atan2(e.y-b.y,e.x-b.x)+(Math.random()-.5)*.7,sp=(1-u)*170+30;
      S.blood.push({x:e.x,y:e.y,d:f.dep+(Math.random()-.5)*4,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:.9+Math.random()*1.6,age:0});}}
}
// a point on the chain (i links out from the root), where it is now; before the chain has run, where it would rest
function tailPt(f,i){const q=f.tail&&f.tail.q;if(q&&q[i])return q[i];
  const fr=tailFrame(f),seg=tailLen(f)/TAIL.N;let pos=fr.root;
  for(let j=1;j<=i;j++){const a=.12+.62*Math.pow(j/TAIL.N,1.15),c=Math.cos(a),s=Math.sin(a);pos={x:pos.x+(fr.bx*c+fr.dx*s)*seg,y:pos.y+(fr.by*c+fr.dy*s)*seg};}
  return pos;}
// a spinning fighter is drawn turned about the middle of his body at an even rate (the painter's yaw is the spin's own turn): what
// lies down the middle of him, as the tail does, shows on the screen mid-turn this far across from it
function spinSx(f){const sp=f.spin;if(!sp||S.t<sp.t0||S.t>sp.t1)return 1;const c=Math.cos((S.t-sp.t0)/(sp.t1-sp.t0)*TAU);return c>=0?Math.max(.07,c):Math.min(-.07,c);}
function drawnX(f,x){const sx=spinSx(f);if(sx===1)return x;const px=(f.p[PEL].x+f.p[CHE].x)/2;return px+sx*(x-px);}

// ---------- tail blows ----------
// a Sweep is always the tail while he has one; a Slash is the tail when the lizard's own choice made it a whip (A.tailNext)
function tailBlow(A,D,kind){return!!A&&A.beast==='lizard'&&tailIntact(A)&&!!D&&!D.downed&&!A.clinch&&(kind==='sweep'||(kind==='slash'&&A.tailNext==='whip'));}
function tailTech(A,D,kind){const low=kind==='sweep',dn=D?D.name:'him';
  return{kind,key:low?'tailsweep':'tailwhip',name:low?'Tail sweep':'Tail whip',
    why:low?`${A.name} turns on the spot and his tail comes round low at ${dn}'s shins: anyone Committed or worse goes down. If it misses, he is left with his back turned and the tail out.`
      :`${A.name} spins and the tail whips round at the body. It hits like a swinging beam and throws ${dn} back. If it misses, he is left with his back turned and the tail out.`,
    tags:['Tail'],acc:low?0:-1,dmg:low?1.25:1,along:null,ang:null,amp:1,overlap:0,reach:null,anchor:low?'shin':'belly',kick:false,vault:false,around:null,rising:false,descend:false,
    windCap:null,passing:false,flair:'tail',multi:null,knock:low?1:1.9,kdEase:low?3:0,tail:true,low,dice:low?[2,8,10]:[2,6,8],zone:low?'leg':'body'};}
function planTail(A,D,kind,res,opts){
  const T=res.tech,low=!!T.low,fa=Math.sign(D.station-A.station)||A.facing,out=res.out,sk=A.sk,leg=A.leg,arm=A.arm,snap=!!opts.snap;
  A.facing=fa;
  const z0=A.dep,zS=strikeLane(A,D,kind);A.lane=zS;
  const rnd=mulberry32(res.seed),jit=4,{Cfn}=contactFor(A,D,T,kind,out,fa,(rnd()*2-1)*jit,(rnd()*2-1)*jit);
  // where he turns: far enough off that the outer half of the tail, coming round, crosses the target
  const L0=tailLen(A),startX=snap?A.curBody.px:A.station;
  let strikeX=D.station-fa*L0*(low?.8:.86);
  const lim=D.station-fa*(30+(A.body.bulk+D.body.bulk)*9);if((strikeX-lim)*fa>0)strikeX=lim;
  const back=startX-fa*34;if((strikeX-back)*fa<0)strikeX=back;
  strikeX=clampSt(A,strikeX,zS);
  const dist=Math.hypot(strikeX-startX,(zS-z0)*.9),run=lerp(240,330,sk),T1=dist>=14?clamp(dist/run,.16,1.1):0;
  const tW=.24*lerp(1.2,.85,sk)*(opts.quick?.75:1),tS=lerp(.62,.5,sk);
  const Ts0=T1+tW,Timp=Ts0+tS*.5,Td=Timp+.06,Ts1=Ts0+tS,Tr=Ts1+.3,Tend=Tr+.25;
  const st=(x,y)=>({stF:x*leg,stB:y*leg}),gB=()=>A.guardBody(),gA=()=>A.guardArm(),cr=low?.6:.72;
  const body=[{t:0,v:snap?{...A.curBody,pz:z0}:()=>({...A.guardBody(),pz:z0})}];
  if(T1>0)body.push({t:T1,v:{px:strikeX-fa*4,pz:zS,crouch:.84,lean:.16,...st(.3,-.32),th:.2}});
  body.push({t:Ts0,v:{px:strikeX,pz:zS,crouch:cr+.07,lean:.28,...st(.36,-.36),th:.95},e:eOut},
    {t:Timp,v:{px:strikeX+fa*6,pz:zS,crouch:cr,lean:.06,...st(.42,-.42),th:.95},e:sstep},
    {t:Ts1,v:{px:strikeX+fa*8,pz:zS,crouch:cr+.08,lean:.08,...st(.38,-.38),th:.95},e:sstep},
    {t:Tr,v:()=>({...A.guardBody(),px:strikeX+fa*8}),e:sstep},{t:Tend,v:gB,e:sstep});
  // the glaive is held upright and close through the turn
  const tuck={hand:{sh:[.18*arm,-.08*arm]},wAng:-1.42,off:A.wp.off?'grip':{sh:[.08*arm,.22*arm]},tilt:.05};
  const armK=[{t:0,v:snap?{...A.curArm}:gA},{t:Math.max(.05,Ts0-.04),v:tuck,e:eOut},{t:Ts1,v:tuck},{t:Tr,v:gA,e:sstep},{t:Tend,v:gA}];
  const react=planReaction(D,A,kind,res,Timp,Cfn,0,rnd,snap,fa);
  const events=[{t:Math.max(0,Ts0-.03),fn:()=>S.hooks.sound('tail',1)},{t:Timp-.07,fn:()=>S.hooks.sound('swoosh',4.4)}];
  if(out!=='hit'&&out!=='crit')events.push({t:Timp+.005,fn:()=>stallTurn(A,D)});
  events.push({t:Tr,fn:()=>{if(!A.dead&&!A.downed)A.station=settleStation(A,D,clampSt(A,A.p[PEL].x));}});
  events.push(...(react.evs||[]));
  A.spin={t0:S.t+Ts0,t1:S.t+Ts1};
  A.tailAct={t0:S.t+Math.max(0,T1-.05),tw:S.t+Ts0,ti:S.t+Timp,te:S.t+Ts1+.3,low};
  S.callouts.push({i:A.idx,text:T.name,age:0,life:clamp(Timp+.1,.8,1.4),dx:-fa*24});
  // the outer half of the tail as it shows, mirrored by the turn
  const seg=()=>{const q=A.tail&&A.tail.q;if(!q||q.length<4)return[{x:-1e5,y:0},{x:-1e5,y:0}];const n=q.length-1,a=q[Math.floor(n*.45)],b=q[n];return[{x:drawnX(A,a.x),y:a.y},{x:drawnX(A,b.x),y:b.y}];};
  return{att:{t0:S.t,end:Tend,body,arm:armK,swing:true},react,Timp,Td,Tend,strikeX,Cfn,contactSeg:seg,contactVel:()=>({x:fa*720,y:low?70:-40}),dash:dist,theta:0,events,
    tWind:tW+tS*.5,vault:false,around:false,slip:react.slip??null,dir:fa,sec:null,ins:null};}
// the tail found nothing: he is left half round, his back to the man he swung at and the tail lying out on the floor toward him.
// The body is turned as it shows at that moment (mirrored about its middle), so nothing jumps.
function stallTurn(A,D){if(A.dead||A.downed||!A.spin)return;
  const px=(A.p[PEL].x+A.p[CHE].x)/2,m=x=>2*px-x;
  for(const q of A.p){q.x=m(q.x);q.px=m(q.px);}
  if(A.tail)for(const q of A.tail.q){q.x=m(q.x);q.px=m(q.px);}
  for(const q of A.scarf||[]){q.x=m(q.x);q.px=m(q.px);}
  for(const s of A.steps){if(s.plant)s.plant={x:m(s.plant.x),y:s.plant.y};if(s.from)s.from={x:m(s.from.x),y:s.from.y};if(s.to)s.to={x:m(s.to.x)};}
  A.facing=-A.facing;A.spin=null;A.tailAct=null;A.overext={t0:S.t,by:D?D.idx:null};
  popup(A,'Overextended','#ffc163',`back turned, tail out`,18,-44);}
V11.turnStart.push(()=>{for(const f of S.F)if(f.overext)f.overext=null;});
// a read on a lizard left with his back turned is never missed
{const rr=readRoll;readRoll=function(f,opp,src,depth){const r=rr(f,opp,src,depth);if(opp&&opp.overext&&tailIntact(opp)&&!f.beast){r.ok=true;r.total=Math.max(r.total,r.dc);}return r;};}

// ---------- taking the tail ----------
function tailCutTech(A,D){return{kind:'overhead',key:'tailcut',name:'Tail cut',why:`${D.name} is turned away with his tail out behind him: one chop takes it off for good, and with it his tail blows.`,
  tags:['At the tail','From behind'],acc:1,dmg:.75,along:null,ang:null,amp:.9,overlap:0,reach:null,anchor:'tail',kick:false,vault:false,around:null,rising:false,descend:false,windCap:null,passing:false,
  flair:null,multi:null,knock:.04,kdEase:0,tailCut:true,zone:'body'};}
function tailCutOK(A,D){return!!A&&!!D&&!A.beast&&!A.clinch&&!A.downed&&!A.wp.unarmed&&tailIntact(D)&&!!D.overext&&!D.dead&&!D.downed;}
function tailCutChance(A,D){const g=D.guarding;D.guarding=false;try{return hitChanceT(A,D,'overhead',true,tailCutTech(A,D));}finally{D.guarding=g;}}
function launchTailCut(A,D,ex){
  A.holdFace=null;faceToward(A,D.station);
  const T=tailCutTech(A,D),g=D.guarding;D.guarding=false;let res;try{res=resolveAttack(A,D,'overhead',true,T);}finally{D.guarding=g;}
  // a tail is not parried: a near miss is one it was pulled clear of; and losing it does not put him on the floor
  if(res.out==='block')res.out='dodge';
  res.kd=false;res.kdSaved=false;
  if(res.out==='dodge')res.dmg=0;
  A.guarding=false;A.counter=false;beginAction(A,'overhead',ex.chain||null,T);
  const plan=planAttack(A,D,'overhead',res,{snap:true,quick:true});
  {const rev=new Set(plan.react&&plan.react.evs||[]);plan.events=plan.events.filter(e=>!rev.has(e));}
  // he only flinches round: it is his tail, not his body, the blade goes for
  const db={...D.curBody},da={...D.curArm};D.action={t0:S.t,end:plan.Timp+.5,body:[{t:0,v:db},{t:plan.Timp,v:()=>D.guardBody()},{t:plan.Timp+.12,v:()=>({...D.guardBody(),crouch:.8,lean:.2}),e:eOut},{t:plan.Timp+.5,v:()=>D.guardBody(),e:sstep}],
    arm:[{t:0,v:da},{t:plan.Timp+.5,v:()=>D.guardArm()}]};
  A.action=plan.att;ex.res=res;ex.plan=plan;ex.dur=plan.Tend;ex.perf={dash:Math.round(plan.dash),windup:plan.tWind};
  // a miss: the tail snaps away from the blade
  if(res.out!=='hit'&&res.out!=='crit')plan.events.push({t:plan.Timp-.04,fn:()=>{const q=D.tail&&D.tail.q;if(!q)return;const fa=Math.sign(D.station-A.station)||A.facing;
    for(let i=2;i<q.length;i++){q[i].px-=fa*(60+i*14)*DT;q[i].py+=(90+i*10)*DT;}}});}
// off it comes: the stump bleeds, the piece jumps away and goes on writhing on the floor, and he has no tail left to fight with
function cutTail(D,fa){if(!tailIntact(D)||!D.tail)return null;const k=TAIL.cut,q=D.tail.q;if(q.length<=k+1)return null;
  // it jumps back off the stump toward the one who cut it, and a little toward us, so it is not lost behind his legs
  const bit={F:D,q:q.slice(k).map(p=>({x:p.x,y:p.y,px:p.x+fa*(.5+Math.random()*.8),py:p.y+1.4+Math.random()*1.4})),i0:k,N:TAIL.N,t0:S.t,dep:Math.max(DEP_MIN-6,D.dep-16),ph:Math.random()*TAU};
  (S.tailBits=S.tailBits||[]).push(bit);if(S.tailBits.length>4)S.tailBits.shift();
  D.tail.q=q.slice(0,k+1);D.tail.cut=k;D.tailBleed={until:S.t+1.8};D.overext=null;D.tailAct=null;D.tailNext=null;
  const e=q[k];if(S.gore!=='off'&&!S.warming){bleed(e,-fa,26,D.dep,1.15);bleed(e,fa,10,D.dep,.8);stain(e.x,D.dep,4,.7,18);}
  sparks(e,8,'#ffd9a8',D.dep);flash(e,30,'#fff1c9',D.dep);
  popup(D,'Tail severed','#ff8a5c','no more tail blows',22,-74);
  S.hooks.sound('roar',1);S.slowT=Math.max(S.slowT,.6);S.freeze=Math.max(S.freeze,.08);S.shake=Math.max(S.shake,6);
  // the shock of it takes his footing and slows him
  if(!D.dead){spendFoot(D,2);D.ready+=20;D.motor=Math.min(D.motor,.5);}
  return bit;}
// the severed piece on the floor: a chain of its own that thrashes for a few seconds and slowly stops
function tailBitsStep(){const B=S.tailBits;if(!B||!B.length)return;
  for(const P of B){const q=P.q,n=q.length,seg=tailLen(P.F)/TAIL.N,age=S.t-P.t0,amp=age<8?Math.exp(-age/2.4):0;
    for(const p of q){const vx=(p.x-p.px)*.985,vy=(p.y-p.py)*.985;p.px=p.x;p.py=p.y;p.x+=vx;p.y+=vy+700*DT*DT;}
    // a wave runs down it, flicking it about; now and then it jumps
    if(amp>.02){for(let i=0;i<n;i++){const a=q[Math.max(0,i-1)],b=q[Math.min(n-1,i+1)],dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy)||1,s=Math.sin(age*TAU*(2+amp)+P.ph-i*1.3)*amp*2400*DT*DT;
        q[i].x+=-dy/l*s;q[i].y+=dx/l*s*.6;}
      if(Math.random()<amp*.025){const j=1+Math.floor(Math.random()*Math.max(1,n-2));q[j].py+=2.2+Math.random()*2;q[j].px+=(Math.random()-.5)*2;}}
    for(let it=0;it<3;it++)for(let i=1;i<n;i++){const a=q[i-1],b=q[i],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1e-6,k=(d-seg)/d*.5;a.x+=dx*k;a.y+=dy*k;b.x-=dx*k;b.y-=dy*k;}
    for(let i=0;i<n;i++){const p=q[i],g=S.arena.ground(p.x,P.dep)-tailW(P.F,(P.i0+i)/TAIL.N)*.45;if(p.y>g){p.y=g;p.px=lerp(p.px,p.x,.22);}if(p.x<8)p.x=8;else if(p.x>W-8)p.x=W-8;}
    if(age<1.3&&S.gore!=='off'&&!S.warming&&Math.random()<.35*(1-age/1.3)){const e=q[0],b2=q[1],a=Math.atan2(e.y-b2.y,e.x-b2.x)+(Math.random()-.5)*.8;
      S.blood.push({x:e.x,y:e.y,d:P.dep,vx:Math.cos(a)*60,vy:Math.sin(a)*60,r:.8+Math.random()*1.2,age:0});}}}

// ---------- goblins cut in half ----------
const GOB={knock:1.4,sweepFling:1.5};
// a cutting blow that kills a goblin takes it in two at the waist (lower for a low cut, higher for one from above): two new points
// for the cut ends, the torso link broken, each half kept straight by its own links, and the top half goes on with the blade
function halve(D,fa,a){
  if(D.half||D.beast!=='goblin'||S.gore==='off')return false;
  a=clamp(a||.5,.15,.8);
  const p=D.p,P=p[PEL],Ch=p[CHE],b=D.body,T=b.torso,dx=Ch.x-P.x,dy=Ch.y-P.y,L=Math.hypot(dx,dy)||1,cx=P.x+dx/L*T*a,cy=P.y+dy/L*T*a;
  const mk=(v,m)=>({x:cx,y:cy,px:cx-v.x,py:cy-v.y,m,im:1/m,r:4.5,fx:0,fy:0,vx0:0,vy0:0});
  const U=mk({x:Ch.x-Ch.px,y:Ch.y-Ch.py},1.5*b.mass),Lw=mk({x:P.x-P.px,y:P.y-P.py},1.5*b.mass),iU=p.length;
  p.push(U,Lw);if(D.lastDust)D.lastDust.push(-9,-9);
  D.sticks[0][3]=1;D.sticks.push([CHE,iU,T*(1-a)],[PEL,iU+1,T*a]);
  D.half={U,L:Lw,a,t0:S.t,iU,iL:iU+1};
  D.marks=(D.marks||[]).filter(m=>!((m.a===PEL&&m.b===CHE)||(m.a===CHE&&m.b===PEL)));
  D.motor=0;D.dyingUntil=0;D.action=null;D.impaled=null;D.fountain=null;
  // the top half flies on with the blow and turns over; the legs fold where they stand
  const up=lerp(100,140,Math.random());
  for(const i of [CHE,HEAD,ELF,HAF,ELB,HAB,TIP,iU]){const q=p[i];q.px-=fa*(80+Math.random()*40)*DT;q.py+=up*DT;}
  {const q=p[HEAD];q.px-=fa*70*DT;q.py+=40*DT;}U.px+=fa*50*DT;U.py-=30*DT;
  for(const i of [PEL,iU+1]){const q=p[i];q.px-=fa*30*DT;q.py-=20*DT;}
  for(const i of [KNF,KNB]){const q=p[i];q.px+=fa*40*DT;}
  if(!S.warming){bleed({x:cx,y:cy},fa,22,D.dep,1.4);bleed({x:cx,y:cy},-fa,8,D.dep,.8);stain(cx,D.dep,4,.75,20);}
  return true;}
// each half kept as a half: the head stays at the end of the upper spine, the hips stay above the legs
{const so=solve;solve=function(f){if(!f.half)return so(f);
  const p=f.p;
  for(const s of f.sticks){if(s[3])continue;const a=p[s[0]],c=p[s[1]];const dx=c.x-a.x,dy=c.y-a.y,d=Math.hypot(dx,dy)||1e-6;const k=(d-s[2])/d/(a.im+c.im);
    a.x+=dx*k*a.im;a.y+=dy*k*a.im;c.x-=dx*k*c.im;c.y-=dy*k*c.im;}
  const h=f.half,b=f.body,minD=(a,c,mn)=>{const dx=c.x-a.x,dy=c.y-a.y,d=Math.hypot(dx,dy)||1e-6;if(d>=mn)return;const k=(d-mn)/d/(a.im+c.im);a.x+=dx*k*a.im;a.y+=dy*k*a.im;c.x-=dx*k*c.im;c.y-=dy*k*c.im;};
  minD(p[HEAD],h.U,(b.neck+b.torso*(1-h.a))*.9);
  const lk=(b.torso*h.a+b.th*.55)*.85;minD(h.L,p[KNF],lk);minD(h.L,p[KNB],lk);};}
// a body rebuilt is whole again
{const bd=Fighter.prototype.build;Fighter.prototype.build=function(){this.half=null;return bd.call(this);};}
function halvesStep(){if(S.gore==='off'||S.warming)return;
  for(const f of S.F){const h=f.half;if(!h)continue;const age=S.t-h.t0;if(age>1.7)continue;const u=age/1.7,pulse=.55+.45*Math.sin(age*13);
    for(const [o,base] of [[h.U,f.p[CHE]],[h.L,f.p[PEL]]]){if(Math.random()>(1-u)*.45)continue;const a=Math.atan2(o.y-base.y,o.x-base.x)+(Math.random()-.5)*.65,sp=((1-u)*210+40)*pulse;
      S.blood.push({x:o.x,y:o.y,d:f.dep+(Math.random()-.5)*4,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:.9+Math.random()*1.7,age:0});}}}

// ---------- finishers: in half, and the tail's kills ----------
{const pf=pickFinisher;pickFinisher=function(A,D,kind,T){
  if(T&&T.tailCut)return null;
  if(T&&T.tail)return{type:'knockout',name:T.low?'Swept and broken':'Tail-lashed',...FIN.knockout};
  if(D&&D.beast==='goblin'&&S.gore!=='off'&&T&&!T.dirty&&!T.kick&&!T.stab&&!T.backT&&A&&A.wp&&A.wp.edge&&!A.wp.unarmed&&!(D.downed&&!D.dead)&&!(T.along!==null&&T.along<0)){
    if(kind==='slash'||kind==='sweep'||(kind==='overhead'&&finVar(A,D)<.65))return{type:'bisect',name:'Cut in half',knock:.45,cut:kind==='sweep'?.24:kind==='overhead'?.62:.5};}
  return pf(A,D,kind,T);};}
{const fi=finisherImpact;finisherImpact=function(ex,A,D,res,C,fa){const F=res.tech.fin;
  if(!F||F.type!=='bisect'||!D.dead)return fi(ex,A,D,res,C,fa);
  D.finName=F.name;D.finType='bisect';D.finBy=A.name;D.action=null;
  for(const c of S.callouts)if(c.i===A.idx&&c.age<c.life-.12)c.age=c.life-.12;
  S.callouts.push({i:A.idx,text:F.name,age:0,life:1.4,dx:-A.facing*8,big:true});
  S.slowT=Math.max(S.slowT,.6);S.freeze=Math.max(S.freeze,.08);if(!S.warming)S.punch={x:prjX(C.x,D.dep),t:0};
  if(!halve(D,fa,F.cut)){const s=(res.seed&2)?1:-1;D.vdep+=s*95;for(const i of [CHE,HEAD,ELF,ELB])D.p[i].px-=fa*90*DT;}
  S.hooks.sound('crit',30);S.hooks.sound('splat',1);
  S.hooks.fin(ex,{A,D,F});};}

// ---------- goblins thrown about ----------
// a goblin weighs little: blows carry it much further (and so into things), and a low cut throws its legs out from under it
{const pt=pickTechnique;pickTechnique=function(A,D,kind){
  if(tailBlow(A,D,kind))return tailTech(A,D,kind);
  const T=pt(A,D,kind);
  if(T&&D&&D.beast==='goblin'&&!T.snare&&!(A&&A.beast))T.knock=(T.knock||1)*GOB.knock;
  return T;};}
{const ai=applyImpact;applyImpact=function(ex,A,D,res,Cfn,cv,slip,fa,primary){
  const fling=D&&D.beast==='goblin'&&!D.downed&&res&&res.kind==='sweep'&&(res.out==='hit'||res.out==='crit'),pre=fling?D.p.map(q=>[q.x-q.px,q.y-q.py]):null;
  const tc=!!(res&&res.tech&&res.tech.tailCut),nm=tc&&D.marks?D.marks.length:0;
  const r=ai.apply(this,arguments);
  if(pre)for(let i=0;i<pre.length&&i<D.p.length;i++){if(i===TIP)continue;const q=D.p[i],dvx=(q.x-q.px)-pre[i][0],dvy=(q.y-q.py)-pre[i][1];q.px-=dvx*(GOB.sweepFling-1);q.py-=dvy*(GOB.sweepFling-1);}
  // a tail cut that lands takes the tail, killing blow or not (and leaves no cut on his body)
  if(tc&&(res.out==='hit'||res.out==='crit')){if(D.marks&&D.marks.length>nm)D.marks.length=nm;cutTail(D,fa);}
  return r;};}
// the toss: one hand in the scruff and the goblin goes, as far as a man can throw it, best of all into another of them
function tossInfo(A,D){
  if(!A||!D||A.beast||D.beast!=='goblin'||D.dead||D.downed||D.clinch||A.clinch||A.downed||A.dead||D.carry||D.walkIn||D.offstage)return null;
  if(Math.abs(D.station-A.station)>118||Math.abs(D.lane-A.lane)>42)return null;
  if(tableBetween(A,D)||(S.divs.length&&divBetween(A,D)))return null;
  const dP=Math.sign(D.station-A.station)||A.facing;let best=null;
  for(const dir of [dP,-dP])for(const r of [210,180,150,120,92]){
    const lx=clampStage(D.station+dir*r);if(Math.abs(lx-D.station)<70||(dir!==dP&&Math.abs(lx-A.station)<50))continue;
    const cw=S.divs.length?divCross1(D.station,lx,A.lane):null;let o;
    if(cw){const face=dir>0?divL(cw):divR(cw);o={how:'toss',x:clampStage(face-dir*18),hazard:{kind:'div',w:cw,dir},dir};}
    else o={how:'toss',x:lx,hazard:landingHazard(A,D,lx,A.lane),dir};
    o.score=(o.hazard?(o.hazard.kind==='body'?150:100):0)+(dir===dP?14:0)+Math.abs(o.x-D.station)*.05;
    if(!best||o.score>best.score)best=o;}
  return best;}
function tossMods(A,D){const mods=[['skill',A.skill],['build',Math.round((A.body.bulk-D.body.bulk)*4)],['opening',3],[footLabel(A),post(A).atk],['dazed',A.daze?-2:0]];
  const defMods=[[post(D).name.toLowerCase(),post(D).resist],['dazed',D.daze?-2:0]];return{mods,bonus:sumMods(mods),dc:10+D.skill+sumMods(defMods),defMods};}
function launchToss(A,D,ex){
  const info=tossInfo(A,D),tr=rollVs(tossMods(A,D),{kind:'throw'});tr.dmg=tr.ok?6+Math.floor(S.rng()*6)+(tr.crush?3:0):0;
  if(!info){tr.ok=false;tr.dmg=0;}
  if(tr.ok&&info.hazard&&info.hazard.kind==='div'){const hz=info.hazard,w=hz.w,s2=tr.crush?2:1;hz.st=s2;
    if(w.hp-s2<=0){hz.through=true;const far=hz.dir>0?divR(w):divL(w);info.x=clamp(far+hz.dir*34,40,W-40);startBreach(w,D,hz.dir,.8);ex.divSlam=w;}}
  A.guarding=false;A.counter=false;beginAction(A,'throw');
  const plan=planToss(A,D,tr,info||{how:'toss',x:D.station,hazard:null,dir:1});A.action=plan.att;ex.res=tr;ex.plan=plan;ex.dur=plan.Tend;ex.info=info;ex.perf={dash:Math.round(plan.dash||0)};}
function planToss(A,D,tr,info){
  const dP=Math.sign(D.station-A.station)||A.facing,arm=A.arm,ex=S.game.ex,T0=.22,air=clamp(Math.abs(info.x-D.p[PEL].x)/330,.55,.85),Tl=T0+air,Tend=Tl+.5;
  A.facing=dP;
  const grip=()=>({x:D.p[CHE].x-dP*D.body.torsoW*.4,y:lerp(D.p[CHE].y,D.p[HEAD].y,.25)});
  const sx=clampSt(A,D.station-dP*(arm*.6+D.body.torsoW*.5+6)),dash=Math.abs(sx-A.station);
  const gB=()=>A.guardBody(),gA=()=>A.guardArm(),one=!A.wp.off;
  const reach={hand:one?{sh:[.3*arm,.0*arm]}:{fn:grip},wAng:-.9,off:one?{fn:grip}:'grip',tilt:.12};
  if(!tr.ok){
    const Te=T0+.45;
    const body=[{t:0,v:{...A.curBody}},{t:T0,v:()=>({...A.guardBody(),px:sx,crouch:.76,lean:.3,th:.3}),e:eOut},{t:T0+.26,v:()=>({...A.guardBody(),px:sx,crouch:.84,lean:-.06,th:.3})},{t:Te,v:gB,e:sstep}];
    const armK=[{t:0,v:{...A.curArm}},{t:T0,v:reach,e:eOut},{t:Te,v:gA,e:sstep}];
    const events=[{t:T0+.03,fn:()=>{spendFoot(A,1);A.ready+=10;D.station=clampSt(D,D.station+dP*18);for(const q of D.p)q.px-=dP*110*DT;
      popup(D,'Twists free','#a5dcff',null,19);S.hooks.sound('squeal',.6);if(ex)considerOpening(ex,D,A,'brace');S.hooks.status();}}];
    return{att:{t0:S.t,end:Te,body,arm:armK},Tend:Te+.1,events,dash,strikeX:sx,Cfn:grip};}
  const tl=Math.sign(info.x-D.station)||dP,over=tl!==dP;
  // into the scruff, down on the legs, then the whole body turned into the throw (over the shoulder when it goes behind him)
  const heave=one?{hand:{sh:[.25*arm,.1*arm]},wAng:-.7,off:{fn:()=>{const c=A.p[CHE];return{x:c.x+tl*.38*arm,y:c.y-(over?.95:.62)*arm};}},tilt:over?-.25:.15}
    :{hand:{fn:()=>{const c=A.p[CHE];return{x:c.x+tl*.4*arm,y:c.y-(over?.9:.6)*arm};}},wAng:-1.2,off:'grip',tilt:over?-.25:.15};
  const body=[{t:0,v:{...A.curBody}},{t:T0,v:()=>({...A.guardBody(),px:sx,crouch:.7,lean:.32,th:.9}),e:eOut},
    {t:T0+air*.4,v:()=>({...A.guardBody(),px:sx,crouch:.86,lean:over?-.3:.1,th:.9}),e:sstep},{t:Tl,v:()=>({...A.guardBody(),px:sx}),e:sstep},{t:Tend,v:gB,e:sstep}];
  const armK=[{t:0,v:{...A.curArm}},{t:T0,v:reach,e:eOut},{t:T0+air*.38,v:heave,e:eOut},{t:Tl,v:gA,e:sstep},{t:Tend,v:gA}];
  const events=[{t:T0,fn:()=>startToss(A,D,info,air)},{t:Tl,fn:()=>{if(info.started)landThrow(A,D,tr,info);}}];
  S.callouts.push({i:A.idx,text:info.hazard&&info.hazard.kind==='body'?'Goblin bowling':'Toss',age:0,life:1.1,dx:-A.facing*20});
  return{att:{t0:S.t,end:Tend,body,arm:armK},Tend:Tend+.1,events,dash,strikeX:sx,Cfn:()=>({x:info.x,y:S.arena.ground(info.x,A.lane)-30})};}
// the flight is higher and longer than a throw from a clinch, and it turns over in the air
function startToss(A,D,info,air){if(D.dead||D.downed)return;startCarry(A,D,info,air);const c=D.carry;if(!c)return;info.started=true;
  const d=Math.abs(info.x-c.from.x);c.apex={x:lerp(c.from.x,info.x,.5),y:Math.min(A.p[HEAD].y-18,c.from.y)-(40+d*.32)};
  c.spin=-(Math.sign(info.x-c.from.x)||1)*Math.PI*(1.4+Math.random()*.7);
  S.hooks.sound('squeal',1);}

// a Toss is also a command of its own: against a goblin in reach, the Advance key (which grabs a man at arm's length) picks the
// goblin up and throws it
ACTIONS.toss={name:'Toss',cost:80};FOOT_COST.toss=2;
{const sa=slotAction;slotAction=function(A,D,slot){const a=sa(A,D,slot);if(slot==='advance'&&D&&D.beast==='goblin'&&!A.clinch&&!A.downed&&tossInfo(A,D))return'toss';return a;};}
{const cv=cmdValid;cmdValid=function(A,D,cmd){if(cmd==='toss')return!!A&&!A.dead&&A.foot>=1&&!!tossInfo(A,D);return cv(A,D,cmd);};}
{const cm=command;command=function(i,cmd,opts){if(cmd!=='toss')return cm(i,cmd,opts);
  opts=opts||{};const g=S.game;if(g.phase!=='input'||g.active!==i||S.opening)return false;
  const A=S.F[i],D=targetOf(A);if(!cmdValid(A,D,cmd))return false;
  g.phase='exchange';g.aiAt=null;if(!opts.prepaid)A.ready+=actionCost(A,'toss',0);
  if(A.team===1)A.intent=null;
  const ex={A,D,t0:S.t,cmd:'throw',perf:{},depth:0,dazedAtStart:A.daze>0};g.ex=ex;A.covering=null;A.counter=false;A.lastAct='throw';
  A.setSpear=false;A.wallPin=false;A.holdFace=null;A.feint=null;A.feintRead=null;faceToward(A,D.station);
  launchToss(A,D,ex);S.hooks.log({type:'throw',A,D,ex,res:ex.res});S.hooks.status();return true;};}

// ---------- the openings these give ----------
// a goblin within arm's reach can be tossed; a lizard left with his back turned and the tail out can lose it
{const oc=openingChoices;openingChoices=function(o){const ch=oc(o),f=o.f,D=o.opp;
  if(!f||!D||f.beast||o.source==='clinch'||o.source==='stop'||f.clinch)return ch;
  if(tailCutOK(f,D))return['tailcut',...ch];
  if(D.beast==='goblin'&&tossInfo(f,D))return[...ch.slice(0,-1),'toss',ch[ch.length-1]];
  return ch;};}
{const ov=openValid;openValid=function(o,k){if(k==='tailcut')return tailCutOK(o.f,o.opp);if(k==='toss')return!!tossInfo(o.f,o.opp);return ov(o,k);};}
{const oc=openCost;openCost=function(f,k,o){return oc(f,k==='tailcut'?'overhead':k==='toss'?'shove':k,o);};}
{const ao=aiOpening;aiOpening=function(o){const ch=openingChoices(o).filter(k=>openValid(o,k));
  if(ch.includes('tailcut')&&S.rng()<.85)return'tailcut';
  if(ch.includes('toss')){const ti=tossInfo(o.f,o.opp),p=S.forceToss?1:o.link?.08:ti&&ti.hazard?.42:.16;if(S.rng()<p)return'toss';}
  const c=ao(o);return c==='tailcut'||c==='toss'?'hold':c;};}
{const ro=resolveOpening;resolveOpening=function(choice){const o=S.opening;
  if(!o||(choice!=='tailcut'&&choice!=='toss')||!openingChoices(o).includes(choice)||!openValid(o,choice))return ro(choice);
  if(o.ex&&o.ex.dazedAtStart&&o.ex.A&&o.ex.A!==o.f&&o.source!=='stop')o.ex.A.daze=0;
  S.opening=null;o.f.counter=false;o.f.setSpear=false;o.f.holdFace=null;o.f.lastAct=choice==='toss'?'throw':'overhead';S.hooks.opening(null,choice);chainLaunch(o,choice);
  restoreFacings();
  const A=o.f,D=o.opp,g=S.game;
  A.station=clampSt(A,A.curBody.px);if(choice==='toss')D.station=clampSt(D,D.curBody.px);resolveStations();
  A.ready+=openCost(A,choice,o);
  if(A.team===0)setTgt(A,D.idx);
  const ex={A,D,t0:S.t,cmd:choice==='toss'?'throw':'overhead',perf:{},depth:o.depth,chain:o.kind,link:o.link,dazedAtStart:A.daze>0,beat:0,setSpear:false};
  g.ex=ex;
  if(choice==='toss'){launchToss(A,D,ex);S.hooks.log({type:'throw',A,D,ex,res:ex.res});}
  else{launchTailCut(A,D,ex);S.hooks.log({type:'attack',A,D,res:ex.res,ex});}
  S.hooks.status();};}
// where the blade goes on a tail: the link it comes off at; on a gut blow, low on the body
{const af=anchorFor;anchorFor=function(D,T,kind){
  if(T&&T.anchor==='tail')return()=>{const q=tailPt(D,TAIL.cut);return{x:q.x,y:q.y-2};};
  if(T&&T.anchor==='belly'){const P=D.p[PEL],C=D.p[CHE];return()=>({x:lerp(P.x,C.x,.35),y:lerp(P.y,C.y,.35)});}
  return af(D,T,kind);};}

// ---------- the lizard picks his tail blows ----------
// about two blows in five are the tail while he has it, more against a man who is not steady on his feet
{const ac=aiChoice;aiChoice=function(i){const A=S.F[i];let c=ac(i);
  if(A&&A.beast==='lizard'){A.tailNext=null;
    const D=targetOf(A);
    if(D&&tailIntact(A)&&!A.clinch&&!A.downed&&!D.downed&&!D.dead&&ATTACKS.includes(c)&&A.foot>=2&&c!=='sweep'){
      const r=S.rng(),unsteady=D.posture!=='set';
      if(r<(unsteady?.34:.24))c='sweep';else if(r<(unsteady?.56:.5)){c='slash';A.tailNext='whip';}}}
  // Kael's own AI (the auto battle) takes goblins with the edge more often than the point: a cut takes them in half
  else if(A&&!A.beast&&A.team===0){const D=targetOf(A);
    if(D&&D.beast==='goblin'&&!D.downed&&!A.clinch){
      if(c==='thrust'&&S.rng()<.55)c='slash';
      // and now and then he throws one, above all into another
      if((c==='grab'||ATTACKS.includes(c))&&cmdValid(A,D,'toss')){const ti=tossInfo(A,D);if(c==='grab'||S.rng()<(S.forceToss?1:ti.hazard&&ti.hazard.kind==='body'?.3:.08))c='toss';}}}
  return c;};}
{const ca=chainAI;chainAI=function(o,ch){const c=ca(o,ch);if(c==='thrust'&&o.opp&&o.opp.beast==='goblin'&&!o.opp.downed&&ch.includes('slash')&&S.rng()<.6)return'slash';return c;};}
{const la=launchAttack;launchAttack=function(A,D,kind,ex,opening,popts){
  if(A)A.overext=null;
  if(!tailBlow(A,D,kind)){const r=la.apply(this,arguments);if(A)A.tailNext=null;return r;}
  A.holdFace=null;faceToward(A,D.station);
  const T=tailTech(A,D,kind),res=resolveAttack(A,D,kind,opening,T);A.tailNext=null;
  // a tail through the legs puts down anyone not set on his feet, however good he is
  if(T.low&&(res.out==='hit'||res.out==='crit')&&!res.kd&&D.hp-res.dmg>0&&PORDER.indexOf(D.posture)>=1){res.kd=true;res.kdSaved=false;}
  engage(A,D);A.guarding=false;A.counter=false;beginAction(A,kind,ex.chain||null,T);
  const plan=planTail(A,D,kind,res,popts||{});A.action=plan.att;D.action=plan.react;
  ex.res=res;ex.plan=plan;ex.dur=plan.Tend;ex.perf={dash:Math.round(plan.dash),windup:plan.tWind};};}

// ---------- every step ----------
{const ft=finTick;finTick=function(){ft();for(const f of S.F)if(hasTail(f))tailSim(f);halvesStep();tailBitsStep();};}
V11.duelStart.push(()=>{S.tailBits=[];for(const f of S.F){f.overext=null;f.tailAct=null;f.tailNext=null;f.tailBleed=null;f.tail=null;}});
// ===== BEASTS IN THE FIGHT END =====
