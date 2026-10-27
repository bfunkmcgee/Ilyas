// ===== ENV START =====
// The environment: breakable divider walls that bodies are slammed into and driven through, loose furniture that tumbles
// and splinters, tableware that shatters, hanging lamps that swing and burst, and the bill for all of it.

// ---------- divider walls ----------
// A divider stands across the floor at x and runs from depth d0 to d1. Nobody in that band can walk through it: a knockback,
// a shove or a throw slams the body into it, and once its strength is used up the body goes through.
const DIV_M=28;   // how close a fighter's station gets to a divider's face
const DIV_MAT={
  paper:{name:'Paper screen',the:'the screen',word:'screen',hp:1,h:150,t:6,cost:180,slam:3,breach:5,snd:'paper',bill:'screen'},
  glass:{name:'Glass partition',the:'the glass',word:'glass',hp:2,h:162,t:8,cost:420,slam:5,breach:8,snd:'glass',bill:'glasswall'},
  plaster:{name:'Booth wall',the:'the booth wall',word:'booth wall',hp:3,h:150,t:12,cost:320,slam:5,breach:9,snd:'plaster',bill:'boothwall'},
  plank:{name:'Plank fence',the:'the fence',word:'fence',hp:2,h:118,t:8,cost:90,slam:4,breach:7,snd:'wood',bill:'fence'},
};
function addDiv(mat,x,d0,d1,o){const M=DIV_MAT[mat];
  const w=Object.assign({id:S.divs.length,mat,x,t:M.t,d0,d1,h:M.h,hp:M.hp,maxHp:M.hp,state:'standing',breakBy:0,breakFrom:null,breakWeapon:false,dir:1,
    wob:0,wobV:0,marks:[],lastHit:-9,hitD:null,hitY:null,rem:null,seed:(Math.abs(Math.round(x*131+d0*17))%9973)+1},o||{});
  S.divs.push(w);return w;}
function divSolid(w){return w.state!=='broken';}
function divL(w){return w.x-w.t/2;}
function divR(w){return w.x+w.t/2;}
function divBand(w,d,pad){return d>w.d0-pad&&d<w.d1+pad;}
function divThe(w){return DIV_MAT[w.mat].the;}
function divWord(w){return DIV_MAT[w.mat].word;}
// which side of the divider a fighter is on, kept from where the body actually is so a planned station never flips it
function divSide(f,w){const m=f.dsd||(f.dsd={});if(m[w.id]==null)m[w.id]=Math.sign((f.p?f.p[PEL].x:f.station)-w.x)||1;return m[w.id];}
function divTrack(){if(!S.divs.length)return;for(const f of S.F){const m=f.dsd||(f.dsd={}),x=f.p[PEL].x;for(const w of S.divs)if(divSolid(w)&&Math.abs(x-w.x)>w.t/2+6)m[w.id]=Math.sign(x-w.x);}}
// a station on f's own side of every divider in that lane
function clampDiv(f,x,d){
  for(const w of S.divs){if(!divSolid(w)||!divBand(w,d,14))continue;if(w.state==='breaching'&&w.breakFrom===f)continue;
    if(divSide(f,w)<0){const m=divL(w)-DIV_M;if(x>m)x=m;}else{const m=divR(w)+DIV_M;if(x<m)x=m;}}
  return x;}
function divLaneBlock(z,x){for(const w of S.divs)if(divSolid(w)&&divBand(w,z,12)&&Math.abs(x-w.x)<w.t/2+DIV_M-2)return w;return null;}
// the first divider a straight walk from (x0,z0) to (x1,z1) would pass through or end pressed against
function divOnSeg(x0,z0,x1,z1,pz){if(!S.divs.length)return null;pz=pz??14;let best=null,bu=9;
  for(const w of S.divs){if(!divSolid(w))continue;
    if(divBand(w,z1,12)&&Math.abs(x1-w.x)<w.t/2+DIV_M-4&&!(divBand(w,z0,12)&&Math.abs(x0-w.x)<w.t/2+DIV_M-4)){if(1<bu){bu=1;best=w;}continue;}
    const s0=Math.sign(x0-w.x),s1=Math.sign(x1-w.x);if(!s0||s0===s1||Math.abs(x1-x0)<1e-6)continue;
    const u=(w.x-x0)/(x1-x0),zc=z0+u*(z1-z0);if(zc>w.d0-pz&&zc<w.d1+pz&&u<bu){bu=u;best=w;}}
  return best;}
// several legs of a walk, as [x,z] points
function divOnPath(pts){for(let i=1;i<pts.length;i++){const w=divOnSeg(pts[i-1][0],pts[i-1][1],pts[i][0],pts[i][1]);if(w)return w;}return null;}
function divBetween(A,D){return divOnSeg(A.station,A.lane,D.station,D.lane,6);}
// a body flying from x0 toward x1 along lane z: the first divider it would hit
function divCross1(x0,x1,z){const dir=Math.sign(x1-x0)||1;let best=null,bd=1e9;
  for(const w of S.divs){if(!divSolid(w)||!divBand(w,z,10))continue;const face=dir>0?divL(w):divR(w),d=(face-x0)*dir;if(d<-2)continue;
    if((x1-(face-dir*20))*dir>0&&d<bd){bd=d;best=w;}}
  return best;}
// a knockback of dist along dir: the first divider it carries D into
function divInPath(D,dir,dist){let best=null;
  for(const w of S.divs){if(!divSolid(w)||!divBand(w,D.lane,10)||divSide(D,w)!==-dir)continue;
    const stop=dir>0?divL(w)-DIV_M:divR(w)+DIV_M,gap=Math.max(0,(stop-D.station)*dir);
    if(dist>=gap-1&&(!best||gap<best.gap))best={w,gap,stop:D.station+dir*gap};}
  return best;}
// a divider at f's back
function divBehind(f){let best=null;
  for(const w of S.divs){if(!divSolid(w)||!divBand(w,f.lane,10)||divSide(f,w)!==f.facing)continue;
    const d=Math.abs(f.station-(f.facing>0?divR(w):divL(w)));if(!best||d<best.d)best={w,d};}
  return best;}
function divDetour(w,A,D){const c=[w.d0-22,w.d1+22].filter(z=>z>=DEP_MIN&&z<=DEP_MAX);if(!c.length)return null;
  const cost=z=>Math.abs(z-A.lane)+Math.abs(z-D.lane);c.sort((a,b)=>cost(a)-cost(b));return c[0];}
// how much of a divider's strength one blow takes
function divStruct(A,kind){return(A.wp.key==='axe'||kind==='overhead')&&!A.wp.unarmed?2:1;}
// an attack with a divider in the way: cut straight through it, circle round the end of it, or hit the divider itself
function divAttackPlan(A,D,kind,T){
  if(!S.divs.length||!D)return null;
  const fa=Math.sign(D.station-A.station)||A.facing,zS=strikeLane(A,D,kind),est=D.station-fa*estReach(A,kind,T);
  let w=divOnSeg(A.station,A.lane,est,zS),reach=false;
  if(w){const stand=(fa>0?divL(w):divR(w))-fa*DIV_M;reach=(est-stand)*fa<=4;}
  else{w=divOnSeg(est,zS,D.station,D.lane,6);if(w)reach=true;}
  if(!w||(D.station-w.x)*fa<=0)return null;
  const far=fa>0?divR(w):divL(w),struct=divStruct(A,kind);
  if(reach&&divBand(w,D.lane,10))return{mode:w.hp-struct<=0?'through':'into',w,struct,breaks:w.hp-struct<=0};
  const z=divDetour(w,A,D),minGap=30+(A.body.bulk+D.body.bulk)*9;
  if(z!=null&&((D.station-fa*minGap)-(far+fa*Math.max(DIV_M+6,30+A.leg*.3)))*fa>=0)return{mode:'around',w,z};
  return{mode:'into',w,struct,breaks:w.hp-struct<=0};
}
function divApplyPlan(T,dp,D){
  const nm=divThe(dp.w);
  if(dp.mode==='around'){T.around=dp.z;T.aroundW=dp.w;T.name='Circling '+lowFirst(T.name);T.why=`${cap(nm)} is in the way, so the approach goes around the end of it. `+T.why;T.tags.push('Around '+nm);}
  else if(dp.mode==='through'){T.through=dp.w;T.acc-=2;T.name=T.name+' through '+divWord(dp.w);T.why=`${cap(nm)} is between them, so the blow goes straight through it: −2 to hit. `+T.why;T.tags.push('Through '+nm);}
  else{T.into=dp.w;T.struct=dp.struct;T.breaks=dp.breaks;T.name=T.name+' into '+divWord(dp.w);
    T.why=dp.breaks?`${cap(nm)} is in the way and ${D.name} is out of reach behind it, so this blow only smashes it down.`
      :`${cap(nm)} is too solid to cut through in one blow: this one ${dp.w.hp-dp.struct>1?'cracks':'nearly breaks'} it and ${D.name} is untouched.`;
    T.tags.push('Into '+nm);}
}
function startBreach(w,f,dir,delay,weapon){if(!divSolid(w))return;w.state='breaching';w.breakBy=S.t+delay;w.breakFrom=f;w.breakWeapon=!!weapon;w.dir=dir;w.hitD=f.dep;}
// a slam that doesn't go through: strength lost, a mark where the body hit, and the whole panel shudders
function divSlam(w,f,struct){
  w.hp=Math.max(1,w.hp-struct);const s=divSide(f,w);
  w.marks.push({d:clamp(f.dep,w.d0+5,w.d1-5),y:S.arena.ground(w.x,f.dep)-f.leg*.92-f.body.torso*.45+(Math.random()-.5)*16,k:struct,s:(Math.random()*1e6)|0,side:s});
  if(w.marks.length>8)w.marks.shift();w.wobV+=-s*(2.2+struct);
}
// a blow from a weapon that lands on the divider itself
function divStrike(w,A,C,fa,struct){
  if(!divSolid(w))return false;const M=DIV_MAT[w.mat];w.hitD=A.lane;w.hitY=C.y;
  if(w.hp-struct<=0){breakDivider(w,fa);return true;}
  w.hp-=struct;w.marks.push({d:clamp(A.lane,w.d0+5,w.d1-5),y:C.y,k:struct,s:(Math.random()*1e6)|0,side:-fa,cut:true});if(w.marks.length>8)w.marks.shift();
  w.wobV+=fa*(1.6+struct);sparks(C,8,divChip(w),A.lane);dust(C.x,C.y,.7,A.lane);S.shake=Math.max(S.shake,4);S.hooks.sound(M.snd,.6);
  S.popups.push({x:C.x,y:C.y-16,d:A.lane,text:w.hp<=1?'Cracked':'Struck',color:'#ffc163',sub:cap(divWord(w)),size:18,age:0});
  return false;}
function divChip(w){return{paper:'#f3dcb0',glass:'#d6f3f5',plaster:'#d8b9ae',plank:'#8a6a52',shelf:'#efe4d6',slats:'#a0805e'}[w.mat];}
// physical contact from a fighter's particle
function onDivHit(w,f,q,i,spd){
  if(w.state==='breaching'&&f===w.breakFrom&&(!w.breakWeapon||i===TIP||i===HAF)){w.hitY=q.y;w.hitD=f.dep;breakDivider(w,w.dir);return true;}
  if(spd<170||S.t-w.lastHit<.28)return false;w.lastHit=S.t;
  w.wobV+=-divSide(f,w)*Math.min(3.2,spd/260);dust(q.x,q.y,.8,f.dep);S.shake=Math.max(S.shake,i===TIP?2:5);S.hooks.sound(i===TIP?'thud':DIV_MAT[w.mat].snd,i===TIP?120:.5);
  const ex=S.game.ex;
  if(ex&&ex.divSlam===w&&ex.D===f&&!ex.divShown&&i!==TIP){ex.divShown=true;S.popups.push({x:q.x-divSide(f,w)*14,y:q.y-10,d:f.dep,text:'+'+ex.divDmg+' '+divWord(w),color:'#ffc163',sub:null,size:17,age:0});}
  return false;}
// keep a fighter's particle on the fighter's side of each standing divider
function divCollideQ(f,q,i,final){
  for(const w of S.divs){if(!divSolid(w)||!divBand(w,f.dep,6))continue;if(q.y<S.arena.ground(w.x,f.dep)-w.h-q.r)continue;
    const s=divSide(f,w),face=s<0?divL(w):divR(w);
    if(s<0?q.x>face-q.r:q.x<face+q.r){
      if(w.state==='breaching'&&w.breakFrom===f&&(!w.breakWeapon||i===TIP||i===HAF)){w.hitY=q.y;w.hitD=f.dep;breakDivider(w,w.dir);continue;}
      q.x=face+s*q.r;
      if(final){const vin=-s*q.vx0/DT;if(vin>0){q.px=q.x-s*Math.abs(q.vx0)*.25;if(vin>150&&(i===TIP||S.t-f.lastDust[i]>.3)){if(i!==TIP)f.lastDust[i]=S.t;if(onDivHit(w,f,q,i,vin))return;}}}}}
}
// loose things (furniture, wares, debris, dropped weapons) can't pass through a standing divider either
function divPushPt(q,dep){
  for(const w of S.divs){if(!divSolid(w)||!divBand(w,dep,4))continue;if(q.y<S.arena.ground(w.x,dep)-w.h-(q.r||2))continue;
    const s=Math.sign(q.px-w.x)||1,face=s<0?divL(w):divR(w),r=q.r||2;
    if(s<0?q.x>face-r:q.x<face+r){const vx=q.x-q.px;q.x=face+s*r;q.px=q.x+vx*.3;}}
}
function breakDivider(w,dir){
  if(!w||w.state==='broken')return;dir=dir||w.dir||1;w.state='broken';w.hp=0;w.breakFrom=null;
  const M=DIV_MAT[w.mat],g=S.arena.ground(w.x,w.hitD??(w.d0+w.d1)/2),cd=clamp(w.hitD??(w.d0+w.d1)/2,w.d0,w.d1),cy=w.hitY??g-w.h*.55,R=mulberry32(w.seed+Math.floor(S.t*97));
  const piece=(x,y,len,ang,wd,col,dd,kick,o)=>{const ca=Math.cos(ang)*len/2,sa=Math.sin(ang)*len/2,k=()=>({x:dir*(.6+R()*3.2)*kick,y:-(R()*3.2)*kick}),ka=k(),kb=k();
    S.debris.push(Object.assign({a:{x:x-ca,y:y-sa,px:x-ca-ka.x,py:y-sa-ka.y,r:2,im:.5,vx0:0,vy0:0},b:{x:x+ca,y:y+sa,px:x+ca-kb.x,py:y+sa-kb.y,r:2,im:.5,vx0:0,vy0:0},len,w:wd,dep:clamp(dd,DEP_MIN-8,DEP_MAX+8),col},o||{}));};
  const near=d=>clamp(cd+(R()-.5)*d,w.d0,w.d1);
  if(w.mat==='paper'){
    for(let i=0;i<9;i++){const vert=R()<.5;piece(w.x+(R()-.5)*8,g-14-R()*(w.h-24),vert?26+R()*40:16+R()*26,vert?Math.PI/2+(R()-.5)*.5:(R()-.5)*.6,2.6,'#3a2418',near(70),1.1);}
    for(let i=0;i<46;i++)shard('paper',w.x+(R()-.5)*10,g-10-R()*(w.h-14),near(80),dir,1);
    w.rem={h:9,teeth:[[.1,22],[.35,14],[.62,26],[.85,12]]};
  }else if(w.mat==='glass'){
    for(let i=0;i<72;i++)shard('glass',w.x+(R()-.5)*8,g-52-R()*(w.h-56),near(90),dir,1.15);
    for(let i=0;i<3;i++)piece(w.x,g-58-R()*(w.h-70),20+R()*30,(R()-.5)*1.4,2.6,'#7a5a2e',near(60),1);
    w.rem={h:50,teeth:[[.15,64],[.4,58],[.6,70],[.82,56]],glass:true};
  }else if(w.mat==='shelf'){
    for(let i=0;i<4;i++)piece(w.x+(R()-.5)*8,g-24-i*(w.h-30)/3,30+R()*30,(R()-.5)*1.2,3,'#7d8a92',near(70),1);
    for(let i=0;i<3;i++)piece(w.x+(R()-.5)*6,g-30-R()*(w.h-40),40+R()*40,Math.PI/2+(R()-.5)*.5,3.4,'#5a6670',near(50),.8);
    for(let i=0;i<64;i++)shard('china',w.x+(R()-.5)*10,g-20-R()*(w.h-26),near(90),dir,1.1);
    for(let i=0;i<14;i++)shard('glass',w.x+(R()-.5)*10,g-40-R()*(w.h-50),near(80),dir,1);
    w.rem={h:12,teeth:[[.15,30],[.45,18],[.78,36]]};
  }else if(w.mat==='plaster'){
    for(let i=0;i<13;i++){const l=7+R()*10;piece(w.x+(R()-.5)*10,g-8-R()*(w.h-16),l,R()*Math.PI,7+R()*6,'#b58f86',near(70),.9);}
    for(let i=0;i<2;i++)piece(w.x,g-30-R()*90,40+R()*30,Math.PI/2+(R()-.5)*.8,4,'#5a3a28',near(40),.8);
    for(let i=0;i<30;i++)shard('plaster',w.x+(R()-.5)*10,g-10-R()*(w.h-14),near(80),dir,.9);
    for(let i=0;i<6;i++)dust(w.x+dir*8,g-i*24,1.9,near(60));
    spill(w.x+dir*10,cd,6,26,'rgba(214,196,186,.42)');
    w.rem={h:16,teeth:[[.12,34],[.3,22],[.5,48],[.7,30],[.9,40]]};
  }else{
    for(let i=0;i<6;i++)piece(w.x+(R()-.5)*8,g-30-R()*(w.h-40),34+R()*36,Math.PI/2+(R()-.5)*.7,5.5,'#4a3427',near(70),1,R()<.45?{loot:'club'}:null);
    for(let i=0;i<16;i++)shard('wood',w.x,g-20-R()*(w.h-30),near(60),dir,1);
    w.rem={h:10,teeth:[[.1,40],[.3,26],[.55,44],[.8,30]]};
  }
  const C={x:w.x,y:cy};flash(C,36,'#fff1c9',cd);sparks(C,w.mat==='glass'?34:22,divChip(w),cd);
  const puffs=w.mat==='plaster'?3:w.mat==='plank'?2:w.mat==='paper'?1:0;for(let i=0;i<puffs;i++)dust(w.x+dir*6,g-i*36,1.2,cd);
  S.shake=Math.max(S.shake,15);S.freeze=Math.max(S.freeze,.07);S.slowT=Math.max(S.slowT,.4);if(!S.warming)S.punch={x:prjX(w.x,cd),t:0};
  S.hooks.sound(M.snd,1.4);S.hooks.sound('crack',1,M.snd==='glass'?{skip:'glass_large'}:M.snd==='paper'?{skip:'paper'}:undefined);
  const ex=S.game.ex;if(ex&&ex.divDmg&&ex.divSlam===w&&!ex.divShown){ex.divShown=true;S.popups.push({x:w.x+dir*12,y:cy-40,d:cd,text:'+'+ex.divDmg+' '+divWord(w),color:'#ffc163',sub:'Breach',size:20,age:0});}
  bill(M.bill,M.name);S.hooks.status();
}

// ---------- shards, scraps and spills ----------
const SHARD_COL={glass:'rgba(214,243,245,.85)',china:'#efe4d6',terra:'#a8583c',paper:'#f3dcb0',plaster:'#cdb0a4',wood:'#6a4632',leaf:'#3f6b45',wax:'#f2e6c8',brass:'#c9a25a'};
function shard(k,x,y,d,dir,pow,o){if(S.warming)return;const a=-Math.PI/2+(Math.random()-.5)*2.4,sp=(90+Math.random()*260)*(pow||1);
  S.shards.push(Object.assign({k,x,y,d:clamp(d,DEP_MIN-10,DEP_MAX+12),vx:Math.cos(a)*sp*.55+(dir||0)*(60+Math.random()*170)*(pow||1),vy:Math.sin(a)*sp,a:Math.random()*TAU,va:(Math.random()-.5)*24,
    s:k==='flour'?1.2+Math.random()*2.2:k==='paper'?4+Math.random()*6:k==='plaster'?2+Math.random()*3.5:k==='glass'?1.6+Math.random()*3.4:2+Math.random()*3,rest:false,age:0,ph:Math.random()*TAU},o||{}));
  if(S.shards.length>520){const i=S.shards.findIndex(s=>s.rest);S.shards.splice(i>=0?i:0,1);}}
function spill(x,d,r,grow,c){if(S.warming)return;S.spills.push({x,d,r,grow,c});if(S.spills.length>60)S.spills.shift();}
function shardsStep(dt){
  for(const s of S.shards){s.age+=dt;if(s.rest)continue;
    if(s.k==='paper'||s.k==='leaf'||s.k==='flour'){s.vy+=(s.k==='flour'?150:260)*dt;s.vy=Math.min(s.vy,70);s.vx=s.vx*(1-2.2*dt)+Math.sin(S.t*5+s.ph)*36*dt;s.va*=1-1.5*dt;}
    else s.vy+=G*dt;
    s.x+=s.vx*dt;s.y+=s.vy*dt;s.a+=s.va*dt;
    const g=S.arena.ground(s.x,s.d)-1;
    if(s.y>=g){s.y=g;if(s.vy>40&&s.k!=='paper'&&s.k!=='leaf'&&s.k!=='flour'){s.vy*=-.22;s.vx*=.45;s.va*=.5;}else{s.rest=true;s.vx=s.vy=0;}}
    if(s.x<4||s.x>W-4){s.vx*=-.4;s.x=clamp(s.x,4,W-4);}}
  for(const p of S.spills)if(p.r<p.grow)p.r+=dt*(p.grow-p.r)*.9;
}

// ---------- the bill ----------
const PRICE={screen:180,glasswall:420,boothwall:320,fence:90,table:260,bistro:120,chair:45,stool:40,plant:60,cart:150,rack:50,easel:40,lamp:95,plate:6,glass:9,bottle:24,candle:5,vase:30,bowl:8};
const PRICE_NAME={screen:'paper screen',glasswall:'glass partition',boothwall:'booth wall',fence:'fence',table:'dining table',bistro:'bistro table',chair:'chair',stool:'bar stool',plant:'potted palm',cart:'serving cart',rack:'coat rack',easel:'menu board',lamp:'lamp',plate:'plate',glass:'glass',bottle:'bottle',candle:'candle',vase:'vase',bowl:'bowl'};
function bill(key,label){const c=PRICE[key]||0;if(!c||S.warming||!S.bill)return;S.bill.total+=c;S.bill.items[key]=(S.bill.items[key]||0)+1;S.hooks.bill(c,label||PRICE_NAME[key]);}
// the order things are listed in on the bill (later rooms push their own things onto it)
const BILL_ORDER=['screen','glasswall','boothwall','fence','shelf','slats','table','preptable','bistro','chair','stool','cart','plant','rack','easel','crate','barrel','sack','lamp','plate','bowl','glass','bottle','jar','vase','candle'];
function billText(){const it=S.bill.items,order=BILL_ORDER;
  const parts=[];for(const k of order){const n=it[k];if(!n)continue;const nm=PRICE_NAME[k];parts.push(n>1?`${n} ${nm==='glass'?'glasses':nm.endsWith('s')?nm:nm+'s'}`:`${nm.match(/^[aeiou]/)?'an':'a'} ${nm}`);}
  return parts;}

// ---------- loose furniture ----------
// Props are small rigid bodies (points held by sticks) that rest on the floor. Bodies, weapons and thrown fighters knock them
// about; a hard enough knock breaks them into pieces. None of them blocks anyone's footing: fighters walk into them and shove them aside.
const PROP={
  chair:{name:'chair',brk:360,dz:9,fr:.8,land:3},
  stool:{name:'bar stool',brk:370,dz:8,fr:.8,land:3},
  bistro:{name:'table',brk:430,dz:13,fr:.86,land:5,surface:[0,1]},
  plant:{name:'potted palm',brk:260,dz:10,fr:.86,land:3},
  cart:{name:'serving cart',brk:460,dz:12,fr:.2,land:4,surface:[0,1]},
  rack:{name:'coat rack',brk:640,dz:7,fr:.8,land:2},
  easel:{name:'menu board',brk:420,dz:8,fr:.8,land:3},
};
function mkPt(x,y,m,r){return{x,y,px:x,py:y,m,im:1/m,r,vx0:0,vy0:0};}
function rigid(P){P.sticks=[];for(let i=0;i<P.pts.length;i++)for(let j=i+1;j<P.pts.length;j++)P.sticks.push([i,j,Math.hypot(P.pts[i].x-P.pts[j].x,P.pts[i].y-P.pts[j].y)]);}
function addProp(type,x,d,s,o){
  const g=S.arena.ground(x,d),P=Object.assign({type,dep:d,dz:PROP[type].dz,s:s||1,hp:type==='cart'?2:1,broken:false,sleep:0,box:{l:x,r:x,t:g,b:g},dsd:{},last:-9},o||{}),sd=P.s;
  if(type==='chair'){P.pts=[mkPt(x-sd*14,g-44,.5,2.5),mkPt(x+sd*14,g-44,.5,2.5),mkPt(x-sd*16,g-98,.35,2.5),mkPt(x-sd*14,g-2,.45,2),mkPt(x+sd*14,g-2,.45,2)];
    P.segs=[[0,1,2.6],[0,2,2.4],[0,3,2],[1,4,2]];}
  else if(type==='stool'){P.pts=[mkPt(x-12,g-72,.5,2.5),mkPt(x+12,g-72,.5,2.5),mkPt(x-16,g-2,.5,2),mkPt(x+16,g-2,.5,2)];P.segs=[[0,1,3],[0,2,2],[1,3,2]];}
  else if(type==='bistro'){P.pts=[mkPt(x-30,g-70,.8,3),mkPt(x+30,g-70,.8,3),mkPt(x-17,g-2,1.8,2.5),mkPt(x+17,g-2,1.8,2.5),mkPt(x,g-68,.6,3),mkPt(x,g-6,1.4,3)];P.segs=[[0,1,3.2],[4,5,3.2],[2,3,2.4]];}
  else if(type==='plant'){P.pts=[mkPt(x-15,g-34,.7,3),mkPt(x+15,g-34,.7,3),mkPt(x-11,g-2,1,2.5),mkPt(x+11,g-2,1,2.5),mkPt(x,g-74,.25,4),mkPt(x,g-34,.3,3)];P.segs=[[0,1,3],[0,2,3],[1,3,3],[5,4,12]];}
  else if(type==='cart'){P.pts=[mkPt(x-32,g-76,.7,3),mkPt(x+32,g-76,.7,3),mkPt(x-30,g-6,.9,5),mkPt(x+30,g-6,.9,5)];P.segs=[[0,1,3],[2,3,3],[0,2,2],[1,3,2]];}
  else if(type==='rack'){P.pts=[mkPt(x,g-152,.3,3),mkPt(x-17,g-2,.7,2),mkPt(x+17,g-2,.7,2),mkPt(x,g-10,.4,2)];P.segs=[[0,3,2.6],[1,2,2]];}
  else if(type==='easel'){P.pts=[mkPt(x,g-104,.35,2.5),mkPt(x+sd*26,g-2,.5,2),mkPt(x-sd*22,g-2,.5,2)];P.segs=[[0,1,4],[0,2,2]];}
  else if(PROP_SHAPE[type])PROP_SHAPE[type](P,x,g,sd);
  rigid(P);propBox(P);S.props.push(P);return P;}
function propBox(P){let l=1e9,r=-1e9,t=1e9,b=-1e9;for(const q of P.pts){if(q.x<l)l=q.x;if(q.x>r)r=q.x;if(q.y<t)t=q.y;if(q.y>b)b=q.y;}
  if(P.type==='plant'){t-=10;l=Math.min(l,P.pts[4].x-22);r=Math.max(r,P.pts[4].x+22);}P.box={l,r,t,b,cx:(l+r)/2};}
// the prop's own axis: angle of its base line, used to draw it and to tell when it has fallen over
function propAng(P){const k=P.type==='chair'?[3,4]:P.type==='easel'?[2,1]:P.type==='rack'?[1,2]:P.type==='plant'?[2,3]:[2,3];const a=P.pts[k[0]],b=P.pts[k[1]];return Math.atan2(b.y-a.y,b.x-a.x)*(P.type==='chair'||P.type==='easel'?P.s:1);}
function propDown(P){return Math.abs(propAng(P))>.9;}
// one-way capsule: the prop takes almost all of the correction, kq sets how much the fighter's particle gives
function capsuleP(q,a,b,rad,kq,final){
  const dx=b.x-a.x,dy=b.y-a.y,l2=dx*dx+dy*dy||1,t=clamp(((q.x-a.x)*dx+(q.y-a.y)*dy)/l2,0,1);
  const cx=a.x+dx*t,cy=a.y+dy*t;let nx=q.x-cx,ny=q.y-cy;const d=Math.hypot(nx,ny),R=q.r+rad;
  if(d>=R||d<1e-6)return null;nx/=d;ny/=d;const pen=R-d;
  const ia=a.im*(1-t),ib=b.im*t,iq=q.im*kq,sum=iq+ia+ib;
  q.x+=nx*pen*iq/sum;q.y+=ny*pen*iq/sum;a.x-=nx*pen*ia/sum;a.y-=ny*pen*ia/sum;b.x-=nx*pen*ib/sum;b.y-=ny*pen*ib/sum;
  let vn=0;if(final){const vax=lerp(a.vx0,b.vx0,t),vay=lerp(a.vy0,b.vy0,t);vn=-((q.vx0-vax)*nx+(q.vy0-vay)*ny)/DT;}
  return{nx,ny,t,vn};}
function fighterEnv(final){
  if(!S.props.length&&!S.wares.length&&!S.lamps.length)return;
  for(const f of S.F){if(f.gone)continue;
    let lo=1e9,hi=-1e9,top=1e9;for(const q of f.p){if(q.x<lo)lo=q.x;if(q.x>hi)hi=q.x;if(q.y<top)top=q.y;}
    const rag=f.motor<.45||!!f.carry,kq=rag?.5:.1;
    for(const P of S.props){if(P.broken||Math.abs(f.dep-P.dep)>P.dz+9)continue;const b=P.box;if(b.r<lo-8||b.l>hi+8||b.b<top-8)continue;
      for(let i=0;i<f.p.length;i++){const q=f.p[i];if(q.x<b.l-q.r-4||q.x>b.r+q.r+4||q.y<b.t-q.r-4||q.y>b.b+q.r+4)continue;
        for(const sg of P.segs){const c=capsuleP(q,P.pts[sg[0]],P.pts[sg[1]],sg[2],i===TIP?.04:kq,final);
          if(c){P.sleep=0;if(final&&c.vn>0)propHit(P,f,q,i,c.vn,rag);if(P.broken)break;}}
        if(P.broken)break;}}
    for(const it of S.wares){if(it.gone||it.carry||it.fly||Math.abs(f.dep-it.dep)>12)continue;if(it.x<lo-12||it.x>hi+12||it.y<top-12)continue;
      for(let i=0;i<f.p.length;i++){const q=f.p[i],dx=it.x-q.x,dy=it.y-q.y,d=Math.hypot(dx,dy),R=q.r+it.r;if(d>=R||d<1e-6)continue;
        const nx=dx/d,ny=dy/d;it.x+=nx*(R-d);it.y+=ny*(R-d);it.rest=0;it.host=null;
        if(final){const vn=((q.vx0-it.vx0)*nx+(q.vy0-it.vy0)*ny)/DT;if(vn>0){it.px=it.x-(q.vx0*.8+nx*vn*DT*.25);it.py=it.y-(q.vy0*.8+ny*vn*DT*.25)-.6;it.spin=(Math.random()-.5)*.6;
          if(vn>(i===TIP?260:420)){smashWare(it,Math.sign(q.vx0)||1);break;}}}}}
    for(const L of S.lamps){if(L.fallen||Math.abs(f.dep-L.dep)>15)continue;const p=L.p;if(p.x<lo-16||p.x>hi+16||p.y<top-16)continue;
      for(let i=0;i<f.p.length;i++){const q=f.p[i],dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy),R=q.r+L.r;if(d>=R||d<1e-6)continue;
        const nx=dx/d,ny=dy/d;p.x+=nx*(R-d);p.y+=ny*(R-d);
        if(final){const vn=((q.vx0-(p.x-p.px))*nx+(q.vy0-(p.y-p.py))*ny)/DT;if(vn>0){p.px-=nx*vn*DT*.55;p.py-=ny*vn*DT*.55;lampHit(L,vn,f);}}}}
  }
}
function propHit(P,f,q,i,vn,rag){
  const T=PROP[P.type],need=T.brk*(i===TIP?1.2:rag?.9:1.3);
  if(vn>140&&S.t-P.last>.2){P.last=S.t;S.hooks.sound('thud',Math.min(vn,400)*.6,vn>260?{s:'prop_tumble'}:undefined);if(vn>260)dust(q.x,q.y,.6,P.dep);}
  if(vn>need){P.hp--;if(P.hp<=0)breakProp(P,Math.sign(q.vx0)||f.facing,vn);}
}
function propsGroundHits(P){
  if(P.fixed)return;for(const q of P.pts){const g=S.arena.ground(q.x,P.dep)-q.r;if(q.y>=g-.6&&q.vy0/DT>PROP[P.type].brk*1.35){breakProp(P,Math.sign(q.vx0)||1,q.vy0/DT);return;}}}
function breakProp(P,dir,force){
  if(P.broken)return;if(PROP[P.type].solid){solidPropHit(P,dir);return;}P.broken=true;const R=mulberry32((P.dep*977+Math.round(P.box.cx)*31)|0),kick=clamp((force||400)/420,.6,1.8),D=P.dep;
  const v=q=>({x:q.x-q.px,y:q.y-q.py});
  const piece=(a,b,w,col,o)=>{const va=v(a),vb=v(b),k=()=>({x:dir*(.4+R()*2)*kick,y:-(.6+R()*2.4)*kick}),ka=k(),kb=k();
    S.debris.push(Object.assign({a:{x:a.x,y:a.y,px:a.x-va.x-ka.x,py:a.y-va.y-ka.y,r:2,im:.5,vx0:0,vy0:0},b:{x:b.x,y:b.y,px:b.x-vb.x-kb.x,py:b.y-vb.y-kb.y,r:2,im:.5,vx0:0,vy0:0},
      len:Math.hypot(b.x-a.x,b.y-a.y)||4,w,dep:clamp(D+(R()-.5)*14,DEP_MIN-8,DEP_MAX+8),col},o||{}));};
  const p=P.pts,mid=(a,b,u=.5)=>({x:lerp(a.x,b.x,u),y:lerp(a.y,b.y,u),px:lerp(a.px,b.px,u),py:lerp(a.py,b.py,u)});
  const WD='#3a2418',c=P.box.cx,cy=(P.box.t+P.box.b)/2;
  if(P.type==='chair'){piece(p[0],p[3],3.2,WD,{loot:'chairleg'});piece(p[1],p[4],3.2,WD,{loot:'chairleg'});piece(p[0],p[1],5,'#4a2c1e');piece(mid(p[0],p[2],.1),p[2],4,WD);
    for(let i=0;i<8;i++)shard('wood',c,cy,D,dir,1);}
  else if(P.type==='stool'){piece(p[0],p[2],3,WD,{loot:'chairleg'});piece(p[1],p[3],3,WD,{loot:'chairleg'});piece(p[0],p[1],5.5,'#5a2e24');for(let i=0;i<6;i++)shard('wood',c,cy,D,dir,1);}
  else if(P.type==='bistro'){piece(p[0],p[1],5,'#2c1d24');piece(p[4],p[5],4,'#1d141c');piece(p[2],p[3],4,'#1d141c');for(let i=0;i<8;i++)shard('wood',c,cy,D,dir,1);}
  else if(P.type==='plant'){for(let i=0;i<14;i++)shard('terra',c,P.box.b-14,D,dir,1);for(let i=0;i<10;i++)shard('leaf',P.pts[4].x,P.pts[4].y,D,dir,.8);
    piece(p[5],p[4],3,'#2f5a3a',{fronds:true});spill(c,D,4,18,'rgba(38,24,16,.85)');}
  else if(P.type==='cart'){piece(p[0],p[1],4,'#5a4630');piece(p[2],p[3],4,'#5a4630');piece(p[0],p[2],2.6,'#8a6a3a');piece(p[1],p[3],2.6,'#8a6a3a');for(let i=0;i<5;i++)shard('brass',c,cy,D,dir,1);}
  else if(P.type==='rack'){piece(p[0],mid(p[0],p[3]),3,WD);piece(mid(p[0],p[3]),p[3],3,WD);piece(p[1],p[2],3,WD);}
  else if(P.type==='easel'){piece(p[0],p[1],6,'#20222a');piece(p[0],p[2],2.4,WD);for(let i=0;i<5;i++)shard('wood',c,cy,D,dir,1);}
  else if(PROP_BREAK[P.type])PROP_BREAK[P.type](P,piece,dir,c,cy,D);
  for(const it of S.wares)if(it.host===P){it.host=null;it.rest=0;it.px-=dir*(.5+Math.random())*kick;it.py+=1.2*kick;}
  dust(c,P.box.b,1.1,D);sparks({x:c,y:cy},10,'#d9a06a',D);S.shake=Math.max(S.shake,7);S.hooks.sound('crack',.7,{s:'prop_break'});S.hooks.sound('thud',300,{skip:'prop_break'});
  bill(P.type==='bistro'?'bistro':P.type);
}

// ---------- tableware ----------
// Small things that sit on a surface (a table top or a cart) until it tips or breaks, then fall and shatter on the floor.
const WARE={plate:{r:4,brk:150,col:'china',n:7,spl:null},bowl:{r:4,brk:150,col:'china',n:6,spl:null},glass:{r:3.5,brk:120,col:'glass',n:9,spl:'rgba(120,20,40,.6)'},
  bottle:{r:4,brk:210,col:'glass',n:11,spl:'rgba(92,12,32,.75)'},mug:{r:4.5,brk:9999,col:'brass',n:0,spl:null,tough:true},candle:{r:3,brk:9999,col:'wax',n:0,spl:null},vase:{r:5,brk:160,col:'china',n:9,spl:'rgba(150,190,215,.4)'}};
function addWare(kind,host,x,dd){const surf=wareSurface(host),y=surf?lerp(surf[0].y,surf[1].y,clamp((x-surf[0].x)/((surf[1].x-surf[0].x)||1),0,1))-WARE[kind].r-3:S.arena.ground(x,0)-WARE[kind].r;
  const dep=(host==='T'?S.table.dep:host.dep)+(dd||0);
  const it={kind,x,y,px:x,py:y,r:WARE[kind].r,im:3,vx0:0,vy0:0,ang:0,spin:0,dep,host,rest:0,lit:kind==='candle',gone:false};S.wares.push(it);return it;}
function wareSurface(host){if(!host)return null;if(host==='T'){const T=S.table;return T&&T.on&&T.state==='intact'?[T.pts[0],T.pts[1]]:null;}
  if(host.broken||propDown(host))return null;const s=PROP[host.type].surface;return s?[host.pts[s[0]],host.pts[s[1]]]:null;}
function smashWare(it,dir){
  if(it.gone)return;const W=WARE[it.kind];if(W.tough){if(!S.warming&&S.t-(it.clang||-9)>.25){it.clang=S.t;S.hooks.sound('clang',.35);}return;}it.gone=true;
  if(it.kind==='candle'){for(let i=0;i<3;i++)shard('wax',it.x,it.y,it.dep,dir,.5);bill('candle');return;}
  for(let i=0;i<W.n;i++)shard(W.col,it.x,it.y-2,it.dep,dir*.6,.7);
  if(W.spl)spill(it.x+dir*4,it.dep,3,it.kind==='bottle'?17:it.kind==='vase'?14:9,W.spl);
  if(it.kind==='vase')for(let i=0;i<5;i++)shard('leaf',it.x,it.y-6,it.dep,dir,.6);
  sparks({x:it.x,y:it.y},4,'#e8f6f8',it.dep);S.hooks.sound(it.kind==='glass'||it.kind==='bottle'?'glass':'china',.45);bill(it.kind);
}
// a knock to a surface sends what's on it flying
function kickWares(host,dir,pow){for(const it of S.wares){if(it.gone||it.host!==host)continue;it.rest=0;it.px=it.x-dir*(.6+Math.random()*2.2)*pow;it.py=it.y+(1.5+Math.random()*3)*pow;it.spin=(Math.random()-.5)*.5*pow;}}

// ---------- hanging lamps ----------
function addLamp(x,dep,shadeY,kind){const ay=20+dep*PSY,p={x,y:shadeY,px:x,py:shadeY,im:1,vx0:0,vy0:0};const L={x,ay,dep,L:shadeY-ay,p,r:kind==='lantern'?8:10,kind:kind||'pendant',lit:true,fallen:false,flick:0,dead:0,ph:Math.random()*TAU};S.lamps.push(L);return L;}
function lampHit(L,vn,f){
  if(vn>120&&S.t-(L.lastHit||-9)>.2){L.lastHit=S.t;S.hooks.sound('clang',.25,{s:'lamp_knock'});L.flick=.35;}
  if(L.lit&&vn>330){L.lit=false;L.dead=S.t;const p=L.p;flash(p,40,'#fff3cf',L.dep);sparks(p,16,'#fff3cf',L.dep);for(let i=0;i<10;i++)shard('glass',p.x,p.y+4,L.dep,Math.sign(f.p[PEL].vx0)||1,.6);
    popup(f,'Lamp out','#ffc163',null,16,-38);S.hooks.sound('glass',.8);bill('lamp');}
  if(vn>620&&!L.fallen){L.fallen=true;S.hooks.sound('crack',.4);}
}
function lampsStep(final){
  for(const L of S.lamps){const p=L.p;
    if(!L.fallen){const a={x:L.x,y:L.ay,px:L.x,py:L.ay,im:0};stickC(a,p,L.L);if(final){p.x=clamp(p.x,L.x-L.L*.9,L.x+L.L*.9);}}
    else{const g=S.arena.ground(p.x,L.dep)-L.r;if(p.y>=g){if(!L.landed){L.landed=true;for(let i=0;i<8;i++)shard('brass',p.x,g,L.dep,0,.6);dust(p.x,g+L.r,1,L.dep);S.hooks.sound('thud',350,{s:'lamp_fall'});if(L.lit){L.lit=false;bill('lamp');}}p.y=g;p.px=p.x-(p.x-p.px)*.6;}}}
}

// ---------- the room ----------
// ---------- the room has consequences ----------
// broken glass, china or pottery around someone's feet
const SHARP={glass:1,china:1,terra:1};
function onGlass(f){if(!S.shards.length||!f||f.dead)return false;const x=f.p?f.p[PEL].x:f.station;let n=0;
  for(const s of S.shards)if(s.rest&&SHARP[s.k]&&Math.abs(s.x-x)<22&&Math.abs(s.d-f.dep)<13&&++n>=5)return true;return false;}
// a fighter is in shadow when every lamp over their spot is out
function inShadow(f){if(!S.lamps.length||!f||f.dead)return false;const x=f.p?f.p[PEL].x:f.station;let near=0;
  for(const L of S.lamps){if(Math.abs(L.x-x)<95&&Math.abs(L.dep-f.dep)<62){near++;if(L.lit)return false;}}return near>0;}
// a broken divider leaves a gap: the first one a walk from (x0,z0) to (x1,z1) passes through
function gapOnSeg(x0,z0,x1,z1){for(const w of S.divs){if(divSolid(w))continue;const s0=Math.sign(x0-w.x),s1=Math.sign(x1-w.x);if(!s0||s0===s1)continue;
  const u=(w.x-x0)/(x1-x0),zc=z0+u*(z1-z0);if(zc>w.d0-6&&zc<w.d1+6)return w;}return null;}
function gapOnPath(pts){for(let i=1;i<pts.length;i++){const w=gapOnSeg(pts[i-1][0],pts[i-1][1],pts[i][0],pts[i][1]);if(w)return w;}return null;}
// knockback can be aimed: hazards on the far side of a target that a blow or a shove could carry them into
function driveOptions(A,D){
  if(!A||!D||D.dead||D.downed||A.clinch||D.clinch)return[];
  const fa=Math.sign(D.station-A.station)||A.facing,out=[],R=120,DZ=46;
  const add=(kind,ref,x,lane,label,id)=>{const dx=(x-D.station)*fa;if(dx<6||dx>R)return;const z=clamp(lane,DEP_MIN,DEP_MAX);if(Math.abs(z-D.lane)>DZ)return;out.push({kind,ref,x,lane:z,dist:dx,label,id});};
  if(tableIntact()){const b=tableBox();add('table',S.table,fa>0?b.l-22:b.r+22,clamp(D.lane,S.table.dep-TD+6,S.table.dep+TD-6),'the table','table');}
  for(const w of S.divs){if(!divSolid(w)||divSide(D,w)!==-fa)continue;add('div',w,(fa>0?divL(w):divR(w))-fa*DIV_M,clamp(D.lane,w.d0+8,w.d1-8),divThe(w),'div'+w.id);}
  if(wallStanding()&&S.wall&&fa>0)add('wall',S.wall,S.arena.wall-34,D.lane,'the wall','wall');
  S.props.forEach((P,i)=>{if(P.broken)return;const x=P.box.cx-fa*12;
    // a loose prop a body cannot be carried into is no target: past the end of the stage, or behind a fixture (the chair behind the
    // office desk). Fixtures themselves (the stove, the desk) stay: a body slams against them.
    if(!P.fixed&&Math.abs(clampSt(D,x,clamp(P.dep,DEP_MIN,DEP_MAX))-x)>30)return;
    add('prop',P,x,P.dep,'the '+PROP[P.type].name,'prop'+i);});
  out.sort((a,b)=>a.dist-b.dist);return out.slice(0,3);}
function driveFor(A,D){if(!A||!A.driveSel)return null;return driveOptions(A,D).find(o=>o.id===A.driveSel)||null;}
// the AI aims its blows when there is something to aim at: brutes nearly always, showcase brawlers too
function aiPickDrive(A,D){const opts=driveOptions(A,D);if(!opts.length)return null;const p=S.showcase?.9:A.temper==='brute'?.9:A.temper==='rusher'?.45:A.temper==='keeper'?.35:.5;
  return S.rng()<p?opts[0].id:null;}
function envReset(){S.divs=[];S.props=[];S.wares=[];S.lamps=[];S.shards=[];S.spills=[];S.bill={total:0,items:{}};for(const f of S.F)f.dsd={};}
function spotFree(x,d,rx,rz){for(const f of S.F){if(f.dead)continue;if(Math.abs(f.station-x)<rx+26&&Math.abs(f.lane-d)<rz+14)return false;}
  if(tableIntact()&&Math.abs(d-S.table.dep)<TD+rz+4){const b=tableBox();if(x>b.l-rx-6&&x<b.r+rx+6)return false;}
  for(const w of S.divs)if(divBand(w,d,rz+4)&&Math.abs(x-w.x)<w.t/2+rx+6)return false;
  for(const P of S.props)if(Math.abs(P.dep-d)<P.dz+rz&&x>P.box.l-rx-4&&x<P.box.r+rx+4)return false;
  return x>rx+8&&x<W-rx-8;}
function envBuild(){
  envReset();
  if(S.arenaKey==='restaurant'){if(S.room==='kitchen')buildKitchen();else if(S.room==='lobby')buildLobby();else if(S.room==='office')buildOffice();else buildRestaurant();}
  else if(S.divOn&&S.arenaKey!=='wall')buildFence();
}
// the Dividers switch: put up or take down only the divider walls, leaving the furniture as it is
function setDividers(){
  S.divs=[];for(const f of S.F)f.dsd={};
  if(S.divOn){if(S.arenaKey==='restaurant'){if(S.room==='kitchen')kitchenDivs();else if(S.room==='lobby')lobbyDivs();else if(S.room==='office')officeDivs();else restaurantDivs();}else if(S.arenaKey!=='wall')buildFence();nudgeOutOfDivs();}
}
function nudgeOutOfDivs(){for(const f of S.F){if(f.dead||f.npc)continue;const x=clampSt(f,f.station,f.lane);if(Math.abs(x-f.station)>.5){f.station=x;if(!f.downed)f.build();}}}
function restaurantDivs(){addDiv('paper',194,16,140);addDiv('glass',716,14,128);addDiv('plaster',826,36,DEP_MAX+6);}
// outdoors: one plank fence behind whoever stands at the far left (or behind Kael when it's one on one)
function buildFence(){
  const K=hero(),fs=S.F.filter(f=>f.team===1),left=fs.filter(f=>f.station<K.station);
  const ref=left.length?left.reduce((a,b)=>a.station<b.station?a:b):K,x=clamp(ref.station-(left.length?54:62),112,ref.station-50);
  const street=S.arenaKey==='street',d0=street?14:24,d1=street?112:132;
  addDiv('plank',x,d0,d1);
  nudgeOutOfDivs();
}
function buildRestaurant(){
  // dividers: a paper screen on the left, a glass partition on the right, a plaster booth wall across the back lanes
  if(S.divOn)restaurantDivs();
  // nobody starts inside a divider
  nudgeOutOfDivs();
  const P2=(type,x,d,s)=>spotFree(x,d,type==='bistro'||type==='cart'?32:type==='rack'?18:16,PROP[type].dz)?addProp(type,x,d,s):null;
  const T=tableIntact()?S.table:null;
  if(T){T.props=[];tableWares();const b=tableBox();P2('chair',b.l-30,T.dep-6,1);P2('chair',b.r+30,T.dep+6,-1);}
  const R=mulberry32(4242+S.cfg.n*7+(allyOn()?3:0));
  for(const [x,d] of [[600,34],[330,152],[600,152]]){const B=P2('bistro',x,d,1);if(!B)continue;
    P2('chair',x-56,d+4,1);P2('chair',x+56,d-4,-1);
    for(const [k,dx] of [['plate',-16],['glass',-2],['candle',10],['bottle',22]])if(R()<.85||k==='candle')addWare(k,B,x+dx,(R()-.5)*6);}
  // things left out in the aisle
  const C=P2('cart',520,112,1);if(C){addWare('plate',C,498,-4);addWare('bowl',C,514,2);addWare('plate',C,530,-2);addWare('bottle',C,544,3);}
  P2('chair',430,64,-1);P2('chair',236,120,1);P2('chair',650,108,-1);P2('chair',348,126,-1);P2('chair',586,72,1);
  const B3=P2('bistro',520,60,1);if(B3)for(const [k,dx] of [['plate',-14],['glass',2],['candle',12],['bottle',22]])addWare(k,B3,520+dx,(R()-.5)*6);
  // past the screen and the glass
  const B2=P2('bistro',112,74,1);if(B2)for(const [k,dx] of [['plate',-12],['glass',4],['candle',14]])addWare(k,B2,112+dx,0);
  P2('stool',778,150,1);P2('stool',780,40,1);P2('easel',874,24,-1);
  P2('rack',58,136,1);P2('plant',40,160,1);P2('plant',64,24,1);P2('plant',872,170,1);
  // lamps over the tables and over the middle of the floor
  for(const [x,d,y] of [[330,50,286],[600,34,288],[330,152,284],[600,152,286],[420,92,284],[560,90,286],[240,92,286],[112,74,288],[780,96,286]])addLamp(x,d,y);
}
// the dining table's place settings, laid again whenever the table is put back
function tableWares(){S.wares=S.wares.filter(it=>it.host!=='T');if(S.arenaKey!=='restaurant'||!tableIntact())return;if(S.room==='kitchen'){kitchenTableWares();return;}if(S.room==='lobby'){lobbyTableWares();return;}if(S.room==='office')return;const b=tableBox();
  for(const [k,u,dd] of [['plate',.2,-6],['glass',.32,-9],['candle',.5,0],['bottle',.62,4],['plate',.78,-6],['glass',.88,-9],['vase',.42,8]])addWare(k,'T',lerp(b.l+6,b.r-6,u),dd);}
function envBuilt(){return S.divs.length||S.props.length||S.lamps.length;}

// ---------- physics ----------
function envIntegrate(){
  for(const P of S.props){if(P.broken||P.fixed||P.sleep>40)continue;for(const q of P.pts){ptIntegrate(q,.995);const vx=q.x-q.px,vy=q.y-q.py,v=Math.hypot(vx,vy);if(v>16){q.px=q.x-vx*16/v;q.py=q.y-vy*16/v;}}}
  for(const it of S.wares){if(it.gone||it.rest>40||it.carry||it.fly)continue;ptIntegrate(it,.996);it.ang+=it.spin;it.spin*=.985;}
  for(const L of S.lamps)ptIntegrate(L.p,.998);
}
function envSolve(final){
  for(const P of S.props){if(P.broken||P.fixed||P.sleep>40)continue;
    for(const s of P.sticks)stickC(P.pts[s[0]],P.pts[s[1]],s[2]);
    for(const q of P.pts){groundPt(q,final,PROP[P.type].fr,P.dep);if(S.divs.length)divPushPt(q,P.dep);}
    if(final)propsGroundHits(P);}
  for(const it of S.wares){if(it.gone||it.rest>40||it.carry||it.fly)continue;
    if(it.host){const sf=wareSurface(it.host);if(!sf)it.host=null;else{if(it.x<Math.min(sf[0].x,sf[1].x)-1||it.x>Math.max(sf[0].x,sf[1].x)+1)it.host=null;else capsule(it,sf[0],sf[1],3,0,final);}}
    const g=S.arena.ground(it.x,it.dep)-it.r;
    if(it.y>g){it.y=g;if(final){const vy=it.vy0/DT;if(!it.host&&vy>WARE[it.kind].brk){smashWare(it,Math.sign(it.vx0)||1);continue;}
      if(it.kind==='candle'&&it.lit&&vy>40)it.lit=false;const vx=it.x-it.px;it.px=it.x-vx*.6;it.py=it.y+Math.max(0,it.vy0)*.15;it.spin*=.7;}}
    if(S.divs.length)divPushPt(it,it.dep);
    if(it.x<4||it.x>W-4){it.x=clamp(it.x,4,W-4);it.px=it.x;}}
  lampsStep(final);
  if(final&&S.divs.length){for(const d of S.debris){divPushPt(d.a,d.dep);divPushPt(d.b,d.dep);}for(const it of S.items)if(!it.stuck){divPushPt(it.a,it.dep);divPushPt(it.b,it.dep);}}
}
function envPost(){
  for(const P of S.props){if(P.broken)continue;propBox(P);let mv=0;for(const q of P.pts)mv=Math.max(mv,Math.abs(q.x-q.px)+Math.abs(q.y-q.py));P.sleep=mv<.05?P.sleep+1:0;
    if(P.sleep===1)for(const it of S.wares)if(it.host===P)it.rest=0;}
  for(const it of S.wares){if(it.gone)continue;if(it.carry||it.fly){it.rest=0;continue;}const mv=Math.abs(it.x-it.px)+Math.abs(it.y-it.py);it.rest=mv<.03?it.rest+1:0;
    if(it.host&&it.host!=='T'&&it.host.sleep<2)it.rest=0;if(it.host==='T'&&!tableIntact())it.rest=0;}
  for(const w of S.divs){
    if(w.state==='breaching'&&S.t>=w.breakBy)breakDivider(w,w.dir);
    w.wobV+=(-60*w.wob-6*w.wobV)*DT;w.wob+=w.wobV*DT;}
  for(const L of S.lamps)if(L.flick>0)L.flick=Math.max(0,L.flick-DT);
  shardsStep(DT);
}
// ===== ENV END =====
