// ===== OFFICE START =====
// Phase 4: the executive's office, entered through the door that was blown off in the lobby. His desk (DESK) and his chair (EXEC_SEAT),
// both defined in sk_phase.js, stand at the right-hand end of the room; the fight stays to the left of them.
// Contract: OFFICE (arena; maxX keeps every station left of the desk), OFFICE_SPAWN ([x,depth,side] for Kael then the head of security),
// OFFICE_ENTRY {x,slots} (where the heroes come in through the blown doorway), buildOffice() and officeDivs() (props, lamps, dividers).
// buildOffice adds the desk as a fixed prop of type 'desk' at (DESK.x, DESK.d), and the chair as a prop of type 'execchair' just
// behind EXEC_SEAT with no collision segments (the finale may shove it). The fight's furniture: a drinks cart with bottles and glasses,
// a sculpture on a plinth, a globe, a leather armchair, a floor lamp and two fig trees, with linear chandeliers overhead; what breaks
// goes on the bill by name. A few pieces of the blown door lie on the floor inside the doorway (S.floorPieces). The office's glassware
// has kinds of its own ('whisky', 'carafe'): the lobby already has a 'tumbler' and a 'decanter' in another make.
const OFFICE={label:'Office',name:'Executive office',ground:()=>GB,wall:null,far:236,indoor:true,maxX:DESK.x-DESK.hw-26};
const OFFICE_SPAWN=[[300,96],[560,96,1]];
const OFFICE_ENTRY={x:110,slots:[[120,168],[86,150]]};
Object.assign(PROP,{
  desk:{name:'desk',brk:1e9,dz:DESK.dz,fr:1,land:6,surface:[0,1],solid:true},
  execchair:{name:'chair',brk:1e9,dz:10,fr:.3,land:3,solid:true},
  barcart:{name:'drinks cart',brk:440,dz:12,fr:.2,land:4,surface:[0,1]},
  sculpt:{name:'sculpture',brk:290,dz:9,fr:.9,land:3},
  globe:{name:'globe',brk:310,dz:10,fr:.85,land:3},
  armchair:{name:'leather armchair',brk:560,dz:15,fr:.92,land:5},
  floorlamp:{name:'floor lamp',brk:290,dz:6,fr:.85,land:2},
  ficus:{name:'fig tree',brk:270,dz:10,fr:.86,land:3}});
Object.assign(WARE,{
  // (kinds of their own: the lobby has a 'tumbler' and a 'decanter' of its own, in another make)
  whisky:{r:3.6,brk:125,col:'glass',n:8,spl:'rgba(196,122,40,.65)'},
  carafe:{r:5,brk:185,col:'glass',n:13,spl:'rgba(190,110,30,.72)'}});
Object.assign(PRICE,{barcart:160,sculpt:480,globe:190,armchair:360,floorlamp:120,ficus:90,whisky:14,carafe:70});
Object.assign(PRICE_NAME,{barcart:'drinks cart',sculpt:'sculpture',globe:'globe',armchair:'leather armchair',floorlamp:'floor lamp',ficus:'fig tree',whisky:'whisky tumbler',carafe:'decanter'});
BILL_ORDER.splice(BILL_ORDER.indexOf('cart')+1,0,'barcart','armchair','sculpt','globe','floorlamp','ficus');
BILL_ORDER.splice(BILL_ORDER.indexOf('glass')+1,0,'whisky','carafe');
Object.assign(SHARD_COL,{bronze:'#8a6a3a',marble:'#d9d3c8',leather:'#6a2a28'});
Object.assign(PROP_SHAPE,{
  // the top and the panel on the side facing the room; the far side is open for the knees of whoever sits at it
  desk(P,x,g,sd){P.fixed=true;const m=Infinity,hw=DESK.hw,h=DESK.h;P.pts=[mkPt(x-hw,g-h,m,4),mkPt(x+hw,g-h,m,4),mkPt(x-hw+3,g-2,m,3),mkPt(x+hw-3,g-2,m,3)];P.segs=[[0,1,4],[0,2,4]];},
  // the seat's front and rear, the top of the back, the hub, and two casters out on the floor so that it stands
  execchair(P,x,g,sd){P.pts=[mkPt(x-14,g-EXEC_SEAT.h,4,3),mkPt(x+12,g-EXEC_SEAT.h,4,3),mkPt(x+16,g-104,3,3),mkPt(x,g-4,6,3),mkPt(x-20,g-3,3,2.5),mkPt(x+20,g-3,3,2.5)];P.segs=[];},
  // the cart: a brass frame on wheels with a glass top, a lower shelf
  barcart(P,x,g,sd){P.hp=2;P.pts=[mkPt(x-30,g-72,.7,3),mkPt(x+30,g-72,.7,3),mkPt(x-28,g-6,.9,5),mkPt(x+28,g-6,.9,5)];P.segs=[[0,1,3],[2,3,3],[0,2,2],[1,3,2]];},
  // the sculpture: a stone plinth with a bronze form on it
  sculpt(P,x,g,sd){P.pts=[mkPt(x-15,g-62,.9,3),mkPt(x+15,g-62,.9,3),mkPt(x-16,g-2,1.3,3),mkPt(x+16,g-2,1.3,3),mkPt(x,g-112,.35,5)];P.segs=[[0,1,4],[0,2,4],[1,3,4],[2,3,4],[4,0,3]];},
  // the globe: a brass stand, a sphere in a ring
  globe(P,x,g,sd){P.pts=[mkPt(x,g-62,.6,11),mkPt(x,g-26,.6,3),mkPt(x-15,g-2,.9,2.5),mkPt(x+15,g-2,.9,2.5)];P.segs=[[0,1,4],[1,2,2.5],[1,3,2.5]];},
  // the armchair: seat, back and arms on four short legs
  armchair(P,x,g,sd){P.pts=[mkPt(x-sd*24,g-34,1,5),mkPt(x+sd*24,g-72,.7,6),mkPt(x-25,g-3,1.4,4),mkPt(x+25,g-3,1.4,4),mkPt(x+sd*22,g-34,1,5)];
    P.segs=[[0,4,8],[4,1,6],[0,2,3],[4,3,3],[2,3,3]];},
  // the floor lamp: a tall stem on a round foot with a shade at the top
  floorlamp(P,x,g,sd){P.pts=[mkPt(x,g-152,.3,6),mkPt(x,g-10,.5,2),mkPt(x-14,g-2,.8,2),mkPt(x+14,g-2,.8,2)];P.segs=[[0,1,3],[2,3,2]];},
  // the fig tree: a tall pot and a trunk with its crown
  ficus(P,x,g,sd){P.pts=[mkPt(x-14,g-38,.7,3),mkPt(x+14,g-38,.7,3),mkPt(x-12,g-2,1,2.5),mkPt(x+12,g-2,1,2.5),mkPt(x,g-114,.25,4),mkPt(x,g-38,.3,3)];P.segs=[[0,1,3],[0,2,3],[1,3,3],[5,4,12]];}});
Object.assign(PROP_BREAK,{
  barcart(P,piece,dir,c,cy,D){const p=P.pts;piece(p[0],p[1],4,'#8fa6a0');piece(p[2],p[3],4,'#5a4630');piece(p[0],p[2],2.6,'#a8843e');piece(p[1],p[3],2.6,'#a8843e');
    for(let i=0;i<16;i++)shard('glass',c,cy-8,D,dir,1);for(let i=0;i<5;i++)shard('brass',c,cy,D,dir,1);},
  sculpt(P,piece,dir,c,cy,D){const p=P.pts;piece(p[0],p[1],6,'#d9d3c8');piece(p[2],p[3],6,'#cfc8bc');piece(p[0],p[2],5,'#bdb6aa');piece(p[1],p[3],5,'#bdb6aa');piece(p[4],p[0],4,'#8a6a3a');
    for(let i=0;i<10;i++)shard('marble',c,cy,D,dir,1);for(let i=0;i<5;i++)shard('bronze',p[4].x,p[4].y,D,dir,1);for(let i=0;i<4;i++)dust(c,cy+i*10,1.4,D,'#d9d3c8');},
  globe(P,piece,dir,c,cy,D){const p=P.pts;piece(p[0],p[1],2.4,'#a8843e');piece(p[1],p[2],2.6,'#8a6a2e');piece(p[1],p[3],2.6,'#8a6a2e');
    for(let i=0;i<12;i++)shard('paper',p[0].x,p[0].y,D,dir,1);for(let i=0;i<5;i++)shard('brass',c,cy,D,dir,.9);},
  armchair(P,piece,dir,c,cy,D){const p=P.pts;piece(p[0],p[4],8,'#6a2a28');piece(p[4],p[1],7,'#5a2422');piece(p[0],p[2],3,'#2a1810');piece(p[4],p[3],3,'#2a1810');
    for(let i=0;i<6;i++)shard('leather',c,cy,D,dir,.9);for(let i=0;i<5;i++)shard('wood',c,cy,D,dir,1);},
  floorlamp(P,piece,dir,c,cy,D){const p=P.pts;piece(p[0],p[1],2.4,'#a8843e');piece(p[2],p[3],3,'#3a2a1c');
    for(let i=0;i<9;i++)shard('paper',p[0].x,p[0].y+6,D,dir,.9);for(let i=0;i<6;i++)shard('glass',p[0].x,p[0].y+8,D,dir,.8);sparks(p[0],12,'#ffe3a0',D);flash(p[0],30,'#fff1c9',D);},
  ficus(P,piece,dir,c,cy,D){const p=P.pts;for(let i=0;i<12;i++)shard('china',c,P.box.b-16,D,dir,1);for(let i=0;i<12;i++)shard('leaf',P.pts[4].x,P.pts[4].y,D,dir,.8);
    piece(p[5],p[4],3,'#4a3424',{fronds:true});spill(c,D,4,18,'rgba(38,24,16,.85)');}});
S.floorPieces=S.floorPieces||[];
// the desk's lamp and papers jump when the desk is knocked
{const kw0=kickWares;kickWares=function(host,dir,pow){if(host&&host.type==='desk'){host.rock=Math.max(host.rock||0,clamp(.5+(pow||1)*.5,.5,1.6));host.rockDir=dir||1;}return kw0(host,dir,pow);};}
V11.step.push(()=>{for(const P of S.props)if(P.rock>0){P.rock=P.rock<.02?0:P.rock*(1-2.6*DT);}});
function buildOffice(){
  if(S.divOn)officeDivs();
  nudgeOutOfDivs();
  const desk=addProp('desk',DESK.x,DESK.d,1);addProp('execchair',EXEC_SEAT.x+4,EXEC_SEAT.d+4,-1);
  // on the desk: his whisky (set well left of the seat: the executive's hands rest on the desk out to x 790 and would knock it off)
  addWare('whisky',desk,DESK.x+2,-2);
  const P2=(type,x,d,s)=>spotFree(x,d,type==='barcart'?34:type==='armchair'?30:type==='sculpt'?20:18,PROP[type].dz)?addProp(type,x,d,s):null;
  const R=mulberry32(6161+S.cfg.n*7+(allyOn()?3:0));
  // the drinks cart in the middle of the room, with the evening's bottles and glasses; the armchair and the sculpture by the walls
  const C=P2('barcart',470,34,1);if(C){addWare('carafe',C,450,-2);addWare('bottle',C,462,-5);addWare('glass',C,473,-1);addWare('glass',C,483,-4);addWare('whisky',C,493,0);}
  P2('armchair',364,26,1);P2('sculpt',486,166,1);P2('globe',632,172,1);
  // nothing tall in front of the desk, where the last scene plays: the floor lamp stands back by the cart, a fig frames the right
  P2('floorlamp',548,22,1);P2('ficus',34,30,1);P2('ficus',860,20,1);
  // linear chandeliers over the room, and a pendant over the cart
  for(const [x,d,y,k] of [[270,112,286,'linear'],[500,104,286,'linear'],[648,64,288,'linear'],[392,44,288,'pendant']])addLamp(x,d,y,k);
  // a few pieces of the blown door inside the doorway
  S.floorPieces=restPieces(9,46,226,128,182,4242+S.cfg.n);
}
function officeDivs(){}
// ===== OFFICE END =====
