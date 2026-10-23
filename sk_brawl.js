// ===== BRAWL START =====
// Brawling layer: heavier impacts, hit reactions, wounds, blood, staying down, clinches, throws, disarms, loot and gang-ups.

// a name for this weapon, falling back to its family (fists, blunt, short, heavy, blade, pole)
function wn(A,map,def){const wp=A.wp;return map[wp.key]??map[wp.fam]??def;}

// ---------- 1. impact weight ----------
function blowWeight(A,res){return clamp((.55+A.wp.mass*.24)*(.7+(res.dmg||0)/32)*(res.out==='crit'?1.35:1),.45,2.6);}
// hit-stop, shake and a camera jolt that all scale with the weapon and the damage; the shake runs along the blow
function impactFeel(A,res,fa,kind){
  const w=blowWeight(A,res),blk=kind==='block';
  if(blk){S.freeze=Math.max(S.freeze,clamp(.045*w,.03,.1));S.shake=Math.max(S.shake,3*w);}
  else{const crit=res.out==='crit';S.freeze=Math.max(S.freeze,clamp((crit?.1:.055)*w,.035,.26));S.shake=Math.max(S.shake,(crit?9:3+(res.dmg||0)*.12)*w);}
  S.shakeDir={x:fa||0,y:.35};
  if(!S.warming)S.camKick={x:(fa||0)*(3+5*w)*(blk?.5:1),y:(1.5+1.5*w)*(blk?.5:1),t:0};
}

// ---------- 2. where a blow lands, and how the body answers ----------
function hitZone(res){
  const T=res.tech||{},k=res.kind;
  if(T.zone)return T.zone;
  if(k==='sweep'||T.kick)return'leg';
  if(T.anchor==='face')return'head';
  if(T.anchor==='shin')return'leg';
  if(k==='thrust')return'body';
  if(k==='overhead')return(res.seed&2)?'arm':'head';
  return(res.seed&2)?'arm':'body';
}
// fa is the direction the blow travels (attacker toward defender)
function hitReaction(D,zone,fa,res){
  if(D.dead||D.downed||res.kd||!D.curBody)return;
  const cb={...D.curBody},ca={...D.curArm},st=D.station,a=D.arm,big=res.out==='crit'||res.dmg>=18,two=!!D.wp.off;
  const pose=o=>()=>({...D.guardBody(),...o}),gB=()=>D.guardBody(),gA=()=>D.guardArm(),off=v=>two?'grip':{sh:v};
  let body,arm,end;
  if(zone==='head'){end=big?1:.85;   // the head snaps back and the feet stumble under it
    body=[{t:0,v:cb},{t:.07,v:pose({px:st+fa*6,lean:-.38,crouch:.86,th:.04}),e:eOut},{t:.3,v:pose({px:st-fa*3,lean:-.24,crouch:.84,th:.04})},
      {t:.52,v:pose({px:st+fa*2,lean:-.1,th:.06})},{t:end,v:gB,e:sstep}];
    arm=[{t:0,v:ca},{t:.07,v:{hand:{sh:[.16*a,-.5*a]},wAng:-2,off:off([.26*a,-.36*a]),tilt:-.5},e:eOut},
      {t:.36,v:{hand:{sh:[.2*a,-.2*a]},wAng:-1.4,off:off([.2*a,-.1*a]),tilt:-.22}},{t:end,v:gA,e:sstep}];}
  else if(zone==='body'){end=big?1.1:.88;   // doubled over
    body=[{t:0,v:cb},{t:.08,v:pose({px:st+fa*4,lean:.64,crouch:.7,th:.05}),e:eOut},{t:big?.58:.42,v:pose({lean:.52,crouch:.72,th:.05})},{t:end,v:gB,e:sstep}];
    arm=[{t:0,v:ca},{t:.08,v:{hand:{sh:[.14*a,.34*a]},wAng:1,off:off([.06*a,.36*a]),tilt:.28},e:eOut},
      {t:big?.58:.42,v:{hand:{sh:[.16*a,.3*a]},wAng:.9,off:off([.08*a,.34*a]),tilt:.22}},{t:end,v:gA,e:sstep}];}
  else if(zone==='leg'){end=.92;   // the knee buckles
    body=[{t:0,v:cb},{t:.07,v:pose({crouch:.5,lean:.2,th:.04}),e:eOut},{t:.42,v:pose({crouch:.57,lean:.12,th:.05})},{t:end,v:gB,e:sstep}];
    arm=[{t:0,v:ca},{t:.1,v:{hand:{sh:[.3*a,.15*a]},wAng:.4,off:off([.35*a,.25*a]),tilt:.12},e:eOut},{t:end,v:gA,e:sstep}];}
  else{end=.78;   // a cut across the arm or ribs twists the body away
    body=[{t:0,v:cb},{t:.07,v:pose({px:st+fa*5,lean:-.22,crouch:.82,th:.05}),e:eOut},{t:.32,v:pose({lean:-.08,th:.06})},{t:end,v:gB,e:sstep}];
    arm=[{t:0,v:ca},{t:.07,v:{hand:{sh:[-.15*a,-.1*a]},wAng:.8,off:off([.3*a,.05*a]),tilt:-.18},e:eOut},{t:end,v:gA,e:sstep}];}
  D.action={t0:S.t,end,body,arm};
}
// a big knockback can carry a fighter over the curb or over someone already on the ground
function tripHazard(D,fa,x0,x1){
  const lo=Math.min(x0,x1+fa*14),hi=Math.max(x0,x1+fa*14);
  // anything from the head to the feet of a body on the floor can catch the heels
  for(const o of S.F){if(o===D||o.gone||!(o.downed||o.dead)||Math.abs(o.dep-D.dep)>26)continue;let bl=1e9,br=-1e9;
    for(const i of [PEL,HEAD,KNF,KNB,FTF,FTB]){const x=o.p[i].x;if(x<bl)bl=x;if(x>br)br=x;}
    if(br>lo+4&&bl<hi-4)return{what:'body',o};}
  for(const Q of S.props){if(Q.broken||Math.abs(Q.dep-D.dep)>Q.dz+12)continue;const b=Q.box;if(b.r>lo+2&&b.l<hi-2)return{what:'prop',p:Q};}
  if(S.arenaKey==='street'&&D.lane>CURB0-8&&D.lane<CURB1+16)return{what:'curb'};
  return null;
}
function tripDown(D,tr,fa){
  if(D.dead||D.downed)return;
  knockDown(D);D.hp=Math.max(0,D.hp-2);
  // the feet catch and the body goes over backwards
  for(const i of [KNF,FTF,KNB,FTB]){const q=D.p[i];q.px-=fa*-90*DT;q.py+=60*DT;}
  for(const i of [PEL,CHE,HEAD]){const q=D.p[i];q.px-=fa*140*DT;}
  dust(D.p[PEL].x,D.gr(D.p[PEL].x),1.1,D.dep);
  popup(D,'Tripped','#ffc163',tr.what==='curb'?'over the curb':tr.what==='prop'?'over a '+PROP[tr.p.type].name:'over '+tr.o.name,20,-30);
  if(tr.what==='prop'){const Q=tr.p;Q.sleep=0;for(const q of Q.pts){q.px-=fa*1.4;q.py+=.8;}}
  if(D.hp<=0)kill(D,fa);
}

// ---------- 4. wounds ----------
// a solid blow (10+) wounds the part it lands on, a crit or a huge one (22+) twice over
function addWound(D,zone,res){
  if(D.dead)return false;const n=((res.dmg||0)>=10?1:0)+(res.out==='crit'||(res.dmg||0)>=22?1:0);if(!n)return false;
  const was=D.wounds[zone]||0;D.wounds[zone]=Math.min(3,was+n);
  if(zone==='head'&&(res.out==='crit'||(res.dmg||0)>=10))D.daze=1;
  return D.wounds[zone]>was;
}
// a hurt arm costs 1 to hit, a badly hurt one 2
function armPen(f){return Math.min(2,Math.ceil((f.wounds.arm||0)/2));}
function woundText(f){const w=f.wounds,t=[];if(w.leg)t.push(w.leg>1?'Limping badly':'Limping');if(w.arm)t.push(armPen(f)>1?'Arm badly hurt':'Arm hurt');if(f.daze)t.push('Dazed');return t;}
// the guard pose bends around the damage: a bad leg narrows the stance, cuts to the body hunch it, low health heaves the chest
function brawlBody(f,o){
  const w=f.wounds,low=f.hp<f.maxHp*.25&&!f.dead,mid=f.hp<f.maxHp*.5&&!f.dead;
  if(w.leg){const k=1-.1*w.leg;o.stF*=k;o.stB*=k;o.crouch-=.015*w.leg;}
  if(w.body)o.lean+=.035*w.body;
  if(low||mid){const br=Math.sin(S.t*(low?3.4:2.6)+f.idx*1.3);o.crouch+=br*(low?.02:.009)-(low?.04:0);o.lean+=(low?.12:.04)+br*(low?.025:.01);}
  if(f.daze){o.lean+=.08*Math.sin(S.t*3.1+f.idx);o.px+=5*Math.sin(S.t*1.9+f.idx*2);}
  if(f.clinch)clinchBody(f,o);
  return o;
}
function brawlArm(f,o){
  const w=f.wounds,a=f.arm;
  if(w.arm){const s=Math.min(2,w.arm);if(o.hand&&o.hand.sh)o.hand={sh:[o.hand.sh[0]-.04*s*a,o.hand.sh[1]+.1*s*a]};o.wAng+=.2*s;}
  if(f.daze)o.tilt=(o.tilt||0)+.16*Math.sin(S.t*2.3+f.idx);
  if(f.hp<f.maxHp*.25&&!f.dead)o.tilt=(o.tilt||0)+.12;
  if(f.clinch)clinchArm(f,o);
  return o;
}

// ---------- 5. blood ----------
function bleed(C,dir,n,dep,force){
  if(S.gore==='off'||S.warming)return;
  for(let i=0;i<n;i++){const sp=(60+Math.random()*260)*force,a=-.3-Math.random()*1.15,s=.4+Math.random()*.8;
    S.blood.push({x:C.x,y:C.y,d:dep+(Math.random()-.5)*8,vx:dir*Math.cos(a)*sp*s+(Math.random()-.5)*60,vy:Math.sin(a)*sp,r:.9+Math.random()*2.1,age:0});}
  if(S.blood.length>420)S.blood.splice(0,S.blood.length-420);
}
function stain(x,d,r,a,grow){S.stains.push({x,d,r,a,grow:grow||0,rot:Math.random()*Math.PI});if(S.stains.length>360)S.stains.shift();}
function bloodStep(dt){
  for(const b of S.blood){b.age+=dt;b.vy+=G*.9*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
    if(b.y>=S.arena.ground(b.x,b.d)-1){b.dead=true;stain(b.x,b.d,b.r*(1.4+Math.random()*1.3),.45+Math.random()*.35);}}
  if(S.blood.length)S.blood=S.blood.filter(b=>!b.dead&&b.age<3);
  for(const s of S.stains)if(s.grow&&s.r<s.grow)s.r+=dt*(s.grow-s.r)*.5;
}
const MARK_SEGS={head:[[CHE,HEAD]],arm:[[CHE,ELF],[ELF,HAF]],leg:[[PEL,KNF],[KNF,FTF],[PEL,KNB]],body:[[PEL,CHE]]};
function addMark(D,zone,edge){
  if(S.gore==='off')return null;const segs=MARK_SEGS[zone]||MARK_SEGS.body,sg=segs[Math.floor(Math.random()*segs.length)];
  const m={a:sg[0],b:sg[1],u:.25+Math.random()*.5,ang:(Math.random()-.5)*1.2+(edge?0:Math.PI/2),len:edge?5+Math.random()*5:3,edge:!!edge};
  D.marks.push(m);if(D.marks.length>16)D.marks.shift();
  return m;
}
function dripStep(f){
  if(S.gore==='off'||f.dead||S.warming)return;
  const ws=f.wounds.head+f.wounds.arm+f.wounds.leg+f.wounds.body,low=f.hp<f.maxHp*.4;if(ws<2&&!low)return;
  f.dripT-=DT;if(f.dripT>0)return;f.dripT=(low?.35:.7)+Math.random()*.8;
  const m=f.marks.length?f.marks[Math.floor(Math.random()*f.marks.length)]:null,a=f.p[m?m.a:CHE],b=f.p[m?m.b:PEL],u=m?m.u:.5;
  // from the mark itself, which may sit off the line of the bone (a tear on his flank)
  const o=m&&m.off||0,L=Math.hypot(b.x-a.x,b.y-a.y)||1;
  S.blood.push({x:lerp(a.x,b.x,u)-(b.y-a.y)/L*f.facing*o,y:lerp(a.y,b.y,u)+(b.x-a.x)/L*f.facing*o,d:f.dep,vx:(Math.random()-.5)*20,vy:10,r:.8+Math.random()*.9,age:0});
}
// spatter, a cut mark and a wound for one landed blow
function woundFx(A,D,res,C,fa,zone){
  const edge=!!(res.tech&&res.tech.edge)||(!!A.wp.edge&&!(res.tech&&res.tech.dirty)),crit=res.out==='crit';
  bleed(C,fa,Math.round(clamp(res.dmg*(edge?.9:.45),3,30)*(crit?1.4:1)),D.dep,crit?1.3:1);
  const mk=addMark(D,zone,edge);
  // the look tears the clothes where the blow landed (a no-op without it)
  S.hooks.rip(A,D,res,C,zone,edge,mk);
  return addWound(D,zone,res);
}

// ---------- 8. down means down ----------
function knockDown(D){
  if(D.dead)return;
  D.downed=true;D.knockUntil=Infinity;D.motor=Math.min(D.motor,.03);D.wasDown=true;D.posture='off';D.guarding=false;D.counter=false;D.setSpear=false;D.circleGuard=false;D.intent=null;D.action=null;
  // going down on broken glass cuts
  if(!S.warming&&D.hp>1&&onGlass(D)){D.hp=Math.max(1,D.hp-3);popup(D,'On the glass','#d6f3f5','−3',16,-20);bleed(D.p[PEL],0,8,D.dep,.8);}
  endClinch(D);
}
function kill(D,dir){
  if(D.dead)return;
  D.dead=true;D.downed=false;D.knockUntil=Infinity;D.intent=null;D.daze=0;D.carry=null;endClinch(D);
  dropWeapon(D,dir||0,false);
  if(S.gore!=='off'&&!S.warming)stain(D.p[PEL].x,D.dep,3,.7,22+D.body.bulk*8);
  for(const fn of V11.kill)fn(D,dir);
}
function standUp(D){D.downed=false;D.knockUntil=S.t;D.station=clampSt(D,D.p[PEL].x);D.lane=clamp(D.dep,DEP_MIN,DEP_MAX);resyncSides();}
// which side of Kael each enemy holds, after bodies have been thrown or rolled past each other
function resyncSides(){const K=hero();if(!K||K.dead)return;for(const f of foes()){const d=f.station-K.station;if(Math.abs(d)>6)f.side=Math.sign(d);}}
function nearestEnemy(A){let best=null,bd=1e9;for(const o of S.F){if(o.team===A.team||o.dead||o.downed||o.npc||o.walkIn)continue;const d=Math.abs(o.station-A.station)+Math.abs(o.lane-A.lane)*.6;if(d<bd){bd=d;best=o;}}return best;}
function rollInfo(A){
  if(!A.downed||A.dead)return null;const E=nearestEnemy(A),px=A.p[PEL].x,dir=E?(Math.sign(px-E.station)||-A.facing):-A.facing;
  for(const d of [dir,-dir]){const x=clampSt(A,px+d*80,A.lane);if(Math.abs(x-px)>=36)return{x,dir:d};}
  return null;
}
function planGetUp(A){
  standUp(A);
  return{att:null,Tend:1.05,events:[],dash:0,strikeX:A.station,Cfn:()=>({x:A.station,y:A.gr(A.station)-60})};
}
// a tumble along the floor before getting up
function planRoll(A,info){
  const d=info.dir,pel=A.p[PEL],w=d*8.5;
  for(const q of A.p){const rx=q.x-pel.x,ry=q.y-pel.y,vx=d*230-ry*w,vy=-60+rx*w;q.px=q.x-vx*DT;q.py=q.y-vy*DT;}
  A.vdep+=(Math.random()<.5?-1:1)*40;
  const events=[{t:.45,fn:()=>{standUp(A);dust(A.p[PEL].x,A.gr(A.p[PEL].x),.8,A.dep);}}];
  dust(pel.x,A.gr(pel.x),.7,A.dep);
  return{att:null,Tend:1.45,events,dash:80,strikeX:info.x,Cfn:()=>({x:info.x,y:A.gr(info.x)-40})};
}
function groundTechnique(A,D,kind){
  const T={kind,key:'ground',name:'',why:'',tags:['On the ground'],acc:1,dmg:1,along:null,ang:null,amp:.8,overlap:0,reach:null,anchor:'down',kick:false,vault:false,around:null,
    rising:false,descend:false,windCap:null,passing:false,flair:null,multi:null,knock:0,kdEase:0,ground:true,zone:'body'};
  if(kind==='sweep'){Object.assign(T,{key:'stomp',name:'Stomp',kick:true,stomp:true,why:`${D.name} is down, so a heel comes down on them.`});}
  else if(kind==='thrust')Object.assign(T,{key:'pin',name:wn(A,{spear:'Pinning thrust',sword:'Pinning stab',axe:'Spike down',short:'Stab down',fist:'Ground punch',blunt:'Downward smash',heavy:'Downward smash'},'Stab down'),
    why:`${D.name} is down, so the point is driven straight down.`});
  else if(kind==='overhead')Object.assign(T,{key:'chopdown',name:wn(A,{axe:'Chop down',sword:'Downward cleave',spear:'Shaft smash',fist:'Hammer down',blunt:'Downward smash',heavy:'Downward smash',short:'Stab down'},'Chop down'),dmg:1.1,
    why:`${D.name} is down, so the blow comes straight down on them.`});
  else Object.assign(T,{key:'lowcut',name:wn(A,{axe:'Low chop',fist:'Ground punch',blunt:'Low smash',heavy:'Low smash'},'Low cut'),why:`${D.name} is down, so the cut sweeps low across them.`});
  T.tags.push(A.wp.name);return T;
}

// ---------- 6. the clinch ----------
function clinchPartner(f){const c=f&&f.clinch;return c?(c.a===f?c.b:c.a):null;}
function clinchGap(a,b){return 30+(a.body.bulk+b.body.bulk)*9;}
function makeClinch(a,b,behind){
  endClinch(a);endClinch(b);const c={a,b,behind:!!behind,t0:S.t};a.clinch=b.clinch=c;S.clinches.push(c);
  const dir=Math.sign(b.station-a.station)||a.facing;b.lane=a.lane;b.station=clampSt(b,a.station+dir*clinchGap(a,b),a.lane);
  a.facing=dir;b.facing=c.behind?dir:-dir;a.guarding=b.guarding=false;a.counter=b.counter=false;a.circleGuard=b.circleGuard=false;
  const K=hero();for(const f of [a,b])if(f.team===1&&K&&!K.dead)f.side=Math.sign(f.station-K.station)||f.side;
  return c;
}
function endClinch(f){const c=f&&f.clinch;if(!c)return;c.a.clinch=null;c.b.clinch=null;S.clinches=S.clinches.filter(x=>x!==c);}
function heldBy(f){const c=f.clinch;return c&&c.b===f?c.a:null;}
// clinch poses: the holder has a fist in the collar (or both arms round the chest from behind); the held one shoves back or is pinned
function clinchBody(f,o){
  const c=f.clinch,P=clinchPartner(f);if(!P)return;const holder=c.a===f,dir=Math.sign(P.station-f.station)||f.facing,toward=dir===f.facing?1:-1;
  o.th=.3;o.crouch=Math.min(o.crouch,.84);o.lean=holder?.16*toward:(c.behind?.06:-.05);
}
function clinchArm(f,o){
  const c=f.clinch,P=clinchPartner(f);if(!P)return;const holder=c.a===f,a=f.arm;
  const collar=()=>{const ch=P.p[CHE],hd=P.p[HEAD],s=Math.sign(ch.x-f.p[CHE].x)||f.facing;return{x:lerp(ch.x,hd.x,.25)-s*P.body.torsoW*.4,y:lerp(ch.y,hd.y,.25)+3};};
  if(holder&&c.behind){o.off={fn:()=>{const ch=P.p[CHE];return{x:ch.x+P.facing*4,y:ch.y+6};}};o.hand={fn:()=>{const ch=P.p[CHE],hd=P.p[HEAD];return{x:lerp(ch.x,hd.x,.45)+P.facing*3,y:lerp(ch.y,hd.y,.45)};}};o.wAng=1.3;}
  else if(holder){o.off={fn:collar};o.hand={sh:[-.04*a,.3*a]};o.wAng=f.wp.key==='spear'?1.5:2.05;}
  else if(c.behind){o.hand={sh:[.18*a,.3*a]};o.off={sh:[.12*a,.34*a]};o.wAng=1.1;}
  else{o.hand={sh:[.04*a,.3*a]};o.off={fn:collar};o.wAng=f.wp.key==='spear'?1.5:2.05;}
  o.tilt=(o.tilt||0)+(holder?.1:-.05);
}
// a soft tie between the holder's grip and the held chest, so a push or a stagger drags both bodies
function clinchSolve(){
  for(const c of S.clinches){const a=c.a,b=c.b;if(a.motor<.4||b.motor<.4||a.dead||b.dead)continue;
    const h=a.p[HAB],t=b.p[CHE],dx=t.x-h.x,dy=t.y-h.y,d=Math.hypot(dx,dy);if(d<12)continue;
    const k=(d-12)/d*.18,wa=h.im/(h.im+t.im);h.x+=dx*k*wa;h.y+=dy*k*wa;t.x-=dx*k*(1-wa);t.y-=dy*k*(1-wa);}
}
function grabInfo(A,D){
  if(!D||A.clinch||D.clinch||A.downed||D.downed||D.dead||!upright(D)||tableBetween(A,D)||(S.divs.length&&divBetween(A,D)))return null;
  const gap=Math.abs(D.station-A.station),dz=Math.abs(D.lane-A.lane);
  if(gap>engageGap(A,D)+34||dz>26)return null;
  return{behind:facingAway(D,A)};
}
function sumMods(m){return m.reduce((s,x)=>s+x[1],0);}
function chanceOf(c){let n=0;for(let r=2;r<=20;r++)if(r===20||r+c.bonus>=c.dc)n++;return n/20;}
function rollVs(c,extra){const roll=1+Math.floor(S.rng()*20),total=roll+c.bonus,ok=roll!==1&&(roll===20||total>=c.dc);return{roll,mods:c.mods,defMods:c.defMods,bonus:c.bonus,total,dc:c.dc,ok,crush:ok&&(roll===20||total>=c.dc+10),seed:(S.rng()*1e9)|0,...(extra||{})};}
function grabMods(A,D,opening){
  const behind=facingAway(D,A);
  const mods=[['skill',A.skill],['build',Math.round((A.body.bulk-D.body.bulk)*4)],['opening',opening?3:0],[footLabel(A),post(A).atk],['from behind',behind?3:0],['dazed',A.daze?-2:0],['outclassed',outclassMod(A,D)]];
  const defMods=[['guard',D.guarding?2:0],[post(D).name.toLowerCase(),post(D).resist],['dazed',D.daze?-2:0],['limp',-D.wounds.leg]];
  return{mods,bonus:sumMods(mods),dc:9+D.skill+sumMods(defMods),defMods,behind};
}
function resolveGrab(A,D,opening){const c=grabMods(A,D,opening);return rollVs(c,{kind:'grab',behind:c.behind});}
function planGrab(A,D,gr){
  const fa=Math.sign(D.station-A.station)||A.facing,arm=A.arm,leg=A.leg,z0=A.dep,zS=D.lane,startX=A.curBody.px;
  const gap=clinchGap(A,D),sx=clampSt(A,D.station-fa*(gap+4),zS),dist=Math.hypot(sx-startX,(zS-z0)*.9);
  const tApp=dist<10?.06:clamp(dist/380,.12,.5),Tc=tApp+.16,Tend=Tc+.55;
  A.lane=zS;
  const collar=()=>{const ch=D.p[CHE],hd=D.p[HEAD];return{x:lerp(ch.x,hd.x,.3)-fa*D.body.torsoW*.4,y:lerp(ch.y,hd.y,.3)+2};};
  const body=[{t:0,v:{...A.curBody,pz:z0}},{t:Math.max(.06,Tc-.12),v:{px:sx-fa*4,pz:zS,crouch:.82,lean:.16,stF:.36*leg,stB:-.36*leg,th:.12},e:sstep},
    {t:Tc,v:{px:sx,crouch:.82,lean:.26,stF:.42*leg,stB:-.36*leg,th:.1},e:eIn},{t:Tend,v:()=>A.guardBody(),e:sstep}];
  // the free hand takes the collar while the weapon is held back out of the way
  const reach={hand:{sh:[-.04*arm,-.12*arm]},wAng:-1.5,off:{fn:collar},tilt:.05};
  const armK=[{t:0,v:{...A.curArm}},{t:Tc,v:reach,e:eIn},{t:Tc+.12,v:reach},{t:Tend,v:()=>A.guardArm(),e:sstep}];
  const react={t0:S.t,end:Tc+.4,body:[{t:0,v:{...D.curBody}},{t:Tc+.4,v:()=>D.guardBody()}],arm:[{t:0,v:{...D.curArm}},{t:Tc+.4,v:()=>D.guardArm()}]};
  return{att:{t0:S.t,end:Tend,body,arm:armK},react,Tend,strikeX:sx,dash:dist,events:[{t:Tc,fn:()=>doGrab(A,D,gr,fa)}],Cfn:collar};
}
function doGrab(A,D,gr,fa){
  const ex=S.game.ex;
  if(gr.ok&&!D.dead&&!D.downed&&!A.downed&&!A.dead){
    makeClinch(A,D,gr.behind);flash(D.p[CHE],18,'#ffd9a8',D.dep);S.hooks.sound('thud',200);
    popup(D,gr.behind?'Held from behind':'Grabbed','#ffd9a8',null,20);S.callouts.push({i:A.idx,text:gr.behind?'Hold':'Clinch',age:0,life:.9,dx:-A.facing*20});
    S.hooks.grab(ex,{ok:true,behind:gr.behind});
    if(ex)clinchFollow(ex,A,D,gr.behind);
  }else{
    knockBalance(A,FOOT_HIT,D);A.motor=Math.min(A.motor,.7);for(const i of [PEL,CHE,HEAD,HAB])A.p[i].px-=fa*80*DT;D.station=clampSt(D,D.station+fa*14);
    popup(D,'Slipped the grab','#a5dcff','Grabber off balance',19);S.hooks.grab(ex,{ok:false});
    if(ex)considerOpening(ex,D,A,freshBreak(A)?'broken':'brace');
  }
  S.hooks.status();
}
// after a grab: the holder gets a quick choice, or, if it pins Kael from behind, an ally strikes
function clinchFollow(ex,A,D,behind){
  if(behind&&A.team!==D.team){const E=gangPartner(A,D);
    if(E){ex.openAt=S.t+.12;ex.openFor=E;ex.openSource='gang';ex.openKind='gang';ex.openOpp=D;S.hooks.read(ex,E,{free:true,ok:true,gang:true},'gang',D);return;}}
  ex.openAt=S.t+.12;ex.openFor=A;ex.openSource='clinch';ex.openKind='clinch';ex.openOpp=D;
}

// dirty strikes from inside the clinch
function dirtyTech(A,D,kind){
  const c=A.clinch,back=!!(c&&c.b===A&&c.behind);
  const T={kind,key:kind,name:'',why:'',tags:['Clinch'],acc:0,dmg:1,along:null,ang:null,amp:1,overlap:0,reach:null,anchor:null,kick:false,vault:false,around:null,
    rising:false,descend:false,windCap:null,passing:false,flair:null,multi:null,knock:.45,kdEase:0,dirty:true,back,dice:[1,6,2],zone:'head'};
  if(kind==='headbutt')Object.assign(T,{name:back?'Rear headbutt':'Headbutt',zone:'head',dice:[1,6,3],why:back?'Pinned from behind, the back of the skull goes into their face.':'Chest to chest, the forehead does the work.'});
  else if(kind==='knee')Object.assign(T,{name:back?'Heel stomp':'Knee to the gut',zone:back?'leg':'body',why:back?'Held from behind, a heel comes down on their foot.':'Pulled in close, a knee drives into the stomach.'});
  else Object.assign(T,{name:back?'Back elbow':'Elbow',zone:'head',dice:[1,4,3],why:back?'A short elbow thrown back into the face.':'A short elbow across the jaw.'});
  return T;
}
function planDirty(A,D,kind,res){
  const T=res.tech,dir=Math.sign(D.station-A.station)||A.facing,ls=dir===A.facing?1:-1,arm=A.arm,leg=A.leg,out=res.out;
  const spd=lerp(1.15,.85,A.sk),Tw=.16*spd,Timp=Tw+.1*spd,Td=Timp+.06,Tr=Td+.32,Tend=Tr+.3;
  const pt=(i,j,u)=>()=>({x:lerp(D.p[i].x,D.p[j].x,u),y:lerp(D.p[i].y,D.p[j].y,u)});
  const target=kind==='headbutt'||kind==='elbow'?pt(CHE,HEAD,.85):T.back?()=>({x:D.p[FTF].x,y:D.p[FTF].y-4}):pt(PEL,CHE,.3);
  let Cfn=target;
  if(out==='block'){const B=target();Cfn=()=>({x:B.x-dir*8,y:B.y});}else if(out==='dodge'||out==='fumble'){const M=target();Cfn=()=>({x:M.x-dir*5,y:M.y-12});}
  const gB=()=>A.guardBody(),gA=()=>A.guardArm(),body=[{t:0,v:{...A.curBody}}],armK=[{t:0,v:{...A.curArm}}];let contactSeg,cp;
  if(kind==='headbutt'){
    body.push({t:Tw,v:()=>({...A.guardBody(),lean:-.24*ls,crouch:.86,th:.3}),e:eOut},{t:Timp,v:()=>({...A.guardBody(),px:A.station+dir*6,lean:.52*ls,crouch:.8,th:.3}),e:eIn},
      {t:Td,v:()=>({...A.guardBody(),px:A.station+dir*6,lean:.48*ls,crouch:.8,th:.3})});
    armK.push({t:Tw,v:()=>({...A.guardArm(),tilt:-.3*ls}),e:eOut},{t:Timp,v:()=>({...A.guardArm(),tilt:.4*ls}),e:eIn},{t:Td,v:()=>({...A.guardArm(),tilt:.35*ls})});
    contactSeg=()=>[A.p[CHE],A.p[HEAD]];cp=A.p[HEAD];}
  else if(kind==='knee'&&!T.back){
    body.push({t:Tw,v:()=>({...A.guardBody(),lean:.18,crouch:.84,th:.9,kick:{pl:[-.05*leg,.5*leg]},kw:.9}),e:eOut},{t:Timp,v:()=>({...A.guardBody(),lean:.12,crouch:.86,th:.9,kick:{pl:[.2*leg,.1*leg]},kw:1}),e:eIn},
      {t:Td,v:()=>({...A.guardBody(),lean:.12,crouch:.86,th:.9,kick:{pl:[.2*leg,.1*leg]},kw:1})});
    contactSeg=()=>[A.p[PEL],A.p[KNF]];cp=A.p[KNF];}
  else if(kind==='knee'){
    body.push({t:Tw,v:()=>({...A.guardBody(),crouch:.88,th:.9,kick:{pl:[-.14*leg,.42*leg]},kw:.9}),e:eOut},{t:Timp,v:()=>({...A.guardBody(),crouch:.84,th:.9,kick:{fn:Cfn},kw:1}),e:eIn},
      {t:Td,v:()=>({...A.guardBody(),crouch:.84,th:.9,kick:{fn:Cfn},kw:1})});
    contactSeg=()=>[A.p[KNF],A.p[FTF]];cp=A.p[FTF];}
  else{
    const cock={hand:{fn:()=>{const c=A.p[CHE];return{x:c.x-dir*.08*arm,y:c.y-.52*arm};}},wAng:-1.7,off:A.wp.off?{sh:[.2*arm,.2*arm]}:{sh:[.25*arm,.15*arm]},tilt:0};
    const swing={hand:{fn:()=>{const c=A.p[CHE];return{x:c.x+dir*.05*arm,y:c.y-.32*arm};}},wAng:-.6,off:cock.off,tilt:.1};
    body.push({t:Tw,v:()=>({...A.guardBody(),lean:-.1*ls,th:.3}),e:eOut},{t:Timp,v:()=>({...A.guardBody(),px:A.station+dir*5,lean:.28*ls,th:.3}),e:eIn},{t:Td,v:()=>({...A.guardBody(),px:A.station+dir*5,lean:.26*ls,th:.3})});
    armK.push({t:Tw,v:cock,e:eOut},{t:Timp,v:swing,e:eIn},{t:Td,v:swing});
    contactSeg=()=>[A.p[ELF],A.p[HAF]];cp=A.p[ELF];}
  body.push({t:Tr,v:gB,e:sstep},{t:Tend,v:gB});armK.push({t:Tr,v:gA,e:sstep},{t:Tend,v:gA});
  // the one taking it flinches back, ducks or gets an arm up
  const db={...D.curBody},da={...D.curArm},rk=out==='block'?{t:Timp,v:()=>({...D.guardBody(),lean:-.08})}:out==='dodge'||out==='fumble'?{t:Timp,v:()=>({...D.guardBody(),lean:-.3,crouch:.8})}:{t:Timp,v:()=>D.guardBody()};
  const ra=out==='block'?{t:Timp-.02,v:{hand:{sh:[.18*D.arm,-.42*D.arm]},wAng:-1.9,off:D.wp.off?'grip':{sh:[.22*D.arm,-.3*D.arm]},tilt:-.1},e:eOut}:{t:Timp,v:()=>D.guardArm()};
  const react={t0:S.t,end:Timp+.5,body:[{t:0,v:db},{t:Math.max(.02,Timp-.1),v:()=>D.guardBody()},rk,{t:Timp+.5,v:()=>D.guardBody(),e:sstep}],arm:[{t:0,v:da},ra,{t:Timp+.5,v:()=>D.guardArm(),e:sstep}]};
  const events=[{t:Tw+.02,fn:()=>S.hooks.sound('swoosh',.7)}];
  if(out==='fumble')events.push({t:Td+.05,fn:()=>{spendFoot(A,FOOT_HIT);popup(A,'Fumble','#c9d0f5',null,20);}});
  return{att:{t0:S.t,end:Tend,body,arm:armK},react,Timp,Td,Tend,strikeX:A.station,Cfn,contactSeg,contactVel:()=>({x:(cp.x-cp.px)/DT,y:(cp.y-cp.py)/DT}),dash:0,theta:0,events,tWind:Tw,dir,slip:null};
}

// ---------- 7. throws ----------
function landingHazard(A,P,x,z){
  if(tableIntact()&&Math.abs(z-S.table.dep)<TD+16){const b=tableBox();if(x>b.l-14&&x<b.r+14)return{kind:'table'};}
  if(wallSolid()&&x>S.arena.wall-44)return{kind:'wall'};
  for(const o of S.F){if(o===A||o===P||o.dead||o.downed||o.clinch||o.npc||o.walkIn||o.team===A.team)continue;if(Math.abs(o.station-x)<38&&Math.abs(o.lane-z)<30)return{kind:'body',o};}
  for(const Q of S.props){if(Q.broken||Math.abs(Q.dep-z)>Q.dz+14)continue;const b=Q.box;if(x>b.l-10&&x<b.r+10)return{kind:'prop',p:Q};}
  if(S.arenaKey==='street'&&z>CURB0-10&&z<CURB1+18)return{kind:'curb'};
  return null;
}
function throwInfo(A){
  const c=A.clinch;if(!c)return null;const P=clinchPartner(A);if(!P||P.downed||P.dead)return null;
  const dP=Math.sign(P.station-A.station)||A.facing,holder=c.a===A,shoulder=!holder&&c.behind,opts=[];
  // over: the body goes over the thrower and lands on the far side; slam: driven down ahead
  // each throw can land anywhere along a short reach; aim it at whatever hurts most
  for(const [how,x0,reach] of [[shoulder?'shoulder':'hip',A.station-dP*58,[0,-14,-28]],['slam',P.station+dP*28,[0,16,32]]]){
    if(shoulder&&how==='slam')continue;let best=null;
    for(const r of reach){const lx=clampStage(x0+dP*r);if(Math.abs(lx-A.station)<34)continue;
      const cw=S.divs.length?divCross1(P.station,lx,A.lane):null;
      if(cw){const dir=Math.sign(lx-P.station)||dP,face=dir>0?divL(cw):divR(cw);best={how,x:clampStage(face-dir*18),hazard:{kind:'div',w:cw,dir}};break;}
      const hz=landingHazard(A,P,lx,A.lane);if(!best||(hz&&!best.hazard))best={how,x:lx,hazard:hz};if(hz)break;}
    if(best){best.score=(best.hazard?100:0)+(how==='slam'?0:12);opts.push(best);}}
  if(!opts.length)return null;opts.sort((a,b)=>b.score-a.score);return opts[0];
}
function throwMods(A,D,opening){
  const c=A.clinch,holder=!!c&&c.a===A;
  const mods=[['skill',A.skill],['build',Math.round((A.body.bulk-D.body.bulk)*4)],['opening',opening?3:0],[footLabel(A),post(A).atk],['grip',holder?(c.behind?2:0):(c&&c.behind?-1:-3)],['dazed',A.daze?-2:0],['outclassed',outclassMod(A,D)]];
  const defMods=[[post(D).name.toLowerCase(),post(D).resist],['limp',-D.wounds.leg],['dazed',D.daze?-2:0]];
  return{mods,bonus:sumMods(mods),dc:10+D.skill+sumMods(defMods),defMods};
}
function resolveThrow(A,D,opening){const c=throwMods(A,D,opening),r=rollVs(c,{kind:'throw'});r.dmg=r.ok?Math.max(1,Math.round((3+1+Math.floor(S.rng()*6)+(r.crush?3:0))*(A.hench?CREW.dmg:1))):0;return r;}
function planThrow(A,D,tr,info){
  const dP=Math.sign(D.station-A.station)||A.facing,ls=dP===A.facing?1:-1,T0=.22,air=.52,Tl=T0+air,Tend=Tl+.8,ex=S.game.ex;
  if(!tr.ok){
    const body=[{t:0,v:{...A.curBody}},{t:T0,v:()=>({...A.guardBody(),crouch:.7,lean:.3*ls,th:.9}),e:eOut},{t:T0+.3,v:()=>({...A.guardBody(),crouch:.8,lean:-.1*ls,th:.3})},{t:Tend,v:()=>A.guardBody(),e:sstep}];
    const events=[{t:T0+.12,fn:()=>{endClinch(A);knockBalance(A,FOOT_HIT,D);A.motor=Math.min(A.motor,.6);A.ready+=12;D.station=clampSt(D,D.station+dP*18);
      popup(D,'Countered','#a5dcff','Thrower off balance',19);S.hooks.sound('thud',220);if(ex)considerOpening(ex,D,A,freshBreak(A)?'broken':'brace');S.hooks.status();}}];
    return{att:{t0:S.t,end:Tend,body,arm:[{t:0,v:{...A.curArm}},{t:Tend,v:()=>A.guardArm()}]},Tend:Tend+.1,events,dash:0,strikeX:A.station,Cfn:()=>({x:D.p[CHE].x,y:D.p[CHE].y})};
  }
  const tl=info.x>A.station?1:-1,lean2=tl===A.facing?1:-1;
  const body=[{t:0,v:{...A.curBody}},{t:T0,v:()=>({...A.guardBody(),crouch:.64,lean:.32*ls,th:.95}),e:eOut},
    {t:T0+air*.5,v:()=>({...A.guardBody(),crouch:.78,lean:-.12*ls,th:.95}),e:sstep},{t:Tl,v:()=>({...A.guardBody(),crouch:.68,lean:.38*lean2,th:.95}),e:eIn},{t:Tend,v:()=>A.guardBody(),e:sstep}];
  const heave={hand:{fn:()=>({x:D.p[CHE].x,y:D.p[CHE].y})},wAng:1.2,off:{fn:()=>({x:D.p[PEL].x,y:D.p[PEL].y})},tilt:.1};
  const armK=[{t:0,v:{...A.curArm}},{t:T0,v:heave,e:eOut},{t:T0+air*.55,v:heave},{t:Tend,v:()=>A.guardArm(),e:sstep}];
  const events=[{t:T0,fn:()=>startCarry(A,D,info,air)},{t:Tl,fn:()=>landThrow(A,D,tr,info)}];
  S.callouts.push({i:A.idx,text:info.how==='slam'?'Body slam':info.how==='shoulder'?'Shoulder throw':'Hip throw',age:0,life:1.1,dx:-A.facing*20});
  return{att:{t0:S.t,end:Tend,body,arm:armK},Tend:Tend+.1,events,dash:0,strikeX:A.station,Cfn:()=>({x:info.x,y:S.arena.ground(info.x,A.lane)-30})};
}
function startCarry(A,D,info,air){
  endClinch(A);D.downed=true;D.knockUntil=Infinity;D.motor=.02;D.wasDown=true;D.guarding=false;D.counter=false;D.action=null;D.posture='off';
  const p=D.p[PEL],gl=S.arena.ground(info.x,A.lane),over=info.how!=='slam';
  D.carry={t0:S.t,dur:air,from:{x:p.x,y:p.y},apex:{x:lerp(A.p[CHE].x,info.x,over?.3:.5),y:Math.min(A.p[HEAD].y,p.y)-(over?A.leg*.55:A.leg*.25)},
    to:{x:info.x,y:gl-D.body.torsoW*.7-6},spin:-(Math.sign(info.x-p.x)||1)*Math.PI*(over?1.15:.6)};
  D.station=info.x;D.lane=A.lane;
}
// the thrown body follows an arc and turns over; its limbs are left to the physics
function carryStep(f){
  const c=f.carry;if(!c)return;const u=(S.t-c.t0)/c.dur;if(u<0)return;if(u>=1){f.carry=null;return;}
  const bz=t=>({x:(1-t)*(1-t)*c.from.x+2*(1-t)*t*c.apex.x+t*t*c.to.x,y:(1-t)*(1-t)*c.from.y+2*(1-t)*t*c.apex.y+t*t*c.to.y});
  const P=bz(u),Pn=bz(Math.min(1,u+DT/c.dur)),ang=c.spin*u,tor=f.body.torso,pel=f.p[PEL],che=f.p[CHE],vx=Pn.x-P.x,vy=Pn.y-P.y;
  const tc={x:P.x+Math.sin(ang)*tor,y:P.y-Math.cos(ang)*tor};
  pel.x=P.x;pel.y=P.y;pel.px=P.x-vx;pel.py=P.y-vy;che.x=lerp(che.x,tc.x,.6);che.y=lerp(che.y,tc.y,.6);che.px=che.x-vx;che.py=che.y-vy;
}
function landThrow(A,D,tr,info){
  const ex=S.game.ex;D.carry=null;if(D.dead)return;
  let dmg=tr.dmg,label='Thrown';const hz=info.hazard,x=D.p[PEL].x,g=D.gr(x),dir=Math.sign(info.x-A.station)||A.facing;
  for(const q of D.p){q.py=q.y-(q.y-q.py)*.3-2;}
  dust(x,g,1.7,D.dep);ring(x,D.dep,84,'#ffd9a8');impactFeel(A,{dmg:dmg+8,out:tr.crush?'crit':'hit'},dir,'hit');S.freeze=Math.max(S.freeze,.12);
  S.hooks.sound('thud',440);S.hooks.sound('crit',dmg);
  if(hz){
    if(hz.kind==='table'&&tableIntact()){const Tb=S.table;Tb.state='breaking';Tb.breakBy=S.t+.03;Tb.breakDir=dir;Tb.breakFrom=D;dmg+=6;label='Through the table';}
    else if(hz.kind==='wall'&&S.wall&&S.wall.state==='standing'){S.wall.hp-=1;dmg+=5;label='Into the wall';if(S.wall.hp<=0){S.wall.state='breaching';S.wall.breakBy=S.t+.05;S.wall.breakFrom=D;S.wall.dir=dir;label='Through the wall';}}
    else if(hz.kind==='body'&&!hz.o.dead&&!hz.o.downed){const o=hz.o;knockDown(o);o.hp=Math.max(0,o.hp-3);
      // the body takes the legs out and the bystander topples back over it
      for(const i of [KNF,FTF,KNB,FTB]){const q=o.p[i];q.px-=dir*230*DT;q.py+=40*DT;}
      for(const i of [CHE,HEAD,ELF,ELB,HAF,HAB]){const q=o.p[i];q.px+=dir*110*DT;}
      dust(o.p[PEL].x,o.gr(o.p[PEL].x),1,o.dep);popup(o,'3','#ffffff','Bowled over',19,-4);if(o.hp<=0)kill(o,dir);dmg+=2;label='Into '+o.name;}
    else if(hz.kind==='curb'){dmg+=3;label='On the curb';}
    else if(hz.kind==='div'){const w=hz.w,M=DIV_MAT[w.mat];
      if(hz.through){if(divSolid(w))breakDivider(w,hz.dir);dmg+=M.breach;label='Through '+divThe(w);}
      else if(divSolid(w)){divSlam(w,D,hz.st||1);dmg+=M.slam;label='Into '+divThe(w);dust(x,g-50,1.2,D.dep);S.hooks.sound(M.snd,.8);}}
    else if(hz.kind==='prop'&&!hz.p.broken){const Q=hz.p;breakProp(Q,dir,700);dmg+=PROP[Q.type].land;label=(Q.type==='bistro'||Q.type==='cart'?'Through the ':'Onto the ')+PROP[Q.type].name;}
  }
  D.hp=Math.max(0,D.hp-dmg);bleed({x,y:g-10},dir,Math.round(dmg*.5),D.dep,.7);addMark(D,'body',false);addWound(D,'body',{dmg,out:tr.crush?'crit':'hit'});
  if(D.hp<=0)kill(D,dir);
  D.lane=clamp(D.dep,DEP_MIN,DEP_MAX);D.station=clampSt(D,clamp(x,30,W-30),D.lane);resyncSides();
  popup(D,String(dmg),'#ffffff',label,26);
  A.facing=Math.sign(D.station-A.station)||A.facing;
  S.hooks.throwLand(ex,{dmg,label});S.hooks.status();
}
// push away: the holder shoves the held fighter off with no roll
function planPush(A,D){
  const sres={ok:true,crush:false,push:true,roll:0,total:0,dc:0,mods:[],defMods:[],bonus:0};
  const plan=planShove(A,D,sres,'shove',null);
  plan.events.unshift({t:Math.max(0,(plan.events[0]||{t:.2}).t-.01),fn:()=>endClinch(A)});
  return{plan,sres};
}
// break free: twist out of the hold
function breakMods(A,D,opening){
  const c=A.clinch;
  const mods=[['skill',A.skill],['build',Math.round((A.body.bulk-D.body.bulk)*4)],['opening',opening?3:0],[footLabel(A),post(A).atk],['pinned',c&&c.behind?-2:0],['dazed',A.daze?-2:0],['outclassed',outclassMod(A,D)]];
  const defMods=[[post(D).name.toLowerCase(),post(D).resist],['dazed',D.daze?-2:0],['arm wound',-armPen(D)]];
  return{mods,bonus:sumMods(mods),dc:9+D.skill+sumMods(defMods),defMods};
}
function resolveBreak(A,D,opening){return rollVs(breakMods(A,D,opening),{kind:'breakfree'});}
function planBreak(A,D,br){
  const c=A.clinch,dD=Math.sign(D.station-A.station)||-A.facing,ls=dD===A.facing?1:-1,Tc=.3,Tend=Tc+.6,ex=S.game.ex,behind=!!(c&&c.behind);
  const body=[{t:0,v:{...A.curBody}},{t:.14,v:()=>({...A.guardBody(),crouch:.76,lean:-.2*ls,th:.3}),e:eOut},{t:Tc,v:()=>({...A.guardBody(),crouch:.8,lean:.18*ls,th:.3}),e:eIn},{t:Tend,v:()=>A.guardBody(),e:sstep}];
  const twist={hand:{sh:[.35*A.arm,-.25*A.arm]},wAng:-1.2,off:A.wp.off?'grip':{sh:[.3*A.arm,-.1*A.arm]},tilt:-.1};
  const armK=[{t:0,v:{...A.curArm}},{t:.14,v:twist,e:eOut},{t:Tend,v:()=>A.guardArm(),e:sstep}];
  const events=[{t:Tc,fn:()=>{
    if(br.ok&&A.clinch){endClinch(A);A.station=clampSt(A,A.station-dD*26);if(behind)A.facing=dD;knockBalance(D,2,A);for(const i of [PEL,CHE,HEAD])D.p[i].px-=dD*70*DT;
      popup(A,behind?'Twisted free':'Broke free','#a5dcff',null,20);S.hooks.sound('thud',160);}
    else popup(A,'Held fast','#ff8a5c',null,19);
    S.hooks.breakfree(ex,{ok:br.ok});S.hooks.status();}}];
  return{att:{t0:S.t,end:Tend,body,arm:armK},Tend:Tend+.1,events,dash:0,strikeX:A.station,Cfn:()=>({x:D.p[CHE].x,y:D.p[CHE].y})};
}

// ---------- 10. gang-ups and human shields ----------
// another enemy close enough to strike Kael straight after an ally
function gangPartner(A,K){
  let best=null,bd=1e9;
  for(const o of S.F){if(o===A||o.team!==A.team||o.dead||o.downed||o.clinch||!upright(o))continue;
    const d=Math.abs(o.station-K.station)-engageGap(o,K),dz=Math.abs(o.lane-K.lane);if(d<=50&&dz<=40&&d+dz<bd){bd=d+dz;best=o;}}
  return best;
}
function considerGang(ex,E,K){
  // a fighter already on the floor gets no pile-on here: the others still take their own turns at him
  if(!E||E.dead||K.dead||K.downed||(ex.depth||0)>=2||ex.openAt!=null)return;
  const held=!!heldBy(K),read=held?{free:true,ok:true,gang:true}:readRoll(E,K,'gang',ex.depth||0);
  S.hooks.read(ex,E,read,'gang',K);
  if(read.ok){ex.openAt=S.t+.1;ex.openFor=E;ex.openSource='gang';ex.openKind='gang';ex.openOpp=K;}
}
// Kael holding an enemy from behind, between himself and the attacker
function shieldFor(X,K){
  const c=K&&K.clinch;if(!c||c.a!==K||!c.behind)return null;const P=c.b;if(!P||P===X||P.dead||P.downed)return null;
  return Math.sign(X.station-K.station)===Math.sign(P.station-K.station)?P:null;
}
function shieldInfo(A){
  // only the one in control (holding from the front) can turn the other into a shield
  const c=A.clinch;if(!c||A.team!==0||c.a!==A||c.behind)return null;const P=clinchPartner(A);if(!P||P.dead||P.downed)return null;
  let X=null,bd=1e9;for(const o of foes()){if(o===P||o.downed||o.clinch||o.walkIn)continue;const d=Math.abs(o.station-A.station);if(d<bd&&d<320){bd=d;X=o;}}
  if(!X)return null;const sx=Math.sign(X.station-A.station)||A.facing,sp=Math.sign(P.station-A.station)||-A.facing;
  return{X,swap:sp!==sx,side:sx};
}
function planShield(A,info){
  const P=clinchPartner(A),dur=.55,z=A.lane;
  if(info.swap){const ax=A.station;A.station=P.station;P.station=ax;}
  makeClinch(A,P,true);A.facing=info.side;P.facing=info.side;
  const K=hero();if(P.team===1&&K)P.side=Math.sign(P.station-K.station)||info.side;
  // both bodies swing through the depth so they don't pass through each other
  A.action={t0:S.t,end:dur,body:[{t:0,v:{...A.curBody}},{t:dur*.5,v:()=>({...A.guardBody(),pz:clamp(z+16,DEP_MIN,DEP_MAX),crouch:.8})},{t:dur,v:()=>A.guardBody(),e:sstep}],arm:[{t:0,v:{...A.curArm}},{t:dur,v:()=>A.guardArm()}]};
  P.action={t0:S.t,end:dur,body:[{t:0,v:{...P.curBody}},{t:dur*.5,v:()=>({...P.guardBody(),pz:clamp(z-16,DEP_MIN,DEP_MAX),crouch:.8})},{t:dur,v:()=>P.guardBody(),e:sstep}],arm:[{t:0,v:{...P.curArm}},{t:dur,v:()=>P.guardArm()}]};
  S.callouts.push({i:A.idx,text:'Human shield',age:0,life:1.1,dx:-A.facing*20});
  return{att:A.action,Tend:dur+.35,events:[],dash:0,strikeX:A.station,Cfn:()=>({x:P.p[CHE].x,y:P.p[CHE].y})};
}

// ---------- 9. disarms, loot and improvised weapons ----------
function dropWeapon(D,dir,force){
  const wk=D.weaponKey,wp=WEAPONS[wk];if(!wp||wp.unarmed)return null;
  const h=D.p[HAF],t=D.p[TIP],L=Math.hypot(t.x-h.x,t.y-h.y)||1,ux=(t.x-h.x)/L,uy=(t.y-h.y)/L;
  const vx=dir*(force?150+Math.random()*120:20),vy=force?-(210+Math.random()*140):-10,sp=(Math.random()<.5?-1:1)*(force?150+Math.random()*120:30+Math.random()*40);
  const a={x:h.x-ux*wp.butt,y:h.y-uy*wp.butt,r:2,im:1,vx0:0,vy0:0},b={x:t.x,y:t.y,r:2,im:1,vx0:0,vy0:0};
  a.px=a.x-(vx+uy*sp)*DT;a.py=a.y-(vy-ux*sp)*DT;b.px=b.x-(vx-uy*sp)*DT;b.py=b.y-(vy+ux*sp)*DT;
  const it={key:wk,owner:D.idx,dep:clamp(D.dep+(Math.random()-.5)*(force?34:6),DEP_MIN,DEP_MAX),a,b,len:wp.len+wp.butt,wdes:D.wdes||null};
  if(D.sidearm==='drawn'&&wk==='dagger'){it.sidearm=true;D.sidearm='lost';}
  S.items.push(it);if(realWeapon(wk)&&!D.ownWeapon&&!it.sidearm)D.ownWeapon=wk;D.setWeapon('fists');return it;
}
function disarmMods(A,D,src){
  const mods=[['skill',A.skill],[src==='break'?'weight':'leverage',src==='break'?Math.round(A.wp.mass):2]];
  const defMods=[['skill',D.skill],['two hands',D.wp.off?3:0],[post(D).name.toLowerCase(),D.posture==='set'?2:D.posture==='off'?-2:0],['arm wound',-2*armPen(D)],['broken',D.broken?-10:0]];
  return{mods,bonus:sumMods(mods),dc:12+sumMods(defMods),defMods};
}
function tryDisarm(A,D,src,fa){
  if(D.dead||D.wp.unarmed)return null;const r=rollVs(disarmMods(A,D,src),{kind:'disarm',src});
  if(r.ok){const it=dropWeapon(D,fa,true);sparks(D.p[HAF],12,'#fff3cf',D.dep);popup(D,'Disarmed','#ffc163',null,22,-30);S.hooks.sound('clang',1);r.item=it;}
  return r;
}
const LOOT_RANK={fists:0,mug:1,bottle:1,shard:1,stone:1,club:2,chairleg:2,shaft:2,dagger:3,sword:3,axe:3,spear:3};
const LOOT_NAME={mug:'tankard',bottle:'bottle',stone:'stone',club:'table leg',chairleg:'chair leg',shaft:'spear shaft',shard:'broken bottle',sword:'longsword',axe:'greataxe',spear:'spear',dagger:'dagger'};
// a weapon on the floor by what it is: a crew's own weapon goes by its own name (sk_arms.js)
function lootName(l){const n=l&&l.ref&&l.ref.wdes&&typeof armsCrewName==='function'?armsCrewName(l.ref.wdes):null;return n?n.toLowerCase():LOOT_NAME[l.kind];}
function lootList(){
  const L=[];
  for(const it of S.items)L.push({kind:it.key,x:it.stuck&&it.h?it.h.x:(it.a.x+it.b.x)/2,y:it.stuck&&it.h?it.h.y:Math.min(it.a.y,it.b.y),d:it.dep,ref:it,src:'item',owner:it.owner,stuck:!!it.stuck});
  const T=S.table;if(T&&T.on)for(const q of T.props)L.push({kind:q.kind==='mug'?'mug':'bottle',x:q.x,y:q.y,d:T.dep,ref:q,src:'prop'});
  for(const p of S.debris)if((p.club||p.loot)&&!p.taken)L.push({kind:p.loot||'club',x:(p.a.x+p.b.x)/2,y:(p.a.y+p.b.y)/2,d:p.dep,ref:p,src:'debris'});
  for(const it of S.wares)if(!it.gone&&it.kind==='bottle')L.push({kind:'bottle',x:it.x,y:it.y,d:it.dep,ref:it,src:'ware'});
  for(const p of S.rubble)if(!p.taken)L.push({kind:'stone',x:(p.a.x+p.b.x)/2,y:(p.a.y+p.b.y)/2,d:p.dep,ref:p,src:'rubble'});
  return L;
}
function pickupInfo(A){
  if(A.downed||A.clinch||A.dead)return null;const cur=A.sidearm==='drawn'?2.5:LOOT_RANK[A.weaponKey]??3;if(cur>=3)return null;
  let best=null,bs=-1e9;
  for(const l of lootList()){const r=LOOT_RANK[l.kind]??0;if(r<=cur)continue;if(WEAPONS[l.kind]&&WEAPONS[l.kind].heroOnly&&A.idx!==0)continue;const dx=Math.abs(l.x-A.station),dz=Math.abs(clamp(l.d,DEP_MIN,DEP_MAX)-A.lane);if(dx>200||dz>80)continue;
    if(l.x<20||l.x>W-20||(wallSolid()&&l.x>S.arena.wall-8))continue;
    if(S.divs.length&&divOnSeg(A.station,A.lane,l.x,clamp(l.d,DEP_MIN,DEP_MAX),6))continue;
    if(l.src!=='prop'&&tableIntact()&&inTableLane(A.lane)&&inTableLane(clamp(l.d,DEP_MIN,DEP_MAX))){const b=tableBox();if((A.station-b.cx)*(l.x-b.cx)<0&&(l.x<b.l-4||l.x>b.r+4))continue;}
    const own=l.owner===A.idx&&!(l.ref&&l.ref.sidearm),s=r*60+(own?70:0)-dx*.4-dz*.6;if(s>bs){bs=s;best=l;}}
  if(best&&A.sidearm==='drawn'&&(LOOT_RANK[best.kind]??0)<3)return null;
  return best;
}
function lootLabel(A,l){
  const nm=lootName(l);
  if(l.stuck){const body=S.F[l.ref.stuck.f];return l.owner===A.idx?`Pull ${nm} from ${body.name}`:`Pull ${S.F[l.owner].name}'s ${nm} from ${body.name}`;}
  return l.owner===A.idx?'Retrieve '+nm:l.owner!=null?`Take ${S.F[l.owner].name}'s ${nm}`:'Pick up '+nm;}
function planPickup(A,L){
  const z0=A.dep,tz=clamp(L.d,DEP_MIN,DEP_MAX),dir=Math.sign(L.x-A.station)||A.facing,sx=clampSt(A,L.x-dir*16,tz),dist=Math.hypot(sx-A.station,(tz-z0)*.9);
  const run=lerp(240,340,A.sk)*(1-.12*A.wounds.leg),t1=Math.max(.15,dist/run),Tc=t1+.24,Tend=Tc+.55,arm=A.arm;
  A.station=sx;A.lane=tz;A.facing=dir;
  const pt1=L.src==='prop'||L.src==='ware';
  const grabPt=()=>{const r=L.ref;if(L.src==='item'&&r.stuck&&r.h)return{x:r.h.x,y:r.h.y};const y=L.src==='item'?Math.min(r.a.y,r.b.y):pt1?r.y:(r.a.y+r.b.y)/2,x=pt1?r.x:L.src==='item'?(r.a.x+r.b.x)/2:(r.a.x+r.b.x)/2;return{x,y:y-2};};
  const low=L.stuck?clamp(.5+(A.gr(sx)-L.y)/A.leg*.5,.5,.84):(L.src==='prop'&&tableIntact())||(L.src==='ware'&&L.ref.host)?.84:.5;
  const body=[{t:0,v:{...A.curBody,pz:z0}},{t:t1,v:()=>({...A.guardBody(),px:sx,pz:tz,crouch:.84,th:.2})},{t:Tc,v:()=>({...A.guardBody(),px:sx,pz:tz,crouch:low,lean:L.stuck?.3:.5,th:.9}),e:eOut},{t:Tend,v:()=>A.guardBody(),e:sstep}];
  const armK=[{t:0,v:{...A.curArm}},{t:Tc,v:{hand:{fn:grabPt},wAng:.8,off:{sh:[.2*arm,.3*arm]},tilt:.2},e:eOut},{t:Tend,v:()=>A.guardArm(),e:sstep}];
  return{att:{t0:S.t,end:Tend,body,arm:armK},Tend:Tend+.1,events:[{t:Tc,fn:()=>takeLoot(A,L)}],dash:Math.round(dist),strikeX:sx,Cfn:grabPt};
}
function takeLoot(A,L){
  if(L.src==='item'){if(!S.items.includes(L.ref))return;S.items=S.items.filter(i=>i!==L.ref);
    // a stuck blade comes out with a wrench: the body jerks after it
    const st=L.ref.stuck;if(st){const B=S.F[st.f],dir=Math.sign(A.station-L.x)||-A.facing;for(const q of B.p)q.px-=dir*70*DT;
      const P=B.p[PEL],C=B.p[CHE];if(S.gore!=='off')bleed({x:lerp(P.x,C.x,st.k),y:lerp(P.y,C.y,st.k)},dir,10,B.dep,.8);}}
  else if(L.src==='prop'){const T=S.table;if(!T||!T.props.includes(L.ref))return;T.props=T.props.filter(q=>q!==L.ref);}
  else if(L.src==='ware'){if(L.ref.gone)return;L.ref.gone=true;}
  else{if(L.ref.taken)return;L.ref.taken=true;}
  const side=!!(L.src==='item'&&L.ref.sidearm);
  // a weapon off the floor keeps what it is (whoever's it was); anything else lying about is just what it looks like
  A.setWeapon(L.kind);A.wdes=L.src==='item'?L.ref.wdes||null:null;if(!side&&A.ownWeapon===L.kind&&L.owner===A.idx)A.ownWeapon=null;
  // the sidearm goes back in its scabbard when the main weapon is back in hand
  if(side)A.sidearm='drawn';else if(A.sidearm==='drawn')A.sidearm='sheathed';
  popup(A,L.owner===A.idx?'Rearmed':cap(lootName(L)),'#ffd9a8',null,19,-26);S.hooks.sound('clang',.5);S.hooks.pickup(S.game.ex,{kind:L.kind,label:lootLabel(A,L),name:A.wp.short,full:A.wp.name});S.hooks.status();
}
// a bottle breaks on the first hit and leaves a jagged neck in the hand
function shatterBottle(A,D,C){
  const next=A.wp.shatter;sparks(C,16,'#bfe9e2',D.dep);sparks(C,8,'#ffffff',D.dep);S.hooks.sound('crack',1);
  popup(A,'Shattered','#bfe9e2',null,18,-26);A.setWeapon(next);
}

// ---------- slots: what each command key does right now ----------
const SLOTS=['slash','overhead','thrust','sweep','shove','guard','advance','sidestep','withdraw','wait','feint','team','cover'];
function slotAction(A,D,slot){
  if(A.dead)return null;
  if(slot==='team'||slot==='cover'){if(!partnerOf(A)||A.downed||A.clinch)return null;if(slot==='cover')return coverInfo(A)?'cover':null;return helpInfo(A)?'helpup':pincerInfo(A)?'pincer':null;}
  if(A.downed)return{guard:'getup',withdraw:'roll',wait:'wait'}[slot]||null;
  const c=A.clinch;
  if(c){const holder=c.a===A;
    return{slash:'elbow',overhead:'headbutt',thrust:'knee',sweep:'throw',shove:holder?'push':'breakfree',guard:shieldInfo(A)?'shield':null,advance:stabInfo(A)?'stab':null,wait:'wait'}[slot]||null;}
  if(slot==='advance'&&grabInfo(A,D))return'grab';
  if(slot==='wait'&&pickupInfo(A))return'pickup';
  if(slot==='guard'&&canDraw(A))return'draw';
  return slot;
}
// ===== BRAWL END =====
