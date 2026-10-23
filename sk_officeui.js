// ===== OFFICE UI =====
// The executive's office at night, high above the city: walnut panelling, a lit drinks cabinet, a bookcase, a painting over a credenza,
// and along the right a wall of glass onto the city (aircraft lights and tower beacons are live). The blown doorway at the left, with
// smoke curling out of it. His desk (two floor items, so the people at it show between its top and its front), his chair, and the
// furniture the fight breaks. The still parts are painted once into the room's layer (paintOffice); drawOfficeLive does what moves.
const OFW={cab:176,book:282,art:430,glass:600};
let OFFICE_CITY=null;
// the city beyond the glass, in screen coordinates: towers by layer (far, middle, the landmarks, near), and the red lights on the landmarks
function officeCity(){if(OFFICE_CITY)return OFFICE_CITY;
  const r=mulberry32(5150),ox=OFFICE.far*PSX,yB=prjY(GB,OFFICE.far),gx0=OFW.glass+ox,gy0=40,gy1=yB-26,T=[],beacons=[];
  for(let x=gx0-30;x<gx0+560;x+=12+r()*16)T.push({l:0,x,w:16+r()*18,top:gy1-(34+r()*46)});
  for(let x=gx0-30;x<gx0+560;x+=16+r()*20)T.push({l:1,x,w:18+r()*22,top:gy1-(46+r()*72)});
  for(const [dx,w,top] of [[58,34,106],[196,30,134],[372,38,94],[498,28,122]]){T.push({l:2,x:gx0+dx,w,top,lm:true});beacons.push({x:gx0+dx+w/2,y:top-28,p:r()*6});}
  for(let x=gx0-40;x<gx0+560;x+=44+r()*40)T.push({l:3,x,w:40+r()*40,top:gy1-(14+r()*28)});
  return OFFICE_CITY={T,beacons,gx0,gy0,gy1};}
function paintOffice(c){
  const far=OFFICE.far,yB=prjY(GB,far),ox=far*PSX,X0=-140,X1=W+220,L=RC.x0,T=RC.y0,VW=RC.w,GX=OFW.glass+ox;
  const pl=pts=>{c.beginPath();c.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)c.lineTo(pts[i].x,pts[i].y);c.closePath();c.fill();};
  const rect=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
  const vgr=(y0,y1,st)=>{const g=c.createLinearGradient(0,y0,0,y1);for(const [u,col] of st)g.addColorStop(u,col);return g;};
  const hgr=(x0,x1,st)=>{const g=c.createLinearGradient(x0,0,x1,0);for(const [u,col] of st)g.addColorStop(u,col);return g;};
  const glow=(x,y,rx,ry,rgb,a)=>{c.save();c.globalCompositeOperation='lighter';c.translate(x,y);c.scale(1,ry/rx);const g=c.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(1,`rgba(${rgb},0)`);c.fillStyle=g;c.fillRect(-rx,-rx,2*rx,2*rx);c.restore();};
  const dark=(x,y,rx,ry,a)=>{c.save();c.translate(x,y);c.scale(1,ry/rx);const g=c.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,`rgba(6,3,2,${a})`);g.addColorStop(1,'rgba(6,3,2,0)');c.fillStyle=g;c.fillRect(-rx,-rx,2*rx,2*rx);c.restore();};
  // ---- the wall: walnut, a ceiling in shadow
  c.fillStyle=vgr(T,yB,[[0,'#0b0605'],[.2,'#1b100c'],[.5,'#33201a'],[1,'#472b1e']]);c.fillRect(L-40,T-40,VW+80,yB-T+44);
  const rail=yB-86;
  for(let x=-150;x<GX;x+=58){
    const y0=46,y1=rail-8,d0=rail+9,d1=yB-12;
    for(const [a,b,f] of [[y0,y1,'#3a2318'],[d0,d1,'#4a2e1f']]){
      rect(x+3,a,52,b-a,f);rect(x+3,a,52,1.2,'rgba(255,214,160,.16)');rect(x+3,a,1.2,b-a,'rgba(255,214,160,.09)');rect(x+53.8,a,1.2,b-a,'rgba(0,0,0,.34)');rect(x+3,b-1.2,52,1.2,'rgba(0,0,0,.4)');
      rect(x+10,a+7,38,b-a-14,'rgba(0,0,0,.13)');rect(x+10,a+7,38,1,'rgba(0,0,0,.35)');rect(x+10,b-8,38,1,'rgba(255,214,160,.1)');}
    rect(x+57,y0-4,2,yB-y0+4,'rgba(201,162,90,.1)');}
  rect(X0,rail,GX-X0,8,'#25150e');rect(X0,rail,GX-X0,1.2,'rgba(255,214,160,.3)');rect(X0,rail+3.5,GX-X0,.8,'rgba(201,162,90,.5)');
  rect(X0,yB-11,GX-X0,11,'#1a0e09');rect(X0,yB-11,GX-X0,1.2,'rgba(255,214,160,.2)');
  // ---- the ceiling's cornice, the warm line of light under it and its wash down the wall
  rect(L-40,22,VW+80,13,'#150c08');rect(L-40,22,VW+80,1.2,'rgba(255,214,160,.22)');rect(L-40,31,VW+80,4,'#24150e');
  rect(L-40,35,VW+80,1.8,'rgba(255,218,160,.92)');
  c.fillStyle=vgr(35,150,[[0,'rgba(255,196,120,.3)'],[.45,'rgba(255,196,120,.08)'],[1,'rgba(255,196,120,0)']]);c.fillRect(L-40,35,VW+80,115);
  c.fillStyle=vgr(0,22,[[0,'rgba(255,170,100,0)'],[1,'rgba(255,170,100,.1)']]);c.fillRect(L-40,0,VW+80,22);
  // ---- the blown doorway: a splintered, scorched frame, the lobby's amber light beyond
  {const dx0=OFFICE_ENTRY.x-42+ox,dx1=dx0+84,top=yB-164,cx=(dx0+dx1)/2,r=mulberry32(3131);
    // the blackening round it, soft
    dark(cx,top+4,130,70,.62);dark(cx-26,top-18,60,50,.4);dark(cx+36,top-30,50,60,.34);dark(cx,top+70,110,110,.3);dark(cx-8,top-60,26,90,.5);dark(cx+22,top-50,18,74,.38);
    // beyond: the lobby's navy dark, a pillar, amber strips on its fins, and the amber light on its marble
    rect(dx0,top,84,164,vgr(top,yB,[[0,'#0b1022'],[.4,'#232a46'],[.7,'#6a5a58'],[1,'#e0ae6c']]));
    rect(dx0+13,top,9,164,'rgba(8,10,22,.6)');rect(dx0+60,top,6,164,'rgba(8,10,22,.5)');
    for(const x of [dx0+34,dx0+72]){rect(x,top+14,1.4,86,'rgba(255,196,120,.28)');}
    glow(cx,yB-16,64,44,'255,196,120',.6);glow(cx,yB-70,80,70,'255,170,100',.14);
    // the frame: dark wood jambs and lintel
    for(const [x,y,w,h] of [[dx0-10,top-10,10,174],[dx1,top-10,10,174],[dx0-10,top-12,104,12]]){c.fillStyle=hgr(x,x+w,[[0,'#1d100a'],[.5,'#2c1a11'],[1,'#170c07']]);c.fillRect(x,y,w,h);}
    rect(dx0-10,top-12,104,1.2,'rgba(255,214,160,.3)');rect(dx0-10,top-12,104,4,'rgba(6,3,2,.5)');
    // the inner edges charred black, the split wood showing pale through it, long splinters, a few hanging from the lintel
    for(const left of [true,false]){const x=left?dx0:dx1;c.fillStyle='rgba(5,3,2,.8)';c.beginPath();c.moveTo(x,top);let y=top,e=left?1.5:-1.5;
      while(y<yB){y=Math.min(yB,y+5+r()*14);e=(left?1:-1)*(r()<.3?4+r()*3:r()<.5?1.2+r()*1.4:2+r()*2);c.lineTo(x+e,y-r()*2);}
      c.lineTo(x,yB);c.closePath();c.fill();}
    c.fillStyle='rgba(5,3,2,.7)';c.fillRect(dx0,top,84,3);
    const splint=(x,y,len,dir,w)=>{c.beginPath();c.moveTo(x,y);c.lineTo(x+dir*len,y+(r()-.3)*5);c.lineTo(x+dir*len*.45,y+w*.7);c.lineTo(x+dir*len*.5,y+w);c.lineTo(x,y+w*.9);c.closePath();c.fill();};
    c.fillStyle='rgba(214,172,116,.7)';
    for(let i=0;i<10;i++){if(r()<.3)continue;splint(dx0,top+5+i*15+r()*8,3+r()*9,1,1.6+r()*2.4);if(r()<.35)continue;splint(dx1,top+9+i*14+r()*8,3+r()*10,-1,1.6+r()*2.4);}
    for(const x of [dx0+14,dx0+38,dx0+57]){c.beginPath();c.moveTo(x+r()*6,top);c.lineTo(x+r()*6+1,top+2+r()*9);c.lineTo(x+r()*6+3.4,top);c.closePath();c.fill();}
    // a bite out of the right jamb, the lintel cracked, a stump of the door's leaf still on its hinges
    c.fillStyle='#3a2318';c.beginPath();c.moveTo(dx1,top+66);c.lineTo(dx1+7,top+72);c.lineTo(dx1+3,top+84);c.lineTo(dx1+9,top+96);c.lineTo(dx1,top+98);c.closePath();c.fill();
    c.fillStyle='rgba(206,164,108,.5)';c.beginPath();c.moveTo(dx1,top+66);c.lineTo(dx1-5,top+74);c.lineTo(dx1-1,top+84);c.lineTo(dx1-6,top+92);c.lineTo(dx1,top+98);c.closePath();c.fill();
    c.strokeStyle='rgba(206,164,108,.45)';c.lineWidth=.9;c.beginPath();c.moveTo(dx0+44,top-12);c.lineTo(dx0+47,top-5);c.lineTo(dx0+43,top);c.stroke();
    c.fillStyle='#2a170e';c.beginPath();c.moveTo(dx0,top+8);c.lineTo(dx0+9,top+10);c.lineTo(dx0+8,top+38);c.lineTo(dx0+11,top+52);c.lineTo(dx0+4,top+64);c.lineTo(dx0,top+60);c.closePath();c.fill();
    c.fillStyle='rgba(206,164,108,.65)';c.beginPath();c.moveTo(dx0+9,top+10);c.lineTo(dx0+8,top+38);c.lineTo(dx0+11,top+52);c.lineTo(dx0+4,top+64);c.lineTo(dx0+6.5,top+50);c.lineTo(dx0+5,top+36);c.lineTo(dx0+6.5,top+12);c.closePath();c.fill();
    for(const y of [top+14,top+58,top+120]){rect(dx0-3,y,6,10,'#b08a3e');rect(dx0-3,y,6,1.4,'#ecd08a');}
    rect(dx0-8,yB-4,100,4,'#150b07');
    // charred edges
    c.fillStyle='rgba(6,3,2,.45)';c.fillRect(dx0-10,yB-30,10,30);c.fillRect(dx1,yB-30,10,30);}
  // ---- the painting and the drinks cabinet
  {const x0=OFW.cab+ox,w=92,top=yB-128,gh=76,r=mulberry32(808);
    glow(x0+w/2,top+gh/2,90,80,'255,176,90',.2);
    {const px=x0+8,py=top-86,pw=76,ph=58;rect(px-5,py-5,pw+10,ph+10,'#7a5a26');rect(px-4,py-4,pw+8,ph+8,'#c9a25a');rect(px-2.5,py-2.5,pw+5,ph+5,'#2a1a10');
      rect(px,py,pw,ph,vgr(py,py+ph,[[0,'#162230'],[.5,'#3a4a5c'],[.64,'#e09a5a'],[.7,'#8a5a42'],[1,'#1a1410']]));
      c.fillStyle='#10140f';c.beginPath();c.moveTo(px,py+ph*.64);c.quadraticCurveTo(px+16,py+ph*.5,px+30,py+ph*.62);c.quadraticCurveTo(px+50,py+ph*.55,px+pw,py+ph*.66);c.lineTo(px+pw,py+ph);c.lineTo(px,py+ph);c.closePath();c.fill();
      c.fillStyle='#0c0e0c';c.fillRect(px+46,py+ph*.52,1.2,9);c.beginPath();c.moveTo(px+47,py+ph*.52);c.lineTo(px+56,py+ph*.58);c.lineTo(px+47,py+ph*.6);c.closePath();c.fill();
      c.fillStyle='rgba(255,236,190,.1)';c.beginPath();c.moveTo(px,py);c.lineTo(px+pw*.5,py);c.lineTo(px+pw*.2,py+ph);c.lineTo(px,py+ph);c.closePath();c.fill();
      rect(px+pw/2-12,py-12,24,3,'#8a6a32');rect(px+pw/2-12,py-12,24,.8,'#ecd08a');glow(px+pw/2,py+ph*.5,pw*.7,ph*.9,'255,214,150',.07);}
    rect(x0-5,top-5,w+10,128+5,'#1d100a');rect(x0-8,top-9,w+16,6,'#2e1a10');rect(x0-8,top-9,w+16,1.2,'rgba(255,214,160,.32)');
    c.fillStyle=vgr(top,top+gh,[[0,'#6a4220'],[.5,'#d89a4a'],[1,'#f0b868']]);c.fillRect(x0,top,w,gh);
    for(let s=0;s<3;s++){const sy=top+22+s*23;
      for(let x=x0+4;x<x0+w-7;){const k=r(),col=['#d89a3a','#a4442c','#4e8a4a','#d8e8d8','#7a5a8a','#c8782a'][Math.floor(r()*6)];
        if(k<.55){const bw=5+r()*2.4,bh=15+r()*4;c.fillStyle=col;c.globalAlpha=.88;c.fillRect(x,sy-bh,bw,bh);c.fillRect(x+bw*.3,sy-bh-6,bw*.4,6);c.globalAlpha=1;rect(x+1,sy-bh+3,1,bh-5,'rgba(255,255,255,.4)');rect(x,sy-bh*.5,bw,bh*.26,'rgba(236,222,190,.85)');x+=bw+1.8;}
        else if(k<.82){const bw=10+r()*3,bh=11+r()*2;c.fillStyle=col;c.globalAlpha=.82;c.beginPath();c.moveTo(x+2,sy);c.quadraticCurveTo(x-1,sy-bh*.6,x+bw*.3,sy-bh);c.lineTo(x+bw*.7,sy-bh);c.quadraticCurveTo(x+bw+1,sy-bh*.6,x+bw-2,sy);c.closePath();c.fill();c.globalAlpha=1;
          rect(x+bw*.35,sy-bh-4.4,bw*.3,4.4,'#e8d8b0');rect(x+2,sy-bh*.8,1,bh*.6,'rgba(255,255,255,.4)');x+=bw+2.4;}
        else{for(let i=0;i<3;i++){c.strokeStyle='rgba(255,246,220,.7)';c.lineWidth=.9;c.beginPath();c.moveTo(x+i*5-1.6,sy-7);c.lineTo(x+i*5+1.6,sy-7);c.lineTo(x+i*5+.6,sy-1);c.lineTo(x+i*5-.6,sy-1);c.closePath();c.stroke();}x+=17;}}
      rect(x0,sy,w,2.6,'#25150d');rect(x0,sy,w,.9,'rgba(255,230,180,.6)');rect(x0,sy+2.6,w,5,'rgba(0,0,0,.25)');}
    c.fillStyle='rgba(255,255,255,.06)';c.beginPath();c.moveTo(x0+8,top);c.lineTo(x0+30,top);c.lineTo(x0+10,top+gh);c.lineTo(x0-6,top+gh);c.closePath();c.fill();
    rect(x0+w/2-.8,top,1.6,gh,'#8a6a32');rect(x0,top+gh-1,w,3,'#8a6a32');rect(x0,top,w,1.4,'#8a6a32');
    for(const dx of [-5,3.4])rect(x0+w/2+dx,top+gh*.5-5,1.6,10,'#ecd08a');
    // the cupboards under it
    for(let i=0;i<2;i++){const dx=x0+i*(w/2)+1.5,dw=w/2-3;rect(dx,top+gh+4,dw,128-gh-12,'#5a3822');rect(dx+4,top+gh+9,dw-8,128-gh-22,'#4a2d1c');
      c.strokeStyle='rgba(201,162,90,.55)';c.lineWidth=.8;c.strokeRect(dx+6.5,top+gh+11.5,dw-13,128-gh-27);rect(dx,top+gh+4,dw,1,'rgba(255,214,160,.22)');}
    rect(x0+w/2-3,top+gh+22,2,12,'#ecd08a');rect(x0+w/2+1,top+gh+22,2,12,'#ecd08a');
    // on top: a tray with a decanter and two glasses
    rect(x0+14,top-12,32,3,'#8a6a32');rect(x0+14,top-12,32,.9,'#ecd08a');
    c.fillStyle='rgba(216,150,60,.9)';c.beginPath();c.moveTo(x0+22,top-12);c.quadraticCurveTo(x0+17,top-22,x0+25,top-27);c.lineTo(x0+31,top-27);c.quadraticCurveTo(x0+39,top-22,x0+34,top-12);c.closePath();c.fill();
    rect(x0+26,top-34,4,7,'rgba(236,222,190,.9)');rect(x0+26,top-37,4,3,'#c9a25a');rect(x0+22,top-24,1.4,8,'rgba(255,255,255,.4)');
    for(const dx of [40,46]){c.strokeStyle='rgba(235,245,250,.7)';c.lineWidth=.9;c.beginPath();c.moveTo(x0+dx-2.6,top-21);c.lineTo(x0+dx+2.6,top-21);c.lineTo(x0+dx+1,top-12);c.lineTo(x0+dx-1,top-12);c.closePath();c.stroke();rect(x0+dx-1.8,top-18,3.6,3,'rgba(216,150,60,.8)');}
  }
  // ---- the bookcase
  {const x0=OFW.book+ox,w=132,top=yB-228,sh=41,n=4,r=mulberry32(61);
    rect(x0-6,top-6,w+12,228+6,'#1d100a');rect(x0-6,top-6,w+12,1.4,'rgba(255,214,160,.25)');
    rect(x0,top,w,sh*n+2,vgr(top,top+sh*n,[[0,'#2c1a10'],[1,'#3a2214']]));
    for(let i=0;i<n;i++){const sy=top+sh*(i+1);
      c.fillStyle=vgr(sy-sh,sy,[[0,'rgba(255,196,120,.22)'],[.3,'rgba(255,196,120,.04)'],[1,'rgba(0,0,0,.1)']]);c.fillRect(x0,sy-sh,w,sh);
      const gap=i===1?{x:x0+84,w:26}:i===3?{x:x0+20,w:24}:null;
      for(let x=x0+3;x<x0+w-4;){
        if(gap&&x>=gap.x&&x<gap.x+gap.w){
          if(i===1){c.fillStyle='#e6dccb';c.beginPath();c.ellipse(x+12,sy-23,5,6.4,0,0,TAU);c.fill();c.beginPath();c.moveTo(x+4,sy-1);c.quadraticCurveTo(x+6,sy-14,x+12,sy-16);c.quadraticCurveTo(x+18,sy-14,x+20,sy-1);c.closePath();c.fill();c.fillStyle='rgba(60,40,30,.28)';c.fillRect(x+12,sy-22,5,15);rect(x+6,sy-3,12,3,'#2a1a10');}
          else{rect(x+3,sy-16,16,16,'#b08a3e');rect(x+5,sy-14,12,11,'#f0e6c8');c.strokeStyle='#2a1a10';c.lineWidth=.8;c.beginPath();c.moveTo(x+11,sy-9);c.lineTo(x+11,sy-12);c.moveTo(x+11,sy-9);c.lineTo(x+14,sy-8);c.stroke();rect(x+2,sy-17.5,18,2,'#8a6a32');}
          x=gap.x+gap.w;continue;}
        const bw=3.4+r()*4.4,bh=sh-9-r()*13,col=['#6a2428','#2a4a38','#26324f','#a8845a','#d9c8a0','#1a1416','#8a3a3a','#b8863a','#3a3a4a','#4a6a5a'][Math.floor(r()*10)];
        if(r()<.07){c.save();c.translate(x+bw/2,sy);c.rotate(.2);rect(0,-bh,bw,bh,col);c.restore();x+=bw+bh*.22;continue;}
        rect(x,sy-bh,bw,bh,col);rect(x,sy-bh,.9,bh,'rgba(255,255,255,.14)');rect(x+bw-.8,sy-bh,.8,bh,'rgba(0,0,0,.3)');
        if(r()<.5){rect(x,sy-bh+3,bw,1,'#c9a25a');rect(x,sy-4,bw,1,'#c9a25a');}else if(r()<.3)rect(x+.8,sy-bh*.6,bw-1.6,3.4,'#e8dcc0');
        x+=bw+.4;}
      rect(x0,sy,w,3,'#25150d');rect(x0,sy,w,1,'rgba(255,230,180,.45)');rect(x0,sy+3,w,4,'rgba(0,0,0,.28)');}
    rect(x0,top,w,3,'#8a6a32');rect(x0,top,w,1,'#ecd08a');
    // a slim ladder on a brass rail
    for(const dx of [w-24,w-12])seg({x:x0+dx+(dx<w-18?-3:3),y:top+6},{x:x0+dx+(dx<w-18?3:-3),y:top+sh*n},1.8,'#5a3822');
    for(let i=0;i<10;i++){const y=top+22+i*15.5,k=(y-top)/(sh*n);rect(x0+w-27+(1-k)*0+0,y,15+0,1.5,'#6a4630');}
    // the cupboard below
    for(let i=0;i<3;i++){const dx=x0+i*(w/3)+1.5,dw=w/3-3,y=top+sh*n+8;rect(dx,y,dw,yB-y-10,'#6a4630');rect(dx+4,y+4,dw-8,yB-y-18,'#5a3a26');c.strokeStyle='rgba(201,162,90,.5)';c.lineWidth=.8;c.strokeRect(dx+6.5,y+6.5,dw-13,yB-y-23);rect(dx,y,dw,1,'rgba(255,214,160,.28)');rect(dx+dw/2-1,y+6,2,10,'#ecd08a');}
    glow(x0+w/2,top+40,95,90,'255,176,90',.1);}
  // ---- the painting over the credenza
  {const x0=OFW.art+ox,w=162,cy=yB-54;
    glow(x0+w/2,yB-120,110,90,'255,190,110',.1);
    {const px=x0+26,py=cy-45-86,pw=110,ph=86;
      rect(px-5,py-5,pw+10,ph+10,'#0b0605');rect(px-5,py-5,pw+10,1,'rgba(255,214,160,.3)');rect(px-3,py-3,pw+6,ph+6,'#8a6a32');rect(px-2,py-2,pw+4,ph+4,'#150c08');
      rect(px,py,pw,ph,'#1d1416');
      const f=(y0,y1,col,hh)=>{rect(px+8,y0,pw-16,y1-y0,col);c.fillStyle=vgr(y0-5,y0,[[0,'rgba(29,20,22,0)'],[1,col]]);c.fillRect(px+8,y0-5,pw-16,5);c.fillStyle=vgr(y1,y1+5,[[0,col],[1,'rgba(29,20,22,0)']]);c.fillRect(px+8,y1,pw-16,5);};
      f(py+9,py+40,'#8a2c2a');f(py+49,py+76,'#c8862e');
      rect(px+8,py+40,pw-16,9,'#3a1a1a');rect(px+pw-30,py+6,5,ph-12,'rgba(201,162,90,.55)');
      c.fillStyle='rgba(255,230,190,.07)';c.beginPath();c.moveTo(px,py);c.lineTo(px+pw*.4,py);c.lineTo(px+pw*.12,py+ph);c.lineTo(px,py+ph);c.closePath();c.fill();
      rect(px+pw/2-22,py-14,44,3.4,'#8a6a32');rect(px+pw/2-22,py-14,44,.9,'#ecd08a');rect(px+pw/2-1,py-11,2,7,'#8a6a32');
      c.save();c.globalCompositeOperation='lighter';c.fillStyle=vgr(py-11,py+ph*.7,[[0,'rgba(255,214,150,.26)'],[1,'rgba(255,214,150,0)']]);c.beginPath();c.moveTo(px+pw/2-20,py-11);c.lineTo(px+pw/2+20,py-11);c.lineTo(px+pw+10,py+ph*.7);c.lineTo(px-10,py+ph*.7);c.closePath();c.fill();c.restore();}
    // the credenza: pale oak, three doors, brass pulls, legs
    rect(x0,cy,w,44,'#9a7048');rect(x0-3,cy-4,w+6,5,'#c29a68');rect(x0-3,cy-4,w+6,1.2,'rgba(255,240,200,.5)');
    for(let i=0;i<3;i++){const dx=x0+3+i*(w-6)/3,dw=(w-6)/3-3;rect(dx,cy+5,dw,32,'#8a6240');rect(dx+3,cy+8,dw-6,26,'#a07850');c.strokeStyle='rgba(60,36,18,.5)';c.lineWidth=.8;c.strokeRect(dx+3.5,cy+8.5,dw-7,25);rect(dx+dw/2-.8,cy+11,1.6,18,'#c9a25a');}
    rect(x0,cy+37,w,7,'#6a4a2e');rect(x0,cy+44,w,2,'rgba(0,0,0,.4)');
    for(const dx of [8,w-12]){c.fillStyle='#8a6a32';c.beginPath();c.moveTo(x0+dx,cy+44);c.lineTo(x0+dx+5,cy+44);c.lineTo(x0+dx+4,cy+52);c.lineTo(x0+dx+1,cy+52);c.closePath();c.fill();}
    // on it: a table lamp, a decanter and glasses on a tray, a small bronze horse
    {const lx=x0+14,by=cy-4;c.fillStyle='#b08a3e';c.beginPath();c.ellipse(lx,by,7,2,0,0,TAU);c.fill();rect(lx-1.2,by-18,2.4,18,'#c9a25a');
      c.fillStyle='#f0e0b8';c.beginPath();c.moveTo(lx-11,by-18);c.lineTo(lx-7,by-35);c.lineTo(lx+7,by-35);c.lineTo(lx+11,by-18);c.closePath();c.fill();
      rect(lx-9,by-30,18,.8,'rgba(120,90,50,.25)');glow(lx,by-26,46,40,'255,206,140',.32);glow(lx,by-12,34,12,'255,206,140',.18);}
    rect(x0+62,cy-6,34,2.4,'#8a6a32');rect(x0+62,cy-6,34,.8,'#ecd08a');
    c.fillStyle='rgba(60,120,100,.88)';c.beginPath();c.moveTo(x0+70,cy-6);c.quadraticCurveTo(x0+66,cy-16,x0+72,cy-21);c.lineTo(x0+77,cy-21);c.quadraticCurveTo(x0+84,cy-16,x0+80,cy-6);c.closePath();c.fill();rect(x0+73,cy-27,3.4,6,'#d8ccb0');rect(x0+70,cy-18,1.2,8,'rgba(255,255,255,.35)');
    for(const dx of [88,93]){c.strokeStyle='rgba(235,245,250,.7)';c.lineWidth=.9;c.beginPath();c.moveTo(x0+dx-2.4,cy-15);c.lineTo(x0+dx+2.4,cy-15);c.lineTo(x0+dx+.9,cy-7);c.lineTo(x0+dx-.9,cy-7);c.closePath();c.stroke();rect(x0+dx-1.6,cy-12,3.2,3,'rgba(216,150,60,.8)');}
    {const hx=x0+132,by=cy-4;rect(hx-8,by-3,16,3,'#2a2018');c.fillStyle='#6a4a22';c.beginPath();c.moveTo(hx-6,by-3);c.quadraticCurveTo(hx-8,by-10,hx-3,by-12);c.quadraticCurveTo(hx-1,by-19,hx+3,by-22);c.lineTo(hx+7,by-18);c.lineTo(hx+4,by-14);c.quadraticCurveTo(hx+7,by-9,hx+5,by-3);c.closePath();c.fill();
      c.strokeStyle='rgba(255,214,150,.45)';c.lineWidth=.8;c.beginPath();c.moveTo(hx-3,by-11);c.quadraticCurveTo(hx,by-19,hx+3,by-21);c.stroke();}}
  // ---- wall lights
  for(const wx of [166,421,593]){const x=wx+ox,y=yB-142;
    glow(x,y-16,38,64,'255,196,120',.22);glow(x,y+14,34,40,'255,196,120',.12);
    rect(x-2.4,y-9,4.8,22,'#7a5a26');rect(x-2.4,y-9,4.8,1.2,'#ecd08a');
    c.fillStyle='#f6e4bc';c.beginPath();c.moveTo(x-7,y-6);c.lineTo(x-4.4,y-21);c.lineTo(x+4.4,y-21);c.lineTo(x+7,y-6);c.closePath();c.fill();rect(x-7,y-6,14,1.6,'#c9a25a');
    c.fillStyle='rgba(255,236,190,.9)';c.fillRect(x-3,y-19,6,3);}
  // ---- the glass wall: the city at night far below
  {const C=officeCity(),gx0=GX,gx1=X1+40,gy0=C.gy0,gy1=C.gy1;
    c.save();c.beginPath();c.rect(gx0,gy0,gx1-gx0,gy1-gy0);c.clip();
    rect(gx0,gy0,gx1-gx0,gy1-gy0,'#05070f');
    c.fillStyle=vgr(gy0,gy1,[[0,'#04060e'],[.28,'#0a1030'],[.52,'#1a2250'],[.7,'#3a3468'],[.85,'#8a5a7a'],[1,'#d89070']]);c.fillRect(gx0,gy0,gx1-gx0,gy1-gy0);
    {const r=mulberry32(99);for(let i=0;i<90;i++){c.fillStyle=`rgba(230,236,255,${(.25+r()*.55).toFixed(2)})`;const s=r()<.15?1.6:1;c.fillRect(gx0+r()*(gx1-gx0),gy0+4+r()*(gy1-gy0)*.55,s,s);}}
    {const mx=gx0+176,my=gy0+60;glow(mx,my,46,46,'160,190,255',.22);c.fillStyle='#dfe8f8';c.beginPath();c.arc(mx,my,6.2,0,TAU);c.fill();c.fillStyle='#0e1636';c.beginPath();c.arc(mx+3.2,my-1.4,5.6,0,TAU);c.fill();}
    const LAY=[{col:'#262e5c',p:.14,sz:1.3,cols:['rgba(205,220,255,.5)','rgba(255,225,170,.45)','rgba(180,230,230,.4)']},{col:'#181e44',p:.24,sz:1.5,cols:['rgba(255,225,170,.6)','rgba(205,220,255,.55)','rgba(255,170,120,.5)']},
      {col:'#0f1432',p:.34,sz:1.7,cols:['rgba(255,226,170,.75)','rgba(200,220,255,.65)','rgba(255,180,120,.6)']},{col:'#090c20',p:.5,sz:2.2,cols:['rgba(255,214,140,.85)','rgba(255,236,190,.8)','rgba(255,170,100,.7)']}];
    const rw=mulberry32(404);
    for(let l=0;l<4;l++){const A=LAY[l];
      for(const t of C.T){if(t.l!==l)continue;
        c.fillStyle=A.col;c.fillRect(t.x,t.top,t.w,gy1-t.top+6);
        if(t.lm){c.fillRect(t.x+t.w*.2,t.top-10,t.w*.6,10);c.fillRect(t.x+t.w*.38,t.top-14,t.w*.24,5);c.fillRect(t.x+t.w/2-.6,t.top-28,1.2,18);
          c.fillStyle='rgba(150,180,255,.1)';c.fillRect(t.x+t.w*.3,t.top,1.2,gy1-t.top);c.fillRect(t.x+t.w*.7,t.top,1.2,gy1-t.top);}
        for(let yy=t.top+4;yy<gy1-3;yy+=A.sz*3.4)for(let xx=t.x+2.5;xx<t.x+t.w-3;xx+=A.sz*3){if(rw()<A.p){c.fillStyle=A.cols[rw()<.62?0:rw()<.8?1:2];c.fillRect(xx,yy,A.sz,A.sz*1.3);}}}
      if(l<2){c.fillStyle=vgr(gy0+90,gy1,[[0,'rgba(150,100,150,0)'],[1,`rgba(170,110,140,${l?.3:.42})`]]);c.fillRect(gx0,gy0+90,gx1-gx0,gy1-gy0-90);}}
    // the street far below: a haze of light and rows of lamps
    glow(gx0+250,gy1,320,46,'255,170,100',.3);
    {const r=mulberry32(7);for(let row=0;row<4;row++){const y=gy1-4-row*5.4+0;for(let x=gx0-10+r()*20;x<gx1;x+=7+row*2.4+r()*12){c.fillStyle=r()<.8?'rgba(255,204,130,.8)':'rgba(255,240,210,.8)';c.fillRect(x,y,1.5,1.2);}}}
    // the glass itself: a pale sheen and the warm room reflected
    c.fillStyle='rgba(190,210,255,.045)';for(const x of [gx0+30,gx0+210,gx0+400]){c.beginPath();c.moveTo(x,gy0);c.lineTo(x+60,gy0);c.lineTo(x-30,gy1);c.lineTo(x-90,gy1);c.closePath();c.fill();}
    glow(gx0+16,gy0+120,70,150,'255,190,120',.07);
    c.restore();
    // the steel between the panes, the head beam, a pier at the wall's edge
    for(let x=gx0+4;x<gx1;x+=108){rect(x-2.6,gy0,5.2,gy1-gy0,'#0a090b');rect(x-2.6,gy0,1,gy1-gy0,'rgba(200,215,255,.2)');}
    rect(gx0,gy0-5,gx1-gx0,5,'#0a090b');rect(gx0,gy0-5,gx1-gx0,1,'rgba(200,215,255,.18)');
    rect(gx0-14,gy0-5,14,yB-gy0+5,'#2c1a11');rect(gx0-14,gy0-5,1.4,yB-gy0+5,'rgba(255,214,160,.2)');rect(gx0-2,gy0,2,yB-gy0,'rgba(0,0,0,.5)');
    // the sill: pale travertine, lit from the room and from the glass
    rect(gx0,gy1,gx1-gx0,yB-gy1,'#62564a');c.fillStyle=vgr(gy1,yB,[[0,'rgba(190,210,255,.28)'],[.12,'rgba(255,230,190,.08)'],[1,'rgba(0,0,0,.34)']]);c.fillRect(gx0,gy1,gx1-gx0,yB-gy1);
    rect(gx0,gy1,gx1-gx0,1.4,'rgba(230,236,255,.5)');rect(gx0,gy1+1.4,gx1-gx0,2,'rgba(0,0,0,.35)');
    {const r=mulberry32(21);c.strokeStyle='rgba(60,46,30,.28)';c.lineWidth=.9;c.beginPath();for(let i=0;i<9;i++){const y=gy1+5+r()*(yB-gy1-9),x=gx0+r()*(gx1-gx0-200);c.moveTo(x,y);c.lineTo(x+60+r()*160,y+(r()-.5)*2);}c.stroke();}
    rect(gx0,yB-5,gx1-gx0,5,'#1a0e09');rect(gx0,yB-5,gx1-gx0,1,'rgba(255,214,160,.2)');}
  // ---- the floor: boards laid along the wall, a deep rug under the desk
  {const top=[];for(let x=X0;x<=X1;x+=20)top.push(P(x,GB,far));
    const fg=c.createLinearGradient(0,yB,0,H+60);fg.addColorStop(0,'#6e4c36');fg.addColorStop(.3,'#5c3b2a');fg.addColorStop(1,'#3a2418');
    c.fillStyle=fg;c.beginPath();c.moveTo(top[0].x,top[0].y);for(const q of top)c.lineTo(q.x,q.y);c.lineTo(prjX(X1,-90),H+90);c.lineTo(prjX(X0,-90),H+90);c.closePath();c.fill();
    const r=mulberry32(1717);
    for(let d=-80,k=0;d<=far;d+=11,k++){let x=X0-(k*37)%90;
      while(x<X1){const len=70+r()*90,a=(r()-.5)*.1;c.fillStyle=a>0?`rgba(255,214,170,${a.toFixed(3)})`:`rgba(0,0,0,${(-a).toFixed(3)})`;pl([P(x,GB,d),P(x+len,GB,d),P(x+len,GB,d+11),P(x,GB,d+11)]);x+=len;}}
    c.strokeStyle='rgba(20,10,6,.4)';c.lineWidth=1;c.beginPath();
    for(let d=-80,k=0;d<=far;d+=11,k++){const a=P(X0,GB,d),b=P(X1,GB,d);c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);
      for(let x=X0+((k*53)%110);x<X1;x+=110+(k%3)*14){const q1=P(x,GB,d),e=P(x,GB,d+11);c.moveTo(q1.x,q1.y);c.lineTo(e.x,e.y);}}
    c.stroke();
    // the moonlight through the glass lying across the boards
    c.fillStyle='rgba(150,180,255,.05)';for(const x of [620,730,840]){pl([P(x,GB,236),P(x+96,GB,236),P(x+30,GB,110),P(x-96,GB,110)]);}
    // the rug: deep teal, a border of ink and gold, lozenges
    {const x0=520,x1=930,d0=34,d1=196,q=(x,d)=>P(x,GB,d);
      c.fillStyle='rgba(0,0,0,.3)';pl([q(x0-4,d0-3),q(x1,d0-3),q(x1,d1+3),q(x0-4,d1+3)]);
      c.fillStyle='#16292d';pl([q(x0,d0),q(x1,d0),q(x1,d1),q(x0,d1)]);
      c.fillStyle='#2f5f63';pl([q(x0+10,d0+8),q(x1,d0+8),q(x1,d1-8),q(x0+10,d1-8)]);
      c.strokeStyle='rgba(205,170,100,.75)';c.lineWidth=1.4;c.beginPath();for(const p of [q(x0+5,d0+4),q(x1,d0+4),q(x1,d1-4),q(x0+5,d1-4)])c.lineTo(p.x,p.y);c.closePath();c.stroke();
      c.strokeStyle='rgba(205,170,100,.4)';c.lineWidth=.9;c.beginPath();for(const p of [q(x0+13,d0+11),q(x1,d0+11),q(x1,d1-11),q(x0+13,d1-11)])c.lineTo(p.x,p.y);c.closePath();c.stroke();
      c.strokeStyle='rgba(205,170,100,.34)';c.lineWidth=1;c.beginPath();
      for(let x=x0+44;x<x1;x+=52)for(let d=d0+34;d<d1-24;d+=44){const o=((x/52|0)%2)*22,dd=d+o-(o?22:0);const cx=x,cd=dd+22;
        const a=q(cx-18,cd),b=q(cx,cd+13),e=q(cx+18,cd),f=q(cx,cd-13);c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineTo(e.x,e.y);c.lineTo(f.x,f.y);c.closePath();}
      c.stroke();
      c.fillStyle='rgba(205,170,100,.2)';for(let x=x0+44;x<x1;x+=52)for(let d=d0+34;d<d1-24;d+=44){const p=q(x,d+22+(((x/52|0)%2)?22:0)),s=q(x,d+22+(((x/52|0)%2)?22:0)-0.001);c.beginPath();c.arc(p.x,p.y,1.4,0,TAU);c.fill();}
      c.strokeStyle='rgba(205,170,100,.5)';c.lineWidth=.9;c.beginPath();for(let d=d0+10;d<d1-8;d+=7){const p=q(x0,d),e=q(x0-6,d);c.moveTo(p.x,p.y);c.lineTo(e.x,e.y);}c.stroke();}
    // the doorway's light on the boards, soot about its foot, and the desk's pool of lamplight
    {const a=OFFICE_ENTRY.x-42,b=a+84;c.fillStyle='rgba(255,180,90,.2)';pl([P(a,GB,far),P(b,GB,far),P(b+70,GB,150),P(a-60,GB,150)]);c.fillStyle='rgba(255,196,120,.14)';pl([P(a+8,GB,far),P(b-8,GB,far),P(b+30,GB,196),P(a-20,GB,196)]);
      const q=P((a+b)/2,GB,222);dark(q.x,q.y,92,22,.55);
      const rr=mulberry32(5);c.fillStyle='rgba(8,4,3,.4)';for(let i=0;i<7;i++){const s=P(a-20+rr()*130,GB,196+rr()*38);c.beginPath();c.ellipse(s.x,s.y,5+rr()*12,1.5+rr()*3,0,0,TAU);c.fill();}}
    {const q=P(DESK.x+6,GB,DESK.d-18);glow(q.x,q.y,92,24,'255,190,110',.16);}
    c.fillStyle='rgba(10,4,2,.5)';c.fillRect(X0,yB-2,X1-X0,3);
    // the edges of the picture grow darker
    c.fillStyle=hgr(L,L+160,[[0,'rgba(5,2,2,.55)'],[1,'rgba(5,2,2,0)']]);c.fillRect(L,T,160,yB-T);
    c.fillStyle=vgr(400,H+90,[[0,'rgba(5,2,2,0)'],[1,'rgba(5,2,2,.4)']]);c.fillRect(L,400,VW,H+90-400);}
}
// the lobby's smoke sprites, lit warm from the doorway
let OF_SMOKE=null;
function ofSmoke(){if(OF_SMOKE)return OF_SMOKE;
  return OF_SMOKE=brSprites().smoke.map(sp=>{const c=document.createElement('canvas');c.width=sp.width;c.height=sp.height;const g=c.getContext('2d');g.drawImage(sp,0,0);g.globalCompositeOperation='source-atop';g.fillStyle='rgba(255,208,150,.62)';g.fillRect(0,0,c.width,c.height);return c;});}
// ---------- what moves: aircraft, the red lights on the towers, the doorway's flicker and its smoke ----------
function drawOfficeLive(){
  const far=OFFICE.far,yB=prjY(GB,far),ox=far*PSX,t=reduceMotion?4.2:S.t,C=officeCity(),gx0=C.gx0,G=glowSprites(),B=brSprites();   // with reduced motion the lights and the smoke stand still
  ctx.save();ctx.globalCompositeOperation='lighter';
  const dot=(x,y,r,col,a)=>{ctx.globalAlpha=a;ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();};
  for(const b of C.beacons){const k=Math.max(0,Math.sin(t*3.6+b.p)),a=k*k;if(a>.02){ctx.globalAlpha=.9*a;ctx.drawImage(B.red,b.x-9,b.y-9,18,18);}dot(b.x,b.y,.9,'#ff6a5a',.35+.5*a);}
  // an airliner crossing high up, a helicopter low over the roofs
  {const span=640,x=gx0-30+((t*8+210)%span),y=gx0>0?C.gy0+46+Math.sin(x*.01)*3:0;
    dot(x,y,1.1,'#ffffff',(t*1.1)%1<.12?1:.0);dot(x-5,y+.6,1,'#ff4a3a',.55+.4*Math.sin(t*6.3)*Math.sin(t*6.3));dot(x+5,y+.6,1,'#4aff8a',.5);ctx.globalAlpha=.4;ctx.drawImage(B.red,x-5,y-5,10,10);}
  {const span=700,x=gx0+660-((t*5.5+90)%span),y=C.gy0+112+Math.sin(t*.7)*2;
    dot(x,y,1.2,'#ffffff',(t*1.7)%1<.1?1:0);dot(x+4,y+1,.9,'#ff4a3a',.4+.5*(Math.sin(t*9)>0?1:0));}
  // the amber light in the doorway wavers, and warm embers drift out
  {const dx0=OFFICE_ENTRY.x-42+ox,fl=.5+.25*Math.sin(t*3.1)+.15*Math.sin(t*11.3)+.1*Math.sin(t*23);
    ctx.globalAlpha=.07*fl;ctx.fillStyle='#ffb060';ctx.fillRect(dx0,yB-164,84,164);
    ctx.globalAlpha=.3*fl;ctx.drawImage(G.pool,dx0-30,yB-70,144,90);
    for(let i=0;i<4;i++){const u=(t*.22+i*.25+i*.07)%1,x=dx0+14+((i*23)%58)+Math.sin(t*1.7+i*2)*9*u,y=yB-30-u*120;ctx.globalAlpha=.8*Math.sin(u*Math.PI)*(0.6+.4*Math.sin(t*17+i));ctx.drawImage(B.ember,x-3,y-3,6,6);}}
  ctx.restore();
  // smoke curling out of the doorway and spreading along the ceiling
  ctx.save();const SM=ofSmoke();
  for(let i=0;i<7;i++){const life=9,u=((t+i*life/7)%life)/life,k=Math.sin(u*Math.PI),dx0=OFFICE_ENTRY.x-42+ox;
    const x=dx0+42+Math.sin(i*2.4+u*3.1)*(12+u*20)+u*u*70,y=yB-50-u*(150+i%3*16),s=40+u*(96+i%3*12);
    ctx.globalAlpha=.8*Math.pow(k,.8)*(1-u*.3);ctx.drawImage(SM[i%3],x-s/2,y-s/2,s,s);}
  ctx.restore();
}
// the desk is two floor items: its back and top behind anyone at the desk's own depth (the executive in his chair, Kael leaning
// over it, a head on the desktop), and its front face in front of them, hiding the knees under it
function drawDesk(Pp,back){
  const p=Pp.pts,d=Pp.dep,dz=Pp.dz,fr=d-dz*.8,bk=d+dz*.8,x0=p[0].x,x1=p[1].x,yt=p[0].y,g=p[2].y+2,h=g-yt,rk=reduceMotion?0:Pp.rock||0,t=S.t;
  const F=(u,v)=>P(x0+u,g-v,fr),Tp=(x,dd)=>P(x,yt,d+dd),Wd=x1-x0;
  const rc=(a,b,col)=>{ctx.fillStyle=col;poly([F(a[0],a[1]),F(b[0],a[1]),F(b[0],b[1]),F(a[0],b[1])]);};
  ctx.lineJoin='round';ctx.lineCap='round';
  if(back){
    // his shadow on the boards, then the dark inside of the desk and its far side
    ctx.fillStyle='rgba(6,3,2,.3)';ctx.beginPath();{const q=P((x0+x1)/2,g,d);ctx.ellipse(q.x,q.y,Wd/2+8,15,0,0,TAU);}ctx.fill();
    ctx.fillStyle='#1a0e08';poly([P(x0,g,bk),P(x1,g,bk),P(x1,yt,bk),P(x0,yt,bk)]);
    // the top: a walnut edge, a field of green leather tooled in gold
    ctx.fillStyle='#5a3822';poly([P(x0-2.5,yt,fr-2),P(x1+2.5,yt,fr-2),P(x1+2.5,yt,bk+1.5),P(x0-2.5,yt,bk+1.5)]);
    ctx.fillStyle='#244a3a';poly([P(x0+2,yt,fr+2),P(x1-2,yt,fr+2),P(x1-2,yt,bk-2),P(x0+2,yt,bk-2)]);
    ctx.strokeStyle='rgba(222,184,106,.7)';ctx.lineWidth=.8;ctx.beginPath();for(const q of [P(x0+4,yt,fr+4),P(x1-4,yt,fr+4),P(x1-4,yt,bk-4),P(x0+4,yt,bk-4)])ctx.lineTo(q.x,q.y);ctx.closePath();ctx.stroke();
    ctx.save();ctx.globalCompositeOperation='lighter';{const q=Tp(x0+22,6);ctx.translate(q.x,q.y);ctx.scale(1,.34);const gr=ctx.createRadialGradient(0,0,0,0,0,40);gr.addColorStop(0,'rgba(255,208,140,.5)');gr.addColorStop(1,'rgba(255,190,110,0)');ctx.fillStyle=gr;ctx.fillRect(-40,-40,80,80);}ctx.restore();
    // a blotter, two sheets of paper and a pen
    ctx.fillStyle='#14201c';poly([Tp(x0+22,fr-d+7),Tp(x0+60,fr-d+7),Tp(x0+60,fr-d+26),Tp(x0+22,fr-d+26)]);
    ctx.strokeStyle='rgba(222,184,106,.5)';ctx.lineWidth=.7;ctx.beginPath();for(const q of [Tp(x0+23.5,fr-d+8.5),Tp(x0+58.5,fr-d+8.5),Tp(x0+58.5,fr-d+24.5),Tp(x0+23.5,fr-d+24.5)])ctx.lineTo(q.x,q.y);ctx.closePath();ctx.stroke();
    for(const [px,pd,w,hh,ro] of [[x0+34,fr-d+12,16,12,-.05],[x0+44,fr-d+16,15,11,.08]]){const fl=rk>0.03?Math.max(0,Math.sin(t*21+px))*rk*3.4:0,q=Tp(px,pd);ctx.save();ctx.translate(q.x,q.y-fl);ctx.rotate(ro+rk*.2*Math.sin(t*17+px));
      ctx.fillStyle='#e8dfc9';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(w,.6);ctx.lineTo(w+1.4,-hh*.75);ctx.lineTo(1.4,-hh*.75-.6);ctx.closePath();ctx.fill();
      ctx.strokeStyle='rgba(60,50,40,.55)';ctx.lineWidth=.6;ctx.beginPath();for(let i=0;i<3;i++){ctx.moveTo(3+i*.3,-2-i*2.4);ctx.lineTo(w-3,-1.6-i*2.4);}ctx.stroke();ctx.restore();}
    {const q=Tp(x0+48,fr-d+19),q2=Tp(x0+58,fr-d+15);seg(q,q2,1.8,'#0c0c0e');seg(q,{x:q.x+2.4,y:q.y-.4},1.8,'#c9a25a');}
    // the banker's lamp, at the back: brass foot and stem, a green glass shade, a warm light under it
    {const q=Tp(x0+16,bk-d-8);ctx.save();ctx.translate(q.x,q.y);const sw=rk*.22*Math.sin(t*17.5)*Math.exp(-0);ctx.rotate(sw);
      ctx.fillStyle='#8a6a2e';ctx.beginPath();ctx.ellipse(0,0,7.5,2.6,0,0,TAU);ctx.fill();ctx.fillStyle='#c9a25a';ctx.beginPath();ctx.ellipse(0,-1.4,6.3,2.2,0,0,TAU);ctx.fill();
      ctx.fillStyle=ofGr(-1.4,1.4,'#8a6a2e','#ecd08a');ctx.fillRect(-1.3,-15,2.6,13.5);ctx.fillStyle='#c9a25a';ctx.fillRect(-2.2,-9,4.4,1.8);
      ctx.fillStyle='#173a2a';ctx.beginPath();ctx.moveTo(-12.5,-12);ctx.quadraticCurveTo(-13,-23,-4,-25);ctx.lineTo(4,-25);ctx.quadraticCurveTo(13,-23,12.5,-12);ctx.closePath();ctx.fill();
      ctx.fillStyle='#2f8a5c';ctx.beginPath();ctx.moveTo(-11.5,-12.4);ctx.quadraticCurveTo(-12,-22,-4,-24);ctx.lineTo(3,-24);ctx.quadraticCurveTo(7,-23,9,-18);ctx.lineTo(-1,-12.4);ctx.closePath();ctx.fill();
      ctx.strokeStyle='rgba(190,255,215,.7)';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(-9.6,-17);ctx.quadraticCurveTo(-9.4,-22,-4,-23.2);ctx.stroke();
      ctx.fillStyle='#c9a25a';ctx.fillRect(-12.8,-12.6,25.6,1.6);ctx.fillRect(-1.6,-26.6,3.2,2);
      ctx.fillStyle='rgba(255,236,176,.95)';ctx.fillRect(-9,-11.2,18,1.4);
      ctx.restore();
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.translate(q.x,q.y-16);ctx.scale(1,.8);const gr=ctx.createRadialGradient(0,0,0,0,0,34);gr.addColorStop(0,'rgba(255,214,140,.5)');gr.addColorStop(1,'rgba(255,190,110,0)');ctx.fillStyle=gr;ctx.beginPath();ctx.arc(0,0,34,0,TAU);ctx.fill();ctx.restore();}
    // the telephone
    {const q=Tp(x0+6,bk-d-5);ctx.fillStyle='#0c0b0d';ctx.beginPath();ctx.moveTo(q.x-8,q.y);ctx.lineTo(q.x-6,q.y-5);ctx.lineTo(q.x+6,q.y-5);ctx.lineTo(q.x+8,q.y);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#0c0b0d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(q.x-8,q.y-6);ctx.quadraticCurveTo(q.x,q.y-10,q.x+8,q.y-6);ctx.stroke();ctx.fillStyle='#c9a25a';ctx.beginPath();ctx.arc(q.x,q.y-2.4,1.4,0,TAU);ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(q.x-6,q.y-8);ctx.quadraticCurveTo(q.x,q.y-10,q.x+6,q.y-7.6);ctx.stroke();}
    return;}
  // ---- the front: an end panel in walnut with a raised, inlaid field, turned corners, bun feet
  ctx.fillStyle='#241409';poly([P(x1,g,fr),P(x1,g,bk),P(x1,yt,bk),P(x1,yt,fr)]);
  ctx.fillStyle='#160b05';poly([P(x1,g-6,fr),P(x1,g-6,bk-2),P(x1,yt+6,bk-2),P(x1,yt+6,fr)]);
  {const gr=ctx.createLinearGradient(0,F(0,h).y,0,F(0,0).y);gr.addColorStop(0,'#4a2d1c');gr.addColorStop(1,'#321d12');ctx.fillStyle=gr;poly([F(0,h),F(Wd,h),F(Wd,0),F(0,0)]);}
  rc([-2.5,h],[Wd+2.5,h-5.4],'#5a3822');rc([-2.5,h],[Wd+2.5,h-1],'#8a6038');rc([-1,h-5.4],[Wd+1,h-7.2],'rgba(0,0,0,.4)');
  rc([0,h-7],[4.6,6],'#3a2216');rc([Wd-4.6,h-7],[Wd,6],'#3a2216');rc([4.6,h-7],[5.6,6],'rgba(0,0,0,.35)');rc([Wd-5.6,h-7],[Wd-4.6,6],'rgba(0,0,0,.35)');rc([0,h-7],[1,6],'rgba(255,214,160,.18)');
  rc([8,h-11],[Wd-8,12],'#26150c');rc([9.4,h-12.4],[Wd-9.4,13.4],'#4e301d');
  {const gr=ctx.createLinearGradient(F(0,0).x,0,F(Wd,0).x,0);gr.addColorStop(0,'rgba(255,214,160,.13)');gr.addColorStop(.5,'rgba(255,214,160,0)');gr.addColorStop(1,'rgba(0,0,0,.2)');ctx.fillStyle=gr;poly([F(9.4,h-12.4),F(Wd-9.4,h-12.4),F(Wd-9.4,13.4),F(9.4,13.4)]);}
  ctx.strokeStyle='rgba(222,184,106,.85)';ctx.lineWidth=.8;ctx.beginPath();for(const q of [F(12,h-15),F(Wd-12,h-15),F(Wd-12,17),F(12,17)])ctx.lineTo(q.x,q.y);ctx.closePath();ctx.stroke();
  {const c0=F(Wd/2,h/2+1);ctx.fillStyle='#8a6a2e';ctx.beginPath();ctx.moveTo(c0.x,c0.y-8);ctx.lineTo(c0.x+5.4,c0.y);ctx.lineTo(c0.x,c0.y+8);ctx.lineTo(c0.x-5.4,c0.y);ctx.closePath();ctx.fill();
    ctx.fillStyle='#e0bc66';ctx.beginPath();ctx.moveTo(c0.x,c0.y-6);ctx.lineTo(c0.x+3.8,c0.y);ctx.lineTo(c0.x,c0.y+6);ctx.lineTo(c0.x-3.8,c0.y);ctx.closePath();ctx.fill();ctx.fillStyle='#4a2d1c';ctx.beginPath();ctx.arc(c0.x,c0.y,1.5,0,TAU);ctx.fill();}
  rc([2,7],[Wd-2,3],'#1c100a');rc([2,7],[Wd-2,6.2],'rgba(255,214,160,.14)');
  for(const u of [5.5,Wd-5.5]){const q=F(u,1.6);ctx.fillStyle='#4a3216';ctx.beginPath();ctx.ellipse(q.x,q.y,3.8,2.4,0,0,TAU);ctx.fill();ctx.fillStyle='#8a6a2e';ctx.beginPath();ctx.ellipse(q.x-.6,q.y-.5,2.4,1.5,0,0,TAU);ctx.fill();}
  // on the front edge: a nameplate in brass on a wedge of wood
  {const q=P(x0+Wd-14,yt,fr+3);ctx.fillStyle='#2a170f';ctx.fillRect(q.x-9.5,q.y-2,19,2.2);const gr=ctx.createLinearGradient(0,q.y-7,0,q.y-2);gr.addColorStop(0,'#f0d68a');gr.addColorStop(1,'#a07a34');ctx.fillStyle=gr;ctx.beginPath();ctx.moveTo(q.x-9,q.y-2);ctx.lineTo(q.x-8,q.y-7);ctx.lineTo(q.x+8,q.y-7);ctx.lineTo(q.x+9,q.y-2);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(60,36,10,.75)';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(q.x-6,q.y-5.4);ctx.lineTo(q.x+6,q.y-5.4);ctx.moveTo(q.x-4,q.y-3.6);ctx.lineTo(q.x+4,q.y-3.6);ctx.stroke();}
}
function ofGr(x0,x1,a,b){const g=ctx.createLinearGradient(x0,0,x1,0);g.addColorStop(0,a);g.addColorStop(1,b);return g;}
// the executive's chair: a high-backed leather swivel on a five-star base, drawn from its four points whatever way up it lies
const OFCH={draw(Pp){
  const p=Pp.pts,d=Pp.dep,A=p[0],B=p[1],Cp=p[2],H=p[3],ux=B.x-A.x,uy=B.y-A.y,L=Math.hypot(ux,uy)||1,u={x:ux/L,y:uy/L},n={x:u.y,y:-u.x};
  const loc=(a,b)=>({x:A.x+u.x*a+n.x*b,y:A.y+u.y*a+n.y*b}),ca=(Cp.x-A.x)*u.x+(Cp.y-A.y)*u.y,cb=(Cp.x-A.x)*n.x+(Cp.y-A.y)*n.y,NEAR=d-9,FAR=d+9,bw=9;
  ctx.lineCap='round';ctx.lineJoin='round';
  // the five legs of the base and their casters (the far ones first)
  for(const l of [[0,22],[-21,6.8],[21,6.8],[-13,-17.8],[13,-17.8]].sort((a,b)=>b[1]-a[1])){const e={x:H.x+u.x*l[0],y:H.y+u.y*l[0]+3.4},a=at(H,d),b=at(e,d+l[1]);
    seg(a,b,3,l[1]>0?'#1c1a1e':'#2e2c32');const w=at({x:e.x,y:e.y+1.6},d+l[1]);ctx.fillStyle='#0c0b0d';ctx.beginPath();ctx.arc(w.x,w.y,2.6,0,TAU);ctx.fill();ctx.fillStyle='#5a5a62';ctx.beginPath();ctx.arc(w.x-.5,w.y-.6,1,0,TAU);ctx.fill();}
  // the gas lift
  {const top=loc(L*.5,-6),a=at(H,d),b=at(top,d);seg(a,b,4,'#17161a');seg(a,{x:lerp(a.x,b.x,.45),y:lerp(a.y,b.y,.45)},4.6,'#4a4a52');}
  // the seat: a thick cushion, its top seen between the near and the far side
  const s0=loc(-1,0),s1=loc(L+1,0),s0b=loc(-1,-8),s1b=loc(L+1,-8);
  ctx.fillStyle='#2a0f0e';poly([at(s0,FAR),at(s1,FAR),at(s1b,FAR),at(s0b,FAR)]);
  ctx.fillStyle='#4a1d1d';poly([at(s0,NEAR),at(s1,NEAR),at(s1,FAR),at(s0,FAR)]);
  ctx.fillStyle='#3a1514';poly([at(s0,NEAR),at(s1,NEAR),at(s1b,NEAR),at(s0b,NEAR)]);
  ctx.strokeStyle='rgba(222,184,106,.7)';ctx.lineWidth=.8;ctx.beginPath();{const a=at(s0b,NEAR),b=at(s1b,NEAR);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();
  ctx.strokeStyle='rgba(255,170,150,.3)';ctx.lineWidth=1;ctx.beginPath();{const a=at(s0,NEAR),b=at(s1,NEAR);ctx.moveTo(a.x+1,a.y+1);ctx.lineTo(b.x-1,b.y+1);}ctx.stroke();
  // the back: tall and tilted, a slab of leather; its rear face, its near edge with channels and a brass piping, a headrest
  const b0=loc(L-bw,0),b1=loc(L,0),t1=loc(ca,cb),t0=loc(ca-bw,cb);
  ctx.fillStyle='#240c0b';poly([at(b0,FAR),at(b1,FAR),at(t1,FAR),at(t0,FAR)]);
  ctx.fillStyle='#401817';poly([at(b1,NEAR),at(b1,FAR),at(t1,FAR),at(t1,NEAR)]);
  ctx.fillStyle='#4e1e1c';poly([at(t0,NEAR),at(t1,NEAR),at(t1,FAR),at(t0,FAR)]);
  ctx.fillStyle='#5a2221';poly([at(b0,NEAR),at(b1,NEAR),at(t1,NEAR),at(t0,NEAR)]);
  ctx.strokeStyle='rgba(20,6,6,.5)';ctx.lineWidth=.9;ctx.beginPath();for(let k=1;k<5;k++){const a=at(lerpP(b0,t0,k/5),NEAR),b=at(lerpP(b1,t1,k/5),NEAR);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();
  ctx.strokeStyle='rgba(222,184,106,.78)';ctx.lineWidth=.8;ctx.beginPath();{const a=at(b0,NEAR),b=at(t0,NEAR),c2=at(t1,NEAR),e=at(b1,NEAR);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c2.x,c2.y);ctx.lineTo(e.x,e.y);}ctx.stroke();
  {const hm=at(loc(ca-bw*.5,cb-9),NEAR),ang=Math.atan2(u.x,-u.y)*0+Math.atan2(n.y,n.x)+Math.PI/2;ctx.fillStyle='#6a2a28';ctx.beginPath();ctx.ellipse(hm.x,hm.y,8,6,Math.atan2(u.y,u.x),0,TAU);ctx.fill();ctx.fillStyle='rgba(255,170,150,.22)';ctx.beginPath();ctx.ellipse(hm.x-1,hm.y-1.6,5,2.6,Math.atan2(u.y,u.x),0,TAU);ctx.fill();}
  // the arm: a leather pad on a brass post, near side
  {const a0=at(loc(L*.5+2,2),NEAR-3),a1=at(loc(L*.5+2,21),NEAR-3);seg(a0,a1,2.4,'#b08a3e');const e0=at(loc(L*.5-8,22),NEAR-3),e1=at(loc(L*.5+13,22),NEAR-3);seg(e0,e1,5.4,'#2a0f0e');seg({x:e0.x,y:e0.y-1.2},{x:e1.x,y:e1.y-1.2},2.6,'#6a2a28');}
}};
Object.assign(PROP_DRAW,{execchair(Pp){OFCH.draw(Pp);}});
function lerpP(a,b,u){return{x:lerp(a.x,b.x,u),y:lerp(a.y,b.y,u)};}
// ---------- the furniture the fight breaks ----------
// a prop drawn in its own frame: u along the line through two of its points (its base), v up from it
function ofFrame(Pp,i,j){const a=Pp.pts[i],b=Pp.pts[j],ox=(a.x+b.x)/2,oy=(a.y+b.y)/2,dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,d=Pp.dep;
  return(u,v,dd)=>{const x=ox+ux*u+uy*v,y=oy+uy*u-ux*v;return P(x,y,d+(dd||0));};}
function ofPoly(m,list,dd){ctx.beginPath();list.forEach(([u,v],k)=>{const q=m(u,v,dd);k?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);});ctx.closePath();ctx.fill();}
function ofLine(m,list,dd){ctx.beginPath();list.forEach(([u,v],k)=>{const q=m(u,v,dd);k?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);});ctx.stroke();}
function ofWheel(q,r){ctx.fillStyle='#0c0b0d';ctx.beginPath();ctx.arc(q.x,q.y,r,0,TAU);ctx.fill();ctx.fillStyle='#8a6a2e';ctx.beginPath();ctx.arc(q.x,q.y,r*.45,0,TAU);ctx.fill();}
Object.assign(PROP_DRAW,{
  barcart(Pp){const m=ofFrame(Pp,2,3),dz=9;ctx.lineCap='round';ctx.lineJoin='round';
    // far posts and wheels, the lower shelf with the ice bucket and a bottle lying down, the glass top, the near posts, the handle
    ctx.strokeStyle='#7a5a26';ctx.lineWidth=2.4;ofLine(m,[[-28,0],[-30,66]],dz);ofLine(m,[[28,0],[30,66]],dz);
    ofWheel(m(-27,-1,dz),4.2);ofWheel(m(27,-1,dz),4.2);
    ctx.fillStyle='#3a2416';ofPoly(m,[[-29,24],[29,24],[29,24],[-29,24]],dz);
    ctx.fillStyle='#4a2e1c';ofPoly(m,[[-29,22],[29,22],[29,25],[-29,25]],-dz);ctx.fillStyle='#2a170f';ofPoly(m,[[-29,24],[29,24],[29,25],[-29,25]],dz);
    ctx.fillStyle='#5a3a24';ofPoly(m,[[-29,25],[29,25],[29,25],[-29,25]],0);
    ctx.fillStyle='#4e321f';ofPoly(m,[[-29,25],[29,25],[29,25],[-29,25]],-dz);
    // the shelf board seen from above, with what is on it
    ctx.fillStyle='#5a3a24';ofPoly(m,[[-29,25],[29,25],[29,25],[-29,25]],0);
    ctx.fillStyle='#53341f';{ctx.beginPath();const a=m(-29,25,-dz),b=m(29,25,-dz),c2=m(29,25,dz),d2=m(-29,25,dz);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c2.x,c2.y);ctx.lineTo(d2.x,d2.y);ctx.closePath();ctx.fill();}
    {const q=m(-14,25,0);ctx.fillStyle='#b8bcc2';ctx.beginPath();ctx.moveTo(q.x-6.4,q.y-12);ctx.lineTo(q.x+6.4,q.y-12);ctx.lineTo(q.x+4.6,q.y);ctx.lineTo(q.x-4.6,q.y);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(255,255,255,.4)';ctx.fillRect(q.x-5,q.y-11,1.6,10);
      ctx.fillStyle='#1c3a26';ctx.fillRect(q.x-1.6,q.y-24,3.2,13);ctx.fillStyle='#c9a25a';ctx.fillRect(q.x-1.8,q.y-27,3.6,4.6);}
    {const a=m(2,29,0),b=m(26,29,0);seg(a,b,6.4,'#16301f');seg({x:lerp(a.x,b.x,.4),y:lerp(a.y,b.y,.4)},{x:lerp(a.x,b.x,.66),y:lerp(a.y,b.y,.66)},6.5,'#e8dcc0');seg({x:b.x,y:b.y},{x:b.x+2.4,y:b.y},5,'#c9a25a');}
    // the glass top, with a brass rim
    ctx.fillStyle='rgba(150,190,186,.5)';{ctx.beginPath();const a=m(-31,66,-dz),b=m(31,66,-dz),c2=m(31,66,dz),d2=m(-31,66,dz);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c2.x,c2.y);ctx.lineTo(d2.x,d2.y);ctx.closePath();ctx.fill();}
    ctx.strokeStyle='#c9a25a';ctx.lineWidth=1.4;ofLine(m,[[-31,66],[31,66]],-dz);ctx.strokeStyle='rgba(236,208,138,.5)';ofLine(m,[[-31,66],[-31,66]],-dz);
    ctx.strokeStyle='rgba(255,255,255,.3)';ctx.lineWidth=.9;ofLine(m,[[-24,66],[-10,66]],-dz+3);
    ctx.strokeStyle='#c9a25a';ctx.lineWidth=2.8;ofLine(m,[[-28,0],[-30,66]],-dz);ofLine(m,[[28,0],[30,66]],-dz);ctx.strokeStyle='rgba(255,236,176,.5)';ctx.lineWidth=.9;ofLine(m,[[-29.4,6],[-30.4,62]],-dz);
    ctx.strokeStyle='#c9a25a';ctx.lineWidth=2.2;{const a=m(30,66,-dz),b=m(40,76,-dz),c2=m(40,92,-dz);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo(b.x,b.y,c2.x,c2.y);ctx.stroke();}
    ofWheel(m(-27,-1,-dz),4.8);ofWheel(m(27,-1,-dz),4.8);},
  sculpt(Pp){const m=ofFrame(Pp,2,3),dz=9;ctx.lineJoin='round';
    // a plinth of pale stone: right side, top, front; on it a bronze form
    ctx.fillStyle='#8f897d';ofPoly(m,[[16,0],[16,60],[16,60],[16,0]],-dz);{ctx.beginPath();const a=m(16,0,-dz),b=m(16,0,dz),c2=m(16,60,dz),d2=m(16,60,-dz);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c2.x,c2.y);ctx.lineTo(d2.x,d2.y);ctx.closePath();ctx.fill();}
    ctx.fillStyle='#e6e0d4';{ctx.beginPath();const a=m(-16,60,-dz),b=m(16,60,-dz),c2=m(16,60,dz),d2=m(-16,60,dz);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c2.x,c2.y);ctx.lineTo(d2.x,d2.y);ctx.closePath();ctx.fill();}
    {const a=m(-16,0,-dz),b=m(16,0,-dz),c2=m(16,60,-dz),d2=m(-16,60,-dz),g=ctx.createLinearGradient(a.x,0,b.x,0);g.addColorStop(0,'#d6d0c4');g.addColorStop(.5,'#cfc8bc');g.addColorStop(1,'#b0a99c');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c2.x,c2.y);ctx.lineTo(d2.x,d2.y);ctx.closePath();ctx.fill();}
    ctx.fillStyle='#bdb6aa';ofPoly(m,[[-17,56],[17,56],[17,60],[-17,60]],-dz);ctx.fillStyle='rgba(255,255,255,.3)';ofPoly(m,[[-17,59],[17,59],[17,60],[-17,60]],-dz);ctx.fillStyle='#a49d90';ofPoly(m,[[-17,0],[17,0],[17,5],[-17,5]],-dz);
    ctx.strokeStyle='rgba(90,80,66,.3)';ctx.lineWidth=.8;ofLine(m,[[-10,10],[-9,30],[-12,44]],-dz);
    // the bronze: a tall leaning form pierced by a ring, polished along one side
    {const a=m(-2,62,0),tip=m(7,112,0),w=m(-8,86,0),w2=m(12,84,0);const g=ctx.createLinearGradient(w.x,0,w2.x,0);g.addColorStop(0,'#5a3a18');g.addColorStop(.4,'#d4a258');g.addColorStop(.6,'#a8763a');g.addColorStop(1,'#3a2410');ctx.fillStyle=g;
      ctx.beginPath();ctx.moveTo(a.x-3,a.y);ctx.quadraticCurveTo(w.x-3,w.y,tip.x,tip.y);ctx.quadraticCurveTo(w2.x+5,w2.y+4,a.x+4,a.y);ctx.closePath();ctx.fill();
      ctx.strokeStyle='rgba(255,236,180,.6)';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(a.x-1,a.y-3);ctx.quadraticCurveTo(w.x-1,w.y,tip.x-.6,tip.y+3);ctx.stroke();
      const rc=m(1,82,0);ctx.strokeStyle='#8a5a28';ctx.lineWidth=2.2;ctx.beginPath();ctx.ellipse(rc.x+9,rc.y,3.4,10,.2,0,TAU);ctx.stroke();ctx.strokeStyle='rgba(255,226,160,.5)';ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(rc.x+9,rc.y,3.4,10,.2,3.7,5.6);ctx.stroke();}},
  globe(Pp){const m=ofFrame(Pp,2,3),dz=6;ctx.lineCap='round';
    // three turned legs, a brass stem, the sphere in its meridian ring
    ctx.strokeStyle='#2a170f';ctx.lineWidth=3;ofLine(m,[[0,24],[10,0]],dz);ctx.strokeStyle='#5a3822';ctx.lineWidth=3.4;ofLine(m,[[0,24],[-15,0]],-dz);ofLine(m,[[0,24],[15,0]],-dz);
    ctx.strokeStyle='rgba(255,214,160,.3)';ctx.lineWidth=.9;ofLine(m,[[-.8,23],[-14,2]],-dz);
    ctx.strokeStyle='#c9a25a';ctx.lineWidth=2.6;ofLine(m,[[0,24],[0,48]],0);
    {const c0=m(0,60,0),R=11.4;ctx.save();ctx.beginPath();ctx.arc(c0.x,c0.y,R,0,TAU);ctx.clip();
      const g=ctx.createRadialGradient(c0.x-3.6,c0.y-4.2,1,c0.x,c0.y,R);g.addColorStop(0,'#5a8a96');g.addColorStop(.6,'#2f5a6a');g.addColorStop(1,'#16303c');ctx.fillStyle=g;ctx.fillRect(c0.x-R,c0.y-R,2*R,2*R);
      ctx.fillStyle='#b39452';for(const [dx,dy,w,h,a] of [[-4,-3,5.4,7,.4],[3,3,4,6,-.5],[5,-5,3.4,3,.2],[-7,5,3,3.4,0]]){ctx.beginPath();ctx.ellipse(c0.x+dx,c0.y+dy,w,h,a,0,TAU);ctx.fill();}
      ctx.fillStyle='rgba(255,255,255,.4)';ctx.beginPath();ctx.ellipse(c0.x-4.6,c0.y-4.8,3.2,1.8,-.7,0,TAU);ctx.fill();ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.arc(c0.x+4,c0.y+4,R,0,TAU);ctx.arc(c0.x,c0.y,R,0,TAU,true);ctx.fill();ctx.restore();
      ctx.strokeStyle='#c9a25a';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(c0.x,c0.y,R+2.4,R+2.4,.4,Math.PI*1.1,Math.PI*2.9);ctx.stroke();ctx.strokeStyle='rgba(236,208,138,.6)';ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(c0.x,c0.y,R+2.4,R+2.4,.4,Math.PI*1.2,Math.PI*1.7);ctx.stroke();}},
  armchair(Pp){const m=ofFrame(Pp,2,3),dz=12,s=Pp.s<0?-1:1,X=(u)=>u*s;ctx.lineJoin='round';ctx.lineCap='round';
    // a club chair in cognac leather: far side, the tops between, the near side with its rolled arm and brass nails, short legs
    const side=(dd,c1,c2)=>{ctx.fillStyle=c1;ofPoly(m,[[X(-27),9],[X(-27),50],[X(-24),56],[X(14),56],[X(18),70],[X(26),72],[X(28),48],[X(28),9]],dd);};
    ctx.fillStyle='#2a1810';for(const u of [-23,23]){ofPoly(m,[[u-3,0],[u+3,0],[u+2,10],[u-2,10]],dz);}
    side(dz,'#4a2214');
    ctx.fillStyle='#8a4a30';{ctx.beginPath();const a=m(X(-26),55,-dz),b=m(X(14),55,-dz),c2=m(X(14),55,dz),d2=m(X(-26),55,dz);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c2.x,c2.y);ctx.lineTo(d2.x,d2.y);ctx.closePath();ctx.fill();}
    ctx.fillStyle='#6a3220';{ctx.beginPath();const a=m(X(18),70,-dz),b=m(X(26),72,-dz),c2=m(X(26),72,dz),d2=m(X(18),70,dz);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c2.x,c2.y);ctx.lineTo(d2.x,d2.y);ctx.closePath();ctx.fill();}
    ctx.fillStyle='#3a1a10';{ctx.beginPath();const a=m(X(28),48,-dz),b=m(X(28),9,-dz),c2=m(X(28),9,dz),d2=m(X(28),48,dz);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c2.x,c2.y);ctx.lineTo(d2.x,d2.y);ctx.closePath();ctx.fill();}
    {const a=m(X(-27),9,-dz),b=m(X(28),9,-dz),g=ctx.createLinearGradient(0,m(0,56,-dz).y,0,m(0,9,-dz).y);g.addColorStop(0,'#9a5436');g.addColorStop(.5,'#74391f');g.addColorStop(1,'#4a2212');ctx.fillStyle=g;}
    ofPoly(m,[[X(-27),9],[X(-27),50],[X(-24),56],[X(14),56],[X(18),70],[X(26),72],[X(28),48],[X(28),9]],-dz);
    // the seat's edge, the arm roll, the buttoned back, brass nails along the foot
    ctx.fillStyle='rgba(0,0,0,.28)';ofPoly(m,[[X(-24),30],[X(16),30],[X(16),33],[X(-24),33]],-dz);
    ctx.strokeStyle='rgba(255,196,150,.5)';ctx.lineWidth=1.6;ofLine(m,[[X(-24),55],[X(12),55]],-dz);ctx.strokeStyle='rgba(30,10,4,.55)';ctx.lineWidth=1;ofLine(m,[[X(-26),48],[X(16),48]],-dz);
    ctx.strokeStyle='rgba(30,10,4,.4)';ctx.lineWidth=.9;ofLine(m,[[X(17),40],[X(20),68]],-dz);ofLine(m,[[X(23),38],[X(26),68]],-dz);
    ctx.fillStyle='#d8b05a';for(let u=-24;u<=26;u+=5){const q=m(X(u),12,-dz);ctx.fillRect(q.x-.7,q.y-.7,1.4,1.4);}
    for(const u of [-23,23]){ctx.fillStyle='#22130b';ofPoly(m,[[u-3.2,0],[u+3.2,0],[u+2,10],[u-2,10]],-dz);ctx.fillStyle='#c9a25a';ofPoly(m,[[u-3.2,0],[u+3.2,0],[u+3,2.2],[u-3,2.2]],-dz);}},
  floorlamp(Pp){const m=ofFrame(Pp,2,3),G=glowSprites();ctx.lineCap='round';
    ctx.fillStyle='#8a6a2e';{const q=m(0,1.6,0);ctx.beginPath();ctx.ellipse(q.x,q.y,13,3.6,0,0,TAU);ctx.fill();ctx.fillStyle='#c9a25a';ctx.beginPath();ctx.ellipse(q.x,q.y-1.6,11.4,3,0,0,TAU);ctx.fill();}
    ctx.strokeStyle='#a8863a';ctx.lineWidth=2.6;ofLine(m,[[0,3],[0,130]],0);ctx.strokeStyle='rgba(255,236,176,.5)';ctx.lineWidth=.8;ofLine(m,[[-.8,6],[-.8,126]],0);
    {const t=m(0,138,0);ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.55;ctx.drawImage(G.dot,t.x-44,t.y-44,88,88);ctx.globalAlpha=.16;ctx.drawImage(G.cone,t.x-40,t.y+8,80,100);ctx.restore();
      ctx.fillStyle='#f3e2bc';ctx.beginPath();ctx.moveTo(t.x-9,t.y-12);ctx.lineTo(t.x+9,t.y-12);ctx.lineTo(t.x+15,t.y+11);ctx.lineTo(t.x-15,t.y+11);ctx.closePath();ctx.fill();
      ctx.fillStyle='rgba(255,226,160,.7)';ctx.fillRect(t.x-14,t.y+6,28,5);ctx.fillStyle='#c9a25a';ctx.fillRect(t.x-9.5,t.y-13.4,19,1.6);ctx.fillRect(t.x-15.4,t.y+10.4,30.8,1.6);
      ctx.strokeStyle='rgba(150,110,60,.28)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(t.x-3,t.y-12);ctx.lineTo(t.x-5,t.y+11);ctx.moveTo(t.x+4,t.y-12);ctx.lineTo(t.x+6,t.y+11);ctx.stroke();}},
  ficus(Pp){const m=ofFrame(Pp,2,3),dz=7,t=S.t;ctx.lineCap='round';ctx.lineJoin='round';
    // a tall glazed pot, a bare trunk, a crown of big dark leaves that stirs a little
    ctx.fillStyle='#10262a';ofPoly(m,[[-13,36],[13,36],[11,2],[-11,2]],dz);
    {const a=m(-14,0,-dz),b=m(14,0,-dz),g=ctx.createLinearGradient(a.x,0,b.x,0);g.addColorStop(0,'#2a5a5e');g.addColorStop(.35,'#3a7a7a');g.addColorStop(1,'#12302f');ctx.fillStyle=g;}
    ofPoly(m,[[-14,38],[14,38],[12,2],[-12,2]],-dz);ctx.fillStyle='#c9a25a';ofPoly(m,[[-14.6,38],[14.6,38],[14.4,35],[-14.4,35]],-dz);ctx.fillStyle='rgba(255,255,255,.2)';ofPoly(m,[[-10,32],[-7,32],[-6,8],[-9,8]],-dz);
    ctx.fillStyle='#1a1008';{ctx.beginPath();const a=m(-13,38,-dz),b=m(13,38,-dz),c2=m(13,38,dz),d2=m(-13,38,dz);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c2.x,c2.y);ctx.lineTo(d2.x,d2.y);ctx.closePath();ctx.fill();}
    ctx.strokeStyle='#4a3424';ctx.lineWidth=3.4;{const a=m(0,38,0),b=m(-2,70,0),c2=m(3,104,0);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo(b.x,b.y,c2.x,c2.y);ctx.stroke();}
    ctx.lineWidth=1.8;ofLine(m,[[-1,70],[-12,92]],0);ofLine(m,[[0,82],[13,98]],0);
    const R=mulberry32(((Pp.dep*131)|0)+7),cols=['#1f4a2c','#2a6038','#173a24','#347244'];
    for(let k=0;k<34;k++){const a=R()*TAU,rr=Math.sqrt(R()),cu=3+Math.cos(a)*rr*27+(R()-.5)*4,cv=100+Math.sin(a)*rr*24*.9+6,back=k<12,q=m(cu+Math.sin(t*1.2+k)*.9,cv,back?dz+3:-dz+(k%3)),ang=a+Math.PI/2+(R()-.5)*1.2+Math.sin(t*1.1+k*1.7)*.05;
      ctx.fillStyle=back?'#12301c':cols[k%4];ctx.beginPath();ctx.ellipse(q.x,q.y,10.5,4.8,ang,0,TAU);ctx.fill();
      if(!back){ctx.strokeStyle='rgba(190,230,170,.25)';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(q.x-Math.cos(ang)*8,q.y-Math.sin(ang)*8);ctx.lineTo(q.x+Math.cos(ang)*8,q.y+Math.sin(ang)*8);ctx.stroke();}}}});
// ---------- whisky and decanters, and the modern lamps ----------
{const dw0=drawWare;drawWare=function(it){
  if(it.kind==='whisky'){const q=P(it.x,it.y,it.dep);ctx.save();ctx.translate(q.x,q.y);ctx.rotate(it.ang);
    ctx.fillStyle='rgba(215,235,240,.4)';ctx.beginPath();ctx.moveTo(-4.2,-2.6);ctx.lineTo(4.2,-2.6);ctx.lineTo(3.4,6.6);ctx.lineTo(-3.4,6.6);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(196,118,36,.95)';ctx.beginPath();ctx.moveTo(-3.9,.4);ctx.lineTo(3.9,.4);ctx.lineTo(3.2,6.2);ctx.lineTo(-3.2,6.2);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,236,190,.9)';ctx.fillRect(-1.2,2.2,2.6,2.6);ctx.fillStyle='rgba(255,255,255,.55)';ctx.fillRect(-3.4,-2,.9,7);ctx.fillRect(-4.2,-2.8,8.4,.8);ctx.restore();return;}
  if(it.kind==='carafe'){const q=P(it.x,it.y,it.dep);ctx.save();ctx.translate(q.x,q.y);ctx.rotate(it.ang);
    ctx.fillStyle='rgba(206,222,230,.4)';ctx.beginPath();ctx.moveTo(-1.8,-9);ctx.lineTo(1.8,-9);ctx.lineTo(1.8,-5);ctx.quadraticCurveTo(6.4,-2,5.6,3);ctx.lineTo(5.2,8);ctx.lineTo(-5.2,8);ctx.lineTo(-5.6,3);ctx.quadraticCurveTo(-6.4,-2,-1.8,-5);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(186,104,30,.95)';ctx.beginPath();ctx.moveTo(-4.6,-1.5);ctx.quadraticCurveTo(0,-3,4.6,-1.5);ctx.lineTo(5.6,3);ctx.lineTo(5.2,7.6);ctx.lineTo(-5.2,7.6);ctx.lineTo(-5.6,3);ctx.closePath();ctx.fill();
    ctx.fillStyle='#e8dcc0';ctx.beginPath();ctx.ellipse(0,-11,2.4,2.6,0,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,255,255,.55)';ctx.fillRect(-4.2,0,1,6);ctx.fillRect(-1.5,-8.4,.8,3);ctx.restore();return;}
  dw0(it);};}
{const dl0=drawLamp;drawLamp=function(L){
  if(L.kind!=='linear'&&L.kind!=='orb'){dl0(L);return;}
  const p=L.p,a=P(L.x,L.ay,L.dep),q=P(p.x,p.y,L.dep),k=lampGlow(L),G=glowSprites(),th=L.fallen?(L.landed?1.2:S.t*6):-Math.atan2(p.x-L.x,p.y-L.ay);
  ctx.save();ctx.translate(q.x,q.y);ctx.rotate(th);
  if(!L.fallen){const c=Math.cos(-th),s=Math.sin(-th),lx=(a.x-q.x)*c-(a.y-q.y)*s,ly=(a.x-q.x)*s+(a.y-q.y)*c;ctx.strokeStyle='#120812';ctx.lineWidth=1.1;ctx.beginPath();
    if(L.kind==='linear'){for(const e of [-52,52]){ctx.moveTo(e,-3);ctx.lineTo(e+lx,ly);}}else{ctx.moveTo(0,-6);ctx.lineTo(lx,ly);}ctx.stroke();}
  if(k>0){ctx.save();ctx.globalCompositeOperation='lighter';
    if(L.kind==='linear'){ctx.globalAlpha=.2*k;ctx.drawImage(G.cone,-76,3,152,126);ctx.globalAlpha=.7*k;ctx.drawImage(G.dot,-80,-14,160,44);}
    else{ctx.globalAlpha=.16*k;ctx.drawImage(G.cone,-44,6,88,116);ctx.globalAlpha=.8*k;ctx.drawImage(G.dot,-34,-26,68,68);}ctx.restore();}
  if(L.kind==='linear'){
    ctx.fillStyle='#2a2118';ctx.fillRect(-62,-3,124,5);ctx.fillStyle='rgba(255,226,170,.28)';ctx.fillRect(-62,-3,124,1);
    ctx.fillStyle=L.lit?'#fff3d4':'#3a2e26';ctx.fillRect(-58,1.4,116,1.8);
    ctx.fillStyle='#c9a25a';ctx.fillRect(-63,-3.6,3,6.6);ctx.fillRect(60,-3.6,3,6.6);ctx.fillRect(-56.5,-5,1.6,2);ctx.fillRect(54.9,-5,1.6,2);}
  else{
    ctx.fillStyle='#c9a25a';ctx.fillRect(-2,-9,4,4);
    const g=ctx.createRadialGradient(-3,-3,1,0,2,11);g.addColorStop(0,L.lit?'#fffbe8':'#5a4a40');g.addColorStop(.7,L.lit?'#ffe8b4':'#3a2c26');g.addColorStop(1,L.lit?'#e8b870':'#2a1e1a');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,3,10,0,TAU);ctx.fill();}
  ctx.restore();};}
V11UI.init.push(()=>{const items0=envItems,draw0=drawEnvItem;
  envItems=items=>{items0(items);for(let i=items.length-1;i>=0;i--){const Pp=items[i].prop;if(Pp&&Pp.type==='desk')items.splice(i,1,{d:Pp.dep+Pp.dz,desk:Pp,back:true},{d:Pp.dep-Pp.dz,desk:Pp,back:false});}};
  drawEnvItem=it=>{if(it.desk){drawDesk(it.desk,it.back);return true;}return draw0(it);};});
// ===== OFFICE UI END =====
