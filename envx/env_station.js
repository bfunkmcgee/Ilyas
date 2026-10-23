// ===== ENV STATION =====
// A station on Hallowell's private line, deep underground. A vault of glazed tile gone the colour of tea and smoke, ribbed in iron,
// over an island platform floored in old hexagon mosaic. Along the back wall the main line runs in its pit between two brick-lined
// tunnel portals; the train stands there, its deck at the platform's height. Elven crystal lamps in brass cages hang from the vault
// and stand on the wall, cyan and gold, a few of them dead. The goblins have been here a long time: a nest of rags and stolen things
// in the left-hand corner, their tallies scratched in the tiles above it, bones and scraps on the floor. In front, the platform's near
// edge and the siding's pit.
// The same station stands at both ends of the line, as S.stationEnd says ('tower' if it says nothing):
//   'lantern', the stop under the bistro: at the left end the kitchen's private lift comes down to its bottom landing, its steel doors
//     set into the tiles (they open with S.kitLift); at the right end only the wall and a barred service gate; the portals' signs read
//     OLD LINE (left) and TOWER (right).
//   'tower', the deep station under the tower: at the left end a sealed iron service door where the lift would be; at the right end a
//     caged freight lift goes up to the tower, an iron shaft with a counterweight and a brass call panel (its gate opens with S.lift,
//     the cage climbs with S.liftY); the signs read LANTERN (left) and DEPOT (right).
// Layout, world units (x along the platform, depth into the picture): the platform from depth 8 (its near edge) to 186 (its far edge
// over the main line), and back to the wall (depth 286) at both ends, left of x 178 and right of x 706. The main line's pit between
// them is 44 below the platform, its rails at depths 214 and 258. The siding's pit in front is 22 below, its near rail at depth -4.
(()=>{const E=EnvLook,{C,pp,poly,line,lin,rad,rgba,mix,glow,haze,gilt,rng,lerp,clamp,TAU}=E;
const WALL=286,PIT=44,EDGE=186,NEAR=8,SID=22,HS=214;
const MAIN={x0:178,x1:706},RAILS=[214,258],GAUGE_C=236;
const PORT=[{x:232,w:108,h:156},{x:652,w:108,h:156}];
const KL={x:62,w:55,h:138,fr:5,hd:9};                       // the kitchen lift's bottom landing (the kitchen's own lift)
const CAGE={x0:714,x1:834,d0:198,d1:276,h:212};             // the freight lift's shaft at the right end (the car stands a head over a tall man)
const NEST={x0:104,x1:172,d0:210,d1:276};
const PEND=[{x:150,d:118,h:262,dead:0},{x:452,d:112,h:268,dead:0},{x:758,d:118,h:262,dead:1}];   // the lamps hanging from the vault
const SCONCE=[{x:-40,h:150},{x:340,h:160},{x:540,h:160},{x:968,h:150}];                          // the lamps on the wall
const END=()=>S.stationEnd==='lantern'?'lantern':'tower';
const SIGNS={lantern:['◄  OLD LINE','TOWER  ►'],tower:['◄  LANTERN','DEPOT  ►']};
const q=(x,y,d)=>pp(x,y,d);
const yW=h=>GB-h;                      // a height above the platform as a world y
function patAt(c,cv,x,y,u,rot){const p=c.createPattern(cv,'repeat');if(p.setTransform){let m=new DOMMatrix().translate(x,y);if(rot)m=m.rotate(rot);p.setTransform(m.scale(u));}return p;}
function tile(w,h,sc,fn){const cv=document.createElement('canvas');cv.width=Math.round(w*sc);cv.height=Math.round(h*sc);const c=cv.getContext('2d');c.scale(sc,sc);fn(c,w,h);return cv;}
// the floor's plane: (x, depth) in, the screen out, at a height h below the platform (h > 0 is lower)
function floorT(c,h){c.transform(1,0,PSX,-PSY,0,GB+(h||0));}
// a vertical face at a depth: world x and y drawn straight onto it
function faceT(c,d){c.translate(d*PSX,-d*PSY);}

// ---------- textures ----------
// the platform's mosaic: small hexagons, cream gone the colour of old bone, a darker rosette here and there, black grout
let HEX=null;
function hexTile(){if(HEX)return HEX;const s=3.2,w=s*3,h=s*Math.sqrt(3)*2;
  HEX=tile(w*4,h*2,7,(c,W2,H2)=>{const r=rng(5);c.fillStyle='#0d0b0a';c.fillRect(0,0,W2,H2);
    const hexp=(cx,cy)=>{c.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3;c.lineTo(cx+Math.cos(a)*(s-.32),cy+Math.sin(a)*(s-.32));}c.closePath();};
    for(let i=-1;i<=8;i++)for(let j=-1;j<=4;j++){const cx=i*s*1.5,cy=j*s*Math.sqrt(3)+(i%2?s*Math.sqrt(3)/2:0),v=r(),ros=((i+40)%4===1&&(j+40)%2===1);
      const base=ros?mix('#2a2622','#3a3430',v):mix('#7a7060','#958a74',v);hexp(cx,cy);c.fillStyle=base;c.fill();
      c.fillStyle=rgba('#000000',.12+.12*r());c.fill();c.strokeStyle=rgba('#fff3dc',.06+.06*r());c.lineWidth=.35;c.stroke();}});
  return HEX;}
// glazed brick tiles: the dado's in bottle green, the wall's and the vault's in cream gone brown
const GREEN={tw:12,th:6,cols:8,rows:8,sc:6,c0:'#1e4436',c1:'#173528',grout:'#0c1410',biscuit:'#3a2a1e',craze:.35};
const CREAM={tw:12,th:6,cols:8,rows:8,sc:6,c0:'#8a7e62',c1:'#6e624a',grout:'#2a241c',biscuit:'#4a3a2a',craze:.45};

// ---------- the vault and the back wall ----------
function vault(c,X0,X1){const top=-130,spring=q(0,yW(HS),WALL).y;
  c.fillStyle=patAt(c,EnvTex.subwayTiles(31,CREAM),0,0,1/6);c.fillRect(X0,top,X1-X0,spring-top+1);
  c.fillStyle=lin(c,0,top,0,spring,[[0,rgba('#030305',.97)],[.55,rgba('#07070a',.86)],[1,rgba('#0e0b09',.66)]]);c.fillRect(X0,top,X1-X0,spring-top+1);
  // the iron ribs that carry it, going up out of the picture into the dark, riveted, a thread of gold down each
  for(let x=-120;x<1100;x+=176){const p=q(x,yW(HS),WALL);c.fillStyle=lin(c,0,top,0,spring,[[0,rgba('#050507',0)],[.5,'#08080b'],[1,'#0b0b0e']]);c.fillRect(p.x-5,top,10,spring-top+4);
    c.fillStyle=lin(c,0,top,0,spring,[[0,rgba(C.goldD,0)],[1,rgba(C.goldD,.45)]]);c.fillRect(p.x+3.4,top,.9,spring-top+4);
    c.fillStyle=rgba(C.gold,.3);for(let y=spring-4;y>top+40;y-=9){c.fillRect(p.x-3.4,y,1.1,1.1);c.fillRect(p.x+1.6,y,1.1,1.1);}}
  haze(c,X0,X1,spring-60,spring+4,'#2a221c',.35);}
function backWall(c,X0,X1){c.save();faceT(c,WALL);const x0=X0-60,x1=X1;const base=GB+PIT,dado=yW(70),frieze=yW(84),spring=yW(HS);
  // the upper wall: cream tiles darkened by a century of smoke and damp, darkest high up
  c.fillStyle=patAt(c,EnvTex.subwayTiles(23,CREAM),0,0,1/6);c.fillRect(x0,spring,x1-x0,frieze-spring);
  c.fillStyle=lin(c,0,spring,0,frieze,[[0,rgba('#050405',.84)],[.5,rgba('#0a0807',.66)],[1,rgba('#0c0907',.54)]]);c.fillRect(x0,spring,x1-x0,frieze-spring);
  // water: streaks down from the vault where it seeps, a tide line, a bloom of lime
  {const r=rng(71);for(let i=0;i<26;i++){const x=x0+r()*(x1-x0),w=2+r()*9,L=30+r()*130;c.fillStyle=lin(c,0,spring,0,spring+L,[[0,rgba('#020202',.5)],[1,rgba('#020202',0)]]);c.fillRect(x,spring,w,L);
      if(r()<.4){c.fillStyle=lin(c,0,spring,0,spring+L*.8,[[0,rgba('#d8e0d0',.1)],[1,rgba('#d8e0d0',0)]]);c.fillRect(x+w*.3,spring,1,L*.8);}}}
  // the frieze: a black band, a gold line above and below, the house's vine running along it
  c.fillStyle='#08070a';c.fillRect(x0,frieze,x1-x0,dado-frieze);c.fillStyle=rgba(C.gold,.7);c.fillRect(x0,frieze,x1-x0,1.1);c.fillRect(x0,dado-1.1,x1-x0,1.1);
  {const pts=[];for(let x=x0;x<=x1;x+=24)pts.push({x,y:(frieze+dado)/2});E.vine(c,pts,{w:.9,amp:2.2,leaf:2.6,col:rgba(C.gold,.75),wave:22,every:3,shadow:false});}
  // the dado: bottle-green glazed brick, down to the platform at the ends and down into the pit along the main line
  c.fillStyle=patAt(c,EnvTex.subwayTiles(29,GREEN),0,0,1/6);c.fillRect(x0,dado,x1-x0,base-dado);
  c.fillStyle=lin(c,0,dado,0,base,[[0,rgba('#040605',.42)],[1,rgba('#020303',.72)]]);c.fillRect(x0,dado,x1-x0,base-dado);
  c.fillStyle=rgba('#cfe8d8',.12);c.fillRect(x0,dado+1.4,x1-x0,.8);
  // a pipe along the spring of the vault on iron brackets, and a run of cables slung below the frieze
  c.fillStyle='#0b0b0e';c.fillRect(x0,spring+4,x1-x0,9);c.fillStyle=rgba(C.rim,.22);c.fillRect(x0,spring+5,x1-x0,1);c.fillStyle=rgba('#000000',.6);c.fillRect(x0,spring+12,x1-x0,2);
  for(let x=x0+20;x<x1;x+=88){c.fillStyle='#141418';c.fillRect(x,spring+2,5,14);c.fillStyle=rgba(C.goldD,.6);c.fillRect(x,spring+2,5,1);}
  c.strokeStyle='#060608';c.lineWidth=2.4;for(const off of [0,4.5]){c.beginPath();for(let x=x0;x<x1;x+=120){c.moveTo(x,frieze-14+off);c.quadraticCurveTo(x+60,frieze-4+off,x+120,frieze-14+off);}c.stroke();}
  for(let x=x0;x<x1;x+=120){c.fillStyle='#16161a';c.fillRect(x-2,frieze-18,4,8);}
  c.restore();}
// a tunnel mouth in the back wall: a brick arch with a gilt keystone, and the bore going away into the dark with a lamp far down it
function portal(c,P,i){c.save();faceT(c,WALL);const x0=P.x-P.w/2,x1=P.x+P.w/2,base=GB+PIT,crown=yW(P.h),rad0=P.w/2,spr=crown+rad0;
  const arch=(k,e)=>{c.beginPath();c.moveTo(x0-k,base);c.lineTo(x0-k,spr);c.arc(P.x,spr,rad0+k,Math.PI,0);c.lineTo(x1+k,base);if(e)c.closePath();};
  // the surround: two rings of brick voussoirs
  arch(13,true);c.fillStyle=patAt(c,EnvTex.brick(5,{base:'#3a2018',alt:'#26140e',hot:'#4a2a1c',mortar:'#120c0a'}),0,0,1/6);c.fill();c.fillStyle=rgba('#000000',.45);c.fill();
  c.strokeStyle='#0a0606';c.lineWidth=.8;for(let k=0;k<=18;k++){const a=Math.PI+k*Math.PI/18;c.beginPath();c.moveTo(P.x+Math.cos(a)*rad0,spr+Math.sin(a)*rad0);c.lineTo(P.x+Math.cos(a)*(rad0+13),spr+Math.sin(a)*(rad0+13));c.stroke();}
  // the bore: rings of its lining going away, smaller and darker, to a lamp's glow far down the line
  arch(0,true);c.save();c.clip();c.fillStyle='#030304';c.fillRect(x0,crown,x1-x0,base-crown);
  const vx=P.x+(i?-10:10),vy=yW(40);
  for(let k=0;k<9;k++){const u=k/9,rr=rad0*(1-u*.82),cx=lerp(P.x,vx,u),sy=lerp(spr,vy-rr*.15,u),b=lerp(base,vy+rr*.55,u);c.strokeStyle=rgba(k%2?'#2a1a14':'#1c120e',.9*(1-u*.6));c.lineWidth=3*(1-u*.7);
    c.beginPath();c.moveTo(cx-rr,b);c.lineTo(cx-rr,sy);c.arc(cx,sy,rr,Math.PI,0);c.lineTo(cx+rr,b);c.stroke();}
  glow(c,vx,vy-6,26,'#7ff3e3',.25);glow(c,vx,vy-6,8,'#d9fffa',.55);
  // the rails running in, shining a little, and the dark coming out at us
  c.strokeStyle=rgba('#8a94a8',.35);c.lineWidth=1;c.beginPath();c.moveTo(P.x-16,base);c.lineTo(vx-3,vy+12);c.moveTo(P.x+16,base);c.lineTo(vx+3,vy+12);c.stroke();
  c.fillStyle=rad(c,P.x,base-30,10,90,[[0,rgba('#000000',0)],[1,rgba('#000000',.6)]]);c.fillRect(x0,crown,x1-x0,base-crown);c.restore();
  // the keystone, gilt, with the house's H; a sign over the arch saying where the line goes
  c.fillStyle='#0c0a08';c.beginPath();c.moveTo(P.x-8,crown-14);c.lineTo(P.x+8,crown-14);c.lineTo(P.x+6,crown+2);c.lineTo(P.x-6,crown+2);c.closePath();c.fill();
  c.strokeStyle=C.gold;c.lineWidth=1;c.stroke();c.fillStyle=C.goldL;c.fillRect(P.x-3.6,crown-10,1.4,9);c.fillRect(P.x+2.2,crown-10,1.4,9);c.fillRect(P.x-3.6,crown-6.2,7.2,1.3);
  {const sw=104,sy=crown-40,sx=P.x-sw/2;c.fillStyle='#0a1210';c.fillRect(sx,sy,sw,16);c.strokeStyle=rgba(C.gold,.8);c.lineWidth=1;c.strokeRect(sx+1.5,sy+1.5,sw-3,13);
    // rust coming through the enamel at the corners and round the bolts
    const r=rng(9+i);for(let k=0;k<7;k++){c.fillStyle=rgba('#5a2a14',.5+.3*r());c.beginPath();c.ellipse(sx+(r()<.5?3+r()*10:sw-3-r()*10),sy+(r()<.5?3:13),2+r()*4,1.4+r()*2,0,0,TAU);c.fill();}
    c.fillStyle=C.goldD;for(const bx of [sx+4,sx+sw-4])c.beginPath(),c.arc(bx,sy+8,1.2,0,TAU),c.fill();
    gilt(c,SIGNS[END()][i],P.x,sy+12,9,{style:'700',track:1.4});}
  c.restore();}
// the kitchen lift's bottom landing (the lantern's end): the same steel frame and black glass doors as above, a call button, a little
// brass plaque
function kitLanding(c){c.save();faceT(c,WALL);const cx=KL.x,yB=GB;
  // a step of dark stone the lift stands on, and the tiles round it a little cleaner where the doors' light falls
  c.fillStyle=rgba('#cfe8ff',.05);c.fillRect(cx-KL.w,yW(KL.h+30),KL.w*2,KL.h+30);
  if(typeof liftFrame==='function'){liftFrame(c,cx,yB,KL.w,KL.h,KL.fr,KL.hd);liftDoors(c,cx,yB,KL.w,KL.h,0);}
  else{c.fillStyle='#8d99a3';c.fillRect(cx-KL.w/2-KL.fr,yB-KL.h-KL.hd,KL.w+2*KL.fr,KL.h+KL.hd);c.fillStyle='#070b11';c.fillRect(cx-KL.w/2,yB-KL.h,KL.w,KL.h);}
  // the call button in a steel plate, and the plaque under it
  {const bx=cx+KL.w/2+16,by=yW(70);c.fillStyle=lin(c,bx-5,0,bx+5,0,[[0,'#6b7681'],[.5,'#aeb9c2'],[1,'#6b7681']]);c.fillRect(bx-5,by-12,10,24);c.strokeStyle='rgba(0,0,0,.5)';c.lineWidth=.6;c.strokeRect(bx-5,by-12,10,24);
    c.fillStyle='#0a0e12';c.beginPath();c.arc(bx,by,3,0,TAU);c.fill();c.fillStyle='rgba(150,216,255,.6)';c.beginPath();c.arc(bx,by,1.8,0,TAU);c.fill();
    c.fillStyle=lin(c,0,by+18,0,by+30,[[0,C.goldL],[.5,C.gold],[1,C.goldD]]);c.fillRect(bx-9,by+18,18,11);c.strokeStyle=C.goldDD;c.lineWidth=.5;c.strokeRect(bx-9,by+18,18,11);
    c.fillStyle='#2a1c08';c.font='700 3.2px Georgia, serif';c.textAlign='center';c.fillText('PRIVATE',bx,by+23.2);c.fillText('H · KITCHEN',bx,by+27.4);}
  c.restore();}
// at the tower's end the lift's place is a service door: iron, sealed with a bar, a chain and a padlock, the goblins' claws on it
function sealedDoor(c){c.save();faceT(c,WALL);const cx=KL.x,w=KL.w+8,h=KL.h-6,x0=cx-w/2,yB=GB,yT=yB-h,r=rng(19);
  c.fillStyle='#14110e';c.fillRect(x0-7,yT-9,w+14,h+9);c.strokeStyle=rgba(C.goldD,.4);c.lineWidth=.8;c.strokeRect(x0-6.5,yT-8.5,w+13,h+8.5);
  c.fillStyle=lin(c,x0,0,x0+w,0,[[0,'#1a1816'],[.5,'#23201c'],[1,'#171513']]);c.fillRect(x0,yT,w,h);
  c.strokeStyle='#080706';c.lineWidth=1.2;c.beginPath();c.moveTo(cx,yT);c.lineTo(cx,yB);c.stroke();
  // its panels and rivets, rust bleeding down it
  for(const [a,b] of [[yT+8,yT+h*.44],[yT+h*.56,yB-8]])for(const xx of [x0+5,cx+4]){c.strokeStyle=rgba('#000000',.55);c.lineWidth=1;c.strokeRect(xx,a,w/2-9,b-a);c.strokeStyle=rgba('#c8b896',.07);c.strokeRect(xx+1,a+1,w/2-9,b-a);}
  c.fillStyle=rgba('#8a7a60',.35);for(let y=yT+4;y<yB-2;y+=7){c.fillRect(x0+2,y,1.1,1.1);c.fillRect(x0+w-3.1,y,1.1,1.1);c.fillRect(cx-2.8,y,1,1);c.fillRect(cx+1.8,y,1,1);}
  for(let i=0;i<10;i++){const x=x0+r()*w,y=yT+r()*h*.7,L=10+r()*44;c.fillStyle=lin(c,0,y,0,y+L,[[0,rgba('#6a3416',.42)],[1,rgba('#6a3416',0)]]);c.fillRect(x,y,1.4+r()*3,L);}
  // NO ENTRY stencilled, half gone; claws through the paint low down where they reach
  c.fillStyle=rgba('#d8cfb8',.26);c.font='700 6.4px Georgia, serif';c.textAlign='center';c.fillText('NO  ENTRY',cx,yT+h*.26);
  c.strokeStyle=rgba('#d8c8a8',.3);c.lineWidth=.6;c.beginPath();for(const [sx,sy] of [[x0+8,yB-40],[cx+6,yB-30],[x0+14,yB-62]])for(let k=0;k<4;k++){c.moveTo(sx+k*2.2,sy);c.lineTo(sx+k*2.2+7,sy+12);}c.stroke();
  // the bar across it in its brackets, a chain and a padlock
  const by=yT+h*.5;c.fillStyle='#0d0c0b';c.fillRect(x0-12,by-3.5,w+24,7);c.fillStyle=rgba(C.rim,.16);c.fillRect(x0-12,by-3.5,w+24,.9);
  for(const bx of [x0-9,x0+w+3]){c.fillStyle='#1c1915';c.fillRect(bx,by-7,6,14);c.fillStyle=rgba('#8a7a60',.4);c.fillRect(bx+2.4,by-5,1.2,1.2);c.fillRect(bx+2.4,by+4,1.2,1.2);}
  c.strokeStyle='#3a342a';c.lineWidth=1.1;for(let k=0;k<9;k++){const u=k/8;c.beginPath();c.ellipse(lerp(x0+4,x0+w-4,u),by+6+Math.sin(u*Math.PI)*10,2.2,1.4,k%2?0:1.2,0,TAU);c.stroke();}
  {const px=cx+2,py=by+16;c.strokeStyle=C.goldD;c.lineWidth=1.4;c.beginPath();c.arc(px,py-4,3,Math.PI,0);c.stroke();c.fillStyle=lin(c,px-4,0,px+4,0,[[0,C.goldD],[.5,C.gold],[1,C.goldD]]);c.fillRect(px-4,py-4,8,8);c.fillStyle='#1a1208';c.fillRect(px-.6,py-1,1.2,3);}
  c.restore();}
// at the lantern's end the right end is only wall: a barred service gate in it, padlocked, a passage going off behind it
function serviceGate(c){c.save();faceT(c,WALL);const cx=774,w=66,h=118,x0=cx-w/2,yB=GB,spr=yB-h+w/2,top=x=>spr-Math.sqrt(Math.max(0,(w/2)**2-(x-cx)**2));
  const arch=k=>{c.beginPath();c.moveTo(x0-k,yB);c.lineTo(x0-k,spr);c.arc(cx,spr,w/2+k,Math.PI,0);c.lineTo(x0+w+k,yB);c.closePath();};
  arch(9);c.fillStyle=patAt(c,EnvTex.brick(5,{base:'#3a2018',alt:'#26140e',hot:'#4a2a1c',mortar:'#120c0a'}),0,0,1/6);c.fill();c.fillStyle=rgba('#000000',.5);c.fill();
  arch(0);c.fillStyle='#030304';c.fill();c.save();c.clip();glow(c,cx+8,yB-50,30,'#e8c88a',.18);c.fillStyle=rgba('#e8c88a',.4);c.fillRect(cx+6,yB-54,4,1.6);c.restore();
  c.strokeStyle='#15151a';c.lineWidth=2.2;c.beginPath();for(let x=x0+5;x<x0+w;x+=7.5){c.moveTo(x,yB);c.lineTo(x,top(x)+1);}c.stroke();
  c.strokeStyle=rgba(C.rim,.2);c.lineWidth=.6;c.beginPath();for(let x=x0+5;x<x0+w;x+=7.5){c.moveTo(x+.9,yB);c.lineTo(x+.9,top(x)+2);}c.stroke();
  for(const y of [yB-30,yB-78]){c.fillStyle='#121216';c.fillRect(x0,y-2.5,w,5);c.fillStyle=rgba(C.goldD,.55);c.fillRect(x0,y-2.5,w,.8);}
  {const px=cx+18,py=yB-58;c.strokeStyle=C.goldD;c.lineWidth=1.3;c.beginPath();c.arc(px,py-4,2.6,Math.PI,0);c.stroke();c.fillStyle=lin(c,px-3.5,0,px+3.5,0,[[0,C.goldD],[.5,C.gold],[1,C.goldD]]);c.fillRect(px-3.5,py-4,7,7);}
  {const sx=cx-20,sy=yW(h+24);c.fillStyle='#0a1210';c.fillRect(sx,sy,40,13);c.strokeStyle=rgba(C.gold,.75);c.lineWidth=.8;c.strokeRect(sx+1.2,sy+1.2,37.6,10.6);gilt(c,'SERVICE',sx+20,sy+9.6,6.4,{style:'700',track:.8});}
  c.restore();}
// the house's crates stacked against the wall beside the gate, stencilled with the H
function crates(c){const box=(x,d,w,dd,h,z)=>{const y0=GB-z,y1=y0-h,A=q(x,y0,d),B=q(x+w,y0,d),Bt=q(x+w,y1,d),At=q(x,y1,d),Ct=q(x+w,y1,d+dd),Dt=q(x,y1,d+dd),Cb=q(x+w,y0,d+dd);
    poly(c,[B,Cb,Ct,Bt]);c.fillStyle='#1a1109';c.fill();poly(c,[At,Bt,Ct,Dt]);c.fillStyle='#3a2816';c.fill();poly(c,[A,B,Bt,At]);c.fillStyle='#2a1c10';c.fill();c.strokeStyle=rgba(C.goldD,.5);c.lineWidth=.8;c.stroke();
    c.strokeStyle='#120a05';c.lineWidth=.8;for(const k of [.33,.66]){c.beginPath();c.moveTo(A.x+.5,lerp(A.y,At.y,k));c.lineTo(B.x-.5,lerp(B.y,Bt.y,k));c.stroke();}
    const m=q(x+w/2,y0-h/2,d);c.fillStyle=rgba(C.gold,.45);c.fillRect(m.x-4,m.y-5,1.6,10);c.fillRect(m.x+2.4,m.y-5,1.6,10);c.fillRect(m.x-4,m.y-.8,8,1.6);};
  box(852,254,30,26,22,0);box(812,250,36,28,26,0);box(816,252,32,26,20,26);}
// the house's H in mosaic on the wall above the line: black tesserae, the H and its ring in gold, cyan between, some fallen out
function roundel(c){c.save();faceT(c,WALL);const cx=452,cy=yW(178),R=30,r=rng(3);
  c.fillStyle='#050506';c.beginPath();c.arc(cx,cy,R+4,0,TAU);c.fill();
  for(let a=0;a<TAU;a+=TAU/64){for(const [rr,col] of [[R+1.6,C.gold],[R-3,rgba(C.cyan,.75)]]){if(r()<.06)continue;c.fillStyle=col;c.fillRect(cx+Math.cos(a)*rr-.9,cy+Math.sin(a)*rr-.9,1.8,1.8);}}
  for(let y=-R+5;y<R-4;y+=2.1)for(let x=-R+5;x<R-4;x+=2.1){if(x*x+y*y>(R-6)*(R-6))continue;const inH=(Math.abs(x+9)<3.4||Math.abs(x-9)<3.4)&&Math.abs(y)<14||Math.abs(y)<2.6&&Math.abs(x)<10;
    if(r()<.05){c.fillStyle='#1a1410';c.fillRect(cx+x,cy+y,1.8,1.8);continue;}c.fillStyle=inH?mix(C.gold,C.goldL,r()*.6):mix('#0c0b0d','#1a1820',r());c.fillRect(cx+x,cy+y,1.8,1.8);}
  glow(c,cx,cy,R*2.4,C.amber,.08);c.restore();}
// a crystal lamp on a bracket on the wall (its light breathes in live())
function sconce(c,S0){c.save();faceT(c,WALL);const x=S0.x,y=yW(S0.h);
  c.strokeStyle='#0a0a0d';c.lineWidth=2.2;c.beginPath();c.moveTo(x-10,y+16);c.quadraticCurveTo(x-10,y+2,x,y+2);c.stroke();c.strokeStyle=rgba(C.gold,.5);c.lineWidth=.7;c.stroke();
  lampCage(c,x,y+8,1);c.restore();}
// a brass cage round a crystal: dead when dead, the crystal lit in live()
function lampCage(c,x,y,s,dead){c.fillStyle=C.goldD;c.fillRect(x-4*s,y-11*s,8*s,2*s);c.fillRect(x-3*s,y+5*s,6*s,2*s);
  c.fillStyle=dead?'#0c1214':rgba('#9ae8f0',.25);c.beginPath();c.moveTo(x,y-9*s);c.lineTo(x+4*s,y-2*s);c.lineTo(x,y+5*s);c.lineTo(x-4*s,y-2*s);c.closePath();c.fill();
  c.strokeStyle=C.gold;c.lineWidth=.7*s;c.beginPath();for(const k of [-4,0,4]){c.moveTo(x+k*s,y-9*s);c.lineTo(x+k*.8*s,y+5*s);}c.stroke();
  if(dead){c.strokeStyle=rgba('#d9fffa',.2);c.lineWidth=.4*s;c.beginPath();c.moveTo(x-1.5*s,y-6*s);c.lineTo(x+1*s,y-1*s);c.lineTo(x-.5*s,y+2*s);c.stroke();}}

// ---------- the floors ----------
// the main line's pit: ballast, sleepers, rails; its left end's stone face toward us
function mainPit(c){
  c.save();floorT(c,PIT);c.beginPath();c.rect(MAIN.x0,EDGE-4,MAIN.x1-MAIN.x0,WALL-EDGE+4);c.clip();
  c.fillStyle='#0d0c0c';c.fillRect(MAIN.x0,EDGE-4,MAIN.x1-MAIN.x0,WALL-EDGE+4);
  {const r=rng(13);for(let i=0;i<900;i++){const x=MAIN.x0+r()*(MAIN.x1-MAIN.x0),d=EDGE+r()*(WALL-EDGE);c.fillStyle=mix('#141313','#2c2a28',r());c.beginPath();c.ellipse(x,d,.9+r()*1.4,.7+r(),r()*3,0,TAU);c.fill();}}
  // the sleepers, and where the line curves away into each portal
  const railD=(x,k)=>{let d=RAILS[k];for(const P of PORT){const u=clamp(1-Math.abs(x-P.x)/(P.w*.9),0,1);d=lerp(d,WALL+6+(k?16:0)-16,u*u*(3-2*u)*(k?.4:.8));}return d;};
  for(let x=MAIN.x0+8;x<MAIN.x1;x+=20){c.fillStyle='#1a120c';c.fillRect(x,railD(x,0)-14,7,railD(x,1)-railD(x,0)+28);c.fillStyle=rgba('#000000',.35);c.fillRect(x+5.6,railD(x,0)-14,1.4,railD(x,1)-railD(x,0)+28);}
  c.restore();
  // the rails stand up off the sleepers, so they are drawn on the screen with their height
  for(let k=0;k<2;k++){const pts=[];for(let x=MAIN.x0;x<=MAIN.x1;x+=6){const d=(()=>{let dd=RAILS[k];for(const P of PORT){const u=clamp(1-Math.abs(x-P.x)/(P.w*.9),0,1);dd=lerp(dd,WALL+6+(k?16:0)-16,u*u*(3-2*u)*(k?.4:.8));}return dd;})();pts.push(q(x,GB+PIT-3,d));}
    c.strokeStyle='#0a0a0c';c.lineWidth=2.4;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();
    c.strokeStyle=rgba('#c8d4e8',.38);c.lineWidth=.6;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y-1):c.moveTo(p.x,p.y-1));c.stroke();}
  // the pit's left end: the platform's stone side, toward us
  {const a=q(MAIN.x0,GB,EDGE),b=q(MAIN.x0,GB,WALL),e=q(MAIN.x0,GB+PIT,WALL),f=q(MAIN.x0,GB+PIT,EDGE);c.fillStyle=patAt(c,EnvTex.brick(7,{base:'#2a1c16',alt:'#1c120e',hot:'#36221a',mortar:'#0c0807'}),0,0,1/6);poly(c,[a,b,e,f]);c.fill();
    c.fillStyle=rgba('#000000',.5);c.fill();c.strokeStyle=rgba(C.goldD,.5);c.lineWidth=1;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}}
// the platform: the mosaic, worn and filthy, gilt safety lines at both edges, the lamps' light lying on it in pools
function platform(c){const X0=-220,X1=1160;
  const outline=[[X0,NEAR],[X1,NEAR],[X1,WALL],[MAIN.x1,WALL],[MAIN.x1,EDGE],[MAIN.x0,EDGE],[MAIN.x0,WALL],[X0,WALL]];
  c.save();floorT(c,0);c.beginPath();outline.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.clip();
  c.fillStyle=patAt(c,hexTile(),0,0,1/7);c.fillRect(X0,NEAR,X1-X0,WALL-NEAR);
  // dimness: the mosaic is old and the light is low, darkest toward us and in the corners
  c.fillStyle=lin(c,0,NEAR,0,WALL,[[0,rgba('#050405',.74)],[.4,rgba('#070605',.6)],[1,rgba('#060505',.7)]]);c.fillRect(X0,NEAR,X1-X0,WALL-NEAR);
  // grime in drifts, oil, wet
  {const r=rng(27);for(let i=0;i<60;i++){const x=X0+r()*(X1-X0),d=NEAR+r()*(WALL-NEAR),w=20+r()*90,h=6+r()*24;c.fillStyle=rgba(r()<.7?'#0a0806':'#16100a',.18+.22*r());c.beginPath();c.ellipse(x,d,w,h,(r()-.5)*.5,0,TAU);c.fill();}}
  // a border of black and gold mosaic along both edges, then the safety line in gilt paint, worn through in places
  for(const [d0,d1] of [[NEAR+4,NEAR+12],[EDGE-12,EDGE-4]]){c.fillStyle=rgba('#0a0908',.86);c.fillRect(X0,d0,X1-X0,d1-d0);
    c.fillStyle=rgba(C.gold,.55);const r=rng(d0|0);for(let x=X0;x<X1;x+=4.2){if(r()<.12)continue;c.fillRect(x,d0+(d1-d0)*.42,2.4,1.6);}}
  {const r=rng(41);for(const d of [NEAR+1.4,EDGE-1.8]){for(let x=X0;x<X1;x+=6){if(r()<.18)continue;c.fillStyle=rgba(mix(C.goldD,C.gold,r()),.75);c.fillRect(x,d-1.1,5.4,2.2);}}}
  // the light under each hanging lamp
  c.globalCompositeOperation='lighter';for(const L of PEND){if(L.dead)continue;c.fillStyle=rad(c,L.x,L.d,4,150,[[0,rgba('#bfe9e0',.13)],[.4,rgba('#e8c88a',.05)],[1,rgba('#e8c88a',0)]]);c.save();c.translate(L.x,L.d);c.scale(1,.8);c.translate(-L.x,-L.d);c.beginPath();c.arc(L.x,L.d,150,0,TAU);c.fill();c.restore();}
  c.globalCompositeOperation='source-over';
  // puddles under the drips, black and holding a little of the lamps
  {const r=rng(55);for(const [x,d,w] of [[248,52,34],[566,140,40],[690,62,26],[96,150,30],[420,30,22]]){c.fillStyle=rgba('#020203',.6);c.beginPath();c.ellipse(x,d,w,w*.42,0,0,TAU);c.fill();
    c.fillStyle=rgba('#9ad8d0',.07);c.beginPath();c.ellipse(x+w*.15,d+w*.1,w*.5,w*.12,0,0,TAU);c.fill();}}
  c.restore();
  // the far edge's coping over the main line: dressed stone, its lip catching the lamps
  {const a=q(MAIN.x0,GB,EDGE),b=q(MAIN.x1,GB,EDGE);c.strokeStyle='#14110e';c.lineWidth=2;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();c.strokeStyle=rgba(C.rim,.25);c.lineWidth=.8;c.beginPath();c.moveTo(a.x,a.y-.8);c.lineTo(b.x,b.y-.8);c.stroke();}}
// the near edge: the coping, the platform's face dropping to the siding, the ballast and the near rail glinting
function nearEdge(c){const X0=-220,X1=1160,a=q(X0,GB,NEAR),b=q(X1,GB,NEAR),e=q(X1,GB+SID,NEAR),f=q(X0,GB+SID,NEAR);
  c.fillStyle=patAt(c,EnvTex.brick(11,{base:'#241a14',alt:'#18100c',hot:'#2e2018',mortar:'#0a0706',rows:6}),0,0,1/6);poly(c,[a,b,e,f]);c.fill();c.fillStyle=rgba('#000000',.55);c.fill();
  c.fillStyle='#1a1612';c.fillRect(Math.min(a.x,f.x)-4,a.y-1,b.x-a.x+8,3.4);c.fillStyle=rgba(C.rim,.3);c.fillRect(a.x,a.y-1,b.x-a.x,.8);
  // the siding's bed: ballast, a sleeper's end, the rail
  c.save();floorT(c,SID);c.fillStyle='#0b0a0a';c.fillRect(X0,-90,X1-X0,NEAR+90);
  {const r=rng(61);for(let i=0;i<500;i++){const x=X0+r()*(X1-X0),d=-60+r()*(NEAR+60);c.fillStyle=mix('#121111','#262321',r());c.beginPath();c.ellipse(x,d,.8+r()*1.3,.6+r()*.8,r()*3,0,TAU);c.fill();}}
  for(let x=X0;x<X1;x+=22){c.fillStyle='#160f0a';c.fillRect(x,-60,7,60);}
  c.restore();
  const r0=q(X0,GB+SID-3,-4),r1=q(X1,GB+SID-3,-4);c.strokeStyle='#08080a';c.lineWidth=3;c.beginPath();c.moveTo(r0.x,r0.y);c.lineTo(r1.x,r1.y);c.stroke();c.strokeStyle=rgba('#c8d4e8',.45);c.lineWidth=.7;c.beginPath();c.moveTo(r0.x,r0.y-1.2);c.lineTo(r1.x,r1.y-1.2);c.stroke();
  c.fillStyle=lin(c,0,a.y,0,a.y+40,[[0,rgba('#000000',.2)],[1,rgba('#000000',.75)]]);c.fillRect(X0-60,a.y+2,X1-X0+120,60);}

// ---------- the goblins' corner ----------
// rags and straw heaped against the wall by the kitchen lift, a lean-to of planks, stolen things in it; their tallies in the tiles
function nest(c){const r=rng(83);
  // the tallies, scratched through the glaze in groups of five, the newest the palest
  c.save();faceT(c,WALL);for(let g=0;g<9;g++){const x0=NEST.x0+4+(g%5)*14,y0=yW(60)-Math.floor(g/5)*16;c.strokeStyle=rgba('#c8c0a8',.25+.35*(g/9));c.lineWidth=.7;c.beginPath();
    for(let k=0;k<4;k++){c.moveTo(x0+k*2.4,y0);c.lineTo(x0+k*2.4+.6,y0+10);}c.moveTo(x0-1,y0+8);c.lineTo(x0+9,y0+1.5);c.stroke();}
  // a crude claw-drawn H crossed out
  c.strokeStyle=rgba('#d8c8a8',.35);c.lineWidth=1;c.beginPath();c.moveTo(NEST.x1-8,yW(96));c.lineTo(NEST.x1-7,yW(78));c.moveTo(NEST.x1+2,yW(97));c.lineTo(NEST.x1+3,yW(79));c.moveTo(NEST.x1-7.6,yW(87));c.lineTo(NEST.x1+2.6,yW(88));c.moveTo(NEST.x1-12,yW(99));c.lineTo(NEST.x1+8,yW(76));c.stroke();
  c.restore();
  // the lean-to: planks propped against the wall
  for(let k=0;k<5;k++){const x=NEST.x0+6+k*13+r()*4,top=q(x+8,yW(52+r()*14),WALL-2),bot=q(x,GB,NEST.d0+10+r()*12);c.strokeStyle=k%2?'#1e140c':'#2a1c10';c.lineWidth=5.5;c.beginPath();c.moveTo(bot.x,bot.y);c.lineTo(top.x,top.y);c.stroke();
    c.strokeStyle=rgba(C.rim,.15);c.lineWidth=.6;c.beginPath();c.moveTo(bot.x-2.4,bot.y);c.lineTo(top.x-2.4,top.y);c.stroke();}
  // the heap: rags, straw, a burst mattress, and what they have carried down here
  const heap=[];for(let i=0;i<40;i++){const x=lerp(NEST.x0,NEST.x1,r()),d=lerp(NEST.d0,NEST.d1,r()),p=q(x,GB,d);heap.push({p,w:6+r()*12,h:3+r()*6,col:['#3a2a1c','#2a2420','#4a1c18','#22201c','#5a4a30','#1c2420'][Math.floor(r()*6)],a:r()*3});}
  heap.sort((a,b)=>a.p.y-b.p.y);for(const h of heap){c.fillStyle=h.col;c.beginPath();c.ellipse(h.p.x,h.p.y-h.h*.5,h.w,h.h,h.a*.2,0,TAU);c.fill();c.fillStyle=rgba('#000000',.25);c.beginPath();c.ellipse(h.p.x+1,h.p.y-h.h*.3,h.w*.8,h.h*.6,0,0,TAU);c.fill();}
  {const p=q(lerp(NEST.x0,NEST.x1,.5),GB,lerp(NEST.d0,NEST.d1,.3));c.strokeStyle=rgba('#c8b080',.35);c.lineWidth=.5;c.beginPath();for(let i=0;i<50;i++){const a=r()*TAU,L=3+r()*7;c.moveTo(p.x+(r()-.5)*40,p.y-r()*8);c.lineTo(p.x+(r()-.5)*40+Math.cos(a)*L,p.y-r()*8+Math.sin(a)*L*.3);}c.stroke();}
  // stolen things: a bistro chair's bentwood back, a brass lamp, bottles, a gilt picture frame, a skull on a stick
  {const p=q(NEST.x0+12,GB,NEST.d0+40);c.strokeStyle='#2a1a10';c.lineWidth=1.8;c.beginPath();c.arc(p.x,p.y-14,7,Math.PI*.9,Math.PI*2.1);c.moveTo(p.x-6,p.y-12);c.lineTo(p.x-7,p.y);c.moveTo(p.x+6,p.y-12);c.lineTo(p.x+7,p.y);c.stroke();}
  {const p=q(NEST.x0+38,GB,NEST.d0+22);c.fillStyle=C.goldD;c.fillRect(p.x-2,p.y-12,4,10);c.beginPath();c.moveTo(p.x-6,p.y-12);c.lineTo(p.x+6,p.y-12);c.lineTo(p.x+3,p.y-18);c.lineTo(p.x-3,p.y-18);c.closePath();c.fill();c.fillStyle=rgba(C.goldL,.5);c.fillRect(p.x-1.6,p.y-12,1,10);}
  for(let i=0;i<4;i++){const p=q(NEST.x0+46+i*6,GB,NEST.d0+14+i*3);c.fillStyle=i%2?'#1c3a20':'#3a2a12';c.fillRect(p.x-1.6,p.y-8,3.2,8);c.fillRect(p.x-.7,p.y-11,1.4,3);c.fillStyle=rgba('#ffffff',.2);c.fillRect(p.x-1,p.y-7,.7,5);}
  {const p=q(NEST.x1-6,GB,NEST.d0+30);c.strokeStyle=C.goldD;c.lineWidth=2;c.strokeRect(p.x-9,p.y-22,14,18);c.strokeStyle=rgba(C.gold,.6);c.lineWidth=.6;c.strokeRect(p.x-8,p.y-21,12,16);c.fillStyle='#120e0c';c.fillRect(p.x-7,p.y-20,10,14);}
  {const p=q(NEST.x1+4,GB,NEST.d0+6);c.strokeStyle='#2a1c10';c.lineWidth=1.6;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x+1,p.y-34);c.stroke();c.fillStyle='#b8ac90';c.beginPath();c.ellipse(p.x+1,p.y-38,4.6,5.2,0,0,TAU);c.fill();
    c.fillStyle='#14100c';c.beginPath();c.arc(p.x-.6,p.y-39,1.2,0,TAU);c.arc(p.x+2.8,p.y-39,1.2,0,TAU);c.fill();c.fillRect(p.x-1,p.y-35,4,1.4);}}
// bones and scraps on the platform, gnawed and thrown down, kept to the edges of the floor
function litter(c){const r=rng(97),spots=[[60,24],[118,160],[300,170],[560,22],[640,168],[820,40],[870,150],[380,176],[200,20],[720,120]];
  for(const [x0,d0] of spots)for(let k=0;k<3;k++){const p=q(x0+(r()-.5)*40,GB,d0+(r()-.5)*10),a=(r()-.5)*1.4,L=4+r()*7;
    if(r()<.6){c.strokeStyle=mix('#a89a80','#d0c4a8',r());c.lineWidth=1.3;c.beginPath();c.moveTo(p.x-Math.cos(a)*L,p.y-Math.sin(a)*L*.35);c.lineTo(p.x+Math.cos(a)*L,p.y+Math.sin(a)*L*.35);c.stroke();
      c.fillStyle=c.strokeStyle;for(const s of [-1,1]){c.beginPath();c.arc(p.x+s*Math.cos(a)*L,p.y+s*Math.sin(a)*L*.35,1.4,0,TAU);c.fill();}}
    else{c.fillStyle=['#2a2018','#3a2c1c','#1e1a16'][Math.floor(r()*3)];c.beginPath();c.ellipse(p.x,p.y,3+r()*4,1.2+r()*1.4,a*.2,0,TAU);c.fill();}}}

// ---------- the freight lift's shaft at the tower's end (the cage, its gate and the counterweight move, so they are drawn in live()) ----------
function shaft(c){const {x0,x1,d0,d1,h}=CAGE;
  // the shaft's floor: a steel plate at the platform's height, a dark gap round it
  {const pts=[q(x0,GB,d0),q(x1,GB,d0),q(x1,GB,d1),q(x0,GB,d1)];poly(c,pts);c.fillStyle='#0a0a0d';c.fill();c.strokeStyle=rgba(C.goldD,.6);c.lineWidth=1;c.stroke();}
  // the back uprights and the far side's lattice, the near uprights, all running up into the vault
  const post=(x,d,w)=>{const a=q(x,GB,d),b=q(x,-300,d);c.fillStyle='#0b0b0e';c.fillRect(a.x-w/2,b.y,w,a.y-b.y);c.fillStyle=rgba(C.rim,.18);c.fillRect(a.x+w/2-1,b.y,1,a.y-b.y);};
  post(x0,d1,5);post(x1,d1,5);
  c.strokeStyle='#0c0c10';c.lineWidth=1.6;c.beginPath();for(let y=GB;y>-300;y-=40){const a=q(x0,y,d1),b=q(x1,y-40,d1),e=q(x1,y,d1),f=q(x0,y-40,d1);c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.moveTo(e.x,e.y);c.lineTo(f.x,f.y);}c.stroke();
  // the counterweight's guide on the right side of the shaft (the side that faces us)
  {const a=q(x1+6,GB,d0+20),b=q(x1+6,-300,d0+20),e=q(x1+6,GB,d0+44),f=q(x1+6,-300,d0+44);c.strokeStyle='#121216';c.lineWidth=2.4;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.moveTo(e.x,e.y);c.lineTo(f.x,f.y);c.stroke();}
}
// the near uprights go in front of the cage (and of Kael in it), so live() draws them after it, with the sign across the top of the
// shaft that says where it goes (the car passes behind it on its way up)
function shaftFront(c){const {x0,x1,d0,h}=CAGE;
  {const p=q((x0+x1)/2,yW(h+26),d0);c.fillStyle='#0a1210';c.fillRect(p.x-34,p.y-8,68,15);c.strokeStyle=rgba(C.gold,.8);c.lineWidth=.9;c.strokeRect(p.x-32.5,p.y-6.5,65,12);gilt(c,'TO THE TOWER',p.x,p.y+3.2,7.6,{style:'700',track:1.2});}
  for(const x of [x0,x1]){const a=q(x,GB,d0),b=q(x,-300,d0);c.fillStyle='#0d0d11';c.fillRect(a.x-3.4,b.y,6.8,a.y-b.y);c.fillStyle=rgba(C.gold,.35);c.fillRect(a.x+2.4,b.y,.9,a.y-b.y);
  c.fillStyle='#16161b';for(let y=GB-20;y>-300;y-=40){const p=q(x,y,d0);c.fillRect(p.x-4.4,p.y-2,8.8,4);}}
  // the call panel on the left post: brass, two buttons, a dial with its needle on the floor the cage is at
  const p=q(x0,yW(66),d0),lit=(S.lift>.02||S.liftY>.5),bl=.5+.5*Math.sin(S.t*6);
  c.fillStyle=lin(c,p.x-7,0,p.x+7,0,[[0,C.goldD],[.5,C.goldL],[1,C.goldD]]);c.fillRect(p.x-7,p.y-16,14,30);c.strokeStyle=C.goldDD;c.lineWidth=.6;c.strokeRect(p.x-7,p.y-16,14,30);
  c.fillStyle='#0c0a08';c.beginPath();c.arc(p.x,p.y-8,4.6,Math.PI,0);c.fill();c.strokeStyle=C.goldL;c.lineWidth=.5;c.stroke();
  const ang=Math.PI+clamp(S.liftY/400,0,1)*Math.PI;c.strokeStyle='#ff6a4a';c.lineWidth=.7;c.beginPath();c.moveTo(p.x,p.y-8);c.lineTo(p.x+Math.cos(ang)*4,p.y-8+Math.sin(ang)*4);c.stroke();
  for(const [dy,on] of [[2,lit&&S.liftY<1],[8,lit]]){c.fillStyle='#120e08';c.beginPath();c.arc(p.x,p.y+dy,2.2,0,TAU);c.fill();if(on){c.fillStyle=rgba('#ffb85a',.7+.3*bl);c.beginPath();c.arc(p.x,p.y+dy,1.5,0,TAU);c.fill();glow(c,p.x,p.y+dy,7,'#ffb85a',.5*bl);}}}

// ---------- the scene ----------
function paint(c){const X0=-160,X1=W+240,T0=-130;
  c.fillStyle='#050406';c.fillRect(X0,T0,X1-X0,GB+200-T0);
  vault(c,X0,X1);
  backWall(c,X0,X1);
  PORT.forEach((P,i)=>portal(c,P,i));
  const lan=END()==='lantern';
  roundel(c);if(lan){kitLanding(c);serviceGate(c);}else sealedDoor(c);for(const S0 of SCONCE)sconce(c,S0);
  // the wall's lamps throw their light down the tiles
  for(const S0 of SCONCE){const p=q(S0.x,yW(S0.h)+8,WALL);glow(c,p.x,p.y+30,120,'#e8c88a',.08,1.4);}
  mainPit(c);platform(c);if(!lan)shaft(c);nest(c);litter(c);if(lan)crates(c);nearEdge(c);
  // the hanging lamps: chains up out of the picture, the brass cages (lit in live())
  for(const L of PEND){const p=q(L.x,yW(L.h),L.d),top=q(L.x,yW(L.h+260),L.d);c.strokeStyle='#08080a';c.lineWidth=1.4;c.beginPath();c.moveTo(p.x,p.y-14);c.lineTo(top.x,top.y);c.stroke();
    c.strokeStyle=rgba(C.gold,.3);c.lineWidth=.5;c.beginPath();for(let y=p.y-14;y>top.y;y-=4){c.moveTo(p.x-1,y);c.lineTo(p.x+1,y-2);}c.stroke();lampCage(c,p.x,p.y,1.5,L.dead);}
  // the dark gathering in the vault and at the ends, a haze in the lamps' light
  haze(c,X0,X1,q(0,yW(HS),WALL).y-20,q(0,GB,WALL).y,'#1a1614',.25,true);
  c.fillStyle=lin(c,X0,0,X1,0,[[0,rgba('#000000',.55)],[.16,rgba('#000000',0)],[.84,rgba('#000000',0)],[1,rgba('#000000',.5)]]);c.fillRect(X0,T0,X1-X0,GB+200-T0);}

// ---------- what moves ----------
// the crystals breathe (one gutters); water drips from the vault into the puddles; dust turns over in the lamps' light; the kitchen
// lift's doors open (S.kitLift); the freight cage's gate folds open (S.lift) and the cage climbs the shaft (S.liftY)
const DRIPS=[[248,52,1.7],[566,140,2.3],[690,62,3.1],[96,150,2.6],[420,30,4.1]];
const MOTES=(()=>{const r=rng(66),a=[];for(let i=0;i<36;i++){const L=PEND[i%3];a.push({x:L.x+(r()-.5)*120,d:L.d+(r()-.5)*60,h:20+r()*200,ph:r()*TAU,sp:.2+r()*.5});}return a;})();
function lampLight(L,t){if(L.dead)return Math.pow(Math.max(0,Math.sin(t*13+L.x)*Math.sin(t*3.1)),6)*.6;return .82+.12*Math.sin(t*2.1+L.x*.01)+.06*Math.sin(t*7.3+L.d);}
function live(){const t=S.t;ctx.save();
  // the lamps
  ctx.globalCompositeOperation='lighter';
  for(const L of PEND){const k=lampLight(L,t),p=q(L.x,yW(L.h),L.d);if(k<.02)continue;glow(ctx,p.x,p.y,70,C.cyan,.22*k);glow(ctx,p.x,p.y,26,'#e8c88a',.3*k);
    ctx.fillStyle=rgba(C.cyanL,.95*k);ctx.beginPath();ctx.moveTo(p.x,p.y-13);ctx.lineTo(p.x+6,p.y-3);ctx.lineTo(p.x,p.y+7);ctx.lineTo(p.x-6,p.y-3);ctx.closePath();ctx.fill();}
  for(const S0 of SCONCE){const k=lampLight({x:S0.x,d:0},t),p=q(S0.x,yW(S0.h)+8,WALL);glow(ctx,p.x,p.y,36,C.cyan,.25*k);ctx.fillStyle=rgba(C.cyanL,.9*k);ctx.beginPath();ctx.moveTo(p.x,p.y-9);ctx.lineTo(p.x+4,p.y-2);ctx.lineTo(p.x,p.y+5);ctx.lineTo(p.x-4,p.y-2);ctx.closePath();ctx.fill();}
  // dust in the light
  for(const m of MOTES){const p=q(m.x+Math.sin(t*m.sp+m.ph)*14,GB-m.h-Math.sin(t*m.sp*.7+m.ph)*10,m.d),a=.1+.12*Math.sin(t*1.3+m.ph);ctx.fillStyle=rgba('#e8f4f0',Math.max(0,a));ctx.fillRect(p.x,p.y,.9,.9);}
  ctx.globalCompositeOperation='source-over';
  // drips: a drop falls, a ring spreads on the puddle
  for(const [x,d,per] of DRIPS){const u=((t+x*.013)%per)/per,fall=u*per;const top=q(x,yW(300),d),pt=q(x,GB,d);
    if(fall<.5){const y=lerp(top.y,pt.y,Math.pow(fall/.5,2));if(y>-20){ctx.fillStyle=rgba('#cfe8f0',.5);ctx.fillRect(pt.x-.4,y,.8,2.4);}}
    else if(fall<1.4){const k=(fall-.5)/.9;ctx.strokeStyle=rgba('#cfe8f0',.35*(1-k));ctx.lineWidth=.6;ctx.beginPath();ctx.ellipse(pt.x,pt.y,2+k*12,(2+k*12)*.38,0,0,TAU);ctx.stroke();}}
  // the kitchen lift: its doors part and the steel car's light comes out across the floor
  const lan=END()==='lantern';
  if(lan&&S.kitLift>0&&typeof liftFrame==='function'){const o=clamp(S.kitLift,0,1);ctx.save();faceT(ctx,WALL);liftFrame(ctx,KL.x,GB,KL.w,KL.h,KL.fr,KL.hd);liftCabin(ctx,KL.x,GB,KL.w,KL.h);liftDoors(ctx,KL.x,GB,KL.w,KL.h,o);liftLine(ctx,KL.x,GB,KL.w,KL.h,1-o*.4);ctx.restore();
    liftSpill(ctx,KL.x,WALL,KL.w,o,150);}
  if(!lan)cage(ctx);
  ctx.restore();}
// the freight cage: the car, its folding gate and the counterweight, at the height S.liftY
function cage(c){const {x0,x1,d0,d1,h}=CAGE,up=S.liftY||0,g=clamp(S.lift||0,0,1),cx0=x0+6,cx1=x1-6,cd0=d0+4,cd1=d1-4,yb=GB-up,yt=yb-h+10;
  // the counterweight goes down as the car goes up
  {const cw=yW(100)+up,a=q(x1+6,cw,d0+20),b=q(x1+6,cw,d0+44);c.fillStyle='#16161b';c.beginPath();c.moveTo(a.x,a.y-30);c.lineTo(b.x,b.y-30);c.lineTo(b.x,b.y+14);c.lineTo(a.x,a.y+14);c.closePath();c.fill();
    c.strokeStyle=rgba(C.goldD,.7);c.lineWidth=.7;for(let k=0;k<5;k++){c.beginPath();c.moveTo(a.x,a.y-30+k*9);c.lineTo(b.x,b.y-30+k*9);c.stroke();}
    const top=q(x1+6,-300,d0+32),m=q(x1+6,cw-30,d0+32);c.strokeStyle='#1a1a20';c.lineWidth=1;c.beginPath();c.moveTo(m.x,m.y);c.lineTo(top.x,top.y);c.stroke();}
  // the car's inside: the back and the left wall seen through the bars, a lamp in its roof
  const B=(x,y,d)=>q(x,y,d);
  {const a=B(cx0,yb,cd1),b=B(cx1,yb,cd1),e=B(cx1,yt,cd1),f=B(cx0,yt,cd1);poly(c,[a,b,e,f]);c.fillStyle='#0c0d10';c.fill();
    c.strokeStyle='#1c1c22';c.lineWidth=1.2;c.beginPath();for(let x=cx0+8;x<cx1;x+=10){const p0=B(x,yb,cd1),p1=B(x,yt,cd1);c.moveTo(p0.x,p0.y);c.lineTo(p1.x,p1.y);}c.stroke();
    const l=B((cx0+cx1)/2,yt+6,(cd0+cd1)/2);c.save();c.globalCompositeOperation='lighter';glow(c,l.x,l.y,60,'#ffd9a0',.25);c.restore();c.fillStyle='#ffe9c0';c.fillRect(l.x-3,l.y-1,6,2);}
  // the floor plate
  {const pts=[B(cx0,yb,cd0),B(cx1,yb,cd0),B(cx1,yb,cd1),B(cx0,yb,cd1)];poly(c,pts);c.fillStyle='#17171c';c.fill();c.strokeStyle=rgba(C.goldD,.7);c.lineWidth=.8;c.stroke();
    c.strokeStyle=rgba('#000000',.4);c.lineWidth=.5;c.beginPath();for(let x=cx0+6;x<cx1;x+=6){const p0=B(x,yb,cd0),p1=B(x,yb,cd1);c.moveTo(p0.x,p0.y);c.lineTo(p1.x,p1.y);}c.stroke();}
  // the roof, the hoist's sheave and its cable up into the dark
  {const pts=[B(cx0,yt,cd0),B(cx1,yt,cd0),B(cx1,yt,cd1),B(cx0,yt,cd1)];poly(c,pts);c.fillStyle='#101014';c.fill();c.strokeStyle=rgba(C.gold,.5);c.lineWidth=.8;c.stroke();
    const m=B((cx0+cx1)/2,yt,(cd0+cd1)/2),top=B((cx0+cx1)/2,-400,(cd0+cd1)/2);c.strokeStyle='#202026';c.lineWidth=1.6;c.beginPath();c.moveTo(m.x,m.y);c.lineTo(top.x,top.y);c.stroke();
    c.fillStyle=C.goldD;c.beginPath();c.arc(m.x,m.y-3,4,0,TAU);c.fill();}
  // the right side of the car: bars, toward us
  {c.strokeStyle='#14141a';c.lineWidth=1.6;c.beginPath();for(let d=cd0;d<=cd1;d+=9){const p0=B(cx1,yb,d),p1=B(cx1,yt,d);c.moveTo(p0.x,p0.y);c.lineTo(p1.x,p1.y);}c.stroke();
    c.strokeStyle=rgba(C.gold,.55);c.lineWidth=1;for(const y of [yb-4,yb-h/2,yt+2]){const p0=B(cx1,y,cd0),p1=B(cx1,y,cd1);c.beginPath();c.moveTo(p0.x,p0.y);c.lineTo(p1.x,p1.y);c.stroke();}}
  if(!LIFT_FRONT_LATER&&!FRONT_BY_DEPTH)cageFront(c);}
// the car's front: its frame and the folding gate (a lattice that closes across the opening, folded to the left when open). The
// game stands it among everything else by its depth (frontItem()): a man in the car is behind his gate, a man on the platform is in
// front of it. (Without that, liftFront() draws it after the fighters when the scene's user asks for it.)
let LIFT_FRONT_LATER=false,FRONT_BY_DEPTH=typeof envItems==='function';
function frontItem(){FRONT_BY_DEPTH=true;return{d:CAGE.d0+4,draw:c=>cageFront(c||ctx)};}
function cageFront(c){const {x0,x1,d0,h}=CAGE,up=S.liftY||0,g=clamp(S.lift||0,0,1),cx0=x0+6,cx1=x1-6,cd0=d0+4,yb=GB-up,yt=yb-h+10,B=(x,y)=>q(x,y,cd0);
  c.strokeStyle='#121217';c.lineWidth=3;const f0=B(cx0,yb),f1=B(cx1,yb),f2=B(cx1,yt),f3=B(cx0,yt);c.beginPath();c.moveTo(f0.x,f0.y);c.lineTo(f3.x,f3.y);c.lineTo(f2.x,f2.y);c.lineTo(f1.x,f1.y);c.stroke();
  c.strokeStyle=rgba(C.gold,.6);c.lineWidth=.8;c.beginPath();c.moveTo(f3.x,f3.y+1.5);c.lineTo(f2.x,f2.y+1.5);c.stroke();
  // the scissor gate: n diamonds across whatever width is left closed
  const open=lerp(cx1-cx0,12,g),n=10,wcell=open/n;c.strokeStyle='#1c1c22';c.lineWidth=1.3;c.beginPath();
  for(let i=0;i<n;i++){const xa=cx0+i*wcell,xb=xa+wcell;for(let k=0;k<4;k++){const ya=yb-6-k*(h-24)/4,yb2=ya-(h-24)/4,a=B(xa,ya),b=B(xb,yb2),e=B(xb,ya),f=B(xa,yb2);c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.moveTo(e.x,e.y);c.lineTo(f.x,f.y);}}
  c.stroke();c.strokeStyle=rgba(C.goldD,.85);c.lineWidth=1.6;for(let i=0;i<=n;i++){const a=B(cx0+i*wcell,yb-4),b=B(cx0+i*wcell,yt+8);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
  // its handle
  const hp=B(cx0+open,yb-h*.42);c.fillStyle=C.gold;c.fillRect(hp.x-1.2,hp.y-6,2.4,12);
  shaftFront(c);}
// the hanging lamps again, over everything (the train standing under them, a fighter's leap): fore() for the scene's user to call
// after the fighters are drawn, with the cage's front when liftFrontLater(true) is set
function fore(c){c=c||ctx;const t=S.t;c.save();
  for(const L of PEND){const p=q(L.x,yW(L.h),L.d),top=q(L.x,yW(L.h+260),L.d);c.strokeStyle='#08080a';c.lineWidth=1.4;c.beginPath();c.moveTo(p.x,p.y-14);c.lineTo(top.x,top.y);c.stroke();lampCage(c,p.x,p.y,1.5,L.dead);
    const k=lampLight(L,t);if(k<.02)continue;c.globalCompositeOperation='lighter';glow(c,p.x,p.y,26,'#e8c88a',.3*k);c.fillStyle=rgba(C.cyanL,.95*k);c.beginPath();c.moveTo(p.x,p.y-13);c.lineTo(p.x+6,p.y-3);c.lineTo(p.x,p.y+7);c.lineTo(p.x-6,p.y-3);c.closePath();c.fill();c.globalCompositeOperation='source-over';}
  if(LIFT_FRONT_LATER&&!FRONT_BY_DEPTH&&END()==='tower')cageFront(c);c.restore();}
// a body standing in the main line's pit (the train) shows only above the platform's far edge and between the pit's ends: clip for it
function pitClip(c,d){c=c||ctx;d=d??GAUGE_C;const y=GB-EDGE*PSY;c.beginPath();c.rect(MAIN.x0+d*PSX,-1e4,MAIN.x1-MAIN.x0,y+1e4);c.clip();}
// where things are, for the scenes: in front of the kitchen lift's doors; the freight cage's floor centre (y rises with S.liftY)
function kitLiftAt(){return{x:KL.x,dep:WALL-22};}
function liftAt(){return{x:(CAGE.x0+CAGE.x1)/2,dep:(CAGE.d0+CAGE.d1)/2,y:GB-(S.liftY||0)};}
// the cage's front, over whoever is standing in it (call after the fighters are drawn, once liftFrontLater(true) is set)
function liftFront(c){if(LIFT_FRONT_LATER&&!FRONT_BY_DEPTH&&END()==='tower')cageFront(c||ctx);}
function liftFrontLater(on){LIFT_FRONT_LATER=!!on;}
// the light that rims a fighter: the nearest hanging lamp that is lit
function light(f){let best=PEND[0],bd=1e9;for(const L of PEND){if(L.dead)continue;const d=Math.abs(L.x-f.p[PEL].x);if(d<bd){bd=d;best=L;}}const p=q(best.x,yW(best.h),best.d);
  return{light:{x:p.x-f.dep*PSX,y:p.y+f.dep*PSY}};}
E.S.station={key:END,end:END,paint,live,light,fore,kitLiftAt,liftAt,liftFront,liftFrontLater,frontItem,pitClip,LAYOUT:{WALL,PIT,EDGE,NEAR,SID,MAIN,RAILS,KL,CAGE,PORT,NEST,trainGy:GB+PIT-3,trainDep:GAUGE_C}};
})();
// ===== ENV STATION END =====
