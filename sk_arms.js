// ===== ARMS START =====
// The restaurant's weapons. Each named elf has his or her own: a signature weapon for the kind they start with, and elven work in
// their colours for any other kind they are given. The crews carry what their room has to hand: the dining room's sabres and
// carving knives, the kitchen's cleavers and spits, the lobby's issue arms, and out in the open, machetes and boat hooks. Every one
// keeps its kind's reach, weight, damage and tempo, so the fights are the same; what changes is what is in the hand and its name.
// A weapon carries its design (f.wdes, it.wdes on the floor) wherever it goes: dropped, left stuck in a body, picked up by someone
// else. The designs are drawn by sk_armsui.js; here they are only ids and names.
const ARMS={
  // each named elf's own weapon: the kind it is, and its name
  sig:{Qadir:{key:'axe',name:'Last Orders'},Brask:{key:'spear',name:'Reservation'},Iyla:{key:'dagger',name:'Corkscrew'},
    Orrin:{key:'sword',name:"Butcher's Bill"},Hesk:{key:'sword',name:'Cold Cut'},Odile:{key:'dagger',name:'Eighty-Six'},
    Sable:{key:'sword',name:'Clearance'},Doran:{key:'spear',name:'Doorman'},Kessa:{key:'dagger',name:'Skeleton Key'},
    Kade:{key:'sword',name:'Severance'},'Mr. Hallowell':{key:null,name:'Fine Print'}},
  // what each room's crew carries for each kind: [design, name]; where there are two, the man's seed picks
  crew:{
    dining:{sword:[['sabre','Champagne sabre']],dagger:[['carving','Carving knife'],['steak','Steak knife']],axe:[['fireaxe','Fire axe']],
      spear:[['windowpole','Window pole']],club:[['tableleg','Table leg']]},
    kitchen:{sword:[['kfalchion','Kitchen falchion']],dagger:[['boning','Boning knife'],['cleaver','Meat cleaver']],axe:[['meataxe',"Butcher's axe"]],
      spear:[['spit','Roasting spit']],club:[['rollingpin','Rolling pin'],['skillet','Skillet']]},
    lobby:{sword:[['gsword',"Guard's sword"]],dagger:[['gdagger',"Guard's dagger"]],axe:[['breachaxe','Breaching axe']],
      spear:[['halberd','Lobby halberd']],club:[['truncheon','Truncheon']]},
    street:{sword:[['machete','Machete']],dagger:[['flick','Flick knife'],['trench','Trench knife']],axe:[['fellingaxe','Felling axe']],
      spear:[['boathook','Boat hook']],club:[['pipe','Lead pipe'],['crowbar','Crowbar']]}}};
const ARMS_NAME={};for(const r in ARMS.crew)for(const k in ARMS.crew[r])for(const [d,n] of ARMS.crew[r][k])ARMS_NAME['crew:'+d]=n;
// the room a crew member works in: where he comes in, or the street outside the restaurant
function armsRoom(f){return f.p2?'kitchen':f.p3?'lobby':S.arenaKey==='restaurant'?'dining':'street';}
// the design of a fighter's own weapon of this kind, or null: Amri's weapons, bare hands, and whatever lies about the room keep
// their old look; Kael's arc-blade is drawn by his own look. A crew member's table leg is his room's only if he came in with one.
function armsFor(f,key){
  if(!f||!key||!WEAPONS[key])return null;
  // Kael: his hip dagger, and any common weapon he is given, are made to go with the arc-blade (drawn by his own look)
  if(f.team===0&&!f.ally&&f.name===HERO_NAME)return key==='dagger'?'sig:Kael':key!=='elven'&&REAL_WEAPONS.includes(key)?'house:Kael:'+key:null;
  if(f.team!==1)return null;
  if(f.hench){const L=(ARMS.crew[armsRoom(f)]||{})[key];if(!L)return null;if(key==='club'&&!(f.hc&&f.hc.weapon==='club'))return null;
    return'crew:'+L[((f.seed||f.idx||0)>>>0)%L.length][0];}
  const s=ARMS.sig[f.name];if(!s||!REAL_WEAPONS.includes(key))return null;
  return s.key===key?'sig:'+f.name:'house:'+f.name+':'+key;}
S.hooks.arms=armsFor;
function armsCrewName(id){return id?ARMS_NAME[id]||null:null;}
// a crew's weapon goes by its own name wherever the weapon's name is shown; an elf's keeps its kind's name in the running text
// (Qadir's greataxe) and has its own name on the bench and in the help
{const desc=Object.getOwnPropertyDescriptor(Fighter.prototype,'wp'),VIEW={};
  Object.defineProperty(Fighter.prototype,'wp',{configurable:true,get(){const id=this.wdes;if(!id)return WEAPONS[this.weaponKey];
    const c=this._wv;if(c&&c.id===id&&c.k===this.weaponKey)return c.v;const base=WEAPONS[this.weaponKey],nm=ARMS_NAME[id],key=id+'|'+this.weaponKey;
    const v=nm&&base?VIEW[key]||(VIEW[key]=Object.create(base,{name:{value:nm},short:{value:nm}})):base;this._wv={id,k:this.weaponKey,v};return v;}});
  void desc;}
// what a dead fighter's own weapon was called, for his card
function ownWeaponName(f){return armsCrewName(armsFor(f,f.ownWeapon))||WEAPONS[f.ownWeapon].name;}
// a weapon lying about or stuck in a body, by its short name
function itemShort(it){return armsCrewName(it&&it.wdes)||WEAPONS[it.key].short;}
// the signature weapon's name, if this design is one
function armsSigName(id){if(!id||!id.startsWith('sig:'))return null;const s=ARMS.sig[id.slice(4)];return s?s.name:null;}
// as an elf readies his own weapon at the start of a fight, its name shows over him
{const _ra=readyAction;readyAction=function(f,t0,ev){const r=_ra(f,t0,ev),nm=r!=null?armsSigName(f.wdes):null;
  if(nm)ev.push({t:t0+.15,fn:()=>{if(!f.dead)S.callouts.push({i:f.idx,text:nm,age:0,life:1.5,dy:-8,arms:true});}});return r;};}
// ===== ARMS END =====
