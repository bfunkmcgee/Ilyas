// ===== ENV SUMPKITCHEN =====
// Tamm's kitchen at the back of the Sump, after midnight. A low room of boards gone black with smoke toward the ceiling, the ceiling
// itself planks on heavy beams. At the back right the big iron stove on its legs, the fire showing red through its grate, a kettle
// and a pot on its top, its flue going up the wall and bending away toward the roof; a sheet of rusted tin behind it and the soot
// over it. Left of it the window, high in the back wall: through it the Pit's far wall going up into the dark, shack windows lit,
// and high up a thread of gold light where the arm hangs on the spike (live). Between the window and the ladder, shelves of crocks
// and jars over a beer barrel on its cradle and sacks of flour; a pole along the wall hung with strings of onions, garlic and
// herbs, a ladle and a pan. At the back left the ladder goes up through the hole in the ceiling to the roof hatch, the hut's lamp
// faint at the top of it; past it, the door to the bar, its warm light and its noise. In the middle of the floor the long table,
// scrubbed and scarred, an oil lamp hanging over it; a basin and a bottle at its ends. The floor is boards, a stone hearth before the
// stove. sk_pitui.js draws the skillet on the stove and the curtain Tamm draws across the window.
(()=>{const E=EnvLook,{C,pp,poly,lin,rad,rgba,rng,lerp,clamp,TAU}=E,K=E.sump,{dim,pick,glowAt,puffAt}=K;
const DEF={far:224,table:{x0:368,x1:552,d0:56,d1:112,top:42},stove:{x:742,d:206,w:96},window:{x0:450,x1:590,y0:150,y1:96},ladder:{x:146,d:200},door:{x:30,w:56},floor:{x0:60,x1:860,z0:24,z1:160}};
const PL=()=>typeof ACT1_PLACES!=='undefined'&&ACT1_PLACES.sumpkitchen?ACT1_PLACES.sumpkitchen:DEF;
const CEIL=172;                    // the ceiling's height over the floor
const q=(x,h,d)=>pp(x,GB-h,d);
function floorT(c){c.transform(1,0,PSX,-PSY,0,GB);}
// the room worked out from its layout: the back wall's foot (yW) and its shift (ox), the stove's box, the window on the screen
function geo(){const L=PL(),far=L.far,ox=far*PSX,yW=GB-far*PSY,S0=L.stove,W0=L.window;
  return{L,far,ox,yW,wx:x=>x+ox,wy:h=>yW-h,
    stove:{x0:S0.x-S0.w/2,x1:S0.x+S0.w/2,d0:S0.d-34,d1:far-2,h:56},
    win:{x0:W0.x0+ox,x1:W0.x1+ox,y0:yW-W0.y0,y1:yW-W0.y1},
    lamp:{x:(L.table.x0+L.table.x1)/2,d:(L.table.d0+L.table.d1)/2+12,h:146}};}

// ---------- the back wall and the ceiling ----------
function wall(c,G){const {yW,ox}=G,top=G.wy(CEIL),r=rng(31);
  K.boards(c,-200,top,1200,yW,{dir:'v',w:13,base:'#2c2017',seed:41,soot:.72,nails:[top+16,yW-60]});
  // the skirting and a rail along the wall at the height of the shelves' brackets
  c.fillStyle='#120c08';c.fillRect(-200,yW-9,1400,9);c.fillStyle=rgba('#ffcf9a',.08);c.fillRect(-200,yW-9,1400,.8);
  // soot: up the wall over the stove and over the lamp, a tide of it under the ceiling
  {const S0=G.stove,sx=(S0.x0+S0.x1)/2+ox;c.fillStyle=rad(c,sx,G.wy(110),10,170,[[0,rgba('#050302',.7)],[1,rgba('#050302',0)]]);c.fillRect(sx-180,top,360,yW-top);}
  {const lx=G.lamp.x+ox;c.fillStyle=rad(c,lx,top,10,140,[[0,rgba('#050302',.45)],[1,rgba('#050302',0)]]);c.fillRect(lx-150,top,300,120);}
  // a sheet of tin nailed up behind the stove, rusted through in blooms
  {const S0=G.stove,x0=S0.x0+ox-12,x1=S0.x1+ox+12,y0=G.wy(122),y1=yW-6;c.fillStyle='#2e2622';c.fillRect(x0,y0,x1-x0,y1-y0);
    c.fillStyle=rgba('#ffd2a6',.05);for(let x=x0+1;x<x1;x+=6)c.fillRect(x,y0,1.5,y1-y0);c.fillStyle=rgba('#000000',.3);for(let x=x0+3.6;x<x1;x+=6)c.fillRect(x,y0,1.8,y1-y0);
    for(let i=0;i<14;i++){c.fillStyle=rgba(pick(r,['#6a3418','#7a4420','#4a2412']),.3+.3*r());c.beginPath();c.ellipse(x0+r()*(x1-x0),y0+r()*(y1-y0),3+r()*9,5+r()*14,0,0,TAU);c.fill();}
    c.fillStyle=lin(c,0,y0,0,y1,[[0,rgba('#050302',.7)],[.6,rgba('#050302',.2)],[1,rgba('#050302',.05)]]);c.fillRect(x0,y0,x1-x0,y1-y0);
    c.fillStyle='#0c0a0a';for(const [nx,ny] of [[x0+3,y0+3],[x1-4,y0+3],[x0+3,y1-5],[x1-4,y1-5],[(x0+x1)/2,y0+3]])c.fillRect(nx,ny,1.4,1.4);}
  // the ceiling: planks on heavy beams, all of it black with smoke; the wall plate along the top of the wall
  c.fillStyle='#0b0806';c.fillRect(-200,-100,1400,top+100);
  for(let y=top-10;y>-100;y-=9){c.fillStyle=rgba('#2a1c12',.35+.2*r());c.fillRect(-200,y,1400,8);c.fillStyle=rgba('#000000',.5);c.fillRect(-200,y+8,1400,1);}
  for(const [y,h] of [[top-12,14],[top-62,18],[top-128,24],[top-210,30]]){c.fillStyle='#16100b';c.fillRect(-200,y-h,1400,h);c.fillStyle=rgba('#ffcf9a',.07);c.fillRect(-200,y-1.4,1400,1.4);c.fillStyle=rgba('#000000',.45);c.fillRect(-200,y-h,1400,2);}
  c.fillStyle='#1c130c';c.fillRect(-200,top-4,1400,8);c.fillStyle=rgba('#ffcf9a',.12);c.fillRect(-200,top+3,1400,1);
  // the dark gathering under the ceiling
  c.fillStyle=lin(c,0,-100,0,top+40,[[0,'#050304'],[.7,rgba('#050304',.6)],[1,rgba('#050304',0)]]);c.fillRect(-200,-100,1400,top+140);}

// ---------- the window: the Pit's far wall going up, the spike high on it ----------
function windowView(c,G){const w=G.win,r=rng(57),W=w.x1-w.x0,Hh=w.y1-w.y0;
  c.save();c.beginPath();c.rect(w.x0,w.y0,W,Hh);c.clip();
  c.fillStyle=lin(c,0,w.y0,0,w.y1,[[0,'#050508'],[.5,'#0e0b10'],[1,'#1e1412']]);c.fillRect(w.x0,w.y0,W,Hh);
  K.farSide(c,w.x0-30,w.x1+30,w.y0-30,w.y1+4,{k:.3,rs:14,seed:7071,lit:.6,fire:.3,smoke:3,stairs:1,poles:1});
  // the near roofs of the yard outside along the bottom of it
  c.fillStyle='#0a0708';c.beginPath();c.moveTo(w.x0,w.y1+2);let x=w.x0;while(x<w.x1){const s=8+r()*20;c.lineTo(x,w.y1-3-r()*6);c.lineTo(x+s,w.y1-3-r()*6);x+=s;}c.lineTo(w.x1,w.y1+2);c.closePath();c.fill();
  c.fillStyle=rgba('#ffcf86',.5);c.fillRect(w.x0+W*.2,w.y1-5,2,2);
  // the shelf of rock, the spike at its end, high on the right of the pane
  const A=armAt(G);K.spikeRock(c,A.x,A.y,.32,{wall:A.x-58,seed:53});K.armHalo(c,A.x,A.y,.32);
  c.fillStyle=lin(c,0,w.y0,0,w.y0+Hh*.5,[[0,rgba('#030305',.6)],[1,rgba('#030305',0)]]);c.fillRect(w.x0,w.y0,W,Hh*.5);
  c.restore();}
function armAt(G){const w=G.win;return{x:lerp(w.x0,w.x1,.66),y:lerp(w.y0,w.y1,.24)};}
function windowFrame(c,G){const w=G.win,W=w.x1-w.x0,Hh=w.y1-w.y0;
  // the glass: grime in the corners, a streak of the room's light, one pane cracked across, one patched with oilcloth
  c.save();c.beginPath();c.rect(w.x0,w.y0,W,Hh);c.clip();
  c.fillStyle=rad(c,w.x0+W/2,w.y0+Hh/2,Math.min(W,Hh)*.3,Math.max(W,Hh)*.7,[[0,rgba('#2a2018',0)],[1,rgba('#2a2018',.5)]]);c.fillRect(w.x0,w.y0,W,Hh);
  c.globalCompositeOperation='lighter';c.strokeStyle=rgba('#ffcf9a',.07);c.lineWidth=W*.1;c.beginPath();c.moveTo(w.x0+W*.1,w.y1);c.lineTo(w.x0+W*.4,w.y0);c.stroke();c.globalCompositeOperation='source-over';
  const pw=W/3,ph=Hh/2;
  c.fillStyle='#16110f';c.fillRect(w.x0+pw*2,w.y0+ph,pw,ph);c.fillStyle=rgba('#c8b8a0',.06);c.fillRect(w.x0+pw*2+2,w.y0+ph+3,pw-6,ph*.3);c.fillStyle='#0a0808';for(const [nx,ny] of [[2,2],[pw-4,2],[2,ph-4],[pw-4,ph-4]])c.fillRect(w.x0+pw*2+nx,w.y0+ph+ny,1.4,1.4);
  c.strokeStyle=rgba('#d8e4ec',.3);c.lineWidth=.5;c.beginPath();c.moveTo(w.x0+3,w.y0+ph*.5);c.lineTo(w.x0+pw*.4,w.y0+ph*.62);c.lineTo(w.x0+pw*.7,w.y0+ph*.4);c.lineTo(w.x0+pw-1,w.y0+ph*.55);c.stroke();
  c.restore();
  // the frame and the bars
  c.strokeStyle='#120c08';c.lineWidth=5;c.strokeRect(w.x0-2.5,w.y0-2.5,W+5,Hh+5);c.lineWidth=2.4;c.beginPath();c.moveTo(w.x0+pw,w.y0);c.lineTo(w.x0+pw,w.y1);c.moveTo(w.x0+pw*2,w.y0);c.lineTo(w.x0+pw*2,w.y1);c.moveTo(w.x0,w.y0+ph);c.lineTo(w.x1,w.y0+ph);c.stroke();
  c.strokeStyle=rgba('#ffcf9a',.12);c.lineWidth=.7;c.strokeRect(w.x0-5,w.y0-5,W+10,Hh+10);
  // the sill, a cup with a sprig in it; the rod over the window for the curtain
  c.fillStyle='#2a1c12';c.fillRect(w.x0-10,w.y1+2,W+20,5);c.fillStyle=rgba('#ffcf9a',.2);c.fillRect(w.x0-10,w.y1+2,W+20,1);c.fillStyle='#0c0806';c.fillRect(w.x0-8,w.y1+7,W+16,2);
  {const cx=w.x0+W*.14,cy=w.y1+2;c.fillStyle='#8a7a68';c.fillRect(cx-3,cy-6,6,6);c.strokeStyle='#4a5a32';c.lineWidth=.8;c.beginPath();c.moveTo(cx,cy-6);c.lineTo(cx-2,cy-13);c.moveTo(cx,cy-6);c.lineTo(cx+2.6,cy-12);c.stroke();}
  c.strokeStyle='#1a1614';c.lineWidth=1.6;c.beginPath();c.moveTo(w.x0-10,w.y0-9);c.lineTo(w.x1+10,w.y0-9);c.stroke();for(const bx of [w.x0-8,w.x1+8]){c.fillStyle='#1a1614';c.fillRect(bx-1,w.y0-11,2,5);}}

// ---------- the door to the bar, at the back on the left ----------
function barDoor(c,G){const D=G.L.door,x0=D.x-D.w/2+G.ox,x1=x0+D.w,yb=G.yW,top=yb-138;
  c.fillStyle='#0c0806';c.fillRect(x0-6,top-6,x1-x0+12,yb-top+6);
  // the bar beyond: its lamps, the counter, two backs at it
  c.save();c.beginPath();c.rect(x0,top,x1-x0,yb-top);c.clip();
  c.fillStyle=lin(c,0,top,0,yb,[[0,'#3a1e0e'],[.5,'#7a4418'],[1,'#a8642a']]);c.fillRect(x0,top,x1-x0,yb-top);
  glowAt(c,x0+(x1-x0)*.6,top+30,50,'#ffc070',.7);c.fillStyle='#ffe2a8';c.fillRect(x0+(x1-x0)*.6-2,top+28,4,5);
  c.fillStyle='#2a160a';c.fillRect(x0,yb-46,x1-x0,46);c.fillStyle=rgba('#ffcf86',.4);c.fillRect(x0,yb-46,x1-x0,1.2);
  c.fillStyle='#1a0e08';for(const [fx,fh] of [[x0+12,58],[x0+36,64]]){c.beginPath();c.arc(fx,yb-fh-8,6,0,TAU);c.fill();c.beginPath();c.moveTo(fx-10,yb-30);c.quadraticCurveTo(fx-11,yb-fh+2,fx,yb-fh+1);c.quadraticCurveTo(fx+11,yb-fh+2,fx+10,yb-30);c.closePath();c.fill();}
  c.restore();
  // the frame, a curtain of sacking pushed aside
  c.fillStyle='#1a120c';c.fillRect(x0-4,top-4,4,yb-top+4);c.fillRect(x1,top-4,4,yb-top+4);c.fillRect(x0-4,top-6,x1-x0+8,5);
  c.fillStyle='#4a3a26';c.beginPath();c.moveTo(x1+2,top);c.lineTo(x1-12,top);c.quadraticCurveTo(x1-6,top+70,x1-14,yb-4);c.lineTo(x1+2,yb-4);c.closePath();c.fill();c.fillStyle=rgba('#000000',.3);c.fillRect(x1-8,top,3,yb-top-4);
  // its light out over the kitchen floor
  c.save();c.globalCompositeOperation='lighter';floorT(c);const cx=D.x+30,cd=G.far-50;c.translate(cx,cd);c.scale(2,1);
  c.fillStyle=rad(c,0,0,4,60,[[0,rgba('#ffb060',.26)],[.5,rgba('#ff9a50',.1)],[1,rgba('#ff9a50',0)]]);c.beginPath();c.arc(0,0,60,0,TAU);c.fill();c.restore();
  glowAt(c,(x0+x1)/2,yb-60,90,'#ffb060',.18);}

// ---------- the ladder up to the hatch ----------
function ladder(c,G){const Lr=G.L.ladder,x=Lr.x,d=Lr.d,b0=q(x-10,0,d),b1=q(x+10,0,d),hole=G.wy(CEIL)-26;
  // the hole in the ceiling: the hut's lamp faint up the shaft
  {const hx=b0.x+10,hw=34;c.fillStyle='#060404';c.fillRect(hx-hw/2,hole-26,hw,34);c.fillStyle=lin(c,0,hole-26,0,hole+8,[[0,rgba('#ffb866',.3)],[1,rgba('#ffb866',0)]]);c.fillRect(hx-hw/2+3,hole-26,hw-6,30);
    c.fillStyle='#1c130c';c.fillRect(hx-hw/2-4,hole+6,hw+8,5);glowAt(c,hx,hole-18,26,'#ffb866',.2);}
  // the rails and rungs, worn pale in the middle where the feet go
  for(const p of [b0,b1]){c.fillStyle='#3a2818';c.fillRect(p.x-2,hole-20,4,p.y-hole+20);c.fillStyle=rgba('#ffcf9a',.14);c.fillRect(p.x+1.2,hole-20,.8,p.y-hole+20);}
  for(let y=b0.y-14;y>hole-14;y-=15){c.fillStyle='#4a3420';c.fillRect(b0.x,y,b1.x-b0.x,3);c.fillStyle=rgba('#ffd9a8',.16);c.fillRect(b0.x+5,y,b1.x-b0.x-10,1);}
  c.fillStyle=rgba('#000000',.35);c.beginPath();c.ellipse((b0.x+b1.x)/2,b0.y+1,16,3,0,0,TAU);c.fill();}

// ---------- the shelves, the barrel, the sacks; the pole of onions and garlic ----------
function shelves(c,G){const {ox,yW}=G,w=G.win,x0=Math.max(G.L.ladder.x+46,190)+ox,x1=Math.min(w.x0-40,x0+260),r=rng(77);if(x1-x0<40)return;
  for(const [h,i] of [[66,0],[102,1]]){const y=yW-h;
    // the board on its brackets
    for(const bx of [x0+8,x1-12]){c.fillStyle='#1a120b';c.beginPath();c.moveTo(bx,y+4);c.lineTo(bx+4,y+4);c.lineTo(bx+4,y+16);c.closePath();c.fill();}
    // what is on it: crocks and jars, stacked bowls, a pitcher, tins
    let x=x0+6;while(x<x1-12){const k=r();
      if(k<.32){const ww=10+r()*7,hh=12+r()*9;K.crock(c,x+ww/2,y,ww,hh,{col:pick(r,['#8a6a46','#6a4a30','#b8a080','#5a4a3a']),band:r()<.4?'#3a3a5a':null,cloth:r()<.35?'#c8b890':null});x+=ww+3;}
      else if(k<.56){const ww=7+r()*4,hh=10+r()*6;K.jar(c,x+ww/2,y,ww,hh,{fill:pick(r,['#8a6a2a','#6a7a3a','#8a3a2a','#c8a050','#d8c8a8']),lev:.5+r()*.4});x+=ww+3;}
      else if(k<.74){for(let j=0;j<3+((r()*3)|0);j++){c.fillStyle=j%2?'#c8b898':'#b8a888';c.beginPath();c.ellipse(x+7,y-2-j*2.2,7,1.8,0,0,TAU);c.fill();}x+=17;}
      else if(k<.86){c.fillStyle='#6a5a4a';c.beginPath();c.moveTo(x,y);c.lineTo(x+1,y-12);c.quadraticCurveTo(x+5,y-16,x+9,y-12);c.lineTo(x+10,y);c.closePath();c.fill();c.strokeStyle='#6a5a4a';c.lineWidth=1.4;c.beginPath();c.arc(x+11,y-7,3,-1.2,1.2);c.stroke();x+=16;}
      else{const ww=8+r()*4;c.fillStyle=pick(r,['#3a3e3a','#5a2a1e','#2a3a4a']);c.fillRect(x,y-11,ww,11);c.fillStyle=rgba('#d8c8a0',.35);c.fillRect(x+1,y-8,ww-2,3);x+=ww+3;}}
    c.fillStyle='#3a2818';c.fillRect(x0,y,x1-x0,4);c.fillStyle=rgba('#ffcf9a',.2);c.fillRect(x0,y,x1-x0,.8);c.fillStyle=rgba('#000000',.5);c.fillRect(x0,y+4,x1-x0,1.4);
    // oilcloth along the shelf's edge, cut in points
    c.fillStyle=i?'#4a2a2a':'#2a3a3a';c.beginPath();c.moveTo(x0,y+4);for(let xx=x0;xx<=x1;xx+=6){c.lineTo(xx+3,y+9);c.lineTo(xx+6,y+4);}c.closePath();c.fill();}
  // under the shelves: the beer barrel on its cradle, its tap; sacks of flour; a crate of bottles
  {const bx=lerp(x0,x1,.42)-ox,bd=G.far-20,b=q(bx,0,bd),bl=58,bh=34,cy=b.y-14-bh/2;
    c.fillStyle='#1c130c';for(const lx of [b.x-bl*.38,b.x+bl*.3]){c.beginPath();c.moveTo(lx-8,b.y);c.lineTo(lx-3,cy+8);c.lineTo(lx+3,cy+8);c.lineTo(lx+8,b.y);c.closePath();c.fill();}
    c.fillStyle='#4a2c16';c.beginPath();c.moveTo(b.x-bl/2,cy-bh/2+3);c.quadraticCurveTo(b.x,cy-bh/2-4,b.x+bl/2,cy-bh/2+3);c.lineTo(b.x+bl/2,cy+bh/2-3);c.quadraticCurveTo(b.x,cy+bh/2+4,b.x-bl/2,cy+bh/2-3);c.closePath();c.fill();
    c.fillStyle=lin(c,0,cy-bh/2,0,cy+bh/2,[[0,rgba('#ffd9a8',.1)],[.35,rgba('#000000',0)],[1,rgba('#000000',.55)]]);c.fill();
    c.strokeStyle=rgba('#000000',.35);c.lineWidth=.7;c.beginPath();for(let k=1;k<6;k++){const yy=cy-bh/2+bh*k/6;c.moveTo(b.x-bl/2,yy);c.quadraticCurveTo(b.x,yy+(k-3)*1.2,b.x+bl/2,yy);}c.stroke();
    for(const u of [.12,.3,.7,.88]){const xx=b.x-bl/2+bl*u;c.fillStyle='#16130f';c.fillRect(xx-1.4,cy-bh/2-2,2.8,bh+4);c.fillStyle=rgba('#ffcf9a',.14);c.fillRect(xx-1.4,cy-bh/2-2,.7,bh+4);}
    c.fillStyle='#5a3a1e';c.beginPath();c.ellipse(b.x+bl/2,cy,4.4,bh/2-1,0,0,TAU);c.fill();c.strokeStyle='#16130f';c.lineWidth=1.4;c.stroke();
    c.fillStyle='#8a6a2e';c.fillRect(b.x+bl/2+3,cy+2,7,2.4);c.fillRect(b.x+bl/2+8,cy+2,2,6);c.fillStyle=rgba('#ffe0a0',.4);c.fillRect(b.x+bl/2+3,cy+2,7,.7);
    c.fillStyle='#24201c';c.beginPath();c.ellipse(b.x+bl/2+9,b.y-1,7,2.4,0,0,TAU);c.fill();c.fillStyle=rgba('#c89a52',.4);c.beginPath();c.ellipse(b.x+bl/2+9,b.y-1.6,5,1.4,0,0,TAU);c.fill();}
  {const s=q(x0-ox+16,0,G.far-14);K.sack(c,s.x,s.y,22,26,{col:'#8a7a5e',seed:5});const s2=q(x0-ox+36,0,G.far-24);K.sack(c,s2.x,s2.y,20,22,{col:'#7a6a50',seed:9});
    c.fillStyle='#2a3a6a';c.globalAlpha=.6;c.font='700 4.5px "Alegreya SC",Georgia,serif';c.textAlign='center';c.fillText('FLOUR',s.x,s.y-9);c.globalAlpha=1;}
  {const cr=q(x1-ox-30,0,G.far-26),cw=30,ch=16;c.fillStyle='#3a2a1a';c.fillRect(cr.x-cw/2,cr.y-ch,cw,ch);c.strokeStyle=rgba('#000000',.4);c.lineWidth=.8;c.strokeRect(cr.x-cw/2,cr.y-ch,cw,ch);
    for(let i=0;i<5;i++){const bx=cr.x-cw/2+4+i*5.4;c.fillStyle=i%2?'#16301e':'#2a1a0e';c.fillRect(bx,cr.y-ch-8,3.4,9);c.fillRect(bx+.9,cr.y-ch-12,1.6,4);}
    c.fillStyle=rgba('#ffcf9a',.12);c.fillRect(cr.x-cw/2,cr.y-ch,cw,.8);}}
// the pole along the back wall, hung with onions, garlic, herbs, a ladle and a pan (and nothing in front of the window)
function hanging(c,G){const {ox}=G,w=G.win,y=Math.min(G.wy(CEIL)+12,w.y0-16),r=rng(91),x0=G.L.ladder.x+30+ox,x1=G.stove.x1+ox+40;
  c.fillStyle='#1c130c';c.fillRect(x0,y-2,x1-x0,3.4);c.fillStyle=rgba('#ffcf9a',.12);c.fillRect(x0,y-2,x1-x0,.8);
  for(const bx of [x0+6,(x0+x1)/2,x1-6]){c.fillStyle='#0c0806';c.fillRect(bx-1,y-14,2,14);}
  let x=x0+10;while(x<x1-10){if(x>w.x0-14&&x<w.x1+14){x=w.x1+16;continue;}const k=r();
    if(k<.38){K.onions(c,x,y,5+((r()*4)|0),{seed:(x*13)|0,side:1,lit:.8});x+=14+r()*8;}
    else if(k<.58){K.garlic(c,x,y,4+((r()*3)|0),{seed:(x*7)|0});x+=12+r()*6;}
    else if(k<.74){c.strokeStyle='#3a2a1a';c.lineWidth=.8;c.beginPath();c.moveTo(x,y);c.lineTo(x,y+8);c.stroke();c.fillStyle=pick(r,['#3a4a2a','#4a5a32','#5a4a2a']);c.beginPath();c.moveTo(x-6,y+8);c.lineTo(x+6,y+8);c.lineTo(x+2,y+30);c.lineTo(x-2,y+30);c.closePath();c.fill();x+=12;}
    else if(k<.86){c.strokeStyle='#3a3a40';c.lineWidth=1.6;c.beginPath();c.moveTo(x,y);c.lineTo(x,y+26);c.stroke();c.fillStyle='#3a3a40';c.beginPath();c.ellipse(x,y+30,4.6,3.4,0,0,TAU);c.fill();x+=12;}
    else{c.strokeStyle='#16130f';c.lineWidth=1.4;c.beginPath();c.moveTo(x,y);c.lineTo(x,y+8);c.stroke();c.fillStyle='#16130f';c.fillRect(x-1.6,y+8,3.2,14);c.beginPath();c.ellipse(x,y+30,9,9,0,0,TAU);c.fill();c.strokeStyle=rgba('#ffcf9a',.12);c.lineWidth=.8;c.beginPath();c.arc(x,y+30,8,-.6,1.2);c.stroke();x+=22;}}
  // lower down, on nails either side of the window: strings of onions and a plait of garlic, long enough to brush a head
  const ny=Math.max(w.y1-6,G.wy(96));
  for(const [nx,kind,n] of [[w.x0-16,'o',8],[w.x0-32,'g',6],[w.x1+16,'o',9],[w.x1+32,'o',7],[w.x1+48,'g',5]]){c.fillStyle='#0c0806';c.fillRect(nx-1,ny-2,2,3);
    if(kind==='o')K.onions(c,nx,ny,n,{seed:(nx*17)|0,side:nx>w.x1?-1:1,lit:.9});else K.garlic(c,nx,ny,n,{seed:(nx*5)|0});}}

// ---------- the stove ----------
// a big range of black iron on short legs: the firebox door on the left with its grate, the oven on the right, a brass rail and a
// towel on it, a kettle and a pot on its top (the skillet is the scene's own); its flue up the wall and away toward the roof's pipe
function stove(c,G){const S0=G.stove,{x0,x1,d0,d1,h}=S0,leg=7;
  const FA=q(x0,leg,d0),FB=q(x1,leg,d0),FBt=q(x1,h,d0),FAt=q(x0,h,d0),RB=q(x1,leg,d1),RBt=q(x1,h,d1),TL=q(x0,h,d1);
  // the flue: up from the back of its top, a knee, and away up the wall toward where the pipe stands on the roof
  {const fx=(x0+x1)/2+22,a=q(fx,h,d1-6),b=q(fx,CEIL-44,d1-6),e=q(fx-60,CEIL+4,d1-6),w=11;c.strokeStyle='#121010';c.lineWidth=w;c.lineCap='butt';c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineTo(e.x,e.y);c.stroke();
    c.strokeStyle=rgba('#ff9a50',.16);c.lineWidth=1.4;c.beginPath();c.moveTo(a.x+w/2-1,a.y);c.lineTo(b.x+w/2-1,b.y);c.stroke();
    c.fillStyle='#080707';for(let y=a.y-30;y>b.y;y-=30)c.fillRect(a.x-w/2-1,y,w+2,2.4);}
  // legs and the dark under it
  c.fillStyle='#050404';poly(c,[q(x0,0,d0),q(x1,0,d0),q(x1,0,d1),q(x0,0,d1)]);c.fill();
  for(const [lx,ld] of [[x0+4,d0+3],[x1-4,d0+3],[x1-4,d1-3]]){const p=q(lx,0,ld),t=q(lx,leg,ld);c.fillStyle='#16140f';c.beginPath();c.moveTo(p.x-3,p.y);c.quadraticCurveTo(p.x-1,(p.y+t.y)/2,t.x-3,t.y);c.lineTo(t.x+3,t.y);c.quadraticCurveTo(p.x+1,(p.y+t.y)/2,p.x+3,p.y);c.closePath();c.fill();}
  // the right side, the top, the front
  poly(c,[FB,RB,RBt,FBt],'#0e0d0e');
  poly(c,[FAt,FBt,RBt,TL],'#1a1817');
  {c.strokeStyle=rgba('#000000',.6);c.lineWidth=1;for(const u of [.33,.66]){const p0=q(lerp(x0,x1,u),h,d0),p1=q(lerp(x0,x1,u),h,d1);c.beginPath();c.moveTo(p0.x,p0.y);c.lineTo(p1.x,p1.y);c.stroke();}
    for(const [u,v] of [[.18,.55],[.5,.45]]){const p=q(lerp(x0,x1,u),h,lerp(d0,d1,v));c.strokeStyle=rgba('#3a3634',.8);c.lineWidth=.9;c.beginPath();c.ellipse(p.x,p.y,10,3.4,0,0,TAU);c.stroke();}}
  poly(c,[FA,FB,FBt,FAt],'#141313');
  c.fillStyle=lin(c,FA.x,0,FB.x,0,[[0,rgba('#000000',.3)],[.5,rgba('#ffffff',.03)],[1,rgba('#000000',.4)]]);c.fillRect(FA.x,FAt.y,FB.x-FA.x,FA.y-FAt.y);
  // the firebox door: a grate of slots (the fire behind it is live), a handle; the ash door under it
  const fd={x0:lerp(FA.x,FB.x,.08),x1:lerp(FA.x,FB.x,.44),y0:FAt.y+8,y1:FA.y-12};
  c.fillStyle='#0a0909';c.fillRect(fd.x0,fd.y0,fd.x1-fd.x0,fd.y1-fd.y0);c.strokeStyle='#2a2624';c.lineWidth=1.2;c.strokeRect(fd.x0,fd.y0,fd.x1-fd.x0,fd.y1-fd.y0);
  c.fillStyle='#1e0a04';for(let i=0;i<5;i++)c.fillRect(fd.x0+3,fd.y0+4+i*((fd.y1-fd.y0-8)/5),fd.x1-fd.x0-6,(fd.y1-fd.y0-8)/5-2.2);
  c.fillStyle='#4a4038';c.fillRect(fd.x1-5,(fd.y0+fd.y1)/2-1,6,2);
  c.fillStyle='#0a0909';c.fillRect(fd.x0+4,FA.y-9,fd.x1-fd.x0-8,6);c.fillStyle='#3a0e04';c.fillRect(fd.x0+6,FA.y-7,fd.x1-fd.x0-12,2);
  // the oven door: a panel, its handle, a dial
  {const ox0=lerp(FA.x,FB.x,.52),ox1=lerp(FA.x,FB.x,.92);c.fillStyle='#181616';c.fillRect(ox0,FAt.y+8,ox1-ox0,FA.y-FAt.y-16);c.strokeStyle='#2c2826';c.lineWidth=1;c.strokeRect(ox0+3,FAt.y+11,ox1-ox0-6,FA.y-FAt.y-22);
    c.fillStyle='#8a6a32';c.fillRect(ox0+4,FAt.y+13,ox1-ox0-8,2);c.fillStyle=rgba('#ffe0a0',.3);c.fillRect(ox0+4,FAt.y+13,ox1-ox0-8,.6);
    c.fillStyle='#d8ccb0';c.beginPath();c.arc((ox0+ox1)/2,FAt.y+24,3.4,0,TAU);c.fill();c.strokeStyle='#1a1614';c.lineWidth=.6;c.beginPath();c.moveTo((ox0+ox1)/2,FAt.y+24);c.lineTo((ox0+ox1)/2+2,FAt.y+22);c.stroke();}
  // the rail along its front, a towel over it
  {const a=q(x0-2,h-6,d0-3),b=q(x1+2,h-6,d0-3);c.fillStyle='#8a6a32';c.fillRect(a.x,a.y-1,b.x-a.x,2.2);c.fillStyle=rgba('#ffe0a0',.35);c.fillRect(a.x,a.y-1,b.x-a.x,.6);
    const tx=lerp(a.x,b.x,.7);c.fillStyle='#8a7e6a';c.beginPath();c.moveTo(tx-8,a.y-1);c.lineTo(tx+8,a.y-1);c.lineTo(tx+7,a.y+18);c.lineTo(tx-6,a.y+16);c.closePath();c.fill();c.fillStyle=rgba('#4a3a5a',.5);c.fillRect(tx-7,a.y+6,14,2);c.fillRect(tx-7,a.y+10,14,1);}
  // the top's edge, its light
  c.fillStyle='#2a2624';c.fillRect(FAt.x-2,FAt.y-2,FBt.x-FAt.x+4,3);c.fillStyle=rgba('#ff9a50',.25);c.fillRect(FAt.x-2,FAt.y-2,FBt.x-FAt.x+4,.8);
  // a kettle at the back, a pot on the right
  {const p=q(lerp(x0,x1,.78),h,lerp(d0,d1,.7));c.fillStyle='#1c1a1a';c.beginPath();c.moveTo(p.x-9,p.y);c.quadraticCurveTo(p.x-10,p.y-14,p.x,p.y-15);c.quadraticCurveTo(p.x+10,p.y-14,p.x+9,p.y);c.closePath();c.fill();
    c.strokeStyle='#1c1a1a';c.lineWidth=2;c.beginPath();c.moveTo(p.x+8,p.y-6);c.lineTo(p.x+15,p.y-13);c.stroke();c.beginPath();c.arc(p.x,p.y-17,6,Math.PI,0);c.lineWidth=1.4;c.stroke();
    c.fillStyle=rgba('#ff9a50',.18);c.fillRect(p.x-8,p.y-3,16,2);}
  {const p=q(lerp(x0,x1,.42),h,lerp(d0,d1,.62));c.fillStyle='#24201e';c.fillRect(p.x-10,p.y-13,20,13);c.fillStyle='#14100e';c.beginPath();c.ellipse(p.x,p.y-13,10,2.6,0,0,TAU);c.fill();c.fillRect(p.x-13,p.y-11,3,2);c.fillRect(p.x+10,p.y-11,3,2);
    c.fillStyle=rgba('#ff9a50',.16);c.fillRect(p.x-10,p.y-3,20,2);}
  return fd;}

// ---------- the floor ----------
function floor(c,G){const far=G.far,X0=-300,X1=1300,D0=-200,r=rng(19),S0=G.stove;
  c.save();floorT(c);c.fillStyle='#22170f';c.fillRect(X0,D0,X1-X0,far-D0+1);
  // boards along the room, their ends staggered, worn paler down the path from the door to the stove
  for(let d=D0;d<far;d+=13){let x=X0-r()*120;while(x<X1){const L=90+r()*170,v=r();c.fillStyle=dim(dim('#25190f','#3a2818',v),'#000000',r()*.2);c.fillRect(x,d,L,12.2);
      c.fillStyle=rgba('#000000',.12);for(let k=0;k<2;k++)c.fillRect(x,d+2+r()*8,L,.5);c.fillStyle=rgba('#ffd2a0',.04);c.fillRect(x,d+11.4,L,.8);
      c.fillStyle=rgba('#000000',.55);c.fillRect(x+L-1,d,1.2,12.2);c.fillStyle='#0c0806';c.fillRect(x+2,d+5,1,1);c.fillRect(x+L-4,d+5,1,1);x+=L;}
    c.fillStyle=rgba('#000000',.55);c.fillRect(X0,d+12.2,X1-X0,.9);}
  {c.save();c.translate(lerp(G.L.door.x,S0.x0,.5),far-56);c.scale(4.2,1);c.fillStyle=rad(c,0,0,0,40,[[0,rgba('#c8a070',.07)],[1,rgba('#c8a070',0)]]);c.fillRect(-40,-40,80,80);c.restore();}
  // the hearth before the stove: flags of stone, ash on them
  {const hx0=S0.x0-14,hx1=S0.x1+14,hd0=S0.d0-36,hd1=S0.d0+2;c.fillStyle='#2a2522';c.fillRect(hx0,hd0,hx1-hx0,hd1-hd0);
    c.strokeStyle='#100c0a';c.lineWidth=1.2;c.beginPath();for(let x=hx0+30;x<hx1;x+=30){c.moveTo(x,hd0);c.lineTo(x+(r()-.5)*6,hd1);}c.moveTo(hx0,hd0+18);c.lineTo(hx1,hd0+18);c.stroke();
    for(let i=0;i<30;i++){c.fillStyle=rgba('#8a8078',.1+.15*r());c.beginPath();c.ellipse(lerp(hx0,hx1,r()),lerp(hd0,hd1,r()),2+r()*6,1+r()*3,0,0,TAU);c.fill();}
    c.strokeStyle=rgba('#000000',.6);c.lineWidth=1.4;c.strokeRect(hx0,hd0,hx1-hx0,hd1-hd0);}
  // flour trodden in by the shelves, dark stains, a rag
  for(let i=0;i<160;i++){c.fillStyle=rgba('#e8e0d0',.05+.08*r());c.fillRect(lerp(190,430,r()),lerp(far-56,far-6,Math.pow(r(),.7)),.6+r()*1.6,.5+r());}
  for(const [x,d,rr] of [[300,40,16],[640,120,12],[470,140,20],[180,90,10]]){c.fillStyle=rgba('#0a0604',.35);c.beginPath();c.ellipse(x,d,rr,rr*.6,0,0,TAU);c.fill();}
  c.restore();}

// ---------- the table ----------
// four planks scrubbed pale and scarred by knives, an apron under them, square legs and a stretcher; a basin with a rag at its foot
// end, a bottle and a tin cup at its head
function table(c,G){const T=G.L.table,{x0,x1,d0,d1,top}=T,th=6,lg=5,r=rng(23);
  // its shadow under it, from the lamp above
  c.save();floorT(c);c.translate((x0+x1)/2,(d0+d1)/2);c.scale((x1-x0)/(d1-d0)*.62,1);c.fillStyle=rad(c,0,0,0,(d1-d0)*.85,[[0,rgba('#050302',.6)],[.7,rgba('#050302',.35)],[1,rgba('#050302',0)]]);c.fillRect(-(d1-d0),-(d1-d0),(d1-d0)*2,(d1-d0)*2);c.restore();
  // the legs at the back, the stretcher, the legs at the front
  const legAt=(x,d)=>{const a=q(x-lg/2,0,d),b=q(x+lg/2,top-th,d);c.fillStyle='#2a1c12';c.fillRect(a.x,b.y,b.x-a.x,a.y-b.y);c.fillStyle=rgba('#000000',.35);c.fillRect(b.x-1.6,b.y,1.6,a.y-b.y);};
  legAt(x0+8,d1-6);legAt(x1-8,d1-6);
  {const a=q(x0+8,9,d1-6),b=q(x0+8,9,d0+6);c.strokeStyle='#22170e';c.lineWidth=3;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();const e=q(x1-8,9,d1-6),f=q(x1-8,9,d0+6);c.beginPath();c.moveTo(e.x,e.y);c.lineTo(f.x,f.y);c.stroke();
    const m0=q(x0+8,9,(d0+d1)/2),m1=q(x1-8,9,(d0+d1)/2);c.lineWidth=2.6;c.beginPath();c.moveTo(m0.x,m0.y);c.lineTo(m1.x,m1.y);c.stroke();}
  // the apron under the top
  {const a=q(x0+6,top-th,d0+6),b=q(x1-6,top-th-10,d0+6);c.fillStyle='#24180f';c.fillRect(a.x,b.y,b.x-a.x,a.y-b.y);}
  legAt(x0+8,d0+6);legAt(x1-8,d0+6);
  // the top: its right end, its front edge, its face
  const A=q(x0,top,d0),B=q(x1,top,d0),Bb=q(x1,top,d1),Ab=q(x0,top,d1);
  poly(c,[q(x1,top-th,d0),q(x1,top-th,d1),Bb,B],'#2a1c10');
  c.fillStyle='#4a3420';c.fillRect(A.x,A.y,B.x-A.x,th);c.fillStyle=rgba('#000000',.3);c.fillRect(A.x,A.y+th-1.5,B.x-A.x,1.5);
  poly(c,[A,B,Bb,Ab],'#8a6a48');
  c.save();poly(c,[A,B,Bb,Ab]);c.clip();
  for(let i=1;i<4;i++){const d=lerp(d0,d1,i/4),p0=q(x0,top,d),p1=q(x1,top,d);c.strokeStyle=rgba('#2a1a0c',.55);c.lineWidth=1;c.beginPath();c.moveTo(p0.x,p0.y);c.lineTo(p1.x,p1.y);c.stroke();}
  for(let i=0;i<4;i++){const d=lerp(d0,d1,(i+.5)/4),v=r();c.fillStyle=rgba(v<.5?'#000000':'#ffe0b0',.05+.06*r());const p0=q(x0,top,d-7),p1=q(x1,top,d+7);c.fillRect(p0.x,p1.y,p1.x-p0.x,p0.y-p1.y);}
  c.strokeStyle=rgba('#2a1a0c',.4);c.lineWidth=.5;c.beginPath();for(let i=0;i<26;i++){const x=lerp(x0+8,x1-8,r()),d=lerp(d0+4,d1-4,r()),p=q(x,top,d),a=(r()-.5)*.6,l=4+r()*10;c.moveTo(p.x,p.y);c.lineTo(p.x+Math.cos(a)*l,p.y+Math.sin(a)*l*.3);}c.stroke();
  for(let i=0;i<5;i++){const p=q(lerp(x0+10,x1-10,r()),top,lerp(d0+6,d1-6,r()));c.strokeStyle=rgba('#2a1406',.25);c.lineWidth=1;c.beginPath();c.ellipse(p.x,p.y,6+r()*4,2+r(),0,0,TAU);c.stroke();}
  c.restore();
  c.fillStyle=rgba('#ffe0b0',.18);c.fillRect(A.x,A.y,B.x-A.x,.9);
  // the basin with a rag over its rim at the foot end, the bottle and the cup at the head
  {const p=q(x0+20,top,d1-14);c.fillStyle='#c8c4b8';c.beginPath();c.ellipse(p.x,p.y-1,11,3.2,0,0,TAU);c.fill();c.fillStyle='#8a8478';c.beginPath();c.moveTo(p.x-11,p.y-1);c.quadraticCurveTo(p.x,p.y+8,p.x+11,p.y-1);c.closePath();c.fill();
    c.fillStyle=rgba('#7a5a3a',.6);c.beginPath();c.ellipse(p.x,p.y-1,9,2.2,0,0,TAU);c.fill();c.fillStyle='#d8d0c0';c.beginPath();c.moveTo(p.x+6,p.y-3);c.lineTo(p.x+12,p.y-2);c.lineTo(p.x+11,p.y+7);c.lineTo(p.x+7,p.y+5);c.closePath();c.fill();}
  {const p=q(x1-16,top,d1-12);c.fillStyle='#2a1a0c';c.beginPath();c.moveTo(p.x-3.4,p.y);c.lineTo(p.x-3.4,p.y-10);c.lineTo(p.x-1.4,p.y-13);c.lineTo(p.x-1.4,p.y-18);c.lineTo(p.x+1.4,p.y-18);c.lineTo(p.x+1.4,p.y-13);c.lineTo(p.x+3.4,p.y-10);c.lineTo(p.x+3.4,p.y);c.closePath();c.fill();
    c.fillStyle=rgba('#ffcf86',.35);c.fillRect(p.x+1.4,p.y-10,.8,8);c.fillStyle='#c8b890';c.fillRect(p.x-3.4,p.y-7,6.8,3);
    const u=q(x1-26,top,d1-20);c.fillStyle='#5a5a5e';c.fillRect(u.x-3,u.y-6,6,6);c.strokeStyle='#5a5a5e';c.lineWidth=1;c.beginPath();c.arc(u.x+3.4,u.y-3,2,-1.2,1.2);c.stroke();}}

// ---------- the lamp over the table, and what else lights the room ----------
function lamp(c,G){const Lm=G.lamp,p=q(Lm.x,Lm.h,Lm.d),top=q(Lm.x,Lm.h+200,Lm.d);
  c.strokeStyle='#0c0a08';c.lineWidth=1;c.beginPath();c.moveTo(p.x,p.y-12);c.lineTo(top.x,top.y);c.stroke();
  // its shade, its chimney, its brass font
  c.fillStyle='#2a2420';c.beginPath();c.moveTo(p.x-14,p.y);c.lineTo(p.x-5,p.y-10);c.lineTo(p.x+5,p.y-10);c.lineTo(p.x+14,p.y);c.closePath();c.fill();c.fillStyle=rgba('#ffcf86',.3);c.fillRect(p.x-14,p.y-.6,28,1.2);
  c.fillStyle=rgba('#f0e6d0',.5);c.fillRect(p.x-2.4,p.y,4.8,9);c.fillStyle='#8a6a32';c.beginPath();c.ellipse(p.x,p.y+12,6,3.4,0,0,TAU);c.fill();
  // its light: down over the table, a little on the wall
  // (the cone in nested layers, so its edges are soft)
  c.save();c.globalCompositeOperation='lighter';for(const k of [1,.78,.56,.36]){c.fillStyle=lin(c,0,p.y,0,p.y+130,[[0,rgba('#ffd890',.055)],[1,rgba('#ffd890',0)]]);c.beginPath();c.moveTo(p.x-12*k,p.y);c.lineTo(p.x+12*k,p.y);c.lineTo(p.x+118*k,p.y+130);c.lineTo(p.x-118*k,p.y+130);c.closePath();c.fill();}
  floorT(c);c.translate(Lm.x,Lm.d-14);c.scale(1.9,1);c.fillStyle=rad(c,0,0,4,90,[[0,rgba('#ffcf86',.18)],[.6,rgba('#ffb060',.06)],[1,rgba('#ffb060',0)]]);c.fillRect(-90,-90,180,180);c.restore();
  glowAt(c,p.x,p.y+5,60,'#ffd27a',.4);}
function stoveLight(c,G){const S0=G.stove;
  c.save();c.globalCompositeOperation='lighter';floorT(c);c.translate((S0.x0+S0.x1)/2-20,S0.d0-40);c.scale(1.7,1);c.fillStyle=rad(c,0,0,4,80,[[0,rgba('#ff8a3c',.2)],[.6,rgba('#ff7a30',.07)],[1,rgba('#ff7a30',0)]]);c.fillRect(-80,-80,160,160);c.restore();}

// ---------- the scene ----------
let LIVE=null;
function paint(c){const G=geo();
  wall(c,G);windowView(c,G);windowFrame(c,G);barDoor(c,G);hanging(c,G);shelves(c,G);
  // pegs by the ladder with an apron and a coat; a broom
  {const x=G.L.ladder.x-50+G.ox,y=G.wy(118);c.fillStyle='#1a120c';c.fillRect(x-20,y-2,46,4);for(const px of [x-12,x+10]){c.fillStyle='#2a1c12';c.fillRect(px-1,y+1,2,5);}
    c.fillStyle='#3a3226';c.beginPath();c.moveTo(x-18,y+4);c.lineTo(x-4,y+4);c.lineTo(x-2,y+74);c.lineTo(x-22,y+70);c.closePath();c.fill();c.fillStyle=rgba('#000000',.3);c.fillRect(x-12,y+10,2,60);
    c.fillStyle='#5a5244';c.beginPath();c.moveTo(x+4,y+4);c.lineTo(x+16,y+4);c.lineTo(x+18,y+52);c.lineTo(x+3,y+50);c.closePath();c.fill();c.strokeStyle='#3a3226';c.lineWidth=1;c.beginPath();c.moveTo(x+10,y+4);c.lineTo(x+10,y-6);c.stroke();
    const b=q(G.L.ladder.x+34,0,G.far-6);c.strokeStyle='#4a3420';c.lineWidth=2;c.beginPath();c.moveTo(b.x,b.y-20);c.lineTo(b.x+10,b.y-120);c.stroke();c.fillStyle='#6a5a34';c.beginPath();c.moveTo(b.x-6,b.y);c.lineTo(b.x+6,b.y);c.lineTo(b.x+2,b.y-22);c.lineTo(b.x-2,b.y-22);c.closePath();c.fill();}
  floor(c,G);ladder(c,G);
  // by the stove: firewood stacked to the right of it, a coal scuttle, a bucket of water
  {const S0=G.stove,r=rng(5);for(let row=0;row<4;row++)for(let i=0;i<4-(row>2?1:0);i++){const p=q(S0.x1+18+i*13+(row%2)*6,6+row*11,G.far-12);c.fillStyle=pick(r,['#5a3a22','#4a2e1a','#6a4628']);c.beginPath();c.ellipse(p.x,p.y,6,5.4,0,0,TAU);c.fill();c.fillStyle=pick(r,['#a87a4a','#8a6a40','#b88a56']);c.beginPath();c.ellipse(p.x+.6,p.y-.4,4,3.4,0,0,TAU);c.fill();c.strokeStyle=rgba('#4a2e1a',.6);c.lineWidth=.4;c.beginPath();c.arc(p.x+.6,p.y-.4,2,0,TAU);c.stroke();}
    const s=q(S0.x0-22,0,S0.d0+10);c.fillStyle='#16130f';c.beginPath();c.moveTo(s.x-8,s.y);c.lineTo(s.x-10,s.y-14);c.lineTo(s.x+12,s.y-18);c.lineTo(s.x+8,s.y);c.closePath();c.fill();c.fillStyle='#0a0808';c.beginPath();c.ellipse(s.x+1,s.y-16,10,3,-.2,0,TAU);c.fill();
    const bk=q(S0.x1+30,0,S0.d0-16);c.fillStyle='#3a3a3e';c.beginPath();c.moveTo(bk.x-8,bk.y-16);c.lineTo(bk.x+8,bk.y-16);c.lineTo(bk.x+6.4,bk.y);c.lineTo(bk.x-6.4,bk.y);c.closePath();c.fill();c.fillStyle=rgba('#7a9ab8',.35);c.beginPath();c.ellipse(bk.x,bk.y-16,8,2,0,0,TAU);c.fill();c.strokeStyle='#5a5a5e';c.lineWidth=.8;c.beginPath();c.arc(bk.x,bk.y-16,8,Math.PI,0);c.stroke();}
  const fd=stove(c,G);stoveLight(c,G);
  table(c,G);lamp(c,G);
  // the room's corners and the near edge in the dark
  c.fillStyle=lin(c,-200,0,1100,0,[[0,rgba('#030202',.55)],[.2,rgba('#030202',0)],[.82,rgba('#030202',0)],[1,rgba('#030202',.5)]]);c.fillRect(-200,-100,1400,800);
  c.fillStyle=lin(c,0,GB-20,0,GB+140,[[0,rgba('#000000',0)],[1,rgba('#000000',.7)]]);c.fillRect(-200,GB-20,1400,160);
  LIVE={G,fd,arm:armAt(G)};}
// the fire through the grate, its light on the hearth, the kettle's breath, the lamp's flame, the arm's light in the window
const STEAM=(()=>{const r=rng(3),a=[];for(let i=0;i<5;i++)a.push({ph:i/5,dx:(r()-.5)*.8});return a;})();
function live(){if(!LIVE)return;const G=LIVE.G,fd=LIVE.fd,S0=G.stove,t=S.t,k=.62+.24*Math.sin(t*7.3)*Math.sin(t*3.1+1)+.12*Math.sin(t*17.2);ctx.save();
  ctx.globalCompositeOperation='lighter';
  {const n=5,sh=(fd.y1-fd.y0-8)/n;for(let i=0;i<n;i++){const f=k*(.75+.25*Math.sin(t*11+i*1.7));ctx.fillStyle=`rgba(255,${(90+i*14)|0},30,${(.55*f).toFixed(3)})`;ctx.fillRect(fd.x0+3,fd.y0+4+i*sh,fd.x1-fd.x0-6,sh-2.2);}
    ctx.fillStyle=`rgba(255,80,20,${(.5*k).toFixed(3)})`;const ay=q(0,7,S0.d0).y-7;ctx.fillRect(fd.x0+6,ay,fd.x1-fd.x0-12,2);
    glowAt(ctx,(fd.x0+fd.x1)/2,(fd.y0+fd.y1)/2,60,'#ff7a30',.25*k);glowAt(ctx,(fd.x0+fd.x1)/2,q(0,0,S0.d0-30).y,80,'#ff8a3c',.16*k,.4);}
  // the lamp's flame breathing
  {const Lm=G.lamp,p=q(Lm.x,Lm.h,Lm.d),f=.9+.1*Math.sin(t*9.7)*Math.sin(t*4.3);ctx.fillStyle=`rgba(255,236,190,${(.9*f).toFixed(3)})`;ctx.fillRect(p.x-1.2,p.y+2,2.4,4.6);glowAt(ctx,p.x,p.y+4,22,'#ffd27a',.35*f);}
  ctx.globalCompositeOperation='source-over';
  // steam off the kettle
  {const p=q(lerp(S0.x0,S0.x1,.78)+15,S0.h+13,lerp(S0.d0,S0.d1,.7));for(const s of STEAM){const u=(t*.35+s.ph)%1;puffAt(ctx,p.x+u*10+s.dx*u*14,p.y-u*36,3+u*10,'#e8e4dc',.32*(1-u)*Math.min(1,u*6));}ctx.globalAlpha=1;}
  // high up the Pit's wall in the window, the arm's light
  {const w=G.win,A=LIVE.arm;ctx.save();ctx.beginPath();ctx.rect(w.x0,w.y0,w.x1-w.x0,w.y1-w.y0);ctx.clip();K.arm(ctx,A.x,A.y,.32,t,{gore:S.gore!=='off'});ctx.restore();
    // and a little of it on the glass
    glowAt(ctx,A.x,A.y+4,18,C.cyan,.08*(.8+.2*Math.sin(t*1.6)));}
  ctx.restore();}
// the light that rims them: the stove's fire for whoever is near it, the lamp over the table for the rest
function light(f){const G=LIVE?LIVE.G:geo(),S0=G.stove,px=f.p[PEL].x;
  if(px>S0.x0-120){const p=q((S0.x0+S0.x1)/2,S0.h*.5,S0.d0);return{light:{x:p.x-f.dep*PSX,y:p.y+f.dep*PSY}};}
  const Lm=G.lamp,p=q(Lm.x,Lm.h,Lm.d);return{light:{x:p.x-f.dep*PSX,y:p.y+f.dep*PSY}};}
function layoutNow(){const G=geo();return{ceil:CEIL,stove:G.stove,lamp:G.lamp,window:G.win,arm:armAt(G)};}
E.S.sumpkitchen={paint,live,light,get LAYOUT(){return layoutNow();}};
})();
// ===== ENV SUMPKITCHEN END =====
