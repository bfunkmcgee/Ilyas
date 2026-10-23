// ===== LOBBY START =====
// Phase 3: the corporate lobby high above the restaurant, reached by the hidden lift (its doors are in the back wall at the left), with
// the executive's closed door (EXEC_DOOR, defined in sk_phase.js) in the middle of the back wall. The security detail stands in front of
// that door and the fight takes place between lounge furniture, glass and stone.
// Contract: LOBBY (arena), LOBBY_SPAWN[n] ([x,depth,side] for Kael then each enemy, n = 1..3), LOBBY_ENTRY {x,slots} (where the heroes
// come in, out of the lift), LOBBY_CREW_DOOR (where a crew-mode henchman comes in: {kind:'lobby',x,z,how}), LOBBY_TABLE ({x,d} of a
// breakable table, or null), buildLobby() and lobbyDivs() (props, lamps and dividers through the env system), lobbyTableWares().
const LOBBY={label:'Lobby',name:'Hallowell lobby',ground:()=>GB,wall:null,far:236,indoor:true};
const LOBBY_SPAWN={1:[[300,96],[596,96,1]],2:[[300,96],[600,64,1],[668,108,1]],3:[[300,96],[588,56,1],[650,100,1],[724,146,1]]};
// the lift: the middle of its doors in the back wall (world x), the opening and its frame (floor units). The heroes step out of it and a
// henchman comes out of it; the two doorways below are the same lift
const LOBBY_LIFT={x:96,w:58,h:142,fr:5,hd:9};
const LOBBY_ENTRY={x:LOBBY_LIFT.x,slots:[[110,166],[76,148]]};
const LOBBY_CREW_DOOR={kind:'lobby',x:LOBBY_LIFT.x,z:DEP_MAX+6,how:'out of the lift'};
// a glass coffee table in the front of the room, between the two armchairs
const LOBBY_TABLE={x:470,d:58};
// ---------- the furniture: lounge chairs, sofas, poufs, side tables, planters and plinths, frosted glass, and what stands on them ----------
Object.assign(PROP,{
  lounger:{name:'lounge chair',brk:400,dz:17,fr:.8,land:4},
  sofa:{name:'sofa',brk:480,dz:15,fr:.85,land:5},
  pouf:{name:'pouf',brk:300,dz:12,fr:.85,land:3,surface:[0,1]},
  sidetable:{name:'side table',brk:300,dz:11,fr:.8,land:3,surface:[0,1]},
  planter:{name:'planter',brk:380,dz:12,fr:.85,land:4},
  plinth:{name:'plinth',brk:560,dz:12,fr:.9,land:5,surface:[0,1]}});
Object.assign(WARE,{
  decanter:{r:5,brk:130,col:'glass',n:10,spl:'rgba(150,84,30,.7)'},
  tumbler:{r:3.5,brk:110,col:'glass',n:8,spl:'rgba(150,84,30,.55)'},
  orchid:{r:5,brk:150,col:'china',n:8,spl:'rgba(30,20,14,.6)'},
  orb:{r:6,brk:130,col:'glass',n:13,spl:null}});
Object.assign(DIV_MAT,{frost:{name:'Frosted partition',the:'the frosted glass',word:'frosted glass',hp:2,h:158,t:8,cost:520,slam:5,breach:8,snd:'glass',bill:'frostwall'}});
Object.assign(PRICE,{lobbytable:380,frostwall:520,sofa:340,lounger:150,pouf:80,sidetable:95,planter:120,plinth:210,decanter:60,tumbler:14,orchid:45,orb:80});
Object.assign(PRICE_NAME,{lobbytable:'glass table',frostwall:'frosted partition',sofa:'sofa',lounger:'lounge chair',pouf:'pouf',sidetable:'side table',planter:'planter',plinth:'plinth',decanter:'decanter',tumbler:'tumbler',orchid:'orchid',orb:'glass orb'});
{const after=(k,list)=>{const i=BILL_ORDER.indexOf(k);BILL_ORDER.splice(i<0?BILL_ORDER.length:i+1,0,...list);};
  BILL_ORDER.splice(BILL_ORDER.indexOf('bistro'),0,'lobbytable');after('glasswall',['frostwall']);after('stool',['sofa','lounger','pouf','sidetable','planter','plinth']);after('glass',['decanter','tumbler','orchid','orb']);}
SHARD_COL.foam='#e6dfce';SHARD_COL.stone='#8b92a3';
// a box on four points: the top corners, then the two feet (the base line of the shape runs left to right)
const lobbyBox=(w0,w1,h,m,mb,rad)=>(P,x,g)=>{P.pts=[mkPt(x-w0,g-h,m,rad),mkPt(x+w0,g-h,m,rad),mkPt(x-w1,g-2,mb,rad),mkPt(x+w1,g-2,mb,rad)];P.segs=[[0,1,rad],[0,2,rad],[1,3,rad],[2,3,rad],[0,3,rad],[1,2,rad]];};
Object.assign(PROP_SHAPE,{
  lounger:lobbyBox(22,24,52,.8,1.2,3),sofa:lobbyBox(56,58,44,1.1,1.8,3),pouf:lobbyBox(16,17,24,.6,1,3),plinth:lobbyBox(12,14,86,1.6,2.4,3),
  sidetable(P,x,g){P.pts=[mkPt(x-17,g-42,.5,3),mkPt(x+17,g-42,.5,3),mkPt(x-14,g-2,.8,2.5),mkPt(x+14,g-2,.8,2.5)];P.segs=[[0,1,3],[0,2,2.5],[1,3,2.5]];},
  planter(P,x,g){P.pts=[mkPt(x-16,g-36,.9,3),mkPt(x+16,g-36,.9,3),mkPt(x-14,g-2,1.3,2.5),mkPt(x+14,g-2,1.3,2.5),mkPt(x,g-108,.25,4),mkPt(x,g-36,.4,3)];P.segs=[[0,1,3],[0,2,3],[1,3,3],[2,3,3],[5,4,14]];}});
Object.assign(PROP_BREAK,{
  lounger(P,piece,dir,c,cy,D){const p=P.pts;piece(p[0],p[1],8,'#5a1f2c');piece(p[2],p[3],7,'#34111a');piece(p[0],p[2],5,'#c9a25a',{loot:'chairleg'});piece(p[1],p[3],5,'#c9a25a',{loot:'chairleg'});
    for(let i=0;i<9;i++)shard('foam',c,cy,D,dir,1);for(let i=0;i<4;i++)shard('brass',c,cy,D,dir,.8);},
  sofa(P,piece,dir,c,cy,D){const p=P.pts,m=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2,px:(a.px+b.px)/2,py:(a.py+b.py)/2});piece(p[0],m(p[0],p[1]),8,'#5a1f2c');piece(m(p[0],p[1]),p[1],8,'#5a1f2c');piece(p[2],p[3],7,'#34111a');
    piece(p[0],p[2],5,'#c9a25a',{loot:'chairleg'});piece(p[1],p[3],5,'#c9a25a',{loot:'chairleg'});for(let i=0;i<14;i++)shard('foam',c+(Math.random()-.5)*60,cy,D,dir,1);for(let i=0;i<5;i++)shard('brass',c,cy,D,dir,.8);},
  pouf(P,piece,dir,c,cy,D){const p=P.pts;piece(p[0],p[1],10,'#5a1f2c');piece(p[2],p[3],5,'#c9a25a');for(let i=0;i<8;i++)shard('foam',c,cy,D,dir,1);},
  sidetable(P,piece,dir,c,cy,D){const p=P.pts;piece(p[0],p[1],4,'#1c2233');piece(p[0],p[2],3,'#c9a25a');piece(p[1],p[3],3,'#c9a25a');for(let i=0;i<10;i++)shard('glass',c,cy,D,dir,1);for(let i=0;i<3;i++)shard('brass',c,cy,D,dir,.8);},
  planter(P,piece,dir,c,cy,D){const p=P.pts;for(let i=0;i<10;i++)shard('stone',c,P.box.b-16,D,dir,1);for(let i=0;i<12;i++)shard('leaf',p[4].x,p[4].y,D,dir,.8);
    piece(p[5],p[4],3,'#2f5a3a',{fronds:true});piece(p[0],p[2],6,'#6a7080');piece(p[1],p[3],6,'#6a7080');spill(c,D,4,20,'rgba(30,20,14,.85)');},
  plinth(P,piece,dir,c,cy,D){const p=P.pts;piece(p[0],p[2],9,'#aeb4c2');piece(p[1],p[3],9,'#9aa0ae');piece(p[0],p[1],7,'#c8ccd6');for(let i=0;i<10;i++)shard('stone',c,cy,D,dir,1);for(let i=0;i<3;i++)dust(c,cy-i*10,1.4,D,'#d8dae2');}});
// a frosted partition breaks as glass does and is billed as itself; the glass table goes to pieces in glass
{const dc=divChip,bd=breakDivider,bt=breakTable;
  divChip=w=>w.mat==='frost'?'#dbe6f4':dc(w);
  breakDivider=(w,dir)=>{if(!w||w.state==='broken'||w.mat!=='frost'){bd(w,dir);return;}const g=DIV_MAT.glass;DIV_MAT.glass=DIV_MAT.frost;w.mat='glass';
    try{bd(w,dir);}finally{w.mat='frost';DIV_MAT.glass=g;}if(w.rem)w.rem.h=44;};
  breakTable=()=>{const T=S.table,was=T&&T.state;bt();if(S.room!=='lobby'||!T||was==='broken'||T.state!=='broken')return;
    const A=T.pts[0],B=T.pts[1],dir=T.breakDir||1,cx=(A.x+B.x)/2,cy=(A.y+B.y)/2;
    for(let i=0;i<46;i++)shard('glass',cx+(Math.random()-.5)*TABLE_W*.9,cy+(Math.random()-.5)*4,T.dep+(Math.random()-.5)*TD*1.4,dir,1.1);
    for(let i=0;i<4;i++)shard('brass',cx,cy,T.dep,dir,.8);S.hooks.sound('glass',1.2);};}
function lobbyTableWares(){const b=tableBox();
  for(const [k,u,dd] of [['decanter',.3,-4],['tumbler',.46,3],['tumbler',.56,-5],['orb',.78,-1]])addWare(k,'T',lerp(b.l+6,b.r-6,u),dd);}
function lobbyDivs(){addDiv('frost',212,18,84);addDiv('frost',808,20,128);}
function buildLobby(){
  if(S.divOn)lobbyDivs();
  nudgeOutOfDivs();
  const P2=(type,x,d,s)=>spotFree(x,d,type==='sofa'?58:type==='lounger'?26:type==='plinth'||type==='planter'?18:17,PROP[type].dz)?addProp(type,x,d,s):null;
  if(tableIntact()){S.table.props=[];tableWares();}
  const R=mulberry32(7171+S.cfg.n*7+(allyOn()?3:0));
  // the waiting area in the front: a sofa and a side table at the left, armchairs round the glass table, poufs, a second sofa at the right.
  // The strip along the back wall stays bare: it is the way from the lift to the executive's door
  P2('sofa',112,34,1);const T1=P2('sidetable',250,30,1);if(T1)addWare('orchid',T1,250,0);
  P2('lounger',380,44,1);P2('lounger',566,40,-1);const Q1=P2('pouf',330,26,1);if(Q1&&R()<.8)addWare('orchid',Q1,330,0);
  P2('sofa',690,30,-1);
  // the right-hand end: a plinth with a glass orb on it, planters, a pouf behind the frosted partition
  const PL=P2('plinth',776,86,1);if(PL)addWare('orb',PL,776,0);P2('planter',868,40,1);P2('pouf',846,150,1);P2('planter',802,166,1);
  // ring lamps hang over the floor
  for(const [x,d,y] of [[150,60,274],[330,128,276],[470,100,274],[560,52,274],[730,120,276],[830,60,274]])addLamp(x,d,y,'ring');
}
// ===== LOBBY END =====
