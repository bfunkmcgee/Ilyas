// ===== VEH HELI =====
// The family's helicopter: a long, low executive machine in black lacquer pinstriped in gold, the house's crest in gold on the fin,
// a cockpit lit cyan from its instruments, a tall sliding door on the near side with the cabin warm and cream-leathered behind it.
// It is drawn in its own frame: x forward along H.fa, y up from the bottom of its skids, the whole tilted by H.tilt about the rotor
// hub, and set into the game's floor at (H.x, GB-H.y, H.dep) like everything else: H.y is how high its skids are over the deck.
// The still body is painted once into a cached layer per facing and scale; drawn live over it: the door sliding (H.door 0 shut, 1
// open), the lights (anti-collision beacons, the nav light, the tail strobe), the rotor (H.rotor, its angle) and its blur, and the
// chin searchlight (H.lamp 0..1, aimed at H.spot={x,dep} on the deck if given, else down ahead). wash() draws the rotor's
// downwash on the deck under it, for a pass under the fighters.
const HeliLook=(()=>{
const TAU=Math.PI*2,lerp=(a,b,t)=>a+(b-a)*t,clamp=(v,a,b)=>v<a?a:v>b?b:v;
const rgba=(hex,a)=>{const n=parseInt(hex.slice(1),16);return`rgba(${n>>16&255},${n>>8&255},${n&255},${a})`;};
const PX=()=>typeof PSX==='number'?PSX:.2,PY=()=>typeof PSY==='number'?PSY:.75,G0=()=>typeof GB==='number'?GB:470;
// the frame: the skids' bottom at (0,0); the rotor hub at HUB; the door's opening; the lamp under the chin
const DIM={len:720,nose:215,tail:-505,hub:[0,250],rotorR:330,door:{x0:-30,x1:56,sill:32,top:180},skid:{x0:-132,x1:162},lamp:[178,34],tailRotor:[-470,168,34],cabinFloor:32};
const K={lac:'#0a090e',lac1:'#13121a',lac2:'#1d1c26',gold:'#e2b65a',goldL:'#ffe2a3',goldD:'#8a6a2e',goldDD:'#4a3818',cyan:'#7ff3e3',cyanL:'#d9fffa',cyanD:'#1d6a66',
  cream:'#e8dcc0',creamD:'#9c8a68',leather:'#c9b48c',warm:'#ffc98a',steel:'#2a2c34',steelL:'#8e95a3'};

// ---------- the shapes, built once in the frame ----------
function cr(P,pts,closed=true){const n=pts.length,g=i=>pts[closed?(i+n)%n:clamp(i,0,n-1)];P.moveTo(g(0)[0],g(0)[1]);
  for(let i=0;i<(closed?n:n-1);i++){const p0=g(i-1),p1=g(i),p2=g(i+1),p3=g(i+2);
    P.bezierCurveTo(p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6,p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6,p2[0],p2[1]);}
  if(closed)P.closePath();return P;}
function poly(pts){const P=new Path2D();P.moveTo(pts[0][0],pts[0][1]);for(const q of pts.slice(1))P.lineTo(q[0],q[1]);P.closePath();return P;}
function rr(x0,y0,x1,y1,r){const P=new Path2D();P.moveTo(x0+r,y0);P.lineTo(x1-r,y0);P.quadraticCurveTo(x1,y0,x1,y0+r);P.lineTo(x1,y1-r);P.quadraticCurveTo(x1,y1,x1-r,y1);P.lineTo(x0+r,y1);P.quadraticCurveTo(x0,y1,x0,y1-r);P.lineTo(x0,y0+r);P.quadraticCurveTo(x0,y0,x0+r,y0);P.closePath();return P;}
let PA=null;
function paths(){if(PA)return PA;const P={};
  // the body: cabin and cockpit in one long drop, running back into the tail boom
  P.body=cr(new Path2D(),[[-150,30],[-40,26],[80,25],[132,28],[166,38],[192,56],[208,78],[214,98],[206,122],[186,146],[154,166],[118,182],[70,192],[0,196],[-80,194],[-140,188],
    [-185,176],[-240,163],[-320,155],[-430,150],[-452,146],[-452,128],[-430,124],[-320,120],[-240,112],[-195,96],[-168,68]]);
  // the cowling over the engines, with its intake and its exhaust
  P.cowl=cr(new Path2D(),[[-132,190],[-118,210],[-80,222],[0,226],[52,222],[84,210],[98,193],[40,197],[-60,196]]);
  P.intake=cr(new Path2D(),[[56,205],[78,206],[86,198],[64,199]]);
  P.exhaust=cr(new Path2D(),[[-132,198],[-112,212],[-102,206],[-122,194]]);
  P.mast=rr(-6,222,6,246,2);
  // the fin, swept back, and its ventral fin; the tailplane
  P.fin=cr(new Path2D(),[[-424,150],[-452,190],[-476,250],[-492,266],[-512,266],[-506,238],[-500,176],[-496,146],[-490,104],[-470,92],[-448,126]]);
  P.tailplane=poly([[-368,140],[-404,141],[-418,137],[-416,133],[-404,132],[-368,133]]);
  P.plate=rr(-420,124,-412,152,2);
  // glass: the windscreen, the chin bubble, the cabin window behind the door
  P.screen=cr(new Path2D(),[[198,106],[186,132],[160,152],[126,168],[98,176],[94,140],[104,104],[132,90],[170,88]]);
  P.chin=cr(new Path2D(),[[148,42],[174,50],[192,70],[168,78],[146,62]]);
  P.win=new Path2D();P.win.ellipse(-104,136,17,22,0,0,TAU);
  P.winAft=new Path2D();P.winAft.ellipse(-150,140,11,16,0,0,TAU);
  P.door=rr(DIM.door.x0,DIM.door.sill,DIM.door.x1,DIM.door.top,10);
  // the skid: a tube with its toe turned up, two cross tubes, a gold step under the door
  P.skid=cr(new Path2D(),[[-134,0],[150,0],[166,6],[174,16],[170,18],[160,9],[146,5],[-134,5]]);
  P.strut1=poly([[-92,4],[-84,4],[-70,30],[-80,30]]);P.strut2=poly([[96,4],[104,4],[100,28],[90,28]]);
  P.step=rr(-12,13,44,17,2);P.stepBar=poly([[-6,17],[-2,17],[-6,32],[-10,32]]);
  return PA=P;}
// the cabin seen through the open door: its far wall, cream leather, a gold rail, a lamp in the ceiling, the far window
function cabin(c){const {x0,x1,sill,top}=DIM.door;
  c.fillStyle=lgr(c,0,sill,0,top,[[0,'#3a2412'],[.35,'#8a5a2a'],[.75,'#c88a48'],[1,'#e6b070']]);c.fillRect(x0,sill,x1-x0,top-sill);
  // the far window, the night and the crown's cyan in it
  c.fillStyle=lgr(c,0,110,0,160,[[0,'#0a1a24'],[1,'#2a6a70']]);c.beginPath();c.ellipse(14,138,16,20,0,0,TAU);c.fill();c.strokeStyle='#7a5a2a';c.lineWidth=2;c.stroke();
  // seat backs in cream leather, piped in gold
  for(const sx of [-26,22]){c.fillStyle=lgr(c,sx,0,sx+30,0,[[0,K.creamD],[.5,K.cream],[1,K.creamD]]);c.beginPath();c.moveTo(sx,sill+6);c.lineTo(sx+2,sill+84);c.quadraticCurveTo(sx+16,sill+96,sx+30,sill+84);c.lineTo(sx+32,sill+6);c.closePath();c.fill();
    c.strokeStyle=rgba(K.gold,.8);c.lineWidth=.8;c.stroke();c.strokeStyle=rgba('#6a5638',.5);c.lineWidth=.5;c.beginPath();for(let y=sill+20;y<sill+80;y+=12){c.moveTo(sx+4,y);c.lineTo(sx+28,y);}c.stroke();}
  c.fillStyle=K.gold;c.fillRect(x0,104,x1-x0,2);
  c.fillStyle=rgba('#fff2d0',.9);c.fillRect(x0+10,top-8,x1-x0-20,3);
  c.fillStyle='#2a1a0e';c.fillRect(x0,sill,x1-x0,6);}
function lgr(c,x0,y0,x1,y1,st){const g=c.createLinearGradient(x0,y0,x1,y1);for(const [o,col] of st)g.addColorStop(o,col);return g;}
function rgr(c,x,y,r0,r1,st){const g=c.createRadialGradient(x,y,r0,x,y,r1);for(const [o,col] of st)g.addColorStop(o,col);return g;}
// the house's crest: a gold H in a ring of laurel, under a small crown
function crest(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);c.strokeStyle=K.gold;c.lineWidth=1.6;c.beginPath();c.arc(0,0,13,0,TAU);c.stroke();
  c.lineWidth=.8;c.strokeStyle=K.goldL;for(let k=0;k<12;k++){const a=Math.PI*.15+k/12*Math.PI*.7;for(const sd of [-1,1]){const ax=Math.cos(a)*16*sd,ay=-Math.sin(a)*16;c.beginPath();c.ellipse(ax,ay,2.6,1.2,a*sd,0,TAU);c.stroke();}}
  c.fillStyle=K.gold;c.fillRect(-7,-8,3.2,16);c.fillRect(3.8,-8,3.2,16);c.fillRect(-7,-1.4,14,2.8);
  c.beginPath();c.moveTo(-6,15);c.lineTo(-4,21);c.lineTo(0,17);c.lineTo(4,21);c.lineTo(6,15);c.closePath();c.fill();c.restore();}
// the whole still body, in frame units (y up); L is the light's direction in the frame (unit, pointing toward the light)
function bodyPaint(c,L){const P=paths();
  // the skid and its tubes behind the body
  c.fillStyle='#16161c';c.fill(P.strut1);c.fill(P.strut2);c.fillStyle=lgr(c,0,0,0,6,[[0,'#08080b'],[.5,'#2a2a32'],[1,'#0c0c10']]);c.fill(P.skid);
  c.strokeStyle=rgba(K.steelL,.35);c.lineWidth=.6;c.beginPath();c.moveTo(-130,4.4);c.lineTo(148,4.4);c.stroke();
  // the fin and the tailplane
  c.fillStyle=lgr(c,-512,0,-424,0,[[0,K.lac],[.6,K.lac1],[1,K.lac]]);c.fill(P.fin);c.fillStyle=K.lac1;c.fill(P.tailplane);c.fillStyle='#08080b';c.fill(P.plate);
  // the body in black lacquer: a long sheen along its flank, darker underneath
  c.fillStyle=lgr(c,0,24,0,196,[[0,'#050508'],[.35,K.lac],[.62,K.lac2],[.72,'#2e2c3a'],[.8,K.lac1],[1,K.lac]]);c.fill(P.body);
  c.fillStyle=lgr(c,0,190,0,226,[[0,K.lac],[.6,K.lac2],[1,'#2a2834']]);c.fill(P.cowl);
  c.fillStyle='#050507';c.fill(P.intake);c.fill(P.exhaust);c.fillStyle=rgba('#ff8a3c',.15);c.fill(P.exhaust);
  c.fillStyle='#0d0d12';c.fill(P.mast);
  // panel lines
  c.strokeStyle=rgba('#000000',.65);c.lineWidth=.8;c.beginPath();
  for(const [a,b] of [[[-150,32],[-150,186]],[[-34,30],[-34,190]],[[96,28],[96,184]],[[-240,114],[-240,162]],[[-330,121],[-330,155]],[[60,193],[60,222]],[[-90,195],[-90,220]]]){c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);}c.stroke();
  // the cabin through the door's opening (the door panel is drawn over it, live)
  c.save();c.clip(P.door);cabin(c);c.restore();
  c.strokeStyle=K.goldD;c.lineWidth=2.4;c.stroke(P.door);c.strokeStyle=rgba(K.goldL,.5);c.lineWidth=.6;c.stroke(P.door);
  // the windows: the cockpit's glass lit cyan by its instruments, the cabin's warm
  c.fillStyle=lgr(c,94,90,200,170,[[0,'#06181c'],[.45,'#0f3e44'],[1,'#071a1e']]);c.fill(P.screen);c.fill(P.chin);
  c.save();c.clip(P.screen);c.fillStyle=rgba('#000000',.7);c.beginPath();c.ellipse(132,118,10,13,0,0,TAU);c.fill();c.fillRect(124,100,16,22);
  c.fillStyle=rgba('#04080a',.85);c.beginPath();c.ellipse(134,140,12,8,0,0,TAU);c.fill();c.restore();
  c.strokeStyle='#050507';c.lineWidth=2.6;c.beginPath();c.moveTo(150,90);c.lineTo(138,170);c.stroke();c.lineWidth=1.6;c.stroke(P.screen);c.stroke(P.chin);
  for(const w of [P.win,P.winAft]){c.fillStyle=lgr(c,0,114,0,160,[[0,'#f0c080'],[1,'#8a5a28']]);c.fill(w);c.strokeStyle=K.goldD;c.lineWidth=1.6;c.stroke(w);}
  // the gold pinstripes from nose to tail, and the crest on the fin
  c.lineCap='round';c.strokeStyle=K.gold;c.lineWidth=1.3;c.beginPath();c.moveTo(206,84);c.bezierCurveTo(150,64,40,58,-150,60);c.bezierCurveTo(-240,62,-340,128,-440,136);c.stroke();
  c.strokeStyle=rgba(K.goldL,.55);c.lineWidth=.5;c.beginPath();c.moveTo(204,90);c.bezierCurveTo(150,70,40,64,-150,66);c.bezierCurveTo(-240,68,-340,133,-438,141);c.stroke();
  c.strokeStyle=rgba(K.gold,.6);c.lineWidth=.8;c.beginPath();c.moveTo(118,182);c.bezierCurveTo(60,194,-80,196,-140,188);c.stroke();
  crest(c,-490,232,.95);
  // the skid's step under the door
  c.fillStyle=K.gold;c.fill(P.step);c.fillStyle='#16161c';c.fill(P.stepBar);
  // the light along the top: the rim of lacquer toward the light, and a soft sheen down the flank
  const lx=L.x,ly=L.y;c.save();c.clip(P.body);c.globalCompositeOperation='lighter';
  c.strokeStyle=rgba('#c8d4ff',.18+.18*clamp(ly,0,1));c.lineWidth=3;c.stroke(P.body);c.restore();
  c.save();c.globalCompositeOperation='lighter';c.strokeStyle=rgba('#c8d4ff',.22);c.lineWidth=.8;c.beginPath();c.moveTo(118,183);c.bezierCurveTo(60,195,-80,197,-140,189);c.lineTo(-185,177);c.lineTo(-320,156);c.lineTo(-430,151);c.stroke();
  c.strokeStyle=rgba('#c8d4ff',.2);c.beginPath();c.moveTo(-118,211);c.bezierCurveTo(-80,223,0,227,52,223);c.stroke();
  if(lx<0){c.strokeStyle=rgba('#c8d4ff',.25);c.lineWidth=1;c.beginPath();c.moveTo(-476,250);c.lineTo(-452,190);c.lineTo(-424,151);c.stroke();}
  c.restore();}
// ---------- caching the still body ----------
const CACHE=new Map();
function canvas(w,h){if(typeof OffscreenCanvas!=='undefined')return new OffscreenCanvas(w,h);const v=document.createElement('canvas');v.width=w;v.height=h;return v;}
function bucket(k){return clamp(Math.pow(2,Math.ceil(Math.log2(Math.max(k,.01))*2)/2),.5,6);}
const BX0=-520,BX1=222,BY0=-2,BY1=270;
function bodyLayer(sc,lq){const key=sc+'|'+lq;let e=CACHE.get(key);if(e)return e;
  const w=Math.ceil((BX1-BX0)*sc),h=Math.ceil((BY1-BY0)*sc),cv=canvas(w,h),g=cv.getContext('2d');
  g.setTransform(sc,0,0,-sc,-BX0*sc,BY1*sc);const a=lq/8*TAU;bodyPaint(g,{x:Math.cos(a),y:Math.sin(a)});
  e={cv,sc};if(CACHE.size>8)CACHE.delete(CACHE.keys().next().value);CACHE.set(key,e);return e;}
// ---------- placing it ----------
// the frame's origin on the screen (the projection of the skids' bottom at the hull's depth) and its transform
function frame(H){const fa=H.fa<0?-1:1,d=H.dep||0,G=G0();return{fa,ox:H.x+d*PX(),oy:G-(H.y||0)-d*PY(),tilt:H.tilt||0};}
function setT(c,F){c.transform(F.fa,0,0,-1,F.ox,F.oy);if(F.tilt){c.translate(DIM.hub[0],DIM.hub[1]);c.rotate(-F.tilt);c.translate(-DIM.hub[0],-DIM.hub[1]);}}
// a point of the frame in the world (unprojected, in the hull's depth plane, the way a fighter's points are)
function at(H,lx,ly){const fa=H.fa<0?-1:1,t=-(H.tilt||0),hx=DIM.hub[0],hy=DIM.hub[1],dx=lx-hx,dy=ly-hy,c=Math.cos(t),s=Math.sin(t),rx=hx+dx*c-dy*s,ry=hy+dx*s+dy*c;
  return{x:H.x+fa*rx,y:G0()-(H.y||0)-ry};}
function doorAt(H){const p=at(H,(DIM.door.x0+DIM.door.x1)/2-4,DIM.cabinFloor+1);return{x:p.x,y:p.y,dep:H.dep||0};}
// ---------- what moves ----------
function rotor(c,H,o){const now=o.now??0,a=H.rotor||0,R=DIM.rotorR,[hx,hy]=DIM.hub,sp=H.spin==null?1:H.spin;
  // the blur of the turning disc, seen nearly edge on
  c.save();c.globalAlpha=.55*sp;
  c.fillStyle=lgr(c,hx-R,0,hx+R,0,[[0,'rgba(12,12,18,0)'],[.15,'rgba(12,12,18,.35)'],[.5,'rgba(18,18,26,.5)'],[.85,'rgba(12,12,18,.35)'],[1,'rgba(12,12,18,0)']]);
  c.beginPath();c.ellipse(hx,hy+2,R,7,0,0,TAU);c.fill();
  c.globalCompositeOperation='lighter';c.strokeStyle=rgba('#c8d4ff',.12*sp);c.lineWidth=.8;c.beginPath();c.ellipse(hx,hy+2,R,7,0,Math.PI*1.05,Math.PI*1.95);c.stroke();c.restore();
  // four blades: their length along the frame is their turn's cosine; the near ones sit a touch lower
  c.lineCap='round';for(let k=0;k<4;k++){const b=a+k*TAU/4,x=Math.cos(b)*R,y=Math.sin(b)*5;const vis=sp>.6?.35:1;
    c.strokeStyle=rgba('#07070b',vis);c.lineWidth=3.2;c.beginPath();c.moveTo(hx,hy);c.lineTo(hx+x,hy+2+y);c.stroke();
    c.strokeStyle=rgba(K.gold,.55*vis);c.lineWidth=.8;c.beginPath();c.moveTo(hx+x*.9,hy+2+y*.9);c.lineTo(hx+x,hy+2+y);c.stroke();}
  c.fillStyle='#0d0d12';c.beginPath();c.ellipse(hx,hy,15,5,0,0,TAU);c.fill();c.fillStyle=K.gold;c.beginPath();c.ellipse(hx,hy+1,6,2.4,0,0,TAU);c.fill();
  // the tail rotor on the near side of the fin: a disc of blur with a pale rim, two blades, a gold boss
  const [tx,ty,tr]=DIM.tailRotor;c.save();c.globalAlpha=sp;c.fillStyle=rgr(c,tx,ty,2,tr,[[0,'rgba(150,160,185,.10)'],[.85,'rgba(150,160,185,.16)'],[1,'rgba(150,160,185,0)']]);
  c.beginPath();c.arc(tx,ty,tr,0,TAU);c.fill();c.strokeStyle='rgba(200,210,235,.28)';c.lineWidth=1;c.beginPath();c.arc(tx,ty,tr-1.5,0,TAU);c.stroke();c.restore();
  const b=a*4.7;for(const s2 of [0,Math.PI/2]){c.strokeStyle=rgba('#08080c',sp>.6?.55:1);c.lineWidth=3;c.beginPath();c.moveTo(tx+Math.cos(b+s2)*tr,ty+Math.sin(b+s2)*tr);c.lineTo(tx-Math.cos(b+s2)*tr,ty-Math.sin(b+s2)*tr);c.stroke();}
  c.fillStyle='#0d0d12';c.beginPath();c.arc(tx,ty,6,0,TAU);c.fill();c.fillStyle=K.gold;c.beginPath();c.arc(tx,ty,3.2,0,TAU);c.fill();}
// the sliding door: shut over the opening, open slid back along the flank
function door(c,H){const P=paths(),u=clamp(H.door??0,0,1),{x0,x1,sill,top}=DIM.door,dx=-u*(x1-x0+6),wx=(x0+x1)/2+dx;
  const D=rr(x0+dx,sill,x1+dx,top,10);c.fillStyle=lgr(c,0,sill,0,top,[[0,'#050508'],[.4,K.lac],[.66,K.lac2],[.75,'#2e2c3a'],[1,K.lac]]);c.fill(D);
  c.strokeStyle='#020203';c.lineWidth=1.2;c.stroke(D);
  c.fillStyle=lgr(c,0,116,0,160,[[0,'#f0c080'],[1,'#8a5a28']]);c.beginPath();c.ellipse(wx,136,16,21,0,0,TAU);c.fill();c.strokeStyle=K.goldD;c.lineWidth=1.6;c.stroke();
  c.strokeStyle=K.gold;c.lineWidth=1.3;c.beginPath();c.moveTo(x0+dx,61);c.lineTo(x1+dx,60);c.stroke();
  c.fillStyle=K.goldL;c.fillRect(x1+dx-12,98,7,2.4);}
function lights(c,H,o){const now=o.now??0,fa=H.fa<0?-1:1;
  const fl=(x,y,col,a,r)=>{c.save();c.globalCompositeOperation='lighter';c.fillStyle=rgr(c,x,y,0,r,[[0,rgba(col,a)],[.3,rgba(col,a*.4)],[1,rgba(col,0)]]);c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.restore();c.fillStyle=rgba('#ffffff',Math.min(1,a*1.4));c.fillRect(x-1.2,y-1.2,2.4,2.4);};
  // the beacons on the roof and the belly: red, turning
  const bk=Math.pow(Math.max(0,Math.sin(now*6.3)),6);fl(-40,228,'#ff2a1a',.9*bk+.12,16);fl(0,24,'#ff2a1a',.7*Math.pow(Math.max(0,Math.sin(now*6.3+1.6)),6)+.08,12);
  // the nav light on the tailplane's tip: green on the starboard side we see when it faces right, red to port
  fl(-412,137,fa>0?'#5aff8a':'#ff3a2a',.75,10);
  // the strobe on the tail
  const st=(now%1.4)<.06?1:0;if(st)fl(-506,150,'#ffffff',1,26);
  // the cockpit's instruments breathe a little
  c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.25+.08*Math.sin(now*1.7);c.fillStyle=rgr(c,150,124,4,60,[[0,rgba(K.cyan,.8)],[1,rgba(K.cyan,0)]]);c.fill(paths().screen);c.restore();}
// the searchlight: a cone from under the chin to the deck, and its pool there; in screen space, after the body
function beam(c,H,o){const k=clamp(H.lamp??0,0,1);if(k<=0)return;const F=frame(H),d=H.dep||0,L=at(H,DIM.lamp[0],DIM.lamp[1]),G=G0();
  const lx=L.x+d*PX(),ly=L.y-d*PY();let tx,ty,tdep;
  if(H.spot){tdep=H.spot.dep;tx=H.spot.x+tdep*PX();ty=G-tdep*PY();}else{tdep=d-10;const ax=at(H,DIM.lamp[0]+60,DIM.lamp[1]-40);const vx=ax.x-L.x,vy=ax.y-L.y,t=(G-L.y)/(vy||1e-3);tx=L.x+vx*t+tdep*PX();ty=G-tdep*PY();}
  const dx=tx-lx,dy=ty-ly,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len,w=len*.16;
  c.save();c.globalCompositeOperation='lighter';
  c.fillStyle=lgr(c,lx,ly,tx,ty,[[0,rgba('#eaf6ff',.28*k)],[.7,rgba('#d8ecff',.1*k)],[1,rgba('#d8ecff',.04*k)]]);
  c.beginPath();c.moveTo(lx+nx*2,ly+ny*2);c.lineTo(tx+nx*w,ty+ny*w*.4);c.lineTo(tx-nx*w,ty-ny*w*.4);c.lineTo(lx-nx*2,ly-ny*2);c.closePath();c.fill();
  c.translate(tx,ty);c.scale(1,.42);c.fillStyle=rgr(c,0,0,2,w*1.3,[[0,rgba('#f2f8ff',.32*k)],[.5,rgba('#dcecff',.12*k)],[1,rgba('#dcecff',0)]]);c.beginPath();c.arc(0,0,w*1.3,0,TAU);c.fill();c.restore();
  c.save();c.globalCompositeOperation='lighter';c.fillStyle=rgr(c,lx,ly,0,14,[[0,rgba('#ffffff',.95*k)],[.3,rgba('#eaf6ff',.5*k)],[1,rgba('#eaf6ff',0)]]);c.beginPath();c.arc(lx,ly,14,0,TAU);c.fill();c.restore();}
// the downwash on the deck when it is low: rings of blown dust running out from under it, grit flying, the deck's sheen stirred
function wash(c,H,o){const now=o.now??0,d=H.dep||0,G=G0(),hub=at(H,DIM.hub[0],0),cx=hub.x+d*PX(),cy=G-d*PY(),hy=H.y||0;
  // its shadow on the deck, softer and fainter the higher it hangs
  {const k=clamp(1-hy/420,0,1),sx=at(H,10,0).x+d*PX();c.save();c.translate(sx,cy);c.scale(1,.16);c.fillStyle=rgr(c,0,0,10,340,[[0,rgba('#000000',.5*k)],[.6,rgba('#000000',.25*k)],[1,rgba('#000000',0)]]);c.beginPath();c.arc(0,0,340,0,TAU);c.fill();c.restore();}
  const low=clamp(1-hy/150,0,1)*(H.spin==null?1:H.spin);if(low<=0)return;
  c.save();for(let i=0;i<4;i++){const u=((now*1.6+i/4)%1),r=40+u*260,a=(1-u)*.22*low;c.strokeStyle=rgba('#9a94a8',a);c.lineWidth=2+6*(1-u);c.beginPath();c.ellipse(cx,cy,r,r*.3,0,0,TAU);c.stroke();}
  c.fillStyle=rgr(c,cx,cy,10,200,[[0,rgba('#9a94a8',.12*low)],[1,rgba('#9a94a8',0)]]);c.save();c.translate(cx,cy);c.scale(1,.3);c.beginPath();c.arc(0,0,200,0,TAU);c.fill();c.restore();
  for(let i=0;i<46;i++){const s=(i*97.13)%1,ph=(now*(1.4+s)+s*7)%1,ang=s*TAU,r=50+ph*300,x=cx+Math.cos(ang)*r,y=cy+Math.sin(ang)*r*.3-Math.sin(ph*Math.PI)*8;c.fillStyle=rgba('#c8c0b0',(1-ph)*.5*low);c.fillRect(x,y,1.4,1);}
  c.restore();}
// ---------- the whole machine ----------
function draw(c,H,o){o=o||{};const F=frame(H),tr=c.getTransform?c.getTransform():null,k=tr?Math.hypot(tr.a,tr.b)||1:2;
  // which way the light comes from, in the frame, to an eighth of a turn
  let L=o.dir?o.dir:o.light?{x:o.light.x-H.x,y:o.light.y-(G0()-(H.y||0)-150)}:{x:.3,y:-1};const ll=Math.hypot(L.x,L.y)||1,lfx=L.x/ll*F.fa,lfy=-L.y/ll;
  const lq=((Math.round(Math.atan2(lfy,lfx)/TAU*8)%8)+8)%8,e=bodyLayer(bucket(k*1.05),lq);
  c.save();setT(c,F);
  c.save();c.translate(BX0,BY1);c.scale(1/e.sc,-1/e.sc);c.drawImage(e.cv,0,0);c.restore();
  door(c,H);lights(c,H,o);rotor(c,H,o);
  c.restore();
  beam(c,H,o);}
return{draw,beam,wash,doorAt,at,DIM,ok:typeof Path2D==='function'};
})();
// ===== VEH HELI END =====
