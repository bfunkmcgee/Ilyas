// ===== BREACH UI =====
// The executive's door in the lobby: closed leaves of dark lacquered wood with brass inlay, the charge Kael plants on them and its
// blinking light, then the blast (a flash, a fireball, the leaves torn into pieces that fly out and lie on the floor, smoke) and
// the empty doorway with the office's warm light beyond. The door's still art is painted once into sprites; the rest is live.
const DM_SHUT={l:20,r:20,t:14,b:26},DM_BLOWN={l:72,r:72,t:100,b:34};
let DOOR_L={},BR_SPR=null;
function doorLayer(key,m,paint){
  const need=clamp(cv.width/cam.viewW*1.12,1,2.4);let L=DOOR_L[key];
  if(!L||need>L.sc*1.2||need<L.sc*.6){
    const w=EXEC_DOOR.w+m.l+m.r,h=EXEC_DOOR.h+m.t+m.b,cn=document.createElement('canvas');cn.width=Math.ceil(w*need);cn.height=Math.ceil(h*need);
    const c=cn.getContext('2d');c.setTransform(need,0,0,need,m.l*need,m.t*need);paint(c,EXEC_DOOR.w,EXEC_DOOR.h);L=DOOR_L[key]={cv:cn,sc:need,m};}
  return L;}
function putDoorLayer(L,x0,yT){const m=L.m;ctx.drawImage(L.cv,x0-m.l,yT-m.t,EXEC_DOOR.w+m.l+m.r,EXEC_DOOR.h+m.t+m.b);}
// small soft sprites, made once: smoke in three shapes, fire, a red light, a warm spark
function brSprites(){if(BR_SPR)return BR_SPR;
  const mk=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);return c;};
  BR_SPR={
    smoke:[0,1,2].map(i=>mk(128,128,(g,w,h)=>{const r=mulberry32(300+i*17);
      for(let k=0;k<15;k++){const a=r()*TAU,d=Math.sqrt(r())*w*.24,cx=w/2+Math.cos(a)*d,cy=h/2+Math.sin(a)*d*.9,rad=w*(.15+r()*.15),gr=g.createRadialGradient(cx,cy,0,cx,cy,rad);
        gr.addColorStop(0,'rgba(120,104,94,.34)');gr.addColorStop(.35,'rgba(112,98,90,.22)');gr.addColorStop(.7,'rgba(98,86,80,.07)');gr.addColorStop(1,'rgba(86,76,70,0)');g.fillStyle=gr;g.beginPath();g.arc(cx,cy,rad,0,TAU);g.fill();}})),
    ember:mk(96,96,(g,w,h)=>{const r=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);r.addColorStop(0,'rgba(255,214,130,.95)');r.addColorStop(.3,'rgba(255,150,60,.7)');r.addColorStop(.65,'rgba(214,74,24,.3)');r.addColorStop(1,'rgba(150,34,12,0)');g.fillStyle=r;g.fillRect(0,0,w,h);}),
    fire:mk(128,128,(g,w,h)=>{const r=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);r.addColorStop(0,'rgba(255,244,205,1)');r.addColorStop(.12,'rgba(255,214,120,.95)');r.addColorStop(.34,'rgba(255,140,44,.78)');
      r.addColorStop(.66,'rgba(206,60,20,.38)');r.addColorStop(1,'rgba(120,24,12,0)');g.fillStyle=r;g.fillRect(0,0,w,h);}),
    red:mk(48,48,(g,w,h)=>{const r=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);r.addColorStop(0,'rgba(255,170,150,1)');r.addColorStop(.22,'rgba(255,60,40,.85)');r.addColorStop(1,'rgba(255,30,20,0)');g.fillStyle=r;g.fillRect(0,0,w,h);}),
    shaft:mk(8,64,(g,w,h)=>{const r=g.createLinearGradient(0,0,0,h);r.addColorStop(0,'rgba(255,200,120,.6)');r.addColorStop(1,'rgba(255,170,90,0)');g.fillStyle=r;g.fillRect(0,0,w,h);})};
  return BR_SPR;}

// ---------- the closed door ----------
function paintDoorShut(c,W,H){
  const J=4.5,hw=W/2,gap=.7,kick=22;let g;
  c.fillStyle='#07040a';c.fillRect(0,0,W,H);
  // the frame round the leaves, with a brass bead on the inside edge
  g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#2e1a11');g.addColorStop(1,'#1c0f0a');c.fillStyle=g;c.fillRect(0,0,W,H);
  c.strokeStyle='rgba(214,176,98,.6)';c.lineWidth=.8;c.strokeRect(J-.9,J-.9,W-2*J+1.8,H-J+.9);
  for(const s of [0,1]){
    const x0=s?hw+gap:J,x1=s?W-J:hw-gap,lw=x1-x0,top=J,bot=H-1.8,r=mulberry32(11+s*7);
    // lacquer, a little lighter high up, with a long reflection down each leaf and the fine lines of the grain
    g=c.createLinearGradient(0,top,0,bot);g.addColorStop(0,'#4a2a1e');g.addColorStop(.5,'#37201a');g.addColorStop(1,'#26150f');c.fillStyle=g;c.fillRect(x0,top,lw,bot-top);
    for(let i=0;i<10;i++){const x=x0+3+r()*(lw-6);c.strokeStyle=i%2?'rgba(255,205,160,.05)':'rgba(0,0,0,.2)';c.lineWidth=.5+r()*.8;c.beginPath();c.moveTo(x,top);c.lineTo(x+(r()-.5)*4,bot);c.stroke();}
    g=c.createLinearGradient(x0,0,x1,0);g.addColorStop(0,'rgba(255,224,186,0)');g.addColorStop(s?.2:.7,'rgba(255,224,186,.15)');g.addColorStop(s?.32:.82,'rgba(255,224,186,0)');g.addColorStop(1,'rgba(0,0,0,.2)');
    c.fillStyle=g;c.fillRect(x0,top,lw,bot-top);
    // two panels, each edged with a double line of brass inlay and a darker field inside
    const px0=x0+5,px1=x1-5;
    for(const[a,b]of[[top+6,96],[100,bot-kick-5]]){
      c.fillStyle='rgba(0,0,0,.2)';c.fillRect(px0+1.2,a+1.2,px1-px0-2.4,b-a-2.4);
      c.lineWidth=.9;c.strokeStyle='rgba(226,188,108,.95)';c.strokeRect(px0,a,px1-px0,b-a);
      c.strokeStyle='rgba(226,188,108,.36)';c.strokeRect(px0+2.7,a+2.7,px1-px0-5.4,b-a-5.4);
      c.fillStyle='rgba(236,200,120,.9)';for(const cx of[px0,px1])for(const cy of[a,b])c.fillRect(cx-1.1,cy-1.1,2.2,2.2);}
    // the brass kickplate
    g=c.createLinearGradient(0,bot-kick,0,bot);g.addColorStop(0,'#e0bc66');g.addColorStop(.5,'#a28038');g.addColorStop(1,'#6d521e');c.fillStyle=g;c.fillRect(x0+1.5,bot-kick,lw-3,kick-1);
    c.fillStyle='rgba(0,0,0,.4)';c.fillRect(x0+1.5,bot-kick,lw-3,1);c.fillStyle='rgba(255,238,176,.55)';c.fillRect(x0+1.5,bot-kick+1,lw-3,.8);
    c.fillStyle='rgba(60,40,10,.8)';for(const sx of[x0+4,x1-4])for(const sy of[bot-kick+4,bot-5]){c.beginPath();c.arc(sx,sy,.9,0,TAU);c.fill();}
    // a brass strip down the meeting edge and the long pull beside it
    const ex=s?x0:x1-1.6;g=c.createLinearGradient(ex,0,ex+1.6,0);g.addColorStop(0,'#8a6a2a');g.addColorStop(.5,'#f0d083');g.addColorStop(1,'#8a6a2a');c.fillStyle=g;c.fillRect(ex,top,1.6,bot-top);
    const pm=s?x0+6.4:x1-6.4;
    c.fillStyle='rgba(0,0,0,.42)';c.fillRect(pm-1.8+1.7,66+1.4,3.6,46);
    g=c.createLinearGradient(pm-1.9,0,pm+1.9,0);g.addColorStop(0,'#7a5a22');g.addColorStop(.35,'#fbe3a0');g.addColorStop(.7,'#c79c4a');g.addColorStop(1,'#6a4c1a');c.fillStyle=g;c.fillRect(pm-1.9,66,3.8,46);
    c.fillStyle='#8a6a2a';c.fillRect(pm-2.8,64,5.6,3);c.fillRect(pm-2.8,111,5.6,3);}
  c.fillStyle='#0a0504';c.fillRect(hw-gap-.2,J,gap*2+.4,H-J);
  // the recess: the leaves sit back from the frame, so it shades them down the hinge side and under the head
  g=c.createLinearGradient(0,0,9,0);g.addColorStop(0,'rgba(0,0,0,.62)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,9,H);
  g=c.createLinearGradient(0,0,0,12);g.addColorStop(0,'rgba(0,0,0,.7)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,W,12);
  // the thin warm line of light under the doors, and its spill on the floor
  g=c.createLinearGradient(0,H-10,0,H);g.addColorStop(0,'rgba(255,200,120,0)');g.addColorStop(1,'rgba(255,200,120,.42)');c.fillStyle=g;c.fillRect(J,H-10,W-2*J,10);
  c.fillStyle='#ffd890';c.fillRect(J,H-1.8,W-2*J,1.8);
  g=c.createLinearGradient(0,H,0,H+14);g.addColorStop(0,'rgba(255,196,110,.55)');g.addColorStop(1,'rgba(255,170,90,0)');c.fillStyle=g;
  c.beginPath();c.moveTo(J-2,H);c.lineTo(W-J+2,H);c.lineTo(W-J+10,H+14);c.lineTo(J-10,H+14);c.closePath();c.fill();
}

// ---------- the doorway after the blast ----------
// a vertical torn edge along x0 (side -1 on the left, 1 on the right) as a polygon: its inner edge ragged, with splinters standing out
function tornEdge(c,x0,side,W,H,r,w){
  const pts=[[x0,0]];let v=0;
  while(v<H){const step=6+r()*9,inner=w*(.45+r()*.75),gone=r()<.16;
    pts.push([x0+side*(gone?.3:inner),v+step*.15]);
    if(!gone&&r()<.5){const sp=7+r()*14;pts.push([x0+side*(inner+sp),v+step*.5],[x0+side*(inner+.5),v+step*.62]);}
    v+=step;}
  pts.push([x0,H]);
  c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.closePath();return pts;}
function paintDoorBlown(c,W,H){
  const r=mulberry32(909);let g;
  const soot=(cx,cy,rx,ry,a)=>{c.save();c.translate(cx,cy);c.scale(rx,ry);g=c.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,`rgba(8,5,4,${a})`);g.addColorStop(.55,`rgba(8,5,4,${a*.55})`);g.addColorStop(1,'rgba(8,5,4,0)');
    c.fillStyle=g;c.beginPath();c.arc(0,0,1,0,TAU);c.fill();c.restore();};
  // the blast has blackened the wall round the opening, in tongues up past the head and out along the floor
  soot(W/2,H*.46,W*1.08,H*.74,.66);
  for(let i=0;i<7;i++)soot(W*(.04+i*.15)+(r()-.5)*8,-8-r()*46,9+r()*13,30+r()*48,.46);
  soot(-4,H*.5,14,H*.5,.4);soot(W+4,H*.5,14,H*.5,.4);
  c.save();c.translate(W/2,H+7);c.scale(1,.26);g=c.createRadialGradient(0,0,0,0,0,W*.9);g.addColorStop(0,'rgba(5,3,2,.78)');g.addColorStop(1,'rgba(5,3,2,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,W*.9,0,TAU);c.fill();c.restore();
  // cracks in the plaster running out from the corners of the head
  c.strokeStyle='rgba(0,0,0,.5)';c.lineWidth=.8;
  for(const[sx,sy,dx]of[[-1,-1,-1],[W+1,-1,1],[-1,H*.6,-1],[W+1,H*.55,1]]){let x=sx,y=sy;c.beginPath();c.moveTo(x,y);for(let k=0;k<5;k++){x+=dx*(3+r()*8);y+=(r()-.6)*12;c.lineTo(x,y);}c.stroke();}
  // the room beyond, lit warm
  c.save();c.beginPath();c.rect(0,0,W,H);c.clip();
  g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0f0807');g.addColorStop(.2,'#27150f');g.addColorStop(.52,'#5f3520');g.addColorStop(.84,'#a96630');g.addColorStop(1,'#e2a45c');c.fillStyle=g;c.fillRect(0,0,W,H);
  // panelling on the far wall
  c.strokeStyle='rgba(18,8,5,.4)';c.lineWidth=1;c.beginPath();for(let x=5;x<W;x+=10.5){c.moveTo(x,6);c.lineTo(x,H-36);}c.stroke();
  c.fillStyle='rgba(255,196,130,.06)';for(let x=8;x<W;x+=21)c.fillRect(x,8,4,H-46);
  // a tall window onto the night city, left of centre
  {const wx=15,wy=20,ww=21,wh=78;g=c.createLinearGradient(0,wy,0,wy+wh);g.addColorStop(0,'#070d20');g.addColorStop(.7,'#1b2c52');g.addColorStop(1,'#34507e');c.fillStyle=g;c.fillRect(wx,wy,ww,wh);
    for(let i=0;i<20;i++){c.fillStyle=r()<.5?'rgba(255,214,150,.9)':'rgba(190,220,255,.8)';c.fillRect(wx+1.5+r()*(ww-3.5),wy+30+r()*(wh-34),1.2,1.2);}
    c.fillStyle='rgba(8,12,28,.9)';for(let i=0;i<5;i++){const bw=3+r()*5,bh=8+r()*22;c.fillRect(wx+i*4.4,wy+wh-bh,bw,bh);}
    c.strokeStyle='#150b07';c.lineWidth=1.6;c.strokeRect(wx,wy,ww,wh);c.beginPath();c.moveTo(wx+ww/2,wy);c.lineTo(wx+ww/2,wy+wh);c.stroke();}
  // a lit sconce and a picture frame on the right of the far wall
  g=c.createRadialGradient(66,52,0,66,52,30);g.addColorStop(0,'rgba(255,214,150,.75)');g.addColorStop(1,'rgba(255,170,90,0)');c.fillStyle=g;c.fillRect(30,20,54,70);
  c.fillStyle='#f6d894';c.fillRect(64.6,46,3,8);c.fillStyle='#caa05a';c.fillRect(63.4,54,5.4,1.6);
  c.fillStyle='rgba(20,10,6,.85)';c.fillRect(46,66,15,20);c.strokeStyle='rgba(214,176,98,.7)';c.lineWidth=.8;c.strokeRect(46,66,15,20);
  // furniture in silhouette along the foot of the far wall: a credenza with a lamp on it
  c.fillStyle='#160b07';c.fillRect(8,112,60,26);c.fillStyle='#2a160d';c.fillRect(8,112,60,2.2);
  g=c.createRadialGradient(54,106,0,54,106,16);g.addColorStop(0,'rgba(255,226,170,.95)');g.addColorStop(1,'rgba(255,190,110,0)');c.fillStyle=g;c.fillRect(34,90,40,32);
  c.fillStyle='#e8c477';c.fillRect(52.6,103,2.8,9);
  // the floor, shining, and a strip of rug
  g=c.createLinearGradient(0,H-30,0,H);g.addColorStop(0,'#8a5025');g.addColorStop(1,'#f0b468');c.fillStyle=g;c.fillRect(0,H-30,W,30);
  c.fillStyle='rgba(112,28,26,.7)';c.beginPath();c.moveTo(14,H-24);c.lineTo(W-8,H-24);c.lineTo(W-2,H);c.lineTo(6,H);c.closePath();c.fill();
  g=c.createRadialGradient(W/2,H-6,2,W/2,H-6,W*.8);g.addColorStop(0,'rgba(255,224,160,.72)');g.addColorStop(1,'rgba(255,180,100,0)');c.fillStyle=g;c.fillRect(0,0,W,H);
  c.restore();
  // what is left of the frame: charred, torn along its inner edge and split pale where it broke
  const J=4.8;
  c.fillStyle='#150b08';
  const left=tornEdge(c,0,1,W,H,r,J);c.fill();
  const right=tornEdge(c,W,-1,W,H,r,J);c.fill();
  c.beginPath();c.moveTo(0,0);c.lineTo(W,0);for(let x=W,y=J*.5;x>=0;x-=6+r()*8){y=J*(.4+r()*.9);c.lineTo(x,y);if(r()<.3){c.lineTo(x-1.5,y+7+r()*12);c.lineTo(x-3.2,y+.5);}}c.lineTo(0,J*.5);c.closePath();c.fill();
  c.strokeStyle='rgba(176,124,74,.5)';c.lineWidth=.8;
  for(const pts of[left,right]){c.beginPath();pts.slice(1,-1).forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();}
  // the hinges still on the frame, some torn off, each with a ragged stub of the leaf hanging from it
  for(const s of[-1,1])for(const v of[18,82,140]){const x=s<0?0:W,hx=x+(s<0?.4:-6.4),oy=(r()-.5)*8,keep=r()<.7;
    if(r()<.78){c.fillStyle='#1b0f0a';c.beginPath();c.moveTo(x,v-2+oy);c.lineTo(x-s*(-4-r()*5),v-1+oy);c.lineTo(x-s*(-3-r()*4),v+6+r()*5+oy);c.lineTo(x,v+13+oy);c.closePath();c.fill();}
    if(keep){c.save();c.translate(hx+3,v+6+oy);c.rotate((r()-.5)*.5);g=c.createLinearGradient(-3,0,3,0);g.addColorStop(0,'#8a6a2a');g.addColorStop(.4,'#f0d083');g.addColorStop(1,'#7a5a22');c.fillStyle=g;c.fillRect(-3,-6,6,12);c.fillStyle='rgba(40,24,6,.8)';c.fillRect(-.4,-4,.9,8);c.restore();}}
  // rubble in the doorway
  for(let i=0;i<9;i++){const x=6+r()*(W-12),w=3+r()*8,h=1.6+r()*3.2;c.fillStyle=r()<.7?'#1a0d09':'#4a2e1c';c.beginPath();c.moveTo(x,H+1);c.lineTo(x+w*.3,H-h);c.lineTo(x+w*.8,H-h*.6);c.lineTo(x+w,H+1);c.closePath();c.fill();}
}
// the shock of the blast in the doorway: a white-out, then the fireball and its jets out toward the camera, fading as the smoke takes over
function drawBlastFire(u,cx,yB,x0,yT){
  const S0=brSprites();if(u<0||u>1.1)return;ctx.save();ctx.globalCompositeOperation='lighter';
  if(u<.18){ctx.globalAlpha=Math.pow(1-u/.18,1.4);ctx.fillStyle='#fff5da';ctx.fillRect(x0-5,yT-5,EXEC_DOOR.w+10,EXEC_DOOR.h+10);}
  const blobs=[[0,-80,0,1.25],[-26,-58,.02,.8],[28,-104,.04,.85],[-8,-126,.07,.7],[34,-44,.03,.75],[-34,-96,.06,.7],[6,-30,.05,.9]];
  for(const[dx,dy,d0,sz]of blobs){const k=clamp((u-d0)/.62,0,1);if(k<=0||k>=1)continue;const R=(24+104*eOut(k))*sz,a=Math.pow(1-k,1.35);
    ctx.globalAlpha=Math.min(1,a*1.05);ctx.drawImage(S0.fire,cx+dx*(.8+k*.9)-R,yB+dy*(.85+k*.3)-R,R*2,R*2);}
  ctx.globalAlpha=Math.pow(1-clamp(u/.55,0,1),1.3)*.55;const R=330;ctx.drawImage(S0.fire,cx-R,yB-70-R*.8,R*2,R*1.6);
  ctx.restore();}
function drawEmbers(B,u,x0,yT){
  if(u>5)return;const S0=brSprites(),r=mulberry32(B.seed|0);ctx.save();ctx.globalCompositeOperation='lighter';
  for(let i=0;i<22;i++){const left=r()<.5,bx=left?r()*4:EXEC_DOOR.w-r()*4,by=EXEC_DOOR.h*(.04+r()*.9),vx=(r()-.3)*26*(left?-1:1),vy=-(6+r()*40),life=1.6+r()*3.4,ph=r()*6.3;
    const k=u/life;if(k>=1)continue;const x=x0+bx+vx*u,y=yT+by+vy*u+16*u*u,tw=.55+.45*Math.sin(u*13+ph);
    ctx.globalAlpha=(1-k)*tw;ctx.drawImage(S0.red,x-4,y-4,8,8);ctx.fillStyle='#ffd28a';ctx.fillRect(x-.7,y-.7,1.4,1.4);}
  ctx.restore();}
// the charge on the door: a lump of putty on the seam with a small dark box and a red light that blinks with each beep
function drawCharge(B,cx,cy){
  const age=S.t-B.charge.t,pop=age<.14?eOut(age/.14):1,S0=brSprites();if(pop<=0)return;
  ctx.save();ctx.translate(cx,cy);ctx.scale(.55+.45*pop,.55+.45*pop);ctx.globalAlpha=Math.min(1,pop*1.4);
  ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(-6.4,-8,14,16.4);
  const g=ctx.createLinearGradient(-7,0,7,0);g.addColorStop(0,'#4b4d44');g.addColorStop(.5,'#6e7064');g.addColorStop(1,'#34362f');ctx.fillStyle=g;ctx.fillRect(-7.5,-8.5,15,15);
  ctx.fillStyle='rgba(255,255,255,.14)';ctx.fillRect(-7.5,-8.5,15,1.4);ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(-7.5,5.2,15,1.4);
  ctx.fillStyle='#c9a22e';ctx.fillRect(-7.5,-3.6,15,1.9);ctx.fillRect(-7.5,.6,15,1.9);
  ctx.fillStyle='#14140f';ctx.fillRect(-4.4,-6.6,8.8,5.6);ctx.fillStyle='#2c2d27';ctx.fillRect(-4.4,-6.6,8.8,.9);
  ctx.strokeStyle='#d83a2a';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(4.4,-4);ctx.quadraticCurveTo(10,-2,8.5,3);ctx.stroke();
  ctx.strokeStyle='#3a6ad8';ctx.beginPath();ctx.moveTo(-4.4,-4);ctx.quadraticCurveTo(-10,-1,-8.5,4);ctx.stroke();
  // the light: lit for a moment after each beep, a faint ember in between
  let on=0;for(const t of B.beeps){const d=S.t-t;if(d>=0&&d<.11)on=1;}
  ctx.fillStyle=on?'#ff6a52':'#5a1612';ctx.beginPath();ctx.arc(0,-3.8,1.5,0,TAU);ctx.fill();
  if(on){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.95;ctx.drawImage(S0.red,-12,-15.8,24,24);}
  ctx.restore();}

// ---------- the door, every frame ----------
function drawExecDoor(){
  const B=S.breach,far=LOBBY.far,W=EXEC_DOOR.w,H=EXEC_DOOR.h,x0=EXEC_DOOR.x-W/2+far*PSX,cx=EXEC_DOOR.x+far*PSX,yB=prjY(GB,far),yT=yB-H,S0=brSprites();
  if(!B||!B.blown){
    putDoorLayer(doorLayer('shut',DM_SHUT,paintDoorShut),x0,yT);
    // the line of light under the doors breathes a little
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.1+.05*Math.sin(S.t*1.7)+.03*Math.sin(S.t*5.3);ctx.drawImage(S0.shaft,x0+4,yB-2,W-8,14);ctx.restore();
    if(B&&B.charge)drawCharge(B,cx,yB-BREACH.chargeH);
    return;}
  const u=S.t-B.blastT;
  putDoorLayer(doorLayer('blown',DM_BLOWN,paintDoorBlown),x0,yT);
  // the light from the office flickers a little, and throws a wedge across the lobby floor
  const fl=.7+.18*Math.sin(S.t*6.3)+.12*Math.sin(S.t*11.7+1),ramp=clamp((u-.05)/.5,0,1);
  ctx.save();ctx.globalCompositeOperation='lighter';
  const gl=ctx.createRadialGradient(cx,yB-30,6,cx,yB-30,150);gl.addColorStop(0,`rgba(255,196,110,${(.34*fl*ramp).toFixed(3)})`);gl.addColorStop(1,'rgba(255,160,80,0)');ctx.fillStyle=gl;ctx.fillRect(cx-160,yB-190,320,230);
  const a=P(EXEC_DOOR.x-W/2,GB,far),b=P(EXEC_DOOR.x+W/2,GB,far),c1=P(EXEC_DOOR.x+W/2+84,GB,112),d1=P(EXEC_DOOR.x-W/2-84,GB,112);
  const wg=ctx.createLinearGradient(0,a.y,0,c1.y);wg.addColorStop(0,`rgba(255,196,110,${(.3*fl*ramp).toFixed(3)})`);wg.addColorStop(1,'rgba(255,170,90,0)');ctx.fillStyle=wg;
  ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c1.x,c1.y);ctx.lineTo(d1.x,d1.y);ctx.closePath();ctx.fill();
  ctx.restore();
  drawEmbers(B,u,x0,yT);
  drawBlastFire(u,cx,yB,x0,yT);
}

// ---------- the pieces and the smoke, among the things on the floor ----------
const BR_WOOD={a:'#46291c',b:'#2c170f',c:'#1c0e09'};
function drawBreachPiece(p){
  const th=p.th,sT=Math.sin(th),cT=Math.cos(th),flat=th>1.2,sx=prjX(p.x,p.d),sy=prjY(p.y,p.d),fl=Math.cos(p.flip),sq=Math.abs(fl)<.25?(fl<0?-.25:.25):fl,o=p.out,n=o.length;
  if(!flat){const g=S.arena.ground(p.x,p.d),q=P(p.x,g,p.d),hgt=Math.max(0,g-p.y),rx=(Math.abs(Math.cos(p.ang))*p.w+Math.abs(Math.sin(p.ang))*p.h)/2*(.85+.15*Math.cos(th));
    ctx.fillStyle=`rgba(3,2,6,${(clamp(.34-hgt/420,0,.34)).toFixed(3)})`;ctx.beginPath();ctx.ellipse(q.x,q.y,Math.max(3,rx),Math.max(1.2,rx*.26),0,0,TAU);ctx.fill();}
  ctx.save();ctx.translate(sx,sy);ctx.transform(1,0,sT*PSX,-(cT+sT*PSY),0,0);ctx.rotate(p.ang);ctx.scale(sq,1);
  const path=()=>{ctx.beginPath();ctx.moveTo(o[0][0],o[0][1]);for(let i=1;i<n;i++)ctx.lineTo(o[i][0],o[i][1]);ctx.closePath();};
  if(flat){ctx.save();ctx.translate(1.4,-1.2);ctx.globalAlpha=.55;ctx.fillStyle='#030206';path();ctx.fill();ctx.restore();}
  const hw=p.w/2,hh=p.h/2;
  if(p.kind==='wood'){const g=ctx.createLinearGradient(-hw,hh,hw,-hh);g.addColorStop(0,BR_WOOD.a);g.addColorStop(.55,BR_WOOD.b);g.addColorStop(1,BR_WOOD.c);ctx.fillStyle=g;path();ctx.fill();
    // the torn edges are pale where the wood split; the old edges are dark
    ctx.lineJoin='round';
    const keep=p.keep||[0,0,0,0];
    for(let i=0;i<n;i++){const a=o[i],b=o[(i+1)%n],torn=!keep[i>>1];ctx.strokeStyle=torn?'rgba(196,146,92,.92)':'rgba(10,5,3,.9)';ctx.lineWidth=torn?1.1:.8;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();}
    if(p.inlay>=0&&keep[p.inlay]&&Math.min(p.w,p.h)>9){const e=p.inlay*2,sh=q=>{const L=Math.hypot(q[0],q[1])||1;return[q[0]-q[0]/L*3.4,q[1]-q[1]/L*3.4];},a=sh(o[e]),b=sh(o[(e+2)%n]);
      ctx.strokeStyle='rgba(226,188,108,.9)';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();}
    // a little lacquer shine
    ctx.fillStyle='rgba(255,220,180,.07)';ctx.beginPath();ctx.moveTo(-hw*.7,hh*.6);ctx.lineTo(-hw*.1,hh*.7);ctx.lineTo(hw*.5,-hh*.6);ctx.lineTo(hw*.1,-hh*.7);ctx.closePath();ctx.fill();}
  else{const g=ctx.createLinearGradient(-hw,hh,hw,-hh);g.addColorStop(0,'#7a5a22');g.addColorStop(.45,'#f0d083');g.addColorStop(1,'#a07f36');ctx.fillStyle=g;path();ctx.fill();
    ctx.strokeStyle='rgba(40,24,6,.9)';ctx.lineWidth=.8;ctx.stroke();
    if(p.kind==='hinge'){ctx.fillStyle='rgba(40,24,6,.85)';ctx.fillRect(-.5,-hh*.7,1,p.h*.7);}}
  if(p.hot>.04){ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(255,120,40,${(p.hot*.3).toFixed(3)})`;path();ctx.fill();ctx.strokeStyle=`rgba(255,${(110+80*p.hot)|0},44,${(p.hot*.75).toFixed(3)})`;ctx.lineWidth=1.8;path();ctx.stroke();}
  ctx.restore();}
function drawBreachPuff(s){
  const S0=brSprites(),u=s.age/s.life,r=lerp(s.r,s.r1,eOut(Math.min(1,u*1.4))),q=P(s.x,s.y,s.d),a=s.a0*Math.pow(1-u,1.3)*Math.min(1,s.age/(s.hot>0?.4:.12));
  ctx.globalAlpha=a;ctx.drawImage(S0.smoke[s.kind],q.x-r,q.y-r,r*2,r*2);ctx.globalAlpha=1;}
// the fire inside the smoke glows through it: an additive pass over the scene near the doorway
function drawBreachGlow(){
  const B=S.breach;if(!B||!B.blown||S.room!=='lobby')return;ctx.save();ctx.globalCompositeOperation='lighter';const S0=brSprites();
  for(const s of B.smoke){if(s.hot<.04)continue;const u=s.age/s.life,r=lerp(s.r,s.r1,eOut(Math.min(1,u*1.4)))*1.25,q=P(s.x,s.y,s.d);
    ctx.globalAlpha=Math.min(1,s.hot)*(1-u)*.55;ctx.drawImage(S0.ember,q.x-r,q.y-r,r*2,r*2);}
  ctx.restore();}
// pieces that lie flat are part of the floor: drawn under everything that stands on it
function drawFlatPieces(){
  const B=S.breach,list=[];
  if(B&&B.blown&&S.room==='lobby')for(const p of B.pieces)if(p.th>1.2)list.push(p);
  if(S.floorPieces&&S.floorPieces.length)for(const p of S.floorPieces)list.push(p);
  if(!list.length)return;list.sort((a,b)=>b.d-a.d);for(const p of list)drawBreachPiece(p);}
// the blast's dust hangs over the lobby for a while
function drawBreachHaze(){
  const B=S.breach;if(!B||!B.blown||S.room!=='lobby')return;const u=S.t-B.blastT,a=clamp((u-.04)/.35,0,1)*(1-clamp((u-2.2)/5,0,1))*.2;if(a<.01)return;
  const cx=EXEC_DOOR.x+LOBBY.far*PSX,yB=prjY(GB,LOBBY.far),g=ctx.createRadialGradient(cx,yB-30,20,cx,yB-30,430);
  g.addColorStop(0,`rgba(176,146,114,${a.toFixed(3)})`);g.addColorStop(1,'rgba(150,120,96,0)');ctx.fillStyle=g;ctx.fillRect(cx-440,yB-300,880,460);}
// a white-out over the whole screen in the first instant, skipped for anyone who asked for less motion
function drawBreachFlash(){
  const B=S.breach;if(!B||!B.blown||reduceMotion||S.room!=='lobby')return;
  if(B.fl0==null)B.fl0=last;const t=(last-B.fl0)/1000;if(t<0||t>.55)return;
  const k=t<.05?1:Math.pow(Math.max(0,1-(t-.05)/.42),1.6),s=cv.width/cam.viewW,L=cam.x-cam.viewW/2,T=camTop();
  ctx.fillStyle=`rgba(255,244,218,${(.86*k).toFixed(3)})`;ctx.fillRect(0,0,cv.width,cv.height);
  const gx=(EXEC_DOOR.x+LOBBY.far*PSX-L)*s,gy=(prjY(GB,LOBBY.far)-80-T)*s,R=cv.width*.55,g=ctx.createRadialGradient(gx,gy,0,gx,gy,R);
  g.addColorStop(0,`rgba(255,226,170,${(.8*k).toFixed(3)})`);g.addColorStop(1,'rgba(255,200,120,0)');ctx.fillStyle=g;ctx.fillRect(0,0,cv.width,cv.height);}

V11UI.screen.push(drawBreachFlash);
V11UI.world.push(drawBreachGlow);
V11UI.world.push(drawBreachHaze);
V11UI.init.push(()=>{
  const items0=envItems,draw0=drawEnvItem,rest0=drawRestingShards;
  envItems=items=>{items0(items);const B=S.breach;
    if(B&&B.blown&&S.room==='lobby'){for(const p of B.pieces)if(p.th<=1.2)items.push({d:p.d,bp:p});for(const s of B.smoke)items.push({d:s.d+.01,bs:s});}};
  drawEnvItem=it=>{if(it.bp){drawBreachPiece(it.bp);return true;}if(it.bs){drawBreachPuff(it.bs);return true;}return draw0(it);};
  drawRestingShards=()=>{rest0();drawFlatPieces();};

  // sounds: the beeps of the charge, its click, the blast and the rattle of falling debris
  const snd0=S.hooks.sound;let LONG=null;
  const longNoise=()=>{if(LONG&&LONG.ac===AC)return LONG.buf;const len=Math.floor(AC.sampleRate*2.8),b=AC.createBuffer(1,len,AC.sampleRate),d=b.getChannelData(0);let lp=0;
    for(let i=0;i<len;i++){lp+=(uiRand()*2-1-lp)*.55;d[i]=lp*1.7;}LONG={ac:AC,buf:b};return b;};
  const N=(at,dur,type,f0,f1,q,vol,atk)=>{const a=AC,t0=a.currentTime+at,src=a.createBufferSource();src.buffer=longNoise();const fl=a.createBiquadFilter();fl.type=type;
    fl.frequency.setValueAtTime(f0,t0);fl.frequency.exponentialRampToValueAtTime(f1,t0+dur);fl.Q.value=q;const g=a.createGain();
    g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(vol,t0+(atk||.01));g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
    src.connect(fl);fl.connect(g);g.connect(master);src.start(t0);src.stop(t0+dur+.05);};
  const T=(at,dur,type,f0,f1,vol,atk,hold)=>{const a=AC,t0=a.currentTime+at,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f0,t0);
    o.frequency.exponentialRampToValueAtTime(f1,t0+dur);g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(vol,t0+(atk||.005));
    if(hold)g.gain.setValueAtTime(vol,t0+dur*hold);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);o.connect(g);g.connect(master);o.start(t0);o.stop(t0+dur+.05);};
  S.hooks.sound=(k,v)=>{
    if(k!=='beep'&&k!=='click'&&k!=='boom'&&k!=='rattle'){snd0(k,v);return;}
    if(!S.soundOn||!AC||AC.state!=='running')return;
    try{
      if(k==='beep'){const m=clamp(v||1,.8,1.8);T(0,.1,'square',1900*m,1900*m,.12,.003,.72);T(0,.1,'sine',3800*m,3800*m,.035,.003,.72);}
      else if(k==='click'){N(0,.04,'highpass',3000,7000,.8,.25,.002);T(0,.035,'square',1300,520,.07,.002);}
      else if(k==='boom'){
        T(0,1.9,'sine',98,24,1,.006);T(0,.5,'triangle',190,46,.5,.004);N(0,.75,'lowpass',3400,140,.7,1.1,.004);N(0,2.7,'lowpass',640,44,.5,.8,.02);
        N(.03,.4,'bandpass',2400,620,.9,.45,.004);T(.45,2,'sine',46,30,.3,.12);T(.3,1.7,'sine',3150,3100,.02,.2);}
      else if(k==='rattle'){for(let i=0;i<20;i++){const at=.14+i*.075+uiRand()*.06,lv=Math.pow(1-i/20,1.3)*(.5+uiRand()*.5);
          N(at,.06,'bandpass',900+uiRand()*2400,500,1.5,.24*lv,.003);T(at,.05,'triangle',140+uiRand()*280,90,.08*lv,.003);}}
    }catch(e){}
  };
  // the log: the charge and the blast
  const log0=S.hooks.log;
  S.hooks.log=e=>{
    if(e.type==='breach'){const li=newEntry(false);
      li.innerHTML=e.stage==='plant'?`<div class="lg-l">${who(e.f)}<span>plants a charge on the executive's door</span><span class="out out-move">Breach</span></div><div class="lg-perf">the beeps begin; everyone backs out of the blast</div>`
        :`<div class="lg-l"><span>The charge goes off</span><span class="out out-crit">Boom</span></div><div class="lg-perf">the door comes apart; the way to the office is open</div>`;
      pushEntry(li);return;}
    log0(e);};
});
// ===== BREACH UI END =====
