// ===== ENV STREET =====
// Lamplight Street: the Lantern Bistro's street, after rain. Townhouses across the way with shops on the ground floor, the bistro
// among them under its lanterns; elven gas lamps along the far kerb; wet flagstones, granite kerbs and a road of granite setts
// with tram rails; beyond the roofs the city and the Hallowell tower with its ring of cyan light. Brick, stucco, dressed stone,
// mahogany, canvas and paving come from EnvTex, made once pixel by pixel and laid on as patterns.
(()=>{const E=EnvLook,{C,pp,poly,line,rect,lin,rad,rgba,mix,glow,beam,haze,vine,scroll,gilt,windowPane,wetStreak,stars,moon,cloudBank,skyline,hallTower,rng,lerp,clamp,TAU}=E;
const TX=()=>EnvTex;
const DF=212,KB=22,LAMPD=200,LAMPX=[60,290,520,750,980];
const g0=()=>GB-KB,fy=d=>g0()-d*PSY,fx=(x,d)=>x+d*PSX;
const lampAt=lx=>({x:fx(lx,LAMPD)+16,y:fy(LAMPD)-140});
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
  c.strokeStyle=rgba(C.gold,.7);c.lineWidth=.45;c.strokeRect(x+1.3,y+1.3,w-2.6,h-2.6);c.fillStyle=rgba(C.gold,.85);c.fillRect(x,y+h-.8,w,.8);c.fillRect(x,y,w,.6);
  if(o.name)gilt(c,o.name,x+w/2,y+h*.74,o.size||8.5,{style:o.style||'700',track:o.track||1.2,glow:o.glowName});}
// glass seen from the street at night: a long sheen sliding across it, its top in the shade of the fascia
function glassSheen(c,x,y,w,h,a){c.save();c.beginPath();c.rect(x,y,w,h);c.clip();c.globalCompositeOperation='lighter';c.fillStyle=rgba('#fff0e0',a||.05);
  for(let sx=x+w*.12;sx<x+w+h;sx+=Math.max(30,w*.42)){c.beginPath();c.moveTo(sx,y);c.lineTo(sx+4,y);c.lineTo(sx+4-h*.45,y+h);c.lineTo(sx-h*.45,y+h);c.closePath();c.fill();}
  c.restore();const sh=Math.min(10,h*.3);c.fillStyle=lin(c,0,y,0,y+sh,[[0,rgba('#000000',.3)],[1,rgba('#000000',0)]]);c.fillRect(x,y,w,sh);}
// a door: stiles and rails, the upper part glazed, a panel below, a brass knob and kick plate, a stone step
function shopDoor(c,o,dx,dy,dw,base,lit){timber(c,o,dx,dy,dw,base-dy,true);c.strokeStyle='#040305';c.lineWidth=.5;c.strokeRect(dx+.25,dy+.25,dw-.5,base-dy-.5);
  const gh=(base-dy)*.55;windowPane(c,dx+2,dy+2,dw-4,gh,lit,{mull:0,fw:.7,spill:false});glassSheen(c,dx+2,dy+2,dw-4,gh,.05);
  panel(c,o,dx+2,dy+gh+4,dw-4,base-dy-gh-9);
  c.fillStyle=lin(c,0,base-4,0,base-1.4,[[0,C.goldL],[1,C.goldD]]);c.fillRect(dx+1,base-4,dw-2,2.4);
  c.fillStyle=C.goldL;c.beginPath();c.arc(dx+dw-3,dy+gh+2.6,.8,0,TAU);c.fill();
  stone(c,dx-2,base-1.2,dw+4,2.4,{lit:.38});}
// letters on an arc, the way gold leaf is laid on a shop window
function arcText(c,text,cx,cy,R,size,o){o=o||{};c.save();c.font=(o.style||'700')+' '+size+'px "Alegreya SC", Georgia, serif';c.textBaseline='alphabetic';
  const tr=o.track||0,ch=[...text],ws=ch.map(s=>c.measureText(s).width),tot=ws.reduce((a,b)=>a+b,0)+tr*(ch.length-1);let a=-tot/2/R;
  for(let i=0;i<ch.length;i++){const m=a+ws[i]/2/R;c.save();c.translate(cx+Math.sin(m)*R,cy+R-Math.cos(m)*R);c.rotate(m);
    c.fillStyle='rgba(0,0,0,.55)';c.fillText(ch[i],-ws[i]/2+size*.05,size*.07);c.fillStyle=lin(c,0,-size*.8,0,0,[[0,C.goldL],[.5,C.gold],[1,C.goldD]]);c.fillText(ch[i],-ws[i]/2,0);c.restore();a+=(ws[i]+tr)/R;}
  c.restore();}
// ---------- the houses ----------
// a facade across the street: x0..x1 on screen at the facade line, top on screen; floors of windows; a shopfront on the ground
function facade(c,b){const base=fy(DF),x0=b.x0,x1=b.x1,w=x1-x0,top=b.top,r=rng(b.seed||1),wall=b.wall||'#141117',gTop=base-(b.shopH||58);
  // the wall: brick in courses, or stucco scored as ashlar
  if(b.brick){c.fillStyle=patAt(c,TX().brick(b.seed,{base:b.bc||'#3a2420',alt:b.bc2||'#2a1816',hot:b.bc3||'#4a2a20',mortar:'#26221f'}),x0,top,1/6);c.fillRect(x0,top,w,base-top);
    c.fillStyle=lin(c,0,top,0,base,[[0,rgba('#04030a',.72)],[1,rgba('#04030a',.55)]]);c.fillRect(x0,top,w,base-top);}
  else{c.fillStyle=patAt(c,TX().plaster(b.seed,256,256,{base:b.stucco||'#3a3440'}),x0,top,.35);c.fillRect(x0,top,w,base-top);
    c.fillStyle=lin(c,0,top,0,base,[[0,rgba('#04030a',.78)],[1,rgba('#04030a',.6)]]);c.fillRect(x0,top,w,base-top);
    c.strokeStyle=rgba('#000000',.5);c.lineWidth=.6;c.beginPath();for(let y=top+8,k=0;y<gTop-6;y+=8,k++){c.moveTo(x0,y);c.lineTo(x1,y);for(let x=x0+(k%2)*14;x<x1;x+=28){c.moveTo(x,y);c.lineTo(x,Math.min(y+8,gTop-6));}}c.stroke();
    c.strokeStyle=rgba('#ffcf9a',.06);c.beginPath();for(let y=top+8.7;y<gTop-6;y+=8){c.moveTo(x0,y);c.lineTo(x1,y);}c.stroke();}
  // soot has settled under the eaves
  c.fillStyle=lin(c,0,top,0,top+24,[[0,rgba('#030206',.5)],[1,rgba('#030206',0)]]);c.fillRect(x0,top,w,24);
  // quoins: dressed stone at the corners of the brick houses, long and short in turn
  if(b.brick)for(const [qx,dir] of [[x0,1],[x1,-1]])for(let y=top+1,k=0;y+6<gTop-7;y+=6.4,k++){const qw=k%2?5.5:9.5;stone(c,dir>0?qx:qx-qw,y,qw,6,{dark:.6,lit:.1});}
  // the roof
  if(b.roof==='mansard'){const rh=b.rh||26,roof=()=>{c.beginPath();c.moveTo(x0-3,top);c.lineTo(x0+6,top-rh);c.lineTo(x1-6,top-rh);c.lineTo(x1+3,top);c.closePath();};
    roof();c.fillStyle=b.slate||'#0e1018';c.fill();
    // slates in courses, each course's joints broken against the one below
    c.save();roof();c.clip();c.strokeStyle=rgba('#2a3046',.5);c.lineWidth=.5;c.beginPath();for(let y=top-rh+3;y<top;y+=3){c.moveTo(x0-3,y);c.lineTo(x1+3,y);}c.stroke();
    c.strokeStyle=rgba('#000000',.55);c.lineWidth=.35;c.beginPath();for(let y=top-rh,k=0;y<top;y+=3,k++)for(let x=x0-3+(k%2)*2;x<x1+3;x+=4){c.moveTo(x,y);c.lineTo(x,y+3);}c.stroke();
    c.fillStyle=lin(c,0,top-rh,0,top,[[0,rgba('#8a96b8',.06)],[1,rgba('#000000',.25)]]);c.fillRect(x0-3,top-rh,w+6,rh);c.restore();
    for(let dx=x0+18;dx<x1-14;dx+=b.dorm||38){c.fillStyle='#0b0d13';c.beginPath();c.moveTo(dx-6,top-2);c.lineTo(dx-6,top-rh+8);c.lineTo(dx,top-rh+3);c.lineTo(dx+6,top-rh+8);c.lineTo(dx+6,top-2);c.fill();
      line(c,[{x:dx-6.5,y:top-rh+8.4},{x:dx,y:top-rh+3.2},{x:dx+6.5,y:top-rh+8.4}],rgba('#9aa4bc',.35),.6);
      windowPane(c,dx-3.5,top-rh+9,7,10,r()<.3?.75:0,{mull:1,fw:.8,spill:false});}
    line(c,[{x:x0+6,y:top-rh},{x:x1-6,y:top-rh}],rgba(C.rim,.45),.8);
    for(const cx of b.chim||[x0+8,x1-16]){const cy=top-rh-14;c.fillStyle=patAt(c,TX().brick(99,{base:'#3a2420',alt:'#2a1816',hot:'#4a2a20',mortar:'#26221f'}),cx,cy,1/6);c.fillRect(cx,cy,8,16);
      c.fillStyle=lin(c,cx,0,cx+8,0,[[0,rgba('#04030a',.82)],[1,rgba('#04030a',.62)]]);c.fillRect(cx,cy,8,16);stone(c,cx-1,cy-1.6,10,2.4,{lit:.3,dark:.6});
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
  const fl=b.floors||2,flH=(gTop-7-top-6)/fl,cols=b.cols||Math.max(2,Math.floor(w/34));
  for(let i=0;i<fl;i++)for(let j=0;j<cols;j++){const ww=Math.min(15,w/cols*.46),wh=flH*.64,wx=x0+(j+.5)*w/cols-ww/2,wy=top+6+i*flH+flH*.15,arch=b.arch&&i===0;
    if(!arch){c.fillStyle=rgba('#000000',.55);c.fillRect(wx-1,wy-.5,ww+2,wh+.5);}
    const lit=r()<(b.litP||.25)?.5+r()*.5:0;windowPane(c,wx,wy,ww,wh,lit,{arch,mull:2,rows:[.38],curtain:lit&&r()<.6?rgba(r()<.5?'#4a1218':'#1a2a24',.85):null,figure:lit&&r()<.15,fw:1.1,r,sky:'#121628'});
    // the sill, and the rain that has run down the wall from it
    stone(c,wx-2.2,wy+wh,ww+4.4,2.4,{lit:.32});
    {const rr=rng(b.seed*131+i*17+j*3);for(let k=0;k<3;k++){const sx=wx-1+rr()*(ww+2),sw=.5+rr()*1.3,sl=5+rr()*12;c.fillStyle=lin(c,0,wy+wh+2.4,0,wy+wh+2.4+sl,[[0,rgba('#000000',.32)],[1,rgba('#000000',0)]]);c.fillRect(sx,wy+wh+2.4,sw,sl);}}
    // the head: a ring of voussoirs over an arch, or a stone lintel with a keystone on the grander houses
    if(arch){const cx=wx+ww/2,cy=wy+ww/2,R0=ww/2+.4,R1=ww/2+2.6;c.save();c.beginPath();c.arc(cx,cy,R1,Math.PI,0);c.arc(cx,cy,R0,0,Math.PI,true);c.closePath();c.clip();stone(c,cx-R1,cy-R1,R1*2,R1,{lit:.25});
      c.strokeStyle=rgba('#000000',.55);c.lineWidth=.4;c.beginPath();for(let k=1;k<7;k++){const a=Math.PI+k*Math.PI/7;c.moveTo(cx+Math.cos(a)*R0,cy+Math.sin(a)*R0);c.lineTo(cx+Math.cos(a)*R1,cy+Math.sin(a)*R1);}c.stroke();c.restore();
      stone(c,cx-1.5,cy-R1-.8,3,3.4,{lit:.35});}
    else{stone(c,wx-1.8,wy-3.4,ww+3.6,3.2,{lit:.2});if(b.gild)stone(c,wx+ww/2-1.7,wy-4.4,3.4,4.6,{lit:.35});}
    if(b.boxes&&i===fl-1&&r()<.6){c.fillStyle='#120d0b';c.fillRect(wx-1,wy+wh+2.4,ww+2,3.4);c.fillStyle=rgba(C.rim,.2);c.fillRect(wx-1,wy+wh+2.4,ww+2,.4);
      for(let k=0;k<9;k++){c.fillStyle=mix('#14241a','#3a5a2c',r()*.7);c.beginPath();c.arc(wx+r()*ww,wy+wh+1.8+r()*.8,1+r()*.7,0,TAU);c.fill();}
      for(let k=0;k<3;k++){c.fillStyle=r()<.5?'#a8282c':'#c87a3a';c.fillRect(wx+r()*ww,wy+wh+.6+r(),1.1,1.1);}}
    if(b.balcony===i){const by=wy+wh+2.4;stone(c,wx-7,by,ww+14,1.8,{lit:.3,dark:.55});c.strokeStyle=C.ink;c.lineWidth=1;c.beginPath();c.moveTo(wx-6,by-8);c.lineTo(wx+ww+6,by-8);for(let bx=wx-6;bx<=wx+ww+6;bx+=2.5){c.moveTo(bx,by);c.lineTo(bx,by-8);}c.stroke();
      vine(c,[{x:wx-5,y:by-4},{x:wx+ww+5,y:by-4}],{w:.6,amp:1.5,wave:8,leaf:1.6,every:2,seed:b.seed});}}
  // the faces turned to a lamp catch it: a warm wash low down, a rim on the edge toward it
  c.save();c.globalCompositeOperation='lighter';for(const lx of LAMPX){const q=lampAt(lx);if(q.x<x0-130||q.x>x1+130)continue;
    c.fillStyle=rad(c,q.x,q.y+10,0,110,[[0,rgba('#ffb866',.13)],[.5,rgba('#ffb866',.04)],[1,rgba('#ffb866',0)]]);c.fillRect(Math.max(x0,q.x-150),Math.max(top,q.y-130),Math.min(x1,q.x+150)-Math.max(x0,q.x-150),Math.min(base,q.y+170)-Math.max(top,q.y-130));}c.restore();
  for(const [ex,side] of [[x0,1],[x1,-1]]){const k=lampNear(ex);if(k<=0)continue;c.fillStyle=lin(c,ex,0,ex+side*5,0,[[0,rgba(C.rim,.45*k)],[1,rgba(C.rim,0)]]);c.fillRect(side>0?ex:ex-5,top,5,base-top);}
  return{gTop,base};}
// a shopfront: pilasters with consoles, a black glass fascia, a lit window in lights over a panelled stallriser, a half-glazed door
function shopfront(c,x0,x1,gTop,base,o){const w=x1-x0,fh=o.fasciaH||11,P=o.pil||4,st=o.stall||7;
  timber(c,o,x0+P,gTop+fh,w-2*P,base-gTop-fh);
  // pilasters either side on stone plinths, a console where each meets the fascia
  for(const px of [x0,x1-P]){timber(c,o,px,gTop,P,base-gTop,true);c.fillStyle=rgba('#000000',.4);c.fillRect(px+P*.45,gTop+fh+4,.5,base-gTop-fh-10);c.fillStyle=rgba(C.rim,.2);c.fillRect(px+P-.6,gTop+fh,.5,base-gTop-fh-4);
    stone(c,px-.4,base-4,P+.8,4,{lit:.2,dark:.55});}
  fascia(c,x0+P,gTop,w-2*P,fh,o);
  for(const px of [x0,x1-P]){timber(c,o,px-.8,gTop-2,P+1.6,fh+4,true);c.fillStyle=rgba(C.rim,.3);c.fillRect(px-.8,gTop-2,P+1.6,.5);c.fillStyle=rgba('#000000',.45);c.fillRect(px-.8,gTop+fh+1.6,P+1.6,.5);scroll(c,px+P/2,gTop+fh*.6,1.5,px===x0?1:-1,C.gold,.45,1.3);}
  timber(c,o,x0-1.5,gTop-3.4,w+3,2);c.fillStyle=rgba(C.rim,.32);c.fillRect(x0-1.5,gTop-3.4,w+3,.5);
  const wy=gTop+fh+2,door=o.door||[x1-P-16,14],left=door[0]<x0+w/2,win0=left?door[0]+door[1]+3:x0+P+1,win1=left?x1-P-1:door[0]-3,wh=base-st-wy,lit=o.lit==null?.9:o.lit;
  // the window, its glazing bars and transom
  windowPane(c,win0,wy,win1-win0,wh,lit,{mull:0,fw:.01,frame:'#0a0808',spill:false});
  if(o.inside)o.inside(c,win0,wy,win1-win0,wh);
  const n=o.lights||3,lw=(win1-win0)/n;
  timber(c,o,win0,wy+wh*.22,win1-win0,1.4);for(let i=1;i<n;i++){timber(c,o,win0+i*lw-.7,wy,1.4,wh,true);c.fillStyle=rgba(C.rim,.18);c.fillRect(win0+i*lw+.3,wy,.4,wh);}
  c.strokeStyle='#060405';c.lineWidth=.8;c.strokeRect(win0,wy,win1-win0,wh);glassSheen(c,win0,wy,win1-win0,wh,.045);
  // the stallriser under it, a panel to each light, under a timber sill
  for(let i=0;i<n;i++)panel(c,o,win0+i*lw+1,wy+wh+2.4,lw-2,st-3.6);
  timber(c,o,win0-1.5,wy+wh,win1-win0+3,1.4);c.fillStyle=rgba(C.rim,.35);c.fillRect(win0-1.5,wy+wh,win1-win0+3,.45);
  shopDoor(c,o,door[0],wy-2,door[1],base,o.doorLit==null?.5:o.doorLit);
  if(lit>0)SPILL.push({x0:win0,x1:win1,a:lit*.6});}
// what the other shops show in their windows, dark against the light inside
const GOODS={
  apothecary:(c,x,y,w,h)=>{const r=rng(4);for(const f of [.42,.72]){const sy=y+h*f;c.fillStyle=rgba(C.ink,.85);c.fillRect(x+2,sy,w-4,1);for(let bx=x+4;bx<x+w-4;bx+=2.6+r()*2){const bh=2.5+r()*3.5;c.fillRect(bx,sy-bh,1.6,bh);c.fillRect(bx+.4,sy-bh-1,.8,1);}}
    for(const [fx,col] of [[.22,'#3a8a5a'],[.78,'#a8302c']]){const cx=x+w*fx,cy=y+h*.22;c.fillStyle=rgba(C.ink,.9);c.beginPath();c.arc(cx,cy,4.2,0,TAU);c.fill();c.fillRect(cx-.9,cy-7,1.8,3);
      c.fillStyle=rgba(col,.85);c.beginPath();c.arc(cx,cy,3.4,0,TAU);c.fill();glow(c,cx,cy,9,col,.35);c.fillStyle=rgba('#ffffff',.35);c.beginPath();c.arc(cx-1.2,cy-1.2,.8,0,TAU);c.fill();}},
  pawn:(c,x,y,w,h)=>{c.fillStyle=rgba(C.ink,.85);const cx=x+w*.25,cy=y+h*.3;c.beginPath();c.arc(cx,cy,4,0,TAU);c.fill();c.fillStyle=rgba('#f0e2c0',.7);c.beginPath();c.arc(cx,cy,3,0,TAU);c.fill();c.strokeStyle=rgba(C.ink,.9);c.lineWidth=.4;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx,cy-2.2);c.moveTo(cx,cy);c.lineTo(cx+1.6,cy+.6);c.stroke();
    c.fillStyle=rgba(C.ink,.85);c.save();c.translate(x+w*.6,y+h*.42);c.rotate(-.35);c.beginPath();c.ellipse(0,3,2.6,3.2,0,0,TAU);c.ellipse(0,-1.4,2,2.4,0,0,TAU);c.fill();c.fillRect(-.4,-9,.8,7);c.restore();
    c.fillRect(x+2,y+h*.7,w-4,1);for(const [fx,ww,hh] of [[.15,5,3],[.35,3,5],[.55,6,2.5],[.78,4,4]])c.fillRect(x+w*fx,y+h*.7-hh,ww,hh);},
  post:(c,x,y,w,h)=>{const r=rng(9);c.fillStyle=rgba(C.ink,.8);c.fillRect(x+2,y+h*.15,w-4,h*.5);for(let i=0;i<4;i++)for(let j=0;j<6;j++){const px=x+3+j*(w-6)/6,py=y+h*.17+i*h*.12;if(r()<.6){c.fillStyle=rgba(r()<.7?'#efe4cc':'#c8a878',.75);c.fillRect(px+.6,py+h*.06-2.2,(w-6)/6-1.6,2.2);}}
    c.fillStyle=rgba(C.ink,.85);c.fillRect(x+2,y+h*.78,w-4,h*.22);},
  wines:(c,x,y,w,h)=>{const r=rng(6);c.fillStyle=rgba(C.ink,.85);for(const f of [.35,.62,.88]){const sy=y+h*f;c.fillRect(x+2,sy,w-4,.8);for(let bx=x+3;bx<x+w-3;bx+=2.4){c.fillRect(bx,sy-5,1.7,5);c.fillRect(bx+.5,sy-7,.7,2);if(r()<.4){c.fillStyle=rgba('#ffd9a0',.35);c.fillRect(bx+.3,sy-4.6,.4,3);c.fillStyle=rgba(C.ink,.85);}}}}};
// ---------- the Lantern Bistro ----------
// mahogany front, black glass fascia with its name in gilt, six lights over a panelled stallriser with the dining room's red velvet
// café curtains inside, gold leaf on the glass, a striped awning, a glazed double door with brass plates
const BISTRO={wood:{dark:'#120705',mid:'#2e140b',light:'#55271a',rings:7,sharp:3},woodSeed:17,woodDark:.25};
function bistroInside(c,x,y,w,h,o){o=o||{};const r=rng(o.seed||91),nl=o.lan||5,nd=o.n||8;c.save();if(o.clip)o.clip();else{c.beginPath();c.rect(x,y,w,h);}c.clip();
  // the far wall: oxblood damask over dark panelling, warm with lamplight; the bar's mirror catching it at the back
  c.fillStyle=lin(c,0,y,0,y+h,[[0,'#3a1410'],[.35,'#6e2c18'],[.62,'#5a2414'],[1,'#2a100a']]);c.fillRect(x,y,w,h);
  c.globalAlpha=.35;c.fillStyle=patAt(c,TX().damask({}),x,y,30/144);c.fillRect(x,y,w,h*.6);c.globalAlpha=1;
  c.fillStyle=rgba('#160704',.85);c.fillRect(x,y+h*.6,w,h*.4);c.fillStyle=rgba(C.gold,.35);c.fillRect(x,y+h*.6,w,.5);
  c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,x+w*.7,0,x+w*.96,0,[[0,rgba('#ffe0a0',0)],[.5,rgba('#ffe0a0',.16)],[1,rgba('#ffe0a0',0)]]);c.fillRect(x+w*.7,y+h*.1,w*.26,h*.42);c.restore();
  // lanterns hanging low, each in its own glow
  for(let i=0;i<nl;i++){const lx=x+w*(nl>1?.18+i*.64/(nl-1):.5)+(r()-.5)*4,ly=y+h*(o.lanY||.27)+r()*h*.05;c.strokeStyle=rgba('#000000',.7);c.lineWidth=.4;c.beginPath();c.moveTo(lx,y);c.lineTo(lx,ly-2.4);c.stroke();
    glow(c,lx,ly+1,18,'#ffc070',.45);c.fillStyle='#2a1a0a';c.fillRect(lx-1.9,ly-2.6,3.8,1.1);c.fillStyle=lin(c,0,ly-1.5,0,ly+2.8,[[0,'#fff3d0'],[1,'#ffb25a']]);c.fillRect(lx-1.5,ly-1.5,3,4.3);c.fillStyle='#2a1a0a';c.fillRect(lx-1.9,ly+2.8,3.8,.9);}
  // diners at their tables, heads and shoulders above the curtains, candlelight on the near side of a face; a waiter with a tray
  const rod=o.rod||y+h*.6;for(let i=0;i<nd;i++){const hx=x+10+i*(w-20)/Math.max(1,nd-1)+(r()-.5)*8,s=.95+r()*.25,hy=rod-4.2*s-r()*1.6,sd=r()<.5?-1:1,prof=r()<.5;
    c.fillStyle='#0c0605';c.beginPath();c.moveTo(hx-5.4*s,rod+1);c.quadraticCurveTo(hx-5*s,hy+3.4*s,hx-1.2*s,hy+2.6*s);c.lineTo(hx+1.2*s,hy+2.6*s);c.quadraticCurveTo(hx+5*s,hy+3.4*s,hx+5.4*s,rod+1);c.fill();
    c.beginPath();c.ellipse(hx,hy,2.1*s,2.5*s,0,0,TAU);c.fill();if(prof){c.beginPath();c.moveTo(hx+sd*1.8*s,hy-.4*s);c.lineTo(hx+sd*2.7*s,hy+.5*s);c.lineTo(hx+sd*1.8*s,hy+1*s);c.fill();}
    if(r()<.35){c.fillRect(hx-2.6*s,hy-2.4*s,5.2*s,.9*s);c.fillRect(hx-1.7*s,hy-4.4*s,3.4*s,2.2*s);}else if(r()<.5){c.beginPath();c.ellipse(hx-sd*.6*s,hy-1.4*s,2.4*s,1.6*s,0,0,TAU);c.fill();}
    // the candle below lights the near side of a face and the edge of a shoulder
    c.save();c.globalCompositeOperation='lighter';c.fillStyle=rad(c,hx+sd*1.2*s,hy+2*s,0,3*s,[[0,rgba('#ff9a50',.5)],[1,rgba('#ff9a50',0)]]);c.beginPath();c.ellipse(hx,hy,2.1*s,2.5*s,0,0,TAU);c.fill();
    c.strokeStyle=rgba('#ffb066',.35);c.lineWidth=.4;c.beginPath();c.moveTo(hx+sd*1.4*s,hy+2.8*s);c.quadraticCurveTo(hx+sd*4.6*s,hy+3.5*s,hx+sd*5.2*s,rod);c.stroke();c.restore();}
  if(o.waiter!==false){const wx=x+w*.64,wt=rod-12;c.fillStyle='#0a0504';c.beginPath();c.arc(wx,wt,2.2,0,TAU);c.fill();c.beginPath();c.moveTo(wx-3.6,rod+2);c.lineTo(wx-3,wt+3);c.lineTo(wx+3,wt+3);c.lineTo(wx+3.6,rod+2);c.fill();
    c.strokeStyle='#0a0504';c.lineWidth=1.2;c.beginPath();c.moveTo(wx+2.6,wt+4);c.lineTo(wx+6,wt+1);c.stroke();c.fillStyle='#d8c8a8';c.fillRect(wx+3.2,wt-.4,6,.8);
    c.fillStyle=rgba('#f4ead8',.9);c.fillRect(wx-1.2,wt+3.2,2.4,4);glow(c,wx+6,wt-1,5,'#fff0d0',.5);}
  c.restore();}
// a red velvet café curtain on a brass rod, lit from behind: the folds glow where the cloth is thin
function cafeCurtain(c,x0,x1,y0,y1){const n=Math.max(3,Math.round((x1-x0)/4)),fw=(x1-x0)/n;
  for(let i=0;i<n;i++){const fx=x0+i*fw;c.fillStyle=lin(c,fx,0,fx+fw,0,[[0,'#1e0306'],[.3,'#58121a'],[.5,'#76221e'],[.72,'#4a0e14'],[1,'#1e0306']]);c.fillRect(fx,y0,fw+.2,y1-y0);}
  c.fillStyle=lin(c,0,y0,0,y1,[[0,rgba('#ffb070',.16)],[.3,rgba('#000000',0)],[1,rgba('#000000',.4)]]);c.fillRect(x0,y0,x1-x0,y1-y0);
  c.fillStyle=rgba('#1a0204',.55);for(let i=0;i<n;i++){c.beginPath();c.moveTo(x0+i*fw,y0);c.quadraticCurveTo(x0+(i+.5)*fw,y0+1.3,x0+(i+1)*fw,y0);c.lineTo(x0+(i+1)*fw,y0-.2);c.lineTo(x0+i*fw,y0-.2);c.fill();}
  c.fillStyle=lin(c,0,y0-.9,0,y0+.5,[[0,C.goldL],[1,C.goldD]]);c.fillRect(x0-.6,y0-.9,x1-x0+1.2,1.3);
  c.fillStyle=C.gold;for(let i=0;i<=n;i++){c.beginPath();c.arc(x0+i*fw,y0+.3,.55,0,TAU);c.fill();}}
// the Lantern Bistro's front: a double-height mahogany front with the dining room's two tall arched windows in it, the same sunburst
// fanlights and red velvet café curtains on brass rods as inside, and an arched double door between them
function archPath(c,x0,y0,x1,y1,m){const ar=(x1-x0)/2,yc=y0+ar,cx=(x0+x1)/2;c.beginPath();c.moveTo(x0-m,y1);c.lineTo(x0-m,yc);c.arc(cx,yc,ar+m,Math.PI,0);c.lineTo(x1+m,y1);c.closePath();}
// the moulded architrave round an arch: mahogany, a gilt bead, its crown lit, a keystone carved with the vine
function archFrame(c,o,cx,yc,ar,y1,seed){const wd=TX().wood(o.woodSeed||11,256,128,o.wood);
  c.save();c.beginPath();c.arc(cx,yc,ar+6.5,Math.PI,0);c.lineTo(cx+ar+6.5,y1);c.lineTo(cx+ar+1.2,y1);c.lineTo(cx+ar+1.2,yc);c.arc(cx,yc,ar+1.2,0,Math.PI,true);c.lineTo(cx-ar-1.2,y1);c.lineTo(cx-ar-6.5,y1);c.closePath();
  c.fillStyle=patAt(c,wd,cx,yc,.25,90);c.fill();c.fillStyle=rgba('#000000',.28);c.fill();c.restore();
  c.strokeStyle=rgba(C.gold,.8);c.lineWidth=.6;c.beginPath();c.moveTo(cx-ar-3.6,y1);c.lineTo(cx-ar-3.6,yc);c.arc(cx,yc,ar+3.6,Math.PI,0);c.lineTo(cx+ar+3.6,y1);c.stroke();
  c.strokeStyle=rgba(C.rim,.32);c.lineWidth=.6;c.beginPath();c.arc(cx,yc,ar+6.3,Math.PI*1.1,Math.PI*1.9);c.stroke();
  c.strokeStyle=rgba('#000000',.55);c.lineWidth=.6;c.beginPath();c.arc(cx,yc,ar+1.5,Math.PI*1.05,Math.PI*1.95);c.stroke();
  const ky=yc-ar;c.fillStyle=patAt(c,wd,cx,ky,.25,90);c.beginPath();c.moveTo(cx-5,ky-8);c.lineTo(cx+5,ky-8);c.lineTo(cx+3.4,ky+3);c.lineTo(cx-3.4,ky+3);c.closePath();c.fill();
  c.fillStyle=rgba(C.rim,.3);c.fillRect(cx-5,ky-8,10,.6);c.fillStyle=rgba('#000000',.4);c.fillRect(cx-3.4,ky+2.4,6.8,.6);
  vine(c,[{x:cx,y:ky-6.5},{x:cx,y:ky+1.6}],{w:.45,amp:1,wave:4,leaf:1.2,every:2,seed,shadow:false});}
// a sunburst in the head of an arch: bars from the foot of the fanlight, a gilt half-sun where they meet
function sunburst(c,cx,yc,ar,col){c.strokeStyle=col;c.lineWidth=1.5;c.beginPath();c.moveTo(cx-ar,yc);c.lineTo(cx+ar,yc);for(let k=1;k<6;k++){const a=Math.PI+k*Math.PI/6;c.moveTo(cx,yc);c.lineTo(cx+Math.cos(a)*ar,yc+Math.sin(a)*ar);}c.stroke();
  c.strokeStyle=rgba(C.rim,.22);c.lineWidth=.45;c.beginPath();c.moveTo(cx-ar+1,yc-1);c.lineTo(cx+ar-1,yc-1);c.stroke();
  c.fillStyle=col;c.beginPath();c.arc(cx,yc,ar*.21,Math.PI,0);c.fill();c.fillStyle=lin(c,cx-ar*.12,0,cx+ar*.12,0,[[0,C.goldD],[.5,C.goldL],[1,C.goldD]]);c.beginPath();c.arc(cx,yc-.4,ar*.12,Math.PI,0);c.fill();}
function bistroArch(c,o,x0,y0,x1,y1,seed,words){const w=x1-x0,h=y1-y0,ar=w/2,yc=y0+ar,cx=(x0+x1)/2,rod=lerp(yc,y1,.42),clip=()=>archPath(c,x0,y0,x1,y1,0);
  archPath(c,x0,y0,x1,y1,3.4);c.fillStyle='#060203';c.fill();
  bistroInside(c,x0,y0,w,h,{seed,rod,n:3,lan:2,lanY:.24,clip,waiter:seed===93});
  c.save();clip();c.clip();
  cafeCurtain(c,x0,x1,rod,y1);
  c.fillStyle=lin(c,0,y1-h*.3,0,y1,[[0,rgba('#d8d0c8',0)],[1,rgba('#d8d0c8',.09)]]);c.fillRect(x0,y1-h*.3,w,h*.3);
  if(words)words.forEach((wd,i)=>{if(wd)arcText(c,wd,lerp(x0,cx,.5)+i*ar,yc+8.5,90,3.9,{track:.4});});
  c.restore();
  // the sash: mahogany bars, the sunburst in the fanlight, a bar at the rod and one low down
  c.strokeStyle='#120604';c.lineWidth=2.4;clip();c.stroke();
  c.lineWidth=1.5;c.beginPath();c.moveTo(cx,yc);c.lineTo(cx,y1);c.moveTo(x0,lerp(yc,y1,.74));c.lineTo(x1,lerp(yc,y1,.74));c.stroke();
  sunburst(c,cx,yc,ar,'#120604');
  glassSheen(c,x0,y0,w,h,.04);
  archFrame(c,o,cx,yc,ar,y1,seed);
  timber(c,o,x0-6,y1,w+12,2.4);c.fillStyle=rgba(C.rim,.4);c.fillRect(x0-6,y1,w+12,.5);c.fillStyle=rgba(C.gold,.45);c.fillRect(x0-6,y1+2,w+12,.35);
  SPILL.push({x0,x1,a:1});}
function bistroDoor(c,o,x0,y0,x1,base){const w=x1-x0,ar=w/2,yc=y0+ar,cx=(x0+x1)/2;
  archPath(c,x0,y0,x1,base,3.4);c.fillStyle='#060203';c.fill();
  // the fanlight: the room's warm light through it, a lantern's glow
  c.save();c.beginPath();c.arc(cx,yc,ar,Math.PI,0);c.closePath();c.clip();c.fillStyle=lin(c,0,y0,0,yc,[[0,'#5a2a14'],[1,'#a8622c']]);c.fillRect(x0,y0,w,ar);glow(c,cx,yc-4,22,'#ffd28a',.6);c.restore();
  sunburst(c,cx,yc,ar,'#120604');c.strokeStyle='#120604';c.lineWidth=2.4;c.beginPath();c.arc(cx,yc,ar,Math.PI,0);c.stroke();
  // a pair of glazed leaves: café curtains low on the glass, brass push plates and kick plates
  for(const k of [0,1]){const lx=x0+k*w/2,lw=w/2,gy=yc+2.5,gh=(base-yc)*.56;timber(c,o,lx,yc+1,lw,base-yc-1,true);c.strokeStyle='#050304';c.lineWidth=.5;c.strokeRect(lx+.25,yc+1.25,lw-.5,base-yc-1.5);
    windowPane(c,lx+2.2,gy,lw-4.4,gh,.85,{mull:0,fw:.6,spill:false});c.save();c.beginPath();c.rect(lx+2.2,gy,lw-4.4,gh);c.clip();cafeCurtain(c,lx+2.2,lx+lw-2.2,gy+gh*.5,gy+gh);c.restore();glassSheen(c,lx+2.2,gy,lw-4.4,gh,.05);
    c.fillStyle=lin(c,0,gy+gh*.36,0,gy+gh*.36+7,[[0,C.goldL],[1,C.goldD]]);c.fillRect(k?lx+1.4:lx+lw-3.8,gy+gh*.36,2.4,7);
    panel(c,o,lx+2.2,gy+gh+2.4,lw-4.4,base-gy-gh-8);c.fillStyle=lin(c,0,base-4.6,0,base-1.6,[[0,C.goldL],[1,C.goldD]]);c.fillRect(lx+1,base-4.6,lw-2,3);}
  timber(c,o,x0,yc-1,w,2.6);c.fillStyle=rgba(C.rim,.3);c.fillRect(x0,yc-1,w,.5);
  gilt(c,'L·B',cx,yc+2.5+(base-yc)*.17,6.5,{style:'700'});
  archFrame(c,o,cx,yc,ar,base,7);
  stone(c,x0-4,base-1.4,w+8,2.8,{lit:.42});
  SPILL.push({x0,x1,a:.6});}
// a brass lantern hung on a scrolled iron bracket from the face of a pier
function pierLantern(c,x,y){c.strokeStyle='#09080c';c.lineWidth=1.3;c.beginPath();c.moveTo(x,y-19);c.lineTo(x,y-11);c.stroke();c.fillStyle='#09080c';c.fillRect(x-2.4,y-21,4.8,3);c.fillStyle=rgba(C.rim,.3);c.fillRect(x-2.4,y-21,4.8,.5);
  scroll(c,x-2.6,y-15,2.4,-1,C.gold,.55,1.2);scroll(c,x+2.6,y-15,2.4,1,C.gold,.55,1.2);
  c.fillStyle='#09080c';c.beginPath();c.moveTo(x-4.5,y-8);c.lineTo(x,y-11.5);c.lineTo(x+4.5,y-8);c.closePath();c.fill();c.fillStyle=rgba(C.gold,.6);c.fillRect(x-4.3,y-8.2,8.6,.4);
  c.fillStyle=lin(c,0,y-8,0,y+2,[[0,'#fff3d2'],[1,'#ffb259']]);c.beginPath();c.moveTo(x-4,y-8);c.lineTo(x+4,y-8);c.lineTo(x+3,y+2);c.lineTo(x-3,y+2);c.closePath();c.fill();
  c.strokeStyle='#09080c';c.lineWidth=.35;c.beginPath();c.moveTo(x,y-8);c.lineTo(x,y+2);c.stroke();c.fillStyle='#09080c';c.fillRect(x-3.4,y+2,6.8,1.6);c.fillRect(x-.6,y+3.6,1.2,1.4);
  glow(c,x,y-3,30,'#ffc070',.55);}
function bistroFront(c,x0,x1,gTop,base){const o=BISTRO,P=7,fh=15,st=12,y0w=gTop+fh+7,y1w=base-st,W1=[131,207],DR=[226,276],W2=[295,371];
  timber(c,o,x0+P,gTop+fh,x1-x0-2*P,base-gTop-fh);
  // pilasters and piers: fluted, on stone plinths, under moulded capitals
  const piers=[[x0,x0+P],[W1[1]+6.5,DR[0]-6.5],[DR[1]+6.5,W2[0]-6.5],[x1-P,x1]];
  for(const [a,b] of piers){const pw=b-a;timber(c,o,a,gTop+fh,pw,base-gTop-fh,true);
    for(let fx=a+1.6;fx<b-1.2;fx+=1.5){c.fillStyle=rgba('#000000',.42);c.fillRect(fx,gTop+fh+10,.5,base-gTop-fh-22);c.fillStyle=rgba(C.rim,.14);c.fillRect(fx+.55,gTop+fh+10,.35,base-gTop-fh-22);}
    timber(c,o,a-1,gTop+fh+2,pw+2,4);c.fillStyle=rgba(C.rim,.3);c.fillRect(a-1,gTop+fh+2,pw+2,.5);c.fillStyle=rgba(C.gold,.55);c.fillRect(a-1,gTop+fh+5.2,pw+2,.4);
    stone(c,a-.6,base-7,pw+1.2,7,{lit:.3,dark:.52});}
  fascia(c,x0+P,gTop,x1-x0-2*P,fh,{name:'LANTERN BISTRO',size:11,track:2.4,glowName:.3});
  for(const px of [x0,x1-P]){timber(c,o,px-1,gTop-3,P+2,fh+6,true);c.fillStyle=rgba(C.rim,.32);c.fillRect(px-1,gTop-3,P+2,.6);c.fillStyle=rgba('#000000',.5);c.fillRect(px-1,gTop+fh+2.4,P+2,.6);
    scroll(c,px+P/2,gTop+fh*.45,2,px===x0?1:-1,C.gold,.6,1.5);c.fillStyle=C.gold;c.beginPath();c.ellipse(px+P/2,gTop+fh*.82,1,1.8,0,0,TAU);c.fill();}
  timber(c,o,x0-2,gTop-4.6,x1-x0+4,2.6);c.fillStyle=rgba(C.rim,.38);c.fillRect(x0-2,gTop-4.6,x1-x0+4,.6);c.fillStyle=rgba(C.gold,.5);c.fillRect(x0-2,gTop-2.4,x1-x0+4,.4);
  // the two tall windows of the dining room, a panelled stallriser under each
  const bl=blown();
  if(bl){bistroArchBlown(c,o,W1[0],y0w,W1[1],y1w,92,1);bistroArchBlown(c,o,W2[0],y0w,W2[1],y1w,93,-1);}
  else{bistroArch(c,o,W1[0],y0w,W1[1],y1w,92,['WINES','SUPPERS']);
    bistroArch(c,o,W2[0],y0w,W2[1],y1w,93,['OPEN','LATE']);}
  for(const [a,b] of [W1,W2]){panel(c,o,a+1,y1w+3,(b-a)/2-1.6,st-5);panel(c,o,(a+b)/2+.6,y1w+3,(b-a)/2-1.6,st-5);}
  if(bl){bistroDoorBlown(c,o,DR[0],y0w+6,DR[1],base);
    // the blast's soot: a fan over the front round the doorway and a plume up the fascia, darkest at the hole
    frontSoot(c,(DR[0]+DR[1])/2,y0w+6,base,gTop);
    piers.forEach(([a,b],i)=>i===1||i===2?pierLanternBroken(c,(a+b)/2,gTop+fh+44,i):pierLantern(c,(a+b)/2,gTop+fh+44));}
  else{bistroDoor(c,o,DR[0],y0w+6,DR[1],base);
    for(const [a,b] of piers)pierLantern(c,(a+b)/2,gTop+fh+44);}}
// ---------- the bistro after the grenade (S.bistro==='blown') ----------
// The doors are blown in: the left leaf hangs from its top hinge, the right lies on the floor inside; the frame is splintered and
// scorched, the fanlight's bars are gone but two, the windows either side are smashed and their curtains torn and smouldering, and
// soot fans out over the front and the flags. Through the hole the dining room is full of smoke, red from a fire low down.
function blown(){return typeof S!=='undefined'&&S.bistro==='blown';}
// where the doorway is on screen (the facade's own frame), for live() and the blast
function doorG(){const base=fy(DF),gTop=base-130,y0=gTop+15+7+6;return{x0:226,x1:276,y0,base,cx:251,ar:25,yc:y0+25};}
// the room behind a blown opening: dark smoke over a red floor glow, chairs and a table thrown down, a lantern still alight
function smokeRoom(c,x0,y0,w,h,seed,o){o=o||{};const r=rng(seed),y1=y0+h,cx=x0+w/2;
  c.fillStyle=lin(c,0,y0,0,y1,[[0,'#090405'],[.38,'#220b07'],[.72,'#4e1909'],[1,'#7e2e0e']]);c.fillRect(x0-2,y0-2,w+4,h+4);
  // the far wall's damask just showing in the glow, and a lantern hanging on in the murk
  c.save();c.globalAlpha=.16;c.fillStyle=patAt(c,TX().damask({}),x0,y0,30/144);c.fillRect(x0,y0+h*.3,w,h*.4);c.restore();
  if(o.lantern!==false){const lx=cx+(r()-.5)*w*.4,ly=y0+h*.34;c.strokeStyle=rgba('#000000',.7);c.lineWidth=.4;c.beginPath();c.moveTo(lx-3,y0);c.lineTo(lx,ly-2);c.stroke();
    glow(c,lx,ly+1,14,'#ff9a50',.4);c.fillStyle='#2a1208';c.fillRect(lx-1.5,ly-2,3,1);c.fillStyle=lin(c,0,ly-1,0,ly+3,[[0,'#ffd8a0'],[1,'#ff8a3a']]);c.fillRect(lx-1.2,ly-1,2.4,3.4);}
  // the room's furniture thrown about, black against the fire: a table on its side, chairs with their legs in the air
  c.fillStyle='#0b0404';c.strokeStyle='#0b0404';c.lineCap='round';
  const fl=y1-h*.06;
  {const tx=x0+w*(.3+r()*.15),ty=fl-h*.1;c.save();c.translate(tx,ty);c.rotate(-.5);c.beginPath();c.ellipse(0,0,w*.2,h*.032,0,0,TAU);c.fill();c.lineWidth=1.2;c.beginPath();c.moveTo(0,0);c.lineTo(w*.02,h*.1);c.moveTo(-w*.05,h*.1);c.lineTo(w*.09,h*.1);c.stroke();c.restore();}
  for(let i=0;i<(o.chairs||2);i++){const chx=x0+w*(.15+r()*.7),chy=fl-r()*h*.04,a=(r()-.5)*2;c.save();c.translate(chx,chy);c.rotate(a);c.lineWidth=.9;
    c.beginPath();c.moveTo(-4,0);c.lineTo(4,0);c.moveTo(-4,0);c.lineTo(-4.6,-7);c.moveTo(4,0);c.lineTo(4.4,-7);c.moveTo(-4,0);c.lineTo(-4.4,6);c.moveTo(4,0);c.lineTo(4,6);c.stroke();c.restore();}
  // the fire low in the room: a hot band along the floor, brighter in places
  glow(c,cx-w*.08,y1-4,w*.55,'#ff6a20',.5,.45);glow(c,cx+w*.18,y1-3,w*.3,'#ffc070',.45,.5);
  c.fillStyle=lin(c,0,y1-h*.1,0,y1,[[0,rgba('#ff7a2a',0)],[1,rgba('#ff9a40',.35)]]);c.fillRect(x0,y1-h*.1,w,h*.1);
  // the smoke: dark lumps hanging in the top, thinning toward the fire
  for(let i=0;i<9;i++){const sx=x0+r()*w,sy=y0+r()*h*.45,R=w*(.2+r()*.3);c.fillStyle=rad(c,sx,sy,0,R,[[0,rgba('#0a0607',.75)],[1,rgba('#0a0607',0)]]);c.fillRect(sx-R,sy-R,2*R,2*R);}
  c.fillStyle=lin(c,0,y0,0,y0+h*.55,[[0,rgba('#050304',.85)],[1,rgba('#050304',0)]]);c.fillRect(x0,y0,w,h*.55);}
// glass gone from a frame: the jagged pieces left in its edges, catching the fire and the lamps
function shards(c,pts,n,seed,o){o=o||{};const r=rng(seed);
  for(let i=0;i<n;i++){const k=Math.floor(r()*(pts.length-1)),u=r(),a=pts[k],b=pts[k+1],ex=lerp(a.x,b.x,u),ey=lerp(a.y,b.y,u),cx=o.cx,cy=o.cy;
    const ix=cx-ex,iy=cy-ey,il=Math.hypot(ix,iy)||1,dx=ix/il,dy=iy/il,L=1.4+Math.pow(r(),1.6)*(o.len||6),wd=.7+r()*1.8,tx=-dy,ty=dx,sk=(r()-.5)*1.6;
    c.fillStyle=rgba(r()<.5?'#c8dce8':'#ffe2c4',.07+r()*.1);c.beginPath();c.moveTo(ex-tx*wd,ey-ty*wd);c.lineTo(ex+tx*wd*.7,ey+ty*wd*.7);c.lineTo(ex+dx*L+tx*sk,ey+dy*L+ty*sk);c.closePath();c.fill();
    c.strokeStyle=rgba('#ffe8cc',.22+r()*.22);c.lineWidth=.25;c.beginPath();c.moveTo(ex+tx*wd*.7,ey+ty*wd*.7);c.lineTo(ex+dx*L+tx*sk,ey+dy*L+ty*sk);c.stroke();
    if(r()<.25){c.fillStyle=rgba('#fff6e0',.75);c.fillRect(ex+dx*L*.5,ey+dy*L*.5,.5,.5);}}}
// raw wood standing out of a broken edge: pale splinters with dark sides
function splinters(c,pts,n,seed,cx,cy,len){const r=rng(seed);
  for(let i=0;i<n;i++){const k=Math.floor(r()*(pts.length-1)),u=r(),a=pts[k],b=pts[k+1],ex=lerp(a.x,b.x,u),ey=lerp(a.y,b.y,u);
    const ix=cx-ex,iy=cy-ey,il=Math.hypot(ix,iy)||1,an=Math.atan2(iy,ix)+(r()-.5)*.9,L=1.6+r()*(len||5),wd=.5+r()*1.1;
    c.fillStyle=r()<.6?'#8a5a34':'#6a4024';c.beginPath();c.moveTo(ex-Math.sin(an)*wd,ey+Math.cos(an)*wd);c.lineTo(ex+Math.sin(an)*wd,ey-Math.cos(an)*wd);c.lineTo(ex+Math.cos(an)*L,ey+Math.sin(an)*L);c.closePath();c.fill();
    c.strokeStyle=rgba('#1a0a04',.7);c.lineWidth=.25;c.stroke();}}
// soot laid over whatever is drawn under it: a dark fan from a point, thinning outward
function soot(c,x,y,R,a,sq){c.save();c.translate(x,y);if(sq)c.scale(1,sq);c.fillStyle=rad(c,0,0,0,R,[[0,rgba('#050303',a)],[.45,rgba('#050303',a*.62)],[1,rgba('#050303',0)]]);c.beginPath();c.arc(0,0,R,0,TAU);c.fill();c.restore();}
function frontSoot(c,cx,y0,base,gTop){const r=rng(71);
  soot(c,cx,base-30,64,.62,1.15);
  // the plume: smoke has poured up out of the top of the arch, over the fascia and the brick above
  c.save();c.beginPath();c.moveTo(cx-18,y0+10);c.bezierCurveTo(cx-26,y0-30,cx-50,gTop-30,cx-44,gTop-96);c.lineTo(cx+48,gTop-96);c.bezierCurveTo(cx+52,gTop-30,cx+26,y0-30,cx+18,y0+10);c.closePath();
  c.fillStyle=lin(c,0,y0+10,0,gTop-96,[[0,rgba('#050303',.72)],[.35,rgba('#050303',.5)],[1,rgba('#050303',0)]]);c.fill();c.restore();
  // streaks where the soot ran up the woodwork
  for(let i=0;i<14;i++){const sx=cx+(r()-.5)*70,sy=y0+r()*30,L=20+r()*50;c.fillStyle=lin(c,0,sy,0,sy-L,[[0,rgba('#050303',.35)],[1,rgba('#050303',0)]]);c.fillRect(sx,sy-L,1+r()*2.4,L);}}
function bistroDoorBlown(c,o,x0,y0,x1,base){const w=x1-x0,ar=w/2,yc=y0+ar,cx=(x0+x1)/2,r=rng(404),open=()=>archPath(c,x0,y0,x1,base,0);
  archPath(c,x0,y0,x1,base,3.4);c.fillStyle='#060203';c.fill();
  // through the hole, the dining room in smoke
  c.save();open();c.clip();smokeRoom(c,x0,y0,w,base-y0,31,{chairs:3});
  // the right leaf, down inside on the floor: seen end on, a dark slab, its kick plate catching the fire
  {const fy0=base-2;c.fillStyle='#120806';c.beginPath();c.moveTo(cx-4,fy0);c.lineTo(x1+6,fy0-3);c.lineTo(x1+12,fy0-15);c.lineTo(cx+5,fy0-12);c.closePath();c.fill();
    c.fillStyle=rgba('#ffb060',.55);c.beginPath();c.moveTo(cx-3,fy0-.6);c.lineTo(x1+6,fy0-3.6);c.lineTo(x1+6.6,fy0-4.8);c.lineTo(cx-2.4,fy0-1.8);c.closePath();c.fill();
    c.strokeStyle=rgba('#ff9a50',.4);c.lineWidth=.5;c.beginPath();c.moveTo(cx+5,fy0-12);c.lineTo(x1+12,fy0-15);c.stroke();}
  // the left leaf: off its lower hinge, hanging from the top one, swung in and turned, its glass gone and its foot splintered
  {const lw=w/2,lh=base-yc-1,hx=x0+1,hy=yc+2,sq=.8,an=.21,gh=lh*.56;c.save();c.translate(hx,hy);c.rotate(an);c.scale(sq,1);
    const leaf=()=>{c.beginPath();c.moveTo(0,0);c.lineTo(lw,0);c.lineTo(lw,lh-6);for(let x=lw;x>=0;x-=2.5)c.lineTo(x,lh-6+(Math.floor(x*7.3)%5));c.closePath();};
    leaf();c.fillStyle=patAt(c,TX().wood(o.woodSeed||11,256,128,o.wood),0,0,.25,90);c.fill();leaf();c.fillStyle=rgba('#000000',.38);c.fill();
    // the glass is gone from the upper part: the fire shows through the frame
    c.fillStyle=lin(c,0,2.5,0,gh+2.5,[[0,'#2a0c08'],[.6,'#7a2a0e'],[1,'#c8561c']]);c.fillRect(2.2,2.5,lw-4.4,gh);
    c.strokeStyle=rgba('#ffb070',.35);c.lineWidth=.4;c.strokeRect(2.2,2.5,lw-4.4,gh);
    shards(c,[{x:2.2,y:2.5},{x:lw-2.2,y:2.5},{x:lw-2.2,y:gh+2.5},{x:2.2,y:gh+2.5},{x:2.2,y:2.5}],9,77,{cx:lw/2,cy:gh/2,len:5});
    panel(c,o,2.2,gh+4.9,lw-4.4,lh-gh-14);
    c.fillStyle=lin(c,0,gh*.36,0,gh*.36+7,[[0,C.goldL],[1,C.goldD]]);c.save();c.translate(lw-3.8,gh*.4);c.rotate(.25);c.fillRect(0,0,2.4,7);c.restore();
    // its edges lit from behind by the fire, its top hinge still holding it
    c.strokeStyle=rgba('#ff8a3a',.7);c.lineWidth=.8;c.beginPath();c.moveTo(lw,0);c.lineTo(lw,lh-6);c.stroke();
    c.fillStyle=lin(c,0,-1,0,5,[[0,C.goldL],[1,C.goldD]]);c.fillRect(-.6,1,2.2,5);
    splinters(c,[{x:0,y:lh-5},{x:lw,y:lh-5}],8,61,lw/2,lh+20,4);
    c.restore();}
  c.restore();
  // the fanlight: its glass and most of its bars gone, two stubs left on the hub and the hub hanging
  c.strokeStyle='#120604';c.lineWidth=1.5;c.beginPath();for(const [k,f] of [[1,.62],[4,.45]]){const a=Math.PI+k*Math.PI/6;c.moveTo(cx,yc);c.lineTo(cx+Math.cos(a)*ar*f,yc+Math.sin(a)*ar*f);}c.stroke();
  c.save();c.translate(cx-1,yc+2);c.rotate(.42);c.fillStyle='#120604';c.beginPath();c.arc(0,0,ar*.21,Math.PI,0);c.fill();c.fillStyle=lin(c,-ar*.12,0,ar*.12,0,[[0,C.goldD],[.5,C.goldL],[1,C.goldD]]);c.beginPath();c.arc(0,-.4,ar*.12,Math.PI,0);c.fill();c.restore();
  // what is left of the fanlight's outer bar: broken off at either side of the crown
  c.strokeStyle='#120604';c.lineWidth=2.4;c.beginPath();c.arc(cx,yc,ar,Math.PI,Math.PI*1.22);c.stroke();c.beginPath();c.arc(cx,yc,ar,Math.PI*1.5,Math.PI*1.86);c.stroke();
  shards(c,(()=>{const q=[];for(let a=Math.PI;a<=TAU+.01;a+=Math.PI/10)q.push({x:cx+Math.cos(a)*ar,y:yc+Math.sin(a)*ar});return q;})(),8,88,{cx,cy:yc+6,len:4});
  // the transom rail snapped: the left half hanging from the jamb, a stub on the right
  c.save();c.translate(x0,yc-1);c.rotate(.2);timber(c,o,0,0,w*.46,2.6);c.restore();timber(c,o,x1-6,yc-1,6,2.6);
  // the architrave: splintered along the opening, blackened
  archFrame(c,o,cx,yc,ar,base,7);
  {const q=[{x:x0+1.2,y:base}];q.push({x:x0+1.2,y:yc});for(let a=Math.PI;a<=TAU+.01;a+=Math.PI/12)q.push({x:cx+Math.cos(a)*(ar+1.2),y:yc+Math.sin(a)*(ar+1.2)});q.push({x:x1-1.2,y:base});
    splinters(c,q,26,93,cx,yc+20,6);}
  // the keystone cracked across
  c.strokeStyle=rgba('#000000',.8);c.lineWidth=.6;c.beginPath();c.moveTo(cx-4,yc-ar-6);c.lineTo(cx-.5,yc-ar-3.4);c.lineTo(cx+.8,yc-ar-5);c.lineTo(cx+4.4,yc-ar-1.8);c.stroke();
  // the step: cracked and black
  stone(c,x0-4,base-1.4,w+8,2.8,{lit:.18});c.fillStyle=rgba('#050303',.55);c.fillRect(x0-4,base-1.4,w+8,2.8);
  c.strokeStyle=rgba('#000000',.85);c.lineWidth=.4;c.beginPath();c.moveTo(cx-10,base-1.4);c.lineTo(cx-7,base+.2);c.lineTo(cx-8.4,base+1.4);c.stroke();
  SPILL.push({x0,x1,a:.9,col:'#ff6a26'});}
// a window of the dining room with its glass blown out: the room behind gone red with smoke, the curtain torn and smouldering, shards
// left in the frame, two bars of the sash broken. side is the way to the door (+1 right): that side has it worst.
function bistroArchBlown(c,o,x0,y0,x1,y1,seed,side){const w=x1-x0,h=y1-y0,ar=w/2,yc=y0+ar,cx=(x0+x1)/2,rod=lerp(yc,y1,.42),clip=()=>archPath(c,x0,y0,x1,y1,0),r=rng(seed*7+3);
  archPath(c,x0,y0,x1,y1,3.4);c.fillStyle='#060203';c.fill();
  c.save();clip();c.clip();
  smokeRoom(c,x0,y0,w,h,seed+5,{chairs:2});
  // the café curtain: torn up from the bottom and burnt along the tears, a few rags still on the rod
  tornCurtain(c,x0,x1,rod,y1,seed,side);
  c.restore();
  // the glass: gone, but for the jagged pieces left in the frame
  const ring=[{x:x0,y:y1}];ring.push({x:x0,y:yc});for(let a=Math.PI;a<=TAU+.01;a+=Math.PI/12)ring.push({x:cx+Math.cos(a)*ar,y:yc+Math.sin(a)*ar});ring.push({x:x1,y:y1});
  shards(c,ring,16,seed*3,{cx,cy:yc+h*.2,len:5});
  // the sash: its outer bar, the mullion broken through low down, the bar at the rod snapped on the door side, three bars of the sunburst left
  c.strokeStyle='#120604';c.lineWidth=2.4;clip();c.stroke();
  c.lineWidth=1.5;c.beginPath();c.moveTo(cx,yc);c.lineTo(cx,lerp(yc,y1,.58));c.moveTo(cx+side*1.4,lerp(yc,y1,.68));c.lineTo(cx+side*3,y1);
  const yb=lerp(yc,y1,.74);if(side>0){c.moveTo(x0,yb);c.lineTo(cx-4,yb+1.2);}else{c.moveTo(cx+4,yb+1.2);c.lineTo(x1,yb);}c.stroke();
  c.strokeStyle='#120604';c.lineWidth=1.5;c.beginPath();c.moveTo(cx-ar,yc);c.lineTo(cx+ar,yc);for(const k of side>0?[1,2,3]:[3,4,5]){const a=Math.PI+k*Math.PI/6;c.moveTo(cx,yc);c.lineTo(cx+Math.cos(a)*ar,yc+Math.sin(a)*ar);}c.stroke();
  c.fillStyle='#120604';c.beginPath();c.arc(cx,yc,ar*.21,Math.PI,0);c.fill();c.fillStyle=lin(c,cx-ar*.12,0,cx+ar*.12,0,[[0,C.goldD],[.5,C.goldL],[1,C.goldD]]);c.beginPath();c.arc(cx,yc-.4,ar*.12,Math.PI,0);c.fill();
  archFrame(c,o,cx,yc,ar,y1,seed);
  // the frame on the door's side took the blast: blackened, splintered along its inner edge
  soot(c,side>0?x1:x0,lerp(yc,y1,.5),w*.6,.55,1.6);
  splinters(c,side>0?[{x:x1-1,y:yc},{x:x1-1,y:y1}]:[{x:x0+1,y:yc},{x:x0+1,y:y1}],10,seed*5,cx,lerp(yc,y1,.5),4);
  timber(c,o,x0-6,y1,w+12,2.4);c.fillStyle=rgba(C.rim,.3);c.fillRect(x0-6,y1,w+12,.5);c.fillStyle=rgba(C.gold,.35);c.fillRect(x0-6,y1+2,w+12,.35);
  SPILL.push({x0,x1,a:.75,col:'#ff7a34'});}
// a café curtain after the blast: torn into rags of every length, gaps burnt through between them, the rags' ends charred and a few
// still glowing; the side toward the door has the least left
function tornCurtain(c,x0,x1,y0,y1,seed,side){const r=rng(seed*11+5),h=y1-y0,rags=[];
  for(let x=x0;x<x1-.5;){const wd=1.8+r()*4.2,near=side>0?(x-x0)/(x1-x0):(x1-x)/(x1-x0);
    if(r()<.14+.2*near){x+=wd*.8;continue;}
    const len=h*clamp(1-near*.55-r()*.55,.08,1),tip=(r()-.5)*wd*.8;rags.push({a:x,b:Math.min(x1,x+wd),len,tip});x+=wd;}
  const ragPath=g=>{c.moveTo(g.a,y0);c.lineTo(g.b,y0);c.lineTo(g.b-(g.b-g.a)*.1,y0+g.len*.86);c.lineTo((g.a+g.b)/2+g.tip,y0+g.len);c.lineTo(g.a+(g.b-g.a)*.12,y0+g.len*.8);c.closePath();};
  c.save();c.beginPath();for(const g of rags)ragPath(g);c.clip();cafeCurtain(c,x0,x1,y0,y1);c.fillStyle=lin(c,0,y0,0,y1,[[0,rgba('#050303',.3)],[1,rgba('#050303',.72)]]);c.fillRect(x0,y0,x1-x0,h);c.restore();
  // the charred ends: black, and on some a thread of embers
  for(const g of rags){const m=(g.a+g.b)/2+g.tip,yb=y0+g.len;c.strokeStyle=rgba('#0a0403',.9);c.lineWidth=.9;c.beginPath();c.moveTo(g.a+(g.b-g.a)*.12,y0+g.len*.8);c.lineTo(m,yb);c.lineTo(g.b-(g.b-g.a)*.1,y0+g.len*.86);c.stroke();
    if(r()<.4){c.strokeStyle=rgba('#ff7a2a',.6);c.lineWidth=.35;c.beginPath();c.moveTo(g.a+(g.b-g.a)*.2,y0+g.len*.84);c.lineTo(m,yb-.5);c.stroke();glow(c,m,yb-.4,2.2,'#ff8a3a',.6);}}}
// a pier lantern the blast reached: its glass gone, hanging askew on its bracket, the flame out (live() lets one sputter)
function pierLanternBroken(c,x,y,i){c.strokeStyle='#09080c';c.lineWidth=1.3;c.beginPath();c.moveTo(x,y-19);c.lineTo(x,y-11);c.stroke();c.fillStyle='#09080c';c.fillRect(x-2.4,y-21,4.8,3);
  scroll(c,x-2.6,y-15,2.4,-1,C.gold,.45,1.2);scroll(c,x+2.6,y-15,2.4,1,C.gold,.45,1.2);
  c.save();c.translate(x,y-11.5);c.rotate(i===1?.55:-.38);c.translate(-x,-(y-11.5));
  c.fillStyle='#09080c';c.beginPath();c.moveTo(x-4.5,y-8);c.lineTo(x,y-11.5);c.lineTo(x+4.5,y-8);c.closePath();c.fill();c.fillStyle=rgba(C.gold,.45);c.fillRect(x-4.3,y-8.2,8.6,.4);
  c.fillStyle='#120a08';c.beginPath();c.moveTo(x-4,y-8);c.lineTo(x+4,y-8);c.lineTo(x+3,y+2);c.lineTo(x-3,y+2);c.closePath();c.fill();
  c.strokeStyle='#09080c';c.lineWidth=.55;c.beginPath();c.moveTo(x-4,y-8);c.lineTo(x-3,y+2);c.moveTo(x+4,y-8);c.lineTo(x+3,y+2);c.moveTo(x,y-8);c.lineTo(x,y+2);c.stroke();
  shards(c,[{x:x-4,y:y-8},{x:x+4,y:y-8},{x:x+3,y:y+2},{x:x-3,y:y+2},{x:x-4,y:y-8}],5,i*13,{cx:x,cy:y-3,len:2.4});
  c.fillStyle='#09080c';c.fillRect(x-3.4,y+2,6.8,1.6);c.restore();}
// out on the flags: the blast's scorch in front of the door, and what it threw out: splinters, glass, brass, rags of velvet, a piece of a door
function pavementBlown(c,g){const r=rng(1301),dcx=251-DF*PSX;
  c.save();c.transform(1,0,PSX,-PSY,0,g);
  // the scorch fan, in the plane of the flags, from the doorway out toward the kerb
  c.save();c.translate(dcx,DF);c.scale(1,.8);c.fillStyle=rad(c,0,0,0,70,[[0,rgba('#040303',.88)],[.4,rgba('#040303',.6)],[.75,rgba('#040303',.25)],[1,rgba('#040303',0)]]);c.beginPath();c.arc(0,0,70,Math.PI,TAU);c.fill();c.restore();
  for(let i=0;i<18;i++){const a=Math.PI*1.04+r()*Math.PI*.92,L=40+r()*55,w=.04+r()*.05;c.fillStyle=lin(c,dcx,DF,dcx+Math.cos(a)*L,DF+Math.sin(a)*L*.8,[[0,rgba('#040303',.5)],[1,rgba('#040303',0)]]);
    c.beginPath();c.moveTo(dcx,DF);c.lineTo(dcx+Math.cos(a-w)*L,DF+Math.sin(a-w)*L*.8);c.lineTo(dcx+Math.cos(a+w)*L,DF+Math.sin(a+w)*L*.8);c.closePath();c.fill();}
  c.restore();
  // the debris: thickest by the door, thinning out across the flags; each piece lies flat and catches the light along one edge
  const items=[];for(let i=0;i<130;i++){const a=Math.PI*1.02+r()*Math.PI*.96,rr=Math.pow(r(),.7)*92,x=dcx+Math.cos(a)*rr*1.25,d=Math.min(DF-1.5,DF+Math.sin(a)*rr*.85);if(d<132)continue;items.push({x,d,k:r(),a:r()*TAU,s:.6+r()*.8});}
  // and glass under each of the windows
  for(const wx of [169,333])for(let i=0;i<26;i++){const x=wx-DF*PSX+(r()-.5)*70,d=DF-2-r()*r()*44;items.push({x,d,k:.05+r()*.25,a:r()*TAU,s:.5+r()*.6});}
  items.sort((A,B)=>B.d-A.d);
  for(const it of items){const q=pp(it.x,g,it.d),k=it.k,s=it.s;c.save();c.translate(q.x,q.y);c.scale(1,.42);c.rotate(it.a);
    if(k<.34){// glass: a sliver that glints
      c.fillStyle=rgba('#d8e4ec',.32);c.beginPath();c.moveTo(-2.2*s,0);c.lineTo(1.4*s,-1.2*s);c.lineTo(2*s,.9*s);c.closePath();c.fill();c.fillStyle=rgba('#fff6e8',.75);c.fillRect(-.3*s,-.4*s,.9*s,.5*s);}
    else if(k<.74){// a splinter of mahogany
      c.fillStyle=k<.6?'#2e140b':'#55271a';c.fillRect(-4.5*s,-.7*s,9*s,1.4*s);c.fillStyle=rgba(C.rim,.3);c.fillRect(-4.5*s,-.7*s,9*s,.4*s);}
    else if(k<.86){// a bit of brass plate
      c.fillStyle=C.goldD;c.fillRect(-1.6*s,-1*s,3.2*s,2*s);c.fillStyle=rgba(C.goldL,.7);c.fillRect(-1.6*s,-1*s,3.2*s,.5*s);}
    else{// a rag of the red velvet
      c.fillStyle='#4a0c12';c.beginPath();c.moveTo(-3*s,-1*s);c.lineTo(2.4*s,-1.6*s);c.lineTo(3*s,1*s);c.lineTo(-1*s,1.8*s);c.closePath();c.fill();}
    c.restore();}
  // two big pieces: a panel off a door leaf and its brass kick plate
  for(const [x,d,a,len] of [[dcx-34,182,.4,16],[dcx+40,170,-.7,12]]){const q=pp(x,g,d);c.save();c.translate(q.x,q.y);c.scale(1,.45);c.rotate(a);
    c.fillStyle=patAt(c,TX().wood(17,256,128,BISTRO.wood),0,0,.25);c.fillRect(-len/2,-3.4,len,6.8);c.fillStyle=rgba('#000000',.4);c.fillRect(-len/2,-3.4,len,6.8);
    c.strokeStyle=rgba(C.gold,.5);c.lineWidth=.4;c.strokeRect(-len/2+1.2,-2.2,len-2.4,4.4);c.fillStyle=rgba(C.rim,.3);c.fillRect(-len/2,-3.4,len,.6);c.restore();}
  {const q=pp(dcx+16,g,194);c.save();c.translate(q.x,q.y);c.scale(1,.45);c.rotate(.2);c.fillStyle=lin(c,0,-2,0,2,[[0,C.goldL],[1,C.goldD]]);c.fillRect(-7,-1.6,14,3.2);c.restore();}}
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
  c.strokeStyle='#09080c';c.lineWidth=.8;c.beginPath();c.moveTo(lx2,ly+4);c.lineTo(lx2,ly+14);c.stroke();c.fillStyle='#09080c';c.fillRect(lx2-4,ly+14,8,2);
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
  const r=rng(5);c.strokeStyle=rgba('#ece6da',.5);c.lineWidth=.32;for(let k=0;k<4;k++){const ly=ty+5.8+k*1.8,l=4+r()*2.4;c.beginPath();c.moveTo(q.x-l/2,ly);for(let s=0;s<=l;s+=.6)c.lineTo(q.x-l/2+s,ly+(r()-.5)*.35);c.stroke();}
  c.fillStyle=rgba('#e8c060',.7);c.beginPath();c.arc(q.x,ty+bh-2.2,.6,0,TAU);c.fill();}
// a coal-hole cover set into the flags, and a drain grate in the gutter: iron, wet, catching the light
function coalHole(c,x,d){c.save();c.transform(1,0,PSX,-PSY,0,g0());c.translate(x,d);
  c.fillStyle='#0a090c';c.beginPath();c.arc(0,0,4.2,0,TAU);c.fill();c.strokeStyle=rgba('#b0a498',.22);c.lineWidth=.35;
  for(const rr of [1.3,2.5,3.5]){c.beginPath();c.arc(0,0,rr,0,TAU);c.stroke();}for(let k=0;k<8;k++){const a=k/8*TAU;c.beginPath();c.moveTo(Math.cos(a)*1.3,Math.sin(a)*1.3);c.lineTo(Math.cos(a)*3.5,Math.sin(a)*3.5);c.stroke();}
  c.strokeStyle=rgba(C.rim,.3);c.lineWidth=.5;c.beginPath();c.arc(0,0,4.2,Math.PI*1.15,Math.PI*1.85);c.stroke();c.restore();}
function grate(c,x){c.save();c.transform(1,0,PSX,-PSY,0,GB);c.fillStyle='#040306';c.fillRect(x,113,16,6);c.fillStyle=rgba('#b8a898',.24);for(let k=0;k<7;k++)c.fillRect(x+1+k*2.2,113.6,1,4.8);c.restore();}
// ---------- the scene ----------
function paint(c){SPILL=[];
  const X0=-160,X1=W+240,T0=-110,base=fy(DF);
  // the night sky, warmer toward the roofs where the city lights it
  c.fillStyle=lin(c,0,T0,0,base,[[0,C.night0],[.3,'#090c18'],[.55,'#161828'],[.78,'#30202c'],[1,'#4a2c26']]);c.fillRect(X0,T0,X1-X0,base-T0+4);
  stars(c,X0,X1,T0,150,140,9,.6);
  moon(c,226,46,12,{phase:.55});
  cloudBank(c,X0,X1,104,34,{seed:4,n:18,col:'#171726',under:'#ff9a5a'});
  // the city beyond the street: far towers in haze, the Hallowell tower, then nearer roofs
  skyline(c,X0,X1,base-40,{seed:12,far:.95,h0:40,h1:150,w0:16,w1:34,col:'#171828',hazeCol:'#3a2a36',hazeH:100,hazeA:.6,dens:.6});
  hallTower(c,712,base-30,26,48,{lit:.9});
  skyline(c,X0,X1,base-6,{seed:23,far:.55,h0:30,h1:80,w0:22,w1:46,col:'#121220',hazeCol:'#3e2a30',hazeH:60,hazeA:.5,dens:.8});
  glow(c,712,base-60,260,'#ff9a5a',.1,.45);
  // the row across the street
  const B=[
    {x0:-160,x1:-10,top:116,roof:'mansard',rh:28,floors:2,seed:3,brick:true,wall:'#130f12',litP:.25,bc:'#2e2224',bc2:'#22181a',bc3:'#3a2822'},
    {x0:-10,x1:88,top:146,roof:'gable',rh:32,floors:2,seed:5,wall:'#121016',litP:.3,boxes:true,stucco:'#3e3a36'},
    {x0:110,x1:392,top:96,roof:'mansard',rh:30,floors:1,seed:8,brick:true,wall:'#1a1013',litP:.5,boxes:true,balcony:0,shopH:130,dorm:40,gild:true,bc:'#4a2620',bc2:'#341a16',bc3:'#5a3020'},
    {x0:392,x1:520,top:150,roof:'flat',balus:true,urns:true,floors:2,seed:13,wall:'#121017',litP:.25,arch:true,stucco:'#363440'},
    {x0:520,x1:664,top:122,roof:'flat',balus:true,floors:2,seed:17,wall:'#131119',litP:.35,arch:true,shopH:64,gild:true,stucco:'#3c3632'},
    {x0:664,x1:766,top:206,roof:'flat',floors:0,seed:19,wall:'#100e13',shopH:62},
    {x0:766,x1:866,top:132,roof:'mansard',rh:24,floors:2,seed:21,brick:true,wall:'#130e10',litP:.3,boxes:true,bc:'#33242a',bc2:'#261a20',bc3:'#3e2a26'},
    {x0:884,x1:1004,top:112,roof:'gable',rh:40,floors:2,seed:29,wall:'#121016',litP:.3,stucco:'#3a3036'},
    {x0:1004,x1:1160,top:128,roof:'mansard',rh:26,floors:2,seed:31,brick:true,wall:'#130f12',litP:.25}];
  // the alleys: dark slots with a warm glow from a back door deep inside, a fire escape
  for(const [a0,a1] of [[88,110],[866,884]]){c.fillStyle=lin(c,0,90,0,base,[[0,'#07060b'],[1,'#140c0e']]);c.fillRect(a0,90,a1-a0,base-90);
    glow(c,(a0+a1)/2,base-18,36,'#ff9a5a',.3,1.3);c.strokeStyle='#040306';c.lineWidth=.8;for(let y=base-120;y<base-30;y+=24){c.beginPath();c.moveTo(a0,y);c.lineTo(a1,y-8);c.stroke();}}
  // the gap at 664..766: a little square behind iron railings, two trees, and down the far street the tower
  {const x0=664,x1=766;c.fillStyle=lin(c,0,base-60,0,base,[[0,'#120e14'],[1,'#1c1418']]);c.fillRect(x0,base-30,x1-x0,30);
    for(const [tx,tr] of [[684,30],[748,26]]){c.fillStyle='#09080c';c.fillRect(tx-1.5,base-60,3,60);c.fillStyle=lin(c,0,base-60-tr*2,0,base-40,[[0,'#0c0b10'],[1,'#151018']]);
      c.beginPath();for(let k=0;k<9;k++){const a=k/9*TAU;c.arc(tx+Math.cos(a)*tr*.6,base-70-tr*.5+Math.sin(a)*tr*.45,tr*.5,0,TAU);}c.fill();
      c.save();c.globalCompositeOperation='lighter';c.fillStyle=rad(c,tx,base-48,0,tr*1.2,[[0,rgba('#ffb866',.25)],[1,rgba('#ffb866',0)]]);c.beginPath();c.arc(tx,base-70,tr*1.2,0,TAU);c.fill();c.restore();}
    c.strokeStyle='#08070b';c.lineWidth=1;c.beginPath();c.moveTo(x0,base-14);c.lineTo(x1,base-14);c.moveTo(x0,base-3);c.lineTo(x1,base-3);for(let x=x0;x<=x1;x+=3.5){c.moveTo(x,base);c.lineTo(x,base-17);}c.stroke();
    c.fillStyle=C.gold;for(let x=x0;x<=x1;x+=7){c.beginPath();c.moveTo(x-1,base-17);c.lineTo(x,base-20);c.lineTo(x+1,base-17);c.fill();}}
  const F=B.map((b,i)=>i===5?{gTop:base-62,base}:facade(c,b));
  // shopfronts along the ground floor
  shopfront(c,-150,-20,F[0].gTop,base,{name:'APOTHECARY',paint:'#0c1a14',size:7.5,lit:.45,door:[-50,14],inside:GOODS.apothecary});
  shopfront(c,0,80,F[1].gTop,base,{name:'TAILOR',paint:'#16121c',size:7,lit:.5,lights:2,door:[58,13],inside:(c,x,y,w,h)=>{c.fillStyle=rgba(C.ink,.9);const mx=x+w*.5,my=y+h*.25;c.beginPath();c.arc(mx,my,2.2,0,TAU);c.fill();c.beginPath();c.moveTo(mx-5,my+3);c.lineTo(mx+5,my+3);c.lineTo(mx+3.5,my+h*.6);c.lineTo(mx-3.5,my+h*.6);c.fill();c.fillRect(mx-.5,my+h*.6,1,h*.3);}});
  bistroFront(c,B[2].x0+6,B[2].x1-6,F[2].gTop,base);
  // the club: stone columns, a door under a gilt fanlight, steps
  {const b=B[4],gTop=F[4].gTop,cx=(b.x0+b.x1)/2;c.fillStyle='#09080d';c.fillRect(b.x0+4,gTop,b.x1-b.x0-8,base-gTop);
    for(const k of [-38,-20,20,38]){const px=cx+k;stone(c,px-3,gTop+4,6,base-gTop-8,{dark:.45,lit:false});c.fillStyle=lin(c,px-3,0,px+3,0,[[0,rgba('#000000',.6)],[.55,rgba('#000000',0)],[1,rgba('#000000',.55)]]);c.fillRect(px-3,gTop+4,6,base-gTop-8);
      c.fillStyle=rgba('#000000',.35);for(const f of [-1.6,0,1.6])c.fillRect(px+f-.2,gTop+7,.4,base-gTop-14);stone(c,px-4.5,gTop+2,9,3,{lit:.3});stone(c,px-4.5,base-6,9,3,{lit:.25});}
    c.fillStyle='#060508';c.fillRect(cx-11,gTop+16,22,base-gTop-18);windowPane(c,cx-11,gTop+4,22,13,.8,{arch:true,mull:0,fw:1,spill:false});
    vine(c,[{x:cx-11,y:gTop+16},{x:cx+11,y:gTop+16}],{w:.6,amp:1,wave:6,leaf:1.4,every:2,seed:4});
    timber(c,{paint:'#160c10'},cx-10,gTop+17,9.6,base-gTop-23,true);timber(c,{paint:'#160c10'},cx+.4,gTop+17,9.6,base-gTop-23,true);panel(c,{paint:'#160c10'},cx-8.6,gTop+20,6.8,12);panel(c,{paint:'#160c10'},cx+1.8,gTop+20,6.8,12);
    panel(c,{paint:'#160c10'},cx-8.6,gTop+35,6.8,base-gTop-44);panel(c,{paint:'#160c10'},cx+1.8,gTop+35,6.8,base-gTop-44);
    c.fillStyle=rgba(C.gold,.7);c.fillRect(cx-.4,gTop+18,.8,base-gTop-22);c.fillStyle=C.goldL;c.beginPath();c.arc(cx-2,gTop+33,.8,0,TAU);c.arc(cx+2,gTop+33,.8,0,TAU);c.fill();
    for(const k of [-58,58])windowPane(c,cx+k-9,gTop+10,18,base-gTop-24,.6,{arch:true,mull:2,rows:[.3],fw:1});
    for(let i=0;i<3;i++)stone(c,cx-24-i*4,base-7+i*2.3,48+i*8,2.4,{lit:.3+i*.04,dark:.5});
    glow(c,cx,gTop+10,36,'#ffc27a',.3);}
  // the tram shelter in front of the tower: a low iron roof on slender posts, a timetable lit from inside
  {const b=B[5],gTop=F[5].gTop,x0=b.x0+14,x1=b.x1-14;
    c.fillStyle='#08070b';c.fillRect(x0,gTop+12,x1-x0,3);c.beginPath();c.moveTo(x0-6,gTop+12);c.lineTo((x0+x1)/2,gTop);c.lineTo(x1+6,gTop+12);c.closePath();c.fill();
    line(c,[{x:x0-6,y:gTop+12},{x:(x0+x1)/2,y:gTop},{x:x1+6,y:gTop+12}],rgba(C.rim,.35),.7);
    for(const px of [x0+4,x1-4,(x0+x1)/2]){c.fillStyle='#08070b';c.fillRect(px-1.2,gTop+14,2.4,base-gTop-14);}
    vine(c,[{x:x0+2,y:gTop+16},{x:x1-2,y:gTop+16}],{w:.5,amp:1.2,wave:8,leaf:1.4,every:2,seed:6});
    windowPane(c,x0+12,gTop+24,16,22,.85,{mull:0,fw:.8,cool:true,spill:false});c.fillStyle=rgba('#202838',.8);for(let k=0;k<5;k++)c.fillRect(x0+14,gTop+27+k*4,12,1);
    c.fillStyle='#0c0b10';c.fillRect(x0+34,base-12,40,3);c.fillRect(x0+36,base-10,2,10);c.fillRect(x0+70,base-10,2,10);}
  // the house with the pawnbroker's three gilt balls
  {const b=B[6],gTop=F[6].gTop;shopfront(c,b.x0+6,b.x1-6,gTop,base,{name:'PAWN',paint:'#1a1410',size:7,lit:.5,door:[b.x1-28,15],inside:GOODS.pawn});
    c.strokeStyle=C.gold;c.lineWidth=.8;c.beginPath();c.moveTo(b.x0+10,gTop-4);c.lineTo(b.x0+10,gTop-14);c.lineTo(b.x0+20,gTop-14);c.stroke();
    for(const [dx,dy] of [[-4,0],[4,0],[0,6]]){c.fillStyle=rad(c,b.x0+19+dx,gTop-9+dy,0,2.6,[[0,C.goldL],[.6,C.gold],[1,C.goldDD||C.goldD]]);c.beginPath();c.arc(b.x0+20+dx,gTop-8+dy,2.4,0,TAU);c.fill();}}
  shopfront(c,B[7].x0+6,B[7].x1-6,F[7].gTop,base,{name:'NIGHT POST',paint:'#10141c',size:7,lit:.45,door:[B[7].x0+12,14],inside:GOODS.post});
  shopfront(c,B[8].x0+6,B[8].x1-6,F[8].gTop,base,{name:'WINES',paint:'#1c0e10',size:7.5,lit:.5,door:[B[8].x0+14,15],inside:GOODS.wines});
  // the tram wire along the street
  {const y0=fy(DF)-176;c.strokeStyle=rgba('#000000',.85);c.lineWidth=.8;c.beginPath();c.moveTo(X0,y0+8);c.quadraticCurveTo((X0+X1)/2,y0+26,X1,y0+6);c.stroke();
    c.strokeStyle=rgba(C.rim,.22);c.lineWidth=.4;c.beginPath();c.moveTo(X0,y0+7);c.quadraticCurveTo((X0+X1)/2,y0+25,X1,y0+5);c.stroke();}
  // the far pavement: flagstones in the ground plane, wet, the night on them darker toward the kerb
  {const d0=126,d1=210,g=g0(),pv=[pp(X0,g,d1),pp(X1,g,d1),pp(X1,g,d0),pp(X0,g,d0)];
    c.save();poly(c,pv);c.clip();c.transform(1,0,PSX,-PSY,0,g);const pf=c.createPattern(TX().flagstones(41,{c0:'#3a3236',c1:'#544a4c'}),'repeat');if(pf.setTransform)pf.setTransform(new DOMMatrix().translate(0,d0).scale(.2));
    c.fillStyle=pf;c.fillRect(X0,d0,X1-X0,d1-d0);c.restore();
    c.fillStyle=lin(c,0,fy(d1),0,fy(d0),[[0,rgba('#06040a',.6)],[1,rgba('#06040a',.5)]]);poly(c,pv);c.fill();
    // the windows' light lying out across the flags
    c.save();c.transform(1,0,PSX,-PSY,0,g);c.globalCompositeOperation='lighter';for(const s of SPILL){const sc=s.col||'#ffb060';c.fillStyle=lin(c,0,d1,0,d1-40,[[0,rgba(sc,.2*s.a)],[1,rgba(sc,0)]]);c.beginPath();c.moveTo(s.x0,d1);c.lineTo(s.x1,d1);c.lineTo(s.x1+10,d1-40);c.lineTo(s.x0-10,d1-40);c.closePath();c.fill();}c.restore();
    const y1=fy(126);for(const lx of LAMPX){const q=lampAt(lx);wetStreak(c,q.x,base+2,y1,16,'#ffc477',.35,lx);}
    for(const [sx,a] of [[169,.3],[333,.3],[251,.2],[600,.18],[40,.16],[790,.15],[1060,.16],[-80,.12]])wetStreak(c,sx,base+2,y1,30,'#ffb866',a,sx+3);
    for(const lx of LAMPX){const q=pp(lx+16,g,LAMPD-20);glow(c,q.x,q.y,70,'#ffb866',.16,.3);}
    coalHole(c,236,186);coalHole(c,604,192);
    if(blown())pavementBlown(c,g);}
  // the kerb: granite blocks of uneven length, a chipped arris lit along the top
  {const g=g0(),a=pp(X0,g,126),b=pp(X1,g,126),e=pp(X1,GB,120),f=pp(X0,GB,120);
    c.save();poly(c,[a,b,e,f]);c.clip();c.fillStyle=patAt(c,TX().granite(77,128,64,{base:'#5e5860'}),0,a.y,.25);c.fillRect(X0-40,a.y,X1-X0+80,f.y-a.y+2);
    c.fillStyle=lin(c,0,a.y,0,f.y,[[0,rgba('#05040a',.2)],[.12,rgba('#05040a',.45)],[1,rgba('#05040a',.82)]]);c.fillRect(X0-40,a.y,X1-X0+80,f.y-a.y+2);
    const r=rng(81);c.strokeStyle=rgba('#000000',.6);c.lineWidth=.6;for(let x=X0+r()*20;x<X1;x+=30+r()*26){const q=pp(x,g,126),q2=pp(x,GB,120);c.beginPath();c.moveTo(q.x,q.y);c.lineTo(q2.x,q2.y);c.stroke();
      if(r()<.4){const t=r(),cq=pp(x+4+t*20,g,126);c.fillStyle=rgba('#000000',.55);c.beginPath();c.moveTo(cq.x,cq.y);c.lineTo(cq.x+3,cq.y);c.lineTo(cq.x+1.4,cq.y+1.6);c.fill();}}
    c.restore();
    line(c,[a,b],rgba(C.rim,.55),1.1);
    for(const lx of LAMPX){const q=pp(lx+16,g,126);c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,q.x-60,0,q.x+60,0,[[0,rgba('#ffb866',0)],[.5,rgba('#ffb866',.18)],[1,rgba('#ffb866',0)]]);c.fillRect(q.x-60,a.y,120,f.y-a.y);c.restore();}}
  // the road: granite setts wet from the rain, two pairs of grooved tram rails, a gutter by the kerb
  {const rv=[pp(X0,GB,120),pp(X1,GB,120),pp(X1,GB,-100),pp(X0,GB,-100)];
    c.save();poly(c,rv);c.clip();c.transform(1,0,PSX,-PSY,0,GB);const ps=c.createPattern(TX().setts(7,{c0:'#28222a',c1:'#423a40',farX:true}),'repeat');if(ps.setTransform)ps.setTransform(new DOMMatrix().rotate(90).scale(1/6));
    c.fillStyle=ps;c.fillRect(X0,-100,X1-X0,220);c.restore();
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
  for(const lx of LAMPX)lampPost(c,lx);
  if(blown()){bayTreeDown(c,216-207*PSX,207);bayTreeScorched(c,286-207*PSX,207);chalkMenuDown(c,168-205*PSX,205);}
  else{bayTree(c,216-207*PSX,207);bayTree(c,286-207*PSX,207);chalkMenu(c,168-205*PSX,205);}
  // a low mist along the kerb, and the dark falling off toward us
  haze(c,X0,X1,fy(126)-26,fy(126)+24,'#5a3a40',.16);
  c.fillStyle=lin(c,0,GB-20,0,GB+110,[[0,rgba('#000000',0)],[1,rgba('#000000',.6)]]);c.fillRect(X0,GB-20,X1-X0,130);}
// the lamps burn and their light spills: drawn every frame over the layer
function live(){const t=S.t;ctx.save();
  for(const lx of LAMPX){const q=lampAt(lx),x=q.x,y=fy(LAMPD)-140,f=.93+.07*Math.sin(t*7+lx)*Math.sin(t*3.1+lx*.3);
    glow(ctx,x,y,22,'#fff0cc',.9*f);glow(ctx,x,y,70,'#ffb866',.3*f);beam(ctx,x,y+8,10,110,140,'#ffcf86',.06*f);}
  if(blown())liveBlown(t);
  if(typeof S.bistroBlast==='number')liveBlast(t);
  ctx.restore();}
// after the grenade: the fire inside breathing in the hole and the smashed windows and out across the flags, smoke rolling out of the
// arch and up the front, embers, one lantern still sputtering on its pier
const smokeCol=u=>u<.3?mix('#b8683a','#7a6a68',u/.3):mix('#7a6a68','#3e3842',clamp((u-.3)/.7,0,1));
function liveBlown(t){const D=doorG(),{x0,x1,base,cx,yc,ar}=D,f=.78+.12*Math.sin(t*11.3)*Math.sin(t*4.7+1)+.1*Math.sin(t*23.1+2),g=g0();
  glow(ctx,cx,base-12,34,'#ff6a26',.42*f,.9);glow(ctx,cx+6,base-5,16,'#ffc070',.38*f);
  for(const wx of [169,333])glow(ctx,wx,base-26,30,'#ff5a20',.16*f,.9);
  {const a=pp(x0-DF*PSX-6,g,DF),b=pp(x1-DF*PSX+6,g,DF),e=pp(x1-DF*PSX+40,g,DF-60),h=pp(x0-DF*PSX-40,g,DF-60);ctx.save();ctx.globalCompositeOperation='lighter';
    ctx.fillStyle=lin(ctx,0,a.y,0,e.y,[[0,rgba('#ff6a26',.22*f)],[1,rgba('#ff6a26',0)]]);poly(ctx,[a,b,e,h]);ctx.fill();ctx.restore();}
  const r=rng(707);
  for(let i=0;i<22;i++){const win=i>=16,P=4.6+r()*1.6,u=((t/P)+i/16)%1,ox=win?(i%2?169:333):cx,sx=ox+(r()-.5)*ar*1.2,sy=(win?yc+10:yc-ar*.4)+r()*10,wob=Math.sin(u*2.6+i)*9,
      x=sx+wob+u*(22+r()*16),y=sy-u*(win?90:150+r()*70),R=(win?4:7)+u*(win?22:38+r()*16),a=(u<.12?u/.12:1)*Math.pow(1-u,1.2)*(win?.34:.5);
    ctx.fillStyle=rad(ctx,x,y,0,R,[[0,rgba(smokeCol(u),a)],[1,rgba(smokeCol(u),0)]]);ctx.beginPath();ctx.arc(x,y,R,0,TAU);ctx.fill();}
  for(let i=0;i<22;i++){const P=2.2+r()*1.6,u=((t/P)+r())%1,x=cx+(r()-.5)*ar*1.6+Math.sin(u*5+i)*6+u*14,y=base-8-r()*30-u*(70+r()*80),fl=.5+.5*Math.sin(t*19+i*3);
    ctx.fillStyle=rgba(r()<.6?'#ffb050':'#ff7a2a',(1-u)*.85*fl);ctx.fillRect(x,y,.9,.9);}
  {const lx=288.5,ly=fy(DF)-130+15+44-3,on=Math.max(0,Math.sin(t*9.1)*Math.sin(t*3.7+.6)*Math.sin(t*17.3+1.1));if(on>.05){glow(ctx,lx,ly,9,'#ffd28a',.75*on);glow(ctx,lx,ly,26,'#ffb060',.3*on);}}}
// the instant of the blast (S.bistroBlast is when, in S.t): a white flash in the doorway, a shock ring running out over the flags,
// dust kicked up off them and splinters thrown out of the arch. The fireball itself is the game's.
function liveBlast(t){const dt=t-S.bistroBlast;if(!(dt>=0&&dt<1.6))return;const D=doorG(),{cx,yc,base}=D,g=g0(),dcx=cx-DF*PSX;
  if(dt<.3){const k=1-dt/.3;glow(ctx,cx,yc+24,70+dt*260,'#fff2d0',.95*k);glow(ctx,cx,yc+24,30+dt*120,'#ffffff',.9*k);}
  {ctx.save();ctx.transform(1,0,PSX,-PSY,0,g);const R=14+dt*300,k=Math.max(0,1-dt/1.1);ctx.strokeStyle=rgba('#ffe2c0',.5*k);ctx.lineWidth=2.4*k+.4;ctx.beginPath();ctx.ellipse(dcx,DF,R,R*.72,0,Math.PI,TAU);ctx.stroke();ctx.restore();}
  const r=rng(909);
  for(let i=0;i<12;i++){const a=Math.PI*(1.05+r()*.9),d0=r(),R2=(18+dt*220*(.5+d0))*(1-.25*d0),q=pp(dcx+Math.cos(a)*R2,g,DF+Math.sin(a)*R2*.7),rr=8+dt*40,al=.42*Math.max(0,1-dt/1.5);
    ctx.fillStyle=rad(ctx,q.x,q.y-rr*.4,0,rr,[[0,rgba('#6a5a50',al)],[1,rgba('#6a5a50',0)]]);ctx.beginPath();ctx.arc(q.x,q.y-rr*.4,rr,0,TAU);ctx.fill();}
  for(let i=0;i<28;i++){const a=-Math.PI*(.12+r()*.76),v=200+r()*360,vx=Math.cos(a)*v*(r()<.5?-1:1)*.8,vy=Math.sin(a)*v,x=cx+vx*dt,y=yc+20+vy*dt+420*dt*dt;if(y>base+70)continue;
    const L=3+r()*5,an=Math.atan2(vy+840*dt,vx);ctx.strokeStyle=rgba(r()<.5?'#2e140b':'#8a5a34',Math.max(0,1-dt/1.4));ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-Math.cos(an)*L,y-Math.sin(an)*L);ctx.stroke();}}
// the light that falls on a fighter: the nearest lamp
function light(f){const px=f.p[PEL].x+f.dep*PSX;let best=null,bd=1e9;for(const lx of LAMPX){const x=lampAt(lx).x,dd=Math.abs(x-px);if(dd<bd){bd=dd;best=x;}}
  return{light:{x:best-f.dep*PSX,y:fy(LAMPD)-140+f.dep*PSY}};}
// the layer depends on the bistro's state: the glue paints it again when this changes
E.S.street={paint,live,light,key:()=>'street:'+(blown()?'blown':'intact'),lamps:LAMPX,div:it=>it.dv.mat==='plank'&&typeof EnvProps!=='undefined'?EnvProps.plankFence(it,'town'):false,table:()=>typeof EnvProps!=='undefined'?EnvProps.fieldTable('town'):false};
})();
// ===== ENV STREET END =====
