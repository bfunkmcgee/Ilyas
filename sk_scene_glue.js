// ---------- the scenes in the game ----------
// Which scene is up: the ground's own outdoors, the room's indoors. None while S.classicLook or S.sceneOff is set, and none in a
// browser that cannot draw them (the headless checks have no Path2D or DOMMatrix), so the old drawing stays there.
const SCENE_OK=typeof Path2D==='function'&&typeof DOMMatrix==='function';
function envKey(){if(!SCENE_OK||S.classicLook||S.sceneOff||!S.arena)return null;const k=S.arena.indoor?(['kitchen','lobby','office'].includes(S.room)?S.room:'dining'):S.arenaKey;return EnvLook.S[k]?k:null;}
// One layer at a time, painted at the most the screen can need: the closest the camera comes (560 world units across on a phone, the
// whole width on a wider screen, less a tenth for the punch-in) at the screen's own resolution, up to 2.4 times the world's units as the
// rooms always were. It is painted again only for another scene or when the screen itself changes size.
let SCENE_LY=null;
function sceneScale(){return clamp(cv.width/((cssW<640?560:W)*.9)*1.12,1,2.4);}
// A scene whose still parts change with the story (the bistro's doors blown in) gives a key() that changes with them; a new key
// paints the layer again.
function sceneLayer(k){const need=sceneScale(),v=EnvLook.S[k].key?EnvLook.S[k].key():'';let L=SCENE_LY;
  if(!L||L.k!==k||L.v!==v||Math.abs(need/L.sc-1)>.15){if(L){L.cv.width=L.cv.height=0;SCENE_LY=null;}
    const cn=document.createElement('canvas');cn.width=Math.ceil(RC.w*need);cn.height=Math.ceil(RC.h*need);
    const c=cn.getContext('2d'),t0=performance.now();c.setTransform(need,0,0,need,-RC.x0*need,-RC.y0*need);EnvLook.S[k].paint(c);
    L=SCENE_LY={k,v,cv:cn,sc:need,ms:performance.now()-t0};SCENE_WARM.planned[k]=true;}
  return L;}
// the layer on the screen; a view that reaches above the layer (a phone with the fighters spread wide) gets the layer's top edge
// stretched up over it
function sceneDraw(k,T){const L=sceneLayer(k);
  if(T-40<RC.y0)ctx.drawImage(L.cv,0,0,L.cv.width,2,RC.x0,T-40,RC.w,RC.y0-(T-40)+.5);
  ctx.drawImage(L.cv,RC.x0,RC.y0,RC.w,RC.h);}
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
  drawFloor=function(){const k=envKey();if(!k)return _floor();const sc=EnvLook.S[k];if(sc.live)sc.live();if(S.arena.wall)(sc.wall||drawWall)();};
  drawRoom=function(L,T,VW,VH){const k=envKey();if(!k)return _room(L,T,VW,VH);sceneDraw(k,T);SCENE_LIVE[k]();
    const lf=litFrac();if(lf<1){ctx.fillStyle=`rgba(8,3,14,${((1-lf)*.38).toFixed(3)})`;ctx.fillRect(L-40,T-40,VW+80,VH+80);}};
  kaelLight=function(f){const k=envKey(),sc=k&&EnvLook.S[k];return sc&&sc.light?sc.light(f):_kl(f);};
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
