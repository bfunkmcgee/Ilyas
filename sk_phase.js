// ===== PHASE START =====
// The restaurant goes on past the dining room. Once it is clear, Kael walks through the kitchen door at the back, with Amri if
// she is still on her feet, and a second set of enemies is waiting in the kitchen. With the whole run on, a hidden lift behind
// the kitchen wall goes up to a corporate lobby, and the executive's door off the lobby to his office, where his head of security
// waits. Wounds and most of the damage carry over from room to room.
const FOE2_NAMES=['Orrin','Hesk','Odile'],FOE2_COLORS=['#ff9a3c','#62b6ff','#ffe066'],DEFAULT_TEMPER2=['brute','keeper','rusher'];
const KITCHEN={label:'Kitchen',name:'Lantern Bistro kitchen',ground:()=>GB,wall:null,far:236,indoor:true};
// the door at the back of the dining room, and the kitchen side of it: where each hero heads for, and where they come in
const DINING_DOOR={x:470,slots:[[470,166],[518,148]]};
const KITCHEN_DOOR={x:100,slots:[[112,166],[74,148]]};
// [x, depth, side] for Kael then each enemy once everyone is in the kitchen
const KITCHEN_SPAWN={1:[[300,96],[596,96,1]],2:[[300,96],[600,64,1],[668,108,1]],3:[[300,96],[588,56,1],[650,100,1],[724,146,1]]};
// on the way through each hero gets back a share of their max HP, and each wound eases by a level
let BREATH=.6,WOUND_EASE=1;
// further up they recover more: the lift ride before the lobby, and the smoke clearing before the office
const BREATH_ROOM={lobby:.75,office:1};
// stage timings, in seconds of sim time
const TR={clearMin:1.1,clearMax:3.6,walkMax:2.7,wipeIn:.5,hold:.55,wipeOut:.6,enterMax:3.4},WALK_V=150;
S.backroom=true;S.deep=true;S.room='dining';S.stage={phase:1,tr:null};
S.cfg.foes2=[{seed:1333,weapon:'sword',skill:3,temper:'brute'},{seed:3812,weapon:'sword',skill:2,temper:'keeper'},{seed:1259,weapon:'dagger',skill:2,temper:'rusher'}];
// the lobby's security detail, and the executive's head of security in the office
const FOE3_NAMES=['Sable','Doran','Kessa'],FOE3_COLORS=['#e3e6f2','#e0464f','#ff5fc0'],DEFAULT_TEMPER3=['keeper','brute','rusher'];
S.cfg.foes3=[{seed:2741,weapon:'sword',skill:3,temper:'keeper'},{seed:6611,weapon:'spear',skill:2,temper:'brute'},{seed:4417,weapon:'dagger',skill:2,temper:'rusher'}];
const BOSS={name:'Kade',color:'#ff4d6d',hp:{solo:130,ally:190}};
S.cfg.boss={seed:9137,weapon:'sword',skill:4,temper:'keeper'};
// places the last rooms' modules share (x and depth on the floor; w, h and the desk's h are sizes in floor units): the
// executive's door in the middle of the lobby's back wall, and in his office the desk and the chair behind it, where he sits
// facing the door with the desk between him and the fight
const EXEC_DOOR={x:640,w:84,h:164,slots:[[640,168],[684,152]]};
const DESK={x:770,d:112,hw:34,dz:22,h:48},EXEC_SEAT={x:830,d:116,h:30};
S.hooks.phase=()=>{};
function backroomOn(){return!!S.backroom&&S.arenaKey==='restaurant';}
// the whole run: on past the kitchen to the lobby and the office
function deepOn(){return backroomOn()&&!!S.deep;}
function inTransit(){return!!S.stage.tr;}
function foeCfg(f){return f.hench||f.npc?f.hc:f.boss?S.cfg.boss:(f.p3?S.cfg.foes3:f.p2?S.cfg.foes2:S.cfg.foes)[f.idx-1];}
function foeDefaultTemper(f){return f.hench||f.npc?f.hc.temper:f.boss?S.cfg.boss.temper:(f.p3?DEFAULT_TEMPER3:f.p2?DEFAULT_TEMPER2:DEFAULT_TEMPER)[f.idx-1];}
// the rooms of a restaurant run, in order; each one past the dining room is reached through the last one's way out
const ROOMS={
  dining:{phase:1,name:'dining room',title:'The Dining Room'},
  kitchen:{phase:2,name:'kitchen',title:'The Kitchen',flag:'p2',via:'Through to the kitchen'},
  lobby:{phase:3,name:'lobby',title:'The Lobby',flag:'p3',via:'Up the hidden lift'},
  office:{phase:4,name:'office',title:'The Office',flag:'p4',via:'Through the broken door'}};
function roomName(){return(ROOMS[S.room]||ROOMS.dining).name;}
function nextRoom(){
  if(S.arenaKey!=='restaurant'||S.stage.tr)return null;
  if(S.room==='dining')return backroomOn()?'kitchen':null;
  if(S.room==='kitchen')return deepOn()?'lobby':null;
  if(S.room==='lobby')return deepOn()?'office':null;
  return null;}
// each room's arena, its spawn rows, the way in and the way out (the later rooms' own modules define theirs)
function roomArena(k){return k==='kitchen'?KITCHEN:k==='lobby'?LOBBY:k==='office'?OFFICE:ARENAS.restaurant;}
function roomSpawn(k,n){return k==='kitchen'?KITCHEN_SPAWN[n]:k==='lobby'?LOBBY_SPAWN[n]:k==='office'?OFFICE_SPAWN:SPAWN.restaurant[n];}
function roomEntry(k){return k==='kitchen'?KITCHEN_DOOR:k==='lobby'?LOBBY_ENTRY:k==='office'?OFFICE_ENTRY:null;}
function roomExit(k){return k==='dining'?DINING_DOOR:k==='kitchen'?SECRET_DOOR:k==='lobby'?EXEC_DOOR:null;}
// the names on the wipe card for the room ahead
function roomCard(k){
  if(k==='office')return{phase:'PHASE 4',title:ROOMS.office.title,sub:officeCardLine()};
  const names=(k==='lobby'?FOE3_NAMES:FOE2_NAMES).slice(0,S.cfg.n);
  return{phase:'PHASE '+ROOMS[k].phase,title:ROOMS[k].title,sub:`${names.length>1?names.slice(0,-1).join(', ')+' and '+names[names.length-1]+' are':names[0]+' is'} waiting`};}
// the end of the whole thing, won or lost
function endFight(won){const g=S.game;g.phase='over';g.ex=null;g.aiAt=null;for(const f of S.F)f.intent=null;S.hooks.status();S.hooks.over(won);}

// ---------- a walk across the floor that goes round the dividers and the table ----------
function segHitsTable(x0,z0,x1,z1){if(!tableIntact())return false;const T=S.table,b=tableBox();
  for(let i=0;i<=24;i++){const u=i/24,x=lerp(x0,x1,u),z=lerp(z0,z1,u);if(Math.abs(z-T.dep)<TD+12&&x>b.l-24&&x<b.r+24)return true;}return false;}
function walkPath(f,tx,tz){
  let x=f.station,z=clamp(f.lane,DEP_MIN,DEP_MAX);const pts=[[x,z]];
  for(let k=0;k<5;k++){
    const w=divOnSeg(x,z,tx,tz,16);
    if(w){const c=[w.d0-26,w.d1+26].filter(v=>v>=DEP_MIN&&v<=DEP_MAX);if(!c.length)break;
      c.sort((a,b)=>Math.abs(a-z)+Math.abs(a-tz)-Math.abs(b-z)-Math.abs(b-tz));const dz=c[0],dir=Math.sign(tx-x)||1,past=w.x+dir*(w.t/2+DIV_M+14);
      pts.push([x,dz],[past,dz]);x=past;z=dz;continue;}
    if(segHitsTable(x,z,tx,tz)){const T=S.table,b=tableBox(),c=[T.dep-TD-24,T.dep+TD+24].filter(v=>v>=DEP_MIN&&v<=DEP_MAX);if(!c.length)break;
      c.sort((a,b2)=>Math.abs(a-z)+Math.abs(a-tz)-Math.abs(b2-z)-Math.abs(b2-tz));const dz=c[0],dir=Math.sign(tx-x)||1,past=dir>0?Math.max(b.r+30,x):Math.min(b.l-30,x);
      if(Math.abs(dz-z)>1)pts.push([x,dz]);pts.push([past,dz]);x=past;z=dz;if(!segHitsTable(x,z,tx,tz)){pts.push([tx,tz]);break;}continue;}
    pts.push([tx,tz]);break;}
  return pts;}
function pathLen(pts){let n=0;for(let i=1;i<pts.length;i++)n+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);return n;}
function walkStep(){const T=S.stage.tr;if(!T||!T.walk)return;const st=WALK_V*DT;
  for(const w of T.walk){const f=w.f;if(f.dead||w.k>=w.pts.length)continue;
    const p=w.pts[w.k],dx=p[0]-f.station,dz=p[1]-f.lane,d=Math.hypot(dx,dz);
    if(Math.abs(dx)>3)f.facing=Math.sign(dx);
    if(d<=st){f.station=p[0];f.lane=p[1];w.k++;}else{f.station+=dx/d*st;f.lane+=dz/d*st;}}}
function walkDone(){const T=S.stage.tr;return!T||!T.walk||T.walk.every(w=>w.f.dead||w.k>=w.pts.length);}

// ---------- between the rooms ----------
function beginTransit(){
  const g=S.game,to=nextRoom();g.phase='transit';g.ex=null;g.aiAt=null;S.opening=null;S.queued=null;
  for(const f of S.F){f.intent=null;f.driveSel=null;}
  S.stage.tr={step:'clear',t0:S.t,walk:null,from:S.room,to,card:roomCard(to)};
  S.hooks.phase('clear');S.hooks.status();}
function transitStep(){
  const T=S.stage.tr;if(!T)return;const u=S.t-T.t0;
  if(T.step==='clear'){
    // whoever is still standing lets go and gets up; the last bodies finish falling
    for(const h of S.F){if(h.team!==0||h.dead)continue;if(h.downed&&!h.carry)standUp(h);h.guarding=false;h.counter=false;h.circleGuard=false;h.covering=null;}
    const settled=S.F.every(f=>f.gone||f.npc||(f.dead?f.motor<.08:!f.downed&&f.motor>.85&&S.t>f.knockUntil&&!f.carry&&!f.action));
    if((u>=TR.clearMin&&settled)||u>=TR.clearMax)startPre();}
  else if(T.step==='pre'){if(T.pre(T))startWalk();}
  else if(T.step==='walk'){walkStep();if(u>=T.dur){T.step='wipe';T.t0=S.t;S.hooks.phase('wipe');}}
  else if(T.step==='wipe'){walkStep();
    if(!T.swapped){if(u>=TR.wipeIn){T.swapped=true;swapToRoom(T.to);T.t0=S.t-TR.wipeIn;}}
    else if(u>=TR.wipeIn+TR.hold){T.step='enter';T.t0=S.t;S.hooks.phase('enter');}}
  else if(T.step==='enter'){walkStep();if((u>=TR.wipeOut+.3&&walkDone()&&!S.intro)||u>=TR.enterMax+(S.intro?1.5:0))finishTransit();}
}
// before the walk out of the room: the kitchen's hidden door opens, and Kael blows the lobby's executive door. Each start function
// returns a step function that the transit runs every sim step until it returns true (or null for nothing to do).
function startPre(){
  const T=S.stage.tr,st=T.from==='kitchen'?revealStart(T):T.from==='lobby'?breachStart(T):null;
  if(!st){startWalk();return;}
  T.step='pre';T.t0=S.t;T.pre=st;S.hooks.phase(T.from==='kitchen'?'reveal':'breach');}
function startWalk(){
  const T=S.stage.tr,party=S.F.filter(f=>f.team===0&&!f.dead).sort((a,b)=>a.idx-b.idx);
  for(const f of party){f.action=null;f.station=clamp(f.station,60,maxStation());f.lane=clamp(f.lane,DEP_MIN,DEP_MAX);}
  const slots=roomExit(T.from).slots;
  // whoever is nearer the way out takes the front slot
  const order=party.slice().sort((a,b)=>Math.hypot(a.station-slots[0][0],a.lane-slots[0][1])-Math.hypot(b.station-slots[0][0],b.lane-slots[0][1]));
  T.walk=order.map((f,i)=>{const s=slots[Math.min(i,slots.length-1)];return{f,pts:walkPath(f,s[0],s[1]),k:1};});
  T.step='walk';T.t0=S.t;T.doorT=S.t;T.dur=clamp(Math.max(0,...T.walk.map(w=>pathLen(w.pts)))/WALK_V+.25,.9,TR.walkMax);
  S.hooks.phase('walk');}
// the room behind is left; the next room, its enemies and the heroes are set up behind the wipe
function swapToRoom(to){
  const n=S.cfg.n,boss=to==='office',R=ROOMS[to],sp=boss?roomSpawn(to):roomSpawn(to,crewOn()?3:n),party=S.F.filter(f=>f.team===0&&!f.dead);
  for(const f of S.F)if(f.team===0&&f.dead){if(!f.gone)f.goneFrom=ROOMS[S.room].name;f.gone=true;f.fountain=null;f.finRelease=null;f.impaled=null;f.carry=null;}
  S.room=to;S.arena=roomArena(to);S.stage.phase=R.phase;
  S.opening=null;S.queued=null;S.pending=[];S.rubble=[];S.debris=[];S.items=[];S.blood=[];S.stains=[];S.clinches=[];
  S.ghosts=[];S.popups=[];S.callouts=[];S.flashes=[];S.sparks=[];S.dusts=[];S.rings=[];S.punch=null;S.camKick=null;S.shake=0;S.freeze=0;S.slowT=0;
  // the room's enemies take the last room's places in the roster. They are as tough as the side that actually walks in:
  // if Amri has fallen, Kael faces a set sized for him alone
  const withAlly=party.some(h=>h.ally);
  if(boss){
    // the office: one man to fight. The roster closes up behind him, so every fighter's idx is still its place in S.F
    const fc=S.cfg.boss,f=new Fighter(1,1,BOSS.name,BOSS.color);f.p4=true;f.boss=true;
    Object.assign(f,{seed:fc.seed,weaponKey:fc.weapon,skill:fc.skill});
    S.F=[S.F[0],f,...S.F.filter(h=>h.team===0&&h.idx!==0)];S.F.forEach((h,i)=>{h.idx=i;});
    initFighter(f,sp[1],sp);f.maxHp=f.hp=BOSS.hp[withAlly?'ally':'solo'];S.crew=null;}
  else{
    const hpEach=(withAlly?FOE_HP_ALLY:FOE_HP)[n],lob=to==='lobby',cfg=lob?S.cfg.foes3:S.cfg.foes2,names=lob?FOE3_NAMES:FOE2_NAMES,cols=lob?FOE3_COLORS:FOE2_COLORS;
    for(let i=1;i<=n;i++){const fc=cfg[i-1],f=new Fighter(i,1,names[i-1],cols[i-1]);f[R.flag]=true;
      Object.assign(f,{seed:fc.seed,weaponKey:fc.weapon,skill:fc.skill});S.F[i]=f;initFighter(f,sp[i],sp);f.maxHp=f.hp=hpEach;}
    // crew mode: the last room's henchmen leave the roster and this room's take the next places after its named enemy
    if(crewOn()){S.F.length=rosterSize();crewRoom(to,sp,party);}}
  // the heroes get their own weapons back, catch their breath and stand where the fight will start, so the furniture leaves them room
  const asp=allySpawn(sp),notes=[];
  for(const h of party){const s=h.ally?asp:sp[0],own=h.ally?S.cfg.ally.weapon:S.cfg.hero.weapon,note={f:h,hp:0,weapon:null};
    if(h.weaponKey!==own){h.setWeapon(own);note.weapon=own;}h.ownWeapon=null;if(h.idx===0)h.sidearm='sheathed';
    const before=h.hp;h.hp=Math.min(h.maxHp,h.hp+Math.round(h.maxHp*(BREATH_ROOM[to]??BREATH)));note.hp=h.hp-before;
    for(const z in h.wounds){const w0=h.wounds[z];if(w0){h.wounds[z]=Math.max(0,w0-WOUND_EASE);if(h.wounds[z]<w0&&z!=='body')note.eased=true;}}
    Object.assign(h,{foot:FOOT_MAX,daze:0,guarding:false,counter:false,circleGuard:false,covering:null,clinch:null,carry:null,downed:false,impaled:null,spin:null,spinFace:null,flair:null,
      intent:null,tgt:null,driveSel:null,finRelease:null,fountain:null,dsd:{},laneT:-9,action:null,
      // what they had read, a feint in hand and the last step: all kept by roster place, so none of it carries into the next room
      reads:{},feint:null,feintRead:null,lastAct:null,holdFace:null,setSpear:false,wallPin:false});
    h.facing=1;h.station=s[0];h.lane=h.dep=h.stepDep=s[1];h.vdep=0;h.build();notes.push(note);}
  S.target=1;
  // the office's own cast: the executive behind his desk (he does not fight)
  if(boss)officeSetup(sp,party);
  if(S.introOn){S.intro=null;prepIntro(S.F.filter(f=>f[R.flag]),S.t+90*DT+TR.hold+.12);}
  // the bill runs on through every room
  const bill=S.bill;S.table=null;S.wares=[];if(S.tableOn){const td=tableDefault();if(td)placeTable(td.x,td.d);}
  envBuild();S.bill=bill;
  S.trails=S.F.map(()=>[]);
  warm(90);
  // now into the doorway, and the walk to their places
  const T=S.stage.tr,door=roomEntry(to).slots;
  T.walk=party.sort((a,b)=>a.idx-b.idx).map((h,i)=>{const s=h.ally?asp:sp[0],d0=door[Math.min(i,door.length-1)];
    h.station=d0[0];h.lane=h.dep=h.stepDep=d0[1];h.vdep=0;h.facing=1;h.build();return{f:h,pts:walkPath(h,s[0],s[1]),k:1};});
  T.notes=notes;
  S.hooks.phase('swap');S.hooks.status();}
function finishTransit(){
  const g=S.game,T=S.stage.tr;S.stage.tr=null;if(S.intro){S.intro=null;for(const f of S.F){f.sheath=null;f.introUntil=0;}}
  for(const f of S.F){if(f.dead||f.npc)continue;f.lane=clamp(f.lane,DEP_MIN,DEP_MAX);f.station=clampSt(f,f.station,f.lane);f.ready=Math.round(actionCost(f,'slash')*.5);}
  g.phase='idle';g.turnNo++;g.ex=null;g.aiAt=null;
  S.hooks.log({type:'phase',phase:ROOMS[S.room].phase,room:S.room,foes:foes(),notes:T?T.notes:[]});
  S.hooks.phase('fight');
  startTurn(nextActor());}

// ---------- the kitchen ----------
// new furniture: crates, barrels, flour sacks and an iron stove that nobody moves and that burns whoever is driven into it
Object.assign(PROP,{
  crate:{name:'crate',brk:400,dz:12,fr:.85,land:4,surface:[0,1]},
  barrel:{name:'barrel',brk:520,dz:13,fr:.7,land:5,surface:[0,1]},
  sack:{name:'flour sack',brk:250,dz:11,fr:.95,land:2},
  stove:{name:'stove',brk:1e9,dz:16,fr:1,land:7,surface:[0,1],solid:true,hot:true}});
Object.assign(WARE,{pot:{r:5.5,brk:9999,col:'brass',n:0,spl:null,tough:true},jar:{r:4,brk:130,col:'glass',n:8,spl:'rgba(214,160,60,.6)'}});
Object.assign(DIV_MAT,{
  shelf:{name:'Crockery shelf',the:'the crockery shelf',word:'shelf',hp:2,h:142,t:12,cost:260,slam:4,breach:7,snd:'china',bill:'shelf'},
  slats:{name:'Larder slats',the:'the larder slats',word:'slats',hp:2,h:150,t:8,cost:110,slam:4,breach:7,snd:'wood',bill:'slats'}});
Object.assign(PRICE,{crate:25,barrel:70,sack:15,shelf:260,slats:110,preptable:220,jar:12});
Object.assign(PRICE_NAME,{crate:'crate',barrel:'barrel',sack:'flour sack',shelf:'crockery shelf',slats:'larder slats',preptable:'prep table',jar:'jar'});
SHARD_COL.flour='rgba(246,241,228,.92)';
const PROP_SHAPE={
  crate(P,x,g,sd){P.pts=[mkPt(x-20,g-36,.6,2.5),mkPt(x+20,g-36,.6,2.5),mkPt(x-20,g-2,.8,2.5),mkPt(x+20,g-2,.8,2.5)];P.segs=[[0,1,3],[0,2,3],[1,3,3],[2,3,3],[0,3,3],[1,2,3]];},
  barrel(P,x,g,sd){P.pts=[mkPt(x-15,g-50,.9,3),mkPt(x+15,g-50,.9,3),mkPt(x-16,g-2,1.2,3),mkPt(x+16,g-2,1.2,3),mkPt(x-19,g-26,1,3),mkPt(x+19,g-26,1,3)];
    P.segs=[[0,1,3],[0,4,3],[4,2,3],[1,5,3],[5,3,3],[2,3,3],[0,3,3],[1,2,3]];},
  sack(P,x,g,sd){P.pts=[mkPt(x-12,g-24,.5,4),mkPt(x+12,g-24,.5,4),mkPt(x-15,g-3,.7,3),mkPt(x+15,g-3,.7,3),mkPt(x+sd*2,g-32,.3,4)];P.segs=[[0,1,4],[0,2,4],[1,3,4],[2,3,3],[0,4,3],[4,1,3]];},
  stove(P,x,g,sd){P.fixed=true;const m=Infinity;P.pts=[mkPt(x-22,g-64,m,3),mkPt(x+22,g-64,m,3),mkPt(x-22,g-2,m,3),mkPt(x+22,g-2,m,3)];P.segs=[[0,1,5],[0,2,5],[1,3,5],[2,3,5],[0,3,5],[1,2,5]];}};
const PROP_BREAK={
  crate(P,piece,dir,c,cy,D){const p=P.pts;piece(p[0],p[1],5,'#7a5634',{loot:'club'});piece(p[2],p[3],5,'#6a4a2c');piece(p[0],p[2],4,'#7a5634');piece(p[1],p[3],4,'#6a4a2c',{loot:'club'});
    for(let i=0;i<10;i++)shard('wood',c,cy,D,dir,1);for(let i=0;i<5;i++)shard('terra',c,cy,D,dir,.8);},
  barrel(P,piece,dir,c,cy,D){const p=P.pts;for(const [a,b] of [[0,4],[4,2],[1,5],[5,3]])piece(p[a],p[b],5,'#5a3a24');piece(p[0],p[1],3,'#3a3f44');piece(p[2],p[3],3,'#3a3f44');
    for(let i=0;i<8;i++)shard('wood',c,cy,D,dir,1);spill(c,D,6,30,'rgba(92,12,32,.78)');},
  sack(P,piece,dir,c,cy,D){for(let i=0;i<70;i++)shard('flour',c+(Math.random()-.5)*20,cy-6,D,dir*.4,.7);for(let i=0;i<5;i++)dust(c,cy-i*6,1.6,D,'#f6f1e4');
    spill(c,D,8,26,'rgba(246,241,228,.55)');piece(P.pts[2],P.pts[3],5,'#c9b48a');}};
function hotRef(r){return!!(r&&r.type&&PROP[r.type]&&PROP[r.type].hot);}
// anything that never breaks (the stove) takes the blow, and a hot one burns
function solidPropHit(P,dir){const T=PROP[P.type];if(!T.hot||S.warming)return;const b=P.box,q={x:b.cx,y:b.t+10};
  sparks(q,14,'#ffb347',P.dep);dust(b.cx,b.t+4,.9,P.dep,'#9a9a9a');flash(q,26,'#ffcf7a',P.dep);S.hooks.sound('clang',.7);S.hooks.sound('sizzle',1);}
function kitchenDivs(){addDiv('slats',178,18,104);addDiv('shelf',604,124,DEP_MAX+6);}
function buildKitchen(){
  if(S.divOn)kitchenDivs();
  nudgeOutOfDivs();
  const P2=(type,x,d,s)=>spotFree(x,d,type==='cart'?32:type==='barrel'?20:18,PROP[type].dz)?addProp(type,x,d,s):null;
  if(tableIntact()){S.table.props=[];tableWares();}
  // the iron stove against the right-hand wall, a pot on top of it
  const st=addProp('stove',862,72,1);addWare('pot',st,856,0);
  const R=mulberry32(5151+S.cfg.n*7+(allyOn()?3:0));
  // crates and barrels against the walls, flour by the larder, a trolley of crockery in the aisle
  const C1=P2('crate',96,36,1);if(C1&&R()<.8)addWare('jar',C1,94,0);
  P2('barrel',772,24,1);P2('crate',818,30,-1);P2('crate',862,26,1);
  const B1=P2('barrel',252,160,1);if(B1)addWare('jar',B1,250,0);
  P2('sack',140,124,1);P2('sack',322,166,-1);P2('sack',540,166,1);
  const C=P2('cart',520,28,1);if(C){addWare('plate',C,498,-4);addWare('bowl',C,512,2);addWare('plate',C,526,-2);addWare('jar',C,542,3);}
  P2('stool',700,30,1);P2('stool',382,30,-1);
  // enamel lamps over the floor
  for(const [x,d,y] of [[200,60,284],[330,118,286],[470,62,284],[600,96,286],[740,56,286],[760,150,288],[470,150,288]])addLamp(x,d,y,'hood');
}
// the prep table's tools, laid again whenever the table is put back
function kitchenTableWares(){const b=tableBox();
  for(const [k,u,dd] of [['pot',.16,-6],['plate',.3,-9],['jar',.44,7],['bowl',.58,-6],['pot',.74,5],['jar',.88,-8]])addWare(k,'T',lerp(b.l+6,b.r-6,u),dd);}
// ===== PHASE END =====
