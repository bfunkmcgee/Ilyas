// ===== THE ORDER DRILL START =====
// (since V95) The Order drill: the baton course every licensed guard in Eclipsera has sat. It is the Eclipsera Constabulary's
// public-order course cut down to forty hours and sold to the city's security firms, with the hand-to-hand of Levy basic bolted on
// by the old Levies who teach it. Generic, not elite: formally trained civilians who keep the gap, keep their partner, hit the arms
// and the legs, and go home at the end of the shift. One of the styles only the others fight in (enemy: never his). Hallowell
// Tower's guards fight in it once their guns run dry and the batons come out (sk_story.js, the lobby), and so can any stage's guard
// (style: 'order' on his entry). Every number is in ORDER_DRILL.
//   The baton (WEAPONS.baton): a steel expandable baton in one hand, blunt (a man it puts down is knocked out); its blows are named
//     for what they are (BATON_T): the Baton strike, the Baton jab, the High strike and the Leg strike.
//   Cover, its meter: the partners in the drill within reach of the man he is on, each +1 to hit (to 1 for a Novice, 2 from Trained).
//     It is worked out as the blow is thrown (orderCover) and shown on his plate a beat behind (ORDER_DRILL.show).
//   To the limbs: his Baton strikes and Leg strikes that land do 1 less and knock one more pip. The head is a last resort: the High
//     strike is -1. Its answers: Parry +1 and Step back +1 (the block and the gap), Slip -1 and Counter -1 (the course has neither).
//   Alone: once the partners he had this fight are all down, the book is out: -1 to hit, his Parry and Step back plain again, and on
//     auto he gives ground now and then.
//   Its ranks: the fence (Novice); the baton push (Trained, its signature): both hands on the baton, upright, driven into the chest,
//     his shove +2 and a pip more when it lands; the arm bar (Veteran): his shove at a Committed man takes him down. The course stops
//     there, so there is no mastering it.
//   On auto: Baton strikes and Leg strikes first, the jab, the High strike hardly ever, the push from Trained; a Parry or a Step back
//     for an answer more often than not.
//   Its motion (ANIM_STYLE.order): upright and side-on, the baton cocked at the shoulder and the free hand up in front, palm out (the
//     fence); every blow from the shoulder and straight back to it, the follow-through short and the guard held a beat after.
const ORDER_DRILL={cover:[[1,1],[5,2]],reach:40,lanes:60,show:.2,limbs:{dmg:-1,pips:1},head:-1,alone:-1,push:{hit:2,pips:1},
  answers:{parry:1,back:1,slip:-1,counter:-1},
  ai:{slash:1.3,sweep:2,sweepMul:1.25,thrust:1,overhead:.25,shove:1.4,habit:.6,parry:.6,withdraw:.2}};

// ---------- the baton ----------
WEAPONS.baton={key:'baton',name:'Baton',short:'Baton',len:40,butt:7,mass:.8,off:null,dice:[2,4,5],acc:1,tempo:.9,fam:'blunt'};
GUARD.baton={hx:.3,hy:.14,w:-2.1,gw:-.3,off:[.3,.12],crouch:.9,lean:.04,sf:.26,sb:-.3};
LOOT_RANK.baton=2;LOOT_NAME.baton='baton';
// (a weapon in its own right, not something off the table: the lash can take it)
{const rw=realWeapon;realWeapon=function(k){return k==='baton'||rw.apply(this,arguments);};}
const BATON_T={slash:['Baton strike','From the shoulder at an arm or a thigh, and back to the shoulder.'],
  thrust:['Baton jab','The tip driven straight into the body.'],
  overhead:['High strike','Down from the shoulder at the collarbone.'],
  sweep:['Leg strike','Down on the side of the thigh, to take the leg.']};
{const pt=pickTechnique;pickTechnique=function(A,D,kind){const T=pt.apply(this,arguments);
  if(A&&A.weaponKey==='baton'&&T&&(T.key==='std'||T.key==='lowcut')&&BATON_T[kind]){T.name=BATON_T[kind][0];T.why=BATON_T[kind][1];if(kind==='sweep')T.anchor='knee';}
  return T;};}

// ---------- how it moves ----------
// (on at any skill: the course drills the same motion into every man who sits it)
ANIM_STYLE.order={name:'Order drill',full:1,
  moves:{amp:.95,cock:.9,wind:.95,strike:.9,follow:.7,reach:.55,recover:.72,tail:.55},
  guard:{hand:.85,up:.1,off:1.3,offUp:.18,crouch:.03,lean:-.03,stance:1},
  pose:{body:{run:{crouch:.9,lean:.08,sf:.28,sb:-.3},stepBack:{lean:-.16}}},
  attack:{form:{slash:{lean:.1,crouch:.86,reach:.7,stance:[.42,-.36],wLean:-.02,wCrouch:.9},
      thrust:{lean:.14,crouch:.84,reach:.92,stance:[.44,-.36],wind:.75,strike:.8,wLean:-.02,wCrouch:.9},
      overhead:{lean:.16,crouch:.86,stance:[.42,-.36],wLean:-.04,wCrouch:.9},
      sweep:{lean:.24,crouch:.76,reach:.66,stance:[.46,-.36],wLean:-.02,wCrouch:.88}},
    wStance:[.3,-.32],drawBack:4,drive:[8,9],carry:[6,4],fLean:.02,fCrouch:-.01,fStance:[.42,-.36],
    windup:{slash:{hand:[-.08,-.72],w:-2.6},sweep:{hand:[-.06,-.62],amp:[0,1],w:-2.4},thrust:{hand:[-.3,-.04]},overhead:{hand:[-.04,-.96]}},
    follow:{slash:{hand:[.36,.5],turn:.85},sweep:{hand:[.34,.62],turn:.7},overhead:{hand:[.4,.66],turn:.6}},
    off:{wind:[.36,-.08],impact:[.22,.06],follow:[.3,-.02]},tilt:{wind:-.02,impact:.04,follow:.03}}};

// ---------- cover, and alone ----------
// his partners in the drill still on their feet
function orderPartners(f){return S.F.filter(p=>p&&p!==f&&p.team===f.team&&!p.dead&&!p.downed&&!p.npc&&styleIn(p,'order'));}
// how many of them are within reach of the man he is on (to his cap)
function orderCover(f,D=targetOf(f)){if(!D||D.dead||!styleIn(f,'order'))return 0;let n=0;
  for(const p of orderPartners(f))if(Math.abs(p.station-D.station)<engageGap(p,D)+ORDER_DRILL.reach&&Math.abs(p.lane-D.lane)<ORDER_DRILL.lanes)n++;
  return Math.min(n,meterMax(f,'order'));}
// the partners he had this fight are all down
function orderAlone(f){return!!f&&!!f._orderHad&&styleIn(f,'order')&&!orderPartners(f).length;}
V11.duelStart.push(()=>{for(const f of S.F)if(f){f._orderHad=false;f._orderShow=0;}});
// the meter on his plate follows his cover a beat behind (the rules read it live)
V11.step.push(()=>{for(const f of S.F){if(!f||f.dead||!styleIn(f,'order'))continue;if(!f._orderHad&&orderPartners(f).length)f._orderHad=true;
  if(S.t<(f._orderShow||0))continue;f._orderShow=S.t+ORDER_DRILL.show;const c=orderCover(f),n=meterN(f,'order');
  if(c!==n)meterSet(f,c,c>n?'a partner in cover':'his cover gone');}});

// ---------- the drill ----------
styleDef({key:'order',name:'Order drill',short:'Order drill',weapon:'Baton, one hand',weapons:['baton'],weaponNeed:'a baton',hands:1,order:4,enemy:true,
  origin:"The Eclipsera Constabulary's public-order course, cut to forty hours and sold to the city's security firms",
  doctrine:'Keep the gap, keep your partner, and go home.',
  what:'Upright and side-on, the baton cocked at the shoulder and the free hand up in front, palm out; short shuffles that never cross; every blow from the shoulder at an arm or a leg, and straight back to the shoulder.',
  motion:'order',signature:'push',
  meter:{key:'cover',name:'Cover',cap:ORDER_DRILL.cover,what:'The partners in the drill within reach of the man he is on: each is +1 to hit.'},
  ranks:[{level:1,key:'fence',name:'The fence',what:'The stance, the free hand up in front, the four blows from the shoulder. Cover 1.'},
    {level:5,key:'push',name:'The baton push',what:'Both hands on the baton, upright, driven into the chest: his shove +2, and a pip more when it lands. Cover 2.'},
    {level:9,key:'bar',name:'Arm bar',what:'His shove at a Committed man takes him down.'}],
  rules:[{id:'cover',on:'attack',to:'hit',who:'A',when:x=>ATTACKS.includes(x.kind)&&orderCover(x.A,x.D)>0,mod:x=>['cover',orderCover(x.A,x.D)]},
    {id:'limbs',on:'dmg',who:'A',label:'to the limbs',add:ORDER_DRILL.limbs.dmg,when:x=>(x.kind==='slash'||x.kind==='sweep')&&landedR(x.r)},
    {id:'head',on:'attack',to:'hit',who:'A',label:'the head, a last resort',v:ORDER_DRILL.head,when:x=>x.kind==='overhead'},
    {id:'alone',on:'attack',to:'hit',who:'A',label:'his partners down',v:ORDER_DRILL.alone,when:x=>ATTACKS.includes(x.kind)&&orderAlone(x.A)},
    // the answers the course teaches, and the ones it does not (alone, the ones it teaches are plain again)
    {id:'answer',on:'attack',to:'def',who:'D',when:x=>!!x.D&&!!x.D.react&&ORDER_DRILL.answers[x.D.react]!=null&&ATTACKS.includes(x.kind)&&!x.D.downed&&!(ORDER_DRILL.answers[x.D.react]>0&&orderAlone(x.D)),
      mod:x=>[REACT_NAME[x.D.react]||x.D.react,ORDER_DRILL.answers[x.D.react]]},
    {id:'push',on:'shove',to:'hit',who:'A',label:'the baton push',v:ORDER_DRILL.push.hit,when:x=>styleKnows(x.A,'order','push')}]});

// a blow to the limbs that lands knocks a pip more
{const ap=applyImpact;applyImpact=function(ex,A,D,res,Cfn,cv,slip,fa,primary){const r=ap.apply(this,arguments);
  if(A&&res&&(res.kind==='slash'||res.kind==='sweep')&&(res.out==='hit'||res.out==='crit')&&D&&!D.dead&&A.team!==D.team&&styleIn(A,'order'))knockBalance(D,ORDER_DRILL.limbs.pips,A);
  return r;};}
// the push that lands knocks a pip more; from Veteran, a Committed man is taken down (the arm bar)
{const ds=doShove;doShove=function(A,D,sr){const drill=!!A&&styleIn(A,'order'),was=D?D.posture:null,r=ds.apply(this,arguments);
  if(drill&&sr&&sr.ok&&D&&!D.dead){if(styleKnows(A,'order','push'))knockBalance(D,ORDER_DRILL.push.pips,A);
    if(styleKnows(A,'order','bar')&&was==='committed'&&!D.downed&&!kdBlocked(A,D,!!sr.crush)){knockDown(D);logNote(D,'Arm bar','taken down');}
    S.hooks.order('shove',{A,D,sr});}
  return r;};}
// the push itself: both hands on the baton, upright in front of his chest, and driven into the man's
{const ps=planShove;planShove=function(A,D,sres,kind='shove',D2=null){const P=ps.apply(this,arguments);
  if(!P||!P.att||kind==='bind'||(sres&&sres.shoulder)||!A||!styleKnows(A,'order','push'))return P;
  const ev=P.events&&P.events[0],Tc=ev?ev.t:.3,Tl=Math.max(.08,Tc-.12),a=A.arm,fa=A.facing,chest=P.Cfn;
  const mid=()=>{const h=A.p[HAF],t=A.p[TIP];return{x:lerp(h.x,t.x,.55),y:lerp(h.y,t.y,.55)};};
  const load={hand:{sh:[.26*a,.18*a]},wAng:-1.52,off:{fn:mid},tilt:0},
    push={hand:{fn:()=>{const c=chest();return{x:c.x-fa*5,y:c.y+12};}},wAng:-1.5,off:{fn:mid},tilt:.06};
  P.att.arm=armKeys(A,[[0,'now'],[Tl,load,sstep],[Tc,push,eIn],[Tc+.2,push],[P.Tend,'guard',sstep]]);P.batonPush=true;
  return P;};}
// a partner down: the one beside him says so
V11.kill.push(D=>{if(!D||D.style!=='order')return;const p=S.F.find(f=>f&&f!==D&&f.team===D.team&&!f.dead&&!f.downed&&styleIn(f,'order'));if(p)S.hooks.order('down',{A:p,D});});
if(!S.hooks.order)S.hooks.order=()=>{};

// ---------- on auto ----------
// the blows the course teaches first, and the push from Trained
{const mw=moveWeights;moveWeights=function(A,D,w,sT,ok){mw.apply(this,arguments);if(!A||!D||D.downed||!styleIn(A,'order'))return;const W=ORDER_DRILL.ai;
  w.slash*=W.slash;w.sweep=Math.max(w.sweep,W.sweep)*W.sweepMul;w.thrust*=W.thrust;w.overhead*=W.overhead;
  if(styleKnows(A,'order','push')&&ok&&ok('shove')&&A.foot>=2)w.shove=(w.shove||0)+W.shove*(orderAlone(A)?.5:1);};}
// the answers it teaches: a Parry or a Step back, more often than not
{const ar=aiReact;aiReact=function(D,A,kind,T,opening){const k=ar.apply(this,arguments);if(!D||!styleIn(D,'order')||k==='parry'||k==='back')return k;
  if(S.rng()>=ORDER_DRILL.ai.habit)return k;const ch=reactChoices(D,A),h=S.rng()<ORDER_DRILL.ai.parry?'parry':'back',o=h==='parry'?'back':'parry';
  return ch.includes(h)?h:ch.includes(o)?o:k;};}
// alone, he gives ground now and then
{const tc=temperChoice;temperChoice=function(A,D,ok,r,dist,between){
  if(A&&orderAlone(A)&&ok('withdraw')&&!breakoutInfo(A)&&r()<ORDER_DRILL.ai.withdraw)return'withdraw';return tc.apply(this,arguments);};}
// ===== THE ORDER DRILL END =====
