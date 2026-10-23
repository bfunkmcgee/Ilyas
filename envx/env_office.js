// ===== ENV OFFICE =====
// Mr. Hallowell's office at the top of his tower, in his pale gold. Champagne moiré silk on the walls in walnut frames under a gilded
// cornice; a walnut drinks cabinet lit from inside under a dusk landscape, a walnut bookcase on a brass rail, a canvas of gold leaf with a
// black ring brushed on it over an ivory ash credenza; brass sconces throwing their scallops of light; a wall of glass on the night city,
// the tower's own cyan ring glancing off the head of the glass. Honey oak herringbone underfoot and a pale rug under the desk.
// On the left the door Kael blew in from the lobby gapes, scorched, the lobby's black and gold beyond it and its smoke coming through.
(()=>{const E=EnvLook,{C,pp,line,lin,rad,rgba,mix,glow,beam,haze,scroll,gilt,rng,lerp,clamp,TAU}=E;
const TX=()=>EnvTex,OT=()=>OfficeTex;
const FAR=236,yB=()=>GB-FAR*PSY,OXf=()=>FAR*PSX;
const WAL={dark:'#120a06',mid:'#2e1a0e',light:'#56321a',rings:9,sharp:4},BURL={dark:'#1a0e06',mid:'#3e2412',light:'#6e4422',rings:14,sharp:2,stretch:.6};
const ASH={dark:'#6a5a44',mid:'#a8946e',light:'#cdb88e',rings:7,sharp:3},OAK={dark:'#24160a',mid:'#5a3c1c',light:'#86602e',rings:6};
const GOLD='#d8b062',GOLDL='#f4dc9a',GOLDD='#7a5a26',BRASS='#c9a25a',BRASSL='#ecd08a',BRASSD='#7a5a26',IVORY='#e8dcc0',CHAMP='#d8cfa8';
// a texture laid from (x, y), u units to a texture pixel, turned rot degrees
function patAt(c,cv,x,y,u,rot){const p=c.createPattern(cv,'repeat');if(p.setTransform){let m=new DOMMatrix().translate(x,y);if(rot)m=m.rotate(rot);p.setTransform(m.scale(u));}return p;}
function fillPts(c,pts,style){c.beginPath();c.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)c.lineTo(pts[i].x,pts[i].y);c.closePath();if(style){c.fillStyle=style;c.fill();}}
// walnut in a rectangle, the grain along it (vert: up it), darkened by k
function walnut(c,x,y,w,h,vert,k,o){if(w<=0||h<=0)return;c.fillStyle=patAt(c,TX().wood((o&&o.seed)||51,512,128,(o&&o.wood)||WAL),x,y,.2,vert?90:0);c.fillRect(x,y,w,h);if(k){c.fillStyle=rgba('#000000',k);c.fillRect(x,y,w,h);}}
// a moulded frame edge: lit along its top, shadowed along its foot
function edges(c,x,y,w,h,a){c.fillStyle=rgba('#ffdcaa',.16*(a||1));c.fillRect(x,y,w,.7);c.fillRect(x,y,.6,h);c.fillStyle=rgba('#000000',.42*(a||1));c.fillRect(x,y+h-.8,w,.8);c.fillRect(x+w-.7,y,.7,h);}
const gl=(c,x,y,rx,ry,col,a)=>{c.save();c.globalCompositeOperation='lighter';c.translate(x,y);c.scale(1,ry/rx);c.fillStyle=rad(c,0,0,0,rx,[[0,rgba(col,a)],[1,rgba(col,0)]]);c.fillRect(-rx,-rx,2*rx,2*rx);c.restore();};
const dark=(c,x,y,rx,ry,a)=>{c.save();c.translate(x,y);c.scale(1,ry/rx);c.fillStyle=rad(c,0,0,0,rx,[[0,rgba('#060302',a)],[1,rgba('#060302',0)]]);c.fillRect(-rx,-rx,2*rx,2*rx);c.restore();};
// the night city through the glass: towers by layer, the river far below with the street lamps along it, the old elven town on its hill
let CITY=null;
function city(){if(CITY)return CITY;const ox=OXf(),yb=yB(),gx0=OFW.glass+ox,gy0=40,gy1=yb-26,r=rng(5150),T=[],beacons=[];
  for(let x=gx0-30;x<gx0+600;x+=12+r()*16)T.push({l:0,x,w:14+r()*16,top:gy1-36-(30+r()*44)});
  for(let x=gx0-30;x<gx0+600;x+=16+r()*22)T.push({l:1,x,w:16+r()*22,top:gy1-34-(44+r()*70)});
  for(const [dx,w,top] of [[64,30,104],[210,26,128],[380,34,92],[520,26,118]]){T.push({l:2,x:gx0+dx,w,top,lm:true});beacons.push({x:gx0+dx+w/2,y:top-26,p:r()*6});}
  for(let x=gx0-40;x<gx0+600;x+=40+r()*40)T.push({l:3,x,w:36+r()*40,top:gy1-34-(10+r()*24)});
  return CITY={T,beacons,gx0,gy0,gy1};}
// ---------- the room, painted once ----------
function paint(c){
  const X0=-150,X1=W+230,T0=-90,yb=yB(),ox=OXf(),GX=OFW.glass+ox,rail=yb-86,r=rng(7);
  // ---- the ceiling: walnut coffers in shadow
  c.fillStyle='#060408';c.fillRect(X0,T0,X1-X0,24-T0);
  for(let x=-130;x<X1;x+=124){walnut(c,x,T0,12,24-T0,true,.72);c.fillStyle=rgba('#ffd2a0',.06);c.fillRect(x+11,T0,1,24-T0);}
  walnut(c,X0,4,X1-X0,6,false,.7);c.fillStyle=rgba('#ffd2a0',.1);c.fillRect(X0,9.4,X1-X0,.6);
  // ---- the walls: champagne moiré silk in walnut frames above the rail, walnut panels below it
  {const silk=OT().silk(3,{base:'#c4a668',hi:'#f2dfac',lo:'#6e5630'});
    for(let x=-150;x<GX;x+=58){const y0=46,y1=rail-8;
      walnut(c,x,y0-2,58,y1-y0+4,true,.18,{seed:52});
      c.fillStyle=patAt(c,silk,x,y0,.3);c.fillRect(x+6,y0+5,46,y1-y0-10);
      // a gilt bead round the silk, the frame's shadow on its top edge
      c.strokeStyle=rgba(GOLD,.55);c.lineWidth=.6;c.strokeRect(x+6.3,y0+5.3,45.4,y1-y0-10.6);
      c.fillStyle=lin(c,0,y0+5,0,y0+12,[[0,rgba('#000000',.45)],[1,rgba('#000000',0)]]);c.fillRect(x+6,y0+5,46,7);
      edges(c,x,y0-2,58,y1-y0+4,.8);
      // the dado: a raised and fielded walnut panel
      const d0=rail+9,d1=yb-12;walnut(c,x+1,d0,56,d1-d0,true,.15,{seed:53});
      walnut(c,x+8,d0+6,42,d1-d0-12,false,.05,{seed:54,wood:BURL});c.fillStyle=rgba('#000000',.4);c.fillRect(x+8,d0+6,42,.8);c.fillRect(x+8,d0+6,.8,d1-d0-12);
      c.fillStyle=rgba('#ffdcaa',.14);c.fillRect(x+8,d1-6.8,42,.7);c.fillRect(x+49.3,d0+6,.7,d1-d0-12);edges(c,x+1,d0,56,d1-d0,.8);}
    // the night over the walls, deepest under the ceiling
    c.fillStyle=lin(c,0,40,0,yb,[[0,rgba('#07040a',.66)],[.35,rgba('#07040a',.4)],[1,rgba('#07040a',.36)]]);c.fillRect(X0,40,GX-X0,yb-40);}
  // the chair rail and the skirting: walnut with a gilt bead
  walnut(c,X0,rail,GX-X0,8,false,.2);c.fillStyle=rgba('#ffdcaa',.32);c.fillRect(X0,rail,GX-X0,.9);c.fillStyle=rgba(GOLD,.6);c.fillRect(X0,rail+3.4,GX-X0,.8);c.fillStyle=rgba('#000000',.5);c.fillRect(X0,rail+8,GX-X0,1.2);
  walnut(c,X0,yb-11,GX-X0,11,false,.35);c.fillStyle=rgba('#ffdcaa',.2);c.fillRect(X0,yb-11,GX-X0,.9);
  // ---- the cornice: walnut, a band of gold leaf picked out with egg-and-dart, and the cove of light let into it
  walnut(c,X0,22,X1-X0,14,false,.45);
  c.fillStyle=patAt(c,OT().goldLeaf(5,{}),X0,26,.12);c.fillRect(X0,26,X1-X0,5);c.fillStyle=rgba('#1a0e04',.35);c.fillRect(X0,26,X1-X0,5);
  for(let x=X0;x<X1;x+=4){c.fillStyle=rgba('#2a1606',.65);c.beginPath();c.ellipse(x+2,28.6,1.3,1.8,0,0,TAU);c.fill();c.fillStyle=rgba(GOLDL,.55);c.beginPath();c.ellipse(x+1.7,28.1,.8,1.2,0,0,TAU);c.fill();c.fillStyle=rgba('#2a1606',.7);c.fillRect(x+3.6,27,.5,3.4);}
  c.fillStyle=rgba(GOLDL,.7);c.fillRect(X0,25.6,X1-X0,.6);c.fillStyle=rgba('#000000',.55);c.fillRect(X0,31.2,X1-X0,1.2);
  c.fillStyle=rgba('#fff0cc',.95);c.fillRect(X0,35,X1-X0,1.6);
  {c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,0,36,0,150,[[0,rgba('#ffc884',.26)],[.4,rgba('#ffc884',.07)],[1,rgba('#ffc884',0)]]);c.fillRect(X0,36,GX-X0,114);c.restore();}
  // ---- the blown doorway: a scorched, splintered walnut frame; beyond it the lobby's black stone and gold, lit amber
  {const dx0=OFFICE_ENTRY.x-42+ox,dx1=dx0+84,top=yb-164,cx=(dx0+dx1)/2,rr=rng(3131);
    dark(c,cx,top+4,132,72,.66);dark(c,cx-26,top-18,62,52,.42);dark(c,cx+36,top-30,52,62,.36);dark(c,cx,top+70,112,112,.32);dark(c,cx-8,top-60,28,92,.5);dark(c,cx+22,top-50,18,76,.4);
    c.save();c.beginPath();c.rect(dx0,top,84,164);c.clip();
    c.fillStyle=lin(c,0,top,0,yb,[[0,'#060509'],[.45,'#141019'],[.75,'#3a2818'],[1,'#c48a4a']]);c.fillRect(dx0,top,84,164);
    // the lobby: a pillar of black marble veined in white, gold strips let into its walls, its polished floor taking the light
    c.fillStyle=lin(c,dx0+10,0,dx0+26,0,[[0,'#050407'],[.5,'#17141c'],[1,'#060509']]);c.fillRect(dx0+10,top,16,164);
    c.strokeStyle=rgba('#d8d0c8',.16);c.lineWidth=.5;c.beginPath();c.moveTo(dx0+14,top+10);c.lineTo(dx0+19,top+44);c.lineTo(dx0+16,top+80);c.lineTo(dx0+22,top+120);c.stroke();
    for(const x of [dx0+40,dx0+70]){c.fillStyle=rgba('#ffcc84',.5);c.fillRect(x,top+16,1.2,96);gl(c,x,top+64,14,60,'#ffb866',.18);}
    c.fillStyle=lin(c,0,yb-30,0,yb,[[0,rgba('#ffc078',0)],[1,rgba('#ffc078',.45)]]);c.fillRect(dx0,yb-30,84,30);c.fillStyle=rgba(GOLD,.45);c.fillRect(dx0,yb-12,84,.6);
    gl(c,cx,yb-16,64,40,'#ffc47a',.55);gl(c,cx,yb-72,80,70,'#ffaa64',.14);c.restore();
    // the frame: walnut jambs and lintel, charred along the inner edges, pale where the wood split
    walnut(c,dx0-10,top-10,10,174,true,.35);walnut(c,dx1,top-10,10,174,true,.35);walnut(c,dx0-10,top-12,104,12,false,.35);
    c.fillStyle=rgba('#ffdcaa',.28);c.fillRect(dx0-10,top-12,104,1);c.fillStyle=rgba('#060302',.5);c.fillRect(dx0-10,top-12,104,4);
    for(const left of [true,false]){const x=left?dx0:dx1;c.fillStyle='rgba(5,3,2,.85)';c.beginPath();c.moveTo(x,top);let y=top;
      while(y<yb){y=Math.min(yb,y+5+rr()*14);const e=(left?1:-1)*(rr()<.3?4+rr()*3:rr()<.5?1.2+rr()*1.4:2+rr()*2);c.lineTo(x+e,y-rr()*2);}c.lineTo(x,yb);c.closePath();c.fill();}
    c.fillStyle='rgba(5,3,2,.7)';c.fillRect(dx0,top,84,3);
    const splint=(x,y,len,dir,w)=>{c.beginPath();c.moveTo(x,y);c.lineTo(x+dir*len,y+(rr()-.3)*5);c.lineTo(x+dir*len*.45,y+w*.7);c.lineTo(x+dir*len*.5,y+w);c.lineTo(x,y+w*.9);c.closePath();c.fill();};
    c.fillStyle='rgba(214,172,116,.72)';for(let i=0;i<10;i++){if(rr()<.3)continue;splint(dx0,top+5+i*15+rr()*8,3+rr()*9,1,1.6+rr()*2.4);if(rr()<.35)continue;splint(dx1,top+9+i*14+rr()*8,3+rr()*10,-1,1.6+rr()*2.4);}
    for(const x of [dx0+14,dx0+38,dx0+57]){c.beginPath();c.moveTo(x+rr()*6,top);c.lineTo(x+rr()*6+1,top+2+rr()*9);c.lineTo(x+rr()*6+3.4,top);c.closePath();c.fill();}
    // the stump of the left leaf on its hinges, a bite out of the right jamb
    walnut(c,dx0,top+8,9,56,true,.3,{seed:57});c.fillStyle='rgba(206,164,108,.6)';c.beginPath();c.moveTo(dx0+9,top+10);c.lineTo(dx0+8,top+38);c.lineTo(dx0+11,top+52);c.lineTo(dx0+4,top+64);c.lineTo(dx0+6.5,top+50);c.lineTo(dx0+5,top+36);c.lineTo(dx0+6.5,top+12);c.closePath();c.fill();
    c.fillStyle='#060403';c.beginPath();c.moveTo(dx0+9,top+38);c.lineTo(dx0+11,top+52);c.lineTo(dx0+4,top+64);c.lineTo(dx0,top+64);c.lineTo(dx0,top+40);c.closePath();c.fill();
    c.fillStyle='#2a170e';c.beginPath();c.moveTo(dx1,top+66);c.lineTo(dx1+7,top+72);c.lineTo(dx1+3,top+84);c.lineTo(dx1+9,top+96);c.lineTo(dx1,top+98);c.closePath();c.fill();
    c.fillStyle='rgba(206,164,108,.5)';c.beginPath();c.moveTo(dx1,top+66);c.lineTo(dx1-5,top+74);c.lineTo(dx1-1,top+84);c.lineTo(dx1-6,top+92);c.lineTo(dx1,top+98);c.closePath();c.fill();
    for(const y of [top+14,top+58,top+120]){c.fillStyle=lin(c,dx0-3,0,dx0+3,0,[[0,BRASSD],[.5,BRASSL],[1,BRASSD]]);c.fillRect(dx0-3,y,6,10);c.fillStyle=rgba('#000000',.4);c.fillRect(dx0-3,y+9,6,1);}
    c.fillStyle='#120a06';c.fillRect(dx0-8,yb-4,100,4);c.fillStyle=rgba('#060302',.5);c.fillRect(dx0-10,yb-30,10,30);c.fillRect(dx1,yb-30,10,30);}
  // ---- the drinks cabinet in walnut, lit from inside, and the dusk landscape over it
  {const x0=OFW.cab+ox,w=92,top=yb-128,gh=76,r2=rng(808);
    // the painting: the river valley at dusk, the old town's hills beyond, in a carved gilt frame under a picture light
    {const px=x0+8,py=top-86,pw=76,ph=58;
      gl(c,px+pw/2,py+ph*.4,66,52,'#ffd090',.1);
      c.fillStyle=patAt(c,OT().goldLeaf(6,{sq:16}),px-6,py-6,.12);c.fillRect(px-6,py-6,pw+12,ph+12);c.fillStyle=rgba('#1a0e04',.42);c.fillRect(px-6,py-6,pw+12,ph+12);
      c.fillStyle=rgba(GOLDL,.5);c.fillRect(px-6,py-6,pw+12,.8);c.fillStyle=rgba('#000000',.5);c.fillRect(px-6,py+ph+5.2,pw+12,.8);c.fillStyle='#24160a';c.fillRect(px-2,py-2,pw+4,ph+4);
      c.save();c.beginPath();c.rect(px,py,pw,ph);c.clip();
      c.fillStyle=lin(c,0,py,0,py+ph,[[0,'#1a2a40'],[.38,'#5a6a7a'],[.56,'#e8a868'],[.64,'#c87a4a'],[1,'#2a1c14']]);c.fillRect(px,py,pw,ph);
      gl(c,px+pw*.62,py+ph*.56,26,10,'#ffe0a0',.5);
      c.fillStyle='#3a3048';c.beginPath();c.moveTo(px,py+ph*.6);c.quadraticCurveTo(px+pw*.3,py+ph*.44,px+pw*.55,py+ph*.56);c.quadraticCurveTo(px+pw*.8,py+ph*.48,px+pw,py+ph*.58);c.lineTo(px+pw,py+ph);c.lineTo(px,py+ph);c.closePath();c.fill();
      c.fillStyle='#3a3040';c.fillRect(px+pw*.7-1.1,py+ph*.44,2.2,7);c.beginPath();c.moveTo(px+pw*.7-1.6,py+ph*.44);c.lineTo(px+pw*.7,py+ph*.44-4);c.lineTo(px+pw*.7+1.6,py+ph*.44);c.closePath();c.fill();c.fillStyle=rgba('#ffd890',.7);c.fillRect(px+pw*.7-.3,py+ph*.44+2,.6,.8);
      c.fillStyle='#1e1a14';c.beginPath();c.moveTo(px,py+ph*.74);c.quadraticCurveTo(px+pw*.4,py+ph*.64,px+pw,py+ph*.76);c.lineTo(px+pw,py+ph);c.lineTo(px,py+ph);c.closePath();c.fill();
      c.strokeStyle=rgba('#ffd8a0',.55);c.lineWidth=1.4;c.beginPath();c.moveTo(px+pw*.15,py+ph*.86);c.quadraticCurveTo(px+pw*.5,py+ph*.78,px+pw*.9,py+ph*.84);c.stroke();
      c.fillStyle=patAt(c,OT().canvasWeave(3),px,py,.25);c.fillRect(px,py,pw,ph);
      c.fillStyle=rgba('#ffe6c0',.06);c.beginPath();c.moveTo(px,py);c.lineTo(px+pw*.45,py);c.lineTo(px+pw*.15,py+ph);c.lineTo(px,py+ph);c.closePath();c.fill();c.restore();
      c.fillStyle=lin(c,0,py-13,0,py-9.5,[[0,BRASSL],[1,BRASSD]]);c.fillRect(px+pw/2-14,py-13,28,3.4);c.fillRect(px+pw/2-1,py-10,2,5);
      c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,0,py-10,0,py+ph*.8,[[0,rgba('#ffd69a',.24)],[1,rgba('#ffd69a',0)]]);c.beginPath();c.moveTo(px+pw/2-16,py-10);c.lineTo(px+pw/2+16,py-10);c.lineTo(px+pw+8,py+ph*.8);c.lineTo(px-8,py+ph*.8);c.closePath();c.fill();c.restore();}
    gl(c,x0+w/2,top+gh/2,92,80,'#ffb05a',.18);
    walnut(c,x0-5,top-5,w+10,133,true,.25);walnut(c,x0-8,top-9,w+16,6,false,.2);c.fillStyle=rgba('#ffdcaa',.32);c.fillRect(x0-8,top-9,w+16,1);
    // inside: a mirrored back with old silvering, glass shelves, the bottles and the crystal lit from above
    c.save();c.beginPath();c.rect(x0,top,w,gh);c.clip();
    c.drawImage(TX().silver(4,128,128),x0,top,w,gh);c.fillStyle=lin(c,0,top,0,top+gh,[[0,rgba('#ffcf8a',.42)],[.5,rgba('#c8863a',.32)],[1,rgba('#5a3410',.4)]]);c.fillRect(x0,top,w,gh);
    for(let s=0;s<3;s++){const sy=top+22+s*23;
      for(let x=x0+4;x<x0+w-7;){const k=r2(),col=['#c8862a','#8a2a1a','#3e7a3e','#d8e8d8','#5a3a6a','#d89a3a'][Math.floor(r2()*6)];
        if(k<.55){const bw=5+r2()*2.4,bh=15+r2()*4;c.globalAlpha=.9;c.fillStyle=lin(c,x,0,x+bw,0,[[0,mix(col,'#000000',.45)],[.4,col],[1,mix(col,'#000000',.5)]]);c.fillRect(x,sy-bh,bw,bh);c.fillRect(x+bw*.3,sy-bh-6,bw*.4,6);c.globalAlpha=1;
          c.fillStyle=rgba('#ffffff',.45);c.fillRect(x+1,sy-bh+3,.8,bh-5);c.fillStyle=rgba('#ece0c4',.85);c.fillRect(x,sy-bh*.52,bw,bh*.24);c.fillStyle=rgba(GOLD,.9);c.fillRect(x+bw*.3,sy-bh-6.6,bw*.4,1.2);x+=bw+1.8;}
        else if(k<.82){const bw=10+r2()*3,bh=11+r2()*2;c.globalAlpha=.85;c.fillStyle=col;c.beginPath();c.moveTo(x+2,sy);c.quadraticCurveTo(x-1,sy-bh*.6,x+bw*.3,sy-bh);c.lineTo(x+bw*.7,sy-bh);c.quadraticCurveTo(x+bw+1,sy-bh*.6,x+bw-2,sy);c.closePath();c.fill();c.globalAlpha=1;
          c.fillStyle='#e8d8b0';c.fillRect(x+bw*.35,sy-bh-4.4,bw*.3,4.4);c.fillStyle=rgba('#ffffff',.45);c.fillRect(x+2,sy-bh*.8,.9,bh*.6);x+=bw+2.4;}
        else{for(let i=0;i<3;i++){c.strokeStyle=rgba('#fff6dc',.75);c.lineWidth=.8;c.beginPath();c.moveTo(x+i*5-1.6,sy-7);c.lineTo(x+i*5+1.6,sy-7);c.lineTo(x+i*5+.6,sy-1);c.lineTo(x+i*5-.6,sy-1);c.closePath();c.stroke();}x+=17;}}
      c.fillStyle=rgba('#d8f0ec',.35);c.fillRect(x0,sy,w,1.6);c.fillStyle=rgba('#ffffff',.6);c.fillRect(x0,sy,w,.5);c.fillStyle=rgba('#000000',.2);c.fillRect(x0,sy+1.6,w,4);}
    c.fillStyle=rgba('#fff4dc',.9);c.fillRect(x0,top,w,1.4);
    c.fillStyle=rgba('#ffffff',.07);c.beginPath();c.moveTo(x0+8,top);c.lineTo(x0+30,top);c.lineTo(x0+10,top+gh);c.lineTo(x0-6,top+gh);c.closePath();c.fill();c.restore();
    // the glazing bars and the doors' brass, the cupboards below in burr walnut
    c.fillStyle=lin(c,0,top,0,top+gh,[[0,BRASSL],[1,BRASSD]]);c.fillRect(x0+w/2-.8,top,1.6,gh);c.fillRect(x0,top+gh-1,w,2.6);c.fillRect(x0,top,w,1.2);c.fillRect(x0,top,1.2,gh);c.fillRect(x0+w-1.2,top,1.2,gh);
    for(const dx of [-5,3.4]){c.fillStyle=lin(c,0,top+gh*.5-5,0,top+gh*.5+5,[[0,BRASSL],[1,BRASSD]]);c.fillRect(x0+w/2+dx,top+gh*.5-5,1.6,10);}
    for(let i=0;i<2;i++){const dx=x0+i*(w/2)+1.5,dw=w/2-3,y=top+gh+4,hh=128-gh-12;walnut(c,dx,y,dw,hh,true,.2,{seed:58});walnut(c,dx+4,y+5,dw-8,hh-10,false,.05,{seed:59,wood:BURL});
      c.strokeStyle=rgba(GOLD,.55);c.lineWidth=.6;c.strokeRect(dx+5.5,y+6.5,dw-11,hh-13);edges(c,dx,y,dw,hh,1);}
    c.fillStyle=lin(c,0,top+gh+22,0,top+gh+34,[[0,BRASSL],[1,BRASSD]]);c.fillRect(x0+w/2-3,top+gh+22,2,12);c.fillRect(x0+w/2+1,top+gh+22,2,12);
    // on top: a silver tray, a decanter of whisky and two glasses
    c.fillStyle=lin(c,0,top-13,0,top-9,[[0,'#e8eef0'],[1,'#7a8488']]);c.fillRect(x0+14,top-12,34,3);
    c.fillStyle='rgba(206,132,44,.92)';c.beginPath();c.moveTo(x0+22,top-12);c.quadraticCurveTo(x0+17,top-22,x0+25,top-27);c.lineTo(x0+31,top-27);c.quadraticCurveTo(x0+39,top-22,x0+34,top-12);c.closePath();c.fill();
    c.fillStyle=rgba('#ece0c4',.9);c.fillRect(x0+26,top-34,4,7);c.fillStyle=BRASS;c.fillRect(x0+26,top-37,4,3);c.fillStyle=rgba('#ffffff',.45);c.fillRect(x0+22,top-24,1.2,8);
    for(const dx of [40,46]){c.strokeStyle=rgba('#ebf5fa',.75);c.lineWidth=.8;c.beginPath();c.moveTo(x0+dx-2.6,top-21);c.lineTo(x0+dx+2.6,top-21);c.lineTo(x0+dx+1,top-12);c.lineTo(x0+dx-1,top-12);c.closePath();c.stroke();c.fillStyle=rgba('#d8963c',.8);c.fillRect(x0+dx-1.8,top-18,3.6,3);}}
  // ---- the bookcase: walnut on a brass rail, the books in leather and vellum, a marble bust, a carriage clock, a library ladder
  {const x0=OFW.book+ox,w=132,top=yb-228,sh=41,n=4,r3=rng(61);
    walnut(c,x0-6,top-6,w+12,234,true,.28);c.fillStyle=rgba('#ffdcaa',.25);c.fillRect(x0-6,top-6,w+12,1.2);
    walnut(c,x0,top,w,sh*n+2,false,.62,{seed:60});
    for(let i=0;i<n;i++){const sy=top+sh*(i+1);
      c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,0,sy-sh,0,sy,[[0,rgba('#ffc47a',.26)],[.3,rgba('#ffc47a',.05)],[1,rgba('#ffc47a',0)]]);c.fillRect(x0,sy-sh,w,sh);c.restore();
      const gap=i===1?{x:x0+84,w:26}:i===3?{x:x0+20,w:24}:null;
      for(let x=x0+3;x<x0+w-4;){
        if(gap&&x>=gap.x&&x<gap.x+gap.w){
          if(i===1){const bx=x+12;c.fillStyle=patAt(c,TX().marble(8,128,128),bx-8,sy-30,.2);c.beginPath();c.ellipse(bx,sy-23,5,6.4,0,0,TAU);c.fill();c.beginPath();c.moveTo(x+4,sy-2.4);c.quadraticCurveTo(x+6,sy-14,bx,sy-16);c.quadraticCurveTo(x+18,sy-14,x+20,sy-2.4);c.closePath();c.fill();
            c.fillStyle=rgba('#2a1a10',.35);c.beginPath();c.ellipse(bx+2,sy-22,3,5.6,0,0,TAU);c.fill();walnut(c,x+5,sy-3,14,3,false,.2);}
          else{c.fillStyle=lin(c,x+3,0,x+19,0,[[0,BRASSD],[.4,BRASSL],[1,BRASSD]]);c.beginPath();c.moveTo(x+3,sy);c.lineTo(x+3,sy-13);c.quadraticCurveTo(x+11,sy-19,x+19,sy-13);c.lineTo(x+19,sy);c.closePath();c.fill();
            c.fillStyle='#f0e6c8';c.beginPath();c.arc(x+11,sy-8,4.6,0,TAU);c.fill();c.strokeStyle='#2a1a10';c.lineWidth=.6;c.beginPath();c.moveTo(x+11,sy-8);c.lineTo(x+11,sy-11);c.moveTo(x+11,sy-8);c.lineTo(x+13.4,sy-7);c.stroke();}
          x=gap.x+gap.w;continue;}
        const bw=3.4+r3()*4.4,bh=sh-9-r3()*13,col=['#5a1c20','#1e3a2c','#1e2840','#8a6a44','#d4c49c','#2a1e18','#6a2a24','#9a6a2c','#3a3240','#c8b88c'][Math.floor(r3()*10)];
        if(r3()<.07){c.save();c.translate(x+bw/2,sy);c.rotate(.2);c.fillStyle=col;c.fillRect(0,-bh,bw,bh);c.restore();x+=bw+bh*.22;continue;}
        c.fillStyle=lin(c,x,0,x+bw,0,[[0,mix(col,'#000000',.35)],[.35,mix(col,'#ffe0b0',.12)],[1,mix(col,'#000000',.5)]]);c.fillRect(x,sy-bh,bw,bh);
        if(r3()<.55){c.fillStyle=rgba(GOLD,.85);c.fillRect(x,sy-bh+3,bw,.8);c.fillRect(x,sy-bh+5,bw,.5);c.fillRect(x,sy-4,bw,.8);if(r3()<.5){c.fillStyle=mix(col,'#000000',.4);c.fillRect(x+.6,sy-bh*.62,bw-1.2,3.2);c.fillStyle=rgba(GOLDL,.7);c.fillRect(x+1,sy-bh*.62+1.3,bw-2,.5);}}
        else if(r3()<.3){c.fillStyle=rgba('#e8dcc0',.85);c.fillRect(x+.8,sy-bh*.6,bw-1.6,3.4);}
        x+=bw+.4;}
      walnut(c,x0,sy,w,3,false,.15);c.fillStyle=rgba('#ffe6b4',.45);c.fillRect(x0,sy,w,.8);c.fillStyle=rgba('#000000',.3);c.fillRect(x0,sy+3,w,4);}
    c.fillStyle=lin(c,0,top,0,top+3,[[0,BRASSL],[1,BRASSD]]);c.fillRect(x0,top,w,3);
    // the brass rail along the top and the ladder hooked on it
    c.fillStyle=lin(c,0,top+3,0,top+5.4,[[0,BRASSL],[1,BRASSD]]);c.fillRect(x0-4,top+3,w+8,2.2);
    for(const dx of [w-24,w-12]){c.strokeStyle='#3a2210';c.lineWidth=2;c.beginPath();c.moveTo(x0+dx+(dx<w-18?-3:3),top+6);c.lineTo(x0+dx+(dx<w-18?3:-3),top+sh*n);c.stroke();c.strokeStyle=rgba('#ffdcaa',.25);c.lineWidth=.5;c.stroke();}
    for(let i=0;i<10;i++){const y=top+22+i*15.5;c.fillStyle='#4a2c16';c.fillRect(x0+w-27,y,15,1.5);c.fillStyle=rgba('#ffdcaa',.2);c.fillRect(x0+w-27,y,15,.4);}
    // the cupboard below
    for(let i=0;i<3;i++){const dx=x0+i*(w/3)+1.5,dw=w/3-3,y=top+sh*n+8,hh=yb-y-10;walnut(c,dx,y,dw,hh,true,.2,{seed:61});walnut(c,dx+4,y+4,dw-8,hh-8,false,.05,{seed:62,wood:BURL});
      c.strokeStyle=rgba(GOLD,.5);c.lineWidth=.6;c.strokeRect(dx+5.5,y+5.5,dw-11,hh-11);edges(c,dx,y,dw,hh,1);c.fillStyle=lin(c,0,y+6,0,y+16,[[0,BRASSL],[1,BRASSD]]);c.fillRect(dx+dw/2-1,y+6,2,10);}
    gl(c,x0+w/2,top+40,96,90,'#ffb05a',.08);}
  // ---- the canvas of gold leaf with the black ring brushed on it, over an ivory ash credenza
  {const x0=OFW.art+ox,w=162,cy=yb-54;
    gl(c,x0+w/2,yb-120,112,92,'#ffbe6e',.1);
    {const px=x0+26,py=cy-45-86,pw=110,ph=86,cx=px+pw/2,ccy=py+ph/2,R=27;
      c.fillStyle='#0a0705';c.fillRect(px-6,py-6,pw+12,ph+12);c.fillStyle=lin(c,0,py-4,0,py+ph+4,[[0,'#7a5a2a'],[1,'#3a2410']]);c.fillRect(px-4,py-4,pw+8,ph+8);c.fillStyle='#0c0806';c.fillRect(px-1.6,py-1.6,pw+3.2,ph+3.2);
      c.fillStyle=patAt(c,OT().goldLeaf(9,{sq:64,seam:.12}),px,py,.2);c.fillRect(px,py,pw,ph);c.fillStyle=rgba('#2a1a08',.24);c.fillRect(px,py,pw,ph);
      // the ring: one stroke of a loaded brush, dry at its tail, left open where it ends
      c.save();c.beginPath();c.rect(px,py,pw,ph);c.clip();c.lineCap='round';
      for(let k=0;k<26;k++){const a0=-1.1+k*.002,a1=a0+TAU-.7-k*.004,rw=R+(k%5-2)*1.6+Math.sin(k*1.7)*.8;c.strokeStyle=rgba('#0c0806',k<18?.42:.22);c.lineWidth=k<18?3.2:1.4;c.beginPath();c.arc(cx-2,ccy+1,rw,a0,a1);c.stroke();}
      const rr2=rng(44);for(let k=0;k<40;k++){const a=-1.1+TAU-.9+rr2()*.5,rw=R-6+rr2()*12;c.fillStyle=rgba('#0c0806',.35);c.fillRect(cx-2+Math.cos(a)*rw,ccy+1+Math.sin(a)*rw,1.2,1.2);}
      c.fillStyle='#8a1a14';c.fillRect(px+pw-17,py+ph-17,7,7);c.fillStyle=rgba('#f0d8b0',.75);c.fillRect(px+pw-15.6,py+ph-15.6,1.2,4);c.fillRect(px+pw-12.6,py+ph-15.6,1.2,4);c.fillRect(px+pw-15.6,py+ph-14.1,4.2,1);
      c.fillStyle=rgba('#fff0d0',.08);c.beginPath();c.moveTo(px,py);c.lineTo(px+pw*.4,py);c.lineTo(px+pw*.12,py+ph);c.lineTo(px,py+ph);c.closePath();c.fill();c.restore();
      c.fillStyle=lin(c,0,py-15,0,py-11.6,[[0,BRASSL],[1,BRASSD]]);c.fillRect(cx-22,py-15,44,3.4);c.fillRect(cx-1,py-11.6,2,7);
      c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,0,py-11,0,py+ph*.75,[[0,rgba('#ffd69a',.3)],[1,rgba('#ffd69a',0)]]);c.beginPath();c.moveTo(cx-20,py-11);c.lineTo(cx+20,py-11);c.lineTo(px+pw+10,py+ph*.75);c.lineTo(px-10,py+ph*.75);c.closePath();c.fill();c.restore();}
    // the credenza: pale ash, three reeded doors, bronze pulls, on slim bronze legs
    c.fillStyle=patAt(c,TX().wood(71,512,128,ASH),x0,cy,.2);c.fillRect(x0,cy,w,44);c.fillStyle=rgba('#100a04',.38);c.fillRect(x0,cy,w,44);
    c.fillStyle=patAt(c,TX().wood(72,512,128,ASH),x0-3,cy-4,.2);c.fillRect(x0-3,cy-4,w+6,5);c.fillStyle=rgba('#100a04',.2);c.fillRect(x0-3,cy-4,w+6,5);c.fillStyle=rgba('#fff0cc',.5);c.fillRect(x0-3,cy-4,w+6,.9);
    for(let i=0;i<3;i++){const dx=x0+3+i*(w-6)/3,dw=(w-6)/3-3;c.fillStyle=rgba('#000000',.3);c.fillRect(dx,cy+5,dw,32);
      for(let k=0;k<dw;k+=2.2){c.fillStyle=rgba('#fff0cc',.12);c.fillRect(dx+k,cy+5.5,.8,31);c.fillStyle=rgba('#000000',.22);c.fillRect(dx+k+1.2,cy+5.5,.8,31);}
      c.fillStyle=lin(c,0,cy+11,0,cy+29,[[0,BRASSL],[1,BRASSD]]);c.fillRect(dx+dw/2-.8,cy+11,1.6,18);}
    c.fillStyle=rgba('#000000',.45);c.fillRect(x0,cy+37,w,7);c.fillStyle=rgba('#000000',.4);c.fillRect(x0,cy+44,w,2);
    for(const dx of [8,w-12]){c.fillStyle=lin(c,x0+dx,0,x0+dx+5,0,[[0,BRASSD],[.5,BRASSL],[1,BRASSD]]);c.beginPath();c.moveTo(x0+dx,cy+44);c.lineTo(x0+dx+5,cy+44);c.lineTo(x0+dx+4,cy+52);c.lineTo(x0+dx+1,cy+52);c.closePath();c.fill();}
    // on it: a table lamp with a pleated ivory shade, a decanter and glasses, a small bronze horse
    {const lx=x0+14,by=cy-4;c.fillStyle=BRASSD;c.beginPath();c.ellipse(lx,by,7,2,0,0,TAU);c.fill();c.fillStyle=lin(c,lx-1.2,0,lx+1.2,0,[[0,BRASSD],[.5,BRASSL],[1,BRASSD]]);c.fillRect(lx-1.2,by-18,2.4,18);
      c.fillStyle=lin(c,0,by-35,0,by-18,[[0,'#fff6e0'],[1,'#f0d8a8']]);c.beginPath();c.moveTo(lx-11,by-18);c.lineTo(lx-7,by-35);c.lineTo(lx+7,by-35);c.lineTo(lx+11,by-18);c.closePath();c.fill();
      c.strokeStyle=rgba('#a0784a',.35);c.lineWidth=.4;c.beginPath();for(let k=-5;k<=5;k++){c.moveTo(lx+k*1.3,by-35);c.lineTo(lx+k*2.05,by-18);}c.stroke();
      gl(c,lx,by-26,48,42,'#ffce8c',.34);gl(c,lx,by-10,36,12,'#ffce8c',.2);}
    c.fillStyle=lin(c,0,cy-6.4,0,cy-3.6,[[0,'#e8eef0'],[1,'#7a8488']]);c.fillRect(x0+62,cy-6,34,2.4);
    c.fillStyle='rgba(206,132,44,.9)';c.beginPath();c.moveTo(x0+70,cy-6);c.quadraticCurveTo(x0+66,cy-16,x0+72,cy-21);c.lineTo(x0+77,cy-21);c.quadraticCurveTo(x0+84,cy-16,x0+80,cy-6);c.closePath();c.fill();c.fillStyle=rgba('#e8dcc0',.9);c.fillRect(x0+73,cy-27,3.4,6);c.fillStyle=rgba('#ffffff',.4);c.fillRect(x0+70,cy-18,1,8);
    for(const dx of [88,93]){c.strokeStyle=rgba('#ebf5fa',.72);c.lineWidth=.8;c.beginPath();c.moveTo(x0+dx-2.4,cy-15);c.lineTo(x0+dx+2.4,cy-15);c.lineTo(x0+dx+.9,cy-7);c.lineTo(x0+dx-.9,cy-7);c.closePath();c.stroke();c.fillStyle=rgba('#d8963c',.8);c.fillRect(x0+dx-1.6,cy-12,3.2,3);}
    {const hx=x0+132,by=cy-4;c.fillStyle='#1a120a';c.fillRect(hx-8,by-3,16,3);c.fillStyle=lin(c,hx-8,0,hx+8,0,[[0,'#3a2410'],[.5,'#8a5a28'],[1,'#3a2410']]);c.beginPath();c.moveTo(hx-6,by-3);c.quadraticCurveTo(hx-8,by-10,hx-3,by-12);c.quadraticCurveTo(hx-1,by-19,hx+3,by-22);c.lineTo(hx+7,by-18);c.lineTo(hx+4,by-14);c.quadraticCurveTo(hx+7,by-9,hx+5,by-3);c.closePath();c.fill();
      c.strokeStyle=rgba('#ffd896',.5);c.lineWidth=.7;c.beginPath();c.moveTo(hx-3,by-11);c.quadraticCurveTo(hx,by-19,hx+3,by-21);c.stroke();}}
  // ---- the sconces: a brass arm, a pleated ivory shade, the light thrown up and down the silk in scallops
  for(const wx of [166,421,593]){const x=wx+ox,y=yb-142;
    c.save();c.globalCompositeOperation='lighter';
    for(const s of [-1,1]){const y0=s<0?y-21:y-4,len=s<0?62:52;c.fillStyle=lin(c,0,y0,0,y0+s*len,[[0,rgba('#ffd090',.34)],[.5,rgba('#ffd090',.1)],[1,rgba('#ffd090',0)]]);
      c.beginPath();c.moveTo(x-6,y0);c.quadraticCurveTo(x-20,y0+s*len*.55,x-17,y0+s*len);c.quadraticCurveTo(x,y0+s*len*.82,x+17,y0+s*len);c.quadraticCurveTo(x+20,y0+s*len*.55,x+6,y0);c.closePath();c.fill();}
    c.restore();gl(c,x,y-12,30,40,'#ffc87a',.2);
    c.fillStyle=lin(c,x-3,0,x+3,0,[[0,BRASSD],[.5,BRASSL],[1,BRASSD]]);c.fillRect(x-2.6,y-2,5.2,14);c.beginPath();c.ellipse(x,y+12,3.4,1.4,0,0,TAU);c.fill();
    c.fillStyle=lin(c,0,y-22,0,y-5,[[0,'#fff8e8'],[1,'#f2dcae']]);c.beginPath();c.moveTo(x-7.4,y-5);c.lineTo(x-4.6,y-22);c.lineTo(x+4.6,y-22);c.lineTo(x+7.4,y-5);c.closePath();c.fill();
    c.strokeStyle=rgba('#a0784a',.3);c.lineWidth=.35;c.beginPath();for(let k=-3;k<=3;k++){c.moveTo(x+k*1.3,y-22);c.lineTo(x+k*2.1,y-5);}c.stroke();c.fillStyle=BRASS;c.fillRect(x-7.4,y-5.6,14.8,1.2);c.fillRect(x-4.6,y-22.4,9.2,1);}
  // ---- the glass wall: the night far below
  {const Cy=city(),gx0=GX,gx1=X1+40,gy0=Cy.gy0,gy1=Cy.gy1,r4=rng(404);
    c.save();c.beginPath();c.rect(gx0,gy0,gx1-gx0,gy1-gy0);c.clip();
    c.fillStyle=lin(c,0,gy0,0,gy1,[[0,'#03050c'],[.28,'#0a1030'],[.52,'#1a2050'],[.7,'#382c5c'],[.86,'#7a4a62'],[1,'#c88660']]);c.fillRect(gx0,gy0,gx1-gx0,gy1-gy0);
    {const r5=rng(99);for(let i=0;i<110;i++){c.fillStyle=rgba('#e6ecff',.2+r5()*.55);const s=r5()<.12?1.5:.9;c.fillRect(gx0+r5()*(gx1-gx0),gy0+4+r5()*(gy1-gy0)*.5,s,s);}}
    {const mx=gx0+232,my=gy0+44;gl(c,mx,my,48,48,'#a8c0ff',.2);c.fillStyle='#e8eefa';c.beginPath();c.arc(mx,my,6.2,0,TAU);c.fill();c.fillStyle='#0c1434';c.beginPath();c.arc(mx+3.2,my-1.4,5.6,0,TAU);c.fill();}
    const LAY=[{col:'#242a58',p:.14,sz:1.3,cols:['rgba(205,220,255,.5)','rgba(255,225,170,.45)','rgba(200,210,240,.4)']},{col:'#161a3e',p:.24,sz:1.5,cols:['rgba(255,225,170,.6)','rgba(205,220,255,.55)','rgba(255,170,120,.5)']},
      {col:'#0e1230',p:.34,sz:1.7,cols:['rgba(255,226,170,.75)','rgba(200,220,255,.65)','rgba(255,180,120,.6)']},{col:'#080a1e',p:.5,sz:2.2,cols:['rgba(255,214,140,.85)','rgba(255,236,190,.8)','rgba(255,170,100,.7)']}];
    for(let l=0;l<4;l++){const A=LAY[l];
      for(const t of Cy.T){if(t.l!==l)continue;c.fillStyle=A.col;c.fillRect(t.x,t.top,t.w,gy1-t.top+6);
        if(t.lm){c.fillRect(t.x+t.w*.2,t.top-10,t.w*.6,10);c.fillRect(t.x+t.w*.38,t.top-14,t.w*.24,5);c.fillRect(t.x+t.w/2-.6,t.top-26,1.2,16);c.fillStyle=rgba('#96b4ff',.1);c.fillRect(t.x+t.w*.3,t.top,1.2,gy1-t.top);c.fillRect(t.x+t.w*.7,t.top,1.2,gy1-t.top);}
        c.fillStyle=rgba('#a0b0ff',.06);c.fillRect(t.x,t.top,1,gy1-t.top);
        for(let yy=t.top+4;yy<gy1-3;yy+=A.sz*3.4)for(let xx=t.x+2.5;xx<t.x+t.w-3;xx+=A.sz*3){if(r4()<A.p){c.fillStyle=A.cols[r4()<.62?0:r4()<.8?1:2];c.fillRect(xx,yy,A.sz,A.sz*1.3);}}}
      if(l<2){c.fillStyle=lin(c,0,gy0+90,0,gy1,[[0,rgba('#96648c',0)],[1,rgba('#aa6e8c',l?.3:.42)]]);c.fillRect(gx0,gy0+90,gx1-gx0,gy1-gy0-90);}
      // past the middle of the city, the old elven town on its hill: dark slopes, two spires, a few cold cyan lights where the old work still burns
      if(l===1){const hx0=gx0+60,hb=gy1-34,r6=rng(77);c.fillStyle='#14142e';c.beginPath();c.moveTo(hx0-40,hb);c.quadraticCurveTo(hx0+40,hb-58,hx0+120,hb-66);c.quadraticCurveTo(hx0+200,hb-60,hx0+260,hb-30);c.quadraticCurveTo(hx0+300,hb-16,hx0+340,hb);c.closePath();c.fill();
        c.fillStyle=lin(c,0,hb-66,0,hb,[[0,rgba('#2a2a50',.6)],[1,rgba('#14142e',0)]]);c.fill();
        for(const [sx,sh,sw] of [[hx0+104,46,3.4],[hx0+150,32,2.8],[hx0+70,18,2.4]]){const by=hb-60+Math.abs(sx-hx0-120)*.05;c.fillStyle='#12122a';c.beginPath();c.moveTo(sx-sw,by);c.lineTo(sx,by-sh);c.lineTo(sx+sw,by);c.closePath();c.fill();c.fillRect(sx-sw-.6,by-1,sw*2+1.2,16);
          c.fillStyle=rgba('#7ff3e3',.8);c.fillRect(sx-.5,by-sh*.45,1,1.6);gl(c,sx,by-sh*.45,7,7,'#7ff3e3',.22);}
        for(let i=0;i<14;i++){const x=hx0+30+r6()*220,y=hb-40-r6()*20+Math.abs(x-hx0-120)*.18;c.fillStyle=rgba('#7ff3e3',.5+r6()*.35);c.fillRect(x,y,1.1,1);gl(c,x,y,4,4,'#7ff3e3',.12);}}}
    // the river far below, the city's light lying broken on it, and the lamps along the embankment
    {const ry0=gy1-22,ry1=gy1-8;c.fillStyle=lin(c,0,ry0,0,ry1,[[0,'#0a0c1c'],[1,'#141428']]);c.fillRect(gx0,ry0,gx1-gx0,ry1-ry0);
      c.save();c.globalCompositeOperation='lighter';for(let i=0;i<70;i++){const x=gx0+r4()*(gx1-gx0),y=ry0+1+r4()*(ry1-ry0-2),w2=2+r4()*7;c.fillStyle=rgba(r4()<.75?'#ffc078':'#c8d8ff',.18+r4()*.3);c.fillRect(x,y,w2,.6);}c.restore();
      for(let x=gx0-6+r4()*8;x<gx1;x+=7+r4()*6){c.fillStyle=rgba('#ffd08a',.85);c.fillRect(x,ry0-1.4,1.3,1.1);}
      gl(c,gx0+260,gy1,320,40,'#ffaa64',.26);
      for(let row=0;row<2;row++){const y=gy1-4-row*3;for(let x=gx0-10+r4()*20;x<gx1;x+=6+row*3+r4()*10){c.fillStyle=r4()<.8?rgba('#ffcc82',.8):rgba('#fff0d2',.8);c.fillRect(x,y,1.4,1.1);}}}
    // the glass: a pale sheen, the room's warm lamps caught in it, and at its head the cyan of the tower's own ring overhead
    c.fillStyle=rgba('#bed2ff',.045);for(const x of [gx0+30,gx0+210,gx0+400]){c.beginPath();c.moveTo(x,gy0);c.lineTo(x+60,gy0);c.lineTo(x-30,gy1);c.lineTo(x-90,gy1);c.closePath();c.fill();}
    for(const [x,y] of [[gx0+40,gy0+118],[gx0+150,gy0+124],[gx0+290,gy0+132]])gl(c,x,y,46,8,'#ffc47a',.1);
    c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,0,gy0,0,gy0+34,[[0,rgba('#7ff3e3',.26)],[1,rgba('#7ff3e3',0)]]);c.fillRect(gx0,gy0,gx1-gx0,34);c.restore();
    c.restore();
    // bronze mullions between the panes, the head beam, the walnut pier at the wall's edge
    for(let x=gx0+4;x<gx1;x+=108){c.fillStyle=lin(c,x-2.6,0,x+2.6,0,[[0,'#120c06'],[.35,'#5a4020'],[.6,'#2a1c0e'],[1,'#0a0704']]);c.fillRect(x-2.6,gy0,5.2,gy1-gy0);}
    c.fillStyle=lin(c,0,gy0-6,0,gy0,[[0,'#5a4020'],[1,'#120c06']]);c.fillRect(gx0,gy0-6,gx1-gx0,6);c.fillStyle=rgba('#7ff3e3',.3);c.fillRect(gx0,gy0-.8,gx1-gx0,.8);
    walnut(c,gx0-14,gy0-6,14,yb-gy0+6,true,.3);c.fillStyle=rgba('#ffdcaa',.2);c.fillRect(gx0-14,gy0-6,1.2,yb-gy0+6);c.fillStyle=rgba('#000000',.5);c.fillRect(gx0-2,gy0,2,yb-gy0);
    // the sill: travertine, lit from the room and the glass
    c.fillStyle=patAt(c,OT().travertine(9,{}),gx0,gy1,.25);c.fillRect(gx0,gy1,gx1-gx0,yb-gy1);c.fillStyle=lin(c,0,gy1,0,yb,[[0,rgba('#141020',.25)],[.15,rgba('#140c06',.42)],[1,rgba('#060302',.65)]]);c.fillRect(gx0,gy1,gx1-gx0,yb-gy1);
    c.fillStyle=rgba('#e6ecff',.45);c.fillRect(gx0,gy1,gx1-gx0,1.2);c.fillStyle=rgba('#000000',.35);c.fillRect(gx0,gy1+1.2,gx1-gx0,2);
    walnut(c,gx0,yb-5,gx1-gx0,5,false,.4);c.fillStyle=rgba('#ffdcaa',.2);c.fillRect(gx0,yb-5,gx1-gx0,.8);}
  // ---- the floor: honey oak herringbone, polished, with the pale rug under the desk
  {const pts=[pp(X0,GB,FAR),pp(X1,GB,FAR),pp(X1,GB,-110),pp(X0,GB,-110)];c.save();E.poly(c,pts);c.clip();
    c.save();c.transform(1,0,PSX,-PSY,0,GB);c.fillStyle=patAt(c,TX().herringbone({T:96,k:4,sc:4,seed:23,wood:OAK}),0,0,.25);c.fillRect(X0-60,-120,X1-X0+120,FAR+130);
    const sheen=c.createLinearGradient(0,FAR,0,0);sheen.addColorStop(0,'rgba(255,200,140,.1)');sheen.addColorStop(.4,'rgba(255,200,140,.02)');sheen.addColorStop(1,'rgba(255,200,140,0)');c.fillStyle=sheen;c.fillRect(X0-60,0,X1-X0+120,FAR);c.restore();
    c.fillStyle=lin(c,0,yb,0,GB+100,[[0,rgba('#0a0604',.32)],[.4,rgba('#0a0604',.42)],[1,rgba('#000000',.74)]]);c.fillRect(X0,yb,X1-X0,GB+120-yb);
    // the moonlight through the glass lying across the boards
    c.save();c.globalCompositeOperation='lighter';for(const x of [620,730,840]){c.fillStyle=lin(c,0,pp(0,GB,FAR).y,0,pp(0,GB,110).y,[[0,rgba('#96b4ff',.08)],[1,rgba('#96b4ff',0)]]);E.poly(c,[pp(x,GB,FAR),pp(x+96,GB,FAR),pp(x+30,GB,110),pp(x-96,GB,110)]);c.fill();}
      // the lobby's amber through the doorway, and the sconces' light at the foot of the wall
      {const a=OFFICE_ENTRY.x-42,b=a+84;c.fillStyle=lin(c,0,pp(0,GB,FAR).y,0,pp(0,GB,150).y,[[0,rgba('#ffb45a',.24)],[1,rgba('#ffb45a',0)]]);E.poly(c,[pp(a,GB,FAR),pp(b,GB,FAR),pp(b+70,GB,150),pp(a-60,GB,150)]);c.fill();}
      for(const wx of [166,421,593]){const q=pp(wx,GB,FAR-3);c.fillStyle=lin(c,0,q.y,0,q.y+40,[[0,rgba('#ffc27a',.1)],[1,rgba('#ffc27a',0)]]);c.fillRect(q.x-12,q.y,24,40);}
      c.restore();
    // soot and blast marks at the doorway's foot
    {const a=OFFICE_ENTRY.x-42,b=a+84,q=pp((a+b)/2,GB,222);dark(c,q.x,q.y,92,22,.55);const rr=rng(5);for(let i=0;i<7;i++){const s=pp(a-20+rr()*130,GB,196+rr()*38);c.fillStyle=rgba('#080403',.4);c.beginPath();c.ellipse(s.x,s.y,5+rr()*12,1.5+rr()*3,0,0,TAU);c.fill();}}
    c.fillStyle=lin(c,0,yb-4,0,yb+12,[[0,rgba('#000000',.6)],[1,rgba('#000000',0)]]);c.fillRect(X0,yb-4,X1-X0,16);
    c.restore();}
  // ---- the rug: ivory wool, a bronze border with a gold key running round it, a lattice in the field, the house's open ring at its heart
  {const x0=520,x1=930,d0=34,d1=196,RW=x1-x0,RD=d1-d0,TT=TX(),hx=TT.hex,ivory=hx('#d6caa8'),ivory2=hx('#c8b994'),gold=hx('#b8944e'),bronze=hx('#5a3e22'),deep=hx('#3a2814'),nn=TT.noise2(19,32);
    const col=(u,v)=>{const X=u*RW,D=v*RD,e=Math.min(X,RW-X,D,RD-D);let k;
      if(e<2)k=bronze;else if(e<9){const along=(e===D-0||e===RD-D)?X:(e===X||e===RW-X)?D:X,m=((along%8)+8)%8,cc=e-5.5;k=(Math.abs(cc)<1.1&&m<5)||(m>=4&&m<5&&Math.abs(cc)<2.6)?gold:bronze;}
      else if(e<10)k=gold;else if(e<12)k=ivory2;else if(e<13)k=bronze;
      else{const mx=X-RW*.58,md=D-RD/2,rr=Math.sqrt(mx*mx/(52*52)+md*md/(40*40)),ang=Math.atan2(md/40,mx/52);
        if(rr<1.06&&rr>.84&&!(ang>-1.15&&ang<-.55))k=rr>.97||rr<.88?bronze:gold;
        else if(rr<.7&&rr>.64)k=gold;
        else{const lx=((X%16)+16)%16-8,ld=((D%12)+12)%12-6,fl=Math.abs(lx)/8+Math.abs(ld)/6;k=fl>.94?gold:(fl<.12?gold:ivory);}}
      const w=TT.fbm(nn,u*8,v*4,3),walk=clamp((w-.4)*2,0,1)*.18;return TT.lerp3(k,[120,104,84],walk);};
    const rug=TT.rug('office',Math.round(RW*2.4),Math.round(RD*2.2),col,11);
    c.save();c.transform(1,0,PSX,-PSY,0,GB);c.fillStyle=rgba('#000000',.4);c.fillRect(x0+1.5,d0-1.5,RW,RD);c.drawImage(rug,x0,d0,RW,RD);
    c.fillStyle=lin(c,0,d0,0,d1,[[0,rgba('#08060a',.5)],[.5,rgba('#08060a',.38)],[1,rgba('#08060a',.3)]]);c.fillRect(x0,d0,RW,RD);
    for(let d=d0+1;d<d1-.5;d+=1.1){c.strokeStyle=rgba('#cfc2a0',.6);c.lineWidth=.45;c.beginPath();c.moveTo(x0,d);c.lineTo(x0-(4+Math.sin(d*3.1)*1.2),d+Math.sin(d*1.7)*.6);c.stroke();}
    c.restore();
    // the desk lamp's pool on the rug
    {const q=pp(DESK.x+6,GB,DESK.d-18);gl(c,q.x,q.y,96,24,'#ffbe6e',.16);}}
  // the edges of the picture fall into shadow, and the warm haze under the ceiling
  c.fillStyle=lin(c,X0,0,X0+170,0,[[0,rgba('#050202',.6)],[1,rgba('#050202',0)]]);c.fillRect(X0,T0,170,yb-T0);
  haze(c,X0,X1,T0,70,'#1a1006',.5,true);}
// ---------- what moves: the beacons, an airliner, the doorway's light, its embers and smoke ----------
let SMOKE=null;
function smokeSprites(){if(SMOKE)return SMOKE;SMOKE=[0,1,2].map(k=>{const cv=document.createElement('canvas');cv.width=cv.height=128;const g=cv.getContext('2d'),r=rng(31+k*7);
  for(let i=0;i<14;i++){const x=34+r()*60,y=34+r()*60,rr=16+r()*24,gr=g.createRadialGradient(x,y,0,x,y,rr);gr.addColorStop(0,'rgba(120,104,92,.22)');gr.addColorStop(1,'rgba(120,104,92,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);}
  g.globalCompositeOperation='source-atop';const lt=g.createLinearGradient(0,128,0,0);lt.addColorStop(0,'rgba(255,190,120,.45)');lt.addColorStop(1,'rgba(150,140,150,.1)');g.fillStyle=lt;g.fillRect(0,0,128,128);return cv;});return SMOKE;}
function live(){const yb=yB(),ox=OXf(),t=S.t,Cy=city();ctx.save();ctx.globalCompositeOperation='lighter';
  const dot=(x,y,r,col,a)=>{ctx.globalAlpha=a;ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();};
  for(const b of Cy.beacons){const k=Math.max(0,Math.sin(t*3.6+b.p)),a=k*k;if(a>.02){ctx.globalAlpha=.9*a;const g=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,8);g.addColorStop(0,'rgba(255,90,70,.9)');g.addColorStop(1,'rgba(255,60,40,0)');ctx.fillStyle=g;ctx.fillRect(b.x-8,b.y-8,16,16);}dot(b.x,b.y,.9,'#ff6a5a',.35+.5*a);}
  {const span=640,x=Cy.gx0-30+((t*8+210)%span),y=Cy.gy0+46+Math.sin(x*.01)*3;dot(x,y,1.1,'#ffffff',(t*1.1)%1<.12?1:0);dot(x-5,y+.6,1,'#ff4a3a',.6);dot(x+5,y+.6,1,'#4aff8a',.5);}
  // the doorway: the lobby's light wavering, embers drifting out
  {const dx0=OFFICE_ENTRY.x-42+ox,fl=.5+.25*Math.sin(t*3.1)+.15*Math.sin(t*11.3)+.1*Math.sin(t*23);
    ctx.globalAlpha=.07*fl;ctx.fillStyle='#ffb060';ctx.fillRect(dx0,yb-164,84,164);
    ctx.globalAlpha=1;const g=ctx.createRadialGradient(dx0+42,yb-20,0,dx0+42,yb-20,72);g.addColorStop(0,`rgba(255,190,110,${(.28*fl).toFixed(3)})`);g.addColorStop(1,'rgba(255,170,90,0)');ctx.fillStyle=g;ctx.fillRect(dx0-30,yb-92,144,92);
    for(let i=0;i<5;i++){const u=(t*.22+i*.21+i*.07)%1,x=dx0+14+((i*23)%58)+Math.sin(t*1.7+i*2)*9*u,y=yb-30-u*120;ctx.globalAlpha=.85*Math.sin(u*Math.PI)*(.6+.4*Math.sin(t*17+i));ctx.fillStyle='#ffb050';ctx.fillRect(x-.8,y-.8,1.6,1.6);dot(x,y,2.6,'#ff8a30',.2*Math.sin(u*Math.PI));}}
  ctx.restore();
  // smoke curling out of the doorway and spreading under the ceiling, lit warm from below
  ctx.save();const SM=smokeSprites();
  for(let i=0;i<8;i++){const life=9,u=((t+i*life/8)%life)/life,k=Math.sin(u*Math.PI),dx0=OFFICE_ENTRY.x-42+ox;
    const x=dx0+42+Math.sin(i*2.4+u*3.1)*(12+u*20)+u*u*90,y=yb-50-u*(150+i%3*16),s=44+u*(110+i%3*14);
    ctx.globalAlpha=.85*Math.pow(k,.8)*(1-u*.3);ctx.drawImage(SM[i%3],x-s/2,y-s/2,s,s);}
  ctx.restore();}
// the light on a fighter: the lobby's amber from the doorway when he is near it, the room's lamps from above otherwise
function light(f){const px=f.p[PEL].x;if(px<OFFICE_ENTRY.x+150){const sx=OFFICE_ENTRY.x+OXf(),sy=yB()-70;return{light:{x:sx-f.dep*PSX,y:sy+f.dep*PSY}};}return{dir:{x:.1,y:-1}};}
// ---------- the furniture ----------
const at=(q,d)=>P(q.x,q.y,d),seg=(a,b,w,col)=>{ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();};
function fp(pts,style){fillPts(ctx,pts,style);}
const lerpQ=(a,b,u)=>({x:lerp(a.x,b.x,u),y:lerp(a.y,b.y,u)});
// a prop drawn in its own frame: u along the line through two of its points, v up from it, dd in depth
function frameOf(Pp,i,j){const a=Pp.pts[i],b=Pp.pts[j],ox=(a.x+b.x)/2,oy=(a.y+b.y)/2,dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,d=Pp.dep;
  return(u,v,dd)=>{const x=ox+ux*u+uy*v,y=oy+uy*u-ux*v;return P(x,y,d+(dd||0));};}
function fpoly(m,list,dd,style){const pts=list.map(([u,v])=>m(u,v,dd));fp(pts,style);}
function fline(m,list,dd,col,w){ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();list.forEach(([u,v],k)=>{const q=m(u,v,dd);k?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);});ctx.stroke();}
function band(m,a,b,v,dd0,dd1,style){fp([m(a,v,dd0),m(b,v,dd0),m(b,v,dd1),m(a,v,dd1)],style);}
const brassH=(x0,x1)=>lin(ctx,x0,0,x1,0,[[0,BRASSD],[.45,BRASSL],[1,BRASSD]]);
// a contact shadow on the floor
function shadow(x,d,rx,ry,a){const s=P(x,GB,d);ctx.save();ctx.translate(s.x,s.y);ctx.scale(1,ry/rx);ctx.fillStyle=rad(ctx,0,0,0,rx,[[0,rgba('#000000',a||.4)],[1,rgba('#000000',0)]]);ctx.beginPath();ctx.arc(0,0,rx,0,TAU);ctx.fill();ctx.restore();}
// the desk: two floor items (its back and top behind whoever is at it, its front in front of them), in walnut and brass with a leather top
function desk(Pp,back){
  const p=Pp.pts,d=Pp.dep,dz=Pp.dz,fr=d-dz*.8,bk=d+dz*.8,x0=p[0].x,x1=p[1].x,yt=p[0].y,g=p[2].y+2,h=g-yt,rk=Pp.rock||0,t=S.t;
  const F=(u,v)=>P(x0+u,g-v,fr),Tp=(x,dd)=>P(x,yt,d+dd),Wd=x1-x0;
  const rc=(a,b,col)=>fp([F(a[0],a[1]),F(b[0],a[1]),F(b[0],b[1]),F(a[0],b[1])],col);
  ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
  if(back){
    shadow((x0+x1)/2,d,Wd/2+10,16,.32);
    fp([P(x0,g,bk),P(x1,g,bk),P(x1,yt,bk),P(x0,yt,bk)],'#120a05');
    // the top: a walnut edge banded in brass, a field of cream leather tooled in gold
    {const A=P(x0-2.5,yt,fr-2),B=P(x1+2.5,yt,fr-2),Cc=P(x1+2.5,yt,bk+1.5),D=P(x0-2.5,yt,bk+1.5);fp([A,B,Cc,D],patAt(ctx,TX().wood(51,512,128,WAL),A.x,A.y,.2));fp([A,B,Cc,D],rgba('#000000',.25));}
    {const A=P(x0+2,yt,fr+2),B=P(x1-2,yt,fr+2),Cc=P(x1-2,yt,bk-2),D=P(x0+2,yt,bk-2);fp([A,B,Cc,D],patAt(ctx,OT().leather(8,{base:'#cdbd96'}),A.x,A.y,.25));fp([A,B,Cc,D],rgba('#1a1208',.42));}
    ctx.strokeStyle=rgba(GOLD,.75);ctx.lineWidth=.7;ctx.beginPath();for(const q of [P(x0+4,yt,fr+4),P(x1-4,yt,fr+4),P(x1-4,yt,bk-4),P(x0+4,yt,bk-4)])ctx.lineTo(q.x,q.y);ctx.closePath();ctx.stroke();
    ctx.save();ctx.globalCompositeOperation='lighter';{const q=Tp(x0+22,6);ctx.translate(q.x,q.y);ctx.scale(1,.34);const gr=ctx.createRadialGradient(0,0,0,0,0,42);gr.addColorStop(0,'rgba(255,208,140,.5)');gr.addColorStop(1,'rgba(255,190,110,0)');ctx.fillStyle=gr;ctx.fillRect(-42,-42,84,84);}ctx.restore();
    // a blotter in a brass-cornered frame, two sheets of paper, a fountain pen
    fp([Tp(x0+22,fr-d+7),Tp(x0+60,fr-d+7),Tp(x0+60,fr-d+26),Tp(x0+22,fr-d+26)],'#2a2014');
    ctx.strokeStyle=rgba(GOLD,.55);ctx.lineWidth=.6;ctx.beginPath();for(const q of [Tp(x0+23.5,fr-d+8.5),Tp(x0+58.5,fr-d+8.5),Tp(x0+58.5,fr-d+24.5),Tp(x0+23.5,fr-d+24.5)])ctx.lineTo(q.x,q.y);ctx.closePath();ctx.stroke();
    for(const [px,pd,w,hh,ro] of [[x0+34,fr-d+12,16,12,-.05],[x0+44,fr-d+16,15,11,.08]]){const fl=rk>0.03?Math.max(0,Math.sin(t*21+px))*rk*3.4:0,q=Tp(px,pd);ctx.save();ctx.translate(q.x,q.y-fl);ctx.rotate(ro+rk*.2*Math.sin(t*17+px));
      ctx.fillStyle='#ece4cf';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(w,.6);ctx.lineTo(w+1.4,-hh*.75);ctx.lineTo(1.4,-hh*.75-.6);ctx.closePath();ctx.fill();
      ctx.strokeStyle=rgba('#3c3228',.55);ctx.lineWidth=.5;ctx.beginPath();for(let i=0;i<3;i++){ctx.moveTo(3+i*.3,-2-i*2.4);ctx.lineTo(w-3,-1.6-i*2.4);}ctx.stroke();ctx.restore();}
    {const q=Tp(x0+48,fr-d+19),q2=Tp(x0+58,fr-d+15);seg(q,q2,1.8,'#0c0c0e');seg(q,{x:q.x+2.4,y:q.y-.4},1.8,GOLD);}
    // the banker's lamp: brass foot and stem, a green glass shade, its light warm on the leather
    {const q=Tp(x0+16,bk-d-8);ctx.save();ctx.translate(q.x,q.y);ctx.rotate(rk*.22*Math.sin(t*17.5));
      ctx.fillStyle=BRASSD;ctx.beginPath();ctx.ellipse(0,0,7.5,2.6,0,0,TAU);ctx.fill();ctx.fillStyle=BRASS;ctx.beginPath();ctx.ellipse(0,-1.4,6.3,2.2,0,0,TAU);ctx.fill();
      ctx.fillStyle=brassH(-1.4,1.4);ctx.fillRect(-1.3,-15,2.6,13.5);ctx.fillStyle=BRASS;ctx.fillRect(-2.2,-9,4.4,1.8);
      ctx.fillStyle='#123422';ctx.beginPath();ctx.moveTo(-12.5,-12);ctx.quadraticCurveTo(-13,-23,-4,-25);ctx.lineTo(4,-25);ctx.quadraticCurveTo(13,-23,12.5,-12);ctx.closePath();ctx.fill();
      ctx.fillStyle='#2a7a50';ctx.beginPath();ctx.moveTo(-11.5,-12.4);ctx.quadraticCurveTo(-12,-22,-4,-24);ctx.lineTo(3,-24);ctx.quadraticCurveTo(7,-23,9,-18);ctx.lineTo(-1,-12.4);ctx.closePath();ctx.fill();
      ctx.strokeStyle=rgba('#c8ffdc',.6);ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(-9.6,-17);ctx.quadraticCurveTo(-9.4,-22,-4,-23.2);ctx.stroke();
      ctx.fillStyle=BRASS;ctx.fillRect(-12.8,-12.6,25.6,1.6);ctx.fillRect(-1.6,-26.6,3.2,2);ctx.fillStyle=rgba('#ffecb0',.95);ctx.fillRect(-9,-11.2,18,1.4);ctx.restore();
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.translate(q.x,q.y-16);ctx.scale(1,.8);const gr=ctx.createRadialGradient(0,0,0,0,0,36);gr.addColorStop(0,'rgba(255,214,140,.5)');gr.addColorStop(1,'rgba(255,190,110,0)');ctx.fillStyle=gr;ctx.beginPath();ctx.arc(0,0,36,0,TAU);ctx.fill();ctx.restore();}
    // the telephone: black bakelite, a brass dial
    {const q=Tp(x0+6,bk-d-5);ctx.fillStyle='#0c0b0d';ctx.beginPath();ctx.moveTo(q.x-8,q.y);ctx.lineTo(q.x-6,q.y-5);ctx.lineTo(q.x+6,q.y-5);ctx.lineTo(q.x+8,q.y);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#0c0b0d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(q.x-8,q.y-6);ctx.quadraticCurveTo(q.x,q.y-10,q.x+8,q.y-6);ctx.stroke();ctx.fillStyle=BRASS;ctx.beginPath();ctx.arc(q.x,q.y-2.4,1.4,0,TAU);ctx.fill();
      ctx.strokeStyle=rgba('#ffffff',.22);ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(q.x-6,q.y-8);ctx.quadraticCurveTo(q.x,q.y-10,q.x+6,q.y-7.6);ctx.stroke();}
    ctx.restore();return true;}
  // ---- the front: the end panel in walnut with a burr field let in, brass stringing, a brass lozenge, a plinth on bun feet
  fp([P(x1,g,fr),P(x1,g,bk),P(x1,yt,bk),P(x1,yt,fr)],patAt(ctx,TX().wood(55,512,128,WAL),P(x1,yt,fr).x,P(x1,yt,fr).y,.2,90));fp([P(x1,g,fr),P(x1,g,bk),P(x1,yt,bk),P(x1,yt,fr)],rgba('#000000',.55));
  {const A=F(0,h),B=F(Wd,h),Cc=F(Wd,0),D=F(0,0);fp([A,B,Cc,D],patAt(ctx,TX().wood(56,512,128,WAL),A.x,A.y,.2,90));fp([A,B,Cc,D],lin(ctx,0,A.y,0,D.y,[[0,rgba('#000000',.15)],[1,rgba('#000000',.4)]]));}
  {const A=F(-2.5,h),B=F(Wd+2.5,h),Cc=F(Wd+2.5,h-5.4),D=F(-2.5,h-5.4);fp([A,B,Cc,D],patAt(ctx,TX().wood(57,512,128,WAL),A.x,A.y,.2));fp([A,B,Cc,D],rgba('#000000',.15));}
  rc([-2.5,h],[Wd+2.5,h-.8],rgba('#ffdcaa',.42));rc([-1,h-5.4],[Wd+1,h-6.6],BRASS);rc([-1,h-6.6],[Wd+1,h-7.4],rgba('#000000',.45));
  rc([0,h-7.4],[4.6,6],rgba('#000000',.25));rc([Wd-4.6,h-7.4],[Wd,6],rgba('#000000',.25));rc([0,h-7.4],[.8,6],rgba('#ffdcaa',.2));
  {const A=F(9.4,h-12.4),B=F(Wd-9.4,h-12.4),Cc=F(Wd-9.4,13.4),D=F(9.4,13.4);fp([A,B,Cc,D],patAt(ctx,TX().wood(58,512,128,BURL),A.x,A.y,.16));
    fp([A,B,Cc,D],lin(ctx,A.x,0,B.x,0,[[0,rgba('#ffdcaa',.1)],[.5,rgba('#000000',.12)],[1,rgba('#000000',.32)]]));}
  ctx.strokeStyle=rgba(GOLD,.85);ctx.lineWidth=.7;ctx.beginPath();for(const q of [F(12,h-15),F(Wd-12,h-15),F(Wd-12,17),F(12,17)])ctx.lineTo(q.x,q.y);ctx.closePath();ctx.stroke();
  {const c0=F(Wd/2,h/2+1);ctx.fillStyle=BRASSD;ctx.beginPath();ctx.moveTo(c0.x,c0.y-8);ctx.lineTo(c0.x+5.4,c0.y);ctx.lineTo(c0.x,c0.y+8);ctx.lineTo(c0.x-5.4,c0.y);ctx.closePath();ctx.fill();
    ctx.fillStyle=lin(ctx,0,c0.y-6,0,c0.y+6,[[0,GOLDL],[1,BRASSD]]);ctx.beginPath();ctx.moveTo(c0.x,c0.y-6);ctx.lineTo(c0.x+3.8,c0.y);ctx.lineTo(c0.x,c0.y+6);ctx.lineTo(c0.x-3.8,c0.y);ctx.closePath();ctx.fill();ctx.fillStyle='#2a1a0c';ctx.beginPath();ctx.arc(c0.x,c0.y,1.4,0,TAU);ctx.fill();}
  rc([2,7],[Wd-2,3],'#140a05');rc([2,7],[Wd-2,6.3],rgba('#ffdcaa',.16));
  for(const u of [5.5,Wd-5.5]){const q=F(u,1.6);ctx.fillStyle='#2a1a0c';ctx.beginPath();ctx.ellipse(q.x,q.y,3.8,2.4,0,0,TAU);ctx.fill();ctx.fillStyle=BRASS;ctx.beginPath();ctx.ellipse(q.x-.6,q.y-.5,2.4,1.5,0,0,TAU);ctx.fill();}
  // the nameplate on the front edge
  {const q=P(x0+Wd-14,yt,fr+3);ctx.fillStyle='#1a0e06';ctx.fillRect(q.x-9.5,q.y-2,19,2.2);ctx.fillStyle=lin(ctx,0,q.y-7,0,q.y-2,[[0,'#f2da90'],[1,'#a07a34']]);ctx.beginPath();ctx.moveTo(q.x-9,q.y-2);ctx.lineTo(q.x-8,q.y-7);ctx.lineTo(q.x+8,q.y-7);ctx.lineTo(q.x+9,q.y-2);ctx.closePath();ctx.fill();
    ctx.strokeStyle=rgba('#3c240a',.75);ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(q.x-6,q.y-5.4);ctx.lineTo(q.x+6,q.y-5.4);ctx.moveTo(q.x-4,q.y-3.6);ctx.lineTo(q.x+4,q.y-3.6);ctx.stroke();}
  ctx.restore();return true;}
// his chair: a high-backed swivel in ivory leather, piped in gold, on a five-star base of brass
function execchair(Pp){const p=Pp.pts,d=Pp.dep,A=p[0],B=p[1],Cp=p[2],H=p[3],ux=B.x-A.x,uy=B.y-A.y,L=Math.hypot(ux,uy)||1,u={x:ux/L,y:uy/L},n={x:u.y,y:-u.x};
  const loc=(a,b)=>({x:A.x+u.x*a+n.x*b,y:A.y+u.y*a+n.y*b}),ca=(Cp.x-A.x)*u.x+(Cp.y-A.y)*u.y,cb=(Cp.x-A.x)*n.x+(Cp.y-A.y)*n.y,NEAR=d-9,FAR2=d+9,bw=9;
  const LE=OT().leather(8,{base:'#cdbd96'}),lea=(q)=>patAt(ctx,LE,q.x,q.y,.22);
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';shadow(H.x,d,26,6,.3);
  for(const l of [[0,22],[-21,6.8],[21,6.8],[-13,-17.8],[13,-17.8]].sort((a,b)=>b[1]-a[1])){const e={x:H.x+u.x*l[0],y:H.y+u.y*l[0]+3.4},a=at(H,d),b=at(e,d+l[1]);
    seg(a,b,3,l[1]>0?'#5a4220':BRASS);if(l[1]<=0)seg({x:a.x,y:a.y-.6},{x:b.x,y:b.y-.6},.8,rgba(BRASSL,.7));const w=at({x:e.x,y:e.y+1.6},d+l[1]);ctx.fillStyle='#0c0b0d';ctx.beginPath();ctx.arc(w.x,w.y,2.6,0,TAU);ctx.fill();ctx.fillStyle='#6a5a3a';ctx.beginPath();ctx.arc(w.x-.5,w.y-.6,1,0,TAU);ctx.fill();}
  {const top=loc(L*.5,-6),a=at(H,d),b=at(top,d);seg(a,b,4,'#2a2420');seg(a,lerpQ(a,b,.45),4.6,BRASS);seg({x:a.x-1,y:a.y},lerpQ({x:a.x-1,y:a.y},{x:b.x-1,y:b.y},.45),1,rgba(BRASSL,.7));}
  const s0=loc(-1,0),s1=loc(L+1,0),s0b=loc(-1,-8),s1b=loc(L+1,-8);
  fp([at(s0,FAR2),at(s1,FAR2),at(s1b,FAR2),at(s0b,FAR2)],'#5a503a');
  {const q=[at(s0,NEAR),at(s1,NEAR),at(s1,FAR2),at(s0,FAR2)];fp(q,lea(q[0]));fp(q,rgba('#2a2010',.18));}
  {const q=[at(s0,NEAR),at(s1,NEAR),at(s1b,NEAR),at(s0b,NEAR)];fp(q,lea(q[0]));fp(q,rgba('#2a2010',.42));}
  {const a=at(s0b,NEAR),b=at(s1b,NEAR);seg(a,b,.9,rgba(GOLD,.8));const a2=at(s0,NEAR),b2=at(s1,NEAR);seg({x:a2.x+1,y:a2.y+1},{x:b2.x-1,y:b2.y+1},1,rgba('#fff4dc',.35));}
  const b0=loc(L-bw,0),b1=loc(L,0),t1=loc(ca,cb),t0=loc(ca-bw,cb);
  fp([at(b0,FAR2),at(b1,FAR2),at(t1,FAR2),at(t0,FAR2)],'#4a4230');
  {const q=[at(b1,NEAR),at(b1,FAR2),at(t1,FAR2),at(t1,NEAR)];fp(q,lea(q[0]));fp(q,rgba('#2a2010',.5));}
  {const q=[at(t0,NEAR),at(t1,NEAR),at(t1,FAR2),at(t0,FAR2)];fp(q,lea(q[0]));fp(q,rgba('#2a2010',.22));}
  {const q=[at(b0,NEAR),at(b1,NEAR),at(t1,NEAR),at(t0,NEAR)];fp(q,lea(q[0]));fp(q,lin(ctx,q[0].x,0,q[1].x,0,[[0,rgba('#2a2010',.1)],[1,rgba('#2a2010',.38)]]));}
  ctx.strokeStyle=rgba('#3a2a14',.4);ctx.lineWidth=.8;ctx.beginPath();for(let k=1;k<5;k++){const a=at(lerpQ(b0,t0,k/5),NEAR),b=at(lerpQ(b1,t1,k/5),NEAR);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();
  ctx.strokeStyle=rgba('#fff4dc',.22);ctx.lineWidth=.6;ctx.beginPath();for(let k=1;k<5;k++){const a=at(lerpQ(b0,t0,k/5+.03),NEAR),b=at(lerpQ(b1,t1,k/5+.03),NEAR);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();
  ctx.strokeStyle=rgba(GOLD,.85);ctx.lineWidth=.8;ctx.beginPath();{const a=at(b0,NEAR),b=at(t0,NEAR),c2=at(t1,NEAR),e=at(b1,NEAR);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c2.x,c2.y);ctx.lineTo(e.x,e.y);}ctx.stroke();
  {const hm=at(loc(ca-bw*.5,cb-9),NEAR),ang=Math.atan2(u.y,u.x);ctx.fillStyle='#d8cca8';ctx.beginPath();ctx.ellipse(hm.x,hm.y,8,6,ang,0,TAU);ctx.fill();ctx.fillStyle=rgba('#2a2010',.25);ctx.beginPath();ctx.ellipse(hm.x+1,hm.y+1.2,7,4.6,ang,0,TAU);ctx.fill();ctx.fillStyle=rgba('#fffaf0',.35);ctx.beginPath();ctx.ellipse(hm.x-1,hm.y-1.6,5,2.4,ang,0,TAU);ctx.fill();}
  {const a0=at(loc(L*.5+2,2),NEAR-3),a1=at(loc(L*.5+2,21),NEAR-3);seg(a0,a1,2.4,BRASS);const e0=at(loc(L*.5-8,22),NEAR-3),e1=at(loc(L*.5+13,22),NEAR-3);seg(e0,e1,5.4,'#8a7a5a');seg({x:e0.x,y:e0.y-1.2},{x:e1.x,y:e1.y-1.2},2.6,'#d8cca8');}
  ctx.restore();return true;}
// the drinks cart: brass on four wheels, two shelves of glass, an ice bucket, a bottle laid in the lower rack
function barcart(Pp){const m=frameOf(Pp,2,3),dz=9;ctx.save();ctx.lineCap='round';ctx.lineJoin='round';shadow((Pp.pts[2].x+Pp.pts[3].x)/2,Pp.dep,40,9,.35);
  fline(m,[[-28,0],[-30,66]],dz,'#6a4a1e',2.4);fline(m,[[28,0],[30,66]],dz,'#6a4a1e',2.4);
  const wheel=(q,r)=>{ctx.fillStyle='#0c0b0d';ctx.beginPath();ctx.arc(q.x,q.y,r,0,TAU);ctx.fill();ctx.fillStyle=BRASS;ctx.beginPath();ctx.arc(q.x,q.y,r*.45,0,TAU);ctx.fill();ctx.strokeStyle=rgba(BRASSL,.6);ctx.lineWidth=.5;ctx.beginPath();ctx.arc(q.x,q.y,r*.75,3.6,5.2);ctx.stroke();};
  wheel(m(-27,-1,dz),4.2);wheel(m(27,-1,dz),4.2);
  // the lower shelf: glass on a brass frame, an ice bucket and a bottle on it
  band(m,-29,29,25,-dz,dz,rgba('#b8d8d4',.32));fline(m,[[-29,25],[29,25]],-dz,BRASS,1.6);fline(m,[[-29,25],[29,25]],dz,'#6a4a1e',1.2);
  {const q=m(-14,25,0);ctx.fillStyle=lin(ctx,q.x-6.4,0,q.x+6.4,0,[[0,'#8a9094'],[.4,'#eef2f4'],[1,'#7a8084']]);ctx.beginPath();ctx.moveTo(q.x-6.4,q.y-12);ctx.lineTo(q.x+6.4,q.y-12);ctx.lineTo(q.x+4.6,q.y);ctx.lineTo(q.x-4.6,q.y);ctx.closePath();ctx.fill();
    ctx.fillStyle='#14301e';ctx.fillRect(q.x-1.6,q.y-24,3.2,13);ctx.fillStyle=BRASS;ctx.fillRect(q.x-1.8,q.y-27,3.6,4.6);ctx.fillStyle=rgba('#ffffff',.4);ctx.fillRect(q.x-.9,q.y-23,.7,9);}
  {const a=m(2,29,0),b=m(26,29,0);seg(a,b,6.4,'#3a1a0e');seg(lerpQ(a,b,.4),lerpQ(a,b,.66),6.5,'#e8dcc0');seg(b,{x:b.x+2.4,y:b.y},5,BRASS);seg({x:a.x,y:a.y-2},{x:b.x,y:b.y-2},.8,rgba('#ffffff',.3));}
  // the top: glass with a brass gallery
  band(m,-31,31,66,-dz,dz,rgba('#c8e4e0',.36));fline(m,[[-31,66],[31,66]],-dz,BRASS,1.5);fline(m,[[-31,66],[31,66]],dz,'#6a4a1e',1);fline(m,[[-24,66],[-10,66]],-dz+3,rgba('#ffffff',.4),.9);
  fline(m,[[-31,66],[-31,70],[31,70],[31,66]],-dz,rgba(BRASS,.9),.8);
  fline(m,[[-28,0],[-30,66]],-dz,BRASS,2.8);fline(m,[[28,0],[30,66]],-dz,BRASS,2.8);fline(m,[[-29.4,6],[-30.4,62]],-dz,rgba(BRASSL,.6),.8);
  {const a=m(30,66,-dz),b=m(40,76,-dz),c2=m(40,92,-dz);ctx.strokeStyle=BRASS;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo(b.x,b.y,c2.x,c2.y);ctx.stroke();ctx.strokeStyle=rgba(BRASSL,.6);ctx.lineWidth=.6;ctx.stroke();}
  wheel(m(-27,-1,-dz),4.8);wheel(m(27,-1,-dz),4.8);ctx.restore();return true;}
// the sculpture: a white marble plinth, on it a tall leaning form in polished gold pierced by a ring
function sculpt(Pp){const m=frameOf(Pp,2,3),dz=9;ctx.save();ctx.lineJoin='round';shadow((Pp.pts[2].x+Pp.pts[3].x)/2,Pp.dep,24,7,.35);
  const MB=TX().marble(6,256,256),mp=(q)=>patAt(ctx,MB,q.x,q.y,.2);
  {const q=[m(16,0,-dz),m(16,0,dz),m(16,60,dz),m(16,60,-dz)];fp(q,mp(q[0]));fp(q,rgba('#2a2420',.45));}
  {const q=[m(-16,60,-dz),m(16,60,-dz),m(16,60,dz),m(-16,60,dz)];fp(q,mp(q[0]));fp(q,rgba('#fff8e8',.08));}
  {const q=[m(-16,0,-dz),m(16,0,-dz),m(16,60,-dz),m(-16,60,-dz)];fp(q,mp(q[0]));fp(q,lin(ctx,q[0].x,0,q[1].x,0,[[0,rgba('#2a2420',.12)],[.5,rgba('#2a2420',.2)],[1,rgba('#2a2420',.4)]]));}
  fpoly(m,[[-17,56],[17,56],[17,60],[-17,60]],-dz,rgba('#2a2420',.25));fpoly(m,[[-17,59.2],[17,59.2],[17,60],[-17,60]],-dz,rgba('#ffffff',.35));fpoly(m,[[-17,0],[17,0],[17,5],[-17,5]],-dz,rgba('#2a2420',.35));
  {const a=m(-2,62,0),tip=m(7,112,0),w=m(-8,86,0),w2=m(12,84,0);ctx.fillStyle=lin(ctx,w.x,0,w2.x,0,[[0,'#6a4416'],[.38,'#f0c870'],[.55,'#c8943e'],[1,'#3a2408']]);
    ctx.beginPath();ctx.moveTo(a.x-3,a.y);ctx.quadraticCurveTo(w.x-3,w.y,tip.x,tip.y);ctx.quadraticCurveTo(w2.x+5,w2.y+4,a.x+4,a.y);ctx.closePath();ctx.fill();
    ctx.strokeStyle=rgba('#fff4d0',.7);ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(a.x-1,a.y-3);ctx.quadraticCurveTo(w.x-1,w.y,tip.x-.6,tip.y+3);ctx.stroke();
    const rc=m(1,82,0);ctx.strokeStyle='#9a6a24';ctx.lineWidth=2.2;ctx.beginPath();ctx.ellipse(rc.x+9,rc.y,3.4,10,.2,0,TAU);ctx.stroke();ctx.strokeStyle=rgba('#ffe6a8',.6);ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(rc.x+9,rc.y,3.4,10,.2,3.7,5.6);ctx.stroke();
    gl(ctx,tip.x-2,tip.y+18,14,26,'#ffd890',.12);}
  ctx.restore();return true;}
// the globe: an old one in parchment and sepia, a brass meridian, a walnut tripod
function globe(Pp){const m=frameOf(Pp,2,3),dz=6;ctx.save();ctx.lineCap='round';shadow((Pp.pts[2].x+Pp.pts[3].x)/2,Pp.dep,18,5,.35);
  fline(m,[[0,24],[10,0]],dz,'#1e1008',3);fline(m,[[0,24],[-15,0]],-dz,'#4a2c16',3.4);fline(m,[[0,24],[15,0]],-dz,'#4a2c16',3.4);fline(m,[[-.8,23],[-14,2]],-dz,rgba('#ffdcaa',.3),.9);
  fline(m,[[0,24],[0,48]],0,BRASS,2.6);fline(m,[[-.7,25],[-.7,46]],0,rgba(BRASSL,.6),.7);
  {const c0=m(0,60,0),R=11.4;ctx.save();ctx.beginPath();ctx.arc(c0.x,c0.y,R,0,TAU);ctx.clip();
    ctx.fillStyle=rad(ctx,c0.x-3.6,c0.y-4.2,1,R,[[0,'#efe0b8'],[.6,'#c8ae7a'],[1,'#7a6038']]);ctx.fillRect(c0.x-R,c0.y-R,2*R,2*R);
    ctx.fillStyle='#8a6a3a';for(const [dx,dy,w,h,a] of [[-4,-3,5.4,7,.4],[3,3,4,6,-.5],[5,-5,3.4,3,.2],[-7,5,3,3.4,0]]){ctx.beginPath();ctx.ellipse(c0.x+dx,c0.y+dy,w,h,a,0,TAU);ctx.fill();}
    ctx.strokeStyle=rgba('#5a4020',.35);ctx.lineWidth=.4;for(const k of [-6,0,6]){ctx.beginPath();ctx.ellipse(c0.x,c0.y,R,Math.abs(k)+1.5,0,0,TAU);ctx.stroke();ctx.beginPath();ctx.ellipse(c0.x+k*.3,c0.y,Math.abs(k)+2,R,0,0,TAU);ctx.stroke();}
    ctx.fillStyle=rgba('#ffffff',.4);ctx.beginPath();ctx.ellipse(c0.x-4.6,c0.y-4.8,3.2,1.8,-.7,0,TAU);ctx.fill();ctx.fillStyle=rgba('#000000',.3);ctx.beginPath();ctx.arc(c0.x+4,c0.y+4,R,0,TAU);ctx.arc(c0.x,c0.y,R,0,TAU,true);ctx.fill();ctx.restore();
    ctx.strokeStyle=BRASS;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(c0.x,c0.y,R+2.4,R+2.4,.4,Math.PI*1.1,Math.PI*2.9);ctx.stroke();ctx.strokeStyle=rgba(BRASSL,.6);ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(c0.x,c0.y,R+2.4,R+2.4,.4,Math.PI*1.2,Math.PI*1.7);ctx.stroke();}
  ctx.restore();return true;}
// the armchair: a club chair in cognac leather, its arms rolled, brass nails along its foot
function armchair(Pp){const m=frameOf(Pp,2,3),dz=12,s=Pp.s<0?-1:1,X=(u)=>u*s;ctx.save();ctx.lineJoin='round';ctx.lineCap='round';shadow((Pp.pts[2].x+Pp.pts[3].x)/2,Pp.dep,34,9,.38);
  const LE=OT().leather(7,{base:'#8a4a2a'}),lea=(q)=>patAt(ctx,LE,q.x,q.y,.22);
  const outline=[[X(-27),9],[X(-27),50],[X(-24),56],[X(14),56],[X(18),70],[X(26),72],[X(28),48],[X(28),9]];
  for(const u of [-23,23])fpoly(m,[[u-3,0],[u+3,0],[u+2,10],[u-2,10]],dz,'#1e1008');
  {const q=outline.map(([u,v])=>m(u,v,dz));fp(q,lea(q[0]));fp(q,rgba('#120804',.6));}
  {const q=[m(X(-26),55,-dz),m(X(14),55,-dz),m(X(14),55,dz),m(X(-26),55,dz)];fp(q,lea(q[0]));fp(q,rgba('#fff0dc',.06));}
  {const q=[m(X(18),70,-dz),m(X(26),72,-dz),m(X(26),72,dz),m(X(18),70,dz)];fp(q,lea(q[0]));fp(q,rgba('#120804',.2));}
  {const q=[m(X(28),48,-dz),m(X(28),9,-dz),m(X(28),9,dz),m(X(28),48,dz)];fp(q,lea(q[0]));fp(q,rgba('#120804',.55));}
  {const q=outline.map(([u,v])=>m(u,v,-dz));fp(q,lea(q[0]));fp(q,lin(ctx,0,m(0,56,-dz).y,0,m(0,9,-dz).y,[[0,rgba('#ffd8b0',.1)],[.5,rgba('#120804',.12)],[1,rgba('#120804',.45)]]));}
  fpoly(m,[[X(-24),30],[X(16),30],[X(16),33],[X(-24),33]],-dz,rgba('#000000',.28));
  fline(m,[[X(-24),55],[X(12),55]],-dz,rgba('#ffc8a0',.5),1.6);fline(m,[[X(-26),48],[X(16),48]],-dz,rgba('#1e0a04',.55),1);
  fline(m,[[X(17),40],[X(20),68]],-dz,rgba('#1e0a04',.4),.9);fline(m,[[X(23),38],[X(26),68]],-dz,rgba('#1e0a04',.4),.9);
  // the buttons of the back, deep in the leather
  for(const [bu,bv] of [[-18,44],[-8,46],[2,46],[-13,38],[-3,39]]){const q=m(X(bu),bv,-dz+1);ctx.fillStyle=rgba('#1e0a04',.6);ctx.beginPath();ctx.arc(q.x,q.y,.8,0,TAU);ctx.fill();}
  ctx.fillStyle=GOLDL;for(let uu=-24;uu<=26;uu+=4){const q=m(X(uu),12,-dz);ctx.beginPath();ctx.arc(q.x,q.y,.7,0,TAU);ctx.fill();}
  for(const u of [-23,23]){fpoly(m,[[u-3.2,0],[u+3.2,0],[u+2,10],[u-2,10]],-dz,'#1e1008');fpoly(m,[[u-3.2,0],[u+3.2,0],[u+3,2.2],[u-3,2.2]],-dz,BRASS);}
  ctx.restore();return true;}
// the floor lamp: brass stem on a round foot, a pleated ivory shade
function floorlamp(Pp){const m=frameOf(Pp,2,3),G=glowSprites();ctx.save();ctx.lineCap='round';shadow((Pp.pts[2].x+Pp.pts[3].x)/2,Pp.dep,16,4,.35);
  {const q=m(0,1.6,0);ctx.fillStyle=BRASSD;ctx.beginPath();ctx.ellipse(q.x,q.y,13,3.6,0,0,TAU);ctx.fill();ctx.fillStyle=lin(ctx,q.x-11,0,q.x+11,0,[[0,BRASSD],[.4,BRASSL],[1,BRASSD]]);ctx.beginPath();ctx.ellipse(q.x,q.y-1.6,11.4,3,0,0,TAU);ctx.fill();}
  fline(m,[[0,3],[0,130]],0,BRASS,2.6);fline(m,[[-.8,6],[-.8,126]],0,rgba(BRASSL,.6),.8);for(const v of [40,90]){const q=m(0,v,0);ctx.fillStyle=BRASSL;ctx.fillRect(q.x-2,q.y-1,4,2);}
  {const t=m(0,138,0);ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.55;ctx.drawImage(G.dot,t.x-44,t.y-44,88,88);ctx.globalAlpha=.16;ctx.drawImage(G.cone,t.x-40,t.y+8,80,100);ctx.restore();
    ctx.fillStyle=lin(ctx,0,t.y-12,0,t.y+11,[[0,'#fff6e2'],[1,'#f0d6a4']]);ctx.beginPath();ctx.moveTo(t.x-9,t.y-12);ctx.lineTo(t.x+9,t.y-12);ctx.lineTo(t.x+15,t.y+11);ctx.lineTo(t.x-15,t.y+11);ctx.closePath();ctx.fill();
    ctx.strokeStyle=rgba('#a0784a',.3);ctx.lineWidth=.4;ctx.beginPath();for(let k=-6;k<=6;k++){ctx.moveTo(t.x+k*1.4,t.y-12);ctx.lineTo(t.x+k*2.4,t.y+11);}ctx.stroke();
    ctx.fillStyle=rgba('#ffe2a0',.7);ctx.fillRect(t.x-14,t.y+6,28,5);ctx.fillStyle=BRASS;ctx.fillRect(t.x-9.5,t.y-13.4,19,1.6);ctx.fillRect(t.x-15.4,t.y+10.4,30.8,1.6);}
  ctx.restore();return true;}
// the fig: a tall glazed pot in ivory with a gold rim, a bare trunk, a crown of big dark leaves that stirs a little
function ficus(Pp){const m=frameOf(Pp,2,3),dz=7,t=S.t;ctx.save();ctx.lineCap='round';ctx.lineJoin='round';shadow((Pp.pts[2].x+Pp.pts[3].x)/2,Pp.dep,18,5,.35);
  fpoly(m,[[-13,36],[13,36],[11,2],[-11,2]],dz,'#5a5240');
  {const a=m(-14,0,-dz),b=m(14,0,-dz);fpoly(m,[[-14,38],[14,38],[12,2],[-12,2]],-dz,lin(ctx,a.x,0,b.x,0,[[0,'#8a8068'],[.35,'#e2d8bc'],[.7,'#b8ac8c'],[1,'#5a5240']]));}
  fpoly(m,[[-14.6,38],[14.6,38],[14.4,35],[-14.4,35]],-dz,GOLD);fpoly(m,[[-10,32],[-7,32],[-6,8],[-9,8]],-dz,rgba('#ffffff',.3));
  {const q=[m(-13,38,-dz),m(13,38,-dz),m(13,38,dz),m(-13,38,dz)];fp(q,'#1a1008');}
  ctx.strokeStyle='#3a2a1a';ctx.lineWidth=3.4;{const a=m(0,38,0),b=m(-2,70,0),c2=m(3,104,0);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo(b.x,b.y,c2.x,c2.y);ctx.stroke();}
  fline(m,[[-1,70],[-12,92]],0,'#3a2a1a',1.8);fline(m,[[0,82],[13,98]],0,'#3a2a1a',1.8);
  const R=rng(((Pp.dep*131)|0)+7),cols=['#1f4a2c','#2a6038','#173a24','#347244'];
  for(let k=0;k<34;k++){const a=R()*TAU,rr=Math.sqrt(R()),cu=3+Math.cos(a)*rr*27+(R()-.5)*4,cv=100+Math.sin(a)*rr*24*.9+6,back=k<12,q=m(cu+Math.sin(t*1.2+k)*.9,cv,back?dz+3:-dz+(k%3)),ang=a+Math.PI/2+(R()-.5)*1.2+Math.sin(t*1.1+k*1.7)*.05;
    ctx.fillStyle=back?'#12301c':cols[k%4];ctx.beginPath();ctx.ellipse(q.x,q.y,10.5,4.8,ang,0,TAU);ctx.fill();
    if(!back){ctx.strokeStyle=rgba('#bee6aa',.25);ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(q.x-Math.cos(ang)*8,q.y-Math.sin(ang)*8);ctx.lineTo(q.x+Math.cos(ang)*8,q.y+Math.sin(ang)*8);ctx.stroke();}}
  ctx.restore();return true;}
const PROPS={execchair,barcart,sculpt,globe,armchair,floorlamp,ficus};
function prop(Pp){if(Pp.broken)return false;const f=PROPS[Pp.type];return f?f(Pp):false;}
// the lamps: linear chandeliers of bronze with an alabaster diffuser; the pendant over the cart, an opal globe in a brass cage
function lamp(L){if(L.kind!=='linear'&&L.kind!=='pendant')return false;
  const p=L.p,a=P(L.x,L.ay,L.dep),q=P(p.x,p.y,L.dep),k=lampGlow(L),G=glowSprites(),th=L.fallen?(L.landed?1.2:S.t*6):-Math.atan2(p.x-L.x,p.y-L.ay);
  ctx.save();ctx.translate(q.x,q.y);ctx.rotate(th);
  if(!L.fallen){const c=Math.cos(-th),s=Math.sin(-th),lx=(a.x-q.x)*c-(a.y-q.y)*s,ly=(a.x-q.x)*s+(a.y-q.y)*c;ctx.strokeStyle='#1a1208';ctx.lineWidth=1;ctx.beginPath();
    if(L.kind==='linear'){for(const e of [-52,52]){ctx.moveTo(e,-3);ctx.lineTo(e+lx,ly);}}else{ctx.moveTo(0,-8);ctx.lineTo(lx,ly);}ctx.stroke();}
  if(k>0){ctx.save();ctx.globalCompositeOperation='lighter';
    if(L.kind==='linear'){ctx.globalAlpha=.2*k;ctx.drawImage(G.cone,-76,3,152,126);ctx.globalAlpha=.65*k;ctx.drawImage(G.dot,-80,-14,160,44);}
    else{ctx.globalAlpha=.16*k;ctx.drawImage(G.cone,-44,6,88,116);ctx.globalAlpha=.8*k;ctx.drawImage(G.dot,-34,-26,68,68);}ctx.restore();}
  if(L.kind==='linear'){
    ctx.fillStyle=lin(ctx,0,-4,0,2,[[0,'#8a6a34'],[.5,'#4a3418'],[1,'#20160a']]);ctx.fillRect(-62,-4,124,6);ctx.fillStyle=rgba(BRASSL,.6);ctx.fillRect(-62,-4,124,.8);
    ctx.fillStyle=L.lit?lin(ctx,0,1.4,0,4.4,[[0,'#fff8e4'],[1,'#f0d8a8']]):'#3a3026';ctx.fillRect(-58,1.6,116,2.8);
    if(L.lit){ctx.fillStyle=rgba('#ffffff',.6);ctx.fillRect(-58,1.6,116,.6);}
    ctx.fillStyle=BRASS;ctx.fillRect(-63.5,-4.6,3.4,7.6);ctx.fillRect(60.1,-4.6,3.4,7.6);ctx.fillRect(-56.5,-6,1.6,2);ctx.fillRect(54.9,-6,1.6,2);}
  else{ctx.fillStyle=BRASS;ctx.fillRect(-2,-11,4,4);
    ctx.fillStyle=rad(ctx,-3,-1,1,11,[[0,L.lit?'#fffdf2':'#5a4a40'],[.7,L.lit?'#fff0cc':'#3a2c26'],[1,L.lit?'#e8c890':'#2a1e1a']]);ctx.beginPath();ctx.arc(0,3,10,0,TAU);ctx.fill();
    ctx.strokeStyle=BRASS;ctx.lineWidth=.8;ctx.beginPath();ctx.arc(0,3,10.4,0,TAU);ctx.moveTo(0,-7.4);ctx.quadraticCurveTo(-9,3,0,13.4);ctx.moveTo(0,-7.4);ctx.quadraticCurveTo(9,3,0,13.4);ctx.moveTo(-10.4,3);ctx.lineTo(10.4,3);ctx.stroke();
    ctx.fillStyle=BRASS;ctx.beginPath();ctx.arc(0,13.6,1.4,0,TAU);ctx.fill();}
  ctx.restore();return true;}
E.S.office={paint,live,light,prop,lamp,desk};
// the desk is drawn by its own routine as two floor items: the scene takes it over when the office is on show
if(typeof drawDesk==='function'&&!window.__officeDesk){window.__officeDesk=true;const dd0=drawDesk;window.drawDesk=function(Pp,back){const k=typeof envKey==='function'?envKey():null;if(k==='office'&&E.S.office.desk(Pp,back))return;return dd0(Pp,back);};}
})();
// ===== ENV OFFICE END =====
