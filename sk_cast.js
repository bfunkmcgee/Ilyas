// ===== CAST START =====
// The restaurant's people. Every named enemy is an elf; the crews that come through the doors are humans. In the canon an elf is
// much stronger than a human, and here that is in the bodies and the ranks: each elf has a build of his or her own, taller than any
// crew member, no named elf fights below Trained, and the elf who leads a room not below Veteran. A crew member's body still comes
// from his seed, but between 160 and 176 cm and on the heavy side. Kael and Amri are not part of this.
// cm: height; bulk: build; min: the lowest rank they fight at (Mr. Hallowell never fights). Since Nov 9 the heights run from 178 to
// 208 (they ran to 198): Orrin and Kade stand taller, Doran and Kessa a little shorter, so that a height is something to tell them
// by. (Brask was tried at 200 and put back: the seeded dining-room fights two suites are built on went another way.) How much of a build shows in the outline, and each one's own shape, are the look's (sk_castui.js: HEFT, shape).
const ELVES={
  Qadir:{cm:192,bulk:1.26,min:3},Brask:{cm:194,bulk:.95,min:2},Iyla:{cm:180,bulk:.92,min:2},
  Orrin:{cm:204,bulk:1.36,min:3},Hesk:{cm:195,bulk:.86,min:2},Odile:{cm:178,bulk:.88,min:2},
  Sable:{cm:196,bulk:1,min:3},Doran:{cm:190,bulk:1.38,min:2},Kessa:{cm:182,bulk:.92,min:2},
  Kade:{cm:208,bulk:1.18,min:3},'Mr. Hallowell':{cm:185,bulk:1.08,min:1}};
const HUMAN_BUILD={cm:[160,176],bulk:[1.04,1.34]};
function isElf(f){return!!f&&f.team===1&&!f.hench&&!!ELVES[f.name];}
function isHuman(f){return!!f&&f.team===1&&!!f.hench;}
function elfMin(name){return ELVES[name]?ELVES[name].min:1;}
function bodyHeight(b){return(b.th+b.sh+b.torso+b.neck+b.headR)*1.23;}
// the seed's body brought to a height and build: lengths scale with the height, widths and mass with the build
function rebuild(b,cm,bulk){const kh=cm/bodyHeight(b),kb=bulk/b.bulk;
  for(const k of ['torso','neck','headR','ua','fa','th','sh'])b[k]*=kh;
  b.h*=kh;b.limbW*=kb;b.torsoW*=kb;b.bulk=bulk;b.mass=b.bulk*b.h;return b;}
function castBody(f,b){
  if(isElf(f)){const e=ELVES[f.name];return rebuild(b,e.cm,e.bulk);}
  if(isHuman(f)){const R=mulberry32((f.seed||f.idx||1)*31+7),H=HUMAN_BUILD;return rebuild(b,lerp(H.cm[0],H.cm[1],R()),lerp(H.bulk[0],H.bulk[1],R()));}
  return b;}
S.hooks.body=castBody;
S.hooks.skill=(f,s)=>isElf(f)?Math.max(s,elfMin(f.name)):s;
// ---------- how each of them stands (since Nov 9) ----------
// Standing easy in a scene (easyBody and easyArm, sk_story.js) asks standOf(f) who he is. Carriage tells one figure from the next at
// a size where a face cannot (uiwork/look/lineup.js shows it): an elf stands tall and still, legs straight and heels close, chin
// level or over it, and each named elf has a way of his or her own within that, from what the cast's table says of them (CAST in
// sk_castui.js: the role and the temper). A human of a crew stands as his work has left him, knees soft, weight forward, never quite
// still, and no two of a crew alike: his body's own slouch and width of stance come from his seed, and so does what his free hand does.
// hip: how high the hips ride, and top: how high they may (pelvisY, sk_core.js: a fighting pose stops at .96 of the leg, where the
// knees are still well bent; 1.03 stands him up straight); lean: the trunk forward (+) or back; feet: the front foot and the back foot
// from under the hips, in leg lengths (hip and feet together must leave the back leg short of straight: from hip to foot it is
// about hip less .04, more as the feet part, and a heavy man's hips ride a little under what is asked); settle: how far a foot may stand from its mark before he moves it (a small one brings his
// feet in under him when he stops); chin: the head forward and down (+) or up and back; hand: the weapon hand from the shoulder, in
// arm lengths [forward, down], and blade: how the weapon hangs from it (a long one is raised until its point clears the floor); off:
// the free hand (offs: a crew's ways, one to a man by his seed); sway: how much he shifts and breathes (0: stock still); seed: how
// much of his body's own slouch (body.posture) goes into the lean; wide: his feet also take his body's own width of stance
// (body.stance).
// STAND0 is how everyone stood before, and how anyone not named here still does: the Pit's people, the beasts, and Kael while an
// arm is gone (his own way comes back with the arm). The named are keyed by the name shown; the hero's entry is Kael, the code's
// own word for him.
const STAND0={hip:.97,top:.96,lean:.02,feet:[.12,-.14],settle:.25,chin:0,hand:[.1,.92],blade:1.25,off:[-.06,.94],offs:null,sway:0,seed:.5,wide:false};
const STAND_ELF={...STAND0,hip:1.025,top:1.03,lean:-.01,feet:[.05,-.06],settle:.07,chin:-.05,hand:[.08,.93],off:[-.05,.94],seed:0};
const STAND_HUMAN={...STAND0,hip:1.015,top:1.03,lean:.09,feet:[.13,-.14],settle:.08,chin:.12,hand:[.13,.9],off:[0,.93],sway:1,wide:true};
// what a free hand does. Only a hand held close to the shoulder puts the elbow out behind him, and that is kept to a few: the
// elbow out is the strongest thing an arm can do to an outline, and everyone doing it is no one doing it
const BEHIND=[-.2,.6],ON_HIP=[.01,.5],IN_FRONT=[.26,.88],TRAILING=[-.16,.92];
const STANDS={
  // an enforcer of thirty years who was a ranger first: tall and quiet, his weight on the back leg and the other set forward, chin
  // level, both hands low and loose
  Kael:{...STAND_ELF,lean:-.03,feet:[.13,-.05],chin:0,hand:[.11,.91],off:[-.09,.93]},
  // runs the floor: planted wide, chest out, a fist on his hip
  Qadir:{...STAND_ELF,lean:-.07,feet:[.17,-.17],chin:-.1,off:ON_HIP},
  // keeps his distance: heels together, leaning away, chin high, a hand at his cravat
  Brask:{...STAND_ELF,lean:-.05,feet:[.03,-.04],chin:-.16,off:[.15,.22]},
  // gets inside a guard: knees bent, head low, the free hand already out
  Iyla:{...STAND_ELF,hip:1,lean:.15,feet:[.16,-.1],chin:.14,off:[.3,.62],sway:.6},
  // the head chef: leaning back behind his own weight, an arm across his chest
  Orrin:{...STAND_ELF,lean:-.1,feet:[.16,-.18],chin:-.04,off:[.22,.36]},
  // cold and exact: at attention, both arms straight down
  Hesk:{...STAND_ELF,lean:0,feet:[.02,-.03],settle:.05,chin:-.03,hand:[.04,.95],off:[-.02,.95]},
  // quick with a knife: slung back on one leg, a hand on her hip
  Odile:{...STAND_ELF,hip:1.025,lean:-.12,feet:[.09,-.17],chin:-.02,off:ON_HIP,sway:.4},
  // heads the lobby's detail: feet apart, the free hand held low in front
  Sable:{...STAND_ELF,feet:[.12,-.12],chin:-.04,off:IN_FRONT},
  // the heavy: a wall across the door, head down, his arms hanging clear of him
  Doran:{...STAND_ELF,hip:1.02,lean:.08,feet:[.2,-.2],chin:.16,hand:[.2,.86],off:[.14,.89]},
  // close work with a knife: coiled, one hand kept out of sight behind her
  Kessa:{...STAND_ELF,hip:1.01,lean:.07,feet:[.14,-.08],chin:.05,off:TRAILING,sway:.3},
  // the head of security: the tallest and the stillest, his chin the highest, a hand at the small of his back
  Kade:{...STAND_ELF,lean:-.04,feet:[.04,-.05],chin:-.2,off:BEHIND},
  // old money: stooped, his hands held in front of him
  'Mr. Hallowell':{...STAND_ELF,hip:1.01,lean:.2,feet:[.08,-.08],chin:.14,hand:[.2,.78],off:[.16,.82]},
  // the family's cleaner: heels together, hands folded low in front, his head a little bowed, nothing moving
  'The man in white':{...STAND_ELF,lean:.01,feet:[.03,-.03],settle:.05,chin:.08,hand:[.2,.88],off:[.17,.9]},
  // Kael's partner: easy, her weight back, one foot forward
  Amri:{...STAND_ELF,lean:-.04,feet:[.14,-.08],chin:-.01,off:[.06,.92],sway:.3}};
// the crews, by the wardrobe they wear (f.ward in the story; the restaurant's rooms in the lab)
const STAND_CREW={
  // Qadir's people off the bistro floor
  street:{...STAND_HUMAN,offs:[[0,.93],[.12,.88],TRAILING]},
  // hired men out of town: slouched, heavy on their feet
  field:{...STAND_HUMAN,hip:1.005,lean:.14,feet:[.14,-.16],chin:.16,hand:[.14,.89],seed:.6,offs:[[.02,.92],[.16,.85],TRAILING]},
  // the outriders: leaning back, a thumb in the belt
  bikers:{...STAND_HUMAN,lean:-.06,feet:[.17,-.11],chin:-.02,hand:[.1,.9],sway:.8,seed:.4,offs:[ON_HIP,[.05,.92],TRAILING]},
  // the police: at ease, a foot forward
  police:{...STAND_HUMAN,hip:1.03,lean:.02,feet:[.12,-.04],chin:.04,hand:[.09,.92],sway:.3,seed:.2,offs:[[0,.94],IN_FRONT,TRAILING]},
  // contract guards: at ease, the free hand held in front
  lobby:{...STAND_HUMAN,hip:1.03,lean:.03,feet:[.04,-.12],chin:.06,hand:[.1,.92],sway:.25,seed:.3,offs:[IN_FRONT,[-.02,.94],BEHIND]},
  // waiters: a little bowed, a hand behind the back
  dining:{...STAND_HUMAN,hip:1.03,lean:.08,feet:[.07,-.04],chin:.08,hand:[.09,.92],sway:.2,seed:.3,offs:[BEHIND,IN_FRONT,[0,.94]]},
  // cooks and porters: on their feet all night
  kitchen:{...STAND_HUMAN,hip:1.01,lean:.11,feet:[.14,-.14],chin:.12,hand:[.12,.9],sway:.8,offs:[ON_HIP,[.08,.9],[0,.93]]}};
function crewWard(f){return f.ward||(f.p2?'kitchen':f.p3?'lobby':S.arenaKey==='restaurant'?'dining':'street');}
function standOf(f){
  if(!f||f.pitCast||f.beast)return STAND0;
  if(f.team===0)return f.ally?STANDS.Amri:f.oneArm||f.armOff?STAND0:STANDS.Kael;
  if(f.hench)return STAND_CREW[crewWard(f)]||STAND_HUMAN;
  return STANDS[f.name]||(ELVES[f.name]?STAND_ELF:STAND0);}
// ===== CAST END =====
