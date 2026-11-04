// ===== ENV STREET =====
// Lamplight Street: the Lantern Bistro's street, after rain. Townhouses across the way with shops on the ground floor, the bistro
// among them under its lanterns; elven gas lamps along the far kerb; wet flagstones, granite kerbs and a road of granite setts
// with tram rails; beyond the roofs the city and the Hallowell tower with its ring of cyan light. Brick, stucco, dressed stone,
// mahogany, canvas and paving come from EnvTex, made once pixel by pixel and laid on as patterns.
(()=>{const E=EnvLook,{C,pp,poly,line,rect,lin,rad,rgba,mix,glow,beam,softSpill,haze,vine,scroll,gilt,windowPane,wetStreak,stars,moon,cloudBank,skyline,hallTower,rng,lerp,clamp,TAU}=E;
const TX=()=>EnvTex;
const DF=212,KB=22,LAMPD=200,LAMPX=[60,290,520,750,980];
const g0=()=>GB-KB,fy=d=>g0()-d*PSY,fx=(x,d)=>x+d*PSX;
// The street is drawn to the size of the people on it (since V75): a shop's door stands a head taller than a man on the flags in
// front of it, and the bistro's taller still. The houses are laid out on screen and drawn SK times the size of their own numbers
// about their feet (walls, windows, roofs, shopfronts: big()); the bistro's front is drawn at its full size from BG. The lamps (LK)
// and the bistro's tubs and easel (PK) are scaled the same way about their feet.
const SK=1.6,LK=1.4,PK=1.5;
const lampAt=lx=>({x:fx(lx,LAMPD)+16*LK,y:fy(LAMPD)-141*LK});
// the houses' scale: fn draws in a frame SK times the size of the screen about (cx, the facades' foot); inX takes a screen x into
// that frame, inY a screen height, and outX brings a frame's x back to the screen (the light the windows spill is kept on screen)
let XF=null;
function big(c,cx,fn){const base=fy(DF),prev=XF;c.save();c.translate(cx,base);c.scale(SK,SK);c.translate(-cx,-base);XF={cx,k:SK};try{fn(base);}finally{XF=prev;c.restore();}}
const inX=(x,cx)=>cx+(x-cx)/SK,outX=x=>XF?XF.cx+(x-XF.cx)*XF.k:x,inY=y=>{const b=fy(DF);return b-(b-y)/SK;};
// ---------- the Lantern Bistro's front, at full size ----------
// Everything on the front is placed from here: its ends (x0, x1) and pilasters (P), the fascia (gTop, fh), the two arched windows
// (W1, W2: their arch tops at yTop, sills at y1w over a stallriser st high) and the door between them (DR: its sill on the top step,
// dBase), the piers between the openings and the height their lanterns hang at, the two granite steps (each d deep from the face
// and h high). k is how much bigger than the old front its mouldings and bars are drawn. The painters, the blast and the story's
// door (doorAt) all read it.
// (the steps are the game's: BISTRO_STEPS in sk_core.js, the street's ground, x from and to in the game's x, the depth each starts at)
const BG=(()=>{const base=fy(DF),ST=typeof BISTRO_STEPS!=='undefined'?BISTRO_STEPS:[[180,292,197,4.5],[185,287,204.5,9]],
    g={base,x0:94,x1:462,P:10,gTop:base-229,fh:22,W1:[118,208],DR:[237,319],W2:[348,438],st:24,yTop:base-192,
    steps:ST.map(([a,b,d0,h])=>({d:DF-d0,h,X0:a+DF*PSX,X1:b+DF*PSX})),k:1.45};
  g.y1w=base-g.st;g.ar=(g.W1[1]-g.W1[0])/2;g.yc=g.yTop+g.ar;g.dcx=(g.DR[0]+g.DR[1])/2;g.dar=(g.DR[1]-g.DR[0])/2;g.dyc=g.yTop+g.dar;g.dBase=base-g.steps[1].h;
  const m=9;g.piers=[[g.x0,g.x0+g.P],[g.W1[1]+m,g.DR[0]-m],[g.DR[1]+m,g.W2[0]-m],[g.x1-g.P,g.x1]];g.lanY=g.gTop+g.fh+72;
  g.wcx=[(g.W1[0]+g.W1[1])/2,(g.W2[0]+g.W2[1])/2];return g;})();
// a point on the front's face (screen x at the facade) brought out to depth d and lifted h: the steps, the tubs
const fp=(X,d,h)=>({x:X-(DF-d)*PSX,y:fy(d)-(h||0)});
// how much lamplight reaches a point on the facades (for rims and pools)
const lampNear=x=>{let k=0;for(const lx of LAMPX){const q=lampAt(lx),dd=Math.abs(q.x-x);k=Math.max(k,clamp(1-dd/120,0,1));}return k;};
// windows whose light falls out onto the flags, gathered as the shopfronts are drawn
let SPILL=[];
// ---------- materials ----------
// a texture laid from (x, y), u units to a texture pixel, turned rot degrees
function patAt(c,cv,x,y,u,rot){const p=c.createPattern(cv,'repeat');if(p.setTransform){let m=new DOMMatrix().translate(x,y);if(rot)m=m.rotate(rot);p.setTransform(m.scale(u));}return p;}
// dressed stone for sills, lintels, quoins, cornices and steps: pale granite darkened for the night, its top arris lit
function stone(c,x,y,w,h,o){o=o||{};c.fillStyle=patAt(c,TX().granite(61,96,96,{base:o.base||'#6e6660'}),x,y,.25);c.fillRect(x,y,w,h);
  c.fillStyle=rgba('#05040a',o.dark==null?.5:o.dark);c.fillRect(x,y,w,h);
  if(o.lit!==false){c.fillStyle=rgba(C.rim,o.lit||.22);c.fillRect(x,y,w,Math.min(.6,h*.3));}c.fillStyle=rgba('#000000',.35);c.fillRect(x,y+h-Math.min(.5,h*.2),w,Math.min(.5,h*.2));}
// timber for the shopfronts: mahogany where o.wood says so, paint (o.paint) for the rest; the grain runs along each piece
function timber(c,o,x,y,w,h,vert){if(w<=0||h<=0)return;
  if(o.wood){c.fillStyle=patAt(c,TX().wood(o.woodSeed||11,256,128,o.wood),x,y,.25,vert?90:0);c.fillRect(x,y,w,h);c.fillStyle=rgba('#000000',o.woodDark==null?.3:o.woodDark);c.fillRect(x,y,w,h);}
  else{const p=o.paint||'#141018';c.fillStyle=lin(c,0,y,0,y+h,[[0,mix(p,'#000000',.25)],[1,p]]);c.fillRect(x,y,w,h);}}
// a raised and fielded panel: the recess shadowed along its top, its lower lip lit, the field proud with its top arris catching the lamps
function panel(c,o,x,y,w,h){if(w<2||h<2)return;timber(c,o,x,y,w,h);const m=Math.min(1.4,w*.2,h*.2);
  c.fillStyle=rgba('#000000',.5);c.fillRect(x,y,w,m*.7);c.fillRect(x,y,m*.6,h);c.fillStyle=rgba(C.rim,.14);c.fillRect(x,y+h-.5,w,.5);
  c.fillStyle=rgba('#ffe0c0',.035);c.fillRect(x+m,y+m,w-2*m,h-2*m);c.fillStyle=rgba(C.rim,.22);c.fillRect(x+m,y+m,w-2*m,.45);c.fillStyle=rgba('#000000',.35);c.fillRect(x+m,y+h-m-.45,w-2*m,.45);}
// a black glass fascia: the name gilded behind the glass, a gold fillet round it, the street's light sliding across it
function fascia(c,x,y,w,h,o){c.fillStyle=lin(c,0,y,0,y+h,[[0,'#121118'],[.4,'#07060a'],[1,'#030305']]);c.fillRect(x,y,w,h);
  c.save();c.beginPath();c.rect(x,y,w,h);c.clip();c.globalCompositeOperation='lighter';c.fillStyle=rgba('#ffe8d0',.045);
  for(let sx=x+w*.18;sx<x+w+h;sx+=Math.max(24,w*.33)){c.beginPath();c.moveTo(sx,y);c.lineTo(sx+h*.35,y);c.lineTo(sx-h*.25,y+h);c.lineTo(sx-h*.6,y+h);c.closePath();c.fill();}c.restore();
  c.strokeStyle=rgba(C.gold,.7);c.lineWidth=.63;c.strokeRect(x+1.3,y+1.3,w-2.6,h-2.6);c.fillStyle=rgba(C.gold,.85);c.fillRect(x,y+h-.8,w,.8);c.fillRect(x,y,w,.6);
  if(o.name)gilt(c,o.name,x+w/2,y+h*.74,o.size||8.5,{style:o.style||'700',track:o.track||1.2,glow:o.glowName});}
// glass seen from the street at night: a long sheen sliding across it, its top in the shade of the fascia
function glassSheen(c,x,y,w,h,a,noShade){c.save();c.beginPath();c.rect(x,y,w,h);c.clip();c.globalCompositeOperation='lighter';c.fillStyle=rgba('#fff0e0',a||.05);
  for(let sx=x+w*.12;sx<x+w+h;sx+=Math.max(30,w*.42)){c.beginPath();c.moveTo(sx,y);c.lineTo(sx+4,y);c.lineTo(sx+4-h*.45,y+h);c.lineTo(sx-h*.45,y+h);c.closePath();c.fill();}
  c.restore();if(noShade)return;const sh=Math.min(10,h*.3);c.fillStyle=lin(c,0,y,0,y+sh,[[0,rgba('#000000',.3)],[1,rgba('#000000',0)]]);c.fillRect(x,y,w,sh);}
// a door: stiles and rails, a transom light over it on a bar, the leaf's upper part glazed, a panel below, a brass knob and kick
// plate, a stone step
function shopDoor(c,o,dx,dy,dw,base,lit){const h=base-dy,th=Math.min(15,h*.17);timber(c,o,dx,dy,dw,h,true);c.strokeStyle='#040305';c.lineWidth=.94;c.strokeRect(dx+.25,dy+.25,dw-.5,h-.5);
  windowPane(c,dx+2,dy+2,dw-4,th-3,lit,{mull:1,fw:.6,spill:false});glassSheen(c,dx+2,dy+2,dw-4,th-3,.05);
  timber(c,o,dx-.6,dy+th-1,dw+1.2,2.2);c.fillStyle=rgba(C.rim,.3);c.fillRect(dx-.6,dy+th-1,dw+1.2,.4);
  const ly=dy+th+1.2,lh=base-ly,gh=lh*.5;windowPane(c,dx+2.4,ly+2,dw-4.8,gh,lit,{mull:0,fw:.7,spill:false});glassSheen(c,dx+2.4,ly+2,dw-4.8,gh,.05);
  panel(c,o,dx+2.4,ly+gh+4.5,dw-4.8,lh-gh-11);
  c.fillStyle=lin(c,0,base-5,0,base-1.6,[[0,C.goldL],[1,C.goldD]]);c.fillRect(dx+1.2,base-5,dw-2.4,3.2);
  c.fillStyle=C.goldL;c.beginPath();c.arc(dx+dw-3.4,ly+gh+2.8,.95,0,TAU);c.fill();c.fillStyle=rgba(C.goldD,.9);c.fillRect(dx+dw-4.2,ly+gh+4.4,1.6,2.4);
  stone(c,dx-2,base-1.2,dw+4,2.4,{lit:.38});}
// letters on an arc, the way gold leaf is laid on a shop window
function arcText(c,text,cx,cy,R,size,o){o=o||{};c.save();c.font=(o.style||'700')+' '+size+'px "Alegreya SC", Georgia, serif';c.textBaseline='alphabetic';
  const tr=o.track||0,ch=[...text],ws=ch.map(s=>c.measureText(s).width),tot=ws.reduce((a,b)=>a+b,0)+tr*(ch.length-1);let a=-tot/2/R;
  for(let i=0;i<ch.length;i++){const m=a+ws[i]/2/R;c.save();c.translate(cx+Math.sin(m)*R,cy+R-Math.cos(m)*R);c.rotate(m);
    c.fillStyle='rgba(0,0,0,.55)';c.fillText(ch[i],-ws[i]/2+size*.05,size*.07);c.fillStyle=lin(c,0,-size*.8,0,0,[[0,C.goldL],[.5,C.gold],[1,C.goldD]]);c.fillText(ch[i],-ws[i]/2,0);c.restore();a+=(ws[i]+tr)/R;}
  c.restore();}
// ---------- the houses ----------
// a facade across the street: x0..x1 on screen at the facade line, top on screen; floors of windows; a shopfront on the ground.
// facade() lays it out on screen and draws its body in the houses' scale (facadeBody, in that frame's numbers), then the lamps' light on
// it on screen (facadeLit). b.shopH is the ground floor's height on screen, b.ww a window's width in the frame, b.whK its height in
// a floor, b.chimH the chimneys'.
function facade(c,b){const base=fy(DF),cx=(b.x0+b.x1)/2,sh=b.shopH||160;
  big(c,cx,()=>facadeBody(c,{...b,x0:inX(b.x0,cx),x1:inX(b.x1,cx),top:inY(b.top),shopH:sh/SK}));
  facadeLit(c,b,base);return{gTop:base-sh,base};}
function facadeBody(c,b){const base=fy(DF),x0=b.x0,x1=b.x1,w=x1-x0,top=b.top,r=rng(b.seed||1),wall=b.wall||'#141117',gTop=base-(b.shopH||58);
  // the wall: brick in courses, or stucco scored as ashlar
  if(b.brick){c.fillStyle=patAt(c,TX().brick(b.seed,{base:b.bc||'#3a2420',alt:b.bc2||'#2a1816',hot:b.bc3||'#4a2a20',mortar:'#26221f'}),x0,top,1/6);c.fillRect(x0,top,w,base-top);
    c.fillStyle=lin(c,0,top,0,base,[[0,rgba('#04030a',.72)],[1,rgba('#04030a',.55)]]);c.fillRect(x0,top,w,base-top);}
  else{c.fillStyle=patAt(c,TX().plaster(b.seed,256,256,{base:b.stucco||'#3a3440'}),x0,top,.35);c.fillRect(x0,top,w,base-top);
    c.fillStyle=lin(c,0,top,0,base,[[0,rgba('#04030a',.78)],[1,rgba('#04030a',.6)]]);c.fillRect(x0,top,w,base-top);
    c.strokeStyle=rgba('#000000',.5);c.lineWidth=.9;c.beginPath();for(let y=top+8,k=0;y<gTop-6;y+=8,k++){c.moveTo(x0,y);c.lineTo(x1,y);for(let x=x0+(k%2)*14;x<x1;x+=28){c.moveTo(x,y);c.lineTo(x,Math.min(y+8,gTop-6));}}c.stroke();
    c.strokeStyle=rgba('#ffcf9a',.06);c.beginPath();for(let y=top+8.7;y<gTop-6;y+=8){c.moveTo(x0,y);c.lineTo(x1,y);}c.stroke();}
  // soot has settled under the eaves
  c.fillStyle=lin(c,0,top,0,top+24,[[0,rgba('#030206',.5)],[1,rgba('#030206',0)]]);c.fillRect(x0,top,w,24);
  // quoins: dressed stone at the corners of the brick houses, long and short in turn
  if(b.brick)for(const [qx,dir] of [[x0,1],[x1,-1]])for(let y=top+1,k=0;y+6<gTop-7;y+=6.4,k++){const qw=k%2?5.5:9.5;stone(c,dir>0?qx:qx-qw,y,qw,6,{dark:.6,lit:.1});}
  // the roof
  if(b.roof==='mansard'){const rh=b.rh||26,roof=()=>{c.beginPath();c.moveTo(x0-3,top);c.lineTo(x0+6,top-rh);c.lineTo(x1-6,top-rh);c.lineTo(x1+3,top);c.closePath();};
    roof();c.fillStyle=b.slate||'#0e1018';c.fill();
    // slates in courses, each course's joints broken against the one below
    c.save();roof();c.clip();c.strokeStyle=rgba('#2a3046',.5);c.lineWidth=.94;c.beginPath();for(let y=top-rh+3;y<top;y+=3){c.moveTo(x0-3,y);c.lineTo(x1+3,y);}c.stroke();
    c.strokeStyle=rgba('#000000',.55);c.lineWidth=.93;c.beginPath();for(let y=top-rh,k=0;y<top;y+=3,k++)for(let x=x0-3+(k%2)*2;x<x1+3;x+=4){c.moveTo(x,y);c.lineTo(x,y+3);}c.stroke();
    c.fillStyle=lin(c,0,top-rh,0,top,[[0,rgba('#8a96b8',.06)],[1,rgba('#000000',.25)]]);c.fillRect(x0-3,top-rh,w+6,rh);c.restore();
    for(let dx=x0+18;dx<x1-14;dx+=b.dorm||38){c.fillStyle='#0b0d13';c.beginPath();c.moveTo(dx-6,top-2);c.lineTo(dx-6,top-rh+8);c.lineTo(dx,top-rh+3);c.lineTo(dx+6,top-rh+8);c.lineTo(dx+6,top-2);c.fill();
      line(c,[{x:dx-6.5,y:top-rh+8.4},{x:dx,y:top-rh+3.2},{x:dx+6.5,y:top-rh+8.4}],rgba('#9aa4bc',.35),.6);
      windowPane(c,dx-3.5,top-rh+9,7,10,r()<.3?.75:0,{mull:1,fw:.8,spill:false});}
    line(c,[{x:x0+6,y:top-rh},{x:x1-6,y:top-rh}],rgba(C.rim,.45),.8);
    for(const cx of b.chim||[x0+8,x1-16]){const ch=b.chimH||14,cy=top-rh-ch;c.fillStyle=patAt(c,TX().brick(99,{base:'#3a2420',alt:'#2a1816',hot:'#4a2a20',mortar:'#26221f'}),cx,cy,1/6);c.fillRect(cx,cy,8,ch+2);
      c.fillStyle=lin(c,cx,0,cx+8,0,[[0,rgba('#04030a',.82)],[1,rgba('#04030a',.62)]]);c.fillRect(cx,cy,8,ch+2);stone(c,cx-1,cy-1.6,10,2.4,{lit:.3,dark:.6});
      for(const px of [cx+1.2,cx+4.8]){c.fillStyle=lin(c,px,0,px+2,0,[[0,'#1a0c08'],[.6,'#3a1c12'],[1,'#140906']]);c.fillRect(px,cy-5,2,3.5);c.fillStyle=rgba(C.rim,.3);c.fillRect(px-.2,cy-5.2,2.4,.5);}}}
  else if(b.roof==='gable'){const rh=b.rh||36,cx=(x0+x1)/2;c.fillStyle=b.slate||'#0f0e15';c.beginPath();c.moveTo(x0-4,top);c.lineTo(cx,top-rh);c.lineTo(x1+4,top);c.closePath();c.fill();
    // the gable is stucco like the wall below it, under a stone coping
    c.save();c.beginPath();c.moveTo(x0-1,top);c.lineTo(cx,top-rh+3);c.lineTo(x1+1,top);c.closePath();c.clip();c.fillStyle=patAt(c,TX().plaster(b.seed,256,256,{base:b.stucco||'#3a3440'}),x0,top-rh,.35);c.fillRect(x0,top-rh,w,rh);
      c.fillStyle=rgba('#04030a',.8);c.fillRect(x0,top-rh,w,rh);c.restore();
    line(c,[{x:x0-4,y:top},{x:cx,y:top-rh},{x:x1+4,y:top}],rgba(C.rim,.35),.9);windowPane(c,cx-5,top-rh*.62,10,12,r()<.5?.7:0,{arch:true,mull:1,fw:.8});}
  else{stone(c,x0-4,top-5,w+8,6,{dark:.6,lit:.35});
    if(b.balus){c.fillStyle='#0f0d13';for(let bx=x0;bx<x1;bx+=4){c.fillStyle=lin(c,bx,0,bx+2,0,[[0,'#1c1a22'],[1,'#0a090d']]);c.fillRect(bx,top-13,2,8);}stone(c,x0-2,top-15,w+4,3,{dark:.6,lit:.3});}
    if(b.urns)for(const ux of [x0+6,x1-6]){c.fillStyle=lin(c,ux-5,0,ux+5,0,[[0,'#0c0b10'],[.6,'#262230'],[1,'#0c0b10']]);c.beginPath();c.moveTo(ux-3,top-15);c.quadraticCurveTo(ux-5,top-22,ux,top-25);c.quadraticCurveTo(ux+5,top-22,ux+3,top-15);c.fill();}}
  // a cornice over the ground floor: dressed stone on a row of dentils
  stone(c,x0-3,gTop-7,w+6,4.6,{lit:.32,dark:.5});stone(c,x0-2,gTop-2.4,w+4,2.2,{lit:.1,dark:.58});c.fillStyle=rgba('#000000',.7);for(let x=x0-.4;x<x1+1;x+=2.8)c.fillRect(x,gTop-2.4,1.1,2.2);
  if(b.gild)vine(c,[{x:x0+4,y:gTop-4.6},{x:x1-4,y:gTop-4.6}],{w:.55,amp:1,wave:9,leaf:1.5,every:2,seed:b.seed});
  // the floors: windows on stone sills under stone heads, a few lit
  const fl=b.floors??2,flH=(gTop-7-top-6)/Math.max(1,fl),cols=b.cols||Math.max(2,Math.floor(w/34));
  for(let i=0;i<fl;i++)for(let j=0;j<cols;j++){const ww=Math.min(b.ww||15,w/cols*.46),wh=flH*(b.whK||.64),wx=x0+(j+.5)*w/cols-ww/2,wy=top+6+i*flH+flH*.15,arch=b.arch&&i===0;
    if(!arch){c.fillStyle=rgba('#000000',.55);c.fillRect(wx-1,wy-.5,ww+2,wh+.5);}
    const lit=r()<(b.litP||.25)?.5+r()*.5:0;windowPane(c,wx,wy,ww,wh,lit,{arch,mull:2,rows:[.38],curtain:lit&&r()<.6?rgba(r()<.5?'#4a1218':'#1a2a24',.85):null,figure:lit&&r()<.15,fw:1.1,r,sky:'#121628'});
    // the sill, and the rain that has run down the wall from it
    stone(c,wx-2.2,wy+wh,ww+4.4,2.4,{lit:.32});
    {const rr=rng(b.seed*131+i*17+j*3);for(let k=0;k<3;k++){const sx=wx-1+rr()*(ww+2),sw=.5+rr()*1.3,sl=5+rr()*12;c.fillStyle=lin(c,0,wy+wh+2.4,0,wy+wh+2.4+sl,[[0,rgba('#000000',.32)],[1,rgba('#000000',0)]]);c.fillRect(sx,wy+wh+2.4,sw,sl);}}
    // the head: a ring of voussoirs over an arch, or a stone lintel with a keystone on the grander houses
    if(arch){const cx=wx+ww/2,cy=wy+ww/2,R0=ww/2+.4,R1=ww/2+2.6;c.save();c.beginPath();c.arc(cx,cy,R1,Math.PI,0);c.arc(cx,cy,R0,0,Math.PI,true);c.closePath();c.clip();stone(c,cx-R1,cy-R1,R1*2,R1,{lit:.25});
      c.strokeStyle=rgba('#000000',.55);c.lineWidth=1.01;c.beginPath();for(let k=1;k<7;k++){const a=Math.PI+k*Math.PI/7;c.moveTo(cx+Math.cos(a)*R0,cy+Math.sin(a)*R0);c.lineTo(cx+Math.cos(a)*R1,cy+Math.sin(a)*R1);}c.stroke();c.restore();
      stone(c,cx-1.5,cy-R1-.8,3,3.4,{lit:.35});}
    else{stone(c,wx-1.8,wy-3.4,ww+3.6,3.2,{lit:.2});if(b.gild)stone(c,wx+ww/2-1.7,wy-4.4,3.4,4.6,{lit:.35});}
    if(b.boxes&&i===fl-1&&r()<.6){c.fillStyle='#120d0b';c.fillRect(wx-1,wy+wh+2.4,ww+2,3.4);c.fillStyle=rgba(C.rim,.2);c.fillRect(wx-1,wy+wh+2.4,ww+2,.4);
      for(let k=0;k<9;k++){c.fillStyle=mix('#14241a','#3a5a2c',r()*.7);c.beginPath();c.arc(wx+r()*ww,wy+wh+1.8+r()*.8,1+r()*.7,0,TAU);c.fill();}
      for(let k=0;k<3;k++){c.fillStyle=r()<.5?'#a8282c':'#c87a3a';c.fillRect(wx+r()*ww,wy+wh+.6+r(),1.1,1.1);}}
    if(b.balcony===i){const by=wy+wh+2.4;stone(c,wx-7,by,ww+14,1.8,{lit:.3,dark:.55});c.strokeStyle=C.ink;c.lineWidth=1;c.beginPath();c.moveTo(wx-6,by-8);c.lineTo(wx+ww+6,by-8);for(let bx=wx-6;bx<=wx+ww+6;bx+=2.5){c.moveTo(bx,by);c.lineTo(bx,by-8);}c.stroke();
      vine(c,[{x:wx-5,y:by-4},{x:wx+ww+5,y:by-4}],{w:.6,amp:1.5,wave:8,leaf:1.6,every:2,seed:b.seed});}}
  return gTop;}
// the lamps' light on a facade, on screen: a warm wash low down where a lamp is near, a rim on the edge toward it
function facadeLit(c,b,base){const x0=b.x0,x1=b.x1,top=b.top;
  // the faces turned to a lamp catch it: a warm wash low down, a rim on the edge toward it
  c.save();c.globalCompositeOperation='lighter';for(const lx of LAMPX){const q=lampAt(lx);if(q.x<x0-130||q.x>x1+130)continue;
    c.fillStyle=rad(c,q.x,q.y+10,0,110,[[0,rgba('#ffb866',.13)],[.5,rgba('#ffb866',.04)],[1,rgba('#ffb866',0)]]);c.fillRect(Math.max(x0,q.x-150),Math.max(top,q.y-130),Math.min(x1,q.x+150)-Math.max(x0,q.x-150),Math.min(base,q.y+170)-Math.max(top,q.y-130));}c.restore();
  for(const [ex,side] of [[x0,1],[x1,-1]]){const k=lampNear(ex);if(k<=0)continue;c.fillStyle=lin(c,ex,0,ex+side*5,0,[[0,rgba(C.rim,.45*k)],[1,rgba(C.rim,0)]]);c.fillRect(side>0?ex:ex-5,top,5,base-top);}
}
// a shopfront: pilasters with consoles, a black glass fascia, a lit window in lights over a panelled stallriser, a half-glazed door
// (o.doorAt: where the door stands along the front, 0 at the left, 1 at the right; o.doorW its width). Drawn in the houses' scale.
function shopfront(c,x0,x1,gTop,base,o){const w=x1-x0,fh=o.fasciaH||12,P=o.pil||5,st=o.stall||12;
  timber(c,o,x0+P,gTop+fh,w-2*P,base-gTop-fh);
  // pilasters either side on stone plinths, a console where each meets the fascia
  for(const px of [x0,x1-P]){timber(c,o,px,gTop,P,base-gTop,true);c.fillStyle=rgba('#000000',.4);c.fillRect(px+P*.45,gTop+fh+4,.5,base-gTop-fh-10);c.fillStyle=rgba(C.rim,.2);c.fillRect(px+P-.6,gTop+fh,.5,base-gTop-fh-4);
    stone(c,px-.4,base-4,P+.8,4,{lit:.2,dark:.55});}
  fascia(c,x0+P,gTop,w-2*P,fh,o);
  for(const px of [x0,x1-P]){timber(c,o,px-.8,gTop-2,P+1.6,fh+4,true);c.fillStyle=rgba(C.rim,.3);c.fillRect(px-.8,gTop-2,P+1.6,.5);c.fillStyle=rgba('#000000',.45);c.fillRect(px-.8,gTop+fh+1.6,P+1.6,.5);scroll(c,px+P/2,gTop+fh*.6,1.5,px===x0?1:-1,C.gold,.45,1.3);}
  timber(c,o,x0-1.5,gTop-3.4,w+3,2);c.fillStyle=rgba(C.rim,.32);c.fillRect(x0-1.5,gTop-3.4,w+3,.5);
  const wy=gTop+fh+2,dw=o.doorW||22,door=o.doorAt!=null?[lerp(x0+P+1,x1-P-1-dw,o.doorAt),dw]:[x1-P-dw-2,dw],left=door[0]<x0+w/2,win0=left?door[0]+door[1]+3:x0+P+1,win1=left?x1-P-1:door[0]-3,wh=base-st-wy,lit=o.lit==null?.9:o.lit;
  // the window, its glazing bars and transom
  windowPane(c,win0,wy,win1-win0,wh,lit,{mull:0,fw:.01,frame:'#0a0808',spill:false});
  if(o.inside)o.inside(c,win0,wy,win1-win0,wh);
  const n=o.lights||3,lw=(win1-win0)/n;
  timber(c,o,win0,wy+wh*.22,win1-win0,1.4);for(let i=1;i<n;i++){timber(c,o,win0+i*lw-.7,wy,1.4,wh,true);c.fillStyle=rgba(C.rim,.18);c.fillRect(win0+i*lw+.3,wy,.4,wh);}
  c.strokeStyle='#060405';c.lineWidth=1.01;c.strokeRect(win0,wy,win1-win0,wh);glassSheen(c,win0,wy,win1-win0,wh,.045);
  // the stallriser under it, a panel to each light, under a timber sill
  for(let i=0;i<n;i++)panel(c,o,win0+i*lw+1,wy+wh+2.4,lw-2,st-3.6);
  timber(c,o,win0-1.5,wy+wh,win1-win0+3,1.4);c.fillStyle=rgba(C.rim,.35);c.fillRect(win0-1.5,wy+wh,win1-win0+3,.45);
  shopDoor(c,o,door[0],wy-2,door[1],base,o.doorLit==null?.5:o.doorLit);
  if(lit>0)SPILL.push({x0:outX(win0),x1:outX(win1),a:lit*.6});}
// a shopfront laid out on screen (x0..x1, its ground floor shopH high) and drawn in the houses' scale
function shopAt(c,x0,x1,shopH,o){const cx=(x0+x1)/2;big(c,cx,base=>shopfront(c,inX(x0,cx),inX(x1,cx),base-shopH/SK,base,o));}
// what the other shops show in their windows, dark against the light inside
const GOODS={
  apothecary:(c,x,y,w,h)=>{const r=rng(4);for(const f of [.42,.72]){const sy=y+h*f;c.fillStyle=rgba(C.ink,.85);c.fillRect(x+2,sy,w-4,1);for(let bx=x+4;bx<x+w-4;bx+=2.6+r()*2){const bh=2.5+r()*3.5;c.fillRect(bx,sy-bh,1.6,bh);c.fillRect(bx+.4,sy-bh-1,.8,1);}}
    for(const [fx,col] of [[.22,'#3a8a5a'],[.78,'#a8302c']]){const cx=x+w*fx,cy=y+h*.22;c.fillStyle=rgba(C.ink,.9);c.beginPath();c.arc(cx,cy,4.2,0,TAU);c.fill();c.fillRect(cx-.9,cy-7,1.8,3);
      c.fillStyle=rgba(col,.85);c.beginPath();c.arc(cx,cy,3.4,0,TAU);c.fill();glow(c,cx,cy,9,col,.35);c.fillStyle=rgba('#ffffff',.35);c.beginPath();c.arc(cx-1.2,cy-1.2,.8,0,TAU);c.fill();}},
  pawn:(c,x,y,w,h)=>{c.fillStyle=rgba(C.ink,.85);const cx=x+w*.25,cy=y+h*.3;c.beginPath();c.arc(cx,cy,4,0,TAU);c.fill();c.fillStyle=rgba('#f0e2c0',.7);c.beginPath();c.arc(cx,cy,3,0,TAU);c.fill();c.strokeStyle=rgba(C.ink,.9);c.lineWidth=1.01;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx,cy-2.2);c.moveTo(cx,cy);c.lineTo(cx+1.6,cy+.6);c.stroke();
    c.fillStyle=rgba(C.ink,.85);c.save();c.translate(x+w*.6,y+h*.42);c.rotate(-.35);c.beginPath();c.ellipse(0,3,2.6,3.2,0,0,TAU);c.ellipse(0,-1.4,2,2.4,0,0,TAU);c.fill();c.fillRect(-.4,-9,.8,7);c.restore();
    c.fillRect(x+2,y+h*.7,w-4,1);for(const [fx,ww,hh] of [[.15,5,3],[.35,3,5],[.55,6,2.5],[.78,4,4]])c.fillRect(x+w*fx,y+h*.7-hh,ww,hh);},
  post:(c,x,y,w,h)=>{const r=rng(9);c.fillStyle=rgba(C.ink,.8);c.fillRect(x+2,y+h*.15,w-4,h*.5);for(let i=0;i<4;i++)for(let j=0;j<6;j++){const px=x+3+j*(w-6)/6,py=y+h*.17+i*h*.12;if(r()<.6){c.fillStyle=rgba(r()<.7?'#efe4cc':'#c8a878',.75);c.fillRect(px+.6,py+h*.06-2.2,(w-6)/6-1.6,2.2);}}
    c.fillStyle=rgba(C.ink,.85);c.fillRect(x+2,y+h*.78,w-4,h*.22);},
  wines:(c,x,y,w,h)=>{const r=rng(6);c.fillStyle=rgba(C.ink,.85);for(const f of [.35,.62,.88]){const sy=y+h*f;c.fillRect(x+2,sy,w-4,.8);for(let bx=x+3;bx<x+w-3;bx+=2.4){c.fillRect(bx,sy-5,1.7,5);c.fillRect(bx+.5,sy-7,.7,2);if(r()<.4){c.fillStyle=rgba('#ffd9a0',.35);c.fillRect(bx+.3,sy-4.6,.4,3);c.fillStyle=rgba(C.ink,.85);}}}}};
// ---------- the Lantern Bistro ----------
// mahogany front, black glass fascia with its name in gilt, the dining room's two tall arched windows with its red velvet café
// curtains inside and gold leaf on the glass, an arched glazed double door up two granite steps, brass lanterns on the piers
const BISTRO={wood:{dark:'#120705',mid:'#2e140b',light:'#55271a',rings:7,sharp:3},woodSeed:17,woodDark:.25};
// draw fn scaled k times about (x, y)
function about(c,x,y,k,fn){c.save();c.translate(x,y);c.scale(k,k);c.translate(-x,-y);try{fn();}finally{c.restore();}}
// the dining room through a window: o.k is the size of what is in it (the diners, the lanterns, the waiter), o.mirror where along
// the far wall a gilt-framed mirror hangs between two sconces (on the bigger front)
function bistroInside(c,x,y,w,h,o){o=o||{};const r=rng(o.seed||91),nl=o.lan||5,nd=o.n||8,k=o.k||1;c.save();if(o.clip)o.clip();else{c.beginPath();c.rect(x,y,w,h);}c.clip();
  // the far wall: oxblood damask over dark panelling, warm with lamplight; the bar's mirror catching it at the back
  c.fillStyle=lin(c,0,y,0,y+h,[[0,'#3a1410'],[.35,'#6e2c18'],[.62,'#5a2414'],[1,'#2a100a']]);c.fillRect(x,y,w,h);
  c.globalAlpha=.35;c.fillStyle=patAt(c,TX().damask({}),x,y,30/144*Math.min(k,1.6));c.fillRect(x,y,w,h*.6);c.globalAlpha=1;
  c.fillStyle=rgba('#160704',.85);c.fillRect(x,y+h*.6,w,h*.4);c.fillStyle=rgba(C.gold,.35);c.fillRect(x,y+h*.6,w,.5*k);
  c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,x+w*.7,0,x+w*.96,0,[[0,rgba('#ffe0a0',0)],[.5,rgba('#ffe0a0',.16)],[1,rgba('#ffe0a0',0)]]);c.fillRect(x+w*.7,y+h*.1,w*.26,h*.42);c.restore();
  if(o.mirror!=null){const mw=w*.36,mh=h*.2,mx=x+w*o.mirror-mw/2,my=y+h*.34;c.fillStyle=lin(c,0,my,0,my+mh,[[0,'#4a2416'],[1,'#2a120a']]);c.fillRect(mx,my,mw,mh);
    c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,mx,my,mx+mw,my+mh,[[0,rgba('#ffd8a0',.04)],[.42,rgba('#ffd8a0',.2)],[.5,rgba('#ffd8a0',.04)],[1,rgba('#ffd8a0',.1)]]);c.fillRect(mx,my,mw,mh);c.restore();
    c.strokeStyle=C.gold;c.lineWidth=.5*k;c.strokeRect(mx,my,mw,mh);c.strokeStyle=rgba(C.goldD,.85);c.lineWidth=.64*k;c.strokeRect(mx+.6*k,my+.6*k,mw-1.2*k,mh-1.2*k);
    for(const sx of [mx-2.4*k,mx+mw+2.4*k]){const sy=my+mh*.3;glow(c,sx,sy,6*k,'#ffc070',.55);c.fillStyle='#2a1a0a';c.fillRect(sx-.4*k,sy,.8*k,1.6*k);c.fillStyle='#fff0c8';c.beginPath();c.ellipse(sx,sy-.6*k,.45*k,.7*k,0,0,TAU);c.fill();}}
  // lanterns hanging low, each in its own glow
  for(let i=0;i<nl;i++){const lx=x+w*(nl>1?.18+i*.64/(nl-1):.5)+(r()-.5)*4*k,ly=y+h*(o.lanY||.27)+r()*h*.05;c.strokeStyle=rgba('#000000',.7);c.lineWidth=.64*k;c.beginPath();c.moveTo(lx,y);c.lineTo(lx,ly-2.4*k);c.stroke();
    glow(c,lx,ly+k,18*k,'#ffc070',.45);c.fillStyle='#2a1a0a';c.fillRect(lx-1.9*k,ly-2.6*k,3.8*k,1.1*k);c.fillStyle=lin(c,0,ly-1.5*k,0,ly+2.8*k,[[0,'#fff3d0'],[1,'#ffb25a']]);c.fillRect(lx-1.5*k,ly-1.5*k,3*k,4.3*k);c.fillStyle='#2a1a0a';c.fillRect(lx-1.9*k,ly+2.8*k,3.8*k,.9*k);}
  // diners at their tables, heads and shoulders above the curtains, candlelight on the near side of a face, a glass raised here and
  // there; a waiter with a tray
  const rod=o.rod||y+h*.6;for(let i=0;i<(o.live?0:nd);i++){const hx=x+10*k+i*(w-20*k)/Math.max(1,nd-1)+(r()-.5)*8*k,s=(.95+r()*.25)*k,hy=rod-4.2*s-r()*1.6*k,sd=r()<.5?-1:1,prof=r()<.5;
    c.fillStyle='#0c0605';c.beginPath();c.moveTo(hx-5.4*s,rod+1);c.quadraticCurveTo(hx-5*s,hy+3.4*s,hx-1.2*s,hy+2.6*s);c.lineTo(hx+1.2*s,hy+2.6*s);c.quadraticCurveTo(hx+5*s,hy+3.4*s,hx+5.4*s,rod+1);c.fill();
    c.beginPath();c.ellipse(hx,hy,2.1*s,2.5*s,0,0,TAU);c.fill();if(prof){c.beginPath();c.moveTo(hx+sd*1.8*s,hy-.4*s);c.lineTo(hx+sd*2.7*s,hy+.5*s);c.lineTo(hx+sd*1.8*s,hy+1*s);c.fill();}
    if(r()<.35){c.fillRect(hx-2.6*s,hy-2.4*s,5.2*s,.9*s);c.fillRect(hx-1.7*s,hy-4.4*s,3.4*s,2.2*s);}else if(r()<.5){c.beginPath();c.ellipse(hx-sd*.6*s,hy-1.4*s,2.4*s,1.6*s,0,0,TAU);c.fill();}
    // the candle below lights the near side of a face and the edge of a shoulder
    c.save();c.globalCompositeOperation='lighter';c.fillStyle=rad(c,hx+sd*1.2*s,hy+2*s,0,3*s,[[0,rgba('#ff9a50',.5)],[1,rgba('#ff9a50',0)]]);c.beginPath();c.ellipse(hx,hy,2.1*s,2.5*s,0,0,TAU);c.fill();
    c.strokeStyle=rgba('#ffb066',.35);c.lineWidth=.4*k;c.beginPath();c.moveTo(hx+sd*1.4*s,hy+2.8*s);c.quadraticCurveTo(hx+sd*4.6*s,hy+3.5*s,hx+sd*5.2*s,rod);c.stroke();c.restore();
    // a glass of red held up, catching the candle
    if(k>1.5&&r()<.45){const gx=hx+sd*4.4*s,gy=hy+1.6*s;c.strokeStyle='#0c0605';c.lineWidth=.9*s;c.beginPath();c.moveTo(hx+sd*3.4*s,rod);c.quadraticCurveTo(gx+sd*.8*s,gy+3*s,gx,gy+1.4*s);c.stroke();
      c.fillStyle=rgba('#e8d8c8',.35);c.beginPath();c.moveTo(gx-.9*s,gy-1.4*s);c.lineTo(gx+.9*s,gy-1.4*s);c.quadraticCurveTo(gx+.9*s,gy+.4*s,gx,gy+.6*s);c.quadraticCurveTo(gx-.9*s,gy+.4*s,gx-.9*s,gy-1.4*s);c.fill();
      c.fillStyle=rgba('#7a0c14',.9);c.beginPath();c.moveTo(gx-.75*s,gy-.5*s);c.lineTo(gx+.75*s,gy-.5*s);c.quadraticCurveTo(gx+.7*s,gy+.35*s,gx,gy+.45*s);c.quadraticCurveTo(gx-.7*s,gy+.35*s,gx-.75*s,gy-.5*s);c.fill();
      c.fillStyle=rgba('#fff0d8',.8);c.fillRect(gx-.5*s,gy-1.2*s,.25*s,.8*s);}}
  if(o.waiter!==false&&!o.live){const wx=x+w*.64,wt=rod-12*k;c.fillStyle='#0a0504';c.beginPath();c.arc(wx,wt,2.2*k,0,TAU);c.fill();c.beginPath();c.moveTo(wx-3.6*k,rod+2);c.lineTo(wx-3*k,wt+3*k);c.lineTo(wx+3*k,wt+3*k);c.lineTo(wx+3.6*k,rod+2);c.fill();
    c.strokeStyle='#0a0504';c.lineWidth=1.2*k;c.beginPath();c.moveTo(wx+2.6*k,wt+4*k);c.lineTo(wx+6*k,wt+k);c.stroke();c.fillStyle='#d8c8a8';c.fillRect(wx+3.2*k,wt-.4*k,6*k,.8*k);
    if(k>1.5){c.fillStyle='#0a0504';c.fillRect(wx+4.6*k,wt-3.6*k,1*k,3.2*k);c.fillRect(wx+4.85*k,wt-4.8*k,.5*k,1.4*k);c.fillStyle=rgba('#ffe0b0',.6);c.fillRect(wx+4.7*k,wt-3.4*k,.25*k,2.4*k);}
    c.fillStyle=rgba('#f4ead8',.9);c.fillRect(wx-1.2*k,wt+3.2*k,2.4*k,4*k);glow(c,wx+6*k,wt-k,5*k,'#fff0d0',.5);}
  c.restore();}
// ---------- the dining room behind the glass, live ----------
// The diners and the waiter are drawn every frame behind the two windows (the layer paints the room without them: o.live). Over
// supper they eat, talk, drink and glance out now and then. When the fight starts on the flags they turn to the window, stand to
// see it and flinch at the blows; one in each window goes to the back of the room a few seconds in, the waiter sets his tray down
// and follows a while after, and once Qadir is down the rest go one by one, so the room is empty when the grenade comes. The
// lanterns and the sconces breathe. It is all read off the story (when its fight began and ended: S.story.fightT0, outroT0) and
// the moment's flashes, nothing is kept, and with reduced motion nobody bobs or flinches. In the lab they watch and stay.
const DK=2.3,eas=u=>u*u*(3-2*u);
const DIN=[[BG.W1,92,['watch','duck','leave'],.7],[BG.W2,93,['leave','watch','duck'],.3]].map(([[x0,x1],seed,tem,mir],wi)=>{
  const w=x1-x0,y0=BG.yTop,y1=BG.y1w,h=y1-y0,yc=y0+w/2,rod=lerp(yc,y1,.42),r=rng(seed*7+3);
  const ds=tem.map((temper,i)=>{const s=(.95+r()*.25)*DK,hr=r(),hat=hr<.3?'top':hr<.55?'bowler':hr<.8?'bun':'bare',top=hat==='top'?4.4:hat==='bare'?2.5:3,hy0=rod-4.2*s-1;
    return{x:x0+w*(.2+.3*i)+(r()-.5)*6,s,hat,sd:r()<.5?-1:1,ph:r()*TAU,glass:r()<.55,temper,delay:.15+r()*.9,leaveAt:3.5+r()*3,outAt:.3+i*.5+r()*.3,
      dir:i===0?-1:i===2?1:(r()<.5?-1:1),rise:Math.max(0,Math.min(9,hy0-top*s-(yc+16)))};});
  const mw=w*.36,mh=h*.2,mx=x0+w*mir-mw/2,my=y0+h*.34;
  return{x0,x1,w,h,y0,y1,yc,rod,cx:(x0+x1)/2,ds,waiter:wi===1,lan:[0,1].map(i=>({x:x0+w*(.18+i*.64),y:y0+h*.265})),sc:[{x:mx-2.4*DK,y:my+mh*.3},{x:mx+mw+2.4*DK,y:my+mh*.3}]};});
// where the room is: a: they have the fight in front of them; ft: seconds since it began; out: seconds since it ended
function dinAlarm(t){const st=S.story,g=S.game;
  if(st&&st.key==='vargo'){if(st.step==='fight'||st.step==='fallen')return{a:1,ft:st.fightT0!=null?t-st.fightT0:30,out:null,lab:false};
    if(st.step==='outro'||st.step==='done')return{a:1,ft:30,out:st.outroT0!=null?t-st.outroT0:30,lab:false};
    return{a:0,ft:-9,out:null,lab:false};}
  return{a:g&&['intro','input','exchange'].includes(g.phase)?1:0,ft:30,out:null,lab:true};}
function liveDining(t,calm){const A=dinAlarm(t);let P=0;
  if(!calm)for(const e of S.flashes||[]){const u=1-e.age/(e.life||.24);if(u>0)P=Math.max(P,u*clamp((e.r||12)/22,.4,1));}
  for(const W of DIN){ctx.save();archPath(ctx,W.x0,W.y0,W.x1,W.y1,0);ctx.clip();
    const fl=calm?.5:.5+.5*Math.sin(t*5.3+W.x0)*Math.sin(t*2.1+W.x0*.3);
    for(const q of W.lan)glow(ctx,q.x,q.y+DK,18*DK,'#ffc070',.04+.07*fl);
    for(const q of W.sc)glow(ctx,q.x,q.y,6*DK,'#ffc070',.1+.16*fl);
    // the people, cut off where the curtain's rod crosses in front of them
    ctx.beginPath();ctx.rect(W.x0-1,W.y0,W.w+2,W.rod-1.3-W.y0);ctx.clip();
    if(W.waiter)liveWaiter(W,A,t,P,calm);
    for(const d of W.ds)liveDiner(W,d,A,t,P,calm);
    // the sash's middle bar and the sheen on the glass, in front of them again
    ctx.strokeStyle='#120604';ctx.lineWidth=1.5*BG.k;ctx.beginPath();ctx.moveTo(W.cx,W.yc);ctx.lineTo(W.cx,W.rod);ctx.stroke();
    ctx.strokeStyle=rgba(C.rim,.18);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(W.cx+.8*BG.k,W.yc+2*BG.k);ctx.lineTo(W.cx+.8*BG.k,W.rod);ctx.stroke();
    glassSheen(ctx,W.x0,W.y0,W.w,W.h,.04,true);
    ctx.restore();}}
// a diner: over supper a bob as he eats and talks, his head turned to whoever is across the table, a glass up now and then; with
// the fight on, turned to the window and up out of his chair (the watcher on his feet, the one who ducks half up and down behind
// the curtain at every blow), and going: off to the back of the room, smaller as he goes
function liveDiner(W,d,A,t,P,calm){
  let look=A.a?eas(clamp((A.ft-d.delay)/.7,0,1)):calm?0:clamp((Math.sin(t*.31+d.ph)-.86)*7,0,1),go=-1;
  if(!A.lab&&d.temper==='leave'&&A.a)go=A.ft-d.leaveAt;if(A.out!=null)go=Math.max(go,A.out-d.outAt);
  const gone=eas(clamp(go/1.3,0,1));if(gone>=1)return;
  const up=A.a?look*(d.temper==='watch'?1:d.temper==='duck'?.4:.8):0,s=d.s*(1-.14*gone),
    bob=calm?0:Math.sin(t*1.9+d.ph)*.25*s*(1-look)+Math.sin(t*3.1+d.ph*2)*.12*s,fl=(d.temper==='duck'?6:2.2)*s*P*look,
    hx=d.x+d.dir*gone*W.w*.55,hy=W.rod-4.2*s-1-d.rise*up+bob+fl,face=look>.5,sd=calm?d.sd:(Math.sin(t*.23+d.ph)>=0?1:-1)*d.sd;
  ctx.globalAlpha=1-gone*gone;ctx.fillStyle='#0c0605';
  ctx.beginPath();ctx.moveTo(hx-5.4*s,W.rod+1);ctx.quadraticCurveTo(hx-5*s,hy+3.4*s,hx-1.2*s,hy+2.6*s);ctx.lineTo(hx+1.2*s,hy+2.6*s);ctx.quadraticCurveTo(hx+5*s,hy+3.4*s,hx+5.4*s,W.rod+1);ctx.fill();
  ctx.beginPath();ctx.ellipse(hx,hy,2.1*s,2.5*s,0,0,TAU);ctx.fill();
  if(!face){ctx.beginPath();ctx.moveTo(hx+sd*1.8*s,hy-.4*s);ctx.lineTo(hx+sd*2.7*s,hy+.5*s);ctx.lineTo(hx+sd*1.8*s,hy+1*s);ctx.fill();}
  if(d.hat==='top'){ctx.fillRect(hx-2.6*s,hy-2.4*s,5.2*s,.9*s);ctx.fillRect(hx-1.7*s,hy-4.4*s,3.4*s,2.2*s);}
  else if(d.hat==='bowler'){ctx.beginPath();ctx.ellipse(hx,hy-1.5*s,2.2*s,1.5*s,0,Math.PI,0);ctx.fill();ctx.fillRect(hx-2.8*s,hy-1.7*s,5.6*s,.6*s);}
  else if(d.hat==='bun'){ctx.beginPath();ctx.ellipse(hx-sd*.6*s,hy-1.4*s,2.4*s,1.6*s,0,0,TAU);ctx.fill();}
  // the candle on the table lights him from below: the near side of his face, or his face and collar once he is turned to the glass
  {const fk=calm?1:.84+.16*Math.sin(t*9.3+d.ph*3)*Math.sin(t*3.7+d.ph),lx=face?hx:hx+sd*1.2*s,ly=hy+(face?1.4:2)*s,lr=(face?2.8:3)*s,a=ctx.globalAlpha;
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=rad(ctx,lx,ly,0,lr,[[0,rgba('#ff9a50',.5*fk*a)],[1,rgba('#ff9a50',0)]]);ctx.beginPath();ctx.ellipse(hx,hy,2.1*s,2.5*s,0,0,TAU);ctx.fill();
    const e=face?1:sd;ctx.strokeStyle=rgba('#ffb066',.35*fk*a);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(hx+e*1.4*s,hy+2.8*s);ctx.quadraticCurveTo(hx+e*4.6*s,hy+3.5*s,hx+e*5.2*s,W.rod);ctx.stroke();
    if(face){ctx.beginPath();ctx.moveTo(hx-1.4*s,hy+2.8*s);ctx.quadraticCurveTo(hx-4.6*s,hy+3.5*s,hx-5.2*s,W.rod);ctx.stroke();}ctx.restore();}
  // a glass of red to his lips now and then, over supper
  if(d.glass&&look<.3&&!gone){const q=Math.sin(t*.55+d.ph);if(q>.5){const u=eas(clamp((q-.5)/.25,0,1)),gx=hx+sd*(4.4-1.6*u)*s,gy=hy+(1.6-1.2*u)*s;
      ctx.strokeStyle='#0c0605';ctx.lineWidth=.9*s;ctx.beginPath();ctx.moveTo(hx+sd*3.4*s,W.rod);ctx.quadraticCurveTo(gx+sd*.8*s,gy+3*s,gx,gy+1.4*s);ctx.stroke();
      ctx.fillStyle=rgba('#e8d8c8',.35);ctx.beginPath();ctx.moveTo(gx-.9*s,gy-1.4*s);ctx.lineTo(gx+.9*s,gy-1.4*s);ctx.quadraticCurveTo(gx+.9*s,gy+.4*s,gx,gy+.6*s);ctx.quadraticCurveTo(gx-.9*s,gy+.4*s,gx-.9*s,gy-1.4*s);ctx.fill();
      ctx.fillStyle=rgba('#7a0c14',.9);ctx.beginPath();ctx.moveTo(gx-.75*s,gy-.5*s);ctx.lineTo(gx+.75*s,gy-.5*s);ctx.quadraticCurveTo(gx+.7*s,gy+.35*s,gx,gy+.45*s);ctx.quadraticCurveTo(gx-.7*s,gy+.35*s,gx-.75*s,gy-.5*s);ctx.fill();
      ctx.fillStyle=rgba('#fff0d8',.8);ctx.fillRect(gx-.5*s,gy-1.2*s,.45*s,.8*s);}}
  ctx.globalAlpha=1;}
// the waiter: up and down the room with his tray over supper; with the fight on he stops at the window and watches, the tray down,
// and a while after he goes through to the back; once it is over he is not there
function liveWaiter(W,A,t,P,calm){const k=DK;let go=-1;if(A.a&&!A.lab)go=A.ft-7.5;if(A.out!=null)go=Math.max(go,A.out-.1);
  const gone=eas(clamp(go/1.6,0,1));if(gone>=1)return;
  const look=A.a?eas(clamp((A.ft-.5)/.8,0,1)):0,ph=t*.32,walk=calm?0:Math.sin(ph),up=look<.5&&!gone,fa=gone>0?1:Math.cos(ph)>=0?1:-1,
    wx=lerp(W.x0+W.w*(.5+.28*walk),W.x0+W.w*.6,look)+gone*W.w*.62,wt=W.rod-12*k+(calm||!up?0:Math.abs(Math.sin(t*2.6))*.6)+(calm?0:P*look*2),a=1-gone*gone;
  ctx.globalAlpha=a;ctx.fillStyle='#0a0504';ctx.beginPath();ctx.arc(wx,wt,2.2*k,0,TAU);ctx.fill();
  ctx.beginPath();ctx.moveTo(wx-3.6*k,W.rod+2);ctx.lineTo(wx-3*k,wt+3*k);ctx.lineTo(wx+3*k,wt+3*k);ctx.lineTo(wx+3.6*k,W.rod+2);ctx.fill();
  if(up){ctx.strokeStyle='#0a0504';ctx.lineWidth=1.2*k;ctx.beginPath();ctx.moveTo(wx+fa*2.6*k,wt+4*k);ctx.lineTo(wx+fa*6*k,wt+k);ctx.stroke();
    ctx.fillStyle='#d8c8a8';ctx.fillRect(fa>0?wx+3.2*k:wx-9.2*k,wt-.4*k,6*k,.8*k);ctx.fillStyle='#0a0504';ctx.fillRect(wx+fa*5.1*k-.5*k,wt-3.6*k,1*k,3.2*k);
    glow(ctx,wx+fa*6*k,wt-k,5*k,'#fff0d0',.5*a);}
  ctx.fillStyle=rgba('#f4ead8',.9);ctx.fillRect(wx-1.2*k,wt+3.2*k,2.4*k,4*k);ctx.globalAlpha=1;}
// a red velvet café curtain on a brass rod, lit from behind: the folds glow where the cloth is thin
function cafeCurtain(c,x0,x1,y0,y1,k){k=k||1;const n=Math.max(3,Math.round((x1-x0)/(4*k))),fw=(x1-x0)/n;
  for(let i=0;i<n;i++){const fx=x0+i*fw;c.fillStyle=lin(c,fx,0,fx+fw,0,[[0,'#1e0306'],[.3,'#58121a'],[.5,'#76221e'],[.72,'#4a0e14'],[1,'#1e0306']]);c.fillRect(fx,y0,fw+.2,y1-y0);}
  c.fillStyle=lin(c,0,y0,0,y1,[[0,rgba('#ffb070',.16)],[.3,rgba('#000000',0)],[1,rgba('#000000',.4)]]);c.fillRect(x0,y0,x1-x0,y1-y0);
  c.fillStyle=rgba('#1a0204',.55);for(let i=0;i<n;i++){c.beginPath();c.moveTo(x0+i*fw,y0);c.quadraticCurveTo(x0+(i+.5)*fw,y0+1.3*k,x0+(i+1)*fw,y0);c.lineTo(x0+(i+1)*fw,y0-.2);c.lineTo(x0+i*fw,y0-.2);c.fill();}
  c.fillStyle=lin(c,0,y0-.9*k,0,y0+.5*k,[[0,C.goldL],[1,C.goldD]]);c.fillRect(x0-.6*k,y0-.9*k,x1-x0+1.2*k,1.3*k);
  c.fillStyle=C.gold;for(let i=0;i<=n;i++){c.beginPath();c.arc(x0+i*fw,y0+.3*k,.55*k,0,TAU);c.fill();}}
// the Lantern Bistro's front: a double-height mahogany front with the dining room's two tall arched windows in it, the same sunburst
// fanlights and red velvet café curtains on brass rods as inside, and an arched double door between them
function archPath(c,x0,y0,x1,y1,m){const ar=(x1-x0)/2,yc=y0+ar,cx=(x0+x1)/2;c.beginPath();c.moveTo(x0-m,y1);c.lineTo(x0-m,yc);c.arc(cx,yc,ar+m,Math.PI,0);c.lineTo(x1+m,y1);c.closePath();}
// the moulded architrave round an arch: mahogany, a gilt bead, its crown lit, a keystone carved with the vine (k: its size)
function archFrame(c,o,cx,yc,ar,y1,seed,k){k=k||1;const wd=TX().wood(o.woodSeed||11,256,128,o.wood),A=ar+6.5*k,B=ar+1.2*k;
  c.save();c.beginPath();c.arc(cx,yc,A,Math.PI,0);c.lineTo(cx+A,y1);c.lineTo(cx+B,y1);c.lineTo(cx+B,yc);c.arc(cx,yc,B,0,Math.PI,true);c.lineTo(cx-B,y1);c.lineTo(cx-A,y1);c.closePath();
  c.fillStyle=patAt(c,wd,cx,yc,.25,90);c.fill();c.fillStyle=rgba('#000000',.28);c.fill();c.restore();
  // (bigger, the architrave has a second bead and a shadowed hollow between them)
  if(k>1.2){c.strokeStyle=rgba('#000000',.4);c.lineWidth=1.1*k;c.beginPath();c.moveTo(cx-ar-2.4*k,y1);c.lineTo(cx-ar-2.4*k,yc);c.arc(cx,yc,ar+2.4*k,Math.PI,0);c.lineTo(cx+ar+2.4*k,y1);c.stroke();
    c.strokeStyle=rgba(C.gold,.45);c.lineWidth=.7*k;c.beginPath();c.moveTo(cx-ar-5.2*k,y1);c.lineTo(cx-ar-5.2*k,yc);c.arc(cx,yc,ar+5.2*k,Math.PI,0);c.lineTo(cx+ar+5.2*k,y1);c.stroke();}
  c.strokeStyle=rgba(C.gold,.8);c.lineWidth=.71*k;c.beginPath();c.moveTo(cx-ar-3.6*k,y1);c.lineTo(cx-ar-3.6*k,yc);c.arc(cx,yc,ar+3.6*k,Math.PI,0);c.lineTo(cx+ar+3.6*k,y1);c.stroke();
  c.strokeStyle=rgba(C.rim,.32);c.lineWidth=.71*k;c.beginPath();c.arc(cx,yc,ar+6.3*k,Math.PI*1.1,Math.PI*1.9);c.stroke();
  c.strokeStyle=rgba('#000000',.55);c.lineWidth=1.07*k;c.beginPath();c.arc(cx,yc,ar+1.5*k,Math.PI*1.05,Math.PI*1.95);c.stroke();
  const ky=yc-ar;c.fillStyle=patAt(c,wd,cx,ky,.25,90);c.beginPath();c.moveTo(cx-5*k,ky-8*k);c.lineTo(cx+5*k,ky-8*k);c.lineTo(cx+3.4*k,ky+3*k);c.lineTo(cx-3.4*k,ky+3*k);c.closePath();c.fill();
  c.fillStyle=rgba(C.rim,.3);c.fillRect(cx-5*k,ky-8*k,10*k,.6*k);c.fillStyle=rgba('#000000',.4);c.fillRect(cx-3.4*k,ky+2.4*k,6.8*k,.6*k);
  vine(c,[{x:cx,y:ky-6.5*k},{x:cx,y:ky+1.6*k}],{w:.45*k,amp:k,wave:4*k,leaf:1.2*k,every:2,seed,shadow:false});}
// a sunburst in the head of an arch: bars from the foot of the fanlight, a gilt half-sun where they meet
function sunburst(c,cx,yc,ar,col,k){k=k||1;c.strokeStyle=col;c.lineWidth=1.5*k;c.beginPath();c.moveTo(cx-ar,yc);c.lineTo(cx+ar,yc);for(let i=1;i<6;i++){const a=Math.PI+i*Math.PI/6;c.moveTo(cx,yc);c.lineTo(cx+Math.cos(a)*ar,yc+Math.sin(a)*ar);}c.stroke();
  // (bigger, a second ring of bars halfway out)
  if(k>1.2){c.lineWidth=1.01*k;c.beginPath();c.arc(cx,yc,ar*.58,Math.PI,0);c.stroke();}
  c.strokeStyle=rgba(C.rim,.22);c.lineWidth=.69*k;c.beginPath();c.moveTo(cx-ar+1,yc-1);c.lineTo(cx+ar-1,yc-1);c.stroke();
  c.fillStyle=col;c.beginPath();c.arc(cx,yc,ar*.21,Math.PI,0);c.fill();c.fillStyle=lin(c,cx-ar*.12,0,cx+ar*.12,0,[[0,C.goldD],[.5,C.goldL],[1,C.goldD]]);c.beginPath();c.arc(cx,yc-.4*k,ar*.12,Math.PI,0);c.fill();}
function bistroArch(c,o,x0,y0,x1,y1,seed,words,k){k=k||1;const w=x1-x0,h=y1-y0,ar=w/2,yc=y0+ar,cx=(x0+x1)/2,rod=lerp(yc,y1,.42),clip=()=>archPath(c,x0,y0,x1,y1,0);
  archPath(c,x0,y0,x1,y1,3.4*k);c.fillStyle='#060203';c.fill();
  bistroInside(c,x0,y0,w,h,{seed,rod,n:k>1.2?3:3,lan:2,lanY:.24,clip,live:true,waiter:seed===93,k:k>1.2?2.3:1,mirror:k>1.2?(seed===93?.3:.7):null});
  c.save();clip();c.clip();
  cafeCurtain(c,x0,x1,rod,y1,k);
  c.fillStyle=lin(c,0,y1-h*.3,0,y1,[[0,rgba('#d8d0c8',0)],[1,rgba('#d8d0c8',.09)]]);c.fillRect(x0,y1-h*.3,w,h*.3);
  if(words)words.forEach((wd,i)=>{if(wd)arcText(c,wd,lerp(x0,cx,.5)+i*ar,yc+8.5*k,90*k,3.9*k,{track:.4*k});});
  c.restore();
  // the sash: mahogany bars, the sunburst in the fanlight, a bar at the rod and one low down
  c.strokeStyle='#120604';c.lineWidth=2.4*k;clip();c.stroke();
  c.lineWidth=1.5*k;c.beginPath();c.moveTo(cx,yc);c.lineTo(cx,y1);c.moveTo(x0,lerp(yc,y1,.74));c.lineTo(x1,lerp(yc,y1,.74));c.stroke();
  // (bigger, the lit edge of each bar toward the street's lamps)
  if(k>1.2){c.strokeStyle=rgba(C.rim,.18);c.lineWidth=.4*k;c.beginPath();c.moveTo(cx+.8*k,yc+2*k);c.lineTo(cx+.8*k,y1);c.moveTo(x0+1,lerp(yc,y1,.74)-.8*k);c.lineTo(x1-1,lerp(yc,y1,.74)-.8*k);c.stroke();}
  sunburst(c,cx,yc,ar,'#120604',k);
  glassSheen(c,x0,y0,w,h,.04);
  archFrame(c,o,cx,yc,ar,y1,seed,k);
  timber(c,o,x0-6*k,y1,w+12*k,2.4*k);c.fillStyle=rgba(C.rim,.4);c.fillRect(x0-6*k,y1,w+12*k,.5*k);c.fillStyle=rgba(C.gold,.45);c.fillRect(x0-6*k,y1+2*k,w+12*k,.35*k);
  SPILL.push({x0,x1,a:1});}
function bistroDoor(c,o,x0,y0,x1,base,k){k=k||1;const w=x1-x0,ar=w/2,yc=y0+ar,cx=(x0+x1)/2;
  archPath(c,x0,y0,x1,base,3.4*k);c.fillStyle='#060203';c.fill();
  // the fanlight: the hall's warm light through it, a lantern hanging in it
  c.save();c.beginPath();c.arc(cx,yc,ar,Math.PI,0);c.closePath();c.clip();c.fillStyle=lin(c,0,y0,0,yc,[[0,'#5a2a14'],[1,'#a8622c']]);c.fillRect(x0,y0,w,ar);glow(c,cx,yc-4*k,22*k,'#ffd28a',.6);
  if(k>1.2){const ly=yc-ar*.42;c.strokeStyle=rgba('#000000',.7);c.lineWidth=1.06*k;c.beginPath();c.moveTo(cx,y0);c.lineTo(cx,ly-3*k);c.stroke();glow(c,cx,ly,12*k,'#ffe0a0',.5);
    c.fillStyle='#2a1a0a';c.fillRect(cx-2.2*k,ly-3.2*k,4.4*k,1.2*k);c.fillStyle=lin(c,0,ly-2*k,0,ly+3*k,[[0,'#fff6dc'],[1,'#ffb860']]);c.fillRect(cx-1.8*k,ly-2*k,3.6*k,5*k);c.fillStyle='#2a1a0a';c.fillRect(cx-2.2*k,ly+3*k,4.4*k,k);}
  c.restore();
  sunburst(c,cx,yc,ar,'#120604',k);c.strokeStyle='#120604';c.lineWidth=2.4*k;c.beginPath();c.arc(cx,yc,ar,Math.PI,0);c.stroke();
  // a pair of glazed leaves: café curtains low on the glass, brass push plates, a panel under a kick plate
  for(const s of [0,1]){const lx=x0+s*w/2,lw=w/2,gy=yc+2.5*k,gh=(base-yc)*.56,m=2.2*k;timber(c,o,lx,yc+k,lw,base-yc-k,true);c.strokeStyle='#050304';c.lineWidth=1.06*k;c.strokeRect(lx+.25,yc+1.25,lw-.5,base-yc-1.5);
    windowPane(c,lx+m,gy,lw-2*m,gh,.85,{mull:0,fw:.6*k,spill:false});c.save();c.beginPath();c.rect(lx+m,gy,lw-2*m,gh);c.clip();cafeCurtain(c,lx+m,lx+lw-m,gy+gh*.5,gy+gh,k);c.restore();glassSheen(c,lx+m,gy,lw-2*m,gh,.05);
    // (bigger, the glass in small panes: two bars across and one down the upper part, over the curtain)
    if(k>1.2){c.strokeStyle='#120604';c.lineWidth=1.01*k;c.beginPath();c.moveTo(lx+lw/2,gy);c.lineTo(lx+lw/2,gy+gh*.5);for(const f of [.25,.5]){c.moveTo(lx+m,gy+gh*f);c.lineTo(lx+lw-m,gy+gh*f);}c.stroke();
      c.strokeStyle=rgba(C.rim,.16);c.lineWidth=.3*k;c.beginPath();for(const f of [.25,.5]){c.moveTo(lx+m,gy+gh*f-.6*k);c.lineTo(lx+lw-m,gy+gh*f-.6*k);}c.stroke();}
    c.fillStyle=lin(c,0,gy+gh*.36,0,gy+gh*.36+7*k,[[0,C.goldL],[1,C.goldD]]);c.fillRect(s?lx+1.4*k:lx+lw-3.8*k,gy+gh*.36,2.4*k,7*k);
    panel(c,o,lx+m,gy+gh+2.4*k,lw-2*m,base-gy-gh-8*k);c.fillStyle=lin(c,0,base-4.6*k,0,base-1.6*k,[[0,C.goldL],[1,C.goldD]]);c.fillRect(lx+k,base-4.6*k,lw-2*k,3*k);
    // a brass letter plate on the right leaf's lock rail
    if(s&&k>1.2){const py=gy+gh+.8*k;c.fillStyle=lin(c,0,py,0,py+2.4*k,[[0,C.goldL],[1,C.goldD]]);c.fillRect(lx+lw*.3,py,lw*.4,2.2*k);c.fillStyle='#120604';c.fillRect(lx+lw*.33,py+.9*k,lw*.34,.5*k);}}
  // long brass pull bars on the meeting stiles, on posts
  if(k>1.2){const py=yc+(base-yc)*.44,ph=(base-yc)*.24;for(const sx of [cx-3*k,cx+3*k]){c.fillStyle=lin(c,sx-.7*k,0,sx+.7*k,0,[[0,C.goldD],[.5,C.goldL],[1,C.goldD]]);c.fillRect(sx-.6*k,py,1.2*k,ph);
    c.fillStyle=C.goldD;c.fillRect(sx-(sx<cx?1.6:-.4)*k,py+1.2*k,1.2*k,1.1*k);c.fillRect(sx-(sx<cx?1.6:-.4)*k,py+ph-2.3*k,1.2*k,1.1*k);}}
  // where the leaves meet, a bead down the join; the transom rail; the monogram in gold leaf across the glass
  c.fillStyle=rgba('#000000',.55);c.fillRect(cx-.5*k,yc+k,k,base-yc-k);c.fillStyle=rgba(C.rim,.22);c.fillRect(cx+.5*k,yc+k,.4*k,base-yc-k);
  timber(c,o,x0,yc-k,w,2.6*k);c.fillStyle=rgba(C.rim,.3);c.fillRect(x0,yc-k,w,.5*k);
  gilt(c,'L·B',cx,yc+2.5*k+(base-yc)*.17,6.5*k,{style:'700'});
  archFrame(c,o,cx,yc,ar,base,7,k);
  SPILL.push({x0,x1,a:.6});}
// a brass lantern hung on a scrolled iron bracket from the face of a pier (k: its size, about the lantern)
function pierLantern(c,x,y,k){about(c,x,y,k||1,()=>{c.strokeStyle='#09080c';c.lineWidth=1.3;c.beginPath();c.moveTo(x,y-19);c.lineTo(x,y-11);c.stroke();c.fillStyle='#09080c';c.fillRect(x-2.4,y-21,4.8,3);c.fillStyle=rgba(C.rim,.3);c.fillRect(x-2.4,y-21,4.8,.5);
  scroll(c,x-2.6,y-15,2.4,-1,C.gold,.55,1.2);scroll(c,x+2.6,y-15,2.4,1,C.gold,.55,1.2);
  c.fillStyle='#09080c';c.beginPath();c.moveTo(x-4.5,y-8);c.lineTo(x,y-11.5);c.lineTo(x+4.5,y-8);c.closePath();c.fill();c.fillStyle=rgba(C.gold,.6);c.fillRect(x-4.3,y-8.2,8.6,.4);
  c.fillStyle=lin(c,0,y-8,0,y+2,[[0,'#fff3d2'],[1,'#ffb259']]);c.beginPath();c.moveTo(x-4,y-8);c.lineTo(x+4,y-8);c.lineTo(x+3,y+2);c.lineTo(x-3,y+2);c.closePath();c.fill();
  c.strokeStyle='#09080c';c.lineWidth=1.05;c.beginPath();c.moveTo(x,y-8);c.lineTo(x,y+2);c.stroke();c.fillStyle='#09080c';c.fillRect(x-3.4,y+2,6.8,1.6);c.fillRect(x-.6,y+3.6,1.2,1.4);
  glow(c,x,y-3,30,'#ffc070',.55);});}
// the whole front, from BG
function bistroFront(c){const g=BG,o=BISTRO,k=g.k,{x0,x1,P,gTop,fh,W1,DR,W2,st,yTop,y1w,base}=g,w=x1-x0,pl=7;
  timber(c,o,x0+P,gTop+fh,w-2*P,base-gTop-fh);
  // the granite plinth it stands on
  stone(c,x0-3,base-pl,w+6,pl,{lit:.26,dark:.5});
  // pilasters and piers: fluted, on stone plinths, under moulded capitals
  for(const [a,b] of g.piers){const pw=b-a,t0=gTop+fh+3.4;timber(c,o,a,t0,pw,base-pl-t0,true);
    for(let fx=a+2;fx<b-1.6;fx+=2.2){c.fillStyle=rgba('#000000',.42);c.fillRect(fx,t0+15,.7,base-t0-38);c.fillStyle=rgba(C.rim,.14);c.fillRect(fx+.75,t0+15,.5,base-t0-38);}
    timber(c,o,a-1.5,t0+3,pw+3,5.5);c.fillStyle=rgba(C.rim,.3);c.fillRect(a-1.5,t0+3,pw+3,.7);c.fillStyle=rgba(C.gold,.55);c.fillRect(a-1.5,t0+7.6,pw+3,.55);
    stone(c,a-1,base-pl-10,pw+2,10,{lit:.3,dark:.52});}
  // the fascia: black glass with the name in gilt, carved consoles at its ends, a cornice over it with a gilt bead, and under it a
  // moulded rail with the gilt vine running along it
  fascia(c,x0+P,gTop,w-2*P,fh,{name:'LANTERN BISTRO',size:17,track:4,glowName:.32});
  {const y=gTop+fh*.5,dx=(w-2*P)/2-15;c.fillStyle=C.gold;for(const sx of [x0+w/2-dx,x0+w/2+dx]){c.beginPath();c.moveTo(sx-3,y);c.lineTo(sx,y-1.6);c.lineTo(sx+3,y);c.lineTo(sx,y+1.6);c.closePath();c.fill();}}
  for(const px of [x0,x1-P]){timber(c,o,px-1.5,gTop-4,P+3,fh+9,true);c.fillStyle=rgba(C.rim,.32);c.fillRect(px-1.5,gTop-4,P+3,.8);c.fillStyle=rgba('#000000',.5);c.fillRect(px-1.5,gTop+fh+4,P+3,.8);
    scroll(c,px+P/2,gTop+fh*.42,2.9,px===x0?1:-1,C.gold,.85,1.5);c.fillStyle=C.gold;c.beginPath();c.ellipse(px+P/2,gTop+fh*.86,1.4,2.6,0,0,TAU);c.fill();}
  timber(c,o,x0-3,gTop-6.5,w+6,3.8);c.fillStyle=rgba(C.rim,.38);c.fillRect(x0-3,gTop-6.5,w+6,.8);c.fillStyle=rgba(C.gold,.5);c.fillRect(x0-3,gTop-3.2,w+6,.55);
  timber(c,o,x0+P,gTop+fh,w-2*P,3.4);c.fillStyle=rgba(C.rim,.3);c.fillRect(x0+P,gTop+fh,w-2*P,.6);c.fillStyle=rgba('#000000',.45);c.fillRect(x0+P,gTop+fh+3,w-2*P,.5);
  vine(c,[{x:x0+P+3,y:gTop+fh+1.8},{x:x1-P-3,y:gTop+fh+1.8}],{w:.6,amp:1.2,wave:11,leaf:1.7,every:2,seed:12});
  // the two tall windows of the dining room, and under each a stallriser of three panels, the middle one with a brass grille
  const bl=blown();
  if(bl){bistroArchBlown(c,o,W1[0],yTop,W1[1],y1w,92,1);bistroArchBlown(c,o,W2[0],yTop,W2[1],y1w,93,-1);}
  else{bistroArch(c,o,W1[0],yTop,W1[1],y1w,92,['WINES','SUPPERS'],k);bistroArch(c,o,W2[0],yTop,W2[1],y1w,93,['OPEN','LATE'],k);}
  for(const [a,b] of [W1,W2]){const pw=(b-a+8)/3,py=y1w+3.5*k+1,ph=base-pl-py-2;
    for(let i=0;i<3;i++){const px=a-4+i*pw+1.2;panel(c,o,px,py,pw-2.4,ph);
      if(i===1){const gx=px+pw*.2,gw=pw*.6-2.4,gy=py+ph*.28,gh=ph*.44;c.fillStyle='#050304';c.fillRect(gx,gy,gw,gh);c.fillStyle=lin(c,0,gy,0,gy+gh,[[0,C.goldL],[1,C.goldD]]);
        for(let bx=gx+1;bx<gx+gw-.5;bx+=2.2)c.fillRect(bx,gy,.8,gh);c.strokeStyle=rgba(C.gold,.8);c.lineWidth=1;c.strokeRect(gx,gy,gw,gh);}}}
  if(bl){bistroDoorBlown(c,o,DR[0],yTop,DR[1],g.dBase);
    // the blast's soot: a fan over the front round the doorway and a plume up the fascia, darkest at the hole
    frontSoot(c,g.dcx,yTop,g.dBase,gTop);
    g.piers.forEach(([a,b],i)=>i===1||i===2?pierLanternBroken(c,(a+b)/2,g.lanY,i,k):pierLantern(c,(a+b)/2,g.lanY,k));}
  else{bistroDoor(c,o,DR[0],yTop,DR[1],g.dBase,k);
    for(const [a,b] of g.piers)pierLantern(c,(a+b)/2,g.lanY,k);}
  // a brass plaque on the pier left of the door (the hours, engraved), the house's number on the one to the right
  {const [a,b]=g.piers[1],pw=b-a,px=a+1.2,py=g.lanY+26,ph=24;c.fillStyle=rgba('#000000',.5);c.fillRect(px+.6,py+.8,pw-2.4,ph);c.fillStyle=lin(c,px,py,px+pw,py+ph,[[0,C.goldL],[.5,C.gold],[1,C.goldD]]);c.fillRect(px,py,pw-2.4,ph);
    if(bl){c.fillStyle=rgba('#050303',.55);c.fillRect(px,py,pw-2.4,ph);}
    c.fillStyle=rgba('#3a2208',.85);for(let i=0;i<6;i++)c.fillRect(px+1.4,py+3+i*3.3,(pw-5.2)*(i%3===2?.6:1),.7);c.strokeStyle=rgba('#3a2208',.9);c.lineWidth=.8;c.strokeRect(px+.6,py+.6,pw-3.6,ph-1.2);
    for(const [sx,sy] of [[px+1,py+1],[px+pw-3.4,py+1],[px+1,py+ph-1],[px+pw-3.4,py+ph-1]]){c.fillStyle='#3a2208';c.beginPath();c.arc(sx,sy,.45,0,TAU);c.fill();}}
  {const [a,b]=g.piers[2],cxp=(a+b)/2,py=g.lanY+30;c.fillStyle='#07060a';c.beginPath();c.ellipse(cxp,py,4.6,6,0,0,TAU);c.fill();c.strokeStyle=C.gold;c.lineWidth=1.01;c.stroke();
    gilt(c,'17',cxp,py+2.4,6.4,{style:'700'});}}
// the two granite steps up to the door, out on the flags (in the ground's plane), worn hollow in the middle and wet; blackened and
// cracked after the blast
function bistroSteps(c){const g=BG,bl=blown();
  for(let i=0;i<g.steps.length;i++){const s=g.steps[i],X0=s.X0,X1=s.X1,d0=DF-s.d,d1=DF,h=s.h,a=fp(X0,d0,h),b=fp(X1,d0,h),e=fp(X1,d1,h),f=fp(X0,d1,h),a0=fp(X0,d0,0),b0=fp(X1,d0,0);
    // the riser toward us, then the tread
    c.save();poly(c,[a0,b0,b,a]);c.clip();stone(c,a.x-2,a.y,b0.x-a.x+4,a0.y-a.y+1,{lit:false,dark:.62});c.restore();
    c.save();poly(c,[a,b,e,f]);c.clip();stone(c,f.x-4,f.y-1,b.x-f.x+8,a.y-f.y+2,{lit:false,dark:.45});
    // worn hollow where the feet go, and the wet in it catching the door's light
    const m=fp((X0+X1)/2,(d0+d1)/2,h);c.fillStyle=rad(c,m.x,m.y,0,(X1-X0)*.32,[[0,rgba('#000000',.18)],[1,rgba('#000000',0)]]);c.fillRect(f.x-4,f.y-1,b.x-f.x+8,a.y-f.y+2);
    if(!bl){c.save();c.globalCompositeOperation='lighter';c.fillStyle=rad(c,m.x,m.y,0,(X1-X0)*.3,[[0,rgba('#ffb060',.16)],[1,rgba('#ffb060',0)]]);c.fillRect(f.x-4,f.y-1,b.x-f.x+8,a.y-f.y+2);c.restore();}
    c.restore();
    line(c,[a,b],rgba(C.rim,bl?.18:.5),.9);c.fillStyle=rgba('#000000',.45);c.fillRect(a0.x,a0.y-.8,b0.x-a0.x,.8);
    if(bl){c.fillStyle=rgba('#050303',.55);poly(c,[a,b,e,f]);c.fill();c.fillStyle=rgba('#050303',.5);poly(c,[a0,b0,b,a]);c.fill();
      c.strokeStyle=rgba('#000000',.9);c.lineWidth=.6;c.beginPath();const q=fp(g.dcx-8+i*13,d0+1,h),q2=fp(g.dcx-4+i*13,d1-1,h);c.moveTo(q.x,q.y);c.lineTo((q.x+q2.x)/2+3,(q.y+q2.y)/2);c.lineTo(q2.x,q2.y);c.stroke();}}}
// ---------- the bistro after the grenade (S.bistro==='blown') ----------
// The doors are blown in: the left leaf hangs from its top hinge, the right lies on the floor inside; the frame is splintered and
// scorched, the fanlight's bars are gone but two, the windows either side are smashed and their curtains torn and smouldering, the
// fascia's glass is starred over the door, and soot fans out over the front and the flags. Through the hole the dining room is full
// of smoke, red from a fire low down.
function blown(){return typeof S!=='undefined'&&S.bistro==='blown';}
function doorG(){const g=BG;return{x0:g.DR[0],x1:g.DR[1],y0:g.yTop,base:g.dBase,cx:g.dcx,ar:g.dar,yc:g.dyc};}
// the room behind a blown opening: dark smoke over a red floor glow, chairs and a table thrown down, a lantern still alight (o.k: the
// size of what is in it)
function smokeRoom(c,x0,y0,w,h,seed,o){o=o||{};const r=rng(seed),y1=y0+h,cx=x0+w/2,k=o.k||1;
  c.fillStyle=lin(c,0,y0,0,y1,[[0,'#090405'],[.38,'#220b07'],[.72,'#4e1909'],[1,'#7e2e0e']]);c.fillRect(x0-2,y0-2,w+4,h+4);
  // the far wall's damask just showing in the glow, and a lantern hanging on in the murk
  c.save();c.globalAlpha=.16;c.fillStyle=patAt(c,TX().damask({}),x0,y0,30/144*Math.min(k,1.6));c.fillRect(x0,y0+h*.3,w,h*.4);c.restore();
  if(o.lantern!==false){const lx=cx+(r()-.5)*w*.4,ly=y0+h*.34;c.strokeStyle=rgba('#000000',.7);c.lineWidth=.4*k;c.beginPath();c.moveTo(lx-3*k,y0);c.lineTo(lx,ly-2*k);c.stroke();
    glow(c,lx,ly+k,14*k,'#ff9a50',.4);c.fillStyle='#2a1208';c.fillRect(lx-1.5*k,ly-2*k,3*k,k);c.fillStyle=lin(c,0,ly-k,0,ly+3*k,[[0,'#ffd8a0'],[1,'#ff8a3a']]);c.fillRect(lx-1.2*k,ly-k,2.4*k,3.4*k);}
  // the room's furniture thrown about, black against the fire: a table on its side, chairs with their legs in the air
  c.fillStyle='#0b0404';c.strokeStyle='#0b0404';c.lineCap='round';
  const fl=y1-h*.06;
  {const tx=x0+w*(.3+r()*.15),ty=fl-h*.1;c.save();c.translate(tx,ty);c.rotate(-.5);c.beginPath();c.ellipse(0,0,w*.2,h*.032,0,0,TAU);c.fill();c.lineWidth=1.2*k;c.beginPath();c.moveTo(0,0);c.lineTo(w*.02,h*.1);c.moveTo(-w*.05,h*.1);c.lineTo(w*.09,h*.1);c.stroke();c.restore();}
  for(let i=0;i<(o.chairs||2);i++){const chx=x0+w*(.15+r()*.7),chy=fl-r()*h*.04,a=(r()-.5)*2;c.save();c.translate(chx,chy);c.rotate(a);c.scale(k,k);c.lineWidth=.9;
    c.beginPath();c.moveTo(-4,0);c.lineTo(4,0);c.moveTo(-4,0);c.lineTo(-4.6,-7);c.moveTo(4,0);c.lineTo(4.4,-7);c.moveTo(-4,0);c.lineTo(-4.4,6);c.moveTo(4,0);c.lineTo(4,6);c.stroke();c.restore();}
  // (bigger, a lantern down on the floor still burning, and tongues of the fire standing up off the floor)
  if(k>1.2){const lx=x0+w*(.55+r()*.25),ly=fl-1.5*k;c.save();c.translate(lx,ly);c.rotate(1.2);c.fillStyle='#1a0a06';c.fillRect(-2*k,-3*k,4*k,6*k);c.restore();glow(c,lx,ly,9*k,'#ffb060',.55);
    c.save();c.globalCompositeOperation='lighter';for(let i=0;i<7;i++){const fx=x0+w*(.08+r()*.84),fh=h*(.06+r()*.12),fw=w*(.03+r()*.04);
      c.fillStyle=lin(c,0,y1,0,y1-fh,[[0,rgba('#ffc070',.55)],[.5,rgba('#ff7a2a',.35)],[1,rgba('#ff5a1a',0)]]);c.beginPath();c.moveTo(fx-fw,y1);c.quadraticCurveTo(fx-fw*.4,y1-fh*.6,fx+(r()-.5)*fw,y1-fh);c.quadraticCurveTo(fx+fw*.5,y1-fh*.5,fx+fw,y1);c.closePath();c.fill();}c.restore();}
  // the fire low in the room: a hot band along the floor, brighter in places
  glow(c,cx-w*.08,y1-4*k,w*.55,'#ff6a20',.5,.45);glow(c,cx+w*.18,y1-3*k,w*.3,'#ffc070',.45,.5);
  c.fillStyle=lin(c,0,y1-h*.1,0,y1,[[0,rgba('#ff7a2a',0)],[1,rgba('#ff9a40',.35)]]);c.fillRect(x0,y1-h*.1,w,h*.1);
  // the smoke: dark lumps hanging in the top, thinning toward the fire
  for(let i=0;i<9;i++){const sx=x0+r()*w,sy=y0+r()*h*.45,R=w*(.2+r()*.3);c.fillStyle=rad(c,sx,sy,0,R,[[0,rgba('#0a0607',.75)],[1,rgba('#0a0607',0)]]);c.fillRect(sx-R,sy-R,2*R,2*R);}
  c.fillStyle=lin(c,0,y0,0,y0+h*.55,[[0,rgba('#050304',.85)],[1,rgba('#050304',0)]]);c.fillRect(x0,y0,w,h*.55);}
// glass gone from a frame: the jagged pieces left in its edges, catching the fire and the lamps
function shards(c,pts,n,seed,o){o=o||{};const r=rng(seed),wk=o.wk||1;
  for(let i=0;i<n;i++){const k=Math.floor(r()*(pts.length-1)),u=r(),a=pts[k],b=pts[k+1],ex=lerp(a.x,b.x,u),ey=lerp(a.y,b.y,u),cx=o.cx,cy=o.cy;
    const ix=cx-ex,iy=cy-ey,il=Math.hypot(ix,iy)||1,dx=ix/il,dy=iy/il,L=1.4*wk+Math.pow(r(),1.6)*(o.len||6),wd=(.7+r()*1.8)*wk,tx=-dy,ty=dx,sk=(r()-.5)*1.6*wk;
    c.fillStyle=rgba(r()<.5?'#c8dce8':'#ffe2c4',.07+r()*.1);c.beginPath();c.moveTo(ex-tx*wd,ey-ty*wd);c.lineTo(ex+tx*wd*.7,ey+ty*wd*.7);c.lineTo(ex+dx*L+tx*sk,ey+dy*L+ty*sk);c.closePath();c.fill();
    c.strokeStyle=rgba('#ffe8cc',.22+r()*.22);c.lineWidth=.25*wk;c.beginPath();c.moveTo(ex+tx*wd*.7,ey+ty*wd*.7);c.lineTo(ex+dx*L+tx*sk,ey+dy*L+ty*sk);c.stroke();
    if(r()<.25){c.fillStyle=rgba('#fff6e0',.75);c.fillRect(ex+dx*L*.5,ey+dy*L*.5,.5*wk,.5*wk);}}}
// raw wood standing out of a broken edge: pale splinters with dark sides
function splinters(c,pts,n,seed,cx,cy,len,wk){const r=rng(seed);wk=wk||1;
  for(let i=0;i<n;i++){const k=Math.floor(r()*(pts.length-1)),u=r(),a=pts[k],b=pts[k+1],ex=lerp(a.x,b.x,u),ey=lerp(a.y,b.y,u);
    const ix=cx-ex,iy=cy-ey,an=Math.atan2(iy,ix)+(r()-.5)*.9,L=1.6*wk+r()*(len||5),wd=(.5+r()*1.1)*wk;
    c.fillStyle=r()<.6?'#8a5a34':'#6a4024';c.beginPath();c.moveTo(ex-Math.sin(an)*wd,ey+Math.cos(an)*wd);c.lineTo(ex+Math.sin(an)*wd,ey-Math.cos(an)*wd);c.lineTo(ex+Math.cos(an)*L,ey+Math.sin(an)*L);c.closePath();c.fill();
    c.strokeStyle=rgba('#1a0a04',.7);c.lineWidth=.25*wk;c.stroke();}}
// soot laid over whatever is drawn under it: a dark fan from a point, thinning outward
function soot(c,x,y,R,a,sq){c.save();c.translate(x,y);if(sq)c.scale(1,sq);c.fillStyle=rad(c,0,0,0,R,[[0,rgba('#050303',a)],[.45,rgba('#050303',a*.62)],[1,rgba('#050303',0)]]);c.beginPath();c.arc(0,0,R,0,TAU);c.fill();c.restore();}
function frontSoot(c,cx,y0,base,gTop){const r=rng(71),k=BG.k;
  soot(c,cx,base-30*k,64*k,.62,1.15);
  // the plume: smoke has poured up out of the top of the arch, over the fascia and the brick above
  c.save();c.beginPath();c.moveTo(cx-18*k,y0+10*k);c.bezierCurveTo(cx-26*k,y0-30*k,cx-50*k,gTop-30*k,cx-44*k,gTop-96*k);c.lineTo(cx+48*k,gTop-96*k);c.bezierCurveTo(cx+52*k,gTop-30*k,cx+26*k,y0-30*k,cx+18*k,y0+10*k);c.closePath();
  c.fillStyle=lin(c,0,y0+10*k,0,gTop-96*k,[[0,rgba('#050303',.72)],[.35,rgba('#050303',.5)],[1,rgba('#050303',0)]]);c.fill();c.restore();
  // streaks where the soot ran up the woodwork
  for(let i=0;i<18;i++){const sx=cx+(r()-.5)*70*k,sy=y0+r()*30*k,L=(20+r()*50)*k;c.fillStyle=lin(c,0,sy,0,sy-L,[[0,rgba('#050303',.35)],[1,rgba('#050303',0)]]);c.fillRect(sx,sy-L,(1+r()*2.4)*k,L);}
  // the fascia's glass over the door starred by the blast: cracks running out from a hole, a piece fallen out showing the board
  {const fy0=gTop,fh=BG.fh,hx=cx+6,hy=fy0+fh*.55;c.save();c.beginPath();c.rect(BG.x0+BG.P,fy0,BG.x1-BG.x0-2*BG.P,fh);c.clip();
    c.fillStyle='#030203';c.beginPath();c.moveTo(hx-9,hy-4);c.lineTo(hx-3,hy-8);c.lineTo(hx+7,hy-6);c.lineTo(hx+11,hy+1);c.lineTo(hx+4,hy+8);c.lineTo(hx-6,hy+6);c.closePath();c.fill();
    c.strokeStyle=rgba('#e8dccc',.38);c.lineWidth=.4;c.beginPath();for(let i=0;i<11;i++){const a=r()*TAU,L=14+r()*40;let x=hx,y=hy;c.moveTo(x,y);for(let s=0;s<4;s++){x+=Math.cos(a+(r()-.5)*.5)*L/4;y+=Math.sin(a+(r()-.5)*.5)*L/4*.6;c.lineTo(x,y);}}c.stroke();
    c.strokeStyle=rgba('#e8dccc',.22);c.beginPath();for(const R of [12,22]){c.moveTo(hx+R,hy);for(let a=0;a<=TAU+.01;a+=TAU/9)c.lineTo(hx+Math.cos(a)*R*(.8+r()*.4),hy+Math.sin(a)*R*.55*(.8+r()*.4));}c.stroke();c.restore();
    // a shard of it hanging by a corner, catching the fire
    c.fillStyle=rgba('#c8d0d8',.4);c.beginPath();c.moveTo(hx-2,fy0+fh);c.lineTo(hx+5,fy0+fh);c.lineTo(hx+1,fy0+fh+9);c.closePath();c.fill();c.strokeStyle=rgba('#ffc890',.6);c.lineWidth=.4;c.stroke();}}
function bistroDoorBlown(c,o,x0,y0,x1,base){const k=BG.k,w=x1-x0,ar=w/2,yc=y0+ar,cx=(x0+x1)/2,open=()=>archPath(c,x0,y0,x1,base,0);
  archPath(c,x0,y0,x1,base,3.4*k);c.fillStyle='#060203';c.fill();
  // through the hole, the dining room in smoke
  c.save();open();c.clip();smokeRoom(c,x0,y0,w,base-y0,31,{chairs:3,k:2.2});
  // the right leaf, down inside on the floor: seen end on, a dark slab, its kick plate catching the fire
  {const fy0=base-2*k;c.fillStyle='#120806';c.beginPath();c.moveTo(cx-4*k,fy0);c.lineTo(x1+6*k,fy0-3*k);c.lineTo(x1+12*k,fy0-15*k);c.lineTo(cx+5*k,fy0-12*k);c.closePath();c.fill();
    c.fillStyle=rgba('#ffb060',.55);c.beginPath();c.moveTo(cx-3*k,fy0-.6*k);c.lineTo(x1+6*k,fy0-3.6*k);c.lineTo(x1+6.6*k,fy0-4.8*k);c.lineTo(cx-2.4*k,fy0-1.8*k);c.closePath();c.fill();
    c.strokeStyle=rgba('#ff9a50',.4);c.lineWidth=.5*k;c.beginPath();c.moveTo(cx+5*k,fy0-12*k);c.lineTo(x1+12*k,fy0-15*k);c.stroke();}
  // the left leaf: off its lower hinge, hanging from the top one, swung in and turned, its glass gone and its foot splintered
  {const lw=w/2,lh=base-yc-k,hx=x0+k,hy=yc+2*k,sq=.8,an=.21,gh=lh*.56,m=2.2*k;c.save();c.translate(hx,hy);c.rotate(an);c.scale(sq,1);
    const leaf=()=>{c.beginPath();c.moveTo(0,0);c.lineTo(lw,0);c.lineTo(lw,lh-6*k);for(let x=lw;x>=0;x-=2.5*k)c.lineTo(x,lh-6*k+(Math.floor(x*7.3)%5)*k);c.closePath();};
    leaf();c.fillStyle=patAt(c,TX().wood(o.woodSeed||11,256,128,o.wood),0,0,.25,90);c.fill();leaf();c.fillStyle=rgba('#000000',.38);c.fill();
    // the glass is gone from the upper part: the fire shows through the frame
    c.fillStyle=lin(c,0,2.5*k,0,gh+2.5*k,[[0,'#2a0c08'],[.6,'#7a2a0e'],[1,'#c8561c']]);c.fillRect(m,2.5*k,lw-2*m,gh);
    c.strokeStyle=rgba('#ffb070',.35);c.lineWidth=.4*k;c.strokeRect(m,2.5*k,lw-2*m,gh);
    shards(c,[{x:m,y:2.5*k},{x:lw-m,y:2.5*k},{x:lw-m,y:gh+2.5*k},{x:m,y:gh+2.5*k},{x:m,y:2.5*k}],12,77,{cx:lw/2,cy:gh/2,len:5*k,wk:k});
    panel(c,o,m,gh+4.9*k,lw-2*m,lh-gh-14*k);
    c.fillStyle=lin(c,0,gh*.36,0,gh*.36+7*k,[[0,C.goldL],[1,C.goldD]]);c.save();c.translate(lw-3.8*k,gh*.4);c.rotate(.25);c.fillRect(0,0,2.4*k,7*k);c.restore();
    // its edges lit from behind by the fire, its top hinge still holding it
    c.strokeStyle=rgba('#ff8a3a',.7);c.lineWidth=.8*k;c.beginPath();c.moveTo(lw,0);c.lineTo(lw,lh-6*k);c.stroke();
    c.fillStyle=lin(c,0,-k,0,5*k,[[0,C.goldL],[1,C.goldD]]);c.fillRect(-.6*k,k,2.2*k,5*k);
    splinters(c,[{x:0,y:lh-5*k},{x:lw,y:lh-5*k}],10,61,lw/2,lh+20*k,4*k,k);
    c.restore();}
  c.restore();
  // the fanlight: its glass and most of its bars gone, two stubs left on the hub and the hub hanging
  c.strokeStyle='#120604';c.lineWidth=1.5*k;c.beginPath();for(const [i,f] of [[1,.62],[4,.45]]){const a=Math.PI+i*Math.PI/6;c.moveTo(cx,yc);c.lineTo(cx+Math.cos(a)*ar*f,yc+Math.sin(a)*ar*f);}c.stroke();
  c.save();c.translate(cx-k,yc+2*k);c.rotate(.42);c.fillStyle='#120604';c.beginPath();c.arc(0,0,ar*.21,Math.PI,0);c.fill();c.fillStyle=lin(c,-ar*.12,0,ar*.12,0,[[0,C.goldD],[.5,C.goldL],[1,C.goldD]]);c.beginPath();c.arc(0,-.4*k,ar*.12,Math.PI,0);c.fill();c.restore();
  // what is left of the fanlight's outer bar: broken off at either side of the crown
  c.strokeStyle='#120604';c.lineWidth=2.4*k;c.beginPath();c.arc(cx,yc,ar,Math.PI,Math.PI*1.22);c.stroke();c.beginPath();c.arc(cx,yc,ar,Math.PI*1.5,Math.PI*1.86);c.stroke();
  shards(c,(()=>{const q=[];for(let a=Math.PI;a<=TAU+.01;a+=Math.PI/10)q.push({x:cx+Math.cos(a)*ar,y:yc+Math.sin(a)*ar});return q;})(),12,88,{cx,cy:yc+6*k,len:4*k,wk:k});
  // the transom rail snapped: the left half hanging from the jamb, a stub on the right
  c.save();c.translate(x0,yc-k);c.rotate(.2);timber(c,o,0,0,w*.46,2.6*k);c.restore();timber(c,o,x1-6*k,yc-k,6*k,2.6*k);
  // the architrave: splintered along the opening, blackened
  archFrame(c,o,cx,yc,ar,base,7,k);
  {const q=[{x:x0+1.2*k,y:base}];q.push({x:x0+1.2*k,y:yc});for(let a=Math.PI;a<=TAU+.01;a+=Math.PI/12)q.push({x:cx+Math.cos(a)*(ar+1.2*k),y:yc+Math.sin(a)*(ar+1.2*k)});q.push({x:x1-1.2*k,y:base});
    splinters(c,q,34,93,cx,yc+20*k,6*k,k);}
  // the keystone cracked across
  c.strokeStyle=rgba('#000000',.8);c.lineWidth=.6*k;c.beginPath();c.moveTo(cx-4*k,yc-ar-6*k);c.lineTo(cx-.5*k,yc-ar-3.4*k);c.lineTo(cx+.8*k,yc-ar-5*k);c.lineTo(cx+4.4*k,yc-ar-1.8*k);c.stroke();
  SPILL.push({x0,x1,a:.9,col:'#ff6a26'});}
// a window of the dining room with its glass blown out: the room behind gone red with smoke, the curtain torn and smouldering, shards
// left in the frame, two bars of the sash broken. side is the way to the door (+1 right): that side has it worst.
function bistroArchBlown(c,o,x0,y0,x1,y1,seed,side){const k=BG.k,w=x1-x0,h=y1-y0,ar=w/2,yc=y0+ar,cx=(x0+x1)/2,rod=lerp(yc,y1,.42),clip=()=>archPath(c,x0,y0,x1,y1,0);
  archPath(c,x0,y0,x1,y1,3.4*k);c.fillStyle='#060203';c.fill();
  c.save();clip();c.clip();
  smokeRoom(c,x0,y0,w,h,seed+5,{chairs:2,k:2.2});
  // the café curtain: torn up from the bottom and burnt along the tears, a few rags still on the rod
  tornCurtain(c,x0,x1,rod,y1,seed,side,k);
  c.restore();
  // the glass: gone, but for the jagged pieces left in the frame
  const ring=[{x:x0,y:y1}];ring.push({x:x0,y:yc});for(let a=Math.PI;a<=TAU+.01;a+=Math.PI/12)ring.push({x:cx+Math.cos(a)*ar,y:yc+Math.sin(a)*ar});ring.push({x:x1,y:y1});
  shards(c,ring,24,seed*3,{cx,cy:yc+h*.2,len:5*k,wk:k});
  // the sash: its outer bar, the mullion broken through low down, the bar at the rod snapped on the door side, three bars of the sunburst left
  c.strokeStyle='#120604';c.lineWidth=2.4*k;clip();c.stroke();
  c.lineWidth=1.5*k;c.beginPath();c.moveTo(cx,yc);c.lineTo(cx,lerp(yc,y1,.58));c.moveTo(cx+side*1.4*k,lerp(yc,y1,.68));c.lineTo(cx+side*3*k,y1);
  const yb=lerp(yc,y1,.74);if(side>0){c.moveTo(x0,yb);c.lineTo(cx-4*k,yb+1.2*k);}else{c.moveTo(cx+4*k,yb+1.2*k);c.lineTo(x1,yb);}c.stroke();
  c.strokeStyle='#120604';c.lineWidth=1.5*k;c.beginPath();c.moveTo(cx-ar,yc);c.lineTo(cx+ar,yc);for(const i of side>0?[1,2,3]:[3,4,5]){const a=Math.PI+i*Math.PI/6;c.moveTo(cx,yc);c.lineTo(cx+Math.cos(a)*ar,yc+Math.sin(a)*ar);}c.stroke();
  c.fillStyle='#120604';c.beginPath();c.arc(cx,yc,ar*.21,Math.PI,0);c.fill();c.fillStyle=lin(c,cx-ar*.12,0,cx+ar*.12,0,[[0,C.goldD],[.5,C.goldL],[1,C.goldD]]);c.beginPath();c.arc(cx,yc-.4*k,ar*.12,Math.PI,0);c.fill();
  archFrame(c,o,cx,yc,ar,y1,seed,k);
  // the frame on the door's side took the blast: blackened, splintered along its inner edge
  soot(c,side>0?x1:x0,lerp(yc,y1,.5),w*.6,.55,1.6);
  splinters(c,side>0?[{x:x1-k,y:yc},{x:x1-k,y:y1}]:[{x:x0+k,y:yc},{x:x0+k,y:y1}],14,seed*5,cx,lerp(yc,y1,.5),4*k,k);
  timber(c,o,x0-6*k,y1,w+12*k,2.4*k);c.fillStyle=rgba(C.rim,.3);c.fillRect(x0-6*k,y1,w+12*k,.5*k);c.fillStyle=rgba(C.gold,.35);c.fillRect(x0-6*k,y1+2*k,w+12*k,.35*k);
  SPILL.push({x0,x1,a:.75,col:'#ff7a34'});}
// a café curtain after the blast: torn into rags of every length, gaps burnt through between them, the rags' ends charred and a few
// still glowing; the side toward the door has the least left
function tornCurtain(c,x0,x1,y0,y1,seed,side,k){k=k||1;const r=rng(seed*11+5),h=y1-y0,rags=[];
  for(let x=x0;x<x1-.5;){const wd=(1.8+r()*4.2)*k,near=side>0?(x-x0)/(x1-x0):(x1-x)/(x1-x0);
    if(r()<.14+.2*near){x+=wd*.8;continue;}
    const len=h*clamp(1-near*.55-r()*.55,.08,1),tip=(r()-.5)*wd*.8;rags.push({a:x,b:Math.min(x1,x+wd),len,tip});x+=wd;}
  const ragPath=g=>{c.moveTo(g.a,y0);c.lineTo(g.b,y0);c.lineTo(g.b-(g.b-g.a)*.1,y0+g.len*.86);c.lineTo((g.a+g.b)/2+g.tip,y0+g.len);c.lineTo(g.a+(g.b-g.a)*.12,y0+g.len*.8);c.closePath();};
  c.save();c.beginPath();for(const g of rags)ragPath(g);c.clip();cafeCurtain(c,x0,x1,y0,y1,k);c.fillStyle=lin(c,0,y0,0,y1,[[0,rgba('#050303',.3)],[1,rgba('#050303',.72)]]);c.fillRect(x0,y0,x1-x0,h);c.restore();
  // the charred ends: black, and on some a thread of embers
  for(const g of rags){const m=(g.a+g.b)/2+g.tip,yb=y0+g.len;c.strokeStyle=rgba('#0a0403',.9);c.lineWidth=.9*k;c.beginPath();c.moveTo(g.a+(g.b-g.a)*.12,y0+g.len*.8);c.lineTo(m,yb);c.lineTo(g.b-(g.b-g.a)*.1,y0+g.len*.86);c.stroke();
    if(r()<.4){c.strokeStyle=rgba('#ff7a2a',.6);c.lineWidth=.35*k;c.beginPath();c.moveTo(g.a+(g.b-g.a)*.2,y0+g.len*.84);c.lineTo(m,yb-.5*k);c.stroke();glow(c,m,yb-.4*k,2.2*k,'#ff8a3a',.6);}}}
// a pier lantern the blast reached: its glass gone, hanging askew on its bracket, the flame out (live() lets one sputter)
function pierLanternBroken(c,x,y,i,k){about(c,x,y,k||1,()=>{c.strokeStyle='#09080c';c.lineWidth=1.3;c.beginPath();c.moveTo(x,y-19);c.lineTo(x,y-11);c.stroke();c.fillStyle='#09080c';c.fillRect(x-2.4,y-21,4.8,3);
  scroll(c,x-2.6,y-15,2.4,-1,C.gold,.45,1.2);scroll(c,x+2.6,y-15,2.4,1,C.gold,.45,1.2);
  c.save();c.translate(x,y-11.5);c.rotate(i===1?.55:-.38);c.translate(-x,-(y-11.5));
  c.fillStyle='#09080c';c.beginPath();c.moveTo(x-4.5,y-8);c.lineTo(x,y-11.5);c.lineTo(x+4.5,y-8);c.closePath();c.fill();c.fillStyle=rgba(C.gold,.45);c.fillRect(x-4.3,y-8.2,8.6,.4);
  c.fillStyle='#120a08';c.beginPath();c.moveTo(x-4,y-8);c.lineTo(x+4,y-8);c.lineTo(x+3,y+2);c.lineTo(x-3,y+2);c.closePath();c.fill();
  c.strokeStyle='#09080c';c.lineWidth=.55;c.beginPath();c.moveTo(x-4,y-8);c.lineTo(x-3,y+2);c.moveTo(x+4,y-8);c.lineTo(x+3,y+2);c.moveTo(x,y-8);c.lineTo(x,y+2);c.stroke();
  shards(c,[{x:x-4,y:y-8},{x:x+4,y:y-8},{x:x+3,y:y+2},{x:x-3,y:y+2},{x:x-4,y:y-8}],5,i*13,{cx:x,cy:y-3,len:2.4});
  c.fillStyle='#09080c';c.fillRect(x-3.4,y+2,6.8,1.6);c.restore();});}
// out on the flags: the blast's scorch in front of the door, and what it threw out: splinters, glass, brass, rags of velvet, pieces of
// a door; the glass of the two windows under each
function pavementBlown(c,g){const r=rng(1301),k=BG.k,dcx=BG.dcx-DF*PSX,S0=DF-BG.steps[0].d;
  c.save();c.transform(1,0,PSX,-PSY,0,g);
  // the scorch fan, in the plane of the flags, from the foot of the steps out toward the kerb
  c.save();c.translate(dcx,S0);c.scale(1,.8);c.fillStyle=rad(c,0,0,0,70*k,[[0,rgba('#040303',.88)],[.4,rgba('#040303',.6)],[.75,rgba('#040303',.25)],[1,rgba('#040303',0)]]);c.beginPath();c.arc(0,0,70*k,Math.PI,TAU);c.fill();c.restore();
  for(let i=0;i<22;i++){const a=Math.PI*1.04+r()*Math.PI*.92,L=(40+r()*55)*k,w=.04+r()*.05;c.fillStyle=lin(c,dcx,S0,dcx+Math.cos(a)*L,S0+Math.sin(a)*L*.8,[[0,rgba('#040303',.5)],[1,rgba('#040303',0)]]);
    c.beginPath();c.moveTo(dcx,S0);c.lineTo(dcx+Math.cos(a-w)*L,S0+Math.sin(a-w)*L*.8);c.lineTo(dcx+Math.cos(a+w)*L,S0+Math.sin(a+w)*L*.8);c.closePath();c.fill();}
  c.restore();
  // the debris: thickest by the steps, thinning out across the flags; each piece lies flat and catches the light along one edge
  const items=[];for(let i=0;i<190;i++){const a=Math.PI*1.02+r()*Math.PI*.96,rr=Math.pow(r(),.7)*92*k,x=dcx+Math.cos(a)*rr*1.25,d=Math.min(S0-1.5,S0+Math.sin(a)*rr*.85);if(d<132)continue;items.push({x,d,k:r(),a:r()*TAU,s:(.6+r()*.8)*k});}
  // and glass under each of the windows
  for(const wx of BG.wcx)for(let i=0;i<34;i++){const x=wx-DF*PSX+(r()-.5)*80,d=DF-2-r()*r()*52;items.push({x,d,k:.05+r()*.25,a:r()*TAU,s:(.5+r()*.6)*k});}
  items.sort((A,B)=>B.d-A.d);
  for(const it of items){const q=pp(it.x,g,it.d),kk=it.k,s=it.s;c.save();c.translate(q.x,q.y);c.scale(1,.42);c.rotate(it.a);
    if(kk<.34){// glass: a sliver that glints
      c.fillStyle=rgba('#d8e4ec',.32);c.beginPath();c.moveTo(-2.2*s,0);c.lineTo(1.4*s,-1.2*s);c.lineTo(2*s,.9*s);c.closePath();c.fill();c.fillStyle=rgba('#fff6e8',.75);c.fillRect(-.3*s,-.4*s,.9*s,.5*s);}
    else if(kk<.74){// a splinter of mahogany
      c.fillStyle=kk<.6?'#2e140b':'#55271a';c.fillRect(-4.5*s,-.7*s,9*s,1.4*s);c.fillStyle=rgba(C.rim,.3);c.fillRect(-4.5*s,-.7*s,9*s,.4*s);}
    else if(kk<.86){// a bit of brass plate
      c.fillStyle=C.goldD;c.fillRect(-1.6*s,-1*s,3.2*s,2*s);c.fillStyle=rgba(C.goldL,.7);c.fillRect(-1.6*s,-1*s,3.2*s,.5*s);}
    else{// a rag of the red velvet
      c.fillStyle='#4a0c12';c.beginPath();c.moveTo(-3*s,-1*s);c.lineTo(2.4*s,-1.6*s);c.lineTo(3*s,1*s);c.lineTo(-1*s,1.8*s);c.closePath();c.fill();}
    c.restore();}
  // big pieces: panels off a door leaf, a piece of the fanlight's frame and its brass kick plate
  for(const [x,d,a,len] of [[dcx-50,176,.4,24],[dcx+58,164,-.7,18],[dcx-14,150,1.2,14]]){const q=pp(x,g,d);c.save();c.translate(q.x,q.y);c.scale(1,.45);c.rotate(a);
    c.fillStyle=patAt(c,TX().wood(17,256,128,BISTRO.wood),0,0,.25);c.fillRect(-len/2,-5,len,10);c.fillStyle=rgba('#000000',.4);c.fillRect(-len/2,-5,len,10);
    c.strokeStyle=rgba(C.gold,.5);c.lineWidth=.5;c.strokeRect(-len/2+1.6,-3.2,len-3.2,6.4);c.fillStyle=rgba(C.rim,.3);c.fillRect(-len/2,-5,len,.7);c.restore();}
  {const q=pp(dcx+24,g,190);c.save();c.translate(q.x,q.y);c.scale(1,.45);c.rotate(.2);c.fillStyle=lin(c,0,-3,0,3,[[0,C.goldL],[1,C.goldD]]);c.fillRect(-10,-2.4,20,4.8);c.restore();}
  {const q=pp(dcx-36,g,186);c.save();c.translate(q.x,q.y);c.scale(1,.45);c.rotate(-.3);c.strokeStyle='#2e140b';c.lineWidth=3.2;c.beginPath();c.arc(0,10,14,Math.PI*1.1,Math.PI*1.7);c.stroke();c.strokeStyle=rgba(C.rim,.3);c.lineWidth=.6;c.stroke();c.restore();}}
// the bay trees and the menu after the blast: the one nearer the door knocked over in its tub, the other scorched; the menu flat
function bayTreeDown(c,x,d){const q=pp(x,g0(),d),r=rng((x*7)|0);
  c.fillStyle=rgba('#000000',.5);c.beginPath();c.ellipse(q.x-6,q.y,13,2,0,0,TAU);c.fill();
  // spilled soil, then the tub on its side
  c.fillStyle='#0c0807';c.beginPath();c.ellipse(q.x-12,q.y-.6,9,1.6,0,0,TAU);c.fill();
  c.save();c.translate(q.x,q.y);c.rotate(-1.42);
  c.fillStyle=lin(c,-4,0,4,0,[[0,'#060508'],[.62,'#1c1820'],[1,'#08070a']]);c.beginPath();c.moveTo(-4,-7);c.lineTo(4,-7);c.lineTo(3.3,0);c.lineTo(-3.3,0);c.closePath();c.fill();
  c.fillStyle=lin(c,-4,0,4,0,[[0,C.goldD],[.6,C.goldL],[1,C.goldD]]);c.fillRect(-3.9,-6.3,7.8,.7);c.fillRect(-3.5,-1.8,7,.7);
  c.fillStyle='#120c08';c.fillRect(-.5,-16,1,9);c.restore();
  // the clipped ball of the tree lying on the flags beyond it, leaves stripped and scattered
  const cx=q.x-19,cy=q.y-4.5,R=5;c.fillStyle='#070c08';c.beginPath();c.ellipse(cx,cy,R,R*.8,0,0,TAU);c.fill();
  for(let i=0;i<55;i++){const a=r()*TAU,rr=Math.sqrt(r())*R,lx=cx+Math.cos(a)*rr,ly=cy+Math.sin(a)*rr*.8;c.fillStyle=mix('#0a140c','#3e5a2e',r()*.4);c.beginPath();c.ellipse(lx,ly,1,.55,r()*Math.PI,0,TAU);c.fill();}
  for(let i=0;i<14;i++){c.fillStyle=mix('#0a140c','#3e5a2e',r()*.5);c.beginPath();c.ellipse(q.x-30+r()*40,q.y-r()*2.4,.9,.4,r()*Math.PI,0,TAU);c.fill();}}
function bayTreeScorched(c,x,d){bayTree(c,x,d);const q=pp(x,g0(),d),r=rng((x*11)|0),cx=q.x,cy=q.y-21;
  c.fillStyle=rad(c,cx-1.5,cy+1,0,6.4,[[0,rgba('#040303',.8)],[1,rgba('#040303',.25)]]);c.beginPath();c.arc(cx,cy,5.6,0,TAU);c.fill();
  for(let i=0;i<7;i++){const a=r()*TAU,rr=r()*4.6;c.fillStyle=rgba('#ff7a2a',.6+r()*.3);c.fillRect(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr,.6,.6);}
  c.fillStyle=rgba('#040303',.55);c.fillRect(q.x-4,q.y-7.6,8,7.6);}
function chalkMenuDown(c,x,d){const q=pp(x,g0(),d);c.save();c.translate(q.x+4,q.y-1);c.scale(1,.42);c.rotate(.5);
  c.fillStyle=rgba('#000000',.5);c.fillRect(-7,-5,15,12);c.fillStyle=patAt(c,TX().wood(17,256,128,BISTRO.wood),0,0,.25);c.fillRect(-7,-6,14,12);c.fillStyle=rgba('#000000',.35);c.fillRect(-7,-6,14,12);
  c.fillStyle='#14161a';c.fillRect(-5.6,-4.6,11.2,9.2);c.restore();
  c.strokeStyle='#1a0c08';c.lineWidth=.9;c.beginPath();c.moveTo(q.x-2,q.y-1);c.lineTo(q.x-5,q.y-8);c.moveTo(q.x+8,q.y-2);c.lineTo(q.x+10,q.y-8);c.stroke();}
// ---------- street furniture ----------
// an elven gas lamp at world x on the far kerb: a fluted post on a plinth, a gold vine climbing it, a scrolled arm and a lantern
function lampPost(c,lx){const x=fx(lx,LAMPD),base=fy(LAMPD),top=base-150;
  c.save();c.lineCap='round';
  c.fillStyle=rgba('#000000',.45);c.beginPath();c.ellipse(x+1,base,8,1.6,0,0,TAU);c.fill();
  c.fillStyle=lin(c,x-5.5,0,x+5.5,0,[[0,'#060509'],[.65,'#18161e'],[1,'#07060a']]);c.fillRect(x-4,base-12,8,12);c.fillRect(x-5.5,base-3,11,3);c.fillStyle=rgba(C.rim,.4);c.fillRect(x-4,base-12,8,.7);c.fillRect(x-5.5,base-3,11,.5);
  c.fillStyle=lin(c,x-2.2,0,x+2.2,0,[[0,'#060609'],[.6,'#121017'],[1,'#08070a']]);c.fillRect(x-2.2,top+8,4.4,base-12-top-8);
  c.fillStyle=rgba('#000000',.5);c.fillRect(x-.9,top+12,.4,base-26-top);c.fillStyle=rgba(C.rim,.5);c.fillRect(x+1.4,top+10,.7,base-24-top);
  vine(c,[{x,y:base-14},{x,y:top+22}],{w:.6,amp:1.6,wave:14,leaf:2,every:2,seed:lx,col:C.gold});
  c.strokeStyle='#09080c';c.lineWidth=2.4;c.beginPath();c.moveTo(x,top+10);c.quadraticCurveTo(x+6,top-2,x+16,top+1);c.stroke();
  scroll(c,x+5,top+8,4,1,C.gold,.7,1.3);
  c.fillStyle='#09080c';c.fillRect(x-3,top+6,6,4);c.beginPath();c.arc(x,top+5,2.2,0,TAU);c.fill();
  const lx2=x+16,ly=top+1;c.fillStyle='#09080c';c.beginPath();c.moveTo(lx2-6,ly+4);c.lineTo(lx2,ly-1);c.lineTo(lx2+6,ly+4);c.closePath();c.fill();
  c.fillStyle=C.gold;c.fillRect(lx2-.6,ly-4,1.2,3);
  c.fillStyle=lin(c,0,ly+4,0,ly+14,[[0,'#fff6dc'],[1,'#ffc272']]);c.beginPath();c.moveTo(lx2-5,ly+4);c.lineTo(lx2+5,ly+4);c.lineTo(lx2+3.6,ly+14);c.lineTo(lx2-3.6,ly+14);c.closePath();c.fill();
  c.strokeStyle='#09080c';c.lineWidth=1.07;c.beginPath();c.moveTo(lx2,ly+4);c.lineTo(lx2,ly+14);c.stroke();c.fillStyle='#09080c';c.fillRect(lx2-4,ly+14,8,2);
  c.restore();}
// the bistro's lanterns, hung from gilt brackets
function lantern(c,lx,ly){c.strokeStyle='#09080c';c.lineWidth=1.2;c.beginPath();c.moveTo(lx,ly-10);c.lineTo(lx+9,ly-10);c.stroke();scroll(c,lx+3,ly-6,3,1,C.gold,.6,1.2);
  c.fillStyle='#09080c';c.fillRect(lx-1,ly-12,2,4);c.fillStyle=rgba(C.rim,.3);c.fillRect(lx-1,ly-12,2,.4);
  c.strokeStyle=rgba('#000000',.9);c.lineWidth=.5;c.beginPath();c.moveTo(lx+9,ly-10);c.lineTo(lx+9,ly-4);c.stroke();
  c.fillStyle='#09080c';c.beginPath();c.moveTo(lx+5,ly-3);c.lineTo(lx+9,ly-6);c.lineTo(lx+13,ly-3);c.fill();c.fillStyle=rgba(C.gold,.6);c.fillRect(lx+5.2,ly-3.2,7.6,.4);
  c.fillStyle=lin(c,0,ly-3,0,ly+6,[[0,'#fff3d2'],[1,'#ffb259']]);c.beginPath();c.moveTo(lx+5.5,ly-3);c.lineTo(lx+12.5,ly-3);c.lineTo(lx+11.5,ly+6);c.lineTo(lx+6.5,ly+6);c.closePath();c.fill();
  c.strokeStyle='#09080c';c.lineWidth=.35;c.beginPath();c.moveTo(lx+9,ly-3);c.lineTo(lx+9,ly+6);c.stroke();c.fillStyle='#09080c';c.fillRect(lx+6,ly+6,6,1.6);
  glow(c,lx+9,ly+1,30,'#ffc070',.55);}
// a clipped bay tree in a black oak tub with brass bands, its leaves dark against the window, rimmed by its light
function bayTree(c,x,d){const q=pp(x,g0(),d),r=rng((x*7)|0),cx=q.x,cy=q.y-21,R=5.5;
  c.fillStyle=rgba('#000000',.5);c.beginPath();c.ellipse(q.x+1,q.y,6.5,1.5,0,0,TAU);c.fill();
  c.fillStyle=lin(c,q.x-4,0,q.x+4,0,[[0,'#060508'],[.62,'#1c1820'],[1,'#08070a']]);c.beginPath();c.moveTo(q.x-4,q.y-7);c.lineTo(q.x+4,q.y-7);c.lineTo(q.x+3.3,q.y);c.lineTo(q.x-3.3,q.y);c.closePath();c.fill();
  c.fillStyle=lin(c,q.x-4,0,q.x+4,0,[[0,C.goldD],[.6,C.goldL],[1,C.goldD]]);c.fillRect(q.x-3.9,q.y-6.3,7.8,.7);c.fillRect(q.x-3.5,q.y-1.8,7,.7);
  c.fillStyle='#0a0705';c.fillRect(q.x-4.3,q.y-7.6,8.6,1);c.fillStyle='#120c08';c.fillRect(q.x-.5,q.y-16,1,9);
  c.fillStyle='#070c08';c.beginPath();c.arc(cx,cy,R,0,TAU);c.fill();
  for(let i=0;i<80;i++){const a=r()*TAU,rr=Math.sqrt(r())*R,lx=cx+Math.cos(a)*rr,ly=cy+Math.sin(a)*rr*.95,k=clamp((cy-ly)/R*.35+(lx-cx)/R*.25+.35,0,1);
    c.fillStyle=mix('#0a140c',r()<.5?'#3e5a2e':'#56682f',k*.55);c.beginPath();c.ellipse(lx,ly,1,.55,r()*Math.PI,0,TAU);c.fill();}
  c.strokeStyle=rgba('#ffb866',.35);c.lineWidth=.6;c.beginPath();c.arc(cx,cy,R-.2,-Math.PI*.95,-Math.PI*.15);c.stroke();}
// the menu in chalk on a slate, on a mahogany easel at the edge of the pavement
function chalkMenu(c,x,d){const q=pp(x,g0(),d),bw=10,bh=13,tx=q.x-bw/2,ty=q.y-bh-1;
  c.fillStyle=rgba('#000000',.5);c.beginPath();c.ellipse(q.x+1,q.y,7.5,1.5,0,0,TAU);c.fill();
  c.fillStyle=patAt(c,TX().wood(17,256,128,BISTRO.wood),tx,ty,.25,90);c.beginPath();c.moveTo(tx+.8,ty);c.lineTo(tx+bw-.8,ty);c.lineTo(tx+bw,q.y);c.lineTo(tx+bw-1.4,q.y);c.lineTo(tx+bw-1.7,ty+bh);c.lineTo(tx+1.7,ty+bh);c.lineTo(tx+1.4,q.y);c.lineTo(tx,q.y);c.closePath();c.fill();
  c.fillStyle=rgba('#000000',.3);c.fill();c.fillStyle=rgba(C.rim,.32);c.fillRect(tx+.8,ty,bw-1.6,.5);
  c.fillStyle=lin(c,0,ty,0,ty+bh,[[0,'#1a1c20'],[1,'#101216']]);c.fillRect(tx+1.5,ty+1.4,bw-3,bh-2.8);
  c.save();c.font='italic 700 2.7px "Alegreya SC", Georgia, serif';c.textAlign='center';c.fillStyle=rgba('#ece6da',.82);c.fillText('ce soir',q.x,ty+4.2);c.restore();
  const r=rng(5);c.strokeStyle=rgba('#ece6da',.5);c.lineWidth=.54;for(let k=0;k<4;k++){const ly=ty+5.8+k*1.8,l=4+r()*2.4;c.beginPath();c.moveTo(q.x-l/2,ly);for(let s=0;s<=l;s+=.6)c.lineTo(q.x-l/2+s,ly+(r()-.5)*.35);c.stroke();}
  c.fillStyle=rgba('#e8c060',.7);c.beginPath();c.arc(q.x,ty+bh-2.2,.6,0,TAU);c.fill();}
// a coal-hole cover set into the flags, and a drain grate in the gutter: iron, wet, catching the light
function coalHole(c,x,d){c.save();c.transform(1,0,PSX,-PSY,0,g0());c.translate(x,d);
  c.fillStyle='#0a090c';c.beginPath();c.arc(0,0,4.2,0,TAU);c.fill();c.strokeStyle=rgba('#b0a498',.22);c.lineWidth=.35;
  for(const rr of [1.3,2.5,3.5]){c.beginPath();c.arc(0,0,rr,0,TAU);c.stroke();}for(let k=0;k<8;k++){const a=k/8*TAU;c.beginPath();c.moveTo(Math.cos(a)*1.3,Math.sin(a)*1.3);c.lineTo(Math.cos(a)*3.5,Math.sin(a)*3.5);c.stroke();}
  c.strokeStyle=rgba(C.rim,.3);c.lineWidth=.5;c.beginPath();c.arc(0,0,4.2,Math.PI*1.15,Math.PI*1.85);c.stroke();c.restore();}
function grate(c,x){c.save();c.transform(1,0,PSX,-PSY,0,GB);c.fillStyle='#040306';c.fillRect(x,113,16,6);c.fillStyle=rgba('#b8a898',.24);for(let k=0;k<7;k++)c.fillRect(x+1+k*2.2,113.6,1,4.8);c.restore();}
// ---------- the scene ----------
function paint(c){SPILL=[];
  const X0=-160,X1=W+240,T0=-110,base=fy(DF),H=h=>base-h;
  // the night sky, warmer down toward the roofs where the city lights it
  c.fillStyle=lin(c,0,T0,0,base,[[0,C.night0],[.18,'#0a0d1a'],[.38,'#1a1a2a'],[.6,'#34222c'],[1,'#4a2c26']]);c.fillRect(X0,T0,X1-X0,base-T0+4);
  stars(c,X0,X1,T0,60,150,9,.6);
  moon(c,612,-54,12,{phase:.55});
  cloudBank(c,X0,X1,-44,30,{seed:4,n:18,col:'#171726',under:'#ff9a5a'});
  // the city beyond the street: far towers in haze, the Hallowell tower over the roofs, then nearer roofs (seen down the gap)
  skyline(c,X0,X1,base-40,{seed:12,far:.95,h0:40,h1:150,w0:16,w1:34,col:'#171828',hazeCol:'#3a2a36',hazeH:100,hazeA:.6,dens:.6});
  hallTower(c,726,base-30,-62,52,{lit:.9});
  skyline(c,X0,X1,base-6,{seed:23,far:.55,h0:30,h1:80,w0:22,w1:46,col:'#121220',hazeCol:'#3e2a30',hazeH:60,hazeA:.5,dens:.8});
  glow(c,726,base-60,260,'#ff9a5a',.1,.45);
  // the row across the street (on screen: x at the facade line, the wall's top; the ground floor shopH high)
  const B=[
    {x0:-160,x1:-16,top:H(262),roof:'mansard',rh:28,floors:1,seed:3,brick:true,wall:'#130f12',litP:.3,bc:'#2e2224',bc2:'#22181a',bc3:'#3a2822'},
    {x0:-16,x1:70,top:H(246),roof:'gable',rh:32,floors:1,seed:5,wall:'#121016',litP:.35,boxes:true,stucco:'#3e3a36'},
    {x0:88,x1:468,top:H(322),roof:'mansard',rh:22,floors:1,seed:8,brick:true,wall:'#1a1013',litP:.55,boxes:true,balcony:0,shopH:229,dorm:40,gild:true,ww:19,whK:.7,chimH:7,
      wxs:[141,185,278,371,415],bc:'#4a2620',bc2:'#341a16',bc3:'#5a3020'},
    {x0:468,x1:550,top:H(252),roof:'flat',balus:true,urns:true,floors:1,seed:13,wall:'#121017',litP:.3,arch:true,stucco:'#363440'},
    {x0:550,x1:680,top:H(272),roof:'flat',balus:true,floors:1,seed:17,wall:'#131119',litP:.4,arch:true,shopH:176,gild:true,stucco:'#3c3632'},
    {x0:680,x1:772},
    {x0:772,x1:866,top:H(255),roof:'mansard',rh:24,floors:1,seed:21,brick:true,wall:'#130e10',litP:.35,boxes:true,bc:'#33242a',bc2:'#261a20',bc3:'#3e2a26'},
    {x0:884,x1:1004,top:H(262),roof:'gable',rh:40,floors:1,seed:29,wall:'#121016',litP:.35,stucco:'#3a3036'},
    {x0:1004,x1:1160,top:H(258),roof:'mansard',rh:26,floors:1,seed:31,brick:true,wall:'#130f12',litP:.3}];
  // the alleys: dark slots with a warm glow from a back door deep inside, a fire escape
  for(const [a0,a1] of [[70,88],[866,884]]){c.fillStyle=lin(c,0,30,0,base,[[0,'#07060b'],[1,'#140c0e']]);c.fillRect(a0,30,a1-a0,base-30);
    glow(c,(a0+a1)/2,base-26,50,'#ff9a5a',.3,1.3);c.strokeStyle='#040306';c.lineWidth=1.47;for(let y=base-210;y<base-40;y+=34){c.beginPath();c.moveTo(a0,y);c.lineTo(a1,y-11);c.stroke();}}
  // the gap at 680..772: a little square behind iron railings, two trees, and down the far street the tower
  big(c,726,base=>{const x0=inX(680,726),x1=inX(772,726);c.fillStyle=lin(c,0,base-60,0,base,[[0,'#120e14'],[1,'#1c1418']]);c.fillRect(x0,base-30,x1-x0,30);
    for(const [tx,tr] of [[x0+12,19],[x1-11,16]]){c.fillStyle='#09080c';c.fillRect(tx-1.2,base-58,2.4,58);c.fillStyle=lin(c,0,base-58-tr*2,0,base-40,[[0,'#0c0b10'],[1,'#151018']]);
      c.beginPath();for(let k=0;k<9;k++){const a=k/9*TAU;c.arc(tx+Math.cos(a)*tr*.6,base-66-tr*.5+Math.sin(a)*tr*.45,tr*.5,0,TAU);}c.fill();
      c.save();c.globalCompositeOperation='lighter';c.fillStyle=rad(c,tx,base-46,0,tr*1.2,[[0,rgba('#ffb866',.25)],[1,rgba('#ffb866',0)]]);c.beginPath();c.arc(tx,base-66,tr*1.2,0,TAU);c.fill();c.restore();}
    c.strokeStyle='#08070b';c.lineWidth=1.01;c.beginPath();c.moveTo(x0,base-12);c.lineTo(x1,base-12);c.moveTo(x0,base-2.6);c.lineTo(x1,base-2.6);for(let x=x0;x<=x1;x+=3){c.moveTo(x,base);c.lineTo(x,base-14.5);}c.stroke();
    c.fillStyle=C.gold;for(let x=x0;x<=x1;x+=6){c.beginPath();c.moveTo(x-.9,base-14.5);c.lineTo(x,base-17);c.lineTo(x+.9,base-14.5);c.fill();}});
  const F=B.map((b,i)=>i===5?{gTop:base-110,base}:facade(c,b));
  // shopfronts along the ground floor, in the houses' scale
  shopAt(c,-150,-24,160,{name:'APOTHECARY',paint:'#0c1a14',size:7,lit:.45,doorAt:.78,doorW:20,inside:GOODS.apothecary});
  shopAt(c,-10,64,160,{name:'TAILOR',paint:'#16121c',size:6.4,track:.8,lit:.5,lights:2,doorAt:1,doorW:17,inside:(c,x,y,w,h)=>{c.fillStyle=rgba(C.ink,.9);const mx=x+w*.5,my=y+h*.25;c.beginPath();c.arc(mx,my,2.2,0,TAU);c.fill();c.beginPath();c.moveTo(mx-5,my+3);c.lineTo(mx+5,my+3);c.lineTo(mx+3.5,my+h*.6);c.lineTo(mx-3.5,my+h*.6);c.fill();c.fillRect(mx-.5,my+h*.6,1,h*.3);}});
  bistroFront(c);
  // the house beside the bistro: a black front door in a stone surround under a fanlight, up two steps, and a tall sash window
  {const b=B[3],cx=(b.x0+b.x1)/2;big(c,cx,base=>{const gTop=base-160/SK,hw=(b.x1-b.x0)/SK/2,dw=15,dx=cx-hw+4,dy=gTop+24;
    stone(c,dx-3.4,dy-14,dw+6.8,base-dy+14,{dark:.55,lit:.24});c.fillStyle='#060508';c.fillRect(dx,dy-11,dw,base-dy+11);
    windowPane(c,dx,dy-11,dw,10,.7,{arch:true,mull:0,fw:.6,spill:false});c.strokeStyle=rgba('#120c08',.9);c.lineWidth=.9;c.beginPath();for(let i=1;i<5;i++){const a=Math.PI+i*Math.PI/5;c.moveTo(dx+dw/2,dy-3.5);c.lineTo(dx+dw/2+Math.cos(a)*7.5,dy-3.5+Math.sin(a)*7.5);}c.stroke();
    const dp={paint:'#0c0b12'};timber(c,dp,dx+.6,dy,dw-1.2,base-dy-5,true);for(const [py,ph] of [[dy+3,(base-dy)*.34],[dy+6+(base-dy)*.34,(base-dy)*.45]]){panel(c,dp,dx+2,py,dw/2-2.6,ph);panel(c,dp,dx+dw/2+.6,py,dw/2-2.6,ph);}
    c.fillStyle=C.goldL;c.beginPath();c.arc(dx+dw/2,dy+(base-dy)*.42,.9,0,TAU);c.fill();c.fillRect(dx+dw/2-2,dy+(base-dy)*.28,4,1);
    for(let i=0;i<2;i++)stone(c,dx-4-i*2,base-5+i*2.5,dw+8+i*4,2.6,{lit:.32,dark:.5});
    // the sash window, its sill, and the area railings in front
    const wx=dx+dw+6,ww=cx+hw-4-wx,wy=gTop+16,wh=base-gTop-36,lit=.55;c.fillStyle=rgba('#000000',.55);c.fillRect(wx-1,wy-.5,ww+2,wh+.5);windowPane(c,wx,wy,ww,wh,lit,{mull:1,rows:[.48],fw:.9,curtain:rgba('#1a2a24',.85)});
    stone(c,wx-2,wy+wh,ww+4,2.4,{lit:.32});stone(c,wx-1.8,wy-3.4,ww+3.6,3.2,{lit:.2});
    c.strokeStyle='#08070b';c.lineWidth=.9;c.beginPath();c.moveTo(wx-3,base-11);c.lineTo(cx+hw-2,base-11);for(let x=wx-3;x<=cx+hw-2;x+=2.4){c.moveTo(x,base);c.lineTo(x,base-12.5);}c.stroke();
    c.fillStyle=C.gold;for(let x=wx-3;x<=cx+hw-2;x+=4.8){c.beginPath();c.moveTo(x-.7,base-12.5);c.lineTo(x,base-14.4);c.lineTo(x+.7,base-12.5);c.fill();}
    if(lit>0)SPILL.push({x0:outX(wx),x1:outX(wx+ww),a:lit*.5});});}
  // the club: stone columns, a door under a gilt fanlight between them, lit windows between the columns, steps
  {const b=B[4],cx=(b.x0+b.x1)/2;big(c,cx,base=>{const gTop=base-176/SK,hw=(b.x1-b.x0)/SK/2;c.fillStyle='#09080d';c.fillRect(cx-hw+3,gTop,2*hw-6,base-gTop);
    for(const k of [-31,-13,13,31]){const px=cx+k;stone(c,px-3,gTop+4,6,base-gTop-8,{dark:.45,lit:false});c.fillStyle=lin(c,px-3,0,px+3,0,[[0,rgba('#000000',.6)],[.55,rgba('#000000',0)],[1,rgba('#000000',.55)]]);c.fillRect(px-3,gTop+4,6,base-gTop-8);
      c.fillStyle=rgba('#000000',.35);for(const f of [-1.6,0,1.6])c.fillRect(px+f-.2,gTop+7,.4,base-gTop-14);stone(c,px-4.5,gTop+2,9,3,{lit:.3});stone(c,px-4.5,base-6,9,3,{lit:.25});}
    stone(c,cx-hw+2,gTop-1,2*hw-4,3.4,{lit:.3,dark:.5});
    c.fillStyle='#060508';c.fillRect(cx-9,gTop+16,18,base-gTop-18);windowPane(c,cx-9,gTop+5,18,12,.8,{arch:true,mull:0,fw:1,spill:false});
    vine(c,[{x:cx-9,y:gTop+16},{x:cx+9,y:gTop+16}],{w:.6,amp:1,wave:6,leaf:1.4,every:2,seed:4});
    const dp={paint:'#160c10'},dh=base-gTop-23;timber(c,dp,cx-8.6,gTop+17,8.4,dh,true);timber(c,dp,cx+.2,gTop+17,8.4,dh,true);
    panel(c,dp,cx-7.4,gTop+20,6,dh*.3);panel(c,dp,cx+1.4,gTop+20,6,dh*.3);panel(c,dp,cx-7.4,gTop+23+dh*.3,6,dh*.62);panel(c,dp,cx+1.4,gTop+23+dh*.3,6,dh*.62);
    c.fillStyle=rgba(C.gold,.7);c.fillRect(cx-.4,gTop+18,.8,dh);c.fillStyle=C.goldL;c.beginPath();c.arc(cx-2,gTop+20+dh*.36,.8,0,TAU);c.arc(cx+2,gTop+20+dh*.36,.8,0,TAU);c.fill();
    for(const k of [-22,22])windowPane(c,cx+k-5,gTop+12,10,base-gTop-28,.6,{arch:true,mull:1,rows:[.32],fw:.9,spill:false});
    for(const k of [-22,22])stone(c,cx+k-6.5,base-15.4,13,2,{lit:.3});
    for(let i=0;i<3;i++)stone(c,cx-15-i*3,base-6.6+i*2.2,30+i*6,2.3,{lit:.3+i*.04,dark:.5});
    glow(c,cx,gTop+10,30,'#ffc27a',.3);SPILL.push({x0:outX(cx-27),x1:outX(cx-17),a:.4},{x0:outX(cx+17),x1:outX(cx+27),a:.4},{x0:outX(cx-8),x1:outX(cx+8),a:.3});});}
  // the tram shelter in front of the tower: a low iron roof on slender posts, a timetable lit from inside, a bench
  big(c,726,base=>{const gTop=base-70,x0=inX(680,726)+3,x1=inX(772,726)-3,m=(x0+x1)/2;
    c.fillStyle='#08070b';c.fillRect(x0,gTop+11,x1-x0,2.6);c.beginPath();c.moveTo(x0-5,gTop+11);c.lineTo(m,gTop);c.lineTo(x1+5,gTop+11);c.closePath();c.fill();
    line(c,[{x:x0-5,y:gTop+11},{x:m,y:gTop},{x:x1+5,y:gTop+11}],rgba(C.rim,.35),.6);
    for(const px of [x0+3,x1-3,m]){c.fillStyle='#08070b';c.fillRect(px-1,gTop+13,2,base-gTop-13);}
    vine(c,[{x:x0+2,y:gTop+15},{x:x1-2,y:gTop+15}],{w:.5,amp:1.1,wave:7,leaf:1.3,every:2,seed:6});
    windowPane(c,x0+6,gTop+22,12,20,.85,{mull:0,fw:.7,cool:true,spill:false});c.fillStyle=rgba('#202838',.8);for(let k=0;k<5;k++)c.fillRect(x0+7.5,gTop+25+k*3.4,9,.9);
    c.fillStyle='#0c0b10';c.fillRect(m+3,base-10,x1-m-7,2.4);c.fillRect(m+4,base-8,1.6,8);c.fillRect(x1-6,base-8,1.6,8);
    c.fillStyle=rgba(C.rim,.25);c.fillRect(m+3,base-10,x1-m-7,.4);});
  // the house with the pawnbroker's three gilt balls
  {const b=B[6],cx=(b.x0+b.x1)/2;shopAt(c,b.x0+6,b.x1-6,160,{name:'PAWN',paint:'#1a1410',size:7,lit:.5,doorAt:1,doorW:19,inside:GOODS.pawn});
    big(c,cx,base=>{const gTop=base-160/SK,x0=inX(b.x0,cx);c.strokeStyle=C.gold;c.lineWidth=.8;c.beginPath();c.moveTo(x0+8,gTop-4);c.lineTo(x0+8,gTop-14);c.lineTo(x0+18,gTop-14);c.stroke();
      for(const [dx,dy] of [[-4,0],[4,0],[0,6]]){c.fillStyle=rad(c,x0+17+dx,gTop-9+dy,0,2.6,[[0,C.goldL],[.6,C.gold],[1,C.goldDD||C.goldD]]);c.beginPath();c.arc(x0+18+dx,gTop-8+dy,2.4,0,TAU);c.fill();}});}
  shopAt(c,B[7].x0+6,B[7].x1-6,160,{name:'NIGHT POST',paint:'#10141c',size:6.6,lit:.45,doorAt:0,doorW:20,inside:GOODS.post});
  shopAt(c,B[8].x0+6,B[8].x1-6,160,{name:'WINES',paint:'#1c0e10',size:7.5,lit:.5,doorAt:0,doorW:21,inside:GOODS.wines});
  // the tram wire along the street, high over it
  {const y0=-40;c.strokeStyle=rgba('#000000',.85);c.lineWidth=1.51;c.beginPath();c.moveTo(X0,y0+8);c.quadraticCurveTo((X0+X1)/2,y0+26,X1,y0+6);c.stroke();
    c.strokeStyle=rgba(C.rim,.22);c.lineWidth=.4;c.beginPath();c.moveTo(X0,y0+7);c.quadraticCurveTo((X0+X1)/2,y0+25,X1,y0+5);c.stroke();}
  // the far pavement: flagstones in the ground plane, wet, the night on them darker toward the kerb
  {const d0=126,d1=210,g=g0(),pv=[pp(X0-60,g,d1),pp(X1,g,d1),pp(X1,g,d0),pp(X0-60,g,d0)];
    c.save();poly(c,pv);c.clip();c.transform(1,0,PSX,-PSY,0,g);const pf=c.createPattern(TX().flagstones(41,{c0:'#3a3236',c1:'#544a4c'}),'repeat');if(pf.setTransform)pf.setTransform(new DOMMatrix().translate(0,d0).scale(.2));
    c.fillStyle=pf;c.fillRect(X0-100,d0,X1-X0+100,d1-d0);c.restore();
    c.fillStyle=lin(c,0,fy(d1),0,fy(d0),[[0,rgba('#06040a',.6)],[1,rgba('#06040a',.5)]]);poly(c,pv);c.fill();
    // the windows' light lying out across the flags, in front of each window
    // (the shared soft piece laid on the flags: full at the facade, spreading a little as it comes, its sides feathered)
    for(const s of SPILL){const w=s.x1-s.x0;softSpill(c,(s.x0+s.x1)/2-DF*PSX,d1,w,w+24,54,s.col||'#ffb060',.21*s.a,g);}
    const y1=fy(126);for(const lx of LAMPX){const q=lampAt(lx);wetStreak(c,q.x,base+2,y1,16,'#ffc477',.35,lx);}
    for(const [sx,a] of [[BG.wcx[0],.3],[BG.wcx[1],.3],[BG.dcx,.22],[600,.18],[40,.16],[790,.15],[1060,.16],[-80,.12]])wetStreak(c,sx,base+2,y1,30,'#ffb866',a,sx+3);
    for(const lx of LAMPX){const q=pp(lx+16*LK,g,LAMPD-20);glow(c,q.x,q.y,80,'#ffb866',.16,.3);}
    coalHole(c,512,190);coalHole(c,640,192);
    bistroSteps(c);
    if(blown())pavementBlown(c,g);}
  // the kerb: granite blocks of uneven length, a chipped arris lit along the top
  {const g=g0(),a=pp(X0-60,g,126),b=pp(X1,g,126),e=pp(X1,GB,120),f=pp(X0-60,GB,120);
    c.save();poly(c,[a,b,e,f]);c.clip();c.fillStyle=patAt(c,TX().granite(77,128,64,{base:'#5e5860'}),0,a.y,.25);c.fillRect(X0-40,a.y,X1-X0+80,f.y-a.y+2);
    c.fillStyle=lin(c,0,a.y,0,f.y,[[0,rgba('#05040a',.2)],[.12,rgba('#05040a',.45)],[1,rgba('#05040a',.82)]]);c.fillRect(X0-40,a.y,X1-X0+80,f.y-a.y+2);
    const r=rng(81);c.strokeStyle=rgba('#000000',.6);c.lineWidth=1.51;for(let x=X0+r()*20;x<X1;x+=30+r()*26){const q=pp(x,g,126),q2=pp(x,GB,120);c.beginPath();c.moveTo(q.x,q.y);c.lineTo(q2.x,q2.y);c.stroke();
      if(r()<.4){const t=r(),cq=pp(x+4+t*20,g,126);c.fillStyle=rgba('#000000',.55);c.beginPath();c.moveTo(cq.x,cq.y);c.lineTo(cq.x+3,cq.y);c.lineTo(cq.x+1.4,cq.y+1.6);c.fill();}}
    c.restore();
    line(c,[a,b],rgba(C.rim,.55),1.1);
    for(const lx of LAMPX){const q=pp(lx+16,g,126);c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,q.x-60,0,q.x+60,0,[[0,rgba('#ffb866',0)],[.5,rgba('#ffb866',.18)],[1,rgba('#ffb866',0)]]);c.fillRect(q.x-60,a.y,120,f.y-a.y);c.restore();}}
  // the road: granite setts wet from the rain, two pairs of grooved tram rails, a gutter by the kerb
  {const rv=[pp(X0,GB,120),pp(X1,GB,120),pp(X1+110,GB,E.NEAR),pp(X0,GB,E.NEAR)];
    c.save();poly(c,rv);c.clip();c.transform(1,0,PSX,-PSY,0,GB);const ps=c.createPattern(TX().setts(7,{c0:'#28222a',c1:'#423a40',farX:true}),'repeat');if(ps.setTransform)ps.setTransform(new DOMMatrix().rotate(90).scale(1/6));
    c.fillStyle=ps;c.fillRect(X0,E.NEAR,X1-X0+240,120-E.NEAR);c.restore();
    c.fillStyle=lin(c,0,GB-90,0,GB+75,[[0,rgba('#06040a',.4)],[1,rgba('#06040a',.58)]]);poly(c,rv);c.fill();
    {const q0=pp(X0,GB,114),q1=pp(X1,GB,114);c.fillStyle=rgba('#05040a',.6);c.fillRect(q0.x,q0.y-2,q1.x-q0.x,4);}
    for(const gx of [176,560,940])grate(c,gx);
    for(const d of [30,40,74,84]){const q0=pp(X0,GB,d),q1=pp(X1,GB,d);c.fillStyle='#050407';c.fillRect(q0.x,q0.y-1.6,q1.x-q0.x,1.2);c.fillStyle='#0b0a0e';c.fillRect(q0.x,q0.y-.6,q1.x-q0.x,1.8);
      c.fillStyle=rgba('#d8c0a8',.38);c.fillRect(q0.x,q0.y-.6,q1.x-q0.x,.6);}
    const y0=fy(120)+3;for(const lx of LAMPX){const q=lampAt(lx);wetStreak(c,q.x+4,y0,GB+70,26,'#ffc477',.42,lx*3);}
    for(const [sx,a] of [[230,.22],[320,.2]])wetStreak(c,sx,y0,GB+40,50,'#ff9a50',a,sx*7);
    const r=rng(33);for(let i=0;i<8;i++){const px=r()*W,pd=10+r()*96,q=pp(px,GB,pd),rw=14+r()*30;c.fillStyle=rgba('#07070d',.45);c.beginPath();c.ellipse(q.x,q.y,rw,rw*.16,0,0,TAU);c.fill();
      c.strokeStyle=rgba('#ffd8a0',.14);c.lineWidth=.6;c.beginPath();c.ellipse(q.x,q.y,rw,rw*.16,0,Math.PI*1.1,Math.PI*1.9);c.stroke();}}
  // the lamps along the far kerb, and in front of the bistro its bay trees and its menu
  for(const lx of LAMPX)about(c,fx(lx,LAMPD),fy(LAMPD),LK,()=>lampPost(c,lx));
  {const at=(X,d,fn,k)=>{const x=X-d*PSX,q=pp(x,g0(),d);about(c,q.x,q.y,k||PK,()=>fn(c,x,d));};
    if(blown()){at(BG.DR[0]-24,205,bayTreeDown,1.7);at(BG.DR[1]+24,205,bayTreeScorched,1.7);at(152,202,chalkMenuDown,1.9);}
    else{at(BG.DR[0]-24,205,bayTree,1.7);at(BG.DR[1]+24,205,bayTree,1.7);at(152,202,chalkMenu,1.9);}}
  // a low mist along the kerb, and the dark falling off toward us
  haze(c,X0,X1,fy(126)-26,fy(126)+24,'#5a3a40',.16);
  E.fallKeep(c,X0,X1+120,GB-20,[[GB-20,0],[GB+110,.45]],null,.06);}
// the lamps burn and their light spills: drawn every frame over the layer (in the blast's first moment they dip and catch)
let LREG=false;
function live(){const t=S.t,bt=typeof S.bistroBlast==='number'?t-S.bistroBlast:-1,calm=typeof reduceMotion!=='undefined'&&reduceMotion;ctx.save();
  if(!blown())liveDining(t,calm);
  const dip=bt>=0&&bt<.7?(calm?.5:.5+.5*Math.sin(bt*60))*(1-bt/.7):0;
  for(const lx of LAMPX){const q=lampAt(lx),x=q.x,y=q.y,f=(.93+.07*Math.sin(t*7+lx)*Math.sin(t*3.1+lx*.3))*(1-.6*dip);
    glow(ctx,x,y,22*LK,'#fff0cc',.9*f);glow(ctx,x,y,70*LK,'#ffb866',.3*f);beam(ctx,x,y+8*LK,10*LK,110*LK,190,'#ffcf86',.06*f);}
  if(blown())liveBlown(t);
  if(bt>=0)liveBlast(t);
  ctx.restore();
  // the fire in the bistro lights whoever is in the street: a light of the moment for the sprites (FXL is loaded after the painters)
  if(!LREG&&typeof FXL!=='undefined'&&FXL.lights){LREG=true;FXL.lights.push(add=>{if(S.arenaKey!=='street'||S.classicLook||!blown())return;
    const D=doorG(),d=DF-6,f=.8+.12*Math.sin(S.t*11.3)*Math.sin(S.t*4.7+1);add(D.cx-d*PSX,D.base-36+d*PSY,d,'#ff7a34',.75*f,280);});}}
// after the grenade: the fire inside breathing in the hole and the smashed windows and out across the flags, smoke rolling out of the
// arch and up the front, embers, one lantern still sputtering on its pier
const smokeCol=u=>u<.3?mix('#b8683a','#7a6a68',u/.3):mix('#7a6a68','#3e3842',clamp((u-.3)/.7,0,1));
function liveBlown(t){const D=doorG(),{x0,x1,base,cx,yc,ar}=D,k=BG.k,f=.78+.12*Math.sin(t*11.3)*Math.sin(t*4.7+1)+.1*Math.sin(t*23.1+2),g=g0();
  glow(ctx,cx,base-12*k,34*k,'#ff6a26',.42*f,.9);glow(ctx,cx+6*k,base-5*k,16*k,'#ffc070',.38*f);
  for(const wx of BG.wcx)glow(ctx,wx,BG.y1w-30*k,30*k,'#ff5a20',.16*f,.9);
  {const a=pp(x0-DF*PSX-6*k,g,DF),b=pp(x1-DF*PSX+6*k,g,DF),e=pp(x1-DF*PSX+40*k,g,DF-60*k),h=pp(x0-DF*PSX-40*k,g,DF-60*k);ctx.save();ctx.globalCompositeOperation='lighter';
    ctx.fillStyle=lin(ctx,0,a.y,0,e.y,[[0,rgba('#ff6a26',.22*f)],[1,rgba('#ff6a26',0)]]);poly(ctx,[a,b,e,h]);ctx.fill();ctx.restore();}
  const r=rng(707);
  for(let i=0;i<22;i++){const win=i>=16,P=4.6+r()*1.6,u=((t/P)+i/16)%1,ox=win?BG.wcx[i%2]:cx,sx=ox+(r()-.5)*ar*1.2,sy=(win?BG.yc+10*k:yc-ar*.4)+r()*10*k,wob=Math.sin(u*2.6+i)*9*k,
      x=sx+wob+u*(22+r()*16)*k,y=sy-u*(win?90:150+r()*70)*k,R=((win?4:7)+u*(win?22:38+r()*16))*k,a=(u<.12?u/.12:1)*Math.pow(1-u,1.2)*(win?.34:.5);
    ctx.fillStyle=rad(ctx,x,y,0,R,[[0,rgba(smokeCol(u),a)],[1,rgba(smokeCol(u),0)]]);ctx.beginPath();ctx.arc(x,y,R,0,TAU);ctx.fill();}
  for(let i=0;i<26;i++){const P=2.2+r()*1.6,u=((t/P)+r())%1,x=cx+(r()-.5)*ar*1.6+Math.sin(u*5+i)*6*k+u*14*k,y=base-8*k-r()*30*k-u*(70+r()*80)*k,fl=.5+.5*Math.sin(t*19+i*3);
    ctx.fillStyle=rgba(r()<.6?'#ffb050':'#ff7a2a',(1-u)*.85*fl);ctx.fillRect(x,y,1.2,1.2);}
  {const [a,b]=BG.piers[2],lx=(a+b)/2+3.2*k,ly=BG.lanY-3.6*k,on=Math.max(0,Math.sin(t*9.1)*Math.sin(t*3.7+.6)*Math.sin(t*17.3+1.1));if(on>.05){glow(ctx,lx,ly,9*k,'#ffd28a',.75*on);glow(ctx,lx,ly,26*k,'#ffb060',.3*on);}}}
// the instant of the blast (S.bistroBlast is when, in S.t), over some three seconds: the front lit white and then the colour of the
// fire; a shock ring over the flags and a ring through the air, the dust it raises; fire rolling out of the doorway a beat after the
// flash and licking up out of both windows; the glass of the windows and the fanlight bursting out over the flags in glinting pieces
// that come down and lie there; the door's frame and leaves thrown out in splinters and pieces, some as far as the road; dust shaken
// off the cornice; embers coming down; the smoke pouring out after it. The fireball is the game's (FxLook). On Lite half the pieces
// fly; with reduced motion the flash stays soft and there is no ring through the air.
function liveBlast(t){const dt=t-S.bistroBlast;if(!(dt>=0&&dt<3.4))return;
  const D=doorG(),{x0,x1,cx,yc,ar,base}=D,k=BG.k,g=g0(),S0=DF-BG.steps[0].d,dcx=cx-DF*PSX,lite=typeof FXL!=='undefined'&&!FXL.full(),calm=typeof reduceMotion!=='undefined'&&reduceMotion,
    n=v=>lite?Math.ceil(v/2):v,L=d=>d<123?GB-d*PSY:fy(d),eo=u=>1-Math.pow(1-u,3);
  // the light of it on the whole front: white for a moment, then the colour of the fire
  if(dt<1.5){const a=dt<.06?1:Math.exp(-(dt-.06)*2.4);glow(ctx,cx,yc+30*k,(250+dt*130)*k,dt<.16?'#fff4dc':'#ffb060',(calm?.32:.58)*a,.85);
    if(dt<.24){const u=dt/.24;glow(ctx,cx,base-18*k,(60+210*u)*k,'#ffffff',(calm?.45:1)*(1-u));glow(ctx,cx,yc+20*k,(30+100*u)*k,'#ffffff',.9*(1-u));
      // the window and the fanlight white with it before they go
      for(const wx of BG.wcx)glow(ctx,wx,BG.yc+20*k,(40+60*u)*k,'#fff2d0',.8*(1-u));}}
  // the shock ring over the flags from the foot of the steps, and (not for reduced motion) the ring of it through the air
  if(dt<1.1){ctx.save();ctx.transform(1,0,PSX,-PSY,0,g);const R=(14+dt*300)*k,a=Math.max(0,1-dt/1.1);ctx.strokeStyle=rgba('#ffe2c0',.5*a);ctx.lineWidth=(2.4*a+.4)*k;ctx.beginPath();ctx.ellipse(dcx,S0,R,R*.72,0,Math.PI,TAU);ctx.stroke();ctx.restore();}
  if(dt<.3&&!calm){const u=dt/.3,R=(30+480*eo(u))*k;ctx.strokeStyle=rgba('#fff0d8',.15*(1-u));ctx.lineWidth=(4*(1-u)+.8)*k;ctx.beginPath();ctx.arc(cx,base-24*k,R,0,TAU);ctx.stroke();
    ctx.strokeStyle=rgba('#ffffff',.09*(1-u));ctx.lineWidth=(1.6*(1-u)+.4)*k;ctx.beginPath();ctx.arc(cx,base-24*k,R*.94,0,TAU);ctx.stroke();}
  // the dust off the flags, rolling out low from the steps
  {const r=rng(909);for(let i=0;i<n(22);i++){const a=Math.PI*(1.05+r()*.9),d0=r(),gr=r();const R2=(18+dt*230*(.5+d0))*(1-.25*d0)*k,q=pp(dcx+Math.cos(a)*R2,g,S0+Math.sin(a)*R2*.7),rr=(8+dt*44*(.7+gr*.6))*k,al=.44*Math.min(1,dt*9)*Math.max(0,1-dt/2.6);
    ctx.fillStyle=rad(ctx,q.x,q.y-rr*.4,0,rr,[[0,rgba('#6a5a50',al)],[1,rgba('#6a5a50',0)]]);ctx.beginPath();ctx.arc(q.x,q.y-rr*.4,rr,0,TAU);ctx.fill();}}
  ctx.save();ctx.globalCompositeOperation='lighter';
  // fire rolling out of the doorway a beat after the flash, out over the steps and up the front, cooling as it rises
  {const R=rng(515);for(let i=0;i<n(28);i++){const t0=.04+R()*.36,life=.5+R()*.65,vx=(R()-.5)*1.7,up=.5+R(),sx=cx+(R()-.5)*ar*1.2,sy=yc+R()*(base-yc)*.8,sz=10+R()*9,u=(dt-t0)/life;if(u<0||u>=1)continue;
    const e=1-Math.pow(1-u,2.2),x=sx+vx*ar*1.4*e,y=sy+(base-sy)*.2*e-up*150*k*u*u-36*k*e,rr=sz*k*(.4+1.4*e),hot=1-u;
    ctx.fillStyle=rad(ctx,x,y,0,rr,[[0,rgba(hot>.55?'#fff0c0':'#ffb050',.72*hot)],[.5,rgba('#ff7a2a',.4*hot)],[1,rgba('#ff4a14',0)]]);ctx.beginPath();ctx.arc(x,y,rr,0,TAU);ctx.fill();}}
  // and out of the tops of both windows a beat after, rolling up the front over the fascia
  BG.wcx.forEach((wx,wi)=>{const R=rng(616+wi);for(let i=0;i<n(14);i++){const t0=.08+R()*.35,life=.6+R()*.9,sx=wx+(R()-.5)*BG.ar*1.2,sy=BG.yTop+BG.ar*(.5+R()*.8),drift=(R()-.5)*30*k,up=(60+R()*90)*k,sz=(8+R()*8)*k,u=(dt-t0)/life;if(u<0||u>=1)continue;
    const e=1-Math.pow(1-u,1.8),x=sx+drift*e+Math.sin(u*5+i)*4*k,y=sy-up*e,rr=sz*(.5+1.2*e),hot=1-u;
    ctx.fillStyle=rad(ctx,x,y,0,rr,[[0,rgba(hot>.6?'#ffe6a0':'#ffa040',.6*hot)],[.55,rgba('#ff6a20',.32*hot)],[1,rgba('#ff3a10',0)]]);ctx.beginPath();ctx.arc(x,y,rr,0,TAU);ctx.fill();}});
  ctx.restore();
  // the glass: both windows and the fanlight burst out over the flags in glinting pieces; each comes down where it lands and lies there
  {const R=rng(717),src=[[BG.W1,BG.yTop+BG.ar*.3,BG.y1w,46],[BG.W2,BG.yTop+BG.ar*.3,BG.y1w,46],[[x0,x1],D.y0+ar*.2,yc+4*k,24]];
    for(const [W,y0,y1,m0] of src)for(let i=0;i<n(m0);i++){const px=lerp(W[0],W[1],R()),py=lerp(y0,y1,R()),dl=146+R()*62,out=(px-cx)*(.15+R()*.5)+(R()-.5)*34*k,hgt=(6+R()*40)*k,T=.32+R()*.5,t0=R()*.05,rot=R()*TAU,spin=(R()-.5)*34,sz=(1.1+R()*2.2)*k,sh=R();
      const u=(dt-t0)/T;if(u<0)continue;const uu=Math.min(1,u),lx=px-(DF-dl)*PSX+out,ly=L(dl)-.6,x=lerp(px,lx,uu),y=lerp(py,ly,uu*uu)-hgt*2*uu*(1-uu),an=rot+spin*Math.min(dt-t0,T),fade=dt<2.6?1:Math.max(0,1-(dt-2.6)/.8);
      const glint=Math.abs(Math.sin(an*1.7+sh*6)),sq=uu<1?1:.42;ctx.save();ctx.translate(x,y);ctx.scale(1,sq);ctx.rotate(an);ctx.fillStyle=rgba(sh<.5?'#d8e6f0':'#ffe8d0',(.35+.45*glint)*fade);
      ctx.beginPath();ctx.moveTo(-sz,0);ctx.lineTo(sz*.6,-sz*.55);ctx.lineTo(sz*.9,sz*.4);ctx.closePath();ctx.fill();if(glint>.85){ctx.fillStyle=rgba('#ffffff',.9*fade);ctx.fillRect(-.4,-.4,.9,.9);}ctx.restore();}}
  // the door's frame and leaves: splinters and pieces thrown out of the arch, the big ones turning over, some carried as far as the road
  {const R=rng(818);for(let i=0;i<n(60);i++){const big=i<n(9),px=cx+(R()-.5)*ar*1.6,py=yc+R()*(base-yc),dl=big?96+R()*100:136+R()*70,out=(px-cx)*(.6+R()*1.4)*(big?1.7:1)+(R()-.5)*70*k,
      T=(big?.72:.42)+R()*.5,hgt=(22+R()*80)*k*(big?1.25:1),Ln=(big?10+R()*12:3+R()*6)*k,wd=(big?3.4+R()*2.4:.9+R()*.9)*k,rot=R()*TAU,spin=(R()-.5)*(big?11:26),col=R()<.5?'#2e140b':'#55271a',brass=big&&R()<.4,burn=R()<.3;
      if(dt>T+3)continue;const uu=Math.min(1,dt/T),lx=px-(DF-dl)*PSX+out,ly=L(dl)-wd*.4,x=lerp(px,lx,uu),y=lerp(py,ly,uu*uu)-hgt*2*uu*(1-uu),an=rot+spin*Math.min(dt,T)*(1-.4*uu),fade=dt<2.6?1:Math.max(0,1-(dt-2.6)/.8);
      ctx.save();ctx.translate(x,y);if(uu>=1)ctx.scale(1,.45);ctx.rotate(an);ctx.globalAlpha=fade;ctx.fillStyle=col;ctx.fillRect(-Ln/2,-wd/2,Ln,wd);ctx.fillStyle=rgba(C.rim,.32);ctx.fillRect(-Ln/2,-wd/2,Ln,Math.min(wd*.3,.7*k));
      if(brass){ctx.fillStyle=lin(ctx,0,-wd/2,0,wd/2,[[0,C.goldL],[1,C.goldD]]);ctx.fillRect(-Ln*.3,-wd*.35,Ln*.5,wd*.7);}
      ctx.globalAlpha=1;ctx.restore();if(burn&&uu<1){glow(ctx,x,y,4*k,'#ff9a3a',.6*(1-uu*.5));}}}
  // dust shaken off the cornice and the fascia, falling in threads down the front
  if(!lite){const R=rng(919);for(let i=0;i<26;i++){const sx=lerp(BG.x0,BG.x1,R()),t0=.06+R()*.5,v=(50+R()*80)*k,y0=BG.gTop+R()*BG.fh,ln=(5+R()*9)*k,u=dt-t0;if(u<0||u>1.5)continue;
    const y=y0+v*u+70*u*u*k,a=.24*(1-u/1.5);ctx.fillStyle=rgba('#a89888',a);ctx.fillRect(sx,y,.8*k,ln);}}
  // embers coming down over the street
  {const R=rng(1122);for(let i=0;i<n(44);i++){const t0=.12+R()*.6,sx=cx+(R()-.5)*300*k,sy=yc-(30+R()*130)*k,vy=(24+R()*60)*k,sw=(R()-.5)*50*k,life=1.3+R()*1.5,hot=R()<.6,ph=R()*9,u=dt-t0;if(u<0||u>life)continue;
    const x=sx+Math.sin(u*4+ph)*sw*.3+sw*u*.4,y=sy+vy*u+26*u*u*k,a=(1-u/life)*(.6+.4*Math.sin(t*20+ph*3));ctx.fillStyle=rgba(hot?'#ffb050':'#ff7a2a',a);ctx.fillRect(x,y,1.3,1.3);}}
  // the smoke pouring out of the arch after it, rising up the front, until the fire's own smoke (liveBlown) takes over
  {const R=rng(1021);for(let i=0;i<n(16);i++){const t0=.28+R()*.6,life=2.1+R()*1.1,sx=cx+(R()-.5)*ar,sy=yc-ar*.3+R()*20*k,dr=(R()-.5)*70*k,up=(130+R()*120)*k,r0=(12+R()*10)*k,ph=R()*6,u=(dt-t0)/life;if(u<0||u>=1)continue;
    const x=sx+dr*u+Math.sin(u*3+ph)*10*k,y=sy-up*(1-Math.pow(1-u,1.6)),rr=r0*(1+2.6*u),a=.58*Math.min(1,u*5)*(1-u),col=smokeCol(.3+u*.7);ctx.fillStyle=rad(ctx,x,y,0,rr,[[0,rgba(col,a)],[1,rgba(col,0)]]);ctx.beginPath();ctx.arc(x,y,rr,0,TAU);ctx.fill();}}}
// the light that falls on a fighter: the nearest lamp
function light(f){const px=f.p[PEL].x+f.dep*PSX;let best=null,bd=1e9;for(const lx of LAMPX){const x=lampAt(lx).x,dd=Math.abs(x-px);if(dd<bd){bd=dd;best=x;}}
  return{light:{x:best-f.dep*PSX,y:lampAt(LAMPX[0]).y+f.dep*PSY},col:'#ffc98a'};}
// the doorway for the story: where it is on the street (x and depth as the game counts them), the sill on screen (y), the top of its
// arch and of the fascia over it
function doorAt(){const g=BG,d=DF-2;return{x:g.dcx-d*PSX,dep:d,y:g.dBase,top:g.yTop,fascia:g.gTop};}
// the layer depends on the bistro's state: the glue paints it again when this changes. lookUp: how high the camera keeps in view
// during a fight here, if it can (the bistro's fascia)
// the light on the fight (the style guide's rule 8, sceneSet in sk_scene_glue.js): the sodium lamps' light on the flags and the fronts behind the fight
const SET={col:'#ffd6a7',soft:.8,y:[GB-360,GB-280,GB-60,GB+20]};
E.S.street={set:SET,paint,live,light,key:()=>'street:'+(blown()?'blown':'intact'),lamps:LAMPX,doorAt,lookUp:BG.gTop-10,div:it=>it.dv.mat==='plank'&&typeof EnvProps!=='undefined'?EnvProps.plankFence(it,'town'):false,table:()=>typeof EnvProps!=='undefined'?EnvProps.fieldTable('town'):false};
})();
// ===== ENV STREET END =====
