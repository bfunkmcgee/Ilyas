// The room (sk_room.js): the physics events (a body knocked flying into a man, through a pane, into a lamp, onto or into the table)
// and the room moves (hurl, through the pane, flip the table, drop the lamp): when they come up, what each does on a success and on
// a failure, what they cost, and that the enemies use them.
const core=require('./sk_src.js')(process.argv[2]);
eval(core+`
const errs=[];let nOk=0,base=mulberry32(29);S.rng=()=>base();Math.random=()=>base();
const EV=[],DONE=[];S.hooks.roomEvent=e=>EV.push(e);S.hooks.roomDone=(ex,i)=>DONE.push(i);
function expect(label,ok,extra){if(ok)nOk++;else errs.push(label+(extra!=null?': '+extra:''));console.log((ok?'ok   ':'FAIL ')+label+(extra!=null?'  '+extra:''));}
// Kael (sword, Expert) and the foes at the places given ([station, lane]); the dining room has its table, dividers and lamps
function setup(arena,place,o={}){S.arenaKey=arena;S.room=null;S.auto=false;S.tableOn=arena==='restaurant';S.divOn=arena==='restaurant';S.cfg.n=place.length-1-(o.ally?1:0);S.cfg.crew=false;
  S.cfg.ally.on=!!o.ally;S.allyAuto=false;S.cfg.hero={seed:2207,weapon:o.weapon||'sword',skill:4};
  for(let i=0;i<S.cfg.n;i++)S.cfg.foes[i]={seed:[5113,7741,3190][i],weapon:'sword',skill:3,temper:o.temper||'plain'};
  S.F=[];rosterBuild();initDuel();
  place.forEach((p,i)=>{const f=S.F[i];f.station=p[0];f.lane=f.dep=f.stepDep=p[1];f.facing=p[2]||(f.team?-1:1);f.dsd={};if(f.team)f.side=Math.sign(p[0]-place[0][0])||1;f.build();});
  warm(40);for(const L of S.lamps){L.p.x=L.p.px=L.x;L.p.y=L.p.py=L.ay+L.L;L.fallen=false;}
  const g=S.game;g.phase='input';startTurn(0);g.aiAt=null;g.active=0;S.opening=null;for(const f of S.F){f.intent=null;f.ready=f.idx?60:0;f.foot=footMaxOf(f);f.reads={};f._roomPick=null;}
  EV.length=0;DONE.length=0;return S.F;}
// the exchange to its end (an opening, if one comes, is let pass)
function run(max=120*10){for(let n=0;n<max;n++){simStep();if(S.opening){if(isAI(S.opening.f.idx))tickOpening(1);else resolveOpening('hold');}if(S.game.phase!=='exchange'&&!S.opening)return n;}return max;}
// the next roll comes up as asked: ok (a plain success), crush, or fail
function force(A,m,how){const c=roomMods(A,m.D,m.cmd),v=how==='fail'?1:how==='crush'?20:clamp(c.dc-c.bonus,2,19);let first=true;const save=S.rng;S.rng=()=>{if(first){first=false;S.rng=save;return(v-.5)/20;}return save();};}
function slotOf(A,cmd){const ms=roomMoves(A);const i=ms.findIndex(m=>m.cmd===cmd);return i<0?null:i?'room2':'room1';}
let paid=0;
function play(A,cmd,how){const slot=slotOf(A,cmd);if(!slot)return null;const m=roomPick(A,slot);force(A,m,how);const r0=A.ready,ok=command(A.idx,slot);paid=A.ready-r0;run();return ok?m:null;}
// a body sent flying in an exchange of Kael's: v (px/s) along x, motor down to a ragdoll's
function fling(f,vx,vy){const g=S.game;g.phase='exchange';g.ex={A:S.F[0],D:f,t0:S.t,cmd:'slash',perf:{},depth:0,plan:null,dur:1.6};f.motor=.1;f.knockUntil=S.t+.6;
  for(const q of f.p){q.px=q.x-vx*DT;q.py=q.y-(vy||0)*DT;}}
function steps(n){for(let i=0;i<n;i++)simStep();}
let K,V,B;

// ---------- events ----------
[K,V,B]=setup('field',[[300,92],[400,92],[486,92]]);
fling(V,620,-40);const c0=chainSt().n;steps(90);
expect('a body flung hard into a man standing puts him down too, and the room calls it (slow motion, a callout)',B.downed&&EV.some(e=>e.kind==='body'&&e.down&&e.at===B&&e.f===V)&&S.callouts.some(c=>c.room&&c.i===B.idx),'downed '+B.downed+' events '+EV.map(e=>e.kind+(e.down?'!':'')).join());
expect('it was Kael\\'s doing: it counts toward his flow',chainSt().n>=c0+1&&EV.some(e=>e.by===K),'run '+c0+'>'+chainSt().n);
[K,V,B]=setup('field',[[300,92],[400,92],[486,92]]);
const f0=B.foot;fling(V,300,0);steps(90);
expect('a softer one knocks him back: two pips of his balance, no knockdown, no slow motion',!B.downed&&B.foot<=f0-2&&EV.some(e=>e.kind==='body'&&e.quiet),'foot '+f0+'>'+B.foot+' downed '+B.downed+' '+EV.map(e=>e.kind+(e.quiet?'~':'')).join());
[K,V,B]=setup('field',[[300,92],[400,92],[486,140]]);
fling(V,620,-40);steps(90);
expect('a man well off the line in depth is not touched',!B.downed&&!EV.some(e=>e.kind==='body'),EV.map(e=>e.kind).join());
// the man making the move is no flying body however hard he lunges
[K,V,B]=setup('field',[[300,92],[400,92],[486,92]]);
{const g=S.game;g.phase='exchange';g.ex={A:V,D:B,t0:S.t,cmd:'shove',perf:{},depth:0,plan:null,dur:1};V.motor=.3;for(const q of V.p)q.px=q.x-500*DT;steps(60);}
expect('the attacker lunging into his own target is not an event',!EV.some(e=>e.kind==='body'),EV.map(e=>e.kind).join());
// a pane: the glass partition in the dining room
{[K,V,B]=setup('restaurant',[[560,90],[676,90],[300,150]]);const w=S.divs.find(d=>d.mat==='glass');
  fling(V,520,-30);steps(100);
  expect('a body flung fast into the glass bursts it and goes through',w.state==='broken'&&V.p[PEL].x>w.x&&EV.some(e=>e.kind==='pane'&&e.w===w),w.state+' x '+Math.round(V.p[PEL].x)+' events '+EV.map(e=>e.kind).join());
  expect('he goes down and takes the breach damage',V.downed||V.dead,V.hp+'/'+V.maxHp);}
{[K,V,B]=setup('restaurant',[[560,90],[676,90],[300,150]]);const w=S.divs.find(d=>d.mat==='glass');
  fling(V,200,0);steps(100);
  expect('a slower one only rattles it',w.state==='standing'&&!EV.some(e=>e.kind==='pane'),w.state);}
// a lamp: struck by a flying body it comes down; coming down on a man it hits him
{[K,V,B]=setup('restaurant',[[300,92],[400,92],[700,150]]);const L=S.lamps.find(l=>l.x===420&&l.dep===92);
  const g=S.game;g.phase='exchange';g.ex={A:K,D:V,t0:S.t,cmd:'slash',perf:{},depth:0,plan:null,dur:1.6};V.motor=.1;
  lampHit(L,400,V);
  expect('a flying body that hits a hanging lamp hard brings it down',L.fallen&&EV.some(e=>e.kind==='lamp'&&!e.hit),String(L.fallen));
  const h0=V.hp;V.motor=1;V.knockUntil=0;V.station=L.x;V.build();L.p.x=L.p.px=V.p[HEAD].x;L.p.y=L.p.py=V.p[HEAD].y-V.body.headR-L.r-14;L.struck=false;L.landed=false;L.drop=null;
  steps(60);
  expect('a lamp coming down on a man standing under it hurts and dazes him',V.hp<h0&&V.daze>0&&EV.some(e=>e.kind==='lamp'&&e.hit),h0+'>'+V.hp+' daze '+V.daze);}
// the table: onto it from above it breaks; into its side it goes over
{[K,V,B]=setup('restaurant',[[520,50],[440,50],[700,150]]);const bx=tableBox();
  const g=S.game;g.phase='exchange';g.ex={A:K,D:V,t0:S.t,cmd:'slash',perf:{},depth:0,plan:null,dur:1.6};V.motor=.1;V.knockUntil=S.t+.6;
  for(const q of V.p){q.x+=bx.cx-V.p[PEL].x*0-440;q.px=q.x;q.y-=90;q.py=q.y-560*DT;}steps(80);
  expect('a body coming down hard on the table goes through it',S.table.state==='broken'&&EV.some(e=>e.kind==='table'&&e.broke),S.table.state+' '+EV.map(e=>e.kind).join());}
// (where a flung body meets the table is up to the bodies: here the contact is made by hand, at the height of the top)
{[K,V,B]=setup('restaurant',[[530,50],[450,50],[700,150]]);const bx=tableBox();
  fling(V,0,0);onTableContact(V,{x:bx.r+3,y:tableTopAt(bx.r)+6,vx0:-420*DT,vy0:0,r:4},420);steps(240);
  expect('a body flung into the table\\'s side turns it over',S.table.state==='toppled'&&EV.some(e=>e.kind==='table'&&!e.broke),S.table.state+' '+EV.map(e=>e.kind).join());}
{[K,V,B]=setup('restaurant',[[530,50],[450,50],[700,150]]);const bx=tableBox();
  fling(V,0,0);onTableContact(V,{x:bx.r+3,y:tableTopAt(bx.r)+6,vx0:-200*DT,vy0:0,r:4},200);steps(240);
  expect('a softer one only shifts it',S.table.state==='intact',S.table.state);}
// nothing outside a fight
{[K,V,B]=setup('field',[[300,92],[400,92],[486,92]]);fling(V,620,-40);S.game.phase='over';steps(90);
  expect('no events once the fight is over',!EV.length,EV.map(e=>e.kind).join());}

// ---------- the moves on offer ----------
[K,V,B]=setup('field',[[300,92],[300+0,92],[0,92]]);
{V.station=K.station+engageGap(K,V)+6;V.build();B.station=V.station+84;B.lane=B.dep=96;B.side=1;B.build();startTurn(0);S.game.active=0;
  const ms=roomMoves(K);
  expect('two in a line: Hurl the near one into the other',ms.length===1&&ms[0].cmd==='hurl'&&ms[0].D===V&&ms[0].E===B,ms.map(m=>m.cmd+':'+m.D.name).join());
  expect('the slot holds it, with its own name and cost',slotAction(K,V,'room1')==='room1'&&!slotAction(K,V,'room2')&&moveCost(K,V,'room1')===ROOM_COST.hurl-70&&footDelta(K,'room1')===-1,moveCost(K,V,'room1'));
  K.foot=0;expect('it needs a pip of balance',!cmdValid(K,V,'room1'));K.foot=6;
  B.station=V.station+200;B.build();expect('one too far behind him is no line',!roomMoves(K).length);}
[K,V,B]=setup('field',[[300,92],[400,92],[600,150]]);
expect('in the open with nobody behind him, the room offers nothing',!roomMoves(K).length,roomMoves(K).map(m=>m.cmd).join());
{[K,V,B]=setup('restaurant',[[560,90],[676,90],[300,150]]);const ms=roomMoves(K);
  expect('a pane at his back: put him through it',ms.some(m=>m.cmd==='pane'&&m.D===V&&m.w.mat==='glass'),ms.map(m=>m.cmd).join());}
{[K,V,B]=setup('restaurant',[[468,50],[225,50],[640,150]]);const ms=roomMoves(K);
  expect('the table between them: flip it onto him',ms.some(m=>m.cmd==='flip'&&m.D===V&&!m.on&&m.dir<0),ms.map(m=>m.cmd).join()+' '+Math.round(K.station)+'/'+Math.round(V.station));}
{[K,V,B]=setup('restaurant',[[320,92],[424,92],[700,150]]);const ms=roomMoves(K);
  expect('a lamp hanging over him: bring it down on him',ms.some(m=>m.cmd==='lamp'&&m.D===V),ms.map(m=>m.cmd).join());
  expect('at most two moves, one of each kind',ms.length<=2&&new Set(ms.map(m=>m.cmd)).size===ms.length);}
{[K,V,B]=setup('restaurant',[[320,92],[424,92],[700,150]],{weapon:'fists'});
  expect('no lamp without a weapon to cut it down',!roomMoves(K).some(m=>m.cmd==='lamp'),roomMoves(K).map(m=>m.cmd).join());}

// ---------- the moves played ----------
// Hurl
[K,V,B]=setup('field',[[300,92],[300,92],[0,92]]);
{V.station=K.station+engageGap(K,V)+6;V.build();B.station=V.station+84;B.lane=B.dep=96;B.side=1;B.build();startTurn(0);S.game.active=0;S.game.aiAt=null;
  const cost=actionCost(K,'room1',moveCost(K,V,'room1')),c0=chainSt().n,m=play(K,'hurl','ok');
  expect('Hurl: on a hit he goes into the other and both go down',!!m&&(V.downed||V.dead)&&(B.downed||B.dead),'V '+V.downed+' B '+B.downed);
  expect('the room calls it, and it is two takedowns for Kael\\'s flow',EV.some(e=>e.kind==='hurl'&&e.at===B)&&chainSt().n>=c0+2,EV.map(e=>e.kind).join()+' run '+chainSt().n);
  expect('it costs '+ROOM_COST.hurl+' tempo at base and a pip of balance',paid===cost&&cost===actionCost(K,'throw',0)&&K.foot===footMaxOf(K)-1,paid+'/'+cost+' foot '+K.foot);}
[K,V,B]=setup('field',[[300,92],[300,92],[0,92]]);
{V.station=K.station+engageGap(K,V)+6;V.build();B.station=V.station+84;B.lane=B.dep=96;B.side=1;B.build();startTurn(0);S.game.active=0;S.game.aiAt=null;
  const m=play(K,'hurl','fail');
  expect('Hurl braced: nobody goes down, Kael loses a pip more, and no opening is given',!!m&&!V.downed&&!B.downed&&K.foot===footMaxOf(K)-2&&DONE.some(i=>!i.ok),'V '+V.downed+' foot '+K.foot);}
// Through the pane
{[K,V,B]=setup('restaurant',[[560,90],[676,90],[300,150]]);const w=S.divs.find(d=>d.mat==='glass'),h0=V.hp;
  const m=play(K,'pane','ok');
  expect('Through the pane: it bursts and he lands down on the far side',!!m&&w.state==='broken'&&V.p[PEL].x>w.x&&(V.downed||V.dead)&&V.hp<h0,w.state+' x '+Math.round(V.p[PEL].x)+' hp '+h0+'>'+V.hp);}
{[K,V,B]=setup('restaurant',[[560,90],[676,90],[300,150]]);const w=S.divs.find(d=>d.mat==='glass');
  const m=play(K,'pane','fail');
  expect('braced, the pane stands',!!m&&w.state==='standing'&&!V.downed,w.state);}
// Flip the table
{[K,V,B]=setup('restaurant',[[468,50],[225,50],[640,150]]);const h0=V.hp;
  const m=play(K,'flip','ok');
  expect('Flip: the table goes over onto him and he goes down',!!m&&S.table.state==='toppled'&&(V.downed||V.dead)&&V.hp<h0,S.table.state+' '+V.downed);}
{[K,V,B]=setup('restaurant',[[468,50],[225,50],[640,150]]);const h0=V.hp;
  const m=play(K,'flip','fail');
  expect('read, he steps clear and the table is over anyway',!!m&&S.table.state==='toppled'&&!V.downed&&V.hp===h0,S.table.state+' '+V.downed);}
// one sprawled on the table
{[K,V,B]=setup('restaurant',[[486,50],[426,50],[640,150]]);const bx=tableBox(),top=tableTopAt(bx.cx);
  knockDown(V);const pel={x:V.p[PEL].x,y:V.p[PEL].y};for(const q of V.p){const dx=q.x-pel.x,dy=q.y-pel.y;q.x=q.px=bx.cx+20+dy;q.y=q.py=top-12+dx;}
  steps(30);startTurn(0);S.game.active=0;S.game.aiAt=null;for(const f of S.F)f.intent=null;
  const ms=roomMoves(K);
  expect('a man sprawled on the table: flip it with him on it',ms.some(m=>m.cmd==='flip'&&m.on&&m.D===V),ms.map(m=>m.cmd+(m.on?'(on)':'')).join());
  if(ms.some(m=>m.cmd==='flip')){const h0=V.hp;play(K,'flip','ok');
    expect('he is thrown off it and stays down',S.table.state==='toppled'&&V.downed&&V.hp<h0,S.table.state+' '+V.hp);}}
// Drop the lamp
{[K,V,B]=setup('restaurant',[[320,92],[424,92],[700,150]]);const h0=V.hp,f0=V.foot,L=S.lamps.find(l=>l.x===420&&l.dep===92);
  const m=play(K,'lamp','ok');
  expect('Drop the lamp: it comes down on him, hurts and dazes him and takes two pips of his balance',!!m&&L.fallen&&V.hp<h0&&V.daze>0&&V.foot<=f0-2,'hp '+h0+'>'+V.hp+' foot '+f0+'>'+V.foot);
  expect('no balance spent on it',K.foot===footMaxOf(K),K.foot);}
{[K,V,B]=setup('restaurant',[[320,92],[424,92],[700,150]]);const h0=V.hp;
  const m=play(K,'lamp','fail');
  expect('read, it lands beside him',!!m&&V.hp===h0&&DONE.some(i=>!i.ok),V.hp);}

// ---------- the enemies use them ----------
{let picks=0,shown=0,offered=0,ch=0;const N=60;
  for(let k=0;k<N;k++){const F=setup('field',[[300,92],[300,92],[0,92]],{ally:true,temper:'brute'});[K,V]=F;const M=F[2];
    // Qadir in front of Kael, Amri just behind Kael
    V.station=K.station+engageGap(K,V)+6;V.build();M.station=K.station-84;M.lane=M.dep=92;M.build();startTurn(1);S.game.active=1;S.game.aiAt=null;
    const ms=roomMoves(V);if(!ms.length)continue;offered++;ch=roomChance(V,ms[0]);const c=aiChoice(1);if(c==='room1'){picks++;V.intent={cmd:'room1'};const m=roomPick(V,'room1');if(m&&m.cmd==='hurl'&&m.D===K&&m.E===M)shown++;}}
  expect('a brute takes the room\\'s move now and then when it is there (Hurl Kael into Amri), the likelier the better his odds',offered>=N/2&&picks>=offered*.12&&picks<=offered*.6&&shown===picks,picks+' of '+offered+' offered, shown '+shown+', odds '+Math.round(ch*100)+'%');}

console.log(nOk+' checks, errors '+errs.length+(errs.length?': '+errs.join(' | '):''));
`);
