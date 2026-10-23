// ===== ENV SUMPROOF =====
// The Sump's roof at night, minutes after the fall. The bar's roof is a deck of corrugated tin, rusted along its ribs and patched
// where it gave way: newer sheets nailed over the holes, an old enamel sign laid flat among them. In the middle of it the heap of
// hay that is bedding for Dob's pigeons, burst and thrown about where a body came down in it, straw and feathers over the tin, a
// fork left standing in it and a bale split open beside it. Along the back on the left the pigeon lofts, two tiers of slat and wire
// coops under a tin roof, the birds behind the wire and along the landing boards; on the right the hatch house, a tin hut over the
// way down, its door standing open on the lamp and the ladder inside; between them the kitchen's stovepipe, smoking. A string of
// bulbs runs from the hut to the lofts. Behind the roof the Pit goes up into the dark: its far wall shacks on junk, row on row, the
// windows lit, the smoke of the floor's fires hanging in front of them; the near walls' junk at the sides; and high on the left a
// shelf of rock with the spike at its end, where a thread of gold and cyan light hangs (ACT1_PLACES.sumproof.spike). Under the
// front edge THE SUMP's sign throws its amber up over the eaves.
// live() moves the smoke, the birds (settling back after the fall: S.act1.birds), the bulbs, the sign's buzz and the arm's light;
// fore() is the front of the heap, over whoever lies in it.
// The kit at the top (EnvLook.sump) is the Sump's own: the Pit's far wall, the spike and the arm, boards, onions, crocks, jars,
// barrels and sacks. The kitchen's and the back room's painters, which the build loads after this one, draw with it too.
(()=>{const E=EnvLook,{C,pp,poly,lin,rad,rgba,mix,rng,lerp,clamp,TAU}=E;

// ---------- the Sump's kit ----------
E.sump=(()=>{
// colours mixed a great many times over: each blend kept
const MC=new Map();
function dim(a,b,t){const q=Math.round(clamp(t,0,1)*16),key=a+b+q;let v=MC.get(key);if(!v){v=mix(a,b,q/16);MC.set(key,v);}return v;}
const pick=(r,a)=>a[(r()*a.length)|0];
const SHACK=['#1c1519','#21181b','#261c1c','#19161c','#281d19','#1e1816','#1f1b21'],TIN=['#3c3130','#302b2c','#4a3a31','#33312e','#41302a'];
const JK='#070609';
const JC={car:['#4a2222','#22383a','#4a4436','#262c3c','#4a301c','#2e3a26','#565046'],appl:['#6a665e','#5a5e5c','#4e5650','#6a5e4a','#5e5a52'],
  drum:['#5a2418','#1f3048','#5a4a1c','#22382a','#3a3a3e','#4a1e14'],wood:['#4a3424','#5a3e28','#3e2c1e','#6a4a30'],tin:['#4a2c1c','#3a3a3e','#4e3626','#2e3034','#3a3226'],
  bag:['#0e0e10','#13171a','#1a2018','#1c1a20','#26262c'],mat:['#3a4250','#4a4a52','#4e4638','#3e3a48'],door:['#3a2a20','#2a3a3a','#4a3a2a','#3a2e3a']};
const WIN=['#ffcf86','#7ff3e3','#ff6ad0'];
// ---------- soft lights made once and stamped (for what moves) ----------
const SPR={};
function sprite(key,w,h,fn){if(SPR[key])return SPR[key];const cv=document.createElement('canvas');cv.width=w;cv.height=h;fn(cv.getContext('2d'),w,h);return SPR[key]=cv;}
const glowSpr=col=>sprite('g'+col,64,64,(g,w)=>{g.fillStyle=rad(g,w/2,w/2,0,w/2,[[0,rgba(col,1)],[.22,rgba(col,.45)],[.55,rgba(col,.12)],[1,rgba(col,0)]]);g.fillRect(0,0,w,w);});
const puffSpr=col=>sprite('p'+col,64,64,(g,w)=>{g.fillStyle=rad(g,w/2,w/2,0,w/2,[[0,rgba(col,.55)],[.5,rgba(col,.24)],[1,rgba(col,0)]]);g.fillRect(0,0,w,w);});
// a glow added to what is there (c is the layer or the screen; sq squashes it)
function glowAt(c,x,y,r,col,a,sq){if(a<=.003)return;const q=sq||1;c.save();c.globalCompositeOperation='lighter';c.globalAlpha=Math.min(1,a);c.drawImage(glowSpr(col),x-r,y-r*q,r*2,r*2*q);c.restore();}
function puffAt(c,x,y,r,col,a){if(a<=.003)return;c.globalAlpha=Math.min(1,a);c.drawImage(puffSpr(col),x-r,y-r,r*2,r*2);}

// ---------- junk ----------
// One piece of the Pit's junk, flat to the eye, centred on (x, y), turned by a: a car, white goods, a drum, tyres, a crate, tin, a
// door, a mattress, bags. lt is how much light reaches it; its top edge takes the cold of the sky up high, the fires' warmth lower.
function junk(c,o){const {k,x,y,w,h}=o,lt=o.lt,base=dim(o.col,JK,1-lt),hw=w/2,hh=h/2,r=rng(o.seed|0),u=o.u||1;
  c.save();c.translate(x,y);if(o.a)c.rotate(o.a);c.fillStyle=base;
  if(k==='car'){c.beginPath();c.moveTo(-hw,hh);c.lineTo(-hw,-hh*.1);c.lineTo(-hw*.62,-hh*.24);c.lineTo(-hw*.36,-hh);c.lineTo(hw*.3,-hh);c.lineTo(hw*.56,-hh*.22);c.lineTo(hw,-hh*.06);c.lineTo(hw,hh);c.closePath();c.fill();
    c.fillStyle='#07080a';c.fillRect(-hw*.55,-hh*.84,hw*.5,hh*.56);c.fillRect(hw*.04,-hh*.84,hw*.42,hh*.56);
    c.beginPath();c.arc(-hw*.62,hh,hh*.55,Math.PI,0);c.arc(hw*.64,hh,hh*.55,Math.PI,0);c.fill();
    for(let i=0;i<5;i++){c.fillStyle=rgba('#6a3218',.2+.25*r());c.fillRect(-hw+r()*w,-hh*.1+r()*hh,(3+r()*10)*u,(2+r()*5)*u);}}
  else if(k==='fridge'||k==='washer'){c.fillRect(-hw,-hh,w,h);c.fillStyle=dim(base,'#000000',.4);
    if(k==='fridge'){c.fillRect(-hw,-hh*.4,w,Math.max(.6,1.2*u));c.fillRect(hw*.6,-hh*.8,w*.08,h*.18);}
    else{c.beginPath();c.arc(0,hh*.12,Math.min(w,h)*.3,0,TAU);c.fill();c.fillStyle=rgba('#a8c0c8',.08*lt);c.beginPath();c.arc(-w*.06,hh*.04,Math.min(w,h)*.12,0,TAU);c.fill();}
    for(let i=0;i<4;i++){c.fillStyle=rgba('#5a3a1e',.2+.25*r());c.fillRect(-hw+r()*w,-hh+r()*h,(2+r()*6)*u,(2+r()*8)*u);}}
  else if(k==='drum'){c.fillRect(-hw,-hh,w,h);c.fillStyle=dim(base,'#ffffff',.08);c.fillRect(-hw+w*.12,-hh,w*.12,h);c.fillStyle=dim(base,'#000000',.4);c.fillRect(hw-w*.24,-hh,w*.24,h);
    c.fillRect(-hw,-hh+h*.31,w,Math.max(.6,1.6*u));c.fillRect(-hw,-hh+h*.64,w,Math.max(.6,1.6*u));
    for(let i=0;i<4;i++){c.fillStyle=rgba('#7a3a14',.2+.3*r());c.fillRect(-hw+r()*w,-hh+r()*h,(2+r()*5)*u,(3+r()*9)*u);}}
  else if(k==='tyres'){const n=o.n||1,th=h/n;c.fillStyle=dim('#121214',JK,1-lt);
    for(let i=0;i<n;i++){const yy=-hh+i*th;c.beginPath();c.ellipse(0,yy+th/2,hw,th*.48,0,0,TAU);c.fill();c.strokeStyle=rgba('#5a5a62',.25*lt);c.lineWidth=.8*u;c.beginPath();c.ellipse(0,yy+th/2,hw*.92,th*.36,0,Math.PI*1.1,Math.PI*1.8);c.stroke();}}
  else if(k==='crate'){c.fillRect(-hw,-hh,w,h);c.strokeStyle=dim(base,'#000000',.45);c.lineWidth=u;c.beginPath();for(let i=1;i<3;i++){c.moveTo(-hw,-hh+h*i/3);c.lineTo(hw,-hh+h*i/3);}c.stroke();
    c.strokeStyle=dim(base,'#ffffff',.06);c.lineWidth=2.4*u;c.beginPath();c.moveTo(-hw+2*u,-hh+2*u);c.lineTo(hw-2*u,hh-2*u);c.stroke();}
  else if(k==='tin'){c.fillRect(-hw,-hh,w,h);c.fillStyle='rgba(0,0,0,.34)';for(let xx=-hw+2*u;xx<hw;xx+=5*u)c.fillRect(xx,-hh,1.1*u,h);
    for(let i=0;i<4;i++){c.fillStyle=rgba('#7a3a14',.22+.3*r());c.fillRect(-hw+r()*w,-hh+r()*h,(4+r()*12)*u,(3+r()*6)*u);}}
  else if(k==='door'){c.fillRect(-hw,-hh,w,h);c.strokeStyle=dim(base,'#000000',.4);c.lineWidth=1.2*u;c.strokeRect(-hw+w*.16,-hh+h*.08,w*.68,h*.36);c.strokeRect(-hw+w*.16,-hh+h*.52,w*.68,h*.4);
    c.fillStyle=dim('#8a7a4a',JK,1-lt);c.beginPath();c.arc(hw*.7,0,2*u,0,TAU);c.fill();}
  else if(k==='mat'){c.fillRect(-hw,-hh,w,h);c.fillStyle=dim(base,'#ffffff',.08);for(let xx=-hw;xx<hw;xx+=8*u)c.fillRect(xx,-hh,2.6*u,h);
    c.fillStyle=rgba('#4a3a1a',.3);c.beginPath();c.ellipse(-hw+r()*w,-hh+r()*h,(8+r()*12)*u,(3+r()*4)*u,0,0,TAU);c.fill();}
  else{const n=2+Math.floor(r()*3);for(let i=0;i<n;i++){c.fillStyle=dim(pick(r,JC.bag),JK,(1-lt)*.6);c.beginPath();c.ellipse(-hw+w*(i+.5)/n,hh-h*.45,w/n*.55,h*.42,(r()-.5)*.4,0,TAU);c.fill();}}
  // the lit top edge
  const a2=lt*lt*(o.rimK??1);if(a2>.04&&k!=='bags'){c.fillStyle=rgba(dim('#9fb4e6','#ffa060',o.warm||0),.1+.24*a2);c.fillRect(-hw,-hh,w,Math.max(.6,1*u));}
  c.restore();}
const J_ALL=[['car',.16],['fridge',.1],['washer',.07],['drum',.13],['tyres',.13],['crate',.1],['tin',.12],['door',.05],['mat',.06],['bags',.08]];
function jPick(r){let t=r();for(const e of J_ALL){t-=e[1];if(t<0)return e[0];}return 'bags';}
function jSize(k,r,u){switch(k){case 'car':return[(150+r()*50)*u,(30+r()*16)*u];case 'fridge':return[(36+r()*8)*u,(76+r()*12)*u];case 'washer':return[(36+r()*6)*u,(40+r()*6)*u];
  case 'drum':return[(28+r()*4)*u,(40+r()*6)*u];case 'tyres':{const n=1+Math.floor(r()*4);return[(30+r()*4)*u,n*11*u,n];}case 'crate':return[(26+r()*16)*u,(20+r()*12)*u];
  case 'tin':return[(56+r()*56)*u,(26+r()*26)*u];case 'door':return[(34+r()*6)*u,(78+r()*8)*u];case 'mat':return[(76+r()*14)*u,(12+r()*5)*u];default:return[(36+r()*24)*u,(20+r()*12)*u];}}
// a near wall of the Pit seen from its floor: the dark mass of the junk from its face (face(y), the x of the face at y) out past the
// edge of the picture (side -1 left, 1 right), the pieces along the face lit, the ones deeper in darker
const JPAL={fridge:'appl',washer:'appl',crate:'wood',tyres:'bag',bags:'bag',mat:'mat',door:'door',car:'car',drum:'drum',tin:'tin'};
function junkWall(c,side,face,yt,yb,o){o=o||{};const u=o.u||1,r=rng(o.seed||907),out=side<0?-400:1500;
  c.beginPath();c.moveTo(out,yt-20);for(let y=yt-20;y<=yb+20;y+=10)c.lineTo(face(y),y);c.lineTo(out,yb+20);c.closePath();
  c.fillStyle=lin(c,face(yb)+side*200,0,face(yb),0,[[0,'#040306'],[.7,'#0b080b'],[1,'#141014']]);c.fill();
  const items=[];
  for(let y=yt;y<yb+30;y+=22*u){for(let i=0;i<2;i++){const k=jPick(r),sz=jSize(k,r,u),yy=y+r()*22*u;items.push({k,x:face(yy)+side*(30+r()*120)*u,y:yy,w:sz[0],h:sz[1],n:sz[2],a:(r()-.5)*.6,col:pick(r,JC[JPAL[k]]),lt:.22+r()*.2,rimK:.4,seed:(r()*1e9)|0,u,layer:0});}
    if(r()<.9){const k=jPick(r),sz=jSize(k,r,u),yy=y+r()*22*u,ex=sz[0]*.5;items.push({k,x:face(yy)-side*(ex*(.2+r()*.5)),y:yy,w:sz[0],h:sz[1],n:sz[2],a:(r()-.5)*.5,col:pick(r,JC[JPAL[k]]),lt:.5+r()*.35,rimK:1,warm:clamp((y-yt)/(yb-yt),0,1)*.7,seed:(r()*1e9)|0,u,layer:1});}}
  items.sort((a,b)=>a.layer-b.layer);c.save();c.beginPath();c.rect(-400,yt-40,1900,yb-yt+80);c.clip();for(const it of items)junk(c,it);c.restore();}

// ---------- the far wall of the Pit ----------
// Rows of shacks on walkways laid over the junk, from the lowest walkway at yb up to yt, every rs: tin roofs held down with tyres,
// tarps, drums and bags by the doors, washing between them, ladders down to the next row, lamps in the windows. The air of the Pit
// hangs in front of it, thicker going up into the dark; the fires on the floor warm it from below; the windows burn through. o.k:
// the size of things (1: a shack 24 to 76 across); o.lit: the share of windows lit; returns the lit windows and the signs (for what
// moves) as flat lists.
function farSide(c,x0,x1,yt,yb,o){o=o||{};const k=o.k||1,RS=o.rs||50*k,r=rng(o.seed||501),lit=[],signs=[],LIT0=o.lit??.5,rows=[];
  c.fillStyle=lin(c,0,yt,0,yb+RS,[[0,'#08060a'],[.6,'#110d12'],[1,'#1a1216']]);c.fillRect(x0,yt,x1-x0,yb-yt+RS);
  for(let ry=yb,j=0,rs=RS;ry>yt-rs*.4;ry-=rs,j++,rs=RS*(.86+r()*.3)){const up=clamp((yb-ry)/(yb-yt),0,1),LIT=LIT0*(1-up*.55);rows.push(ry);
    // the course of junk the walkway is laid on, and its boards
    {const y0=ry+1.5*k,h=8*k;c.fillStyle='#0c0a0c';c.fillRect(x0,y0,x1-x0,h);
      for(let row=0;row<2;row++){let x=x0-r()*8*k;const cy=y0+(row?h*.72:h*.3),lt=row?.42:.3;
        while(x<x1){const q=r();let w;
          if(q<.24){w=(16+r()*14)*k;const hh=3.6*k;c.fillStyle=dim(pick(r,JC.car),JK,1-lt);c.fillRect(x,cy-hh/2,w,hh);c.fillStyle='#050405';c.fillRect(x+w*.25,cy-hh/2+.5*k,w*.4,k);}
          else if(q<.42){w=6*k;c.strokeStyle='#141417';c.lineWidth=1.4*k;c.beginPath();c.arc(x+3*k,cy,2.1*k,0,TAU);c.stroke();}
          else if(q<.54){w=6*k;c.fillStyle=dim(pick(r,JC.drum),JK,1-lt);c.beginPath();c.arc(x+3*k,cy,2.8*k,0,TAU);c.fill();}
          else if(q<.66){w=6.5*k;c.fillStyle=dim(pick(r,JC.appl),JK,1-lt);c.fillRect(x,cy-3*k,6*k,6*k);}
          else if(q<.8){w=(10+r()*12)*k;c.fillStyle=dim(pick(r,JC.tin),JK,1-lt);c.fillRect(x,cy-2*k,w,4*k);}
          else if(q<.9){w=(5+r()*4)*k;c.fillStyle=dim(pick(r,JC.bag),JK,.3);c.beginPath();c.ellipse(x+w/2,cy+.4*k,w/2,2.4*k,0,0,TAU);c.fill();}
          else{w=(8+r()*8)*k;c.fillStyle=dim(pick(r,JC.wood),JK,1-lt);c.fillRect(x,cy-1.3*k,w,2.6*k);}
          x+=w+r()*1.6*k;}}
      c.fillStyle='rgba(0,0,0,.4)';c.fillRect(x0,y0,x1-x0,1.6*k);}
    c.fillStyle='#0b090b';c.fillRect(x0,ry-1.2*k,x1-x0,2.8*k);c.fillStyle=rgba('#ffcf86',.05);c.fillRect(x0,ry-1.2*k,x1-x0,.6*k);
    // the shacks along it, a heap of junk in a gap now and then
    let x=x0-r()*40*k;
    while(x<x1){const w=(24+r()*52)*k,h=(15+r()*Math.max(4,rs/k-30))*k,q=r();
      if(q<.1){const gw=w*.8;c.fillStyle='#0d0a0c';c.beginPath();c.moveTo(x,ry+1);c.quadraticCurveTo(x+gw/2,ry-h*1.1,x+gw,ry+1);c.closePath();c.fill();
        for(let i=0;i<3;i++){const kk=pick(r,['car','drum','tyres','bags','tin','fridge']);junk(c,{k:kk,x:x+gw*(.2+.6*r()),y:ry-(2+r()*h*.4),w:(kk==='car'?20:7)*k*(1+r()*.4),h:(kk==='car'?6:8)*k,n:2,a:(r()-.5)*.6,col:pick(r,JC.tin),lt:.5,rimK:.5,seed:(r()*1e9)|0,u:.2*k});}
        x+=gw+2*k;continue;}
      c.fillStyle=pick(r,SHACK);c.fillRect(x,ry-h,w,h);
      if(r()<.22){c.fillStyle='rgba(0,0,0,.32)';for(let s=x+2*k;s<x+w;s+=3*k)c.fillRect(s,ry-h+2*k,.6*k,h-2*k);}
      if(r()<.12){c.fillStyle=dim(pick(r,JC.car),'#000000',.45);c.fillRect(x+r()*(w-10*k),ry-h*.72,9*k,h*.55);}
      const tip=(r()-.5)*7*k,ta=Math.max(0,tip),tb=Math.max(0,-tip);c.fillStyle=pick(r,TIN);
      c.beginPath();c.moveTo(x-2*k,ry-h-ta);c.lineTo(x+w+2*k,ry-h-tb);c.lineTo(x+w+2*k,ry-h+2.2*k-tb);c.lineTo(x-2*k,ry-h+2.2*k-ta);c.closePath();c.fill();
      const roof=s=>ry-h-lerp(ta,tb,s)-1;
      const nw=w>46*k?2:1;for(let n=0;n<nw;n++){const ww=(5+r()*4)*k,wh=(4+r()*4)*k,wx=x+5*k+n*(w*.5)+r()*3*k,wy=ry-h+5*k+r()*3*k,q2=r();
        if(q2<LIT)lit.push(wx,wy,ww,wh,q2<LIT*.86?0:q2<LIT*.94?1:2);else{c.fillStyle='#08070a';c.fillRect(wx,wy,ww,wh);}}
      if(r()<.28){c.fillStyle='#070608';c.fillRect(x+w-11*k,ry-12*k,7*k,12*k);}
      if(r()<.06)signs.push(x+w*.5,ry-h-6*k,(8+r()*10)*k,(r()*3)|0);
      // tyres holding the roof down, a tarp over it, a drum by the wall, bags along it
      if(r()<.3){c.strokeStyle='#0c0b0d';c.lineWidth=1.3*k;const n=1+Math.floor(r()*3);for(let q3=0;q3<n;q3++){const s=.2+.6*((q3+.5)/n);c.beginPath();c.ellipse(x+w*s,roof(s)-1.2*k,2.8*k,1.3*k,0,0,TAU);c.stroke();}}
      if(r()<.18){c.fillStyle=rgba(pick(r,['#24405a','#2e4a2e','#5a3424']),.75);const a0=r()*.5,a1=a0+.3+r()*.3;c.beginPath();c.moveTo(x+w*a0,roof(a0)-k);c.lineTo(x+w*a1,roof(a1)-k);c.lineTo(x+w*a1+2*k,roof(a1)+6*k);c.lineTo(x+w*a0-k,roof(a0)+5*k);c.closePath();c.fill();}
      if(r()<.26)junk(c,{k:'drum',x:x+w-4*k-r()*6*k,y:ry-4*k,w:5*k,h:8*k,col:pick(r,JC.drum),lt:.6,rimK:.4,seed:j*31+((x*7)|0),u:.12*k});
      if(r()<.3)junk(c,{k:'bags',x:x+4*k+r()*(w-8*k),y:ry-3*k,w:10*k,h:6*k,col:'#13171a',lt:.6,rimK:0,seed:j*37+((x*5)|0),u:.12*k});
      if(r()<.16){const x2=x+w+(18+r()*30)*k,sag=(4+r()*5)*k;c.strokeStyle='rgba(150,140,130,.3)';c.lineWidth=.5*k;c.beginPath();c.moveTo(x+w,ry-h+3*k);c.quadraticCurveTo(x+w+(x2-x-w)/2,ry-h+3*k+sag*2,x2,ry-h+5*k);c.stroke();
        for(let q3=0;q3<3;q3++){const s=.25+q3*.25,cx=lerp(x+w,x2,s),cy=ry-h+3*k+sag*2*(1-Math.pow(2*s-1,2))*.5+k;c.fillStyle=pick(r,['#5a3a4a','#3a4a5a','#6a5a3a','#4a5a4a']);c.fillRect(cx-2*k,cy,4*k,(4+r()*3)*k);}}
      if(r()<.1){const lx=x+w*.5;c.strokeStyle='#241c1a';c.lineWidth=.9*k;c.beginPath();c.moveTo(lx,ry);c.lineTo(lx,ry+rs-2*k);c.moveTo(lx+5*k,ry);c.lineTo(lx+5*k,ry+rs-2*k);for(let q3=4*k;q3<rs;q3+=6*k){c.moveTo(lx,ry+q3);c.lineTo(lx+5*k,ry+q3);}c.stroke();}
      x+=w+(r()<.2?(8+r()*36)*k:(1+r()*4)*k);}}
  // the stair-streets, switchbacking up between the rows, a lamp at each turn; poles with their wires
  {const r3=rng((o.seed||501)+3);for(let s=0;s<(o.stairs??3);s++){let x=lerp(x0+120*k,x1-120*k,r3()),dir=r3()<.5?-1:1;
      for(let i=0;i+1<rows.length;i++){if(r3()<.3&&i>0)break;const ya=rows[i],yb2=rows[i+1],xb=x+dir*(ya-yb2)*1.25;
        c.strokeStyle='#0a0809';c.lineWidth=5*k;c.beginPath();c.moveTo(x,ya);c.lineTo(xb,yb2);c.stroke();
        c.strokeStyle=rgba('#c8a070',.13);c.lineWidth=.7*k;c.beginPath();for(let u=0;u<1;u+=.07){const sx=lerp(x,xb,u),sy=lerp(ya,yb2,u);c.moveTo(sx-2*k,sy-1.2*k);c.lineTo(sx+2*k,sy-1.2*k);}c.stroke();
        c.strokeStyle='#1a1416';c.lineWidth=.8*k;c.beginPath();c.moveTo(x,ya-9*k);c.lineTo(xb,yb2-9*k);for(let u=0;u<=1;u+=.25){c.moveTo(lerp(x,xb,u),lerp(ya,yb2,u)-9*k);c.lineTo(lerp(x,xb,u),lerp(ya,yb2,u));}c.stroke();
        lit.push(xb-1.2*k,yb2-14*k,2.4*k,2.4*k,0);x=xb;dir=-dir;}}
    for(let i=0;i<(o.poles??4);i++){const px=lerp(x0+60*k,x1-60*k,r3()),py=rows[Math.min(rows.length-1,(r3()*2)|0)],top=py-(60+r3()*60)*k;c.strokeStyle='#0c0a0b';c.lineWidth=1.6*k;c.beginPath();c.moveTo(px,py);c.lineTo(px,top);c.moveTo(px-6*k,top+4*k);c.lineTo(px+6*k,top+4*k);c.stroke();
      c.strokeStyle=rgba('#2a2426',.9);c.lineWidth=.5*k;c.beginPath();for(const sd of [-1,1])for(let w=0;w<2;w++){const ex=px+sd*(80+r3()*120)*k,ey=top+(20+r3()*40)*k;c.moveTo(px+sd*5*k,top+4*k);c.quadraticCurveTo((px+ex)/2,Math.max(top,ey)+18*k,ex,ey);}c.stroke();}}
  // the air of the Pit in front of it: smoke in bands, thicker and darker going up
  {const r2=rng((o.seed||501)+7);for(let i=0;i<(o.smoke??5);i++){const cx=lerp(x0,x1,r2()),cy=lerp(yt+(yb-yt)*.15,yb-RS*.3,r2()),rx=(160+r2()*260)*k,ry2=(10+r2()*18)*k;
    c.save();c.translate(cx,cy);c.scale(1,ry2/rx);c.fillStyle=rad(c,0,0,0,rx,[[0,rgba(o.smokeCol||'#3a3240',.5)],[1,rgba(o.smokeCol||'#3a3240',0)]]);c.beginPath();c.arc(0,0,rx,0,TAU);c.fill();c.restore();}}
  c.fillStyle=lin(c,0,yt,0,yb,[[0,rgba('#040306',.94)],[.35,rgba('#07050a',.78)],[.7,rgba('#0a0810',.5)],[1,rgba('#120c10',.3)]]);c.fillRect(x0,yt,x1-x0,yb-yt+RS);
  // the fires on the floor, under the lowest rows, warming the smoke over them
  c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,0,yb-RS*1.8,0,yb+RS*.4,[[0,rgba('#ff8a4a',0)],[1,rgba('#ff8a4a',o.fire??.16)]]);c.fillRect(x0,yb-RS*1.8,x1-x0,RS*2.2);
  // the windows, burning through the smoke (dimmer up in it)
  for(let n=0;n<lit.length;n+=5){const x=lit[n],y=lit[n+1],w=lit[n+2],h=lit[n+3],a=lerp(.16,.66,Math.pow(clamp((y-yt)/(yb-yt),0,1),1.4));c.fillStyle=WIN[lit[n+4]];
    c.globalAlpha=a;c.fillRect(x,y,w,h);c.globalAlpha=a*.12;c.fillRect(x-w*.6,y-h*.6,w*2.2,h*2.2);}
  for(let n=0;n<signs.length;n+=4){c.globalAlpha=.5;c.fillStyle=WIN[(signs[n+3]+1)%3];c.fillRect(signs[n]-signs[n+2]/2,signs[n+1]-2*k,signs[n+2],4*k);}
  c.restore();
  return{lit,signs};}

// ---------- the spike, and the arm on it ----------
// The end of a shelf of rock high on the Pit's wall, the spike standing out of it toward the right, at (x, y): where the arm hangs.
// s is its size (1: the spike about 40 long).
function spikeRock(c,x,y,s,o){o=o||{};const r=rng(o.seed||53),x0=o.wall??x-260*s,top=y+8*s,Q=[[x0,top-30*s]];
  for(let xx=x0;xx<=x-14*s;xx+=14*s)Q.push([xx,top-r()*5*s+(xx-x0)*.02]);
  Q.push([x-8*s,top+3*s],[x-4*s,top+12*s],[x-16*s,top+20*s],[x-60*s,top+30*s],[x0+60*s,top+46*s],[x0,top+70*s]);
  c.beginPath();c.moveTo(Q[0][0],Q[0][1]);for(const q of Q)c.lineTo(q[0],q[1]);c.closePath();
  c.fillStyle=lin(c,0,top-8*s,0,top+50*s,[[0,'#2a2427'],[.3,'#1a1518'],[1,'#0a080a']]);c.fill();
  c.save();c.clip();for(let i=0;i<5;i++){c.fillStyle=i%2?'rgba(0,0,0,.25)':'rgba(80,64,68,.14)';c.fillRect(x0,top+4*s+i*8*s+r()*3*s,x-x0,(3+r()*3)*s);}c.restore();
  c.strokeStyle=rgba('#9fb4e6',.16);c.lineWidth=.9*s;c.beginPath();for(let i=1;i<Q.length-5;i++)i===1?c.moveTo(Q[i][0],Q[i][1]):c.lineTo(Q[i][0],Q[i][1]);c.stroke();
  // roots and an old cable off its underside
  c.strokeStyle='#120d0f';c.lineWidth=.8*s;c.beginPath();for(let q=0;q<4;q++){const xx=x-30*s-q*34*s,yy=top+18*s+q*5*s;c.moveTo(xx,yy);c.quadraticCurveTo(xx+2*s,yy+14*s,xx+3*s,yy+(22+q*5)*s);}c.stroke();
  // the spike: an iron bar out of the rock, up and to the right
  const A=spikeEnds(x,y,s);c.strokeStyle='#4a2a1a';c.lineWidth=2.4*s;c.lineCap='round';c.beginPath();c.moveTo(A.ax,A.ay);c.lineTo(A.bx,A.by);c.stroke();
  c.strokeStyle=rgba('#ffbe8c',.35);c.lineWidth=.6*s;c.beginPath();c.moveTo(A.ax,A.ay-.8*s);c.lineTo(A.bx,A.by-.6*s);c.stroke();}
function spikeEnds(x,y,s){return{ax:x-12*s,ay:y+8*s,bx:x+16*s,by:y-20*s};}
// the arm's light on the wall round it, wide and faint (into the layer, once: its breathing is live)
function armHalo(c,x,y,s){const A=spikeEnds(x,y,s),hx=lerp(A.ax,A.bx,.55),hy=lerp(A.ay,A.by,.55);glowAt(c,hx,hy+10*s,130*s,C.cyan,.08);}
// a sprite stamped (the caller has set the compositing)
function stamp(c,spr,x,y,r,a){c.globalAlpha=Math.min(1,Math.max(0,a));c.drawImage(spr,x-r,y-r,r*2,r*2);}
// the arm (live): a dark shape hung from the spike, its lines lit gold and cyan, its light on the rock round it, breathing. With
// gore off there is no arm, only the light caught along the spike.
function arm(c,x,y,s,t,o){o=o||{};const k=.78+.22*Math.sin(t*1.6)+.06*Math.sin(t*4.3),A=spikeEnds(x,y,s),hx=lerp(A.ax,A.bx,.55),hy=lerp(A.ay,A.by,.55);
  c.save();c.globalCompositeOperation='lighter';stamp(c,glowSpr(C.cyan),hx,hy+10*s,52*s,.3*k);stamp(c,glowSpr('#ffd27a'),hx,hy+9*s,18*s,.5*k);c.globalCompositeOperation='source-over';c.globalAlpha=1;
  if(o.gore!==false){
    // the arm hangs from where the spike went through it: shoulder, elbow, hand
    const ex=hx+2*s,ey=hy+12*s,wx=hx+.5*s,wy=hy+23*s;c.lineCap='round';c.lineJoin='round';c.strokeStyle='#0d0b10';c.lineWidth=3.8*s;c.beginPath();c.moveTo(hx,hy);c.lineTo(ex,ey);c.lineTo(wx,wy);c.stroke();
    c.lineWidth=2.6*s;c.beginPath();c.moveTo(wx,wy);c.lineTo(wx-.6*s,wy+3*s);c.stroke();
    // the lines of the gilt on it, lit again: cyan down the inside, gold down the outer edge
    c.globalCompositeOperation='lighter';c.strokeStyle=rgba(C.cyan,.95*k);c.lineWidth=.9*s;c.beginPath();c.moveTo(hx-.7*s,hy+2*s);c.lineTo(ex-.9*s,ey);c.lineTo(wx-.6*s,wy);c.stroke();
    c.strokeStyle=rgba(C.goldL,.95*k);c.lineWidth=.8*s;c.beginPath();c.moveTo(hx+1.3*s,hy+1*s);c.lineTo(ex+1.4*s,ey);c.lineTo(wx+1*s,wy-1*s);c.stroke();
    c.strokeStyle=rgba(C.cyanL,.5*k);c.lineWidth=.4*s;c.beginPath();c.moveTo(hx,hy+4*s);c.lineTo(ex+.2*s,ey+1*s);c.stroke();
    c.fillStyle=rgba(C.cyanL,.9*k);c.fillRect(ex-.7*s,ey-.7*s,1.4*s,1.4*s);stamp(c,glowSpr(C.cyanL),ex,ey,9*s,.5*k);}
  else{c.globalCompositeOperation='lighter';c.strokeStyle=rgba(C.goldL,.5*k);c.lineWidth=.6*s;c.beginPath();c.moveTo(lerp(A.ax,A.bx,.35),lerp(A.ay,A.by,.35));c.lineTo(lerp(A.ax,A.bx,.75),lerp(A.ay,A.by,.75));c.stroke();}
  c.restore();}

// ---------- the Sump's own stuff ----------
// a face of boards from (x0, y0) to (x1, y1), in screen units: vertical (o.dir 'v') or laid across; o.w the board's width; sooted
// toward the top when o.soot
function boards(c,x0,y0,x1,y1,o){o=o||{};const r=rng(o.seed||61),w=o.w||12,vert=o.dir!=='h',base=o.base||'#3a2a1e';
  c.save();c.beginPath();c.rect(x0,y0,x1-x0,y1-y0);c.clip();c.fillStyle=base;c.fillRect(x0,y0,x1-x0,y1-y0);
  if(vert){for(let x=x0-r()*w;x<x1;x+=w*(.85+r()*.3)){const bw=w*(.85+r()*.3);c.fillStyle=dim(base,r()<.5?'#000000':'#6a5038',.12+r()*.16);c.fillRect(x,y0,bw,y1-y0);
      c.fillStyle=rgba('#000000',.42);c.fillRect(x,y0,.9,y1-y0);c.fillStyle=rgba('#ffd2a0',.05);c.fillRect(x+1,y0,.7,y1-y0);
      // grain, a knot, the nails
      c.fillStyle=rgba('#000000',.12);for(let g=0;g<3;g++)c.fillRect(x+2+r()*(bw-4),y0,.5,y1-y0);
      if(r()<.3){c.fillStyle=rgba('#120a06',.5);c.beginPath();c.ellipse(x+bw*.5,y0+r()*(y1-y0),1.4,2.4,0,0,TAU);c.fill();}
      c.fillStyle=rgba('#0a0806',.7);for(const ny of o.nails||[])c.fillRect(x+bw*.5-.6,ny-.6,1.2,1.2);}}
  else{for(let y=y0-r()*w;y<y1;y+=w*(.85+r()*.3)){const bh=w*(.85+r()*.3);c.fillStyle=dim(base,r()<.5?'#000000':'#6a5038',.12+r()*.16);c.fillRect(x0,y,x1-x0,bh);
      c.fillStyle=rgba('#000000',.42);c.fillRect(x0,y,x1-x0,.9);c.fillStyle=rgba('#ffd2a0',.05);c.fillRect(x0,y+1,x1-x0,.7);
      for(let xx=x0+r()*80;xx<x1;xx+=60+r()*90){c.fillStyle=rgba('#000000',.4);c.fillRect(xx,y,.8,bh);}}}
  if(o.soot)c.fillStyle=lin(c,0,y0,0,y1,[[0,rgba('#050304',o.soot)],[.6,rgba('#050304',o.soot*.35)],[1,rgba('#050304',0)]]),c.fillRect(x0,y0,x1-x0,y1-y0);
  c.restore();}
// a string of onions hung from (x, y): n bulbs down a twist of their dry tops, gold-brown skins catching the light on one side
function onions(c,x,y,n,o){o=o||{};const r=rng(o.seed||(x*7+y*3)|0),s=o.s||1;c.strokeStyle='#5a4426';c.lineWidth=1.2*s;c.beginPath();c.moveTo(x,y);c.lineTo(x+(r()-.5)*2*s,y+(n*5.4+4)*s);c.stroke();
  for(let i=0;i<n;i++){const bx=x+(i%2?3.2:-3.2)*s+(r()-.5)*1.6*s,by=y+(7+i*5.2)*s,rr=(3+r()*1.1)*s;
    c.fillStyle=pick(r,o.cols||['#8a5a26','#9a6a2e','#7a4a20','#a07430','#8a4a2a']);c.beginPath();c.ellipse(bx,by,rr,rr*.9,0,0,TAU);c.fill();
    c.fillStyle=rgba('#ffd9a0',.22*(o.lit??1));c.beginPath();c.ellipse(bx+(o.side??1)*rr*.35,by-rr*.3,rr*.4,rr*.35,0,0,TAU);c.fill();
    c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(bx-(o.side??1)*rr*.3,by+rr*.25,rr*.55,rr*.45,0,0,TAU);c.fill();
    c.strokeStyle=rgba('#2a1a0c',.5);c.lineWidth=.5*s;c.beginPath();c.moveTo(bx,by-rr*.9);c.lineTo(bx,by+rr*.9);c.stroke();}}
// a plait of garlic: pale heads
function garlic(c,x,y,n,o){o=o||{};const r=rng(o.seed||(x*5+y)|0),s=o.s||1;c.strokeStyle='#8a7a5a';c.lineWidth=1.4*s;c.beginPath();c.moveTo(x,y);c.lineTo(x,y+(n*4.4+3)*s);c.stroke();
  for(let i=0;i<n;i++){const bx=x+(i%2?2.6:-2.6)*s,by=y+(6+i*4.4)*s,rr=2.6*s;c.fillStyle=pick(r,['#d8ccb0','#cfc2a4','#e0d6bc']);c.beginPath();c.ellipse(bx,by,rr,rr*.86,0,0,TAU);c.fill();
    c.fillStyle=rgba('#000000',.25);c.beginPath();c.ellipse(bx-.8*s,by+.8*s,rr*.6,rr*.5,0,0,TAU);c.fill();c.strokeStyle=rgba('#8a7050',.5);c.lineWidth=.4*s;c.beginPath();c.moveTo(bx,by-rr);c.lineTo(bx,by+rr*.6);c.stroke();}}
// a stoneware crock standing on (x, y): w across, h high, a glaze from o.col down, a lid or a cloth tied over it
function crock(c,x,y,w,h,o){o=o||{};const col=o.col||'#7a5a3a',hw=w/2;
  c.fillStyle=col;c.beginPath();c.moveTo(x-hw*.86,y);c.quadraticCurveTo(x-hw*1.08,y-h*.55,x-hw*.8,y-h);c.lineTo(x+hw*.8,y-h);c.quadraticCurveTo(x+hw*1.08,y-h*.55,x+hw*.86,y);c.closePath();c.fill();
  if(o.band)c.fillStyle=o.band,c.fillRect(x-hw,y-h*.62,w,h*.12);
  c.fillStyle=lin(c,x-hw,0,x+hw,0,[[0,rgba('#000000',.45)],[.35,rgba('#000000',.05)],[.6,rgba('#ffe0b0',.12)],[1,rgba('#000000',.4)]]);c.fillRect(x-hw*1.1,y-h,w*1.1,h);
  if(o.cloth){c.fillStyle=o.cloth;c.beginPath();c.moveTo(x-hw*.95,y-h+2);c.lineTo(x-hw*.7,y-h-2.4);c.lineTo(x+hw*.7,y-h-2.4);c.lineTo(x+hw*.95,y-h+2);c.closePath();c.fill();c.fillStyle='#3a2a1a';c.fillRect(x-hw*.85,y-h+.6,w*.85,.9);}
  else{c.fillStyle=dim(col,'#000000',.35);c.fillRect(x-hw*.82,y-h-1.6,w*.82,1.8);c.fillRect(x-1.2,y-h-3.2,2.4,1.8);}}
// a glass jar standing on (x, y): what is in it, and a glint
function jar(c,x,y,w,h,o){o=o||{};const hw=w/2;c.fillStyle=rgba('#c8d8d0',.16);c.fillRect(x-hw,y-h,w,h);c.fillStyle=o.fill||'#8a6a2a';c.fillRect(x-hw+.7,y-h*(o.lev??.7),w-1.4,h*(o.lev??.7)-.6);
  c.fillStyle=rgba('#000000',.3);c.fillRect(x+hw-1.6,y-h,1.6,h);c.fillStyle=rgba('#ffffff',.22);c.fillRect(x-hw+1,y-h+1.2,.9,h-2.4);c.fillStyle=o.lid||'#2a1a10';c.fillRect(x-hw-.4,y-h-2,w+.8,2.2);}
// a barrel standing on (x, y): staves, hoops, its head as an ellipse; o.hi the side the light comes from (1 right, -1 left)
function barrel(c,x,y,w,h,o){o=o||{};const hw=w/2,bulge=w*.08,hi=o.hi??1,col=o.col||'#4a2e18',ey=w*.16;
  c.fillStyle=col;c.beginPath();c.moveTo(x-hw,y-ey*.3);c.quadraticCurveTo(x-hw-bulge,y-h/2,x-hw,y-h);c.lineTo(x+hw,y-h);c.quadraticCurveTo(x+hw+bulge,y-h/2,x+hw,y-ey*.3);c.quadraticCurveTo(x,y+ey*.6,x-hw,y-ey*.3);c.closePath();c.fill();
  c.save();c.clip();c.strokeStyle=rgba('#000000',.35);c.lineWidth=.8;c.beginPath();for(let i=1;i<7;i++){const u=i/7,xx=x-hw+w*u;c.moveTo(xx,y-h);c.quadraticCurveTo(xx+(u-.5)*bulge*2,y-h/2,xx,y);}c.stroke();
  c.fillStyle=lin(c,x-hw-bulge,0,x+hw+bulge,0,hi>0?[[0,rgba('#000000',.55)],[.45,rgba('#000000',.12)],[.75,rgba('#ffd9a8',.1)],[1,rgba('#000000',.3)]]:[[0,rgba('#000000',.3)],[.25,rgba('#ffd9a8',.1)],[.55,rgba('#000000',.12)],[1,rgba('#000000',.55)]]);c.fillRect(x-hw-bulge,y-h,w+bulge*2,h+ey);
  for(const u of [.14,.34,.66,.86]){const yy=y-h*u,bw=hw+bulge*Math.sin(u*Math.PI)*.95;c.fillStyle='#16130f';c.fillRect(x-bw,yy-1.3,bw*2,2.6);c.fillStyle=rgba('#ffcf9a',.16);c.fillRect(x-bw,yy-1.3,bw*2,.6);}
  c.restore();
  c.fillStyle=dim(col,'#000000',.25);c.beginPath();c.ellipse(x,y-h,hw,ey,0,0,TAU);c.fill();c.strokeStyle='#16130f';c.lineWidth=1.4;c.stroke();
  c.strokeStyle=rgba('#000000',.3);c.lineWidth=.6;c.beginPath();for(let i=-2;i<=2;i++){c.moveTo(x+i*w*.16,y-h-ey*.85);c.lineTo(x+i*w*.16,y-h+ey*.85);}c.stroke();
  if(o.bung){c.fillStyle='#120c08';c.beginPath();c.arc(x+hw*.3,y-h*.5,1.6,0,TAU);c.fill();}}
// a sack slumped on (x, y): burlap, tied at the neck; o.mesh shows what is in it (onions) through a net
function sack(c,x,y,w,h,o){o=o||{};const r=rng(o.seed||(x*3+y)|0),hw=w/2,col=o.col||'#6a5a3e';
  c.fillStyle=col;c.beginPath();c.moveTo(x-hw,y);c.quadraticCurveTo(x-hw*1.15,y-h*.55,x-hw*.45,y-h*.92);c.quadraticCurveTo(x,y-h*1.08,x+hw*.45,y-h*.92);c.quadraticCurveTo(x+hw*1.15,y-h*.55,x+hw,y);c.quadraticCurveTo(x,y+h*.08,x-hw,y);c.closePath();c.fill();
  if(o.mesh){c.save();c.clip();for(let i=0;i<w*h/22;i++){c.fillStyle=pick(r,['#8a5a26','#9a6a2e','#7a4a20','#a07430']);c.beginPath();c.arc(x-hw+r()*w,y-r()*h,2.6+r()*1.4,0,TAU);c.fill();}
    c.strokeStyle=rgba('#c8b890',.3);c.lineWidth=.4;c.beginPath();for(let xx=x-hw-h;xx<x+hw;xx+=3){c.moveTo(xx,y);c.lineTo(xx+h,y-h);c.moveTo(xx+h,y);c.lineTo(xx,y-h);}c.stroke();c.restore();}
  else{c.strokeStyle=rgba('#2a2010',.35);c.lineWidth=.5;c.beginPath();for(let k=0;k<4;k++){const yy=y-h*(.2+k*.18);c.moveTo(x-hw*.8,yy);c.quadraticCurveTo(x,yy+1.2,x+hw*.8,yy);}c.stroke();}
  c.fillStyle=lin(c,x-hw,0,x+hw,0,[[0,rgba('#000000',.45)],[.5,rgba('#000000',.05)],[1,rgba('#000000',.4)]]);c.beginPath();c.ellipse(x,y-h*.48,hw*1.1,h*.56,0,0,TAU);c.fill();
  c.strokeStyle='#3a2a16';c.lineWidth=1.1;c.beginPath();c.moveTo(x-3,y-h*.9);c.lineTo(x+3,y-h*.9);c.stroke();c.fillStyle=col;c.beginPath();c.moveTo(x-2.4,y-h*.92);c.lineTo(x-3.4,y-h*1.12);c.lineTo(x+3,y-h*1.1);c.lineTo(x+2.4,y-h*.92);c.closePath();c.fill();}
return{dim,pick,glowAt,puffAt,glowSpr,puffSpr,sprite,stamp,junk,junkWall,farSide,spikeRock,spikeEnds,arm,armHalo,boards,onions,garlic,crock,jar,barrel,sack,SHACK,TIN,JC,WIN};
})();

// ---------- the roof ----------
const K=E.sump,{dim,pick,glowAt}=K;
const DEF={far:210,hay:{x:470,d:96,w:74,h:22},hatch:{x:742,d:168,door:28},lofts:{x0:70,x1:250,d:180},pipe:{x:640,d:186},spike:{x:250,y:-30},floor:{x0:40,x1:860,z0:30,z1:150}};
const PL=()=>typeof ACT1_PLACES!=='undefined'&&ACT1_PLACES.sumproof?ACT1_PLACES.sumproof:DEF;
// a point at height h above the deck at depth d, on the screen
const q=(x,h,d)=>pp(x,GB-h,d);
const SPS=.8;                       // the spike and the arm, this far off up the wall
// the deck's own plane: (x, depth) in, the screen out
function deckT(c){c.transform(1,0,PSX,-PSY,0,GB);}
// the heap's height at (x, d): the game's own (act1Hay) where it is there
function hayH(L,x,d){if(typeof act1Hay==='function')return act1Hay(x,d);const H=L.hay,u=(x-H.x)/H.w,v=d-H.d;if(Math.abs(u)>=1||Math.abs(v)>34)return 0;return H.h*(1-u*u)*(1-(v/34)*(v/34));}
// what the roof's things are, worked out from the layout
function geo(){const L=PL(),Hh=L.hatch,Lo=L.lofts,hw=46,dw=Hh.door||28;
  const hut={x0:Hh.x-hw+2,x1:Hh.x+hw-2,d0:Hh.d-18,d1:Hh.d+20,h0:162,h1:150},door={x0:Hh.x+hw-8-dw-6,x1:Hh.x+hw-14,h:150};
  const loft={x0:Lo.x0,x1:Lo.x1,d0:Lo.d-8,d1:Math.min(L.far-4,Lo.d+24),h:92,roof:104};
  return{L,hut,door,loft,pipe:{x:L.pipe.x,d:L.pipe.d,h:112},sp:L.spike};}

// ---------- the deck ----------
// corrugated sheets laid in courses from the eaves to the back, each overlapping the one in front of it, nailed along the purlins,
// rust along the ribs and round the nails; patches over the holes, one of them an old enamel sign
function deck(c,G){const L=G.L,far=L.far,r=rng(71),X0=-300,X1=1300,D0=-210;
  c.save();deckT(c);c.fillStyle='#1c1614';c.fillRect(X0,D0,X1-X0,far-D0+1);
  const courses=[[D0,-52],[-56,40],[36,126],[122,far+1]];
  for(const [a0,b0] of courses){let x=X0-r()*40;
    while(x<X1){const w=56+r()*34,tone=r(),rust=r(),base=dim(dim('#241e1b','#342a24',tone),'#4a2614',rust*.45),a=a0<-100?a0:a0+(r()-.5)*26,b=Math.min(far+1,b0+18);
      c.fillStyle=base;c.fillRect(x,a,w,b-a);
      // the ribs: a lit crest and a dark trough every six units, the light from the front (the sign) a little warm
      c.fillStyle=rgba('#ffd2a6',.06+.04*tone);for(let xx=x+1;xx<x+w-1;xx+=6)c.fillRect(xx,a,1.5,b-a);
      c.fillStyle=rgba('#000000',.32);for(let xx=x+3.6;xx<x+w-1;xx+=6)c.fillRect(xx,a,1.8,b-a);
      // rust: along the ribs from the nails down toward the eaves, in blooms where the water lies
      for(let i=0;i<3+rust*8;i++){const rx=x+r()*w,ry=a+r()*(b-a),lw=1.2+r()*2.4,ln=8+r()*36;c.fillStyle=rgba(pick(r,['#6a3418','#7a4420','#5a2a14','#4a2412']),.18+.32*r());c.fillRect(rx,Math.max(a,ry-ln),lw,ln);}
      for(let i=0;i<rust*3;i++){c.fillStyle=rgba('#5a2a14',.14+.2*r());c.beginPath();c.ellipse(x+r()*w,a+r()*(b-a),4+r()*12,8+r()*22,0,0,TAU);c.fill();}
      // the nails along the purlins, on every other crest
      c.fillStyle=rgba('#0c0a0a',.8);for(let pd=a+10;pd<b-4;pd+=34)for(let xx=x+1.6;xx<x+w-1;xx+=10)c.fillRect(xx,pd,1.2,1.2);
      // this sheet's front edge lies over the course in front of it: its lip, and its shadow
      c.fillStyle=rgba('#000000',.5);c.fillRect(x,a-2.6,w,2.6);c.fillStyle=rgba('#ffd2a6',.12);c.fillRect(x,a,w,.8);
      c.fillStyle=rgba('#000000',.4);c.fillRect(x+w-1.2,a,1.2,b-a);
      x+=w-2.5;}}
  // patches nailed over the holes: newer tin, and an old enamel sign laid flat (ALES, in cream on red)
  for(const [px,pd,pw,ph,a,kind] of [[300,150,36,26,.06,'tin'],[612,52,40,30,-.05,'tin'],[166,40,30,22,.1,'tin'],[700,128,44,24,.04,'sign'],[388,178,28,20,-.08,'tin'],[86,110,34,26,.03,'oil']]){
    c.save();c.translate(px,pd);c.rotate(a);c.fillStyle=rgba('#000000',.45);c.fillRect(-pw/2+1.5,-ph/2-2,pw,ph);
    if(kind==='sign'){c.fillStyle='#3e1a16';c.fillRect(-pw/2,-ph/2,pw,ph);c.strokeStyle=rgba('#c8b48a',.4);c.lineWidth=1;c.strokeRect(-pw/2+2,-ph/2+2,pw-4,ph-4);
      c.save();c.scale(1,-1);c.fillStyle=rgba('#d8c8a0',.38);c.font='700 11px "Alegreya SC",Georgia,serif';c.textAlign='center';c.textBaseline='middle';c.fillText('ALES',0,0);c.restore();
      for(let i=0;i<9;i++){c.fillStyle=rgba(r()<.5?'#1a0c08':'#5a3018',.5);c.beginPath();c.ellipse(-pw/2+r()*pw,-ph/2+r()*ph,1.5+r()*4,1+r()*2.4,0,0,TAU);c.fill();}}
    else if(kind==='oil'){c.fillStyle='#16141a';c.fillRect(-pw/2,-ph/2,pw,ph);c.fillStyle=rgba('#c8d0e0',.07);c.fillRect(-pw/2,ph*.1,pw,ph*.2);c.strokeStyle='#0a0a0c';c.lineWidth=.6;c.beginPath();c.moveTo(-pw/2,-ph/2+4);c.lineTo(pw/2,-ph/2+6);c.stroke();}
    else{c.fillStyle='#3e3f44';c.fillRect(-pw/2,-ph/2,pw,ph);c.fillStyle=rgba('#d8e0f0',.08);for(let xx=-pw/2+1;xx<pw/2;xx+=4)c.fillRect(xx,-ph/2,1.2,ph);c.fillStyle=rgba('#000000',.22);for(let xx=-pw/2+2.6;xx<pw/2;xx+=4)c.fillRect(xx,-ph/2,1.2,ph);
      c.fillStyle=rgba('#6a3418',.3);c.fillRect(-pw/2+r()*pw*.6,-ph/2,4,ph*.6);}
    c.fillStyle='#0c0a0a';for(const [nx,ny] of [[-pw/2+2,-ph/2+2],[pw/2-3,-ph/2+2],[-pw/2+2,ph/2-3],[pw/2-3,ph/2-3]])c.fillRect(nx,ny,1.3,1.3);c.restore();}
  // droppings under the lofts, and the birds' grain
  {const Lo=G.loft;for(let i=0;i<160;i++){const x=Lo.x0-10+r()*(Lo.x1-Lo.x0+30),d=Lo.d0-4-Math.pow(r(),1.6)*70;c.fillStyle=r()<.8?rgba('#d8d4c8',.3+.4*r()):rgba('#c8a050',.5);c.fillRect(x,d,.9+r(),.7+r()*.6);}}
  // the night over the tin, and the light that finds it: the sign's amber up over the eaves at the front, the bulbs over the heap,
  // the cold of the sky far up along the back
  c.fillStyle=rgba('#070407',.34);c.fillRect(X0,D0,X1-X0,far-D0+1);
  c.globalCompositeOperation='lighter';
  for(const [x,d,rx,rd,col,a] of [[260,-20,330,120,'#ffa040',.2],[120,-10,140,70,'#ff5ad8',.07],[G.L.hay.x,G.L.hay.d+20,190,90,'#ffcf86',.07]]){c.save();c.translate(x,d);c.scale(rx/rd,1);
    c.fillStyle=rad(c,0,0,0,rd,[[0,rgba(col,a)],[.5,rgba(col,a*.4)],[1,rgba(col,0)]]);c.fillRect(-rd,-rd,rd*2,rd*2);c.restore();}
  c.fillStyle=lin(c,0,far-60,0,far,[[0,rgba('#8a9ac8',0)],[1,rgba('#8a9ac8',.05)]]);c.fillRect(X0,far-60,X1-X0,60);
  c.globalCompositeOperation='source-over';
  c.restore();
  // the deck's back edge: the flashing turned up over it
  {const a=q(-300,0,far),b=q(1300,0,far);c.fillStyle='#120e0d';c.fillRect(a.x,a.y-4,b.x-a.x,5);c.fillStyle=rgba('#ffcf86',.14);c.fillRect(a.x,a.y-4,b.x-a.x,.8);}
  // the eaves at the front: a gutter, rusted through, along the edge
  {const a=q(-300,0,3),b=q(1300,0,3);c.fillStyle='#1a1210';c.fillRect(a.x,a.y-1,b.x-a.x,5);c.fillStyle=rgba('#ffb25e',.25);c.fillRect(a.x,a.y-1,b.x-a.x,.9);
    const r2=rng(5);for(let i=0;i<40;i++){c.fillStyle=rgba('#6a3418',.5);c.fillRect(-250+r2()*1500,a.y,3+r2()*8,3);}}}

// ---------- the heap ----------
// in slices from the back of it to the front, each slice's top the heap's height there: the back of it lit by the bulbs and the
// hut's door, the front by the sign's glow; straw over all of it. front: only the part in front of the middle, its top raised a
// little, which goes over whoever lies in it (fore)
function hayHeap(c,L,front){const H=L.hay,r=rng(front?303:202),N=26;
  const v0=front?0:34,lift=u=>front?(5.5+1.2*Math.sin(u*9))*Math.pow(Math.max(0,1-u*u),.35):0;
  for(let v=v0;v>=-34;v-=3.4){const d=H.d+v,pts=[];
    for(let i=0;i<=N;i++){const u=i/N*2-1,x=H.x+u*H.w;pts.push(q(x,hayH(L,x,d)+(v===v0?lift(u):0)+(front?0:Math.sin(u*9+v)*.8),d));}
    const base0=q(H.x-H.w-4,0,d),base1=q(H.x+H.w+4,0,d),t=(v+34)/68,col=dim(dim('#7a5c24','#d6b05c',t<.55?t/.55:(1-t)/.45*.7+.3),'#a07830',front&&v===v0?.25:0);
    c.beginPath();c.moveTo(base0.x,base0.y);for(const p of pts)c.lineTo(p.x,p.y);c.lineTo(base1.x,base1.y);c.closePath();
    // the light across it: the dark on the left, the hut's door warm on the right
    c.fillStyle=lin(c,base0.x,0,base1.x,0,[[0,dim(col,'#000000',.3)],[.5,col],[1,dim(col,'#ffcf86',.18)]]);c.fill();
    // clumps of it, darker where they turn from the light
    for(let i=0;i<3;i++){const u=r()*1.8-.9,x=H.x+u*H.w,p=q(x,hayH(L,x,d)*(.4+r()*.5),d);c.fillStyle=rgba(r()<.5?'#3a2808':'#f0d488',r()<.5?.12:.08);c.beginPath();c.ellipse(p.x,p.y,4+r()*8,1.6+r()*2.4,(r()-.5)*.4,0,TAU);c.fill();}}
  // straws all over it, in three colours (a path each)
  const SP=[new Path2D(),new Path2D(),new Path2D()],n=front?120:320;
  for(let i=0;i<n;i++){const u=r()*2-1,v=front?-r()*34:r()*68-34,x=H.x+u*H.w*.98,d=H.d+v,hh=hayH(L,x,d)+(front&&v>-6?lift(u)*r():0),p=q(x,hh,d),a=r()*TAU,l=2.5+r()*5,k=r()<.45?0:r()<.5?1:2;
    SP[k].moveTo(p.x,p.y);SP[k].lineTo(p.x+Math.cos(a)*l,p.y+Math.sin(a)*l*.6);}
  c.lineWidth=.7;['#f0d488','#9a7428','#c8a050'].forEach((col,k)=>{c.strokeStyle=col;c.stroke(SP[k]);});
  // straws standing up along its top
  c.strokeStyle='#ead07c';c.lineWidth=.6;c.beginPath();for(let i=0;i<(front?26:40);i++){const u=r()*2-1,x=H.x+u*H.w*.92,d=front?H.d:H.d+r()*30,p=q(x,hayH(L,x,d)+(front?lift(u):0),d),a=-Math.PI/2+(r()-.5)*1.7,l=2+r()*5;c.moveTo(p.x,p.y+1);c.lineTo(p.x+Math.cos(a)*l,p.y+1+Math.sin(a)*l);}c.stroke();}
// the front of the heap, painted once at a fine scale and stamped over whoever lies in it every frame
let FRONT=null;
function heapFront(){const L=PL(),H=L.hay,key=H.x+','+H.d+','+H.w+','+H.h;if(FRONT&&FRONT.key===key)return FRONT;
  const a=q(H.x-H.w-16,H.h+12,H.d),b=q(H.x+H.w+16,0,H.d-36),x0=a.x-4,y0=a.y-4,x1=b.x+4,y1=b.y+4,s=3,cv=document.createElement('canvas');cv.width=Math.ceil((x1-x0)*s);cv.height=Math.ceil((y1-y0)*s);
  const g=cv.getContext('2d');g.setTransform(s,0,0,s,-x0*s,-y0*s);hayHeap(g,L,true);return FRONT={key,cv,x0,y0,w:x1-x0,h:y1-y0};}
// the fork left standing in it, the split bale beside it, the straw it threw over the tin, feathers
function heapThings(c,L){const H=L.hay,r=rng(404);
  // the straw thrown out over the deck by what came down in it
  c.save();deckT(c);const SP=[new Path2D(),new Path2D()];for(let i=0;i<420;i++){const a=r()*TAU,rr=H.w*(.75+Math.pow(r(),1.8)*1.9),x=H.x+Math.cos(a)*rr,d=H.d+Math.sin(a)*rr*.55,l=2+r()*5,b=r()*TAU,k=r()<.6?0:1;
    if(d>L.far-4)continue;SP[k].moveTo(x,d);SP[k].lineTo(x+Math.cos(b)*l,d+Math.sin(b)*l);}
  c.lineWidth=.8;c.strokeStyle=rgba('#c8a050',.75);c.stroke(SP[0]);c.strokeStyle=rgba('#8a6a2a',.7);c.stroke(SP[1]);
  // feathers, grey and white
  for(let i=0;i<34;i++){const a=r()*TAU,rr=H.w*(.6+r()*2.2),x=H.x+Math.cos(a)*rr,d=H.d+Math.sin(a)*rr*.6;if(d>L.far-6)continue;c.save();c.translate(x,d);c.rotate(r()*TAU);c.strokeStyle=r()<.5?'#8a8a94':'#c8c8d0';c.lineWidth=1.4;c.beginPath();c.moveTo(-3,0);c.quadraticCurveTo(0,1.6,3,0);c.stroke();c.restore();}
  c.restore();
  // the bale, split at its end, beside the heap
  {const x0=H.x+H.w+14,x1=x0+34,d0=H.d+16,d1=d0+18,h=15,A=q(x0,0,d0),B=q(x1,0,d0),Bt=q(x1,h,d0),At=q(x0,h,d0),Ct=q(x1,h,d1),Dt=q(x0,h,d1),Cb=q(x1,0,d1);
    poly(c,[B,Cb,Ct,Bt],'#7a5a24');poly(c,[At,Bt,Ct,Dt],'#c8a050');poly(c,[A,B,Bt,At],'#a8843e');
    c.strokeStyle='#4a3418';c.lineWidth=.9;c.beginPath();for(const u of [.3,.7]){const p0=q(lerp(x0,x1,u),0,d0),p1=q(lerp(x0,x1,u),h,d0),p2=q(lerp(x0,x1,u),h,d1);c.moveTo(p0.x,p0.y);c.lineTo(p1.x,p1.y);c.lineTo(p2.x,p2.y);}c.stroke();
    c.strokeStyle='#e0c070';c.lineWidth=.6;c.beginPath();for(let i=0;i<40;i++){const u=r(),v=r(),p=q(x0+u*(x1-x0),v*h,d0);c.moveTo(p.x,p.y);c.lineTo(p.x+(r()-.5)*5,p.y+(r()-.5)*4);}c.stroke();
    c.fillStyle='#b8913e';c.beginPath();const s0=q(x0-2,h,d0+2),s1=q(x0-14,0,d0-6),s2=q(x0-4,0,d1);c.moveTo(s0.x,s0.y);c.quadraticCurveTo(s1.x,s1.y-4,s1.x,s1.y);c.lineTo(s2.x,s2.y);c.closePath();c.fill();}
  // the fork, stuck in the back of the heap at a lean
  {const x=H.x-H.w*.6,d=H.d+20,b=q(x,hayH(L,x,d)+1,d),t=q(x-16,92,d+10);c.strokeStyle='#4a3420';c.lineWidth=2;c.lineCap='round';c.beginPath();c.moveTo(b.x,b.y);c.lineTo(t.x,t.y);c.stroke();
    c.strokeStyle=rgba('#ffcf86',.22);c.lineWidth=.6;c.beginPath();c.moveTo(b.x+.8,b.y);c.lineTo(t.x+.8,t.y);c.stroke();
    c.strokeStyle='#5a5a62';c.lineWidth=.9;c.beginPath();for(let k=-1;k<=1;k++){c.moveTo(b.x+k*2.6,b.y);c.lineTo(b.x+k*2.6+.6,b.y+7);}c.stroke();}}

// ---------- the lofts ----------
// two tiers of coops across the back on the left: a frame of posts and rails, wire over most bays, slats over the rest with a
// trap and a landing board, nest boxes and roosting birds inside in the dark, a tin roof on top with its front over them
function lofts(c,G){const Lo=G.loft,r=rng(81),{x0,x1,d0,d1,h}=Lo,tier=[0,46,h],bays=[];for(let x=x0;x<x1-4;x+=45)bays.push([x,Math.min(x1,x+45)]);
  // the right end, in shadow: boards
  {const a=q(x1,0,d0),b=q(x1,0,d1),e=q(x1,h,d1),f=q(x1,h,d0);poly(c,[a,b,e,f],'#1a120c');c.strokeStyle=rgba('#000000',.4);c.lineWidth=.8;c.beginPath();for(let hh=8;hh<h;hh+=9){const p0=q(x1,hh,d0),p1=q(x1,hh,d1);c.moveTo(p0.x,p0.y);c.lineTo(p1.x,p1.y);}c.stroke();}
  // each bay's inside: dark, nest boxes on the back wall, a few birds roosting
  for(let t=0;t<2;t++)for(const [bx0,bx1] of bays){const A=q(bx0,tier[t],d0),B=q(bx1,tier[t+1],d0);c.save();c.beginPath();c.rect(A.x,B.y,B.x-A.x,A.y-B.y);c.clip();
    c.fillStyle='#0b0807';c.fillRect(A.x,B.y,B.x-A.x,A.y-B.y);
    const bk0=q(bx0,tier[t],d1),bk1=q(bx1,tier[t+1],d1);c.fillStyle='#16100b';c.fillRect(bk0.x,bk1.y,bk1.x-bk0.x,bk0.y-bk1.y);
    c.strokeStyle='#2a1e12';c.lineWidth=1.4;c.beginPath();for(let hh=tier[t]+14;hh<tier[t+1]-4;hh+=14){const p0=q(bx0,hh,d1),p1=q(bx1,hh,d1);c.moveTo(p0.x,p0.y);c.lineTo(p1.x,p1.y);}c.stroke();
    for(let i=0;i<2+r()*2;i++){const px=lerp(bx0+6,bx1-6,r()),ph=tier[t]+8+r()*(tier[t+1]-tier[t]-18),p=q(px,ph,lerp(d0,d1,.6));c.fillStyle=pick(r,['#2e3038','#383a44','#26282e']);
      c.beginPath();c.ellipse(p.x,p.y,4.6,3.2,0,0,TAU);c.fill();c.beginPath();c.arc(p.x+(r()<.5?-3.6:3.6),p.y-2.6,2,0,TAU);c.fill();c.fillStyle=rgba('#9ad8c0',.18);c.fillRect(p.x-1,p.y-3,2,1.2);}
    c.restore();}
  // the frame: posts and rails, the light on their edges
  c.lineCap='butt';
  for(const [bx] of bays.concat([[x1]])){const a=q(bx,0,d0),b=q(bx,h+4,d0);c.fillStyle='#2a1c12';c.fillRect(a.x-2,b.y,4,a.y-b.y);c.fillStyle=rgba('#ffcf86',.14);c.fillRect(a.x+1.4,b.y,.7,a.y-b.y);}
  for(const hh of tier){const a=q(x0-2,hh,d0),b=q(x1+2,hh,d0);c.fillStyle='#2e2014';c.fillRect(a.x,a.y-3,b.x-a.x,4.4);c.fillStyle=rgba('#ffcf86',.12);c.fillRect(a.x,a.y-3,b.x-a.x,.8);}
  // the fronts: wire on most bays, slats with a trap on the rest
  bays.forEach(([bx0,bx1],i)=>{for(let t=0;t<2;t++){const A=q(bx0+2,tier[t]+2,d0),B=q(bx1-2,tier[t+1]-2,d0),w=B.x-A.x,hgt=A.y-B.y;
    if((i+t)%3===1){c.fillStyle='#2a1d12';for(let x=A.x;x<B.x-1;x+=5.2){c.fillRect(x,B.y,3.4,hgt);c.fillStyle=rgba('#ffcf86',.08);c.fillRect(x+2.6,B.y,.6,hgt);c.fillStyle='#2a1d12';}
      c.fillStyle='#070505';c.beginPath();c.arc(A.x+w/2,A.y-9,5,Math.PI,0);c.fillRect(A.x+w/2-5,A.y-9,10,7);c.fill();
      // the landing board under the trap
      const hb=tier[t]+3,P1=q(bx0+8,hb,d0),P2=q(bx1-8,hb,d0),P3=q(bx1-8,hb,d0-10),P4=q(bx0+8,hb,d0-10);poly(c,[P1,P2,P3,P4],'#3a2818');
      c.fillStyle='#1a120a';c.fillRect(P4.x,P4.y,P3.x-P4.x,2);c.fillStyle=rgba('#ffcf86',.16);c.fillRect(P4.x,P4.y,P3.x-P4.x,.6);
      c.fillStyle=rgba('#d8d4c8',.45);for(let k=0;k<7;k++)c.fillRect(lerp(P4.x,P2.x,r()),lerp(P1.y,P4.y,r()),1,.7);}
    else{c.save();c.beginPath();c.rect(A.x,B.y,w,hgt);c.clip();c.strokeStyle=rgba('#9a9aa2',.3);c.lineWidth=.45;c.beginPath();
      for(let x=A.x-hgt;x<B.x;x+=3.4){c.moveTo(x,A.y);c.lineTo(x+hgt,B.y);c.moveTo(x+hgt,A.y);c.lineTo(x,B.y);}c.stroke();c.restore();}}});
  // the roof: tin, its front edge over the bays, rust, a tyre and a brick to hold it
  {const a=q(x0-8,h+4,d0-8),b=q(x1+8,h+4,d0-8),e=q(x1+8,Lo.roof,d1+2),f=q(x0-8,Lo.roof,d1+2);poly(c,[a,b,e,f],'#3a302c');
    c.strokeStyle=rgba('#000000',.32);c.lineWidth=1.2;c.beginPath();for(let x=x0-6;x<x1+8;x+=5){const p0=q(x,h+4,d0-8),p1=q(x,Lo.roof,d1+2);c.moveTo(p0.x,p0.y);c.lineTo(p1.x,p1.y);}c.stroke();
    for(let i=0;i<10;i++){c.fillStyle=rgba('#6a3418',.25+.3*r());const p=q(x0+r()*(x1-x0),h+6,lerp(d0,d1,r()));c.fillRect(p.x,p.y,3+r()*10,2+r()*4);}
    c.fillStyle='#120e0c';c.fillRect(a.x,a.y,b.x-a.x,3.4);c.fillStyle=rgba('#ffcf86',.18);c.fillRect(a.x,a.y,b.x-a.x,.8);
    const t=q(x0+40,h+8,lerp(d0,d1,.5));c.strokeStyle='#0c0b0d';c.lineWidth=3;c.beginPath();c.ellipse(t.x,t.y-2,8,3,0,0,TAU);c.stroke();
    const bb=q(x1-36,h+7,lerp(d0,d1,.4));c.fillStyle='#5a2a1e';c.fillRect(bb.x-5,bb.y-4,10,4);}
  // a feed sack and a water pan in front of them
  {const p=q(x1+18,0,d0-10);K.sack(c,p.x,p.y,18,20,{col:'#6a5a3e',seed:3});const w=q(x0+70,0,d0-20);c.fillStyle='#2a2a2e';c.beginPath();c.ellipse(w.x,w.y,10,3,0,0,TAU);c.fill();c.fillStyle=rgba('#9ab4d8',.25);c.beginPath();c.ellipse(w.x,w.y-.6,8,2,0,0,TAU);c.fill();}}

// ---------- the stovepipe ----------
function pipe(c,G){const P0=G.pipe,b=q(P0.x,0,P0.d),t=q(P0.x,P0.h,P0.d),w=13;
  // the flashing round its foot: a cone of tin, tarred
  c.fillStyle='#16110f';c.beginPath();c.moveTo(b.x-14,b.y+1);c.lineTo(b.x-w/2-1,b.y-9);c.lineTo(b.x+w/2+1,b.y-9);c.lineTo(b.x+14,b.y+1);c.closePath();c.fill();
  c.fillStyle=rgba('#ffcf86',.12);c.fillRect(b.x+w/2-1,b.y-9,2,9);
  // the pipe: black iron in lengths, soot at the joints, rust, the hut's lamp warm down its right side
  c.fillStyle=lin(c,b.x-w/2,0,b.x+w/2,0,[[0,'#0a0909'],[.35,'#1c1918'],[.7,'#2c2420'],[.88,'#5a4030'],[1,'#1a1412']]);c.fillRect(b.x-w/2,t.y,w,b.y-t.y-8);
  c.fillStyle='#080707';for(let y=b.y-38;y>t.y+8;y-=34){c.fillRect(b.x-w/2-1.4,y,w+2.8,3);c.fillStyle=rgba('#ffcf86',.14);c.fillRect(b.x-w/2-1.4,y,w+2.8,.7);c.fillStyle='#080707';}
  c.fillStyle=rgba('#7a3a14',.45);c.fillRect(b.x-2,t.y+16,2.4,34);c.fillRect(b.x+2,b.y-44,2,26);
  c.fillStyle=lin(c,0,t.y,0,t.y+30,[[0,rgba('#000000',.6)],[1,rgba('#000000',0)]]);c.fillRect(b.x-w/2,t.y,w,30);
  // its hat on three legs, and a guy wire down to the deck
  c.fillStyle='#120e0c';c.beginPath();c.moveTo(t.x-15,t.y-7);c.lineTo(t.x,t.y-17);c.lineTo(t.x+15,t.y-7);c.closePath();c.fill();c.fillRect(t.x-w/2,t.y-7,1.8,7);c.fillRect(t.x+w/2-1.8,t.y-7,1.8,7);c.fillRect(t.x-.9,t.y-7,1.8,7);
  c.fillStyle=rgba('#ffcf86',.2);c.beginPath();c.moveTo(t.x,t.y-17);c.lineTo(t.x+15,t.y-7);c.lineTo(t.x+12,t.y-7);c.closePath();c.fill();
  const g=q(P0.x+70,0,P0.d-26),m=q(P0.x,P0.h*.72,P0.d);c.strokeStyle=rgba('#1a1614',.9);c.lineWidth=.7;c.beginPath();c.moveTo(m.x+w/2,m.y);c.lineTo(g.x,g.y);c.stroke();}

// ---------- the hatch house ----------
// a hut of tin over the way down, a lean-to roof; its door stands open on the lamp inside and the top of the ladder in its hatch
function hut(c,G){const U=G.hut,D=G.door,r=rng(91);
  const FA=q(U.x0,0,U.d0),FB=q(U.x1,0,U.d0),FBt=q(U.x1,U.h0,U.d0),FAt=q(U.x0,U.h0,U.d0),RB=q(U.x1,0,U.d1),RBt=q(U.x1,U.h1,U.d1);
  // the right side, in shadow
  poly(c,[FB,RB,RBt,FBt],'#1a1514');c.strokeStyle=rgba('#000000',.4);c.lineWidth=1;c.beginPath();for(let d=U.d0+3;d<U.d1;d+=4){const p0=q(U.x1,0,d),p1=q(U.x1,lerp(U.h0,U.h1,(d-U.d0)/(U.d1-U.d0)),d);c.moveTo(p0.x,p0.y);c.lineTo(p1.x,p1.y);}c.stroke();
  // the front: corrugated tin, rusting from the ground up and round the nails
  poly(c,[FA,FB,FBt,FAt],'#2c2522');
  c.fillStyle=rgba('#ffd2a6',.07);for(let x=FA.x+1;x<FB.x;x+=5)c.fillRect(x,FAt.y,1.3,FA.y-FAt.y);c.fillStyle=rgba('#000000',.28);for(let x=FA.x+3.2;x<FB.x;x+=5)c.fillRect(x,FAt.y,1.5,FA.y-FAt.y);
  c.fillStyle=lin(c,0,FA.y-50,0,FA.y,[[0,rgba('#5a2a14',0)],[1,rgba('#5a2a14',.55)]]);c.fillRect(FA.x,FA.y-50,FB.x-FA.x,50);
  for(let i=0;i<14;i++){c.fillStyle=rgba(pick(r,['#6a3418','#7a4420','#4a2412']),.25+.3*r());c.fillRect(FA.x+r()*(FB.x-FA.x),FAt.y+r()*(FA.y-FAt.y)*.9,1.5+r()*2,6+r()*24);}
  c.fillStyle='#0c0a0a';for(const hh of [10,80,150])for(let x=FA.x+2;x<FB.x;x+=10)c.fillRect(x,FA.y-hh,1.2,1.2);
  // the doorway: the lamp's light inside, the hatch in the floor with the ladder's top standing out of it
  const d0=q(D.x0,0,U.d0),d1=q(D.x1,D.h,U.d0),dw=d1.x-d0.x,dh=d0.y-d1.y;
  c.fillStyle=lin(c,0,d1.y,0,d0.y,[[0,'#5a3418'],[.45,'#a0602a'],[.8,'#d89048'],[1,'#ffc070']]);c.fillRect(d0.x,d1.y,dw,dh);
  c.fillStyle=rgba('#2a1406',.55);c.fillRect(d0.x,d1.y,dw*.22,dh);c.fillStyle=rgba('#2a1406',.35);c.fillRect(d0.x,d1.y,dw,dh*.12);
  // the hatch: the kitchen's light coming up out of it, the ladder's rails standing up black against it
  c.fillStyle='#ffd590';c.fillRect(d0.x+dw*.12,d0.y-10,dw*.76,7);glowAt(c,d0.x+dw*.5,d0.y-8,26,'#ffb866',.5,.6);
  c.fillStyle='#24140a';c.fillRect(d0.x+dw*.22,d0.y-34,2.6,32);c.fillRect(d0.x+dw*.7,d0.y-34,2.6,32);for(let y=d0.y-30;y<d0.y-4;y+=7)c.fillRect(d0.x+dw*.22,y,dw*.5,1.6);
  {const lx=d0.x+dw*.62,ly=d1.y+dh*.3;c.fillStyle='#1a120a';c.fillRect(lx-.5,ly-12,1,12);c.fillStyle='#ffe2a8';c.fillRect(lx-2.4,ly,4.8,6);c.fillStyle='#1a120a';c.fillRect(lx-3,ly-1.4,6,1.6);c.fillRect(lx-3,ly+6,6,1.4);glowAt(c,lx,ly+3,30,'#ffc070',.55);}
  // the frame, and the door leaf standing open, out and to the left: planks on a Z of battens
  c.fillStyle='#16100c';c.fillRect(d0.x-2.4,d1.y-3,2.4,dh+3);c.fillRect(d1.x,d1.y-3,2.4,dh+3);c.fillRect(d0.x-2.4,d1.y-3,dw+4.8,3);
  {const op=1.95,fx=D.x0+Math.cos(op)*(D.x1-D.x0),fd=U.d0-Math.sin(op)*(D.x1-D.x0);
    const h0=q(D.x0,0,U.d0),h1=q(D.x0,D.h,U.d0),f0=q(fx,0,fd),f1=q(fx,D.h,fd);poly(c,[h0,f0,f1,h1],'#2a1c12');
    c.strokeStyle=rgba('#000000',.4);c.lineWidth=.8;c.beginPath();for(let u=.2;u<1;u+=.2){c.moveTo(lerp(h0.x,f0.x,u),lerp(h0.y,f0.y,u));c.lineTo(lerp(h1.x,f1.x,u),lerp(h1.y,f1.y,u));}c.stroke();
    c.strokeStyle='#1a120c';c.lineWidth=2.4;c.beginPath();for(const u of [.16,.84]){c.moveTo(lerp(h0.x,h1.x,u),lerp(h0.y,h1.y,u));c.lineTo(lerp(f0.x,f1.x,u),lerp(f0.y,f1.y,u));}c.moveTo(lerp(h0.x,h1.x,.16),lerp(h0.y,h1.y,.16));c.lineTo(lerp(f0.x,f1.x,.84),lerp(f0.y,f1.y,.84));c.stroke();
    c.strokeStyle=rgba('#ffcf86',.3);c.lineWidth=.7;c.beginPath();c.moveTo(h0.x,h0.y);c.lineTo(h1.x,h1.y);c.stroke();}
  // the roof: a sheet of tin over it all, sloping to the back, a stone on it
  {const a=q(U.x0-6,U.h0+2,U.d0-6),b=q(U.x1+6,U.h0+2,U.d0-6),e=q(U.x1+6,U.h1+2,U.d1+4),f=q(U.x0-6,U.h1+2,U.d1+4);poly(c,[a,b,e,f],'#352c28');
    c.strokeStyle=rgba('#000000',.3);c.lineWidth=1.2;c.beginPath();for(let x=U.x0-4;x<U.x1+6;x+=5){const p0=q(x,U.h0+2,U.d0-6),p1=q(x,U.h1+2,U.d1+4);c.moveTo(p0.x,p0.y);c.lineTo(p1.x,p1.y);}c.stroke();
    c.fillStyle='#120e0c';c.fillRect(a.x,a.y,b.x-a.x,3);c.fillStyle=rgba('#ffcf86',.2);c.fillRect(a.x,a.y,b.x-a.x,.8);
    const s=q(U.x0+30,U.h0+6,U.d0+12);c.fillStyle='#3a3436';c.beginPath();c.ellipse(s.x,s.y,7,3.4,0,0,TAU);c.fill();}
  // a horseshoe over the door, for luck
  {const p=q((D.x0+D.x1)/2,D.h+7,U.d0);c.strokeStyle='#6a6a70';c.lineWidth=1.3;c.beginPath();c.arc(p.x,p.y,3,.1*Math.PI,.9*Math.PI,true);c.stroke();}
  // its light lying out over the deck
  c.save();c.globalCompositeOperation='lighter';deckT(c);const cx=(D.x0+D.x1)/2-6,cd=U.d0-34;c.translate(cx,cd);c.scale(1.5,1);
  c.fillStyle=rad(c,0,0,4,56,[[0,rgba('#ffb866',.32)],[.5,rgba('#ffa050',.12)],[1,rgba('#ffa050',0)]]);c.beginPath();c.arc(0,0,56,0,TAU);c.fill();c.restore();
  glowAt(c,d0.x+dw/2,d0.y-dh*.4,70,'#ffb866',.22);}

// ---------- the string of bulbs: from the hut to the lofts ----------
function bulbLine(G){const U=G.hut,Lo=G.loft,a=q(U.x0-4,U.h0-6,U.d0+2),b=q(Lo.x1+4,Lo.h+2,Lo.d0+2),n=16,pts=[];
  for(let i=1;i<n;i++){const u=i/n;pts.push({x:lerp(a.x,b.x,u),y:lerp(a.y,b.y,u)+34*4*u*(1-u),k:i});}return{a,b,pts};}
function bulbs(c,G){const B=bulbLine(G);c.strokeStyle=rgba('#1a1414',.9);c.lineWidth=.6;c.beginPath();c.moveTo(B.a.x,B.a.y);c.quadraticCurveTo((B.a.x+B.b.x)/2,(B.a.y+B.b.y)/2+68,B.b.x,B.b.y);c.stroke();
  for(const p of B.pts){c.fillStyle='#1a1414';c.fillRect(p.x-.9,p.y,1.8,2);glowAt(c,p.x,p.y+2.6,10,K.WIN[p.k%3===0?2:p.k%3===1?0:1],.28);}}

// ---------- the Pit behind ----------
// the far wall across the back, the near walls' junk at the sides, the shelf of rock with the spike high on the left; the top of the
// picture goes to one dark (a phone held upright sees the layer's top row stretched up over the sky)
function pit(c,G){const L=G.L,yb=q(0,0,L.far).y,X0=-160,X1=1140,T0=-92;
  const F=K.farSide(c,X0,X1,T0,yb+6,{k:1,rs:50,seed:5011,lit:.5,fire:.2});
  // the near walls: in from the edges, leaning out as they go up
  K.junkWall(c,-1,y=>lerp(126,-40,clamp((yb-y)/(yb-T0),0,1))+Math.sin(y*.05)*10,T0,yb+10,{seed:907,u:1});
  K.junkWall(c,1,y=>lerp(832,980,clamp((yb-y)/(yb-T0),0,1))+Math.sin(y*.06+1)*10,T0,yb+10,{seed:911,u:1});
  // the shelf of rock with the spike at its end
  const sp=G.sp;K.spikeRock(c,sp.x,sp.y,SPS,{wall:-200,seed:53});K.armHalo(c,sp.x,sp.y,SPS);
  // the drop behind the bar: the smoke over the floor of the Pit, warm with its fires, between the roof's edge and the far side
  c.fillStyle=lin(c,0,yb-56,0,yb,[[0,rgba('#24140f',0)],[1,rgba('#24140f',.6)]]);c.fillRect(X0-60,yb-56,X1-X0+120,58);
  c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,0,yb-44,0,yb,[[0,rgba('#ff8a4a',0)],[1,rgba('#ff8a4a',.1)]]);c.fillRect(X0-60,yb-44,X1-X0+120,46);c.restore();
  // the dark going up, to one colour at the very top
  c.fillStyle=lin(c,0,T0,0,T0+150,[[0,'#050407'],[.25,rgba('#050407',.85)],[1,rgba('#050407',0)]]);c.fillRect(X0-60,T0-4,X1-X0+120,154);c.fillStyle='#050407';c.fillRect(X0-60,T0-8,X1-X0+120,12);
  return F;}

// ---------- the scene ----------
let LIVE=null;
function paint(c){const G=geo(),L=G.L;
  const F=pit(c,G);
  deck(c,G);
  // what stands on the deck, back to front
  lofts(c,G);pipe(c,G);hut(c,G);bulbs(c,G);
  heapThings(c,L);hayHeap(c,L,false);
  // the sign's amber coming up over the eaves at the front, a touch of its pink bird at the left
  c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,0,GB+30,0,GB-60,[[0,rgba('#ffa040',.1)],[1,rgba('#ffa040',0)]]);c.fillRect(-200,GB-60,1500,110);c.restore();
  // the near edge of the picture: the deck going on toward us into the dark
  c.fillStyle=lin(c,0,GB-10,0,GB+140,[[0,rgba('#000000',0)],[1,rgba('#000000',.65)]]);c.fillRect(-200,GB-10,1500,150);
  LIVE={G,lit:F.lit,signs:F.signs,B:bulbLine(G),yb:q(0,0,L.far).y,yt:-92};
  for(let tone=0;tone<3;tone++)for(const fa of [-1,1]){for(const pk of [0,1])birdSpr(tone,fa,true,pk);for(let ph=0;ph<6;ph++)birdSpr(tone,fa,false,ph);}}

// ---------- what moves ----------
// the birds: where each one sits (on the lofts' boards and roof, the hut's roof, the back edge, the deck, the bulbs' wire), and for
// some of them a flight down to it as they settle after the fall
let BIRDS=null;
function birds(G){if(BIRDS&&BIRDS.G===G)return BIRDS.list;const r=rng(1201),Lo=G.loft,U=G.hut,L=G.L,list=[],B=bulbLine(G);
  const add=(x,y,o)=>list.push(Object.assign({x,y,fa:r()<.5?-1:1,s:1.45+r()*.35,tone:r(),ph:r()*TAU,peck:.4+r()*.8,fly:r()<.55,dl:r(),sx:(r()-.5)*220,sy:90+r()*140},o||{}));
  const lr=d=>lerp(Lo.h+4,Lo.roof,clamp((d-(Lo.d0-8))/(Lo.d1-Lo.d0+10),0,1)),ur=d=>lerp(U.h0,U.h1,clamp((d-(U.d0-6))/(U.d1-U.d0+10),0,1))+2;
  for(let i=0;i<6;i++){const d=lerp(Lo.d0,Lo.d1,.3+r()*.5),p=q(lerp(Lo.x0+6,Lo.x1-6,r()),lr(d)+.5,d);add(p.x,p.y);}
  for(let i=0;i<3;i++){const p=q(lerp(Lo.x0+8,Lo.x1-8,(i+.5)/3)+(i===1?14:0),49,Lo.d0-5);add(p.x,p.y,{fly:false});}
  for(let i=0;i<3;i++){const d=lerp(U.d0,U.d1,.3+r()*.4),p=q(lerp(U.x0+8,U.x1-8,r()),ur(d),d);add(p.x,p.y);}
  for(let i=0;i<3;i++){const p=q(lerp(Lo.x1+30,G.pipe.x-30,r()),0,L.far-3);add(p.x,p.y-3,{ground:1});}
  for(let i=0;i<3;i++){const p=q(lerp(Lo.x0+20,Lo.x1+40,r()),0,lerp(Lo.d0-50,Lo.d0-14,r()));add(p.x,p.y,{ground:1,fly:r()<.4});}
  for(const k of [4,6,11]){const p=B.pts[k];add(p.x,p.y-.5,{s:1.35});}
  return(BIRDS={G,list}).list;}
// a bird drawn at size s (sitting: pose 0 head up, 1 pecking; flying: f the wing's beat, -1 to 1)
function birdShape(g,tone,sit,pose,f){const s=1,col=['#4a4e5c','#3a3e4a','#5c5e6a'][tone];g.fillStyle=col;
  if(sit){const pk=pose?1.8:0;g.beginPath();g.ellipse(0,-3*s,3.6*s,2.4*s,-.15+pk*.12,0,TAU);g.fill();g.beginPath();g.arc(2.9*s,-5.4*s+pk*s,1.6*s,0,TAU);g.fill();
    g.beginPath();g.moveTo(-3*s,-3.6*s);g.lineTo(-6.6*s,-2.2*s);g.lineTo(-3*s,-1.4*s);g.closePath();g.fill();
    g.fillStyle='#8a7a58';g.fillRect(4.3*s,-5.7*s+pk*s,1.4*s,.7*s);g.fillStyle='rgba(255,176,110,.28)';g.beginPath();g.ellipse(.6*s,-1.6*s,2.8*s,.8*s,-.1,0,TAU);g.fill();
    g.fillStyle='rgba(150,220,200,.32)';g.beginPath();g.arc(2.4*s,-4.3*s+pk*.5*s,.9*s,0,TAU);g.fill();}
  else{const w=5*s;g.beginPath();g.ellipse(0,0,3.4*s,1.5*s,0,0,TAU);g.fill();g.beginPath();g.arc(3.3*s,-.5*s,1.3*s,0,TAU);g.fill();
    g.beginPath();g.moveTo(-3*s,0);g.lineTo(-5.8*s,-.8*s);g.lineTo(-5.4*s,s);g.closePath();g.fill();
    g.globalAlpha=.7;g.beginPath();g.moveTo(.6*s,-.4*s);g.quadraticCurveTo(1.2*s,-w*f*.9,-1.6*s,-w*f-.6*s);g.lineTo(-1.4*s,-.2*s);g.closePath();g.fill();g.globalAlpha=1;
    g.fillStyle=tone===1?'#6a6e7a':'#787a86';g.beginPath();g.moveTo(-.4*s,-.4*s);g.quadraticCurveTo(-.4*s,-w*f*1.1,-3.2*s,-w*f*1.2-.4*s);g.lineTo(1.4*s,-.6*s);g.closePath();g.fill();}}
// the birds are stamped from small pictures made once: three tones, sitting (head up or pecking) or flying (six beats of the wing),
// facing either way. The picture is 14 by 16 of the bird's own units, its foot (or its middle, flying) at (7, 8)
const BSPR={};
function birdSpr(tone,fa,sit,pose){const key=tone+'|'+fa+'|'+(sit?'s':'f')+pose;let cv=BSPR[key];if(cv)return cv;const U=4;cv=document.createElement('canvas');cv.width=14*U;cv.height=16*U;
  const g=cv.getContext('2d');g.setTransform(U*fa,0,0,U,7*U,8*U);birdShape(g,tone,sit,pose,sit?0:Math.sin(pose/6*TAU));return BSPR[key]=cv;}
function bird(x,y,b,t,flying,flap){const tone=b.tone<.3?0:b.tone<.7?1:2,s=b.s;let spr;
  if(!flying){const pk=b.ground&&Math.sin(t*b.peck*2.2+b.ph*3)>.86?1:0,fa=!b.ground&&Math.sin(t*.37+b.ph*2)>.9?-b.fa:b.fa;spr=birdSpr(tone,fa,true,pk);}
  else spr=birdSpr(tone,b.fa,false,Math.floor(((flap/TAU)%1+1)%1*6));
  ctx.drawImage(spr,x-7*s,y-8*s,14*s,16*s);}
const SMOKE=(()=>{const r=rng(17),a=[];for(let i=0;i<6;i++)a.push({ph:i/6,dx:(r()-.5)*.6,sz:.8+r()*.5});return a;})();
function live(){if(!LIVE)return;const G=LIVE.G,t=S.t;ctx.save();
  // the kitchen's smoke out of the stovepipe, drifting left and up into the dark; a spark now and then
  {const p=q(G.pipe.x,G.pipe.h+8,G.pipe.d),spr=K.puffSpr('#a49aa8');for(const s of SMOKE){const u=(t*.16+s.ph)%1,a=.62*(1-u)*Math.min(1,u*7);if(a<.05)continue;const y=p.y-u*150,x=p.x-u*u*56+Math.sin(u*5+s.ph*9)*7+s.dx*u*34,rr=(6+u*20)*s.sz;K.stamp(ctx,spr,x,y,rr,a);}
    ctx.fillStyle='#ffb25e';for(let i=0;i<3;i++){const u=((t*.7+i*.37)%1);if(u>.5)continue;const y=p.y-4-u*60,x=p.x-u*16+Math.sin(t*3+i*2)*3;ctx.globalAlpha=.8*(1-u*2);ctx.fillRect(x,y,1.1,1.1);}ctx.globalAlpha=1;}
  // the far side: a window or two flickering (a fire, a screen), the signs buzzing
  {const W=LIVE.lit;ctx.globalCompositeOperation='lighter';for(let n=0;n<W.length;n+=5*13){if(W[n+1]<LIVE.yb-130)continue;const f=Math.sin(t*7.3+n)*Math.sin(t*2.9+n*.3);if(f<.3)continue;ctx.globalAlpha=.25*f;ctx.fillStyle=K.WIN[W[n+4]];ctx.fillRect(W[n],W[n+1],W[n+2],W[n+3]);}
    const Sg=LIVE.signs,yb=LIVE.yb,yt=LIVE.yt;for(let n=0;n<Sg.length;n+=4){const up=clamp((yb-Sg[n+1])/(yb-yt),0,1);if(up>.6)continue;const a=(.2+.2*Math.sin(t*3+Sg[n]))*(1-up*1.4);ctx.globalAlpha=Math.max(0,a);ctx.fillStyle=K.WIN[(Sg[n+3]+1)%3];ctx.fillRect(Sg[n]-Sg[n+2],Sg[n+1]-6,Sg[n+2]*2,12);}
    // the bulbs from the hut to the lofts
    for(const p of LIVE.B.pts){const a=.55+.45*Math.sin(t*2.3+p.k*1.7),col=K.WIN[p.k%3===0?2:p.k%3===1?0:1];ctx.globalAlpha=a;ctx.fillStyle=col;ctx.fillRect(p.x-1.1,p.y+1.4,2.2,2.4);ctx.globalAlpha=a*.35;ctx.fillRect(p.x-2.6,p.y,5.2,5.2);}
    // the sign under the eaves buzzing: its amber over the eaves catching
    const fl=Math.sin(t*17.3)*Math.sin(t*5.1)>.9&&!(typeof reduceMotion!=='undefined'&&reduceMotion)?.4:1;if(fl<1){ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.18;ctx.fillStyle='#000000';ctx.fillRect(-200,GB-60,1500,120);}
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;}
  // the arm on the spike, high on the wall
  {const sp=G.sp;K.arm(ctx,sp.x,sp.y,SPS,t,{gore:S.gore!=="off"});}
  // the birds
  {const A=S.act1&&S.act1.birds,list=birds(G);
    for(const b of list){let x=b.x,y=b.y,fly=false,flap=0;
      if(A&&b.fly){const land=A.t0+(.15+b.dl*.85)*(A.settle||3),dur=1.1+b.dl*.6,u=(t-(land-dur))/dur;
        if(t<land){fly=true;const uu=clamp(u,0,1),e=1-Math.pow(1-uu,2);x=b.x+b.sx*(1-e)+Math.sin(uu*5+b.ph)*12*(1-uu);y=b.y-b.sy*(1-e)-Math.sin(uu*Math.PI)*16;flap=t*(24+b.dl*8);
          if(u<0){x=b.x+b.sx+Math.sin(t*2+b.ph)*30;y=b.y-b.sy-10+Math.sin(t*3+b.ph)*8;}}}
      bird(x,y,b,t,fly,flap);}}
  ctx.restore();}
// over the people: the front of the heap, over whoever lies in it
function fore(c){c=c||ctx;const F=heapFront();c.drawImage(F.cv,F.x0,F.y0,F.w,F.h);}
// the light that rims them: the hut's open door, on the right
function light(f){const G=LIVE?LIVE.G:geo(),D=G.door,p=q((D.x0+D.x1)/2,D.h*.55,G.hut.d0);return{light:{x:p.x-f.dep*PSX,y:p.y+f.dep*PSY}};}
// where things are, for the scene (worked out from ACT1_PLACES each time it is read)
function layoutNow(){const G=geo();return{hut:G.hut,door:G.door,lofts:G.loft,pipe:G.pipe,spike:G.sp,doorAt:{x:(G.door.x0+G.door.x1)/2,dep:G.hut.d0+4}};}
E.S.sumproof={paint,live,fore,light,get LAYOUT(){return layoutNow();}};
})();
// ===== ENV SUMPROOF END =====
