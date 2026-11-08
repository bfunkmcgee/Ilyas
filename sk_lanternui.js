// ===== THE LANTERN'S SET PIECES ON THE PAGE START (since V103) =====
// What the set pieces of sk_lantern.js leave in the world, drawn: the felled lamp on Lamplight Street. Nothing here writes what the
// game reads (the drawfree suite).

// ---------- the felled lamp ----------
// The post from the axe's bite up is the street painter's own drawing of it (EnvLook.S.street.postSprite), laid down along the way it
// falls: standing a moment with the axe in it (a shiver), going over about the bite (slowly and then all at once), then down flat on
// the flags and the road. Its picture is cut across into lengths, each put in the draw list at its own depth, so whoever stands nearer
// than a length of it is drawn over it and whoever stands deeper under it. While it falls the lantern burns; on the road it bursts.
const LAMP_SEGS=6;
function lampPoseAt(F,t){const k=LAMP_FELL.k,sp=lampSp(F),H=sp?sp.h:(LAMP_FELL.top-LAMP_FELL.cut)*k,g=GB-KERB_H,
    C={x:F.lx,y:g-LAMP_FELL.cut*k,d:STREET_LAMP_D},dir=th=>({x:C.x+H*Math.sin(th)*F.hx,y:C.y-H*Math.cos(th),d:C.d+H*Math.sin(th)*F.hd});
  if(F.t0==null||t<F.t0){const dt=Math.max(0,t-(F.bite??t)),th=.022*Math.sin(dt*38)*Math.exp(-dt*5);return{C,T:dir(th),H,lit:1};}
  const u=clamp((t-F.t0)/LAMP_FELL.fall,0,1);if(u<1)return{C,T:dir(Math.PI/2*u*u),H,lit:1};
  // flat: the cut end comes down onto the flags, the lantern's onto whatever is under it (the road), with a little bounce
  const T0=dir(Math.PI/2),u2=clamp((t-F.t0-LAMP_FELL.fall)/LAMP_FELL.drop,0,1),e=u2*u2,b=Math.max(0,t-F.t0-LAMP_FELL.fall-LAMP_FELL.drop),
    up=b>0?3.2*Math.exp(-b*12)*Math.abs(Math.sin(b*22)):0;
  return{C:{...C,y:lerp(C.y,g-2,e)},T:{...T0,y:lerp(T0.y,S.arena.ground(T0.x,T0.d)-2,e)-up},H,lit:u2<1?1:0,down:u2>=1};}
function lampSp(F){const L=typeof EnvLook!=='undefined'&&EnvLook.S&&EnvLook.S.street;return L&&L.postSprite?L.postSprite(F.lx):null;}
function lampOn(){return S.arenaKey==='street'&&!!S.lampFall&&!S.classicLook&&typeof envKey==='function'&&envKey()==='street';}
{const ei=envItems;envItems=function(items){ei(items);if(!lampOn())return;const F=S.lampFall,P=lampPoseAt(F,S.t);
  for(let i=0;i<LAMP_SEGS;i++)items.push({d:lerp(P.C.d,P.T.d,(i+.5)/LAMP_SEGS)+.01,lampSeg:{i,P}});};}
{const de=drawEnvItem;drawEnvItem=function(it){if(!it.lampSeg)return de(it);ctx.save();try{lampSegDraw(it.lampSeg.i,it.lampSeg.P);}catch(e){}ctx.restore();return true;};}
function lampSegDraw(i,P){const F=S.lampFall,sp=lampSp(F);if(!sp)return;
  const Cs={x:prjX(P.C.x,P.C.d),y:prjY(P.C.y,P.C.d)},Ts={x:prjX(P.T.x,P.T.d),y:prjY(P.T.y,P.T.d)},W={x:(Ts.x-Cs.x)/P.H,y:(Ts.y-Cs.y)/P.H};
  // lying down: its shadow on the ground under this length
  if(P.down){const u0=i/LAMP_SEGS,u1=(i+1)/LAMP_SEGS,at=u=>{const x=lerp(P.C.x,P.T.x,u),d=lerp(P.C.d,P.T.d,u);return{x:prjX(x,d),y:prjY(S.arena.ground(x,d),d)};},a=at(u0),b=at(u1);
    ctx.strokeStyle='rgba(4,3,8,.42)';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(a.x+2,a.y+1.5);ctx.lineTo(b.x+2,b.y+1.5);ctx.stroke();}
  const ya=-sp.h*(i+1)/LAMP_SEGS,yb=-sp.h*i/LAMP_SEGS;
  // (its width kept square to its length on the screen, as a post lying on the ground shows it)
  const wl=Math.hypot(W.x,W.y)||1,N={x:-W.y/wl,y:W.x/wl};
  ctx.save();ctx.transform(N.x,N.y,-W.x,-W.y,Cs.x,Cs.y);
  ctx.drawImage(sp.cv,0,Math.max(0,(ya-sp.y0)*sp.px),sp.cv.width,(yb-ya)*sp.px,sp.x0,ya,sp.w,yb-ya);ctx.restore();
  // the lantern burning as it goes over (on the last length)
  if(i===LAMP_SEGS-1&&P.lit){const q={x:Cs.x+sp.lanX*N.x-sp.lanY*W.x,y:Cs.y+sp.lanX*N.y-sp.lanY*W.y},f=.88+.12*Math.sin(S.t*31)*Math.sin(S.t*13.7);lampGlowAt(q,f);}}
// the lantern's light where it is
function lampGlowAt(q,f){ctx.save();ctx.globalCompositeOperation='lighter';
  for(const [r,c,a] of [[30,'255,240,204',.85],[90,'255,184,102',.28]]){const g=ctx.createRadialGradient(q.x,q.y,0,q.x,q.y,r);g.addColorStop(0,`rgba(${c},${(a*f).toFixed(3)})`);g.addColorStop(1,`rgba(${c},0)`);
    ctx.fillStyle=g;ctx.fillRect(q.x-r,q.y-r,2*r,2*r);}ctx.restore();}
// the gas flaring out of the broken lantern on the road for a moment after it lands
V11UI.world.push(()=>{if(!lampOn())return;const F=S.lampFall;if(!F.down||F.downT==null)return;const dt=S.t-F.downT;if(dt<0||dt>.9)return;
  const P=lampPoseAt(F,S.t),sp=lampSp(F);if(!sp)return;const Cs={x:prjX(P.C.x,P.C.d),y:prjY(P.C.y,P.C.d)},Ts={x:prjX(P.T.x,P.T.d),y:prjY(P.T.y,P.T.d)},W={x:(Ts.x-Cs.x)/P.H,y:(Ts.y-Cs.y)/P.H},
    wl=Math.hypot(W.x,W.y)||1,q={x:Cs.x-sp.lanX*W.y/wl-sp.lanY*W.x,y:Cs.y+sp.lanX*W.x/wl-sp.lanY*W.y},k=dt<.12?dt/.12:Math.pow(1-(dt-.12)/.78,1.4);
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(const [r,c,a,dy] of [[26*(1+dt),'255,236,180',.8,-6-14*dt],[54*(1+dt*.6),'255,140,60',.4,-10-20*dt]]){const g=ctx.createRadialGradient(q.x,q.y+dy,0,q.x,q.y+dy,r);
    g.addColorStop(0,`rgba(${c},${(a*k).toFixed(3)})`);g.addColorStop(1,`rgba(${c},0)`);ctx.fillStyle=g;ctx.fillRect(q.x-r,q.y+dy-r,2*r,2*r);}
  ctx.restore();});
// ---------- the cleaver in Orrin's hand ----------
// The kitchen painter draws it in the block; while it is out (S.cleaver.state 'hand') it is drawn in his off hand, its handle in his
// fist along his forearm and the blade on past it, the edge the way the blow goes (down, and toward the man he faces), in front of him
// and of the block in the draw list (it comes down onto the block's top).
{const ei=envItems;envItems=function(items){ei(items);const CL=S.cleaver;if(!CL||CL.state!=='hand'||S.classicLook)return;const f=S.F[CL.f];if(f&&!f.dead)items.push({d:Math.min(f.dep,S.table?S.table.dep-TD:f.dep)-1,cleaverIn:f});};}
{const de=drawEnvItem;drawEnvItem=function(it){if(!it.cleaverIn)return de(it);ctx.save();try{cleaverDraw(it.cleaverIn);}catch(e){}ctx.restore();return true;};}
function cleaverDraw(f){const E=f.p[ELB],H=f.p[HAB],d=f.dep,e=P(E.x,E.y,d),h=P(H.x,H.y,d);let ux=h.x-e.x,uy=h.y-e.y;const L=Math.hypot(ux,uy)||1;ux/=L;uy/=L;
  let nx=-uy,ny=ux;if(nx*f.facing*.4+ny<0){nx=-nx;ny=-ny;}
  ctx.save();ctx.setTransform(ctx.getTransform().multiply(new DOMMatrix([ux,uy,nx,ny,h.x,h.y])));
  // the handle through the fist, then the blade: square, its spine on the far side, a hole to hang it by
  ctx.fillStyle='#1a0e08';ctx.fillRect(-6,-1.8,14,3.6);ctx.fillStyle='#8a6a2e';ctx.fillRect(-3,-1.2,1,2.4);ctx.fillRect(3,-1.2,1,2.4);
  const g=ctx.createLinearGradient(0,-6,0,10);g.addColorStop(0,'#6a7276');g.addColorStop(.5,'#c8d0d4');g.addColorStop(1,'#e8eef0');
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(7,-5);ctx.lineTo(23,-6.5);ctx.lineTo(24,10);ctx.lineTo(7,9.5);ctx.closePath();ctx.fill();
  ctx.fillStyle='#14100c';ctx.beginPath();ctx.arc(19,-2.4,1.3,0,TAU);ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(8,9.2);ctx.lineTo(23.6,9.6);ctx.stroke();
  ctx.restore();}
// ---------- the flood in the dining room ----------
// Under everyone (drawn with the room's own live parts): the water coming across the floor from the tank as a wall with a white crest
// and its spray, then lying there, dark and green, the room's lights standing in it, rings going out from every foot that moves. Among
// the feet (in the draw list): the fish, flopping. All of it is the page's own, on the drawing's dice: nothing here is the game's.
const FLOOD={k:null,fish:[],rings:[],feet:new WeakMap(),last:0};
function floodOn(){return!!S.flood&&S.arenaKey==='restaurant'&&S.room==='dining'&&!S.classicLook&&typeof envKey==='function'&&envKey()==='dining';}
function floodReset(){const F=S.flood;FLOOD.k=F;FLOOD.fish=[];FLOOD.rings=[];FLOOD.last=S.t;const R=mulberry32(((F.t0*1000)|0)+7);
  // the fish out of the tank, thrown out across the floor with the water, each its own size and colours, flopping on its own clock
  for(let i=0;i<10;i++){const k=R();FLOOD.fish.push({x:lerp(TANK_W.x0+20,TANK_W.x1-20,R()),d:TANK_W.d-4,h:30+R()*60,vx:(R()-.5)*120,vd:-(140+R()*160),vh:-(20+R()*60),
    sz:k<.25?8+R()*3:5+R()*3,col:k<.35?['#e8a33a','#f2c060']:k<.6?['#f0e8d8','#e05a2a']:k<.8?['#d8562a','#f0b070']:['#c8c0a0','#5a4a3a'],ang:R()*TAU,spin:(R()-.5)*14,
    next:0,dir:R()<.5?-1:1,tired:0,seed:R()*99});}}
// the fish: thrown with the water, then lying where they come down and flopping (a jump, a twist in the air, a smack) until they tire
function floodFishStep(dt){const R=uiRand,dmin=(typeof DEP_MIN!=='undefined'?DEP_MIN:12)+2;
  for(const f of FLOOD.fish){if(f.h>0||f.vh<0){f.vh+=520*dt;f.h-=f.vh*dt;f.x+=f.vx*dt;f.d+=f.vd*dt;f.ang+=f.spin*dt;
      if(f.d<dmin){f.d=dmin;f.vd=Math.abs(f.vd)*.3;}if(f.d>TANK_W.d-4){f.d=TANK_W.d-4;f.vd=-Math.abs(f.vd)*.3;}f.x=clamp(f.x,-20,W+20);
      if(f.h<=0&&f.vh>0){f.h=0;f.vh=0;f.vx*=.2;f.vd*=.2;f.spin=0;f.next=S.t+.25+R()*(.6+f.tired*.4);floodRing(f.x,f.d,.7);}}
    else{f.vx*=Math.pow(.02,dt);f.vd*=Math.pow(.02,dt);f.x+=f.vx*dt;f.d+=f.vd*dt;
      if(S.t>=f.next&&f.tired<14){f.tired++;const p=Math.max(.35,1-f.tired*.05);f.vh=-(110+R()*120)*p;f.h=.1;f.vx=(R()-.5)*90*p;f.vd=(R()-.5)*50*p;f.spin=(R()<.5?-1:1)*(8+R()*10);f.dir=R()<.5?-1:1;}}}}
function floodRing(x,d,k){FLOOD.rings.push({x,d,t0:S.t,k});if(FLOOD.rings.length>40)FLOOD.rings.shift();}
// rings from the feet: a foot that moves sends one out (one a foot every fifth of a second at most)
function floodFeet(){for(const f of S.F){if(f.dead&&f.motor<.05)continue;let L=FLOOD.feet.get(f);if(!L){L=[{x:0,y:0,t:0},{x:0,y:0,t:0}];FLOOD.feet.set(f,L);}
  [FTF,FTB].forEach((j,k)=>{const q=f.p[j],l=L[k],mv=Math.hypot(q.x-l.x,q.y-l.y);l.x=q.x;l.y=q.y;if(mv>1.4&&S.t-l.t>.2&&q.y>f.gr(q.x)-8){l.t=S.t;floodRing(q.x,f.dep,1);}});}}
function floodDraw(){if(!floodOn())return;const F=S.flood,t=S.t;if(FLOOD.k!==F)floodReset();
  const dt=clamp(t-FLOOD.last,0,.05);FLOOD.last=t;if(dt>0){floodFishStep(dt);floodFeet();}
  const E=EnvLook,NEAR=E.NEAR,front=Math.max(NEAR,TANK_W.d-FLOOD_V*(t-F.t0)),X0=-160,X1=W+240,pp=(x,d)=>({x:x+d*PSX,y:GB-d*PSY});
  // the water over the boards, from the wall to its front
  const a=pp(X0,TANK_W.d),b=pp(X1,TANK_W.d),c=pp(X1+110,front),d=pp(X0,front);
  ctx.save();ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.lineTo(d.x,d.y);ctx.closePath();
  const g=ctx.createLinearGradient(0,a.y,0,d.y);g.addColorStop(0,'rgba(10,30,24,.3)');g.addColorStop(1,'rgba(14,34,28,.17)');ctx.fillStyle=g;ctx.fill();ctx.clip();
  // the room's lights standing in it, trembling: the sconces, the tank's lamp, the windows
  ctx.globalCompositeOperation='lighter';
  for(const [lx,col,al,w] of [[272-TANK_W.d*PSX,'255,200,130',.16,10],[424-TANK_W.d*PSX,'255,200,130',.16,10],[(TANK_W.x0+TANK_W.x1)/2,'255,226,150',.12,60],[150,'150,170,220',.08,30],[300,'150,170,220',.08,30]]){
    for(let i=0;i<7;i++){const dd=TANK_W.d-6-i*24;if(dd<front)break;const q=pp(lx+Math.sin(t*3.1+i*1.7)*2.4,dd),ww=w*(1+i*.08);ctx.fillStyle=`rgba(${col},${(al*(1-i/8)).toFixed(3)})`;ctx.fillRect(q.x-ww/2,q.y-1.2,ww,2.4);}}
  // the rings off the feet and the fish
  ctx.globalCompositeOperation='source-over';
  for(const r of FLOOD.rings){const u=(t-r.t0)/.75;if(u<0||u>1)continue;const q=pp(r.x,r.d),R=(4+22*u)*r.k;ctx.strokeStyle=`rgba(220,240,226,${(.5*(1-u)).toFixed(3)})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(q.x,q.y,R,R*.3,0,0,TAU);ctx.stroke();}
  ctx.restore();
  // the crest coming across, white, with its spray thrown up off it
  if(front>NEAR+1||t-F.t0<1.2){const u=clamp((t-F.t0)/1.1,0,1),k=1-u*.5;ctx.save();ctx.strokeStyle=`rgba(232,248,236,${(.75*k).toFixed(3)})`;ctx.lineWidth=3.5;ctx.beginPath();
    for(let x=X0;x<=X1;x+=20){const q=pp(x,front+3*Math.sin(x*.07+t*9));x===X0?ctx.moveTo(q.x,q.y):ctx.lineTo(q.x,q.y);}ctx.stroke();
    const R=mulberry32(((F.t0*1000)|0)+11);for(let i=0;i<60;i++){const x=lerp(TANK_W.x0-200,TANK_W.x1+200,R()),h=(10+R()*40)*k,q=pp(x,front+R()*10);ctx.fillStyle=`rgba(226,244,232,${(.55*k*R()).toFixed(3)})`;ctx.fillRect(q.x,q.y-h*R(),1.6,1.6);}
    ctx.restore();}}
// the dining room's own live parts are drawn under the people; the flood with them
{const L=typeof EnvLook!=='undefined'&&EnvLook.S&&EnvLook.S.dining;if(L&&L.live){const lv=L.live;L.live=function(){lv.apply(this,arguments);try{floodDraw();}catch(e){}};}}
// the fish among the feet
{const ei=envItems;envItems=function(items){ei(items);if(!floodOn()||FLOOD.k!==S.flood)return;for(const f of FLOOD.fish)items.push({d:f.d,floodFish:f});};}
{const de=drawEnvItem;drawEnvItem=function(it){if(!it.floodFish)return de(it);ctx.save();try{fishDraw(it.floodFish);}catch(e){}ctx.restore();return true;};}
function fishDraw(f){const g=S.arena.ground(f.x,f.d),q={x:f.x+f.d*PSX,y:g-f.h-f.d*PSY},s=f.sz,wag=Math.sin(S.t*(f.h>0?24:11)+f.seed)*(f.h>0?.5:.25);
  // its shadow on the water, then the fish on its side, curling
  ctx.fillStyle='rgba(4,10,8,.35)';ctx.beginPath();ctx.ellipse(f.x+f.d*PSX,g-f.d*PSY,s*1.2,s*.3,0,0,TAU);ctx.fill();
  ctx.translate(q.x,q.y-s*.3);ctx.rotate(f.h>0?f.ang:wag*.4);ctx.scale(f.dir,1);
  ctx.fillStyle=f.col[0];ctx.beginPath();ctx.ellipse(0,0,s,s*.45,0,0,TAU);ctx.fill();
  ctx.beginPath();ctx.moveTo(-s*.8,0);ctx.lineTo(-s*1.6,-s*.55+wag*s);ctx.lineTo(-s*1.5,s*.55+wag*s);ctx.closePath();ctx.fill();
  ctx.fillStyle=f.col[1];ctx.beginPath();ctx.ellipse(s*.1,-s*.14,s*.45,s*.18,0,0,TAU);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.45)';ctx.fillRect(-s*.4,-s*.36,s*.9,.8);ctx.fillStyle='#120c08';ctx.beginPath();ctx.arc(s*.62,-s*.08,Math.max(.8,s*.1),0,TAU);ctx.fill();}
// ===== THE LANTERN'S SET PIECES ON THE PAGE END =====
