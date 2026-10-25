// ===== WIRE DRILL (test) START =====
// The style trial's second sword style, built on the style layer (ANIM_STYLE, sk_anim.js) to see whether two styles of the same
// weapon read as two different fighters. Animation only, as every style is: the dice, the tempo and the AI do not change.
//
// The Sareth cut is Kael's motion today (the 'tactical' style, sk_style.js): thirty years of Eclipsera enforcement, economy of
// motion, a tight guard, short windups, a small follow-through and a quick return, and a glance round the room after every kill.
// The Wire drill is Noon Company's drill from the Confederacy's border wire in the 2270s, where he was a Ranger: a line held across
// open sand. The blade is out on the line between him and the man, the feet wide and low in the sand, the free hand back at the hip;
// every cut is thrown whole from the shoulder and carried through, the lunge is long, and the finish is held a beat before the blade
// comes back onto the line.
ANIM_STYLE.wire={name:'Wire drill',full:3,
  // a bigger windup with the blade cocked further back, a fast strike, a long follow-through carried further, a slower return and a
  // held guard after
  moves:{amp:1.2,cock:1.25,wind:1.08,strike:.88,follow:1.35,reach:1.3,recover:1.2,tail:.7},
  // the guard: the blade out level on the line and the hand well forward, the free hand back and raised behind him, the stance wide
  // and low, the back straight
  guard:{hand:1.4,up:-.02,off:-.5,offUp:.3,crouch:-.1,lean:-.05,stance:1.5,w:.62},
  // the run in: low, the weight forward
  pose:{body:{run:{crouch:.8,lean:.26,sf:.36,sb:-.38},burst:{crouch:.74,lean:.38},stalk:{crouch:.8,lean:.2}}},
  attack:{
    // a long lunge at the impact, and the body drawn well back in the windup
    form:{slash:{lean:.3,crouch:.72,reach:.76,stance:[.6,-.5],wLean:-.18,wCrouch:.78},
      thrust:{lean:.38,crouch:.66,reach:1,stance:[.7,-.52],wLean:-.12,wCrouch:.78},
      overhead:{lean:.42,crouch:.72,stance:[.58,-.5],wLean:-.24,wCrouch:.78},
      sweep:{crouch:.56,stance:[.64,-.5],wCrouch:.66}},
    wStance:[.4,-.46],drawBack:16,drive:[18,20],carry:[30,14],fLean:.12,fCrouch:-.06,fStance:[.62,-.5],
    // the cut cocked back behind the shoulder, the point chambered at the hip, the overhead taken right back
    windup:{slash:{hand:[-.3,-.5],w:-2.75},thrust:{hand:[-.6,.24]},overhead:{hand:[-.16,-1.04],w:-3.05}},
    // and carried through
    follow:{slash:{hand:[.66,.44],turn:1.6},overhead:{hand:[.66,.78],turn:1.2},sweep:{hand:[.62,.6],turn:-.9}},
    // the free hand thrown back behind him for balance through the lunge
    off:{wind:[-.3,.3],impact:[-.45,.15],follow:[-.35,.3]},
    tilt:{wind:-.1,impact:.16,follow:.14}}};
// ===== WIRE DRILL (test) END =====
