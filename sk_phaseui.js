// ---------- the kitchen, the door between the rooms, and the wipe ----------
// (loaded ahead of the main UI script; everything here runs only once the UI is up)
const KM={wall:'#26353a',tile:'#46595a',grout:'#25333a',iron:'#17191d',iron2:'#23272d',copper:'#c9874a',copperD:'#8a5530',steel:'#7d8a92',steelD:'#4a555c',
  wood:'#6a4a30',woodD:'#3e2a1c',floorA:'#283231',floorB:'#33403e'};
// the cooking line along the kitchen's back wall (world x) and the pots on it: [where along it, width, height]
const RANGE={x0:378,x1:640},RANGE_POTS=[[.13,30,22],[.36,22,14],[.6,36,27],[.85,24,16]];
// ---------- painting the kitchen once into a layer ----------
function paintKitchen(c){
  const far=KITCHEN.far,yB=prjY(GB,far),X0=-140,X1=W+220,L=RC.x0,T=RC.y0,VW=RC.w,ox=far*PSX,ty0=yB-150;
  const pl=pts=>{c.beginPath();c.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)c.lineTo(pts[i].x,pts[i].y);c.closePath();c.fill();};
  const rect=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
  // ceiling and plaster, then tiles from the dado rail down
  const wg=c.createLinearGradient(0,T,0,yB);wg.addColorStop(0,'#0d1215');wg.addColorStop(.22,'#172227');wg.addColorStop(.62,KM.wall);wg.addColorStop(1,'#213035');
  c.fillStyle=wg;c.fillRect(L-40,T-40,VW+80,yB-T+44);
  c.fillStyle='rgba(255,230,190,.03)';for(let x=-60;x<W+200;x+=34)c.fillRect(x,T+60,14,ty0-T-70);
  rect(X0,ty0,X1-X0,yB-ty0,KM.tile);
  c.strokeStyle=KM.grout;c.lineWidth=1;c.beginPath();
  for(let y=ty0;y<yB;y+=12){c.moveTo(X0,y);c.lineTo(X1,y);}
  for(let row=0,y=ty0;y<yB;y+=12,row++)for(let x=X0+(row%2)*12;x<X1;x+=24){c.moveTo(x,y);c.lineTo(x,y+12);}
  c.stroke();c.fillStyle='rgba(255,255,255,.05)';for(let y=ty0;y<yB;y+=12)c.fillRect(X0,y+1,X1-X0,1.2);
  rect(X0,ty0-6,X1-X0,7,'#1a252a');rect(X0,ty0-6,X1-X0,1.2,'rgba(210,230,225,.22)');
  // the door back to the dining room, propped open, warm light from the other side
  {const x0=KITCHEN_DOOR.x-30+ox,x1=x0+60,top=yB-132;
    rect(x0-7,top-7,x1-x0+14,yB-top+7,'#1a0d18');
    const g=c.createLinearGradient(0,top,0,yB);g.addColorStop(0,'#3a1a33');g.addColorStop(.55,'#7a3a55');g.addColorStop(1,'#c96a5a');c.fillStyle=g;c.fillRect(x0,top,x1-x0,yB-top);
    c.fillStyle='rgba(255,196,140,.35)';c.fillRect(x0+4,top+20,x1-x0-8,yB-top-20);
    c.fillStyle='#3a2030';pl([{x:x1-4,y:top},{x:x1+8,y:top-5},{x:x1+8,y:yB+5},{x:x1-4,y:yB}]);
    c.fillStyle='rgba(255,214,150,.55)';c.beginPath();c.ellipse(x1+2,top+44,3,7,0,0,TAU);c.fill();
    rect(x0-7,top-7,x1-x0+14,1.4,RM.brass);}
  // open shelves of jars and crockery on the left wall
  {const x0=165+ox,x1=330+ox,r=mulberry32(31);
    for(const y of [ty0-74,ty0-36]){rect(x0,y,x1-x0,4,KM.woodD);rect(x0,y,x1-x0,1,'rgba(255,220,180,.25)');rect(x0+8,y+4,3,8,KM.woodD);rect(x1-11,y+4,3,8,KM.woodD);
      for(let x=x0+6;x<x1-10;){const k=r();
        if(k<.4){const h=9+r()*7,w=7+r()*3;c.fillStyle='rgba(205,235,245,.3)';c.fillRect(x,y-h,w,h);c.fillStyle=['#c98a3a','#7a9a4a','#a83a3a','#d8c070'][Math.floor(r()*4)];c.fillRect(x+1,y-h*.65,w-2,h*.65-1);
          rect(x-.5,y-h-2.5,w+1,2.5,'#5a3a28');x+=w+4;}
        else if(k<.75){c.fillStyle='#e6dccb';for(let i=0;i<4+Math.floor(r()*4);i++){c.beginPath();c.ellipse(x+7,y-2-i*2.2,7,1.8,0,0,TAU);c.fill();}x+=18;}
        else{c.fillStyle=KM.copper;c.fillRect(x,y-9,13,9);c.fillStyle=KM.copperD;c.fillRect(x,y-9,13,2);x+=17;}}}}
  // a rack of pans over the shelves
  {const x0=200+ox,x1=330+ox,y=T+102;c.strokeStyle='#3a434a';c.lineWidth=1.2;c.beginPath();c.moveTo(x0+10,T-40);c.lineTo(x0+10,y);c.moveTo(x1-10,T-40);c.lineTo(x1-10,y);c.stroke();
    rect(x0,y,x1-x0,4,'#4a555c');const r=mulberry32(9);
    for(let x=x0+10;x<x1-6;x+=22){const L2=18+r()*16,R2=6+r()*5;c.strokeStyle='#2a2f34';c.lineWidth=1.4;c.beginPath();c.moveTo(x,y+4);c.lineTo(x,y+4+L2);c.stroke();
      c.fillStyle=r()<.5?KM.copper:'#3a3f44';c.beginPath();c.arc(x,y+6+L2+R2,R2,0,TAU);c.fill();c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.arc(x+1.5,y+7+L2+R2,R2*.6,0,TAU);c.fill();}}
  // the range: a copper hood and its duct, black iron ovens, pots on the burners
  {const sx0=RANGE.x0+ox,sx1=RANGE.x1+ox,top=yB-74,mid=(sx0+sx1)/2;
    c.fillStyle='rgba(12,8,6,.4)';c.fillRect(sx0-12,ty0-28,sx1-sx0+24,top-ty0+28);
    rect(mid-28,T-40,56,ty0-96-T+40,'#5a361e');rect(mid-28,T-40,9,ty0-96-T+40,'rgba(255,200,150,.16)');
    const hg=c.createLinearGradient(sx0,0,sx1,0);hg.addColorStop(0,'#6a3f22');hg.addColorStop(.4,KM.copper);hg.addColorStop(.62,'#d99a5a');hg.addColorStop(1,'#6a3f22');c.fillStyle=hg;
    c.beginPath();c.moveTo(sx0-12,ty0-36);c.lineTo(sx1+12,ty0-36);c.lineTo(sx1-34,ty0-96);c.lineTo(sx0+34,ty0-96);c.closePath();c.fill();
    c.strokeStyle='rgba(60,30,14,.55)';c.lineWidth=1;c.beginPath();for(let x=sx0+20;x<sx1;x+=26){c.moveTo(x,ty0-37);c.lineTo(lerp(x,mid,.28),ty0-95);}c.stroke();
    rect(sx0-16,ty0-40,sx1-sx0+32,6,'#5a361e');rect(sx0-16,ty0-40,sx1-sx0+32,1.4,'rgba(255,214,170,.4)');
    rect(sx0,top,sx1-sx0,yB-top,KM.iron);rect(sx0,top,sx1-sx0,5,'#2e3238');rect(sx0,top+5,sx1-sx0,1,'rgba(255,255,255,.08)');
    const n=3,ow=(sx1-sx0-36)/n;
    for(let i=0;i<n;i++){const x=sx0+18+i*ow;rect(x+5,top+19,ow-10,yB-top-27,KM.iron2);rect(x+ow/2-17,top+30,34,15,'#2a140a');rect(x+12,top+14,ow-24,3,KM.steel);}
    for(let i=0;i<8;i++){c.fillStyle='#c9a25a';c.beginPath();c.arc(sx0+16+i*(sx1-sx0-32)/7,top+9,2.4,0,TAU);c.fill();}
    for(const [u,w,h] of RANGE_POTS){const x=lerp(sx0,sx1,u);c.fillStyle=u===.6?'#3a3f44':KM.copper;c.fillRect(x-w/2,top-h,w,h);c.fillStyle=u===.6?'#24282c':KM.copperD;c.fillRect(x-w/2,top-h,w,3);
      c.fillRect(x-w/2-5,top-h+5,5,2);c.fillRect(x+w/2,top-h+5,5,2);if(h>20){c.fillStyle='#24282c';c.fillRect(x-w/2-1,top-h-3,w+2,3);c.fillRect(x-3,top-h-7,6,4);}}}
  // the back door to the alley: heavy planks, iron straps, a barred window onto the night, a lantern by it
  {const x0=694+ox,x1=x0+62,top=yB-138;rect(x0-6,top-6,x1-x0+12,yB-top+6,'#140c0a');
    const g=c.createLinearGradient(x0,0,x1,0);g.addColorStop(0,'#3a2618');g.addColorStop(1,'#2a1a10');c.fillStyle=g;c.fillRect(x0,top,x1-x0,yB-top);
    c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=1;c.beginPath();for(let x=x0+10;x<x1;x+=10){c.moveTo(x,top);c.lineTo(x,yB);}c.stroke();
    for(const y of [top+26,yB-30])rect(x0-2,y,x1-x0+4,5,'#2a2f34');
    rect(x0+18,top+40,26,20,'#141c34');c.fillStyle='rgba(120,150,220,.35)';c.fillRect(x0+19,top+41,24,9);
    c.strokeStyle='#2a2f34';c.lineWidth=2;c.beginPath();for(let x=x0+24;x<x0+44;x+=6){c.moveTo(x,top+40);c.lineTo(x,top+60);}c.stroke();
    c.fillStyle='#c9a25a';c.beginPath();c.arc(x1-9,top+78,2.6,0,TAU);c.fill();
    const lx=x0-22,ly=top+34;c.fillStyle='#2a2f34';c.fillRect(lx-1,ly-14,2,14);c.fillStyle='#ffd9a0';c.fillRect(lx-5,ly,10,13);c.fillStyle='#2a2f34';c.fillRect(lx-6,ly-2,12,3);c.fillRect(lx-6,ly+12,12,2);
    const lg=c.createRadialGradient(lx,ly+6,2,lx,ly+6,60);lg.addColorStop(0,'rgba(255,214,150,.35)');lg.addColorStop(1,'rgba(255,190,120,0)');c.fillStyle=lg;c.fillRect(lx-60,ly-54,120,120);}
  // a chalkboard of orders and a string of onions on the left (the hidden lift takes the right-hand wall)
  {const x0=34,top=ty0-98;rect(x0-3,top-3,58,44,'#5a3a28');rect(x0,top,52,38,'#1f2a28');
    c.strokeStyle='rgba(240,240,230,.55)';c.lineWidth=.9;c.beginPath();for(let i=0;i<4;i++){c.moveTo(x0+5,top+8+i*8);c.lineTo(x0+14+((i*17)%30),top+8+i*8);}c.stroke();
    for(const ox2 of [60]){c.strokeStyle='#7a6a40';c.lineWidth=1;c.beginPath();c.moveTo(x0+ox2,top-10);c.lineTo(x0+ox2,top+44);c.stroke();
      c.fillStyle='#c9a06a';for(let y=top-4;y<top+44;y+=7){c.beginPath();c.ellipse(x0+ox2+(y%2?3:-3),y,4,3.4,0,0,TAU);c.fill();}}}
  // ceiling beams and a pipe along them
  rect(L-40,T-40,VW+80,44+40,'#0c1013');for(let x=-40;x<W+200;x+=130)rect(x,T-40,18,84,'#090c0e');
  rect(L-40,T+30,VW+80,5,'#2a3238');rect(L-40,T+30,VW+80,1.2,'rgba(200,220,220,.18)');
  rect(X0,yB-9,X1-X0,9,'#1a1f22');
  // the floor: black and white tiles gone grey with use
  for(let d=-90,k=0;d<far;d+=18,k++)for(let x=X0,j=0;x<X1;x+=36,j++){c.fillStyle=(j+k)%2?KM.floorA:KM.floorB;pl([P(x,GB,d),P(x+36.6,GB,d),P(x+36.6,GB,d+18.4),P(x,GB,d+18.4)]);}
  const fg=c.createLinearGradient(0,yB,0,H+60);fg.addColorStop(0,'rgba(0,0,0,.1)');fg.addColorStop(.5,'rgba(0,0,0,.18)');fg.addColorStop(1,'rgba(0,0,0,.42)');
  c.fillStyle=fg;pl([P(X0,GB,far),P(X1,GB,far),{x:prjX(X1,-90),y:H+90},{x:prjX(X0,-90),y:H+90}]);
  // a drain, flour trodden into the tiles, the light from under the range
  {const q=P(450,GB,74);c.fillStyle='#161b1c';c.beginPath();c.ellipse(q.x,q.y,15,4.5,0,0,TAU);c.fill();c.strokeStyle='#3a4446';c.lineWidth=1;c.beginPath();for(let i=-2;i<=2;i++){c.moveTo(q.x+i*5,q.y-3.4);c.lineTo(q.x+i*5,q.y+3.4);}c.stroke();}
  for(const [x,d,r] of [[160,132,26],[334,160,18],[548,158,16]]){const q=P(x,GB,d);const g=c.createRadialGradient(q.x,q.y,1,q.x,q.y,r);g.addColorStop(0,'rgba(240,234,220,.32)');g.addColorStop(1,'rgba(240,234,220,0)');c.fillStyle=g;c.beginPath();c.ellipse(q.x,q.y,r,r*.3,0,0,TAU);c.fill();}
  c.fillStyle='rgba(6,8,10,.55)';c.fillRect(X0,yB-2,X1-X0,3);
}
// burner flames, oven glow and steam, drawn live over the layer
function drawKitchenLive(){
  const far=KITCHEN.far,yB=prjY(GB,far),ox=far*PSX,sx0=RANGE.x0+ox,sx1=RANGE.x1+ox,top=yB-74,t=S.t;
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(const [u,w] of RANGE_POTS){const x=lerp(sx0,sx1,u);
    for(let i=0;i<5;i++){const fx=x-w/2+3+i*(w-6)/4,fl=3.5+2.2*Math.sin(t*23+i*1.9+u*7)+1.4*Math.sin(t*41+i);
      ctx.fillStyle='rgba(110,170,255,.75)';ctx.beginPath();ctx.moveTo(fx-2.2,top);ctx.lineTo(fx,top-fl);ctx.lineTo(fx+2.2,top);ctx.closePath();ctx.fill();
      ctx.fillStyle='rgba(255,190,110,.45)';ctx.beginPath();ctx.moveTo(fx-1,top-fl*.55);ctx.lineTo(fx,top-fl-1.5);ctx.lineTo(fx+1,top-fl*.55);ctx.closePath();ctx.fill();}}
  const n=3,ow=(sx1-sx0-36)/n,k=.55+.25*Math.sin(t*2.3)+.12*Math.sin(t*9.1);
  for(let i=0;i<n;i++){const x=sx0+18+i*ow+ow/2;ctx.fillStyle=`rgba(255,120,40,${(.35*k).toFixed(3)})`;ctx.fillRect(x-16,top+31,32,13);
    const g=ctx.createRadialGradient(x,top+38,2,x,top+38,34);g.addColorStop(0,`rgba(255,150,70,${(.18*k).toFixed(3)})`);g.addColorStop(1,'rgba(255,120,50,0)');ctx.fillStyle=g;ctx.fillRect(x-34,top+4,68,68);}
  ctx.restore();
  ctx.save();
  for(const [u,w,h] of RANGE_POTS){if(h<16)continue;const x=lerp(sx0,sx1,u);
    for(let i=0;i<3;i++){const ph=(t*.32+i/3+u)%1,y=top-h-6-ph*70,r=5+ph*15;ctx.globalAlpha=.09*Math.sin(ph*Math.PI);ctx.fillStyle='#e8eef0';
      ctx.beginPath();ctx.ellipse(x+Math.sin(t*1.3+i*2+u*9)*6*ph,y,r,r*.7,0,0,TAU);ctx.fill();}}
  ctx.restore();
}
// ---------- the dining room's kitchen door: painted into its layer, the doors themselves drawn live ----------
function paintDiningDoor(c){
  const far=ROOM.far,yB=prjY(GB,far),cx=DINING_DOOR.x+far*PSX,x0=cx-32,x1=cx+32,top=yB-132;
  c.fillStyle='#1a0d18';c.fillRect(x0-7,top-7,x1-x0+14,yB-top+7);
  const g=c.createLinearGradient(0,top,0,yB);g.addColorStop(0,'#1f2b2e');g.addColorStop(.6,'#3d5552');g.addColorStop(1,'#6a7f74');c.fillStyle=g;c.fillRect(x0,top,x1-x0,yB-top);
  c.fillStyle='rgba(255,200,130,.22)';c.fillRect(x0+6,top+30,x1-x0-12,yB-top-30);
  c.fillStyle=RM.brass;c.fillRect(x0-7,top-7,x1-x0+14,1.4);
  c.fillStyle='#8a6a32';c.fillRect(cx-22,top-21,44,11);c.fillStyle='#24121c';c.font='700 8px Georgia,serif';c.textAlign='center';c.fillText('KITCHEN',cx,top-12.5);}
function diningDoorOpen(){const T=S.stage.tr;if(!T||T.doorT==null)return 0;return eOut(clamp((S.t-T.doorT)/.7,0,1));}
function drawDiningDoor(){
  const far=ROOM.far,yB=prjY(GB,far),cx=DINING_DOOR.x+far*PSX,top=yB-132,o=diningDoorOpen(),w=31*Math.cos(o*1.28),grow=o*9;
  for(const s of [-1,1]){const hinge=cx+s*32,free=hinge-s*w;if(w<1.5)continue;
    const lo=Math.min(hinge,free),hi=Math.max(hinge,free),fy0=top-grow,fy1=yB+grow*.6;
    ctx.fillStyle='#3a2030';ctx.beginPath();ctx.moveTo(hinge,top);ctx.lineTo(free,fy0);ctx.lineTo(free,fy1);ctx.lineTo(hinge,yB);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,196,140,.12)';ctx.beginPath();ctx.moveTo(lerp(hinge,free,.15),top+8);ctx.lineTo(lerp(hinge,free,.85),fy0+8);ctx.lineTo(lerp(hinge,free,.85),fy0+28);ctx.lineTo(lerp(hinge,free,.15),top+28);ctx.closePath();ctx.fill();
    const mx=(lo+hi)/2,my=lerp(top,fy0,.5)+42,rx=Math.max(1,6.5*w/31);
    ctx.fillStyle='#8a6a32';ctx.beginPath();ctx.ellipse(mx,my,rx+1.6,8.6,0,0,TAU);ctx.fill();
    ctx.fillStyle='rgba(190,230,220,.75)';ctx.beginPath();ctx.ellipse(mx,my,rx,7,0,0,TAU);ctx.fill();
    ctx.fillStyle=RM.brass;ctx.beginPath();ctx.moveTo(hinge,yB-12);ctx.lineTo(free,fy1-12);ctx.lineTo(free,fy1-9);ctx.lineTo(hinge,yB-9);ctx.closePath();ctx.fill();}
}
// ---------- the wipe between the rooms ----------
function drawWipe(){
  const T=S.stage.tr;if(!T||(T.step!=='wipe'&&T.step!=='enter'))return;
  const u=S.t-T.t0,w=cv.width,h=cv.height,soft=w*.16,band=w+soft*2;
  let x0;if(T.step==='wipe')x0=w-eOut(clamp(u/TR.wipeIn,0,1))*(w+soft);else x0=-soft-eIn(clamp(u/TR.wipeOut,0,1))*(band+4);
  ctx.save();ctx.setTransform(1,0,0,1,0,0);
  // with reduced motion the panel fades in place instead of sliding across
  if(reduceMotion){ctx.globalAlpha=T.step==='wipe'?clamp(u/TR.wipeIn,0,1):1-clamp(u/TR.wipeOut,0,1);x0=-soft;}
  const g=ctx.createLinearGradient(x0,0,x0+band,0),e=soft/band;
  g.addColorStop(0,'rgba(8,6,22,0)');g.addColorStop(e,'rgba(8,6,22,.97)');g.addColorStop(1-e,'rgba(8,6,22,.97)');g.addColorStop(1,'rgba(8,6,22,0)');
  ctx.fillStyle=g;ctx.fillRect(x0,0,band,h);
  ctx.fillStyle='rgba(255,193,99,.55)';ctx.fillRect(x0+soft*.55,0,Math.max(1,w/700),h);ctx.fillRect(x0+band-soft*.55,0,Math.max(1,w/700),h);
  const cx=x0+band/2,cover=clamp(1-Math.abs(cx-w/2)/(w*.6),0,1);
  if(cover>0){const ga=ctx.globalAlpha,card=T.card||roomCard('kitchen'),dpr=w/Math.max(1,cssW),fs=Math.round(clamp(cssW/19,24,46)*dpr),ks=Math.round(clamp(cssW/48,11,18)*dpr),ss=Math.round(clamp(cssW/46,12,19)*dpr);
    ctx.globalAlpha=cover*ga;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.font=`700 ${ks}px "Alegreya SC",Georgia,serif`;ctx.fillStyle='#ffc163';ctx.fillText(card.phase,cx,h*.5-fs*.95);
    ctx.font=`700 ${fs}px "Alegreya SC",Georgia,serif`;ctx.fillStyle='#f5f6ff';ctx.fillText(card.title,cx,h*.5);ctx.fillStyle='rgba(255,193,99,.6)';ctx.fillRect(cx-fs*1.2,h*.5+fs*.62,fs*2.4,Math.max(1,dpr));
    ctx.font=`600 ${ss}px "Barlow Semi Condensed","Arial Narrow",sans-serif`;ctx.fillStyle='#aab3e2';
    ctx.fillText(card.sub,cx,h*.5+fs*1.2);}
  ctx.restore();
}
// ---------- kitchen furniture ----------
const PROP_DRAW={
  crate(Pp){const p=Pp.pts,d=Pp.dep,dz=Pp.dz,fr=d-dz*.8,bk=d+dz*.8;
    ctx.fillStyle='#5a3e26';poly([at(p[1],fr),at(p[1],bk),at(p[3],bk),at(p[3],fr)]);
    ctx.fillStyle='#93704a';poly([at(p[0],fr),at(p[1],fr),at(p[1],bk),at(p[0],bk)]);
    ctx.fillStyle='#7a5634';poly([at(p[0],fr),at(p[1],fr),at(p[3],fr),at(p[2],fr)]);
    ctx.strokeStyle='#4a3220';ctx.lineWidth=1.2;ctx.beginPath();
    for(const u of [.34,.67]){const a=at({x:lerp(p[0].x,p[2].x,u),y:lerp(p[0].y,p[2].y,u)},fr),b=at({x:lerp(p[1].x,p[3].x,u),y:lerp(p[1].y,p[3].y,u)},fr);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();
    segP(p[0],p[2],fr,3.2,'#5a3e24');segP(p[1],p[3],fr,3.2,'#5a3e24');segP(p[0],p[3],fr,2,'rgba(74,50,32,.8)');},
  barrel(Pp){const p=Pp.pts,d=Pp.dep,dz=Pp.dz,f=d-dz*.45,q=[p[0],p[4],p[2],p[3],p[5],p[1]].map(v=>at(v,f));
    ctx.fillStyle='#6a4428';ctx.beginPath();ctx.moveTo(q[0].x,q[0].y);ctx.quadraticCurveTo(q[1].x-3,q[1].y,q[2].x,q[2].y);ctx.lineTo(q[3].x,q[3].y);ctx.quadraticCurveTo(q[4].x+3,q[4].y,q[5].x,q[5].y);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(40,24,12,.55)';ctx.lineWidth=1;ctx.beginPath();for(const u of [.3,.5,.7]){const a={x:lerp(q[0].x,q[5].x,u),y:lerp(q[0].y,q[5].y,u)},b={x:lerp(q[2].x,q[3].x,u),y:lerp(q[2].y,q[3].y,u)};ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();
    for(const u of [.14,.5,.86]){const a=u<.5?{x:lerp(q[0].x,q[1].x,u*2),y:lerp(q[0].y,q[1].y,u*2)}:{x:lerp(q[1].x,q[2].x,u*2-1),y:lerp(q[1].y,q[2].y,u*2-1)},b=u<.5?{x:lerp(q[5].x,q[4].x,u*2),y:lerp(q[5].y,q[4].y,u*2)}:{x:lerp(q[4].x,q[3].x,u*2-1),y:lerp(q[4].y,q[3].y,u*2-1)};
      ctx.strokeStyle='#2f3438';ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
    const t0=at(p[0],d),t1=at(p[1],d);ctx.fillStyle='#7a5234';ctx.beginPath();ctx.ellipse((t0.x+t1.x)/2,(t0.y+t1.y)/2,Math.hypot(t1.x-t0.x,t1.y-t0.y)/2+1,dz*PSY*.8,Math.atan2(t1.y-t0.y,t1.x-t0.x),0,TAU);ctx.fill();
    ctx.strokeStyle='#2f3438';ctx.lineWidth=1.6;ctx.stroke();},
  sack(Pp){const p=Pp.pts,d=Pp.dep,f=d-3,q=[p[2],p[0],p[4],p[1],p[3]].map(v=>at(v,f));
    ctx.fillStyle='#cdbb92';ctx.beginPath();ctx.moveTo(q[0].x,q[0].y);ctx.quadraticCurveTo(q[0].x-7,(q[0].y+q[1].y)/2,q[1].x,q[1].y);ctx.quadraticCurveTo(q[1].x+3,q[2].y+5,q[2].x,q[2].y);
    ctx.quadraticCurveTo(q[3].x-3,q[2].y+5,q[3].x,q[3].y);ctx.quadraticCurveTo(q[4].x+7,(q[3].y+q[4].y)/2,q[4].x,q[4].y);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(90,70,40,.25)';ctx.beginPath();ctx.ellipse((q[0].x+q[4].x)/2,(q[1].y+q[0].y)/2+4,8,5,0,0,TAU);ctx.fill();
    ctx.strokeStyle='#8a7350';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(q[2].x-4,q[2].y+5);ctx.lineTo(q[2].x+4,q[2].y+5);ctx.stroke();
    ctx.fillStyle='#8a3a2a';const m={x:(q[1].x+q[3].x)/2,y:(q[1].y+q[3].y)/2+7};ctx.fillRect(m.x-7,m.y,14,2);},
  stove(Pp){const p=Pp.pts,d=Pp.dep,dz=Pp.dz,fr=d-dz*.8,bk=d+dz*.8,t=S.t,k=.62+.24*Math.sin(t*7.3)*Math.sin(t*3.1+1)+.1*Math.sin(t*17);
    const pt=at({x:(p[0].x+p[1].x)/2+6,y:p[0].y},bk);ctx.fillStyle='#1d2024';ctx.fillRect(pt.x-6,pt.y-460,12,460);ctx.fillStyle='rgba(255,255,255,.07)';ctx.fillRect(pt.x-6,pt.y-460,3,460);
    ctx.fillStyle='#2a2e33';ctx.fillRect(pt.x-8,pt.y-120,16,6);
    ctx.fillStyle='#1c1f23';poly([at(p[1],fr),at(p[1],bk),at(p[3],bk),at(p[3],fr)]);
    ctx.fillStyle='#2a2e34';poly([at(p[0],fr),at(p[1],fr),at(p[1],bk),at(p[0],bk)]);
    ctx.fillStyle='#16181c';poly([at(p[0],fr),at(p[1],fr),at(p[3],fr),at(p[2],fr)]);
    const a=at({x:lerp(p[0].x,p[1].x,.18),y:lerp(p[0].y,p[2].y,.42)},fr),b=at({x:lerp(p[0].x,p[1].x,.82),y:lerp(p[0].y,p[2].y,.8)},fr);
    ctx.fillStyle='#0c0d0f';ctx.fillRect(a.x,a.y,b.x-a.x,b.y-a.y);
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(255,110,30,${(.55*k).toFixed(3)})`;
    for(let i=0;i<4;i++)ctx.fillRect(a.x+3+i*(b.x-a.x-6)/4,a.y+4,(b.x-a.x-6)/4-3,b.y-a.y-8);
    const g=ctx.createRadialGradient((a.x+b.x)/2,b.y,2,(a.x+b.x)/2,b.y,60);g.addColorStop(0,`rgba(255,140,60,${(.3*k).toFixed(3)})`);g.addColorStop(1,'rgba(255,120,40,0)');ctx.fillStyle=g;ctx.fillRect((a.x+b.x)/2-60,b.y-60,120,90);ctx.restore();
    segP(p[0],p[1],fr,3,'#3a3f46');const rl=at({x:p[0].x,y:p[0].y+10},fr-2),rr=at({x:p[1].x,y:p[1].y+10},fr-2);seg(rl,rr,1.6,RM.brass);
    // the iron top is hot: a dull red glow along it and the air shimmering above
    ctx.save();ctx.globalCompositeOperation='lighter';const ta=at(p[0],d),tb=at(p[1],d);ctx.strokeStyle=`rgba(255,90,30,${(.35*k).toFixed(3)})`;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(ta.x+3,ta.y);ctx.lineTo(tb.x-3,tb.y);ctx.stroke();ctx.restore();
    ctx.strokeStyle='rgba(255,220,190,.12)';ctx.lineWidth=1.2;for(let i=0;i<3;i++){const x=lerp(ta.x,tb.x,.25+i*.25),ph=(t*.8+i*.37)%1,y0=ta.y-6-ph*34;ctx.globalAlpha=Math.sin(ph*Math.PI);ctx.beginPath();ctx.moveTo(x,y0);ctx.quadraticCurveTo(x+4*Math.sin(t*5+i),y0-6,x,y0-12);ctx.quadraticCurveTo(x-4*Math.sin(t*5+i),y0-18,x,y0-24);ctx.stroke();}ctx.globalAlpha=1;
    for(const q of [p[2],p[3]]){const f0=at(q,fr);ctx.fillStyle='#0c0d0f';ctx.fillRect(f0.x-3,f0.y-4,6,5);}}};
// the kitchen's prep table: a butcher block on steel legs
function drawPrepTable(){
  const T=S.table,Q=T.pts,bk=T.dep+TD,fr=T.dep-TD,lp=(a,b,u)=>({x:lerp(a.x,b.x,u),y:lerp(a.y,b.y,u)}),at2=(q,d)=>P(q.x,q.y,d);
  const la=lp(Q[0],Q[1],.08),lb=lp(Q[0],Q[1],.92);ctx.lineCap='round';ctx.lineJoin='round';
  seg(at2(la,bk),at2(Q[3],bk),4,'#262d32');seg(at2(lb,bk),at2(Q[2],bk),4,'#262d32');
  const s0=lp(la,Q[3],.7),s1=lp(lb,Q[2],.7);ctx.fillStyle='#38424a';poly([at2(s0,bk),at2(s1,bk),at2(s1,fr),at2(s0,fr)]);
  ctx.fillStyle=KM.copper;const m=at2(lp(s0,s1,.35),T.dep);ctx.fillRect(m.x-7,m.y-9,14,9);
  seg(at2(la,fr),at2(Q[3],fr),4.5,'#3a444a');seg(at2(lb,fr),at2(Q[2],fr),4.5,'#3a444a');
  const ux=Q[1].x-Q[0].x,uy=Q[1].y-Q[0].y,L=Math.hypot(ux,uy)||1,nx=-uy/L,ny=ux/L,o=(q,u,v)=>({x:q.x+ux/L*u+nx*v,y:q.y+uy/L*u+ny*v});
  const a0=o(Q[0],-4,-2),a1=o(Q[1],4,-2),b0=o(Q[0],-4,9),b1=o(Q[1],4,9);
  ctx.fillStyle='#b8895a';poly([at2(a0,bk),at2(a1,bk),at2(a1,fr),at2(a0,fr)]);
  ctx.strokeStyle='rgba(110,70,38,.4)';ctx.lineWidth=.8;ctx.beginPath();for(const u of [.25,.5,.75]){const q1=at2(lp(a0,a1,u),bk),q2=at2(lp(a0,a1,u),fr);ctx.moveTo(q1.x,q1.y);ctx.lineTo(q2.x,q2.y);}ctx.stroke();
  ctx.fillStyle='#8a6038';poly([at2(a0,fr),at2(a1,fr),at2(b1,fr),at2(b0,fr)]);
  ctx.strokeStyle='rgba(60,36,18,.55)';ctx.lineWidth=1;ctx.beginPath();for(let u=0;u<=1.001;u+=.1){const a=at2(lp(a0,a1,u),fr),b=at2(lp(b0,b1,u),fr);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();
  // a cleaver left in the block
  const cq=at2(lp(a0,a1,.62),T.dep-4),ang=Math.atan2(uy,ux);ctx.save();ctx.translate(cq.x,cq.y);ctx.rotate(ang);
  ctx.fillStyle='#9aa6ae';ctx.beginPath();ctx.moveTo(-9,2);ctx.lineTo(7,2);ctx.lineTo(7,-9);ctx.lineTo(-9,-11);ctx.closePath();ctx.fill();ctx.fillStyle='#2a1a10';ctx.fillRect(7,-8,12,3.4);ctx.restore();}
// ---------- hooks into the game ----------
function snapCamera(){let lo=1e9,hi=-1e9;for(const f of S.F){if(f.gone)continue;const x=prjX(f.p[PEL].x,f.dep);lo=Math.min(lo,x);hi=Math.max(hi,x);}
  cam.viewW=camNarrow()?clamp(hi-lo+280,560,W):W;cam.x=clamp((lo+hi)/2,cam.viewW/2,W-cam.viewW/2);cam.tSet=false;}
S.hooks.phase=step=>{const b=document.getElementById('banner');lockRunToggles();
  if(step==='clear'){b.textContent=`The ${roomName()} is clear`;updateStatus();}
  else if(step==='reveal'){b.textContent='A hidden lift';}
  else if(step==='breach'){b.textContent='The executive\'s door';}
  else if(step==='walk'){const T=S.stage.tr;b.textContent=T&&T.to?ROOMS[T.to].via:'Through to the kitchen';if(!T||T.from==='dining')S.hooks.sound('wood',.6,{s:'door_swing'});}
  else if(step==='swap'){buildRows();buildBench();snapCamera();b.textContent=ROOMS[S.room].title;updateStatus();}
  else if(step==='enter'){S.hooks.sound('thud',160);}
};
// the run's room toggles hold still while the run moves between rooms, during the last scene, and for a part of the run already
// reached; once the fight is over they set up the next one
function runLocked(which){const p=S.game.phase;if(p==='over')return false;if(p==='transit'||p==='finale')return true;
  return which==='back'?S.room!=='dining':S.room==='lobby'||S.room==='office';}
function lockRunToggles(){const b=document.getElementById('tBack'),d=document.getElementById('tDeep');if(!b||!d)return;
  const lb=runLocked('back'),ld=runLocked('deep')||!S.backroom;if(b.disabled!==lb)b.disabled=lb;if(d.disabled!==ld)d.disabled=ld;
  const tip=on=>on?'Locked until this fight is over':'';for(const [el,on] of [[b,lb],[d,runLocked('deep')]]){const L=el.closest&&el.closest('.tog');if(L&&L.title!==tip(on))L.title=tip(on);}}
document.getElementById('tBack').addEventListener('change',e=>{if(runLocked('back')){e.target.checked=!!S.backroom;lockRunToggles();return;}
  S.backroom=e.target.checked;lockRunToggles();buildBench();updateStatus();});
document.getElementById('tDeep').addEventListener('change',e=>{if(runLocked('deep')||!S.backroom){e.target.checked=!!S.deep;lockRunToggles();return;}
  S.deep=e.target.checked;buildBench();updateStatus();});
