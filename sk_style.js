// ===== STYLE START =====
// Kael's tactical style: economy of motion in the procedural animation. Short windups, a small follow-through, a quick return to a
// tight guard and a glance round the room after every kill. It is an animation style (ANIM_STYLE, sk_anim.js): dice, damage, tempo,
// footing and the AI never read anything in here. Everyone else keeps the regular, bigger motion.
const TACTICAL=ANIM_STYLE.tactical={
  name:'Tactical',on:true,
  // multipliers on the attack's numbers; the regular ones (ANIM_MOVES) are all 1 and a tail of .42 s
  //   amp: windup size (hand travel back and up)   cock: how far the blade is cocked back, as a share of the regular turn from its
  //   windup angle to the strike angle   wind: windup time   strike: strike time
  //   follow: follow-through time   reach: how much of the follow-through hand travel and blade turn is kept
  //   recover: time to come back to guard   tail: seconds held in guard before the action ends
  // The shorter windup leaves less travel, so the strike time comes down a hair to keep the blade arriving at the speed it had.
  moves:{amp:.8,cock:.8,wind:.8,strike:.85,follow:.75,reach:.7,recover:.7,tail:.3},
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
// f.tactical: true for Kael only unless a test or a later feature sets it (his animStyle is 'tactical' while it is)
Object.defineProperty(Fighter.prototype,'tactical',{configurable:true,get(){return this._tac!==undefined?this._tac:this===S.F[0];},set(v){this._tac=v;}});
// (the windup's cock, the follow-through's reach and the tight guard are worked by sk_anim.js: styleWind, styleFollow, styleGuard)

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
  if(A&&animStyleOf(A).look&&!A.dead&&!A.downed&&A.team!==D.team)tacGlance(A,D);});
// a new fight starts with no look left over
V11.turnStart.push(i=>{if(S.game.turnNo===1)for(const f of S.F)f.look=null;});
// ===== STYLE END =====
