// ===== ELVES =====
// An elf is faster than a man, and the speed is magic: the same runes that glow in Kael's tattoos. Here that is a rule and a look.
// Every move an elf makes plays out faster (his plan is pressed into less time and his body answers sooner), he acts a little more
// often, a step takes him further (and at a run: low, the blade trailing), and a man's blow is a little harder to land on him. At
// speed he leaves afterimages and motes of light behind him. When he dodges, the dodge fits what came at him: he leaps a low sweep,
// spins off a thrust, or goes up over the man who swung, a hand on his shoulder, and lands at his back.
// Kael alone has the offensive magic: Aether, a small store that comes back each turn and with each kill, spent on three spells
// (Gilt bolt, Gale, Glimmer step). The moments that come of all this (a vault over a man, a Gale that throws bodies into the
// furniture or two of them down at once, a kill out of a blink, a bolt from across the room, two kills in one move) get the camera's
// punch-in and a breath of slow motion. The page draws all of it (sk_elfui.js, with the painter ElvenFX).

// ---------- who is an elf ----------
// rate: how much faster an elf's moves play out (Kael is the fastest of them); tempo: what his actions cost against a man's;
// move: how much further a step takes him; agile: how much quicker his body answers its pose (sk_core.js); dash: run speed
const ELVEN={kael:1.4,foe:1.28,tempo:.86,move:1.38,agile:1.22,dash:430};
function elven(f){return!!f&&!f.beast&&!f.npc&&((f===S.F[0]&&f.name===HERO_NAME)||isElf(f));}
function drained(f){return(f.drain||0)>.5;}
function elfRate(f){return f&&elven(f)&&!drained(f)&&!f.dead?(f===S.F[0]?ELVEN.kael:ELVEN.foe):1;}
function elfTint(f){return f===S.F[0]?'#e2b65a':'#9fd8ff';}
// a big moment: the camera punches in harder than usual, the frame catches, time slows for a breath, and the moment gets its name
// (one close on the heels of another gets a lighter touch, so they never pile up into a slideshow)
function wow(x,dep,text,o){o=o||{};if(S.warming)return;const recent=S.wowAt!=null&&S.t>=S.wowAt&&S.t-S.wowAt<2.5;S.wowAt=S.t;
  S.punch={x:prjX(x,dep),t:0,z:recent?Math.min(.14,o.z??.2):o.z??.2};S.slowT=Math.max(S.slowT,recent?.15:o.slow??.5);S.freeze=Math.max(S.freeze,o.freeze??.04);
  if(text&&!(S.wowT!=null&&S.t-S.wowT<.4&&S.t>=S.wowT)){S.callouts.push({i:o.i??0,text,age:0,life:1.7,dx:0,dy:-52,big:true,wow:true});S.wowT=S.t;if(S.hooks.sound)S.hooks.sound('wow',1);}}

// ---------- faster ----------
// The plan an elf's command builds is pressed into less time: every keyframe of his move and of whoever is answering it, the
// exchange's events and its impact, and the spin, flourish, lash and breach timings the plan set. Nothing else changes, so the move
// is the same move, only quicker.
function compressEx(ex){if(!ex||!ex.A||ex._r)return;const r=elfRate(ex.A);if(r<=1.01)return;ex._r=1;ex.rate=r;const t0=ex.t0,same=t=>Math.abs(t-t0)<1e-6;
  const act=a=>{if(!a||a._r||!same(a.t0))return;a._r=r;for(const k of a.body||[])k.t/=r;for(const k of a.arm||[])k.t/=r;a.end/=r;};
  for(const f of S.F)act(f.action);
  const P=ex.plan;
  if(P&&!P._r){P._r=r;for(const k of ['Timp','Td','Tend'])if(typeof P[k]==='number')P[k]/=r;
    for(const e of P.events||[])e.t/=r;
    if(P.combo)for(const h of P.combo.hits)h.IL/=r;
    if(P.sec)for(const k of ['Timp','Td'])if(typeof P.sec[k]==='number')P.sec[k]/=r;
    act(P.att);act(P.react);if(P.sec)act(P.sec.react);}
  if(typeof ex.dur==='number')ex.dur/=r;
  const abs=t=>t0+(t-t0)/r;
  for(const f of S.F){
    if(f.spin&&!f.spin._r&&f.spin.t0>=t0-1e-6)f.spin={t0:abs(f.spin.t0),t1:abs(f.spin.t1),_r:r};
    const fl=f.flair;if(fl&&!fl._r&&fl.from!=null&&fl.from>=t0-1e-6){fl._r=r;fl.until=abs(fl.until);fl.from=abs(fl.from);}
    if(f.lash&&!f.lash._r&&same(f.lash.t0)){f.lash._r=r;for(const k of ['a','b','c','d'])if(typeof f.lash[k]==='number')f.lash[k]/=r;}}
  for(const w of S.divs)if(w.state==='breaching'&&w.breakFrom===ex.A&&w.breakBy>t0&&w._rT!==t0){w._rT=t0;w.breakBy=abs(w.breakBy);}}
// a thrown body flies at the thrower's pace too
{const sc=startCarry;startCarry=function(A,D,info,air){const ex=S.game&&S.game.ex,r=ex&&ex.rate&&ex.A===A?ex.rate:1;return sc(A,D,info,air/r);};}
// The quickness belongs to a fight. In a scene, a walk between rooms or the last scene in the office his body moves at the pace the
// scene sets, the way it always has (a scene's walk has its own beat, and a scene's poses were made for it).
function agileOn(f){if(elfRate(f)<=1||f.cutWalk||f.mount)return false;if(f.sceneAgile)return true;if(S.cut||(S.stage&&S.stage.tr))return false;const ph=S.game&&S.game.phase;return ph!=='cut'&&ph!=='finale'&&ph!=='transit';}
// his feet keep up with him
{const us=updateSteps;updateSteps=function(f,pelTX,bp){us(f,pelTX,bp);const ag=f.agile||1;if(ag>1&&agileOn(f))for(const s of f.steps)if(s.active&&s.t0===S.t&&!s._ag&&!s.walk){s._ag=1;s.dur/=ag;}};}
// what an elf spends to act, and how far a step takes him
{const ac=actionCost;actionCost=function(f,cmd,extra){const c=ac(f,cmd,extra);return elfRate(f)>1?Math.round(c*ELVEN.tempo):c;};}
{const ai=advanceInfo;advanceInfo=function(A,D){const r=ai(A,D);if(!r||!D||elfRate(A)<=1||r.vault||r.around)return r;
  const fa=Math.sign(D.station-A.station)||A.facing,lim=D.station-fa*95;let x=A.station+(r.x-A.station)*ELVEN.move;if((x-lim)*fa>0)x=lim;x=clampSt(A,x,r.z);
  if((x-A.station)*fa>(r.x-A.station)*fa&&!divOnSeg(A.station,A.lane,x,r.z))r.x=x;return r;};}
{const wi=withdrawInfo;withdrawInfo=function(A,D){const r=wi(A,D);if(!r||elfRate(A)<=1)return r;
  const x=clampSt(A,A.station+(r.x-A.station)*ELVEN.move);if(Math.abs(x-A.station)>Math.abs(r.x-A.station)&&!divOnSeg(A.station,A.lane,x,A.lane))r.x=x;return r;};}
// harder to hit: an elf sees a man's blow coming (not another elf's), and the man holding a gun
{const cm=computeMods;computeMods=function(A,D,kind,opening,T){const c=cm(A,D,kind,opening,T);
  if(D&&elfRate(D)>1&&!D.downed&&A&&!elven(A)){c.def+=1;c.defMods.push(['elven reflexes',1]);}
  if(A&&A.blinkBonus){c.mods.push(['out of nowhere',A.blinkBonus]);c.bonus+=A.blinkBonus;}
  // a bolt of light thrown from across the room: his line and the reach of his weapon have nothing to do with it
  if(T&&T.magic)for(const m of c.mods)if(m[0]==='off line'||m[0]==='angle'||m[0]==='jammed'||m[0]==='inside the reach'){c.bonus-=m[1];m[1]=0;}
  return c;};}
{const sm=shotMods;shotMods=function(A,D,kind,i){const c=sm(A,D,kind,i);if(D&&elfRate(D)>1&&!D.downed){c.def+=2;c.defMods.push(['elven reflexes',2]);}return c;};}
// the elf's run: low, the blade trailing, gone almost before the eye has him
function elfDash(A,x0,z0,ex){if(elfRate(A)<=1||A.downed||A.clinch||A.mount)return;const x1=A.station,z1=A.lane,dist=Math.hypot(x1-x0,(z1-z0)*.8);if(dist<30)return;
  const fwd=(x1-x0)*A.facing>0,T=clamp(dist/ELVEN.dash,.16,.42),Tm=T*.5;
  const body=bodyKeys(A,[[0,'now'],[Tm,fwd?'elfDash':'elfDashBack',{px:lerp(x0,x1,.62),pz:lerp(z0,z1,.62)},eOut],[T,'elfDashLand',sstep],[T+.25,'guard']]);
  const run=armPose(A,poseA(A,fwd?'elfDash':'elfDashBack'));
  const armK=armKeys(A,[[0,'now'],[Tm*.8,run,eOut],[T,run],[T+.25,'guard',sstep]]);
  A.action={t0:ex.t0,end:T+.25,body,arm:armK,quiet:true};A.blur=S.t+T/elfRate(A)+.04;
  if(!S.warming)dust(A.p[FTB].x,A.gr(A.p[FTB].x),.6,A.dep);}

// ---------- graceful dodges ----------
// When a blow at an elf is going to miss, how he gets out of its way is chosen from what is coming and where: a low sweep he leaps;
// a cut, an overhead or a thrust from close in he may go over, a hand on the man's shoulder, and land at his back (if there is room
// there and the man is not much taller than he is); a thrust he may spin off; anything else he slips at speed.
function heightOf(f){const b=f.body;return f.leg+b.torso+b.neck+b.headR*2;}
function vaultSpot(A,D,sx){const dir=Math.sign(sx-D.station)||D.facing,land=sx+dir*Math.max(58,engageGap(A,D)*.58);
  if(heightOf(A)>heightOf(D)*1.22||A.downed||A.clinch||A.mount||D.mount)return null;
  if(Math.abs(clampStage(land)-land)>1||Math.abs(land-D.station)>300)return null;
  if(S.divs.length&&divOnSeg(D.station,D.lane,land,D.lane))return null;
  if(tableIntact()&&inTableLane(D.lane,6)){const b=tableBox(),lo=Math.min(D.station,land),hi=Math.max(D.station,land);if(b.r>lo-10&&b.l<hi+10)return null;}
  if(Math.abs(clampSt(D,land,D.lane)-land)>2)return null;
  for(const o of S.F){if(o===A||o===D||o.dead||o.npc)continue;if(Math.abs(o.lane-D.lane)<24&&Math.abs(o.station-land)<40)return null;}
  return{land,dir};}
function evadeStyle(ex){const A=ex.A,D=ex.D,P=ex.plan,res=ex.res,T=(res&&res.tech)||{},kind=res&&res.kind;
  if(!P||P.Timp==null||P.strikeX==null||D.downed||D.clinch||D.dead||D.mount||P.sec)return null;
  const u=((res.seed>>>3)%1000)/1000;
  if(kind==='sweep'||T.low)return{style:'leap'};
  if((kind==='slash'||kind==='overhead'||kind==='thrust')&&!T.lash&&Math.abs(P.strikeX-D.station)<170&&u<(D===S.F[0]?.55:.4)){const v=vaultSpot(A,D,P.strikeX);if(v)return{style:'vault',...v};}
  if(kind==='thrust'&&u<.8)return{style:'spin'};
  return{style:'blur'};}
function elfEvade(ex){const A=ex.A,D=ex.D,P=ex.plan,res=ex.res;
  if(!D||!A||!res||res.out!=='dodge'||elfRate(D)<=1||!P)return;
  const st=evadeStyle(ex);if(!st)return;
  const Ti=P.Timp,leg=D.leg,b0={...(D.curBody||D.guardBody())},a0={...(D.curArm||D.guardArm())},ev=[];let body,armK,end,slip=null;
  D.blur=S.t+Ti+.45;if(D===S.F[0])D.flare=Math.max(D.flare||0,.9);
  // an opening that comes of the miss waits until he is back on his feet
  const holdOpen=Tl=>ev.push({t:Ti+.01,fn:()=>{const e=S.game.ex;if(e&&e.openAt!=null&&e.openFor===D)e.openAt=Math.max(e.openAt,S.t+(Tl-Ti-.01)/(e.rate||1)+.02);}});
  if(st.style==='leap'){
    // down onto the legs, up with the knees tucked as the blow goes under, and down again
    const T0=Math.max(.03,Ti-.17),Tu=Math.max(T0+.05,Ti-.03),Tl=Ti+.17,Te=Tl+.32,L=leg*.4;
    body=bodyKeys(D,[[0,b0],[T0,'leapGather',eOut],[Tu,'leapTuck',{lift:L},eOut],[Ti+.06,'leapHang',{lift:L*.85}],[Tl,'leapLand',eIn],[Te,'guard',sstep]]);
    armK=armKeys(D,[[0,a0],[Tu,'leap',eOut],[Te,'guard',sstep]]);end=Te;
    ev.push({t:Ti,fn:()=>{popup(D,'Leaps it','#ffe299',null,20,-34);S.hooks.sound('vault',.6);}},{t:Tl,fn:()=>dust(D.p[FTF].x,D.gr(D.p[FTF].x),.8,D.dep)});holdOpen(Tl);}
  else if(st.style==='vault'){
    // a step in, a hand on his shoulder, up over the top with the knees tucked, turning in the air, and down at his back
    const {land,dir}=st,sx=P.strikeX,T0=Math.max(.03,Ti-.36),Tp=Math.max(T0+.08,Ti-.16),Tm=Ti+.05,Tl=Ti+.32,Te=Tl+.36;
    const L=Math.max(46,heightOf(A)+10-leg*.86+leg*.45);
    const shoulder=()=>{const c=A.p[CHE];return{x:c.x,y:c.y-5};};
    body=bodyKeys(D,[[0,b0],[T0,'overSet',eOut],[Tp,'overSpring',{px:lerp(D.station,sx,.55),pz:D.lane,lift:L*.5},eOut],[Tm,'overTop',{px:sx,pz:D.lane,lift:L},sstep],
      [Tl,'overLand',{px:land,pz:D.lane},eIn],[Te,'guard',{px:land},sstep]]);
    const plant=armPose(D,poseA(D,'overPlant'),{off:D.wp.off?'grip':{fn:shoulder}});
    armK=armKeys(D,[[0,a0],[Tp,plant,eOut],[Tm,plant,{tilt:-.2}],[Tl,'guard',sstep],[Te,'guard']]);end=Te;
    ev.push({t:Tp,fn:()=>S.hooks.sound('vault',1)},
      {t:Tm,fn:()=>{if(D.dead||D.downed)return;D.facing=-dir;D.station=land;resyncSides();wow(A.p[CHE].x,A.dep,'Vaulted over',{i:A.idx,z:.18,slow:.45});}},
      {t:Tl,fn:()=>{if(D.dead)return;D.station=clampSt(D,land);D.facing=Math.sign(A.station-D.station)||-dir;resyncSides();resolveStations();dust(D.p[FTF].x,D.gr(D.p[FTF].x),1,D.dep);S.hooks.sound('thud',160);}});
    holdOpen(Tl);ex.perf.slip=null;}
  else if(st.style==='spin'){
    // a full turn off the line of the point, out to one side of it
    const c=[D.lane+40,D.lane-40].filter(z=>laneOK(D,z)),to=c.length?c[(res.seed>>>5)%c.length]:D.lane,T0=Math.max(.03,Ti-.15),Te=Ti+.5;
    body=bodyKeys(D,[[0,b0],[T0,'spinSet',{pz:()=>D.lane},eOut],[Ti+.03,'spinOff',{pz:to},eOut],[Te,'guard',{pz:to},sstep]]);
    armK=armKeys(D,[[0,a0],[Ti,'spinOff',eOut],[Te,'guard',sstep]]);end=Te;
    D.spin={t0:S.t+T0,t1:S.t+Ti+.16};slip=to!==D.lane?to:null;D.laneT=S.t;
    ev.push({t:Ti,fn:()=>{popup(D,'Spins away','#ffe299',null,20,-34);S.hooks.sound('vault',.5);}},{t:Ti+.3,fn:()=>{D.lane=to;}});
    ex.perf.slip=slip;}
  else return;   // a blur keeps the ordinary slip, with the afterimages (D.blur) over it
  // (the leads of a combo are parried first: sk_anim.js)
  let act={t0:S.t,end,body,arm:armK,quiet:true};if(P.combo)act=comboReact(D,A,P.combo,act,true);D.action=act;
  if(P.react){const rev=new Set(P.react.evs||[]);P.events=P.events.filter(e=>!rev.has(e));}
  P.react=act;P.events.push(...ev);P.slip=slip;ex.evade={style:st.style,D};}
{const rt=recordTrail;recordTrail=function(f){rt(f);const tr=S.trails[f.idx];if(tr&&tr.length&&f.action&&f.action.quiet&&tr[tr.length-1].t===S.t)tr.pop();};}
// the evasion says what it was; the plain "Miss" over it would only repeat it
{const ap=applyImpact;applyImpact=function(ex,A,D,res,Cfn,cv,slip,fa,primary){const n=S.popups.length;ap(ex,A,D,res,Cfn,cv,slip,fa,primary);
  if(ex&&ex.evade&&ex.evade.D===D&&primary&&res.out==='dodge')for(let i=S.popups.length-1;i>=n;i--){const p=S.popups[i];if(p.text==='Miss'||p.text==='Slipped')S.popups.splice(i,1);}};}

// ---------- afterimages and motes ----------
// An elf moving at speed leaves an afterimage of himself every few hundredths of a second (gold for Kael, pale for the others), and
// motes of light come off his runes; a dodge, a dash or a blink leaves them however fast he is going. Kael's tattoos shed a few
// motes while he has Aether in him.
S.afterimages=[];S.motes=[];S.bolts=[];S.gales=[];S.blinks=[];S.glyphs=[];S.streaks=[];
function addMotes(x,y,d,n,o){o=o||{};for(let i=0;i<n;i++)S.motes.push({x:x+(Math.random()-.5)*(o.sx||8),y:y+(Math.random()-.5)*(o.sy||8),d:d+(Math.random()-.5)*6,vx:(o.vx||0)+(Math.random()-.5)*(o.spread||40),
  vy:(o.vy??-30)+(Math.random()-.5)*(o.spread||40),g:o.g??-12,r:.7+Math.random()*(o.r||1.3),age:0,life:(o.life||.5)+Math.random()*.4,tint:Math.random()<(o.cyan??.25)?'#7ff3e3':'#ffe299',spin:Math.random()*TAU});
  if(S.motes.length>260)S.motes.splice(0,S.motes.length-260);}
function elfFxStep(){const t=S.t;
  for(const g of S.afterimages)g.age+=DT;if(S.afterimages.length)S.afterimages=S.afterimages.filter(g=>g.age<g.life);
  for(const m of S.motes){m.age+=DT;m.x+=m.vx*DT;m.y+=m.vy*DT;m.vy+=m.g*DT;m.vx*=.985;}if(S.motes.length)S.motes=S.motes.filter(m=>m.age<m.life);
  if(S.glyphs.length)S.glyphs=S.glyphs.filter(g=>t-g.t0<g.dur);
  if(S.gales.length)S.gales=S.gales.filter(g=>t-g.t0<g.life);
  if(S.blinks.length)S.blinks=S.blinks.filter(b=>t-b.t0<b.dur);
  if(S.streaks.length)S.streaks=S.streaks.filter(s=>t-s.t0<s.life);
  for(const f of S.F){f.agile=agileOn(f)?ELVEN.agile:1;if(f.flare>0)f.flare=Math.max(0,f.flare-DT*1.3);
    if(elfRate(f)<=1||f.gone||f.hidden||f.dead||f.clipRect)continue;
    const P=f.p[PEL],C=f.p[CHE],v=Math.hypot(P.x-P.px,P.y-P.py)/DT+Math.abs(f.vdep||0)*.5,blur=!!f.blur&&t<f.blur;
    const moved=Math.hypot(P.x-(f.ghostX??-1e4),P.y-(f.ghostY??-1e4))+Math.abs(f.dep-(f.ghostD??f.dep))*.5;
    if((v>230||blur)&&t>=(f.ghostT||0)&&moved>9){f.ghostT=t+(blur?.034:.05);f.ghostX=P.x;f.ghostY=P.y;f.ghostD=f.dep;
      S.afterimages.push({pts:f.p.slice(0,12).map(q=>[q.x,q.y]),fa:f.facing,body:f.body,tint:elfTint(f),kael:f===S.F[0],d:f.dep,age:0,life:blur?.3:.22,
        sx:typeof spinSx==='function'?spinSx(f):1,px:(P.x+C.x)/2});
      if(S.afterimages.length>30)S.afterimages.shift();}
    if((v>170||blur)&&Math.random()<(blur?.5:.25)){const k=Math.random(),q=k<.45?f.p[ELF]:k<.8?f.p[ELB]:C;
      addMotes(q.x,q.y,f.dep,1,{vx:-(P.x-P.px)/DT*.12,vy:-25,spread:30,cyan:f===S.F[0]?.3:.6});}
    else if(f===S.F[0]&&(f.aether||0)>0&&Math.random()<.005*f.aether){const q=Math.random()<.5?f.p[ELF]:f.p[ELB];addMotes(q.x,q.y,f.dep,1,{vy:-18,spread:14,life:.7,r:.9});}}}
V11.step.push(elfFxStep);
V11.duelStart.push(()=>{S.afterimages=[];S.motes=[];S.bolts=[];S.gales=[];S.blinks=[];S.glyphs=[];S.streaks=[];S.wowT=null;S.wowAt=null;
  for(const f of S.F){f.blur=0;f.flare=0;f.ghostT=0;f.ghostX=f.ghostY=f.ghostD=undefined;f.blinkBonus=0;f.agile=1;f.sceneAgile=false;}});

// ---------- Aether: Kael's magic ----------
// A store of five. He starts a fight with three, and each of his turns and each kill of his gives one back. The roof's charged round
// takes it all out of him (f.drain), and nothing is cast with a gun in his hands. From the saddle he casts with the hand off the bars,
// and a Glimmer step takes the bike with him.
const MAGIC={max:5,start:3,turn:1,kill:1};
const SPELLS={bolt:{name:'Gilt bolt',cost:2,tempo:80,foot:0,key:'q'},gale:{name:'Gale',cost:3,tempo:95,foot:1,key:'w'},blink:{name:'Glimmer step',cost:2,tempo:80,foot:1,key:'e'}};
for(const [k,s] of Object.entries(SPELLS)){ACTIONS[k]={name:s.name,cost:s.tempo};FOOT_COST[k]=k==='blink'?0:s.foot;}
ACTIONS.magic={name:'Magic',cost:0};
function mage(f){return!!f&&f===S.F[0]&&f.name===HERO_NAME&&!drained(f)&&!S.noMagic;}
function aetherGain(f,n){if(!mage(f)||f.dead)return;const a=f.aether||0;f.aether=Math.min(MAGIC.max,a+n);if(f.aether>a){f.aetherT=S.t;if(!S.warming){const c=f.p[CHE];addMotes(c.x,c.y,f.dep,6,{spread:50,vy:-40});}}}
V11.duelStart.push(()=>{const K=S.F[0];if(K)K.aether=mage(K)?MAGIC.start:0;});
V11.turnStart.push(i=>{const f=S.F[i];if(f&&f===S.F[0])aetherGain(f,MAGIC.turn);});
V11.kill.push(D=>{const ex=S.game&&S.game.ex;if(!ex||ex.A!==S.F[0]||D.team===0)return;aetherGain(ex.A,MAGIC.kill);
  // two (or three) down in one move
  ex.kills=(ex.kills||0)+1;if(ex.kills>=2&&!S.warming){const c=D.p[CHE];wow(c.x,D.dep,ex.kills>=3?'Triple':'Double',{z:.16,slow:.4});}});
function spellOK(A,D,k){const s=SPELLS[k];if(!s||!mage(A)||A.dead||A.downed||A.clinch||(A.wp&&A.wp.gun)||(A.aether||0)<s.cost||A.foot<s.foot)return false;
  // on a bike only in the fight itself (seated, the bike his to steer)
  if(A.mount&&(A.mountU<1||A.mount.ctl!=='rider'))return false;
  if(k==='gale')return galeTargets(A,D).length>0;
  if(!D||D.dead||D.team===A.team||D.walkIn||D.offstage||notHereYet(D)||D.carry)return false;
  if(k==='blink')return!!blinkInfo(A,D);
  return true;}
{const cv=cmdValid;cmdValid=function(A,D,cmd){if(SPELLS[cmd])return spellOK(A,D,cmd);return cv(A,D,cmd);};}
// a spell is a command of its own
{const cm=command;command=function(i,cmd,opts){if(!SPELLS[cmd])return cm(i,cmd,opts);
  opts=opts||{};const g=S.game;if(g.phase!=='input'||g.active!==i||S.opening)return false;
  const A=S.F[i],D=targetOf(A);if(!cmdValid(A,D,cmd))return false;
  g.phase='exchange';g.aiAt=null;if(!opts.prepaid)A.ready+=actionCost(A,cmd,0);
  const ex={A,D,t0:S.t,cmd,perf:{},depth:0,dazedAtStart:A.daze>0};g.ex=ex;A.covering=null;A.counter=false;A.lastAct=cmd;
  A.setSpear=false;A.wallPin=false;A.holdFace=null;A.feint=null;A.feintRead=null;A.guarding=false;A.circleGuard=false;
  if(D)faceToward(A,D.station);
  castSpell(A,D,cmd,ex);S.hooks.status();return true;};}
function castSpell(A,D,k,ex){const s=SPELLS[k];A.aether=Math.max(0,(A.aether||0)-s.cost);A.flare=1.4;A.castT=S.t;beginAction(A,k,k==='blink'?null:ex.chain||null);
  if(k==='bolt')launchBolt(A,D,ex);else if(k==='gale')launchGale(A,D,ex);else launchBlink(A,D,ex);}
// a rune circle opens at the hand that casts (drawn by the page)
function glyphAt(f,hand,dur){if(S.warming)return;S.glyphs.push({f,hand,t0:S.t,dur:dur||.35,d:f.dep});}
// from the saddle the hand that casts comes off the bars for the spell, and goes back to them after it
if(typeof mountControl==='function'){const mc=mountControl;mountControl=function(f){const a=f.action;if(!a||!a.spell||f.offBar===false)return mc(f);
  const ob=f.offBar;f.offBar=false;try{return mc(f);}finally{f.offBar=ob;}};}

// ---------- Gilt bolt ----------
// A blade of light flicked off the left hand. It flies straight at him (and follows him if he moves) and lands like a thrust that
// throws the body: blocked, it breaks on the weapon and spins away; dodged, it goes on past and burns out. It cuts a goblin in half.
// No opening comes of it either way: it is thrown from too far off.
const BOLT={speed:900,life:1.4};
function boltFin(A,D){return D.beast==='goblin'&&S.gore!=='off'?{type:'bisect',name:'Cut in half',knock:.6,cut:.5}:{type:'cutdown',name:'Bolt through',...FIN.cutdown,knock:1.5};}
function boltTech(A,D){
  return{kind:'thrust',key:'bolt',name:'Gilt bolt',why:'A blade of light thrown off the hand: it flies straight and true from any distance, and a body it hits is thrown.',tags:['Magic','Any range'],
    acc:1,dmg:1,along:null,ang:null,amp:1,overlap:0,reach:null,anchor:'chest',kick:false,vault:false,around:null,rising:false,descend:false,windCap:null,passing:false,flair:null,multi:null,
    knock:1.7,kdEase:0,magic:true,dice:[2,6,6],zone:'body',fin:boltFin(A,D)};}
function launchBolt(A,D,ex){const T=boltTech(A,D),rd=D.reads&&D.reads[A.idx]?{...D.reads[A.idx]}:null;
  const res=resolveAttack(A,D,'thrust',false,T);res.kind='magic';
  // a bolt is no thrust he can learn to read
  if(D.reads){if(rd)D.reads[A.idx]=rd;else delete D.reads[A.idx];}
  // the killing blow only: a bolt that leaves him standing is no finisher
  if(!((res.out==='hit'||res.out==='crit')&&D.hp-res.dmg<=0))res.tech={...res.tech,fin:null};
  const r=elfRate(A),fa=Math.sign(D.station-A.station)||A.facing,arm=A.arm,Tc=.22,dist=Math.hypot(D.station-A.station,(D.lane-A.lane)*.6),fl=dist/BOLT.speed,Tend=Tc+.5;A.facing=fa;
  // the cast plays at his pace, the bolt flies at its own: the answer is timed to the bolt (compressEx divides it again)
  const Ti=Tc+fl*r;
  // the left hand drawn back and flicked out
  const flick=armPose(A,poseA(A,'boltFlick'));
  const body=bodyKeys(A,[[0,'now'],[Tc*.6,'boltCock'],[Tc,'boltFlick',eOut],[Tend,'guard',sstep]]);
  const armK=armKeys(A,[[0,'now'],[Tc*.6,'boltCock',eOut],[Tc,flick,eOut],[Tc+.2,flick],[Tend,'guard',sstep]]);
  const chest=()=>{const P=D.p[PEL],C=D.p[CHE];return{x:lerp(P.x,C.x,.66),y:lerp(P.y,C.y,.66)};};
  const rnd=mulberry32(res.seed),react=res.out==='hit'||res.out==='crit'?null:planReaction(D,A,'thrust',res,Ti,chest,0,rnd,false,fa);
  const events=[{t:Tc-.08,fn:()=>glyphAt(A,HAB,.34)},{t:Tc,fn:()=>spawnBolt(A,D,res,ex)}];
  if(react){D.action=react;events.push(...(react.evs||[]));}
  A.action={t0:S.t,end:Tend,body,arm:armK,spell:true};
  // what touches him is the bolt itself, wherever it is
  const bolt=()=>S.bolts.find(b=>b.ex===ex),seg=()=>{const B=bolt();if(!B)return[A.p[HAB],A.p[HAB]];const L=Math.hypot(B.vx,B.vy)||1;return[{x:B.x-B.vx/L*12,y:B.y-B.vy/L*12},{x:B.x,y:B.y}];};
  ex.res=res;ex.plan={att:A.action,react,events,Tend:Math.max(Tend,Ti)+.1,strikeX:A.station,dir:fa,Cfn:chest,contactSeg:seg,contactVel:()=>{const B=bolt();return B?{x:B.vx,y:B.vy}:{x:fa*BOLT.speed,y:0};},bolt:true};
  ex.dur=Math.max(Tend,Ti)+.5;ex.perf={dash:0};
  S.hooks.log({type:'attack',A,D,res,ex});}
function boltAim(B){const D=B.D,P=D.p[PEL],C=D.p[CHE];
  if(B.out==='block'){const h=D.p[HAF],t=D.p[TIP];return{x:lerp(h.x,t.x,.4),y:lerp(h.y,t.y,.4)};}
  return{x:lerp(P.x,C.x,.66),y:lerp(P.y,C.y,.66)};}
function spawnBolt(A,D,res,ex){if(A.dead)return;const h=A.p[HAB],T=boltAim({D,out:res.out}),dx=T.x-h.x,dy=T.y-h.y,L=Math.hypot(dx,dy)||1;
  // a miss is thrown a little high or wide of him from the start, and goes on past
  let vx=dx/L,vy=dy/L;if(res.out==='dodge'||res.out==='fumble'){const a=(res.seed&1?-1:1)*(res.out==='fumble'?.3:.15);const c=Math.cos(a),s=Math.sin(a);[vx,vy]=[vx*c-vy*s,vx*s+vy*c];}
  S.bolts.push({A,D,res,ex,out:res.out,x:h.x,y:h.y,vx:vx*BOLT.speed,vy:vy*BOLT.speed,dep:A.dep,dep0:A.dep,dep1:D.dep,dist:L,t0:S.t,trail:[],spin:0,state:'fly',sign:Math.sign(dx)||A.facing});
  S.hooks.sound('bolt',1);}
function boltStep(){const B0=S.bolts;if(!B0.length)return;
  for(const B of B0){const age=S.t-B.t0;
    if(B.state==='fly'){
      const homing=B.out==='hit'||B.out==='crit'||B.out==='block';
      if(homing&&!B.D.dead){const T=boltAim(B),dx=T.x-B.x,dy=T.y-B.y,L=Math.hypot(dx,dy)||1;B.vx=dx/L*BOLT.speed;B.vy=dy/L*BOLT.speed;
        if(L<14){B.state='done';B.hitT=S.t;boltImpact(B);continue;}}
      else if(!B.passed&&(B.x-B.D.p[PEL].x)*B.sign>8){B.passed=true;boltMiss(B);}
      B.x+=B.vx*DT;B.y+=B.vy*DT;B.dep=lerp(B.dep0,B.dep1,clamp(age*BOLT.speed/Math.max(1,B.dist),0,1));B.spin+=DT*26;
      B.trail.push({x:prjX(B.x,B.dep),y:prjY(B.y,B.dep)});if(B.trail.length>16)B.trail.shift();
      if(Math.random()<.5)addMotes(B.x,B.y,B.dep,1,{spread:20,vy:-10,life:.3,r:.8});
      if(age>BOLT.life||B.x<-80||B.x>W+80||B.y>S.arena.ground(B.x,B.dep)){B.state='gone';B.goneT=S.t;if(!B.passed){B.passed=true;boltMiss(B);}}}
    else if(B.state==='glance'){B.x+=B.vx*DT;B.y+=B.vy*DT;B.vy+=600*DT;B.spin+=DT*30;B.trail.push({x:prjX(B.x,B.dep),y:prjY(B.y,B.dep)});if(B.trail.length>12)B.trail.shift();if(S.t-B.hitT>.35){B.state='gone';B.goneT=S.t;}}
    else if(B.state==='done'&&S.t-B.hitT>.02){B.state='gone';B.goneT=S.t;}}
  S.bolts=B0.filter(B=>B.state!=='gone'||S.t-B.goneT<.45);}
function boltImpact(B){const {A,D,res,ex}=B,fa=Math.sign(B.vx)||A.facing,C={x:B.x,y:B.y};B.burst={x:C.x,y:C.y,d:D.dep,ang:Math.atan2(B.vy,B.vx),t0:S.t,kind:res.out==='block'?'block':'hit'};
  if(D.dead)return;
  if(res.out==='block'){
    // it breaks on the weapon and spins away, burning out
    sparks(C,12,'#fff3cf',D.dep);flash(C,24,'#ffe299',D.dep);for(const i of [TIP,HAF]){const q=D.p[i];q.px-=fa*130*DT;q.py+=40*DT;}
    D.station=clampSt(D,D.station+fa*6);popup(D,'Deflected','#a5dcff',null,21);S.hooks.sound('clang',1);
    B.state='glance';B.vx=-B.vx*.25;B.vy=-Math.abs(B.vy)*.4-260;D.guarding=false;
    if(ex===S.game.ex){ex.perf.speed=BOLT.speed;S.hooks.perf(ex);}return;}
  // a hit lands the ordinary way (damage, knockback along its flight, wounds, the kill and what follows it), from his own exchange
  if(ex!==S.game.ex){D.hp=Math.max(0,D.hp-res.dmg);popup(D,String(res.dmg),'#ffffff',null,26);if(D.hp<=0)kill(D,fa);return;}
  applyImpact(ex,A,D,res,()=>C,()=>({x:B.vx,y:B.vy}),null,fa,true);
  addMotes(C.x,C.y,D.dep,10,{spread:120,vy:-40,life:.4});
  if(D.dead&&Math.abs(D.station-A.station)>240)wow(C.x,D.dep,'Long bolt',{z:.16,slow:.45});}
function boltMiss(B){const {D,ex}=B;B.burst={x:B.x,y:B.y,d:B.dep,ang:Math.atan2(B.vy,B.vx),t0:S.t,kind:'miss'};
  if(!D.dead&&ex===S.game.ex){popup(D,B.out==='fumble'?'Wide':'Miss','#c9d0f5',null,21);if(ex.li){ex.perf.speed=BOLT.speed;S.hooks.perf(ex);}}}
V11.step.push(boltStep);

// ---------- Gale ----------
// A palm thrown out and a wall of wind with it: everyone in front of him out to 175 units and within 46 of his line is thrown back (a
// roll each: his skill and the wind against their footing, guard and weight) into whatever is behind them, a table, a wall, a divider,
// each other. Anyone it catches squarely, anyone off balance and anyone it throws into something goes down. Those who hold their
// ground slide and lose footing. The wave reaches each of them in turn.
const GALE={range:175,dz:46,life:.5};
function galeDir(A,D){return D&&!D.dead?(Math.sign(D.station-A.station)||A.facing):A.facing;}
function galeTargets(A,D){const fa=galeDir(A,D),ax=(A.p[PEL].x+A.p[CHE].x)/2,out=[];
  for(const o of S.F){if(o===A||o.team===A.team||o.dead||o.npc||o.walkIn||o.offstage||o.carry||o.gone||notHereYet(o))continue;
    const dx=(o.station-ax)*fa,dz=Math.abs(o.lane-A.lane);if(dx>-6&&dx<=GALE.range&&dz<=GALE.dz)out.push(o);}
  return out.sort((a,b)=>Math.abs(a.station-ax)-Math.abs(b.station-ax));}
function galeMods(A,D){const mods=[['skill',A.skill],['the wind',4],[footLabel(A),post(A).atk]];
  const defMods=[[post(D).name.toLowerCase(),post(D).resist],['guard',D.guarding?2:0],['weight',Math.round((D.body.bulk-1)*4)],['dazed',D.daze?-2:0],['on the ground',D.downed?-4:0]];
  return{mods,bonus:sumMods(mods),dc:9+D.skill+sumMods(defMods),defMods};}
function galeRoll(A,D){return rollVs(galeMods(A,D),{kind:'gale'});}
// when the front of the wave (the painter's: range × eOut(u)) reaches d
function galeHitTime(d){return(1-Math.cbrt(Math.max(0,1-clamp(d/GALE.range,0,.999))))*GALE.life;}
function launchGale(A,D,ex){const fa=galeDir(A,D),arm=A.arm,Tc=.26,Tend=Tc+.6,r=elfRate(A),palmX=A.station+fa*arm*.9;A.facing=fa;
  const tg=galeTargets(A,D),rolls=tg.map(o=>({o,r:galeRoll(A,o),d:Math.max(0,(o.station-fa*o.body.torsoW*.5-palmX)*fa)}));
  // the wind gathered at the hip, then the palm thrown out on a long step
  const palm=armPose(A,poseA(A,'galePalm'));
  const body=bodyKeys(A,[[0,'now'],[Tc*.65,'galeGather'],[Tc,'galeThrow',eOut],[Tc+.3,'galeHold'],[Tend,'guard',sstep]]);
  const armK=armKeys(A,[[0,'now'],[Tc*.65,'galeGather',eOut],[Tc,palm,eOut],[Tc+.32,palm],[Tend,'guard',sstep]]);
  const events=[{t:Tc-.09,fn:()=>glyphAt(A,HAB,.42)},{t:Tc,fn:()=>{const h=A.p[HAB];S.gales.push({x:h.x,y:h.y,ground:A.gr(h.x),fa,range:GALE.range,dz:GALE.dz,t0:S.t,life:GALE.life,d:A.dep});
    S.hooks.sound('gale',1);S.shake=Math.max(S.shake,5);dust(A.p[FTF].x,A.gr(A.p[FTF].x),1,A.dep);}}];
  // the wave travels at its own pace whatever his: the hits are timed so (compressEx divides them again)
  let last=Tc;ex.galeOut={n:0,down:0,hazard:0,domino:0};
  for(const R of rolls){const t=Tc+galeHitTime(R.d)*r;last=Math.max(last,t);events.push({t,fn:()=>galeHit(A,R.o,R.r,fa,ex)});}
  A.action={t0:S.t,end:Tend,body,arm:armK,spell:true};
  ex.res={kind:'magic',tech:{name:'Gale',why:'A palm thrown out and a wall of wind with it: everyone in front is thrown back into whatever is behind them, and anyone off balance or caught squarely goes down.'},out:tg.length?'hit':'dodge'};
  ex.plan={att:A.action,events,Tend:Math.max(Tend,last)+.2,strikeX:A.station,dir:fa,Cfn:()=>({x:A.station+fa*80,y:A.gr(A.station)-60}),gale:true};ex.dur=Math.max(Tend,last)+.7;ex.perf={dash:0};ex.rolls=rolls;
  S.hooks.log({type:'spell',spell:'gale',A,D,ex,rolls});}
function galeHit(A,D,sr,fa,ex){if(D.dead||D.carry)return;const out=ex.galeOut;let label,info=null,dmg=0;
  const li=ex.li,sh=S.hooks.shove;ex.li=null;S.hooks.shove=(e,i)=>{info=i;};   // the shove's own words are not this spell's
  try{
    if(D.downed){for(const q of D.p)q.px-=fa*160*DT;D.station=clampSt(D,D.p[PEL].x+fa*30);dmg=2;D.hp=Math.max(0,D.hp-dmg);label='Swept along';if(D.hp<=0)kill(D,fa);}
    else if(!sr.ok){for(let i=0;i<D.p.length;i++){if(i===TIP)continue;const q=D.p[i];q.px-=fa*(i===FTF||i===FTB?40:120)*DT;}D.station=clampSt(D,D.station+fa*16);knockBalance(D,2,A);D.motor=Math.min(D.motor,.6);
      popup(D,'Braces','#a5dcff','against the wind',19);label='Braces';}
    else{const D2=dominoPartner(A,D);dmg=2+Math.floor(S.rng()*4)+(sr.crush?3:0);D.hp=Math.max(0,D.hp-dmg);
      const np=S.popups.length;doShove(A,D,{...sr,shoulder:false,push:false});S.popups.length=Math.min(S.popups.length,np);
      const hit=!!(info&&(info.tableDmg||info.wallDmg||info.divDmg||info.propDmg));
      // the wind goes on where a shove would stop: further, harder, off the floor
      if(!D.dead){const m=1/Math.sqrt(D.body.mass);for(let i=0;i<D.p.length;i++){if(i===TIP)continue;const q=D.p[i],low=i===FTF||i===FTB||i===KNF||i===KNB;q.px-=fa*(low?150:260)*m*DT;q.py+=(i===HEAD||i===CHE?110:40)*DT;}
        if(!hit&&!D.downed)D.station=clampSt(D,D.station+fa*(sr.crush?56:36));
        if(!D.downed&&(sr.crush||D.posture==='off'||hit))knockDown(D);}
      if(D2&&!D2.dead&&!D2.downed){dominoHit(A,D,D2,sr);out.domino++;}
      if(D.hp<=0&&!D.dead)kill(D,fa);
      out.n++;if(D.downed||D.dead)out.down++;if(hit)out.hazard++;dust(D.p[FTF].x,D.gr(D.p[FTF].x),1.3,D.dep);
      label=D.dead?'Blown away':hit?(info.label||'Into the furniture'):D.downed?'Off his feet':'Blown back';
      popup(D,String(dmg+((info&&(info.tableDmg+info.wallDmg+(info.divDmg||0)+(info.propDmg||0)))||0)),'#ffe299',label,24,-10);}
    addMotes(D.p[CHE].x,D.p[CHE].y,D.dep,5,{vx:fa*120,vy:-20,spread:60,life:.35});
  }finally{ex.li=li;S.hooks.shove=sh;}
  if(S.hooks.spellHit)S.hooks.spellHit(ex,{D,sr,label,dmg,info});
  // a Gale that puts two of them down, or throws one into something, is a moment
  if(!out.wowed&&(out.down>=2||out.hazard||(out.domino&&out.down))){out.wowed=true;wow(D.p[CHE].x,D.dep,out.down>=2?'Gale · '+out.down+' down':'Gale',{z:.18,slow:.5});}
  S.hooks.status();}

// ---------- Glimmer step ----------
// He goes out like a lamp and comes back at the man's back, the cut already moving: a Slash from behind (+2) and out of nowhere (+3).
// The place he comes back to is behind the man (the far side from where Kael stood), or beside him when there is no room there.
function blinkInfo(A,D){if(!A||!D||D.dead||A.clinch)return null;if(A.mount)return blinkSaddle(A,D);
  const fa=Math.sign(D.station-A.station)||A.facing,gap=Math.max(52,engageGap(A,D)*.8);
  for(const [x,z,behind] of [[D.station+fa*gap,D.lane,1],[D.station+fa*gap,D.lane+26,1],[D.station+fa*gap,D.lane-26,1],[D.station+fa*gap*.7,D.lane+48,0],[D.station+fa*gap*.7,D.lane-48,0]]){
    if(z<DEP_MIN||z>DEP_MAX||Math.abs(clampStage(x)-x)>1)continue;
    if(Math.abs(clampSt(A,x,z)-x)>2)continue;
    let free=true;for(const o of S.F){if(o===A||o===D||o.dead||o.npc)continue;if(Math.abs(o.lane-z)<22&&Math.abs(o.station-x)<40){free=false;break;}}
    if(!free)continue;
    if(S.divs.length&&divLaneBlock(z,x))continue;
    return{x,z,face:-fa,behind:!!behind};}
  return null;}
// From the saddle the bike goes into the light with him and comes out of it on the far side of the man's bike, a lane over, with a
// bike's length of clear road round it: he cuts at him from there, turned in the saddle.
function blinkSaddle(A,D){const B=A.mount;if(!B||!D.mount||D.mount.ctl!=='rider')return null;
  const fa=Math.sign(D.station-A.station)||A.facing,gap=Math.max(64,engageGap(A,D)*.8);
  for(const [x,z,behind] of [[D.station+fa*gap,D.lane+34,1],[D.station+fa*gap,D.lane-34,1],[D.station+fa*gap*.45,D.lane+40,0],[D.station+fa*gap*.45,D.lane-40,0]]){
    if(z<DEP_MIN||z>DEP_MAX||Math.abs(clampStage(x)-x)>1)continue;const bx=x-B.fa*SEAT_DX;let free=true;
    for(const V of S.veh){if(V===B||V.kind!=='bike'||V.ctl==='crash'||V.x<-200)continue;if(Math.abs(V.x-bx)<150&&Math.abs(V.dep-z)<(V===D.mount?24:30)){free=false;break;}}
    if(free)for(const o of S.F){if(o===A||o===D||o.dead||o.npc||o.mount||o.gone)continue;if(Math.abs(o.lane-z)<22&&Math.abs(o.station-x)<60){free=false;break;}}
    if(free)return{x,z,face:-fa,behind:!!behind,saddle:true};}
  return null;}
function warpSaddle(f,x,z){const B=f.mount,dx=x-f.station;bikePlace(B,x-B.fa*SEAT_DX,z);B.tx=B.x;B.tz=z;B.tzV=z;B.vdep=0;
  f.lastPelTX+=dx;f.vdep=0;if(f.curBody)f.curBody={...f.curBody,px:f.curBody.px+dx,pz:z};
  const tr=S.trails&&S.trails[f.idx];if(tr)tr.length=0;f.warpAt=S.t;}
function warpTo(f,x,z){if(f.mount){warpSaddle(f,x,z);return;}const dx=x-f.p[PEL].x;
  for(const q of f.p){q.x+=dx;q.px+=dx;}if(f.scarf)for(const q of f.scarf){q.x+=dx;q.px+=dx;}
  for(const s of f.steps){if(s.plant)s.plant={x:s.plant.x+dx,y:s.plant.y};if(s.from)s.from={x:s.from.x+dx,y:s.from.y};if(s.to)s.to={x:s.to.x+dx};}
  f.lastPelTX+=dx;f.station=clampSt(f,x,z);f.lane=z;f.dep=z;f.stepDep=z;f.vdep=0;if(f.curBody)f.curBody={...f.curBody,px:f.curBody.px+dx,pz:z};
  const tr=S.trails&&S.trails[f.idx];if(tr)tr.length=0;f.warpAt=S.t;}
function launchBlink(A,D,ex){const info=blinkInfo(A,D);if(!info){ex.dur=.3;return;}
  // he crouches, the light gathers where he is going while his own place opens up, and at the moment the far slit is widest he is in it
  const r=elfRate(A),Tout=.3,Tg=Tout*.35,c0={x:(A.p[PEL].x+A.p[CHE].x)/2,y:A.p[PEL].y,top:A.p[HEAD].y-A.body.headR,d:A.dep};
  const g0=A.gr(A.p[PEL].x),hTop=g0-c0.top,hPel=g0-c0.y;
  A.action={t0:S.t,end:Tout+.05,body:bodyKeys(A,[[0,'now'],[Tout,'blinkCrouch']]),arm:armKeys(A,[[0,'now'],[Tout,'guard']]),spell:true};
  A.blur=S.t+.45;
  const events=[{t:.01,fn:()=>{glyphAt(A,HAB,.3);S.hooks.sound('blink',1);}},
    {t:Tg,fn:()=>{S.blinks.push({x:c0.x,y:c0.y,top:c0.top,ground:A.gr(c0.x),d:c0.d,t0:S.t,dur:.3,mode:'out',fa:A.facing});
      const gx=S.arena.ground(info.x,info.z),din=(Tout-Tg)/r/.65;
      S.blinks.push({x:info.x,y:gx-hPel,top:gx-hTop,ground:gx,d:info.z,t0:S.t,dur:din,mode:'in',fa:info.face});}},
    {t:Tout,fn:()=>blinkStrike(A,D,info,ex,c0)}];
  ex.res={kind:'magic',out:'hit',tech:{name:'Glimmer step',why:'He goes out like a lamp and comes back at the man’s back with the cut already moving.'}};
  ex.plan={att:A.action,events,Tend:Tout+.4,strikeX:info.x,dir:A.facing,Cfn:()=>({x:info.x,y:A.gr(info.x)-60}),blink:true};ex.dur=Tout+2;ex.perf={dash:Math.round(Math.hypot(info.x-A.station,(info.z-A.lane)*.8))};}
function blinkStrike(A,D,info0,ex,c0){if(A.dead||A.downed||D.dead){ex.dur=S.t-ex.t0+.3;return;}
  // where the light gathered, unless that place has been taken since
  const ok0=blinkInfo(A,D),info=ok0&&Math.abs(ok0.x-info0.x)<30&&Math.abs(ok0.z-info0.z)<20?info0:ok0||info0,x0=(A.p[PEL].x+A.p[CHE].x)/2,y0=A.p[PEL].y-30,d0=A.dep;
  warpTo(A,info.x,info.z);A.facing=info.face;A.flare=1.4;A.blur=S.t+.35;
  if(info!==info0)S.blinks.push({x:(A.p[PEL].x+A.p[CHE].x)/2,y:A.p[PEL].y,top:A.p[HEAD].y-A.body.headR,ground:A.gr(A.p[PEL].x),d:A.dep,t0:S.t-.2,dur:.3,mode:'in',fa:A.facing});
  S.streaks.push({a:{x:x0,y:y0},b:{x:A.p[PEL].x,y:A.p[PEL].y-30},d0,d1:A.dep,t0:S.t,life:.28});
  addMotes(A.p[CHE].x,A.p[CHE].y,A.dep,12,{spread:90,vy:-30});resyncSides();resolveStations();
  // the strike: a fresh timeline from here, the ordinary attack planned from where he now stands
  ex.t0=S.t;ex.plan=null;ex.impactDone=false;ex.lastD=undefined;ex.blinked=true;ex.blinkAt=S.t;A.blinkBonus=3;
  try{launchAttack(A,D,'slash',ex,!!ex.chain,{snap:true,quick:true});}finally{A.blinkBonus=0;}
  if(ex.res&&ex.res.tech)ex.res.tech={...ex.res.tech,name:'Glimmer step · '+lowFirst(ex.res.tech.name)};
  if(!ex.reactPending)S.hooks.log({type:'attack',A,D:ex.D,res:ex.res,ex});
  ex._r=0;ex._elf=0;afterLaunch(ex);}
// the step that put him there is not the strike's own impact
{const di=doImpact;doImpact=function(ex){if(ex&&ex.blinkAt===S.t)return;return di(ex);};}
// a kill out of a blink is a moment
V11.kill.push(D=>{const ex=S.game&&S.game.ex;if(ex&&ex.blinked&&ex.A===S.F[0]&&!ex.blinkWow&&!S.warming){ex.blinkWow=true;wow(D.p[CHE].x,D.dep,'Glimmer kill',{z:.2,slow:.5});}});

// ---------- the run of kills goes on through the air ----------
// When a takedown opens a link and nobody is in reach, Kael can blink to the next of them (Glimmer step) if he has the Aether.
{const ct=chainTarget;chainTarget=function(A,D){const t=ct(A,D);if(t||!mage(A)||(A.aether||0)<SPELLS.blink.cost||A.foot<1)return t;
  let best=null,bd=1e9;const ax=chainX(A),az=chainZ(A);
  for(const o of rivals(A)){if(o===D||o.walkIn||o.offstage)continue;const d=Math.abs(chainX(o)-ax),dz=Math.abs(chainZ(o)-az);if(d<=420&&dz<=110&&d+dz<bd&&blinkInfo(A,o)){bd=d+dz;best=o;}}
  return best;};}
function blinkFlowNeeded(o){const A=o.f,D=o.opp;if(!D)return false;const d=Math.abs(chainX(D)-chainX(A))-engageGap(A,D),dz=Math.abs(chainZ(D)-chainZ(A));return d>CHAIN.reach||dz>CHAIN.depth;}
{const oc=openingChoices;openingChoices=function(o){const ch=oc(o);
  if(o.source==='flow'&&o.f===S.F[0]&&o.opp&&blinkFlowNeeded(o))return['blink','hold'];
  return ch;};}
{const ov=openValid;openValid=function(o,k){if(k==='blink')return spellOK(o.f,o.opp,'blink');return ov(o,k);};}
{const oc=openCost;openCost=function(f,k,o){return oc(f,k==='blink'?'slash':k,o);};}
{const ao=aiOpening;aiOpening=function(o){const ch=openingChoices(o).filter(k=>openValid(o,k));if(ch.includes('blink')&&S.rng()<.85)return'blink';const c=ao(o);return c==='blink'?'hold':c;};}
{const ro=resolveOpening;resolveOpening=function(choice){const o=S.opening;
  if(!o||choice!=='blink'||!openingChoices(o).includes('blink')||!openValid(o,'blink'))return ro(choice);
  if(o.ex&&o.ex.dazedAtStart&&o.ex.A&&o.ex.A!==o.f&&o.source!=='stop')o.ex.A.daze=0;
  S.opening=null;o.f.counter=false;o.f.setSpear=false;o.f.holdFace=null;o.f.lastAct='slash';S.hooks.opening(null,choice);chainLaunch(o,choice);restoreFacings();
  const A=o.f,D=o.opp,g=S.game;A.station=clampSt(A,A.curBody.px);resolveStations();A.ready+=openCost(A,'blink',o);if(A.team===0)setTgt(A,D.idx);
  const ex={A,D,t0:S.t,cmd:'blink',perf:{},depth:o.depth,chain:o.kind,link:o.link,dazedAtStart:A.daze>0,beat:0,setSpear:false};g.ex=ex;
  faceToward(A,D.station);castSpell(A,D,'blink',ex);S.hooks.status();};}

// ---------- Kael's own AI (the auto battle) casts too ----------
function hazardBehind(A,D){const fa=Math.sign(D.station-A.station)||A.facing;
  return!!(tableInPath(D,fa,90)||(S.divs.length&&divInPath(D,fa,90))||dominoPartner(A,D)||(wallStanding()&&S.wall&&fa>0&&D.station+90>S.arena.wall-34));}
{const ac=aiChoice;aiChoice=function(i){const A=S.F[i],c=ac(i);
  if(!A||A!==S.F[0]||!mage(A)||A.downed||A.clinch||(A.aether||0)<2)return c;
  if(['getup','roll','draw','pickup','throw','toss'].includes(c))return c;
  const D=targetOf(A);if(!D||D.dead)return c;const a=A.aether,r=S.rng(),ok=k=>cmdValid(A,D,k);
  const gt=galeTargets(A,D),dist=Math.abs(D.station-A.station);
  if(a>=3&&gt.filter(o=>!o.downed).length>=2&&ok('gale')&&r<.6)return'gale';
  if(a>=3&&gt.length===1&&!gt[0].downed&&hazardBehind(A,gt[0])&&ok('gale')&&r<.4)return'gale';
  if(dist>engageGap(A,D)+150&&ok('bolt')&&r<.45)return'bolt';
  if((D.guarding||D.counter||D.beast==='lizard')&&ok('blink')&&r<.35)return'blink';
  if(a>=MAGIC.max&&r<.3){for(const k of ['blink','bolt'])if(ok(k))return k;}
  return c;};}

// ---------- after any command or opening: how an elf gets out of the way, then the elf's pace ----------
function afterLaunch(ex){if(!ex||ex._elf||ex.reactPending)return;ex._elf=1;try{elfEvade(ex);}catch(e){if(S.debug)console.error(e);}compressEx(ex);}
{const cm=command;command=function(i,cmd,opts){const before=S.game.ex,A=S.F[i],x0=A?A.station:0,z0=A?A.lane:0;const r=cm(i,cmd,opts),ex=S.game.ex;
  if(r&&ex&&ex!==before){if((cmd==='advance'||cmd==='withdraw')&&ex.A===A&&!ex.plan)elfDash(A,x0,z0,ex);afterLaunch(ex);}return r;};}
{const ro=resolveOpening;resolveOpening=function(choice){const before=S.game.ex;const r=ro(choice);if(S.game.ex&&S.game.ex!==before)afterLaunch(S.game.ex);return r;};}
// ===== ELVES END =====
