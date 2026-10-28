// ===== STANCE MOTION START =====
// The stances' own moves in the game's motion (sk_anim.js). Unbound's whip blows and Close's hilt-ring, spine and inside hook come
// in variants of their own and open with combos of their own, and each stance's answer to a blow is acted out when the blow misses.
// It is the game's way of doing it (the variants and the leads picked by the animation's own dice, animDice, from the blow's seed),
// so none of it throws the game's dice or changes anything the rules read.
//   Unbound  the throw comes from the side, over the head, backhand across the body or low from the hip; the high crack loops up and
//            over, comes off the shoulder or is whirled once round the head first; the dart goes in line, from above, from below or
//            off the wrist; the wrap goes low, from a knee or hooked. Its leads are flicks of the chain the man parries out in front of
//            him (the chain runs out to where his blade meets it and comes back), and he stays where he stands.
//   Close    the hilt-ring is driven straight in, hooked round or brought up under the chin, and hammered straight down or chopped off
//            the shoulder; the spine goes in on the line, low and rising under the ribs, or with the free hand on his collar pulling
//            him onto it; the inside hook takes the ankle, reaps it with a step in behind the heel, or pulls it out hard. Its leads are
//            short: a jab of the ring, a hammer of it or a dig of the spine, then the blow.
// The answers, when the blow an answering stance meets misses him (sk_stances.js, STN_ANS: the popup over the man says which):
//   Bound    beats a thrust aside: the locked blade meets the point out in front and knocks it off its line; takes a cut on the
//            locked blade: the blade across it with the free hand braced on its back, and it does not give
//   Close    gets inside a swing or a cut, and inside an axe's swing jammed on its haft: a step in under it, the free hand on his arm,
//            the blade short at his ribs
//   Unbound  catches the raised arm of a man coming in with an overhead: the chain thrown round his forearm and the arm yanked off
//            its line before it comes down
// A Counter, Turn him or the Ward he chose in the window is acted out as it always is; with a Slip or a Step back the beat and the
// catch go with its footwork (the others give way to it). The answer is acted out in place of an elf's evasion (the vault over the
// man, the spin away), which would have him somewhere the stance's answer did not put him: so where he stands after a blow the stance
// answered is where the answer left him, the one thing here a later turn can read. STN_MOTION.on false: the stance moves come as
// before (no variants, no combos, the game's own answers).
const STN_MOTION={on:true};

// ---------- the shapes the variants name (ATTACK, sk_anim.js) ----------
// windups: the hand [forward, down] from the chest in arm lengths and the blade's angle (null: on the line of the blow)
Object.assign(ATTACK.windup,{
  whipOver:{hand:[-.06,-1.02],amp:[0,1],ampCap:1,w:-2.95},      // the hand high over the head, the chain hanging back behind it
  whipBack:{hand:[.3,-.42],w:-2.5},                              // across the body to the far shoulder, the chain hanging back over it
  whipLow:{hand:[-.26,.5],amp:[1,0],w:2.35},                     // low behind the hip, the chain on the ground
  ringHook:{hand:[-.34,-.32],amp:[1,0],w:null},                  // the ring drawn back wide at the shoulder for a round blow
  ringUpper:{hand:[-.12,.48],w:null},                            // down at the hip, to come up under the chin
  ringChop:{hand:[-.26,-.86],amp:[0,1],ampCap:1,w:null},         // up over the shoulder
  spineLow:{hand:[-.3,.36],amp:[1,0],w:null},                    // low, to come up under the ribs
  hookPull:{hand:[-.1,.58],w:2.9},
  whipSlant:{hand:[.12,-.84],amp:[0,1],ampCap:1,w:-2.2}});      // up over the shoulder, the chain back across it
// follow-throughs (for the hilt, the spine and the hook: where the hand goes on to, and the blade's turn)
Object.assign(ATTACK.follow,{
  ringHook:{hand:[.3,.18],turn:.7},ringUpper:{hand:[.22,-.42],turn:-.6},ringChop:{hand:[.4,.52],turn:.5},
  spineLow:{hand:[.34,-.12],turn:-.25},hookPull:{hand:[-.06,.62],turn:-.95},hookReap:{hand:[.48,.7],turn:-.5}});
// the whip's follow-through: where the hand ends once the chain is out (sh: from the chest; back: drawn back from the impact) and how
// far the line of the chain turns on
const WHIP_FOLLOW={over:{sh:[.36,.6],turn:.85},back:{sh:[.46,-.3],turn:-.55},low:{sh:[.34,-.52],turn:-.85},slant:{sh:[.46,.64],turn:.6},
  high:{back:[.12,.18],turn:.25},lowdart:{back:[.14,-.12],turn:-.25},snap:{back:[.06,.02],turn:.12},drop:{sh:[.5,.5],turn:-.4},hook:{sh:[.4,.66],turn:-.6}};

// ---------- the variants ----------
// As the game's (ATTACK.variant): key; w its weight; windup and follow the shapes above (the blow's own where it names none); ang the
// blade turned by this at the impact (not for the whip, whose line is the chain's); body: added to the lean and the crouch at the
// impact (wbody: in the windup); from, end: where it starts and where it leaves the blade, so a blow straight after another goes on
// from where that one ended; sk: from this skill up. The whip's own: lf its follow-through (WHIP_FOLLOW), circle (whirled once round
// the head before the throw). The spine's collar: the free hand on his collar, and the step in (px) that puts it in reach. The game's
// ATTACK.form names are used as they are.
const STN_VAR={
  whip:{
    slash:[{key:'side',w:1,from:'mid',end:'mid'},
      {key:'over',w:.8,windup:'whipOver',lf:'over',body:{lean:.06},wbody:{lean:-.08},from:'high',end:'low'},
      {key:'back',w:.6,sk:3,windup:'whipBack',lf:'back',wbody:{lean:.06},from:'mid',end:'high'},
      {key:'low',w:.5,windup:'whipLow',lf:'low',body:{crouch:-.06},wbody:{crouch:-.08,lean:.06},from:'low',end:'high'}],
    overhead:[{key:'loop',w:1,from:'high',end:'low'},
      {key:'slant',w:.7,windup:'whipSlant',lf:'slant',from:'high',end:'low'},
      {key:'circle',w:.5,sk:4,circle:true,from:'high',end:'low'}],
    thrust:[{key:'line',w:1,from:'mid',end:'mid'},
      {key:'high',w:.6,windup:'highThrust',lf:'high',from:'high',end:'mid'},
      {key:'low',w:.6,windup:'lowThrust',lf:'lowdart',body:{crouch:-.05},from:'low',end:'mid'},
      {key:'snap',w:.5,sk:3,windup:'snap',lf:'snap',from:'mid',end:'mid'}],
    sweep:[{key:'low',w:1,from:'mid',end:'low'},
      {key:'drop',w:.5,sk:3,lf:'drop',body:{crouch:-.16,lean:.1},wbody:{crouch:-.1},from:'mid',end:'low'},
      {key:'hook',w:.5,windup:'hook',lf:'hook',from:'low',end:'low'}]},
  ring:{
    slash:[{key:'straight',w:1,from:'mid',end:'mid'},
      {key:'hook',w:.8,windup:'ringHook',follow:'ringHook',ang:.35,from:'mid',end:'mid'},
      {key:'upper',w:.6,windup:'ringUpper',follow:'ringUpper',ang:-.45,body:{crouch:-.05},wbody:{crouch:-.06},from:'low',end:'high'}],
    overhead:[{key:'hammer',w:1,from:'high',end:'low'},
      {key:'chop',w:.7,windup:'ringChop',follow:'ringChop',ang:-.3,from:'high',end:'low'}]},
  spine:{
    thrust:[{key:'line',w:1,from:'mid',end:'mid'},
      {key:'under',w:.7,windup:'spineLow',follow:'spineLow',ang:-.2,body:{crouch:-.06,lean:.06},from:'low',end:'mid'},
      {key:'collar',w:.6,sk:3,collar:true,step:20,body:{lean:.04},from:'mid',end:'mid'}]},
  hook:{
    sweep:[{key:'ankle',w:1,from:'mid',end:'low'},
      {key:'reap',w:.7,follow:'hookReap',body:{lean:.1,crouch:-.06},from:'mid',end:'low'},
      {key:'pull',w:.6,windup:'hookPull',follow:'hookPull',from:'low',end:'low'}]}};
for(const g in STN_VAR)for(const k in STN_VAR[g])for(const v of STN_VAR[g][k])v.stn=g;
// which of the stances' own moves this is: the whip (Unbound's lashes, the wrap and the stop-lash), the hilt-ring, the spine or the hook
function stnGroup(A,T){if(!STN_MOTION.on||!A||!T||A!==hero()||!T.stance)return null;
  if(T.whip&&T.lash)return'whip';
  if(T.stance==='close'||T.key==='insidehook'){if(T.key==='pommel')return'ring';if(T.key==='halfsword')return'spine';if(T.key==='insidehook')return'hook';}
  return null;}
// (picked as the game picks: by weight, the same one again seldom, one that starts where the last left the blade often)
function stnVarPick(A,kind,L,res){const F=S.animForce;if(F&&F.variant){const v=L.find(x=>x.key===F.variant);if(v&&variantWeight(A,kind,v,null,null)>0)return v;}
  const last=A.animLast,chain=lastEnd(A),ws=L.map(v=>variantWeight(A,kind,v,last,chain)),sum=ws.reduce((s,x)=>s+x,0);if(sum<=0)return L[0];
  let r=animDice(res,'variant')()*sum;for(let i=0;i<L.length;i++){r-=ws[i];if(r<=0)return L[i];}return L[L.length-1];}
{const bv=blowVariant;blowVariant=function(A,D,kind,T,res){const g=stnGroup(A,T),L=g&&STN_VAR[g][kind];return L?stnVarPick(A,kind,L,res):bv.apply(this,arguments);};}
// the hilt, the spine and the hook follow through as their variant says (the game's own has the butt and the thrust pushed on)
{const fb=followBase;followBase=function(T,kind,out,arm,theta,impHand,A,fa,V){
  if(V&&V.stn&&V.follow&&out!=='fumble'&&out!=='block'&&out!=='wall'){const P=attackTable(A).follow[V.follow];if(P)return{hand:{sh:[P.hand[0]*arm,P.hand[1]*arm]},ang:theta+P.turn};}
  return fb.apply(this,arguments);};}

// ---------- the combos ----------
// what can lead into each of the stance moves, [kind, variant]: the whip's flicks, and Close's short ring and spine
const STN_LEADS={whip:{slash:[['thrust','line'],['overhead','loop'],['slash','low']],overhead:[['slash','side'],['thrust','line']],thrust:[['slash','low'],['overhead','loop']],
    sweep:[['overhead','loop'],['slash','side']]},
  ring:{slash:[['thrust','line'],['slash','hook']],overhead:[['slash','straight'],['thrust','under']]},
  spine:{thrust:[['slash','hook'],['slash','straight'],['overhead','hammer']]},
  hook:{sweep:[['overhead','hammer'],['slash','straight'],['thrust','line']]}};
// a lead's own group: the whip's are the whip's; in Close a thrust is the spine and a cut or an overhead the ring
function stnLeadGroup(g,kind){return g==='whip'?'whip':kind==='thrust'?'spine':'ring';}
{const bc=blowCombo;blowCombo=function(A,D,kind,T,res,opts){const g=stnGroup(A,T);if(!g)return bc.apply(this,arguments);
  const LS=STN_LEADS[g][kind];if(!LS||!comboRoom(A,D,opts))return null;
  const C=ATTACK.combo,F=S.animForce,find=(k,v)=>(STN_VAR[stnLeadGroup(g,k)][k]||[]).find(x=>x.key===v)||null;
  if(F&&F.combo)return F.combo.map(s=>{const p=String(s).split(':');return{kind:p[0],V:find(p[0],p[1]||''),stn:stnLeadGroup(g,p[0])};}).filter(l=>STN_VAR[l.stn][l.kind]);
  const r=animDice(res,'combo'),s=clamp(Math.round(A.skill||1),1,5)-1,q=opts&&opts.quick;if(r()>=C.chance[s]*(q?C.quick:1))return null;
  const n=!q&&r()<C.more[s]?2:1,out=[];
  for(let i=0;i<n;i++){const p=LS[Math.floor(r()*LS.length)];out.push({kind:p[0],V:find(p[0],p[1]),stn:stnLeadGroup(g,p[0])});}
  return out;};}
// a lead's shape for the planners (what anchorFor, thetaAt and windupFor read)
function stnLeadTech(A,kind,g){const base={kind,key:'std',along:null,rising:false,descend:false,windCap:null,amp:1,lash:false,ang:null,anchor:null,kick:false};
  if(g==='whip')return{...base,key:'lashlead',lash:true};
  if(g==='ring')return{...base,key:'pommel',along:-A.wp.butt,ang:kind==='overhead'?(a=>a-Math.PI+.9):(a=>a-Math.PI+.5),anchor:'face'};
  return{...base,kind:'thrust',key:'halfsword',along:A.wp.len*.55,reach:.7};}
// The leads' motion (the game's comboPlan, for these moves): each one's windup, its strike at the point where his parry meets it and
// the rebound off it. The whip's: thrown from where he stands (the body does not close in), the hand out along the line to that point
// and the chain run out to it (lash: when it goes out, holds and comes back, for the drawn chain); Close's: the ring's end or the
// spine's edge put on that point, a step nearer each time.
function stnComboPlan(A,D,leads,c){
  const C=ATTACK.combo.lead,fa=c.fa,arm=A.arm,K=c.K,n=leads.length,hits=[],body=[],armK=[],events=[],lash=[],r=c.rnd,b=A.body,leg=A.leg;
  let t=c.Tw0;
  for(let j=0;j<n;j++){
    const {kind,V,stn}=leads[j],whip=stn==='whip',thrust=kind==='thrust',sweep=kind==='sweep',LT=stnLeadTech(A,kind,stn);
    const fm=variantForm(K,kind,null),dl=V&&V.body?V.body:{},lean=fm.lean+(dl.lean||0),crouch=fm.crouch+(dl.crouch||0);
    const WL=t+c.tWind*C.wind*(j?C.next:1),IL=WL+c.tStrike*C.strike*(thrust?.9:1)*(whip?1.25:1),RB=IL+C.rebound*(whip?1.5:1),px=whip?c.strikeX:c.strikeX-fa*C.back*(n-j);
    const sdx=D.station-D.p[PEL].x,an=anchorFor(D,LT,kind)(),B={x:an.x+sdx-fa*(14+D.body.bulk*4)+(r()*2-1)*3,y:an.y-(sweep?0:2)+(r()*2-1)*4};
    let th,hand,back;
    if(whip){const shX=px+fa*Math.sin(lean)*b.torso,shY=S.arena.ground(px,c.zS)-leg*crouch-Math.cos(lean)*b.torso;
      th=Math.atan2(B.y-shY,fa*(B.x-shX))+.05;hand={sh:[Math.cos(th)*arm*.86,Math.sin(th)*arm*.86]};back={sh:[Math.cos(th)*arm*.6,Math.sin(th)*arm*.6+.04*arm]};
      lash.push({a:WL+(IL-WL)*.3,b:IL,c:IL+.05,d:RB+.14,B});}
    else{th=thetaAt(A,LT,kind,B,fa,px,lean,crouch,c.zS)+(V&&V.ang||0);const at=stn==='ring'?LT.along:A.wp.len*.5;
      hand={w:{x:B.x-fa*Math.cos(th)*at,y:B.y-Math.sin(th)*at}};back={w:{x:hand.w.x-fa*.12*arm,y:hand.w.y-.05*arm}};}
    const W=windupFor(LT,kind,arm,c.amp*C.amp,th,A,V);
    body.push({t:WL,v:{px:px-fa*K.drawBack*(whip?.25:.5),crouch:fm.wCrouch,lean:fm.wLean,...c.stn(K.wStance),th:.2},e:eOut},
      {t:IL,v:{px,crouch,lean,...c.stn(fm.stance),th:.12},e:eIn},
      {t:RB,v:{px:px-fa*3,crouch:crouch+.02,lean:lean-.06,...c.stn(fm.stance),th:.12}});
    armK.push({t:WL,v:{hand:W.hand,wAng:W.ang,off:c.offW,tilt:c.KA.wind},e:eOut},
      {t:IL,v:{hand,wAng:th,off:c.offI,tilt:c.KA.impact},e:whip?sstep:eIn},
      {t:RB,v:{hand:back,wAng:th-(whip?.2:.4),off:c.offW,tilt:c.KA.wind},e:eOut});
    hits.push({IL,B,theta:th,kind,beat:false});
    const seed=(c.seed+j*7919)>>>0;
    events.push({t:WL+c.tStrike*C.strike*.2,fn:()=>S.hooks.sound('swoosh',A.wp.mass*(whip?.6:.7))},{t:IL,fn:()=>{leadClash(A,D,B,fa,seed);if(whip&&!A.dead)S.hooks.sound('whipcrack',.5);}});
    t=RB+C.gap;}
  return{span:t-c.Tw0,body,arm:armK,hits,events,fa,leads:leads.map(l=>l.kind+(l.V?':'+l.V.key:'')),lash};}
{const cp=comboPlan;comboPlan=function(A,D,leads,c){return leads&&leads.length&&leads[0].stn?stnComboPlan(A,D,leads,c):cp.apply(this,arguments);};}

// ---------- the variant laid over the plan ----------
// The game's planner takes a variant's windup, its angle and its forms; what it has no slot for is laid over its keys here: the body's
// lean and crouch, the whip's follow-through, the whirl round the head before a throw, the hand on the collar. And the leads' throws
// go on the lash, for the drawn chain.
function stnKeyAt(keys,t){return keys.find(k=>Math.abs(k.t-t)<1e-9);}
function stnBody(k,d){if(!k||!d)return;const add=o=>({...o,lean:(o.lean||0)+(d.lean||0),crouch:(o.crouch||0)+(d.crouch||0),...(d.px&&typeof o.px==='number'?{px:o.px+d.px}:{})});
  const v=k.v;k.v=typeof v==='function'?()=>add(v()):add(v);}
let STN_RES=null;   // (the blow being planned: its own man's answer is the one acted out, not a second man's of a two-man stroke)
{const pa=planAttack;planAttack=function(A,D,kind,res,opts){const was=STN_RES;STN_RES=res;let P;try{P=pa.apply(this,arguments);}finally{STN_RES=was;}
  const T=res&&res.tech,g=stnGroup(A,T);if(!g||!P||!P.att)return P;
  const V=STN_VAR[g][kind]&&P.anim&&P.anim.variant?STN_VAR[g][kind].find(v=>v.key===P.anim.variant):null,arm=A.arm,fa=P.dir,KA=attackTable(A).tilt,B=P.att.body,AK=P.att.arm;
  const wk=AK.filter(k=>k.t<P.Timp-1e-9&&k.v&&k.v.tilt===KA.wind).pop(),Tw1=wk?wk.t:P.Timp-.2;
  if(P.combo&&P.combo.lash&&A.lash&&A.lash.t0===S.t)A.lash.leads=P.combo.lash;
  if(!V)return P;
  if(V.body){stnBody(stnKeyAt(B,P.Timp),V.body);stnBody(stnKeyAt(B,P.Td),V.body);}
  if(V.wbody)stnBody(stnKeyAt(B,Tw1),V.wbody);
  const L=A.lash&&A.lash.t0===S.t?A.lash:null;
  // the whip's follow-through: where the hand ends and the line of the chain with it
  if(L&&V.lf&&WHIP_FOLLOW[V.lf]){const Fw=WHIP_FOLLOW[V.lf],fk=stnKeyAt(AK,L.d-.06);
    if(fk&&fk.v){const imp=stnKeyAt(AK,P.Timp),ih=imp&&imp.v?imp.v.hand:null;
      fk.v={...fk.v,hand:Fw.sh?{sh:[Fw.sh[0]*arm,Fw.sh[1]*arm]}:{fn:()=>{const h=A.resolve(ih);return{x:h.x-fa*Fw.back[0]*arm,y:h.y+Fw.back[1]*arm};}},wAng:P.theta+Fw.turn};}}
  // whirled once round the head before the throw: the hand circles over it through the first part of the windup, the chain swinging round
  if(L&&V.circle&&wk){const prev=AK.filter(k=>k.t<Tw1-1e-9).pop(),t0=prev?prev.t:Tw1-.3,span=Tw1-t0;
    if(span>.12){const N=5,R=.26*arm,cx=-.02*arm,cy=-.92*arm;
      for(let i=1;i<N;i++){const u=i/N,a=TAU*u;AK.push({t:t0+span*u*.9,v:{hand:{sh:[cx+Math.sin(a)*R,cy-Math.cos(a)*R*.55]},wAng:-1.6-TAU*u,off:wk.v.off,tilt:KA.wind},e:i===1?(x=>x*x):(x=>x)});}
      AK.sort((a,b)=>a.t-b.t);}}
  // the spine with the free hand on his collar: it takes hold as the blade is drawn back, he steps in on it (as near as two men stand)
  // and pulls him onto the point
  if(V.collar){const col={fn:()=>{const c=D.p[CHE],h=D.p[HEAD];return{x:lerp(c.x,h.x,.3)-fa*3,y:lerp(c.y,h.y,.3)};}};
    for(const t of [Tw1,P.Timp,P.Td]){const k=stnKeyAt(AK,t);if(k&&k.v&&typeof k.v==='object')k.v={...k.v,off:col};}
    const near=30+(A.body.bulk+D.body.bulk)*9-6,step=k=>{const v=k&&k.v;if(!v||typeof v.px!=='number')return 0;return clamp(Math.abs(D.station-v.px)-near,0,V.step||0);};
    for(const [t,u] of [[Tw1,.35],[P.Timp,1],[P.Td,1]]){const k=stnKeyAt(B,t);stnBody(k,{px:fa*step(k)*u});}
    const hit=res.out==='hit'||res.out==='crit';
    if(hit)P.events.push({t:P.Timp-.03,fn:()=>{if(A.dead||D.dead)return;for(const [i,k] of [[CHE,110],[HEAD,90]]){const q=D.p[i];q.px+=fa*k*DT;}}});}
  return P;};}

// ---------- the answers acted out ----------
// which answer to act out: the stance's answer to this blow (STN_ANS), when it misses him and he took it on his blade or stood for it
function stnAnswerKey(D,A,kind,res){
  if(!STN_MOTION.on||!D||D!==hero()||!A||A.team===D.team||!res||!res.tech)return null;const s=stanceOf(D);if(!s)return null;
  if((res.out!=='block'&&res.out!=='dodge')||res.guardBreak||D.downed||D.dead||D.clinch||A.dead||A.downed||!ATTACKS.includes(res.kind))return null;
  if(D.counter||(D.react&&!['parry','slip','back'].includes(D.react)))return null;
  if(STN_RES&&res!==STN_RES)return null;
  const T=res.tech;
  if(s==='close'&&jammedTech(A,T)&&!A.clinch)return'inside';           // (an axe's swing jammed on its haft: he is already inside it)
  const a=stnAnswer(s,res.kind,T,A,cameFar(A,D));if(!a||a[1]<=0)return null;
  const key=s==='bound'?(res.kind==='thrust'?'beat':'blade'):s==='close'?'inside':'catch';
  // a Slip or a Step back he chose keeps its footwork: the beat and the catch are the arm's, and go with it; the others stand for it
  if((D.react==='slip'||D.react==='back')&&key!=='beat'&&key!=='catch')return null;
  return key;}
// across the line of the blow at the point it arrives: where his hand goes and his blade's angle (planReaction's own)
function stnAcross(D,fa,theta,B){const L=D.wp.len*.55,u={x:fa*Math.cos(theta),y:Math.sin(theta)};let pv={x:-u.y,y:u.x};if(pv.y>0)pv={x:-pv.x,y:-pv.y};
  if(B.y>D.p[PEL].y-4)pv={x:-pv.x,y:-pv.y};return{at:{x:B.x-pv.x*L,y:B.y-pv.y*L},wl:Math.atan2(pv.y,D.facing*pv.x),pv,u};}
// a man's weapon arm, part of the way from the elbow to the hand
function stnForearm(A,k){const e=A.p[ELF],h=A.p[HAF];return{x:lerp(e.x,h.x,k),y:lerp(e.y,h.y,k)};}
// the named poses the answers use (sk_anim.js POSE): what they do not say is his guard's
Object.assign(POSE.body,{
  stnBeat:{on:'guard',crouch:.82,lean:.06,th:.3},          // Bound: into the beat
  stnBrace:{on:'guard',crouch:.83,lean:.02,th:.4},         // Bound: braced behind the locked blade
  stnInside:{on:'guard',crouch:.74,lean:.22,th:.2},        // Close: in under his swing
  stnThrow:{on:'guard',crouch:.84,lean:.08,th:.3},         // Unbound: the chain thrown
  stnYank:{on:'guard',crouch:.82,lean:-.24,th:.3}});       // ... and the arm yanked
Object.assign(POSE.arm,{
  stnBeat:{off:[.28,.08],tilt:-.04},stnBrace:{tilt:-.06},stnInside:{hx:.22,hy:.3,wg:.9,tilt:.08},
  stnThrowBack:{hx:-.22,hy:-.46,w:-2.4,off:[.3,.14],tilt:-.06},stnYank:{on:'guard',hx:-.02,hy:.34,off:[.26,.22],tilt:-.1}});
const STN_ANSWER={
  // the locked blade meets the point out in front of him and knocks it off its line, down and aside
  beat(D,A,kind,res,Timp,Cfn,theta,fa,now){const B=Cfn(),{at,wl,pv}=stnAcross(D,fa,theta,B),a=D.arm,Ts=Math.max(0,Timp-lerp(.14,.28,D.sk)),end=Timp+.5;
    const meet={x:at.x-fa*6,y:at.y};
    return{t0:S.t,end,stn:'beat',
      body:bodyKeys(D,[[0,now],[Ts,'guard'],[Timp-.02,'stnBeat',eOut],[Timp+.12,'blockGive',sstep],[end,'guard']]),
      arm:armKeys(D,[[0,now],[Ts,'guard'],[Timp-.02,'stnBeat',{hand:{w:meet},wAng:wl},eOut],[Timp+.07,'stnBeat',{hand:{w:{x:meet.x+pv.x*.3*a,y:meet.y+pv.y*.3*a+.1*a}},wAng:wl+.65},eOut],
        [end,'guard',sstep]]),
      evs:[{t:Timp,fn:()=>{if(A.dead||D.dead)return;for(const [i,k] of [[TIP,260],[HAF,90]]){const q=A.p[i];q.px-=pv.x*k*DT;q.py-=(pv.y*k+80)*DT;}
        if(!S.warming){flash(B,14,'#cfeaff',D.dep);}}}]};},
  // the blade across the cut, the free hand braced on its back near the tip, and it does not give: the blow rebounds off it
  blade(D,A,kind,res,Timp,Cfn,theta,fa,now){const B=Cfn(),{at,wl,u}=stnAcross(D,fa,theta,B),Ts=Math.max(0,Timp-lerp(.12,.3,D.sk)),end=Timp+.55;
    const brace={fn:()=>{const h=D.p[HAF],t=D.p[TIP];return{x:lerp(h.x,t.x,.62),y:lerp(h.y,t.y,.62)};}};
    return{t0:S.t,end,stn:'blade',
      body:bodyKeys(D,[[0,now],[Ts,'guard'],[Timp-.01,'stnBrace',eOut],[Timp+.24,'stnBrace'],[end,'guard']]),
      arm:armKeys(D,[[0,now],[Ts,'guard'],[Timp-.01,'stnBrace',{hand:{w:at},wAng:wl,off:brace},eOut],[Timp+.22,'stnBrace',{hand:{w:{x:at.x+fa*2,y:at.y+1}},wAng:wl,off:brace}],
        [end,'guard',sstep]]),
      evs:[{t:Timp,fn:()=>{if(A.dead||D.dead)return;for(const [i,k] of [[TIP,220],[HAF,70]]){const q=A.p[i];q.px+=u.x*k*DT;q.py+=u.y*k*DT;}}}]};},
  // a step in under his swing: the free hand on his arm, the blade short at his ribs, and back out to his guard after it
  inside(D,A,kind,res,Timp,Cfn,theta,fa,now){const Ts=Math.max(0,Timp-lerp(.2,.34,D.sk)),end=Timp+.62,s0=D.station,to=-fa;
    const room=Math.abs(A.station-D.station)-(A.body.bulk+D.body.bulk)*9-26,step=clamp(room*.6,6,26),px=s0+to*step;
    const hand=jammedTech(A,res.tech)?{fn:()=>{const h=A.p[HAF],t=A.p[TIP];return{x:lerp(h.x,t.x,.3),y:lerp(h.y,t.y,.3)};}}:{fn:()=>stnForearm(A,.45)};
    return{t0:S.t,end,stn:'inside',
      body:bodyKeys(D,[[0,now],[Ts,'guard'],[Timp-.03,'stnInside',{px},eOut],[Timp+.2,'stnInside',{px}],[end,'guard',sstep]]),
      arm:armKeys(D,[[0,now],[Ts,'guard'],[Timp-.03,'stnInside',{off:hand},eOut],[Timp+.2,'stnInside',{off:hand}],[end,'guard',sstep]]),
      evs:[{t:Timp-.02,fn:()=>{if(A.dead||D.dead)return;const q=A.p[ELF];q.px+=to*60*DT;if(!S.warming)flash(stnForearm(A,.45),10,'#cfeaff',D.dep);}}]};},
  // the chain thrown round his forearm as he comes in, and the arm yanked off its line before it comes down (the drawn chain: stnCatch)
  catch(D,A,kind,res,Timp,Cfn,theta,fa,now){const Tc=Math.max(.18,Timp-.16),ta=Math.max(.04,Tc-.14),end=Timp+.62,at=()=>stnForearm(A,.62);
    const aim=()=>{const c=D.p[CHE],p=at(),dx=p.x-c.x,dy=p.y-c.y,l=Math.hypot(dx,dy)||1;return{x:c.x+dx/l*D.arm*.85,y:c.y+dy/l*D.arm*.85};},
      line=()=>{const c=D.p[CHE],p=at();return Math.atan2(p.y-c.y,D.facing*(p.x-c.x));};
    D.stnCatch={t0:S.t,a:ta,b:Tc,c:Timp+.18,d:Timp+.45,A};
    return{t0:S.t,end,stn:'catch',
      body:bodyKeys(D,[[0,now],[Math.max(0,ta-.06),'guard'],[Tc,'stnThrow',eOut],[Timp-.02,'stnYank',eOut],[Timp+.22,'stnYank'],[end,'guard',sstep]]),
      arm:armKeys(D,[[0,now],[Math.max(0,ta-.06),'guard'],[ta,'stnThrowBack',eOut],[Tc,'guard',{hand:{fn:aim},wAng:line},eOut],[Timp-.02,'stnYank',{wAng:line},eOut],
        [Timp+.22,'stnYank'],[end,'guard',sstep]]),
      evs:[{t:Tc,fn:()=>{if(A.dead||D.dead)return;S.hooks.sound('whipcrack',.6);if(!S.warming)flash(at(),12,'#e6fffb',A.dep);}},
        {t:Timp-.05,fn:()=>{if(A.dead||D.dead)return;for(const [i,k] of [[HAF,240],[ELF,160],[TIP,300]]){const q=A.p[i];q.px-=fa*k*DT;q.py+=40*DT;}S.hooks.sound('reel',.5);}}]};}};
{const pr=planReaction;planReaction=function(D,A,kind,res,Timp,Cfn,theta,rnd,snap,faO){const key=stnAnswerKey(D,A,kind,res);if(!key)return pr.apply(this,arguments);
  const fa=faO??A.facing,M=STN_ANSWER[key](D,A,kind,res,Timp,Cfn,theta,fa,snap?'now':'guard');if(!M)return pr.apply(this,arguments);
  // with a Slip or a Step back: its body (and where it puts him), the answer's arm
  if(D.react==='slip'||D.react==='back'){const R=pr.apply(this,arguments);return{...R,arm:M.arm,evs:[...(R.evs||[]),...(M.evs||[])],end:Math.max(R.end||0,M.end),stn:M.stn,stnWith:D.react};}
  return M;};}
// an elf's exchange runs at his pace (compressEx, sk_elf.js): the leads' throws of the chain and the catch go at it with the rest
{const ce=compressEx;compressEx=function(ex){const was=ex&&ex._r;ce.apply(this,arguments);if(!ex||was||!ex._r||!(ex.rate>1))return;
  const r=ex.rate,same=t=>Math.abs(t-ex.t0)<1e-6;
  for(const f of S.F){const L=f.lash;if(L&&L.leads&&!L.leads._r&&same(L.t0)){L.leads._r=r;for(const w of L.leads)for(const k of ['a','b','c','d'])w[k]/=r;}
    const C=f.stnCatch;if(C&&!C._r&&same(C.t0)){C._r=r;for(const k of ['a','b','c','d'])C[k]/=r;}}};}
// (the stance's answer is the miss: the elf's evasion would act out another one)
{const ee=elfEvade;elfEvade=function(ex){if(ex&&ex.D&&ex.D===hero()&&ex.plan&&ex.plan.react&&ex.plan.react.stn)return;return ee.apply(this,arguments);};}
V11.duelStart.push(()=>{for(const f of S.F)f.stnCatch=null;});
// ===== STANCE MOTION END =====
