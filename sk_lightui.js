// ===== LIGHT: UI =====
// The light in the scenes, and what the fights do to it (V38). Each fighter is drawn once a frame into a canvas of his own, as big
// as he is on the screen, and that picture is used three times: set down where he stands; laid on the floor as the shadow each lamp
// near him throws, sheared away from the lamp, darkest at his feet and fading toward his head; and on a wet or polished floor turned
// over under him as his reflection, rippling on the street. The game's own flashes, sparks, bolts, muzzle flashes, blasts and fires are
// lights as well: each throws a pool on the floor (and a streak down a wet one) and lights the fighters near it in its own colour,
// and a man struck goes white for an instant. The impacts are drawn as light (a hot core, a glow, rays and a streak on the big ones),
// the sparks as glowing streaks, the dust as soft puffs. Each ground has its air: rain lit by the street lamps and splashing on the
// flags, a low mist, dust turning in the lamplight of the rooms, steam off the kitchen range, fireflies in the fields, embers off the
// torches, braziers and fires. A vignette over the stage (in the page's own style, so the canvas never pays for it) holds the eye in the
// middle.
// Only drawing: nothing here touches the game's records or its dice (what looks random comes from a hash of each mote's number), and
// with the effects off the picture is the old one exactly. Effects: Full, Lite (no sprites, so no cast shadows, reflections or light
// on the fighters; less air) or Off, in the menu. A device that cannot keep up is moved down to Lite on its own.
const FXL=(()=>{
const Q={q:'full',user:false,auto:false,samples:[]};
try{const v=localStorage.getItem('sk_fx');if(v==='full'||v==='lite'||v==='off'){Q.q=v;Q.user=true;}}catch(e){}
// a real canvas (the headless checks have no Path2D or DOMMatrix, and keep the old drawing)
const real=()=>typeof SCENE_OK!=='undefined'&&SCENE_OK;
const on=()=>real()&&Q.q!=='off',full=()=>real()&&Q.q==='full';
const hs=n=>{n=(n|0)^0x5bd1e995;n=Math.imul(n^(n>>>15),0x2c1b3c6d);n=Math.imul(n^(n>>>12),0x297a2d39);n^=n>>>15;return(n>>>0)/4294967296;};
const RGB=new Map();
function rgbOf(c){let v=RGB.get(c);if(v)return v;v=[255,255,255];
  if(typeof c==='string'){if(c[0]==='#'){let h=c.slice(1);if(h.length===3||h.length===4)h=h.slice(0,3).replace(/./g,m=>m+m);const n=parseInt(h.slice(0,6),16);if(!isNaN(n))v=[n>>16&255,n>>8&255,n&255];}
    else{const m=c.match(/rgba?\(([^)]+)\)/);if(m){const p=m[1].split(',').map(Number);if(p.length>=3&&p.every(x=>!isNaN(x)))v=[p[0]|0,p[1]|0,p[2]|0];}}}
  RGB.set(c,v);return v;}
const rgba=(v,a)=>`rgba(${v[0]},${v[1]},${v[2]},${(a<0?0:a>1?1:a).toFixed(3)})`;

// ---------- sprites painted once ----------
const SPR=new Map();
function mk(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
// a glow: hot in the middle, falling off fast, a long faint skirt
function glow(col){const key='g'+col;let s=SPR.get(key);if(s)return s;const v=rgbOf(col);s=mk(64,64);const g=s.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);
  r.addColorStop(0,rgba(v,1));r.addColorStop(.16,rgba(v,.62));r.addColorStop(.42,rgba(v,.2));r.addColorStop(.7,rgba(v,.06));r.addColorStop(1,rgba(v,0));g.fillStyle=r;g.fillRect(0,0,64,64);SPR.set(key,s);return s;}
// a puff: soft all the way out (dust, steam, mist)
function puff(col){const key='p'+col;let s=SPR.get(key);if(s)return s;const v=rgbOf(col);s=mk(64,64);const g=s.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);
  r.addColorStop(0,rgba(v,1));r.addColorStop(.5,rgba(v,.5));r.addColorStop(1,rgba(v,0));g.fillStyle=r;g.fillRect(0,0,64,64);SPR.set(key,s);return s;}
// the dark under the feet
function pool(){let s=SPR.get('dark');if(s)return s;s=mk(64,32);const g=s.getContext('2d');g.setTransform(1,0,0,.5,0,0);const r=g.createRadialGradient(32,32,0,32,32,32);
  r.addColorStop(0,'rgba(4,2,10,1)');r.addColorStop(.45,'rgba(4,2,10,.72)');r.addColorStop(1,'rgba(4,2,10,0)');g.fillStyle=r;g.fillRect(0,0,64,64);SPR.set('dark',s);return s;}

// ---------- each ground ----------
// wet: how much a floor gives back (a wet street, polished marble, waxed boards); blur: soft, the street's; rip: ripples; the air
const SC={
  street:{wet:.5,blur:1,rip:1,rain:1,mist:'#7d6c8e',tint:'#ffc27a'},
  roadblock:{wet:.45,blur:1,rip:1,rain:1,mist:'#7c88a4',tint:'#dfe9ff'},
  chase:{wet:.2,blur:1,rip:1,tint:'#ffc27a'},
  dining:{wet:.1,motes:'#ffdcaa',tint:'#ffcf8a'},kitchen:{wet:.07,motes:'#ffe6c4',steam:1,tint:'#ffd29a'},
  lobby:{wet:.2,motes:'#ffe8bc',tint:'#ffe0a8'},office:{wet:.08,motes:'#ffdcaa',tint:'#ffd090'},
  field:{flies:1,mist:'#8a98bc',tint:'#a9c2ff'},hill:{flies:1,mist:'#8a98bc',tint:'#a9c2ff'},crops:{flies:1,tint:'#a9c2ff'},outskirts:{motes:'#ffd8a0',tint:'#ffb070'},
  ledge:{flies:1,embers:1,tint:'#ffb070'},wall:{embers:1,tint:'#ff9e58'},
  roof:{wet:.12,blur:1,tint:'#a9c2ff'},station:{wet:.08,motes:'#ffdcaa',tint:'#ffd08a'},tunnel:{motes:'#cbb99a'},fall:{}};
// the moon where a ground has one and no lamps (the outskirts' low sun the same): its light comes from the sky behind, so the shadows
// fall toward us
const MOON={field:{x:262,y:86},hill:{x:880,y:62},crops:{x:132,y:70},roof:{x:118,y:62},outskirts:{x:170,y:304}};
let KEY=null,CFG={};
function sceneNow(){KEY=(typeof envKey==='function'&&envKey())||null;CFG=(KEY&&SC[KEY])||{};}
const reduce=()=>typeof reduceMotion!=='undefined'&&reduceMotion;

// ---------- the view this frame ----------
const V={s:1,L:0,T:0,ox:0,oy:0,VW:900,VH:500};
const dX=x=>(x-V.L+V.ox)*V.s,dY=y=>(y-V.T+V.oy)*V.s;

// ---------- the lights that cast shadows: the ground's own ----------
const CST=[];let MOONNOW=null;
function casters(){
  CST.length=0;MOONNOW=null;const t=S.t;
  // (the rooms' lamps are taken as hanging lower than they do, which throws the longer shadows a room lit from above shows a camera)
  if(S.lamps&&S.lamps.length){for(const L of S.lamps){if(L.fallen)continue;const g=lampGlow(L);if(g<=.04)continue;CST.push({x:L.p.x,y:L.p.y,d:L.dep,k:g,r:340,low:.74});}}
  else if(KEY==='street'){const LX=(EnvLook.S.street&&EnvLook.S.street.lamps)||[];for(const lx of LX)CST.push({x:lx+16,y:GB-162,d:200,k:1,r:430});}
  else if(KEY==='ledge'){const LS=(EnvLook.S.ledge&&EnvLook.S.ledge.lights)||[];
    for(const L of LS){const fl=L.k==='brazier'?.82+.18*Math.sin(t*9.3+L.x)*Math.sin(t*4.1+L.x*.7):1;CST.push({x:L.x,y:S.arena.ground(L.x,L.d)-L.h,d:L.d,k:(L.k==='lamp'?.95:.8)*fl,r:380,fire:L.k==='brazier'?'#ff9a4a':null});}}
  else if(KEY==='wall'){const wx=(S.arena&&S.arena.wall)||770,lit=!(S.wall&&S.wall.state==='breached');
    if(lit)for(const d of [150,232]){const fl=.84+.16*Math.sin(t*12.7+d)*Math.sin(t*5.1+d*.3);CST.push({x:wx-3,y:GB-150,d,k:.95*fl,r:420,fire:'#ffa04e'});}
    for(const x of [334,426]){const fl=.8+.2*Math.sin(t*10.3+x)*Math.sin(t*3.7+x*.2);CST.push({x,y:GB-34,d:288,k:.75*fl,r:330,fire:'#ff9040'});}}
  else if(KEY==='roadblock'){const M=EnvLook.S.roadblock&&EnvLook.S.roadblock.mast;if(M)CST.push({x:M.x,y:GB-12-M.h,d:M.d,k:1.15,r:1200});}
  else if(KEY&&MOON[KEY])MOONNOW=MOON[KEY];
  // the kitchen's range: its burners under the pans, low and warm
  if(KEY==='kitchen'&&typeof RANGE!=='undefined'){const fl=.82+.1*Math.sin(t*13.1)*Math.sin(t*5.3)+.08*Math.sin(t*29.7);CST.push({x:(RANGE.x0+RANGE.x1)/2,y:GB-74,d:226,k:.5*fl,r:300,fire:'#ff9a50'});}
  // the fires and the blasts of the story throw shadows too
  for(const F of S.fires||[]){const fl=.8+.12*Math.sin(t*11+(F.seed||0))+.08*Math.sin(t*23.7+(F.seed||0)*2);CST.push({x:F.x,y:F.y-(F.h||60)*.4,d:F.dep,k:.95*(F.k||1)*fl,r:320});}
  for(const b of S.booms||[]){const u=t-b.t0;if(u<0||u>1.2)continue;CST.push({x:b.x,y:b.y-30,d:b.dep,k:1.6*(1-u/1.2)*Math.min(1.4,b.size||1),r:560});}
}
// The two that light him most, each as the shadow's lie on the screen: v is where a point of him lands for each unit of its height
// (along the floor, away from the light), a where each unit across him lands (across the floor, square to the shadow, so a shadow
// thrown sideways still has his breadth in it)
const SHL=[];
function lie(ux,ud,len,a,L){const n=Math.hypot(ux,ud)||1;ux/=n;ud/=n;
  let vx=(ux+ud*PSX)*len,vy=-ud*PSY*len;const m=Math.hypot(vx,vy);if(m>1.3){vx*=1.3/m;vy*=1.3/m;}
  const px=ud<=0?-ud:ud,pd=ud<=0?ux:-ux;return{vx,vy,ax:px+pd*PSX,ay:-pd*PSY,a,L};}
function shadowFor(f){
  SHL.length=0;const fx=(f.p[FTF].x+f.p[FTB].x)/2,fd=f.dep,gy=f.gr(fx);
  if(MOONNOW){const sx=prjX(fx,fd);SHL.push(lie(clamp((sx-MOONNOW.x)/950,-.55,.55),-1,.42,.36*FK.k,null));return SHL;}
  let b1=null,b2=null;
  for(const L of CST){const Hh=gy-L.y;if(Hh<16)continue;const dx=fx-L.x,dd=fd-L.d,dist=Math.hypot(dx,dd,Hh*.55),I=L.k*clamp(1.2-dist/L.r,0,1);if(I<=.03)continue;
    const o={dx,dd,len:Math.hypot(dx,dd)/Math.max(36,Hh*(L.low||1)-46),I,L};if(!b1||I>b1.I){b2=b1;b1=o;}else if(!b2||I>b2.I)b2=o;}
  if(b1)SHL.push(lie(b1.dx,b1.dd,b1.len,.56*Math.min(1,b1.I)*FK.k,b1.L));
  if(b2)SHL.push(lie(b2.dx,b2.dd,b2.len,.36*Math.min(1,b2.I)*FK.k,b2.L));
  return SHL;}
const FK={k:1};
// (for timing the parts: each can be left out)
const SKIP={};

// ---------- the lights of the moment ----------
// impacts (each of the game's flashes, held a little longer as it fades), the magic, the guns, the blasts and the fires:
// x, y, d where it is in the world; sx, sy on the screen; col; k how strong; r how far it reaches
// (XL: the scenes' own lights, each a function handed addLight once a frame: the Pit's hot skillet)
const LIT=[],BURST=[],SEEN=new WeakSet(),XL=[];
function addLight(x,y,d,col,k,r){if(!(k>.02)||!Number.isFinite(x)||!Number.isFinite(y))return;LIT.push({x,y,d,sx:prjX(x,d),sy:prjY(y,d),col,k,r});}
let CRIT=null;
function gather(){
  LIT.length=0;const t=S.t;
  for(const e of S.flashes){if(SEEN.has(e))continue;SEEN.add(e);const big=e.r>=40;
    BURST.push({x:e.x,y:e.y,d:e.d,col:e.color,k:Math.min(1.5,clamp(e.r/30,.6,2)*(big?1.15:1)),r:60+Math.min(e.r,56)*3.2,t0:t-(e.age||0),life:big?.46:.34});
    if(e.r>=48&&!reduce())CRIT={x:prjX(e.x,e.d),y:prjY(e.y,e.d),col:e.color,t0:t-(e.age||0)};}
  for(let i=BURST.length-1;i>=0;i--){const b=BURST[i],u=(t-b.t0)/b.life;if(u>=1||u<-.05){BURST.splice(i,1);continue;}const a=1-clamp(u,0,1);addLight(b.x,b.y,b.d,b.col,b.k*a*a,b.r);}
  for(const B of S.bolts||[]){if(B.state==='fly'||B.state==='glance')addLight(B.x,B.y,B.dep,'#ffd77a',.95,190);
    if(B.burst){const E=B.burst,u=(t-E.t0)/.42;if(u>=0&&u<1)addLight(E.x,E.y,E.d,'#ffe299',1.5*(1-u)*(1-u)*(E.kind==='miss'?.6:1),230);}}
  for(const g of S.glyphs||[]){const f=g.f;if(!f||!f.p||!f.p[g.hand])continue;const u=(t-g.t0)/g.dur;if(u<0||u>=1)continue;const q=f.p[g.hand];addLight(q.x+f.facing*5,q.y,f.dep,'#ffe299',.55*(1-u),120);}
  for(const b of S.blinks||[]){const u=(t-b.t0)/b.dur;if(u<0||u>=1)continue;const y=b.top!=null&&b.ground!=null?(b.top+b.ground)/2:b.y;addLight(b.x,y,b.d,'#ffd77a',.9*(1-u),170);}
  for(const G of S.gales||[]){const u=(t-G.t0)/G.life;if(u<0||u>=1)continue;addLight(G.x+G.fa*(G.range||200)*eOut(u)*.7,(G.ground!=null?G.ground:G.y)-30,G.d,'#fff2d6',.4*(1-u),220);}
  for(const m of S.muzzles||[]){const u=(t-m.t0)/.08;if(u<0||u>=1)continue;addLight(m.x,m.y,m.dep,'#fff0c4',1.5*(1-u),260);}
  for(const b of S.booms||[]){const u=t-b.t0;if(u<0||u>1.4)continue;const k=(u<.08?u/.08:1)*Math.pow(1-u/1.4,1.5)*1.8*Math.min(1.4,b.size||1);addLight(b.x,b.y-30,b.dep,'#ffb060',k,420*Math.min(1.4,b.size||1));}
  for(const F of S.fires||[]){const fl=.78+.14*Math.sin(t*11+(F.seed||0))+.08*Math.sin(t*23.7+(F.seed||0)*2);addLight(F.x,F.y-(F.h||60)*.35,F.dep,'#ff8a3a',.8*(F.k||1)*fl,240);}
  for(const fn of XL){try{fn(addLight);}catch(e){}}
}

// ---------- the fighters' sprites ----------
const POOL=[],REC=new Map(),ORDER=[];
function slot(i,w,h){let P0=POOL[i];const W2=Math.ceil(w/64)*64,H2=Math.ceil(h/64)*64;
  if(!P0){const c=mk(W2,H2);P0=POOL[i]={cv:c,g:c.getContext('2d')};}
  else if(P0.cv.width<w||P0.cv.height<h){P0.cv.width=Math.max(W2,P0.cv.width);P0.cv.height=Math.max(H2,P0.cv.height);P0.g=P0.cv.getContext('2d');}
  return P0;}
// struck: the man goes white for a moment (by the game's clock, and never longer than a quarter of a second of the real one)
const HP=new WeakMap();
function hitNow(f){let h=HP.get(f);const now=performance.now();
  if(!h){h={hp:f.hp,t0:-9,r0:-1e9};HP.set(f,h);}
  if(f.hp<h.hp-2){h.t0=S.t;h.r0=now;}h.hp=f.hp;
  const u=Math.max((S.t-h.t0)/.13,(now-h.r0)/250);return u>=0&&u<1?1-u:0;}
// the draw list's own order for the fighters, far to near
function fightersFarToNear(){const ex=S.game.ex,key=f=>f.dep-(ex&&ex.A===f?.05:0)+(f.dead?.03:0);
  ORDER.length=0;for(const f of S.F)if(!f.gone)ORDER.push(f);ORDER.sort((a,b)=>key(b)-key(a));return ORDER;}
// what is cast and reflected: not a man out of sight, on a machine, in a helicopter, or showing only through glass or in the pit
function grounded(f){if(f.hidden||f.mount||f.inHeli||f.clipRect)return false;if(typeof storyNoShadow==='function'&&storyNoShadow(f))return false;return true;}
function prepass(){
  const W0=cv.width,H0=cv.height,s=V.s;
  for(const f of fightersFarToNear()){
    if(f.hidden||!f.p)continue;
    const J=f.p,dx=f.dep*PSX,dy=-f.dep*PSY,cxm=(J[PEL].x+J[CHE].x)/2;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
    for(const q of J){if(!q)continue;const a=q.x,b=2*cxm-q.x;if(a<x0)x0=a;if(a>x1)x1=a;if(b<x0)x0=b;if(b>x1)x1=b;if(q.y<y0)y0=q.y;if(q.y>y1)y1=q.y;}
    if(f.scarf)for(const q of f.scarf){if(q.x<x0)x0=q.x;if(q.x>x1)x1=q.x;if(q.y<y0)y0=q.y;if(q.y>y1)y1=q.y;}
    if(!Number.isFinite(x0+x1+y0+y1))continue;
    // (how far a figure's drawing reaches past its joints, measured over long fights on every ground: 48 to the sides, 44 up, 26 down;
    // a beast's tail and a spin's sweep further)
    let M=FK.M||(f.beast?140:58),MB=FK.M||(f.beast?80:36);if(f.spin){const sw=(f.arm||45)+((f.wp&&f.wp.len)||40);M+=sw;MB+=sw*.5;}
    const X0=Math.floor((x0-M+dx-V.L+V.ox)*s),Y0=Math.floor((y0-M+dy-V.T+V.oy)*s),X1=Math.ceil((x1+M+dx-V.L+V.ox)*s),Y1=Math.ceil((y1+MB+dy-V.T+V.oy)*s);
    const bx=Math.max(0,X0),by=Math.max(0,Y0),w=Math.min(W0,X1)-bx,h=Math.min(H0,Y1)-by;
    if(w<2||h<2||w*h>W0*H0)continue;
    const P0=slot(f.idx,w,h),g=P0.g;
    g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.globalAlpha=1;g.clearRect(0,0,w,h);
    g.setTransform(s,0,0,s,(-V.L+V.ox)*s-bx,(-V.T+V.oy)*s-by);g.lineCap='round';g.lineJoin='round';g.save();g.translate(dx,dy);
    let tr=false,ok=false;const main=ctx;ctx=g;
    try{drawFighterItem(f,()=>{tr=true;});ok=true;}catch(e){}finally{ctx=main;g.restore();}
    // (a drawing that fails is left to the draw list, which draws him as it always did)
    if(!ok)continue;
    // (the shadow is taken from a tighter box: his body and weapon, not the room left for what a drawing may throw out round him)
    const m=f.beast?70:16,jx0=Math.max(bx,Math.floor((x0-m+dx-V.L+V.ox)*s)),jy0=Math.max(by,Math.floor((y0-m+dy-V.T+V.oy)*s)),
      jx1=Math.min(bx+w,Math.ceil((x1+m+dx-V.L+V.ox)*s)),jy1=Math.min(by+h,Math.ceil((y1+m+dy-V.T+V.oy)*s));
    const R={f,cv:P0.cv,g,x:bx,y:by,w,h,tr,J:[x0+dx,y0+dy,x1+dx,y1+dy],jb:{x:jx0,y:jy0,w:Math.max(1,jx1-jx0),h:Math.max(1,jy1-jy0)}};REC.set(f,R);
    if(!SKIP.lit)lightSprite(R);}
}
// the light on him: the lights of the moment in their colours, the lamp that lights him most, white when struck
function lightSprite(R){
  const f=R.f,g=R.g,cx=prjX(f.p[CHE].x,f.dep),cy=prjY(f.p[CHE].y,f.dep),hit=hitNow(f);let any=hit>0;
  const near=[];for(const l of LIT){const d=Math.hypot(l.sx-cx,l.sy-cy),reach=l.r+70;if(d<reach)near.push([l,d,reach]);}
  if(!near.length&&!any&&!CFG.tint)return;
  g.save();g.setTransform(V.s,0,0,V.s,(-V.L+V.ox)*V.s-R.x,(-V.T+V.oy)*V.s-R.y);g.globalCompositeOperation='source-atop';
  // the lamp that lights him most (the moon from the sky), a little of its colour on the side toward it
  if(CFG.tint&&grounded(f)){const sh=shadowFor(f);if(MOONNOW){g.globalAlpha=.06;const rr=260;const mx=cx+(MOONNOW.x>cx?160:-160);g.drawImage(glow(CFG.tint),mx-rr,cy-200-rr,rr*2,rr*2);}
    else if(sh.length&&sh[0].L){const L=sh[0].L,lx=prjX(L.x,L.d),ly=prjY(L.y,L.d),rr=Math.max(120,Math.hypot(lx-cx,ly-cy)*1.05);g.globalAlpha=clamp(.08*sh[0].a/.5,0,.08);g.drawImage(glow(CFG.tint),lx-rr,ly-rr,rr*2,rr*2);}}
  for(const [l,d,reach] of near){const a=Math.min(.5,l.k*.45*(1-d/reach));if(a<.02)continue;const rr=Math.max(46,l.r*.85);g.globalAlpha=a;g.drawImage(glow(l.col),l.sx-rr,l.sy-rr,rr*2,rr*2);}
  if(hit>0){g.setTransform(1,0,0,1,0,0);g.globalAlpha=.42*hit*hit;g.fillStyle='#fff6e8';g.fillRect(0,0,R.w,R.h);}
  g.restore();}
// set him down where he stands (with the weapon's trail first, as the draw list always had it)
function put(f){const R=REC.get(f);if(!R)return false;
  if(R.tr){ctx.save();ctx.translate(f.dep*PSX,-f.dep*PSY);drawTrail(S.trails[f.idx]);if(f.offTrail)drawTrail(f.offTrail);ctx.restore();}
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.drawImage(R.cv,0,0,R.w,R.h,R.x,R.y,R.w,R.h);ctx.restore();return true;}
// where his floor is under him, in canvas pixels
function groundY(f){const fx=(f.p[FTF].x+f.p[FTB].x)/2;return dY(prjY(f.gr(fx),f.dep));}

// ---------- reflections ----------
const RB={cv:null,g:null};
function reflections(){
  const wet=CFG.wet||0;if(!(wet>0))return;const t=S.t,N=CFG.rip?8:5;
  for(const f of ORDER){const R=REC.get(f);if(!R||!grounded(f))continue;
    const Gd=groundY(f),span=Math.min(Gd-R.y,170*V.s);if(!(span>4))continue;
    let src=R.cv,q=1;
    // the street's is soft: taken from a copy at half size
    if(CFG.blur){q=2;const w=Math.ceil(R.w/2),h=Math.ceil(R.h/2);if(!RB.cv){RB.cv=mk(w,h);RB.g=RB.cv.getContext('2d');}
      if(RB.cv.width<w||RB.cv.height<h){RB.cv.width=Math.max(w,RB.cv.width);RB.cv.height=Math.max(h,RB.cv.height);RB.g=RB.cv.getContext('2d');}
      const b=RB.g;b.setTransform(1,0,0,1,0,0);b.globalCompositeOperation='source-over';b.globalAlpha=1;b.clearRect(0,0,w+1,h+1);b.drawImage(R.cv,0,0,R.w,R.h,0,0,w,h);src=RB.cv;}
    ctx.save();ctx.setTransform(1,0,0,-1,0,2*Gd);
    // hung from his feet a band at a time, each fainter, each shifted a little on the street's water
    for(let i=0;i<N;i++){const a0=span*i/N,a1=span*(i+1)/N;let sy=Gd-a1-R.y,sh=a1-a0;if(sy+sh<=0)continue;if(sy<0){sh+=sy;sy=0;}if(sh<=.5)continue;
      const al=wet*Math.pow(1-(i+.5)/N,1.4);if(al<.01)continue;
      const rip=CFG.rip?Math.sin(t*2.4+i*1.9+R.x*.017)*(.4+i*.55)*V.s*.45:0;
      ctx.globalAlpha=al;ctx.drawImage(src,0,sy/q,R.w/q,sh/q,R.x+rip,R.y+sy,R.w,sh);}
    ctx.restore();}
}

// ---------- shadows ----------
const SB={cv:null,g:null};
// his silhouette at half the size (so it comes back soft), laid down twice so his thin limbs keep their weight once softened, dark,
// darkest at his feet
function silhouette(R,Gd){
  const J=R.jb,k=2,w=Math.max(2,Math.ceil(J.w/k)),h=Math.max(2,Math.ceil(J.h/k));
  if(!SB.cv){SB.cv=mk(w,h);SB.g=SB.cv.getContext('2d');}
  if(SB.cv.width<w||SB.cv.height<h){SB.cv.width=Math.max(w,SB.cv.width);SB.cv.height=Math.max(h,SB.cv.height);SB.g=SB.cv.getContext('2d');}
  const g=SB.g;g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,w+1,h+1);
  const sx=J.x-R.x,sy=J.y-R.y;g.drawImage(R.cv,sx,sy,J.w,J.h,0,0,w,h);g.drawImage(R.cv,sx,sy,J.w,J.h,0,0,w,h);
  g.globalCompositeOperation='source-in';const gl=Math.max(1,(Gd-J.y)/k),gr=g.createLinearGradient(0,0,0,gl);
  gr.addColorStop(0,'rgba(5,3,10,.32)');gr.addColorStop(1,'rgba(5,3,10,1)');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.globalCompositeOperation='source-over';return{w,h};}
function castShadows(){
  for(const f of ORDER){const R=REC.get(f);if(!R||!grounded(f))continue;const L=shadowFor(f);if(!L.length)continue;
    const Gd=groundY(f),Fx=dX(prjX((f.p[FTF].x+f.p[FTB].x)/2,f.dep)),B=silhouette(R,Gd);ctx.save();
    for(let i=0;i<L.length;i++){const l=L[i];if(l.a<(i?.1:.02))continue;ctx.setTransform(l.ax,l.ay,-l.vx,-l.vy,Fx*(1-l.ax)+l.vx*Gd,Gd*(1+l.vy)-l.ay*Fx);ctx.globalAlpha=Math.min(1,l.a);
      ctx.drawImage(SB.cv,0,0,B.w,B.h,R.jb.x,R.jb.y,R.jb.w,R.jb.h);}
    ctx.restore();}
}
// the dark round the feet of everyone standing (the old ellipse, soft), and the table's
function contactShadows(){
  const D=pool();
  for(const f of S.F){if(f.gone||!grounded(f))continue;let lo=1e9,hi=-1e9;for(const i of [PEL,CHE,HEAD,KNF,KNB,FTF,FTB]){const q=f.p[i];if(q.x<lo)lo=q.x;if(q.x>hi)hi=q.x;}
    const cx=(lo+hi)/2,gy=f.gr(cx),h=clamp((gy-f.p[PEL].y)/(f.leg*.9),0,1.8),q=P(cx,gy,f.dep);
    const a=(full()&&REC.has(f)?.5:.62)*(h>1.15?clamp(1-(h-1.15)*1.3,.25,1):1),rx=Math.max(16+f.body.bulk*5,(hi-lo)/2+8)*1.25,ry=6.5;
    ctx.globalAlpha=a;ctx.drawImage(D,q.x-rx,q.y-ry,rx*2,ry*2);}
  ctx.globalAlpha=1;
  const T=S.table;if(T&&T.on&&T.state!=='broken'){const b=tableBox(),g=S.arena.ground(b.cx,T.dep);
    ctx.fillStyle='rgba(4,2,10,.28)';poly([P(b.l-3,g,T.dep+TD),P(b.r+3,g,T.dep+TD),P(b.r+3,g,T.dep-TD),P(b.l-3,g,T.dep-TD)]);}
}

// ---------- light on the floor ----------
function floorLight(){
  let fires=false;for(const c of CST)if(c.fire){fires=true;break;}
  if(!LIT.length&&!fires)return;const wet=CFG.wet||0;ctx.save();ctx.globalCompositeOperation='lighter';
  for(const c of CST){if(!c.fire)continue;const g=S.arena.ground(c.x,c.d),h=Math.max(0,g-c.y),q=P(c.x,g,c.d),rx=110+h*.6,ry=rx*.3;
    ctx.globalAlpha=clamp(c.k*.2,0,.3);ctx.drawImage(glow(c.fire),q.x-rx,q.y-ry,rx*2,ry*2);
    const a=P(c.x,c.y,c.d),R=34+h*.15;ctx.globalAlpha=clamp(c.k*.14,0,.2);ctx.drawImage(glow(c.fire),a.x-R,a.y-R,R*2,R*2);}
  for(const l of LIT){const g=S.arena.ground(l.x,l.d),fy=prjY(g,l.d),fx=prjX(l.x,l.d),h=Math.max(0,g-l.y),k=Math.min(1.2,l.k);
    const rx=l.r*.42+h*.45,ry=rx*.3,a=k*.42*clamp(1.15-h/240,.3,1);
    ctx.globalAlpha=Math.min(1,a);ctx.drawImage(glow(l.col),fx-rx,fy-ry,rx*2,ry*2);
    // down a wet floor, the light's own reflection: a streak as far under the floor as the light is over it
    if(wet>0&&h>8){const sw=7+l.r*.035,sh=h*1.25+24;ctx.globalAlpha=Math.min(1,k*wet*1.3);ctx.drawImage(glow(l.col),fx-sw,fy+h*.85-sh/2,sw*2,sh);}}
  ctx.restore();}

// ---------- the air ----------
const PATHS=[null,null,null,null];
// the street lamps' light along the street, 0 to 1, for the rain and the mist (lamps are at x+56 on the screen)
function streetLit(x){let k=0;const LX=(EnvLook.S.street&&EnvLook.S.street.lamps)||[];for(const lx of LX){const d=Math.abs(x-(lx+56));if(d<150)k=Math.max(k,1-d/150);}return k;}
function rainLit(x){return KEY==='street'?streetLit(x):KEY==='roadblock'?clamp(1-Math.abs(x-700)/420,0,1)*.8:0;}
// rain: drops falling past the camera at two depths, brighter where a lamp lights them
function rain(layer,n){
  const t=S.t,x0=V.L-60,span=V.VW+120,y0=V.T-40,hh=V.VH+80,wind=.2,cols=['rgba(200,214,255,','rgba(214,224,255,','rgba(236,232,255,','rgba(255,240,214,'],AL=layer?[.06,.14,.26,.42]:[.045,.09,.18,.3];
  for(let b=0;b<4;b++)PATHS[b]=new Path2D();
  for(let i=0;i<n;i++){const h1=hs(i*3+layer*7919+11),h2=hs(i*5+layer*104729+29),h3=hs(i*7+layer*1299709+53);
    const sp=(layer?820:560)+h2*260,len=(layer?20:12)+h3*9,per=hh/sp,u=((t/per+h1)%1+1)%1,x=x0+((h3*span*7.31+u*hh*wind)%span),y=y0+u*hh;
    const k=rainLit(x),b=k>.62?3:k>.32?2:k>.1?1:0,Pp=PATHS[b];Pp.moveTo(x,y);Pp.lineTo(x-wind*len,y-len);}
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.lineWidth=layer?1.05:.75;
  for(let b=0;b<4;b++){ctx.strokeStyle=cols[b]+AL[b]+')';ctx.stroke(PATHS[b]);}
  ctx.restore();}
// where the rain lands: rings on the flags that spread and go
function splashes(n){
  const t=S.t,P0=.42;ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineWidth=.7;
  for(let i=0;i<n;i++){const ph=hs(i*17+3),c=Math.floor(t/P0+ph),u=t/P0+ph-c;if(u>.55)continue;
    const x=V.L+hs(i*31+c*977)*V.VW,d=14+hs(i*37+c*733)*176,q=P(x,S.arena.ground(x,d),d),r=1+u*7,k=rainLit(q.x);
    ctx.globalAlpha=(1-u/.55)*(.12+.42*k);ctx.strokeStyle=k>.3?'#ffe9c8':'#cfd8f4';ctx.beginPath();ctx.ellipse(q.x,q.y,r,r*.28,0,0,TAU);ctx.stroke();}
  ctx.restore();}
// mist: long soft banks drifting along the floor
function mist(col,front){
  const t=S.t,S0=puff(col);ctx.save();ctx.globalCompositeOperation='lighter';
  const n=front?2:4;for(let i=0;i<n;i++){const h1=hs(i*13+(front?500:0)),d=front?8+i*10:40+i*48,w=380+h1*260,sp=6+h1*7,x=V.L-w+(((h1*1999+t*sp)%(V.VW+2*w))),q=P(x,S.arena.ground(x,d),d);
    ctx.globalAlpha=front?.045:.06;ctx.drawImage(S0,q.x-w/2,q.y-28-(front?6:0),w,front?60:56);}
  ctx.restore();}
// the dust in the rooms, shining where it turns through a lamp's light
function motes(col,n){
  const t=S.t,lamps=[];for(const L of S.lamps||[]){const k=lampGlow(L);if(k>.1&&!L.fallen)lamps.push([prjX(L.p.x,L.dep),prjY(L.p.y,L.dep),k]);}
  const v=rgbOf(col);for(let b=0;b<4;b++)PATHS[b]=new Path2D();
  for(let i=0;i<n;i++){const h1=hs(i*11+7),h2=hs(i*13+19),h3=hs(i*17+31),h4=hs(i*19+43),h5=hs(i*23+59);
    const x=h1*(W+80)-40+Math.sin(t*.13*(1+h4)+h5*6.3)*34,d=18+h2*210,ht=24+h3*230+Math.sin(t*.1*(1+h5)+h4*5.1)*22,q=P(x,GB-ht,d);
    let k=0;for(const [lx,ly,lk] of lamps){if(q.y<ly-10)continue;const w=26+(q.y-ly)*.42,dx=Math.abs(q.x-lx);if(dx<w)k=Math.max(k,(1-dx/w)*lk*clamp(1-(q.y-ly)/320,.2,1));}
    if(!lamps.length)k=.25;
    const tw=.55+.45*Math.sin(t*(1.1+h4*1.7)+h1*40),a=k*tw,b=a>.55?3:a>.3?2:a>.12?1:0;if(a<.04)continue;
    const r=d<80?.85:.6;PATHS[b].rect(q.x-r,q.y-r,r*2,r*2);}
  ctx.save();ctx.globalCompositeOperation='lighter';const AL=[.1,.22,.38,.6];
  for(let b=0;b<4;b++){ctx.fillStyle=rgba(v,AL[b]);ctx.fill(PATHS[b]);}
  ctx.restore();}
// fireflies over the grass: each wanders, and lights up for a moment now and then
function fireflies(n){
  const t=S.t,G=glow('#d9ff8c');ctx.save();ctx.globalCompositeOperation='lighter';
  for(let i=0;i<n;i++){const h1=hs(i*29+5),h2=hs(i*31+17),h3=hs(i*37+23),h4=hs(i*41+37),h5=hs(i*43+47);
    const bl=Math.sin(t*(.55+h4*.5)+h5*20);if(bl<.45)continue;const a=Math.pow((bl-.45)/.55,1.6);
    const x=h1*(W+40)-20+Math.sin(t*.23*(1+h2)+h3*6)*44,d=26+h2*200,gy=S.arena.ground(x,d),ht=10+h3*46+Math.sin(t*.7+h1*9)*7,q=P(x,gy-ht,d);
    ctx.globalAlpha=a*.55;ctx.drawImage(G,q.x-7,q.y-7,14,14);ctx.globalAlpha=a;ctx.fillStyle='#f4ffd0';ctx.fillRect(q.x-.7,q.y-.7,1.4,1.4);}
  ctx.restore();}
// embers off a fire: rising, wavering, going out (x, y on the screen)
function embers(src,n,seed){
  const t=S.t;ctx.save();ctx.globalCompositeOperation='lighter';
  for(let i=0;i<n;i++){const h1=hs(i*53+seed),h2=hs(i*59+seed*3+1),h3=hs(i*61+seed*7+2),Pd=1.6+h2*1.6,u=((t/Pd+h1)%1+1)%1;
    const x=src.x+(h3-.5)*src.w+Math.sin(u*5.5+h1*30)*5+u*6,y=src.y-u*(36+h2*40),a=(u<.1?u/.1:1)*(1-u)*.95;if(a<.03)continue;
    ctx.globalAlpha=a;ctx.fillStyle=h3<.5?'#ffb050':'#ff7a2a';const r=h2<.3?1.1:.75;ctx.fillRect(x-r/2,y-r/2,r,r);}
  ctx.restore();}
function emberSources(){const out=[];
  if(KEY==='wall'){const wx=(S.arena&&S.arena.wall)||770;if(!(S.wall&&S.wall.state==='breached'))for(const d of [150,232])out.push({x:prjX(wx-3,d),y:prjY(GB-160,d),w:6});
    for(const x of [334,426])out.push({x:prjX(x,288),y:prjY(GB-40,288),w:12});}
  if(KEY==='ledge'){const LS=(EnvLook.S.ledge&&EnvLook.S.ledge.lights)||[];for(const L of LS)if(L.k==='brazier')out.push({x:prjX(L.x,L.d),y:prjY(S.arena.ground(L.x,L.d)-L.h-6,L.d),w:12});}
  for(const F of S.fires||[])out.push({x:prjX(F.x,F.dep),y:prjY(F.y-(F.h||60)*.5,F.dep),w:(F.w||80)*.5});
  return out;}
// steam off the pans on the kitchen range (where the kitchen paints them)
function steam(){
  if(typeof RANGE==='undefined'||typeof RANGE_POTS==='undefined')return;const t=S.t,ox=236*PSX,yb=GB-236*PSY,S0=puff('#e6ded6');
  ctx.save();
  for(let j=0;j<RANGE_POTS.length;j++){const [u0,w,h]=RANGE_POTS[j],sx=lerp(RANGE.x0,RANGE.x1,u0)+ox,sy=yb-74-h;
    for(let i=0;i<5;i++){const Pd=2.6+hs(j*7+i)*.9,u=((t/Pd+i/5+j*.13)%1+1)%1,x=sx+Math.sin(u*3.4+i+j)*6+u*12,y=sy-4-u*70,r=5+u*22+w*.14;
      ctx.globalAlpha=.2*(u<.12?u/.12:1)*(1-u)*(1-u*.4);ctx.drawImage(S0,x-r,y-r*.8,r*2,r*1.6);}}
  ctx.restore();}
function airBack(){
  const lite=!full(),rm=reduce();
  if(CFG.mist&&!SKIP.mist)mist(CFG.mist,false);
  if(rm)return;
  if(CFG.rain&&!SKIP.rain){rain(0,lite?50:110);splashes(lite?10:24);}
  if(CFG.steam)steam();
}
function airFront(){
  const lite=!full(),rm=reduce();
  if(!rm){
    if(CFG.rain&&!SKIP.rain)rain(1,lite?26:56);
    if(CFG.motes&&!SKIP.motes)motes(CFG.motes,lite?22:48);
    if(CFG.flies)fireflies(lite?7:15);
    const src=CFG.embers||(S.fires&&S.fires.length)?emberSources():null;if(src)for(let i=0;i<src.length;i++)embers(src[i],lite?5:10,i*101+7);}
  if(CFG.mist&&KEY!=='field'&&KEY!=='hill'&&!SKIP.mist)mist(CFG.mist,true);
}

// ---------- the impacts, the sparks, the dust ----------
function fx(){
  if(!on()||SKIP.fx)return false;
  ctx.save();
  // the shock on the floor: a glow under it and its ring
  ctx.globalCompositeOperation='lighter';
  for(const r of S.rings){const u=clamp(r.age/r.life,0,1),q=P(r.x,S.arena.ground(r.x,r.d),r.d),R=6+r.r*eOut(u),a=1-u;
    ctx.globalAlpha=a*.32;ctx.drawImage(glow(r.color),q.x-R,q.y-R*.3,R*2,R*.6);
    ctx.globalAlpha=a*.8;ctx.strokeStyle=r.color;ctx.lineWidth=2.6*a+.6;ctx.beginPath();ctx.ellipse(q.x,q.y,R,R*.28,0,0,TAU);ctx.stroke();
    ctx.globalAlpha=a*.3;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(q.x,q.y,R*.62,R*.62*.28,0,0,TAU);ctx.stroke();}
  // dust kicked up: soft puffs that spread and thin
  ctx.globalCompositeOperation='source-over';
  for(const d of S.dusts){const u=clamp(d.age/d.life,0,1),q=P(d.x,d.y,d.d),r=d.r*(1+u*1.7)*1.5;ctx.globalAlpha=(1-u)*(d.c?.5:.3);ctx.drawImage(puff(d.c||'#d9b49a'),q.x-r,q.y-r,r*2,r*2);}
  // sparks: glowing streaks along their flight, a white-hot head, a glow while they are new
  ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
  for(const s of S.sparks){const u=clamp(s.age/s.life,0,1),a=1-u,q=P(s.x,s.y,s.d),tx=q.x-s.vx*.03,ty=q.y-s.vy*.03;
    ctx.globalAlpha=a*.85;ctx.strokeStyle=s.color;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(tx,ty);ctx.stroke();
    ctx.globalAlpha=a;ctx.fillStyle='#fff8ea';ctx.fillRect(q.x-.75,q.y-.75,1.5,1.5);
    if(u<.45){ctx.globalAlpha=(1-u/.45)*.42;ctx.drawImage(glow(s.color),q.x-6,q.y-6,12,12);}}
  // the flash of each blow: a glow in its colour, a white-hot core, and on the big ones rays and a streak across
  for(const e of S.flashes){const u=clamp(e.age/e.life,0,1),a=1-u,q=P(e.x,e.y,e.d),big=e.r>=40;
    let R=e.r*(1.15+.55*eOut(u));ctx.globalAlpha=a*a*.9;ctx.drawImage(glow(e.color),q.x-R,q.y-R,R*2,R*2);
    if(u<.45){R=e.r*.5*(1-u*.7);ctx.globalAlpha=1-u/.45;ctx.drawImage(glow('#ffffff'),q.x-R,q.y-R,R*2,R*2);}
    if(big&&u<.75){const n=8,rot=hs(Math.round(e.x*7+e.y*13+e.d*17))*TAU,Lr=e.r*(.8+1.5*eOut(u/.75)),w=Math.max(.9,e.r*.045);ctx.globalAlpha=(1-u/.75)*.8;ctx.fillStyle=e.color;
      ctx.beginPath();for(let i=0;i<n;i++){const an=rot+i*TAU/n,l=Lr*(i%2?.55:1),c=Math.cos(an),sn=Math.sin(an),r0=e.r*.18;
        ctx.moveTo(q.x+c*r0-sn*w,q.y+sn*r0+c*w);ctx.lineTo(q.x+c*l,q.y+sn*l);ctx.lineTo(q.x+c*r0+sn*w,q.y+sn*r0-c*w);ctx.closePath();}ctx.fill();}
    if(big&&u<.55){const lw=e.r*4.4,lh=Math.max(1.5,e.r*.06);ctx.globalAlpha=(1-u/.55)*.6;ctx.drawImage(glow(e.color),q.x-lw,q.y-lh,lw*2,lh*2);ctx.globalAlpha=(1-u/.55)*.5;ctx.drawImage(glow('#ffffff'),q.x-lw*.45,q.y-lh*.5,lw*.9,lh);}
    ctx.globalAlpha=a*.5;ctx.strokeStyle=e.color;ctx.lineWidth=2*a+.5;ctx.beginPath();ctx.arc(q.x,q.y,e.r*(.3+eOut(u)),0,TAU);ctx.stroke();}
  ctx.restore();
  return true;}

// ---------- over the whole picture ----------
function grade(){
  const w=cv.width,h=cv.height;ctx.save();ctx.setTransform(1,0,0,1,0,0);
  // a crit: the whole frame catches its light for an instant
  if(CRIT){const u=(S.t-CRIT.t0)/.32;if(u>=0&&u<1){const x=dX(CRIT.x),y=dY(CRIT.y),R=Math.hypot(w,h)*.55;ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.2*(1-u)*(1-u);ctx.drawImage(glow(CRIT.col),x-R,y-R,R*2,R*2);}else if(u>=1)CRIT=null;}
  ctx.restore();}

// ---------- the frame ----------
// called by render once the floor is down: the lights, the fighters' sprites, their reflections, the light on the floor, the air behind
function frame(s,L,T,ox,oy){
  REC.clear();ORDER.length=0;if(!on())return;
  V.s=s;V.L=L;V.T=T;V.ox=ox;V.oy=oy;V.VW=cam.viewW;V.VH=cam.viewW/aspect;
  sceneNow();casters();gather();
  if(full()&&!SKIP.prepass){prepass();if(!SKIP.refl)reflections();}
  if(!SKIP.floor)floorLight();if(!SKIP.air)airBack();}
function shadows(){contactShadows();if(full()&&!SKIP.cast)castShadows();}
function front(){if(!on())return;if(!SKIP.air)airFront();
  let any=false;for(const l of LIT)if(l.k>.6){any=true;break;}if(!any)return;
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(const l of LIT){if(l.k<=.6)continue;const R=l.r*1.25;ctx.globalAlpha=Math.min(.16,.09*l.k);ctx.drawImage(glow(l.col),l.sx-R,l.sy-R,R*2,R*2);}
  ctx.restore();}
// How long a frame's drawing takes, and how long between frames. A device that cannot keep up at Full (frames coming slower than
// fifty a second while the drawing itself takes over ten milliseconds, over two seconds of play) goes down to Lite; never on a choice
// made in the menu, and never in the checks.
function done(ms,gapIn){
  const now=performance.now(),gap=gapIn!=null?gapIn:now-(Q.last||now);Q.last=now;
  if(Q.q!=='full'||Q.user||S.paused||(typeof window!=='undefined'&&window.SK_TEST)||!(gap>0&&gap<250))return;
  const A=Q.samples;A.push([ms,gap]);if(A.length<120)return;const med=i=>A.map(v=>v[i]).sort((a,b)=>a-b)[A.length>>1],m=med(0),g=med(1);A.length=0;
  if(m>10&&g>20){Q.q='lite';Q.auto=true;REC.clear();sync();}}
function set(q,user){if(!['full','lite','off'].includes(q))return;Q.q=q;if(user){Q.user=true;Q.auto=false;try{localStorage.setItem('sk_fx',q);}catch(e){}}Q.samples.length=0;REC.clear();sync();}
function sync(){try{const wr=document.getElementById('wrap');if(wr&&wr.setAttribute)wr.setAttribute('data-fx',real()?Q.q:'off');
  const el=document.getElementById('fxSeg');if(!el)return;el.querySelectorAll('[data-fx]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.fx===Q.q)));
  const n=document.getElementById('fxNote');if(n)n.hidden=!Q.auto||Q.q!=='lite';}catch(e){}}
// the setting, in the menu's Arena panel under Blood
V11UI.init.push(()=>{try{
  const gore=document.querySelector('.b-arena .gore-row');if(!gore||!gore.insertAdjacentElement)return;
  const row=document.createElement('div');row.className='gore-row fx-row';
  row.innerHTML='<span>Effects</span><div class="seg seg3" id="fxSeg" role="group" aria-label="Lighting and effects"></div>';
  gore.insertAdjacentElement('afterend',row);
  const note=document.createElement('p');note.className='fx-note';note.id='fxNote';note.hidden=true;note.textContent='Lite was chosen for this device: it could not keep up at Full.';row.insertAdjacentElement('afterend',note);
  const seg=row.querySelector('#fxSeg');
  for(const [k,l,tip] of [['off','Off','The picture without the added light and air'],['lite','Lite','Glows, weather and soft shadows: for a slower device'],
      ['full','Full','Every lamp throws shadows, wet floors give reflections, and the light of each blow falls on the fighters']]){
    const b=document.createElement('button');b.type='button';b.dataset.fx=k;b.textContent=l;b.title=tip;b.addEventListener('click',()=>set(k,true));seg.appendChild(b);}
  sync();}catch(e){}});
V11UI.init.push(()=>sync());
return{on,full,frame,shadows,front,grade,fx,put,done,set,lights:XL,get q(){return Q.q;},get auto(){return Q.auto;},get user(){return Q.user;},
  // (for the checks: the sprite a fighter was drawn into this frame, and where it sits on the canvas)
  sprite:f=>REC.get(f)||null,offsetOf:c=>{for(const R of REC.values())if(R.g===c)return{x:R.x,y:R.y};return{x:0,y:0};},
  fk:FK,skip:SKIP,dbg:()=>({key:KEY,cfg:CFG,casters:CST.map(c=>({x:Math.round(c.x),y:Math.round(c.y),d:c.d,k:+c.k.toFixed(2)})),moon:MOONNOW,lights:LIT.length,
    sprites:[...REC.values()].map(R=>({i:R.f.idx,x:R.x,y:R.y,w:R.w,h:R.h,gd:Math.round(groundY(R.f)),sh:shadowFor(R.f).map(l=>({vx:+l.vx.toFixed(2),vy:+l.vy.toFixed(2),ax:+l.ax.toFixed(2),ay:+l.ay.toFixed(2),a:+l.a.toFixed(2)}))}))})};
})();
