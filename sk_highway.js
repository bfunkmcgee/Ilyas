// ===== THE TOWER ROAD (since V101) =====
// After the Avenue's riders go down, the road takes him out of the old city onto the Tower Road, the raised highway to the tower
// district (asked for in V101). It is the Avenue's second half: a stage of its own with no card, part of the Avenue's chapter
// (STAGES: 'highway', part 'chase', so the chapters do not list it and the banner and the saves give the Avenue's name).
// The ramp: he comes down off the interchange on a ramp that bends toward the camera, far and small at its top, close and whole at
// its foot, and the picture turns with it: the bikes on the ramp are drawn smaller with their distance and turned the way they head,
// their fronts to the camera as they come at it (B.vk, B.vyaw: the page reads them; since V102). Four more of Hallowell's riders
// come off the top deck of a parking garage beside it, through its rail and across onto the ramp behind him. At the foot the ramp
// joins the highway and the road straightens out: he rides west now, to the left of the picture, the road going by under the riders
// the other way (S.scrollV under 0). Ahead of them a truck: in its open bed a man heaves fuel drums off a stack and throws them down
// the road at him, between the turns of the fight (a scene of its own), and each goes up where it rolls to. Two of the riders down,
// the family's helicopter comes in over the road with the man in white in its door behind a machine gun on its pintle: he cuts down
// the riders left and walks his fire up the truck into its drums. The family wants the job done, not the man doing it stopped. The
// road is clear, and on he goes to the checkpoint.
// Everything here moves in the game's own world: the ramp is a curve on the floor (where its middle runs in the picture), the bikes
// go along it, the jumpers' bikes fly (B.air: their height over the line they fly along), the drums are thrown (S.drums), the blasts
// are the story's own (boom). The page draws them (sk_highwayui.js, envx/env_highway.js, envx/veh_truck.js).
storyArena('highway',{label:'Highway',name:'The Tower Road',ground:()=>GB,wall:null,far:236,scroll:true,minX:130,maxX:790});
const HWY_V=1050;                 // the road's speed past the riders, units a second: the avenue's, heading west
// The ramp's middle in the picture (x, and y as drawn on the floor's line): down from the interchange high on the right, toward the
// camera, and round at its foot into the highway's lanes heading west. A point of it is turned into the floor's x and depth
// (hwyFloor), so whatever is on it is drawn where it is and sorted by its distance. Its foot is on the highway's middle lane line
// (depth 114, y 384.5: since V107, the painter's two lanes then run on as the highway's second and third; it ended at depth 104)
const RAMP=[[820,-40],[900,250],[880,390],[580,384.5]];
function hwyBez(s){const u=1-s,a=u*u*u,b=3*u*u*s,c=3*u*s*s,d=s*s*s,P=RAMP;
  return{X:a*P[0][0]+b*P[1][0]+c*P[2][0]+d*P[3][0],Y:a*P[0][1]+b*P[1][1]+c*P[2][1]+d*P[3][1],
    tx:3*u*u*(P[1][0]-P[0][0])+6*u*s*(P[2][0]-P[1][0])+3*s*s*(P[3][0]-P[2][0]),ty:3*u*u*(P[1][1]-P[0][1])+6*u*s*(P[2][1]-P[1][1])+3*s*s*(P[3][1]-P[2][1])};}
// the size a thing is drawn at for its distance: whole on the highway's own lanes (out to its median, depth 236), down to a third far
// up the ramp
const HWY_FAR=236;
function hwyK(dep){return clamp(1-(dep-HWY_FAR)/540,.34,1);}
// a point of the ramp on the floor: s along it, off across it (+ to the rider's right as he comes down it), the across shrunk with the
// distance; and which way the ramp heads there, as the looks turn a figure (yaw: 0 his profile heading west, the way the riders face,
// -π/2 his front to the camera, -π heading east)
function hwyFloor(s,off){const P=hwyBez(s),L=Math.hypot(P.tx,P.ty)||1,nx=-P.ty/L,ny=P.tx/L,k0=hwyK((GB-P.Y)/PSY),X=P.X+nx*off*k0,Y=P.Y+ny*off*k0*.62,dep=(GB-Y)/PSY;
  return{x:X-dep*PSX,dep,k:hwyK(dep),yaw:hwyYaw(P.tx+P.ty*PSX/PSY,-P.ty/PSY)};}
// the yaw of a heading on the floor: dx across it (+ east) and dd in depth (+ away from the camera)
function hwyYaw(dx,dd){return Math.atan2(-dx,-dd)-Math.PI/2;}
// The parking garage on the far side of the ramp: its top deck's edge, as far off as the ramp's top (y in the picture), and each of
// the four riders on it: the picture's x where he goes through its rail, when (seconds into the ride down), where on the ramp he
// comes down (s along it, off across it), and how far down it he has come when Kael reaches its foot
const GARAGE={y:70,run:.5,back:34,jump:[[632,1.05,.2,20,.82],[688,1.4,.28,-20,.78],[584,1.75,.14,4,.72],[730,2.1,.34,-8,.66]]};
GARAGE.dep=(GB-GARAGE.y)/PSY;
// the truck: where it settles ahead of the riders (its tail's x, in the far lane) and how high its bed stands
const TRUCK={x:400,dep:200,bed:70,len:430};
// the helicopter's place over the road while the man in white fires (its x, its height, its depth: beyond the median)
const HWY_HELI={x:640,y:86,dep:262};

// ---------- the ramp's bikes ----------
// Driven along the ramp a bike goes where the ramp puts it (vehStep moves it at B.vx and carries its rider: B.carry), at the road's
// pace (B.spd, for the engine's note); the page draws it at its distance and its heading (vk, vyaw).
function hwyAim(B,F){B.vx=(F.x-B.x)/DT;B.dep=F.dep;B.vk=F.k;B.vyaw=F.yaw;B.fa=-1;B.spd=HWY_V;B.carry=1;B.ctl='script';
  const f=B.rider;if(f){f.dep=f.stepDep=B.dep;f.facing=-1;}}
function* hwyRide(B,s0,s1,dur,off,ease){const t0=S.t,E=ease||lin;
  while(true){const u=clamp((S.t+DT-t0)/dur,0,1);hwyAim(B,hwyFloor(lerp(s0,s1,E(u)),typeof off==='function'?off(u):off));if(u>=1)break;yield;}}
// off the deck: the run at the rail out of the deck's dark (GARAGE.run seconds), then a leap through it across the gap onto the ramp,
// the front up through the rail and level for the landing
function* hwyLeap(B,J){const [X0,,s1,o1]=J,dur=.95,F1=hwyFloor(s1,o1),z0=GARAGE.dep,x0=X0-z0*PSX,up=58,f0=B.rider,
    yRun=hwyYaw(26,-GARAGE.back),yLeap=hwyYaw(F1.x-x0,F1.dep-z0);
  B.hide=false;B.ctl='script';B.spd=HWY_V*.6;B.carry=1;if(f0)f0.hidden=false;S.hooks.sound('rev',.7);
  {const t1=S.t,zb=z0+GARAGE.back;while(true){const u=clamp((S.t+DT-t1)/GARAGE.run,0,1),e=eIn(u),z=lerp(zb,z0,e);
    B.vx=(lerp(x0-26,x0,e)-B.x)/DT;B.dep=z;B.vk=hwyK(z);B.vyaw=yRun;B.fa=-1;B.pitchT=u>.75?.22:0;if(f0){f0.dep=f0.stepDep=z;f0.facing=-1;}if(u>=1)break;yield;}}
  const t0=S.t;B.spd=HWY_V*.8;if(S.hwy)(S.hwy.broke||(S.hwy.broke=[])).push(X0);
  S.hooks.sound('crash',.45,{s:'debris_rattle'});
  sparks({x:x0-10,y:GB-6},10,'#ffd27a',z0);dust(x0,GB,.7,z0,'rgba(150,140,130,.5)');
  while(true){const u=clamp((S.t+DT-t0)/dur,0,1),z=lerp(z0,F1.dep,u);
    B.vx=(lerp(x0,F1.x,u)-B.x)/DT;B.dep=z;B.air=up*4*u*(1-u);B.vk=hwyK(z);B.vyaw=u<.3?lerp(yRun,yLeap,sstep(u/.3)):lerp(yLeap,F1.yaw,sstep((u-.3)/.7));B.fa=-1;B.pitchT=u<.3?.24:u<.75?.06:-.03;
    const f=B.rider;if(f){f.dep=f.stepDep=z;f.facing=-1;}
    if(u>=1)break;yield;}
  // down on the ramp: the springs bottom out, sparks off the frame, and on
  B.air=0;B.pitchT=0;B.jolt=1;sparks({x:B.x,y:GB-6},12,'#ffd27a',B.dep);dust(B.x,GB,.9,B.dep,'rgba(150,140,130,.5)');
  S.hooks.sound('thud',260,{s:'thud_metal'});}
// every step, after the bikes have moved: a bike in the air rides its height over the floor, and its rider goes up and down with it;
// on the ramp the wheels turn at the road's pace, though the bike only creeps down the picture
V11.step.push(()=>{if(S.arenaKey!=='highway')return;for(const B of S.veh){if(B.kind!=='bike')continue;
  if(B.jolt>0)B.jolt=Math.max(0,B.jolt-DT*3.2);
  const gy=S.arena.ground(B.x,B.dep)-(B.air||0),dy=B.gyH==null?0:gy-B.gyH;B.gy=gy;B.gyH=gy;
  if(dy&&B.rider&&B.ctl==='script'){const f=B.rider;for(const q of f.p){q.y+=dy;q.py+=dy;}if(f.scarf)for(const q of f.scarf){q.y+=dy;q.py+=dy;}}
  if(B.ctl==='script'&&B.spd&&!(S.scrollV<0))B.wheel+=B.spd*B.fa*DT/BIKE.R;}});

// ---------- the truck ----------
// A flatbed with a cab, running ahead of the riders at their pace (T.vx: how it moves in the picture), drums stacked in its bed and a
// man among them who throws them. Shot through its drums it goes up: it burns, slews off toward the median and falls away behind.
function truckNew(o){const T=Object.assign({kind:'truck',x:TRUCK.x,dep:TRUCK.dep,fa:-1,gy:GB,bed:TRUCK.bed,drums:9,lamp:1,wreck:0,burn:0,jolt:0,vx:0,vdep:0,wheel:0,roll:0,ctl:'run'},o||{});
  S.veh.push(T);return T;}
// the bed's floor (where the thrower stands) and its ends in the game's x: the tail toward the riders, the cab ahead
function truckBed(T){return{x0:T.x-262,x1:T.x-8,y:T.gy-T.bed};}
// the truck moved along the road, the man in its bed with it
function truckShift(T,dx){T.x+=dx;for(const f of S.F)if(f.onTruck===T&&!f.offTruck){f.station+=dx;for(const q of f.p){q.x+=dx;q.px+=dx;}}}
V11.step.push(()=>{for(let i=S.veh.length-1;i>=0;i--){const T=S.veh[i];if(T.kind!=='truck')continue;
  T.wheel+=(S.scrollV<0?HWY_V:0)*T.fa*DT/26;if(T.jolt>0)T.jolt=Math.max(0,T.jolt-DT*1.6);
  // a wreck: the road takes its speed (it goes away behind, to the right), slewing toward the median as it goes
  if(T.ctl==='wreck'){const u=S.t-T.wreckT;T.vx=Math.min(T.vx+DT*560,860);T.vdep=Math.max(0,50-u*28);T.roll=Math.min(.1,T.roll+DT*.07);}
  if(T.vx)truckShift(T,T.vx*DT);T.dep+=T.vdep*DT;T.gy=S.arena.ground(T.x,T.dep);
  if(T.ctl==='wreck'&&T.x>W+700)S.veh.splice(i,1);}});
// the man in the bed stands on it, wherever the truck goes
{const gr=Fighter.prototype.gr;Fighter.prototype.gr=function(x){const T=this.onTruck;if(T&&!this.offTruck){const B=truckBed(T);if(x>=B.x0-8&&x<=B.x1+8)return B.y;}return gr.call(this,x);};}
// the truck in the picture, sliding to where it runs (the riders closing on it)
function* truckTo(T,x,dur,ease){const x0=T.x,t0=S.t,E=ease||sstep;while(true){const u=clamp((S.t+DT-t0)/dur,0,1);T.vx=(lerp(x0,x,E(u))-T.x)/DT;if(u>=1)break;yield;}T.vx=0;}

// ---------- the drums ----------
// A drum heaved off the stack and thrown down the road: it tumbles through the air, comes down with a bounce, and the road carries it
// back toward the riders as it rolls until it goes up (o.after: how long after it lands). Where that is the game's dice settled as it
// left his hands: on Kael, close by him, or clear. Its blast is the story's own, and what it leaves burning goes by with the road.
const DRUM={r:15,h:38};           // its radius and its length, world units (the page draws the same)
S.drums=[];
V11.duelStart.push(()=>{S.drums=[];});
function throwDrum(M,T,dur,after){const h={x:(M.p[HAF].x+M.p[HAB].x)/2,y:Math.min(M.p[HAF].y,M.p[HAB].y)-6},g=G*.9,vx=(T.x-h.x)/dur,vdep=(T.dep-M.dep)/dur,vy=(T.y-h.y)/dur-.5*g*dur;
  const d={x:h.x,y:h.y,dep:M.dep,vx,vy,vdep,ang:0,spin:-7-Math.random()*4,t0:S.t,after,landed:0,goAt:1e9,boom:null,size:.9,bounced:false};S.drums.push(d);return d;}
V11.step.push(()=>{if(!S.drums.length)return;if(S.arenaKey!=='highway'){S.drums=[];return;}const sv=S.scrollV||0;
  for(let i=S.drums.length-1;i>=0;i--){const o=S.drums[i];o.vy+=G*.9*DT;o.x+=o.vx*DT;o.y+=o.vy*DT;o.dep+=o.vdep*DT;o.ang+=o.spin*DT;const g=S.arena.ground(o.x,o.dep)-DRUM.r;
    if(o.y>=g){o.y=g;
      if(!o.landed){o.landed=S.t;o.goAt=S.t+o.after;S.hooks.sound('thud',300,{s:'thud_metal'});dust(o.x,g+DRUM.r,.8,o.dep,'rgba(140,130,120,.5)');}
      if(o.vy>140&&!o.bounced){o.vy*=-.28;o.bounced=true;}else o.vy=0;
      // rolling: it loses its own pace against the road, and the road takes it the way it goes
      o.vx+=(-sv*.82-o.vx)*Math.min(1,DT*3.4);o.vdep*=1-DT*4;o.spin=o.vx/DRUM.r;}
    if(S.t>=o.goAt){S.drums.splice(i,1);o.boom=boom(o.x,o.y-8,o.dep,o.size,'fuel',{spare:S.F.filter(f=>f.mount||f.npc)});
      S.fires.push({x:o.x,y:S.arena.ground(o.x,o.dep),dep:o.dep-2,w:64,h:44,seed:(o.t0*97|0)%997,k:.7,road:true});}}});
// a blast on the road falls behind the riders as its fire spends the drum's own pace (slowly at first, then at the road's), and a
// fire on the road goes by with it; a fire on the truck goes where the truck goes
V11.step.push(()=>{if(S.arenaKey!=='highway')return;const dx=S.scrollV<0?-S.scrollV*DT:0;
  for(const b of S.booms)b.x+=dx*clamp((S.t-b.t0-.25)/.9,.12,1);
  for(let i=S.fires.length-1;i>=0;i--){const F=S.fires[i];if(F.truck){F.x+=F.truck.vx*DT;F.dep+=F.truck.vdep*DT;}else if(F.road)F.x+=dx;if(F.x>W+700)S.fires.splice(i,1);}});

// ---------- the door gun ----------
// The family's helicopter, its door open and a machine gun on a pintle in the doorway, the man in white on its grips. The gun turns on
// its pivot in the picture (H.gunAng: its heading as drawn, 0 to the right, down positive), quickly but not at once, and kicks at
// each round. hwyGun gives its pivot, muzzle and grips as points of the game's world at the gun's depth (a little nearer than him).
// The pintle stands at the doorway's front edge (the helicopter's x 46, the door's front at 56) and he behind it in the door's middle
// (heliDoor, x 9), the gun laid forward and down at the road, so its grips come back to his hands in front of him at his chest
// (since V107, asked for: the pintle stood where he stood, at x 10, and the grips came out behind him, his arms back behind his back)
const HWY_GUN={piv:[46,104],len:92,grip:30,dep:6,rest:2.05};
function hwyGun(H){const L=heliLook(),dz=H.dep-HWY_GUN.dep,pv=L&&L.at?L.at(H,HWY_GUN.piv[0],HWY_GUN.piv[1]):{x:H.x,y:H.gy-H.y-HWY_GUN.piv[1]};
  const a=H.gunAng??1.1,c=Math.cos(a),s=Math.sin(a),k=(H.recoil||0)*4;
  return{dep:dz,piv:pv,ang:a,muzzle:{x:pv.x+c*(HWY_GUN.len-k),y:pv.y+s*(HWY_GUN.len-k)},grip:{x:pv.x-c*(HWY_GUN.grip+k),y:pv.y-s*(HWY_GUN.grip+k)},
    grip2:{x:pv.x-c*(HWY_GUN.grip-10+k)+s*7,y:pv.y-s*(HWY_GUN.grip-10+k)-c*7}};}
// the heading in the picture from the gun's pivot to a point at another depth
function hwyAimAng(H,T){const G0=hwyGun(H);return Math.atan2(prjY(T.y,T.dep)-prjY(G0.piv.y,G0.dep),prjX(T.x,T.dep)-prjX(G0.piv.x,G0.dep));}
V11.step.push(()=>{for(const H of S.veh){if(H.kind!=='heli'||H.gunAng==null)continue;H.gunAng+=((H.gunAngT??H.gunAng)-H.gunAng)*Math.min(1,DT*10);
  if(H.recoil>0)H.recoil=Math.max(0,H.recoil-DT*16);}});
// a burst at what aim(i) gives for round i (a point and its depth): the gun swings onto it, tracers out of the muzzle, the strikes
// where they land; each(i, point) for what a round does there
function* hwyBurst(H,aim,n,o={}){
  for(let i=0;i<n;i++){const T=aim(i),sp=o.spread??12,to={x:T.x+(Math.random()-.5)*sp,y:T.y+(Math.random()-.5)*sp*.5,dep:T.dep};
    H.gunAngT=hwyAimAng(H,to);if(i===0)yield* wait(.16);
    const G0=hwyGun(H),ang=Math.atan2(prjY(to.y,to.dep)-prjY(G0.muzzle.y,G0.dep),prjX(to.x,to.dep)-prjX(G0.muzzle.x,G0.dep));H.recoil=1;
    S.muzzles.push({x:G0.muzzle.x,y:G0.muzzle.y,dep:G0.dep,ang,kind:'mg',t0:S.t});
    S.tracers.push({a:{x:G0.muzzle.x,y:G0.muzzle.y,dep:G0.dep},b:{x:to.x,y:to.y,dep:to.dep},dep:G0.dep,dep1:to.dep,t0:S.t,kind:'mg',dur:.06});
    S.impacts.push({x:to.x,y:to.y,dep:to.dep,t0:S.t+.04,kind:o.kind||'ground',ang});
    S.hooks.sound('shot','mg');if(i%2===0)S.hooks.sound(o.kind==='metal'?'bullet_metal':o.kind==='flesh'?'hit_bullet':'bullet_ground',.7,{delay:.05});
    if(o.each)o.each(i,to);
    yield* wait(o.gap??.075);}}
// the man in white on the gun: his hands on its grips, leaning into it
function hwyGunArm(M){const H=M.inHeli;if(!H||!H.gunOn)return null;const Gn=hwyGun(H),toW=p=>({x:prjX(p.x,Gn.dep)-M.dep*PSX,y:prjY(p.y,Gn.dep)+M.dep*PSY});
  return{hand:{w:toW(Gn.grip)},wAng:1.2,off:{w:toW(Gn.grip2)},tilt:.12};}

// ---------- the stage ----------
STAGES.splice(stageIx('chase')+1,0,{key:'highway',num:'',title:'',part:'chase',sub:'',arena:'highway',next:'roadblock',cardDur:0,scrollV:0,
  foes:[{name:'Decker',human:true,ward:'bikers',arms:'street',seed:5311,weapon:'club',skill:2,temper:'brute',hp:44,color:'#b8814a'},
        {name:'Leaper',human:true,ward:'bikers',arms:'street',seed:5347,weapon:'dagger',skill:2,temper:'rusher',hp:40,color:'#7fa8c8'},
        {name:'Lowrider',human:true,ward:'bikers',arms:'street',seed:5389,weapon:'sword',skill:1,temper:'plain',hp:38,color:'#c86a8a'},
        {name:'Spoke',human:true,ward:'bikers',arms:'street',seed:5431,weapon:'club',skill:1,temper:'rusher',hp:36,color:'#9fb86a'}],
  // heading west: two come up behind him on the right, two go by him on the far side and the near
  spawn:[[470,96],[668,58,1],[704,140,1],[300,134,-1],[236,60,-1]],
  setup(st){const K=hero(),sv=S.story;S.hwy={persp:true,phase:'ramp'};S.fade=1;
    sv.kills=0;sv.heliDone=false;sv.heli=null;sv.turnN=0;sv.drumAt=2;sv.drumN=0;
    // Kael at the top of the ramp, small in the distance
    const KB=bikeNew({x:600,dep:300,fa:-1,holster:'rifle',light:1,run:1});sv.bike=KB;
    K.station=KB.x-SEAT_DX;K.lane=K.dep=K.stepDep=KB.dep;K.facing=-1;K.build();mount(K,KB,0);stowBlade(K);
    {const F=hwyFloor(0,-6);bikePlace(KB,F.x,F.dep);KB.vk=F.k;KB.vyaw=F.yaw;}
    // the four still up on the garage's top deck, behind its rail
    for(const f of S.F)if(f.team===1){const J=GARAGE.jump[f.idx-1],sp=st.spawn[f.idx];f.homeX=sp[0];f.homeZ=sp[1];
      const B=bikeNew({x:J[0]-GARAGE.dep*PSX-26,dep:GARAGE.dep+GARAGE.back,fa:-1,style:'street',paint:f.idx%2?'red':'black',light:1,run:1,hide:true});
      B.vk=hwyK(B.dep);B.vyaw=hwyYaw(26,-GARAGE.back);f.station=B.x-SEAT_DX;f.lane=f.dep=f.stepDep=B.dep;f.facing=-1;f.build();mount(f,B,0);f.offstage=true;f.hidden=true;}
    // the truck on the highway ahead, out of the picture for now, its thrower in the bed among the drums
    const T=truckNew({x:-520});sv.truck=T;const Bd=truckBed(T);
    const M=storyExtra('Drum man',{ward:'bikers',arms:'street',seed:5419,x:Bd.x1-18,dep:T.dep-8,facing:1,weapon:'fists',color:'#a0805a'});
    M.onTruck=T;M.camSkip=true;M.offstage=true;M.zMax=T.dep;standEasy(M);M.station=Bd.x1-18;M.lane=M.dep=M.stepDep=T.dep-8;M.facing=1;M.build();sv.drummer=M;
    // and the man in white, out of sight until the family's helicopter comes for the truck
    const Wm=storyExtra(WHITE,{ward:null,seed:9901,x:W+900,dep:HWY_HELI.dep-2,facing:-1,weapon:'fists',color:'#f2ece0'});
    Wm.hench=false;Wm.camSkip=true;Wm.offstage=true;Wm.hidden=true;Wm.zMax=HWY_HELI.dep+8;standEasy(Wm);Wm.lane=Wm.dep=Wm.stepDep=HWY_HELI.dep-2;Wm.build();
    sv.white=Wm;hwyHands();},
  *intro(st){const K=hero(),KB=K.mount,fs=S.F.filter(f=>f.team===1&&!f.npc);
    letter(1);hwyShot('top',0);
    yield* until(()=>{S.fade=Math.max(0,S.fade-DT*2.2);return S.fade<=0;},.6);
    S.hooks.sound('rev',.8);
    // down the ramp toward the camera, the lanes streaming under him; the picture comes down with him
    const ride=hwyRide(KB,0,1,4.4,u=>-6+4*u,u=>u*u*(1.55-.55*u));
    const cam=(function*(){yield* wait(2);hwyShot('mid',.7);yield* wait(1.4);hwyShot('foot',1.1);})();
    // the four come off the garage's top deck one after another, through its rail and across onto the ramp behind him
    const jumps=fs.map((f,i)=>(function*(){const J=GARAGE.jump[i];yield* wait(J[1]-GARAGE.run);
      yield* hwyLeap(f.mount,J);
      yield* hwyRide(f.mount,J[2],J[4],4.4-J[1]-.95,u=>lerp(J[3],[18,-14,22,-10][i],u),eOut);})());
    yield* all(ride,cam,...jumps);
    // the ramp's foot: the highway, the road straightening out under them heading west, and the road takes over their pace
    yield* hwyMerge(st,fs);
    // ahead of them all, the truck: they close on it, and Kael looks up the road at it
    hwyShot('road',1.2);
    yield* all(truckTo(S.story.truck,TRUCK.x,2.2,eOut),(function*(){yield* wait(.6);lookAt(K,-1,1.6);})());
    yield* wait(.3);},
  introSkip(st){hwyRoad(st);S.scroll=Math.min(S.scroll,-3000);const T=S.story.truck;if(T){truckShift(T,TRUCK.x-T.x);T.vx=0;}S.fade=0;},
  *outro(st){const K=hero(),B=K.mount;
    // the helicopter has not come yet (the last of them went down together): it comes now, for the truck
    if(!S.story.heliDone)yield* hwyHeli(true);
    letter(1);hwyShot('road',1);
    K.rideFight=false;K.guarding=false;K.counter=false;K.facing=B.fa;B.ctl='script';B.vx=0;
    yield* act(K,rollUpAction(K,S.t));stowBlade(K);
    // a look up the road after the helicopter going away over the city, and on west toward the tower district
    lookAt(K,-1,1.3);yield* wait(1);
    S.hooks.sound('rev',1);B.pitchT=.16;K.offstage=true;
    yield* rideTo(B,-320,B.dep,1.5,eIn);B.pitchT=0;
    yield* wait(.25);},
  outroSkip(st){}});
STAGES[stageIx('chase')].next='highway';
// a new fight's ground: whatever the last stage left of the highway is not this one's
V11.duelStart.push(()=>{S.hwy=null;});
// the fight's start sets every fighter's own guard: the two who are not in it keep theirs (the man in the bed standing among his drums,
// the man in white on his gun, leaning into it)
function hwyHands(){const sv=S.story;if(!sv||sv.key!=='highway')return;
  if(sv.drummer&&!sv.drummer.dead)standEasy(sv.drummer);
  const M=sv.white;if(M&&!M.dead){standEasy(M);M.guardArm=()=>hwyGunArm(M)||easyArm(M);M.guardBody=()=>{const b=easyBody(M);return M.inHeli&&M.inHeli.gunOn?{...b,crouch:.9,lean:.3}:b;};}}
{const sf=storyFight;storyFight=function(l){sf(l);hwyHands();};}

// ---------- the camera ----------
// the scene's shots: where the camera looks and how wide, and the band of the picture it keeps between the bars; on a narrow screen
// (n) its own, an upright phone having the height to keep the ramp's whole bend in view at once
const HWY_SHOTS={top:{x:650,w:900,band:{top:-104,foot:296},n:{x:740,w:440,top:-100,foot:470}},
  mid:{x:630,w:900,band:{top:-20,foot:380},n:{x:720,w:440,top:-40,foot:500}},
  foot:{x:560,w:900,band:{top:96,foot:496},n:{x:600,w:460,top:40,foot:520}},
  road:{x:450,w:900,band:null,n:{x:450,w:520}},
  drum:{x:420,w:820,band:null,n:{x:400,w:440,top:150,foot:500}},
  heli:{x:560,w:900,band:{top:-80,foot:320},n:{x:560,w:620,top:-150,foot:470}},
  guns:{x:520,w:900,band:{top:-2,foot:398},n:{x:520,w:620,top:-110,foot:480}}};
function hwyShot(k,rate,o){const C=HWY_SHOTS[k],x=o&&o.x!=null?o.x:C.x;camTo(x,C.w,rate);const c=S.camCut;if(C.band)c.band={...C.band};
  c.xn=o&&o.xn!=null?o.xn:C.n.x;c.wn=C.n.w;if(C.n.top!=null)c.bandN={top:C.n.top,foot:C.n.foot};}

// ---------- the ramp's foot ----------
// Each bike comes off the bend onto the straight and settles into its place in the fight (Kael at his spawn, the others at their
// homes) while the road takes up their pace: S.scrollV goes from nothing to the highway's speed as the bikes slow in the picture, and
// the ramp and the garage go away behind with the road.
function* hwyMerge(st,fs){const K=hero(),dur=1.4,t0=S.t;S.hwy.phase='merge';
  const L=[[K.mount,st.spawn[0][0]+SEAT_DX,st.spawn[0][1]],...fs.map(f=>[f.mount,f.homeX+SEAT_DX,f.homeZ])].map(([B,x,z])=>({B,x0:B.x,z0:B.dep,x,z,k0:B.vk||1,s0:B.vyaw||0}));
  while(true){const u=clamp((S.t+DT-t0)/dur,0,1),e=sstep(u);S.scrollV=-HWY_V*sstep(clamp(u*1.5,0,1));
    for(const b of L){const B=b.B;B.vx=(lerp(b.x0,b.x,e)-B.x)/DT;B.dep=lerp(b.z0,b.z,e);B.vk=lerp(b.k0,1,e);B.vyaw=lerp(b.s0,0,e);B.spd=HWY_V;
      const f=B.rider;if(f){f.dep=f.stepDep=B.dep;}}
    if(u>=1)break;yield;}
  hwyRoad(st);}
// on the straight: everyone where the fight starts, the ramp behind them, the road at the highway's speed
function hwyRoad(st){const K=hero(),fs=S.F.filter(f=>f.team===1&&!f.npc);S.hwy.phase='road';S.hwy.persp=false;S.scrollV=-HWY_V;
  const put=(f,x,z)=>{const B=f.mount;if(!B)return;B.hide=false;B.air=0;B.vk=1;B.vyaw=0;B.fa=-1;B.carry=0;B.spd=0;bikePlace(B,x,z);f.hidden=false;f.offstage=false;f.look=null;f.facing=-1;};
  put(K,st.spawn[0][0]+SEAT_DX,st.spawn[0][1]);for(const f of fs)put(f,f.homeX+SEAT_DX,f.homeZ);}

// ---------- between the turns: the drums, and the helicopter ----------
// A turn of the fight starts only when the road allows it: when a drum is due (every few turns, by the dice) the man in the truck
// throws it first, a scene of its own; once two of the riders are down the helicopter comes in first. Each scene ends where the turn
// would have started, and the turn goes to whoever's it is then.
{const stt=startTurn;startTurn=function(i){const sv=S.story;
  if(!sv||sv.key!=='highway'||sv.step!=='fight'||S.cut||!S.F[0]||S.F[0].dead||!foes().length){stt(i);return;}
  sv.turnN=(sv.turnN||0)+1;
  const back=()=>{if(!S.story||S.story.step!=='fight')return;if(hero().dead){endFight(false);return;}if(!foes().length){storyCleared();return;}letter(0);camFree();stt(nextActor());};
  if(!sv.heliDone&&sv.kills>=2){cutStart('highway:heli',hwyHeli(false),{then:back});return;}
  const T=sv.truck,M=sv.drummer;
  if(sv.turnN>=sv.drumAt&&T&&T.ctl==='run'&&T.drums>0&&M&&!M.dead){sv.drumAt=sv.turnN+3+(S.rng()<.5?1:0);cutStart('highway:drum',hwyDrum(),{then:back});return;}
  stt(i);};}
// a rider down on the highway counts toward the helicopter's coming
V11.kill.push(D=>{const sv=S.story;if(sv&&sv.key==='highway'&&D.team===1&&!D.npc)sv.kills=(sv.kills||0)+1;});
// A drum: the man in the bed heaves one off the stack onto his shoulder, swings it back and throws it down the road at Kael; it comes
// down ahead of him and the road brings it to him or past him. Where it goes up the dice said as it left his hands: on him (a heavy
// blow), close by (a lighter one) or clear (nothing). He keeps his seat; the other riders are left out of its blast.
function* hwyDrum(){const sv=S.story,K=hero(),KB=K.mount,T=sv.truck,M=sv.drummer,a=M.arm;sv.drumN=(sv.drumN||0)+1;
  hwyShot('drum',2.6,{x:clamp((M.station+K.station)/2+20,300,560),xn:clamp((M.station+K.station)/2,260,600)});
  T.drums=Math.max(0,T.drums-1);M.hold='drum';M.facing=1;
  const low={hand:{sh:[.36*a,.66*a]},wAng:1.4,off:{sh:[.16*a,.7*a]},tilt:.15},up={hand:{sh:[.1*a,-.4*a]},wAng:1.1,off:{sh:[-.14*a,-.36*a]},tilt:.05},
    back={hand:{sh:[-.24*a,-.5*a]},wAng:.9,off:{sh:[-.4*a,-.38*a]},tilt:-.1},out={hand:{sh:[.6*a,-.18*a]},wAng:.2,off:{sh:[.5*a,-.04*a]},tilt:.15};
  M.action={t0:S.t,end:1.25,body:[{t:0,v:()=>({...easyBody(M),crouch:.8,lean:.42})},{t:.32,v:()=>({...easyBody(M),crouch:.95,lean:-.05}),e:eOut},{t:.64,v:()=>({...easyBody(M),crouch:.92,lean:-.22})},
      {t:.84,v:()=>({...easyBody(M),crouch:.86,lean:.4}),e:eIn},{t:1.25,v:()=>easyBody(M),e:sstep}],
    arm:[{t:0,v:low},{t:.32,v:up,e:eOut},{t:.64,v:back,e:sstep},{t:.82,v:out,e:eIn},{t:1.25,v:()=>easyArm(M),e:sstep}]};
  S.hooks.sound('thud',160,{s:'thud_metal'});
  yield* wait(.82);
  // where it goes up: on him, close by, or clear (the game's dice), and so where it is thrown to come down
  const r=S.rng(),hit=r<.36,near=!hit&&r<.66,dmg=hit?12+Math.floor(S.rng()*9):near?5+Math.floor(S.rng()*5):0;
  const side=S.rng()<.5?-1:1,at=hit?KB.x-6:near?KB.x+side*(70+S.rng()*30):KB.x+(side<0?-230:250),dz=hit?0:(S.rng()-.5)*50;
  const tgt={x:at-82,y:S.arena.ground(KB.x,KB.dep)-DRUM.r,dep:clamp(KB.dep+dz,DEP_MIN,DEP_MAX)};
  const d=throwDrum(M,tgt,.62,.3);M.hold=null;S.hooks.sound('swing',2.4,{s:'swing_heavy'});
  yield* until(()=>!S.drums.includes(d),2.4);
  if(S.drums.includes(d)){d.goAt=S.t;yield;}
  // the blast on him: he keeps his seat, and it costs him what the dice said
  if(dmg){K.hp=Math.max(0,K.hp-dmg);popup(K,String(dmg),'#ffffff',hit?'Caught in the blast':'Scorched',26);logNote(K,hit?'Caught in the blast':'Scorched by the blast','−'+dmg);
    K.posture='off';K.motor=Math.min(K.motor,hit?.4:.7);if(K.hp<=0)kill(K,1);}
  else{popup(K,'Clear','#9fd6ff','The drum goes up wide',20);logNote(K,'Clear of the drum');}
  S.hooks.status();
  yield* wait(.75);camFree();}

// The helicopter: in low over the road from behind them, its door coming open with the man in white on the gun; a burst into each
// rider still up, then the fire walked along the truck into its drums; and away over the city. last: the riders are all down
// already, and it comes for the truck alone.
function* hwyHeli(last){const sv=S.story,K=hero(),T=sv.truck,M=sv.white,D0=sv.drummer;sv.heliDone=true;
  letter(1);hwyShot('heli',1.4);
  const H=heliNew({x:W+760,y:200,xT:W+760,yT:200,dep:HWY_HELI.dep,fa:-1,lamp:1,spin:1,door:0});sv.heli=H;H.gunAng=HWY_GUN.rest;H.gunAngT=HWY_GUN.rest;
  M.inHeli=H;M.station=heliDoor(H).x;M.lane=M.dep=M.stepDep=H.dep-2;M.build();M.heliAt=null;
  S.hooks.sound('heli',1);
  // in over them from behind, low; Kael looks back and up at it
  H.xT=HWY_HELI.x;H.yT=HWY_HELI.y;
  yield* wait(.5);lookAt(K,1,2.4);
  yield* until(()=>Math.abs(H.x-HWY_HELI.x)<60,2.2);
  // the door slides back: the man in white, behind the gun
  M.hidden=false;H.gunOn=true;S.hooks.sound('heli_door',1);
  yield* until(()=>{H.door=Math.min(1,H.door+DT*1.8);return H.door>=1;},1);
  hwyShot('guns',1.6);
  // Kael knows the helicopter, and not the man on its gun (since V107, asked for)
  yield* wait(.35);
  yield* speak(HERO_NAME,'The family’s helicopter. I don’t know the man in white.',{dur:3});
  // the riders still up, a burst into each
  for(const f of S.F){if(f.team!==1||f.npc||f.dead||!f.mount)continue;
    yield* hwyBurst(H,()=>({x:f.p[CHE].x,y:f.p[CHE].y,dep:f.dep}),8,{kind:'flesh',spread:18,each:(i,to)=>{
      if(i===2||i===5)bleed(to,Math.sign(to.x-H.x)||-1,6,f.dep,.9);
      if(i===4&&!f.dead){f.hp=0;kill(f,Math.sign(f.p[CHE].x-hwyGun(H).piv.x)||-1);logNote(f,'Cut down from the helicopter');}}});
    yield* wait(.2);}
  // then the truck: along its flank into the drums
  if(T&&T.ctl==='run'){const tb=truckBed(T);
    yield* hwyBurst(H,i=>({x:lerp(tb.x1+20,tb.x0+50,i/13),y:tb.y-14-(i%3)*12,dep:T.dep-4}),14,{kind:'metal',spread:20,gap:.06});
    // the drums go up, and the truck with them
    const c={x:(tb.x0+tb.x1)/2,y:tb.y-26};boom(c.x,c.y,T.dep-6,2,'fuel',{spare:S.F.slice()});
    yield* wait(.16);boom(tb.x0-80,c.y+12,T.dep-4,1.3,'fuel',{spare:S.F.slice()});
    T.ctl='wreck';T.wreckT=S.t;T.burn=1;T.wreck=1;T.lamp=0;T.jolt=1;T.drums=0;
    S.fires.push({x:tb.x0+90,y:tb.y,dep:T.dep-3,w:170,h:120,seed:41,k:1,truck:T},{x:tb.x0-110,y:tb.y-20,dep:T.dep-2,w:120,h:90,seed:57,k:.9,truck:T});
    // the man in the bed thrown off it, back and up over the tail
    if(D0&&!D0.dead){D0.offTruck=true;D0.crashed=true;D0.offstage=true;D0.hp=0;kill(D0,1);for(const q of D0.p){q.px-=(170+40*Math.random())*DT;q.py+=(300+60*Math.random())*DT;}}
    S.shake=Math.max(S.shake,14);}
  yield* wait(1);
  // its work done, it lifts away ahead of them over the city
  H.gunOn=false;H.gunAngT=HWY_GUN.rest;H.xT=-760;H.yT=430;S.hooks.sound('heli',.6);
  yield* wait(.8);
  if(!last)camFree();}
// the helicopter gone from the picture: the man in its door with it
V11.step.push(()=>{if(S.arenaKey!=='highway')return;const sv=S.story;if(!sv||!sv.heli)return;const H=sv.heli;
  if(H.x<-700&&S.veh.includes(H)){S.veh.splice(S.veh.indexOf(H),1);if(sv.white){sv.white.hidden=true;sv.white.inHeli=null;}}});
// ===== THE TOWER ROAD END =====
