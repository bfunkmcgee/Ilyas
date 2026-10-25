// ===== STANCES (test) START =====
// The second rule under test: Ilyas picks the family of his arc-blade's moves, and the engine still picks the move. Three stances:
//   Bound    the blade locked at its full length: the crescents, and two men in one stroke (the crowd strokes reach further). A man
//            with a short blade runs onto his point as he closes (the stop-hit the longer weapon has today), and until he is inside
//            it he strikes at -2 instead of the +2 a short blade has inside a long one's reach; a grab on him is at -2. Against a
//            longer weapon he has to walk onto the point. No lash.
//   Unbound  the segments loose on their thread: a bladed whip. Every blow is a lash from where he stands, from just outside his
//            reach to well past it (no run in, no stop-hit on him, and a lash parried out there opens no riposte: the man is too far
//            off). The tip does the cutting: a man out at the end of the chain (STN.tip past his striking distance and on) takes the
//            crack, the Whipcrack, the High crack and the Lash dart, at 1.2, 1.1 and .95; a man inside the tip takes the chain's
//            body, the Short lash, the Falling lash and the Short dart, at .8, .75 and .65. The cut curls round a raised guard (a
//            Parry adds +2, not +4), and a spear's Parry and Counter hold nothing against the chain (a shaft cannot turn it). The
//            Ankle wrap is the old snare. A man who closes on him through the chain's reach runs onto the tip: a stop-lash, as a
//            spear's stop-hit, at the tip's weight. Inside his reach the blade relocks for the blow, at -2. A whip is no guard: his
//            Parry is at -1 and his Counter at -2 until he changes it.
//   Close    the blade choked short: the hilt-ring and the spine, a hook from inside, and his free hand at the collar (grab +2). He
//            stays in a man's chest after a blow. An axe swung at him from in reach meets him inside its head: the blow comes on the
//            haft, at -2 and lighter. Tied up inside one man, he is at -1 DEF to everyone else.
// Three things decide which stance answers a man: his weapon (the rules above), how far off he is (each stance has a range for its own
// blows: Bound at blade's length, Close inside his reach, Unbound out on the tip), and the blow he is gearing up, shown over his head
// (each stance answers some blows and gives way to others, and an answered blow that misses costs the man a pip of balance more;
// see "what he is gearing up" below). Switching is free on his own turn, before he acts, and holds till his next; it shows in his
// guard (and in the blade, drawn by the test's UI). STANCE.on false is today's arc-blade, where the engine picks from every family.
const STANCE={on:true,policy:'match'};
const STANCES={
  bound:{name:'Bound',short:'Locked blade',good:'Crowds, daggers',line:'The blade locked at full length: crescents, and two men in one stroke.'},
  unbound:{name:'Unbound',short:'The whip',good:'Spears, reach',line:'The segments loose on the thread: a bladed whip that cracks from past his reach.'},
  close:{name:'Close',short:'Inside',good:'Axes, one on one',line:'The blade choked short: hilt, spine and the grip, inside the reach.'}};
const STANCE_ORDER=['bound','unbound','close'];
// unboundMin/Max: the lash's reach, past his striking distance; tip: where the whip's tip starts, past his striking distance (where
// an ordinary blade's reach ends); stop: the line a man closing on him crosses onto the tip; relock: a blow inside his reach;
// parry/counter: a whip is no guard; tied: Close against everyone but his man; grab/grabDef: Close's grip, Bound's point; closeGap:
// how close Close stays after a blow; cleave/whirl: how much further Bound's two-man strokes reach
const STN={unboundMin:-12,unboundMax:LASH.reach+60,tip:APPROACH_FREE,stop:APPROACH_FREE+16,relock:-2,parry:-1,counter:-2,tied:-1,grab:2,grabDef:2,point:-2,closeGap:14,cleaveX:84,cleaveZ:58,whirlR:30};
// Unbound's whip, by attack: the blow at the tip and the blow inside it ([key, name, damage]), its knock and where it lands; the cut
// curls round a raised guard (hook: a Parry adds +2, not +4)
const WHIP={slash:{tip:['whipcrack','Whipcrack',1.2],near:['shortlash','Short lash',.8],knock:LASH.knock,hook:true},
  overhead:{tip:['highcrack','High crack',1.1],near:['lashfall','Falling lash',.75],knock:.5},
  thrust:{tip:['lashdart','Lash dart',.95],near:['shortdart','Short dart',.65],knock:.4,anchor:'chest'}};
function whipTip(A,D){return!!A&&!!D&&lashGap(A,D)>=STN.tip;}
// (how Ilyas on auto plays the whip: how often he steps back to put a man who holds off on the tip)
const WHIP_AI={step:.25};
function stanceOn(f){return STANCE.on&&!!f&&f===hero()&&f.weaponKey==='elven'&&!f.wp.improv&&!(typeof drained==='function'&&drained(f));}
function stanceOf(f){return stanceOn(f)?(f.stance||'bound'):null;}
V11.duelStart.push(()=>{const K=hero();if(K){K.stance='bound';K.stanceT=-9;}});
// his own turn, before he acts: the only time it changes
function stanceCanSwitch(K){const g=S.game;return!!K&&stanceOn(K)&&!!g&&g.phase==='input'&&g.active===K.idx&&!S.opening&&!K.downed&&!K.clinch&&!K.dead;}
function setStance(K,s){if(!STANCES[s]||!stanceCanSwitch(K)||stanceOf(K)===s)return false;const was=stanceOf(K);K.stance=s;K.stanceT=S.t;
  if(was==='unbound')K.relockT=S.t;if(S.hooks.stance)S.hooks.stance(K,s,was);S.hooks.status();return true;}

// ---------- the moves each stance gives ----------
// while the hero's technique is picked under a stance, the moment's context is bent: Bound never counts as clinch range, Close always does
let STN_CTX=null,STN_JAM=null;
{const tc=techContext;techContext=function(A,D){const c=tc.apply(this,arguments);
  if(STN_CTX&&A===hero()&&STN_CTX.clinch!=null)c.clinch=STN_CTX.clinch;
  else if(STN_JAM&&A===STN_JAM)c.clinch=true;
  return c;};}
// a heavy weapon (the axe) swung at him from in reach while he is in Close meets him inside its head: the blow comes on the haft
// (jammed, -2, and lighter). A thrust or a sweep is no swing, and a man who has to come to him picks his distance.
function stnJams(A,D,kind){return!!A&&!!D&&D===hero()&&stanceOf(D)==='close'&&A.team!==D.team&&stanceHeavy(A)&&!D.downed&&!A.clinch&&(kind==='overhead'||kind==='slash')&&!cameFar(A,D);}
// the lash is Unbound's, and only Unbound's, and it reaches from just outside his striking distance
{const lr=lashReady;lashReady=function(A,D){const s=stanceOf(A);if(!s)return lr.apply(this,arguments);if(s!=='unbound')return false;
  if(!D||D.dead||D.downed||A.clinch||A.downed||D.clinch)return false;const g=lashGap(A,D);if(g<STN.unboundMin||g>STN.unboundMax)return false;
  return!tableBetween(A,D)&&!(S.divs.length&&divBetween(A,D));};}
// a lash built fresh (none of the moment's other moves carry over into it)
function stnLash(A,kind,o){return Object.assign({kind,key:'lash',name:'',why:'',tags:['Unbound',A.wp.name,SKILLS[A.skill-1]],acc:0,dmg:1,along:null,ang:null,amp:1,overlap:0,reach:null,anchor:null,
  kick:false,vault:false,around:null,rising:false,descend:false,windCap:null,passing:false,flair:null,multi:null,knock:1,kdEase:0,lash:true,move:true},o);}
const STN_SIGNED=n=>(n<0?'\u2212':'+')+Math.abs(n);
const STN_WHY={
  whipcrack:'He is out on the tip: the chain rolls out and the tip cracks across him, and it curls round a raised guard (Parry only +2).',
  shortlash:'He is inside the tip: the chain’s body lands, not its edge, and lighter. Step back and the tip cracks.',
  highcrack:'The chain loops up high and the tip cracks down on him, over any guard: a man off balance goes down under it.',
  lashfall:'Inside the tip, the chain comes down over his guard, but lighter.',
  lashdart:'The chain snaps out straight and the point takes him in the chest from the end of its reach.',
  shortdart:'Inside the tip, the point darts in short and light.',
  wrap:'The end of the chain wraps his ankle and yanks him in: Committed or worse, he goes down.',
  stop:'He runs onto the tip of the chain as he closes.',
  hook:'From inside his reach the curve of the blade hooks behind his ankle and pulls: a Committed man goes down on a clean hit.',
  hammer:'Too close to cut, so the hilt-ring comes down on his face.'};
{const pt=pickTechnique;pickTechnique=function(A,D,kind){
  if(stnJams(A,D,kind)){STN_JAM=A;try{return pt.apply(this,arguments);}finally{STN_JAM=null;}}
  const s=stanceOf(A);if(!s||!D||D.downed||A.clinch||A.blinkBonus)return pt.apply(this,arguments);
  if(s==='bound'){STN_CTX={clinch:false};let T;try{T=pt.apply(this,arguments);}finally{STN_CTX=null;}return{...T,stance:'bound'};}
  if(s==='close'){STN_CTX={clinch:true};let T;try{T=pt.apply(this,arguments);}finally{STN_CTX=null;}T={...T,stance:'close',tags:T.tags.filter(t=>t!=='Clinch range').concat('Close')};
    if(kind==='sweep'&&!T.haftCut)T={...T,key:'insidehook',name:'Inside hook',anchor:'shin',along:A.wp.len*.5,amp:.7,acc:1,kdEase:2,why:STN_WHY.hook,stanceWhy:STN_WHY.hook};
    if(kind==='overhead'&&T.key==='pommel')T={...T,stanceWhy:STN_WHY.hammer,why:STN_WHY.hammer};
    return T;}
  // Unbound: the whip, or inside his reach the blade relocks for the blow
  const ready=lashReady(A,D)&&obstacleBehind(A)>=38;
  if(!ready){STN_CTX={clinch:false};let T;try{T=pt.apply(this,arguments);}finally{STN_CTX=null;}
    return{...T,stance:'unbound',relock:true,acc:(T.acc||0)+STN.relock,name:'Relocked '+lowFirst(T.name),tags:[...T.tags,'Relocking'],
      why:'Too close for the whip: the segments lock again for the blow, and it comes late. '+T.why,stanceWhy:'Too close for the whip: the blade relocks for the blow, at '+STN_SIGNED(STN.relock)+'.'};}
  let T;
  // the tip does the cutting: out at the end of the chain it cracks, inside it the chain's body lands
  if(WHIP[kind]){const W=WHIP[kind],tip=whipTip(A,D),[key,name,dmg]=tip?W.tip:W.near;
    T=stnLash(A,kind,{key,name,acc:LASH.acc,dmg,knock:W.knock,anchor:W.anchor||null,hook:!!W.hook,whip:true,tip,why:STN_WHY[key],stanceWhy:STN_WHY[key]});
    T.tags.splice(1,0,tip?'The tip':'Inside the tip');}
  else{T=pt.apply(this,arguments);if(T.snare)T={...T,name:'Ankle wrap',whip:true,wrap:true,tip:false,why:STN_WHY.wrap,stanceWhy:STN_WHY.wrap};}
  return{...T,stance:'unbound'};};}
// a man closing on him runs onto the tip: the stop-lash is the tip's blow, wherever he is when it lands
{const st=stopTech;stopTech=function(T,D,s){const R=st.apply(this,arguments);if(!T||!T.whip||T.stance!=='unbound')return R;
  const tipT=WHIP.thrust.tip;return{...R,key:'stoplash',name:'Stop-lash',dmg:tipT[2],tip:true,why:`${D.name} runs onto the tip of the chain as he closes.`,stanceWhy:STN_WHY.stop};};}
// the chain is Unbound's own way to fight, not a trick: its lash spends no extra pip of balance (a heavy blow still spends its own)
{const fd=footDelta;footDelta=function(A,cmd,T){if(T&&T.lash&&T.stance==='unbound'&&A===hero())return-(FOOT_COST[cmd]||0);return fd.apply(this,arguments);};}
// ---------- how the whip moves ----------
// The chain is already loose, so nothing unlocks at the start of a blow and nothing locks at its end: the hand throws, the chain
// rolls out after it, the tip runs out fastest at the very end (eIn instead of eOut) and cracks at the impact, flash and sound, at
// the tip or in the air if it missed; the snare wraps instead. Then the chain is reeled in, still loose. The throw is a little
// slower than a lash, so the roll-out can be seen.
function isWhip(T){return!!T&&!!T.whip&&T.stance==='unbound';}
{const to=tacOf;tacOf=function(f,T){const R=to.apply(this,arguments);return isWhip(T)?{...R,strike:R.strike*1.3,follow:R.follow*1.2}:R;};}
{const pa=planAttack;planAttack=function(A,D,kind,res){const P=pa.apply(this,arguments),T=res&&res.tech,L=A.lash;
  if(!isWhip(T)||!L||L.t0!==S.t)return P;
  const a0=L.a,ts=(L.b-L.a)/.65,w1=L.a-.35*ts;L.a=w1+.12*ts;L.whip=true;L.tip=!!T.tip;L.wrap=!!T.wrap;
  P.events=P.events.filter(e=>!((Math.abs(e.t-(a0-.02))<1e-9&&/'unroll'/.test(String(e.fn)))||(Math.abs(e.t-L.d)<1e-9&&/relockT/.test(String(e.fn)))));
  P.events.push({t:L.c,fn:()=>{if(!A.dead)S.hooks.sound('reel',.7);}});
  if(T.tip)P.events.push({t:P.Timp,fn:()=>{if(A.dead)return;const q=A.p[TIP];flash(q,24,'#e6fffb',A.dep);sparks(q,9,'#8ff5e8',A.dep);S.hooks.sound('whipcrack',1);}});
  return P;};}
{const ls=lashStep;lashStep=function(f){const L=f.lash;if(!L||!L.whip)return ls.apply(this,arguments);const base=f.wp.len;
  if(f.dead||f.weaponKey!=='elven'||S.t-L.t0>L.d+.2){f.sticks[10][2]=base;f.lash=null;return;}
  const u=S.t-L.t0;let len=base;
  if(u>=L.a&&u<L.b)len=lerp(base,L.L,eIn((u-L.a)/Math.max(.01,L.b-L.a)));
  else if(u>=L.b&&u<L.c)len=L.L;
  else if(u>=L.c&&u<L.d)len=lerp(L.L,base,sstep((u-L.c)/Math.max(.01,L.d-L.c)));
  f.sticks[10][2]=len;f.lashLen=len;};}
// ---------- what he is gearing up, and how far off he is ----------
// Against the blow a man throws at him (the one he showed), as it lands, by the stance Ilyas holds:
//   Bound    beats a thrust aside (+3 DEF) and takes a cut on the locked blade (+2), but an overhead beats a single blade (-1)
//   Close    gets inside an overhead (+3) or a cut (+2) from a man already in reach with more than a dagger (an axe's swings are
//            jammed instead, above), but walks onto a point (-1) and stands planted for a sweep (-1)
//   Unbound  catches the raised arm of a man who has to come to him for an overhead (+3), but a thrust comes inside the chain (-2)
// An answered blow that misses him costs the man a pip of balance more, and the answer is named over him.
// A blow with the butt, the haft or a choked grip, a kick or a dirty move is none of these. "Has to come to him": he was past his own
// striking distance when he took his turn (a run-in that a stop-hit held up keeps it). And Ilyas's own blows have a range in each
// stance, his gap past his own striking distance: Bound at blade's length is +1 to hit and -1 once the man is inside it, Close inside
// his reach is +1, and Unbound's is the tip's crack.
const STN_ANS={bound:{thrust:['beats the point aside',3],slash:['on the locked blade',2],overhead:['an overhead beats a single blade',-1]},
  close:{overhead:['inside his swing',3,'in'],slash:['inside his cut',2,'in'],thrust:['onto his point',-1],sweep:['planted inside',-1]},
  unbound:{overhead:['the chain catches his arm',3,'far'],thrust:['inside the chain',-2]}};
// what is said over him when an answered blow misses
const STN_POP={bound:{thrust:'Beaten aside',slash:'On the blade'},close:{overhead:'Inside the swing',slash:'Inside the cut'},unbound:{overhead:'Arm caught'}};
// The pip goes on the cost the miss already takes from him (blocked, dodged, parried, countered), so a break it makes opens at once.
let STN_MISS=null;
{const kb=knockBalance;knockBalance=function(f,n,by){const m=STN_MISS;
  if(m&&f===m.A&&by===m.D&&n>0){STN_MISS=null;m.paid=true;n+=1;}return kb.call(this,f,n,by);};}
{const ai=applyImpact;applyImpact=function(ex,A,D,res,Cfn,cv,slip,fa,primary){
  const s=primary&&D&&D===hero()&&A&&A.team!==D.team&&res&&(res.out==='block'||res.out==='dodge')&&!res.guardBreak&&!D.downed&&!A.dead&&!A.downed&&
      ATTACKS.includes(res.kind)?stanceOf(D):null,a=s&&res.tech?stnAnswer(s,res.kind,res.tech,A,cameFar(A,D)):null;
  if(!a||a[1]<=0)return ai.apply(this,arguments);
  const m={A,D,paid:false};STN_MISS=m;
  try{return ai.apply(this,arguments);}
  finally{STN_MISS=null;if(m.paid)popup(A,STN_POP[s][res.kind],'#9fe0ff','\u22121 balance',17,freshBreak(A)?-88:-44);}};}
function stnShortBlade(A){return!!A&&!!A.wp&&(!!A.wp.unarmed||A.wp.len<40);}
function stnAnswer(s,kind,T,A,far){const e=STN_ANS[s]&&STN_ANS[s][kind];if(!e||!T||T.kick||T.dirty||['butt','haft','choked','pommel'].includes(T.key))return null;
  if(e[2]==='far'&&!far)return null;if(e[2]==='in'&&(far||stnShortBlade(A)||jammedTech(A,T)))return null;return e;}
function stnRange(K,D){const s=stanceOf(K),g=lashGap(K,D);
  if(s==='bound')return g<STN.unboundMin?['too close for the point',-1]:g<=STN.tip?['at blade\u2019s length',1]:null;
  if(s==='close')return g<STN.unboundMin?['inside his reach',1]:null;return null;}
// where a blow comes from, as it stood when he took his turn: from past his own striking distance (far), and from inside the target's
// (inside); a blow off his turn (a riposte) comes from where he is
function comesFar(A,D){return Math.abs(A.station-D.station)-engageGap(A,D)>APPROACH_FREE;}
function comesInside(A,D){return lashGap(D,A)<STN.unboundMin;}
function cameFar(A,D){const c=A._came;return c&&c.turn===S.game.turnNo&&c.D===D?c.far:comesFar(A,D);}
function cameInside(A,D){const c=A._came;return c&&c.turn===S.game.turnNo&&c.D===D?c.inside:comesInside(A,D);}
{const cm=command;command=function(i,cmd,opts){const A=S.F[i],D=A?targetOf(A):null;
  if(A&&D&&!(opts&&opts.prepaid)&&ATTACKS.includes(cmd))A._came={turn:S.game.turnNo,D,far:comesFar(A,D),inside:comesInside(A,D)};return cm.apply(this,arguments);};}
// Unbound strikes from where he stands: nothing to close, no stop-hit on the way in
{const ac=approachCost;approachCost=function(A,D,cmd){if(stanceOf(A)==='unbound'&&ATTACKS.includes(cmd)&&D&&!D.downed&&lashReady(A,D))return 0;return ac.apply(this,arguments);};}
{const sh=stopHitFor;stopHitFor=function(A,D,cmd,dest){
  if(A&&stanceOf(A)==='unbound'&&ATTACKS.includes(cmd)&&lashReady(A,D))return false;
  // Unbound: a man closing on him through the chain's reach runs onto it (the line it holds is just outside his striking distance)
  if(D&&stanceOf(D)==='unbound'){if(!A||A.team===D.team||D.dead||D.downed||D.clinch||A.clinch||A.downed||D.foot<1||stuckIn(D))return false;
    if(!(ATTACKS.includes(cmd)||cmd==='shove'||cmd==='advance'))return false;if(facingAway(D,A)||tableBetween(A,D)||(S.divs.length&&divBetween(A,D)))return false;
    const gap=Math.abs(A.station-D.station),r=stopRange(D,A);if(gap<=r+6)return false;const end=dest!=null?Math.abs(dest-D.station):engageGap(A,D);return end<r-6;}
  // Close holds the blade short: no point to run onto
  if(D&&stanceOf(D)==='close')return false;
  return sh.apply(this,arguments);};}
{const sr=stopRange;stopRange=function(D,A){if(D&&A&&stanceOf(D)==='unbound'&&A.team!==D.team)return engageGap(D,A)+STN.stop;return sr.apply(this,arguments);};}
// a lash parried or dodged out past the man's reach opens nothing for him: he is too far off to answer it
{const co=considerOpening;considerOpening=function(ex,f,opp,src){
  if(opp&&opp===hero()&&ex&&ex.A===opp&&ex.res&&ex.res.tech&&ex.res.tech.lash&&stanceOf(opp)==='unbound'&&['parry','block','counter','dodge','dodgeOver'].includes(src)&&
    Math.abs(f.station-opp.station)-engageGap(f,opp)>APPROACH_FREE)return;
  return co.apply(this,arguments);};}
// where he settles after a blow: Close stays in the man's chest, Unbound keeps its distance
{const ss=settleStation;settleStation=function(A,D,sx){const s=stanceOf(A);if(!s||s==='bound'||!D||D.dead)return ss.apply(this,arguments);
  if(s==='unbound')return clampSt(A,sx);
  const fa=Math.sign(D.station-A.station)||A.facing,cg=clinchGap(A,D),tgt=D.station-fa*(cg+STN.closeGap),a=sx-fa*45,b=sx+fa*10;
  let x=clamp(tgt,Math.min(a,b),Math.max(a,b));const lim=D.station-fa*(cg-2);if((x-lim)*fa>0)x=lim;return clampSt(A,x);};}
// Bound's two-man strokes reach further
{const wp=whirlPartner;whirlPartner=function(A,D){if(stanceOf(A)!=='bound')return wp.apply(this,arguments);
  if(A.skill<RANK.expert||Math.abs(D.station-A.station)-engageGap(A,D)>48+STN.whirlR)return null;
  const fa=Math.sign(D.station-A.station)||A.facing,reach=estReach(A,'slash')+26+STN.whirlR;let best=null,bd=1e9;
  for(const o of rivals(A)){if(o===D)continue;const dx=(o.station-A.station)*fa;if(dx>-24)continue;
    const dz=Math.abs(o.lane-A.lane),d=Math.hypot(dx,dz*.8);if(dz<=56&&d<=reach&&d<bd){bd=d;best=o;}}
  return best;};}
{const cp=cleavePartner;cleavePartner=function(A,D){if(stanceOf(A)!=='bound')return cp.apply(this,arguments);
  if(A.skill<RANK.veteran)return null;const fa=Math.sign(D.station-A.station)||A.facing;let best=null,bd=1e9;
  for(const o of rivals(A)){if(o===D)continue;if((o.station-A.station)*fa<24)continue;
    const sx=Math.abs(o.station-D.station),dz=Math.abs(o.lane-D.lane);
    if(sx<=STN.cleaveX&&dz<=STN.cleaveZ&&Math.abs(o.lane-A.lane)<=62){const d=sx+dz*.6;if(d<bd){bd=d;best=o;}}}
  return best;};}

// ---------- what each stance does to the dice ----------
{const cm=computeMods;computeMods=function(A,D,kind,opening,T){const c=cm.apply(this,arguments);const s=stanceOf(D);
  if(s==='unbound'&&!D.downed){const pen=(D.guarding?STN.parry:0)+(D.counter?STN.counter:0);if(pen){c.def+=pen;c.defMods.push(['unbound blade',pen]);}}
  if(s==='close'&&!D.downed&&A&&A.team!==D.team){const t=S.F[getTgt(D)];if(t&&t!==A&&!t.dead){c.def+=STN.tied;c.defMods.push(['tied up inside',STN.tied]);}}
  // Bound keeps a short blade at the point: instead of the +2 a shorter weapon has inside a long one's reach, he has to get past it
  if(s==='bound'&&!D.downed&&A&&A.team!==D.team&&!cameInside(A,D)){const m=c.mods.find(x=>x[0]==='inside the reach'&&x[1]>0);if(m){c.bonus-=m[1]-STN.point;m[1]=0;c.mods.push(['kept at the point',STN.point]);}}
  // the stance against the blow he throws, and the range of Ilyas's own blows
  if(s&&!D.downed&&A&&A.team!==D.team&&ATTACKS.includes(kind)){const a=stnAnswer(s,kind,T,A,cameFar(A,D));if(a){c.def+=a[1];c.defMods.push([a[0],a[1]]);}}
  if(A&&stanceOf(A)&&D&&!D.downed&&A.team!==D.team&&ATTACKS.includes(kind)){const r=stnRange(A,D);if(r){c.bonus+=r[1];c.mods.push(r);}}
  // a spear's shaft cannot turn a chain: against Unbound's lash his Parry and his Counter hold nothing
  if(A&&stanceOf(A)==='unbound'&&T&&T.lash&&T.stance==='unbound'&&D&&D.weaponKey==='spear'&&!D.downed){
    const pm=c.defMods.find(x=>x[0]==='parry'&&x[1]>0),cm2=c.defMods.find(x=>x[0]==='counter'&&x[1]>0);
    for(const m of [pm,cm2])if(m){c.def-=m[1];m[1]=0;}if(pm||cm2)c.defMods.push(['a shaft cannot turn a chain',0]);}
  return c;};}
{const gm=grabMods;grabMods=function(A,D,opening){const c=gm.apply(this,arguments);
  if(stanceOf(A)==='close'){c.mods.push(['close stance',STN.grab]);c.bonus+=STN.grab;}
  if(stanceOf(D)==='bound'){c.defMods.push(['the blade keeps him off',STN.grabDef]);c.dc+=STN.grabDef;}
  return c;};}

// ---------- the guard shows it ----------
const STANCE_GUARD={unbound:{hx:.6,hy:.52,w:.62,gw:0,off:[.14,.5],crouch:.9,lean:.02,sf:.25,sb:-.33},
  close:{hx:.3,hy:.2,w:-.18,gw:-.2,off:[.4,.12],crouch:.82,lean:.15,sf:.32,sb:-.27}};
{const tg=tacGuard;tacGuard=function(f){const s=stanceOf(f);if(s&&s!=='bound'&&!f.clinch&&!f.mount&&!f.downed&&!f.carry)return STANCE_GUARD[s];return tg.apply(this,arguments);};}

// ---------- the enemies ----------
// a man lashed at from out of his reach closes in instead of waiting for him (a keeper holds his reach, as he always does)
{const ac=aiChoice;aiChoice=function(i){const A=S.F[i];
  if(STANCE.on&&A&&A.team===1&&!A.downed&&!A.clinch&&!A.npc&&!A.walkIn&&A.temper!=='keeper'){const K=hero(),D=targetOf(A);
    if(D===K&&stanceOf(K)==='unbound'&&!K.downed&&cmdValid(A,D,'advance')){const g=Math.abs(A.station-D.station)-engageGap(A,D),p=A.temper==='rusher'?.7:A.temper==='brute'?.5:.45;
      if(g>APPROACH_FREE&&S.rng()<p)return'advance';
      const c=ac.apply(this,arguments);return c==='wait'&&g>0?'advance':c;}}
  // Ilyas on auto picks his stance at the start of his choice, and in Unbound uses what the whip is for: the crack from the tip (a
  // step back to put a man who holds off on it), the overhead on a man off balance, the wrap on a Committed one
  if(A&&A===hero()&&stanceOn(A)&&isAI(i)&&stanceCanSwitch(A)){const s=stanceAuto(A);if(s)setStance(A,s);
    const D=targetOf(A);if(stanceOf(A)==='unbound'&&D&&!D.downed&&!D.dead&&lashReady(A,D)){const ok=c=>cmdValid(A,D,c),r=S.rng();
      if(D.posture==='off'&&ok('overhead')&&A.foot>=4)return'overhead';
      if(D.posture==='committed'&&ok('sweep')&&r<.5)return'sweep';
      if(!whipTip(A,D)&&D.temper==='keeper'&&r<WHIP_AI.step&&ok('withdraw')&&roomBehind(A)>60&&withdrawInfo(A,D))return'withdraw';}}
  return ac.apply(this,arguments);};}
// ---------- a blow he shows is the blow he throws ----------
// The stance answers the blow he is gearing up, so a man who shows Ilyas a blow keeps it until he throws it: a plan he would remake
// for free (Ilyas moved, his footing changed) keeps that blow if he can still throw it at Ilyas. A re-plan he pays for (a Veteran
// reading a guard or a counter stance come up) is his own choice and stands.
{const ei=ensureIntents;ensureIntents=function(){const before=new Map();for(const A of foes())before.set(A,A.intent);ei.apply(this,arguments);
  const K=hero();if(!STANCE.on||!stanceOn(K))return;
  for(const A of foes()){const was=before.get(A),it=A.intent;
    if(!was||!it||it===was||it.paid||!ATTACKS.includes(was.cmd)||was.tgt!==K.idx||it.tgt!==K.idx||it.cmd===was.cmd||A.downed||!cmdValid(A,K,was.cmd))continue;
    A.intent={...it,cmd:was.cmd};}};}
// ---------- which stance answers him ----------
// Each stance is scored against the man he faces: his weapon, how far off he is (the range of Ilyas's own blows in it), what he and the
// others are gearing up against Ilyas (the answers above, by where each blow would come from) and the crowd round him, each reason at
// about what it does to the dice. The best is the one the test's UI marks and Ilyas on auto takes (STANCE.policy 'match'); 'weapon' is
// the first test's match, on the weapon and the crowd alone, 'worst' the worst, and a stance's own name that stance only.
// a heavy weapon: the axe (an improvised one, the table leg or the bare shaft, does not count)
function stanceHeavy(A){return!!A&&!!A.wp&&A.wp.fam==='heavy'&&A.wp.len>=60&&!A.wp.improv&&!A.wp.unarmed;}
function stanceWord(D){const k=D.weaponKey;return k==='axe'?'axe':k==='spear'?'spear':D.wp.short.toLowerCase();}
// the stance bar's words for each answer, short enough for a phone: about the man in front (his) or another man (a)
const STN_SHORT={bound:{thrust:h=>`beats ${h||'a'} thrust`,slash:h=>`takes ${h||'a'} cut`,overhead:()=>'overhead beats it'},
  close:{overhead:h=>`inside ${h||'a'} swing`,slash:h=>`inside ${h||'a'} cut`,thrust:h=>`onto ${h||'a'} point`,sweep:()=>'easy to sweep'},
  unbound:{overhead:h=>`catches ${h||'an'} arm`,thrust:()=>'thrust gets in'}};
const STN_KIND={slash:'a cut',overhead:'an overhead',thrust:'a thrust',sweep:'a sweep'};
// the blows a man's weapon usually throws, as shares: what else a stance may meet before Ilyas's next turn besides the blow he shows
// (his riposte, a second turn of his), weighed at a little over half a blow; and the bar's words for the strongest of them
const STN_HABIT={axe:{slash:.4,overhead:.35,thrust:.2,sweep:.05},spear:{thrust:.65,slash:.3,overhead:.05},dagger:{slash:.4,thrust:.4,sweep:.15,overhead:.05},
  sword:{slash:.5,thrust:.4,overhead:.1},other:{slash:.5,thrust:.35,overhead:.15}};
const STN_HABIT_W=.6;
const STN_HABIT_SHORT={bound:{thrust:'beats his thrusts',slash:'takes his cuts',overhead:'his overheads beat it'},
  close:{overhead:'inside his swings',slash:'inside his swings',thrust:'onto his point',sweep:'easy to sweep'},
  unbound:{overhead:'catches his arm',thrust:'his thrusts get in'}};
function stanceHabit(K,D,s){const H=STN_HABIT[D.weaponKey]||STN_HABIT.other,far=comesFar(D,K);let v=0,top=null;
  for(const kind in H){const T=stanceAs(K,s,()=>pickTechnique(D,K,kind));let a=stnAnswer(s,kind,T,D,far);a=a?a[1]:stanceAs(K,s,()=>stnJams(D,K,kind))?2:0;
    const c=H[kind]*a;v+=c;if(c&&(!top||Math.abs(c)>Math.abs(top.c)))top={c,kind};}
  v=Math.round(v*STN_HABIT_W*10)/10;return top&&Math.abs(v)>=.3?{v,short:STN_HABIT_SHORT[s][top.kind]||''}:null;}
function stanceAs(K,s,fn){const was=K.stance;K.stance=s;try{return fn();}finally{K.stance=was;}}
function stanceNear(K,D){return foes().filter(o=>o!==D&&upright(o)&&!o.walkIn&&Math.abs(o.station-K.station)-engageGap(K,o)<90).length;}
// the reasons for (v>0) and against (v<0) a stance against him now, each with the bar's words and what it is about (k: 3 a blow he
// shows, 2 the range, 1 his weapon, 0 the crowd; of two reasons as strong, the bar names the one about what he is doing)
function stanceFactors(K,D,s){const F=[];if(!K||!D||D.dead||D.downed)return F;const add=(v,short,k)=>{if(v)F.push({v,short,k});},w=stanceWord(D),g=lashGap(K,D);
  // his weapon: the blows it usually throws (an axe's swings jammed in reach, a spear's thrusts beaten aside...), a short blade still
  // outside the point, a spear against the chain
  {const h=stanceHabit(K,D,s);if(h)add(h.v,h.short,1);}
  if(s==='bound'&&outreaches(K,D)&&!comesInside(D,K))add(3,`${w} kept off`,1);
  if(s==='unbound'&&D.weaponKey==='spear')add(2,`past the ${w}`,1);
  // how far off he is: the range of Ilyas's own blows
  if(s==='bound'){if(g<STN.unboundMin)add(-1,'too close',2);else if(g<=STN.tip)add(1,'at blade\u2019s length',2);}
  if(s==='close'&&g<STN.unboundMin)add(1,'inside his reach',2);
  if(s==='unbound'){if(g<STN.unboundMin)add(-2,'relocks inside',2);else if(g<STN.tip)add(-1,'inside the tip',2);else if(g<=STN.unboundMax)add(2,'on the tip',2);}
  // what each man is gearing up against him, from where it would come
  for(const E of foes()){const it=E.intent;if(!it||it.tgt!==K.idx||E.downed||E.walkIn)continue;const his=E===D?'his':null;
    if(ATTACKS.includes(it.cmd)){const T=stanceAs(K,s,()=>pickTechnique(E,K,it.cmd)),a=stnAnswer(s,it.cmd,T,E,comesFar(E,K));if(a)add(a[1],STN_SHORT[s][it.cmd](his),3);
      else if(s==='close'&&stanceAs(K,s,()=>stnJams(E,K,it.cmd)))add(2,`jams ${his||'a'} swing`,3);}
    if(s==='unbound'&&(ATTACKS.includes(it.cmd)||it.cmd==='advance')){const ai=it.cmd==='advance'?advanceInfo(E,K):null;
      if((it.cmd!=='advance'||ai)&&stanceAs(K,s,()=>stopHitFor(E,K,it.cmd,ai?ai.x:undefined)))add(1,E===D?'meets him coming':'meets a rush',3);}
    if(s==='bound'&&it.cmd==='grab')add(2,'keeps hands off',3);}
  // the crowd
  const near=stanceNear(K,D);if(s==='bound'&&near)add(2,'two in reach',0);if(s==='close'&&near)add(-near,'tied up inside',0);
  // what each holds whatever he does: Close's hilt and spine (+1 to hit) once he is in reach; a whip is no guard (Parry -1, Counter
  // -2), and it holds off one man while the rest come in
  if(s==='close'&&g<=STN.tip)add(1,'hilt and spine',0);
  if(s==='unbound'){add(-1,'no guard',0);const others=foes().filter(o=>o!==D&&upright(o)&&!o.walkIn).length;if(others)add(-others,'one at a time',0);}
  return F;}
function stanceScore(K,D,s){return stanceFactors(K,D,s).reduce((a,f)=>a+f.v,0);}
// the best (a tie keeps the one he holds); null when they are all the same
function stanceMatch(K,D){if(!D||D.downed||D.dead)return null;const cur=stanceOf(K),sc={};for(const s of STANCE_ORDER)sc[s]=stanceScore(K,D,s);
  const best=Math.max(...STANCE_ORDER.map(s=>sc[s]));if(STANCE_ORDER.every(s=>sc[s]===best))return null;return sc[cur]===best?cur:STANCE_ORDER.find(s=>sc[s]===best);}
function stanceWorst(K,D){if(!D||D.downed||D.dead)return null;const sc={};for(const s of STANCE_ORDER)sc[s]=stanceScore(K,D,s);
  const lo=Math.min(...STANCE_ORDER.map(s=>sc[s]));return STANCE_ORDER.find(s=>sc[s]===lo);}
// the first test's match: the weapon and the crowd alone
function stanceMatchWeapon(K,D){if(!D||D.downed||D.dead)return null;const near=stanceNear(K,D);
  if(D.weaponKey==='spear')return near?'bound':lashGap(K,D)<STN.unboundMin?'close':'unbound';
  if(stanceHeavy(D))return near>1?'bound':'close';
  return'bound';}
function stanceAuto(K){const p=STANCE.policy,D=targetOf(K);if(p==='bound'||p==='unbound'||p==='close')return p;
  return p==='worst'?stanceWorst(K,D):p==='weapon'?stanceMatchWeapon(K,D):p==='ev'?stanceMatchEV(K,D):stanceMatch(K,D);}
// ---------- the dice behind a stance (policy 'ev', under test against the factors) ----------
// What a blow is worth on average: its chance to land (a crit counts twice) times its mean damage.
function stnWorth(A,D,kind,T){const c=computeMods(A,D,kind,false,T),dz=T.dice||A.wp.dice;let h=0;
  for(let r=2;r<=20;r++){const t=r+c.bonus;h+=isCrit(r,t,c.def)?2:(r===20||t>=c.def)?1:0;}
  return h/20*(dz[0]*(dz[1]+1)/2+dz[2])*ACTIONS[kind].mult*T.dmg*(A.posture==='off'&&!T.recov?.75:1)*(A.hench?CREW.dmg:1);}
// his best blow on D in stance s, per 100 tempo with the walk in, the second man of a two-man stroke counted and a stop-hit on the
// way in taken off
function stnOffense(K,D,s){return stanceAs(K,s,()=>{let best=0;for(const k of ATTACKS){if(!cmdValid(K,D,k))continue;const T=pickTechnique(K,D,k);
    let v=stnWorth(K,D,k,T);if(T.multi&&T.multi.D2)v+=stnWorth(K,T.multi.D2,k,secondaryTech(T));
    if(stopHitFor(K,D,k))v-=stnWorth(D,K,'thrust',pickTechnique(D,K,'thrust'));
    best=Math.max(best,v*100/Math.max(40,actionCost(K,k,moveCost(K,D,k))+approachCost(K,D,k)));}return best;});}
// what the blows shown on him are worth, each from where it would come, less the stop-hit he meets a man with on the way in
function stnDefense(K,s){return stanceAs(K,s,()=>{let v=0;for(const E of foes()){const it=E.intent;
    if(!it||it.tgt!==K.idx||E.downed||E.dead||E.walkIn||!ATTACKS.includes(it.cmd))continue;
    const was=E._came;E._came={turn:S.game.turnNo,D:K,far:comesFar(E,K),inside:comesInside(E,K)};
    try{v+=stnWorth(E,K,it.cmd,pickTechnique(E,K,it.cmd));if(stopHitFor(E,K,it.cmd))v-=stnWorth(K,E,'thrust',pickTechnique(K,E,'thrust'));}
    finally{E._came=was;}}return v;});}
const STN_EV={def:1};
function stanceEV(K,D,s){return stnOffense(K,D,s)-STN_EV.def*stnDefense(K,s);}
function stanceMatchEV(K,D){if(!D||D.downed||D.dead)return null;const cur=stanceOf(K),sc={};for(const s of STANCE_ORDER)sc[s]=stanceEV(K,D,s);
  const best=Math.max(...STANCE_ORDER.map(s=>sc[s]));if(sc[cur]>=best-.05)return cur;return STANCE_ORDER.find(s=>sc[s]===best);}
// the strongest reason now, for or against (the stance bar shows each stance's), and the strongest for (the marked one's)
function stanceTop(K,D,s){const F=stanceFactors(K,D,s);if(!F.length)return null;F.sort((a,b)=>Math.abs(b.v)-Math.abs(a.v)||b.k-a.k||b.v-a.v);return F[0];}
function stanceReason(K,D,s){const F=stanceFactors(K,D,s).filter(f=>f.v>0).sort((a,b)=>b.v-a.v||b.k-a.k);return F.length?F[0].short:'';}
// ===== STANCES (test) END =====
