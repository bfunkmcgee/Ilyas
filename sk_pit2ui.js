// ===== ACT I, SCENES 3 AND 4 UI =====
// (loaded ahead of the main UI script; everything here runs only once the UI is up)
// The gear screen (scene 3): what he takes from Tamm's crate, slot by slot, with him drawn in it as it is chosen, and the right arm's
// slot hatched and marked Missing. The things the scenes handle: the crate, the bucket (on the floor, in his hand, under the pump's
// spout, the water rising in it and running from the spout). Everything here reads the game and changes nothing it reads; the gear
// screen's buttons call the game's own act1GearStep and act1GearDone.

// ---------- the gear screen ----------
const A1G={};
V11UI.init.push(()=>{const W=storyStageWrap();if(!W)return;
  const g=stEl('div','a1-gear');g.id='a1Gear';g.hidden=true;g.setAttribute('role','dialog');g.setAttribute('aria-label','Lost property');
  const rows=KIT_SLOTS.map(s=>`<li class="a1-slot" data-slot="${s}"><span class="a1-slot-k">${KIT_NAMES[s]}</span>`+
    `<button type="button" class="a1-step" data-d="-1" aria-label="Previous ${KIT_NAMES[s].toLowerCase()}">&#8249;</button><span class="a1-slot-v"></span>`+
    `<button type="button" class="a1-step" data-d="1" aria-label="Next ${KIT_NAMES[s].toLowerCase()}">&#8250;</button><span class="a1-slot-w"></span></li>`).join('');
  // (the right arm's slot: an arm's outline, hatched, and nothing in it)
  const hatch='<svg class="a1-hatch" viewBox="0 0 40 64" aria-hidden="true"><defs><pattern id="a1h" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">'+
    '<line x1="0" y1="0" x2="0" y2="5" stroke="#8a6a2e" stroke-width="1.4"/></pattern></defs>'+
    '<path d="M14 3 C24 1 31 6 30 15 L28 34 C30 40 29 46 27 52 C26 58 23 62 18 62 C13 62 11 58 12 53 L14 36 C10 30 9 22 10 14 C10 8 11 4 14 3 Z" fill="url(#a1h)" stroke="#8a6a2e" stroke-width="1.4" stroke-dasharray="3 2"/></svg>';
  g.innerHTML='<div class="a1-gear-in"><p class="st-kick">Lost property</p><h2 class="a1-gear-t">The crate</h2>'+
    '<div class="a1-gear-body"><canvas class="a1-gear-fig" id="a1GearFig" width="300" height="320" aria-hidden="true"></canvas>'+
    '<ul class="a1-slots">'+rows+`<li class="a1-slot a1-missing"><span class="a1-slot-k">Right arm</span>${hatch}<span class="a1-slot-v">Missing</span></li></ul></div>`+
    '<div class="st-btns"><button type="button" class="st-btn st-go" id="a1GearDone">Wear these</button></div></div>';
  W.appendChild(g);A1G.el=g;A1G.fig=g.querySelector('#a1GearFig');
  g.addEventListener('click',e=>{const b=e.target.closest('.a1-step');if(b){const s=b.closest('.a1-slot').dataset.slot;act1GearStep(s,+b.dataset.d);a1GearFill(true);return;}
    if(e.target.id==='a1GearDone')act1GearDone();});
  // keys: left and right change the slot that has the focus; Enter on the button wears them
  g.addEventListener('keydown',e=>{const li=e.target.closest&&e.target.closest('.a1-slot');if(!li||!li.dataset.slot)return;
    if(e.key==='ArrowLeft'||e.key==='ArrowRight'){act1GearStep(li.dataset.slot,e.key==='ArrowLeft'?-1:1);a1GearFill(true);e.preventDefault();}});});
// the slots' names and words, and him drawn in what is chosen
function a1GearFill(redraw){const G=S.act1&&S.act1.gear;if(!G||!A1G.el)return;
  for(const li of A1G.el.querySelectorAll('.a1-slot[data-slot]')){const s=li.dataset.slot,it=kitItem(s,G.kit[s]);
    li.querySelector('.a1-slot-v').textContent=it.name;li.querySelector('.a1-slot-w').textContent=it.what;}
  if(redraw)a1GearFig(G);}
// him, standing easy in what the screen has chosen, three times over, all at one size on one floor: in profile as the game shows him
// (his right side toward the viewer, the empty sleeve or the dressed stump), turned to face the viewer (yaw near 3π/2: his right on
// the viewer's left), and in profile from his other side (yaw π: the arm he has toward the viewer). One pose seen three ways
// (a1StandFront, from a copy of him as he stands now), drawn close up. The menu's Gear section draws him the same way (a1FigDraw)
const A1G_VIEWS=[{yaw:0},{front:true},{yaw:Math.PI}];
// how he stands to be seen from the front: his weight on his left foot, the right one set out to the side and a little forward with
// the knee easy, his trunk a touch back and his head a touch down; turned a little, his arm toward the viewer, his head turned back a
// little toward the viewer. His arm hangs easy, out from his side (latArm: the hand and elbow drawn further out than the shoulder),
// the elbow a little bent and the hand open by his thigh (reach: how far toward the hand's full reach it goes, fwd: how far in front of
// his chest)
const A1G_FRONT={yaw:1.5*Math.PI-.24,hy:1.5*Math.PI-.08,latFootN:1.7,latKneeN:1.22,latFootF:.9,latKneeF:.95,latArm:2.1,reach:.97,fwd:3};
function a1StandFront(F,K){const b=K.body,p=F.p,ft=Math.max(p[FTF].y,p[FTB].y),cx=(p[PEL].x+p[CHE].x)/2,U=-Math.PI/2,P=V2(cx-2,ft-b.th-b.sh+1.2),aT=U-.04;
  const Ch=V2(P.x+Math.cos(aT)*b.torso,P.y+Math.sin(aT)*b.torso),R=b.ua+b.fa;
  const J=poseJoints(b,{P,aT,aN:U+.08,h:V2(Ch.x+A1G_FRONT.fwd,Ch.y+R*A1G_FRONT.reach),eb:V2(-1,.1),fF:V2(P.x+9,ft),fB:V2(P.x-1,ft),kbF:V2(1,-.5),kbB:V2(1,-.2)});
  // (the scarf's end hangs still down his back from where his neck now is, whatever it was doing as he stood)
  const s0=F.scarf||[],sc=[];if(s0.length>1){sc.push(V2(s0[0].x+J[CHE].x-p[CHE].x,s0[0].y+J[CHE].y-p[CHE].y));
    for(let i=1;i<s0.length;i++){const L=Math.hypot(s0[i].x-s0[i-1].x,s0[i].y-s0[i-1].y),q=sc[i-1];sc.push(V2(q.x-F.facing*L*.2,q.y+L*.98));}}
  return Object.assign({},F,{p:J.map(q=>({x:q.x,y:q.y})),scarf:sc.length?sc:s0,openHand:true});}
// the look's options for a view
function a1GearOpt(v,measure){const o={dir:{x:.45,y:-1},now:S.t,lodMin:1};if(measure)o.measure=true;
  if(v.front){const A=A1G_FRONT;return Object.assign(o,{yaw:A.yaw,headYaw:A.hy,latArm:A.latArm,latFootN:A.latFootN,latKneeN:A.latKneeN,latFootF:A.latFootF,latKneeF:A.latKneeF});}
  return Object.assign(o,{yaw:v.yaw,headYaw:v.yaw});}
function a1GearFig(G){a1FigDraw(A1G.fig,G.wear);}
// him in wear on canvas cv, three ways (the canvas sized to where the page has put it)
function a1FigDraw(cv,wear){const K=hero();if(!cv||!K||!KaelLook.ok)return;const dpr=Math.min(2,window.devicePixelRatio||1),r=cv.getBoundingClientRect(),w=Math.max(160,Math.round(r.width||300)),h=Math.max(150,Math.round(r.height||320));
  if(cv.width!==w*dpr||cv.height!==h*dpr){cv.width=w*dpr;cv.height=h*dpr;}
  const c=cv.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv.width,cv.height);
  const bg=c.createLinearGradient(0,0,0,cv.height);bg.addColorStop(0,'#14110f');bg.addColorStop(1,'#07060a');c.fillStyle=bg;c.fillRect(0,0,cv.width,cv.height);
  const F=KaelLook.snap(K,{wear,oneArm:true,t:S.t}),FF=a1StandFront(F,K),m=F.facing<0?-1:1;
  // (each view measured first: drawn small on a canvas of its own, round the middle of his hips on his floor, and where its pixels
  // fall read back, so the three stand side by side as close as they can, however each is turned and whatever he wears)
  const Q=2,MW=200,MH=210,FLY=.86,mc=A1G.mc||(A1G.mc=document.createElement('canvas'));if(mc.width!==MW*Q){mc.width=MW*Q;mc.height=MH*Q;}
  const g=mc.getContext('2d',{willReadFrequently:true}),views=A1G_VIEWS.map(v=>{const Fv=FF,mid=(Fv.p[PEL].x+Fv.p[CHE].x)/2,fl=Math.max(Fv.p[FTF].y,Fv.p[FTB].y)+3;
    g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,mc.width,mc.height);g.setTransform(Q*m,0,0,Q,mc.width/2-m*mid*Q,mc.height*FLY-fl*Q);
    try{KaelLook.draw(g,Fv,a1GearOpt(v,true));}catch(e){}
    const d=g.getImageData(0,0,mc.width,mc.height).data;let x0=1e9,x1=-1e9,y0=1e9;
    for(let y=0;y<mc.height;y+=2)for(let x=0;x<mc.width;x+=2)if(d[(y*mc.width+x)*4+3]>90){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;}
    if(x1<x0){x0=mc.width/2-60;x1=mc.width/2+60;y0=0;}
    return{v,Fv,mid,fl,x0:(x0-mc.width/2)/Q,x1:(x1-mc.width/2)/Q,top:(mc.height*FLY-y0)/Q};});
  // laid out side by side with a gap between, the tallest fitting the height and the row the width, on one floor near the bottom
  const gap=16,sumW=views.reduce((a,V)=>a+V.x1-V.x0,0)+gap*(views.length-1),tall=Math.max(...views.map(V=>V.top)),floorY=cv.height*.93;
  const s=Math.min(cv.width*.94/sumW,floorY*.95/tall);let left=(cv.width-sumW*s)/2;
  for(const V of views){const X0=left-V.x0*s,mx=X0;
    // the floor he stands on, a shadow under him
    c.setTransform(1,0,0,1,0,0);c.fillStyle='rgba(0,0,0,.5)';c.beginPath();c.ellipse(mx,floorY,(V.x1-V.x0)*s*.42,cv.height*.025,0,0,Math.PI*2);c.fill();
    c.setTransform(s*m,0,0,s,X0-m*V.mid*s,floorY-V.fl*s);
    // (a portrait, however small the screen makes it: drawn with its close-up detail)
    try{KaelLook.draw(c,V.Fv,a1GearOpt(V.v));}catch(e){}
    left+=(V.x1-V.x0+gap)*s;}
  c.setTransform(1,0,0,1,0,0);}
V11UI.tick.push(()=>{const g=A1G.el;if(!g)return;const G=S.act1&&act1On()&&S.act1.gear,on=!!G&&G.open;
  if(g.hidden===on){g.hidden=!on;if(on){A1G.shown=G;a1GearFill(true);const b=g.querySelector('.a1-step');if(b&&!EX_UI.touch)b.focus({preventScroll:true});}}
  else if(on&&A1G.shown!==G){A1G.shown=G;a1GearFill(true);}});

// ---------- the things in the scenes ----------
{const ei=envItems;envItems=function(items){ei(items);const A=S.act1;if(!A||!act1On())return;
  if(A.crate&&A.crate.on&&!A.crate.held&&S.arenaKey==='backroom')items.push({d:A.crate.d,act1b:'crate'});
  if(S.arenaKey==='yard'&&A.bucket){const it=a1Bucket();if(it)items.push({d:it.d-.3,act1b:'bucket',at:it});}};}
{const de=drawEnvItem;drawEnvItem=function(it){if(!it.act1b)return de(it);ctx.save();try{A1_DRAW[it.act1b](it);}catch(e){}ctx.restore();return true;};}
// where the bucket is: in his hand, set down somewhere on the floor, under the spout, or where it started; full or not
function a1Bucket(){const A=S.act1,B=A.bucket,E=S.ex,K=hero(),Y=ACT1_PLACES.yard;
  const held=E&&E.hand&&(E.hand.id==='bucket'||E.hand.id==='water');
  if(held){const h=K.p[HAF];return{hand:true,x:h.x,y:h.y,d:K.dep,full:E.hand.id==='water',fill:E.hand.id==='water'?1:0};}
  const fl=E&&E.spots.find(s=>s.floor&&!s.gone&&s.take&&(s.take.id==='bucket'||s.take.id==='water'));
  if(fl)return{x:fl.x,y:S.arena.ground(fl.x,fl.z),d:fl.z,full:fl.take.id==='water',fill:fl.take.id==='water'?1:0};
  if(B.where==='spout')return{x:Y.pump.x+12,y:GB,d:Y.pump.d-8,spout:true,fill:B.fill||0};
  if(B.where==='floor')return{x:B.x,y:GB,d:B.d,fill:0};
  return null;}
// the crate Tamm carries in: rough boards, and the cloth of thirty years spilling over its edge. (x, y): the middle of its bottom edge
// on the canvas
function a1CrateArt(c,x,y){const x0=x-22,x1=x+22,y1=y-30;
  c.fillStyle='#3a2c20';c.fillRect(x0,y1,x1-x0,y-y1);c.fillStyle='#4a3828';c.beginPath();c.moveTo(x0,y1);c.lineTo(x0+8,y1-6);c.lineTo(x1+8,y1-6);c.lineTo(x1,y1);c.closePath();c.fill();
  c.strokeStyle='rgba(0,0,0,.5)';c.lineWidth=1;for(let i=1;i<3;i++){const yy=y1+(y-y1)*i/3;c.beginPath();c.moveTo(x0,yy);c.lineTo(x1,yy);c.stroke();}
  c.strokeRect(x0,y1,x1-x0,y-y1);
  // cloth hanging over the front edge
  for(const [dx,w,hh,col] of [[-14,9,12,'#4a463d'],[-3,8,8,'#1c1d24'],[6,10,14,'#7c3b1f'],[14,6,7,'#2f2a1f']]){c.fillStyle=col;c.beginPath();
    const xa=x+dx-w/2;c.moveTo(xa,y1);c.lineTo(xa+w,y1);c.lineTo(xa+w-1,y1+hh);c.quadraticCurveTo(xa+w/2,y1+hh+3,xa+1,y1+hh);c.closePath();c.fill();}}
// in her arms it is drawn with her, over her body and under her near arm (CastLook's afterTorso), where the scene has it (in her depth)
{const cd=CastLook.draw;CastLook.draw=function(c,F,spec,o){const C=S.act1&&S.act1.crate;
  if(C&&C.held&&C.held===F&&C.at&&act1On()){const at=o&&o.afterTorso;o=Object.assign({},o,{afterTorso:f=>{if(at)at(f);const b=C.at();c.save();a1CrateArt(c,b.x,b.y);c.restore();}});}
  return cd.call(this,c,F,spec,o);};}
const A1_DRAW={
  crate(){const C=S.act1.crate,q=P(C.x,GB,C.d);a1CrateArt(ctx,q.x,q.y);},
  // the bucket: wood staves and iron hoops, the bail over it; the water in it, and running from the spout while he pumps
  bucket(it){const b=it.at,q=P(b.x,b.y,b.d),A=S.act1;let x=q.x,y=q.y;
    // (in the hand it hangs from the bail under the fist)
    if(b.hand)y+=14;
    const w=9,h=11;ctx.fillStyle='#3d2e22';ctx.beginPath();ctx.moveTo(x-w,y-h);ctx.lineTo(x+w,y-h);ctx.lineTo(x+w*.8,y);ctx.lineTo(x-w*.8,y);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#5c5650';ctx.lineWidth=1.2;for(const t of [.25,.75]){const yy=y-h*(1-t),ww=w*(1-.2*t);ctx.beginPath();ctx.moveTo(x-ww,yy);ctx.lineTo(x+ww,yy);ctx.stroke();}
    ctx.fillStyle='#2a2018';ctx.beginPath();ctx.ellipse(x,y-h,w,2.4,0,0,Math.PI*2);ctx.fill();
    if(b.fill>0){ctx.fillStyle='rgba(120,150,160,.85)';const yy=y-h+1+(1-b.fill)*6,sl=b.hand?Math.sin(S.t*7)*.8:0;ctx.beginPath();ctx.ellipse(x,yy+sl,w*.86,1.9,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='rgba(230,240,245,.35)';ctx.beginPath();ctx.ellipse(x-2,yy-.4+sl,w*.4,.7,0,0,Math.PI*2);ctx.fill();}
    ctx.strokeStyle='#6a645c';ctx.lineWidth=1;ctx.beginPath();if(b.hand){ctx.moveTo(x-w,y-h);ctx.quadraticCurveTo(x,y-h-12,x+w,y-h);}else{ctx.moveTo(x-w,y-h);ctx.quadraticCurveTo(x-w-3,y-h-8,x-w+2,y-h-9);}ctx.stroke();
    if(b.spout&&A.pumping){const Y=ACT1_PLACES.yard,s0=P(Y.pump.x+12,GB-36,Y.pump.d-8),k=.6+.4*Math.abs(Math.sin((S.t-A.pumping.t0)*4.5));
      ctx.strokeStyle=`rgba(170,195,205,${(.7*k).toFixed(2)})`;ctx.lineWidth=2.2*k;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(s0.x,s0.y);ctx.lineTo(x,y-h);ctx.stroke();}}};
// ===== ACT I, SCENES 3 AND 4 UI END =====
