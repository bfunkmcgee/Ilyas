// Page checks for Act I, the Pit (sk_pit.js, sk_pit2.js, sk_explore.js and their UI): scenes 1 to 4 played through from the fall's end,
// what is said and thought there, the act's and the scenes' cards, the man he is in the Pit (drained, one arm, four pips, what he wears,
// the hip dagger with the light gone out of it), walking about the back room by taps and keys and using what is in it, the Aether
// tab's one flicker, Tamm's crate and the gear screen, the yard (his lurch, the bucket in his one hand, the gate it must be set down
// for, the ladder that needs two hands), the end card, the menu in the Pit (what it holds as the act hands things over), and the
// Pit's look (no gold on him anywhere). From scene 5 on: the list and the shop (the purse kept for the list), the toll, Tamm's fight and
// the night (the goods given over, nobody walked through, his Flow drained), and Short Hand (a lesson ends even with nothing pressed).
// usage: node sk_act1_page.js   (needs test_page.html from build.py; PAGE=... to point it at another copy)
const SK_T0=Date.now();
const {chromium}=require('playwright');
const rep=[],errs=[],ACT1_DOBTOP=26;
function expect(label,cond,info){rep.push((cond?'ok   ':'FAIL ')+label+(process.env.SK_TIMING?' ['+((Date.now()-SK_T0)/1000).toFixed(1)+'s]':'')+(info!==undefined&&info!==''?'  '+info:''));if(!cond)errs.push(label+(info!==undefined?' ('+info+')':''));}
(async()=>{
  const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)}),pageErrs=[];
  const open=async(vw,vh,dpr)=>{const p=await (await b.newContext({viewport:{width:vw,height:vh},deviceScaleFactor:dpr})).newPage();
    p.on('pageerror',e=>pageErrs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|Failed to load/.test(m.text()))pageErrs.push(m.text());});
    await p.addInitScript(e=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};if(e)window.__drawEvery=e;},+process.env.SK_DRAW_EVERY||0);
    await p.goto('file://'+process.cwd()+'/'+(process.env.PAGE||'test_page.html'));await p.waitForTimeout(300);
    await p.evaluate(()=>{S.soundOn=false;let a=11;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
      window.__now=performance.now()+1000;
      // a frame stepped by hand (drawn one in eight unless asked), with every line and thought noted as it first shows
      window.LOG=[];let lastSay=null,lastTh=null;
      window.step=(k,o)=>{const ev=(o&&o.every)||window.__drawEvery||8;for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(!f)continue;
        if(ev===1||(window.__fc=(window.__fc||0)+1)%ev===0)f(window.__now);else{const R=window.render;window.render=()=>{};try{f(window.__now);}finally{window.render=R;}}
        const s=S.say;if(s&&s!==lastSay){lastSay=s;LOG.push({key:S.story&&S.story.key,who:s.who,text:s.text});}
        const th=S.thought;if(th&&th!==lastTh){lastTh=th;LOG.push({key:S.story&&S.story.key,who:'(thought)',text:th.text});}}};
      window.drawAll=fn=>{const e=window.__drawEvery;window.__drawEvery=1;try{return fn();}finally{window.__drawEvery=e;}};
      window.runUntil=(pred,max)=>{let n=0;while(!pred()&&n<max){step(1);n++;}return n;};
      // pixels in a box round his upper body, in canvas pixels: how many are gold and how many are his pale hair (as sk_look_page.js;
      // gold here is told from the warm rim light by its blue, under half its red, where the rim's is over half)
      window.paint=()=>{const K=S.F[0],cv=document.getElementById('cv'),c=cv.getContext('2d'),s=cv.width/cam.viewW,L=cam.x-cam.viewW/2,T=camTop();
        const cx=(prjX(K.p[CHE].x,K.dep)-L)*s,cy=(prjY(K.p[CHE].y,K.dep)-T)*s,w=Math.round(46*s),h=Math.round(60*s),x0=Math.round(cx-w/2),y0=Math.round(cy-h*.55);
        const d=c.getImageData(x0,y0,w,h).data;let gold=0,pale=0;
        for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],bb=d[i+2];if(r>170&&g>.68*r&&g<.88*r&&bb<.46*r)gold++;if(r>215&&g>205&&bb>170&&bb<215)pale++;}return{gold,pale};};});
    return p;};
  const p=await open(1100,700,1);
  const ev=(fn,arg)=>p.evaluate(fn,arg);

  // ---- the fall goes on into Act I ----
  const chain=await ev(()=>{const K=['fall','roof1','kitchen1','backroom','lostprop','yard1'];return{next:K.map(k=>STAGES[stageIx(k)].next).join(' '),act:K.slice(1).map(k=>STAGES[stageIx(k)].act)};});
  expect('the fall goes on to scene 1, Off the Roof, then the kitchen, the back room, the crate and the yard; all of them Act I',/^roof1 kitchen1 backroom lostprop yard1 /.test(chain.next)&&chain.act.every(a=>a===1),JSON.stringify(chain));

  // ---- scenes 1 and 2 played through on auto ----
  const run=await ev(()=>{LOG.length=0;const out={cards:{},st:{}};
    // (the scenes' own things drawn in each stage: the skillet, the soup, the hilt, the plates, the curtain)
    const things={};{const ei=envItems;envItems=function(items){const n0=items.length;ei(items);const k=S.story&&S.story.key;if(!k)return;
      for(const it of items.slice(n0))if(it.act1)(things[k]=things[k]||new Set()).add(it.act1);};}
    // (the back room's opening, frame by frame: lying in the cot, sitting up, on the edge of it, standing)
    const bed={lie:null,upOnCot:0,edge:0,edgeFeet:99,edgeYaw:9,stood:null,hiltSit:0,hiltYaw:9};
    V11.step.push(()=>{if(!S.story||S.story.key!=='backroom')return;const K=hero(),N=K.bedNow,C=ACT1_PLACES.backroom.cot,MT=GB-C.top-1,p=K.p;
      // (sitting on the edge again with the hilt, later: facing the room as before)
      if(S.story.step==='explore'){if(N&&Math.abs(p[PEL].y-(MT-8))<3&&K.dep<C.d0){bed.hiltSit++;bed.hiltYaw=Math.min(bed.hiltYaw,+Math.abs(N.yaw+Math.PI/2).toFixed(3));}return;}
      if(N&&N.down&&!bed.lie)bed.lie={headX:Math.round(p[HEAD].x-(C.x0+48)),headUp:p[HEAD].y<p[PEL].y,low:Math.round(Math.max(...p.map(q=>q.y))-MT),dep:Math.round(K.dep),flat:Math.round(Math.abs(p[CHE].y-p[PEL].y)),blanket:!!S.act1.blanket};
      const upright=p[CHE].y<p[PEL].y-30,feet=Math.max(p[FTF].y,p[FTB].y);
      if(bed.lie&&upright&&K.dep>=C.d0&&feet>MT-12&&feet<MT+2&&p[PEL].y<MT-30)bed.upOnCot++;
      if(N&&upright&&K.dep<C.d0&&Math.abs(p[PEL].y-(MT-8))<3){bed.edge++;bed.edgeFeet=Math.min(bed.edgeFeet,Math.round(GB-feet));bed.edgeYaw=Math.min(bed.edgeYaw,+Math.abs(N.yaw+Math.PI/2).toFixed(3));}
      if(!N&&bed.edge&&!bed.stood)bed.stood={pelUp:Math.round(GB-p[PEL].y),leg:Math.round(K.leg),feet:Math.round(GB-feet)};});
    out.bed=bed;
    storyGo('roof1');S.storyAuto=true;S.auto=true;step(2);
    const C=S.card;out.cards.roof1=C?{kick:C.kick,title:C.title,sub:C.sub,pre:C.pre?C.pre.kick+' · '+C.pre.title:null}:null;
    const K=hero();out.st.roof1={armOff:!!K.armOff,oneArm:!!K.oneArm,drain:K.drain,w:K.weaponKey,foot:footMaxOf(K),wear:K.wear,seared:!!K.seared,coatOff:!!K.coatOff,
      tamm:!!S.F.find(f=>f.pitCast==='Tamm'),dob:!!S.F.find(f=>f.pitCast==='Dob'),hay:Math.round(GB-S.arena.ground(ACT1_PLACES.sumproof.hay.x,ACT1_PLACES.sumproof.hay.d))};
    let n=runUntil(()=>S.story.key!=='roof1',9000);out.n1=n;
    out.cards.kitchen1=S.card?S.card.title:null;
    {const K=hero(),T=ACT1_PLACES.sumpkitchen.table;out.st.kitchen1={armOff:!!K.armOff,table:Math.round(GB-S.arena.ground((T.x0+T.x1)/2,(T.d0+T.d1)/2))};}
    // (Dob at the table's end while Tamm heats the skillet and brings it: his hands, his face, his feet; Tamm's feet; the pan at the sear)
    {const A=S.act1,K=hero(),D=A.dob,T=A.tamm,m={hold:0,onAnkles:0,away:0,hand:99,ys:[],footUp:0,pan:null};
      const mid=(f,a,b)=>({x:(f.p[a].x+f.p[b].x)/2,y:(f.p[a].y+f.p[b].y)/2});
      n=runUntil(()=>{for(const f of [D,T])for(const i of [FTF,FTB])m.footUp=Math.max(m.footUp,Math.round(GB-f.p[i].y));
        const h=mid(D,HAF,HAB),a=mid(K,FTF,FTB),dh=Math.hypot(h.x-a.x,h.y-a.y);
        if(dh<10){m.onAnkles++;if(D.lookBack)m.away++;}
        if(D.action&&D.lookBack){m.hold++;m.hand=Math.min(m.hand,Math.round(dh));if(m.hold>40)m.ys.push(D.p[PEL].y);}
        // (bent over him with it, the moment before: the pan red-hot on the canvas, and the same frame drawn with it cold)
        if(!m.red&&A.skillet&&A.skillet.held&&T.action&&!A.sear&&A.skillet.heat>=1){const cv=document.getElementById('cv'),c=cv.getContext('2d'),sc=cv.width/cam.viewW,L=cam.x-cam.viewW/2,TT=camTop(),
            k=skilletAt(A.skillet),px=(prjX(k.x,k.d)-L)*sc,py=(prjY(k.y,k.d)-TT)*sc,w=Math.round(52*sc),hh=Math.round(32*sc),
            red=()=>{render();const d=c.getImageData(Math.round(px-w/2),Math.round(py-hh/2),w,hh).data;let n=0;for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],bb=d[i+2];if(r>180&&g<110&&bb<80&&r>2*g)n++;}return n;};
          const hot=red(),h0=A.skillet.heat;A.skillet.heat=0;const cold=red();A.skillet.heat=h0;m.red={hot,cold};}
        const done=!!(S.act1&&S.act1.sear);
        if(done){const q=P(T.p[HAF].x,T.p[HAF].y,T.dep),c=K.p[CHE],qc=P(c.x,c.y,K.dep),ang=T.facing>0?-.15:Math.PI+.15;m.pan=Math.round(Math.hypot(q.x+26*Math.cos(ang)-qc.x,q.y+26*Math.sin(ang)-qc.y));}
        return done;},6000);
      m.bob=m.ys.length?Math.round(Math.max(...m.ys)-Math.min(...m.ys)):null;delete m.ys;out.st.dob=m;}
    out.st.sear={n,seared:!!hero().seared};
    n=runUntil(()=>S.story.key!=='kitchen1',9000);out.n2=n;
    {const C=S.card;out.cards.backroom=C?{kick:C.kick,title:C.title,sub:C.sub,pre:!!C.pre}:null;
      const K=hero();out.st.backroom={armOff:!!K.armOff,oneArm:!!K.oneArm,drain:K.drain,w:K.weaponKey,foot:footMaxOf(K),wear:K.wear,
        elb:Math.round(Math.hypot(K.p[ELB].x-K.p[CHE].x,K.p[ELB].y-K.p[CHE].y)),cot:Math.round(GB-S.arena.ground((ACT1_PLACES.backroom.cot.x0+ACT1_PLACES.backroom.cot.x1)/2,190))};}
    // the Aether tab, once
    n=runUntil(()=>!!(S.act1&&S.act1.flicker),4000);const t0=S.t;let shown=0,frames=0;
    while(S.t<t0+2.4){step(1);frames++;if(!document.getElementById('a1Flick').hidden)shown++;}
    out.flick={n,shown,frames,after:document.getElementById('a1Flick').hidden};
    n=runUntil(()=>S.story.step==='explore',6000);out.explore={n,phase:S.game.phase,goal:document.getElementById('exGoal').hidden?null:document.getElementById('exWhat').textContent,where:document.getElementById('exWhere').textContent};
    n=runUntil(()=>S.story.key!=='backroom',12000);out.n3=n;
    out.br={used:null};
    // scene 3: the crate, the gear screen, the pin, the mirror
    {const C=S.card;out.cards.lostprop=C?{kick:C.kick,title:C.title}:null;out.st.lostprop0={wear:JSON.stringify(hero().wear)};}
    // (Tamm carries the crate in: every frame she walks it is in her arms, off the floor and in her hands, never on the floor; it is drawn
    // with her while she has it; she sets it down where it goes and lets go)
    {const cr={walk:0,walkHeld:0,lift:1e9,gapWalk:0,gapSet:0,floorHeld:0,drawnHeld:0,drawnFloor:0},art=window.a1CrateArt;window.a1CrateArt=function(){const C=S.act1&&S.act1.crate;if(C&&C.held)cr.drawnHeld++;else cr.drawnFloor++;return art.apply(this,arguments);};
      try{n=0;while(!(S.act1&&S.act1.gear&&S.act1.gear.open)&&n<6000){step(1,{every:1});n++;const A=S.act1,C=A&&A.crate,T=A&&A.tamm;if(!C||!T||T.hidden)continue;
        if(C.held){const b=C.at(),h=T.p[HAF],g=Math.hypot(h.x-(b.x+T.facing*2),h.y-(b.y-b.grip)),it=[];envItems(it);if(it.some(i=>i.act1b==='crate'))cr.floorHeld++;
          if(T.cutWalk){cr.lift=Math.min(cr.lift,GB-b.y);cr.gapWalk=Math.max(cr.gapWalk,g);}else if(T.action&&S.t-T.action.t0<1.3)cr.gapSet=Math.max(cr.gapSet,g);}
        if(T.cutWalk){cr.walk++;if(C.held)cr.walkHeld++;}}}
      finally{window.a1CrateArt=art;}
      const C=S.act1.crate;out.crate={...cr,lift:Math.round(cr.lift),gapWalk:+cr.gapWalk.toFixed(1),gapSet:+cr.gapSet.toFixed(1),x:+C.x.toFixed(1),d:+C.d.toFixed(2),on:C.on,held:!!C.held,want:ACT1_PLACES.backroom.crate};}
    out.gear={n,open:!document.getElementById('a1Gear').hidden};step(2,{every:1});
    out.gear.slots=[...document.querySelectorAll('#a1Gear .a1-slot')].map(li=>(li.querySelector('.a1-slot-k').textContent+':'+li.querySelector('.a1-slot-v').textContent)).join(' | ');
    // (the preview: him three times, in profile, facing the viewer, and in profile from his other side: the turn each is drawn at (the
    // look's measuring draws left out), how far out from the middle of his hips his hand is drawn facing the viewer, in head widths,
    // and each view's pixels: the runs of columns with him in them, how much of each is him and how tall he stands)
    {const yaws=[],how=[],kd=KaelLook.draw;let armOut=null;KaelLook.draw=function(c,F,o){const r=kd.apply(this,arguments);if(!(o&&o.measure)){yaws.push(+((o&&o.yaw)||0).toFixed(3));how.push((o&&o.lodMin||0)+(F.openHand?'open':'fist'));
        const sn=KaelLook.seen.get(F);if(o&&Math.abs((o.yaw||0)-1.5*Math.PI)<.4&&sn)armOut=+(Math.abs(sn.haf.x-sn.pel.x)/hero().body.headR).toFixed(2);}return r;};
      try{a1GearFill(true);}finally{KaelLook.draw=kd;}const cv=document.getElementById('a1GearFig'),c=cv.getContext('2d'),W=cv.width,H=cv.height,d=c.getImageData(0,0,W,H).data,bg0=[0x14,0x11,0x0f],bg1=[0x07,0x06,0x0a];
      const col=new Array(W).fill(0),top=new Array(W).fill(H),bot=new Array(W).fill(-1);
      for(let y=0;y<H;y++){const t=y/(H-1),bg=bg0.map((v,i)=>v+(bg1[i]-v)*t);for(let x=0;x<W;x++){const i=(y*W+x)*4;
        if(Math.abs(d[i]-bg[0])+Math.abs(d[i+1]-bg[1])+Math.abs(d[i+2]-bg[2])>40){col[x]++;if(y<top[x])top[x]=y;if(y>bot[x])bot[x]=y;}}}
      const runs=[];let rn=null;for(let x=0;x<W;x++){if(!col[x])continue;if(!rn||x-rn.x1>4){rn={x0:x,x1:x,n:0,y0:H,y1:-1};runs.push(rn);}rn.x1=x;rn.n+=col[x];rn.y0=Math.min(rn.y0,top[x]);rn.y1=Math.max(rn.y1,bot[x]);}
      const fig=runs.filter(q=>q.n>W*H*.004).map(q=>({x0:q.x0,x1:q.x1,share:+(q.n/((q.x1-q.x0+1)*H)).toFixed(3),tall:q.y1-q.y0}));
      out.gear.fig={w:W,h:H,yaws:yaws.join(','),how:how.join(','),armOut,fig};}
    n=runUntil(()=>!S.act1.gear.open,600);out.gear.closed=n<600;out.gear.kit=JSON.stringify(S.story.flags.kit);
    n=runUntil(()=>hero().wear&&hero().wear.pinned,900);out.st.pinned={n,wear:JSON.stringify(hero().wear)};
    n=runUntil(()=>S.story.key!=='lostprop',9000);out.n4=n;
    // scene 4: the yard
    {const C=S.card;out.cards.yard1=C?{kick:C.kick,title:C.title}:null;const K=hero();out.st.yard0={lurch:K.lurch,wear:JSON.stringify(K.wear),dob:!!S.F.find(f=>f.pitCast==='Dob'),dobY:Math.round(GB-S.F.find(f=>f.pitCast==='Dob').gr(ACT1_PLACES.yard.dobSeat.x)),dobDep:Math.round(S.F.find(f=>f.pitCast==='Dob').dep)};}
    const notes=[],hands=[];let lastN=null,lastH='-';
    // (Dob's line about his walk: he stops where he is for it; frames he is still being walked, steps begun after the first, and how
    // far he goes)
    const dr={frames:0,walk:0,steps:0,x0:null,x1:null,face:null};let drPrev=[true,true];
    let yEx=null,gateMax=0;n=runUntil(()=>{const E=S.ex;
      if(S.cut&&S.cut.name==='yard:drunk'){const K=hero();dr.frames++;if(K.cutWalk&&dr.frames>1)dr.walk++;for(let k=0;k<2;k++){const a=!!K.steps[k].active;if(a&&!drPrev[k])dr.steps++;drPrev[k]=a;}
        if(dr.x0==null)dr.x0=K.station;dr.x1=K.station;if(S.say&&S.say.who!=='Dob')dr.face=K.facing===Math.sign(S.act1.dob.station-K.station);}
      if(E&&S.story.key==='yard1'){yEx=E;gateMax=Math.max(gateMax,S.act1.stairGate||0);if(E.note&&E.note!==lastN){lastN=E.note;notes.push(E.note.text);}const h=E.hand?E.hand.id:'-';if(h!==lastH){lastH=h;hands.push(h);}}return S.story.step==='done'||S.story.key!=='yard1';},12000);
    out.yard={n,notes,hands:hands.join(' '),lurch:+hero().lurch.toFixed(2),gate:gateMax,ended:S.story.ended,next:S.story.key,used:yEx?yEx.spots.filter(s=>s.used).map(s=>s.id.replace(/:.*/,'')).join(' '):null,
      drunk:{frames:dr.frames,walk:dr.walk,steps:dr.steps,moved:dr.x0==null?null:+Math.abs(dr.x1-dr.x0).toFixed(1),face:dr.face}};
    if(S.story.step==='done'){step(90);const E=document.getElementById('stEnd');out.yard.card=E&&!E.hidden?document.getElementById('stEndK').textContent+' | '+document.getElementById('stEndT').textContent:null;}
    out.things=Object.fromEntries(Object.entries(things).map(([k,v])=>[k,[...v].sort().join(',')]));
    out.log=LOG.map(l=>l.key+' | '+l.who+': '+l.text);return out;});
  const L=run.log,said=L.filter(l=>!l.includes('(thought)')&&/^(roof1|kitchen1|backroom)/.test(l)),said34=L.filter(l=>!l.includes('(thought)')&&/^(lostprop|yard1)/.test(l));
  const want1=['roof1 | Dob: Tamm! An elf came down in the birds’ hay!','roof1 | Tamm: Then get him out of the birds’ hay.','kitchen1 | Tamm: Hold his legs, Dob. And don’t look.',
    'kitchen1 | Ilyas: My arm.','kitchen1 | Tamm: Whatever’s up that wall stays up that wall.'];
  const want2=['backroom | Tamm: Three weeks. You talked the whole time.','backroom | Ilyas: What did I say?','backroom | Tamm: Names, mostly. Then you begged somebody for water.',
    'backroom | Ilyas: Where is this?','backroom | Tamm: The Sump. Bottom of the Pit. Nobody comes down here looking for anybody.','backroom | Ilyas: Nine plates. Nothing to lock them.'];
  expect('scene 1: the five lines in order, Dob\'s and Tamm\'s on the roof, Tamm\'s and his in the kitchen',JSON.stringify(said.slice(0,5))===JSON.stringify(want1),said.slice(0,5).join(' / '));
  expect('scene 2: Tamm and he in the order written, and "Nine plates. Nothing to lock them." last',JSON.stringify(said.slice(5))===JSON.stringify(want2),said.slice(5).join(' / '));
  const th=L.filter(l=>l.includes('(thought)')&&/^backroom/.test(l));
  expect('scene 2: he reaches for the gilt first, then a thought for each thing he looks at',th[0]==='backroom | (thought): Reach for the gilt. Nothing answers.'&&th.length===4,th.join(' / '));
  expect('scene 1 opens on the act\'s card, ACT I · The Pit, then its own: ACT I · SCENE 1, Off the Roof',!!run.cards.roof1&&run.cards.roof1.pre==='ACT I · The Pit'&&run.cards.roof1.kick==='ACT I · SCENE 1'&&run.cards.roof1.title==='Off the Roof',JSON.stringify(run.cards.roof1));
  expect('the kitchen follows with no card; scene 2 has its own: ACT I · SCENE 2, The Back Room, three weeks later',run.cards.kitchen1===null&&!!run.cards.backroom&&run.cards.backroom.kick==='ACT I · SCENE 2'&&run.cards.backroom.title==='The Back Room'&&/three weeks later/.test(run.cards.backroom.sub)&&!run.cards.backroom.pre,JSON.stringify(run.cards));
  const r1=run.st.roof1,br=run.st.backroom;
  expect('scene 1: minutes after the fall: drained, the torn arm gone (the fall\'s wound), nothing in his hand, four pips of balance, the vest he fell in; Tamm and Dob are there; the hay stands up off the roof',
    r1.armOff&&!r1.oneArm&&r1.drain===1&&r1.w==='fists'&&r1.foot===4&&r1.wear===null&&r1.coatOff&&!r1.seared&&r1.tamm&&r1.dob&&r1.hay>10,JSON.stringify(r1));
  expect('the kitchen: he lies on the table, raised off the floor; the skillet seals the stump',run.st.kitchen1.armOff&&run.st.kitchen1.table>30&&run.st.sear.seared,JSON.stringify([run.st.kitchen1,run.st.sear]));
  {const m=run.st.dob;
    expect('the kitchen: Dob holds his ankles from the floor at the table\'s end, his face turned away the whole time his hands are on them, and holds still; neither he nor Tamm gets a foot up on the table; the pan comes down on the stump',
      m.hold>90&&m.onAnkles>90&&m.away===m.onAnkles&&m.hand<10&&m.bob!=null&&m.bob<5&&m.footUp<16&&m.pan!=null&&m.pan<8,JSON.stringify(m));
    expect('the kitchen: the skillet comes off the stove red-hot, the pan glowing red (drawn cold, the same frame has next to no red)',
      !!m.red&&m.red.hot>=60&&m.red.hot>=4*m.red.cold,JSON.stringify(m.red));}
  {const B=run.bed,L=B.lie||{};
    expect('scene 2: he wakes lying on his back in the cot, his head on the pillow and the blanket over him; sits up, swings his legs out and sits on its edge facing the room with his feet on the floor, and stands (never crouched up on the mattress); with the hilt he sits on the edge facing the room again',
      !!B.lie&&Math.abs(L.headX)<=14&&L.low<=0&&L.dep>=168&&L.flat<=6&&L.blanket&&B.upOnCot===0&&B.edge>30&&B.edgeFeet<=4&&B.edgeYaw<.02&&!!B.stood&&B.stood.pelUp>.85*B.stood.leg&&B.stood.feet<=4&&
      B.hiltSit>30&&B.hiltYaw<.02,JSON.stringify(B));}
  {const T=run.things,has=(k,n)=>(T[k]||'').split(',').includes(n);
    expect('the scenes\' own things stay in their own scenes: the skillet in the kitchen; the soup, the hilt and the plates in the back room; none of them in scene 3 or the yard',
      has('kitchen1','skillet')&&has('backroom','soup')&&has('backroom','hilt')&&has('backroom','plates')&&!has('backroom','skillet')&&
      ['lostprop','yard1'].every(k=>!['skillet','soup','plates','hilt'].some(n=>has(k,n))),JSON.stringify(T));}
  expect('scene 2: one arm (the arm\'s sticks hold nothing, its points ride at the shoulder), drained, bare to the waist under the dressings and barefoot, four pips; the cot is raised',
    br.oneArm&&!br.armOff&&br.elb===0&&br.drain===1&&br.w==='fists'&&br.foot===4&&!!br.wear&&br.wear.top==='bare'&&br.wear.bandage&&br.wear.feet==='bare'&&br.cot>15,JSON.stringify(br));
  expect('the Aether tab shows once as he reaches for the gilt, flickers, and is gone',run.flick.shown>40&&run.flick.shown<run.flick.frames&&run.flick.after,JSON.stringify(run.flick));
  expect('the room is his: the goal and the place show at the top',run.explore.phase==='explore'&&run.explore.goal==='Look around the room'&&/back room/i.test(run.explore.where),JSON.stringify(run.explore));
  expect('on auto he looks at all four things, the hilt last, and the story goes on to scene 3',run.n3<12000&&!!run.cards.lostprop,JSON.stringify({n3:run.n3}));
  const want34=['lostprop | Tamm: Thirty years of drunks leave things behind. Take what fits.','lostprop | Ilyas: None of it fits.','lostprop | Tamm: Then take what’s warm.',
    'yard1 | Tamm: Up and walking. Good. You can earn your soup.','yard1 | Tamm: Dob’s birds want water. Fill the bucket at the pump and take it up to the loft.',
    'yard1 | Dob: I’d do it myself, but I’m watching.',
    'yard1 | Dob: You walk like a drunk on payday.','yard1 | Ilyas: I’m still finding where the floor is.','yard1 | Dob: Stairs are round the side. Takes longer. Everything does now, I bet.'];
  expect('scenes 3 and 4: Tamm\'s and his lines over the crate; in the yard Tamm gives him the job (the bucket filled at the pump, up to Dob\'s birds in the loft), Dob\'s lines on the wall and his answer, and Dob at the ladder, in order',JSON.stringify(said34)===JSON.stringify(want34),said34.join(' / '));
  expect('scene 3 at the mirror: "No gold. Not one line."',L.includes('lostprop | (thought): No gold. Not one line.'),L.filter(l=>/^lostprop.*thought/.test(l)).join(' / '));
  expect('scenes 3 and 4 have their cards: ACT I · SCENE 3, Lost Property; ACT I · SCENE 4, A Man\'s Pace',!!run.cards.lostprop&&run.cards.lostprop.kick==='ACT I · SCENE 3'&&run.cards.lostprop.title==='Lost Property'&&!!run.cards.yard1&&run.cards.yard1.kick==='ACT I · SCENE 4'&&run.cards.yard1.title==='A Man’s Pace',JSON.stringify([run.cards.lostprop,run.cards.yard1]));
  {const g=run.gear.fig,V=g?g.fig:[],T=V.map(f=>f.tall);
    const Y=g?g.yaws.split(',').map(Number):[];
    expect('the gear screen\'s preview shows him three times at one size, close up, one easy stance seen three ways (his hand open): in profile, turned to face the viewer (a little turned, his arm hanging out from his side), and in profile from his other side, the arm he has toward the viewer',
      !!g&&Y.length===3&&Y[0]===0&&Math.abs(Y[1]-1.5*Math.PI)<.4&&Math.abs(Y[2]-Math.PI)<.01&&g.how==='1open,1open,1open'&&g.armOut>1.7&&V.length===3&&V.every(f=>f.share>.03)&&
      Math.max(...T)-Math.min(...T)<=.08*Math.max(...T),JSON.stringify(g));}
  {const c=run.crate||{};
    expect('scene 3: Tamm carries the crate in, in her arms (off the floor, in her hands, drawn with her) every step of the way, and sets it down where it goes',
      c.walk>60&&c.walkHeld===c.walk&&c.lift>40&&c.gapWalk<6&&c.gapSet<6&&c.floorHeld===0&&c.drawnHeld>20&&c.drawnFloor>0&&c.on&&!c.held&&!!c.want&&Math.abs(c.x-c.want.x)<3&&Math.abs(c.d-c.want.d)<1,JSON.stringify(c));}
  expect('scene 3 starts bare under the dressings; the gear screen opens with the five slots and the right arm Missing, and closes with the crate\'s choice kept',
    /"top":"bare"/.test(run.st.lostprop0.wear)&&run.gear.open&&run.gear.slots==='Body:Work shirt | Coat:Oilcloth coat and scarf | Hands:Nothing | Feet:Work boots | Belt:Belt and sheath | Right arm:Missing'&&run.gear.closed&&run.gear.kit==='{"body":0,"coat":0,"hands":0,"feet":0,"belt":0}',JSON.stringify(run.gear));
  expect('he dresses in it and Tamm pins the empty sleeve up: the work shirt, the oilcloth coat, the rust scarf, the boots, the belt',/"top":"shirt","coat":"oilcloth","scarf":"rust","hands":null,"feet":"boots","belt":"belt".*"pinned":true/.test(run.st.pinned.wear),JSON.stringify(run.st.pinned));
  expect('scene 4 dresses him from the crate\'s choice, lurching at first; Dob sits up on the crate by the yard wall',/"coat":"oilcloth"/.test(run.st.yard0.wear)&&run.st.yard0.lurch===1&&run.st.yard0.dob&&run.st.yard0.dobY===ACT1_DOBTOP,JSON.stringify(run.st.yard0));
  const Y=run.yard;
  expect('the yard on auto: the bucket in his hand, filled at the pump, the ladder refused (Needs two hands), the gate refused with his hand full, the bucket set down, the gate opened, the bucket taken up, the stairs',
    Y.hands==='bucket - water - water'&&Y.notes.includes('Needs two hands')&&Y.notes.some(t=>/^Your hand is full/.test(t))&&Y.gate===1&&/bucket/.test(Y.used)&&/pump/.test(Y.used)&&/stairgate/.test(Y.used)&&/stairs/.test(Y.used),JSON.stringify(Y));
  expect('Dob\'s line about his walk stops him where he is: no stepping in place under it (at most two steps to square his feet), and he turns to Dob to answer',
    !!Y.drunk&&Y.drunk.frames>200&&Y.drunk.walk===0&&Y.drunk.steps<=2&&Y.drunk.moved<3&&Y.drunk.face===true,JSON.stringify(Y.drunk));
  const last4=await ev(()=>STAGES[stageIx('yard1')].next);
  if(last4)expect('he has found his weight by the end (the lurch worn off), and the story goes on to scene 5',Y.lurch<.2&&Y.next===last4,JSON.stringify(Y));
  else expect('he has found his weight by the end (the lurch worn off), and the scene ends: To be continued, the rest of Act I is being built',Y.lurch<.2&&Y.ended==='act1'&&!!Y.card&&/^To be continued/.test(Y.card)&&/Act I/.test(Y.card),JSON.stringify(Y));

  // ---- walking about the back room ----
  // (from the start of the room: the scene skipped to where he has it, by stepping until he does, then the player's input only)
  const walk=await ev(()=>{storyGo('backroom');S.storyAuto=false;S.auto=false;step(2);const out={};
    out.n=runUntil(()=>S.story.step==='explore',8000);const K=hero(),E=S.ex;
    out.start={x:Math.round(K.station),z:Math.round(K.lane),near:exNear()?exNear().id:null,btn:document.getElementById('exAct').hidden};
    // a tap on the floor sends him there at a walk
    exGo(520,90);let t0=S.t;runUntil(()=>!E.to,600);out.go={x:Math.round(K.station),z:Math.round(K.lane),secs:+(S.t-t0).toFixed(2)};
    // a jog is quicker
    exGo(220,90,{run:true});t0=S.t;runUntil(()=>!E.to,600);out.jog={x:Math.round(K.station),secs:+(S.t-t0).toFixed(2)};
    // he cannot be sent off the floor
    exGo(5000,5000);runUntil(()=>!E.to,900);out.edge={x:Math.round(K.station),z:Math.round(K.lane),bx:E.bounds.x1,bz:E.bounds.z1};
    // the keys walk him (left for a second, away from the edge), Shift jogs
    t0=S.t;let x0=K.station;E.keys.x=-1;runUntil(()=>S.t>=t0+1,200);out.keys={walked:Math.round(x0-K.station)};
    E.keys.run=true;t0=S.t;x0=K.station;runUntil(()=>S.t>=t0+1,200);out.keys.jogged=Math.round(x0-K.station);E.keys.x=0;E.keys.run=false;step(2);
    // a thing used from across the room: he walks to it and looks
    LOG.length=0;exUse('suit');out.useFar={to:!!E.to};runUntil(()=>!!S.thought,900);out.useFar.thought=S.thought?S.thought.text:null;out.useFar.at=Math.round(Math.abs(K.station-exSpot('suit').x));
    runUntil(()=>!S.cut,900);
    // near the hilt, the button names it, and pressing it uses it; the goal is met with it and the scene goes on to its end
    exGo(exSpot('hilt').x,exSpot('hilt').z);runUntil(()=>!E.to,900);step(30,{every:1});
    out.btn={label:document.getElementById('exAct').textContent,hidden:document.getElementById('exAct').hidden};
    document.getElementById('exAct').click();runUntil(()=>!!(S.act1&&S.act1.platesSaid),1500);out.plates=!!S.act1.platesSaid;
    runUntil(()=>S.story.key!=='backroom',2000);out.next=S.story.key;out.used=E.spots.filter(s=>s.used).map(s=>s.id).join(',');
    storyQuit();return out;});
  expect('he starts by the cot with nothing in reach and no button showing',walk.start.near===null&&walk.start.btn,JSON.stringify(walk.start));
  expect('a tap on the floor walks him there at a man\'s pace; a jog is quicker; nothing sends him off the floor',
    walk.go.x===520&&walk.go.z===90&&walk.go.secs>2.5&&walk.go.secs<5&&walk.jog.x===220&&walk.jog.secs<walk.go.secs&&walk.edge.x===walk.edge.bx&&walk.edge.z===walk.edge.bz,JSON.stringify([walk.go,walk.jog,walk.edge]));
  expect('the keys walk him about a walk\'s distance in a second, and further at a jog',walk.keys.walked>70&&walk.keys.walked<95&&walk.keys.jogged>walk.keys.walked*1.4,JSON.stringify(walk.keys));
  expect('a thing used from across the room: he walks to it first, then looks',walk.useFar.to&&/ribbons/.test(walk.useFar.thought||'')&&walk.useFar.at<35,JSON.stringify(walk.useFar));
  expect('by the shelf the button reads "Take: The hilt"; pressed, it spills the nine plates and the scene goes on to scene 3',walk.btn.label==='Take: The hilt'&&!walk.btn.hidden&&walk.plates&&walk.next==='lostprop',JSON.stringify(walk));

  // ---- the yard by hand: the bucket in his one hand ----
  const yard=await ev(()=>{storyGo('yard1');S.storyAuto=false;S.auto=false;step(2);const out={};out.n=runUntil(()=>S.story.step==='explore',4000);const E=S.ex,K=hero();
    const free=()=>runUntil(()=>!E.to&&!S.cut&&!K.action,1500);
    exUse('bucket');free();step(4,{every:1});out.take={hand:E.hand&&E.hand.id,chip:document.getElementById('exHand').hidden?null:document.getElementById('exHandV').textContent};
    exUse('pump');free();out.fill={hand:E.hand&&E.hand.id};
    let ph=0,shown=false;exUse('ladder');runUntil(()=>{ph=Math.max(ph,K.phantom||0);if(!document.getElementById('exNote').hidden)shown=true;return!E.to&&!S.cut&&!K.action;},1500);step(2,{every:1});
    out.ladder={note:E.note&&E.note.text,shown,phantom:+ph.toFixed(2),hand:E.hand&&E.hand.id,tried:S.act1.yard.ladderTried};
    runUntil(()=>!S.cut,900);exUse('stairgate');free();out.gate1={note:E.note&&E.note.text,open:S.act1.stairGate};
    document.getElementById('exDrop').click();free();const fl=E.spots.find(s=>s.floor&&!s.gone);out.drop={hand:E.hand,floor:fl?fl.take.id:null};
    exUse('stairgate');free();out.gate2={open:S.act1.stairGate};
    if(fl){exUse(fl.id);free();}out.retake={hand:E.hand&&E.hand.id};
    exUse('stairs');runUntil(()=>S.story.step==='done'||S.story.key!=='yard1',3000);out.ended=S.story.key!=='yard1'?'next:'+S.story.key:S.story.ended;out.next4=STAGES[stageIx('yard1')].next;storyQuit();return out;});
  expect('the yard by hand: the bucket taken shows in the hand slot; the pump fills it',yard.take.hand==='bucket'&&yard.take.chip==='Bucket'&&yard.fill.hand==='water',JSON.stringify([yard.take,yard.fill]));
  expect('the ladder: "Needs two hands", and the reach of the arm that is not there (the empty side comes up) while his hand keeps the bucket',
    yard.ladder.note==='Needs two hands'&&yard.ladder.shown&&yard.ladder.phantom>.9&&yard.ladder.hand==='water'&&yard.ladder.tried,JSON.stringify(yard.ladder));
  expect('the gate will not open with his hand full; set down, the bucket waits on the floor, the gate opens, and he takes it up again; the stairs end the scene',
    /^Your hand is full\. Set down bucket of water first/.test(yard.gate1.note||'')&&yard.gate1.open===0&&yard.drop.hand===null&&yard.drop.floor==='water'&&yard.gate2.open===1&&yard.retake.hand==='water'&&(yard.next4?yard.ended==='next:'+yard.next4:yard.ended==='act1'),JSON.stringify(yard));

  // ---- scene 5: Tamm's list (when the build has it) ----
  const has5=await ev(()=>typeof errand==='function'&&stageIx('list')>=0);
  if(has5){
    const r5=await ev(()=>{LOG.length=0;const out={};storyGo('list');S.storyAuto=true;S.auto=true;step(2);let mapSeen=false,spike=0,face=new Set(),beg=0;
      // each stage the way goes through: the flight it is on, who is there, and where he comes in and goes out (his first and last x
      // while he walks about), and where the map puts him
      const W={},order=[];
      out.n=runUntil(()=>{const A=S.act1,k=S.story.key;if(A&&A.map&&A.map.open&&!document.getElementById('a1Map').hidden)mapSeen=true;if(A)spike=Math.max(spike,A.spikeView||0);
        if(k==='stairsdown'){beg=Math.max(beg,S.F.filter(f=>f.pitCast==='Beggar').length);if(A&&A.oldman&&Math.abs(hero().station-A.oldman.station)>40)face.add(A.oldman.facing);}
        if(A&&S.ex&&S.ex.on){let w=W[k];if(!w){w=W[k]={flight:A.flight||null,in:Math.round(hero().station),beg:S.F.filter(f=>f.pitCast==='Beggar').length,old:S.F.filter(f=>f.pitCast==='Old man').length,
            stand:S.F.filter(f=>f.npc&&(f.pitCast==='Collector'||f.pitCast==='Big collector')).length,map:typeof a1MapAt==='function'?a1MapAt(k):null};order.push(k);}w.out=Math.round(hero().station);}
        return S.story.step==='done'||!['list','stairsup','shelfstair','shelf','stairsdown'].includes(k);},36000);
      const E=S.act1.errand;out.keys=S.story.key;out.ended=S.story.ended;out.mapSeen=mapSeen;out.spike=spike;out.oldman=[...face].sort().join(',');out.way=W;out.order=order.join(' ');
      out.errand={got:Object.keys(E.got).sort().join(','),rice:riceWhere(),coin:E.coin,chits:E.chits,nim:E.nim,bag:E.bag.join(',')};out.beggars=beg;out.next5=STAGES[stageIx('stairsdown')].next;
      out.log=LOG.map(l=>l.key+' | '+l.who+': '+l.text);return out;});
    const said5=r5.log.filter(l=>!l.includes('(thought)'));
    expect('scene 5: Tamm\'s two lines with the list and the chits, then Nim and he at the pump stall, in order',JSON.stringify(said5)===JSON.stringify(['list | Tamm: Lamp oil, rice, salt. A valve from the goblin at the pump stall. Clean linen for that shoulder.',
      'list | Tamm: Chits are the Pump King’s paper. Spend them before they’re worth less.','shelf | Nim: Ranger gilt.','shelf | Ilyas: You know it?','shelf | Nim: I know what it guarded. Valve’s two coin. For you, three.']),said5.join(' / '));
    expect('the map shows the way; at the first landing the picture crosses the Pit to the spike and he thinks "Gone. Somebody climbed for it."',r5.mapSeen&&r5.spike===1&&r5.log.includes('stairsup | (thought): Gone. Somebody climbed for it.'),JSON.stringify({map:r5.mapSeen,spike:r5.spike}));
    expect('on auto the list is got (the good oil for a chit, the valve at Nim\'s three coin), all of it in the satchel, the rice too',
      r5.errand.got==='linen,oil,rice,salt,valve'&&r5.errand.rice==='bag'&&r5.errand.nim===3&&r5.errand.chits===2&&r5.errand.coin===3,JSON.stringify(r5.errand));
    if(r5.next5)expect('the way back at dusk: six beggars and the old man, who turns to follow him past; then on down into the toll',r5.beggars===6&&r5.oldman==='-1,1'&&r5.keys===r5.next5&&r5.n<36000,JSON.stringify({b:r5.beggars,o:r5.oldman,k:r5.keys,n:r5.n}));
    else expect('the way back at dusk: six beggars and the old man, who turns to follow him past; the scene ends on the end card',r5.beggars===6&&r5.oldman==='-1,1'&&r5.ended==='act1'&&r5.n<36000,JSON.stringify({b:r5.beggars,o:r5.oldman,e:r5.ended,n:r5.n}));
    // one way there and back: the yard, the Lane stair, the Shelf stair, the Shelf, and down the Shelf stair again; up he goes in at
    // the left (on the landing at its foot) and out at the right of each stair, at the Shelf in and out at its left end, and down the Shelf stair from its right to
    // its left; the silent row is on the Shelf stair both times, the collectors' stand on the Lane stair by day; the map knows each
    {const w=r5.way,g=k=>w[k]||{};
      expect('one way to the Shelf and back: the Lane stair (the collectors at their stand) and the Shelf stair (the row there by day and at dusk), each walked the same way both times',
        r5.order==='list stairsup shelfstair shelf stairsdown'&&g('stairsup').flight==='lane'&&g('stairsup').stand===2&&g('shelfstair').flight==='shelf'&&g('stairsdown').flight==='shelf'&&
        g('shelfstair').beg===6&&g('shelfstair').old===1&&g('stairsdown').beg===6&&g('stairsdown').old===1&&g('stairsup').beg===0&&
        g('stairsup').in<=150&&g('stairsup').out>800&&g('shelfstair').in<=150&&g('shelfstair').out>800&&g('shelf').in<100&&g('shelf').out<100&&g('stairsdown').in>800&&g('stairsdown').out<100&&
        g('list').map==='yard'&&g('stairsup').map==='lane'&&g('shelfstair').map==='shelfst'&&g('shelf').map==='shelf'&&g('stairsdown').map==='shelfst',JSON.stringify({o:r5.order,w}));}
    const shop=await ev(()=>{storyGo('shelf');S.storyAuto=false;S.auto=false;step(2);runUntil(()=>S.story.step==='explore',4000);const out={},E=errand();
      act1ShopOpen('oil');out.coinOil=act1ShopBuy('oil','coin');out.chitOil=act1ShopBuy('oil','chit');out.again=act1ShopBuy('oilcheap','coin');act1ShopClose();
      act1ShopOpen('grain');out.rice=act1ShopBuy('rice','coin');out.salt=act1ShopBuy('salt','coin');act1ShopClose();
      act1ShopOpen('linen');act1ShopBuy('linen','coin');act1ShopClose();act1ShopOpen('nim');act1ShopBuy('valve','coin');act1ShopClose();
      out.wt=satchelWeight(E.bag);act1ShopOpen('grind');out.salve=act1ShopBuy('salve','coin');out.salveHand=E.hand;out.whet=act1ShopBuy('whet','coin');out.sharp=E.sharp;act1ShopClose();
      // the satchel: the salve put in his hand (the satchel was full by weight); the rice taken out, the salve put in its place, the rice into his hand
      out.toBagFull=errandToBag();out.toHandFull=errandToHand(E.bag.indexOf('rice'));step(2);
      // he sets the salve down on the floor, so his hand is free, and takes the rice in his hand
      exSetDown();runUntil(()=>!hero().action,200);out.afterDrop=E.hand;out.riceToHand=errandToHand(E.bag.indexOf('rice'));out.rice2=riceWhere();out.chip=S.ex.hand&&S.ex.hand.name;
      out.backToBag=errandToBag();out.rice3=riceWhere();storyQuit();return out;});
    expect('the shop: the good oil is a chit and not for coin; what is got is not sold twice; the list fills the satchel to its weight',
      shop.coinOil==='Chits only'&&shop.chitOil===null&&shop.again==='Already on the list as got'&&shop.rice===null&&shop.salt===null&&shop.wt===9,JSON.stringify(shop));
    expect('the salve does not fit by weight, so it rides in his hand; the whetstone sharpens the dagger; nothing more goes in or out while the hand is full',
      shop.salve===null&&shop.salveHand==='salve'&&shop.whet===null&&shop.sharp&&shop.toBagFull==='Too heavy for the satchel'&&shop.toHandFull==='His hand is full',JSON.stringify(shop));
    expect('set down, the hand is free; the rice comes out of the satchel into his hand (the hand slot names it) and goes back in',
      shop.afterDrop===null&&shop.riceToHand===null&&shop.rice2==='hand'&&shop.chip==='Rice sack'&&shop.backToBag===null&&shop.rice3==='bag',JSON.stringify(shop));
    // the purse holds the list with a little over: salves until the list would be short, and no way of paying that leaves it so
    const guard=await ev(()=>{storyGo('shelf');S.storyAuto=false;S.auto=false;step(2);runUntil(()=>S.story.step==='explore',4000);const out={},E=errand();E.nim=3;
      act1ShopOpen('oil');act1ShopBuy('oil','chit');act1ShopClose();act1ShopOpen('grain');act1ShopBuy('salt','coin');act1ShopClose();
      act1ShopOpen('grind');out.salves=[1,2,3,4].map(()=>act1ShopBuy('salve','coin'));out.note=S.act1.shop.note&&S.act1.shop.note.text;act1ShopClose();
      act1ShopOpen('linen');out.linenChit=act1ShopBuy('linen','chit');out.linenCoin=act1ShopBuy('linen','coin');act1ShopClose();
      act1ShopOpen('nim');out.valve=act1ShopBuy('valve','coin');act1ShopClose();act1ShopOpen('grain');out.rice=act1ShopBuy('rice','chit');act1ShopClose();
      out.count=errandCount();out.purse=E.coin+' coin, '+E.chits+' chits';out.salve=E.salve;storyQuit();return out;});
    expect('the shop keeps Tamm\'s money for her list: a fourth salve is refused ("Tamm’s money: the list first"), so is paying the linen in the chit the valve needs; the list is still got',
      guard.salves.join('|')==='|||Tamm’s money: the list first'&&guard.note==='Tamm’s money: the list first'&&guard.linenChit==='That leaves too little for the list'&&
      guard.linenCoin===null&&guard.valve===null&&guard.rice===null&&guard.count===5&&guard.salve===3,JSON.stringify(guard));
  }

  // ---- scenes 6 to 8: the toll, Tamm, the yard at night (when the build has them) ----
  const has6=await ev(()=>stageIx('toll')>=0&&stageIx('tamm')>=0&&stageIx('night')>=0);
  if(has6){
    const r6=await ev(()=>{LOG.length=0;const out={held:null,dock:null,tempo:null,beats:[],watch:false,spill:false,cards:{},whet:null,sharpAfter:null};storyGo('stairsdown');S.storyAuto=true;S.auto=true;
      // the rice in his hand, not in the satchel (it goes down on the stair and splits), and the dagger whetted at the Shelf
      const E=S.act1.errand=errandDone();E.sharp=true;errandToHand(E.bag.indexOf('rice'));E.bag.push('salve');E.salve=1;step(2);out.through={};
      const sh=S.hooks.short;S.hooks.short=(e,d)=>{if(S.story&&S.story.key==='tamm')out.beats.push(e+(d&&d.res&&d.res.threat?'(threat)':'')+' '+(d&&d.A?d.A.name:'')+'>'+(d&&d.D?d.D.name:''));if(sh)sh(e,d);};
      const card=()=>{const C=S.card;if(C&&S.story&&!out.cards[S.story.key])out.cards[S.story.key]={kick:C.kick,title:C.title};};
      out.flights={};
      out.n=runUntil(()=>{card();const K=hero(),T=S.act1&&S.act1.toll,g=S.game;if(S.act1&&S.story)out.flights[S.story.key]=S.act1.flight||null;
        if(S.story.key==='toll'&&S.story.step==='fight'&&g.phase==='input'&&!out.dock){const sec=document.querySelector('.cg[data-g="arc"]'),C=S.F.find(f=>f.pitCast==='Collector');
          out.dock={arc:!!sec&&!sec.hidden,dark:sec?[...sec.querySelectorAll('.cmd.dark')].filter(b=>b.disabled).length:0,aether:!!document.getElementById('tabAether')&&document.getElementById('tabAether').hidden,foot:footMaxOf(K)};
          out.tempo={K:actionCost(K,'slash'),C:actionCost(C,'slash'),B:actionCost(S.F.find(f=>f.pitCast==='Big collector'),'slash')};out.whet=!!K.whet;}
        if(S.story.key==='tamm'&&out.sharpAfter===null)out.sharpAfter=!!S.act1.errand.sharp;
        if(T&&T.gang==='held'&&K.clinch&&!out.held){const D=heldBy(K);updateCommands();
          out.held={by:D.name,behind:K.clinch.behind,throw:cmdValid(K,D,'throw'),free:cmdValid(K,D,'breakfree'),head:cmdValid(K,D,'headbutt'),
            tq:['throw','breakfree','elbow'].map(k=>cmdInfo(K,D,k).tq).join(' | ')};}
        if(S.story.key==='toll'&&S.story.step==='outro'&&!out.toll){out.toll={...T};out.dead=S.F.filter(f=>f.dead).map(f=>f.name);out.hp=S.F.filter(f=>!f.npc).map(f=>f.hp);out.flags={...S.story.flags};}
        if(S.story.key==='tamm'){const W=document.getElementById('wrap');if(S.story.step==='fight'&&W.classList.contains('a1-watch'))out.watch=true;
          const Tm=S.act1.tammF;if(Tm&&!out.tamm)out.tamm={pocket:!!Tm.pocketHand,knife:S.hooks.arms(Tm,'dagger'),style:Tm.style};}
        if(S.act1&&S.act1.riceSpill)out.spill=true;
        if(S.story.key==='night'&&!out.home){const Eh=S.act1.errand;out.home={bag:Eh.bag.join(','),hand:Eh.hand};}
        // (the outros of the toll and of Tamm's fight: two people on their feet never stand in one another)
        if((S.story.key==='toll'||S.story.key==='tamm')&&S.story.step==='outro'){const up=S.F.filter(f=>!f.hidden&&!f.offstage&&!f.downed&&!f.dead&&!f.gone);
          for(let i=0;i<up.length;i++)for(let j=i+1;j<up.length;j++)if(Math.abs(up[i].station-up[j].station)<14&&Math.abs(up[i].lane-up[j].lane)<10){const k=S.story.key+': '+up[i].name+' + '+up[j].name;out.through[k]=(out.through[k]||0)+1;}}
        if(S.story.key==='night'&&S.ex&&S.ex.on&&!out.old){const u=document.getElementById('a8Unroll'),gl=document.getElementById('a8Glimmer');out.old={u:!!u&&!u.hidden,g:!!gl&&!gl.hidden,plates0:S.act1.night8.plates.length};}
        if(S.story.key==='night'&&S.act1.night8)out.plates={n:S.act1.night8.plates.length,picked:S.act1.night8.picked,tries:S.act1.night8.tries};
        return S.story.step==='done'||!['stairsdown','toll','tamm','night'].includes(S.story.key);},40000);
      out.ended=S.story.ended;out.after=S.story.key;out.next8=STAGES[stageIx('night')].next;
      if(S.story.step==='done'){step(90);const EC=document.getElementById('stEnd');out.card=EC&&!EC.hidden?document.getElementById('stEndK').textContent+' | '+document.getElementById('stEndT').textContent:null;}
      S.hooks.short=sh;out.log=LOG.map(l=>l.key+' | '+l.who+': '+l.text);return out;});
    const L6=r6.log;
    expect('scene 6: the collectors\' three lines and his, in order, then the cut-off line over him',
      JSON.stringify(L6.filter(l=>l.startsWith('toll |')))===JSON.stringify(['toll | Collector: Water toll on goods, friend. A chit a bag.','toll | Ilyas: I’ve never paid a toll in my life.',
        'toll | Collector: Then you’ve been lucky. Pump King says everyone pays.','toll | Collector: Same ink as the arm in the pump...','toll | Big collector: Shut it.']),L6.filter(l=>l.startsWith('toll |')).join(' / '));
    expect('scenes 6, 7 and 8 have their cards: ACT I · SCENE 6, The Toll; 7, Tamm; 8, The Yard at Night',
      r6.cards.toll&&r6.cards.toll.kick==='ACT I · SCENE 6'&&r6.cards.toll.title==='The Toll'&&r6.cards.tamm&&r6.cards.tamm.kick==='ACT I · SCENE 7'&&r6.cards.night&&r6.cards.night.kick==='ACT I · SCENE 8',JSON.stringify(r6.cards));
    expect('the dock shows the gaps: four pips, no Aether tab, the arc-blade\'s four techniques listed and dark',
      !!r6.dock&&r6.dock.foot===4&&r6.dock.aether&&r6.dock.arc&&r6.dock.dark===4,JSON.stringify(r6.dock));
    expect('they act at his pace: each collector\'s slash costs what his does, so the two of them have two turns to his one',
      !!r6.tempo&&Math.abs(r6.tempo.C-r6.tempo.K)<=3&&Math.abs(r6.tempo.B-r6.tempo.K)<=3,JSON.stringify(r6.tempo));
    expect('the bigger one pins him from behind: Twist free and the throw need two hands, the elbow is pinned, the back of his head is free',
      !!r6.held&&r6.held.by==='Big collector'&&r6.held.behind&&!r6.held.throw&&!r6.held.free&&r6.held.head&&r6.held.tq==='Needs two hands | Needs two hands | Arm pinned',JSON.stringify(r6.held));
    expect('it ends on the condition, not a game over: Broken twice (the pin the first) or under a third of his health; nobody dead',
      !!r6.toll&&r6.toll.end&&r6.toll.pinDowns>=1&&(r6.toll.breaks>=2||r6.hp[0]<50)&&!r6.dead.length&&r6.hp.every(h=>h>=1),JSON.stringify({t:r6.toll,hp:r6.hp,dead:r6.dead}));
    expect('the rice he held goes down on the stair and splits',r6.spill,String(r6.spill));
    expect('down the Shelf stair, then the toll and Tamm on the Lane stair below it, where the collectors keep their stand',
      r6.flights.stairsdown==='shelf'&&r6.flights.toll==='lane'&&r6.flights.tamm==='lane',JSON.stringify(r6.flights));
    expect('the whetstone bought at the Shelf gives his dagger its edge for the toll, and it is spent after',r6.whet===true&&r6.sharpAfter===false,JSON.stringify({w:r6.whet,a:r6.sharpAfter}));
    const L7=L6.filter(l=>l.startsWith('tamm |'));
    const want7=['tamm | Tamm: You’re late. That oil is mine.','tamm | Collector: This is Pump King business, Tamm.','tamm | Tamm: The Sump pays its water on the first, same as always. Tell Osgood.','tamm | Tamm: You dropped my rice.'];
    if(r6.toll&&r6.flags.downedOne)want7.push('tamm | Tamm: You put one down. With one hand and no light. Huh.');
    expect('scene 7: Tamm\'s lines and the collector\'s in order; the rice line for rice he held, and the line for a man he put down only if he did',JSON.stringify(L7)===JSON.stringify(want7),L7.join(' / '));
    const bi=k=>r6.beats.findIndex(b=>b.startsWith(k));
    expect('scene 7 is the engine\'s fight: the Wrist toll on the bigger one\'s grab, the Hinge on the other\'s swing, then the Short ladder held at his chin',
      bi('toll Big collector>Tamm')>=0&&bi('hinge Collector>Tamm')>bi('toll Big collector>Tamm')&&bi('ladder(threat) Tamm>Collector')>bi('hinge Collector>Tamm'),r6.beats.join(' / '));
    expect('Tamm fights with a boning knife, her other hand in her apron pocket, in Short Hand; the dock is put away while he watches',
      !!r6.tamm&&r6.tamm.pocket&&r6.tamm.knife==='crew:boning'&&r6.tamm.style==='shorthand'&&r6.watch,JSON.stringify({t:r6.tamm,w:r6.watch}));
    const L8=L6.filter(l=>l.startsWith('night |'));
    expect('scene 8: his three thoughts in order, then Tamm and he on the step, all eight lines in order',JSON.stringify(L8)===JSON.stringify([
      'night | (thought): I’ve cut down elves who could break her in half.','night | (thought): Two of a slum lord’s errand boys.','night | (thought): Was any of it me? Or only the light?',
      'night | Tamm: You’re thinking about the two on the stair.','night | Ilyas: I’ve gone through better than them by the dozen.','night | Tamm: With two arms and a lamp in your skin. Half the Pit saw that arm glowing on the wall.',
      'night | Ilyas: Then you know what I was.','night | Tamm: I know what you are. One-handed and slow. Same as my grandfather when he came out of the Poisoned River.',
      'night | Tamm: He ran a fish stall down here for forty years. Nobody robbed him twice.','night | Ilyas: Teach me.','night | Tamm: Sun-up. Bring the knife.']),L8.join(' / '));
    expect('scene 8: the old ways are offered (Unroll, Glimmer step); Unroll spills the nine plates and he picks up all nine; then on (the end card, or the next scene)',
      !!r6.old&&r6.old.u&&r6.old.g&&r6.old.plates0===0&&!!r6.plates&&r6.plates.n===9&&r6.plates.picked===9&&r6.plates.tries>=2&&
      (r6.next8?r6.after===r6.next8:r6.ended==='act1'&&/^To be continued/.test(r6.card||'')),JSON.stringify({o:r6.old,p:r6.plates,e:r6.ended,a:r6.after,c:r6.card}));
    expect('home that night, the list\'s goods are Tamm\'s: out of the satchel and his hand, the salve he bought for himself still in it',
      !!r6.home&&r6.home.bag==='salve'&&r6.home.hand===null,JSON.stringify(r6.home));
    expect('after the toll and after Tamm\'s fight, nobody walks through anybody on the way to his mark or off the stair',Object.keys(r6.through).length===0,JSON.stringify(r6.through));
    // drained, the Flow that carried him from one man to the next is a fighter's of his rank: a man close by, the read rolled
    const fl=await ev(()=>{storyGo('toll');S.storyAuto=true;S.auto=true;step(2);runUntil(()=>S.story.step==='fight',8000);S.storyAuto=false;S.auto=false;
      const K=S.F[0],[C,B]=S.F.filter(f=>f.team===1),fa=K.facing,out={};C.station=K.station+fa*60;C.lane=K.lane;B.lane=K.lane;
      // (the gap at which the two of them engage, and past it: 90 is in the reach of his old run, not of a Flow)
      const gap=engageGap(K,B);out.gap=Math.round(gap);B.station=K.station+fa*(gap+90);out.far=!!flowTarget(K,C);B.station=K.station+fa*(gap+30);out.near=flowTarget(K,C)===B;
      const rd=[],rh=S.hooks.read;S.hooks.read=(ex,f,r,k)=>{if(f===K&&k==='flow')rd.push(!!r.free);};considerFlow({depth:0},K,B);S.hooks.read=rh;out.free=rd.join(',');
      storyQuit();return out;});
    expect('drained, a takedown flows on only to a man close by, and the read for it is rolled, never free',!fl.far&&fl.near&&fl.free==='false',JSON.stringify(fl));
  }

  // ---- scene 9: Short Hand (when the build has it) ----
  const has9=await ev(()=>stageIx('sh1')>=0&&typeof shortOn==='function');
  if(has9){
    const r9=await ev(()=>{LOG.length=0;const out={cards:{},drill:{},bout:{},hers:{},arms:{},styles:null,props:null};storyGo('sh1');S.storyAuto=true;S.auto=true;step(2);
      out.n=runUntil(()=>{const k=S.story.key,C=S.card,R=S.act1&&S.act1.sh,T=S.F.find(f=>f.pitCast==='Tamm'&&f.team===1);
        if(C&&!out.cards[k])out.cards[k]={kick:C.kick,title:C.title};
        if(R){out.drill[k]=Math.max(out.drill[k]||0,R.n);out.bout[k]=Math.max(out.bout[k]||0,R.his);out.hers[k]=Math.max(out.hers[k]||0,R.hers);}
        if(T&&R&&S.story.step==='fight'&&!S.cut){const w=S.hooks.arms(T,T.weaponKey),kk=k+':'+R.phase;if(!out.arms[kk])out.arms[kk]=w+(T.pocketHand?' pocket':'');if(!out.props)out.props=S.props.filter(p=>p.painted&&p.fixed).length;}
        const A=S.act1,el=document.getElementById('a9Styles');
        if(A&&A.styles&&A.styles.open&&!out.styles&&el&&!el.hidden){out.styles={key:k,cards:[...el.querySelectorAll('.a9-card')].map(c=>c.querySelector('h3').textContent+': '+c.querySelector('.a9-now').textContent),
          moves:[...el.querySelectorAll('.a9-moves li.got .a9-m')].map(m=>m.textContent)};}
        return S.story.step==='done';},90000);
      const K=hero();out.style=K.style;out.moves=Object.keys(K.styleMoves||{}).filter(m=>K.styleMoves[m]).sort().join(',');out.ended=S.story.ended;
      step(90);const EC=document.getElementById('stEnd');out.card=EC&&!EC.hidden?document.getElementById('stEndK').textContent:null;
      out.log=LOG.map(l=>l.key+' | '+l.who+': '+l.text);return out;});
    const want9=['sh1 | Tamm: Empty side back. Knife close. Your feet are your other hand now.','sh2 | Tamm: Don’t block. You’ve nothing to block with. Take it on the shoulder and walk in.',
      'sh3 | Tamm: Anything that reaches for you pays the toll.','sh4 | Tamm: Up from under. A man guards his face and forgets his belly.',
      'sh6 | Tamm: Door’s yours, Friday nights. Don’t kill anyone in my bar.','sh6 | Ilyas: And outside it?','sh6 | Tamm: Outside it, don’t let me hear about it.'];
    let at=0;for(const l of r9.log)if(at<want9.length&&l===want9[at])at++;
    expect('scene 9: Tamm\'s line for each of the four lessons, then the door and his question, in order',at===want9.length,r9.log.filter(l=>!/First touch|Three touches|Again|Better|That’s it|Good\.|Huh|Enough/.test(l)).join(' / '));
    expect('scene 9 opens on its card, ACT I · SCENE 9, Short Hand; each morning after has its own',
      r9.cards.sh1&&r9.cards.sh1.kick==='ACT I · SCENE 9'&&r9.cards.sh1.title==='Short Hand'&&r9.cards.sh2&&r9.cards.sh2.kick==='MORNING 2'&&r9.cards.sh6&&/^MORNING/.test(r9.cards.sh6.kick),JSON.stringify(r9.cards));
    expect('each drill counts its reps to the end: four shoves held, two Hinges, two tolls, two Short ladders, the check and the hook',
      r9.drill.sh1>=4&&r9.drill.sh2>=2&&r9.drill.sh3>=2&&r9.drill.sh4>=2&&r9.drill.sh5>=2,JSON.stringify(r9.drill));
    expect('each lesson\'s bout ends on his first touch or her fifth, and the last on his third or her sixth',
      ['sh1','sh2','sh3','sh4','sh5'].every(k=>r9.bout[k]>=1||r9.hers[k]>=5)&&(r9.bout.sh6>=3||r9.hers.sh6>=6),JSON.stringify({his:r9.bout,hers:r9.hers}));
    expect('after the first lesson the styles screen: Short Hand learning, Wire drill dark, the Sareth cut locked; the stance learned',
      !!r9.styles&&r9.styles.key==='sh1'&&r9.styles.cards.join(' | ')==='Short Hand: Novice, learning | Wire drill: Dark: needs the gilt | The Sareth cut: Locked: needs two hands'&&r9.styles.moves.join(',')==='Stance',JSON.stringify(r9.styles));
    expect('Tamm drills him with a broom and fights the bouts with a rolling pin, the last with her other hand in her apron pocket; the barrels and crates are fixed props',
      r9.arms['sh1:drill']==='crew:broom'&&r9.arms['sh2:bout']==='crew:rollingpin'&&r9.arms['sh6:bout']==='crew:rollingpin pocket'&&r9.props===4,JSON.stringify({a:r9.arms,p:r9.props}));
    expect('the week ends with all of Short Hand his, and the end card',r9.style==='shorthand'&&r9.moves==='check,hinge,hook,ladder,stance,toll'&&r9.ended==='act1'&&/^To be continued/.test(r9.card||''),JSON.stringify({s:r9.style,m:r9.moves,e:r9.ended,c:r9.card,n:r9.n}));
    // a lesson played by a player who does nothing (Hold every turn, every window let run out) still ends: Tamm says what to do, the drill
    // stops after its turns, the bout ends on her fifth touch and the next morning comes. A touch draws no blood and leaves no wound, its
    // popup reads Touch, the knife stays his, and one arm shoves with the shoulder. (The Short ladder's morning: a toll window let run out
    // takes his own read, so the Wrist toll's drill can fill by itself; nothing of his own lands the ladder)
    const pas=await ev(()=>{LOG.length=0;storyGo('sh4');S.storyAuto=false;S.auto=false;step(2);const K=S.F[0];
      const out={coach:null,blood:0,wounds:0,knife:0,touch:false,zero:false,shove:null,capped:false,lost:false};
      out.n=runUntil(()=>{const g=S.game,R=shRec(),T=shTamm();
        if(S.story.key==='sh4'&&R){if(R.coach&&!out.coach)out.coach=R.coach.text;out.capped=out.capped||!!R.capped;out.lost=out.lost||!!R.lost;}
        if(S.blood&&S.blood.length)out.blood=Math.max(out.blood,S.blood.length);const w=K.wounds;if(w&&(w.head||w.arm||w.leg||w.body))out.wounds++;
        for(const q of S.popups){if(q.text==='Touch')out.touch=true;if(q.text==='0')out.zero=true;}
        if(S.story.key==='sh4'&&S.story.step==='fight'&&g.phase==='input'&&g.active===0&&!S.opening&&!S.cut&&!isAI(0)){
          if(out.shove===null&&T&&!K.downed&&!K.clinch)out.shove=cmdInfo(K,T,'shove').tq;
          if(K.weaponKey!=='dagger')out.knife++;humanCommand(K.downed?'guard':'wait');if(S.game.phase==='input'&&!S.opening&&S.game.active===0)humanCommand('wait');}
        return S.story.key!=='sh4'||S.story.step==='done';},20000);
      out.key=S.story.key;out.log=LOG.filter(l=>l.key==='sh4').map(l=>l.who+': '+l.text);storyQuit();return out;});
    expect('a lesson with nothing pressed still ends: Tamm says what to do, the drill stops after its turns ("Enough. Now properly."), the bout ends on her fifth touch ("Again tomorrow.") and the next morning comes',
      pas.n<20000&&pas.key==='sh5'&&pas.capped&&pas.lost&&/Then up from under/.test(pas.coach||'')&&pas.log.includes('Tamm: Enough. Now properly.')&&pas.log.includes('Tamm: Again tomorrow.'),
      JSON.stringify({n:pas.n,k:pas.key,c:pas.capped,l:pas.lost,coach:pas.coach,log:pas.log}));
    expect('a lesson draws no blood and leaves no wound; a touch\'s popup reads Touch; the knife stays in his hand; one arm\'s shove is the Shoulder shove',
      pas.blood===0&&pas.wounds===0&&pas.touch&&!pas.zero&&pas.knife===0&&pas.shove==='Shoulder shove',JSON.stringify({b:pas.blood,w:pas.wounds,t:pas.touch,z:pas.zero,k:pas.knife,s:pas.shove}));
  }

  // ---- the kitchen's window shot, on the desktop and on a phone held either way ----
  // the window high on the wall and the table under it are both in the picture between the letterbox's bars, centred there (the shot
  // after the skillet; on a narrow screen it comes in closer)
  {const shot=pg=>pg.evaluate(()=>{storyGo('kitchen1');S.storyAuto=true;S.auto=true;step(2);
      const n=runUntil(()=>!!S.say&&S.say.who===HERO_NAME,4000);step(30,{every:1});
      const R=ACT1_PLACES.sumpkitchen,s=cssW/cam.viewW,T=camTop(),bar=cssH*.105,top=(prjY(GB-R.window.y0,R.far)-T)*s,foot=(prjY(GB,R.table.d0)-T)*s;
      const out={n,w:cssW,h:cssH,view:Math.round(cam.viewW),top:Math.round(top),foot:Math.round(foot),bar:Math.round(bar),off:Math.round((top+foot)/2-cssH/2)};storyQuit();return out;});
    const P1=await open(390,844,1),P2=await open(844,390,1),f=[await shot(p),await shot(P1),await shot(P2)];
    await P1.context().close();await P2.context().close();
    expect('the kitchen\'s window shot: the window high on the wall and the table under it both between the letterbox\'s bars and centred there, on the desktop and on a phone held either way; closer on the phone held upright',
      f.every(r=>r.n<4000&&r.top>=r.bar&&r.foot<=r.h-r.bar&&Math.abs(r.off)<=r.h*.08)&&f[1].view<f[0].view,JSON.stringify(f));}

  // ---- the menu in the Pit ----
  // empty before the crate; his gear from the crate on, the menu button marked and a note under it once he is walking about; the
  // satchel and the map from Tamm's list; the codex with the first fight; the styles after the first lesson; the prologue's as it was
  const pm=await ev(()=>{const out={};
    const menu=()=>{const side=document.getElementById('sideCol'),tabs=[...side.querySelectorAll('.drawer-tabs button')].filter(b=>!b.hidden&&getComputedStyle(b).display!=='none').map(b=>b.dataset.dtab);
      return{title:side.querySelector('.drawer-title').textContent,sub:document.getElementById('drawerSub').textContent,tabs:tabs.join(','),tab:HUD.dtab,
        shown:[...side.querySelectorAll('.pm-pane')].filter(e=>getComputedStyle(e).display!=='none').map(e=>e.dataset.pm).join(',')};};
    const go=k=>{storyGo(k);S.storyAuto=true;S.auto=true;step(2);},ids=()=>pitMenuOpen().map(m=>m.id).join(',');
    go('backroom');runUntil(()=>S.story.step==='explore',8000);out.before={open:ids(),...(hudMenu(true),menu())};hudMenu(false);
    go('lostprop');let fresh=null;
    out.n3=runUntil(()=>{const t=document.getElementById('pmToast');if(t&&!t.hidden&&!fresh)fresh={text:t.textContent,badge:document.getElementById('menuBtn').dataset.new||'',free:exOn()&&!S.cut,key:S.story.key};return!!fresh;},8000);
    out.fresh=fresh;hudMenu(true);out.gear=menu();
    {out.gear.slots=[...document.querySelectorAll('#pmSlots .pm-slot')].map(li=>li.querySelector('.pm-k').textContent+':'+li.querySelector('.pm-v').textContent).join(' | ');
      const cv=document.getElementById('pmFig'),d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let n=0;for(let i=0;i<d.length;i+=16)if(d[i]+d[i+1]+d[i+2]>150)n++;
      out.gear.lit=+(n/(d.length/16)).toFixed(3);out.gear.badge=document.getElementById('menuBtn').dataset.new||'';out.gear.toast=!document.getElementById('pmToast').hidden;}
    hudMenu(false);
    go('list');out.listStart=ids();runUntil(()=>S.story.step==='explore',8000);hudMenu(true);out.list=menu();
    hudDrawerTab('satchel');pmFill();out.list.items=document.querySelectorAll('#pmList li').length;out.list.cells=document.querySelectorAll('#pmBag .a1-cell').length;out.list.purse=document.getElementById('pmPurse').textContent;
    hudDrawerTab('map');pmFill();out.list.map=!!document.querySelector('#pmMap svg .a1m-you');hudMenu(false);
    go('toll');out.tollStart=ids();runUntil(()=>S.story.step==='fight',8000);out.toll=ids();
    go('sh2');out.sh2=ids();hudMenu(true);out.sh2m=menu();hudDrawerTab('styles');pmFill();out.sh2m.cards=document.querySelectorAll('#pmCards .a9-card').length;hudMenu(false);
    storyQuit();go('field');hudMenu(true);out.pro=menu();hudMenu(false);storyQuit();restart();step(2);return out;});
  expect('the menu before the crate: his name, the act and the scene at its head, nothing in it yet and no tabs (the codex too waits for a fight)',
    pm.before.open===''&&pm.before.title==='Ilyas'&&pm.before.sub==='Act I · Scene 2 · The Back Room'&&pm.before.tabs===''&&pm.before.shown==='none',JSON.stringify(pm.before));
  expect('the crate\'s choice opens the menu\'s Gear: the menu button marked, and a note under it once he is walking about ("New in the menu: Gear")',
    !!pm.fresh&&pm.fresh.text==='New in the menu: Gear'&&pm.fresh.badge==='1'&&pm.fresh.free&&pm.fresh.key==='lostprop',JSON.stringify(pm.fresh));
  expect('the menu then: Gear alone, him drawn in what he wears, each slot, the right arm Missing and his hand; opened, the mark and the note go',
    pm.gear.tabs==='gear'&&pm.gear.tab==='gear'&&pm.gear.shown==='gear'&&/^Body:.+ \| Coat:.+ \| Hands:.+ \| Feet:.+ \| Belt:.+ \| Right arm:Missing \| Hand:.+$/.test(pm.gear.slots)&&pm.gear.lit>.01&&pm.gear.badge===''&&!pm.gear.toast,JSON.stringify(pm.gear));
  expect('scene 5: the satchel and the map once Tamm has handed them over (the satchel\'s grid, the purse and her list of five; the map with him marked)',
    pm.listStart==='gear'&&pm.list.tabs==='gear,satchel,map'&&pm.list.items===5&&pm.list.cells===8&&/^Coin \d+ · Chits \d+$/.test(pm.list.purse)&&pm.list.map,JSON.stringify([pm.listStart,pm.list]));
  expect('the codex comes into the menu with the first fight in the Pit, the styles after the first lesson (three style cards)',
    pm.tollStart==='gear,satchel,map'&&pm.toll==='gear,satchel,map,codex'&&pm.sh2==='gear,satchel,map,codex,styles'&&pm.sh2m.tabs==='gear,satchel,map,styles,codex'&&pm.sh2m.cards===3,JSON.stringify([pm.tollStart,pm.toll,pm.sh2,pm.sh2m]));
  expect('in the prologue the drawer is as it was: Paused, and the codex',pm.pro.title==='Paused'&&pm.pro.tabs==='codex'&&pm.pro.shown==='',JSON.stringify(pm.pro));

  // ---- the hip dagger, and leaving the story ----
  const arms=await ev(()=>{const out={};storyGo('roof1');step(2);const K=hero();out.act1=S.hooks.arms(K,'dagger');storyQuit();restart();step(2);out.lab=S.hooks.arms(S.F[0],'dagger');
    out.lab1={oneArm:!!S.F[0].oneArm,armOff:!!S.F[0].armOff,wear:S.F[0].wear||null};return out;});
  expect('in the Pit his hip dagger is drawn with the light gone out of it; back in the lab it is the gilded one, and he has both arms',
    arms.act1==='crew:kaeldull'&&arms.lab==='sig:Kael'&&!arms.lab1.oneArm&&!arms.lab1.armOff&&!arms.lab1.wear,JSON.stringify(arms));

  // ---- the Pit's look ----
  // every wear drawn: no gold on him anywhere (the Noir Gilt shows gold in the same box), his pale hair still there. (He is turned away
  // from the room's lamp for it: facing it, its light along the edge of the rust scarf counts as gold to this test)
  const look=await ev(()=>{const out={};storyGo('backroom');step(2);runUntil(()=>S.story.step==='explore',8000);const K=hero();K.facing=-1;
    out.calls=0;const _d=KaelLook.draw;KaelLook.draw=function(c,F,o){if(F===K)out.calls++;return _d.call(this,c,F,o);};
    for(const [n,w] of [['vest',null],['bare',{top:'bare',bandage:true,feet:'bare'}],['shirt',{top:'shirt',feet:'boots',belt:true}],['coat',{top:'shirt',coat:'oilcloth',scarf:'rust',feet:'boots',belt:true}]]){
      K.wear=w;drawAll(()=>step(8));render();out[n]=paint();}
    KaelLook.draw=_d;storyQuit();return out;});
  expect('the Pit\'s look in each of his clothes: no gold on him (the Noir Gilt vest shows its gold in the same place), his pale hair still showing; he is drawn by his own look every frame',
    look.calls>=32&&look.vest.gold>=10&&['bare','shirt','coat'].every(n=>look[n].gold<=2&&look[n].pale>10),JSON.stringify(look));

  expect('no page errors',pageErrs.length===0,pageErrs.slice(0,3).join(' | '));
  console.log(rep.join('\n'));console.log(errs.length?`\n${errs.length} FAILED`:`\nall ${rep.length} checks passed`);
  await b.close();process.exit(errs.length?1:0);
})();
