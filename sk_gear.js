// ===== GEAR START =====
// What he wears in the Pit, as a system (since V97). Eight slots: head, body, armour, coat, hands, legs, feet and belt. Each thing has
// what it stops and what it costs him: protection against a cut, a thrust and a blunt blow over the parts of him it covers (the head,
// the body, the legs), its weight, and for some a hold of their own (grip against a disarm, footing against a sweep, snag against a
// grab). The protection takes that much off a blow that lands there (never under one); the weight he wears over GEAR_FREE makes every
// move and every step cost him more. Each of these is an entry in the rules (sk_rules.js), so the log says what his gear did.
// What he can put on: the crate's things (scene 3, all of them his from then on) and what he buys at the Shelf (scene 5: the stalls
// that sell gear, sk_pit5.js), kept in the story's flags (S.story.flags.kit: slot -> what he wears; gearOwn: what he bought). He
// changes from the crate in the back room or from the menu's Gear whenever he is walking about. What it looks like on him is the
// look's (sk_lookui.js: F.wear's head, vest and legs, and the feet and hands it already had).

const GEAR_SLOTS=['head','body','armour','coat','hands','legs','feet','belt'];
const GEAR_SLOT_NAME={head:'Head',body:'Body',armour:'Armour',coat:'Coat',hands:'Hands',legs:'Legs',feet:'Feet',belt:'Belt'};
const GEAR_ZONES=['head','body','legs'],GEAR_KINDS=['cut','thrust','blunt'];
const GEAR_ZONE_NAME={head:'Head',body:'Body',legs:'Legs'},GEAR_KIND_NAME={cut:'Cut',thrust:'Thrust',blunt:'Blunt'};
// the weight he wears before it slows him, how much more each move costs for each unit over it, and the most it can cost
const GEAR_FREE=6,GEAR_SLOW=.025,GEAR_SLOW_MAX=1.25;
// Every thing he can wear. slot; name and what (the screen's words); wt (its weight); def {cut, thrust, blunt}: what it takes off a blow
// of that kind, over cover (the parts of him it covers); grip (his defense against a disarm), footing (against a sweep), snag (against a
// grab: a coat that is hard to hold, plates that give a hand a hold); look: what it puts on the drawing (F.wear)
const GEAR={
  nohat:{slot:'head',name:'Nothing',what:'His pale hair, uncovered.',wt:0},
  cap:{slot:'head',name:'Watch cap',what:'Black wool, a docker’s. It takes the sting out of a knock.',wt:.1,def:{blunt:1},cover:['head'],look:{head:'cap'}},
  helmet:{slot:'head',name:'Quarry helmet',what:'Pressed steel from when the Pit was a quarry. The lamp bracket is empty.',wt:1.2,def:{cut:2,blunt:3},cover:['head'],look:{head:'helmet'}},
  shirt:{slot:'body',name:'Work shirt',what:'Collarless linen gone grey.',wt:.3,look:{top:'shirt'}},
  jersey:{slot:'body',name:'Knitted jersey',what:'Dark wool, darned at the elbow. Thick enough to soften a fist.',wt:.8,def:{blunt:1},cover:['body'],look:{top:'jersey'}},
  under:{slot:'body',name:'Undershirt',what:'Sleeveless. The scars and the dressing show.',wt:.2,look:{top:'under'}},
  noarmour:{slot:'armour',name:'Nothing',what:'Nothing between him and a blade.',wt:0},
  jerkin:{slot:'armour',name:'Leather jerkin',what:'A drover’s, gone stiff with age. It turns a glancing cut.',wt:2,def:{cut:1,thrust:1},cover:['body'],look:{vest:'jerkin'}},
  stabvest:{slot:'armour',name:'Stab vest',what:'Constabulary issue, the badge cut off. Panels front and back that stop a point.',wt:3.5,def:{cut:2,thrust:3,blunt:1},cover:['body'],look:{vest:'stab'}},
  tyres:{slot:'armour',name:'Tyre plates',what:'Pit-made: rounds of old tyre laced onto canvas. A club bounces off, and the laces give a hand a hold.',wt:5,def:{cut:1,blunt:3},cover:['body'],snag:-1,look:{vest:'tyre'}},
  oilcloth:{slot:'coat',name:'Oilcloth coat and scarf',short:'Oilcloth coat',what:'An orc dockhand’s coat, two sizes too big, and a rust wool scarf. Turns a knife a little.',wt:2.5,def:{cut:1,thrust:1},cover:['body'],look:{coat:'oilcloth',scarf:'rust'}},
  canvas:{slot:'coat',name:'Canvas jacket and scarf',what:'Short, stiff canvas and the rust scarf. Light.',wt:1.4,look:{coat:'canvas',scarf:'rust'}},
  scarf:{slot:'coat',name:'Scarf',what:'The rust scarf, and nothing else over it.',wt:.2,look:{scarf:'rust'}},
  nocoat:{slot:'coat',name:'Nothing',what:'Nothing over it.',wt:0},
  nohand:{slot:'hands',name:'Nothing',what:'A bare hand.',wt:0},
  glove:{slot:'hands',name:'Fingerless glove',what:'Old leather, for the left hand. The grip holds.',wt:.1,grip:1,look:{hands:'glove'}},
  wrap:{slot:'hands',name:'Wrist wrap',what:'A strip of linen round the wrist.',wt:0,look:{hands:'wrap'}},
  gauntlet:{slot:'hands',name:'Grinder’s gauntlet',what:'Split hide to the elbow. It grips like a vice, and a blade slides off the cuff.',wt:.5,grip:2,def:{cut:1},cover:['body'],look:{hands:'gauntlet'}},
  trousers:{slot:'legs',name:'Linen trousers',what:'What Tamm found him. A drawstring at the waist.',wt:.5},
  shins:{slot:'legs',name:'Shin guards',what:'Tyre rubber strapped over the trousers from the knee to the ankle.',wt:1.2,def:{cut:1,blunt:2},cover:['legs'],look:{legs:'shins'}},
  boots:{slot:'feet',name:'Work boots',what:'They nearly fit.',wt:1.6,look:{feet:'boots'}},
  dockboots:{slot:'feet',name:'Dock boots',what:'Steel toecaps and hobnails. Heavy, and they hold on wet stone.',wt:2.6,def:{cut:1,blunt:1},cover:['legs'],footing:1,look:{feet:'dock'}},
  sandals:{slot:'feet',name:'Rope sandals',what:'Light. They slap on the steps and slip on them.',wt:.3,footing:-1,look:{feet:'sandals'}},
  barefoot:{slot:'feet',name:'Barefoot',what:'The yard is cold.',wt:0,look:{feet:'bare'}},
  belt:{slot:'belt',name:'Belt and sheath',what:'The hip dagger rides at his side.',wt:.4,look:{belt:'belt'}},
  rope:{slot:'belt',name:'Rope belt',what:'The dagger goes through the knot.',wt:.1,look:{belt:'rope'}}};
for(const id in GEAR)GEAR[id].id=id;
// what the crate holds, slot by slot, in the screen's order (the first of each is what a chapter picked from the menu starts in)
const GEAR_CRATE={head:['nohat','cap'],body:['shirt','jersey','under'],armour:['noarmour','jerkin'],coat:['oilcloth','canvas','scarf','nocoat'],
  hands:['nohand','glove','wrap'],legs:['trousers'],feet:['boots','dockboots','sandals','barefoot'],belt:['belt','rope']};
// (a save from before V97 keeps the crate's choice as a place in each slot's list as the crate was then)
const GEAR_OLD={body:['shirt','jersey','under'],coat:['oilcloth','canvas','scarf','nocoat'],hands:['nohand','glove','wrap'],feet:['boots','sandals','barefoot'],belt:['belt','rope']};

// ---------- what he has and what he wears ----------
function gearFlags(){return S.story&&S.story.flags||null;}
function gearDefault(){const k={};for(const s of GEAR_SLOTS)k[s]=GEAR_CRATE[s][0];return k;}
// what he bought (each his from then on)
function gearBought(){const F=gearFlags(),L=F&&Array.isArray(F.gearOwn)?F.gearOwn:[];return L.filter(id=>GEAR[id]);}
// what he has for a slot: the crate's, then what he bought for it
function gearOwned(slot){const L=GEAR_CRATE[slot].slice();for(const id of gearBought())if(GEAR[id].slot===slot&&!L.includes(id))L.push(id);return L;}
function gearHas(id){return!!GEAR[id]&&(GEAR_CRATE[GEAR[id].slot].includes(id)||gearBought().includes(id));}
// a kit read whatever form it was kept in: slot -> an id; a place in the old lists for a save from before V97; the first otherwise
function kitRead(k){const out=gearDefault();if(!k||typeof k!=='object')return out;
  for(const s of GEAR_SLOTS){const v=k[s];
    if(typeof v==='string'&&GEAR[v]&&GEAR[v].slot===s)out[s]=v;
    else if(typeof v==='number'&&GEAR_OLD[s]){const L=GEAR_OLD[s];out[s]=L[((v%L.length)+L.length)%L.length];}}
  return out;}
function kitOf(){const F=gearFlags();return kitRead(F&&F.kit);}
function kitItem(slot,id){return GEAR[id]&&GEAR[id].slot===slot?GEAR[id]:GEAR[GEAR_CRATE[slot][0]];}
// what the look draws for a kit (pinned: Tamm has pinned the empty sleeve up), and the gear he has on (gear: its ids, which the rules read)
function kitWear(k,o={}){const K=kitRead(k),L={};for(const s of GEAR_SLOTS)Object.assign(L,GEAR[K[s]].look||{});
  return{top:L.top||'bare',coat:L.coat||null,scarf:L.scarf||null,hands:L.hands||null,feet:L.feet||'bare',belt:L.belt||null,head:L.head||null,vest:L.vest||null,legs:L.legs||null,
    bandage:(L.top||'bare')==='under'&&!L.coat,pinned:o.pinned!==false,gear:GEAR_SLOTS.map(s=>K[s])};}
// a sleeve on the right to pin up
function kitSleeve(w){return!!w&&(!!w.coat||w.top==='shirt'||w.top==='jersey');}

// ---------- what a kit does ----------
// (cached by the kit's ids: the rules ask for it on every roll; by: the things that cover each part of him against each kind of blow)
const GEAR_STAT_C={};
function gearStats(ids){const key=ids.join(',');if(GEAR_STAT_C[key])return GEAR_STAT_C[key];
  const def={};for(const z of GEAR_ZONES){def[z]={};for(const k of GEAR_KINDS)def[z][k]=0;}let wt=0,grip=0,footing=0,snag=0;const by={};
  for(const id of ids){const g=GEAR[id];if(!g)continue;wt+=g.wt||0;grip+=g.grip||0;footing+=g.footing||0;snag+=g.snag||0;
    if(g.def)for(const z of g.cover||[])for(const k of GEAR_KINDS)if(g.def[k]){def[z][k]+=g.def[k];(by[z+'.'+k]||(by[z+'.'+k]=[])).push(id);}}
  wt=Math.round(wt*10)/10;const pace=Math.min(GEAR_SLOW_MAX,1+Math.max(0,wt-GEAR_FREE)*GEAR_SLOW);
  return GEAR_STAT_C[key]={def,wt,grip,footing,snag,pace,by};}
function kitStats(k){const K=kitRead(k);return gearStats(GEAR_SLOTS.map(s=>K[s]));}
// a fighter's gear (null when he wears none of it: anyone but the hero in the Pit)
function gearOf(f){const w=f&&f.wear;return w&&typeof w==='object'&&Array.isArray(w.gear)?gearStats(w.gear):null;}
// where a blow lands, as the gear goes: the head (an overhead, a headbutt, a blow at the face or the neck), the legs (a sweep, a blow at
// the shin), or the body (the rest); and what kind of blow it is: a thrust or a cut from an edge, blunt from anything else (a fist, a
// club, a pommel, an elbow, a knee)
function gearZone(kind,T){const a=T&&T.anchor;if(kind==='sweep'||a==='shin')return'legs';if(kind==='overhead'||kind==='headbutt'||a==='face'||a==='neck')return'head';return'body';}
function gearKind(A,kind,T){const wp=A&&A.wp;if(!wp||wp.unarmed||!wp.edge||(T&&T.dirty)||kind==='elbow'||kind==='knee'||kind==='headbutt')return'blunt';return kind==='thrust'?'thrust':'cut';}
// the gear's words: a thing's protection and holds (for the screens and the log), and the names of the things that stopped a blow
function gearTheName(id){const n=GEAR[id].short||GEAR[id].name;return'the '+n.charAt(0).toLowerCase()+n.slice(1);}
// (the things that stopped a blow, as the log names them: the one that stopped most first)
function gearWho(ids,z,k){const L=ids.slice().sort((a,b)=>(GEAR[b].def[k]||0)-(GEAR[a].def[k]||0)).map(gearTheName);
  return L.length>1?L.slice(0,-1).join(', ')+' and '+L[L.length-1]:L[0]||'his gear';}
function gearLines(id){const g=GEAR[id],out=[],sg=v=>(v>0?'+':'−')+Math.abs(v);
  if(g.def){const kinds=GEAR_KINDS.filter(k=>g.def[k]).map(k=>k+' '+g.def[k]).join(', ');if(kinds)out.push('Off a blow to the '+(g.cover||[]).join(' or the ')+': '+kinds);}
  if(g.grip)out.push('Against a disarm '+sg(g.grip));
  if(g.footing)out.push('Against a sweep '+sg(g.footing));
  if(g.snag)out.push('Against a grab '+sg(g.snag));
  return out;}

// ---------- the rules ----------
// a blow that lands is that much less for what covers where it lands, never under one; the log names what stopped it. A blow his gear
// keeps from killing him is no finisher, and floors him only as a sweep, an overhead or a crit would anyway.
RULES.add({id:'gear.armour',src:'Gear',on:'dmg',when:x=>{const r=x.r;return!!r&&r.dmg>0&&(r.out==='hit'||r.out==='crit')&&!!gearOf(x.D);},
  edit:x=>{const {A,D,kind,T}=x,r=x.r,G=gearOf(D),z=gearZone(kind,r.tech||T),k=gearKind(A,kind,r.tech||T),v=G.def[z][k];if(!v)return null;
    const d0=r.dmg;r.dmg=Math.max(1,r.dmg-v);if(r.dmg===d0)return null;
    if(D.hp-d0<=0&&D.hp-r.dmg>0){if(r.tech&&r.tech.fin)r.tech={...r.tech,fin:null};if(r.kd&&(D.downed||(kind!=='sweep'&&kind!=='overhead'&&r.out!=='crit')))r.kd=false;}
    return[gearWho(G.by[z+'.'+k]||[],z,k),r.dmg-d0];}});
// the weight he wears: every move and every step costs that much more
RULES.add({id:'gear.weight',src:'Gear',on:'tempo',label:'the weight he wears',when:x=>{const G=gearOf(x.f);return!!G&&G.pace>1;},mul:x=>gearOf(x.f).pace});
RULES.add({id:'gear.weight.step',src:'Gear',on:'approach',label:'the weight he wears',when:x=>{const G=gearOf(x.A);return!!G&&G.pace>1;},mul:x=>gearOf(x.A).pace});
// a glove's grip against a disarm; his footing against a sweep; how hard he is to hold against a grab
RULES.add({id:'gear.grip',src:'Gear',on:'disarm',to:'def',mod:x=>{const G=gearOf(x.D);return G&&G.grip?['his grip',G.grip]:null;},when:x=>!!gearOf(x.D)});
RULES.add({id:'gear.footing',src:'Gear',on:'attack',to:'def',mod:x=>{if(x.kind!=='sweep')return null;const G=gearOf(x.D);return G&&G.footing?[G.footing>0?'his footing':'his loose footing',G.footing]:null;},when:x=>!!gearOf(x.D)});
RULES.add({id:'gear.snag',src:'Gear',on:'grab',to:'def',mod:x=>{const G=gearOf(x.D);return G&&G.snag?[G.snag>0?'hard to hold':'a hold on his gear',G.snag]:null;},when:x=>!!gearOf(x.D)});

// ---------- changing ----------
// what he wears put on him now (the story's record and his look), keeping the sleeve as it is
function gearDress(kit){const F=gearFlags(),K=typeof hero==='function'?hero():null;if(F)F.kit=Object.assign({},kitRead(kit));
  if(K&&act1On()&&K.wear&&typeof K.wear==='object'&&Array.isArray(K.wear.gear))K.wear=kitWear(F?F.kit:kit,{pinned:K.wear.pinned!==false});}
// whether he can change from the menu now: walking about, with nothing on over it (no scene, no screen: the crate's has its own)
function gearFree(){if(!act1On()||S.cut)return false;const A=S.act1;if(A&&((A.gear&&A.gear.open)||(A.map&&A.map.open)||(A.shop&&A.shop.open)))return false;return typeof exOn==='function'&&exOn();}
// the menu's change: the next or the last thing he has for the slot (null when it changed, else why not)
function gearStep(slot,dir){if(!gearFree())return'Not now';const L=gearOwned(slot),k=kitOf(),i=L.indexOf(k[slot]);if(L.length<2)return'Nothing else for it';
  k[slot]=L[((i+dir)%L.length+L.length)%L.length];gearDress(k);S.hooks.act1('gearset',{slot,id:k[slot]});return null;}
// a thing he bought: his, and on him
function gearGet(id){const F=gearFlags();if(!F||!GEAR[id])return;if(!Array.isArray(F.gearOwn))F.gearOwn=[];if(!F.gearOwn.includes(id))F.gearOwn.push(id);
  const k=kitOf();k[GEAR[id].slot]=id;gearDress(k);}
// ===== GEAR END =====
