// ===== STYLE START =====
// Kael's tactical style: economy of motion in the procedural animation. Short windups, a small follow-through, a quick return to a
// tight guard and a glance round the room after every kill. It is animation only: dice, damage, tempo, footing and the AI never
// read anything in here. Everyone else keeps the regular, bigger motion.
const TACTICAL={
  on:true,
  // multipliers on the regular planAttack numbers; "regular" is what every other fighter gets (all 1, tail .42 s)
  //   amp: windup size (hand travel back and up)   cock: how far the blade is cocked back, as a share of the regular turn from its
  //   windup angle to the strike angle   wind: windup time   strike: strike time
  //   follow: follow-through time   reach: how much of the follow-through hand travel and blade turn is kept
  //   recover: time to come back to guard   tail: seconds held in guard before the action ends
  // The shorter windup leaves less travel, so the strike time comes down a hair to keep the blade arriving at the speed it had.
  moves:{
    regular:{amp:1,cock:1,wind:1,strike:1,follow:1,reach:1,recover:1,tail:.42},
    tactical:{amp:.8,cock:.8,wind:.8,strike:.85,follow:.75,reach:.7,recover:.7,tail:.3}},
  // A Novice's arms are too slow to follow a clipped windup, so the profile fades in with skill: none at skill 1, all of it from here.
  full:3,
  // the tight guard, as changes to the weapon's own GUARD entry: hands closer to the chest (x), hands higher (up, in arm lengths),
  // a lower crouch, a little more lean and feet closer together. The weapon angles are the weapon's own, so it stays recognisable.
  guard:{hand:.84,up:.08,off:.84,offUp:.07,crouch:-.03,lean:.03,stance:.9},
  // the glance after a kill, in seconds from the kill. delay: before the head moves; turn: time to swing the head round;
  // first/second: how long each look lasts, turn included; back: return to normal. "slow" is the look round when nobody is left.
  // fore/aft: head tilt in radians toward something ahead / over the shoulder; eye: eye shift ahead (fraction of the head radius)
  look:{fast:{delay:.15,turn:.11,first:.35,second:.25,back:.16},slow:{delay:.3,turn:.24,first:.6,second:.6,back:.3},fore:.12,aft:.34,eye:.1,lift:.06}
};
// f.tactical: true for Kael only unless a test or a later feature sets it
Object.defineProperty(Fighter.prototype,'tactical',{configurable:true,get(){return this._tac!==undefined?this._tac:this===S.F[0];},set(v){this._tac=v;}});
// The lash is not a quick economical stroke: its chain needs the regular time to run out, so it keeps the regular motion.
function tacOf(f,T){
  const R=TACTICAL.moves.regular;if(!TACTICAL.on||!f||!f.tactical||(T&&T.lash))return R;
  const m=clamp((f.skill-1)/(TACTICAL.full-1),0,1),P=TACTICAL.moves.tactical;if(m<=0)return R;if(m>=1)return P;
  const o={};for(const k in R)o[k]=lerp(R[k],P[k],m);return o;}

// ---------- the tight guard ----------
function tacGuard(f){
  const g=GUARD[f.weaponKey];if(!TACTICAL.on||!f.tactical)return g;
  const k=TACTICAL.guard;
  return{...g,hx:g.hx*k.hand,hy:g.hy-k.up,off:g.off?[g.off[0]*k.off,g.off[1]-k.offUp]:g.off,crouch:g.crouch+k.crouch,lean:g.lean+k.lean,sf:g.sf*k.stance,sb:g.sb*k.stance};}

// ---------- the windup ----------
// W is the regular windup {hand,ang}: the blade is cocked back less, so the windup stays short (strikes with no turn keep theirs)
function tacWind(A,T,W,theta){
  const k=tacOf(A,T).cock;if(k>=1||!W)return W;
  return{hand:W.hand,ang:theta+(W.ang-theta)*k};}

// ---------- the follow-through ----------
// F is the regular follow-through {hand,ang}: a tactical fighter's hand covers only part of the way from the impact hand to it, and the
// blade turns less. A fumble stays as sloppy as ever.
function tacFollow(A,T,F,theta,impHand,out){
  const k=tacOf(A,T).reach;if(k>=1||out==='fumble')return F;
  return{hand:{fn:()=>{const a=A.resolve(impHand),b=A.resolve(F.hand);return{x:lerp(a.x,b.x,k),y:lerp(a.y,b.y,k)};}},ang:theta+(F.ang-theta)*k};}

// ---------- the glance ----------
// f.look={t0,end,keys:[[t,w],...]} with w the world side of the look: +1 right, -1 left, 0 straight on. Sampled smoothly; relative to the
// way the fighter faces it is L: +1 at something ahead, -1 over the shoulder. Facing and everything the rules read stay untouched.
function tacLook(f){
  const k=f.look;if(!k||f.dead||f.downed||f.clinch)return 0;
  const t=S.t-k.t0,K=k.keys;if(t<=0)return K[0][1]*f.facing;if(t>=k.end)return 0;
  let i=1;while(i<K.length-1&&t>=K[i][0])i++;
  const a=K[i-1],b=K[i];return lerp(a[1],b[1],sstep((t-a[0])/Math.max(1e-6,b[0]-a[0])))*f.facing;}
// tilt of the head in radians, + toward the way it faces
const tacTilt=L=>L>=0?L*TACTICAL.look.fore:L*TACTICAL.look.aft;
// the head target, nudged by the glance as an offset on top of whatever the action asks for
function tacHead(f,h){
  const k=f.look;if(!k)return h;
  if(f.dead||S.t>=k.t0+k.end){f.look=null;return h;}
  const a=tacTilt(tacLook(f))*f.facing;if(!a)return h;
  const c=f.p[CHE],dx=h.x-c.x,dy=h.y-c.y,ca=Math.cos(a),sa=Math.sin(a);
  return{x:c.x+dx*ca-dy*sa,y:c.y+dx*sa+dy*ca};}
// where the eye dot is drawn: ahead of the head's centre, or at the back of the head when he looks behind him
function tacEye(f){
  const h=f.p[HEAD],r=f.body.headR,L=f.look?tacLook(f):0,G=TACTICAL.look;
  return{x:h.x+f.facing*r*(L>=0?.5+L*G.eye:.5+L),y:h.y-r*(.12+(L>0?L*G.lift:0))};}
// Kael has just killed D: after a beat his head checks the room, first the nearest enemy still on his feet, then the other side, then
// back to normal. With nobody left it is a slower look one way and the other.
function tacGlance(A,D){
  const E=nearestEnemy(A),P=TACTICAL.look[E?'fast':'slow'],side=s=>Math.sign(s)||A.facing;
  const w1=side((E||D).station-A.station),w0=A.look?tacLook(A)*A.facing:0;
  const t1=P.delay+P.turn,t2=P.delay+P.first,t3=t2+P.turn,t4=P.delay+P.first+P.second,t5=t4+P.back;
  A.look={t0:S.t,end:t5,keys:[[0,w0],[P.delay,w0],[t1,w1],[t2,w1],[t3,-w1],[t4,-w1],[t5,0]],slow:!E};}
V11.kill.push((D,dir)=>{
  const ex=S.game.ex,A=ex&&ex.A;
  if(TACTICAL.on&&A&&A.tactical&&!A.dead&&!A.downed&&A.team!==D.team)tacGlance(A,D);});
// a new fight starts with no look left over
V11.turnStart.push(i=>{if(S.game.turnNo===1)for(const f of S.F)f.look=null;});
// ===== STYLE END =====
