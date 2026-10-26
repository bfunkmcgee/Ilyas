// ===== ANIM START =====
// The animation's vocabulary: named poses, moves written as keyframes of them, the attack as data, the styles that change them, a
// fighter's rank in his motion, the variants of each blow, and the combos.
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
  // ---- the answers acted out (planReaction) ----
  counterCock:{on:'guard',add:{lean:-.08,crouch:-.03},th:.3},  // a Counter: drawn back as the blow comes
  counterCut:{on:'guard',add:{lean:.18,crouch:-.05},th:.3},    // ... and the cut thrown into it
  turnTake:{on:'guard',crouch:.8,lean:-.1,th:.3},       // Turn him: the blow taken at an angle, the body turned off its line
  turnRoll:{on:'guard',crouch:.82,lean:.16,th:.3},      // ... and rolled on round past him
  hopBack:{on:'guard',crouch:.84,lean:-.18,th:.95},     // back over a low blow (its lift is the planner's)
  hopLand:{on:'guard',crouch:.74,lean:.04,th:.95,lift:0},
  lateSlip:{on:'guard',crouch:.82,lean:-.1},            // an answer that comes too late: the slip
  lateBack:{on:'guard',crouch:.84,lean:-.28},           // ... and the step back
  // ---- more blows taken (hitReaction) ----
  hitHeadTurn:{on:'guard',lean:-.16,crouch:.8,th:.04},  // the head knocked round, away from it
  hitHeadDrop:{on:'guard',crouch:.56,lean:.28,th:.05},  // a big one: down onto a knee for a moment
  hitHeadRise:{on:'guard',crouch:.76,lean:.1,th:.06},
  hitBodyBack:{on:'guard',lean:-.3,crouch:.8,th:.05},   // driven back, the arms out
  hitBodyClutch:{on:'guard',lean:.42,crouch:.74,th:.05},  // a hand to the wound
  hitLegHop:{on:'guard',crouch:.72,lean:.06,th:.06},    // off the hurt leg, a hop on the other
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
  counterCock:{hx:.34,hy:-.34,w:-2,off:[.2,.3],tilt:-.04},
  counterCut:{off:[-.08,.38],tilt:.06},                 // (the hand and the blade thrown at the point the blow arrives)
  turnTake:{off:[.3,.05],tilt:-.08},                    // (the blade put across the blow's line at an angle)
  turnGuide:{off:[.3,.1],tilt:-.12},                    // (the blade carried on past, the free hand on his arm)
  hopBack:{hx:.3,hy:-.1,wg:-.25,off:[.22,-.14],tilt:-.14},
  hitHeadTurn:{hx:.12,hy:-.24,w:-1.6,off:[.24,-.2],tilt:-.34},
  hitHeadDrop:{hx:.22,hy:.36,w:.7,off:[.34,.48],tilt:.34},
  hitBodyBack:{hx:.34,hy:-.34,w:-1.5,off:[.44,-.34],tilt:-.22},
  hitBodyClutch:{hx:.2,hy:.3,w:.8,off:[.08,.5],free:true,tilt:.26},  // (the free hand at the belly)
  hitLegHop:{hx:.38,hy:-.04,w:-.5,off:[.46,-.14],tilt:-.04},
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
    // the variants' own (ATTACK.variant): what they do not say is the blow's own
    flat:{lean:.14,crouch:.8,stance:[.46,-.4],wLean:-.1,wCrouch:.84},                       // a level cut, the shoulders turned through it
    snap:{lean:.12,crouch:.82,reach:.74,wind:.7,strike:.8,wLean:-.03,wCrouch:.85},          // a short cut off the wrist
    lunge:{lean:.34,crouch:.66,reach:.95,stance:[.68,-.48],wind:.9,strike:.95,wLean:-.06,wCrouch:.84},  // a thrust on a long lunge
    lowThrust:{lean:.38,crouch:.66,stance:[.5,-.4],wLean:0,wCrouch:.76},                   // under the guard, from low
    highThrust:{lean:.12,crouch:.86,wLean:-.1,wCrouch:.87},                                // over it, from a high hand
    slant:{lean:.26,crouch:.78,wLean:-.1,fLean:.1},                                        // an overhead from the shoulder
    drop:{lean:.42,crouch:.52,stance:[.56,-.32],wLean:.12,wCrouch:.66},                     // a low cut from down on a knee
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
    // the variants'
    flat:{hand:[-.22,-.3],amp:[1,0],w:-2.95,wAmp:-.1,cap:true},
    snap:{hand:[.06,-.44],w:-1.8},
    highThrust:{hand:[-.36,-.44],amp:[1,0],w:null},
    lowThrust:{hand:[-.42,.36],amp:[1,0],w:null},
    slant:{hand:[-.22,-.86],amp:[0,1],ampCap:1,w:-2.45,wAmp:-.2,cap:true},
    hook:{hand:[-.08,.5],w:2.7},
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
    // the variants'
    flat:{hand:[.46,.12],turn:1.05,dodge:.3},
    snap:{hand:[.34,.3],turn:.6},
    draw:{hand:[.02,.42],turn:.75},     // the curved edge drawn back through the cut toward the hip
    slant:{hand:[.58,.72],turn:1.1,dodge:.25},
    hook:{hand:[.36,.72],turn:-.45},
  },
  off:{wind:[.38,.12],impact:[-.22,.38],follow:[-.08,.46]},  // the free hand (on the grip of a weapon in both hands)
  tilt:{wind:-.05,leap:-.08,impact:.1,follow:.08},           // the head
  dwellTurn:.12,lashTurn:.03,                                // the blade's turn in the hold (none for a thrust or a butt blow)
  // The ways each blow can come. planAttack picks one by the animation's own dice (blowVariant): the first is the blow as it always
  // was. key; w its weight; windup, follow, form: the entries above it uses (the blow's own where it names none); ang: the blade's
  // angle at the impact turned by this; from and end: where it starts and where it leaves the blade (high, mid, low), so a blow
  // straight after another goes on from where that one ended; sk: from this skill up; fam: for these weapon families only; curved:
  // for a curved blade only; wsk: its weight for a Novice and for a Master, times this
  variant:{
    slash:[{key:'diag',w:1,from:'high',end:'low'},
      {key:'flat',w:.8,windup:'flat',follow:'flat',form:'flat',ang:-.3,from:'mid',end:'mid'},
      {key:'rise',w:.4,windup:'rising',follow:'rising',ang:-.95,from:'low',end:'high'},
      {key:'snap',w:.6,sk:3,windup:'snap',follow:'snap',form:'snap',ang:-.12,from:'mid',end:'mid',wsk:[.2,1.6]},
      {key:'draw',w:1.1,follow:'draw',from:'high',end:'mid',curved:true}],
    thrust:[{key:'line',w:1,from:'mid',end:'mid'},
      {key:'low',w:.6,windup:'lowThrust',form:'lowThrust',from:'low',end:'low'},
      {key:'high',w:.5,windup:'highThrust',form:'highThrust',from:'high',end:'mid'},
      {key:'lunge',w:.6,sk:3,form:'lunge',from:'mid',end:'mid',wsk:[.4,1.4]}],
    overhead:[{key:'vert',w:1,from:'high',end:'low'},
      {key:'slant',w:.8,windup:'slant',follow:'slant',form:'slant',ang:-.25,from:'high',end:'low'}],
    sweep:[{key:'low',w:1,from:'mid',end:'low'},
      {key:'drop',w:.45,sk:3,form:'drop',from:'mid',end:'low'},
      {key:'hook',w:.5,windup:'hook',follow:'hook',ang:.15,from:'low',end:'low',fam:['blade','heavy','short']}]},
  // A combo: a lead or two that the man parries, then the blow itself, whose dice it is (blowCombo, comboPlan). chance: by skill, a
  // Novice's to a Master's; more: the chance of a second lead. lead: its windup and strike as shares of the blow's own (next: the
  // windup of a lead after the first, as a share of the first's), the beat it rebounds off the parry, the gap before what follows,
  // its windup's size, and how far short of the blow's own spot he strikes it from (px, for each lead still to come). leads: what can
  // lead into each kind of blow, [kind, variant]
  combo:{chance:[0,.1,.25,.4,.52],more:[0,0,.1,.3,.45],quick:.7,
    lead:{wind:.55,next:.75,strike:.85,rebound:.1,gap:.03,amp:.8,back:7},
    // Beat and thrust's beat on his blade: its windup and strike as shares of the blow's own
    beat:{wind:.35,strike:.7},
    leads:{slash:[['slash','rise'],['thrust','line'],['slash','flat']],thrust:[['slash','diag'],['slash','flat'],['overhead','vert']],
      overhead:[['thrust','line'],['slash','flat']],sweep:[['overhead','vert'],['slash','diag'],['thrust','high']]}},
  // the blow's context: a man off balance is pressed (the body drives further in and leans into him); a man off balance himself
  // overbalances after it (carried on further, leaning, lower); a man badly hurt is slower to draw back and to come back; a Master's
  // flick of the blade after a kill (its time after the follow-through, the hand [forward, down] in arm lengths, the blade's angle)
  press:{drive:6,lean:.05},stumble:{carry:12,lean:.12,crouch:-.05},hurt:{wind:1.12,recover:1.15},
  flick:{t:.13,hand:[.42,.34],w:1.25,tilt:.06},
};
// the attack's numbers for this fighter: ATTACK with his rank's changes (skillAttack) and his style's over them
function attackTable(A){const st=animStyleOf(A),B=skillAttack(A);if(!st.attack)return B;
  if(st._atkFrom!==st.attack){st._atk={};st._atkFrom=st.attack;}const k=B===ATTACK?'':skillMix(A).key;
  return st._atk[k]||(st._atk[k]=animMerge(B,st.attack));}
// the body's form at the impact, and the windup and strike time factors, for this blow (V: its variant, whose own form, if it has one,
// is laid over the blow's: variantForm)
function attackForm(K,T,kind,sweep,thrust,butt,gnd,V){const F=K.form,over=kind==='overhead',pas=T.passing;
  const r={lean:gnd?F.ground.lean:sweep?F.sweep.lean:over?F.overhead.lean:thrust?(pas?F.passing.lean:F.thrust.lean):butt?F.butt.lean:F.slash.lean,
    crouch:gnd?F.ground.crouch:sweep?F.sweep.crouch:thrust?(pas?F.passing.crouch:F.thrust.crouch):over?F.overhead.crouch:F.slash.crouch,
    reach:T.reach||(gnd&&thrust?F.ground.reach:thrust?(pas?F.passing.reach:F.thrust.reach):butt?(T.key==='haft'?F.butt.haft:F.butt.reach):sweep?F.sweep.reach:over?F.overhead.reach:F.slash.reach),
    wind:sweep?F.sweep.wind:over?F.overhead.wind:thrust?F.thrust.wind:butt?F.butt.wind:F.slash.wind,
    strike:over?F.overhead.strike:thrust?F.thrust.strike:butt?F.butt.strike:sweep?F.sweep.strike:F.slash.strike};
  if(V&&V.form){const X=variantForm(K,kind,V);r.lean=X.lean;r.crouch=X.crouch;if(!T.reach&&X.reach!=null)r.reach=X.reach;r.wind=X.wind;r.strike=X.strike;}
  return r;}
// A variant's form over the blow's own: the regular variant's difference from the regular blow (ATTACK), laid over his own numbers for
// the blow, so a Novice's level cut is still a Novice's. (A style changes the blow's own forms; the variants' are everyone's.)
function variantForm(K,kind,V){const own=K.form[kind];if(!V||!V.form)return own;const X0=ATTACK.form[V.form],B0=ATTACK.form[kind];if(!X0)return own;
  const o={...own};
  for(const k in X0){const x=X0[k],a=own[k],b=B0[k];
    if(typeof x==='number')o[k]=typeof a==='number'&&typeof b==='number'?a+(x-b):x;
    else if(Array.isArray(x))o[k]=Array.isArray(a)&&Array.isArray(b)?a.map((v,i)=>v+(x[i]-b[i])):x;}
  return o;}

// ---------- styles ----------
// An animation style is its own pace and a set of changes to the guard, the named poses and the attack. A fighter has one: f.animStyle,
// a key of ANIM_STYLE ('tactical' for Kael, sk_style.js; 'regular' for everyone else) unless a feature or a test sets it. It is
// animation only: the dice, the damage, the tempo, the footing and the AI never read it.
//   moves   multipliers on the attack's numbers (each one explained with the tactical style, sk_style.js); full: the skill at which the
//           style's moves are all there (below it they fade back toward the regular ones, which a novice's arms keep)
//   guard   changes to the weapon's GUARD entry: hand (hx times this), up (hy less this, in arm lengths), off and offUp (the free hand,
//           the same way), crouch and lean (added), stance (sf and sb times this), w and gw (the blade's angles, added)
//   pose    {body:{name:changes}, arm:{name:changes}}: fields laid over the named poses (POSE)
//   attack  changes laid over ATTACK, merged a level at a time ({form:{slash:{lean:.24}}} changes the cut's lean and nothing else)
//   look    the glance round the room after a kill (sk_style.js)
const ANIM_MOVES={amp:1,cock:1,wind:1,strike:1,follow:1,reach:1,recover:1,tail:.42};
const ANIM_STYLE={regular:{name:'Regular',moves:ANIM_MOVES}};
Object.defineProperty(Fighter.prototype,'animStyle',{configurable:true,get(){return this._anim!==undefined?this._anim:this.tactical?'tactical':'regular';},set(v){this._anim=v;}});
function animStyleOf(f){const st=f&&ANIM_STYLE[f.animStyle];return st&&st.on!==false?st:ANIM_STYLE.regular;}
function animMerge(a,b){if(b===null||typeof b!=='object'||Array.isArray(b)||a===null||typeof a!=='object'||Array.isArray(a))return b;
  const o={...a};for(const k in b)o[k]=k in a?animMerge(a[k],b[k]):b[k];return o;}
function stylePose(f,part,name){const p=animStyleOf(f).pose;return p&&p[part]&&p[part][name]||null;}
// the style's pace for this blow: its moves, faded toward the regular ones below its full skill, and his rank's over them where the
// style is not all in (skillMix). The lash is not a quick economical stroke: its chain needs the regular time to run out, so it keeps
// the regular pace.
function styleMoves(f,T){const R=ANIM_MOVES;if(!f||(T&&T.lash))return R;
  const st=animStyleOf(f),P=st.moves;let o=R;
  if(P&&P!==R){if(!st.full||st.full<=1)o=P;else{const m=clamp((f.skill-1)/(st.full-1),0,1);if(m>=1)o=P;else if(m>0){o={};for(const k in R)o[k]=lerp(R[k],P[k]??R[k],m);}}}
  const sm=skillMix(f);if(!sm.w)return o;const SP=ANIM_SKILL[sm.k].moves,r={};
  for(const k in R)r[k]=o[k]*lerp(1,SP[k]??1,sm.w);return r;}
// the guard: the weapon's GUARD entry at his rank (skillGuard) with the style's changes
function styleGuard(f){const g=skillGuard(f),k=animStyleOf(f).guard;if(!k)return g;
  const o={...g,hx:g.hx*(k.hand??1),hy:g.hy-(k.up??0),off:g.off?[g.off[0]*(k.off??1),g.off[1]-(k.offUp??0)]:g.off,crouch:g.crouch+(k.crouch??0),lean:g.lean+(k.lean??0),
    sf:g.sf*(k.stance??1),sb:g.sb*(k.stance??1)};
  if(k.w!=null)o.w=g.w+k.w;if(k.gw!=null)o.gw=g.gw+k.gw;return o;}
// the windup: W is the form's {hand,ang}; a style with less cock turns the blade back less from the strike angle theta
function styleWind(A,T,W,theta){const k=styleMoves(A,T).cock;if(k===1||!W)return W;
  return{hand:W.hand,ang:theta+(W.ang-theta)*k};}
// the follow-through: F is the form's {hand,ang}; the hand covers only reach of the way from the impact hand to it, and the blade turns
// that much as far. A fumble stays as sloppy as ever.
function styleFollow(A,T,F,theta,impHand,out){const k=styleMoves(A,T).reach;if(k===1||out==='fumble')return F;
  return{hand:{fn:()=>{const a=A.resolve(impHand),b=A.resolve(F.hand);return{x:lerp(a.x,b.x,k),y:lerp(a.y,b.y,k)};}},ang:theta+(F.ang-theta)*k};}

// ---------- skill ----------
// His rank in the motion. The regular motion is a Veteran's (skill 3); a Novice's changes are all there at skill 1 and half at 2, a
// Master's half at 4 and all at 5, and a style's own motion takes the rank's place as it comes in (a man in a style moves as the style
// has it). The planners already scale the times and the windup's size with skill (planAttack's spd and amp) and the motors answer
// sooner and steadier the better he is (controlAndForces); this is the shape. A Novice swings with his arm and not his body, cocks the
// blade far back, lets the free hand fly and the head drop, overswings and stumbles on after it, and holds his guard high, stiff and
// square; he flinches back from a blow he blocks, and a blow he takes knocks him about more and for longer. A Master loads the hips and
// drives the blow from them, keeps the free hand up and the head still, stops the blade and is back on guard at once, low and wide.
// Animation only: the dice, the tempo, the footing and the AI never read it.
//   moves   multipliers on the pace, as a style's (ANIM_MOVES): cock and reach are the windup's and the follow-through's size
//   guard   changes to his weapon's guard, as a style's: hand (hx times), up (hy less, arm lengths), off and offUp (the free hand the
//           same way), crouch and lean (added), stance (sf and sb times), w (the blade's angle, added)
//   pose    {body:{name:{field:value}}, arm:{...}}: the named poses' fields move toward these
//   attack  ATTACK's numbers move toward these (the same shape: only numbers ATTACK has)
//   hit     a blow taken: time, the reaction's length times this
const ANIM_SKILL={
  novice:{
    moves:{cock:1.15,follow:1.15,reach:1.22,recover:1.2,tail:1.35},
    guard:{hand:.9,up:.1,w:-.28,off:.75,offUp:-.14,crouch:.035,lean:-.05,stance:.8},
    pose:{body:{block:{lean:-.16,crouch:.88},blockLow:{lean:-.12},blockGive:{lean:-.1},slip:{lean:-.16,crouch:.84},stepBack:{lean:-.5},duck:{crouch:.56,lean:.4},
        hitHead:{lean:-.5},hitHeadStagger:{lean:-.34},hitBody:{lean:.74,crouch:.64},hitLeg:{crouch:.44},hitSide:{lean:-.3},hitHeadTurn:{lean:-.24},
        hitBodyBack:{lean:-.4},run:{lean:.22,crouch:.9}},
      arm:{block:{tilt:-.3},slip:{off:[.34,-.24],tilt:-.25},evade:{off:[.36,-.3],tilt:-.32},duck:{off:[.3,-.1]},hitHead:{off:[.4,-.5]}}},
    attack:{form:{slash:{lean:.08,crouch:.85,wLean:0},thrust:{lean:.14,crouch:.82},overhead:{lean:.18,crouch:.84,wLean:-.06},sweep:{lean:.24,crouch:.7}},
      drawBack:3,drive:[6,8],fLean:.17,fCrouch:-.07,carry:[30,22],
      off:{wind:[.5,-.32],impact:[.24,.66],follow:[.46,.22]},tilt:{wind:.14,impact:.26,follow:.22}},
    hit:{time:1.2}},
  master:{
    moves:{cock:.95,follow:.9,reach:.86,recover:.88,tail:.8},
    guard:{hand:1.05,up:-.03,off:1.2,offUp:.14,crouch:-.03,lean:.03,stance:1.12},
    pose:{body:{block:{lean:.02,crouch:.8},slip:{lean:-.02,crouch:.78},stepBack:{lean:-.26},duck:{crouch:.64,lean:.26},
        hitHead:{lean:-.28},hitHeadStagger:{lean:-.16},hitBody:{lean:.5,crouch:.76},hitLeg:{crouch:.58},hitSide:{lean:-.14},run:{lean:.12,crouch:.82}},
      arm:{block:{tilt:0},slip:{off:[.1,.14],tilt:-.04},evade:{off:[.1,.12],tilt:-.08}}},
    attack:{form:{slash:{lean:.25,crouch:.76,wLean:-.12},thrust:{lean:.3,crouch:.72,wLean:-.1},overhead:{lean:.36,crouch:.76,wLean:-.18},sweep:{lean:.36,crouch:.6}},
      drawBack:12,drive:[16,17],fLean:.02,carry:[12,4],
      off:{wind:[.34,0],impact:[.04,.12],follow:[.06,.16]},tilt:{wind:-.07,impact:.03,follow:.02}},
    hit:{time:.85}}};
// how much of a style's own motion is in: none for the regular motion, all of it from the style's full skill
function styleMix(f){const st=animStyleOf(f);if(st===ANIM_STYLE.regular)return 0;return st.full>1?clamp(((f.skill??3)-1)/(st.full-1),0,1):1;}
// the rank's share in his motion: k the end it leans to, w how far (0 for a Veteran, or for a man in his own style), key for the caches
function skillMix(f){const s=f&&f.skill!=null?f.skill:3,k=s<3?'novice':'master',w=f?clamp(Math.abs(s-3)/2,0,1)*(1-styleMix(f)):0;
  return{k,w,key:w?k+':'+w.toFixed(3):''};}
// a's numbers moved w of the way toward b's (b: any part of a's shape; what a does not have is left out)
function animLerp(a,b,w){
  if(typeof b==='number')return typeof a==='number'?a+(b-a)*w:a;
  if(Array.isArray(b))return Array.isArray(a)?a.map((x,i)=>typeof b[i]==='number'&&typeof x==='number'?x+(b[i]-x)*w:x):a;
  if(b&&typeof b==='object'&&a&&typeof a==='object'&&!Array.isArray(a)){const o={...a};for(const k in b)if(k in a)o[k]=animLerp(a[k],b[k],w);return o;}
  return a;}
const SKILL_C={guard:{},body:{},arm:{},atk:{}};
// the weapon's guard at his rank (kept: the same object every time for the same weapon and rank)
function skillGuard(f){const g=GUARD[f.weaponKey]||GUARD.sword,m=skillMix(f);if(!m.w)return g;
  const key=f.weaponKey+'|'+m.key,c=SKILL_C.guard[key];if(c&&c.g===g)return c.v;
  const k=ANIM_SKILL[m.k].guard,w=m.w,v={...g,hx:g.hx*lerp(1,k.hand??1,w),hy:g.hy-(k.up??0)*w,off:g.off?[g.off[0]*lerp(1,k.off??1,w),g.off[1]-(k.offUp??0)*w]:g.off,
    crouch:g.crouch+(k.crouch??0)*w,lean:g.lean+(k.lean??0)*w,sf:g.sf*lerp(1,k.stance??1,w),sb:g.sb*lerp(1,k.stance??1,w)};
  if(k.w!=null)v.w=g.w+k.w*w;if(k.gw!=null)v.gw=g.gw+k.gw*w;
  SKILL_C.guard[key]={g,v};return v;}
// the named pose at his rank
function skillPose(f,part,name,P){const m=skillMix(f);if(!m.w)return P;const ch=ANIM_SKILL[m.k].pose[part][name];if(!ch)return P;
  const C=SKILL_C[part],key=name+'|'+m.key;return C[key]||(C[key]=animLerp(P,ch,m.w));}
// ATTACK at his rank
function skillAttack(A){const m=skillMix(A);if(!m.w)return ATTACK;return SKILL_C.atk[m.key]||(SKILL_C.atk[m.key]=animLerp(ATTACK,ANIM_SKILL[m.k].attack,m.w));}
// a blow taken: how long the reaction lasts at his rank, as a factor
function hitTime(f){const m=skillMix(f);return m.w?lerp(1,ANIM_SKILL[m.k].hit.time,m.w):1;}

// ---------- poses for a fighter ----------
// the named pose, at his rank (skillPose) and with his style's changes
function poseB(f,name){const P0=POSE.body[name];if(!P0)throw new Error('no body pose '+name);const P=skillPose(f,'body',name,P0),c=stylePose(f,'body',name);return c?{...P,...c}:P;}
function poseA(f,name){const P0=POSE.arm[name];if(!P0)throw new Error('no arm pose '+name);const P=skillPose(f,'arm',name,P0),c=stylePose(f,'arm',name);return c?{...P,...c}:P;}
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

// ---------- variety ----------
// The animation's own dice, drawn from the seed the blow was thrown with (res.seed): picking a variant, a combo or a way of taking a
// blow never touches the game's dice (Math.random, S.rng), so it changes nothing the rules or the AI read, and the same blow plays the
// same however it is watched. S.animForce {variant, combo} sets them for a check or a still (sk_anim_test.js, uiwork/anim/moves.js).
function animDice(res,salt){return mulberry32((hash32(salt+'|'+((res&&res.seed)|0))^0x6a09e667)>>>0);}
// a blow started this soon (seconds) after his last one ended goes on from where that one left the blade
const ANIM_CHAIN=.7;
// the techniques whose motion is the blow's own, which can come in its variants and open with a combo (the others have a shape of
// their own: the butt and the pommel, the lash, the kicks, the flourishes, the two-target strokes, a blow at a man on the floor ...)
const VARIANT_KEYS=['std','running','lowcut','hook','shaftsweep'];
function variantOK(A,D,kind,T){return!!(A&&T&&ATTACK.variant[kind]&&VARIANT_KEYS.includes(T.key)&&!T.lash&&!T.kick&&!T.multi&&!T.flair&&!T.ground&&
  !T.into&&!T.passing&&!(T.along!=null&&T.along<0)&&!A.mount&&!(A.wp&&A.wp.gun));}
// where his last blow left the blade ('high', 'mid', 'low'), while it is still close enough to go on from
function lastEnd(A){const L=A.animLast;if(!L||!L.act)return null;return A.action===L.act||S.t-(L.act.t0+L.act.end)<ANIM_CHAIN?L.end:null;}
function variantWeight(A,kind,v,last,chain){
  let w=v.w;const wp=A.wp;
  if(v.sk&&(A.skill||1)<v.sk)return 0;
  if(v.fam&&!v.fam.includes(wp.fam))return 0;
  if(v.curved&&!wp.curved)return 0;
  if(v.wsk)w*=lerp(v.wsk[0],v.wsk[1],A.sk);
  // the same one again straight after: seldom; one that starts where the last left the blade: often
  if(last&&last.kind===kind&&last.key===v.key)w*=.35;
  if(chain&&v.from)w*=v.from===chain?3.5:.6;
  return Math.max(0,w);}
// the blow's variant (null: a technique with a shape of its own)
function blowVariant(A,D,kind,T,res){
  const L=ATTACK.variant[kind];if(!L||!variantOK(A,D,kind,T))return null;
  const F=S.animForce;if(F&&F.variant){const v=L.find(x=>x.key===F.variant);if(v&&variantWeight(A,kind,v,null,null)>0)return v;}
  const last=A.animLast,chain=lastEnd(A),ws=L.map(v=>variantWeight(A,kind,v,last,chain)),sum=ws.reduce((s,x)=>s+x,0);if(sum<=0)return L[0];
  let r=animDice(res,'variant')()*sum;for(let i=0;i<L.length;i++){r-=ws[i];if(r<=0)return L[i];}return L[L.length-1];}
// where a blow leaves the blade, for the next to go on from
function blowEnd(kind,T,V){return V&&V.end?V.end:T&&T.rising?'high':kind==='thrust'?'mid':'low';}

// ---------- combos ----------
// A skilled man's way into a guard: a lead or two that the man parries, then the blow itself. The exchange's dice are the blow's; the
// leads are only motion (the man always gets his blade to them), so a combo changes nothing the rules read.
function comboRoom(A,D,opts){return!!(A&&D&&!D.dead&&!D.downed&&!D.broken&&!D.clinch&&!A.clinch&&!A.mount&&!D.mount&&!D.npc&&!(D.wp&&D.wp.gun)&&
  D.react!=='hinge'&&D.react!=='toll'&&!(typeof shortOn==='function'&&(shortOn(A)||shortOn(D))));}
// a blow of the blow's own shape, or a spin (the lead parried, he turns on round out of it into the blow)
function comboOK(A,D,kind,T,opts){return!!(ATTACK.combo.leads[kind]&&(variantOK(A,D,kind,T)||(T&&T.flair==='spin'&&!T.multi&&!T.lash&&!T.kick&&!T.ground&&!A.mount))&&comboRoom(A,D,opts));}
// the leads, [{kind, V, beat}] (null: none). Beat and thrust is always one: the beat on his blade that it is named for.
function blowCombo(A,D,kind,T,res,opts){
  const C=ATTACK.combo,F=S.animForce,find=(k,v)=>(ATTACK.variant[k]||[]).find(x=>x.key===v)||null;
  if(T&&T.beat&&T.key==='beatthrust'&&kind==='thrust')return comboRoom(A,D,opts)?[{kind:'slash',V:find('slash','snap'),beat:true}]:null;
  if(!comboOK(A,D,kind,T,opts))return null;
  if(F&&F.combo)return F.combo.map(s=>{const p=String(s).split(':');return{kind:p[0],V:find(p[0],p[1]||'')};}).filter(l=>ATTACK.variant[l.kind]);
  // (a follow-up straight off an opening is quicker: a lead less often, and never two)
  const r=animDice(res,'combo'),s=clamp(Math.round(A.skill||1),1,5)-1,q=opts&&opts.quick;if(r()>=C.chance[s]*(q?C.quick:1))return null;
  const n=!q&&r()<C.more[s]?2:1,L=C.leads[kind],out=[];
  for(let i=0;i<n;i++){const p=L[Math.floor(r()*L.length)];out.push({kind:p[0],V:find(p[0],p[1])});}
  return out;}
// The leads' motion, from Tw0 (where the blow's own windup would have started): each one's windup, its strike at the point where his
// parry meets it, and the rebound off the parry; after the last the blow's own windup starts. c: the blow's plan so far (planAttack)
function comboPlan(A,D,leads,c){
  const C=ATTACK.combo.lead,fa=c.fa,arm=A.arm,K=c.K,n=leads.length,hits=[],body=[],armK=[],events=[],r=c.rnd,len=A.wp.len;
  let t=c.Tw0;
  for(let j=0;j<n;j++){
    const {kind,V,beat}=leads[j],thrust=kind==='thrust',sweep=kind==='sweep',Bt=beat?ATTACK.combo.beat:null;
    const LT={kind,key:'std',along:null,rising:false,descend:false,windCap:null,amp:1,lash:false,ang:null,anchor:null,kick:false};
    const fm=variantForm(K,kind,V),WL=t+c.tWind*(Bt?Bt.wind:C.wind*(j?C.next:1)),IL=WL+c.tStrike*(Bt?Bt.strike:C.strike*(thrust?.9:1)),RB=IL+C.rebound,px=c.strikeX-fa*C.back*(n-j);
    // where his parry meets it: in front of him, at the height it goes for (fixed where it will be once he is on his spot); a beat goes
    // for his blade itself, near the hilt
    const sdx=D.station-D.p[PEL].x,an=anchorFor(D,LT,kind)(),hf=D.p[HAF],tp=D.p[TIP];
    const B=beat?{x:lerp(hf.x,tp.x,.35)+sdx,y:lerp(hf.y,tp.y,.35)}:{x:an.x+sdx-fa*(14+D.body.bulk*4)+(r()*2-1)*3,y:an.y-(sweep?0:2)+(r()*2-1)*4};
    const th=thetaAt(A,LT,kind,B,fa,px,fm.lean,fm.crouch,c.zS)+(V&&V.ang||0),at=len*(thrust?.9:.62),hand={w:{x:B.x-fa*Math.cos(th)*at,y:B.y-Math.sin(th)*at}};
    const W=windupFor(LT,kind,arm,c.amp*C.amp,th,A,V);
    body.push({t:WL,v:{px:px-fa*K.drawBack*.5,crouch:fm.wCrouch,lean:fm.wLean,...c.stn(K.wStance),th:.2},e:eOut},
      {t:IL,v:{px,crouch:fm.crouch,lean:fm.lean,...c.stn(fm.stance),th:.12},e:eIn},
      {t:RB,v:{px:px-fa*3,crouch:fm.crouch+.02,lean:fm.lean-.06,...c.stn(fm.stance),th:.12}});
    armK.push({t:WL,v:{hand:W.hand,wAng:W.ang,off:c.offW,tilt:c.KA.wind},e:eOut},
      {t:IL,v:{hand,wAng:th,off:c.offI,tilt:c.KA.impact},e:eIn},
      {t:RB,v:{hand:{w:{x:hand.w.x-fa*.14*arm,y:hand.w.y-.06*arm}},wAng:th-.4,off:c.offW,tilt:c.KA.wind},e:eOut});
    hits.push({IL,B,theta:th,kind,beat:!!beat});
    const seed=(c.seed+j*7919)>>>0;
    events.push({t:WL+c.tStrike*C.strike*.2,fn:()=>S.hooks.sound('swoosh',A.wp.mass*.8)},{t:IL,fn:()=>leadClash(A,D,B,fa,seed)});
    t=RB+C.gap;}
  return{span:t-c.Tw0,body,arm:armK,hits,events,fa,leads:leads.map(l=>l.kind+(l.V?':'+l.V.key:''))};}
// The man parries each lead where it meets him, then answers the blow itself as he was going to (R: that answer, from planReaction or
// an elf's evasion): his keys from the last lead on.
function comboReact(D,A,P,R,snap){
  if(!P||!R||!P.hits||!P.hits.length||D.dead||D.downed)return R;
  const fa=P.fa,H=P.hits,L=D.wp.len*.55,body=bodyKeys(D,[[0,snap?'now':'guard']]),arm=armKeys(D,[[0,snap?'now':'guard']]);
  let prev=0;
  for(let i=0;i<H.length;i++){const h=H[i],nx=H[i+1];
    const u={x:fa*Math.cos(h.theta),y:Math.sin(h.theta)};let pv={x:-u.y,y:u.x};if(pv.y>0)pv={x:-pv.x,y:-pv.y};if(h.B.y>D.p[PEL].y-4)pv={x:-pv.x,y:-pv.y};
    const wl=Math.atan2(pv.y,D.facing*pv.x),Ts=Math.max(prev+.03,h.IL-lerp(.16,.26,D.sk)),at={x:h.B.x-pv.x*L,y:h.B.y-pv.y*L},Tg=nx?Math.min(h.IL+.1,nx.IL-.16):h.IL+.1;
    if(Ts<h.IL-.04){body.push(...bodyKeys(D,[[Ts,'guard']]));arm.push(...armKeys(D,[[Ts,'guard']]));}
    if(h.beat){const a=D.arm,g=()=>D.guardArm();
      // a beat: his blade held where it is and knocked down and aside, then brought back up for the blow
      body.push(...bodyKeys(D,[[h.IL,'guard'],[h.IL+.1,'blockGive',sstep]]));
      arm.push(...armKeys(D,[[h.IL-.01,'guard'],[h.IL+.07,()=>{const G=g(),hh=D.resolve(G.hand);return{...G,hand:{w:{x:hh.x+fa*.12*a,y:hh.y+.22*a}},wAng:G.wAng+.75};},eOut]]));
      prev=h.IL+.12;continue;}
    body.push(...bodyKeys(D,[[h.IL,h.kind==='sweep'?'blockLow':'block',eOut],[Math.max(h.IL+.04,Tg+.02),'blockGive',sstep]]));
    arm.push(...armKeys(D,[[h.IL-.01,'block',{hand:{w:at},wAng:wl},eOut],[Math.max(h.IL+.03,Tg),'block',{hand:{w:{x:at.x+fa*5,y:at.y+2}},wAng:wl+.08},eOut]]));
    prev=Math.max(h.IL+.04,Tg+.02);}
  const tEnd=prev+.04,keep=k=>k.t>tEnd+1e-6;
  body.push(...bodyKeys(D,[[tEnd,'guard',sstep]]),...R.body.filter(keep));arm.push(...armKeys(D,[[tEnd,'guard',sstep]]),...R.arm.filter(keep));
  body.sort((a,b)=>a.t-b.t);arm.sort((a,b)=>a.t-b.t);
  return{...R,body,arm,end:Math.max(R.end||0,tEnd+.2)};}
// a lead meets his parry: the ring of it, the blades knocked apart, a beat of hit-stop (the sparks from the animation's dice)
function leadClash(A,D,B,fa,seed){if(A.dead||D.dead||D.downed||S.warming)return;
  const r=mulberry32(seed);flash(B,16,'#cfeaff',D.dep);sparksBy(B,8,'#fff3cf',D.dep,r);
  for(const i of [TIP,HAF]){const q=A.p[i],k=(i===TIP?170:80)*DT;q.px+=fa*k;q.py+=k*.3;}
  for(const i of [TIP,HAF]){const q=D.p[i];q.px-=fa*60*DT;}
  S.freeze=Math.max(S.freeze,.022);S.shake=Math.max(S.shake,1.6);S.hooks.sound('clang',.55);}
function sparksBy(c,n,color,d,r){for(let i=0;i<n;i++){const a=-Math.PI/2+(r()-.5)*2.9,s=140+r()*320;
  S.sparks.push({x:c.x,y:c.y,d:d||0,vx:Math.cos(a)*s,vy:Math.sin(a)*s,age:0,life:.22+r()*.3,color});}}
// ===== ANIM END =====
