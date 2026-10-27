// ===== STORY UI =====
// (loaded ahead of the main UI script; everything here runs only once the UI is up)
// The prologue on the page: the title menu, the stage cards, the letterbox and the lines of dialogue over the stage, the scene's
// camera, the vehicles, the sounds the scenes need and the prologue's song. The fights use the game's own panels.

// ---------- the page around the story ----------
const ST_UI={};
function stEl(tag,cls,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
function storyStageWrap(){return document.getElementById('stageWrap');}
// the title menu: begin the prologue, pick a chapter, or go to the skirmish lab
function storyMenuBuild(){
  const W=storyStageWrap();if(!W||ST_UI.menu)return;
  const m=stEl('div','st-menu');m.id='stMenu';
  m.innerHTML=`<div class="st-menu-in"><p class="st-kick">A ragdoll noir</p><h2 class="st-title">${HERO_NAME}</h2><p class="st-sub">Prologue · The Long Night</p>
    <div class="st-btns"><button type="button" class="st-btn st-go" id="stBegin">Begin</button><button type="button" class="st-btn" id="stChapters">Chapters</button><button type="button" class="st-btn" id="stLab">Skirmish lab</button></div>
    <ol class="st-chap" id="stChapList" hidden></ol></div>`;
  W.appendChild(m);ST_UI.menu=m;
  const list=m.querySelector('#stChapList');if(STAGES.some(s=>s.act))list.classList.add('st-acts');
  let act=0;for(const st of STAGES){if(!st.title||!stageReady(st))continue;
    if((st.act||0)!==act){act=st.act||0;const h=stEl('li','st-chaphead',act?`Act ${['','I','II','III'][act]||act} · ${ACT_NAMES[act]||''}`:'Prologue');list.appendChild(h);}
    const li=stEl('li');const b=stEl('button','st-chapbtn',`<span class="st-num">${st.num}</span><span class="st-ct">${st.title}</span><span class="st-cs">${st.sub||''}</span>`);b.type='button';
    b.addEventListener('click',()=>{ensureAudio();storyGo(st.key);});li.appendChild(b);list.appendChild(li);}
  m.querySelector('#stBegin').addEventListener('click',()=>{ensureAudio();storyGo(null);});
  m.querySelector('#stChapters').addEventListener('click',()=>{list.hidden=!list.hidden;});
  m.querySelector('#stLab').addEventListener('click',()=>{ensureAudio();storyMenu(false);document.body.classList.remove('story');});
  // the line of dialogue, the skip button, the end and retry cards
  const d=stEl('div','st-say');d.id='stSay';d.hidden=true;d.innerHTML='<div class="st-say-in"><span class="st-who" id="stWho"></span><span class="st-line" id="stLine"></span><span class="st-more" aria-hidden="true">▸</span></div>';
  W.appendChild(d);ST_UI.say=d;d.addEventListener('click',()=>storyAdvance());
  const sk=stEl('button','st-skip','Skip <kbd>Esc</kbd>');sk.type='button';sk.id='stSkip';sk.hidden=true;W.appendChild(sk);ST_UI.skip=sk;sk.addEventListener('click',()=>cutSkip());
  const e=stEl('div','st-end');e.id='stEnd';e.hidden=true;e.innerHTML='<div class="st-end-in"><p class="st-end-k" id="stEndK"></p><p class="st-end-t" id="stEndT"></p><div class="st-btns" id="stEndBtns"></div></div>';
  W.appendChild(e);ST_UI.end=e;
  const back=stEl('button','st-quit','Menu');back.type='button';back.id='stQuit';back.hidden=true;W.appendChild(back);ST_UI.quit=back;
  back.addEventListener('click',()=>{storyQuit();restart();storyMenu(true);});
}
function storyMenu(on){if(!ST_UI.menu)return;ST_UI.menu.hidden=!on;if(on){ST_UI.end.hidden=true;ST_UI.quit.hidden=true;}}
function storyGo(key){storyMenu(false);document.body.classList.add('story');ST_UI.quit.hidden=false;ST_UI.end.hidden=true;
  clearTimeout(overTimer);$('over').hidden=true;$('opening').hidden=true;logPlaceholder();storyBegin(key);buildRows();updateStatus();}
// a click or a key moves a line on: the first press finishes the line being written, the next one closes it
function storyAdvance(){const s=S.say;if(!s)return;const shown=storyShown(s);if(shown<s.text.length){s.t0=S.t-s.text.length/STORY_CPS-.01;return;}s.adv=true;}
const STORY_CPS=46;
function storyShown(s){return Math.min(s.text.length,Math.floor((S.t-s.t0)*STORY_CPS));}
function storyEndCard(kind){
  const e=ST_UI.end;if(!e)return;e.hidden=false;const K=$('stEndK'),T=$('stEndT'),B=$('stEndBtns');B.innerHTML='';
  const btn=(t,fn,cls)=>{const b=stEl('button','st-btn'+(cls?' '+cls:''),t);b.type='button';b.addEventListener('click',fn);B.appendChild(b);};
  if(kind==='fallen'){K.textContent=HERO_NAME+' has fallen';T.textContent='The night is not over. Try the stage again.';
    btn('Try again',()=>{e.hidden=true;storyRetry();buildRows();updateStatus();},'st-go');btn('Menu',()=>{storyQuit();restart();storyMenu(true);});}
  else if(S.story&&S.story.ended==='fall'){K.textContent='End of the prologue';T.textContent=HERO_NAME+' will return. Every chapter can be played again from the menu.';
    btn('Play again',()=>{e.hidden=true;storyGo(null);},'st-go');btn('Menu',()=>{storyQuit();restart();storyMenu(true);});}
  else if(S.story&&S.story.ended==='act1'){K.textContent='To be continued';T.textContent='The rest of Act I is being built. Every scene so far can be played again from Chapters.';
    btn('Play again',()=>{e.hidden=true;storyGo('roof1');},'st-go');btn('Menu',()=>{storyQuit();restart();storyMenu(true);});}
  else{K.textContent='To be continued';T.textContent='The rest of the prologue is being built. Every stage so far can be replayed from Chapters.';
    btn('Play again',()=>{e.hidden=true;storyGo(null);},'st-go');btn('Menu',()=>{storyQuit();restart();storyMenu(true);});}}

// ---------- the story's moments on the page ----------
{const sh=S.hooks.story;S.hooks.story=(k,a)=>{sh(k,a);
  const b=$('banner');
  if(k==='stage'){if(a.title)b.textContent=`${a.num} · ${a.title}`;b.style.visibility=a.title?'':'hidden';buildRows();updateStatus();if(typeof FxLook!=='undefined'&&FxLook.prewarm&&!ST_UI.fxWarm){ST_UI.fxWarm=1;try{FxLook.prewarm();}catch(e){}}}
  else if(k==='fight'){if(STAGES[S.story.i].title)b.textContent=STAGES[S.story.i].title;b.style.visibility=STAGES[S.story.i].noFight?'hidden':'';buildRows();updateStatus();}
  else if(k==='fallen')setTimeout(()=>storyEndCard('fallen'),1200);
  else if(k==='end')storyEndCard('end');
  else if(k==='quit'){b.style.visibility='';document.body.classList.remove('story');ST_UI.say.hidden=true;ST_UI.skip.hidden=true;ST_UI.quit.hidden=true;}};}
// the panels: no commands during a scene
{const uc=updateCommands;updateCommands=function(){uc();if(S.game.phase==='cut'){$('cmdHead').textContent=S.story?STAGES[S.story.i].title:'…';}};}

// in a scene the fight's own marks stand down: the footing rings and their labels, the bars over heads, the target and intent marks
function storyQuiet(){return!!(S.story&&(S.game.phase==='cut'||S.story.step!=='fight'));}
{const df=drawFooting;drawFooting=function(f){return storyQuiet()?null:df(f);};}
{const hb=drawHeadBars;drawHeadBars=function(){if(!storyQuiet())hb();};}
{const dl=drawLabels;drawLabels=function(){if(!storyQuiet())dl();};}

// ---------- the scene's camera ----------
// a scene sets where the camera looks and how wide (and, if it wants, where and how wide on a narrow screen: C.xn, C.wn); it eases
// there at the scene's own rate
{const uc=updateCamera;updateCamera=function(rdt){const C=S.camCut;if(!C){uc(rdt);return;}
  const narrow=cssW<640,w=clamp(narrow&&C.wn?C.wn:C.w*(narrow?Math.min(1,700/C.w):1),300,W),k=C.k?Math.min(1,rdt*C.k):1;
  cam.viewW+=(w-cam.viewW)*k;const x=clamp(narrow&&C.xn!=null?C.xn:C.x,cam.viewW/2-130,W-cam.viewW/2+200);cam.x+=(x-cam.x)*k;};}

// on a moving road the camera keeps to the riders still in the fight (whole bikes, not just the men on them), never to the ones
// the road has taken
{const uc=updateCamera;updateCamera=function(rdt){if(S.camCut||!S.arena||!S.arena.scroll){uc(rdt);return;}
  const narrow=cssW<640;let lo=1e9,hi=-1e9;
  for(const f of S.F){if(f.gone||f.crashed)continue;const B=f.mount,x0=prjX(B?B.x-92:f.p[PEL].x,f.dep),x1=prjX(B?B.x+92:f.p[PEL].x,f.dep);if(x0<lo)lo=x0;if(x1>hi)hi=x1;}
  if(lo>hi){lo=W/2-120;hi=W/2+120;}
  const tw=narrow?clamp(hi-lo+110,560,W):W,k=Math.min(1,rdt*3.5);cam.viewW+=(tw-cam.viewW)*k;const half=cam.viewW/2;cam.x+=(clamp((lo+hi)/2,half,W-half)-cam.x)*k;};}

// ---------- drawing over the stage: letterbox, the stage card, the fade ----------
let ST_LB=0;
function drawStoryScreen(){
  const w=cv.width,h=cv.height,s=w/900;
  ST_LB+=((S.letter?1:0)-ST_LB)*.08;
  if(ST_LB>.002){const bh=h*.105*ST_LB;ctx.fillStyle='#000';ctx.fillRect(0,0,w,bh);ctx.fillRect(0,h-bh,w,bh);}
  // the black of a cut between scenes, under the stage's card so a chapter's title shows on it
  if(S.fade>0){ctx.fillStyle=`rgba(0,0,0,${clamp(S.fade,0,1).toFixed(3)})`;ctx.fillRect(0,0,w,h);}
  const C0=S.card;if(C0){const pre=C0.pre&&S.t<C0.t0+C0.pre.dur,C=pre?C0.pre:C0,t0=pre?C0.t0:C0.pre?C0.t0+C0.pre.dur:C0.t0,u=S.t-t0,
      out=pre?S.t-(C0.t0+C0.pre.dur-.5):C0.out!=null?S.t-C0.out:0,a=clamp(u/.5,0,1)*(pre?clamp(1-out/.5,0,1):C0.out!=null?clamp(1-out/.6,0,1):1);
    if(a>0){ctx.save();ctx.globalAlpha=a;ctx.fillStyle='rgba(2,2,6,.82)';ctx.fillRect(0,0,w,h);
      const cx=w/2,cy=h*.47;ctx.textAlign='center';ctx.textBaseline='alphabetic';
      ctx.fillStyle='#8a6a2e';ctx.font=`600 ${Math.round(15*s)}px "Alegreya SC",Georgia,serif`;ctx.letterSpacing=`${Math.round(6*s)}px`;ctx.fillText(C.kick||'CHAPTER '+C.num,cx,cy-38*s);ctx.letterSpacing='0px';
      const g=ctx.createLinearGradient(0,cy-30*s,0,cy+8*s);g.addColorStop(0,'#fff0c6');g.addColorStop(.55,'#e2b65a');g.addColorStop(1,'#8a6a2e');
      ctx.fillStyle=g;ctx.font=`700 ${Math.round(46*s)}px "Alegreya SC",Georgia,serif`;ctx.fillText(C.title,cx,cy+6*s);
      ctx.strokeStyle='rgba(226,182,90,.55)';ctx.lineWidth=Math.max(1,s);const lw=Math.min(w*.3,ctx.measureText(C.title).width*.7);ctx.beginPath();ctx.moveTo(cx-lw/2,cy+22*s);ctx.lineTo(cx+lw/2,cy+22*s);ctx.stroke();
      ctx.fillStyle='#cfc4a8';ctx.font=`italic 500 ${Math.round(16*s)}px "Barlow Semi Condensed",Arial,sans-serif`;ctx.fillText(C.sub||'',cx,cy+46*s);
      ctx.restore();}}
  // the opening's title over the sky (S.story.title, the scene's): no card behind it, the words alone in gold, coming and going
  const TT=S.story&&S.story.title;if(TT){const u=S.t-TT.t0,a=clamp(u/.9,0,1)*clamp((TT.dur-u)/1,0,1);
    // (on a phone the words keep a size that reads: the kicker 11 and the title 28 of the page's own pixels at the least)
    if(a>0){const dpr=w/Math.max(1,cssW),kp=Math.max(15*s,11*dpr),tp=Math.max(52*s,28*dpr);ctx.save();ctx.globalAlpha=a;const cx=w/2,cy=h*.3;ctx.textAlign='center';ctx.textBaseline='alphabetic';
      ctx.shadowColor='rgba(0,0,0,.6)';ctx.shadowBlur=10*s;
      ctx.fillStyle='#d2ac62';ctx.font=`600 ${Math.round(kp)}px "Alegreya SC",Georgia,serif`;ctx.letterSpacing=`${Math.round(kp*.45)}px`;ctx.fillText(TT.kick,cx,cy-tp*.8);ctx.letterSpacing='0px';
      const g=ctx.createLinearGradient(0,cy-tp*.7,0,cy+tp*.15);g.addColorStop(0,'#fff3d0');g.addColorStop(.55,'#e8bc62');g.addColorStop(1,'#9a7434');
      ctx.fillStyle=g;ctx.font=`700 ${Math.round(tp)}px "Alegreya SC",Georgia,serif`;ctx.fillText(TT.text,cx,cy+tp*.12);ctx.restore();}}
  // eyes in the dark over the train: pairs of them, blinking, closer each moment
  const E=S.story&&S.story.eyes;if(E){const u=S.t-E.t0,R=mulberry32(E.n*97);ctx.save();ctx.globalCompositeOperation='lighter';
    for(let i=0;i<E.n;i++){const x=R()*w,y=h*(.12+R()*.3),ph=R()*6,on=Math.sin(S.t*1.7+ph)>-.6&&u>i*.12,r=(1.6+R()*1.2)*s*(1+u*.15);if(!on)continue;
      ctx.fillStyle=`rgba(190,255,150,${(.55+.35*Math.sin(S.t*5+ph)).toFixed(2)})`;for(const dx of [-r*2.2,r*2.2]){ctx.beginPath();ctx.ellipse(x+dx,y,r*1.3,r*.7,0,0,TAU);ctx.fill();}}ctx.restore();}
  // what goes through his head as he falls
  const th=S.thought;if(th){const u=(S.t-th.t0)/th.dur,a=clamp(Math.min(u/.18,(1-u)/.18),0,1);ctx.save();ctx.globalAlpha=a;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.font=`italic 600 ${Math.round(clamp(30*s,15,30))}px "Cormorant Garamond","Alegreya SC",Georgia,serif`;ctx.fillStyle='#f3ead2';ctx.shadowColor='rgba(0,0,0,.85)';ctx.shadowBlur=8*s;
    const words=th.text.split(' '),lines=[];let ln='';for(const wd of words){const t2=ln?ln+' '+wd:wd;if(ctx.measureText(t2).width>w*.8&&ln){lines.push(ln);ln=wd;}else ln=t2;}lines.push(ln);
    lines.forEach((l,i)=>ctx.fillText(l,w/2,h*.78+(i-(lines.length-1)/2)*34*s));ctx.restore();}
  // a blast whites out the picture for a moment
  for(const b of S.booms){const u=S.t-b.t0;if(u>=0&&u<.35){ctx.fillStyle=`rgba(255,236,200,${(.55*(1-u/.35)*Math.min(1,b.size)).toFixed(3)})`;ctx.fillRect(0,0,w,h);}}
  // the dialogue box and skip button follow the sim's state
  const sy=S.say,el=ST_UI.say;
  if(el){if(sy){el.hidden=false;$('stWho').textContent=sy.who;$('stWho').style.color=sy.col||storyCol(sy.who);$('stLine').textContent=sy.text.slice(0,storyShown(sy));el.classList.toggle('done',storyShown(sy)>=sy.text.length);}else el.hidden=true;}
  if(ST_UI.skip)ST_UI.skip.hidden=!(S.cut&&S.cut.skip&&!S.card);
}
function storyCol(who){const f=S.F.find(x=>x.name===who);return f?(f.idx===0?'#7ff3e3':f.color):'#e2b65a';}

// ---------- vehicles among the things on the floor ----------
{const ei=envItems;envItems=function(items){ei(items);for(const B of S.veh)if(B.x>-600)items.push({d:B.dep+.02,veh:B});
  for(const F of S.fires||[])items.push({d:F.dep-.01,fire:F});for(const b of S.booms)items.push({d:b.dep-1,boom:b});for(const o of S.thrown||[])items.push({d:o.dep-.02,thrown:o});for(const C of S.cloths||[])items.push({d:(C.dep||100)-.03,cloth:C});};}
{const de=drawEnvItem;drawEnvItem=function(it){if(it.veh){drawVehicle(it.veh);return true;}if(it.fire){drawFire(it.fire);return true;}if(it.boom){drawBoom(it.boom);return true;}if(it.thrown){drawThrown(it.thrown);return true;}if(it.cloth){if(typeof KaelLook!=='undefined'&&KaelLook.coatFly){const C=it.cloth;ctx.save();ctx.translate(C.dep*PSX,-C.dep*PSY);try{KaelLook.coatFly(ctx,C,{now:S.t,dir:{x:.2,y:-1}});}catch(e){}ctx.restore();}return true;}return de(it);};}
// a grenade in the air or rolling: the body, the lever, the ring gone
function drawThrown(o){const q=P(o.x,o.y,o.dep);ctx.save();ctx.translate(q.x,q.y);ctx.rotate(o.ang);ctx.fillStyle='#2b3324';ctx.strokeStyle='#0a0c08';ctx.lineWidth=.8;
  ctx.beginPath();ctx.ellipse(0,0,3.2,4,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#8e95a3';ctx.fillRect(-1.3,-5.8,2.6,2);
  // the fuse burning in its last second
  if(o.fuse-S.t<1){ctx.fillStyle=`rgba(255,180,80,${.5+.5*Math.sin(S.t*40)})`;ctx.beginPath();ctx.arc(0,-6.4,1.2,0,TAU);ctx.fill();}ctx.restore();}
{const es=drawEnvShadows;drawEnvShadows=function(){es();for(const B of S.veh)drawVehShadow(B);};}
// the freight car's front (its frame and its gate) stands among everything else by its depth: whoever is in the car is behind his
// gate, whoever is on the platform is in front of it
{const ei=envItems;envItems=function(items){ei(items);if(S.arenaKey!=='station'||S.stationEnd==='lantern')return;const SL=stationLook();
  if(SL&&SL.frontItem){const F=SL.frontItem();items.push({d:F.d-.01,cageFront:F});}};}
{const de=drawEnvItem;drawEnvItem=function(it){if(it.cageFront){ctx.save();try{it.cageFront.draw(ctx);}catch(e){}ctx.restore();return true;}return de(it);};}
// down in the hay on the Sump's roof nothing of him shows below the roof he lies on (his hair goes down into the heap)
{const df=drawFighter;drawFighter=function(f){const P=S.pit;if(S.arenaKey!=='fall'||!P||!P.on||P.base==null||P.stage!=='landed'||f!==S.F[0])return df(f);
  const y=pitRim()+PIT.roof.y+1;ctx.save();ctx.translate(-f.dep*PSX,f.dep*PSY);ctx.beginPath();ctx.rect(-1e4,-1e4,2e4,y+1e4);ctx.clip();ctx.translate(f.dep*PSX,-f.dep*PSY);
  try{df(f);}finally{ctx.restore();}};}
// the arm torn off in the Pit, hanging on the spike: drawn in his look, in the plane he fell in. Cut off from the null in him, its gilt
// lights again as it comes away (the scars it had on him go back to lines of light over a moment) and stays lit
function pitArmDrain(A){return 1-sstep(clamp((S.t-A.t0-.3)/1.6,0,1));}
{const ei=envItems;envItems=function(items){ei(items);const P=S.pit;if(S.arenaKey==='fall'&&P&&P.arm&&P.base!=null)items.push({d:PIT_DEP+.02,pitArm:P.arm});};}
{const de=drawEnvItem;drawEnvItem=function(it){if(!it.pitArm)return de(it);const A=it.pitArm,rim=pitRim(),Q=A.pts.map(q=>({x:q.x,y:rim+q.y})),K=hero();
  // (only inside the Pit's own picture, as its walls are: a phone held upright sees past the picture's ends)
  ctx.save();ctx.beginPath();ctx.rect(-1e4,-110,2e4,H+230);ctx.clip();try{
    if(K&&lookOn(K)){const L=kaelLight(K),lt=L.light?{x:L.light.x+PIT_DEP*PSX,y:L.light.y-PIT_DEP*PSY}:null;
      KaelLook.armPiece(ctx,{S:Q[0],E:Q[1],H:Q[2]},{light:lt,gore:S.gore!=='off'?GORE_COL[S.gore].mark:null,coatOff:A.coatOff,sz:K.body.h*(.93+.07*K.body.bulk),fa:A.fa,drain:pitArmDrain(A)});
      // its light on the wall round it, the only light left of him
      const lit=1-pitArmDrain(A);if(lit>.02){const cx=(Q[0].x+Q[1].x+Q[2].x)/3,cy=(Q[0].y+Q[1].y+Q[2].y)/3,r=42,g=ctx.createRadialGradient(cx,cy,0,cx,cy,r);
        g.addColorStop(0,`rgba(127,243,227,${(.17*lit).toFixed(3)})`);g.addColorStop(1,'rgba(127,243,227,0)');ctx.globalCompositeOperation='lighter';ctx.fillStyle=g;ctx.fillRect(cx-r,cy-r,r*2,r*2);ctx.globalCompositeOperation='source-over';}}
    else{ctx.lineCap='round';limb(Q[0],Q[1],Q[2],K?K.body.limbW:5,SIL);if(S.gore!=='off'){ctx.fillStyle=GORE_COL[S.gore].mark;circ(Q[0],2.6);}}}catch(e){}
  ctx.restore();return true;};}
// ---------- the pane he went through ----------
// What is left of it stands in the wall of glass, by depth among everything else: jagged teeth along its frame with the light along
// their broken edges, cracks running back from them, the glass going out of it into the night (seen only through the wall of glass),
// and for a moment the flash where it went.
{const ei=envItems;envItems=function(items){ei(items);const Gl=S.story&&S.story.glass;if(Gl&&S.arenaKey==='restaurant')items.push({d:Gl.d-.01,glassOut:Gl});};}
{const de=drawEnvItem;drawEnvItem=function(it){if(it.glassOut){drawBrokenPane(it.glassOut);return true;}return de(it);};}
function paneTeeth(Gl){if(Gl.teeth)return Gl.teeth;const R=mulberry32(Gl.seed^0x5bd1),x0=Gl.x0+2.6,x1=Gl.x1-2.6,y0=Gl.y0+1,y1=Gl.y1-1;
  // each side of the frame: its straight edge, and a broken one a little way in from it
  const side=(ax,ay,bx,by,nx,ny,n,deep)=>{const pts=[[ax,ay]];for(let i=1;i<n;i++){const u=(i+(R()-.5)*.6)/n,e=R()<.28?deep*(.7+R()*.9):deep*(.12+R()*.4);pts.push([lerp(ax,bx,u)+nx*e,lerp(ay,by,u)+ny*e]);}pts.push([bx,by]);return pts;};
  const T=[side(x0,y0,x1,y0,0,1,8,40),side(x1,y1,x0,y1,0,-1,7,16),side(x0,y1,x0,y0,1,0,12,20),side(x1,y0,x1,y1,-1,0,12,20)];
  // cracks back from the broken edge into what is left, and a few where the frame let it go
  const cr=[];for(const sd of T)for(let i=1;i<sd.length-1;i++){if(R()<.45)continue;const q=sd[i],a=sd[0],b=sd[sd.length-1],ux=b[0]-a[0],uy=b[1]-a[1],t=((q[0]-a[0])*ux+(q[1]-a[1])*uy)/(ux*ux+uy*uy||1);
    // from the broken edge back toward the frame
    const fx=a[0]+ux*t,fy=a[1]+uy*t,k=.55+R()*.35;cr.push([q[0],q[1],lerp(q[0],fx,k)+(R()-.5)*6,lerp(q[1],fy,k)+(R()-.5)*6]);}
  return Gl.teeth={T,cr};}
function drawBrokenPane(Gl){const u=S.t-Gl.t0,{T,cr}=paneTeeth(Gl);ctx.save();ctx.translate(Gl.d*PSX,-Gl.d*PSY);
  // the glass going out into the night: only through the wall of glass
  if(Gl.frag.length){ctx.save();ctx.beginPath();ctx.rect(OFFICE_GLASS.x0-4,Gl.y0,OFFICE_GLASS.pane*40,Gl.y1-Gl.y0);ctx.clip();
    for(const s of Gl.frag){const dd=s.d-Gl.d;ctx.save();ctx.translate(s.x+dd*PSX,s.y-dd*PSY);ctx.rotate(s.a);
      const lit=Math.sin(S.t*14+s.ph*5)>.6;ctx.fillStyle=lit?'rgba(240,252,255,.95)':'rgba(206,236,246,.7)';
      ctx.beginPath();ctx.moveTo(-s.s*.5,s.s*.35);ctx.lineTo(s.s*.55,s.s*.1);ctx.lineTo(-s.s*.1,-s.s*.5);ctx.closePath();ctx.fill();ctx.restore();}
    ctx.restore();}
  // what is left in the frame
  for(const sd of T){ctx.fillStyle='rgba(196,230,244,.17)';ctx.beginPath();sd.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(236,250,255,.82)';ctx.lineWidth=.8;ctx.beginPath();for(let i=1;i<sd.length;i++){const a=sd[i-1],b=sd[i];if(i===1)ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);}ctx.stroke();}
  ctx.strokeStyle='rgba(226,246,255,.5)';ctx.lineWidth=.55;ctx.beginPath();for(const c of cr){ctx.moveTo(c[0],c[1]);ctx.lineTo(c[2],c[3]);}ctx.stroke();
  // a glint or two along the broken edges in the room's light
  for(let i=0;i<T.length;i++){const sd=T[i],q=sd[1+((Math.floor(S.t*1.3)+i*3)%(sd.length-2))];if(q&&Math.sin(S.t*2.4+i*1.7)>.55){ctx.fillStyle='rgba(255,255,255,.9)';ctx.fillRect(q[0]-1,q[1]-1,2,2);}}
  // the flash where it went
  if(u<.22){const k=1-u/.22;ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(Gl.hx,Gl.hy,2,Gl.hx,Gl.hy,90);
    g.addColorStop(0,`rgba(235,252,255,${(.75*k).toFixed(3)})`);g.addColorStop(1,'rgba(160,220,255,0)');ctx.fillStyle=g;ctx.fillRect(Gl.hx-90,Gl.hy-90,180,180);ctx.restore();}
  ctx.restore();}
// nobody who is not in the picture casts a shadow: someone not yet in the scene, the man in the helicopter's door, a rider still in
// the dark beyond the end of the pit
function storyNoShadow(f){if(f.hidden||f.inHeli||f.clipRect)return true;if(f.pitClip!=null&&S.arenaKey==='station'){const SL=stationLook(),M=SL&&SL.LAYOUT&&SL.LAYOUT.MAIN;if(M&&(f.station<M.x0||f.station>M.x1))return true;}return false;}
{const ds=drawShadows;drawShadows=function(){const off=S.F.filter(f=>!f.gone&&storyNoShadow(f));for(const f of off)f.gone=true;try{ds();}finally{for(const f of off)f.gone=false;}};}
function drawVehicle(B){
  if(B.kind==='heli'){if(typeof HeliLook!=='undefined'&&!S.classicLook){const L=kaelLight({p:[{x:B.x,y:B.gy-B.y}],dep:B.dep,facing:B.fa,station:B.x});ctx.save();HeliLook.draw(ctx,B,{light:L.light,dir:L.dir,now:S.t});ctx.restore();return;}
    const q=P(B.x,B.gy-B.y-40,B.dep);ctx.save();ctx.fillStyle='#0b0b10';ctx.beginPath();ctx.ellipse(q.x,q.y,90,34,0,0,TAU);ctx.fill();ctx.strokeStyle='#e2b65a';ctx.lineWidth=1.2;ctx.stroke();
    ctx.strokeStyle='rgba(200,200,220,.35)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(q.x-150*Math.cos(B.rotor),q.y-40);ctx.lineTo(q.x+150*Math.cos(B.rotor),q.y-40);ctx.stroke();ctx.restore();return;}
  // the train in the station stands in the pit behind the platform: the platform's edge and the pit's ends hide what is below and beyond them
  if(B.kind==='train'){if(typeof TrainLook!=='undefined'&&!S.classicLook){const L=kaelLight({p:[{x:B.x,y:B.gy-60}],dep:B.dep,facing:B.fa,station:B.x}),SL=S.arenaKey==='station'&&stationLook();
    ctx.save();TrainLook.draw(ctx,B,{light:L.light,dir:L.dir,now:S.t,clip:SL&&SL.pitClip?c=>SL.pitClip(c,B.dep):null});ctx.restore();}return;}
  if(B.kind==='apc'){if(typeof ApcLook!=='undefined'&&!S.classicLook){const L=kaelLight({p:[{x:B.x,y:B.gy-80}],dep:B.dep,facing:B.fa,station:B.x});ctx.save();ApcLook.draw(ctx,B,{light:L.light,dir:L.dir,now:S.t,noShadow:!!ApcLook.shadow});ctx.restore();return;}
    drawApcStub(B);return;}
  if(typeof VehLook!=='undefined'&&B.kind==='bike'){const L=kaelLight({p:[{x:B.x,y:B.gy-60}],dep:B.dep,facing:B.fa,station:B.x});
    ctx.save();VehLook.bike(ctx,B,{light:L.light,dir:L.dir,now:S.t});ctx.restore();return;}
  if(B.kind==='bike')drawBikeStub(B);}
function drawVehShadow(B){if(B.kind==='heli'){if(typeof HeliLook!=='undefined'&&HeliLook.wash&&!S.classicLook){ctx.save();HeliLook.wash(ctx,B,{now:S.t});ctx.restore();}return;}
  if(B.kind==='apc'){if(typeof ApcLook!=='undefined'&&ApcLook.shadow&&!S.classicLook){ctx.save();ApcLook.shadow(ctx,B);ctx.restore();return;}
  const bx=apcBox(B),q=P((bx.l+bx.r)/2,B.gy,B.dep);ctx.fillStyle='rgba(3,2,8,.45)';ctx.beginPath();ctx.ellipse(q.x,q.y,(bx.r-bx.l)/2+16,8,0,0,TAU);ctx.fill();return;}
  if(B.kind!=='bike')return;const a=bikeAt(B,-60,0),b=bikeAt(B,64,0),q=P((a.x+b.x)/2,B.gy,B.dep);
  ctx.fillStyle='rgba(3,2,8,.38)';ctx.beginPath();ctx.ellipse(q.x,q.y,Math.abs(b.x-a.x)/2+12,5,0,0,TAU);ctx.fill();
  if(typeof VehLook!=='undefined'&&VehLook.headBeam&&B.light>.05)VehLook.headBeam(ctx,B,{now:S.t});}
// a plain carrier for when its painter is not there: a slab-sided hull on six wheels, a gun on the roof
function drawApcStub(A){const bx=apcBox(A),g=A.gy,d=A.dep,wr=A.wreck||0,j=(A.jolt||0)*6*Math.sin(S.t*40);
  ctx.save();ctx.translate(0,-j);const pt=(x,y)=>P(x,y,d);
  ctx.fillStyle=wr>.5?'#141210':'#1c2333';ctx.beginPath();const a=pt(bx.l,g-30),b=pt(bx.l+40,bx.t),c=pt(bx.r,bx.t),e=pt(bx.r,g-30);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.lineTo(e.x,e.y);ctx.closePath();ctx.fill();
  ctx.strokeStyle=wr>.5?'#3a2a1a':'#e2b65a';ctx.lineWidth=1;ctx.stroke();
  for(let i=0;i<3;i++){const w=pt(bx.l+70+i*(bx.r-bx.l-130)/2,g-26);ctx.fillStyle='#07070a';ctx.beginPath();ctx.arc(w.x,w.y,26,0,TAU);ctx.fill();}
  const M=apcGun(A),h=apcHatch(A),m=P(M.x,M.y,d),hh=P(h.x,h.y,d);ctx.strokeStyle='#0b0b0e';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(hh.x,hh.y-14);ctx.lineTo(m.x,m.y);ctx.stroke();
  if(A.lights&&!wr){const l=pt((bx.l+bx.r)/2,bx.t-4),on=Math.sin(S.t*9)>0;ctx.fillStyle=on?'#ffb347':'#6fb7ff';ctx.fillRect(l.x-10,l.y-4,20,4);}
  ctx.restore();}
// fire on a wreck, and a blast, from FxLook when the page has it
function drawFire(F){if(typeof FxLook!=='undefined'&&FxLook.fire&&!S.classicLook){ctx.save();FxLook.fire(ctx,F,{now:S.t});ctx.restore();return;}
  const q=P(F.x,F.y,F.dep),n=7;ctx.save();ctx.globalCompositeOperation='lighter';
  for(let i=0;i<n;i++){const ph=S.t*5+i*1.7+F.seed,x=q.x+(i/(n-1)-.5)*F.w*.8,h=F.h*(.55+.45*Math.sin(ph))*F.k,g=ctx.createLinearGradient(x,q.y,x,q.y-h);
    g.addColorStop(0,'rgba(255,170,60,.75)');g.addColorStop(.6,'rgba(255,90,30,.4)');g.addColorStop(1,'rgba(255,60,20,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,q.y-h/2,F.w*.09,h/2,0,0,TAU);ctx.fill();}
  ctx.restore();}
function drawBoom(b){if(typeof FxLook!=='undefined'&&FxLook.boom&&!S.classicLook){ctx.save();FxLook.boom(ctx,b,{now:S.t});ctx.restore();return;}
  const u=S.t-b.t0;if(u<0||u>4)return;const q=P(b.x,b.y,b.dep),r=(40+220*Math.min(1,u/.5))*b.size;ctx.save();
  if(u<1.2){ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(q.x,q.y,0,q.x,q.y,r);g.addColorStop(0,`rgba(255,240,200,${.95*(1-u/1.2)})`);g.addColorStop(.4,`rgba(255,140,50,${.7*(1-u/1.2)})`);g.addColorStop(1,'rgba(255,80,20,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(q.x,q.y-u*40,r,0,TAU);ctx.fill();ctx.globalCompositeOperation='source-over';}
  ctx.fillStyle=`rgba(20,16,18,${.55*clamp(u/.6,0,1)*clamp(1-(u-2)/2,0,1)})`;ctx.beginPath();ctx.arc(q.x,q.y-60-u*50,r*.8,0,TAU);ctx.fill();ctx.restore();}
// bits of a machine thrown by a blast
{const dd=drawDebrisPiece;drawDebrisPiece=function(sg,d,col){if(!sg.scrap)return dd(sg,d,col);const a=P(sg.a.x,sg.a.y,d),b=P(sg.b.x,sg.b.y,d);
  ctx.save();ctx.lineCap='round';ctx.strokeStyle=col||'#16141a';ctx.lineWidth=sg.w||4;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
  ctx.strokeStyle='rgba(226,182,90,.5)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(a.x,a.y-1);ctx.lineTo(b.x,b.y-1);ctx.stroke();ctx.restore();};}
// ---------- the police barriers ----------
// A concrete barrier across the road, seen from the kerb: its end toward us in the safety-shape profile, its long flank lit cold by
// the floodlight on the right, the top worn pale, a band of reflective tape, grime where it meets the wet road, and the chips the
// rounds have knocked out of it. Drawn in depth slices like any divider, so whoever crouches behind it is drawn in front of it.
const JERSEY=[[-22,0],[-22,8],[-14,24],[-7,84],[7,84],[14,24],[22,8],[22,0]];
function drawConcreteSlice(it){const w=it.dv,A=it.a,B=it.b,g=S.arena.ground(w.x,(A+B)/2),k=w.h/84,X=v=>w.x+v[0]*k*(w.t/30),Y=v=>g-v[1]*k;
  const quad=(a,b,col)=>{ctx.fillStyle=col;poly([P(X(a),Y(a),A),P(X(b),Y(b),A),P(X(b),Y(b),B),P(X(a),Y(a),B)]);};
  ctx.save();
  // the flank toward the light, face by face up the profile, and the top
  quad(JERSEY[7],JERSEY[6],'#4d525b');quad(JERSEY[6],JERSEY[5],'#646a74');quad(JERSEY[5],JERSEY[4],'#7a808a');quad(JERSEY[4],JERSEY[3],'#9aa0a8');
  // the wet foot of it, darker, and a sheen along the top edge
  ctx.fillStyle='rgba(6,6,10,.4)';poly([P(X(JERSEY[7]),g,A),P(X(JERSEY[6]),Y(JERSEY[6]),A),P(X(JERSEY[6]),Y(JERSEY[6]),B),P(X(JERSEY[7]),g,B)]);
  ctx.strokeStyle='rgba(220,232,255,.35)';ctx.lineWidth=.8;ctx.beginPath();{const a=P(X(JERSEY[4]),Y(JERSEY[4]),A),b=P(X(JERSEY[4]),Y(JERSEY[4]),B);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();
  // the tape along the flank, amber and white in turns
  const t0=.62,t1=.7,ty=u=>{const a=JERSEY[4],b=JERSEY[5];return[lerp(b[0],a[0],u),lerp(b[1],a[1],u)];};
  for(let d=Math.ceil(A/9)*9;d<B;d+=9){const e=Math.min(B,d+9),col=(Math.floor(d/9)%2)?'rgba(226,182,90,.8)':'rgba(236,236,228,.75)',p0=ty((t0*84-24)/60),p1=ty((t1*84-24)/60);
    ctx.fillStyle=col;poly([P(X(p0),Y(p0),d),P(X(p1),Y(p1),d),P(X(p1),Y(p1),e),P(X(p0),Y(p0),e)]);}
  // where the rounds went in
  for(const c of w.chips||[]){if(c.face<0||c.d<A||c.d>=B)continue;const q=P(w.x+(w.t/2-3)*.9,c.y,c.d);
    ctx.fillStyle='rgba(200,198,190,.55)';ctx.beginPath();ctx.ellipse(q.x,q.y,c.r*1.9,c.r*1.5,0,0,TAU);ctx.fill();
    ctx.fillStyle='#1b1c22';ctx.beginPath();ctx.ellipse(q.x,q.y,c.r,c.r*.8,0,0,TAU);ctx.fill();}
  // its end toward us: the profile, a little darker than the lit flank, with the tape across it and a worn gilt rim
  if(it.first){const pts=JERSEY.map(v=>P(X(v),Y(v),A));const gr=ctx.createLinearGradient(0,pts[3].y,0,pts[0].y);gr.addColorStop(0,'#5e636c');gr.addColorStop(.7,'#474b53');gr.addColorStop(1,'#2a2c32');
    ctx.fillStyle=gr;poly(pts);
    const ta=P(X([-10,60]),Y([-10,60]),A),tb=P(X([10,60]),Y([10,60]),A),tc=P(X([9,68]),Y([9,68]),A),td=P(X([-9,68]),Y([-9,68]),A);
    ctx.fillStyle='rgba(226,182,90,.85)';poly([ta,tb,tc,td]);ctx.fillStyle='rgba(236,236,228,.8)';
    for(let i=0;i<3;i++){const u0=i/3+.06,u1=u0+.14,L=(u,top)=>{const a=top?td:ta,b=top?tc:tb;return{x:lerp(a.x,b.x,u),y:lerp(a.y,b.y,u)};};poly([L(u0,0),L(u1,0),L(u1+.08,1),L(u0+.08,1)]);}
    ctx.strokeStyle='rgba(226,182,90,.45)';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i].x,pts[i].y);ctx.stroke();}
  ctx.restore();}
{const dd=drawDivSlice;drawDivSlice=function(it){if(it.dv&&it.dv.mat==='concrete'&&!S.classicLook){drawConcreteSlice(it);return;}dd(it);};}
// the words for cover: a gunman down behind a barrier is in cover, and the panels say what it is worth
{const ci=cmdInfo0;cmdInfo0=function(A,D,k){const r=ci(A,D,k);if(!r||!isGun(A)||A.downed||A.clinch)return r;
  if(k==='guard'){const w=D&&coverFrom(A,D);if(w)return{...r,tq:A.guarding?'Stay down behind the barrier':'Down behind the barrier',h:r.h.replace('+4 DEF','+6 DEF')};return r;}
  if(GUN_KINDS.includes(k)&&D&&coverFrom(D,A))return{...r,tq:r.tq.replace(' · in cover','')+(D.guarding?' · behind the barrier':' · at the barrier')};
  return r;};}
{const rt=roleText;roleText=function(A,D,k){const t=rt(A,D,k);if(!GUN_KINDS.includes(k)||!D||!coverFrom(D,A))return t;
  return t.replace(`${D.name} is in cover: +4 DEF.`,'').trim()+(D.guarding?` ${D.name} is down behind the barrier: +6 DEF, and a miss goes into the concrete.`:` ${D.name} is standing at the barrier: +2 DEF.`);};}
// the log: a gunman taking cover gets down, he does not raise a guard
V11UI.init.push(()=>{const lg=S.hooks.log;S.hooks.log=e=>{lg(e);if(e.type!=='guard'||!e.A||!isGun(e.A)||typeof logEl==='undefined')return;const li=logEl.firstElementChild;if(!li)return;
  const w=coverFrom(e.A,targetOf(e.A)),l=li.querySelector('.lg-l > span:not([class])'),o=li.querySelector('.out-guard'),pf=li.querySelector('.lg-perf');
  if(l)l.textContent=w?'gets down behind the barrier':'gets down low';if(o)o.textContent=w?'DEF +6':'DEF +4';
  if(pf)pf.textContent=`balance ${e.A.foot}/${footMaxOf(e.A)} · ${w?'+6 DEF against shots · a round that misses goes into the concrete':'+4 DEF against shots'} · he comes up to shoot`;};});
// under him on the floor: IN COVER for a gunman taking cover, not the swordsman's GUARD
{const df=drawFooting;drawFooting=function(f){const r=df(f);if(r&&isGun(f)&&f.guarding&&!f.downed)r.t=r.t.replace('GUARD','IN COVER');return r;};}
{const ut=updateTags;updateTags=function(){ut();for(const f of S.F){if(f.dead||!isGun(f)||!f.guarding||f.downed)continue;const el=$('tags'+f.idx);if(!el)continue;
  const w=coverFrom(f,targetOf(f)),tip=w?'Down behind the barrier: +6 DEF against shots, and a round that misses goes into the concrete':'Crouched low: +4 DEF against shots';
  const h=el.innerHTML.replace(/<span class="tag" style="color:var\(--block\)"[^>]*>Guard<\/span>/,`<span class="tag" style="color:var(--block)" title="${tip}">In cover</span>`);if(h!==el.innerHTML)el.innerHTML=h;}};}
// a grenade on a belt, or in a hand on its way into a coat
// the beasts are drawn by their own painter; someone not yet in the scene (f.hidden) is not drawn at all
function drawBeast(f){const L=kaelLight(f);BeastLook.draw(ctx,f,{light:L.light,dir:L.dir,now:S.t,opening:!!(S.opening&&S.opening.f===f),lookBack:!!(f.look&&typeof tacLook==='function'&&tacLook(f)<-.4),
  drawOther:g=>{if(g.wp.unarmed)return;if(beastArm(g.weaponKey)){ctx.save();BeastLook.weapon(ctx,g.weaponKey,g.p[HAF],g.p[TIP],g.facing,{light:L.light,dir:L.dir,now:S.t,seed:g.seed});ctx.restore();}else drawWeapon(g);}});
  drawMarks(f);}
function beastArm(k){return typeof BeastLook!=='undefined'&&BeastLook.weapon&&BeastLook.WEAPONS&&!!BeastLook.WEAPONS[k]&&!S.classicLook;}
// a beast's weapon in anyone else's hand, or on the floor, is still drawn as itself
{const dw=drawWeaponAt;drawWeaponAt=function(k,h,t,fa){if(beastArm(k)){ctx.save();BeastLook.weapon(ctx,k,h,t,fa,{dir:{x:-.45,y:-1},now:S.t});ctx.restore();return;}dw(k,h,t,fa);};}
// a rider on the train in the station shows only where the train does (between the pit's ends): the clip is the station's, set in
// the world's frame, so the fighter's own depth shift is taken off and put back round it
{const df=drawFighter;drawFighter=function(f){if(f.hidden)return;
  // out past a wall of glass a body shows only through the glass (f.clipRect, in the picture's own frame)
  if(f.clipRect){const c=f.clipRect;ctx.save();ctx.translate(-f.dep*PSX,f.dep*PSY);ctx.beginPath();ctx.rect(c.x0,c.y0,c.x1-c.x0,c.y1-c.y0);ctx.clip();ctx.translate(f.dep*PSX,-f.dep*PSY);
    f.clipRect=null;try{drawFighter(f);}finally{f.clipRect=c;ctx.restore();}return;}
  if(f.pitClip!=null&&S.arenaKey==='station'){const SL=stationLook();if(SL&&SL.pitClip){ctx.save();ctx.translate(-f.dep*PSX,f.dep*PSY);SL.pitClip(ctx,f.pitClip);ctx.translate(f.dep*PSX,-f.dep*PSY);
    const pc=f.pitClip;f.pitClip=null;try{drawFighter(f);}finally{f.pitClip=pc;ctx.restore();}return;}}
  if(f.beast&&typeof BeastLook!=='undefined'&&BeastLook.draw&&!S.classicLook){drawBeast(f);return;}
  df(f);if(f.grenade==='belt'||f.grenade==='hand'){const q=f.grenade==='hand'?{x:f.p[HAF].x,y:f.p[HAF].y}:grenadeAt(f);
  ctx.save();ctx.fillStyle='#2b3324';ctx.strokeStyle='#0a0c08';ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(q.x,q.y,3.1,3.9,0,0,TAU);ctx.fill();ctx.stroke();
  ctx.fillStyle='#8e95a3';ctx.fillRect(q.x-1.3,q.y-5.6,2.6,2);ctx.strokeStyle='#c8ccd4';ctx.lineWidth=.6;ctx.beginPath();ctx.arc(q.x+2.2,q.y-5,1.4,0,TAU);ctx.stroke();ctx.restore();}};}
// a plain bike for when the painter is not there: wheels, frame, tank and seat in silhouette
function drawBikeStub(B){const pt=(x,y)=>{const q=bikeAt(B,x,y);return P(q.x,q.y,B.dep);},R=BIKE.R;
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  // down on its side: the side view flattens toward the road
  if(B.lie>0){const g=P(B.x,B.gy,B.dep);ctx.translate(0,g.y);ctx.scale(1,1-.72*B.lie);ctx.translate(0,-g.y);}
  for(const ax of [BIKE.rear,BIKE.front]){const c=pt(ax[0],ax[1]);ctx.fillStyle='#07060a';ctx.beginPath();ctx.arc(c.x,c.y,R,0,TAU);ctx.fill();ctx.strokeStyle='#8a6a2e';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(c.x,c.y,R*.72,0,TAU);ctx.stroke();}
  const line=(pts,w,col)=>{ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();pts.forEach((p,i)=>{const q=pt(p[0],p[1]);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);});ctx.stroke();};
  line([[-60,25],[-12,36],[44,80],[64,25]],5,'#121016');line([[-46,66],[-6,70],[34,80]],9,'#0b0a0e');line([[-4,74],[30,80]],13,'#141118');line([[28,84],[34,88]],3,'#2a2620');
  ctx.restore();}

// ---------- the arc-blade in a scene: stowed at the belt, rolling back up ----------
{const kd=KaelLook.draw;KaelLook.draw=function(c,F,o){if(F.stow){const at=o.afterTorso;o=Object.assign({},o,{bladeOK:false,drawOther:F.weaponKey==='elven'?null:o.drawOther,afterTorso:f=>{if(at)at(f);drawStowedHilt(f);}});}return kd(c,F,o);};}
{const as=arcState;arcState=function(f){const R=f.arcRev;if(R){const u=(S.t-R.t0)/R.dur;if(u<0)return as(f);if(u<1)return{mode:'unroll',p:1-u};return{mode:'rolled'};}return as(f);};}
// the rolled-up hilt at his hip, slanted down and back
function drawStowedHilt(f){const P0=f.p[PEL],C0=f.p[CHE],fa=f.facing,dx=C0.x-P0.x,dy=C0.y-P0.y,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,nx=-uy*fa,ny=ux*fa;
  const at=(a,s)=>({x:P0.x+ux*a+nx*s,y:P0.y+uy*a+ny*s}),h=at(4,4),t=at(-8,-6);
  ctx.save();ctx.lineCap='round';seg(h,t,3.6,'#0a090e');seg(at(3,3.2),at(-5,-3.8),.8,'#e2b65a');ctx.fillStyle='#e2b65a';circ(at(-9,-7),1.6);ctx.restore();}

// ---------- the crews the story brings: the men in the field ----------
Object.assign(CastLook.CREWS,{
  field:{name:'Field crew',note:'Hallowell’s hired men out of town: waxed jackets and work coats, knit caps and flat caps, boots',
    col:{suit:'#26231a',suitFar:'#36321f',lapel:'#2c281e',vest:'#1c1912',vestFar:'#2e291e',shirt:'#57513f',shirtFar:'#3f3a2e',sleeve:'#57513f',sleeveFar:'#3f3a2e',trouser:'#1d1a14',trouserFar:'#2d2920',braces:'#17140f',hat:'#2a2a24',hatShade:'#1a1a16',tie:'#0e0c0a'},
    tops:[['suit',3],['waistcoat',1],['shirt',1]],sleeves:[['rolled',1],['shirt',2]],hats:[['beanie',3],['flatcap',2],[null,1]],aprons:[[null,1]],ties:[[null,1]],braces:.5,boots:1}});
{const cr=castRoom;castRoom=f=>f.ward||cr(f);}
// the riders on the avenue: black leather, denim, open helmets with goggle straps, boots
Object.assign(CastLook.CREWS,{
  bikers:{name:'Road crew',note:'Hallowell’s outriders: black leather jackets, denim, open-face helmets and goggles, boots',
    col:{suit:'#1b1918',suitFar:'#2c2826',lapel:'#24201e',vest:'#161413',vestFar:'#262220',shirt:'#4e4a46',shirtFar:'#3a3734',sleeve:'#1b1918',sleeveFar:'#2c2826',
      trouser:'#222a38',trouserFar:'#323b4c',braces:'#141210',hat:'#121214',hatShade:'#060608',badge:'#d8a64e',tie:'#0e0c0a'},
    tops:[['suit',3],['waistcoat',1]],sleeves:[['jacket',1]],hats:[['helmet',4],['bandana',1]],aprons:[[null,1]],ties:[[null,1]],braces:0,boots:1}});
// the man in white: he speaks for the family, and never fights
Object.assign(CastLook.CAST,{'The man in white':{race:'elf',room:'office',role:'Speaks for the family. Never fights',temper:null,
  col:CastLook.elfCol('#e2b65a',{suit:'#d9d2c2',suitFar:'#b9b2a2',trouser:'#d9d2c2',trouserFar:'#b9b2a2',vest:'#e6dfcf',vestFar:'#c4bdad',lapel:'#ece6d8',sleeve:'#d9d2c2',coat:'#d9d2c2',
    shirt:'#1a1820',shirtFar:'#2a2632',tie:'#e2b65a',square:'#e2b65a',button:'#e2b65a',trim:null,rim:'#6f6658',
    hair:'#dfe2e8',hairShade:'#80858f',hairHi:'#ffffff',hairLine:'#6a6e78',glasses:'#e2b65a',dark:'#0e0c14',eye:'#ffe6a8',accent:'#e2b65a',accentShade:'#8a6a2e',shoe:'#e6dfcf',shoeFar:'#b9b2a2'}),
  head:{skull:'old',ear:'swept',hair:'slick',glasses:1},
  outfit:{top:'suit',sleeves:'jacket',neck:'collar',tie:'tie',piping:0,square:1,watch:1,three:1},trail:null,build:{cm:191,bulk:1.02}}});
// the police at the checkpoint: navy tunics, peaked caps with the city's gold badge, boots
Object.assign(CastLook.CREWS,{
  police:{name:'City police',note:'The tower district’s police: navy tunics and trousers, peaked caps with a gold badge, black boots',
    col:{suit:'#1c2335',suitFar:'#2a3249',lapel:'#232b40',vest:'#161b29',vestFar:'#232a3c',shirt:'#3a4256',shirtFar:'#2c3242',sleeve:'#1c2335',sleeveFar:'#2a3249',
      trouser:'#161b29',trouserFar:'#242b3d',braces:'#10131c',hat:'#121725',hatShade:'#0a0d16',badge:'#d8b35a',lanyard:'#b9a06a',tie:'#0b0d14'},
    tops:[['blazer',3],['suit',1]],sleeves:[['jacket',1]],hats:[['seccap',4],[null,1]],aprons:[[null,1]],ties:[['tie',2],[null,1]],braces:0,boots:1}});
// an open-face helmet: the shell down over the ears, the goggle strap round it and the lens catching the light at the brow
CastLook.HATS.helmet={crown:'M38,-9 C41,-28 31,-49 6,-55 C-17,-59 -41,-47 -48,-24 C-51,-9 -49,7 -42,15 L-31,11 C-26,-1 -9,-9 12,-11 Z',
  band:'M41,-13 L41,-23 C12,-30 -20,-28 -48,-19 L-49,-9 C-21,-17 12,-20 41,-13 Z',badge:[33,-18],mat:'hat'};

// ---------- sounds the scenes need ----------
// the engine is a held voice: two saws and a rumble through a filter, pitched by the bike's speed, while any bike is running. Its throb
// (the LFO) works on a gain of its own ahead of the level (`am`), so a level of nothing is silence: on the level itself, as before
// V62, the throb went on at full strength after the bike had stopped, from the opening to the end of the story. At full level it
// sounds as it always has (.16 and a throb of .35 on it). Quiet for a second and a half, the voice is stopped; the next bike starts
// a new one
let ENG=null;
const ENG_LVL=.16,ENG_THROB=.35/ENG_LVL,ENG_HUSH=1.5;
function engineVoice(){if(!AC||AC.state!=='running')return null;if(ENG)return ENG;
  const a=AC,g=a.createGain(),am=a.createGain(),f=a.createBiquadFilter(),o1=a.createOscillator(),o2=a.createOscillator(),lfo=a.createOscillator(),lg=a.createGain(),n=a.createBufferSource(),ng=a.createGain(),nf=a.createBiquadFilter();
  o1.type='sawtooth';o2.type='sawtooth';o1.frequency.value=48;o2.frequency.value=48.7;f.type='lowpass';f.frequency.value=420;f.Q.value=2.2;g.gain.value=0;am.gain.value=1;
  lfo.frequency.value=22;lg.gain.value=ENG_THROB;lfo.connect(lg);lg.connect(am.gain);
  n.buffer=noiseBuf;n.loop=true;nf.type='bandpass';nf.frequency.value=180;nf.Q.value=.8;ng.gain.value=.25;n.connect(nf);nf.connect(ng);ng.connect(f);
  o1.connect(f);o2.connect(f);f.connect(am);am.connect(g);g.connect(master);for(const o of [o1,o2,lfo,n])o.start();
  ENG={g,am,f,o1,o2,lfo,n,a,quiet:null};return ENG;}
function engineStop(){const E=ENG;if(!E)return;ENG=null;for(const o of [E.o1,E.o2,E.lfo,E.n])try{o.stop();}catch(e){}try{E.g.disconnect();}catch(e){}}
function engineFrame(){const B=S.soundOn?S.veh.find(v=>v.kind==='bike'&&v.run>0&&v.x>-400&&v.x<W+400):null;
  // (no bike running, or the sound off: down to nothing, then stopped)
  if(!B){if(ENG){const t=ENG.a.currentTime;if(ENG.quiet==null){ENG.quiet=t;ENG.g.gain.setTargetAtTime(0,t,.12);}else if(t-ENG.quiet>ENG_HUSH)engineStop();}return;}
  const E=engineVoice();if(!E)return;E.quiet=null;const sp=Math.min(1,Math.abs(B.vx)/360),rv=B.rev||0,hz=46+sp*90+rv*60,t=E.a.currentTime;
  E.o1.frequency.setTargetAtTime(hz,t,.08);E.o2.frequency.setTargetAtTime(hz*1.012,t,.08);E.f.frequency.setTargetAtTime(380+sp*1400+rv*900,t,.08);E.lfo.frequency.setTargetAtTime(hz*.42,t,.08);
  const far=B.x>W+60||B.x<-160?.25:1;E.g.gain.setTargetAtTime(ENG_LVL*B.run*far,t,.1);}
// the train is a held voice too: a low rumble that opens up with its speed, and the wheels knocking over the rail joints, twice for
// each pair of bogies (on the line it is the tunnel going past at the train's speed)
let RAIL=null,RAIL_D=0,RAIL_T=0;
function railVoice(){if(!AC||AC.state!=='running')return null;if(RAIL)return RAIL;
  const a=AC,n=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();n.buffer=noiseBuf;n.loop=true;f.type='lowpass';f.frequency.value=160;f.Q.value=1.4;g.gain.value=0;
  n.connect(f);f.connect(g);g.connect(master);n.start();RAIL={g,f,a};return RAIL;}
function railFrame(){const T=S.veh.find(v=>v.kind==='train'),sp=T?Math.abs(T.v||0):S.arenaKey==='tunnel'&&S.story?Math.abs(S.scrollV||0):0,dt=clamp(S.t-RAIL_T,0,.1);RAIL_T=S.t;
  if(sp<1){if(RAIL)RAIL.g.gain.setTargetAtTime(0,RAIL.a.currentTime,.3);return;}
  const R=railVoice();if(!R)return;const k=clamp(sp/900,0,1),t=R.a.currentTime;R.f.frequency.setTargetAtTime(110+k*300,t,.25);R.g.gain.setTargetAtTime((.08+.22*k)*(S.soundOn?1:0),t,.25);
  RAIL_D+=sp*dt;if(RAIL_D>316){RAIL_D-=316;if(S.soundOn){const gap=clamp(44/sp,.03,.3)*1000;tone(.06,'square',150,95,.05);setTimeout(()=>{try{tone(.06,'square',140,90,.045);}catch(e){}},gap);}}}
// (the main UI sets its sound hook as it loads: this wraps it once the page is up)
V11UI.init.push(()=>{const sd=S.hooks.sound;S.hooks.sound=(k,v)=>{
  if(!S.soundOn||!AC||AC.state!=='running'){return;}
  try{
    if(k==='engine'){tone(.35,'sawtooth',90,46,.12);nz(.4,'lowpass',600,120,.8,.3);}
    else if(k==='rev'){const a=AC,t0=a.currentTime,o=a.createOscillator(),g=a.createGain(),f=a.createBiquadFilter();o.type='sawtooth';o.frequency.setValueAtTime(70,t0);o.frequency.exponentialRampToValueAtTime(240,t0+.55);
      f.type='lowpass';f.frequency.setValueAtTime(500,t0);f.frequency.exponentialRampToValueAtTime(2400,t0+.5);g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(.22,t0+.08);g.gain.exponentialRampToValueAtTime(.0001,t0+.9);
      o.connect(f);f.connect(g);g.connect(master);o.start(t0);o.stop(t0+1);nz(.7,'bandpass',900,300,.7,.35);}
    else if(k==='gravel'){nz(.5,'highpass',1800,900,.6,.25*clamp(v,.3,1.4));}
    else if(k==='brake'){nz(.6,'bandpass',3200,2400,8,.22);nz(.6,'bandpass',2600,1800,6,.18);}
    else if(k==='gate'){tone(.25,'square',160,90,.06);nz(.3,'bandpass',1400,700,2,.2);}
    else if(k==='lift'){tone(.6,'sawtooth',55,62,.08);nz(.6,'lowpass',300,200,.8,.2);}
    else if(k==='heli'){for(let i=0;i<6;i++)setTimeout(()=>{try{nz(.12,'lowpass',260,80,.9,.35);}catch(e){}},i*110);}
    else if(k==='charge'){tone(1.1,'sine',180,900,.08);tone(1.1,'triangle',360,1800,.04);}
    else if(k==='hex'){tone(.5,'sine',220,1800,.25);tone(.9,'triangle',1400,90,.2);nz(.6,'highpass',2400,600,.7,.4);}
    else if(k==='clink'){tone(.08,'triangle',2400,1800,.07);tone(.12,'triangle',3100,2600,.04);}
    else if(k==='ping'){tone(.18,'sine',3200,3000,.06);}
    // a lift arriving: one soft chime
    else if(k==='ding'){tone(1.2,'sine',1320,1316,.1);tone(1.2,'sine',2640,2632,.03);}
    // a blast: the crack, the boom rolling on, the debris coming down
    else if(k==='boom'){nz(.6,'lowpass',900,60,.6,.9);tone(.7,'sine',90,28,.6);nz(.45,'highpass',1200,400,.7,.35);setTimeout(()=>{try{nz(.6,'bandpass',1800,600,1,.18);}catch(e){}},420);}
    // a bike going down at speed: the crunch, the scream of metal on the road
    else if(k==='crash'){nz(.25,'lowpass',500,90,.7,.5);tone(.28,'square',210,70,.12);nz(.6,'bandpass',2800,1400,1.4,.32);}
    // the Pit: a spike through the arm, the arm tearing at the shoulder (or the sleeve, with blood off), coming away, the hay, the birds
    else if(k==='impale'){nz(.07,'highpass',3200,1400,.9,.45);tone(.26,'sine',130,42,.5);nz(.32,'bandpass',900,260,1.6,.4);tone(.12,'square',220,90,.06);}
    else if(k==='tear'){const m=clamp(v,.3,1.4);for(let i=0;i<6;i++)setTimeout(()=>{try{nz(.05+uiRand()*.04,'bandpass',900+uiRand()*900,400,2.2,.22*m);}catch(e){}},i*28+uiRand()*12);tone(.2,'sine',95,48,.22*m);}
    else if(k==='cloth'){const m=clamp(v,.3,1.4);for(let i=0;i<7;i++)setTimeout(()=>{try{nz(.04,'bandpass',2400+uiRand()*1600,1600,1.8,.16*m);}catch(e){}},i*22+uiRand()*10);}
    else if(k==='rip'){for(let i=0;i<9;i++)setTimeout(()=>{try{nz(.06,'bandpass',700+uiRand()*1200,300,2,.3);}catch(e){}},i*24);nz(.4,'lowpass',1200,160,.8,.5);tone(.34,'triangle',150,38,.42);}
    else if(k==='hay'){nz(.5,'lowpass',700,110,.7,.55);tone(.22,'sine',78,40,.32);nz(1.1,'highpass',2600,4200,.5,.16);setTimeout(()=>{try{nz(.9,'bandpass',3000,1800,.8,.1);}catch(e){}},180);}
    else if(k==='birds'){for(let i=0;i<46;i++)setTimeout(()=>{try{nz(.045,'bandpass',700+uiRand()*900,380,1.4,.11);}catch(e){}},uiRand()*1700);
      for(let i=0;i<5;i++)setTimeout(()=>{try{const f=520+uiRand()*380;tone(.12,'sawtooth',f,f*.82,.025);tone(.1,'triangle',f*2,f*1.6,.02);}catch(e){}},200+uiRand()*1300);}
    else sd(k,v);}catch(e){}};});

// ---------- the prologue's song ----------
// "Lepers Ascent" begins with the prologue's first scene, the road at sundown, and plays through once: about five minutes, on into
// the fights after it (it fades in by itself). It is a file published beside the page (music/lepers_ascent.mp3; GUIDE.md,
// "Publishing"). Over http(s) it goes through a gain of its own straight to the speakers, not through the effects' master, so its
// level (MUSIC.lvl) holds on a phone, where an audio element's own volume is fixed. If it will not load that way (a server handing
// it over from another origin without leave), it plays as a plain element at that volume, from where it had got to; so does the
// page opened as a local file, where the audio graph would hear only silence. Sound off or the page hidden holds it where it is;
// leaving the story fades it out and lets it go; beginning the prologue again starts it from the top. A chapter picked from the
// menu does not start it.
const MUSIC={src:'music/lepers_ascent.mp3',lvl:.5,fade:1,el:null,node:null,g:null,plain:true,on:false,lv:-1,offAt:0,t:0,trying:false,blocked:false};
function musicDrop(){const M=MUSIC,el=M.el;M.el=null;if(M.node){try{M.node.disconnect();}catch(e){}M.node=null;}
  if(el){el.pause();el.removeAttribute('src');try{el.load();}catch(e){}}}
// a new element for the song: through the audio graph where it can be heard there, else plain
function musicLoad(plain){const M=MUSIC;musicDrop();
  const graph=!plain&&!!AC&&typeof location!=='undefined'&&/^https?:$/.test(location.protocol),el=new Audio();
  el.preload='auto';if(graph)el.crossOrigin='anonymous';el.src=M.src;M.el=el;M.plain=true;M.lv=-1;M.trying=false;
  el.addEventListener('ended',()=>{if(M.el===el)M.on=false;});
  // (it will not load for the graph: again as a plain element, from where it had got to)
  el.addEventListener('error',()=>{if(M.el!==el||M.plain)return;const t=el.currentTime||0;musicLoad(true);try{M.el.currentTime=t;}catch(e){}musicSync();});
  if(graph)try{if(!M.g){M.g=AC.createGain();M.g.connect(AC.destination);}M.g.gain.value=0;M.node=AC.createMediaElementSource(el);M.node.connect(M.g);M.plain=false;}
    catch(e){M.node=null;}}
function musicStart(){if(typeof Audio!=='function')return;const M=MUSIC;ensureAudio();
  if(!M.el)musicLoad(false);else try{M.el.currentTime=0;}catch(e){}
  M.on=true;M.blocked=false;musicSync();}
// each frame, and at the moments that change it: the level, playing or held, and let go once the story is left or the song is over
function musicSync(){const M=MUSIC,el=M.el;if(!el)return;const now=performance.now()/1000,dt=Math.min(.1,Math.max(0,now-M.t)),
    hidden=typeof document!=='undefined'&&!!document.hidden,hear=M.on&&S.soundOn&&!hidden,lv=hear?M.lvl:0;M.t=now;
  if(lv!==M.lv){M.lv=lv;M.offAt=now;if(!M.plain&&M.g&&AC)M.g.gain.setTargetAtTime(lv,AC.currentTime,hear?.02:M.fade/4);}
  if(M.plain)el.volume=hear?lv:Math.max(0,Math.min(el.volume,M.lvl)-dt*M.lvl/M.fade);
  if(hear){if(el.paused&&!el.ended&&!M.trying&&!M.blocked){M.trying=true;let p=null;try{p=el.play();}catch(e){p=null;}
      if(p&&p.then)p.then(()=>{M.trying=false;},()=>{M.trying=false;M.blocked=true;});else M.trying=false;}
    return;}
  // quiet: held where it is once it has faded (at once while the page is hidden); let go if the story is left or the song is over
  if(hidden||now-M.offAt>=M.fade){if(!el.paused)el.pause();if(!M.on)musicDrop();}}
{const sh=S.hooks.story;S.hooks.story=(k,a)=>{sh(k,a);if(k==='stage'&&a&&a.key===STAGES[0].key)musicStart();else if(k==='quit')MUSIC.on=false;};}
// a browser lets sound start only from a press: a start it held back tries again at the next one
if(typeof window!=='undefined'&&window.addEventListener)for(const ev of ['click','keydown','touchend'])
  window.addEventListener(ev,()=>{if(MUSIC.blocked){MUSIC.blocked=false;musicSync();}},true);
if(typeof document!=='undefined'&&document.addEventListener)document.addEventListener('visibilitychange',()=>musicSync());

// ---------- every frame ----------
V11UI.screen.push(drawStoryScreen);
V11UI.world.push(storyDust);
// (each frame, drawn or not: the engine, the rails and the song follow the scene, and a chapter card that has faded out is done)
// the wind over the rise at sundown: a held voice, soft, rising and falling slowly, while the opening is on the outskirts (the sand that
// blows past his bike makes no sound of its own: the wind goes on just as it was)
let WIND=null;
function windVoice(){if(!AC||AC.state!=='running')return null;if(WIND)return WIND;
  const a=AC,n=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();n.buffer=noiseBuf;n.loop=true;f.type='bandpass';f.frequency.value=420;f.Q.value=.5;g.gain.value=0;
  n.connect(f);f.connect(g);g.connect(master);n.start();WIND={g,f,a};return WIND;}
function windFrame(){const on=!!S.story&&S.arenaKey==='outskirts'&&S.soundOn;if(!on){if(WIND)WIND.g.gain.setTargetAtTime(0,WIND.a.currentTime,.4);return;}
  const V=windVoice();if(!V)return;const t=V.a.currentTime,sw=.5+.5*Math.sin(S.t*.37)*Math.sin(S.t*.23+1);
  V.g.gain.setTargetAtTime((.025+.03*sw)*(1-.8*clamp(S.fade,0,1)),t,.5);V.f.frequency.setTargetAtTime(300+sw*260,t,.5);}
V11UI.tick.push(()=>{engineFrame();railFrame();windFrame();musicSync();const C=S.card;if(C&&C.out!=null&&S.t-C.out>.6)S.card=null;});
// the fall's junk is painted in pieces while it lasts; away from it, they are let go
V11UI.tick.push(()=>{if(S.arenaKey!=='fall'&&typeof EnvLook!=='undefined'&&EnvLook.S&&EnvLook.S.fall&&EnvLook.S.fall.free)EnvLook.S.fall.free();});
// the sand at sundown: a few grains blowing past his bike while he talks about the wire (sk_story.js, the opening), a fine gold run of
// it low along the road and up round the wheels, there for a second and gone. There is no sand on that road; it is in his head. It is
// meant to be missed the first time: small, quick and faint, and no sound. (Each grain's course comes from its number, so every frame
// draws the same flurry; the scene alone says when it is there.)
const SAND_N=64;
function sandHash(i){let n=(i*374761393+668265263)|0;n=Math.imul(n^(n>>>13),1274126177);n^=n>>>16;return(n>>>0)/4294967296;}
function storySand(){const A=S.story&&S.story.sand;if(!A||S.arenaKey!=='outskirts')return;const D=SUNDOWN.sand.dur,T=S.t-A.t0;if(T<0||T>D)return;
  const sp=reduceMotion?.45:1,env=Math.sin(Math.PI*T/D),gx=A.x-125+250*T*sp;ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
  // a breath of gold haze where the gust goes
  {const q=P(gx,GB-9,A.d-6),a=env*.07;ctx.save();ctx.translate(q.x,q.y);ctx.scale(1,.35);const g=ctx.createRadialGradient(0,0,0,0,0,48);
    g.addColorStop(0,`rgba(240,200,120,${a.toFixed(3)})`);g.addColorStop(1,'rgba(240,200,120,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,48,0,TAU);ctx.fill();ctx.restore();}
  // the grains: each on its own course, low along the road and up round the wheels, curling; seen only inside the gust as it passes
  for(let i=0;i<SAND_N;i++){const h=k=>sandHash(i*13+k),st=h(1)*D*.5,life=.4+h(2)*.45,u=T-st,v=u/life;if(v<0||v>1)continue;
    const vx=(210+h(3)*130)*sp,ph=u*8+h(8)*6,x=A.x-150+h(4)*70+vx*u+Math.sin(ph)*4,in_=Math.exp(-Math.pow((x-gx)/70,2));if(in_<.05)continue;
    const d=A.d-18+h(5)*26,y=GB-1.2-h(6)*h(6)*30-u*(8+h(7)*24)*sp+Math.cos(ph)*2.6*(.4+h(12)),q=P(x,y,d);
    const a=Math.min(1,Math.sin(Math.PI*v)*(.35+.65*in_)*(.6+.4*h(9))*(.8+.2*Math.sin(S.t*40+i))),len=1.6+h(10)*2.2;
    ctx.strokeStyle=`rgba(250,220,156,${a.toFixed(3)})`;ctx.lineWidth=.9+h(11)*.6;ctx.beginPath();ctx.moveTo(q.x-len,q.y+len*.1);ctx.lineTo(q.x,q.y);ctx.stroke();}
  // and a faint ribbon of it along the ground under the gust
  for(let j=0;j<2;j++){const a=env*(.1+.04*j);ctx.strokeStyle=`rgba(236,200,130,${a.toFixed(3)})`;ctx.lineWidth=.9;ctx.beginPath();const d=A.d-12+j*14;
    for(let k=0;k<=10;k++){const x=gx-50+k*10,q=P(x,GB-1.5-Math.sin(k*.75+T*7+j*2)*1.6-Math.max(0,k-4)*.7,d);k?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);}ctx.stroke();}
  ctx.restore();}
V11UI.world.push(storySand);
// dirt thrown up behind a bike's spinning back wheel
const ST_DUST=[];
function storyDust(){
  for(const B of S.veh){if(B.kind!=='bike'||!(B.dust>0))continue;const r=bikeAt(B,-60,2);
    for(let i=0;i<3;i++)ST_DUST.push({x:r.x-B.fa*(4+uiRand()*6),y:r.y-uiRand()*4,d:B.dep+(uiRand()-.5)*10,vx:-B.fa*(60+uiRand()*160),vy:-(40+uiRand()*120),age:0,life:.5+uiRand()*.6,r:2+uiRand()*4});}
  ctx.save();for(let i=ST_DUST.length-1;i>=0;i--){const p=ST_DUST[i];p.age+=1/60;if(p.age>p.life){ST_DUST.splice(i,1);continue;}p.x+=p.vx/60;p.y+=p.vy/60;p.vy+=260/60;p.vx*=.97;
    const q=P(p.x,Math.min(p.y,GB),p.d),u=p.age/p.life;ctx.fillStyle=`rgba(120,104,82,${(.5*(1-u)).toFixed(3)})`;ctx.beginPath();ctx.arc(q.x,q.y,p.r*(1+u*2),0,TAU);ctx.fill();}
  ctx.restore();}

// ---------- keys ----------
window.addEventListener('keydown',e=>{if(!S.story||typingIn(document.activeElement))return;
  if(e.key==='Escape'&&S.cut&&S.cut.skip){cutSkip();e.preventDefault();}
  else if((e.key===' '||e.key==='Enter')&&S.say){storyAdvance();e.preventDefault();}});

V11UI.init.push(()=>{storyMenuBuild();
  // the prologue is the game's front door; the lab is one click away
  const lab=typeof window!=='undefined'&&window.SK_TEST||typeof location!=='undefined'&&/[?&]lab\b/.test(location.search||'');storyMenu(!lab);});
// ===== STORY UI END =====
