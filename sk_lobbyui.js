// ===== LOBBY UI =====
// (loaded ahead of the main UI script; everything here runs only once the UI is up)
// The lobby: navy panels with amber light strips, black stone and brass, and a night skyline far below the windows. The still parts are
// painted once into the room's layer (paintLobby); the lift's doors, the little lights that blink and the executive's door are drawn live.
const LM={gold:'#c9a25a',goldL:'#f0d596',goldD:'#7a5f2e',amber:'255,190,110'};
// where things are on the back wall (screen units): the lift, the executive's door, the two windows, the camera and the keypad
const LG={far:LOBBY.far,ox:LOBBY.far*PSX,yB:prjY(GB,LOBBY.far),liftX:LOBBY_LIFT.x+LOBBY.far*PSX,
  dx0:EXEC_DOOR.x-EXEC_DOOR.w/2+LOBBY.far*PSX,dx1:EXEC_DOOR.x+EXEC_DOOR.w/2+LOBBY.far*PSX,
  winA:{x0:200,x1:290,y0:62,y1:232,cols:2},winB:{x0:790,x1:946,y0:62,y1:232,cols:3},cam:{x:602,y:84},kp:{x:0,y:0}};
LG.dTop=LG.yB-EXEC_DOOR.h;LG.kp={x:LG.dx0-30,y:LG.dTop+66};
// the night beyond a window: sky, a moon, haze, towers and the city's lights far below (the tall tower carries a red light that blinks)
function lobbySky(c,win,seed){
  const{x0,x1,y0,y1}=win,w=x1-x0,h=y1-y0,hz=y0+h*.56,r=mulberry32(seed);
  c.save();c.beginPath();c.rect(x0,y0,w,h);c.clip();
  const g=c.createLinearGradient(0,y0,0,y1);g.addColorStop(0,'#050813');g.addColorStop(.3,'#0e1536');g.addColorStop(.56,'#2e2c62');g.addColorStop(.565,'#0b0e20');g.addColorStop(1,'#070913');
  c.fillStyle=g;c.fillRect(x0,y0,w,h);
  for(let i=0;i<26;i++){c.fillStyle=`rgba(230,238,255,${(.25+r()*.5).toFixed(2)})`;c.fillRect(x0+r()*w,y0+r()*(hz-y0-14),1.2,1.2);}
  const mg=c.createRadialGradient(x0+w*.74,y0+h*.2,2,x0+w*.74,y0+h*.2,34);mg.addColorStop(0,'rgba(226,232,255,.95)');mg.addColorStop(.18,'rgba(200,214,255,.5)');mg.addColorStop(1,'rgba(150,170,255,0)');c.fillStyle=mg;c.fillRect(x0,y0,w,h*.6);
  const hg=c.createLinearGradient(0,hz-26,0,hz+3);hg.addColorStop(0,'rgba(120,110,200,0)');hg.addColorStop(1,'rgba(150,130,220,.4)');c.fillStyle=hg;c.fillRect(x0,hz-26,w,29);
  for(let x=x0-6;x<x1;){const tw=9+r()*14,th=8+r()*30;c.fillStyle='#0a0d1f';c.fillRect(x,hz-th,tw,th+2);
    for(let k=0;k<th/5;k++)if(r()<.5){c.fillStyle=r()<.7?'rgba(255,200,125,.8)':'rgba(170,205,255,.8)';c.fillRect(x+2+r()*(tw-4),hz-th+3+k*5,1.2,1.5);}x+=tw+1+r()*3;}
  c.fillStyle='#0a0d1f';c.fillRect(x0+w*.62,hz-46,7,48);c.fillRect(x0+w*.62+3,hz-54,1.2,8);
  for(let i=0;i<150;i++){const v=r(),y=hz+4+v*v*(y1-hz-4),x=x0+r()*w;c.fillStyle=r()<.55?'rgba(255,196,118,.75)':r()<.8?'rgba(200,222,255,.7)':'rgba(255,110,90,.7)';c.globalAlpha=.3+v*.6;c.fillRect(x,y,1+v*1.1,1+v*.9);}
  c.globalAlpha=1;
  for(let i=0;i<16;i++){const u=i/15,x=x0+w*.18+u*w*.5,y=hz+8+u*u*(y1-hz-14);c.fillStyle=i%2?'rgba(255,230,190,.85)':'rgba(255,90,80,.8)';c.fillRect(x,y,1.6+u*1.4,1.2+u);}
  c.fillStyle='rgba(190,210,255,.05)';c.beginPath();c.moveTo(x0+w*.16,y0);c.lineTo(x0+w*.34,y0);c.lineTo(x0+w*.1,y1);c.lineTo(x0-w*.08,y1);c.closePath();c.fill();
  c.beginPath();c.moveTo(x0+w*.5,y0);c.lineTo(x0+w*.58,y0);c.lineTo(x0+w*.34,y1);c.lineTo(x0+w*.26,y1);c.closePath();c.fill();
  c.restore();
  // the frame: black steel with a brass edge, and the mullions
  c.strokeStyle='#080b13';c.lineWidth=5;c.strokeRect(x0,y0,w,h);c.strokeStyle=LM.gold;c.lineWidth=1.2;c.strokeRect(x0-2.6,y0-2.6,w+5.2,h+5.2);
  const ms=[];for(let i=1;i<win.cols;i++)ms.push(i/win.cols);c.fillStyle='#080b13';for(const f of ms)c.fillRect(x0+w*f-2,y0,4,h);c.fillRect(x0,y0+h*.62-2,w,4);
  c.fillStyle='rgba(201,162,90,.5)';for(const f of ms)c.fillRect(x0+w*f-2,y0,.8,h);
  c.fillStyle='#0a0d17';c.fillRect(x0-8,y1+4,w+16,6);c.fillStyle='rgba(201,162,90,.6)';c.fillRect(x0-8,y1+4,w+16,1.2);
  return hz;}
function paintLobby(c){
  const G=LG,far=G.far,yB=G.yB,ox=G.ox,X0=-140,X1=W+220,L=RC.x0,T=RC.y0,VW=RC.w,wt=46,bt=yB-34;
  const rect=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);},pl=pts=>{c.beginPath();c.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)c.lineTo(pts[i].x,pts[i].y);c.closePath();c.fill();};
  const glow=(x,y,r,rgb,a)=>{const g=c.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(1,`rgba(${rgb},0)`);c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);};
  const lin=(x0,y0,x1,y1,stops)=>{const g=c.createLinearGradient(x0,y0,x1,y1);for(const [o,col] of stops)g.addColorStop(o,col);return g;};
  // ---- the wall: dark navy, fins with an amber strip let into every third groove, a cove of light under the ceiling
  c.fillStyle=lin(0,T,0,yB,[[0,'#070a12'],[.2,'#0f1525'],[.5,'#1c2640'],[1,'#27335a']]);c.fillRect(L-40,T-40,VW+80,yB-T+44);
  const strips=[];
  for(let x=-150,i=0;x<W+240;x+=44,i++){
    rect(x,wt,41,bt-wt,i%2?'rgba(120,150,230,.035)':'rgba(0,0,0,.07)');rect(x+41,wt,3,bt-wt,'#080b13');rect(x,wt,1.2,bt-wt,'rgba(150,180,255,.12)');
    if(i%3===0){strips.push(x+42.7);c.fillStyle=lin(x-10,0,x+30,0,[[0,'rgba(255,190,110,0)'],[.5,'rgba(255,190,110,.13)'],[1,'rgba(255,190,110,0)']]);c.fillRect(x-10,wt+6,40,bt-wt-12);
      rect(x+42,wt+8,1.4,bt-wt-16,'rgba(255,208,140,.9)');}}
  rect(L-40,T-40,VW+80,wt-T+40,'#05070d');rect(L-40,wt-3,VW+80,3,'#0a0d17');rect(L-40,wt-1,VW+80,1.4,'rgba(255,200,130,.75)');
  c.fillStyle=lin(0,wt,0,wt+46,[[0,'rgba(255,190,110,.2)'],[1,'rgba(255,190,110,0)']]);c.fillRect(L-40,wt,VW+80,46);
  for(let x=-150;x<W+240;x+=132)rect(x,T-40,6,wt-T+37,'#090c14');
  // the stone base of the wall, with a brass line on it
  rect(X0,bt,X1-X0,yB-bt,'#192236');rect(X0,bt,X1-X0,1.6,'rgba(201,162,90,.8)');rect(X0,bt+1.6,X1-X0,7,'rgba(255,255,255,.05)');
  c.strokeStyle='rgba(5,8,14,.6)';c.lineWidth=1;c.beginPath();for(let x=-100;x<W+240;x+=88){c.moveTo(x,bt+2);c.lineTo(x,yB);}c.stroke();
  // ---- the floor: slabs of dark blue marble with fine gold veins, laid in a running bond
  {const r=mulberry32(61),SX=110,SD=66;
   for(let d=-90,k=0;d<far;d+=SD,k++)for(let x=X0-(k%2)*SX/2,j=0;x<X1;x+=SX,j++){
     const t=clamp((d+90+SD/2)/(far+90),0,1),sh=(r()-.5)*8,e=Math.min(d+SD,far);
     c.fillStyle=`rgb(${(lerp(40,80,t)+sh)|0},${(lerp(49,92,t)+sh)|0},${(lerp(70,126,t)+sh)|0})`;pl([P(x,GB,d),P(x+SX+.7,GB,d),P(x+SX+.7,GB,e+.7),P(x,GB,e+.7)]);
     if(r()<.8){c.strokeStyle='rgba(222,194,132,.2)';c.lineWidth=.8;c.beginPath();let vx=x+r()*SX,vd=d+r()*SD;const a=P(vx,GB,vd);c.moveTo(a.x,a.y);
       for(let n=0;n<4;n++){vx+=(r()-.5)*46;vd=clamp(vd+(r()-.5)*30,d,e);const q=P(clamp(vx,x,x+SX),GB,vd);c.lineTo(q.x,q.y);}c.stroke();}
     if(r()<.35){c.strokeStyle='rgba(255,255,255,.05)';c.lineWidth=2.6;c.beginPath();const a=P(x+r()*SX,GB,d+r()*SD),b=P(x+r()*SX,GB,d+r()*SD);c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}}
   // the seams, and a gold line let into some of them
   c.strokeStyle='rgba(5,8,15,.55)';c.lineWidth=1;c.beginPath();
   for(let d=-90,k=0;d<far;d+=SD,k++){const a=P(X0,GB,d),b=P(X1,GB,d);c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);for(let x=X0-(k%2)*SX/2;x<X1;x+=SX){const q=P(x,GB,d),e=P(x,GB,Math.min(d+SD,far));c.moveTo(q.x,q.y);c.lineTo(e.x,e.y);}}c.stroke();
   c.strokeStyle='rgba(201,162,90,.22)';c.lineWidth=.9;c.beginPath();for(let d=-90+SD*2;d<far;d+=SD*2){const a=P(X0,GB,d),b=P(X1,GB,d);c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);}c.stroke();
   // the ring let into the floor, echoing the one on the wall, and its off-centre mark
   {const cx=470,cd=94,rx=112,rz=78;c.strokeStyle='rgba(222,190,120,.42)';c.lineWidth=1.8;c.beginPath();
    for(let a=.45,i=0;a<=TAU-.35;a+=.08,i++){const q=P(cx+rx*Math.cos(a),GB,cd+rz*Math.sin(a));i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y);}c.stroke();
    c.lineWidth=.9;c.strokeStyle='rgba(222,190,120,.26)';c.beginPath();for(let a=0,i=0;a<=TAU+.01;a+=.08,i++){const q=P(cx+(rx-16)*Math.cos(a),GB,cd+(rz-11)*Math.sin(a));i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y);}c.stroke();
    const m=P(cx+(rx+8)*Math.cos(.05),GB,cd+(rz+4)*Math.sin(.05));c.fillStyle='rgba(240,213,150,.6)';c.beginPath();c.ellipse(m.x,m.y,5,2.6,0,0,TAU);c.fill();}
   // a dark stone threshold before the executive's door
   c.fillStyle='rgba(8,11,19,.72)';pl([P(EXEC_DOOR.x-62,GB,far),P(EXEC_DOOR.x+62,GB,far),P(EXEC_DOOR.x+62,GB,far-24),P(EXEC_DOOR.x-62,GB,far-24)]);
   c.strokeStyle='rgba(201,162,90,.5)';c.lineWidth=1;c.beginPath();{const a=P(EXEC_DOOR.x-62,GB,far-24),b=P(EXEC_DOOR.x+62,GB,far-24);c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);}c.stroke();
   // the polish: light from the strips and the windows lying on the stone, and the room darkening toward the front
   for(const sx of strips){const a=P(sx-ox,GB,far),b=P(sx-ox,GB,far-58);c.fillStyle=lin(0,a.y,0,b.y,[[0,'rgba(255,196,120,.2)'],[1,'rgba(255,196,120,0)']]);c.fillRect(a.x-1.6,a.y,3.2,b.y-a.y);}
   for(const w of [G.winA,G.winB]){const cx=(w.x0+w.x1)/2-ox;c.fillStyle=lin(0,yB,0,yB+80,[[0,'rgba(120,160,255,.14)'],[1,'rgba(120,160,255,0)']]);pl([P(cx-50,GB,far),P(cx+50,GB,far),P(cx+100,GB,far-70),P(cx-20,GB,far-70)]);}
   c.fillStyle=lin(0,yB,0,H+60,[[0,'rgba(0,0,0,.04)'],[.55,'rgba(0,0,0,.12)'],[1,'rgba(0,0,0,.4)']]);pl([P(X0,GB,far),P(X1,GB,far),{x:prjX(X1,-90),y:H+90},{x:prjX(X0,-90),y:H+90}]);}
  rect(X0,yB-1,X1-X0,3,'rgba(4,6,12,.65)');
  // ---- the windows: the night far below
  lobbySky(c,G.winA,11);lobbySky(c,G.winB,29);
  for(const w of [G.winA,G.winB])glow((w.x0+w.x1)/2,(w.y0+w.y1)/2,110,'110,150,255',.1);
  // ---- the feature wall behind the reception desk: slate with a thread of gold, the HALLORAN ring lit from above
  {const x0=300,x1=588,top=96;
   c.fillStyle=lin(0,top,0,yB,[[0,'#202a46'],[1,'#2f3b60']]);c.fillRect(x0,top,x1-x0,bt-top);
   const r=mulberry32(5);c.strokeStyle='rgba(214,184,120,.2)';c.lineWidth=.8;c.beginPath();
   for(let i=0;i<9;i++){let x=x0+r()*(x1-x0),y=top+r()*20;c.moveTo(x,y);for(let k=0;k<7;k++){x+=(r()-.45)*26;y+=14+r()*14;c.lineTo(x,y);}}c.stroke();
   rect(x0-3,top-3,x1-x0+6,3,'#080b13');rect(x0-3,top-3,x1-x0+6,1,'rgba(201,162,90,.8)');rect(x0-3,top,3,bt-top,'#080b13');rect(x1,top,3,bt-top,'#080b13');
   rect(x0,top,1.4,bt-top,'rgba(255,208,140,.7)');rect(x1-1.4,top,1.4,bt-top,'rgba(255,208,140,.7)');
   const cx=(x0+x1)/2,cy=top+68,R=40;
   c.fillStyle=lin(0,top,0,top+150,[[0,'rgba(255,214,150,.2)'],[1,'rgba(255,214,150,0)']]);c.beginPath();c.moveTo(cx-6,top);c.lineTo(cx+6,top);c.lineTo(cx+70,top+150);c.lineTo(cx-70,top+150);c.closePath();c.fill();
   glow(cx,cy,92,'255,200,120',.14);
   c.strokeStyle=LM.gold;c.lineWidth=2.6;c.beginPath();c.arc(cx,cy,R,.35,TAU-.5);c.stroke();
   c.lineWidth=.9;c.strokeStyle='rgba(240,213,150,.55)';c.beginPath();c.arc(cx,cy,R-8,0,TAU);c.stroke();
   c.fillStyle=LM.goldL;c.beginPath();c.arc(cx+R*Math.cos(-.08)+9,cy+R*Math.sin(-.08)-8,5.2,0,TAU);c.fill();c.fillRect(cx-1,cy-R+4,2,R-6);
   c.fillStyle=LM.gold;c.textAlign='center';c.font='700 13px "Alegreya SC",Georgia,serif';
   [...'HALLOWELL'].forEach((ch,i)=>c.fillText(ch,cx+(i-4)*15.5,cy+R+34));rect(cx-70,cy+R+42,140,1,'rgba(201,162,90,.5)');}
  // ---- the reception desk: black stone with a backlit edge
  {const x0=272,x1=538,dF=196,dB=224,h=46,t0=P(x0,GB-h,dF),t1=P(x1,GB-h,dF),b0=P(x0,GB-h,dB),b1=P(x1,GB-h,dB),f0=P(x0,GB,dF),f1=P(x1,GB,dF),g1=P(x1,GB,dB);
   c.fillStyle='rgba(2,4,9,.45)';pl([f0,f1,P(x1+16,GB,dF-10),P(x0-16,GB,dF-10)]);
   c.fillStyle='#161d30';pl([t0,t1,b1,b0]);
   c.fillStyle='#0b101c';pl([P(x1,GB-h,dF),b1,g1,f1]);
   c.fillStyle=lin(0,t0.y,0,f0.y,[[0,'#3a4770'],[.12,'#28335a'],[1,'#1c2540']]);pl([t0,t1,f1,f0]);
   c.strokeStyle='rgba(214,184,120,.16)';c.lineWidth=.8;c.beginPath();for(let x=x0+60;x<x1-20;x+=86){const a=P(x,GB-h,dF),b=P(x,GB,dF);c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);}c.stroke();
   c.fillStyle=lin(0,t0.y,0,t0.y+26,[[0,'rgba(255,214,150,.4)'],[1,'rgba(255,214,150,0)']]);pl([t0,t1,{x:t1.x,y:t1.y+26},{x:t0.x,y:t0.y+26}]);
   c.strokeStyle='rgba(255,236,190,.95)';c.lineWidth=1.6;c.beginPath();c.moveTo(t0.x,t0.y+.8);c.lineTo(t1.x,t1.y+.8);c.stroke();
   c.strokeStyle='rgba(255,196,120,.8)';c.lineWidth=1.2;c.beginPath();c.moveTo(f0.x,f0.y-3);c.lineTo(f1.x,f1.y-3);c.stroke();
   // two small brass lamps on it, a bowl of orchids
   for(const lx of [296,514]){const a=P(lx,GB-h,210),s=a.y;c.fillStyle=LM.gold;c.fillRect(a.x-1,s-15,2,15);c.fillStyle='#e6c887';c.beginPath();c.moveTo(a.x-7,s-14);c.quadraticCurveTo(a.x,s-24,a.x+7,s-14);c.closePath();c.fill();glow(a.x,s-12,34,'255,200,120',.3);}
   const o=P(405,GB-h,208);c.fillStyle='#10141f';c.fillRect(o.x-11,o.y-7,22,7);c.strokeStyle='#d9dfef';c.lineWidth=1.3;c.beginPath();for(const a of [-.6,-.2,.25,.6]){c.moveTo(o.x,o.y-7);c.lineTo(o.x+Math.sin(a)*13,o.y-20);}c.stroke();
   c.fillStyle='#f2f4fb';for(const a of [-.6,-.2,.25,.6]){c.beginPath();c.arc(o.x+Math.sin(a)*13,o.y-20,2.1,0,TAU);c.fill();}}
  // ---- a large canvas at the left: slate, a gold disc half under a black slash
  {const x0=22,y0=100,w=62,h=104;rect(x0-4,y0-4,w+8,h+8,'#080b13');rect(x0-4,y0-4,w+8,1,'rgba(201,162,90,.7)');rect(x0,y0,w,h,'#141b30');
   c.save();c.beginPath();c.rect(x0,y0,w,h);c.clip();c.fillStyle='#c9a25a';c.beginPath();c.arc(x0+w*.6,y0+h*.4,20,0,TAU);c.fill();c.fillStyle='rgba(120,70,30,.45)';c.beginPath();c.arc(x0+w*.6+6,y0+h*.4+5,16,0,TAU);c.fill();
   c.fillStyle='#070a12';c.beginPath();c.moveTo(x0-4,y0+h*.58);c.lineTo(x0+w+4,y0+h*.3);c.lineTo(x0+w+4,y0+h*.5);c.lineTo(x0-4,y0+h*.8);c.closePath();c.fill();
   c.fillStyle='#5a1f2c';c.fillRect(x0,y0+h*.84,w,5);c.restore();
   c.fillStyle=lin(0,y0-30,0,y0+50,[[0,'rgba(255,214,150,.2)'],[1,'rgba(255,214,150,0)']]);c.beginPath();c.moveTo(x0+w/2-4,y0-30);c.lineTo(x0+w/2+4,y0-30);c.lineTo(x0+w+22,y0+h);c.lineTo(x0-22,y0+h);c.closePath();c.fill();
   rect(x0+w/2-12,y0-14,24,4,LM.gold);}
  // ---- the lift: set into the wall, brass-lit, the doors shut (they open live)
  {const A=LOBBY_LIFT,cx=G.liftX,top=yB-A.h-A.hd;
   rect(cx-A.w/2-A.fr-9,top-9,A.w+2*A.fr+18,yB-top+9,'#080b13');rect(cx-A.w/2-A.fr-9,top-9,A.w+2*A.fr+18,1.2,'rgba(201,162,90,.7)');
   glow(cx,top-4,76,LM.amber,.16);
   liftFrame(c,cx,yB,A.w,A.h,A.fr,A.hd);liftDoors(c,cx,yB,A.w,A.h,0);liftLine(c,cx,yB,A.w,A.h,.5);
   const bx=cx+A.w/2+A.fr+10;rect(bx,yB-92,9,22,'#080b13');c.fillStyle='rgba(255,196,120,.9)';c.fillRect(bx+2.5,yB-87,4,4);c.fillStyle='rgba(150,170,200,.6)';c.fillRect(bx+2.5,yB-79,4,4);}
  // ---- the executive's door: a tall portal in dark stone with brass, sconces either side, a plaque and a keypad. The opening itself is drawn live.
  {const x0=G.dx0,x1=G.dx1,top=G.dTop,w=x1-x0,cx=(x0+x1)/2;
   glow(cx,top-4,120,LM.amber,.18);
   c.fillStyle=lin(0,wt,0,yB,[[0,'rgba(255,214,150,.22)'],[1,'rgba(255,214,150,0)']]);c.beginPath();c.moveTo(cx-7,wt+2);c.lineTo(cx+7,wt+2);c.lineTo(x1+56,yB-8);c.lineTo(x0-56,yB-8);c.closePath();c.fill();
   rect(x0-22,top-26,w+44,yB-top+26,'#0b101b');
   c.fillStyle=lin(x0-22,0,x0-9,0,[[0,'#202a44'],[1,'#141b2e']]);c.fillRect(x0-22,top-14,13,yB-top+14);c.fillStyle=lin(x1+9,0,x1+22,0,[[0,'#141b2e'],[1,'#202a44']]);c.fillRect(x1+9,top-14,13,yB-top+14);
   c.strokeStyle='rgba(0,0,0,.45)';c.lineWidth=1;c.beginPath();for(const px of [x0-18,x0-13,x1+13,x1+18]){c.moveTo(px,top-10);c.lineTo(px,yB-6);}c.stroke();
   rect(x0-30,top-38,w+60,12,'#1a2238');rect(x0-30,top-38,w+60,1.4,'rgba(255,214,150,.45)');rect(x0-30,top-27,w+60,1.4,LM.gold);
   rect(x0-9,top-9,w+18,yB-top+9,'#04060b');
   c.strokeStyle='rgba(201,162,90,.85)';c.lineWidth=1.2;c.strokeRect(x0-9.6,top-9.6,w+19.2,yB-top+9.6);
   c.strokeStyle=LM.gold;c.lineWidth=1.6;c.beginPath();c.arc(cx,top-16,5,.3,TAU-.4);c.stroke();c.fillStyle=LM.goldL;c.fillRect(cx+4,top-21,2,2);
   rect(x0-22,yB-3,w+44,3,LM.gold);
   // sconces: a brass bar with frosted glass and a warm halo up and down the wall
   for(const sx of [x0-48,x1+48]){const sy=top+34;glow(sx,sy+16,56,LM.amber,.34);
     c.fillStyle=lin(0,sy-40,0,sy+72,[[0,'rgba(255,200,130,0)'],[.35,'rgba(255,200,130,.18)'],[1,'rgba(255,200,130,0)']]);c.fillRect(sx-17,sy-40,34,112);
     rect(sx-2.4,sy-2,4.8,38,'#0a0d17');rect(sx-1.2,sy,2.4,34,'#fbe3b0');rect(sx-5,sy-4,10,3,LM.gold);rect(sx-5,sy+34,10,3,LM.gold);}
   // the plaque (brass, engraved lines) and the keypad (a dark plate, twelve keys, a red light drawn live)
   rect(x1+30,top+104,34,15,LM.goldD);rect(x1+31,top+105,32,13,LM.gold);c.fillStyle='rgba(60,40,10,.55)';c.fillRect(x1+35,top+109,24,1.2);c.fillRect(x1+39,top+113,16,1.2);
   const k=G.kp;rect(k.x-8,k.y-6,16,36,'#080b13');rect(k.x-8,k.y-6,16,1,'rgba(201,162,90,.6)');c.fillStyle='rgba(190,205,235,.55)';
   for(let i=0;i<12;i++)c.fillRect(k.x-5.5+(i%3)*4.4,k.y+4+Math.floor(i/3)*4.6,2.6,2.6);}
  // ---- a camera on a bracket high on the wall, looking down at the room
  {const q=G.cam;rect(q.x-1.5,q.y-14,3,12,'#0a0d17');rect(q.x-8,q.y-4,16,9,'#0b0f19');rect(q.x-8,q.y-4,16,1,'rgba(180,200,240,.4)');rect(q.x-12,q.y-2,5,6,'#05070d');c.fillStyle='#1a2236';c.beginPath();c.arc(q.x-11,q.y+1,1.8,0,TAU);c.fill();}
}
// ---------- what moves: the lift's doors, little lights ----------
// how far the lift's doors are open (0 shut, 1 open): they open as the heroes come out of it and close again behind them, and they open
// for every henchman who comes out of it in crew mode
function lobbyLiftOpen(){
  let o=0;const t0=S.liftT0;if(t0!=null){const u=S.t-t0;o=u<.25?0:u<.8?sstep((u-.25)/.55):u<1.3?1:1-sstep((u-1.3)/.6);}
  return Math.max(o,crewDoorOpen('lobby'));}
S.liftT0=null;
V11.step.push(()=>{const T=S.stage.tr;if(S.room==='lobby'&&T&&T.step==='enter'&&S.liftT0==null)S.liftT0=T.t0;});
V11.duelStart.push(()=>{S.liftT0=null;});
function drawLobbyLive(){
  const A=LOBBY_LIFT,G=LG,t=S.t,o=lobbyLiftOpen();
  if(o>.004){liftCabin(ctx,G.liftX,G.yB,A.w,A.h);liftDoors(ctx,G.liftX,G.yB,A.w,A.h,o);liftSpill(ctx,A.x,G.far,A.w,o*.85,176);}
  // the camera's red light, the keypad's, and the beacon on the tallest tower blink
  ctx.save();ctx.globalCompositeOperation='lighter';
  const still=reduceMotion,on=still?.7:t%2.2<.5?1:.18;ctx.fillStyle=`rgba(255,50,40,${(.9*on).toFixed(2)})`;ctx.fillRect(G.cam.x-12,G.cam.y,2,2);
  if(on>.5){const g=ctx.createRadialGradient(G.cam.x-11,G.cam.y+1,0,G.cam.x-11,G.cam.y+1,9);g.addColorStop(0,'rgba(255,60,40,.5)');g.addColorStop(1,'rgba(255,60,40,0)');ctx.fillStyle=g;ctx.fillRect(G.cam.x-20,G.cam.y-8,18,18);}
  // the keypad dies with the door
  if(!(S.breach&&S.breach.blown)){ctx.fillStyle=`rgba(255,60,50,${((still?.7:.5+.4*Math.sin(t*2.6))*.9).toFixed(2)})`;ctx.fillRect(G.kp.x-1.2,G.kp.y-3.6,2.4,1.8);}
  const b=G.winA,hz=b.y0+(b.y1-b.y0)*.56;ctx.fillStyle=`rgba(255,70,60,${(still?.6:t%1.7<.3?.95:.12).toFixed(2)})`;ctx.fillRect(b.x0+(b.x1-b.x0)*.62+2.4,hz-56,2,2);
  ctx.restore();
  drawExecDoor();
  // the sconces' warm light lies on the closed leaves, strongest low down, so whoever stands in front of the door still reads against it
  if(!S.breach){
    if(!G.wash){const g=ctx.createLinearGradient(0,G.dTop,0,G.yB);g.addColorStop(0,'rgba(255,190,120,.03)');g.addColorStop(.5,'rgba(255,190,120,.11)');g.addColorStop(1,'rgba(255,190,120,.24)');G.wash=g;}
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=G.wash;ctx.fillRect(G.dx0,G.dTop,G.dx1-G.dx0,G.yB-G.dTop);ctx.restore();}
}
// ---------- furniture ----------
// the prop's own frame: u runs across (0 left foot, 1 right foot), v up (0 the floor, 1 the top); a block is a box in it
function lobbyFrame(Pp){const p=Pp.pts;return(u,v,d)=>P(lerp(lerp(p[2].x,p[3].x,u),lerp(p[0].x,p[1].x,u),v),lerp(lerp(p[2].y,p[3].y,u),lerp(p[0].y,p[1].y,u),v),d);}
function lobbyBlock(q,u0,u1,v0,v1,fz,bz,cf,ct,cs){
  if(cs&&bz>fz){ctx.fillStyle=cs;poly([q(u1,v0,fz),q(u1,v1,fz),q(u1,v1,bz),q(u1,v0,bz)]);}
  if(ct&&bz>fz){ctx.fillStyle=ct;poly([q(u0,v1,fz),q(u1,v1,fz),q(u1,v1,bz),q(u0,v1,bz)]);}
  ctx.fillStyle=cf;poly([q(u0,v0,fz),q(u1,v0,fz),q(u1,v1,fz),q(u0,v1,fz)]);}
const lobbyLine=(q,u0,v0,u1,v1,d,w,col)=>{seg(q(u0,v0,d),q(u1,v1,d),w,col);};
Object.assign(PROP_DRAW,{
  lounger(Pp){const q=lobbyFrame(Pp),d=Pp.dep,L=LM;ctx.lineCap='round';
    for(const u of [.1,.9])lobbyBlock(q,u-.03,u+.03,0,.16,d-9,d-6,L.gold,null,null);
    lobbyBlock(q,.13,.87,.4,1,d+7,d+14,'#6a2535','#8a3a4c','#3c1019');
    lobbyBlock(q,.12,.88,.14,.46,d-12,d+10,'#7c2f40','#a04458','#4a1822');
    for(const u of [0,.82])lobbyBlock(q,u,u+.18,.12,.68,d-14,d+13,'#5e2030','#8a3a4c','#34111a');
    lobbyLine(q,.12,.46,.88,.46,d-12,1.4,'rgba(0,0,0,.35)');lobbyLine(q,.02,.68,.16,.68,d-14,1.4,L.goldL);lobbyLine(q,.84,.68,.98,.68,d-14,1.4,L.goldL);lobbyLine(q,.14,.17,.86,.17,d-12,1.2,L.gold);
    ctx.fillStyle='rgba(255,220,225,.5)';for(const [u,v] of [[.3,.8],[.5,.8],[.7,.8],[.4,.62],[.6,.62]]){const s=q(u,v,d+7);ctx.beginPath();ctx.arc(s.x,s.y,1.1,0,TAU);ctx.fill();}},
  sofa(Pp){const q=lobbyFrame(Pp),d=Pp.dep,L=LM,C='#33405c',CL='#4a5a7e',CT='#5b6d94',CD='#1c2438';ctx.lineCap='round';
    for(const u of [.04,.96])lobbyBlock(q,u-.015,u+.015,0,.14,d-10,d-7,L.gold,null,null);
    lobbyBlock(q,.02,.98,.42,1,d+6,d+14,C,CT,CD);
    lobbyBlock(q,.02,.98,.12,.4,d-13,d+13,'#2a3550','#415075',CD);
    for(const [a,b] of [[.08,.5],[.5,.92]]){lobbyBlock(q,a,b-.005,.4,.52,d-13,d+8,CL,CT,CD);lobbyBlock(q,a+.01,b-.015,.52,.97,d+2,d+8,C,CT,CD);}
    for(const u of [0,.93])lobbyBlock(q,u,u+.07,.1,.7,d-14,d+13,'#2a3550',CT,CD);
    lobbyLine(q,.02,.4,.98,.4,d-13,1.2,L.gold);lobbyLine(q,0,.7,.07,.7,d-14,1.2,L.gold);lobbyLine(q,.93,.7,1,.7,d-14,1.2,L.gold);},
  pouf(Pp){const p=Pp.pts,d=Pp.dep,L=LM,a=propAng(Pp),q=lobbyFrame(Pp),t0=q(.5,1,d),rx=Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y)/2+1;
    ctx.fillStyle='#34111a';poly([q(0,0,d),q(1,0,d),q(1,1,d),q(0,1,d)]);ctx.fillStyle='#5a1f2c';poly([q(.02,.1,d),q(.98,.1,d),q(.96,.96,d),q(.04,.96,d)]);
    ctx.fillStyle=L.gold;poly([q(.02,.14,d),q(.98,.14,d),q(.98,.2,d),q(.02,.2,d)]);
    ctx.fillStyle='#7c2f40';ctx.beginPath();ctx.ellipse(t0.x,t0.y,rx,6.4,a,0,TAU);ctx.fill();ctx.fillStyle='#9a4458';ctx.beginPath();ctx.ellipse(t0.x,t0.y-.6,rx-3,4.6,a,0,TAU);ctx.fill();
    ctx.fillStyle='#4a1622';ctx.beginPath();ctx.arc(t0.x,t0.y-.4,1.5,0,TAU);ctx.fill();},
  sidetable(Pp){const q=lobbyFrame(Pp),p=Pp.pts,d=Pp.dep,L=LM,a=propAng(Pp),t0=q(.5,1,d),rx=Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y)/2+1;ctx.lineCap='round';
    lobbyLine(q,.5,0,.5,1,d+6,2.2,'#7a5f2e');lobbyLine(q,.1,0,.06,1,d-5,2.6,L.gold);lobbyLine(q,.9,0,.94,1,d-5,2.6,L.gold);
    ctx.strokeStyle=L.goldD;ctx.lineWidth=1.4;ctx.beginPath();const s=q(.5,.24,d);ctx.ellipse(s.x,s.y,rx*.8,3.6,a,0,TAU);ctx.stroke();
    ctx.fillStyle='#0b101c';ctx.beginPath();ctx.ellipse(t0.x,t0.y+2.4,rx,6.6,a,0,TAU);ctx.fill();ctx.fillStyle='#1a2236';ctx.beginPath();ctx.ellipse(t0.x,t0.y,rx,6.4,a,0,TAU);ctx.fill();
    ctx.strokeStyle=L.gold;ctx.lineWidth=1.3;ctx.stroke();ctx.strokeStyle='rgba(190,215,255,.35)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(t0.x-rx*.5,t0.y-.6);ctx.lineTo(t0.x-rx*.1,t0.y-3.2);ctx.stroke();},
  planter(Pp){const p=Pp.pts,d=Pp.dep,L=LM,c0={x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2},pt=p[4],ang=Math.atan2(pt.y-c0.y,pt.x-c0.x),q=lobbyFrame(Pp),fr=d-4,rx=Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y)/2+1;
    // the leaves first, then the pot over their roots
    const o=at(c0,d);ctx.lineCap='round';
    for(let i=0;i<13;i++){const k=i-6,a=ang+k*.115+(reduceMotion?0:Math.sin(S.t*1.1+i+Pp.dep)*.012),l=40+((i*5)%4)*10+(6-Math.abs(k))*3,e={x:o.x+Math.cos(a)*l,y:o.y+Math.sin(a)*l},m={x:o.x+Math.cos(a)*l*.55+Math.cos(a+1.5708)*k*1.2,y:o.y+Math.sin(a)*l*.55+Math.sin(a+1.5708)*k*1.2};
      ctx.strokeStyle=i%3?'#1b362f':'#23483c';ctx.lineWidth=3.6;ctx.beginPath();ctx.moveTo(o.x,o.y);ctx.quadraticCurveTo(m.x,m.y,e.x,e.y);ctx.stroke();
      if(i%2){ctx.strokeStyle='rgba(120,190,160,.35)';ctx.lineWidth=1;ctx.stroke();}}
    ctx.fillStyle='#232b3d';poly([q(.03,1,fr),q(.97,1,fr),q(.86,0,fr),q(.14,0,fr)]);ctx.fillStyle='rgba(255,255,255,.06)';poly([q(.1,.9,fr),q(.3,.9,fr),q(.26,.05,fr),q(.14,.05,fr)]);
    ctx.fillStyle='#10141f';poly([q(.86,0,fr),q(.97,1,fr),q(.97,.88,fr),q(.88,0,fr)]);
    ctx.fillStyle=L.gold;poly([q(.04,.9,fr),q(.96,.9,fr),q(.96,.97,fr),q(.04,.97,fr)]);poly([q(.15,.04,fr),q(.85,.04,fr),q(.86,0,fr),q(.14,0,fr)]);
    const tp=q(.5,1,fr);ctx.fillStyle='#1a120c';ctx.beginPath();ctx.ellipse(tp.x,tp.y,rx-1,3.4,propAng(Pp),0,TAU);ctx.fill();},
  plinth(Pp){const q=lobbyFrame(Pp),d=Pp.dep,L=LM;
    lobbyBlock(q,.04,.96,.05,.96,d-9,d+9,'#8a92a9','#b9c0d2','#5a617a');
    lobbyBlock(q,0,1,0,.06,d-11,d+11,'#747d96','#a3abc0','#4a5068');lobbyBlock(q,-.02,1.02,.94,1,d-11,d+11,'#a9b0c4','#cfd5e4','#6a728a');
    lobbyLine(q,.04,.9,.96,.9,d-9,1.2,L.gold);lobbyLine(q,.1,.06,.1,.9,d-9,1,'rgba(255,255,255,.25)');lobbyLine(q,.9,.06,.9,.9,d-9,1,'rgba(40,50,80,.35)');}});
// ---------- the glass coffee table: brass corners, a smoked shelf and a thick glass top ----------
function drawLobbyTable(){
  const T=S.table,Q=T.pts,fr=T.dep-TD,bk=T.dep+TD,L=LM,q=(u,v,d)=>P(lerp(lerp(Q[3].x,Q[2].x,u),lerp(Q[0].x,Q[1].x,u),v),lerp(lerp(Q[3].y,Q[2].y,u),lerp(Q[0].y,Q[1].y,u),v),d),quad=(a,b,c2,d2,col)=>{ctx.fillStyle=col;poly([a,b,c2,d2]);};
  ctx.lineCap='round';ctx.lineJoin='round';
  for(const u of [.06,.94])seg(q(u,.96,bk-4),q(u,0,bk-4),2.6,'#7a5f2e');
  quad(q(.02,.24,fr+4),q(.98,.24,fr+4),q(.98,.24,bk-4),q(.02,.24,bk-4),'rgba(14,20,36,.78)');seg(q(.02,.24,fr+4),q(.98,.24,fr+4),1.4,'rgba(201,162,90,.7)');
  for(const u of [.06,.94])seg(q(u,.96,fr+4),q(u,0,fr+4),3,L.gold);
  quad(q(0,1,fr),q(1,1,fr),q(1,1,bk),q(0,1,bk),'rgba(168,214,236,.3)');
  quad(q(0,1,fr),q(1,1,fr),q(1,.9,fr),q(0,.9,fr),'rgba(150,220,235,.72)');seg(q(0,1,fr),q(1,1,fr),1.2,'rgba(235,252,255,.9)');
  ctx.strokeStyle='rgba(255,255,255,.28)';ctx.lineWidth=1;ctx.beginPath();{const a=q(.14,1,fr+8),b=q(.3,1,bk-8),c3=q(.34,1,fr+8),d3=q(.5,1,bk-8);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.moveTo(c3.x,c3.y);ctx.lineTo(d3.x,d3.y);}ctx.stroke();
}
// a frosted partition slice: black stone below, frosted glass in a brass frame above
function drawFrostSlice(it){
  const w=it.dv,A=it.a,B=it.b,xl=divL(w),xr=divR(w),g=S.arena.ground(w.x,(A+B)/2),h=w.h,yt=g-h,base=g-44,L=LM;
  const face=(x,y0,y1,col)=>{ctx.fillStyle=col;poly([divPt(w,x,y0,A),divPt(w,x,y1,A),divPt(w,x,y1,B),divPt(w,x,y0,B)]);};
  face(xr,g,base,'#151c2f');face(xr,base+2,base,L.gold);face(xr,g-6,g-8,'rgba(201,162,90,.5)');
  face(xr,base,yt,'rgba(206,222,246,.5)');face(xr,yt+36,yt+24,'rgba(206,222,246,.14)');
  ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=1;ctx.beginPath();
  for(let d=Math.ceil(w.d0/22)*22+6;d<=w.d1;d+=22){if(d<A||d>B)continue;const a=divPt(w,xr,base-3,d),b=divPt(w,xr,yt+6,d+3);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();
  ctx.strokeStyle=L.gold;ctx.lineWidth=1.6;ctx.beginPath();for(let d=Math.ceil(w.d0/42)*42;d<=w.d1;d+=42){if(d<A||d>B)continue;const a=divPt(w,xr,base,d),b=divPt(w,xr,yt,d);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();
  ctx.lineWidth=2.4;ctx.beginPath();{const a=divPt(w,xr,yt,A),b=divPt(w,xr,yt,B);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();
  if(it.first||it.last){const d=it.first?A:B;ctx.fillStyle='#10152a';poly([divPt(w,xl,g,d),divPt(w,xl,base,d),divPt(w,xr,base,d),divPt(w,xr,g,d)]);ctx.fillStyle=L.gold;poly([divPt(w,xl,base,d),divPt(w,xl,yt,d),divPt(w,xl+2.4,yt,d),divPt(w,xl+2.4,base,d)]);}
  for(const m of w.marks){if(m.d<A||m.d>=B)continue;drawDivMark(w,m);}
}
V11UI.init.push(()=>{
  // ---- ware that only this room has: a decanter and tumblers of amber glass, white orchids in black pots, a glass orb in a gold stand
  const dw=drawWare;
  drawWare=it=>{
    const k=it.kind;if(k!=='decanter'&&k!=='tumbler'&&k!=='orchid'&&k!=='orb'){dw(it);return;}
    const q=P(it.x,it.y,it.dep);ctx.save();ctx.translate(q.x,q.y);ctx.rotate(it.ang);
    if(k==='decanter'){ctx.fillStyle='rgba(214,140,50,.88)';ctx.beginPath();ctx.moveTo(-5,4);ctx.quadraticCurveTo(-6,-2,-1.6,-5);ctx.lineTo(-1.2,-9);ctx.lineTo(1.2,-9);ctx.lineTo(1.6,-5);ctx.quadraticCurveTo(6,-2,5,4);ctx.closePath();ctx.fill();
      ctx.fillStyle='rgba(255,230,170,.5)';ctx.fillRect(-3.4,-2,1.3,5);ctx.fillStyle=LM.gold;ctx.beginPath();ctx.arc(0,-10.4,2,0,TAU);ctx.fill();}
    else if(k==='tumbler'){ctx.fillStyle='rgba(205,235,245,.4)';ctx.beginPath();ctx.moveTo(-3.2,-5);ctx.lineTo(3.2,-5);ctx.lineTo(2.6,3.4);ctx.lineTo(-2.6,3.4);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(214,140,50,.85)';ctx.fillRect(-2.7,-2,5.4,5);}
    else if(k==='orchid'){ctx.fillStyle='#10141f';ctx.beginPath();ctx.moveTo(-4.4,4);ctx.lineTo(-5,-1);ctx.lineTo(5,-1);ctx.lineTo(4.4,4);ctx.closePath();ctx.fill();ctx.fillStyle=LM.gold;ctx.fillRect(-5,-1.4,10,1.2);
      ctx.strokeStyle='#3f6b45';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,-1);ctx.quadraticCurveTo(-1,-9,-6,-12);ctx.moveTo(0,-1);ctx.quadraticCurveTo(2,-9,5,-14);ctx.stroke();
      ctx.fillStyle='#f4f6fc';for(const [x,y] of [[-6,-12],[-3,-9],[5,-14],[3,-10],[0,-12]]){ctx.beginPath();ctx.arc(x,y,1.9,0,TAU);ctx.fill();}ctx.fillStyle='#d9a0c0';ctx.fillRect(-.5,-12.5,1,1);}
    else{ctx.fillStyle=LM.gold;ctx.fillRect(-3.4,3.4,6.8,1.8);ctx.beginPath();ctx.ellipse(0,3.2,4,1.2,0,0,TAU);ctx.fill();
      ctx.fillStyle='rgba(150,205,240,.34)';ctx.beginPath();ctx.arc(0,-1.2,5.6,0,TAU);ctx.fill();ctx.strokeStyle='rgba(225,245,255,.8)';ctx.lineWidth=.8;ctx.stroke();ctx.fillStyle='rgba(255,255,255,.8)';ctx.beginPath();ctx.arc(-1.8,-3.2,1.2,0,TAU);ctx.fill();}
    ctx.restore();};
  // ---- the ring lamp: a thin gold ring of warm light on three wires
  const dl=drawLamp;
  drawLamp=L=>{
    if(L.kind!=='ring'){dl(L);return;}
    const p=L.p,a=P(L.x,L.ay,L.dep),q=P(p.x,p.y,L.dep),k=lampGlow(L),ang=L.fallen?(L.landed?1.2:S.t*6):-Math.atan2(p.x-L.x,p.y-L.ay);
    if(!L.fallen){ctx.strokeStyle='#0a0d17';ctx.lineWidth=1.1;ctx.beginPath();for(const s of [-1,0,1]){ctx.moveTo(a.x+s*1.5,a.y);ctx.lineTo(q.x+s*17,q.y-1.5+Math.abs(s)*1.6);}ctx.stroke();}
    ctx.save();ctx.translate(q.x,q.y);ctx.rotate(ang);
    if(k>0){const G=glowSprites();ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.15*k;ctx.drawImage(G.cone,-52,4,104,118);ctx.globalAlpha=.55*k;ctx.drawImage(G.dot,-40,-24,80,52);ctx.restore();}
    ctx.lineWidth=3.4;ctx.strokeStyle=L.lit?'#fff0cc':'#2c3246';ctx.beginPath();ctx.ellipse(0,1,20,5.6,0,0,TAU);ctx.stroke();
    ctx.lineWidth=1.3;ctx.strokeStyle=LM.gold;ctx.beginPath();ctx.ellipse(0,-1,21.6,6.4,0,Math.PI*1.05,Math.PI*1.95);ctx.stroke();ctx.beginPath();ctx.ellipse(0,3.4,21,6,0,.05,Math.PI-.05);ctx.stroke();
    ctx.restore();};
  // ---- frosted partitions are drawn here; broken, they leave a low stone stump with glass teeth, and cracks show white
  const ds=drawDivSlice,dr=drawDivRemains,dm=drawDivMark;
  drawDivSlice=it=>{if(it.dv.mat!=='frost'||it.dv.state==='broken'){ds(it);return;}drawFrostSlice(it);};
  drawDivRemains=(w,A,B,first,last)=>{if(w.mat!=='frost'){dr(w,A,B,first,last);return;}
    const R=w.rem||{h:8,teeth:[]},xl=divL(w),xr=divR(w),g=S.arena.ground(w.x,(A+B)/2),span=w.d1-w.d0,yAt=d=>{let y=R.h;for(const t of R.teeth){const u=(d-w.d0)/span;if(Math.abs(u-t[0])<.06)y=Math.max(y,t[1]*(1-Math.abs(u-t[0])/.06));}return g-y;};
    ctx.fillStyle='#161d30';const pts=[divPt(w,xr,g,A)];for(let d=A;d<=B+.01;d+=3)pts.push(divPt(w,xr,yAt(Math.min(d,B)),Math.min(d,B)));pts.push(divPt(w,xr,g,B));poly(pts);
    ctx.fillStyle='rgba(190,210,235,.3)';for(const t of R.teeth){const d=w.d0+t[0]*span;if(d<A||d>=B)continue;poly([divPt(w,xr,g-44,d-4),divPt(w,xr,g-t[1],d),divPt(w,xr,g-44,d+5)]);}
    if(first||last){const d=first?A:B;ctx.fillStyle='#161d30';poly([divPt(w,xl,g,d),divPt(w,xl,yAt(d),d),divPt(w,xr,yAt(d),d),divPt(w,xr,g,d)]);}};
  drawDivMark=(w,m)=>{if(w.mat!=='frost'){dm(w,m);return;}w.mat='glass';dm(w,m);w.mat='frost';};
  // ---- sounds: the lift's bell when the heroes step out of it, and when a henchman comes out of it
  const ph=S.hooks.phase;S.hooks.phase=step=>{if(step==='enter'&&S.room==='lobby'){S.hooks.sound('arrive',1);return;}ph(step);};
  const snd=S.hooks.sound;S.hooks.sound=(k,v)=>{if(k==='wood'&&S.room==='lobby'&&S.crew&&S.crew.doors.some(d=>d.kind==='lobby'&&S.t-d.t0<.02))k='arrive';snd(k,v);};
});
// ===== LOBBY UI END =====
