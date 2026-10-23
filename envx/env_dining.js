// ===== ENV DINING =====
// The Lantern Bistro's dining room: Qadir's floor. Oxblood damask over dark panelling inlaid with the gold vine; tall arched
// windows onto Lamplight Street at night, half-curtained in red velvet; the bistro's name in gilt on black glass over the kitchen
// door; a long bar of dark wood and brass with its bottles lit from below and a gilt mirror; herringbone parquet and a red rug;
// brass lanterns hung low over marble tables.
(()=>{const E=EnvLook,{C,pp,poly,line,rect,lin,rad,rgba,mix,glow,beam,haze,vine,scroll,gilt,windowPane,bricks,stars,rng,lerp,clamp,TAU}=E;
const FAR=236,yB=()=>GB-FAR*PSY,OX=()=>FAR*PSX;
const WIN=[[150,300]],DOORX=()=>DINING_DOOR.x+OX();
function floorT(c){c.transform(1,0,PSX,-PSY,0,GB);}
function tile(w,h,sc,fn){const cv=document.createElement('canvas');cv.width=w*sc;cv.height=h*sc;const c=cv.getContext('2d');c.scale(sc,sc);fn(c,w,h);return cv;}
function pattern(c,cv,sc){const p=c.createPattern(cv,'repeat');if(p.setTransform)p.setTransform(new DOMMatrix().scale(1/sc));return p;}
// ---------- patterns ----------
// ---------- surfaces (EnvTex makes them pixel by pixel, once) ----------
const TX=()=>EnvTex;
function pat(c,cv,unitsPerPx,rot){const p=c.createPattern(cv,'repeat');if(p.setTransform){let m=new DOMMatrix();if(rot)m=m.rotate(rot);p.setTransform(m.scale(unitsPerPx));}return p;}
const MAHOG={dark:'#120705',mid:'#2e140b',light:'#55271a',rings:7,sharp:3},WALNUT={dark:'#140b06',mid:'#30190d',light:'#583118',rings:9,sharp:4};
// a raised panel of dark wood: frame with the grain across, field with the grain up, bevels lit from above, a varnish sheen
function woodPanel(c,x,y,w,h,o){o=o||{};const wd=TX().wood(o.seed||21,512,128,o.wood||MAHOG),wv=TX().wood((o.seed||21)+1,512,128,o.wood||MAHOG);
  c.save();c.fillStyle=pat(c,wd,.16);c.fillRect(x,y,w,h);
  const b=o.bevel||4,fx=x+b,fy=y+b,fw=w-2*b,fh=h-2*b;
  // the bevels: top and left catch the light, bottom and right fall away
  c.fillStyle=rgba('#ffcf9a',.14);c.beginPath();c.moveTo(x,y);c.lineTo(x+w,y);c.lineTo(fx+fw,fy);c.lineTo(fx,fy);c.closePath();c.fill();
  c.fillStyle=rgba('#ffcf9a',.07);c.beginPath();c.moveTo(x,y);c.lineTo(fx,fy);c.lineTo(fx,fy+fh);c.lineTo(x,y+h);c.closePath();c.fill();
  c.fillStyle=rgba('#000000',.5);c.beginPath();c.moveTo(x,y+h);c.lineTo(x+w,y+h);c.lineTo(fx+fw,fy+fh);c.lineTo(fx,fy+fh);c.closePath();c.fill();
  c.fillStyle=rgba('#000000',.35);c.beginPath();c.moveTo(x+w,y);c.lineTo(x+w,y+h);c.lineTo(fx+fw,fy+fh);c.lineTo(fx+fw,fy);c.closePath();c.fill();
  // the field, the grain running up it
  c.fillStyle=pat(c,wv,.16,90);c.fillRect(fx,fy,fw,fh);
  c.fillStyle=lin(c,0,fy,0,fy+fh,[[0,rgba('#000000',.05)],[1,rgba('#000000',.3)]]);c.fillRect(fx,fy,fw,fh);
  // varnish: a soft band of reflected light across the upper part of the field
  c.fillStyle=lin(c,fx,0,fx+fw,0,[[0,rgba('#ffd8b0',0)],[.35,rgba('#ffd8b0',.07)],[.5,rgba('#ffd8b0',.12)],[.65,rgba('#ffd8b0',.05)],[1,rgba('#ffd8b0',0)]]);c.fillRect(fx,fy,fw,fh*.6);
  if(o.inlay){c.strokeStyle=rgba(C.gold,.55);c.lineWidth=.6;c.strokeRect(fx+3,fy+3,fw-6,fh-6);c.fillStyle=C.gold;for(const [qx,qy] of [[fx+3,fy+3],[fx+fw-3,fy+3],[fx+3,fy+fh-3],[fx+fw-3,fy+fh-3]]){c.beginPath();c.arc(qx,qy,.9,0,TAU);c.fill();}}
  c.strokeStyle=rgba('#000000',.6);c.lineWidth=.6;c.strokeRect(x+.3,y+.3,w-.6,h-.6);c.restore();}
// a moulding run along the wall: a profile of light and dark bands top to bottom
function moulding(c,x0,x1,y,bands){let yy=y;for(const [h,col] of bands){c.fillStyle=col;c.fillRect(x0,yy,x1-x0,h);yy+=h;}return yy;}
// ---------- the view out of a window: Lamplight Street at night, wet ----------
function streetView(c,x,y,w,h,seed){const r=rng(seed);c.fillStyle=lin(c,0,y,0,y+h,[[0,'#06080f'],[.45,'#0e1226'],[.72,'#261a28'],[1,'#3a2422']]);c.fillRect(x,y,w,h);
  E.stars(c,x,x+w,y,y+h*.3,10,seed,.6);
  const fb=y+h*.78;let bx=x-6;while(bx<x+w){const bw=22+r()*26,bt=y+h*(.22+r()*.2);c.fillStyle=mix('#0e0c13','#18131b',r());c.fillRect(bx,bt,bw,fb-bt);
    c.fillStyle=rgba('#ffcf86',.08);c.fillRect(bx+bw-1,bt,1,fb-bt);
    for(let wy=bt+6;wy<fb-12;wy+=12)for(let wx=bx+4;wx<bx+bw-5;wx+=9){if(r()<.3){c.fillStyle=rgba('#ffc477',.55+r()*.35);c.fillRect(wx,wy,3.4,5);c.fillStyle=rgba('#3a1010',.6);c.fillRect(wx,wy,1.2,5);}else{c.fillStyle=rgba('#22243a',.7);c.fillRect(wx,wy,3.4,5);}}
    c.fillStyle=rgba('#ffb866',.35);c.fillRect(bx+2,fb-9,bw-4,6);bx+=bw+1;}
  const lx=x+w*(.25+r()*.5);c.fillStyle='#08070b';c.fillRect(lx-.8,y+h*.38,1.6,h*.45);glow(c,lx+3,y+h*.38,14,'#ffd9a0',.8);glow(c,lx+3,y+h*.38,40,'#ffb866',.25);
  c.fillStyle=lin(c,0,fb,0,y+h,[[0,'#2a1e22'],[1,'#120c10']]);c.fillRect(x,fb,w,y+h-fb);
  c.save();c.globalCompositeOperation='lighter';for(let i=0;i<34;i++){const yy=fb+2+r()*(y+h-fb-2),k=1-(yy-fb)/(y+h-fb);c.fillStyle=rgba('#ffc477',.25*k);c.fillRect(lx+(r()-.5)*8,yy,2+r()*5,.8);}c.restore();
  // rain running down the glass, and beads of it catching the room's light
  c.strokeStyle=rgba('#c8d8f0',.14);c.lineWidth=.45;for(let i=0;i<20;i++){const rx=x+r()*w,ry=y+r()*h,len=4+r()*10;c.beginPath();c.moveTo(rx,ry);c.quadraticCurveTo(rx-.6,ry+len*.5,rx-.3,ry+len);c.stroke();}
  for(let i=0;i<40;i++){c.fillStyle=rgba('#ffe6c0',.18+r()*.2);c.beginPath();c.arc(x+r()*w,y+r()*h,.35+r()*.45,0,TAU);c.fill();}}
// velvet hanging in folds: each fold lit on its crest, dark in its trough, the nap catching the light low down
function velvet(c,x0,y0,x1,y1,o){o=o||{};const n=o.folds||Math.max(3,Math.round((x1-x0)/7)),fw=(x1-x0)/n,base=o.col||'#5a0c16',r=rng(o.seed||3);
  for(let i=0;i<n;i++){const fx=x0+i*fw,sw=fw*(.9+r()*.25);c.fillStyle=lin(c,fx,0,fx+sw,0,[[0,mix(base,'#000000',.7)],[.35,mix(base,'#ff9a8a',.18)],[.5,mix(base,'#ffb0a0',.28)],[.7,mix(base,'#000000',.25)],[1,mix(base,'#000000',.75)]]);
    c.beginPath();c.moveTo(fx,y0);c.lineTo(fx+sw,y0);c.lineTo(fx+sw+(r()-.5)*1.5,y1);c.lineTo(fx+(r()-.5)*1.5,y1);c.closePath();c.fill();}
  c.fillStyle=lin(c,0,y0,0,y1,[[0,rgba('#000000',.35)],[.3,rgba('#000000',0)],[1,rgba('#000000',.25)]]);c.fillRect(x0,y0,x1-x0,y1-y0);}
// a tall arched window: a deep moulded reveal, a sunburst fanlight, the street through the glass, a velvet café curtain on a brass rod
function archWindow(c,x0,y0,x1,y1,seed){const w=x1-x0,ar=w/2,yc=y0+ar,cx=(x0+x1)/2,wd=TX().wood(seed,512,128,WALNUT);
  const archPath=(m)=>{c.beginPath();c.moveTo(x0-m,y1+(m>0?6:0));c.lineTo(x0-m,yc);c.arc(cx,yc,ar+m,Math.PI,0);c.lineTo(x1+m,y1+(m>0?6:0));c.closePath();};
  // the architrave: moulded wood, lit along its upper curve
  archPath(12);c.fillStyle=pat(c,wd,.14);c.fill();archPath(12);c.fillStyle=rgba('#000000',.35);c.fill();
  c.strokeStyle=rgba('#ffcf9a',.22);c.lineWidth=1;c.beginPath();c.arc(cx,yc,ar+11,Math.PI*1.05,Math.PI*1.95);c.stroke();
  c.strokeStyle=rgba(C.gold,.75);c.lineWidth=.9;c.beginPath();c.arc(cx,yc,ar+6,Math.PI,0);c.stroke();c.beginPath();c.moveTo(x0-6,yc);c.lineTo(x0-6,y1);c.moveTo(x1+6,yc);c.lineTo(x1+6,y1);c.stroke();
  archPath(4);c.fillStyle='#0a0505';c.fill();
  c.save();archPath(0);c.clip();streetView(c,x0,y0,w,y1-y0,seed);
  // the glass: the room's warm light reflected faintly, a sheen across it
  c.fillStyle=rgba('#ffcf86',.05);c.fillRect(x0,y0,w,y1-y0);c.fillStyle=lin(c,x0,y0,x1,y1,[[0,rgba('#ffffff',0)],[.45,rgba('#ffffff',.05)],[.5,rgba('#ffffff',.09)],[.56,rgba('#ffffff',.04)],[1,rgba('#ffffff',0)]]);c.fillRect(x0,y0,w,y1-y0);c.restore();
  // the sash: wood bars, the sunburst
  c.strokeStyle='#170b08';c.lineWidth=4;archPath(0);c.stroke();
  c.strokeStyle='#1e0f0a';c.lineWidth=2;c.beginPath();c.moveTo(x0,yc);c.lineTo(x1,yc);c.moveTo(cx,yc);c.lineTo(cx,y1);for(let k=1;k<6;k++){const a=Math.PI+k*Math.PI/6;c.moveTo(cx,yc);c.lineTo(cx+Math.cos(a)*ar,yc+Math.sin(a)*ar);}
  for(const f of [.45,.72]){c.moveTo(x0,lerp(yc,y1,f));c.lineTo(x1,lerp(yc,y1,f));}c.stroke();
  c.strokeStyle=rgba('#ffcf9a',.18);c.lineWidth=.5;c.beginPath();c.moveTo(x0+1,yc-1);c.lineTo(x1-1,yc-1);c.stroke();
  c.fillStyle='#170b08';c.beginPath();c.arc(cx,yc,ar*.22,Math.PI,0);c.fill();c.fillStyle=lin(c,cx-ar*.12,0,cx+ar*.12,0,[[0,C.goldD],[.5,C.goldL],[1,C.goldD]]);c.beginPath();c.arc(cx,yc-.5,ar*.12,Math.PI,0);c.fill();
  // the keystone, carved
  c.fillStyle=pat(c,wd,.14);c.beginPath();c.moveTo(cx-7,y0-16);c.lineTo(cx+7,y0-16);c.lineTo(cx+5,y0+2);c.lineTo(cx-5,y0+2);c.closePath();c.fill();
  c.fillStyle=rgba('#ffcf9a',.2);c.fillRect(cx-7,y0-16,14,1);vine(c,[{x:cx,y:y0-13},{x:cx,y:y0-1}],{w:.5,amp:1.2,wave:5,leaf:1.4,every:2,seed,shadow:false});
  // the café curtain: brass rod with finials, velvet in folds, a gold bullion fringe
  const ry=lerp(yc,y1,.5);velvet(c,x0-2,ry+1,x1+2,y1,{seed,col:'#560b14',folds:9});
  c.fillStyle='#160806';for(let x=x0-2;x<=x1+2;x+=(w+4)/9){c.beginPath();c.arc(x,ry+1.5,1.4,0,TAU);c.fill();}
  c.fillStyle=lin(c,0,ry-2.4,0,ry+.6,[[0,C.goldL],[.5,C.gold],[1,C.goldDD]]);c.fillRect(x0-8,ry-2.2,w+16,2.6);
  for(const ex of [x0-8,x1+8]){c.fillStyle=rad(c,ex-.6,ry-1.6,.2,2.6,[[0,C.goldL],[1,C.goldD]]);c.beginPath();c.arc(ex,ry-.9,2.4,0,TAU);c.fill();}
  c.fillStyle=lin(c,0,y1-4,0,y1,[[0,C.gold],[1,C.goldD]]);for(let x=x0-2;x<=x1+2;x+=1.6)c.fillRect(x,y1-3.6,.9,3.6);c.fillStyle=rgba('#000000',.4);c.fillRect(x0-2,y1-4.2,w+4,.7);
  // the sill: polished wood, a bright nosing, a shadow under it
  c.fillStyle=pat(c,wd,.14);c.fillRect(x0-14,y1,w+28,7);c.fillStyle=rgba('#ffcf9a',.35);c.fillRect(x0-14,y1,w+28,.9);c.fillStyle=rgba('#000000',.5);c.fillRect(x0-14,y1+6,w+28,1);
  c.fillStyle=lin(c,0,y1+7,0,y1+18,[[0,rgba('#000000',.4)],[1,rgba('#000000',0)]]);c.fillRect(x0-12,y1+7,w+24,11);}
// a wall sconce: a gilt backplate and arm, a tulip of frosted glass; its light fans up and down the wallpaper
function sconce(c,x,y){c.save();c.globalCompositeOperation='lighter';
  for(const [dir,len,a] of [[-1,90,.13],[1,60,.09]]){c.fillStyle=lin(c,0,y,0,y+dir*len,[[0,rgba('#ffc27a',a)],[1,rgba('#ffc27a',0)]]);c.beginPath();c.moveTo(x-4,y);c.quadraticCurveTo(x-34,y+dir*len*.5,x-46,y+dir*len);c.lineTo(x+46,y+dir*len);c.quadraticCurveTo(x+34,y+dir*len*.5,x+4,y);c.closePath();c.fill();}
  c.restore();glow(c,x,y-4,60,'#ffb060',.18);
  c.fillStyle=lin(c,x-3,0,x+3,0,[[0,C.goldDD],[.5,C.goldL],[1,C.goldD]]);c.beginPath();c.ellipse(x,y+14,3,5,0,0,TAU);c.fill();
  c.strokeStyle=C.goldD;c.lineWidth=1.6;c.beginPath();c.moveTo(x,y+12);c.quadraticCurveTo(x+1,y+4,x,y);c.stroke();scroll(c,x-2,y+10,3,-1,C.gold,.8,1.2);scroll(c,x+2,y+10,3,1,C.gold,.8,1.2);
  c.fillStyle=C.goldD;c.fillRect(x-4,y+11,8,3);c.fillStyle=lin(c,0,y-9,0,y+1,[[0,'#fff6e0'],[.6,'#ffd9a0'],[1,'#ffb866']]);c.beginPath();c.moveTo(x-5,y-9);c.quadraticCurveTo(x,y-11,x+5,y-9);c.lineTo(x+3,y+1);c.lineTo(x-3,y+1);c.closePath();c.fill();
  c.strokeStyle=rgba('#ffffff',.5);c.lineWidth=.4;c.beginPath();c.moveTo(x-3,y-8);c.lineTo(x-2,y);c.stroke();glow(c,x,y-4,22,'#ffd8a0',.6);}
// a framed picture: a carved gilt frame, a night river under the tower, varnish catching the light
function picture(c,x,y,w,h){const fr=7;c.fillStyle=rgba('#000000',.5);c.fillRect(x-fr+2,y-fr+3,w+2*fr,h+2*fr);
  c.fillStyle=lin(c,x-fr,y-fr,x+w+fr,y+h+fr,[[0,C.goldL],[.3,C.gold],[.6,C.goldD],[1,C.goldDD]]);c.fillRect(x-fr,y-fr,w+2*fr,h+2*fr);
  c.strokeStyle=rgba('#3a2a0a',.6);c.lineWidth=.6;c.strokeRect(x-fr+2,y-fr+2,w+2*fr-4,h+2*fr-4);
  c.fillStyle=rgba('#fff2c0',.6);for(let i=0;i<Math.floor((w+2*fr)/3);i++){c.beginPath();c.arc(x-fr+1.5+i*3,y-fr+1.4,.6,0,TAU);c.fill();}
  c.fillStyle='#0a0606';c.fillRect(x-1.5,y-1.5,w+3,h+3);
  c.fillStyle=lin(c,0,y,0,y+h,[[0,'#0a0e1e'],[.55,'#2a2234'],[1,'#120e18']]);c.fillRect(x,y,w,h);
  c.fillStyle='#07070c';c.fillRect(x+w*.55,y+h*.18,w*.12,h*.5);c.beginPath();c.moveTo(x+w*.55,y+h*.18);c.lineTo(x+w*.61,y+h*.06);c.lineTo(x+w*.67,y+h*.18);c.fill();
  glow(c,x+w*.61,y+h*.09,6,C.cyan,.6);c.fillStyle='#0a0a12';c.fillRect(x,y+h*.6,w,h*.08);c.fillStyle=rgba('#ffcf86',.35);for(let i=0;i<6;i++)c.fillRect(x+w*(.08+i*.15),y+h*.72+i%2*3,w*.06,1);
  c.fillStyle=rgba('#f0e6c8',.9);c.beginPath();c.arc(x+w*.22,y+h*.22,w*.06,0,TAU);c.fill();
  // brush texture and old varnish
  const r=rng(x|0);c.globalAlpha=.08;for(let i=0;i<60;i++){c.fillStyle=r()<.5?'#ffffff':'#000000';c.fillRect(x+r()*w,y+r()*h,1+r()*3,.5);}c.globalAlpha=1;
  c.fillStyle=lin(c,x,y,x+w,y+h,[[0,rgba('#ffd890',.12)],[.5,rgba('#ffd890',0)],[1,rgba('#000000',.2)]]);c.fillRect(x,y,w,h);
  // its own small brass picture light
  c.fillStyle=C.goldD;c.fillRect(x+w/2-10,y-fr-6,20,3);c.fillRect(x+w/2-1,y-fr-6,2,6);glow(c,x+w/2,y-fr-2,30,'#ffcf86',.35);}
// a bottle on a shelf: glass with depth, a label, a foil, the shelf's light coming up through it
function bottle(c,x,base,w,h,col,r){const neck=h*.32,sh=h*.12;c.fillStyle=lin(c,x,0,x+w,0,[[0,mix(col,'#000000',.7)],[.35,mix(col,'#000000',.15)],[.6,mix(col,'#000000',.35)],[1,mix(col,'#000000',.8)]]);
  c.beginPath();c.moveTo(x,base);c.lineTo(x,base-h+neck+sh);c.quadraticCurveTo(x,base-h+neck,x+w*.32,base-h+neck-sh*.2);c.lineTo(x+w*.32,base-h);c.lineTo(x+w*.68,base-h);c.lineTo(x+w*.68,base-h+neck-sh*.2);c.quadraticCurveTo(x+w,base-h+neck,x+w,base-h+neck+sh);c.lineTo(x+w,base);c.closePath();c.fill();
  c.fillStyle=lin(c,0,base-h*.5,0,base,[[0,rgba(mix(col,'#ffcf86',.5),0)],[1,rgba(mix(col,'#ffcf86',.6),.55)]]);c.fillRect(x+.6,base-h*.55,w-1.2,h*.55);
  c.fillStyle=rgba('#ffffff',.45);c.fillRect(x+w*.22,base-h+neck+sh,.7,h-neck-sh-2);
  if(r()<.7){const ly=base-h*.52,lh=h*.26;c.fillStyle=r()<.5?'#e8dcc0':'#d8c8a0';c.fillRect(x+.4,ly,w-.8,lh);c.fillStyle=rgba('#3a2a1a',.6);c.fillRect(x+1,ly+lh*.35,w-2,.6);c.fillRect(x+1.4,ly+lh*.6,w-2.8,.5);if(r()<.5){c.fillStyle=rgba(C.gold,.8);c.fillRect(x+.4,ly,w-.8,.6);}}
  c.fillStyle=r()<.5?lin(c,x+w*.3,0,x+w*.7,0,[[0,C.goldD],[.5,C.goldL],[1,C.goldD]]):'#4a0c12';c.fillRect(x+w*.3,base-h-.5,w*.4,neck*.45);}
// ---------- the room ----------
function paint(c){
  const X0=-160,X1=W+240,T0=-110,yb=yB(),dX=DOORX(),T=TX();
  // the wallpaper: flocked damask, hung in strips, the seams just showing
  c.fillStyle=pat(c,T.damask({}),30/144);c.fillRect(X0,T0,X1-X0,yb-T0);
  c.fillStyle=rgba('#000000',.18);for(let x=-150;x<X1;x+=60){c.fillRect(x,T0,.6,yb-T0);}c.fillStyle=rgba('#ff9a8a',.04);for(let x=-149.4;x<X1;x+=60)c.fillRect(x,T0,.5,yb-T0);
  // dark falling from the ceiling, a little brown where the smoke has gone into the paper, light low on the wall
  c.fillStyle=lin(c,0,T0,0,yb,[[0,rgba('#000000',.88)],[.25,rgba('#060200',.62)],[.55,rgba('#000000',.32)],[1,rgba('#000000',.18)]]);c.fillRect(X0,T0,X1-X0,yb-T0);
  {const pl=T.plaster(5,256,256,{base:'#1a0c06'});c.save();c.globalCompositeOperation='multiply';c.globalAlpha=.35;c.fillStyle=pat(c,pl,.5);c.fillRect(X0,T0,X1-X0,yb-T0);c.restore();}
  // the ceiling: coffers between beams of dark wood
  {const wd=T.wood(31,512,128,MAHOG);c.fillStyle=pat(c,wd,.18);c.fillRect(X0,T0,X1-X0,18-T0);c.fillStyle=rgba('#000000',.55);c.fillRect(X0,T0,X1-X0,18-T0);
    for(let x=-120;x<X1;x+=120){c.fillStyle=pat(c,wd,.18,90);c.fillRect(x,T0,22,64-T0);c.fillStyle=lin(c,x,0,x+22,0,[[0,rgba('#000000',.55)],[.6,rgba('#000000',.2)],[1,rgba('#ffcf9a',.12)]]);c.fillRect(x,T0,22,64-T0);
      c.fillStyle=pat(c,wd,.18);c.beginPath();c.moveTo(x-5,50);c.lineTo(x+27,50);c.lineTo(x+19,64);c.lineTo(x+3,64);c.closePath();c.fill();c.fillStyle=rgba('#000000',.4);c.fill();
      c.fillStyle=rgba('#ffcf9a',.25);c.fillRect(x+3,63.5,16,.8);scroll(c,x+11,58,3.4,1,rgba(C.gold,.6),.6,1.3);}}
  // the cornice: a moulded crown, a row of dentils, an egg-and-dart band in gold, the vine below it
  {const wd=T.wood(32,512,128,MAHOG);c.fillStyle=pat(c,wd,.16);c.fillRect(X0,16,X1-X0,26);c.fillStyle=rgba('#000000',.25);c.fillRect(X0,16,X1-X0,26);
    moulding(c,X0,X1,16,[[2,rgba('#ffcf9a',.28)],[3,rgba('#000000',.4)],[1,rgba('#ffcf9a',.2)]]);
    for(let x=-158;x<X1;x+=5){c.fillStyle=rgba('#000000',.55);c.fillRect(x+.6,23,3.4,6);c.fillStyle=pat(c,wd,.16);c.fillRect(x,22,3.4,5.4);c.fillStyle=rgba('#ffcf9a',.22);c.fillRect(x,22,3.4,.7);}
    c.fillStyle=rgba('#000000',.5);c.fillRect(X0,29,X1-X0,1.4);
    for(let x=-158;x<X1;x+=7){c.fillStyle=lin(c,0,31,0,37,[[0,C.goldL],[.5,C.gold],[1,C.goldDD]]);c.beginPath();c.ellipse(x+2.4,34,2.1,2.7,0,0,TAU);c.fill();c.fillStyle=rgba('#2a1a06',.8);c.beginPath();c.ellipse(x+2.4,34.4,1.1,1.7,0,0,TAU);c.fill();
      c.fillStyle=C.goldD;c.beginPath();c.moveTo(x+5.3,31.5);c.lineTo(x+6.1,37);c.lineTo(x+4.5,31.5);c.fill();}
    c.fillStyle=lin(c,0,37.4,0,40,[[0,C.goldL],[1,C.goldD]]);c.fillRect(X0,37.4,X1-X0,1.6);c.fillStyle=lin(c,0,40,0,52,[[0,rgba('#000000',.55)],[1,rgba('#000000',0)]]);c.fillRect(X0,40,X1-X0,12);
    vine(c,[{x:X0,y:45},{x:X1,y:45}],{w:.7,amp:1.8,wave:16,leaf:2.4,every:2,seed:3,curl:.3});}
  // the panelling below the chair rail: raised panels in mahogany with a gold line inlaid, a moulded rail, a skirting
  const rail=yb-66;
  {const wd=T.wood(41,512,128,MAHOG);c.fillStyle=pat(c,wd,.16);c.fillRect(X0,rail,X1-X0,yb-rail);c.fillStyle=rgba('#000000',.2);c.fillRect(X0,rail,X1-X0,yb-rail);
    for(let x=-150;x<X1;x+=58)woodPanel(c,x+6,rail+10,46,yb-rail-22,{seed:41+((x/58)|0)%3*2,inlay:true});
    // the chair rail: a rounded profile, bright on its top, a gold bead under it, the vine inlaid
    c.fillStyle=pat(c,wd,.16);c.fillRect(X0,rail-6,X1-X0,9);moulding(c,X0,X1,rail-6,[[1.2,rgba('#ffd8b0',.45)],[2,rgba('#ffd8b0',.15)],[3,rgba('#000000',.05)],[2.8,rgba('#000000',.45)]]);
    c.fillStyle=lin(c,0,rail+3,0,rail+5,[[0,C.goldL],[1,C.goldD]]);c.fillRect(X0,rail+3,X1-X0,1.6);
    vine(c,[{x:X0,y:rail+7},{x:X1,y:rail+7}],{w:.55,amp:1.2,wave:12,leaf:1.7,every:2,seed:5,shadow:false});
    c.fillStyle=lin(c,0,rail-6,0,rail-20,[[0,rgba('#000000',.35)],[1,rgba('#000000',0)]]);c.fillRect(X0,rail-20,X1-X0,14);
    // the skirting: dark, a gold bead on its top edge
    c.fillStyle=pat(c,wd,.16);c.fillRect(X0,yb-10,X1-X0,10);c.fillStyle=rgba('#000000',.45);c.fillRect(X0,yb-10,X1-X0,10);c.fillStyle=lin(c,0,yb-10,0,yb-8.6,[[0,C.goldL],[1,C.goldD]]);c.fillRect(X0,yb-10,X1-X0,1.4);}
  // two tall arched windows onto the street
  archWindow(c,150+OX()-48,80,150+OX()+48,228,11);archWindow(c,300+OX()-48,80,300+OX()+48,228,23);
  const bl=blown();
  if(bl){windowBlown(c,150+OX()-48,80,150+OX()+48,228,11,1);windowBlown(c,300+OX()-48,80,300+OX()+48,228,23,.5);}
  for(const x of [272,424])sconce(c,x,148);
  // the street door at the left end of the wall: after the grenade only its hole, where the picture and the sconce were
  if(bl)frontDoorBlown(c);else{sconce(c,30,148);picture(c,64,104,54,72);}
  // the kitchen door: a moulded architrave, an arched transom with the kitchen's light, a brass plate
  {const x0=dX-32,x1=dX+32,top=yb-132,wd=T.wood(51,512,128,WALNUT);c.fillStyle=pat(c,wd,.14);c.fillRect(x0-12,top-28,x1-x0+24,yb-top+28);c.fillStyle=rgba('#000000',.3);c.fillRect(x0-12,top-28,x1-x0+24,yb-top+28);
    c.fillStyle=rgba('#ffcf9a',.2);c.fillRect(x0-12,top-28,x1-x0+24,1);c.fillRect(x0-12,top-28,1,yb-top+28);c.fillStyle=rgba('#000000',.5);c.fillRect(x1+11,top-28,1,yb-top+28);
    c.save();c.beginPath();c.arc(dX,top,32,Math.PI,0);c.closePath();c.clip();c.fillStyle=lin(c,0,top-32,0,top,[[0,'#3a4a44'],[1,'#8a9a84']]);c.fillRect(x0,top-32,64,32);glow(c,dX,top,30,'#ffcf86',.35);
    c.strokeStyle='#160a07';c.lineWidth=1.6;for(let k=1;k<5;k++){const a=Math.PI+k*Math.PI/5;c.beginPath();c.moveTo(dX,top);c.lineTo(dX+Math.cos(a)*32,top+Math.sin(a)*32);c.stroke();}c.restore();
    c.strokeStyle=rgba(C.gold,.8);c.lineWidth=.9;c.beginPath();c.arc(dX,top,34,Math.PI,0);c.stroke();
    c.fillStyle=lin(c,0,top,0,yb,[[0,'#1c2a2a'],[.6,'#33463f'],[1,'#5a6a58']]);c.fillRect(x0,top,64,yb-top);
    c.strokeStyle=rgba('#0a1210',.5);c.lineWidth=.6;for(let y=top+40;y<yb;y+=7){c.beginPath();c.moveTo(x0,y);c.lineTo(x1,y);c.stroke();}glow(c,dX,yb-40,60,'#ffb866',.35);
    c.fillStyle=rgba(C.gold,.6);c.fillRect(x0-3,top,1,yb-top);c.fillRect(x1+2,top,1,yb-top);}
  // the bistro's name over the door: gilt on black glass, a lantern at its heart, two small lamps on it
  {const sx=dX,sy=86;c.fillStyle=rgba('#000000',.55);c.fillRect(sx-74,sy-22,152,42);c.fillStyle='#0a0607';c.fillRect(sx-76,sy-26,152,42);c.fillStyle=lin(c,0,sy-24,0,sy+14,[[0,'#18121c'],[1,'#07050a']]);c.fillRect(sx-73,sy-23,146,36);
    c.fillStyle=lin(c,sx-73,sy-23,sx+73,sy+13,[[0,rgba('#ffffff',0)],[.4,rgba('#ffffff',.05)],[.45,rgba('#ffffff',.1)],[.5,rgba('#ffffff',0)],[1,rgba('#ffffff',0)]]);c.fillRect(sx-73,sy-23,146,36);
    c.strokeStyle=rgba(C.gold,.85);c.lineWidth=1;c.strokeRect(sx-70,sy-20,140,30);
    gilt(c,'Lantern Bistro',sx,sy+1,14.5,{style:'italic 700',glow:.25});
    vine(c,[{x:sx-62,y:sy+6},{x:sx-6,y:sy+6}],{w:.5,amp:.7,wave:7,leaf:1.2,every:2,seed:8,shadow:false});vine(c,[{x:sx+6,y:sy+6},{x:sx+62,y:sy+6}],{w:.5,amp:.7,wave:7,leaf:1.2,every:2,seed:9,shadow:false});
    c.fillStyle='#0a0607';c.beginPath();c.moveTo(sx-6,sy-30);c.lineTo(sx,sy-36);c.lineTo(sx+6,sy-30);c.fill();c.fillStyle=C.goldL;c.fillRect(sx-4,sy-30,8,9);c.fillStyle='#0a0607';c.fillRect(sx-5,sy-21,10,2);glow(c,sx,sy-26,18,'#ffc070',.6);
    for(const k of [-1,1]){const lx=sx+k*84,ly=sy-28;c.strokeStyle=C.goldD;c.lineWidth=1.2;c.beginPath();c.moveTo(lx,ly);c.lineTo(lx-k*10,ly+6);c.stroke();c.fillStyle=C.gold;c.beginPath();c.moveTo(lx-k*10-4,ly+6);c.lineTo(lx-k*10+4,ly+6);c.lineTo(lx-k*10,ly+10);c.fill();glow(c,lx-k*10,ly+12,26,'#ffcf86',.35);}
    c.fillStyle=lin(c,0,yb-142,0,yb-134,[[0,C.goldL],[1,C.goldD]]);c.fillRect(dX-14,yb-142,28,8);c.fillStyle='#1a0c0b';c.font='700 6px "Alegreya SC",Georgia,serif';c.textAlign='center';c.fillText('KITCHEN',dX,yb-136);}
  // the bar: a back bar of mahogany, glass shelves of bottles lit from below, an arched gilt mirror gone old, the counter and its brass
  {const x0=dX+86,x1=X1,top=56,cy=yb-74,wd=T.wood(61,512,128,MAHOG),r=rng(77);
    c.fillStyle=pat(c,wd,.16,90);c.fillRect(x0,top,x1-x0,cy-top);c.fillStyle=rgba('#000000',.5);c.fillRect(x0,top,x1-x0,cy-top);
    c.fillStyle=pat(c,wd,.16);c.fillRect(x0-4,top-8,x1-x0+8,12);moulding(c,x0-4,x1,top-8,[[1,rgba('#ffd8b0',.4)],[2,rgba('#000000',.2)],[4,rgba('#ffd8b0',.08)],[5,rgba('#000000',.45)]]);
    vine(c,[{x:x0,y:top-1},{x:x1,y:top-1}],{w:.6,amp:1.2,wave:10,leaf:1.6,every:2,seed:12,shadow:false});
    // the mirror: old silvering, the room's lights in it, the monogram etched, a carved gilt frame
    const mx=x0+176,mw=96,mtop=top+40,arch=(m)=>{c.beginPath();c.moveTo(mx-mw/2-m,cy-6);c.lineTo(mx-mw/2-m,mtop);c.arc(mx,mtop,mw/2+m,Math.PI,0);c.lineTo(mx+mw/2+m,cy-6);c.closePath();};
    arch(8);c.fillStyle=lin(c,mx-mw/2-8,0,mx+mw/2+8,0,[[0,C.goldDD],[.2,C.gold],[.45,C.goldL],[.7,C.gold],[1,C.goldDD]]);c.fill();
    c.strokeStyle=rgba('#3a2406',.7);c.lineWidth=.7;arch(5);c.stroke();arch(2.5);c.stroke();c.fillStyle=rgba('#fff2c0',.5);for(let a=Math.PI;a<=TAU+.01;a+=.09){c.beginPath();c.arc(mx+Math.cos(a)*(mw/2+6.5),mtop+Math.sin(a)*(mw/2+6.5),.6,0,TAU);c.fill();}
    c.save();arch(0);c.clip();c.drawImage(T.silver(9,256,320),mx-mw/2,top-12,mw,cy-top+12);
    for(let i=0;i<5;i++){glow(c,mx-mw/2+10+i*19,top+70+(i%2)*8,9,'#ffcf86',.55);glow(c,mx-mw/2+10+i*19,top+70+(i%2)*8,22,'#ff9a50',.12);}
    c.fillStyle=rgba('#2a0c10',.45);c.fillRect(mx-mw/2,cy-36,mw,30);for(let i=0;i<12;i++){const bx=mx-mw/2+4+i*7.6;c.fillStyle=rgba('#0a0606',.7);c.fillRect(bx,cy-26-r()*10,3.6,30);}
    c.fillStyle=lin(c,mx-mw/2,top,mx+mw/2,cy,[[0,rgba('#ffffff',0)],[.3,rgba('#ffffff',.06)],[.34,rgba('#ffffff',.11)],[.4,rgba('#ffffff',.02)],[1,rgba('#ffffff',0)]]);c.fillRect(mx-mw/2,top-10,mw,cy-top+10);
    gilt(c,'LB',mx,mtop+2,16,{style:'italic 700',glow:.15});c.restore();
    // shelves of bottles either side, glass shelves on brass brackets, each lit from below
    const shelf=(sx0,sx1)=>{for(let row=0;row<3;row++){const sy=top+46+row*36;c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,0,sy-32,0,sy,[[0,rgba('#ffb866',0)],[1,rgba('#ffb866',.24)]]);c.fillRect(sx0,sy-32,sx1-sx0,32);c.restore();
        for(let x=sx0+3;x<sx1-6;){const h=14+r()*12,bw=3.8+r()*2.6;bottle(c,x,sy,bw,h,['#5a1a1a','#1a3a24','#6a4a1a','#2a1a3a','#4a0e14','#1a2a3a','#3a2a10','#6a6a50'][Math.floor(r()*8)],r);x+=bw+1.6+r()*3;}
        c.fillStyle=rgba('#c8e0e0',.35);c.fillRect(sx0,sy,sx1-sx0,1.6);c.fillStyle=rgba('#ffffff',.5);c.fillRect(sx0,sy,sx1-sx0,.5);
        for(let bx=sx0+10;bx<sx1;bx+=60){c.fillStyle=C.goldD;c.beginPath();c.moveTo(bx,sy+1.6);c.lineTo(bx+5,sy+1.6);c.lineTo(bx+1,sy+6);c.fill();}}};
    shelf(x0+8,mx-mw/2-16);shelf(mx+mw/2+16,x1);
    // the counter: mahogany panels, a polished top with the bottles in it, brass rail along the top and a foot rail
    c.fillStyle=pat(c,wd,.16);c.fillRect(x0-14,cy,x1-x0+14,yb-cy);c.fillStyle=rgba('#000000',.3);c.fillRect(x0-14,cy,x1-x0+14,yb-cy);
    for(let x=x0-10;x<x1;x+=44)woodPanel(c,x+4,cy+12,36,yb-cy-26,{seed:83+((x/44)|0)%3*2,inlay:true,bevel:3});
    c.fillStyle=pat(c,wd,.14);c.fillRect(x0-18,cy-7,x1-x0+18,9);c.fillStyle=lin(c,0,cy-7,0,cy+2,[[0,rgba('#ffd8b0',.5)],[.2,rgba('#ffd8b0',.2)],[.5,rgba('#000000',0)],[1,rgba('#000000',.5)]]);c.fillRect(x0-18,cy-7,x1-x0+18,9);
    c.save();c.globalCompositeOperation='lighter';for(let x=x0;x<x1;x+=7){c.fillStyle=rgba('#ffcf86',.06+r()*.08);c.fillRect(x,cy-6.5,2+r()*3,1.2);}c.restore();
    c.fillStyle=lin(c,0,cy+3,0,cy+7,[[0,C.goldL],[.4,C.gold],[1,C.goldDD]]);c.fillRect(x0-16,cy+3,x1-x0+16,3.4);c.fillStyle=rgba('#fffbe8',.7);c.fillRect(x0-16,cy+3.6,x1-x0+16,.5);
    c.fillStyle=lin(c,0,yb-14,0,yb-9,[[0,C.goldL],[.4,C.gold],[1,C.goldDD]]);c.fillRect(x0-16,yb-14,x1-x0+16,3.6);c.fillStyle=rgba('#fffbe8',.6);c.fillRect(x0-16,yb-13.4,x1-x0+16,.5);
    for(let x=x0;x<x1;x+=60){c.fillStyle=lin(c,x,0,x+3,0,[[0,C.goldD],[.5,C.goldL],[1,C.goldD]]);c.fillRect(x,yb-14,3,14);}
    // on the counter: a brass till, bottles, glasses, a bowl of lemons
    {const tx=x0+300,ty=cy-7;c.fillStyle=lin(c,tx-12,0,tx+12,0,[[0,C.goldDD],[.4,C.goldL],[.6,C.gold],[1,C.goldD]]);c.fillRect(tx-12,ty-16,24,16);c.beginPath();c.moveTo(tx-10,ty-16);c.quadraticCurveTo(tx,ty-27,tx+10,ty-16);c.fill();
      c.fillStyle='#1a0c0b';c.fillRect(tx-8,ty-12,16,5);c.fillStyle=rgba('#fff3d0',.8);c.fillRect(tx-6,ty-11,3,3);c.fillRect(tx-1,ty-11,3,3);c.strokeStyle=rgba('#3a2406',.6);c.lineWidth=.5;for(let k=0;k<3;k++){c.beginPath();c.moveTo(tx-10,ty-5+k*1.6);c.lineTo(tx+10,ty-5+k*1.6);c.stroke();}}
    for(const [bx,k] of [[x0+40,0],[x0+52,1],[x0+120,0],[x0+250,1],[x0+268,0]])bottle(c,bx,cy-7,5,20,k?'#12301c':'#3a0812',r);
    for(const gx of [x0+70,x0+84,x0+230]){c.strokeStyle=rgba('#e8f0f0',.6);c.lineWidth=.7;c.beginPath();c.moveTo(gx-3,cy-17);c.quadraticCurveTo(gx,cy-10,gx+3,cy-17);c.moveTo(gx,cy-11);c.lineTo(gx,cy-7);c.moveTo(gx-2.5,cy-7);c.lineTo(gx+2.5,cy-7);c.stroke();c.fillStyle=rgba('#7a0a1a',.8);c.beginPath();c.moveTo(gx-2.4,cy-14);c.quadraticCurveTo(gx,cy-10.5,gx+2.4,cy-14);c.fill();}
    {const bx=x0+200,by=cy-7;c.fillStyle=lin(c,bx-9,0,bx+9,0,[[0,'#9aa4a8'],[.5,'#e8eef0'],[1,'#8a9498']]);c.beginPath();c.moveTo(bx-9,by-6);c.quadraticCurveTo(bx,by+2,bx+9,by-6);c.closePath();c.fill();for(const [lx,ly] of [[-4,-7],[0,-8],[4,-7],[-2,-10],[2,-10]]){c.fillStyle=rad(c,bx+lx-.6,by+ly-.6,.2,2.6,[[0,'#fff4a0'],[1,'#c8a020']]);c.beginPath();c.ellipse(bx+lx,by+ly,2.6,2.1,0,0,TAU);c.fill();}}
    glow(c,mx,cy-40,140,'#ffb866',.1,.6);
    // under the counter's top the shadow it throws on its own front
    c.fillStyle=lin(c,0,cy+2,0,cy+14,[[0,rgba('#000000',.5)],[1,rgba('#000000',0)]]);c.fillRect(x0-14,cy+2,x1-x0+14,12);}
  // the floor: herringbone in a dark polished wood, the windows and the bar lying in it, a path walked dull down the middle
  {const pts=[pp(X0,GB,FAR),pp(X1,GB,FAR),pp(X1,GB,-110),pp(X0,GB,-110)];c.save();poly(c,pts);c.clip();
    c.save();floorT(c);c.fillStyle=pat(c,T.herringbone({T:128,k:4,sc:4,seed:11}),.25);c.fillRect(X0-60,-120,X1-X0+120,FAR+130);
    // the polish: reflected light from the back of the room fading toward us, a duller walked band
    const sheen=c.createLinearGradient(0,FAR,0,0);sheen.addColorStop(0,'rgba(255,190,130,.12)');sheen.addColorStop(.35,'rgba(255,190,130,.03)');sheen.addColorStop(1,'rgba(255,190,130,0)');c.fillStyle=sheen;c.fillRect(X0-60,0,X1-X0+120,FAR);
    c.fillStyle='rgba(120,90,70,.06)';c.fillRect(X0-60,40,X1-X0+120,90);c.restore();
    c.fillStyle=lin(c,0,yb,0,GB+100,[[0,rgba('#000000',.12)],[.4,rgba('#000000',.22)],[1,rgba('#000000',.72)]]);c.fillRect(X0,yb,X1-X0,GB+120-yb);
    c.globalCompositeOperation='lighter';
    for(const wx of [150,300]){const a=pp(wx-40,GB,FAR-2),b=pp(wx+40,GB,FAR-2),e=pp(wx+70,GB,FAR-90),f=pp(wx-10,GB,FAR-90);c.fillStyle=lin(c,0,a.y,0,e.y,[[0,rgba('#8aa0d0',.13)],[1,rgba('#8aa0d0',0)]]);poly(c,[a,b,e,f]);c.fill();
      // the window's shape mirrored in the polish, broken by the boards
      const q=pp(wx,GB,FAR-6);c.fillStyle=lin(c,0,q.y,0,q.y+40,[[0,rgba('#9ab0e0',.1)],[1,rgba('#9ab0e0',0)]]);c.fillRect(q.x-30,q.y,60,40);}
    {const a=pp(dX+20,GB,FAR-2),b=pp(X1,GB,FAR-2),e=pp(X1,GB,FAR-60),f=pp(dX+20,GB,FAR-60);c.fillStyle=lin(c,0,a.y,0,e.y,[[0,rgba('#ffb866',.14)],[1,rgba('#ffb866',0)]]);poly(c,[a,b,e,f]);c.fill();}
    for(const sx of bl?[272,424]:[272,424,30]){const q=pp(sx-OX(),GB,FAR-4);c.fillStyle=lin(c,0,q.y,0,q.y+46,[[0,rgba('#ffc27a',.12)],[1,rgba('#ffc27a',0)]]);c.fillRect(q.x-10,q.y,20,46);}
    c.restore();
    // where the floor meets the wall, the dark gathers
    c.fillStyle=lin(c,0,yb-4,0,yb+12,[[0,rgba('#000000',.65)],[1,rgba('#000000',0)]]);c.fillRect(X0,yb-4,X1-X0,16);}
  // the rug: knotted pile in red and navy and gold, a border of lozenges, a medallion, worn pale where it is walked, fringed at the ends
  {const x0=200,x1=700,d0=58,d1=128,RW=x1-x0,RD=d1-d0,TT=T,hx=TT.hex,navy=hx('#151321'),red=hx('#5a0c16'),deep=hx('#3a0610'),gold=hx('#c89a48'),ivory=hx('#d8c8a0'),wine=hx('#7a1a24');
    const nn=TT.noise2(17,32);
    const col=(u,v)=>{const X=u*RW,D=v*RD,e=Math.min(X,RW-X,D,RD-D);let k;
      if(e<2.2)k=navy;
      else if(e<8.4){const along=(D<2.2+6.2||D>RD-8.4)&&X>8.4&&X<RW-8.4?X:D,m=((along%9)+9)%9-4.5,cc=e-5.3,dd=Math.abs(m)/4.3+Math.abs(cc)/2.9;k=dd<.55?wine:dd<1?gold:navy;}
      else if(e<9.4)k=gold;else if(e<11)k=deep;
      else{const mx2=X-RW/2,md=D-RD/2,me=(mx2*mx2)/(62*62)+(md*md)/(22*22);
        const ang=Math.atan2(md/22,mx2/62),rr=Math.sqrt(me)/(1-.07*Math.abs(Math.cos(ang*8)));
        if(rr<1){if(rr>.9)k=navy;else if(rr>.86)k=gold;else if(rr<.16)k=gold;else if(rr<.22)k=wine;
          else if(rr<.52){const pet=Math.abs(Math.cos(ang*6))*(1-(rr-.22)/.3*.6);k=pet>.62?gold:pet>.45?wine:deep;}
          else{const pal=Math.abs(Math.cos(ang*12));k=(pal>.92&&rr>.6&&rr<.8)?gold:(rr>.56&&rr<.6)?wine:navy;}}
        else{const lx=((X%14)+14)%14-7,ld=((D%11)+11)%11-5.5,fl=Math.abs(lx)/3.2+Math.abs(ld)/2.4;k=fl<.45?ivory:fl<.8?gold:red;if(fl>=.8&&(Math.abs(lx-ld*1.27)<.5||Math.abs(lx+ld*1.27)<.5))k=wine;}}
      // wear: the pile thin where feet have gone, the colours paling toward the middle
      const w=TT.fbm(nn,u*6,v*2,3),walk=Math.exp(-Math.pow((v-.5)*3,2))*.35*clamp((w-.35)*2,0,1);return TT.lerp3(k,[150,120,100],walk);};
    const rug=TT.rug('dining',Math.round(RW*2.6),Math.round(RD*2.6),col,7);
    c.save();floorT(c);c.fillStyle=rgba('#000000',.45);c.fillRect(x0+1.5,d0-1.5,RW,RD);c.drawImage(rug,x0,d0,RW,RD);
    c.fillStyle=lin(c,0,d0,0,d1,[[0,rgba('#000000',.25)],[.5,rgba('#000000',0)],[1,rgba('#ffcf9a',.05)]]);c.fillRect(x0,d0,RW,RD);
    // the fringe at each end
    for(const fx of [x0,x1]){const s=fx===x0?-1:1;for(let d=d0+1;d<d1-.5;d+=1.1){c.strokeStyle=rgba('#d8ccb0',.75);c.lineWidth=.45;c.beginPath();c.moveTo(fx,d);c.lineTo(fx+s*(4+Math.sin(d*3.1)*1.2),d+Math.sin(d*1.7)*.6);c.stroke();}}
    c.restore();}
  if(bl)floorBlown(c);
  // warm haze under the ceiling
  haze(c,X0,X1,T0,90,'#2a0c10',.45,true);}

// the doors swing, the sconces breathe: drawn every frame over the layer
function live(){const t=S.t,yb=yB(),dX=DOORX(),top=yb-132,o=typeof diningDoorOpen==='function'?diningDoorOpen():0,w=31*Math.cos(o*1.28),grow=o*9;
  for(const s of [-1,1]){const hinge=dX+s*32,free=hinge-s*w;if(w<1.5)continue;const fy0=top-grow,fy1=yb+grow*.6,q=(u,v)=>({x:lerp(hinge,free,u),y:lerp(lerp(top,fy0,u),lerp(yb,fy1,u),v)});
    ctx.fillStyle='#1c0e0b';ctx.beginPath();ctx.moveTo(hinge,top);ctx.lineTo(free,fy0);ctx.lineTo(free,fy1);ctx.lineTo(hinge,yb);ctx.closePath();ctx.fill();
    // a raised panel low, a porthole high, brass kick plate, the vine along the middle rail
    const pa=[q(.14,.6),q(.86,.6),q(.86,.9),q(.14,.9)];ctx.fillStyle='#26130e';ctx.beginPath();ctx.moveTo(pa[0].x,pa[0].y);for(const p of pa.slice(1))ctx.lineTo(p.x,p.y);ctx.closePath();ctx.fill();
    ctx.strokeStyle=rgba(C.gold,.35);ctx.lineWidth=.6;ctx.stroke();
    const pc=q(.5,.3),rx=Math.max(1,7*w/31);ctx.fillStyle=C.goldD;ctx.beginPath();ctx.ellipse(pc.x,pc.y,rx+1.8,9.6,0,0,TAU);ctx.fill();
    ctx.fillStyle=lin(ctx,0,pc.y-8,0,pc.y+8,[[0,'#ffe6b0'],[1,'#ff9a50']]);ctx.beginPath();ctx.ellipse(pc.x,pc.y,rx,7.8,0,0,TAU);ctx.fill();glow(ctx,pc.x,pc.y,16,'#ffb866',.35);
    const kp=[q(0,.93),q(1,.93),q(1,.985),q(0,.985)];ctx.fillStyle=C.goldD;ctx.beginPath();ctx.moveTo(kp[0].x,kp[0].y);for(const p of kp.slice(1))ctx.lineTo(p.x,p.y);ctx.closePath();ctx.fill();
    ctx.fillStyle=rgba(C.rim,.35);ctx.fillRect(Math.min(hinge,free),top,Math.abs(free-hinge),.8);}
  const f=.95+.05*Math.sin(t*5.3);for(const x of blown()?[272,424]:[272,424,30])glow(ctx,x,144,24,'#ffd8a0',.25*f);
  if(blown())liveBlown(t);}
// ---------- after the grenade (S.bistro==='blown') ----------
// The street door, at the left end of the wall, is a hole: the doors blown in across the floor, the frame splintered, soot fanned up
// the wall round it and out across the parquet, glass and splinters thrown into the room. Through the hole Lamplight Street, cold and
// wet under its lamps; its light lies in through the doorway across the floor. Smoke drifts in under the ceiling.
function blown(){return typeof S!=='undefined'&&S.bistro==='blown';}
// the doorway on the wall (screen units, the wall's own frame) and on the floor (plane x, depth)
const FD={cx:76,w:64,ar:32};
function fdG(){const yb=yB();return{x0:FD.cx-FD.w/2,x1:FD.cx+FD.w/2,cx:FD.cx,top:yb-132,ar:FD.ar,yb,px:FD.cx-OX()};}
function doorPath(c,G,m){c.beginPath();c.moveTo(G.x0-m,G.yb);c.lineTo(G.x0-m,G.top);c.arc(G.cx,G.top,G.ar+m,Math.PI,0);c.lineTo(G.x1+m,G.yb);c.closePath();}
// soot over the wall: a dark fan from a point
function sootD(c,x,y,R,a,sq){c.save();c.translate(x,y);if(sq)c.scale(1,sq);c.fillStyle=rad(c,0,0,0,R,[[0,rgba('#040202',a)],[.45,rgba('#040202',a*.6)],[1,rgba('#040202',0)]]);c.beginPath();c.arc(0,0,R,0,TAU);c.fill();c.restore();}
// raw wood standing out of a broken edge
function splint(c,pts,n,seed,cx,cy,len){const r=rng(seed);
  for(let i=0;i<n;i++){const k=Math.floor(r()*(pts.length-1)),u=r(),a=pts[k],b=pts[k+1],ex=lerp(a.x,b.x,u),ey=lerp(a.y,b.y,u),an=Math.atan2(cy-ey,cx-ex)+(r()-.5)*.9,L=2+r()*(len||6),wd=.6+r()*1.4;
    c.fillStyle=r()<.6?'#8a5a34':'#5e3a20';c.beginPath();c.moveTo(ex-Math.sin(an)*wd,ey+Math.cos(an)*wd);c.lineTo(ex+Math.sin(an)*wd,ey-Math.cos(an)*wd);c.lineTo(ex+Math.cos(an)*L,ey+Math.sin(an)*L);c.closePath();c.fill();
    c.strokeStyle=rgba('#1a0a04',.7);c.lineWidth=.3;c.stroke();}}
// Lamplight Street seen out through the hole: the houses across the way with their windows lit, a lamp on the far kerb, the wet
// setts holding its light, the blast's smoke still hanging in the street, a fine rain in the cold light
function streetHole(c,x,y,w,h){const r=rng(613);
  c.fillStyle=lin(c,0,y,0,y+h,[[0,'#070a14'],[.3,'#101628'],[.55,'#1a1c2c'],[1,'#121018']]);c.fillRect(x,y,w,h);
  const fb=y+h*.72;
  // the houses across the street: dark stucco and brick, warm windows, the ground floor shops
  let bx=x-8;while(bx<x+w){const bw=26+r()*20,bt=y+h*(.08+r()*.14);c.fillStyle=mix('#0d0c12','#17131a',r());c.fillRect(bx,bt,bw,fb-bt);
    c.fillStyle=rgba('#ffcf86',.07);c.fillRect(bx+bw-1,bt,1,fb-bt);
    for(let wy=bt+6;wy<fb-18;wy+=13)for(let wx=bx+4;wx<bx+bw-5;wx+=9){if(r()<.36){c.fillStyle=rgba('#ffc477',.5+r()*.4);c.fillRect(wx,wy,3.6,6);c.fillStyle=rgba('#3a1010',.55);c.fillRect(wx,wy,1.3,6);}else{c.fillStyle=rgba('#22243a',.75);c.fillRect(wx,wy,3.6,6);}}
    c.fillStyle=rgba('#ffb866',.32);c.fillRect(bx+3,fb-12,bw-6,8);bx+=bw+1.5;}
  // the far pavement and the road, wet
  c.fillStyle=lin(c,0,fb,0,y+h,[[0,'#262028'],[.25,'#1a1620'],[1,'#0e0c12']]);c.fillRect(x,fb,w,y+h-fb);
  c.fillStyle=rgba('#d8c0a8',.25);c.fillRect(x,fb+h*.08,w,.6);
  // an elven lamp on the far kerb, its post and its glow, its light running down the wet road
  const lx=x+w*.68,ly=y+h*.36;c.fillStyle='#07060a';c.fillRect(lx-1,ly,2,fb+h*.06-ly);c.fillRect(lx-2.4,fb+h*.06-3,4.8,3);
  glow(c,lx,ly-2,10,'#fff2d4',.95);glow(c,lx,ly-2,34,'#ffc277',.35);
  c.save();c.globalCompositeOperation='lighter';for(let i=0;i<30;i++){const yy=fb+h*.1+r()*(y+h-fb-h*.1),k=1-(yy-fb)/(y+h-fb);c.fillStyle=rgba('#ffc477',.28*k);c.fillRect(lx+(r()-.5)*9,yy,2+r()*5,.8);}c.restore();
  // the cold of the night over it all, the smoke hanging in the street, the rain falling through the light
  c.fillStyle=rgba('#9ab4e0',.1);c.fillRect(x,y,w,h);
  for(let i=0;i<6;i++){const sx=x+r()*w,sy=y+h*(.2+r()*.5),R=10+r()*18;c.fillStyle=rad(c,sx,sy,0,R,[[0,rgba('#6a6470',.28)],[1,rgba('#6a6470',0)]]);c.fillRect(sx-R,sy-R,2*R,2*R);}
  c.strokeStyle=rgba('#c8d8f0',.22);c.lineWidth=.35;c.beginPath();for(let i=0;i<34;i++){const rx=x+r()*w,ry=y+r()*h,len=4+r()*6;c.moveTo(rx,ry);c.lineTo(rx-1.2,ry+len);}c.stroke();}
function frontDoorBlown(c){const G=fdG(),{x0,x1,cx,top,ar,yb}=G,r=rng(55),wd=TX().wood(51,512,128,WALNUT);
  // the blast's soot up the wall from the hole, and a plume to the ceiling
  sootD(c,cx,yb-46,112,.72,1.1);
  c.save();c.beginPath();c.moveTo(cx-30,top-ar+6);c.bezierCurveTo(cx-40,top-80,cx-70,40,cx-60,-20);c.lineTo(cx+70,-20);c.bezierCurveTo(cx+80,40,cx+44,top-80,cx+30,top-ar+6);c.closePath();
  c.fillStyle=lin(c,0,top-ar+6,0,-20,[[0,rgba('#040202',.62)],[.5,rgba('#040202',.35)],[1,rgba('#040202',0)]]);c.fill();c.restore();
  // the architrave round the hole: walnut like the kitchen door's, its moulding cracked and gone in places
  doorPath(c,G,12);c.fillStyle=pat(c,wd,.14);c.fill();doorPath(c,G,12);c.fillStyle=rgba('#000000',.42);c.fill();
  c.strokeStyle=rgba(C.gold,.6);c.lineWidth=.9;c.beginPath();c.moveTo(x0-6,yb);c.lineTo(x0-6,top+20);c.moveTo(x0-6,top-4);c.lineTo(x0-6,top);c.arc(cx,top,ar+6,Math.PI,Math.PI*1.3);c.moveTo(cx+Math.cos(Math.PI*1.62)*(ar+6),top+Math.sin(Math.PI*1.62)*(ar+6));c.arc(cx,top,ar+6,Math.PI*1.62,0);c.lineTo(x1+6,yb);c.stroke();
  // a piece of the architrave torn half off, hanging out from the right jamb
  c.save();c.translate(x1+12,top+18);c.rotate(.36);c.fillStyle=pat(c,wd,.14);c.fillRect(-4,0,9,62);c.fillStyle=rgba('#000000',.35);c.fillRect(-4,0,9,62);c.fillStyle=rgba('#ffcf9a',.2);c.fillRect(-4,0,1,62);c.restore();
  // the hole
  doorPath(c,G,0);c.save();c.clip();streetHole(c,x0,top-ar,FD.w,yb-top+ar);
  // the right leaf's top, still on its hinge: a jagged strip of mahogany hanging in the doorway
  c.fillStyle=pat(c,wd,.14);c.beginPath();c.moveTo(x1,top+6);c.lineTo(x1-12,top+8);c.lineTo(x1-10,top+30);c.lineTo(x1-13,top+44);c.lineTo(x1-6,top+38);c.lineTo(x1-4,top+60);c.lineTo(x1,top+52);c.closePath();c.fill();
  c.fillStyle=rgba('#000000',.4);c.fill();c.fillStyle=lin(c,0,top+8,0,top+16,[[0,C.goldL],[1,C.goldD]]);c.fillRect(x1-2,top+8,2,7);
  c.restore();
  // the opening's inner edge: splinters all round it, worst at the jambs where the hinges and the lock were
  const q=[{x:x0,y:yb},{x:x0,y:top}];for(let a=Math.PI;a<=TAU+.01;a+=Math.PI/12)q.push({x:cx+Math.cos(a)*ar,y:top+Math.sin(a)*ar});q.push({x:x1,y:yb});
  splint(c,q,34,91,cx,top+40,7);
  // hinge plates left on the jambs, one bent out
  for(const [hx,hy,a] of [[x0+1,top+14,0],[x0+1,yb-30,.5],[x1-3,yb-30,-.2]]){c.save();c.translate(hx,hy);c.rotate(a);c.fillStyle=lin(c,0,0,2,0,[[0,C.goldD],[1,C.goldL]]);c.fillRect(0,0,2.4,9);c.restore();}
  // the threshold: a step of stone, cracked through and black
  c.fillStyle=lin(c,0,yb-3,0,yb,[[0,'#3a3236'],[1,'#141012']]);c.fillRect(x0-4,yb-3,FD.w+8,3);c.fillStyle=rgba('#040202',.55);c.fillRect(x0-4,yb-3,FD.w+8,3);
  c.strokeStyle=rgba('#000000',.85);c.lineWidth=.5;c.beginPath();c.moveTo(cx+6,yb-3);c.lineTo(cx+3,yb-1.4);c.lineTo(cx+5,yb);c.stroke();
  // the panelling under the hole's sides took the blast: a few raised panels split and gone
  for(const [px,py,pw,ph] of [[x0-30,yb-56,16,30],[x1+18,yb-50,12,26]]){c.fillStyle='#120806';c.beginPath();c.moveTo(px,py);c.lineTo(px+pw,py+3);c.lineTo(px+pw-2,py+ph);c.lineTo(px+3,py+ph-2);c.closePath();c.fill();
    splint(c,[{x:px,y:py},{x:px+pw,y:py+3},{x:px+pw-2,y:py+ph},{x:px+3,y:py+ph-2},{x:px,y:py}],8,px|0,px+pw/2,py+ph/2,3);}}
// a window the blast shattered: cracks run from where the glass broke, the lower panes are out with shards in their frames, the
// velvet torn and singed; the window nearer the door has it worst (k)
function windowBlown(c,x0,y0,x1,y1,seed,k){const w=x1-x0,ar=w/2,yc=y0+ar,cx=(x0+x1)/2,r=rng(seed*13+7),ry=lerp(yc,y1,.5);
  c.save();c.beginPath();c.moveTo(x0,y1);c.lineTo(x0,yc);c.arc(cx,yc,ar,Math.PI,0);c.lineTo(x1,y1);c.closePath();c.clip();
  // the panes that are out: no glass and no reflection, the street sharp and cold through them, a little smoke in it
  const outs=[[x0,lerp(yc,y1,.45),cx,lerp(yc,y1,.72)],[cx,yc,x1,lerp(yc,y1,.45)]].slice(0,k>=1?2:1);
  for(const [a,b,e,f] of outs){c.fillStyle=rgba('#05060c',.3);c.fillRect(a+1,b+1,e-a-2,f-b-2);c.fillStyle=rgba('#9ab4e0',.06);c.fillRect(a+1,b+1,e-a-2,f-b-2);
    const ring=[{x:a+1,y:b+1},{x:e-1,y:b+1},{x:e-1,y:f-1},{x:a+1,y:f-1},{x:a+1,y:b+1}];
    for(let i=0;i<10;i++){const kk=Math.floor(r()*4),u=r(),p0=ring[kk],p1=ring[kk+1],ex=lerp(p0.x,p1.x,u),ey=lerp(p0.y,p1.y,u),dx=(a+e)/2-ex,dy=(b+f)/2-ey,dl=Math.hypot(dx,dy)||1,L=3+r()*8,wd2=1+r()*2.6,tx=-dy/dl,ty=dx/dl;
      c.fillStyle=rgba('#d8e8f4',.12+r()*.1);c.beginPath();c.moveTo(ex-tx*wd2,ey-ty*wd2);c.lineTo(ex+tx*wd2,ey+ty*wd2);c.lineTo(ex+dx/dl*L,ey+dy/dl*L);c.closePath();c.fill();
      c.strokeStyle=rgba('#ffffff',.35);c.lineWidth=.35;c.stroke();}}
  // cracks across the glass that is left, from where it was struck
  const hx=cx+(r()-.5)*w*.4,hy=lerp(yc,y1,.25);c.strokeStyle=rgba('#e8f0ff',.4);c.lineWidth=.45;
  for(let i=0;i<9;i++){let px=hx,py=hy,a=r()*TAU;c.beginPath();c.moveTo(px,py);for(let j=0;j<5;j++){a+=(r()-.5)*.7;const L=6+r()*12;px+=Math.cos(a)*L;py+=Math.sin(a)*L;c.lineTo(px,py);}c.stroke();}
  c.strokeStyle=rgba('#e8f0ff',.28);c.beginPath();for(let i=1;i<4;i++){c.moveTo(hx+i*5,hy);c.arc(hx,hy,i*5,0,TAU);}c.stroke();
  // the velvet: torn up from the bottom in rags, its torn edges singed, a few still glowing
  const n=10,fw=(w+4)/n;for(let i=0;i<n;i++){if(r()>.45*k+.15)continue;const fx=x0-2+i*fw,top2=ry+6+r()*(y1-ry-10);c.fillStyle='#120a10';c.beginPath();c.moveTo(fx+fw*.2,y1);c.lineTo(fx+fw*.5+(r()-.5)*2,top2);c.lineTo(fx+fw*.8,y1);c.closePath();c.fill();
    c.strokeStyle=rgba('#ff7a2a',.5);c.lineWidth=.4;c.beginPath();c.moveTo(fx+fw*.25,y1-2);c.lineTo(fx+fw*.5,top2+1);c.lineTo(fx+fw*.75,y1-2);c.stroke();}
  c.restore();
  // the sash: one bar of the sunburst snapped and hanging
  c.strokeStyle='#1e0f0a';c.lineWidth=2;c.beginPath();const a=Math.PI+4*Math.PI/6;c.moveTo(cx+Math.cos(a)*ar*.5,yc+Math.sin(a)*ar*.5);c.lineTo(cx+Math.cos(a)*ar*.5+6,yc+Math.sin(a)*ar*.5+12);c.stroke();
  // soot on the side toward the door
  sootD(c,x0-8,lerp(yc,y1,.4),w*.7,.4*k,1.8);}
// on the floor: the scorch out from the doorway, the cold light lying in through it, the two leaves blown in, the picture off the wall,
// splinters and glass and plaster thrown across the parquet
function floorBlown(c){const G=fdG(),px=G.px,r=rng(4401),d0=FAR;
  c.save();floorT(c);
  // the scorch, fanned out from the doorway
  c.save();c.translate(px,d0);c.scale(1,.72);c.fillStyle=rad(c,0,0,0,96,[[0,rgba('#040202',.85)],[.4,rgba('#040202',.55)],[.75,rgba('#040202',.2)],[1,rgba('#040202',0)]]);c.beginPath();c.arc(0,0,96,Math.PI,TAU);c.fill();c.restore();
  for(let i=0;i<16;i++){const a=Math.PI*1.04+r()*Math.PI*.92,L=50+r()*60,w2=.04+r()*.05;c.fillStyle=lin(c,px,d0,px+Math.cos(a)*L,d0+Math.sin(a)*L*.72,[[0,rgba('#040202',.45)],[1,rgba('#040202',0)]]);
    c.beginPath();c.moveTo(px,d0);c.lineTo(px+Math.cos(a-w2)*L,d0+Math.sin(a-w2)*L*.72);c.lineTo(px+Math.cos(a+w2)*L,d0+Math.sin(a+w2)*L*.72);c.closePath();c.fill();}
  // the street's cold light, in through the doorway and across the boards
  c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,0,d0,0,d0-110,[[0,rgba('#a8c0e8',.3)],[.5,rgba('#a8c0e8',.1)],[1,rgba('#a8c0e8',0)]]);
  c.beginPath();c.moveTo(px-FD.w/2+2,d0);c.lineTo(px+FD.w/2-2,d0);c.lineTo(px+FD.w/2+70,d0-110);c.lineTo(px-FD.w/2+30,d0-110);c.closePath();c.fill();c.restore();
  // the leaves, flat on the floor: one whole, slewed into the room; the other broken in two
  const leaf=(x,d,an,len,part)=>{c.save();c.translate(x,d);c.rotate(an);const W2=30,wv=TX().wood(41,512,128,MAHOG);
    c.fillStyle=rgba('#000000',.5);c.fillRect(1.5,-W2/2-1.5,len,W2);
    c.fillStyle=pat(c,wv,.16);c.fillRect(0,-W2/2,len,W2);c.fillStyle=rgba('#000000',.3);c.fillRect(0,-W2/2,len,W2);
    // the glazing: the glass gone, its frame left with shards in it, the floor showing through
    if(part!=='low'){const g0=part==='high'?6:len*.42,g1=part==='high'?len-5:len-6;c.fillStyle='#0e0806';c.fillRect(g0,-W2/2+4,g1-g0,W2-8);
      for(let i=0;i<4;i++){const sx=g0+r()*(g1-g0),side=r()<.5?-1:1;c.fillStyle=rgba('#d8e4ec',.16);c.beginPath();c.moveTo(sx-1.4,side*(W2/2-4));c.lineTo(sx+1.4,side*(W2/2-4));c.lineTo(sx+(r()-.5)*2,side*(W2/2-4-1.5-r()*3));c.closePath();c.fill();}
      c.strokeStyle=rgba(C.gold,.4);c.lineWidth=.6;c.strokeRect(g0,-W2/2+4,g1-g0,W2-8);}
    if(part!=='high'){const p0=4,p1=part==='low'?len-4:len*.38;c.strokeStyle=rgba('#ffcf9a',.18);c.lineWidth=.8;c.strokeRect(p0,-W2/2+4,p1-p0,W2-8);
      c.fillStyle=lin(c,0,-W2/2,0,W2/2,[[0,C.goldL],[1,C.goldD]]);c.fillRect(0,-W2/2+1,3.4,W2-2);}
    c.fillStyle=rgba('#ffcf9a',.25);c.fillRect(0,W2/2-1,len,1);
    // the broken end: splintered
    if(part){const ex=part==='high'?0:len;c.fillStyle='#8a5a34';for(let i=0;i<7;i++){const yy=-W2/2+r()*W2;c.beginPath();c.moveTo(ex,yy-1.4);c.lineTo(ex,yy+1.4);c.lineTo(ex+(part==='high'?-1:1)*(2+r()*6),yy+(r()-.5)*2);c.closePath();c.fill();}}
    c.restore();};
  leaf(px-28,d0-6,-.38,118,null);
  leaf(px+66,d0-26,.52,62,'high');leaf(px-64,d0-34,-1.05,52,'low');
  // the picture that hung by the door, face up on the boards, its glass starred
  c.save();c.translate(px+92,d0-12);c.rotate(.18);c.fillStyle=rgba('#000000',.45);c.fillRect(-3,-5,44,30);c.fillStyle=lin(c,0,0,40,26,[[0,C.gold],[.5,C.goldD],[1,C.goldDD]]);c.fillRect(-4,-4,44,30);
  c.fillStyle=lin(c,0,0,0,22,[[0,'#0a0e1e'],[.55,'#2a2234'],[1,'#120e18']]);c.fillRect(0,0,36,22);c.fillStyle='#07070c';c.fillRect(20,4,4,14);c.fillStyle=rgba('#040202',.35);c.fillRect(-4,-4,44,30);
  c.strokeStyle=rgba('#e8f0ff',.35);c.lineWidth=.4;c.beginPath();for(let i=0;i<6;i++){c.moveTo(14,11);c.lineTo(14+Math.cos(i*1.05)*11,11+Math.sin(i*1.05)*8);}c.stroke();c.restore();
  // the litter of it all: splinters, glass, brass, flakes of plaster and wallpaper, thickest by the doorway
  for(let i=0;i<190;i++){const a=Math.PI*1.03+r()*Math.PI*.94,rr=Math.pow(r(),.75)*150,x=px+Math.cos(a)*rr*1.2,d=Math.min(d0-1,d0+Math.sin(a)*rr*.7),k=r(),s2=.7+r()*.9;if(d<120)continue;
    c.save();c.translate(x,d);c.rotate(r()*TAU);
    if(k<.35){c.fillStyle=rgba('#d8e4ec',.3);c.beginPath();c.moveTo(-1.7*s2,0);c.lineTo(1.1*s2,-1*s2);c.lineTo(1.5*s2,.7*s2);c.closePath();c.fill();c.fillStyle=rgba('#ffffff',.7);c.fillRect(-.3,-.3,.6*s2,.5*s2);}
    else if(k<.72){c.fillStyle=k<.55?'#2e140b':'#6a4024';c.fillRect(-5*s2,-.8*s2,10*s2,1.6*s2);c.fillStyle=rgba('#ffcf9a',.22);c.fillRect(-5*s2,-.8*s2,10*s2,.5*s2);}
    else if(k<.84){c.fillStyle=k<.78?'#3a1410':'#5a2418';c.beginPath();c.moveTo(-3*s2,-2*s2);c.lineTo(3*s2,-1.4*s2);c.lineTo(2*s2,2.4*s2);c.lineTo(-2.6*s2,1.6*s2);c.closePath();c.fill();}
    else if(k<.92){c.fillStyle=C.goldD;c.fillRect(-1.6*s2,-1*s2,3.2*s2,2*s2);c.fillStyle=rgba(C.goldL,.7);c.fillRect(-1.6*s2,-1*s2,3.2*s2,.5*s2);}
    else{c.fillStyle='#b8aa98';c.beginPath();c.arc(0,0,1.4*s2,0,TAU);c.fill();}
    c.restore();}
  c.restore();}
// smoke has come in with the blast and hangs under the ceiling, drifting in from the doorway along the room; the wreck by the door
// still smoulders
function liveBlown(t){const G=fdG(),r=rng(733);
  for(let i=0;i<16;i++){const P=9+r()*5,u=((t/P)+i/16)%1,x=G.cx+u*(420+r()*160)+Math.sin(u*3+i)*14,y=(G.top-G.ar+8)-u*(70+r()*50)+Math.sin(u*5+i*2)*6,R=12+u*(36+r()*20),a=(u<.08?u/.08:1)*Math.pow(1-u,1.4)*.55;
    const col=u<.25?mix('#8a7a78','#6a5a58',u/.25):'#6a5a58';ctx.fillStyle=rad(ctx,x,y,0,R,[[0,rgba(col,a)],[1,rgba(col,0)]]);ctx.beginPath();ctx.arc(x,y,R,0,TAU);ctx.fill();}
  // embers in the splinters by the doorway
  for(let i=0;i<9;i++){const x=G.px+(r()-.6)*60,d=FAR-4-r()*40,q=pp(x,GB,d),fl=Math.max(0,Math.sin(t*(6+r()*7)+i*2.1));if(fl>.1)glow(ctx,q.x,q.y-.5,3.6,'#ff7a2a',.7*fl);}}
function light(f){return{dir:{x:.12,y:-1}};}
// ---------- the room's furniture ----------
const at=(q,d)=>P(q.x,q.y,d);
function segP(a,b,d,w,col){const A=at(a,d),B=at(b,d);ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.stroke();}
function quad(p,col){ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(p[0].x,p[0].y);for(const q of p.slice(1))ctx.lineTo(q.x,q.y);ctx.closePath();ctx.fill();}
// a soft contact shadow on the floor under a piece of furniture, and the marble its tables are topped with
function shadowAt(q,d,rx,ry){const g=S.arena.ground(q.x,d),s=P(q.x,g,d);ctx.save();ctx.fillStyle=rad(ctx,s.x,s.y,0,rx,[[0,'rgba(0,0,0,.42)'],[1,'rgba(0,0,0,0)']]);ctx.translate(s.x,s.y);ctx.scale(1,ry/rx);ctx.translate(-s.x,-s.y);ctx.beginPath();ctx.arc(s.x,s.y,rx,0,TAU);ctx.fill();ctx.restore();}
let MARBLE=null;function marblePat(){if(MARBLE&&MARBLE.ctx===ctx)return MARBLE.p;const p=ctx.createPattern(EnvTex.marble(4,256,256),'repeat');if(p.setTransform)p.setTransform(new DOMMatrix().scale(.25));MARBLE={ctx,p};return p;}
const WOOD='#1e100b',WOODL='#3a2014',WOODD='#0e0705';
function prop(Pp){const p=Pp.pts,d=Pp.dep,dz=Pp.dz;ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  if(Pp.type==='chair'){const bk=d+dz*.7,fr=d-dz*.7,s0=p[0],t=p[2];
    shadowAt({x:(p[3].x+p[4].x)/2,y:(p[3].y+p[4].y)/2},d,20,6);
    // a bentwood chair: back legs and the hoop of the back behind, the cane seat, the front legs
    segP(p[0],p[3],bk,2.6,WOODD);segP(p[1],p[4],bk,2.6,WOODD);
    quad([at(p[0],bk),at(p[1],bk),at(p[1],fr),at(p[0],fr)],'#2a1810');
    {const A=at(p[0],bk),B=at(p[1],bk),F=at(p[1],fr),G=at(p[0],fr);ctx.strokeStyle=rgba('#c8a070',.18);ctx.lineWidth=.4;ctx.beginPath();for(let u=.2;u<1;u+=.2){ctx.moveTo(lerp(A.x,B.x,u),lerp(A.y,B.y,u));ctx.lineTo(lerp(G.x,F.x,u),lerp(G.y,F.y,u));}ctx.stroke();}
    segP(p[0],p[3],fr,2.8,WOOD);segP(p[1],p[4],fr,2.8,WOOD);
    // the hoop of the back: from the seat up past the top and back down
    const ux=t.x-s0.x,uy=t.y-s0.y,L=Math.hypot(ux,uy)||1,nx=-uy/L*Pp.s,ny=ux/L*Pp.s;
    ctx.strokeStyle=WOOD;ctx.lineWidth=2.8;ctx.beginPath();const a0=at(s0,fr),a1=at(t,fr),c1=at({x:t.x+nx*12+ux*.05,y:t.y+ny*12},fr),a2=at({x:s0.x+nx*10,y:s0.y+ny*10},fr);
    ctx.moveTo(a0.x,a0.y);ctx.lineTo(a1.x,a1.y);ctx.quadraticCurveTo(c1.x,c1.y,a2.x,a2.y);ctx.stroke();
    ctx.lineWidth=1.6;ctx.beginPath();const m0=at({x:lerp(s0.x,t.x,.45),y:lerp(s0.y,t.y,.45)},fr),m1=at({x:lerp(s0.x,t.x,.45)+nx*10,y:lerp(s0.y,t.y,.45)+ny*10},fr);ctx.moveTo(m0.x,m0.y);ctx.lineTo(m1.x,m1.y);ctx.stroke();
    ctx.strokeStyle=rgba(C.rim,.45);ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(a0.x+.6,a0.y);ctx.lineTo(a1.x+.6,a1.y);ctx.stroke();
    // a ring between the legs
    const r0={x:lerp(p[0].x,p[3].x,.55),y:lerp(p[0].y,p[3].y,.55)},r1={x:lerp(p[1].x,p[4].x,.55),y:lerp(p[1].y,p[4].y,.55)};segP(r0,r1,fr,1.3,WOOD);
    segP(p[0],p[1],fr,3,'#2e1a10');segP(p[0],p[1],fr+.5,.6,rgba(C.rim,.5));}
  else if(Pp.type==='stool'){const dk=WOODD,bk=d+5,fr=d-5;shadowAt({x:(p[2].x+p[3].x)/2,y:(p[2].y+p[3].y)/2},d,20,6);segP(p[0],p[2],bk,2.6,dk);segP(p[1],p[3],bk,2.6,dk);segP(p[0],p[2],fr,2.8,WOOD);segP(p[1],p[3],fr,2.8,WOOD);
    const m0={x:lerp(p[0].x,p[2].x,.66),y:lerp(p[0].y,p[2].y,.66)},m1={x:lerp(p[1].x,p[3].x,.66),y:lerp(p[1].y,p[3].y,.66)};segP(m0,m1,fr,2.2,C.goldD);segP(m0,m1,fr,.8,C.goldL);
    // the seat: oxblood leather, buttoned, a brass rim
    const sa=at(p[0],d+9),sb=at(p[1],d+9),sc=at(p[1],d-9),sd=at(p[0],d-9);quad([sa,sb,sc,sd],'#4a0e14');
    ctx.fillStyle='#6a1a20';ctx.beginPath();const cx=(sa.x+sc.x)/2,cy=(sa.y+sc.y)/2;ctx.ellipse(cx,cy-1,Math.abs(sb.x-sa.x)*.42,2.6,0,0,TAU);ctx.fill();ctx.fillStyle=rgba(C.goldL,.7);ctx.fillRect(cx-.6,cy-1.6,1.2,1.2);
    segP(p[0],p[1],d-9,2.2,C.goldD);segP(p[0],p[1],d-9.5,.6,C.goldL);}
  else if(Pp.type==='bistro'){const top=p[0],tr=p[1],mx=(top.x+tr.x)/2,my=(top.y+tr.y)/2,ux=(tr.x-top.x)/2,uy=(tr.y-top.y)/2;
    shadowAt(p[5],d,26,7);
    // a brass pedestal on a tripod foot, a marble top with a brass edge
    segP(p[2],p[3],d,3.6,C.goldDD);segP(p[2],p[3],d-1,1,C.goldD);
    const b0=at(p[4],d),b1=at(p[5],d);ctx.strokeStyle=lin(ctx,b0.x-2,0,b0.x+2,0,[[0,C.goldDD],[.5,C.gold],[1,C.goldDD]]);ctx.lineWidth=3.4;ctx.beginPath();ctx.moveTo(b0.x,b0.y);ctx.lineTo(b1.x,b1.y);ctx.stroke();
    ctx.fillStyle=C.goldD;const kn=at({x:lerp(p[4].x,p[5].x,.55),y:lerp(p[4].y,p[5].y,.55)},d);ctx.beginPath();ctx.ellipse(kn.x,kn.y,3.4,2,0,0,TAU);ctx.fill();
    const ring=(o,col)=>{ctx.fillStyle=col;ctx.beginPath();for(let i=0;i<=28;i++){const a=i/28*TAU,q=P(mx+ux*Math.cos(a),my+uy*Math.cos(a)+o,d+dz*Math.sin(a));i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);}ctx.fill();};
    ring(3.4,C.goldD);ring(1.6,'#b8a89a');
    ctx.save();ring(0,marblePat());ctx.clip();ctx.strokeStyle=rgba('#7a6a6a',.35);ctx.lineWidth=.5;ctx.beginPath();{const a=P(mx-ux*.7,my-uy*.7,d+5),b=P(mx+ux*.1,my,d-3),e=P(mx+ux*.6,my,d-8);ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo(b.x,b.y,e.x,e.y);}ctx.stroke();
    ctx.fillStyle=rgba('#ffcf86',.18);ctx.fillRect(P(mx-ux,my,d).x,P(mx,my,d+dz).y,ux*2.4,4);ctx.restore();}
  else if(Pp.type==='plant'){shadowAt({x:(p[2].x+p[3].x)/2,y:(p[2].y+p[3].y)/2},d,18,6);const pt=p[4],c0={x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2},ang=Math.atan2(pt.y-c0.y,pt.x-c0.x);
    // a brass urn, and a palm whose fronds catch the lamplight on top
    quad([at(p[0],d),at(p[1],d),at(p[3],d),at(p[2],d)],C.goldDD);
    const u0=at(p[0],d),u1=at(p[1],d),u3=at(p[3],d),u2=at(p[2],d);ctx.fillStyle=lin(ctx,u0.x,0,u1.x,0,[[0,C.goldDD],[.35,C.gold],[.55,C.goldL],[1,C.goldD]]);ctx.beginPath();ctx.moveTo(u0.x,u0.y);ctx.lineTo(u1.x,u1.y);ctx.quadraticCurveTo(u1.x+3,(u1.y+u3.y)/2,u3.x,u3.y);ctx.lineTo(u2.x,u2.y);ctx.quadraticCurveTo(u0.x-3,(u0.y+u2.y)/2,u0.x,u0.y);ctx.fill();
    ctx.fillStyle=C.goldDD;ctx.fillRect(Math.min(u0.x,u1.x)-2,u0.y-2,Math.abs(u1.x-u0.x)+4,3);
    for(let i=0;i<9;i++){const a=ang+(i-4)*.36+Math.sin(S.t*1.3+i+Pp.dep)*.03,l=36+(i%3)*10,q=at(c0,d),e={x:q.x+Math.cos(a)*l,y:q.y+Math.sin(a)*l},m={x:q.x+Math.cos(a)*l*.5+Math.cos(a+1.4)*7,y:q.y+Math.sin(a)*l*.5-9};
      ctx.strokeStyle='#14241a';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.quadraticCurveTo(m.x,m.y,e.x,e.y);ctx.stroke();
      for(let k=1;k<9;k++){const u=k/9,bx=(1-u)*(1-u)*q.x+2*u*(1-u)*m.x+u*u*e.x,by=(1-u)*(1-u)*q.y+2*u*(1-u)*m.y+u*u*e.y,ll=7*(1-u*.6);
        for(const s of [-1,1]){ctx.strokeStyle=k%2?'#1c3424':'#24402c';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx+Math.cos(a+s*1.1)*ll,by+Math.sin(a+s*1.1)*ll+2);ctx.stroke();}}
      ctx.strokeStyle=rgba(C.rim,.35);ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(q.x,q.y-1);ctx.quadraticCurveTo(m.x,m.y-1,e.x,e.y-1);ctx.stroke();}}
  else{ctx.restore();return false;}
  ctx.restore();return true;}
// a brass lantern on a chain, its glass lit; out, the glass goes dark
function lamp(L){const p=L.p,a=P(L.x,L.ay,L.dep),q=P(p.x,p.y,L.dep),k=lampGlow(L);ctx.save();
  if(!L.fallen){ctx.strokeStyle='#0a0606';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(q.x,q.y-12);ctx.stroke();ctx.strokeStyle=rgba(C.goldD,.6);ctx.lineWidth=.5;ctx.setLineDash([1.2,1.2]);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(q.x,q.y-12);ctx.stroke();ctx.setLineDash([]);}
  const ang=L.fallen?(L.landed?1.2:S.t*6):-Math.atan2(p.x-L.x,p.y-L.ay);ctx.translate(q.x,q.y);ctx.rotate(ang);
  if(k>0){const G=glowSprites();ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.15*k;ctx.drawImage(G.cone,-46,8,92,120);ctx.globalAlpha=.75*k;ctx.drawImage(G.dot,-26,-22,52,52);ctx.restore();}
  // the lantern: a crown cap, four panes, a gilt frame, a drip at the bottom
  ctx.fillStyle='#0d0806';ctx.beginPath();ctx.moveTo(-8,-6);ctx.lineTo(0,-13);ctx.lineTo(8,-6);ctx.closePath();ctx.fill();ctx.fillStyle=C.gold;ctx.fillRect(-1,-16,2,4);ctx.beginPath();ctx.arc(0,-16.5,1.6,0,TAU);ctx.fill();
  ctx.fillStyle=L.lit?lin(ctx,0,-6,0,7,[[0,'#fff6dc'],[1,'#ffb866']]):'#2a1e1a';ctx.beginPath();ctx.moveTo(-7,-6);ctx.lineTo(7,-6);ctx.lineTo(5.5,7);ctx.lineTo(-5.5,7);ctx.closePath();ctx.fill();
  ctx.strokeStyle=C.goldD;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-7,-6);ctx.lineTo(7,-6);ctx.lineTo(5.5,7);ctx.lineTo(-5.5,7);ctx.closePath();ctx.moveTo(0,-6);ctx.lineTo(0,7);ctx.stroke();
  ctx.fillStyle='#0d0806';ctx.fillRect(-6.5,7,13,2);ctx.beginPath();ctx.moveTo(-3,9);ctx.lineTo(0,13);ctx.lineTo(3,9);ctx.fill();ctx.fillStyle=C.gold;ctx.fillRect(-6.5,7,13,.7);
  if(L.lit){ctx.fillStyle='#fff8e8';ctx.beginPath();ctx.ellipse(0,1,1.6,2.6,0,0,TAU);ctx.fill();}
  ctx.restore();return true;}
// the long table under its cloth: a fall of white damask, a candelabrum's worth of light on it
function table(){const T=S.table;if(!T||!T.on||T.state==='broken'||S.room!=='dining')return false;
  const Q=T.pts,bk=T.dep+TD,fr=T.dep-TD,lp=(a,b,u)=>({x:lerp(a.x,b.x,u),y:lerp(a.y,b.y,u)});
  const ux=(Q[1].x-Q[0].x),uy=(Q[1].y-Q[0].y),Lr=Math.hypot(ux,uy)||1,nx=-uy/Lr,ny=ux/Lr,o=(q,u,v)=>({x:q.x+ux/Lr*u+nx*v,y:q.y+uy/Lr*u+ny*v});
  ctx.save();ctx.lineCap='round';
  // the legs that show under the cloth
  const la=lp(Q[0],Q[1],.08),lb=lp(Q[0],Q[1],.92);segP(la,Q[3],bk,4,WOODD);segP(lb,Q[2],bk,4,WOODD);segP(la,Q[3],fr,4.4,WOOD);segP(lb,Q[2],fr,4.4,WOOD);
  const a0=o(Q[0],-6,-1),a1=o(Q[1],6,-1);quad([at(a0,bk+4),at(a1,bk+4),at(a1,fr-4),at(a0,fr-4)],'#efe4d0');
  // the drop at the front, scalloped, with folds
  const N=12,dr=[];for(let i=0;i<=N;i++)dr.push(at({x:lerp(a0.x,a1.x,i/N),y:lerp(a0.y,a1.y,i/N)},fr-4));
  for(let i=N;i>=0;i--){const b={x:lerp(a0.x,a1.x,i/N),y:lerp(a0.y,a1.y,i/N)};dr.push(at(o(b,0,17+(i%2?3:0)),fr-4));}
  ctx.fillStyle=lin(ctx,0,dr[0].y,0,dr[dr.length-1].y+20,[[0,'#e6d8c0'],[1,'#b8a488']]);quad(dr,ctx.fillStyle);
  ctx.strokeStyle=rgba('#7a6a50',.35);ctx.lineWidth=.6;for(let i=1;i<N;i++){const b={x:lerp(a0.x,a1.x,i/N),y:lerp(a0.y,a1.y,i/N)},t1=at(b,fr-4),t2=at(o(b,0,16),fr-4);ctx.beginPath();ctx.moveTo(t1.x,t1.y+2);ctx.lineTo(t2.x,t2.y);ctx.stroke();}
  ctx.strokeStyle=rgba(C.gold,.6);ctx.lineWidth=.7;ctx.beginPath();for(let i=0;i<=N;i++){const b={x:lerp(a0.x,a1.x,i/N),y:lerp(a0.y,a1.y,i/N)},t2=at(o(b,0,15+(i%2?3:0)),fr-4);i?ctx.lineTo(t2.x,t2.y):ctx.moveTo(t2.x,t2.y);}ctx.stroke();
  for(const [q,sg] of [[a0,-1],[a1,1]])quad([at(q,bk+4),at(q,fr-4),at(o(q,sg*2,17),fr-4),at(o(q,sg*2,17),bk+4)],'#d8c8b0');
  ctx.strokeStyle=rgba('#ffffff',.6);ctx.lineWidth=.8;ctx.beginPath();{const t1=at(a0,fr-4),t2=at(a1,fr-4);ctx.moveTo(t1.x,t1.y);ctx.lineTo(t2.x,t2.y);}ctx.stroke();
  ctx.restore();return true;}
// candles burn: a flame and its glow over the wax
function ware(it){if(it.kind!=='candle'||it.gone||it.sil)return false;const q=P(it.x,it.y,it.dep);ctx.save();ctx.translate(q.x,q.y);ctx.rotate(it.ang||0);
  ctx.fillStyle=C.goldD;ctx.fillRect(-3,2,6,1.6);ctx.fillStyle='#f4ead6';ctx.fillRect(-1.6,-6,3.2,8);ctx.fillStyle=rgba('#ffffff',.5);ctx.fillRect(-1.2,-5.5,.8,7);
  if(it.lit){const f=1+.12*Math.sin(S.t*23+it.x)*Math.sin(S.t*9+it.dep);ctx.fillStyle='#fff3c8';ctx.beginPath();ctx.ellipse(0,-9,1.2,2.6*f,0,0,TAU);ctx.fill();ctx.restore();glow(ctx,q.x,q.y-9,16,'#ffc070',.55);glow(ctx,q.x,q.y-6,40,'#ff9a50',.12);return true;}
  ctx.restore();return true;}
// ---------- the dividers: a painted paper screen, an etched glass partition, a booth wall ----------
function div(it){const w=it.dv;if(w.state==='broken')return false;const A=it.a,B=it.b,xr=divR(w),g=S.arena.ground(w.x,(A+B)/2),h=w.h,yt=g-h,M=w.mat;
  if(M!=='paper'&&M!=='glass'&&M!=='plaster')return false;
  EnvProps.divFace(it,'dining',divFaceD,6);
  if(it.first||it.last){const d=it.first?A:B,pl=divL(w),pr=divR(w),col=M==='glass'?C.goldD:'#140a08';quad([P(pl,g,d),P(pl,yt,d),P(pr,yt,d),P(pr,g,d)],col);}
  for(const m of w.marks){if(m.d<A||m.d>=B)continue;drawDivMark(w,m);}
  return true;}
// a divider's face, whole, in its own plane (ctx here is the face's own canvas)
function divFaceD(ctx,w,A,B,yt,g,h){const M=w.mat;
  if(M==='paper'){// a folding screen: cream paper in dark frames, a gold vine and a crescent moon painted across it
    ctx.fillStyle=lin(ctx,0,yt,0,g,[[0,'#e8d8b8'],[1,'#b89a78']]);ctx.fillRect(A,yt,B-A,h);
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=rgba('#ffcf86',.12);ctx.fillRect(A,yt,B-A,h);ctx.restore();
    ctx.strokeStyle=rgba('#3a2a1a',.55);ctx.lineWidth=.9;ctx.beginPath();for(let d=w.d0+4;d<w.d1;d+=1.5){const y=g-22-Math.sin((d-w.d0)*.06)*30-((d-w.d0)/(w.d1-w.d0))*60;d===w.d0+4?ctx.moveTo(d,y):ctx.lineTo(d,y);}ctx.stroke();
    E.vine(ctx,[{x:w.d0+4,y:g-30},{x:(w.d0+w.d1)/2,y:g-80},{x:w.d1-4,y:g-112}],{w:.9,amp:3,wave:14,leaf:3.4,every:2,seed:w.seed,col:'#b8862e',shadow:false});
    ctx.fillStyle=rgba('#8a6a2a',.7);ctx.beginPath();ctx.arc(w.d0+(w.d1-w.d0)*.7,yt+28,8,0,TAU);ctx.fill();ctx.fillStyle=lin(ctx,0,yt,0,g,[[0,'#e8d8b8'],[1,'#b89a78']]);ctx.beginPath();ctx.arc(w.d0+(w.d1-w.d0)*.7+3,yt+26,7,0,TAU);ctx.fill();
    ctx.fillStyle='#1a0c08';for(let d=Math.ceil(w.d0/31)*31;d<=w.d1;d+=31)ctx.fillRect(d-1.5,yt,3,h);ctx.fillRect(A,yt,B-A,3.5);ctx.fillRect(A,g-4,B-A,4);
    ctx.fillStyle=rgba(C.gold,.6);ctx.fillRect(A,yt,B-A,.7);}
  else if(M==='glass'){// etched glass on a panelled base, brass mullions, a frieze of the vine etched along the top
    const base=g-50;ctx.fillStyle='#1c0e0b';ctx.fillRect(A,base,B-A,50);ctx.strokeStyle=rgba(C.gold,.35);ctx.lineWidth=.6;for(let d=Math.ceil(w.d0/32)*32;d<w.d1;d+=32)ctx.strokeRect(d+3,base+6,26,38);
    ctx.fillStyle=lin(ctx,0,yt,0,base,[[0,'rgba(200,225,235,.18)'],[1,'rgba(150,190,205,.3)']]);ctx.fillRect(A,yt,B-A,base-yt);
    E.vine(ctx,[{x:w.d0,y:yt+14},{x:w.d1,y:yt+14}],{w:.7,amp:3,wave:16,leaf:3,every:2,seed:w.seed,col:'rgba(235,245,250,.55)',shadow:false});
    ctx.strokeStyle=rgba('#ffffff',.25);ctx.lineWidth=1.2;for(let k=0;k<5;k++){const d0=w.d0+(w.d1-w.d0)*(.1+k*.2);ctx.beginPath();ctx.moveTo(d0,base-10);ctx.lineTo(d0+12,base-60);ctx.stroke();}
    ctx.fillStyle=C.gold;for(let d=Math.ceil(w.d0/32)*32;d<=w.d1;d+=32)ctx.fillRect(d-1,yt,2,base-yt);ctx.fillStyle=C.goldD;ctx.fillRect(A,yt,B-A,3);ctx.fillRect(A,base-2,B-A,3);ctx.fillStyle=C.goldL;ctx.fillRect(A,yt,B-A,.7);}
  else{// a booth wall: dark panelling to a red upholstered top, gilt beading, a little picture lamp
    ctx.fillStyle='#1a0d0a';ctx.fillRect(A,yt,B-A,h);ctx.fillStyle='#4a0e16';ctx.fillRect(A,yt+8,B-A,h*.36);
    ctx.strokeStyle=rgba('#000000',.35);ctx.lineWidth=.8;for(let d=Math.ceil(w.d0/12)*12;d<w.d1;d+=12){ctx.beginPath();ctx.moveTo(d,yt+10);ctx.lineTo(d,yt+8+h*.36);ctx.stroke();}
    ctx.fillStyle=rgba(C.goldL,.6);for(let d=Math.ceil(w.d0/12)*12;d<w.d1;d+=12)for(const y of [yt+20,yt+40])ctx.fillRect(d-.5,y-.5,1,1);
    for(let d=Math.ceil(w.d0/36)*36;d<w.d1;d+=36){ctx.fillStyle='#22110d';ctx.fillRect(d+4,yt+h*.48,28,h*.42);ctx.strokeStyle=rgba(C.gold,.4);ctx.lineWidth=.6;ctx.strokeRect(d+7,yt+h*.5,22,h*.38);}
    ctx.fillStyle='#2a1610';ctx.fillRect(A,yt,B-A,8);ctx.fillStyle=rgba(C.rim,.5);ctx.fillRect(A,yt,B-A,.8);ctx.fillStyle=C.goldD;ctx.fillRect(A,yt+h*.44,B-A,1.6);}
}
// the layer depends on the bistro's state: the glue paints it again when this changes
E.S.dining={paint,live,light,key:()=>'dining:'+(blown()?'blown':'intact'),prop,lamp,table,ware,div};
})();
// ===== ENV DINING END =====
