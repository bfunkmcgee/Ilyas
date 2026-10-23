// ===== ENV BACKROOM =====
// The Sump's back room, three weeks after the fall, by day: the storeroom behind the kitchen, smelling of beer and onions. Rough
// boards for walls, the light through their seams; a low ceiling of planks on beams. On the left the beer barrels on their gantry,
// sacks of onions slumped in front of them, strings of onions hung along the wall. Against the back wall the cot: a low frame, a
// mattress of ticking stuffed with straw (it shows through a split), a grey blanket rumpled half off it. By it the chair with his
// black suit over it, cut to ribbons, a little of its gold trim catching the light; the stool where the soup is set down. On the back
// wall a shelf of jars and crocks with a gap in the middle (sk_pitui.js puts the arc-blade's hilt there), the washstand under it,
// a cracked mirror over that. The window high on the right looks out on the floor of the Pit: tin roofs across the lane held down
// with tyres, a fire in a drum, its smoke, washing, someone passing, and the far wall going up into the haze, all by the dim smoky
// light that is all the Pit's floor gets. The daylight falls through it in a shaft, dust turning in it (live). At the right the side
// wall, the plank door to the kitchen standing ajar on its warm light. One oil lamp hangs from a beam.
(()=>{const E=EnvLook,{pp,poly,lin,rad,rgba,rng,lerp,clamp,TAU}=E,K=E.sump,{dim,pick,glowAt,puffAt}=K;
const DEF={far:226,cot:{x0:96,x1:300,d0:168,d1:212,top:26},chair:{x:372,d:176},shelf:{x0:448,x1:610,d:218,y:92},window:{x0:650,x1:770,y0:164,y1:96},
  door:{x:858,d:150},basin:{x:560,d:206},mirror:{x:560,y:150},stool:{x:330,d:150},crate:{x:470,d:118},floor:{x0:60,x1:830,z0:26,z1:150}};
const PL=()=>typeof ACT1_PLACES!=='undefined'&&ACT1_PLACES.backroom?ACT1_PLACES.backroom:DEF;
const CEIL=176,DOOR={w:50,h:148};
const q=(x,h,d)=>pp(x,GB-h,d);
function floorT(c){c.transform(1,0,PSX,-PSY,0,GB);}
// a box standing on the floor: x0..x1, d0..d1, h high (front, right side and top), each face its colour
function box(c,x0,x1,d0,d1,h,cF,cR,cT,z){z=z||0;const A=q(x0,z,d0),B=q(x1,z,d0),Bt=q(x1,z+h,d0),At=q(x0,z+h,d0),Cb=q(x1,z,d1),Ct=q(x1,z+h,d1),Dt=q(x0,z+h,d1);
  poly(c,[B,Cb,Ct,Bt],cR);poly(c,[At,Bt,Ct,Dt],cT);poly(c,[A,B,Bt,At],cF);return{A,B,Bt,At,Ct,Dt};}
function geo(){const L=PL(),far=L.far,ox=far*PSX,yW=GB-far*PSY,W0=L.window;
  return{L,far,ox,yW,wx:x=>x+ox,wy:h=>yW-h,win:{x0:W0.x0+ox,x1:W0.x1+ox,y0:yW-W0.y0,y1:yW-W0.y1},lamp:{x:430,d:132,h:150}};}

// ---------- the walls and the ceiling ----------
function walls(c,G){const {yW}=G,top=G.wy(CEIL),r=rng(11);
  K.boards(c,-200,top,1250,yW,{dir:'v',w:15,base:'#2a2019',seed:73,soot:.5,nails:[top+14,yW-40]});
  // daylight through the seams of the boards, here and there
  c.save();c.globalCompositeOperation='lighter';for(let i=0;i<9;i++){const x=-100+r()*1150,y0=top+20+r()*60,L=30+r()*90;c.fillStyle=lin(c,0,y0,0,y0+L,[[0,rgba('#d8cfb8',0)],[.5,rgba('#d8cfb8',.18)],[1,rgba('#d8cfb8',0)]]);c.fillRect(x,y0,1,L);}c.restore();
  // the skirting
  c.fillStyle='#110c08';c.fillRect(-200,yW-8,1450,8);c.fillStyle=rgba('#e8d8b8',.06);c.fillRect(-200,yW-8,1450,.8);
  // the ceiling: planks on beams, a little lighter than the kitchen's, a cobweb in the corner
  c.fillStyle='#0d0a08';c.fillRect(-200,-100,1450,top+100);
  for(let y=top-10;y>-100;y-=10){c.fillStyle=rgba('#2e2218',.4+.2*r());c.fillRect(-200,y,1450,9);c.fillStyle=rgba('#000000',.5);c.fillRect(-200,y+9,1450,1);}
  for(const [y,h] of [[top-14,16],[top-70,20],[top-140,26],[top-230,32]]){c.fillStyle='#1a120c';c.fillRect(-200,y-h,1450,h);c.fillStyle=rgba('#e8d8b8',.06);c.fillRect(-200,y-1.4,1450,1.4);c.fillStyle=rgba('#000000',.45);c.fillRect(-200,y-h,1450,2);}
  c.fillStyle='#1e150e';c.fillRect(-200,top-4,1450,8);c.fillStyle=rgba('#e8d8b8',.08);c.fillRect(-200,top+3,1450,1);
  c.fillStyle=lin(c,0,-100,0,top+40,[[0,'#060504'],[.7,rgba('#060504',.55)],[1,rgba('#060504',0)]]);c.fillRect(-200,-100,1450,top+140);
  {const cx=G.wx(-20),cy=top+4;c.strokeStyle=rgba('#c8c0b0',.16);c.lineWidth=.4;c.beginPath();for(let a=0;a<6;a++){c.moveTo(cx,cy);c.lineTo(cx+Math.cos(a*.3)*40,cy+Math.sin(a*.3)*40);}for(let k=1;k<4;k++){c.moveTo(cx+k*10,cy);for(let a=1;a<6;a++)c.lineTo(cx+Math.cos(a*.3)*k*10,cy+Math.sin(a*.3)*k*10);}c.stroke();}}

// ---------- the window: the floor of the Pit by its dim day ----------
function windowView(c,G){const w=G.win,W=w.x1-w.x0,Hh=w.y1-w.y0,r=rng(61);
  c.save();c.beginPath();c.rect(w.x0,w.y0,W,Hh);c.clip();
  // the haze the day comes down through, pale at the top
  c.fillStyle=lin(c,0,w.y0,0,w.y1,[[0,'#8a8478'],[.4,'#5a5248'],[1,'#3a3028']]);c.fillRect(w.x0,w.y0,W,Hh);
  // the far wall, its shacks and junk grey in the smoke
  {const rows=[w.y0+Hh*.18,w.y0+Hh*.36,w.y0+Hh*.54];rows.forEach((ry,i)=>{const a=.35+i*.15;let x=w.x0-10;while(x<w.x1+10){const sw=6+r()*12,sh=3+r()*5;c.fillStyle=rgba(dim('#3a3430','#6a6058',.5-i*.2),a+.25);c.fillRect(x,ry-sh,sw,sh);c.fillStyle=rgba('#2a2420',a);c.fillRect(x-1,ry-sh-1,sw+2,1.2);x+=sw+r()*3;}
      c.fillStyle=rgba('#2e2824',a);c.fillRect(w.x0,ry,W,2.4);});}
  c.fillStyle=lin(c,0,w.y0,0,w.y0+Hh*.6,[[0,rgba('#9a9282',.5)],[1,rgba('#9a9282',0)]]);c.fillRect(w.x0,w.y0,W,Hh*.6);
  // across the lane: the shacks of the floor, tin roofs patched and weighted with tyres, a doorway, washing on a line
  const lane=w.y1-Hh*.1;
  {let x=w.x0-6;const tops=[];while(x<w.x1+6){const sw=18+r()*26,sh=Hh*(.22+r()*.16),rt=(r()-.5)*4;c.fillStyle=pick(r,['#2e2620','#33281f','#2a2422','#3a2c22']);c.fillRect(x,lane-sh,sw,sh);
      c.fillStyle=pick(r,['#4a3a30','#5a4434','#46403a','#5a3a28']);c.beginPath();c.moveTo(x-2,lane-sh-rt-1);c.lineTo(x+sw+2,lane-sh+rt-1);c.lineTo(x+sw+2,lane-sh+rt+2);c.lineTo(x-2,lane-sh-rt+2);c.closePath();c.fill();
      c.fillStyle=rgba('#c8b8a0',.12);c.fillRect(x-2,lane-sh-rt-1,sw+4,.7);
      if(r()<.6){c.strokeStyle='#151214';c.lineWidth=1.2;c.beginPath();c.ellipse(x+sw*(.3+r()*.4),lane-sh-2.4,2.6,1.2,0,0,TAU);c.stroke();}
      if(r()<.5){c.fillStyle='#120e0c';c.fillRect(x+sw*.6,lane-sh*.62,5,sh*.62);}
      if(r()<.4){c.fillStyle=rgba('#1a1614',.8);c.fillRect(x+3,lane-sh*.7,4,3);}
      tops.push([x+sw,lane-sh]);x+=sw+1+r()*3;}
    if(tops.length>2){const [ax,ay]=tops[0],[bx,by]=tops[2];c.strokeStyle=rgba('#2a2420',.7);c.lineWidth=.4;c.beginPath();c.moveTo(ax,ay+2);c.quadraticCurveTo((ax+bx)/2,Math.max(ay,by)+8,bx,by+2);c.stroke();
      for(let i=1;i<5;i++){const u=i/5,x=lerp(ax,bx,u),y=lerp(ay+2,by+2,u)+8*4*u*(1-u)*.5;c.fillStyle=pick(r,['#6a5a4a','#4a5a6a','#7a6a5a','#5a4a4a']);c.fillRect(x-1.6,y,3.2,4+r()*2);}}}
  // the lane: mud, a puddle with the sky in it
  c.fillStyle='#2a221c';c.fillRect(w.x0,lane,W,w.y1-lane);c.fillStyle=rgba('#9a9282',.2);c.beginPath();c.ellipse(w.x0+W*.66,lane+Hh*.05,W*.12,1.4,0,0,TAU);c.fill();
  // the drum with its fire (the flames are live), its smoke going up across the far wall
  const dr={x:w.x0+W*.3,y:lane+2};c.fillStyle='#2a1c16';c.fillRect(dr.x-4,dr.y-9,8,9);c.fillStyle='#1a120e';c.fillRect(dr.x-4,dr.y-6,8,1);
  c.restore();
  return{dr,lane};}
function windowFrame(c,G){const w=G.win,W=w.x1-w.x0,Hh=w.y1-w.y0;
  c.save();c.beginPath();c.rect(w.x0,w.y0,W,Hh);c.clip();
  // dirty glass: grime gathered in the corners and along the bottom, a crack across the upper left pane
  c.fillStyle=rad(c,w.x0+W/2,w.y0+Hh*.45,Math.min(W,Hh)*.25,Math.max(W,Hh)*.7,[[0,rgba('#3a3228',0)],[1,rgba('#3a3228',.55)]]);c.fillRect(w.x0,w.y0,W,Hh);
  c.fillStyle=lin(c,0,w.y1-10,0,w.y1,[[0,rgba('#2a2018',0)],[1,rgba('#2a2018',.5)]]);c.fillRect(w.x0,w.y1-10,W,10);
  c.strokeStyle=rgba('#e8e8e0',.35);c.lineWidth=.5;c.beginPath();c.moveTo(w.x0+4,w.y0+8);c.lineTo(w.x0+W*.2,w.y0+Hh*.22);c.lineTo(w.x0+W*.3,w.y0+Hh*.18);c.lineTo(w.x0+W*.48,w.y0+Hh*.3);c.moveTo(w.x0+W*.2,w.y0+Hh*.22);c.lineTo(w.x0+W*.24,w.y0+Hh*.4);c.stroke();
  c.restore();
  c.strokeStyle='#1a120c';c.lineWidth=5;c.strokeRect(w.x0-2.5,w.y0-2.5,W+5,Hh+5);c.lineWidth=2.2;c.beginPath();c.moveTo(w.x0+W/2,w.y0);c.lineTo(w.x0+W/2,w.y1);c.moveTo(w.x0,w.y0+Hh*.5);c.lineTo(w.x1,w.y0+Hh*.5);c.stroke();
  c.strokeStyle=rgba('#e8dcc0',.14);c.lineWidth=.7;c.strokeRect(w.x0-5,w.y0-5,W+10,Hh+10);
  // the sill, and a sacking curtain hooked back to one side
  c.fillStyle='#2e2016';c.fillRect(w.x0-10,w.y1+2,W+20,5);c.fillStyle=rgba('#e8dcc0',.2);c.fillRect(w.x0-10,w.y1+2,W+20,1);
  c.fillStyle='#5a4a34';c.beginPath();c.moveTo(w.x0-12,w.y0-8);c.lineTo(w.x0+10,w.y0-8);c.quadraticCurveTo(w.x0+4,w.y0+Hh*.4,w.x0+12,w.y0+Hh*.62);c.quadraticCurveTo(w.x0-2,w.y0+Hh*.7,w.x0-4,w.y1+2);c.lineTo(w.x0-12,w.y1+2);c.closePath();c.fill();
  c.fillStyle=rgba('#000000',.3);c.fillRect(w.x0-6,w.y0-8,2,Hh+10);c.strokeStyle='#2a1c10';c.lineWidth=1.2;c.beginPath();c.moveTo(w.x0-14,w.y0-9);c.lineTo(w.x1+12,w.y0-9);c.stroke();}

// ---------- the daylight falling through the window ----------
function shaft(c,G){const w=G.win,a=q(G.L.window.x0-30,0,G.far-70),b=q(G.L.window.x1-30,0,G.far-70),e=q(G.L.window.x1-60,0,G.far-140),f=q(G.L.window.x0-60,0,G.far-140);
  c.save();c.globalCompositeOperation='lighter';
  const mid={x:(w.x0+w.x1)/2,y:(w.y0+w.y1)/2},sc=(p,k)=>({x:mid.x+(p.x-mid.x)*k,y:p.y});
  for(const k of [1,.8,.6]){c.fillStyle=lin(c,0,w.y0,0,e.y,[[0,rgba('#e8dcc0',.035)],[1,rgba('#e8dcc0',0)]]);const P2=[{x:w.x0,y:w.y0},{x:w.x1,y:w.y0},b,e,f,a,{x:w.x0,y:w.y1}].map(p=>sc(p,k));
    c.beginPath();c.moveTo(P2[0].x,P2[0].y);for(const p of P2)c.lineTo(p.x,p.y);c.closePath();c.fill();}
  // where it lies on the floor
  floorT(c);const cx=(G.L.window.x0+G.L.window.x1)/2-45,cd=G.far-105;c.translate(cx,cd);c.scale(1.6,1);c.fillStyle=rad(c,0,0,4,50,[[0,rgba('#e8dcc0',.11)],[.6,rgba('#e8dcc0',.04)],[1,rgba('#e8dcc0',0)]]);c.fillRect(-50,-50,100,100);
  c.restore();}

// ---------- the barrels and the onions, on the left ----------
function barrels(c,G){const r=rng(31),d=G.far-22;
  // the gantry: two beams on blocks, two barrels lying on it with their heads to us, one standing at its end, one up on the others
  {const g0=q(-90,0,d),g1=q(42,0,d);c.fillStyle='#1a120a';c.fillRect(g0.x,g0.y-14,g1.x-g0.x,6);c.fillStyle=rgba('#e8d8b8',.08);c.fillRect(g0.x,g0.y-14,g1.x-g0.x,.8);for(const x of [-80,-20,36]){const p=q(x,0,d);c.fillStyle='#120c08';c.fillRect(p.x-5,p.y-10,10,10);}}
  for(const [x,h,y] of [[-48,46,14],[12,46,14],[-18,42,52]]){const p=q(x,y,d),R=h/2;
    c.fillStyle='#3a2414';c.beginPath();c.ellipse(p.x,p.y-R,R*.92,R,0,0,TAU);c.fill();
    c.fillStyle='#4e3018';c.beginPath();c.ellipse(p.x,p.y-R,R*.78,R*.86,0,0,TAU);c.fill();
    c.strokeStyle=rgba('#000000',.35);c.lineWidth=.7;c.beginPath();for(let i=-3;i<=3;i++){c.moveTo(p.x+i*R*.22,p.y-R-R*.8*Math.sqrt(1-(i*.22/.78)**2));c.lineTo(p.x+i*R*.22,p.y-R+R*.8*Math.sqrt(1-(i*.22/.78)**2));}c.stroke();
    c.strokeStyle='#16130f';c.lineWidth=2.4;c.beginPath();c.ellipse(p.x,p.y-R,R*.92,R,0,0,TAU);c.stroke();c.strokeStyle=rgba('#e8d0a8',.16);c.lineWidth=.7;c.beginPath();c.ellipse(p.x,p.y-R,R*.9,R*.98,0,-2.4,-.6);c.stroke();
    c.fillStyle='#120c08';c.beginPath();c.arc(p.x,p.y-R*1.05,2.2,0,TAU);c.fill();c.fillStyle='#8a6a32';c.fillRect(p.x-1.2,p.y-R*.55,2.4,6);
    c.fillStyle=rgba('#1a0e06',.35);c.beginPath();c.ellipse(p.x,p.y-R*.3,R*.5,R*.18,0,0,TAU);c.fill();}
  {const p=q(66,0,d-6);K.barrel(c,p.x,p.y,38,56,{hi:1,col:'#40281a',bung:1});}
  // a beer stain on the boards under the taps, a cup on the floor
  c.save();floorT(c);c.fillStyle=rgba('#0a0604',.4);c.beginPath();c.ellipse(-60,d-26,40,12,0,0,TAU);c.fill();c.restore();
  {const p=q(-30,0,d-34);c.fillStyle='#5a5a5e';c.fillRect(p.x-3,p.y-6,6,6);c.strokeStyle='#5a5a5e';c.lineWidth=1;c.beginPath();c.arc(p.x+3.4,p.y-3,2,-1.2,1.2);c.stroke();}
  // sacks of onions slumped in front of them, onions out of the open one
  for(const [x,dd,w,h,mesh] of [[34,164,26,24,1],[70,174,22,26,1],[8,180,24,22,0]]){const p=q(x,0,dd);K.sack(c,p.x,p.y,w,h,{col:mesh?'#7a6a4a':'#6a5a3e',mesh:!!mesh,seed:x*7});}
  for(let i=0;i<7;i++){const p=q(46+r()*40,0,146+r()*18);c.fillStyle=pick(r,['#8a5a26','#9a6a2e','#7a4a20']);c.beginPath();c.ellipse(p.x,p.y-3,3.4,3,0,0,TAU);c.fill();c.fillStyle=rgba('#ffd9a0',.2);c.beginPath();c.ellipse(p.x+1,p.y-4,1.4,1.2,0,0,TAU);c.fill();}
  // strings of onions along the wall from the beam
  {const y=G.wy(146);c.fillStyle='#1c130c';c.fillRect(G.wx(-140),y-2,G.wx(110)-G.wx(-140),3.4);c.fillStyle=rgba('#e8d8b8',.08);c.fillRect(G.wx(-140),y-2,G.wx(110)-G.wx(-140),.8);for(const bx of [-130,-10,100]){c.fillStyle='#0c0806';c.fillRect(G.wx(bx)-1,y-30,2,30);}}
  for(const [x,n,h] of [[-120,11,145],[-96,9,145],[-70,12,145],[-44,8,145],[-18,11,145],[10,9,145],[36,12,145],[62,9,145],[86,10,145],[318,9,124],[334,10,124],[350,8,124]]){const p=G.wx(x),y=G.wy(h);if(h<140){c.fillStyle='#0c0806';c.fillRect(p-1,y-2,2,3);}K.onions(c,p,y,n,{seed:x*13+5,side:1,lit:.8});}
}

// ---------- the cot ----------
function cot(c,G){const C=G.L.cot,{x0,x1,d0,d1,top}=C,r=rng(41),leg=top-10;
  // its frame: legs, the rails, the slats under the mattress
  const legAt=(x,d)=>{const a=q(x-2.5,0,d),b=q(x+2.5,leg,d);c.fillStyle='#2a1c12';c.fillRect(a.x,b.y,b.x-a.x,a.y-b.y);};
  legAt(x0+4,d1-3);legAt(x1-4,d1-3);
  {const a=q(x0,leg,d0),b=q(x1,leg+5,d0);c.fillStyle='#3a2818';c.fillRect(a.x,b.y,b.x-a.x,a.y-b.y);c.fillStyle=rgba('#e8d8b8',.12);c.fillRect(a.x,b.y,b.x-a.x,.8);}
  poly(c,[q(x1,leg,d0),q(x1,leg,d1),q(x1,leg+5,d1),q(x1,leg+5,d0)],'#24180e');
  legAt(x0+4,d0+3);legAt(x1-4,d0+3);
  // the mattress: ticking, lumpy with straw, a split with the straw coming out
  const mt=top+1,M0=q(x0+2,leg+5,d0+1),M1=q(x1-2,leg+5,d0+1),M2=q(x1-2,mt,d1-1),M3=q(x0+2,mt,d1-1),T0=q(x0+2,mt,d0+1),T1=q(x1-2,mt,d0+1);
  c.fillStyle='#7a7266';c.beginPath();c.moveTo(M0.x,M0.y);c.lineTo(M1.x,M1.y);c.quadraticCurveTo(M1.x+3,(M1.y+T1.y)/2,T1.x,T1.y);c.lineTo(M2.x,M2.y);c.lineTo(M3.x,M3.y);c.lineTo(T0.x,T0.y);c.quadraticCurveTo(M0.x-3,(M0.y+T0.y)/2,M0.x,M0.y);c.closePath();c.fill();
  c.save();c.clip();c.strokeStyle=rgba('#3a4a5a',.35);c.lineWidth=1.2;for(let d=d0+4;d<d1;d+=5){const p0=q(x0,mt,d),p1=q(x1,mt,d);c.beginPath();c.moveTo(p0.x,p0.y);c.lineTo(p1.x,p1.y);c.stroke();}
  for(let x=x0+6;x<x1;x+=5){const p0=q(x,leg+5,d0+1),p1=q(x,mt,d0+1);c.beginPath();c.moveTo(p0.x,p0.y);c.lineTo(p1.x,p1.y);c.stroke();}
  for(let i=0;i<10;i++){const p=q(lerp(x0+10,x1-10,r()),mt,lerp(d0+6,d1-6,r()));c.fillStyle=rgba(r()<.5?'#000000':'#e8e0d0',.08);c.beginPath();c.ellipse(p.x,p.y,8+r()*10,2+r()*2,0,0,TAU);c.fill();}
  c.fillStyle=lin(c,0,T0.y,0,M0.y,[[0,rgba('#000000',0)],[1,rgba('#000000',.35)]]);c.fillRect(M0.x-4,T0.y,M1.x-M0.x+8,M0.y-T0.y+2);c.restore();
  {const p=q(x0+40,leg+8,d0+1);c.fillStyle='#2a2418';c.beginPath();c.ellipse(p.x,p.y,10,2.2,0,0,TAU);c.fill();c.strokeStyle='#d8b860';c.lineWidth=.6;c.beginPath();for(let i=0;i<12;i++){c.moveTo(p.x-8+r()*16,p.y);c.lineTo(p.x-8+r()*16+(r()-.5)*6,p.y+(r()-.3)*5);}c.stroke();}
  // the pillow: a sack stuffed with straw at the head (the left end), the blanket rumpled toward the foot and half off the front
  {const p=q(x0+48,mt,lerp(d0,d1,.5));c.fillStyle='#8a7a5a';c.beginPath();c.ellipse(p.x,p.y-3,14,5.4,-.08,0,TAU);c.fill();c.fillStyle=rgba('#000000',.2);c.beginPath();c.ellipse(p.x+2,p.y-1,11,3,-.08,0,TAU);c.fill();}
  {const pts=[],N=10,bx0=x0+112,bx1=x1-4;
    // its top: over the foot of the mattress in a few rucks
    for(let i=0;i<=N;i++){const u=i/N,x=lerp(bx0,bx1,u);pts.push(q(x,mt+2+Math.sin(u*9+1)*2.2+(u>.1&&u<.9?2:0),d1-3));}
    const fr=[];for(let i=N;i>=0;i--){const u=i/N,x=lerp(bx0,bx1,u);fr.push(q(x,mt+2+Math.sin(u*7)*1.4,d0+2));}
    const hang=[];for(let i=0;i<=N;i++){const u=i/N,x=lerp(bx0-4,bx1-6,u);hang.push(q(x,leg-6-Math.abs(Math.sin(u*6.3+.4))*7,d0-2));}
    c.fillStyle='#3e3b38';c.beginPath();c.moveTo(pts[0].x,pts[0].y);for(const p of pts)c.lineTo(p.x,p.y);for(const p of fr)c.lineTo(p.x,p.y);c.closePath();c.fill();
    c.fillStyle='#34312f';c.beginPath();c.moveTo(fr[fr.length-1].x,fr[fr.length-1].y);for(let i=fr.length-1;i>=0;i--)c.lineTo(fr[i].x,fr[i].y);for(let i=hang.length-1;i>=0;i--)c.lineTo(hang[i].x,hang[i].y);c.closePath();c.fill();
    // its stripe near the end, the folds of it, the light along the rucks
    {const a=q(bx1-24,mt+3,d1-3),b=q(bx1-18,mt+3,d1-3),e=q(bx1-16,leg-8,d0-2),f=q(bx1-22,leg-8,d0-2);c.fillStyle=rgba('#5a2420',.7);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineTo(e.x,e.y);c.lineTo(f.x,f.y);c.closePath();c.fill();}
    c.strokeStyle=rgba('#1a1816',.55);c.lineWidth=1.4;c.beginPath();for(let i=1;i<N;i+=2){const t=pts[i],h=hang[i];c.moveTo(t.x+2,t.y+3);c.quadraticCurveTo((t.x+h.x)/2+5,(t.y+h.y)/2,h.x+1,h.y-2);}c.stroke();
    c.strokeStyle=rgba('#d8d4cc',.12);c.lineWidth=.9;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y+.5):c.moveTo(p.x,p.y+.5));c.stroke();
    c.strokeStyle=rgba('#d8d4cc',.08);c.beginPath();fr.forEach((p,i)=>i?c.lineTo(p.x,p.y+.5):c.moveTo(p.x,p.y+.5));c.stroke();}
  // under it in the dark: a chamber pot, his boots gone
  {const p=q(x1-40,0,d0+18);c.fillStyle='#4a4a4e';c.beginPath();c.ellipse(p.x,p.y-4,7,4,0,0,TAU);c.fill();c.fillStyle=rgba('#000000',.4);c.beginPath();c.ellipse(p.x,p.y-6,6,1.6,0,0,TAU);c.fill();}}

// ---------- the chair, and his suit over it, cut to ribbons ----------
function chair(c,G){const Ch=G.L.chair,x=Ch.x,d=Ch.d,sh=30,bk=78,w=30,dd=24,r=rng(51);
  const at=(xx,h,de)=>q(xx,h,de);
  // the back legs and the back's uprights, the seat, the front legs
  const post=(xx,de,h0,h1,wd,col)=>{const a=at(xx,h0,de),b=at(xx,h1,de);c.strokeStyle=col;c.lineWidth=wd;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();};
  c.lineCap='butt';post(x-w/2+2,d+dd/2,0,bk,3,'#2a1a10');post(x+w/2-2,d+dd/2,0,bk,3,'#2a1a10');
  for(const h of [bk-6,bk-22]){const a=at(x-w/2+2,h,d+dd/2),b=at(x+w/2-2,h,d+dd/2);c.strokeStyle='#3a2616';c.lineWidth=4;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
  poly(c,[at(x-w/2,sh,d-dd/2),at(x+w/2,sh,d-dd/2),at(x+w/2,sh,d+dd/2),at(x-w/2,sh,d+dd/2)],'#4a3220');
  {const a=at(x-w/2,sh,d-dd/2),b=at(x+w/2,sh-3,d-dd/2);c.fillStyle='#2a1a10';c.fillRect(a.x,a.y,b.x-a.x,3);}
  post(x-w/2+2,d-dd/2+2,0,sh-3,3,'#3a2414');post(x+w/2-2,d-dd/2+2,0,sh-3,3,'#3a2414');
  // the jacket over the back: black wool cut through, its lining showing, strips hanging; the trousers over the seat, in ribbons
  const tb=at(x,bk+2,d+dd/2),j0=at(x-w/2-6,bk-2,d+dd/2),j1=at(x+w/2+8,bk-4,d+dd/2);
  c.fillStyle='#0e0d12';c.beginPath();c.moveTo(j0.x,j0.y);c.quadraticCurveTo(tb.x,tb.y-6,j1.x,j1.y);c.lineTo(j1.x+4,j1.y+40);
  for(let i=0;i<9;i++){const u=i/8,xx=lerp(j1.x+4,j0.x-3,u),yy=j1.y+40+(i%2?14+r()*16:2+r()*6);c.lineTo(xx,yy);}c.closePath();c.fill();
  c.fillStyle='#3a1a24';c.beginPath();c.moveTo(tb.x-4,tb.y+2);c.lineTo(tb.x+6,tb.y+3);c.lineTo(tb.x+3,tb.y+24);c.lineTo(tb.x-3,tb.y+22);c.closePath();c.fill();
  c.strokeStyle='#0e0d12';c.lineCap='round';for(let i=0;i<7;i++){const sx=lerp(j0.x,j1.x,.1+i*.13),sy=j1.y+30+r()*10,L=14+r()*26;c.lineWidth=1.6+r()*1.6;c.beginPath();c.moveTo(sx,sy);c.quadraticCurveTo(sx+(r()-.5)*6,sy+L*.5,sx+(r()-.5)*8,sy+L);c.stroke();}
  // a sleeve down the front of the seat, and the trousers in ribbons over the seat's edge to the floor
  {const s0=at(x+w/2,sh+2,d),s1=at(x+w/2+4,6,d-6);c.strokeStyle='#121118';c.lineWidth=6;c.beginPath();c.moveTo(s0.x,s0.y);c.quadraticCurveTo(s0.x+8,(s0.y+s1.y)/2,s1.x,s1.y);c.stroke();}
  for(let i=0;i<8;i++){const p=at(lerp(x-w/2+2,x+w/2-2,i/7),sh+1,d-dd/2+1),L=12+r()*16;c.strokeStyle=i%3?'#0e0d12':'#16151c';c.lineWidth=2+r()*1.5;c.beginPath();c.moveTo(p.x,p.y);c.quadraticCurveTo(p.x+(r()-.5)*4,p.y+L*.5,p.x+(r()-.5)*7,p.y+L);c.stroke();}
  // the gold of its trim, here and there along a cut edge and the cuff
  c.strokeStyle='#c8a050';c.lineWidth=.8;c.beginPath();c.moveTo(j0.x+4,j0.y+4);c.quadraticCurveTo(tb.x,tb.y-2,j1.x-6,j1.y+3);c.stroke();
  c.strokeStyle='#e2b65a';c.lineWidth=.7;c.beginPath();for(let i=0;i<4;i++){const p=at(lerp(x-w/2,x+w/2,.15+i*.24),sh-8-r()*16,d+dd/2);c.moveTo(p.x,p.y);c.lineTo(p.x+(r()-.5)*2,p.y+5+r()*6);}c.stroke();
  glowAt(c,j0.x+12,j0.y+4,10,'#ffe2a3',.3);
  // a shred on the floor under it
  {const p=at(x+w/2+10,0,d-16);c.fillStyle='#0e0d12';c.beginPath();c.moveTo(p.x-8,p.y);c.quadraticCurveTo(p.x,p.y-3,p.x+10,p.y+1);c.lineTo(p.x+8,p.y+2);c.quadraticCurveTo(p.x,p.y-1,p.x-7,p.y+2);c.closePath();c.fill();c.strokeStyle='#c8a050';c.lineWidth=.5;c.beginPath();c.moveTo(p.x-6,p.y+.6);c.lineTo(p.x+6,p.y);c.stroke();}}

// ---------- the stool ----------
function stool(c,G){const St=G.L.stool,x=St.x,d=St.d,h=28,R=11;
  for(const [a,dd] of [[-.9,1],[.9,1],[0,-1]]){const t=q(x+a*R*.7,h-2,d+dd*R*.4),b=q(x+a*R*1.05,0,d+dd*R*.7);c.strokeStyle=dd>0?'#24180e':'#3a2616';c.lineWidth=3;c.beginPath();c.moveTo(t.x,t.y);c.lineTo(b.x,b.y);c.stroke();}
  const p=q(x,h,d);c.fillStyle='#3a2616';c.beginPath();c.ellipse(p.x,p.y+1.6,R,R*.42,0,0,TAU);c.fill();c.fillStyle='#5a3e26';c.beginPath();c.ellipse(p.x,p.y,R,R*.42,0,0,TAU);c.fill();
  c.strokeStyle=rgba('#2a1a0c',.5);c.lineWidth=.5;c.beginPath();c.ellipse(p.x,p.y,R*.6,R*.24,0,0,TAU);c.stroke();c.fillStyle=rgba('#e8dcc0',.12);c.beginPath();c.ellipse(p.x+3,p.y-1,R*.5,R*.12,0,Math.PI,TAU);c.fill();}

// ---------- the shelf, the washstand, the mirror ----------
function shelf(c,G){const Sh=G.L.shelf,{x0,x1,d,y}=Sh,mid=(x0+x1)/2,r=rng(71),gap=[mid-10,mid+26];
  // the brackets, the board, what is on it (none of it in the gap where the hilt lies)
  for(const bx of [x0+8,x1-10]){const a=q(bx,y,d),b=q(bx,y-14,d+6);c.strokeStyle='#1a120a';c.lineWidth=2.4;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
  let x=x0+6;while(x<x1-8){if(x>gap[0]-12&&x<gap[1]){x=gap[1]+2;continue;}const k=r(),p=q(x,y,d);
    if(k<.36){const ww=9+r()*7,hh=11+r()*9;K.crock(c,p.x+ww/2,p.y,ww,hh,{col:pick(r,['#8a6a46','#6a4a30','#b8a080','#5a4a3a']),band:r()<.4?'#3a3a5a':null,cloth:r()<.4?'#c8b890':null});x+=ww+3;}
    else if(k<.72){const ww=7+r()*4,hh=9+r()*7;K.jar(c,p.x+ww/2,p.y,ww,hh,{fill:pick(r,['#8a6a2a','#6a7a3a','#d8c8a8','#9a5a2a','#c8c0a0']),lev:.5+r()*.4});x+=ww+3;}
    else if(k<.86){c.fillStyle='#2a3a2a';c.fillRect(p.x,p.y-14,4,14);c.fillRect(p.x+1,p.y-18,2,4);c.fillStyle=rgba('#c8e0c8',.25);c.fillRect(p.x+.8,p.y-12,.8,10);x+=7;}
    else{c.fillStyle='#e8e0cc';c.fillRect(p.x,p.y-8,4,8);c.fillStyle='#3a2a1a';c.fillRect(p.x+1.6,p.y-10,.8,2);x+=8;}}
  poly(c,[q(x0,y,d-6),q(x1,y,d-6),q(x1,y,d+4),q(x0,y,d+4)],'#3a2818');
  {const a=q(x0,y,d-6),b=q(x1,y-4,d-6);c.fillStyle='#24180e';c.fillRect(a.x,a.y,b.x-a.x,4);c.fillStyle=rgba('#e8d8b8',.16);c.fillRect(a.x,a.y,b.x-a.x,.8);}
}
function washstand(c,G){const Bs=G.L.basin,x=Bs.x,d=Bs.d,w=40,dd=18,h=50,r=rng(81);
  const B=box(c,x-w/2,x+w/2,d-dd/2,d+dd/2,h,'#3a2616','#24180e','#4a3220');
  // a cupboard door, a rail with a towel on its end; the enamel basin, a jug in it, soap
  c.strokeStyle=rgba('#000000',.4);c.lineWidth=1;c.strokeRect(B.A.x+4,B.At.y+8,B.B.x-B.A.x-8,B.A.y-B.At.y-12);c.fillStyle='#1a120a';c.fillRect(B.B.x-9,(B.At.y+B.A.y)/2,2,4);
  {const a=q(x+w/2+2,h-6,d-dd/2),b=q(x+w/2+2,h-6,d+dd/2);c.strokeStyle='#2a1c10';c.lineWidth=1.6;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
    c.fillStyle='#b8b0a0';c.beginPath();c.moveTo(a.x-1,a.y);c.lineTo(a.x+4,a.y-1);c.lineTo(a.x+5,a.y+20);c.lineTo(a.x,a.y+18);c.closePath();c.fill();c.fillStyle=rgba('#5a6a8a',.5);c.fillRect(a.x,a.y+12,5,1.6);}
  const p=q(x,h,d);c.fillStyle='#d8d4c8';c.beginPath();c.ellipse(p.x,p.y-1,15,4.4,0,0,TAU);c.fill();c.fillStyle='#a8a498';c.beginPath();c.moveTo(p.x-15,p.y-1);c.quadraticCurveTo(p.x,p.y+9,p.x+15,p.y-1);c.closePath();c.fill();
  c.fillStyle='#9a9a94';c.beginPath();c.ellipse(p.x,p.y-1,12,3,0,0,TAU);c.fill();c.fillStyle='#2a2a2e';for(let i=0;i<4;i++){c.beginPath();c.ellipse(p.x-14+r()*28,p.y-1+r()*4,1.2,.8,0,0,TAU);c.fill();}
  {const j=q(x+6,h+2,d+2);c.fillStyle='#e0dcd0';c.beginPath();c.moveTo(j.x-5,j.y);c.quadraticCurveTo(j.x-7,j.y-10,j.x-3,j.y-16);c.lineTo(j.x+4,j.y-17);c.lineTo(j.x+6,j.y-15);c.lineTo(j.x+3,j.y-14);c.quadraticCurveTo(j.x+7,j.y-8,j.x+5,j.y);c.closePath();c.fill();
    c.strokeStyle='#e0dcd0';c.lineWidth=1.4;c.beginPath();c.arc(j.x-6,j.y-9,3.4,1.6,4.6);c.stroke();c.fillStyle=rgba('#4a5a7a',.5);c.fillRect(j.x-5,j.y-7,9,1.2);}
  {const s=q(x-12,h,d-4);c.fillStyle='#c8b888';c.fillRect(s.x-3,s.y-2.6,6,2.6);}}
function mirror(c,G){const M=G.L.mirror,x=G.wx(M.x),y=G.wy(M.y),w=26,h=32,r=rng(91);
  c.strokeStyle='#2a2420';c.lineWidth=.6;c.beginPath();c.moveTo(x-w/2+2,y-h/2);c.lineTo(x,y-h/2-10);c.lineTo(x+w/2-2,y-h/2);c.stroke();c.fillStyle='#1a1410';c.fillRect(x-1,y-h/2-11,2,2);
  c.fillStyle='#4a4440';c.fillRect(x-w/2-2,y-h/2-2,w+4,h+4);
  // the glass: the room's dim light in it, the window's pale streak, the crack and its star
  c.fillStyle=lin(c,0,y-h/2,0,y+h/2,[[0,'#6a6660'],[.5,'#4a4640'],[1,'#3a3430']]);c.fillRect(x-w/2,y-h/2,w,h);
  c.fillStyle=rgba('#d8d4c8',.2);c.beginPath();c.moveTo(x+w*.1,y-h/2);c.lineTo(x+w*.3,y-h/2);c.lineTo(x-w*.1,y+h/2);c.lineTo(x-w*.3,y+h/2);c.closePath();c.fill();
  const cx=x+w*.18,cy=y-h*.12;c.strokeStyle=rgba('#f0f0e8',.55);c.lineWidth=.45;c.beginPath();c.moveTo(x-w/2,y+h*.32);c.lineTo(cx,cy);c.lineTo(x+w/2,y-h*.38);
  for(let i=0;i<6;i++){const a=r()*TAU,L=3+r()*7;c.moveTo(cx,cy);c.lineTo(cx+Math.cos(a)*L,cy+Math.sin(a)*L);}c.stroke();
  c.fillStyle=rgba('#000000',.25);c.fillRect(x-w/2,y+h/2-6,w,6);}

// ---------- crates on the right, the side wall and the kitchen door ----------
function crates(c,G){const r=rng(17);
  for(const [x,d,w,dd,h,z] of [[784,196,40,26,30,0],[790,198,34,22,26,30],[742,206,30,18,22,0]]){const B=box(c,x,x+w,d,d+dd,h,'#3a2a1a','#24180e','#4a3622',z);
    c.strokeStyle=rgba('#000000',.4);c.lineWidth=.8;for(const k of [.33,.66]){c.beginPath();c.moveTo(B.A.x+.5,lerp(B.A.y,B.At.y,k));c.lineTo(B.B.x-.5,lerp(B.B.y,B.Bt.y,k));c.stroke();}
    c.strokeStyle=rgba('#e8d8b8',.12);c.beginPath();c.moveTo(B.At.x,B.At.y);c.lineTo(B.Bt.x,B.Bt.y);c.stroke();
    if(r()<.7){const m=q(x+w/2,z+h/2,d);c.fillStyle=rgba('#1a1008',.5);c.font='700 5px "Alegreya SC",Georgia,serif';c.textAlign='center';c.fillText(pick(r,['ALE','SALT','LAMP OIL']),m.x,m.y+2);}}}
function sideWall(c,G){const D=G.L.door,xw=D.x,far=G.far,d0=D.d-DOOR.w/2,d1=D.d+DOOR.w/2,top=CEIL;
  // beyond the side wall: dark (its back edge stands straight up at the back wall's end)
  {const a=q(xw,0,-60),b=q(xw,0,far);c.fillStyle='#070505';c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineTo(b.x,-200);c.lineTo(1500,-200);c.lineTo(1500,800);c.lineTo(a.x,800);c.closePath();c.fill();}
  // the wall itself, seen nearly edge on: boards, and the doorway in it
  const face=(da,db,h0,h1,col)=>poly(c,[q(xw,h0,da),q(xw,h0,db),q(xw,h1,db),q(xw,h1,da)],col);
  face(-60,d0,0,top,'#1e1610');face(d1,far,0,top,'#1e1610');face(d0,d1,DOOR.h,top,'#1e1610');
  c.strokeStyle=rgba('#000000',.4);c.lineWidth=.8;for(let h=10;h<top;h+=12){if(h<DOOR.h)continue;const a=q(xw,h,d0),b=q(xw,h,d1);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
  for(const [da,db] of [[-60,d0],[d1,far]])for(let h=8;h<top;h+=14){const a=q(xw,h,da),b=q(xw,h,db);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
  // the kitchen through the doorway: its warm light
  {const a=q(xw,0,d0),b=q(xw,0,d1),e=q(xw,DOOR.h,d1),f=q(xw,DOOR.h,d0);c.fillStyle=lin(c,0,f.y,0,a.y,[[0,'#6a3a18'],[.6,'#b0682a'],[1,'#d89048']]);poly(c,[a,b,e,f]);c.fill();}
  // the plank door standing ajar into the room on its far hinge, the light round its edge
  {const op=.55,fx=xw-DOOR.w*Math.sin(op),fd=d1-DOOR.w*Math.cos(op),h0=q(xw,0,d1),h1=q(xw,DOOR.h,d1),f0=q(fx,0,fd),f1=q(fx,DOOR.h,fd);poly(c,[h0,f0,f1,h1],'#2e2014');
    c.strokeStyle=rgba('#000000',.45);c.lineWidth=.8;c.beginPath();for(let u=.2;u<1;u+=.2){c.moveTo(lerp(h0.x,f0.x,u),lerp(h0.y,f0.y,u));c.lineTo(lerp(h1.x,f1.x,u),lerp(h1.y,f1.y,u));}c.stroke();
    c.strokeStyle='#1a120a';c.lineWidth=2.2;c.beginPath();for(const u of [.15,.85]){c.moveTo(lerp(h0.x,h1.x,u),lerp(h0.y,h1.y,u));c.lineTo(lerp(f0.x,f1.x,u),lerp(f0.y,f1.y,u));}c.stroke();
    c.save();c.globalCompositeOperation='lighter';c.strokeStyle=rgba('#ffc070',.55);c.lineWidth=1.4;c.beginPath();c.moveTo(f0.x,f0.y);c.lineTo(f1.x,f1.y);c.stroke();c.restore();}
  // the frame's edge toward us, and its light lying in over the boards
  {const a=q(xw,0,d0),b=q(xw,DOOR.h+4,d0);c.fillStyle='#120c08';c.fillRect(a.x-2,b.y,4,a.y-b.y);}
  c.save();c.globalCompositeOperation='lighter';floorT(c);c.translate(xw-50,D.d-6);c.scale(1.7,1);c.fillStyle=rad(c,0,0,4,40,[[0,rgba('#ffb060',.3)],[.6,rgba('#ff9a50',.1)],[1,rgba('#ff9a50',0)]]);c.fillRect(-40,-40,80,80);c.restore();
  glowAt(c,q(xw,DOOR.h*.5,D.d).x,q(xw,DOOR.h*.5,D.d).y,70,'#ffb060',.18);
}

// ---------- the floor ----------
function floor(c,G){const far=G.far,X0=-300,X1=1300,D0=-200,r=rng(29);
  c.save();floorT(c);c.fillStyle='#21170f';c.fillRect(X0,D0,X1-X0,far-D0+1);
  for(let d=D0;d<far;d+=14){let x=X0-r()*120;while(x<X1){const L=80+r()*160,v=r();c.fillStyle=dim(dim('#22180f','#36281a',v),'#000000',r()*.2);c.fillRect(x,d,L,13.2);
      c.fillStyle=rgba('#000000',.12);c.fillRect(x,d+3+r()*8,L,.5);c.fillStyle=rgba('#e8d8b8',.035);c.fillRect(x,d+12.4,L,.8);c.fillStyle=rgba('#000000',.55);c.fillRect(x+L-1,d,1.2,13.2);x+=L;}
    c.fillStyle=rgba('#000000',.55);c.fillRect(X0,d+13.2,X1-X0,.9);}
  // straw from the mattress, onion skins, dust in the corners; a rag rug by the cot
  c.lineWidth=.6;c.strokeStyle=rgba('#c8a050',.55);c.beginPath();for(let i=0;i<70;i++){const x=lerp(90,320,r()),d=lerp(120,168,r()),a=r()*TAU;c.moveTo(x,d);c.lineTo(x+Math.cos(a)*4,d+Math.sin(a)*4);}c.stroke();
  for(let i=0;i<30;i++){c.fillStyle=rgba('#c89a5a',.25+.25*r());c.beginPath();c.ellipse(lerp(-60,140,r()),lerp(100,200,r()),1.6+r()*2,1+r(),r()*3,0,TAU);c.fill();}
  {const rx=200,rd=140;c.fillStyle='#3a2a2a';c.beginPath();c.ellipse(rx,rd,64,18,0,0,TAU);c.fill();c.strokeStyle=rgba('#6a4a3a',.6);c.lineWidth=2.4;for(const k of [.8,.6,.4]){c.beginPath();c.ellipse(rx,rd,64*k,18*k,0,0,TAU);c.stroke();}c.strokeStyle=rgba('#2a3a4a',.5);c.lineWidth=1.6;c.beginPath();c.ellipse(rx,rd,64*.7,18*.7,0,0,TAU);c.stroke();}
  // a trapdoor to the cellar under the barrels' end, its ring
  {const x0=-150,x1=-90,d0=120,d1=150;c.fillStyle='#1a1009';c.fillRect(x0,d0,x1-x0,d1-d0);c.strokeStyle='#0a0604';c.lineWidth=1.4;c.strokeRect(x0,d0,x1-x0,d1-d0);c.strokeStyle='#4a4440';c.lineWidth=1.2;c.beginPath();c.ellipse(x1-10,(d0+d1)/2,4,4,0,0,TAU);c.stroke();}
  c.restore();}

// ---------- the lamp ----------
function lamp(c,G){const Lm=G.lamp,p=q(Lm.x,Lm.h,Lm.d),top=q(Lm.x,Lm.h+220,Lm.d);
  c.strokeStyle='#0c0a08';c.lineWidth=1;c.beginPath();c.moveTo(p.x,p.y-14);c.lineTo(top.x,top.y);c.stroke();
  c.fillStyle='#2a2420';c.beginPath();c.moveTo(p.x-6,p.y-14);c.lineTo(p.x+6,p.y-14);c.lineTo(p.x+5,p.y-11);c.lineTo(p.x-5,p.y-11);c.closePath();c.fill();
  c.fillStyle=rgba('#f0e6d0',.45);c.beginPath();c.moveTo(p.x-3,p.y-11);c.quadraticCurveTo(p.x-5,p.y-4,p.x-3.4,p.y+2);c.lineTo(p.x+3.4,p.y+2);c.quadraticCurveTo(p.x+5,p.y-4,p.x+3,p.y-11);c.closePath();c.fill();
  c.fillStyle='#8a6a32';c.beginPath();c.ellipse(p.x,p.y+5,7,3.6,0,0,TAU);c.fill();c.fillStyle='#5a4420';c.fillRect(p.x-6,p.y+5,12,3);
  glowAt(c,p.x,p.y-3,46,'#ffd27a',.28);
  c.save();c.globalCompositeOperation='lighter';floorT(c);c.translate(Lm.x,Lm.d-10);c.scale(1.8,1);c.fillStyle=rad(c,0,0,4,70,[[0,rgba('#ffcf86',.1)],[1,rgba('#ffcf86',0)]]);c.fillRect(-70,-70,140,140);c.restore();}

// ---------- the scene ----------
let LIVE=null;
function paint(c){const G=geo();
  walls(c,G);const V=windowView(c,G);windowFrame(c,G);mirror(c,G);
  floor(c,G);shaft(c,G);
  barrels(c,G);shelf(c,G);washstand(c,G);crates(c,G);cot(c,G);chair(c,G);stool(c,G);sideWall(c,G);lamp(c,G);
  // the day is dim: the room darker away from the window, darkest in the corners; the near edge
  c.fillStyle=lin(c,-200,0,1150,0,[[0,rgba('#040302',.55)],[.22,rgba('#040302',.12)],[.62,rgba('#040302',0)],[.86,rgba('#040302',.05)],[1,rgba('#040302',.4)]]);c.fillRect(-200,-100,1450,800);
  c.fillStyle=lin(c,0,GB-20,0,GB+140,[[0,rgba('#000000',0)],[1,rgba('#000000',.7)]]);c.fillRect(-200,GB-20,1450,160);
  LIVE={G,V};}
const MOTES=(()=>{const r=rng(66),a=[];for(let i=0;i<26;i++)a.push({u:r(),v:r(),ph:r()*TAU,sp:.15+r()*.3});return a;})();
const SMOKE=(()=>{const r=rng(8),a=[];for(let i=0;i<5;i++)a.push({ph:i/5,dx:(r()-.5)});return a;})();
function live(){if(!LIVE)return;const G=LIVE.G,V=LIVE.V,w=G.win,t=S.t;ctx.save();
  // through the window: the drum's fire and its smoke, someone going by now and then
  ctx.save();ctx.beginPath();ctx.rect(w.x0,w.y0,w.x1-w.x0,w.y1-w.y0);ctx.clip();
  {const d=V.dr,k=.7+.3*Math.sin(t*9.1)*Math.sin(t*3.7);ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(255,150,60,${(.8*k).toFixed(3)})`;
    for(let i=0;i<3;i++){const fx=d.x-2.4+i*2.4,fh=3+2.4*Math.abs(Math.sin(t*8+i*1.9));ctx.beginPath();ctx.moveTo(fx-1.4,d.y-9);ctx.lineTo(fx,d.y-9-fh);ctx.lineTo(fx+1.4,d.y-9);ctx.fill();}
    glowAt(ctx,d.x,d.y-10,16,'#ff9a4a',.35*k);ctx.globalCompositeOperation='source-over';
    for(const s of SMOKE){const u=(t*.12+s.ph)%1;puffAt(ctx,d.x+u*18+s.dx*u*10,d.y-12-u*48,2+u*12,'#9a9288',.5*(1-u)*Math.min(1,u*6));}ctx.globalAlpha=1;}
  {const per=19,u=(t%per)/per;if(u<.55){const x=lerp(w.x1+8,w.x0-8,u/.55),y=V.lane+1,b=Math.abs(Math.sin(t*5))*.8;ctx.fillStyle='#1a1614';ctx.beginPath();ctx.arc(x,y-17-b,2.4,0,TAU);ctx.fill();ctx.fillRect(x-2.6,y-14.6-b,5.2,9);
      ctx.fillRect(x-2.2+Math.sin(t*5)*1.4,y-6,1.8,6);ctx.fillRect(x+.4-Math.sin(t*5)*1.4,y-6,1.8,6);ctx.fillStyle='#3a3026';ctx.fillRect(x+2,y-13-b,5,6);}}
  ctx.restore();
  // dust turning in the daylight
  {const a0=q(G.L.window.x0-40,40,G.far-60),b0=q(G.L.window.x1-50,120,G.far-110);ctx.fillStyle='#efe6d0';for(const m of MOTES){const x=lerp(a0.x,b0.x,m.u)+Math.sin(t*m.sp+m.ph)*10,y=lerp(b0.y,a0.y,m.v)+Math.sin(t*m.sp*.7+m.ph*2)*8,al=.12+.12*Math.sin(t*1.1+m.ph);ctx.globalAlpha=Math.max(0,al);ctx.fillRect(x,y,.9,.9);}ctx.globalAlpha=1;}
  // the lamp's flame
  {const Lm=G.lamp,p=q(Lm.x,Lm.h,Lm.d),f=.88+.12*Math.sin(t*8.3)*Math.sin(t*3.9);ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(255,232,180,${(.85*f).toFixed(3)})`;ctx.beginPath();ctx.ellipse(p.x,p.y-3,1.2,2.6,0,0,TAU);ctx.fill();glowAt(ctx,p.x,p.y-3,16,'#ffd27a',.3*f);ctx.globalCompositeOperation='source-over';}
  ctx.restore();}
// the light that rims them: the day through the window
function light(f){const G=LIVE?LIVE.G:geo(),w=G.win;return{light:{x:(w.x0+w.x1)/2-f.dep*PSX,y:(w.y0+w.y1)/2+f.dep*PSY}};}
function layoutNow(){const G=geo();return{ceil:CEIL,window:G.win,lamp:G.lamp,door:DOOR};}
E.S.backroom={paint,live,light,get LAYOUT(){return layoutNow();}};
})();
// ===== ENV BACKROOM END =====
