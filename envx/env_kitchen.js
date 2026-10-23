// ===== ENV KITCHEN =====
// Orrin's kitchen behind the Lantern Bistro. Cream tiles gone amber and grey with smoke, sooted plaster above them; a black iron range
// under a riveted copper hood, the flames under the copper pots lighting the room from below; copper pans on a rail, crockery and
// jars on open shelves, the night's tickets on the pass; the red of the dining room through the door on the left, the cold of the
// alley through the barred window of the back door, and in the tiles beside it a seam and a small brass H for a sharp eye.
(()=>{const E=EnvLook,{C,pp,poly,line,rect,lin,rad,rgba,mix,glow,beam,haze,vine,scroll,gilt,windowPane,rng,lerp,clamp,TAU}=E;
const FAR=236,yB=()=>GB-FAR*PSY,OX=()=>FAR*PSX,TY0=()=>yB()-150;
const COP='#c9874a',COPL='#f0b27a',COPD='#7a4524',IRON='#121316',IRON2='#1d1f24';
function floorT(c){c.transform(1,0,PSX,-PSY,0,GB);}
const TX=()=>EnvTex;
// a texture laid from (x, y), u units to a texture pixel, turned rot degrees
function patAt(c,cv,x,y,u,rot){const p=c.createPattern(cv,'repeat');if(p.setTransform){let m=new DOMMatrix().translate(x,y);if(rot)m=m.rotate(rot);p.setTransform(m.scale(u));}return p;}
const OAK={dark:'#140a05',mid:'#2e1a0c',light:'#4a2c16',rings:7},PINE={dark:'#1e1208',mid:'#4a3018',light:'#6e4a28',rings:5};
let BURLAP=null;
function tile(w,h,sc,fn){const cv=document.createElement('canvas');cv.width=w*sc;cv.height=h*sc;const c=cv.getContext('2d');c.scale(sc,sc);fn(c,w,h);return cv;}
function pattern(c,cv,sc){const p=c.createPattern(cv,'repeat');if(p.setTransform)p.setTransform(new DOMMatrix().scale(1/sc));return p;}
let SUBWAY=null,QUARRY=null;
// subway tiles: cream gone amber, each a little different, a glaze line on top
function subway(){return SUBWAY||(SUBWAY=tile(48,24,6,(c,w,h)=>{c.fillStyle='#1a1610';c.fillRect(0,0,w,h);const r=rng(13);
  for(let row=0;row<2;row++)for(let k=-1;k<3;k++){const x=k*24+(row%2)*12,y=row*12,v=r();c.fillStyle=mix('#5a5040','#6e6250',v);c.fillRect(x+.6,y+.6,22.8,10.8);
    c.fillStyle=rgba('#fff4dc',.13+.08*r());c.fillRect(x+1.2,y+1,21.6,1.3);c.fillStyle=rgba('#000000',.18);c.fillRect(x+.6,y+9.8,22.8,1.6);}}));}
// quarry tiles: dark terracotta squares in grey grout, some worn paler
function quarry(){return QUARRY||(QUARRY=tile(40,40,6,(c,w,h)=>{c.fillStyle='#120d0a';c.fillRect(0,0,w,h);const r=rng(21);
  for(let i=0;i<2;i++)for(let j=0;j<2;j++){const v=r();c.fillStyle=mix('#3a2218','#4e2e1e',v);c.fillRect(i*20+.8,j*20+.8,18.4,18.4);c.fillStyle=rgba('#ffcf9a',.05+.05*r());c.fillRect(i*20+.8,j*20+.8,18.4,1);
    if(r()<.5){c.fillStyle=rgba('#000000',.15);c.beginPath();c.ellipse(i*20+4+r()*12,j*20+4+r()*12,3+r()*4,2+r()*3,r()*3,0,TAU);c.fill();}}}));}
function paint(c){
  const X0=-160,X1=W+240,T0=-110,yb=yB(),ox=OX(),ty0=TY0(),r=rng(4);
  // sooted plaster above the tiles, darkest over the range
  c.fillStyle=patAt(c,TX().plaster(41,256,256,{base:'#4a3c2e'}),X0,T0,.4);c.fillRect(X0,T0,X1-X0,ty0-T0);
  c.fillStyle=lin(c,0,T0,0,ty0,[[0,rgba('#050407',.9)],[.5,rgba('#0a0806',.74)],[1,rgba('#0e0a08',.58)]]);c.fillRect(X0,T0,X1-X0,ty0-T0);
  c.save();c.globalAlpha=.35;for(let i=0;i<40;i++){const x=X0+r()*(X1-X0),w=8+r()*40;c.fillStyle=lin(c,0,T0,0,ty0,[[0,rgba('#000000',0)],[1,rgba('#000000',.25+r()*.25)]]);c.fillRect(x,T0+r()*60,w,ty0-T0);}c.restore();
  // the tiles from the rail down, smoke-browned toward the range
  c.fillStyle=patAt(c,TX().subwayTiles(13,{}),X0,ty0+1,1/6);c.fillRect(X0,ty0,X1-X0,yb-ty0);
  c.fillStyle=lin(c,0,ty0,0,yb,[[0,rgba('#0a0806',.66)],[1,rgba('#0a0806',.74)]]);c.fillRect(X0,ty0,X1-X0,yb-ty0);
  {const mx=(RANGE.x0+RANGE.x1)/2+ox;c.save();c.globalCompositeOperation='lighter';c.fillStyle=rad(c,mx,yb-70,10,240,[[0,rgba('#ff9a50',.12)],[1,rgba('#ff9a50',0)]]);c.fillRect(mx-240,ty0,480,yb-ty0);c.restore();}
  {const mx=(RANGE.x0+RANGE.x1)/2+ox;c.fillStyle=rad(c,mx,ty0-20,10,260,[[0,rgba('#000000',.5)],[1,rgba('#000000',0)]]);c.fillRect(mx-260,T0,520,yb-T0);}
  // the tile rail: a band of dark green tiles and a lit edge
  c.fillStyle=patAt(c,TX().subwayTiles(17,{tw:8,th:8,rows:2,cols:8,c0:'#3a6a52',c1:'#2a5040',grout:'#14201a',craze:0}),X0,ty0-7,1/6);c.fillRect(X0,ty0-7,X1-X0,8);c.fillStyle=rgba('#05080a',.6);c.fillRect(X0,ty0-7,X1-X0,8);c.fillStyle=rgba('#cfe8d8',.18);c.fillRect(X0,ty0-7,X1-X0,.9);c.fillStyle=rgba('#000000',.4);c.fillRect(X0,ty0,X1-X0,1);
  // ceiling beams with a pipe along them
  c.fillStyle='#08070a';c.fillRect(X0,T0,X1-X0,10-T0);for(let x=-40;x<X1;x+=130){c.fillStyle=patAt(c,TX().wood(61,256,128,OAK),x,T0,.25,90);c.fillRect(x,T0,18,104);c.fillStyle=lin(c,x,0,x+18,0,[[0,rgba('#000000',.8)],[1,rgba('#000000',.55)]]);c.fillRect(x,T0,18,104);c.fillStyle=rgba(C.rim,.12);c.fillRect(x+17,T0,1,104);}
  c.fillStyle='#2a2420';c.fillRect(X0,6,X1-X0,5);c.fillStyle=rgba(C.rim,.25);c.fillRect(X0,6,X1-X0,1);
  // the door back to the dining room: the bistro's red and a lantern seen through it
  {const x0=KITCHEN_DOOR.x-30+ox,x1=x0+60,top=yb-132;c.fillStyle='#0c0807';c.fillRect(x0-7,top-7,x1-x0+14,yb-top+7);
    c.fillStyle=lin(c,0,top,0,yb,[[0,'#1a0609'],[.5,'#3a0c14'],[1,'#5a1a1a']]);c.fillRect(x0,top,x1-x0,yb-top);
    c.save();c.beginPath();c.rect(x0,top,x1-x0,yb-top);c.clip();c.fillStyle=rgba('#4a1018',.8);for(let x=x0;x<x1;x+=7)c.fillRect(x,top,3,yb-top-40);
    c.fillStyle='#160b09';c.fillRect(x0,yb-40,x1-x0,40);c.fillStyle=rgba(C.gold,.5);c.fillRect(x0,yb-41,x1-x0,1);glow(c,x0+34,top+44,30,'#ffc070',.7);c.fillStyle=C.goldL;c.fillRect(x0+31,top+38,6,9);c.restore();
    c.fillStyle='#24130c';c.beginPath();c.moveTo(x1-4,top);c.lineTo(x1+8,top-5);c.lineTo(x1+8,yb+5);c.lineTo(x1-4,yb);c.closePath();c.fill();c.fillStyle=C.goldD;c.fillRect(x1+2,top+60,3,8);
    glow(c,x0+30,yb-20,70,'#ff7a50',.25,.6);c.fillStyle=rgba(C.rim,.35);c.fillRect(x0-7,top-7,x1-x0+14,.8);}
  // open shelves on the left wall: jars, stacked plates, copper
  {const x0=165+ox,x1=330+ox,r2=rng(31);
    for(const y of [ty0-74,ty0-36]){c.fillStyle=patAt(c,TX().wood(62,256,128,OAK),x0,y,.2);c.fillRect(x0,y,x1-x0,4);c.fillStyle=rgba('#000000',.3);c.fillRect(x0,y,x1-x0,4);c.fillStyle=rgba('#000000',.5);c.fillRect(x0,y+4,x1-x0,1.4);c.fillStyle=rgba(C.rim,.3);c.fillRect(x0,y,x1-x0,.8);
      for(const bx of [x0+8,x1-11]){c.fillStyle='#120b07';c.beginPath();c.moveTo(bx,y+4);c.lineTo(bx+3,y+4);c.lineTo(bx+3,y+12);c.closePath();c.fill();}
      for(let x=x0+6;x<x1-10;){const k=r2();
        if(k<.4){const h=9+r2()*7,w=7+r2()*3;c.fillStyle=rgba('#c8d8d0',.18);c.fillRect(x,y-h,w,h);c.fillStyle=['#a86a2a','#5a7a3a','#8a2a2a','#c8a050'][Math.floor(r2()*4)];c.fillRect(x+1,y-h*.65,w-2,h*.65-1);
          c.fillStyle='#2a1a10';c.fillRect(x-.5,y-h-2.5,w+1,2.5);c.fillStyle=rgba('#ffffff',.25);c.fillRect(x+1,y-h+1,1,h-2);x+=w+4;}
        else if(k<.75){for(let i=0;i<4+Math.floor(r2()*4);i++){c.fillStyle=i%2?'#d8ccb4':'#c8bca4';c.beginPath();c.ellipse(x+7,y-2-i*2.2,7,1.8,0,0,TAU);c.fill();}c.fillStyle=C.goldD;c.fillRect(x,y-2.6,14,.6);x+=18;}
        else{c.fillStyle=lin(c,x,0,x+13,0,[[0,COPD],[.4,COPL],[1,COPD]]);c.fillRect(x,y-9,13,9);c.fillStyle=COPD;c.fillRect(x,y-9,13,2);x+=17;}}}}
  // a rail of copper pans over the shelves, each catching the fire's light low on its curve
  {const x0=200+ox,x1=330+ox,y=12,r2=rng(9);c.strokeStyle='#0a0a0c';c.lineWidth=1.2;c.beginPath();c.moveTo(x0+10,T0);c.lineTo(x0+10,y);c.moveTo(x1-10,T0);c.lineTo(x1-10,y);c.stroke();
    c.fillStyle='#1a1a1e';c.fillRect(x0,y,x1-x0,4);c.fillStyle=rgba(C.rim,.3);c.fillRect(x0,y,x1-x0,.8);
    for(let x=x0+10;x<x1-6;x+=22){const L2=18+r2()*16,R2=6+r2()*5;c.strokeStyle='#0c0c0e';c.lineWidth=1.4;c.beginPath();c.moveTo(x,y+4);c.lineTo(x,y+4+L2);c.stroke();
      const cu=r2()<.65;c.fillStyle=cu?rad(c,x-R2*.3,y+6+L2+R2*.6,1,R2*1.3,[[0,COPL],[.5,COP],[1,COPD]]):'#26282c';c.beginPath();c.arc(x,y+6+L2+R2,R2,0,TAU);c.fill();
      c.fillStyle=rgba('#000000',.3);c.beginPath();c.arc(x+1.5,y+7+L2+R2,R2*.6,0,TAU);c.fill();}}
  // a string of garlic and bunches of herbs drying by the shelves, a chalkboard of the night's orders
  {const x0=34,top=ty0-98;c.fillStyle='#2a1a10';c.fillRect(x0-3,top-3,58,44);c.fillStyle='#141a18';c.fillRect(x0,top,52,38);
    c.strokeStyle=rgba('#e8e4d8',.55);c.lineWidth=.8;c.beginPath();for(let i=0;i<4;i++){c.moveTo(x0+5,top+8+i*8);c.lineTo(x0+14+((i*17)%30),top+8+i*8);}c.stroke();
    gilt(c,'ce soir',x0+26,top-6,7,{style:'italic 700'});
    c.strokeStyle='#5a4a2a';c.lineWidth=1;c.beginPath();c.moveTo(x0+62,top-14);c.lineTo(x0+62,top+46);c.stroke();for(let y=top-8;y<top+46;y+=7){c.fillStyle=y%2?'#d8cca8':'#c8b890';c.beginPath();c.ellipse(x0+62+(y%2?3:-3),y,3.6,3.2,0,0,TAU);c.fill();}
    for(const hx of [x0+80,x0+92]){c.strokeStyle='#3a2a1a';c.lineWidth=.8;c.beginPath();c.moveTo(hx,top-14);c.lineTo(hx,top+6);c.stroke();c.fillStyle='#2a3a22';c.beginPath();c.moveTo(hx-5,top+6);c.lineTo(hx+5,top+6);c.lineTo(hx,top+26);c.fill();}}
  // the range: a riveted copper hood on its flue, black iron ovens with brass rails, copper pots on the burners, the pass above
  {const sx0=RANGE.x0+ox,sx1=RANGE.x1+ox,top=yb-74,mid=(sx0+sx1)/2;
    c.fillStyle=rgba('#000000',.4);c.fillRect(sx0-12,ty0-28,sx1-sx0+24,top-ty0+28);
    c.fillStyle=patAt(c,TX().copper(5,256,256,{}),mid-28,T0,.25);c.fillRect(mid-28,T0,56,ty0-96-T0);
    c.fillStyle=lin(c,mid-28,0,mid+28,0,[[0,rgba('#140802',.82)],[.3,rgba('#140802',.42)],[.55,rgba('#140802',.28)],[1,rgba('#140802',.85)]]);c.fillRect(mid-28,T0,56,ty0-96-T0);
    c.fillStyle=lin(c,0,T0,0,ty0-96,[[0,rgba('#000000',.6)],[1,rgba('#000000',.1)]]);c.fillRect(mid-28,T0,56,ty0-96-T0);
    for(let y=T0+20;y<ty0-96;y+=26){c.fillStyle=rgba('#000000',.4);c.fillRect(mid-28,y,56,1.4);c.fillStyle=rgba(COPL,.35);c.fillRect(mid-28,y+1.4,56,.6);}
    c.fillStyle=patAt(c,TX().copper(6,256,256,{}),sx0,ty0-96,.25);c.beginPath();c.moveTo(sx0-12,ty0-36);c.lineTo(sx1+12,ty0-36);c.lineTo(sx1-34,ty0-96);c.lineTo(sx0+34,ty0-96);c.closePath();c.fill();
    c.fillStyle=lin(c,sx0,0,sx1,0,[[0,rgba('#140802',.72)],[.35,rgba('#140802',.3)],[.6,rgba('#140802',.12)],[1,rgba('#140802',.72)]]);c.fill();
    // the broad sheen of polished copper: two soft bands where the lamps and the fire find it
    c.save();c.clip();c.globalCompositeOperation='lighter';for(const [u,a] of [[.42,.16],[.66,.08]]){const bx=lerp(sx0,sx1,u);c.fillStyle=lin(c,bx-30,0,bx+30,0,[[0,rgba('#ffd2a0',0)],[.5,rgba('#ffd2a0',a)],[1,rgba('#ffd2a0',0)]]);c.fillRect(bx-40,ty0-100,80,70);}c.restore();
    c.fillStyle=lin(c,0,ty0-96,0,ty0-36,[[0,rgba('#000000',.35)],[.7,rgba('#000000',0)],[1,rgba('#ff9a50',.25)]]);c.beginPath();c.moveTo(sx0-12,ty0-36);c.lineTo(sx1+12,ty0-36);c.lineTo(sx1-34,ty0-96);c.lineTo(sx0+34,ty0-96);c.closePath();c.fill();
    c.strokeStyle=rgba('#2a1206',.6);c.lineWidth=.9;c.beginPath();for(let x=sx0+20;x<sx1;x+=26){c.moveTo(x,ty0-37);c.lineTo(lerp(x,mid,.28),ty0-95);}c.stroke();
    c.fillStyle=rgba('#2a1206',.8);for(let x=sx0-6;x<sx1+8;x+=9){c.beginPath();c.arc(x,ty0-40,.9,0,TAU);c.fill();}
    c.fillStyle='#3a1e0c';c.fillRect(sx0-16,ty0-40,sx1-sx0+32,6);c.fillStyle=lin(c,0,ty0-34,0,ty0-30,[[0,rgba('#ffb070',.9)],[1,rgba('#ff8a40',.2)]]);c.fillRect(sx0-16,ty0-35,sx1-sx0+32,2.4);
    gilt(c,'O',mid,ty0-58,14,{style:'700',col:'#f0b27a',hi:'#fff0d0',lo:'#7a4524'});
    // the iron range itself
    c.fillStyle=patAt(c,TX().castIron(3,128,128),sx0,top,.25);c.fillRect(sx0,top,sx1-sx0,yb-top);c.fillStyle=rgba('#000000',.25);c.fillRect(sx0,top,sx1-sx0,yb-top);c.fillStyle='#24262c';c.fillRect(sx0,top,sx1-sx0,5);c.fillStyle=rgba('#ffffff',.08);c.fillRect(sx0,top+5,sx1-sx0,1);
    const n=3,ow=(sx1-sx0-36)/n;for(let i=0;i<n;i++){const x=sx0+18+i*ow;c.fillStyle=patAt(c,TX().castIron(4,128,128,{base:'#2a2c33'}),x+5,top+19,.25);c.fillRect(x+5,top+19,ow-10,yb-top-27);c.fillStyle=lin(c,0,top+19,0,yb-8,[[0,rgba('#ffffff',.05)],[1,rgba('#000000',.3)]]);c.fillRect(x+5,top+19,ow-10,yb-top-27);c.strokeStyle=rgba(C.gold,.35);c.lineWidth=.6;c.strokeRect(x+7,top+21,ow-14,yb-top-31);
      c.fillStyle='#1a0a04';c.fillRect(x+ow/2-17,top+30,34,15);c.fillStyle=lin(c,0,top+14,0,top+17,[[0,C.goldL],[1,C.goldD]]);c.fillRect(x+12,top+14,ow-24,3);}
    for(let i=0;i<8;i++){c.fillStyle=C.gold;c.beginPath();c.arc(sx0+16+i*(sx1-sx0-32)/7,top+9,2.2,0,TAU);c.fill();c.fillStyle=C.goldL;c.fillRect(sx0+15.4+i*(sx1-sx0-32)/7,top+7.6,1.2,1.2);}
    c.fillStyle=lin(c,0,top-3,0,top+1,[[0,C.goldL],[1,C.goldD]]);c.fillRect(sx0-4,top-3,sx1-sx0+8,3);
    for(const [u,w,h] of RANGE_POTS){const x=lerp(sx0,sx1,u),cu=u!==.6;c.fillStyle=cu?lin(c,x-w/2,0,x+w/2,0,[[0,COPD],[.35,COPL],[.6,COP],[1,COPD]]):lin(c,x-w/2,0,x+w/2,0,[[0,'#1a1c20'],[.4,'#4a4e54'],[1,'#16181c']]);c.fillRect(x-w/2,top-h,w,h);
      c.fillStyle=cu?COPD:'#14161a';c.fillRect(x-w/2,top-h,w,3);c.fillRect(x-w/2-5,top-h+5,5,2);c.fillRect(x+w/2,top-h+5,5,2);
      c.fillStyle=lin(c,0,top-8,0,top,[[0,rgba('#ff9a50',0)],[1,rgba('#ff9a50',.5)]]);c.fillRect(x-w/2,top-8,w,8);
      if(h>20){c.fillStyle='#14161a';c.fillRect(x-w/2-1,top-h-3,w+2,3);c.fillRect(x-3,top-h-7,6,4);}}
    // the pass: a brass rail of tickets and a bell
    const py=ty0-14;c.fillStyle=lin(c,0,py,0,py+3,[[0,C.goldL],[1,C.goldD]]);c.fillRect(sx0+10,py,sx1-sx0-20,3);
    for(let i=0;i<9;i++){const tx=sx0+18+i*(sx1-sx0-36)/8+(r()-.5)*6;c.fillStyle=mix('#e8dcc0','#d0c0a0',r());c.fillRect(tx-4,py+3,8,12+r()*5);c.fillStyle=rgba('#3a2a1a',.6);for(let k=0;k<3;k++)c.fillRect(tx-3,py+6+k*3,5-(k%2)*2,.7);}
    c.fillStyle=C.gold;c.beginPath();c.arc(sx1-14,py-4,4,Math.PI,0);c.fill();c.fillRect(sx1-18,py-4,8,1.5);c.fillRect(sx1-14.6,py-10,1.2,3);}
  // the back door to the alley: planks, iron straps, a barred window on the cold night, rain on it, a lantern beside it
  {const x0=694+ox,x1=x0+62,top=yb-138;c.fillStyle='#0a0705';c.fillRect(x0-6,top-6,x1-x0+12,yb-top+6);
    c.fillStyle=patAt(c,TX().wood(63,256,128,{dark:'#140a05',mid:'#2e1c0e',light:'#4a3018',rings:6}),x0,top,.25,90);c.fillRect(x0,top,x1-x0,yb-top);c.fillStyle=lin(c,x0,0,x1,0,[[0,rgba('#000000',.3)],[1,rgba('#000000',.5)]]);c.fillRect(x0,top,x1-x0,yb-top);
    c.strokeStyle=rgba('#000000',.45);c.lineWidth=1;c.beginPath();for(let x=x0+10;x<x1;x+=10){c.moveTo(x,top);c.lineTo(x,yb);}c.stroke();
    for(const y of [top+26,yb-30]){c.fillStyle='#1a1c20';c.fillRect(x0-2,y,x1-x0+4,5);c.fillStyle=rgba(C.rim,.25);c.fillRect(x0-2,y,x1-x0+4,.8);for(let x=x0+4;x<x1;x+=12){c.fillStyle='#3a3c40';c.beginPath();c.arc(x,y+2.5,1,0,TAU);c.fill();}}
    c.fillStyle=lin(c,0,top+40,0,top+60,[[0,'#0a1020'],[1,'#1a2440']]);c.fillRect(x0+18,top+40,26,20);c.fillStyle=rgba('#9ab4e8',.3);c.fillRect(x0+19,top+41,24,8);
    c.strokeStyle=rgba('#cfe0ff',.25);c.lineWidth=.5;for(let k=0;k<6;k++){const rx=x0+20+k*4,ry=top+42+(k*7)%14;c.beginPath();c.moveTo(rx,ry);c.lineTo(rx-1,ry+4);c.stroke();}
    c.strokeStyle='#1a1c20';c.lineWidth=2;c.beginPath();for(let x=x0+24;x<x0+44;x+=6){c.moveTo(x,top+40);c.lineTo(x,top+60);}c.stroke();
    c.fillStyle=C.gold;c.beginPath();c.arc(x1-9,top+78,2.4,0,TAU);c.fill();
    const lx=x0-22,ly=top+34;c.fillStyle='#14161a';c.fillRect(lx-1,ly-14,2,14);c.fillStyle=lin(c,0,ly,0,ly+13,[[0,'#fff3d2'],[1,'#ffb259']]);c.fillRect(lx-5,ly,10,13);c.fillStyle='#14161a';c.fillRect(lx-6,ly-2,12,3);c.fillRect(lx-6,ly+12,12,2);
    glow(c,lx,ly+6,60,'#ffc070',.45);
    // cold light from the window lying on the floor before the door
    c.save();c.globalCompositeOperation='lighter';const a=pp(694+13,GB,FAR-2),b=pp(694+50,GB,FAR-2),e=pp(694+70,GB,FAR-60),f=pp(694+20,GB,FAR-60);c.fillStyle=lin(c,0,a.y,0,e.y,[[0,rgba('#7a9ad8',.15)],[1,rgba('#7a9ad8',0)]]);poly(c,[a,b,e,f]);c.fill();c.restore();}
  // the tiled section that hides the lift: a hairline seam and, low on it, a little brass plate with the house's H
  {const cx=SECRET_DOOR.x+ox,A=SECRET_ART,pl=cx-A.w/2-A.fr,pr=cx+A.w/2+A.fr,ty=yb-A.h-A.hd;c.fillStyle=rgba('#000000',.28);c.fillRect(pl,ty+1,.9,yb-ty-3);c.fillRect(pr-.9,ty+1,.9,yb-ty-3);c.fillRect(pl,ty,pr-pl,.8);
    const hx=pr-10,hy=yb-70;c.fillStyle=C.goldD;c.fillRect(hx-3,hy-4,6,8);c.fillStyle=C.goldL;c.fillRect(hx-2,hy-3,1,6);c.fillRect(hx+1,hy-3,1,6);c.fillRect(hx-2,hy-.5,4,1);}
  // the skirting and the floor: quarry tiles, flour trodden in, the range's light on them
  c.fillStyle='#0e0b09';c.fillRect(X0,yb-9,X1-X0,9);c.fillStyle=rgba(C.rim,.2);c.fillRect(X0,yb-9,X1-X0,.8);
  {const pts=[pp(X0,GB,FAR),pp(X1,GB,FAR),pp(X1,GB,-110),pp(X0,GB,-110)];c.save();poly(c,pts);c.clip();c.save();floorT(c);c.fillStyle=patAt(c,TX().quarryTiles(21,{L:24,cols:4,rows:4,c0:'#4a2216',c1:'#5e2c1a',pale:'#76462e',grout:'#221c18'}),0,0,1/6);c.fillRect(X0-60,-120,X1-X0+120,FAR+130);c.restore();
    c.fillStyle=lin(c,0,yb,0,GB+100,[[0,rgba('#0a0604',.56)],[.5,rgba('#0a0604',.58)],[1,rgba('#000000',.8)]]);c.fillRect(X0,yb,X1-X0,GB+120-yb);
    c.globalCompositeOperation='lighter';{const sx=(RANGE.x0+RANGE.x1)/2,a=pp(RANGE.x0,GB,FAR-2),b=pp(RANGE.x1,GB,FAR-2),e=pp(RANGE.x1+60,GB,FAR-110),f=pp(RANGE.x0-60,GB,FAR-110);c.fillStyle=lin(c,0,a.y,0,e.y,[[0,rgba('#ff9a50',.22)],[1,rgba('#ff9a50',0)]]);poly(c,[a,b,e,f]);c.fill();void sx;}
    c.restore();}
  for(const [x,d,rr] of [[160,132,26],[334,160,18],[548,158,16]]){const q=pp(x,GB,d);c.fillStyle=rad(c,q.x,q.y,1,rr,[[0,rgba('#f0eadc',.28)],[1,rgba('#f0eadc',0)]]);c.beginPath();c.ellipse(q.x,q.y,rr,rr*.3,0,0,TAU);c.fill();}
  {const q=pp(450,GB,74);c.fillStyle='#0c0a08';c.beginPath();c.ellipse(q.x,q.y,15,4.5,0,0,TAU);c.fill();c.strokeStyle='#3a3430';c.lineWidth=1;c.beginPath();for(let i=-2;i<=2;i++){c.moveTo(q.x+i*5,q.y-3.4);c.lineTo(q.x+i*5,q.y+3.4);}c.stroke();}
  haze(c,X0,X1,T0,120,'#1a120c',.5,true);}
// the flames, the ovens' glow, the steam: every frame
function live(){const ox=OX(),yb=yB(),sx0=RANGE.x0+ox,sx1=RANGE.x1+ox,top=yb-74,t=S.t;ctx.save();ctx.globalCompositeOperation='lighter';
  for(const [u,w] of RANGE_POTS){const x=lerp(sx0,sx1,u);
    for(let i=0;i<5;i++){const fx=x-w/2+3+i*(w-6)/4,fl=3.5+2.2*Math.sin(t*23+i*1.9+u*7)+1.4*Math.sin(t*41+i);
      ctx.fillStyle='rgba(120,170,255,.75)';ctx.beginPath();ctx.moveTo(fx-2.2,top);ctx.lineTo(fx,top-fl);ctx.lineTo(fx+2.2,top);ctx.closePath();ctx.fill();
      ctx.fillStyle='rgba(255,190,110,.5)';ctx.beginPath();ctx.moveTo(fx-1,top-fl*.55);ctx.lineTo(fx,top-fl-1.5);ctx.lineTo(fx+1,top-fl*.55);ctx.closePath();ctx.fill();}
    glow(ctx,x,top-4,w*1.4,'#ff9a50',.18);}
  const n=3,ow=(sx1-sx0-36)/n,k=.55+.25*Math.sin(t*2.3)+.12*Math.sin(t*9.1);
  for(let i=0;i<n;i++){const x=sx0+18+i*ow+ow/2;ctx.fillStyle=`rgba(255,120,40,${(.45*k).toFixed(3)})`;ctx.fillRect(x-16,top+31,32,13);glow(ctx,x,top+38,40,'#ff8a40',.25*k);}
  glow(ctx,(sx0+sx1)/2,top,200,'#ff9a50',.08*k,.5);
  ctx.restore();ctx.save();
  for(const [u,w,h] of RANGE_POTS){if(h<16)continue;const x=lerp(sx0,sx1,u);
    for(let i=0;i<4;i++){const ph=(t*.3+i/4+u)%1,y=top-h-6-ph*90,rr=5+ph*18;ctx.globalAlpha=.1*Math.sin(ph*Math.PI);ctx.fillStyle='#e8e4dc';
      ctx.beginPath();ctx.ellipse(x+Math.sin(t*1.3+i*2+u*9)*7*ph,y,rr,rr*.7,0,0,TAU);ctx.fill();}}
  ctx.restore();}
function light(f){const sx=(RANGE.x0+RANGE.x1)/2,px=f.p[PEL].x;return Math.abs(px-sx)<220?{light:{x:sx+OX()-f.dep*PSX,y:yB()-90+f.dep*PSY}}:{dir:{x:.15,y:-1}};}
// ---------- the kitchen's furniture ----------
const at=(q,d)=>P(q.x,q.y,d),seg=(a,b,w,col)=>{ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();},segP=(a,b,d,w,col)=>seg(at(a,d),at(b,d),w,col);
function quad(p,col){ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(p[0].x,p[0].y);for(const q of p.slice(1))ctx.lineTo(q.x,q.y);ctx.closePath();ctx.fill();}
// a face filled with a texture, then darkened
function quadT(p,fill,dark){quad(p,fill);if(dark){ctx.fillStyle=rgba('#000000',dark);ctx.fill();}}
function prop(Pp){const p=Pp.pts,d=Pp.dep,dz=Pp.dz;ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  if(Pp.type==='crate'){const fr=d-dz*.8,bk=d+dz*.8;
    const wd=TX().wood(71,256,128,PINE),F=[at(p[0],fr),at(p[1],fr),at(p[3],fr),at(p[2],fr)];
    quadT([at(p[1],fr),at(p[1],bk),at(p[3],bk),at(p[3],fr)],patAt(ctx,wd,F[1].x,F[1].y,.2,90),.62);quadT([at(p[0],fr),at(p[1],fr),at(p[1],bk),at(p[0],bk)],patAt(ctx,wd,F[0].x,F[0].y,.2),.25);
    quadT(F,patAt(ctx,wd,F[0].x,F[0].y,.2),.38);
    ctx.strokeStyle=rgba('#000000',.45);ctx.lineWidth=.8;ctx.beginPath();for(const u of [.33,.66]){const a=at({x:lerp(p[0].x,p[2].x,u),y:lerp(p[0].y,p[2].y,u)},fr),b=at({x:lerp(p[1].x,p[3].x,u),y:lerp(p[1].y,p[3].y,u)},fr);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();
    segP(p[0],p[2],fr,3,'#2e1e10');segP(p[1],p[3],fr,3,'#2e1e10');segP(p[0],p[3],fr,2,'#3a2614');
    // the bistro's stencil on the side, in faded red
    const m=at({x:(p[0].x+p[3].x)/2,y:(p[0].y+p[3].y)/2},fr),ang=Math.atan2(p[1].y-p[0].y,p[1].x-p[0].x);ctx.save();ctx.translate(m.x,m.y);ctx.rotate(ang);ctx.fillStyle=rgba('#8a2a1a',.55);ctx.font='700 5.5px "Alegreya SC",Georgia,serif';ctx.textAlign='center';ctx.fillText('L·B',0,2);ctx.restore();
    ctx.strokeStyle=rgba(C.rim,.45);ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(F[0].x,F[0].y);ctx.lineTo(F[1].x,F[1].y);ctx.stroke();}
  else if(Pp.type==='barrel'){const f=d-dz*.45,q=[p[0],p[4],p[2],p[3],p[5],p[1]].map(v=>at(v,f));
    ctx.beginPath();ctx.moveTo(q[0].x,q[0].y);ctx.quadraticCurveTo(q[1].x-3,q[1].y,q[2].x,q[2].y);ctx.lineTo(q[3].x,q[3].y);ctx.quadraticCurveTo(q[4].x+3,q[4].y,q[5].x,q[5].y);ctx.closePath();
    ctx.fillStyle=patAt(ctx,TX().wood(72,256,128,{dark:'#1a0c05',mid:'#4a2a12',light:'#6e4220',rings:6}),q[0].x,q[0].y,.2,90);ctx.fill();
    ctx.fillStyle=lin(ctx,q[1].x,0,q[4].x,0,[[0,rgba('#000000',.62)],[.35,rgba('#000000',.18)],[.55,rgba('#000000',.08)],[1,rgba('#000000',.66)]]);ctx.fill();
    ctx.strokeStyle=rgba('#000000',.45);ctx.lineWidth=.8;ctx.beginPath();for(const u of [.2,.4,.6,.8]){const a={x:lerp(q[0].x,q[5].x,u),y:lerp(q[0].y,q[5].y,u)},b={x:lerp(q[2].x,q[3].x,u),y:lerp(q[2].y,q[3].y,u)};ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo((a.x+b.x)/2+(u-.5)*6,(a.y+b.y)/2,b.x,b.y);}ctx.stroke();
    for(const u of [.12,.3,.7,.88]){const a=u<.5?{x:lerp(q[0].x,q[1].x,u*2),y:lerp(q[0].y,q[1].y,u*2)}:{x:lerp(q[1].x,q[2].x,u*2-1),y:lerp(q[1].y,q[2].y,u*2-1)},b=u<.5?{x:lerp(q[5].x,q[4].x,u*2),y:lerp(q[5].y,q[4].y,u*2)}:{x:lerp(q[4].x,q[3].x,u*2-1),y:lerp(q[4].y,q[3].y,u*2-1)};
      seg(a,b,2.4,'#14161a');seg({x:a.x,y:a.y-.8},{x:b.x,y:b.y-.8},.6,rgba(C.rim,.4));}
    const t0=at(p[0],d),t1=at(p[1],d);ctx.fillStyle='#4a2c14';ctx.beginPath();ctx.ellipse((t0.x+t1.x)/2,(t0.y+t1.y)/2,Math.hypot(t1.x-t0.x,t1.y-t0.y)/2+1,dz*PSY*.8,Math.atan2(t1.y-t0.y,t1.x-t0.x),0,TAU);ctx.fill();
    ctx.strokeStyle='#14161a';ctx.lineWidth=1.6;ctx.stroke();ctx.strokeStyle=rgba(C.rim,.4);ctx.lineWidth=.6;ctx.stroke();}
  else if(Pp.type==='sack'){const f=d-3,q=[p[2],p[0],p[4],p[1],p[3]].map(v=>at(v,f));
    BURLAP=BURLAP||TX().weave(48,48,()=>[196,180,140],9);ctx.fillStyle=patAt(ctx,BURLAP,q[0].x,q[0].y,.3);ctx.beginPath();ctx.moveTo(q[0].x,q[0].y);ctx.quadraticCurveTo(q[0].x-7,(q[0].y+q[1].y)/2,q[1].x,q[1].y);ctx.quadraticCurveTo(q[1].x+3,q[2].y+5,q[2].x,q[2].y);
    ctx.quadraticCurveTo(q[3].x-3,q[2].y+5,q[3].x,q[3].y);ctx.quadraticCurveTo(q[4].x+7,(q[3].y+q[4].y)/2,q[4].x,q[4].y);ctx.closePath();ctx.fill();
    ctx.fillStyle=lin(ctx,q[0].x,0,q[4].x,0,[[0,rgba('#000000',.45)],[.5,rgba('#000000',.05)],[1,rgba('#000000',.5)]]);ctx.fill();
    ctx.strokeStyle=rgba('#3a2a14',.35);ctx.lineWidth=.5;ctx.beginPath();for(let k=0;k<5;k++){const y=lerp(q[1].y,q[0].y,.2+k*.15);ctx.moveTo(q[0].x+2,y);ctx.lineTo(q[4].x-2,y);}ctx.stroke();
    ctx.strokeStyle='#5a4a2a';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(q[2].x-4,q[2].y+5);ctx.lineTo(q[2].x+4,q[2].y+5);ctx.stroke();
    const m={x:(q[1].x+q[3].x)/2,y:(q[1].y+q[3].y)/2+9};ctx.fillStyle=rgba('#2a3a6a',.7);ctx.font='700 5px "Alegreya SC",Georgia,serif';ctx.textAlign='center';ctx.fillText('FARINE',m.x,m.y+2);}
  else if(Pp.type==='stove'){const fr=d-dz*.8,bk=d+dz*.8,t=S.t,k=.62+.24*Math.sin(t*7.3)*Math.sin(t*3.1+1)+.1*Math.sin(t*17);
    const pt=at({x:(p[0].x+p[1].x)/2+6,y:p[0].y},bk);ctx.fillStyle=lin(ctx,pt.x-6,0,pt.x+6,0,[[0,'#08090b'],[.4,'#1e2024'],[1,'#0a0b0d']]);ctx.fillRect(pt.x-6,pt.y-460,12,460);
    for(let y=pt.y-440;y<pt.y;y+=60){ctx.fillStyle='#24262a';ctx.fillRect(pt.x-7.5,y,15,3);ctx.fillStyle=rgba(C.rim,.25);ctx.fillRect(pt.x-7.5,y,15,.6);}
    quad([at(p[1],fr),at(p[1],bk),at(p[3],bk),at(p[3],fr)],'#0e0f12');quad([at(p[0],fr),at(p[1],fr),at(p[1],bk),at(p[0],bk)],'#1c1e22');
    const F=[at(p[0],fr),at(p[1],fr),at(p[3],fr),at(p[2],fr)];quad(F,'#121316');
    // the cast front: a scrolled panel, the firebox door with its glow showing through the grille
    const a=at({x:lerp(p[0].x,p[1].x,.18),y:lerp(p[0].y,p[2].y,.42)},fr),b=at({x:lerp(p[0].x,p[1].x,.82),y:lerp(p[0].y,p[2].y,.8)},fr);
    ctx.fillStyle='#08080a';ctx.fillRect(a.x,a.y,b.x-a.x,b.y-a.y);ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(255,110,30,${(.6*k).toFixed(3)})`;
    for(let i=0;i<5;i++)ctx.fillRect(a.x+3+i*(b.x-a.x-6)/5,a.y+4,(b.x-a.x-6)/5-2.4,b.y-a.y-8);glow(ctx,(a.x+b.x)/2,b.y,70,'#ff8a40',.35*k,.6);ctx.restore();
    ctx.strokeStyle=rgba(C.gold,.5);ctx.lineWidth=.7;ctx.strokeRect(a.x-2,a.y-2,b.x-a.x+4,b.y-a.y+4);scroll(ctx,(a.x+b.x)/2-8,a.y-8,3.4,-1,rgba(C.gold,.55),.6,1.2);scroll(ctx,(a.x+b.x)/2+8,a.y-8,3.4,1,rgba(C.gold,.55),.6,1.2);
    segP(p[0],p[1],fr,3,'#2a2c30');const rl=at({x:p[0].x,y:p[0].y+10},fr-2),rr=at({x:p[1].x,y:p[1].y+10},fr-2);seg(rl,rr,1.8,C.goldD);seg({x:rl.x,y:rl.y-.6},{x:rr.x,y:rr.y-.6},.6,C.goldL);
    ctx.save();ctx.globalCompositeOperation='lighter';const ta=at(p[0],d),tb=at(p[1],d);ctx.strokeStyle=`rgba(255,90,30,${(.4*k).toFixed(3)})`;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(ta.x+3,ta.y);ctx.lineTo(tb.x-3,tb.y);ctx.stroke();ctx.restore();
    ctx.strokeStyle='rgba(255,220,190,.12)';ctx.lineWidth=1.2;for(let i=0;i<3;i++){const x=lerp(ta.x,tb.x,.25+i*.25),ph=(t*.8+i*.37)%1,y0=ta.y-6-ph*34;ctx.globalAlpha=Math.sin(ph*Math.PI);ctx.beginPath();ctx.moveTo(x,y0);ctx.quadraticCurveTo(x+4*Math.sin(t*5+i),y0-6,x,y0-12);ctx.stroke();}ctx.globalAlpha=1;
    for(const q of [p[2],p[3]]){const f0=at(q,fr);ctx.fillStyle='#08080a';ctx.beginPath();ctx.moveTo(f0.x-4,f0.y+1);ctx.quadraticCurveTo(f0.x,f0.y-6,f0.x+4,f0.y+1);ctx.fill();}}
  else{ctx.restore();return false;}
  ctx.restore();return true;}
// the prep table: a butcher block worn hollow, on iron legs, a cleaver left in it
function table(){const T=S.table;if(!T||!T.on||T.state==='broken'||S.room!=='kitchen')return false;
  const Q=T.pts,bk=T.dep+TD,fr=T.dep-TD,lp=(a,b,u)=>({x:lerp(a.x,b.x,u),y:lerp(a.y,b.y,u)}),la=lp(Q[0],Q[1],.08),lb=lp(Q[0],Q[1],.92);ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  segP(la,Q[3],bk,4,'#0e0f12');segP(lb,Q[2],bk,4,'#0e0f12');
  const s0=lp(la,Q[3],.7),s1=lp(lb,Q[2],.7);quad([at(s0,bk),at(s1,bk),at(s1,fr),at(s0,fr)],'#1a1c20');
  {const m=at(lp(s0,s1,.35),T.dep);ctx.fillStyle=lin(ctx,m.x-7,0,m.x+7,0,[[0,COPD],[.4,COPL],[1,COPD]]);ctx.fillRect(m.x-7,m.y-9,14,9);}
  segP(la,Q[3],fr,4.4,'#16181c');segP(lb,Q[2],fr,4.4,'#16181c');
  const ux=Q[1].x-Q[0].x,uy=Q[1].y-Q[0].y,L=Math.hypot(ux,uy)||1,nx=-uy/L,ny=ux/L,o=(q,u,v)=>({x:q.x+ux/L*u+nx*v,y:q.y+uy/L*u+ny*v});
  const a0=o(Q[0],-4,-2),a1=o(Q[1],4,-2),b0=o(Q[0],-4,9),b1=o(Q[1],4,9);
  quad([at(a0,bk),at(a1,bk),at(a1,fr),at(a0,fr)],'#8a6440');
  {const A=at(a0,bk),B=at(a1,bk),F=at(a1,fr),G=at(a0,fr);ctx.fillStyle=rad(ctx,(A.x+F.x)/2,(A.y+F.y)/2,2,Math.abs(B.x-A.x)/2,[[0,rgba('#000000',.2)],[1,rgba('#000000',0)]]);ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.lineTo(F.x,F.y);ctx.lineTo(G.x,G.y);ctx.closePath();ctx.fill();}
  ctx.strokeStyle=rgba('#3a2412',.45);ctx.lineWidth=.7;ctx.beginPath();for(const u of [.2,.4,.6,.8]){const q1=at(lp(a0,a1,u),bk),q2=at(lp(a0,a1,u),fr);ctx.moveTo(q1.x,q1.y);ctx.lineTo(q2.x,q2.y);}ctx.stroke();
  quad([at(a0,fr),at(a1,fr),at(b1,fr),at(b0,fr)],'#5a3a20');
  ctx.strokeStyle=rgba('#2a160a',.6);ctx.lineWidth=.9;ctx.beginPath();for(let u=0;u<=1.001;u+=.1){const a=at(lp(a0,a1,u),fr),b=at(lp(b0,b1,u),fr);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();
  {const t1=at(a0,fr),t2=at(a1,fr);seg(t1,t2,.8,rgba(C.rim,.5));}
  const cq=at(lp(a0,a1,.62),T.dep-4),ang=Math.atan2(uy,ux);ctx.save();ctx.translate(cq.x,cq.y);ctx.rotate(ang);
  ctx.fillStyle=lin(ctx,0,-11,0,2,[[0,'#c8d0d4'],[1,'#6a7276']]);ctx.beginPath();ctx.moveTo(-9,2);ctx.lineTo(7,2);ctx.lineTo(7,-9);ctx.lineTo(-9,-11);ctx.closePath();ctx.fill();ctx.fillStyle='#1a0e08';ctx.fillRect(7,-8,12,3.4);ctx.fillStyle=C.goldD;ctx.fillRect(9,-7.4,1,2.2);ctx.fillRect(15,-7.4,1,2.2);ctx.restore();
  ctx.restore();return true;}
// enamel lamps: dark green shades lined white, a warm bulb
function lamp(L){if(L.kind!=='hood')return false;const p=L.p,a=P(L.x,L.ay,L.dep),q=P(p.x,p.y,L.dep),k=lampGlow(L);ctx.save();
  if(!L.fallen){ctx.strokeStyle='#08080a';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(q.x,q.y);ctx.stroke();}
  ctx.translate(q.x,q.y);ctx.rotate(L.fallen?(L.landed?1.2:S.t*6):-Math.atan2(p.x-L.x,p.y-L.ay));
  if(k>0){const G=glowSprites();ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.18*k;ctx.drawImage(G.cone,-44,4,88,116);ctx.globalAlpha=.8*k;ctx.drawImage(G.dot,-26,-20,52,52);ctx.restore();}
  ctx.fillStyle='#10201a';ctx.beginPath();ctx.moveTo(-L.r-3,4);ctx.quadraticCurveTo(-L.r*.6,-L.r*.9,0,-L.r*.9);ctx.quadraticCurveTo(L.r*.6,-L.r*.9,L.r+3,4);ctx.closePath();ctx.fill();
  ctx.fillStyle=rgba('#cfe0d8',.35);ctx.beginPath();ctx.moveTo(-L.r*.6,-L.r*.5);ctx.quadraticCurveTo(-L.r*.2,-L.r*.8,L.r*.1,-L.r*.82);ctx.lineTo(L.r*.05,-L.r*.7);ctx.quadraticCurveTo(-L.r*.25,-L.r*.66,-L.r*.5,-L.r*.4);ctx.fill();
  ctx.fillStyle=L.lit?'#f4ecd8':'#3a3a34';ctx.fillRect(-L.r-3,3,2*L.r+6,1.6);ctx.fillStyle='#0c1410';ctx.fillRect(-1.5,-L.r*.9-5,3,5);
  ctx.fillStyle=L.lit?'#fff3cf':'#2a2a26';ctx.beginPath();ctx.arc(0,5,3,0,TAU);ctx.fill();ctx.restore();return true;}
// the crockery shelf and the larder slats
function div(it){const w=it.dv;if(w.state==='broken'||(w.mat!=='slats'&&w.mat!=='shelf'))return false;const A=it.a,B=it.b,g=S.arena.ground(w.x,(A+B)/2),yt=g-w.h,xl=divL(w),xr=divR(w);
  if(w.mat==='slats'){EnvProps.divFace(it,'slats',slatFace,8);
    if(it.first||it.last){const d=it.first?A:B;quad([P(xl-3,g,d),P(xl-3,yt-6,d),P(xr+3,yt-6,d),P(xr+3,g,d)],'#2a1a0e');}
    for(const m of w.marks){if(m.d<A||m.d>=B)continue;drawDivMark(w,m);}return true;}
  return false;}
// the larder slats, whole, in their own plane (ctx here is the face's own canvas)
function slatFace(ctx,w,A,B,yt,g,h){
  ctx.fillStyle=rgba('#050403',.7);ctx.fillRect(A,yt,B-A,h);
  for(let d=Math.ceil(w.d0/8)*8;d<=w.d1;d+=8){ctx.fillStyle=lin(ctx,d-2.2,0,d+2.2,0,[[0,'#2a1a0e'],[.5,'#5a3e24'],[1,'#2a1a0e']]);ctx.fillRect(d-2.1,yt+2,4.2,h-4);ctx.fillStyle=rgba(C.rim,.35);ctx.fillRect(d-2.1,yt+2,4.2,.8);}
  for(const y of [g-34,yt+22]){ctx.fillStyle='#3a2614';ctx.fillRect(A,y,B-A,8);ctx.fillStyle=rgba(C.rim,.3);ctx.fillRect(A,y,B-A,.8);}}
E.S.kitchen={paint,live,light,prop,table,lamp,div};
})();
// ===== ENV KITCHEN END =====
