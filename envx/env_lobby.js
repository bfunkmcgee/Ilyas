// ===== ENV LOBBY =====
// The Hallowell lobby, the house's black and gold. Walls of Nero Portoro, black marble veined in gold, book-matched panel to panel
// between brass reveals; a cove of warm light under a black ceiling; the HALLOWELL ring in polished brass on the feature wall, a thread
// of the tower's cyan elven light inside it; a reception desk fronted in honey onyx lit from behind; brass lift doors under a floor
// dial; the executive's doors in Macassar ebony inlaid with a gold sunburst, between alabaster sconces; tall windows on the city far
// below. The floor is a calm grey marble with brass let into its seams and the ring inlaid in it, polished enough to hold the lights.
(()=>{const E=EnvLook,{C,lin,rad,rgba,mix,glow,gilt,stars,moon,skyline,haze,rng,lerp,clamp,TAU}=E,LT=()=>LobbyTex;
const FAR=236,yB=()=>GB-FAR*PSY,OX=()=>FAR*PSX,pp=E.pp;
const GOLD=C.gold,GL=C.goldL,GD=C.goldD,GDD=C.goldDD,CYAN=C.cyan||'#7ff3e3';
// two slabs of Portoro serve the whole room: the walls' (and every other piece of black stone), and the feature wall's
const NERO_O={goldK:.75,gold:'#8e7444',goldL:'#c4a46c'},NERO=()=>LT().nero(7,512,512,NERO_O),FEAT_O={goldK:.85,gold:'#9a7c48',goldL:'#d0b078'};
function path(c,pts){c.beginPath();c.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)c.lineTo(pts[i].x,pts[i].y);c.closePath();}
function fillP(c,pts,f){path(c,pts);c.fillStyle=f;c.fill();}
// polished brass: a bar lit across its width, or along its height
function brassV(c,x,y,w,h,k){c.fillStyle=lin(c,x,0,x+w,0,[[0,GDD],[.28,GOLD],[.5,k?GL:mix(GL,GOLD,.4)],[.72,GOLD],[1,GDD]]);c.fillRect(x,y,w,h);}
function brassH(c,x,y,w,h){c.fillStyle=lin(c,0,y,0,y+h,[[0,GL],[.35,GOLD],[1,GDD]]);c.fillRect(x,y,w,h);}
// a pattern laid at (x,y), u units a pixel, mirrored when fx is -1
const pat=(c,cv,x,y,u,rot,fx)=>LT().at(c,cv,x,y,u,rot,fx);
// a run of book-matched Nero Portoro panels: pairs mirror each other across their shared reveal
function neroPanels(c,x0,x1,y0,y1,pw,rv,seed,o){o=o||{};const ne=o.tex===FEAT_O?LT().nero(23,512,512,FEAT_O):NERO(),u=(y1-y0)/512*1.02,r=rng(seed||7);let ox=0;
  for(let x=x0,i=0;x<x1;x+=pw+rv,i++){const w=Math.min(pw,x1-x),p=c.createPattern(ne,'repeat');
    if(i%2===0){ox=r()*Math.max(0,512-pw/u);p.setTransform(new DOMMatrix().translate(x-ox*u,y0).scale(u,u));}
    else p.setTransform(new DOMMatrix().translate(x+pw+ox*u,y0).scale(-u,u));
    c.fillStyle=p;c.fillRect(x,y0,w,y1-y0);
    if(o.reveal!==false&&x+pw<x1){c.fillStyle='#050406';c.fillRect(x+pw,y0,rv,y1-y0);c.fillStyle=lin(c,x+pw,0,x+pw+rv,0,[[0,'#2a200e'],[.5,mix(GD,GOLD,.4)],[1,'#2a200e']]);c.fillRect(x+pw+rv*.25,y0,rv*.5,y1-y0);}}}
function paint(c){
  const X0=-160,X1=W+250,T0=-100,yb=yB(),ox=OX(),wt=46,bt=yb-34,G=LG,r=rng(5);
  // ---- the ceiling: black lacquer, its coffers lit faintly by the cove below them
  c.fillStyle=lin(c,0,T0,0,wt,[[0,'#020203'],[.7,'#08070a'],[1,'#121014']]);c.fillRect(X0,T0,X1-X0,wt-T0);
  for(let x=-150;x<X1;x+=132){c.fillStyle='#050406';c.fillRect(x,T0,8,wt-T0-6);c.fillStyle=rgba(GL,.08);c.fillRect(x+7,T0,1,wt-T0-6);}
  for(let x=-84;x<X1;x+=66){c.fillStyle='#000000';c.beginPath();c.ellipse(x,24,3.4,1.1,0,0,TAU);c.fill();c.fillStyle=rgba('#fff0d0',.85);c.beginPath();c.ellipse(x,24.3,2,.6,0,0,TAU);c.fill();glow(c,x,25,12,'#ffd090',.25);}
  // ---- the walls: Nero Portoro, book-matched, brass reveals between the panels, a warm strip let into every third
  neroPanels(c,-150,X1,wt,bt,44,2,7,{tex:NERO_O});
  for(let x=-150+44,i=0;x<X1;x+=46,i++){if(i%3!==1)continue;c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,x-14,0,x+16,0,[[0,rgba('#ffbe6e',0)],[.5,rgba('#ffbe6e',.07)],[1,rgba('#ffbe6e',0)]]);c.fillRect(x-14,wt+6,30,bt-wt-12);c.restore();
    c.fillStyle=rgba('#ffe2b0',.5);c.fillRect(x+.6,wt+8,.8,bt-wt-16);}
  // the cove: a line of gold light under the ceiling, washing down the stone; the marble holds a sheen of it
  brassH(c,X0,wt-4,X1-X0,3);c.fillStyle=rgba('#ffdcaa',.9);c.fillRect(X0,wt-1,X1-X0,1.3);
  c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,0,wt,0,wt+70,[[0,rgba('#ffbe6e',.22)],[.4,rgba('#ffbe6e',.06)],[1,rgba('#ffbe6e',0)]]);c.fillRect(X0,wt,X1-X0,70);c.restore();
  c.fillStyle=lin(c,0,wt,0,bt,[[0,rgba('#000000',0)],[.55,rgba('#000000',.12)],[1,rgba('#000000',.3)]]);c.fillRect(X0,wt,X1-X0,bt-wt);
  // ---- the base of the wall: black granite, polished, a brass line along its top
  c.fillStyle=pat(c,EnvTex.granite(19,128,64,{base:'#222026'}),0,bt,.25);c.fillRect(X0,bt,X1-X0,yb-bt);c.fillStyle=rgba('#000000',.35);c.fillRect(X0,bt,X1-X0,yb-bt);
  brassH(c,X0,bt-1,X1-X0,2.2);c.fillStyle=lin(c,0,bt+1,0,bt+12,[[0,rgba('#ffd9a0',.12)],[1,rgba('#ffd9a0',0)]]);c.fillRect(X0,bt+1,X1-X0,11);
  c.strokeStyle=rgba('#000000',.55);c.lineWidth=.8;c.beginPath();for(let x=-100;x<X1;x+=88){c.moveTo(x,bt+2);c.lineTo(x,yb);}c.stroke();
  // ---- the floor
  floor(c,X0,X1,yb,ox);
  // ---- the windows: the city far below
  for(const [w,seed] of [[G.winA,11],[G.winB,29]])cityWindow(c,w,seed);
  // ---- the feature wall behind the desk: a field of Portoro in a brass frame, the HALLOWELL ring lit from above
  featureWall(c,300,588,96,bt);
  // ---- the reception desk
  desk(c);
  // ---- the painting at the left: gold leaf, a black slash
  painting(c,22,100,62,104);
  // ---- the lift and the executive's doors
  lift(c,yb);execDoor(c,yb,wt);
  // ---- a camera on a bracket high on the wall, looking down at the room
  {const q=G.cam;c.fillStyle='#050406';c.fillRect(q.x-1.4,q.y-15,2.8,12);brassH(c,q.x-4,q.y-16,8,2);
    c.fillStyle=lin(c,0,q.y-4,0,q.y+5,[[0,'#24222a'],[1,'#08070a']]);c.beginPath();c.moveTo(q.x+8,q.y-4);c.lineTo(q.x-8,q.y-4);c.lineTo(q.x-12,q.y+1);c.lineTo(q.x-8,q.y+5);c.lineTo(q.x+8,q.y+5);c.closePath();c.fill();
    c.fillStyle=rgba(GL,.35);c.fillRect(q.x-8,q.y-4,16,.6);c.fillStyle='#0a0a10';c.beginPath();c.arc(q.x-11,q.y+1,2,0,TAU);c.fill();c.fillStyle=rgba('#7a90c0',.5);c.beginPath();c.arc(q.x-11.4,q.y+.4,.7,0,TAU);c.fill();}
  // the room falls into shadow toward us
  c.fillStyle=lin(c,0,yb,0,GB+110,[[0,rgba('#000000',0)],[.55,rgba('#000000',.18)],[1,rgba('#000000',.55)]]);c.fillRect(X0,yb,X1-X0,GB+120-yb);}
// ---------- the floor: slabs of grey marble in a running bond, brass let into every other row, the ring inlaid, the lights held in the polish
function floor(c,X0,X1,yb,ox){const SX=110,SD=66,gs=LT().greyStone(11,512,512,{base:'#3c3936',cloud:'#4c4844',dark:'#2c2a28',vein:'#bcb4aa',veinK:.4}),r=rng(61);
  c.save();path(c,[pp(X0,GB,FAR),pp(X1,GB,FAR),pp(X1,GB,-110),pp(X0,GB,-110)]);c.clip();
  c.save();c.transform(1,0,PSX,-PSY,0,GB);
  for(let d=-110,k=0;d<FAR;d+=SD,k++)for(let x=X0-60-(k%2)*SX/2;x<X1+60;x+=SX){const e=Math.min(d+SD,FAR),p=c.createPattern(gs,'repeat');p.setTransform(new DOMMatrix().translate(x-r()*140,d-r()*180).scale(.5));
    c.fillStyle=p;c.fillRect(x,d,SX+.4,e-d+.4);c.fillStyle=rgba('#000000',.12+r()*.08);c.fillRect(x,d,SX+.4,e-d+.4);}
  // the joints, hairline; brass in every other row
  c.fillStyle=rgba('#0a0a0e',.7);for(let d=-110,k=0;d<FAR;d+=SD,k++){c.fillRect(X0-60,d-.3,X1-X0+120,.6);for(let x=X0-60-(k%2)*SX/2;x<X1+60;x+=SX)c.fillRect(x-.3,d,.6,Math.min(SD,FAR-d));}
  for(let d=-110+SD*2;d<FAR;d+=SD*2){c.fillStyle=lin(c,0,d-.6,0,d+.6,[[0,rgba(GDD,.8)],[.5,rgba(GOLD,.75)],[1,rgba(GD,.8)]]);c.fillRect(X0-60,d-.6,X1-X0+120,1.2);}
  // the ring inlaid in the floor, echoing the one on the wall, its gap and its moon
  {const cx=470,cd=94,rx=112,rz=78;c.lineCap='round';
    c.strokeStyle=rgba('#000000',.55);c.lineWidth=3.4;c.beginPath();c.ellipse(cx,cd,rx,rz,0,.45,TAU-.35);c.stroke();
    c.strokeStyle=GOLD;c.lineWidth=2.4;c.beginPath();c.ellipse(cx,cd,rx,rz,0,.45,TAU-.35);c.stroke();
    c.strokeStyle=rgba(GL,.8);c.lineWidth=.7;c.beginPath();c.ellipse(cx,cd,rx+.5,rz+.5,0,.45,TAU-.35);c.stroke();
    c.strokeStyle=rgba(GOLD,.55);c.lineWidth=1;c.beginPath();c.ellipse(cx,cd,rx-16,rz-11,0,0,TAU);c.stroke();
    const mx=cx+(rx+9)*Math.cos(.05),md=cd+(rz+5)*Math.sin(.05);c.fillStyle=GOLD;c.beginPath();c.arc(mx,md,5.4,0,TAU);c.fill();c.fillStyle=rgba(GL,.7);c.beginPath();c.arc(mx-1.2,md+1.4,2.2,0,TAU);c.fill();}
  // a threshold of black stone before the executive's doors, edged in brass
  {const x0=EXEC_DOOR.x-62,x1=EXEC_DOOR.x+62;c.fillStyle=pat(c,NERO(),x0,FAR-24,.3);c.fillRect(x0,FAR-24,x1-x0,24);c.fillStyle=rgba('#000000',.3);c.fillRect(x0,FAR-24,x1-x0,24);
    c.fillStyle=GOLD;c.fillRect(x0,FAR-24.8,x1-x0,1.4);}
  c.restore();
  // the polish: what is lit on the back wall lies in the floor below it, long and soft
  c.save();c.globalCompositeOperation='lighter';
  const streak=(x,w,len,col,a)=>{c.fillStyle=lin(c,0,yb,0,yb+len,[[0,rgba(col,a)],[.35,rgba(col,a*.35)],[1,rgba(col,0)]]);c.fillRect(x-w/2,yb,w,len);
    c.fillStyle=lin(c,x-w,0,x+w,0,[[0,rgba(col,0)],[.5,rgba(col,a*.25)],[1,rgba(col,0)]]);c.fillRect(x-w,yb,w*2,len*.6);};
  c.fillStyle=lin(c,0,yb,0,yb+26,[[0,rgba('#ffbe6e',.1)],[1,rgba('#ffbe6e',0)]]);c.fillRect(X0,yb,X1-X0,26);
  for(let x=-150+44,i=0;x<X1;x+=46,i++){if(i%3===1)streak(x+1,3,70,'#ffd2a0',.16);}
  for(const w of [LG.winA,LG.winB])streak((w.x0+w.x1)/2,(w.x1-w.x0)*.8,110,'#7a96d8',.1);
  {const a=pp(272,GB,196),b=pp(538,GB,196);c.fillStyle=lin(c,0,a.y,0,a.y+70,[[0,rgba('#ffa850',.28)],[1,rgba('#ffa850',0)]]);c.fillRect(a.x,a.y,b.x-a.x,70);}
  for(const sx of [LG.dx0-48,LG.dx1+48])streak(sx,8,90,'#ffd09a',.3);
  streak(LG.liftX,40,60,'#ffcf86',.08);
  c.restore();c.restore();}
// ---------- a window on the city far below: night, a moon, towers in the haze, the lights of the streets, and the room's lamps in the glass
function cityWindow(c,w,seed){const {x0,x1,y0,y1}=w,ww=x1-x0,hh=y1-y0,r=rng(seed);
  // a deep reveal of black stone round it, brass at its edge
  c.fillStyle='#050406';c.fillRect(x0-7,y0-7,ww+14,hh+14);brassV(c,x0-7,y0-7,2,hh+14);brassV(c,x1+5,y0-7,2,hh+14);brassH(c,x0-7,y0-7,ww+14,2);
  c.save();c.beginPath();c.rect(x0,y0,ww,hh);c.clip();
  c.fillStyle=lin(c,0,y0,0,y1,[[0,'#03040a'],[.35,'#0a0f22'],[.62,'#1a1a34'],[.8,'#3a2632'],[1,'#5a3428']]);c.fillRect(x0,y0,ww,hh);
  stars(c,x0,x1,y0,y0+hh*.45,Math.round(ww*.5),seed,.6);
  if(seed===11)moon(c,x0+ww*.68,y0+hh*.16,6,{phase:.6});
  // the far towers stand in the haze; below them the city spreads out, its streets in amber, a dark river through it
  skyline(c,x0-10,x1+10,y0+hh*.6,{seed:seed+3,far:.9,h0:12,h1:60,w0:6,w1:14,col:'#141428',hazeCol:'#3a2a3a',hazeH:30,hazeA:.5,dens:.8});
  skyline(c,x0-10,x1+10,y0+hh*.68,{seed:seed+9,far:.6,h0:8,h1:34,w0:7,w1:16,col:'#0e0e1c',hazeCol:'#4a3034',hazeH:20,hazeA:.4,dens:1.2});
  {const top=y0+hh*.68;c.fillStyle=lin(c,0,top,0,y1,[[0,'#140e16'],[1,'#20141a']]);c.fillRect(x0,top,ww,y1-top);
    for(let i=0;i<ww*hh*.05;i++){const px=x0+r()*ww,py=top+Math.pow(r(),.8)*(y1-top),k=(py-top)/(y1-top);c.fillStyle=rgba(r()<.8?'#ffc070':'#e8f0ff',(.25+.55*r())*(.4+k*.6));const s=.5+k*.9;c.fillRect(px,py,s,s*.7);}
    // the streets: strings of amber running off toward the horizon
    c.strokeStyle=rgba('#ffb060',.28);c.lineWidth=.6;for(let i=0;i<5;i++){const sx=x0+r()*ww,sy=y1;c.beginPath();c.moveTo(sx,sy);c.lineTo(sx+(r()-.5)*ww*.6,top+2);c.stroke();}
    c.fillStyle=rgba('#05040a',.85);c.beginPath();c.moveTo(x0,top+hh*.12);c.quadraticCurveTo(x0+ww*.5,top+hh*.08,x1,top+hh*.16);c.lineTo(x1,top+hh*.19);c.quadraticCurveTo(x0+ww*.5,top+hh*.12,x0,top+hh*.15);c.closePath();c.fill();}
  // the glass holds the room: a lamp's ring, the cove's line, a sheen
  c.save();c.globalCompositeOperation='lighter';c.strokeStyle=rgba('#ffd9a0',.12);c.lineWidth=1.4;c.beginPath();c.ellipse(x0+ww*.35,y0+hh*.3,12,3,0,0,TAU);c.stroke();
  c.fillStyle=rgba('#ffe8d0',.035);c.beginPath();c.moveTo(x0+ww*.15,y0);c.lineTo(x0+ww*.32,y0);c.lineTo(x0+ww*.02,y1);c.lineTo(x0-ww*.15,y1);c.closePath();c.fill();c.restore();
  c.restore();
  // bronze mullions and a transom
  const cols=w.cols||2;for(let i=1;i<cols;i++){const mx=x0+i*ww/cols;c.fillStyle='#0a0806';c.fillRect(mx-1.6,y0,3.2,hh);c.fillStyle=rgba(GL,.45);c.fillRect(mx-1.6,y0,.6,hh);}
  const ty=y0+hh*.72;c.fillStyle='#0a0806';c.fillRect(x0,ty-1.4,ww,2.8);c.fillStyle=rgba(GL,.45);c.fillRect(x0,ty-1.4,ww,.6);
  c.fillStyle='#0a0806';c.fillRect(x0,y1-3,ww,3);brassH(c,x0-8,y1,ww+16,2.4);}
// ---------- the feature wall: Portoro framed in brass, the ring lit from above ----------
function featureWall(c,x0,x1,top,bt){const cx=(x0+x1)/2,cy=top+68,R=40;
  c.fillStyle='#030304';c.fillRect(x0-6,top-6,x1-x0+12,bt-top+6);
  neroPanels(c,x0,x1,top,bt,(x1-x0-2)/2,2,23,{reveal:false,tex:FEAT_O});
  brassV(c,x0-6,top-6,3,bt-top+6,1);brassV(c,x1+3,top-6,3,bt-top+6,1);brassH(c,x0-6,top-6,x1-x0+12,3);
  c.fillStyle=lin(c,0,top,0,bt,[[0,rgba('#000000',.0)],[1,rgba('#000000',.35)]]);c.fillRect(x0,top,x1-x0,bt-top);
  // the light from above: a cone from a slot in the ceiling, warm on the stone and the ring
  c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,0,top,0,top+170,[[0,rgba('#ffd69a',.18)],[1,rgba('#ffd69a',0)]]);c.beginPath();c.moveTo(cx-8,top);c.lineTo(cx+8,top);c.lineTo(cx+82,top+170);c.lineTo(cx-82,top+170);c.closePath();c.fill();
  c.fillStyle=rad(c,cx,cy,0,96,[[0,rgba('#ffc880',.16)],[1,rgba('#ffc880',0)]]);c.fillRect(cx-96,cy-96,192,192);c.restore();
  // the ring: polished brass, its gap, its moon and the bar; inside it a thread of cyan light
  c.save();c.lineCap='round';
  c.strokeStyle=rgba('#000000',.6);c.lineWidth=5;c.beginPath();c.arc(cx+1.4,cy+2,R,.35,TAU-.5);c.stroke();
  c.strokeStyle=lin(c,cx-R,cy-R,cx+R,cy+R,[[0,GL],[.3,GOLD],[.55,GD],[.8,GOLD],[1,GL]]);c.lineWidth=4;c.beginPath();c.arc(cx,cy,R,.35,TAU-.5);c.stroke();
  c.strokeStyle=rgba('#fff4d6',.75);c.lineWidth=.9;c.beginPath();c.arc(cx,cy,R+1.2,Math.PI*1.08,Math.PI*1.62);c.stroke();
  c.globalCompositeOperation='lighter';c.strokeStyle=rgba(CYAN,.5);c.lineWidth=1;c.beginPath();c.arc(cx,cy,R-8,0,TAU);c.stroke();
  c.strokeStyle=rgba(CYAN,.12);c.lineWidth=5;c.beginPath();c.arc(cx,cy,R-8,0,TAU);c.stroke();c.globalCompositeOperation='source-over';
  const mx=cx+R*Math.cos(-.08)+9,my=cy+R*Math.sin(-.08)-8;c.fillStyle=rgba('#000000',.55);c.beginPath();c.arc(mx+1,my+1.5,5.4,0,TAU);c.fill();
  c.fillStyle=rad(c,mx-1.6,my-1.6,.5,6,[[0,GL],[.6,GOLD],[1,GD]]);c.beginPath();c.arc(mx,my,5.2,0,TAU);c.fill();
  c.fillStyle=rgba('#000000',.5);c.fillRect(cx,cy-R+5,2.4,R-6);c.fillStyle=lin(c,cx-1.2,0,cx+1.2,0,[[0,GD],[.5,GL],[1,GD]]);c.fillRect(cx-1.2,cy-R+4,2.4,R-6);
  c.restore();
  // the name in brass letters, set off the stone with their shadows
  c.save();c.font='700 13px "Alegreya SC", Georgia, serif';c.textAlign='center';
  [...'HALLOWELL'].forEach((ch,i)=>{const x=cx+(i-4)*15.5,y=cy+R+34;c.fillStyle=rgba('#000000',.6);c.fillText(ch,x+.8,y+1.2);c.fillStyle=lin(c,0,y-10,0,y,[[0,GL],[.5,GOLD],[1,GD]]);c.fillText(ch,x,y);});
  c.restore();brassH(c,cx-70,cy+R+42,140,1.2);}
// ---------- the reception desk: honey onyx lit from behind, between brass pilasters, under a black marble top ----------
function desk(c){const x0=272,x1=538,dF=196,dB=224,h=46,t0=pp(x0,GB-h,dF),t1=pp(x1,GB-h,dF),b0=pp(x0,GB-h,dB),b1=pp(x1,GB-h,dB),f0=pp(x0,GB,dF),f1=pp(x1,GB,dF),g1=pp(x1,GB,dB);
  // its shadow and the glow it throws on the floor
  fillP(c,[f0,f1,pp(x1+16,GB,dF-12),pp(x0-16,GB,dF-12)],rgba('#000000',.4));
  // the end of it, black stone
  fillP(c,[t1,b1,g1,f1],pat(c,NERO(),t1.x,t1.y,.25));fillP(c,[t1,b1,g1,f1],rgba('#000000',.5));
  // the front: five onyx panels lit from within, brass pilasters between them, a dark plinth at the foot
  const n=5,pil=4,fw=(t1.x-t0.x),ph=f0.y-t0.y-7;c.save();path(c,[t0,t1,{x:f1.x,y:f1.y-7},{x:f0.x,y:f0.y-7}]);c.clip();
  c.fillStyle=pat(c,LT().onyx(3,256,256),t0.x,t0.y,.22);c.fillRect(t0.x,t0.y,fw,ph);
  c.fillStyle=lin(c,0,t0.y,0,t0.y+ph,[[0,rgba('#1e0a02',.66)],[.45,rgba('#1e0a02',.4)],[1,rgba('#1e0a02',.7)]]);c.fillRect(t0.x,t0.y,fw,ph);
  for(let i=0;i<n;i++){const px=t0.x+(i+.5)*fw/n;c.save();c.globalCompositeOperation='lighter';c.fillStyle=rad(c,px,t0.y+ph*.55,2,fw/n*.7,[[0,rgba('#ffb040',.17)],[1,rgba('#ffb040',0)]]);c.fillRect(px-fw/n,t0.y,fw/n*2,ph);c.restore();}
  for(let i=0;i<=n;i++){const px=t0.x+i*fw/n-pil/2;brassV(c,px,t0.y,pil,ph,1);c.fillStyle=rgba('#000000',.4);c.fillRect(px+pil,t0.y,.8,ph);}
  c.restore();
  fillP(c,[{x:f0.x,y:f0.y-7},{x:f1.x,y:f1.y-7},f1,f0],'#060507');c.fillStyle=rgba('#ffb060',.7);c.fillRect(f0.x,f0.y-1.4,f1.x-f0.x,.9);
  // the top: a slab of Portoro with a brass nosing, lit along its edge
  fillP(c,[t0,t1,b1,b0],pat(c,NERO(),b0.x,b0.y,.25));fillP(c,[t0,t1,b1,b0],rgba('#000000',.15));
  c.fillStyle=lin(c,0,t0.y-1,0,t0.y+3,[[0,GL],[1,GD]]);c.fillRect(t0.x-1,t0.y-.5,fw+2,3);c.fillStyle=rgba('#fff2d0',.9);c.fillRect(t0.x-1,t0.y-.6,fw+2,.7);
  // two brass lamps with silk shades, a bowl of white orchids, the brass bell
  for(const lx of [296,514]){const a=pp(lx,GB-h,210),s=a.y;c.fillStyle=lin(c,a.x-1.2,0,a.x+1.2,0,[[0,GD],[.5,GL],[1,GD]]);c.fillRect(a.x-1,s-15,2,15);c.fillStyle=GOLD;c.beginPath();c.ellipse(a.x,s-.6,4,1.2,0,0,TAU);c.fill();
    c.fillStyle=lin(c,0,s-24,0,s-14,[[0,'#f6e6c4'],[1,'#d8b878']]);c.beginPath();c.moveTo(a.x-8,s-14);c.lineTo(a.x-5,s-24);c.lineTo(a.x+5,s-24);c.lineTo(a.x+8,s-14);c.closePath();c.fill();
    glow(c,a.x,s-16,40,'#ffc880',.3);c.fillStyle=rgba('#fff6e0',.9);c.fillRect(a.x-7.4,s-14.6,14.8,.8);}
  {const o=pp(405,GB-h,208);c.fillStyle=lin(c,o.x-11,0,o.x+11,0,[[0,'#050406'],[.5,'#1c1a20'],[1,'#050406']]);c.fillRect(o.x-11,o.y-7,22,7);c.fillStyle=GOLD;c.fillRect(o.x-11,o.y-7.6,22,.9);
    c.strokeStyle='#3a5a32';c.lineWidth=1;c.beginPath();for(const a of [-.6,-.2,.25,.6]){c.moveTo(o.x,o.y-7);c.quadraticCurveTo(o.x+Math.sin(a)*6,o.y-15,o.x+Math.sin(a)*13,o.y-20);}c.stroke();
    for(const a of [-.6,-.2,.25,.6]){const fx=o.x+Math.sin(a)*13,fy=o.y-20;c.fillStyle='#f4f2ee';for(let k=0;k<5;k++){const aa=k/5*TAU;c.beginPath();c.ellipse(fx+Math.cos(aa)*1.4,fy+Math.sin(aa)*1.2,1.3,.9,aa,0,TAU);c.fill();}c.fillStyle='#c87aa0';c.fillRect(fx-.4,fy-.4,.8,.8);}}
  {const o=pp(470,GB-h,214);c.fillStyle=rad(c,o.x-1,o.y-4,.4,4,[[0,GL],[1,GD]]);c.beginPath();c.arc(o.x,o.y-2,3,Math.PI,0);c.fill();c.fillStyle=GD;c.fillRect(o.x-4,o.y-2,8,1.2);}}
// ---------- the painting: gold leaf laid square by square, a disc of it half under a black slash ----------
function painting(c,x0,y0,w,h){c.fillStyle=rgba('#000000',.6);c.fillRect(x0-6,y0-4,w+14,h+12);c.fillStyle='#050406';c.fillRect(x0-5,y0-5,w+10,h+10);brassH(c,x0-5,y0-5,w+10,1.2);c.fillStyle=rgba(GL,.4);c.fillRect(x0-5,y0-5,1,h+10);
  c.save();c.beginPath();c.rect(x0,y0,w,h);c.clip();c.fillStyle='#0e0c10';c.fillRect(x0,y0,w,h);
  const cx=x0+w*.6,cy=y0+h*.4,rr=20,r=rng(9);c.save();c.beginPath();c.arc(cx,cy,rr,0,TAU);c.clip();
  for(let y=cy-rr;y<cy+rr;y+=4)for(let x=cx-rr;x<cx+rr;x+=4){c.fillStyle=mix('#b8924a','#e8c880',r());c.fillRect(x,y,4.2,4.2);}
  c.strokeStyle=rgba('#5a3a14',.35);c.lineWidth=.3;c.beginPath();for(let y=cy-rr;y<cy+rr;y+=4){c.moveTo(cx-rr,y);c.lineTo(cx+rr,y);}c.stroke();c.restore();
  c.fillStyle='#050406';c.beginPath();c.moveTo(x0-4,y0+h*.58);c.lineTo(x0+w+4,y0+h*.3);c.lineTo(x0+w+4,y0+h*.5);c.lineTo(x0-4,y0+h*.8);c.closePath();c.fill();
  c.fillStyle='#4a1420';c.fillRect(x0,y0+h*.86,w,4);c.restore();
  // its picture light
  brassH(c,x0+w/2-13,y0-14,26,3.4);c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,0,y0-12,0,y0+h,[[0,rgba('#ffd69a',.13)],[1,rgba('#ffd69a',0)]]);c.beginPath();c.moveTo(x0+w/2-12,y0-11);c.lineTo(x0+w/2+12,y0-11);c.lineTo(x0+w+18,y0+h);c.lineTo(x0-18,y0+h);c.closePath();c.fill();c.restore();}
// ---------- the lift: brass doors under a floor dial, in a portal of black stone ----------
function lift(c,yb){const A=LOBBY_LIFT,cx=LG.liftX,top=yb-A.h,ot=top-A.hd,x0=cx-A.w/2,x1=cx+A.w/2,fr=A.fr;
  // the portal: black stone, a brass architrave, the dial above
  c.fillStyle=pat(c,NERO(),x0-fr-12,ot-30,.3);c.fillRect(x0-fr-12,ot-30,A.w+2*fr+24,yb-ot+30);c.fillStyle=rgba('#000000',.3);c.fillRect(x0-fr-12,ot-30,A.w+2*fr+24,yb-ot+30);
  brassV(c,x0-fr,ot,fr,yb-ot,1);brassV(c,x1,ot,fr,yb-ot,1);brassH(c,x0-fr,ot,A.w+2*fr,A.hd);c.fillStyle=rgba('#000000',.45);c.fillRect(x0,ot+A.hd-1,A.w,1);
  // the dial: a half-round of brass, the floors marked round it, the needle at the top
  {const dy=ot-8,R=15;c.fillStyle='#050406';c.beginPath();c.arc(cx,dy,R+2,Math.PI,0);c.fill();c.fillStyle=rad(c,cx-4,dy-6,1,R,[[0,GL],[.6,GOLD],[1,GD]]);c.beginPath();c.arc(cx,dy,R,Math.PI,0);c.closePath();c.fill();
    c.fillStyle='#120e08';c.beginPath();c.arc(cx,dy,R-3,Math.PI,0);c.closePath();c.fill();c.strokeStyle=rgba(GL,.8);c.lineWidth=.5;c.beginPath();for(let i=0;i<=8;i++){const a=Math.PI+i*Math.PI/8;c.moveTo(cx+Math.cos(a)*(R-3.6),dy+Math.sin(a)*(R-3.6));c.lineTo(cx+Math.cos(a)*(R-6),dy+Math.sin(a)*(R-6));}c.stroke();
    c.strokeStyle=GL;c.lineWidth=.9;c.beginPath();c.moveTo(cx,dy);const na=Math.PI*1.86;c.lineTo(cx+Math.cos(na)*(R-4),dy+Math.sin(na)*(R-4));c.stroke();c.fillStyle=GOLD;c.beginPath();c.arc(cx,dy,1.6,0,TAU);c.fill();
    glow(c,cx,dy-4,26,'#ffc880',.18);}
  // the doors, shut: brushed brass, a ring cut half in each leaf, a seam of dark between them
  for(const s of [-1,1]){const a=s<0?x0:cx,b=s<0?cx:x1;c.fillStyle=lin(c,a,0,b,0,[[0,GD],[.3,GOLD],[.5,mix(GOLD,GL,.5)],[.75,GOLD],[1,GD]]);c.fillRect(a,top,b-a,A.h);
    c.fillStyle=rgba('#ffffff',.05);for(let x=a+1;x<b;x+=1.6)c.fillRect(x,top,.4,A.h);
    c.fillStyle=lin(c,0,top,0,yb,[[0,rgba('#140c04',.5)],[.5,rgba('#140c04',.32)],[1,rgba('#140c04',.6)]]);c.fillRect(a,top,b-a,A.h);}
  c.save();c.beginPath();c.rect(x0,top,A.w,A.h);c.clip();c.lineWidth=1.2;c.strokeStyle=rgba('#3a2a10',.6);c.beginPath();c.arc(cx,top+A.h*.38,17,0,TAU);c.stroke();c.beginPath();c.arc(cx,top+A.h*.38,12,0,TAU);c.stroke();
  c.strokeStyle=rgba(GL,.55);c.lineWidth=.5;c.beginPath();c.arc(cx-.4,top+A.h*.38-.4,17,Math.PI,Math.PI*1.6);c.stroke();
  for(const yy of [top+12,yb-14]){c.fillStyle=rgba('#3a2a10',.45);c.fillRect(x0+3,yy,A.w-6,.8);}c.restore();
  c.fillStyle='#050406';c.fillRect(cx-.6,top,1.2,A.h);c.fillStyle=rgba(GL,.5);c.fillRect(cx+.6,top,.4,A.h);
  // the call buttons: a brass plate, the up button lit
  const bx=x1+fr+8;c.fillStyle=lin(c,bx,0,bx+9,0,[[0,GD],[.5,GOLD],[1,GD]]);c.fillRect(bx,yb-94,9,24);c.fillStyle='#0a0806';for(const [yy,lit] of [[yb-88,1],[yb-78,0]]){c.beginPath();c.arc(bx+4.5,yy,2.6,0,TAU);c.fill();c.fillStyle=lit?'#ffd890':'#3a3020';c.beginPath();c.arc(bx+4.5,yy,1.8,0,TAU);c.fill();c.fillStyle='#0a0806';}
  glow(c,bx+4.5,yb-88,8,'#ffc070',.4);}
// ---------- the executive's doors: Macassar ebony inlaid with a gold sunburst, in a portal of black stone and brass, alabaster sconces ----------
function execDoor(c,yb,wt){const x0=LG.dx0,x1=LG.dx1,top=LG.dTop,w=x1-x0,cx=(x0+x1)/2;
  // the wash of light from above the portal
  c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,0,wt,0,yb,[[0,rgba('#ffd69a',.18)],[1,rgba('#ffd69a',0)]]);c.beginPath();c.moveTo(cx-8,wt+2);c.lineTo(cx+8,wt+2);c.lineTo(x1+60,yb-8);c.lineTo(x0-60,yb-8);c.closePath();c.fill();c.restore();
  // the portal: black stone either side and over the top, a stepped brass architrave, the entablature with the ring on it
  c.fillStyle=pat(c,NERO(),x0-24,top-40,.32);c.fillRect(x0-24,top-40,w+48,yb-top+40);c.fillStyle=rgba('#000000',.25);c.fillRect(x0-24,top-40,w+48,yb-top+40);
  for(const [k,col] of [[10,GDD],[7,GOLD],[4,GD]]){c.fillStyle=col;c.fillRect(x0-k,top-k,w+2*k,yb-top+k);}
  brassV(c,x0-10,top-10,3,yb-top+10,1);brassV(c,x1+7,top-10,3,yb-top+10,1);brassH(c,x0-10,top-10,w+20,3);
  brassH(c,x0-30,top-40,w+60,3);brassH(c,x0-30,top-27,w+60,2);c.fillStyle='#050406';c.fillRect(x0-30,top-37,w+60,10);
  c.strokeStyle=GOLD;c.lineWidth=1.6;c.beginPath();c.arc(cx,top-32,4.4,.3,TAU-.4);c.stroke();c.fillStyle=GL;c.fillRect(cx+3.6,top-36.6,1.8,1.8);
  // the leaves: dark ebony striped with brown, a sunburst of gold from the foot of each, push bars of brass, kick plates
  for(const s of [0,1]){const a=x0+s*w/2,b=a+w/2;c.fillStyle=pat(c,EnvTex.wood(43,256,128,{dark:'#0a0604',mid:'#2a1a10',light:'#4a3220',rings:11,sharp:5}),a,top,.22,90);c.fillRect(a,top,w/2,yb-top);
    c.fillStyle=lin(c,a,0,b,0,[[0,rgba('#000000',.55)],[.5,rgba('#000000',.25)],[1,rgba('#000000',.5)]]);c.fillRect(a,top,w/2,yb-top);
    c.save();c.beginPath();c.rect(a+4,top+6,w/2-8,yb-top-30);c.clip();const ox2=s?a+4:b-4,oy=yb-24;
    c.strokeStyle=rgba(GOLD,.85);c.lineWidth=.8;c.beginPath();for(let k=0;k<=9;k++){const ang=-Math.PI/2+(s?1:-1)*k*Math.PI/18;c.moveTo(ox2,oy);c.lineTo(ox2+Math.cos(ang)*200,oy+Math.sin(ang)*200);}c.stroke();
    c.strokeStyle=rgba(GOLD,.6);c.lineWidth=.6;for(const rr of [26,52,80]){c.beginPath();c.arc(ox2,oy,rr,s?-Math.PI/2:Math.PI,s?0:-Math.PI/2);c.stroke();}c.restore();
    c.strokeStyle=GOLD;c.lineWidth=1;c.strokeRect(a+4,top+6,w/2-8,yb-top-30);
    const px=s?a+5:b-8;c.fillStyle=lin(c,px,0,px+3,0,[[0,GD],[.5,GL],[1,GD]]);c.fillRect(px,top+60,3,50);
    c.fillStyle=lin(c,0,yb-20,0,yb-6,[[0,GL],[1,GD]]);c.fillRect(a+3,yb-20,w/2-6,14);}
  c.fillStyle='#050406';c.fillRect(cx-.7,top,1.4,yb-top);
  // a line of light under the doors
  c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,0,yb-3,0,yb,[[0,rgba('#ffc070',0)],[1,rgba('#ffc070',.6)]]);c.fillRect(x0+3,yb-3,w-6,3);c.restore();
  // the sconces: alabaster in brass, the light up and down the stone
  for(const sx of [x0-48,x1+48]){const sy=top+34;c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,0,sy-50,0,sy+80,[[0,rgba('#ffc888',0)],[.35,rgba('#ffc888',.22)],[.55,rgba('#ffc888',.2)],[1,rgba('#ffc888',0)]]);c.fillRect(sx-18,sy-50,36,130);c.restore();
    glow(c,sx,sy+16,56,'#ffc070',.34);c.fillStyle='#0a0806';c.fillRect(sx-3,sy-4,6,44);
    c.fillStyle=lin(c,sx-4,0,sx+4,0,[[0,'#d8b890'],[.5,'#fff2dc'],[1,'#d0ac80']]);c.beginPath();c.moveTo(sx-4.4,sy);c.lineTo(sx+4.4,sy);c.lineTo(sx+3.4,sy+34);c.lineTo(sx-3.4,sy+34);c.closePath();c.fill();
    c.strokeStyle=rgba('#a87a40',.35);c.lineWidth=.4;c.beginPath();for(let k=0;k<4;k++){c.moveTo(sx-3.6,sy+6+k*7);c.quadraticCurveTo(sx,sy+3+k*7,sx+3.6,sy+8+k*7);}c.stroke();
    brassH(c,sx-6,sy-5,12,3);brassH(c,sx-6,sy+34,12,3);}
  // the plaque, and the keypad of black glass
  {const px=x1+30,py=top+104;c.fillStyle=lin(c,0,py,0,py+15,[[0,GL],[.4,GOLD],[1,GD]]);c.fillRect(px,py,34,15);c.fillStyle=rgba('#3a2608',.6);c.fillRect(px+5,py+5,24,1);c.fillRect(px+9,py+9,16,1);}
  {const k=LG.kp;c.fillStyle='#050406';c.fillRect(k.x-9,k.y-7,18,38);brassH(c,k.x-9,k.y-7,18,1.2);c.fillStyle='#0c0e14';c.fillRect(k.x-7,k.y-5,14,34);
    c.fillStyle=rgba('#a8b8d8',.4);for(let i=0;i<12;i++)c.fillRect(k.x-5.5+(i%3)*4.4,k.y+4+Math.floor(i/3)*4.6,2.6,2.6);}}
// ---------- what moves: the camera's light, the keypad's, a beacon on a far tower ----------
function live(){const G=LG,t=S.t;ctx.save();ctx.globalCompositeOperation='lighter';
  const on=t%2.2<.5?1:.2;ctx.fillStyle=`rgba(255,50,40,${(.9*on).toFixed(2)})`;ctx.fillRect(G.cam.x-12,G.cam.y+.2,1.8,1.8);
  if(on>.5){const g=ctx.createRadialGradient(G.cam.x-11,G.cam.y+1,0,G.cam.x-11,G.cam.y+1,9);g.addColorStop(0,'rgba(255,60,40,.5)');g.addColorStop(1,'rgba(255,60,40,0)');ctx.fillStyle=g;ctx.fillRect(G.cam.x-20,G.cam.y-8,18,18);}
  if(!(S.breach&&S.breach.blown)){ctx.fillStyle=`rgba(255,60,50,${((.5+.4*Math.sin(t*2.6))*.9).toFixed(2)})`;ctx.fillRect(G.kp.x-1.2,G.kp.y-3.6,2.4,1.8);}
  const b=G.winA;ctx.fillStyle=`rgba(255,70,60,${(t%1.7<.3?.95:.15).toFixed(2)})`;ctx.fillRect(b.x0+(b.x1-b.x0)*.3,b.y0+(b.y1-b.y0)*.36,1.6,1.6);
  ctx.restore();
  // the lift opens live in the game: the game's own car and its light, and the brass leaves sliding back into their jambs
  if(typeof lobbyLiftOpen==='function'){const o=lobbyLiftOpen(),A=LOBBY_LIFT;if(o>.004){liftCabin(ctx,G.liftX,G.yB,A.w,A.h);leaves(o);liftSpill(ctx,A.x,G.far,A.w,o*.85,176);}}}
// each leaf is the layer's own drawing of it, moved (E.blit, where the game provides it), else plain brass
function leaves(o){const A=LOBBY_LIFT,cx=LG.liftX,yb=LG.yB,top=yb-A.h,hw=A.w/2,open=hw*o;
  ctx.save();ctx.beginPath();ctx.rect(cx-hw,top,A.w,A.h);ctx.clip();
  for(const s of [-1,1]){const x=s<0?cx-hw:cx,dx=s*open;if(E.blit&&E.blit(ctx,x,top,hw,A.h,x+dx,top,hw,A.h))continue;
    ctx.fillStyle=lin(ctx,x+dx,0,x+dx+hw,0,[[0,GD],[.3,GOLD],[.5,mix(GOLD,GL,.5)],[.75,GOLD],[1,GD]]);ctx.fillRect(x+dx,top,hw,A.h);}
  // the edge of each leaf catches the light of the car
  for(const s of [-1,1]){const ex=s<0?cx-open:cx+open;ctx.fillStyle=rgba('#fff3d6',.35*Math.min(1,o*4));ctx.fillRect(ex-.4,top,.8,A.h);}
  ctx.restore();}
// the light on a fighter: from above, a little from the front
function light(f){return{dir:{x:.1,y:-1}};}
// ---------- the furniture: black leather sofas, gold velvet lounge chairs, black velvet poufs, Portoro and brass ----------
// patterns for the main canvas, made once and moved for each piece
const PC=new Map();function patC(cv,x,y,u,rot){let p=PC.get(cv);if(!p||p.ctx!==ctx){p={ctx,p:ctx.createPattern(cv,'repeat')};PC.set(cv,p);}let m=new DOMMatrix().translate(x,y);if(rot)m=m.rotate(rot);p.p.setTransform(m.scale(u));return p.p;}
function poly2(pts){ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i].x,pts[i].y);ctx.closePath();}
function face(pts,fill,over){poly2(pts);ctx.fillStyle=fill;ctx.fill();if(over){ctx.fillStyle=over;ctx.fill();}}
function segL(a,b,w,col){ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
// a box in the piece's own frame q(u,v,d): its right side, its top, its front; each face a material and a shade over it
function box(q,u0,u1,v0,v1,fz,bz,M){
  if(M.side&&bz>fz)face([q(u1,v0,fz),q(u1,v1,fz),q(u1,v1,bz),q(u1,v0,bz)],M.side,rgba('#000000',M.sideK==null?.55:M.sideK));
  if(M.top&&bz>fz){const a=q(u0,v1,fz),b=q(u1,v1,bz);face([q(u0,v1,fz),q(u1,v1,fz),q(u1,v1,bz),q(u0,v1,bz)],M.top,M.topLit?lin(ctx,0,b.y,0,a.y,[[0,rgba(M.topLit,.0)],[1,rgba(M.topLit,.14)]]):null);}
  const f0=q(u0,v1,fz),f1=q(u0,v0,fz);face([q(u0,v0,fz),q(u1,v0,fz),q(u1,v1,fz),q(u0,v1,fz)],M.front,lin(ctx,0,f0.y,0,f1.y,[[0,rgba('#ffffff',M.frontHi==null?.03:M.frontHi)],[1,rgba('#000000',M.frontLo==null?.35:M.frontLo)]]));
  if(M.rim)segL(q(u0,v1,fz),q(u1,v1,fz),.7,rgba(M.rim,.5));}
const shadowUnder=(q,d,rx)=>{const a=q(.5,0,d),g=S.arena.ground(0,d),s=P(a.x-d*PSX,g,d);ctx.save();ctx.fillStyle=rad(ctx,a.x,a.y,0,rx,[[0,'rgba(0,0,0,.45)'],[1,'rgba(0,0,0,0)']]);ctx.translate(a.x,a.y);ctx.scale(1,.26);ctx.beginPath();ctx.arc(0,0,rx,0,TAU);ctx.fill();ctx.restore();void s;};
function brassLeg(q,u,d){const a=q(u-.025,0,d),b=q(u+.025,.15,d);ctx.fillStyle=lin(ctx,a.x,0,b.x,0,[[0,GDD],[.5,GL],[1,GD]]);poly2([q(u-.022,0,d),q(u+.022,0,d),q(u+.03,.15,d),q(u-.03,.15,d)]);ctx.fill();}
function leatherM(q){const o=q(0,1,0);const L=patC(LT().leather(5,128,128),o.x,o.y,.25);return{front:L,top:L,side:L,topLit:'#ffd9a8',rim:'#ffcf86',frontHi:.05,frontLo:.4};}
function velvetM(q,col,seed){const o=q(0,1,0);const V=patC(LT().velvet(seed||6,128,128,{base:col}),o.x,o.y,.25);return{front:V,top:V,side:V,topLit:'#fff0c8',rim:'#ffe2a0',frontHi:.06,frontLo:.42};}
function prop(Pp){const t=Pp.type;if(!['sofa','lounger','pouf','sidetable','planter','plinth'].includes(t))return false;
  const q=lobbyFrame(Pp),d=Pp.dep;ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  if(t==='sofa'){shadowUnder(q,d,70);const M=leatherM(q);
    for(const u of [.04,.96])brassLeg(q,u,d-8);
    box(q,.02,.98,.42,1,d+6,d+14,M);box(q,.02,.98,.12,.4,d-13,d+13,M);
    for(const [a,b] of [[.08,.5],[.5,.92]]){box(q,a,b-.005,.4,.52,d-13,d+8,M);box(q,a+.01,b-.015,.52,.97,d+2,d+8,M);
      // the back cushions buttoned in a diamond
      for(let i=0;i<3;i++)for(let j=0;j<2;j++){const u=lerp(a+.04,b-.05,(i+(j%2)*.5)/2.5),v=.62+j*.18,s0=q(u,v,d+2);ctx.fillStyle=rgba('#000000',.6);ctx.beginPath();ctx.arc(s0.x,s0.y,.9,0,TAU);ctx.fill();ctx.fillStyle=rgba('#ffd9a8',.18);ctx.beginPath();ctx.arc(s0.x-.3,s0.y-.4,.4,0,TAU);ctx.fill();}}
    for(const u of [0,.93])box(q,u,u+.07,.1,.7,d-14,d+13,M);
    segL(q(.02,.4,d-13),q(.98,.4,d-13),1.2,GOLD);segL(q(.02,.4,d-13.4),q(.98,.4,d-13.4),.4,GL);
    segL(q(0,.7,d-14),q(.07,.7,d-14),1.1,GOLD);segL(q(.93,.7,d-14),q(1,.7,d-14),1.1,GOLD);}
  else if(t==='lounger'){shadowUnder(q,d,34);const M=velvetM(q,'#86601e',6);
    for(const u of [.1,.9])brassLeg(q,u,d-8);
    box(q,.13,.87,.4,1,d+7,d+14,M);
    // the back channelled in tall flutes
    for(let k=1;k<6;k++){const u=lerp(.13,.87,k/6);segL(q(u,.44,d+7),q(u,.98,d+7),.8,rgba('#000000',.35));segL(q(u+.006,.44,d+7),q(u+.006,.98,d+7),.4,rgba('#ffe8b0',.15));}
    box(q,.12,.88,.14,.46,d-12,d+10,M);
    for(const u of [0,.82])box(q,u,u+.18,.12,.68,d-14,d+13,M);
    segL(q(.14,.17,d-12),q(.86,.17,d-12),1.1,GOLD);segL(q(.02,.68,d-14),q(.16,.68,d-14),1.2,GL);segL(q(.84,.68,d-14),q(.98,.68,d-14),1.2,GL);}
  else if(t==='pouf'){const p=Pp.pts,a=propAng(Pp),t0=q(.5,1,d),rx=Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y)/2+1;shadowUnder(q,d,24);
    const V=patC(LT().velvet(8,128,128,{base:'#201c22'}),t0.x,t0.y,.25);
    face([q(0,0,d),q(1,0,d),q(1,1,d),q(0,1,d)],V,lin(ctx,q(0,0,d).x,0,q(1,0,d).x,0,[[0,rgba('#000000',.55)],[.4,rgba('#000000',.1)],[1,rgba('#000000',.6)]]));
    face([q(.02,.12,d),q(.98,.12,d),q(.98,.2,d),q(.02,.2,d)],lin(ctx,0,q(0,.2,d).y,0,q(0,.12,d).y,[[0,GL],[1,GD]]));
    ctx.fillStyle=V;ctx.beginPath();ctx.ellipse(t0.x,t0.y,rx,6.4,a,0,TAU);ctx.fill();ctx.fillStyle=rad(ctx,t0.x-2,t0.y-1.5,1,rx,[[0,rgba('#ffe8c8',.16)],[1,rgba('#000000',.25)]]);ctx.fill();
    ctx.strokeStyle=GOLD;ctx.lineWidth=.9;ctx.stroke();ctx.fillStyle=GL;ctx.beginPath();ctx.arc(t0.x,t0.y-.4,1.4,0,TAU);ctx.fill();
    ctx.strokeStyle=rgba('#000000',.4);ctx.lineWidth=.6;ctx.beginPath();for(let k=0;k<6;k++){const aa=k/6*TAU;ctx.moveTo(t0.x,t0.y-.4);ctx.lineTo(t0.x+Math.cos(aa)*rx*.8,t0.y+Math.sin(aa)*5);}ctx.stroke();}
  else if(t==='sidetable'){const p=Pp.pts,a=propAng(Pp),t0=q(.5,1,d),rx=Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y)/2+1;shadowUnder(q,d,20);
    segL(q(.5,0,d+6),q(.5,1,d+6),2,GD);for(const [u0,u1] of [[.1,.06],[.9,.94]]){const A=q(u0,0,d-5),B=q(u1,1,d-5);ctx.strokeStyle=lin(ctx,A.x-1.4,0,A.x+1.4,0,[[0,GD],[.5,GL],[1,GD]]);ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.stroke();}
    ctx.strokeStyle=GD;ctx.lineWidth=1.2;ctx.beginPath();const s0=q(.5,.24,d);ctx.ellipse(s0.x,s0.y,rx*.8,3.6,a,0,TAU);ctx.stroke();
    ctx.fillStyle='#050406';ctx.beginPath();ctx.ellipse(t0.x,t0.y+2.4,rx,6.6,a,0,TAU);ctx.fill();
    ctx.fillStyle=patC(NERO(),t0.x,t0.y,.18);ctx.beginPath();ctx.ellipse(t0.x,t0.y,rx,6.4,a,0,TAU);ctx.fill();
    ctx.fillStyle=rad(ctx,t0.x-rx*.3,t0.y-2,1,rx,[[0,rgba('#fff0d8',.14)],[1,rgba('#000000',.2)]]);ctx.fill();ctx.strokeStyle=GOLD;ctx.lineWidth=1.1;ctx.stroke();}
  else if(t==='planter'){const p=Pp.pts,c0={x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2},pt=p[4],ang=Math.atan2(pt.y-c0.y,pt.x-c0.x),fr=d-4,rx=Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y)/2+1,o=P(c0.x,c0.y,d);shadowUnder(q,d,22);
    // a strelitzia: tall stems, broad paddle leaves split by the years, lit along their edges
    for(let i=0;i<9;i++){const k=i-4,a=ang+k*.16+Math.sin(S.t*1.1+i+Pp.dep)*.01,l=44+((i*7)%5)*9+(4-Math.abs(k))*4,ex=o.x+Math.cos(a)*l,ey=o.y+Math.sin(a)*l,sx=o.x+Math.cos(a)*l*.45,sy=o.y+Math.sin(a)*l*.45;
      ctx.strokeStyle='#14281e';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(o.x,o.y);ctx.lineTo(sx,sy);ctx.stroke();
      const lw=5.5+((i*3)%3),la=a+(k<0?-.08:.08);ctx.save();ctx.translate((sx+ex)/2,(sy+ey)/2);ctx.rotate(la);const ll=Math.hypot(ex-sx,ey-sy)/2+3;
      ctx.fillStyle=lin(ctx,0,-lw,0,lw,[[0,'#2e5a3c'],[.5,'#1a3a28'],[1,'#0e2418']]);ctx.beginPath();ctx.ellipse(0,0,ll,lw,0,0,TAU);ctx.fill();
      ctx.strokeStyle=rgba('#0a1a10',.8);ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(-ll,0);ctx.lineTo(ll,0);for(let s2=-.7;s2<.8;s2+=.35){ctx.moveTo(ll*s2,0);ctx.lineTo(ll*s2+3,-lw*.9);}ctx.stroke();
      ctx.strokeStyle=rgba('#cfe8a8',.25);ctx.lineWidth=.6;ctx.beginPath();ctx.ellipse(0,0,ll,lw,0,Math.PI*1.05,Math.PI*1.7);ctx.stroke();ctx.restore();}
    // the pot: Portoro, tapering, banded in brass
    const N=patC(NERO(),o.x,o.y,.2);face([q(.03,1,fr),q(.97,1,fr),q(.86,0,fr),q(.14,0,fr)],N,lin(ctx,q(.03,1,fr).x,0,q(.97,1,fr).x,0,[[0,rgba('#000000',.5)],[.35,rgba('#ffffff',.04)],[.6,rgba('#000000',.1)],[1,rgba('#000000',.6)]]));
    face([q(.04,.9,fr),q(.96,.9,fr),q(.96,.97,fr),q(.04,.97,fr)],lin(ctx,0,q(0,.97,fr).y,0,q(0,.9,fr).y,[[0,GL],[1,GD]]));face([q(.15,.04,fr),q(.85,.04,fr),q(.86,0,fr),q(.14,0,fr)],GD);
    const tp=q(.5,1,fr);ctx.fillStyle='#0e0a08';ctx.beginPath();ctx.ellipse(tp.x,tp.y,rx-1,3.4,propAng(Pp),0,TAU);ctx.fill();}
  else if(t==='plinth'){shadowUnder(q,d,20);const W2=patC(EnvTex.marble(4,256,256),q(0,1,d).x,q(0,1,d).y,.2);
    box(q,.04,.96,.05,.94,d-9,d+9,{front:W2,top:W2,side:W2,sideK:.45,frontHi:.04,frontLo:.32});
    box(q,0,1,0,.06,d-11,d+11,{front:GD,top:GOLD,side:GDD,sideK:.2,frontHi:.15,frontLo:.2});box(q,-.02,1.02,.94,1,d-11,d+11,{front:GOLD,top:GL,side:GD,sideK:.2,frontHi:.2,frontLo:.15});
    ctx.save();ctx.globalCompositeOperation='lighter';const a=q(.5,.9,d-9);ctx.fillStyle=rad(ctx,a.x,a.y,1,26,[[0,rgba('#ffe8c0',.14)],[1,rgba('#ffe8c0',0)]]);ctx.fillRect(a.x-26,a.y-26,52,60);ctx.restore();}
  ctx.restore();return true;}
// ---------- the coffee table: a slab of glass in a brass frame, a shelf of smoked glass ----------
function table(){const T=S.table;if(!T||!T.on||T.state==='broken'||S.room!=='lobby')return false;
  const Q=T.pts,fr=T.dep-TD,bk=T.dep+TD,q=(u,v,d)=>P(lerp(lerp(Q[3].x,Q[2].x,u),lerp(Q[0].x,Q[1].x,u),v),lerp(lerp(Q[3].y,Q[2].y,u),lerp(Q[0].y,Q[1].y,u),v),d);
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  {const a=q(.5,0,T.dep);ctx.fillStyle=rad(ctx,a.x,a.y,0,60,[[0,'rgba(0,0,0,.4)'],[1,'rgba(0,0,0,0)']]);ctx.save();ctx.translate(a.x,a.y);ctx.scale(1,.25);ctx.beginPath();ctx.arc(0,0,60,0,TAU);ctx.fill();ctx.restore();}
  for(const u of [.06,.94])segL(q(u,.96,bk-4),q(u,0,bk-4),2.4,GD);
  face([q(.02,.24,fr+4),q(.98,.24,fr+4),q(.98,.24,bk-4),q(.02,.24,bk-4)],'rgba(20,16,12,.8)');segL(q(.02,.24,fr+4),q(.98,.24,fr+4),1.3,GOLD);
  for(const u of [.06,.94]){const A=q(u,.96,fr+4),B=q(u,0,fr+4);ctx.strokeStyle=lin(ctx,A.x-1.5,0,A.x+1.5,0,[[0,GD],[.5,GL],[1,GD]]);ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.stroke();}
  face([q(0,1,fr),q(1,1,fr),q(1,1,bk),q(0,1,bk)],'rgba(150,200,190,.18)');
  face([q(0,1,fr),q(1,1,fr),q(1,.9,fr),q(0,.9,fr)],lin(ctx,0,q(0,1,fr).y,0,q(0,.9,fr).y,[[0,'rgba(170,230,215,.85)'],[1,'rgba(60,110,100,.8)']]));segL(q(0,1,fr),q(1,1,fr),1,'rgba(240,255,250,.9)');
  ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=1;ctx.beginPath();{const a=q(.14,1,fr+8),b=q(.3,1,bk-8),c3=q(.34,1,fr+8),d3=q(.5,1,bk-8);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.moveTo(c3.x,c3.y);ctx.lineTo(d3.x,d3.y);}ctx.stroke();
  segL(q(0,1,bk),q(1,1,bk),1,rgba(GOLD,.6));
  ctx.restore();return true;}
// ---------- the ring lamp: a band of brass round a ring of frosted glass, lit warm, on three wires ----------
function lamp(L){if(L.kind!=='ring')return false;const p=L.p,a=P(L.x,L.ay,L.dep),q=P(p.x,p.y,L.dep),k=lampGlow(L),ang=L.fallen?(L.landed?1.2:S.t*6):-Math.atan2(p.x-L.x,p.y-L.ay);
  if(!L.fallen){ctx.strokeStyle='#08070a';ctx.lineWidth=.9;ctx.beginPath();for(const s2 of [-1,0,1]){ctx.moveTo(a.x+s2*1.5,a.y);ctx.lineTo(q.x+s2*17,q.y-1.5+Math.abs(s2)*1.6);}ctx.stroke();}
  ctx.save();ctx.translate(q.x,q.y);ctx.rotate(ang);
  if(k>0){const G=glowSprites();ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.15*k;ctx.drawImage(G.cone,-52,4,104,118);ctx.globalAlpha=.5*k;ctx.drawImage(G.dot,-40,-24,80,52);ctx.restore();}
  ctx.lineWidth=4;ctx.strokeStyle=lin(ctx,-22,0,22,0,[[0,GDD],[.3,GOLD],[.55,GL],[.8,GOLD],[1,GDD]]);ctx.beginPath();ctx.ellipse(0,0,21,6,0,Math.PI,TAU);ctx.stroke();
  ctx.lineWidth=2.6;ctx.strokeStyle=L.lit?'#fff2d4':'#2a2830';ctx.beginPath();ctx.ellipse(0,2,20,5.6,0,0,Math.PI);ctx.stroke();
  ctx.lineWidth=1.2;ctx.strokeStyle=GOLD;ctx.beginPath();ctx.ellipse(0,3.6,20.6,6,0,.05,Math.PI-.05);ctx.stroke();
  if(L.lit){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=rgba('#ffd090',.35);ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(0,2,20,5.6,0,0,Math.PI);ctx.stroke();ctx.restore();}
  ctx.restore();return true;}
// ---------- the frosted partitions: Portoro below, frosted glass etched with a fan above, in brass ----------
function div(it){const w=it.dv;if(w.mat!=='frost'||w.state==='broken')return false;const A=it.a,B=it.b,xr=divR(w),xl=divL(w),g=S.arena.ground(w.x,(A+B)/2),h=w.h,yt=g-h,base=g-44;
  ctx.save();EnvProps.divPlane(w,xr,g);ctx.beginPath();ctx.rect(A,yt-4,B-A,h+6);ctx.clip();
  ctx.fillStyle=patC(NERO(),A,base,.18);ctx.fillRect(A,base,B-A,g-base);ctx.fillStyle=lin(ctx,0,base,0,g,[[0,rgba('#000000',.1)],[1,rgba('#000000',.5)]]);ctx.fillRect(A,base,B-A,g-base);
  ctx.fillStyle=lin(ctx,0,base-2,0,base+1,[[0,GL],[1,GD]]);ctx.fillRect(A,base-2,B-A,3);
  ctx.fillStyle=lin(ctx,0,yt,0,base,[[0,'rgba(230,226,214,.5)'],[.5,'rgba(214,208,196,.42)'],[1,'rgba(200,190,176,.5)']]);ctx.fillRect(A,yt,B-A,base-yt);
  // the etching: a fan of fine lines rising from the foot of each light, clear glass between
  for(let d=Math.ceil(w.d0/42)*42;d<w.d1;d+=42){if(d+42<A||d>B)continue;const cx=d+21,cy=base-4;ctx.strokeStyle=rgba('#ffffff',.3);ctx.lineWidth=.5;ctx.beginPath();for(let k=0;k<=8;k++){const aa=Math.PI+k*Math.PI/8;ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(aa)*19,cy+Math.sin(aa)*70);}ctx.stroke();
    ctx.strokeStyle=rgba('#ffffff',.22);for(const rr of [.35,.7]){ctx.beginPath();ctx.ellipse(cx,cy,19*rr,70*rr,0,Math.PI,TAU);ctx.stroke();}}
  ctx.fillStyle=rgba('#ffd9a0',.08);ctx.fillRect(A,yt,B-A,24);
  // the brass: a mullion every light, a rail along the top
  for(let d=Math.ceil(w.d0/42)*42;d<=w.d1;d+=42){if(d<A-2||d>B+2)continue;ctx.fillStyle=lin(ctx,d-1.2,0,d+1.2,0,[[0,GD],[.5,GL],[1,GD]]);ctx.fillRect(d-1.2,yt,2.4,base-yt);}
  ctx.fillStyle=lin(ctx,0,yt-2,0,yt+2,[[0,GL],[1,GD]]);ctx.fillRect(A,yt-2,B-A,4);
  ctx.restore();
  if(it.first||it.last){const d=it.first?A:B;face([divPt(w,xl,g,d),divPt(w,xl,base,d),divPt(w,xr,base,d),divPt(w,xr,g,d)],'#0a090c');face([divPt(w,xl,base,d),divPt(w,xl,yt,d),divPt(w,xl+2.4,yt,d),divPt(w,xl+2.4,base,d)],GOLD);}
  for(const m of w.marks){if(m.d<A||m.d>=B)continue;drawDivMark(w,m);}
  return true;}
// ---------- what stands on the tables: crystal and whisky, white orchids, a glass orb ----------
function ware(it){const k=it.kind;if(it.gone||it.sil||!['decanter','tumbler','orchid','orb'].includes(k))return false;const q=P(it.x,it.y,it.dep);ctx.save();ctx.translate(q.x,q.y);ctx.rotate(it.ang||0);
  if(k==='decanter'){ctx.fillStyle='rgba(190,110,30,.9)';ctx.beginPath();ctx.moveTo(-5,4);ctx.quadraticCurveTo(-6.2,-2,-1.6,-5);ctx.lineTo(-1.2,-9);ctx.lineTo(1.2,-9);ctx.lineTo(1.6,-5);ctx.quadraticCurveTo(6.2,-2,5,4);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,236,190,.55)';ctx.fillRect(-3.6,-2.4,1,5.4);ctx.fillRect(2.2,-1,.6,4);ctx.strokeStyle='rgba(255,246,220,.5)';ctx.lineWidth=.4;ctx.stroke();ctx.fillStyle='rgba(230,240,245,.75)';ctx.beginPath();ctx.moveTo(-2,-9);ctx.lineTo(0,-13.4);ctx.lineTo(2,-9);ctx.closePath();ctx.fill();}
  else if(k==='tumbler'){ctx.fillStyle='rgba(220,240,245,.38)';ctx.beginPath();ctx.moveTo(-3.2,-5);ctx.lineTo(3.2,-5);ctx.lineTo(2.7,3.4);ctx.lineTo(-2.7,3.4);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(196,120,36,.85)';ctx.fillRect(-2.8,-1.6,5.6,4.6);ctx.fillStyle='rgba(255,255,255,.5)';ctx.fillRect(-2.6,-4.6,.6,7);ctx.fillRect(-3.2,-5,6.4,.5);}
  else if(k==='orchid'){ctx.fillStyle=lin(ctx,-5,0,5,0,[[0,'#050406'],[.5,'#2a2830'],[1,'#050406']]);ctx.beginPath();ctx.moveTo(-4.4,4);ctx.lineTo(-5,-1);ctx.lineTo(5,-1);ctx.lineTo(4.4,4);ctx.closePath();ctx.fill();ctx.fillStyle=GOLD;ctx.fillRect(-5,-1.6,10,1);
    ctx.strokeStyle='#2e4a28';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(0,-1);ctx.quadraticCurveTo(-1,-9,-6,-12);ctx.moveTo(0,-1);ctx.quadraticCurveTo(2,-9,5,-14);ctx.stroke();
    ctx.fillStyle='#1e3a20';ctx.beginPath();ctx.ellipse(-3,-1.6,3.4,1.2,-.3,0,TAU);ctx.ellipse(3,-1.8,3.2,1.1,.3,0,TAU);ctx.fill();
    for(const [x,y] of [[-6,-12],[-3,-9],[5,-14],[3,-10.4],[0,-12.4]]){ctx.fillStyle='#f6f4f0';for(let j=0;j<5;j++){const aa=j/5*TAU;ctx.beginPath();ctx.ellipse(x+Math.cos(aa)*1.2,y+Math.sin(aa)*1.1,1.2,.8,aa,0,TAU);ctx.fill();}ctx.fillStyle='#d080a8';ctx.fillRect(x-.4,y-.3,.8,.8);}}
  else{ctx.fillStyle=lin(ctx,-4,0,4,0,[[0,GD],[.5,GL],[1,GD]]);ctx.fillRect(-3.4,3.4,6.8,1.8);ctx.beginPath();ctx.ellipse(0,3.2,4,1.2,0,0,TAU);ctx.fill();
    ctx.fillStyle=rad(ctx,1.4,0,.5,6,[[0,'rgba(240,250,255,.25)'],[.7,'rgba(160,200,220,.22)'],[1,'rgba(220,240,255,.5)']]);ctx.beginPath();ctx.arc(0,-1.2,5.6,0,TAU);ctx.fill();ctx.strokeStyle='rgba(235,248,255,.75)';ctx.lineWidth=.6;ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.85)';ctx.beginPath();ctx.arc(-2,-3.4,1.1,0,TAU);ctx.fill();ctx.fillStyle=rgba(GOLD,.5);ctx.beginPath();ctx.ellipse(.5,2.6,3,.7,0,0,TAU);ctx.fill();}
  ctx.restore();return true;}
E.S.lobby={paint,live,light,prop,table,lamp,div,ware};
})();
// ===== ENV LOBBY END =====
