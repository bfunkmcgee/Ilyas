// ===== PIT CAST UI =====
// (loaded ahead of the main UI script) The people of the Pit in CastLook: Tamm, Dob, Nim, Tarr's collectors, the beggars and the old
// man, the Shelf's stall keepers. Act I is soot, oilcloth and rust: work clothes gone dark with wear, waxed coats with a dull shine,
// rust and the Pump King's blue as the only colours. Everyone is a dark figure lit along one edge, as the cast always is. The Pit
// has people the restaurant never had: an orc (grey-green, a heavy brow and jaw, two small lower tusks, small pointed ears) and a
// goblin of the duneworks (big ears, a long nose, sandy green-tan). Their eyes are plain: only an elf's eyes give light.
// A person's body (height and build) is ACT1_CAST's in sk_pit.js; what is here is how they look.
{const CL=CastLook,{smoothD,hairPath,spikyPath,SLICK,HP,mid}=CL.shapes;
// ---------- heads ----------
// skulls in the cast's head frame (the cranium about 0,0, facing +x, crown to chin about 94; nose to nape as the cast's are)
Object.assign(CL.SKULLS,{
  // an orc: the forehead sloping back to a heavy brow ridge, the eye deep under it, a broad flat nose, a wide mouth and a heavy jaw
  // set forward, two small tusks up out of it in front of the upper lip
  orc:{pts:[[4,-37],[-19,-33],[-36,-18],[-40,2],[-36,21],[-28,37],[-12,43],[-2,49],[14,58],[30,62],[42,58],[47,51],[48,43],[46.5,36.5],[42.5,34],[44,30.5],[43,27.5],[48,25.5],[51,20.5],[49.5,13],[42.5,4],[45,-1],[47.5,-6],[40,-19],[27,-31]],
    eye:[33,5.5],brow:'M19,-4 Q33,-11.5 47,-5',browW:7.5,tusks:[[42,36,44,27,1.8,1],[46.4,37.2,51.2,24.6,2.5,0]],tuskL:11},
  // a goblin: a narrow skull, a long nose hooked down to its point, a small sharp chin
  goblin:{pts:[[4,-37],[-18,-33],[-33,-18],[-37,1],[-33,19],[-25,33],[-11,38],[-3,42],[10,48],[24,52],[33,50],[37,45],[36,41],[39,38],[37,35.5],[40,33],[40,30],[46,28.5],[56,27.6],[64,25.5],[61,21],[51,13],[41.5,2],[42.5,-4],[37,-20],[25,-31]],
    eye:[30,5],brow:'M15,-3 Q28,-10.5 42,-4.5',browW:6.5,human:1},
  // a child: a big round cranium over a small face, a small upturned nose, a small chin
  kid:{pts:[[3,-39],[-19,-35],[-35,-20],[-40,0],[-37,18],[-29,32],[-14,38],[-5,42],[8,49],[22,52],[31,49],[34,43],[32,40],[35,37],[33,34.5],[36,32],[36,29],[41,27],[44,22.5],[41,18],[36,6],[38,-3],[35,-21],[23,-33]],
    eye:[27,7],brow:'M14,-1 Q25,-6 37,-1.5',browW:5.5,human:1}});
Object.assign(CL.WIDE3,{orc:1.12,goblin:.95,kid:1.04});
// ears: an orc's small and pointed, set back; a goblin's big, swept back and up, standing out over a headcloth
const ORC_EAR=[[4,9],[-3,2],[-11,-1],[-24,-10],[-19,4],[-16,15],[-11,25],[-3,31],[3,28]],GOB_EAR=[[3,6],[-8,-3],[-24,-14],[-46,-26],[-67,-34],[-58,-18],[-46,-2],[-32,12],[-20,24],[-7,31],[2,27]];
Object.assign(CL.EARS,{
  orc:{d:smoothD(HP(ORC_EAR),true,.48),inner:'M-3,10 Q-12,4 -19,-4 Q-13,11 -5,22',over:1},
  goblin:{d:smoothD(HP(GOB_EAR),true,.48),inner:'M-4,9 Q-28,-8 -56,-25 Q-38,-1 -14,21',over:1}});
Object.assign(CL.EAR3,{orc:{pts:ORC_EAR,root:[-2,16],out:6,flare:2.5,base:30},goblin:{pts:GOB_EAR,root:[-4,12],out:18,flare:6,base:27}});
// hair: pulled back off the face (a braid or a bun behind, under a kerchief); a boy's mop sticking out under his cap
Object.assign(CL.HAIR,{
  pulled:{cap:hairPath(SLICK,true),strands:'M28,-27 Q8,-40 -26,-31 M24,-21 Q-2,-31 -36,-12 M20,-15 Q-6,-20 -38,4'},
  scruff:{cap:spikyPath([[30,-22],[38,-17,1],[28,-27],[22,-41,1],[6,-42],[-10,-49,1],[-20,-41],[-34,-41,1],[-36,-27],[-49,-17,1],[-40,-6],[-49,8,1],[-38,11],[-43,25,1],[-30,22]],true),
    strands:'M32,-22 Q20,-32 6,-38 M-20,-36 Q-34,-26 -40,-10'}});
Object.assign(CL.HAIR3,{pulled:{line:'human',puff:2.5},scruff:{line:'human',puff:6}});
// hats, in the cast's way (crown, band, brim, knot, pleats, a badge), and how each is seen turned (HAT3)
Object.assign(CL.HATS,{
  // a kerchief over the crown, behind the hairline, tied at the nape, a tail of it hanging
  kerchief:{crown:smoothD(HP([[27,-28],[21,-37],[6,-43.5],[-14,-42.5],[-31,-33],[-41,-17],[-44,2],[-40,17],[-33,25],[-25,21],[-20,8],[-12,-6],[2,-18],[16,-25]]),true,.45),
    knot:smoothD(HP([[-35,12],[-46,9],[-55,17],[-51,26],[-59,40],[-48,36],[-44,27],[-37,25]]),true,.45),pleats:'M14,-35 Q-12,-34 -36,-12',mat:'hat'},
  // a boy's cap too big for him: a slouched round crown over the back of his head, a short brim, a button on top
  newsboy:{crown:smoothD(HP([[38,-14],[43,-28],[37,-45],[18,-58],[-8,-63],[-33,-59],[-52,-45],[-60,-26],[-58,-9],[-47,-2],[-32,-9],[-10,-15],[14,-17.5]]),true,.45),
    brim:smoothD(HP([[34,-19],[55,-17],[59,-12],[36,-12]]),true,.35),badge:[-10,-61],pleats:'M-10,-61 Q14,-50 36,-30 M-10,-61 Q-2,-40 6,-18 M-10,-61 Q-36,-44 -50,-12',mat:'hat'},
  // a headcloth wound round and round (the duneworks' way against sand), its loose end hanging behind
  wrap:{crown:smoothD(HP([[37,-15],[39,-28],[31,-43],[12,-53],[-10,-54],[-31,-46],[-43,-31],[-46,-13],[-39,-3],[-24,-8],[-6,-14],[16,-17]]),true,.45),
    knot:smoothD(HP([[-37,-21],[-49,-16],[-57,-3],[-55,13],[-61,28],[-50,23],[-46,8],[-41,-6]]),true,.45),pleats:'M35,-23 Q2,-38 -42,-22 M31,-35 Q0,-48 -37,-37 M36,-17 Q4,-27 -41,-11',mat:'hat'},
  // a cloth hood: over the head from the brow, round behind the cheek, falling to the shoulders
  hood:{crown:smoothD(HP([[39,-13],[37,-30],[26,-45],[5,-52],[-19,-50],[-37,-39],[-47,-18],[-50,7],[-46,31],[-38,53],[-27,66],[-9,66],[-3,53],[5,40],[12,24],[19,7],[26,-6],[32,-12]]),true,.42),
    pleats:'M30,-35 Q-6,-30 -32,12 M8,-47 Q-22,-20 -40,32 M14,18 Q2,40 -4,60',mat:'hat'}});
Object.assign(CL.HAT3,{kerchief:{top:-37,base:-8,puff:3.5,knot:{c:[-44,18,0],r:7}},
  newsboy:{top:-44,base:-12,puff:12,tall:1,topW:.8,flare:.04,dome:8,brim:{len:20,w:.7,y:-15}},
  wrap:{top:-44,base:-12,puff:8,tall:1,topW:.8,dome:7,knot:{c:[-48,-4,0],r:8}},hood:{top:-39,base:4,puff:7}});

// ---------- colours ----------
// the Pit's people: soot-dark work clothes, oilcloth, rust; the human skin and eye as the crews have them
function pitCol(o={}){return CL.humanCol(Object.assign({suit:'#1c1a17',suitFar:'#2c2924',lapel:'#24211c',coat:'#1c1a17',coatFar:'#2c2924',shirt:'#3a342b',shirtFar:'#2b2721',sleeve:'#3a342b',sleeveFar:'#2b2721',
  vest:'#191613',vestFar:'#2b2621',trouser:'#1c1915',trouserFar:'#2b2722',apron:'#2e2a24',apronFar:'#3a352e',hat:'#2a251f',hatShade:'#1a1713',shoe:'#110e0b',shoeFar:'#221c17',
  shawl:'#2c2822',shawlFar:'#38332c',patch:'#3d3428',patch2:'#2f3440',rope:'#7a6b4e',ropeFar:'#55493a',bag:'#33261a',bagFar:'#2a2018',band:'#2f5c7c',bandFar:'#22435c',
  button:'#7a6e5c',brass:'#b28d3d',brassHi:'#ffe299'},o));}
// the Pump King's blue, on a rag round the arm
const PUMP_BLUE='#2f5c7c';

// ---------- the people ----------
Object.assign(CL.CAST,{
  // Tamm Broadhand keeps the Sump. An orc woman in her fifties, big and broad, her iron-grey hair in a thick braid under a rust
  // kerchief; a dark work dress, its sleeves rolled over heavy forearms; a long stained apron with a bib and a front pocket (in a
  // fight her left hand stays in it); boots.
  Tamm:{race:'orc',room:'pit',role:'Keeps the Sump',temper:null,
    col:pitCol({skin:'#1a201a',skinFar:'#283028',lit:{skin:'gskin'},eye:'#c4c0a6',earIn:'#0f140f',
      hair:'#8f8f89',hairShade:'#51524c',hairHi:'#d8d8d0',hairLine:'#6c6c66',accent:'#6b3420',
      shirt:'#1e1c21',shirtFar:'#2c2a31',sleeve:'#1e1c21',sleeveFar:'#2c2a31',coat:'#1e1c21',coatFar:'#2c2a31',trouser:'#1a181c',trouserFar:'#29262c',
      apron:'#38342d',apronFar:'#2e2b26',apronTie:'#24211c',apronStain:'#0d0a07',hat:'#5e2d1c',hatShade:'#3f1e13',tusk:'#d4c8a4',tuskShade:'#8b8066',brow:'#121812'}),
    head:{skull:'orc',ear:'orc',hair:'pulled',hat:'kerchief',tusks:1},
    outfit:{top:'shirt',sleeves:'rolled',neck:'collar',forearm:.24,coat:{len:46,closed:1,lining:false},apron:{len:42,ties:1,pocket:1,stains:1,bib:1},boots:1},
    trail:{kind:'braid',n:6,back:6.5},build:null},
  // Dob, about twelve: climbs the Pit's walls for scrap and keeps pigeons on the Sump's roof. A patched jacket too big for him, an
  // oversized cap, a coil of rope over his shoulder, patched knees, worn boots.
  Dob:{race:'human',room:'pit',role:'Climbs the walls for scrap. Keeps pigeons on the Sump’s roof',temper:null,
    col:pitCol({skin:'#231912',eye:'#aab6c6',hair:'#3b2b1d',hairShade:'#22180f',hairHi:'#705842',suit:'#2c2b22',suitFar:'#3b392f',lapel:'#35332a',coat:'#2c2b22',coatFar:'#3b392f',
      shirt:'#4b4335',trouser:'#201d19',trouserFar:'#2f2b25',hat:'#3b3529',hatShade:'#272219',button:'#5e564a',patch:'#4c3b28',patch2:'#36404e'}),
    head:{skull:'kid',ear:'human',hair:'scruff',hat:'newsboy',scale:1.26},
    outfit:{top:'suit',sleeves:'jacket',neck:'collar',coat:{len:20,lining:false},cuffs:false,rope:1,patches:[[.28,5.4,2.5,0],[.66,-5.2,2.2,1],[-.08,-6.4,2,1]],kneePatch:1,boots:1},
    trail:null,build:null},
  // Nim Dry-Cup, from the Confederacy duneworks, keeps a pump-parts stall on the Shelf. A goblin: big ears with brass rings in them,
  // a long nose, sharp eyes, sandy green-tan; a headcloth wound against the sand, brass-rimmed goggles pushed up on it, her sleeves
  // rolled, a leather waistcoat, a tool apron with wrenches standing in its pocket.
  Nim:{race:'goblin',room:'pit',role:'Keeps the pump stall on the Shelf',temper:null,
    col:pitCol({skin:'#26261a',skinFar:'#333327',lit:{skin:'gskin'},eye:'#e4d38e',earIn:'#2e1814',brow:'#12120b',shirt:'#5b5141',shirtFar:'#453e32',sleeve:'#5b5141',sleeveFar:'#453e32',
      vest:'#2b2117',vestFar:'#3a2e22',apron:'#3b2a1b',apronFar:'#2e2116',trouser:'#2b271f',trouserFar:'#39342b',hat:'#7b6b4f',hatShade:'#544830',
      button:'#b8913e',brass:'#b8913e',brassHi:'#ffe6a0',glass:'#1f3438',strap:'#1d1711',steel:'#69707a'}),
    head:{skull:'goblin',ear:'goblin',hair:'bald',hat:'wrap',goggles:{x:27,y:-38,r:10,a:-.62},earring:[[-7,30.5,3.2],[-45,-21,2.6],[-55,-27,2.3]],scale:1.24},
    outfit:{top:'waistcoat',sleeves:'rolled',neck:'collar',apron:{len:30,ties:1,pocket:1,tools:1},boots:1},
    trail:null,build:null},
  // Osgood Tarr's collectors: work clothes under oilcloth and leather, caps, the Pump King's blue on a rag round the arm. The one who
  // talks is wiry, in a long oilcloth coat, the satchel for the chits at his hip; the big one is heavy, in a short leather coat.
  Collector:{race:'human',room:'pit',role:'Collects the Pump King’s water toll. Does the talking',temper:null,
    col:pitCol({skin:'#1e1612',coat:'#262719',coatFar:'#35372a',suit:'#262719',suitFar:'#35372a',lapel:'#2d2e20',lit:{coat:'leather',suit:'leather'},shirt:'#4b4539',sleeve:'#262719',
      trouser:'#1c1a16',hat:'#2b2721',hatShade:'#1b1814',band:PUMP_BLUE,hair:'#2a211b',beard:'#1f1813',bag:'#3b2a1c',strap:'#21180f',button:'#8a7a5a'}),
    head:{skull:'gaunt',ear:'human',hair:'crop',hat:'flatcap',moustache:1},
    outfit:{top:'coat',sleeves:'jacket',neck:'collar',coat:{len:42},armband:1,satchel:1,boots:1},
    trail:null,build:null},
  'Big collector':{race:'human',room:'pit',role:'Collects the Pump King’s water toll. The heavy',temper:null,
    col:pitCol({skin:'#1b1411',coat:'#231b15',coatFar:'#33291f',suit:'#231b15',suitFar:'#33291f',lapel:'#2b2219',lit:{coat:'leather',suit:'leather'},shirt:'#3f3a31',sleeve:'#231b15',
      trouser:'#1d1a17',hat:'#24262a',hatShade:'#16181b',band:PUMP_BLUE,hair:'#1d1916',beard:'#17120f'}),
    head:{skull:'flat',ear:'human',hair:'bald',hat:'beanie',beard:'short'},
    outfit:{top:'coat',sleeves:'jacket',neck:'collar',coat:{len:30},armband:1,boots:1},
    trail:null,build:null},
  // the old man at the end of the beggars' row: very old and thin, hooded, a pale beard, eyes that still catch the light
  'Old man':{race:'human',room:'pit',role:'Sits at the end of the beggars’ row',temper:null,
    col:pitCol({skin:'#1f1814',eye:'#d2d6d4',hair:'#9c978c',hairShade:'#5f5b53',beard:'#a39e93',hat:'#38322a',hatShade:'#241f19',shawl:'#38322a',shawlFar:'#453e34',
      suit:'#24211c',shirt:'#2f2b25',sleeve:'#2f2b25',coat:'#2b2722',coatFar:'#39342d',trouser:'#1f1c18'}),
    head:{skull:'gaunt',ear:'human',hair:'crop',hat:'hood',beard:'full'},
    outfit:{top:'shirt',sleeves:'shirt',neck:'collar',shawl:1,coat:{len:50,closed:1,lining:false,ragged:2.2},patches:[[.2,5,2.2,0]]},
    trail:null,build:null},
  // the Shelf's stall keepers. The oil seller: a leather apron dark with oil, a waistcoat, sleeves rolled, a flat cap
  'Oil seller':{race:'human',room:'pit',role:'Sells lamp oil on the Shelf',temper:null,
    col:pitCol({skin:'#21170f',apron:'#20180f',apronFar:'#30251a',lit:{apron:'leather'},apronStain:'#000000',shirt:'#4a4234',sleeve:'#4a4234',vest:'#1d1814',hat:'#3a2a1e',hatShade:'#251a12',
      hair:'#2b2018',beard:'#21180f'}),
    head:{skull:'round',ear:'human',hair:'sidepart',hat:'flatcap',beard:'chops'},
    outfit:{top:'waistcoat',sleeves:'rolled',neck:'collar',apron:{len:40,ties:1,stains:1},forearm:.12},
    trail:null,build:null},
  // the grocer: a stout woman, a kerchief over her hair, a shawl, a long skirt and an apron with a pocket for the coin
  Grocer:{race:'human',room:'pit',role:'Sells rice and salt on the Shelf',temper:null,
    col:pitCol({skin:'#22180f',eye:'#a49c8c',hair:'#4a4138',hairShade:'#2a2520',hairHi:'#7a7066',hat:'#2f3b33',hatShade:'#1e2721',shawl:'#3b2a22',shawlFar:'#4a372c',
      shirt:'#2a2620',sleeve:'#2a2620',coat:'#24201c',coatFar:'#332e28',apron:'#4f4a3e',apronFar:'#3e3a31'}),
    head:{skull:'round',ear:'human',hair:'pulled',hat:'kerchief'},
    outfit:{top:'shirt',sleeves:'rolled',neck:'collar',shawl:1,coat:{len:50,closed:1,lining:false},apron:{len:40,ties:1,pocket:1}},
    trail:null,build:null},
  // the linen seller: thin, a pale cloth over her head and shoulders, a long dark skirt and a clean linen apron
  'Linen seller':{race:'human',room:'pit',role:'Sells clean linen on the Shelf',temper:null,
    col:pitCol({skin:'#1f1612',eye:'#a8a49a',hair:'#1c1714',hat:'#8c8476',hatShade:'#5f594f',shawl:'#8c8476',shawlFar:'#6a6458',
      shirt:'#2c2925',sleeve:'#2c2925',coat:'#211e1c',coatFar:'#302c29',apron:'#9b9384',apronFar:'#77715f'}),
    head:{skull:'soft',ear:'human',hair:'pulled',hat:'hood'},
    outfit:{top:'shirt',sleeves:'shirt',neck:'collar',shawl:1,coat:{len:52,closed:1,lining:false},apron:{len:42,ties:1}},
    trail:null,build:null},
  // the grinder: salves and a whetstone wheel; a long leather apron, braces over a shirt, sleeves rolled, a skullcap, a full beard
  Grinder:{race:'human',room:'pit',role:'Sells salves and puts an edge on a knife on the Shelf',temper:null,
    col:pitCol({skin:'#1d1511',apron:'#2a1e14',apronFar:'#382a1e',lit:{apron:'leather'},shirt:'#514838',sleeve:'#514838',braces:'#1e1813',hat:'#2a2622',hatShade:'#1b1815',
      hair:'#231b15',beard:'#2b2119'}),
    head:{skull:'human',ear:'human',hair:'crop',hat:'skullcap',beard:'full'},
    outfit:{top:'shirt',sleeves:'rolled',neck:'collar',braces:1,apron:{len:46,ties:1,pocket:1},forearm:.14,boots:1},
    trail:null,build:null}});

// ---------- the beggars ----------
// Several sit along a stair-street with tin cups. Each is drawn from his or her seed (f.seed, with the place in the row mixed in, so
// a row of them never repeats): rags in the colours of soot and old sacking, a hood, a cloth over the head or none, a shawl, a
// beard or none, patches.
const RAG=['#24211d','#4a4232','#43281c','#36342f','#2f3024','#3a2e22','#2a2724'],SHAWL=['#5a4e3a','#4a2a1e','#3e3c38','#2c3a3a','#51483a','#3a3026'],
  HOODC=['#3a3328','#2f2b25','#4a4030','#2c2a28','#3d2a20','#454039'];
function rpick(R,list){return list[Math.floor(R()*list.length)%list.length];}
function rng(a){return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function beggarSpec(seed){const R=rng(((seed||1)>>>0)*7919+433),woman=R()<.4,rag=rpick(R,RAG),rag2=rpick(R,RAG),hood=rpick(R,HOODC),sh=rpick(R,SHAWL);
  const cover=woman?rpick(R,['kerchief','hood','kerchief']):rpick(R,['hood',null,'skullcap','beanie','flatcap',null]),wrap=woman||R()<.45;
  const hc=rpick(R,['#2a211b','#3a3129','#5a554c','#8e8a80','#1c1816']),beard=woman?null:rpick(R,[null,'full','short','full','chops']);
  return{race:'human',room:'pit',role:'Begs on the stair-streets',temper:null,
    col:pitCol({skin:rpick(R,['#1d1512','#221811','#1a130f','#251b14']),eye:'#9a9f9e',hair:hc,hairShade:mid(hc,'#000000',.45),beard:mid(hc,'#000000',.1),
      hat:hood,hatShade:mid(hood,'#000000',.35),shawl:sh,shawlFar:mid(sh,'#3a3346',.3),shirt:rag,sleeve:rag,shirtFar:mid(rag,'#3a3346',.3),sleeveFar:mid(rag,'#3a3346',.3),
      suit:rag,coat:mid(rag2,'#000000',.1),coatFar:mid(rag2,'#3a3346',.3),trouser:mid(rag2,'#000000',.25),patch:rpick(R,['#4a3e2c','#2f3440','#4a301f','#3f3e36']),patch2:rpick(R,['#55452c','#34342f'])}),
    head:{skull:woman?rpick(R,['soft','round']):rpick(R,['gaunt','human','flat','round']),ear:'human',hair:woman?'pulled':rpick(R,['crop','curly','bald','sidepart']),hat:cover,beard},
    outfit:{top:'shirt',sleeves:R()<.5?'shirt':'rolled',neck:'collar',shawl:R()<.7?1:0,patches:[[.15+R()*.3,3+R()*4,1.8+R()*.8,0],[.5+R()*.3,-4-R()*3,1.6+R()*.8,1]],kneePatch:R()<.6,
      coat:wrap?{len:36+R()*14,closed:1,lining:false,ragged:1.6+R()*1.2}:null},
    trail:null,build:null,seed};}
CL.CAST.Beggar=Object.assign(beggarSpec(1),{vary:beggarSpec});
// a person whose look varies (CAST[name].vary) is drawn from his seed, worked out once for him (kept as f._pitVary, a drawing cache:
// the game never reads it)
{const cs=castSpec;castSpec=function(f){const c=f&&f.pitCast&&CL.CAST[f.pitCast];if(c&&c.vary){const sd=((f.seed||1)*31+(f.idx||0))>>>0,v=f._pitVary;
  if(v&&v.sd===sd&&v.key===f.pitCast)return v.spec;f._pitVary={sd,key:f.pitCast,spec:c.vary(sd)};return f._pitVary.spec;}return cs(f);};}}
// ===== PIT CAST UI END =====
