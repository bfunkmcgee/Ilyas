// ===== ENV CROPS =====
// The crop field: a farm on the edge of the city at night, harvest time, where the story begins. The fight stands on a clearing at the
// field's edge, harvested maize stubble and a dirt farm track, calm and dark; a motorcycle's tyres have come in off the track from the
// left. Across the back the maize still stands taller than a man, its tassels silvered by the moon over the left of the sky, an old
// fence of split posts in front of it and a rusted five-bar gate where the track goes on through a gap toward the city. On the right
// the crop is wheat, lower, and over it stand the farm (a barn with one warm window, a silo, a windmill), a line of power poles
// marching away, and on the horizon the city, its towers in their own haze, the Hallowell tower among them with its gold H and its
// crown of cyan light. Chaff drifts in the moonlight, the wind runs over the crop tops, and the tower's red light blinks.
(()=>{const E=EnvLook,{C,pp,poly,line,lin,rad,rgba,mix,glow,haze,stars,moon,hallTower,rng,lerp,clamp,TAU}=E;
const FAR=278,EY=()=>GB-FAR*PSY;
const MOON={x:132,y:70,r:14},TOWER={x:598,base:224,top:48,w:28},HOR=218;
const CROP_D=232,FENCE_D=224;                 // the crop's near edge and the fence in front of it, in plane depth
const GATE={x0:330,x1:374};                   // the gate's opening in the fence, in plane x
const GAP={x0:292,x1:418};                    // the gap in the crop where the track goes on (leaves reach in from either side)
const WHEAT_X=560;                            // east of this (plane x) the crop is wheat, lower
const BYRE={x:772,base:252};                  // the farm on the right horizon: barn, silo, windmill
const MILL={x:884,y:188,r:11};                // the windmill's wheel (turned in live)
function patAt(c,cv,x,y,u,rot){const p=c.createPattern(cv,'repeat');if(p.setTransform){let m=new DOMMatrix().translate(x,y);if(rot)m=m.rotate(rot);p.setTransform(m.scale(u));}return p;}
const g2=(x,d)=>pp(x,GB,d);
// ---------- the city on the horizon: rows of blocks, lit floors, hazed by distance ----------
function cityRow(c,x0,x1,base,o){const r=rng(o.seed),far=o.far,col=mix(o.col||'#121427','#2a2436',far*.7);let x=x0;
  while(x<x1){const w=(o.w0||8)+r()*(o.w1||20),h=(o.h0||10)+Math.pow(r(),1.6)*(o.h1||50),top=base-h,k=r();c.fillStyle=col;c.fillRect(x,top,w,h+2);
    if(k<.12){c.fillRect(x+w*.4,top-h*.3,w*.2,h*.3);c.beginPath();c.moveTo(x+w*.4,top-h*.3);c.lineTo(x+w*.5,top-h*.52);c.lineTo(x+w*.6,top-h*.3);c.fill();}
    else if(k<.2){c.beginPath();c.arc(x+w/2,top,w*.32,Math.PI,0);c.fill();c.fillRect(x+w/2-.5,top-w*.32-5,1,5);}
    else if(k<.34){c.fillRect(x+w*.2,top-4-r()*4,2,6);c.fillRect(x+w*.62,top-3-r()*4,2,5);}
    else c.fillRect(x-.6,top-1.2,w+1.2,1.4);
    const fw=3,fh=4,cols=Math.max(1,Math.floor((w-2)/fw)),rows=Math.max(1,Math.floor((h-3)/fh));
    for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){if(r()>(o.lit||.3))continue;c.fillStyle=rgba(r()<.88?'#ffcf86':'#dfeeff',(.3+.55*r())*(1-far*.55));c.fillRect(x+1.4+j*fw,top+2.2+i*fh,1.1,1.5);}
    c.fillStyle=rgba('#ffcf86',.07*(1-far));c.fillRect(x+w-1,top,1,h);
    x+=w+(r()<.2?r()*10:.5);}
  haze(c,x0,x1,base-(o.hazeH||40),base+2,'#3a2a36',o.hazeA==null?.45:o.hazeA);}
// ---------- the farm: a gambrel barn with one lit window and a lamp over its door, a silo, a windmill's lattice tower ----------
function farm(c){const x=BYRE.x,b=BYRE.base,dark='#06070c';
  // the barn
  const B=new Path2D();B.moveTo(x-34,b);B.lineTo(x-34,b-24);B.lineTo(x-26,b-38);B.lineTo(x,b-48);B.lineTo(x+26,b-38);B.lineTo(x+34,b-24);B.lineTo(x+34,b);B.closePath();
  c.fillStyle=dark;c.fill(B);
  c.strokeStyle=rgba('#c8d4ff',.26);c.lineWidth=.7;c.beginPath();c.moveTo(x-34,b-24);c.lineTo(x-26,b-38);c.lineTo(x,b-48);c.stroke();
  c.strokeStyle=rgba('#ffb070',.12);c.beginPath();c.moveTo(x,b-48);c.lineTo(x+26,b-38);c.lineTo(x+34,b-24);c.stroke();
  c.strokeStyle=rgba('#000000',.6);c.lineWidth=.4;c.beginPath();for(let k=-30;k<=30;k+=4){c.moveTo(x+k,b-24-Math.max(0,12-Math.abs(k)*.4));c.lineTo(x+k,b);}c.stroke();
  // the hayloft door and the one window that is lit, high under the roof
  c.fillStyle=rgba('#120d0a',1);c.fillRect(x-6,b-36,12,10);c.strokeStyle=rgba('#c8d4ff',.18);c.lineWidth=.5;c.strokeRect(x-6,b-36,12,10);
  c.fillStyle=lin(c,0,b-34,0,b-28,[[0,'#ffe2a6'],[1,'#ff9a50']]);c.fillRect(x+14,b-21,5,6);glow(c,x+16.5,b-18,18,'#ffb866',.5);
  c.fillStyle='#000000';c.fillRect(x+16.2,b-21,.6,6);c.fillRect(x+14,b-18.3,5,.5);
  // the big doors, and a lamp over them throwing its warmth down the boards
  c.fillStyle='#0a0a10';c.fillRect(x-12,b-18,24,18);c.strokeStyle=rgba('#000000',.7);c.lineWidth=.5;c.beginPath();c.moveTo(x,b-18);c.lineTo(x,b);c.moveTo(x-12,b-18);c.lineTo(x,b);c.moveTo(x+12,b-18);c.lineTo(x,b);c.stroke();
  c.fillStyle='#ffe9c0';c.fillRect(x-1,b-22,2,1.6);glow(c,x,b-21,26,'#ffc070',.55);
  c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,0,b-21,0,b,[[0,rgba('#ffb866',.2)],[1,rgba('#ffb866',0)]]);c.beginPath();c.moveTo(x-3,b-21);c.lineTo(x+3,b-21);c.lineTo(x+16,b);c.lineTo(x-16,b);c.closePath();c.fill();c.restore();
  // the silo: a tall drum with a domed cap, hoops round it and a ladder up its side
  {const sx=x+52,w=17,top=b-82;c.fillStyle=lin(c,sx-w/2,0,sx+w/2,0,[[0,'#10121a'],[.35,'#0a0b12'],[1,'#050609']]);c.fillRect(sx-w/2,top,w,b-top);
    c.beginPath();c.ellipse(sx,top,w/2,w*.42,0,Math.PI,0);c.fill();c.fillStyle=rgba('#c8d4ff',.3);c.beginPath();c.ellipse(sx,top,w/2,w*.42,0,Math.PI,Math.PI*1.45);c.lineTo(sx-w*.1,top);c.fill();
    c.strokeStyle=rgba('#c8d4ff',.14);c.lineWidth=.45;c.beginPath();for(let y=top+6;y<b;y+=7){c.moveTo(sx-w/2,y);c.quadraticCurveTo(sx,y+1.4,sx+w/2,y);}c.stroke();
    c.fillStyle=rgba('#c8d4ff',.22);c.fillRect(sx-w/2,top,.8,b-top);
    c.strokeStyle='#020204';c.lineWidth=.5;c.beginPath();c.moveTo(sx+w/2-2,top+2);c.lineTo(sx+w/2-2,b);c.moveTo(sx+w/2+1,top+2);c.lineTo(sx+w/2+1,b);for(let y=top+3;y<b;y+=2.4){c.moveTo(sx+w/2-2,y);c.lineTo(sx+w/2+1,y);}c.stroke();}
  // the windmill: a tapering lattice tower, its tail vane; the wheel turns in live()
  {const mx=MILL.x,top=MILL.y+4;c.strokeStyle='#05060a';c.lineWidth=1;c.beginPath();c.moveTo(mx-9,b);c.lineTo(mx-1.5,top);c.moveTo(mx+9,b);c.lineTo(mx+1.5,top);c.stroke();
    c.lineWidth=.45;c.beginPath();for(let k=0;k<6;k++){const t0=k/6,t1=(k+1)/6,ya=lerp(b,top,t0),yb=lerp(b,top,t1),wa=lerp(9,1.5,t0),wb=lerp(9,1.5,t1);c.moveTo(mx-wa,ya);c.lineTo(mx+wb,yb);c.moveTo(mx+wa,ya);c.lineTo(mx-wb,yb);c.moveTo(mx-wb,yb);c.lineTo(mx+wb,yb);}c.stroke();
    c.fillStyle='#05060a';c.beginPath();c.moveTo(mx,MILL.y-1);c.lineTo(mx+16,MILL.y-4);c.lineTo(mx+18,MILL.y+3);c.lineTo(mx,MILL.y+2);c.closePath();c.fill();
    c.strokeStyle=rgba('#c8d4ff',.16);c.beginPath();c.moveTo(mx-9,b);c.lineTo(mx-1.5,top);c.stroke();}}
// ---------- the power line: wooden poles with crossarms marching away toward the farm, the wires sagging between them ----------
// one line receding toward (880, the horizon): x, base, height and scale all shrink together. The second pole stands clear of the tower,
// over the wheat; the far ones go behind the barn and silo (painted before the farm) and peek over its roof.
const POLES=[{x:428,base:300,h:150,s:1},{x:672,base:256,h:69,s:.46},{x:731,base:245,h:50,s:.33},{x:762,base:239,h:39,s:.26},{x:790,base:234,h:30,s:.2},{x:810,base:231,h:23,s:.155}];
// poles i0..i1 and the wires between them; with toLast the last pole only takes the wires (its body is painted elsewhere, further back)
function poles(c,i0,i1,toLast){const tops=POLES.slice(i0,i1+1);c.lineCap='round';
  tops.forEach((P,i)=>{if(toLast&&i===tops.length-1)return;const tx=P.x+P.s*1.5,ty=P.base-P.h;c.strokeStyle='#07070b';c.lineWidth=Math.max(.7,2.2*P.s);c.beginPath();c.moveTo(P.x,P.base);c.lineTo(tx,ty);c.stroke();
    c.lineWidth=Math.max(.5,1.4*P.s);c.beginPath();c.moveTo(tx-12*P.s,ty+5*P.s);c.lineTo(tx+12*P.s,ty+5*P.s);c.stroke();
    c.fillStyle=rgba('#c8d4ff',.4);for(const k of [-9,-3,3,9]){c.fillRect(tx+k*P.s-.5*P.s,ty+3*P.s,1.1*P.s+.3,1.6*P.s+.3);}
    c.strokeStyle=rgba('#c8d4ff',.22*Math.min(1,P.s*1.6));c.lineWidth=Math.max(.35,.6*P.s);c.beginPath();c.moveTo(P.x-1*P.s,P.base);c.lineTo(tx-1*P.s,ty);c.stroke();});
  // the wires: three from each arm, sagging
  c.strokeStyle=rgba('#05060a',.85);c.lineWidth=.5;
  for(let i=0;i<tops.length-1;i++){const A=tops[i],B=tops[i+1];for(const k of [-9,3,9]){const ax=A.x+A.s*1.5+k*A.s,ay=A.base-A.h+3*A.s,bx=B.x+B.s*1.5+k*B.s,by=B.base-B.h+3*B.s,sag=4*A.s+2;c.beginPath();c.moveTo(ax,ay);c.quadraticCurveTo((ax+bx)/2,(ay+by)/2+sag,bx,by);c.stroke();}}
  // and off the near pole to the left, out of the picture, down to the farm road
  if(i0===0)for(const k of [-9,3,9]){const A=tops[0],ax=A.x+A.s*1.5+k*A.s,ay=A.base-A.h+3*A.s;c.beginPath();c.moveTo(ax,ay);c.quadraticCurveTo(ax-120,ay+20,ax-260,ay+6);c.stroke();}}
// ---------- a maize plant: a stalk with its leaves arching and drooping, a tassel, an ear in its husk ----------
// into P.dark (silhouette), P.rim (edges toward the moon), P.warm (edges toward the city) and P.tas (the tassel, which catches the light)
function maize(P,R,x,base,h,s,lean){const tx=x+lean*h*.14,ty=base-h;
  P.dark.moveTo(x-1.4*s,base+1);P.dark.quadraticCurveTo(x+lean*h*.05-1.3*s,base-h*.5,tx-.5*s,ty+3);P.dark.lineTo(tx+.5*s,ty+3);P.dark.quadraticCurveTo(x+lean*h*.05+1.3*s,base-h*.5,x+1.4*s,base+1);P.dark.closePath();
  const n=6+Math.floor(R()*3);
  for(let i=0;i<n;i++){const t=.14+.72*i/n+R()*.05,side=(i+(R()<.25?1:0))%2?1:-1,ax=lerp(x,tx,t),ay=base-h*t,L=h*(.34+.22*R())*(1.15-.55*Math.abs(t-.42)),up=.18+R()*.3,droop=.45+R()*.5,w=(3+R()*1.8)*s*(1.1-t*.45);
    const cx=ax+side*L*.46,cy=ay-L*up,ex=ax+side*L*(.82+.2*R()),ey=ay-L*up+L*droop*.85;
    P.dark.moveTo(ax,ay-w*.45);P.dark.quadraticCurveTo(cx,cy-w*.55,ex,ey);P.dark.quadraticCurveTo(cx+side*w*.2,cy+w*.75,ax,ay+w*.55);P.dark.closePath();
    if(R()<.38){const Rm=side<0?P.rim:P.warm;Rm.moveTo(lerp(ax,cx,.3),lerp(ay,cy,.3)-w*.5);Rm.quadraticCurveTo(cx,cy-w*.55,lerp(cx,ex,.55),lerp(cy,ey,.45)-w*.25);}}
  const nt=4+Math.floor(R()*3);for(let k=0;k<nt;k++){const a=-Math.PI/2+(k-(nt-1)/2)*.32+(R()-.5)*.2,L=h*(.06+.05*R());P.tas.moveTo(tx,ty+2);P.tas.quadraticCurveTo(tx+Math.cos(a)*L*.6,ty+Math.sin(a)*L*.6,tx+Math.cos(a)*L+lean*2,ty+Math.sin(a)*L+L*.45);}
  if(R()<.5){const t=.36+R()*.16,ex=lerp(x,tx,t),ey=base-h*t,sd=R()<.5?1:-1;P.dark.moveTo(ex+sd*2.4*s+2*s,ey-5*s);P.dark.ellipse(ex+sd*2.4*s,ey-5*s,2*s,6*s,sd*.38,0,TAU);
    P.tas.moveTo(ex+sd*3.2*s,ey-10.5*s);P.tas.lineTo(ex+sd*4.4*s,ey-13.5*s);}}
// ---------- wheat: stalks in their thousands, the heavy ears bowed, catching the moon and the city ----------
function wheat(P,R,x,base,h){const lean=(R()-.35)*3,ex=x+lean,ey=base-h;P.stalk.moveTo(x,base);P.stalk.quadraticCurveTo(x+lean*.3,base-h*.6,ex,ey);
  const a=.5+R()*.7,L=4+R()*2.4;P.ear.moveTo(ex+Math.cos(a)*L+1,ey+Math.sin(a)*L);P.ear.ellipse(ex+Math.cos(a)*L*.5,ey+Math.sin(a)*L*.5,1,L*.55,a-Math.PI/2,0,TAU);
  if(R()<.4){P.awn.moveTo(ex,ey);P.awn.lineTo(ex+Math.cos(a-1.2)*5,ey+Math.sin(a-1.2)*5);}}
// ---------- the scene ----------
let TOPS=null;   // the crop's tops along the back, for the wind
function paint(c){
  const X0=-160,X1=W+240,T0=-110,ey=EY(),r=rng(19),cb=g2(0,CROP_D).y;
  // ---- the sky: cold toward the moon on the left, warm low on the right where the city lights the haze
  c.fillStyle=lin(c,0,T0,0,cb,[[0,'#020309'],[.32,'#060915'],[.6,'#0e1226'],[.82,'#181a2c'],[1,'#221e2c']]);c.fillRect(X0,T0,X1-X0,cb-T0+4);
  glow(c,MOON.x,MOON.y,320,'#7c8ed0',.11);
  c.save();c.globalCompositeOperation='lighter';c.translate(700,HOR+6);c.scale(1,.55);c.fillStyle=rad(c,0,0,10,560,[[0,rgba('#ff9a5a',.3)],[.3,rgba('#ff8a50',.12)],[.7,rgba('#ff8a50',.03)],[1,rgba('#ff8a50',0)]]);c.beginPath();c.arc(0,0,560,0,TAU);c.fill();c.restore();
  stars(c,X0,X1,T0,170,240,41,.75);
  for(let i=0;i<10;i++){const cx=X0+r()*(X1-X0),cy=48+r()*92,rx=70+r()*190,ry=2.4+r()*5,dm=Math.hypot(cx-MOON.x,cy-MOON.y),k=clamp(1-dm/320,0,1),kc=clamp(1-Math.abs(cx-720)/380,0,1);
    c.save();c.translate(cx,cy);c.scale(1,ry/rx);c.fillStyle=rad(c,0,-ry*2,0,rx,[[0,rgba('#d8e0ff',.3*k)],[1,rgba('#d8e0ff',0)]]);c.beginPath();c.arc(0,-ry*1.2,rx,0,TAU);c.fill();
      c.fillStyle=rad(c,0,0,0,rx,[[0,rgba('#121626',.9)],[.7,rgba('#121626',.55)],[1,rgba('#121626',0)]]);c.beginPath();c.arc(0,0,rx,0,TAU);c.fill();
      if(kc>0){c.globalCompositeOperation='lighter';c.fillStyle=rad(c,0,ry*3,0,rx,[[0,rgba('#ff9a5a',.18*kc)],[1,rgba('#ff9a5a',0)]]);c.beginPath();c.arc(0,ry*1.5,rx,0,TAU);c.fill();}c.restore();}
  moon(c,MOON.x,MOON.y,MOON.r,{});
  // ---- the city on the horizon, the Hallowell tower among its towers
  cityRow(c,300,X1,HOR-2,{seed:12,far:.9,h0:18,h1:84,w0:8,w1:20,lit:.22,hazeH:60,hazeA:.5});
  cityRow(c,330,X1,HOR+2,{seed:19,far:.72,h0:10,h1:46,w0:9,w1:22,lit:.3,hazeH:38,hazeA:.42});
  hallTower(c,TOWER.x,TOWER.base,TOWER.top,TOWER.w,{lit:.95});
  cityRow(c,360,X1,HOR+7,{seed:5,far:.5,h0:5,h1:18,w0:12,w1:28,lit:.36,col:'#0e101c',hazeH:16,hazeA:.35});
  glow(c,760,HOR+4,330,'#ff9a5a',.13,.3);
  // ---- the land before the city: dark fields in long bands, hedges, a farm road with a light or two on it
  c.fillStyle=lin(c,0,HOR+4,0,cb,[[0,'#0d0f18'],[1,'#0b0c10']]);c.fillRect(X0,HOR+5,X1-X0,cb-HOR);
  {const rh=rng(8);c.strokeStyle=rgba('#05060a',.9);c.lineWidth=1.2;for(let k=0;k<7;k++){const y=HOR+8+k*k*1.6;c.beginPath();c.moveTo(X0,y);for(let x=X0;x<=X1;x+=12)c.lineTo(x,y+Math.sin(x*.02+k)*1.2+rh()*.6);c.stroke();}
    for(let i=0;i<14;i++){const x=300+rh()*800,y=HOR+8+rh()*30;c.fillStyle=rgba('#ffcf86',.5);c.fillRect(x,y,.9,.9);glow(c,x,y,6,'#ffb866',.2);}}
  poles(c,1,POLES.length-1);farm(c);
  // the track beyond the gate, running away over the fields toward the city
  {const gq0=g2(GATE.x0,CROP_D),gq1=g2(GATE.x1,CROP_D),vx=436,vy=HOR+5;c.fillStyle=lin(c,0,vy,0,gq0.y,[[0,rgba('#2a2520',.4)],[1,'#2c261e']]);c.beginPath();c.moveTo(gq0.x+6,gq0.y);c.lineTo(vx-2,vy);c.lineTo(vx+2,vy);c.lineTo(gq1.x-4,gq1.y);c.closePath();c.fill();
    c.strokeStyle=rgba('#c8d4ff',.08);c.lineWidth=.5;c.beginPath();c.moveTo(gq0.x+12,gq0.y);c.lineTo(vx-1,vy);c.moveTo(gq1.x-10,gq1.y);c.lineTo(vx+1,vy);c.stroke();}
  // ---- the clearing: harvested stubble and a dirt farm track, dark and calm
  const fv=[g2(X0,CROP_D+20),g2(X1,CROP_D+20),g2(X1,-110),g2(X0,-110)],TRK=x=>82+Math.sin(x*.012)*5,
    trackPts=(()=>{const pts=[];for(let x=X0-60;x<=270;x+=10)pts.push([x,TRK(x)]);for(let k=1;k<=12;k++){const t=k/12;pts.push([lerp(270,(GATE.x0+GATE.x1)/2,t)+Math.sin(t*3)*6,lerp(TRK(270),CROP_D+16,t)]);}return pts;})(),
    onTrack=(x,d)=>{if(x<275)return Math.abs(d-TRK(x))<20;const t=clamp((d-TRK(270))/(CROP_D+16-TRK(270)),0,1),cx=lerp(270,(GATE.x0+GATE.x1)/2,t)+Math.sin(t*3)*6;return Math.abs(x-cx)<20&&d>70;};
  c.save();poly(c,fv);c.clip();c.save();c.transform(1,0,PSX,-PSY,0,GB);
  c.fillStyle=patAt(c,OutTex.meadow(23,{U:96,sc:3,g0:'#100d0a',g1:'#1d1610',dry:'#2c2418',earth:'#0b0907'}),0,0,1/3);c.fillRect(X0-60,-120,X1-X0+120,FAR+130);
  // the rows the harvester left: furrows running away from us, a shade darker, a ridge of loose earth along each
  {const rr=rng(3);c.lineCap='round';for(let rx=X0+6;rx<X1;rx+=13){const x0=rx+(rr()-.5)*2;c.strokeStyle=rgba('#000000',.05+.1*rr());c.lineWidth=2.6+rr()*1.4;c.beginPath();c.moveTo(x0,-60);c.lineTo(x0+2.2,CROP_D+10);c.stroke();
    c.strokeStyle=rgba('#6e5a3a',.07);c.lineWidth=1.1;c.beginPath();c.moveTo(x0+3.4,-60);c.lineTo(x0+5.6,CROP_D+10);c.stroke();}}
  // the track: in off the left, along the clearing, then bending away up to the gate
  {const tr=rng(5),W2=38,pts=trackPts,N=pts.length,nrm=i=>{const a=pts[Math.max(0,i-1)],b=pts[Math.min(N-1,i+1)],dx=b[0]-a[0],dd=b[1]-a[1],L=Math.hypot(dx,dd)||1;return[-dd/L,dx/L];};
    c.beginPath();for(let i=0;i<N;i++){const [nx,nd]=nrm(i),w=W2*(.92+.16*tr());c.lineTo(pts[i][0]+nx*w/2,pts[i][1]+nd*w/2);}for(let i=N-1;i>=0;i--){const [nx,nd]=nrm(i),w=W2*(.92+.16*tr());c.lineTo(pts[i][0]-nx*w/2,pts[i][1]-nd*w/2);}c.closePath();
    c.fillStyle=patAt(c,OutTex.pathEarth(9,{U:64,sc:4,e0:'#2a2118',e1:'#3e3226',stone:'#5e5644'}),0,0,1/4);c.fill();
    c.strokeStyle=rgba('#000000',.25);c.lineWidth=1;c.stroke();
    // the ruts of a farm truck, holding a little of the sky, and a crown of weeds between them
    c.lineCap='round';for(const off of [-11,11]){const ln=k=>{c.beginPath();for(let i=0;i<N;i++){const [nx,nd]=nrm(i);i?c.lineTo(pts[i][0]+nx*k,pts[i][1]+nd*k):c.moveTo(pts[i][0]+nx*k,pts[i][1]+nd*k);}c.stroke();};
      c.strokeStyle=rgba('#000000',.16);c.lineWidth=7;ln(off);c.strokeStyle=rgba('#000000',.2);c.lineWidth=3;ln(off);c.strokeStyle=rgba('#9aa8c8',.07);c.lineWidth=.7;ln(off+(off<0?-1.8:1.8));}
    {const rc=rng(15);for(let i=0;i<N-1;i++)for(let k=0;k<6;k++){const u=rc(),x=lerp(pts[i][0],pts[i+1][0],u)+(rc()-.5)*6,d=lerp(pts[i][1],pts[i+1][1],u)+(rc()-.5)*4;c.fillStyle=rgba(rc()<.5?'#14140c':'#1c1a10',.7);c.beginPath();c.ellipse(x,d,1.4+rc()*2,.8+rc(),rc()*3,0,TAU);c.fill();}}}
  // a motorcycle's tyres: in off the track, a long curve onto the clearing to where it stands
  {c.lineCap='round';const bx=u=>Math.pow(1-u,3)*-40+3*Math.pow(1-u,2)*u*30+3*(1-u)*u*u*80+u*u*u*148,bd=u=>Math.pow(1-u,3)*86+3*Math.pow(1-u,2)*u*90+3*(1-u)*u*u*140+u*u*u*150;
    const curve=(o)=>{c.beginPath();c.moveTo(-40,86+o);c.bezierCurveTo(30,90+o,80,140+o*.6,148,150+o*.4);};
    for(const o of [0,2]){c.strokeStyle=rgba('#000000',.42);c.lineWidth=2.4;curve(o);c.stroke();}
    c.strokeStyle=rgba('#c8b898',.07);c.lineWidth=.6;curve(-1.3);c.stroke();
    c.strokeStyle=rgba('#000000',.22);c.lineWidth=.5;for(let t=.06;t<1;t+=.03){const x=bx(t),d=bd(t);c.beginPath();c.moveTo(x-.8,d-1);c.lineTo(x+.8,d+1);c.stroke();}
    // dirt thrown up where it turned off the track
    const rd=rng(41);for(let i=0;i<30;i++){const t=.18+rd()*.2,x=bx(t)+(rd()-.5)*10,d=bd(t)+(rd()-.2)*12;c.fillStyle=rgba('#2a2016',.6);c.beginPath();c.ellipse(x,d,.8+rd()*1.4,.6+rd(),rd()*3,0,TAU);c.fill();}}
  c.restore();
  // the night over the clearing: the moon's cold light lying across it from the left, the city's warmth faint on the right, darker near the crop
  c.save();c.globalCompositeOperation='lighter';{const q=g2(MOON.x+40,CROP_D-90);c.fillStyle=rad(c,q.x,q.y,10,560,[[0,rgba('#8ea0c8',.13)],[.5,rgba('#8ea0c8',.045)],[1,rgba('#8ea0c8',0)]]);c.fillRect(X0,ey-60,X1-X0,GB+170-ey);}
    {const q=g2(820,CROP_D-40);c.save();c.translate(q.x,q.y);c.scale(1,.35);c.fillStyle=rad(c,0,0,10,460,[[0,rgba('#ff9a5a',.08)],[1,rgba('#ff9a5a',0)]]);c.beginPath();c.arc(0,0,460,0,TAU);c.fill();c.restore();}c.restore();
  c.restore();
  // ---- the stubble: the stalks cut a hand high along the rows, straw and husk between; none on the track, little where the bike stands
  {const rs=rng(7),cols=['#040306','#0e0b08','#1c150e','#30261a','#4e4230','#7a6c50'],P=cols.map(()=>new Path2D()),tips=new Path2D();
    for(let rx=X0+6;rx<X1;rx+=13){for(let d=-60;d<CROP_D-2;d+=3+rs()*2.8){const x=rx+3.4+(d+60)/(CROP_D+70)*2.2+(rs()-.5)*1.6;if(onTrack(x,d)||rs()<.16)continue;
      const nearBike=Math.hypot(x-150,(d-150)*1.4)<72;if(nearBike&&rs()<.65)continue;
      const q=g2(x,d),h=(2.2+rs()*3.4)*(nearBike?.6:1)*(d<-20?1.5:1),far=clamp(d/CROP_D,0,1),v=rs();let ci=v<.2?1:v<.55?2:v<.85?3:4;if(far>.55&&rs()<.3)ci=Math.min(5,ci+1);
      const lx=q.x+(rs()-.5)*1.4;P[ci].moveTo(q.x,q.y);P[ci].lineTo(lx,q.y-h);if(rs()<.35){P[0].moveTo(q.x+.6,q.y+.4);P[0].lineTo(q.x+2.6,q.y+.3);}
      if(rs()<.3){tips.moveTo(lx-.6,q.y-h);tips.lineTo(lx+.5,q.y-h-.4);}}}
    c.lineCap='round';cols.forEach((col,i)=>{c.strokeStyle=rgba(col,i>=5?.5:.92);c.lineWidth=i>=4?.55:.75;c.stroke(P[i]);});
    c.strokeStyle=rgba('#c8d4ff',.16);c.lineWidth=.45;c.stroke(tips);
    // straw and husk lying about, pale where the moon finds it
    const sp1=new Path2D(),sp2=new Path2D();for(let i=0;i<1100;i++){const x=X0+rs()*(X1-X0),d=-40+rs()*(CROP_D+30);if(onTrack(x,d)&&rs()<.75)continue;if(Math.hypot(x-150,(d-150)*1.4)<60&&rs()<.6)continue;
      const q=g2(x,d),a=(rs()-.5)*1.2+(rs()<.5?0:Math.PI),L=1.6+rs()*3.4,P2=rs()<.72?sp1:sp2;P2.moveTo(q.x,q.y);P2.lineTo(q.x+Math.cos(a)*L,q.y+Math.sin(a)*L*.3);}
    c.strokeStyle=rgba('#6e5e40',.34);c.lineWidth=.45;c.stroke(sp1);c.strokeStyle=rgba('#b8a478',.32);c.lineWidth=.45;c.stroke(sp2);}
  // ---- the crop across the back: maize on the left and in the middle, wheat on the right, the track's gap between
  {const rm=rng(31),mk=()=>({dark:new Path2D(),rim:new Path2D(),warm:new Path2D(),tas:new Path2D()}),Mb=mk(),Mf=mk(),tops=[];
    // the rows behind, lost in the night's haze, then the front rank at the crop's edge
    for(const [d0,front] of [[CROP_D+40,0],[CROP_D+24,0],[CROP_D+8,1]]){const M=front?Mf:Mb;
      for(let x=X0-30;x<WHEAT_X+24;x+=front?5+rm()*5:4+rm()*4){const sh=(d0-CROP_D)*.35;if(x>GAP.x0+sh&&x<GAP.x1+sh)continue;if(rm()<.05){x+=6;continue;}
        const d=d0+rm()*10,q=g2(x,d),tall=rm()<.14?1.12+rm()*.1:rm()<.1?.86:1,h=(80+rm()*24)*tall*(front?1:.98),s=.95+rm()*.25,lean=(rm()-.5)*.55;
        maize(M,rm,q.x,q.y,h,s,lean);if(front)tops.push({x:q.x+lean*h*.14,y:q.y-h});}}
    c.fillStyle='#0c0f17';c.fill(Mb.dark);c.lineCap='round';c.strokeStyle=rgba('#c8d4ff',.12);c.lineWidth=.5;c.stroke(Mb.rim);c.strokeStyle=rgba('#d8cca0',.18);c.lineWidth=.5;c.stroke(Mb.tas);
    c.fillStyle=lin(c,0,cb-120,0,cb,[[0,rgba('#141826',.35)],[1,rgba('#05060a',.5)]]);c.fillRect(X0,cb-120,WHEAT_X+80-X0,124);
    c.fillStyle='#050608';c.fill(Mf.dark);c.strokeStyle=rgba('#c8d4ff',.34);c.lineWidth=.6;c.stroke(Mf.rim);c.strokeStyle=rgba('#ffb070',.13);c.lineWidth=.5;c.stroke(Mf.warm);
    c.strokeStyle=rgba('#e0d2a2',.4);c.lineWidth=.6;c.stroke(Mf.tas);
    // the wheat: thousands of stalks, the ears bowed, the moon on some and the city warming the rest
    const mkW=()=>({stalk:new Path2D(),ear:new Path2D(),awn:new Path2D()}),Wb=mkW(),Wf=mkW();
    for(const [d0,hh,front] of [[CROP_D+34,.95,0],[CROP_D+18,.98,0],[CROP_D+3,1,1]])for(let x=WHEAT_X-6;x<X1+30;x+=1.1+rm()*1.4){const d=d0+rm()*12,q=g2(x,d),swell=.86+.14*Math.sin(x*.035)+.06*Math.sin(x*.11),h=(42+rm()*16)*hh*swell;
      wheat(front?Wf:Wb,rm,q.x,q.y,h);if(front&&rm()<.12)tops.push({x:q.x,y:q.y-h});}
    c.strokeStyle='#0a0907';c.lineWidth=.55;c.stroke(Wb.stalk);c.fillStyle='#3a3122';c.fill(Wb.ear);
    c.fillStyle=lin(c,0,cb-70,0,cb,[[0,rgba('#141826',.25)],[1,rgba('#05060a',.45)]]);c.fillRect(WHEAT_X,cb-70,X1-WHEAT_X+40,74);
    c.strokeStyle='#080705';c.lineWidth=.6;c.stroke(Wf.stalk);c.fillStyle='#4e422c';c.fill(Wf.ear);
    c.save();c.globalCompositeOperation='lighter';c.fillStyle=rgba('#ff9a50',.07);c.fill(Wf.ear);c.restore();
    c.strokeStyle=rgba('#d8c89a',.22);c.lineWidth=.35;c.stroke(Wf.awn);
    // the bases of it all lost in the dark of the field
    c.fillStyle=lin(c,0,cb-46,0,cb+6,[[0,rgba('#05060a',0)],[1,rgba('#05060a',.8)]]);c.fillRect(X0,cb-46,X1-X0,52);
    TOPS=tops.sort((a,b)=>a.x-b.x);}
  // ---- round bales left on the far right of the clearing, wrapped and dark, the moon along their tops
  {const rb=rng(57);for(const [x,d,rr] of [[838,212,44],[786,198,42],[900,200,45]]){const q=g2(x,d),cx=q.x,cy=q.y-rr,len=56;
    c.fillStyle=rgba('#000000',.45);c.beginPath();c.ellipse(cx+12,q.y+1,rr+len*.5,7,0,0,TAU);c.fill();
    // the side toward us is the end of the roll: a disc, its straw spiralling in; the barrel goes back and to the right
    c.fillStyle='#0d0b08';c.beginPath();c.moveTo(cx,cy-rr);c.lineTo(cx+len*.2*PSX/PSX*.5,cy-rr-len*.0);c.arc(cx+len*.5,cy,rr,-Math.PI/2,Math.PI/2);c.lineTo(cx,cy+rr);c.closePath();c.fill();
    c.fillStyle=lin(c,cx-rr,0,cx+rr,0,[[0,'#2a2216'],[.5,'#1c160f'],[1,'#120e0a']]);c.beginPath();c.arc(cx,cy,rr,0,TAU);c.fill();
    c.strokeStyle=rgba('#000000',.4);c.lineWidth=.6;c.beginPath();for(let a=0;a<TAU*5;a+=.2){const r2=rr*(1-a/(TAU*5.4));c.lineTo(cx+Math.cos(a)*r2,cy+Math.sin(a)*r2);}c.stroke();
    c.strokeStyle=rgba('#a8946a',.14);c.lineWidth=.5;c.beginPath();for(let k=0;k<60;k++){const a=rb()*TAU,r1=rb()*rr*.9,l=3+rb()*6;c.moveTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1);c.lineTo(cx+Math.cos(a+.25)*Math.min(rr,r1+l),cy+Math.sin(a+.25)*Math.min(rr,r1+l));}c.stroke();
    c.strokeStyle=rgba('#c8d4ff',.32);c.lineWidth=.8;c.beginPath();c.arc(cx,cy,rr-.5,Math.PI*1.08,Math.PI*1.62);c.stroke();
    c.strokeStyle=rgba('#c8d4ff',.18);c.beginPath();c.moveTo(cx,cy-rr+.4);c.lineTo(cx+len*.5,cy-rr+.4);c.stroke();}}
  // the near pole stands in front of the crop by the gate, its wires going over the tops to the next
  poles(c,0,1,true);
  // ---- the fence along the crop's edge: split posts, two slack wires, the old gate standing open into the gap
  {const rf=rng(13),posts=[];for(let x=X0-20;x<X1+40;x+=34+rf()*10){if(x>GATE.x0-14&&x<GATE.x1+6)continue;posts.push(x);}posts.push(GATE.x0-12,GATE.x1+6);posts.sort((a,b)=>a-b);
    const top=x=>{const q=g2(x,FENCE_D);return{x:q.x,y:q.y};},inGap=x=>x>GATE.x0-13&&x<GATE.x1+5;
    const wires=(h,col,w)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();let prev=null;for(const x of posts){const q=top(x);if(prev!=null&&!(inGap(prev)&&inGap(x))&&!(prev<GATE.x0&&x>GATE.x1)){const pq=top(prev);c.moveTo(pq.x,pq.y-h);c.quadraticCurveTo((pq.x+q.x)/2,(pq.y+q.y)/2-h+2.6,q.x,q.y-h);}prev=x;}c.stroke();};
    wires(12,rgba('#05060a',.9),.6);wires(24,rgba('#05060a',.9),.6);wires(12.6,rgba('#c8d4ff',.12),.35);wires(24.6,rgba('#c8d4ff',.12),.35);
    for(const x of posts){const q=top(x),h=30+rf()*6,lean=(rf()-.5)*3,w=3.4+rf()*1.2;c.fillStyle='#0a0806';c.beginPath();c.moveTo(q.x-w/2,q.y+1);c.lineTo(q.x-w/2+lean,q.y-h);c.lineTo(q.x+w/2+lean,q.y-h+1.2);c.lineTo(q.x+w/2,q.y+1);c.closePath();c.fill();
      c.strokeStyle=rgba('#c8d4ff',.3);c.lineWidth=.6;c.beginPath();c.moveTo(q.x-w/2+.3,q.y);c.lineTo(q.x-w/2+lean+.3,q.y-h);c.stroke();
      c.fillStyle=rgba('#c8d4ff',.2);c.fillRect(q.x-w/2+lean,q.y-h-.4,w,.8);}
    // the gate: five galvanised bars and a brace, rusted, swung back on its hinges into the crop
    {const h0=top(GATE.x0-12),gw=38,gh=24,ang=-.55,ux=Math.cos(ang),uy=Math.sin(ang)*.5;c.lineCap='round';
      const at=(u,v)=>({x:h0.x+3+ux*gw*u,y:h0.y-3-gh*v+uy*gw*u}),bars=()=>{c.beginPath();for(let k=0;k<5;k++){const v=k/4,a=at(0,v),b=at(1,v);c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);}
        const a=at(0,0),b=at(0,1),e=at(1,0),f=at(1,1);c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.moveTo(e.x,e.y);c.lineTo(f.x,f.y);c.moveTo(a.x,a.y);c.lineTo(f.x,f.y);c.stroke();};
      c.strokeStyle='#0e0a08';c.lineWidth=1.6;bars();c.strokeStyle=rgba('#c89060',.2);c.lineWidth=.5;c.save();c.translate(-.3,-.6);bars();c.restore();}}
  // mist lying low over the crop's foot and the clearing's far edge
  haze(c,X0,X1,cb-34,cb+4,'#8a98bc',.1);haze(c,X0,X1,cb+2,cb+44,'#8a98bc',.07,true);
  // ---- the near edge, toward us: weeds and a few broken maize stalks in the corners, dark, catching a little moon
  {const rc=rng(77);c.lineCap='round';
    for(const [cx0,cx1,dens] of [[-150,120,1],[770,1080,1],[120,770,.12]])for(let i=0;i<Math.round(170*dens);i++){const x=cx0+rc()*(cx1-cx0),edge=dens<1?.3:Math.min(1,Math.min(Math.abs(x-cx0),Math.abs(cx1-x))/70),d=-36+rc()*22,q=g2(x,d),h=(10+rc()*26)*(.35+.65*edge)*(dens<1?.5:1),lean=(rc()-.5)*8;
      c.strokeStyle=rc()<.8?'#040406':'#0b0c08';c.lineWidth=.8+rc()*.8;c.beginPath();c.moveTo(q.x,q.y);c.quadraticCurveTo(q.x+lean*.3,q.y-h*.6,q.x+lean,q.y-h);c.stroke();
      if(rc()<.22){c.strokeStyle=rgba('#c8d4ff',.15);c.lineWidth=.35;c.beginPath();c.moveTo(q.x+lean*.6,q.y-h*.75);c.lineTo(q.x+lean,q.y-h);c.stroke();}
      if(dens>=1&&rc()<.12){c.fillStyle='#050506';c.save();c.translate(q.x+lean*.5,q.y-h*.5);c.rotate((rc()-.5)*1.8);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(9,-4,18+rc()*8,4);c.quadraticCurveTo(9,1,0,2);c.closePath();c.fill();c.restore();}}
    // two maize stalks standing in the left corner, close to us, their leaves hanging
    const M={dark:new Path2D(),rim:new Path2D(),warm:new Path2D(),tas:new Path2D()};for(const [x,d,h] of [[-96,-34,128],[-70,-42,112],[1008,-38,120]]){const q=g2(x,d);maize(M,rc,q.x,q.y,h,1.25,(rc()-.5)*.4);}
    c.fillStyle='#030304';c.fill(M.dark);c.strokeStyle=rgba('#c8d4ff',.14);c.lineWidth=.6;c.stroke(M.rim);c.strokeStyle=rgba('#e4d6a8',.25);c.stroke(M.tas);}
  // the dark toward us
  c.fillStyle=lin(c,0,GB-20,0,GB+110,[[0,rgba('#000000',0)],[1,rgba('#000000',.6)]]);c.fillRect(X0,GB-20,X1-X0,130);}
// ---------- what moves: chaff in the moonlight, the wind over the crop tops, fireflies at the crop's edge, the windmill, the tower's light ----------
const CHAFF=(()=>{const r=rng(66),a=[];for(let i=0;i<40;i++)a.push({x:-60+r()*1000,d:10+r()*220,h:8+r()*90,ph:r()*TAU,sp:6+r()*14,bob:2+r()*5,tw:1+r()*3});return a;})();
const FLIES=(()=>{const r=rng(91),a=[];for(let i=0;i<14;i++)a.push({x:-40+r()*980,d:CROP_D-14-r()*30,h:6+r()*26,ph:r()*TAU,sp:.6+r()*1.2,dr:6+r()*12,bl:2+r()*3});return a;})();
function live(){const t=S.t;ctx.save();
  // the windmill's wheel turning slowly in the night wind
  {const a=t*.9,cx=MILL.x,cy=MILL.y;ctx.strokeStyle='#05060a';ctx.lineWidth=.6;ctx.beginPath();for(let k=0;k<12;k++){const b=a+k*TAU/12;ctx.moveTo(cx+Math.cos(b)*2,cy+Math.sin(b)*2);ctx.lineTo(cx+Math.cos(b)*MILL.r,cy+Math.sin(b)*MILL.r);}ctx.stroke();
    ctx.beginPath();ctx.arc(cx,cy,MILL.r,0,TAU);ctx.stroke();ctx.fillStyle='#05060a';ctx.beginPath();ctx.arc(cx,cy,1.6,0,TAU);ctx.fill();
    ctx.strokeStyle=rgba('#c8d4ff',.16);ctx.lineWidth=.4;ctx.beginPath();ctx.arc(cx,cy,MILL.r,Math.PI*1.05,Math.PI*1.6);ctx.stroke();}
  ctx.globalCompositeOperation='lighter';
  // the wind running over the crop: a sheen travelling along the tops, now and again
  if(TOPS&&TOPS.length){const span=1400,cxw=-200+((t*55)%span),half=90;for(const q of TOPS){const k=1-Math.abs(q.x-cxw)/half;if(k<=0)continue;const a=k*k*.28;ctx.fillStyle=rgba('#dfe6ff',a);ctx.fillRect(q.x-2,q.y-1+Math.sin(t*3+q.x*.1)*1.2*k,4,1.1);}}
  // chaff and dust turning over in the moonlight
  for(const p of CHAFF){const x=((p.x+t*p.sp)%1060+1060)%1060-80,q=pp(x,GB,p.d),y=q.y-p.h-Math.sin(t*.8+p.ph)*p.bob,tw=.5+.5*Math.sin(t*p.tw+p.ph);ctx.fillStyle=rgba('#e8e0c8',.14+.22*tw);ctx.fillRect(q.x,y,.9,.9);}
  // fireflies at the crop's edge
  for(const f of FLIES){const x=f.x+Math.sin(t*f.sp*.4+f.ph)*f.dr,d=f.d+Math.cos(t*f.sp*.3+f.ph*1.7)*f.dr*.4,q=pp(x,GB,d),y=q.y-f.h-Math.sin(t*f.sp+f.ph)*3,b=Math.pow(Math.max(0,Math.sin(t*f.bl+f.ph)),3);
    if(b<.02)continue;glow(ctx,q.x,y,7,'#c8ff7a',.5*b);ctx.fillStyle=rgba('#f0ffd0',.9*b);ctx.fillRect(q.x-.5,y-.5,1,1);}
  // the red light on the tower's needle
  {const h=TOWER.base-TOWER.top,x=TOWER.x,y=TOWER.top-h*.2,on=Math.pow(Math.max(0,Math.sin(t*2.4)),8);if(on>.02){glow(ctx,x,y,9,'#ff3a2a',.8*on);ctx.fillStyle=rgba('#ffd0c0',on);ctx.fillRect(x-.6,y-.6,1.2,1.2);}}
  ctx.restore();}
// the light that rims a fighter: the moon over the left of the sky
function light(f){return{light:{x:MOON.x-f.dep*PSX,y:MOON.y+f.dep*PSY}};}
E.S.crops={paint,live,light,div:it=>it.dv.mat==='plank'&&typeof EnvProps!=='undefined'?EnvProps.plankFence(it,'rustic'):false,table:()=>typeof EnvProps!=='undefined'?EnvProps.fieldTable('rustic'):false};
})();
// ===== ENV CROPS END =====
