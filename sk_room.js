// ===== ROOM START =====
// The room in the fight, in two parts.
// Events: the physics decides and the game celebrates it. A body knocked flying (by a blow, a shove or a throw, alive or dead) that
// really meets another man, a hanging lamp, the table or a pane sets off what the impact would: the man it meets goes down or is
// knocked back, the lamp comes down, the table breaks or goes over, the pane bursts. Nothing is planned: the ragdolls' own contact,
// its speed and the two bodies' weights decide it. What happens is an event: a beat of slow motion, a callout and a line in the log.
// Room moves: each turn the game reads where everyone stands and offers a move or two the moment allows: hurl a man into one of his
// own lined up beyond him, put a man through the pane at his back, flip the table onto the man across it, bring down the lamp hanging
// over a man. They are commands of their own (room1 and room2, the dock's Room group), and the enemies use them too.

// ---------- events ----------
// fly: a body this slack (motor) is being thrown about rather than moving itself; flySpd: how fast (px/s) it has to go for its contact
// to count; hit: the closing speed at which a body meets a man; down: the impact (closing speed by the two bodies' weights) that puts
// him down (a boss takes more); slow: the beat of slow motion (seconds of real time); burst: the speed a body bursts each kind of pane
// at (the booth wall's plaster and the concrete barriers hold); lampFall: brings a hanging lamp down; tableBreak: through the table
// from above; tableTip: over it from the side, which spins it about its far feet at the speed over tipSpin (rad/s)
const ROOMEV={fly:.62,flySpd:160,hit:150,down:300,bossDown:460,slow:.6,
  burst:{paper:190,glass:290,frost:310,slats:330,plank:400,shelf:450},lampFall:330,tableBreak:400,tableTip:300,tipSpin:70};
S.hooks.roomEvent=()=>{};S.hooks.roomDone=()=>{};
// events only while a fight is being fought: not in a scene, between rooms or once it is over
function roomLive(){const ph=S.game&&S.game.phase;return!S.warming&&(ph==='input'||ph==='exchange');}
function roomFlying(f){return!!f&&!f.gone&&!f.npc&&!f.carry&&!f.offstage&&!f.mount&&!f.impaled&&!f.half&&(f.dead||f.motor<ROOMEV.fly);}
function roomSpeed(f){let s=0;for(const i of [PEL,CHE,HEAD]){const q=f.p[i];s=Math.max(s,Math.hypot(q.vx0,q.vy0)/DT);}return s;}
// who set a flying body going: the attacker whose target it was, or whoever sent the body that bowled it over (for two seconds)
function roomBy(f){const r=f&&f._roomBy;return r&&S.t-r.t<2?r.by:null;}
function roomMark(f,by){if(f&&by&&by!==f)f._roomBy={by,t:S.t};}
// a man of the other side put down by something Kael set going is a takedown of his: it adds to his flow (once a man, an event)
function roomTakedown(by,f){if(by&&by===hero()&&f&&f.team!==by.team&&(f.dead||f.downed)&&!(f._roomFlow>S.t-.6)){f._roomFlow=S.t;chainAdd();}}
// the moment, celebrated: a beat of slow motion, the camera's punch, a callout over the man it happened to, a line in the log
function roomEvent(kind,f,by,text,at,extra){
  if(!roomLive())return;const o=at||f;
  S.slowT=Math.max(S.slowT,ROOMEV.slow);S.freeze=Math.max(S.freeze,.06);S.shake=Math.max(S.shake,8);S.punch={x:prjX(o.p[PEL].x,o.dep),t:0};
  for(const c of S.callouts)if(c.i===o.idx&&c.room)c.age=c.life;
  S.callouts.push({i:o.idx,text,age:0,life:1.7,dx:0,big:true,room:true});
  S.roomN=(S.roomN||0)+1;S.hooks.roomEvent(Object.assign({kind,f,by,text,at:o},extra||{}));}

// a flying body that meets a man standing: he goes down if the impact is big enough, and is knocked back if it is not (the man
// making the move is no flying body, however hard he lunges, steps or rolls)
function roomBodies(){
  const ex=S.game.ex;
  for(const F of S.F){if(!roomFlying(F)||(ex&&F===ex.A))continue;
    // (sent flying in a man's exchange: his target, or a man of the other side caught up in it, unless someone else just did)
    if(ex&&ex.A&&(ex.D===F||ex.D2===F||(F.team!==ex.A.team&&!(F._roomBy&&S.t-F._roomBy.t<.5))))roomMark(F,ex.A);
    if(roomSpeed(F)<ROOMEV.flySpd)continue;
    // (a throw aimed at a man lands on him by the throw's own rules, and a shove into the man behind him by the shove's)
    const own=ex&&ex.D===F?(ex.domino||(ex.info&&ex.info.hazard&&ex.info.hazard.kind==='body'?ex.info.hazard.o:null)):null;
    const by=roomBy(F),hits=F._roomHits||(F._roomHits={});
    for(const O of S.F){
      if(O===F||O===by||O===own||(ex&&O===ex.A)||!upright(O)||O.gone||O.carry||O.offstage||O.walkIn||O.mount||Math.abs(O.dep-F.dep)>20)continue;
      if(hits[O.idx]!=null&&S.t-hits[O.idx]<1.5)continue;
      if(F.clinch&&clinchPartner(F)===O)continue;
      const a=O.p[HEAD],b=O.p[PEL],rO=O.body.torsoW*.9,dx=b.x-a.x,dy=b.y-a.y,l2=dx*dx+dy*dy||1;
      for(const i of [PEL,CHE,HEAD]){const q=F.p[i],t=clamp(((q.x-a.x)*dx+(q.y-a.y)*dy)/l2,0,1),cx=a.x+dx*t,cy=a.y+dy*t;
        let nx=q.x-cx,ny=q.y-cy;const d=Math.hypot(nx,ny);if(d>=(q.r||4)+rO||d<1e-6)continue;nx/=d;ny/=d;
        const s=-((q.vx0-lerp(a.vx0,b.vx0,t))*nx+(q.vy0-lerp(a.vy0,b.vy0,t))*ny)/DT;
        if(s<ROOMEV.hit)continue;hits[O.idx]=S.t;roomBodyHit(F,O,by,s,nx,ny);break;}}}}
function roomBodyHit(F,O,by,s,nx,ny){
  const imp=s*clamp(F.body.mass/O.body.mass,.5,1.8),down=imp>=(O.boss?ROOMEV.bossDown:ROOMEV.down),dir=Math.sign(-nx)||Math.sign(O.station-F.station)||1;
  // he takes the push the way the body was going, and the body spends much of its speed in him
  const k=Math.min(imp,700)*DT*(down?.55:.35);for(const q of O.p){q.px+=nx*k;q.py+=ny*k*.3;}
  for(const i of [PEL,CHE,HEAD,KNF,KNB]){const q=F.p[i];q.px=lerp(q.px,q.x,.45);q.py=lerp(q.py,q.y,.2);}
  O.station=clampSt(O,O.station+dir*(down?24:14));dust(O.p[CHE].x,O.p[CHE].y,.9,O.dep);S.hooks.sound('thud',380);
  const foe=by&&by.team!==O.team?by:null;roomMark(O,by);
  if(down){knockDown(O);roomEvent('body',F,by,F.dead?'Bowled over by the body':'Bowled over',O,{down:true,o:O});roomTakedown(by,O);}
  else{O.motor=Math.min(O.motor,.55);O.ready+=10;knockBalance(O,2,foe);popup(O,'Knocked back','#ffd9a8',null,17,-4);
    if(roomLive())S.hooks.roomEvent({kind:'body',f:F,by,text:'Knocked back',at:O,down:false,o:O,quiet:true});}}

// a body that meets a pane fast enough bursts it and goes through (a pane a blow or a shove was aimed at breaks by their rules)
{const odh=onDivHit;onDivHit=function(w,f,q,i,spd){
  if(w.state==='standing'&&i!==TIP&&ROOMEV.burst[w.mat]&&spd>=ROOMEV.burst[w.mat]&&roomFlying(f)&&roomLive()){const ex=S.game.ex;
    if(!(ex&&ex.divSlam===w)){roomPane(w,f,q);return true;}}
  return odh.apply(this,arguments);};}
// what a pane does when a body goes through it, for the callout (the popup says where he went)
const PANE_CALL={paper:'Torn through',glass:'Shattered',frost:'Shattered',slats:'Smashed through',plank:'Smashed through',shelf:'Into the crockery'};
function paneCall(w){return PANE_CALL[w.mat]||'Smashed through';}
function roomPane(w,f,q){
  const dir=Math.sign(q.vx0)||-divSide(f,w),by=roomBy(f),dmg=DIV_MAT[w.mat].breach||5;
  w.hitY=q.y;w.hitD=f.dep;breakDivider(w,dir);
  if(!f.dead){f.hp=Math.max(0,f.hp-dmg);popup(f,String(dmg),'#ffffff','Through '+divThe(w),22);if(f.hp<=0)kill(f,dir);else if(!f.downed)knockDown(f);}
  roomEvent('pane',f,by,paneCall(w),f,{w});roomTakedown(by,f);}

// a hanging lamp a flying body hits hard enough comes down; one that comes down on a man standing under it hits him
{const lh=lampHit;lampHit=function(L,vn,f){const was=L.fallen;lh.apply(this,arguments);
  if(!was&&vn>=ROOMEV.lampFall&&roomFlying(f)&&roomLive()){if(!L.fallen){L.fallen=true;S.hooks.sound('crack',.6);}L.dropBy=roomBy(f);
    roomEvent('lamp',f,L.dropBy,'Down comes the lamp',f,{L});}};}
function roomLamps(){
  for(const L of S.lamps){if(!L.fallen||L.struck)continue;const p=L.p,dr=L.drop;
    // a lamp brought down on a man by a room move: it lands on him, or beside him if he read it
    if(dr){const O=dr.D;if(O.dead||O.gone){L.struck=true;continue;}if(dr.ok)L.dep=lerp(L.dep,O.dep,.25);
      const h=O.p[HEAD];if(L.landed||p.y>=h.y-O.body.headR-L.r){L.struck=true;if(dr.ok)roomLampHit(L,O,dr.by,dr);else roomLampMiss(L,O);}continue;}
    if(L.landed){L.struck=true;continue;}
    for(const O of S.F){if(O.dead||O.gone||O.npc||O.downed||O.carry||Math.abs(O.dep-L.dep)>18)continue;const h=O.p[HEAD];
      if(Math.abs(p.x-h.x)>O.body.headR+L.r+6||p.y<h.y-O.body.headR-L.r-2||p.y>O.p[CHE].y)continue;
      L.struck=true;roomLampHit(L,O,L.dropBy,null);break;}}}
function roomLampHit(L,O,by,dr){
  const crush=!!(dr&&dr.crush),dmg=5+Math.floor(S.rng()*5)+(crush?3:0),foe=by&&by.team!==O.team?by:null;
  O.hp=Math.max(0,O.hp-dmg);O.daze=1;O.motor=Math.min(O.motor,.5);
  const p=L.p;flash(p,32,'#fff3cf',L.dep);sparks(p,14,'#ffd9a8',L.dep);for(let i=0;i<8;i++)shard('glass',p.x,p.y+4,L.dep,0,.7);
  S.hooks.sound('glass',.9);S.hooks.sound('thud',320);popup(O,String(dmg),'#ffffff','The lamp',22);
  if(L.lit){L.lit=false;L.dead=S.t;bill('lamp');}
  // the shade glances off him and drops beside him
  p.px=p.x-(Math.sign(p.x-O.p[HEAD].x)||1)*1.4;
  if(O.hp<=0)kill(O,Math.sign(O.station-(by?by.station:O.station-1))||1);
  else{knockBalance(O,2,foe);if(crush)knockDown(O);}
  if(dr)roomEvent('lamp',O,by,'Down comes the lamp',O,{L,hit:true,dmg});
  else if(roomLive())S.hooks.roomEvent({kind:'lamp',f:O,by,text:'Under the lamp',at:O,L,hit:true,dmg,quiet:true});
  roomTakedown(by,O);if(dr&&dr.ex)S.hooks.roomDone(dr.ex,{ok:true,label:'The lamp',dmg});}
function roomLampMiss(L,O){popup(O,'Clear','#c9d0f5','the lamp just misses',17);S.hooks.sound('glass',.6);const dr=L.drop;if(dr&&dr.ex)S.hooks.roomDone(dr.ex,{ok:false,label:'Missed'});}

// a flying body that comes down on the table hard breaks it; one that hits its side hard tips it over
{const otc=onTableContact;onTableContact=function(f,q,spd){
  const T=S.table,ex=S.game.ex;
  if(T&&T.state==='intact'&&roomFlying(f)&&roomLive()&&!(ex&&ex.D===f&&ex.res&&(ex.res.table||ex.res.tableDmg))){const top=tableTopAt(q.x);
    if(spd>=ROOMEV.tableBreak&&q.vy0>0&&q.y<top+8){T.breakDir=Math.sign(q.vx0)||1;breakTable();roomTableHit(f);return;}
    if(spd>=ROOMEV.tableTip&&Math.abs(q.vx0)>Math.abs(q.vy0)&&q.y<top+20&&!(T.tipBy&&S.t-T.tipBy.t<.4)){roomTip(Math.sign(q.vx0)||1,spd);T.tipBy={f,by:roomBy(f),t:S.t};}}
  return otc.apply(this,arguments);};}
function roomTableHit(f){const by=roomBy(f);
  if(!f.dead){f.hp=Math.max(0,f.hp-4);popup(f,'4','#ffffff','Through the table',22);if(f.hp<=0)kill(f,Math.sign(f.p[PEL].vx0)||1);else if(!f.downed)knockDown(f);}
  roomEvent('table',f,by,'Table smashed',f,{broke:true});roomTakedown(by,f);}
// spin the table about one of its feet, w radians a second (+: its top going right)
function roomSpin(pivot,w){const P=S.table.pts,c=P[pivot],k=w*DT;for(const q of P){if(q===c)continue;const dx=q.x-c.x,dy=q.y-c.y;q.px=q.x+dy*k;q.py=q.y-dx*k;}}
// a body into the table's side: it turns over its far feet, as hard as the body came in
function roomTip(dir,spd){roomSpin(dir>0?2:3,dir*Math.min(9,spd/ROOMEV.tipSpin));kickProps(dir,1);}
V11.step.push(()=>{
  if(!roomLive())return;roomBodies();if(S.lamps.length)roomLamps();
  const T=S.table;if(T&&T.tipBy&&!T.tipSeen&&T.state==='toppled'){T.tipSeen=true;if(S.t-T.tipBy.t<2)roomEvent('table',T.tipBy.f,T.tipBy.by,'Over goes the table',T.tipBy.f);}});

// ---------- room moves ----------
// hurl: grab a man and hurl him into one of his own standing 34 to 150 units beyond him (on a success both go down); pane: put a man
// with a pane at his back through it; flip: heave the table over onto the man across it, or throw off it a man sprawled on it; lamp:
// cut down the lamp hanging over a man.
// Each is a roll: a hurl or a pane is a throw without a hold (his build and footing against the other's), the table and the lamp are
// a move the other has to read and get out from under. They cost tempo and balance; a hurl or a pane he braces against costs the
// thrower a pip more.
const ROOM_COST={hurl:85,pane:80,flip:75,lamp:70},ROOM_FOOT={hurl:1,pane:1,flip:1,lamp:0};
ACTIONS.room1={name:'Room move',cost:70};ACTIONS.room2={name:'Room move',cost:70};NEEDS_FOOT.push('room1','room2');
// what the room offers A: the best two, at most one of each kind
function roomMoves(A){
  if(!A||A.dead||A.downed||A.clinch||A.carry||A.mount||A.offstage||A.beast||A.npc||A.walkIn||(typeof isGun==='function'&&isGun(A)))return[];
  const out=[],gap=D=>Math.abs(D.station-A.station)-engageGap(A,D),open=D=>!tableBetween(A,D)&&!(S.divs.length&&divBetween(A,D));
  for(const D of rivals(A)){if(D.beast||D.walkIn||D.offstage||D.carry||D.clinch||D.mount)continue;
    const dir=Math.sign(D.station-A.station)||A.facing;
    if(gap(D)<=40&&Math.abs(D.lane-A.lane)<=34&&open(D)){
      // two in a line: one of his own just beyond him
      let E=null,be=1e9;
      for(const o of rivals(A)){if(o===D||o.beast||o.walkIn||o.offstage||o.carry||o.clinch||o.mount)continue;const dx=(o.station-D.station)*dir,dz=Math.abs(o.lane-D.lane);
        if(dx>=34&&dx<=150&&dz<=40&&dx+dz<be){be=dx+dz;E=o;}}
      if(E&&!tableBetween(D,E)&&!(S.divs.length&&divOnSeg(D.station,D.lane,E.station,E.lane,8)))out.push({cmd:'hurl',D,E,dir,score:6});
      // a pane at his back
      for(const w of S.divs){if(w.state!=='standing'||!ROOMEV.burst[w.mat]||!divBand(w,D.lane,4)||roomSide(D,w)!==-dir)continue;
        const g=((dir>0?divL(w):divR(w))-D.station)*dir;if(g<0||g>72)continue;out.push({cmd:'pane',D,w,dir,score:5});break;}}
    // the table between them, and him close to its far side: heave it over onto him
    if(tableIntact()){const T=S.table,b=tableBox(),inLane=f=>Math.abs(f.lane-T.dep)<TD+20,aS=A.station<b.cx?-1:1,dS=D.station<b.cx?-1:1;
      const aG=aS<0?b.l-A.station:A.station-b.r,dG=dS<0?b.l-D.station:D.station-b.r;
      const clearTo=(f,x)=>!(S.divs.length&&divOnSeg(f.station,f.lane,x,T.dep,6));
      if(inLane(A)&&inLane(D)&&aS!==dS&&aG>=-6&&aG<=130&&dG>=-6&&dG<=110&&clearTo(A,aS<0?b.l:b.r)&&clearTo(D,dS<0?b.l:b.r))out.push({cmd:'flip',D,dir:-aS,score:5});}
    // a lamp hanging over him (not one swinging wide), in reach of a weapon
    if(!A.wp.unarmed&&gap(D)<=60&&Math.abs(D.lane-A.lane)<=60)for(const L of S.lamps){
      if(L.fallen||Math.abs(L.dep-D.lane)>24||Math.abs(L.x-D.station)>28||Math.abs(L.p.x-L.x)>40)continue;out.push({cmd:'lamp',D,L,score:4});break;}}
  // one sprawled on the table: heave it over and throw him off it
  if(tableIntact()){const T=S.table,b=tableBox(),aS=A.station<b.cx?-1:1,aG=aS<0?b.l-A.station:A.station-b.r;
    if(Math.abs(A.lane-T.dep)<TD+20&&aG>=-6&&aG<=130&&!(S.divs.length&&divOnSeg(A.station,A.lane,aS<0?b.l:b.r,T.dep,6)))
      for(const D of S.F){if(D.team===A.team||D.dead||D.npc||D.gone||D.carry||D.beast||D.clinch||D.mount||!(D.downed||!upright(D))||Math.abs(D.dep-T.dep)>TD+8)continue;
        if(![PEL,CHE].some(i=>{const p=D.p[i];return p.x>b.l+2&&p.x<b.r-2&&p.y<=tableTopAt(p.x)+2;}))continue;out.push({cmd:'flip',D,dir:-aS,score:7,on:true});break;}}
  out.sort((a,b)=>b.score-a.score||Math.abs(a.D.station-A.station)-Math.abs(b.D.station-A.station));
  const seen={},best=[];for(const m of out){if(seen[m.cmd])continue;seen[m.cmd]=1;best.push(m);if(best.length===2)break;}
  return best;}
function roomKey(m){return m?m.cmd+':'+m.D.idx:'';}
// which side of a divider a man is on, read without setting divSide's memo (the drawing asks what the room offers too, and it must
// not change the game)
function roomSide(f,w){const m=f.dsd;return m&&m[w.id]!=null?m[w.id]:Math.sign(f.p[PEL].x-w.x)||1;}
// the move a room slot holds now (room1 keeps the one an enemy planned while it is still there)
function roomPick(A,slot){const ms=roomMoves(A);if(!ms.length)return null;
  if(slot==='room1'&&A._roomPick){const m=ms.find(x=>roomKey(x)===A._roomPick);if(m)return m;}
  return ms[slot==='room2'?1:0]||null;}
function roomMods(A,D,cmd){
  const heave=cmd==='hurl'||cmd==='pane';
  const mods=[['skill',A.skill],heave||cmd==='flip'?['build',Math.round((A.body.bulk-D.body.bulk)*4)]:['weapon',A.wp.acc||0],[footLabel(A),post(A).atk],['dazed',A.daze?-2:0],['outclassed',outclassMod(A,D)]];
  const defMods=[[post(D).name.toLowerCase(),heave?post(D).resist:post(D).def],['limp',-D.wounds.leg],['dazed',D.daze?-2:0]];
  return{mods,bonus:sumMods(mods),dc:(cmd==='flip'?9:10)+D.skill+sumMods(defMods),defMods};}
function roomChance(A,m){return chanceOf(roomMods(A,m.D,m.cmd));}
{const cv=cmdValid;cmdValid=function(A,D,cmd){if(cmd==='room1'||cmd==='room2')return!!A&&!A.dead&&!A.downed&&!A.clinch&&A.foot>=1&&!!roomPick(A,cmd);return cv(A,D,cmd);};}
{const sa=slotAction;slotAction=function(A,D,slot){if(slot==='room1'||slot==='room2')return A&&!A.dead&&roomPick(A,slot)?slot:null;return sa(A,D,slot);};}
{const mc=moveCost;moveCost=function(A,D,cmd,op){if(cmd==='room1'||cmd==='room2'){const m=roomPick(A,cmd);return m?ROOM_COST[m.cmd]-ACTIONS[cmd].cost:0;}return mc.apply(this,arguments);};}
{const fd=footDelta;footDelta=function(A,cmd,T){if(cmd==='room1'||cmd==='room2'){const m=roomPick(A,cmd);return m?-ROOM_FOOT[m.cmd]:0;}return fd.apply(this,arguments);};}
{const cm=command;command=function(i,cmd,opts){if(cmd!=='room1'&&cmd!=='room2')return cm(i,cmd,opts);
  opts=opts||{};const g=S.game;if(g.phase!=='input'||g.active!==i||S.opening)return false;
  const A=S.F[i],m=roomPick(A,cmd);if(!m||!cmdValid(A,m.D,cmd))return false;
  g.phase='exchange';g.aiAt=null;if(!opts.prepaid)A.ready+=actionCost(A,cmd,moveCost(A,m.D,cmd));
  if(A.team===1)A.intent=null;A._roomPick=null;setTgtAny(A,m.D);
  const ex={A,D:m.D,t0:S.t,cmd:m.cmd==='hurl'||m.cmd==='pane'?'throw':'room',perf:{},depth:0,dazedAtStart:A.daze>0,room:m};g.ex=ex;
  A.covering=null;A.counter=false;A.guarding=false;A.lastAct='room';A.setSpear=false;A.wallPin=false;A.holdFace=null;A.feint=null;A.feintRead=null;
  faceToward(A,m.D.station);roomLaunch(A,m,ex);S.hooks.log({type:'room',A,D:m.D,ex,m,res:ex.res});S.hooks.status();return true;};}
function roomLaunch(A,m,ex){
  const D=m.D,tr=rollVs(roomMods(A,D,m.cmd),{kind:'room',room:m.cmd});tr.dmg=tr.ok?3+Math.floor(S.rng()*4)+(tr.crush?3:0):0;
  ex.res=tr;beginAction(A,'room',null,{foot:ROOM_FOOT[m.cmd]});let plan;
  if(m.cmd==='hurl'){const info={how:'toss',x:clampStage(m.E.station-m.dir*10),hazard:{kind:'body',o:m.E},dir:m.dir};plan=planHurl(A,D,tr,info);ex.info=info;}
  else if(m.cmd==='pane'){const w=m.w,far=m.dir>0?divR(w):divL(w),info={how:'toss',x:clamp(far+m.dir*34,40,W-40),hazard:{kind:'div',w,dir:m.dir,through:true,st:2},dir:m.dir};
    if(tr.ok){startBreach(w,D,m.dir,.9);ex.divSlam=w;}plan=planHurl(A,D,tr,info);ex.info=info;}
  else if(m.cmd==='flip')plan=planFlip(A,D,tr,m);
  else plan=planLamp(A,D,tr,m);
  A.action=plan.att;ex.plan=plan;ex.dur=plan.Tend;ex.perf={dash:Math.round(plan.dash||0)};}
// a takedown by a room move carries the mover on to the next man in reach, as a blow's would
function roomFlowOn(ex,A,D){if(A.dead||A.downed||!(D.dead||D.downed))return;const E=flowTarget(A,D);if(E)considerFlow(ex,A,E);}
// hurl: in at him, a grip on his collar, and the whole body turned into the throw; he flies low and fast into the other
function planHurl(A,D,tr,info){
  const dP=Math.sign(D.station-A.station)||A.facing,arm=A.arm,ex=S.game.ex,T0=.2,dist=Math.abs(info.x-D.p[PEL].x),air=clamp(dist/360,.3,.6),Tl=T0+air,Tend=Tl+.45;
  A.facing=dP;const grip=()=>({x:D.p[CHE].x-dP*D.body.torsoW*.4,y:lerp(D.p[CHE].y,D.p[HEAD].y,.25)});
  const sx=clampSt(A,D.station-dP*(arm*.6+D.body.torsoW*.5+6)),dash=Math.abs(sx-A.station),one=!A.wp.off;
  // (the reach and the heave are the beasts' toss: sk_beast.js)
  const reach=armPose(A,poseA(A,'tossReach'),one?{off:{fn:grip}}:{hand:{fn:grip}});
  if(!tr.ok){const Te=T0+.45;
    const body=bodyKeys(A,[[0,'now'],[T0,'tossGrab',{px:sx},eOut],[T0+.26,'tossFail',{px:sx}],[Te,'guard',sstep]]);
    const armK=armKeys(A,[[0,'now'],[T0,reach,eOut],[Te,'guard',sstep]]);
    const events=[{t:T0+.03,fn:()=>{spendFoot(A,1);A.ready+=10;D.station=clampSt(D,D.station+dP*14);for(const q of D.p)q.px-=dP*90*DT;
      popup(D,'Braces','#a5dcff',null,19);S.hooks.sound('thud',220);S.hooks.roomDone(ex,{ok:false,label:'Braced'});S.hooks.status();}}];
    return{att:{t0:S.t,end:Te,body,arm:armK},Tend:Te+.1,events,dash,strikeX:sx,Cfn:grip};}
  const lift={fn:()=>{const c=A.p[CHE];return{x:c.x+dP*.5*arm,y:c.y-.45*arm};}},heave=armPose(A,poseA(A,'tossHeave'),one?{off:lift}:{hand:lift});
  const body=bodyKeys(A,[[0,'now'],[T0,'hurlLoad',{px:sx},eOut],[T0+air*.4,'hurlTurn',{px:sx},sstep],[Tl,'guard',{px:sx},sstep],[Tend,'guard',sstep]]);
  const armK=armKeys(A,[[0,'now'],[T0,reach,eOut],[T0+air*.38,heave,eOut],[Tl,'guard',sstep],[Tend,'guard']]);
  const hz=info.hazard,E=hz&&hz.kind==='body'?hz.o:null;
  const events=[{t:T0,fn:()=>{if(D.dead||D.downed)return;startCarry(A,D,info,air);const c=D.carry;if(!c)return;info.started=true;
      c.apex={x:lerp(c.from.x,info.x,.5),y:Math.min(c.from.y,A.p[CHE].y)-(16+dist*.1)};c.spin=-dP*Math.PI*.55;
      // he flies at the other man's depth
      if(E)D.vdep=clamp((E.dep-D.dep)/.2,-260,260);S.hooks.sound('swoosh',2.4);}},
    {t:Tl,fn:()=>{if(!info.started){S.hooks.roomDone(ex,{ok:false,label:'No throw'});return;}const up=E&&!E.downed&&!E.dead;landThrow(A,D,tr,info);
      if(E&&up&&(E.downed||E.dead)){roomEvent('hurl',D,A,'Two down',E,{o:E,down:true});roomTakedown(A,E);}
      else if(hz&&hz.kind==='div'&&!divSolid(hz.w))roomEvent('pane',D,A,paneCall(hz.w),D,{w:hz.w});
      roomTakedown(A,D);roomFlowOn(ex,A,D);S.hooks.roomDone(ex,{ok:true});}}];
  S.callouts.push({i:A.idx,text:E?'Hurl':'Through it',age:0,life:1,dx:-A.facing*20});
  return{att:{t0:S.t,end:Tend,body,arm:armK},Tend:Tend+.1,events,dash,strikeX:sx,Cfn:grip};}
// flip: down to the near edge of the table, both hands under it, and up: it goes over and across onto the man beyond
function planFlip(A,D,tr,m){
  const b=tableBox(),dir=m.dir,T0=.24,T1=.5,Tend=1.05,edge=dir>0?b.l:b.r,ex=S.game.ex;
  const sx=clampStage(edge-dir*(A.arm*.45+A.body.torsoW*.5+6)),dash=Math.abs(sx-A.station);A.facing=dir;
  const eY=()=>S.table?tableTopAt(edge)+6:S.arena.ground(edge,A.lane)-30;
  const low=armPose(A,poseA(A,'flipGrip'),{hand:{fn:()=>({x:edge-dir*2,y:eY()})},...(A.wp.off?null:{off:{fn:()=>({x:edge-dir*6,y:eY()+4})}})});
  const body=bodyKeys(A,[[0,'now'],[T0,'flipLow',{px:sx},eOut],[T1,'flipHeave',{px:sx},sstep],[Tend,'guard',sstep]]);
  const armK=armKeys(A,[[0,'now'],[T0,low,eOut],[T1,'flipHeave',eOut],[Tend,'guard',sstep]]);
  const events=[{t:T0+.04,fn:()=>roomFlipTable(dir,D,tr.ok,m.on)},{t:T0+.5,fn:()=>roomFlipLand(A,D,tr,dir,ex,m.on)}];
  S.callouts.push({i:A.idx,text:'Table',age:0,life:1,dx:-A.facing*20});
  return{att:{t0:S.t,end:Tend,body,arm:armK},Tend:Tend+.1,events,dash,strikeX:sx,Cfn:()=>({x:b.cx,y:b.t})};}
// the heave: the table leaves the floor turning over, thrown across at him (short of him if he reads it); a man on it goes with it,
// or rolls off the near side first if he reads it
function roomFlipTable(dir,D,ok,on){const T=S.table;if(!T||T.state!=='intact')return;const P=T.pts;
  let cx=0,cy=0;for(const q of P){cx+=q.x;cy+=q.y;}cx/=4;cy/=4;
  const aim=on?cx+dir*(ok?70:40):D.p[PEL].x-dir*(ok?14:64),vx=clamp((aim-cx)/.5,-430,430)*DT,vy=-250*DT,w=dir*5.2*DT;
  for(const q of P){q.px=q.x-(vx-(q.y-cy)*w);q.py=q.y-(vy+(q.x-cx)*w);}
  if(on&&!D.dead){if(ok)for(const q of D.p){q.px-=dir*230*DT;q.py+=200*DT;}else for(const q of D.p){q.px+=dir*130*DT;q.py+=60*DT;}}
  kickProps(dir,1.6);T.flipT=S.t;T.tipBy=null;S.hooks.sound('thud',260);}
function roomFlipLand(A,D,tr,dir,ex,on){
  const T=S.table;if(T&&T.state==='intact'){T.state='toppled';S.hooks.status();}
  if(T){const b=tableBox();dust(b.cx,S.arena.ground(b.cx,T.dep),1.3,T.dep);S.shake=Math.max(S.shake,9);S.hooks.sound('thud',420);}
  if(D.dead||(D.downed&&!on)){S.hooks.roomDone(ex,{ok:false,label:'Over'});return;}
  if(tr.ok){const dmg=tr.dmg+2;D.hp=Math.max(0,D.hp-dmg);popup(D,String(dmg),'#ffffff','The table',22);S.hooks.sound('crit',dmg);
    for(const q of D.p){q.px-=dir*120*DT;q.py+=30*DT;}
    if(D.hp<=0)kill(D,dir);else knockDown(D);roomEvent('flip',D,A,'Over goes the table',D);roomTakedown(A,D);roomFlowOn(ex,A,D);
    S.hooks.roomDone(ex,{ok:true,label:'The table',dmg});}
  else{if(!on)D.station=clampSt(D,D.station+dir*26);popup(D,on?'Rolls clear':'Steps clear','#a5dcff',null,18);S.hooks.roomDone(ex,{ok:false,label:'Clear'});}
  S.hooks.status();}
// the lamp: a cut up at its chain; it drops on him, or beside him if he reads it and steps out from under it
function planLamp(A,D,tr,m){
  const L=m.L,T0=.26,Tend=1.05,ex=S.game.ex,arm=A.arm,dP=Math.sign(D.station-A.station)||A.facing;A.facing=dP;
  const cut={x:L.p.x,y:L.p.y-26};
  const body=bodyKeys(A,[[0,'now'],[T0,'lampCut',eOut],[Tend,'guard',sstep]]);
  const armK=armKeys(A,[[0,'now'],[T0*.6,'lampWind',eOut],[T0,'lampCut',{hand:{fn:()=>({x:lerp(A.p[CHE].x,cut.x,.55),y:A.p[HEAD].y-.4*arm})}},eIn],[Tend,'guard',sstep]]);
  const events=[{t:T0,fn:()=>{if(L.fallen){S.hooks.roomDone(ex,{ok:false,label:'Gone'});return;}
    const h=D.p[HEAD],p=L.p,tx=tr.ok?h.x:h.x+(Math.sign(p.x-h.x)||dP)*30,tf=.3;
    L.fallen=true;L.drop={D,ok:tr.ok,crush:tr.crush,by:A,ex};p.px=p.x-(tx-p.x)/tf*DT;p.py=p.y-.6;
    if(!tr.ok)D.station=clampSt(D,D.station-(Math.sign(tx-h.x)||1)*24);
    sparks(cut,8,'#ffd9a8',L.dep);S.hooks.sound('clang',.6);S.hooks.sound('crack',.5);}}];
  return{att:{t0:S.t,end:Tend,body,arm:armK},Tend:Tend+.1,events,dash:0,strikeX:A.station,Cfn:()=>cut};}
// the enemies use them: the brutes most, the keepers least; Kael on auto and Amri now and then
{const ac=aiChoice;aiChoice=function(i){const c=ac(i),A=S.F[i];if(!A||A.dead||A.downed||A.clinch)return c;
  const ms=roomMoves(A);if(!ms.length||A.foot<1)return c;
  // the better the odds, the likelier he takes it; under one in three never
  const m=ms[0],ch=roomChance(A,m),p=(A.temper==='brute'?.42:A.temper==='rusher'?.3:A.temper==='keeper'?.16:.24)*(S.showcase?1.5:1)*clamp((ch-.35)/.3,0,1.3);
  if(p>0&&S.rng()<p){A._roomPick=roomKey(m);return'room1';}
  return c;};}
// ===== ROOM END =====
