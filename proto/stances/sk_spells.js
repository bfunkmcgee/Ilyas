// ===== SPELLS (test) START =====
// The third rule under test: new spells for Ilyas's Aether, read like the stances by the man's weapon, how far off he is and the
// blow he shows. The gilt is Ranger gilt (the light the Rangers inked into him), and the lore's battery heat is its price.
//   Gilt ward  an answer in the window as his blow comes: a disc of gilt on the off forearm, best against an Overhead and a Cut,
//              less against a Thrust, nothing against a Sweep; an axe cracks it. 1 Aether.
//   Glare      a flash in the eyes of a man in his face: till he has acted his blows are at -3 (a Thrust -4) and his defence
//              against Ilyas at -2. Out of reach the light does not carry. 1 Aether, 50 tempo.
//   Gilt line  a thread of light to a man who holds off and a yank, rolled like the Gale: he lands where Ilyas's stance strikes
//              best, off balance; a man who holds comes half way. 2 Aether, 80 tempo, a pip of balance.
//   Gilt edge  free on his turn, once a turn: the gilt runs down the blade till his next turn, shaped by the stance (Bound +1 and
//              through a guard, Unbound's tip burns, Close's hilt sears). 1 Aether.
//   Overdrive  a spell cast on his turn may go one or two Aether short: the gilt burns 8 health for each point missing.
// SPELL2.on false leaves today's three spells and no Overdrive.
const SPELL2={on:true};
const SPELL_NEW=['glare','line','edge'];
SPELLS.glare={name:'Glare',cost:1,tempo:50,foot:0,key:'r'};
SPELLS.line={name:'Gilt line',cost:2,tempo:80,foot:1,key:'l'};
SPELLS.edge={name:'Gilt edge',cost:1,tempo:0,foot:0,key:'g'};
for(const k of SPELL_NEW){ACTIONS[k]={name:SPELLS[k].name,cost:SPELLS[k].tempo};FOOT_COST[k]=SPELLS[k].foot;}
// reach: how far past his striking distance the light carries (lashGap); blow, thrust: his blows while dazzled; def: his defence
const GLARE={reach:STN.tip,blow:-3,thrust:-4,def:-2,dz:50};
// min: the line is for a man past this (lashGap); max: how long it runs; dz: how far off the line he may stand; pull: the line's own
// part of the roll; to: where he lands for each stance, as lashGap
const LINE={min:STN.tip,max:340,dz:60,pull:3,to:{bound:0,close:-24,unbound:STN.tip+12}};
// hit: Bound's edge to hit; through: what a blocked Bound blow still cuts, of its weight; near: how much nearer Unbound's tip starts;
// tipDmg: what a tip blow burns on top
const EDGE={hit:1,through:1/3,near:30,tipDmg:3};
const WARD={slash:4,thrust:2,overhead:5,sweep:0,heavy:-2,cost:1};
const OVERDRIVE={hp:8,max:2};
REACT_DEF.ward={slash:WARD.slash,thrust:WARD.thrust,overhead:WARD.overhead,sweep:WARD.sweep};
REACT_NAME.ward='Ward';

// ---------- Overdrive: the gilt burned for the Aether he does not have ----------
function aetherShort(A,k){const s=SPELLS[k];return s&&A?Math.max(0,s.cost-(A.aether||0)):0;}
function overdriveOK(A,k){const n=aetherShort(A,k);return SPELL2.on&&n>0&&n<=OVERDRIVE.max&&!!A&&A.hp>n*OVERDRIVE.hp;}
function overdriveBurn(A,n){const hp=n*OVERDRIVE.hp;A.hp=Math.max(1,A.hp-hp);A.flare=1.8;A.overdriveT=S.t;
  popup(A,'Overdrive','#ff9a5c',`−${hp} health`,19,-70);
  if(!S.warming){const c=A.p[CHE];addMotes(c.x,c.y,A.dep,12,{spread:70,vy:-60,cyan:0});flash({x:c.x,y:c.y},30,'#ff9a5c',A.dep);}
  if(S.hooks.overdrive)S.hooks.overdrive(A,hp);S.hooks.status();}
// the store is checked as if it held the spell's cost when Overdrive covers the rest; every other rule stands as it is
{const so=spellOK;spellOK=function(A,D,k){
  if(SPELL_NEW.includes(k)&&!SPELL2.on)return false;
  if(!A||!SPELLS[k])return so.apply(this,arguments);
  const a=A.aether||0;if(overdriveOK(A,k))A.aether=SPELLS[k].cost;
  try{if(!so.apply(this,arguments))return false;}finally{A.aether=a;}
  if(k==='glare')return glareOK(A,D);
  if(k==='line')return lineOK(A,D);
  if(k==='edge')return edgeOK(A);
  return true;};}
{const cs=castSpell;castSpell=function(A,D,k,ex){const short=aetherShort(A,k);
  if(k==='glare'||k==='line'){const s=SPELLS[k];A.aether=Math.max(0,(A.aether||0)-s.cost);A.flare=1.4;A.castT=S.t;beginAction(A,k,ex.chain||null);
    if(k==='glare')launchGlare(A,D,ex);else launchLine(A,D,ex);}
  else cs.apply(this,arguments);
  if(short>0)overdriveBurn(A,short);};}
// Gilt edge is lit, never a command: his turn goes on
{const cv=cmdValid;cmdValid=function(A,D,cmd){if(cmd==='edge')return false;return cv.apply(this,arguments);};}
// a spell turn's log entry for the new spells (the page writes it)
function spell2Log(A,D,ex,spell,extra){S.hooks.log({type:'spell2',spell,A,D,ex,...(extra||{})});}

// ---------- Glare ----------
function glareOK(A,D){return!!D&&!D.downed&&!D.dead&&!D.glare&&lashGap(A,D)<=GLARE.reach&&Math.abs(D.lane-A.lane)<=GLARE.dz&&!facingAway(D,A);}
function glareMod(kind){return kind==='thrust'?GLARE.thrust:GLARE.blow;}
function launchGlare(A,D,ex){const fa=Math.sign(D.station-A.station)||A.facing,arm=A.arm,Tc=.16,Tend=Tc+.4;A.facing=fa;
  const g=GUARD[A.weaponKey]||GUARD.sword,palm={hand:{sh:[.04*arm,.16*arm]},wAng:g.w+.2,off:{sh:[.85*arm,-.46*arm]},tilt:.06};
  const body=[{t:0,v:{...A.curBody}},{t:Tc,v:()=>({...A.guardBody(),crouch:.84,lean:.14}),e:eOut},{t:Tend,v:()=>A.guardBody(),e:sstep}];
  const armK=[{t:0,v:{...A.curArm}},{t:Tc,v:palm,e:eOut},{t:Tc+.18,v:palm},{t:Tend,v:()=>A.guardArm(),e:sstep}];
  const events=[{t:Tc-.06,fn:()=>glyphAt(A,HAB,.24)},{t:Tc,fn:()=>glareHit(A,D,ex)}];
  A.action={t0:S.t,end:Tend,body,arm:armK,spell:true};
  ex.res={kind:'magic',out:'hit',tech:{name:'Glare',why:'A flash of gilt off the palm, in his eyes: till he has acted he swings blind and cannot see a blow coming.'}};
  ex.plan={att:A.action,events,Tend:Tend+.1,strikeX:A.station,dir:fa,Cfn:()=>({x:D.p[HEAD].x,y:D.p[HEAD].y}),glare:true};ex.dur=Tend+.45;ex.perf={dash:0};
  spell2Log(A,D,ex,'glare');}
function glareHit(A,D,ex){if(D.dead||A.dead)return;D.glare={by:A,t:S.t,acted:false};const h=D.p[HEAD];
  if(!S.warming){flash({x:h.x,y:h.y},44,'#fff1c9',D.dep);addMotes(h.x,h.y,D.dep,8,{spread:40,vy:-20,life:.4,cyan:0});
    (S.glares=S.glares||[]).push({A,D,t0:S.t,life:.32});}
  const it=D.intent,blow=it&&it.tgt===A.idx&&ATTACKS.includes(it.cmd)?it.cmd:null;
  popup(D,'Dazzled','#ffe299',blow?`his ${ACTIONS[blow].name} at ${glareMod(blow)}`:'blind till he acts',20,-30);
  S.hooks.sound('blink',.5);if(S.hooks.spell2)S.hooks.spell2(ex,{D,label:'dazzled'});S.hooks.status();}
// he swings blind, and cannot see Ilyas's blows coming, till he has acted (his own move, whatever it is)
{const cm=command;command=function(i,cmd,opts){const f=S.F[i];if(f&&f.glare&&f!==f.glare.by)f.glare.acted=true;return cm.apply(this,arguments);};}
V11.exchangeEnd.push(()=>{for(const f of S.F)if(f.glare&&(f.glare.acted||f.dead))f.glare=null;});

// ---------- Gilt line ----------
function lineOK(A,D){if(!D||D.downed||D.dead||D.clinch||D.mount||A.mount)return false;const g=lashGap(A,D),d=Math.abs(D.station-A.station);
  return g>=LINE.min&&d<=LINE.max&&Math.abs(D.lane-A.lane)<=LINE.dz&&!tableBetween(A,D)&&!(S.divs.length&&divBetween(A,D));}
function lineMods(A,D){const mods=[['skill',A.skill],['the line',LINE.pull],[footLabel(A),post(A).atk]];
  const defMods=[[post(D).name.toLowerCase(),post(D).resist],['guard',D.guarding?2:0],['weight',Math.round((D.body.bulk-1)*4)],['dazed',D.daze?-2:0]];
  return{mods,bonus:sumMods(mods),dc:9+D.skill+sumMods(defMods),defMods};}
// where he lands: where Ilyas's stance strikes best (at blade's length, in his chest, out on the tip)
function lineTo(A,D){const s=stanceOf(A)||'bound',fa=Math.sign(D.station-A.station)||A.facing;return A.station+fa*(engageGap(A,D)+LINE.to[s]);}
function launchLine(A,D,ex){const fa=Math.sign(D.station-A.station)||A.facing,arm=A.arm,Tc=.2,Ty=Tc+.24,Tend=Ty+.42;A.facing=fa;
  const g=GUARD[A.weaponKey]||GUARD.sword,cast={hand:{sh:[.06*arm,.16*arm]},wAng:g.w+.2,off:{sh:[.95*arm,-.24*arm]},tilt:.1},pull={hand:{sh:[.1*arm,.12*arm]},wAng:g.w,off:{sh:[-.12*arm,-.12*arm]},tilt:-.14};
  const body=[{t:0,v:{...A.curBody}},{t:Tc,v:()=>({...A.guardBody(),crouch:.82,lean:.26,stF:.46*A.leg,stB:-.38*A.leg}),e:eOut},{t:Ty,v:()=>({...A.guardBody(),crouch:.8,lean:-.18,stF:.4*A.leg,stB:-.42*A.leg}),e:eOut},{t:Tend,v:()=>A.guardBody(),e:sstep}];
  const armK=[{t:0,v:{...A.curArm}},{t:Tc,v:cast,e:eOut},{t:Ty-.04,v:cast},{t:Ty,v:pull,e:eOut},{t:Tend,v:()=>A.guardArm(),e:sstep}];
  const roll=rollVs(lineMods(A,D),{kind:'line'});
  const events=[{t:Tc-.06,fn:()=>glyphAt(A,HAB,.3)},{t:Tc,fn:()=>{if(!S.warming)(S.lines=S.lines||[]).push({A,D,t0:S.t,ty:null,life:.5});S.hooks.sound('bolt',.5);}},
    {t:Ty,fn:()=>lineYank(A,D,roll,fa,ex)}];
  A.action={t0:S.t,end:Tend,body,arm:armK,spell:true};
  ex.res={kind:'magic',out:roll.ok?'hit':'block',tech:{name:'Gilt line',why:'A thread of gilt from the hand to his chest, and a yank: he comes to where the stance strikes best, off balance.'}};
  ex.plan={att:A.action,events,Tend:Tend+.15,strikeX:A.station,dir:fa,Cfn:()=>({x:D.p[CHE].x,y:D.p[CHE].y}),line:true};ex.dur=Tend+.6;ex.perf={dash:0};ex.lineRoll=roll;
  spell2Log(A,D,ex,'line',{roll});}
function lineYank(A,D,roll,fa,ex){const L=(S.lines||[]).find(l=>l.A===A&&l.D===D&&l.ty==null);if(L)L.ty=S.t;
  if(D.dead||A.dead||D.downed)return;const from=D.station,to=lineTo(A,D),x=roll.ok?to:lerp(from,to,.5);
  D.station=clampSt(D,x);const k=roll.ok?1:.5,m=1/Math.sqrt(D.body.mass);
  for(let i=0;i<D.p.length;i++){if(i===TIP)continue;const q=D.p[i],low=i===FTF||i===FTB||i===KNF||i===KNB;q.px+=fa*(low?130:230)*k*m*DT;q.py+=(low?0:24)*DT;}
  knockBalance(D,roll.ok?2:1,A);D.motor=Math.min(D.motor,.55);
  popup(D,roll.ok?'Pulled in':'Holds the line','#ffe299',roll.ok?'two pips of balance':'a pip of balance',20,-20);
  if(!S.warming){dust(D.p[FTF].x,D.gr(D.p[FTF].x),1.1,D.dep);const c=D.p[CHE];addMotes(c.x,c.y,D.dep,8,{spread:60,vx:-fa*90,vy:-20,life:.35});}
  resolveStations();S.hooks.sound('gale',.4);
  ex.lineOut={ok:roll.ok,moved:Math.round(Math.abs(D.station-from))};if(S.hooks.spell2)S.hooks.spell2(ex,{D,label:roll.ok?'pulled in':'held the line',moved:ex.lineOut.moved});S.hooks.status();}

// ---------- Gilt edge ----------
function edgeStance(A){return stanceOf(A)||'bound';}
function edgeOK(A){return SPELL2.on&&!!A&&A===hero()&&mage(A)&&!A.edge&&!A.downed&&!A.clinch&&!A.dead&&!(A.wp&&A.wp.gun)&&A.weaponKey==='elven'&&
  ((A.aether||0)>=SPELLS.edge.cost||overdriveOK(A,'edge'));}
// lit on his turn, before he acts: free, and it lasts till his next turn
function lightEdge(A){const g=S.game;if(!edgeOK(A)||g.phase!=='input'||g.active!==A.idx||S.opening)return false;const short=aetherShort(A,'edge');
  A.aether=Math.max(0,(A.aether||0)-SPELLS.edge.cost);A.edge={t:S.t,turn:g.turnNo};A.flare=1.2;A.castT=S.t;glyphAt(A,HAB,.3);
  popup(A,'Gilt edge','#ffe299',{bound:'+1, through a guard',unbound:'the tip burns',close:'the hilt sears'}[edgeStance(A)],18,-62);
  S.hooks.sound('blink',.35);if(short)overdriveBurn(A,short);S.hooks.status();return true;}
V11.turnStart.push(i=>{const f=S.F[i];if(f&&f===S.F[0]&&f.edge)f.edge=null;});
V11.duelStart.push(()=>{for(const f of S.F){f.edge=null;f.glare=null;f.wardT=null;f.wardHitT=null;}S.lines=[];S.glares=[];});
// Unbound: the burning tip reaches nearer in
{const wt=whipTip;whipTip=function(A,D){if(A&&A.edge&&A===hero()&&edgeStance(A)==='unbound'&&D)return lashGap(A,D)>=STN.tip-EDGE.near;return wt.apply(this,arguments);};}
{const ra=resolveAttack;resolveAttack=function(A,D,kind,opening,T){const r=ra.apply(this,arguments);
  if(A&&A.edge&&A===hero()&&r&&(r.out==='hit'||r.out==='crit')&&r.tech&&r.tech.whip&&r.tech.tip&&edgeStance(A)==='unbound'){r.dmg+=EDGE.tipDmg;r.edgeBurn=EDGE.tipDmg;}
  return r;};}

// ---------- the dice: Glare, the ward an axe cracks, Bound's edge ----------
{const cm=computeMods;computeMods=function(A,D,kind,opening,T){const c=cm.apply(this,arguments);
  if(A&&A.glare&&ATTACKS.includes(kind)&&D===A.glare.by){const v=glareMod(kind);c.bonus+=v;c.mods.push(['dazzled',v]);}
  if(D&&D.glare&&A&&A===D.glare.by&&!D.downed&&ATTACKS.includes(kind)){c.def+=GLARE.def;c.defMods.push(['dazzled',GLARE.def]);}
  if(D&&D.react==='ward'&&A&&!D.downed&&stanceHeavy(A)&&ATTACKS.includes(kind)){c.def+=WARD.heavy;c.defMods.push(['the ward cracks',WARD.heavy]);}
  if(A&&A.edge&&A===hero()&&ATTACKS.includes(kind)&&edgeStance(A)==='bound'){c.bonus+=EDGE.hit;c.mods.push(['gilt edge',EDGE.hit]);}
  return c;};}
// what lands: Bound's edge cuts through a guard, Close's hilt sears, the ward flares
{const ai=applyImpact;applyImpact=function(ex,A,D,res,Cfn,cv,slip,fa,primary){const warded=D&&D.react==='ward',r=ai.apply(this,arguments);
  if(warded&&D&&res){D.wardHitT=S.t;if(!S.warming){const h=D.p[HAB];sparks({x:h.x,y:h.y},10,'#ffe299',D.dep);}}
  if(primary&&A&&A.edge&&A===hero()&&D&&!D.dead&&A.team!==D.team&&res&&ATTACKS.includes(res.kind)){const s=edgeStance(A);
    if(s==='bound'&&res.out==='block'&&!res.guardBreak){const T=res.tech||{},dz=T.dice||A.wp.dice,
        dmg=Math.max(2,Math.round((dz[0]*(dz[1]+1)/2+dz[2])*ACTIONS[res.kind].mult*(T.dmg||1)*EDGE.through));
      D.hp=Math.max(0,D.hp-dmg);popup(D,String(dmg),'#ffe299','through the guard',22,-14);res.edgeThrough=dmg;
      if(!S.warming){const c=Cfn?Cfn():D.p[CHE];sparks(c,14,'#ffe299',D.dep);}
      if(D.hp<=0)kill(D,fa||A.facing);}
    else if(s==='close'&&(res.out==='hit'||res.out==='crit')&&!D.downed&&D.hp>0){D.daze=1;res.edgeSear=true;popup(D,'Seared','#ffb347','dazed',18,-62);}}
  return r;};}

// ---------- Gilt ward: an answer of its own in the window ----------
let SPELL_NOWARD=false;
function wardOK(D){return SPELL2.on&&!SPELL_NOWARD&&!!D&&mage(D)&&(D.aether||0)>=WARD.cost&&!(D.wp&&D.wp.gun);}
{const rc=reactChoices;reactChoices=function(D,A){const ch=rc.apply(this,arguments);return wardOK(D)?[...ch,'ward']:ch;};}
{const ar=applyReaction;applyReaction=function(D,k,A){ar.apply(this,arguments);
  if(k==='ward'){D.aether=Math.max(0,(D.aether||0)-WARD.cost);D.wardT=S.t;D.flare=Math.max(D.flare||0,1.1);if(!S.warming)glyphAt(D,HAB,.3);}};}
// Ilyas on auto wards when it is plainly his best answer (ten points better than his own read's pick), keeping one Aether in hand
// unless an Overhead is coming
{const ar=aiReact;aiReact=function(D,A,kind,T,opening){let k;SPELL_NOWARD=true;try{k=ar.apply(this,arguments);}finally{SPELL_NOWARD=false;}
  if(!wardOK(D))return k;const lw=reactLands(A,D,kind,opening,T,'ward'),lk=reactLands(A,D,kind,opening,T,k);
  return lw<=lk-.1&&((D.aether||0)>=2||kind==='overhead')?'ward':k;};}

// ---------- Ilyas on auto casts the new ones too ----------
// (the stance first, as the stances' own pick makes it, so the spells read the stance he will hold)
{const ac=aiChoice;aiChoice=function(i){const A=S.F[i];
  if(!SPELL2.on||!A||A!==hero()||!isAI(i)||!mage(A)||A.downed||A.clinch||(A.wp&&A.wp.gun))return ac.apply(this,arguments);
  if(stanceOn(A)&&stanceCanSwitch(A)){const s=stanceAuto(A);if(s)setStance(A,s);}
  const D=targetOf(A);if(!D||D.dead||D.downed)return ac.apply(this,arguments);
  const a=A.aether||0,ok=k=>cmdValid(A,D,k),r=S.rng(),it=D.intent,shows=it&&it.tgt===A.idx&&ATTACKS.includes(it.cmd)?it.cmd:null;
  // a man who holds off with the longer reach comes in on the line
  if(a>=2&&ok('line')&&(outreaches(D,A)||D.temper==='keeper')&&r<.45)return'line';
  // a man in his face gearing up a blow the stance gives way to, or a thrust: Glare
  if(a>=1&&shows&&ok('glare')){const st=stanceOf(A),v=st?stnVs(A,D,D,st,shows):null;if((!v||v.v<=0||shows==='thrust')&&r<.5)return'glare';}
  // Overdrive, while he is well: a Gale at two or more, or the bolt that kills
  if(A.hp>A.maxHp*.5){const gt=galeTargets(A,D).filter(o=>!o.downed);
    if(a<SPELLS.gale.cost&&gt.length>=2&&ok('gale')&&r<.4)return'gale';
    if(a<SPELLS.bolt.cost&&D.hp<=14&&Math.abs(D.station-A.station)>engageGap(A,D)+60&&ok('bolt')&&r<.6)return'bolt';}
  // the edge, lit before he acts, with the Aether to spare
  if(a>=3&&edgeOK(A)&&S.rng()<.5)lightEdge(A);
  return ac.apply(this,arguments);};}
// ===== SPELLS (test) END =====
