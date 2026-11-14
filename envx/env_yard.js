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
// junk), win (the share of windows lit) and winA (how bright), lamp and fire (how much the lamps and fires burn), dirt, mist, smoke.
// By day a pale warm sun (the style guide's rule 4: about #ffd6a0, never gilt) on the tops of things and the high haze, the shadows
// and the low air cool slate; by morning a cooler sun from the other side through blue haze and mist (since V81: the day was a flat
// grey-brown, the morning a flat grey), its warmth up the wall where it reaches and the cold kept low in the shade (since V90: the
// morning's whole wall was cold blue-grey, saturation .15 to .18)
const PAL={
  day:{key:'day',sky:['#f7e6c6','#e8cc9c'],air:['#b49070','#685646','#2a2e38'],light:'#ffd6a0',lightA:.38,amb:'#18202c',ambK:.32,wall:'#2e2620',
    win:.14,winA:.5,lamp:.5,fire:.4,dirt:['#4a3c2e','#2c2622'],mist:0,smoke:'#8e8679'},
  night:{key:'night',sky:['#05060e','#141626'],air:['#1a1824','#121019','#0c0b0f'],light:'#7a84b4',lightA:.07,amb:'#05050a',ambK:.66,wall:'#0f0d11',
    win:.5,winA:.92,lamp:1,fire:1,dirt:['#1c1816','#141110'],mist:0,smoke:'#2e2a2c'},
  morning:{key:'morning',sky:['#f6dcc6','#bccad8'],air:['#d89e74','#44628e','#1e2e50'],light:'#ffe2bf',lightA:.4,amb:'#0e1a3e',ambK:.48,wall:'#2a2826',
    win:.1,winA:.6,lamp:.4,fire:.35,dirt:['#343a4e','#212534'],mist:1,smoke:'#a8aeb4'},
  dusk:{key:'dusk',sky:['#2e2448','#f0905a'],air:['#a0645a','#523a48','#201820'],light:'#ffb07a',lightA:.26,amb:'#120e18',ambK:.46,wall:'#181216',
    win:.36,winA:.88,lamp:.9,fire:.8,dirt:['#2e2622','#201a18'],mist:0,smoke:'#4a3c40'}};
function pal(){return PAL[tod()];}
// the sun: by day low over the quarry's rim at the left, by morning just up over it at the right, cooler; none at dusk or at night.
// x, y: where it stands over the rim (world units); ang: its shafts' slant from straight down (the shared soft piece's turn); mist:
// how much more its shafts show (the morning's mist holds them); cool: how much deeper its shadow side goes to slate
const SUN={day:{x:-420,y:-560,col:'#ffd6a0',ang:-.42},morning:{x:1340,y:-520,col:'#ffe2bf',ang:.4,mist:1.35,cool:1.4,wash:'#ffac6a',washA:.16}};
function sun(){return SUN[tod()]||null;}
// a soft mottle for a big surface, made once and laid on with 'overlay': its value wanders a little every few units, so that a wall
// deep in its haze, a floor under the mist or a sky over the rim is not one flat fill (the drawing guide's flat patches, since V82).
// k: how much; o.sc: its scale (a plane's floor takes it squashed)
let MOT=null;
function mottleTile(){if(MOT)return MOT;const T=typeof EnvTex!=='undefined'?EnvTex:null;if(!T)return null;const a=T.noise2(91,16),b=T.noise2(97,32);
  return MOT=T.pix(128,128,(u,v,out)=>{const w=.6*a(u*16,v*16)+.4*b(u*32,v*32),g=clamp(Math.round(128+(w-.5)*170),0,255);out[0]=out[1]=out[2]=g;});}
function mottle(c,x0,y0,x1,y1,k,o){const tl=mottleTile();if(!tl||!(k>0))return;const p=c.createPattern(tl,'repeat');o=o||{};
  if(p.setTransform&&(o.sc||o.sy))p.setTransform(new DOMMatrix().scale(o.sc||1,o.sy||o.sc||1));
  c.save();c.globalCompositeOperation='overlay';c.globalAlpha=k;c.fillStyle=p;c.fillRect(x0,y0,x1-x0,y1-y0);c.restore();}
// its light in a place's layer, x0..x1 across and from y0 (over the rim) down to y1 (the floor): the side toward it warmer and
// lighter, soft shafts slanting down the terraces (EnvLook.softCone), and the side away and the low air cooled toward slate.
// o: n (shafts), k (strength), seed
function sunlight(c,P,x0,x1,y0,y1,o){const S2=sun();if(!S2)return;o=o||{};const r=rng(o.seed||41),n=o.n||6,k=o.k??1,L=(y1-y0)*1.25,dx=-Math.tan(S2.ang)*L,left=S2.x<(x0+x1)/2;
  c.save();c.globalCompositeOperation='lighter';
  c.fillStyle=lin(c,left?x0:x1,0,left?x1:x0,0,[[0,rgba(S2.col,.15*k)],[.55,rgba(S2.col,.04*k)],[1,rgba(S2.col,0)]]);c.fillRect(x0,y0,x1-x0,y1-y0);
  for(let i=0;i<n;i++){const u=(i+.5+(r()-.5)*.7)/n,w=50+r()*70,xs=lerp(x0-Math.max(0,dx),x1-Math.min(0,dx),u);
    EnvLook.softCone(c,xs,y0,w*.5,w*2,L,S2.col,(.07+.07*r())*k*(S2.mist||1),S2.ang,1.15);}
  c.restore();
  // (the morning's low sun washes the wall warm round where it stands, never gilt: a peach under the sodium's hue, fading out before
  // the yard's floor, which keeps the shade's blue: mixed in one veil over it the two made grey; since V90)
  if(S2.wash){const R=Math.hypot(x1-x0,y1-y0)*.62;c.save();c.beginPath();c.rect(x0,y0,x1-x0,y1-y0);c.clip();c.translate(S2.x,S2.y);c.scale(1.7,1);
    c.fillStyle=rad(c,0,0,0,R,[[0,rgba(S2.wash,S2.washA*k)],[.45,rgba(S2.wash,S2.washA*k*.55)],[.82,rgba(S2.wash,0)]]);c.fillRect(-R,-R,R*2,R*2);c.restore();}
  const kc=k*(S2.cool||1);c.fillStyle=lin(c,left?x0:x1,0,left?x1:x0,0,[[0,rgba('#24303e',0)],[1,rgba('#24303e',.14*kc)]]);c.fillRect(x0,y0,x1-x0,y1-y0);
  c.fillStyle=lin(c,0,y0,0,y1,[[0,rgba('#202a36',0)],[.6,rgba('#202a36',.04*kc)],[1,rgba('#202a36',.14*kc)]]);c.fillRect(x0,y0,x1-x0,y1-y0);}
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
  c.strokeStyle=rgba('#000000',.25);c.lineWidth=1.48;c.beginPath();for(let x=mx+(Mx-mx)*(.3+r()*.1);x<Mx;x+=(Mx-mx)*(.35+r()*.2)){c.moveTo(x,my);c.lineTo(x+(r()-.5)*4,My+sag);}c.stroke();
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
    shrink=o.shrink??.55,sspan=o.sspan||700,seed=o.seed||7,night=P.winA>.6,sunny=P.key==='day'||P.key==='morning';
  const lit=[],signs=[],bulbs=[],boardsW=[],ways=[];out.fires=out.fires||[];out.chims=out.chims||[];
  const hzOf=y=>clamp((1-Math.exp(-Math.max(0,yb-y)/span))*.94,0,1),HC=y=>jm(P.air[1],P.air[0],hzOf(y)),col=(base,y,k)=>jm(shade(P,base,k),HC(y),hzOf(y)*.86);
  const ya=o.clip?o.clip[0]:-1e9,yz=o.clip?o.clip[1]:1e9;
  // (each row its own height, a quarter more or less, and its own lean and how close its shacks crowd, since V82: the rows went up
  // the wall alike, one value over half the screen; rv keeps those apart from the seeds of what is on each row)
  const rows=[];{const rv=rng(seed*13+5);let ry=yb,j=0;while(ry>yt-rs&&j<140){const s=lerp(1,shrink,clamp((yb-ry)/sspan,0,1));
    rows.push([ry,j,s,{lean:(rv()-.5)*2,ph:rv()*TAU,fq:.004+rv()*.006,gap:.6+rv()*1.1,val:.9+rv()*.32}]);ry-=rs*s*(.76+.48*rv());j++;}}
  for(let i=rows.length-1;i>=0;i--){const [ry,j,s,V]=rows[i],ur=u*s,rr=rs*s,r=rng(seed*7919+j*104729),bh=rr*.2;if(ry-rr*1.25>yz||ry+rr<ya)continue;
    // (by day each shack's front takes the sun or stands in its neighbour's shade, from dice of its own so the rows keep their shacks)
    const rl=rng(seed*331+j*977);
    // the rock behind the row, darker or paler row by row
    c.fillStyle=lin(c,0,ry-rr,0,ry,[[0,col(P.wall,ry-rr,V.val)],[1,col(P.wall,ry,V.val*1.06)]]);c.fillRect(x0,ry-rr-.5,x1-x0,rr+1);
    // the walkway in lengths, each a step higher or lower than the last
    // (the row leans and sags along its length: each length set a little higher or lower on the row's slow swell)
    const segs=[];for(let x=x0-80;x<x1+80;){const len=(110+r()*260)*ur,off=Math.round((r()-.5)*5)*2.8*ur+Math.round(V.lean*7*Math.sin((x+len/2)*V.fq+V.ph))*ur;segs.push([x,x+len,off]);x+=len;}
    const offAt=x=>{for(const sg of segs)if(x<sg[1])return sg[2];return 0;};
    for(const [a,b,off] of segs){const y=ry+off;
      c.fillStyle=col('#141110',y+bh/2,1.2);c.fillRect(a,y,b-a,bh+2.6*ur);
      for(let x=a+r()*6;x<b;){const k=r(),w=(5+r()*14)*ur,cy=y+bh*(.35+r()*.4),cc=col(JUNKC[(r()*JUNKC.length)|0],cy,1.1);
        if(k<.22){c.strokeStyle=col('#141214',cy,1.2);c.lineWidth=Math.max(1.5,2.67*ur);c.beginPath();c.arc(x+2.6*ur,cy,2.2*ur,0,TAU);c.stroke();x+=6*ur;}
        else if(k<.4){c.fillStyle=cc;c.beginPath();c.arc(x+3*ur,cy,2.8*ur,0,TAU);c.fill();c.fillStyle=rgba('#000000',.4);c.beginPath();c.arc(x+3*ur,cy,1.4*ur,0,TAU);c.fill();x+=6.5*ur;}
        else if(k<.62){c.fillStyle=cc;c.fillRect(x,cy-2.2*ur,w*1.6,4.4*ur);c.fillStyle=rgba('#000000',.45);c.fillRect(x+w*.4,cy-1.4*ur,w*.5,1.2*ur);x+=w*1.6;}
        else{c.fillStyle=cc;c.fillRect(x,cy-1.6*ur,w,3.2*ur);x+=w;}
        x+=r()*1.8*ur;}
      c.fillStyle=col('#3c3128',y);c.fillRect(a,y-1.6*ur,b-a,2.4*ur);c.fillStyle=jm(col('#5a4a3a',y),P.light,P.lightA*(sunny?1.5:.8));c.fillRect(a,y-1.6*ur,b-a,(sunny?1.3:.6)*ur);
      if(sunny)ways.push([a,b,y+bh+2.6*ur,rr*.62,hzOf(y)]);
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
        c.strokeStyle=col(jm('#5a4a3c',P.light,P.lightA*.6),gy-oh);c.lineWidth=1.6*ur;c.beginPath();c.moveTo(x+ow*.1,gy-oh*.6);c.quadraticCurveTo(x+ow*.5,gy-oh*1.05,x+ow*.9,gy-oh*.5);c.stroke();
        for(let q=0;q<5;q++){c.fillStyle=col(JUNKC[(r()*JUNKC.length)|0],gy-oh*.4);c.fillRect(x+ow*(.1+.75*r()),gy-oh*(.2+.5*r()),(5+r()*9)*ur,(3+r()*4)*ur);}
        x+=ow+(2+r()*6)*ur;continue;}
      if(k<.09){// a stair up to the next walkway: its treads, a rail
        const sw=rr*1.15,y0=gy,y1=gy-rr;c.fillStyle=col('#1c1714',(y0+y1)/2,1.2);c.beginPath();c.moveTo(x,y0+1);c.lineTo(x+sw,y1+1);c.lineTo(x+sw,y1+5*ur);c.lineTo(x+4*ur,y0+5*ur);c.closePath();c.fill();
        const n=Math.max(4,Math.round(rr/(3.4*ur)));c.fillStyle=jm(col('#5a4a3a',y1),P.light,P.lightA*.7);for(let q=0;q<n;q++){const u2=(q+.5)/n;c.fillRect(x+sw*u2-1.6*ur,lerp(y0,y1,u2)-.6*ur,3.4*ur,.9*ur);}
        c.strokeStyle=col('#2a221e',y1);c.lineWidth=.7*ur;c.beginPath();c.moveTo(x,y0-9*ur);c.lineTo(x+sw,y1-9*ur);for(let q=0;q<=3;q++){const u2=q/3;c.moveTo(x+sw*u2,lerp(y0,y1,u2));c.lineTo(x+sw*u2,lerp(y0,y1,u2)-9*ur);}c.stroke();
        x+=sw+(4+r()*8)*ur;continue;}
      if(k<.09+.07*V.gap){// a gap, junk heaped in it (more of them along a row that has given way more)
        const gw=w*.8;c.fillStyle=col('#1a1614',gy-4,1.1);c.beginPath();c.moveTo(x,gy-1.6*ur);c.quadraticCurveTo(x+gw/2,gy-h*.7,x+gw,gy-1.6*ur);c.closePath();c.fill();
        for(let q=0;q<4;q++){c.fillStyle=col(JUNKC[(r()*JUNKC.length)|0],gy-6,1);c.fillRect(x+gw*(.1+.7*r()),gy-1.6*ur-h*(.15+.35*r()),(4+r()*7)*ur,(3+r()*4)*ur);}
        x+=gw;continue;}
      {const lf=sunny&&rl()<.72?P.lightA*(.5+.55*rl()):0;c.fillStyle=col(lf?jm(base,P.light,lf):base,top+h/2);c.fillRect(x,top,w,h);}
      const tinW=r()<.3,cardoor=r()<.1;
      if(tinW){c.fillStyle=rgba('#000000',.28);for(let q=x+2*ur;q<x+w;q+=3*ur)c.fillRect(q,top+2*ur,.7*ur,h-2*ur);}
      else{c.fillStyle=rgba('#000000',.22);for(let q=x+5*ur;q<x+w;q+=(6+r()*4)*ur)c.fillRect(q,top+2*ur,.6*ur,h-2*ur);}
      if(cardoor){c.fillStyle=col(['#4a2222','#22383a','#4a4436'][(r()*3)|0],top+h*.5);c.fillRect(x+w*.2,top+h*.3,9*ur,h*.5);}
      // the roof: a sheet of tin across it, its edge lit from above
      const tip=(r()-.5)*5*ur,tc=col(TINC[(r()*TINC.length)|0],top);c.fillStyle=tc;c.beginPath();c.moveTo(x-2*ur,top-Math.max(0,tip));c.lineTo(x+w+2*ur,top-Math.max(0,-tip));c.lineTo(x+w+2*ur,top+2.4*ur-Math.max(0,-tip));c.lineTo(x-2*ur,top+2.4*ur-Math.max(0,tip));c.closePath();c.fill();
      c.fillStyle=jm(tc,P.light,P.lightA*(sunny?2.1:1.6));c.fillRect(x-2*ur,top-Math.max(0,tip)-.2,w+4*ur,(sunny?1.5:.7)*ur);
      if(r()<.3){c.strokeStyle=col('#0e0d0f',top,1.2);c.lineWidth=Math.max(1.5,2.76*ur);const tn=1+((r()*3)|0);for(let q=0;q<tn;q++){c.beginPath();c.ellipse(x+w*(.2+.6*(q+.5)/tn),top-1.4*ur,3*ur,1.3*ur,0,0,TAU);c.stroke();}}
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
      if(r()<.16){const x2=x+w+(14+r()*26)*ur,sag=(4+r()*5)*ur,ly=top+3*ur;c.strokeStyle=col('#8a8070',ly);c.lineWidth=.9*ur;c.beginPath();c.moveTo(x+w,ly);c.quadraticCurveTo((x+w+x2)/2,ly+sag*2,x2,ly+1);c.stroke();
        for(let q=0;q<3;q++){const s2=.25+q*.25,cx=lerp(x+w,x2,s2),cy=ly+sag*2*(1-Math.pow(2*s2-1,2))*.5+1;c.fillStyle=col(CLOTH[(r()*CLOTH.length)|0],cy,.7);c.fillRect(cx-2*ur,cy,4*ur,(4+r()*3)*ur);}}
      if(r()<.08){const lx=x+w*.5;c.strokeStyle=col('#241c1a',gy+rr*.5);c.lineWidth=Math.max(1.5,2.4*ur);c.beginPath();c.moveTo(lx,gy);c.lineTo(lx,gy+rr-2);c.moveTo(lx+5*ur,gy);c.lineTo(lx+5*ur,gy+rr-2);for(let q=4*ur;q<rr;q+=6*ur){c.moveTo(lx,gy+q);c.lineTo(lx+5*ur,gy+q);}c.stroke();}
      if(r()<.035)out.fires.push({x:x+w+3*ur,y:gy-3*ur,s:ur,hz:hzOf(gy)});
      const gap=r()<.18?(8+r()*30)*ur:(1+r()*3)*ur;x+=w+gap;}}
  // by day and by morning each walkway throws a cool slate shadow down over the row under it, and its edge and the roofs catch the sun
  // (the style guide's rule 4): the terraces read through the haze by their light and shade, not as one texture (since V90)
  if(ways.length){const sl=jm(P.amb,'#3a4c60',.35);for(const [a,b,y,h2,hz] of ways){const sa=.3*(1-hz*.5);if(sa<.02||y>yz||y+h2<ya)continue;
    c.fillStyle=lin(c,0,y,0,y+h2,[[0,rgba(sl,sa)],[.45,rgba(sl,sa*.45)],[1,rgba(sl,0)]]);c.fillRect(a,y,b-a,h2);}}
  // bands of smoke and haze lying across the wall at their own heights, the higher the thicker (the distance), so that the wall is not
  // one field of shacks at one value (since V82)
  {const rh=rng(seed*97+3),hc=jm(P.air[0],P.smoke,.4);for(let q=0;q<(o.bands??5);q++){const by=lerp(yt+40,yb-60,rh()),bhh=(26+rh()*70)*u,a=(.05+.1*rh())*(.45+hzOf(by));if(by-bhh>yz||by+bhh<ya)continue;
    c.fillStyle=lin(c,0,by-bhh,0,by+bhh,[[0,rgba(hc,0)],[.5,rgba(hc,a)],[1,rgba(hc,0)]]);c.fillRect(x0,by-bhh,x1-x0,bhh*2);}}
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
  if(P.key!=='night'){const rz=rng(31),hz2=jm(P.sky[0],P.light,.35);for(let i=0;i<46;i++){const yy=lerp(y0+10,y1-30,rz()),xx=lerp(x0,x1,rz()),w=60+rz()*220,h=1+rz()*3.2;
      c.fillStyle=rgba(rz()<.6?hz2:jm(P.sky[1],'#000000',.25),.06+.08*rz());c.beginPath();c.ellipse(xx,yy,w,h,0,0,TAU);c.fill();}mottle(c,x0,y0,x1,y1,.3);}
  const ry=y1-(o.rim||24),r=rng(23),dk=jm(jm(P.air[0],'#000000',.45),P.sky[1],.15);c.fillStyle=dk;c.beginPath();c.moveTo(x0,y1);
  for(let x=x0;x<=x1;){const w=10+r()*30,h=r()<.6?4+r()*12:0;c.lineTo(x,ry-h);c.lineTo(x+w,ry-h);x+=w;}c.lineTo(x1,y1);c.closePath();c.fill();
  if(P.key!=='day'&&P.key!=='morning'){const r2=rng(29);for(let i=0;i<14;i++){c.fillStyle=rgba('#ffcf86',.5+.4*r2());c.fillRect(lerp(x0,x1,r2()),ry-2-r2()*8,1.6,1.4);}}
  const tw=o.tower??240;c.fillStyle=jm(P.sky[1],'#000000',.8);c.fillRect(x0,y0,tw-x0,ry-y0+6);c.fillStyle=rgba(P.light,.18);c.fillRect(tw-2,y0,1.6,ry-y0+4);
  // the light falling down the Pit from it; the sun's glow over the rim on its side, by day and by morning
  c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,0,y1,0,y1+260,[[0,rgba(P.sky[1],.25)],[1,rgba(P.sky[1],0)]]);c.fillRect(x0,y1,x1-x0,260);
  {const S2=sun();if(S2){const sx=clamp(S2.x,x0+60,x1-60);cRad(c,sx,ry,6,260,S2.col,.5,.55);cRad(c,sx,ry,2,60,'#fff4e4',.6,.7);}}c.restore();}
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
E.pitKit={tod,pal,PAL,sun,sunlight,mottle,jm,shade,topLit,Q,poly,blob,spr,glowSpr,puffSpr,glowAt,smoke,boards,tin,oilcloth,facade,shackRows,drop,lantern,piece,drawPiece,upper,skyTop,cRad,puddle,tram,
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
const L0={far:232,door:{x:170,d:226,w:46},step:{x:170,d:206,h:16},window:{x0:286,x1:346,y0:170,y1:106},pump:{x:520,d:118,r:22,k:1.5},trough:{x0:540,x1:630,d:128,k:1.5},
  gate:{x:836,d:120,w:60},ladder:{x:392,d:224,top:156},sidestair:{x0:30,x1:118,d:200},wall:{x0:600,x1:900,d:214,h:64},dobSeat:{x:690,d:170,crate:true},
  barrels:[{x:270,d:150,r:26,k:1.625},{x:300,d:190,r:24,k:1.6}],crates:[{x:660,d:156,w:34,h:30},{x:690,d:170,w:30,h:26}],floor:{x0:40,x1:800,z0:30,z1:170},stairGate:{x:126,d:196,w:34},
  south:{z0:-420,x1:990,east:-44,bank:{x1:300,d0:-300,d1:-130,x2:240,d2:-184},drain:{x:168,d:-300,r:54,wing:56},kerb:-430,
    lip:[[1180,-374],[962,-392],[780,-406],[652,-430],[616,-524],[590,-870]],shed:{x0:880,x1:1024,d0:-320,d1:-228,h:205,hb:169,k:1.28},
    fire:{x:366,d:-156,r:33,k:1.5},cart:{x0:470,x1:605,d:-400,k:1.3},beds:[[64,264,-70,-34],[64,264,-122,-86]],crow:{x:-22,d:-98},
    tree:{x:458,d:-374,k:1.3},ring:{x:492,d:-296,r:80},post:{x:548,d:-246},wagon:{x0:740,x1:819,d0:-348,d1:-254,k:1.8},
    table:{x0:600,x1:753,d0:-219,d1:-181.6,k:1.7},queue:{x:384,d0:-414,d1:-362}}};
const Y=()=>L()||L0;
// the yard's south (the game's layout where it has one)
const SO=()=>Y().south||L0.south;
// the yard's picture runs on down past the kit's foot (E.FOOT, y 875), since its floor does: to YFOOT, the ground to YNEAR on it
// (the layer is as high: deep, where the scene is given to EnvLook)
const YFOOT=1110,YNEAR=(GB-YFOOT)/PSY;
// the low gate across the foot of the side stairs (the game's layout, else this one), and how far each gate stands open (S.act1.stairGate,
// S.act1.gate: 0 shut, 1 open)
const SG=()=>Y().stairGate||L0.stairGate,SGH=78;
function opened(k){const A=typeof S!=='undefined'&&S?S.act1:null;return clamp(A&&+A[k]||0,0,1);}
const Q=K.Q,jm2=(a,b,t)=>K.jm(a,b,t);
// The yard's things were first drawn small beside a man: a barrel to his knee, a table to his shin, a shed he could not have got
// into. A thing is drawn k times its first size about its foot (x, y in the picture), which makes it k times as long, as deep
// and as high where it stands. zoom: on a context; grown: a piece's box as it then is; des: the box a thing was first drawn in,
// from the box it stands in now (k times that, about its near left foot: x0, d0).
const zoom=(c,x,y,k)=>{c.translate(x,y);c.scale(k,k);c.translate(-x,-y);},grown=(x,y,k,X,Y2,W2,H2)=>[x+(X-x)*k,y+(Y2-y)*k,W2*k,H2*k];
const des=B=>{const k=B.k||1;return Object.assign({},B,{k,x1:B.x0+(B.x1-B.x0)/k,d1:B.d1!=null?B.d0+(B.d1-B.d0)/k:B.d1,h:B.h!=null?B.h/k:B.h,hb:B.hb!=null?B.hb/k:B.hb});};
// the building: its back wall from SUMP.x0 to SUMP.x1 (the woodshed beyond it to the yard wall), the eave and the ridge and how far
// back the ridge stands; the door's height. The fence on the right, the lantern by the step, the lamp over the gate.
const SUMP={x0:20,x1:470,eave:190,ridge:208,rd:46,doorH:168},SHED={x1:604,h:158,back:184},FENCE={x:852,h:92,post:118},STAIR={top:174,n:12,rail:66};
const LANT={x:212,h:150,d:228},GLAMP={h:108,dx:-3,dd:-4};
// the Pit's wall across the floor: its rows (the picture above the layer paints the same rows on up)
const ROWS={yBot:236,rs:50,u:.86,seed:41,span:300,shrink:.5,sspan:760};
let OUT={fires:[],chims:[],lit:[]},NEARCH=[];
const STOVE={x:0,y:0},HOIST={x:0,y:0};
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
  c.fillStyle=lin(c,0,140,0,250,[[0,rgba(P.air[1],0)],[1,rgba(P.air[1],.5)]]);c.fillRect(X0,140,X1-X0,110);
  // (the wall not one flat fill deep in its haze: the kit's mottle over it, under what stands in front of it)
  K.mottle(c,X0,T0,X1,340,P.key==='night'?.2:P.key==='dusk'?.28:.16);}
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
    c.strokeStyle=rgba('#000000',.35);c.lineWidth=1.51;for(const yy of [y-20,y-10]){c.beginPath();c.moveTo(x-18,yy);c.lineTo(x+18,yy);c.stroke();}}
  {const x=1080,y0=200,y1=96;c.strokeStyle=sh('#141110');c.lineWidth=2.4;c.beginPath();c.moveTo(x,y0);c.lineTo(x,y1);c.moveTo(x-12,y1+6);c.lineTo(x+12,y1+6);c.stroke();
    c.strokeStyle=rgba('#0a0808',.65);c.lineWidth=1.51;c.beginPath();c.moveTo(x-12,y1+6);c.quadraticCurveTo(880,y1+42,700,y1+30);c.moveTo(x+12,y1+6);c.quadraticCurveTo(1110,y1+20,1140,y1+16);c.moveTo(x-10,y1+6);c.quadraticCurveTo(840,y1+64,640,y1+60);c.stroke();}}
// ---------- the Sump ----------
// the back wall: boards and tin, the door, the window, the dormer and its hoist, the roof, the lofts and birds, the stovepipe
function sump(c,P){const Yd=Y(),far=Yd.far,b=(x,h)=>Q(x,h,far),x0=SUMP.x0,x1=SUMP.x1,sh=(col,k)=>K.shade(P,col,k);
  // the roof first: tin over the boards, running back up to the ridge, its corrugations catching the light
  {const a=b(x0-8,SUMP.eave),e=b(x1+10,SUMP.eave),rp=Q(x1+10,SUMP.ridge,far+SUMP.rd),lp=Q(x0-8,SUMP.ridge,far+SUMP.rd);
    c.fillStyle=lin(c,0,lp.y,0,a.y,[[0,K.topLit(P,'#46403c',1.1)],[1,sh('#2a2624',1.1)]]);K.poly(c,[a,e,rp,lp]);c.fill();
    c.save();K.poly(c,[a,e,rp,lp]);c.clip();
    // (sheet by sheet since V117: each sheet's own pitch and its own start, a dark lap where it lies over the next, so that the
    // roof seen close is sheets of tin and not one ruled field)
    {const rs=rng(53);for(let sx=x0-8;sx<x1+10;){const sw=30+rs()*34,pitch=4.4+rs()*1.5,a=.24+rs()*.1,e=Math.min(sx+sw,x1+10);
        for(let x=sx+rs()*pitch;x<e;x+=pitch){const p0=b(x,SUMP.eave),p1=Q(x,SUMP.ridge,far+SUMP.rd);c.strokeStyle=rgba('#000000',a);c.lineWidth=1.6;c.beginPath();c.moveTo(p0.x,p0.y);c.lineTo(p1.x,p1.y);c.stroke();
          c.strokeStyle=rgba(P.light,.04+.2*P.lightA);c.lineWidth=.6;c.beginPath();c.moveTo(p0.x+1.6,p0.y);c.lineTo(p1.x+1.6,p1.y);c.stroke();}
        if(e<x1+10){const p0=b(e,SUMP.eave),p1=Q(e,SUMP.ridge,far+SUMP.rd);c.strokeStyle=rgba('#000000',.3);c.lineWidth=2.4;c.beginPath();c.moveTo(p0.x,p0.y);c.lineTo(p1.x,p1.y);c.stroke();}
        sx=e;}}
    // sheets of different ages: rusted, patched, one newer
    const r=rng(5);for(let i=0;i<9;i++){const sx=x0+r()*(x1-x0-60),sw=30+r()*60,hk=r()*.5,q0=b(sx,SUMP.eave),q1=b(sx+sw,SUMP.eave),q2=Q(sx+sw,lerp(SUMP.eave,SUMP.ridge,.5+hk),far+SUMP.rd*(.5+hk)),q3=Q(sx,lerp(SUMP.eave,SUMP.ridge,.5+hk),far+SUMP.rd*(.5+hk));
      c.fillStyle=rgba(r()<.6?'#7a3a1a':r()<.5?'#2a2624':'#8a8478',.16+.16*r());K.poly(c,[q0,q1,q2,q3]);c.fill();}
    // straw blown up there off the birds' hay
    c.strokeStyle=rgba('#c8a050',.45);c.lineWidth=1.01;c.beginPath();for(let i=0;i<60;i++){const x=x0+20+r()*(x1-x0-40),hh=lerp(SUMP.eave,SUMP.ridge,r()),p=Q(x,hh,lerp(far,far+SUMP.rd,(hh-SUMP.eave)/(SUMP.ridge-SUMP.eave))),a=r()*TAU;c.moveTo(p.x,p.y);c.lineTo(p.x+Math.cos(a)*3,p.y+Math.sin(a)*1.5);}c.stroke();
    c.restore();
    c.strokeStyle=sh('#363230');c.lineWidth=3;c.beginPath();c.moveTo(lp.x,lp.y);c.lineTo(rp.x,rp.y);c.stroke();c.strokeStyle=rgba(P.light,.12+.45*P.lightA);c.lineWidth=.99;c.beginPath();c.moveTo(lp.x,lp.y-1.4);c.lineTo(rp.x,rp.y-1.4);c.stroke();}
  // Dob's pigeon lofts on the roof at the left: boxes of planks with round holes (the birds are live: FLOCK)
  {for(const [lx,lw,lh] of [[60,40,26],[106,34,22],[146,38,25]]){const fb=Q(lx,SUMP.ridge-6,far+SUMP.rd-8),fr=Q(lx+lw,SUMP.ridge-6,far+SUMP.rd-8);
      c.fillStyle=sh('#3e3226',1.1);c.fillRect(fb.x,fb.y-lh,fr.x-fb.x,lh);c.fillStyle=sh('#241a12',1.2);c.fillRect(fr.x,fb.y-lh+2,4,lh-2);
      c.fillStyle=K.topLit(P,'#4a3c30',.9);c.beginPath();c.moveTo(fb.x-3,fb.y-lh);c.lineTo((fb.x+fr.x)/2,fb.y-lh-7);c.lineTo(fr.x+4,fb.y-lh);c.closePath();c.fill();
      for(let q=0;q<3;q++){c.fillStyle='#0a0808';c.beginPath();c.arc(fb.x+lw*(.2+q*.3),fb.y-lh*.55,2.3,0,TAU);c.fill();c.fillStyle=sh('#5a4a3a');c.fillRect(fb.x+lw*(.2+q*.3)-3.6,fb.y-lh*.55+2.6,7.2,1.1);}}}
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
    const dp=b(456,SUMP.eave),db=b(456,68);c.fillStyle=sh('#262220');c.fillRect(dp.x-2.4,dp.y,4.8,db.y-dp.y);c.fillStyle=rgba(P.light,.05+.22*P.lightA);c.fillRect(dp.x-1.6,dp.y,1,db.y-dp.y);
    for(const yy of [dp.y+30,dp.y+80]){c.fillStyle=sh('#1a1614');c.fillRect(dp.x-4,yy,8,2.4);}}
  door(c,P);win(c,P);dormer(c,P);}
// a pigeon sitting: a plump body, a round head, the tail
// the back door: planks in a frame under a little tin hood; at night open on the kitchen's light (an oil lamp's orange, the Pit's,
// never a gold: the style guide's rule 3, since V81; painted dark, since the yard's set light, a dodge, lifts it to that orange)
function door(c,P){const Yd=Y(),D=Yd.door,far=Yd.far,b=(x,h)=>Q(x,h,far),x0=D.x-D.w/2,x1=D.x+D.w/2,top=b(x0,SUMP.doorH),bot=b(x1,0),sh=(col,k)=>K.shade(P,col,k),night=P.key==='night',w=bot.x-top.x,h=bot.y-top.y;
  c.fillStyle=sh('#2a1e16');c.fillRect(top.x-5,top.y-6,w+10,h+6);
  if(night){// open: the kitchen beyond, warm with the stove; a shelf of pots, a hanging lamp; the leaf swung in against the jamb
    c.fillStyle=lin(c,0,top.y,0,bot.y,[[0,'#3a1608'],[.45,'#6c3214'],[1,'#8c4a24']]);c.fillRect(top.x,top.y,w,h);
    c.fillStyle=rgba('#3a1a0a',.55);c.fillRect(top.x,top.y+h*.3,w,2.4);for(const [px,pw,ph] of [[8,8,7],[20,6,9],[30,9,6]]){c.fillRect(top.x+px,top.y+h*.3-ph,pw,ph);}
    c.fillStyle=rgba('#2a1206',.5);c.fillRect(top.x+w*.45,top.y+h*.62,w*.55,h*.38);c.fillStyle=rgba('#ff7a2a',.35);c.fillRect(top.x+w*.5,top.y+h*.66,w*.4,3);
    c.strokeStyle=rgba('#2a1206',.7);c.lineWidth=1.51;c.beginPath();c.moveTo(top.x+w*.62,top.y);c.lineTo(top.x+w*.62,top.y+h*.16);c.stroke();c.fillStyle='#fff0c8';c.fillRect(top.x+w*.62-2.4,top.y+h*.16,4.8,5);
    c.fillStyle='#140a06';c.beginPath();c.moveTo(top.x,top.y);c.lineTo(top.x+10,top.y+5);c.lineTo(top.x+10,bot.y-3);c.lineTo(top.x,bot.y);c.closePath();c.fill();
    c.save();c.globalCompositeOperation='lighter';K.glowAt(c,top.x+w*.6,top.y+h*.2,14,'#ff9a4a',.4);K.glowAt(c,top.x+w/2,top.y+h*.55,64,'#ff7a30',.16,1.3);c.restore();}
  else{K.boards(c,top.x,top.y,bot.x,bot.y,{base:sh('#34261c'),bw:7.6,seed:21,foot:14,pal:P,top:false});
    c.fillStyle=sh('#24180f');for(const yy of [top.y+18,bot.y-24])c.fillRect(top.x,yy,w,4);
    c.strokeStyle=sh('#24180f');c.lineWidth=4;c.beginPath();c.moveTo(top.x+3,bot.y-24);c.lineTo(bot.x-3,top.y+22);c.stroke();
    c.fillStyle=sh('#5a5450');c.beginPath();c.arc(bot.x-8,top.y+h*.55,1.8,0,TAU);c.fill();c.fillStyle=sh('#1a1410');c.fillRect(bot.x-10,top.y+h*.55+4,4,6);
    // the kitchen's light leaking round it
    c.fillStyle=rgba('#ffb25e',.2+.3*P.lamp);c.fillRect(top.x,bot.y-2,w,1.2);c.fillRect(bot.x-1,top.y+2,1,h-4);}
  // the hood: a strip of tin on two brackets
  {const a=Q(x0-10,SUMP.doorH+12,far),e=Q(x1+10,SUMP.doorH+12,far),f=Q(x1+10,SUMP.doorH+6,far-16),g=Q(x0-10,SUMP.doorH+6,far-16);c.fillStyle=K.topLit(P,'#3a3634',.8);K.poly(c,[a,e,f,g]);c.fill();
    c.fillStyle=sh('#1e1c1a');c.fillRect(g.x,g.y,f.x-g.x,2.2);c.fillStyle=rgba('#7a3a18',.3);K.poly(c,[a,e,Q(x1+10,SUMP.doorH+10,far-5),Q(x0-10,SUMP.doorH+10,far-5)]);c.fill();
    c.strokeStyle=sh('#1a1612');c.lineWidth=1.48;c.beginPath();for(const xx of [x0-5,x1+5]){const p=Q(xx,SUMP.doorH+7,far-14),q=Q(xx,SUMP.doorH-12,far);c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);}c.stroke();}
  // the lantern on its bracket by the door (its glow is live() at night)
  {const p=Q(LANT.x,LANT.h,LANT.d);c.save();zoom(c,p.x,p.y,1.6);c.strokeStyle=sh('#1a1612');c.lineWidth=1.48;c.beginPath();c.moveTo(p.x-7,p.y-14);c.lineTo(p.x,p.y-14);c.lineTo(p.x,p.y-10);c.stroke();K.lantern(c,P,p.x,p.y-10,1,night);c.restore();}}
// the window: small panes in a frame, lit from the bar; a shutter hanging open beside it
function win(c,P){const Yd=Y(),W0=Yd.window,far=Yd.far,b=(x,h)=>Q(x,h,far),a=b(W0.x0,W0.y0),e=b(W0.x1,W0.y1),w=e.x-a.x,h=e.y-a.y,sh=(col,k)=>K.shade(P,col,k),night=P.key==='night',k=night?1:.55+.3*P.lamp;
  c.fillStyle=sh('#22180f');c.fillRect(a.x-4,a.y-4,w+8,h+8);
  c.fillStyle=lin(c,0,a.y,0,e.y,[[0,mix('#5a2e14','#c06a32',k*.55)],[.6,mix('#5a2e14','#c86434',k*.75)],[1,mix('#5a2e14','#cc7438',k*.6)]]);c.fillRect(a.x,a.y,w,h);
  // the bar's inside: a shelf of bottles, a head at the counter
  c.fillStyle=rgba('#2a1206',.75);c.fillRect(a.x,a.y+h*.62,w,h*.38);for(let x=a.x+3;x<a.x+w-3;x+=4.6){c.fillRect(x,a.y+h*.62-5,2.4,5);c.fillRect(x+.6,a.y+h*.62-7,1.2,2);}
  c.beginPath();c.arc(a.x+w*.7,a.y+h*.48,4,0,TAU);c.fill();c.fillRect(a.x+w*.7-6,a.y+h*.5,12,h*.5);
  if(night){c.save();c.globalCompositeOperation='lighter';K.glowAt(c,a.x+w*.3,a.y+h*.25,10,'#ff9a4a',.4);c.restore();}
  c.fillStyle=sh('#1a120c');c.fillRect(a.x+w/3-1,a.y,2,h);c.fillRect(a.x+2*w/3-1,a.y,2,h);c.fillRect(a.x,a.y+h/2-1,w,2);c.strokeStyle=sh('#1a120c');c.lineWidth=1.6;c.strokeRect(a.x,a.y,w,h);
  c.strokeStyle=rgba('#ffffff',.25);c.lineWidth=1;c.beginPath();c.moveTo(a.x+4,a.y+3);c.lineTo(a.x+12,a.y+14);c.lineTo(a.x+9,a.y+20);c.stroke();
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
    // (the fall with the hook on it hangs live since V118, and swings: ropeLive. Here the end that is made fast)
    c.strokeStyle=sh('#5a4a38');c.lineWidth=1.6;c.beginPath();c.moveTo(p1.x-1,p1.y+7);c.lineTo(p1.x-1,p1.y+30);c.stroke();HOIST.x=p1.x+5;HOIST.y=p1.y+7;}}
// the ladder against the wall up to the loft door: two long rails and their rungs, a hand's polish on them
function ladder(c,P){const Yd=Y(),Ld=Yd.ladder,sh=(col,k)=>K.shade(P,col,k),foot=Ld.d-12,top=Ld.d+6,ht=Ld.top+18,rail=xx=>[Q(xx,0,foot),Q(xx,ht,top)];
  {const a=Q(Ld.x+6,4,Yd.far),e=Q(Ld.x+6,ht-6,Yd.far);c.strokeStyle=rgba('#000000',.25);c.lineWidth=20;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(e.x+3,e.y);c.stroke();}
  const [la,lb]=rail(Ld.x-13),[ra,rb]=rail(Ld.x+13);
  c.lineCap='round';c.strokeStyle=sh('#54402c');c.lineWidth=3.4;c.beginPath();for(let hh=14;hh<ht-4;hh+=22){const u=hh/ht,p=Q(Ld.x-13,hh,lerp(foot,top,u)),q=Q(Ld.x+13,hh,lerp(foot,top,u));c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);}c.stroke();
  c.strokeStyle=rgba(P.light,.06+.35*P.lightA);c.lineWidth=1.01;c.beginPath();for(let hh=14;hh<ht-4;hh+=22){const u=hh/ht,p=Q(Ld.x-13,hh,lerp(foot,top,u)),q=Q(Ld.x+13,hh,lerp(foot,top,u));c.moveTo(p.x,p.y-1);c.lineTo(q.x,q.y-1);}c.stroke();
  for(const [a,e] of [[la,lb],[ra,rb]]){c.strokeStyle=sh('#463222');c.lineWidth=5.4;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(e.x,e.y);c.stroke();
    c.strokeStyle=rgba(P.light,.08+.4*P.lightA);c.lineWidth=1;c.beginPath();c.moveTo(a.x-1.4,a.y);c.lineTo(e.x-1.4,e.y);c.stroke();}
  c.lineCap='butt';}
// the stairs round the side: a flight of planks against the wall from the yard up to a landing at the corner, which turns away
// round the side of the building; a handrail on posts
function sideStair(c,P){const Yd=Y(),St=Yd.sidestair,sh=(col,k)=>K.shade(P,col,k),d0=St.d,d1=Yd.far-2,xb=St.x1,xt=St.x0,top=STAIR.top,n=STAIR.n,run=(xb-xt)/n,rise=top/n;
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
  const rail=[];for(const [xx,hh] of [[xb+2,0],[xb-run*4,rise*4],[xb-run*8,rise*8],[xt,top],[lx0+3,top]]){const a=Q(xx,hh,d0-1),e=Q(xx,hh+STAIR.rail,d0-1);c.moveTo(a.x,a.y);c.lineTo(e.x,e.y);rail.push(e);}
  c.stroke();c.lineWidth=2.6;c.beginPath();rail.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));const rc=Q(lx0+3,top+34,d1);c.lineTo(rc.x,rc.y);c.stroke();
  c.strokeStyle=rgba(P.light,.08+.35*P.lightA);c.lineWidth=.99;c.beginPath();rail.forEach((p,i)=>i?c.lineTo(p.x,p.y-1.2):c.moveTo(p.x,p.y-1.2));c.stroke();}
// the low fence across the foot of the side stairs, to keep the yard's dogs and goats off the roof: a short run in front of the
// lowest steps, the gate's two posts, and a run back to the wall along the side of the door's step (the gate is a piece: gateLeaf)
function stairFence(c,P){const G=SG(),far=Y().far,sh=(col,k)=>K.shade(P,col,k),hx=G.x-G.w/2,lx=G.x+G.w/2,d=G.d,x0=hx-28,r=rng(131);
  // the run in front of the steps: pickets on two rails
  c.strokeStyle=sh('#2e2218',1.1);c.lineWidth=2.6;c.beginPath();for(const hh of [12,SGH-10]){const a=Q(x0,hh,d),e=Q(hx,hh,d);c.moveTo(a.x,a.y);c.lineTo(e.x,e.y);}c.stroke();
  for(let x=x0+4;x<hx-2;x+=6){const a=Q(x,0,d),e=Q(x,SGH-2-(r()<.3?4:0),d);c.fillStyle=sh('#3a2c20',1.1);c.fillRect(a.x-2,e.y,4,a.y-e.y);c.fillStyle=rgba(P.light,.06+.25*P.lightA);c.fillRect(a.x-2,e.y,4,1);}
  // the run back to the wall, along depth: its right face toward the eye
  {const A=Q(lx,0,d),B=Q(lx,0,far),Bt=Q(lx,SGH-4,far),At=Q(lx,SGH-4,d);c.fillStyle=sh('#33261a',1.15);K.poly(c,[A,B,Bt,At]);c.fill();
    c.strokeStyle=rgba('#000000',.45);c.lineWidth=1.48;c.beginPath();for(let dd=d+6;dd<far;dd+=6){const a=Q(lx,0,dd),e=Q(lx,SGH-4,dd);c.moveTo(a.x,a.y);c.lineTo(e.x,e.y);}c.stroke();
    c.fillStyle=K.topLit(P,'#3e3024',.7);K.poly(c,[At,Bt,Q(lx+3,SGH-4,far),Q(lx+3,SGH-4,d)]);c.fill();}
  // the posts: the hinge post, the latch post, the end post
  for(const [px,ph] of [[x0,SGH+4],[hx,SGH+10],[lx,SGH+10]]){const a=Q(px-3,0,d),e=Q(px+3,ph,d);c.fillStyle=sh('#2a1e14',1.1);c.fillRect(a.x,e.y,e.x-a.x,a.y-e.y);
    c.fillStyle=sh('#1e150e',1.3);K.poly(c,[Q(px+3,0,d),Q(px+3,ph,d),Q(px+3,ph,d+6),Q(px+3,0,d+6)]);c.fill();c.fillStyle=K.topLit(P,'#3a2c20',.8);c.fillRect(a.x,e.y-1.4,e.x-a.x,1.6);}}
// the woodshed at the right end of the Sump: boards under a lean-to roof, its door open on the dark, logs stacked
function shed(c,P){const Yd=Y(),far=Yd.far,sh=(col,k)=>K.shade(P,col,k),x0=SUMP.x1,x1=SHED.x1;
  const ra=Q(x0,SHED.h,far),re=Q(x1,SHED.h,far),rb=Q(x1,SHED.back,far+40),rf=Q(x0,SHED.back,far+40);c.fillStyle=lin(c,0,rb.y,0,ra.y,[[0,K.topLit(P,'#46403c',1)],[1,sh('#2a2624')]]);K.poly(c,[ra,re,rb,rf]);c.fill();
  c.save();K.poly(c,[ra,re,rb,rf]);c.clip();for(let x=x0;x<x1;x+=5){const p=Q(x,SHED.h,far),q=Q(x,SHED.back,far+40);c.strokeStyle=rgba('#000000',.3);c.lineWidth=1.48;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);c.stroke();}
  c.fillStyle=rgba('#7a3a1a',.28);c.fillRect(ra.x+30,rb.y,40,ra.y-rb.y);c.restore();
  c.fillStyle=sh('#261c14',1.2);K.poly(c,[Q(x1,0,far),Q(x1,SHED.h,far),Q(x1,SHED.back,far+40),Q(x1,0,far+40)]);c.fill();
  const a=Q(x0,SHED.h,far),e=Q(x1,0,far);K.boards(c,a.x,a.y,e.x,e.y,{base:sh('#3a2e22'),bw:11,seed:23,rails:[a.y+14],foot:18,pal:P});
  c.fillStyle=lin(c,0,a.y,0,a.y+14,[[0,rgba('#000000',.5)],[1,rgba('#000000',0)]]);c.fillRect(a.x,a.y,e.x-a.x,14);
  const da=Q(x0+64,142,far),de=Q(x0+110,0,far);c.fillStyle='#0c0907';c.fillRect(da.x,da.y,de.x-da.x,de.y-da.y);c.fillStyle=rgba(P.light,.03+.08*P.lightA);c.fillRect(da.x,de.y-14,de.x-da.x,14);
  c.fillStyle=sh('#241a12');c.beginPath();c.moveTo(de.x,da.y);c.lineTo(de.x+12,da.y+4);c.lineTo(de.x+12,de.y-2);c.lineTo(de.x,de.y);c.closePath();c.fill();
  // a saw and a coil of rope on nails inside the door, a sack slumped in it
  c.strokeStyle=rgba(P.light,.12+.2*P.lightA);c.lineWidth=.99;c.beginPath();c.moveTo(da.x+6,da.y+16);c.lineTo(da.x+20,da.y+20);c.stroke();}
// the stack of firewood against the woodshed, between two stakes (since V118: it was four rows of pale rings, the wall's own tone):
// the logs' sawn ends, bark round each, their rings and checks, some split in half; dark between them; the top row's lengths
// running back to the wall under an oilcloth held down with a brick; what the stack throws on the boards behind it, chips before it
function woodpile(c,P){const far=Y().far,sh=(col,k)=>K.shade(P,col,k),r=rng(41),ls=-(sunDir()||1),LA=P.lightA,d=far-9,R=4.8,dx=9.8,dy=8.3,xa=SUMP.x1+9;
  const at=(row,q)=>Q(xa+q*dx+(row%2)*dx/2,R+row*dy,d),L=[];for(let row=0;row<4;row++)for(let q=0;q<5-(row%2);q++)L.push({p:at(row,q),row,rr:R-.5+r()*.9,half:r()<.28,a:r()*TAU,v:r()});
  const g0=Q(xa-R-3,0,d),g1=Q(xa+4*dx+R+3,0,d),yt=at(3,0).y-R,back=Q(0,0,far).y-Q(0,0,d).y,bx=(far-d)*PSX;
  thrown(c,P,5,2,()=>{c.beginPath();c.rect(g0.x,yt-5,g1.x-g0.x,g0.y-yt+3);},.85);
  // (the ground under it and before it dark; the dark between the logs)
  c.fillStyle=rgba('#000000',.4);c.beginPath();c.ellipse((g0.x+g1.x)/2,g0.y+1.5,(g1.x-g0.x)/2+4,4,0,0,TAU);c.fill();
  c.fillStyle=sh('#0e0a08',1.2);c.fillRect(g0.x+1.5,yt+2,g1.x-g0.x-3,g0.y-yt-2);
  // (the top row's lengths, seen from above, running back to the wall)
  {const tl=at(3,0),tr=at(3,3);c.fillStyle=K.topLit(P,'#4a3826',.8);K.poly(c,[{x:tl.x-R,y:yt+1.5},{x:tr.x+R,y:yt+1.5},{x:tr.x+R+bx,y:yt+1.5+back},{x:tl.x-R+bx,y:yt+1.5+back}]);c.fill();
    c.strokeStyle=rgba('#000000',.3);c.lineWidth=1.5;c.beginPath();for(let q=0;q<3;q++){const p=at(3,q);c.moveTo(p.x+R,yt+1.5);c.lineTo(p.x+R+bx,yt+1.5+back);}c.stroke();}
  // (the stakes)
  for(const sx of [g0.x+.6,g1.x-3]){c.fillStyle=sh('#32261a',1.1);c.fillRect(sx,yt-7,2.6,g0.y-yt+7);c.fillStyle=rgba(P.light,.1+.36*LA);c.fillRect(ls<0?sx:sx+1.8,yt-7,.8,g0.y-yt+7);}
  for(const o of L){const p=o.p,rr=o.rr,bark=sh(['#33251a','#2c2018','#3a2a1e'][(o.v*3)|0],1.1),wood=K.topLit(P,['#7e6040','#705436','#886a46','#765a3a'][(o.v*4)|0],.45+.4*(o.row/3));
    const disc=q=>{c.beginPath();if(o.half)c.arc(p.x,p.y,q,o.a,o.a+Math.PI);else c.arc(p.x,p.y,q,0,TAU);c.closePath();};
    c.fillStyle=bark;disc(rr);c.fill();c.fillStyle=wood;disc(rr-1.15);c.fill();
    c.save();disc(rr-1.15);c.clip();
    c.fillStyle=rgba('#000000',.2);c.beginPath();c.arc(p.x-ls*rr*.5,p.y+rr*.55,rr*.95,0,TAU);c.fill();
    c.fillStyle=rgba('#3a2412',.3);c.beginPath();c.arc(p.x,p.y,rr*.42,0,TAU);c.fill();
    c.strokeStyle=rgba('#22140a',.5);c.lineWidth=1.5;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x+Math.cos(o.a+1)*rr,p.y+Math.sin(o.a+1)*rr);c.stroke();
    c.restore();
    c.strokeStyle=rgba(P.light,.1+.42*LA);c.lineWidth=1;c.beginPath();c.arc(p.x,p.y,rr-.6,Math.PI*(ls<0?1.05:1.5),Math.PI*(ls<0?1.5:1.95));c.stroke();}
  // (the oilcloth over the right of the top, its brick)
  {const tr=at(3,3),tm=at(3,1);K.oilcloth(c,[{x:tm.x+bx+2,y:yt+back+.5},{x:tr.x+R+bx+3,y:yt+back+.5},{x:tr.x+R+4.5,y:yt+12},{x:tr.x-3,y:yt+8.5},{x:tm.x+3,y:yt+5}],{pal:P,seed:47,base:sh('#3d3c2c',.9),sag:2.2,patches:1,patch:[sh('#2f3d42')]});
    const q={x:tr.x-1,y:yt+back*.5+1.5};c.fillStyle=sh('#4e2e22',1.2);c.fillRect(q.x-4,q.y-1,8,3.6);c.fillStyle=K.topLit(P,'#6a4030',.9);K.poly(c,[{x:q.x-4,y:q.y-1},{x:q.x+4,y:q.y-1},{x:q.x+5.2,y:q.y-3.4},{x:q.x-2.8,y:q.y-3.4}]);c.fill();}
  // (chips and bark before it)
  {const rc=rng(43);for(let i=0;i<22;i++){const q=Q(xa-12+rc()*74,0,d-3-rc()*26);c.fillStyle=rc()<.6?rgba(K.topLit(P,'#8a6c48',.8),.35+.3*rc()):rgba(sh('#2c2018'),.55);c.save();c.translate(q.x,q.y);c.rotate((rc()-.5)*1.6);c.fillRect(-1.4-rc(),-.5,2.8+rc()*2,1);c.restore();}}}
// ---------- the yard wall and the fence ----------
function yardWall(c,P){const Yd=Y(),Wl=Yd.wall,sh=(col,k)=>K.shade(P,col,k),d=Wl.d,x0=Wl.x0,x1=FENCE.x+4,h=Wl.h,a=Q(x0,h,d),e=Q(x1,0,d),r=rng(51);
  // brick low down, patched with stone; tin and boards over it; a plank coping
  {c.save();c.beginPath();c.rect(a.x,a.y,e.x-a.x,e.y-a.y);c.clip();
    c.fillStyle=sh('#42291f',1.1);c.fillRect(a.x,a.y,e.x-a.x,e.y-a.y);
    for(let y=e.y-4.5,row=0;y>a.y+20;y-=4.5,row++)for(let x=a.x-(row%2)*5;x<e.x;x+=10){const v=r();c.fillStyle=sh(v<.4?'#4e2e22':v<.75?'#42271d':'#352723',1.1);c.fillRect(x+.5,y+.5,9,3.6);}
    c.fillStyle=rgba('#000000',.25);for(let y=e.y-4.5;y>a.y+20;y-=4.5)c.fillRect(a.x,y,e.x-a.x,.6);
    for(const [px,pw] of [[60,70],[160,90],[268,40]]){K.tin(c,a.x+px,a.y+2,pw,26+r()*8,{base:sh(['#45413e','#52443a','#48443f'][(r()*3)|0],1.1),seed:px*3,pal:P,rust:3});}
    K.boards(c,a.x+0,a.y+2,a.x+58,a.y+30,{base:sh('#382c22',1.1),bw:9,seed:61,foot:4,pal:P});K.boards(c,a.x+232,a.y+2,a.x+266,a.y+34,{base:sh('#342a20',1.1),bw:9,seed:63,foot:4,pal:P});
    // (the stones it is patched with, set in it: since V118 each in its bed of mortar, squared off, where they were pale rounds
    // lying on the bricks)
    for(let i=0;i<6;i++){const sx=a.x+20+r()*(e.x-a.x-40),sy=e.y-10-r()*24,sw=5+r()*4,shh=3+r()*2;c.fillStyle=rgba('#000000',.4);K.blob(c,sx,sy+.4,sw+1.2,shh+1.1,r,9);c.fill();
      c.fillStyle=sh(['#4a4640','#423e3a','#544e46'][(r()*3)|0],1.2);K.blob(c,sx,sy,sw,shh,r,9);c.fill();c.fillStyle=rgba(P.light,.04+.14*P.lightA);c.fillRect(sx-sw*.5,sy-shh*.7,sw,.8);}
    c.fillStyle=lin(c,0,a.y,0,e.y,[[0,rgba('#000000',0)],[1,rgba('#000000',.35)]]);c.fillRect(a.x,a.y,e.x-a.x,e.y-a.y);c.restore();}
  // the coping: planks along its top (seen from above), bottles along it
  {const t0=Q(x0-4,h,d-4),t1=Q(x1+4,h,d-4),t2=Q(x1+4,h,d+6),t3=Q(x0-4,h,d+6);c.fillStyle=K.topLit(P,'#3e3226',.9);K.poly(c,[t0,t1,t2,t3]);c.fill();
    c.fillStyle=sh('#241a12');c.fillRect(t0.x,t0.y,t1.x-t0.x,3);c.fillStyle=rgba('#000000',.3);for(let x=x0+40;x<x1;x+=64+r()*20){const p=Q(x,h,d-4),q=Q(x,h,d+6);c.fillRect(p.x,q.y,1,p.y-q.y);}
    for(const bx of [652,664,792,808,820]){const p=Q(bx,h,d);c.save();zoom(c,p.x,p.y,1.8);c.fillStyle=sh(r()<.5?'#24402a':'#40321a');c.fillRect(p.x-1.6,p.y-9,3.2,9);c.fillRect(p.x-.7,p.y-12,1.4,3);c.fillStyle=rgba(P.light,.1+.35*P.lightA);c.fillRect(p.x-1,p.y-8,.7,6);c.restore();}}}
// the fence on the right: planks between posts running back to the yard wall, the gateway in it under a little roof, the gate's planks
// and its brace, the latch; seen from outside the yard, as the yard is seen
function fence(c,P){const Yd=Y(),G=Yd.gate,sh=(col,k)=>K.shade(P,col,k),x=FENCE.x,h=FENCE.h,dB=Yd.wall.d,g0=G.d-G.w/2,g1=G.d+G.w/2,r=rng(71);
  const face=(d0,d1,h0,h1,col)=>{c.fillStyle=col;K.poly(c,[Q(x,h0,d0),Q(x,h0,d1),Q(x,h1,d1),Q(x,h1,d0)]);c.fill();};
  for(const [d0,d1] of [[g1+5,dB],[-30,g0-5]]){face(d0,d1,0,h,sh('#342a1e',1.1));
    c.strokeStyle=rgba('#000000',.4);c.lineWidth=1.48;c.beginPath();for(let d=d0;d<d1;d+=7){const a=Q(x,0,d),e=Q(x,h-(r()<.3?4:0),d);c.moveTo(a.x,a.y);c.lineTo(e.x,e.y);}c.stroke();
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
    c.save();K.poly(c,[fp,bp,br,fr]);c.clip();c.strokeStyle=rgba('#000000',.3);c.lineWidth=1.51;c.beginPath();for(let k=1;k<6;k++){const a=Q(x+ex*k/6,lerp(rh,eh,k/6),d0),e=Q(x+ex*k/6,lerp(rh,eh,k/6),d1);c.moveTo(a.x,a.y);c.lineTo(e.x,e.y);}c.stroke();
      c.fillStyle=rgba('#7a3a18',.3);K.poly(c,[Q(x+ex*.5,lerp(rh,eh,.5),d0),Q(x+ex*.5,lerp(rh,eh,.5),d1),br,fr]);c.fill();c.restore();
    c.fillStyle=sh('#2a2018',1.2);K.poly(c,[fl,fp,fr]);c.fill();c.fillStyle=sh('#1a1410',1.3);K.poly(c,[Q(x-ex+3,eh+1,d0),Q(x,rh-3,d0),Q(x+ex-3,eh+1,d0)]);c.fill();
    c.strokeStyle=rgba(P.light,.12+.4*P.lightA);c.lineWidth=1;c.beginPath();c.moveTo(fl.x,fl.y);c.lineTo(fp.x,fp.y);c.lineTo(bp.x,bp.y);c.stroke();}
  {const p=Q(x+GLAMP.dx,GLAMP.h,g0+GLAMP.dd);c.strokeStyle=sh('#1a1612');c.lineWidth=1.51;c.beginPath();c.moveTo(p.x,p.y-16);c.lineTo(p.x,p.y-7);c.stroke();K.lantern(c,P,p.x,p.y-8,.75,P.key==='night'||P.key==='dusk');}}
// beyond the fence: the lane out, and the first of the stair-streets going up the Pit's wall, shacks along it
function beyond(c,P){const sh=(col,k)=>K.shade(P,col,k),r=rng(91);
  const x0=900,y0=262,steps=12;c.fillStyle=sh('#262220',1.1);c.beginPath();c.moveTo(x0,y0+4);for(let i=0;i<=steps;i++){c.lineTo(x0+i*20,y0-i*10);c.lineTo(x0+i*20+20,y0-i*10);}c.lineTo(x0+steps*20+40,y0+50);
  for(let x=x0+steps*20+40;x>x0;x-=14)c.lineTo(x,y0+8+Math.min(42,(x-x0)*.2)*(.6+.4*r()));c.closePath();c.fill();
  for(let i=0;i<steps;i++){c.fillStyle=K.topLit(P,'#423c36',.9);c.fillRect(x0+i*20,y0-i*10-3,20,3);c.fillStyle=rgba('#000000',.3);c.fillRect(x0+i*20,y0-i*10,20,1);}
  c.strokeStyle=sh('#1e1a16');c.lineWidth=1.48;c.beginPath();for(let i=0;i<=steps;i+=2){c.moveTo(x0+i*20+6,y0-i*10);c.lineTo(x0+i*20+6,y0-i*10-24);}c.moveTo(x0+6,y0-24);c.lineTo(x0+steps*20+6,y0-steps*10-24);c.stroke();
  for(let i=1;i<steps;i+=3){const sx=x0+i*20,sy=y0-i*10-40;c.fillStyle=sh(K.SHACK[(r()*K.SHACK.length)|0],1.1);c.fillRect(sx,sy-30,46,34);c.fillStyle=K.topLit(P,'#46403a');c.fillRect(sx-3,sy-33,52,4);
    const lw=r()<P.win*2;c.fillStyle=lw?'#e8a860':'#0e0c0c';c.fillRect(sx+8,sy-22,8,6);c.fillStyle='#0a0808';c.fillRect(sx+28,sy-20,9,24);}}
// a fire in a drum in the lane outside the gate (its flames are live)
const DRUM={x:968,d:96,k:1.8};
function drumFire(c,P){const p=Q(DRUM.x,0,DRUM.d);c.save();zoom(c,p.x,p.y,DRUM.k);barrel(c,P,p.x,p.y,11,28,'#3a2a22',true);c.fillStyle='#120a06';c.beginPath();c.ellipse(p.x,p.y-28,9.4,2.8,0,0,TAU);c.fill();
  c.fillStyle=rgba('#ff8a3c',.5*P.fire);c.beginPath();c.ellipse(p.x,p.y-28,7,1.8,0,0,TAU);c.fill();
  for(let i=0;i<4;i++){c.fillStyle=rgba('#ffb25e',.4);c.fillRect(p.x-6+i*4,p.y-20,2,2);}c.restore();}
// ---------- the ground ----------
// the puddles: x, d, how wide, their dice (the ground paints them; live() moves the light on the big ones and rings them underfoot)
const PUDS=[[612,40,26,3],[548,96,18,5],[420,58,14,7],[150,112,16,9],[300,20,30,11],[82,62,22,13],[772,150,12,15],[740,72,10,17],
  [316,-18,20,21],[748,-264,17,23],[128,-392,24,25],[556,-196,13,27],[264,-412,13,29]];
// the run of water from the trough's end to the big puddle, on the floor (x, d): its path, and a point u of the way along it
const RILL=[[633,120],[648,104],[632,86],[638,70],[618,54]];
function rill(c){c.moveTo(RILL[0][0],RILL[0][1]);for(let i=1;i<RILL.length-1;i++)c.quadraticCurveTo(RILL[i][0],RILL[i][1],(RILL[i][0]+RILL[i+1][0])/2,(RILL[i][1]+RILL[i+1][1])/2);c.lineTo(RILL[RILL.length-1][0],RILL[RILL.length-1][1]);}
function rillAt(u){const n=RILL.length-1,f=clamp(u,0,.9999)*n,i=f|0,k=f-i;return[lerp(RILL[i][0],RILL[i+1][0],k),lerp(RILL[i][1],RILL[i+1][1],k)];}
// packed dirt, darker toward the walls and toward us; the path worn from the door to the pump to the gate; ruts in from the gate;
// puddles holding the light; straw and feathers off the roof; stones
function ground(c,P){const Yd=Y(),far=Yd.far,X0=-200,X1=1200,r=rng(101),night=P.key==='night';
  const pts=[Q(X0,0,far+40),Q(X1,0,far+40),Q(X1,0,YNEAR),Q(X0,0,YNEAR)];
  c.fillStyle=lin(c,0,pts[0].y,0,GB+60,[[0,P.dirt[0]],[.55,mix(P.dirt[0],P.dirt[1],.5)],[1,P.dirt[1]]]);K.poly(c,pts);c.fill();
  c.save();K.poly(c,pts);c.clip();K.mottle(c,X0,pts[0].y,X1,YFOOT+5,night?.2:.3,{sc:1.3,sy:.55});c.transform(1,0,PSX,-PSY,0,GB);
  const tx=typeof EnvTex!=='undefined'?EnvTex.plaster(57,128,128,{base:'#808080'}):null;
  if(tx){const pt=c.createPattern(tx,'repeat');if(pt.setTransform)pt.setTransform(new DOMMatrix().scale(.7,.35));c.globalCompositeOperation='multiply';c.globalAlpha=.55;c.fillStyle=pt;c.fillRect(X0,YNEAR-10,X1-X0,far+50-YNEAR);c.globalCompositeOperation='source-over';c.globalAlpha=1;}
  for(let i=0;i<900;i++){const x=X0+r()*(X1-X0),d=-60+r()*(far+90),v=r();c.fillStyle=v<.5?rgba('#000000',.1+.14*r()):rgba(P.light,.03+.07*r()*(.4+P.lightA));c.fillRect(x,d,.8+r()*2.4,.6+r()*1.4);}
  // (more of it, finer, over the whole floor, since V82: the packed dirt read as one flat fill near us)
  {const rf=rng(103);for(let i=0;i<1800;i++){const x=X0+rf()*(X1-X0),d=E.NEAR+rf()*(far+40-E.NEAR),v=rf();c.fillStyle=v<.5?rgba('#000000',.08+.1*rf()):rgba(P.light,.025+.05*rf()*(.4+P.lightA));c.fillRect(x,d,.7+rf()*1.6,.5+rf()*.9);}}
  // (and since V117, for the shots that come in close: the packed dirt's own unevenness, in the floor's plane, between the grit and
  // the big mottle: the ground before the door read as one flat fill at a third of the old distance)
  K.mottle(c,X0,YNEAR-10,X1,far+50,night?.24:.42,{sc:.8,sy:.8});
  // (what feet and buckets have left in it: scuffs, a hand long, dark where they cut and light where they piled; small stones)
  {const rq=rng(107);c.lineCap='round';for(let i=0;i<620;i++){const x=X0+140+rq()*(X1-X0-280),d=E.NEAR+rq()*(far+20-E.NEAR),a=(rq()-.5)*.9,l=3+rq()*6,dk=rq()<.6;
      c.strokeStyle=dk?rgba('#000000',.09+.09*rq()):rgba(P.light,.04+.07*rq()*(.4+P.lightA));c.lineWidth=1.6+rq()*1.4;c.beginPath();c.moveTo(x,d);c.quadraticCurveTo(x+Math.cos(a)*l*.5,d+Math.sin(a)*l*.5+1.2,x+Math.cos(a)*l,d+Math.sin(a)*l);c.stroke();}
    c.lineCap='butt';
    for(let i=0;i<260;i++){const x=X0+140+rq()*(X1-X0-280),d=E.NEAR+rq()*(far+20-E.NEAR),rr=1+rq()*1.5;c.fillStyle=K.shade(P,['#5a5246','#4a4238','#6a6052'][(rq()*3)|0],1.05);c.beginPath();c.ellipse(x,d,rr,rr*.9,0,0,TAU);c.fill();
      c.fillStyle=rgba('#000000',.16);c.beginPath();c.ellipse(x+.6,d-rr*.8,rr,rr*.5,0,0,TAU);c.fill();}}
  // (the grit runs on toward us in front of the fight, a little coarser for being near; its own dice)
  {const rn=rng(102);for(let i=0;i<2400;i++){const x=X0+rn()*(X1-X0),d=E.NEAR+rn()*(-60-E.NEAR),v=rn();c.fillStyle=v<.55?rgba('#000000',.12+.16*rn()):rgba(P.light,.03+.06*rn()*(.4+P.lightA));c.fillRect(x,d,1+rn()*3,.8+rn()*1.8);}}
  // (and on down the south to the picture's own foot, past where the kit's ground stops: the same grit and stones, their own dice)
  {const rn=rng(104),N=E.NEAR;for(let i=0;i<1300;i++){const x=X0+rn()*(X1-X0),d=YNEAR+rn()*(N-YNEAR),v=rn();c.fillStyle=v<.55?rgba('#000000',.12+.16*rn()):rgba(P.light,.03+.06*rn()*(.4+P.lightA));c.fillRect(x,d,1+rn()*3,.8+rn()*1.8);}
    for(let i=0;i<110;i++){const x=X0+140+rn()*(X1-X0-280),d=YNEAR+rn()*(N-YNEAR),rr=1+rn()*1.5;c.fillStyle=K.shade(P,['#5a5246','#4a4238','#6a6052'][(rn()*3)|0],1.05);c.beginPath();c.ellipse(x,d,rr,rr*.9,0,0,TAU);c.fill();}}
  // the path, packed harder, and the ruts in from the gate
  c.strokeStyle=rgba(jm2(P.dirt[0],'#d8ccb8',.2),night?.05:.13);c.lineCap='round';c.lineJoin='round';c.lineWidth=20;c.beginPath();c.moveTo(Yd.door.x,Yd.step.d-14);c.quadraticCurveTo(330,150,Yd.pump.x-24,Yd.pump.d-4);c.quadraticCurveTo(700,100,FENCE.x,Yd.gate.d);c.stroke();
  c.lineWidth=8;c.strokeStyle=rgba(jm2(P.dirt[0],'#d8ccb8',.2),night?.03:.08);c.beginPath();c.moveTo(Yd.sidestair.x1+6,Yd.sidestair.d-6);c.quadraticCurveTo(180,140,Yd.pump.x-30,Yd.pump.d-4);c.stroke();
  c.strokeStyle=rgba('#000000',.2);c.lineWidth=2;for(const off of [-12,12]){c.beginPath();c.moveTo(FENCE.x+30,Yd.gate.d+off);c.quadraticCurveTo(700,Yd.gate.d+off*1.4-20,560,60+off);c.stroke();}
  // (since V118, more in the dirt than grit) flagstones let into it before the step, worn and sunk, dark in their joints
  {const rf2=rng(131),D=Yd.door;for(const [fx,fd,fw,fh] of [[-26,190,26,13],[2,192,30,12],[-34,174,22,13],[-10,176,28,13],[20,177,24,12],[-22,159,26,12],[6,161,30,12],[-4,145,24,11],[24,147,20,10],[10,131,22,10]]){
      const x=D.x+fx+(rf2()-.5)*3,d=fd+(rf2()-.5)*2,pts=[[x+rf2()*2,d+rf2()*1.5],[x+fw-rf2()*2,d+rf2()*2],[x+fw-rf2()*2.5,d+fh-rf2()*2],[x+rf2()*2.5,d+fh-rf2()*1.5]];
      c.fillStyle=rgba('#000000',.3);c.beginPath();pts.forEach(([px,pd],i)=>i?c.lineTo(px+.8,pd-1.3):c.moveTo(px+.8,pd-1.3));c.closePath();c.fill();
      c.fillStyle=K.jm(K.shade(P,['#4c4840','#45413a','#544e44'][(rf2()*3)|0],1.1),P.dirt[0],.3);c.beginPath();pts.forEach(([px,pd],i)=>i?c.lineTo(px,pd):c.moveTo(px,pd));c.closePath();c.fill();
      c.fillStyle=rgba(P.light,.03+.1*P.lightA);c.fillRect(x+3,d+fh-3,fw-7,1);
      if(rf2()<.5){c.strokeStyle=rgba('#000000',.26);c.lineWidth=1.75;c.beginPath();c.moveTo(x+fw*(.3+rf2()*.4),d+1.5);c.lineTo(x+fw*(.3+rf2()*.4),d+fh-2);c.stroke();}}}
  // dry cracks in the packed dirt
  {const rk=rng(137);c.strokeStyle=rgba('#000000',.13);c.lineWidth=1.75;c.lineJoin='round';c.beginPath();for(const [kx,kd] of [[370,70],[690,128],[236,96],[470,150]])for(let b=0;b<3;b++){let x=kx+(rk()-.5)*30,d=kd+(rk()-.5)*18,a=rk()*TAU;c.moveTo(x,d);
        for(let i=0;i<4;i++){a+=(rk()-.5)*1.6;x+=Math.cos(a)*(4+rk()*5);d+=Math.sin(a)*(2+rk()*3);c.lineTo(x,d);}}c.stroke();}
  // where no one walks the dirt is green with trodden weed: along the fence, under the yard wall, at the front corners
  {const rg2=rng(141);for(const [gx,gd,gr] of [[838,186,24],[832,40,26],[700,206,30],[610,208,18],[60,204,22],[-60,60,50],[980,60,50],[330,214,26],[420,216,18]]){c.fillStyle=rgba(K.shade(P,'#4c5632'),.3);K.blob(c,gx,gd,gr,gr*.45,rg2,12);c.fill();
      c.fillStyle=rgba(K.shade(P,'#5a643a'),.2);K.blob(c,gx+3,gd,gr*.6,gr*.3,rg2,9);c.fill();
      c.strokeStyle=rgba(K.shade(P,'#34452a'),.45);c.lineWidth=1.75;c.beginPath();for(let i=0;i<gr*.7;i++){const a=rg2()*TAU,rr=Math.sqrt(rg2()),x=gx+Math.cos(a)*gr*.95*rr,d=gd+Math.sin(a)*gr*.42*rr;c.moveTo(x,d);c.lineTo(x+(rg2()-.5)*2.4,d+2.2+rg2()*2);}c.stroke();}}
  // the prints of boots where the dirt is soft: before the pump, at the trough's end, in the gateway
  {const rb=rng(143);c.fillStyle=rgba('#000000',.13);for(const [bx,bd,n,ang] of [[494,104,7,.3],[604,112,5,-.5],[818,118,7,.1],[470,132,4,2.6]])for(let i=0;i<n;i++){const u=(i-n/2)*9+(rb()-.5)*4,sd2=(i%2?1:-1)*3.2,x=bx+Math.cos(ang)*u-Math.sin(ang)*sd2*1.6,d=bd+Math.sin(ang)*u*.45+Math.cos(ang)*sd2;
      c.save();c.translate(x,d);c.rotate(ang*.45+(rb()-.5)*.3);c.beginPath();c.ellipse(0,0,3.4,1.25,0,0,TAU);c.ellipse(-4.6,0,1.5,1.05,0,0,TAU);c.fill();c.restore();}}
  // the trough's overflow, running off down the yard to the big puddle (its glints are live)
  {c.lineCap='round';c.strokeStyle=rgba('#050403',.2);c.lineWidth=5;c.beginPath();rill(c);c.stroke();c.strokeStyle=K.jm(K.jm(P.dirt[1],'#000000',.5),P.key==='night'?'#2a2430':K.jm(P.air[0],P.light,.25),.1+.1*P.lightA);c.lineWidth=2.2;c.beginPath();rill(c);c.stroke();c.lineCap='butt';}

  // damp patches, darker
  for(const [px,pd,pr] of [[560,104,40],[180,170,46],[700,40,50],[380,30,40]]){c.fillStyle=rgba('#000000',.1);K.blob(c,px,pd,pr,pr*.7,rng(px));c.fill();}
  // the edge under the walls dark
  c.fillStyle=lin(c,0,far-50,0,far+10,[[0,rgba('#000000',0)],[1,rgba('#000000',.4)]]);c.fillRect(X0,far-50,X1-X0,60);
  // by day and by morning the sun's shadows across it: long and soft, thrown from the shacks and poles off on its side, running away
  // from it a little toward us (the kit's sun; since V82)
  {const S2=K.sun();if(S2){const sx=S2.x<500?1:-1,rs2=rng(117);for(let q=0;q<7;q++){const d0=-50+rs2()*(far+30),x0=sx>0?X0+rs2()*520:X1-rs2()*520,len=240+rs2()*380,w=10+rs2()*26,x1=x0+sx*len;
      const g=c.createLinearGradient(x0,0,x1,0);g.addColorStop(0,rgba('#121824',.2+.08*rs2()));g.addColorStop(.7,rgba('#121824',.08));g.addColorStop(1,rgba('#121824',0));c.fillStyle=g;
      c.beginPath();c.moveTo(x0,d0);c.lineTo(x1,d0-len*.1);c.lineTo(x1,d0-len*.1-w*1.8);c.lineTo(x0,d0-w);c.closePath();c.fill();}}}
  // grain thrown down for the birds, where they peck by the crates (since V117; the straw's colour)
  {const rg=rng(109);c.fillStyle=rgba('#c8a050',night?.25:.5);for(let i=0;i<80;i++){const a2=rg()*TAU,rr=Math.sqrt(rg())*34;c.fillRect(642+Math.cos(a2)*rr*1.3,138+Math.sin(a2)*rr*.6,2,2);}}
  // puddles, the biggest away from the middle of the yard
  for(const [px,pd,pr,sd] of PUDS)K.puddle(c,P,px,pd,pr,sd,1);
  // stones lying half in the dirt, the light on their far side and their shade on the near (since V118)
  {const rst=rng(139);for(const [cx,cd,n,sp] of [[812,92,5,20],[676,198,4,16],[112,44,5,22],[404,196,3,12],[560,36,4,24],[250,206,3,10]])for(let i=0;i<n;i++){const x=cx+(rst()-.5)*sp*2,d=cd+(rst()-.5)*sp,rx=2.2+rst()*3.2,rd=rx*(.55+rst()*.25);
      c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(x+.8,d-rd*.5,rx*1.1,rd,0,0,TAU);c.fill();
      c.fillStyle=K.shade(P,['#5e584e','#4e4840','#6a6458'][(rst()*3)|0]);K.blob(c,x,d,rx,rd,rst,8);c.fill();
      c.fillStyle=rgba(P.light,.06+.2*P.lightA);c.beginPath();c.ellipse(x-rx*.15,d+rd*.35,rx*.6,rd*.35,0,0,TAU);c.fill();}}
  // straw blown off the roof, feathers, stones
  c.strokeStyle=rgba('#c8a050',.4);c.lineWidth=1.18;c.beginPath();for(let i=0;i<140;i++){const x=-80+r()*700,d=150+r()*90,a=r()*TAU;c.moveTo(x,d);c.lineTo(x+Math.cos(a)*4,d+Math.sin(a)*4);}c.stroke();
  for(let i=0;i<40;i++){const x=X0+200+r()*1000,d=r()*far;c.fillStyle=r()<.5?rgba('#c8c8d0',.4):rgba('#8a8a94',.4);c.fillRect(x,d,2.2,.8);}
  for(let i=0;i<70;i++){const x=X0+r()*(X1-X0),d=-40+r()*(far+40);c.fillStyle=K.shade(P,['#4e4840','#423c34','#5a544a'][(r()*3)|0]);c.beginPath();c.ellipse(x,d,1.4+r()*2.4,1+r()*1.6,0,0,TAU);c.fill();}
  southFloor(c,P);
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
    c.strokeStyle=rgba('#000000',.4);c.lineWidth=1.48;const m=Q((x0+x1)/2+6,hh,d0),m2=Q((x0+x1)/2-4,hh,d1-6);c.beginPath();c.moveTo(m.x,m.y);c.lineTo(m2.x,m2.y);c.stroke();
    c.fillStyle=rgba(P.light,.08+.3*P.lightA);K.poly(c,[Q(x0,hh,d0),Q(x1,hh,d0),Q(x1,hh-1.2,d0),Q(x0,hh-1.2,d0)]);c.fill();}
  // green where the walls' feet stay damp (since V118): the Sump's, the woodshed's, the yard wall's
  {const rm=rng(151),Wl=Yd.wall;for(let i=0;i<64;i++){const yw=i>=44,x=yw?Wl.x0+4+rm()*(FENCE.x-Wl.x0-8):22+rm()*580,p=Q(x,rm()*rm()*(yw?10:15),yw?Wl.d:far);if(!yw&&x>146&&x<206)continue;
      c.fillStyle=rgba(sh('#46553a'),.1+.17*rm());K.blob(c,p.x,p.y,2.5+rm()*5,1.5+rm()*3.5,rm,7);c.fill();}}
  // junk heaped at the front corners, past where anyone walks
  heap(c,P,880,1060,-6,40,9);}
// The things that stand along the walls (they were part of along() until V118): the chopping block, the crate of bottles, the
// broom and the washtub, the rain barrel, the tyres, the drum and the cartwheel at the yard wall, the firewood. Painted twice:
// into the picture under its light, and again over it (crisp, below). Each throws its shape on the wall behind it.
function wallThings(c,P){const Yd=Y(),far=Yd.far,sh=(col,k)=>K.shade(P,col,k),r=rng(113),ls=-(sunDir()||1),LA=P.lightA;
  // a chopping block with the axe in it and kindling, along the wall past the step: its bark, the saw's rings and the axe's cuts in
  // its top, the edge of the axe
  {const p=Q(600,0,204),bw=10.5,bh=18,ty=p.y-bh;c.save();zoom(c,p.x,p.y,1.9);
    thrown(c,P,6,2.5,()=>{c.beginPath();c.rect(p.x-bw,ty-3,bw*2,bh+3);});
    c.fillStyle=rgba('#000000',.4);c.beginPath();c.ellipse(p.x-ls*2,p.y+.5,bw+4,4,0,0,TAU);c.fill();
    c.fillStyle=lin(c,p.x+ls*bw,0,p.x-ls*bw,0,[[0,sh('#3e2e1e',1.1)],[.25,K.topLit(P,'#4a3824',.7)],[.6,sh('#35271a')],[1,sh('#2a1e14',1.5)]]);
    c.beginPath();c.moveTo(p.x-bw,ty);c.lineTo(p.x-bw,p.y);c.ellipse(p.x,p.y,bw,3.2,0,Math.PI,0,true);c.lineTo(p.x+bw,ty);c.closePath();c.fill();
    c.strokeStyle=rgba('#000000',.28);c.lineWidth=1.5;c.beginPath();for(let k=0;k<5;k++){const u=Math.sin((-.5+(k+.5)/5)*Math.PI)*bw;c.moveTo(p.x+u,ty+2);c.lineTo(p.x+u+(r()-.5)*1.2,p.y+1.5);}c.stroke();
    c.fillStyle=sh('#33251a');c.beginPath();c.ellipse(p.x,ty,bw,3.4,0,0,TAU);c.fill();c.fillStyle=K.topLit(P,'#8a6c48',1);c.beginPath();c.ellipse(p.x,ty,bw-1.2,2.8,0,0,TAU);c.fill();
    c.fillStyle=rgba('#3a2412',.3);c.beginPath();c.ellipse(p.x,ty,bw*.5,1.5,0,0,TAU);c.fill();
    c.strokeStyle=rgba('#22140a',.5);c.lineWidth=1.5;c.beginPath();c.moveTo(p.x-6.5,ty-.4);c.lineTo(p.x-1.5,ty+1.1);c.moveTo(p.x+3,ty+1.5);c.lineTo(p.x+7.5,ty+.3);c.stroke();
    c.strokeStyle=sh('#6a543a');c.lineWidth=2.2;c.lineCap='round';c.beginPath();c.moveTo(p.x+2.5,ty-2);c.lineTo(p.x+16,ty-22);c.stroke();c.lineCap='butt';
    c.strokeStyle=rgba(P.light,.12+.4*LA);c.lineWidth=1;c.beginPath();c.moveTo(p.x+2.5+ls*.7,ty-2.4);c.lineTo(p.x+16+ls*.7,ty-22.4);c.stroke();
    c.fillStyle=sh('#3c3e44');c.beginPath();c.moveTo(p.x-4.5,ty-2.4);c.lineTo(p.x+4.6,ty-7.2);c.lineTo(p.x+6.2,ty-3.2);c.lineTo(p.x+1,ty+.6);c.closePath();c.fill();
    c.strokeStyle=rgba(P.light,.3+.5*LA);c.lineWidth=1;c.beginPath();c.moveTo(p.x-4.5,ty-2.4);c.lineTo(p.x+1,ty+.6);c.stroke();
    for(let i=0;i<8;i++){const q=Q(584+r()*34,0,188+r()*13),a=(r()-.5)*1.4;c.save();c.translate(q.x,q.y);c.rotate(a);c.fillStyle=sh('#2a1e14',1.2);c.fillRect(-5,-.2,10,2);c.fillStyle=K.topLit(P,'#8a6c48',.85);c.fillRect(-5,-1.4,10,1.5);c.restore();}c.restore();}
  // a crate of empty bottles under the window, a broom against the wall, a washtub on a nail
  {const W0=Yd.window,bx=W0.x1-38,ca=Q(bx,18,far-24),ce=Q(bx+32,0,far-24);
    {const z=Q(bx,0,far-4);c.save();zoom(c,z.x,z.y,1.5);}thrown(c,P,6,3,()=>{c.beginPath();c.rect(ca.x,ca.y-15,ce.x-ca.x+4,ce.y-ca.y+15);});
    box(c,P,bx,far-24,32,20,18,'#3e3020');for(let i=0;i<6;i++){const p=Q(bx+4+i*4.6,18,far-12);c.fillStyle=sh(i%2?'#24402a':'#36301a');c.fillRect(p.x-1.4,p.y-8,2.8,8);c.fillRect(p.x-.6,p.y-11,1.2,3);c.fillStyle=rgba(P.light,.15+.3*LA);c.fillRect(p.x-.8,p.y-7,.6,5);}c.restore();
    const bp=Q(W0.x0-34,0,far-4),bq=Q(W0.x0-22,72,far-2);c.save();zoom(c,bp.x,bp.y,1.6);
    thrown(c,P,4,2,()=>{c.beginPath();c.moveTo(bp.x,bp.y-8);c.lineTo(bq.x,bq.y);},1,1.8);
    thrown(c,P,4,2,()=>{c.beginPath();c.moveTo(bp.x-6,bp.y);c.lineTo(bp.x+5,bp.y);c.lineTo(bp.x+2,bp.y-12);c.lineTo(bp.x-2,bp.y-12);c.closePath();});
    c.strokeStyle=sh('#54402c');c.lineWidth=1.6;c.beginPath();c.moveTo(bp.x,bp.y-8);c.lineTo(bq.x,bq.y);c.stroke();
    c.fillStyle=sh('#6a5632');c.beginPath();c.moveTo(bp.x-6,bp.y);c.lineTo(bp.x+5,bp.y);c.lineTo(bp.x+2,bp.y-12);c.lineTo(bp.x-2,bp.y-12);c.closePath();c.fill();
    c.strokeStyle=rgba('#000000',.26);c.lineWidth=1.5;c.beginPath();for(const k of [-1,1]){c.moveTo(bp.x+k*.9,bp.y-11);c.lineTo(bp.x+k*2.6-.5,bp.y);}c.stroke();
    c.fillStyle=sh('#2a1e14');c.fillRect(bp.x-2.4,bp.y-13.4,4.8,1.8);c.restore();
    const tp=Q(240,104,far);c.save();zoom(c,tp.x,tp.y,1.8);thrown(c,P,3,2.5,()=>{c.beginPath();c.ellipse(tp.x,tp.y,12,9,0,0,TAU);});
    c.fillStyle=sh('#3e3c3a');c.beginPath();c.ellipse(tp.x,tp.y,12,9,0,0,TAU);c.fill();c.fillStyle=sh('#2a2826',1.2);c.beginPath();c.ellipse(tp.x+1,tp.y+1,8.6,6,0,0,TAU);c.fill();
    c.strokeStyle=rgba(P.light,.1+.35*LA);c.lineWidth=.99;c.beginPath();c.ellipse(tp.x,tp.y,12,9,0,Math.PI*1.1,Math.PI*1.7);c.stroke();c.fillStyle=sh('#1a1612');c.fillRect(tp.x-1,tp.y-11,2,3);c.restore();}
  // the rain barrel under the downpipe: open and full, its hoops rusted, green up its foot; the pipe's shoe over it, the wall behind
  // it damp where the gutter has run down, the ground about it wet, a tin dipper on its rim
  {const p=Q(456,0,far-12),w=Q(456,40,far),g=Q(456,0,far),rr=13,hh=38;c.save();zoom(c,g.x,g.y,1.7);
    c.fillStyle=rgba('#0a100a',.2);K.poly(c,[{x:w.x-3,y:w.y},{x:w.x+3,y:w.y},{x:w.x+9,y:g.y},{x:w.x-10,y:g.y}]);c.fill();
    {const rm=rng(127);for(let i=0;i<7;i++){c.fillStyle=rgba(sh('#4c5a38'),.16+.2*rm());K.blob(c,w.x-7+rm()*14,lerp(w.y+8,g.y,rm()),2.5+rm()*4,2+rm()*5,rm,7);c.fill();}}
    thrown(c,P,7,3,()=>{c.beginPath();c.moveTo(p.x-rr*.86,p.y);c.quadraticCurveTo(p.x-rr*1.06,p.y-hh/2,p.x-rr*.86,p.y-hh-3);c.lineTo(p.x+rr*.86,p.y-hh-3);c.quadraticCurveTo(p.x+rr*1.06,p.y-hh/2,p.x+rr*.86,p.y);c.closePath();},1.15);
    c.fillStyle=rgba('#000000',.24);c.beginPath();c.ellipse(p.x-ls*3,p.y+2.5,rr+13,6,0,0,TAU);c.fill();
    c.fillStyle=rgba(K.jm(P.air[0],P.light,.3),.1+.2*LA);c.beginPath();c.ellipse(p.x+ls*9,p.y+4.2,6,1.3,0,0,TAU);c.fill();
    barrel(c,P,p.x,p.y,rr,hh,'#42301f',false,{seed:31,top:'water',rust:true,moss:true});
    c.strokeStyle=sh('#262220');c.lineWidth=4.6;c.beginPath();c.moveTo(w.x,w.y-2);c.lineTo(p.x+1,w.y+5.5);c.stroke();c.strokeStyle=rgba(P.light,.05+.22*LA);c.lineWidth=1;c.beginPath();c.moveTo(w.x-1.4,w.y-2);c.lineTo(p.x-.4,w.y+5.5);c.stroke();
    {const mx=p.x+ls*rr*.74,my=p.y-hh+1;c.fillStyle=sh('#3e4046');c.fillRect(mx-.75,my-2.6,1.5,6);c.fillRect(mx-2.2,my+3,4.4,4.6);c.fillStyle=rgba(P.light,.18+.5*LA);c.fillRect(mx+ls*1.2-.5,my+3.3,1,3.8);}c.restore();}
  // tyres stacked against the yard wall, a drum, a cartwheel, scrap
  {const Wl=Yd.wall,t0=Q(650,0,Wl.d-10);c.save();zoom(c,t0.x,t0.y,1.65);
    thrown(c,P,5,2,()=>{c.beginPath();for(let i=0;i<4;i++){const q=Q(650,i*9,Wl.d-10);c.moveTo(q.x+15,q.y-4.5);c.ellipse(q.x,q.y-4.5,15,5,0,0,TAU);}});
    for(let i=0;i<4;i++){const p=Q(650,i*9,Wl.d-10);c.fillStyle=sh('#141214');c.beginPath();c.ellipse(p.x,p.y-4.5,15,5,0,0,TAU);c.fill();c.strokeStyle=rgba('#4a4a52',.35);c.lineWidth=1.48;c.beginPath();c.ellipse(p.x,p.y-4.5,10,3,0,Math.PI,TAU);c.stroke();
      c.fillStyle=sh('#0a0a0c');c.beginPath();c.ellipse(p.x,p.y-6,7,2,0,0,TAU);c.fill();
      c.strokeStyle=rgba(P.light,.08+.3*LA);c.lineWidth=1;c.beginPath();c.ellipse(p.x,p.y-5.4,14.4,4.6,0,Math.PI*(ls<0?1.02:1.55),Math.PI*(ls<0?1.45:1.98));c.stroke();
      c.strokeStyle=rgba('#000000',.4);c.lineWidth=1.5;c.beginPath();for(let k=-2;k<=2;k++){const u=k/2.4;c.moveTo(p.x+u*15,p.y-4.5+5*Math.sqrt(1-u*u)-.4);c.lineTo(p.x+u*15,p.y-4.5+5*Math.sqrt(1-u*u)-3.4);}c.stroke();}
    c.restore();const dp=Q(802,0,Wl.d-12);c.save();zoom(c,dp.x,dp.y,2.1);thrown(c,P,5,2,()=>{c.beginPath();c.rect(dp.x-9.5,dp.y-32,19,31);});barrel(c,P,dp.x,dp.y,11,30,'#4e2216',true,{seed:37});c.restore();
    const wp=Q(732,26,Wl.d-6);c.save();zoom(c,wp.x,wp.y+26,1.85);const wheel=()=>{c.beginPath();c.arc(wp.x,wp.y,22,0,TAU);for(let k=0;k<10;k++){const a=k/10*TAU;c.moveTo(wp.x,wp.y);c.lineTo(wp.x+Math.cos(a)*21,wp.y+Math.sin(a)*21);}};
    thrown(c,P,4,2.5,wheel,1,2.4);c.strokeStyle=sh('#42341f');c.lineWidth=2.6;c.beginPath();c.arc(wp.x,wp.y,22,0,TAU);c.stroke();c.lineWidth=1.51;c.beginPath();for(let k=0;k<10;k++){const a=k/10*TAU;c.moveTo(wp.x,wp.y);c.lineTo(wp.x+Math.cos(a)*21,wp.y+Math.sin(a)*21);}c.stroke();
    c.strokeStyle=sh('#2a2622');c.lineWidth=1.5;c.beginPath();c.arc(wp.x,wp.y,23.4,0,TAU);c.stroke();c.strokeStyle=rgba(P.light,.1+.4*LA);c.lineWidth=1;c.beginPath();c.arc(wp.x,wp.y,23.6,Math.PI*(ls<0?1.02:1.52),Math.PI*(ls<0?1.48:1.98));c.stroke();
    c.fillStyle=sh('#261c14');c.beginPath();c.arc(wp.x,wp.y,4,0,TAU);c.fill();c.fillStyle=sh('#3a3632');c.beginPath();c.arc(wp.x,wp.y,1.6,0,TAU);c.fill();c.restore();
    for(let i=0;i<5;i++){const q=Q(826+r()*22,0,Wl.d-14-r()*16);c.fillStyle=sh(K.TINC[(r()*K.TINC.length)|0]);c.save();c.translate(q.x,q.y);c.rotate((r()-.5)*.6);c.fillRect(-12,-4,24,4);c.fillStyle=rgba(P.light,.06+.25*LA);c.fillRect(-12,-4,24,.8);c.restore();}}
  {const z=Q(SUMP.x1+9,0,far-9);c.save();zoom(c,z.x,z.y,1.3);woodpile(c,P);c.restore();}}
// The things along the walls a second time, over the light (since V118). The day's haze is light added over the whole picture, and
// it lifts every dark in it: a black tyre came out the wall's own grey-brown, a barrel against the shed could not be told from the
// boards behind it. The walls keep that haze. What stands against them is painted again on a strip of its own and laid back over
// at part strength, so that each thing keeps the light that fell on it and has its own darks again.
function crisp(c,P){const m=c.getTransform(),x0=120,x1=930,y0=170,y1=352;if(m.b||m.c||!(m.a>0))return;
  const cn=document.createElement('canvas');cn.width=Math.ceil((x1-x0)*m.a);cn.height=Math.ceil((y1-y0)*m.d);const g=cn.getContext('2d');g.setTransform(m.a,0,0,m.d,-x0*m.a,-y0*m.d);
  wallThings(g,P);c.save();c.globalAlpha=P.key==='night'?.5:.62;c.drawImage(cn,x0,y0,x1-x0,y1-y0);c.restore();cn.width=cn.height=0;}
function heap(c,P,x0,x1,d0,d1,seed){const r=rng(seed),sh=(col,k)=>K.shade(P,col,k);
  const pts=[];for(let x=x0;x<=x1;x+=12)pts.push(Q(x,8+r()*16,lerp(d1,d0,.5+(r()-.5)*.4)));const a=Q(x0,0,d0),e=Q(x1,0,d0);
  c.fillStyle=sh('#161210',1.3);c.beginPath();c.moveTo(a.x-6,a.y+5);pts.forEach(p=>c.lineTo(p.x,p.y));c.lineTo(e.x+8,e.y+5);c.quadraticCurveTo((a.x+e.x)/2,a.y+11,a.x-6,a.y+5);c.closePath();c.fill();
  for(let i=0;i<10;i++){const p=Q(lerp(x0,x1,r()),4+r()*14,lerp(d0,d1,r()));const k=r();
    if(k<.3){c.fillStyle=sh('#121012');c.beginPath();c.ellipse(p.x,p.y,13,5,(r()-.5)*.4,0,TAU);c.fill();c.fillStyle=sh('#050506');c.beginPath();c.ellipse(p.x,p.y-1,6,2,0,0,TAU);c.fill();}
    else if(k<.6){c.save();c.translate(p.x,p.y);c.rotate((r()-.5)*.8);c.fillStyle=sh(K.TINC[(r()*K.TINC.length)|0],1.2);c.fillRect(-16,-5,32,7);c.fillStyle=rgba('#7a3a18',.35);c.fillRect(-8,-5,10,7);c.restore();}
    else{c.save();c.translate(p.x,p.y);c.rotate((r()-.5)*.8);c.fillStyle=sh(['#42321f','#33251a'][(r()*2)|0],1.2);c.fillRect(-14,-2,28,4);c.restore();}}}
// which way things throw their shadows: away from the kit's sun (1: to the right, by day; -1: by morning; 0 where there is none),
// and how dark a thrown shadow lies at this time of day
const sunDir=()=>{const S2=K.sun();return S2?(S2.x<500?1:-1):0;},thrownA=P=>P.key==='night'||P.key==='dusk'?.2:.3;
// what stands against a wall throws its shape on it (since V118: the things along the yard's walls stood the walls' own tone under
// the day's haze and were lost in them): the same path again, a little along and down from the sun, in the shade's slate (stroked lw wide
// for a thing that is all line); close in under it where there is no sun
function thrown(c,P,dx,dy,path,a,lw){const sd=sunDir(),col=rgba('#0c121c',(a??1)*thrownA(P));c.save();c.translate(sd?sd*dx:0,sd?dy:dy*.6);path();if(lw){c.strokeStyle=col;c.lineWidth=lw;c.stroke();}else{c.fillStyle=col;c.fill();}c.restore();}
// a barrel standing at (x, y) on the screen: r across the middle, h high. Since V118 a round thing: staves each of its own tone
// round the bilge, iron hoops that go round it (seen a little from above, so each dips toward us), the light down the side the sun
// is on and a little thrown back up the other, the head sunk in its chime, a bung and what has run from it, the damp at its foot.
// o.top: 'head' (the head in its rim), 'lid' (two boards laid on it, a tin mug if o.mug), 'water' (open and full) or 'open' (open
// and dark); o.rust: its hoops rusted; o.moss: green up its foot; o.seed. A drum of steel if steel: its rolled ribs, its rust
function barrel(c,P,x,y,r,h,base,steel,o){o=o||{};const sh=(col,k)=>K.shade(P,col,k),rs=rng(o.seed||(Math.round(x)*7+Math.round(r)*3+1)),ls=-(sunDir()||1),LA=P.lightA,top=o.top||'head';
  const w0=r*.86,ry=r*.26,hw=q=>r*(.86+.4*q*(1-q)),yq=q=>y-h*q,ty=y-h;
  const body=()=>{c.beginPath();c.moveTo(x-w0,y);c.quadraticCurveTo(x-r*1.06,y-h/2,x-w0,ty);c.lineTo(x+w0,ty);c.quadraticCurveTo(x+r*1.06,y-h/2,x+w0,y);c.ellipse(x,y,w0,w0*.28,0,0,Math.PI);c.closePath();};
  const side=u=>{c.moveTo(x+u*w0,y+w0*.28);c.quadraticCurveTo(x+u*r*1.06,y-h/2,x+u*w0,ty);};
  c.fillStyle=rgba('#000000',.4);c.beginPath();c.ellipse(x-ls*2,y+ry*.3,r+3.5,r*.3,0,0,TAU);c.fill();
  body();c.fillStyle=lin(c,x+ls*r,0,x-ls*r,0,[[0,sh(base,1.2)],[.2,K.topLit(P,base,.95)],[.5,sh(base,.95)],[.82,sh(base,1.6)],[1,sh(base,1.25)]]);c.fill();
  c.save();body();c.clip();
  if(!steel){const n=clamp(Math.round(r*.45),5,7),U=[];for(let k=0;k<=n;k++)U.push(Math.sin((-.5+k/n)*Math.PI));
    for(let k=0;k<n;k++){c.fillStyle=rs()<.5?rgba('#000000',.04+.13*rs()):rgba(P.light,.02+.07*rs()*(.4+LA));
      c.beginPath();side(U[k]);c.lineTo(x+U[k+1]*w0,ty);c.quadraticCurveTo(x+U[k+1]*r*1.06,y-h/2,x+U[k+1]*w0,y+w0*.28);c.closePath();c.fill();}
    c.strokeStyle=rgba('#000000',.26);c.lineWidth=1.5;c.beginPath();for(let k=1;k<n;k++)side(U[k]);c.stroke();
    if(o.bung!==false){const bx=x+ls*r*.24,by=yq(.52);c.fillStyle=rgba('#000000',.17);c.beginPath();c.moveTo(bx-1.2,by);c.lineTo(bx+1.2,by);c.lineTo(bx+2.2,by+h*.3);c.lineTo(bx-1.7,by+h*.3);c.closePath();c.fill();
      c.fillStyle='#120c08';c.beginPath();c.ellipse(bx,by,1.6,1.9,0,0,TAU);c.fill();c.fillStyle=sh('#5e4a34');c.beginPath();c.ellipse(bx-ls*.15,by+.1,1.15,1.4,0,0,TAU);c.fill();}}
  else{for(let i=0;i<4;i++){c.fillStyle=rgba('#8a4418',.14+.2*rs());c.fillRect(x+(-.7+rs()*1.4)*w0-1,yq(.85-rs()*.2),2+rs()*2.4,h*(.25+rs()*.4));}
    for(let i=0;i<3;i++){c.fillStyle=rgba('#7a3a14',.2+.2*rs());K.blob(c,x+(rs()-.5)*r*1.4,yq(.15+rs()*.7),2.4+rs()*3,2+rs()*2.4,rs,7);c.fill();}}
  c.fillStyle=lin(c,0,y-h*.26,0,y+ry,[[0,rgba('#000000',0)],[1,rgba('#000000',.34)]]);c.fillRect(x-r*1.1,y-h*.26,r*2.2,h*.26+ry+1);
  if(o.moss)for(let i=0;i<9;i++){c.fillStyle=rgba(sh('#46553a'),.16+.16*rs());K.blob(c,x-ls*r*(-.3+rs()*1.1),yq(rs()*rs()*.4),1.4+rs()*2.6,1+rs()*1.6,rs,7);c.fill();}
  c.strokeStyle=rgba(P.light,.06+.16*LA);c.lineWidth=1;c.beginPath();for(let i=0;i<2;i++){const sx=x+(rs()-.5)*r*1.3,sy=yq(.2+rs()*.6);c.moveTo(sx,sy);c.lineTo(sx+(rs()-.5)*4,sy-3-rs()*5);}c.stroke();
  {const iron=sh(o.rust?K.jm('#2b2622','#6a3418',.55):steel?'#2a1a14':'#2b2622'),th=Math.max(2.2,h*.066);
    for(const q of steel?[.03,.34,.66,.97]:[.08,.28,.72,.92]){const yy=yq(q),a=hw(q)+.5,b2=hw(q)*.28;
      c.strokeStyle=rgba('#000000',.24);c.lineWidth=1.5;c.beginPath();c.ellipse(x,yy+th*.8,a,b2,0,0,Math.PI);c.stroke();
      c.strokeStyle=iron;c.lineWidth=steel?1.7:th;c.beginPath();c.ellipse(x,yy,a,b2,0,0,Math.PI);c.stroke();
      c.strokeStyle=rgba(P.light,.12+.5*LA);c.lineWidth=1;c.beginPath();c.ellipse(x,yy-th*.22,a,b2,0,Math.PI*(ls<0?.6:.1),Math.PI*(ls<0?.9:.4));c.stroke();
      if(!steel){c.fillStyle=rgba('#000000',.5);c.beginPath();c.arc(x+ls*a*.45,yy+b2*.89,.8,0,TAU);c.fill();}}}
  c.restore();
  c.strokeStyle=rgba(P.light,.08+.34*LA);c.lineWidth=1;c.beginPath();c.moveTo(x+ls*(w0-.6),y-1);c.quadraticCurveTo(x+ls*(r*1.06-.6),y-h/2,x+ls*(w0-.6),ty+1);c.stroke();
  if(top==='lid'){c.fillStyle=sh(base,1.5);c.beginPath();c.ellipse(x,ty-.4,w0+2.2,ry+1,0,0,TAU);c.fill();
    c.fillStyle=K.topLit(P,'#5a4834',1);c.beginPath();c.ellipse(x,ty-2,w0+2.2,ry+1,0,0,TAU);c.fill();
    c.strokeStyle=rgba('#000000',.3);c.lineWidth=1.5;c.beginPath();c.moveTo(x-w0-1.6,ty-2);c.lineTo(x+w0+1.6,ty-2);c.stroke();
    c.fillStyle=sh('#3a2c1e',1.1);c.beginPath();c.moveTo(x-2.2,ty-2-ry*.86);c.lineTo(x+2.2,ty-2-ry*.86);c.lineTo(x+2.8,ty-2+ry*.9);c.lineTo(x-2.8,ty-2+ry*.9);c.closePath();c.fill();
    c.fillStyle=rgba(P.light,.1+.4*LA);c.fillRect(x-2.2,ty-2-ry*.86,1,ry*1.7);
    c.strokeStyle=rgba(P.light,.14+.5*LA);c.lineWidth=1;c.beginPath();c.ellipse(x,ty-2,w0+2.2,ry+1,0,Math.PI*1.05,Math.PI*1.95);c.stroke();
    if(o.mug){const mx=x-ls*w0*.46,my=ty-2.6;c.fillStyle=sh('#55565c');c.fillRect(mx-2.2,my-5,4.4,5);c.beginPath();c.ellipse(mx,my,2.2,.8,0,0,TAU);c.fill();
      c.fillStyle=K.topLit(P,'#8a8c94',1);c.beginPath();c.ellipse(mx,my-5,2.2,.8,0,0,TAU);c.fill();c.fillStyle='#16171a';c.beginPath();c.ellipse(mx,my-4.9,1.5,.5,0,0,TAU);c.fill();
      c.fillStyle=rgba(P.light,.2+.5*LA);c.fillRect(mx+ls*1.3-.5,my-4.6,1,4);c.fillStyle=sh('#55565c');c.fillRect(mx-ls*3.6-.75,my-4.2,1.5,3.2);c.fillRect(mx-ls*2.2-1.1,my-4.2,2.2,1.5);}}
  else{c.fillStyle=K.topLit(P,steel?'#4a3028':K.jm(base,'#6a5a48',.35),1.05);c.beginPath();c.ellipse(x,ty,w0+.5,ry+.3,0,0,TAU);c.fill();c.strokeStyle=rgba('#000000',.36);c.lineWidth=1.5;c.stroke();
    c.save();c.beginPath();c.ellipse(x,ty+.2,w0*.84,ry*.8,0,0,TAU);c.clip();
    if(top==='open'){c.fillStyle='#0b0806';c.fillRect(x-w0,ty-ry,w0*2,ry*2+1);}
    else if(top==='water'){c.fillStyle=K.jm(sh('#1a2226',1.2),K.jm(P.air[0],P.light,.25),.16+.2*LA);c.fillRect(x-w0,ty-ry,w0*2,ry*2+1);
      c.fillStyle=rgba(K.jm(P.air[0],P.light,.4),.16+.4*LA);c.beginPath();c.ellipse(x-ls*w0*.2,ty+ry*.46,w0*.5,ry*.2,0,0,TAU);c.fill();
      c.fillStyle=rgba('#000000',.4);c.beginPath();c.ellipse(x,ty-ry*.55,w0*.84,ry*.5,0,0,TAU);c.fill();}
    else{c.fillStyle=sh(base,1.7);c.fillRect(x-w0,ty-ry,w0*2,ry*2+1);
      c.fillStyle=K.topLit(P,steel?'#4e2e24':base,.6);c.beginPath();c.ellipse(x,ty+ry*.36,w0*.84,ry*.66,0,0,TAU);c.fill();
      if(steel){for(let i=0;i<2;i++){c.fillStyle=rgba('#8a4418',.3);K.blob(c,x+(rs()-.5)*w0,ty+ry*(.1+rs()*.5),2+rs()*2,.8+rs(),rs,7);c.fill();}
        c.fillStyle='#120c0a';c.beginPath();c.ellipse(x-ls*w0*.4,ty+ry*.3,1.7,.7,0,0,TAU);c.fill();}
      else{c.strokeStyle=rgba('#000000',.26);c.lineWidth=1.5;c.beginPath();for(const u of [-.34,.3]){c.moveTo(x+u*w0-1,ty-ry*.4);c.lineTo(x+u*w0+1,ty+ry);}c.stroke();}}
    c.restore();
    c.strokeStyle=rgba(P.light,.14+.5*LA);c.lineWidth=1;c.beginPath();c.ellipse(x,ty,w0+.5,ry+.3,0,Math.PI*1.05,Math.PI*1.95);c.stroke();}}
// a box standing on the floor at (x, d), w across, dd deep, h high: its front, its right side, its top. Since V118 a crate of
// boards: each board of its own tone, battens down its corners with their nails, the brace a board, the top's boards running back
function box(c,P,x,d,w,dd,h,base){const sh=(col,k)=>K.shade(P,col,k),A=Q(x,0,d),B=Q(x+w,0,d),Bt=Q(x+w,h,d),At=Q(x,h,d),Ct=Q(x+w,h,d+dd),Dt=Q(x,h,d+dd),Cb=Q(x+w,0,d+dd),r=rng(Math.round(x*3+d)),LA=P.lightA,n=3,fh=A.y-At.y;
  c.fillStyle=rgba('#000000',.3);K.poly(c,[Q(x-2,0,d-2),Q(x+w+4,0,d-2),Q(x+w+4,0,d+dd+2),Q(x-2,0,d+dd+2)]);c.fill();
  c.fillStyle=sh(base,1.5);K.poly(c,[B,Cb,Ct,Bt]);c.fill();c.fillStyle=K.topLit(P,base,.55);K.poly(c,[At,Bt,Ct,Dt]);c.fill();c.fillStyle=sh(base,1.1);K.poly(c,[A,B,Bt,At]);c.fill();
  for(let i=0;i<n;i++){c.fillStyle=r()<.5?rgba('#000000',.05+.1*r()):rgba(P.light,.02+.06*r()*(.4+LA));c.fillRect(A.x,At.y+fh*i/n,B.x-A.x,fh/n);}
  c.strokeStyle=rgba('#000000',.36);c.lineWidth=1.5;c.beginPath();for(let i=1;i<n;i++){c.moveTo(A.x,At.y+fh*i/n);c.lineTo(B.x,At.y+fh*i/n);}c.stroke();
  c.strokeStyle=rgba('#000000',.26);c.lineWidth=1.5;c.beginPath();for(let i=1;i<n;i++){c.moveTo(B.x,lerp(Bt.y,B.y,i/n));c.lineTo(Cb.x,lerp(Ct.y,Cb.y,i/n));}
  for(let i=1;i<4;i++){c.moveTo(lerp(At.x,Bt.x,i/4),At.y);c.lineTo(lerp(Dt.x,Ct.x,i/4),Dt.y);}c.stroke();
  c.strokeStyle=sh(base,1.4);c.lineWidth=3;c.beginPath();c.moveTo(A.x+3,A.y-1.6);c.lineTo(Bt.x-3,Bt.y+1.6);c.stroke();c.strokeStyle=rgba(P.light,.06+.2*LA);c.lineWidth=1;c.beginPath();c.moveTo(A.x+3,A.y-3);c.lineTo(Bt.x-3,Bt.y+.2);c.stroke();
  for(const bx of [A.x,B.x-3]){c.fillStyle=sh(base,1.3);c.fillRect(bx,At.y,3,fh);c.fillStyle=rgba(P.light,.06+.22*LA);c.fillRect(bx,At.y,1,fh);c.fillStyle=rgba('#000000',.5);for(let i=0;i<n;i++)c.fillRect(bx+1,At.y+fh*(i+.5)/n-.75,1.5,1.5);}
  c.fillStyle=rgba(P.light,.1+.34*LA);c.fillRect(At.x,At.y-.5,Bt.x-At.x,1);
  c.strokeStyle=rgba('#000000',.4);c.lineWidth=1.57;K.poly(c,[A,B,Bt,At]);c.stroke();}
// ---------- what grows in the yard, and what the wind moves (since V118) ----------
// Weeds and grass where no one treads: at the feet of the walls and the fence, in the gutter, round the flagstones, at the puddles'
// edges, in the junk at the front corners. GROW is the list, made once from its own dice: where each stands (x, d, and h off the
// floor), how tall, its kind (0 grass, 1 dry grass gone to seed, 2 dock: broad leaves and a rusty spike) and its blades (where each
// starts, its lean, its length, whether it takes the light). The tall ones are live: the wind moves them, so they are drawn each
// frame (plantsLive), behind everyone, which is why they stand only where no one can get behind them. The rest go into the
// picture, over its light (growth).
let GROW=null;
function grow(){if(GROW)return GROW;const Yd=Y(),far=Yd.far,Wl=Yd.wall,g=Yd.gate,r=rng(211),a=[];
  const add=(x,d,s,k,live,h)=>{const n=k===2?2+((r()*2)|0):4+((r()*3)|0),B=[];
    for(let i=0;i<n;i++)B.push({o:(r()-.5)*s*.45,a:((i+.5)/n-.5)*(k===2?.7:1.5)+(r()-.5)*.3,l:s*(k===2?.8+r()*.3:.6+r()*.5),t:r()<.4?1:0,v:r()});
    a.push({x,d,h:h||0,s,k,live:!!live,B,ph:r()*TAU,lv:r()});};
  const kind=()=>r()<.55?0:r()<.7?1:2;
  const run=(x0,x1,d,step,gaps,s0,s1)=>{for(let x=x0+r()*step;x<x1;x+=step*(.6+r()*.8)){if(gaps.some(([g0,g1])=>x>g0&&x<g1)||r()<.25)continue;add(x,d-r()*2.5,s0+r()*(s1-s0),r()<.7?0:1);}};
  run(24,466,far-1.5,13,[[136,214],[380,404],[436,476]],5.5,10);run(564,602,far-1.5,11,[],5.5,8.5);
  run(Wl.x0+4,FENCE.x-4,Wl.d-1.5,14,[[608,646],[718,770]],5.5,9.5);run(26,120,Yd.sidestair.d-3,18,[],5,8);
  for(let d=20;d<206;d+=12*(.6+r()*.8)){if(d>g.d-g.w/2-10&&d<g.d+g.w/2+10)continue;add(FENCE.x-4-r()*3,d,4+r()*5,r()<.6?0:1);}
  for(const [px,pd,pr] of PUDS){add(px-pr*.9,pd+pr*.2,3.5+r()*1.5,0);if(pr>16)add(px+pr*.8,pd+pr*.3,3.5+r()*1.5,0);}
  for(const [fx,fd] of [[142,188],[208,182],[150,160],[200,150],[186,134]])add(fx+(r()-.5)*4,fd,3.5+r()*1.5,0);
  for(let i=0;i<7;i++){const x=-160+r()*190,d=2+r()*40;add(x,d,5+r()*6,kind(),false,hillH(x,d));}for(let i=0;i<7;i++)add(890+r()*160,r()*38,5+r()*6,kind());
  // (the tall ones: against the Sump, at the woodshed's corner, along the yard wall, in the fence's corners, in the junk)
  for(const [x,d,s,k] of [[36,far-2,17,1],[100,far-2,13,2],[266,far-2,15,1],[366,far-2,14,2],[430,far-2,19,1],[598,far-2,18,2],[654,Wl.d-2,16,1],[700,Wl.d-2,13,0],[806,Wl.d-2,17,2],[842,Wl.d-3,21,1],
      [847,186,15,0],[848,62,17,1],[846,24,14,2],[22,Yd.sidestair.d-4,15,0],[-64,22,20,1],[-128,30,16,2],[948,20,19,1],[1016,26,15,2]])add(x,d,s,k,true,hillH(x,d));
  // (grass in the gutter, and one tuft on the woodshed's roof)
  for(const x of [72,168,250,334,414])add(x+(r()-.5)*10,far,3.5+r()*2.5,r()<.5?0:1,true,SUMP.eave+2);add(540,far+6,4.5,1,true,SHED.h+5);
  // (the south, since V118: along the kerb, on the heap and the bank, on the headwall's coping, at the lip, round the shed, by
  // the gully and the fire, at the stack's foot, rushes in the wet before the drain; their own dice for where, after everything
  // the old yard grows)
  {const So=SO(),rs=rng(461),D=So.drain,B=So.bank,kb=So.kerb,H=hillPts(),ridgeH=x=>{const R=H.ridge;for(let i=0;i<R.length-1;i++)if(x<=R[i][0]&&x>=R[i+1][0]){const u=(x-R[i+1][0])/(R[i][0]-R[i+1][0]);return[lerp(R[i+1][1],R[i][1],u),lerp(R[i+1][2],R[i][2],u)];}return[B.d0+30,84];};
    for(let x=toeX(kb)+14;x<So.lip[3][0]-14;x+=13*(.6+rs()*.9)){if(rs()<.3||(x>So.cart.x0-4&&x<So.cart.x1)||Math.abs(x-So.queue.x)<20)continue;add(x,kb+7+rs()*3,4.5+rs()*4.5,rs()<.65?0:1);}
    for(let x=-170;x<600;x+=26*(.5+rs())){if(rs()<.4)continue;add(x,kb-9-rs()*5,4.5+rs()*4,rs()<.6?0:1);}
    for(let i=0;i<84;i++){const d=YNEAR+30+rs()*(100-YNEAR),dx=6+rs()*150,x=toeX(d)-dx;if(x<-200)continue;add(x,d,5+rs()*7,rs()<.5?0:rs()<.75?1:2,rs()<.14,dx*.9);}
    for(let x=46;x<B.x1-8;x+=12*(.6+rs()*.9)){if(x>D.x-D.r-34&&x<D.x+D.r+34)continue;const [rd,rh]=ridgeH(x);add(x,rd+rs()*3,5+rs()*6,rs()<.6?0:1,rs()<.2,rh+1);}
    for(let x=60;x<B.x1-74;x+=13*(.6+rs()*.9)){const [rd,rh]=ridgeH(x),u=.2+rs()*.7;add(x,lerp(B.d1,rd,u),4+rs()*5,rs()<.65?0:rs()<.85?1:2,false,rh*u);}
    for(const [dx,k] of [[-76,0],[-48,1],[-20,0],[14,0],[52,0],[74,1]])add(D.x+dx,D.d+3,4.5+rs()*4,k,true,D.r*2+6.5);
    for(let x=664;x<1130;x+=24*(.5+rs())){if(rs()<.35)continue;add(x,lipAt(x)+2+rs()*7,4+rs()*5,rs()<.6?0:1,rs()<.15);}
    for(const [x,d,s2,k,lv] of [[874,-300,12,1,1],[871,-278,9,0,0],[873,-250,13,2,1],[876,-312,7,0,0],[1030,-326,10,1,1],[304,-240,10,0,0],[298,-214,8,1,0],[60,-372,9,0,0],[66,-352,12,1,1],[224,-402,8,0,0],[44,-408,10,1,1],
        [596,kb-16,11,1,0],[608,kb-56,9,0,0],[300,-196,6,0,0],[494,-118,6,1,0],[536,-28,6,0,0],[430,-70,6,0,0],[470,-200,6,0,0],[396,-262,7,1,0],[352,-332,6,0,0],[736,-246,9,1,0],[824,-262,8,0,0],[742,-352,7,0,0],[826,-340,6,1,0],
        [860,-118,7,0,0],[930,-40,8,1,0],[418,-350,7,0,0],[444,-362,6,1,0],[1010,-70,10,0,1],[1016,-130,12,1,1],[1012,-200,9,0,0],[1018,-254,13,2,1],[1060,-262,10,1,1],[1104,-264,9,0,0],[208,-374,13,1,0],[150,-382,11,1,0],[250,-390,12,1,0],
        [110,-370,10,0,0],[188,-394,9,0,0],[56,-30,7,0,0],[270,-52,6,1,0],[56,-78,8,2,0],[272,-104,7,0,0],[406,-300,6,0,0],[576,-342,6,1,0],[594,-234,7,0,0],[758,-170,6,1,0],[700,-18,6,0,0],[846,-30,7,1,0],[960,-150,8,0,0]])add(x,d,s2,k,!!lv);}
  a.still=a.filter(g=>!g.live);a.live=a.filter(g=>g.live);return GROW=a;}
// the wind in the yard: a slow push with gusts through it, the same for everything it moves; nothing where motion is reduced
const gustAt=t=>.55+.45*Math.sin(t*.37+1.3)*Math.sin(t*.11);
function windAt(t,x){if(typeof reduceMotion!=='undefined'&&reduceMotion)return 0;return gustAt(t)*(.25+.5*Math.sin(t*1.9+x*.021)+.3*Math.sin(t*3.1+x*.047+1.1));}
const GREEN=['#2f4026','#4a6634'],DRY=['#453f2a','#6c6544'],DOCK=['#2e4024','#486034'];
// the blades of the plants in list of one kind and one tone (0 the dark ones, 1 the lit), as one path to fill: each a blade's
// shape, a mark wide at its foot and drawn out to a point (a stroked hair of grass is under the drawing guide's smallest mark, and
// at that mark's width it is a worm); w(g): how far the wind has that plant
function blades(c,list,kind,tone,w){for(const g of list){if(g.k!==kind)continue;const p=Q(g.x,g.h,g.d),k=w?w(g):0;
    for(const b of g.B){if(b.t!==tone)continue;const sx=p.x+b.o,sn=Math.sin(b.a),tx=sx+sn*b.l*.8+k*b.l,ty=p.y-Math.cos(b.a)*b.l*(1-Math.abs(k)*.2),mx=sx+sn*b.l*.2+k*b.l*.3,my=p.y-b.l*.6,hw=.85+b.v*.4;
      c.moveTo(sx-hw,p.y);c.quadraticCurveTo(mx-hw*.75,my,tx,ty);c.quadraticCurveTo(mx+hw*.75,my,sx+hw,p.y);c.closePath();}}}
// plants drawn whole: the grass and the dry grass as blades (the dry with its seed at the tips), the dock as leaves and its spike
function plants(c,P,list,w){const sh=(col,k)=>K.shade(P,col,k);c.lineCap='round';c.lineJoin='round';
  for(let k=0;k<2;k++){const C0=k?DRY:GREEN;
    c.fillStyle=sh(C0[0]);c.beginPath();blades(c,list,k,0,w);c.fill();c.fillStyle=K.topLit(P,C0[1],.22);c.beginPath();blades(c,list,k,1,w);c.fill();
    if(k===1){c.fillStyle=K.topLit(P,'#7c7454',.3);for(const g of list){if(g.k!==1||g.s<9)continue;const p=Q(g.x,g.h,g.d),kk=w?w(g):0;for(const b of g.B){if(b.v<.45)continue;const sx=p.x+b.o,tx=sx+Math.sin(b.a)*b.l*.8+kk*b.l,ty=p.y-Math.cos(b.a)*b.l*(1-Math.abs(kk)*.2);
          c.beginPath();c.ellipse(tx-Math.sin(b.a)*1.2,ty+1.4,1.1,2.5,b.a+kk*.6,0,TAU);c.fill();}}}}
  for(const g of list){if(g.k!==2)continue;const p=Q(g.x,g.h,g.d),kk=w?w(g):0;
    for(let i=0;i<4;i++){const a=(i-1.5)*.62+(g.lv-.5)*.3,l=g.s*(.42+.12*((i*7+3)%4)/3),tx=p.x+Math.sin(a)*l+kk*l*.35,ty=p.y-Math.cos(a)*l*.72,nx=Math.cos(a)*l*.2,ny=Math.sin(a)*l*.2;
      c.fillStyle=i%2?K.topLit(P,DOCK[1],.25):sh(DOCK[0]);c.beginPath();c.moveTo(p.x,p.y);c.quadraticCurveTo(p.x+(tx-p.x)*.5+nx,p.y+(ty-p.y)*.5+ny,tx,ty);c.quadraticCurveTo(p.x+(tx-p.x)*.5-nx,p.y+(ty-p.y)*.5-ny,p.x,p.y);c.fill();}
    for(const b of g.B){const sx=p.x+b.o,tx=sx+Math.sin(b.a)*b.l*.5+kk*b.l,ty=p.y-b.l*(1-Math.abs(kk)*.15),mx=sx+kk*b.l*.3,my=p.y-b.l*.55;
      c.strokeStyle=sh(DOCK[0]);c.lineWidth=1.5;c.beginPath();c.moveTo(sx,p.y);c.quadraticCurveTo(mx,my,tx,ty);c.stroke();
      c.strokeStyle=sh('#6e3c24',.8);c.lineWidth=2.6;c.beginPath();c.moveTo((mx+tx)/2+(sx-mx)*.1,(my+ty)/2+1);c.lineTo(tx,ty);c.stroke();}}
  c.lineCap='butt';}
// the washing line by the woodshed: from its corner to a pole at the yard wall, short of where Dob sits, three cloths pegged on it (the pole and the line
// are painted into the picture; the cloths hang live, and lift when the wind is in them)
const LINE=()=>{const Yd=Y(),a=Q(SHED.x1-1,SHED.h-3,Yd.far),b=Q(704,152,Yd.wall.d-1);return{a,b,foot:Q(704,0,Yd.wall.d-1)};};
const lineAt=(L2,u)=>({x:lerp(L2.a.x,L2.b.x,u),y:lerp(L2.a.y,L2.b.y,u)+Math.sin(u*Math.PI)*3.5});
const HUNG=[[.1,.34,32,'#55627c',0],[.42,.58,22,'#978a70',1],[.66,.9,36,'#804c40',2]];
function clothsLive(c,t,P){const L2=LINE(),sh=(col,k)=>K.shade(P,col,k);
  for(const [u0,u1,len,col,i] of HUNG){const p0=lineAt(L2,u0),p1=lineAt(L2,u1),pm=lineAt(L2,(u0+u1)/2),w=windAt(t+i*.7,p0.x*3+i*90),dx=w*len*.5,lift=Math.abs(w)*len*.13,fl=Math.sin(t*5.3+i*2)*w*2;
    c.fillStyle=sh(col,.9);c.beginPath();c.moveTo(p0.x,p0.y);c.lineTo(pm.x,pm.y+.6);c.lineTo(p1.x,p1.y);c.quadraticCurveTo(p1.x+dx*.5,p1.y+len*.5,p1.x+dx+fl,p1.y+len-lift);
    c.quadraticCurveTo((p0.x+p1.x)/2+dx,(p0.y+p1.y)/2+len-lift+1.6+fl,p0.x+dx-fl*.5,p0.y+len-lift*.6);c.quadraticCurveTo(p0.x+dx*.5,p0.y+len*.5,p0.x,p0.y);c.fill();
    c.strokeStyle=rgba('#000000',.18);c.lineWidth=1.5;c.beginPath();c.moveTo(lerp(p0.x,p1.x,.38),lerp(p0.y,p1.y,.38)+1);c.quadraticCurveTo(lerp(p0.x,p1.x,.38)+dx*.5,lerp(p0.y,p1.y,.38)+len*.5,lerp(p0.x,p1.x,.4)+dx,lerp(p0.y,p1.y,.4)+len-lift-1.5);c.stroke();
    c.strokeStyle=rgba(P.light,.1+.34*P.lightA);c.lineWidth=1;c.beginPath();c.moveTo(p0.x,p0.y+.5);c.lineTo(pm.x,pm.y+1.1);c.lineTo(p1.x,p1.y+.5);c.stroke();
    c.fillStyle=sh('#2a2018');c.fillRect(p0.x-.75,p0.y-1.8,1.5,3.4);c.fillRect(p1.x-.75,p1.y-1.8,1.5,3.4);}}
// what grows, into the picture over its light: each plant's shade on the ground, the low ones whole; a creeper up the woodshed's
// corner; three tins of herbs on the kitchen's sill; the washing line and its pole
function growth(c,P){const Yd=Y(),far=Yd.far,sh=(col,k)=>K.shade(P,col,k),G=grow(),LA=P.lightA;
  c.fillStyle=rgba('#000000',.24);for(const g of G){if(g.h)continue;const p=Q(g.x,0,g.d);c.beginPath();c.ellipse(p.x,p.y+.3,g.s*.55+1,g.s*.12+.7,0,0,TAU);c.fill();}
  plants(c,P,G.still,null);
  {const r=rng(223),x=SHED.x1+far*PSX+1.5,y0=Q(0,0,far).y,y1=Q(0,SHED.h+4,far).y;c.strokeStyle=sh('#2e2a1c');c.lineWidth=1.5;c.beginPath();c.moveTo(x,y0);for(let y=y0-6;y>y1;y-=6)c.lineTo(x+Math.sin(y*.21)*2.4,y);c.stroke();
    for(let i=0;i<34;i++){const y=lerp(y0-4,y1,r()),lx=x+Math.sin(y*.21)*2.4+(r()-.5)*9,a=r()*TAU;c.fillStyle=r()<.35?K.topLit(P,'#48603a',.25):sh(['#2a3a22','#324428'][(r()*2)|0]);c.beginPath();c.ellipse(lx,y,2.5,1.5,a,0,TAU);c.fill();}}
  {const W0=Yd.window;for(const [tx,tc] of [[W0.x0+7,'#5a3a2c'],[W0.x0+16,'#4a4c50'],[W0.x1-9,'#5a4a34']]){const p=Q(tx,W0.y1,far);c.fillStyle=sh(tc,1.1);c.fillRect(p.x-2,p.y-4.2,4,4.4);c.fillStyle=rgba(P.light,.14+.4*LA);c.fillRect(p.x-2,p.y-4.2,1,4.4);
      c.strokeStyle=sh(GREEN[0]);c.lineWidth=1.5;c.beginPath();for(const a of [-.7,.5]){c.moveTo(p.x,p.y-4);c.quadraticCurveTo(p.x+a*2,p.y-7,p.x+a*5,p.y-9.5);}c.stroke();
      c.fillStyle=K.topLit(P,GREEN[1],.3);for(const a of [-.7,-.15,.5]){c.beginPath();c.ellipse(p.x+a*5,p.y-9.6,1.5,1,a,0,TAU);c.fill();}}}
  {const L2=LINE();c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(L2.foot.x+1.5,L2.foot.y+.4,5,1.5,0,0,TAU);c.fill();
    c.fillStyle=sh('#32281c',1.1);c.fillRect(L2.foot.x-1.4,L2.b.y-3,2.8,L2.foot.y-L2.b.y+3);c.fillStyle=rgba(P.light,.1+.34*LA);c.fillRect(L2.foot.x-1.4,L2.b.y-3,1,L2.foot.y-L2.b.y+3);
    c.strokeStyle=sh('#1c1814');c.lineWidth=1.5;c.beginPath();c.moveTo(L2.a.x,L2.a.y);for(let u=.1;u<=1.001;u+=.1){const q=lineAt(L2,u);c.lineTo(q.x,q.y);}c.stroke();}}
// ---------- the yard's south (since V118) ----------
// The yard runs on toward us, south on the Pit map, past where a fight goes (the game's layout: ACT1_PLACES.yard.south). On its
// left a bank of the quarry's spoil, gone to weed, with a storm drain's mouth in a headwall of old masonry: the yard's water runs
// down a gully to it from the big puddle, and whoever kept a pitch at it has left the cup. Along its foot a kerb of quarry blocks
// with Tarr's main lying on it, a standpipe and its valve under his blue; the lane beyond. On its right the Floor ends: the lip of
// the quarry's last cut, the hole the Sump is named for, a rail of poles along it, a hoist, a bench to look from, the keeping
// candles; and the shed standing by it. Between, a court chalked on the dirt for rondel, a fire ring, a handcart of kegs.
// What a man may stand behind is a piece (the shed, the main, the rail, the fire, the cart); the rest is in the picture.
// the run of water on from the big puddle down the yard to the drain's mouth, on the floor (x, d)
const GULLY=[[606,34],[592,6],[562,-26],[532,-64],[508,-108],[480,-154],[444,-204],[404,-252],[366,-300],[346,-350],[318,-392],[276,-402],[232,-382],[198,-346],[178,-318]];
function runOf(c,R){c.moveTo(R[0][0],R[0][1]);for(let i=1;i<R.length-1;i++)c.quadraticCurveTo(R[i][0],R[i][1],(R[i][0]+R[i+1][0])/2,(R[i][1]+R[i+1][1])/2);c.lineTo(R[R.length-1][0],R[R.length-1][1]);}
function runAt(R,u){const n=R.length-1,f=clamp(u,0,.9999)*n,i=f|0,k=f-i;return[lerp(R[i][0],R[i+1][0],k),lerp(R[i][1],R[i+1][1],k)];}
// the court chalked on the dirt for rondel
const COURT={x0:620,x1:840,d0:-132,d1:-36};
// the end of the quarry's tram road: straight in to the tipping bay at the lip, under the hoist's jib (x, d); a baulk across
// its other end
const TRACK=[[780,-398],[780,-236]];
// a chalk line on the floor: rubbed thin in places, gone in others
function chalk(c,r,x0,d0,x1,d1,a){const n=Math.max(2,Math.round(Math.hypot(x1-x0,d1-d0)/9));
  for(let i=0;i<n;i++){if(r()<.13)continue;const u0=i/n,u1=Math.min(1,(i+.75+r()*.3)/n);c.globalAlpha=a*(.5+.5*r());c.beginPath();
    c.moveTo(lerp(x0,x1,u0)+(r()-.5)*.9,lerp(d0,d1,u0)+(r()-.5)*.7);c.lineTo(lerp(x0,x1,u1)+(r()-.5)*.9,lerp(d0,d1,u1)+(r()-.5)*.7);c.stroke();}c.globalAlpha=1;}
// the lip's line at x (its depth), along the yard's edge
const sstep01=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
function lipAt(x){const L2=SO().lip;for(let i=0;i<3;i++){const a=L2[i+1],b=L2[i];if(x<=b[0]||i===0){if(x>=a[0]||i===2)return lerp(a[1],b[1],clamp((x-a[0])/(b[0]-a[0]),-.5,1.5));}}return L2[3][1];}
// The south floor, in the floor's own plane (called by ground() inside its transform): the ways worn across it, the bare rock
// coming through toward the lip, the tram road, the gully and what crosses it, the court and the hopping squares, the practice
// ground, the lane's ruts beyond the kerb, the wet before the drain and at the standpipe, ash by the fire, the handcart's ruts.
function southFloor(c,P){const So=SO(),night=P.key==='night',r=rng(301),path=rgba(jm2(P.dirt[0],'#d8ccb8',.2),night?.05:.12),LA=P.lightA,kb=So.kerb,D=So.drain;
  c.lineCap='round';c.lineJoin='round';
  // the ways: from the pump down the yard, between the court and the table, round by the wagon to the shed's door, and on down
  // to the kerb's end; past the garden, through the gap by the fire and round the bank's end to the drain; from the pump's side
  // to the fire; along the kerb to the standpipe; between the garden's beds
  c.strokeStyle=path;c.lineWidth=24;c.beginPath();c.moveTo(506,96);c.bezierCurveTo(540,50,570,-20,584,-80);c.bezierCurveTo(590,-110,588,-132,602,-146);c.bezierCurveTo(660,-154,740,-138,790,-172);c.bezierCurveTo(840,-206,836,-296,922,-336);c.stroke();
  c.lineWidth=17;c.beginPath();c.moveTo(380,16);c.bezierCurveTo(300,-40,262,-100,256,-150);c.bezierCurveTo(262,-200,318,-226,322,-290);c.bezierCurveTo(324,-340,322,-386,270,-410);c.bezierCurveTo(236,-420,196,-404,176,-368);
  c.moveTo(430,70);c.bezierCurveTo(420,10,400,-60,380,-116);c.moveTo(600,-148);c.bezierCurveTo(584,-200,582,-300,600,-392);c.stroke();
  c.lineWidth=13;c.beginPath();c.moveTo(110,kb+20);c.bezierCurveTo(240,kb+26,360,kb+18,460,kb+24);c.moveTo(58,-78);c.lineTo(270,-78);c.stroke();
  // bare rock toward the lip: the dirt thins and the quarry's floor shows, split along its bed and across it; a few slabs stand proud
  {const x0=590,x1=1210,dS=So.lip[3][1]-64,col=K.jm(K.jm(P.dirt[0],'#6a6864',.6),'#000000',.14),rr=rng(303),edge=x=>lipAt(x)+64+Math.sin(x*.05)*12+Math.sin(x*.013)*8;
    // (thinning in from the lip, and in from where the lip begins: laid in strips, each its own fade)
    for(let x=x0;x<x1;x+=8){const k=sstep01((x-x0)/130),e=edge(x),g=c.createLinearGradient(0,lipAt(x)-30,0,e+16);g.addColorStop(0,rgba(col,.95*k));g.addColorStop(.62,rgba(col,.7*k));g.addColorStop(1,rgba(col,0));c.fillStyle=g;c.fillRect(x,lipAt(x)-30,8.4,e+46-lipAt(x));}
    c.save();c.beginPath();c.moveTo(x0+40,dS);for(let x=x0+40;x<=x1;x+=20)c.lineTo(x,edge(x)-8);c.lineTo(x1,dS);c.closePath();c.clip();
    // (the bedding: long cracks that run with the lip, shorter joints across them)
    for(let i=0;i<8;i++){let x=640+rr()*150,d=lipAt(x)+5+i*7+rr()*4;c.strokeStyle=rgba('#000000',.2+.1*rr());c.lineWidth=1.75+rr()*.8;c.beginPath();c.moveTo(x,d);
      while(x<x1){x+=14+rr()*26;d=lipAt(x)+5+i*7+(rr()-.5)*5;c.lineTo(x,d);if(rr()<.2){x+=14+rr()*30;c.moveTo(x,lipAt(x)+5+i*7);}}c.stroke();}
    c.strokeStyle=rgba('#000000',.2);c.lineWidth=1.75;c.beginPath();for(let i=0;i<30;i++){const x=650+rr()*540,d=lipAt(x)+2+rr()*50,l=5+rr()*9;c.moveTo(x,d);c.lineTo(x+(rr()-.5)*6,d+l);}c.stroke();
    // (the light on the cracks' far lips)
    c.strokeStyle=rgba(P.light,.03+.07*P.lightA);c.lineWidth=1.75;c.beginPath();for(let i=0;i<14;i++){const x=660+rr()*520,d=lipAt(x)+8+rr()*44;c.moveTo(x,d);c.lineTo(x+16+rr()*30,d+(rr()-.5)*3);}c.stroke();
    for(let i=0;i<9;i++){const x=664+rr()*500,dl=lipAt(x),d=dl+6+rr()*36,w=34+rr()*44,h=10+rr()*9,pts=[[x+rr()*5,d+rr()*2],[x+w-rr()*6,d+(rr()-.5)*4],[x+w-3-rr()*8,d+h-rr()*3],[x+3+rr()*8,d+h]];
      c.fillStyle=rgba('#000000',.3);c.beginPath();pts.forEach(([px,pd],j)=>j?c.lineTo(px+1.2,pd-2.2):c.moveTo(px+1.2,pd-2.2));c.closePath();c.fill();
      c.fillStyle=K.jm(col,'#000000',.04+.1*rr());c.beginPath();pts.forEach(([px,pd],j)=>j?c.lineTo(px,pd):c.moveTo(px,pd));c.closePath();c.fill();
      c.fillStyle=rgba(P.light,.02+.05*P.lightA);c.fillRect(x+5,d+h-2.8,w-14,1.1);}
    c.restore();}
  // the tram road's end: sleepers sunk to their tops in the dirt, two rails on them two feet apart, rusted, lost under the dirt
  // in places
  {const rt=rng(321),T=TRACK,pts=[];for(let i=0;i<T.length-1;i++){const a=T[i],b=T[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(l/24));for(let k=0;k<=n;k++)pts.push([lerp(a[0],b[0],k/n),lerp(a[1],b[1],k/n),-(b[1]-a[1])/l,(b[0]-a[0])/l]);}
    c.lineCap='butt';
    for(const [x,d,nx,nd] of pts){if(rt()<.1)continue;const w=33+rt()*6;c.strokeStyle=rgba('#1c1410',.5+.2*rt());c.lineWidth=8;c.beginPath();c.moveTo(x-nx*w,d-nd*w);c.lineTo(x+nx*w,d+nd*w);c.stroke();}
    for(const sd2 of [-21,21]){const gone=i=>hsh(i*3+(sd2>0?1:0))<.12;let on=false;c.strokeStyle=K.shade(P,'#3a2a20',1.05);c.lineWidth=4.4;c.beginPath();pts.forEach(([x,d,nx,nd],i)=>{if(gone(i)){on=false;return;}on?c.lineTo(x+nx*sd2,d+nd*sd2):c.moveTo(x+nx*sd2,d+nd*sd2);on=true;});c.stroke();
      on=false;c.strokeStyle=rgba(P.light,.1+.3*LA);c.lineWidth=1.75;c.beginPath();pts.forEach(([x,d,nx,nd],i)=>{if(gone(i)||hsh(i*5+7)<.3){on=false;return;}on?c.lineTo(x+nx*sd2+1.2,d+nd*sd2+1.4):c.moveTo(x+nx*sd2+1.2,d+nd*sd2+1.4);on=true;});c.stroke();}
    c.lineCap='round';}
  // the lane beyond the kerb: two ruts along it, water standing in them, stones and weed along its far side
  {c.strokeStyle=rgba('#000000',.2);c.lineWidth=3.2;for(const d0 of [kb-34,kb-62]){c.beginPath();c.moveTo(-200,d0+6);c.bezierCurveTo(100,d0-6,380,d0+8,600,d0-2);c.stroke();}
    c.strokeStyle=rgba(P.light,.02+.05*P.lightA);c.lineWidth=1.75;for(const d0 of [kb-30,kb-58]){c.beginPath();c.moveTo(-200,d0+6);c.bezierCurveTo(100,d0-6,380,d0+8,600,d0-2);c.stroke();}
    K.puddle(c,P,426,kb-35,26,31,.9);K.puddle(c,P,214,kb-62,18,33,.8);K.puddle(c,P,70,kb-40,15,35,.8);
    const rl=rng(331);for(let i=0;i<16;i++){const x=-60+rl()*640,d=kb-84-rl()*40,gr=10+rl()*16;c.fillStyle=rgba(K.shade(P,'#4c5632'),.26);K.blob(c,x,d,gr,gr*.4,rl,10);c.fill();}
    // the lane ends at the lip: two posts and a plank across are painted with the rail
  }
  // the gully: a groove the water has cut, wet in its bed, pebbles washed along it
  {c.strokeStyle=rgba('#050403',.2);c.lineWidth=8;c.beginPath();runOf(c,GULLY);c.stroke();
    c.strokeStyle=rgba('#050403',.24);c.lineWidth=4.4;c.beginPath();runOf(c,GULLY);c.stroke();
    c.strokeStyle=K.jm(K.jm(P.dirt[1],'#000000',.5),night?'#2a2430':K.jm(P.air[0],P.light,.25),.12+.12*P.lightA);c.lineWidth=2.2;c.beginPath();runOf(c,GULLY);c.stroke();
    const rp=rng(305);for(let i=0;i<80;i++){const [x,d]=runAt(GULLY,rp()),o=(rp()-.5)*9;c.fillStyle=K.shade(P,['#5a5246','#4a4238','#6a6052'][(rp()*3)|0],1.05);c.beginPath();c.ellipse(x+o,d+o*.5,1+rp()*1.6,.9+rp()*.9,0,0,TAU);c.fill();}
    // (green along its banks where it runs slow)
    for(const u of [.1,.24,.36,.47,.58,.7,.8,.9]){const [x,d]=runAt(GULLY,u);c.fillStyle=rgba(K.shade(P,'#4c5632'),.26);K.blob(c,x+(rp()-.5)*10,d+4,12+rp()*8,5+rp()*3,rp,9);c.fill();}}
  // where the ways cross it: two planks laid over it by the old floor, flat stones set in it by the drain
  {const pl=(x,d,ax,ad)=>{const L2=34,nx=-ad*10,nd=ax*10,q=(u,v,ox,od)=>[x+ax*L2*u+nx*v+ox,d+ad*L2*u+nd*v+od];
      for(const [ox,od,col] of [[2,-3,rgba('#000000',.3)],[0,0,K.jm(K.topLit(P,'#4a3a28',.6),P.dirt[1],.2)]]){c.fillStyle=col;c.beginPath();[[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([u,v],i)=>{const p=q(u,v,ox,od);i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]);});c.closePath();c.fill();}
      c.fillStyle=rgba('#000000',.2);{const a=q(-1,.2,0,0),b=q(1,.3,0,0);c.fillRect(Math.min(a[0],b[0]),(a[1]+b[1])/2,1.75,1.75);}c.fillStyle=rgba('#000000',.34);for(const u of [-.84,.84]){const p=q(u,0,0,0);c.fillRect(p[0]-1.5,p[1]-1.5,3,3);}};
    pl(556,-18,.3,-.95);pl(577,-27,.25,-.97);
    const rs=rng(325);for(const [x,d] of [[340,-362],[329,-378],[318,-393]]){c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(x+1.5,d-2.4,14,8,0,0,TAU);c.fill();c.fillStyle=K.shade(P,'#56504a',1.05);K.blob(c,x,d,13,7.4,rs,10);c.fill();c.fillStyle=rgba(P.light,.04+.12*LA);c.beginPath();c.ellipse(x-1.5,d+2,7.4,3,0,0,TAU);c.fill();}}
  // the wet before the drain's apron: dark, silted, green where it stands; what was dragged over it and in: two furrows, close
  {const dw=D.d-D.wing;for(const [dx,dd,pr,a] of [[10,-18,60,.16],[-24,-30,40,.14],[40,-28,34,.12],[70,-8,26,.14]]){c.fillStyle=rgba('#050403',a);K.blob(c,D.x+dx,dw+dd,pr,pr*.5,rng(307+pr),12);c.fill();}
    c.fillStyle=rgba(K.shade(P,'#3c4a2c'),.3);K.blob(c,D.x+20,dw-6,56,8,rng(309),12);c.fill();
    c.strokeStyle=rgba('#050403',.24);c.lineWidth=3;for(const o of [-3.4,3.4]){c.beginPath();c.moveTo(306+o,kb+16);c.bezierCurveTo(268+o,kb+32,236+o,dw-20,D.x+34+o,dw+2);c.stroke();}
    c.strokeStyle=rgba(P.light,.03+.06*LA);c.lineWidth=1.75;c.beginPath();c.moveTo(304,kb+21);c.bezierCurveTo(266,kb+37,236,dw-15,D.x+36,dw+6);c.stroke();}
  // the wet at the standpipe and under the main's leak
  for(const [x,pr] of [[So.queue.x-30,24],[262,16]]){c.fillStyle=rgba('#050403',.2);K.blob(c,x,kb+13,pr,pr*.42,rng(329+pr),11);c.fill();}
  // the court: its lines, the well at one end and the house at the other, the middle mark; the tally beside it
  {const C0=COURT,rc=rng(311),a=night?.2:.42;c.strokeStyle=K.shade(P,'#ddd6c8',.5);c.lineWidth=2.6;c.lineCap='butt';
    chalk(c,rc,C0.x0,C0.d0,C0.x1,C0.d0,a);chalk(c,rc,C0.x0,C0.d1,C0.x1,C0.d1,a);chalk(c,rc,C0.x0,C0.d0,C0.x0,C0.d1,a);chalk(c,rc,C0.x1,C0.d0,C0.x1,C0.d1,a);
    const mx=(C0.x0+C0.x1)/2,md=(C0.d0+C0.d1)/2;chalk(c,rc,mx,C0.d0,mx,C0.d1,a);chalk(c,rc,C0.x1-38,C0.d0,C0.x1-38,C0.d1,a*.9);
    for(let i=0;i<9;i++){const a0=-Math.PI/2+i*Math.PI/9,a1=a0+Math.PI/9;chalk(c,rc,C0.x0+Math.cos(a0)*34,md+Math.sin(a0)*30,C0.x0+Math.cos(a1)*34,md+Math.sin(a1)*30,a*.9);}
    for(let i=0;i<8;i++){const a0=i*TAU/8,a1=a0+TAU/8;chalk(c,rc,mx+Math.cos(a0)*8,md+Math.sin(a0)*7,mx+Math.cos(a1)*8,md+Math.sin(a1)*7,a);}
    // (the score, in fives, off the court's far side; a ladder of squares for hopping beyond it)
    for(let g=0;g<3;g++){const tx=C0.x0+38+g*26,td=C0.d1+9;for(let i=0;i<(g<2?4:2);i++)chalk(c,rc,tx+i*3.6,td,tx+i*3.6+.8,td+8,a);if(g<2)chalk(c,rc,tx-2,td+1.5,tx+13,td+6.5,a);}
    chalk(c,rc,640,-28,820,-25,a*.9);chalk(c,rc,640,2,820,5,a*.9);for(let i=0;i<=6;i++)chalk(c,rc,640+i*30,-28+i*.5,640+i*30,2+i*.5,a*.9);
    c.lineCap='round';}
  // the practice ground: a round of sawdust and sand trodden into the dirt, room for two men to circle in, a line of lime about
  // it, scuffed through; the marks of feet turning in it
  {const G=So.ring,R2=G.r,rr=rng(323),a=night?.2:.4;c.fillStyle=rgba(K.shade(P,'#a8a092',.6),night?.1:.2);K.blob(c,G.x,G.d,R2+5,R2+5,rr,18);c.fill();c.fillStyle=rgba(K.shade(P,'#b6ae9e',.6),night?.08:.16);K.blob(c,G.x+5,G.d+3,R2*.8,R2*.78,rr,16);c.fill();
    c.fillStyle=rgba('#000000',.1);K.blob(c,G.x-8,G.d-3,R2*.42,R2*.4,rr,12);c.fill();
    c.strokeStyle=K.shade(P,'#ddd6c8',.5);c.lineWidth=3;c.lineCap='butt';for(let i=0;i<54;i++){const a0=i/54*TAU,a1=a0+TAU/54;chalk(c,rr,G.x+Math.cos(a0)*R2,G.d+Math.sin(a0)*R2,G.x+Math.cos(a1)*R2,G.d+Math.sin(a1)*R2,a);}c.lineCap='round';
    c.strokeStyle=rgba('#000000',.14);c.lineWidth=3;c.beginPath();for(let i=0;i<34;i++){const an=rr()*TAU,q=Math.sqrt(rr())*.86,x=G.x+Math.cos(an)*R2*q,d=G.d+Math.sin(an)*R2*q,a2=rr()*TAU,l=9+rr()*14;c.moveTo(x,d);c.quadraticCurveTo(x+Math.cos(a2)*l*.5+3,d+Math.sin(a2)*l*.3,x+Math.cos(a2)*l,d+Math.sin(a2)*l*.8);}c.stroke();}
  // the handcart's ruts, from the kerb's end to the shed's door: the kegs' way
  c.strokeStyle=rgba('#000000',.15);c.lineWidth=3;for(const o of [-11,11]){c.beginPath();c.moveTo(606,-398+o*.6);c.bezierCurveTo(660,-384+o*.6,720,-378+o*.6,800,-376+o*.6);c.bezierCurveTo(850,-372+o*.7,880,-356+o,914,-338+o);c.stroke();}
  // ash and char round the fire ring
  {const F=So.fire,ra=rng(313);c.fillStyle=rgba('#1a1614',.3);K.blob(c,F.x+3,F.d-2,F.r+16,(F.r+12)*.6,ra,12);c.fill();c.fillStyle=rgba('#8a857c',.22);K.blob(c,F.x-4,F.d-5,F.r+6,F.r*.6,ra,10);c.fill();
    for(let i=0;i<40;i++){const an=ra()*TAU,rr2=F.r+ra()*26;c.fillStyle=ra()<.5?rgba('#0c0a08',.4):rgba('#9a958c',.3);c.fillRect(F.x+Math.cos(an)*rr2,F.d+Math.sin(an)*rr2*.6,1.4+ra()*1.6,1+ra());}}
  // more boot prints where the ground is soft: at the gully's crossings, before the drain, on the ways, in the practice ground
  {const rb=rng(315);c.fillStyle=rgba('#000000',.13);for(const [bx,bd,n,ang] of [[326,-372,6,1.3],[236,-410,5,-.3],[420,-30,5,1.2],[700,-150,6,.1],[300,-226,5,.6],[588,-330,5,1.4],[470,-290,6,.5],[850,-300,5,1.2],[568,-40,5,1.2],[300,kb+22,6,.05],[256,-150,5,1.4],[720,-382,5,.05]])for(let i=0;i<n;i++){const u=(i-n/2)*17+(rb()-.5)*6,sd2=(i%2?1:-1)*5.6,x=bx+Math.cos(ang)*u-Math.sin(ang)*sd2*1.6,d=bd+Math.sin(ang)*u*.6+Math.cos(ang)*sd2;
      c.save();c.translate(x,d);c.rotate(ang*.45+(rb()-.5)*.3);c.beginPath();c.ellipse(0,0,6.4,2.6,0,0,TAU);c.ellipse(-8.6,0,3,2.2,0,0,TAU);c.fill();c.restore();}}
  // trodden green where no one walks: along the kerb, at the bank's feet, by the shed, up the yard's right side, between the ways
  {const rg2=rng(317);for(const [gx,gd,gr] of [[300,kb+8,30],[92,kb+14,22],[440,kb+8,20],[628,kb+16,18],[300,-12,22],[150,-136,16],[60,-384,18],[862,-240,18],[940,-120,26],[540,-176,16],[440,-212,16],[790,-212,18],[960,-60,24],[420,-60,18],[700,-396,16]]){c.fillStyle=rgba(K.shade(P,'#4c5632'),.3);K.blob(c,gx,gd,gr,gr*.45,rg2,12);c.fill();
      c.fillStyle=rgba(K.shade(P,'#5a643a'),.2);K.blob(c,gx+3,gd,gr*.6,gr*.3,rg2,9);c.fill();}}
  // stones half in the dirt
  {const rst=rng(319);for(const [cx,cd,n,sp] of [[330,kb+26,5,26],[452,kb+22,4,18],[560,-10,4,20],[110,kb+30,4,16],[470,-10,4,22],[290,-12,4,18],[660,kb+26,5,18],[566,-190,4,18],[904,-100,5,24],[400,-336,3,16],[830,-230,4,20],[946,-190,4,22]])for(let i=0;i<n;i++){const x=cx+(rst()-.5)*sp*2,d=cd+(rst()-.5)*sp,rx=2.2+rst()*3.4,rd=rx*(.55+rst()*.25);
      c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(x+.8,d-rd*.5,rx*1.1,rd,0,0,TAU);c.fill();
      c.fillStyle=K.shade(P,['#5e584e','#4e4840','#6a6458'][(rst()*3)|0]);K.blob(c,x,d,rx,rd,rst,8);c.fill();
      c.fillStyle=rgba(P.light,.06+.2*P.lightA);c.beginPath();c.ellipse(x-rx*.15,d+rd*.35,rx*.6,rd*.35,0,0,TAU);c.fill();}}
  c.lineCap='butt';}
// a block of quarry stone, roughly squared (x, d its near left corner on the floor; w along, dd back, h high; o.z: what it stands
// on; o.clean: its top the stone's own, where it lies in a stack and not in the yard's dirt)
function stoneBlock(c,P,x,d,w,dd,h,r,o){o=o||{};const z=o.z||0,sh=(col,k)=>K.shade(P,col,k),col=o.col||['#3c3833','#34312d','#423e38','#383531'][(r()*4)|0],a=Q(x,z,d),b=Q(x+w,z,d),bt=Q(x+w,z+h,d),at=Q(x,z+h,d),ct=Q(x+w,z+h,d+dd),dt=Q(x,z+h,d+dd),cb=Q(x+w,z,d+dd),ch=1+r()*2;
  c.fillStyle=rgba('#000000',.32);K.poly(c,[{x:a.x-1.5,y:a.y+1.4},{x:b.x+3,y:b.y+1.4},{x:cb.x+3,y:cb.y},{x:cb.x,y:cb.y-2}]);c.fill();
  c.fillStyle=sh(K.jm(col,'#000000',.36),1.1);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineTo(bt.x,bt.y+ch*.5);c.lineTo(bt.x-ch,bt.y);c.lineTo(at.x+ch,at.y);c.lineTo(at.x,at.y+ch);c.closePath();c.fill();
  c.fillStyle=sh(K.jm(col,'#000000',.52),1.2);K.poly(c,[b,cb,ct,bt]);c.fill();
  if(o.clean){c.fillStyle=K.topLit(P,K.jm(col,'#625e58',.45),.5);K.poly(c,[at,bt,ct,dt]);c.fill();c.fillStyle=rgba('#000000',.12);K.poly(c,[at,{x:lerp(at.x,bt.x,.5+r()*.3),y:at.y},{x:lerp(dt.x,ct.x,.2+r()*.3),y:dt.y},dt]);c.fill();}
  else{c.fillStyle=K.jm(K.topLit(P,col,.5),P.dirt[1],.3);K.poly(c,[at,bt,ct,dt]);c.fill();
    c.fillStyle=rgba(P.dirt[0],.5);K.blob(c,(at.x+ct.x)/2+(r()-.5)*w*.4,(at.y+ct.y)/2,w*.3,dd*.3,r,8);c.fill();}
  c.fillStyle=rgba(P.light,.03+.1*P.lightA);K.poly(c,[{x:at.x+ch,y:at.y},{x:bt.x-ch,y:bt.y},{x:bt.x-ch,y:bt.y+1.1},{x:at.x+ch,y:at.y+1.1}]);c.fill();
  // (the quarryman's drill marks down its face, a bedding seam, moss low on it)
  c.fillStyle=rgba('#000000',.25);for(let k=0,n=1+(r()*3|0);k<n;k++)c.fillRect(a.x+w*(.15+r()*.7),at.y+2,1.5,h*(.4+r()*.4));
  c.fillRect(a.x+2,a.y-h*(.3+r()*.3),w-4-r()*w*.3,1.2);
  if(o.moss||r()<.4){c.fillStyle=rgba(sh('#46553a'),.5);K.blob(c,a.x+w*(.2+r()*.6),a.y-1.5,3+r()*5,1.6+r()*1.6,r,7);c.fill();}}
// the kerb along the yard's foot: a row of them set end to end, none the same, here and there one sunk or gone
function kerb(c,P){const So=SO(),d0=So.kerb,r=rng(171),x1=So.lip[3][0]-10;
  for(let x=toeX(d0)+2;x<x1;){const w=Math.min(22+r()*30,x1-x),k=r(),h=k<.12?3+r()*2:8+r()*6,dd=9+r()*5;if(k>.94){x+=w*.7;continue;}stoneBlock(c,P,x,d0-dd*.5+(r()-.5)*3,w,dd,h,r);x+=w+.8+r()*2.6;}}
// The spoil heap down the yard's west side, gone to weed; the bank of it that runs out across the floor, the garden behind it and
// the drain in its face: a headwall of quarry stone let into the bank, the pipe's mouth in it, a man's height nearly, behind a
// grate that something has bent outward; wing walls either side, an apron of flags, the gully running in.
// the heap's toe down the west side, by depth (d, x); west of it the heap climbs a hand in a hand
const HTOE=[[-880,-190],[-760,-140],[-640,-96],[-540,-60],[-470,-34],[-430,-20],[-380,-4],[-340,10],[-300,22],[-240,30],[-196,36],[-154,40],[-128,42],[-98,44],[-20,40],[24,30],[50,16],[80,-10],[104,-70],[124,-160],[134,-250],[150,-430]];
function toeX(d){if(d<=HTOE[0][0])return HTOE[0][1];for(let i=0;i<HTOE.length-1;i++){const a=HTOE[i],b=HTOE[i+1];if(d<=b[0])return lerp(a[1],b[1],(d-a[0])/(b[0]-a[0]));}return-430;}
const hillH=(x,d)=>Math.max(0,(toeX(d)-x)*.9);
function hillPts(){const B=SO().bank,x1=B.x1,d0=B.d0,d1=B.d1,dr=d0+30;
  // the bank's ridge (x, d, h) from its end out in the yard back to the heap, its front toe and its back toe (x, d)
  return{ridge:[[x1,dr+38,0],[x1-12,dr+20,22],[x1-28,dr+6,52],[x1-54,dr,78],[98,dr,84],[70,dr-4,90],[40,dr-10,98]],
    front:[[x1,dr+38],[x1-6,d0+4],[x1-28,d0-2],[x1-54,d0],[98,d0],[68,d0-4],[46,d0-12]],back:[[x1,dr+38],[x1-10,dr+70],[x1-32,dr+104],[x1-70,d1],[60,d1+2],[28,d1+10]]};}
// a tree without its leaves: a trunk split low, its limbs bare (p: its foot; s: its size; tr: its dice; lean; tips: where its
// twigs end, if a list is given)
function bareTree(c,P,p,s,tr,lean,tips){c.strokeStyle=K.shade(P,'#2a211a',1.05);c.lineCap='round';
  const limb=(x,y,a,l,w,n)=>{const x1=x+Math.cos(a)*l,y1=y+Math.sin(a)*l;c.lineWidth=Math.max(1.6,w);c.beginPath();c.moveTo(x,y);c.quadraticCurveTo((x+x1)/2+(tr()-.5)*l*.3,(y+y1)/2,x1,y1);c.stroke();
    if(n>0){limb(x1,y1,a-.34-tr()*.5,l*.68,w*.62,n-1);limb(x1,y1,a+.3+tr()*.5,l*.62,w*.58,n-1);if(n>1&&tr()<.6)limb(lerp(x,x1,.6),lerp(y,y1,.6),a+(tr()<.5?-1:1)*(.7+tr()*.4),l*.5,w*.5,n-2);}else if(tips)tips.push([x1,y1]);};
  limb(p.x,p.y,-Math.PI/2+lean,44*s,7.5*s,s>1.3?4:3);c.lineCap='butt';c.fillStyle=rgba(P.light,.05+.16*P.lightA);c.fillRect(p.x-4.6*s+lean*10,p.y-36*s,1.2,32*s);}
function hill(c,P){const So=SO(),H=hillPts(),sh=(col,k)=>K.shade(P,col,k),r=rng(331),LA=P.lightA,night=P.key==='night',dA=YNEAR+14,dB=130;
  const earth=K.jm(P.dirt[1],'#1c1612',.4),turf=K.jm(sh('#383a26'),P.dirt[1],.55),q2=(p,h)=>Q(p[0],h||0,p[1]);
  // the heap's side toward the yard: from its toe up and out of the picture; in the shade, the sun being over it
  {const toe=HTOE.map(([d,x])=>Q(x,0,d));
    c.save();c.beginPath();c.moveTo(-270,toe[0].y+20);toe.forEach(p=>c.lineTo(p.x,p.y));c.lineTo(-270,toe[toe.length-1].y);c.closePath();c.clip();
    c.fillStyle=lin(c,56,0,-170,0,[[0,K.jm(earth,'#000000',.25)],[.16,earth],[.5,turf],[1,K.jm(turf,P.light,.06+.1*LA)]]);c.fillRect(-270,200,360,YFOOT-180);
    // (patches of weed and of bare tip on it)
    for(let i=0;i<70;i++){const d=dA+r()*(dB-dA),dx=8+r()*170,x=toeX(d)-dx,p=Q(x,dx*.9,d),rx=10+r()*22;c.fillStyle=rgba(r()<.55?K.jm(sh('#465030'),P.dirt[1],.3):earth,.3+.3*r());K.blob(c,p.x,p.y,rx,rx*.55,r,11);c.fill();}
    // (it lies in lifts, each tipped over the last: where one ends its edge shows, broken, dark under and the light on its brow)
    for(const [hh,d0,d1] of [[30,-850,-420],[26,-390,-140],[28,-120,90],[62,-850,-330],[60,-290,-60],[58,-10,120],[98,-850,-460],[104,-420,-200],[100,-150,60]]){for(const dy of [0,1.8]){c.beginPath();let on=false;
        for(let d=d0;d<=d1;d+=10){const w=Math.sin(d*.05+hh)*6+Math.sin(d*.13+hh*.3)*3,p=Q(toeX(d)-(hh+w)/.9,hh+w+dy,d);if(p.x<-262||(((d-d0)/10|0)*7+hh)%13===0){on=false;continue;}on?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y);on=true;}
        if(dy){c.strokeStyle=rgba(P.light,.03+.08*LA);c.lineWidth=1.2;}else{c.strokeStyle=rgba('#000000',.2);c.lineWidth=2.6;}c.stroke();}}
    // (rubble in it: stones and lumps of old mortar, more of them low down where they have rolled)
    for(let i=0;i<280;i++){const d=dA+r()*(dB-dA),dx=r()*r()*160+2,x=toeX(d)-dx,p=Q(x,dx*.9,d),rx=1.6+r()*3.8,v=r();
      c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(p.x+.8,p.y+rx*.45,rx*1.1,rx*.5,0,0,TAU);c.fill();
      c.fillStyle=sh(v<.5?'#4c463e':v<.8?'#3e3932':'#5c564c',1.05);K.blob(c,p.x,p.y,rx,rx*.7,r,8);c.fill();c.fillStyle=rgba(P.light,.04+.12*LA);c.beginPath();c.ellipse(p.x-rx*.2,p.y-rx*.3,rx*.5,rx*.25,0,0,TAU);c.fill();}
    // (what has been tipped on it: a tyre, a rusted sheet, a length of timber)
    for(const [x,d,k] of [[-30,-250,0],[-64,-150,1],[-18,-60,2],[-96,-330,1],[-80,30,0],[-120,-210,2],[-70,-480,0],[-124,-570,1],[-52,-410,2],[-160,-650,0],[-20,-120,1]]){const p=Q(x,hillH(x,d),d);c.save();c.translate(p.x,p.y);c.rotate(-.5+(r()-.5)*.3);
      if(k===0){c.fillStyle=sh('#131113');c.beginPath();c.ellipse(0,0,13,6,0,0,TAU);c.fill();c.fillStyle=sh('#060607');c.beginPath();c.ellipse(0,-1,6.5,2.6,0,0,TAU);c.fill();c.fillStyle=rgba(P.light,.05+.1*LA);c.beginPath();c.ellipse(0,-3.4,9,1.6,0,Math.PI,TAU);c.fill();}
      else if(k===1){c.fillStyle=sh(K.TINC[(r()*K.TINC.length)|0],1.15);c.fillRect(-17,-5,34,8);c.fillStyle=rgba('#7a3a18',.4);c.fillRect(-9,-5,12,8);c.fillStyle=rgba('#000000',.3);for(let q=-15;q<17;q+=3.4)c.fillRect(q,-5,1.1,8);}
      else{c.fillStyle=sh('#3a2c1c',1.15);c.fillRect(-15,-2.4,30,4.8);c.fillStyle=rgba('#000000',.3);c.fillRect(-15,1.4,30,1);}
      c.restore();}
    // (scrub on it: dark bushes with the light on their heads)
    for(const [x,d,s2] of [[-58,-222,1.1],[-22,-128,.8],[-110,-286,1.3],[-44,10,.9],[-128,-110,1.2],[-90,84,.8],[-40,-380,.9],[-150,-380,1.3],[-70,-440,1],[-140,-30,1.1],[-76,-540,1.2],[-134,-610,1],[-190,-720,1.3],[-104,-780,1.1],[-14,-196,.8]]){const p=Q(x,hillH(x,d),d),rb=rng(Math.round(x*3+d+900));
      c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(p.x+3*s2,p.y+1,15*s2,3.6*s2,0,0,TAU);c.fill();
      c.fillStyle=sh('#222c1c',1.05);K.blob(c,p.x,p.y-9*s2,14*s2,10*s2,rb,12);c.fill();c.fillStyle=sh('#324026',1.05);K.blob(c,p.x-3*s2,p.y-12*s2,9*s2,6*s2,rb,10);c.fill();
      c.fillStyle=rgba(P.light,.04+.12*LA);K.blob(c,p.x-5*s2,p.y-15*s2,5*s2,2.6*s2,rb,8);c.fill();
      c.strokeStyle=sh('#241c14');c.lineWidth=1.5;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x+1,p.y-6*s2);c.moveTo(p.x+1,p.y-4*s2);c.lineTo(p.x+5*s2,p.y-8*s2);c.stroke();}
    // (its foot dark where it meets the floor)
    c.strokeStyle=rgba('#000000',.3);c.lineWidth=8;c.lineJoin='round';c.beginPath();toe.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();
    c.restore();}
  // the bank out across the floor: its back, which the garden lies under and the yard looks down on, and its face
  {const R=H.ridge.map(p=>Q(p[0],p[2],p[1])),F=H.front.map(p=>q2(p)),Bk=H.back.map(p=>q2(p)),xa=Bk[5].x-22,xb=R[0].x+8,yR=R[4].y,yF=F[4].y,yB=Bk[3].y;
    c.fillStyle=rgba('#000000',.22);c.beginPath();Bk.forEach((p,i)=>i?c.lineTo(p.x,p.y-2.5):c.moveTo(p.x+4,p.y-2.5));c.lineTo(Bk[5].x,Bk[5].y+4);c.lineTo(Bk[0].x+6,Bk[0].y+4);c.closePath();c.fill();
    K.poly(c,Bk.concat(R.slice().reverse()));c.fillStyle=lin(c,0,yB-2,0,yR,[[0,K.jm(turf,P.dirt[0],.35)],[.5,turf],[1,K.jm(turf,P.light,.08+.16*LA)]]);c.fill();
    c.save();K.poly(c,Bk.concat(R.slice().reverse()));c.clip();for(let i=0;i<34;i++){const x=xa+r()*(xb-xa),y=yB+r()*(yR-yB),rx=6+r()*14;c.fillStyle=rgba(r()<.5?K.jm(sh('#465030'),P.dirt[1],.3):earth,.3+.25*r());K.blob(c,x,y,rx,rx*.3,r,9);c.fill();}c.restore();
    K.poly(c,R.concat(F.slice().reverse()));c.fillStyle=lin(c,0,yR,0,yF,[[0,K.jm(earth,turf,.5)],[.22,earth],[1,K.jm(earth,'#000000',.35)]]);c.fill();
    c.save();K.poly(c,R.concat(F.slice().reverse()));c.clip();
    // (the earth of it: layers, stones bedded in them, slips where it has run, roots out of its brow)
    for(let k=0;k<8;k++){c.strokeStyle=rgba('#000000',.16);c.lineWidth=1.75;c.beginPath();for(let x=xa;x<=xb;x+=12){const y=lerp(yR,yF,.12+k*.11)+Math.sin(x*.07+k*2)*2.4;x===xa?c.moveTo(x,y):c.lineTo(x,y);}c.stroke();}
    for(let i=0;i<5;i++){const x=xa+20+r()*(xb-xa-40),y=yR+10+r()*30,w=10+r()*12,l=30+r()*40;c.fillStyle=rgba('#000000',.14);c.beginPath();c.moveTo(x-w*.4,y);c.quadraticCurveTo(x-w,y+l*.6,x-w*.7,y+l);c.lineTo(x+w*.8,y+l);c.quadraticCurveTo(x+w,y+l*.5,x+w*.4,y);c.closePath();c.fill();}
    for(let i=0;i<170;i++){const x=xa+r()*(xb-xa),y=yR+4+r()*(yF-yR-6),rx=1.4+r()*3.6,v=r();c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(x+.6,y+rx*.5,rx*1.05,rx*.5,0,0,TAU);c.fill();
      c.fillStyle=sh(v<.5?'#4c463e':v<.8?'#3e3932':'#5c564c',1.05);K.blob(c,x,y,rx,rx*.72,r,8);c.fill();c.fillStyle=rgba(P.light,.04+.12*LA);c.beginPath();c.ellipse(x-rx*.2,y-rx*.3,rx*.5,rx*.24,0,0,TAU);c.fill();}
    c.strokeStyle=sh('#2a2018');c.lineWidth=1.5;c.lineCap='round';c.beginPath();for(let i=0;i<24;i++){const x=xa+14+r()*(xb-xa-28),y=yR+1+r()*5,l=6+r()*16;c.moveTo(x,y);c.quadraticCurveTo(x+(r()-.5)*5,y+l*.5,x+(r()-.5)*7,y+l);}c.stroke();c.lineCap='butt';
    c.fillStyle=lin(c,0,yF-26,0,yF+4,[[0,rgba('#000000',0)],[1,rgba('#000000',.36)]]);c.fillRect(xa,yF-26,xb-xa,34);c.restore();
    // (the weed along its brow, lit from behind it)
    c.strokeStyle=rgba(P.light,.06+.2*LA);c.lineWidth=1.2;c.beginPath();R.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();}}
// the headwall and its wings; the pipe's mouth. The face stands square to us at the drain's depth. DRAINS: where the candles
// at its foot stand, for live()
const DRAINS={cands:[]};
function drain(c,P){const So=SO(),D=So.drain,sh=(col,k)=>K.shade(P,col,k),r=rng(341),LA=P.lightA,d=D.d,x0=D.x-D.r-23,x1=D.x+D.r+23,H=D.r*2+6,cop=6,a=Q(x0,0,d),e=Q(x1,H,d),cx=Q(D.x,0,d).x,cy=a.y-2-D.r,R=D.r,kR=R/37;DRAINS.cands.length=0;
  const STN=['#3e3a35','#36322e','#46413c','#322f2b'],night=P.key==='night';
  // the apron: flags between the wings, sunk and silted, wet where the gully comes in
  {const p0=Q(x0+2,0,d),p1=Q(x1-2,0,d),p2=Q(x1+20,0,d-D.wing),p3=Q(x0-20,0,d-D.wing),fl=K.jm(K.topLit(P,'#3e3c39',.5),P.dirt[1],.3);
    c.save();K.poly(c,[p0,p1,p2,p3]);c.clip();c.fillStyle=fl;c.fillRect(p3.x-4,p0.y-2,p2.x-p3.x+8,p3.y-p0.y+6);
    // (rows of big flags, their joints running back; each a little off its neighbour's shade)
    const NR=Math.max(3,Math.round(D.wing/14));for(let row=0;row<NR;row++){const u0=row/NR,u1=(row+1)/NR,ya=lerp(p0.y,p3.y,u0),yb=lerp(p0.y,p3.y,u1),xa=lerp(p0.x,p3.x,u0)-2,xb=lerp(p1.x,p2.x,u0)+2;
      for(let x=xa+((row%2)*17),i=0;x<xb+10;i++){const w=30+r()*18,sk=(yb-ya)*-.27;c.fillStyle=rgba(r()<.5?'#000000':P.light,.03+.08*r());c.beginPath();c.moveTo(x+1,ya+1);c.lineTo(x+w-1,ya+1);c.lineTo(x+w-1+sk,yb-.6);c.lineTo(x+1+sk,yb-.6);c.closePath();c.fill();
        c.fillStyle=rgba('#000000',.36);c.beginPath();c.moveTo(x,ya);c.lineTo(x+1.5,ya);c.lineTo(x+1.5+sk,yb);c.lineTo(x+sk,yb);c.closePath();c.fill();x+=w;}
      c.fillStyle=rgba('#000000',.36);c.fillRect(p3.x-4,yb-1.5,p2.x-p3.x+8,1.5);}
    // (silt washed over them, the wet where the gully comes in, a line of the day on it, green along the wall's foot)
    c.fillStyle=rgba(K.jm(P.dirt[0],'#000000',.3),.4);K.blob(c,cx+30,p0.y+22,40,9,rng(347),12);c.fill();
    c.fillStyle=rgba('#050403',.4);K.blob(c,cx+4,p0.y+10,36,9,rng(343),12);c.fill();c.fillStyle=rgba(sh('#3c4a2c'),.4);K.blob(c,cx-10,p0.y+4,34,4.5,rng(345),10);c.fill();
    c.fillStyle=rgba(K.jm(P.air[0],P.light,.3),.08+.14*LA);c.fillRect(cx-12,p0.y+9,26,1.3);
    // (what was dragged in, over the flags to the mouth; a boot left on them, on its side)
    c.strokeStyle=rgba('#050403',.34);c.lineWidth=2.4;for(const o of [-3,3]){c.beginPath();c.moveTo(cx+23+o,p3.y);c.quadraticCurveTo(cx+17+o,lerp(p0.y,p3.y,.5),cx+5+o*.6,p0.y+4);c.stroke();}
    {const bx=cx+42,by=lerp(p0.y,p3.y,.62);c.save();zoom(c,bx,by,2);c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(bx+2,by+1.4,8,2,0,0,TAU);c.fill();c.fillStyle=sh('#1c1612',1.05);c.beginPath();c.moveTo(bx-6,by);c.lineTo(bx-6,by-5.6);c.lineTo(bx-1.6,by-5.6);c.lineTo(bx-.6,by-3);c.lineTo(bx+6.6,by-2.6);c.quadraticCurveTo(bx+8.6,by-1,bx+7,by);c.closePath();c.fill();c.fillStyle=rgba(P.light,.06+.16*LA);c.fillRect(bx-6,by-5.6,4.4,1);c.restore();}
    c.fillStyle=lin(c,0,p0.y,0,p0.y+12,[[0,rgba('#000000',.45)],[1,rgba('#000000',0)]]);c.fillRect(p3.x-4,p0.y,p2.x-p3.x+8,12);c.restore();}
  // the wings: stone in courses, stepping down as they come forward; the right one shows us little but its top
  for(const s of [-1,1]){const xa=s<0?x0:x1,xb=xa+s*22,da=d,db=d-D.wing,ha=H-10,hb=24,A0=Q(xa,0,da),A1=Q(xa,ha,da),B0=Q(xb,0,db),B1=Q(xb,hb,db);
    c.fillStyle=rgba('#000000',.3);K.poly(c,[A0,B0,{x:B0.x+5,y:B0.y+2},{x:A0.x+6,y:A0.y+1}]);c.fill();
    c.fillStyle=sh(s<0?'#34302c':'#262320',1.1);K.poly(c,[A0,A1,B1,B0]);c.fill();
    c.save();K.poly(c,[A0,A1,B1,B0]);c.clip();
    for(let k=0;k*12+6<ha+4;k++){const hh=k*12+6;c.fillStyle=rgba('#000000',.34);K.poly(c,[Q(xa,hh,da),Q(xb,hh,db),Q(xb,hh-1.5,db),Q(xa,hh-1.5,da)]);c.fill();
      for(let u=(k%2)*.18+.1;u<1;u+=.3+r()*.12){const p=Q(lerp(xa,xb,u),hh,lerp(da,db,u));c.fillStyle=rgba('#000000',.34);c.fillRect(p.x-.75,p.y,1.5,12);}
      for(let u=0;u<1;u+=.34){if(r()<.5)continue;const pA=Q(lerp(xa,xb,u),hh+10.5,lerp(da,db,u)),pB=Q(lerp(xa,xb,u+.3),hh+10.5,lerp(da,db,u+.3));c.fillStyle=rgba(r()<.5?'#000000':P.light,.05+.05*r());K.poly(c,[pA,pB,{x:pB.x,y:pB.y+10},{x:pA.x,y:pA.y+10}]);c.fill();}}
    c.fillStyle=lin(c,0,A1.y,0,B0.y,[[0,rgba('#000000',0)],[1,rgba('#000000',.32)]]);c.fillRect(Math.min(A0.x,B0.x)-2,A1.y,Math.abs(A0.x-B0.x)+4,B0.y-A1.y);
    c.fillStyle=rgba(sh('#46553a'),.34);for(let i=0;i<5;i++){const u=r(),p=Q(lerp(xa,xb,u),r()*12,lerp(da,db,u));K.blob(c,p.x,p.y,3+r()*5,2+r()*3,r,7);c.fill();}
    c.restore();
    // (its coping: flat stones down the slope, seen from above)
    {const t0=Q(xa-s*1,ha,da),t1=Q(xb,hb,db),t2=Q(xb+s*9,hb,db+2),t3=Q(xa+s*8,ha,da+2);c.fillStyle=K.topLit(P,'#4a4640',.75);K.poly(c,[t0,t1,t2,t3]);c.fill();
      c.fillStyle=rgba('#000000',.3);for(const u of [.24,.5,.76]){const p=Q(lerp(xa,xb,u),lerp(ha,hb,u),lerp(da,db,u)),q=Q(lerp(xa,xb,u)+s*9,lerp(ha,hb,u),lerp(da,db,u)+2);K.poly(c,[p,q,{x:q.x+1.5,y:q.y},{x:p.x+1.5,y:p.y}]);c.fill();}
      c.fillStyle=sh('#262320',1.1);K.poly(c,[t1,t2,Q(xb+s*9,0,db+2),B0]);c.fill();}}
  // the face: big stones in courses, a ring of them round the mouth; damp, green low down, lime run from its joints
  {const w=e.x-a.x,top=e.y;c.fillStyle=sh('#262320',1.1);c.fillRect(a.x,top,w,a.y-top);
    c.save();c.beginPath();c.rect(a.x,top,w,a.y-top);c.clip();
    for(let y=a.y-13,row=0;y>top-13;y-=13,row++)for(let x=a.x-(row%2)*11-r()*6;x<e.x;){const sw=18+r()*17;c.fillStyle=sh(STN[(r()*4)|0],1.08);c.fillRect(x+.9,y+.9,sw-1.8,11.4);
        c.fillStyle=rgba(P.light,.03+.09*LA);c.fillRect(x+1.6,y+.9,sw-3.2,1);if(r()<.3){c.fillStyle=rgba('#000000',.2);c.fillRect(x+sw*(.2+r()*.5),y+3,1.5,6);}x+=sw;}
    // (the lime, the wet under the mouth, the green)
    for(let i=0;i<7;i++){const x=a.x+6+r()*(w-12),y=top+6+r()*30,l=14+r()*30;c.fillStyle=lin(c,0,y,0,y+l,[[0,rgba('#b8b4a8',.2)],[1,rgba('#b8b4a8',0)]]);c.fillRect(x,y,1.6+r()*2.6,l);}
    c.fillStyle=lin(c,0,cy+R-6,0,a.y,[[0,rgba('#050403',.5)],[1,rgba('#050403',.2)]]);c.beginPath();c.moveTo(cx-R*.7,cy+R*.7);c.lineTo(cx+R*.7,cy+R*.7);c.lineTo(cx+R*.5,a.y);c.lineTo(cx-R*.9,a.y);c.closePath();c.fill();
    for(let i=0;i<18;i++){const x=a.x+r()*w,y=a.y-r()*r()*26;c.fillStyle=rgba(sh('#46553a'),.22+.2*r());K.blob(c,x,y,3+r()*7,2+r()*4,r,7);c.fill();}
    c.fillStyle=lin(c,0,a.y-30,0,a.y,[[0,rgba('#000000',0)],[1,rgba('#000000',.4)]]);c.fillRect(a.x,a.y-30,w,30);
    c.fillStyle=lin(c,a.x,0,e.x,0,[[0,rgba(P.light,.02+.05*LA)],[.5,rgba(P.light,0)],[1,rgba('#000000',.14)]]);c.fillRect(a.x,top,w,a.y-top);c.restore();
    // (the ring: wedges of stone round the mouth, the key at its crown)
    {const n=Math.round(15*kR),ri=R+1,ro=R+11*kR;for(let i=0;i<n;i++){const a0=Math.PI+(-.16+i/n*1.32)*Math.PI,a1=Math.PI+(-.16+(i+1)/n*1.32)*Math.PI,g=.02;
        c.fillStyle=sh(STN[(i*3+1)%4],i===(n>>1)?1.0:1.08);c.beginPath();c.moveTo(cx+Math.cos(a0+g)*ri,cy+Math.sin(a0+g)*ri);c.lineTo(cx+Math.cos(a0+g)*ro,cy+Math.sin(a0+g)*ro);c.lineTo(cx+Math.cos(a1-g)*ro,cy+Math.sin(a1-g)*ro);c.lineTo(cx+Math.cos(a1-g)*ri,cy+Math.sin(a1-g)*ri);c.closePath();c.fill();
        c.fillStyle=rgba(P.light,.03+.1*LA);c.beginPath();c.moveTo(cx+Math.cos(a0+g)*ro,cy+Math.sin(a0+g)*ro);c.lineTo(cx+Math.cos(a1-g)*ro,cy+Math.sin(a1-g)*ro);c.lineTo(cx+Math.cos(a1-g)*(ro-1.2),cy+Math.sin(a1-g)*(ro-1.2));c.lineTo(cx+Math.cos(a0+g)*(ro-1.2),cy+Math.sin(a0+g)*(ro-1.2));c.closePath();c.fill();}}
    // (the coping along its top, seen from above; moss on it)
    {const t0=Q(x0-4,H,d-2),t1=Q(x1+4,H,d-2),t2=Q(x1+4,H,d+8),t3=Q(x0-4,H,d+8);c.fillStyle=sh('#2e2a27',1.1);c.fillRect(t0.x,t0.y,t1.x-t0.x,cop);c.fillStyle=K.topLit(P,'#4a4640',.8);K.poly(c,[t0,t1,t2,t3]);c.fill();
      c.fillStyle=rgba('#000000',.32);for(let x=x0+14;x<x1;x+=22+r()*12){const p=Q(x,H,d-2),q=Q(x,H,d+8);K.poly(c,[p,q,{x:q.x+1.5,y:q.y},{x:p.x+1.5,y:p.y}]);c.fill();c.fillRect(p.x,p.y,1.5,cop);}
      c.fillStyle=rgba(P.light,.08+.22*LA);c.fillRect(t0.x,t0.y,t1.x-t0.x,1.1);
      for(let i=0;i<6;i++){const p=Q(x0+r()*(x1-x0),H,d+r()*6);c.fillStyle=rgba(sh('#4c5a36'),.6);K.blob(c,p.x,p.y,3+r()*5,1.4+r()*1.4,r,7);c.fill();}}}
  // the mouth: the pipe's iron rim, the dark going back and down, a little light on its floor, water standing in it
  {c.fillStyle=sh('#3a241a',1.05);c.beginPath();c.arc(cx,cy,R+1,0,TAU);c.fill();c.fillStyle='#06070a';c.beginPath();c.arc(cx,cy,R-2.5,0,TAU);c.fill();
    c.save();c.beginPath();c.arc(cx,cy,R-2.5,0,TAU);c.clip();
    // (the pipe's lengths going away: each joint a ring, smaller and further over as it goes down under the yard)
    for(const [k,al] of [[.86,.5],[.7,.34],[.54,.2]]){const ox=(1-k)*R*.62,oy=-(1-k)*R*.16;c.strokeStyle=rgba(K.jm('#2a2622',P.air[2],.3),al*(night?.5:1));c.lineWidth=2*kR;c.beginPath();c.arc(cx+ox,cy+oy,(R-3)*k,0,TAU);c.stroke();}
    c.fillStyle=rad(c,cx-R*.3,cy+R*.75,2,R*1.1,[[0,rgba(K.jm(P.air[1],P.light,.4),night?.07:.2)],[1,rgba(P.air[1],0)]]);c.fillRect(cx-R,cy-R,R*2,R*2);
    // (the water lying in its floor, a line of the day on it; the scum line along its side)
    c.fillStyle=rgba('#0a0e12',.9);c.beginPath();c.ellipse(cx+5,cy+R-3,R*.74,R*.2,0,0,TAU);c.fill();c.fillStyle=rgba(K.jm(P.air[0],P.light,.3),night?.1:.3);c.fillRect(cx-R*.3,cy+R-7.2,R*.6,1.1);
    c.strokeStyle=rgba('#8a8676',.22);c.lineWidth=1.5;c.beginPath();c.arc(cx,cy,R-4.5,.2*Math.PI,.8*Math.PI);c.stroke();c.restore();
    c.strokeStyle=rgba(P.light,.06+.2*LA);c.lineWidth=1.1;c.beginPath();c.arc(cx,cy,R+.4,1.05*Math.PI,1.75*Math.PI);c.stroke();
    // (rust run down the stone from the rim)
    for(const an of [.12,.3,.72,.9]){const px=cx+Math.cos(an*Math.PI)*(R+1),py=cy+Math.sin(an*Math.PI)*(R+1);c.fillStyle=lin(c,0,py,0,py+22,[[0,rgba('#7a3a18',.42)],[1,rgba('#7a3a18',0)]]);c.fillRect(px-1.5,py,3+r()*2,22);}}
  // a creeper come down over the coping and the mouth's crown
  {const rc=rng(349);for(const [ox,l0] of [[-R-12,30],[-R+2,22],[-R*.5,14],[-12,17],[6,13],[R*.5,16],[R-6,24],[R+14,34]]){const l=l0*kR;let x=cx+ox,y=e.y+2;c.strokeStyle=sh('#2e2a1c');c.lineWidth=1.5;c.beginPath();c.moveTo(x,y-4);const pts=[];for(let k=0;k<l;k+=4){x+=(rc()-.5)*2.6;y+=4;c.lineTo(x,y);pts.push([x,y]);}c.stroke();
      for(const [px,py] of pts)for(let q=0;q<2;q++){c.fillStyle=rc()<.3?K.topLit(P,'#48603a',.25):sh(['#26361f','#2e4024'][(rc()*2)|0]);c.beginPath();c.ellipse(px+(rc()-.5)*6,py+(rc()-.5)*3,2.4,1.5,rc()*TAU,0,TAU);c.fill();}}}
  // what is left of a pitch at the right wing's end: the card to sit on, a blanket folded, the card with its mark, and the cup
  {const px=x1+24,pd=d-D.wing+6;c.save();zoom(c,Q(px,0,pd).x,Q(px,0,pd).y,1.5);const m0=Q(px,0,pd-14),m1=Q(px+34,0,pd-12),m2=Q(px+36,0,pd+8),m3=Q(px+1,0,pd+7);c.fillStyle=rgba('#000000',.25);K.poly(c,[{x:m0.x-1,y:m0.y+1.5},{x:m1.x+2,y:m1.y+1.5},m2,m3]);c.fill();
    c.fillStyle=sh('#6e5c44',1.05);K.poly(c,[m0,m1,m2,m3]);c.fill();c.fillStyle=rgba('#000000',.16);K.poly(c,[Q(px+16,0,pd-13),Q(px+18,0,pd-13),Q(px+19,0,pd+8),Q(px+17,0,pd+8)]);c.fill();
    {const b0=Q(px+17,0,pd+5),bw=17;c.fillStyle=sh('#4a4e58',1.05);c.beginPath();c.moveTo(b0.x,b0.y);c.lineTo(b0.x+bw,b0.y+.6);c.lineTo(b0.x+bw+1.5,b0.y-5.5);c.lineTo(b0.x+1.5,b0.y-6.2);c.closePath();c.fill();c.fillStyle=rgba('#000000',.25);c.fillRect(b0.x+1,b0.y-3.4,bw,1.2);c.fillStyle=rgba(P.light,.06+.16*LA);c.fillRect(b0.x+1.5,b0.y-6.2,bw,1);}
    // (the card leant on the wing's end)
    {const s0=Q(x1+24,0,d-D.wing-2);c.fillStyle=rgba('#000000',.25);c.beginPath();c.ellipse(s0.x+8,s0.y+1,11,2.4,0,0,TAU);c.fill();c.fillStyle=sh('#7a6a50',1.05);c.beginPath();c.moveTo(s0.x,s0.y);c.lineTo(s0.x+17,s0.y+1);c.lineTo(s0.x+15,s0.y-14);c.lineTo(s0.x-2,s0.y-15);c.closePath();c.fill();
      c.fillStyle=rgba('#000000',.14);c.fillRect(s0.x-1,s0.y-8.4,17,1);c.strokeStyle=rgba('#1c1814',.75);c.lineWidth=1.5;c.beginPath();c.arc(s0.x+6.6,s0.y-8,3.4,0,TAU);c.moveTo(s0.x+1.6,s0.y-8.4);c.lineTo(s0.x+12,s0.y-7.4);c.stroke();}
    // (the cup: tin, dented, on the ground before the card; nothing in it)
    {const q=Q(px+8,0,pd-18);c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(q.x+1.5,q.y,4.6,1.5,0,0,TAU);c.fill();c.fillStyle=sh('#77766f',1.05);c.beginPath();c.moveTo(q.x-3,q.y-6.5);c.lineTo(q.x+3,q.y-6.5);c.lineTo(q.x+2.5,q.y);c.lineTo(q.x-2.5,q.y);c.closePath();c.fill();
      c.fillStyle='#16181a';c.beginPath();c.ellipse(q.x,q.y-6.5,3,1,0,0,TAU);c.fill();c.fillStyle=rgba(P.light,.12+.4*LA);c.fillRect(q.x-2.4,q.y-5.6,1,4.6);c.strokeStyle=sh('#77766f');c.lineWidth=1.5;c.beginPath();c.arc(q.x+3.6,q.y-3.4,1.8,-1.2,1.2);c.stroke();}c.restore();}
  // chalk on the stone by the mouth: a tally someone kept, and stopped keeping
  {c.strokeStyle=rgba(K.shade(P,'#ddd6c8',.5),night?.2:.4);c.lineWidth=1.5;const tx=cx+R+11*kR+5,ty=cy-12;c.beginPath();for(let i=0;i<4;i++){c.moveTo(tx+i*2.8,ty);c.lineTo(tx+i*2.8+.6,ty+7);}c.moveTo(tx-1.5,ty+5);c.lineTo(tx+10,ty+1.5);for(let i=0;i<2;i++){c.moveTo(tx+i*2.8,ty+11);c.lineTo(tx+i*2.8+.6,ty+18);}c.stroke();}
  // keeping candles at the face's foot, left of the mouth: stubs in their own wax (their flames are live, after dark)
  {const rc=rng(355);for(const [dx,hh] of [[-R-17,6],[-R-11,9.5],[-R-5,5],[-R-22,8]]){const p=Q(D.x+dx,hh,d-5-(dx%2?2:0));DRAINS.cands.push({x:p.x,y:p.y});c.fillStyle=rgba(sh('#b8b0a0',1.05),.9);K.blob(c,p.x,p.y+hh+.4,3.2,1.2,rc,7);c.fill();
      c.fillStyle=sh('#b8b0a0',1.05);c.fillRect(p.x-1.3,p.y,2.6,hh);c.fillStyle=rgba('#000000',.2);c.fillRect(p.x+.3,p.y,1,hh);c.fillStyle='#1c1814';c.fillRect(p.x-.5,p.y-1.6,1,1.8);}}
  // a board on a post by the left wing's end, leaning: a cross daubed on it, run
  {const f=Q(x0-34,0,d-D.wing+10),t={x:f.x-7,y:f.y-48};c.save();zoom(c,f.x,f.y,1.8);c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(f.x+2,f.y+.6,6,1.8,0,0,TAU);c.fill();
    c.strokeStyle=sh('#2a1e14',1.1);c.lineWidth=3.4;c.lineCap='butt';c.beginPath();c.moveTo(f.x,f.y);c.lineTo(t.x,t.y);c.stroke();
    c.save();c.translate(t.x+2,t.y+12);c.rotate(-.14);c.fillStyle=sh('#4a3c2a',1.05);c.fillRect(-15,-10,30,20);c.fillStyle=rgba('#000000',.25);c.fillRect(-15,-.6,30,1.2);c.fillStyle=rgba(P.light,.08+.24*LA);c.fillRect(-15,-10,30,1);
    c.strokeStyle=sh('#6a2418',1.0);c.lineWidth=3;c.lineCap='round';c.beginPath();c.moveTo(-8,-6);c.lineTo(8,6);c.moveTo(8,-6);c.lineTo(-8,6);c.stroke();c.lineCap='butt';c.fillStyle=sh('#6a2418',1.0);c.fillRect(6.6,5,1.5,6);c.restore();c.restore();}
}
// The dead tree at the heap's foot, over the drain's left wing: its limbs bare, a rag caught in them. A picture of its own, laid by
// live() as the grate is: in the layer the sun's wash took its dark, and it stood there pale.
function deadPiece(){const P=K.pal(),D=SO().drain,tx=20,td=D.d-18,p=Q(tx,hillH(tx,td),td);
  return K.piece('yarddead|'+P.key,...grown(p.x,p.y,1.4,p.x-112,p.y-204,236,212),c=>{zoom(c,p.x,p.y,1.4);const tr=rng(337);c.fillStyle=rgba('#000000',.28);c.beginPath();c.ellipse(p.x+12,p.y+1,30,5,0,0,TAU);c.fill();bareTree(c,P,p,1.5,tr,.12);
    c.fillStyle=K.shade(P,'#7a3e30',1.05);c.beginPath();c.moveTo(p.x+16,p.y-106);c.lineTo(p.x+21,p.y-107);c.lineTo(p.x+22,p.y-93);c.lineTo(p.x+19,p.y-96);c.lineTo(p.x+16,p.y-90);c.closePath();c.fill();});}
// The lip, and the view down past it. The Floor ends here: the quarry's last cut goes down under its edge, and what is in it is far
// below in its own air (the kit's drop: roofs, a fire or two, the glow coming up). Under the lip the rock's face, drilled and split,
// a ledge with a walkway and two roofs on it, a ladder down to that, mist lying in the cut. DROPF: the fires, for live().
const DROPF={fires:[]};let RIM=null;
// the lip as it is broken: its line on the floor, jagged (x, d), from the right (side: where its run toward us begins)
function rim(){if(RIM)return RIM;const L2=SO().lip,r=rng(351),out=[];
  let s0=0;for(let i=0;i<L2.length-1;i++){const a=L2[i],b=L2[i+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]),side=i>2;let u=0,off=0;if(i===3)s0=out.length;
    while(u<1){const run=(16+r()*34)/len,u1=Math.min(1,u+run),o=u===0&&i===0?0:(r()-.38)*8,bite=r()<.22;
      const at=(uu,oo)=>side?[lerp(a[0],b[0],uu)-oo,lerp(a[1],b[1],uu)]:[lerp(a[0],b[0],uu),lerp(a[1],b[1],uu)+oo];
      out.push(at(u,o));if(bite){const um=u+(u1-u)*(.3+r()*.4);out.push(at(um-.4*(u1-u)*.3,o));out.push(at(um,o+4+r()*4));out.push(at(um+.4*(u1-u)*.3,o));}
      out.push(at(u1-.002,o));u=u1;off=o;}}
  out.push(L2[L2.length-1]);out.side=s0;return RIM=out;}
function dropView(c,P){const So=SO(),R0=rim(),sh=(col,k)=>K.shade(P,col,k),r=rng(353),LA=P.lightA,night=P.key==='night',dark=night||P.key==='dusk',pts=R0.map(p=>Q(p[0],0,p[1])),yL=Q(0,0,So.lip[3][1]).y,yT=yL-68,yB=YFOOT+6,sA=Q(So.lip[4][0],0,So.lip[4][1]),sB=Q(So.lip[5][0],0,So.lip[5][1]),sideX=y=>lerp(sA.x,sB.x,(y-sA.y)/(sB.y-sA.y));
  const air=P.air,hz=(col,k)=>K.jm(col,air[1],k),ledgeY=x=>Q(x,0,lipAt(x)).y+116+Math.sin(x*.011)*6;
  c.save();c.beginPath();c.moveTo(1260,pts[0].y);pts.forEach(p=>c.lineTo(p.x,p.y));c.lineTo(pts[pts.length-1].x-8,yB);c.lineTo(1260,yB);c.closePath();c.clip();
  // the cut's own air: dark under the lip, then the smoke that lies in it, lit from the sky and lighter than the rock; warm at its floor
  const AIR=[[0,K.jm(air[2],'#000000',.3)],[.22,K.jm(air[2],air[1],.5)],[.5,K.jm(air[1],air[0],night?.2:.5)],[.8,K.jm(air[1],air[0],night?.25:.42)],[1,K.jm(K.jm(air[1],air[0],.3),'#ff8a4a',night?.1:.05)]],
    airAt=y=>{const u=clamp((y-yT)/(yB-yT),0,1);for(let i=0;i<AIR.length-1;i++)if(u<=AIR[i+1][0])return K.jm(AIR[i][1],AIR[i+1][1],(u-AIR[i][0])/(AIR[i+1][0]-AIR[i][0]));return AIR[AIR.length-1][1];};
  c.fillStyle=lin(c,0,yT,0,yB,AIR);c.fillRect(360,yT,920,yB-yT);
  DROPF.fires.length=0;
  // the floor of the cut, far down, seen from over it: roofs more than walls, in rows along its terraces, the nearer lower in the
  // picture, bigger and darker against its air (the far ones are nearly the air's own colour)
  {const ROWY=[84,122,166,216,272].map(v=>yL+v);
    for(let k=0;k<5;k++){const s=.5+.15*k,ck=.3+.08*k,h0=.7-.07*k,base=x=>ROWY[k]+Math.sin(x*.009+k*1.7)*7+Math.sin(x*.023+k)*3,hc=airAt(ROWY[k]);
      c.fillStyle=rgba(K.jm(hc,'#000000',.5),.3);c.beginPath();c.moveTo(360,base(360)+1);for(let x=360;x<=1260;x+=30)c.lineTo(x,base(x)+.5);for(let x=1260;x>=360;x-=30)c.lineTo(x,base(x)+4*s);c.closePath();c.fill();
      for(let x=372+r()*30;x<1260;){const w=(12+r()*20)*s,wall=(3.4+r()*4)*s*(r()<.12?2:1),dp=(8+r()*8)*s,tc=K.TINC[(r()*K.TINC.length)|0],yy=base(x)+(r()-.5)*9*s;
        c.fillStyle=K.jm(hc,'#0c0a0a',ck+.2);c.fillRect(x,yy-wall,w,wall);
        c.fillStyle=K.jm(hc,sh(tc),ck+r()*.12);c.beginPath();c.moveTo(x-s,yy-wall);c.lineTo(x+w+s,yy-wall);c.lineTo(x+w+s+dp*.27,yy-wall-dp);c.lineTo(x-s+dp*.27,yy-wall-dp);c.closePath();c.fill();
        if(r()<.4){c.fillStyle=rgba('#7a3a18',.12+.06*k);c.beginPath();c.moveTo(x+w*.3,yy-wall);c.lineTo(x+w*.7,yy-wall);c.lineTo(x+w*.7+dp*.27,yy-wall-dp);c.lineTo(x+w*.3+dp*.27,yy-wall-dp);c.closePath();c.fill();}
        c.fillStyle=rgba(P.light,(.08+.2*LA)*(.5+.1*k));c.beginPath();c.moveTo(x-s+dp*.27,yy-wall-dp);c.lineTo(x+w+s+dp*.27,yy-wall-dp);c.lineTo(x+w+s+dp*.27,yy-wall-dp+.9*s);c.lineTo(x-s+dp*.27,yy-wall-dp+.9*s);c.closePath();c.fill();
        if(r()<(dark?.5:.24)){c.fillStyle=rgba('#ffb070',(dark?.9:.75));c.fillRect(x+w*.2,yy-wall*.8,2.4*s,Math.max(1.4,wall*.5));}
        if(r()<.07)DROPF.fires.push({x:x+w+3*s,y:yy-1,s:s*.9,hz:h0});
        if(r()<.22){c.fillStyle=K.jm(hc,'#0c0a0a',ck+.25);c.fillRect(x+w*.7+dp*.14,yy-wall-dp*.5-5*s,1.5*s,6*s);if(r()<.5)DROPF.fires.push({x:x+w*.7+dp*.14,y:yy-wall-dp*.5-5*s,s,hz:h0,smoke:true});}
        x+=w+(r()<.26?(8+r()*22)*s:(.6+r()*2.4)*s);}
      // (the smoke that lies between one terrace and the next)
      if(k<4){const ym=ROWY[k]+17+k*2,a=(.2-.03*k)*(P.key==='morning'?1.5:1);c.fillStyle=lin(c,0,ym-20,0,ym+20,[[0,rgba(air[0],0)],[.5,rgba(air[0],a)],[1,rgba(air[0],0)]]);
        c.beginPath();c.moveTo(360,ym-20);for(let x=360;x<=1260;x+=36)c.lineTo(x,ym-20+Math.sin(x*.013+k*2)*8);c.lineTo(1260,ym+20);for(let x=1260;x>=360;x-=36)c.lineTo(x,ym+20+Math.sin(x*.017+k)*7);c.closePath();c.fill();}}}
  // the fires' glow coming up through it
  c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,0,yT+90,0,yB,[[0,rgba('#ff8a4a',0)],[1,rgba('#ff8a4a',night?.15:.05)]]);c.fillRect(360,yT+90,920,yB-yT-90);c.restore();
  // a line strung across the cut from the ledge to its near side, lamps hung on it; another higher and slacker
  for(const [xa,ya,xb,yb2,sag,n] of [[1010,ledgeY(1010)-26,sideX(yL+176)+3,yL+176,34,4],[1180,ledgeY(1180)-30,sideX(yL+96)+3,yL+96,26,4]]){c.strokeStyle=hz(sh('#1e1a16'),.45);c.lineWidth=1.5;c.beginPath();c.moveTo(xa,ya);c.quadraticCurveTo((xa+xb)/2,(ya+yb2)/2+sag*2,xb,yb2);c.stroke();
    for(let i=1;i<=n;i++){const u=i/(n+1),x=(1-u)*(1-u)*xa+2*u*(1-u)*(xa+xb)/2+u*u*xb,y=(1-u)*(1-u)*ya+2*u*(1-u)*((ya+yb2)/2+sag*2)+u*u*yb2;c.fillStyle=hz(sh('#1e1a16'),.4);c.fillRect(x-.75,y,1.5,3.4);
      c.fillStyle=dark?'#ffb070':hz(sh('#6a5a40'),.4);c.fillRect(x-1.6,y+3.2,3.2,3.4);DROPF.fires.push({x,y:y+5,s:.5,hz:.4,lamp:true});}}
  // the ledge a long way under the lip: a walkway of planks along the rock, a rope for a rail, roofs on it, a line of washing
  {c.fillStyle=lin(c,0,ledgeY(900),0,ledgeY(900)+26,[[0,rgba(hz(sh('#2a2725'),.5),1)],[1,rgba(hz(sh('#2a2725'),.7),0)]]);c.beginPath();c.moveTo(600,ledgeY(600)+3);for(let x=600;x<=1260;x+=16)c.lineTo(x,ledgeY(x));for(let x=1260;x>=600;x-=16)c.lineTo(x,ledgeY(x)+30);c.closePath();c.fill();
    c.fillStyle=hz(K.topLit(P,'#4a4038',.6),.38);c.beginPath();c.moveTo(640,ledgeY(640));for(let x=640;x<=1260;x+=16)c.lineTo(x,ledgeY(x));for(let x=1260;x>=640;x-=16)c.lineTo(x,ledgeY(x)+3.6);c.closePath();c.fill();
    c.fillStyle=rgba('#000000',.3);for(let x=648;x<1260;x+=7+r()*4)c.fillRect(x,ledgeY(x),1,3.6);
    for(const [x,w,hh,col,tc] of [[708,56,23,'#3a302a','#5a4a40'],[838,44,20,'#2c2a2c','#4a4644'],[956,68,26,'#33292a','#6a5442'],[1090,50,22,'#3e3430','#4e4a48']]){const y=ledgeY(x+w/2)-1,dp=15;
      c.fillStyle=rgba('#000000',.3);c.fillRect(x-2,y,w+8,3);
      c.fillStyle=hz(sh(col,1.1),.36);c.fillRect(x,y-hh,w,hh);c.fillStyle=rgba('#000000',.2);for(let q=x+4;q<x+w;q+=6+r()*3)c.fillRect(q,y-hh,1,hh);
      c.fillStyle=hz(K.topLit(P,tc,.6),.34);c.beginPath();c.moveTo(x-3,y-hh);c.lineTo(x+w+3,y-hh);c.lineTo(x+w+3+dp*.27,y-hh-dp);c.lineTo(x-3+dp*.27,y-hh-dp);c.closePath();c.fill();
      c.fillStyle=rgba('#000000',.22);for(let q=x;q<x+w+4;q+=4.6){c.beginPath();c.moveTo(q,y-hh);c.lineTo(q+1.1,y-hh);c.lineTo(q+1.1+dp*.27,y-hh-dp);c.lineTo(q+dp*.27,y-hh-dp);c.closePath();c.fill();}
      c.fillStyle=rgba('#7a3a18',.28);c.fillRect(x+w*.3,y-hh-dp*.6,w*.3,dp*.6);
      c.fillStyle=rgba(P.light,.06+.22*LA);c.fillRect(x-3,y-hh,w+6,1);
      c.fillStyle=hz('#0c0a0a',.3);c.fillRect(x+w*.62,y-hh*.74,9,hh*.74);
      c.fillStyle=dark||P.win>.3?rgba('#ffb070',.8):hz('#12100f',.3);c.fillRect(x+w*.18,y-hh*.66,8,6);c.fillStyle=rgba('#000000',.4);c.fillRect(x+w*.18+3.6,y-hh*.66,.9,6);
      c.fillStyle=hz(sh('#1c1814'),.36);c.fillRect(x+w*.82,y-hh-dp-9,2.6,13);c.fillRect(x+w*.82-1,y-hh-dp-10.5,4.6,2);}
    // (the rope along its edge, on posts)
    c.strokeStyle=hz(sh('#1e1a16'),.4);c.lineWidth=1.5;c.beginPath();for(let x=652;x<1260;x+=38){c.moveTo(x,ledgeY(x)+2);c.lineTo(x,ledgeY(x)-8);}c.moveTo(652,ledgeY(652)-7);for(let x=652;x<=1260;x+=19)c.lineTo(x,ledgeY(x)-7+((x/19|0)%2)*1.8);c.stroke();
    {const xa=770,xb=836,ya=ledgeY(xa)-24,yb2=ledgeY(xb)-21;c.strokeStyle=hz(sh('#6a6052'),.42);c.lineWidth=1.5;c.beginPath();c.moveTo(xa,ya);c.quadraticCurveTo((xa+xb)/2,(ya+yb2)/2+7,xb,yb2);c.stroke();
      for(let u=.16;u<.9;u+=.2){const x=lerp(xa,xb,u),y=lerp(ya,yb2,u)+14*u*(1-u)+.5;c.fillStyle=hz(sh(['#6a5a4a','#4a5260','#7a6a50','#5a4a44','#8a8070'][(r()*5)|0]),.4);c.fillRect(x-2.8,y,5.6,6+r()*3);}}}
  // the rock's face under the lip: cut square by the quarrymen and split since, dark under the overhang, going down into the air
  {const FD=74,rock=sh('#221f1e',1.05),dk=K.jm(rock,'#000000',.6);
    for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);if(len<.6)continue;
      // (each run of it fades by how far down it is: the fade runs square to the lip's own line)
      let nx=-dy/len,ny=dx/len;if(ny<0){nx=-nx;ny=-ny;}const D=Math.max(6,FD*Math.abs(dx)/len),k=r(),tone=K.jm(rock,k<.5?'#000000':P.light,.03+.09*r()),g=c.createLinearGradient(a.x,a.y,a.x+nx*D,a.y+ny*D);
      g.addColorStop(0,dk);g.addColorStop(.2,tone);g.addColorStop(.6,rgba(K.jm(tone,air[1],.25),.92));g.addColorStop(1,rgba(K.jm(tone,air[1],.55),0));
      c.fillStyle=g;c.beginPath();c.moveTo(a.x-.3,a.y);c.lineTo(b.x+.3,b.y);c.lineTo(b.x+.3,b.y+FD);c.lineTo(a.x-.3,a.y+FD);c.closePath();c.fill();
      if(Math.abs(dx)>3){c.fillStyle=rgba('#000000',.3);for(let q=0,n=1+(r()*2.4|0);q<n;q++){const u=r(),l=10+r()*42;c.fillRect(lerp(a.x,b.x,u)-.75,lerp(a.y,b.y,u)+1,1.5,l);}}}
    // (its beds: two broken ledges along it, the light on each)
    for(const off of [17,40]){for(const dy of [0,-1.5]){c.beginPath();let on=false;pts.forEach((p,i)=>{if(i>=R0.side||(i*5+off)%7===0){on=false;return;}const y=p.y+off+Math.sin(i*.9+off)*2.2+dy;on?c.lineTo(p.x,y):c.moveTo(p.x,y);on=true;});
        if(dy){c.strokeStyle=rgba(P.light,(.03+.1*LA)*(off<30?1:.6));c.lineWidth=1.2;}else{c.strokeStyle=rgba('#000000',off<30?.34:.2);c.lineWidth=2;}c.stroke();}}
    // (wet run down it, green under where the water comes over; a fern or two out of the cracks)
    for(const xs of [690,812,905,1046,1130]){const p=Q(xs,0,lipAt(xs));c.fillStyle=lin(c,0,p.y,0,p.y+60,[[0,rgba('#050403',.4)],[1,rgba('#050403',0)]]);c.fillRect(p.x-4,p.y,7+r()*6,60);c.fillStyle=lin(c,0,p.y,0,p.y+36,[[0,rgba(sh('#3c4a2c'),.45)],[1,rgba(sh('#3c4a2c'),0)]]);c.fillRect(p.x-1,p.y,5,36);}
    for(const [xs,dy] of [[736,12],[858,22],[980,9],[1100,18],[660,26]]){const p=Q(xs,0,lipAt(xs));c.fillStyle=sh('#34442a',1.05);for(let q=0;q<5;q++){const an=.5+q*.5,l=5+r()*5;c.beginPath();c.moveTo(p.x,p.y+dy);c.quadraticCurveTo(p.x+Math.cos(an)*l*.6,p.y+dy-2,p.x+Math.cos(an)*l,p.y+dy+Math.sin(an)*l*.7);c.quadraticCurveTo(p.x+Math.cos(an)*l*.5,p.y+dy+1.6,p.x,p.y+dy+1.4);c.closePath();c.fill();}}}
  // the ladder down to the ledge from the ground before the shed, and Tarr's main going down the rock by the corner
  {const lx=900,p=Q(lx,0,lipAt(lx)),yb2=ledgeY(p.x)+1;c.strokeStyle=hz(sh('#2a2018'),.2);c.lineWidth=2.2;c.beginPath();c.moveTo(p.x-5,p.y-2);c.lineTo(p.x-9,yb2);c.moveTo(p.x+5,p.y-2);c.lineTo(p.x+1,yb2);c.stroke();
    c.lineWidth=1.6;c.beginPath();for(let y=p.y+6;y<yb2-2;y+=8.5){const u=(y-p.y)/(yb2-p.y);c.moveTo(p.x-5-4*u,y);c.lineTo(p.x+5-4*u,y);}c.stroke();
    const m=Q(So.lip[3][0]+12,0,So.lip[3][1]+3),ym=ledgeY(m.x+40)-4;c.strokeStyle=hz(sh('#2a201a'),.2);c.lineWidth=4.6;c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(m.x,m.y-3);c.lineTo(m.x+3,ym-20);c.quadraticCurveTo(m.x+4,ym-2,m.x+24,ym-2);c.lineTo(m.x+84,ym+1);c.stroke();c.lineCap='butt';
    c.strokeStyle=rgba(P.light,.04+.14*LA);c.lineWidth=1.1;c.beginPath();c.moveTo(m.x-1.8,m.y);c.lineTo(m.x+1.2,ym-28);c.stroke();
    for(const yy of [18,52]){c.fillStyle=sh('#1c1612');c.fillRect(m.x-4+yy*.05,m.y+yy,9,3);c.fillStyle=lin(c,0,m.y+yy+3,0,m.y+yy+26,[[0,rgba('#7a3a18',.36)],[1,rgba('#7a3a18',0)]]);c.fillRect(m.x-1+yy*.05,m.y+yy+3,3,23);}}
  c.restore();
  // the lip itself, from the yard: its edge catching the light, the rock split back from it, stones left on it
  c.strokeStyle=rgba(P.light,.1+.32*LA);c.lineWidth=1.3;c.lineJoin='round';c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y-.6):c.moveTo(p.x,p.y-.6));c.stroke();
  c.strokeStyle=rgba('#000000',.3);c.lineWidth=1.5;c.beginPath();for(let i=2;i<R0.side;i+=2){if(r()<.5)continue;const a=Q(R0[i][0],0,R0[i][1]),l=5+r()*12;c.moveTo(a.x,a.y-1);c.lineTo(a.x+(r()-.5)*5,a.y-1-l);}c.stroke();
  for(let i=1;i<R0.side;i++){if(r()<.7)continue;const p=Q(R0[i][0]+(r()-.5)*8,0,R0[i][1]+3+r()*6),rx=1.8+r()*3;c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(p.x+.8,p.y+rx*.3,rx*1.1,rx*.5,0,0,TAU);c.fill();c.fillStyle=sh(['#5e584e','#4e4840','#6a6458'][(r()*3)|0]);K.blob(c,p.x,p.y-rx*.3,rx,rx*.66,r,8);c.fill();}
  // where the lane comes to the lip: two posts and a plank across, a rag on it
  {const a=Q(604,0,So.kerb-20),b=Q(590,0,So.kerb-70),h=40;c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(a.x+3,a.y,6,1.8,0,0,TAU);c.ellipse(b.x+3,b.y,6,1.8,0,0,TAU);c.fill();
    c.fillStyle=sh('#2a1e14',1.1);c.fillRect(a.x-2,a.y-h,4,h);c.fillRect(b.x-2.2,b.y-h-2,4.4,h+2);c.fillStyle=sh('#3e3024',1.1);K.poly(c,[{x:a.x-3,y:a.y-h+6},{x:b.x-3,y:b.y-h+5},{x:b.x-3,y:b.y-h+12},{x:a.x-3,y:a.y-h+12}]);c.fill();
    c.fillStyle=rgba(P.light,.06+.22*LA);K.poly(c,[{x:a.x-3,y:a.y-h+6},{x:b.x-3,y:b.y-h+5},{x:b.x-3,y:b.y-h+6.2},{x:a.x-3,y:a.y-h+7.2}]);c.fill();
    c.fillStyle=sh('#7a3e30',1.05);c.beginPath();c.moveTo(a.x-8,a.y-h+12);c.lineTo(a.x-4,a.y-h+12);c.lineTo(a.x-5,a.y-h+24);c.lineTo(a.x-9,a.y-h+21);c.closePath();c.fill();}}
// The south's own things laid again over the light, as the wall things are (crisp; the kerb and the stone stack too): the heap and the drain stand at the picture's
// left, where the sun's wash is thickest, and it took their darks: the mouth was a grey hole. Painted on a strip of their own and
// laid back part way.
function southOver(c,P){const m=c.getTransform();if(m.b||m.c||!(m.a>0))return;const So=SO(),kb=So.kerb,yk=Q(0,0,kb).y;
  for(const [x0,x1,y0,y1,fn] of [[-152,340,250,YFOOT+6,g=>{hill(g,P);drain(g,P);}],[Math.floor(toeX(kb)+kb*PSX-10),Math.ceil(So.lip[3][0]+kb*PSX+8),yk-40,yk+22,g=>kerb(g,P)],[944,1160,432,712,g=>stack(g,P)]]){
    const cn=document.createElement('canvas');cn.width=Math.ceil((x1-x0)*m.a);cn.height=Math.ceil((y1-y0)*m.d);const g=cn.getContext('2d');g.setTransform(m.a,0,0,m.d,-x0*m.a,-y0*m.d);
    fn(g);c.save();c.globalAlpha=P.key==='night'?.5:.6;c.drawImage(cn,x0,y0,x1-x0,y1-y0);c.restore();cn.width=cn.height=0;}}
// The cut is in its own shade: the yard's light is taken off the view down again (the sun's wash and its shafts lie across the whole
// picture, and the fight's key light is laid over the layer after), most under the lip.
function dropShade(c,P){const pts=rim().map(p=>Q(p[0],0,p[1])),yL=Q(0,0,SO().lip[3][1]).y,yB=YFOOT+6;c.save();c.beginPath();c.moveTo(1260,pts[0].y);pts.forEach(p=>c.lineTo(p.x,p.y+.6));c.lineTo(pts[pts.length-1].x-8,yB);c.lineTo(1260,yB);c.closePath();c.clip();
  c.globalCompositeOperation='multiply';const k=P.key==='night'?.5:1;c.fillStyle=lin(c,0,yL-64,0,yB,[[0,rgba('#1c2230',.62*k)],[.26,rgba('#1c2230',.4*k)],[.55,rgba('#1c2230',.16*k)],[1,rgba('#1c2230',.1*k)]]);c.fillRect(360,yL-84,920,yB-yL+84);c.restore();}
// ---------- the south's pieces: what a man may stand behind ----------
// a keg lying with its head to us (x, y: the head's middle; rr its radius; len how far it runs back): the far head, the staves
// between, the near head with its boards, its chime hoop and its bung
function kegLying(c,P,x,y,rr,len,seed){const sh=(col,k)=>K.shade(P,col,k),r=rng(seed),ox=len*PSX,oy=-len*PSY,LA=P.lightA;
  c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(x+ox*.5+2,y+rr+.5,rr+len*.2+3,3,0,0,TAU);c.fill();
  c.fillStyle=sh('#3a2a1a',1.05);c.beginPath();c.arc(x+ox,y+oy,rr,0,TAU);c.fill();
  c.fillStyle=sh('#46331f',1.05);c.beginPath();c.moveTo(x-rr,y);c.lineTo(x-rr+ox,y+oy);c.arc(x+ox,y+oy,rr,Math.PI,0);c.lineTo(x+rr,y);c.closePath();c.fill();
  c.fillStyle=rgba(P.light,.05+.16*LA);c.beginPath();c.moveTo(x-rr*.5,y-rr*.86);c.lineTo(x-rr*.5+ox,y-rr*.86+oy);c.lineTo(x+rr*.2+ox,y-rr*.98+oy);c.lineTo(x+rr*.2,y-rr*.98);c.closePath();c.fill();
  for(const u of [.3,.72]){c.fillStyle=sh('#1c1814',1.05);c.beginPath();c.ellipse(x+ox*u,y+oy*u,rr+.6,rr+.6,0,Math.PI*1.02,Math.PI*1.98);c.lineTo(x+ox*u+rr+.6,y+oy*u+2.2);c.ellipse(x+ox*u,y+oy*u+2.2,rr+.6,rr+.6,0,Math.PI*1.98,Math.PI*1.02,true);c.closePath();c.fill();}
  c.fillStyle=sh('#1c1814',1.05);c.beginPath();c.arc(x,y,rr,0,TAU);c.fill();c.fillStyle=sh('#4e3a24',1.05);c.beginPath();c.arc(x,y,rr-2.2,0,TAU);c.fill();
  c.save();c.beginPath();c.arc(x,y,rr-2.2,0,TAU);c.clip();c.fillStyle=rgba('#000000',.28);for(const u of [-.36,.3])c.fillRect(x-rr,y+rr*u,rr*2,1.3);
    c.fillStyle=lin(c,0,y-rr,0,y+rr,[[0,rgba(P.light,.04+.12*LA)],[.5,rgba(P.light,0)],[1,rgba('#000000',.3)]]);c.fillRect(x-rr,y-rr,rr*2,rr*2);c.restore();
  c.fillStyle='#0c0a08';c.beginPath();c.arc(x+rr*.28,y+rr*.18+r(),1.6,0,TAU);c.fill();
  c.strokeStyle=rgba(P.light,.08+.24*LA);c.lineWidth=1.1;c.beginPath();c.arc(x,y,rr-.5,Math.PI*1.1,Math.PI*1.6);c.stroke();}
// The shed by the lip: boards under a tin roof that falls to the back, its door on the side toward the cut, shut on a hasp; a
// window, a lantern on its bracket, the score kept in chalk on the door, bills pasted up, kegs under the window. Where its
// stovepipe ends and where its lantern hangs are kept for live().
const SHEDS={pipe:{x:0,y:0},lamp:{x:0,y:0},z:[0,0,1]};
function shedSPiece(){const P=K.pal(),So=SO(),B=des(So.shed),sh=(col,k)=>K.shade(P,col,k),LA=P.lightA,dark=P.key==='night'||P.key==='dusk';
  const x0=B.x0,x1=B.x1,d0=B.d0,d1=B.d1,h=B.h,hb=B.hb,f0=Q(x0,0,d0),f1=Q(x1,0,d0),bx=Q(x1,0,d1),X=f0.x-14,Yt=Q(x1,hb+52,d1).y,Wd=bx.x+18-X,Ht=f0.y+14-Yt;
  const rh=dd=>lerp(h,hb,(dd-d0)/(d1-d0)),pp=Q(x1-24,rh(d0+50),d0+50);SHEDS.pipe.x=pp.x;SHEDS.pipe.y=pp.y-36;SHEDS.lamp.x=f0.x+66;SHEDS.lamp.y=f0.y-112;
  SHEDS.z=[f0.x,f0.y,B.k];
  return K.piece('yardshedS|'+P.key,...grown(f0.x,f0.y,B.k,X,Yt,Wd,Ht),c=>{zoom(c,f0.x,f0.y,B.k);const r=rng(371),top=f0.y-h,base=f0.y,w=f1.x-f0.x;
    c.fillStyle=rgba('#000000',.32);K.poly(c,[{x:f0.x-5,y:base+4},{x:f1.x+4,y:base+4},{x:bx.x+7,y:bx.y+2},{x:bx.x,y:bx.y-3}]);c.fill();
    // its side toward the lane: boards, in the shade
    {const a=f1,b=Q(x1,h,d0),e=Q(x1,hb,d1);c.fillStyle=sh('#1c1610',1.1);K.poly(c,[a,b,e,bx]);c.fill();c.fillStyle=rgba('#000000',.4);for(let u=.2;u<1;u+=.2){const p=Q(x1,0,lerp(d0,d1,u)),q=Q(x1,rh(lerp(d0,d1,u)),lerp(d0,d1,u));c.fillRect(p.x-.75,q.y,1.5,p.y-q.y);}}
    // its front: a course of stone under the boards
    K.boards(c,f0.x,top,f1.x,base-9,{base:sh('#33291f',1.05),bw:9.5,seed:373,foot:14,pal:P,rails:[top+30,base-58]});
    c.fillStyle=sh('#2a2724',1.1);c.fillRect(f0.x-1,base-9,w+2,9);for(let x=f0.x;x<f1.x;){const sw=13+r()*12;c.fillStyle=sh(['#3e3a35','#36322e','#46413c'][(r()*3)|0],1.08);c.fillRect(x+.8,base-8.4,Math.min(sw,f1.x-x)-1.6,7.6);x+=sw;}
    K.tin(c,f0.x+74,top+3,w-74,36,{base:sh('#45413e',1.1),seed:377,pal:P,rust:3});
    c.fillStyle=lin(c,0,top,0,top+14,[[0,rgba('#000000',.5)],[1,rgba('#000000',0)]]);c.fillRect(f0.x,top,w,14);
    // the door: planks on a Z of battens, strap hinges, the hasp and its padlock; the stone before it
    {const dx0=f0.x+13,dw=44,dT=base-131;c.fillStyle=sh('#120e0a',1.1);c.fillRect(dx0-2.5,dT-3,dw+5,131-6);
      K.boards(c,dx0,dT,dx0+dw,base-9,{base:sh('#3d2e1f',1.05),bw:8.8,seed:375,foot:10,pal:P,top:false});
      c.fillStyle=sh('#2c2015',1.1);c.fillRect(dx0,dT+13,dw,5.5);c.fillRect(dx0,base-34,dw,5.5);K.poly(c,[{x:dx0+1,y:base-34},{x:dx0+7,y:base-34},{x:dx0+dw-1,y:dT+18.5},{x:dx0+dw-7,y:dT+18.5}]);c.fill();
      c.fillStyle=rgba('#000000',.3);c.fillRect(dx0,dT+18.5,dw,1.2);c.fillRect(dx0,base-28.5,dw,1.2);
      c.fillStyle=sh('#15120f',1.05);for(const yy of [dT+14,base-33]){c.fillRect(dx0-1,yy,15,3.4);c.beginPath();c.arc(dx0+14,yy+1.7,2.2,0,TAU);c.fill();}
      c.fillRect(dx0+dw-11,base-74,13,3.6);c.fillStyle=sh('#5a5650',1.05);c.fillRect(dx0+dw-3.4,base-73,5.6,7.4);c.strokeStyle=sh('#5a5650',1.05);c.lineWidth=1.5;c.beginPath();c.arc(dx0+dw-.6,base-73,2.4,Math.PI,0);c.stroke();
      c.fillStyle=rgba(P.light,.1+.3*LA);c.fillRect(dx0+dw-3,base-72.4,1,5.6);
      // (the score, kept in chalk on the planks: fives, and a line under them)
      c.strokeStyle=rgba(K.shade(P,'#ddd6c8',.5),dark?.25:.5);c.lineWidth=1.5;c.beginPath();for(let g=0;g<3;g++){const tx=dx0+8+g*12,ty=dT+34;for(let i=0;i<(g<2?4:3);i++){c.moveTo(tx+i*2.3,ty);c.lineTo(tx+i*2.3+.5,ty+8);}if(g<2){c.moveTo(tx-1.4,ty+6);c.lineTo(tx+8.6,ty+2);}}
      for(let g=0;g<2;g++){const tx=dx0+8+g*12,ty=dT+48;for(let i=0;i<(g<1?4:2);i++){c.moveTo(tx+i*2.3,ty);c.lineTo(tx+i*2.3+.5,ty+8);}if(g<1){c.moveTo(tx-1.4,ty+6);c.lineTo(tx+8.6,ty+2);}}c.moveTo(dx0+6,dT+45);c.lineTo(dx0+40,dT+44);c.stroke();
      const s0=Q(x0+9,0,d0-12),s1=Q(x0+63,0,d0-12);c.fillStyle=rgba('#000000',.3);c.fillRect(s0.x-1,s0.y-.5,s1.x-s0.x+4,2.4);c.fillStyle=sh('#2e2b28',1.1);c.fillRect(s0.x,s0.y-5,s1.x-s0.x,5);c.fillStyle=K.topLit(P,'#4a4640',.8);K.poly(c,[{x:s0.x,y:s0.y-5},{x:s1.x,y:s1.y-5},Q(x0+63,5,d0),Q(x0+9,5,d0)]);c.fill();}
    // the window: four small panes, dark by day with the sky on them, lit after; its sill
    {const wx=f0.x+74,wy=base-112,ww=30,wh=31;c.fillStyle=sh('#15110d',1.1);c.fillRect(wx-3,wy-3,ww+6,wh+6);c.fillStyle=dark?'#c98a4a':K.jm('#14181e',P.air[0],.12);c.fillRect(wx,wy,ww,wh);
      if(dark){c.fillStyle=lin(c,0,wy,0,wy+wh,[[0,rgba('#ffd0a0',.3)],[1,rgba('#5a2a10',.35)]]);c.fillRect(wx,wy,ww,wh);c.fillStyle=rgba('#1a1210',.5);c.fillRect(wx+4,wy+15,11,16);c.fillRect(wx+19,wy+20,7,11);}
      else{c.fillStyle=rgba(P.air[0],.16);K.poly(c,[{x:wx,y:wy+wh*.7},{x:wx+ww*.6,y:wy},{x:wx+ww,y:wy},{x:wx+ww*.25,y:wy+wh}]);c.fill();c.fillStyle=rgba(P.air[0],.07);c.fillRect(wx,wy,ww,wh*.3);}
      c.fillStyle=sh('#15110d',1.1);c.fillRect(wx+ww/2-1,wy,2,wh);c.fillRect(wx,wy+wh/2-1,ww,2);c.fillStyle=sh('#3a2c1e',1.05);c.fillRect(wx-5,wy+wh+3,ww+10,3.6);c.fillStyle=rgba(P.light,.08+.24*LA);c.fillRect(wx-5,wy+wh+3,ww+10,1);}
    // bills pasted by the door: the match bill, torn, and a page of the Nightglass gone grey
    {const bx0=f0.x+61,by=base-62;c.fillStyle=sh('#8c7e62',1.05);K.poly(c,[{x:bx0,y:by},{x:bx0+11,y:by+.6},{x:bx0+11,y:by+13},{x:bx0+6,y:by+17},{x:bx0,y:by+16}]);c.fill();c.fillStyle=rgba('#1c1814',.6);c.fillRect(bx0+1.5,by+2,8,2.4);c.fillRect(bx0+1.5,by+6,6,1.2);c.fillRect(bx0+1.5,by+8.4,7,1.2);c.fillRect(bx0+1.5,by+10.8,5,1.2);
      c.fillStyle=sh('#77756c',1.05);c.fillRect(bx0+13,by-22,10,14);c.fillStyle=rgba('#1c1814',.5);for(let k=0;k<5;k++)c.fillRect(bx0+14.2,by-20.4+k*2.4,7.6-(k%2)*2,1.1);}
    // the lantern on its bracket
    {const lx=SHEDS.lamp.x,ly=SHEDS.lamp.y;c.strokeStyle=sh('#15120f',1.05);c.lineWidth=1.6;c.beginPath();c.moveTo(lx-7,ly-7);c.lineTo(lx,ly-7);c.lineTo(lx,ly-1);c.moveTo(lx-7,ly-1);c.lineTo(lx-1.5,ly-7);c.stroke();K.lantern(c,P,lx,ly-1,.95,dark);}
    // kegs under the window, one on two; a bucket
    {const ky=base+5,kx=f0.x+84;kegLying(c,P,kx-13,ky-13,12.5,22,381);kegLying(c,P,kx+13,ky-13,12.5,22,383);kegLying(c,P,kx,ky-34.5,12.5,22,385);}
    // the roof: tin falling to the back, stones on it against the wind, a tyre; the stovepipe through it
    {const fl=Q(x0-7,h+2,d0-7),fr=Q(x1+7,h+2,d0-7),br=Q(x1+7,hb,d1+5),bl=Q(x0-7,hb,d1+5);
      c.fillStyle=K.topLit(P,'#46403a',1);K.poly(c,[fl,fr,br,bl]);c.fill();c.save();K.poly(c,[fl,fr,br,bl]);c.clip();
      c.fillStyle=rgba('#000000',.28);for(let u=0;u<=1.001;u+=1/30){const a=lerp(fl.x,fr.x,u),b=lerp(bl.x,br.x,u);K.poly(c,[{x:a,y:fl.y},{x:a+1.5,y:fl.y},{x:b+1.5,y:bl.y},{x:b,y:bl.y}]);c.fill();}
      for(const [u,v,rw] of [[.2,.3,.16],[.62,.1,.2],[.8,.55,.12]]){c.fillStyle=rgba('#7a3a18',.34);const a=lerp(fl.x,fr.x,u)+(lerp(bl.x,fl.x,0)-fl.x),yy=lerp(fl.y,bl.y,v);c.fillRect(lerp(lerp(fl.x,bl.x,v),lerp(fr.x,br.x,v),u),yy,w*rw,(fl.y-bl.y)*(1-v)+2);}
      c.fillStyle=rgba('#000000',.25);for(const v of [.48]){const a={x:lerp(fl.x,bl.x,v),y:lerp(fl.y,bl.y,v)},b={x:lerp(fr.x,br.x,v),y:lerp(fr.y,br.y,v)};c.fillRect(a.x,a.y,b.x-a.x,1.5);}c.restore();
      c.fillStyle=sh('#1a1410',1.1);K.poly(c,[fl,fr,{x:fr.x,y:fr.y+5.5},{x:fl.x,y:fl.y+5.5}]);c.fill();c.fillStyle=sh('#120e0b',1.1);K.poly(c,[fr,br,{x:br.x,y:br.y+4.5},{x:fr.x,y:fr.y+5.5}]);c.fill();
      c.fillStyle=rgba(P.light,.14+.4*LA);c.fillRect(fl.x,fl.y-.4,fr.x-fl.x,1.1);
      for(const [sx,sd,rr] of [[x0+18,d0+16,5],[x0+52,d0+40,4.2],[x1-40,d0+12,4.6]]){const p=Q(sx,rh(sd)+2,sd);c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(p.x+1.4,p.y+1.6,rr*1.2,rr*.5,0,0,TAU);c.fill();c.fillStyle=sh(['#5e584e','#4e4840','#6a6458'][(r()*3)|0]);K.blob(c,p.x,p.y-rr*.3,rr,rr*.62,r,8);c.fill();c.fillStyle=rgba(P.light,.08+.24*LA);c.beginPath();c.ellipse(p.x-rr*.2,p.y-rr*.6,rr*.5,rr*.22,0,0,TAU);c.fill();}
      {const p=Q(x0+78,rh(d0+52)+2,d0+52);c.fillStyle=sh('#131113');c.beginPath();c.ellipse(p.x,p.y,13.5,6,0,0,TAU);c.fill();c.fillStyle=K.topLit(P,'#46403a',.8);c.beginPath();c.ellipse(p.x,p.y-1,6.6,2.6,0,0,TAU);c.fill();c.fillStyle=rgba(P.light,.06+.16*LA);c.beginPath();c.ellipse(p.x,p.y-3.6,9.5,1.7,0,Math.PI,TAU);c.fill();}
      c.fillStyle=sh('#1c1814',1.05);c.fillRect(pp.x-2.8,pp.y-34,5.6,35);c.fillRect(pp.x-4.4,pp.y-37,8.8,3.4);c.fillStyle=rgba(P.light,.1+.3*LA);c.fillRect(pp.x-2.8,pp.y-34,1.1,34);c.fillStyle=sh('#2a2622',1.05);c.beginPath();c.ellipse(pp.x,pp.y+1,5.4,1.8,0,0,TAU);c.fill();}});}
// Tarr's main along the kerb: iron in flanged lengths on chocks, rusted, a clamp and rag round a leak; a standpipe with its tap, a
// cup on a chain and the box the chits go in under his blue; a valve by the corner, his rag tied in its wheel, and the bend where
// the main goes down over the lip; pails stood in a line at the standpipe. Where the tap drips and the leak runs are kept for live().
const MAINS={tap:{x:0,y:0},leak:{x:0,y:0,g:0}};
function mainPiece(){const P=K.pal(),So=SO(),sh=(col,k)=>K.shade(P,col,k),LA=P.lightA,d=So.kerb,xa=toeX(d)+6,xb=So.lip[3][0]+16,hA=24,R=8.5,a=Q(xa,hA,d),b=Q(xb,hA,d),m=Q(So.lip[3][0]+12,0,So.lip[3][1]+3);
  const X=a.x-10,Yt=a.y-136,Wd=b.x-a.x+34,Ht=136+R+38,blue=K.shade(P,'#2f5c7c',.8),xS=352,xV=452,xL=262,pS=Q(xS,hA,d),pV=Q(xV,hA,d),pL=Q(xL,hA,d);
  MAINS.tap.x=pS.x-11*1.8;MAINS.tap.y=pS.y-R-33*1.8;MAINS.tap.g=Q(xS,0,d+8).y;MAINS.leak.x=pL.x+2;MAINS.leak.y=pL.y+R;MAINS.leak.g=Q(xL,0,d-8).y;
  return K.piece('yardmain|'+P.key,X,Yt,Wd,Ht,c=>{const r=rng(391),y=a.y;
    // the pails left in a line at the standpipe, to keep their owners' places: tin, enamel, wood, a tall can
    {const Qu=So.queue;[[-8,0,0],[9,13,1],[-7,26,2],[8,39,0],[-6,52,3]].forEach(([dx,dd,k])=>{const q=Q(Qu.x+dx,0,Qu.d0+dd),w=k===3?4:5.4,hh=k===1?15:k===3?13:11,col=['#77766f','#4a5260','#4a3a28','#5a3a2c'][k];c.save();zoom(c,q.x,q.y,1.9);
        c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(q.x+1.5,q.y+.4,w+2,2,0,0,TAU);c.fill();
        c.fillStyle=sh(col,1.05);c.beginPath();c.moveTo(q.x-w,q.y-hh);c.lineTo(q.x+w,q.y-hh);c.lineTo(q.x+w*.8,q.y);c.lineTo(q.x-w*.8,q.y);c.closePath();c.fill();
        c.fillStyle=rgba('#000000',.25);c.fillRect(q.x+w*.2,q.y-hh,w*.7,hh);c.fillStyle='#16181a';c.beginPath();c.ellipse(q.x,q.y-hh,w,1.5,0,0,TAU);c.fill();
        c.fillStyle=rgba(P.light,.12+.36*LA);c.fillRect(q.x-w+.8,q.y-hh+1.6,1,hh-3);
        if(k!==3){c.strokeStyle=sh('#5a5650',1.05);c.lineWidth=1.5;c.beginPath();c.arc(q.x,q.y-hh,w-.6,Math.PI,0);c.stroke();}c.restore();});}
    // the chocks it lies on
    for(let x=xa+16;x<xb-12;x+=34+r()*22){const p=Q(x,hA-R,d);c.fillStyle=sh('#2a1e14',1.1);K.poly(c,[{x:p.x-5.5,y:p.y+7},{x:p.x+5.5,y:p.y+7},{x:p.x+3.6,y:p.y-.5},{x:p.x-3.6,y:p.y-.5}]);c.fill();}
    // the pipe: its belly dark, the light along its back, rust in patches
    c.fillStyle=sh('#2e231c',1.05);c.fillRect(a.x,y-R,b.x-a.x,R*2);c.fillStyle=rgba('#000000',.36);c.fillRect(a.x,y+R*.3,b.x-a.x,R*.7);
    for(let i=0;i<30;i++){const x=a.x+r()*(b.x-a.x-24),w=8+r()*24;c.fillStyle=rgba('#7a3a18',.1+.16*r());c.fillRect(x,y-R+r()*4,w,R*2-r()*6);}
    c.fillStyle=rgba(P.light,.08+.26*LA);c.fillRect(a.x,y-R+1.2,b.x-a.x,1.3);
    // (where it comes out of the heap: earth fallen round it)
    c.fillStyle=K.jm(P.dirt[1],'#1c1612',.4);K.blob(c,a.x+1,y+3,8,7,rng(393),9);c.fill();
    // its joints: a flange at each length's end, bolted; rust run down from them
    for(let x=xa+52;x<xb-26;x+=88+r()*18){const p=Q(x,hA,d);c.fillStyle=lin(c,0,p.y+R,0,p.y+R+22,[[0,rgba('#7a3a18',.42)],[1,rgba('#7a3a18',0)]]);c.fillRect(p.x-1.8,p.y+R+1.5,3.6,20);
      c.fillStyle=sh('#1c1612',1.05);c.fillRect(p.x-2.8,p.y-R-2.6,5.6,R*2+5.2);c.fillStyle=rgba(P.light,.1+.3*LA);c.fillRect(p.x-2.8,p.y-R-2.6,5.6,1);c.fillStyle=sh('#4a3628',1.05);for(const yy of [-R+.4,-1.4,R-3.2])c.fillRect(p.x-1.1,p.y+yy,2.2,2.2);}
    // the leak: a clamp of strap iron over rag; the wet under it
    {const p=pL;c.fillStyle=lin(c,0,p.y+R,0,p.y+R+26,[[0,rgba('#050403',.5)],[1,rgba('#050403',0)]]);c.fillRect(p.x-3,p.y+R,9,26);c.fillStyle=sh('#6a6052',1.05);c.fillRect(p.x-5,p.y-R-1,12,R*2+2);c.fillStyle=rgba('#000000',.25);c.fillRect(p.x-5,p.y,12,R+1);
      c.fillStyle=sh('#15120f',1.05);c.fillRect(p.x-3.4,p.y-R-2,2.4,R*2+4);c.fillRect(p.x+3,p.y-R-2,2.4,R*2+4);c.fillRect(p.x-1.6,p.y-R-4.4,4.4,3);}
    // the standpipe: the riser, the tap and its key, the cup hung by its chain, the box for chits with his rag through its hasp
    c.save();zoom(c,pS.x,pS.y-R,1.8);
    {const p=pS,top=p.y-R-40;c.fillStyle=sh('#2e231c',1.05);c.fillRect(p.x-2.4,top,4.8,40);c.fillStyle=rgba(P.light,.08+.26*LA);c.fillRect(p.x-2.4,top,1.1,40);
      c.fillStyle=sh('#1c1612',1.05);c.fillRect(p.x-3.6,p.y-R-4,7.2,4.4);c.fillRect(p.x-3.4,top+11,6.8,2.6);
      c.fillStyle=sh('#4a3a2c',1.05);c.fillRect(p.x-12,top+3,12,4.2);c.fillRect(p.x-13,top+3,3.6,8.4);c.fillRect(p.x-3.6,top-1.5,7.2,5);c.fillRect(p.x-1.2,top-6.5,2.4,5);c.fillRect(p.x-5.6,top-8,11.2,2.4);
      c.fillStyle=rgba(P.light,.1+.3*LA);c.fillRect(p.x-12,top+3,12,1);c.fillRect(p.x-5.6,top-8,11.2,1);
      c.strokeStyle=sh('#5a5650',1.05);c.lineWidth=1.5;c.beginPath();c.moveTo(p.x+2.4,top+8);c.quadraticCurveTo(p.x+9,top+12,p.x+9,top+19);c.stroke();
      c.fillStyle=sh('#77766f',1.05);K.poly(c,[{x:p.x+5.8,y:top+19},{x:p.x+12.2,y:top+19},{x:p.x+11.4,y:top+26.5},{x:p.x+6.6,y:top+26.5}]);c.fill();c.fillStyle=rgba(P.light,.14+.4*LA);c.fillRect(p.x+6.6,top+20,1,5.6);c.fillStyle='#16181a';c.fillRect(p.x+6.2,top+19,5.6,1.2);
      c.fillStyle=sh('#26221f',1.05);c.fillRect(p.x-7,top+19,9.6,12);c.fillStyle=rgba(P.light,.08+.24*LA);c.fillRect(p.x-7,top+19,9.6,1);c.fillStyle='#08080a';c.fillRect(p.x-5,top+22.4,5.6,1.3);
      c.fillStyle=blue;K.poly(c,[{x:p.x-6.4,y:top+31},{x:p.x-2.6,y:top+31},{x:p.x-3.4,y:top+43},{x:p.x-5.2,y:top+40.4},{x:p.x-7.4,y:top+44}]);c.fill();c.fillStyle=rgba('#000000',.25);c.fillRect(p.x-6.2,top+34,3.4,1);}
    c.restore();
    // the valve by the corner: its body on the main, the stem, the wheel seen from over it, his rag knotted through
    c.save();zoom(c,pV.x,pV.y-R,1.5);
    {const p=pV,wy=p.y-R-17;c.fillStyle=sh('#1c1612',1.05);K.poly(c,[{x:p.x-8,y:p.y-R-1},{x:p.x-5,y:p.y-R-5},{x:p.x+5,y:p.y-R-5},{x:p.x+8,y:p.y-R-1},{x:p.x+8,y:p.y+R+1},{x:p.x-8,y:p.y+R+1}]);c.fill();
      c.fillStyle=rgba(P.light,.1+.3*LA);c.fillRect(p.x-5,p.y-R-5,10,1);c.fillStyle=sh('#2e231c',1.05);c.fillRect(p.x-1.6,wy,3.2,13);
      c.strokeStyle=sh('#5a2418',1.05);c.lineWidth=2.4;c.beginPath();c.ellipse(p.x,wy,10,3.8,0,0,TAU);c.stroke();c.lineWidth=1.6;c.beginPath();c.moveTo(p.x-10,wy);c.lineTo(p.x+10,wy);c.moveTo(p.x-3,wy-3.6);c.lineTo(p.x+3,wy+3.6);c.moveTo(p.x+3,wy-3.6);c.lineTo(p.x-3,wy+3.6);c.stroke();
      c.strokeStyle=rgba(P.light,.1+.3*LA);c.lineWidth=1;c.beginPath();c.ellipse(p.x,wy-.8,10,3.8,0,Math.PI*1.1,Math.PI*1.9);c.stroke();
      c.fillStyle=blue;K.poly(c,[{x:p.x+6,y:wy+1},{x:p.x+10.5,y:wy+2},{x:p.x+10,y:wy+17},{x:p.x+7.6,y:wy+13.6},{x:p.x+5.4,y:wy+18}]);c.fill();c.fillStyle=rgba('#000000',.25);c.fillRect(p.x+6.2,wy+4.4,4,1);}
    c.restore();
    // the bend down over the lip
    c.strokeStyle=sh('#2e231c',1.05);c.lineWidth=R*2;c.lineCap='butt';c.beginPath();c.moveTo(b.x-4,y);c.quadraticCurveTo(b.x+7,y,m.x+.5,m.y+2);c.stroke();
    c.strokeStyle=rgba(P.light,.08+.26*LA);c.lineWidth=1.3;c.beginPath();c.moveTo(b.x-4,y-R+1.8);c.quadraticCurveTo(b.x+3,y-R+2,m.x-R+1.6,m.y+2);c.stroke();
    {const p=Q(xb-8,hA,d);c.fillStyle=sh('#1c1612',1.05);c.fillRect(p.x-2.8,p.y-R-2.6,5.6,R*2+5.2);c.fillStyle=rgba(P.light,.1+.3*LA);c.fillRect(p.x-2.8,p.y-R-2.6,5.6,1);}});}
// The rail along the lip: scaffold poles stood in the cracks and wedged, a pole lashed along their heads, a rope under it; a bay
// boarded with a pallet; the gap where the ladder comes up. The hoist: a post and its jib out over the cut, a winch at its foot.
// The bench: a plank on two blocks. The stone where the keeping candles stand, and the rags tied on the rail by it for the ones
// who are kept. What moves on it (the hoist's fall, the rags, the flames) is drawn by railLive from these.
const RAILS={pulley:{x:0,y:0},rags:[],cands:[],lamps:[]};
const RPX=[660,704,750,800,852,886,914,964,1016,1068,1120];
function railPiece(){const P=K.pal(),So=SO(),sh=(col,k)=>K.shade(P,col,k),LA=P.lightA,hx=718,hd=lipAt(hx)+12,X=Q(RPX[0],0,lipAt(RPX[0])).x-20,Yt=Q(hx,248,hd).y-4,Wd=Q(1130,0,lipAt(1130)).x+16-X,Ht=Q(RPX[0],0,lipAt(RPX[0])).y+10-Yt;
  const post=i=>{const x=RPX[i],d=lipAt(x)+6,hh=84+hsh(i*7+3)*8,ln=(hsh(i*5+1)-.5)*5;return{f:Q(x,0,d),t:Q(x+ln,hh,d),x,d,hh};},N=RPX.length;
  const pe=Q(hx+62,226,hd-16);RAILS.pulley.x=pe.x;RAILS.pulley.y=pe.y+5;RAILS.rags.length=0;RAILS.cands.length=0;RAILS.lamps.length=0;
  // (the lamps: a line from the hoist's head to a pole at the pallet's end and on to another past the candles, lamps hung along it)
  const pA=post(3),pB=post(8),tA=Q(pA.x,214,pA.d),tB=Q(pB.x,204,pB.d),tH=Q(hx,236,hd),STR=[[tH,tA,9,2],[tA,tB,30,6]],strAt=(a,b,sag,u)=>({x:lerp(a.x,b.x,u),y:lerp(a.y,b.y,u)+sag*4*u*(1-u)});
  for(const [a,b,sag,n] of STR)for(let i=1;i<=n;i++)RAILS.lamps.push(strAt(a,b,sag,i/(n+1)));
  for(const [i,u,col,len] of [[7,.3,'#7a3e30',21],[7,.62,'#b8b0a0',18],[8,.25,'#55627c',22],[8,.7,'#7a3e30',16],[3,.5,'#b8b0a0',19]]){const a=post(i).t,b=post(i+1).t;RAILS.rags.push({x:lerp(a.x,b.x,u),y:lerp(a.y,b.y,u)+1.5,col,len});}
  {const cx=940,cd=lipAt(cx)+9;for(const [dx,hh] of [[-8,7],[-3,10],[2,6],[7,8.5],[11,5]]){const p=Q(cx+dx,7+hh,cd+(dx%2?1:-1));RAILS.cands.push({x:p.x,y:p.y});}}
  return K.piece('yardrail|'+P.key,X,Yt,Wd,Ht,c=>{const r=rng(401),pole='#3a3a3c',wood='#3a2c1c';
    // the bench: a plank on two blocks of the quarry's stone
    {const x0=796,x1=900,d0=lipAt(848)+3,sr=rng(403);stoneBlock(c,P,x0+5,d0+1,17,13,35,sr);stoneBlock(c,P,x1-22,d0+1,17,13,35,sr);
      const a=Q(x0,39,d0),b=Q(x1,39,d0),e=Q(x1,39,d0+17),f=Q(x0,39,d0+17);c.fillStyle=sh('#241a12',1.1);K.poly(c,[a,b,{x:b.x,y:b.y+3.6},{x:a.x,y:a.y+3.6}]);c.fill();c.fillStyle=K.topLit(P,'#4a3a28',.9);K.poly(c,[a,b,e,f]);c.fill();
      c.fillStyle=rgba('#000000',.25);c.fillRect(lerp(a.x,b.x,.4),e.y,1.5,a.y-e.y);c.fillStyle=rgba(P.light,.1+.3*LA);c.fillRect(a.x,a.y-.3,b.x-a.x,1);}
    // the candles' stone: stubs in their own wax, burnt to different heights
    {const cx=940,cd=lipAt(cx)+9,sr=rng(405);stoneBlock(c,P,cx-13,cd-5,28,11,7,sr,{col:'#46423c'});RAILS.cands.forEach((q,i)=>{const hh=[7,10,6,8.5,5][i];c.fillStyle=rgba(sh('#b8b0a0',1.05),.9);K.blob(c,q.x,q.y+hh+.4,3.2,1.2,sr,7);c.fill();
        c.fillStyle=sh('#b8b0a0',1.05);c.fillRect(q.x-1.3,q.y,2.6,hh);c.fillStyle=rgba('#000000',.2);c.fillRect(q.x+.3,q.y,1,hh);c.fillStyle='#1c1814';c.fillRect(q.x-.5,q.y-1.6,1,1.8);});}
    // the winch at the hoist's foot: a drum between two cheeks, its crank
    {const p=Q(hx-2,0,hd-3);c.save();zoom(c,p.x,p.y,1.6);c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(p.x+2,p.y+1,15,3.4,0,0,TAU);c.fill();c.fillStyle=sh(wood,1.1);c.fillRect(p.x-12,p.y-30,4.4,30);c.fillRect(p.x+7.6,p.y-30,4.4,30);
      c.fillStyle=sh('#4a3a28',1.05);c.fillRect(p.x-8,p.y-27,16,10);c.fillStyle=rgba('#000000',.3);for(let q=0;q<5;q++)c.fillRect(p.x-7+q*3.2,p.y-27,1,10);c.fillStyle=rgba(P.light,.1+.3*LA);c.fillRect(p.x-8,p.y-27,16,1);
      c.strokeStyle=sh('#15120f',1.05);c.lineWidth=1.8;c.beginPath();c.moveTo(p.x+12,p.y-22);c.lineTo(p.x+17,p.y-22);c.lineTo(p.x+17,p.y-13);c.lineTo(p.x+21,p.y-13);c.stroke();c.restore();}
    // the hoist: its post, the jib and its strut, the block at the jib's end; the fall from the winch up the post and out along it
    {const f=Q(hx,0,hd),t=Q(hx,236,hd),j0=Q(hx,228,hd),b0=Q(hx,158,hd);c.fillStyle=sh(wood,1.1);c.fillRect(f.x-4.4,t.y,8.8,f.y-t.y);c.fillStyle=rgba(P.light,.08+.26*LA);c.fillRect(f.x-4.4,t.y,1.4,f.y-t.y);c.fillStyle=rgba('#000000',.3);c.fillRect(f.x+2.4,t.y,2,f.y-t.y);
      c.strokeStyle=sh(wood,1.1);c.lineWidth=6.4;c.lineCap='butt';c.beginPath();c.moveTo(j0.x-4,j0.y+1);c.lineTo(pe.x+3,pe.y);c.stroke();c.lineWidth=4.6;c.beginPath();c.moveTo(b0.x,b0.y);c.lineTo(lerp(j0.x,pe.x,.62),lerp(j0.y,pe.y,.62)+1);c.stroke();
      c.strokeStyle=rgba(P.light,.08+.26*LA);c.lineWidth=1;c.beginPath();c.moveTo(j0.x-4,j0.y-1);c.lineTo(pe.x+3,pe.y-2);c.stroke();
      c.strokeStyle=sh('#6a5a44',1.05);c.lineWidth=1.5;c.beginPath();c.moveTo(f.x-4,f.y-36);c.lineTo(t.x-3,t.y+5);c.lineTo(pe.x,pe.y+2);c.stroke();
      c.fillStyle=sh('#15120f',1.05);c.fillRect(t.x-6,t.y-2,12,3.6);c.beginPath();c.arc(pe.x,pe.y+5,5.4,0,TAU);c.fill();c.fillStyle=sh('#4a3a2c',1.05);c.beginPath();c.arc(pe.x,pe.y+5,2.2,0,TAU);c.fill();}
    // the posts, wedged with stones; the pole along their heads and the rope under it; the pallet in one bay
    {const a=post(2),b=post(3);c.fillStyle=sh('#3e3024',1.1);for(let u=.06;u<.98;u+=.135){const p0={x:lerp(a.f.x,b.f.x,u),y:lerp(a.f.y,b.f.y,u)-5},p1={x:lerp(a.t.x,b.t.x,u),y:lerp(a.t.y,b.t.y,u)+16};c.fillRect(p0.x-2.6,p1.y,5.2,p0.y-p1.y);}
      c.fillStyle=sh('#2a1e14',1.1);for(const v of [.3,.8]){K.poly(c,[{x:a.f.x,y:lerp(a.f.y,a.t.y,v)},{x:b.f.x,y:lerp(b.f.y,b.t.y,v)},{x:b.f.x,y:lerp(b.f.y,b.t.y,v)+4},{x:a.f.x,y:lerp(a.f.y,a.t.y,v)+4}]);c.fill();}
      c.fillStyle=rgba(P.light,.06+.2*LA);for(let u=.06;u<.98;u+=.135){const p0={x:lerp(a.f.x,b.f.x,u),y:lerp(a.f.y,b.f.y,u)-5},p1={x:lerp(a.t.x,b.t.x,u),y:lerp(a.t.y,b.t.y,u)+16};c.fillRect(p0.x-2.6,p1.y,1,p0.y-p1.y);}}
    for(let i=0;i<N;i++){const q=post(i),sr=rng(410+i);c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(q.f.x+2,q.f.y+.6,6,1.8,0,0,TAU);c.fill();
      for(let k=0;k<2;k++){const rx=2.4+sr()*2;c.fillStyle=sh(['#5e584e','#4e4840','#6a6458'][(sr()*3)|0]);K.blob(c,q.f.x+(k?4:-3.4),q.f.y-rx*.3,rx,rx*.7,sr,8);c.fill();}
      c.strokeStyle=sh(pole,1.05);c.lineWidth=3.4;c.lineCap='butt';c.beginPath();c.moveTo(q.f.x,q.f.y);c.lineTo(q.t.x,q.t.y);c.stroke();c.strokeStyle=rgba(P.light,.1+.3*LA);c.lineWidth=1;c.beginPath();c.moveTo(q.f.x-1.1,q.f.y);c.lineTo(q.t.x-1.1,q.t.y);c.stroke();
      c.fillStyle=rgba('#7a3a18',.3);c.fillRect(q.t.x-1.7,q.t.y+8+sr()*20,3.4,6+sr()*8);}
    for(let i=0;i<N-1;i++){if(i===5)continue;const a=post(i),b=post(i+1);c.strokeStyle=sh(pole,1.05);c.lineWidth=3;c.beginPath();c.moveTo(a.t.x-5,a.t.y+3+(i%2));c.lineTo(b.t.x+5,b.t.y+3-(i%2));c.stroke();
      c.strokeStyle=rgba(P.light,.1+.3*LA);c.lineWidth=1;c.beginPath();c.moveTo(a.t.x-5,a.t.y+2+(i%2));c.lineTo(b.t.x+5,b.t.y+2-(i%2));c.stroke();
      c.strokeStyle=sh('#6a5a44',1.05);c.lineWidth=1.6;c.beginPath();c.moveTo(a.t.x,lerp(a.t.y,a.f.y,.5));c.quadraticCurveTo((a.t.x+b.t.x)/2,(lerp(a.t.y,a.f.y,.5)+lerp(b.t.y,b.f.y,.5))/2+5,b.t.x,lerp(b.t.y,b.f.y,.5));c.stroke();
      // (the lashing at each head)
      for(const q of [a,b]){c.fillStyle=sh('#6a5a44',1.05);c.fillRect(q.t.x-2.6,q.t.y+1,5.2,4.4);c.fillStyle=rgba('#000000',.3);c.fillRect(q.t.x-2.6,q.t.y+2.6,5.2,1);}}
    // the ladder's head, come up over the lip in the gap
    {const lx=900,p=Q(lx,0,lipAt(lx));c.save();zoom(c,p.x,p.y,2.3);c.strokeStyle=sh('#2a2018',1.05);c.lineWidth=2.4;c.beginPath();c.moveTo(p.x-5,p.y+1);c.lineTo(p.x-4,p.y-20);c.moveTo(p.x+5,p.y+1);c.lineTo(p.x+6,p.y-20);c.stroke();c.lineWidth=1.8;c.beginPath();c.moveTo(p.x-4.4,p.y-8);c.lineTo(p.x+5.6,p.y-8);c.moveTo(p.x-4,p.y-16);c.lineTo(p.x+6,p.y-16);c.stroke();
      c.strokeStyle=rgba(P.light,.1+.3*LA);c.lineWidth=1;c.beginPath();c.moveTo(p.x-5.8,p.y+1);c.lineTo(p.x-4.8,p.y-20);c.stroke();c.restore();}
    // the lamp poles lashed to two of the posts, the line between them, the lamps on it
    for(const [q,t] of [[pA,tA],[pB,tB]]){c.strokeStyle=sh(wood,1.1);c.lineWidth=3;c.lineCap='butt';c.beginPath();c.moveTo(q.f.x+2.4,q.f.y-2);c.lineTo(t.x,t.y);c.stroke();c.strokeStyle=rgba(P.light,.1+.3*LA);c.lineWidth=1;c.beginPath();c.moveTo(q.f.x+1.2,q.f.y-2);c.lineTo(t.x-1.2,t.y);c.stroke();
      c.fillStyle=sh('#6a5a44',1.05);c.fillRect(q.t.x-1,q.t.y+10,6,4);c.fillRect(q.t.x-1,q.t.y+30,6,4);}
    c.strokeStyle=sh('#1c1814',1.05);c.lineWidth=1.5;for(const [a,b,sag] of STR){c.beginPath();c.moveTo(a.x,a.y);for(let u=.1;u<=1.001;u+=.1){const q=strAt(a,b,sag,u);c.lineTo(q.x,q.y);}c.stroke();}
    for(const q of RAILS.lamps)K.lantern(c,P,q.x,q.y,1,P.key==='night'||P.key==='dusk');
    // the rags' knots (the rags themselves move)
    for(const g of RAILS.rags){c.fillStyle=sh(g.col,1.05);c.fillRect(g.x-2,g.y-1.6,4,3.4);}});}
// The fire ring between the court and the gully: stones round a bed of ash, a kettle hung from three poles over it; a crate turned
// up to sit on and a log. Its embers are live.
function firePiece(){const P=K.pal(),So=SO(),F0=So.fire,fk=F0.k||1,F={x:F0.x,d:F0.d,r:F0.r/fk},sh=(col,k)=>K.shade(P,col,k),LA=P.lightA,c0=Q(F.x,0,F.d),X=c0.x-76,Yt=c0.y-80,Wd=152,Ht=106;
  return K.piece('yardfire|'+P.key,...grown(c0.x,c0.y,fk,X,Yt,Wd,Ht),c=>{zoom(c,c0.x,c0.y,fk);const r=rng(421),rr=F.r,ap=Q(F.x-3,66,F.d);
    // the far stones of the ring, the ash, the burnt ends, the near stones
    const ring=(front)=>{for(let i=0;i<11;i++){const an=i/11*TAU+.2,sn=Math.sin(an);if((sn<0)!==front)continue;const p=Q(F.x+Math.cos(an)*rr,0,F.d+sn*rr*.9),rx=4.6+hsh(i*3+2)*2.6,sr=rng(430+i);
        c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(p.x+1.4,p.y+.8,rx*1.2,rx*.42,0,0,TAU);c.fill();c.fillStyle=sh(['#4e4a44','#423e3a','#5a554e'][i%3],1.08);K.blob(c,p.x,p.y-rx*.42,rx,rx*.72,sr,9);c.fill();
        c.fillStyle=rgba('#0a0806',.4);K.blob(c,p.x+(F.x>p.x?1.6:-1.6)*.6,p.y-rx*.2,rx*.6,rx*.4,sr,7);c.fill();c.fillStyle=rgba(P.light,.06+.2*LA);c.beginPath();c.ellipse(p.x-rx*.2,p.y-rx*.86,rx*.5,rx*.2,0,0,TAU);c.fill();}};
    ring(false);
    c.fillStyle=sh('#57534c',1.05);c.beginPath();c.ellipse(c0.x,c0.y,rr-3,(rr-3)*.62,0,0,TAU);c.fill();c.fillStyle='#161210';c.beginPath();c.ellipse(c0.x+1,c0.y+.6,rr-9,(rr-9)*.6,0,0,TAU);c.fill();
    for(const [dx,dy,l,an] of [[-6,1,22,.3],[5,-2,20,-.5],[0,3,16,1.2]]){c.save();c.translate(c0.x+dx,c0.y+dy);c.rotate(an);c.fillStyle='#0c0a09';c.fillRect(-l/2,-2,l,4);c.fillStyle=rgba('#8a857c',.5);c.fillRect(-l/2,-2,l*.3,1.3);c.restore();}
    // the three poles and the kettle on its chain
    for(const [fx,fd] of [[F.x-rr-9,F.d-6],[F.x+rr+8,F.d-8],[F.x+2,F.d+rr+6]]){const f=Q(fx,0,fd);c.strokeStyle=sh('#2a1e14',1.1);c.lineWidth=3;c.lineCap='butt';c.beginPath();c.moveTo(f.x,f.y);c.lineTo(ap.x+(fx>F.x?-1.5:1.5),ap.y-5);c.stroke();
      c.strokeStyle=rgba(P.light,.08+.26*LA);c.lineWidth=1;c.beginPath();c.moveTo(f.x-1,f.y);c.lineTo(ap.x+(fx>F.x?-2.5:.5),ap.y-5);c.stroke();}
    c.fillStyle=sh('#6a5a44',1.05);c.fillRect(ap.x-3,ap.y-3,6,5.4);
    c.strokeStyle=sh('#15120f',1.05);c.lineWidth=1.5;c.beginPath();c.moveTo(ap.x,ap.y+2);c.lineTo(ap.x,ap.y+30);c.stroke();
    {const kx=ap.x,ky=ap.y+40;c.strokeStyle=sh('#15120f',1.05);c.lineWidth=1.6;c.beginPath();c.arc(kx,ky-4,7.5,Math.PI*1.08,Math.PI*1.92);c.stroke();c.fillStyle=sh('#1a1816',1.05);c.beginPath();c.ellipse(kx,ky+2,9.5,8,0,0,TAU);c.fill();c.fillRect(kx-6,ky-6.5,12,3);
      c.beginPath();c.moveTo(kx+8,ky-1);c.lineTo(kx+15,ky-6);c.lineTo(kx+15.6,ky-3.6);c.lineTo(kx+9,ky+3);c.closePath();c.fill();c.fillStyle=rgba(P.light,.1+.3*LA);c.beginPath();c.ellipse(kx-3.4,ky-1,2,4.4,.3,0,TAU);c.fill();c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(kx,ky+6.4,8,2.4,0,0,Math.PI);c.fill();}
    ring(true);
    // a crate turned up to sit on, a mug on it; a log
    box(c,P,F.x-rr-38,F.d-12,22,20,19,'#3a2c1c');{const q=Q(F.x-rr-28,19,F.d-4);c.fillStyle=sh('#77766f',1.05);c.fillRect(q.x-2.4,q.y-5.6,4.8,5.6);c.fillStyle='#16181a';c.fillRect(q.x-2.4,q.y-5.6,4.8,1.2);c.fillStyle=rgba(P.light,.14+.4*LA);c.fillRect(q.x-1.8,q.y-4.2,1,3.6);}
    {const a=Q(F.x+rr+14,0,F.d+2),l=30;c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(a.x+l/2+2,a.y+1,l/2+4,3,0,0,TAU);c.fill();c.fillStyle=sh('#3a2a1c',1.08);c.fillRect(a.x,a.y-13,l,13);c.fillStyle=rgba('#000000',.3);c.fillRect(a.x,a.y-5,l,5);c.fillStyle=rgba(P.light,.08+.24*LA);c.fillRect(a.x,a.y-13,l,1.2);
      c.fillStyle=sh('#57452e',1.05);c.beginPath();c.ellipse(a.x,a.y-6.5,3.4,6.5,0,0,TAU);c.fill();c.fillStyle=sh('#2a1e14',1.05);c.beginPath();c.ellipse(a.x,a.y-6.5,1.5,3,0,0,TAU);c.fill();c.fillStyle=sh('#2a1e14',1.08);c.beginPath();c.ellipse(a.x+l,a.y-6.5,3.4,6.5,0,-Math.PI/2,Math.PI/2);c.fill();}});}
// The handcart by the kerb: two wheels, its shafts down on a prop, kegs on it under a cloth roped over.
function cartPiece(){const P=K.pal(),So=SO(),C1=So.cart,ck=C1.k||1,C0={x0:C1.x0,x1:C1.x0+(C1.x1-C1.x0)/ck,d:C1.d},az=Q(C1.x0,0,C1.d),sh=(col,k)=>K.shade(P,col,k),LA=P.lightA,x0=C0.x0+6,x1=C0.x1-26,dN=C0.d-18,dF=C0.d+14,a=Q(x0,0,dN),X=a.x-16,Yt=Q(x0,84,dF).y-4,Wd=Q(C0.x1,0,dN).x+14-X,Ht=a.y+10-Yt;
  return K.piece('yardcart|'+P.key,...grown(az.x,az.y,ck,X,Yt,Wd,Ht),c=>{zoom(c,az.x,az.y,ck);const r=rng(441),bh=32,sd=15,wr=23,wx=(x0+x1)/2;
    const wheel=(d,front)=>{const p=Q(wx,wr,d);c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(p.x+2,p.y+wr+.6,wr*.9,3,0,0,TAU);c.fill();
      c.strokeStyle=sh('#1c1612',1.05);c.lineWidth=4.4;c.beginPath();c.arc(p.x,p.y,wr-2.2,0,TAU);c.stroke();c.strokeStyle=sh('#3a2a1c',1.05);c.lineWidth=2.4;c.beginPath();for(let i=0;i<8;i++){const an=i/8*TAU+.3;c.moveTo(p.x+Math.cos(an)*4,p.y+Math.sin(an)*4);c.lineTo(p.x+Math.cos(an)*(wr-4),p.y+Math.sin(an)*(wr-4));}c.stroke();
      c.fillStyle=sh('#2a1e14',1.05);c.beginPath();c.arc(p.x,p.y,5,0,TAU);c.fill();c.fillStyle=sh('#15120f',1.05);c.beginPath();c.arc(p.x,p.y,2,0,TAU);c.fill();
      if(front){c.strokeStyle=rgba(P.light,.1+.3*LA);c.lineWidth=1.1;c.beginPath();c.arc(p.x,p.y,wr-.6,Math.PI*1.1,Math.PI*1.7);c.stroke();}};
    c.fillStyle=rgba('#000000',.28);K.poly(c,[Q(x0-4,0,dN-3),Q(x1+6,0,dN-3),Q(x1+6,0,dF+2),Q(x0-4,0,dF+2)]);c.fill();
    wheel(dF,false);
    // the bed and its sides; the shafts running out to the prop
    {const b0=Q(x0,bh,dN),b1=Q(x1,bh,dN),b2=Q(x1,bh,dF),b3=Q(x0,bh,dF),t0=Q(x0,bh+sd,dN),t1=Q(x1,bh+sd,dN),t2=Q(x1,bh+sd,dF),t3=Q(x0,bh+sd,dF);
      c.fillStyle=sh('#2e2216',1.1);K.poly(c,[t3,t2,b2,b3]);c.fill();c.fillStyle=sh('#241a12',1.15);K.poly(c,[t1,t2,b2,b1]);c.fill();
      for(const dd of [dN+3,dF-3]){const s0=Q(x1-4,bh+3,dd),s1=Q(C0.x1-3,17,dd);c.strokeStyle=sh('#3a2a1c',1.08);c.lineWidth=4;c.lineCap='butt';c.beginPath();c.moveTo(s0.x,s0.y);c.lineTo(s1.x,s1.y);c.stroke();c.strokeStyle=rgba(P.light,.08+.26*LA);c.lineWidth=1;c.beginPath();c.moveTo(s0.x,s0.y-1.6);c.lineTo(s1.x,s1.y-1.6);c.stroke();}
      {const p0=Q(C0.x1-6,17,dN+3),g0=Q(C0.x1-9,0,dN+3);c.strokeStyle=sh('#2a1e14',1.1);c.lineWidth=3;c.beginPath();c.moveTo(p0.x,p0.y);c.lineTo(g0.x,g0.y);c.stroke();const p1=Q(C0.x1-5,17,dN+3),p2=Q(C0.x1-5,17,dF-3);c.lineWidth=3.4;c.beginPath();c.moveTo(p1.x,p1.y);c.lineTo(p2.x,p2.y);c.stroke();}
      // (the kegs: three across with their heads to us, one on top; the cloth over the back ones, roped)
      const ky=b0.y-1,kr=12.5,kx=b0.x+16;kegLying(c,P,kx,ky-kr,kr,24,443);kegLying(c,P,kx+26,ky-kr,kr,24,445);kegLying(c,P,kx+52,ky-kr,kr,24,447);kegLying(c,P,kx+13,ky-kr-21.5,kr,24,449);
      {const ox=24*PSX,oy=-24*PSY,e=kx+52;K.oilcloth(c,[{x:e-17,y:ky-kr*2-1},{x:e-9+ox,y:ky-kr*2+oy-3},{x:e+15+ox,y:ky-kr*2+oy+1},{x:e+19+ox,y:ky+oy+3},{x:e+15,y:ky-3},{x:e+10,y:ky-kr*2+4}],{base:sh('#3e3a2a',1.05),seed:451,pal:P,sag:1.5,patches:2});
        c.strokeStyle=sh('#6a5a44',1.05);c.lineWidth=1.5;c.beginPath();c.moveTo(e-12,ky-kr*2+1);c.quadraticCurveTo(e+4,ky-kr*2-3,e+16+ox*.5,ky-kr*2+oy*.5+2);c.stroke();}
      c.fillStyle=sh('#3a2c1c',1.05);K.poly(c,[t0,t1,b1,b0]);c.fill();c.fillStyle=rgba('#000000',.3);for(let u=.25;u<1;u+=.25)c.fillRect(lerp(t0.x,t1.x,u)-.75,t0.y,1.5,b0.y-t0.y);c.fillRect(t0.x,t0.y+sd*.5,t1.x-t0.x,1.2);
      c.fillStyle=rgba(P.light,.1+.3*LA);c.fillRect(t0.x,t0.y,t1.x-t0.x,1.1);c.fillStyle=sh('#15120f',1.05);for(const u of [.06,.94]){c.fillRect(lerp(t0.x,t1.x,u)-1.2,t0.y+2,2.4,2.4);c.fillRect(lerp(t0.x,t1.x,u)-1.2,b0.y-4.4,2.4,2.4);}}
    wheel(dN-2,true);});}
// the grate over the mouth: five bars and a rail across, the pipe's own iron; one bar is gone, and one has been pried out at its
// foot, toward us. A picture of its own, laid by live() over the dark in the pipe.
function gratePiece(){const P=K.pal(),D=SO().drain,sh=(col,k)=>K.shade(P,col,k),LA=P.lightA,cx=Q(D.x,0,D.d).x,cy=Q(D.x,D.r+2,D.d).y,R=D.r,k=R/37;
  return K.piece('yardgrate|'+P.key,cx-R-2,cy-R-2,R*2+4,R*2+4,c=>{
  {const iron=sh('#241a16',1.05),way=(pts,ox)=>{c.beginPath();pts.forEach((p,i)=>i?(p.length>2?c.quadraticCurveTo(p[0]+ox,p[1],p[2]+ox,p[3]):c.lineTo(p[0]+ox,p[1])):c.moveTo(p[0]+ox,p[1]));},
      bar=(pts,w)=>{way(pts,0);c.strokeStyle=iron;c.lineWidth=w*k;c.stroke();way(pts,-.6*k);c.strokeStyle=rgba('#a0603a',.3+.3*LA);c.lineWidth=1;c.globalCompositeOperation='lighter';c.stroke();c.globalCompositeOperation='source-over';};
    c.lineCap='round';const hw=x=>Math.sqrt(Math.max(0,(R-2)*(R-2)-(x-cx)*(x-cx))),yT=x=>cy-hw(x),yB=x=>cy+hw(x),s=12*k,xr=Math.sqrt((R-2)*(R-2)-64*k*k);
    bar([[cx-xr,cy-8*k],[cx+xr,cy-8*k]],2.2);
    bar([[cx-2*s,yT(cx-2*s)],[cx-2*s,yB(cx-2*s)]],2.4);bar([[cx-s,yT(cx-s)],[cx-s,yB(cx-s)]],2.4);
    bar([[cx,yT(cx)],[cx+.5,cy-22*k]],2.4);bar([[cx+1,yB(cx)],[cx+2.5,yB(cx)-6*k]],2.4);                      // gone: a stub above, a stub below
    bar([[cx+s,yT(cx+s)],[cx+s,cy+2],[cx+s+3*k,cy+14*k,cx+s+14*k,cy+R-9*k]],2.4);                            // pried out at its foot, toward us
    bar([[cx+2*s,yT(cx+2*s)],[cx+2*s,yB(cx+2*s)]],2.4);c.lineCap='butt';
    // (a keeping rag tied on the rail, gone grey)
    c.fillStyle=sh('#8f887a',1.05);c.fillRect(cx-s-3,cy-8*k-2,6,4.4);c.beginPath();c.moveTo(cx-s-2,cy-8*k+2);c.lineTo(cx-s+2,cy-8*k+2);c.lineTo(cx-s+3.4,cy-8*k+19);c.lineTo(cx-s+.4,cy-8*k+15);c.lineTo(cx-s-2.6,cy-8*k+20);c.closePath();c.fill();}});}
// The kitchen garden between the old floor and the bank: two long beds edged with quarry rubble, each a picture of its own (i: 0
// the far bed, lettuces and onions, low, the old floor being close behind it; 1 the near one, cabbages and leeks, a frame of old
// glass at its end, a spade laid across it, and at the garden's side on the heap's foot a man of sacking to keep the birds off:
// he may stand a man's height there, left of where anyone fights).
function gardenPiece(i){const P=K.pal(),So=SO(),sh=(col,k)=>K.shade(P,col,k),LA=P.lightA,[x0,x1,d0,d1]=So.beds[i],he=14,Cw=So.crow,cw=Q(Cw.x,hillH(Cw.x,Cw.d),Cw.d),A=Q(x0,0,d0),B=Q(x1,0,d0),Cb=Q(x1,0,d1);
  const X=(i?Math.min(cw.x-52,A.x):A.x)-12,Yt=(i?Math.min(cw.y-160,Q(0,he+46,d1).y):Q(0,he+22,d1).y)-4,Wd=Cb.x+16-X,Ht=A.y+8-Yt;
  return K.piece('yardgarden'+i+'|'+P.key,X,Yt,Wd,Ht,c=>{const r=rng(511+i*7),soil=K.jm(K.topLit(P,'#2e2620',.5),P.dirt[1],.25),At=Q(x0,he,d0),Bt=Q(x1,he,d0),Ct=Q(x1,he,d1),Dt=Q(x0,he,d1),at=(u,v,h)=>Q(lerp(x0,x1,u),he+(h||0),lerp(d0,d1,v));
    // the bed: its edging of quarry rubble set on edge, the soil in it drawn up in ridges
    c.fillStyle=rgba('#000000',.3);K.poly(c,[{x:A.x-2,y:A.y+2},{x:B.x+5,y:B.y+2},{x:Cb.x+5,y:Cb.y},{x:Cb.x,y:Cb.y-3}]);c.fill();
    c.fillStyle=sh('#262220',1.15);K.poly(c,[B,Cb,Ct,Bt]);c.fill();c.fillStyle=sh('#2a2623',1.1);c.fillRect(A.x,At.y,B.x-A.x,he);
    for(let x=A.x;x<B.x;){const w=Math.min(12+r()*16,B.x-x),hh=he-r()*4;c.fillStyle=sh(['#4a4640','#3e3a35','#544e46'][(r()*3)|0],1.08);c.fillRect(x+.8,A.y-hh,w-1.6,hh);c.fillStyle=rgba(P.light,.04+.14*LA);c.fillRect(x+.8,A.y-hh,w-1.6,1);c.fillStyle=rgba('#000000',.22);c.fillRect(x+.8,A.y-2.4,w-1.6,2.4);x+=w;}
    c.fillStyle=soil;K.poly(c,[At,Bt,Ct,Dt]);c.fill();c.fillStyle=rgba('#000000',.2);for(const v of [.26,.5,.74]){const q0=at(.01,v),q1=at(.99,v);K.poly(c,[q0,q1,{x:q1.x,y:q1.y+1.8},{x:q0.x,y:q0.y+1.8}]);c.fill();}
    const head=(u,v,s2,dk,lt)=>{const p=at(u,v);c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(p.x+1.5,p.y+.8,s2*1.3,s2*.5,0,0,TAU);c.fill();c.fillStyle=sh(dk,1.05);K.blob(c,p.x,p.y-s2*.5,s2*1.3,s2*.8,r,9);c.fill();
        c.fillStyle=K.topLit(P,lt,.3);c.beginPath();c.ellipse(p.x,p.y-s2*.8,s2*.72,s2*.6,0,0,TAU);c.fill();c.fillStyle=rgba('#000000',.16);c.beginPath();c.ellipse(p.x+s2*.2,p.y-s2*.7,s2*.5,s2*.42,0,-.9,1.4);c.fill();
        c.fillStyle=rgba(P.light,.06+.16*LA);c.beginPath();c.ellipse(p.x-s2*.2,p.y-s2*1.05,s2*.36,s2*.2,0,0,TAU);c.fill();},
      tuft=(u,v,l,col)=>{const p=at(u,v);c.fillStyle=col;c.beginPath();for(const a of [-.5,-.1,.34]){const tx=p.x+Math.sin(a+(r()-.5)*.3)*l*.6,ty=p.y-l*(.8+r()*.3);c.moveTo(p.x-1.6,p.y);c.quadraticCurveTo(p.x-1.6+(tx-p.x)*.3,p.y-l*.6,tx,ty);c.quadraticCurveTo(p.x+1.6+(tx-p.x)*.3,p.y-l*.6,p.x+1.6,p.y);}c.fill();};
    if(!i){for(let k=0;k<9;k++)head(.06+k*.11+(r()-.5)*.02,.76,5.6+r()*1.4,'#34502e','#6a8a4e');
      for(const v of [.46,.18])for(let k=0;k<15;k++)tuft(.04+k*.066+(r()-.5)*.012,v,9+r()*4,v>.3?sh('#3a5234',1.05):K.topLit(P,'#56704a',.3));}
    else{for(let k=0;k<6;k++)head(.07+k*.118+(r()-.5)*.02,.7,11.4+r()*2.2,'#2c4034','#4e6a54');
      for(let k=0;k<11;k++)tuft(.04+k*.062+(r()-.5)*.012,.24,24+r()*10,k%2?sh('#3a5a40',1.05):K.topLit(P,'#5a7a5a',.3));
      // (the frame: a box with an old window laid on it)
      {const u0=.77,u1=.985,f0=at(u0,.1),f1=at(u1,.1),g0=at(u0,.1,22),g1=at(u1,.1,22),g2=at(u1,.92,30),g3=at(u0,.92,30),b1=at(u1,.92);
        c.fillStyle=sh('#32281c',1.1);K.poly(c,[f0,f1,g1,g0]);c.fill();c.fillStyle=sh('#261e15',1.15);K.poly(c,[f1,b1,g2,g1]);c.fill();
        c.fillStyle=K.jm('#1c2228',P.air[0],.2);K.poly(c,[g0,g1,g2,g3]);c.fill();c.fillStyle=rgba(P.air[0],.2);K.poly(c,[g0,{x:lerp(g0.x,g1.x,.4),y:g0.y},{x:lerp(g3.x,g2.x,.7),y:g3.y},{x:lerp(g3.x,g2.x,.3),y:g3.y}]);c.fill();
        c.strokeStyle=sh('#4a3c2a',1.05);c.lineWidth=3;K.poly(c,[g0,g1,g2,g3]);c.stroke();c.beginPath();c.moveTo((g0.x+g1.x)/2,g0.y);c.lineTo((g3.x+g2.x)/2,g3.y);c.moveTo((g0.x+g3.x)/2,(g0.y+g3.y)/2);c.lineTo((g1.x+g2.x)/2,(g1.y+g2.y)/2);c.stroke();}
      // (the spade, laid across the bed)
      {const a=at(.6,.46),b=at(.735,.9);c.strokeStyle=sh('#4a3a28',1.05);c.lineWidth=3;c.lineCap='butt';c.beginPath();c.moveTo(a.x,a.y-2);c.lineTo(b.x,b.y-2);c.stroke();c.fillStyle=sh('#3a3632',1.05);K.poly(c,[{x:a.x-12,y:a.y+3},{x:a.x+2,y:a.y-6},{x:a.x+6,y:a.y+1},{x:a.x-8,y:a.y+9}]);c.fill();c.beginPath();c.moveTo(b.x-5,b.y-5);c.lineTo(b.x+4,b.y+1);c.stroke();}
      // (the man of sacking: a post and a cross arm, a fighter's padded coat on it, gone to rags; a sack for a head, a tin lid for a hat)
      {const m=cw;c.save();zoom(c,m.x,m.y,2.1);c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(m.x+3,m.y+.6,12,2.2,0,0,TAU);c.fill();
        c.fillStyle=sh('#2a1e14',1.1);c.fillRect(m.x-1.8,m.y-70,3.6,70);c.fillRect(m.x-21,m.y-53,42,3.4);
        c.fillStyle=sh('#4a3c30',1.05);c.beginPath();c.moveTo(m.x-22,m.y-55);c.lineTo(m.x+22,m.y-55);c.lineTo(m.x+23,m.y-44);c.lineTo(m.x+11,m.y-46);c.lineTo(m.x+12,m.y-22);c.lineTo(m.x+6,m.y-25);c.lineTo(m.x+1,m.y-19);c.lineTo(m.x-5,m.y-24);c.lineTo(m.x-12,m.y-21);c.lineTo(m.x-11,m.y-46);c.lineTo(m.x-23,m.y-43);c.closePath();c.fill();
        c.fillStyle=rgba('#000000',.25);for(const q of [-6,0,6])c.fillRect(m.x+q-.75,m.y-52,1.5,26);c.fillRect(m.x-11,m.y-38,22,1.5);c.fillStyle=rgba(P.light,.06+.2*LA);c.fillRect(m.x-22,m.y-55,44,1);
        c.fillStyle=sh('#6e624e',1.05);c.beginPath();c.ellipse(m.x,m.y-63,6.4,7.4,0,0,TAU);c.fill();c.fillStyle=sh('#3a2e20',1.05);c.fillRect(m.x-4,m.y-56.6,8,2);c.fillStyle=sh('#4a4644',1.05);c.beginPath();c.ellipse(m.x,m.y-69.4,9.4,2.6,0,0,TAU);c.fill();c.fillStyle=rgba(P.light,.1+.3*LA);c.beginPath();c.ellipse(m.x-1.5,m.y-70.2,6,1,0,0,TAU);c.fill();c.restore();}}});}
// The tree by the practice ground: stunted, a few leaves left it, a limb out to one side with a tyre hung from it on a rope (the swing is
// live). Where the rope is tied is kept for it.
const TREES={sw:{x:0,y:0},z:[0,0,1]};
function treePiece(){const P=K.pal(),T0=SO().tree,sh=(col,k)=>K.shade(P,col,k),LA=P.lightA,p=Q(T0.x,0,T0.d),X=p.x-100,Yt=p.y-196,Wd=206,Ht=204,tk=T0.k||1;TREES.sw.x=p.x-52;TREES.sw.y=p.y-99;TREES.z=[p.x,p.y,tk];
  return K.piece('yardtree|'+P.key,...grown(p.x,p.y,tk,X,Yt,Wd,Ht),c=>{zoom(c,p.x,p.y,tk);const tr=rng(463),tips=[];c.fillStyle=rgba('#000000',.28);c.beginPath();c.ellipse(p.x+8,p.y+1,26,4.6,0,0,TAU);c.fill();
    bareTree(c,P,p,1.5,tr,-.12,tips);
    c.strokeStyle=sh('#2a211a',1.05);c.lineWidth=5;c.lineCap='round';c.beginPath();c.moveTo(p.x-5,p.y-66);c.quadraticCurveTo(p.x-26,p.y-94,p.x-56,p.y-101);c.stroke();c.lineCap='butt';
    c.fillStyle=sh('#2a211a',1.05);c.beginPath();c.moveTo(p.x-10,p.y+1);c.quadraticCurveTo(p.x-5,p.y-3,p.x-5,p.y-14);c.lineTo(p.x+5,p.y-14);c.quadraticCurveTo(p.x+5,p.y-3,p.x+12,p.y+1);c.closePath();c.fill();
    for(const [x,y] of tips){if(tr()<.2||y>p.y-112)continue;const rx=7+tr()*7;c.fillStyle=sh('#26321e',1.05);K.blob(c,x,y-2,rx,rx*.62,tr,10);c.fill();c.fillStyle=sh('#34442a',1.05);K.blob(c,x-2,y-4,rx*.62,rx*.4,tr,9);c.fill();c.fillStyle=rgba(P.light,.05+.14*LA);K.blob(c,x-3,y-6,rx*.4,rx*.2,tr,8);c.fill();}
    c.fillStyle=sh('#6a5a44',1.05);c.fillRect(TREES.sw.x-2.4,TREES.sw.y-3,4.8,4.6);});}
function treeLive(c,t,P,still){const sh=(col,k)=>K.shade(P,col,k),sw=TREES.sw,a=still?0:.07*windAt(t*.5+3,360)+.03*Math.sin(t*1.1),L2=62,x1=sw.x+Math.sin(a)*L2,y1=sw.y+Math.cos(a)*L2;
  c.strokeStyle=sh('#6a5a44',1.05);c.lineWidth=1.6;c.beginPath();c.moveTo(sw.x,sw.y);c.lineTo(x1,y1);c.stroke();
  c.save();c.translate(x1,y1+11);c.rotate(-a*.5);c.strokeStyle=sh('#131113',1.0);c.lineWidth=5.6;c.beginPath();c.ellipse(0,0,8.4,11,0,0,TAU);c.stroke();c.strokeStyle=rgba(P.light,.06+.16*P.lightA);c.lineWidth=1;c.beginPath();c.ellipse(-.6,-.6,10.8,13.4,0,Math.PI*1.1,Math.PI*1.6);c.stroke();c.restore();}
// The quarry's tipping wagon, left on the tram road when the last cut was done: an iron skip in its cradle on a four-wheeled frame,
// seen from its end; earth and stones in it now, and weed.
function wagonPiece(){const P=K.pal(),Wg=des(SO().wagon),sh=(col,k)=>K.shade(P,col,k),LA=P.lightA,x0=Wg.x0,x1=Wg.x1,d0=Wg.d0,d1=Wg.d1,xm=(x0+x1)/2,a=Q(x0,0,d0),X=a.x-12,Yt=Q(x0,70,d1).y-4,Wd=Q(x1,0,d1).x+14-X,Ht=a.y+8-Yt;
  return K.piece('yardwagon|'+P.key,...grown(a.x,a.y,Wg.k,X,Yt,Wd,Ht),c=>{zoom(c,a.x,a.y,Wg.k);const r=rng(471),fh=20,top=54;
    c.fillStyle=rgba('#000000',.26);K.poly(c,[Q(x0+2,0,d0-2),Q(x1+2,0,d0-2),Q(x1+2,0,d1-4),Q(x0+2,0,d1-4)]);c.fill();
    const wheel=(x,d)=>{const q=Q(x,0,d);c.fillStyle=sh('#1c1612',1.05);c.beginPath();c.ellipse(q.x,q.y-9,3.2,9,0,0,TAU);c.fill();c.fillStyle=rgba(P.light,.06+.2*LA);c.fillRect(q.x-2.6,q.y-16,1,12);},
      vee=d=>{const tl=Q(x0-5,top,d),tq=Q(x1+5,top,d),bl=Q(xm-9,fh+2,d),br=Q(xm+9,fh+2,d);c.beginPath();c.moveTo(tl.x,tl.y);c.lineTo(tq.x,tq.y);c.lineTo(br.x,br.y);c.quadraticCurveTo((bl.x+br.x)/2,bl.y+5,bl.x,bl.y);c.closePath();};
    wheel(x0+7,d1-10);wheel(x1-7,d1-10);
    c.fillStyle=sh('#241a16',1.15);K.poly(c,[Q(x1-3,fh,d0),Q(x1-3,fh,d1),Q(x1-3,fh-7,d1),Q(x1-3,fh-7,d0)]);c.fill();
    c.fillStyle=sh('#1e1612',1.2);vee(d1-4);c.fill();c.fillStyle=sh('#2a1e18',1.2);K.poly(c,[Q(x1+5,top,d0+4),Q(x1+5,top,d1-4),Q(xm+9,fh+2,d1-4),Q(xm+9,fh+2,d0+4)]);c.fill();
    {const m0=Q(x0-2,top-4,d0+6),m1=Q(x1+2,top-4,d0+6),m2=Q(x1+2,top-2,d1-6),m3=Q(x0-2,top-2,d1-6);c.fillStyle=K.jm(K.topLit(P,'#2e2620',.5),P.dirt[1],.25);c.beginPath();c.moveTo(m0.x,m0.y);c.lineTo(m1.x,m1.y);c.lineTo(m2.x,m2.y);c.quadraticCurveTo((m2.x+m3.x)/2,m2.y-9,m3.x,m3.y);c.closePath();c.fill();
      for(let i=0;i<7;i++){const u=r(),v=r(),q={x:lerp(lerp(m0.x,m1.x,u),lerp(m3.x,m2.x,u),v),y:lerp(m0.y,m3.y,v)-2},rx=1.6+r()*2.6;c.fillStyle=sh(['#5e584e','#4e4840','#6a6458'][(r()*3)|0]);K.blob(c,q.x,q.y,rx,rx*.7,r,8);c.fill();}
      c.fillStyle=sh('#3a5234',1.05);c.beginPath();for(let i=0;i<7;i++){const bx=lerp(m3.x,m2.x,.1+r()*.8),by=m3.y-3-r()*4,l=6+r()*8,an=(r()-.5)*.9;c.moveTo(bx-1,by);c.quadraticCurveTo(bx+Math.sin(an)*l*.3-1,by-l*.6,bx+Math.sin(an)*l,by-l);c.quadraticCurveTo(bx+Math.sin(an)*l*.3+1,by-l*.6,bx+1,by);}c.fill();}
    c.fillStyle=sh('#3a2a22',1.08);vee(d0+4);c.fill();c.save();vee(d0+4);c.clip();
    {const tl=Q(x0-5,top,d0+4),br=Q(x1+5,fh,d0+4);for(let i=0;i<9;i++){c.fillStyle=rgba('#7a3a18',.12+.2*r());c.fillRect(tl.x+r()*(br.x-tl.x),tl.y+r()*10,3+r()*9,8+r()*22);}
      c.fillStyle=lin(c,0,tl.y,0,br.y,[[0,rgba(P.light,.03+.1*LA)],[.4,rgba(P.light,0)],[1,rgba('#000000',.32)]]);c.fillRect(tl.x,tl.y,br.x-tl.x,br.y-tl.y+8);}c.restore();
    {const tl=Q(x0-5,top,d0+4),tq=Q(x1+5,top,d0+4);c.fillStyle=sh('#1c1410',1.05);c.fillRect(tl.x-1,tl.y-1.5,tq.x-tl.x+2,3.4);c.fillStyle=rgba(P.light,.12+.36*LA);c.fillRect(tl.x-1,tl.y-1.5,tq.x-tl.x+2,1);
      c.fillStyle=rgba('#000000',.4);for(let u=.1;u<.95;u+=.16)c.fillRect(lerp(tl.x,tq.x,u)-.75,tl.y+4,1.5,1.5);
      const pv=Q(xm,fh+18,d0+2),f0=Q(xm-15,fh,d0),f1=Q(xm+15,fh,d0);c.strokeStyle=sh('#15100c',1.05);c.lineWidth=3;c.lineCap='butt';c.beginPath();c.moveTo(f0.x,f0.y);c.lineTo(pv.x,pv.y);c.lineTo(f1.x,f1.y);c.stroke();c.fillStyle=sh('#15100c',1.05);c.beginPath();c.arc(pv.x,pv.y,3.4,0,TAU);c.fill();c.fillStyle=sh('#5a5650',1.05);c.beginPath();c.arc(pv.x,pv.y,1.4,0,TAU);c.fill();}
    wheel(x0+7,d0+10);wheel(x1-7,d0+10);
    {const b0=Q(x0+1,fh,d0),b1=Q(x1-1,fh,d0);c.fillStyle=sh('#2e2018',1.1);c.fillRect(b0.x,b0.y,b1.x-b0.x,8);c.fillStyle=rgba(P.light,.1+.3*LA);c.fillRect(b0.x,b0.y,b1.x-b0.x,1);c.fillStyle=rgba('#000000',.3);c.fillRect(b0.x,b0.y+5.6,b1.x-b0.x,2.4);
      c.fillStyle=sh('#15100c',1.05);for(const u of [.14,.86])c.fillRect(lerp(b0.x,b1.x,u)-3,b0.y+1,6,6);c.strokeStyle=sh('#15100c',1.05);c.lineWidth=2;c.beginPath();c.arc((b0.x+b1.x)/2,b0.y+10,3,0,Math.PI);c.stroke();}});}
// The table by the court: a top of planks on two trestles, a bench either side; mugs left on it, a jug, a loaf on its board, a
// lantern (lit after dark: its glow is live). Where the lantern's flame is, for live().
const TABLES={lamp:{x:0,y:0},z:[0,0,1]};
function tablePiece(){const P=K.pal(),Tb=des(SO().table),sh=(col,k)=>K.shade(P,col,k),LA=P.lightA,dark=P.key==='night'||P.key==='dusk',x0=Tb.x0,x1=Tb.x1,d0=Tb.d0,d1=Tb.d1,th=31,a=Q(x0,0,d0-16),X=a.x-10,Yt=Q(x0,th+28,d1+16).y-4,Wd=Q(x1,0,d1+16).x+12-X,Ht=a.y+8-Yt;
  const lp=Q(lerp(x0,x1,.62),th,(d0+d1)/2);TABLES.lamp.x=lp.x;TABLES.lamp.y=lp.y-8;
  const az=Q(x0,0,d0);TABLES.z=[az.x,az.y,Tb.k];
  return K.piece('yardtable|'+P.key,...grown(az.x,az.y,Tb.k,X,Yt,Wd,Ht),c=>{zoom(c,az.x,az.y,Tb.k);const r=rng(481);
    const bench=(dA,dB)=>{const hh=17,p0=Q(x0+4,hh,dA),p1=Q(x1-4,hh,dA),p2=Q(x1-4,hh,dB),p3=Q(x0+4,hh,dB);
      c.fillStyle=rgba('#000000',.28);K.poly(c,[Q(x0+2,0,dA-2),Q(x1,0,dA-2),Q(x1,0,dB+1),Q(x0+2,0,dB+1)]);c.fill();
      for(const u of [.12,.88]){const f=Q(lerp(x0+4,x1-4,u),0,dA+1);c.fillStyle=sh('#241a12',1.1);c.fillRect(f.x-2.4,f.y-hh,4.8,hh);}
      c.fillStyle=sh('#2a1e14',1.1);K.poly(c,[p0,p1,{x:p1.x,y:p1.y+3.4},{x:p0.x,y:p0.y+3.4}]);c.fill();c.fillStyle=K.topLit(P,'#4a3a28',.8);K.poly(c,[p0,p1,p2,p3]);c.fill();c.fillStyle=rgba(P.light,.1+.3*LA);c.fillRect(p0.x,p0.y-.3,p1.x-p0.x,1);};
    bench(d1+8,d1+16);
    c.fillStyle=rgba('#000000',.3);K.poly(c,[Q(x0-2,0,d0-2),Q(x1+3,0,d0-2),Q(x1+3,0,d1+2),Q(x0-2,0,d1+2)]);c.fill();
    for(const u of [.14,.86]){const xx=lerp(x0,x1,u),t=Q(xx,th-2,d0+3),f0=Q(xx-9,0,d0+3),f1=Q(xx+9,0,d0+3);c.strokeStyle=sh('#241a12',1.1);c.lineWidth=3.4;c.lineCap='butt';c.beginPath();c.moveTo(f0.x,f0.y);c.lineTo(t.x,t.y);c.lineTo(f1.x,f1.y);c.stroke();}
    {const p0=Q(x0,th,d0),p1=Q(x1,th,d0),p2=Q(x1,th,d1),p3=Q(x0,th,d1),at=(u,v)=>Q(lerp(x0,x1,u),th,lerp(d0,d1,v));c.fillStyle=sh('#2a1e14',1.1);K.poly(c,[p0,p1,{x:p1.x,y:p1.y+4},{x:p0.x,y:p0.y+4}]);c.fill();c.fillStyle=sh('#1e160f',1.15);K.poly(c,[p1,p2,{x:p2.x,y:p2.y+4},{x:p1.x,y:p1.y+4}]);c.fill();
      c.fillStyle=K.topLit(P,'#54422e',.85);K.poly(c,[p0,p1,p2,p3]);c.fill();c.fillStyle=rgba('#000000',.22);for(const v of [.34,.67]){const q0=at(0,v),q1=at(1,v);K.poly(c,[q0,q1,{x:q1.x,y:q1.y+1.3},{x:q0.x,y:q0.y+1.3}]);c.fill();}
      c.fillStyle=rgba(P.light,.1+.3*LA);c.fillRect(p0.x,p0.y-.3,p1.x-p0.x,1);
      // (the rings mugs have left; the mugs, the jug, the loaf, the lantern)
      c.strokeStyle=rgba('#000000',.2);c.lineWidth=1.5;for(const [u,v] of [[.2,.4],[.46,.7],[.84,.3]]){const q=at(u,v);c.beginPath();c.ellipse(q.x,q.y,3.2,1.5,0,0,TAU);c.stroke();}
      for(const [u,v] of [[.1,.6],[.3,.28],[.9,.62]]){const q=at(u,v);c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(q.x+1.4,q.y+.3,3.6,1.3,0,0,TAU);c.fill();c.fillStyle=sh('#77766f',1.05);c.fillRect(q.x-2.6,q.y-6.4,5.2,6.4);c.fillStyle='#16181a';c.beginPath();c.ellipse(q.x,q.y-6.4,2.6,1,0,0,TAU);c.fill();c.fillStyle=rgba(P.light,.14+.4*LA);c.fillRect(q.x-2,q.y-5.2,1,4.4);c.strokeStyle=sh('#77766f',1.05);c.lineWidth=1.5;c.beginPath();c.arc(q.x+3.2,q.y-3.2,1.8,-1.2,1.2);c.stroke();}
      {const q=at(.44,.42);c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(q.x+1.6,q.y+.3,4.6,1.5,0,0,TAU);c.fill();c.fillStyle=sh('#2a2420',1.05);c.beginPath();c.moveTo(q.x-3.4,q.y);c.quadraticCurveTo(q.x-5,q.y-6,q.x-2,q.y-10);c.lineTo(q.x-2.4,q.y-12.4);c.lineTo(q.x+2.4,q.y-12.4);c.lineTo(q.x+2,q.y-10);c.quadraticCurveTo(q.x+5,q.y-6,q.x+3.4,q.y);c.closePath();c.fill();c.fillStyle=rgba(P.light,.08+.24*LA);c.fillRect(q.x-2.6,q.y-8.4,1,6);c.strokeStyle=sh('#2a2420',1.05);c.lineWidth=1.6;c.beginPath();c.arc(q.x+4.4,q.y-6.4,2.6,-1.3,1.3);c.stroke();}
      {const q=at(.76,.5);c.fillStyle=K.topLit(P,'#4a3a28',.7);K.poly(c,[{x:q.x-9,y:q.y+2},{x:q.x+8,y:q.y+2},{x:q.x+9.4,y:q.y-3},{x:q.x-7.6,y:q.y-3}]);c.fill();c.fillStyle=sh('#5e4630',1.05);c.beginPath();c.ellipse(q.x,q.y-3,6,3.8,0,0,TAU);c.fill();c.fillStyle=rgba('#000000',.25);c.beginPath();c.ellipse(q.x,q.y-1.4,6,2.2,0,0,Math.PI);c.fill();c.fillStyle=rgba(P.light,.1+.3*LA);c.beginPath();c.ellipse(q.x-1,q.y-4.8,3.4,1.3,0,0,TAU);c.fill();}
      K.lantern(c,P,lp.x,lp.y-13.4,.95,dark);}
    bench(d0-16,d0-8);});}
function tableLive(c,t,P,still){if(P.key!=='night'&&P.key!=='dusk')return;const f=still?1:.9+.1*Math.sin(t*6.1)*Math.sin(t*2.7),lit=P.key==='night'?1:.8,q=TABLES.lamp;c.save();c.globalCompositeOperation='lighter';K.glowAt(c,q.x,q.y+1,9,'#fff0c8',.75*lit*f);K.glowAt(c,q.x,q.y+1,34,'#ffb25e',.3*lit*f);c.restore();c.globalAlpha=1;}
// The practice ground's man: a post on a foot of crossed timbers, an arm across it, a sack stuffed hard for a body and a smaller for
// a head, roped on, split where it is hit and the straw out of it; a rack of staves by it, a stone with an iron ring to lift.
function postPiece(){const P=K.pal(),Po=SO().post,sh=(col,k)=>K.shade(P,col,k),LA=P.lightA,p=Q(Po.x,0,Po.d),X=p.x-114,Yt=p.y-178,Wd=180,Ht=190;
  return K.piece('yardpost|'+P.key,X,Yt,Wd,Ht,c=>{c.save();zoom(c,p.x,p.y,1.3);const r=rng(491),body=()=>{c.beginPath();c.moveTo(p.x-15,p.y-98);c.lineTo(p.x+15,p.y-98);c.quadraticCurveTo(p.x+19,p.y-74,p.x+13,p.y-50);c.lineTo(p.x-13,p.y-50);c.quadraticCurveTo(p.x-19,p.y-74,p.x-15,p.y-98);c.closePath();};
    c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(p.x+4,p.y+1,26,4.6,0,0,TAU);c.fill();
    c.fillStyle=K.topLit(P,'#3a2c1c',.7);K.poly(c,[Q(Po.x-4,5,Po.d-15),Q(Po.x+4,5,Po.d-15),Q(Po.x+4,5,Po.d+15),Q(Po.x-4,5,Po.d+15)]);c.fill();c.fillStyle=sh('#2a1e14',1.1);c.fillRect(p.x-22,p.y-6,44,6);c.fillStyle=rgba(P.light,.08+.26*LA);c.fillRect(p.x-22,p.y-6,44,1);
    c.fillStyle=sh('#32261a',1.1);c.fillRect(p.x-3.2,p.y-124,6.4,120);c.fillStyle=rgba(P.light,.08+.26*LA);c.fillRect(p.x-3.2,p.y-124,1.2,120);
    c.fillStyle=sh('#32261a',1.1);c.fillRect(p.x-28,p.y-101,56,5);c.fillStyle=sh('#5e5240',1.05);c.fillRect(p.x-28,p.y-103.4,13,9.4);c.fillRect(p.x+15,p.y-103.4,13,9.4);c.fillStyle=rgba(P.light,.08+.26*LA);c.fillRect(p.x-28,p.y-103.4,56,1);
    c.fillStyle=sh('#6a5e4a',1.05);body();c.fill();c.save();body();c.clip();c.fillStyle=lin(c,p.x-18,0,p.x+18,0,[[0,rgba(P.light,.04+.12*LA)],[.45,rgba('#000000',0)],[1,rgba('#000000',.32)]]);c.fillRect(p.x-20,p.y-99,40,50);
    c.fillStyle=rgba('#000000',.16);for(let i=0;i<6;i++)c.fillRect(p.x-16+r()*28,p.y-96+r()*40,4+r()*5,3+r()*4);c.restore();
    c.fillStyle=sh('#3a2e20',1.05);c.fillRect(p.x-16.4,p.y-68,32.8,2.6);c.fillRect(p.x-16,p.y-91,32,2.4);
    c.fillStyle='#16110c';K.poly(c,[{x:p.x+2,y:p.y-86},{x:p.x+5.4,y:p.y-85},{x:p.x+9.4,y:p.y-72},{x:p.x+6.4,y:p.y-73}]);c.fill();
    c.strokeStyle=sh('#8c7c58',1.05);c.lineWidth=1.5;c.lineCap='round';c.beginPath();for(const [dx,dy,ex,ey] of [[4,-84,-2,-90],[6,-80,12,-84],[7,-76,1,-74],[8,-73,14,-70],[-28,-99,-34,-103],[-28,-96,-35,-95],[28,-99,34,-104],[28,-96,35,-94],[5,-78,11,-79]]){c.moveTo(p.x+dx,p.y+dy);c.lineTo(p.x+ex,p.y+ey);}c.stroke();c.lineCap='butt';
    c.fillStyle=sh('#6e624e',1.05);c.beginPath();c.ellipse(p.x,p.y-110.4,9,10.4,0,0,TAU);c.fill();c.fillStyle=rgba('#000000',.25);c.beginPath();c.ellipse(p.x+3,p.y-108,5.6,8,0,-1.2,1.6);c.fill();c.fillStyle=rgba(P.light,.06+.2*LA);c.beginPath();c.ellipse(p.x-3.4,p.y-114,3.4,4.6,0,0,TAU);c.fill();c.fillStyle=sh('#3a2e20',1.05);c.fillRect(p.x-5.4,p.y-101,10.8,2.4);
    c.restore();
    // (the rack and its staves, each longer than a man; the lifting stone)
    {c.save();zoom(c,p.x-70,p.y,1.85);const rx=p.x-70,by=p.y-3;c.fillStyle=rgba('#000000',.28);c.beginPath();c.ellipse(rx+2,by+3.6,20,3.4,0,0,TAU);c.fill();c.fillStyle=sh('#2a1e14',1.1);c.fillRect(rx-15,by-42,3.6,45);c.fillRect(rx+12,by-42,3.6,45);c.fillRect(rx-15,by-40,30.6,3.4);c.fillStyle=rgba(P.light,.08+.26*LA);c.fillRect(rx-15,by-40,30.6,1);
      for(let i=0;i<4;i++){const fx=rx-9+i*6.4,tx=fx+(i-1.5)*2.2;c.strokeStyle=sh(['#4a3a28','#3e3024','#54422e','#463626'][i],1.05);c.lineWidth=2.6;c.lineCap='butt';c.beginPath();c.moveTo(fx,by+3);c.lineTo(tx,by-80-i%2*5);c.stroke();c.strokeStyle=rgba(P.light,.1+.3*LA);c.lineWidth=1;c.beginPath();c.moveTo(fx-.9,by+3);c.lineTo(tx-.9,by-80-i%2*5);c.stroke();}
      c.restore();c.save();zoom(c,p.x+40,p.y,1.5);const wx=p.x+40;c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(wx+1.5,p.y+1,11,3,0,0,TAU);c.fill();c.fillStyle=sh('#4e4a44',1.08);K.blob(c,wx,p.y-6,10,7.4,r,10);c.fill();c.fillStyle=rgba(P.light,.06+.2*LA);c.beginPath();c.ellipse(wx-2.4,p.y-10.4,5,1.8,0,0,TAU);c.fill();c.strokeStyle=sh('#15100c',1.05);c.lineWidth=2;c.beginPath();c.arc(wx,p.y-13.4,3.4,Math.PI*.9,Math.PI*2.1);c.stroke();c.restore();}});}
// What stands in the south's picture where no one comes behind it: the quarry's stock of cut stone stacked past the floor's right
// edge, never hauled away, in courses, the far rows first; the baulk at the tram road's end; the rondel ball left on the court.
function stack(c,P){const r=rng(501);
  for(let d=-56;d>=-250;d-=62){const lv=d>-80?1:d>-150?2:3,x0=1028+r()*26;
    // (each row's shade on the ground before it, then its courses)
    {const a=Q(x0-4,0,d-16),b=Q(1180,0,d-16);c.fillStyle=rgba('#000000',.34);c.fillRect(a.x,a.y-12,b.x-a.x,16);}
    for(let z=0;z<lv;z++)for(let x=x0+z*14+r()*18;x<1170;){const w=54+r()*34,h=38+r()*6;if(r()<(z?.36:.08)){x+=w*.8;continue;}stoneBlock(c,P,x,d+r()*7-z*3,w,34+r()*12,h,r,{z:z*41,moss:!z&&r()<.5,clean:true,col:['#2e2c2a','#282725','#343230','#2a2928'][(r()*4)|0]});x+=w+2+r()*7;}}
  // (two that have come off it, out on the floor's edge)
  stoneBlock(c,P,996,-282,58,38,30,r);stoneBlock(c,P,1066,-306,50,34,27,r,{moss:true});}
function southThings(c,P){const sh=(col,k)=>K.shade(P,col,k),LA=P.lightA;stack(c,P);
  // (the baulk across the tram road's end, two posts driven in behind it)
  {const T=TRACK[TRACK.length-1],a=Q(T[0]-40,0,T[1]),b=Q(T[0]+40,0,T[1]);c.fillStyle=rgba('#000000',.3);c.fillRect(a.x-2,a.y-2,b.x-a.x+8,5);
    for(const u of [.2,.8]){const f=Q(lerp(T[0]-40,T[0]+40,u),0,T[1]+7);c.fillStyle=sh('#241a12',1.1);c.fillRect(f.x-3.4,f.y-30,6.8,30);c.fillStyle=rgba(P.light,.08+.26*LA);c.fillRect(f.x-3.4,f.y-30,1.2,30);}
    c.fillStyle=sh('#2e2218',1.1);c.fillRect(a.x,a.y-17,b.x-a.x,15);c.fillStyle=K.topLit(P,'#4a3a28',.7);K.poly(c,[{x:a.x,y:a.y-17},{x:b.x,y:b.y-17},{x:b.x+2,y:b.y-24},{x:a.x+2,y:a.y-24}]);c.fill();
    c.fillStyle=rgba('#000000',.3);for(let k=0;k<5;k++)c.fillRect(lerp(a.x,b.x,.08+k*.2),a.y-14,7,1.5);c.fillStyle=rgba(P.light,.08+.26*LA);c.fillRect(a.x,a.y-17.4,b.x-a.x,1);}
  {const q=Q(COURT.x0+74,0,COURT.d0+34),rr=7;c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(q.x+3,q.y+.6,9,2.8,0,0,TAU);c.fill();c.fillStyle=sh('#5a4634',1.05);c.beginPath();c.arc(q.x,q.y-rr,rr,0,TAU);c.fill();
    c.strokeStyle=rgba('#000000',.3);c.lineWidth=1.5;c.beginPath();c.arc(q.x-2.4,q.y-rr,rr,-.9,.9);c.stroke();c.fillStyle=rgba(P.light,.1+.3*LA);c.beginPath();c.ellipse(q.x-1.4,q.y-rr-1.8,1.8,1.1,0,0,TAU);c.fill();}}
// ---------- what moves in the south ----------
// In the picture (under the people): the water going down the gully, the drain's drips, its breath after dark and in the morning's
// cold, a pair of eyes back in the pipe now and then, a rat along the bank's foot after dark; down in the cut the fires and lamps,
// the smoke off its chimneys, birds turning in its air, its mist drifting. With reduced motion nothing of it moves, and the eyes,
// the rat and the birds are left out.
function southLive(c,t,P,still){const So=SO(),D=So.drain,T=P.key,dark=T==='night'||T==='dusk',cx=Q(D.x,0,D.d).x,cy=Q(D.x,D.r+2,D.d).y,R=D.r,kR=R/37,yL=Q(0,0,So.lip[3][1]).y;
  // (the dark in the pipe: the fight's key light is laid over the layer after it is painted and lifts every dark in it, so the mouth
  // was a brown hole. Laid again here from a small picture made once: black back in it, clear toward its floor where the day gets in)
  {const sp=K.spr('yardDrainDark',96,96,(g)=>{g.fillStyle=rad(g,56,30,4,60,[[0,'rgba(3,4,7,.93)'],[.55,'rgba(3,4,7,.8)'],[.86,'rgba(3,4,7,.3)'],[1,'rgba(3,4,7,0)']]);g.beginPath();g.arc(48,48,46,0,TAU);g.fill();});
    c.globalAlpha=T==='night'?.7:1;c.drawImage(sp,cx-R+3,cy-R+3,R*2-6,R*2-6);c.globalAlpha=1;}
  K.drawPiece(c,gratePiece());K.drawPiece(c,deadPiece());
  if(!still&&T!=='night'){c.fillStyle=rgba(K.jm(P.air[0],P.light,.5),.2+.28*P.lightA);for(let i=0;i<8;i++){const u=((t*.09+i/8)%1),[x,d]=runAt(GULLY,u),q=Q(x,0,d);c.globalAlpha=Math.sin(u*Math.PI);c.fillRect(q.x-1.4,q.y-.5,2.8,1);}c.globalAlpha=1;}
  // the drain
  if(!still){for(const [per,ox,ph] of [[3.7,-9*kR,0],[5.9,12*kR,2.1]]){const u=((t+ph)%per)/per,x=cx+ox,y0=cy-Math.sqrt(R*R-ox*ox)+4,y1=cy+R-6;
      if(u<.3){c.fillStyle=rgba('#cfe0e8',.5);c.beginPath();c.ellipse(x,y0+u*3,.9,1+u*2,0,0,TAU);c.fill();}
      else if(u<.4){const k=(u-.3)/.1;c.fillStyle=rgba('#cfe0e8',.5);c.fillRect(x-.5,lerp(y0+2,y1-2,k*k),1,2.4);}
      else if(u<.9){const k=(u-.4)/.5;c.strokeStyle=rgba('#d8e8f0',.36*(1-k));c.lineWidth=1;c.beginPath();c.ellipse(x,y1,1+k*7,(1+k*7)*.26,0,0,TAU);c.stroke();}}
    // (the eyes: low in the pipe, a little while, a blink, gone)
    {const per=23,n=Math.floor(t/per),u=(t-n*per)/2.4;if(u<1&&hsh(n*7+5)<.8){const ex=cx+(-14+hsh(n*3+2)*24)*kR,ey=cy+(6+hsh(n*5+1)*10)*kR,a=Math.sin(u*Math.PI)*(u>.45&&u<.52?0:1);c.fillStyle=rgba('#ffb070',.85*a);c.fillRect(ex-3.6,ey,2,1.5);c.fillRect(ex+1.8,ey,2,1.5);}}}
  {const k=T==='night'?1:T==='dusk'?.8:T==='morning'?.9:.3,sp=K.puffSpr(T==='day'?'#b8b0a6':'#c4d2e2');for(let i=0;i<3;i++){const u=still?.3+i*.2:((t*.05+i/3)%1),rr=(12+u*30)*kR;c.globalAlpha=.16*k*Math.sin(u*Math.PI);c.drawImage(sp,cx-4+u*26+Math.sin(i*2+u*3)*5-rr,cy+R*.5+u*16-rr*.36,rr*2,rr*.72);}c.globalAlpha=1;}
  // (the keeping candles at the face's foot, after dark: one of them is out)
  if(dark){c.save();c.globalCompositeOperation='lighter';DRAINS.cands.forEach((q,i)=>{if(i===2)return;const f=still?1:.8+.2*Math.sin(t*(8+i*1.9)+i*2)*Math.sin(t*2.7+i);K.glowAt(c,q.x,q.y-2,12,'#ffb070',.34*f);c.globalAlpha=.9;c.fillStyle='#ffd9a8';c.beginPath();c.ellipse(q.x+(still?0:Math.sin(t*6+i)*.3),q.y-3.2,1,2.2*f,0,0,TAU);c.fill();});c.restore();c.globalAlpha=1;}
  // (a rat: out from under the bank's end, along its foot, and in again)
  if(!still&&dark){const per=29,n=Math.floor(t/per),u=(t-n*per)/1.7;if(u<1){const B=So.bank,dir=hsh(n*11+3)<.5?1:-1,x0=dir>0?B.x1+4:B.x1+88,x=x0+dir*u*84,q=Q(x,0,B.d0+66+Math.sin(u*9)*2),hop=Math.abs(Math.sin(u*26))*1.2;
      c.fillStyle='#120f0e';c.beginPath();c.ellipse(q.x,q.y-2.4-hop,4.4,2.3,0,0,TAU);c.ellipse(q.x+dir*4,q.y-2.8-hop,2,1.6,0,0,TAU);c.fill();c.fillRect(dir>0?q.x-10:q.x+4.4,q.y-2.2-hop,6,1);}}
  // the cut
  c.save();c.globalCompositeOperation='lighter';
  for(let i=0;i<DROPF.fires.length;i++){const f=DROPF.fires[i];if(f.smoke)continue;const fl=still?.85:.72+.28*Math.sin(t*(7+i*.9)+i)*Math.sin(t*2.3+i*1.7);
    if(f.lamp){if(dark)K.glowAt(c,f.x,f.y,9,'#ffb070',.5*fl);continue;}
    K.glowAt(c,f.x,f.y,(13+6*fl)*f.s,'#ff8a4a',(.2+.5*P.fire)*fl*(1-f.hz*.5));c.globalAlpha=(.4+.5*P.fire)*(1-f.hz*.4);c.fillStyle='#ffb070';c.fillRect(f.x-1.2*f.s,f.y-2.4*f.s*fl,2.4*f.s,2.4*f.s*fl);}
  c.restore();c.globalAlpha=1;
  {const srcs=[];for(const f of DROPF.fires)if(f.smoke)srcs.push({x:f.x,y:f.y,s:2.2*f.s,sp:.07,n:4,h:44*f.s,dx:10,a:.3*(1-f.hz*.4),ph:f.x*.017});K.smoke(c,srcs,still?3:t,P.smoke,T==='night'?.5:.9);}
  if(!still){// (birds, seen from over them: three, turning slowly, small)
    c.fillStyle=rgba(K.jm('#1c1814',P.air[1],.35),.8);for(let i=0;i<3;i++){const a=t*(.22+i*.05)+i*2.1,bx=860+i*90+Math.cos(a)*(70+i*20),by=yL+92+i*26+Math.sin(a)*(16+i*5),fl=Math.sin(t*(5+i))*1.6,dx=-Math.sin(a),dy=Math.cos(a)*.3,s=2.6-i*.4;
      c.beginPath();c.moveTo(bx+dx*s,by+dy*s);c.lineTo(bx-dy*s*3.4,by+dx*s*1.2-fl);c.lineTo(bx-dx*s*.6,by-dy*s*.6);c.lineTo(bx+dy*s*3.4,by-dx*s*1.2-fl);c.closePath();c.fill();}
    // (the mist in it: two wide wisps going slowly along)
    const sp=K.puffSpr(T==='night'?'#3a3a48':'#b8a890');for(let i=0;i<3;i++){const x=((i*430+t*(5+i*2))%1100)+420,y=yL+70+i*64;c.globalAlpha=(T==='morning'?.2:.11)*(T==='night'?.6:1);c.drawImage(sp,x-190,y-24,380,48);}c.globalAlpha=1;}}
// On the pieces (over whoever stands behind them). The rail: the hoist's fall and its basket swinging out over the cut, the rags
// on the rail, the keeping candles' flames after dark. The main: the tap's drip, the leak's. The fire: its embers and a thread
// of smoke. The shed: its stovepipe's smoke, its lantern after dark.
function railLive(c,t,P,still){const sh=(col,k)=>K.shade(P,col,k),dark=P.key==='night'||P.key==='dusk',pu=RAILS.pulley;
  {const a=still?0:.04*windAt(t*.5+1,700)+.014*Math.sin(t*1.3),L2=96,x1=pu.x+Math.sin(a)*L2,y1=pu.y+Math.cos(a)*L2;c.strokeStyle=sh('#6a5a44',1.05);c.lineWidth=1.5;c.beginPath();c.moveTo(pu.x,pu.y+3);c.lineTo(x1,y1);c.stroke();
    c.save();c.translate(x1,y1);c.rotate(-a*.6);c.strokeStyle=sh('#6a5a44',1.05);c.beginPath();c.moveTo(0,0);c.lineTo(-7,8);c.moveTo(0,0);c.lineTo(7,8);c.stroke();
    c.fillStyle=sh('#4a3a28',1.05);c.beginPath();c.moveTo(-8,8);c.lineTo(8,8);c.lineTo(6.4,19);c.lineTo(-6.4,19);c.closePath();c.fill();c.fillStyle=rgba('#000000',.3);for(let q=-6;q<7;q+=3)c.fillRect(q,8,1,11);c.fillRect(-7.6,12.6,15.2,1.2);c.fillStyle=rgba(P.light,.08+.24*P.lightA);c.fillRect(-8,8,16,1);c.restore();}
  for(let i=0;i<RAILS.rags.length;i++){const g=RAILS.rags[i],w=still?.25:windAt(t+i*1.3,g.x)*.9+.25,l=g.len;c.fillStyle=sh(g.col,1.05);c.beginPath();c.moveTo(g.x-1.6,g.y);c.lineTo(g.x+1.6,g.y);
    c.quadraticCurveTo(g.x+2+w*l*.5,g.y+l*.5,g.x+1.6+w*l*.9,g.y+l*(1-Math.abs(w)*.18));c.lineTo(g.x-.6+w*l*.8,g.y+l*.8);c.quadraticCurveTo(g.x-2+w*l*.4,g.y+l*.5,g.x-1.6,g.y);c.closePath();c.fill();}
  if(dark){c.save();c.globalCompositeOperation='lighter';RAILS.lamps.forEach((q,i)=>{const f=still?1:.9+.1*Math.sin(t*(5.3+i*.7)+i*2)*Math.sin(t*2.1+i);K.glowAt(c,q.x,q.y+8,9,'#fff0c8',.7*f);K.glowAt(c,q.x,q.y+8,32,'#ffb25e',.26*f);});
    RAILS.cands.forEach((q,i)=>{if(i===3)return;const f=still?1:.8+.2*Math.sin(t*(9+i*1.7)+i*2)*Math.sin(t*3.1+i);K.glowAt(c,q.x,q.y-2,12,'#ffb070',.34*f);c.globalAlpha=.9;c.fillStyle='#ffd9a8';c.beginPath();c.ellipse(q.x+(still?0:Math.sin(t*6+i)*.3),q.y-3.2,1,2.2*f,0,0,TAU);c.fill();});c.restore();c.globalAlpha=1;}}
function mainLive(c,t,P,still){if(still)return;for(const [m,per,ph] of [[MAINS.tap,2.3,0],[MAINS.leak,1.1,.4]]){const u=((t+ph)%per)/per,x=m.x,y0=m.y,y1=m.g;
    if(u<.34){c.fillStyle=rgba('#cfe0e8',.55);c.beginPath();c.ellipse(x,y0+1+u*2,1,1+u*1.6,0,0,TAU);c.fill();}
    else if(u<.5){const k=(u-.34)/.16;c.fillStyle=rgba('#cfe0e8',.55);c.fillRect(x-.5,lerp(y0+2,y1-1,k*k),1,2.4);}
    else if(u<.95){const k=(u-.5)/.45;c.strokeStyle=rgba('#d8e8f0',.38*(1-k));c.lineWidth=1;c.beginPath();c.ellipse(x,y1,1.5+k*6,(1.5+k*6)*.3,0,0,TAU);c.stroke();}}}
function fireLive(c,t,P,still){const F=SO().fire,p=Q(F.x,0,F.d),k=P.key==='night'?1:P.key==='dusk'?.8:.25,f=still?.85:.72+.28*Math.sin(t*8.3)*Math.sin(t*2.7);
  c.save();c.globalCompositeOperation='lighter';K.glowAt(c,p.x,p.y-2,26+6*f,'#ff8a4a',.4*k*f,.6);c.fillStyle='#ff9a50';for(let i=0;i<6;i++){const a=i*1.9+1,e=still?.7:.5+.5*Math.sin(t*(2.1+i*.7)+i*3);c.globalAlpha=(.25+.6*k)*e;c.fillRect(p.x+Math.cos(a)*(4+i*1.5)-1,p.y+Math.sin(a)*3-1,2,1.6);}c.restore();c.globalAlpha=1;
  K.smoke(c,[{x:p.x+2,y:p.y-6,s:2.6,sp:.11,n:5,h:74,dx:12,a:.26+.2*k}],still?2:t,P.smoke,P.key==='night'?.6:1);}
function shedLive(c,t,P,still){const dark=P.key==='night'||P.key==='dusk';K.smoke(c,[{x:SHEDS.pipe.x,y:SHEDS.pipe.y-2,s:3.6,sp:.1,n:6,h:110,dx:20,a:.42}],still?2:t,P.smoke,P.key==='night'?.6:1);
  if(dark){const f=still?1:.9+.1*Math.sin(t*6.7)*Math.sin(t*2.3),lit=P.key==='night'?1:.8;c.save();c.globalCompositeOperation='lighter';K.glowAt(c,SHEDS.lamp.x,SHEDS.lamp.y+7,9,'#fff0c8',.75*lit*f);K.glowAt(c,SHEDS.lamp.x,SHEDS.lamp.y+7,38,'#ffb25e',.32*lit*f);c.restore();c.globalAlpha=1;}}
// the south's pieces, each at its depth (a thing that runs back from us, at its front); the rail before everyone (nobody stands
// beyond it). What moves on a piece that was made bigger is drawn through the same zoom (zl)
function southPieces(out){const So=SO(),P=K.pal(),still=typeof reduceMotion!=='undefined'&&reduceMotion,t=typeof S!=='undefined'&&S?S.t:0,zl=(c,z,fn)=>{c.save();zoom(c,z[0],z[1],z[2]);fn();c.restore();};
  out.push({d:So.shed.d0,draw:c=>{K.drawPiece(c,shedSPiece());zl(c,SHEDS.z,()=>shedLive(c,t,P,still));}});
  out.push({d:So.fire.d,draw:c=>{K.drawPiece(c,firePiece());const p=Q(So.fire.x,0,So.fire.d);zl(c,[p.x,p.y,So.fire.k||1],()=>fireLive(c,t,P,still));}});
  out.push({d:So.cart.d-18*(So.cart.k||1),draw:c=>K.drawPiece(c,cartPiece())});
  out.push({d:So.beds[0][2]-3,draw:c=>K.drawPiece(c,gardenPiece(0))});out.push({d:So.beds[1][2]-3,draw:c=>K.drawPiece(c,gardenPiece(1))});
  out.push({d:So.tree.d,draw:c=>{K.drawPiece(c,treePiece());zl(c,TREES.z,()=>treeLive(c,t,P,still));}});
  out.push({d:So.wagon.d0,draw:c=>K.drawPiece(c,wagonPiece())});
  out.push({d:So.table.d0-16*(So.table.k||1),draw:c=>{K.drawPiece(c,tablePiece());zl(c,TABLES.z,()=>tableLive(c,t,P,still));}});
  out.push({d:So.post.d,draw:c=>K.drawPiece(c,postPiece())});
  out.push({d:So.kerb+3,draw:c=>{K.drawPiece(c,mainPiece());mainLive(c,t,P,still);}});
  out.push({d:So.z0-600,draw:c=>{K.drawPiece(c,railPiece());railLive(c,t,P,still);}});}
// The shadows of the south's pieces on the ground (they stand in the frame, their shadows in the picture): at their feet, and
// thrown away from the sun where there is one. By day the heap's own lies over the drain.
function southShadows(c,P){const So=SO(),sd=sunDir(),B=So.shed,F=So.fire,C0=So.cart,D=So.drain,col='#0c121c',ta=thrownA(P);
  const lay=(x,d,w,len,dd,a)=>{const p0=Q(x,0,d-dd),p1=Q(x,0,d+dd),e=Q(x+sd*len,0,d);c.fillStyle=lin(c,p0.x,0,e.x,0,[[0,rgba(col,a??.26)],[.5,rgba(col,(a??.26)*.45)],[1,rgba(col,0)]]);
    c.beginPath();c.moveTo(p0.x-sd*w,p0.y);c.lineTo(e.x,e.y+(p0.y-p1.y)*.3);c.lineTo(e.x,e.y-(p0.y-p1.y)*.3);c.lineTo(p1.x-sd*w,p1.y);c.closePath();c.fill();};
  c.fillStyle=rgba('#000000',.3);{const p=Q(F.x,0,F.d);c.beginPath();c.ellipse(p.x+2,p.y+1,F.r+12,(F.r+8)*.6,0,0,TAU);c.fill();}
  {const a=Q(So.kerb?toeX(So.kerb)+8:0,0,So.kerb+7),b=Q(So.lip[3][0]+6,0,So.kerb+7);c.fillStyle=rgba('#000000',.22);c.fillRect(a.x,a.y-3,b.x-a.x,4.6);}
  for(const x of [809,886]){const p=Q(x,0,lipAt(848)+8);c.beginPath();c.ellipse(p.x,p.y,13,3.4,0,0,TAU);c.fill();}
  {const T0=So.tree,q=Q(T0.x,0,T0.d);c.beginPath();c.ellipse(q.x+3,q.y+1,30,6,0,0,TAU);c.fill();const Po=So.post,p2=Q(Po.x,0,Po.d);c.beginPath();c.ellipse(p2.x+3,p2.y+1,30,5,0,0,TAU);c.fill();}
  if(sd){lay(sd>0?B.x1:B.x0,(B.d0+B.d1)/2,4,B.h*.9,(B.d1-B.d0)/2,.3);lay(F.x,F.d,14,104,10,.2);lay(sd>0?C0.x1-26:C0.x0+10,C0.d,12,84,20,.26);lay(718,lipAt(718)+12,3,200,3,.24);
    for(let i=0;i<RPX.length;i++)lay(RPX[i],lipAt(RPX[i])+6,1,i===3||i===8?150:60,1.6,.2);lay(848,lipAt(848)+10,30,40,9,.2);
    {const T0=So.tree,Wg=So.wagon,Tb=So.table,Po=So.post;lay(T0.x,T0.d,6,200,4,.24);{const q=Q(T0.x+sd*130,0,T0.d);c.fillStyle=rgba(col,ta*.5);c.beginPath();c.ellipse(q.x,q.y,66,13,0,0,TAU);c.fill();}
      lay(sd>0?Wg.x1:Wg.x0,(Wg.d0+Wg.d1)/2,6,94,(Wg.d1-Wg.d0)/2,.28);lay(sd>0?Tb.x1:Tb.x0,(Tb.d0+Tb.d1)/2,6,56,40,.22);lay(Po.x,Po.d,5,150,4,.24);lay(Po.x-70,Po.d,6,140,4,.2);
      for(const b of So.beds)lay(sd>0?b[1]:b[0],(b[2]+b[3])/2,3,18,(b[3]-b[2])/2,.2);lay(So.crow.x,So.crow.d,5,130,3,.22);
      if(sd<0)lay(1028,-150,6,120,100,.26);}
    // (the headwall's and the wing's on the apron and the ground beside it; by day the heap's, long over the forecourt)
    lay(sd>0?D.x+D.r+23:D.x-D.r-23,D.d-8,6,56,10,.24);
    if(sd>0){c.save();c.beginPath();const T2=HTOE.filter(([d])=>d<=D.d&&d>=-760);T2.forEach(([d,x],i)=>{const p=Q(x,0,d);i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y);});for(let i=T2.length-1;i>=0;i--){const [d,x]=T2[i],p=Q(x+170-Math.abs(d+440)*.2,0,d);c.lineTo(p.x,p.y);}c.closePath();c.clip();
      c.fillStyle=lin(c,-70,0,130,0,[[0,rgba(col,ta*.95)],[.6,rgba(col,ta*.5)],[1,rgba(col,0)]]);c.fillRect(-200,660,400,YFOOT-650);c.restore();}}}
// ---------- the light over it all ----------
function lightPass(c,P){const Yd=Y(),T=P.key,far=Yd.far;
  c.save();c.globalCompositeOperation='lighter';
  if(T==='night'){// the back door's light out over the step and the yard; the window's patch; the lantern's pool, the gate's lamp
    const D=Yd.door,dp=Q(D.x,0,far-30);K.cRad(c,dp.x,dp.y,6,170,'#ffa850',.34,.42);
    const dg=Q(D.x,70,far);K.cRad(c,dg.x,dg.y,4,110,'#ff9a4a',.14,1);
    const W0=Yd.window,wp=Q((W0.x0+W0.x1)/2-20,0,far-60);K.cRad(c,wp.x,wp.y,4,90,'#ffb25e',.14,.4);
    const lp=Q(LANT.x,0,LANT.d-30);K.cRad(c,lp.x,lp.y,4,80,'#ffcf86',.1,.45);
    const gp=Q(FENCE.x-20,0,Yd.gate.d);K.cRad(c,gp.x,gp.y,4,70,'#ffcf86',.1,.45);
    const gf=Q(FENCE.x,46,Yd.gate.d-10);K.cRad(c,gf.x,gf.y,4,50,'#ffb25e',.12,1.4);
    const df=Q(DRUM.x,0,DRUM.d);K.cRad(c,df.x,df.y,6,120,'#ff9a4a',.22,.45);K.cRad(c,df.x-30,df.y-40,6,90,'#ff9a4a',.08,1);}
  // (the south's lights on its ground, after dark and at dusk: the shed's lantern before its door, the fire ring's embers, the candles)
  if(T==='night'||T==='dusk'){const So=SO(),k=T==='night'?1:.5,sl=Q(So.shed.x0+38*(So.shed.k||1),0,So.shed.d0-30),fr=Q(So.fire.x,0,So.fire.d),cd=Q(940,0,lipAt(940)+14);
    K.cRad(c,sl.x,sl.y,4,96,'#ffcf86',.13*k,.45);K.cRad(c,fr.x,fr.y,6,84,'#ff9a4a',.16*k,.5);K.cRad(c,cd.x,cd.y,3,44,'#ffb070',.1*k,.5);
    // (the table's lantern, the lamps strung along the lip, the candles at the drain)
    {const Tb=So.table,D=So.drain,tl=Q(lerp(Tb.x0,Tb.x1,.62),0,(Tb.d0+Tb.d1)/2),ls=Q(880,0,lipAt(880)+24),dc=Q(D.x-D.r-12,0,D.d-12);
      K.cRad(c,tl.x,tl.y,4,90,'#ffcf86',.14*k,.5);K.cRad(c,ls.x,ls.y,10,170,'#ffcf86',.09*k,.36);K.cRad(c,dc.x,dc.y,3,44,'#ffb070',.1*k,.5);}}
  else{// the daylight falling down the Pit into the yard: the middle of it lighter
    const m=Q(520,0,110);K.cRad(c,m.x,m.y,20,520,P.light,T==='morning'?.1:.08,.36);}
  c.restore();
  // the sun's light down the wall and over the yard, by day and by morning (the kit's: shafts from over the rim, the slate shadows)
  K.sunlight(c,P,-200,1240,-640,GB+30,SUNO);
  // (the sun's wash and the shade's blue run on down the floor, since V118: the kit's light stops at the old floor's front, where the
  // picture used to go dark, and left a line across the ground there. Its two veils as they stand at its foot, to the picture's)
  {const S2=K.sun();if(S2){const left=S2.x<520,x0=-200,x1=1240,y0=GB+30,y1=YFOOT+5,kc=S2.cool||1;
      c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,left?x0:x1,0,left?x1:x0,0,[[0,rgba(S2.col,.15)],[.55,rgba(S2.col,.04)],[1,rgba(S2.col,0)]]);c.fillRect(x0,y0,x1-x0,y1-y0);c.restore();
      c.fillStyle=lin(c,left?x0:x1,0,left?x1:x0,0,[[0,rgba('#24303e',0)],[1,rgba('#24303e',.14*kc)]]);c.fillRect(x0,y0,x1-x0,y1-y0);
      c.fillStyle=rgba('#202a36',.14*kc);c.fillRect(x0,y0,x1-x0,y1-y0);}}
  // (the dark at the walls' feet: at each wall's own foot, eased in from above since V118. It began as a hard line a hand over the
  // Sump's foot, right across the yard: it cut through whatever stood at the wall and lay as a band on the yard wall's bricks)
  for(const [xa,xb,dw] of [[-200,SHED.x1+far*PSX,far],[SHED.x1+far*PSX,FENCE.x+Yd.wall.d*PSX+6,Yd.wall.d]]){const yw=Q(0,0,dw).y,yf=Q(0,0,dw-50).y;
    c.fillStyle=lin(c,0,yw-12,0,yf,[[0,rgba('#000000',0)],[12/(yf-yw+12),rgba('#000000',.3)],[1,rgba('#000000',0)]]);c.fillRect(xa,yw-12,xb-xa,yf-yw+12);}
  // (the light falling off toward us: it began at the old floor's front and was held from there on; since V118 the floor runs on
  // south, and the fall begins past its foot, over the lane)
  {const y0=GB-40,y1=YFOOT,yk=Q(0,0,SO().kerb).y,nt=T==='night',st=[[y0,0],[yk-5,.07],[yk+60,nt?.3:.2],[yk+165,nt?.62:.5],[y1,nt?.74:.64]];
    c.fillStyle=lin(c,0,y0,0,y1,st.map(([y,a])=>[(y-y0)/(y1-y0),rgba('#000000',a)]));c.fillRect(-200,y0,1440,y1-y0);}
  if(T==='morning'){// mist lying on the floor of the Pit: over the far shacks' feet, along the yard's walls, low over the yard (blue in
    // the shade, as the sun's shafts cross it warm: since V81, a pale grey that took the colour out of everything)
    c.fillStyle=lin(c,0,110,0,GB,[[0,rgba('#9cb8ec',0)],[.32,rgba('#9cb8ec',.27)],[.5,rgba('#9cb8ec',.18)],[.75,rgba('#9cb8ec',.09)],[1,rgba('#9cb8ec',.04)]]);c.fillRect(-200,110,1400,GB-110);
    // (on the sun's side the low light through the mist turns the yard warm, its own values kept ('color'); the side away keeps the
    // shade's blue: since V90, a wide screen saw the morning's yard all cold)
    {const S2=K.sun(),sx=S2&&S2.x>500?1120:-120;c.save();c.globalCompositeOperation='color';c.translate(sx,250);c.scale(1.5,.8);
      c.fillStyle=rad(c,0,0,0,560,[[0,rgba('#e0a070',.62)],[.4,rgba('#e0a070',.38)],[.75,rgba('#e0a070',.1)],[1,rgba('#e0a070',0)]]);c.fillRect(-560,-560,1120,1120);c.restore();}
    // (lying in wisps, not one even veil: the kit's mottle over it)
    K.mottle(c,-200,110,1240,GB+40,.26,{sc:1.4,sy:.5});}}
// ---------- the scene ----------
function paint(c){const P=K.pal(),X0=-170,X1=W+250,T0=-110;
  backdrop(c,P,X0,X1,T0);neighbours(c,P);beyond(c,P);
  ground(c,P);
  dropView(c,P);kerb(c,P);hill(c,P);drain(c,P);southThings(c,P);
  sump(c,P);shed(c,P);sideStair(c,P);stairFence(c,P);ladder(c,P);yardWall(c,P);along(c,P);wallThings(c,P);drumFire(c,P);fence(c,P);
  // the contact shadows of the pieces that stand among the people
  {const Yd=Y();c.fillStyle=rgba('#000000',.3);for(const B0 of Yd.barrels){const p=Q(B0.x,0,B0.d);c.beginPath();c.ellipse(p.x+2,p.y,B0.r+5,B0.r*.36,0,0,TAU);c.fill();}
    const pm=Q(Yd.pump.x,0,Yd.pump.d);c.beginPath();c.ellipse(pm.x+3,pm.y,Yd.pump.r+8,Yd.pump.r*.42,0,0,TAU);c.fill();
    const t0=Q(Yd.trough.x0-2,0,Yd.trough.d-17),t1=Q(Yd.trough.x1+4,0,Yd.trough.d+17);c.fillRect(t0.x,t1.y,t1.x-t0.x,t0.y-t1.y);
    // (and what each throws along the ground away from the sun, long and soft, since V118)
    const sd=sunDir();if(sd){const lay=(x,d,w,len,dd)=>{const a=Q(x,0,d-dd),b=Q(x,0,d+dd),e=Q(x+sd*len,0,d);c.fillStyle=lin(c,a.x,0,e.x,0,[[0,rgba('#0c121c',.26)],[.5,rgba('#0c121c',.12)],[1,rgba('#0c121c',0)]]);
        c.beginPath();c.moveTo(a.x-sd*w,a.y);c.lineTo(e.x,e.y+(a.y-b.y)*.3);c.lineTo(e.x,e.y-(a.y-b.y)*.3);c.lineTo(b.x-sd*w,b.y);c.closePath();c.fill();};
      for(const B0 of Yd.barrels)lay(B0.x,B0.d,B0.r*.5,B0.r*3.6,B0.r*.5);for(const Cr of Yd.crates)lay(Cr.x,Cr.d,Cr.w*.3,Cr.h*1.5,Cr.w*.45);
      lay(Yd.pump.x,Yd.pump.d,9,138,9);lay(Yd.trough.x1,Yd.trough.d,14,44,14);}}
  southShadows(c,P);
  lightPass(c,P);
  dropShade(c,P);crisp(c,P);southOver(c,P);growth(c,P);}
// ---------- the pieces that stand among the people: the pump, the trough, the barrels, the crates ----------
function pumpPiece(){const Yd=Y(),P=K.pal(),Pm=Yd.pump,c0=Q(Pm.x,0,Pm.d),pk=Pm.k||1,R=Pm.r;
  return K.piece('yardpump|'+P.key,...grown(c0.x,c0.y-14,pk,c0.x-48,c0.y-82,92,102),c=>{const sh=(col,k)=>K.shade(P,col,k);
    // the stone base: a square block, its top worn and wet
    const bh=14,A=Q(Pm.x-R,0,Pm.d-R*.8),B=Q(Pm.x+R,0,Pm.d-R*.8),Bt=Q(Pm.x+R,bh,Pm.d-R*.8),At=Q(Pm.x-R,bh,Pm.d-R*.8),Ct=Q(Pm.x+R,bh,Pm.d+R*.8),Dt=Q(Pm.x-R,bh,Pm.d+R*.8),Cb=Q(Pm.x+R,0,Pm.d+R*.8);
    c.fillStyle=sh('#36322e',1.4);K.poly(c,[B,Cb,Ct,Bt]);c.fill();c.fillStyle=sh('#4a4640',1.1);K.poly(c,[A,B,Bt,At]);c.fill();c.fillStyle=K.topLit(P,'#56524c',1);K.poly(c,[At,Bt,Ct,Dt]);c.fill();
    c.strokeStyle=rgba('#000000',.35);c.lineWidth=1.57;c.beginPath();c.moveTo(lerp(A.x,B.x,.45),A.y);c.lineTo(lerp(At.x,Bt.x,.5),At.y);c.moveTo(A.x,lerp(A.y,At.y,.5));c.lineTo(lerp(A.x,B.x,.45),lerp(A.y,At.y,.5));c.stroke();
    c.fillStyle=rgba(jm2(P.air[0],P.light,.2),.3);c.beginPath();const wp=Q(Pm.x+6,bh,Pm.d-4);c.ellipse(wp.x,wp.y,9,2.6,0,0,TAU);c.fill();
    // the iron column, its cap, the spout to the right over the trough
    const p=Q(Pm.x,bh,Pm.d),ch=48;c.save();zoom(c,p.x,p.y,pk);c.fillStyle=lin(c,p.x-6,0,p.x+6,0,[[0,sh('#1a1c20',1.3)],[.35,K.topLit(P,'#34383e',1)],[.65,sh('#22252a')],[1,sh('#121316',1.4)]]);
    c.beginPath();c.moveTo(p.x-6.5,p.y);c.lineTo(p.x-5,p.y-ch);c.lineTo(p.x+5,p.y-ch);c.lineTo(p.x+6.5,p.y);c.closePath();c.fill();
    c.fillStyle=sh('#202226');c.fillRect(p.x-8,p.y-3,16,3);c.fillRect(p.x-7,p.y-ch-4,14,5);c.fillStyle=K.topLit(P,'#383c42',1.2);c.beginPath();c.ellipse(p.x,p.y-ch-4,7,2.2,0,0,TAU);c.fill();
    c.fillStyle=sh('#202226');c.beginPath();c.arc(p.x,p.y-ch-7,3,Math.PI,0);c.fill();
    c.fillStyle=sh('#1c1e22');c.beginPath();c.moveTo(p.x+4,p.y-ch+12);c.lineTo(p.x+20,p.y-ch+14);c.lineTo(p.x+21,p.y-ch+20);c.lineTo(p.x+17,p.y-ch+19);c.lineTo(p.x+16,p.y-ch+17);c.lineTo(p.x+4,p.y-ch+18);c.closePath();c.fill();
    c.fillStyle=rgba(P.light,.12+.35*P.lightA);c.fillRect(p.x+5,p.y-ch+12.4,14,.9);
    // (the handle is drawn live, pumpHandle: it goes down under his hand)
    c.strokeStyle=rgba(P.light,.1+.4*P.lightA);c.lineWidth=1.04;c.beginPath();c.moveTo(p.x-4.6,p.y-2);c.lineTo(p.x-3.6,p.y-ch+2);c.stroke();
    c.fillStyle=rgba('#7a3a14',.32);c.fillRect(p.x+1,p.y-ch+20,2,24);c.fillRect(p.x-3,p.y-ch+4,1.4,12);
    // Tarr's tag on the column, a rag of the Pump King's blue through it: the Sump's water is his, paid on the first
    c.fillStyle=sh('#6a665e',.9);c.fillRect(p.x-10,p.y-ch+24,6,8);c.fillStyle=rgba('#000000',.35);c.fillRect(p.x-9,p.y-ch+26,4,.7);c.fillRect(p.x-9,p.y-ch+28.4,3,.7);
    c.fillStyle=K.shade(P,'#2f5c7c',.8);c.beginPath();c.moveTo(p.x-7,p.y-ch+22);c.lineTo(p.x-3,p.y-ch+21);c.lineTo(p.x-5,p.y-ch+33);c.lineTo(p.x-7.5,p.y-ch+31);c.closePath();c.fill();c.restore();});}
// the pump's handle, live: an iron lever from the column's head back to its wooden grip, where the game has it (pumpGrip in
// sk_pit2.js: it goes down under his hand and comes up again)
function pumpHandle(c){const Yd=Y(),P=K.pal(),Pm=Yd.pump,A=typeof S!=='undefined'&&S?S.act1:null,pk=Pm.k||1,g0=typeof pumpGrip==='function'?pumpGrip(A&&A.pumpA):{x:Pm.x-33*pk,h:14+50*pk},g={x:Pm.x+(g0.x-Pm.x)/pk,h:14+(g0.h-14)/pk},c0=Q(Pm.x,14,Pm.d);
  c.save();zoom(c,c0.x,c0.y,pk);const pv=Q(Pm.x-2,64,Pm.d),e=Q(g.x,g.h,Pm.d),ux=e.x-pv.x,uy=e.y-pv.y,L=Math.hypot(ux,uy)||1,nx=-uy/L,ny=ux/L,sh=(col,k)=>K.shade(P,col,k);
  c.lineCap='round';c.strokeStyle=sh('#1a1c20');c.lineWidth=3.2;c.beginPath();c.moveTo(pv.x,pv.y);c.quadraticCurveTo(pv.x+ux*.45+nx*7,pv.y+uy*.45+ny*7,pv.x+ux*.84,pv.y+uy*.84);c.stroke();
  c.strokeStyle=sh('#4e3a28');c.lineWidth=4;c.beginPath();c.moveTo(pv.x+ux*.82,pv.y+uy*.82);c.lineTo(pv.x+ux*1.16,pv.y+uy*1.16);c.stroke();c.lineCap='butt';
  c.fillStyle=sh('#2e3034');c.beginPath();c.arc(pv.x,pv.y,2.4,0,TAU);c.fill();c.restore();}
function troughPiece(){const Yd=Y(),P=K.pal(),Tr=Yd.trough,tk=Tr.k||1,T0={x0:Tr.x0,x1:Tr.x0+(Tr.x1-Tr.x0)/tk,d:Tr.d},tz=Q(Tr.x0,0,Tr.d),d0=T0.d-9,d1=T0.d+9,h=18,a=Q(T0.x0,h+4,d1),b=Q(T0.x1,0,d0);
  return K.piece('yardtrough|'+P.key,...grown(tz.x,tz.y,tk,a.x-4,a.y-6,b.x-a.x+30,b.y-a.y+12),c=>{zoom(c,tz.x,tz.y,tk);const sh=(col,k)=>K.shade(P,col,k),x0=T0.x0,x1=T0.x1;
    c.fillStyle=sh('#403c37',1.1);K.poly(c,[Q(x0,0,d0),Q(x1,0,d0),Q(x1,h,d0),Q(x0,h,d0)]);c.fill();
    c.fillStyle=sh('#302c28',1.4);K.poly(c,[Q(x1,0,d0),Q(x1,0,d1),Q(x1,h,d1),Q(x1,h,d0)]);c.fill();
    c.fillStyle=K.topLit(P,'#4e4a44',1);K.poly(c,[Q(x0,h,d0),Q(x1,h,d0),Q(x1,h,d1),Q(x0,h,d1)]);c.fill();
    const sky=P.key==='night'?'#3a3440':jm2(P.air[0],P.light,.3);c.fillStyle=rgba('#0c100e',.92);K.poly(c,[Q(x0+3,h,d0+3),Q(x1-3,h,d0+3),Q(x1-3,h,d1-3),Q(x0+3,h,d1-3)]);c.fill();
    c.fillStyle=rgba(sky,.4);K.poly(c,[Q(x0+5,h,d1-8),Q(x1-8,h,d1-8),Q(x1-10,h,d1-4),Q(x0+8,h,d1-4)]);c.fill();
    c.fillStyle=rgba('#3e5a32',.35);K.poly(c,[Q(x0,h-2,d0),Q(x1,h-2,d0),Q(x1,h-8,d0),Q(x0,h-6,d0)]);c.fill();
    c.strokeStyle=rgba('#000000',.4);c.lineWidth=1.57;c.beginPath();const m=Q(x0+22,0,d0),m2=Q(x0+24,h,d0);c.moveTo(m.x,m.y);c.lineTo(m2.x,m2.y);c.stroke();
    c.fillStyle=rgba(P.light,.1+.35*P.lightA);K.poly(c,[Q(x0,h,d0),Q(x1,h,d0),Q(x1,h-1,d0),Q(x0,h-1,d0)]);c.fill();});}
function barrelPiece(B0,i){const P=K.pal(),p=Q(B0.x,0,B0.d),bk=B0.k||1,br=B0.r/bk,h=br*2.5;
  return K.piece('yardbarrel'+i+'|'+P.key,...grown(p.x,p.y,bk,p.x-br-8,p.y-h-br,br*2+16,h+br*1.6),c=>{zoom(c,p.x,p.y,bk);barrel(c,P,p.x,p.y,br,h,i?'#84705a':'#77624a',false,i?{seed:29,top:'head',rust:true}:{seed:23,top:'lid',mug:true});});}
function cratePiece(Cr,i){const P=K.pal(),x=Cr.x-Cr.w/2,d=Cr.d-Cr.w/2,a=Q(x,Cr.h,d+Cr.w),b=Q(x+Cr.w,0,d);
  return K.piece('yardcrate'+i+'|'+P.key,Q(x,Cr.h,d).x-3,a.y-2,b.x-Q(x,0,d).x+Cr.w*.2+8,b.y-a.y+5,c=>{box(c,P,x,d,Cr.w,Cr.w,Cr.h,i?'#3a2c1c':'#42321f');});}
// a gate's leaf of planks, hinged at (hx, hd), len long and h high, turned th from shut: its shut way along (ux, ud), opening toward
// (vx, vd). Rails, a brace, pointed tops (pts), the latch at the free end, its edge lit; darker as it turns edge-on to the eye
function gateLeaf(c,P,hx,hd,len,h,th,ux,ud,vx,vd,pts,base){const sh=(col,k)=>K.shade(P,col,k),cs=Math.cos(th),sn=Math.sin(th),dx=ux*cs+vx*sn,dd=ud*cs+vd*sn,at=(u,hh)=>Q(hx+dx*len*u,hh,hd+dd*len*u);
  const side=clamp(Math.abs(dd)*1.2,0,1),col=jm2(sh(base,1.1),'#000000',.25*side);
  c.fillStyle=col;K.poly(c,[at(0,0),at(1,0),at(1,h),at(0,h)]);c.fill();
  if(pts){c.beginPath();const n=Math.max(1,Math.round(len/6));for(let k=0;k<n;k++){const a=at(k/n,h),m=at((k+.5)/n,h+5),e=at((k+1)/n,h);c.moveTo(a.x,a.y);c.lineTo(m.x,m.y);c.lineTo(e.x,e.y);}c.fill();}
  c.strokeStyle=rgba('#000000',.45);c.lineWidth=1.48;c.beginPath();const n=Math.max(2,Math.round(len/6));for(let k=1;k<n;k++){const a=at(k/n,0),e=at(k/n,h);c.moveTo(a.x,a.y);c.lineTo(e.x,e.y);}c.stroke();
  c.strokeStyle=jm2(sh('#2a1e14',1.1),'#000000',.2*side);c.lineWidth=2.6;c.beginPath();for(const hh of [10,h-12]){const a=at(.04,hh),e=at(.96,hh);c.moveTo(a.x,a.y);c.lineTo(e.x,e.y);}const z0=at(.94,10),z1=at(.06,h-12);c.moveTo(z0.x,z0.y);c.lineTo(z1.x,z1.y);c.stroke();
  {const a=at(.82,h*.55),e=at(1.06,h*.55);c.strokeStyle=sh('#605850');c.lineWidth=1.6;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(e.x,e.y);c.stroke();c.fillStyle=rgba(P.light,.12+.35*P.lightA);c.fillRect(Math.min(a.x,e.x),a.y-1.2,Math.abs(e.x-a.x),.7);}
  c.strokeStyle=rgba(P.light,.1+.35*P.lightA);c.lineWidth=.99;c.beginPath();const t0=at(0,h),t1=at(1,h);c.moveTo(t0.x,t0.y-.6);c.lineTo(t1.x,t1.y-.6);c.stroke();
  c.strokeStyle=rgba('#000000',.4);c.lineWidth=1.51;K.poly(c,[at(0,0),at(1,0),at(1,h),at(0,h)]);c.stroke();}
// the yard's gate on the right: hinged on its front post, swinging in toward the yard (S.act1.gate)
function mainGate(c){const Yd=Y(),G=Yd.gate,P=K.pal(),g0=G.d-G.w/2,g1=G.d+G.w/2;gateLeaf(c,P,FENCE.x,g0+1,g1-g0-2,FENCE.h-4,opened('gate')*1.62,0,1,-1,0,true,'#3e3020');}
// the stair gate: hinged on its left post, swinging out into the yard toward the eye (S.act1.stairGate)
// the near side of the side stairs, a piece among the people: the handrail and the fence's pickets in front of the lowest steps,
// so that a man going up the stairs goes up behind them (they are painted into the layer too)
function stairFrontPiece(){const P=K.pal(),Yd=Y(),St=Yd.sidestair,G=SG(),sh=(col,k)=>K.shade(P,col,k),d0=St.d,xb=St.x1,xt=St.x0,top=STAIR.top,run=(xb-xt)/STAIR.n,rise=top/STAIR.n,lx0=xt-26,a0=Q(lx0,top+STAIR.rail+6,d0),a1=Q(xb+8,0,G.d);
  return K.piece('yardstairfront|'+P.key,a0.x-6,a0.y-4,a1.x-a0.x+16,a1.y-a0.y+8,c=>{
    c.strokeStyle=sh('#33251a');c.lineWidth=2.2;c.beginPath();
    const rail=[];for(const [xx,hh] of [[xb+2,0],[xb-run*4,rise*4],[xb-run*8,rise*8],[xt,top],[lx0+3,top]]){const a=Q(xx,hh,d0-1),e=Q(xx,hh+STAIR.rail,d0-1);c.moveTo(a.x,a.y);c.lineTo(e.x,e.y);rail.push(e);}
    c.stroke();c.lineWidth=2.6;c.beginPath();rail.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();
    c.strokeStyle=rgba(P.light,.08+.35*P.lightA);c.lineWidth=.99;c.beginPath();rail.forEach((p,i)=>i?c.lineTo(p.x,p.y-1.2):c.moveTo(p.x,p.y-1.2));c.stroke();
    const hx=G.x-G.w/2,x0=hx-28,d=G.d,r=rng(131);
    c.strokeStyle=sh('#2e2218',1.1);c.lineWidth=2.6;c.beginPath();for(const hh of [12,SGH-10]){const a=Q(x0,hh,d),e=Q(hx,hh,d);c.moveTo(a.x,a.y);c.lineTo(e.x,e.y);}c.stroke();
    for(let x=x0+4;x<hx-2;x+=6){const a=Q(x,0,d),e=Q(x,SGH-2-(r()<.3?4:0),d);c.fillStyle=sh('#3a2c20',1.1);c.fillRect(a.x-2,e.y,4,a.y-e.y);c.fillStyle=rgba(P.light,.06+.25*P.lightA);c.fillRect(a.x-2,e.y,4,1);}
    for(const [px,ph] of [[x0,SGH+4],[hx,SGH+10]]){const a=Q(px-3,0,d),e=Q(px+3,ph,d);c.fillStyle=sh('#2a1e14',1.1);c.fillRect(a.x,e.y,e.x-a.x,a.y-e.y);c.fillStyle=K.topLit(P,'#3a2c20',.8);c.fillRect(a.x,e.y-1.4,e.x-a.x,1.6);}});}
function stairGate(c){const G=SG(),P=K.pal();gateLeaf(c,P,G.x-G.w/2+3,G.d,G.w-6,SGH-6,opened('stairGate')*1.7,1,0,0,-1,false,'#433424');}
function pieces(){const Yd=Y(),out=[],G=SG(),g=Yd.gate;
  out.push({d:G.d-(G.w/2)*Math.sin(opened('stairGate')*1.7)+.5,draw:stairGate});
  out.push({d:g.d-g.w/2+(g.w/2)*Math.cos(opened('gate')*1.62),draw:mainGate});
  out.push({d:Yd.pump.d+.6,draw:c=>{K.drawPiece(c,pumpPiece());pumpHandle(c);}});
  out.push({d:Yd.trough.d,draw:c=>{K.drawPiece(c,troughPiece());const P=K.pal();for(const b of FLOCK)if(b.trough)birdDraw(c,b,S.t,P);}});
  for(const b of FLOCK)if(b.ground)out.push({d:b.ground.d,draw:c=>birdDraw(c,b,S.t,K.pal())});
  out.push({d:SG().d+.5,draw:c=>K.drawPiece(c,stairFrontPiece())});
  Yd.barrels.forEach((B0,i)=>out.push({d:B0.d,draw:c=>K.drawPiece(c,barrelPiece(B0,i))}));
  // a crate goes down a little before a man at its own depth: Dob perches on the nearer one (its top is ground for him)
  Yd.crates.forEach((Cr,i)=>out.push({d:Cr.d+1,draw:c=>K.drawPiece(c,cratePiece(Cr,i))}));
  // (the south's, since V118)
  southPieces(out);
  return out;}
// ---------- Dob's birds, alive (since V117) ----------
// The pigeons that live in the yard, the roof scene's own birds at the roof scene's size: on the lofts and along the ridge, down
// pecking by the crates, at the trough once the pump has run, and in the air: a turn out over the yard now and then, up onto the
// yard wall when a man walks at them, all of them up off the roof when he comes along it with their water (S.act1.birdsUp). What
// they do reads the game; nothing in the game reads them. At night they sit.
// one bird at (x, y), facing fa, size s: sitting (o.pk: how far its head is down to peck, 0 to 1) or flying (o.fl; o.w: the wing's beat)
function pigeon(c,x,y,fa,s,col,o){c.save();c.translate(x,y);c.scale(fa*s,s);c.fillStyle=col;
  if(o.fl){const w=5*(o.w||0);c.beginPath();c.ellipse(0,0,3.4,1.5,0,0,TAU);c.fill();c.beginPath();c.arc(3.3,-.5,1.3,0,TAU);c.fill();
    c.beginPath();c.moveTo(-3,0);c.lineTo(-5.8,-.8);c.lineTo(-5.4,1);c.closePath();c.fill();
    c.beginPath();c.moveTo(.6,-.4);c.quadraticCurveTo(1.2,-w*.9,-1.6,-w-.6);c.lineTo(-1.4,-.2);c.closePath();c.fill();
    c.fillStyle=o.wing;c.beginPath();c.moveTo(-.4,-.4);c.quadraticCurveTo(-.4,-w*1.1,-3.2,-w*1.2-.4);c.lineTo(1.4,-.6);c.closePath();c.fill();}
  else{const pk=o.pk||0;c.beginPath();c.ellipse(0,-3,3.6,2.4,-.15+pk*.4,0,TAU);c.fill();c.beginPath();c.arc(2.9+pk*1.5,-5.4+pk*3.6,1.6,0,TAU);c.fill();
    c.beginPath();c.moveTo(-3,-3.6);c.lineTo(-6.6,-2.2-pk*1.6);c.lineTo(-3,-1.4);c.closePath();c.fill();
    c.fillStyle=o.beak;c.fillRect(4.2+pk*1.5,-5.8+pk*3.9,1.6,1);
    c.fillStyle=o.sheen;c.beginPath();c.arc(2.4+pk*1.2,-4.2+pk*2.6,1,0,TAU);c.fill();
    if(o.pale){c.fillStyle=o.wing;c.beginPath();c.ellipse(-.6,-2.9,2.3,1.3,-.2,0,TAU);c.fill();}}
  c.restore();}
// where they sit on the roof (x, how high, how deep): the lofts' peaks, the tin in front of the third loft, the ridge
const BIRDS_UP=9,ROOSTS=[[80,SUMP.ridge+27,270],[123,SUMP.ridge+23,270],[165,SUMP.ridge+26,270],[205,SUMP.ridge,278],[236,SUMP.ridge,278],[262,SUMP.ridge,278],[350,SUMP.ridge,278],[392,SUMP.ridge,278],[430,SUMP.ridge,278],[150,SUMP.eave+(SUMP.ridge-SUMP.eave)*.65,262],[300,SUMP.ridge,278]],
  PECKS=[[618,150],[640,134],[668,128]];
const FLOCK=(()=>{const r=rng(17),cols=['#4a4e5c','#3a3e4a','#5c5e6a','#a9a394','#4a4e5c','#7c7870','#3a3e4a','#5c5e6a','#4a4e5c','#3a3e4a','#5c5e6a'],a=[];
  for(let i=0;i<ROOSTS.length;i++)a.push({i,col:cols[i],wing:i===3?'#7f796a':i===5?'#5a564e':cols[i]==='#3a3e4a'?'#6a6e7a':'#787a86',pale:i===3||i===5,roost:ROOSTS[i],per:13+r()*10,ph:r()*30,s:2.2+r()*.4,
    trough:i<2,ground:i>=4&&i<=6?{x:PECKS[i-4][0],d:PECKS[i-4][1]}:null,loops:i===2||i===3||i===8,at:null,go:null,t0:-99});
  return a;})();
function birdPlace(b,k,t){const Yd=Y();
  if(k==='ground'){const g=b.ground;return Q(g.x+Math.sin(t*.45+b.ph)*5,0,g.d);}
  if(k==='wall')return Q(Yd.wall.x0+10+(b.i-4)*19,Yd.wall.h,Yd.wall.d);
  if(k==='trough')return Q(Yd.trough.x1-18-b.i*25,22*(Yd.trough.k||1),Yd.trough.d+8*(Yd.trough.k||1));
  return Q(b.roost[0],b.roost[1],b.roost[2]);}
// each bird's next move, once a frame: where it wants to be, and off it goes
function flockStep(t){const A=typeof S!=='undefined'&&S?S.act1:null,K0=typeof hero==='function'?hero():null,tod=K.tod(),night=tod==='night'||tod==='dusk',inYard=S.arenaKey==='yard';
  const near=q=>K0&&K0.p&&inYard?Math.hypot(prjX(K0.station,K0.dep)-q.x,(prjY(GB,K0.dep)-q.y)*2):999;
  for(const b of FLOCK){if(b.at==null||t<b.t0-1){b.at=b.ground&&!night?'ground':'roost';b.go=null;b.t0=t;}
    if(b.go){if(t>=b.go.t0+b.go.dur){b.at=b.go.to;b.go=null;b.t0=t;}else continue;}
    let want=b.ground&&!night?'ground':'roost';
    // a man walking at the ones on the ground: up onto the wall, and down again when he has gone by
    if(want==='ground'){const n=near(birdPlace(b,'ground',t));if(b.at==='ground'?n<58:(n<116||t-b.t0<4))want='wall';}
    // water running at the pump: two come down to the trough, and keep to it while he keeps off
    if(b.trough&&!night&&inYard&&A&&A.bucket&&A.yard&&!A.yard.done&&(A.pumping||A.bucket.full)){const n=near(birdPlace(b,'trough',t));if(b.at==='trough'?n>46:n>104)want='trough';}
    if(want!==b.at){const a=birdPlace(b,b.at,t),z=birdPlace(b,want,t);b.go={from:b.at,to:want,t0:t,dur:clamp(Math.hypot(z.x-a.x,z.y-a.y)/150,.7,2.6)};}
    else if(b.loops&&b.at==='roost'&&!night&&((t+b.ph)%b.per)<.05&&!(A&&A.birdsUp&&t<A.birdsUp+BIRDS_UP))b.go={from:'roost',to:'roost',t0:t,dur:3.6,loop:true};}}
function birdDraw(c,b,t,P){const A=typeof S!=='undefined'&&S?S.act1:null,col=K.shade(P,b.col,.75),o={wing:K.shade(P,b.wing,.75),beak:K.shade(P,'#8a7a58',.8),sheen:rgba('#96dcc8',.1+.24*P.lightA),pale:b.pale,pk:0,fl:0,w:0},flap=Math.sin(t*27+b.i*1.7);
  // all up off the roof as he comes with the water: round and round over the lofts, and down again in their own time
  if(A&&A.birdsUp&&t>=A.birdsUp&&t<A.birdsUp+BIRDS_UP){const u=t-A.birdsUp,a=birdPlace(b,b.at||'roost',t),th=u*(1.5+b.i*.09)+b.i*.9,c0=Q(170,262,268),e=sstep(clamp((u-b.i*.06)/.9,0,1))*(1-sstep(clamp((u-BIRDS_UP+1.6)/1.5,0,1)));
    const x=lerp(a.x,c0.x+Math.cos(th)*(70+b.i*9),e),y=lerp(a.y,c0.y+Math.sin(th)*(18+b.i*3)-Math.sin(u*2.1+b.i)*6,e);
    if(e>.02){o.fl=1;o.w=flap;pigeon(c,x,y,-Math.sin(th)>=0?1:-1,b.s,col,o);return;}}
  if(b.go){const g=b.go,u=clamp((t-g.t0)/g.dur,0,1),e=u*u*(3-2*u),a=birdPlace(b,g.from,t),z=birdPlace(b,g.to,t);let x,y,fa;
    if(g.loop){const th=u*TAU,dir=b.i%2?1:-1;x=a.x+Math.sin(th)*(110+b.i*12)*dir;y=a.y-(1-Math.cos(th))*(40+b.i*5)-Math.sin(u*Math.PI)*12;fa=Math.cos(th)*dir>=0?1:-1;}
    else{x=lerp(a.x,z.x,e);y=lerp(a.y,z.y,e)-Math.sin(u*Math.PI)*(26+Math.abs(z.x-a.x)*.1);fa=z.x>=a.x?1:-1;}
    o.fl=1;o.w=u>.92&&!g.loop?.4:flap;pigeon(c,x,y,fa,b.s,col,o);return;}
  const p=birdPlace(b,b.at||'roost',t),low=b.at==='ground'||b.at==='trough';
  o.pk=low?Math.pow(Math.max(0,Math.sin(t*(2.3+b.i*.27)+b.ph)),8):Math.pow(Math.max(0,Math.sin(t*.9+b.ph)),40);
  pigeon(c,p.x,p.y,Math.sin(t*.23+b.ph)>0?1:-1,b.s,col,o);}
// the back door by day, opening (S.act1.yardDoor, 0 to 1: Tamm going back in): the leaf swings in on its left jamb, and the kitchen
// shows past it, dim, the stove's glow low down. Drawn over the painted door, under the people.
function doorLive(c,P){const k=opened('yardDoor');if(k<=.01||P.key==='night')return;const Yd=Y(),D=Yd.door,far=Yd.far,top=Q(D.x-D.w/2,SUMP.doorH,far),bot=Q(D.x+D.w/2,0,far),w=bot.x-top.x,h=bot.y-top.y,sh=(col,kk)=>K.shade(P,col,kk);
  const e=lerp(bot.x,top.x+9,k);
  c.fillStyle='#120a06';c.fillRect(e,top.y,bot.x-e,h);
  c.fillStyle=rgba('#6c3214',.5);c.fillRect(e,top.y+h*.56,bot.x-e,h*.44);
  c.fillStyle=rgba('#2a1206',.9);c.fillRect(e,top.y+h*.3,bot.x-e,2.4);
  for(const [px,pw,ph] of [[20,6,9],[30,9,6]])if(top.x+px>=e)c.fillRect(top.x+px,top.y+h*.3-ph,pw,ph);
  {const x0=Math.max(e,top.x+w*.5);if(bot.x-4>x0){c.fillStyle=rgba('#ff7a2a',.3);c.fillRect(x0,top.y+h*.68,bot.x-4-x0,3);}}
  // the leaf, narrowing as it swings in; its boards' seams closing up
  c.fillStyle=sh('#2c2018',1.15);c.fillRect(top.x,top.y,e-top.x,h);
  c.fillStyle=rgba('#000000',.4);for(let x=top.x+lerp(7.6,2.6,k);x<e-1.5;x+=lerp(7.6,2.6,k))c.fillRect(x,top.y,1.5,h);
  c.fillStyle=sh('#1a120c',1.2);c.fillRect(e-2,top.y,2,h);}
// the ground wet under the spout once he has pumped (it reads the bucket's fill): a dark patch, the sky's light along its far side
function pumpWet(c,P){const A=typeof S!=='undefined'&&S?S.act1:null,B=A&&A.bucket;if(!B)return;const k=B.full?1:clamp(B.fill||0,0,1);if(k<=0)return;const Pm=Y().pump,q=Q(Pm.x+17*(Pm.k||1),0,Pm.d-8*(Pm.k||1));
  c.fillStyle=rgba('#050403',.2*k);c.beginPath();c.ellipse(q.x,q.y,10+17*k,(10+17*k)*.3,0,0,TAU);c.fill();
  c.fillStyle=rgba(P.light,(.05+.1*P.lightA)*k);c.beginPath();c.ellipse(q.x+2,q.y-1.5,(10+17*k)*.6,1.1,0,0,TAU);c.fill();}
// The small things that move in the yard (since V118): the tall weeds and the washing in the wind, the hoist's fall, the gutter's
// drip into the rain barrel, the light on the big puddles and a ring where a foot comes down in one, midges over the water (moths
// round the lamps after dark), straw over the ground when the wind gets up, a feather coming down off the roof now and then,
// sparks off the fire in the lane. Each from the clock and its own number, never from dice; still where motion is reduced.
const hsh=n=>{n=(n|0)^0x5bd1e995;n=Math.imul(n^(n>>>15),0x2c1b3c6d);n=Math.imul(n^(n>>>12),0x297a2d39);n^=n>>>15;return(n>>>0)/4294967296;};
// a foot coming down in a puddle: read off the joints as they are drawn (a foot that was off the floor and is on it again), kept
// here and nowhere the game reads
const WET=new WeakMap(),RINGS=[];
function feetWet(t){if(typeof FTF==='undefined'||typeof S==='undefined'||!S.F)return;
  for(const f of S.F){if(!f||f.gone||f.hidden||f.dead||!f.p||!f.p[FTF]||!f.gr)continue;let st=WET.get(f);if(!st)WET.set(f,st=[{},{}]);
    for(let k=0;k<2;k++){const q=f.p[k?FTB:FTF],e=st[k],h=f.gr(q.x)-q.y,dt=e.t==null?-1:t-e.t;
      if(dt>0&&dt<.1){e.base=Math.min(e.base+dt*.6,h);const up=h-e.base;
        if(up>2.4)e.air=(e.air||0)+dt;
        else if(up<1.1){if(e.air>.05)for(const [px,pd,pr] of PUDS){const ux=(q.x-px)/pr,ud=(f.dep-pd)/(pr*.62);if(ux*ux+ud*ud<1){const g=Q(q.x,0,f.dep);RINGS.push({x:g.x,y:g.y,t});break;}}e.air=0;}}
      else{e.base=h;e.air=0;}
      e.t=t;}}
  if(RINGS.length>8)RINGS.splice(0,RINGS.length-8);}
function yardLive(c,t,P){const Yd=Y(),far=Yd.far,T=P.key,still=typeof reduceMotion!=='undefined'&&reduceMotion,sh=(col,k)=>K.shade(P,col,k),dark=T==='night'||T==='dusk';
  plants(c,P,grow().live,g=>windAt(t+g.ph*.4,g.x)*.2);
  clothsLive(c,t,P);
  southLive(c,t,P,still);
  // the hoist's fall and its hook
  if(HOIST.x){const a=still?0:.05*windAt(t*.6+2,400)+.018*Math.sin(t*1.7),x1=HOIST.x+Math.sin(a)*43,y1=HOIST.y+Math.cos(a)*43;
    c.strokeStyle=sh('#5a4a38');c.lineWidth=1.6;c.beginPath();c.moveTo(HOIST.x,HOIST.y);c.lineTo(x1,y1);c.quadraticCurveTo(x1+2+a*8,y1+8,x1-4+a*14,y1+12);c.stroke();c.fillStyle=sh('#3a3632');c.beginPath();c.arc(x1-4+a*14,y1+14,2,0,TAU);c.fill();}
  // the gutter's drip into the rain barrel, a ring on its water
  {const p=Q(456,0,far-12),w=Q(456,40,far),per=2.9,u=still?.99:(t%per)/per,x=p.x+1,y0=w.y+7,y1=p.y-36.8;c.save();{const g=Q(456,0,far);zoom(c,g.x,g.y,1.7);}
    if(u<.34){c.fillStyle=rgba('#cfe0e8',.5);c.beginPath();c.ellipse(x,y0+u*3,.9,1+u*2,0,0,TAU);c.fill();}
    else if(u<.42){const k=(u-.34)/.08;c.fillStyle=rgba('#cfe0e8',.55);c.fillRect(x-.5,lerp(y0+2,y1-2,k*k),1,2.2);}
    else if(u<.95){const k=(u-.42)/.53;c.strokeStyle=rgba('#d8e8f0',.42*(1-k));c.lineWidth=1;c.beginPath();c.ellipse(x-1,y1,1+k*8,(1+k*8)*.27,0,0,TAU);c.stroke();}c.restore();}
  // the light moving on the big puddles; a ring where a foot comes down in one
  if(T!=='night'){c.fillStyle=rgba(K.jm(P.air[0],P.light,.4),.1+.2*P.lightA);for(const [px,pd,pr] of PUDS){if(pr<20)continue;const q=Q(px,0,pd),k=still?0:Math.sin(t*.5+px*.01);c.globalAlpha=still?.6:.5+.5*Math.sin(t*.9+px);c.fillRect(q.x-pr*.5+k*pr*.3,q.y-1.5+(still?0:Math.sin(t*.7+px)*.8),pr*.5,1);}c.globalAlpha=1;}
  if(!still){feetWet(t);c.lineWidth=1;for(let i=RINGS.length-1;i>=0;i--){const g=RINGS[i],u=(t-g.t)/.7;if(!(u>=0&&u<1)){RINGS.splice(i,1);continue;}
      c.strokeStyle=rgba('#d8e8f0',.42*(1-u));for(const k of [u,u-.3]){if(k<=0)continue;c.beginPath();c.ellipse(g.x,g.y,2+k*13,(2+k*13)*.3,0,0,TAU);c.stroke();}}}
  if(still)return;
  // the water running in the trough's overflow: glints going down it
  if(T!=='night'){c.fillStyle=rgba(K.jm(P.air[0],P.light,.5),.22+.3*P.lightA);for(let i=0;i<5;i++){const u=((t*.16+i/5)%1),[x,d]=rillAt(u),q=Q(x,0,d);c.globalAlpha=Math.sin(u*Math.PI);c.fillRect(q.x-1.4,q.y-.5,2.8,1);}c.globalAlpha=1;}
  // midges over the rain barrel and the trough by day, moths round the lantern and the gate's lamp after dark
  if(dark){c.fillStyle=rgba('#f0e2c0',.7);const lp=Q(LANT.x,LANT.h-6,LANT.d),gp=Q(FENCE.x+GLAMP.dx,GLAMP.h-3,Yd.gate.d-Yd.gate.w/2+GLAMP.dd);
    for(let i=0;i<5;i++){const o=i<3?lp:gp,a=t*(1.7+i*.31)+i*2.1,rr=5+3*Math.sin(t*.9+i);c.fillRect(o.x+Math.cos(a)*rr*1.4,o.y+Math.sin(a*1.3)*rr*.8,1,1);}}
  else{c.fillStyle=rgba('#1c1814',.45);const o1=Q(456,84,far-20),o2=Q((Yd.trough.x0+Yd.trough.x1)/2,40,Yd.trough.d);
    for(let i=0;i<9;i++){const o=i<5?o1:o2,a=t*(1.1+hsh(i)*1.3)+i*1.7;c.fillRect(o.x+Math.sin(a)*(5+hsh(i+20)*7)+Math.sin(a*2.3+i)*2,o.y+Math.cos(a*1.31+i)*(3+hsh(i+40)*5),1.5,1.5);}}
  // straw over the ground when the wind gets up
  {const k=clamp((gustAt(t)-.55)/.3,0,1);if(k>0)for(let i=0;i<5;i++){const v=26+hsh(i+7)*30,x=((hsh(i+3)*1300+t*v)%1300)-200,q=Q(x,0,20+hsh(i+11)*190),hop=Math.abs(Math.sin(t*(3+hsh(i)*3)+i))*2.2;
      c.save();c.translate(q.x,q.y-.6-hop);c.rotate(t*(2+hsh(i+5)*3)+i);c.fillStyle=rgba(i%2?'#b8a070':'#a09070',.55*k);c.fillRect(-2.4,-.5,4.8,1);c.restore();}}
  // a feather coming down off the roof now and then
  {const per=13,n=Math.floor(t/per),u=(t-n*per)/5.5;if(u<1){const x=70+hsh(n*3+1)*380+far*PSX+Math.sin(u*9+n)*9+u*14,y=lerp(Q(0,SUMP.eave+10,far).y,Q(0,0,far-20-hsh(n+9)*40).y,u*u*.4+u*.6);
      c.save();c.translate(x,y);c.rotate(Math.sin(u*9+n)*.9);c.fillStyle=rgba('#c9c9d2',.75*(u>.85?(1-u)/.15:1));c.beginPath();c.ellipse(0,0,2.6,.8,0,0,TAU);c.fill();c.restore();}}
  // sparks going up off the drum in the lane
  if(P.fire>.5){const p=Q(DRUM.x,30*DRUM.k,DRUM.d);c.fillStyle='#ffb25e';for(let i=0;i<5;i++){const per=1.6+hsh(i+31)*1.4,u=((t+hsh(i+33)*9)%per)/per;c.globalAlpha=.8*(1-u)*P.fire;c.fillRect(p.x-5+hsh(i+35)*10+Math.sin(u*6+i)*4,p.y-u*(30+hsh(i+37)*26),1.1,1.1);}c.globalAlpha=1;}}
// ---------- what moves ----------
// smoke from the stovepipe and the chimneys round about, the fires on the far wall, the lamps and the window, the pump's drip, a bird
// on the ridge, the morning's mist; on an upright phone, the walls going on up to the sky
const MIST=(()=>{const r=rng(5),a=[];for(let i=0;i<10;i++)a.push({d:10+r()*220,w:180+r()*260,sp:4+r()*7,ph:r()*1400,a:.08+r()*.08});return a;})();
function live(){const t=S.t,P=K.pal(),T=P.key,Yd=Y();ctx.save();
  K.upper('yard:'+T,-1000,(c,x0,x1,y0,y1)=>{c.fillStyle=P.air[0];c.fillRect(x0,y0,x1-x0,y1-y0);
    K.shackRows(c,Object.assign({pal:P,x0:-170,x1:W+250,yTop:-650,clip:[-650,y1]},ROWS));
    c.fillStyle=lin(c,0,-640,0,-480,[[0,rgba(P.sky[1],.8)],[1,rgba(P.air[0],0)]]);c.fillRect(x0,-640,x1-x0,160);
    K.skyTop(c,x0,x1,y0,-636,P,{tower:150});K.sunlight(c,P,-200,1240,-640,GB+30,SUNO);K.mottle(c,x0,-636,x1,y1,T==='night'?.2:T==='dusk'?.32:.2);});
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
    if(lit>0){const p=Q(LANT.x,LANT.h-6,LANT.d);K.glowAt(ctx,p.x,p.y,10,'#fff0c8',.8*lit*f);K.glowAt(ctx,p.x,p.y,40,'#ffb25e',.35*lit*f);
      const g=Q(FENCE.x+GLAMP.dx,GLAMP.h-3,Yd.gate.d-Yd.gate.w/2+GLAMP.dd);K.glowAt(ctx,g.x,g.y,8,'#fff0c8',.7*lit*f);K.glowAt(ctx,g.x,g.y,32,'#ffb25e',.3*lit*f);}
    const W0=Yd.window,wp=Q((W0.x0+W0.x1)/2,(W0.y0+W0.y1)/2,Yd.far);K.glowAt(ctx,wp.x,wp.y,40,'#ff9a4a',(T==='night'?.16:.06)*(.9+.1*Math.sin(t*2.3)));
    if(T==='night'){const D=Yd.door,dp=Q(D.x,SUMP.doorH*.5,Yd.far);K.glowAt(ctx,dp.x,dp.y,46,'#ff9a4a',.1*(.9+.1*Math.sin(t*5.1)*Math.sin(t*1.3)));}}
  {const p=Q(DRUM.x,28*DRUM.k,DRUM.d),f=.75+.25*Math.sin(t*11)*Math.sin(t*3.7);K.glowAt(ctx,p.x,p.y-8,40,'#ff8a3c',.35*f*P.fire);
    ctx.fillStyle='#ffb25e';for(let q=0;q<5;q++){const fx=p.x-7+q*3.5,fh=6+7*Math.abs(Math.sin(t*9+q*1.7));ctx.globalAlpha=.75*P.fire;ctx.beginPath();ctx.moveTo(fx-2,p.y);ctx.lineTo(fx,p.y-fh);ctx.lineTo(fx+2,p.y);ctx.fill();}}
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  // the pump's drip: a drop off the spout into the trough, a ring where it lands
  {const Pm=Yd.pump,per=1.7,u=(t%per)/per,pk=Pm.k||1,sp=Q(Pm.x,14+(48-17)*pk,Pm.d),x=sp.x+18*pk,y0=sp.y,y1=Q(Yd.trough.x0+6,18*pk,Yd.trough.d).y;
    if(u<.3){ctx.fillStyle=rgba('#cfe0e8',.55);const k=u/.3;ctx.beginPath();ctx.ellipse(x,y0+1+k*1.5,1,1+k*.8,0,0,TAU);ctx.fill();}
    else if(u<.42){const k=(u-.3)/.12;ctx.fillStyle=rgba('#cfe0e8',.6);ctx.fillRect(x-.5,lerp(y0+3,y1,k*k),1,2.4);}
    else if(u<.9){const k=(u-.42)/.48;ctx.strokeStyle=rgba('#d8e8f0',.4*(1-k));ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,y1,1.5+k*7,(1.5+k*7)*.3,0,0,TAU);ctx.stroke();}}
  // the back door as Tamm goes in; the wet under the spout; Dob's birds: each one's next move, and those that keep to the roof
  yardLive(ctx,t,P);
  doorLive(ctx,P);pumpWet(ctx,P);flockStep(t);for(const b of FLOCK)if(!b.trough&&!b.ground)birdDraw(ctx,b,t,P);
  if(P.mist>0){const sp=K.puffSpr('#c4d2e2');for(const m of MIST){const x=((m.ph+t*m.sp)%1500)-300,q=Q(x,0,m.d);ctx.globalAlpha=m.a*P.mist;ctx.drawImage(sp,q.x-m.w/2,q.y-m.w*.1,m.w,m.w*.2);}ctx.globalAlpha=1;}
  ctx.restore();}
// the sun's light over the yard, the same in the layer and in the picture above it (from the rim, so its shafts run on unbroken)
const SUNO={n:7,seed:43};
// the light that rims a man in the yard: at night the back door's, by day and by morning the sun's over the rim (the kit's sun), else
// the daylight from far above
function light(f){const Yd=Y(),T=K.tod();
  if(T==='night'){const D=Yd.door,p=Q(D.x,SUMP.doorH*.6,Yd.far);return{light:{x:p.x-f.dep*PSX,y:p.y+f.dep*PSY},col:'#ffb870'};}
  const S2=K.sun();if(S2)return{light:{x:S2.x-f.dep*PSX,y:S2.y+f.dep*PSY},col:S2.col};
  return{light:{x:480-f.dep*PSX,y:-320+f.dep*PSY},col:K.pal().light};}
const LAYOUT={sump:SUMP,shed:SHED,fence:FENCE,lantern:LANT};
// the light on the fight (the style guide's rule 8, sceneSet in sk_scene_glue.js): by day the Pit's light on the yard's dirt and the
// Sump's boards, by its hour; at night the back door's light and the window's out over the yard, strong by them and falling away
// toward the pump, enough that a man in the yard stands out against it
const SETY=[GB-360,GB-280,GB+318,GB+418];
const SETS={day:{col:'#ffe2bc',soft:1,y:SETY},morning:{col:'#dce6f4',soft:1,y:SETY},
  dusk:{col:'#ffc49b',soft:1,gain:1.3,air:.04,y:SETY},
  night:{col:'#ffca94',soft:1,gain:1.8,air:.08,y:SETY,base:.36,pools:[[L0.door.x+L0.far*PSX,420,1],[(L0.window.x0+L0.window.x1)/2+L0.far*PSX,220,.8]]}};
// (deep: the layer's height, from the still layers' top (RC.y0, -90) down to the yard's own foot)
E.S.yard={set:()=>SETS[K.tod()]||SETS.day,paint,live,light,key,pieces,LAYOUT,deep:YFOOT+90};
})();
// ===== ENV YARD END =====
