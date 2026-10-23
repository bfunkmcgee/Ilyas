// ===== CAST START =====
// The restaurant's people. Every named enemy is an elf; the crews that come through the doors are humans. In the canon an elf is
// much stronger than a human, and here that is in the bodies and the ranks: each elf has a build of his or her own, taller than any
// crew member, no named elf fights below Trained, and the elf who leads a room not below Veteran. A crew member's body still comes
// from his seed, but between 160 and 176 cm and on the heavy side. Kael and Amri are not part of this.
// cm: height; bulk: build; min: the lowest rank they fight at (Mr. Hallowell never fights)
const ELVES={
  Qadir:{cm:192,bulk:1.26,min:3},Brask:{cm:194,bulk:.95,min:2},Iyla:{cm:180,bulk:.92,min:2},
  Orrin:{cm:196,bulk:1.36,min:3},Hesk:{cm:195,bulk:.86,min:2},Odile:{cm:178,bulk:.88,min:2},
  Sable:{cm:196,bulk:1,min:3},Doran:{cm:193,bulk:1.38,min:2},Kessa:{cm:186,bulk:.92,min:2},
  Kade:{cm:198,bulk:1.18,min:3},'Mr. Hallowell':{cm:185,bulk:1.08,min:1}};
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
// ===== CAST END =====
