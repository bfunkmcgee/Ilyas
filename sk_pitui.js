// ===== ACT I UI =====
// (loaded ahead of the main UI script; everything here runs only once the UI is up)
// Act I on the page: the people of the Pit drawn by the cast (CastLook), the things the scenes handle (the skillet, the soup, the
// arc-blade's hilt and its nine loose plates, the kitchen window's curtain), the moment the skillet does its work, and the Aether
// tab flickering once and going. Everything here reads the scenes' state (S.act1) and changes none of it.

// ---------- the people ----------
// Tamm and Dob are the cast's (CastLook.CAST[f.pitCast]); until a look of their own is there, a figure from the crews' wardrobe stands in
{const co=castOn;castOn=function(f){return co(f)||(!!f&&!!f.pitCast&&CastLook.ok&&!S.classicLook);};}
{const cs=castSpec;castSpec=function(f){if(f&&f.pitCast){const c=CastLook.CAST[f.pitCast];if(c)return c;
    if(!f._pitStand)f._pitStand=CastLook.crewSpec(f.pitCast==='Tamm'?'kitchen':'street',f.seed||7);return f._pitStand;}
  return cs(f);};}

// ---------- the things in the scenes ----------
// each stands among the floor's items by its depth, and only in its own room
{const ei=envItems;envItems=function(items){ei(items);const A=S.act1;if(!A||!act1On())return;const kit=S.arenaKey==='sumpkitchen',back=S.arenaKey==='backroom';
  if(A.skillet&&kit)items.push({d:(A.skillet.held?A.skillet.held.dep-.5:A.skillet.d),act1:'skillet'});
  if(A.soup&&back)items.push({d:A.soup.d-.4,act1:'soup'});
  if(A.hilt&&back)items.push({d:A.hilt==='shelf'?ACT1_PLACES.backroom.shelf.d-1:hero().dep-.6,act1:'hilt'});
  if(A.plates&&back)items.push({d:hero().dep-.7,act1:'plates'});
  if(A.blanket&&back&&hero().bedNow&&hero().bedNow.blk<3)items.push({d:(ACT1_PLACES.backroom.cot.d0+ACT1_PLACES.backroom.cot.d1)/2-.5,act1:'blanket'});
  if(S.arenaKey==='sumpkitchen'&&A.curtain)items.push({d:ACT1_PLACES.sumpkitchen.far-1,act1:'curtain'});};}
{const de=drawEnvItem;drawEnvItem=function(it){if(!it.act1)return de(it);ctx.save();try{ACT1_DRAW[it.act1]();}catch(e){}ctx.restore();return true;};}
const ACT1_DRAW={
  // a black iron skillet: on the stove, or in Tamm's hand. As it heats the iron goes red through, hottest at the heart of the pan, its
  // lip glowing, a red glow off it into the room and a shimmer of heat rising (and it throws its light: below)
  skillet(){const A=S.act1,Sk=A.skillet,K=skilletAt(Sk),q=P(K.hx,K.hy,K.d),c=P(K.x,K.y,K.d),h=clamp(Sk.heat||0,0,1),t=S.t;
    ctx.save();ctx.translate(q.x,q.y);ctx.rotate(K.ang);
    ctx.fillStyle='#16110f';ctx.fillRect(-1,-1.6,16,3.2);
    ctx.translate(26,0);ctx.fillStyle='#120e0d';ctx.beginPath();ctx.ellipse(0,0,12,4.4,0,0,TAU);ctx.fill();ctx.strokeStyle='#3a2e28';ctx.lineWidth=.9;ctx.stroke();
    if(h>.05){const k=h*skilletFlicker(t);ctx.globalCompositeOperation='lighter';
      // the iron red through: a wide dull red, a hotter orange-red at the heart
      ctx.save();ctx.scale(1,4.4/12);const g=ctx.createRadialGradient(0,0,0,0,0,12);
      g.addColorStop(0,`rgba(255,${Math.round(70+60*h)},34,${(.9*k).toFixed(3)})`);g.addColorStop(.5,`rgba(228,36,14,${(.7*k).toFixed(3)})`);g.addColorStop(1,`rgba(160,18,8,${(.35*k).toFixed(3)})`);
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,12,0,TAU);ctx.fill();ctx.restore();
      // the lip
      ctx.strokeStyle=`rgba(255,74,34,${(.8*k).toFixed(3)})`;ctx.lineWidth=1.1;ctx.beginPath();ctx.ellipse(0,0,12,4.4,0,0,TAU);ctx.stroke();}
    ctx.restore();
    if(h>.05){const k=h*skilletFlicker(t);ctx.globalCompositeOperation='lighter';
      // the glow off it, wider than it is tall
      ctx.save();ctx.translate(c.x,c.y);ctx.scale(1,.7);const R=40,b=ctx.createRadialGradient(0,0,0,0,0,R);
      b.addColorStop(0,`rgba(255,64,26,${(.58*k).toFixed(3)})`);b.addColorStop(.3,`rgba(235,34,14,${(.26*k).toFixed(3)})`);b.addColorStop(1,'rgba(200,20,10,0)');
      ctx.fillStyle=b;ctx.beginPath();ctx.arc(0,0,R,0,TAU);ctx.fill();ctx.restore();
      // heat rising off it, wavering as it goes
      if(h>.4){ctx.lineWidth=1.1;ctx.lineCap='round';for(let i=0;i<3;i++){const u=(t*.55+i/3)%1,a=.22*(h-.4)/.6*Math.sin(Math.PI*u),x0=c.x+(i-1)*5,y0=c.y-3-u*26;
        ctx.strokeStyle=`rgba(255,150,110,${a.toFixed(3)})`;ctx.beginPath();ctx.moveTo(x0+Math.sin(t*3+i*2)*2,y0+6);ctx.quadraticCurveTo(x0+Math.sin(t*3.4+i)*4,y0,x0+Math.sin(t*2.6+i*3)*2,y0-6);ctx.stroke();}}}},
  // a bowl of soup on the stool, steam off it while it is hot
  soup(){const A=S.act1,q=P(A.soup.x,GB-30,A.soup.d);ctx.translate(q.x,q.y);
    ctx.fillStyle='#3a2a20';ctx.beginPath();ctx.moveTo(-8,-1);ctx.quadraticCurveTo(0,9,8,-1);ctx.closePath();ctx.fill();ctx.fillStyle='#8a6a3a';ctx.beginPath();ctx.ellipse(0,-1,8,2,0,0,TAU);ctx.fill();
    if(A.soup.full){ctx.fillStyle='#c79a52';ctx.beginPath();ctx.ellipse(0,-1,6.6,1.5,0,0,TAU);ctx.fill();
      ctx.strokeStyle='rgba(230,226,214,.22)';ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<3;i++){const t=(S.t*.6+i/3)%1,yy=-3-t*16,xx=(i-1)*3+Math.sin(S.t*2+i)*2;ctx.moveTo(xx,yy);ctx.quadraticCurveTo(xx+3,yy-3,xx,yy-6);}ctx.stroke();}},
  // the arc-blade's hilt: on the shelf among the jars, in his hand, or in his lap with its plates spilled
  hilt(){const A=S.act1,K=hero(),R=ACT1_PLACES.backroom,sn=act1Seen(K);let x,y,ang;
    if(A.hilt==='shelf'){const q=P((R.shelf.x0+R.shelf.x1)/2,GB-R.shelf.y-3,R.shelf.d);x=q.x;y=q.y;ang=0;}
    else if(A.hilt==='hand'){const h=sn?sn.haf:K.p[HAF],q=P(h.x,h.y,K.dep);x=q.x;y=q.y;ang=K.facing>0?-.5:Math.PI+.5;}
    else{const p=sn?sn.pel:K.p[PEL],q=P(p.x+K.facing*8,p.y-4,K.dep);x=q.x;y=q.y;ang=K.facing>0?.12:Math.PI-.12;}
    ctx.translate(x,y);ctx.rotate(ang);ctx.fillStyle='#14161c';ctx.fillRect(-2,-2.3,18,4.6);ctx.fillStyle='#2b3140';ctx.fillRect(-2,-2.3,18,1.2);
    ctx.fillStyle='#8a6a2e';for(const bx of [1,7,13])ctx.fillRect(bx,-2.3,1.1,4.6);ctx.fillStyle='#0b0c10';ctx.fillRect(16,-1.4,3,2.8);},
  // the nine plates: out of the hilt with a flick, into his lap, a bounce, and still
  plates(){const A=S.act1,K=hero(),u=S.t-A.plates.t0,sn=act1Seen(K),p=sn?sn.pel:K.p[PEL],h=sn?sn.haf:K.p[HAF],R=mulberry32(91);
    for(let i=0;i<9;i++){const dl=i*.045,t=clamp(u-dl,0,2);if(u<dl)continue;const fall=clamp(t/.38,0,1),
      x0=h.x,y0=h.y,x1=p.x+K.facing*(-6+i*2.6)+(R()-.5)*3,y1=p.y-5+R()*2,b=t>.38&&t<.6?Math.sin((t-.38)/.22*Math.PI)*3*(1-i/12):0;
      const x=lerp(x0,x1,fall),y=lerp(y0,y1,fall)-Math.sin(fall*Math.PI)*10-b,a=(R()-.5)*1.4+(1-fall)*t*12,q=P(x,y,K.dep);
      ctx.save();ctx.translate(q.x,q.y);ctx.rotate(a);ctx.fillStyle='#1c2230';ctx.beginPath();ctx.moveTo(-4,-1.2);ctx.lineTo(4,-1.6);ctx.lineTo(4.4,1.2);ctx.lineTo(-4.2,1.5);ctx.closePath();ctx.fill();
      ctx.strokeStyle='rgba(150,170,210,.55)';ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(-4,-1.2);ctx.lineTo(4,-1.6);ctx.stroke();
      ctx.fillStyle='#9c7428';ctx.fillRect(-4.2,-.2,8.6,.5);ctx.restore();}},
  // the cot's blanket over him while he lies there: up to his chest, over his hips and legs and tented on his toes, its near side down
  // over the front of the cot; as he sits up it comes down to his lap, and as his legs come out from under it, it lies back on the
  // cot and goes into the blanket the room already has there (blk, from his pose: 0 to 3)
  blanket(){const K=hero(),N=K.bedNow,C=ACT1_PLACES.backroom.cot,blk=N.blk,p=K.p,dR=(C.d0+C.d1)/2,MT=GB-C.top-1,lg=C.top-10;
    const mx=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t}),u0=Math.atan2(p[CHE].y-p[PEL].y,p[CHE].x-p[PEL].x),nx=-Math.sin(u0),ny=Math.cos(u0),
      off=(q,k)=>({x:q.x+nx*k,y:q.y+ny*k}),up=(q,k)=>({x:q.x,y:q.y-k});
    // where it lies along him, up to the chest (0) or the lap (1), and flat on the cot (2)
    const ch=off(mx(p[CHE],p[PEL],.22),9.5),lap=off(p[PEL],7),fF=p[FTF],kF=p[KNF],x9=Math.min(C.x1-6,fF.x+16);
    const along=[mx(ch,lap,clamp(blk,0,1)),off(mx(p[CHE],p[PEL],.7),9.5),off(p[PEL],9),up(kF,6.5),up(mx(kF,fF,.5),6),up(fF,9),{x:fF.x+8,y:fF.y-3},{x:x9,y:MT-1}];
    if(blk<1)along[1]=mx(along[1],off(p[PEL],9),blk);else along[1]=off(p[PEL],9);
    const fl=clamp(blk-1,0,1),flat=along.map((q,i)=>({x:i?Math.max(q.x,C.x0+110+i*4):C.x0+108,y:MT-2-Math.sin(i*1.7)*1.6})),top=along.map((q,i)=>mx(q,flat[i],fl));
    const T=top.map(q=>P(q.x,q.y,dR)),back=top.map(q=>P(q.x,MT,C.d1-3)),TT=T.map((q,i)=>({x:q.x,y:Math.min(q.y,back[i].y)}));
    const hang=top.map((q,i)=>P(q.x+(i===top.length-1?-2:0),GB-(lg-6-Math.abs(Math.sin(i*1.3+.4))*7),C.d0-2)),ed=top.map(q=>P(q.x,MT,C.d0+2));
    ctx.globalAlpha=clamp(3-blk,0,1);
    // the top over him, the near side down to the edge of the cot, and the fall of it over the front
    ctx.fillStyle='#3e3b38';ctx.beginPath();ctx.moveTo(TT[0].x,TT[0].y);for(const q of TT)ctx.lineTo(q.x,q.y);for(let i=ed.length-1;i>=0;i--)ctx.lineTo(ed[i].x,ed[i].y);ctx.closePath();ctx.fill();
    ctx.fillStyle='#34312f';ctx.beginPath();ctx.moveTo(ed[0].x,ed[0].y);for(const q of ed)ctx.lineTo(q.x,q.y);for(let i=hang.length-1;i>=0;i--)ctx.lineTo(hang[i].x,hang[i].y);ctx.closePath();ctx.fill();
    // (its shape over him: the side toward the room a shade darker from the line of his body down, the light along that line)
    if(fl<1){ctx.fillStyle='rgba(20,18,16,.22)';ctx.beginPath();ctx.moveTo(T[0].x,T[0].y);for(const q of T)ctx.lineTo(q.x,q.y);for(let i=ed.length-1;i>=0;i--)ctx.lineTo(ed[i].x,ed[i].y);ctx.closePath();ctx.fill();
      ctx.strokeStyle=`rgba(230,224,212,${(.16*(1-fl)).toFixed(3)})`;ctx.lineWidth=1.2;ctx.lineJoin='round';ctx.beginPath();T.slice(0,-1).forEach((q,i)=>i?ctx.lineTo(q.x,q.y+.4):ctx.moveTo(q.x,q.y+.4));ctx.stroke();}
    // its stripe near the end (where the room's blanket has its own), the folds down its front, the light along the top of it
    {const a=P(C.x1-28,MT-4,dR),b=P(C.x1-22,MT-4,dR),e=P(C.x1-20,GB-lg+8,C.d0-2),f=P(C.x1-26,GB-lg+8,C.d0-2);if(TT[TT.length-1].x>a.x){ctx.fillStyle='rgba(90,36,32,.7)';ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(e.x,e.y);ctx.lineTo(f.x,f.y);ctx.closePath();ctx.fill();}}
    ctx.strokeStyle='rgba(26,24,22,.55)';ctx.lineWidth=1.3;ctx.beginPath();for(let i=1;i<TT.length-1;i+=2){const t=ed[i],h=hang[i];ctx.moveTo(t.x+1,t.y+1);ctx.quadraticCurveTo(t.x+4,(t.y+h.y)/2,h.x+1,h.y-2);}ctx.stroke();
    ctx.strokeStyle='rgba(216,212,204,.14)';ctx.lineWidth=1;ctx.beginPath();TT.forEach((q,i)=>i?ctx.lineTo(q.x,q.y+.6):ctx.moveTo(q.x,q.y+.6));ctx.stroke();
    ctx.globalAlpha=1;},
  // the curtain Tamm draws across the kitchen window
  curtain(){const R=ACT1_PLACES.sumpkitchen,W0=R.window,A=S.act1,u=clamp(A.curtain,0,1),d=R.far-2,x0=W0.x0-4,x1=lerp(W0.x0-4,W0.x1+4,u),
      a=P(x0,GB-W0.y0-4,d),b=P(x1,GB-W0.y1+4,d);
    ctx.fillStyle='#3a2a1e';ctx.fillRect(a.x,b.y,b.x-a.x,a.y-b.y);ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1;ctx.beginPath();for(let x=a.x+4;x<b.x;x+=6){ctx.moveTo(x,b.y);ctx.lineTo(x,a.y);}ctx.stroke();}};

// where his hand and his hips were drawn this frame, while the scene has him turned toward the room (else his own joints are where
// they are drawn)
function act1Seen(K){const N=K&&K.bedNow;if(!N||Math.abs(N.yaw||0)<.01||typeof KaelLook==='undefined'||!KaelLook.seen)return null;const s=KaelLook.seen.get(K);return s&&s.turned?s:null;}
// ---------- turned toward the room ----------
// posed by the scene and turned toward the viewer (f.bedNow.yaw, sk_pit.js): drawn at that turn, his head with it, his hands and feet
// out at his sides as they are when he faces the viewer
// (seen from above as the room is, a knee out toward the viewer is a little lower than the hip it comes from: the thighs show as he
// sits facing the room, the hand on the knee with it; his feet stay on the floor)
{const dfi=drawFighterItem;drawFighterItem=function(f,trails){const N=f&&f.bed&&f.bedNow;if(!N||Math.abs(N.yaw||0)<.01)return dfi.apply(this,arguments);
  const p0=f.p,w=Math.abs(Math.sin(N.yaw)),px=p0[PEL].x,dn=x=>clamp((x-px)*.75,0,16)*w,P=p0.map(q=>({x:q.x,y:q.y,px:q.px,py:q.py}));
  for(const i of [KNF,KNB]){const d=dn(p0[i].x);P[i].y+=d;P[i].py+=d;}
  for(const i of [ELF,HAF,TIP]){const d=dn(p0[i].x)*clamp((p0[i].y-p0[CHE].y)/30,0,1);P[i].y+=d;P[i].py+=d;}
  // (sitting, his knees apart and his feet less so)
  const sit=clamp((p0[KNF].x-px-12)/18,0,1)*w;
  f.p=P;f._yaw=N.yaw;f._headYaw=N.hy;f._latArm=1;f._latLeg=1;f._latKnee=1+1.1*sit;f._latFoot=1+.55*sit;
  try{drawFighter(f);}finally{f.p=p0;f._yaw=0;f._headYaw=undefined;f._latArm=undefined;f._latLeg=undefined;f._latKnee=undefined;f._latFoot=undefined;}};}

// ---------- the skillet's heat ----------
// where its pan is (world x, y at its depth; hx, hy the handle's end, ang the way the handle points): on the stove, or a handle's
// length past Tamm's hand
function skilletAt(Sk){const T=Sk.held;
  if(T){const p=T.p[HAF],ang=T.facing>0?-.15:Math.PI+.15;return{hx:p.x,hy:p.y,d:T.dep,ang,x:p.x+26*Math.cos(ang),y:p.y+26*Math.sin(ang)};}
  return{hx:Sk.x,hy:GB-58,d:Sk.d,ang:Math.PI,x:Sk.x-26,y:GB-58};}
// hot iron breathes a little
function skilletFlicker(t){return .9+.06*Math.sin(t*4.7)+.04*Math.sin(t*11.3+1);}
// its light: red on what is near it (Tamm's hand, him on the table, the table top under it); less while it sits on the stove
if(typeof FXL!=='undefined'&&FXL.lights)FXL.lights.push(add=>{const A=S.act1,Sk=A&&A.skillet;if(!Sk||!act1On()||S.arenaKey!=='sumpkitchen')return;
  const h=clamp(Sk.heat||0,0,1);if(h<.05)return;const K=skilletAt(Sk);add(K.x,K.y,K.d,'#ff3a1c',(Sk.held?.6:.35)*h*skilletFlicker(S.t),130);});

// ---------- the skillet's work ----------
// a white flash, the hiss, and steam off the shoulder (with gore off, only the flash)
V11UI.world.push(()=>{const A=S.act1;if(!A||!A.sear||!act1On())return;const u=S.t-A.sear.t0;if(u<0||u>2.4||S.gore==='off')return;const K=hero(),c=K.p[CHE],q=P(c.x,c.y,K.dep);
  ctx.save();ctx.strokeStyle=`rgba(232,228,218,${(.4*(1-u/2.4)).toFixed(3)})`;ctx.lineWidth=2.4;ctx.lineCap='round';ctx.beginPath();
  for(let i=0;i<5;i++){const t=(u*.9+i*.17)%1,yy=q.y-6-t*40,xx=q.x+(i-2)*4+Math.sin(u*3+i)*5;ctx.moveTo(xx,yy);ctx.quadraticCurveTo(xx+5,yy-6,xx,yy-12);}ctx.stroke();ctx.restore();});
V11UI.screen.push(()=>{const A=S.act1;if(!A||!A.sear||!act1On())return;const u=S.t-A.sear.t0;if(u<0||u>.5)return;
  ctx.fillStyle=`rgba(255,246,226,${(.85*(1-u/.5)).toFixed(3)})`;ctx.fillRect(0,0,cv.width,cv.height);});

// ---------- the scene's camera, looking up ----------
// A scene that sets S.camCut.band ({top, foot}: world y, as drawn) keeps that much of the picture in view, instead of the floor at
// the picture's foot: centred between the letterbox's bars (or the HUD's edges) where it fits, its top just under the top bar where
// it does not (the kitchen's window over the table). C.bandN, where a scene gives one, is the band on a narrow screen (a phone held
// upright has height to spare: the opening's sundown fills it from the sky's top to the world's foot).
{const ct=camTarget;camTarget=function(){const C=S.camCut,B=C&&(cssW<640&&C.bandN?C.bandN:C.band);if(!B)return ct();
  const s=cssW/Math.max(1,cam.viewW),bar=S.letter?cssH*.105:0,t=Math.max(HUD_IN.top,bar),b=Math.max(HUD_IN.bottom,bar),free=Math.max(40,cssH-t-b);
  return(B.foot-B.top)*s<=free?(B.top+B.foot)/2-(t+free/2)/s:B.top-t/s;};}

// ---------- the Pit's sounds ----------
// the skillet's hiss, the fizzle of the gilt that does not answer, the nine plates in his lap, the pump, Tamm's pin, the purse
V11UI.init.push(()=>{const sd=S.hooks.sound;S.hooks.sound=(k,v)=>{
  if(!S.soundOn||typeof AC==='undefined'||!AC||AC.state!=='running')return sd(k,v);
  try{
    if(k==='sizzle'){nz(1.8,'highpass',4200,2600,.6,.36);nz(.6,'bandpass',800,500,1.2,.22);}
    else if(k==='fizzle'){tone(.4,'sine',1500,240,.05);nz(.35,'highpass',5200,3000,1,.1);}
    else if(k==='plates'){for(let i=0;i<9;i++)setTimeout(()=>{try{const f=1700+uiRand()*900;tone(.07,'triangle',f,f*.96,.06);}catch(e){}},i*45+uiRand()*20);}
    else if(k==='pump'){tone(.25,'sawtooth',120,95,.05);setTimeout(()=>{try{nz(.45,'lowpass',900,500,.8,.22);}catch(e){}},180);}
    else if(k==='pin'){tone(.05,'triangle',3200,2800,.05);}
    else if(k==='purse'){for(let i=0;i<4;i++)setTimeout(()=>{try{tone(.06,'triangle',2600+uiRand()*700,2400,.05);}catch(e){}},i*60);}
    else sd(k,v);}catch(e){}};});

// ---------- the Aether tab, once ----------
// When he reaches for the gilt on waking, the Aether tab shows in the dock's place, flickers, and goes.
const ACT1_UI={};
V11UI.init.push(()=>{const W=storyStageWrap();if(!W)return;const t=stEl('div','a1-flick');t.id='a1Flick';t.hidden=true;
  t.innerHTML='<span class="a1-flick-t">Aether</span><span class="a1-flick-p">◇◇◇◇◇</span>';W.appendChild(t);ACT1_UI.flick=t;});
V11UI.tick.push(()=>{const t=ACT1_UI.flick;if(!t)return;const A=S.act1,F=A&&act1On()&&A.flicker;const u=F?S.t-F.t0:-1,on=u>=0&&u<1.6;
  if(t.hidden===on)t.hidden=!on;if(!on)return;
  // on, a stutter, half on, and out
  const v=u<.25?u/.25:u<.5?(Math.sin(u*60)>0?1:.15):u<1?.55+.2*Math.sin(u*40):Math.max(0,1-(u-1)/.6)*.4;t.style.opacity=v.toFixed(2);});
// ===== ACT I UI END =====
