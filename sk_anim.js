// ===== ANIM START =====
// The animation's vocabulary: named poses, and moves written as keyframes of them.
// A move is a track of body poses (where the pelvis goes, how low it sits, the lean, the feet) and a track of arm poses (the weapon
// hand, the blade's angle, the free hand, the head's tilt), sampled by controlAndForces (sk_core.js) and driven into the ragdoll by its
// motors. The poses are named here, in the body's own units, so one pose fits every body; the planners give the times, and aim the
// hand and the blade at the real contact point.
//
// A body pose (the same units as a GUARD entry):
//   crouch   how low the pelvis sits: it is put leg*crouch below the ground under the feet (the guard is about .9)
//   lean     the torso forward, in radians (back if negative)
//   sf, sb   the front and the back foot from the pelvis, in leg lengths (front +, back -)
//   th       how far a foot may be off its spot before it steps, in leg lengths (.95: the feet stay where they are)
//   lift     the whole body off the floor, px
//   kick     the front foot's target [forward, down] from the pelvis, in leg lengths; kw how much of the foot goes to it (0..1)
//   on       'guard': the pose stands on his guard. What it does not say comes from the guard, live, so it breathes and follows his
//            posture as the guard does; add {field: n} adds n to the guard's own value. 'now': it is laid over where he is when the
//            move is planned. A pose without it is fixed when the move is planned, and says everything (crouch, lean, sf, sb, th).
// An arm pose (as GUARD's hx, hy, w, off):
//   hx, hy   the weapon hand forward and down from the shoulder, in arm lengths
//   w        the blade's angle in his own frame (0 straight ahead, + down, - up); wg: the weapon's guard angle (GUARD) plus wg
//   off      the free hand [forward, down] from the shoulder in arm lengths. A weapon held in both hands keeps it on the grip unless
//            the pose says free (the hand leaves the grip for this: a spell thrown off it) or its two says otherwise; 'grip': always
//            on the grip
//   tilt     the head's tilt (+ forward)
//   two      what is different with a weapon held in both hands
// Whatever a planner aims (a hand on a man's collar, a blade on the line of a blow) it lays over the pose as a change, in world terms.
const POSE={body:{
  // ---- the attack's way in and its flourishes (planAttack) ----
  run:{crouch:.86,lean:.16,sf:.3,sb:-.32,th:.2},        // the run in to strike
  burst:{crouch:.78,lean:.32,sf:.3,sb:-.32,th:.2},      // ... a burst of speed
  slideRun:{crouch:.82,lean:.22,sf:.32,sb:-.34,th:.2},  // ... into a slide
  slideDrop:{crouch:.6,lean:-.3,sf:.52,sb:-.22,th:.95},
  leapCrouch:{crouch:.66,lean:.18,sf:.3,sb:-.3,th:.95}, // a leaping blow: down, spring, and hang with the weapon raised (lift: the planner's)
  leapSpring:{crouch:.82,lean:.1,sf:.3,sb:-.3,th:.95,lift:8},
  leapTop:{crouch:.84,lean:-.14,sf:.3,sb:-.3,th:.95},
  spin:{crouch:.78,lean:.04,sf:.28,sb:-.28,th:.95},     // a full turn on the spot with the windup held
  spinLow:{crouch:.62,lean:.04,sf:.28,sb:-.28,th:.95},  // ... for a low blow
  whirlIn:{crouch:.78,lean:.04,sf:.3,sb:-.3,th:.95},    // the whirlwind: on round to the man behind
  whirlHit:{crouch:.76,lean:.06,sf:.3,sb:-.3,th:.95},
  whirlOut:{crouch:.8,lean:.04,sf:.3,sb:-.3,th:.95},
  // ---- answers to a blow (planReaction) ----
  block:{on:'guard',crouch:.84,lean:-.04,th:.3},        // the blade meets it
  blockLow:{on:'guard',crouch:.78,lean:-.04,th:.3},     // ... a low one
  blockGive:{on:'guard',crouch:.86,lean:-.02},          // and gives with it
  slip:{on:'guard',crouch:.8,lean:-.06,th:.12},         // out of the line, sideways
  stepBack:{on:'guard',crouch:.84,lean:-.38,th:.1},     // back along the line, the weight away
  duck:{on:'guard',crouch:.6,lean:.32,th:.1},           // under it
  brace:{on:'guard',crouch:.86,lean:.02},               // a blow he takes: set against it
  // ---- over the table (vaultKeys) ----
  vaultGather:{crouch:.74,lean:.24,sf:.28,sb:-.3,th:.3},
  vaultUp:{crouch:.86,lean:.14,sf:.28,sb:-.3,th:.3},
  vaultTop:{crouch:.86,lean:.1,sf:.28,sb:-.3,th:.3},
  vaultLand:{crouch:.74,lean:.18,sf:.3,sb:-.32,th:.2},
  // ---- moving about ----
  sidestep:{on:'guard',lean:.03},                       // (its crouch is the weapon's guard crouch less .06: planSidestep)
  stalk:{crouch:.86,lean:.14,sf:.3,sb:-.32,th:.24},     // round a flank, low and quick
  stalkTurn:{crouch:.86,lean:.12,sf:.3,sb:-.32,th:.24},
  breakRun:{crouch:.7,lean:.34,sf:.32,sb:-.34,th:.24},  // the break out: head down through the gap
  breakTurn:{crouch:.68,lean:.36,sf:.32,sb:-.34,th:.24},
  // ---- the shove, the shoulder check and the bind (planShove) ----
  shoveLoad:{crouch:.82,lean:.1,sf:.36,sb:-.36,th:.1},
  shoulderLoad:{crouch:.76,lean:.2,sf:.36,sb:-.36,th:.1},
  shoveDrive:{crouch:.8,lean:.34,sf:.46,sb:-.38,th:.07},
  shoulderDrive:{crouch:.74,lean:.52,sf:.46,sb:-.38,th:.07},
  bindDrive:{crouch:.8,lean:.12,sf:.46,sb:-.38,th:.07},
  // ---- the feint ----
  feint:{on:'guard',add:{lean:.14,crouch:-.05}},        // a half-step in
  feintBite:{on:'guard',add:{lean:-.12,crouch:.02}},    // the man who bites flinches back
  // ---- the elf (sk_elf.js) ----
  elfDash:{on:'guard',crouch:.74,lean:.36,th:.42},      // the run: low, the blade trailing
  elfDashBack:{on:'guard',crouch:.8,lean:-.06,th:.42},  // ... going back
  elfDashLand:{on:'guard',th:.3},
  leapGather:{on:'guard',crouch:.7,lean:.22,th:.3},     // over a low blow: down onto the legs
  leapTuck:{on:'guard',crouch:.86,lean:.06,th:.95},     // up, the knees tucked (its lift is the planner's)
  leapHang:{on:'guard',crouch:.86,lean:.08,th:.95},
  leapLand:{on:'guard',crouch:.7,lean:.2,th:.95,lift:0},
  overSet:{on:'guard',crouch:.72,lean:.3,th:.3},        // over the man: a step in
  overSpring:{crouch:.8,lean:.34,sf:.3,sb:-.3,th:.95},  // a hand on his shoulder and up
  overTop:{crouch:.86,lean:.04,sf:.3,sb:-.3,th:.95},
  overLand:{crouch:.66,lean:.24,sf:.32,sb:-.3,th:.95,lift:0},  // down at his back
  spinSet:{on:'guard',crouch:.8},                       // a full turn off the line of a thrust
  spinOff:{on:'guard',crouch:.78,lean:-.04,th:.95},
  boltCock:{on:'guard',crouch:.84,add:{lean:-.1}},      // the Gilt bolt: the left hand drawn back
  boltFlick:{on:'guard',crouch:.8,lean:.3,sf:.44,sb:-.36},  // and flicked out
  galeGather:{on:'guard',crouch:.8,lean:-.08},          // the Gale: the wind gathered at the hip
  galeThrow:{on:'guard',crouch:.76,lean:.34,sf:.52,sb:-.42,th:.9},  // and the palm thrown out on a long step
  galeHold:{on:'guard',crouch:.78,lean:.3,sf:.52,sb:-.42,th:.9},
  blinkCrouch:{on:'guard',crouch:.8,lean:.26},          // the Glimmer step: down before he goes out
  // ---- a blow taken (hitReaction, sk_brawl.js) ----
  hitHead:{on:'guard',lean:-.38,crouch:.86,th:.04},     // the head snaps back and the feet stumble under it
  hitHeadStagger:{on:'guard',lean:-.24,crouch:.84,th:.04},
  hitHeadSettle:{on:'guard',lean:-.1,th:.06},
  hitBody:{on:'guard',lean:.64,crouch:.7,th:.05},       // doubled over
  hitBodyHold:{on:'guard',lean:.52,crouch:.72,th:.05},
  hitLeg:{on:'guard',crouch:.5,lean:.2,th:.04},         // the knee buckles
  hitLegHold:{on:'guard',crouch:.57,lean:.12,th:.05},
  hitSide:{on:'guard',lean:-.22,crouch:.82,th:.05},     // a cut across the arm or the ribs twists the body away
  hitSideSettle:{on:'guard',lean:-.08,th:.06},
  // ---- brawling (sk_brawl.js) ----
  grabStep:{crouch:.82,lean:.16,sf:.36,sb:-.36,th:.12}, // in for the collar
  grabTake:{crouch:.82,lean:.26,sf:.42,sb:-.36,th:.1},
  headbuttCock:{on:'guard',lean:-.24,crouch:.86,th:.3}, // the head drawn back
  headbutt:{on:'guard',lean:.52,crouch:.8,th:.3},
  headbuttHold:{on:'guard',lean:.48,crouch:.8,th:.3},
  kneeCock:{on:'guard',lean:.18,crouch:.84,th:.9,kick:[-.05,.5],kw:.9},  // the knee up and driven in
  knee:{on:'guard',lean:.12,crouch:.86,th:.9,kick:[.2,.1],kw:1},
  heelCock:{on:'guard',crouch:.88,th:.9,kick:[-.14,.42],kw:.9},  // a heel back at the man behind (the foot goes to him)
  heel:{on:'guard',crouch:.84,th:.9,kw:1},
  elbowCock:{on:'guard',lean:-.1,th:.3},
  elbow:{on:'guard',lean:.28,th:.3},
  elbowHold:{on:'guard',lean:.26,th:.3},
  flinchBlock:{on:'guard',lean:-.08},                    // the man it is aimed at: an arm up
  flinchAway:{on:'guard',lean:-.3,crouch:.8},            // ... or out of its way
  throwFail:{on:'guard',crouch:.7,lean:.3,th:.9},       // a throw that does not come off
  throwFailBack:{on:'guard',crouch:.8,lean:-.1,th:.3},
  throwLoad:{on:'guard',crouch:.64,lean:.32,th:.95},    // under him, up, and down where he lands
  throwLift:{on:'guard',crouch:.78,lean:-.12,th:.95},
  throwDrop:{on:'guard',crouch:.68,lean:.38,th:.95},
  twistOut:{on:'guard',crouch:.76,lean:-.2,th:.3},      // twisting out of a hold
  twistFree:{on:'guard',crouch:.8,lean:.18,th:.3},
  shieldSwing:{on:'guard',crouch:.8},                   // two bodies swinging round each other through the depth
  pickupStep:{on:'guard',crouch:.84,th:.2},             // to the thing on the floor, and down for it (its crouch is the planner's)
  pickupReach:{on:'guard',lean:.5,th:.9},
  pickupPull:{on:'guard',lean:.3,th:.9},                // a blade stuck in a body: pulled
  // ---- moves the room gives (sk_ctxmoves.js) ----
  backThrustCock:{on:'guard',add:{lean:.08,crouch:-.02}},  // the back thrust: the body stays turned to the man in front
  backThrust:{on:'guard',add:{lean:-.22,crouch:-.04}},
  kickCock:{on:'guard',crouch:.86,lean:-.06,th:.9,kick:[-.1,.55],kw:.9},  // a barrel or a crate kicked at him
  kickProp:{on:'guard',crouch:.84,lean:-.16,th:.9,kw:1},
  kickPropHold:{on:'guard',crouch:.84,lean:-.14,th:.9,kw:1},
  legsTaken:{on:'guard',crouch:.78,lean:.26,th:.4},     // the man it hits
  letItBy:{on:'guard',crouch:.8,lean:-.12,th:.6},       // ... or the man it misses
  bottleReach:{on:'guard',crouch:.86,lean:.2},          // a bottle taken off the table and thrown
  bottleWind:{on:'guard',lean:-.12,th:.3},
  bottleThrow:{on:'guard',lean:.26,th:.3},
  bottleFollow:{on:'guard',lean:.18},
  bottleHit:{on:'guard',lean:-.22,crouch:.86},          // the head snapping back
  bottleDuck:{on:'guard',crouch:.68,lean:.3},           // ... or a duck under it
  bottleDuckHold:{on:'guard',crouch:.7,lean:.24},
  // ---- the ally and the crews (sk_team.js) ----
  pincerRun:{crouch:.84,lean:.16,sf:.3,sb:-.32,th:.24}, // round to the far side of him
  pincerTurn:{crouch:.84,lean:.12,sf:.3,sb:-.32,th:.24},
  helpStep:{on:'guard',crouch:.8},                      // a hand to a man on the floor
  helpReach:{on:'guard',crouch:.6,lean:.45,th:.9},
  helpPull:{on:'guard',crouch:.78,lean:-.06,th:.9},
  stabCock:{on:'guard',add:{lean:-.06}},                // the off-hand dagger
  stab:{on:'guard',add:{lean:.16,crouch:-.03}},
  flinchStab:{on:'guard',lean:-.26,crouch:.8},          // the man it misses
  // ---- guns (sk_guns.js) ----
  shotHit:{on:'guard',add:{crouch:-.04,lean:-.22}},     // a round that hits jerks him back (flip: the way it came from)
  shotDuck:{on:'guard',add:{crouch:-.08,lean:.2}},      // one that misses close makes him duck his head
  // ---- the beasts (sk_beast.js) ----
  beastRun:{crouch:.84,lean:.16,sf:.3,sb:-.32,th:.2},
  tailWind:{lean:.28,sf:.36,sb:-.36,th:.95},            // the turn into a tail swing (its crouch is the planner's: lower for a low one)
  tailSwing:{lean:.06,sf:.42,sb:-.42,th:.95},
  tailRecover:{lean:.08,sf:.38,sb:-.38,th:.95},
  tailFlinch:{on:'guard',crouch:.8,lean:.2},            // a man whose tail the blade goes for flinches round
  tossGrab:{on:'guard',crouch:.76,lean:.3,th:.3},       // into the scruff
  tossFail:{on:'guard',crouch:.84,lean:-.06,th:.3},     // ... and he twists free
  tossLoad:{on:'guard',crouch:.7,lean:.32,th:.9},       // down on the legs
  tossTurn:{on:'guard',crouch:.86,lean:.1,th:.9},       // the whole body turned into the throw
  tossOver:{on:'guard',crouch:.86,lean:-.3,th:.9},      // ... over the shoulder when it goes behind him
  // ---- finishers (sk_fin.js) ----
  dyingThroat:{on:'now',crouch:.74,lean:.08},           // a dying body: hands to the throat
  dyingThroatDown:{on:'now',crouch:.46,lean:.42},
  dyingClutch:{on:'now',crouch:.68,lean:.45},           // ... to the wound
  dyingClutchDown:{on:'now',crouch:.5,lean:.6},
  dyingKneel:{on:'now',crouch:.5,lean:.06},             // ... or down on its knees
  dyingKneelDown:{on:'now',crouch:.42,lean:.22},
  draw:{on:'guard',add:{lean:.08,crouch:-.03}},         // a sidearm drawn from its sheath
  insureDip:{sf:.46,sb:-.3,th:.3,lift:0,kw:0},          // the stab on the way through (its crouch and lean are worked out: sk_insure.js)
  // ---- Short Hand (sk_short.js) ----
  hingeTurn:{on:'guard',crouch:.68,lean:.34,th:.12},    // the Hinge: the empty side turned into the blow
  hingeIn:{on:'guard',crouch:.71,lean:.3,th:.32},       // ... and the step in after it
  hingeJolt:{on:'now',crouch:.66,lean:.2,th:.08},       // a glancing blow that lands: the jolt on the shoulder
  hingeSettle:{on:'guard',crouch:.71,lean:.3,th:.3},
  tollLean:{on:'guard',crouch:.74,lean:.06,th:.12},     // the Wrist toll: in over the reaching hand
  tollGrab:{on:'guard',crouch:.72,lean:.3,th:.12},      // ... the hand that grabs
  chin:{on:'guard',lean:-.14,crouch:.93,th:.2},         // the knife at his throat: chin up, not a muscle
  reachCollar:{on:'guard',add:{lean:.1}},               // the reach for the collar that a toll can meet
  // ---- the room's moves (sk_room.js) ----
  hurlLoad:{on:'guard',crouch:.72,lean:.3,th:.9},       // into the collar and the whole body turned into the throw
  hurlTurn:{on:'guard',crouch:.84,lean:.24,th:.9},
  flipLow:{on:'guard',crouch:.68,lean:.34,th:.6},       // down to the table's edge, both hands under it
  flipHeave:{on:'guard',crouch:.95,lean:-.14,th:.3},    // and up
  lampCut:{on:'guard',crouch:.95,lean:-.05},            // a cut up at a lamp's chain
  // ---- the tell (sk_react.js) ----
  tell:{on:'guard',add:{crouch:-.04,lean:.06}},         // the blow drawn back while the answer is chosen
},arm:{
  spinHold:{hx:-.12,hy:-.38,w:-2.95,off:[.38,.12],tilt:-.05},  // the windup held through a spin
  whirl:{hx:.5,hy:-.26,w:-.06,off:[-.04,.34],tilt:0},   // the blade carried round flat
  block:{off:[.3,.05],tilt:-.05},                       // (the hand and the blade are put on the line of the blow)
  slip:{hx:.22,hy:.24,wg:-.2,off:[.12,.36],tilt:-.12},
  evade:{hx:.18,hy:.28,wg:-.25,off:[.1,.4],tilt:-.2},   // stepping back
  duck:{hx:.18,hy:.28,wg:-.25,off:[.1,.4],tilt:.2},
  vault:{hx:.32,hy:-.12,wg:-.3,tilt:.1},                // (the free hand is planted on the table)
  breakRun:{hx:.2,hy:.1,wg:.6,off:[.1,.3],tilt:.15},
  // the shove: the weapon hand up out of the way and the free hand loaded at the chest, then driven into him; in both hands, the
  // weapon itself is driven
  shoveLoad:{hx:.1,hy:-.2,w:-1.3,off:[-.05,.2],tilt:0,two:{hx:.15,hy:.2,w:-1.45}},
  shovePush:{hx:.12,hy:-.25,w:-1.3,tilt:.1,two:{w:-1.45}},
  shoulderTuck:{hx:.02,hy:.05,w:-1.4,off:[.1,.15],tilt:.3,two:{hx:.05,hy:.1,w:-1.5}},
  feint:{hx:.62,hy:-.18,w:-.12,off:[-.1,.4],tilt:.06},
  feintBack:{hx:.42,hy:-.3,w:-.5,off:[-.1,.4],tilt:.02},
  feintBite:{hx:.28,hy:-.62,w:-1.1,off:[.1,.3],tilt:-.05},
  elfDash:{hx:-.04,hy:.36,w:2.45,off:[.44,.02],tilt:.18},
  elfDashBack:{hx:.2,hy:.36,wg:0,off:[.3,.22],tilt:-.05},
  leap:{hx:.32,hy:-.48,w:-1.15,off:[-.22,-.42],tilt:-.05},
  overPlant:{hx:.12,hy:-.3,w:-1.7,tilt:.1},             // (the free hand is on his shoulder)
  spinOff:{hx:.1,hy:.1,w:-1.5,off:[.04,.3],tilt:0},
  boltCock:{hx:.12,hy:.12,wg:0,off:[-.12,-.34],free:true,tilt:-.06},
  boltFlick:{hx:.06,hy:.18,wg:.3,off:[.8,-.18],free:true,tilt:.1},
  galeGather:{hx:-.12,hy:.06,wg:-.2,off:[-.08,-.18],free:true,tilt:-.1},
  galePalm:{hx:-.16,hy:.12,wg:.2,off:[.95,-.08],free:true,tilt:.12},
  hitHead:{hx:.16,hy:-.5,w:-2,off:[.26,-.36],tilt:-.5},
  hitHeadSettle:{hx:.2,hy:-.2,w:-1.4,off:[.2,-.1],tilt:-.22},
  hitBody:{hx:.14,hy:.34,w:1,off:[.06,.36],tilt:.28},
  hitBodyHold:{hx:.16,hy:.3,w:.9,off:[.08,.34],tilt:.22},
  hitLeg:{hx:.3,hy:.15,w:.4,off:[.35,.25],tilt:.12},
  hitSide:{hx:-.15,hy:-.1,w:.8,off:[.3,.05],tilt:-.18},
  grab:{hx:-.04,hy:-.12,w:-1.5,tilt:.05},               // the weapon held back out of the way (the free hand takes the collar)
  headbuttCock:{on:'guard',tilt:-.3},
  headbutt:{on:'guard',tilt:.4},
  headbuttHold:{on:'guard',tilt:.35},
  elbowCock:{w:-1.7,off:[.25,.15],two:{off:[.2,.2]},tilt:0},  // (the hand is put by the chest, toward him)
  elbow:{w:-.6,off:[.25,.15],two:{off:[.2,.2]},tilt:.1},
  armUp:{hx:.18,hy:-.42,w:-1.9,off:[.22,-.3],tilt:-.1}, // an arm up against a dirty blow
  heave:{w:1.2,tilt:.1},                                // (both hands on him: the chest and the hips)
  twist:{hx:.35,hy:-.25,w:-1.2,off:[.3,-.1],tilt:-.1},
  pickup:{w:.8,off:[.2,.3],free:true,tilt:.2},          // (the hand goes to the thing)
  backThrustCock:{hx:.1,hy:.28,w:Math.PI-.35,off:[.24,.2],tilt:-.05},  // the hand back past the hip
  backThrust:{off:[.24,.2],tilt:.05},                   // (the hand and the blade are aimed at him)
  kickProp:{on:'guard',tilt:-.15},
  bottleWind:{on:'guard',off:[-.3,-.78],free:true},     // (the bottle is in the free hand)
  bottleThrow:{on:'guard',off:[.66,-.46],free:true},
  bottleFollow:{on:'guard',off:[.52,.1],free:true},
  helpReach:{hx:.3,hy:.25,w:1.2,tilt:.2},               // (the free hand takes his)
  helpPull:{hx:.3,hy:.05,w:.9,off:[.25,-.15],free:true,tilt:0},
  daggerCock:{on:'guard',off:[-.06,.3],free:true},      // the off-hand dagger drawn back to the hip
  glaiveUp:{hx:.18,hy:-.08,w:-1.42,off:[.08,.22],tilt:.05},  // the glaive held upright and close through a turn
  tossReach:{hx:.3,hy:.0,w:-.9,tilt:.12},               // (a hand on the scruff)
  tossHeave:{hx:.25,hy:.1,w:-.7,tilt:.15,two:{w:-1.2}}, // (the hands carry him round)
  dyingThroat:{w:1.5,tilt:.25},                         // (both hands at the neck)
  dyingThroatDown:{w:1.6,tilt:.45},
  dyingClutch:{w:1.5,tilt:.3},                          // (both hands on the wound)
  dyingClutchDown:{w:1.5,tilt:.4},
  dyingKneel:{hx:.12,hy:.86,w:1.4,off:[.04,.86],free:true,tilt:.3},
  draw:{w:1.9,off:[.32,.12],free:true,tilt:.05},        // (the hand on the hilt in the sheath)
  insureStab:{off:[-.3,.2],tilt:.15},                   // (the point driven down into the chest)
  hingeTuck:{hx:.1,hy:.18,w:-1.3,off:[.04,.32],tilt:.32},
  hingeJolt:{hx:.1,hy:.18,w:-1.3,off:[.04,.32],tilt:.3},
  tollCut:{w:.75,off:[.1,.32],tilt:-.05},               // (the knife meets the hand that reaches)
  tollGrab:{w:.8,off:[.1,.32],tilt:-.05},
  tollAfter:{hx:.22,hy:.24,w:-.9,off:[.1,.32],tilt:0},
  tollAfterGrab:{hx:.24,hy:.22,w:-.9,off:[.1,.32],tilt:0},
  chin:{hx:.3,hy:.3,w:.9,off:[.2,.32],tilt:-.3},
  reachCollar:{hx:-.04,hy:-.1,w:-1.5,off:[.55,.05],free:true,tilt:.05},
  flipGrip:{w:-.3,tilt:.1},                             // (both hands under the table's edge)
  flipHeave:{hx:.4,hy:-.6,w:-1.3,off:[.3,-.55],tilt:-.1},
  lampWind:{hx:.1,hy:-.2,w:-2.6,off:[.2,.2],tilt:-.1},
  lampCut:{w:-1.2,off:[.2,.1],tilt:-.2},                // (the blade goes up at the chain)
  tell:{off:[.1,.3],tilt:0},                            // (the hand and the blade as the blow's windup)
}};

// ---------- the attack ----------
// planAttack (sk_core.js) works out where a blow meets its man and aims the blade there. The shape the body and the arm take on the way,
// and the times, are here: the attack as data.
const ATTACK={
  // seconds, before the weapon's weight and his skill (and a style's moves): the windup, the strike, the hold at the impact (dwell, and
  // dwellMass more for each unit of the weapon's weight factor), the follow-through and the return to guard. run: the approach, px/s,
  // from a novice to a master
  time:{wind:.3,strike:.15,dwell:.05,dwellMass:.03,follow:.22,recover:.34},
  run:[250,390],
  // the body, by the form of the blow:
  //   lean, crouch   at the impact                      reach   the share of the arm out at the impact
  //   stance         the feet at the impact [front, back], leg lengths
  //   wind, strike   factors on the windup and the strike times
  //   wLean, wCrouch the body as the blow is drawn back  fLean   the lean added in the follow-through (the others: fLean below)
  // passing is a thrust made on a passing step; butt a blow with the butt end or the haft (haft its reach; its lean only on a cut);
  // ground a blow at a man on the floor (its reach only on a thrust); leap's crouch is a leaping blow's at the landing. kick, stomp
  // and slide are the kicks: reach the foot's distance off the target in leg lengths, wKick the foot in the windup [forward, down]
  // from the pelvis in leg lengths, dCrouch the crouch in the hold
  form:{
    slash:{lean:.18,crouch:.8,reach:.68,stance:[.44,-.38],wind:1,strike:1,wLean:-.06,wCrouch:.85},
    thrust:{lean:.24,crouch:.76,reach:.9,stance:[.44,-.38],wind:.8,strike:.85,wLean:-.04,wCrouch:.85},
    overhead:{lean:.3,crouch:.8,reach:.68,stance:[.44,-.38],wind:1.25,strike:1.15,wLean:-.12,wCrouch:.85,fLean:.12},
    sweep:{lean:.32,crouch:.64,reach:.6,stance:[.5,-.38],wind:1.1,strike:1,wLean:.08,wCrouch:.72},
    passing:{lean:.3,crouch:.7,reach:.95,stance:[.62,-.4]},
    butt:{lean:.2,reach:.78,haft:.62,wind:.7,strike:.8},
    ground:{lean:.52,crouch:.7,reach:.85},
    leap:{crouch:.74},
    kick:{lean:-.12,crouch:.84,reach:.78,wLean:-.1,wCrouch:.84,wKick:[-.12,.62]},
    stomp:{lean:.08,crouch:.9,reach:.3,wLean:.04,wCrouch:.9,wKick:[.24,.22]},
    slide:{lean:-.32,crouch:.58,dCrouch:.6,stance:[.56,-.2],wLean:-.3,wCrouch:.6,wStance:[.52,-.22],wKick:[.34,.78]},
  },
  wStance:[.3,-.34],          // the feet in the windup
  drawBack:8,                 // how far the body draws back in the windup, px (times the windup's size)
  drive:[12,14],kickDrive:[4,5],  // how far past the strike point the body goes at the impact and in the hold, px
  dLean:.02,                  // the lean added in the hold
  fCrouch:-.02,fLean:.05,fStance:[.46,-.38],fKick:[.5,.82],  // the follow-through
  carry:[16,16],              // how far the body carries on after the blow, px: the first, and the second times (1 - his skill)
  // the arm. windup, by form: the hand drawn back [forward, down] from the shoulder in arm lengths, the blade's angle w (null: already
  // on the line of the blow); amp: which of the two the windup's size scales (ampCap: no more than that); wAmp: the blade turned on
  // by this per unit of size; cap: a technique's windCap limits the turn; half: a half-sword thrust's draw
  windup:{
    butt:{hand:[-.18,-.02],w:null},
    sweep:{hand:[-.28,.42],amp:[1,0],w:2.45},
    thrust:{hand:[-.42,.16],amp:[1,0],w:null,half:.6},
    overhead:{hand:[-.02,-.98],amp:[0,1],ampCap:1,w:-2.75,wAmp:-.2,cap:true},
    rising:{hand:[-.18,.4],amp:[1,0],w:2.3},
    slash:{hand:[-.1,-.62],amp:[1,1],w:-2.35,wAmp:-.15,cap:true},
  },
  // follow: where the follow-through carries the hand, and how far the blade turns on from the line of the blow (dodge: more on a miss;
  // butt: a blocked butt blow's; push: a thrust's hand pushed on past the impact, in arm lengths)
  follow:{
    fumble:{hand:[.6,.95],turn:1.5},
    block:{hand:[.22,.1],turn:-.6,butt:.3},
    thrust:{push:.12},
    sweep:{hand:[.55,.66],turn:-.7},
    overhead:{hand:[.55,.86],turn:.95,dodge:.25},
    rising:{hand:[.42,-.55],turn:-1.2},
    slash:{hand:[.5,.62],turn:1.25,dodge:.3},
  },
  off:{wind:[.38,.12],impact:[-.22,.38],follow:[-.08,.46]},  // the free hand (on the grip of a weapon in both hands)
  tilt:{wind:-.05,leap:-.08,impact:.1,follow:.08},           // the head
  dwellTurn:.12,lashTurn:.03,                                // the blade's turn in the hold (none for a thrust or a butt blow)
};
// the attack's numbers for this fighter (a style may change them: sk_style.js)
function attackTable(A){return ATTACK;}
// the body's form at the impact, and the windup and strike time factors, for this blow
function attackForm(K,T,kind,sweep,thrust,butt,gnd){const F=K.form,over=kind==='overhead',pas=T.passing;
  return{lean:gnd?F.ground.lean:sweep?F.sweep.lean:over?F.overhead.lean:thrust?(pas?F.passing.lean:F.thrust.lean):butt?F.butt.lean:F.slash.lean,
    crouch:gnd?F.ground.crouch:sweep?F.sweep.crouch:thrust?(pas?F.passing.crouch:F.thrust.crouch):over?F.overhead.crouch:F.slash.crouch,
    reach:T.reach||(gnd&&thrust?F.ground.reach:thrust?(pas?F.passing.reach:F.thrust.reach):butt?(T.key==='haft'?F.butt.haft:F.butt.reach):sweep?F.sweep.reach:over?F.overhead.reach:F.slash.reach),
    wind:sweep?F.sweep.wind:over?F.overhead.wind:thrust?F.thrust.wind:butt?F.butt.wind:F.slash.wind,
    strike:over?F.overhead.strike:thrust?F.thrust.strike:butt?F.butt.strike:sweep?F.sweep.strike:F.slash.strike};}

// ---------- poses for a fighter ----------
// the named pose (a style may change it: sk_style.js)
function poseB(f,name){const P=POSE.body[name];if(!P)throw new Error('no body pose '+name);return P;}
function poseA(f,name){const P=POSE.arm[name];if(!P)throw new Error('no arm pose '+name);return P;}
// A change flip (+1 or -1) turns the pose's lean (an arm pose's tilt) round: the poses are written facing the man he acts on, and
// flip -1 is for the man at his back.
// a body pose P made for f, with the changes o laid over it
function bodyPose(f,P,o){const L=f.leg,r={},fl=o&&o.flip!=null?o.flip:null;
  if(P.crouch!=null)r.crouch=P.crouch;if(P.lean!=null)r.lean=fl===null?P.lean:P.lean*fl;
  if(P.sf!=null)r.stF=P.sf*L;if(P.sb!=null)r.stB=P.sb*L;
  if(P.th!=null)r.th=P.th;if(P.lift!=null)r.lift=P.lift;
  if(P.kick)r.kick={pl:[P.kick[0]*L,P.kick[1]*L]};if(P.kw!=null)r.kw=P.kw;
  if(o)for(const k in o)if(k!=='flip')r[k]=o[k];
  return r;}
// an arm pose P made for f, with the changes o laid over it (part: only what the pose says, for a pose laid over the guard)
function armPose(f,P,o,part){const a=f.arm,two=!!f.wp.off,Q=two&&P.two?{...P,...P.two}:P,r={},fl=o&&o.flip!=null?o.flip:null;
  if(Q.hx!=null)r.hand={sh:[Q.hx*a,Q.hy*a]};
  if(Q.w!=null)r.wAng=Q.w;else if(Q.wg!=null)r.wAng=(GUARD[f.weaponKey]||GUARD.sword).w+Q.wg;
  const of=Q.off;
  if(of!=null)r.off=Array.isArray(of)?(two&&!Q.free&&!(P.two&&P.two.off)?'grip':{sh:[of[0]*a,of[1]*a]}):of;
  else if(two&&!part)r.off='grip';
  if(Q.tilt!=null)r.tilt=fl===null?Q.tilt:Q.tilt*fl;else if(!part)r.tilt=0;
  if(o)for(const k in o)if(k!=='flip')r[k]=o[k];
  return r;}
// a pose that stands on his guard, sampled live: the pose's own fields over the guard, and add added to the guard's (a change that is
// a function is read live too)
function livePose(guard,F,d,o){let fx=null,fn=null;
  if(o)for(const k in o){if(k==='flip')continue;if(typeof o[k]==='function')(fn=fn||[]).push(k);else(fx=fx||{})[k]=o[k];}
  if(!d&&!fn)return fx?()=>({...guard(),...F,...fx}):()=>({...guard(),...F});
  return()=>{const g=guard(),r={...g,...F,...fx};if(fn)for(const k of fn)r[k]=o[k]();if(d)for(const k in d)r[k]=g[k]+d[k];return r;};}
function liveBody(f,P,o){const fl=o&&o.flip!=null?o.flip:null;return livePose(()=>f.guardBody(),bodyPose(f,P,fl===null?null:{flip:fl}),flipAdd(P.add,fl,'lean'),o);}
function liveArm(f,P,o){const fl=o&&o.flip!=null?o.flip:null;return livePose(()=>f.guardArm(),armPose(f,P,fl===null?null:{flip:fl},true),flipAdd(P.add,fl,'tilt'),o);}
function flipAdd(d,fl,k){if(!d)return null;if(fl===null||d[k]==null)return d;return{...d,[k]:d[k]*fl};}

// ---------- tracks ----------
// A key is [t, pose, ease] or [t, pose, changes, ease]:
//   pose     a name in POSE, 'guard' (his guard, live), 'now' (where he is now, fixed), a function (a pose worked out live) or an
//            object (a pose written out in world terms)
//   changes  fields laid over the pose, in world terms (px, pz; a hand as {sh}, {w} or {fn}); flip as above. On a live pose a change
//            that is a function is read live.
//   ease     how the motion into this key runs (sstep when not given)
function bodyKeys(f,list){return list.map(k=>animKey(k,bodyV,f));}
function armKeys(f,list){return list.map(k=>animKey(k,armV,f));}
function animKey(k,V,f){const fn=typeof k[2]==='function',o=fn?null:k[2]||null,e=fn?k[2]:k[3],r={t:k[0],v:V(f,k[1],o)};if(e)r.e=e;return r;}
function bodyV(f,p,o){
  if(p==='now')return o?{...f.curBody,...o}:{...f.curBody};
  if(p==='guard')return o?liveBody(f,{},o):()=>f.guardBody();
  if(typeof p==='function')return p;
  if(typeof p==='string'){const P=poseB(f,p);
    return P.on==='guard'?liveBody(f,P,o):P.on==='now'?{...(f.curBody||f.guardBody()),...bodyPose(f,P,o)}:bodyPose(f,P,o);}
  return o?{...p,...o}:p;}
function armV(f,p,o){
  if(p==='now')return o?{...f.curArm,...o}:{...f.curArm};
  if(p==='guard')return o?liveArm(f,{},o):()=>f.guardArm();
  if(typeof p==='function')return p;
  if(typeof p==='string'){const P=poseA(f,p);return P.on==='guard'?liveArm(f,P,o):armPose(f,P,o);}
  return o?{...p,...o}:p;}
// ===== ANIM END =====
