// ===== ACT I, SCENE 5 START =====
// Tamm's List: the stair-streets and the Shelf market. Tamm hands him a canvas satchel, a short list, a purse of Crown coin and three
// pump chits (Osgood Tarr's water paper; in the Pit they pass for money). Three tutorials in one errand: the Pit map (its tiers,
// routes and landmarks, a waypoint for each thing on the list, the closed ladders that force the long way round), buying (the shop
// screen, prices in coin or chits), and the satchel (a grid with slots and a weight limit; the rice sack takes three slots in it, or
// rides in his hand, which leaves no hand for a knife). Whatever is in his hand on the way home is what he has when the toll men step
// out. On the way up, the spike from the first landing: bare but for a dark stain and a strip of black coat cloth. At the Shelf, Nim
// at the pump stall looks at his tattoos longer than at his coin. On the way back the street goes quiet along a row of silent beggars,
// and the old man at the end of it follows him with his eyes until he is out of sight.

// ---------- the errand: what he carries and what he has to spend ----------
// GOODS: what can be had (slots in the satchel, weight). STALLS: the Shelf's five, keyed as ACT1_PLACES.shelf.stalls are, each with what
// it sells and the price in coin, chits or both (a chit goes for two coin's worth; the good lamp oil is a chit or nothing).
const GOODS={oil:{name:'Lamp oil',slots:1,wt:2,list:'oil'},oilcheap:{name:'Cheap lamp oil',slots:1,wt:2,list:'oil'},rice:{name:'Rice sack',slots:3,wt:4,list:'rice'},
  salt:{name:'Salt',slots:1,wt:1,list:'salt'},valve:{name:'Pump valve',slots:1,wt:1,list:'valve'},linen:{name:'Clean linen',slots:1,wt:1,list:'linen'},
  salve:{name:'Salve',slots:1,wt:1},whet:{name:'Whetstone work',service:true}};
const STALLS={
  oil:{keeper:'Oil seller',goods:[{id:'oil',chit:1,what:'The good oil. Burns clean.'},{id:'oilcheap',coin:2,what:'Cheap. It smokes.'}]},
  grain:{keeper:'Grocer',goods:[{id:'rice',coin:3,what:'A sack. Three slots in the satchel, or a hand to carry.'},{id:'salt',coin:1,what:'A twist of salt.'}]},
  linen:{keeper:'Linen seller',goods:[{id:'linen',coin:2,what:'Clean linen for that shoulder.'}]},
  nim:{keeper:'Nim',goods:[{id:'valve',coin:2,what:'For the Sump’s pump.'}]},
  grind:{keeper:'Grinder',goods:[{id:'salve',coin:2,what:'Heals him between fights.'},{id:'whet',coin:1,what:'Sharpens the dagger: it cuts deeper in the next fight.'}]}};
const ERRAND_LIST=[{id:'oil',name:'Lamp oil'},{id:'rice',name:'Rice'},{id:'salt',name:'Salt'},{id:'valve',name:'A valve from the goblin at the pump stall'},{id:'linen',name:'Clean linen'}];
const SATCHEL={cols:4,rows:2,wt:9},PURSE={coin:12,chits:3};
// the errand's record in S.act1.errand: {bag: goods in the satchel, hand: what his hand holds (a good's id) or null, coin, chits, got
// (the list's ids got), nim (the valve's price for him), sharp (the whetstone)}. A chapter picked from the menu after scene 5 starts
// with it done: everything on the list in the bag (errandDone)
function errandNew(){return{bag:[],hand:null,coin:PURSE.coin,chits:PURSE.chits,got:{},nim:null,sharp:false,salve:0};}
function errand(){const A=act1State();return A.errand||(A.errand=errandNew());}
function errandDone(){const E=errandNew();for(const id of ['oil','rice','salt','valve','linen'])E.bag.push(id),E.got[GOODS[id].list]=true;E.coin=12-3-1-3-2;E.chits=2;return E;}
// the satchel: goods placed in its grid row by row, each as many cells side by side as it takes (null: it will not go in)
function satchelGrid(bag){const C=SATCHEL.cols,R=SATCHEL.rows,cells=new Array(C*R).fill(null),out=[];
  // the big ones first, so the sack finds its three cells together
  const order=bag.map((id,i)=>({id,i})).sort((a,b)=>GOODS[b.id].slots-GOODS[a.id].slots);
  for(const {id,i} of order){const n=GOODS[id].slots;let at=-1;
    for(let r=0;r<R&&at<0;r++)for(let c=0;c+n<=C&&at<0;c++){let ok=true;for(let k=0;k<n;k++)if(cells[r*C+c+k]!==null)ok=false;if(ok)at=r*C+c;}
    if(at<0)return null;for(let k=0;k<n;k++)cells[at+k]=i;out.push({id,i,cell:at,n});}
  return{cells,items:out};}
function satchelWeight(bag){return bag.reduce((s,id)=>s+(GOODS[id].wt||0),0);}
// whether a good can go in the satchel as it is now, and if not, why
function satchelWhyNot(E,id){const g=GOODS[id];if(satchelWeight(E.bag)+g.wt>SATCHEL.wt)return'Too heavy for the satchel';if(!satchelGrid(E.bag.concat(id)))return'No room in the satchel';return null;}
// what his one hand holds (the explore system's hand follows it)
function errandHand(id){const E=errand();E.hand=id;if(S.ex)S.ex.hand=id?{id,name:GOODS[id].name,good:true}:null;}
// (what he sets down and takes up again while walking about is the errand's hand too: the rice put down on a stair and left there is
// gone from him)
{const eh=S.hooks.explore;S.hooks.explore=(k,a)=>{eh(k,a);const E=S.act1&&S.act1.errand;if(!E||!act1On())return;
  if(k==='drop'&&a&&a.good)E.hand=null;if(k==='use'&&a&&a.take&&a.take.good)E.hand=a.take.id;};}
// a good from the satchel into his hand, or from his hand into the satchel
function errandToHand(i){const E=errand();if(E.hand||i<0||i>=E.bag.length)return'His hand is full';const id=E.bag.splice(i,1)[0];errandHand(id);return null;}
function errandToBag(){const E=errand();if(!E.hand)return null;const why=satchelWhyNot(E,E.hand);if(why)return why;E.bag.push(E.hand);errandHand(null);return null;}
// the price of a good at a stall for him, in coin and in chits (null: not that way)
function goodPrice(stall,g){const E=errand();let coin=g.coin??null;if(stall==='nim'&&g.id==='valve'&&E.nim)coin=E.nim;const chit=g.chit??(coin!=null?Math.ceil(coin/2):null);return{coin:g.chit&&g.coin==null?null:coin,chit};}
// whether coin and chits would still buy what is left of the list (`got`: the list's ids got), each good any way a stall sells it (the
// valve at Nim's price for him). The purse holds the list with a little over, so a salve or the whetstone is his to buy, but no buy
// may leave the list out of reach: with the list not got, the way home does not open
function errandAffords(E,got,coin,chits){
  const ways=ERRAND_LIST.filter(l=>!got[l.id]).map(l=>{const w=[];
    for(const sid in STALLS)for(const g of STALLS[sid].goods){if(GOODS[g.id].list!==l.id)continue;
      const c=sid==='nim'&&g.id==='valve'?E.nim||3:g.coin??null,h=g.chit??(c!=null?Math.ceil(c/2):null);
      if(c!=null)w.push([c,0]);if(h!=null)w.push([0,h]);}
    return w;});
  const go=(i,c,h)=>i>=ways.length||ways[i].some(([a,b])=>a<=c&&b<=h&&go(i+1,c-a,h-b));
  return go(0,coin,chits);}
// buying: the money first, then where it goes (the satchel, else his hand if it is free); null when bought, else why not
function errandBuy(stall,id,pay){const E=errand(),St=STALLS[stall],g=St&&St.goods.find(x=>x.id===id);if(!g)return'Not sold here';const G=GOODS[id],pr=goodPrice(stall,g);
  const cost=pay==='chit'?pr.chit:pr.coin;if(cost==null)return pay==='chit'?'Not for chits':'Chits only';
  if(pay==='chit'?E.chits<cost:E.coin<cost)return pay==='chit'?'Not enough chits':'Not enough coin';
  if(G.service){if(id==='whet'&&E.sharp)return'Already sharp';}
  else if(G.list&&E.got[G.list])return'Already on the list as got';
  if(!errandAffords(E,G.list?{...E.got,[G.list]:true}:E.got,E.coin-(pay==='chit'?0:cost),E.chits-(pay==='chit'?cost:0)))
    return G.list?'That leaves too little for the list':'Tamm’s money: the list first';
  let into=null;if(!G.service){into=satchelWhyNot(E,id)?(E.hand?null:'hand'):'bag';if(!into)return satchelWhyNot(E,id)+', and his hand is full';}
  if(pay==='chit')E.chits-=cost;else E.coin-=cost;
  if(id==='whet')E.sharp=true;else if(into==='bag')E.bag.push(id);else errandHand(id);
  if(G.list)E.got[G.list]=true;if(id==='salve')E.salve++;
  S.hooks.act1('buy',{stall,id,pay,cost,into});return null;}
function errandCount(){const E=errand();return ERRAND_LIST.filter(l=>E.got[l.id]).length;}
// home with the list (scene 8 on): what he bought for Tamm is hers, out of the satchel and his hand; what he bought for himself stays.
// A chapter picked from there on starts with the errand done and given over
function errandHome(A){if(!A.errand)A.errand=errandDone();const E=A.errand;if(E.home)return E;
  E.bag=E.bag.filter(id=>!GOODS[id].list);if(E.hand&&GOODS[E.hand]&&GOODS[E.hand].list)E.hand=null;E.home=true;return E;}
// where the rice is now: in the satchel, in his hand, or nowhere
function riceWhere(){const E=errand();return E.hand==='rice'?'hand':E.bag.includes('rice')?'bag':null;}

// ---------- the screens the page shows: the map and the shop ----------
// S.act1.map = {open, tutor}: the Pit map; S.act1.shop = {open, stall}: a stall's goods. A scene opens them and waits; on auto they
// close on their own (the shop buying the list first, the rice into the satchel).
function act1MapOpen(o={}){const A=act1State();A.map={open:true,t0:S.t,tutor:!!o.tutor};S.hooks.act1('map',A.map);return A.map;}
function act1MapClose(){const A=S.act1;if(A&&A.map)A.map.open=false;}
function act1ShopOpen(stall){const A=act1State();A.shop={open:true,stall,t0:S.t,note:null};S.hooks.act1('shop',A.shop);return A.shop;}
function act1ShopClose(){const A=S.act1;if(A&&A.shop)A.shop.open=false;}
function act1ShopBuy(id,pay){const A=S.act1,Sh=A&&A.shop;if(!Sh||!Sh.open)return'Closed';const why=errandBuy(Sh.stall,id,pay);Sh.note=why?{text:why,t0:S.t}:{text:'Bought: '+GOODS[id].name,t0:S.t,ok:true};return why;}
V11.step.push(()=>{const A=S.act1;if(!A||!(S.storyAuto||S.auto))return;
  if(A.map&&A.map.open&&S.t-A.map.t0>1.4)act1MapClose();
  const Sh=A.shop;if(Sh&&Sh.open&&S.t-Sh.t0>.9){const E=errand(),St=STALLS[Sh.stall];
    // on auto: what is on the list and not yet got, in coin where it can be, else chits
    for(const g of St.goods){const G=GOODS[g.id];if(!G.list||E.got[G.list])continue;if(g.id==='oilcheap')continue;const pr=goodPrice(Sh.stall,g);act1ShopBuy(g.id,pr.coin!=null&&E.coin>=pr.coin?'coin':'chit');}
    act1ShopClose();}});

// ---------- scene 4 goes on into scene 5 ----------
{const Y=STAGES[stageIx('yard1')];Y.next='list';Y.outro=function*(st){const K=hero(),Yd=ACT1_PLACES.yard;yield* goTo(K,Yd.sidestair.x0+20,Yd.floor.z1,60);yield* fadeTo(1,1.4);};}

// ---------- the places of scene 5 ----------
// (the old man and the beggars sit at the back of the stair-street, as deep as anyone can be)
ACT1_PLACES.stairs.beggars.d=168;ACT1_PLACES.stairs.oldman.d=168;
// the yard's gate out to the stair-streets
ACT1_PLACES.yard.out={x:792,z:120};

// ===== SCENE 5: TAMM'S LIST =====
// In the yard, by the back step. Tamm gives him the satchel, the list, the purse and the chits, and the map shows him the way.
STAGES.push({key:'list',act:1,num:'5',title:'Tamm’s List',sub:'The stair-streets and the Shelf market',arena:'yard',next:'stairsup',weapon:'fists',wear:'kit',foes:[],
  spawn:[[ACT1_PLACES.yard.step.x+60,140]],
  setup(st){const K=hero(),Y=ACT1_PLACES.yard,A=act1State();S.fade=1;standEasy(K);K.station=Y.step.x+70;K.lane=K.dep=K.stepDep=140;K.facing=-1;K.build();K.lurch=0;
    A.errand=errandNew();A.gate=0;A.stairGate=0;A.map=null;A.shop=null;A.satchel=false;
    const T=act1Npc('Tamm',{x:Y.step.x+10,dep:150,facing:1});A.tamm=T;},
  *intro(st){const K=hero(),A=act1State(),T=A.tamm,Y=ACT1_PLACES.yard;
    letter(1);camTo(Y.step.x+160,700,0);
    yield* fadeTo(0,1.2);yield* wait(.6);
    // the satchel, the list, the purse and the chits, from her apron to his hand
    T.action=holdAction(T,1.6,{fn:()=>{const h=K.p[HAF];return{x:h.x,y:h.y-4};}});yield* wait(1);A.satchel=true;S.hooks.sound('purse',1);yield* wait(.7);T.action=null;
    yield* speak('Tamm','Lamp oil, rice, salt. A valve from the goblin at the pump stall. Clean linen for that shoulder.',{dur:4.2});
    yield* speak('Tamm','Chits are the Pump King’s paper. Spend them before they’re worth less.',{dur:3.6});
    // the way there: the map
    letter(0);const M=act1MapOpen({tutor:true});yield* until(()=>!M.open,1e6);
    T.facing=1;},
  explore(st){const Y=ACT1_PLACES.yard,A=act1State();
    return{area:'yard',bounds:{x0:Y.floor.x0,x1:Y.floor.x1,z0:Y.floor.z0,z1:Y.floor.z1},view:760,map:true,
      goal:{text:'Out the gate to the stair-streets',done:()=>A.gate>=1&&A.outGate},
      spots:[{id:'gate',label:'The gate',verb:'Open',x:Y.out.x,z:Y.out.z,at:{x:Y.gate.x,y:GB-40,d:Y.gate.d},needs:'free',key:true,
        *run(){const K=hero();K.facing=1;K.action=stoopAction(K,.7,{crouch:.95,lean:.2});const t0=S.t;yield* until(()=>{A.gate=sstep(clamp((S.t-t0)/.8,0,1));return A.gate>=1;},2);
          S.hooks.sound('gate',1);K.action=null;yield* goTo(K,Y.gate.x+30,Y.gate.d,70);A.outGate=true;}}]};},
  *outro(st){yield* fadeTo(1,1);}});

// The stair-street going up: the first landing, the spike across the Pit, and the long way up (the ladders are closed to him).
STAGES.push({key:'stairsup',act:1,num:'',title:'',sub:'',arena:'stairs',next:'shelf',weapon:'fists',wear:'kit',cardDur:0,foes:[],
  spawn:[[60,110]],
  setup(st){const K=hero(),A=act1State();S.fade=1;standEasy(K);K.station=40;K.lane=K.dep=K.stepDep=110;K.facing=1;K.build();A.dusk=false;A.spikeView=0;A.errand=A.errand||errandNew();},
  *intro(st){const K=hero(),A=act1State(),R=ACT1_PLACES.stairs;
    letter(1);camTo(300,760,0);yield* fadeTo(0,1);
    // he stops at the first landing, and looks across the Pit at the spike
    yield* goTo(K,R.lo.x1-30,110,70);K.facing=1;yield* wait(.6);
    {const t0=S.t;yield* until(()=>{A.spikeView=sstep(clamp((S.t-t0)/1.4,0,1));return A.spikeView>=1;},3);}
    yield* wait(1.2);yield* think('Gone. Somebody climbed for it.',{dur:2.8});yield* wait(.4);
    {const t0=S.t;yield* until(()=>{A.spikeView=1-sstep(clamp((S.t-t0)/1.2,0,1));return A.spikeView<=0;},3);}
    letter(0);},
  explore(st){const R=ACT1_PLACES.stairs,A=act1State();
    return{area:'stairs',bounds:{x0:R.floor.x0,x1:R.floor.x1,z0:R.floor.z0,z1:R.floor.z1},view:760,map:true,hand:A.errand&&A.errand.hand?{id:A.errand.hand,name:GOODS[A.errand.hand].name,good:true}:null,
      goal:{text:'Up the stair-street to the Shelf',done:()=>!!A.upTop},
      spots:[],exits:[{id:'up',x0:R.floor.x1-20,x1:R.floor.x1,z0:R.floor.z0,z1:R.floor.z1,label:'On up',*run(){A.upTop=true;exGoalCheck();}}]};},
  *outro(st){yield* fadeTo(1,.9);}});
// (on auto the stair-street's way up is walked to: there is nothing on it to use)
V11.step.push(()=>{const st=act1Stage(),E=S.ex;if(!st||st.key!=='stairsup'||!E||!E.on||S.cut||E.to||!(S.storyAuto||S.auto))return;exGo(ACT1_PLACES.stairs.floor.x1,100);});

// The Shelf market: five stalls under tarps and lamps; the list worked through; Nim at the pump stall.
// the keepers stand behind their counters (the painter's default, 200 deep: past where anyone stands in a fight, so each has his own
// zMax), the counters' fronts at 182, the floor he walks on ending at 160
const SHELF_KEEP_D=200;
STAGES.push({key:'shelf',act:1,num:'',title:'',sub:'',arena:'shelf',next:'stairsdown',weapon:'fists',wear:'kit',cardDur:0,foes:[],
  spawn:[[60,90]],
  setup(st){const K=hero(),R=ACT1_PLACES.shelf,A=act1State();S.fade=1;standEasy(K);K.station=60;K.lane=K.dep=K.stepDep=90;K.facing=1;K.build();A.errand=A.errand||errandNew();A.shop=null;
    A.keepers={};for(const s of R.stalls){const nm=STALLS[s.id].keeper,f=act1Npc(nm,{x:s.x+10,dep:SHELF_KEEP_D,facing:-1});f.zMax=SHELF_KEEP_D+10;A.keepers[s.id]=f;}},
  *intro(st){letter(1);camTo(330,760,0);yield* fadeTo(0,1);yield* wait(.6);letter(0);},
  explore(st){const R=ACT1_PLACES.shelf,A=act1State(),E=errand();
    const label={oil:'Lamp oil',grain:'Rice and salt',linen:'Linen',nim:'The pump stall',grind:'Salves and a grinder'};
    const stallSpot=s=>({id:'stall:'+s.id,label:label[s.id],verb:'Buy',x:s.x,z:R.d-80,at:{x:s.x,y:GB-60,d:R.d-30},
      *run(){const K=hero();K.facing=1;
        // Nim, the first time: she looks at his tattoos longer than at his coin
        if(s.id==='nim'&&!E.nim){const N=A.keepers.nim;N.facing=K.station<N.station?-1:1;yield* wait(.5);
          yield* speak('Nim','Ranger gilt.',{dur:1.8});yield* speak(HERO_NAME,'You know it?',{dur:1.6});
          yield* speak('Nim','I know what it guarded. Valve’s two coin. For you, three.',{dur:3.4});E.nim=3;}
        const Sh=act1ShopOpen(s.id);yield* until(()=>!Sh.open,1e6);}});
    return{area:'shelf',bounds:{x0:R.floor.x0,x1:R.floor.x1,z0:R.floor.z0,z1:R.floor.z1},view:760,map:true,hand:E.hand?{id:E.hand,name:GOODS[E.hand].name,good:true}:null,
      goal:{text:()=>errandCount()<ERRAND_LIST.length?'Tamm’s list: '+errandCount()+' of '+ERRAND_LIST.length:'Back down the stair-street to the Sump',done:()=>!!A.downOff},
      spots:R.stalls.map(stallSpot),
      exits:[{id:'down',x0:R.floor.x0,x1:R.floor.x0+16,z0:R.floor.z0,z1:R.floor.z1,when:()=>errandCount()>=ERRAND_LIST.length,label:'Back down',*run(){A.downOff=true;exGoalCheck();}}]};},
  *outro(st){yield* fadeTo(1,.9);}});
// (on auto, with the list got, he walks to the way down)
V11.step.push(()=>{const st=act1Stage(),E=S.ex;if(!st||st.key!=='shelf'||!E||!E.on||S.cut||E.to||!(S.storyAuto||S.auto))return;
  if(errandCount()>=ERRAND_LIST.length&&!E.spots.some(s=>exShown(s)&&!s.used&&s.id==='stall:grind'))exGo(ACT1_PLACES.shelf.floor.x0,90);});

// The way back down at dusk: the street goes quiet along the row of silent beggars with their tin cups, and the old man at the end of
// it follows him with his eyes until he is out of sight.
STAGES.push({key:'stairsdown',act:1,num:'',title:'',sub:'',arena:'stairs',next:null,weapon:'fists',wear:'kit',cardDur:0,foes:[],
  spawn:[[860,110]],
  setup(st){const K=hero(),R=ACT1_PLACES.stairs,A=act1State();S.fade=1;standEasy(K);K.station=860;K.lane=K.dep=K.stepDep=100;K.facing=-1;K.build();A.dusk=true;A.spikeView=0;
    if(!A.errand)A.errand=errandDone();
    // the beggars, seated along the back wall, and the old man at the end of the row
    A.beggars=[];const B=R.beggars,n=6;for(let i=0;i<n;i++){const f=act1Npc('Beggar',{x:B.x0+(B.x1-B.x0)*i/(n-1),dep:B.d-(i%2)*2,facing:i%3?-1:1,seed:7451+i*31});f.guardBody=()=>sitBody(f,0);f.guardArm=()=>sitArm(f);A.beggars.push(f);}
    // (he is already looking up the street at Ilyas when the scene opens: the turn of his head that follows him starts from there)
    const O=act1Npc('Old man',{x:R.oldman.x,dep:R.oldman.d,facing:K.station<R.oldman.x?-1:1});O.guardBody=()=>sitBody(O,0);O.guardArm=()=>sitArm(O);A.oldman=O;},
  *intro(st){letter(1);camTo(700,760,0);yield* fadeTo(0,1.2);letter(0);},
  explore(st){const R=ACT1_PLACES.stairs,A=act1State(),E=errand();
    return{area:'stairs',bounds:{x0:R.floor.x0,x1:R.floor.x1,z0:R.floor.z0,z1:R.floor.z1},view:760,map:true,hand:E.hand?{id:E.hand,name:GOODS[E.hand].name,good:true}:null,
      goal:{text:'Down the stair-street to the Sump',done:()=>!!A.downAll},
      spots:[],exits:[{id:'down',x0:R.floor.x0,x1:R.floor.x0+20,z0:R.floor.z0,z1:R.floor.z1,label:'On down',*run(){A.downAll=true;exGoalCheck();}}]};},
  *outro(st){yield* fadeTo(1,1.4);S.story.ended='act1';}});
V11.step.push(()=>{const st=act1Stage(),E=S.ex;if(!st||st.key!=='stairsdown'||!E||!E.on||S.cut||E.to||!(S.storyAuto||S.auto))return;exGo(ACT1_PLACES.stairs.floor.x0,100);});
// the old man's eyes: he turns his head to follow Ilyas the whole way past, and on until he is out of sight
V11.step.push(()=>{const st=act1Stage();if(!st||st.key!=='stairsdown')return;const A=S.act1,O=A&&A.oldman,K=S.F[0];if(!O||!K)return;
  const dx=K.station-O.station;if(Math.abs(dx)>6)O.facing=dx<0?-1:1;});
// ===== ACT I, SCENE 5 END =====
