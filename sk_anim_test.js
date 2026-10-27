// The animation's library (sk_anim.js) and the planners that use it: a fighter's rank in his motion, the variants of every blow and
// the combos, the answers acted out and the blows taken. Every variant of every blow with every weapon plays to its end and gets the
// blade to its man; a combo's leads are each parried and the blow lands where its plan says; none of it throws the game's dice or moves
// the man struck anywhere the rules did not; a Novice and a Master move as their ranks say and Ilyas keeps his own style.
const core=require('./sk_src.js')(process.argv[2]);
eval(core+`
const errs=[];let nOk=0,base=mulberry32(23),FORCE=[],REACTS=[],DICE=0;
const roll=()=>{DICE++;return base();};S.rng=roll;Math.random=roll;
function expect(label,ok,extra){if(ok)nOk++;else errs.push(label+(extra!=null?': '+extra:''));console.log((ok?'ok   ':'FAIL ')+label+(extra!=null?'  '+extra:''));}
// a forced outcome for the next attack roll (the die is picked to give it)
const _ra=resolveAttack;
resolveAttack=function(A,D,kind,op,T){T=T||pickTechnique(A,D,kind);const want=FORCE.shift();if(!want)return _ra(A,D,kind,op,T);
  const c=computeMods(A,D,kind,op,T);let pick=null;
  for(let v=2;v<20;v++){const tot=v+c.bonus,o=outcomeOf(v,tot,c.def);if(o===want){pick=v;break;}}
  if(pick==null)return _ra(A,D,kind,op,T);
  const save=S.rng;let first=true;S.rng=()=>{if(first){first=false;return(pick-.5)/20;}return roll();};const r=_ra(A,D,kind,op,T);S.rng=save;return r;};
const _aR=aiReact;aiReact=function(D,A,kind,T,op){const w=REACTS.shift();return w&&reactChoices(D,A).includes(w)?w:_aR(D,A,kind,T,op);};
// the flourishes are left out (an Expert's spin or leap is its own shape, not a variant)
styleRoll=()=>1;
// nobody takes an opening or flows on: one blow is one exchange
considerOpening=()=>{};considerFlow=()=>{};considerGang=()=>{};
const CL=[];{const lc=leadClash;leadClash=function(...a){const d0=DICE;lc(...a);CL.push(DICE-d0);};}
// A (the attacker: Ilyas, index 0, unless foe) with the weapon and rank given, the man he strikes a short step away on open ground
function setup(aw,as,dw,ds,o={}){S.arenaKey='field';S.auto=true;S.tableOn=false;S.divOn=false;S.cfg.n=1;S.cfg.crew=false;S.cfg.ally.on=false;S.introOn=false;
  base=mulberry32(o.seed||23);const hero=o.foe?[dw,ds]:[aw,as],foe=o.foe?[aw,as]:[dw,ds];
  S.cfg.hero={seed:2207,weapon:hero[0],skill:hero[1]};S.cfg.foes[0]={seed:5113,weapon:foe[0],skill:foe[1],temper:'plain'};
  S.F=[];rosterBuild();initDuel();if(S.table)S.table.on=false;
  const K=S.F[0],F=S.F[1];F.skill=foe[1];K.skill=hero[1];
  // plain: two men with no elven pace or evasions (a human with a lab name, and a hero who is not Ilyas), so the times are the plan's
  if(o.plain!==false){F.name='Field hand';F.human=true;K.name='Ilyas (test)';}
  for(const f of [K,F]){f.maxHp=f.hp=o.hp||999;f.ready=1e6;}
  K.station=380;K.lane=K.dep=K.stepDep=92;K.facing=1;K.build();
  F.station=K.station+engageGap(K,F)+(o.gap??14);F.lane=F.dep=F.stepDep=92;F.side=1;F.facing=o.back?1:-1;F.build();if(o.back)F.holdFace=0;
  warm(60);const A=o.foe?F:K,D=o.foe?K:F;
  const g=S.game;g.phase='input';g.active=A.idx;g.aiAt=null;S.opening=null;g.ex=null;for(const f of S.F){f.intent=null;f.foot=footMaxOf(f);f.reads={};}
  if(o.back)D.facing=1;
  FORCE=[];REACTS=[];CL.length=0;return{A,D};}
// one blow, played to the end of its exchange: what came of it
function blow(st,kind,out,react,force){
  S.animForce=force||null;FORCE=[out];REACTS=react?[react]:[];const d0=DICE,{A,D}=st;
  const ok=command(A.idx,kind),ex=S.game.ex,plan=ex&&ex.plan,dCmd=DICE-d0;
  if(!ok||!plan){S.animForce=null;return{ok:false};}
  let n=0,nan=false,minD=1e9,impT=null;const t0=ex.t0;
  for(;n<120*14;n++){simStep();
    for(const f of S.F)for(const q of f.p)if(!Number.isFinite(q.x+q.y))nan=true;
    const lt=S.t-t0;if(S.game.ex===ex&&ex.plan&&lt>=plan.Timp-.12&&lt<=plan.Td+.1){const sg=plan.contactSeg();minD=Math.min(minD,segDist(plan.Cfn(),sg[0],sg[1]));}
    if(impT==null&&ex.impactDone)impT=lt;
    if(S.opening)tickOpening(9);
    if(S.game.ex!==ex&&!S.opening)break;}
  S.animForce=null;
  return{ok:true,ex,plan,res:ex.res,dCmd,n,nan,minD,impT,ended:S.game.ex!==ex,A,D,Ds:D.station,Dl:D.lane,anim:plan.anim};}

// ---------- his rank in the motion ----------
{const {A:N}=setup('sword',1,'sword',3,{foe:true}),g3=GUARD.sword,gN=styleGuard(N);
  expect('a Novice holds his guard higher, narrower and stiffer, the blade more upright',gN.hy<g3.hy&&gN.sf<g3.sf&&gN.crouch>g3.crouch&&gN.w<g3.w,JSON.stringify({hy:+gN.hy.toFixed(3),sf:+gN.sf.toFixed(3),crouch:+gN.crouch.toFixed(3),w:+gN.w.toFixed(3)}));
  expect('his rank\\'s guard is the same object every time (kept)',skillGuard(N)===skillGuard(N));
  const mN=styleMoves(N,null);expect('a Novice overswings and is slow back to guard',mN.reach>1&&mN.recover>1&&mN.cock>1,JSON.stringify(mN));
  const kN=attackTable(N);expect('a Novice swings with his arm, not his body, and carries on further after it',kN.form.slash.lean<ATTACK.form.slash.lean&&kN.carry[0]>ATTACK.carry[0]&&kN.drive[0]<ATTACK.drive[0]);}
{const {A:M}=setup('sword',5,'sword',3,{foe:true}),g3=GUARD.sword,gM=styleGuard(M),mM=styleMoves(M,null),kM=attackTable(M);
  expect('a Master stands lower and wider, his free hand up',gM.crouch<g3.crouch&&gM.sf>g3.sf&&gM.off[1]<g3.off[1],JSON.stringify({crouch:gM.crouch,sf:gM.sf,off:gM.off}));
  expect('a Master drives the blow from the body and is back on guard sooner',kM.form.slash.lean>ATTACK.form.slash.lean&&kM.drive[0]>ATTACK.drive[0]&&mM.recover<1&&mM.reach<1);
  M.skill=3;expect('a Veteran\\'s is the regular motion',styleGuard(M)===GUARD.sword&&attackTable(M)===ATTACK&&styleMoves(M,null)===ANIM_MOVES);}
{const {A:K}=setup('elven',5,'sword',3,{plain:false}),g=GUARD.elven,k=TACTICAL.guard,gK=styleGuard(K);
  expect('Ilyas keeps his own style: the tactical guard on the arc-blade\\'s, as before',gK.hx===g.hx*k.hand&&gK.crouch===g.crouch+k.crouch&&gK.sf===g.sf*k.stance&&attackTable(K)===ATTACK&&styleMoves(K,null)===TACTICAL.moves);}

// ---------- every variant of every blow, with every weapon ----------
const WEAPONS_T=['sword','axe','spear','dagger','fists','elven','club','shard'],OUTS=['hit','block','dodge'],seen={};let plays=0;const bad=[];
for(const w of WEAPONS_T)for(const kind of ATTACKS)for(const out of OUTS){
  // the blow as it always was, then each variant his weapon has, from the same dice
  const base0=blow(setup(w,4,'sword',2),kind,out,'parry',{variant:(ATTACK.variant[kind][0]||{}).key,combo:[]});
  if(!base0.ok)continue;
  for(const v of ATTACK.variant[kind]){const st=setup(w,4,'sword',2),r=blow(st,kind,out,'parry',{variant:v.key,combo:[]});if(!r.ok)continue;plays++;
    const got=r.anim&&r.anim.variant,T=r.res.tech;
    if(got&&got!==v.key&&variantWeight(st.A,kind,v,null,null)>0)bad.push(w+' '+kind+' '+v.key+': came as '+got);
    if(r.nan)bad.push(w+' '+kind+' '+v.key+' '+out+': NaN');
    if(!r.ended)bad.push(w+' '+kind+' '+v.key+' '+out+': never ended');
    if((out==='hit'||out==='block')&&got&&!T.kick&&r.minD>22)bad.push(w+' '+kind+' '+v.key+' '+out+': the blade never got to him ('+r.minD.toFixed(1)+')');
    if(r.dCmd!==base0.dCmd)bad.push(w+' '+kind+' '+v.key+': '+r.dCmd+' dice thrown against '+base0.dCmd);
    if(Math.abs(r.Ds-base0.Ds)>1e-9||Math.abs(r.Dl-base0.Dl)>1e-9)bad.push(w+' '+kind+' '+v.key+' '+out+': the man struck ended elsewhere ('+r.Ds.toFixed(1)+','+r.Dl.toFixed(1)+' against '+base0.Ds.toFixed(1)+','+base0.Dl.toFixed(1)+')');
    if(got)seen[kind+':'+got]=(seen[kind+':'+got]||0)+1;}}
expect('every variant of every blow, with every weapon, lands, is blocked or is slipped and plays to its end: the blade gets to him, no dice are thrown for it, and the man struck ends up where the rules put him',
  !bad.length&&plays>200,plays+' blows'+(bad.length?'; '+bad.slice(0,6).join('; '):''));
expect('each variant came where its weapon has it',Object.keys(seen).length>=14,Object.keys(seen).sort().join(' '));

// ---------- combos ----------
{const bad=[];let n=0;
  for(const kind of ATTACKS)for(const out of ['hit','block','dodge'])for(const L of [1,2]){
    const lead=ATTACK.combo.leads[kind].slice(0,L).map(p=>p[0]+':'+p[1]);
    // (a Parry against an Expert's overhead makes it a Murder-stroke, a technique of its own: a Step back is answered there)
    // (against a Parry an Expert's thrust is Beat and thrust, its own combo: checked below)
    const ans=kind==='overhead'||kind==='thrust'?'back':'parry';
    const b0=blow(setup('sword',5,'sword',3),kind,out,ans,{variant:ATTACK.variant[kind][0].key,combo:[]});
    const r=blow(setup('sword',5,'sword',3),kind,out,ans,{variant:ATTACK.variant[kind][0].key,combo:lead});if(!r.ok||!b0.ok)continue;n++;
    const P=r.plan.combo,tag=kind+' '+out+' x'+L;
    if(!P||P.hits.length!==L){bad.push(tag+': '+(P?P.hits.length:0)+' leads');continue;}
    if(CL.length!==L)bad.push(tag+': '+CL.length+' parries met');
    if(CL.some(d=>d!==0))bad.push(tag+': a parry threw the game\\'s dice');
    if(r.impT==null||r.impT<P.hits[L-1].IL)bad.push(tag+': the blow landed before its last lead ('+r.impT+')');
    const ra=r.plan.react.arm;for(const h of P.hits)if(!ra.some(k=>Math.abs(k.t-(h.IL-.01))<1e-6))bad.push(tag+': no parry at '+h.IL.toFixed(2));
    if(r.nan||!r.ended)bad.push(tag+': '+(r.nan?'NaN':'never ended'));
    if(r.dCmd!==b0.dCmd)bad.push(tag+': '+r.dCmd+' dice against '+b0.dCmd);
    if(Math.abs(r.Ds-b0.Ds)>1e-9||Math.abs(r.Dl-b0.Dl)>1e-9)bad.push(tag+': the man struck ended elsewhere');}
  expect('a combo: each lead is parried where it meets him, the blow lands after the last of them, the exchange plays to its end and nothing of it throws the game\\'s dice or moves him',
    !bad.length&&n>=20,n+' combos'+(bad.length?'; '+bad.slice(0,6).join('; '):''));}
{const r=blow(setup('sword',4,'sword',3),'thrust','hit','parry',{variant:'line'}),P=r.plan.combo;
  expect('Beat and thrust: the beat on his blade comes first, then the thrust',r.ok&&r.res.tech.key==='beatthrust'&&P&&P.hits.length===1&&P.hits[0].beat&&CL.length===1&&r.impT>P.hits[0].IL&&r.ended&&!r.nan,
    r.res&&r.res.tech.key+' '+(P?P.leads.join(','):'no combo'));}
{const st=setup('sword',5,'sword',3),T=pickTechnique(st.A,st.D,'slash');let c5=0,c1=0;
  for(let i=0;i<400;i++){const res={seed:(i*2654435761)>>>0};if(blowCombo(st.A,st.D,'slash',T,res,{}))c5++;}
  st.A.skill=1;for(let i=0;i<400;i++){const res={seed:(i*2654435761)>>>0};if(blowCombo(st.A,st.D,'slash',T,res,{}))c1++;}
  expect('a Master opens with a combo about one blow in two, a Novice never',c5>160&&c5<260&&c1===0,c5+'/400 and '+c1+'/400');
  st.A.skill=5;let q=0,q2=0;for(let i=0;i<400;i++){const L=blowCombo(st.A,st.D,'slash',T,{seed:(i*2654435761)>>>0},{quick:true});if(L){q++;if(L.length>1)q2++;}}
  expect('a follow-up off an opening opens with a lead less often, and never with two',q>90&&q<c5&&q2===0,q+'/400');
  expect('a blow at a man on the floor or Broken comes straight in',!comboOK(st.A,{...st.D,downed:true},'slash',T,{})&&!comboOK(st.A,{...st.D,broken:{}},'slash',T,{}));}

// ---------- one blow after another ----------
{const st=setup('sword',3,'sword',3),A=st.A,V=ATTACK.variant.slash,rise=V.find(v=>v.key==='rise'),diag=V[0];
  const w0=variantWeight(A,'slash',rise,null,null),w1=variantWeight(A,'slash',rise,{kind:'slash',key:'diag'},'low');
  expect('a cut straight after one that left the blade low comes up from there more often (a rising cut)',w1>w0*3,w0.toFixed(2)+' then '+w1.toFixed(2));
  expect('the same cut again straight after is seldom',variantWeight(A,'slash',diag,{kind:'slash',key:'diag'},null)<diag.w*.5);}

// ---------- the answers acted out ----------
{const r=blow(setup('sword',3,'sword',3,{human:true}),'slash','block','counter',{variant:'diag',combo:[]}),k=r.plan.react;
  expect('a Counter meets the blow with a cut: drawn back as it comes and thrown on through it',r.ok&&k.arm.length>=6&&k.end>r.plan.Timp+.5&&!r.nan,k.arm.length+' keys');}
{const r=blow(setup('sword',3,'sword',4,{human:true}),'slash','block','parry',{variant:'diag',combo:[]}),Ti=r.plan.Timp,k=r.plan.react.arm.find(x=>Math.abs(x.t-(Ti+.18))<1e-6);
  expect('an Expert who parries rolls his blade over onto the other\\'s after it',!!k&&Math.abs(k.v.wAng-(r.plan.react.arm.find(x=>Math.abs(x.t-(Ti-.01))<1e-6).v.wAng+.35))<1e-6);}
{const r=blow(setup('sword',3,'sword',3,{human:true}),'sweep','dodge','back',{variant:'low',combo:[]}),k=r.plan.react.body;
  expect('Step back against a low blow is a hop back over it',r.ok&&k.some(x=>((typeof x.v==='function'?x.v():x.v).lift||0)>5)&&!r.nan&&r.ended);}
{const r=blow(setup('sword',3,'sword',3,{human:true}),'slash','hit','parry',{variant:'diag',combo:[]}),Ti=r.plan.Timp,k=r.plan.react.arm;
  expect('a Parry that comes too late is still on its way when the blow lands',r.ok&&k.some(x=>Math.abs(x.t-(Ti+.1))<1e-6&&x.v.hand&&x.v.hand.w));}
{const r=blow(setup('sword',3,'sword',3,{human:true}),'thrust','dodge','parry',{variant:'line',combo:[]}),Ti=r.plan.Timp,k=r.plan.react.arm;
  expect('a Parry that sends the blow wide beats it aside as he goes',r.ok&&k.some(x=>Math.abs(x.t-(Ti-.01))<1e-6&&x.v.hand&&x.v.hand.w));}

// ---------- the blows taken ----------
{const lens=[];for(const u of [.1,.3,.5,.7,.9])for(const kind of ['overhead','thrust','sweep','slash']){
    S.animForce={hit:u};const r=blow(setup('sword',3,'sword',3,{human:true}),kind,'hit',null,{variant:ATTACK.variant[kind][0].key,combo:[],hit:u});
    if(r.ok)lens.push(r.D.action?1:0);if(r.nan||!r.ended)lens.push(-99);}
  expect('every way of taking a blow plays to its end',lens.length>=20&&!lens.includes(-99));
  const nv=setup('sword',3,'sword',1,{human:true}).D,ms=setup('sword',3,'sword',5,{human:true}).D;
  expect('a blow shakes a Novice longer than a Master',hitTime(nv)>1&&hitTime(ms)<1,hitTime(nv)+' '+hitTime(ms));}

// ---------- the blow's context ----------
{let shown=null;for(const kind of ['slash','overhead','thrust']){const r=blow(setup('sword',5,'sword',2,{hp:5}),kind,'hit',null,{variant:ATTACK.variant[kind][0].key,combo:[]});
    const fin=r.ok&&r.res.tech.fin;if(!r.ok||(fin&&(fin.pierce||fin.bite||fin.hold)))continue;
    const K=attackTable(r.A);shown=!!r.plan.att.arm.find(x=>x.v&&x.v.wAng===K.flick.w);break;}
  expect('a Master flicks the blade after a kill',shown===true,String(shown));}
{const r=blow(setup('sword',3,'sword',3,{back:true,human:true}),'thrust','hit',null,{variant:'line',combo:[]});
  const ik=r.plan.att.arm.find(x=>Math.abs(x.t-r.plan.Timp)<1e-9);
  expect('from behind, the free hand takes him by the shoulder as the blow goes in',r.ok&&r.res.back&&ik&&ik.v.off&&typeof ik.v.off.fn==='function');}

console.log('errors',errs.length,JSON.stringify(errs));
`);
