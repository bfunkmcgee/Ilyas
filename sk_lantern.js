// ===== THE LANTERN'S SET PIECES START (since V103) =====
// Asked for in V103: set pieces in the Lantern Bistro's fights and on the way out of it. Each is a scene the story plays in the
// middle of a fight (between two turns, as the Tower Road's drums are: startTurn is wrapped, and the turn goes on afterwards to
// whoever's it is then) or at a stage's end. They are scripts like the story's own (sk_story.js) and use its pieces; what they leave
// in the world (a lamp felled, the tank broken, the floor awash) is the game's, here, and the page draws it (sk_lanternui.js and the
// painters in envx/).

// ---------- in a fight, between the turns ----------
// A stage's set piece plays when its turn comes: due(sv) says whether it is due now (each plays once a stage: sv.done[key]), and run()
// is the scene. The fight's turn order waits for it, and then goes on (or ends the fight, if the scene ended it).
const SET_PIECES=[];
function setPiece(o){SET_PIECES.push(o);}
{const stt=startTurn;startTurn=function(i){const sv=S.story;
  if(!sv||sv.step!=='fight'||S.cut||!S.F[0]||S.F[0].dead||!foes().length){stt(i);return;}
  const P=SET_PIECES.find(p=>p.stage===sv.key&&!(sv.pieces&&sv.pieces[p.key])&&p.due(sv));
  if(!P){stt(i);return;}
  (sv.pieces||(sv.pieces={}))[P.key]=true;
  const back=()=>{if(!S.story||S.story.step!=='fight')return;if(hero().dead){endFight(false);return;}if(!foes().length){storyCleared();return;}letter(0);camFree();stt(nextActor());};
  cutStart(sv.key+':'+P.key,P.run(sv),{then:back,skip:P.skip?()=>P.skip(sv):null});};}
// both on their feet and free, a weapon each in hand (a man on the floor, in a clinch or carried waits for the next turn)
function setPieceFree(...fs){return fs.every(f=>f&&!f.dead&&!f.downed&&!f.clinch&&!f.carry&&!f.npc&&!heldBy(f));}
// a fighter put down somewhere at once, his body and his footing with him (the skip's end state)
function shiftTo(f,x,z){const dx=x-f.station;for(const q of f.p){q.x+=dx;q.px+=dx;}if(f.scarf)for(const q of f.scarf){q.x+=dx;q.px+=dx;}
  for(const s of f.steps){s.active=false;s.plant={x:s.plant.x+dx,y:f.gr(s.plant.x+dx)-3};}
  f.station=x;f.lane=z;f.dep=f.stepDep=z;f.velX=0;f.action=null;}
// a scene's walk with a fighter's own fight stance kept (not standing easy): straight there, quickly
function* stepTo(f,x,z,v){yield* goTo(f,x,z,v||150,{direct:true});}
// a man the scene itself puts down: no blow of anyone's, so no exchange's kill (whatever exchange is on the books when it happens)
function sceneKill(V,s){const g=S.game,ex=g&&g.ex;if(g)g.ex=null;try{kill(V,s);}finally{if(g&&g.ex===null)g.ex=ex;}}

// ---------- Lamplight Street: the lock, and the lamp ----------
// Half way through Qadir (his health at half or less as a turn comes, the two of them on their feet with a weapon each), he comes in
// over the top with Last Orders and Ilyas takes it on the arc-blade: locked, face to face, by one of the street's lamps, they say a
// line each. Ilyas turns the axe and shoves him off; Qadir reaps low at his legs, Ilyas goes up over it, and the axe bites into the
// foot of the lamp post behind him. Qadir wrenches it out, and the post goes over, across the street toward us: the lantern bursts
// on the road and its light is gone. Nobody is hurt by it; the fight goes on from where they stand.
// The street's lamps (envx/env_street.js draws them: LAMPX and LAMPD there), and the felled one: S.lampCut is its x once the axe is
// in it (the painter draws its stump, and the page the rest of it), S.lampFall how it goes (when it starts to fall, which way).
const STREET_LAMPS=[60,290,520,750,980],STREET_LAMP_D=200;
// in the post's own drawing (before the street's scale, LAMP_K): where the axe bites above its foot, and the post's height
const LAMP_FELL={cut:24,top:150,k:1.4,fall:1.05,drop:.17};
S.lampCut=null;S.lampFall=null;
V11.duelStart.push(()=>{S.lampCut=null;S.lampFall=null;});
// the lamp to fight by: the nearest one with room on its far side for the two of them
function lockLamp(K,Q,s){let best=null,bd=1e9;
  for(const lx of STREET_LAMPS){const kx=lx+s*28,qx=kx+s*60;if(Math.min(kx,qx)<80||Math.max(kx,qx)>820)continue;
    const d=Math.abs(kx-K.station)+Math.abs(qx-Q.station);if(d<bd){bd=d;best=lx;}}
  return best;}
const LOCK_Z=188,LOCK_D=76;
setPiece({stage:'vargo',key:'lock',
  due(sv){const K=hero(),Q=S.F[1];return!!Q&&Q.name==='Qadir'&&!Q.dead&&Q.hp<=Q.maxHp/2&&setPieceFree(K,Q)&&K.weaponKey==='elven'&&Q.weaponKey==='axe'&&
    lockLamp(K,Q,Math.sign(Q.station-K.station)||1)!=null;},
  *run(sv){const K=hero(),Q=S.F[1],s=Math.sign(Q.station-K.station)||1,lx=lockLamp(K,Q,s),kx=lx+s*28,qx=kx+s*LOCK_D,z=LOCK_Z,a=K.arm,b=Q.arm;
    sv.lockLamp=lx;letter(1);
    for(const f of [K,Q]){f.guarding=false;f.counter=false;f.zMax=STREET_LAMP_D-4;}
    // (where each will stand when his pose has played: the fight's own stance takes him there after it)
    K.facing=s;Q.facing=-s;K.station=kx;K.lane=z;Q.station=qx;Q.lane=z-2;
    // close on the two of them, the lamp over them (an upright phone keeps the lantern and the flags at their feet)
    const cx=prjX(kx+s*30,z),top=flagsY(STREET_LAMP_D)-LAMP_FELL.top*LAMP_FELL.k-14,foot=flagsY(z)+26;
    bistroCam(cx,460,1.8,top,foot,300,top-20,foot+20);
    // Qadir comes in over the top with the axe; Ilyas meets it high on the blade, and they are locked, face to face
    const lockK=lockPose(K,kx,z,'k'),lockQ=lockPose(Q,qx,z-2,'q');
    Q.action={t0:S.t,end:.62,body:[{t:0,v:()=>Q.curBody||Q.guardBody()},{t:.32,v:{px:qx+s*14,pz:z-2,crouch:.97,lean:-.06,stF:.24*Q.leg,stB:-.3*Q.leg,th:.3}},{t:.62,v:lockQ.body,e:eIn}],
      arm:[{t:0,v:Q.curArm},{t:.32,v:{hand:{sh:[-.06*b,-.86*b]},wAng:-2.5,off:'grip',tilt:-.12},e:eOut},{t:.62,v:lockQ.arm,e:eIn}]};
    K.action={t0:S.t,end:.62,body:[{t:0,v:()=>K.curBody||K.guardBody()},{t:.42,v:{...lockK.body,crouch:.84}},{t:.62,v:lockK.body,e:sstep}],
      arm:[{t:0,v:K.curArm},{t:.42,v:{hand:{sh:[.3*a,-.5*a]},wAng:-1.05,off:{sh:[.3*a,-.18*a]},tilt:.06},e:eOut},{t:.62,v:lockK.arm,e:sstep}]};
    S.hooks.sound('swing',2,{s:'swing_heavy'});
    yield* wait(.6);
    {const p=lockPoint(K,Q);S.hooks.sound('clang',1.3,{s:'clang'});sparks(p,16,'#ffe2a8',z);flash(p,30,'#fff2d8',z);S.shake=Math.max(S.shake,5);S.freeze=Math.max(S.freeze,.05);}
    // locked: the two of them leaning into it while they talk, the steel grinding (a spark now and then)
    let talking=true;
    const hold=(function*(){let n=0;while(talking){const w=n%2?1:-1;n++;
        K.action=lockHold(K,lockK,w);Q.action=lockHold(Q,lockQ,-w);
        if(n%2===0){const p=lockPoint(K,Q);sparks(p,5,'#ffd890',z);S.hooks.sound('clang',.5,{s:'shing'});}
        yield* wait(.9);}})();
    const talk=(function*(){yield* wait(.4);
      yield* speak('Qadir','Thirty years I kept your table, Ilyas.',{dur:2.6});
      yield* speak(HERO_NAME,'Then you know I never leave without paying.',{dur:2.6});talking=false;})();
    yield* all(hold,talk);
    // he turns the axe off the blade and shoves Qadir back off it with the flat of his hand
    K.action={t0:S.t,end:.5,body:[{t:0,v:K.curBody},{t:.22,v:{...lockK.body,lean:.34,px:kx+s*6},e:eOut},{t:.5,v:{...lockK.body,lean:.08,crouch:.88},e:sstep}],
      arm:[{t:0,v:K.curArm},{t:.18,v:{hand:{sh:[.5*a,.1*a]},wAng:-.2,off:{sh:[.6*a,-.1*a]},tilt:.1},e:eOut},{t:.5,v:()=>K.guardArm(),e:sstep}]};
    Q.action={t0:S.t,end:.55,body:[{t:0,v:Q.curBody},{t:.25,v:{...lockQ.body,px:qx+s*30,lean:-.18,crouch:.92},e:eOut},{t:.55,v:{...lockQ.body,px:qx+s*34,lean:.05},e:sstep}],
      arm:[{t:0,v:Q.curArm},{t:.25,v:{hand:{sh:[.2*b,-.3*b]},wAng:-1.7,off:'grip',tilt:-.1},e:eOut},{t:.55,v:{hand:{sh:[.1*b,.2*b]},wAng:-.9,off:'grip',tilt:0},e:sstep}]};
    S.hooks.sound('clang',.7,{s:'shing'});Q.station=qx+s*34;
    yield* wait(.55);
    // he reaps low at his legs; Ilyas goes up over the axe, and it goes on into the foot of the lamp behind him
    const imp=.5,bite={x:lx,y:GB-KERB_H-LAMP_FELL.cut*LAMP_FELL.k,d:STREET_LAMP_D};
    Q.action={t0:S.t,end:1.15,body:[{t:0,v:Q.curBody},{t:.28,v:{px:qx+s*30,pz:z-2,crouch:.82,lean:-.1,stF:.2*Q.leg,stB:-.36*Q.leg,th:.3},e:eOut},
        {t:imp,v:{px:qx+s*14,pz:z-2,crouch:.7,lean:.42,stF:.36*Q.leg,stB:-.4*Q.leg,th:.36},e:eIn},{t:1.15,v:{px:qx+s*16,pz:z-2,crouch:.74,lean:.36,stF:.36*Q.leg,stB:-.4*Q.leg,th:.36}}],
      arm:[{t:0,v:Q.curArm},{t:.28,v:{hand:{sh:[-.42*b,.42*b]},wAng:2.7,off:'grip',tilt:-.05},e:eOut},
        {t:imp,v:{hand:{fn:()=>axeHand(Q,bite)},wAng:.62,off:'grip',tilt:.12},e:eIn},{t:1.15,v:{hand:{fn:()=>axeHand(Q,bite)},wAng:.62,off:'grip',tilt:.12}}]};
    K.action={t0:S.t,end:1.1,body:[{t:0,v:K.curBody},{t:imp-.2,v:{...lockK.body,px:kx-s*2,crouch:.72,lean:.1,lift:0},e:eOut},
        {t:imp-.02,v:{...lockK.body,px:kx-s*4,crouch:.86,lean:0,th:.95,lift:48},e:eOut},{t:imp+.22,v:{...lockK.body,px:kx-s*4,crouch:.86,lean:.05,th:.9,lift:30},e:sstep},
        {t:imp+.42,v:{...lockK.body,px:kx-s*4,crouch:.7,lean:.22,lift:0},e:eIn},{t:1.1,v:{...lockK.body,px:kx-s*4,crouch:.86,lean:.1,lift:0},e:sstep}],
      arm:[{t:0,v:K.curArm},{t:imp-.02,v:{hand:{sh:[.36*a,-.3*a]},wAng:-1.3,off:{sh:[-.3*a,-.3*a]},tilt:.04},e:eOut},{t:1.1,v:()=>K.guardArm(),e:sstep}]};
    S.hooks.sound('swing',2.4,{s:'swing_heavy',delay:.25});Q.station=qx+s*16;K.station=kx-s*4;
    yield* wait(imp);
    // in: the post rings, and stands a moment with the axe in it (its blade held there: S.lampFall.pin)
    S.lampCut=lx;S.lampFall={lx,s,t0:null,bite:S.t,hx:-s*.5,hd:-.866,pin:{i:Q.idx,x:bite.x,y:bite.y,d:bite.d}};
    S.hooks.sound('clang',1.4,{s:'thud_metal'});S.hooks.sound('clang',1,{s:'clang',delay:.03});
    {const p={x:bite.x,y:bite.y};sparks(p,22,'#ffe8b8',bite.d);flash(p,26,'#fff2d8',bite.d);}S.shake=Math.max(S.shake,7);S.freeze=Math.max(S.freeze,.07);
    yield* wait(.55);
    // he wrenches it out, and the post goes, slowly and then all at once
    Q.action={t0:S.t,end:.6,body:[{t:0,v:Q.curBody},{t:.24,v:{px:qx+s*26,pz:z-2,crouch:.84,lean:-.12,stF:.24*Q.leg,stB:-.34*Q.leg,th:.3},e:eOut},{t:.6,v:()=>Q.guardBody(),e:sstep}],
      arm:[{t:0,v:Q.curArm},{t:.24,v:{hand:{sh:[.1*b,.34*b]},wAng:-.3,off:'grip',tilt:-.08},e:eOut},{t:.6,v:()=>Q.guardArm(),e:sstep}]};
    S.hooks.sound('clang',.6,{s:'lamp_knock'});S.lampFall.pin=null;Q.station=qx+s*26;
    yield* wait(.18);
    S.lampFall.t0=S.t;lookAt(K,-s,LAMP_FELL.fall+1.2);
    // the camera goes back to see it come down across the street
    bistroCam(prjX(lx-s*30,(STREET_LAMP_D+60)/2),720,1.4,top,GB+16,440,top-20,GB+30);
    yield* wait(LAMP_FELL.fall+LAMP_FELL.drop);
    lampDown(S.lampFall);
    yield* wait(.9);
    // and back to it, where they stand (off the post's foot, onto the flags)
    for(const f of [K,Q])f.zMax=null;
    yield* all(stepTo(K,kx+s*8,160,120),stepTo(Q,clamp(kx+s*128,90,810),160,120));
    K.facing=s;Q.facing=-s;},
  skip(sv){const K=hero(),Q=S.F[1],s=Math.sign(Q.station-K.station)||1,lx=sv.lockLamp??lockLamp(K,Q,s);
    if(lx!=null){S.lampCut=lx;S.lampFall={lx,s,t0:S.t-9,bite:S.t-10,hx:-s*.5,hd:-.866,down:true};if(S.story)S.story.flags.lamp={lx,s};}
    for(const f of [K,Q]){f.zMax=null;f.action=null;}
    const kx=lx!=null?lx+s*24:K.station;shiftTo(K,kx,160);shiftTo(Q,clamp(kx+s*120,90,810),160);K.facing=s;Q.facing=-s;}});
// the lock: blade and axe crossed between their faces, each leaning in
function lockPose(f,x,z,who){const a=f.arm,leg=f.leg;
  return who==='k'?{body:{px:x,pz:z,crouch:.88,lean:.17,stF:.3*leg,stB:-.36*leg,th:.3},arm:{hand:{sh:[.46*a,-.06*a]},wAng:-1.32,off:{sh:[.36*a,.14*a]},tilt:.1}}
    :{body:{px:x,pz:z,crouch:.88,lean:.19,stF:.3*leg,stB:-.38*leg,th:.3},arm:{hand:{sh:[.42*a,-.08*a]},wAng:-1.2,off:'grip',tilt:.1}};}
// one breath of the lock: a push one way or the other
function lockHold(f,L,w){const fa=f.facing,B=L.body;
  return{t0:S.t,end:1,body:[{t:0,v:f.curBody||B},{t:.9,v:{...B,px:B.px+fa*w*3,lean:B.lean+w*.04,crouch:B.crouch-Math.abs(w)*.02},e:sstep},{t:1,v:{...B,px:B.px+fa*w*3,lean:B.lean+w*.04}}],
    arm:[{t:0,v:f.curArm||L.arm},{t:.9,v:{...L.arm,hand:{sh:[L.arm.hand.sh[0]+w*.02*f.arm,L.arm.hand.sh[1]-Math.abs(w)*.02*f.arm]}},e:sstep},{t:1,v:L.arm}]};}
// where the two weapons cross (between their hands, a little above)
function lockPoint(K,Q){const a=K.p[HAF],b=Q.p[HAF];return{x:(a.x+b.x)/2,y:Math.min(a.y,b.y)-14};}
// the axe's hand where its blade is at the post's foot (the axe as long as it is, at the angle of the reap): the post stands deeper
// than he does, so the point is put where it falls on the screen in his own depth
function axeHand(Q,bite){const w=WEAPONS[Q.weaponKey]||WEAPONS.axe,L=w.len*.92,wa=.62,dd=bite.d-Q.dep,tx=bite.x+dd*PSX,ty=bite.y-dd*PSY;
  return{x:tx-Q.facing*Math.cos(wa)*L,y:ty-Math.sin(wa)*L};}
// the axe held in the post while it is there: its blade where it bit (in the depth of the man who holds it), the haft and his hands
// follow it
V11.step.push(()=>{const F=S.lampFall,P=F&&F.pin,f=P&&S.F[P.i];if(!f||f.dead)return;const t=f.p[TIP],dd=P.d-f.dep,x=P.x+dd*PSX,y=P.y-dd*PSY;
  t.x=lerp(t.x,x,.75);t.y=lerp(t.y,y,.75);t.px=lerp(t.px,x,.75);t.py=lerp(t.py,y,.75);});
// the post on the ground: the lantern bursts on the road, the dust of it along the flags, the light gone (and the night keeps where it
// lies, for the street's last look: S.story.flags.lamp)
function lampDown(F){if(!F||F.down)return;F.down=true;F.downT=S.t;if(S.story)S.story.flags.lamp={lx:F.lx,s:F.s};const T=lampTop(F);S.hooks.sound('thud',220,{s:'lamp_fall'});S.hooks.sound('glass',.9,{s:'glass_small',delay:.05});
  S.shake=Math.max(S.shake,8);sparks({x:T.wx,y:T.y-4},18,'#ffd27a',T.d);flash({x:T.wx,y:T.y-6},34,'#ffe0a0',T.d);
  for(let i=0;i<=4;i++){const u=i/4,x=lerp(F.lx,T.wx,u),d=lerp(STREET_LAMP_D,T.d,u);dust(x,S.arena.ground(x,d),1.1,d);}}
// where the lantern comes down: the post's top, lying along the way it fell (world x, depth, and the ground there)
function lampTop(F){const L=(LAMP_FELL.top-LAMP_FELL.cut)*LAMP_FELL.k,wx=F.lx+F.hx*L,d=STREET_LAMP_D+F.hd*L;return{wx,d,y:S.arena.ground(wx,d)};}
// ---------- the kitchen: the cleaver on the block ----------
// Before Orrin goes down (once he is hurt, or by the fourth turn), with the prep table standing: he gets Ilyas's sword wrist and slams
// the forearm down across the butcher block, leans on it with his own sword hand, pulls the cleaver out of the block with the other
// and brings it down. Ilyas tears his arm free in the last instant and the cleaver bites into the wood where it lay. It is the arm the
// spike takes in the fall (the front arm, the arc-blade's: sk_story.js's fall takes ELF and HAF). The cleaver stays in the block where
// it bit (S.cleaver: in the block, where; or in Orrin's hand), the kitchen's painter draws it there, and the fight goes on.
S.cleaver=null;V11.duelStart.push(()=>{S.cleaver=null;});
// the block's top at x, and where a man's hand is put on it from his own depth
function blockTop(x){const T=S.table;return{x,y:tableTopAt(x),d:T.dep};}
function fromDepth(p,f){const dd=p.d-f.dep;return{x:p.x+dd*PSX,y:p.y-dd*PSY};}
setPiece({stage:'kitchen',key:'cleaver',
  due(sv){const K=hero(),O=S.F.find(f=>f.name==='Orrin');sv.turns=(sv.turns||0)+1;
    return!!O&&!O.dead&&tableIntact()&&setPieceFree(K,O)&&K.weaponKey==='elven'&&(O.hp<O.maxHp*.8||sv.turns>=4);},
  *run(sv){const K=hero(),O=S.F.find(f=>f.name==='Orrin'),T=S.table,B=tableBox(),a=K.arm,b=O.arm,
      // Ilyas at the end of the block nearer him, bent over it, his arm pulled out across it to Orrin at the other end (Orrin a
      // little nearer us, so his hand on the wrist is over it)
      e=K.station>B.cx?1:-1,kx=e>0?B.r+10:B.l-10,kz=T.dep-3,wx=e>0?B.l+26:B.r-26,ox=e>0?B.l-14:B.r+14,oz=T.dep-6,cx0=lerp(B.l,B.r,.62);
    letter(1);for(const f of [K,O]){f.guarding=false;f.counter=false;}
    K.facing=-e;O.facing=e;K.station=kx;K.lane=kz;O.station=ox;O.lane=oz;
    // close on the block (an upright phone keeps the two of them and the block's legs)
    const top=GB-T.dep*PSY-200,foot=GB-T.dep*PSY+34;camTo(prjX(B.cx,T.dep),420,1.8);Object.assign(S.camCut,{band:{top,foot},bandN:{top:top-30,foot:foot+30},wn:290});
    // he has the sword wrist: down across the block it goes, Ilyas bent over it
    const bend={px:kx,pz:kz,crouch:.66,lean:1.0,stF:.3*K.leg,stB:-.38*K.leg,th:.3},onBlock=()=>fromDepth({...blockTop(wx),y:tableTopAt(wx)-4},K),
      wristO=()=>{const h=K.p[HAF];return{x:h.x,y:h.y-6};},lean={px:ox,pz:oz,crouch:.74,lean:.7,stF:.26*O.leg,stB:-.34*O.leg,th:.3};
    K.action={t0:S.t,end:.55,body:[{t:0,v:()=>K.curBody||K.guardBody()},{t:.55,v:bend,e:eIn}],
      arm:[{t:0,v:K.curArm},{t:.3,v:{hand:{sh:[.6*a,.2*a]},wAng:-.4,off:{sh:[-.2*a,.5*a]},tilt:.2},e:eOut},{t:.55,v:{hand:{fn:onBlock},wAng:0,off:{sh:[-.3*a,.5*a]},tilt:.3},e:eIn}]};
    O.action={t0:S.t,end:.55,body:[{t:0,v:()=>O.curBody||O.guardBody()},{t:.55,v:lean,e:eIn}],
      arm:[{t:0,v:O.curArm},{t:.55,v:{hand:{sh:[.3*b,-.6*b]},wAng:-2.2,off:{fn:wristO},tilt:.15},e:eIn}]};
    S.hooks.sound('swing',1.6,{s:'swing_mid'});
    yield* wait(.55);
    S.hooks.sound('thud',200,{s:'thud_heavy'});S.shake=Math.max(S.shake,5);{const q=blockTop(wx);dust(q.x,q.y,.7,q.d,'rgba(236,226,206,.55)');}
    // his sword hand comes down on the wrist and leans on it; the other goes for the cleaver in the block and pulls it out
    const pinO=()=>{const h=K.p[HAF];return{x:h.x-e*2,y:h.y-5};},cleaverAt=()=>fromDepth({...blockTop(cx0),y:tableTopAt(cx0)-9},O);
    K.action=blockHold(K,bend,onBlock,30);
    O.action={t0:S.t,end:.6,body:[{t:0,v:O.curBody},{t:.6,v:{...lean,lean:.95,crouch:.66},e:sstep}],
      arm:[{t:0,v:O.curArm},{t:.25,v:{hand:{fn:pinO},wAng:-2.3,off:{fn:wristO},tilt:.2},e:eOut},{t:.6,v:{hand:{fn:pinO},wAng:-2.3,off:{fn:cleaverAt},tilt:.2},e:sstep}]};
    yield* wait(.65);
    S.cleaver={state:'hand',f:O.idx};S.hooks.sound('clang',.5,{s:'clang_light'});
    // up it goes over his head
    // (held there, however long the line is on the screen)
    O.action={t0:S.t,end:30,body:[{t:0,v:O.curBody},{t:.5,v:{...lean,lean:.5,crouch:.8},e:sstep},{t:30,v:{...lean,lean:.5,crouch:.8}}],
      arm:[{t:0,v:O.curArm},{t:.5,v:{hand:{fn:pinO},wAng:-2.3,off:{sh:[-.05*b,-.95*b]},tilt:-.05},e:eOut},{t:30,v:{hand:{fn:pinO},wAng:-2.3,off:{sh:[-.05*b,-.95*b]},tilt:-.05}}]};
    yield* wait(.45);
    yield* speak('Orrin','Hold still. One clean cut.',{dur:1.7});
    // down; the arm comes out from under it in the last instant, and the cleaver bites into the wood where it lay
    const bx=wx+e*12,bite=()=>fromDepth({...blockTop(bx),y:tableTopAt(bx)-7},O),imp=.2;
    O.action={t0:S.t,end:.7,body:[{t:0,v:O.curBody},{t:imp,v:{...lean,lean:.85,crouch:.7},e:eIn},{t:.7,v:{...lean,lean:.8,crouch:.72}}],
      arm:[{t:0,v:O.curArm},{t:imp,v:{hand:{sh:[.4*b,.2*b]},wAng:-2.0,off:{fn:bite},tilt:.25},e:eIn},{t:.7,v:{hand:{sh:[.4*b,.2*b]},wAng:-2.0,off:{fn:bite},tilt:.25}}]};
    K.action={t0:S.t,end:.95,body:[{t:0,v:K.curBody},{t:imp-.06,v:bend},
        {t:imp+.16,v:{px:kx+e*14,pz:kz,crouch:.88,lean:-.1,stF:.2*K.leg,stB:-.4*K.leg,th:.3},e:eOut},{t:.95,v:{px:kx+e*18,pz:kz,crouch:.86,lean:.08,stF:.26*K.leg,stB:-.36*K.leg,th:.3},e:sstep}],
      arm:[{t:0,v:K.curArm},{t:imp-.06,v:{hand:{fn:onBlock},wAng:0,off:{sh:[-.3*a,.5*a]},tilt:.3}},{t:imp+.12,v:{hand:{sh:[.1*a,.06*a]},wAng:-1.4,off:{sh:[-.1*a,.4*a]},tilt:-.05},e:eOut},
        {t:.95,v:()=>K.guardArm(),e:sstep}]};
    S.hooks.sound('swing',1.4,{s:'swing_heavy',delay:.05});
    yield* wait(imp);
    {const q=blockTop(bx);S.cleaver={state:'block',x:bx,deep:1,t0:S.t};S.hooks.sound('wood',1.5,{s:'thud_heavy'});S.hooks.sound('clang',.6,{s:'clang_light',delay:.02});
      S.shake=Math.max(S.shake,7);S.freeze=Math.max(S.freeze,.08);dust(q.x,q.y,.9,q.d,'rgba(236,226,206,.6)');sparks({x:q.x,y:q.y-3},8,'#e9c48a',q.d);}
    K.station=kx+e*18;lookAt(K,-e,1.2);
    yield* wait(.7);
    // he tugs at it once, and leaves it in the wood
    O.action={t0:S.t,end:.6,body:[{t:0,v:O.curBody},{t:.3,v:{...lean,lean:.4},e:eOut},{t:.6,v:{...lean,lean:.1,crouch:.9},e:sstep}],
      arm:[{t:0,v:O.curArm},{t:.3,v:{hand:{sh:[.36*b,.1*b]},wAng:-1.4,off:{fn:bite},tilt:.1},e:eOut},{t:.6,v:()=>O.guardArm(),e:sstep}]};
    yield* wait(.65);
    // and round the end of the block, they square up again
    yield* all(stepTo(K,clamp(kx+e*30,80,820),kz,110),stepTo(O,clamp(ox-e*10,80,820),oz,110));K.facing=-e;O.facing=e;},
  skip(sv){const K=hero(),O=S.F.find(f=>f.name==='Orrin');if(!O)return;const B=S.table&&tableIntact()?tableBox():null;
    if(B){const e=K.station>B.cx?1:-1,kx=e>0?B.r+10:B.l-10,ox=e>0?B.l-14:B.r+14;S.cleaver={state:'block',x:(e>0?B.l+26:B.r-26)+e*12,deep:1,t0:S.t-5};
      shiftTo(K,clamp(kx+e*30,80,820),S.table.dep-3);shiftTo(O,clamp(ox-e*10,80,820),S.table.dep-6);K.facing=-e;O.facing=e;}
    else S.cleaver=null;
    for(const f of [K,O])f.action=null;}});
// bent over the block with the forearm held down on it
function blockHold(K,bend,onBlock,dur){const a=K.arm;
  return{t0:S.t,end:dur,body:[{t:0,v:K.curBody},{t:.3,v:{...bend,lean:bend.lean+.04},e:sstep},{t:dur,v:bend,e:sstep}],
    arm:[{t:0,v:K.curArm},{t:.2,v:{hand:{fn:onBlock},wAng:0,off:{sh:[-.3*a,.5*a]},tilt:.3},e:sstep},{t:dur,v:{hand:{fn:onBlock},wAng:0,off:{sh:[-.3*a,.5*a]},tilt:.3}}]};}
// ---------- the dining room: the tank ----------
// The back wall has a floor-to-ceiling aquarium in it (envx/env_dining.js: TANK, between the kitchen door and the bar). It is the
// fight's scripted moment, in every dining room fight (since V109, asked for): at the third turn (or sooner, once only one of them is
// left) Ilyas picks the one to put through it, a crew man first or else whoever stands nearest it, and closes on him; if the man is
// not in front of the tank, Ilyas drives him back across the room to it, the blade beating on his guard all the way (round the
// screens and the table: the path a scene's walk takes); then he kicks him back into the glass: it stars round where he hit, the
// cracks run, the water starts through, and the front goes. The water comes out in one wall across the floor, everyone in the room is
// taken off his feet by it or near enough, and the fish go everywhere. The floor stays awash for the rest of the stage (S.flood): feet
// slide in it (a step comes down further than it was put), every strike costs a pip of balance more ('the wet floor'), and the fish
// flop about among the feet (drawn: sk_lanternui.js). A crew man thrown into the glass does not get up from it; an elf takes the blow
// and is washed back to his feet. (From V103 to V108 it waited for a man to be standing in front of the tank when a turn came, and a
// fight in three went by without it.)
const TANK_W={x0:556,x1:796,d:236};
S.tank=null;S.flood=null;
V11.duelStart.push(()=>{S.tank=null;S.flood=null;});
function wetFloor(f){return!!S.flood&&S.arenaKey==='restaurant'&&S.room==='dining'&&(!f||S.t>=S.flood.t0+(TANK_W.d-f.dep)/FLOOD_V);}
const FLOOD_V=280;
RULES.add({id:'lantern.wet',src:'Wet floor',on:'foot',label:'the wet floor',when:x=>wetFloor(x.A)&&['slash','thrust','overhead','sweep','shove'].includes(x.cmd),add:1});
// a foot put down on the wet boards goes on a little further than it was put
{const us=updateSteps;updateSteps=function(f,pelTX,bp){us(f,pelTX,bp);if(!S.flood||!wetFloor(f)||f.mount)return;
  for(const st of f.steps)if(st.active&&st.t0===S.t&&!st.slid){st.slid=true;const dir=Math.sign(st.to.x-st.from.x);if(dir)st.to={x:footClamp(f,st.to.x+dir*(6+3*Math.abs(Math.sin(S.t*7.3+f.idx))))};}};}
// how far a man stands from being in front of the tank (0 in front of it)
function tankGap(f){return Math.abs(f.station-clamp(f.station,TANK_W.x0+20,TANK_W.x1-20));}
// the one to put through the glass: a crew man first, then whoever stands nearest the tank
function tankVictim(){const fs=foes().filter(f=>setPieceFree(f));fs.sort((a,b)=>(b.hench?1:0)-(a.hench?1:0)||tankGap(a)-tankGap(b));return fs[0]||null;}
// where a man not in front of it is driven to: before the glass at the back of the floor (behind the glass partition's end, so it is
// never between them), and the pace he is driven at
const TANK_DRIVE={x0:TANK_W.x0+50,x1:TANK_W.x1-50,z:150,v:170};
function tankSpot(V){return{x:clamp(V.station,TANK_DRIVE.x0,TANK_DRIVE.x1),z:TANK_DRIVE.z};}
// the camera: the room from the front, the tank and the two of them (while he drives him to it, the desk's picture takes in the two
// of them as well as the tank and a phone's keeps to the two of them)
function tankCam(K,V,follow){camTo(prjX((TANK_W.x0+TANK_W.x1)/2,TANK_W.d)-30,820,1.6);Object.assign(S.camCut,{band:{top:20,foot:GB+10},bandN:{top:-20,foot:GB+30},wn:440});
  if(!follow)return;const xs=[prjX(K.station,K.lane),prjX(V.station,V.lane)],lo=Math.min(...xs,prjX(TANK_W.x0,TANK_W.d))-80,hi=Math.max(...xs,prjX(TANK_W.x1,TANK_W.d))+40;
  S.camCut.x=(lo+hi)/2;S.camCut.w=Math.max(820,hi-lo);S.camCut.xn=(xs[0]+xs[1])/2;}
// where the blade meets his guard: on his weapon a little out from his hand (in his own depth)
function guardOn(V){const h=V.p[HAF],t=V.p[TIP];return{x:lerp(h.x,t.x,.35),y:lerp(h.y,t.y,.35)};}
// one beat of the blade on the man's guard, the walk going on under it: up and back (or down and back), then in at his guard
function beatAction(K,V,hi){const a=K.arm,fa=K.facing,L=(WEAPONS[K.weaponKey]||WEAPONS.elven).len,wA=hi?.5:-.35;
  const hand=()=>{const p=guardOn(V),dd=V.dep-K.dep,x=p.x+dd*PSX,y=p.y-dd*PSY;return{x:x-fa*Math.cos(wA)*L*.72,y:y-Math.sin(wA)*L*.72};},live=o=>()=>({...K.guardBody(),...o});
  return{t0:S.t,end:.52,body:[{t:0,v:()=>K.curBody||K.guardBody()},{t:.14,v:live({lean:.02,crouch:.86}),e:eOut},{t:.22,v:live({lean:.28,crouch:.82}),e:eIn},{t:.52,v:()=>K.guardBody(),e:sstep}],
    arm:[{t:0,v:K.curArm},{t:.14,v:hi?{hand:{sh:[-.12*a,-.72*a]},wAng:-2.3,off:{sh:[.3*a,.22*a]},tilt:-.1}:{hand:{sh:[-.2*a,.1*a]},wAng:2.4,off:{sh:[.3*a,.22*a]},tilt:-.06},e:eOut},
      {t:.22,v:{hand:{fn:hand},wAng:wA,off:{sh:[-.2*a,.42*a]},tilt:.1},e:eIn},{t:.52,v:()=>K.guardArm(),e:sstep}]};}
// a blow taken on the guard: the hands driven in a little, the weight back
function guardTake(V){const b=V.arm,live=o=>()=>({...V.guardBody(),...o});
  return{t0:S.t,end:.42,body:[{t:0,v:()=>V.curBody||V.guardBody()},{t:.08,v:live({lean:-.22,crouch:.84}),e:eOut},{t:.42,v:()=>V.guardBody(),e:sstep}],
    arm:[{t:0,v:V.curArm},{t:.08,v:()=>{const g=V.guardArm(),sh=g.hand&&g.hand.sh;return sh?{...g,hand:{sh:[sh[0]-.1*b,sh[1]+.04*b]}}:g;},e:eOut},{t:.42,v:()=>V.guardArm(),e:sstep}]};}
// driven back to the tank: he gives ground round whatever stands in the way (walkPath: the screens, the table), his face to Ilyas
// and his guard up, and Ilyas comes on after him, the blade beating on his guard as they go
function* tankDrive(K,V,T,s){const pts=walkPath(V,T.x,T.z);let going=true;
  const back=(function*(){for(let i=1;i<pts.length;i++)yield* backTo(V,pts[i][0],pts[i][1],TANK_DRIVE.v,-s);going=false;})();
  const after=(function*(){yield* wait(.12);yield* goTo(K,T.x-s*58,clamp(T.z-6,DEP_MIN,DEP_MAX),TANK_DRIVE.v+10);})();
  const beats=(function*(){let n=0;yield* wait(.1);
    while(going){K.action=beatAction(K,V,n%2===0);n++;S.hooks.sound('swing',1.1,{s:'swing_mid'});yield* wait(.22);if(!going)break;
      V.action=guardTake(V);const p=guardOn(V);S.hooks.sound('clang',.8,{s:n%2?'clang':'shing'});sparks(p,10,'#ffe2a8',V.dep);flash(p,16,'#fff2d8',V.dep);S.shake=Math.max(S.shake,3);
      yield* wait(.32);}})();
  // (the camera with them; the others in the room turn to watch them go by, unless they are in the middle of something)
  const cam=(function*(){while(going){tankCam(K,V,true);
      for(const f of foes())if(f!==V&&!f.downed&&!f.action&&!f.clinch){const d=K.station-f.station;if(Math.abs(d)>30)f.facing=Math.sign(d);}yield;}})();
  yield* all(back,after,beats,cam);K.facing=s;V.facing=-s;}
setPiece({stage:'dining',key:'tank',
  due(sv){sv.dturns=(sv.dturns||0)+1;const K=hero();return(sv.dturns>=3||foes().length<2)&&setPieceFree(K)&&K.weaponKey==='elven'&&!!tankVictim();},
  *run(sv){const K=hero(),V=tankVictim(),a=K.arm,far=tankGap(V)>0,T=far?tankSpot(V):null,s=far?Math.sign(T.x-V.station)||1:Math.sign(V.station-K.station)||1;sv.tankBy=V.idx;
    // (where it all ends, for a skip: the man where the water leaves him, Ilyas where the kick leaves him)
    {const vx=far?T.x:V.station,vz=far?T.z:V.lane;sv.tankEnd={s,gx:clamp(vx+s*26,TANK_W.x0+34,TANK_W.x1-34),kx:vx-s*50,kz:clamp(vz-6,DEP_MIN,DEP_MAX)};}
    letter(1);for(const f of [K,V]){f.guarding=false;f.counter=false;}
    // the room from the front: the tank, and the two of them
    tankCam(K,V,far);
    // he closes on him, low and quick (round in front of him, or behind him at the front of the floor, when he would have to come
    // through him to stand on the far side of him from the tank)
    {const kx=V.station-s*58,kz=clamp(V.lane-6,DEP_MIN,DEP_MAX),round=far&&(K.station-V.station)*s>-20,run={crouch:.8,lean:.3,stF:.3*K.leg,stB:-.36*K.leg,th:.36};K.facing=s;V.facing=-s;
      const mz=V.lane>70?V.lane-52:Math.min(DEP_MAX,V.lane+52);
      K.action={t0:S.t,end:.36,body:[{t:0,v:()=>K.curBody||K.guardBody()},...(round?[{t:.2,v:{...run,px:V.station,pz:mz}}]:[]),{t:.36,v:{...run,px:kx,pz:kz},e:sstep}],
        arm:[{t:0,v:K.curArm},{t:.36,v:{hand:{sh:[.2*a,.3*a]},wAng:-.6,off:{sh:[.36*a,.2*a]},tilt:.1},e:sstep}]};K.blur=S.t+.4;S.hooks.sound('swoosh',1.4,{s:'vault'});
      yield* wait(.36);K.station=kx;K.lane=kz;}
    // not in front of it: back across the room to it he goes
    if(far){yield* tankDrive(K,V,T,s);tankCam(K,V,false);yield* wait(.1);}
    const kx=K.station,kz=K.lane;
    // the kick: the heel into his chest, and back he goes, off his feet, up into the glass
    const chest=()=>{const c=V.p[CHE];return{x:c.x,y:c.y+6};};
    K.action={t0:S.t,end:.7,body:[{t:0,v:K.curBody},{t:.16,v:{px:kx,pz:kz,crouch:.88,lean:-.18,stF:.1*K.leg,stB:-.3*K.leg,th:.6,kick:{fn:chest},kw:.4},e:eOut},
        {t:.26,v:{px:kx+s*6,pz:kz,crouch:.86,lean:-.3,stF:.1*K.leg,stB:-.32*K.leg,th:.6,kick:{fn:chest},kw:1},e:eIn},{t:.7,v:{px:kx+s*8,pz:kz,crouch:.86,lean:.06,stF:.24*K.leg,stB:-.34*K.leg,th:.3,kw:0},e:sstep}],
      arm:[{t:0,v:K.curArm},{t:.2,v:{hand:{sh:[-.3*a,.2*a]},wAng:-1.6,off:{sh:[.4*a,-.1*a]},tilt:-.1},e:eOut},{t:.7,v:()=>K.guardArm(),e:sstep}]};
    S.hooks.sound('swing',1.2,{s:'swing_mid'});
    yield* wait(.26);
    S.hooks.sound('hit',1,{s:'hit_blunt'});S.shake=Math.max(S.shake,6);flash(chest(),24,'#ffffff',V.dep);
    const gx=clamp(V.station+s*26,TANK_W.x0+34,TANK_W.x1-34),gz=TANK_W.d-12,b=V.arm;V.zMax=TANK_W.d-6;
    V.action={t0:S.t,end:1.2,body:[{t:0,v:()=>V.curBody||V.guardBody()},{t:.42,v:{px:gx,pz:gz,crouch:.86,lean:-.55,stF:.1*V.leg,stB:-.2*V.leg,th:.7,lift:46},e:eOut},
        {t:.5,v:{px:gx,pz:gz,crouch:.8,lean:-.35,stF:.1*V.leg,stB:-.2*V.leg,th:.6,lift:40}},{t:1.2,v:{px:gx,pz:gz,crouch:.5,lean:.3,stF:.2*V.leg,stB:-.2*V.leg,th:.4,lift:0},e:eIn}],
      arm:[{t:0,v:V.curArm},{t:.3,v:{hand:{sh:[.2*b,-.8*b]},wAng:-2.2,off:{sh:[-.3*b,-.7*b]},tilt:-.2},e:eOut},{t:1.2,v:{hand:{sh:[.3*b,.8*b]},wAng:1.4,off:{sh:[-.1*b,.9*b]},tilt:0},e:sstep}]};
    V.station=gx;V.lane=gz;S.hooks.sound('swoosh',2,{s:'swing_heavy'});
    yield* wait(.42);
    // the glass stars round him
    {const c=V.p[CHE];S.tank={state:'cracked',hit:{x:c.x+V.dep*PSX,y:c.y-V.dep*PSY},crackT:S.t,seed:(S.rng()*1e9)|0};
      S.hooks.sound('glass',.9,{s:'glass_small'});S.hooks.sound('crack',1,{s:'crack',delay:.02});S.shake=Math.max(S.shake,9);S.freeze=Math.max(S.freeze,.09);
      sparks(c,10,'#e8fff0',V.dep);}
    if(V.hench){V.hp=0;sceneKill(V,s);}else{const d=12;V.hp=Math.max(1,V.hp-d);popup(V,String(d),'#ffffff','Through the glass',24);logNote(V,'Kicked into the tank','−'+d);}
    S.hooks.status();
    lookAt(K,s,1.6);
    // a moment: the cracks run, the water starts through, the glass creaks
    yield* wait(.5);S.hooks.sound('crack',.6,{s:'crack'});
    yield* wait(.55);
    // and it goes
    S.tank.state='burst';S.tank.burstT=S.t;S.flood={t0:S.t};
    S.hooks.sound('glass',1.6,{s:'glass_large'});S.hooks.sound('plaster',1.4,{s:'table_break',delay:.05});S.shake=Math.max(S.shake,14);S.freeze=Math.max(S.freeze,.06);
    // the water takes everyone off his feet or near it as it comes past him (the man in the glass with it)
    const hitAt=f=>S.flood.t0+(TANK_W.d-f.dep)/FLOOD_V;
    const wash=(function*(){const done=new Set();while(done.size<S.F.length&&S.t<S.flood.t0+1.6){for(const f of S.F){if(done.has(f)||S.t<hitAt(f))continue;done.add(f);if(f.dead||f.offstage||f.mount)continue;
        f.action=slipAction(f,f===V?Math.max(DEP_MIN,f.lane-70):clamp(f.lane-14,DEP_MIN,DEP_MAX));if(f===V||f.lane>DEP_MAX)f.lane=clamp(f===V?f.lane-70:f.lane-14,DEP_MIN,DEP_MAX);
        dust(f.p[FTF].x,f.gr(f.p[FTF].x),1,f.dep,'rgba(200,232,214,.6)');}yield;}})();
    yield* all(wash,wait(1.9));
    V.zMax=null;for(const f of S.F)if(!f.dead&&f.lane>DEP_MAX)f.lane=DEP_MAX-6;
    // (each of them on the side of him he now stands on: the fight keeps a man to his side of Ilyas, and the drive may have taken
    // Ilyas round him)
    resyncSides();},
  skip(sv){const V=S.F[sv.tankBy],K=hero(),E=sv.tankEnd;S.tank={state:'burst',hit:null,crackT:S.t-5,burstT:S.t-5,seed:1};S.flood={t0:S.t-5};
    // (no walk of the scene's left going: it may have been skipped half way across the room)
    for(const f of S.F){f.action=null;f.cutWalk=false;f.walkV=null;f.walkEnd=null;}
    // the two of them where it leaves them: the man in front of the broken tank, Ilyas where he kicked him from
    if(E){if(V&&!V.dead)shiftTo(V,E.gx,DEP_MAX-14);if(K&&!K.dead)shiftTo(K,E.kx,clamp(E.kz-14,DEP_MIN,DEP_MAX));if(K)K.facing=E.s;if(V&&!V.dead)V.facing=-E.s;}
    if(V){V.zMax=null;if(V.hench&&!V.dead){V.hp=0;sceneKill(V,E?E.s:1);}}for(const f of S.F){if(!f.dead&&f.lane>DEP_MAX){f.lane=DEP_MAX-6;}}resyncSides();}});
// taken off his feet by the water, or near enough: back on his heels, arms flung out, sliding with it, and down onto a knee or up
function slipAction(f,z){const a=f.arm,leg=f.leg,x=f.station,z0=f.lane,fa=f.facing,back=Math.sign(z-z0)||-1,r=S.rng();
  return{t0:S.t,end:1.1,body:[{t:0,v:()=>f.curBody||f.guardBody()},{t:.18,v:{px:x-fa*6,pz:lerp(z0,z,.5),crouch:.86,lean:-.32,stF:.36*leg,stB:-.2*leg,th:.4},e:eOut},
      {t:.5,v:{px:x-fa*10,pz:z,crouch:r<.5?.62:.78,lean:.3,stF:.38*leg,stB:-.42*leg,th:.4},e:sstep},{t:1.1,v:()=>({...f.guardBody(),px:x-fa*10,pz:z}),e:sstep}],
    arm:[{t:0,v:f.curArm||f.guardArm()},{t:.18,v:{hand:{sh:[.5*a,-.6*a]},wAng:-1.8,off:{sh:[-.5*a,-.5*a]},tilt:-.1},e:eOut},{t:.5,v:{hand:{sh:[.6*a,.1*a]},wAng:-.2,off:{sh:[-.4*a,.4*a]},tilt:.05},e:sstep},{t:1.1,v:()=>f.guardArm(),e:sstep}]};}
// ---------- the way out of the kitchen: the gas line, the shaft, the Lantern going up (since V104) ----------
// Asked for in V104: leaving the kitchen, Ilyas cuts the gas line; as the lift drops a spark from the arc-blade sets it off; the
// Lantern goes up, and a fireball chases the lift down the shaft. The kitchen's closing scene (kitchenExit, below): the wall opens on the
// lift, and on his way to it he stops at the range and cuts through the iron pipe that brings the gas down the wall to it (the burners
// go out, and the gas hisses out into the room: S.gas), walks into the lift and turns in it, and the doors close on him with the blade
// still out. Then three short scenes of the kitchen's (part:'kitchen', no card of their own), each a hard cut: the shaft (the car going
// down, the gas come down after it; he rolls the blade up and at its last turn it arcs into the steel of the roof, and the sparks go
// up through the roof's vent into the gas; it catches, and goes away up the shaft in a sheet of flame), the street (the Lantern goes
// up: every window blown out and fire out of all of them, a fireball up through the roof), the shaft again (the fireball coming down
// after the car, a pan off the range ahead of it; the car brakes at the foot with the fire a few feet over its roof). The platform's
// own scene then begins with the doors opening at the foot, and he walks out as the fire comes out of the lift behind him.
// The gas line: where it comes down the kitchen's back wall to the range (world x, the height of the cut, the wall's depth), and
// where he stands to cut it
const GAS={x:654,h:34,d:236,sx:598,sz:180};
S.gas=null;V11.duelStart.push(()=>{S.gas=null;});
// the cut, in a man's own depth: where the blade has to pass for it to go through the pipe on the wall
function gasPoint(f){return fromDepth({x:GAS.x,y:GB-GAS.h,d:GAS.d},f);}
// the cut: the blade up and back over his shoulder, then across and down through the pipe, and on
function gasCut(K,P){const a=K.arm,fa=K.facing,L=(WEAPONS[K.weaponKey]||WEAPONS.elven).len,wA=.18,hand={x:P.x-fa*Math.cos(wA)*L*.8,y:P.y-Math.sin(wA)*L*.8},x=K.station,z=K.lane,leg=K.leg;
  return{t0:S.t,end:.95,body:[{t:0,v:()=>K.curBody||K.guardBody()},{t:.28,v:{px:x-fa*4,pz:z,crouch:.88,lean:.04,stF:.28*leg,stB:-.36*leg,th:.3},e:eOut},
      {t:.36,v:{px:x+fa*6,pz:z,crouch:.82,lean:.28,stF:.34*leg,stB:-.4*leg,th:.34},e:eIn},{t:.95,v:{px:x+fa*4,pz:z,crouch:.88,lean:.1,stF:.28*leg,stB:-.36*leg,th:.3},e:sstep}],
    arm:[{t:0,v:K.curArm},{t:.28,v:{hand:{sh:[-.12*a,-.72*a]},wAng:-2.3,off:{sh:[.3*a,.22*a]},tilt:-.1},e:eOut},
      {t:.36,v:{hand:{w:hand},wAng:wA,off:{sh:[-.2*a,.42*a]},tilt:.1},e:eIn},{t:.62,v:{hand:{sh:[.48*a,.52*a]},wAng:1.15,off:{sh:[-.2*a,.42*a]},tilt:.1},e:eOut},
      {t:.95,v:{hand:{sh:[.36*a,.46*a]},wAng:.9,off:{sh:[-.1*a,.5*a]},tilt:.05},e:sstep}]};}
// (the lift's doors close behind him in the time the page closes them: SECRET_T.shut, sk_secret.js; the lift's opening on the screen)
function liftOpening(){const far=KITCHEN.far,A=SECRET_ART,cx=SECRET_DOOR.x+far*PSX,yB=GB-far*PSY;return{cx,hw:A.w/2,top:yB-A.h,yB};}
function* kitchenExit(st){const K=hero();letter(1);K.guarding=false;K.counter=false;
  // (the blade stays out: there is one more use for it)
  // (the camera takes in him, the range and the wall the lift is in, up to the lift's head)
  const at=x=>prjX(x,GAS.sz),O0=liftOpening(),band={top:O0.top-36,foot:GB+30},bandN={top:O0.top-60,foot:GB+50},kx0=Math.min(K.station,560);
  camTo((at(kx0)+O0.cx)/2+20,Math.max(640,O0.cx-at(kx0)+260),1.3);Object.assign(S.camCut,{band,bandN,xn:at(660),wn:330});
  yield* wait(.4);
  // a click in the wall: the family's own way down (the reveal is the lab's back room's, which the story's kitchen does not count as
  // on: it is let on for the moment it starts)
  const bk=S.backroom;S.backroom=true;S.deep=true;const step=revealStart(null);S.backroom=bk;S.deep=false;
  if(step)yield* until(()=>step(),5);
  // on his way to it, the range: he stops where the gas comes down the wall to it and cuts the pipe through
  K.zMax=GAS.sz+6;yield* stepTo(K,GAS.sx,GAS.sz,110);K.facing=1;K.station=GAS.sx;K.lane=GAS.sz;
  K.action=gasCut(K,gasPoint(K));S.hooks.sound('swing',1.5,{s:'swing_mid',delay:.2});
  yield* wait(.36);
  S.gas={cut:S.t};S.hooks.sound('shing',.8,{s:'shing'});S.hooks.sound('hiss',1);
  yield* wait(.6);
  // the burners going out under the pans, the gas loose in the room; a look, and on
  yield* wait(.7);
  camTo(at(SECRET_DOOR.x)-20,560,1.4);Object.assign(S.camCut,{band,bandN,xn:prjX(SECRET_DOOR.x,200),wn:320});
  yield* stepTo(K,SECRET_DOOR.x,SECRET_DOOR.slots[0][1],100);
  // into the lift (once he is through its doorway he shows only inside it), and round to face the room, the blade still out and
  // down at his side
  const O=liftOpening(),a=K.arm,clipAll={x0:O.cx-O.hw,x1:O.cx+O.hw,y0:O.top,y1:O.yB+2};K.zMax=GAS.d+12;K.guardArm=()=>bladeDown(K);
  let inside=false;yield* all((function*(){yield* stepTo(K,SECRET_DOOR.x,GAS.d+2,80);inside=true;})(),(function*(){while(!inside){if(K.dep>GAS.d-3)K.clipRect=clipAll;yield;}})());
  // (just inside the doors, his head bowed a little under the car's low roof)
  K.clipRect=clipAll;K.facing=-1;K.station=SECRET_DOOR.x;K.lane=GAS.d+2;K.guardBody=()=>({...easyBody(K),crouch:.9,lean:.1});void a;
  yield* wait(.5);
  // the doors close on him (he shows only in the gap left between them)
  const sh=S.t;if(S.secret)S.secret.shut=sh;S.hooks.sound('lift_doors',1,{take:1});
  yield* until(()=>{const o=1-sstep((S.t-sh)/SECRET_T.shut);K.clipRect={x0:O.cx-O.hw*o,x1:O.cx+O.hw*o,y0:O.top,y1:O.yB+2};return o<=0;},2);
  K.hidden=true;K.clipRect=null;
  yield* wait(.45);}
// the arc-blade out and held down at his side, its point clear of the floor (in the lift, and in the car going down)
function bladeDown(K){const a=K.arm;return{hand:{sh:[.18*a,.6*a]},wAng:1.45,off:{sh:[-.06*a,.94*a]},tilt:0};}
function kitchenExitSkip(st){const K=hero();S.gas=S.gas||{cut:S.t-5};K.clipRect=null;K.hidden=true;K.zMax=null;}

// ---------- the shaft ----------
// envx/env_shaft.js draws it: the car's middle and the depth he stands at in it, the landings (their heights from the top), the run
// from the kitchen to the line
const SHAFT={cx:450,dep:68,lands:[0,230,460,1400],run:1400,vmax:240};
storyArena('shaft',{label:'Shaft',name:'The lift shaft',ground:()=>GB,wall:null,far:152});
// the run: y how far the car has come down, v and acc; the fireball's front over the roof (ball: from, to, over dur from t0)
S.shaft=null;V11.duelStart.push(()=>{S.shaft=null;});
function shaftNew(o){return Object.assign({y:0,v:0,acc:0,vmax:SHAFT.vmax,gas:0,spark:null,lit:null,ball:null,ballH:null,pan:null,brake:null,brakeDur:0},o);}
V11.step.push(()=>{const s=S.shaft;if(!s)return;s.v=clamp(s.v+s.acc*DT,0,s.vmax);s.y=Math.min(SHAFT.run,s.y+s.v*DT);if(s.y>=SHAFT.run)s.v=0;
  if(s.ball){const u=clamp((S.t-s.ball.t0)/s.ball.dur,0,1);s.ballH=S.t<s.ball.t0?null:lerp(s.ball.from,s.ball.to,1-Math.pow(1-u,1.7));}});
// the scenes between the stages: he is where the last left him, his strength as it was (no rest between them: the platform's stage
// gives him his breath back, as it did when it came straight after the kitchen)
function sceneKeep(K){const SV=S.story;if(SV&&SV.hp!=null)K.hp=Math.min(K.maxHp,SV.hp);}
// the camera in the shaft: the car and the shaft over it (an upright phone has height to spare: more of the shaft)
function shaftCam(){const x=prjX(SHAFT.cx,SHAFT.dep)+2;camTo(x,712,0);Object.assign(S.camCut,{band:{top:GB-300,foot:GB+16},bandN:{top:GB-470,foot:GB+40},xn:x,wn:330});}
// the blade brought up before him, upright, and rolled back into its hilt (the car is too narrow for the scene's own roll-up)
function shaftRoll(K){const a=K.arm,up={hand:{sh:[.3*a,-.06*a]},wAng:-1.38,off:{sh:[.12*a,.34*a]},tilt:.02},low=easyArm(K),g=K.curArm||K.guardArm();
  K.arcRev={t0:S.t+.32,dur:.5};
  // (quiet: no trail, the blade's sweep would go out through the car's sides)
  return{t0:S.t,end:1.4,quiet:true,body:[{t:0,v:()=>K.guardBody()}],arm:[{t:0,v:g},{t:.3,v:up,e:sstep},{t:.95,v:up},{t:1.35,v:low,e:sstep},{t:1.4,v:low}]};}
// his head back, looking up the shaft
function shaftLookUp(K,dur){const leg=K.leg,x=K.station,z=K.lane;
  return{t0:S.t,end:dur,body:[{t:0,v:()=>K.curBody||K.guardBody()},{t:.35,v:{px:x,pz:z,crouch:.96,lean:-.14,stF:.16*leg,stB:-.2*leg,th:.2},e:sstep},{t:dur,v:{px:x,pz:z,crouch:.96,lean:-.14,stF:.16*leg,stB:-.2*leg,th:.2}}],
    arm:[{t:0,v:()=>K.curArm||K.guardArm()},{t:dur,v:()=>K.guardArm()}]};}
function shaftHero(K){sceneKeep(K);standEasy(K);if(!K.stow)K.guardArm=()=>bladeDown(K);K.facing=-1;K.station=SHAFT.cx;K.lane=K.dep=K.stepDep=SHAFT.dep;K.zMax=SHAFT.dep+2;K.offstage=true;K.build();}
STAGES.splice(stageIx('kitchen')+1,0,
  {key:'shaft',num:'',title:'',sub:'',part:'kitchen',arena:'shaft',next:'lanternup',noFight:true,cardDur:0,foes:[],spawn:[[SHAFT.cx,SHAFT.dep]],
    setup(st){const K=hero();shaftHero(K);S.shaft=shaftNew({gas:1});},
    *intro(st){const K=hero(),s=S.shaft;letter(1);shaftCam();
      // the car at the kitchen's landing, the gas come in round its doors after it and hanging in the shaft over it
      yield* wait(.5);
      // it drops: a jolt, the motor, the shaft going up past the car faster and faster
      s.acc=SHAFT.vmax/1.1;S.hooks.sound('lift',1);S.shake=Math.max(S.shake,3);
      yield* wait(1);
      // he brings the blade up before him and lets it roll back into its hilt
      K.action=shaftRoll(K);
      yield* wait(.78);
      // at its last turn it arcs into the steel of the roof, and the sparks go up through the vent into the gas
      s.spark=S.t;S.hooks.sound('crackle',1);flash({x:K.p[TIP].x,y:K.p[TIP].y},18,'#d8f6ff',K.dep);
      yield* wait(.36);
      // the gas over the car catches, and the flame goes away up the shaft
      s.lit=S.t;s.gas=0;S.hooks.sound('whump',1);S.shake=Math.max(S.shake,7);S.freeze=Math.max(S.freeze,.05);
      yield* wait(.3);stowBlade(K);K.guardArm=()=>easyArm(K);
      K.action=shaftLookUp(K,2);
      yield* wait(1.6);},
    introSkip(st){stowBlade(hero());}},
  {key:'lanternup',num:'',title:'',sub:'',part:'kitchen',arena:'street',next:'shaftfire',noFight:true,cardDur:0,foes:[],spawn:[[-420,120]],
    setup(st){const K=hero();sceneKeep(K);standEasy(K);stowBlade(K);K.station=-420;K.lane=K.dep=120;K.hidden=true;K.offstage=true;K.build();
      // the street as he left it: the bistro's front blown in, the lamp down across it if it went
      const L=S.story.flags.lamp;if(L){S.lampCut=L.lx;S.lampFall={lx:L.lx,s:L.s,t0:S.t-9,bite:S.t-10,hx:-L.s*.5,hd:-.866,down:true};}
      S.lanternUp=null;},
    *intro(st){letter(1);const D=bistroDoor(),x=prjX(D.x,D.dep);camTo(x+48,820,0);Object.assign(S.camCut,{band:{top:-150,foot:220},bandN:{top:-260,foot:GB+24},xn:x+6,wn:420});
      yield* wait(.5);
      // a deep knock in the house, the windows brightening
      S.hooks.sound('rumble',1);S.shake=Math.max(S.shake,2.5);S.lanternUp={t0:S.t+.42};
      yield* wait(.42);
      // and it goes up
      lanternUp();
      yield* wait(2.8);},
    introSkip(st){}},
  {key:'shaftfire',num:'',title:'',sub:'',part:'kitchen',arena:'shaft',next:'platform',noFight:true,cardDur:0,foes:[],spawn:[[SHAFT.cx,SHAFT.dep]],
    setup(st){const K=hero();stowBlade(K);shaftHero(K);S.shaft=shaftNew({y:SHAFT.run-560});},
    *intro(st){const K=hero(),s=S.shaft;letter(1);shaftCam();
      // (going down at full speed from the cut, the fire on its way: set here, not in setup, which the bodies' settling runs past)
      s.v=SHAFT.vmax;s.ball={t0:S.t+.2,from:560,to:12,dur:2.9};
      // the shaft over the car lit from far up, and a roar coming down it
      S.hooks.sound('roar',1);K.action=shaftLookUp(K,4);
      yield* wait(.55);
      // a pan off the range, come down ahead of the fire, onto the roof
      s.pan=S.t;yield* wait(.75);S.hooks.sound('clang',.8,{s:'clang_light'});S.shake=Math.max(S.shake,2);
      // the foot of the shaft: the brakes
      yield* wait(.2);s.acc=-SHAFT.vmax/1.4;s.brake=S.t;s.brakeDur=1.5;S.hooks.sound('brake',1);
      yield* until(()=>s.v<=0,2.2);
      // (the cut comes as the fire reaches the roof)
      yield* until(()=>s.ballH!=null&&s.ballH<24,1.2);},
    introSkip(st){}});
// the Lantern going up: the windows' light flaring, then every window and the door blown out with fire, a fireball up through the
// roof (envx/env_street.js draws the front: S.lanternUp; the openings are its own); a blast down the street, glass and slates in it.
function bistroOpenings(){const L=typeof EnvLook!=='undefined'&&EnvLook.S&&EnvLook.S.street;return L&&L.openings?L.openings():[{x:120,y:250,w:60,h:90,kind:'win'},{x:236,y:270,w:60,h:110,kind:'door'},{x:350,y:250,w:60,h:90,kind:'win'}];}
function lanternUp(){const D=bistroDoor(),O=bistroOpenings(),t=S.t;S.lanternUp={t0:t,go:t};
  // (the ground floor's blast is the street's painter's own, in the Lantern going up: S.lanternUp)
  S.shake=Math.max(S.shake,22);S.freeze=Math.max(S.freeze,.08);if(!S.warming)S.punch={x:prjX(D.x,D.dep),t:0};
  S.hooks.sound('boom',2,{kind:'fuel'});S.hooks.sound('glass',1.6,{s:'glass_large',delay:.08});S.hooks.sound('rattle',1,{delay:.3});
  // the fireball out through the roof (the blast out of the door is the ground floor's, the street's painter's; a second fireball
  // there, until V104's review, cost the phone's frame a quarter again and left a flat cloud over the door)
  const R=O.find(o=>o.kind==='roof');if(R)S.booms.push({x:R.x,y:R.y,dep:R.dep,t0:t+.05,size:2.3,seed:4401,kind:'fuel'});
  // and the fire left burning in the two windows and the doorway below (upstairs the rooms burn behind their empty frames: the street's
  // painter's)
  O.forEach((o,i)=>{if(o.kind==='roof'||o.kind==='up')return;S.fires.push({x:o.x,y:o.y,dep:o.dep,w:o.w,h:o.h,seed:31+i*7,k:o.kind==='door'?1:.85});});}
// ===== THE LANTERN'S SET PIECES END =====
