// ===== ENV LEDGE =====
// Broken Ledge (a proposal): a terrace of the old elven town, high over the city. On the left the terrace still stands, paved in pale
// elven limestone with brass let into the joints, a balustrade along its far edge with the gold vine inlaid in the rail, an elven lamp
// still burning at its corner and a brazier lit for the meeting. On the right it has fallen: a slope of broken slabs and earth down to
// the turf of the lower ground, a column stump, a watchman's lantern on an iron staff. Beyond and below, the city at night: roofs and
// streets in lights, Lamplight Street's lamps in a line, the Hallowell tower with its ring of cyan light.
(()=>{const E=EnvLook,{C,pp,poly,line,lin,rad,rgba,mix,glow,beam,haze,vine,scroll,stars,moon,cloudBank,hallTower,rng,lerp,clamp,TAU}=E;
const TX=()=>EnvTex,TB=()=>EnvTexB;
const FAR=278,HZ=168;
const gr=x=>S.arena&&S.arena.ground?S.arena.ground(x,0):GB;
// a texture laid from (x, y), u units to a texture pixel, turned rot degrees
function patAt(c,cv,x,y,u,rot){const p=c.createPattern(cv,'repeat');if(p.setTransform){let m=new DOMMatrix().translate(x,y);if(rot)m=m.rotate(rot);p.setTransform(m.scale(u));}return p;}
// draw in the ground plane at height g: (x, depth) -> screen
function plane(c,g){c.transform(1,0,PSX,-PSY,0,g);}
// the lights: an elven lamp at the terrace's corner, a brazier by the balustrade, a watchman's lantern on the lower ground
// (world x, height of the flame above the ground, depth)
const LIGHTS=[{x:24,h:64,d:262,k:'lamp'},{x:322,h:24,d:246,k:'brazier'},{x:772,h:42,d:238,k:'lantern'}];
const lightAt=L=>pp(L.x,gr(L.x)-L.h,L.d);
// ---------- the city below ----------
// a band of roofs on a base line seen from high above: small blocks, pitched roofs, windows lit, lamps along the street at its foot
function cityBand(c,x0,x1,base,o){const r=rng(o.seed),sc=o.sc;let x=x0;
  while(x<x1){const w=(5+r()*13)*sc,h=(3+Math.pow(r(),1.5)*14)*sc,top=base-h;c.fillStyle=o.col;c.fillRect(x,top,w+.6,h+2);
    const k=r();if(k<.35){c.beginPath();c.moveTo(x-.3,top+.2);c.lineTo(x+w/2,top-w*.32);c.lineTo(x+w+.3,top+.2);c.fill();}else if(k<.42){c.beginPath();c.arc(x+w/2,top,w/2,Math.PI,0);c.fill();}
    if(o.rim){c.fillStyle=rgba(o.rim,.18);c.fillRect(x,top,w,.5*sc+.2);}
    const nw=Math.max(1,Math.floor(w*h/(10*sc*sc)*o.dens));for(let i=0;i<nw;i++){if(r()>.4)continue;c.fillStyle=rgba(r()<.86?'#ffcf86':'#dbe9ff',(.3+.55*r())*o.lit);const s=.55*sc+.35;c.fillRect(x+.5+r()*(w-1),top+.6+r()*(h-1.4),s,s);}
    x+=w+(r()<.18?r()*5*sc:0);}
  if(o.lamps){for(let lx=x0+r()*o.lamps;lx<x1;lx+=o.lamps*(.75+r()*.5)){c.fillStyle=rgba('#ffe2b0',.85*o.lit);c.fillRect(lx,base+.6,.7*sc+.4,.7*sc+.4);glow(c,lx,base+1,3.5*sc+2,'#ffb866',.22*o.lit);}}
  if(o.haze)haze(c,x0,x1,base-o.haze,base+2,o.hazeCol||'#3a2a34',o.hazeA||.4);}
// Lamplight Street seen from up here: a long straight line of lamps, warm, a tram's lit windows on it
function lamplight(c,x0,x1,y,sc){c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,0,y-3,0,y+3,[[0,rgba('#ffb866',0)],[.5,rgba('#ffb866',.22)],[1,rgba('#ffb866',0)]]);c.fillRect(x0,y-3,x1-x0,6);c.restore();
  for(let x=x0,i=0;x<x1;x+=9*sc,i++){c.fillStyle=rgba('#fff0cc',.95);c.fillRect(x,y-.5,1.1,1.1);glow(c,x+.5,y,5,'#ffc070',.35);}
  const tx=x0+(x1-x0)*.62;c.fillStyle='#0c0a10';c.fillRect(tx,y-2.6,14*sc,2.4);c.fillStyle=rgba('#ffe0a8',.85);for(let k=0;k<5;k++)c.fillRect(tx+1+k*2.6*sc,y-2.1,1.4*sc,1);}
// ---------- stone things ----------
// the balustrade along the terrace's far edge: a plinth, vase balusters, piers with caps and urns, a rail with the gold vine inlaid;
// broken out where the gaps are. In screen units at depth d on ground g
function balustrade(c,x0,x1,d,g,gaps,seed){const base=g-d*PSY,sx=x=>x+d*PSX,r=rng(seed),stone=TX().granite(61,96,96,{base:'#7a7468'});
  const inGap=x=>gaps.some(([a,b])=>x>a&&x<b);
  const fillStone=(dark)=>{c.fillStyle=patAt(c,stone,0,0,.25);c.fill();c.fillStyle=rgba('#07060c',dark);c.fill();};
  // the plinth, broken where the gaps are
  const runs=[];{let a=x0;for(const [ga,gb] of gaps.slice().sort((p,q)=>p[0]-q[0])){if(ga>a)runs.push([a,ga]);a=Math.max(a,gb);}if(a<x1)runs.push([a,x1]);}
  for(const [a,b] of runs){c.beginPath();c.rect(sx(a),base-5,b-a,5);fillStone(.62);c.fillStyle=rgba(C.rim,.16);c.fillRect(sx(a),base-5,b-a,.6);}
  // balusters
  for(let x=x0+4;x<x1-2;x+=5.6){if(inGap(x))continue;const bx=sx(x),y0=base-5,y1=base-27,h=y0-y1;if(r()<.05)continue;
    c.beginPath();c.moveTo(bx-1.7,y0);c.lineTo(bx-1.7,y0-2);c.quadraticCurveTo(bx-2.6,y0-h*.3,bx-1.9,y0-h*.5);c.quadraticCurveTo(bx-.7,y0-h*.68,bx-.8,y0-h*.8);c.lineTo(bx-1.6,y0-h*.86);c.lineTo(bx-1.6,y1);
    c.lineTo(bx+1.6,y1);c.lineTo(bx+1.6,y0-h*.86);c.lineTo(bx+.8,y0-h*.8);c.quadraticCurveTo(bx+.7,y0-h*.68,bx+1.9,y0-h*.5);c.quadraticCurveTo(bx+2.6,y0-h*.3,bx+1.7,y0-2);c.lineTo(bx+1.7,y0);c.closePath();
    fillStone(.66);c.fillStyle=rgba('#c8d4ff',.14);c.fillRect(bx-1.8,y0-h*.62,.5,h*.3);}
  // the rail, with the vine let into its face
  for(const [a,b] of runs){const ra=a+(a>x0?r()*3:0),rb=b-(b<x1?r()*3:0);c.beginPath();c.moveTo(sx(ra),base-33);c.lineTo(sx(rb),base-33);c.lineTo(sx(rb)-(b<x1?2:0),base-27);c.lineTo(sx(ra)+(a>x0?1.5:0),base-27);c.closePath();fillStone(.58);
    c.fillStyle=rgba(C.rim,.32);c.fillRect(sx(ra),base-33,rb-ra,.7);c.fillStyle=rgba('#000000',.45);c.fillRect(sx(ra),base-27.6,rb-ra,.6);
    if(rb-ra>16)vine(c,[{x:sx(ra)+3,y:base-30},{x:sx(rb)-3,y:base-30}],{w:.45,amp:.9,wave:8,leaf:1.3,every:2,seed:seed+a|0,col:rgba(C.gold,.8)});}
  // the piers: stone blocks with a cap, an urn on some
  for(let x=x0+2,i=0;x<x1;x+=54,i++){if(inGap(x+5))continue;const px=sx(x);c.beginPath();c.rect(px-4.5,base-38,9,38);fillStone(.6);
    c.fillStyle=rgba('#c8d4ff',.16);c.fillRect(px-4.5,base-38,.6,38);c.fillStyle=rgba('#000000',.35);c.fillRect(px+3.9,base-38,.6,38);
    c.beginPath();c.rect(px-6,base-41,12,3.4);fillStone(.5);c.fillStyle=rgba(C.rim,.3);c.fillRect(px-6,base-41,12,.6);
    if(i%2===0){c.beginPath();c.moveTo(px-3,base-41);c.quadraticCurveTo(px-5.5,base-47,px-2.4,base-51);c.lineTo(px-1.2,base-53.5);c.lineTo(px+1.2,base-53.5);c.lineTo(px+2.4,base-51);c.quadraticCurveTo(px+5.5,base-47,px+3,base-41);c.closePath();fillStone(.55);
      c.fillStyle=rgba(C.gold,.6);c.fillRect(px-4.2,base-46.4,8.4,.6);}}}
// a vase baluster fallen on its side, lying on the ground at (x, d)
function fallenBaluster(c,x,g,d,ang,seed){const q=pp(x,g,d),stone=TX().granite(61,96,96,{base:'#7a7468'});c.save();c.translate(q.x,q.y-1.4);c.rotate(ang);
  c.beginPath();c.moveTo(-11,-1.7);c.lineTo(-9,-1.7);c.quadraticCurveTo(-6,-2.6,-2,-1.9);c.quadraticCurveTo(2,-.7,4,-.8);c.lineTo(5,-1.6);c.lineTo(11,-1.6);c.lineTo(11,1.6);c.lineTo(5,1.6);c.lineTo(4,.8);c.quadraticCurveTo(2,.7,-2,1.9);c.quadraticCurveTo(-6,2.6,-9,1.7);c.lineTo(-11,1.7);c.closePath();
  c.fillStyle=patAt(c,stone,0,0,.25);c.fill();c.fillStyle=rgba('#07060c',.6);c.fill();c.fillStyle=rgba(C.rim,.18);c.fillRect(-11,-1.8,22,.5);c.restore();
  c.fillStyle=rgba('#000000',.4);c.beginPath();c.ellipse(q.x,q.y+.3,11,1.6,0,0,TAU);c.fill();}
// a slab of paving broken loose, tilted: its top face, its thickness; at (x on ground g, depth d), w by l units, turned
function slab(c,x,g,d,w,l,ang,tilt,seed){const r=rng(seed),pv=TB().paving(21,{L:44,D:30,cols:4,rows:6});const cs=Math.cos(ang),sn=Math.sin(ang),pts=[];
  for(const [u,v] of [[-w/2,-l/2],[w/2,-l/2],[w/2,l/2],[-w/2,l/2]]){const jx=(r()-.5)*2,jd=(r()-.5)*2,X=x+u*cs-v*sn+jx,D=d+u*sn+v*cs+jd,lift=tilt*(u/w);pts.push(pp(X,g-Math.max(0,lift),D));}
  const th=2+r()*2;c.beginPath();c.moveTo(pts[0].x,pts[0].y+th);c.lineTo(pts[1].x,pts[1].y+th);c.lineTo(pts[2].x,pts[2].y+th);c.lineTo(pts[3].x,pts[3].y+th);c.closePath();c.fillStyle='#0b0a0c';c.fill();
  c.beginPath();c.moveTo(pts[0].x,pts[0].y);for(const q of pts.slice(1))c.lineTo(q.x,q.y);c.closePath();c.fillStyle=patAt(c,pv,pts[0].x,pts[0].y,.2,ang*57);c.fill();c.fillStyle=rgba('#06050a',.5+r()*.15);c.fill();
  c.strokeStyle=rgba(C.rim,.22);c.lineWidth=.5;c.beginPath();c.moveTo(pts[3].x,pts[3].y);c.lineTo(pts[2].x,pts[2].y);c.stroke();}
// a column drum of the old town, fluted, a band of the vine round its neck: standing and broken off, or fallen on its side
function columnStump(c,x,g,d,h,seed){const q=pp(x,g,d),r=rng(seed),stone=TX().granite(62,96,96,{base:'#827a6e'}),rr=9;
  c.fillStyle=rgba('#000000',.45);c.beginPath();c.ellipse(q.x+2,q.y,rr+5,3,0,0,TAU);c.fill();
  c.beginPath();c.rect(q.x-rr-2,q.y-6,2*rr+4,6);c.fillStyle=patAt(c,stone,0,0,.25);c.fill();c.fillStyle=rgba('#07060c',.6);c.fill();
  // the shaft, broken in a jagged line at the top
  const top=q.y-6-h;c.beginPath();c.moveTo(q.x-rr,q.y-6);let px=q.x-rr;c.lineTo(px,top+r()*6);for(let k=1;k<=6;k++){px=q.x-rr+k*2*rr/6;c.lineTo(px,top+r()*9-(k===3?4:0));}c.lineTo(q.x+rr,q.y-6);c.closePath();
  c.fillStyle=patAt(c,stone,0,0,.25);c.fill();c.fillStyle=lin(c,q.x-rr,0,q.x+rr,0,[[0,rgba('#07060c',.4)],[.35,rgba('#07060c',.52)],[1,rgba('#07060c',.82)]]);c.fill();
  c.save();c.clip();c.strokeStyle=rgba('#000000',.4);c.lineWidth=.6;c.beginPath();for(let k=-3;k<=3;k++){const fx=q.x+k*rr/3.6;c.moveTo(fx,top);c.lineTo(fx,q.y-6);}c.stroke();
  c.fillStyle=rgba(C.gold,.55);c.fillRect(q.x-rr,q.y-14,2*rr,.8);c.restore();c.fillStyle=rgba('#c8d4ff',.2);c.fillRect(q.x-rr,top+6,.7,h-6);}
function fallenDrum(c,x,g,d,seed){const q=pp(x,g,d),stone=TX().granite(62,96,96,{base:'#827a6e'}),L=30,R=8.5;
  c.fillStyle=rgba('#000000',.45);c.beginPath();c.ellipse(q.x+L/2,q.y+1,L/2+8,3,0,0,TAU);c.fill();
  c.beginPath();c.moveTo(q.x,q.y-2*R);c.lineTo(q.x+L,q.y-2*R);c.lineTo(q.x+L,q.y);c.lineTo(q.x,q.y);c.closePath();c.fillStyle=patAt(c,stone,0,0,.25);c.fill();
  c.fillStyle=lin(c,0,q.y-2*R,0,q.y,[[0,rgba('#07060c',.4)],[.4,rgba('#07060c',.55)],[1,rgba('#07060c',.85)]]);c.fill();
  c.strokeStyle=rgba('#000000',.35);c.lineWidth=.5;c.beginPath();for(let k=1;k<6;k++){const y=q.y-2*R+k*2*R/6;c.moveTo(q.x,y);c.lineTo(q.x+L,y);}c.stroke();
  c.beginPath();c.ellipse(q.x+L,q.y-R,3.4,R,0,0,TAU);c.fillStyle=patAt(c,stone,0,0,.25);c.fill();c.fillStyle=rgba('#07060c',.45);c.fill();
  c.fillStyle=rgba(C.gold,.5);c.fillRect(q.x+L-6,q.y-2*R,.8,2*R);}
// weeds: thin dark blades with a pale tip where the light finds them
function weeds(c,x,y,n,h,seed){const r=rng(seed);c.save();c.lineCap='round';for(let i=0;i<n;i++){const bx=x+(r()-.5)*n*1.6,bh=h*(.5+r()*.6),lean=(r()-.5)*bh*.6;c.strokeStyle=mix('#141c10','#2c3a1c',r());c.lineWidth=.6+r()*.5;
  c.beginPath();c.moveTo(bx,y);c.quadraticCurveTo(bx+lean*.3,y-bh*.6,bx+lean,y-bh);c.stroke();}c.restore();}
// the remains of an arched gateway on the terrace: two slender columns, the arch broken off halfway, the vine inlaid along its face
function brokenArch(c,xa,xb,g,d,h){const stone=TX().granite(62,96,96,{base:'#827a6e'}),A=pp(xa,g,d),B=pp(xb,g,d),cx=(A.x+B.x)/2,R=(B.x-A.x)/2,spring=A.y-h;
  const col=(q,hh,broken)=>{c.beginPath();c.rect(q.x-6,q.y-6,12,6);c.fillStyle=patAt(c,stone,0,0,.25);c.fill();c.fillStyle=rgba('#07060c',.6);c.fill();
    c.beginPath();c.moveTo(q.x-3.6,q.y-6);c.lineTo(q.x-3,q.y-hh);if(broken){c.lineTo(q.x-1,q.y-hh-4);c.lineTo(q.x+.6,q.y-hh+1);c.lineTo(q.x+2.2,q.y-hh-2);}c.lineTo(q.x+3,q.y-hh);c.lineTo(q.x+3.6,q.y-6);c.closePath();
    c.fillStyle=patAt(c,stone,0,0,.25);c.fill();c.fillStyle=lin(c,q.x-4,0,q.x+4,0,[[0,rgba('#07060c',.45)],[1,rgba('#07060c',.85)]]);c.fill();c.fillStyle=rgba('#c8d4ff',.18);c.fillRect(q.x-3.5,q.y-hh+4,.6,hh-10);
    if(!broken){c.beginPath();c.rect(q.x-5.5,q.y-hh-4,11,4);c.fillStyle=patAt(c,stone,0,0,.25);c.fill();c.fillStyle=rgba('#07060c',.55);c.fill();c.fillStyle=rgba(C.rim,.3);c.fillRect(q.x-5.5,q.y-hh-4,11,.6);}
    vine(c,[{x:q.x,y:q.y-8},{x:q.x,y:q.y-hh*.55}],{w:.45,amp:1.2,wave:10,leaf:1.4,every:2,seed:q.x|0,col:rgba(C.gold,.75)});};
  col(A,h,false);col(B,h*.62,true);
  {const q=pp(xb+14,g,d-14);c.save();c.translate(q.x,q.y-3);c.rotate(.3);c.beginPath();c.moveTo(-5,-3);c.lineTo(5,-4);c.lineTo(6,3);c.lineTo(-6,3);c.closePath();c.fillStyle=patAt(c,stone,0,0,.25);c.fill();c.fillStyle=rgba('#07060c',.62);c.fill();c.fillStyle=rgba(C.rim,.25);c.fillRect(-5,-3.6,10,.5);c.restore();}
  // the arch: voussoirs from the left column's capital, the ring broken off a little past the crown
  const a0=Math.PI,a1=Math.PI*1.56,ri=R-4,ro=R+7;c.beginPath();c.arc(cx,spring-4,ro,a0,a1);{const e=a1,m=(ri+ro)/2;c.lineTo(cx+Math.cos(e+.05)*m,spring-4+Math.sin(e+.05)*m+2);c.lineTo(cx+Math.cos(e-.02)*(m-2),spring-4+Math.sin(e-.02)*(m-2)-1);c.lineTo(cx+Math.cos(e+.03)*ri,spring-4+Math.sin(e+.03)*ri+1.5);}c.arc(cx,spring-4,ri,a1,a0,true);c.closePath();
  c.fillStyle=patAt(c,stone,0,0,.25);c.fill();c.fillStyle=rgba('#07060c',.6);c.fill();
  c.strokeStyle=rgba('#000000',.5);c.lineWidth=.5;c.beginPath();for(let k=1;k<8;k++){const t=a0+(a1-a0)*k/8;c.moveTo(cx+Math.cos(t)*ri,spring-4+Math.sin(t)*ri);c.lineTo(cx+Math.cos(t)*ro,spring-4+Math.sin(t)*ro);}c.stroke();
  c.strokeStyle=rgba(C.rim,.3);c.lineWidth=.6;c.beginPath();c.arc(cx,spring-4,ro,a0,a1);c.stroke();
  const vp=[];for(let k=0;k<=12;k++){const t=a0+(a1-a0-.08)*k/12;vp.push({x:cx+Math.cos(t)*(R+1),y:spring-4+Math.sin(t)*(R+1)});}vine(c,vp,{w:.45,amp:.8,wave:8,leaf:1.3,every:2,seed:7,col:rgba(C.gold,.8)});}
// low courses of a fallen house's foundations on the lower ground
function foundation(c,x0,x1,g,d,h,seed){const q0=pp(x0,g,d),q1=pp(x1,g,d),r=rng(seed);c.beginPath();c.moveTo(q0.x,q0.y);let x=q0.x;c.lineTo(x,q0.y-h*(.6+r()*.4));while(x<q1.x){x=Math.min(q1.x,x+4+r()*8);c.lineTo(x,q0.y-h*(.3+r()*.7));}c.lineTo(q1.x,q1.y);c.closePath();
  c.fillStyle=patAt(c,TB().ashlar(11,{bh:8,bl:16}),0,0,.25);c.fill();c.fillStyle=rgba('#07060c',.62);c.fill();}
// ---------- the lights' fixtures ----------
function elvenLamp(c,L){const g=gr(L.x),b=pp(L.x,g,L.d),top=b.y-L.h-8,stone=TX().granite(61,96,96,{base:'#7a7468'});
  c.beginPath();c.rect(b.x-5,b.y-8,10,8);c.fillStyle=patAt(c,stone,0,0,.25);c.fill();c.fillStyle=rgba('#07060c',.6);c.fill();
  c.beginPath();c.moveTo(b.x-2.6,b.y-8);c.lineTo(b.x-1.8,top+14);c.lineTo(b.x+1.8,top+14);c.lineTo(b.x+2.6,b.y-8);c.closePath();c.fillStyle=patAt(c,stone,0,0,.25);c.fill();c.fillStyle=lin(c,b.x-2.6,0,b.x+2.6,0,[[0,rgba('#07060c',.5)],[1,rgba('#07060c',.85)]]);c.fill();
  vine(c,[{x:b.x,y:b.y-10},{x:b.x,y:top+18}],{w:.5,amp:1.4,wave:11,leaf:1.6,every:2,seed:L.x|0,col:C.gold});
  c.fillStyle='#0a090d';c.fillRect(b.x-4,top+12,8,3);scroll(c,b.x-3,top+16,2.4,-1,C.gold,.5,1.2);scroll(c,b.x+3,top+16,2.4,1,C.gold,.5,1.2);
  c.fillStyle='#0a090d';c.beginPath();c.moveTo(b.x-5,top+2);c.lineTo(b.x,top-4);c.lineTo(b.x+5,top+2);c.closePath();c.fill();c.fillStyle=C.gold;c.fillRect(b.x-.5,top-7,1,3);
  c.fillStyle=lin(c,0,top+2,0,top+12,[[0,'#fff6dc'],[1,'#ffc272']]);c.beginPath();c.moveTo(b.x-4.4,top+2);c.lineTo(b.x+4.4,top+2);c.lineTo(b.x+3.4,top+12);c.lineTo(b.x-3.4,top+12);c.closePath();c.fill();
  c.strokeStyle='#0a090d';c.lineWidth=.6;c.beginPath();c.moveTo(b.x,top+2);c.lineTo(b.x,top+12);c.stroke();}
function brazier(c,L){const g=gr(L.x),b=pp(L.x,g,L.d),top=b.y-L.h+4;
  c.fillStyle=rgba('#000000',.5);c.beginPath();c.ellipse(b.x+1,b.y,12,2.6,0,0,TAU);c.fill();
  c.strokeStyle='#0a090c';c.lineWidth=1.5;c.lineCap='round';c.beginPath();for(const dx of [-8,0,8]){c.moveTo(b.x+dx,b.y);c.lineTo(b.x+dx*.35,top+4);}c.stroke();
  c.fillStyle=lin(c,b.x-10,0,b.x+10,0,[[0,'#0a090c'],[.6,'#1c1a20'],[1,'#08070a']]);c.beginPath();c.moveTo(b.x-10,top);c.quadraticCurveTo(b.x,top+10,b.x+10,top);c.closePath();c.fill();
  c.fillStyle=rgba(C.rim,.5);c.fillRect(b.x-10,top-.4,20,.8);c.fillStyle='#ff8a3c';c.beginPath();c.ellipse(b.x,top,8.6,1.6,0,0,TAU);c.fill();c.fillStyle='#ffd27a';c.beginPath();c.ellipse(b.x,top,5,.9,0,0,TAU);c.fill();}
function staffLantern(c,L){const g=gr(L.x),b=pp(L.x,g,L.d),top=b.y-L.h-12;
  c.strokeStyle='#0a090c';c.lineWidth=1.6;c.beginPath();c.moveTo(b.x,b.y);c.lineTo(b.x,top);c.lineTo(b.x+7,top);c.stroke();c.lineWidth=.6;c.beginPath();c.moveTo(b.x+7,top);c.lineTo(b.x+7,top+4);c.stroke();
  c.strokeStyle=rgba(C.rim,.4);c.lineWidth=.5;c.beginPath();c.moveTo(b.x+.8,b.y-2);c.lineTo(b.x+.8,top+2);c.stroke();
  c.fillStyle='#0a090c';c.beginPath();c.moveTo(b.x+3.5,top+5);c.lineTo(b.x+7,top+3);c.lineTo(b.x+10.5,top+5);c.fill();
  c.fillStyle=lin(c,0,top+5,0,top+13,[[0,'#fff3d2'],[1,'#ffb259']]);c.fillRect(b.x+4,top+5,6,8);c.fillStyle='#0a090c';c.fillRect(b.x+3.5,top+13,7,1.4);c.fillRect(b.x+6.6,top+5,.8,8);
  c.fillStyle=rgba('#000000',.4);c.beginPath();c.ellipse(b.x+1,b.y,5,1.2,0,0,TAU);c.fill();}
// ---------- the scene ----------
function paint(c){
  const X0=-160,X1=W+240,T0=-110,r=rng(7),gT=gr(0),yT=gT-FAR*PSY,yL=GB-FAR*PSY;
  // the night sky, warmer down toward the city's glow
  c.fillStyle=lin(c,0,T0,0,HZ+24,[[0,C.night0],[.32,'#080b16'],[.6,'#131527'],[.82,'#271c2a'],[1,'#47302c']]);c.fillRect(X0,T0,X1-X0,HZ+24-T0);
  stars(c,X0,X1,T0,HZ-30,180,13,.65);
  moon(c,150,62,13,{phase:.42});
  cloudBank(c,X0,X1,92,30,{seed:9,n:16,col:'#161624',under:'#ff9a5a'});
  glow(c,690,HZ+10,460,'#ff9a5a',.14,.32);
  // the far hills across the valley, low against the glow
  c.fillStyle='#100d16';c.beginPath();c.moveTo(X0,HZ+4);for(let x=X0;x<=X1;x+=8){const y=HZ-4-6*Math.sin(x*.011)-4*Math.sin(x*.031+1)-3*Math.sin(x*.07);c.lineTo(x,y);}c.lineTo(X1,HZ+30);c.lineTo(X0,HZ+30);c.closePath();c.fill();
  // the city below: roofs in bands from far to near, the tower rising out of it, Lamplight Street's lamps in a line
  c.fillStyle=lin(c,0,HZ,0,yL+20,[[0,'#1a1420'],[1,'#120d14']]);c.fillRect(X0,HZ,X1-X0,yL+20-HZ);
  cityBand(c,X0,X1,HZ+5,{seed:31,sc:.32,col:'#1c1622',dens:2.2,lit:.8,lamps:7,haze:6,hazeA:.5});
  cityBand(c,X0,X1,HZ+13,{seed:32,sc:.45,col:'#1a1420',dens:2,lit:.85,lamps:9,haze:8,hazeA:.45});
  cityBand(c,X0,X1,HZ+24,{seed:33,sc:.6,col:'#18121c',dens:1.8,lit:.9,lamps:12,haze:9,hazeA:.4,rim:'#ffb866'});
  hallTower(c,730,HZ+32,74,27,{lit:.95});
  cityBand(c,X0,X1,HZ+38,{seed:34,sc:.78,col:'#150f19',dens:1.6,lit:.95,lamps:15,haze:10,hazeA:.35,rim:'#ffb866'});
  lamplight(c,520,X1,HZ+46,.9);
  cityBand(c,X0,X1,HZ+60,{seed:35,sc:1,col:'#120d16',dens:1.4,lit:1,lamps:19,haze:12,hazeA:.3,rim:'#ffb866'});
  cityBand(c,X0,X1,HZ+84,{seed:36,sc:1.25,col:'#0f0b13',dens:1.2,lit:1,lamps:24,haze:14,hazeA:.3,rim:'#ffb866'});
  cityBand(c,X0,X1,HZ+108,{seed:37,sc:1.5,col:'#0d0a11',dens:1,lit:1,lamps:28,haze:16,hazeA:.3,rim:'#ffb866'});
  // the warm haze the city breathes up, and the mist that sits in the drop below the terrace
  haze(c,X0,X1,HZ-10,yL+10,'#5a3a3a',.18,true);haze(c,X0,X1,yT-30,yL+6,'#2a2030',.35);
  // ---- the lower ground on the right, where the terrace fell: turf and earth
  {const g=GB,q=[pp(470,g,FAR),pp(X1,g,FAR),pp(X1,g,-100),pp(470,g,-100)];c.save();poly(c,q);c.clip();
    c.save();plane(c,g);c.fillStyle=patAt(c,TB().turf(5,{}),0,0,.25);c.fillRect(470,-100,X1-470,FAR+100);c.restore();
    c.fillStyle=lin(c,0,yL,0,GB+80,[[0,rgba('#06070e',.6)],[1,rgba('#05060c',.7)]]);c.fillRect(X0,yL-10,X1-X0,GB+120-yL);c.restore();
    // its far edge, where it falls away: a broken kerb of the old lower terrace, stumps of balusters, grass hanging over
    const stone=TX().granite(61,96,96,{base:'#7a7468'});
    for(let x=505;x<X1;x+=9+r()*14){if(r()<.28)continue;const w=6+r()*12,q0=pp(x,g,FAR-2),h=2+r()*4;c.beginPath();c.moveTo(q0.x,q0.y);c.lineTo(q0.x+w,q0.y);c.lineTo(q0.x+w-1,q0.y-h);c.lineTo(q0.x+1,q0.y-h-r()*2);c.closePath();
      c.fillStyle=patAt(c,stone,0,0,.25);c.fill();c.fillStyle=rgba('#07060c',.62);c.fill();c.fillStyle=rgba(C.rim,.22);c.fillRect(q0.x+1,q0.y-h,w-2,.5);
      if(r()<.3){const bx=q0.x+w/2;c.beginPath();c.moveTo(bx-1.6,q0.y-h);c.quadraticCurveTo(bx-2.4,q0.y-h-5,bx-1.2,q0.y-h-8-r()*4);c.lineTo(bx+1.2,q0.y-h-7);c.quadraticCurveTo(bx+2.4,q0.y-h-5,bx+1.6,q0.y-h);c.closePath();c.fillStyle=patAt(c,stone,0,0,.25);c.fill();c.fillStyle=rgba('#07060c',.66);c.fill();}
      weeds(c,q0.x+w*.5,q0.y-h+.5,5,6,x|0);}
    foundation(c,800,880,g,262,12,3);foundation(c,890,960,g,248,9,4);columnStump(c,650,g,268,34,5);
    fallenDrum(c,548,g,214,6);
    for(const [x,d,a] of [[600,190,.4],[690,226,-.3],[860,200,.9]])fallenBaluster(c,x,g,d,a,x);}
  // ---- the terrace on the left: paving in the plane, its broken right-hand edge jagged
  const edge=d=>{const k=Math.floor((d+100)/9),rr=rng(1000+k)();return 433+rr*12-(Math.sin(d*.05)*3);};
  {const g=gT;c.save();c.beginPath();for(let d=-100;d<=FAR;d+=9){const q=pp(edge(d),g,d);d===-100?c.moveTo(q.x,q.y):c.lineTo(q.x,q.y);}
    {const a=pp(X0,g,FAR),b=pp(X0,g,-100);c.lineTo(a.x,a.y);c.lineTo(b.x,b.y);}c.closePath();c.clip();
    c.save();plane(c,g);c.fillStyle=patAt(c,TB().paving(21,{L:44,D:30,cols:4,rows:6}),0,0,.2);c.fillRect(X0,-100,600,FAR+100);c.restore();
    c.fillStyle=lin(c,0,yT,0,gT+90,[[0,rgba('#06070e',.66)],[1,rgba('#05060c',.72)]]);c.fillRect(X0,yT-10,700,gT+120-yT);c.restore();
    // the slabs' broken edge: their thickness showing along the break
    c.fillStyle='#0e0c10';c.beginPath();for(let d=-100;d<=FAR;d+=9){const q=pp(edge(d),g,d);d===-100?c.moveTo(q.x,q.y):c.lineTo(q.x,q.y);}for(let d=FAR;d>=-100;d-=9){const q=pp(edge(d)+1.5,g+5,d);c.lineTo(q.x,q.y);}c.closePath();c.fill();
    c.strokeStyle=rgba(C.rim,.28);c.lineWidth=.6;c.beginPath();for(let d=-100;d<=FAR;d+=9){const q=pp(edge(d),g,d);d===-100?c.moveTo(q.x,q.y):c.lineTo(q.x,q.y);}c.stroke();
    // the terrace's far edge: a coping stone, then the drop
    const stone=TX().granite(61,96,96,{base:'#7a7468'}),a=pp(X0,g,FAR),b=pp(edge(FAR),g,FAR);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineTo(b.x,b.y+4);c.lineTo(a.x,a.y+4);c.closePath();c.fillStyle=patAt(c,stone,0,0,.25);c.fill();c.fillStyle=rgba('#07060c',.55);c.fill();
    c.fillStyle=rgba(C.rim,.35);c.fillRect(a.x,a.y,b.x-a.x,.7);
    balustrade(c,X0+4,edge(FAR-6)-4,FAR-6,g,[[146,196],[372,470]],17);
    for(const [x,d,ang] of [[168,252,.25],[186,238,-.5],[392,256,.1],[404,232,-.8]])fallenBaluster(c,x,g,d,ang,x);
    brokenArch(c,214,292,g,258,92);elvenLamp(c,LIGHTS[0]);brazier(c,LIGHTS[1]);}
  // ---- rain left in the hollows of the terrace: puddles that hold the sky, the moon, the brazier; moss on the slabs by the balustrade
  {const g=gT,rr=rng(61);
    // a puddle: an irregular pool in the plane of the slabs, the night sky in it a shade lighter than the wet stone, the flames as streaks
    const puddle=(x,d,w,seed)=>{const r2=rng(seed),pts=[];for(let k=0;k<14;k++){const a=k/14*TAU,rr2=w*(.7+r2()*.45);pts.push([x+Math.cos(a)*rr2,d+Math.sin(a)*rr2*.55]);}
      c.save();plane(c,g);c.beginPath();pts.forEach(([px,pd],k)=>k?c.lineTo(px,pd):c.moveTo(px,pd));c.closePath();c.restore();
      c.save();c.clip();const q=pp(x,g,d);c.fillStyle=lin(c,0,q.y-w*.5,0,q.y+w*.5,[[0,'#262a38'],[1,'#13151e']]);c.fillRect(q.x-w*1.6,q.y-w,w*3.2,w*2);
      c.globalCompositeOperation='lighter';for(const L of LIGHTS){const lq=lightAt(L);if(Math.abs(lq.x-q.x)<w*1.4){c.fillStyle=lin(c,0,q.y-w*.4,0,q.y+w*.4,[[0,rgba('#ffb866',.05)],[.5,rgba('#ffb866',.4)],[1,rgba('#ffb866',.05)]]);c.fillRect(lq.x-2,q.y-w*.4,4,w*.8);}}
      if(Math.abs(q.x-150)<w*1.4){c.fillStyle=rgba('#fff4e0',.3);c.beginPath();c.ellipse(150,q.y,3,1.4,0,0,TAU);c.fill();}c.restore();
      c.save();plane(c,g);c.beginPath();pts.forEach(([px,pd],k)=>k?c.lineTo(px,pd):c.moveTo(px,pd));c.closePath();c.restore();c.strokeStyle=rgba('#05060a',.5);c.lineWidth=1.2;c.stroke();};
    for(const [x,d,w,sd] of [[96,214,22,1],[262,176,16,2],[150,98,26,3],[338,36,18,4]])puddle(x,d,w,sd);
    c.save();plane(c,g);for(let i=0;i<26;i++){const x=-140+rr()*560,d=150+rr()*124,rx=4+rr()*14,rd=3+rr()*7;c.fillStyle=rgba(rr()<.5?'#1c2a16':'#243318',.18+rr()*.18);c.beginPath();c.ellipse(x,d,rx,rd,0,0,TAU);c.fill();}c.restore();}
  {const g=GB;c.save();plane(c,g);const path=[[520,-100],[540,0],[560,60],[600,120],[660,170],[720,214],[790,236]];c.lineCap='round';c.lineJoin='round';
    c.strokeStyle=rgba('#2a2018',.55);c.lineWidth=26;c.beginPath();path.forEach(([x,d],i)=>i?c.lineTo(x,d):c.moveTo(x,d));c.stroke();c.strokeStyle=rgba('#3a2c20',.35);c.lineWidth=12;c.stroke();c.restore();}
  // ---- the slope where the terrace broke: strips following the ground, darker where it is steep, earth and broken slabs on it
  {const xs=[];for(let x=426;x<=508;x+=2)xs.push(x);const dirt=TB().turf(6,{g0:'#2a2418',g1:'#3a3020',dry:'#4a4030',earth:'#2e2218',stones:90});
    c.save();c.beginPath();{let q=pp(xs[0],gr(xs[0]),-100);c.moveTo(q.x,q.y);for(const x of xs){q=pp(x,gr(x),-100);c.lineTo(q.x,q.y);}q=pp(508,gr(508),FAR);c.lineTo(q.x,q.y);for(let i=xs.length-1;i>=0;i--){q=pp(xs[i],gr(xs[i]),FAR);c.lineTo(q.x,q.y);}}c.closePath();c.clip();
    c.fillStyle=patAt(c,dirt,0,0,.25);c.fillRect(380,100,240,500);
    for(let i=0;i<xs.length-1;i++){const x=xs[i],s=(gr(x+2)-gr(x))/2,k=clamp(s/1.25,0,1);const a=pp(x,gr(x),-100),b=pp(x+2.2,gr(x+2.2),-100),e=pp(x+2.2,gr(x+2.2),FAR),f=pp(x,gr(x),FAR);
      c.fillStyle=rgba('#05040a',.5+k*.3);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineTo(e.x,e.y);c.lineTo(f.x,f.y);c.closePath();c.fill();}
    c.restore();
    // the rubble: slabs that came down with it, small stones, weeds in the earth
    const rr=rng(44);for(let i=0;i<34;i++){const x=440+rr()*66,d=-60+rr()*330,g=gr(x);slab(c,x,g,d,5+rr()*10,4+rr()*8,rr()*3,(rr()-.3)*6,i*7+3);}
    for(let i=0;i<60;i++){const x=444+rr()*60,d=-80+rr()*350,q=pp(x,gr(x),d);c.fillStyle=mix('#2a2622','#5a5248',rr());c.beginPath();c.ellipse(q.x,q.y,1+rr()*1.8,.7+rr()*.9,0,0,TAU);c.fill();}
    for(let i=0;i<18;i++){const x=446+rr()*58,d=-40+rr()*300,q=pp(x,gr(x),d);weeds(c,q.x,q.y,4+(rr()*4|0),5+rr()*5,i+90);}}
  // ---- slabs thrown down onto the lower ground at the foot of the slope, weeds in the paving's joints near the break
  for(const [x,d,w,l,a,t] of [[512,40,12,8,.4,3],[520,110,9,7,-.3,2],[530,176,14,9,.9,4],[506,236,8,6,.2,1],[546,70,7,5,1.4,0]])slab(c,x,GB,d,w,l,a,t,x+d);
  for(let i=0;i<16;i++){const x=300+r()*130,d=-40+r()*300,q=pp(x,gT,d);weeds(c,q.x,q.y,3,3+r()*3,i+300);}
  for(let i=0;i<24;i++){const x=520+r()*380,d=-60+r()*320,q=pp(x,GB,d);weeds(c,q.x,q.y,4,4+r()*5,i+500);}
  // ---- the watchman's lantern on its staff
  staffLantern(c,LIGHTS[2]);
  // ---- the light on the ground: warm pools round each light, the moon's cool wash, the dark falling off toward us
  c.save();c.globalCompositeOperation='lighter';for(const L of LIGHTS){const g=gr(L.x),q=pp(L.x,g,L.d-24);c.fillStyle=rad(c,q.x,q.y,0,120,[[0,rgba('#ffb060',L.k==='brazier'?.16:.12)],[1,rgba('#ffb060',0)]]);c.save();c.translate(q.x,q.y);c.scale(1,.42);c.translate(-q.x,-q.y);c.fillRect(q.x-130,q.y-130,260,260);c.restore();}
    c.fillStyle=lin(c,0,yT,0,GB+40,[[0,rgba('#6a7aa8',.06)],[1,rgba('#6a7aa8',0)]]);c.fillRect(X0,yT,X1-X0,GB+40-yT);c.restore();
  haze(c,X0,X1,yT-8,yL+30,'#3a2a3a',.12);
  c.fillStyle=lin(c,0,GB-40,0,GB+120,[[0,rgba('#000000',0)],[1,rgba('#000000',.6)]]);c.fillRect(X0,GB-40,X1-X0,160);}
// the flames burn and their light spills: drawn every frame over the layer
function live(){const t=S.t;ctx.save();
  for(const L of LIGHTS){const q=lightAt(L),f=.9+.1*Math.sin(t*7+L.x)*Math.sin(t*3.3+L.d);
    if(L.k==='brazier'){for(let i=0;i<6;i++){const fx=q.x-6+i*2.4,fh=6+3*Math.sin(t*19+i*1.7)+2*Math.sin(t*31+i);ctx.fillStyle=rgba(i%2?'#ffb54a':'#ff8a30',.85);ctx.beginPath();ctx.moveTo(fx-1.6,q.y+4);ctx.quadraticCurveTo(fx-1,q.y+4-fh*.6,fx+.3,q.y+4-fh);ctx.quadraticCurveTo(fx+1.3,q.y+4-fh*.5,fx+1.6,q.y+4);ctx.closePath();ctx.fill();}
      glow(ctx,q.x,q.y,26,'#ffd08a',.7*f);glow(ctx,q.x,q.y+4,90,'#ff9a50',.24*f);}
    else{glow(ctx,q.x+(L.k==='lantern'?7:0),q.y+(L.k==='lantern'?-3:0),16,'#fff0cc',.85*f);glow(ctx,q.x,q.y,64,'#ffb866',.24*f);}}
  ctx.restore();}
// the light that falls on a fighter: the nearest flame, else the moon
function light(f){const px=f.p[PEL].x+f.dep*PSX;let best=null,bd=1e9;for(const L of LIGHTS){const q=lightAt(L),dd=Math.abs(q.x-px);if(dd<bd){bd=dd;best=q;}}
  if(bd>260)return{dir:{x:-.35,y:-1}};return{light:{x:best.x-f.dep*PSX,y:best.y+f.dep*PSY}};}
E.S.ledge={paint,live,light,lights:LIGHTS,div:it=>it.dv.mat==='plank'&&typeof EnvProps!=='undefined'?EnvProps.plankFence(it,'rustic'):false,table:()=>typeof EnvProps!=='undefined'?EnvProps.fieldTable('rustic'):false};
})();
// ===== ENV LEDGE END =====
