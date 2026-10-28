// ===== ENV YARD =====
// ---------- the Pit's kit ----------
// What the places of the Pit share (the yard here, the stair-street and the Shelf after it in build.py's SCENES): the light of the
// Pit at each time of day, the walls of shacks on walkways that rise up every side of it, the fronts of nearer shacks, boards, tin
// and oilcloth, the view down past an edge, the small canvases the moving lights and the smoke are stamped from, the pieces of a
// place that stand among the people by their depth, and the picture above the layer that a phone held upright looks up into.
// Act I is soot, oilcloth and rust: no gold anywhere.
(()=>{const E=EnvLook;if(E.pitKit)return;const {rng,lerp,clamp,mix,rgba,lin,rad,TAU}=E;
// the time of day the scene asks for (S.act1): night, morning (sun-up) or dusk, else day
function tod(){const A=typeof S!=='undefined'&&S?S.act1:null;return!A?'day':A.night?'night':A.morning?'morning':A.dusk?'dusk':'day';}
// the light at each time: sky (the far-up sky, top and bottom), air (the haze of the Pit high, middle and low), light (what falls on
// the tops of things from far above) and its strength, amb (the dark everything sinks toward) and how far, wall (the rock and the
// junk), win (the share of windows lit) and winA (how bright), lamp and fire (how much the lamps and fires burn), dirt, mist, smoke
const PAL={
  day:{key:'day',sky:['#efe6cf','#cfc4a8'],air:['#968e7e','#5c564e','#302c28'],light:'#f2e4c4',lightA:.32,amb:'#1e1a17',ambK:.26,wall:'#2a2420',
    win:.14,winA:.5,lamp:.45,fire:.4,dirt:['#433930','#2c2520'],mist:0,smoke:'#8c8478'},
  night:{key:'night',sky:['#05060e','#141626'],air:['#1a1824','#121019','#0c0b0f'],light:'#7a84b4',lightA:.07,amb:'#05050a',ambK:.66,wall:'#0f0d11',
    win:.5,winA:.92,lamp:1,fire:1,dirt:['#1c1816','#141110'],mist:0,smoke:'#2e2a2c'},
  morning:{key:'morning',sky:['#f6dcc6','#bccad8'],air:['#9aa6b0','#66727c','#363c44'],light:'#e4eef8',lightA:.3,amb:'#121820',ambK:.3,wall:'#22262a',
    win:.1,winA:.6,lamp:.4,fire:.35,dirt:['#3a3836','#282726'],mist:1,smoke:'#a8aeb4'},
  dusk:{key:'dusk',sky:['#2e2448','#f0905a'],air:['#a0645a','#523a48','#201820'],light:'#ffb07a',lightA:.26,amb:'#120e18',ambK:.46,wall:'#181216',
    win:.36,winA:.88,lamp:.9,fire:.8,dirt:['#2e2622','#201a18'],mist:0,smoke:'#4a3c40'}};
function pal(){return PAL[tod()];}
// colours are mixed a great many times over: the blend is taken to a sixteenth and each mix kept
const JM=new Map();
function jm(a,b,t){let A=JM.get(a);if(!A){A=new Map();JM.set(a,A);}let R=A.get(b);if(!R){R=[];A.set(b,R);}const q=Math.round(clamp(t,0,1)*16);return R[q]||(R[q]=mix(a,b,q/16));}
// a material in the place's light (k: how deep in shadow), and its top, lit from far above
const shade=(P,col,k)=>jm(col,P.amb,P.ambK*(k??1)),topLit=(P,col,k)=>jm(shade(P,col,.6),P.light,P.lightA*(k??1));
// the screen-world point of (x, h above the floor, depth d)
const Q=(x,h,d)=>({x:x+d*PSX,y:GB-h-d*PSY});
function poly(c,pts){c.beginPath();c.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)c.lineTo(pts[i].x,pts[i].y);c.closePath();}
// an uneven round shape (a puddle, a patch of damp): rx by ry, its edge wandering
function blob(c,cx,cy,rx,ry,r,n){n=n||11;const P2=[];for(let i=0;i<n;i++){const a=i/n*TAU,k=.72+r()*.42;P2.push([cx+Math.cos(a)*rx*k,cy+Math.sin(a)*ry*k]);}
  c.beginPath();const m=(i)=>{const a=P2[i%n],b=P2[(i+1)%n];return[(a[0]+b[0])/2,(a[1]+b[1])/2];};let q=m(0);c.moveTo(q[0],q[1]);
  for(let i=1;i<=n;i++){const p=P2[i%n];q=m(i);c.quadraticCurveTo(p[0],p[1],q[0],q[1]);}c.closePath();}
// ---------- the small canvases, made once ----------
const SPR={};
function spr(key,w,h,fn){if(SPR[key])return SPR[key];const cv=document.createElement('canvas');cv.width=w;cv.height=h;fn(cv.getContext('2d'),w,h);return SPR[key]=cv;}
const glowSpr=col=>spr('g'+col,64,64,(g)=>{g.fillStyle=rad(g,32,32,0,32,[[0,rgba(col,1)],[.22,rgba(col,.5)],[.55,rgba(col,.14)],[1,rgba(col,0)]]);g.fillRect(0,0,64,64);});
const puffSpr=col=>spr('p'+col,64,64,(g)=>{g.fillStyle=rad(g,32,32,0,32,[[0,rgba(col,.55)],[.5,rgba(col,.24)],[1,rgba(col,0)]]);g.fillRect(0,0,64,64);});
// a soft light added at (x, y), r across, squashed by sq (the caller sets 'lighter')
function glowAt(c,x,y,r,col,a,sq){if(!(a>0.003))return;c.globalAlpha=Math.min(1,a);const s=sq||1;c.drawImage(glowSpr(col),x-r,y-r*s,r*2,r*2*s);}
// smoke going up from each source {x, y, s (size), sp (how fast), n (puffs), dx (drift), h (how high it goes), a, ph}
function smoke(c,srcs,t,col,a){const pf=puffSpr(col);for(const s of srcs){const n=s.n||6;
  for(let q=0;q<n;q++){const u=((t*(s.sp||.12)+q/n+(s.ph||0))%1),R=(s.s||8)*(1+u*3.2),x=s.x+Math.sin(u*4+q*1.7+(s.ph||0)*9)*6*u+u*(s.dx??18),y=s.y-u*(s.h||150);
    c.globalAlpha=(a??1)*(s.a??.5)*(1-u)*Math.min(1,u*5);c.drawImage(pf,x-R,y-R,R*2,R*2);}}
  c.globalAlpha=1;}
// ---------- boards, tin and oilcloth (on a face square to the eye, in screen units) ----------
// boards standing side by side: seams, a few darker or paler, nail heads at the rails, the weather at the foot
function boards(c,x0,y0,x1,y1,o){const r=rng(o.seed||3),bw=o.bw||9,P=o.pal;c.fillStyle=o.base;c.fillRect(x0,y0,x1-x0,y1-y0);
  for(let x=x0;x<x1;){const w=bw*(.75+r()*.5),v=r();
    if(v<.3){c.fillStyle=rgba('#000000',.1+.12*r());c.fillRect(x,y0,w,y1-y0);}else if(v>.82){c.fillStyle=rgba('#e8dcc4',.03+.035*r());c.fillRect(x,y0,w,y1-y0);}
    if(r()<.12){c.fillStyle=rgba('#000000',.4);c.fillRect(x+w*.4,y0+(y1-y0)*r(),.6,(y1-y0)*.3);}
    c.fillStyle=rgba('#000000',.5);c.fillRect(x,y0,.9,y1-y0);c.fillStyle=rgba('#ffffff',.03);c.fillRect(x+.9,y0,.5,y1-y0);x+=w;}
  if(o.rails)for(const ry of o.rails){c.fillStyle=rgba('#000000',.3);c.fillRect(x0,ry+2.4,x1-x0,1);c.fillStyle=rgba('#a89a88',.12);for(let x=x0+3;x<x1;x+=bw*.9+r()*2)c.fillRect(x,ry,1,1);}
  c.fillStyle=lin(c,0,y1-(o.foot||16),0,y1,[[0,rgba('#0a0806',0)],[1,rgba('#0a0806',.5)]]);c.fillRect(x0,y1-(o.foot||16),x1-x0,o.foot||16);
  if(P&&o.top!==false){c.fillStyle=rgba(P.light,.05+.25*P.lightA);c.fillRect(x0,y0,x1-x0,1);}}
// a sheet of corrugated tin: its ridges catching the light, rust run down from the nails and the top edge
function tin(c,x,y,w,h,o){const r=rng(o.seed||5),base=o.base||'#4a4644',P=o.pal;c.fillStyle=base;c.fillRect(x,y,w,h);
  for(let xx=x+1.5;xx<x+w;xx+=3.2){c.fillStyle=rgba('#000000',.28);c.fillRect(xx,y,1.1,h);c.fillStyle=rgba(P?P.light:'#ffffff',.06+(P?P.lightA*.12:0));c.fillRect(xx+1.4,y,.6,h);}
  for(let i=0;i<(o.rust??4);i++){const rx=x+r()*w,rl=h*(.3+r()*.7);c.fillStyle=lin(c,0,y,0,y+rl,[[0,rgba('#7a3a18',.5)],[1,rgba('#7a3a18',0)]]);c.fillRect(rx,y,2+r()*5,rl);}
  c.fillStyle=rgba('#000000',.4);c.fillRect(x,y+h-1,w,1);c.fillStyle=rgba('#c8b8a0',.2);for(let xx=x+3;xx<x+w;xx+=9)c.fillRect(xx,y+1.5,.9,.9);}
// oilcloth over a frame: the pts as given, sagging between them by sag; patches sewn on, a seam, the light along its top
function oilcloth(c,pts,o){const r=rng(o.seed||9),P=o.pal,base=o.base||'#3e3a2a',sag=o.sag||3;
  c.beginPath();c.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i];c.quadraticCurveTo((a.x+b.x)/2,(a.y+b.y)/2+sag*(i%2?1:.4),b.x,b.y);}c.closePath();
  c.fillStyle=base;c.fill();c.save();c.clip();
  let mx=1e9,my=1e9,Mx=-1e9,My=-1e9;for(const p of pts){mx=Math.min(mx,p.x);my=Math.min(my,p.y);Mx=Math.max(Mx,p.x);My=Math.max(My,p.y);}
  c.fillStyle=lin(c,0,my,0,My+sag,[[0,rgba(P?P.light:'#ffffff',.1+(P?P.lightA*.3:0))],[1,rgba('#000000',.3)]]);c.fillRect(mx,my,Mx-mx,My-my+sag+4);
  for(let i=0;i<(o.patches??3);i++){const pw=(Mx-mx)*(.12+r()*.2),ph=(My-my)*(.25+r()*.35),px=mx+r()*(Mx-mx-pw),py=my+r()*(My-my-ph);
    c.fillStyle=o.patch?o.patch[i%o.patch.length]:['#5a4a2a','#2e3e44','#4a2e26'][i%3];c.globalAlpha=.85;c.fillRect(px,py,pw,ph);c.globalAlpha=1;
    c.strokeStyle=rgba('#d8c8a0',.18);c.lineWidth=.5;c.setLineDash([1.2,1.2]);c.strokeRect(px+.8,py+.8,pw-1.6,ph-1.6);c.setLineDash([]);}
  c.strokeStyle=rgba('#000000',.25);c.lineWidth=.7;c.beginPath();for(let x=mx+(Mx-mx)*(.3+r()*.1);x<Mx;x+=(Mx-mx)*(.35+r()*.2)){c.moveTo(x,my);c.lineTo(x+(r()-.5)*4,My+sag);}c.stroke();
  c.restore();}
// the front of a nearer shack, square to the eye: boards or tin from x0 to x1, top to base, a tin roof over it with its edge lit,
// windows ([x, y, w, h] from the top-left, lit when the time says), a door, the haze of distance over it (hz)
function facade(c,P,o){const r=rng(o.seed||1),x0=o.x0,x1=o.x1,top=o.top,base=o.base,w=x1-x0,sh=(col,k)=>shade(P,col,k),hz=o.hz||0;
  if(o.kind==='tin')tin(c,x0,top,w,base-top,{base:sh(o.col||'#4a4644',1.1),seed:o.seed,pal:P,rust:Math.ceil(w/30)});
  else boards(c,x0,top,x1,base,{base:sh(o.col||SHACK[(r()*SHACK.length)|0],1.1),bw:o.bw||9,seed:o.seed,pal:P,foot:10,rails:[top+10]});
  if(o.patch){const pw=w*(.2+r()*.2),px=x0+r()*(w-pw);tin(c,px,top+(base-top)*(.2+r()*.3),pw,(base-top)*.35,{base:sh(TINC[(r()*TINC.length)|0]),seed:o.seed+3,pal:P,rust:2});}
  for(const [wx,wy,ww,wh] of o.wins||[]){const X=x0+wx,Y=top+wy,litW=o.lit??(r()<P.win*1.6);c.fillStyle=sh('#1e1610');c.fillRect(X-2,Y-2,ww+4,wh+4);
    if(litW){c.fillStyle=lin(c,0,Y,0,Y+wh,[[0,mix('#6a3412','#ffcf86',.5+.4*P.lamp)],[1,mix('#6a3412','#ffb25e',.6+.3*P.lamp)]]);c.fillRect(X,Y,ww,wh);
      if(r()<.6){c.fillStyle=rgba(['#4a1a14','#1a2a24','#3a2a14'][(r()*3)|0],.85);c.fillRect(X,Y,ww*.3,wh);c.fillRect(X+ww*.7,Y,ww*.3,wh);}
      if(P.winA>.6){c.save();c.globalCompositeOperation='lighter';glowAt(c,X+ww/2,Y+wh/2,ww*1.8,'#ffb25e',.3);c.restore();}}
    else{c.fillStyle=sh('#0c0a0a');c.fillRect(X,Y,ww,wh);c.fillStyle=rgba(P.light,.05+.15*P.lightA);c.fillRect(X,Y,ww,1.2);}
    c.fillStyle=sh('#1e1610');c.fillRect(X+ww/2-.7,Y,1.4,wh);c.fillStyle=topLit(P,'#4a3a2a');c.fillRect(X-3,Y+wh+2,ww+6,2);}
  if(o.door){const [dx,dw,dh]=o.door,X=x0+dx;c.fillStyle='#0a0807';c.fillRect(X,base-dh,dw,dh);c.fillStyle=sh('#2a1e16');c.fillRect(X-2,base-dh-2,dw+4,2.4);
    if(o.doorLit){c.fillStyle=lin(c,0,base-dh,0,base,[[0,'#6a3414'],[1,'#c87a38']]);c.fillRect(X+dw*.35,base-dh,dw*.65,dh);}}
  if(o.roof!==false){const tip=o.tip??(r()-.5)*6,rl=x0-(o.eave??5),rr=x1+(o.eave??5),tc=topLit(P,TINC[(r()*TINC.length)|0],.9);
    c.fillStyle=sh('#16120f',1.3);c.beginPath();c.moveTo(rl,top-Math.max(0,tip)+3);c.lineTo(rr,top-Math.max(0,-tip)+3);c.lineTo(rr,top-Math.max(0,-tip)+7);c.lineTo(rl,top-Math.max(0,tip)+7);c.closePath();c.fill();
    c.fillStyle=tc;c.beginPath();c.moveTo(rl,top-Math.max(0,tip)-1);c.lineTo(rr,top-Math.max(0,-tip)-1);c.lineTo(rr,top-Math.max(0,-tip)+4);c.lineTo(rl,top-Math.max(0,tip)+4);c.closePath();c.fill();
    c.fillStyle=rgba(P.light,.1+.45*P.lightA);c.fillRect(rl,top-Math.max(0,tip)-1.5,rr-rl,.8);}
  if(hz>0){c.fillStyle=rgba(P.air[1],hz);c.fillRect(x0-8,top-10,w+16,base-top+10);}}
// ---------- the walls of the Pit ----------
// Rows of shacks on walkways, every walkway laid on a course of packed junk, from yBot up past yTop (screen units): each row a little
// smaller and closer than the one under it (shrink, over sspan), the wall going away up into the haze (span: how far up the haze
// takes to close in; it never quite hides the wall). The walkways go in lengths a step higher or lower than each other; stairs climb
// from one to the next; rock and junk stand out of the wall in places; old pipes run down it; painted signs. Lit windows, signs and
// strings of bulbs go on over the haze so they burn through it. The fires and the chimneys of the rows are kept in o.out for the
// place's live(). The same rows painted again with the same seed come out the same: the picture above the layer goes on from the
// layer's top without a seam (o.clip limits the work to the rows that reach into it).
const SHACK=['#3a2e28','#33292a','#3e3430','#2c2a2c','#463a2e','#38302a','#2e3030','#40362c','#3a3236'],TINC=['#5a4a40','#4a4644','#6a5442','#4e4a46','#5e4434','#585048','#6a4a36'],
  TARPC=['#2e4a56','#3e5a3a','#6a5630','#5a3a2c','#46405a','#3a4a44'],CLOTH=['#8a6a5a','#5a6a8a','#a8946a','#6a7a5a','#9a5a4a','#c8bca0','#7a5a6a'],
  JUNKC=['#3a2a24','#2a2c30','#4a3a2a','#2e2420','#3e3434','#4a2e22','#283028'],WINC=['#ffcf86','#7ff3e3','#ff6ad0'],
  // the words on the walls' painted boards: the Pit's trades, and the city's (bellbread, skewers, the choirhouses, the Mendery's free
  // mending, the keepsake buyers, the numbers runners, rondel on Restday)
  WORDS=['TEA','SOUP','ROOMS','BATHS','BEER','SCRAP','PAWN','NOODLES','KNIVES','SALT','WATER','RAGS','SKEWERS','BELLBREAD','CHOIR','MENDING','KEEPSAKES','NUMBERS','RONDEL'];
function shackRows(c,o){const P=o.pal,u=o.u||1,rs=o.rs||54*u,x0=o.x0,x1=o.x1,yb=o.yBot,yt=o.yTop,span=o.span||(yb-yt),winP=P.win*(o.winK??1),out=o.out||{},
    shrink=o.shrink??.55,sspan=o.sspan||700,seed=o.seed||7,night=P.winA>.6;
  const lit=[],signs=[],bulbs=[],boardsW=[];out.fires=out.fires||[];out.chims=out.chims||[];
  const hzOf=y=>clamp((1-Math.exp(-Math.max(0,yb-y)/span))*.94,0,1),HC=y=>jm(P.air[1],P.air[0],hzOf(y)),col=(base,y,k)=>jm(shade(P,base,k),HC(y),hzOf(y)*.86);
  const ya=o.clip?o.clip[0]:-1e9,yz=o.clip?o.clip[1]:1e9;
  const rows=[];{let ry=yb,j=0;while(ry>yt-rs&&j<140){const s=lerp(1,shrink,clamp((yb-ry)/sspan,0,1));rows.push([ry,j,s]);ry-=rs*s;j++;}}
  for(let i=rows.length-1;i>=0;i--){const [ry,j,s]=rows[i],ur=u*s,rr=rs*s,r=rng(seed*7919+j*104729),bh=rr*.2;if(ry-rr*1.25>yz||ry+rr<ya)continue;
    // the rock behind the row
    c.fillStyle=lin(c,0,ry-rr,0,ry,[[0,col(P.wall,ry-rr)],[1,col(P.wall,ry)]]);c.fillRect(x0,ry-rr-.5,x1-x0,rr+1);
    // the walkway in lengths, each a step higher or lower than the last
    const segs=[];for(let x=x0-80;x<x1+80;){const len=(110+r()*260)*ur,off=Math.round((r()-.5)*5)*2.8*ur;segs.push([x,x+len,off]);x+=len;}
    const offAt=x=>{for(const sg of segs)if(x<sg[1])return sg[2];return 0;};
    for(const [a,b,off] of segs){const y=ry+off;
      c.fillStyle=col('#141110',y+bh/2,1.2);c.fillRect(a,y,b-a,bh+2.6*ur);
      for(let x=a+r()*6;x<b;){const k=r(),w=(5+r()*14)*ur,cy=y+bh*(.35+r()*.4),cc=col(JUNKC[(r()*JUNKC.length)|0],cy,1.1);
        if(k<.22){c.strokeStyle=col('#141214',cy,1.2);c.lineWidth=1.5*ur;c.beginPath();c.arc(x+2.6*ur,cy,2.2*ur,0,TAU);c.stroke();x+=6*ur;}
        else if(k<.4){c.fillStyle=cc;c.beginPath();c.arc(x+3*ur,cy,2.8*ur,0,TAU);c.fill();c.fillStyle=rgba('#000000',.4);c.beginPath();c.arc(x+3*ur,cy,1.4*ur,0,TAU);c.fill();x+=6.5*ur;}
        else if(k<.62){c.fillStyle=cc;c.fillRect(x,cy-2.2*ur,w*1.6,4.4*ur);c.fillStyle=rgba('#000000',.45);c.fillRect(x+w*.4,cy-1.4*ur,w*.5,1.2*ur);x+=w*1.6;}
        else{c.fillStyle=cc;c.fillRect(x,cy-1.6*ur,w,3.2*ur);x+=w;}
        x+=r()*1.8*ur;}
      c.fillStyle=col('#3c3128',y);c.fillRect(a,y-1.6*ur,b-a,2.4*ur);c.fillStyle=jm(col('#5a4a3a',y),P.light,P.lightA*.8);c.fillRect(a,y-1.6*ur,b-a,.6*ur);
      c.fillStyle=rgba('#000000',.35);c.fillRect(a,y+.8*ur,b-a,1.4*ur);
      if(r()<.45){c.strokeStyle=col('#2a221e',y);c.lineWidth=.8*ur;c.beginPath();c.moveTo(a,y-9*ur);c.lineTo(b,y-9*ur);for(let x=a+r()*20;x<b;x+=(24+r()*14)*ur){c.moveTo(x,y-1.6*ur);c.lineTo(x,y-9.5*ur);}c.stroke();}}
    // a few steps where one length meets the next
    for(let q=1;q<segs.length;q++){const sx=segs[q][0],y0=ry+segs[q-1][2],y1=ry+segs[q][2];if(y0===y1)continue;const n=Math.max(1,Math.round(Math.abs(y1-y0)/(2.6*ur)));
      c.fillStyle=col('#4a3e32',Math.min(y0,y1));for(let k=0;k<n;k++){const yy=lerp(y0,y1,(k+1)/n);c.fillRect(sx-n*2.4*ur+k*2.4*ur*(y1<y0?1:-1)+(y1<y0?0:n*2.4*ur),yy-1.6*ur,3*ur,2*ur);}}
    // a string of bulbs along the row
    if(r()<.4)bulbs.push([x0+r()*(x1-x0)*.8,ry-rr*.62,(120+r()*200)*ur,r(),hzOf(ry),ur]);
    // the shacks, and what stands between them
    let x=x0-40*ur+r()*30*ur;
    while(x<x1+20){const w=(26+r()*44)*ur,h=Math.min(rr*.88,rr*.4+r()*rr*.42),k=r(),gy=ry+offAt(x+w/2),top=gy-h-1.6*ur,base=SHACK[(r()*SHACK.length)|0];
      if(k<.045){// rock standing out of the wall, junk caught on it
        const ow=w*(1.4+r()*1.2),oh=rr*(.6+r()*.5);c.fillStyle=col(jm(P.wall,'#4a4038',.4),gy-oh/2,1.1);c.beginPath();c.moveTo(x,gy);
        for(let q=0;q<=6;q++){const u2=q/6;c.lineTo(x+ow*u2+(r()-.5)*6*ur,gy-oh*(.5+.5*Math.sin(u2*Math.PI))*(.8+r()*.3));}c.lineTo(x+ow,gy);c.closePath();c.fill();
        c.strokeStyle=col(jm('#5a4a3c',P.light,P.lightA*.6),gy-oh);c.lineWidth=.8*ur;c.beginPath();c.moveTo(x+ow*.1,gy-oh*.6);c.quadraticCurveTo(x+ow*.5,gy-oh*1.05,x+ow*.9,gy-oh*.5);c.stroke();
        for(let q=0;q<5;q++){c.fillStyle=col(JUNKC[(r()*JUNKC.length)|0],gy-oh*.4);c.fillRect(x+ow*(.1+.75*r()),gy-oh*(.2+.5*r()),(5+r()*9)*ur,(3+r()*4)*ur);}
        x+=ow+(2+r()*6)*ur;continue;}
      if(k<.09){// a stair up to the next walkway: its treads, a rail
        const sw=rr*1.15,y0=gy,y1=gy-rr;c.fillStyle=col('#1c1714',(y0+y1)/2,1.2);c.beginPath();c.moveTo(x,y0+1);c.lineTo(x+sw,y1+1);c.lineTo(x+sw,y1+5*ur);c.lineTo(x+4*ur,y0+5*ur);c.closePath();c.fill();
        const n=Math.max(4,Math.round(rr/(3.4*ur)));c.fillStyle=jm(col('#5a4a3a',y1),P.light,P.lightA*.7);for(let q=0;q<n;q++){const u2=(q+.5)/n;c.fillRect(x+sw*u2-1.6*ur,lerp(y0,y1,u2)-.6*ur,3.4*ur,.9*ur);}
        c.strokeStyle=col('#2a221e',y1);c.lineWidth=.7*ur;c.beginPath();c.moveTo(x,y0-9*ur);c.lineTo(x+sw,y1-9*ur);for(let q=0;q<=3;q++){const u2=q/3;c.moveTo(x+sw*u2,lerp(y0,y1,u2));c.lineTo(x+sw*u2,lerp(y0,y1,u2)-9*ur);}c.stroke();
        x+=sw+(4+r()*8)*ur;continue;}
      if(k<.16){// a gap, junk heaped in it
        const gw=w*.8;c.fillStyle=col('#1a1614',gy-4,1.1);c.beginPath();c.moveTo(x,gy-1.6*ur);c.quadraticCurveTo(x+gw/2,gy-h*.7,x+gw,gy-1.6*ur);c.closePath();c.fill();
        for(let q=0;q<4;q++){c.fillStyle=col(JUNKC[(r()*JUNKC.length)|0],gy-6,1);c.fillRect(x+gw*(.1+.7*r()),gy-1.6*ur-h*(.15+.35*r()),(4+r()*7)*ur,(3+r()*4)*ur);}
        x+=gw;continue;}
      c.fillStyle=col(base,top+h/2);c.fillRect(x,top,w,h);
      const tinW=r()<.3,cardoor=r()<.1;
      if(tinW){c.fillStyle=rgba('#000000',.28);for(let q=x+2*ur;q<x+w;q+=3*ur)c.fillRect(q,top+2*ur,.7*ur,h-2*ur);}
      else{c.fillStyle=rgba('#000000',.22);for(let q=x+5*ur;q<x+w;q+=(6+r()*4)*ur)c.fillRect(q,top+2*ur,.6*ur,h-2*ur);}
      if(cardoor){c.fillStyle=col(['#4a2222','#22383a','#4a4436'][(r()*3)|0],top+h*.5);c.fillRect(x+w*.2,top+h*.3,9*ur,h*.5);}
      // the roof: a sheet of tin across it, its edge lit from above
      const tip=(r()-.5)*5*ur,tc=col(TINC[(r()*TINC.length)|0],top);c.fillStyle=tc;c.beginPath();c.moveTo(x-2*ur,top-Math.max(0,tip));c.lineTo(x+w+2*ur,top-Math.max(0,-tip));c.lineTo(x+w+2*ur,top+2.4*ur-Math.max(0,-tip));c.lineTo(x-2*ur,top+2.4*ur-Math.max(0,tip));c.closePath();c.fill();
      c.fillStyle=jm(tc,P.light,P.lightA*1.6);c.fillRect(x-2*ur,top-Math.max(0,tip)-.2,w+4*ur,.7*ur);
      if(r()<.3){c.strokeStyle=col('#0e0d0f',top,1.2);c.lineWidth=1.3*ur;const tn=1+((r()*3)|0);for(let q=0;q<tn;q++){c.beginPath();c.ellipse(x+w*(.2+.6*(q+.5)/tn),top-1.4*ur,3*ur,1.3*ur,0,0,TAU);c.stroke();}}
      if(r()<.2){c.fillStyle=col(TARPC[(r()*TARPC.length)|0],top);const a0=r()*.5,a1=a0+.3+r()*.25;c.beginPath();c.moveTo(x+w*a0,top-1);c.lineTo(x+w*a1,top-1);c.lineTo(x+w*a1+2*ur,top+h*.35);c.lineTo(x+w*a0-1*ur,top+h*.3);c.closePath();c.fill();}
      // windows, lit or dark; a door to the walkway
      const nw=w>44*ur?2:1;for(let q=0;q<nw;q++){const ww=(5+r()*4)*ur,wh=(4+r()*4)*ur,wx=x+5*ur+q*w*.48+r()*3*ur,wy=top+(5+r()*4)*ur,v=r();
        if(v<winP)lit.push([wx,wy,ww,wh,v<winP*.8?0:v<winP*.92?1:2,hzOf(wy)]);else{c.fillStyle=col('#0c0a0c',wy,1.2);c.fillRect(wx,wy,ww,wh);c.fillStyle=rgba(P.light,.04*hzOf(wy)+.03);c.fillRect(wx,wy,ww,1);}}
      if(r()<.3){c.fillStyle=col('#0a0809',gy-7*ur,1.3);c.fillRect(x+w-11*ur,gy-1.6*ur-13*ur,7*ur,13*ur);if(r()<winP*.8)lit.push([x+w-10.4*ur,gy-1.6*ur-12.4*ur,1.4*ur,11*ur,0,hzOf(gy)]);}
      // a sign: a lit strip over a door, or a board with its word painted on
      if(r()<.05)signs.push([x+w*.5,top-5*ur,(8+r()*10)*ur,(r()*3)|0,hzOf(top)]);
      else if(r()<.045&&h>rr*.55)boardsW.push([x+w*.5,top-6*ur,ur,WORDS[(r()*WORDS.length)|0],(r()*3)|0,hzOf(top),r()<.5]);
      if(r()<.22){const dx=x+w-5*ur-r()*6*ur;c.fillStyle=col(['#5a2418','#1f3048','#5a4a1c','#22382a'][(r()*4)|0],gy-4*ur);c.fillRect(dx-2.5*ur,gy-1.6*ur-8*ur,5*ur,8*ur);c.fillStyle=rgba('#000000',.4);c.fillRect(dx-2.5*ur,gy-1.6*ur-5.2*ur,5*ur,.8*ur);}
      if(r()<.25){c.fillStyle=col('#141619',gy-3*ur);c.beginPath();c.ellipse(x+4*ur+r()*(w-8*ur),gy-1.6*ur-2.6*ur,4.6*ur,2.8*ur,0,0,TAU);c.fill();}
      if(r()<.12){const cx=x+w*(.2+.6*r()),ch=(6+r()*6)*ur;c.fillStyle=col('#1c1818',top-ch);c.fillRect(cx-1.2*ur,top-ch,2.4*ur,ch);out.chims.push({x:cx,y:top-ch,hz:hzOf(top),s:ur});}
      if(r()<.16){const x2=x+w+(14+r()*26)*ur,sag=(4+r()*5)*ur,ly=top+3*ur;c.strokeStyle=col('#8a8070',ly);c.lineWidth=.45*ur;c.beginPath();c.moveTo(x+w,ly);c.quadraticCurveTo((x+w+x2)/2,ly+sag*2,x2,ly+1);c.stroke();
        for(let q=0;q<3;q++){const s2=.25+q*.25,cx=lerp(x+w,x2,s2),cy=ly+sag*2*(1-Math.pow(2*s2-1,2))*.5+1;c.fillStyle=col(CLOTH[(r()*CLOTH.length)|0],cy,.7);c.fillRect(cx-2*ur,cy,4*ur,(4+r()*3)*ur);}}
      if(r()<.08){const lx=x+w*.5;c.strokeStyle=col('#241c1a',gy+rr*.5);c.lineWidth=.8*ur;c.beginPath();c.moveTo(lx,gy);c.lineTo(lx,gy+rr-2);c.moveTo(lx+5*ur,gy);c.lineTo(lx+5*ur,gy+rr-2);for(let q=4*ur;q<rr;q+=6*ur){c.moveTo(lx,gy+q);c.lineTo(lx+5*ur,gy+q);}c.stroke();}
      if(r()<.035)out.fires.push({x:x+w+3*ur,y:gy-3*ur,s:ur,hz:hzOf(gy)});
      const gap=r()<.18?(8+r()*30)*ur:(1+r()*3)*ur;x+=w+gap;}}
  // slopes of junk spilling down the wall over two or three rows, where the shacks have given way
  {const r=rng(seed*53+11);for(let q=0;q<(o.slides??5);q++){const sx=x0+(x1-x0)*r(),sy=yb-60-r()*1000,sw=(90+r()*140)*u,sh2=(70+r()*60)*u;if(sy-sh2>yz||sy<ya)continue;
    const s2=lerp(1,shrink,clamp((yb-sy)/sspan,0,1)),w=sw*s2,h=sh2*s2,n=12,tops=[];for(let k=0;k<=n;k++){const u2=k/n;tops.push([sx+w*u2,sy-h*(.25+.75*Math.pow(Math.sin(u2*Math.PI),.7))*(.55+r()*.45)]);}
    c.fillStyle=col(jm(P.wall,'#3a3028',.3),sy-h/2,1.05);c.beginPath();c.moveTo(sx-w*.08,sy);for(const [px,py] of tops)c.lineTo(px,py);c.lineTo(sx+w*1.08,sy);c.closePath();c.fill();
    for(let k=0;k<18;k++){const u2=r(),jx=sx+w*u2,jy=sy-(sy-tops[Math.round(u2*n)][1])*r()*.9,k2=r();c.fillStyle=col(JUNKC[(r()*JUNKC.length)|0],jy,1);
      if(k2<.3){c.beginPath();c.ellipse(jx,jy,4*s2*u,1.8*s2*u,(r()-.5),0,TAU);c.fill();}else c.fillRect(jx,jy,(5+r()*10)*s2*u,(2+r()*4)*s2*u);}
    c.strokeStyle=col(jm('#4a3e32',P.light,P.lightA*.5),sy-h);c.lineWidth=.7*u*s2;c.beginPath();tops.forEach(([px,py],k)=>k?c.lineTo(px,py):c.moveTo(px,py));c.stroke();}}
  // old pipes running down the wall from far up, on brackets
  {const r=rng(seed*31+7);for(let q=0;q<(o.pipes??4);q++){const px=x0+(x1-x0)*(.08+.84*r()),pt=yb-700-r()*900,pb=yb-40-r()*260,pw=(2.2+r()*1.6)*u;if(pb<ya||pt>yz)continue;
    c.fillStyle=lin(c,0,pt,0,pb,[[0,col('#4a3a30',pt)],[.7,col('#4a3a30',pt+(pb-pt)*.7)],[1,col('#5a4232',pb)]]);c.fillRect(px,pt,pw,pb-pt);
    c.fillStyle=rgba('#000000',.3);c.fillRect(px+pw*.6,pt,pw*.4,pb-pt);c.fillStyle=lin(c,0,pt,0,pb,[[0,rgba(shade(P,'#7a3a18'),0)],[1,rgba(shade(P,'#7a3a18'),.3)]]);c.fillRect(px,pt,pw*.5,pb-pt);
    for(let y=pb-10;y>pt;y-=(30+r()*20)*u){c.fillStyle=col('#1c1814',y);c.fillRect(px-1.2*u,y,pw+2.4*u,1.6*u);}
    c.fillStyle=col('#0c0a0a',pb);c.fillRect(px-.6*u,pb-1,pw+1.2*u,2.4*u);}}
  // what burns through the haze: the windows, the signs, the bulbs; the painted boards
  c.save();
  for(const [x,y,w,h,ci,hz] of lit){const a=P.winA*(1-hz*.62);c.globalCompositeOperation='source-over';c.fillStyle=jm(jm(WINC[ci],'#000000',.2),HC(y),hz*.55);c.globalAlpha=Math.min(1,.4+a*.6);c.fillRect(x,y,w,h);
    c.globalAlpha=1;c.fillStyle=rgba('#000000',.3);c.fillRect(x+w*.48,y,Math.max(.5,w*.08),h);
    if(night){c.globalCompositeOperation='lighter';glowAt(c,x+w/2,y+h/2,w*1.8,WINC[ci],.22*a);}}
  c.globalCompositeOperation='source-over';c.globalAlpha=1;c.textAlign='center';c.textBaseline='middle';
  for(const [x,y,ur,word,ci,hz,glowing] of boardsW){const fs=7*ur;c.font='700 '+fs.toFixed(2)+'px "Alegreya SC", Georgia, serif';const tw=c.measureText(word).width+5*ur;
    c.fillStyle=jm(shade(P,'#1a1412'),HC(y),hz*.7);c.fillRect(x-tw/2,y-fs*.7,tw,fs*1.4);c.fillStyle=jm(jm(['#d8c8a0','#c8604a','#8ac8b8'][ci],P.amb,P.ambK*.5),HC(y),hz*.6);c.fillText(word,x,y+.3*ur);
    if(night&&glowing){c.globalCompositeOperation='lighter';c.globalAlpha=.6*(1-hz*.6);c.fillStyle=WINC[ci];c.fillText(word,x,y+.3*ur);glowAt(c,x,y,tw*.8,WINC[ci],.25*(1-hz*.6),.5);c.globalCompositeOperation='source-over';c.globalAlpha=1;}}
  c.globalCompositeOperation='lighter';
  for(const [x,y,w,ci,hz] of signs){const a=(night?.85:.4)*(1-hz*.6);c.globalAlpha=a;c.fillStyle=WINC[(ci+1)%3];c.fillRect(x-w/2,y-1.6,w,3.2);glowAt(c,x,y,w,WINC[(ci+1)%3],.25*a);}
  if(night||P.key==='dusk')for(const [bx,by,w,k,hz,ur] of bulbs){const a=(night?.75:.45)*(1-hz*.6);for(let q=0;q<=14;q++){const s2=q/14,x=bx+w*s2,y=by+Math.sin(s2*Math.PI)*8*ur;c.globalAlpha=a;c.fillStyle=WINC[(q+((k*3)|0))%3===0?2:0];c.fillRect(x-.8*ur,y,1.6*ur,1.8*ur);}}
  c.restore();
  out.lit=(out.lit||[]).concat(lit);return out;}
// ---------- the view down past an edge ----------
// From yTop down: the dark of the drop, the haze of the Pit's air in it, roofs far below with a light or a fire among them, and the
// glow of the floor's fires coming up through the smoke. Fires are kept in o.out.fires for live().
function drop(c,P,x0,x1,yTop,yBot,o){o=o||{};const r=rng(o.seed||61),out=o.out||{fires:[]},night=P.winA>.6;
  c.fillStyle=lin(c,0,yTop,0,yBot,[[0,jm(P.air[2],'#000000',.35)],[.5,jm(P.air[2],P.air[1],.25)],[1,jm(P.air[1],'#ff8a4a',night?.12:.05)]]);c.fillRect(x0,yTop,x1-x0,yBot-yTop);
  // roofs far below, in rows, smaller the further down the eye goes into the haze
  for(let k=0;k<(o.rows||3);k++){const y=yTop+(yBot-yTop)*(.35+.22*k),s=.55+.25*k,hz=.7-.2*k;
    for(let x=x0+r()*20;x<x1;){const w=(12+r()*22)*s,h=(4+r()*6)*s;c.fillStyle=jm(jm(TINC[(r()*TINC.length)|0],P.amb,P.ambK),P.air[1],hz);c.fillRect(x,y-h,w,h+2*s);
      c.fillStyle=rgba(P.light,(.08+.3*P.lightA)*(1-hz*.5));c.fillRect(x,y-h,w,.7*s);
      if(r()<P.win*.6){c.fillStyle=rgba('#ffcf86',.5*(1-hz*.4));c.fillRect(x+w*.3,y-h*.4,2*s,1.6*s);}
      if(r()<.05)out.fires.push({x:x+w/2,y:y-h,s:s*.8,hz});
      x+=w+(r()<.2?(6+r()*14)*s:(.5+r()*2)*s);}}
  c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,0,yTop,0,yBot,[[0,rgba('#ff8a4a',0)],[1,rgba('#ff8a4a',night?.16:.06)]]);c.fillRect(x0,yTop,x1-x0,yBot-yTop);c.restore();
  return out;}
// a lantern hung at (x, y) (its top), s its size: a cap, the glass lit or not, its foot (the glow is the place's live())
function lantern(c,P,x,y,s,lit){c.fillStyle=shade(P,'#1e1a16');c.beginPath();c.moveTo(x-4*s,y+4*s);c.lineTo(x,y);c.lineTo(x+4*s,y+4*s);c.closePath();c.fill();
  c.fillStyle=lit?'#ffd28a':shade(P,'#5a5040');c.fillRect(x-3*s,y+4*s,6*s,8*s);c.fillStyle=lit?'#fff0c8':rgba(P.light,.15);c.fillRect(x-1*s,y+5*s,2*s,6*s);
  c.fillStyle=shade(P,'#1e1a16');c.fillRect(x-3.6*s,y+12*s,7.2*s,1.6*s);c.fillRect(x-.4*s,y+4*s,.8*s,8*s);}
// ---------- the pieces that stand among the people ----------
// A place's painter lists in pieces() what must stand among the people by its depth (a pump, barrels, a stall's counter); each is
// painted once into a small canvas and set down in the floor's draw list in its turn. Hooked in here once for every place of the Pit.
const PC={};
function sprScale(){return typeof sceneScale==='function'?sceneScale():2;}
// a piece: painted by fn(c) in screen-world units into the box (x, y, w, h), kept by key at the screen's scale
function piece(key,x,y,w,h,fn){const sc=sprScale(),k=key+'@'+sc.toFixed(2);let T=PC[k];
  if(!T){const base=key.split('|')[0];for(const kk in PC)if(kk.split('|')[0]===base&&kk!==k){const o=PC[kk];if(o.cv)o.cv.width=o.cv.height=0;delete PC[kk];}
    const cv=document.createElement('canvas');cv.width=Math.max(1,Math.ceil(w*sc));cv.height=Math.max(1,Math.ceil(h*sc));const g=cv.getContext('2d');g.setTransform(sc,0,0,sc,-x*sc,-y*sc);fn(g);T=PC[k]={cv,x,y,w,h};}
  return T;}
function drawPiece(c,T){c.drawImage(T.cv,T.x,T.y,T.w,T.h);}
if(typeof envItems==='function'&&typeof drawEnvItem==='function'){const ei=envItems,de=drawEnvItem;
  envItems=function(items){ei(items);const k=typeof envKey==='function'?envKey():null,sc=k&&E.S[k];if(!sc||!sc.pieces)return;for(const p of sc.pieces())items.push({d:p.d,pitPiece:p});};
  drawEnvItem=function(it){if(!it.pitPiece)return de(it);ctx.save();try{it.pitPiece.draw(ctx);}catch(e){}ctx.restore();return true;};}
// ---------- above the layer ----------
// A phone held upright looks far up past the top of the layer: there the place's own picture of the walls going up into the haze and
// the sky goes on (painted once by fn(c, x0, x1, y0, y1) in screen-world units, from y0 up to just inside the layer's top), and is
// drawn over the layer's stretched edge.
const UP={};
function upper(key,y0,fn){if(typeof camTop!=='function'||typeof RC==='undefined')return;const T=camTop();if(T-40>=RC.y0+2)return;
  const sc=Math.min(1.6,sprScale()*.7),k=key+'@'+sc.toFixed(2);let U=UP[key];
  if(!U||U.k!==k){if(U&&U.cv)U.cv.width=U.cv.height=0;const w=RC.w,h=RC.y0+3-y0,cv=document.createElement('canvas');cv.width=Math.ceil(w*sc);cv.height=Math.ceil(h*sc);
    const g=cv.getContext('2d');g.setTransform(sc,0,0,sc,-RC.x0*sc,-y0*sc);fn(g,RC.x0,RC.x0+w,y0,RC.y0+3);U=UP[key]={k,cv,y0,h};}
  ctx.drawImage(U.cv,RC.x0,U.y0,RC.w,U.h);
  if(T-40<U.y0){ctx.drawImage(U.cv,0,0,U.cv.width,2,RC.x0,T-40,RC.w,U.y0-(T-40)+.5);}}
// the far-up sky over the Pit, between y0 and y1: the light coming down; the rim, ragged with shacks and junk, black against it, and
// the tower's foot going up out of the picture
function skyTop(c,x0,x1,y0,y1,P,o){o=o||{};c.fillStyle=lin(c,0,y0,0,y1,[[0,P.sky[0]],[1,P.sky[1]]]);c.fillRect(x0,y0,x1-x0,y1-y0);
  if(P.key==='night'){const r=rng(17);for(let i=0;i<70;i++){c.fillStyle=rgba('#fff4e0',.25+.5*r());c.fillRect(lerp(x0,x1,r()),lerp(y0,y1-30,r()),r()<.9?.8:1.4,r()<.9?.8:1.4);}}
  const ry=y1-(o.rim||24),r=rng(23),dk=jm(jm(P.air[0],'#000000',.45),P.sky[1],.15);c.fillStyle=dk;c.beginPath();c.moveTo(x0,y1);
  for(let x=x0;x<=x1;){const w=10+r()*30,h=r()<.6?4+r()*12:0;c.lineTo(x,ry-h);c.lineTo(x+w,ry-h);x+=w;}c.lineTo(x1,y1);c.closePath();c.fill();
  if(P.key!=='day'&&P.key!=='morning'){const r2=rng(29);for(let i=0;i<14;i++){c.fillStyle=rgba('#ffcf86',.5+.4*r2());c.fillRect(lerp(x0,x1,r2()),ry-2-r2()*8,1.6,1.4);}}
  const tw=o.tower??240;c.fillStyle=jm(P.sky[1],'#000000',.8);c.fillRect(x0,y0,tw-x0,ry-y0+6);c.fillStyle=rgba(P.light,.18);c.fillRect(tw-2,y0,1.6,ry-y0+4);
  // the light falling down the Pit from it
  c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,0,y1,0,y1+260,[[0,rgba(P.sky[1],.25)],[1,rgba(P.sky[1],0)]]);c.fillRect(x0,y1,x1-x0,260);c.restore();}
function cRad(c,x,y,r0,r1,col,a,sq){c.save();c.translate(x,y);c.scale(1,sq||1);c.fillStyle=rad(c,0,0,r0,r1,[[0,rgba(col,a)],[1,rgba(col,0)]]);c.beginPath();c.arc(0,0,r1,0,TAU);c.fill();c.restore();}
// the Halo Tram, high over the Rim: the city's ring line, its track a dark line across the sky with a pylon here and there, and now
// and then a train going along it, its glass lit (drawn where the sky shows, on a phone held upright; y the track's height)
function tram(c,t,P,y){if(typeof camTop!=='function'||camTop()-40>y+30)return;const x0=-170,x1=W+250,ty=x=>y+Math.sin((x-x0)/(x1-x0)*Math.PI)*-12;
  c.save();c.strokeStyle=jm(jm(P.sky[1],'#000000',.72),P.air[0],.15);c.lineWidth=2.2;c.beginPath();for(let x=x0;x<=x1;x+=30){x===x0?c.moveTo(x,ty(x)):c.lineTo(x,ty(x));}c.stroke();
  c.lineWidth=1.4;c.beginPath();for(let x=x0+60;x<x1;x+=260){c.moveTo(x,ty(x));c.lineTo(x-6,y+80);c.moveTo(x,ty(x));c.lineTo(x+6,y+80);}c.stroke();
  const per=46,u=(t%per)/per,len=150,hx=lerp(x0-len-40,x1+40,u/.55);
  if(u<.55){const glass=P.key==='day'||P.key==='morning'?jm('#a8c8d0','#000000',.3):'#bff6ff';
    for(let k=0;k<5;k++){const a=hx+k*31,b=a+28,ya=ty(a),yb=ty(b);c.fillStyle=jm(jm(P.sky[1],'#000000',.75),P.air[0],.1);c.beginPath();c.moveTo(a,ya-7);c.lineTo(b,yb-7);c.lineTo(b,yb+1);c.lineTo(a,ya+1);c.closePath();c.fill();
      c.fillStyle=glass;for(let q=0;q<4;q++){const wx=a+3+q*6.4;c.fillRect(wx,lerp(ya,yb,(wx-a)/28)-5.4,4,2.6);}}
    if(P.key!=='day'&&P.key!=='morning'){c.globalCompositeOperation='lighter';glowAt(c,hx+len/2,ty(hx+len/2)-3,len*.6,'#7ff3e3',.18,.25);}}
  c.restore();}
// a puddle lying in the floor's plane (call inside the floor's transform): dark water, the sky in it toward its far side, its wet rim
function puddle(c,P,x,d,rx,seed,k,warm){c.save();c.translate(x,d);
  c.fillStyle=rgba('#050403',.16);blob(c,0,0,rx*1.35,rx*.95,rng(seed+1));c.fill();
  const sky=P.key==='night'?'#2a2430':jm(P.air[0],P.light,.25);blob(c,0,0,rx,rx*.62,rng(seed));
  c.fillStyle=jm(jm(P.dirt[1],'#000000',.55),sky,(.08+.1*P.lightA)*(k??1));c.fill();
  c.save();c.clip();c.fillStyle=rgba(warm||sky,(warm?.4:.1+.22*P.lightA)*(k??1));c.fillRect(-rx*.9,rx*.18,rx*1.2,rx*.06);c.restore();
  c.restore();}
E.pitKit={tod,pal,PAL,jm,shade,topLit,Q,poly,blob,spr,glowSpr,puffSpr,glowAt,smoke,boards,tin,oilcloth,facade,shackRows,drop,lantern,piece,drawPiece,upper,skyTop,cRad,puddle,tram,
  SHACK,TINC,TARPC,CLOTH,JUNKC,WINC};
})();

// ---------- the yard ----------
// The yard behind the Sump, on the floor of the Pit. Packed dirt, puddles, junk heaped at its edges. Along the back the Sump's back
// wall, boards and tin under a tin roof: the back door at the head of its step (where Tamm sits at night with two mugs of tea), a lit
// window of small panes, a ladder against the wall up to the loft door in a dormer under a hoist beam, the stairs going up round the
// side at the left, a rain barrel under the downpipe, a woodshed at the right end. On the roof Dob's pigeon lofts and the birds
// along the ridge, the stovepipe smoking. The yard wall runs along the back right, brick and tin under a plank coping (Dob perches
// on the nearer crate, which is a piece: nothing is drawn for him); the fence on the right has the plank gate in it between two posts under a little roof, its latch on, the way out to the
// stair-streets that start up the wall beyond. The iron hand pump stands on a stone base mid-yard with its trough beside it; two
// barrels and two crates stand where the layout puts them. Over the yard wall the shacks of the floor, and the Pit's wall rising
// behind: rows of shacks on walkways, windows, washing, stairs and pipes, going up into the haze; far up, the sky. Three times of
// day by S.act1: day (dim smoky daylight from far above), night (dark; the back door open on the kitchen's light, the window lit, a
// lantern by the step, the Pit's windows, signs and fires) and morning (sun-up: cold light from above, mist on the ground). live():
// smoke, the pump's drip, the lamps and fires flickering, the mist drifting.
(()=>{const E=EnvLook,{C,pp,poly,lin,rad,rgba,mix,glow,haze,stars,moon,rng,lerp,clamp,TAU}=E;const K=E.pitKit;
const L=()=>typeof ACT1_PLACES!=='undefined'&&ACT1_PLACES.yard?ACT1_PLACES.yard:null;
// the layout when the game's is not there (the painter run alone)
const L0={far:232,door:{x:170,d:226,w:46},step:{x:170,d:206,h:16},window:{x0:286,x1:346,y0:150,y1:104},pump:{x:520,d:118,r:22},trough:{x0:540,x1:600,d:126},
  gate:{x:836,d:120,w:60},ladder:{x:392,d:224,top:150},sidestair:{x0:30,x1:118,d:200},wall:{x0:600,x1:900,d:214,h:64},dobSeat:{x:690,d:170,crate:true},
  barrels:[{x:250,d:150,r:16},{x:282,d:164,r:15}],crates:[{x:660,d:156,w:34,h:30},{x:690,d:170,w:30,h:26}],floor:{x0:40,x1:800,z0:30,z1:170},stairGate:{x:126,d:196,w:34}};
const Y=()=>L()||L0;
// the low gate across the foot of the side stairs (the game's layout, else this one), and how far each gate stands open (S.act1.stairGate,
// S.act1.gate: 0 shut, 1 open)
const SG=()=>Y().stairGate||L0.stairGate,SGH=50;
function opened(k){const A=typeof S!=='undefined'&&S?S.act1:null;return clamp(A&&+A[k]||0,0,1);}
const Q=K.Q,jm2=(a,b,t)=>K.jm(a,b,t);
// the building: its back wall from SUMP.x0 to SUMP.x1 (the woodshed beyond it to the yard wall), the eave and the ridge and how far
// back the ridge stands; the door's height. The fence on the right, the lantern by the step, the lamp over the gate.
const SUMP={x0:20,x1:470,eave:166,ridge:210,rd:46,doorH:142},SHED={x1:604,h:104,back:136},FENCE={x:852,h:66,post:92};
const LANT={x:212,h:118,d:228},GLAMP={h:84,dx:-3,dd:-4};
// the Pit's wall across the floor: its rows (the picture above the layer paints the same rows on up)
const ROWS={yBot:236,rs:50,u:.86,seed:41,span:300,shrink:.5,sspan:760};
let OUT={fires:[],chims:[],lit:[]},NEARCH=[];
const STOVE={x:0,y:0};
function key(){return'yard:'+K.tod();}
// where the Pit's far wall shows, x by x: above the top of everything nearer (the shack past the corner, the Sump's ridge and its
// lofts, the woodshed, the shacks over the yard wall, the stair-street beyond the fence). The far wall's fires, flickers and smoke
// in live() keep inside it.
function skyline(x){let y=262;const up=(a,b,t)=>{if(x>=a&&x<=b)y=Math.min(y,t);};
  up(-200,40,113);up(66,536,50);up(112,244,29);up(536,652,130);up(640,716,203);up(716,806,185);up(806,880,211);up(880,990,173);up(930,970,118);up(990,1090,197);up(1090,1200,183);
  if(x>900)y=Math.min(y,238-(x-900)*.5);for(const a of [917,977,1037,1097])up(a,a+52,262-(a-900)/2-73);
  return y;}
let SKYP=null;
function skyPath(){if(SKYP)return SKYP;const p=new Path2D();p.moveTo(-220,-1200);for(let x=-220;x<=1220;x+=4)p.lineTo(x,skyline(x)-2);p.lineTo(1220,-1200);p.closePath();return SKYP=p;}
// ---------- the backdrop ----------
function backdrop(c,P,X0,X1,T0){
  c.fillStyle=lin(c,0,T0,0,330,[[0,P.air[0]],[.55,P.air[1]],[1,P.air[2]]]);c.fillRect(X0,T0,X1-X0,340-T0);
  OUT={fires:[],chims:[],lit:[]};
  K.shackRows(c,Object.assign({pal:P,x0:X0,x1:X1,yTop:T0,out:OUT},ROWS));
  // the air between the wall and the yard: the haze low over the floor
  c.fillStyle=lin(c,0,140,0,250,[[0,rgba(P.air[1],0)],[1,rgba(P.air[1],.5)]]);c.fillRect(X0,140,X1-X0,110);}
// the shacks of the floor round the yard: their fronts over the yard wall and past the Sump's corner, chimneys, a water tank on legs,
// a pole carrying wire
function neighbours(c,P){const sh=(col,k)=>K.shade(P,col,k);
  // past the Sump's corner on the left: a two-storey shack across the alley, its upper window
  K.facade(c,P,{x0:-180,x1:40,top:120,base:300,seed:3,col:'#30282a',wins:[[150,26,16,13],[40,30,14,12]],hz:.18,tip:-3});
  // over the yard wall on the right
  const F=[{x0:640,x1:716,top:206,base:262,seed:11,col:'#3a3030',wins:[[14,14,12,10]],kind:'tin'},{x0:716,x1:806,top:188,base:262,seed:13,col:'#33292a',wins:[[20,14,13,11],[56,16,12,10]]},
    {x0:806,x1:880,top:214,base:262,seed:17,col:'#3e3430',wins:[[30,12,12,10]],kind:'tin'},{x0:880,x1:990,top:176,base:262,seed:19,col:'#2e2a2c',wins:[[16,20,14,12],[66,20,14,12]],patch:1},
    {x0:990,x1:1090,top:200,base:262,seed:23,col:'#40362c',wins:[[34,16,14,11]],kind:'tin'},{x0:1090,x1:1180,top:186,base:262,seed:29,col:'#38302a',wins:[[22,18,13,11]]}];
  for(const f of F){f.hz=.12;K.facade(c,P,f);}
  // chimneys on them (their smoke is live)
  NEARCH=[];for(const [x,y,h] of [[760,188,16],[926,176,14],[1036,200,12],[-40,118,18]]){c.fillStyle=sh('#201a18');c.fillRect(x-2.4,y-h,4.8,h);c.fillStyle=sh('#2a2220');c.fillRect(x-3.6,y-h-2,7.2,2.4);NEARCH.push({x,y:y-h-2,hz:.15,s:1.6});}
  // a water tank on legs over the roofs at the right, a pole with wires
  {const x=950,y=150;c.strokeStyle=sh('#16120f');c.lineWidth=2;c.beginPath();c.moveTo(x-14,y+28);c.lineTo(x-10,y);c.moveTo(x+14,y+28);c.lineTo(x+10,y);c.moveTo(x-12,y+18);c.lineTo(x+12,y+10);c.stroke();
    c.fillStyle=sh('#2a2826');c.fillRect(x-18,y-30,36,30);c.fillStyle=rgba('#7a3a18',.4);c.fillRect(x-18,y-30,36,4);c.fillRect(x+6,y-26,4,24);c.fillStyle=rgba(P.light,.1+.4*P.lightA);c.fillRect(x-18,y-30,36,1);
    c.strokeStyle=rgba('#000000',.35);c.lineWidth=.8;for(const yy of [y-20,y-10]){c.beginPath();c.moveTo(x-18,yy);c.lineTo(x+18,yy);c.stroke();}}
  {const x=1080,y0=200,y1=96;c.strokeStyle=sh('#141110');c.lineWidth=2.4;c.beginPath();c.moveTo(x,y0);c.lineTo(x,y1);c.moveTo(x-12,y1+6);c.lineTo(x+12,y1+6);c.stroke();
    c.strokeStyle=rgba('#0a0808',.65);c.lineWidth=.6;c.beginPath();c.moveTo(x-12,y1+6);c.quadraticCurveTo(880,y1+42,700,y1+30);c.moveTo(x+12,y1+6);c.quadraticCurveTo(1110,y1+20,1140,y1+16);c.moveTo(x-10,y1+6);c.quadraticCurveTo(840,y1+64,640,y1+60);c.stroke();}}
// ---------- the Sump ----------
// the back wall: boards and tin, the door, the window, the dormer and its hoist, the roof, the lofts and birds, the stovepipe
function sump(c,P){const Yd=Y(),far=Yd.far,b=(x,h)=>Q(x,h,far),x0=SUMP.x0,x1=SUMP.x1,sh=(col,k)=>K.shade(P,col,k);
  // the roof first: tin over the boards, running back up to the ridge, its corrugations catching the light
  {const a=b(x0-8,SUMP.eave),e=b(x1+10,SUMP.eave),rp=Q(x1+10,SUMP.ridge,far+SUMP.rd),lp=Q(x0-8,SUMP.ridge,far+SUMP.rd);
    c.fillStyle=lin(c,0,lp.y,0,a.y,[[0,K.topLit(P,'#46403c',1.1)],[1,sh('#2a2624',1.1)]]);K.poly(c,[a,e,rp,lp]);c.fill();
    c.save();K.poly(c,[a,e,rp,lp]);c.clip();
    for(let x=x0-8;x<x1+10;x+=5){const p0=b(x,SUMP.eave),p1=Q(x,SUMP.ridge,far+SUMP.rd);c.strokeStyle=rgba('#000000',.3);c.lineWidth=1.6;c.beginPath();c.moveTo(p0.x,p0.y);c.lineTo(p1.x,p1.y);c.stroke();
      c.strokeStyle=rgba(P.light,.04+.2*P.lightA);c.lineWidth=.6;c.beginPath();c.moveTo(p0.x+1.6,p0.y);c.lineTo(p1.x+1.6,p1.y);c.stroke();}
    // sheets of different ages: rusted, patched, one newer
    const r=rng(5);for(let i=0;i<9;i++){const sx=x0+r()*(x1-x0-60),sw=30+r()*60,hk=r()*.5,q0=b(sx,SUMP.eave),q1=b(sx+sw,SUMP.eave),q2=Q(sx+sw,lerp(SUMP.eave,SUMP.ridge,.5+hk),far+SUMP.rd*(.5+hk)),q3=Q(sx,lerp(SUMP.eave,SUMP.ridge,.5+hk),far+SUMP.rd*(.5+hk));
      c.fillStyle=rgba(r()<.6?'#7a3a1a':r()<.5?'#2a2624':'#8a8478',.16+.16*r());K.poly(c,[q0,q1,q2,q3]);c.fill();}
    // straw blown up there off the birds' hay
    c.strokeStyle=rgba('#c8a050',.45);c.lineWidth=.6;c.beginPath();for(let i=0;i<60;i++){const x=x0+20+r()*(x1-x0-40),hh=lerp(SUMP.eave,SUMP.ridge,r()),p=Q(x,hh,lerp(far,far+SUMP.rd,(hh-SUMP.eave)/(SUMP.ridge-SUMP.eave))),a=r()*TAU;c.moveTo(p.x,p.y);c.lineTo(p.x+Math.cos(a)*3,p.y+Math.sin(a)*1.5);}c.stroke();
    c.restore();
    c.strokeStyle=sh('#363230');c.lineWidth=3;c.beginPath();c.moveTo(lp.x,lp.y);c.lineTo(rp.x,rp.y);c.stroke();c.strokeStyle=rgba(P.light,.12+.45*P.lightA);c.lineWidth=.8;c.beginPath();c.moveTo(lp.x,lp.y-1.4);c.lineTo(rp.x,rp.y-1.4);c.stroke();}
  // Dob's pigeon lofts on the roof at the left: boxes of planks with round holes, the birds along the ridge
  {const r=rng(31);for(const [lx,lw,lh] of [[60,40,26],[106,34,22],[146,38,25]]){const fb=Q(lx,SUMP.ridge-6,far+SUMP.rd-8),fr=Q(lx+lw,SUMP.ridge-6,far+SUMP.rd-8);
      c.fillStyle=sh('#3e3226',1.1);c.fillRect(fb.x,fb.y-lh,fr.x-fb.x,lh);c.fillStyle=sh('#241a12',1.2);c.fillRect(fr.x,fb.y-lh+2,4,lh-2);
      c.fillStyle=K.topLit(P,'#4a3c30',.9);c.beginPath();c.moveTo(fb.x-3,fb.y-lh);c.lineTo((fb.x+fr.x)/2,fb.y-lh-7);c.lineTo(fr.x+4,fb.y-lh);c.closePath();c.fill();
      for(let q=0;q<3;q++){c.fillStyle='#0a0808';c.beginPath();c.arc(fb.x+lw*(.2+q*.3),fb.y-lh*.55,2.3,0,TAU);c.fill();c.fillStyle=sh('#5a4a3a');c.fillRect(fb.x+lw*(.2+q*.3)-3.6,fb.y-lh*.55+2.6,7.2,1.1);}}
    for(let i=0;i<9;i++){const x=40+r()*400,p=Q(x,SUMP.ridge,far+SUMP.rd);bird(c,p.x,p.y-1.4,r()<.5?1:-1,.9+r()*.3,K.shade(P,['#4a4e5c','#3a3e4a','#5c5e6a'][(r()*3)|0],.8));}}
  // the stovepipe through the roof, its cap (the smoke is live)
  {const p=Q(318,lerp(SUMP.eave,SUMP.ridge,.45),far+SUMP.rd*.45);c.fillStyle=sh('#1e1a18');c.fillRect(p.x-3.5,p.y-52,7,52);c.fillStyle=sh('#2e2826');c.fillRect(p.x-6,p.y-56,12,4);c.fillStyle=rgba(P.light,.08+.35*P.lightA);c.fillRect(p.x-3.5,p.y-52,1.2,52);
    c.fillStyle=rgba('#7a3a18',.45);c.fillRect(p.x+1,p.y-40,2.4,30);STOVE.x=p.x;STOVE.y=p.y-57;}
  // the wall: boards, tin patched over them
  {const a=b(x0,SUMP.eave),e=b(x1,0);K.boards(c,a.x,a.y,e.x,e.y,{base:sh('#43352a'),bw:10,seed:7,rails:[a.y+16,e.y-46],foot:24,pal:P});
    const r=rng(9);for(const [px,ph,pw,hh] of [[244,40,40,46],[420,12,46,60],[78,96,54,40],[350,24,34,30],[452,90,18,60]]){const p=b(px,ph+hh);K.tin(c,p.x,p.y,pw,hh,{base:sh(['#45413e','#52443a','#48443f'][(r()*3)|0],1.1),seed:px,pal:P,rust:3});}
    // the light from above on the top of the wall, the dark under the eave, the corner posts
    c.fillStyle=lin(c,0,a.y,0,e.y,[[0,rgba('#000000',0)],[.6,rgba('#000000',.08)],[1,rgba('#000000',.3)]]);c.fillRect(a.x,a.y,e.x-a.x,e.y-a.y);
    c.fillStyle=lin(c,0,a.y,0,a.y+22,[[0,rgba('#000000',.55)],[1,rgba('#000000',0)]]);c.fillRect(a.x,a.y,e.x-a.x,22);
    for(const xx of [x0,x1]){const p=b(xx,SUMP.eave),q=b(xx,0);c.fillStyle=sh('#2a2018');c.fillRect(p.x-3,p.y,6,q.y-p.y);c.fillStyle=rgba(P.light,.05+.18*P.lightA);c.fillRect(p.x+1.5,p.y,1,q.y-p.y);}}
  // the gutter and the downpipe to the rain barrel
  {const a=b(x0-6,SUMP.eave),e=b(x1+8,SUMP.eave);c.fillStyle=sh('#2a2624');c.fillRect(a.x,a.y-2,e.x-a.x,5);c.fillStyle=rgba(P.light,.1+.35*P.lightA);c.fillRect(a.x,a.y-2,e.x-a.x,1);
    const dp=b(456,SUMP.eave),db=b(456,40);c.fillStyle=sh('#262220');c.fillRect(dp.x-2.4,dp.y,4.8,db.y-dp.y);c.fillStyle=rgba(P.light,.05+.22*P.lightA);c.fillRect(dp.x-1.6,dp.y,1,db.y-dp.y);
    for(const yy of [dp.y+30,dp.y+80]){c.fillStyle=sh('#1a1614');c.fillRect(dp.x-4,yy,8,2.4);}}
  door(c,P);win(c,P);dormer(c,P);}
// a pigeon sitting: a plump body, a round head, the tail
function bird(c,x,y,fa,s,col){c.save();c.translate(x,y);c.scale(fa*s,s);c.fillStyle=col;c.beginPath();c.ellipse(0,-2.6,3.4,2.2,-.15,0,TAU);c.fill();c.beginPath();c.arc(2.8,-4.8,1.5,0,TAU);c.fill();
  c.beginPath();c.moveTo(-2.8,-3.2);c.lineTo(-6,-2);c.lineTo(-2.8,-1.2);c.closePath();c.fill();c.restore();}
// the back door: planks in a frame under a little tin hood; at night open on the kitchen's light
function door(c,P){const Yd=Y(),D=Yd.door,far=Yd.far,b=(x,h)=>Q(x,h,far),x0=D.x-D.w/2,x1=D.x+D.w/2,top=b(x0,SUMP.doorH),bot=b(x1,0),sh=(col,k)=>K.shade(P,col,k),night=P.key==='night',w=bot.x-top.x,h=bot.y-top.y;
  c.fillStyle=sh('#2a1e16');c.fillRect(top.x-5,top.y-6,w+10,h+6);
  if(night){// open: the kitchen beyond, warm with the stove; a shelf of pots, a hanging lamp; the leaf swung in against the jamb
    c.fillStyle=lin(c,0,top.y,0,bot.y,[[0,'#6a3014'],[.45,'#b8642a'],[1,'#e89a50']]);c.fillRect(top.x,top.y,w,h);
    c.fillStyle=rgba('#3a1a0a',.55);c.fillRect(top.x,top.y+h*.3,w,2.4);for(const [px,pw,ph] of [[8,8,7],[20,6,9],[30,9,6]]){c.fillRect(top.x+px,top.y+h*.3-ph,pw,ph);}
    c.fillStyle=rgba('#2a1206',.5);c.fillRect(top.x+w*.45,top.y+h*.62,w*.55,h*.38);c.fillStyle=rgba('#ff7a2a',.35);c.fillRect(top.x+w*.5,top.y+h*.66,w*.4,3);
    c.strokeStyle=rgba('#2a1206',.7);c.lineWidth=.8;c.beginPath();c.moveTo(top.x+w*.62,top.y);c.lineTo(top.x+w*.62,top.y+h*.16);c.stroke();c.fillStyle='#fff0c8';c.fillRect(top.x+w*.62-2.4,top.y+h*.16,4.8,5);
    c.fillStyle='#140a06';c.beginPath();c.moveTo(top.x,top.y);c.lineTo(top.x+10,top.y+5);c.lineTo(top.x+10,bot.y-3);c.lineTo(top.x,bot.y);c.closePath();c.fill();
    c.save();c.globalCompositeOperation='lighter';K.glowAt(c,top.x+w*.6,top.y+h*.2,16,'#fff0c8',.6);K.glowAt(c,top.x+w/2,top.y+h*.55,64,'#ffb25e',.38,1.3);c.restore();}
  else{K.boards(c,top.x,top.y,bot.x,bot.y,{base:sh('#34261c'),bw:7.6,seed:21,foot:14,pal:P,top:false});
    c.fillStyle=sh('#24180f');for(const yy of [top.y+18,bot.y-24])c.fillRect(top.x,yy,w,4);
    c.strokeStyle=sh('#24180f');c.lineWidth=4;c.beginPath();c.moveTo(top.x+3,bot.y-24);c.lineTo(bot.x-3,top.y+22);c.stroke();
    c.fillStyle=sh('#5a5450');c.beginPath();c.arc(bot.x-8,top.y+h*.55,1.8,0,TAU);c.fill();c.fillStyle=sh('#1a1410');c.fillRect(bot.x-10,top.y+h*.55+4,4,6);
    // the kitchen's light leaking round it
    c.fillStyle=rgba('#ffb25e',.2+.3*P.lamp);c.fillRect(top.x,bot.y-2,w,1.2);c.fillRect(bot.x-1,top.y+2,1,h-4);}
  // the hood: a strip of tin on two brackets
  {const a=Q(x0-10,SUMP.doorH+12,far),e=Q(x1+10,SUMP.doorH+12,far),f=Q(x1+10,SUMP.doorH+6,far-16),g=Q(x0-10,SUMP.doorH+6,far-16);c.fillStyle=K.topLit(P,'#3a3634',.8);K.poly(c,[a,e,f,g]);c.fill();
    c.fillStyle=sh('#1e1c1a');c.fillRect(g.x,g.y,f.x-g.x,2.2);c.fillStyle=rgba('#7a3a18',.3);K.poly(c,[a,e,Q(x1+10,SUMP.doorH+10,far-5),Q(x0-10,SUMP.doorH+10,far-5)]);c.fill();
    c.strokeStyle=sh('#1a1612');c.lineWidth=1.4;c.beginPath();for(const xx of [x0-5,x1+5]){const p=Q(xx,SUMP.doorH+7,far-14),q=Q(xx,SUMP.doorH-12,far);c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);}c.stroke();}
  // the lantern on its bracket by the door (its glow is live() at night)
  {const p=Q(LANT.x,LANT.h,LANT.d);c.strokeStyle=sh('#1a1612');c.lineWidth=1.4;c.beginPath();c.moveTo(p.x-7,p.y-14);c.lineTo(p.x,p.y-14);c.lineTo(p.x,p.y-10);c.stroke();K.lantern(c,P,p.x,p.y-10,1,night);}}
// the window: small panes in a frame, lit from the bar; a shutter hanging open beside it
function win(c,P){const Yd=Y(),W0=Yd.window,far=Yd.far,b=(x,h)=>Q(x,h,far),a=b(W0.x0,W0.y0),e=b(W0.x1,W0.y1),w=e.x-a.x,h=e.y-a.y,sh=(col,k)=>K.shade(P,col,k),night=P.key==='night',k=night?1:.55+.3*P.lamp;
  c.fillStyle=sh('#22180f');c.fillRect(a.x-4,a.y-4,w+8,h+8);
  c.fillStyle=lin(c,0,a.y,0,e.y,[[0,mix('#5a2e14','#ffcf86',k*.55)],[.6,mix('#5a2e14','#ffb25e',k*.75)],[1,mix('#5a2e14','#ffd9a0',k*.6)]]);c.fillRect(a.x,a.y,w,h);
  // the bar's inside: a shelf of bottles, a head at the counter
  c.fillStyle=rgba('#2a1206',.75);c.fillRect(a.x,a.y+h*.62,w,h*.38);for(let x=a.x+3;x<a.x+w-3;x+=4.6){c.fillRect(x,a.y+h*.62-5,2.4,5);c.fillRect(x+.6,a.y+h*.62-7,1.2,2);}
  c.beginPath();c.arc(a.x+w*.7,a.y+h*.48,4,0,TAU);c.fill();c.fillRect(a.x+w*.7-6,a.y+h*.5,12,h*.5);
  if(night){c.save();c.globalCompositeOperation='lighter';K.glowAt(c,a.x+w*.3,a.y+h*.25,10,'#fff0c8',.8);c.restore();}
  c.fillStyle=sh('#1a120c');c.fillRect(a.x+w/3-1,a.y,2,h);c.fillRect(a.x+2*w/3-1,a.y,2,h);c.fillRect(a.x,a.y+h/2-1,w,2);c.strokeStyle=sh('#1a120c');c.lineWidth=1.6;c.strokeRect(a.x,a.y,w,h);
  c.strokeStyle=rgba('#ffffff',.25);c.lineWidth=.5;c.beginPath();c.moveTo(a.x+4,a.y+3);c.lineTo(a.x+12,a.y+14);c.lineTo(a.x+9,a.y+20);c.stroke();
  c.fillStyle=K.topLit(P,'#3e3226',.8);c.fillRect(a.x-6,e.y,w+12,4);c.fillStyle=rgba('#000000',.4);c.fillRect(a.x-6,e.y+4,w+12,2);
  K.boards(c,a.x-30,a.y-2,a.x-8,e.y+2,{base:sh('#33291f'),bw:7,seed:13,foot:4,pal:P,top:false});c.fillStyle=sh('#241a12');c.fillRect(a.x-30,a.y+6,22,3);c.fillRect(a.x-30,e.y-8,22,3);
  c.save();c.globalCompositeOperation='lighter';K.glowAt(c,a.x+w/2,a.y+h/2,w*1.3,'#ffb25e',.26*k);c.restore();}
// the dormer in the roof over the ladder: a plank door at the loft's floor, its own little gable, the hoist beam over it with a pulley
function dormer(c,P){const Yd=Y(),Ld=Yd.ladder,far=Yd.far,b=(x,h)=>Q(x,h,far),cx=Ld.x,sill=Ld.top,sh=(col,k)=>K.shade(P,col,k),hw=24,dh=58;
  const fl=b(cx-hw,sill-6),fr=b(cx+hw,sill-6),tl=b(cx-hw,sill+dh-14),tr=b(cx+hw,sill+dh-14),pk=b(cx,sill+dh+12);
  c.fillStyle=sh('#2a2018',1.2);K.poly(c,[fr,tr,Q(cx+hw,sill+dh-14,far+30),Q(cx+hw,SUMP.eave+6,far+30)]);c.fill();
  K.boards(c,fl.x,tl.y,fr.x,fl.y,{base:sh('#43352a'),bw:9,seed:15,foot:2,pal:P});
  c.fillStyle=sh('#43352a');c.beginPath();c.moveTo(tl.x,tl.y);c.lineTo(pk.x,pk.y);c.lineTo(tr.x,tr.y);c.closePath();c.fill();
  for(const [p0,p1] of [[tl,pk],[pk,tr]]){c.fillStyle=K.topLit(P,'#46403c');c.beginPath();c.moveTo(p0.x-(p0===tl?4:0),p0.y+(p0===tl?2:0));c.lineTo(p1.x+(p1===tr?4:0),p1.y+(p1===tr?2:0));c.lineTo(p1.x+(p1===tr?4:0)+8,p1.y+(p1===tr?2:0)-24);c.lineTo(p0.x-(p0===tl?4:0)+8,p0.y+(p0===tl?2:0)-24);c.closePath();c.fill();}
  c.strokeStyle=sh('#2e2a28');c.lineWidth=2.4;c.beginPath();c.moveTo(tl.x-4,tl.y+2);c.lineTo(pk.x,pk.y);c.lineTo(tr.x+4,tr.y+2);c.stroke();
  const da=b(cx-14,sill+44),de=b(cx+14,sill);K.boards(c,da.x,da.y,de.x,de.y,{base:sh('#34261c'),bw:7,seed:17,foot:4,pal:P,top:false});
  c.fillStyle=sh('#22180f');c.fillRect(da.x-3,de.y,de.x-da.x+6,3.4);c.fillRect(da.x-2,da.y-3,de.x-da.x+4,3);c.fillRect(da.x,da.y+(de.y-da.y)*.45,de.x-da.x,3);
  c.fillStyle='#0a0706';c.fillRect(da.x+2,da.y,de.x-da.x-4,3);
  {const p0=Q(cx,sill+dh+2,far),p1=Q(cx,sill+dh+2,far-26);c.fillStyle=sh('#2e2218');c.beginPath();c.moveTo(p0.x,p0.y-2);c.lineTo(p1.x,p1.y-2);c.lineTo(p1.x,p1.y+4);c.lineTo(p0.x,p0.y+4);c.closePath();c.fill();
    c.fillStyle=rgba(P.light,.08+.3*P.lightA);c.fillRect(p1.x,p1.y-2,p0.x-p1.x,1);c.fillStyle=sh('#3a3632');c.beginPath();c.arc(p1.x+2,p1.y+7,3.4,0,TAU);c.fill();
    c.strokeStyle=sh('#5a4a38');c.lineWidth=.9;c.beginPath();c.moveTo(p1.x+5,p1.y+7);c.lineTo(p1.x+5,p1.y+50);c.quadraticCurveTo(p1.x+7,p1.y+58,p1.x+1,p1.y+62);c.moveTo(p1.x-1,p1.y+7);c.lineTo(p1.x-1,p1.y+30);c.stroke();
    c.fillStyle=sh('#3a3632');c.beginPath();c.arc(p1.x+1,p1.y+64,2,0,TAU);c.fill();}}
// the ladder against the wall up to the loft door: two long rails and their rungs, a hand's polish on them
function ladder(c,P){const Yd=Y(),Ld=Yd.ladder,sh=(col,k)=>K.shade(P,col,k),foot=Ld.d-12,top=Ld.d+6,ht=Ld.top+18,rail=xx=>[Q(xx,0,foot),Q(xx,ht,top)];
  {const a=Q(Ld.x+6,4,Yd.far),e=Q(Ld.x+6,ht-6,Yd.far);c.strokeStyle=rgba('#000000',.25);c.lineWidth=14;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(e.x+3,e.y);c.stroke();}
  const [la,lb]=rail(Ld.x-9),[ra,rb]=rail(Ld.x+9);
  c.lineCap='round';c.strokeStyle=sh('#54402c');c.lineWidth=2.6;c.beginPath();for(let hh=10;hh<ht-4;hh+=14){const u=hh/ht,p=Q(Ld.x-9,hh,lerp(foot,top,u)),q=Q(Ld.x+9,hh,lerp(foot,top,u));c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);}c.stroke();
  c.strokeStyle=rgba(P.light,.06+.35*P.lightA);c.lineWidth=.8;c.beginPath();for(let hh=10;hh<ht-4;hh+=14){const u=hh/ht,p=Q(Ld.x-9,hh,lerp(foot,top,u)),q=Q(Ld.x+9,hh,lerp(foot,top,u));c.moveTo(p.x,p.y-1);c.lineTo(q.x,q.y-1);}c.stroke();
  for(const [a,e] of [[la,lb],[ra,rb]]){c.strokeStyle=sh('#463222');c.lineWidth=4.2;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(e.x,e.y);c.stroke();
    c.strokeStyle=rgba(P.light,.08+.4*P.lightA);c.lineWidth=1;c.beginPath();c.moveTo(a.x-1.4,a.y);c.lineTo(e.x-1.4,e.y);c.stroke();}
  c.lineCap='butt';}
// the stairs round the side: a flight of planks against the wall from the yard up to a landing at the corner, which turns away
// round the side of the building; a handrail on posts
function sideStair(c,P){const Yd=Y(),St=Yd.sidestair,sh=(col,k)=>K.shade(P,col,k),d0=St.d,d1=Yd.far-2,xb=St.x1,xt=St.x0,top=150,n=10,run=(xb-xt)/n,rise=top/n;
  const lx0=xt-26,lx1=xt+6;
  for(const xx of [lx0+3,lx1-2]){const a=Q(xx,0,d0+2),e=Q(xx,top,d0+2);c.fillStyle=sh('#2a1e16');c.fillRect(a.x-2,e.y,4,a.y-e.y);}
  c.fillStyle=K.topLit(P,'#3e3024',.65);K.poly(c,[Q(lx0,top,d0),Q(lx1,top,d0),Q(lx1,top,d1),Q(lx0,top,d1)]);c.fill();
  c.fillStyle=sh('#2a1e16');K.poly(c,[Q(lx0,top,d0),Q(lx1,top,d0),Q(lx1,top-5,d0),Q(lx0,top-5,d0)]);c.fill();
  for(let i=0;i<n;i++){const xa=xb-(i+1)*run,xe=xb-i*run,hh=(i+1)*rise;
    c.fillStyle=sh('#33271c',1.2);K.poly(c,[Q(xe,hh,d0),Q(xe,hh-rise,d0),Q(xe,hh-rise,d1),Q(xe,hh,d1)]);c.fill();
    c.fillStyle=K.topLit(P,'#3e3024',.6);K.poly(c,[Q(xa,hh,d0),Q(xe,hh,d0),Q(xe,hh,d1),Q(xa,hh,d1)]);c.fill();
    c.fillStyle=rgba('#000000',.3);K.poly(c,[Q(xa,hh,d0+8),Q(xe,hh,d0+8),Q(xe,hh,d0+12),Q(xa,hh,d0+12)]);c.fill();
    c.fillStyle=rgba(P.light,.06+.3*P.lightA);K.poly(c,[Q(xe-1.2,hh,d0),Q(xe,hh,d0),Q(xe,hh,d1),Q(xe-1.2,hh,d1)]);c.fill();}
  {const a=Q(xb+4,0,d0),e=Q(xt-2,top,d0);c.strokeStyle=sh('#2a1e16');c.lineWidth=7;c.beginPath();c.moveTo(a.x,a.y-2);c.lineTo(e.x,e.y+2);c.stroke();
    c.strokeStyle=rgba(P.light,.06+.3*P.lightA);c.lineWidth=1;c.beginPath();c.moveTo(a.x,a.y-5.5);c.lineTo(e.x,e.y-1.5);c.stroke();}
  c.strokeStyle=sh('#33251a');c.lineWidth=2.2;c.beginPath();
  const rail=[];for(const [xx,hh] of [[xb+2,0],[xb-run*3.5,rise*3.5],[xb-run*7,rise*7],[xt,top],[lx0+3,top]]){const a=Q(xx,hh,d0-1),e=Q(xx,hh+34,d0-1);c.moveTo(a.x,a.y);c.lineTo(e.x,e.y);rail.push(e);}
  c.stroke();c.lineWidth=2.6;c.beginPath();rail.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));const rc=Q(lx0+3,top+34,d1);c.lineTo(rc.x,rc.y);c.stroke();
  c.strokeStyle=rgba(P.light,.08+.35*P.lightA);c.lineWidth=.7;c.beginPath();rail.forEach((p,i)=>i?c.lineTo(p.x,p.y-1.2):c.moveTo(p.x,p.y-1.2));c.stroke();}
// the low fence across the foot of the side stairs, to keep the yard's dogs and goats off the roof: a short run in front of the
// lowest steps, the gate's two posts, and a run back to the wall along the side of the door's step (the gate is a piece: gateLeaf)
function stairFence(c,P){const G=SG(),far=Y().far,sh=(col,k)=>K.shade(P,col,k),hx=G.x-G.w/2,lx=G.x+G.w/2,d=G.d,x0=hx-28,r=rng(131);
  // the run in front of the steps: pickets on two rails
  c.strokeStyle=sh('#2e2218',1.1);c.lineWidth=2.6;c.beginPath();for(const hh of [12,SGH-10]){const a=Q(x0,hh,d),e=Q(hx,hh,d);c.moveTo(a.x,a.y);c.lineTo(e.x,e.y);}c.stroke();
  for(let x=x0+4;x<hx-2;x+=6){const a=Q(x,0,d),e=Q(x,SGH-2-(r()<.3?4:0),d);c.fillStyle=sh('#3a2c20',1.1);c.fillRect(a.x-2,e.y,4,a.y-e.y);c.fillStyle=rgba(P.light,.06+.25*P.lightA);c.fillRect(a.x-2,e.y,4,1);}
  // the run back to the wall, along depth: its right face toward the eye
  {const A=Q(lx,0,d),B=Q(lx,0,far),Bt=Q(lx,SGH-4,far),At=Q(lx,SGH-4,d);c.fillStyle=sh('#33261a',1.15);K.poly(c,[A,B,Bt,At]);c.fill();
    c.strokeStyle=rgba('#000000',.45);c.lineWidth=.7;c.beginPath();for(let dd=d+6;dd<far;dd+=6){const a=Q(lx,0,dd),e=Q(lx,SGH-4,dd);c.moveTo(a.x,a.y);c.lineTo(e.x,e.y);}c.stroke();
    c.fillStyle=K.topLit(P,'#3e3024',.7);K.poly(c,[At,Bt,Q(lx+3,SGH-4,far),Q(lx+3,SGH-4,d)]);c.fill();}
  // the posts: the hinge post, the latch post, the end post
  for(const [px,ph] of [[x0,SGH+4],[hx,SGH+10],[lx,SGH+10]]){const a=Q(px-3,0,d),e=Q(px+3,ph,d);c.fillStyle=sh('#2a1e14',1.1);c.fillRect(a.x,e.y,e.x-a.x,a.y-e.y);
    c.fillStyle=sh('#1e150e',1.3);K.poly(c,[Q(px+3,0,d),Q(px+3,ph,d),Q(px+3,ph,d+6),Q(px+3,0,d+6)]);c.fill();c.fillStyle=K.topLit(P,'#3a2c20',.8);c.fillRect(a.x,e.y-1.4,e.x-a.x,1.6);}}
// the woodshed at the right end of the Sump: boards under a lean-to roof, its door open on the dark, logs stacked
function shed(c,P){const Yd=Y(),far=Yd.far,sh=(col,k)=>K.shade(P,col,k),x0=SUMP.x1,x1=SHED.x1;
  const ra=Q(x0,SHED.h,far),re=Q(x1,SHED.h,far),rb=Q(x1,SHED.back,far+40),rf=Q(x0,SHED.back,far+40);c.fillStyle=lin(c,0,rb.y,0,ra.y,[[0,K.topLit(P,'#46403c',1)],[1,sh('#2a2624')]]);K.poly(c,[ra,re,rb,rf]);c.fill();
  c.save();K.poly(c,[ra,re,rb,rf]);c.clip();for(let x=x0;x<x1;x+=5){const p=Q(x,SHED.h,far),q=Q(x,SHED.back,far+40);c.strokeStyle=rgba('#000000',.3);c.lineWidth=1.4;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);c.stroke();}
  c.fillStyle=rgba('#7a3a1a',.28);c.fillRect(ra.x+30,rb.y,40,ra.y-rb.y);c.restore();
  c.fillStyle=sh('#261c14',1.2);K.poly(c,[Q(x1,0,far),Q(x1,SHED.h,far),Q(x1,SHED.back,far+40),Q(x1,0,far+40)]);c.fill();
  const a=Q(x0,SHED.h,far),e=Q(x1,0,far);K.boards(c,a.x,a.y,e.x,e.y,{base:sh('#3a2e22'),bw:11,seed:23,rails:[a.y+14],foot:18,pal:P});
  c.fillStyle=lin(c,0,a.y,0,a.y+14,[[0,rgba('#000000',.5)],[1,rgba('#000000',0)]]);c.fillRect(a.x,a.y,e.x-a.x,14);
  const da=Q(x0+56,78,far),de=Q(x0+92,0,far);c.fillStyle='#0c0907';c.fillRect(da.x,da.y,de.x-da.x,de.y-da.y);c.fillStyle=rgba(P.light,.03+.08*P.lightA);c.fillRect(da.x,de.y-14,de.x-da.x,14);
  c.fillStyle=sh('#241a12');c.beginPath();c.moveTo(de.x,da.y);c.lineTo(de.x+12,da.y+4);c.lineTo(de.x+12,de.y-2);c.lineTo(de.x,de.y);c.closePath();c.fill();
  // a saw and a coil of rope on nails inside the door, a sack slumped in it
  c.strokeStyle=rgba(P.light,.12+.2*P.lightA);c.lineWidth=.8;c.beginPath();c.moveTo(da.x+6,da.y+16);c.lineTo(da.x+20,da.y+20);c.stroke();
  const r=rng(41);for(let row=0;row<4;row++)for(let q=0;q<6-row;q++){const p=Q(x0+8+q*9+row*4.5,7+row*8,far-8);c.fillStyle=sh(['#5e4830','#50402c','#6a5236'][(r()*3)|0]);c.beginPath();c.arc(p.x,p.y,4.4,0,TAU);c.fill();
    c.strokeStyle=rgba('#2a1a0e',.6);c.lineWidth=.5;c.beginPath();c.arc(p.x,p.y,2.4,0,TAU);c.stroke();c.fillStyle=rgba(P.light,.05+.25*P.lightA);c.fillRect(p.x-2,p.y-4,4,1);}}
// ---------- the yard wall and the fence ----------
function yardWall(c,P){const Yd=Y(),Wl=Yd.wall,sh=(col,k)=>K.shade(P,col,k),d=Wl.d,x0=Wl.x0,x1=FENCE.x+4,h=Wl.h,a=Q(x0,h,d),e=Q(x1,0,d),r=rng(51);
  // brick low down, patched with stone; tin and boards over it; a plank coping
  {c.save();c.beginPath();c.rect(a.x,a.y,e.x-a.x,e.y-a.y);c.clip();
    c.fillStyle=sh('#42291f',1.1);c.fillRect(a.x,a.y,e.x-a.x,e.y-a.y);
    for(let y=e.y-4.5,row=0;y>a.y+20;y-=4.5,row++)for(let x=a.x-(row%2)*5;x<e.x;x+=10){const v=r();c.fillStyle=sh(v<.4?'#4e2e22':v<.75?'#42271d':'#352723',1.1);c.fillRect(x+.5,y+.5,9,3.6);}
    c.fillStyle=rgba('#000000',.25);for(let y=e.y-4.5;y>a.y+20;y-=4.5)c.fillRect(a.x,y,e.x-a.x,.6);
    for(const [px,pw] of [[60,70],[160,90],[268,40]]){K.tin(c,a.x+px,a.y+2,pw,26+r()*8,{base:sh(['#45413e','#52443a','#48443f'][(r()*3)|0],1.1),seed:px*3,pal:P,rust:3});}
    K.boards(c,a.x+0,a.y+2,a.x+58,a.y+30,{base:sh('#382c22',1.1),bw:9,seed:61,foot:4,pal:P});K.boards(c,a.x+232,a.y+2,a.x+266,a.y+34,{base:sh('#342a20',1.1),bw:9,seed:63,foot:4,pal:P});
    for(let i=0;i<6;i++){const sx=a.x+20+r()*(e.x-a.x-40),sy=e.y-10-r()*24;c.fillStyle=sh('#4e4a44',1.1);c.beginPath();c.ellipse(sx,sy,5+r()*4,3+r()*2,0,0,TAU);c.fill();c.fillStyle=rgba(P.light,.06+.25*P.lightA);c.fillRect(sx-3,sy-3,6,1);}
    c.fillStyle=lin(c,0,a.y,0,e.y,[[0,rgba('#000000',0)],[1,rgba('#000000',.35)]]);c.fillRect(a.x,a.y,e.x-a.x,e.y-a.y);c.restore();}
  // the coping: planks along its top (seen from above), bottles along it
  {const t0=Q(x0-4,h,d-4),t1=Q(x1+4,h,d-4),t2=Q(x1+4,h,d+6),t3=Q(x0-4,h,d+6);c.fillStyle=K.topLit(P,'#3e3226',.9);K.poly(c,[t0,t1,t2,t3]);c.fill();
    c.fillStyle=sh('#241a12');c.fillRect(t0.x,t0.y,t1.x-t0.x,3);c.fillStyle=rgba('#000000',.3);for(let x=x0+40;x<x1;x+=64+r()*20){const p=Q(x,h,d-4),q=Q(x,h,d+6);c.fillRect(p.x,q.y,1,p.y-q.y);}
    for(const bx of [652,664,792,808,820]){const p=Q(bx,h,d);c.fillStyle=sh(r()<.5?'#24402a':'#40321a');c.fillRect(p.x-1.6,p.y-9,3.2,9);c.fillRect(p.x-.7,p.y-12,1.4,3);c.fillStyle=rgba(P.light,.1+.35*P.lightA);c.fillRect(p.x-1,p.y-8,.7,6);}}}
// the fence on the right: planks between posts running back to the yard wall, the gateway in it under a little roof, the gate's planks
// and its brace, the latch; seen from outside the yard, as the yard is seen
function fence(c,P){const Yd=Y(),G=Yd.gate,sh=(col,k)=>K.shade(P,col,k),x=FENCE.x,h=FENCE.h,dB=Yd.wall.d,g0=G.d-G.w/2,g1=G.d+G.w/2,r=rng(71);
  const face=(d0,d1,h0,h1,col)=>{c.fillStyle=col;K.poly(c,[Q(x,h0,d0),Q(x,h0,d1),Q(x,h1,d1),Q(x,h1,d0)]);c.fill();};
  for(const [d0,d1] of [[g1+5,dB],[-30,g0-5]]){face(d0,d1,0,h,sh('#342a1e',1.1));
    c.strokeStyle=rgba('#000000',.4);c.lineWidth=.7;c.beginPath();for(let d=d0;d<d1;d+=7){const a=Q(x,0,d),e=Q(x,h-(r()<.3?4:0),d);c.moveTo(a.x,a.y);c.lineTo(e.x,e.y);}c.stroke();
    c.fillStyle=K.topLit(P,'#3e3226',.9);K.poly(c,[Q(x,h,d0),Q(x,h,d1),Q(x+4,h,d1),Q(x+4,h,d0)]);c.fill();
    for(const hh of [14,h-12]){c.strokeStyle=sh('#261c14');c.lineWidth=2.6;const a=Q(x+1,hh,d0),e=Q(x+1,hh,d1);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(e.x,e.y);c.stroke();}}
  // (the gate's leaf is a piece of its own, among the people, so it can swing: gateLeaf)
  for(const d of [g0-3,g1+3]){const a=Q(x-4,0,d-4),e=Q(x+4,FENCE.post,d-4);c.fillStyle=sh('#2a1e14');c.fillRect(a.x,e.y,e.x-a.x,a.y-e.y);c.fillStyle=sh('#1e150e',1.2);K.poly(c,[Q(x+4,0,d-4),Q(x+4,FENCE.post,d-4),Q(x+4,FENCE.post,d+4),Q(x+4,0,d+4)]);c.fill();
    c.fillStyle=rgba(P.light,.08+.3*P.lightA);c.fillRect(a.x,e.y,1.2,a.y-e.y);}
  // the little roof over the gateway: a crossbeam on the posts, two slopes of tin on a ridge running back over the gate, its gable
  // end toward us
  {const d0=g0-14,d1=g1+14,eh=FENCE.post+1,rh=FENCE.post+17,ex=15;
    {const a=Q(x,FENCE.post-4,g0-6),e=Q(x,FENCE.post-4,g1+6);c.strokeStyle=sh('#2a1e14');c.lineWidth=4;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(e.x,e.y);c.stroke();}
    const fl=Q(x-ex,eh,d0),fr=Q(x+ex,eh,d0),fp=Q(x,rh,d0),bp=Q(x,rh,d1),bl=Q(x-ex,eh,d1),br=Q(x+ex,eh,d1);
    c.fillStyle=K.shade(P,'#3a3634',1.1);K.poly(c,[fl,fp,bp,bl]);c.fill();
    c.fillStyle=K.topLit(P,'#46403a',1);K.poly(c,[fp,bp,br,fr]);c.fill();
    c.save();K.poly(c,[fp,bp,br,fr]);c.clip();c.strokeStyle=rgba('#000000',.3);c.lineWidth=1.2;c.beginPath();for(let k=1;k<6;k++){const a=Q(x+ex*k/6,lerp(rh,eh,k/6),d0),e=Q(x+ex*k/6,lerp(rh,eh,k/6),d1);c.moveTo(a.x,a.y);c.lineTo(e.x,e.y);}c.stroke();
      c.fillStyle=rgba('#7a3a18',.3);K.poly(c,[Q(x+ex*.5,lerp(rh,eh,.5),d0),Q(x+ex*.5,lerp(rh,eh,.5),d1),br,fr]);c.fill();c.restore();
    c.fillStyle=sh('#2a2018',1.2);K.poly(c,[fl,fp,fr]);c.fill();c.fillStyle=sh('#1a1410',1.3);K.poly(c,[Q(x-ex+3,eh+1,d0),Q(x,rh-3,d0),Q(x+ex-3,eh+1,d0)]);c.fill();
    c.strokeStyle=rgba(P.light,.12+.4*P.lightA);c.lineWidth=1;c.beginPath();c.moveTo(fl.x,fl.y);c.lineTo(fp.x,fp.y);c.lineTo(bp.x,bp.y);c.stroke();}
  {const p=Q(x+GLAMP.dx,GLAMP.h,g0+GLAMP.dd);c.strokeStyle=sh('#1a1612');c.lineWidth=.8;c.beginPath();c.moveTo(p.x,p.y-16);c.lineTo(p.x,p.y-7);c.stroke();K.lantern(c,P,p.x,p.y-8,.75,P.key==='night'||P.key==='dusk');}}
// beyond the fence: the lane out, and the first of the stair-streets going up the Pit's wall, shacks along it
function beyond(c,P){const sh=(col,k)=>K.shade(P,col,k),r=rng(91);
  const x0=900,y0=262,steps=12;c.fillStyle=sh('#262220',1.1);c.beginPath();c.moveTo(x0,y0+4);for(let i=0;i<=steps;i++){c.lineTo(x0+i*20,y0-i*10);c.lineTo(x0+i*20+20,y0-i*10);}c.lineTo(x0+steps*20+40,y0+50);
  for(let x=x0+steps*20+40;x>x0;x-=14)c.lineTo(x,y0+8+Math.min(42,(x-x0)*.2)*(.6+.4*r()));c.closePath();c.fill();
  for(let i=0;i<steps;i++){c.fillStyle=K.topLit(P,'#423c36',.9);c.fillRect(x0+i*20,y0-i*10-3,20,3);c.fillStyle=rgba('#000000',.3);c.fillRect(x0+i*20,y0-i*10,20,1);}
  c.strokeStyle=sh('#1e1a16');c.lineWidth=1.4;c.beginPath();for(let i=0;i<=steps;i+=2){c.moveTo(x0+i*20+6,y0-i*10);c.lineTo(x0+i*20+6,y0-i*10-24);}c.moveTo(x0+6,y0-24);c.lineTo(x0+steps*20+6,y0-steps*10-24);c.stroke();
  for(let i=1;i<steps;i+=3){const sx=x0+i*20,sy=y0-i*10-40;c.fillStyle=sh(K.SHACK[(r()*K.SHACK.length)|0],1.1);c.fillRect(sx,sy-30,46,34);c.fillStyle=K.topLit(P,'#46403a');c.fillRect(sx-3,sy-33,52,4);
    const lw=r()<P.win*2;c.fillStyle=lw?'#e8a860':'#0e0c0c';c.fillRect(sx+8,sy-22,8,6);c.fillStyle='#0a0808';c.fillRect(sx+28,sy-20,9,24);}}
// a fire in a drum in the lane outside the gate (its flames are live)
const DRUM={x:968,d:96};
function drumFire(c,P){const p=Q(DRUM.x,0,DRUM.d);barrel(c,P,p.x,p.y,11,28,'#3a2a22',true);c.fillStyle='#120a06';c.beginPath();c.ellipse(p.x,p.y-28,9.4,2.8,0,0,TAU);c.fill();
  c.fillStyle=rgba('#ff8a3c',.5*P.fire);c.beginPath();c.ellipse(p.x,p.y-28,7,1.8,0,0,TAU);c.fill();
  for(let i=0;i<4;i++){c.fillStyle=rgba('#ffb25e',.4);c.fillRect(p.x-6+i*4,p.y-20,2,2);}}
// ---------- the ground ----------
// packed dirt, darker toward the walls and toward us; the path worn from the door to the pump to the gate; ruts in from the gate;
// puddles holding the light; straw and feathers off the roof; stones
function ground(c,P){const Yd=Y(),far=Yd.far,X0=-200,X1=1200,r=rng(101),night=P.key==='night';
  const pts=[Q(X0,0,far+40),Q(X1,0,far+40),Q(X1,0,-140),Q(X0,0,-140)];
  c.fillStyle=lin(c,0,pts[0].y,0,GB+60,[[0,P.dirt[0]],[.55,mix(P.dirt[0],P.dirt[1],.5)],[1,P.dirt[1]]]);K.poly(c,pts);c.fill();
  c.save();K.poly(c,pts);c.clip();c.transform(1,0,PSX,-PSY,0,GB);
  const tx=typeof EnvTex!=='undefined'?EnvTex.plaster(57,128,128,{base:'#808080'}):null;
  if(tx){const pt=c.createPattern(tx,'repeat');if(pt.setTransform)pt.setTransform(new DOMMatrix().scale(.7,.35));c.globalCompositeOperation='multiply';c.globalAlpha=.55;c.fillStyle=pt;c.fillRect(X0,-140,X1-X0,far+180);c.globalCompositeOperation='source-over';c.globalAlpha=1;}
  for(let i=0;i<900;i++){const x=X0+r()*(X1-X0),d=-60+r()*(far+90),v=r();c.fillStyle=v<.5?rgba('#000000',.1+.14*r()):rgba(P.light,.03+.07*r()*(.4+P.lightA));c.fillRect(x,d,.8+r()*2.4,.6+r()*1.4);}
  // the path, packed harder, and the ruts in from the gate
  c.strokeStyle=rgba(jm2(P.dirt[0],'#d8ccb8',.2),night?.05:.13);c.lineCap='round';c.lineJoin='round';c.lineWidth=20;c.beginPath();c.moveTo(Yd.door.x,Yd.step.d-14);c.quadraticCurveTo(330,150,Yd.pump.x-24,Yd.pump.d-4);c.quadraticCurveTo(700,100,FENCE.x,Yd.gate.d);c.stroke();
  c.lineWidth=8;c.strokeStyle=rgba(jm2(P.dirt[0],'#d8ccb8',.2),night?.03:.08);c.beginPath();c.moveTo(Yd.sidestair.x1+6,Yd.sidestair.d-6);c.quadraticCurveTo(180,140,Yd.pump.x-30,Yd.pump.d-4);c.stroke();
  c.strokeStyle=rgba('#000000',.2);c.lineWidth=2;for(const off of [-12,12]){c.beginPath();c.moveTo(FENCE.x+30,Yd.gate.d+off);c.quadraticCurveTo(700,Yd.gate.d+off*1.4-20,560,60+off);c.stroke();}
  // damp patches, darker
  for(const [px,pd,pr] of [[560,104,40],[180,170,46],[700,40,50],[380,30,40]]){c.fillStyle=rgba('#000000',.1);K.blob(c,px,pd,pr,pr*.7,rng(px));c.fill();}
  // the edge under the walls dark
  c.fillStyle=lin(c,0,far-50,0,far+10,[[0,rgba('#000000',0)],[1,rgba('#000000',.4)]]);c.fillRect(X0,far-50,X1-X0,60);
  // puddles, the biggest away from the middle of the yard
  for(const [px,pd,pr,sd] of [[612,40,26,3],[548,96,18,5],[420,58,14,7],[150,112,16,9],[300,20,30,11],[82,62,22,13],[772,150,12,15],[740,72,10,17]])K.puddle(c,P,px,pd,pr,sd,1);
  // straw blown off the roof, feathers, stones
  c.strokeStyle=rgba('#c8a050',.4);c.lineWidth=.7;c.beginPath();for(let i=0;i<140;i++){const x=-80+r()*700,d=150+r()*90,a=r()*TAU;c.moveTo(x,d);c.lineTo(x+Math.cos(a)*4,d+Math.sin(a)*4);}c.stroke();
  for(let i=0;i<40;i++){const x=X0+200+r()*1000,d=r()*far;c.fillStyle=r()<.5?rgba('#c8c8d0',.4):rgba('#8a8a94',.4);c.fillRect(x,d,2.2,.8);}
  for(let i=0;i<70;i++){const x=X0+r()*(X1-X0),d=-40+r()*(far+40);c.fillStyle=K.shade(P,['#4e4840','#423c34','#5a544a'][(r()*3)|0]);c.beginPath();c.ellipse(x,d,1.4+r()*2.4,1+r()*1.6,0,0,TAU);c.fill();}
  c.restore();}
// ---------- the things in the yard that stay against the walls (painted into the layer) ----------
function along(c,P){const Yd=Y(),far=Yd.far,sh=(col,k)=>K.shade(P,col,k),r=rng(111);
  // the step at the door: a slab of stone on a timber sill
  {const S0=Yd.step,D=Yd.door,x0=Math.max(D.x-D.w/2-8,SG().x+SG().w/2+4),x1=D.x+D.w/2+12,d0=S0.d-10,d1=far,hh=S0.h;
    c.fillStyle=rgba('#000000',.35);K.poly(c,[Q(x0-3,0,d0-4),Q(x1+3,0,d0-4),Q(x1+3,0,d1),Q(x0-3,0,d1)]);c.fill();
    c.fillStyle=sh('#36322e',1.2);K.poly(c,[Q(x0,0,d0),Q(x1,0,d0),Q(x1,hh,d0),Q(x0,hh,d0)]);c.fill();
    c.fillStyle=sh('#2a2622',1.4);K.poly(c,[Q(x1,0,d0),Q(x1,0,d1),Q(x1,hh,d1),Q(x1,hh,d0)]);c.fill();
    c.fillStyle=K.topLit(P,'#4a4640',.9);K.poly(c,[Q(x0,hh,d0),Q(x1,hh,d0),Q(x1,hh,d1),Q(x0,hh,d1)]);c.fill();
    c.fillStyle=rgba(P.light,.04+.1*P.lightA);K.poly(c,[Q(x0+16,hh,d0+2),Q(x1-16,hh,d0+2),Q(x1-20,hh,d0+20),Q(x0+20,hh,d0+20)]);c.fill();
    c.strokeStyle=rgba('#000000',.4);c.lineWidth=.7;const m=Q((x0+x1)/2+6,hh,d0),m2=Q((x0+x1)/2-4,hh,d1-6);c.beginPath();c.moveTo(m.x,m.y);c.lineTo(m2.x,m2.y);c.stroke();
    c.fillStyle=rgba(P.light,.08+.3*P.lightA);K.poly(c,[Q(x0,hh,d0),Q(x1,hh,d0),Q(x1,hh-1.2,d0),Q(x0,hh-1.2,d0)]);c.fill();}
  // a chopping block with the axe in it and kindling, along the wall past the step
  {const p=Q(226,0,214);c.fillStyle=rgba('#000000',.35);c.beginPath();c.ellipse(p.x,p.y,13,4,0,0,TAU);c.fill();c.fillStyle=sh('#42321f');c.fillRect(p.x-10,p.y-18,20,18);c.fillStyle=K.topLit(P,'#6a5640',.9);c.beginPath();c.ellipse(p.x,p.y-18,10,3.4,0,0,TAU);c.fill();
    c.strokeStyle=rgba('#3a2a18',.6);c.lineWidth=.5;c.beginPath();c.ellipse(p.x,p.y-18,6,2,0,0,TAU);c.stroke();
    c.strokeStyle=sh('#54402c');c.lineWidth=2;c.beginPath();c.moveTo(p.x+2,p.y-19);c.lineTo(p.x+16,p.y-40);c.stroke();c.fillStyle=sh('#5a5a60');c.beginPath();c.moveTo(p.x-3,p.y-20);c.lineTo(p.x+6,p.y-24);c.lineTo(p.x+5,p.y-17);c.closePath();c.fill();
    for(let i=0;i<7;i++){const q=Q(212+r()*30,0,200+r()*12);c.save();c.translate(q.x,q.y);c.rotate((r()-.5)*1.4);c.fillStyle=sh('#5e4830');c.fillRect(-5,-1.2,10,2.4);c.restore();}}
  // a crate of empty bottles under the window, a broom against the wall, a washtub on a nail
  {const W0=Yd.window,bx=(W0.x0+W0.x1)/2-16;box(c,P,bx,far-24,32,20,18,'#3e3020');for(let i=0;i<6;i++){const p=Q(bx+4+i*4.6,18,far-12);c.fillStyle=sh(i%2?'#24402a':'#36301a');c.fillRect(p.x-1.4,p.y-8,2.8,8);c.fillRect(p.x-.6,p.y-11,1.2,3);c.fillStyle=rgba(P.light,.15+.3*P.lightA);c.fillRect(p.x-.8,p.y-7,.6,5);}
    const bp=Q(W0.x0-34,0,far-4),bq=Q(W0.x0-22,72,far-2);c.strokeStyle=sh('#54402c');c.lineWidth=1.6;c.beginPath();c.moveTo(bp.x,bp.y-8);c.lineTo(bq.x,bq.y);c.stroke();
    c.fillStyle=sh('#6a5632');c.beginPath();c.moveTo(bp.x-6,bp.y);c.lineTo(bp.x+5,bp.y);c.lineTo(bp.x+2,bp.y-12);c.lineTo(bp.x-2,bp.y-12);c.closePath();c.fill();
    const tp=Q(246,92,far);c.fillStyle=sh('#3e3c3a');c.beginPath();c.ellipse(tp.x,tp.y,12,9,0,0,TAU);c.fill();c.fillStyle=sh('#2a2826',1.2);c.beginPath();c.ellipse(tp.x+1,tp.y+1,8.6,6,0,0,TAU);c.fill();
    c.strokeStyle=rgba(P.light,.1+.35*P.lightA);c.lineWidth=.8;c.beginPath();c.ellipse(tp.x,tp.y,12,9,0,Math.PI*1.1,Math.PI*1.7);c.stroke();c.fillStyle=sh('#1a1612');c.fillRect(tp.x-1,tp.y-11,2,3);}
  // the rain barrel under the downpipe
  {const p=Q(456,0,far-12);barrel(c,P,p.x,p.y,13,38,'#42301f');c.fillStyle=rgba(jm2(P.air[0],P.light,.2),.35);c.beginPath();c.ellipse(p.x,p.y-38,11,3,0,0,TAU);c.fill();}
  // tyres stacked against the yard wall, a drum, a cartwheel, scrap
  {const Wl=Yd.wall;for(let i=0;i<4;i++){const p=Q(626,i*9,Wl.d-10);c.fillStyle=sh('#141214');c.beginPath();c.ellipse(p.x,p.y-4.5,15,5,0,0,TAU);c.fill();c.strokeStyle=rgba('#4a4a52',.35);c.lineWidth=.7;c.beginPath();c.ellipse(p.x,p.y-4.5,10,3,0,Math.PI,TAU);c.stroke();
      c.fillStyle=sh('#0a0a0c');c.beginPath();c.ellipse(p.x,p.y-6,7,2,0,0,TAU);c.fill();}
    const dp=Q(782,0,Wl.d-12);barrel(c,P,dp.x,dp.y,11,30,'#4e2216',true);
    const wp=Q(744,26,Wl.d-6);c.strokeStyle=sh('#42341f');c.lineWidth=2.6;c.beginPath();c.arc(wp.x,wp.y,22,0,TAU);c.stroke();c.lineWidth=1.2;c.beginPath();for(let k=0;k<10;k++){const a=k/10*TAU;c.moveTo(wp.x,wp.y);c.lineTo(wp.x+Math.cos(a)*21,wp.y+Math.sin(a)*21);}c.stroke();c.fillStyle=sh('#261c14');c.beginPath();c.arc(wp.x,wp.y,4,0,TAU);c.fill();
    for(let i=0;i<5;i++){const q=Q(800+r()*40,0,Wl.d-14-r()*16);c.fillStyle=sh(K.TINC[(r()*K.TINC.length)|0]);c.save();c.translate(q.x,q.y);c.rotate((r()-.5)*.6);c.fillRect(-12,-4,24,4);c.restore();}}
  // junk heaped at the front corners, past where anyone walks
  heap(c,P,-170,40,-2,46,7);heap(c,P,880,1060,-6,40,9);}
function heap(c,P,x0,x1,d0,d1,seed){const r=rng(seed),sh=(col,k)=>K.shade(P,col,k);
  const pts=[];for(let x=x0;x<=x1;x+=12)pts.push(Q(x,8+r()*16,lerp(d1,d0,.5+(r()-.5)*.4)));const a=Q(x0,0,d0),e=Q(x1,0,d0);
  c.fillStyle=sh('#161210',1.3);c.beginPath();c.moveTo(a.x,a.y+30);pts.forEach(p=>c.lineTo(p.x,p.y));c.lineTo(e.x,e.y+30);c.closePath();c.fill();
  for(let i=0;i<10;i++){const p=Q(lerp(x0,x1,r()),4+r()*14,lerp(d0,d1,r()));const k=r();
    if(k<.3){c.fillStyle=sh('#121012');c.beginPath();c.ellipse(p.x,p.y,13,5,(r()-.5)*.4,0,TAU);c.fill();c.fillStyle=sh('#050506');c.beginPath();c.ellipse(p.x,p.y-1,6,2,0,0,TAU);c.fill();}
    else if(k<.6){c.save();c.translate(p.x,p.y);c.rotate((r()-.5)*.8);c.fillStyle=sh(K.TINC[(r()*K.TINC.length)|0],1.2);c.fillRect(-16,-5,32,7);c.fillStyle=rgba('#7a3a18',.35);c.fillRect(-8,-5,10,7);c.restore();}
    else{c.save();c.translate(p.x,p.y);c.rotate((r()-.5)*.8);c.fillStyle=sh(['#42321f','#33251a'][(r()*2)|0],1.2);c.fillRect(-14,-2,28,4);c.restore();}}}
// a barrel standing at (x, y) on the screen: r across the middle, h high; staves, hoops, the light down one side; a drum of steel if steel
function barrel(c,P,x,y,r,h,base,steel){const sh=(col,k)=>K.shade(P,col,k);c.fillStyle=rgba('#000000',.35);c.beginPath();c.ellipse(x+2,y,r+4,r*.32,0,0,TAU);c.fill();
  c.fillStyle=lin(c,x-r,0,x+r,0,[[0,sh(base,1.4)],[.35,K.topLit(P,base,.7)],[.7,sh(base,1.1)],[1,sh(base,1.5)]]);c.beginPath();c.moveTo(x-r*.86,y);c.quadraticCurveTo(x-r*1.06,y-h/2,x-r*.86,y-h);c.lineTo(x+r*.86,y-h);c.quadraticCurveTo(x+r*1.06,y-h/2,x+r*.86,y);c.closePath();c.fill();
  if(!steel){c.strokeStyle=rgba('#000000',.35);c.lineWidth=.6;c.beginPath();for(let k=-2;k<=2;k++){const xx=x+k*r*.36;c.moveTo(xx,y-1);c.quadraticCurveTo(xx+k*r*.06,y-h/2,xx,y-h+1);}c.stroke();}
  c.strokeStyle=sh(steel?'#2a1a14':'#24201c');c.lineWidth=steel?1.6:2.2;for(const f of steel?[.33,.66]:[.14,.4,.6,.86]){const yy=y-h*f;c.beginPath();c.moveTo(x-r*(f>.2&&f<.8?1.02:.9),yy);c.lineTo(x+r*(f>.2&&f<.8?1.02:.9),yy);c.stroke();}
  c.fillStyle=K.topLit(P,steel?'#42261c':'#4e3c28',1.1);c.beginPath();c.ellipse(x,y-h,r*.86,r*.26,0,0,TAU);c.fill();c.strokeStyle=rgba('#000000',.4);c.lineWidth=.8;c.stroke();
  if(steel){for(let i=0;i<5;i++){c.fillStyle=rgba('#7a3a14',.28);c.fillRect(x-r*.6+i*r*.3,y-h*.8,2,h*.5);}}}
// a box standing on the floor at (x, d), w across, dd deep, h high: its front, its right side, its top
function box(c,P,x,d,w,dd,h,base){const sh=(col,k)=>K.shade(P,col,k),A=Q(x,0,d),B=Q(x+w,0,d),Bt=Q(x+w,h,d),At=Q(x,h,d),Ct=Q(x+w,h,d+dd),Dt=Q(x,h,d+dd),Cb=Q(x+w,0,d+dd);
  c.fillStyle=rgba('#000000',.3);K.poly(c,[Q(x-2,0,d-2),Q(x+w+4,0,d-2),Q(x+w+4,0,d+dd+2),Q(x-2,0,d+dd+2)]);c.fill();
  c.fillStyle=sh(base,1.5);K.poly(c,[B,Cb,Ct,Bt]);c.fill();c.fillStyle=K.topLit(P,base,.55);K.poly(c,[At,Bt,Ct,Dt]);c.fill();c.fillStyle=sh(base,1.1);K.poly(c,[A,B,Bt,At]);c.fill();
  c.strokeStyle=rgba('#000000',.35);c.lineWidth=.7;for(const k of [.33,.66]){c.beginPath();c.moveTo(A.x,lerp(A.y,At.y,k));c.lineTo(B.x,lerp(B.y,Bt.y,k));c.stroke();}
  c.strokeStyle=K.shade(P,'#22180f');c.lineWidth=1.6;c.beginPath();c.moveTo(A.x+1,A.y-1);c.lineTo(Bt.x-1,Bt.y+1);c.stroke();
  c.strokeStyle=rgba('#000000',.4);c.lineWidth=.8;K.poly(c,[A,B,Bt,At]);c.stroke();}
// ---------- the light over it all ----------
function lightPass(c,P){const Yd=Y(),T=P.key,far=Yd.far;
  c.save();c.globalCompositeOperation='lighter';
  if(T==='night'){// the back door's light out over the step and the yard; the window's patch; the lantern's pool, the gate's lamp
    const D=Yd.door,dp=Q(D.x,0,far-30);K.cRad(c,dp.x,dp.y,6,170,'#ffa850',.34,.42);
    const dg=Q(D.x,70,far);K.cRad(c,dg.x,dg.y,4,110,'#ffb25e',.14,1);
    const W0=Yd.window,wp=Q((W0.x0+W0.x1)/2-20,0,far-60);K.cRad(c,wp.x,wp.y,4,90,'#ffb25e',.14,.4);
    const lp=Q(LANT.x,0,LANT.d-30);K.cRad(c,lp.x,lp.y,4,80,'#ffcf86',.1,.45);
    const gp=Q(FENCE.x-20,0,Yd.gate.d);K.cRad(c,gp.x,gp.y,4,70,'#ffcf86',.1,.45);
    const gf=Q(FENCE.x,46,Yd.gate.d-10);K.cRad(c,gf.x,gf.y,4,50,'#ffb25e',.12,1.4);
    const df=Q(DRUM.x,0,DRUM.d);K.cRad(c,df.x,df.y,6,120,'#ff9a4a',.22,.45);K.cRad(c,df.x-30,df.y-40,6,90,'#ff9a4a',.08,1);}
  else{// the daylight falling down the Pit into the yard: the middle of it lighter
    const m=Q(520,0,110);K.cRad(c,m.x,m.y,20,520,P.light,T==='morning'?.12:.1,.36);}
  c.restore();
  c.fillStyle=lin(c,0,Q(0,0,far).y-6,0,Q(0,0,far-50).y,[[0,rgba('#000000',.32)],[1,rgba('#000000',0)]]);c.fillRect(-200,Q(0,0,far).y-6,1400,Q(0,0,far-50).y-Q(0,0,far).y+6);
  c.fillStyle=lin(c,0,GB-40,0,GB+130,[[0,rgba('#000000',0)],[1,rgba('#000000',T==='night'?.75:.6)]]);c.fillRect(-200,GB-40,1400,170);
  if(T==='morning'){// mist lying on the floor of the Pit: over the far shacks' feet, along the yard's walls, low over the yard
    c.fillStyle=lin(c,0,110,0,GB,[[0,rgba('#ccd6de',0)],[.32,rgba('#ccd6de',.3)],[.5,rgba('#ccd6de',.2)],[.75,rgba('#ccd6de',.1)],[1,rgba('#ccd6de',.05)]]);c.fillRect(-200,110,1400,GB-110);}}
// ---------- the scene ----------
function paint(c){const P=K.pal(),X0=-170,X1=W+250,T0=-110;
  backdrop(c,P,X0,X1,T0);neighbours(c,P);beyond(c,P);
  ground(c,P);
  sump(c,P);shed(c,P);sideStair(c,P);stairFence(c,P);ladder(c,P);yardWall(c,P);along(c,P);drumFire(c,P);fence(c,P);
  // the contact shadows of the pieces that stand among the people
  {const Yd=Y();c.fillStyle=rgba('#000000',.3);for(const B0 of Yd.barrels){const p=Q(B0.x,0,B0.d);c.beginPath();c.ellipse(p.x+2,p.y,B0.r+5,B0.r*.36,0,0,TAU);c.fill();}
    const pm=Q(Yd.pump.x,0,Yd.pump.d);c.beginPath();c.ellipse(pm.x+3,pm.y,Yd.pump.r+8,Yd.pump.r*.42,0,0,TAU);c.fill();
    const t0=Q(Yd.trough.x0-2,0,Yd.trough.d-12),t1=Q(Yd.trough.x1+4,0,Yd.trough.d+12);c.fillRect(t0.x,t1.y,t1.x-t0.x,t0.y-t1.y);}
  lightPass(c,P);}
// ---------- the pieces that stand among the people: the pump, the trough, the barrels, the crates ----------
function pumpPiece(){const Yd=Y(),P=K.pal(),Pm=Yd.pump,c0=Q(Pm.x,0,Pm.d),R=Pm.r;
  return K.piece('yardpump|'+P.key,c0.x-48,c0.y-82,92,102,c=>{const sh=(col,k)=>K.shade(P,col,k);
    // the stone base: a square block, its top worn and wet
    const bh=14,A=Q(Pm.x-R,0,Pm.d-R*.8),B=Q(Pm.x+R,0,Pm.d-R*.8),Bt=Q(Pm.x+R,bh,Pm.d-R*.8),At=Q(Pm.x-R,bh,Pm.d-R*.8),Ct=Q(Pm.x+R,bh,Pm.d+R*.8),Dt=Q(Pm.x-R,bh,Pm.d+R*.8),Cb=Q(Pm.x+R,0,Pm.d+R*.8);
    c.fillStyle=sh('#36322e',1.4);K.poly(c,[B,Cb,Ct,Bt]);c.fill();c.fillStyle=sh('#4a4640',1.1);K.poly(c,[A,B,Bt,At]);c.fill();c.fillStyle=K.topLit(P,'#56524c',1);K.poly(c,[At,Bt,Ct,Dt]);c.fill();
    c.strokeStyle=rgba('#000000',.35);c.lineWidth=.7;c.beginPath();c.moveTo(lerp(A.x,B.x,.45),A.y);c.lineTo(lerp(At.x,Bt.x,.5),At.y);c.moveTo(A.x,lerp(A.y,At.y,.5));c.lineTo(lerp(A.x,B.x,.45),lerp(A.y,At.y,.5));c.stroke();
    c.fillStyle=rgba(jm2(P.air[0],P.light,.2),.3);c.beginPath();const wp=Q(Pm.x+6,bh,Pm.d-4);c.ellipse(wp.x,wp.y,9,2.6,0,0,TAU);c.fill();
    // the iron column, its cap, the spout to the right over the trough, the handle up and back
    const p=Q(Pm.x,bh,Pm.d),ch=48;c.fillStyle=lin(c,p.x-6,0,p.x+6,0,[[0,sh('#1a1c20',1.3)],[.35,K.topLit(P,'#34383e',1)],[.65,sh('#22252a')],[1,sh('#121316',1.4)]]);
    c.beginPath();c.moveTo(p.x-6.5,p.y);c.lineTo(p.x-5,p.y-ch);c.lineTo(p.x+5,p.y-ch);c.lineTo(p.x+6.5,p.y);c.closePath();c.fill();
    c.fillStyle=sh('#202226');c.fillRect(p.x-8,p.y-3,16,3);c.fillRect(p.x-7,p.y-ch-4,14,5);c.fillStyle=K.topLit(P,'#383c42',1.2);c.beginPath();c.ellipse(p.x,p.y-ch-4,7,2.2,0,0,TAU);c.fill();
    c.fillStyle=sh('#202226');c.beginPath();c.arc(p.x,p.y-ch-7,3,Math.PI,0);c.fill();
    c.fillStyle=sh('#1c1e22');c.beginPath();c.moveTo(p.x+4,p.y-ch+12);c.lineTo(p.x+20,p.y-ch+14);c.lineTo(p.x+21,p.y-ch+20);c.lineTo(p.x+17,p.y-ch+19);c.lineTo(p.x+16,p.y-ch+17);c.lineTo(p.x+4,p.y-ch+18);c.closePath();c.fill();
    c.fillStyle=rgba(P.light,.12+.35*P.lightA);c.fillRect(p.x+5,p.y-ch+12.4,14,.9);
    c.strokeStyle=sh('#1a1c20');c.lineWidth=3.2;c.lineCap='round';c.beginPath();c.moveTo(p.x-2,p.y-ch-2);c.quadraticCurveTo(p.x-14,p.y-ch-10,p.x-30,p.y-ch-4);c.stroke();
    c.strokeStyle=sh('#4e3a28');c.lineWidth=4;c.beginPath();c.moveTo(p.x-26,p.y-ch-5);c.lineTo(p.x-36,p.y-ch-1);c.stroke();c.lineCap='butt';
    c.fillStyle=sh('#2e3034');c.beginPath();c.arc(p.x-2,p.y-ch-2,2.4,0,TAU);c.fill();
    c.strokeStyle=rgba(P.light,.1+.4*P.lightA);c.lineWidth=.8;c.beginPath();c.moveTo(p.x-4.6,p.y-2);c.lineTo(p.x-3.6,p.y-ch+2);c.stroke();
    c.fillStyle=rgba('#7a3a14',.32);c.fillRect(p.x+1,p.y-ch+20,2,24);c.fillRect(p.x-3,p.y-ch+4,1.4,12);
    // Tarr's tag on the column, a rag of the Pump King's blue through it: the Sump's water is his, paid on the first
    c.fillStyle=sh('#6a665e',.9);c.fillRect(p.x-10,p.y-ch+24,6,8);c.fillStyle=rgba('#000000',.35);c.fillRect(p.x-9,p.y-ch+26,4,.7);c.fillRect(p.x-9,p.y-ch+28.4,3,.7);
    c.fillStyle=K.shade(P,'#2f5c7c',.8);c.beginPath();c.moveTo(p.x-7,p.y-ch+22);c.lineTo(p.x-3,p.y-ch+21);c.lineTo(p.x-5,p.y-ch+33);c.lineTo(p.x-7.5,p.y-ch+31);c.closePath();c.fill();});}
function troughPiece(){const Yd=Y(),P=K.pal(),T0=Yd.trough,d0=T0.d-9,d1=T0.d+9,h=18,a=Q(T0.x0,h+4,d1),b=Q(T0.x1,0,d0);
  return K.piece('yardtrough|'+P.key,a.x-4,a.y-6,b.x-a.x+30,b.y-a.y+12,c=>{const sh=(col,k)=>K.shade(P,col,k),x0=T0.x0,x1=T0.x1;
    c.fillStyle=sh('#403c37',1.1);K.poly(c,[Q(x0,0,d0),Q(x1,0,d0),Q(x1,h,d0),Q(x0,h,d0)]);c.fill();
    c.fillStyle=sh('#302c28',1.4);K.poly(c,[Q(x1,0,d0),Q(x1,0,d1),Q(x1,h,d1),Q(x1,h,d0)]);c.fill();
    c.fillStyle=K.topLit(P,'#4e4a44',1);K.poly(c,[Q(x0,h,d0),Q(x1,h,d0),Q(x1,h,d1),Q(x0,h,d1)]);c.fill();
    const sky=P.key==='night'?'#3a3440':jm2(P.air[0],P.light,.3);c.fillStyle=rgba('#0c100e',.92);K.poly(c,[Q(x0+3,h,d0+3),Q(x1-3,h,d0+3),Q(x1-3,h,d1-3),Q(x0+3,h,d1-3)]);c.fill();
    c.fillStyle=rgba(sky,.4);K.poly(c,[Q(x0+5,h,d1-8),Q(x1-8,h,d1-8),Q(x1-10,h,d1-4),Q(x0+8,h,d1-4)]);c.fill();
    c.fillStyle=rgba('#3e5a32',.35);K.poly(c,[Q(x0,h-2,d0),Q(x1,h-2,d0),Q(x1,h-8,d0),Q(x0,h-6,d0)]);c.fill();
    c.strokeStyle=rgba('#000000',.4);c.lineWidth=.7;c.beginPath();const m=Q(x0+22,0,d0),m2=Q(x0+24,h,d0);c.moveTo(m.x,m.y);c.lineTo(m2.x,m2.y);c.stroke();
    c.fillStyle=rgba(P.light,.1+.35*P.lightA);K.poly(c,[Q(x0,h,d0),Q(x1,h,d0),Q(x1,h-1,d0),Q(x0,h-1,d0)]);c.fill();});}
function barrelPiece(B0,i){const P=K.pal(),p=Q(B0.x,0,B0.d),h=B0.r*2.5;
  return K.piece('yardbarrel'+i+'|'+P.key,p.x-B0.r-8,p.y-h-B0.r,B0.r*2+16,h+B0.r*1.6,c=>{barrel(c,P,p.x,p.y,B0.r,h,i?'#4e3822':'#45331f');
    if(i===0){c.fillStyle=K.shade(P,'#33251a');c.beginPath();c.ellipse(p.x,p.y-h-1,B0.r*.8,B0.r*.22,0,0,TAU);c.fill();c.strokeStyle=rgba('#000000',.4);c.lineWidth=.6;c.beginPath();c.moveTo(p.x-B0.r*.7,p.y-h-1);c.lineTo(p.x+B0.r*.7,p.y-h-1);c.stroke();}});}
function cratePiece(Cr,i){const P=K.pal(),x=Cr.x-Cr.w/2,d=Cr.d-Cr.w/2,a=Q(x,Cr.h,d+Cr.w),b=Q(x+Cr.w,0,d);
  return K.piece('yardcrate'+i+'|'+P.key,Q(x,Cr.h,d).x-3,a.y-2,b.x-Q(x,0,d).x+Cr.w*.2+8,b.y-a.y+5,c=>{box(c,P,x,d,Cr.w,Cr.w,Cr.h,i?'#3a2c1c':'#42321f');});}
// a gate's leaf of planks, hinged at (hx, hd), len long and h high, turned th from shut: its shut way along (ux, ud), opening toward
// (vx, vd). Rails, a brace, pointed tops (pts), the latch at the free end, its edge lit; darker as it turns edge-on to the eye
function gateLeaf(c,P,hx,hd,len,h,th,ux,ud,vx,vd,pts,base){const sh=(col,k)=>K.shade(P,col,k),cs=Math.cos(th),sn=Math.sin(th),dx=ux*cs+vx*sn,dd=ud*cs+vd*sn,at=(u,hh)=>Q(hx+dx*len*u,hh,hd+dd*len*u);
  const side=clamp(Math.abs(dd)*1.2,0,1),col=jm2(sh(base,1.1),'#000000',.25*side);
  c.fillStyle=col;K.poly(c,[at(0,0),at(1,0),at(1,h),at(0,h)]);c.fill();
  if(pts){c.beginPath();const n=Math.max(1,Math.round(len/6));for(let k=0;k<n;k++){const a=at(k/n,h),m=at((k+.5)/n,h+5),e=at((k+1)/n,h);c.moveTo(a.x,a.y);c.lineTo(m.x,m.y);c.lineTo(e.x,e.y);}c.fill();}
  c.strokeStyle=rgba('#000000',.45);c.lineWidth=.7;c.beginPath();const n=Math.max(2,Math.round(len/6));for(let k=1;k<n;k++){const a=at(k/n,0),e=at(k/n,h);c.moveTo(a.x,a.y);c.lineTo(e.x,e.y);}c.stroke();
  c.strokeStyle=jm2(sh('#2a1e14',1.1),'#000000',.2*side);c.lineWidth=2.6;c.beginPath();for(const hh of [10,h-12]){const a=at(.04,hh),e=at(.96,hh);c.moveTo(a.x,a.y);c.lineTo(e.x,e.y);}const z0=at(.94,10),z1=at(.06,h-12);c.moveTo(z0.x,z0.y);c.lineTo(z1.x,z1.y);c.stroke();
  {const a=at(.82,h*.55),e=at(1.06,h*.55);c.strokeStyle=sh('#605850');c.lineWidth=1.6;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(e.x,e.y);c.stroke();c.fillStyle=rgba(P.light,.12+.35*P.lightA);c.fillRect(Math.min(a.x,e.x),a.y-1.2,Math.abs(e.x-a.x),.7);}
  c.strokeStyle=rgba(P.light,.1+.35*P.lightA);c.lineWidth=.8;c.beginPath();const t0=at(0,h),t1=at(1,h);c.moveTo(t0.x,t0.y-.6);c.lineTo(t1.x,t1.y-.6);c.stroke();
  c.strokeStyle=rgba('#000000',.4);c.lineWidth=.8;K.poly(c,[at(0,0),at(1,0),at(1,h),at(0,h)]);c.stroke();}
// the yard's gate on the right: hinged on its front post, swinging in toward the yard (S.act1.gate)
function mainGate(c){const Yd=Y(),G=Yd.gate,P=K.pal(),g0=G.d-G.w/2,g1=G.d+G.w/2;gateLeaf(c,P,FENCE.x,g0+1,g1-g0-2,FENCE.h-4,opened('gate')*1.62,0,1,-1,0,true,'#3e3020');}
// the stair gate: hinged on its left post, swinging out into the yard toward the eye (S.act1.stairGate)
function stairGate(c){const G=SG(),P=K.pal();gateLeaf(c,P,G.x-G.w/2+3,G.d,G.w-6,SGH-6,opened('stairGate')*1.7,1,0,0,-1,false,'#433424');}
function pieces(){const Yd=Y(),out=[],G=SG(),g=Yd.gate;
  out.push({d:G.d-(G.w/2)*Math.sin(opened('stairGate')*1.7)+.5,draw:stairGate});
  out.push({d:g.d-g.w/2+(g.w/2)*Math.cos(opened('gate')*1.62),draw:mainGate});
  out.push({d:Yd.pump.d,draw:c=>K.drawPiece(c,pumpPiece())});
  out.push({d:Yd.trough.d,draw:c=>K.drawPiece(c,troughPiece())});
  Yd.barrels.forEach((B0,i)=>out.push({d:B0.d,draw:c=>K.drawPiece(c,barrelPiece(B0,i))}));
  // a crate goes down a little before a man at its own depth: Dob perches on the nearer one (its top is ground for him)
  Yd.crates.forEach((Cr,i)=>out.push({d:Cr.d+1,draw:c=>K.drawPiece(c,cratePiece(Cr,i))}));
  return out;}
// ---------- what moves ----------
// smoke from the stovepipe and the chimneys round about, the fires on the far wall, the lamps and the window, the pump's drip, a bird
// on the ridge, the morning's mist; on an upright phone, the walls going on up to the sky
const MIST=(()=>{const r=rng(5),a=[];for(let i=0;i<10;i++)a.push({d:10+r()*220,w:180+r()*260,sp:4+r()*7,ph:r()*1400,a:.08+r()*.08});return a;})();
function live(){const t=S.t,P=K.pal(),T=P.key,Yd=Y();ctx.save();
  K.upper('yard:'+T,-1000,(c,x0,x1,y0,y1)=>{c.fillStyle=P.air[0];c.fillRect(x0,y0,x1-x0,y1-y0);
    K.shackRows(c,Object.assign({pal:P,x0:-170,x1:W+250,yTop:-650,clip:[-650,y1]},ROWS));
    c.fillStyle=lin(c,0,-640,0,-480,[[0,rgba(P.sky[1],.8)],[1,rgba(P.air[0],0)]]);c.fillRect(x0,-640,x1-x0,160);
    K.skyTop(c,x0,x1,y0,-636,P,{tower:150});});
  K.tram(ctx,t,P,-760);
  // the far wall's chimneys smoking, its fires, a few of its windows going dark a moment (a lamp moved, someone passing): only where
  // the far wall shows
  ctx.save();ctx.clip(skyPath());
  {const fs=[];for(const ch of OUT.chims.slice(0,12))fs.push({x:ch.x,y:ch.y,s:2.6*(ch.s||1),sp:.08,n:5,h:60+50*(ch.s||1),dx:12,a:.42*(1-ch.hz*.6),ph:ch.x*.013});K.smoke(ctx,fs,t,P.smoke,T==='night'?.6:1);}
  ctx.globalCompositeOperation='lighter';
  for(const f of OUT.fires){const a=(.6+.4*Math.sin(t*9+f.x)*Math.sin(t*3.3+f.y))*P.fire*(1-f.hz*.6);K.glowAt(ctx,f.x,f.y-4*f.s,14*f.s,'#ff8a3c',.55*a);K.glowAt(ctx,f.x,f.y-3*f.s,4*f.s,'#ffd28a',.8*a);}
  {const L2=OUT.lit;ctx.globalCompositeOperation='source-over';ctx.fillStyle='#000000';for(let i=0;i<L2.length;i+=7){const w=L2[i],k=Math.sin(t*1.7+i*3.1)*Math.sin(t*.9+i);if(k>.6){ctx.globalAlpha=(k-.6)*.6*P.winA;ctx.fillRect(w[0],w[1],w[2],w[3]);}}}
  ctx.restore();
  // the Sump's stovepipe and the chimneys round the yard
  {const srcs=[{x:STOVE.x,y:STOVE.y,s:5,sp:.1,n:8,h:180,dx:24,a:.55}];for(const ch of NEARCH)srcs.push({x:ch.x,y:ch.y,s:4,sp:.09,n:6,h:120,dx:16,a:.45,ph:ch.x*.013});K.smoke(ctx,srcs,t,P.smoke,T==='night'?.6:1);}
  ctx.globalCompositeOperation='lighter';
  {const lit=T==='night'?1:T==='dusk'?.8:0,f=.9+.1*Math.sin(t*7.3)*Math.sin(t*2.9);
    if(lit>0){const p=Q(LANT.x,LANT.h-4,LANT.d);K.glowAt(ctx,p.x,p.y,10,'#fff0c8',.8*lit*f);K.glowAt(ctx,p.x,p.y,40,'#ffb25e',.35*lit*f);
      const g=Q(FENCE.x+GLAMP.dx,GLAMP.h-3,Yd.gate.d-Yd.gate.w/2+GLAMP.dd);K.glowAt(ctx,g.x,g.y,8,'#fff0c8',.7*lit*f);K.glowAt(ctx,g.x,g.y,32,'#ffb25e',.3*lit*f);}
    const W0=Yd.window,wp=Q((W0.x0+W0.x1)/2,(W0.y0+W0.y1)/2,Yd.far);K.glowAt(ctx,wp.x,wp.y,40,'#ffb25e',(T==='night'?.16:.06)*(.9+.1*Math.sin(t*2.3)));
    if(T==='night'){const D=Yd.door,dp=Q(D.x,SUMP.doorH*.5,Yd.far);K.glowAt(ctx,dp.x,dp.y,46,'#ffb25e',.1*(.9+.1*Math.sin(t*5.1)*Math.sin(t*1.3)));}}
  {const p=Q(DRUM.x,28,DRUM.d),f=.75+.25*Math.sin(t*11)*Math.sin(t*3.7);K.glowAt(ctx,p.x,p.y-8,40,'#ff8a3c',.35*f*P.fire);
    ctx.fillStyle='#ffb25e';for(let q=0;q<5;q++){const fx=p.x-7+q*3.5,fh=6+7*Math.abs(Math.sin(t*9+q*1.7));ctx.globalAlpha=.75*P.fire;ctx.beginPath();ctx.moveTo(fx-2,p.y);ctx.lineTo(fx,p.y-fh);ctx.lineTo(fx+2,p.y);ctx.fill();}}
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  // the pump's drip: a drop off the spout into the trough, a ring where it lands
  {const Pm=Yd.pump,per=1.7,u=(t%per)/per,sp=Q(Pm.x,14+48-17,Pm.d),x=sp.x+18,y0=sp.y,y1=Q(Yd.trough.x0+6,18,Yd.trough.d).y;
    if(u<.3){ctx.fillStyle=rgba('#cfe0e8',.55);const k=u/.3;ctx.beginPath();ctx.ellipse(x,y0+1+k*1.5,1,1+k*.8,0,0,TAU);ctx.fill();}
    else if(u<.42){const k=(u-.3)/.12;ctx.fillStyle=rgba('#cfe0e8',.6);ctx.fillRect(x-.5,lerp(y0+3,y1,k*k),1,2.4);}
    else if(u<.9){const k=(u-.42)/.48;ctx.strokeStyle=rgba('#d8e8f0',.4*(1-k));ctx.lineWidth=.6;ctx.beginPath();ctx.ellipse(x,y1,1.5+k*7,(1.5+k*7)*.3,0,0,TAU);ctx.stroke();}}
  {const pk=Math.sin(t*1.1)>.92,p=Q(214,SUMP.ridge,Yd.far+SUMP.rd);if(pk){ctx.fillStyle=K.shade(P,'#4a4e5c',.8);ctx.beginPath();ctx.arc(p.x+2.6,p.y-3.2,1.5,0,TAU);ctx.fill();}}
  if(P.mist>0){const sp=K.puffSpr('#d0dae2');for(const m of MIST){const x=((m.ph+t*m.sp)%1500)-300,q=Q(x,0,m.d);ctx.globalAlpha=m.a*P.mist;ctx.drawImage(sp,q.x-m.w/2,q.y-m.w*.1,m.w,m.w*.2);}ctx.globalAlpha=1;}
  ctx.restore();}
// the light that rims a man in the yard: at night the back door's, else the daylight from far above (cold at sun-up, from the right)
function light(f){const Yd=Y(),T=K.tod();
  if(T==='night'){const D=Yd.door,p=Q(D.x,SUMP.doorH*.6,Yd.far);return{light:{x:p.x-f.dep*PSX,y:p.y+f.dep*PSY}};}
  if(T==='morning')return{light:{x:720-f.dep*PSX,y:-260+f.dep*PSY}};
  return{light:{x:480-f.dep*PSX,y:-320+f.dep*PSY}};}
const LAYOUT={sump:SUMP,shed:SHED,fence:FENCE,lantern:LANT};
E.S.yard={paint,live,light,key,pieces,LAYOUT};
})();
// ===== ENV YARD END =====
