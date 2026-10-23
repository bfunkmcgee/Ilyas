// ===== ACT I, SCENE 8 START =====
// The Yard at Night: the Sump's yard, that night. He cannot sleep. In the yard he flicks the hilt, and nine plates rattle out into the
// dirt. He looks up at the roof and calls the Glimmer step, and nothing comes. He picks the plates up one at a time with his only hand.
// Tamm comes out with two mugs of tea and sits on the step. No fail state: the player has the old inputs (Unroll, the Glimmer step),
// and each gives a short failed animation and a thought. Unroll is what spills the plates. Then Tamm talks.

// his thoughts, in order: one on each of the first two tries of the old ways, and the last when the ninth plate is in his hand (any
// not yet heard are heard then)
const NIGHT_THOUGHTS=['I’ve cut down elves who could break her in half.','Two of a slum lord’s errand boys.','Was any of it me? Or only the light?'];
// (the explore spec's own flag for the old ways' buttons: kept on S.ex for the page)
{const es=exStart;exStart=function(spec){es(spec);if(S.ex)S.ex.old=!!spec.old;};}
// the hilt held out and flicked: the motion that once unrolled the arc-blade
function flickAction(K){const a=K.arm;
  return{t0:S.t,end:1.2,body:[{t:0,v:()=>easyBody(K)},{t:.3,v:()=>({...easyBody(K),crouch:.92,lean:.1}),e:eOut},{t:.5,v:()=>({...easyBody(K),crouch:.9,lean:.22}),e:eOut},{t:1.2,v:()=>easyBody(K)}],
    arm:[{t:0,v:easyArm(K)},{t:.3,v:{hand:{sh:[.8*a,-.08*a]},wAng:-.5,off:{sh:[0,.9*a]},tilt:0},e:eOut},{t:.5,v:{hand:{sh:[.98*a,.16*a]},wAng:.5,off:{sh:[0,.9*a]},tilt:0},e:eOut},
      {t:.85,v:{hand:{sh:[.9*a,.12*a]},wAng:.4,off:{sh:[0,.9*a]},tilt:0}},{t:1.2,v:easyArm(K)}]};}
// the Glimmer step called: he looks up at the roof, gathers himself low, and the step that once took him up there does not come
function glimmerAction(K){const up=()=>({...easyBody(K),lean:-.2,crouch:.98});
  return{t0:S.t,end:1.6,body:[{t:0,v:()=>easyBody(K)},{t:.45,v:up,e:eOut},{t:.8,v:()=>({...easyBody(K),crouch:.74,lean:.14}),e:eOut},{t:1.05,v:()=>({...easyBody(K),crouch:1,lean:-.08}),e:eOut},{t:1.6,v:()=>easyBody(K)}],
    arm:[{t:0,v:easyArm(K)},{t:1.6,v:easyArm(K)}]};}
// the nine plates out of the hilt and into the dirt in front of him (never inside the yard's barrels, pump, trough or crates)
function nightSpill(N){const K=hero(),E=S.ex,Y=ACT1_PLACES.yard,b=E.bounds,R=mulberry32(808+N.flicks),h=K.p[HAF];
  const solid=(x,z)=>Y.barrels.some(o=>Math.hypot(x-o.x,z-o.d)<o.r+8)||Math.hypot(x-Y.pump.x,z-Y.pump.d)<Y.pump.r+8||
    (x>Y.trough.x0-8&&x<Y.trough.x1+8&&Math.abs(z-Y.trough.d)<14)||Y.crates.some(o=>Math.abs(x-o.x)<o.w/2+8&&Math.abs(z-o.d)<16);
  N.from={x:h.x,y:h.y,d:K.dep};
  for(let i=0;i<9;i++){let dx=K.facing*(14+R()*44)+(R()-.5)*16,dz=(R()-.5)*48,x,z,k=0;
    do{x=clamp(K.station+dx,b.x0+6,b.x1-6);z=clamp(K.lane+dz,b.z0+4,b.z1-4);dx*=.8;dz*=.8;k++;}while(solid(x,z)&&k<12);
    const p={x,z,a:R()*6.28,got:false,t0:S.t+i*.05};N.plates.push(p);
    E.spots.push({id:'plate'+i,label:'A plate',verb:'Pick up',x,z,at:{x,y:GB-4,d:z},once:true,used:0,when:()=>!p.got,
      *run(){const K=hero();K.action=stoopAction(K,.9,{crouch:.74,lean:.6});yield* wait(.55);p.got=true;N.picked++;S.hooks.sound('pin',.6);yield* wait(.35);K.action=null;
        // the ninth in his hand: what is left of his thoughts
        if(N.picked>=9)while(N.thought<NIGHT_THOUGHTS.length){yield* think(NIGHT_THOUGHTS[N.thought],{dur:3});N.thought++;}}});}
  N.spilled=true;}
// one of the old ways tried: its failed animation, then the next thought (the first two tries only)
function act1OldTry(kind){const A=S.act1,N=A&&A.night8;if(!N||!exOn()||S.cut||S.say)return false;const K=hero();exHalt(K);
  cutStart('old:'+kind,(function*(){
    if(kind==='unroll'){A.hilt='hand';N.flicks++;K.action=flickAction(K);yield* wait(.5);
      // out of a hilt with a blade in it, the plates; out of an empty one, nothing
      if(!N.spilled){nightSpill(N);S.hooks.sound('plates',1);}else N.flick={t0:S.t};
      yield* wait(.8);A.hilt='belt';}
    else{K.action=glimmerAction(K);yield* wait(.8);N.glimmer={t0:S.t};S.hooks.sound('fizzle',.7);yield* wait(.9);}
    K.action=null;N.tries++;if(N.thought<2){yield* think(NIGHT_THOUGHTS[N.thought],{dur:3});N.thought++;}})(),
    {then:()=>{if(exOn()){S.game.phase='explore';exGoalCheck();}}});return true;}

// Tamm, carrying the two mugs out: both hands in front of her at the waist
function mugsArm(f){const a=f.arm;return{hand:{sh:[.5*a,.52*a]},wAng:1.3,off:{sh:[.42*a,.56*a]},tilt:.1};}
// the step at the door (its slab runs from the stair gate to past the door; its front edge is 196 deep): the two of them sit on its
// edge, deeper than anyone stands in a fight
const NIGHT_SEAT={tamm:{x:149,z:193},kael:{x:201,z:193},mug:{x:175,z:201},zMax:232};
// seated on something `top` high: the hips come to rest just above it. How low a pose's crouch puts the hips depends on the body
// (a quick, skilled body's limbs hold its hips up more), so the crouch is found as he settles (f.seat.cr, eased each step here, read
// by the pose)
function seatBody(f,top){f.seat={top,cr:f.seat&&f.seat.top===top?f.seat.cr:.3};
  return()=>({px:f.station,pz:f.lane,crouch:f.seat?f.seat.cr:.3,lean:.12,stF:.28*f.leg,stB:.1*f.leg,th:.25});}
V11.step.push(()=>{for(const f of S.F){const st=f.seat;if(!st||f.action)continue;if(f.guardBody.seatOf!==st){continue;}
  const want=GB-st.top-9,err=want-f.p[PEL].y;st.cr=clamp(st.cr-err*.0016,0,.8);}});
function seatOn(f,top){const g=seatBody(f,top);g.seatOf=f.seat;f.guardBody=g;f.guardArm=()=>sitArm(f);}
STAGES.push({key:'night',act:1,num:'8',title:'The Yard at Night',sub:'The Sump’s yard, that night',arena:'yard',next:null,weapon:'fists',wear:'kit',foes:[],
  spawn:[[400,110]],
  setup(st){const K=hero(),Y=ACT1_PLACES.yard,A=act1State();S.fade=1;standEasy(K);K.station=400;K.lane=K.dep=K.stepDep=110;K.facing=-1;K.build();K.lurch=0;
    A.night=true;A.dusk=false;A.morning=false;A.stairGate=0;A.gate=0;A.bucket=null;A.hilt='belt';errandHome(A);
    A.night8={plates:[],tries:0,flicks:0,thought:0,picked:0,spilled:false,mugs:null,from:null,flick:null,glimmer:null};
    const T=act1Npc('Tamm',{x:Y.door.x,dep:Y.door.d-6,facing:-1});T.zMax=NIGHT_SEAT.zMax;T.hidden=true;A.tamm=T;},
  *intro(st){letter(1);camTo(380,760,0);yield* fadeTo(0,1.6);yield* wait(.6);letter(0);},
  explore(st){const Y=ACT1_PLACES.yard,A=act1State(),N=A.night8;
    return{area:'yard',bounds:{x0:Y.floor.x0,x1:Y.floor.x1,z0:Y.floor.z0,z1:Y.floor.z1},view:760,old:true,
      goal:{text:()=>!N.spilled?'Unroll the blade':N.picked<9?'Pick up the plates: '+N.picked+' of 9':'',done:()=>N.spilled&&N.picked>=9,
        hint:()=>N.tries<1?{touch:'The old ways are on the right: Unroll and Glimmer step.',keys:'The old ways: U to unroll the blade, G for the Glimmer step.'}:''},
      spots:[]};},
  *outro(st){const K=hero(),A=act1State(),N=A.night8,T=A.tamm,Se=NIGHT_SEAT;
    // Tamm comes out of the back door with two mugs of tea and sits on the step; he comes over and sits by her, and she gives him one
    yield* wait(.5);camTo(300,600,1.4);T.hidden=false;N.mugs='carry';T.guardArm=()=>mugsArm(T);S.hooks.sound('gate',.5);
    yield* goTo(T,Se.tamm.x,Se.tamm.z,38);T.facing=1;seatOn(T,ACT1_PLACES.yard.step.h);N.mugs='sat';yield* wait(1.1);
    K.zMax=Se.zMax;yield* goTo(K,Se.kael.x,Se.kael.z,52);K.facing=-1;seatOn(K,ACT1_PLACES.yard.step.h);yield* wait(1.2);
    yield* speak('Tamm','You’re thinking about the two on the stair.',{dur:2.6});
    yield* speak(HERO_NAME,'I’ve gone through better than them by the dozen.',{dur:2.8});
    yield* speak('Tamm','With two arms and a lamp in your skin. Half the Pit saw that arm glowing on the wall.',{dur:4});
    yield* speak(HERO_NAME,'Then you know what I was.',{dur:2.2});
    yield* speak('Tamm','I know what you are. One-handed and slow. Same as my grandfather when he came out of the Poisoned River.',{dur:4.6});
    yield* speak('Tamm','He ran a fish stall down here for forty years. Nobody robbed him twice.',{dur:3.6});
    yield* speak(HERO_NAME,'Teach me.',{dur:1.6});
    yield* speak('Tamm','Sun-up. Bring the knife.',{dur:2.2});
    yield* fadeTo(1,1.8);K.zMax=null;if(!st.next)S.story.ended='act1';}});
// on auto (the checks, a watched run): Unroll first, then the Glimmer step, then the plates
V11.step.push(()=>{const st=act1Stage(),E=S.ex;if(!st||st.key!=='night'||!E||!E.on||S.cut||E.to||S.say||!(S.storyAuto||S.auto))return;const N=S.act1.night8;
  if(N.tries<2&&S.t-E.t0>.8&&!hero().action)act1OldTry(N.tries?'glimmer':'unroll');});
{const ap=exAutoPick;exAutoPick=function(){const st=act1Stage();if(st&&st.key==='night'&&S.act1.night8.tries<2)return null;return ap();};}
// the chain: Tamm's fight on the stair goes on into that night
{const t7=STAGES[stageIx('tamm')];if(t7&&!t7.next)t7.next='night';}
// ===== ACT I, SCENE 8 END =====
