// ===== ENV GONDOLA =====
// Outside the top of Hallowell Tower, two floors under the office (since V106): the window cleaners' cradle hanging on its two wire
// ropes against the tower's glass, the city a long way down. The tower's face is a curtain wall of dark glass in bronze mullions, a
// floor every GF.floor up it with its spandrel between, the offices behind the glass dark but for a lamp left on here and there, the
// city's light lying on the glass in long slants; at the face's corner the night opens: the river and the old town far below, the
// towers across it, the sky. The cradle is an aluminium deck with a toe board and a rail round it, a stirrup at each end with its hoist
// and work lamp, each hoist's rope going up out of the picture to the davits on the roof. What happens to it is the game's (S.gondola,
// sk_gondola.js): how it bucks when they land on it (dy), the left rope parting (snap) and the cradle swinging down on the right one
// until it hangs from it (tilt: everything of it turned about the right hanger, gondXf), the face going down past him as he climbs
// (wy), the office's pane he went out through (S.story.flags.officePane).
(()=>{const E=EnvLook,{C,pp,poly,line,lin,rad,rgba,mix,glow,rng,lerp,clamp,TAU}=E;
const q=pp;
const G0=typeof GOND!=='undefined'?GOND:{x0:150,x1:760,d0:10,d1:176,stir:120,rd:93,face:200,corner:826,floor:330};
const FACE=G0.face,CORNER=G0.corner,FL=G0.floor,BAY=108,BAY0=604,SILL=26,HEAD=253;
const st=()=>typeof S!=='undefined'&&S.gondola||null;
const WY=()=>{const s=st();return s?s.wy||0:0;};
const XF=(x,y)=>typeof gondXf==='function'?gondXf(x,y):{x,y};
// a floor's line on the face (k: 0 the cradle's own floor, 2 the office's), the climb's scroll in it
const floorY=k=>GB+64-k*FL+WY();
// the bay the right rope runs up past (the office's pane is in it, two floors up)
const ROPE_BAY=Math.floor((G0.x1+G0.rd*PSX-FACE*PSX-BAY0)/BAY);
// the house's lit rooms: which bays and floors have a lamp left on (fixed by their place)
const hash=(a,b)=>{const s=Math.sin(a*127.1+b*311.7)*43758.5453;return s-Math.floor(s);};

// ---------- the still layer: only the dark (the face and the cradle are drawn as they move) ----------
function paint(c){c.fillStyle='#05060a';c.fillRect(-300,-1400,W+700,GB+2200);}

// ---------- the night past the corner ----------
// the sky going up from the city's glow, the towers across the river, the river and the lamps along it far down, the old town
function night(c,vx1,t){const x0=q(CORNER,0,FACE).x;if(x0>vx1)return;const top=-1400,foot=GB+1200,hz=GB+260+WY()*.15;
  c.fillStyle=lin(c,0,top,0,foot,[[0,'#04050c'],[.42,'#0b0f22'],[.62,'#1c1c30'],[.7,'#2a2232'],[.78,'#0c0c14'],[1,'#05060a']]);c.fillRect(x0,top,vx1-x0+400,foot-top);
  // the sky's haze in long streaks, the city's glow caught in it low down, and the stars over it (not one smooth sweep: lit by the
  // work lamps' glare it read as a flat patch)
  {const r=rng(8807),w=vx1-x0+400;for(let i=0;i<560;i++){const y=lerp(hz-1100,hz-10,Math.pow(r(),.85)),x=x0+r()*w,L=40+r()*320,hh=2+r()*7;
      c.fillStyle=r()<.55?rgba('#8a7aa0',.03+.07*r()):rgba('#020308',.06+.12*r());c.fillRect(x,y,L,hh);}
    for(let i=0;i<160;i++){const x=x0+r()*w,y=lerp(top+200,hz-200,r());c.fillStyle=rgba('#dfe8ff',.25+.5*r());c.fillRect(x,y,1.5,1.5);}}
  // the towers across the river, their windows
  const r=rng(8801);for(let i=0;i<14;i++){const x=x0+20+r()*(vx1-x0+300),w=18+r()*34,h=60+r()*200,y=hz-h;c.fillStyle=mix('#0a0c16','#161826',r());c.fillRect(x,y,w,h+200);
    for(let j=0;j<10;j++){const wx=x+3+r()*(w-6),wy=y+6+r()*(h-10);if(r()<.6){c.fillStyle=rgba(r()<.7?'#ffcf8a':'#bfe0ff',.35+.4*r());c.fillRect(wx,wy,2,2.6);}}
    if(r()<.4){const bx=x+w/2,by=y-8,f=.6+.4*Math.sin(t*2+i);glow(c,bx,by,9,'#ff4a3a',.6*f);c.fillStyle='#ff6a5a';c.fillRect(bx-1,by-1,2,2);}}
  // the river and the lamps along it, a long way down
  {const ry=hz+120;c.fillStyle=lin(c,0,ry-10,0,ry+40,[[0,'#0c1220'],[1,'#060a12']]);c.fillRect(x0,ry-10,vx1-x0+400,50);
    for(let i=0;i<40;i++){const x=x0+(i*37.3)%(vx1-x0+300),y=ry-12+(i%3)*2;c.fillStyle=rgba('#ffc070',.7);c.fillRect(x,y,1.6,1.6);c.fillStyle=rgba('#ffc070',.18);c.fillRect(x-.5,y+4,2.6,10);}}
  // the face's own corner: its edge lit by the city, the return face going away
  {const a=q(CORNER,top,FACE),b=q(CORNER,foot,FACE);c.fillStyle=lin(c,a.x,0,a.x+14,0,[[0,'#1a1e2c'],[1,'#0a0c14']]);c.fillRect(a.x,top,14,foot-top);
    line(c,[{x:a.x+.8,y:top},{x:b.x+.8,y:foot}],rgba('#9ab0d8',.35),1.5);}}

// ---------- the city in the glass ----------
// The curtain wall gives back the city it looks out on: from this high the horizon is at his eye, the sky dark over it with the city's
// glow along it, and under it the city laid out flat, a carpet of lights thickest toward the horizon, the avenues running into it in
// lines of light, a few towers' tops standing up into the glow. Made once (REFL.W by REFL.H world units, the horizon at REFL.hz down
// it), never repeated: one picture laid over the whole face, the spandrels and mullions drawn over it.
const REFL={W:1700,H:1100,hz:.42,cv:null};
function reflPic(){if(REFL.cv)return REFL.cv;const k=.6,w=Math.round(REFL.W*k),h=Math.round(REFL.H*k),cv=document.createElement('canvas');cv.width=w;cv.height=h;
  const c=cv.getContext('2d'),r=rng(4317),hz=h*REFL.hz;
  // the sky: dark, the city's glow low along the horizon
  {const g=c.createLinearGradient(0,0,0,hz);g.addColorStop(0,'rgba(40,50,90,0)');g.addColorStop(.7,'rgba(70,64,120,.18)');g.addColorStop(1,'rgba(150,110,150,.42)');c.fillStyle=g;c.fillRect(0,0,w,hz);}
  // haze lying along the horizon in long streaks, lighter and darker, so the glow is not one smooth sweep
  for(let i=0;i<260;i++){const y=hz-4-Math.pow(r(),1.6)*hz*.55,x=r()*w,L=30+r()*260,hh=1.5+r()*4;c.fillStyle=r()<.6?`rgba(200,160,190,${.04+.08*r()})`:`rgba(10,10,30,${.05+.1*r()})`;c.fillRect(x-L/2,y,L,hh);}
  // the city: its haze, then its lights
  {const g=c.createLinearGradient(0,hz,0,h);g.addColorStop(0,'rgba(190,140,120,.4)');g.addColorStop(.25,'rgba(90,80,110,.2)');g.addColorStop(1,'rgba(30,40,70,.12)');c.fillStyle=g;c.fillRect(0,hz,w,h-hz);}
  // the avenues: lines of light running into the horizon toward a point far off
  const vx=w*.58;for(let i=0;i<9;i++){const x1=(r()*1.6-.3)*w,n=90;for(let j=0;j<n;j++){const u=Math.pow(j/n,1.6),x=lerp(vx,x1,u),y=lerp(hz+1,h,u);
      c.fillStyle=r()<.7?'rgba(255,196,120,.75)':'rgba(230,240,255,.6)';const sz=.6+u*1.6;c.fillRect(x+(r()-.5)*2,y,sz,sz*.8);}}
  // the carpet of lights, thick toward the horizon
  for(let i=0;i<5200;i++){const u=Math.pow(r(),2.2),y=hz+2+u*(h-hz),x=r()*w,sz=.5+u*1.8,v=r();
    c.fillStyle=v<.55?`rgba(255,200,130,${.35+.5*r()})`:v<.85?`rgba(220,232,255,${.3+.45*r()})`:`rgba(120,230,240,${.3+.4*r()})`;c.fillRect(x,y,sz,sz*.8);}
  // towers' tops standing up into the glow, their windows
  for(let i=0;i<16;i++){const x=r()*w,tw=8+r()*22,th=10+r()*44,y=hz+6-th*(.3+r()*.7);c.fillStyle='rgba(18,22,40,.85)';c.fillRect(x,y,tw,hz+30-y);
    for(let j=0;j<12;j++){if(r()<.5)continue;c.fillStyle=r()<.7?'rgba(255,205,140,.8)':'rgba(200,225,255,.7)';c.fillRect(x+2+r()*(tw-4),y+3+r()*(hz+20-y),1.2,1.4);}
    if(r()<.4){c.fillStyle='rgba(255,80,70,.9)';c.fillRect(x+tw/2-1,y-2,2,2);}}
  return REFL.cv=cv;}

// ---------- the tower's face ----------
// the glass (dark, the city's light lying on it in slants), the lit rooms behind it, the mullions and the spandrels, the office's
// broken pane two floors up
function face(c,vx0,vx1,t){const ox=FACE*PSX,oy=FACE*PSY,xR=CORNER+ox,xL=vx0-20,top=-1400,foot=GB+1200;
  c.save();c.beginPath();c.rect(xL,top,xR-xL,foot-top);c.clip();
  c.fillStyle=lin(c,0,top,0,foot,[[0,'#0c111e'],[.5,'#111828'],[1,'#0c101a']]);c.fillRect(xL,top,xR-xL,foot-top);
  // the city in it (its horizon at his eye, a little above the deck; it goes down past him as he climbs, slower than the face)
  {const R=reflPic(),hy=GB-250+WY()*.3,x0=-350+ox;c.globalAlpha=.8;c.drawImage(R,x0,hy-REFL.H*REFL.hz,REFL.W,REFL.H);c.globalAlpha=1;}
  // the floors in view: the lit rooms behind the glass, the spandrel over each floor's head, the transom at its sill
  const k0=Math.floor((GB+64+WY()-foot-oy)/FL),k1=Math.ceil((GB+64+WY()-top-oy)/FL);
  const b0=Math.floor((xL-ox-BAY0)/BAY)-1,b1=Math.ceil((xR-ox-BAY0)/BAY);
  for(let k=k0;k<=k1;k++){const fy=floorY(k)-oy,sy=fy-SILL,hy=fy-HEAD;
    for(let b=b0;b<=b1;b++){const x=BAY0+b*BAY+ox;if(x>xR||x+BAY<xL)continue;const rope=b===ROPE_BAY&&k>=0&&k<=1,lit=rope||hash(b,k)>.74,warm=rope||hash(b+.5,k)>.3,lk=rope?1.35:1;
      if(lit){const col=warm?'#ffc880':'#cfe6ff',x1=x+BAY;
        // the room: its far wall lit, darker under the ceiling and down at the floor, the light strip in its ceiling
        c.fillStyle=lin(c,0,hy,0,sy,[[0,rgba(col,.08*lk)],[.22,rgba(col,.2*lk)],[.75,rgba(col,.28*lk)],[1,rgba(col,.12*lk)]]);c.fillRect(x+3,hy,BAY-6,sy-hy);
        c.fillStyle=rgba('#fff4e0',.5);c.fillRect(x+12,hy+9,BAY-24,2);
        // its wall's panels, and a picture on it in some
        c.fillStyle=rgba('#000000',.28);for(let px=x+12;px<x1-4;px+=18)c.fillRect(px,hy,2.5,sy-hy);c.fillStyle=rgba('#000000',.12);c.fillRect(x+3,sy-64,BAY-6,2.5);
        if(hash(b,k+.15)>.45){const fx=x+18+hash(b,k+.25)*(BAY-56),fy2=hy+46;c.fillStyle=rgba('#000000',.32);c.fillRect(fx,fy2,28,20);c.fillStyle=rgba(col,.32);c.fillRect(fx+3,fy2+3,22,14);}
        // the blind half down in some
        if(!rope&&hash(b,k+.9)>.62){const bl=hy+(sy-hy)*(.18+.4*hash(b+.2,k));c.fillStyle=rgba('#262220',.6);c.fillRect(x+3,hy,BAY-6,bl-hy);c.fillStyle=rgba('#000000',.28);for(let yy=hy+5;yy<bl;yy+=6)c.fillRect(x+3,yy,BAY-6,1.5);}
        // a desk with its lamp lit, the back of a chair, a cabinet in the dark at the side
        const lx=x+26+hash(b,k+.3)*(BAY-56),fl=sy+8;c.save();c.beginPath();c.rect(x,hy,BAY,sy-hy);c.clip();glow(c,lx,fl-60,34,col,.5);c.fillStyle='#0b0b10';
        c.fillRect(lx-24,fl-44,46,5);c.fillRect(lx-21,fl-39,3,39);c.fillRect(lx+17,fl-39,3,39);c.fillRect(lx-3,fl-62,2,18);
        c.fillStyle=rgba(col,.95);c.beginPath();c.moveTo(lx-8,fl-62);c.lineTo(lx+5,fl-62);c.lineTo(lx+1,fl-70);c.lineTo(lx-4,fl-70);c.closePath();c.fill();
        c.fillStyle='#0b0b10';c.fillRect(lx+24,fl-58,12,26);c.fillRect(lx+27,fl-32,3,32);
        if(hash(b,k+.4)>.5){const cx=hash(b,k+.6)>.5?x+6:x1-26;c.fillStyle=rgba('#0b0b10',.85);c.fillRect(cx,fl-88,20,88);}c.restore();}
      else if(hash(b,k+.7)>.6){c.fillStyle=rgba('#1a2234',.4);c.fillRect(x,hy,BAY,sy-hy);}}
    // the spandrel (bronze panel over the head, under the next floor's sill) and the sill's transom
    c.fillStyle=rgba('#0b0d14',.62);c.fillRect(xL,fy-FL-SILL,xR-xL,FL-HEAD+SILL);c.fillStyle=rgba('#c8a060',.18);c.fillRect(xL,hy-1.5,xR-xL,1.5);c.fillStyle=rgba('#000000',.4);c.fillRect(xL,fy-FL-SILL,xR-xL,3);
    c.fillStyle='#1a140e';c.fillRect(xL,sy,xR-xL,4);c.fillStyle=rgba('#d8b070',.22);c.fillRect(xL,sy,xR-xL,1.2);}
  // the street's light coming up the face from far below
  {const y0=GB+40+WY(),g=lin(c,0,y0,0,y0+700,[[0,rgba('#ff9a60',0)],[1,rgba('#ff9a60',.16)]]);c.fillStyle=g;c.fillRect(xL,y0,xR-xL,700);}
  // the city's light on the glass: long slants, brighter toward the corner
  c.save();c.globalCompositeOperation='lighter';for(let i=0;i<5;i++){const x=xR-60-i*190+((WY()*.1)%40),w=40+i*12;c.fillStyle=lin(c,x,0,x+w,0,[[0,rgba('#8ab0e8',0)],[.5,rgba('#8ab0e8',.05-i*.007)],[1,rgba('#8ab0e8',0)]]);
    c.beginPath();c.moveTo(x,top);c.lineTo(x+w,top);c.lineTo(x+w-500,foot);c.lineTo(x-500,foot);c.closePath();c.fill();}c.restore();
  // the mullions, bronze, catching the city's light on their corner side
  for(let b=b0;b<=b1+1;b++){const x=BAY0+b*BAY+ox;if(x<xL-6||x>xR+6)continue;c.fillStyle='#16110c';c.fillRect(x-3,top,6,foot-top);c.fillStyle=rgba('#d8b070',.24);c.fillRect(x+1.5,top,1.5,foot-top);}
  // the office's pane, two floors up, gone: the room's gold through it, the jagged glass left in its frame
  const P=typeof S!=='undefined'&&S.story&&S.story.flags&&S.story.flags.officePane;
  if(P){const fy=floorY(2)-oy,x=BAY0+Math.floor((G0.x1-BAY0)/BAY)*BAY+ox,sy=fy-SILL,hy=fy-HEAD;c.fillStyle=lin(c,0,hy,0,sy,[[0,'#3a2a14'],[.6,'#6a4a20'],[1,'#8a6428']]);c.fillRect(x,hy,BAY,sy-hy);
    glow(c,x+BAY/2,sy-60,90,'#ffd890',.3);c.fillStyle='#0a0e18';const r=rng(77);
    for(const [e0,e1,horiz] of [[x,x+BAY,1],[x,x+BAY,0]]){c.beginPath();if(horiz){c.moveTo(e0,hy);for(let i=0;i<=8;i++)c.lineTo(lerp(e0,e1,i/8),hy+(i%2?6+r()*14:2));c.lineTo(e1,hy);}
      else{c.moveTo(e0,sy);for(let i=0;i<=8;i++)c.lineTo(lerp(e0,e1,i/8),sy-(i%2?4+r()*10:1));c.lineTo(e1,sy);}c.closePath();c.fill();}}
  c.restore();}

// ---------- the cradle ----------
// (everything of it through the game's gondXf: tilted about the right hanger once the left rope has gone)
const Q=(x,y,d)=>{const w=XF(x,y);return q(w.x,w.y,d);};
// (the deck's own height as it hangs level: gondXf, the game's, puts where it has bucked to, swung to and gone down to)
function deckY(){return GB;}
function cradleBack(c,t){const {x0,x1,d0,d1}=G0,y=deckY();
  // the shadow it throws on the glass behind
  if(!(st()&&st().tilt)){c.fillStyle=rgba('#000000',.28);const a=q(x0+20,y+10,FACE),b=q(x1-20,y+10,FACE);c.fillRect(a.x,a.y-30,b.x-a.x,60);}
  // the back rail: posts and two rails, against the glass
  {const d=d1-4,n=8;c.lineCap='round';for(let i=0;i<=n;i++){const x=lerp(x0+8,x1-8,i/n),a=Q(x,y,d),b=Q(x,y-44,d);line(c,[a,b],'#20242c',3);}
    for(const h of [44,24]){const a=Q(x0+6,y-h,d),b=Q(x1-6,y-h,d);line(c,[a,b],'#2a303a',3.2);line(c,[{x:a.x,y:a.y-1.4},{x:b.x,y:b.y-1.4}],rgba('#c8d4e8',.3),1.5);}}
  // the deck: checker plate, its far edge, the toe board along the back
  {const P=[Q(x0,y,d0),Q(x1,y,d0),Q(x1,y,d1),Q(x0,y,d1)];poly(c,P,'#4a525e');
    c.fillStyle=lin(c,0,P[2].y,0,P[0].y,[[0,rgba('#000000',.32)],[1,rgba('#ffffff',.04)]]);poly(c,P);c.fill();
    c.strokeStyle=rgba('#000000',.28);c.lineWidth=1.5;c.beginPath();for(let i=1;i<14;i++){const x=lerp(x0,x1,i/14),a=Q(x,y,d0),b=Q(x,y,d1);c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);}c.stroke();
    {const r=rng(6107);for(let i=0;i<260;i++){const x=lerp(x0+6,x1-6,r()),d=lerp(d0+6,d1-6,r()),p=Q(x,y,d),L=2+r()*9,lt=r()<.55;
        c.fillStyle=lt?rgba('#d8e2f0',.05+.09*r()):rgba('#000000',.08+.14*r());c.fillRect(p.x-L/2,p.y-.8,L,1.6);}
      if(!(st()&&st().tilt))for(let i=0;i<5;i++){const x=lerp(x0+40,x1-40,r()),d=lerp(d0+20,d1-20,r()),p=Q(x,y,d),rx=26+r()*40;c.fillStyle=rgba('#000000',.1);c.beginPath();c.ellipse(p.x,p.y,rx,rx*.3,0,0,TAU);c.fill();}}
    const T=[Q(x0,y-10,d1),Q(x1,y-10,d1),Q(x1,y,d1),Q(x0,y,d1)];poly(c,T,'#262a32');}
  // the stirrups at the ends: two uprights and a top bar each, the hoist on it, the rope up from it; the work lamp
  for(const [x,s] of [[x0,1],[x1,-1]]){const top=y-G0.stir;for(const d of [d0+4,d1-4]){line(c,[Q(x,y,d),Q(x,top,d)],'#2a303a',4);}
    line(c,[Q(x,top,d0+4),Q(x,top,d1-4)],'#30363f',5);
    // the hoist: a grey box on the stirrup's top, its drum
    const h0=Q(x-14,top-4,G0.rd-14),h1=Q(x+14,top-4,G0.rd-14),h2=Q(x+14,top-30,G0.rd-14),h3=Q(x-14,top-30,G0.rd-14);poly(c,[h0,h1,h2,h3],'#3a4250');line(c,[h3,h2],rgba('#d8e2f0',.3),1.5);
    const dm=Q(x,top-17,G0.rd);c.fillStyle='#14161c';c.beginPath();c.arc(dm.x,dm.y,6,0,TAU);c.fill();c.strokeStyle=rgba(C.goldD,.7);c.lineWidth=1.5;c.stroke();
    // the work lamp on the stirrup, turned on the glass
    const lp=Q(x+s*10,top+18,d1-6);c.fillStyle='#16181e';c.fillRect(lp.x-4,lp.y-3,8,6);glow(c,lp.x,lp.y,10,'#e8f4ff',.7);}}
// the work lamps turned on the glass: a pool of cold light on it round each, behind the cradle wherever it hangs, and the light
// caught in the rain running down the glass through it (a picture made once and laid on: a smooth pool read as a flat patch, and the
// rain laid over the whole face cost a phone's canvas some 20 ms a frame)
let POOL=null;
function poolSpr(){if(POOL)return POOL;const n=256,h=n/2,cv=document.createElement('canvas');cv.width=cv.height=n;const c=cv.getContext('2d'),r=rng(6431);
  const g=c.createRadialGradient(h,h,0,h,h,h);g.addColorStop(0,'rgba(207,226,255,.32)');g.addColorStop(.45,'rgba(207,226,255,.15)');g.addColorStop(1,'rgba(207,226,255,0)');c.fillStyle=g;c.fillRect(0,0,n,n);
  c.globalCompositeOperation='source-atop';
  for(let i=0;i<620;i++){const x=r()*n,y=r()*n,L=8+r()*40,w=.7+r()*.9;c.fillStyle=r()<.62?`rgba(240,246,255,${.2+.3*r()})`:`rgba(0,0,12,${.3+.35*r()})`;c.fillRect(x,y,w,L);}
  return POOL=cv;}
function lampPools(c){const {x0,x1}=G0,y=deckY(),P=poolSpr();c.save();c.globalCompositeOperation='lighter';
  const Tr=c.getTransform(),vx0=-Tr.e/Tr.a,vx1=(c.canvas.width-Tr.e)/Tr.a,R=290;
  for(const [x,s] of [[x0,1],[x1,-1]]){const p=Q(x+s*10,y-G0.stir+18,G0.d1-6);if(p.x+R<vx0||p.x-R>vx1)continue;c.drawImage(P,p.x-R,p.y+100-R,2*R,2*R);}c.restore();
  for(const [x,s] of [[x0,1],[x1,-1]]){const p=Q(x+s*10,y-G0.stir+18,G0.d1-6);glow(c,p.x,p.y+20,110,'#e8f4ff',.22);}}
// the ropes: from each hoist's drum straight up out of the picture; the left one, gone, whipping up and away
function ropes(c,t,vy0){const {x0,x1}=G0,y=deckY(),s=st();
  for(const [x,left] of [[x0,true],[x1,false]]){const top=y-G0.stir-17,dm=Q(x,top,G0.rd);
    if(left&&s&&s.snap!=null){const u=t-s.snap,P0=q(x,vy0-400,G0.rd);
      // the end it parted at: up and away, whipping, then gone from the picture
      const yE=lerp(top-60,vy0-600,clamp(u/1.2,0,1)),w=Math.sin(u*22)*40*Math.exp(-u*2.5),e=q(x+w,yE,G0.rd);
      c.strokeStyle='#1a1c22';c.lineWidth=2.4;c.beginPath();c.moveTo(P0.x,P0.y);c.quadraticCurveTo(e.x-w,(P0.y+e.y)/2,e.x,e.y);c.stroke();
      // the stub left on the drum, hanging, frayed
      const sb=Q(x,top+46,G0.rd);c.lineWidth=2;c.beginPath();c.moveTo(dm.x,dm.y);c.quadraticCurveTo(dm.x+8,(dm.y+sb.y)/2,sb.x+4,sb.y);c.stroke();
      if(u<.25){c.save();c.globalCompositeOperation='lighter';glow(c,dm.x,dm.y-30,30,'#fff2d0',.8*(1-u/.25));c.restore();}
      continue;}
    const a=q(x,vy0-400,G0.rd);c.strokeStyle='#14161c';c.lineWidth=2.6;c.beginPath();c.moveTo(dm.x,dm.y);c.lineTo(a.x+(dm.x-q(x,top,G0.rd).x),a.y);c.stroke();
    c.strokeStyle=rgba('#c8d4e8',.22);c.lineWidth=1.5;c.beginPath();c.moveTo(dm.x+1.4,dm.y);c.lineTo(a.x+1.4+(dm.x-q(x,top,G0.rd).x),a.y);c.stroke();}}
// the near side, in front of whoever is on it: the toe board with the house's mark and its rail, the near rail, the stirrups' near
// uprights (frontItem: drawn by depth among the people)
function cradleFront(c){const {x0,x1,d0}=G0,y=deckY(),d=d0;
  {const T=[Q(x0,y,d),Q(x1,y,d),Q(x1,y+12,d),Q(x0,y+12,d)];poly(c,T,'#1e2229');line(c,[T[0],T[1]],rgba('#d8e2f0',.32),1.5);
    // a gilt band along it, and the H on a brass plate at its middle
    line(c,[Q(x0+6,y+6,d),Q(x1-6,y+6,d)],rgba(C.gold,.5),1.5);const m=Q((x0+x1)/2,y+6,d);c.fillStyle=C.goldD;c.fillRect(m.x-7,m.y-5,14,10);c.fillStyle='#1a1408';c.fillRect(m.x-3.5,m.y-3,1.6,6);c.fillRect(m.x+1.9,m.y-3,1.6,6);c.fillRect(m.x-3.5,m.y-.8,7,1.6);}
  // the underside's frame and the fixing eyes, under the deck
  {const a=Q(x0+10,y+12,d+40),b=Q(x1-10,y+12,d+40);line(c,[a,b],'#101216',3);}
  // the near rail: posts and two rails
  {const n=8;for(let i=0;i<=n;i++){const x=lerp(x0+8,x1-8,i/n);line(c,[Q(x,y,d+1),Q(x,y-40,d+1)],'#262b33',3);}
    for(const h of [40,22]){const a=Q(x0+6,y-h,d+1),b=Q(x1-6,y-h,d+1);line(c,[a,b],'#2e343e',3.2);line(c,[{x:a.x,y:a.y-1.4},{x:b.x,y:b.y-1.4}],rgba('#dfe8f6',.32),1.5);}}}
function frontItem(){return{d:G0.d0-.5,draw:c=>cradleFront(c||ctx)};}
// the wind: streaks going by, a few papers up off the street on it
function wind(c,vx0,vx1,vy0,vy1,t){c.save();c.globalCompositeOperation='lighter';const r=rng(911);
  for(let i=0;i<26;i++){const sp=260+r()*240,x=vx1-((t*sp+r()*2000)%(vx1-vx0+400)),y=lerp(vy0,vy1,r()),L=20+r()*50;c.fillStyle=rgba('#b8c8e0',.08+.08*r());c.fillRect(x,y,L,1.2);}
  // the rain going past, slanting in the wind (one path, faint as rain is)
  // (thin upright slivers, not a stroked path: on a phone's canvas the stroke cost some 6 ms a frame)
  {c.fillStyle=rgba('#c8d8f0',.15);const r2=rng(917),W2=vx1-vx0+200,H2=vy1-vy0+200;
    for(let i=0;i<300;i++){const x=vx0-100+((r2()*W2+t*120)%W2),y=vy0-100+((r2()*H2+t*900*(.8+.4*r2()))%H2),L=14+r2()*18;c.fillRect(x,y,1.5,L);}}
  c.restore();}
function live(){const t=S.t,Tr=ctx.getTransform(),vx0=-Tr.e/Tr.a-60,vx1=(ctx.canvas.width-Tr.e)/Tr.a+60,vy0=-Tr.f/Tr.d-60,vy1=(ctx.canvas.height-Tr.f)/Tr.d+60;
  ctx.save();try{night(ctx,vx1,t);face(ctx,vx0,vx1,t);lampPools(ctx);ropes(ctx,t,vy0);cradleBack(ctx,t);wind(ctx,vx0,vx1,vy0,vy1,t);}finally{ctx.restore();}}
// the light that rims a fighter: the city's, from past the corner, cool
function light(f){return{light:{x:CORNER+300,y:GB-120},col:'#bcd4ff'};}
E.S.gondola={paint,live,light,frontItem,ground:.36,set:null,LAYOUT:{FACE,CORNER,FL,BAY,BAY0,SILL,HEAD}};
})();
// ===== ENV GONDOLA END =====
