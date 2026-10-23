// Forced tests for V12, the executive and the last scene (headless): his seat through whole office fights, the scene's beats and their
// timing, the choice (waits, spare, behead, gore off, auto), Amri, and a restart at every stage. Ends with "errors 0 []".
const core=require('./sk_src.js')(process.argv[2]);
eval(core+`
const errs=[],rep=[];let base=mulberry32(29);S.rng=()=>base();
const GORE0=S.gore,HF0=S.hooks.finale,ORDER=['settle','walk','reach','slam','haul','drop','kneel','choice'];
function expect(label,cond,info){rep.push((cond?'ok   ':'FAIL ')+label+(info?'  '+info:''));if(!cond)errs.push(label+(info?' ('+info+')':''));}
let snd=[],logs=[],hooks=[],overs=0,won=null,overText=null,overAt=null;
function setup(o={}){S.arenaKey='restaurant';S.auto=!!o.auto;S.allyAuto=!!o.ally;S.tableOn=true;S.divOn=true;S.showcase=false;S.backroom=true;S.deep=true;
  S.cfg.n=1;S.cfg.crew=false;S.introOn=false;S.cfg.ally={on:!!o.ally,seed:6427,weapon:'spear',skill:3};S.cfg.hero={seed:o.hero||2207,weapon:'elven',skill:4};S.gore=o.gore||GORE0;
  S.F=[];rosterBuild();initDuel();
  snd=[];logs=[];hooks=[];overs=0;won=null;overText=null;overAt=null;
  S.hooks.sound=(k,v)=>snd.push({k,t:S.t});S.hooks.log=e=>logs.push(e);
  S.hooks.over=w=>{overs++;won=w;overText=S.endText;overAt=S.t;};
  S.hooks.finale=(k,F)=>{hooks.push({k,t:S.t});HF0(k,F);};}
function clearRoomQuick(){const K=S.F[0];K.hp=K.maxHp;if(S.crew)S.crew.queue.length=0;for(const f of foes()){f.hp=0;kill(f,1);}
  S.game.ex=null;if(nextRoom()){beginTransit();let n=0;for(;n<120*60&&!(S.game.phase==='input'&&!S.stage.tr&&S.room!=='dining');n++){simStep();}}}
const toOffice=()=>{clearRoomQuick();clearRoomQuick();clearRoomQuick();return S.room==='office';};
const nan=()=>S.F.some(f=>!f.gone&&!Number.isFinite(f.p[PEL].x+f.p[HEAD].y+f.p[TIP].x+f.p[KNF].y+f.p[FTB].x));
const near=(a,b,d)=>Math.abs(a-b)<=d;
const inTop=(p,D)=>p.x>D.x0+2&&p.x<D.x1-2&&p.y>D.top+1.2&&p.y<D.top+2*D.rad-1.2;

// ---------------- his seat through whole fights ----------------
for(const [seed,ally] of [[1,false],[2,false],[3,false],[4,true],[5,true],[6,false]]){
  base=mulberry32(seed*11+1);setup({auto:true,ally});toOffice();
  const K=S.F[0],X=S.F.find(f=>f.npc),D=deskInfo();K.maxHp=K.hp=420;
  for(let i=0;i<120;i++)simStep();const sp=X.p[PEL],seat={x:sp.x,y:sp.y};let n=0,samples=0,worst={pel:0,feet:0,head:-1e9,top:0,motor:1,dep:0,nan:false},ends='';
  for(;n<120*80&&S.game.phase!=='over'&&S.game.phase!=='finale';n++){simStep();tickOpening(DT*3);
    if(nan()){worst.nan=true;break;}
    if(n%15===0){samples++;const p=X.p;
      worst.pel=Math.max(worst.pel,Math.hypot(p[PEL].x-seat.x,p[PEL].y-seat.y));
      worst.feet=Math.max(worst.feet,GB-Math.min(p[FTF].y,p[FTB].y));
      worst.head=Math.max(worst.head,p[HEAD].y-(p[CHE].y-8));
      worst.top+=p.filter(q=>inTop(q,D)).length;worst.motor=Math.min(worst.motor,X.motor);worst.dep=Math.max(worst.dep,Math.abs(X.dep-EXEC_SEAT.d));}}
  const tag=(ally?'with Amri, ':'solo, ')+'seed '+seed+', '+(n/120).toFixed(0)+' s, '+samples+' samples';
  expect('the seat holds: pelvis near it ('+tag+')',samples>20&&worst.pel<=22,worst.pel.toFixed(1)+' px');
  expect('feet stay on the floor',worst.feet<=9,worst.feet.toFixed(1));
  expect('head stays above the chest',worst.head<0,worst.head.toFixed(1));
  expect('no point inside the desk top',worst.top===0,worst.top);
  expect('motor stays at 1, depth at the seat',worst.motor>.99&&worst.dep<4,worst.motor+' '+worst.dep.toFixed(1));
  expect('no NaN, he is never part of the turns',!worst.nan&&turnOrder(24).every(i=>!S.F[i].npc));}

// ---------------- the scene, played ----------------
// runs the last scene from the head of security's fall: opts {seed,ally,gore,choice,wait,auto,len,hero,probe}
function runScene(o){
  base=mulberry32(o.seed||3);setup({ally:o.ally,gore:o.gore,auto:o.auto,hero:o.hero});toOffice();
  const K=S.F[0],B=S.F.find(f=>f.boss),X=S.F.find(f=>f.npc),M=S.F.find(f=>f.ally)||null,D=deskInfo(),chair=S.props.find(p=>p.type==='execchair');
  const chair0=chair?chair.pts.map(q=>({x:q.x,y:q.y})):[];
  B.hp=0;kill(B,1);S.game.ex=null;S.finaleDone=true;S.game.phase='exchange';
  beginFinale();
  const F=S.finale,R={K,B,X,M,D,F,tl:[],snaps:{},seen:[],lines:[],T0:S.t,early:0,tops:0,nan:false,peak:{freeze:0,shake:0,slow:0},chosenAt:null,choiceAt:null,phases:new Set(),kx:0,wares:0,chair:0,bad:[]};
  if(o.stuff){addWare('glass',D.P,D.x1-14,0);addWare('bottle',D.P,D.x0+22,6);addWare('plate',D.P,D.x0+34,-6);R.lamp=addLamp(DESK.x+6,DESK.d,286,'pendant');}
  const wares0=S.wares.filter(w=>w.host===D.P).map(w=>({w,x:w.x,y:w.y}));
  let last='',asked=false,n=0,tNext=0;
  for(;n<120*(o.len||45);n++){
    simStep();if(o.auto)tickOpening(DT*3);
    const t=S.t-R.T0;
    if(nan()){R.nan=true;break;}
    R.phases.add(S.game.phase);
    if(F.step!==last){last=F.step;R.tl.push({step:last,t});
      if(last==='choice'){R.choiceAt=S.t;R.snaps.choice={t,p:X.p.map(q=>({x:q.x,y:q.y})),K:{x:K.p[PEL].x,y:K.p[PEL].y},M:M?{x:M.p[PEL].x}:null,endText:S.endText,overs};
        if(chair)R.chair=Math.max(...chair.pts.map((q,i)=>Math.hypot(q.x-chair0[i].x,q.y-chair0[i].y)));
        R.wares=wares0.filter(e=>Math.hypot(e.w.x-e.x,e.w.y-e.y)>1.5||e.w.rest===0).length;}}
    for(const c of S.callouts)if(c.fin&&!R.seen.includes(c)){R.seen.push(c);R.lines.push({text:c.text,t,big:!!c.big});}
    R.peak.freeze=Math.max(R.peak.freeze,S.freeze);R.peak.shake=Math.max(R.peak.shake,S.shake);R.peak.slow=Math.max(R.peak.slow,S.slowT);
    if(!X.dead)for(const q of X.p)if(inTop(q,D))R.tops++;
    if(F.fx.slam&&!R.snaps.hit)R.snaps.hit={hd:{x:X.p[HEAD].x,y:X.p[HEAD].y},t,lamp:R.lamp?R.lamp.flick:0};
    if(F.fx.cut&&R.cutOut==null)R.cutOut=S.callouts.filter(c=>c.i===X.idx).length;
    if(K.p[PEL].x>OFFICE.maxX+2)R.kx++;
    // asking for the choice early does nothing
    if(F.step!=='choice'&&F.step!=='spare'&&F.step!=='behead'&&F.step!=='done'&&n%30===0){if(finaleChoose('spare')||finaleChoose('behead'))R.early++;}
    if(F.step==='choice'&&o.choice&&!asked&&S.t-R.choiceAt>=(o.wait||0)){asked=true;R.chosenAt=S.t;finaleChoose(o.choice);}
    if(o.stopAt!=null&&t>=o.stopAt)break;
    if(S.game.phase==='over'&&S.t-overAt>.6)break;
    if(o.probe)o.probe(R,t,n);
  }
  R.end=S.t-R.T0;return R;}
const order=R=>R.tl.map(e=>e.step);
const at=(R,s)=>{const e=R.tl.find(e=>e.step===s);return e?e.t:null;};

// the beats come in order and in time (a spare)
{const R=runScene({seed:3,choice:'spare'}),o=order(R);
  expect('the beats come in order',ORDER.every((s,i)=>o[i]===s)&&o[8]==='spare'&&o[9]==='done',o.join(' '));
  const tc=at(R,'choice');
  expect('the choice is asked 7 to 10 s after the fall',tc>=7&&tc<=10,tc&&tc.toFixed(2));
  expect('each beat has its time: settle, walk, slam, haul, drop',at(R,'walk')>=.5&&at(R,'walk')<=2.6&&at(R,'reach')>at(R,'walk')+.5&&at(R,'slam')>at(R,'reach')+.1&&at(R,'haul')>at(R,'slam')+.25&&at(R,'drop')>at(R,'haul')+.8&&at(R,'kneel')>at(R,'drop')+.4&&tc>at(R,'kneel')+1.5,
    ORDER.map(s=>s+' '+(at(R,s)||0).toFixed(1)).join(', '));
  expect('the phase is finale all the way to the end',R.phases.has('finale')&&S.game.phase==='over',[...R.phases].join());
  expect('it starts once, asks once, ends once',hooks.filter(h=>h.k==='begin').length===1&&hooks.filter(h=>h.k==='choice').length===1&&hooks.filter(h=>h.k==='end').length===1&&hooks.findIndex(h=>h.k==='chosen')>hooks.findIndex(h=>h.k==='choice'),hooks.map(h=>h.k).join(' '));
  expect('his line comes first, in the settle beat',R.lines.length>=1&&R.lines[0].text==="Do you know what that man cost me?"&&R.lines[0].t<at(R,'walk'),R.lines[0]&&R.lines[0].text);
  expect('he begs, two or three short lines, one after another, on his knees',R.lines.length===4&&R.lines.slice(1).every((l,i)=>l.t>at(R,'kneel')-.01&&l.text.length<45&&(i===0||l.t>R.lines[i].t+.8)),R.lines.map(l=>l.text+'@'+l.t.toFixed(1)).join(' | '));
  expect('asking early does nothing',R.early===0,R.early);
  expect('the slam: a hit stop, a shake, thud and crit',R.peak.freeze>=.05&&R.peak.shake>=8&&snd.some(s=>s.k==='thud'&&Math.abs(s.t-R.T0-at(R,'slam'))<.5)&&snd.some(s=>s.k==='crit'&&Math.abs(s.t-R.T0-at(R,'slam'))<.5),'freeze '+R.peak.freeze.toFixed(2)+' shake '+R.peak.shake.toFixed(0)+' '+snd.map(s=>s.k+'@'+(s.t-R.T0).toFixed(1)).join(' '));
  expect('his face meets the top of the desk',R.snaps.hit&&near(R.snaps.hit.hd.y,R.D.top-R.X.body.headR,9)&&R.snaps.hit.hd.x>R.D.x0&&R.snaps.hit.hd.x<R.D.x1,R.snaps.hit&&JSON.stringify(R.snaps.hit.hd)+' top '+R.D.top);
  expect('the papers and the tumbler jump',!S.wares.some(w=>w.host===R.D.P)||R.wares>0,R.wares+' of '+S.wares.filter(w=>w.host===R.D.P).length);
  expect('his chair is shoved away',!S.props.some(p=>p.type==='execchair')||R.chair>12,R.chair.toFixed(0)+' px');
  expect('nobody is put through the desk',R.tops===0,R.tops);
  expect('Kael stays inside the stage (no entering flag needed)',R.kx===0&&!R.K.entering,R.kx);
  const c=R.snaps.choice,D=R.D,kn=Math.max(...[KNF,KNB].map(i=>GB-c.p[i].y));
  expect('he is on his knees left of the desk when asked',c.p.every(q=>q.x<D.x0)&&kn<=13&&c.p[HEAD].y<c.p[PEL].y-18,'max x '+Math.max(...c.p.map(q=>q.x)).toFixed(0)+' knees '+kn.toFixed(1)+' above floor, head '+(c.p[PEL].y-c.p[HEAD].y).toFixed(0)+' over the pelvis');
  expect('feet and shins are on the floor behind him, torso up',c.p[FTF].y>GB-13&&c.p[FTB].y>GB-13&&c.p[CHE].y<c.p[PEL].y-25,'chest '+(c.p[PEL].y-c.p[CHE].y).toFixed(0)+' over the pelvis');
  expect('Kael stands over him, facing him',c.K.x<c.p[PEL].x-30&&c.K.x>c.p[PEL].x-120,'gap '+(c.p[PEL].x-c.K.x).toFixed(0));
  expect('nothing has ended yet when he is asked',c.endText==null&&c.overs===0&&!R.X.dead,c.endText);
  expect('spared, he lives; not severed; the fight is won',!R.X.dead&&!R.X.severed&&won===true&&S.game.phase==='over'&&!R.K.dead,'dead '+R.X.dead);
  expect('endFight once, with the text already set',overs===1&&overText==='Mr. Hallowell is spared.'&&S.endText==='Mr. Hallowell is spared.',overs+' '+overText);
  const de=overAt-R.chosenAt;expect('the card comes 1.5 to 3 s after a spare',de>=1.5&&de<=3,de.toFixed(2));
  expect('the blade rolls back into its hilt',!!R.K.arcRoll&&snd.some(s=>s.k==='reroll'),JSON.stringify(R.K.arcRoll));
  expect('the log tells it',logs.filter(e=>e.type==='finale').map(e=>e.kind).join()==='down,begs,spare',logs.filter(e=>e.type==='finale').map(e=>e.kind).join());
  expect('no NaN, all ids in place',!R.nan&&S.F.every((f,i)=>f.idx===i),R.nan);
  expect('he is not a foe, still alive in the roster',!foes().includes(R.X)&&S.F.includes(R.X));}

// things on the desk: the stub desk has none, so a tumbler, a bottle, a plate and a lamp are put there
{const R=runScene({seed:3,choice:'spare',stuff:1,len:12});
  expect('the wares on the desk jump at the slam',R.wares>=3,R.wares+' of 3');
  expect('the lamp over the desk rocks',R.snaps.hit&&R.snaps.hit.lamp>0&&R.lamp.dead===0&&!R.lamp.fallen,R.snaps.hit&&R.snaps.hit.lamp);
  expect('the scene still finishes, no NaN',!R.nan&&order(R).includes('choice')&&S.game.phase==='over',order(R).join(' '));}

// the choice waits for the player: nothing ends, he keeps kneeling, 20 s on
{const R=runScene({seed:3,len:9,stopAt:8.7});const F=R.F,X=R.X,p0=X.p[PEL].x,y0=X.p[PEL].y;
  expect('without auto the scene stops at the choice',F.step==='choice'&&S.game.phase==='finale',F.step);
  let drift=0,steps=0;for(let n=0;n<120*20;n++){simStep();steps++;if(nan()){drift=1e9;break;}drift=Math.max(drift,Math.hypot(X.p[PEL].x-p0,X.p[PEL].y-y0));}
  expect('it waits 20 s and he is still there, on his knees, trembling',F.step==='choice'&&S.game.phase==='finale'&&overs===0&&S.endText==null&&drift<8&&!X.dead,'drift '+drift.toFixed(1)+' px, '+F.step);
  expect('a wrong answer does nothing',finaleChoose('dance')===false&&finaleChoose()===false&&F.step==='choice',F.step);
  expect('the panel state is there for the page',hooks.some(h=>h.k==='choice')&&!hooks.some(h=>h.k==='decide'),hooks.map(h=>h.k).join(' '));
  expect('a choice is taken once',finaleChoose('behead')===true&&finaleChoose('spare')===false&&F.step==='behead',F.step);}

// beheaded, gore on
{const R=runScene({seed:3,choice:'behead'}),X=R.X,o=order(R),de=overAt-R.chosenAt;
  expect('a beheading: the steps',o.slice(-3).join()==='choice,behead,done',o.join(' '));
  expect('he is dead and the head is gone',X.dead&&!!X.severed,'dead '+X.dead+' severed '+X.severed);
  expect('slow motion, a hit stop, a big callout',R.peak.slow>.3&&R.peak.freeze>=.05&&R.lines.some(l=>l.text==='Beheaded'&&l.big),'slow '+R.peak.slow.toFixed(2)+' '+R.lines.map(l=>l.text).join('|'));
  expect('endFight once, text set first',overs===1&&overText==='Mr. Hallowell is beheaded.'&&won===true,overs+' '+overText);
  expect('the card comes 1.5 to 3 s after the choice',de>=1.5&&de<=3,de.toFixed(2));
  expect('his begging is cut off with the cut',R.cutOut===0,R.cutOut);
  expect('log: down, begs, beheads',logs.filter(e=>e.type==='finale').map(e=>e.kind).join()==='down,begs,behead',logs.filter(e=>e.type==='finale').map(e=>e.kind).join());
  expect('Kael is whole, ids in place, no NaN',!R.K.dead&&S.F.every((f,i)=>f.idx===i)&&!R.nan&&S.F.filter(f=>f.dead).length>=2,S.F.map(f=>f.name+(f.dead?'+':'')).join());}

// struck down, gore off: nothing severed, no blood
{const R=runScene({seed:3,choice:'behead',gore:'off'}),X=R.X;
  expect('gore off: he falls, he is not severed',X.dead&&!X.severed,'dead '+X.dead+' severed '+X.severed);
  expect('gore off: the text and the callout',overText==='Mr. Hallowell is struck down.'&&R.lines.some(l=>l.text==='Struck down'&&l.big)&&!R.lines.some(l=>l.text==='Beheaded'),overText+' '+R.lines.map(l=>l.text).join('|'));
  expect('gore off: no blood anywhere in the scene',S.blood.length===0&&!(X.marks&&X.marks.length),'blood '+S.blood.length);
  expect('gore off: the cut still lands with a flash and a stop',R.peak.freeze>=.05&&overs===1,R.peak.freeze);
  const R2=runScene({seed:3,choice:'spare',gore:'off'});
  expect('gore off: a spare has no blood either',S.blood.length===0&&!R2.X.dead,S.blood.length);}

// waiting a while before choosing changes nothing
{const R=runScene({seed:4,choice:'behead',wait:6});
  expect('a late choice plays the same',R.X.dead&&!!R.X.severed&&overs===1&&R.chosenAt-R.choiceAt>5.9,(R.chosenAt-R.choiceAt).toFixed(1));}

// on auto: Kael decides after about two seconds, the same way each time for a run
{const picks=[];
  for(const seed of [3,3,5]){const R=runScene({seed,auto:true,len:30});
    const dec=hooks.find(h=>h.k==='decide'),ch=hooks.find(h=>h.k==='chosen');
    picks.push(R.F.choice);
    expect('auto, seed '+seed+': the panel is told he is deciding, then the pick comes in 1.5 to 3 s',!!dec&&!!ch&&ch.t-dec.t>=1.5&&ch.t-dec.t<=3,dec&&ch&&(ch.t-dec.t).toFixed(2));
    expect('auto: the fight ends and the text matches the pick',overs===1&&overText===(R.F.choice==='spare'?'Mr. Hallowell is spared.':'Mr. Hallowell is beheaded.')&&R.X.dead===(R.F.choice==='behead'),R.F.choice+' '+overText);}
  expect('auto is deterministic for a run',picks[0]===picks[1],picks.join());
  let sp=0;const t0=S.game.turnNo;for(let n=1;n<=60;n++){S.game.turnNo=n;if(autoPick()==='spare')sp++;}S.game.turnNo=t0;
  expect('about half each way over turn numbers',sp>=18&&sp<=42,sp+' of 60 spare');}

// Amri watches from a few steps back and takes no part
{const R=runScene({seed:3,ally:true,choice:'behead',probe:(R,t)=>{const M=R.M;if(M&&t>2.4&&t<8.3){R.mmin=Math.min(R.mmin==null?1e9:R.mmin,R.K.p[PEL].x-M.p[PEL].x);R.mx=Math.max(R.mx||-1e9,M.p[PEL].x);}if(R.X.hp<R.X.maxHp&&!R.X.dead&&t<9)R.hurt=true;}}),M=R.M;
  expect('Amri is there and standing',!!M&&!M.dead&&!M.gone,M&&M.name);
  expect('she keeps a few steps back from Kael and the desk',R.mmin>=60&&R.mx<=R.D.x0-120,'closest to Kael '+(R.mmin||0).toFixed(0)+', furthest right '+(R.mx||0).toFixed(0));
  expect('she takes no part: he is untouched until the cut',!R.hurt&&R.snaps.choice.endText==null,R.hurt);
  expect('the same scene ends with the beheading',R.X.dead&&overs===1&&!nan()&&S.F.every((f,i)=>f.idx===i),overText);
  expect('her weapon is still hers and she is not downed',!M.downed&&M.weaponKey==='spear',M.weaponKey);}

// a restart at any moment leaves nothing behind
for(const [label,stop,choice] of [['settle',.5],['walk',1.6],['reach',2.3],['the slam',2.75],['the haul',3.9],['the landing',5.3],['the kneel',6.8],['the choice',9.3],['a spare',9.9,'spare'],['a beheading',9.1,'behead']]){
  const R=runScene({seed:3,choice,stopAt:stop,len:20}),K=R.K;
  const before=S.finale&&S.finale.step;
  S.F=[];rosterBuild();initDuel();
  let bad=[];if(S.finale!==null)bad.push('finale');if(S.game.phase==='finale'||S.game.phase==='over')bad.push('phase '+S.game.phase);
  if(S.F[0].entering)bad.push('entering');if(S.F[0].arcRoll)bad.push('arcRoll');if(S.endText)bad.push('endText');if(S.F.some(f=>f.npc||f.puppet))bad.push('puppet');if(S.callouts.length)bad.push('callouts');
  const hk=hooks.length,ov=overs;let n=0;for(;n<120*6;n++){simStep();tickOpening(DT*3);if(nan()){bad.push('NaN');break;}if(S.finale){bad.push('finale again');break;}}
  expect('a restart during '+label+' ('+before+') is clean',!bad.length&&overs===ov&&S.room==='dining',bad.join()+' room '+S.room);}

// the end of the run
for(const l of rep)console.log(l);
console.log('errors',errs.length,JSON.stringify(errs));
`);
