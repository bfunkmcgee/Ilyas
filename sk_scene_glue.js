// ---------- the scenes in the game ----------
// Which scene is up: the ground's own outdoors, the room's indoors. None while S.classicLook or S.sceneOff is set, and none in a
// browser that cannot draw them (the headless checks have no Path2D or DOMMatrix), so the old drawing stays there.
const SCENE_OK=typeof Path2D==='function'&&typeof DOMMatrix==='function';
function envKey(){if(!SCENE_OK||S.classicLook||S.sceneOff||!S.arena)return null;const k=S.arena.indoor?(['kitchen','lobby','office'].includes(S.room)?S.room:'dining'):S.arenaKey;return EnvLook.S[k]?k:null;}
// One layer at a time, painted at the most the screen can need: the closest the camera comes (camCloseW, sk_ui.js: the push-in's on an
// upright phone, about 404 world units across at 412x714; 560 on a narrow screen held sideways; the whole width on a wider one; less a
// tenth for the punch-in) at the screen's own resolution, up to 2.4 times the world's units as the rooms always were (about 2.3 pixels
// a unit on a phone). It is painted again only for another scene or when the screen itself changes size.
let SCENE_LY=null;
function sceneScale(){return clamp(cv.width/(camCloseW()*.9)*1.12,1,2.4);}
// How much of RC's height the layer keeps: all of it on an upright screen, where the push-in shows the ground in front of the fight
// (RC runs on to y 870 for it); 700 units (to y 610) elsewhere, where the dock or the world's foot hides the rest.
function sceneLayerH(){return camNarrow()&&cssH>cssW?RC.h:Math.min(RC.h,H+200);}
// A scene whose still parts change with the story (the bistro's doors blown in) gives a key() that changes with them; a new key
// paints the layer again.
function sceneLayer(k){const need=sceneScale(),lh=sceneLayerH(),v=EnvLook.S[k].key?EnvLook.S[k].key():'';let L=SCENE_LY;
  if(!L||L.k!==k||L.v!==v||L.lh!==lh||Math.abs(need/L.sc-1)>.15){if(L){L.cv.width=L.cv.height=0;SCENE_LY=null;}
    const cn=document.createElement('canvas');cn.width=Math.ceil(RC.w*need);cn.height=Math.ceil(lh*need);
    const c=cn.getContext('2d'),t0=performance.now();c.setTransform(need,0,0,need,-RC.x0*need,-RC.y0*need);EnvLook.S[k].paint(c);if(SCENE_NIGHT[k])sceneNightLift(c,cn);
    if(!EnvLook.S[k].setLive){const G=setOf(k);if(G)setDraw(c,G,RC.x0,RC.w);}
    const B=sceneBandOf(cn,lh);L=SCENE_LY={k,v,cv:cn,sc:need,lh,ms:performance.now()-t0,foot:B.foot,top:B.top,bot:B.bot,gnd:sceneGrid(cn,lh)};SCENE_WARM.planned[k]=true;}
  return L;}
// How far a layer is painted (world y), read off a small copy of it: its foot, the lowest row painted across most of the floor's
// width, where the black under the place starts (render(), sk_ui.js); and the part of it that is not flat black by the audit's test
// (a row near black and flat), its top to its bottom, which a scene on an upright phone keeps its view inside (camCutFit,
// sk_storyui.js).
function sceneBandOf(cn,lh){const B={top:RC.y0,foot:H+40,bot:H+40};
  try{const w=96,h=Math.round(lh/2),c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d'),sx=cn.width/RC.w,u=lh/h;
    x.drawImage(cn,-RC.x0*sx,0,W*sx,cn.height,0,0,w,h);const d=x.getImageData(0,0,w,h).data;
    const lit=r=>{let s=0,q=0,n=0;for(let i=0;i<w;i++){const j=(r*w+i)*4;if(d[j+3]<=200)continue;const L=(.2126*d[j]+.7152*d[j+1]+.0722*d[j+2])/255;s+=L;q+=L*L;n++;}
      const mu=n?s/n:0;return n>w*.6&&(mu>=.035||Math.sqrt(Math.max(0,q/n-mu*mu))>=.006);};
    for(let r=h-1;r>0;r--){let n=0;for(let i=0;i<w;i++)if(d[(r*w+i)*4+3]>200)n++;if(n>w*.6){B.foot=RC.y0+(r+1)*u;break;}}
    for(let r=0;r<h;r++)if(lit(r)){B.top=RC.y0+r*u;break;}
    for(let r=h-1;r>0;r--)if(lit(r)){B.bot=Math.min(B.foot,RC.y0+(r+1)*u);break;}}catch(e){}
  return B;}
// A night sky that goes to black at its top is lifted toward a deep blue there instead (#0a0d1c at the layer's top, nothing added
// 240 units under it): an upright phone's wide view of a fight shows a great deal of sky, the layer's top row drawn on up over it
// (sceneDraw), and black there reads as nothing painted (the style guide's rule 1; the audit's empty). A sky already that light is
// left as it is.
function sceneNightLift(c,cn){try{const s=cn.width/RC.w,d=c.getImageData(0,0,cn.width,Math.max(1,Math.round(3*s))).data;let R=0,G=0,B=0,n=0;
    for(let i=0;i<d.length;i+=36){R+=d[i];G+=d[i+1];B+=d[i+2];n++;}if(!n)return;
    const a=[[10,R],[13,G],[28,B]].map(([t,v])=>Math.max(0,Math.round(t-v/n)));if(a[0]+a[1]+a[2]<4)return;
    c.save();c.globalCompositeOperation='lighter';const g=c.createLinearGradient(0,RC.y0,0,RC.y0+240);g.addColorStop(0,`rgba(${a.join(',')},1)`);g.addColorStop(1,`rgba(${a.join(',')},0)`);
    c.fillStyle=g;c.fillRect(RC.x0,RC.y0,RC.w,240);c.restore();}catch(e){}}
// the layer on the screen; a view that reaches above the layer (a phone with the fighters spread wide) gets the layer's top edge
// stretched up over it, and under a night sky the stars going on up in it
// A place can say how it goes on past the layer: upTile, so many units of the layer's top drawn on up over it again and again, each
// repeat a little darker (the lobby's coffers, the tunnel's vault: an upright phone's widest view of a fight sees a long way up);
// below(c, x0, x1, y0, y1), its floor run on under the layer's foot into the dark (else the page's dark, render() in sk_ui.js).
function sceneDraw(k,T){const L=sceneLayer(k),X=EnvLook.S[k];
  if(T-40<RC.y0){if(X.upTile)sceneUp(L,T-40,X.upTile);
    else{ctx.drawImage(L.cv,0,0,L.cv.width,2,RC.x0,T-40,RC.w,RC.y0-(T-40)+.5);if(SCENE_NIGHT[k])sceneStars(T-40,RC.y0+2);}}
  ctx.drawImage(L.cv,RC.x0,RC.y0,RC.w,L.lh);
  if(X.below){const B=T+cv.height*cam.viewW/Math.max(1,cv.width)+40;if(B>L.foot)X.below(ctx,RC.x0,RC.x0+RC.w,L.foot-1,B);}}
function sceneUp(L,T,h){const sh=Math.max(1,Math.round(h*L.sc)),top=RC.y0-h*6;
  for(let y=RC.y0-h;y+h>T;y-=h)ctx.drawImage(L.cv,0,0,L.cv.width,sh,RC.x0,y,RC.w,h+.6);
  const g=ctx.createLinearGradient(0,RC.y0,0,top);g.addColorStop(0,'rgba(3,3,6,0)');g.addColorStop(1,'rgba(3,3,6,.35)');ctx.fillStyle=g;
  ctx.fillRect(RC.x0,Math.max(T,top),RC.w,RC.y0-Math.max(T,top));if(T<top){ctx.fillStyle='rgba(3,3,6,.35)';ctx.fillRect(RC.x0,T,RC.w,top-T);}}
const SCENE_NIGHT={street:1,field:1,hill:1,ledge:1,wall:1,crops:1,roadblock:1,chase:1,roof:1};
// a field of faint stars, made once (300 by 200 units, on its own dice), laid as a repeat between y0 and y1
let SCENE_STARS=null;
function sceneStars(y0,y1){if(!SCENE_STARS){const s=2,cn=document.createElement('canvas');cn.width=300*s;cn.height=200*s;const c=cn.getContext('2d'),r=mulberry32(4401);
    for(let i=0;i<70;i++){const x=r()*300,y=r()*200,a=.18+r()*.45,z=r()<.85?1:1.7;c.fillStyle=`rgba(${r()<.7?'232,226,214':'200,212,255'},${a.toFixed(2)})`;c.fillRect(x*s,y*s,z*s,z*s);}
    SCENE_STARS={cv:cn,c:null,p:null};}
  const Z=SCENE_STARS;if(Z.c!==ctx){Z.c=ctx;Z.p=ctx.createPattern(Z.cv,'repeat');if(Z.p&&Z.p.setTransform)Z.p.setTransform(new DOMMatrix().scale(.5));}
  if(!Z.p)return;ctx.fillStyle=Z.p;ctx.fillRect(RC.x0,y0,RC.w,y1-y0);}
// ---------- the light on the fight (the style guide's rule 8) ----------
// The ground behind the fight band never measures under .2 and aims for .28, and it gets there by light: each place lays its key
// light over the floor the fight stands on and the wall behind it (EnvLook.S[k].set, an object, or a function of the moment where it
// changes with the story or the hour). It goes over the place's picture, under the floor's shadows and the people, in world units,
// in up to three passes shaped alike: more light on what is painted there (gain: colour-dodge in the key's colour, each surface so
// many times as light at full, the key's brightest channel the most, black left black); the key's light over it (soft: soft-light
// in its colour, the darks lifted most and the lights least, the paint's grain and its contrast kept: the main one); and a little
// light in the air (air: screen in its colour, the darks lifted a touch, so an arch or a doorway is not a hole). The shape: full
// from y1 to y2, fading to nothing at y0 above the fight and at y3 in front of it; along x0 to x1 an even base, brighter in each
// pool ([x, half width, 0..1]: a door's, a window's); a ground that scrolls repeats every P units, moved by ox().
// set: {col, gain, soft, air, y:[y0,y1,y2,y3], x:[x0,x1], base (0..1, default 1), pools, P, ox}
const SET_W=256,SET_H=40,SET_SPR=new Map();
const setSS=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
function setY(G){return G.y||[GB-330,GB-250,GB-40,GB+30];}
function setX(G){return G.P?[0,G.P]:G.x||[RC.x0,RC.x0+RC.w];}
// the shape at a point of the band: v down it (0 at y0, 1 at y3), x in world units
function setProf(G,x,y){const Y=setY(G),vy=y<Y[1]?setSS(Y[0],Y[1],y):y>Y[2]?1-setSS(Y[2],Y[3],y):1;if(vy<=0)return 0;
  const base=G.base??1;let px=base;if(G.pools)for(const [cx,w,k] of G.pools){let dx=Math.abs(x-cx);if(G.P){dx%=G.P;dx=Math.min(dx,G.P-dx);}if(dx<w){const t=dx/w,b=(1-t*t)*(1-t*t);px=Math.max(px,base+(1-base)*k*b);}}
  return vy*Math.min(1,px);}
// the key's colour as the dodge needs it: each channel's own gain, the brightest at G.gain
function setGains(G){const c=G.col,h=[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)/255),m=Math.max(...h,1e-3);return h.map(v=>1+((G.gain||1)-1)*v/m);}
// (made once for each colour, gain and shape: the dodge's in the key's colour at its gains, the soft light's and the air's one tint)
function setSprites(G){const key=G.col+'|'+(G.gain||1)+'|'+(G.base??1)+'|'+JSON.stringify(G.pools||0)+'|'+(G.P||0)+'|'+setY(G).join(',')+'|'+setX(G).join(',');
  let S2=SET_SPR.get(key);if(S2)return S2;if(SET_SPR.size>24)SET_SPR.clear();
  const X=setX(G),Y=setY(G),gs=setGains(G),cs=gs.map(g=>Math.round((1-1/g)*255)),kc=[1,3,5].map(i=>parseInt(G.col.slice(i,i+2),16)),mk=rgb=>{
    const cn=document.createElement('canvas');cn.width=SET_W;cn.height=SET_H;const c=cn.getContext('2d'),im=c.createImageData(SET_W,SET_H),d=im.data;
    for(let j=0;j<SET_H;j++){const y=Y[0]+(Y[3]-Y[0])*(j+.5)/SET_H;for(let i=0;i<SET_W;i++){const x=X[0]+(X[1]-X[0])*(i+.5)/SET_W,a=setProf(G,x,y),o=(j*SET_W+i)*4;
      d[o]=rgb[0];d[o+1]=rgb[1];d[o+2]=rgb[2];d[o+3]=Math.round(a*255);}}
    c.putImageData(im,0,0);return cn;};
  S2={dodge:G.gain>1?mk(cs):null,tint:mk(kc)};SET_SPR.set(key,S2);return S2;}
function setOf(k){const X=EnvLook.S[k],G=X&&X.set;const v=typeof G==='function'?G():G;return v&&v.col?v:null;}
// the passes on a canvas c in world units, over x L to L+VW (and its repeats)
function setDraw(c,G,L,VW){const S2=setSprites(G),X=setX(G),Y=setY(G),w=X[1]-X[0];
  const ox=G.P&&G.ox?G.ox():0,n0=G.P?Math.floor((L-ox-X[0])/w):0,n1=G.P?Math.floor((L+VW-ox-X[0])/w):0;
  c.save();
  for(const [spr,op,a] of [[S2.dodge,'color-dodge',1],[S2.tint,'soft-light',G.soft||0],[S2.tint,'screen',G.air||0]]){if(!spr||!(a>0))continue;c.globalCompositeOperation=op;c.globalAlpha=Math.min(1,a);
    for(let n=n0;n<=n1;n++){const x0=X[0]+ox+n*w,l=Math.max(L-8,x0),r=Math.min(L+VW+8,x0+w);if(r<=l)continue;
      const s0=(l-x0)/w*SET_W,s1=(r-x0)/w*SET_W;c.drawImage(spr,s0,0,Math.max(.5,s1-s0),SET_H,l,Y[0],r-l,Y[3]-Y[0]);}}
  c.restore();}
// Laid into the place's layer once, as it is painted (sceneLayer): a still place pays nothing a frame for it. A place whose ground is
// drawn as it moves (setLive: the tunnel's walls, the chase's street, the face of the tower in the fall) has it laid over each frame.
function sceneSet(k,L,VW){const X=EnvLook.S[k];if(!X||!X.setLive)return;const G=setOf(k);if(G)setDraw(ctx,G,L,VW);}
// The ground behind a figure, as light as it is drawn (for his rim, sk_figui.js): the layer read once when it is painted (its light
// laid in), on a grid of 10 units; a place whose ground the layer does not hold (it scrolls, or it is drawn as it moves) says how
// light it is itself (ground: a number or a function of the figure). Null where nothing is known.
function sceneGrid(cn,lh){try{const w=RC.w/10,h=Math.ceil(lh/10),c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
    g.drawImage(cn,0,0,cn.width,cn.height,0,0,w,lh/10);const d=g.getImageData(0,0,w,h).data,v=new Float32Array(w*h*3);
    for(let q=0;q<w*h;q++){v[q*3]=d[q*4]/255;v[q*3+1]=d[q*4+1]/255;v[q*3+2]=d[q*4+2]/255;}
    return{x0:RC.x0,y0:RC.y0,d:10,w,h,v};}catch(e){return null;}}
// a cell of the grid as the frame draws it: a light laid over each frame (setLive) worked in by the same sums the canvas makes
const softL=(cb,cs)=>{if(cs<=.5)return cb-(1-2*cs)*cb*(1-cb);const D=cb<=.25?((16*cb-12)*cb+4)*cb:Math.sqrt(cb);return cb+(2*cs-1)*(D-cb);};
function setLum(G,gs,kc,x,y,r,g,b){const p=G?setProf(G,x,y):0;if(p>0){const f=(cb,q)=>{let c1=cb;if(G.gain>1){const B=cb<=0?0:Math.min(1,cb*gs[q]);c1+=p*(B-c1);}
      if(G.soft>0)c1+=p*G.soft*(softL(c1,kc[q])-c1);if(G.air>0)c1+=p*G.air*kc[q]*(1-c1);return c1;};r=f(r,0);g=f(g,1);b=f(b,2);}
  return .2126*r+.7152*g+.0722*b;}
function sceneGround(f){const k=envKey(),X=k&&EnvLook.S[k];if(!X||!f||!f.p||!f.p[HEAD]||!f.p[FTF])return null;
  if(X.ground!=null)return typeof X.ground==='function'?X.ground(f):X.ground;
  const L=SCENE_LY,M=L&&L.k===k?L.gnd:null;if(!M)return null;const d=f.dep||0,cx=(f.p[PEL].x+f.p[CHE].x)/2+d*PSX,y1=Math.max(f.p[FTF].y,f.p[FTB].y)-d*PSY+8,y0=f.p[HEAD].y-d*PSY-12;
  const i0=clamp(Math.floor((cx-24-M.x0)/M.d),0,M.w-1),i1=clamp(Math.floor((cx+24-M.x0)/M.d),0,M.w-1),j0=clamp(Math.floor((y0-M.y0)/M.d),0,M.h-1),j1=clamp(Math.floor((y1-M.y0)/M.d),0,M.h-1);
  const G=X.setLive?setOf(k):null,gs=G?setGains(G):null,kc=G?[1,3,5].map(i=>parseInt(G.col.slice(i,i+2),16)/255):null,ox=G&&G.P&&G.ox?G.ox():0;
  let s=0,n=0;for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const q=(j*M.w+i)*3;s+=setLum(G,gs,kc,M.x0+i*M.d+5-ox,M.y0+j*M.d+5,M.v[q],M.v[q+1],M.v[q+2]);n++;}return n?s/n:null;}
// his rim on a dark ground: stronger the darker it is under .2, at most 1.8 times at .1 and under
function sceneRimK(f){const g=sceneGround(f);return g==null?1:1+.8*clamp((.2-g)/.1,0,1);}
// a piece of the layer drawn elsewhere (source and destination in world units): how the hidden lift's wall section, the lobby lift's
// leaves and the kitchen's back door move while looking exactly as the layer paints them
function sceneBlit(c,sx,sy,sw,sh,dx,dy,dw,dh){const L=SCENE_LY;if(!L||!L.cv.width)return false;const s=L.sc;
  c.drawImage(L.cv,(sx-RC.x0)*s,(sy-RC.y0)*s,sw*s,sh*s,dx,dy,dw,dh);return true;}
EnvLook.blit=sceneBlit;

// ---------- what moves in the rooms ----------
// the kitchen's back door swings in on its hinge as a henchman comes in from the alley: the night beyond, the rain, and the layer's
// own door drawn in strips across the leaf
function sceneBackDoor(){
  const o=crewDoorOpen('kitchen');if(o<.01)return;
  const far=KITCHEN.far,yB=prjY(GB,far),x0=694+far*PSX,x1=x0+62,top=yB-138,w=62*Math.cos(o*1.28),grow=o*10,t=S.t;
  ctx.save();ctx.beginPath();ctx.rect(x0,top,x1-x0,yB-top);ctx.clip();
  let g=ctx.createLinearGradient(0,top,0,yB);g.addColorStop(0,'#04060c');g.addColorStop(.7,'#090e18');g.addColorStop(1,'#0d121c');ctx.fillStyle=g;ctx.fillRect(x0,top,x1-x0,yB-top);
  // the far side of the alley: a wall with a lit window, the wet setts at its foot holding the window's light
  ctx.fillStyle='#06080e';ctx.fillRect(x0,top+18,x1-x0,yB-top-40);ctx.fillStyle='rgba(255,196,120,.55)';ctx.fillRect(x0+38,top+44,7,10);
  ctx.fillStyle='#0a0e17';ctx.fillRect(x0,yB-22,x1-x0,22);
  ctx.save();ctx.globalCompositeOperation='lighter';g=ctx.createLinearGradient(0,yB-22,0,yB);g.addColorStop(0,'rgba(255,190,120,0)');g.addColorStop(1,'rgba(255,190,120,.16)');ctx.fillStyle=g;ctx.fillRect(x0+34,yB-22,15,22);ctx.restore();
  ctx.fillStyle='#030407';ctx.fillRect(x0,yB-2,x1-x0,2);
  ctx.strokeStyle='rgba(190,210,255,.28)';ctx.lineWidth=.6;ctx.beginPath();
  for(let i=0;i<12;i++){const x=x0+((i*17+t*40)%62),y=top+((i*41+t*260)%(yB-top));ctx.moveTo(x,y);ctx.lineTo(x-1.4,y+7);}ctx.stroke();
  ctx.restore();
  if(w>1.5){const N=16,free=x0+w,fy0=top-grow,fy1=yB+grow*.6;
    for(let i=0;i<N;i++){const u0=i/N,u1=(i+1)/N,um=(u0+u1)/2,a=lerp(x0,free,u0),b=lerp(x0,free,u1),ty=lerp(top,fy0,um),by=lerp(yB,fy1,um);
      if(!sceneBlit(ctx,x0+u0*62,top,62/N,yB-top,a,ty,b-a+.35,by-ty)){ctx.fillStyle='#2a1a10';ctx.fillRect(a,ty,b-a+.35,by-ty);}}
    // the leaf turns from the room's light as it opens
    ctx.fillStyle=`rgba(0,0,0,${(.42*o).toFixed(3)})`;ctx.beginPath();ctx.moveTo(x0,top);ctx.lineTo(free,fy0);ctx.lineTo(free,fy1);ctx.lineTo(x0,yB);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,207,134,.3)';ctx.fillRect(free-.6,fy0,1.2,fy1-fy0);}
}
// the executive's doors: shut, they are the layer's own, with the line of light under them and the charge when it is planted; blown,
// the game's own drawing of the wrecked doorway and the office beyond
function sceneExecDoor(){
  const B=S.breach;if(B&&B.blown){drawExecDoor();return;}
  const far=LOBBY.far,W0=EXEC_DOOR.w,x0=EXEC_DOOR.x-W0/2+far*PSX,cx=EXEC_DOOR.x+far*PSX,yB=prjY(GB,far),S0=brSprites();
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.1+.05*Math.sin(S.t*1.7)+.03*Math.sin(S.t*5.3);ctx.drawImage(S0.shaft,x0+4,yB-2,W0-8,14);ctx.restore();
  if(B&&B.charge)drawCharge(B,cx,yB-BREACH.chargeH);}
const SCENE_LIVE={
  dining(){EnvLook.S.dining.live();},
  kitchen(){EnvLook.S.kitchen.live();drawSecretDoor();sceneBackDoor();},
  lobby(){EnvLook.S.lobby.live();sceneExecDoor();},
  office(){EnvLook.S.office.live();}};

// ---------- what breaks, in the scene's own materials ----------
// a broken table's planks and legs, by scene; the wall's fallen stone as blocks of its granite
const SCENE_TABLE={dining:['#3a2018','#24140e'],kitchen:['#8a6442','#141519'],lobby:['#8fa2ac','#a8843e'],office:['#3a2414','#24160c'],
  street:['#5a3a22','#141317'],field:['#5a3a22','#141317'],hill:['#5a3a22','#141317'],ledge:['#5a3a22','#141317'],wall:['#5a3a22','#141317']};
function sceneStone(sg,d){
  const a=P(sg.a.x,sg.a.y,d),b=P(sg.b.x,sg.b.y,d),L=Math.hypot(b.x-a.x,b.y-a.y)||1,r=mulberry32((sg.len*997+sg.w*131)|0),hl=L/2+sg.w*.32,hh=Math.max(2.4,sg.w*.32);
  const pts=[[-hl,-hh*(.6+r()*.4)],[-hl*.2,-hh],[hl*(.75+r()*.25),-hh*(.7+r()*.3)],[hl,hh*(.5+r()*.5)],[-hl*(.7+r()*.3),hh]];
  ctx.save();ctx.translate((a.x+b.x)/2,(a.y+b.y)/2);ctx.rotate(Math.atan2(b.y-a.y,b.x-a.x));
  const path=()=>{ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();};
  path();ctx.fillStyle=r()<.5?'#4c4740':'#57514a';ctx.fill();ctx.lineWidth=.9;ctx.strokeStyle='#1c1a18';ctx.stroke();
  ctx.strokeStyle='rgba(176,166,150,.45)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(pts[0][0]+.6,pts[0][1]+.6);ctx.lineTo(pts[1][0],pts[1][1]+.6);ctx.lineTo(pts[2][0]-.6,pts[2][1]+.6);ctx.stroke();
  ctx.restore();}
// the lobby's furniture breaks in its new materials: black leather, gold velvet, black velvet, Portoro, white marble; the office's club
// chair in cognac leather (the shapes of the pieces and what they hold are the game's own)
const SCENE_RECOL={lobby:{sofa:{'#5a1f2c':'#1e1a1c','#34111a':'#121012'},lounger:{'#5a1f2c':'#8a6a2c','#34111a':'#5e4a1e'},pouf:{'#5a1f2c':'#1c161a'},
    sidetable:{'#1c2233':'#161215'},planter:{'#6a7080':'#1a1517'},plinth:{'#aeb4c2':'#e2ddd2','#9aa0ae':'#d2ccbf','#c8ccd6':'#efebe3'}},
  office:{armchair:{'#6a2a28':'#7a4a26','#5a2422':'#6a3e1e'}}};
for(const room in SCENE_RECOL)for(const t in SCENE_RECOL[room]){const f=PROP_BREAK[t];if(!f)continue;
  PROP_BREAK[t]=(P0,piece,...rest)=>{const m=envKey()===room?SCENE_RECOL[room][t]:null;return f(P0,m?(a,b,w,col,o)=>piece(a,b,w,m[col]||col,o):piece,...rest);};}

// the office's desk: the scene draws it, under Mr. Hallowell's sword-cane (which the arms, loaded after this, lean on it)
{const dd=drawDesk;drawDesk=function(Pp,back){if(envKey()==='office'&&EnvLook.S.office.desk(Pp,back))return;return dd(Pp,back);};}

// ---------- textures made ahead ----------
// A scene makes its textures the first time it paints, and that is most of the time a first paint takes. The textures of the rooms still
// to come in a run are made ahead, one texture at a time while the player is choosing a move, so each room's layer paints quickly at the
// door. Which textures a room needs is found by painting it into a tiny canvas with stand-ins for the texture makers, noting each call.
const SCENE_TEX={EnvTex:['wood','marble','damask','plaster','silver','herringbone','brick','setts','flagstones','granite','awningCloth','subwayTiles','quarryTiles','copper','castIron','rug'],
  LobbyTex:['nero','greyStone','onyx','leather','velvet'],OfficeTex:['silk','goldLeaf','leather','travertine','canvasWeave'],OutTex:['meadow','lichenStone','pathEarth'],EnvTexB:['ashlar','paving','turf']};
function sceneTexNeeds(k){
  const libs={EnvTex,LobbyTex,OfficeTex,OutTex,EnvTexB},jobs=[],undo=[],stub=document.createElement('canvas');stub.width=stub.height=4;
  for(const ln in SCENE_TEX){const L=libs[ln];for(const nm of SCENE_TEX[ln]){const f=L[nm];if(typeof f!=='function')continue;undo.push([L,nm,f]);L[nm]=(...a)=>{jobs.push(()=>f(...a));return stub;};}}
  try{const cn=document.createElement('canvas');cn.width=32;cn.height=18;const c=cn.getContext('2d'),s=32/RC.w;c.setTransform(s,0,0,s,-RC.x0*s,-RC.y0*s);EnvLook.S[k].paint(c);}catch(e){}
  finally{for(const [L,nm,f] of undo)L[nm]=f;}
  return jobs;}
// Only the rooms still to come in this run: a ground chosen for a new fight paints its own while the fight is set up. Nothing is made in
// the first seconds after the page opens.
const SCENE_WARM={q:[],planned:{},at:0,from:(typeof performance!=='undefined'?performance.now():0)+4000};
function sceneWarmNext(){
  if(!SCENE_OK||S.classicLook||S.sceneOff||!S.arena)return;
  const g=S.game;if(!g||g.phase!=='input'||S.opening||(S.stage&&S.stage.tr))return;
  const now=performance.now();if(now<SCENE_WARM.from||now-SCENE_WARM.at<400)return;SCENE_WARM.at=now;
  if(!SCENE_WARM.q.length){
    const cur=envKey(),run=S.arena.indoor&&backroomOn()?['kitchen'].concat(deepOn()?['lobby','office']:[]):[],
      k=run.find(r=>!SCENE_WARM.planned[r]&&r!==cur&&EnvLook.S[r]);
    if(k){SCENE_WARM.planned[k]=true;SCENE_WARM.q=sceneTexNeeds(k);}return;}
  // a texture made already costs nothing to ask for again: keep going until one takes real time
  while(SCENE_WARM.q.length){const t0=performance.now();try{SCENE_WARM.q.shift()();}catch(e){}if(performance.now()-t0>6)break;}}

V11UI.init.push(()=>{
  if(!SCENE_OK)return;
  const _sky=drawSky,_floor=drawFloor,_room=drawRoom,_kl=kaelLight,_prop=drawProp,_lamp=drawLamp,_ware=drawWare,_table=drawTable,_div=drawDivSlice,_deb=drawDebrisPiece;
  drawSky=function(L,T,VW,VH){const k=envKey();if(!k)return _sky(L,T,VW,VH);sceneDraw(k,T);};
  // a scene's own foreground over the fighters (the wind on the roof, the station's hanging lamps and the freight cage's front)
  const _fx=drawFx;drawFx=function(){const k=envKey(),sc=k&&EnvLook.S[k];if(sc&&sc.fore){ctx.save();try{sc.fore(ctx);}catch(e){}ctx.restore();}_fx();};
  drawFloor=function(){const k=envKey();if(!k)return _floor();const sc=EnvLook.S[k];if(sc.live)sc.live();if(S.arena.wall)(sc.wall||drawWall)();sceneSet(k,cam.x-cam.viewW/2,cam.viewW);};
  drawRoom=function(L,T,VW,VH){const k=envKey();if(!k)return _room(L,T,VW,VH);sceneDraw(k,T);SCENE_LIVE[k]();sceneSet(k,L,VW);
    const lf=litFrac();if(lf<1){ctx.fillStyle=`rgba(8,3,14,${((1-lf)*.38).toFixed(3)})`;ctx.fillRect(L-40,T-40,VW+80,VH+80);}};
  // (the place's key light: where it is, its colour, and how much stronger his rim is on a dark ground there)
  kaelLight=function(f){const k=envKey(),sc=k&&EnvLook.S[k];if(!(sc&&sc.light))return _kl(f);const L=sc.light(f);return{light:L.light,dir:L.dir,col:L.col||null,rk:f&&f.body?sceneRimK(f):1};};
  drawProp=function(Pp){const k=envKey(),sc=k&&EnvLook.S[k];if(sc&&sc.prop&&sc.prop(Pp))return;_prop(Pp);};
  drawLamp=function(L){const k=envKey(),sc=k&&EnvLook.S[k];if(sc&&sc.lamp&&sc.lamp(L))return;_lamp(L);};
  drawWare=function(it){const k=envKey(),sc=k&&EnvLook.S[k];if(sc&&sc.ware&&sc.ware(it))return;_ware(it);};
  drawTable=function(){const k=envKey(),sc=k&&EnvLook.S[k];if(sc&&sc.table&&sc.table())return;_table();};
  drawDivSlice=function(it){const k=envKey(),sc=k&&EnvLook.S[k];if(sc&&sc.div&&sc.div(it))return;_div(it);};
  drawDebrisPiece=function(sg,d,col){const k=envKey();
    if(k&&col===STONE&&k==='wall'){sceneStone(sg,d);return;}
    if(k&&col===TABLE_COL&&SCENE_TABLE[k])col=SCENE_TABLE[k][sg.w>=6?0:1];
    _deb(sg,d,col);};
  // the hidden lift's wall section is the layer's own tiles, sliding aside
  const _slab=secretSlab;secretSlab=g=>{if(envKey()==='kitchen'&&sceneBlit(ctx,g.pl,g.ty0,g.pr-g.pl,g.yB-g.ty0,g.pl,g.ty0,g.pr-g.pl,g.yB-g.ty0))return;_slab(g);};
  V11UI.tick.push(sceneWarmNext);
});
