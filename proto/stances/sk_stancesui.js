// ===== STANCES UI (test) START =====
// The test page's side of its two rules (sk_downfork.js, sk_stances.js). The dock gets a stance bar over the moves: Bound, Unbound and
// Close, the one he holds lit, the one that answers his target marked with the reason; tapping one on his turn (or Z, X and C) changes
// it at once, his guard and his blade with it, and the four strikes show that stance's moves and odds. In Unbound the blade is a
// bladed whip, a chain drawn as it swings. A man on the floor is labelled for what comes next (he rises free at his turn, or he was
// struck and must get up), and the tip line says what the stance or the fall means now. The page opens straight on a fight; the
// Setup button changes the fight and turns either rule off for comparison.
const STNUI={bsig:'',t:0,set:false,el:{},mix:'mixed'};
const STN_X='<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2 L10 10 M10 2 L2 10"></path></svg>';
const STN_KEYS={z:'bound',x:'unbound',c:'close'};
function stnEsc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

// ---------- the blade, unbound: a bladed whip ----------
// The nine plates hang loose on the thread from the hilt as a chain the page simulates as it goes (the rules read nothing from it):
// it hangs and sways at rest and trails his hand as he moves and winds up; on the throw its tip is carried from wherever it trails
// onto the blade's tip (the stick the game reads, which is where the blow has to land) by the impact, so the chain rolls out after
// the hand and snaps straight there; then it falls slack and is reeled in. For a relocked blow, and to take a blow on the blade, it
// locks into the blade and comes loose again after. Node 2i and 2i+1 are the two ends of plate i; node 0 is held at the throat.
// (R: the chain's length from the throat at rest; damp: what each step keeps of the chain's speed, in the throw and at rest)
const WHIPD={N:9,g0:4.5,sl:(58-4.5)/9,R:66,it:10,damp:.994,dampRest:.986};
function whipOn(f){return!!f&&f===hero()&&stanceOf(f)==='unbound'&&!f.downed&&!f.dead&&f.weaponKey==='elven';}
// locked: a blow of his own that is not the whip (relocked inside his reach, or on a man on the floor), or a blow on him that he
// takes on the blade
function whipRigid(f){const ex=S.game&&S.game.ex;if(!ex||!ex.res)return false;
  if(ex.A===f)return ATTACKS.includes(ex.res.kind)&&!!ex.res.tech&&!ex.res.tech.lash;
  return(ex.D===f&&ex.res.out==='block')||(ex.D2===f&&!!ex.res2&&ex.res2.out==='block');}
function whipFrame(f){const h=f.p[HAF],t=f.p[TIP],L=Math.hypot(t.x-h.x,t.y-h.y)||1,ux=(t.x-h.x)/L,uy=(t.y-h.y)/L;return{h,t,ux,uy,ax:h.x+ux*WHIPD.g0,ay:h.y+uy*WHIPD.g0};}
// the plates laid along the blade's line at the chain's length, at rest
function whipLay(f,W){const {N,sl}=WHIPD,F=whipFrame(f),gap=Math.max(0,(W.R-N*sl)/(N-1));
  for(let i=0;i<N;i++){const a=i*(sl+gap);for(const [j,s] of [[2*i,a],[2*i+1,a+sl]]){W.x[j]=W.px[j]=F.ax+F.ux*s;W.y[j]=W.py[j]=F.ay+F.uy*s;}}}
function whipNew(f){const n=2*WHIPD.N,W={x:new Float64Array(n),y:new Float64Array(n),px:new Float64Array(n),py:new Float64Array(n),R:WHIPD.N*WHIPD.sl,t:S.t,F:S.F,rigid:false,hot:0,
  throw:null,Rc:null,lash:null};whipLay(f,W);return W;}
function whipStep(f,W,dt){
  const {N,sl,it}=WHIPD,n=2*N,F=whipFrame(f),L=f.lash&&f.lash.whip?f.lash:null,last=n-1,toR=(R,k)=>R+(WHIPD.R-R)*(1-Math.exp(-dt*k)),damp=L?WHIPD.damp:WHIPD.dampRest;
  // (a fighter put somewhere new, not moved there: the chain is laid out again from the hilt)
  if(Math.hypot(W.x[0]-F.ax,W.y[0]-F.ay)>30){whipLay(f,W);return;}
  let pin=null;
  if(L!==W.lash){W.lash=L;W.throw=null;W.Rc=null;}
  if(L){const u=S.t-L.t0,chord=Math.hypot(F.t.x-F.ax,F.t.y-F.ay);W.hot=1;
    // windup: the chain trails; the throw: its tip carried from where it trailed onto the blade's tip, fastest at the end; the
    // impact and the hold: straight onto it; then let go and reeled in
    if(u<L.a)W.R=toR(W.R,6);
    else if(u<L.b){if(!W.throw)W.throw={x:W.x[last],y:W.y[last]};const q=(u-L.a)/Math.max(.01,L.b-L.a),w=q*q;
      W.R=chord+Math.pow(1-q,1.4)*(10+.24*chord);pin={x:lerp(W.throw.x,F.t.x,w),y:lerp(W.throw.y,F.t.y,w)};}
    else if(u<L.c){W.R=chord;pin={x:F.t.x,y:F.t.y};}
    else{if(W.Rc==null)W.Rc=W.R;W.R=lerp(W.Rc,WHIPD.R,sstep((u-L.c)/Math.max(.05,L.d+.3-L.c)));}}
  else{W.R=toR(W.R,5);W.hot=Math.max(0,W.hot-dt*2);}
  W.R=Math.max(N*sl,W.R);
  const gap=(W.R-N*sl)/(N-1),g=G*dt*dt;
  // the hanging chain ripples a little down its length, as if the thread were alive in it
  const rip=pin?0:110*dt*dt,ph=S.t*2.6;
  for(let i=1;i<n;i++){const vx=(W.x[i]-W.px[i])*damp,vy=(W.y[i]-W.py[i])*damp;W.px[i]=W.x[i];W.py[i]=W.y[i];
    let fx=0,fy=0;if(rip){const dx=W.x[i]-W.x[i-1],dy=W.y[i]-W.y[i-1],l=Math.hypot(dx,dy)||1,a=rip*Math.sin(ph-i*.42)*(i/n);fx=-dy/l*a;fy=dx/l*a;}
    W.x[i]+=vx+fx;W.y[i]+=vy+g+fy;}
  for(let k=0;k<it;k++){
    W.x[0]=F.ax;W.y[0]=F.ay;
    // the first plate leaves the throat along the hilt
    W.x[1]=lerp(W.x[1],F.ax+F.ux*sl,.3);W.y[1]=lerp(W.y[1],F.ay+F.uy*sl,.3);
    if(pin){W.x[last]=pin.x;W.y[last]=pin.y;}
    for(let j=0;j<last;j++){const rest=j%2?gap:sl,dx=W.x[j+1]-W.x[j],dy=W.y[j+1]-W.y[j],d=Math.hypot(dx,dy)||1e-6;
      const wa=j===0?0:1,wb=pin&&j+1===last?0:1,ws=wa+wb;if(!ws)continue;const c=(d-rest)/d/ws;
      W.x[j]+=dx*c*wa;W.y[j]+=dy*c*wa;W.x[j+1]-=dx*c*wb;W.y[j+1]-=dy*c*wb;}}
  // the ground
  for(let i=1;i<n;i++){const gy=f.gr(W.x[i])-.6;if(W.y[i]>gy){W.y[i]=gy;W.px[i]=lerp(W.px[i],W.x[i],.4);}}}
function whipTick(){const K=S.F&&S.F[0];if(!K||!K.p)return;
  if(!whipOn(K)){K._whip=null;return;}
  let W=K._whip;if(!W||W.F!==S.F||S.t<W.t||S.t-W.t>.25)W=K._whip=whipNew(K);
  const dt=S.t-W.t;W.t=S.t;if(dt<=0)return;
  if(whipRigid(K)){if(!W.rigid){W.rigid=true;K.relockT=S.t;}W.R=WHIPD.N*WHIPD.sl;whipLay(K,W);return;}
  if(W.rigid){W.rigid=false;S.hooks.sound('unroll',.35);}
  whipStep(K,W,dt);}
{const ss=simStep;simStep=function(){ss.apply(this,arguments);whipTick();};}
// the snare's wrap: the chain round his shin while it holds
function whipWrap(f){const ex=S.game&&S.game.ex,L=f.lash;if(!ex||ex.A!==f||!L||!L.wrap||!ex.res||!['hit','crit'].includes(ex.res.out))return null;
  const u=S.t-L.t0;if(u<L.b-.01||u>L.c+.06)return null;const D=ex.D,k=D.p[KNF],q=D.p[FTF],C=ex.plan.Cfn(),l=Math.hypot(q.x-k.x,q.y-k.y)||1;
  return{x:C.x,y:C.y,dx:(q.x-k.x)/l,dy:(q.y-k.y)/l,k:clamp((u-L.b)/.08,0,1)};}
{const as=arcState;arcState=function(f){const st=as.apply(this,arguments),W=f._whip;
  if(!W||W.rigid||!whipOn(f)||(st&&st.mode!=='lash'&&st.mode!=='pulse'))return st;
  const pts=[];for(let i=0;i<W.x.length;i++)pts.push({x:W.x[i],y:W.y[i]});
  return{mode:'whip',pts,hot:W.hot,wrap:whipWrap(f)};};}
// drawn: the hilt as the blade draws it (its own drawing, cut off at the throat), then the thread and the plates along the chain
function whipClipHilt(c,h,t,fn){const L=Math.hypot(t.x-h.x,t.y-h.y)||1,ux=(t.x-h.x)/L,uy=(t.y-h.y)/L,cx=h.x+ux*4.6,cy=h.y+uy*4.6,R=90;
  c.save();c.beginPath();c.moveTo(cx-uy*R,cy+ux*R);c.lineTo(cx+uy*R,cy-ux*R);c.lineTo(cx+uy*R-ux*R,cy-ux*R-uy*R);c.lineTo(cx-uy*R-ux*R,cy+ux*R-uy*R);c.closePath();c.clip();
  try{fn();}finally{c.restore();}}
function whipHalf(s){return s<.86?2.4+.7*(1-s/.86):2.4*(1-(s-.86)/.14);}
function whipPlates(pts,sd){const {N,sl}=WHIPD,s=sd<0?-1:1,out=[];
  for(let i=0;i<N;i++){const A=pts[2*i],B=pts[2*i+1];let dx=B.x-A.x,dy=B.y-A.y;const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;
    const mx=-dy*s,my=dx*s,cx=(A.x+B.x)/2,cy=(A.y+B.y)/2,hl=sl*.47,E=[],Sp=[];
    for(let k=0;k<=5;k++){const v=-hl+2*hl*k/5,u=(i*sl+(v+hl))/(N*sl),hw=i===N-1?whipHalf(Math.min(1,.86+.14*(v+hl)/(2*hl))):whipHalf(u);
      E.push([cx+dx*v+mx*hw,cy+dy*v+my*hw]);Sp.push([cx+dx*v-mx*hw*.9,cy+dy*v-my*hw*.9]);}
    out.push({E,Sp});}
  return out;}
const WHIP_TONES={};
function whipTones(P){const key=P.blade+P.bladeEdge;if(WHIP_TONES[key])return WHIP_TONES[key];const m=ArmsLook.mix;
  return(WHIP_TONES[key]={shade:m(P.blade,'#000000',.55),sheen:m(P.blade,'#a9c4e6',.3),bevel:m(m('#cfd9e6',P.bladeEdge,.3),P.blade,.42),knuckle:m(P.blade,'#a9c4e6',.12)});}
function whipPaint(c,st,sd,P,o,ax,ay){const pts=st.pts,k=o.alpha==null?1:o.alpha,PL=whipPlates(pts,sd),T=whipTones(P),hot=.55+.45*(st.hot||0);
  const poly=Q=>{c.beginPath();c.moveTo(Q[0][0],Q[0][1]);for(let i=1;i<Q.length;i++)c.lineTo(Q[i][0],Q[i][1]);c.closePath();};
  const lp=(A,B,f)=>[lerp(A[0],B[0],f),lerp(A[1],B[1],f)];
  c.save();c.lineCap='round';c.lineJoin='round';
  // the thread of light the plates are strung on
  c.globalCompositeOperation='lighter';c.beginPath();c.moveTo(ax,ay);for(const q of pts)c.lineTo(q.x,q.y);
  c.strokeStyle=P.glow;c.lineWidth=2.6;c.globalAlpha=k*.3*hot;c.stroke();c.strokeStyle=P.glow2;c.lineWidth=.9;c.globalAlpha=k*.85*hot;c.stroke();c.globalCompositeOperation='source-over';
  PL.forEach((pl,i)=>{const {E,Sp}=pl,n=E.length,body=[...Sp,...E.slice().reverse()],band=(f0,f1)=>{const a=[],b=[];for(let j=0;j<n;j++){a.push(lp(E[j],Sp[j],f0));b.push(lp(E[j],Sp[j],f1));}return[...a,...b.reverse()];};
    c.globalAlpha=k;poly(body);c.strokeStyle=o.line||'#04060a';c.lineWidth=o.line?o.lw*2:.7;c.stroke();c.fillStyle=P.blade;c.fill();
    c.globalAlpha=k*.85;c.fillStyle=T.shade;poly(band(.72,1));c.fill();c.globalAlpha=k*.6;c.fillStyle=T.sheen;poly(band(.3,.38));c.fill();
    c.globalAlpha=k*.92;c.fillStyle=T.bevel;poly(band(0,.2));c.fill();
    c.globalAlpha=k;c.strokeStyle=P.bladeEdge;c.lineWidth=.38;c.beginPath();c.moveTo(E[0][0],E[0][1]);for(let j=1;j<n;j++)c.lineTo(E[j][0],E[j][1]);c.stroke();
    // the slot the thread runs through, lit, and the hinge barrel at the plate's leading end
    const a=lp(E[0],Sp[0],.58),b=lp(E[n-1],Sp[n-1],.58);c.strokeStyle='#010304';c.lineWidth=.95;c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();
    c.globalCompositeOperation='lighter';c.strokeStyle=P.glow;c.lineWidth=.45;c.globalAlpha=k*hot;c.stroke();c.globalCompositeOperation='source-over';
    if(i){const q=lp(E[0],Sp[0],.9);c.globalAlpha=k;c.fillStyle=T.knuckle;c.beginPath();c.arc(q[0],q[1],.6,0,TAU);c.fill();c.fillStyle=P.gold;c.beginPath();c.arc(q[0],q[1],.24,0,TAU);c.fill();}});
  // the snare: the end of the chain wound round his shin
  const w=st.wrap;if(w){const px=-w.dy,py=w.dx,an=Math.atan2(py,px);
    for(const j of [-1.7,0,1.7]){const cx=w.x+w.dx*j,cy=w.y+w.dy*j;c.globalAlpha=k*w.k;c.strokeStyle=o.line||'#04060a';c.lineWidth=2.2;c.beginPath();c.ellipse(cx,cy,4.4,1.25,an,0,TAU);c.stroke();
      c.strokeStyle=P.blade;c.lineWidth=1.5;c.stroke();c.globalCompositeOperation='lighter';c.strokeStyle=P.glow;c.lineWidth=.45;c.globalAlpha=k*w.k*.9;c.stroke();c.globalCompositeOperation='source-over';}}
  c.restore();}
V11UI.init.push(()=>{
  if(typeof ArmsLook!=='undefined'&&ArmsLook.arc){const base=ArmsLook.arc;
    ArmsLook.arc=function(c,h,t,sd,st,P,o){if(!st||st.mode!=='whip')return base.apply(this,arguments);o=o||{};P=P||ArmsLook.ARC_NOIR;
      whipClipHilt(c,h,t,()=>base(c,h,t,sd,{mode:'lash',L:58.2},P,o));const L=Math.hypot(t.x-h.x,t.y-h.y)||1;
      whipPaint(c,st,sd,P,o,h.x+(t.x-h.x)/L*WHIPD.g0,h.y+(t.y-h.y)/L*WHIPD.g0);};}
  // the old figure's blade (S.classicLook): the same chain in its plain colours
  {const base=drawArcBladeAt;drawArcBladeAt=function(h,t,sd,st){if(!st||st.mode!=='whip')return base.apply(this,arguments);
    whipClipHilt(ctx,h,t,()=>base(h,t,sd,{mode:'lash',L:58.2}));const L=Math.hypot(t.x-h.x,t.y-h.y)||1;
    whipPaint(ctx,st,sd,{blade:SIL,bladeEdge:'#ffd89a',gold:'#e2b65a',glow:ARC_GLOW,glow2:ARC_GLOW2},{},h.x+(t.x-h.x)/L*WHIPD.g0,h.y+(t.y-h.y)/L*WHIPD.g0);};}
});

// ---------- the stance bar ----------
function stnBarHtml(){const K=hero();if(!stanceOn(K)||K.dead)return'';const cur=stanceOf(K),can=stanceCanSwitch(K)&&!isAI(K.idx),D=targetOf(K),m=D?stanceMatch(K,D):null;
  let h=`<span class="stn-lbl">Stance</span><div class="stn-seg" role="group" aria-label="Stance">`;
  for(const s of STANCE_ORDER){const why=m===s?stanceReason(K,D,s):'';
    h+=`<button type="button" class="stn-b${s===cur?' on':''}${m===s&&why?' fit':''}" data-s="${s}" aria-pressed="${s===cur}"${can?'':' disabled'} title="${stnEsc(STANCES[s].line)}">`+
      `<span class="stn-n">${STANCES[s].name}</span><small>${stnEsc(why||STANCES[s].good)}</small></button>`;}
  return h+'</div>';}
function stnUiNow(){STNUI.t=0;}
function stnPick(s){const K=hero();if(!K||isAI(K.idx))return;ensureAudio();if(setStance(K,s)){updateStatus();stnUiNow();}}

// ---------- what the moment means: the tip line ----------
function stnTip(K,D){if(!K||K.dead)return'';const ob=DOWNF.rise==='off'?', off balance':'';
  if(DOWNF.on&&K.downed)return K.noRise?'Struck on the floor: no free rise. Get up or roll clear.':`You are down: you rise free at your turn${ob}. A blow on the floor takes that away.`;
  if(!D||D.dead)return'';
  if(DOWNF.on&&D.downed)return D.noRise?`${D.name} was struck on the floor: his next turn goes on getting up.`
    :D.hench?`${D.name} is down: a blow that lands now finishes him. Leave him and he rises at his turn${ob}.`
    :`${D.name} is down: strike him now and he loses his free rise. Leave him and he rises at his turn${ob}.`;
  const s=stanceOf(K);if(!s||K.clinch)return'';const w=stanceWord(D);
  // (kept to two lines on a phone: what a whip's Parry and Counter lose is in the answer window and the setup)
  if(s==='unbound'){if(!lashReady(K,D))return`Too close for the whip: your blows relock at ${STN_SIGNED(STN.relock)}. Step back, or change stance.`;
    if(!whipTip(K,D))return'Unbound: he is inside the tip, so the chain lands light. Step back to put him on the tip.';
    return D.weaponKey==='spear'?'Unbound: he is on the tip, so the whip cracks at full weight, and his spear cannot parry it.'
      :'Unbound: he is on the tip, so the whip cracks at full weight. If he closes in, he runs onto it.';}
  if(s==='close'){const others=foes().some(o=>o!==D&&upright(o)&&Math.abs(o.station-K.station)-engageGap(K,o)<90);
    if(stanceHeavy(D))return`Close: inside the ${w}, his blows come jammed (${STN_SIGNED(-2)}). Hilt and spine +1, grab +2.${others?` ${STN_SIGNED(STN.tied)} DEF to the others.`:''}`;
    return`Close: hilt and spine +1, grab +2. A ${w} is no worse inside.${others?` ${STN_SIGNED(STN.tied)} DEF to the others.`:''}`;}
  if(outreaches(K,D))return`Bound: the ${w} runs onto your point as he closes, and strikes at ${STN_SIGNED(STN.point)}. Grabs on you ${STN_SIGNED(-STN.grabDef)}.`;
  if(D.weaponKey==='spear')return`Bound: the spear outreaches you, so closing in hands him a stop-hit. Unbound outranges it.`;
  if(stanceHeavy(D))return`Bound: the blade at full length. Close gets inside the ${w}.`;
  return'';}
// a tip of the stance's or the fall's takes the place of the plain ones, never of the urgent ones (held, disarmed, out of balance)
{const fl=footingLine;footingLine=function(){const h=fl.apply(this,arguments);const K=cmdHero(),g=S.game;if(!h||!K||K!==hero()||K.dead)return h;
  const human=g.phase==='input'&&!isAI(g.active)&&!S.opening&&S.F[g.active]===K;if(!human)return h;const D=targetOf(K);
  const urgent=K.clinch||heldBy(K)||K.wp.unarmed||K.wp.improv||K.sidearm==='drawn'||K.foot<1||(D&&D.broken&&!D.downed);
  const t=stnTip(K,D);if(!t||(urgent&&!K.downed))return h;
  return h.indexOf('class="fl-tip')>=0?h.replace(/<span class="fl-tip[^"]*">[\s\S]*<\/span>$/,`<span class="fl-tip">${t}</span>`):h.replace(/(<\/span>)$/,'.$1')+` <span class="fl-tip">${t}</span>`;};}
// the preview strip names what a stance's move does
{const rt=roleTextBase;roleTextBase=function(A,D,k){if(ATTACKS.includes(k)&&D&&!D.downed&&A===hero()&&stanceOf(A)){const T=pickTechnique(A,D,k);if(T.stanceWhy)return`${T.name}: ${T.stanceWhy}`;}return rt.apply(this,arguments);};}
// his plate names the stance
{const us=updateStatus;updateStatus=function(){us.apply(this,arguments);const K=hero(),el=K?$('meta'+K.idx):null;if(el&&stanceOn(K)&&!K.dead)el.textContent=STANCES[stanceOf(K)].name+' · '+el.textContent;stnUiNow();};}

// ---------- a man on the floor ----------
{const il=intentLabel;intentLabel=function(f){if(DOWNF.on&&f&&f.downed&&!f.dead)return freeRiseOK(f)?'Rises free':'Must get up';return il.apply(this,arguments);};}
{const ui=updateIntents;updateIntents=function(){ui.apply(this,arguments);if(!DOWNF.on)return;
  for(const f of foes())if(f.downed)f._when=freeRiseOK(f)?(DOWNF.rise==='off'?'at his turn, off balance':'at his turn'):'struck on the floor';};}

// ---------- the setup ----------
const STN_ARENAS=[['street','Lamplight Street'],['field','Meadow'],['hill','Hillside'],['ledge','Broken ledge'],['wall','Ruin wall'],['restaurant','The bistro']];
const STN_MIX={mixed:null,brute:{weapon:'axe',temper:'brute'},keeper:{weapon:'spear',temper:'keeper'},rusher:{weapon:'dagger',temper:'rusher'}};
const STN_BASE=[{seed:5113,weapon:'axe',skill:3,temper:'brute'},{seed:7741,weapon:'spear',skill:2,temper:'keeper'},{seed:3190,weapon:'dagger',skill:2,temper:'rusher'}];
function stnApplyMix(){const m=STN_MIX[STNUI.mix];S.cfg.foes=STN_BASE.map(f=>m?{...f,...m}:{...f});}
function stnSetupHtml(){const opt=(grp,val,cur,label)=>`<button type="button" class="st-o" data-g="${grp}" data-v="${val}" aria-pressed="${String(cur)===String(val)}">${label}</button>`;
  const nOpt=S.cfg.crew?'crew':S.cfg.n;
  return`<div class="ss-in" role="dialog" aria-label="Test setup"><div class="ss-head"><span>Stance and rise test</span><button type="button" class="ss-x" aria-label="Close">${STN_X}</button></div>`+
    `<p class="ss-how"><b>Stances.</b> On your turn, before you act, pick Bound, Unbound or Close (or Z, X, C). It is free and holds till your next turn. <b>Bound</b> locks the blade: crescents and two-man strokes, and a dagger strikes at −2 to get past your point. <b>Unbound</b> looses it into a bladed whip that strikes from past your reach. The tip cuts hardest, so keep him at the end of the chain. The cut curls round a guard, a spear cannot parry it, and a man who closes runs onto the tip. Your Parry is at −1 and Counter at −2. <b>Close</b> chokes it up: hilt and spine, grab +2, and an axe that hits you is jammed. The marked stance answers your target.</p>`+
    `<p class="ss-how"><b>Falls.</b> A man knocked down rises free at his turn, off balance. Strike him on the floor and he loses that rise; a crew man is finished.</p>`+
    `<div class="ss-g"><span>Stances</span>${opt('stance',1,STANCE.on?1:0,'On')}${opt('stance',0,STANCE.on?1:0,'Off (today’s)')}</div>`+
    `<div class="ss-g"><span>Falls</span>${opt('down',1,DOWNF.on?1:0,'Rise free')}${opt('down',0,DOWNF.on?1:0,'Today’s')}</div>`+
    `<div class="ss-g"><span>Rise</span>${opt('rise','off',DOWNF.rise,'Off balance')}${opt('rise','committed',DOWNF.rise,'Committed')}</div>`+
    `<div class="ss-g"><span>Enemies</span>${[1,2,3].map(n=>opt('n',n,nOpt,n)).join('')}${opt('n','crew',nOpt,'Crew')}</div>`+
    `<div class="ss-g ss-wrap"><span>Who</span>${opt('mix','mixed',STNUI.mix,'Mixed')}${opt('mix','brute',STNUI.mix,'Axes (brutes)')}${opt('mix','keeper',STNUI.mix,'Spears (keepers)')}${opt('mix','rusher',STNUI.mix,'Daggers (rushers)')}</div>`+
    `<div class="ss-g ss-wrap"><span>Arena</span>${STN_ARENAS.map(([k,l])=>opt('arena',k,S.arenaKey,l)).join('')}</div>`+
    `<p class="ss-note">Enemies, who and arena start a new fight. The rules change at once.</p>`+
    `<div class="ss-foot"><button type="button" class="ss-go">New fight</button></div></div>`;}
function stnSetup(on){const E=STNUI.el;STNUI.set=on;E.setup.hidden=!on;S.paused=on;if(on)E.setup.innerHTML=stnSetupHtml();
  if(!on){try{localStorage.setItem('stn_seen','1');}catch(e){}}}
function stnNewFight(){stnSetup(false);stnApplyMix();S.F=[];restart();updateStatus();stnUiNow();}
function stnSetupPick(g,v){
  if(g==='n'){if(v==='crew'){S.cfg.n=1;S.cfg.crew=true;}else{S.cfg.n=+v;S.cfg.crew=false;}stnNewFight();return;}
  if(g==='mix'){STNUI.mix=v;stnNewFight();return;}
  if(g==='arena'){S.arenaKey=v;stnNewFight();return;}
  if(g==='stance'){STANCE.on=v==='1';const K=hero();if(K&&!STANCE.on)K.stance='bound';}
  if(g==='down')DOWNF.on=v==='1';
  if(g==='rise')DOWNF.rise=v;
  STNUI.el.setup.innerHTML=stnSetupHtml();updateStatus();stnUiNow();}
function stnSetBtnAt(){const E=STNUI.el,st=hudEl('stageWrap');if(!E.sb||!st)return;const R=st.getBoundingClientRect();let b=0;
  for(const el of [hudEl('hudTop'),...document.querySelectorAll('.wrap.hud .frow')]){if(!el||!el.offsetParent)continue;const r=el.getBoundingClientRect();if(r.height>0&&r.top<R.top+R.height*.4)b=Math.max(b,r.bottom-R.top);}
  const top=Math.round(b+8)+'px';if(E.sb.style.top!==top)E.sb.style.top=top;}
function stnUiFrame(){const E=STNUI.el;if(!E.bar)return;const on=STANCE.on&&HUD.state==='play'&&!S.story&&stanceOn(hero());
  E.bar.hidden=!on;E.wrap.classList.toggle('stn-on',on);
  const now=performance.now();if(now-STNUI.t<90)return;STNUI.t=now;stnSetBtnAt();if(!on)return;
  const b=stnBarHtml();if(b!==STNUI.bsig){STNUI.bsig=b;E.bar.innerHTML=b;}}

// ---------- put it on the page ----------
V11UI.init.push(()=>{
  // (the test opens on a fight, not the story's title)
  if(typeof storyMenu==='function')storyMenu(false);
  S.cfg.n=2;S.cfg.crew=false;S.cfg.ally.on=false;S.arenaKey='street';S.tableOn=true;stnApplyMix();
  const wrap=$('wrap'),cmds=$('commands');if(!wrap||!cmds)return;
  const bar=document.createElement('div');bar.id='stnBar';bar.className='stn-bar';cmds.insertBefore(bar,cmds.firstChild);
  const sb=document.createElement('button');sb.type='button';sb.id='stnSetBtn';sb.className='stn-setbtn';sb.textContent='Setup';wrap.appendChild(sb);
  const setup=document.createElement('div');setup.id='stnSetup';setup.className='stn-setup';setup.hidden=true;wrap.appendChild(setup);
  STNUI.el={wrap,bar,setup,sb};
  bar.addEventListener('click',e=>{const b=e.target.closest('.stn-b');if(b&&!b.disabled)stnPick(b.dataset.s);});
  sb.addEventListener('click',()=>stnSetup(!STNUI.set));
  setup.addEventListener('click',e=>{if(e.target===setup||e.target.closest('.ss-x')){stnSetup(false);return;}if(e.target.closest('.ss-go')){stnNewFight();return;}
    const o=e.target.closest('.st-o');if(o)stnSetupPick(o.dataset.g,o.dataset.v);});
  document.addEventListener('keydown',e=>{if(typingIn(e.target)||e.ctrlKey||e.metaKey||e.altKey||S.opening||STNUI.set)return;const s=STN_KEYS[e.key&&e.key.toLowerCase()];if(s){stnPick(s);e.preventDefault();}});
  // the whip's own sounds: the crack (a hard edge at once, then a short ring) and the plates reeled in on the thread
  {const snd=S.hooks.sound;S.hooks.sound=function(k,v){if(k!=='whipcrack'&&k!=='reel')return snd.apply(this,arguments);
    if(!S.soundOn||!AC||AC.state!=='running')return;const m=clamp(v||1,.3,1.4);
    try{if(k==='whipcrack'){const a=AC,t0=a.currentTime,src=a.createBufferSource(),hp=a.createBiquadFilter(),g=a.createGain();src.buffer=noiseBuf;hp.type='highpass';hp.frequency.value=1600;
        g.gain.setValueAtTime(.9*m,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+.055);src.connect(hp);hp.connect(g);g.connect(master);src.start(t0);src.stop(t0+.08);
        tone(.05,'square',2700,700,.06*m);nz(.2,'bandpass',1500,380,1.1,.16*m);}
      else{const a=AC;for(let i=0;i<8;i++){const t0=a.currentTime+i*.032,o=a.createOscillator(),g=a.createGain();o.type='square';o.frequency.setValueAtTime(2300-i*120,t0);
        g.gain.setValueAtTime(.022*m,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+.022);o.connect(g);g.connect(master);o.start(t0);o.stop(t0+.03);}}}catch(e){}};}
  // a stance taken: his name for it over him, and the blade's own sound
  S.hooks.stance=(K,s)=>{S.callouts.push({i:K.idx,text:STANCES[s].name,age:0,life:1.1,dx:0,dy:-26});S.hooks.sound(s==='unbound'?'unroll':s==='bound'?'lock':'shing',s==='close'?.5:.7);
    const h=K.p[HAF],t=K.p[TIP];flash({x:lerp(h.x,t.x,.5),y:lerp(h.y,t.y,.5)},s==='close'?14:24,'#8ff5e8',K.dep);stnUiNow();};
  S.hooks.freeRise=()=>stnUiNow();S.hooks.downStruck=()=>stnUiNow();
  // the log: a free rise is no Get up, and a stance taken is a line of its own
  const lg=S.hooks.log;S.hooks.log=function(e){if(e&&e.type==='getup'&&e.free){const li=newEntry(false);
      li.innerHTML=`<div class="lg-l">${who(e.A)}<span>rises free</span></div><div class="lg-perf">${DOWNF.rise==='off'?'off balance':'Committed'}, and the turn is his</div>`;pushEntry(li);return;}
    return lg.apply(this,arguments);};
  const sh=S.hooks.stance;S.hooks.stance=function(K,s){sh.apply(this,arguments);const li=newEntry(false);
    li.innerHTML=`<div class="lg-l">${who(K)}<span>takes ${STANCES[s].name}</span></div><div class="lg-perf">${STANCES[s].line}</div>`;pushEntry(li);};
  // the answer window says what the stance does to his answers
  const base=S.hooks.opening;
  S.hooks.opening=function(o){base.apply(this,arguments);if(!o||o.source!=='react'||o.f!==hero())return;const s=stanceOf(o.f),r=$('opReason');if(!r)return;
    if(s==='unbound')r.textContent+=` Unbound: Parry ${STN_SIGNED(STN.parry)}, Counter ${STN_SIGNED(STN.counter)}.`;
    else if(s==='close'&&S.F[getTgt(o.f)]!==o.opp)r.textContent+=` Tied up inside ${S.F[getTgt(o.f)]?S.F[getTgt(o.f)].name:'his man'}: ${STN_SIGNED(STN.tied)}.`;};
  V11UI.tick.push(stnUiFrame);
  // the first time, the setup opens with what the test is
  let seen=false;try{seen=localStorage.getItem('stn_seen')==='1';}catch(e){}
  if(!seen&&!window.SK_TEST)setTimeout(()=>{if(HUD.state==='play')stnSetup(true);},600);
});
// ===== STANCES UI (test) END =====
