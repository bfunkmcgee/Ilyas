// ===== STORY START =====
// The prologue: Kael's last night working for the family, from a crop field outside the city to the roof of the Hallowell tower.
// Each stage is a fight of the ordinary game (or a ride) set up from the stage's own record, with scenes between the fights. A
// scene is a script: a generator function the sim runs one step at a time (S.cut), so a scene is as repeatable as a fight. The
// scripts move fighters, vehicles and the camera, play poses and put lines of dialogue on screen; the page only draws them.
// The skirmish lab runs exactly as before whenever S.story is null.
S.story=null;S.cut=null;S.veh=[];S.say=null;S.camCut=null;S.letter=0;S.card=null;S.fade=0;S.booms=[];
S.hooks.story=()=>{};
function storyOn(){return!!S.story;}

// ---------- arenas the story adds ----------
// They are the story's own: kept out of the lab's list of arenas (not enumerable), there by name for whatever looks one up.
function storyArena(k,a){a.story=true;Object.defineProperty(ARENAS,k,{value:a,enumerable:false,configurable:true,writable:true});}
storyArena('crops',{label:'Crops',name:'The crop field',ground:()=>GB,wall:null,far:278});
// the road outside the Sprawl at sundown, where the prologue opens: the top of a rise, the land falling away beyond its brow
storyArena('outskirts',{label:'Outskirts',name:'The road outside the Sprawl',ground:()=>GB,wall:null,far:150});
// the chase: a city avenue that runs past (S.scroll is how far the riders have come, S.scrollV how fast, in world units)
storyArena('chase',{label:'Chase',name:'The avenue',ground:()=>GB,wall:null,far:210,scroll:true,minX:110,maxX:770});
S.scroll=0;S.scrollV=0;

// ---------- scene scripts ----------
// A script yields once per sim step until it is done. These are the pieces scripts are made of.
function* wait(s){const t=S.t+s;while(S.t<t)yield;}
function* until(fn,max){const t=S.t+(max??1e9);while(!fn()&&S.t<t)yield;}
// run several scripts side by side; done when all are
function* all(...gs){const live=gs.slice();while(live.length){for(let i=live.length-1;i>=0;i--){if(live[i].next().done)live.splice(i,1);}if(live.length)yield;}}
// walk a fighter to (x, depth) at v units a second; steps and stance come from his own pose, as on the way between rooms. The way
// goes round the dividers and the table the way a walk between rooms does (o.direct: straight there, whatever is in the way).
function* goTo(f,x,z,v=110,o){
  const pts=o&&o.direct?null:scenePath(f,x,z);
  if(pts)for(let i=1;i<pts.length-1;i++)yield* walkLeg(f,pts[i][0],pts[i][1],v,true);
  yield* walkLeg(f,x,z,v,false);}
function scenePath(f,x,z){const divs=S.divs&&S.divs.some(w=>divSolid(w)),tb=typeof tableIntact==='function'&&tableIntact();if(!divs&&!tb)return null;
  const pts=walkPath(f,x,z);return pts.length>2?pts:null;}
// one straight leg of a walk; more: another leg follows, so he keeps walking. On the last leg the walk knows where it ends, and his
// last step comes down there rather than past it.
function* walkLeg(f,x,z,v,more){f.cutWalk=true;f.walkEnd=more?null:{x,z};
  // never longer than the walk should take: something else holding the fighter back (the stage's edge, a body in the way) cannot
  // keep a scene waiting for ever
  const t1=S.t+Math.hypot(x-f.station,z-f.lane)/v+1.5;
  while(true){const dx=x-f.station,dz=z-f.lane,d=Math.hypot(dx,dz),st=v*DT;if(Math.abs(dx)>3)f.facing=Math.sign(dx);
    if(d<=st||S.t>t1){f.station=x;f.lane=z;break;}f.station+=dx/d*st;f.lane+=dz/d*st;f.walkV={x:dx/d*v,z:dz/d*v};yield;}
  // stopped: no pace left over to carry his next step past where he stands
  if(!more){f.cutWalk=false;f.walkV=null;f.walkEnd=null;f.velX=0;}}
// a keyframed pose (the game's own action format), then on when it has played
function* act(f,a){f.action=a;const t=a.t0+a.end;while(S.t<t)yield;}
// a line of dialogue: on screen until the player moves it on, or for its time when nobody is there to (auto battle, the checks)
function* speak(who,text,o={}){const dur=o.dur??Math.max(2.2,1.1+text.length*.055);S.say={who,text,t0:S.t,dur,col:o.col||null,adv:false,side:o.side||0};
  while(!(S.say&&S.say.adv)&&S.t<S.say.t0+dur*(S.auto||S.storyAuto?1:1.35))yield;S.say=null;yield* wait(o.gap??.15);}
// ride a bike to (x, depth) in dur seconds along an easing (the scene drives it; its rider goes with it)
function* rideTo(B,x,z,dur,ease){const x0=B.x,z0=B.dep,t0=S.t,E=ease||sstep;B.ctl='script';
  while(true){const u=clamp((S.t+DT-t0)/dur,0,1),e=E(u);B.vx=(lerp(x0,x,e)-B.x)/DT;B.dep=lerp(z0,z??z0,e);if(u>=1)break;yield;}
  B.vx=0;}
// put a bike (and whoever is on it) somewhere at once
function bikePlace(B,x,z){const dx=x-B.x;B.x=x;B.vx=0;if(z!=null){B.dep=z;B.vdep=0;}B.gy=S.arena.ground(B.x,B.dep);
  const f=B.rider;if(f){for(const q of f.p){q.x+=dx;q.px+=dx;}if(f.scarf)for(const q of f.scarf){q.x+=dx;q.px+=dx;}
    f.dep=f.stepDep=B.dep;f.station=B.x+B.fa*SEAT_DX;f.lane=clamp(B.dep,DEP_MIN,DEP_MAX);}}
// a look over the shoulder toward one side of the world (-1 left, +1 right) for dur seconds
function lookAt(f,side,dur){f.look={t0:S.t,end:dur,keys:[[0,0],[.22,side],[Math.max(.3,dur-.25),side],[dur,0]],slow:true};}
function camTo(x,w,k){S.camCut={x,w,k:k??2.2};}
function camFree(){S.camCut=null;}
function letter(on){S.letter=on?1:0;}
// start a scene: the fight's turn order stops while it plays. then() runs when it ends or is skipped; skip() puts the world in its end
// state when the player skips (a scene without skip() cannot be skipped)
function cutStart(name,gen,o={}){S.cut={name,it:gen,then:o.then||null,skip:o.skip||null,t0:S.t};S.game.phase='cut';S.game.ex=null;S.game.aiAt=null;S.opening=null;S.hooks.story('cut',name);}
function cutStep(){const C=S.cut;if(!C)return;
  if(C.skipNow&&C.skip){S.cut=null;S.say=null;C.skip();finishCut(C);return;}
  let r;try{r=C.it.next();}catch(e){console.error('scene '+C.name,e);r={done:true};}
  if(r.done&&S.cut===C){S.cut=null;finishCut(C);}}
function finishCut(C){S.say=null;S.hooks.story('cutEnd',C.name);if(C.then)C.then();}
function cutSkip(){if(S.cut&&S.cut.skip)S.cut.skipNow=true;}
V11.step.push(cutStep);

// ---------- poses for the scenes ----------
// standing easy: upright, weight on the back foot, arms down; a fighter in a scene stands like this until he squares up
function easyBody(f){const leg=f.leg,G=gaitOf(f);let crouch=.97,lean=.02+f.body.posture*.5;
  // walking: the hips ride up over the planted foot and settle as the next one lands, and he leans a little into the walk
  if(G){const u=clamp((S.t-G.t0)/G.beat,0,1);crouch=GAIT.low+GAIT.bob*Math.sin(Math.PI*Math.min(1,u/GAIT.swing));lean+=GAIT.lean*G.along;}
  return{px:f.station,pz:f.lane,crouch,lean,stF:.12*leg,stB:-.14*leg,th:.25};}
function easyArm(f){const a=f.arm,G=gaitOf(f);
  if(!G)return{hand:{sh:[.1*a,.92*a]},wAng:1.25,off:{sh:[-.06*a,.94*a]},tilt:0};
  // walking: each arm swings against the leg on its side, a pendulum from the shoulder, the elbow giving a little on the way forward
  const u=clamp((S.t-G.t0)/G.beat,0,1),A=GAIT.arm*a*(.55+.45*G.along),sw=(G.cur===0?1:-1)*Math.cos(Math.PI*u)*A,hang=(x,b)=>{const r=.95*a;return[b+x,Math.sqrt(Math.max(0,r*r-x*x))-(x>0?x*.18:0)];};
  return{hand:{sh:hang(sw,.05*a)},wAng:1.25+sw/a*.6,off:{sh:hang(-sw,-.03*a)},tilt:0};}
// ---------- walking ----------
// In a scene a man walks rather than shuffles: his feet take turns on a beat that suits his pace, the trailing foot swung through and
// set down half a stride ahead of his hips while the other carries him, then a moment on both feet before the next. f.cutWalk is set
// while a scene walks him (goTo); f.gait keeps the beat. Standing still, or fighting, the game's own footing takes over again.
const GAIT={swing:.84,lift:.08,low:.925,bob:.035,lean:.07,arm:.38};
function gaitOf(f){const G=f.gait;return G&&G.on&&f.cutWalk&&!f.mount&&!f.dead&&f.motor>.45?G:null;}
{const us=updateSteps;updateSteps=function(f,pelTX,bp){
  if(!f.cutWalk||f.mount||f.dead||f.motor<.45){if(f.gait)f.gait.on=false;return us(f,pelTX,bp);}
  // the pace he is being walked at (the scene's), or failing that the pace his hips are going
  const st=f.steps,fa=f.facing,leg=f.leg,WV=f.walkV,vx=WV?WV.x:f.velX,vz=WV?WV.z:(f.vdep||0),v=Math.hypot(vx,vz*.6);
  for(const s of st){if(s.active&&S.t-s.t0>=s.dur){s.active=false;s.plant={x:s.to.x,y:f.gr(s.to.x)-3};}else if(!s.active)s.plant.y=f.gr(s.plant.x)-3;}
  const G=f.gait||(f.gait={on:false,cur:0,k:0,t0:0,beat:.5,next:0,along:1});
  // coming to a stop: the step in the air is finished first, then the usual footing squares him up
  if(v<12){if(G.on&&(st[0].active||st[1].active))return;G.on=false;return us(f,pelTX,bp);}
  const dir=Math.sign(vx)||fa;
  if(!G.on){G.on=true;G.next=S.t;G.k=(st[0].plant.x-st[1].plant.x)*dir<0?0:1;}
  if(S.t<G.next||st[0].active||st[1].active)return;
  // the pace sets the beat: a longer, easier step when he strolls, a quicker one when he means it
  const beat=clamp(lerp(.56,.42,(v-60)/90),.4,.58),along=Math.min(1,Math.abs(vx)/v),stride=clamp(v*beat,18,leg*.9)*along;
  // from where his hips really are (they trail the scene's mark a little): where they will be when the foot comes down, and half a
  // stride beyond
  const k=G.k,s=st[k],dur=beat*GAIT.swing;let land=f.p[PEL].x+vx*dur+dir*stride*.5;
  // the last steps come down where the walk ends, not a stride past it
  const E=f.walkEnd;if(E&&Math.abs(vx)>8){const lim=E.x+dir*leg*.2;if((land-lim)*dir>0)land=Math.max(lim*dir,s.plant.x*dir)*dir;}
  st[k]={active:true,t0:S.t,dur,from:{x:s.plant.x,y:s.plant.y},to:{x:footClamp(f,land)},lift:leg*GAIT.lift*(.6+.4*along),plant:s.plant,walk:true};
  G.cur=k;G.k=1-k;G.t0=S.t;G.beat=beat;G.next=S.t+beat;G.along=along;f.lastFoot=k;f.stepDep=f.dep;};}
function standEasy(f,on=true){if(on){f.guardBody=()=>easyBody(f);f.guardArm=()=>easyArm(f);}else{delete f.guardBody;delete f.guardArm;}}
// the arc-blade rolled up inside its hilt and clipped to his belt (f.stow: the page draws the hilt there, not in his hand)
function stowBlade(f,on=true){f.stow=on;f.arcRev=null;f.arc=on?{t0:1e9,unroll:[0,0],lock:[0,0]}:null;}

// ---------- vehicles ----------
// A bike in its own frame: x forward along its facing, y up from the ground. Its painter (VehLook in the page) draws the same frame.
// B.ctl says who moves it: 'script' (a scene drives it at B.vx, and its rider goes with it), 'rider' (in a fight it goes where its
// rider's plan puts his hips, the way a man's feet carry him on foot), or 'crash' (down and sliding, nobody on it).
const BIKE={rear:[-60,25],front:[64,25],R:25,seat:[-18,68],peg:[-22,28],grip:[32,86],lamp:[57,79],pivot:[-60,0],tank:[4,82]};
const SEAT_DX=-14;          // the rider's hips sit this far behind the bike's x, along its facing
const ROAD_MU=.03;          // how much speed the road takes off anything sliding on it, in units a step, each step (about half a g)
function bikeNew(o){const B=Object.assign({kind:'bike',x:200,dep:120,fa:1,vx:0,vdep:0,pitch:0,pv:0,pitchT:0,wheel:0,light:0,run:0,holster:null,rider:null,wreck:0,dust:0,gy:GB,
  ctl:'script',lie:0,style:'elven',tx:null,tz:null},o||{});
  B.gy=S.arena.ground(B.x,B.dep);S.veh.push(B);return B;}
// a point of the bike's frame in the world, wheelie included (it turns about the rear tyre's contact point)
function bikeAt(B,lx,ly){const a=B.pitch||0,px=BIKE.pivot[0],dx=lx-px,dy=ly,c=Math.cos(a),s=Math.sin(a);
  return{x:B.x+B.fa*(px+dx*c-dy*s),y:B.gy-(dx*s+dy*c)};}
// Bikes ridden side by side keep apart in depth wherever they overlap along the road, so two machines never stand in each other:
// the rider's lane is where he fights (the game's line), the bike's depth is where he is drawn.
function bikeSpacing(){const L=S.veh.filter(B=>B.kind==='bike'&&B.ctl==='rider'&&B.rider);
  for(const B of L)B.tzV=clamp(B.tz??B.dep,DEP_MIN,DEP_MAX);
  for(let it=0;it<3;it++)for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=L[i],b=L[j],ov=184-Math.abs(a.x-b.x);if(ov<=0)continue;
    const need=26*clamp(ov/90,0,1),dz=b.tzV-a.tzV;if(Math.abs(dz)>=need)continue;const s=dz>0?1:dz<0?-1:(a.idx??0)<(b.idx??0)?1:-1,push=(need-Math.abs(dz))/2;
    a.tzV=clamp(a.tzV-s*push,DEP_MIN,DEP_MAX);b.tzV=clamp(b.tzV+s*push,DEP_MIN,DEP_MAX);}}
function vehStep(){
  const gv=S.scrollV||0;S.scroll+=gv*DT;
  bikeSpacing();
  for(let i=S.veh.length-1;i>=0;i--){const B=S.veh[i];if(B.kind!=='bike')continue;
    if(B.ctl==='rider'&&B.rider&&B.tx!=null){
      // after the rider's plan: hard on the throttle and the brakes, never past what a bike can do
      const k=B.k||150,c=2*Math.sqrt(k)*.9,ax=clamp(k*(B.tx-B.x)-c*B.vx,-2800,2800);B.vx=clamp(B.vx+ax*DT,-820,820);
      const kz=70,cz=2*Math.sqrt(kz);B.vdep+=(kz*((B.tzV??B.dep)-B.dep)-cz*B.vdep)*DT;B.dep=clamp(B.dep+B.vdep*DT,DEP_MIN-4,DEP_MAX+4);
      // the front comes up a little on the throttle and dips on the brakes
      B.pitchT=clamp(ax*B.fa*.000035,-.015,.07);}
    else if(B.ctl==='crash'){const u=S.t-B.crashT,rel=B.vx+gv;B.lie=Math.min(1,u/.38);B.run=Math.max(0,B.run-DT*1.5);B.light=Math.max(0,B.light-DT*.6);B.pitchT=0;
      // down on its side the road takes its speed off, until it lies still on the road and goes by with it
      if(B.lie>.4){B.vx-=Math.sign(rel)*Math.min(Math.abs(rel),640*DT);
        if(Math.abs(rel)>70&&!S.warming&&Math.random()<.8){const q=bikeAt(B,-10+Math.random()*60,4);sparks(q,1,Math.random()<.5?'#ffd27a':'#fff3cf',B.dep);}}
      else B.vx-=Math.sign(rel)*Math.min(Math.abs(rel),180*DT);
      if(B.x<-360){S.veh.splice(i,1);continue;}}
    B.x+=B.vx*DT;B.wheel+=(B.vx+gv)*B.fa*DT/BIKE.R*(1-B.lie*.7);B.gy=S.arena.ground(B.x,B.dep);
    // the front comes up and down on a damped spring toward its target
    B.pv+=(60*(B.pitchT-B.pitch)-9*B.pv)*DT;B.pitch=Math.max(-.02,B.pitch+B.pv*DT);
    if(B.pitch<=-.02&&B.pv<0)B.pv=0;
    if(B.dust>0)B.dust=Math.max(0,B.dust-DT*.8);}
}
V11.step.push(vehStep);
// The family's train: an engine and its open flatcars on the rails (TrainLook in the page draws it in the same frame). T.x is the
// engine's nose, the cars trail behind it; T.gy is the rail top, and a flatcar's deck stands TRAIN.deck above it. It runs at T.v
// (world units a second), and whoever is riding it (T.riders) goes where it goes.
const TRAIN={loco:236,car:300,gap:16,deck:41,hw:44,wheel:19};
function trainNew(o){const T=Object.assign({kind:'train',x:500,gy:GB+TRAIN.deck,dep:236,fa:1,cars:2,lamp:1,run:0,wheel:0,v:0,riders:[]},o||{});S.veh.push(T);return T;}
// car i's deck in the world: its x range and its height
function trainDeck(T,i){const f=-(TRAIN.loco+TRAIN.gap+i*(TRAIN.car+TRAIN.gap)),a=T.x+T.fa*(f-6),b=T.x+T.fa*(f-TRAIN.car+6);return{x0:Math.min(a,b),x1:Math.max(a,b),y:T.gy-TRAIN.deck};}
// the train and its riders moved along together: the whole man, where his feet are planted on the deck and where a step of his is
// going, and where his hips were a moment ago (so the move is not a walk of his own)
function trainShift(T,dx){T.x+=dx;for(const f of T.riders){f.station+=dx;for(const q of f.p){q.x+=dx;q.px+=dx;}if(f.scarf)for(const q of f.scarf){q.x+=dx;q.px+=dx;}
  for(const s of f.steps){if(s.plant)s.plant={x:s.plant.x+dx,y:s.plant.y};if(s.from)s.from={x:s.from.x+dx,y:s.from.y};if(s.to)s.to={x:s.to.x+dx};}
  if(f.lastPelTX!=null)f.lastPelTX+=dx;if(f.curBody)f.curBody={...f.curBody,px:f.curBody.px+dx};}}
V11.step.push(()=>{for(const T of S.veh){if(T.kind!=='train')continue;const dx=T.v*DT;if(dx)trainShift(T,dx);
  T.wheel+=T.v*T.fa*DT/TRAIN.wheel;T.run=clamp(Math.abs(T.v)/320,0,1);}});
// run the train to x in dur seconds along an easing (its riders with it)
function* trainTo(T,x,dur,ease){const x0=T.x,t0=S.t,E=ease||sstep;
  while(true){const u=clamp((S.t+DT-t0)/dur,0,1);T.v=(lerp(x0,x,E(u))-T.x)/DT;if(u>=1)break;yield;}T.v=0;}

// ---------- riding ----------
// A rider sits on the bike instead of standing: hips on the seat, feet on the pegs. Getting on, f.mountU runs from 0 to 1: the far
// leg swings over the seat and the hips come down onto it. His legs go the bike's way; above the hips he turns to whoever he
// fights, as a man turns in the saddle. His free hand keeps the bars (f.offBar===false lets it go, for a scene that needs it).
function mount(f,B,dur){f.mount=B;B.rider=f;B.idx=f.idx;f.mountU=dur?0:1;f.mountDur=dur||0;f.mount0={pel:{x:f.p[PEL].x,y:f.p[PEL].y},ftF:{x:f.p[FTF].x,y:f.p[FTF].y},ftB:{x:f.p[FTB].x,y:f.p[FTB].y},dep:f.dep};
  f.facing=B.fa;f.vdep=0;f.crashed=false;}
function dismount(f){const B=f.mount;if(B&&B.rider===f)B.rider=null;f.mount=null;f.mountU=1;f.station=f.p[PEL].x;f.lane=clamp(f.dep,DEP_MIN,DEP_MAX);f.steps[0].active=f.steps[1].active=false;
  f.steps[0].plant={x:f.p[FTF].x,y:f.p[FTF].y};f.steps[1].plant={x:f.p[FTB].x,y:f.p[FTB].y};f.rideFight=false;}
// where the hands go on the bike: the grip, or the tank in front of him when he has turned round to fight behind
function barGrip(B,k){const g=bikeAt(B,BIKE.grip[0],BIKE.grip[1]);return k?{x:g.x-B.fa*2,y:g.y+1}:g;}
function barHold(f){const B=f.mount;return f.facing===B.fa?barGrip(B,1):bikeAt(B,BIKE.tank[0],BIKE.tank[1]);}
// both hands on the bars, riding
function rideArm(f){const B=f.mount;return{hand:{w:barGrip(B,0)},wAng:1.2,off:{w:barGrip(B,1)},tilt:.05};}
function mountControl(f){
  const p=f.p,b=f.body,wp=f.wp,sk=f.sk,B=f.mount,bf=B.fa,fa=f.facing;
  if(f.dead)f.motor=Math.max(0,f.motor-DT*(S.t<f.dyingUntil?1:4));
  else if(S.t<f.knockUntil)f.motor=Math.min(f.motor,.04);
  else f.motor=Math.min(1,f.motor+lerp(.75,1.9,sk)*DT);
  const w=lerp(15,30,sk),z=lerp(.36,.8,sk);
  // the plan: an action when one plays, else his guard in a fight or the bars when he only rides
  let bp=null,ap=null,act=false;
  if(f.action){const lt=S.t-f.action.t0;
    if(lt>f.action.end)f.action=null;
    else{act=true;const leadA=clamp(2*z/w,.035,.07)+(wp.mass>2?.025:0);
      bp=sample(f.action.body,lt+.1,(a,c,u)=>blendBody(f,a,c,u));ap=sample(f.action.arm,lt+leadA,(a,c,u)=>blendArm(f,a,c,u));}}
  if(!act){bp=f.guardBody();ap=f.rideFight?f.guardArm():f.rideArm?f.rideArm(f):rideArm(f);}
  if(f.mountU<1)f.mountU=Math.min(1,f.mountU+DT/Math.max(.05,f.mountDur));
  const m=f.motor,u=f.mountU,e=sstep(u),M0=f.mount0;
  // in a fight the bike goes where his plan puts his hips; in a scene the bike is driven and he goes where it goes
  if(B.ctl==='rider'){B.tx=bp.px-bf*SEAT_DX;B.tz=bp.pz??f.lane;}
  else{f.station=B.x+bf*SEAT_DX;f.lane=clamp(B.dep,DEP_MIN,DEP_MAX);}
  f.dep=f.stepDep=u<1?lerp(M0.dep,B.dep,e):B.dep;f.vdep=0;
  // seated he stays seated: a blow rocks him above the hips; only a man going down (or dead) loses the seat and the pegs
  const sm=f.dead||f.downed?m:Math.max(m,.7);
  const seat=bikeAt(B,BIKE.seat[0]+4,BIKE.seat[1]+5),peg=bikeAt(B,BIKE.peg[0],BIKE.peg[1]);
  const pel=u<1?{x:lerp(M0.pel.x,seat.x,e),y:lerp(M0.pel.y,seat.y,e)-Math.sin(Math.PI*u)*10}:seat;
  for(const q of p){q.fx=0;q.fy=0;}
  const d=f.dbg;d.pel=pel;
  spring(p[PEL],pel,3*b.mass,u<1?24:40,.95,Math.pow(sm,.8),null,0);
  // the lean (signed along the road): over the tank when riding, less when he fights forward; turned round, about upright, and a
  // pose's own lean carries him toward his man either way
  const rl=f.rideLean??(f.rideFight?.24:.48);
  let Lw=fa===bf?bf*(rl+(act||f.rideFight?.55*bp.lean:0)):fa*.62*bp.lean+bf*.06;
  if(u<1)Lw=lerp(fa*bp.lean,Lw,e);
  d.che={x:p[PEL].x+Math.sin(Lw)*b.torso,y:p[PEL].y-Math.cos(Lw)*b.torso};
  spring(p[CHE],d.che,3*b.mass,w*1.05,z,m,p[PEL],.35);
  let tx=p[CHE].x-p[PEL].x,ty=p[CHE].y-p[PEL].y;const tl=Math.hypot(tx,ty)||1;tx/=tl;ty/=tl;
  const tt=(ap.tilt||0)*fa,ct=Math.cos(tt),sn=Math.sin(tt);
  d.head=tacHead(f,{x:p[CHE].x+(tx*ct-ty*sn)*b.neck,y:p[CHE].y+(tx*sn+ty*ct)*b.neck});
  if(!f.severed)spring(p[HEAD],d.head,1.2*b.mass,w,z,m,p[CHE],.3);
  const arm=f.arm,hand=reachClamp(p[CHE],f.resolve(ap.hand),arm*.985);
  d.elF=ik(p[CHE],hand,b.ua,b.fa,fa,true);
  const aw=1-.14*Math.min(2,f.wounds.arm);
  spring(p[ELF],d.elF,.8*b.mass,w*.9*aw,z,m,p[CHE],.4);spring(p[HAF],hand,.6*b.mass,w*aw,z,m,p[CHE],.4);d.hand=hand;
  const wa=ap.wAng,hbx=lerp(p[HAF].x,hand.x,.6),hby=lerp(p[HAF].y,hand.y,.6),wl=f.lash?f.sticks[10][2]:wp.len;
  d.tip={x:hbx+fa*Math.cos(wa)*wl,y:hby+Math.sin(wa)*wl};spring(p[TIP],d.tip,(wp.off?1.2:.8)*b.mass,w*aw,z,m,p[HAF],.3);
  let off;
  if(f.offBar!==false&&u>=1&&!(f.dead||f.downed))off=barHold(f);
  else if(ap.off==='grip'){const h=p[HAF],t=p[TIP];off={x:h.x+(t.x-h.x)/wp.len*wp.off,y:h.y+(t.y-h.y)/wp.len*wp.off};}
  else off=f.resolve(ap.off);
  off=reachClamp(p[CHE],off,arm*.985);d.off=off;d.elB=ik(p[CHE],off,b.ua,b.fa,fa,true);
  spring(p[ELB],d.elB,.8*b.mass,w*.9,z,m,p[CHE],.4);spring(p[HAB],off,.6*b.mass,w,z,m,p[CHE],.4);
  // the legs go the bike's way: the near foot leaves the ground for the peg halfway on, the far one swings up and over the seat. A
  // kick in a pose reaches out from the peg.
  for(let k=0;k<2;k++){const kn=k?KNB:KNF,ft=k?FTB:FTF,s0=k?M0.ftB:M0.ftF;let fT;
    if(u>=1)fT={x:peg.x-bf*(k?3:-1),y:peg.y};
    else if(k===0){const v=sstep(clamp((u-.45)/.55,0,1));fT={x:lerp(s0.x,peg.x,v),y:lerp(s0.y,peg.y,v)-Math.sin(Math.PI*v)*12};}
    else{const v=sstep(clamp(u/.8,0,1));fT={x:lerp(s0.x,peg.x,v)-bf*Math.sin(Math.PI*v)*26,y:lerp(s0.y,peg.y,v)-Math.sin(Math.PI*v)*(f.leg*.95)};}
    if(k===0&&bp.kick&&bp.kw>.01&&u>=1){const kp=kickPoint(f,bp.kick);fT={x:lerp(fT.x,kp.x,bp.kw),y:lerp(fT.y,kp.y,bp.kw)};}
    const hip={x:p[PEL].x+bf*(k?-2:2),y:p[PEL].y},knT=ik(hip,p[ft],b.th,b.sh,bf,false);
    spring(p[kn],knT,1.2*b.mass,w*.9,z,sm,p[PEL],.3);spring(p[ft],fT,.9*b.mass,w*1.3,.9,sm,p[PEL],.15);
    if(k){d.ftB=fT;d.knB=knT;}else{d.ftF=fT;d.knF=knT;}}
  // what the next pose starts from: the plan as the game knows it (his station and lane, his own lean), not the saddle's
  f.curBody={px:bp.px,pz:bp.pz??f.lane,crouch:bp.crouch,lean:bp.lean,stF:bp.stF,stB:bp.stB,th:bp.th??.2,lift:0,kw:0};
  f.curArm={hand:{w:{x:hand.x,y:hand.y}},wAng:ap.wAng,off:{w:{x:off.x,y:off.y}},tilt:ap.tilt||0};
  f.lastPelTX=bp.px;f.velX=B.vx;
}
// riders are carried by their bikes: the core's own control is for fighters on their feet
{const cf=controlAndForces;controlAndForces=function(f){if(f.mount){mountControl(f);return;}cf(f);};}
{const up=updateSteps;updateSteps=function(f,pelTX,bp){if(f.mount)return;up(f,pelTX,bp);};}

// ---------- fighting from the saddle ----------
// What a man can't do on a bike: grab, throw, go round, pick things up, draw a second blade, help a partner up.
const RIDE_NO=['grab','throw','flank','pincer','bind','pickup','draw','helpup','cover','push','breakfree','shield','stab','getup','roll'];
{const cv=cmdValid;cmdValid=function(A,D,cmd){if(A&&A.mount&&RIDE_NO.includes(cmd))return false;return cv(A,D,cmd);};}
{const sa=slotAction;slotAction=function(A,D,slot){const s=sa(A,D,slot);if(!A||!A.mount||A.dead||!s||!RIDE_NO.includes(s))return s;return['advance','wait','guard'].includes(slot)?slot:null;};}
// a rider put down is off his bike, and the number over him says so
{const pu=popup;popup=function(f,text,color,sub,...r){if(f&&f.mount&&f.downed&&(sub==='Knocked down'||sub==='Swept'))sub='Off the bike';return pu(f,text,color,sub,...r);};}
// nothing on the road trips a man on a bike
{const th=tripHazard;tripHazard=function(D,...a){return D&&D.mount?null:th(D,...a);};}
// A rider put down comes off: thrown up and back, and his bike goes down and slides. Kael keeps his seat, rocked back instead.
{const kd=knockDown;knockDown=function(D){
  if(D&&D.mount&&!D.dead&&D.mount.ctl==='rider'){
    if(D===hero()){D.posture='off';D.motor=Math.min(D.motor,.4);if(!S.warming)popup(D,'Keeps his seat','#a9e88c',null,18,-52);return;}
    kd(D);D.thrown={x:-D.mount.fa*170,y:-240};return;}
  kd(D);};}
// a rider killed in the saddle goes back off it the way the blow came
V11.kill.push((D,dir)=>{if(D.mount&&!D.thrown)D.thrown={x:(dir||-D.facing)*120-D.mount.fa*70,y:-160};});
function bikeCrash(f){const B=f.mount;if(!B)return;
  dismount(f);f.crashed=true;f.offstage=true;f.motor=Math.min(f.motor,.03);
  const th=f.thrown||{x:-B.fa*120,y:-160};f.thrown=null;
  for(let i=0;i<f.p.length;i++){if(i===TIP)continue;const q=f.p[i];q.px-=th.x*DT;q.py-=th.y*DT;}
  // and off to one side, away from Kael's line, so the body goes by beside him and not through him
  const K=hero();f.vdep=(K&&K!==f?Math.sign(f.dep-K.dep)||1:1)*110;
  B.ctl='crash';B.crashT=S.t;B.rider=null;B.tx=null;
  if(!f.dead)kill(f,-B.fa);
  S.hooks.sound('crash',1);S.shake=Math.max(S.shake,5);}
// every step: a man going limp in the saddle comes off; whoever has slid far enough back down the road is gone from the fight;
// on a moving road what lies on it goes by with it
function riderStep(){
  for(const f of S.F){
    if(f.mount){if((f.dead||f.downed)&&f.motor<.32&&!f.impaled)bikeCrash(f);continue;}
    if(f.crashed&&!f.gone&&f.p[PEL].x<-240&&f.p[HEAD].x<-200)f.gone=true;}
  if(S.arena&&S.arena.scroll&&S.scrollV){const dx=S.scrollV*DT;
    for(let i=S.stains.length-1;i>=0;i--){const s=S.stains[i];s.x-=dx;if(s.x<-260)S.stains.splice(i,1);}
    for(let i=S.items.length-1;i>=0;i--){const it=S.items[i];if(!it.stuck&&Math.max(it.a.x,it.b.x)<-260)S.items.splice(i,1);}}}
V11.step.push(riderStep);
// the road: a body or a loose weapon on it slides, losing speed against a surface that goes by at the chase's speed
// The whole body loses speed against the road as long as some of it is down on it (the friction is the body's weight, wherever it
// touches); the parts that touch drag a little more, so the body tumbles as it goes.
{const co=collide;collide=function(f,final){if(!f.crashed||!S.arena||!S.arena.scroll){co(f,final);return;}
  const p=f.p,gv=(S.scrollV||0)*DT;let n=0,M=0,mv=0;
  for(let i=0;i<p.length;i++){const q=p[i],g=f.gr(q.x)-q.r;if(q.y>g)q.y=g;
    if(!final||i===TIP)continue;M+=q.m;mv+=q.m*(q.x-q.px);if(q.y<g-.6)continue;n++;
    const vr=q.x-q.px+gv,v2=Math.sign(vr)*Math.max(0,Math.abs(vr)-ROAD_MU*.6);q.px=q.x-(v2-gv);
    if(q.vy0>0){q.py=q.y+q.vy0*.16;const spd=q.vy0/DT;
      if(spd>240&&S.t-f.lastDust[i]>.25){f.lastDust[i]=S.t;dust(q.x,g+q.r,clamp(spd/600,.4,1.3),f.dep);if(spd>300)S.hooks.sound('thud',spd);}}}
  if(final&&n){const vr=mv/M+gv,dv=Math.sign(vr)*Math.min(Math.abs(vr),ROAD_MU*Math.min(1,n/2.5));for(const q of p)q.px+=dv;}};}
{const gp=groundPt;groundPt=function(q,final,fr,dep){if(!S.arena||!S.arena.scroll){gp(q,final,fr,dep);return;}
  const g=S.arena.ground(q.x,dep)-q.r;if(q.y>g)q.y=g;
  if(final&&q.y>=g-.5){const gv=(S.scrollV||0)*DT,vr=q.x-q.px+gv,v2=Math.sign(vr)*Math.max(0,Math.abs(vr)-ROAD_MU*2);q.px=q.x-(v2-gv);if(q.vy0>0)q.py=q.y+q.vy0*.12;}};}
// a ground can keep the riders off its edges (the chase keeps the whole of every bike in view)
{const cs=clampStage;clampStage=function(x){const a=S.arena;return a&&a.minX!=null?clamp(x,a.minX,maxStation()):cs(x);};}

// ---------- the story's fighters ----------
// A story foe carries his own record (f.scfg) in place of the bench's: weapon, rank, temper, hit points. The humans are crews
// (f.hench) dressed from their own wardrobe (f.ward); the named ones are the game's own elves.
{const fc=foeCfg;foeCfg=f=>f.scfg||fc(f);const ft=foeDefaultTemper;foeDefaultTemper=f=>f.scfg?f.scfg.temper||'plain':ft(f);}
{const ar=armsRoom;armsRoom=f=>f.armsRoom||ar(f);}
// Kael for the prologue: a master of the arc-blade at the top of his strength, so the fights show what he can do
const STORY_KAEL={seed:2207,weapon:'elven',skill:5,hp:260};
function storyKael(){let K=S.story&&S.story.K;
  if(!K){K=new Fighter(0,0,HERO_NAME,HERO_COLOR);Object.assign(K,{seed:STORY_KAEL.seed,weaponKey:STORY_KAEL.weapon,skill:STORY_KAEL.skill});S.story.K=K;}
  return K;}
// the stage's roster: Kael, then the stage's enemies in order
function storyRoster(st){
  const K=storyKael(),F=[K];
  st.foes.forEach((e,i)=>{const f=new Fighter(i+1,1,e.name,e.color||FOE_COLORS[i%3]);f.scfg={seed:e.seed,weapon:e.weapon,skill:e.skill,temper:e.temper||'plain'};
    Object.assign(f,{seed:e.seed,weaponKey:e.weapon,skill:e.skill,temper:e.temper||'plain'});
    if(e.human){f.hench=true;f.hc=f.scfg;f.ward=e.ward||'street';f.armsRoom=e.arms||'street';}
    // a beast is shaped as one from the start (its body comes from the beasts' painter)
    if(e.beast)f.beast=e.beast;
    f.storyHp=e.hp;F.push(f);});
  S.F=F;S.trails=F.map(()=>[]);S.crew=null;}
// a fresh fight on the stage's ground, set up the way initDuel sets up the lab's, without its intro: the stage's scene runs first
function storyDuel(st){
  const SV=S.story;S.arenaKey=st.arena;S.room=st.room||'dining';S.arena=st.room&&st.arena==='restaurant'?roomArena(st.room):ARENAS[st.arena];
  S.opening=null;S.rubble=[];S.debris=[];S.items=[];S.blood=[];S.stains=[];S.clinches=[];S.veh=[];S.booms=[];S.say=null;S.camCut=null;S.scroll=0;S.scrollV=st.scrollV||0;S.fade=0;S.thought=null;
  S.wall=S.arena.wall?{hp:3,state:'standing',breakBy:0,breakFrom:null,dir:1}:null;
  S.stage={phase:1,tr:null};S.finaleDone=false;S.endText=null;S.cfg.n=st.foes.length;S.cfg.crew=false;S.cfg.ally.on=false;
  S.tableOn=!!st.table;S.divOn=!!st.divs;S.backroom=false;S.deep=false;S.bistro=S.story.flags.blown?'blown':'intact';
  storyRoster(st);
  const sp=st.spawn,K=S.F[0],hw=S.cfg.hero.weapon;S.cfg.hero.weapon=STORY_KAEL.weapon;
  S.F.forEach((f,i)=>initFighter(f,sp[i],sp));S.cfg.hero.weapon=hw;K.stow=false;K.arcRev=null;K.perch=null;K.grenade=S.story.flags.grenade?'coat':null;
  K.zMax=null;K.hidden=false;K.pitClip=null;K.coatOff=!!S.story.flags.coatOff;K.coatShield=0;K.coatShred=0;K.charge=S.story.flags.coatOff&&!S.story.flags.charged?'belt':null;K.rideLift=false;K.drain=0;K.eyeLit=0;
  // between stages he gets some of his breath back: a third of his strength, never more than all of it
  K.maxHp=STORY_KAEL.hp;K.hp=SV.hp==null?K.maxHp:Math.min(K.maxHp,Math.round(SV.hp+K.maxHp*(SV.healAt===SV.key?0:.3)));SV.healAt=SV.key;K.sidearm='sheathed';
  for(const f of S.F)if(f.team===1&&f.storyHp){f.maxHp=f.hp=f.storyHp;}
  S.target=1;S.table=null;S.wares=[];if(S.tableOn){const td=tableDefault();if(td)placeTable(td.x,td.d);}
  envBuild();
  S.F.forEach(f=>{f.ready=Math.round(actionCost(f,'slash')*.5);});
  for(const fn of V11.duelStart)fn();
  S.pending=[];S.queued=null;S.shake=0;S.freeze=0;S.slowT=0;S.trails=S.F.map(()=>[]);S.lastFlank=-99;
  S.game={phase:'cut',turnNo:1,active:0,ex:null,aiAt:null};S.intro=null;
  if(st.setup)st.setup(st);
  // the bodies settle onto their feet before the scene starts (a man in mid-air is left where the stage put him)
  if(!st.noWarm)warm(90);}
// the fight proper: weapons out, as every fight of the game starts, then the first turn
function storyFight(list){for(const f of S.F){standEasy(f,false);if(f.stow)stowBlade(f,false);f.offstage=false;
    // on a bike he fights from the saddle: from here the bike goes where he means to be
    if(f.mount&&!f.dead){const B=f.mount;B.ctl='rider';f.rideFight=true;f.station=B.x+B.fa*SEAT_DX;f.lane=clamp(B.dep,DEP_MIN,DEP_MAX);B.tx=B.x;B.tz=B.dep;}}
  if(S.F.some(f=>f.mount))resolveStations();letter(0);camFree();
  S.story.step='fight';const I=prepIntro((list||S.F).filter(f=>!f.dead),S.t+.05);S.game.phase='intro';S.hooks.intro('start');S.hooks.story('fight');void I;}

// ---------- the stages ----------
// A stage: its ground, its enemies and where everyone stands (spawn[0] Kael, then each enemy [x, depth, side]); intro and outro
// are scripts; next is the stage after it. Stages that are not built yet end the prologue for now.
const STAGES=[];
function stageIx(key){return STAGES.findIndex(s=>s.key===key);}
function storyBegin(key,o={}){
  S.story={i:0,key:null,step:'card',flags:{},K:null,hp:null,auto:!!o.auto,lab:S.story&&S.story.lab||labSave()};
  // a chapter picked from the menu starts the night as the stages before it left it: the grenade in the coat, the bistro's doors
  // blown in, the coat gone
  if(key)for(const st of STAGES.slice(0,Math.max(0,stageIx(key))))Object.assign(S.story.flags,st.flagsOut||{});
  S.storyAuto=!!o.auto;storyStage(key||STAGES[0].key);}
// the stages a build plays (a list while some are still being made): null plays them all
let STORY_READY=null;
function stageReady(st){return!!st&&(!STORY_READY||STORY_READY.includes(st.key));}
function storyStage(key){const st=STAGES[stageIx(key)];if(!stageReady(st)){storyEnd(true);return;}
  const SV=S.story;SV.i=stageIx(key);SV.key=key;SV.step='card';SV.flagsAt=JSON.stringify(SV.flags);SV.hpAt=SV.hp;
  storyDuel(st);S.card=st.cardDur===0?null:{num:st.num,title:st.title,sub:st.sub,t0:S.t,dur:st.cardDur??2.6};S.hooks.story('stage',st);
  cutStart(st.key+':intro',(function*(){if(S.card){yield* wait(S.card.dur-.6);S.card.out=S.t;}yield* st.intro(st);})(),{skip:st.introSkip?()=>{S.card=null;st.introSkip(st);}:null,then:()=>{if(S.story&&S.story.step!=='fight')storyFight();}});}
// every enemy down: the stage's closing scene, then the next stage
function storyCleared(){const SV=S.story,st=STAGES[SV.i];SV.step='outro';SV.hp=hero().hp;
  const g=S.game;g.phase='cut';g.ex=null;g.aiAt=null;for(const f of S.F)f.intent=null;S.hooks.status();
  if(!st.outro){storyStage(st.next);return;}
  cutStart(st.key+':outro',(function*(){yield* wait(.9);yield* st.outro(st);})(),{skip:st.outroSkip?()=>st.outroSkip(st):null,then:()=>{if(S.story)storyStage(st.next);}});}
// Kael down: the stage can be tried again from its start, with the state it began with
function storyRetry(){const SV=S.story;if(!SV)return;SV.flags=JSON.parse(SV.flagsAt||'{}');SV.hp=SV.hpAt;storyStage(SV.key);}
function storyEnd(done){const SV=S.story;if(!SV)return;SV.step='done';S.hooks.story('end',done);}
// leaving the story puts the bench back the way the player had it
function labSave(){return{arenaKey:S.arenaKey,n:S.cfg.n,crew:S.cfg.crew,ally:S.cfg.ally.on,tableOn:S.tableOn,divOn:S.divOn,backroom:S.backroom,deep:S.deep};}
function storyQuit(){const SV=S.story;if(!SV)return;const L=SV.lab;S.story=null;S.storyAuto=false;S.cut=null;S.say=null;S.camCut=null;S.letter=0;S.card=null;S.veh=[];S.fires=[];S.booms=[];S.scroll=0;S.scrollV=0;S.fade=0;S.thought=null;
  S.arenaKey=L.arenaKey;S.cfg.n=L.n;S.cfg.crew=L.crew;S.cfg.ally.on=L.ally;S.tableOn=L.tableOn;S.divOn=L.divOn;S.backroom=L.backroom;S.deep=L.deep;S.hooks.story('quit');}

// When a fight of the story ends the game would put up its own result: here every enemy down hands over to the stage's closing
// scene, and Kael down offers the stage again.
function storyCatchOver(fn){if(!S.story||S.story.step!=='fight'){fn();return;}
  const ov=S.hooks.over;let res=null;S.hooks.over=w=>{res=w;};try{fn();}finally{S.hooks.over=ov;}
  if(res===true)storyCleared();else if(res===false){S.story.step='fallen';S.hooks.story('fallen');}}
{const fe=finishExchange;finishExchange=function(){storyCatchOver(fe);};}
{const ef=endFight;endFight=function(won){storyCatchOver(()=>ef(won));};}

// ===== THE OPENING: SUNDOWN =====
// Before the field, the road outside the Sprawl at sundown. The picture opens on the sky, the prologue's title over it (S.story.title),
// and comes down to him: he sits his bike on the
// shoulder of a dirt road along the top of a rise, the farms below and the city on the horizon, the sun going down behind him. The
// picture closes in slowly while he talks. He turns his head to the sun and says a little about where he learned to ride. As he says it
// a few grains of sand blow past the bike (S.story.sand: the page draws them), a fine gold run of it along the road that is gone as
// soon as it comes. There is no sand on that road: it is the desert in his head, the border wire he rode for the Rangers before the
// family had him (the fall says so, at the end of the night). It is meant to be missed the first time through. Then he starts the bike
// and is off down the road and over the brow; the picture lets him go and turns to the city, where far off his tail light crosses the
// valley toward it (S.story.far: the page draws it) as the last of the sun goes. The field is where the road takes him.
const SUNDOWN={bike:{x:300,dep:112},sand:{at:.8,dur:1.15},far:{dur:3.4},title:{kick:'PROLOGUE',text:'The Long Night',dur:3.8},
  // the road's middle in plane depth: along the rise, bending away over the brow on the right (its painter draws the same road)
  road:x=>114+Math.max(0,x-700)*.13+Math.sin(x*.011)*2.5,
  // the shots: where the camera looks (xn, wn: on a narrow screen) and the band of the picture it keeps between the bars (bandN: on a
  // narrow screen held upright, which has height to spare). sky: the opening, the sky over the sun; road: down to him on the road;
  // close: in on him and the sun while he talks; ride: wider as he goes; city: the city on the horizon at the end
  shots:{sky:{x:400,xn:245,w:760,wn:380,band:{top:-40,foot:200},bandN:{top:-300,foot:300}},
    road:{x:400,xn:245,w:760,wn:380,band:{top:170,foot:430},bandN:{top:-60,foot:545}},
    close:{x:330,xn:262,w:560,wn:320,band:{top:200,foot:420},bandN:{top:-20,foot:520}},
    ride:{x:520,xn:470,w:760,wn:380,band:{top:170,foot:430},bandN:{top:-60,foot:545}},
    city:{x:760,xn:740,w:640,wn:340,band:{top:190,foot:385},bandN:{top:-40,foot:470}}}};
function sundownCam(c,k){camTo(c.x,c.w,k);Object.assign(S.camCut,{xn:c.xn,wn:c.wn,band:{...c.band},bandN:{...c.bandN}});}
// the picture tilting from one shot's band to another's over dur seconds (the camera follows the band as it moves)
function* sundownTilt(a,b,dur){const t0=S.t;
  while(true){const u=sstep((S.t-t0)/dur),C=S.camCut;
    if(C){C.band={top:lerp(a.band.top,b.band.top,u),foot:lerp(a.band.foot,b.band.foot,u)};C.bandN={top:lerp(a.bandN.top,b.bandN.top,u),foot:lerp(a.bandN.foot,b.bandN.foot,u)};}
    if(u>=1)break;yield;}}
// his head turning on its own, the rest of him still (f.headTurn: 0 in profile; toward -pi it goes round past the viewer to look
// behind him, the face turned to us on the way)
function* turnHead(f,to,dur){const a=f.headTurn||0,t0=S.t;while(S.t<t0+dur){f.headTurn=lerp(a,to,sstep((S.t-t0)/dur));yield;}f.headTurn=to;}
// (he is the same man in every stage: off the bike and out of the saddle's lean before the field, which starts him on foot)
function sundownEnd(K){if(K.mount)dismount(K);delete K.rideLean;delete K.headTurn;K.offstage=false;K.look=null;if(S.story)S.story.title=null;}
STAGES.push({key:'sundown',num:'',title:'',sub:'',arena:'outskirts',next:'field',noFight:true,cardDur:0,foes:[],spawn:[[SUNDOWN.bike.x+SEAT_DX,SUNDOWN.bike.dep]],
  setup(st){const K=hero(),B=bikeNew({x:SUNDOWN.bike.x,dep:SUNDOWN.bike.dep,fa:1,holster:'rifle',light:0});S.story.bike=B;S.story.sun={t0:S.t};S.story.sand=null;S.story.far=null;S.story.title=null;S.fade=1;
    standEasy(K);stowBlade(K);K.station=B.x+SEAT_DX;K.lane=K.dep=K.stepDep=B.dep;K.facing=1;K.build();
    // sitting the bike at rest: upright in the saddle, his hands on the bars
    mount(K,B,0);K.rideLean=.1;K.headTurn=0;},
  *intro(st){const K=hero(),B=S.story.bike,SH=SUNDOWN.shots;S.story.sun={t0:S.t};
    letter(1);sundownCam(SH.sky,0);
    // the sky first, the title over it, and down to the road as the light comes up
    S.story.title={t0:S.t+.4,dur:SUNDOWN.title.dur,kick:SUNDOWN.title.kick,text:SUNDOWN.title.text};
    yield* all(until(()=>{S.fade=Math.max(0,S.fade-DT*.5);return S.fade<=0;},2.6),(function*(){yield* wait(.7);yield* sundownTilt(SH.sky,SH.road,3.4);})(),
      (function*(){yield* wait(.4+SUNDOWN.title.dur);S.story.title=null;})());
    yield* wait(.5);
    // in on him and the sun, slowly, while he talks; he turns his head to the sun behind him
    sundownCam(SH.close,.28);
    yield* turnHead(K,-2.3,.9);
    yield* speak(HERO_NAME,'The sun takes its time out here.',{dur:2.6});
    yield* all(turnHead(K,0,.9),wait(.3));
    // and says where he learned to ride; as he says it, the sand
    const sand=(function*(){yield* wait(SUNDOWN.sand.at);S.story.sand={t0:S.t,x:B.x,d:B.dep};yield* wait(SUNDOWN.sand.dur);S.story.sand=null;})();
    yield* all(speak(HERO_NAME,'On the wire it dropped like a stone, and the cold came up out of the ground.',{dur:4.4}),sand);
    yield* wait(.4);
    yield* speak(HERO_NAME,'Going to be a long night.',{dur:2.2});
    yield* wait(.35);
    // the lamp and the engine; forward over the tank, and the picture opens out
    B.light=1;B.run=1;S.hooks.sound('engine',1);sundownCam(SH.ride,.8);
    yield* until(()=>{K.rideLean=Math.min(.48,K.rideLean+DT*.7);return K.rideLean>=.48;},1);
    yield* wait(.25);
    // off down the road: the back wheel throws dirt, the front comes up, and he is gone over the brow toward the farms
    B.dust=1;B.rev=1;S.hooks.sound('rev',1);K.offstage=true;if(!S.warming)S.camKick={x:-2.5,y:1.5,t:0};
    const t0=S.t;
    yield* until(()=>{const u=S.t-t0;B.vx=Math.min(560,70+u*240+u*u*260);B.pitchT=u>.2&&u<.75?.22:0;B.dep=SUNDOWN.road(B.x);B.dust=Math.max(B.dust,.8);return B.x>W+160;},5);
    B.pitchT=0;B.rev=0;
    // the picture turns to the city; far off, his tail light crosses the valley toward it as the last of the sun goes
    sundownCam(SH.city,.7);S.story.far={t0:S.t};
    yield* wait(SUNDOWN.far.dur-1.25);
    yield* until(()=>{S.fade=Math.min(1,S.fade+DT/1.25);return S.fade>=1;},1.4);
    B.run=0;S.story.far=null;sundownEnd(K);},
  introSkip(st){const B=S.story.bike;S.story.sand=null;S.story.far=null;S.fade=1;if(B){B.run=0;B.rev=0;}sundownEnd(hero());}});

// ===== STAGE I: THE FIELD =====
// A farm track on the edge of the city at night. Kael has left his bike at the edge of the clearing with his rifle in its holster;
// Hallowell has sent a crew of six hired men for him, and they come out of the maize three at a time. They are farm hands and drivers
// with blades and clubs, and against the arc-blade in the hands of a master each of them lasts a cut or two: the fight is here to
// show what Kael is. When they are all down he rolls the blade up, gets on the bike and is gone toward the tower.
const FIELD_CREW=[{seed:4307,weapon:'spear',skill:1,temper:'rusher'},{seed:4349,weapon:'dagger',skill:1,temper:'brute'},{seed:4391,weapon:'sword',skill:1,temper:'rusher'}];
STAGES.push({key:'field',num:'I',title:'The Field',sub:'The Sprawl’s farm edge, an hour before midnight',arena:'crops',next:'chase',
  foes:[{name:'Field hand',human:true,ward:'field',arms:'street',seed:4101,weapon:'sword',skill:1,temper:'brute',hp:16,color:'#c98a5a'},
        {name:'Driver',human:true,ward:'field',arms:'street',seed:4177,weapon:'club',skill:2,temper:'rusher',hp:18,color:'#9aa86a'},
        {name:'Lookout',human:true,ward:'field',arms:'street',seed:4231,weapon:'axe',skill:1,temper:'rusher',hp:14,color:'#a88cc0'}],
  spawn:[[330,98],[600,70,1],[680,134,1],[560,150,1]],
  setup(st){const K=hero();const B=bikeNew({x:150,dep:150,fa:1,holster:'rifle',light:.25});S.story.bike=B;
    standEasy(K);stowBlade(K);K.station=228;K.lane=K.dep=K.stepDep=138;K.facing=1;K.build();
    // the men are still in the maize
    for(const f of S.F)if(f.team===1){f.homeX=f.station;f.homeZ=f.lane;f.station=990+f.idx*40;f.offstage=true;f.facing=-1;standEasy(f);f.build();}
    // and three more behind them, who come out on the right as the first ones fall (the crew's rules: three on their feet at most)
    storyCrew({room:'field',beast:null,names:['Reaper','Ditcher','Picker'],colors:['#b89a68','#8fa2b4','#c07e66'],hp:14,ward:'field',arms:'street',sides:[1],queue:FIELD_CREW});},
  *intro(st){const K=hero(),fs=S.F.filter(f=>f.team===1);
    letter(1);camTo(560,560,0);yield* wait(.4);camTo(470,820,1.1);
    // Kael looks out at the city a moment, then turns back toward the bike
    yield* wait(1.4);
    yield* goTo(K,300,110,70);
    yield* speak(HERO_NAME,'Every floor lit. Hallowell knows I’m coming. Good.',{dur:3});
    camTo(480,900,1.6);
    // the maize parts: three of them, spread out
    yield* all(...fs.map((f,i)=>(function*(){yield* wait(i*.35);yield* goTo(f,f.homeX,f.homeZ,96);f.offstage=false;f.facing=-1;})()));
    K.facing=1;
    yield* speak('Driver','Turn the bike around, elf. Hallowell’s paying, and there’s six of us.',{dur:3.2});
    yield* speak(HERO_NAME,'I counted.',{dur:1.4});
    yield* wait(.2);},
  introSkip(st){const K=hero();K.station=300;K.lane=K.dep=110;K.facing=1;
    for(const f of S.F)if(f.team===1){f.station=f.homeX;f.lane=f.dep=f.homeZ;f.offstage=false;f.facing=-1;f.build();}K.build();},
  *outro(st){const K=hero(),B=S.story.bike;
    letter(1);camTo(Math.max(260,Math.min(640,(K.station+B.x)/2)),760,1.2);
    standEasy(K);K.guarding=false;
    // the blade rolls back up into its hilt
    yield* act(K,rollUpAction(K,S.t));stowBlade(K);
    yield* goTo(K,B.x-B.fa*12,B.dep-1,92);
    K.facing=B.fa;
    // on: the far leg over the seat, hips down, hands to the bars
    mount(K,B,.7);B.light=.25;yield* wait(.75);
    B.run=1;B.light=1;S.hooks.sound('engine',1);yield* wait(.5);
    // the back wheel spins in the dirt, the front comes up, and he is gone toward the city
    B.dust=1;S.hooks.sound('rev',1);B.vx=60;yield* wait(.25);
    B.pitchT=.34;B.vx=320;K.offstage=true;camTo(820,900,1.2);
    yield* until(()=>B.x>1050,4);B.pitchT=0;
    yield* wait(.3);},
  outroSkip(st){}});
// rolling the arc-blade back up after a fight: the blade comes up before him and its segments fold back into the hilt (f.arcRev:
// the page plays the unrolling backward), then the hilt goes to his belt
function rollUpAction(f,t0){const a=f.arm,up={hand:{sh:[.46*a,.08*a]},wAng:-.3,off:{sh:[.14*a,.5*a]},tilt:.02},low=easyArm(f),g=f.curArm||f.guardArm();
  f.arcRev={t0:t0+.32,dur:.5};
  return{t0,end:1.25,body:[{t:0,v:()=>f.guardBody()}],arm:[{t:0,v:g},{t:.3,v:up,e:sstep},{t:.85,v:up},{t:1.2,v:low,e:sstep},{t:1.25,v:low}]};}

// ===== STAGE II: THE AVENUE =====
// Into the city at speed. Three of Hallowell's riders come up behind Kael on the avenue and the fight is on the move: every bike goes
// where its rider means to be, a rider who goes down comes off at speed, and the road takes him and his bike away behind.
const CHASE_V=1050;          // the road's speed past the riders, units a second (about 45 km/h of city avenue)
STAGES.push({key:'chase',num:'II',title:'The Avenue',sub:'Into the city, a quarter to midnight',arena:'chase',next:'roadblock',scrollV:CHASE_V,
  foes:[{name:'Pack leader',human:true,ward:'bikers',arms:'street',seed:5103,weapon:'sword',skill:2,temper:'brute',hp:48,color:'#d9774e'},
        {name:'Outrider',human:true,ward:'bikers',arms:'street',seed:5161,weapon:'club',skill:2,temper:'rusher',hp:42,color:'#c4a24a'},
        {name:'Scrapper',human:true,ward:'bikers',arms:'street',seed:5227,weapon:'dagger',skill:1,temper:'plain',hp:38,color:'#9c8ad0'}],
  spawn:[[450,92],[660,128,1],[250,58,-1],[220,140,-1]],
  setup(st){const K=hero();
    // everyone is on a bike, still out of sight behind: Kael comes up the avenue first, and the three come after him
    const KB=bikeNew({x:-260,dep:92,fa:1,holster:'rifle',light:1,run:1});S.story.bike=KB;
    K.station=KB.x+SEAT_DX;K.lane=K.dep=K.stepDep=92;K.facing=1;K.build();mount(K,KB,0);stowBlade(K);K.offstage=true;
    for(const f of S.F)if(f.team===1){const sp=st.spawn[f.idx];f.homeX=sp[0];f.homeZ=sp[1];
      const B=bikeNew({x:-460-f.idx*110,dep:sp[1],fa:1,style:'street',paint:f.idx%2?'red':'black',light:1,run:1});
      f.station=B.x+SEAT_DX;f.lane=f.dep=f.stepDep=sp[1];f.facing=1;f.build();mount(f,B,0);f.offstage=true;}},
  *intro(st){const K=hero(),KB=K.mount,fs=S.F.filter(f=>f.team===1),L=fs[0];
    letter(1);camTo(450,900,0);
    // up the avenue through the late traffic, and settling in at the tower's pace
    yield* rideTo(KB,st.spawn[0][0]-SEAT_DX,st.spawn[0][1],1.8,eOut);K.offstage=false;
    yield* wait(.4);
    // headlamps behind him: three of Hallowell's riders, the leader round him on the far side
    lookAt(K,-1,2.2);S.hooks.sound('rev',.7);
    yield* all(...fs.map((f,i)=>(function*(){yield* wait(i*.28);yield* rideTo(f.mount,f.homeX-SEAT_DX,f.homeZ,f===L?2.5:1.9,eOut);f.offstage=false;})()));
    lookAt(L,-1,5.4);
    yield* speak('Pack leader','Hallowell pays by the ear, elf. We’d have done you for nothing.',{dur:3.2});
    lookAt(K,1,2.4);
    yield* speak(HERO_NAME,'Then you’ve been overpaid.',{dur:1.9});
    yield* wait(.1);},
  introSkip(st){const K=hero();bikePlace(K.mount,st.spawn[0][0]-SEAT_DX,st.spawn[0][1]);K.offstage=false;K.look=null;
    for(const f of S.F)if(f.team===1){bikePlace(f.mount,f.homeX-SEAT_DX,f.homeZ);f.offstage=false;f.look=null;}},
  *outro(st){const K=hero(),B=K.mount;
    letter(1);camTo(450,900,1);
    K.rideFight=false;K.guarding=false;K.counter=false;K.facing=B.fa;B.ctl='script';B.vx=0;
    // the blade rolls back up into its hilt, his free hand on the bars
    yield* act(K,rollUpAction(K,S.t));stowBlade(K);
    yield* wait(.35);
    // then he opens it up: the front lifts, and he is away up the avenue toward the tower
    S.hooks.sound('rev',1);B.pitchT=.16;K.offstage=true;
    yield* rideTo(B,1180,B.dep,1.5,eIn);B.pitchT=0;
    yield* wait(.25);},
  outroSkip(st){}});

// ===== STAGE III: THE CHECKPOINT =====
// Where the avenue meets the tower district the police have closed the road: barricades, floodlights, an armoured carrier with a
// gun on its roof and four officers. Kael goes through it the hard way: up off the bike with the rifle out of its scabbard, the bike
// on into the carrier, one round into its tank. Then the four with their handguns against his rifle. When it is over he drops the
// rifle, walks down the street and takes a grenade off the dead gunner's belt on the way past the wreck.
storyArena('roadblock',{label:'Roadblock',name:'The checkpoint',ground:()=>GB,wall:null,far:230});
// ---------- the carrier ----------
// drawn by ApcLook when the page has it; these are its box, the hatch where the gunner stands and the gun's muzzle
function apcNew(o){const A=Object.assign({kind:'apc',x:742,dep:150,fa:-1,gun:0,gunT:0,muzzle:0,lights:1,wreck:0,burn:0,jolt:0,tilt:0,gy:GB},o||{});A.gy=S.arena.ground(A.x,A.dep);S.veh.push(A);return A;}
function apcLook(){return typeof ApcLook!=='undefined'?ApcLook:null;}
function apcBox(A){const L=apcLook();return L&&L.box?L.box(A):{l:A.x-215,r:A.x+215,t:A.gy-150,b:A.gy};}
function apcHatch(A){const L=apcLook();return L&&L.hatchAt?L.hatchAt(A):{x:A.x-A.fa*40,y:A.gy-150};}
function apcGun(A){const L=apcLook();if(L&&L.gunAt)return L.gunAt(A);const a=A.fa>0?-A.gun:Math.PI+A.gun;return{x:A.x+A.fa*70+Math.cos(a)*40,y:A.gy-172+Math.sin(a)*40,ang:a};}
// the carrier settles back after the blast, and its gun swings toward where it is told
function apcStep(){for(const A of S.veh){if(A.kind!=='apc')continue;A.gun+=(A.gunT-A.gun)*Math.min(1,DT*6);if(A.muzzle>0)A.muzzle=Math.max(0,A.muzzle-DT*14);
  if(A.jolt>0)A.jolt=Math.max(0,A.jolt-DT*2.2);if(A.lift!=null){A.lv+=(-60*(A.tilt-A.tiltT)-6*A.lv)*DT;A.tilt+=A.lv*DT;}}}
V11.step.push(apcStep);
// ---------- fire and blast ----------
// S.booms are explosions (FxLook.boom draws them), S.fires the fires they leave. A blast throws everyone near it away from its
// centre, harder the closer they stand.
S.fires=[];
// a fire burns on the ground it was lit on: every new fight, stage or lab bout starts without the last one's fires and blasts
V11.duelStart.push(()=>{S.fires=[];S.booms=[];});
function boom(x,y,dep,size,kind,o={}){const b={x,y,dep,t0:S.t,size,seed:(S.rng()*1e9)|0,kind:kind||'fuel'};S.booms.push(b);
  S.shake=Math.max(S.shake,18*size);S.freeze=Math.max(S.freeze,.07);S.hooks.sound('boom',size);if(!S.warming)S.punch={x:prjX(x,dep),t:0};
  // the living are knocked flat close in and staggered further out; the dead go where the blast sends them
  for(const f of S.F){if(f.gone||(o.spare||[]).includes(f))continue;const P0=f.p[PEL],dx=P0.x-x,dz=(f.dep-dep)*.8,d=Math.hypot(dx,dz,P0.y-y)||1,k=clamp(1-d/(260*size),0,1);if(k<=0)continue;
    const live=!f.dead,s=live?.45:1,vx=dx/d*700*k*s,vy=-(240+360*k)*k*s;
    for(let i=0;i<f.p.length;i++){if(i===TIP)continue;const q=f.p[i];q.px-=vx*DT*(.7+Math.random()*.6);q.py-=vy*DT*(.7+Math.random()*.6);}
    f.vdep+=Math.sign(dz||1)*160*k*s;
    if(live){f.foot=Math.min(f.foot,2);if(k>.35&&!f.downed)knockDown(f);else f.motor=Math.min(f.motor,.35);}}
  return b;}
V11.step.push(()=>{if(S.booms.length)S.booms=S.booms.filter(b=>S.t-b.t0<9);});
// ---------- a man in a hatch ----------
// hips at the rim, legs down inside, hands on the gun's grips (f.perch gives the points)
function perchControl(f){const p=f.p,b=f.body,fa=f.facing,P0=f.perch;
  f.motor=Math.min(1,f.motor+DT);const m=f.motor,w=24,z=.7,pel=P0.pel(),gr=P0.grip();
  for(const q of p){q.fx=0;q.fy=0;}
  spring(p[PEL],pel,3*b.mass,40,.95,m,null,0);
  const ch={x:p[PEL].x+fa*Math.sin(.16)*b.torso,y:p[PEL].y-Math.cos(.16)*b.torso};spring(p[CHE],ch,3*b.mass,w,z,m,p[PEL],.35);
  let tx=p[CHE].x-p[PEL].x,ty=p[CHE].y-p[PEL].y;const tl=Math.hypot(tx,ty)||1;tx/=tl;ty/=tl;
  spring(p[HEAD],tacHead(f,{x:p[CHE].x+tx*b.neck+fa*2,y:p[CHE].y+ty*b.neck}),1.2*b.mass,w,z,m,p[CHE],.3);
  const arm=f.arm,h1=reachClamp(p[CHE],gr,arm*.985),h2=reachClamp(p[CHE],{x:gr.x-fa*3,y:gr.y+5},arm*.985);
  spring(p[ELF],ik(p[CHE],h1,b.ua,b.fa,fa,true),.8*b.mass,w*.9,z,m,p[CHE],.4);spring(p[HAF],h1,.6*b.mass,w,z,m,p[CHE],.4);
  spring(p[ELB],ik(p[CHE],h2,b.ua,b.fa,fa,true),.8*b.mass,w*.9,z,m,p[CHE],.4);spring(p[HAB],h2,.6*b.mass,w,z,m,p[CHE],.4);
  spring(p[TIP],{x:h1.x+fa*4,y:h1.y+6},.5*b.mass,w,z,m,p[HAF],.2);
  for(let k=0;k<2;k++){const kn=k?KNB:KNF,ft=k?FTB:FTF,fT={x:p[PEL].x+fa*(k?-5:5),y:p[PEL].y+f.leg*.95},hip={x:p[PEL].x+fa*(k?-2:2),y:p[PEL].y};
    spring(p[kn],ik(hip,p[ft],b.th,b.sh,fa,false),1.2*b.mass,w*.9,z,m,p[PEL],.3);spring(p[ft],fT,.9*b.mass,w,.9,m,p[PEL],.15);}
  f.curBody=f.guardBody();f.curArm={hand:{w:h1},wAng:.5,off:{w:h2},tilt:0};}
{const cf=controlAndForces;controlAndForces=function(f){if(f.perch&&!f.dead){perchControl(f);return;}cf(f);};}
// someone in the scene who is not in the fight (the carrier's gunner): a crewman in the stage's wardrobe, drawn and simulated, never
// given a turn
function storyExtra(name,o){const f=new Fighter(S.F.length,1,name,o.color||'#8a94a8');f.npc=true;f.hench=true;f.ward=o.ward;f.armsRoom=o.arms||'street';
  f.scfg={seed:o.seed,weapon:o.weapon||'fists',skill:1,temper:'plain'};Object.assign(f,{seed:o.seed,weaponKey:o.weapon||'fists',skill:1,temper:'plain'});
  f.setup(o.seed,f.weaponKey,1,o.x,o.dep);f.maxHp=f.hp=20;f.facing=o.facing||-1;f.build();f.side=1;f.reads={};f.wounds={head:0,arm:0,leg:0,body:0};f.marks=[];
  S.F.push(f);S.trails.push([]);return f;}
// ---------- cover ----------
// Concrete barriers the police have set across the road: low enough to shoot over standing up, high enough to hide behind crouched.
// To the game they are dividers that never break: nobody walks through one, and a body thrown into one stops against it. To a gun
// they are cover: a man who takes cover behind one ducks right down behind the concrete and is very hard to hit, a man standing at
// one to shoot still has it in front of his legs, and a round that misses him goes into the concrete.
DIV_MAT.concrete={name:'Concrete barrier',the:'the barrier',word:'barrier',hp:999,h:84,t:30,cost:0,slam:4,breach:999,snd:'plaster',bill:'fence'};
function barrierNew(x,d0,d1){const w=addDiv('concrete',x,d0,d1);w.chips=[];return w;}
// the barrier standing between D and whoever is shooting at him (A), close in front of D: the one he can use
function coverFrom(D,A){if(!D||!A||!S.divs||!S.divs.length)return null;const dir=Math.sign(A.station-D.station)||D.facing;
  for(const w of S.divs){if(w.mat!=='concrete'||!divSolid(w)||!divBand(w,D.lane,4))continue;
    const gap=dir>0?divL(w)-D.station:D.station-divR(w);if(gap>=0&&gap<=DIV_M+64&&(A.station-w.x)*dir>0)return w;}
  return null;}
{const sm=shotMods;shotMods=function(A,D,kind,i){const c=sm(A,D,kind,i),w=coverFrom(D,A);if(!w)return c;
  const down=D.guarding&&!D.downed,defMods=c.defMods.map(m=>m[0]==='cover'?['behind the barrier',down?6:2]:m);
  return{...c,defMods,def:10+sumMods(defMods)};};}
// what shows over the concrete is what gets hit: an arm, now and then the head
{const rs=resolveShot;resolveShot=function(A,D,kind,i){const r=rs(A,D,kind,i);
  if((r.out==='hit'||r.out==='crit')&&D.guarding&&!D.downed&&coverFrom(D,A)&&r.zone!=='head'){if(r.zone==='leg')r.kd=false;r.zone=r.seed%5<3?'arm':'head';}return r;};}
// a round that misses a man at a barrier (always, when he is down behind it) goes into the concrete
{const mp=missPoint;missPoint=function(A,D,s,M){const w=coverFrom(D,A);
  if(w&&(D.guarding&&!D.downed||s.seed%3===0)){const dir=Math.sign(A.station-w.x)||1,g=S.arena.ground(w.x,D.lane),h=w.h*(.3+((s.seed>>2)%60)/100);
    s.into='cover';s.cover=w;s.toDep=clamp(D.lane+((s.seed>>4)%24)-12,w.d0+4,w.d1-4);s.face=dir;return{x:w.x+dir*(w.t/2-3),y:g-h};}
  return mp(A,D,s,M);};}
{const sl=shotLands;shotLands=function(A,D,s,last){if(s.into==='cover'&&s.out!=='jam'&&s.out!=='hit'&&s.out!=='crit'){coverStruck(s);s.into='dark';}sl(A,D,s,last);};}
function coverStruck(s){const w=s.cover,q=s.to;if(!w||S.warming)return;
  w.chips.push({y:q.y,d:s.toDep,face:s.face,r:1.6+((s.seed>>6)%10)/6});if(w.chips.length>40)w.chips.shift();
  S.impacts.push({x:q.x,y:q.y,dep:s.toDep,t0:S.t,kind:'ground',ang:Math.atan2(q.y-s.from.y,q.x-s.from.x)});
  sparks(q,5,'#e8e4dc',s.toDep);dust(q.x,q.y,.35,s.toDep,'rgba(190,186,178,.55)');S.hooks.sound('ping',1);}
// down behind it: knees bent right down, the head under the top of the concrete
{const gb=Fighter.prototype.guardBody;Fighter.prototype.guardBody=function(){const b=gb.call(this);
  if(isGun(this)&&this.guarding&&!this.downed&&coverFrom(this,targetOf(this))){const leg=this.leg;b.crouch=Math.min(b.crouch,.46);b.lean+=.34;b.stF=.2*leg;b.stB=-.3*leg;}return b;};}
// behind real cover a gunman shoots and ducks: back down after a shot more often than not, and he stays where it is rather than
// walking out into the open
{const gc=gunChoice;gunChoice=function(A,D){const w=coverFrom(A,D);if(!w)return gc(A,D);const r=S.rng,ok=c=>cmdValid(A,D,c);
  if(!A.guarding&&GUN_KINDS.includes(A.lastAct)&&r()<.55&&ok('guard'))return'guard';
  const c=gc(A,D);if((c==='advance'||c==='withdraw'||c==='sidestep')&&ok('shoot'))return'shoot';return c;};}

// ---------- Kael's way through ----------
// up off the pegs, the rifle out of the scabbard on the way, a high arc while the bike goes on, one round at the top of it, and
// down onto one knee. x0 is where he leaves the bike, x1 where he lands, aimAt() the point the round is for.
function jumpOffAction(K,B,t0,x1,z1,aimAt,a0){const x0=K.p[PEL].x,z0=K.dep,leg=K.leg,a=K.arm,grab=()=>bikeAt(B,-40,58);
  const pose=(px,pz,lift,crouch,lean)=>({px,pz,crouch,lean,stF:.16*leg,stB:-.2*leg,th:.2,lift});
  const body=[{t:0,v:pose(x0,z0,0,.72,.3)},{t:.12,v:pose(x0+30,lerp(z0,z1,.15),40,.62,.2),e:eOut},{t:.42,v:pose(lerp(x0,x1,.62),lerp(z0,z1,.6),150,.55,-.06),e:eOut},
    {t:.78,v:pose(x1,z1,10,.56,.12),e:eIn},{t:.84,v:pose(x1+4,z1,0,.5,.2)},{t:1.35,v:pose(x1+6,z1,0,.58,.16),e:sstep}];
  const aim=()=>K.wp.gun?aimArmAt(K,aimAt(),0):{hand:{sh:[.4*a,.1*a]},wAng:-.2,off:{sh:[.2*a,.3*a]},tilt:.1};
  const arm=[{t:0,v:a0},{t:.09,v:{hand:{w:grab()},wAng:1.1,off:{sh:[-.1*a,.5*a]},tilt:.05},e:eOut},{t:.16,v:{hand:{sh:[.1*a,.3*a]},wAng:-.6,off:{sh:[.1*a,.35*a]},tilt:.05},e:eOut},
    {t:.32,v:aim,e:eOut},{t:.44,v:aim},{t:.49,v:()=>({...aim(),wAng:aim().wAng-.2})},{t:.7,v:aim},{t:1.35,v:()=>K.guardArm(),e:sstep}];
  return{t0,end:1.35,body,arm};}
// ---------- over the concrete ----------
// An elf crossing the checkpoint goes over a barrier in his stride: two quick steps in, a hand on the top, the hips up and over with
// the knees drawn in, down on the far side and walking on. The barrier lets him by while he is going over it (f.vaultDiv).
{const dc=divCollideQ;divCollideQ=function(f,q,i,final){const w=f&&f.vaultDiv;if(!w||w.state==='broken')return dc(f,q,i,final);
  const st=w.state;w.state='broken';try{return dc(f,q,i,final);}finally{w.state=st;}};}
function vaultAction(f,w,z,t0){const dir=Math.sign(w.x-f.station)||f.facing,leg=f.leg,a=f.arm,near=w.x-dir*w.t/2,far=w.x+dir*w.t/2,
  g=S.arena.ground(w.x,z),top=g-w.h,x0=f.station,x1=far+dir*(30+leg*.25),st=(x,y)=>({stF:x*leg,stB:y*leg}),
  // the hips high enough that the drawn-in feet (they hang leg × .45 under them) go over the top with a little to spare
  L=Math.max(30,f.pelvisY(w.x,.86)+leg*.45-top+18),plant={fn:()=>({x:w.x-dir*3,y:top-3})};
  const body=[{t:0,v:()=>({...easyBody(f),px:x0,pz:z})},
    {t:.16,v:{px:lerp(x0,near,.55),pz:z,crouch:.8,lean:.3,...st(.28,-.3),th:.3,lift:0},e:eOut},
    {t:.32,v:{px:near-dir*2,pz:z,crouch:.86,lean:.22,...st(.28,-.3),th:.95,lift:L*.8},e:eOut},
    {t:.45,v:{px:w.x+dir*4,pz:z,crouch:.86,lean:.1,...st(.28,-.3),th:.95,lift:L},e:sstep},
    {t:.6,v:{px:far+dir*18,pz:z,crouch:.8,lean:.18,...st(.3,-.32),th:.95,lift:L*.45},e:sstep},
    {t:.74,v:{px:x1-dir*5,pz:z,crouch:.72,lean:.24,...st(.3,-.32),th:.3,lift:0},e:eIn},
    {t:1.08,v:()=>({...easyBody(f),px:x1,pz:z}),e:sstep}];
  const arm=[{t:0,v:()=>easyArm(f)},{t:.27,v:{hand:{sh:[.3*a,.12*a]},wAng:1.2,off:plant,tilt:.08},e:eOut},{t:.5,v:{hand:{sh:[.36*a,-.08*a]},wAng:1.2,off:plant,tilt:.04}},
    {t:.66,v:{hand:{sh:[.3*a,.3*a]},wAng:1.2,off:{sh:[.12*a,.5*a]},tilt:.04},e:sstep},{t:1.08,v:()=>easyArm(f),e:sstep}];
  return{t0,end:1.08,body,arm,x1,dir};}
function* vaultOver(f,w,z){const A=vaultAction(f,w,z,S.t);f.facing=A.dir;f.vaultDiv=w;f.action=A;f.blur=S.t+.7;
  yield* wait(.3);S.hooks.sound('vault',1);if(typeof addMotes==='function')addMotes(w.x,S.arena.ground(w.x,z)-w.h-2,z,6,{spread:40,vy:-30});
  yield* wait(.44);dust(f.p[FTF].x,f.gr(f.p[FTF].x),.7,f.dep);S.hooks.sound('thud',120);
  f.station=A.x1;f.lane=z;
  yield* until(()=>!f.action||f.action!==A,1);f.vaultDiv=null;f.velX=0;}
// across the checkpoint to (x, depth): straight where nothing is in the way, over each barrier that is
function* crossTo(f,x,z,v){
  for(let k=0;k<3;k++){const w=divOnSeg(f.station,f.lane,x,z,10);if(!w||w.mat!=='concrete')break;
    const dir=Math.sign(w.x-f.station)||1,u=clamp((w.x-f.station)/((x-f.station)||1),0,1),zc=clamp(lerp(f.lane,z,u),w.d0+16,w.d1-16),ax=w.x-dir*(w.t/2+46);
    camTo(clamp(w.x+dir*40,300,620),720,1.2);
    if((ax-f.station)*dir>10)yield* goTo(f,ax,zc,v,{direct:true});
    else if(Math.abs(f.lane-zc)>6){f.facing=dir;yield* goTo(f,f.station,zc,v*.8,{direct:true});}
    yield* vaultOver(f,w,zc);}
  yield* goTo(f,x,z,v,{direct:true});}
STAGES.push({key:'roadblock',num:'III',title:'The Checkpoint',sub:'The Tower District, ten minutes to midnight',arena:'roadblock',next:'vargo',flagsOut:{grenade:true},
  foes:[{name:'Sergeant',human:true,ward:'police',arms:'street',seed:6113,weapon:'pistol',skill:2,temper:'keeper',hp:30,color:'#7f9ad8'},
        {name:'Officer',human:true,ward:'police',arms:'street',seed:6151,weapon:'pistol',skill:2,temper:'plain',hp:28,color:'#9fb8c9'},
        {name:'Patrolman',human:true,ward:'police',arms:'street',seed:6197,weapon:'pistol',skill:1,temper:'rusher',hp:26,color:'#c9a77f'},
        {name:'Rookie',human:true,ward:'police',arms:'street',seed:6229,weapon:'pistol',skill:1,temper:'plain',hp:24,color:'#a3c99a'}],
  spawn:[[205,110],[652,66,1],[716,96,1],[562,22,1],[772,44,1]],
  setup(st){const K=hero();
    // the police barriers: one across the lane Kael comes down, one in front of the officers
    S.story.cover=[barrierNew(258,76,144),barrierNew(604,36,104)];
    // the carrier across the end of the road, its gunner up in the hatch; Kael's bike still out of sight down the avenue
    const A=apcNew({x:742,dep:150,fa:-1});S.story.apc=A;
    const G=storyExtra('Gunner',{ward:'police',seed:6301,x:A.x,dep:A.dep+6,facing:-1});G.grenade='belt';S.story.gunner=G;
    G.perch={pel:()=>{const h=apcHatch(A);return{x:h.x,y:h.y+4};},grip:()=>{const g=apcGun(A),c=Math.cos(g.ang),s=Math.sin(g.ang);return{x:g.x-c*46,y:g.y-s*46+4};}};
    G.offstage=true;G.station=apcHatch(A).x;G.dep=G.lane=G.stepDep=A.dep+6;G.build();
    const B=bikeNew({x:-300,dep:156,fa:1,holster:'rifle',light:1,run:1});S.story.bike=B;
    K.station=B.x+SEAT_DX;K.lane=K.dep=K.stepDep=156;K.facing=1;K.build();mount(K,B,0);stowBlade(K);K.offstage=true;
    for(const f of S.F)if(f.team===1&&!f.npc){f.facing=-1;standEasy(f);f.build();}},
  *intro(st){const K=hero(),B=K.mount,A=S.story.apc,G=S.story.gunner,cops=S.F.filter(f=>f.team===1&&!f.npc);
    letter(1);camTo(450,900,0);
    yield* wait(.5);
    // an engine down the avenue, then his lamp, flat out
    S.hooks.sound('rev',1);B.ctl='script';B.vx=640;
    yield* until(()=>B.x>-60,3);
    for(const f of cops){standEasy(f,false);f.facing=-1;}
    // the gun on the roof comes round onto him and opens up: rounds walking up the road toward the bike
    A.gunT=.06;
    const mg=(function*(){let n=0;while(!B.wrecked&&n<14){const M=apcGun(A),T={x:B.x+(Math.random()-.3)*120,y:S.arena.ground(B.x,B.dep)};
      S.muzzles.push({x:M.x,y:M.y,dep:A.dep,ang:M.ang,kind:'mg',t0:S.t});S.tracers.push({a:{x:M.x,y:M.y,dep:A.dep},b:{x:T.x,y:T.y,dep:B.dep},dep:A.dep,dep1:B.dep,t0:S.t,kind:'mg',dur:.05});
      S.impacts.push({x:T.x,y:T.y,dep:B.dep+(Math.random()-.5)*20,t0:S.t+.05,kind:'ground',ang:Math.PI-.3});A.muzzle=1;S.hooks.sound('shot','mg');n++;yield* wait(.085);}})();
    let jumped=false;
    // when the bike is where it has to be, he goes: up off it with the rifle, and the bike goes on into the carrier
    const box=apcBox(A),x1=st.spawn[0][0],z1=st.spawn[0][1];
    const ride=(function*(){yield* until(()=>B.x>=112,3);jumped=true;
      const tank=()=>bikeAt(B,18,76);
      const a0=rideArm(K);dismount(K);K.offstage=true;K.rideFight=false;B.ctl='script';K.station=x1;K.lane=z1;
      K.action=jumpOffAction(K,B,S.t,x1,z1,()=>B.wrecked?{x:apcBox(A).l+20,y:S.arena.ground(0,0)-70}:tank(),a0);
      yield* wait(.1);K.setWeapon('rifle');B.holster='empty';S.hooks.sound('shing',.5);
      yield* wait(.1);S.slowT=Math.max(S.slowT,1.1);
      // the bike meets the carrier's nose
      yield* until(()=>bikeAt(B,90,30).x>=apcBox(A).l+6,2);
      B.vx=0;B.wrecked=true;B.wreck=.5;B.run=0;B.pitchT=-.02;A.jolt=.4;sparks(bikeAt(B,80,50),22,'#ffd27a',B.dep);S.hooks.sound('crash',1);S.shake=Math.max(S.shake,8);
      yield* until(()=>S.t>=K.action.t0+.45,1);
      // one round into the tank
      const T=tank();fireAt(K,T,{dep:B.dep});
      yield* wait(.05);flash(T,26,'#ffcf7a',B.dep);sparks(T,10,'#ffcf7a',B.dep);
      yield* wait(.09);
      // and the tank goes up under the carrier's nose: the carrier lifts and burns, its gunner is thrown, the officers go flat
      const bx=apcBox(A),c={x:bx.l+40,y:S.arena.ground(bx.l,A.dep)-60};boom(c.x,c.y,A.dep-4,1.5,'fuel',{spare:[K]});
      A.wreck=1;A.burn=1;A.lights=0;A.jolt=1;A.lift=1;A.lv=2.4;A.tilt=0;A.tiltT=0;
      S.fires.push({x:bx.l+70,y:S.arena.ground(bx.l,A.dep),dep:A.dep-2,w:120,h:90,seed:11,k:1},{x:(bx.l+bx.r)/2+40,y:bx.t+10,dep:A.dep+2,w:90,h:70,seed:23,k:.8});
      G.perch=null;kill(G,-1);for(let i=0;i<G.p.length;i++){const q=G.p[i];q.px-=-170*DT;q.py-=-560*DT;}G.vdep=-300;G.offstage=true;
      B.x=-999;B.run=0;B.light=0;
      for(let i=0;i<6;i++){const a={x:c.x+(Math.random()-.5)*30,y:c.y+(Math.random()-.5)*20},L=10+Math.random()*18,an=Math.random()*TAU,b={x:a.x+Math.cos(an)*L,y:a.y+Math.sin(an)*L},kx=(Math.random()-.6)*9,ky=-(4+Math.random()*7);
        S.debris.push({a:{...a,px:a.x-kx,py:a.y-ky,r:2,im:.5,vx0:0,vy0:0},b:{...b,px:b.x-kx*1.1,py:b.y-ky*1.1,r:2,im:.5,vx0:0,vy0:0},len:L,w:3+Math.random()*3,dep:A.dep-10-Math.random()*60,col:'#16141a',club:false,scrap:true});}
      yield* until(()=>S.t>=K.action.t0+K.action.end,2);})();
    yield* all(mg,ride);
    K.offstage=false;K.facing=1;
    yield* wait(.5);
    // the officers the blast put down get up again
    for(const f of cops)if(f.downed&&!f.dead)standUp(f);
    yield* wait(.6);
    // the four of them, up out of the smoke with their handguns
    const Sg=cops[0];
    yield* speak('Sergeant','On your feet! It’s one elf! Put him down!',{dur:2.4});
    yield* wait(.15);},
  introSkip(st){const K=hero(),A=S.story.apc,B=S.story.bike,G=S.story.gunner,x1=st.spawn[0][0],z1=st.spawn[0][1];
    if(K.mount)dismount(K);K.setWeapon('rifle');K.stow=true;K.action=null;K.offstage=false;K.station=x1;K.lane=K.dep=K.stepDep=z1;K.facing=1;K.build();
    B.x=-999;B.run=0;B.light=0;B.holster='empty';A.wreck=1;A.burn=1;A.lights=0;A.jolt=0;
    const bx=apcBox(A);if(!S.fires.length)S.fires.push({x:bx.l+70,y:S.arena.ground(bx.l,A.dep),dep:A.dep-2,w:120,h:90,seed:11,k:1},{x:(bx.l+bx.r)/2+40,y:bx.t+10,dep:A.dep+2,w:90,h:70,seed:23,k:.8});
    if(!G.dead){G.perch=null;kill(G,-1);}G.station=bx.l-60;G.lane=G.dep=86;G.build();G.motor=0;
    for(const f of S.F)if(f.team===1&&!f.npc){standEasy(f,false);f.facing=-1;f.build();}},
  *outro(st){const K=hero(),G=S.story.gunner,A=S.story.apc;
    letter(1);camTo(Math.max(300,Math.min(600,K.station+120)),760,1);
    K.guarding=false;K.counter=false;
    // the rifle goes into the street: he has no more use for it
    yield* wait(.3);K.facing=-1;
    yield* act(K,{t0:S.t,end:.55,body:[{t:0,v:()=>K.guardBody()}],arm:[{t:0,v:K.curArm||K.guardArm()},{t:.3,v:{hand:{sh:[-.3*K.arm,.3*K.arm]},wAng:1.3,off:{sh:[.1*K.arm,.5*K.arm]},tilt:0},e:eOut},{t:.55,v:easyArm(K)}]});
    dropWeapon(K,-1,false);K.setWeapon('elven');stowBlade(K);standEasy(K);K.facing=1;S.hooks.sound('thud',120);
    yield* wait(.5);
    // over the concrete, down the street, past the wreck, and down on one knee by the man thrown off its roof (on this side of him,
    // unless a barrier stands there)
    const gx=G.p[PEL].x,gz=clamp(G.dep+4,DEP_MIN,DEP_MAX);let sx=gx-36;if(divOnSeg(gx-40,gz,gx,gz,6))sx=gx+36;
    yield* crossTo(K,sx,gz,90);K.facing=Math.sign(gx-sx)||1;camTo(clamp(sx,300,620),700,.8);
    const a=K.arm,low=()=>({...easyBody(K),crouch:.5,lean:.95,stF:.24*K.leg,stB:-.22*K.leg}),belt={hand:{fn:()=>grenadeAt(G)},wAng:1.2,off:{sh:[.1*a,.6*a]},tilt:.25};
    K.action={t0:S.t,end:1.5,body:[{t:0,v:()=>easyBody(K)},{t:.4,v:low,e:sstep},{t:1.0,v:low},{t:1.5,v:()=>easyBody(K),e:sstep}],
      arm:[{t:0,v:easyArm(K)},{t:.5,v:belt,e:eOut},{t:.75,v:belt},{t:1.05,v:{hand:{sh:[.36*a,.2*a]},wAng:-.4,off:{sh:[.1*a,.6*a]},tilt:.25},e:sstep},{t:1.5,v:{hand:{sh:[.36*a,.2*a]},wAng:-.4,off:{sh:[.1*a,.6*a]},tilt:.1}}]};
    // the pin's ring on his finger, the body of it in his palm: it comes off the belt
    yield* wait(.66);G.grenade=null;K.grenade='hand';S.hooks.sound('click',1);
    yield* until(()=>!K.action,2);yield* wait(.2);
    // into the coat: he opens it with the other hand and the grenade goes in an inside pocket
    K.action={t0:S.t,end:1,body:[{t:0,v:()=>easyBody(K)}],arm:[{t:0,v:K.curArm},{t:.35,v:{hand:{sh:[.12*a,.28*a]},wAng:1.4,off:{sh:[.3*a,.2*a]},tilt:.12},e:eOut},{t:.6,v:{hand:{sh:[.06*a,.3*a]},wAng:1.4,off:{sh:[.3*a,.22*a]},tilt:.12}},{t:1,v:easyArm(K),e:sstep}]};
    yield* wait(.55);K.grenade='coat';S.story.flags.grenade=true;
    yield* until(()=>!K.action,2);yield* wait(.2);
    yield* speak(HERO_NAME,'Qadir always did like a big entrance.',{dur:2.4});
    // and on toward the bistro, along the near side of the road
    camTo(700,900,.9);
    yield* crossTo(K,K.station+40,20,90);K.offstage=true;yield* crossTo(K,1040,20,100);},
  outroSkip(st){}});
// where the grenade hangs on a body's belt, and the moment it changes hands
function grenadeAt(f){const P0=f.p[PEL],C=f.p[CHE],fa=f.facing,dx=C.x-P0.x,dy=C.y-P0.y,L=Math.hypot(dx,dy)||1;return{x:P0.x+dx/L*6-dy/L*fa*7,y:P0.y+dy/L*6+dx/L*fa*7};}
// ---------- things thrown through the air ----------
// A grenade: thrown from the hand on an arc to a point, it lands, skips and rolls, and goes off when its fuse runs out.
S.thrown=[];
function throwGrenade(f,T,dur,fuse){const h=f.p[HAF],g=G*.9,vx=(T.x-h.x)/dur,vdep=(T.dep-f.dep)/dur,vy=(T.y-h.y)/dur-.5*g*dur;
  const o={x:h.x,y:h.y,dep:f.dep,vx,vy,vdep,ang:0,spin:-f.facing*14,t0:S.t,fuse:S.t+(fuse??dur+.55),kind:'grenade',boom:null};S.thrown.push(o);return o;}
V11.step.push(()=>{for(let i=S.thrown.length-1;i>=0;i--){const o=S.thrown[i];
  o.vy+=G*.9*DT;o.x+=o.vx*DT;o.y+=o.vy*DT;o.dep+=o.vdep*DT;o.ang+=o.spin*DT;const g=S.arena.ground(o.x,o.dep)-3;
  // on the ground it skips once and rolls to a stop
  if(o.y>g){o.y=g;if(o.vy>120){o.vy*=-.32;S.hooks.sound('clink',1);}else o.vy=0;o.vx*=.6;o.vdep*=.6;o.spin*=.6;}
  if(S.t>=o.fuse){S.thrown.splice(i,1);o.boom=boom(o.x,o.y-12,o.dep,o.size||1,'grenade',o.opts||{});if(o.then)o.then(o);}}});
V11.duelStart.push(()=>{S.thrown=[];});

// ===== STAGE IV: LAMPLIGHT STREET =====
// Qadir waits outside the bistro he runs for Hallowell, alone, on the steps of his own front door. They know each other. After it,
// Kael takes the grenade out of his coat and opens the front door for himself.
// the bistro's front doorway on the street (the street's painter says where; this is its place until it does)
function bistroDoor(){const L=typeof EnvLook!=='undefined'&&EnvLook.S&&EnvLook.S.street;return L&&L.doorAt?L.doorAt():{x:209,dep:210,y:400};}
STAGES.push({key:'vargo',num:'IV',title:'Lamplight Street',sub:'Outside the Lantern Bistro, five to midnight',arena:'street',next:'dining',flagsOut:{grenade:false,blown:true},
  foes:[{name:'Qadir',seed:7001,weapon:'axe',skill:3,temper:'brute',hp:96}],
  spawn:[[150,92],[380,104,1]],
  setup(st){const K=hero(),V=S.F[1],D=bistroDoor();
    standEasy(K);stowBlade(K);K.station=-70;K.lane=K.dep=K.stepDep=72;K.facing=1;K.offstage=true;K.build();
    // on the steps of his own front door
    standEasy(V);V.station=clamp(D.x+70,240,520);V.lane=V.dep=V.stepDep=150;V.facing=-1;V.build();V.homeX=st.spawn[1][0];V.homeZ=st.spawn[1][1];},
  *intro(st){const K=hero(),V=S.F[1];
    letter(1);camTo(330,760,0);
    yield* wait(.3);
    yield* goTo(K,st.spawn[0][0],st.spawn[0][1],86);K.offstage=false;
    yield* wait(.3);
    yield* speak('Qadir','Ilyas. I set your table. I hoped you’d come to eat.',{dur:3});
    yield* speak(HERO_NAME,'We drank from the same cup, Qadir.',{dur:2.2});
    // down off the step to meet him
    yield* goTo(V,V.homeX,V.homeZ,70);V.facing=-1;
    yield* speak('Qadir','Thirty years, and the family never once filled mine. Hallowell did.',{dur:3.4});
    yield* speak(HERO_NAME,'I met his money on the way here. It’s lying in the road.',{dur:3});
    yield* speak('Qadir','Then there’s only me left. Last orders, old friend.',{dur:2.8});
    yield* speak(HERO_NAME,'I’ll settle the bill.',{dur:1.8});
    yield* wait(.1);},
  introSkip(st){const K=hero(),V=S.F[1];K.station=st.spawn[0][0];K.lane=K.dep=st.spawn[0][1];K.offstage=false;K.facing=1;K.build();
    V.station=V.homeX;V.lane=V.dep=V.homeZ;V.facing=-1;V.build();},
  *outro(st){const K=hero(),D=bistroDoor(),a=K.arm;
    letter(1);camTo(clamp((K.station+D.x)/2,300,600),780,1);
    K.guarding=false;K.counter=false;
    yield* act(K,rollUpAction(K,S.t));stowBlade(K);standEasy(K);
    yield* wait(.3);
    // to where he can see the door, square to it
    const sx=clamp(D.x+150,200,560);yield* goTo(K,sx,96,80);K.facing=-1;
    yield* wait(.4);
    // the coat open, the grenade out of the inside pocket, the pin pulled with the other hand
    yield* act(K,{t0:S.t,end:.9,body:[{t:0,v:()=>easyBody(K)}],arm:[{t:0,v:easyArm(K)},{t:.3,v:{hand:{sh:[.06*a,.28*a]},wAng:1.4,off:{sh:[.3*a,.22*a]},tilt:.1},e:eOut},{t:.55,v:{hand:{sh:[.08*a,.3*a]},wAng:1.4,off:{sh:[.3*a,.22*a]},tilt:.1}},{t:.9,v:{hand:{sh:[.3*a,.1*a]},wAng:-.3,off:{sh:[.2*a,.4*a]},tilt:.05},e:sstep}]});
    K.grenade='hand';S.hooks.sound('click',1);
    yield* act(K,{t0:S.t,end:.45,body:[{t:0,v:()=>easyBody(K)}],arm:[{t:0,v:K.curArm},{t:.25,v:{hand:{sh:[.3*a,.1*a]},wAng:-.3,off:{sh:[.32*a,.06*a]},tilt:.05},e:eOut},{t:.45,v:{hand:{sh:[.3*a,.1*a]},wAng:-.3,off:{sh:[-.1*a,.5*a]},tilt:.05},e:sstep}]});
    S.hooks.sound('ping',1);
    // an easy underarm toss, high, onto the step, and he turns away from it
    const T={x:D.x,y:S.arena.ground(D.x,D.dep-8)-4,dep:D.dep-8};
    const thr={t0:S.t,end:.7,body:[{t:0,v:()=>easyBody(K)},{t:.3,v:()=>({...easyBody(K),lean:.12})},{t:.7,v:()=>easyBody(K),e:sstep}],
      arm:[{t:0,v:K.curArm},{t:.22,v:{hand:{sh:[-.2*a,.6*a]},wAng:1.6,off:{sh:[-.1*a,.5*a]},tilt:0},e:eOut},{t:.42,v:{hand:{sh:[.62*a,-.1*a]},wAng:-.6,off:{sh:[-.1*a,.5*a]},tilt:0},e:sstep},{t:.7,v:easyArm(K),e:sstep}]};
    K.action=thr;yield* wait(.38);K.grenade=null;S.story.flags.grenade=false;
    const gr=throwGrenade(K,T,.85,1.35);gr.size=1.15;gr.opts={spare:[K]};
    gr.then=()=>{S.bistro='blown';S.bistroBlast=S.t;S.story.flags.blown=true;S.punch={x:prjX(D.x,D.dep),t:0};};
    yield* wait(.5);K.facing=1;
    yield* until(()=>S.bistro==='blown',4);
    yield* wait(1.4);
    // and in through the hole
    K.facing=-1;camTo(clamp(D.x+40,300,600),760,.8);
    yield* goTo(K,D.x+10,clamp(D.dep-50,96,170),74);K.offstage=true;
    yield* wait(.3);},
  outroSkip(st){}});

// ===== STAGE V: THE DINING ROOM =====
// In through the wreck of the front door: Brask and Iyla, Qadir's second and his knife, with two of the floor's men.
function diningDoor(){const L=typeof EnvLook!=='undefined'&&EnvLook.S&&EnvLook.S.dining;return L&&L.doorAt?L.doorAt():{x:29,dep:230};}
STAGES.push({key:'dining',num:'V',title:'The Dining Room',sub:'The Lantern Bistro, midnight',arena:'restaurant',room:'dining',table:true,divs:true,next:'kitchen',
  foes:[{name:'Brask',seed:7101,weapon:'spear',skill:3,temper:'keeper',hp:60},
        {name:'Iyla',seed:7133,weapon:'dagger',skill:3,temper:'rusher',hp:54},
        {name:'Waiter',human:true,ward:'dining',arms:'dining',seed:7171,weapon:'club',skill:1,temper:'rusher',hp:26}],
  spawn:[[250,104],[600,70,1],[650,130,1],[470,46,1]],
  setup(st){const K=hero(),D=diningDoor();standEasy(K);stowBlade(K);K.zMax=D.dep+8;K.station=D.x;K.lane=K.dep=K.stepDep=D.dep;K.facing=1;K.offstage=true;K.build();
    for(const f of S.F)if(f.team===1){standEasy(f);f.facing=-1;f.build();}},
  *intro(st){const K=hero(),[Br,Iy]=S.F.slice(1);
    letter(1);camTo(380,820,0);
    yield* wait(.4);
    // out of the smoke of the doorway
    yield* goTo(K,120,150,80);K.zMax=null;yield* goTo(K,st.spawn[0][0],st.spawn[0][1],80);K.offstage=false;
    yield* wait(.2);
    yield* speak('Brask','Qadir always said you’d come in through the front.',{dur:2.6});
    yield* speak('Iyla','He never said you’d bring the front with you.',{dur:2.4});
    yield* speak(HERO_NAME,'He’s on the step outside. Go and sit with him.',{dur:2.6});
    yield* wait(.1);},
  introSkip(st){const K=hero();K.zMax=null;K.station=st.spawn[0][0];K.lane=K.dep=st.spawn[0][1];K.offstage=false;K.build();},
  *outro(st){const K=hero();letter(1);camTo(clamp(K.station,300,600),760,1);
    K.guarding=false;K.counter=false;
    yield* act(K,rollUpAction(K,S.t));stowBlade(K);standEasy(K);
    yield* wait(.3);
    // through the swing door to the kitchen
    yield* goTo(K,DINING_DOOR.x,DINING_DOOR.slots[0][1],92);K.offstage=true;
    yield* wait(.4);},
  outroSkip(st){}});

// ===== STAGE VI: THE KITCHEN =====
// Orrin's kitchen: the head chef, his sous-chef and his quickest knife. When they are down, the tiled wall by the alley door slides
// aside on the family's private lift, and it goes down.
STAGES.push({key:'kitchen',num:'VI',title:'The Kitchen',sub:'Behind the swing door',arena:'restaurant',room:'kitchen',next:'platform',
  foes:[{name:'Orrin',seed:7201,weapon:'sword',skill:3,temper:'brute',hp:64},
        {name:'Hesk',seed:7233,weapon:'sword',skill:3,temper:'keeper',hp:56},
        {name:'Odile',seed:7261,weapon:'dagger',skill:3,temper:'rusher',hp:50}],
  spawn:[[260,104],[580,64,1],[650,108,1],[720,146,1]],
  setup(st){const K=hero();standEasy(K);stowBlade(K);K.station=KITCHEN_DOOR.x;K.lane=K.dep=K.stepDep=KITCHEN_DOOR.slots[0][1];K.facing=1;K.offstage=true;K.build();
    for(const f of S.F)if(f.team===1){standEasy(f);f.facing=-1;f.build();}},
  *intro(st){const K=hero();
    letter(1);camTo(400,820,0);
    yield* wait(.3);
    yield* goTo(K,st.spawn[0][0],st.spawn[0][1],86);K.offstage=false;
    yield* speak('Orrin','Front of house was Qadir’s mess. Back of house is mine.',{dur:3});
    yield* speak(HERO_NAME,'I’m only passing through.',{dur:1.8});
    yield* speak('Odile','Chef. Eighty-six him.',{dur:1.8});
    yield* wait(.1);},
  introSkip(st){const K=hero();K.station=st.spawn[0][0];K.lane=K.dep=st.spawn[0][1];K.offstage=false;K.build();},
  *outro(st){const K=hero();letter(1);camTo(560,820,1);
    K.guarding=false;K.counter=false;
    yield* act(K,rollUpAction(K,S.t));stowBlade(K);standEasy(K);
    yield* wait(.4);
    // a click in the wall: the family's own way down
    S.deep=true;const step=revealStart(null);S.deep=false;
    if(step)yield* until(()=>step(),5);
    yield* goTo(K,SECRET_DOOR.x,SECRET_DOOR.slots[0][1],90);K.offstage=true;
    yield* wait(.3);
    yield* until(()=>{S.fade=Math.min(1,S.fade+DT*1.8);return S.fade>=1;},1);},
  outroSkip(st){}});

// ===== THE PLATFORM =====
// Behind the secret door the family's own lift goes down to the family's own railway: the stop under the bistro, where the train
// waits with its one flatcar. He steps out of the lift, crosses to the flatcar, and the train pulls out for the tower.
const PLATFORM_NOSE=660;
STAGES.push({key:'platform',num:'',title:'',sub:'',arena:'station',next:'line',noFight:true,cardDur:0,foes:[],spawn:[[62,268]],
  setup(st){const K=hero(),SL=stationLook(),kl=kitLiftSpot(),LY=SL&&SL.LAYOUT||{};
    S.stationEnd='lantern';S.kitLift=0;S.lift=0;S.liftY=0;S.fade=1;if(SL&&SL.liftFrontLater)SL.liftFrontLater(false);
    standEasy(K);stowBlade(K);K.zMax=290;K.station=kl.x;K.lane=K.dep=K.stepDep=kl.dep+4;K.facing=1;K.offstage=true;K.hidden=true;K.build();
    S.story.train=trainNew({x:PLATFORM_NOSE,gy:LY.trainGy??GB+TRAIN.deck,dep:LY.trainDep??236,fa:1,cars:1,lamp:.55});},
  *intro(st){const K=hero(),T=S.story.train,kl=kitLiftSpot();
    letter(1);camTo(330,780,0);
    yield* until(()=>{S.fade=Math.max(0,S.fade-DT*1.3);return S.fade<=0;},1.2);
    yield* wait(.3);
    // the chime, the doors, and out onto the platform
    S.hooks.sound('ding',1);yield* wait(.45);
    yield* until(()=>{S.kitLift=Math.min(1,S.kitLift+DT*1.3);return S.kitLift>=1;},1.2);
    K.hidden=false;yield* goTo(K,kl.x+40,T.dep-8,70);K.offstage=false;
    // the family's own railway, and the train with its lamp low, waiting; the lift's doors close behind him
    lookAt(K,1,1.6);yield* all(wait(1.3),until(()=>{S.kitLift=Math.max(0,S.kitLift-DT*1.1);return S.kitLift<=0;},1.3));
    const D=trainDeck(T,0);
    yield* goTo(K,clamp(D.x0+170,D.x0+40,D.x1-40),T.dep-8,84);K.facing=1;T.riders.push(K);K.pitClip=T.dep;
    yield* wait(.35);
    // the lamp comes up, and the train pulls out for the tower with him on it
    camTo(470,860,.7);
    yield* until(()=>{T.lamp=Math.min(1,T.lamp+DT*1.5);return T.lamp>=1;},1);
    const out=(function*(){yield* wait(2.7);const t0=S.t;while(S.t<t0+1.5){S.fade=(S.t-t0)/1.5;yield;}S.fade=1;})();
    yield* all(trainTo(T,PLATFORM_NOSE+470,4.4,eIn),out);
    T.riders.length=0;},
  introSkip(st){S.fade=1;}});

// ---------- the crews that come in waves ----------
// A stage can bring its enemies on a few at a time with the game's own crew rules (S.crew): the most on their feet at once, the rest
// waiting. The story's crews are its own (goblins), named and drawn as what they are, and they arrive the stage's way (dropping out of
// the dark onto the train) instead of walking in from the edge.
function storyCrew(o){S.crew={room:o.room||'line',queue:o.queue.slice(),count:0,hp:o.hp,next:null,doors:[],lastSide:1,beast:o.beast,story:o};}
{const cm=crewMake;crewMake=function(hc,s,sp,room){const f=cm(hc,s,sp,room),C=S.crew;
  if(C&&C.story){const o=C.story,i=C.count-1;f.name=o.names&&o.names[i]||(o.name||'Goblin')+' '+C.count;f.color=o.colors&&o.colors[i]||o.color||'#9fd18a';
    f.beast=C.beast||null;f.armsRoom=o.arms||'street';f.ward=o.ward||null;}
  return f;};}
// a stage can say which side its crew comes in from (the field's come out of the maize on the right, away from the bike)
{const cs=crewSides;crewSides=function(f){const C=S.crew;return C&&C.story&&C.story.sides?C.story.sides.slice():cs(f);};}
{const ce=crewEnter;crewEnter=function(){const f=ce(),C=S.crew;if(f&&C&&C.story&&C.story.arrive)C.story.arrive(f);return f;};}
// down out of the dark: the body starts high over its place and drops onto it, landing in a crouch
function dropIn(f,h){const x=f.station,z=f.lane;f.dustCol=S.arenaKey==='tunnel'||S.arenaKey==='station'?'rgba(112,104,94,.62)':null;f.setup(f.seed,f.weaponKey,f.skill,x,z);f.entering=false;f.offstage=true;
  for(const q of f.p){q.y-=h;q.py-=h;}for(const q of f.scarf||[]){q.y-=h;q.py-=h;}
  const g=()=>f.guardBody(),a=()=>f.guardArm();
  f.action={t0:S.t,end:.95,body:[{t:0,v:()=>({...g(),lift:h})},{t:.42,v:()=>({...g(),lift:0,crouch:.66,lean:.3}),e:eIn},{t:.95,v:g,e:sstep}],arm:[{t:0,v:a},{t:.95,v:a}]};
  f.arriveAt=S.t+.9;S.hooks.sound('thud',220);
  // on its feet on the deck it belongs to the stage again
  f.dropT=S.t+.5;}
V11.step.push(()=>{for(const f of S.F)if(f.dropT&&S.t>=f.dropT){f.dropT=null;f.offstage=false;dust(f.p[FTF].x,f.gr(f.p[FTF].x),.8,f.dep,f.dustCol||undefined);}});
// the beasts' own weapons: game weapons of their kind with their own length, weight and guard, so a spike reaches as far as it is
// drawn (the beasts' painter draws them; the numbers are its)
const BEAST_ARMS={
  shiv:{kind:'dagger',len:24,butt:5,mass:.6,off:null,name:'Railway spike',short:'Spike',guard:{hx:.52,hy:.32,w:-.5,gw:-.35,off:[.42,.16],crouch:.76,lean:.16,sf:.3,sb:-.34}},
  hook:{kind:'dagger',len:27,butt:6,mass:.7,off:null,name:'Meat hook',short:'Hook',guard:{hx:.5,hy:.3,w:-.7,gw:-.35,off:[.4,.18],crouch:.76,lean:.16,sf:.3,sb:-.34}},
  boneclub:{kind:'club',len:42,butt:6,mass:1.2,off:null,name:'Femur club',short:'Femur',guard:{hx:.42,hy:.3,w:-1.4,gw:-.3,off:[.3,.32],crouch:.78,lean:.14,sf:.3,sb:-.34}},
  glaive:{kind:'axe',len:98,butt:30,mass:4.4,off:-26,name:'Cleaver-glaive',short:'Glaive',guard:{hx:.32,hy:.42,w:-1.15,gw:.25,off:null,crouch:.86,lean:.08,sf:.3,sb:-.34}}};
for(const [k,w] of Object.entries(BEAST_ARMS)){const base=WEAPONS[w.kind];
  WEAPONS[k]={...base,key:k,name:w.name,short:w.short,len:w.len,butt:w.butt,mass:w.mass,off:w.off===undefined?base.off:w.off,improv:false,beast:true,base:w.kind};GUARD[k]=w.guard||GUARD[w.kind];}
// a beast's weapon is fought the way its kind is (a spike like a dagger, the glaive like a greataxe): the technique is chosen as for
// the kind, then its reach along the weapon is put on the beast's own length, and its words name what is really in the hand
{const pt=pickTechnique;pickTechnique=function(A,D,kind){const w=A.wp;if(!w||!w.beast||!w.base||!WEAPONS[w.base])return pt(A,D,kind);
  const B=WEAPONS[w.base],k0=A.weaponKey;let T;A.weaponKey=w.base;try{T=pt(A,D,kind);}finally{A.weaponKey=k0;}
  if(!T)return T;if(typeof T.along==='number')T.along*=T.along>=0?w.len/B.len:w.butt/B.butt;
  const re=n=>new RegExp(n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi'),sw=t=>typeof t==='string'?t.replace(re(B.name),w.name.toLowerCase()).replace(re(B.short),w.short.toLowerCase()):t;
  T.why=sw(T.why);if(T.name)T.name=T.name.replace(re(B.short),w.short);
  return T;};}
// a beast's body is its own (the beasts' painter shapes it when it is on the page)
{const bh=S.hooks.body;S.hooks.body=(f,b)=>f&&f.beast&&typeof BeastLook!=='undefined'&&BeastLook.body?BeastLook.body(f.beast,b,f.seed):bh?bh(f,b):b;}

// ===== STAGE VII: THE LINE =====
// Down the family's private railway on an open flatcar. Feral goblins live in the old line now; they drop onto the deck out of the
// dark and keep coming, a few at a time, until there are none left.
storyArena('tunnel',{label:'Tunnel',name:'The line',ground:()=>GB,wall:null,far:200,scroll:true,minX:70,maxX:830});
const LINE_V=900;
// a goblin of the line: its own dice, its own weapon
function goblinCfg(seed,i){const R=mulberry32(seed*31+i*977),w=R()<.6?'shiv':R()<.5?'boneclub':'hook';
  return{seed:1+Math.floor(R()*9998),weapon:w,skill:R()<.25?2:1,temper:R()<.5?'rusher':'brute'};}
STAGES.push({key:'line',num:'VII',title:'The Line',sub:'Under the city, the family’s own railway',arena:'tunnel',next:'deep',scrollV:LINE_V,
  foes:[{name:'Goblin',beast:'goblin',seed:8101,weapon:'shiv',skill:1,temper:'rusher',hp:16,color:'#9fd18a'},
        {name:'Goblin',beast:'goblin',seed:8133,weapon:'boneclub',skill:1,temper:'brute',hp:16,color:'#b8c97a'}],
  spawn:[[330,96],[520,70,1],[160,128,-1]],
  setup(st){const K=hero();K.facing=1;standEasy(K);stowBlade(K);
    S.F.forEach((f,i)=>{if(f.team===1){f.beast='goblin';f.name='Goblin '+String.fromCharCode(64+i);f.build();f.station=st.spawn[i][0];f.lane=st.spawn[i][1];f.offstage=true;
      for(const q of f.p){q.y-=900;q.py-=900;}f.hidden=true;}});
    // five more in the dark, three on the deck at most
    storyCrew({room:'line',beast:'goblin',name:'Goblin',color:'#a7c98a',hp:16,queue:[0,1,2,3,4].map(i=>goblinCfg(8200,i)),arrive:f=>dropIn(f,260)});},
  *intro(st){const K=hero(),gs=S.F.filter(f=>f.team===1);
    letter(1);camTo(450,900,0);
    yield* wait(1.2);
    // eyes in the dark over the car
    S.story.eyes={t0:S.t,n:9};
    yield* wait(1.4);
    yield* speak(HERO_NAME,'Hallowell keeps pets.',{dur:1.8});
    // and down they come
    for(const f of gs){f.hidden=false;f.setup(f.seed,f.weaponKey,f.skill,f.station,f.lane);dropIn(f,280);f.walkIn=false;yield* wait(.35);}
    yield* wait(.9);S.story.eyes=null;},
  introSkip(st){S.story.eyes=null;for(const f of S.F)if(f.team===1&&f.hidden){f.hidden=false;f.offstage=false;f.setup(f.seed,f.weaponKey,f.skill,f.station,f.lane);f.action=null;}},
  *outro(st){const K=hero();letter(1);camTo(450,900,1);
    K.guarding=false;K.counter=false;
    yield* wait(.4);
    // brakes: the train slows for the deep station, and the dark takes it (it comes in under the tower at the speed it leaves here)
    S.story.brake=S.t;S.hooks.sound('brake',1);
    const slow=until(()=>{S.scrollV=Math.max(330,S.scrollV-DT*380);return S.scrollV<=330;},3);
    const dark=(function*(){yield* wait(.7);const t0=S.t;while(S.t<t0+1){S.fade=S.t-t0;yield;}S.fade=1;})();
    yield* all(slow,dark);},
  outroSkip(st){}});
{const sv=STAGES.find(s=>s.key==='line');void sv;}

// ===== STAGE VIII: THE DEEP STATION =====
// The end of the line, under the tower: the lizard-man who keeps the goblins, and his crew. After them the freight lift goes up to the
// lobby.
storyArena('station',{label:'Station',name:'The deep station',ground:()=>GB,wall:null,far:230});
function stationLook(){return typeof EnvLook!=='undefined'&&EnvLook.S&&EnvLook.S.station?EnvLook.S.station:null;}
function liftSpot(){const L=stationLook();return L&&L.liftAt?L.liftAt():{x:774,dep:237};}
function kitLiftSpot(){const L=stationLook();return L&&L.kitLiftAt?L.kitLiftAt():{x:62,dep:264};}
// the freight lift raises whoever stands in it: their ground goes up with its floor
S.liftY=0;S.lift=0;
{const gr=Fighter.prototype.gr;Fighter.prototype.gr=function(x){return gr.call(this,x)-(this.rideLift?S.liftY:0);};}
const DEEP_NOSE=660,DEEP_ROLL=380,DEEP_RIDE=-350;
STAGES.push({key:'deep',num:'VIII',title:'The Deep Station',sub:'Under Hallowell Tower',arena:'station',next:'lobby',
  foes:[{name:'Ixet',beast:'lizard',seed:8501,weapon:'glaive',skill:3,temper:'brute',hp:170,color:'#c9a24e'},
        {name:'Goblin',beast:'goblin',seed:8533,weapon:'hook',skill:1,temper:'rusher',hp:16,color:'#9fd18a'},
        {name:'Goblin',beast:'goblin',seed:8561,weapon:'boneclub',skill:1,temper:'rusher',hp:16,color:'#b8c97a'}],
  spawn:[[300,96],[600,90,1],[520,40,1],[680,140,1]],
  setup(st){const K=hero(),SL=stationLook(),LY=SL&&SL.LAYOUT||{};S.stationEnd='tower';S.kitLift=0;S.lift=0;S.liftY=0;S.fade=1;if(SL&&SL.liftFrontLater)SL.liftFrontLater(false);
    S.F.forEach((f,i)=>{if(f.team===1){f.beast=st.foes[i-1].beast;if(f.beast==='goblin')f.name='Goblin '+String.fromCharCode(64+i);f.build();f.facing=-1;}});
    // the train comes in off the line with him standing on its flatcar, and stops at the platform
    const T=trainNew({x:DEEP_NOSE-DEEP_ROLL,gy:LY.trainGy??GB+TRAIN.deck,dep:LY.trainDep??236,fa:1,cars:1,lamp:1});S.story.train=T;
    standEasy(K);stowBlade(K);K.zMax=290;K.station=T.x+DEEP_RIDE;K.lane=K.dep=K.stepDep=T.dep-8;K.facing=1;K.offstage=true;K.build();
    T.riders.push(K);K.pitClip=T.dep;
    storyCrew({room:'deep',beast:'goblin',name:'Goblin',color:'#a7c98a',hp:16,queue:[0,1].map(i=>goblinCfg(8600,i)),arrive:f=>dropIn(f,200)});},
  *intro(st){const K=hero(),V=S.F[1],T=S.story.train;
    letter(1);camTo(450,900,0);S.fade=1;
    // in off the line, slowing, the brakes at the last
    const fade=(function*(){const t0=S.t;while(S.t<t0+1){S.fade=1-(S.t-t0);yield;}S.fade=0;})();
    const brake=(function*(){yield* wait(2.1);S.hooks.sound('brake',1);})();
    yield* all(trainTo(T,DEEP_NOSE,3.4,eOut),fade,brake);
    T.riders.length=0;
    yield* wait(.5);
    // off the flatcar and onto the platform
    K.pitClip=null;yield* goTo(K,st.spawn[0][0],st.spawn[0][1],84);K.zMax=null;K.offstage=false;
    yield* speak('Ixet','The old man told my little ones an elf would come down the line.',{dur:3.2});
    yield* speak(HERO_NAME,'So he sent you to meet me.',{dur:1.8});
    yield* speak('Ixet','He sent you to feed them.',{dur:1.8});
    yield* wait(.1);},
  introSkip(st){const K=hero(),T=S.story.train;if(T){T.riders.length=0;T.v=0;T.x=DEEP_NOSE;}S.fade=0;K.pitClip=null;K.zMax=null;
    K.station=st.spawn[0][0];K.lane=K.dep=st.spawn[0][1];K.offstage=false;K.build();},
  *outro(st){const K=hero(),L=liftSpot();letter(1);camTo(clamp(L.x-120,300,600),880,1);
    K.guarding=false;K.counter=false;
    yield* act(K,rollUpAction(K,S.t));stowBlade(K);standEasy(K);
    yield* wait(.3);
    // along the platform clear of the engine, and up to the cage's gate at the far end
    const SL=stationLook(),CG=SL&&SL.LAYOUT&&SL.LAYOUT.CAGE||{d0:198},fz=CG.d0-14;
    K.zMax=290;yield* goTo(K,L.x-36,150,92);yield* goTo(K,L.x,fz,70);
    // the gate folds back and he steps in through it (the car's front stands by its depth: once he is past it, it is in front of him)
    yield* until(()=>{S.lift=Math.min(1,S.lift+DT*1.6);return S.lift>=1;},2);S.hooks.sound('gate',1);
    yield* goTo(K,L.x,L.dep,60);K.offstage=true;
    // in the car he turns round, and stands; the gate shuts, and the car goes up out of the deep
    yield* wait(.12);K.facing=-1;yield* wait(.4);
    yield* until(()=>{S.lift=Math.max(0,S.lift-DT*1.6);return S.lift<=0;},2);S.hooks.sound('gate',1);
    K.rideLift=true;S.hooks.sound('lift',1);camTo(clamp(L.x-120,300,600),880,.5);
    // up out of the deep, carried on the cage's floor all the way (his ground goes up with it, and so does he); the dark takes the
    // picture near the top, and the lobby is where the cage stops
    yield* until(()=>{const dy=DT*Math.min(160,40+(S.liftY+1)*1.4);S.liftY+=dy;for(const q of K.p){q.y-=dy;q.py-=dy;}
      if(S.liftY>360)S.fade=Math.min(1,(S.liftY-360)/150);return S.liftY>520;},8);
    S.fade=1;yield* wait(.25);},
  outroSkip(st){}});

// ===== STAGE IX: THE LOBBY =====
// The lift opens on the Hallowell lobby and three guards with submachine guns empty them at him. The coat takes all of it and is torn to
// rags; he throws it off. Under it: the vest, the tattoos, the dagger, the charge. Then Sable and the three of them, and the charge on
// the executive's door.
STAGES.push({key:'lobby',num:'IX',title:'The Lobby',sub:'Hallowell Tower, the executive floor',arena:'restaurant',room:'lobby',next:'office',flagsOut:{coatOff:true,charged:true},
  foes:[{name:'Sable',seed:9001,weapon:'sword',skill:3,temper:'keeper',hp:80},
        {name:'Guard',human:true,ward:'lobby',arms:'lobby',seed:9033,weapon:'smg',skill:1,temper:'plain',hp:26},
        {name:'Guard',human:true,ward:'lobby',arms:'lobby',seed:9061,weapon:'smg',skill:1,temper:'plain',hp:26},
        {name:'Guard',human:true,ward:'lobby',arms:'lobby',seed:9097,weapon:'smg',skill:2,temper:'rusher',hp:28}],
  spawn:[[150,140],[600,150,1],[470,60,1],[560,100,1],[650,40,1]],
  // the cage comes up out of the dark of the shaft: the picture comes up with it
  setup(st){const K=hero();S.liftT0=null;S.fade=1;
    S.F.forEach((f,i)=>{if(f.team===1&&f.name==='Guard'){f.name=['','','Guard A','Guard B','Guard C'][i]||'Guard';}});
    // Sable stands back by the executive's door; the guards are out front with their guns
    const Sb=S.F[1];Sb.station=EXEC_DOOR.x+60;Sb.lane=Sb.dep=Sb.stepDep=164;Sb.facing=-1;standEasy(Sb);Sb.build();
    standEasy(K);stowBlade(K);K.station=LOBBY_ENTRY.x;K.lane=K.dep=K.stepDep=LOBBY_ENTRY.slots[0][1];K.facing=1;K.offstage=true;K.build();
    for(const f of S.F)if(f.team===1&&f!==Sb){f.facing=-1;f.build();}},
  *intro(st){const K=hero(),Sb=S.F[1],gs=S.F.slice(2,5),a=K.arm;
    letter(1);camTo(330,820,0);
    yield* until(()=>{S.fade=Math.max(0,S.fade-DT*2.2);return S.fade<=0;},1);
    yield* wait(.15);
    // the lift opens
    S.liftT0=S.t-.2;S.hooks.sound('chime',1);yield* wait(.7);
    yield* goTo(K,st.spawn[0][0],st.spawn[0][1],80);K.offstage=false;K.facing=1;
    yield* wait(.25);
    yield* speak('Guard A','Cage is up! Light it!',{dur:1.4,gap:.05});
    // they open up, all three, and he sweeps the coat round in front of him
    K.coatShield=0;
    const swing=(function*(){const t0=S.t;while(S.t<t0+.32){K.coatShield=sstep((S.t-t0)/.32);yield;}K.coatShield=1;})();
    K.action={t0:S.t,end:4.2,body:[{t:0,v:()=>easyBody(K)},{t:.3,v:()=>({...easyBody(K),crouch:.84,lean:.28}),e:eOut},{t:4.2,v:()=>({...easyBody(K),crouch:.84,lean:.28})}],
      arm:[{t:0,v:easyArm(K)},{t:.3,v:{hand:{sh:[.62*a,-.18*a]},wAng:-1.2,off:{sh:[.5*a,.36*a]},tilt:.3},e:eOut},{t:4.2,v:{hand:{sh:[.6*a,-.16*a]},wAng:-1.2,off:{sh:[.48*a,.38*a]},tilt:.32}}]};
    const fire=(f,i)=>(function*(){yield* wait(.08+i*.11);let n=0;const N=22+i*3;
      while(n<N){const T={x:K.p[CHE].x+K.facing*(14+Math.random()*10),y:lerp(K.p[CHE].y,K.p[PEL].y,Math.random()*1.4)};
        if(!f.action||S.t>f.action.t0+f.action.end-.1)f.action={t0:S.t,end:4,body:[{t:0,v:()=>aimBody(f)}],arm:[{t:0,v:()=>aimArmAt(f,aimPoint(K),0)},{t:4,v:()=>aimArmAt(f,aimPoint(K),0)}]};
        fireAt(f,T,{dep:K.dep});S.impacts.push({x:T.x,y:T.y,dep:K.dep-2,t0:S.t+.03,kind:'metal',ang:Math.PI});
        K.coatShred=Math.min(1,K.coatShred+.016);n++;yield* wait(.07+Math.random()*.03);}
      // empty
      S.hooks.sound('click',1);yield* wait(.12);S.hooks.sound('click',1);})();
    yield* all(swing,...gs.map(fire));
    yield* wait(.5);
    // the rags come off in one throw: back over his shoulder, and there is what he wears under them
    K.coatShield=0;
    K.action={t0:S.t,end:1.1,body:[{t:0,v:()=>({...easyBody(K),crouch:.84,lean:.28})},{t:.45,v:()=>({...easyBody(K),lean:-.08}),e:sstep},{t:1.1,v:()=>K.guardBody(),e:sstep}],
      arm:[{t:0,v:K.curArm},{t:.3,v:{hand:{sh:[-.1*a,-.5*a]},wAng:-2,off:{sh:[-.2*a,-.42*a]},tilt:-.1},e:eOut},{t:.55,v:{hand:{sh:[-.52*a,.1*a]},wAng:2.2,off:{sh:[-.46*a,.16*a]},tilt:-.1},e:sstep},{t:1.1,v:()=>K.guardArm(),e:sstep}]};
    yield* wait(.42);
    // up and back over his shoulder, a little away from the camera, and the air takes it
    if(typeof KaelLook!=='undefined'&&KaelLook.coatCloth){try{const C=KaelLook.coatCloth(K);C.shred=K.coatShred;C.dep=K.dep;
      for(const q of C.pts||[]){q.px=q.x+K.facing*260*DT;q.py=q.y+380*DT;if(q.z!=null)q.pz=q.z-60*DT;}S.cloths.push(C);}catch(e){}}
    K.coatOff=true;K.charge='belt';S.story.flags.coatOff=true;S.hooks.sound('swoosh',2);
    yield* wait(.9);
    // empty guns on the marble; out come the batons
    for(const f of gs){f.action=null;dropWeapon(f,-1,false);f.setWeapon('club');}
    yield* speak('Sable','Ranger mithril. That coat was worth more than all three of them.',{dur:3.2});
    yield* speak(HERO_NAME,'Send Hallowell the bill.',{dur:1.8});
    standEasy(Sb,false);
    yield* wait(.1);},
  introSkip(st){const K=hero(),gs=S.F.slice(2,5);S.fade=0;K.action=null;K.coatShield=0;K.coatShred=1;K.coatOff=true;K.charge='belt';S.story.flags.coatOff=true;
    K.station=st.spawn[0][0];K.lane=K.dep=st.spawn[0][1];K.offstage=false;K.facing=1;K.build();
    for(const f of gs)if(f.weaponKey==='smg'){f.action=null;dropWeapon(f,-1,false);f.setWeapon('club');}standEasy(S.F[1],false);},
  *outro(st){const K=hero();letter(1);camTo(EXEC_DOOR.x-80,800,1);
    K.guarding=false;K.counter=false;
    yield* act(K,rollUpAction(K,S.t));stowBlade(K);
    // the charge goes on the executive's door: the game's own breach
    const step=breachStart(null);
    yield* until(()=>{if(S.breach&&S.breach.charge&&K.charge){K.charge=null;S.story.flags.charged=true;}return step();},14);
    yield* wait(.4);
    yield* goTo(K,EXEC_DOOR.x,EXEC_DOOR.slots[0][1],100);K.offstage=true;
    yield* wait(.3);},
  outroSkip(st){}});
S.cloths=[];V11.duelStart.push(()=>{S.cloths=[];});
// the thrown coat falls through the air on the sim's own clock (Kael's painter moves its cloth)
V11.step.push(()=>{if(!S.cloths.length||typeof KaelLook==='undefined'||!KaelLook.coatClothStep)return;for(const C of S.cloths){try{KaelLook.coatClothStep(C,DT,S.arena.ground(0,C.dep||100));}catch(e){}}});

// ===== STAGE X: THE OFFICE =====
// Through the smoke of the doorway: Kade, Hallowell's head of security, and behind his desk the executive himself, who never fights.
// When Kade is down the game's own last scene plays with Hallowell, and the player decides what becomes of him.
STAGES.push({key:'office',num:'X',title:'The Office',sub:'The top of Hallowell Tower',arena:'restaurant',room:'office',next:'roof',
  foes:[{name:'Kade',seed:9301,weapon:'sword',skill:3,temper:'keeper',hp:104}],
  spawn:[[300,96],[560,96,1]],
  setup(st){const K=hero();officeSetup(st.spawn,[K]);S.finaleDone=false;
    standEasy(K);stowBlade(K);K.station=OFFICE_ENTRY.x;K.lane=K.dep=K.stepDep=OFFICE_ENTRY.slots[0][1];K.facing=1;K.offstage=true;K.build();
    const Kd=S.F[1];Kd.facing=-1;Kd.build();},
  *intro(st){const K=hero();
    letter(1);camTo(360,820,0);
    yield* wait(.4);
    yield* goTo(K,st.spawn[0][0],st.spawn[0][1],80);K.offstage=false;
    yield* speak('Kade','Mr. Hallowell isn’t taking visitors.',{dur:2.2});
    yield* speak(HERO_NAME,'He’ll make time.',{dur:1.6});
    yield* speak('Kade','You think the Sareths will thank you for this?',{dur:2.6});
    yield* speak(HERO_NAME,'I’m not paid to be thanked.',{dur:1.8});
    yield* wait(.1);},
  introSkip(st){const K=hero();K.station=st.spawn[0][0];K.lane=K.dep=st.spawn[0][1];K.offstage=false;K.build();},
  // The helicopter is due on the roof, and the stair is back through the lobby. He goes the elf's way: across the room at a run, up
  // off the boards and through the glass behind the desk, out into the night over the city, and out like a lamp in the air: a line
  // of light goes up the face of the tower.
  *outro(st){const K=hero(),G0=OFFICE_GLASS,pane=glassPane(G0.x0+G0.pane*1.5),gx=(pane.x0+pane.x1)/2;letter(1);
    officeRelease(K);camTo(clamp((K.station+gx)/2,360,560),800,1.1);
    yield* wait(.5);
    if(!K.stow){if(K.weaponKey==='elven'&&!K.arcRoll){yield* act(K,rollUpAction(K,S.t));}stowBlade(K);K.arcRoll=null;}
    standEasy(K);K.facing=Math.sign(gx-K.station)||1;
    yield* wait(.45);
    // the run: low and fast, round behind what stands in the room, to the foot of the glass
    K.offstage=true;K.zMax=G0.d+60;K.sceneAgile=true;const z1=G0.d-16,x1=gx-K.facing*6,R=sceneRun(K,[[OFFICE_RUN.x,OFFICE_RUN.d],[x1,z1]],S.t,470);
    K.action=R;K.blur=S.t+R.T+.3;S.hooks.sound('vault',.8);
    yield* wait(R.T);K.station=x1;K.lane=z1;
    // up and through the pane
    K.action=crashAction(K,x1,z1,S.t);
    yield* until(()=>K.dep>=G0.d-3,.6);glassBreak(K,pane);K.clipRect=glassRect();
    // out in the night, and out like a lamp: the line of light goes up the tower
    yield* wait(.17);
    const P0=K.p[PEL],C0=K.p[CHE],top=K.p[HEAD].y-K.body.headR,low=Math.max(K.p[FTF].y,K.p[FTB].y),bx=(P0.x+C0.x)/2,d=K.dep;
    S.blinks.push({x:bx,y:P0.y,top,ground:low,d,t0:S.t,dur:.32,mode:'out',fa:K.facing,clip:K.clipRect});S.hooks.sound('blink',1);
    yield* wait(.13);K.hidden=true;K.sceneAgile=false;
    S.streaks.push({a:{x:bx,y:P0.y-20},b:{x:bx+14,y:P0.y-760},d0:d,d1:d,t0:S.t,life:.5,w:14,clip:K.clipRect});
    if(typeof addMotes==='function')addMotes(bx,P0.y-30,d,14,{spread:60,vy:-220,life:.6});
    // the night wind in through the hole, a moment, and the dark
    yield* wait(1.2);
    const t0=S.t;while(S.t<t0+.7){S.fade=(S.t-t0)/.7;yield;}S.fade=1;},
  outroSkip(st){}});
// ---------- out through the glass ----------
// The office's wall of glass is the back wall's right-hand end (depth 236): panes between bronze mullions every 108 units from x 604,
// on a travertine sill 26 high, up to a head 253 above the floor (the office painter's numbers). A pane he goes through is gone:
// S.story.glass is that pane, how it broke and the glass going out of it, for the page to draw what is left of it.
const OFFICE_GLASS={d:236,x0:604,pane:108,sill:26,head:253};
function glassPane(x){const OG=OFFICE_GLASS,i=Math.floor((x-OG.x0)/OG.pane);return{i,x0:OG.x0+i*OG.pane,x1:OG.x0+(i+1)*OG.pane};}
// the glass wall in the picture's own frame: what is out past it shows only through it
function glassRect(){const OG=OFFICE_GLASS,g=GB;return{x0:prjX(OG.x0-4,OG.d),y0:prjY(g-OG.head,OG.d),x1:prjX(OG.x0+40*OG.pane,OG.d),y1:prjY(g-OG.sill,OG.d)};}
// the last scene lets go of him: his own feet and his own pose again
function officeRelease(K){const F=S.finale;if(F)F.released=true;if(K.action&&K.action.fin)K.action=null;
  K.station=K.p[PEL].x;K.lane=clamp(K.dep,DEP_MIN,DEP_MAX);K.velX=0;K.guarding=false;K.counter=false;}
// (in the story the last scene's end is the stage's closing scene: from there he stands where the last scene left him)
if(typeof finaleStep==='function'){const fs=finaleStep;finaleStep=function(){const F=S.finale;if(F&&(F.released||(S.story&&F.ended)))return;return fs();};}
// the way round: behind the kneeling man and the globe, in front of the desk's back, then straight at the glass
const OFFICE_RUN={x:700,d:136};
// a run across a room in a scene, through the points pts at v a second: low, the arms going, a long stride. R.T is how long it takes.
function sceneRun(f,pts,t0,v){const x0=f.station,z0=f.lane,a=f.arm,leg=f.leg,st=(x,y)=>({stF:x*leg,stB:y*leg}),pose=(px,pz)=>({px,pz,crouch:.84,lean:.3,...st(.26,-.28),th:.36});
  const run={hand:{sh:[-.12*a,.44*a]},wAng:1.4,off:{sh:[.38*a,.14*a]},tilt:.16},body=[{t:0,v:()=>({...easyBody(f),px:x0,pz:z0})}];let t=0,px=x0,pz=z0;
  // the first few strides to get up to speed, then flat out
  pts.forEach(([x,z],i)=>{const d=Math.hypot(x-px,(z-pz)*.8);
    if(i===0&&d>60){const u=50/d;t+=.2;body.push({t,v:pose(lerp(px,x,u),lerp(pz,z,u)),e:eIn});px=lerp(px,x,u);pz=lerp(pz,z,u);}
    t+=Math.max(.08,Math.hypot(x-px,(z-pz)*.8)/v);body.push({t,v:pose(x,z)});px=x;pz=z;});
  body.push({t:t+.04,v:{...pose(px,pz),crouch:.72}});
  return{t0,end:t+.04,T:t,body,arm:[{t:0,v:()=>easyArm(f)},{t:.12,v:run,e:eOut},{t:t+.04,v:run}]};}
// up off the boards at the glass: the arms crossed before the face, the knees drawn up, through it and on out into the night
function crashAction(f,x0,z0,t0){const leg=f.leg,a=f.arm,fa=f.facing,G0=OFFICE_GLASS,st=(x,y)=>({stF:x*leg,stB:y*leg});
  const cover={hand:{sh:[.34*a,-.52*a]},wAng:-1.7,off:{sh:[.44*a,-.38*a]},tilt:-.14},open={hand:{sh:[.5*a,-.24*a]},wAng:-1.1,off:{sh:[-.36*a,.06*a]},tilt:0};
  const body=[{t:0,v:{px:x0,pz:z0,crouch:.7,lean:.38,...st(.36,-.38),th:.42,lift:0}},
    {t:.09,v:{px:x0+fa*4,pz:z0+4,crouch:.64,lean:.34,...st(.3,-.34),th:.3,lift:0},e:eOut},
    {t:.24,v:{px:x0+fa*12,pz:G0.d+4,crouch:.86,lean:.16,...st(.3,-.3),th:.95,lift:34},e:eOut},
    {t:.4,v:{px:x0+fa*20,pz:G0.d+22,crouch:.86,lean:.06,...st(.3,-.3),th:.95,lift:40},e:sstep},
    {t:.95,v:{px:x0+fa*30,pz:G0.d+34,crouch:.86,lean:-.12,...st(.3,-.3),th:.95,lift:16},e:sstep}];
  return{t0,end:1,body,arm:[{t:0,v:()=>f.curArm||easyArm(f)},{t:.14,v:cover,e:eOut},{t:.42,v:cover},{t:.7,v:open,e:sstep},{t:1,v:open}]};}
function glassBreak(f,pane){const OG=OFFICE_GLASS,g=S.arena.ground(pane.x0,OG.d),C=f.p[CHE],cy=C.y,seed=(S.rng()*1e9)|0,R=mulberry32(seed);
  const Gl={x0:pane.x0,x1:pane.x1,d:OG.d,y0:g-OG.head,y1:g-OG.sill,t0:S.t,seed,hx:C.x,hy:cy,frag:[]};S.story.glass=Gl;
  // most of the pane goes out into the night with him (the page draws that, seen through the glass); some falls back onto the boards
  for(let i=0;i<64;i++){const x=lerp(pane.x0+3,pane.x1-3,R()),y=lerp(Gl.y0+4,Gl.y1-3,R()),near=Math.hypot(x-C.x,(y-cy)*.6)<46;
    Gl.frag.push({x,y,vx:(x-C.x)*(1.4+R()*2)+(R()-.5)*50,vy:-40-R()*150-(near?70:0),a:R()*TAU,va:(R()-.5)*26,s:1.6+R()*(near?4.4:3),ph:R()*TAU,d:OG.d+3+R()*24});}
  for(let i=0;i<22;i++)shard('glass',lerp(pane.x0+4,pane.x1-4,R()),lerp(Gl.y0+20,Gl.y1-4,R()),OG.d-6,0,.7,{d:OG.d-3-R()*16,vx:(R()-.5)*110,vy:-30-R()*90});
  flash({x:C.x,y:cy},42,'#e8fbff',OG.d);sparks({x:C.x,y:cy},12,'#ffffff',OG.d);
  S.hooks.sound('glass',1.6);S.hooks.sound('crack',1);S.shake=Math.max(S.shake,8);S.freeze=Math.max(S.freeze,.06);S.slowT=Math.max(S.slowT,.85);
  if(!S.warming)S.punch={x:prjX(C.x,OG.d),t:0,z:.16};}
// the glass that went out falls away past the sill, down the face of the tower
V11.step.push(()=>{const Gl=S.story&&S.story.glass;if(!Gl||!Gl.frag.length)return;
  for(const s of Gl.frag){s.vy+=G*DT;s.x+=s.vx*DT;s.y+=s.vy*DT;s.a+=s.va*DT;}Gl.frag=Gl.frag.filter(s=>s.y<Gl.y1+260);});
V11.duelStart.push(()=>{if(S.story)S.story.glass=null;const K=S.F[0];if(K){K.clipRect=null;}});

// ===== THE ROOF =====
// The family's helicopter comes for him, and in its door the man in white: the family thanks him, and the family was never here. One
// round from an old pistol, and Kael goes over the edge of the tower.
// the roof ends at x 868: past it there is nothing under a man but the city
const ROOF_EDGE=868;
storyArena('roof',{label:'Roof',name:'The tower roof',ground:x=>x>ROOF_EDGE?GB+3000:GB,wall:null,far:230,maxX:840});
storyArena('fall',{label:'Fall',name:'The fall',ground:()=>GB+2000,wall:null,far:200});
S.scrollY=0;S.scrollYV=0;
function heliLook(){return typeof HeliLook!=='undefined'?HeliLook:null;}
function heliNew(o){const H=Object.assign({kind:'heli',x:1180,y:420,dep:150,fa:-1,rotor:0,door:0,lamp:1,tilt:0,gy:GB},o||{});S.veh.push(H);return H;}
function heliDoor(H){const L=heliLook();return L&&L.doorAt?L.doorAt(H):{x:H.x+H.fa*-10,y:H.gy-H.y-8};}
V11.step.push(()=>{for(const H of S.veh)if(H.kind==='heli'){H.rotor+=DT*42;H.y+=((H.yT??H.y)-H.y)*Math.min(1,DT*1.6);H.x+=((H.xT??H.x)-H.x)*Math.min(1,DT*1.2);
  // the downwash: grit off the pad, thin and cold in the floodlight
  if(!S.warming&&H.y<140&&Math.random()<.16)dust(H.x+(Math.random()-.5)*170,GB,.45,H.dep-40+Math.random()*60,'rgba(150,160,182,.42)');}
  // whoever rides in its door goes where the door goes, exactly
  for(const f of S.F){if(!f.inHeli)continue;const D=heliDoor(f.inHeli),L=f.heliAt;f.heliAt={x:D.x,y:D.y};if(!L)continue;const dx=D.x-L.x,dy=D.y-L.y;if(!dx&&!dy)continue;
    f.station+=dx;for(const q of f.p){q.x+=dx;q.px+=dx;q.y+=dy;q.py+=dy;}}});
// the man in white stands in the door: his feet on its sill, wherever the helicopter is
{const gr=Fighter.prototype.gr;Fighter.prototype.gr=function(x){if(this.inHeli){const D=heliDoor(this.inHeli);return D.y;}return gr.call(this,x);};}
// where he comes down on the roof, out of the light, by the edge he came up over
const ROOF_LAND={x:772,d:150};
function* blinkLand(f,x,z){const g=S.arena.ground(x,z),H=f.leg+f.body.torso+f.body.neck+f.body.headR*2,hp=f.leg*.86,up=64;
  S.streaks.push({a:{x:ROOF_EDGE+40,y:g+330},b:{x:x+14,y:g-hp-up-40},d0:z,d1:z,t0:S.t,life:.42,w:14});S.hooks.sound('blink',1);
  yield* wait(.1);
  S.blinks.push({x,y:g-hp-up,top:g-H-up,ground:g-up+6,d:z,t0:S.t,dur:.3,mode:'in',fa:f.facing});
  yield* wait(.19);
  // in the air over his mark, the knees drawn up, and down onto them
  for(const q of f.p){q.y-=up;q.py-=up;}f.hidden=false;f.blur=S.t+.45;f.flare=1.3;
  f.action={t0:S.t,end:1,body:[{t:0,v:()=>({...easyBody(f),crouch:.86,lean:.1,th:.95,lift:up})},{t:.26,v:()=>({...easyBody(f),crouch:.62,lean:.34,lift:0}),e:eIn},
    {t:1,v:()=>easyBody(f),e:sstep}],
    arm:[{t:0,v:{hand:{sh:[.42*f.arm,-.3*f.arm]},wAng:1.4,off:{sh:[-.3*f.arm,-.2*f.arm]},tilt:.05}},{t:.3,v:{hand:{sh:[.34*f.arm,.4*f.arm]},wAng:1.4,off:{sh:[.1*f.arm,.6*f.arm]},tilt:.1},e:eIn},{t:1,v:()=>easyArm(f),e:sstep}]};
  yield* wait(.26);dust(f.p[FTF].x,g,1,z);dust(f.p[FTB].x,g,.8,z);S.hooks.sound('thud',220);
  if(typeof addMotes==='function')addMotes(x,g-40,z,12,{spread:80,vy:-50});
  yield* until(()=>!f.action,1.2);}
const WHITE='The man in white';
if(typeof ELVES!=='undefined')ELVES[WHITE]={cm:191,bulk:1.02,min:1};
STAGES.push({key:'roof',num:'XI',title:'The Roof',sub:'Midnight, at the top of the tower',arena:'roof',next:'fall',noFight:true,
  foes:[],spawn:[[690,112]],
  // he comes up the outside of the tower in the Glimmer step's light, and lands on the roof by its edge
  setup(st){const K=hero();standEasy(K);stowBlade(K);S.fade=1;K.station=ROOF_LAND.x;K.lane=K.dep=K.stepDep=ROOF_LAND.d;K.facing=-1;K.offstage=true;K.hidden=true;K.build();
    // the family's helicopter, still far off over the city to the left
    const H=heliNew({x:-700,y:430,xT:-700,yT:430,dep:104,fa:1,lamp:1,spin:1});S.story.heli=H;
    const M=storyExtra(WHITE,{ward:null,seed:9901,x:430,dep:H.dep-2,facing:1,weapon:'fists',color:'#f2ece0'});M.hench=false;M.inHeli=H;M.offstage=true;M.hidden=true;
    standEasy(M);M.facing=1;M.station=heliDoor(H).x;M.lane=M.dep=M.stepDep=H.dep-2;M.build();S.story.white=M;},
  *intro(st){const K=hero(),H=S.story.heli,M=S.story.white,a=K.arm;
    letter(1);camTo(600,760,0);
    yield* until(()=>{S.fade=Math.max(0,S.fade-DT*1.7);return S.fade<=0;},1);
    yield* wait(.45);
    // a line of light up the face of the tower, over the edge, and he is in it, coming down onto the roof
    yield* blinkLand(K,ROOF_LAND.x,ROOF_LAND.d);
    yield* wait(.55);camTo(450,900,1.4);
    // to the edge of the roof to wait: the city all round below
    yield* goTo(K,st.spawn[0][0],st.spawn[0][1],80);K.offstage=false;K.facing=1;
    yield* wait(.8);
    // rotors: the family's helicopter, in low over the city, settling over the pad as if to land
    S.hooks.sound('heli',1);K.facing=-1;H.xT=430;H.yT=150;H.spot={x:K.station,dep:K.dep};
    yield* wait(2.6);H.yT=72;yield* wait(1.5);
    // the door slides back: a man in white
    M.station=heliDoor(H).x;M.build();M.heliAt=null;M.hidden=false;
    yield* until(()=>{H.door=Math.min(1,H.door+DT*1.4);M.station=heliDoor(H).x;return H.door>=1;},2);
    yield* speak(WHITE,'Ilyas. Clean work tonight. The family is grateful.',{dur:2.8,col:'#f2ece0'});
    yield* speak(HERO_NAME,'Then take me home.',{dur:1.8});
    yield* speak(WHITE,'Lumen Vast will come asking who did this. The family was never here tonight.',{dur:3.6,col:'#f2ece0'});
    yield* speak(WHITE,'And a denial is only as good as its loose ends. You’re the last one, Ilyas.',{dur:3.4,col:'#f2ece0'});
    // the pistol: old, ornate, one round, and the round charged
    M.setWeapon('hexpistol');M.charge=0;S.hooks.sound('charge',1);
    yield* until(()=>{M.charge=Math.min(1,M.charge+DT*.9);return M.charge>=1;},2);
    yield* speak(HERO_NAME,'Thirty years I carried the family’s cup.',{dur:2.4});
    yield* speak(WHITE,'And tonight the family drinks first. Nothing personal, Ilyas. It never is.',{dur:3.4,col:'#f2ece0'});
    M.action={t0:S.t,end:3,body:[{t:0,v:()=>M.guardBody()}],arm:[{t:0,v:M.curArm||M.guardArm()},{t:.4,v:()=>aimArmAt(M,aimPoint(K),0),e:eOut},{t:3,v:()=>aimArmAt(M,aimPoint(K),0)}]};
    yield* wait(.65);
    // the round: through him, and every bit of the magic in him goes out with it
    S.slowT=Math.max(S.slowT,2.2);
    const T=aimPoint(K);fireAt(M,T,{dep:K.dep});M.charge=0;S.hooks.sound('hex',1);
    yield* wait(.22);
    const fa=Math.sign(K.station-M.station)||1;
    S.impacts.push({x:T.x,y:T.y,dep:K.dep,t0:S.t,kind:'flesh',ang:0});bleed(T,fa,30,K.dep,1.3);flash(T,60,'#d8c8ff',K.dep);
    // out through his back, still burning
    S.tracers.push({a:{x:T.x,y:T.y,dep:K.dep},b:{x:T.x+fa*700,y:T.y-60,dep:K.dep},dep:K.dep,dep1:K.dep,t0:S.t,kind:'hex',dur:.25});
    for(let i=0;i<K.p.length;i++){if(i===TIP)continue;const q=K.p[i];q.px-=fa*(i===CHE?260:120)*DT;q.py+=40*DT;}
    K.drain=0;K.hp=Math.max(1,Math.round(K.hp*.15));S.hooks.status();
    const drain=(function*(){const t0=S.t;while(S.t<t0+1.6){K.drain=sstep((S.t-t0)/1.6);yield;}K.drain=1;})();
    // he goes back, a step at a time, to the edge
    standEasy(K);const x0=K.station,edge=ROOF_EDGE+14;
    K.action={t0:S.t,end:2.2,body:[{t:0,v:()=>({...easyBody(K),px:x0,lean:-.2,crouch:.86})},{t:.6,v:()=>({...easyBody(K),px:lerp(x0,edge,.3),lean:-.05,crouch:.8}),e:eOut},
      {t:1.4,v:()=>({...easyBody(K),px:lerp(x0,edge,.72),lean:-.3,crouch:.82}),e:sstep},{t:2.2,v:()=>({...easyBody(K),px:edge,lean:-.6,crouch:.8}),e:sstep}],
      arm:[{t:0,v:K.curArm},{t:.4,v:{hand:{sh:[.1*a,.1*a]},wAng:1.2,off:{sh:[.05*a,.08*a]},tilt:.3},e:eOut},{t:2.2,v:{hand:{sh:[-.2*a,.3*a]},wAng:1.6,off:{sh:[.2*a,.1*a]},tilt:.2}}]};
    K.offstage=true;K.facing=-fa;
    yield* all(drain,(function*(){yield* wait(2.1);})());
    // and over: nothing under him but the city
    K.motor=.05;K.knockUntil=S.t+99;for(const q of K.p){q.px-=fa*90*DT;q.py+=60*DT;}
    yield* wait(.9);
    S.fade=1;yield* wait(.5);},
  introSkip:null});

// ===== THE FALL =====
// Down the face of the tower, and what goes through his head on the way. When his thoughts run out the tower's foot comes up past
// him, and under it is the Pit: the old quarry the city fills with the people it has no room for, a slum built down its walls. He
// goes down it off everything that sticks out of its sides, onto a spike at the end of a cliff that goes through his right arm. He
// hangs from it until his own weight tears the arm out at the shoulder, and the rest of him goes on down, onto the roof of the Sump,
// a bar on the floor of the Pit, into a heap of hay, and the birds on the roof go up in a cloud. He is still alive: a faint light
// comes back into his eye, though every line of gilt on him stays dark; up on the spike the lines in the severed arm still glow.
const FALL_Y=350;           // his hips' height in the world while he thinks: at his depth that is the middle of the picture
const FALL_LINES=[
  ['No light. The gilt’s gone dark.',3],
  ['The Rangers inked that light into me. Noon on the border wire, and I knew what I was for.',4.9],
  ['I guarded wells for people who had nothing.',3.2],
  ['Then I traded the wire for the Sprawl, and the oath cup for the family’s.',4.3],
  ['Thirty years I gave the family.',3],
  ['Every door they pointed at, I opened.',3],
  ['Every name they gave me, I crossed out.',3],
  ['And they send a man in white to sweep me off the roof.',3.6],
  ['Fine.',1.8],
  ['Let the family deny this.',2.6],
  ['Out on the wire you learn to wait for water. I can wait.',3.7],
  ['I’m coming back. For the man in white. For the family. For every last one of them.',4.6]];
const FALL_EYE=.5;          // the light that comes back into his eye at the end, of the eye's full light
// ---------- the Pit ----------
// Its walls and its junk are in his plane (depth PIT_DEP), laid out in the picture's own x and in y down from the rim (the street at
// the tower's foot). The picture has a point (x, y) at rimY+y, rimY being where the rim is now (S.scrollY is how far the picture has
// come down since the roof, as it was down the face); the world has it at x-PIT_DEP*PSX, rimY+y+PIT_DEP*PSY.
const FALL_YREF=170,PIT_DEP=100,PIT_OX=-PIT_DEP*PSX,PIT_OY=PIT_DEP*PSY;
const PIT={
  lead:1500,                 // the tower's foot, this far below him when his thoughts run out
  vt0:1250,vt:720,           // the fall's top speed: down the face, then in the Pit once something has broken it
  // the walls' faces, [y, x] down each side: wide open at the rim, closing in below it
  wallL:[[0,-320],[200,-140],[330,64],[600,112],[1000,92],[1300,128],[1700,100],[2200,126],[2600,98],[3000,118],[3400,90],[3800,124],[4500,116]],
  wallR:[[0,1220],[200,1020],[330,836],[600,804],[1000,830],[1400,796],[1800,818],[2300,798],[2700,824],[3100,806],[3600,820],[4500,810]],
  // what sticks out of them, as capsules [x0, y0, x1, y1, r]: a girder, the floor of a hut, a car, pipes, a sign, a shelf of rubble,
  // and the cliff with the spike. aim: where he is steered to meet it (a falling body goes where the last blow sent it, and a little
  // where the scene wants it)
  items:[
    {key:'girder',mat:'steel',side:-1,aim:404,caps:[[60,402,488,450,9]]},
    {key:'balcony',mat:'wood',side:1,aim:546,brk:260,caps:[[860,992,450,1006,7]]},
    {key:'car',mat:'car',side:-1,aim:344,caps:[[60,1512,446,1578,18]]},
    {key:'pipes',mat:'pipe',side:1,aim:562,caps:[[860,2094,498,2106,7],[860,2122,522,2142,7]]},
    {key:'neon',mat:'neon',side:-1,aim:386,caps:[[60,2620,452,2620,5],[318,2668,446,2668,26]]},
    {key:'rubble',mat:'rock',side:1,aim:602,caps:[[860,2996,566,3030,15]]},
    {key:'cliff',mat:'rock',side:-1,aim:482,caps:[[40,3392,372,3402,17]]},
    {key:'roof',mat:'roof',side:0,aim:488,caps:[[258,4124,706,4124,4]]}],
  spike:{a:[364,3388],b:[446,3314],rest:.52},   // the spike at the cliff's end: its root, its point, where on it the arm comes to rest
  roof:{y:4124,x0:258,x1:706},                  // the bar's roof line, wall to wall
  hay:{x:488,w:86,h:42},                        // the heap of hay on it: centre, half-width, height
  floor:4300,                                   // the floor of the Pit
  mark:372,                                     // the highest the roof comes up the picture: the camera stops there
  tear:[.8,1.35,1.8,2.2,2.5],rip:2.8,           // the arm gives at these moments after it is caught, and comes away at the last
  lookY:360,lookDur:3.4};                       // the last look: the arm on the spike brought to this height in the world, over so long
for(const it of PIT.items){it.top=Math.min(...it.caps.map(c=>Math.min(c[1],c[3])-c[4]));it.bot=Math.max(...it.caps.map(c=>Math.max(c[1],c[3])+c[4]));}
// (the fall's painter draws the Pit from the same layout)
function pitLayout(){return PIT;}
// how his matter answers each thing: e the bounce, fr the scrape along it
const PIT_MAT={steel:{e:.16,fr:.22},wood:{e:.1,fr:.3},car:{e:.2,fr:.26},pipe:{e:.24,fr:.18},neon:{e:.14,fr:.25},rock:{e:.12,fr:.42},roof:{e:.05,fr:.6},wall:{e:.1,fr:.36}};
const PIT_TRUNK=[PEL,CHE,HEAD,KNF,KNB];
S.pit=null;
function pitRim(){return FALL_YREF+S.pit.base-S.scrollY;}
function pitToW(x,y){return{x:x+PIT_OX,y:pitRim()+y+PIT_OY};}
function pitFromW(x,y){return{x:x-PIT_OX,y:y-PIT_OY-pitRim()};}
// a wall's face at depth y down the Pit
function pitWallX(T,y){let i=0;while(i<T.length-2&&T[i+1][0]<y)i++;const a=T[i],b=T[i+1],u=clamp((y-a[0])/(b[0]-a[0]),0,1);return a[1]+(b[1]-a[1])*u*u*(3-2*u);}
// the hay's top at x (Pit terms)
function pitHayTop(x){const H=PIT.hay,u=(x-H.x)/H.w;return Math.abs(u)>=1?PIT.roof.y:PIT.roof.y-H.h*(1-u*u);}
// a point s of the way up the spike from its root (Pit terms, and in the world)
function pitSpike(s){const A=PIT.spike.a,B=PIT.spike.b;return{x:A[0]+(B[0]-A[0])*s,y:A[1]+(B[1]-A[1])*s};}
function pitSpikeW(s){const q=pitSpike(s);return pitToW(q.x,q.y);}
// the near shoulder as the look puts it (the top of the arm), in the world
function pitShoulder(f){const P0=f.p[PEL],C0=f.p[CHE],L=Math.hypot(C0.x-P0.x,C0.y-P0.y)||1,ux=(C0.x-P0.x)/L,uy=(C0.y-P0.y)/L,sz=f.body.h*(.93+.07*f.body.bulk);
  return{x:C0.x-ux*2.8*sz,y:C0.y-uy*2.8*sz};}
// the closest points of two segments: distance, and how far along each
function segSeg(a,b,c,d){const ux=b.x-a.x,uy=b.y-a.y,vx=d.x-c.x,vy=d.y-c.y,wx=a.x-c.x,wy=a.y-c.y,A=ux*ux+uy*uy||1e-9,B=ux*vx+uy*vy,C=vx*vx+vy*vy||1e-9,D=ux*wx+uy*wy,E=vx*wx+vy*wy,den=A*C-B*B;
  let s=den>1e-9?clamp((B*E-C*D)/den,0,1):0,t=(B*s+E)/C;if(t<0){t=0;s=clamp(-D/A,0,1);}else if(t>1){t=1;s=clamp((B-D)/A,0,1);}
  const px=a.x+ux*s-(c.x+vx*t),py=a.y+uy*s-(c.y+vy*t);return{d:Math.hypot(px,py),u:s,s:t};}
// the birds on the bar's roof, along its ridge and on the heap, a few on the sign and the stovepipe
function pitBirds(R){const B=[],H=PIT.hay,rf=PIT.roof;
  const add=(x,y,o)=>B.push(Object.assign({x,y,fa:R()<.5?-1:1,sz:.8+R()*.45,ph:R()*6.28,t0:null,fly:false,vx:0,vy:0,flap:0,tone:R()},o||{}));
  for(let i=0;i<46;i++){const x=rf.x0+12+(i+R()*.8)/46*(rf.x1-rf.x0-24);if(Math.abs(x-H.x)<H.w*.85)continue;add(x,rf.y-.5);}
  for(let i=0;i<12;i++)add(H.x-H.w*.7+R()*H.w*1.4,0,{onHay:true});
  for(const b of B)if(b.onHay)b.y=pitHayTop(b.x)-.5;
  for(let i=0;i<8;i++)add(rf.x0+50+i*20+R()*8,rf.y+26,{sign:true});
  for(let i=0;i<3;i++)add(640+R()*10,rf.y-60,{pipe:true});
  return B;}
function pitNew(){const R=mulberry32(7741);
  return{on:false,base:null,stage:'think',vt:PIT.vt0,cv:0,vx:0,vy:0,py:0,R,
    items:PIT.items.map(it=>Object.assign({},it,{hits:0,hitT:-9,hitT0:0,broken:0,dead:0,glass:0,swing:0,swingV:0,hx:null})),
    caps:[],hit:[],touchT:-9,impT:-9,lastHit:{},lastSp:{},rips:0,firstBig:false,slowAt:null,
    pin:null,pinT0:0,pops:0,arm:null,armGone:false,spurt:null,scrap:null,landT:null,
    bits:[],hay:[],feathers:[],birds:pitBirds(R),drops:0};}
// the camera rides with him by moving the world past it: everything in the world that is not laid out in the Pit's own terms moves too
function pitShift(sh){S.scrollY+=sh;const K=hero();
  for(const q of K.p){q.y-=sh;q.py-=sh;}for(const q of K.scarf||[]){q.y-=sh;q.py-=sh;}
  for(const L of [S.blood,S.sparks,S.dusts,S.flashes,S.popups,S.impacts])if(L)for(const e of L)e.y-=sh;
  for(const g of S.ghosts||[])for(const pt of g.pts)pt[1]-=sh;}
// the next thing he is to meet (the hay at the last)
function pitAim(P,py){if(P.stage==='drop'||P.stage==='landed')return PIT.hay.x;
  for(const it of P.items){if(it.key==='roof'||it.hits)continue;if(it.top>py-24)return it.aim;}
  return PIT.hay.x;}
// the arm that came away: its points in the body ride with his chest, out of everything (the arm itself hangs on the spike)
function pitArmFollow(f){const c=f.p[CHE];for(const i of [ELF,HAF,TIP]){const q=f.p[i];q.x=c.x;q.y=c.y;q.px=c.px;q.py=c.py;}}
// his thoughts are done: the air lets go of him and he falls at the speed the face was going by, toward the tower's foot
function pitOpen(K){const P=S.pit;P.on=true;P.stage='fall';P.vt=PIT.vt0;P.cv=S.scrollYV;
  P.base=Math.ceil((S.scrollY+FALL_Y-PIT_OY+PIT.lead-FALL_YREF)/100)*100;
  const v=S.scrollYV*DT;for(const q of K.p)q.py-=v;for(const q of K.scarf||[])q.py-=v;}
// every step: the air, the steering, the reach for the spike, the arm giving, the hay, the birds, and the camera
function pitStep(){const P=S.pit;if(!P||!P.on||S.warming||S.arenaKey!=='fall')return;const K=hero();if(!K)return;const p=K.p,R=P.R;
  if(P.armGone)pitArmFollow(K);
  let M=0,cx=0,cy=0,vx=0,vy=0;for(const i of PIT_TRUNK){const q=p[i];M+=q.m;cx+=q.x*q.m;cy+=q.y*q.m;vx+=(q.x-q.px)*q.m;vy+=(q.y-q.py)*q.m;}
  cx/=M;cy/=M;vx/=M*DT;vy/=M*DT;P.vx=vx;P.vy=vy;const py=pitFromW(cx,cy).y;P.py=py;
  const free=P.stage==='fall'||P.stage==='drop',touching=S.t-P.touchT<.22;
  if(free){
    // the air: never faster than the fall's top speed
    const a=G*vy*Math.abs(vy)/(P.vt*P.vt);for(const q of p)q.py+=a*DT*DT;
    // toward the next thing in the way, while nothing holds him
    if(S.t-P.impT>.15){const tx=pitAim(P,py)+PIT_OX,ax=clamp((tx-cx)*5.5-vx*2.4,-950,950);for(const q of p)q.px-=ax*DT*DT;}
    // a body that has come to rest on something rolls off it into the drop
    const sp=Math.hypot(vx,vy);if(touching&&sp<80){if(P.slowAt==null)P.slowAt=S.t;else if(S.t-P.slowAt>.5){const it=P.lastIt,sd=it&&it.side?-it.side:(cx<450?1:-1);
      for(const q of p){q.px-=sd*230*DT;q.py-=50*DT;}P.slowAt=null;}}else P.slowAt=null;}
  // the spike: as he comes down on it his right arm goes up and out over it, the way a falling man grabs at anything
  if(P.stage==='fall'&&!P.pin){const A=PIT.spike;
    if(py>A.b[1]-330&&py<A.a[1]+90){const T=pitSpikeW(1),H=p[HAF],E=p[ELF],tx=T.x-6,ty=T.y-30;
      let dx=(tx-H.x)*11,dy=(ty-H.y)*11;const m=Math.hypot(dx,dy);if(m>760){dx*=760/m;dy*=760/m;}
      const blend=(q,k,ox,oy)=>{const hx=(q.x-q.px)/DT,hy=(q.y-q.py)/DT,wx=vx+ox,wy=vy+oy;q.px=q.x-(hx+(wx-hx)*k)*DT;q.py=q.y-(hy+(wy-hy)*k)*DT;};
      blend(H,.3,dx,dy);blend(E,.16,dx*.5,dy*.5);}
    // a man who has gone past it without it taking him is put on it (a guard: the reach nearly always does it)
    if(py>A.a[1]+60){const E=p[ELF],H=p[HAF],r=segSeg(E,H,pitSpikeW(0),pitSpikeW(1));pitCatch(K,.5,clamp(r.s,.45,1),true);}}
  if(P.pin){const pn=P.pin;pn.s=lerp(pn.s0,PIT.spike.rest,eOut(clamp((S.t-pn.t0)/.16,0,1)));pn.k=clamp((S.t-pn.t0)/.1,0,1);}
  // hanging: the swing dies away slowly, the arm gives at the shoulder a little at a time, and comes away
  if(P.stage==='pinned'){const t=S.t-P.pinT0,gore=S.gore!=='off';
    for(const q of p){q.px=q.x-(q.x-q.px)*.996;q.py=q.y-(q.y-q.py)*.996;}
    while(P.pops<PIT.tear.length&&t>=PIT.tear[P.pops]){pitGive(K,P.pops);P.pops++;}
    const u=P.pops/(PIT.tear.length+1),tl=P.pops<PIT.tear.length?PIT.tear[P.pops]:PIT.rip,tp=P.pops?PIT.tear[P.pops-1]:0;
    K.armTear=clamp(u+(1/(PIT.tear.length+1))*clamp((t-tp)/Math.max(.1,tl-tp),0,1)*.35,0,1);
    // the wound runs: blood down the forearm off the spike, and from the shoulder once it has started to go
    if(gore&&R()<.12){const C=pitSpikeW(pn_s(P));S.blood.push({x:C.x,y:C.y+3,d:PIT_DEP,vx:(R()-.5)*14,vy:20,r:.8+R()*1,age:0});}
    if(gore&&P.pops&&R()<.08+.04*P.pops){const C=pitShoulder(K);S.blood.push({x:C.x,y:C.y,d:PIT_DEP,vx:(R()-.5)*20,vy:30,r:.9+R()*1.3,age:0});}
    if(t>=PIT.rip)pitRip(K);}
  // the stump spurts a while after the arm comes away
  if(P.spurt&&S.gore!=='off'){const sp=P.spurt;if(S.t>sp.until)P.spurt=null;else{const u=(S.t-sp.t0)/(sp.until-sp.t0),pulse=.55+.45*Math.sin((S.t-sp.t0)*13);
    if(R()<(1-u*.7)*.55){const C=pitShoulder(K),c=p[CHE],P0=p[PEL],ang=Math.atan2(c.y-P0.y,c.x-P0.x)-K.facing*.5+(R()-.5)*.6,v=((1-u)*220+40)*pulse;
      S.blood.push({x:C.x,y:C.y,d:PIT_DEP,vx:Math.cos(ang)*v,vy:Math.sin(ang)*v,r:.9+R()*1.6,age:0});}}}
  // the arm on the spike: its own three points, the forearm through on the spike, the torn end hanging
  if(P.arm){const A=P.arm,Q=A.pts;
    for(const q of Q){const ux=(q.x-q.px)*.993,uy=(q.y-q.py)*.993;q.px=q.x;q.py=q.y;q.x+=ux;q.y+=uy+G*DT*DT;}
    const stick=(a,b,L,wa,wb)=>{const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1e-6,k=(d-L)/d/(wa+wb);a.x+=dx*k*wa;a.y+=dy*k*wa;b.x-=dx*k*wb;b.y-=dy*k*wb;};
    for(let it=0;it<6;it++){stick(Q[0],Q[1],A.L[0],1.2,1);stick(Q[1],Q[2],A.L[1],1,1.4);
      const at=pitSpike(A.s),mx=Q[1].x+(Q[2].x-Q[1].x)*A.u,my=Q[1].y+(Q[2].y-Q[1].y)*A.u;Q[1].x+=at.x-mx;Q[1].y+=at.y-my;Q[2].x+=at.x-mx;Q[2].y+=at.y-my;}
    const aw=pitToW(Q[0].x,Q[0].y);if(S.gore!=='off'&&aw.y>-40&&R()<clamp(.32-(S.t-A.t0)*.1,.04,.32)){const w=aw;S.blood.push({x:w.x,y:w.y,d:PIT_DEP,vx:(R()-.5)*16,vy:15,r:.8+R()*1.2,age:0});}}
  // what came off the junk falls with him
  for(const b of P.bits){b.age+=DT;b.vy+=G*(b.k==='glass'||b.k==='splinter'?.9:1)*DT;b.vx*=.996;b.x+=b.vx*DT;b.y+=b.vy*DT;b.a+=b.va*DT;}
  if(P.bits.length)P.bits=P.bits.filter(b=>b.age<b.life&&b.y<PIT.floor);
  // the hay that went up comes down slowly, and lies where it lands
  for(const h of P.hay){h.age+=DT;if(h.rest)continue;h.vy+=420*DT;h.vx*=.975;h.vy*=.975;h.x+=h.vx*DT+Math.sin(h.age*7+h.a)*8*DT;h.y+=h.vy*DT;h.a+=h.va*DT;
    const g=h.x>PIT.roof.x0&&h.x<PIT.roof.x1?pitHayTop(h.x)-1:PIT.floor;if(h.vy>0&&h.y>g){h.y=g;h.rest=true;}}
  if(P.hay.length)P.hay=P.hay.filter(h=>h.age<h.life);
  for(const fe of P.feathers){fe.age+=DT;fe.vy+=(26-fe.vy)*2.2*DT;fe.x+=(fe.vx+Math.sin(fe.age*3+fe.a)*30)*DT;fe.y+=fe.vy*DT;fe.a+=Math.cos(fe.age*3+fe.a)*2*DT;}
  if(P.feathers.length)P.feathers=P.feathers.filter(fe=>fe.age<fe.life);
  // the birds: still till the roof is hit, then up and away in a cloud
  pitBirdStep(P);
  // the sign that was hit swings on its chains
  for(const it of P.items)if(it.swing||it.swingV){it.swingV+=(-it.swing*26-it.swingV*1.6)*DT;it.swing+=it.swingV*DT;}
  // the camera: it rides with him, leading a little at speed, lagging a moment when he hits something, and stops when the bar's
  // roof is up to its mark
  if(P.look){const L=P.look,sy=L.from+(L.to-L.from)*sstep(clamp((S.t-L.t0)/L.dur,0,1)),sh=sy-S.scrollY;if(sh)pitShift(sh);S.scrollYV=0;P.cv=0;}
  else{let err=cy-(320-clamp(vy*.04,0,30));if(P.stage==='pinned'){const at=pitSpikeW(pn_s(P));err=(at.y+cy)/2-292;}
    const W2=9;P.cv+=(W2*W2*err+2*W2*(vy-P.cv))*DT;let sh=P.cv*DT;
    // he is never let out of the picture: the camera keeps his middle between these heights whatever it is doing
    const lo=P.stage==='pinned'?280:250,hi=420;if(cy-sh<lo){sh=cy-lo;P.cv=sh/DT;}else if(cy-sh>hi){sh=cy-hi;P.cv=sh/DT;}
    const lim=FALL_YREF+P.base+PIT.roof.y-S.scrollY-PIT.mark;if(sh>lim){sh=Math.max(0,lim);P.cv=Math.min(P.cv,0);}
    if(sh)pitShift(sh);S.scrollYV+=(sh/DT-S.scrollYV)*.25;}
  // this step's colliders in the world, near him
  P.caps.length=0;{const rim=pitRim(),py2=pitFromW(cx,cy).y;
    for(const it of P.items){if(it.broken&&S.t>it.broken+.03)continue;if(it.top>py2+420||it.bot<py2-420)continue;
      for(const c of it.caps){const ax=c[0]+PIT_OX,ay=rim+c[1]+PIT_OY,bx=c[2]+PIT_OX,by=rim+c[3]+PIT_OY,dx=bx-ax,dy=by-ay,L=Math.hypot(dx,dy)||1,ex=dx/L,ey=dy/L;
        P.caps.push({it,ax,ay,ex,ey,L,nx:-ey,ny:ex,r:c[4]});}}}}
// the last look: up the wall from the hay to the arm on the spike (the camera stops riding with him; he is left below)
function pitLookUp(P){const Q=P.arm.pts,my=(Q[0].y+Q[1].y+Q[2].y)/3;P.look={t0:S.t,dur:PIT.lookDur,from:S.scrollY,to:FALL_YREF+P.base+my+PIT_OY-PIT.lookY};}
function pn_s(P){return P.pin?P.pin.s:PIT.spike.rest;}
// in the solver: the walls, the junk, the forearm on the spike, the hay
function pitCollide(f,final){const P=S.pit;if(!P||!P.on||f!==S.F[0]||S.arenaKey!=='fall')return;
  const p=f.p,rim=pitRim(),oy=rim+PIT_OY;
  if(P.armGone)pitArmFollow(f);
  for(let i=0;i<p.length;i++){if(i===TIP||(P.armGone&&(i===ELF||i===HAF)))continue;const q=p[i],yP=q.y-oy;
    if(yP>-60){const xl=pitWallX(PIT.wallL,yP)+PIT_OX+q.r,xr=pitWallX(PIT.wallR,yP)+PIT_OX-q.r;
      if(q.x<xl){q.x=xl;P.hit[i]={it:null,nx:1,ny:0};}else if(q.x>xr){q.x=xr;P.hit[i]={it:null,nx:-1,ny:0};}}
    for(const c of P.caps){const R=c.r+q.r*.7,s=(q.x-c.ax)*c.ex+(q.y-c.ay)*c.ey,sc=clamp(s,0,c.L),kx=c.ax+c.ex*sc,ky=c.ay+c.ey*sc;
      const n0=(q.px-c.ax)*c.nx+(q.py-c.ay)*c.ny,n1=(q.x-c.ax)*c.nx+(q.y-c.ay)*c.ny;
      // through it in one step (he is fast and the junk is thin): back out on the side he came from
      if(s>0&&s<c.L&&n0*n1<0&&Math.abs(n0)>=R*.5){const sg=Math.sign(n0);q.x=kx+c.nx*sg*R;q.y=ky+c.ny*sg*R;P.hit[i]={it:c.it,nx:c.nx*sg,ny:c.ny*sg};continue;}
      let dx=q.x-kx,dy=q.y-ky,d=Math.hypot(dx,dy);if(d>=R)continue;
      if(d<1e-6){const sg=Math.sign(n0)||-1;dx=c.nx*sg;dy=c.ny*sg;d=1;}
      q.x=kx+dx/d*R;q.y=ky+dy/d*R;P.hit[i]={it:c.it,nx:dx/d,ny:dy/d};}}
  // the forearm through on the spike: the point of it the spike went through stays on the spike (brought onto it over a moment)
  if(P.pin&&!P.armGone){const pn=P.pin,E=p[ELF],H=p[HAF],at=pitSpikeW(pn.s),mx=E.x+(H.x-E.x)*pn.u,my=E.y+(H.y-E.y)*pn.u,k=pn.k??1;
    const tx=at.x+(pn.ox||0)*(1-k),ty=at.y+(pn.oy||0)*(1-k),ex=tx-mx,ey=ty-my;E.x+=ex;E.y+=ey;H.x+=ex;H.y+=ey;}
  if(!final)return;
  // the hay: soft, it takes him in and holds him
  {const H=PIT.hay;for(let i=0;i<p.length;i++){if(i===TIP||(P.armGone&&(i===ELF||i===HAF)))continue;const q=p[i],pp=pitFromW(q.x,q.y),top=pitHayTop(pp.x);
    if(Math.abs(pp.x-H.x)<H.w&&pp.y>top){const dep=pp.y-top,ux=(q.x-q.px)*.72,uy=(q.y-q.py)*.72-dep*.004;q.px=q.x-ux;q.py=q.y-uy;
      if(P.stage==='drop'&&(i===PEL||i===CHE))pitLand(f);}}}
  // the catch: his forearm comes down on the spike's point
  if(P.stage==='fall'&&!P.pin){const A=pitSpikeW(0),B=pitSpikeW(1),r=segSeg(p[ELF],p[HAF],A,B);if(r.d<7&&r.u>.12)pitCatch(f,r.u,r.s,false);}
  pitContacts(f);}
// what each contact does to his motion, and the hardest of them to the junk
function pitContacts(f){const P=S.pit,p=f.p;let best=null,roof=false;
  for(let i=0;i<p.length;i++){const h=P.hit[i];if(!h)continue;P.hit[i]=null;const q=p[i],m=PIT_MAT[h.it?h.it.mat:'wall']||PIT_MAT.rock;
    const vx=q.vx0,vy=q.vy0,vn=vx*h.nx+vy*h.ny;
    if(vn<0){const tx=vx-vn*h.nx,ty=vy-vn*h.ny,sp=-vn/DT;
      if(sp>120){const k=1-m.fr;q.px=q.x-(tx*k-vn*m.e*h.nx);q.py=q.y-(ty*k-vn*m.e*h.ny);}
      else{q.px=q.x-tx*.985;q.py=q.y-ty*.985;}
      if(!best||sp>best.sp)best={sp,i,q,h};}
    P.touchT=S.t;if(h.it){P.lastIt=h.it;if(h.it.key==='roof')roof=true;}}
  // down on the bar's roof (in the hay, or beside it): the fall is over
  if(roof&&P.stage==='drop')pitLand(f);
  if(best&&best.sp>150)pitImpact(f,best);}
const PIT_ZONE=i=>i===ELF||i===HAF||i===ELB||i===HAB?'arm':i===KNF||i===FTF||i===KNB||i===FTB?'leg':'body';
// a blow against the junk: the body, the sound, the dust, the blood, and what it does to the thing he hit
function pitImpact(f,b){const P=S.pit,it=b.h.it,mat=it?it.mat:'wall',sp=b.sp,q=b.q,key=it?it.key:'wall'+Math.sign(b.h.nx);
  if(it&&it.key==='roof')return;
  const last=P.lastHit[key]??-9;if(S.t-last<.14&&sp<(P.lastSp[key]||0)*1.6)return;P.lastHit[key]=S.t;P.lastSp[key]=sp;
  if(mat==='wall'&&sp<260)return;
  const C={x:q.x,y:q.y},dir=Math.sign(b.h.nx)||(P.R()<.5?-1:1),k=clamp(sp/700,.3,1.6),big=sp>480;
  if(it){it.hits++;it.hitT=S.t;if(!it.hitT0)it.hitT0=S.t;it.hx=pitFromW(q.x,q.y).x;}
  P.impT=S.t;
  // the first real blow takes the speed of the fall out of him: from here the air holds him to a slower top speed
  if(P.vt>PIT.vt&&sp>300)P.vt=PIT.vt;
  S.shake=Math.max(S.shake,clamp(sp/70,2,13));S.shakeDir={x:b.h.nx,y:b.h.ny};
  if(big){S.freeze=Math.max(S.freeze,.04+.045*k);S.slowT=Math.max(S.slowT,P.firstBig?.16:.5);P.firstBig=true;}
  S.hooks.sound(sp>480?'crit':'hit',sp);
  if(sp>300)bleed(C,dir,Math.round(5+9*k),PIT_DEP,.7+.5*k);
  if(sp>360&&P.rips<10&&typeof addMark==='function'){const zone=PIT_ZONE(b.i),mk=addMark(f,zone,true);
    if(S.hooks.rip)S.hooks.rip(null,f,{dmg:Math.round(10+sp/60),kind:'slash',out:big?'crit':'hit',tech:{}},C,zone,true,mk);P.rips++;}
  pitMatFx(it,mat,C,sp,b.h,dir,k);}
function pitBit(o){const P=S.pit;P.bits.push(Object.assign({x:0,y:0,vx:0,vy:0,a:0,va:0,w:4,h:2,age:0,life:2.6,k:'rock'},o));if(P.bits.length>140)P.bits.splice(0,P.bits.length-140);}
function pitMatFx(it,mat,C,sp,h,dir,k){const P=S.pit,R=P.R,pc=pitFromW(C.x,C.y),snd=S.hooks.sound;
  const burst=(n,kind,o)=>{for(let i=0;i<n;i++){const a=-Math.PI/2+(R()-.5)*2.6,v=(80+R()*260)*k;pitBit(Object.assign({k:kind,x:pc.x+(R()-.5)*16,y:pc.y+(R()-.5)*8,vx:Math.cos(a)*v+dir*40,vy:Math.sin(a)*v,a:R()*6.28,va:(R()-.5)*18},o?o(R):{}));}};
  if(mat==='steel'){snd('clang',1);if(sp>500)snd('crack',1);sparks(C,Math.round(8+sp/45),'#ffd27a',PIT_DEP);flash(C,16+10*k,'#ffd27a',PIT_DEP);dust(C.x,C.y+4,.6*k,PIT_DEP,'rgba(120,96,80,.5)');burst(5,'rock',r=>({w:2+r()*2,h:1.5+r()*1.5,col:'#4a3226'}));}
  else if(mat==='wood'){snd('wood',1.5);dust(C.x,C.y+4,.8*k,PIT_DEP,'rgba(130,104,74,.5)');burst(8,'splinter',r=>({w:3+r()*6,h:1,col:r()<.5?'#6a4a30':'#8a6440'}));
    if(it&&it.brk&&!it.broken&&sp>it.brk)pitBreak(it,pc,dir,k);}
  else if(mat==='car'){snd('crash',1);snd('clang',.7);sparks(C,10,'#ffcf86',PIT_DEP);dust(C.x,C.y+4,.7*k,PIT_DEP,'rgba(110,100,96,.5)');
    if(it&&!it.glass){it.glass=S.t;snd('glass',1.4);const g=pitToW(it.hx??pc.x,pc.y+20);void g;burst(22,'glass',r=>({w:2+r()*3,h:1.2+r()*1.6,col:r()<.5?'#a8d8e8':'#d8f4ff',life:2}));}}
  else if(mat==='pipe'){snd('clang',.9);snd('hit',300);sparks(C,6,'#ffcf86',PIT_DEP);
    for(let i=0;i<14;i++){const a=-Math.PI/2+(R()-.5)*2.4,v=(60+R()*200)*k;pitBit({k:'drop',x:pc.x,y:pc.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,w:1.4,h:1.4,col:'#9fc8e0',life:1.4});}}
  else if(mat==='neon'){snd('glass',1.2);snd('sizzle',1.4);sparks(C,26,'#ff5ad8',PIT_DEP);sparks(C,12,'#7ff3e3',PIT_DEP);flash(C,40,'#ff5ad8',PIT_DEP);
    if(it&&!it.dead){it.dead=S.t;it.swingV=dir*2.6;burst(18,'glass',r=>({w:3+r()*5,h:1.4,col:r()<.6?'#ff7ae0':'#ffd0f4',life:2}));}}
  else{snd('plaster',clamp(k,.5,1.4));if(sp>420)snd('gravel',1);dust(C.x,C.y+4,1.1*k,PIT_DEP,'rgba(120,108,100,.55)');dust(C.x+dir*10,C.y,.8*k,PIT_DEP,'rgba(96,86,80,.45)');
    burst(10,'rock',r=>({w:2+r()*4,h:2+r()*3,col:r()<.5?'#3a3236':'#4c4246'}));}}
// the hut's floor gives way under him: the planks go down with him
function pitBreak(it,pc,dir,k){const P=S.pit,R=P.R;it.broken=S.t;S.hooks.sound('crack',1.2);S.hooks.sound('wood',1.6);
  const c=it.caps[0];for(let i=0;i<9;i++){const u=.25+R()*.75,x=c[0]+(c[2]-c[0])*u,y=c[1]+(c[3]-c[1])*u;
    pitBit({k:'plank',x,y,vx:(R()-.5)*160+dir*30,vy:-40-R()*120,a:Math.atan2(c[3]-c[1],c[2]-c[0])+(R()-.5)*.6,va:(R()-.5)*7,w:22+R()*26,h:5,col:R()<.5?'#5a3e28':'#6e4c30',life:3});}
  for(let i=0;i<4;i++)pitBit({k:'plank',x:it.caps[0][2]+40+i*36,y:c[1]-30,vx:(R()-.5)*100,vy:-30-R()*60,a:Math.PI/2+(R()-.5)*.4,va:(R()-.5)*5,w:30,h:3,col:'#4a3220',life:3});}
// on the spike: the arm stops dead and the body swings on under it
function pitCatch(f,u,s,forced){const P=S.pit,p=f.p,R=P.R;if(P.pin)return;
  const pn={u:clamp(u,.22,.85),s0:clamp(s,.3,1),s:clamp(s,.3,1),t0:S.t,k:0};
  // where the arm is now against where on the spike it goes: it is brought there over a moment, so nothing jumps
  const at=pitSpikeW(pn.s),E=p[ELF],H=p[HAF],mx=E.x+(H.x-E.x)*pn.u,my=E.y+(H.y-E.y)*pn.u;pn.ox=mx-at.x;pn.oy=my-at.y;
  if(forced){const m=Math.hypot(pn.ox,pn.oy);if(m>70){pn.ox*=70/m;pn.oy*=70/m;}}
  P.pin=pn;P.stage='pinned';P.pinT0=S.t;P.pops=0;P.spurt=null;
  for(const q of p){q.px=q.x-(q.x-q.px)*.5;q.py=q.y-(q.y-q.py)*.5;}
  S.freeze=Math.max(S.freeze,.12);S.slowT=Math.max(S.slowT,.8);S.shake=Math.max(S.shake,11);S.shakeDir={x:0,y:1};
  S.hooks.sound('impale',1);S.hooks.sound('crit',600);
  const C=pitSpikeW(pn.s);bleed(C,1,24,PIT_DEP,1.1);flash(C,24,'#ffb08a',PIT_DEP);
  if(typeof addMark==='function'){const mk=addMark(f,'arm',true);if(mk){mk.a=ELF;mk.b=HAF;mk.u=pn.u;}}
  const cl=P.items.find(it=>it.key==='cliff');if(cl){cl.hitT=S.t;cl.hits++;}}
// the arm gives a little more: a tear at the shoulder, the body drops a little on it
function pitGive(f,i){const P=S.pit,gore=S.gore!=='off',R=P.R;
  f.sticks[2][2]+=gore?3.4:1.2;
  S.hooks.sound(gore?'tear':'cloth',.6+i*.15);
  for(const [k,q] of f.p.entries()){if(k===ELF||k===HAF||k===TIP)continue;q.py-=(26+i*6)*DT;}
  if(gore){const C=pitShoulder(f);bleed(C,f.facing,4+i*2,PIT_DEP,.4);}
  S.shake=Math.max(S.shake,2+i);}
// and comes away
function pitRip(f){const P=S.pit,gore=S.gore!=='off',p=f.p;P.stage='drop';P.vt=PIT.vt;
  if(gore){
    // the arm stays on the spike, its own three points from here: the torn top of it, the elbow, the hand
    const Sh=pitShoulder(f),mk=q=>{const w=pitFromW(q.x,q.y),v=pitFromW(q.px,q.py);return{x:w.x,y:w.y,px:v.x,py:v.y};};
    const E=p[ELF],H=p[HAF];
    P.arm={pts:[mk({x:Sh.x,y:Sh.y,px:Sh.x,py:Sh.y}),mk(E),mk(H)],L:[Math.hypot(E.x-Sh.x,E.y-Sh.y),f.body.fa],u:P.pin.u,s:P.pin.s,fa:f.facing,t0:S.t,coatOff:!!f.coatOff};
    f.sticks[2][3]=1;f.sticks[3][3]=1;f.sticks[10][3]=1;P.armGone=true;f.armOff=true;f.armTear=0;
    bleed(Sh,-f.facing,22,PIT_DEP,1.2);P.spurt={t0:S.t,until:S.t+1.1};
    S.hooks.sound('rip',1);S.hooks.sound('crit',700);}
  else{
    // (no blood) the sleeve tears through and the arm slides off the spike; a strip of the coat stays on it
    P.scrap={s:P.pin.s,t0:S.t};f.armTear=0;f.sticks[2][2]=f.body.ua;
    if(S.hooks.rip){const E=p[ELF];S.hooks.rip(null,f,{dmg:16,kind:'overhead',out:'crit',tech:{}},{x:E.x,y:E.y},'arm',true,null);}
    S.hooks.sound('cloth',1.2);}
  P.pin=null;
  // the body drops away from the cliff's end, turning
  for(const [k,q] of p.entries()){if(P.armGone&&(k===ELF||k===HAF||k===TIP))continue;q.px+=f.facing*30*DT;}
  S.freeze=Math.max(S.freeze,.07);S.slowT=Math.max(S.slowT,.6);S.shake=Math.max(S.shake,9);S.shakeDir={x:0,y:1};}
// into the hay: it bursts round him, and the birds go up
function pitLand(f){const P=S.pit;if(P.stage==='landed')return;P.stage='landed';P.landT=S.t;const R=P.R,H=PIT.hay;
  // he comes to rest face up, toward the sky, where the light that comes back into his eye can be seen
  {const h=f.p[HEAD],c=f.p[CHE],ux=h.x-c.x;if((f.facing>0?ux:-ux)>0)f.facing=-f.facing;}
  S.hooks.sound('hay',1);S.hooks.sound('thud',420);S.hooks.sound('birds',1);
  S.shake=Math.max(S.shake,7);S.shakeDir={x:0,y:1};S.slowT=Math.max(S.slowT,.4);
  const c=pitFromW(f.p[PEL].x,f.p[PEL].y);
  for(let i=0;i<170;i++){const a=-Math.PI/2+(R()-.5)*2.5,v=60+R()*380,x=c.x+(R()-.5)*H.w*1.3;
    P.hay.push({x,y:Math.min(c.y,pitHayTop(x)-2)-R()*10,vx:Math.cos(a)*v*.8,vy:Math.sin(a)*v,a:R()*6.28,va:(R()-.5)*14,len:3+R()*6,age:0,life:4+R()*3,rest:false,tone:R()});}
  dust(f.p[PEL].x,f.p[PEL].y,1.6,PIT_DEP,'rgba(214,180,96,.45)');dust(f.p[CHE].x,f.p[CHE].y,1.3,PIT_DEP,'rgba(200,168,90,.4)');
  // the nearest go first, the rest a moment after them: a cloud
  for(const b of P.birds){const d=Math.abs(b.x-c.x)+Math.abs(b.y-c.y)*.5;b.t0=S.t+clamp(d/900,0,.45)+R()*.18;}}
function pitBirdStep(P){const R=P.R;
  {let n=0,x=0,y=0,vx=0,vy=0;for(const b of P.birds)if(b.fly){n++;x+=b.x;y+=b.y;vx+=b.vx;vy+=b.vy;}P.flock=n>3?{x:x/n,y:y/n,vx:vx/n,vy:vy/n}:null;}
  for(const b of P.birds){
    if(!b.fly){b.ph+=DT*(1.2+b.tone);if(b.t0==null||S.t<b.t0)continue;
      b.fly=true;const away=Math.sign(b.x-PIT.hay.x)||(R()<.5?-1:1);b.vx=away*(40+R()*150)+(R()-.5)*60;b.vy=-(250+R()*200);b.flap=17+R()*9;b.fa=Math.sign(b.vx)||1;
      if(R()<.25)P.feathers.push({x:b.x,y:b.y-3,vx:(R()-.5)*40,vy:-20-R()*30,a:R()*6.28,age:0,life:5+R()*3,tone:R()});continue;}
    // climbing: wings working, and the flock keeping together as a cloud, turning as it goes up
    b.vy-=(110+60*b.tone)*DT;b.vx+=(Math.sin(S.t*1.7+b.ph*.3)*70+Math.cos(S.t*.9+b.tone*5)*30)*DT;
    if(P.flock){b.vx+=((P.flock.x-b.x)*.9+(P.flock.vx-b.vx)*.8)*DT;b.vy+=((P.flock.y-b.y)*.5)*DT;}
    b.vx*=.996;b.vy*=.994;if(b.vy<-520)b.vy=-520;b.x+=b.vx*DT;b.y+=b.vy*DT;b.ph+=b.flap*DT;b.fa=b.vx<-8?-1:b.vx>8?1:b.fa;}}
// ---------- the stage ----------
STAGES.push({key:'fall',num:'',title:'',sub:'',arena:'fall',next:null,noFight:true,noWarm:true,cardDur:0,foes:[],spawn:[[450,PIT_DEP]],
  setup(st){const K=hero();S.fade=1;S.scrollY=0;S.scrollYV=0;S.pit=pitNew();stowBlade(K);K.station=440;K.lane=K.dep=K.stepDep=PIT_DEP;K.offstage=true;K.facing=1;K.build();
    K.motor=0;K.knockUntil=S.t+999;K.drain=1;K.eyeLit=0;K.hp=Math.max(1,K.hp);K.armOff=false;K.armTear=0;
    // he starts in the middle of the picture, tumbling
    const cy=FALL_Y,d0=cy-K.p[PEL].y;for(const q of K.p){q.y+=d0;q.py+=d0;}
    for(let i=0;i<K.p.length;i++){const q=K.p[i],rx=q.x-K.p[PEL].x,ry=q.y-K.p[PEL].y;q.px=q.x-(-ry*.05);q.py=q.y-(rx*.05);}},
  *intro(st){const K=hero(),P=S.pit;
    letter(1);S.fade=1;camTo(450,760,0);
    const fade=(function*(){const t0=S.t;while(S.t<t0+1.2){S.fade=1-(S.t-t0)/1.2;yield;}S.fade=0;})();
    // the facade goes up past him faster and faster; the air holds him in the middle of the picture: gravity taken off, and the drift
    // of the whole body eased toward a slow pull back to the middle, the tumble of his limbs left as it is
    const hold=(function*(){while(!P.on){S.scrollYV=Math.min(1800,S.scrollYV+DT*800);S.scrollY+=S.scrollYV*DT;
      const P0=K.p[PEL],n=K.p.length;let mx=0,my=0;for(const q of K.p){mx+=q.x-q.px;my+=q.y-q.py;}mx/=n;my/=n;
      const tx=clamp((440-P0.x)*.7,-50,50)*DT,ty=clamp((FALL_Y-P0.y)*.9,-70,70)*DT;
      for(const q of K.p){q.px+=(mx-tx)*.1;q.py+=(my-ty)*.1+G*DT*DT;}yield;}})();
    const lines=(function*(){yield* wait(1.4);for(const [txt,d] of FALL_LINES){S.thought={text:txt,t0:S.t,dur:d};yield* wait(d);}S.thought=null;yield* wait(.35);pitOpen(K);})();
    yield* all(fade,hold,lines);
    // the Pit: from here pitStep has him (the air, the junk, the spike, the hay); the scene waits for the hay
    yield* until(()=>P.stage==='landed',45);
    if(P.stage!=='landed')pitLand(K);
    yield* wait(2.4);
    // still alive: a faint light comes back into his eye, though every line of gilt on him stays dark (K.eyeLit is the eye's own; the
    // drain that keeps his tattoos scars stays whole)
    const t1=S.t;yield* until(()=>{K.eyeLit=FALL_EYE*sstep(clamp((S.t-t1)/1.4,0,1));return S.t>t1+1.4;},2);
    yield* wait(1.1);
    // up on the spike the lines in the severed arm still glow: the picture climbs the wall to it (with no blood there is no arm on it)
    if(P.arm){pitLookUp(P);yield* until(()=>S.t>=P.look.t0+P.look.dur,PIT.lookDur+1);yield* wait(2);}
    else yield* wait(.5);
    const t0=S.t;while(S.t<t0+1.8){S.fade=(S.t-t0)/1.8;yield;}S.fade=1;
    // (the prologue is over; a beat of black, and Act I opens on its own card)
    S.story.ended='fall';yield* wait(.8);},
  introSkip:null});
V11.step.push(pitStep);
{const co=collide;collide=function(f,final){co(f,final);if(S.pit&&S.pit.on)pitCollide(f,final);};}
// the arm comes back for every other fight; the Pit is only the fall's
V11.duelStart.push(()=>{for(const f of S.F){f.armOff=false;f.armTear=0;}if(S.arenaKey!=='fall')S.pit=null;});
{const sq=storyQuit;storyQuit=function(){sq();S.pit=null;for(const f of S.F){f.armOff=false;f.armTear=0;}};}
// a stage with no fight goes straight on from its scene
{const sf=storyFight;storyFight=function(list){const st=S.story&&STAGES[S.story.i];if(st&&st.noFight){letter(0);S.story.step='fight';S.hooks.story('fight');storyCleared();return;}sf(list);};}
V11.duelStart.push(()=>{S.thought=null;});

// the stages still to come close the prologue for now
// ===== STORY END =====
