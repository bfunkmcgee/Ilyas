// ===== CREW START =====
// Crew mode: one named enemy leads a gang of henchmen. Two stand on the floor when the fight starts and the rest come in one at a time
// as others fall, so no more than three enemies are ever on their feet. The fight is over only when the last of them is down.
// Everything that tunes the gang is in this table.
const CREW={
  color:'#9aa6b8',            // the grey of the henchmen's eyes
  size:6,kitchen:4,lobby:4,   // henchmen with the named enemy in the open and the dining room, with Orrin in the kitchen, with Sable in the lobby
  floor:2,standing:3,         // on the floor when the fight starts; the most enemies on their feet at once, the named one included
  named:{solo:60,ally:110},   // HP of the named enemy (Qadir, or Orrin in the kitchen) in a crew fight
  hp:{solo:12,ally:18},       // one clean cut each, two at most: Kael's cut does 13 to 24
  dmg:.6,                     // a henchman's blows land with this share of their weight: the danger is in numbers, not in any one of them
  skill:[[1,2],[2,1]],        // [skill, weight]: mostly Novice, one in three Trained
  weapons:[['sword',3],['dagger',5],['axe',.5],['spear',1],['club',2]],   // blades first, the odd greataxe, spear or table leg
  tempers:[['brute',1],['keeper',1],['rusher',1],['plain',1]],
  lag:1.6,                    // a newcomer's first turn comes this many slashes' worth of tempo after the earliest one
  walk:200,gap:.9,edge:16,    // walking speed in units per second, seconds between two coming in together, x of the stage entrances
  settle:60};                 // steps a new body takes to find its feet before it walks
S.cfg.crew=false;S.crew=null;S.hooks.crew=()=>{};
// where a henchman comes through in the restaurant: the dining room's kitchen door and the kitchen's back door, at the far wall
const CREW_DOORS={dining:{kind:'dining',x:482,z:DEP_MAX+6,how:'through the kitchen door'},kitchen:{kind:'kitchen',x:737,z:DEP_MAX+6,how:'through the back door'}};
function crewOn(){return!!S.cfg.crew&&S.cfg.n===1;}
function crewDoor(){const C=S.crew;return C&&S.arenaKey==='restaurant'?C.room==='kitchen'?CREW_DOORS.kitchen:C.room==='lobby'?LOBBY_CREW_DOOR:CREW_DOORS.dining:null;}
function crewLeft(){return S.crew?S.crew.queue.length:0;}
function crewDown(){return S.F.filter(f=>f.hench&&f.dead).length;}

// ---------- who they are ----------
// the same gang every time for the same fight: its own dice, so the fight's dice are untouched
function crewPick(R,list){let t=R()*list.reduce((s,e)=>s+e[1],0);for(const e of list){t-=e[1];if(t<0)return e[0];}return list[0][0];}
function crewCompose(tag,n){const R=mulberry32(hash32(tag));
  return Array.from({length:n},()=>({seed:1+Math.floor(R()*9998),weapon:crewPick(R,CREW.weapons),skill:crewPick(R,CREW.skill),temper:crewPick(R,CREW.tempers)}));}
// a henchman joins the roster at the end, so idx stays the position in S.F
function crewMake(hc,s,sp,room){
  const C=S.crew,f=new Fighter(S.F.length,1,'Henchman '+(++C.count),CREW.color);
  f.hench=true;f.hc=hc;if(room==='kitchen')f.p2=true;else if(room==='lobby')f.p3=true;
  Object.assign(f,{seed:hc.seed,weaponKey:hc.weapon,skill:hc.skill,temper:hc.temper});
  S.F.push(f);S.trails.push([]);initFighter(f,s,sp);f.maxHp=f.hp=C.hp;
  return f;
}
// the start of a fight: the first two on the floor in the third and fourth places of the three-enemy spawn, the rest waiting
function crewSetup(sp){
  S.crew=null;if(!crewOn())return;
  const q=crewCompose('crew|'+S.cfg.foes[0].seed+'|'+S.arenaKey,CREW.size);
  S.crew={room:'dining',queue:q,count:0,hp:CREW.hp[allyOn()?'ally':'solo'],next:null,doors:[],lastSide:1};
  for(let i=0;i<CREW.floor;i++)crewMake(q.shift(),sp[2+i],sp,'dining');
}
// the kitchen or the lobby: the last room's henchmen are gone, the room's named enemy has the named place and his own crew takes the floor
function crewRoom(room,sp,party){
  S.crew=null;if(!crewOn()||(room!=='kitchen'&&room!=='lobby'))return;
  const lob=room==='lobby',q=crewCompose((lob?'crew3|'+S.cfg.foes3[0].seed:'crew2|'+S.cfg.foes2[0].seed),lob?CREW.lobby:CREW.kitchen),who=party.some(h=>h.ally)?'ally':'solo',O=S.F[1];
  O.maxHp=O.hp=CREW.named[who];
  S.crew={room,queue:q,count:0,hp:CREW.hp[who],next:null,doors:[],lastSide:1};
  for(let i=0;i<CREW.floor;i++)crewMake(q.shift(),sp[2+i],sp,room);
}

// ---------- coming in ----------
// the side of Kael with fewer enemies on it; in a tie, the side the last one did not use. A standing wall closes the right.
function crewSides(f){
  const C=S.crew;if(S.arenaKey==='wall'&&wallStanding())return[-1];
  // the newcomer himself is not one of the enemies already on a side
  const fs=foes().filter(o=>o!==f),L=fs.filter(o=>o.side<0).length,R=fs.length-L,pref=L<R?-1:R<L?1:-C.lastSide;
  return[pref,-pref];
}
function crewNeed(f,K){return Math.max(70,52+(K.body.bulk+f.body.bulk)*9);}
// the walk from where he stands to (x,z), or null when a divider leaves no way round
function crewRoute(f,x,z){const p=walkPath(f,x,z),e=p[p.length-1];return p.length>1&&Math.abs(e[0]-x)<1&&Math.abs(e[1]-z)<1?p:null;}
// a free place beside Kael on that side that he can walk to: his lane or near it, clear of everyone, the table and the dividers; a walk
// that would pass through someone on the way (from the entrance at sx, sz when the door fixes it) is the last choice
function crewSlot(f,K,side,sx,sz){
  const need=crewNeed(f,K),others=S.F.filter(o=>o!==f&&!o.dead&&o!==K),at=(x,z)=>({x,y:z*.8});let best=null;
  for(const dz of [0,34,-34,66,-66]){const z=clamp(K.lane+dz,DEP_MIN+6,DEP_MAX-12);
    for(let k=0;k<4;k++){const x=K.station+side*(need+k*58),cx=clampSt(f,x,z);
      if(Math.abs(cx-x)>3||!laneOK(f,z,cx)||others.some(o=>Math.abs(o.station-cx)<58&&Math.abs(o.lane-z)<36)||!crewRoute(f,cx,z))continue;
      const a=at(sx,sz==null?z:sz),b=at(cx,z),jam=others.some(o=>segDist(at(o.station,o.lane),a,b)<30);
      const sc=k*58+Math.abs(dz)*.6+(jam?300:0);if(!best||sc<best.sc)best={x:cx,z,sc};}}
  return best;
}
// the walk from the entrance to the place: a steady pace round the table and the dividers, then a short settle into guard
function crewWalk(f,pts){
  const leg=f.leg,pose=p=>({px:p[0],pz:p[1],crouch:.93,lean:.1,stF:.28*leg,stB:-.3*leg,th:.22}),n=pts.length-1,L=Math.hypot(pts[n][0]-pts[n-1][0],pts[n][1]-pts[n-1][1]),slow=L>60;
  // the last stretch slows to a stop instead of running into the place (eOut starts three times as fast as its average)
  if(slow){const u=1-30/L,a=pts[n-1],b=pts[n];pts.splice(n,0,[lerp(a[0],b[0],u),lerp(a[1],b[1],u)]);}
  const body=[{t:0,v:pose(pts[0])}];let t=0;
  for(let k=1;k<pts.length;k++){const stop=slow&&k===pts.length-1,d=Math.hypot(pts[k][0]-pts[k-1][0],(pts[k][1]-pts[k-1][1])*.9);
    t+=Math.max(.1,d/CREW.walk*(stop?3:1));body.push({t,v:pose(pts[k]),e:stop?eOut:u=>u});}
  const end=t+.45;body.push({t:t+.3,v:()=>f.guardBody(),e:sstep},{t:end,v:()=>f.guardBody()});
  f.action={t0:S.t,end,body,arm:[{t:0,v:()=>f.guardArm()},{t:end,v:()=>f.guardArm()}]};
  return t;
}
// a body made in the middle of a fight first settles onto its feet, alone and outside the clock, as every body does before a fight starts
function crewSettle(f,n){
  const t=S.t,d=f.dep,snd=S.hooks.sound,dn=S.dusts.length;S.hooks.sound=()=>{};
  for(let i=0;i<n;i++){S.t+=DT;controlAndForces(f);integrate(f);for(let it=0;it<8;it++){solve(f);collide(f,it===7);}}
  S.t=t;S.hooks.sound=snd;S.dusts.length=dn;f.lastDust.fill(-9);f.lastPelTX=f.p[PEL].x;f.velX=0;f.dep=f.stepDep=d;f.vdep=0;   // a doorway lies a little behind the deepest lane
  f.steps.forEach((s,k)=>{const x=f.p[k?FTB:FTF].x;s.active=false;s.plant={x,y:f.gr(x)-3};});
}
// the next henchman comes in: through the door at the back in the restaurant, from beyond the stage edge elsewhere
function crewEnter(){
  const C=S.crew,K=hero();if(!C||!C.queue.length||!K||K.dead)return null;
  const door=crewDoor(),f=crewMake(C.queue.shift(),[door?door.x:CREW.edge,door?door.z:K.lane,1],null,C.room);
  let side=0,slot=null;
  const ex=sd=>door?door.x:sd<0?CREW.edge:W-CREW.edge,put=sd=>{f.facing=-sd;f.setup(f.seed,f.weaponKey,f.skill,ex(sd),door?door.z:K.lane);};
  for(const sd of crewSides(f)){put(sd);slot=crewSlot(f,K,sd,ex(sd),door?door.z:null);if(slot){side=sd;break;}}
  // no free place: he stands next to Kael anyway, on the side he can walk to and has the most room
  if(!slot){let best=-1;for(const sd of crewSides(f)){put(sd);const x=clampSt(f,K.station+sd*crewNeed(f,K),K.lane),sc=(crewRoute(f,x,K.lane)?1e3:0)+Math.abs(x-K.station);if(sc>best){best=sc;slot={x,z:K.lane};side=sd;}}}
  const sx=ex(side),sz=door?door.z:slot.z,fin=-side,face=door&&Math.abs(slot.x-sx)>30?Math.sign(slot.x-sx):fin;
  f.side=side;f.facing=face;f.setup(f.seed,f.weaponKey,f.skill,sx,sz);f.entering=!door;crewSettle(f,CREW.settle);
  const pts=crewRoute(f,slot.x,slot.z)||[[sx,sz],[slot.x,slot.z]];pts[0]=[sx,sz];   // with no way round he walks straight
  // from here the rules see him in his place; the body walks there
  f.station=slot.x;f.lane=slot.z;f.arriveFace=fin;f.walkIn=true;
  f.arriveAt=S.t+crewWalk(f,pts);
  const rest=S.F.filter(o=>!o.dead&&!o.walkIn);
  f.ready=Math.min(...rest.map(o=>o.ready))+Math.round(CREW.lag*actionCost(f,'slash'));
  C.lastSide=side;
  const how=door?door.how:'from the '+(side<0?'left':'right');
  if(door){C.doors.push({kind:door.kind,t0:S.t});S.hooks.sound('wood',.5,{door:door.kind});}
  S.callouts.push({i:f.idx,text:f.name,age:door?0:-.3,life:1.4,dx:0});
  S.hooks.log({type:'crew',f,how,left:C.queue.length});S.hooks.crew(f);
  return f;
}
// a walker takes no turn before he is in place
function crewHold(){
  const live=S.F.filter(f=>!f.dead),rest=live.filter(f=>!f.walkIn);if(!rest.length)return;
  const mn=Math.min(...rest.map(f=>f.ready));
  for(const f of live)if(f.walkIn&&f.ready<=mn)f.ready=mn+1;
}
// nobody swings at a man who has not arrived: heroes pick someone standing when there is anyone
function crewAvoid(h){
  const t=S.F[getTgt(h)];if(!t||!t.walkIn)return;
  let best=null,bd=1e9;for(const f of foes()){if(f.walkIn)continue;const d=Math.abs(f.station-h.station)+Math.abs(f.lane-h.lane)*.8;if(d<bd){bd=d;best=f;}}
  if(best)setTgt(h,best.idx);
}
// how far a door has swung (0 shut, 1 open) for the drawing: it opens as he comes through and closes behind him
function crewDoorOpen(kind){
  const C=S.crew;if(!C||!C.doors.length)return 0;let o=0;
  for(const d of C.doors){if(d.kind!==kind)continue;const u=S.t-d.t0;o=Math.max(o,u<0?0:u<.4?eOut(u/.4):u<1.5?1:u<2?1-sstep((u-1.5)/.5):0);}
  return o;
}
// the dice-free parts of the fight react to the gang: a walker is not upright (no flourish, cleave or domino reaches him) and keeps his heading
{const up=upright;upright=o=>!o.walkIn&&up(o);}
{const ft=faceToward;faceToward=(f,x)=>{if(!f.walkIn)ft(f,x);};}
{const rh=retargetHero;retargetHero=function(K=hero()){rh(K);crewAvoid(K);};}
V11.turnStart.push(i=>{const h=S.F[i];if(S.crew&&h&&h.team===0&&!h.dead)crewAvoid(h);});
// a fall frees a place: before the end-of-fight checks, so the last one down ends it only when nobody is waiting
V11.exchangeEnd.push(()=>{
  const C=S.crew,K=hero();if(!C||!K||K.dead||S.stage.tr)return;
  if(C.queue.length&&foes().length<CREW.standing){crewEnter();if(C.queue.length&&foes().length<CREW.standing&&C.next==null)C.next=S.t+CREW.gap;}
  crewHold();
});
// every step: walkers arrive, the second of two places is filled a moment after the first, the AI waits for the walkers
function crewStep(){
  const C=S.crew,g=S.game;if(!C)return;
  for(const f of S.F){
    if(f.walkIn&&(f.dead||S.t>=f.arriveAt)){f.walkIn=false;if(!f.dead&&!f.downed&&!f.clinch)f.facing=f.arriveFace;}
    if(f.entering&&(f.dead||!f.action||(f.p[PEL].x>=60&&f.p[PEL].x<=maxStation())))f.entering=false;}
  if(C.next!=null&&S.t>=C.next&&!S.opening&&!S.stage.tr&&(g.phase==='input'||g.phase==='exchange')&&!hero().dead){
    C.next=null;
    if(C.queue.length&&foes().length<CREW.standing){crewEnter();crewHold();if(C.queue.length&&foes().length<CREW.standing)C.next=S.t+CREW.gap;}}
  if(C.doors.length&&C.doors.every(d=>S.t-d.t0>2.2))C.doors=[];
  if(g.phase==='input'&&g.aiAt!=null&&S.t+DT>=g.aiAt){const A=S.F[g.active];if(A&&A.team===0&&foes().length&&foes().every(f=>f.walkIn))g.aiAt=S.t+.1;}
}
{const ss=simStep;simStep=function(){ss();if(S.crew&&!S.warming)crewStep();};}
// feet may stand outside the stage while a henchman is still coming in
function footClamp(f,x){return f.offstage?x:f.entering?clamp(x,8,W-8):clampFoot(x);}
// ===== CREW END =====
