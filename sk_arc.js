// ===== ARC START =====
// Kael's Elven arc-blade: a curved blade of nine segments that rolls up inside its hilt. Unrolled and locked it fights as a
// light saber with its own moves, and for one stroke the segments can unlock and lash out past any normal reach.
WEAPONS.elven={key:'elven',name:'Elven arc-blade',short:'Arc-blade',len:58,butt:9,mass:1.05,off:null,dice:[2,6,10],acc:0,tempo:.95,fam:'blade',edge:true,curved:true,heroOnly:true};
GUARD.elven={hx:.5,hy:.4,w:-.72,gw:-.4,off:[.22,.52],crouch:.88,lean:.08,sf:.27,sb:-.3};
STUCK_WEAPON.elven=0;
LOOT_RANK.elven=3;LOOT_NAME.elven='arc-blade';
const ARC_SEGS=9;
// the lash: the segments unlock and the blade reaches past striking distance, without running in
const LASH={reach:150,acc:-1,dmg:.85,knock:.45};
function realWeapon(k){return REAL_WEAPONS.includes(k)||k==='elven';}
function lashGap(A,D){return Math.abs(A.station-D.station)-engageGap(A,D);}
function lashReady(A,D){
  if(!A||A.weaponKey!=='elven'||!D||D.dead||D.downed||A.clinch||A.downed||D.clinch)return false;
  const g=lashGap(A,D);if(g<=APPROACH_FREE||g>LASH.reach)return false;
  return!tableBetween(A,D)&&!(S.divs.length&&divBetween(A,D));}
// the stick between hand and tip grows while the chain is out, and shrinks back as it relocks
function lashStep(f){const L=f.lash;if(!L)return;const base=f.wp.len;
  if(f.dead||f.weaponKey!=='elven'||S.t-L.t0>L.d+.2){f.sticks[10][2]=base;f.lash=null;return;}
  const u=S.t-L.t0;let len=base;
  if(u>=L.a&&u<L.b)len=lerp(base,L.L,eOut((u-L.a)/Math.max(.01,L.b-L.a)));
  else if(u>=L.b&&u<L.c)len=L.L;
  else if(u>=L.c&&u<L.d)len=lerp(L.L,base,sstep((u-L.c)/Math.max(.01,L.d-L.c)));
  f.sticks[10][2]=len;f.lashLen=len;}

// ---------- readying weapons before a fight ----------
// Swords and daggers start in their scabbards with a hand on the hilt; a spear stands upright at its owner's side; a greataxe
// rests on the shoulder; the arc-blade is rolled up inside its hilt. Everyone gets their weapon out, then the first turn begins.
S.introOn=true;S.intro=null;S.hooks.intro=()=>{};
// the arc-blade is Kael's own weapon
S.cfg.hero.weapon='elven';
const SCAB={sword:{back:.84,down:.55,len:62},dagger:{back:.45,down:.89,len:31}};
function readyKind(f){const k=f.weaponKey;return k==='elven'?'unroll':k==='sword'||k==='dagger'?'draw':k==='spear'?'twirl':k==='axe'?'shoulder':null;}
// the scabbard: its mouth on the hip and the direction it hangs in, toward its tip
function scabFrame(f,k){const P=f.p[PEL],C=f.p[CHE],fa=f.facing,dx=C.x-P.x,dy=C.y-P.y,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,fx=-uy*fa,fy=ux*fa,s=SCAB[k||f.scab]||SCAB.sword;
  const mouth={x:P.x+ux*8+fx*5,y:P.y+uy*8+fy*5};let sx=-ux*s.down-fx*s.back,sy=-uy*s.down-fy*s.back;const n=Math.hypot(sx,sy)||1;sx/=n;sy/=n;
  return{mouth,sx,sy,len:s.len,ang:Math.atan2(sy,sx*fa)};}
// the hilt is gripped just above the mouth; pulled out by s along the scabbard's line
function hiltAt(f,s){const q=scabFrame(f);return{x:q.mouth.x-q.sx*(6+s),y:q.mouth.y-q.sy*(6+s)};}
// timings for each kind, in seconds from the fighter's own start
const READY={draw:{sword:{grip:.12,pull:.3,swing:.36},dagger:{grip:.08,pull:.16,swing:.24}},twirl:{lift:.2,spin:.62,set:.3},shoulder:{lift:.22,swing:.3,rise:.4},
  unroll:{raise:.32,unroll:.62,lock:.36,settle:.34}};
function readyAction(f,t0,ev){
  const kind=readyKind(f);if(!kind)return null;
  const a=f.arm,gA=()=>f.guardArm(),gB=()=>f.guardBody(),offR={sh:[.08*a,.46*a]},arm=[],body=[{t:0,v:gB}];let end=0;
  if(kind==='draw'){const R=READY.draw[f.weaponKey],k=f.weaponKey,len=f.wp.len+2,ang=scabFrame(f,k).ang;f.scab=k;
    const t1=R.grip,t2=t1+R.pull,t3=t2+R.swing;end=t3+.12;
    arm.push({t:0,v:{hand:{fn:()=>hiltAt(f,0)},wAng:ang,off:offR,tilt:0}},{t:t1,v:{hand:{fn:()=>hiltAt(f,0)},wAng:ang,off:offR,tilt:0}},
      {t:t2,v:{hand:{fn:()=>hiltAt(f,len)},wAng:ang,off:offR,tilt:.04},e:u=>u*u*(3-2*u)},{t:t3,v:gA,e:eOut},{t:end,v:gA});
    f.sheath={t0,out:t2};ev.push({t:t0+t1,fn:()=>S.hooks.sound('shing',k==='dagger'?.6:1)});}
  else if(kind==='twirl'){const R=READY.twirl,cx=.34*a,cy=-.1*a,Rr=.1*a,N=10,w0=-1.62;
    // the spin ends two full turns on from the guard angle, so settling into guard carries on the same way round
    const wEnd=GUARD.spear.w-2*TAU+.4,spin=w0-wEnd,gW=()=>{const G=f.guardArm();return{...G,wAng:G.wAng-2*TAU};};
    const rest={hand:{sh:[.28*a,.1*a]},wAng:-1.48,off:offR,tilt:0},t1=R.lift,t2=t1+R.spin,t3=t2+R.set;end=t3+.14;
    arm.push({t:0,v:rest},{t:.04,v:rest},{t:t1,v:{hand:{sh:[cx,cy]},wAng:w0,off:offR,tilt:0}});
    for(let i=1;i<=N;i++){const u=i/N,an=spin*u;arm.push({t:t1+R.spin*u,v:{hand:{sh:[cx+Math.sin(an)*Rr,cy-Math.cos(an)*Rr*.6]},wAng:w0-spin*u,off:offR,tilt:0},e:i===1?(x=>x*x):(x=>x)});}
    arm.push({t:t3,v:gW,e:eOut},{t:end,v:gW});
    body.push({t:t2,v:()=>({...f.guardBody(),crouch:f.guardBody().crouch+.02})},{t:t2+.12,v:()=>({...f.guardBody(),crouch:f.guardBody().crouch-.05})},{t:end,v:gB,e:sstep});
    ev.push({t:t0+t1+R.spin*.25,fn:()=>S.hooks.sound('swoosh',1.4)},{t:t0+t1+R.spin*.75,fn:()=>S.hooks.sound('swoosh',1.4)},
      {t:t0+t2+.12,fn:()=>{const q=f.p[FTF];dust(q.x,f.gr(q.x),.7,f.dep);S.hooks.sound('thud',160);}});}
  else if(kind==='shoulder'){const R=READY.shoulder,t1=R.lift,t2=t1+R.swing,t3=t2+R.rise;end=t3+.14;
    // the haft rests across the shoulder, held low at the chest, with the head hanging behind
    const rest={hand:{sh:[.3*a,.3*a]},wAng:-2.3,off:'grip',tilt:0};
    arm.push({t:0,v:rest},{t:.04,v:rest},{t:t1,v:{hand:{sh:[.12*a,-.3*a]},wAng:-2.95,off:'grip',tilt:-.05},e:eOut},
      {t:t2,v:{hand:{sh:[.6*a,.5*a]},wAng:1.05,off:'grip',tilt:.1},e:eIn},{t:t2+.1,v:{hand:{sh:[.6*a,.52*a]},wAng:1.12,off:'grip',tilt:.1}},{t:t3,v:gA,e:sstep},{t:end,v:gA});
    body.push({t:t1,v:()=>({...f.guardBody(),lean:f.guardBody().lean-.08})},{t:t2,v:()=>({...f.guardBody(),lean:f.guardBody().lean+.16,crouch:f.guardBody().crouch-.06})},{t:end,v:gB,e:sstep});
    ev.push({t:t0+t1+R.swing*.4,fn:()=>S.hooks.sound('swoosh',3.2)},
      {t:t0+t2,fn:()=>{const q=f.p[TIP];dust(q.x,f.gr(q.x),1,f.dep);S.shake=Math.max(S.shake,4);S.hooks.sound('thud',320);}});}
  else if(kind==='unroll'){const R=READY.unroll,t1=R.raise,t2=t1+R.unroll,t3=t2+R.lock,t4=t3+R.settle;end=t4+.1;
    const low={hand:{sh:[.2*a,.62*a]},wAng:1.32,off:offR,tilt:0},up={hand:{sh:[.5*a,.06*a]},wAng:-.28,off:{sh:[.16*a,.48*a]},tilt:.02};
    arm.push({t:0,v:low},{t:.04,v:low},{t:t1,v:up,e:eOut},{t:t2,v:{...up,hand:{sh:[.52*a,.04*a]}}},{t:t2+.06,v:{...up,hand:{sh:[.54*a,-.02*a]},wAng:-.36}},{t:t3,v:up},{t:t4,v:gA,e:sstep},{t:end,v:gA});
    f.arc={t0,unroll:[t1,t2],lock:[t2,t3]};
    ev.push({t:t0+t1,fn:()=>S.hooks.sound('unroll',1)},
      {t:t0+t2,fn:()=>{S.hooks.sound('lock',1);const h=f.p[HAF],t=f.p[TIP];flash({x:lerp(h.x,t.x,.5),y:lerp(h.y,t.y,.5)},30,'#8ff5e8',f.dep);}},
      {t:t0+t3-.04,fn:()=>{const t=f.p[TIP];flash(t,22,'#e6fffb',f.dep);sparks(t,10,'#8ff5e8',f.dep);if(!S.warming)S.punch={x:prjX(f.p[PEL].x,f.dep),t:0};}});}
  f.action={t0,end,body,arm};f.introUntil=t0+end;return end;}
// set everyone's readying going from start (absolute sim time); returns the intro record
function prepIntro(list,start){
  const ev=[];let last=start;const K=list.find(f=>f.idx===0);
  // enemies first, one after another, then the ally, and Kael's blade last
  const order=list.filter(f=>f.team===1).concat(list.filter(f=>f.team===0&&f.idx!==0),K?[K]:[]);
  order.forEach((f,i)=>{const d=f.idx===0?.34+.1*(order.length-1):f.team===1?.1+.2*i:.26;const e=readyAction(f,start+d,ev);if(e!=null)last=Math.max(last,start+d+e);});
  S.intro={start,end:last+.15,ev};return S.intro;}
function introStep(){const I=S.intro;if(!I)return;
  for(const e of I.ev)if(!e.done&&S.t>=e.t){e.done=true;e.fn();}
  if(S.t>=I.end){S.intro=null;for(const f of S.F){f.sheath=null;f.introUntil=0;}S.hooks.intro('end');
    if(S.game.phase==='intro'){S.game.phase='idle';startTurn(nextActor());}}}
// ===== ARC END =====
