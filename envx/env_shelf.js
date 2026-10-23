// ===== ENV SHELF =====
// The Shelf market: a broad ledge halfway up the Pit's wall. Along the back the stalls stand against the rock under patched oilcloth
// tarps, each with its counter, its lamps hung at the front of the tarp, its sign on the frame, and its wares: the lamp oil man's cans
// and jugs, a funnel, a jug of good clear oil beside a cheap murky one; rice in sacks and salt in crocks; bolts of cloth and folded
// linen; the goblin's pump stall with its pipes, valves, gears and gaskets and a little vice; the knife-grinder's wheel and his salves
// in jars. Between the stalls the rock, doors cut into it, crates, a ladder up, a brazier with a kettle on it; rag bunting strung from
// pole to pole along the front of the tarps. The ledge is packed earth and stone, planked where it has worn through; its front edge is
// railed (the rail, with a lamp at each end, is drawn over the people in fore()), and past it the drop: the wall going on down under
// the ledge into the murk, its windows and fires, smoke coming up. Above the stalls the wall goes on up into the haze in walkways and
// shacks. At the right end a stair climbs the rock to the way on up, and a hoist on the ledge's corner lets a basket down over the
// edge; at both ends the wall turns away and the far side of the Pit shows across the gap. The stalls stand by where their keepers
// stand (the game's shelf.keepers.d, else 200), and the counters stand among the people (pieces), so a keeper is behind his and a
// buyer in front of it. live(): lamps, smoke, the bunting and the tarps' edges stirring.
(()=>{const E=EnvLook,{C,pp,poly,lin,rad,rgba,mix,glow,haze,stars,moon,rng,lerp,clamp,TAU}=E;const K=E.pitKit;
const L=()=>typeof ACT1_PLACES!=='undefined'&&ACT1_PLACES.shelf?ACT1_PLACES.shelf:null;
// the layout when the game's is not there (the painter run alone)
const L0={far:232,stalls:[{id:'oil',x:150,w:110,name:'Lamp oil'},{id:'grain',x:300,w:120,name:'Rice and salt'},{id:'linen',x:450,w:110,name:'Linen'},
    {id:'nim',x:610,w:130,name:'Pump stall'},{id:'grind',x:770,w:110,name:'Salves and a grinder'}],d:214,edge:{d:16},floor:{x0:40,x1:870,z0:40,z1:160}};
const Y=()=>L()||L0,stalls=()=>Y().stalls||L0.stalls,FD=()=>Y().far||L0.far,ED=()=>(Y().edge||L0.edge).d;
const Q=K.Q,jm=(a,b,t)=>K.jm(a,b,t);
// a stall in depth: its counter's front and back and its height, the tarp's front edge (depth, height) and its height at the rock, the
// poles at the front corners and how high they stand (the bunting is strung between their tops)
const ST={cf:182,cb:194,ch:42,tf:174,th:178,tb:206,pole:178,pt:228,gd:172};
// the stalls stand by where their keepers stand (the game's shelf.keepers.d, else 200): the counter just in front of a keeper, the
// poles and the tarp's front edge in front of that, the grinder's wheel out before them
const KD=()=>{const k=Y().keepers;return k&&k.d!=null?+k.d:200;};
function syncST(){const k=KD();ST.cf=k-18;ST.cb=k-6;ST.tf=k-26;ST.pole=k-22;ST.gd=k-28;}
// the ledge along the rock from x0 to x1 (the wall turns away past them), its front edge drawn in by `in` at each end
const LEDGE={x0:-70,x1:975,in:40};
// the stair up the rock at the right end (rising to the right from x0, n steps, then a landing and the way on up inside the rock), and
// the hoist on the ledge's front corner
const SR={x0:840,n:11,run:10,rise:9,d0:212,land:20},DK={x:930,d:30,h:132,arm:80};
// the words over each stall (a second, smaller line under some)
const SIGN={oil:['LAMP OIL'],grain:['RICE & SALT'],linen:['LINEN'],nim:['PUMPS','AND VALVES'],grind:['SALVES','KNIVES GROUND']};
const TARP={oil:'#4a3a24',grain:'#3e4a3a',linen:'#4a4250',nim:'#3a3a34',grind:'#4a3028'},SIGNC={oil:'#3a2416',grain:'#24302a',linen:'#2a2a3a',nim:'#2e2a22',grind:'#3a1e18'},
  PATCH=['#5a3020','#2e3e3a','#6a5a34','#3a2a3a'],BUNTC=['#6a4a3a','#4a5a6a','#7a6a4a','#5a3a3a','#6a6a5a'];
// the far side of the Pit (seen past both ends), the wall over the Shelf going up, and the wall going on down under the ledge
const FROWS={yBot:520,rs:46,u:.62,seed:83,span:420,shrink:.5,sspan:900},UROWS={yBot:96,rs:70,u:1.1,seed:71,span:300,shrink:.45,sspan:820},
  BROWS={yBot:620,rs:40,u:.72,seed:97,span:600,shrink:1,sspan:900};
let FAR={fires:[],chims:[],lit:[]},UPW={fires:[],chims:[],lit:[]},BEL={fires:[],chims:[],lit:[]},LAMPS=[],SMOKES=[],TOPS=[];
function key(){return'shelf:'+K.tod()+':'+KD();}
// the ledge's floor: its corners at the rock (left, right) and at the front edge (right, left)
function floorPts(){const f=FD(),e=ED();return[Q(LEDGE.x0,0,f),Q(LEDGE.x1,0,f),Q(LEDGE.x1-LEDGE.in,0,e),Q(LEDGE.x0+LEDGE.in,0,e)];}
// ---------- behind ----------
// the near wall's two edges where it turns away, the same each time they are drawn
let EDG=null;
// (under the ledge the rock turns away close by its ends, so the gap shows past them)
function edges(){const f=FD();if(EDG&&EDG.f===f)return EDG;const a=Q(LEDGE.x0,0,f),b=Q(LEDGE.x1,0,f),r=rng(5),R=[],Lf=[];
  for(let y=-1210;y<=700;y+=22){const k=clamp((y-a.y+30)/70,0,1);R.push([b.x+lerp(20+Math.sin(y*.03)*10,4,k)+r()*8,y]);Lf.push([a.x-lerp(20+Math.sin(y*.027)*10,4,k)-r()*8,y]);}
  return EDG={f,R,L:Lf};}
// (added to the path being built: the caller begins it)
function wallPath(c){const e=edges();e.L.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));for(let i=e.R.length-1;i>=0;i--)c.lineTo(e.R[i][0],e.R[i][1]);c.closePath();}
function edgeLines(c,P){const e=edges();c.strokeStyle=K.shade(P,'#4a423a');c.lineWidth=3;
  for(const side of [e.L,e.R]){c.beginPath();side.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();}
  c.strokeStyle=rgba(P.light,.05+.2*P.lightA);c.lineWidth=1;c.beginPath();e.R.forEach((p,i)=>i?c.lineTo(p[0]-1.6,p[1]):c.moveTo(p[0]-1.6,p[1]));c.stroke();}
// the murk of the Pit thickening downward from y0 over len: smoke and the dark, the glow of the floor's fires in it
function murk(c,P,X0,X1,y0,len){c.fillStyle=lin(c,0,y0,0,y0+len,[[0,rgba(P.air[1],0)],[.5,rgba(P.air[2],.5)],[1,rgba(jm(P.air[2],'#000000',.3),.88)]]);c.fillRect(X0,y0,X1-X0,660-y0);
  c.save();c.globalCompositeOperation='lighter';c.fillStyle=lin(c,0,y0+len*.3,0,y0+len*1.3,[[0,rgba('#ff8a4a',0)],[1,rgba('#ff8a4a',.05+.1*P.fire)]]);c.fillRect(X0,y0+len*.3,X1-X0,660-y0);c.restore();}
// the rows' lit windows set again over the haze and the murk, so they burn through it
function relight(c,list,k){for(const [x,y,w,h,ci,hz] of list){c.globalAlpha=k*(1-hz*.5);c.fillStyle=jm(K.WINC[ci],'#000000',.2);c.fillRect(x,y,w,h);}c.globalAlpha=1;}
// the strips past the near wall's two edges where the far side shows (the near wall covers the rest)
function strips(X0,X1){const e=edges(),mn=Math.min(...e.L.map(p=>p[0]))-2,mx=Math.max(...e.R.map(p=>p[0]))+2,f=FD();
  return[[X0,Math.max(mn,Q(LEDGE.x0,0,f).x+10)],[Math.min(mx,Q(LEDGE.x1,0,f).x-10),X1]];}
// the far side of the Pit across the gap, from y0 to y1: its air, its rows, the haze over them and the murk low down, the windows lit
// through it. Painted over the near wall in the two strips past its edges, kept off the wall by the clip.
function farSide(c,P,X0,X1,y0,y1,out){for(const [s0,s1] of strips(X0,X1)){c.save();c.beginPath();c.rect(s0,y0,s1-s0,y1-y0);c.clip();
    c.beginPath();c.rect(X0-10,y0-10,X1-X0+20,y1-y0+20);wallPath(c);c.clip('evenodd');
    c.fillStyle=lin(c,0,-110,0,560,[[0,P.air[0]],[.55,P.air[1]],[1,P.air[2]]]);c.fillRect(s0,y0,s1-s0,y1-y0);
    K.shackRows(c,Object.assign({pal:P,x0:s0,x1:s1,yTop:y0,clip:[y0,y1],out,winK:.9,pipes:1,slides:1},FROWS));
    c.fillStyle=lin(c,0,-110,0,560,[[0,rgba(P.air[0],.35)],[1,rgba(P.air[1],.25)]]);c.fillRect(s0,y0,s1-s0,y1-y0);
    if(y1>320){murk(c,P,s0,s1,320,220);relight(c,out.lit.filter(w=>w[1]>300),.45);}
    c.restore();}}
// what shows of a list of fires or chimneys: on the near wall (in) or past its edges
function onWall(list,inside){const [[,a],[b]]=strips(-170,W+250);return list.filter(o=>(o.x>a&&o.x<b)===inside);}
function backdrop(c,P,X0,X1,T0){
  // the near wall: rock; the walkways and shacks going up from over the stalls; under the ledge the wall going on down into the murk
  c.fillStyle=lin(c,0,T0,0,330,[[0,K.shade(P,P.wall,1)],[1,K.shade(P,'#2a2420',1.2)]]);c.fillRect(X0,T0,X1-X0,660-T0);
  UPW={fires:[],chims:[],lit:[]};K.shackRows(c,Object.assign({pal:P,x0:X0,x1:X1,yTop:T0,out:UPW,pipes:2},UROWS));
  BEL={fires:[],chims:[],lit:[]};K.shackRows(c,Object.assign({pal:P,x0:X0,x1:X1,yTop:440,clip:[440,660],out:BEL,winK:1.6,pipes:0,slides:0},BROWS));
  murk(c,P,X0,X1,452,150);relight(c,BEL.lit,.55);
  FAR={fires:[],chims:[],lit:[]};farSide(c,P,X0,X1,T0,660,FAR);
  UPW.fires=onWall(UPW.fires,true);UPW.chims=onWall(UPW.chims,true);BEL.fires=onWall(BEL.fires,true);FAR.fires=onWall(FAR.fires,false);
  edgeLines(c,P);}
// ---------- the ledge ----------
// its edges: the front, a beam along it, the joists' ends under it, the rock of the ledge broken off below; its right end, the rock
// going down seen from the side (its left end faces away), the edge of the floor lit along both
function front(c,P){const f=FD(),e=ED(),pts=floorPts(),F0=pts[0],F1=pts[1],B=pts[2],A=pts[3],r=rng(211),sh=(col,k)=>K.shade(P,col,k);
  {c.fillStyle=lin(c,0,F1.y,0,600,[[0,sh('#3e3832',1.15)],[.45,sh('#2a2622',1.3)],[1,jm(P.air[2],'#000000',.35)]]);
    c.beginPath();c.moveTo(B.x,B.y);c.lineTo(F1.x,F1.y);for(let y=F1.y+18;y<660;y+=18)c.lineTo(F1.x+(r()-.5)*6,y);c.lineTo(B.x,660);c.closePath();c.fill();
    c.save();c.clip();
    for(let k=1;k<14;k++){const hh=-k*15-r()*6,p=Q(LEDGE.x1-LEDGE.in,hh,e),q=Q(LEDGE.x1,hh,f),j=(r()-.5)*4;c.strokeStyle=rgba('#000000',.28);c.lineWidth=1;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(q.x,q.y+j);c.stroke();
      c.strokeStyle=rgba(P.light,.03+.1*P.lightA);c.beginPath();c.moveTo(p.x,p.y-1.2);c.lineTo(q.x,q.y+j-1.2);c.stroke();}
    for(let k=0;k<6;k++){const u=r(),x=lerp(B.x,F1.x,u),y0=lerp(B.y,F1.y,u)+10+r()*40;c.strokeStyle=rgba('#000000',.3);c.lineWidth=.8;c.beginPath();c.moveTo(x,y0);for(let s=1;s<5;s++)c.lineTo(x+(r()-.5)*6,y0+s*12);c.stroke();}
    c.fillStyle=lin(c,0,460,0,600,[[0,rgba(P.air[2],0)],[1,rgba(jm(P.air[2],'#000000',.3),.7)]]);c.fillRect(B.x-4,460,F1.x-B.x+12,200);
    c.restore();}
  // the front: the rock under the edge, its foot broken off
  c.fillStyle=sh('#2a2622',1.3);c.beginPath();c.moveTo(A.x,A.y);c.lineTo(B.x,B.y);c.lineTo(B.x,B.y+22);for(let x=B.x-14;x>A.x;x-=16)c.lineTo(x,A.y+11+r()*13);c.lineTo(A.x,A.y+15);c.closePath();c.fill();
  c.fillStyle=lin(c,0,A.y+4,0,A.y+26,[[0,rgba('#000000',0)],[1,rgba('#000000',.4)]]);c.fillRect(A.x,A.y+4,B.x-A.x,22);
  // the beam along the edge, the joists' ends under it
  c.fillStyle=sh('#33261a',1.2);c.fillRect(A.x,A.y,B.x-A.x,5.5);c.fillStyle=rgba('#000000',.4);c.fillRect(A.x,A.y+5.5,B.x-A.x,1);
  for(let x=A.x+14;x<B.x;x+=38){c.fillStyle=sh('#22180f',1.3);c.fillRect(x-2.6,A.y+6.5,5.2,4.6);c.fillStyle=rgba(P.light,.05+.12*P.lightA);c.fillRect(x-2.6,A.y+6.5,5.2,.8);}}
// the edges of the floor lit where the ledge stops, over the floor
function rims(c,P){const pts=floorPts(),F0=pts[0],F1=pts[1],B=pts[2],A=pts[3],lt=rgba(P.light,.1+.35*P.lightA);
  c.fillStyle=lt;c.fillRect(A.x,A.y-.5,B.x-A.x,1);c.beginPath();c.moveTo(B.x,B.y-.5);c.lineTo(F1.x,F1.y-.5);c.lineTo(F1.x,F1.y+.7);c.lineTo(B.x,B.y+.7);c.closePath();c.fill();
  c.strokeStyle=rgba('#000000',.5);c.lineWidth=1.4;c.beginPath();c.moveTo(F0.x-.6,F0.y);c.lineTo(A.x-.6,A.y);c.stroke();
  c.strokeStyle=lt;c.lineWidth=.8;c.beginPath();c.moveTo(F0.x+.6,F0.y);c.lineTo(A.x+.6,A.y);c.stroke();}
// its floor: packed earth and stone, flags laid in places, planks over the worn places; oil spilt by the oil stall, rice by the grain,
// shavings by the goblin's; the dark at the foot of the rock and along the near edge
function ledge(c,P){const f=FD(),e=ED(),r=rng(201),pts=floorPts(),S0=stalls(),find=id=>S0.find(t=>t.id===id);
  c.fillStyle=lin(c,0,pts[0].y,0,pts[2].y,[[0,P.dirt[0]],[1,P.dirt[1]]]);K.poly(c,pts);c.fill();
  c.save();K.poly(c,pts);c.clip();
  c.save();c.transform(1,0,PSX,-PSY,0,GB);
  const tx=typeof EnvTex!=='undefined'?EnvTex.plaster(59,128,128,{base:'#808080'}):null;
  if(tx){const pt=c.createPattern(tx,'repeat');if(pt.setTransform)pt.setTransform(new DOMMatrix().scale(.7,.35));c.globalCompositeOperation='multiply';c.globalAlpha=.5;c.fillStyle=pt;c.fillRect(-200,0,1400,f+20);c.globalCompositeOperation='source-over';c.globalAlpha=1;}
  for(let i=0;i<22;i++){const x=-60+r()*1020,d=e+14+r()*(f-50),w=18+r()*28,dd=9+r()*11;c.fillStyle=K.shade(P,['#3e3a36','#46423c','#36322e'][(r()*3)|0],1.2);c.globalAlpha=.4;c.fillRect(x,d,w,dd);c.globalAlpha=1;
    c.strokeStyle=rgba('#000000',.22);c.lineWidth=.6;c.strokeRect(x,d,w,dd);}
  for(const [x,d,w,n] of [[300,96,120,5],[606,58,104,4],[40,138,84,3]])for(let k=0;k<n;k++){const ww=w+((k*7)%3)*6-6;c.fillStyle=K.shade(P,['#3a2c20','#34281e','#3e3024'][k%3],1.1);c.fillRect(x,d+k*6.4,ww,5.8);
    c.fillStyle=rgba(P.light,.03+.1*P.lightA);c.fillRect(x,d+k*6.4+5.2,ww,.6);c.fillStyle=rgba('#000000',.4);c.fillRect(x,d+k*6.4-.6,ww,.6);}
  for(let i=0;i<600;i++){const x=-60+r()*1040,d=e+r()*(f-e);c.fillStyle=r()<.5?rgba('#000000',.1+.12*r()):rgba(P.light,.03+.06*r());c.fillRect(x,d,.8+r()*2,.6+r());}
  {const s=find('oil');if(s){c.fillStyle=rgba('#0a0806',.2);K.blob(c,s.x+6,ST.cf-26,34,16,rng(3));c.fill();c.fillStyle=rgba('#0a0806',.14);K.blob(c,s.x-14,ST.cf-34,18,9,rng(4));c.fill();}}
  {const s=find('grain');if(s){c.fillStyle=rgba('#e8e0cc',.3);for(let i=0;i<50;i++)c.fillRect(s.x-40+r()*80,ST.cf-30+r()*28,1,.7);}}
  {const s=find('nim');if(s){c.strokeStyle=rgba('#a8a090',.3);c.lineWidth=.6;c.beginPath();for(let i=0;i<26;i++){const x=s.x-40+r()*80,d=ST.cf-26+r()*24;c.moveTo(x+1.4,d);c.arc(x,d,1.4+r()*1.4,0,Math.PI*r());}c.stroke();}}
  c.fillStyle=rgba(P.light,.025+.05*P.lightA);c.fillRect(-60,56,1040,84);
  c.restore();
  c.fillStyle=lin(c,0,pts[0].y,0,pts[0].y+46,[[0,rgba('#000000',.4)],[1,rgba('#000000',0)]]);c.fillRect(-200,pts[0].y,1400,46);
  c.fillStyle=lin(c,0,pts[2].y-46,0,pts[2].y,[[0,rgba('#000000',0)],[1,rgba('#000000',.3)]]);c.fillRect(-200,pts[2].y-46,1400,46);
  c.restore();
  rims(c,P);}
// ---------- along the rock ----------
// the foot of the wall: rough rock in courses, cracks, damp; and in the gaps between the stalls a storeroom door and a brazier, crates
// and a coil of rope, a ladder up to the walkway over the stalls with a pipe beside it, a shut door
function between(c,P){const f=FD(),sh=(col,k)=>K.shade(P,col,k),r=rng(301),S0=stalls(),xa=LEDGE.x0,xb=LEDGE.x1;
  c.save();{const a=Q(xa,182,f),b=Q(xb,0,f);c.beginPath();c.rect(a.x,a.y,b.x-a.x,b.y-a.y);c.clip();}
  {const a=Q(xa,182,f),b=Q(xb,0,f);c.fillStyle=lin(c,0,a.y,0,b.y,[[0,sh('#34302c',1.1)],[1,sh('#24201c',1.3)]]);c.fillRect(a.x,a.y,b.x-a.x,b.y-a.y);
    const line=(hh,k,dy,col)=>{c.strokeStyle=col;c.beginPath();for(let x=xa;x<=xb;x+=20){const p=Q(x,hh+dy+Math.sin(x*.021+k*1.7)*4,f);x===xa?c.moveTo(p.x,p.y):c.lineTo(p.x,p.y);}c.stroke();};
    c.lineWidth=1;[24,58,96,134,168].forEach((hh,k)=>{line(hh,k,0,rgba(P.light,.03+.08*P.lightA));line(hh,k,-1.6,rgba('#000000',.25));});
    for(let i=0;i<14;i++){const p=Q(LEDGE.x0+r()*(LEDGE.x1-LEDGE.x0),20+r()*150,f);c.strokeStyle=rgba('#000000',.3);c.lineWidth=.8;c.beginPath();c.moveTo(p.x,p.y);let y=p.y;for(let s=0;s<4;s++){y+=6+r()*8;c.lineTo(p.x+(r()-.5)*8,y);}c.stroke();}
    for(let i=0;i<26;i++){const p=Q(LEDGE.x0+r()*(LEDGE.x1-LEDGE.x0),r()*170,f);c.fillStyle=rgba(r()<.5?'#000000':P.light,r()<.5?.1:.02+.05*P.lightA);c.fillRect(p.x,p.y,10+r()*26,2+r()*4);}}
  c.restore();
  const gaps=[];let x=LEDGE.x0+10;for(const s of S0){gaps.push([x,s.x-s.w/2]);x=s.x+s.w/2;}gaps.push([x,SR.x0]);
  gaps.forEach(([g0,g1],i)=>{const w=g1-g0;if(w<14)return;const cx=(g0+g1)/2;
    if(i===0){door(c,P,g0+38,30,96,true);wallLamp(c,P,g0+66,118);brazier(c,P,g1-26,f-28);}
    else if(i===2){// the ladder up the rock to the walkway, the pipe beside it
      const a=Q(cx,0,f-6),b=Q(cx+4,204,f);c.strokeStyle=sh('#463222');c.lineWidth=3;c.beginPath();c.moveTo(a.x-7,a.y);c.lineTo(b.x-7,b.y);c.moveTo(a.x+7,a.y);c.lineTo(b.x+7,b.y);c.stroke();
      c.lineWidth=2;c.beginPath();for(let hh=12;hh<204;hh+=14){const p=Q(cx+4*hh/204,hh,lerp(f-6,f,hh/204));c.moveTo(p.x-7,p.y);c.lineTo(p.x+7,p.y);}c.stroke();
      const pa=Q(g0+3,0,f),pb=Q(g0+3,300,f);c.fillStyle=sh('#2a201a');c.fillRect(pa.x-3,pb.y,6,pa.y-pb.y);c.fillStyle=rgba(P.light,.05+.2*P.lightA);c.fillRect(pa.x-2,pb.y,1,pa.y-pb.y);
      for(let hh=30;hh<300;hh+=46){const p=Q(g0+3,hh,f);c.fillStyle=sh('#1a1612');c.fillRect(p.x-4.4,p.y,8.8,2);}}
    else if(i===gaps.length-2&&w<60){door(c,P,cx,26,90,false);}
    else if(i<gaps.length-1){// crates stacked against the rock, a coil of rope, a water jar
      for(let k=0;k<3;k++){const bx=g0+4+(k%2)*10,bh=k*18;box(c,P,bx,f-24,Math.min(24,w-12),20,18,['#3a2c1e','#33271b','#3e3020'][k],bh);}
      if(i===1){const p=Q(g1-8,40,f-2);c.strokeStyle=sh('#6a5a3e');c.lineWidth=1.6;for(let k=0;k<3;k++){c.beginPath();c.ellipse(p.x,p.y+k*2,6,2.4,0,0,TAU);c.stroke();}}
      else{const p=Q(g1-8,0,f-12);c.fillStyle=sh('#6a4a32');c.beginPath();c.moveTo(p.x-6,p.y);c.quadraticCurveTo(p.x-10,p.y-14,p.x-4,p.y-22);c.lineTo(p.x+4,p.y-22);c.quadraticCurveTo(p.x+10,p.y-14,p.x+6,p.y);c.closePath();c.fill();
        c.fillStyle=K.topLit(P,'#6a4a32',.5);c.fillRect(p.x-4.4,p.y-24,8.8,2.4);c.fillStyle=rgba('#000000',.25);c.fillRect(p.x+2,p.y-20,3,18);}}});}
// a door cut into the rock: a timber frame, open on a lamp-lit storeroom, or shut
function door(c,P,x,w,h,open){const f=FD(),a=Q(x-w/2,h,f),e=Q(x+w/2,0,f),sh=(col,k)=>K.shade(P,col,k);
  c.fillStyle=sh('#22180f',1.2);c.fillRect(a.x-4,a.y-5,e.x-a.x+8,e.y-a.y+5);
  if(open){c.fillStyle=lin(c,0,a.y,0,e.y,[[0,'#3a1c0c'],[1,mix('#3a1c0c','#d0803a',.3+.4*P.lamp)]]);c.fillRect(a.x,a.y,e.x-a.x,e.y-a.y);c.fillStyle=rgba('#1a0c06',.6);c.fillRect(a.x+3,a.y+20,e.x-a.x-6,e.y-a.y-20);
    for(let k=0;k<3;k++){c.fillStyle=rgba('#4a3a28',.8);c.beginPath();c.ellipse(a.x+8+k*7,e.y-6,4,5,0,0,TAU);c.fill();}}
  else K.boards(c,a.x,a.y,e.x,e.y,{base:sh('#34271c',1.1),bw:6.5,seed:(x*3)|0,foot:8,pal:P,top:false});}
// a lamp on a bracket on the rock at world x, h up (its glow is live)
function wallLamp(c,P,x,h){const p=Q(x,h,FD());c.strokeStyle=K.shade(P,'#1a1612');c.lineWidth=1.4;c.beginPath();c.moveTo(p.x-8,p.y-14);c.lineTo(p.x,p.y-14);c.lineTo(p.x,p.y-10);c.stroke();K.lantern(c,P,p.x,p.y-10,1,true);LAMPS.push({x:p.x,y:p.y-4});}
// a box standing on the floor at (x, d) (z: lifted), w across, dd deep, h high
function box(c,P,x,d,w,dd,h,base,z){z=z||0;const sh=(col,k)=>K.shade(P,col,k),A=Q(x,z,d),B=Q(x+w,z,d),Bt=Q(x+w,z+h,d),At=Q(x,z+h,d),Ct=Q(x+w,z+h,d+dd),Dt=Q(x,z+h,d+dd),Cb=Q(x+w,z,d+dd);
  c.fillStyle=sh(base,1.5);K.poly(c,[B,Cb,Ct,Bt]);c.fill();c.fillStyle=K.topLit(P,base,.32);K.poly(c,[At,Bt,Ct,Dt]);c.fill();c.fillStyle=sh(base,1.15);K.poly(c,[A,B,Bt,At]);c.fill();
  c.strokeStyle=rgba('#000000',.4);c.lineWidth=.7;K.poly(c,[A,B,Bt,At]);c.stroke();c.beginPath();c.moveTo(A.x+1,A.y-1);c.lineTo(Bt.x-1,Bt.y+1);c.stroke();}
// the brazier by the storeroom door: its legs and bowl, the coals, a kettle on it (its steam and the glow are live), a stool by it
function brazier(c,P,x,d){const p=Q(x,0,d),s=Q(x+22,0,d+4),sh=(col,k)=>K.shade(P,col,k);
  c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(p.x,p.y,13,3,0,0,TAU);c.fill();
  c.strokeStyle=sh('#1a1816');c.lineWidth=1.6;c.beginPath();c.moveTo(p.x-8,p.y);c.lineTo(p.x-5,p.y-14);c.moveTo(p.x+8,p.y);c.lineTo(p.x+5,p.y-14);c.stroke();
  c.fillStyle=sh('#262220');c.beginPath();c.moveTo(p.x-11,p.y-22);c.lineTo(p.x+11,p.y-22);c.lineTo(p.x+7,p.y-13);c.lineTo(p.x-7,p.y-13);c.closePath();c.fill();
  c.fillStyle='#2a0c04';c.fillRect(p.x-10,p.y-24,20,2.6);c.fillStyle=rgba('#ff8a3c',.35+.4*P.fire);c.fillRect(p.x-8,p.y-24,16,1.6);
  c.fillStyle=sh('#2e2c2a');c.beginPath();c.ellipse(p.x+1,p.y-30,6.4,5.4,0,0,TAU);c.fill();c.fillRect(p.x+6,p.y-33,6,1.6);
  c.strokeStyle=sh('#1e1c1a');c.lineWidth=1;c.beginPath();c.arc(p.x+1,p.y-35,4,Math.PI,0);c.stroke();
  c.fillStyle=sh('#3a2c1e',1.1);c.fillRect(s.x-6,s.y-12,12,3);c.fillRect(s.x-5,s.y-9,2,9);c.fillRect(s.x+3,s.y-9,2,9);
  LAMPS.push({x:p.x,y:p.y-24,fire:1});SMOKES.push({x:p.x+3,y:p.y-38,s:3,sp:.12,n:6,h:110,dx:14,a:.4});}
// the stair cut up the rock at the right end: the flight rising to the right, its side toward us stone in courses, its treads worn, a
// rope rail on posts along its open side; at the top a landing and the dark arch of the way on up inside the rock, a lamp by it
function stair(c,P){const f=FD(),sh=(col,k)=>K.shade(P,col,k),{x0,n,run,rise,d0,land}=SR,xt=x0+n*run,ht=n*rise,xe=xt+land,r=rng(401);
  c.fillStyle=rgba('#000000',.25);K.poly(c,[Q(x0-6,0,d0-5),Q(xe+2,0,d0-5),Q(xe+2,0,f),Q(x0-6,0,f)]);c.fill();
  const prof=[Q(x0,0,d0)];for(let k=0;k<n;k++)prof.push(Q(x0+k*run,(k+1)*rise,d0),Q(x0+(k+1)*run,(k+1)*rise,d0));prof.push(Q(xe,ht,d0),Q(xe,0,d0));
  c.fillStyle=sh('#3a342e',1.2);K.poly(c,prof);c.fill();
  c.save();K.poly(c,prof);c.clip();c.strokeStyle=rgba('#000000',.3);c.lineWidth=.7;
  for(let hh=9,row=0;hh<ht;hh+=9,row++){const a=Q(x0,hh,d0),b=Q(xe,hh,d0);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);for(let x=x0+(row%2)*9;x<xe;x+=18+r()*6){const p=Q(x,hh,d0);c.moveTo(p.x,p.y);c.lineTo(p.x,p.y+9);}c.stroke();}
  {const t0=Q(0,ht,d0).y,t1=Q(0,0,d0).y;c.fillStyle=lin(c,0,t0,0,t1,[[0,rgba('#000000',0)],[1,rgba('#000000',.3)]]);c.fillRect(Q(x0,0,d0).x-2,t0,xe-x0+4,t1-t0);}
  c.restore();
  {const a=Q(xe,0,d0),b=Q(xe,ht,d0),e=Q(xe,ht,f),g=Q(xe,0,f);c.fillStyle=sh('#2e2a26',1.1);K.poly(c,[a,b,e,g]);c.fill();}
  for(let k=0;k<=n;k++){const xa=x0+k*run,xb=k<n?xa+run:xe,h=k<n?(k+1)*rise:ht;
    c.fillStyle=K.topLit(P,'#46403a',.5);K.poly(c,[Q(xa,h,d0),Q(xb,h,d0),Q(xb,h,f),Q(xa,h,f)]);c.fill();
    const a=Q(xa,h,d0),b=Q(xb,h,d0);c.fillStyle=rgba(P.light,.08+.3*P.lightA);c.fillRect(a.x,a.y-.6,b.x-a.x,1.1);
    if(k<n){const w0=Q(xa+run*.5,h,(d0+f)/2);c.fillStyle=rgba('#000000',.16);c.beginPath();c.ellipse(w0.x,w0.y,3,3.6,0,0,TAU);c.fill();}}
  // the arch at the top and its lamp
  {const m0=Q(xt+2,ht,f),m1=Q(xe-2,ht+46,f),cx=(m0.x+m1.x)/2,rw=(m1.x-m0.x)/2;c.fillStyle=sh('#26221e',1.2);c.beginPath();c.moveTo(m0.x-5,m0.y);c.lineTo(m0.x-5,m1.y+rw);c.arc(cx,m1.y+rw,rw+5,Math.PI,0);c.lineTo(m1.x+5,m0.y);c.closePath();c.fill();
    c.fillStyle='#0a0807';c.beginPath();c.moveTo(m0.x,m0.y);c.lineTo(m0.x,m1.y+rw);c.arc(cx,m1.y+rw,rw,Math.PI,0);c.lineTo(m1.x,m0.y);c.closePath();c.fill();
    for(let k=1;k<4;k++){c.fillStyle=jm(K.topLit(P,'#46403a',.4),'#0a0807',.25+k*.2);c.fillRect(m0.x+1,m0.y-k*7,m1.x-m0.x-2,1.6);}}
  wallLamp(c,P,xt-6,ht+44);
  // the rope rail on its posts
  {const at=[[0,x0+3],[4,x0+4*run+3],[8,x0+8*run+3],[n,xe-3]].map(([k,x])=>{const h=k<n?(k+1)*rise:ht;return[Q(x,h,d0+1),Q(x,h+32,d0+1)];});
    c.strokeStyle=sh('#2a1e14',1.1);c.lineWidth=2.4;c.beginPath();for(const [b,t] of at){c.moveTo(b.x,b.y);c.lineTo(t.x,t.y);}c.stroke();
    c.strokeStyle=sh('#6a5a40',.9);c.lineWidth=1;c.beginPath();for(let i=0;i+1<at.length;i++){const a=at[i][1],b=at[i+1][1];c.moveTo(a.x,a.y);c.quadraticCurveTo((a.x+b.x)/2,(a.y+b.y)/2+6,b.x,b.y);}c.stroke();}}
// the hoist on the ledge's front corner: a post braced on the floor, its jib out over the drop, the rope down past the edge to a
// basket, the winch at its foot
function derrick(c,P){const sh=(col,k)=>K.shade(P,col,k),{x,d,h,arm}=DK,b=Q(x,0,d),tip=Q(x+arm,h-6,d),bk=Q(x-16,h-10,d),hd=Q(x,h+18,d);
  c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(b.x,b.y,12,2.6,0,0,TAU);c.fill();
  c.strokeStyle=sh('#33251a',1.1);c.lineWidth=2.6;c.beginPath();{const f1=Q(x-18,0,d+2),f2=Q(x+5,0,d+12),m=Q(x,44,d);c.moveTo(f1.x,f1.y);c.lineTo(m.x,m.y);c.moveTo(f2.x,f2.y);c.lineTo(m.x,m.y);}c.stroke();
  c.fillStyle=sh('#3a2a1c',1.1);c.fillRect(hd.x-3,hd.y,6,b.y-hd.y);c.fillStyle=rgba(P.light,.06+.25*P.lightA);c.fillRect(hd.x-3,hd.y,1.2,b.y-hd.y);
  c.strokeStyle=sh('#3a2a1c',1.1);c.lineWidth=3.4;c.beginPath();c.moveTo(bk.x,bk.y);c.lineTo(tip.x,tip.y);c.stroke();
  c.strokeStyle=sh('#2a2420');c.lineWidth=.9;c.beginPath();c.moveTo(hd.x,hd.y);c.lineTo(tip.x,tip.y);c.moveTo(hd.x,hd.y);c.lineTo(bk.x,bk.y);c.stroke();
  c.fillStyle=sh('#2a2826');c.beginPath();c.arc(tip.x,tip.y+3,3.2,0,TAU);c.fill();
  const bs=Q(x+arm,-34,d);c.strokeStyle=sh('#7a6a50',.8);c.lineWidth=.9;c.beginPath();c.moveTo(tip.x+3,tip.y+3);c.lineTo(bs.x+3,bs.y-16);c.lineTo(bs.x-5,bs.y-11);c.moveTo(bs.x+3,bs.y-16);c.lineTo(bs.x+11,bs.y-11);c.stroke();
  c.fillStyle=sh('#5a4630');c.beginPath();c.moveTo(bs.x-6,bs.y-11);c.lineTo(bs.x+12,bs.y-11);c.lineTo(bs.x+10,bs.y);c.lineTo(bs.x-4,bs.y);c.closePath();c.fill();
  c.strokeStyle=rgba('#000000',.3);c.lineWidth=.6;c.beginPath();for(let k=1;k<4;k++){c.moveTo(bs.x-6+k*.5,bs.y-11+k*2.8);c.lineTo(bs.x+12-k*.5,bs.y-11+k*2.8);}c.stroke();
  const w=Q(x-10,16,d-8);c.fillStyle=sh('#2a2826');c.fillRect(w.x-9,w.y-5,18,10);c.fillStyle=sh('#6a5a40',.9);for(let k=0;k<6;k++)c.fillRect(w.x-7+k*2.6,w.y-4,1.4,8);
  c.strokeStyle=sh('#1a1816');c.lineWidth=1.4;c.beginPath();c.moveTo(w.x+9,w.y);c.lineTo(w.x+14,w.y-6);c.lineTo(w.x+17,w.y-6);c.stroke();
  c.strokeStyle=sh('#7a6a50',.8);c.lineWidth=.8;c.beginPath();c.moveTo(w.x,w.y-5);c.lineTo(tip.x-2,tip.y+1);c.stroke();}
// one stall: the back shelves and their wares, the poles, the tarp, the lamps, the sign (the counter is a piece: counterPiece)
function stall(c,P,s){const f=FD(),sh=(col,k)=>K.shade(P,col,k),x0=s.x-s.w/2,x1=s.x+s.w/2,r=rng(s.x*7+3);
  // the back: boards against the rock, two shelves
  {const a=Q(x0+2,ST.tb-6,f),e=Q(x1-2,0,f);K.boards(c,a.x,a.y,e.x,e.y,{base:sh('#34281e',1.2),bw:10,seed:s.x,foot:20,pal:P,top:false});
    for(const hh of [64,104]){const p=Q(x0+2,hh,f-2),q=Q(x1-2,hh,f-2);c.fillStyle=K.topLit(P,'#4a3a28',.5);c.fillRect(p.x,p.y-2,q.x-p.x,3.4);c.fillStyle=rgba('#000000',.4);c.fillRect(p.x,p.y+1.4,q.x-p.x,2);}}
  WARES[s.id]&&WARES[s.id](c,P,s,x0,x1,r);
  // the poles at the front corners (they go on up through the tarp: the bunting is strung between their tops)
  const poles=[x0+3,x1-3];
  for(const px of poles){const a=Q(px,0,ST.pole),b=Q(px,ST.th+4,ST.pole);c.fillStyle=sh('#2a1e14',1.1);c.fillRect(a.x-2.4,b.y,4.8,a.y-b.y);c.fillStyle=rgba(P.light,.06+.25*P.lightA);c.fillRect(a.x-2.4,b.y,1,a.y-b.y);
    c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(a.x,a.y,5,1.6,0,0,TAU);c.fill();}
  // the tarp: oilcloth over a frame from the rock out to the front poles, patched
  const tl=Q(x0-6,ST.tb,f),tr=Q(x1+6,ST.tb,f),fr=Q(x1+8,ST.th,ST.tf),fl=Q(x0-8,ST.th,ST.tf);
  K.oilcloth(c,[tl,tr,fr,fl],{pal:P,base:K.shade(P,TARP[s.id]||'#3e3a2a',.9),seed:s.x,sag:5,patch:PATCH.map(cc=>K.shade(P,cc,.9))});
  c.strokeStyle=rgba('#000000',.35);c.lineWidth=1;c.beginPath();c.moveTo(fl.x,fl.y);c.lineTo(fr.x,fr.y);c.stroke();
  for(const px of poles){const a=Q(px,ST.th+1,ST.pole),b=Q(px,ST.pt,ST.pole);c.fillStyle=sh('#2a1e14',1.1);c.fillRect(a.x-1.8,b.y,3.6,a.y-b.y);c.fillStyle=rgba(P.light,.06+.25*P.lightA);c.fillRect(a.x-1.8,b.y,.9,a.y-b.y);
    c.fillStyle=sh('#1e1610');c.fillRect(b.x-2.4,b.y-2,4.8,2.4);TOPS.push({x:b.x,y:b.y+1});}
  // the lamps hung from the front of the tarp (their glow is live)
  for(const px of [x0+12,x1-12]){const p=Q(px,ST.th-4,ST.tf+2);c.strokeStyle=sh('#1a1612');c.lineWidth=.8;c.beginPath();c.moveTo(p.x,p.y-6);c.lineTo(p.x,p.y+2);c.stroke();K.lantern(c,P,p.x,p.y+2,.9,true);LAMPS.push({x:p.x,y:p.y+9,pool:Q(px,0,ST.cf-16)});}
  // the sign: a board standing on the tarp's front frame, its words painted on
  {const lines=SIGN[s.id]||[(s.name||s.id).toUpperCase()],two=lines.length>1,bh=two?23:15,p=Q(s.x,ST.th+3,ST.tf),top=p.y-bh;
    c.font='700 11px "Alegreya SC", Georgia, serif';let tw=c.measureText(lines[0]).width;if(two){c.font='700 6.5px "Alegreya SC", Georgia, serif';tw=Math.max(tw,c.measureText(lines[1]).width);}tw+=14;
    c.fillStyle=sh('#1a1612');c.fillRect(p.x-tw/2+6,p.y-1,2.4,4);c.fillRect(p.x+tw/2-8.4,p.y-1,2.4,4);
    c.fillStyle=sh(SIGNC[s.id]||'#2a2018',1.1);c.fillRect(p.x-tw/2,top,tw,bh);c.strokeStyle=sh('#1a120c');c.lineWidth=1;c.strokeRect(p.x-tw/2,top,tw,bh);
    c.fillStyle=rgba(P.light,.06+.25*P.lightA);c.fillRect(p.x-tw/2,top-.5,tw,1);
    c.textAlign='center';c.textBaseline='middle';c.font='700 11px "Alegreya SC", Georgia, serif';c.fillStyle=jm(K.shade(P,'#e0d0a8',.5),P.light,.1);c.fillText(lines[0],p.x,top+8);
    if(two){c.font='700 6.5px "Alegreya SC", Georgia, serif';c.fillStyle=K.shade(P,'#c8b890',.6);c.fillText(lines[1],p.x,top+17.5);}}}
// what each stall shows on its back shelves and against its back (the counters' wares are the pieces')
const WARES={
  oil(c,P,s,x0,x1,r){const far=Y().far,sh=(col,k)=>K.shade(P,col,k);
    // cans on the shelves, a drum on a cradle with a tap
    for(const hh of [64,104])for(let x=x0+8;x<x1-10;x+=11+r()*3){const p=Q(x,hh,far-6),cc=['#5a5450','#6a4a2a','#4a5a5a','#7a3a22'][(r()*4)|0];c.fillStyle=sh(cc);c.fillRect(p.x-4,p.y-14,8,14);c.fillStyle=K.topLit(P,cc,.6);c.fillRect(p.x-4,p.y-15,8,2);c.fillStyle=rgba('#000000',.3);c.fillRect(p.x+2,p.y-14,2,14);}
    const p=Q(x0+24,20,far-14);c.fillStyle=sh('#3a2a1e');c.fillRect(p.x-14,p.y+6,4,14);c.fillRect(p.x+10,p.y+6,4,14);c.fillStyle=sh('#5a2418');c.beginPath();c.ellipse(p.x,p.y,18,11,0,0,TAU);c.fill();
    c.fillStyle=K.topLit(P,'#5a2418',.6);c.beginPath();c.ellipse(p.x-12,p.y,5,11,0,0,TAU);c.fill();c.fillStyle=sh('#2a2a2a');c.fillRect(p.x+16,p.y+2,6,3);c.fillRect(p.x+20,p.y+2,2,6);},
  grain(c,P,s,x0,x1,r){const far=Y().far,sh=(col,k)=>K.shade(P,col,k);
    // sacks piled against the back, a scale hanging, crocks on the shelf
    for(let k=0;k<5;k++){const p=Q(x0+14+k*18+(k>2?-44:0),k>2?30:0,far-12);c.fillStyle=sh(['#8a7a5a','#7a6a4a','#9a8a6a'][k%3]);c.beginPath();c.moveTo(p.x-10,p.y);c.quadraticCurveTo(p.x-12,p.y-26,p.x-4,p.y-30);c.lineTo(p.x+6,p.y-30);c.quadraticCurveTo(p.x+12,p.y-26,p.x+10,p.y);c.closePath();c.fill();
      c.fillStyle=rgba('#000000',.2);c.fillRect(p.x+3,p.y-26,4,26);c.fillStyle=sh('#5a3a22');c.fillRect(p.x-3,p.y-32,6,3);}
    for(let x=x0+10;x<x1-8;x+=14){const p=Q(x,104,far-6);c.fillStyle=sh('#6a6458');c.beginPath();c.moveTo(p.x-5,p.y);c.quadraticCurveTo(p.x-7,p.y-8,p.x-4,p.y-13);c.lineTo(p.x+4,p.y-13);c.quadraticCurveTo(p.x+7,p.y-8,p.x+5,p.y);c.closePath();c.fill();c.fillStyle=sh('#3a3630');c.fillRect(p.x-4,p.y-15,8,2.4);}
    const sp=Q(x1-24,130,far-20);c.strokeStyle=sh('#4a4440');c.lineWidth=.8;c.beginPath();c.moveTo(sp.x,sp.y-20);c.lineTo(sp.x,sp.y);c.moveTo(sp.x-12,sp.y);c.lineTo(sp.x+12,sp.y);c.moveTo(sp.x-12,sp.y);c.lineTo(sp.x-14,sp.y+12);c.moveTo(sp.x+12,sp.y);c.lineTo(sp.x+14,sp.y+12);c.stroke();
    c.fillStyle=sh('#5a5450');c.beginPath();c.ellipse(sp.x-13,sp.y+12,6,1.8,0,0,TAU);c.ellipse(sp.x+13,sp.y+12,6,1.8,0,0,TAU);c.fill();},
  linen(c,P,s,x0,x1,r){const far=Y().far,sh=(col,k)=>K.shade(P,col,k);
    // bolts on the shelves, seen end on; a length of cloth hanging from a rod at the side
    for(const hh of [64,104])for(let x=x0+9;x<x1-8;x+=12){const p=Q(x,hh+6,far-6),cc=['#c8bca0','#8a6a5a','#5a6a8a','#a8946a','#7a5a6a','#d8d0c0'][(r()*6)|0];c.fillStyle=sh(cc,.8);c.beginPath();c.arc(p.x,p.y-1,5.6,0,TAU);c.fill();
      c.strokeStyle=rgba('#000000',.3);c.lineWidth=.6;c.beginPath();c.arc(p.x,p.y-1,3,0,TAU);c.stroke();c.fillStyle=sh('#3a2a1e');c.beginPath();c.arc(p.x,p.y-1,1.2,0,TAU);c.fill();}
    const a=Q(x0+8,ST.th-12,ST.tf+12);c.strokeStyle=sh('#3a2a1e');c.lineWidth=1.6;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(a.x+26,a.y);c.stroke();
    for(let k=0;k<2;k++){c.fillStyle=sh(['#a8946a','#6a7a8a'][k],.7);c.beginPath();c.moveTo(a.x+2+k*12,a.y);c.lineTo(a.x+12+k*12,a.y);c.lineTo(a.x+13+k*12,a.y+70-k*12);c.lineTo(a.x+1+k*12,a.y+66-k*12);c.closePath();c.fill();c.fillStyle=rgba('#000000',.15);c.fillRect(a.x+6+k*12,a.y,1.4,60-k*12);}},
  nim(c,P,s,x0,x1,r){const far=Y().far,sh=(col,k)=>K.shade(P,col,k);
    // pipes racked across the back, valve wheels and gears on pegs, gaskets on a peg, a pump body standing on the floor
    for(let k=0;k<5;k++){const hh=120+k*8,a=Q(x0+6,hh,far-4),b=Q(x1-6,hh,far-4),cc=['#4a4a52','#5a4a3a','#3e3a3a','#6a5a4a'][k%4];c.strokeStyle=sh(cc);c.lineWidth=3.4;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x-k*6,b.y);c.stroke();
      c.strokeStyle=rgba(P.light,.08+.3*P.lightA);c.lineWidth=.7;c.beginPath();c.moveTo(a.x,a.y-1.2);c.lineTo(b.x-k*6,b.y-1.2);c.stroke();}
    for(let k=0;k<4;k++){const p=Q(x0+16+k*28,82,far-4),R=5+r()*5;c.strokeStyle=sh(k%2?'#5a2418':'#4a4a52');c.lineWidth=1.6;c.beginPath();c.arc(p.x,p.y,R,0,TAU);c.stroke();c.lineWidth=1;c.beginPath();
      if(k%2){for(let q=0;q<4;q++){const an=q*Math.PI/2;c.moveTo(p.x,p.y);c.lineTo(p.x+Math.cos(an)*R,p.y+Math.sin(an)*R);}}else{for(let q=0;q<10;q++){const an=q*TAU/10;c.moveTo(p.x+Math.cos(an)*R,p.y+Math.sin(an)*R);c.lineTo(p.x+Math.cos(an)*(R+2),p.y+Math.sin(an)*(R+2));}}c.stroke();c.fillStyle=sh('#2a2826');c.beginPath();c.arc(p.x,p.y,1.6,0,TAU);c.fill();}
    {const p=Q(x1-16,96,far-4);c.fillStyle=sh('#1a1a1c');c.fillRect(p.x-1,p.y-4,2,4);for(let k=0;k<5;k++){c.strokeStyle=sh('#141416');c.lineWidth=1.8;c.beginPath();c.ellipse(p.x,p.y+4+k*3,5-k*.3,1.6,0,0,TAU);c.stroke();}}
    {const p=Q(x0+18,0,far-16);c.fillStyle=sh('#3a3e44');c.fillRect(p.x-8,p.y-30,16,30);c.fillStyle=K.topLit(P,'#3a3e44',.6);c.fillRect(p.x-9,p.y-32,18,3);c.fillStyle=sh('#2a2c30');c.fillRect(p.x+8,p.y-24,10,4);c.fillStyle=rgba('#7a3a14',.4);c.fillRect(p.x-6,p.y-26,3,20);}},
  grind(c,P,s,x0,x1,r){const far=Y().far,sh=(col,k)=>K.shade(P,col,k);
    // salves in jars on the shelves, a strop and knives hung on the back
    for(const hh of [64,104])for(let x=x0+8;x<x1-8;x+=9){const p=Q(x,hh,far-6),cc=['#8a6a3a','#5a6a3a','#6a3a3a','#c8b890','#3a4a5a'][(r()*5)|0];c.fillStyle=rgba('#c8d8d8',.25);c.fillRect(p.x-3,p.y-9,6,9);c.fillStyle=sh(cc);c.fillRect(p.x-2.4,p.y-6,4.8,6);c.fillStyle=sh('#2a2018');c.fillRect(p.x-3.4,p.y-11,6.8,2.4);}
    for(let k=0;k<5;k++){const p=Q(x0+20+k*12,150,far-3);c.strokeStyle=sh('#8a8a90');c.lineWidth=1.4;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x+1,p.y+14+k%2*4);c.stroke();c.strokeStyle=sh('#3a2a1e');c.lineWidth=2.4;c.beginPath();c.moveTo(p.x,p.y-1);c.lineTo(p.x,p.y-8);c.stroke();}
    const sp=Q(x1-18,120,far-3);c.fillStyle=sh('#5a3a22');c.fillRect(sp.x-2,sp.y,4,36);}};
// ---------- the pieces among the people: the counters with their wares, the grinder's wheel ----------
function counterPiece(s){const P=K.pal(),x0=s.x-s.w/2+4,x1=s.x+s.w/2-4,h=s.id==='nim'?36:ST.ch,a=Q(x0-4,h+46,ST.cb),b=Q(x1+4,0,ST.cf-4);
  return K.piece('shelfcounter'+s.id+'|'+P.key+ST.cf,a.x-6,a.y,b.x-a.x+30,b.y-a.y+8,c=>{const sh=(col,k)=>K.shade(P,col,k),r=rng(s.x*11);
    // the counter: planks on two trestles, its front boarded
    c.fillStyle=rgba('#000000',.3);K.poly(c,[Q(x0-2,0,ST.cf-3),Q(x1+4,0,ST.cf-3),Q(x1+4,0,ST.cb+2),Q(x0-2,0,ST.cb+2)]);c.fill();
    const A=Q(x0,0,ST.cf),B=Q(x1,0,ST.cf),Bt=Q(x1,h,ST.cf),At=Q(x0,h,ST.cf);
    K.boards(c,At.x,At.y,B.x,B.y,{base:sh(s.id==='nim'?'#3a3430':'#3a2c20',1.1),bw:9,seed:s.x+1,foot:8,pal:P,top:false});
    c.fillStyle=sh('#22180f',1.4);K.poly(c,[B,Q(x1,0,ST.cb),Q(x1,h,ST.cb),Bt]);c.fill();
    c.fillStyle=K.topLit(P,'#4a3a2a',.6);K.poly(c,[Q(x0-3,h,ST.cf-2),Q(x1+3,h,ST.cf-2),Q(x1+3,h,ST.cb+1),Q(x0-3,h,ST.cb+1)]);c.fill();
    c.fillStyle=rgba('#000000',.4);c.fillRect(At.x-3,At.y,Bt.x-At.x+6,2);c.fillStyle=rgba(P.light,.08+.3*P.lightA);c.fillRect(At.x-3,At.y-1.5,Bt.x-At.x+6,.8);
    // what is set out on it
    const top=(x,dd)=>Q(x,h,dd||188);ON[s.id]&&ON[s.id](c,P,s,x0,x1,h,top,r);});}
const ON={
  oil(c,P,s,x0,x1,h,top,r){const sh=(col,k)=>K.shade(P,col,k);
    // the good oil: clear, the colour of honey, in a glass jug; the cheap: murky, in a dark one; a funnel, a measure, a can
    {const p=top(s.x-26,189);c.fillStyle=rgba('#d8e8e0',.3);c.beginPath();c.moveTo(p.x-8,p.y);c.quadraticCurveTo(p.x-10,p.y-14,p.x-4,p.y-18);c.lineTo(p.x-3,p.y-24);c.lineTo(p.x+3,p.y-24);c.lineTo(p.x+4,p.y-18);c.quadraticCurveTo(p.x+10,p.y-14,p.x+8,p.y);c.closePath();c.fill();
      c.fillStyle=rgba('#e8b04a',.85);c.beginPath();c.moveTo(p.x-7.4,p.y-1);c.quadraticCurveTo(p.x-9,p.y-11,p.x-6,p.y-13);c.lineTo(p.x+6,p.y-13);c.quadraticCurveTo(p.x+9,p.y-11,p.x+7.4,p.y-1);c.closePath();c.fill();
      c.fillStyle=rgba('#fff0c8',.7);c.fillRect(p.x-5,p.y-12,1.4,9);c.fillStyle=sh('#3a2a1e');c.fillRect(p.x-2.6,p.y-27,5.2,3);}
    {const p=top(s.x-6,189);c.fillStyle=sh('#2a2418');c.beginPath();c.moveTo(p.x-8,p.y);c.quadraticCurveTo(p.x-10,p.y-14,p.x-4,p.y-18);c.lineTo(p.x-3,p.y-24);c.lineTo(p.x+3,p.y-24);c.lineTo(p.x+4,p.y-18);c.quadraticCurveTo(p.x+10,p.y-14,p.x+8,p.y);c.closePath();c.fill();
      c.fillStyle=rgba('#4a3a1a',.6);c.fillRect(p.x-6,p.y-11,12,9);c.fillStyle=rgba('#000000',.3);c.fillRect(p.x+3,p.y-16,3,14);c.fillStyle=sh('#5a4a3a');c.fillRect(p.x-2.6,p.y-27,5.2,3);}
    {const p=top(s.x+18,190);c.fillStyle=sh('#6a6058');c.beginPath();c.moveTo(p.x-7,p.y-12);c.lineTo(p.x+7,p.y-12);c.lineTo(p.x+1.2,p.y-4);c.lineTo(p.x+1.2,p.y);c.lineTo(p.x-1.2,p.y);c.lineTo(p.x-1.2,p.y-4);c.closePath();c.fill();c.fillStyle=K.topLit(P,'#6a6058',.8);c.beginPath();c.ellipse(p.x,p.y-12,7,1.8,0,0,TAU);c.fill();}
    {const p=top(s.x+36,189);c.fillStyle=sh('#5a5450');c.fillRect(p.x-5,p.y-14,10,14);c.fillStyle=K.topLit(P,'#5a5450',.7);c.fillRect(p.x-5,p.y-15,10,2);c.fillStyle=sh('#2a2826');c.fillRect(p.x+1,p.y-19,3,4);}},
  grain(c,P,s,x0,x1,h,top,r){const sh=(col,k)=>K.shade(P,col,k);
    // salt in crocks, an open sack of rice at the counter's end with a scoop in it, a measure
    for(let k=0;k<3;k++){const p=top(x0+14+k*18,189);c.fillStyle=sh(['#6a6458','#5a5a54','#706a5e'][k]);c.beginPath();c.moveTo(p.x-7,p.y);c.quadraticCurveTo(p.x-10,p.y-10,p.x-6,p.y-16);c.lineTo(p.x+6,p.y-16);c.quadraticCurveTo(p.x+10,p.y-10,p.x+7,p.y);c.closePath();c.fill();
      c.fillStyle=rgba('#e8e4dc',.8);c.beginPath();c.ellipse(p.x,p.y-16,5.6,1.6,0,0,TAU);c.fill();c.fillStyle=rgba(P.light,.1+.3*P.lightA);c.fillRect(p.x-6,p.y-12,1.4,9);}
    {const p=top(x1-18,188);c.fillStyle=sh('#8a7a5a');c.beginPath();c.moveTo(p.x-13,p.y);c.quadraticCurveTo(p.x-15,p.y-14,p.x-11,p.y-20);c.lineTo(p.x+11,p.y-20);c.quadraticCurveTo(p.x+15,p.y-14,p.x+13,p.y);c.closePath();c.fill();
      c.fillStyle='#e8e2d2';c.beginPath();c.ellipse(p.x,p.y-20,11,3.4,0,0,TAU);c.fill();c.beginPath();c.ellipse(p.x,p.y-21.5,7,2.4,0,0,TAU);c.fill();
      c.strokeStyle=sh('#5a4430');c.lineWidth=1.6;c.beginPath();c.moveTo(p.x+2,p.y-22);c.lineTo(p.x+12,p.y-30);c.stroke();c.fillStyle=sh('#6a6058');c.beginPath();c.ellipse(p.x+1,p.y-21,3.6,1.6,0,0,TAU);c.fill();}},
  linen(c,P,s,x0,x1,h,top,r){const sh=(col,k)=>K.shade(P,col,k);
    // folded linen in stacks, a bolt laid out, the shears
    for(let k=0;k<3;k++){const p=top(x0+16+k*22,189),n=3+k%2*2;for(let q=0;q<n;q++){c.fillStyle=sh(q%2?'#d8d0c0':'#c8c0ae',.6);c.fillRect(p.x-9,p.y-3.4*(q+1),18,3.2);c.fillStyle=rgba('#000000',.12);c.fillRect(p.x-9,p.y-3.4*(q+1)+2.6,18,.6);}}
    {const p=top(x1-20,189);c.fillStyle=sh('#5a6a8a',.7);c.fillRect(p.x-16,p.y-6,30,6);c.fillStyle=sh('#4a5a7a',.7);c.beginPath();c.ellipse(p.x+14,p.y-3,3,3.4,0,0,TAU);c.fill();}
    {const p=top(s.x,184);c.strokeStyle=sh('#8a8a90');c.lineWidth=1;c.beginPath();c.moveTo(p.x-6,p.y-1);c.lineTo(p.x+6,p.y-3);c.moveTo(p.x-6,p.y-3);c.lineTo(p.x+6,p.y-1);c.stroke();}},
  nim(c,P,s,x0,x1,h,top,r){const sh=(col,k)=>K.shade(P,col,k);
    // the little vice clamped on, a valve in its jaws; gears and gaskets laid out; a tin of bolts
    {const p=top(x0+20,188);c.fillStyle=sh('#3a3e44');c.fillRect(p.x-8,p.y-6,16,6);c.fillRect(p.x-6,p.y-14,4,8);c.fillRect(p.x+2,p.y-14,4,8);c.fillStyle=K.topLit(P,'#3a3e44',.7);c.fillRect(p.x-8,p.y-7,16,1.4);
      c.strokeStyle=sh('#4a4a52');c.lineWidth=1.2;c.beginPath();c.moveTo(p.x+6,p.y-10);c.lineTo(p.x+16,p.y-10);c.stroke();c.fillStyle=sh('#5a2418');c.beginPath();c.arc(p.x,p.y-17,4,0,TAU);c.fill();c.fillStyle=sh('#2a2020');c.beginPath();c.arc(p.x,p.y-17,1.4,0,TAU);c.fill();}
    for(let k=0;k<4;k++){const p=top(s.x-12+k*14,186+(k%2)*4);c.strokeStyle=sh(k%2?'#141416':'#6a6a70');c.lineWidth=k%2?2:1.4;c.beginPath();c.ellipse(p.x,p.y-1.4,5,1.6,0,0,TAU);c.stroke();}
    {const p=top(x1-18,189);c.fillStyle=sh('#4a4644');c.fillRect(p.x-6,p.y-8,12,8);c.fillStyle=sh('#6a6a70');for(let q=0;q<5;q++)c.fillRect(p.x-5+q*2.2,p.y-10,1.4,2.4);}},
  grind(c,P,s,x0,x1,h,top,r){const sh=(col,k)=>K.shade(P,col,k);
    // salves in jars set out, knives laid in a row, a whetstone
    for(let k=0;k<4;k++){const p=top(x0+14+k*12,189),cc=['#8a6a3a','#5a6a3a','#6a3a3a','#c8b890'][k];c.fillStyle=rgba('#c8d8d8',.3);c.fillRect(p.x-4,p.y-10,8,10);c.fillStyle=sh(cc);c.fillRect(p.x-3.4,p.y-7,6.8,7);c.fillStyle=sh('#2a2018');c.fillRect(p.x-4.4,p.y-12,8.8,2.6);}
    for(let k=0;k<3;k++){const p=top(x1-30+k*9,184);c.strokeStyle=sh('#a8a8b0');c.lineWidth=1.2;c.beginPath();c.moveTo(p.x,p.y-1);c.lineTo(p.x+10,p.y-3);c.stroke();c.strokeStyle=sh('#3a2a1e');c.lineWidth=2.2;c.beginPath();c.moveTo(p.x-6,p.y);c.lineTo(p.x,p.y-1);c.stroke();}}};
// the knife-grinder's wheel: a stone on a frame with a treadle, a trough of water under it, standing out in front of his stall
function grinderPiece(s){const P=K.pal(),gx=s.x+s.w/2+8,gd=ST.gd,a=Q(gx-30,80,gd+10),b=Q(gx+30,0,gd-14);
  return K.piece('shelfgrinder|'+P.key+gd,a.x-6,a.y-4,b.x-a.x+20,b.y-a.y+10,c=>{const sh=(col,k)=>K.shade(P,col,k),cx=gx,p=Q(cx,0,gd);
    c.fillStyle=rgba('#000000',.3);c.beginPath();c.ellipse(p.x,p.y,26,6,0,0,TAU);c.fill();
    // the frame: two legs each side, the treadle
    c.strokeStyle=sh('#3a2a1c');c.lineWidth=3;c.beginPath();for(const [dx,dd] of [[-18,-8],[18,-8],[-18,8],[18,8]]){const f=Q(cx+dx,0,gd+dd),t=Q(cx+dx*.5,44,gd+dd*.6);c.moveTo(f.x,f.y);c.lineTo(t.x,t.y);}c.stroke();
    {const t0=Q(cx-20,6,gd-10),t1=Q(cx+14,14,gd-10);c.strokeStyle=sh('#4a3626');c.lineWidth=3;c.beginPath();c.moveTo(t0.x,t0.y);c.lineTo(t1.x,t1.y);c.stroke();}
    // the trough of water under the stone
    {const q=Q(cx,22,gd);c.fillStyle=sh('#3a2c20');c.fillRect(q.x-14,q.y-2,28,10);c.fillStyle=rgba('#8aa0a8',.35);c.fillRect(q.x-12,q.y-2,24,2);}
    // the stone: a wheel on its axle, seen face on, its rim worn bright
    const w=Q(cx,48,gd);c.fillStyle=sh('#6a645a');c.beginPath();c.arc(w.x,w.y,17,0,TAU);c.fill();c.strokeStyle=K.topLit(P,'#8a847a',.7);c.lineWidth=1.6;c.beginPath();c.arc(w.x,w.y,16,Math.PI*1.05,Math.PI*1.75);c.stroke();
    c.strokeStyle=rgba('#000000',.25);c.lineWidth=.6;c.beginPath();c.arc(w.x,w.y,11,0,TAU);c.stroke();c.fillStyle=sh('#2a2826');c.beginPath();c.arc(w.x,w.y,2.4,0,TAU);c.fill();
    c.strokeStyle=sh('#2a2826');c.lineWidth=2;c.beginPath();c.moveTo(w.x-20,w.y);c.lineTo(w.x+22,w.y);c.lineTo(w.x+24,w.y+6);c.stroke();});}
// (a counter goes down at its front's depth: its keeper, behind it, is drawn first; a buyer at the front of it after)
function pieces(){syncST();const out=[];for(const s of stalls()){out.push({d:ST.cf,draw:c=>K.drawPiece(c,counterPiece(s))});if(s.id==='grind')out.push({d:ST.gd,draw:c=>K.drawPiece(c,grinderPiece(s))});}return out;}
// ---------- the scene ----------
// the light: the lamps' pools on the floor before the counters, the daylight come down the Pit over the middle of the ledge
function lightPass(c,P){const pts=floorPts();c.save();K.poly(c,pts);c.clip();c.globalCompositeOperation='lighter';
  for(const L2 of LAMPS)if(L2.pool)K.cRad(c,L2.pool.x,L2.pool.y,4,46,'#ffb25e',.05+.07*P.lamp,.36);
  {const m=Q(450,0,110);K.cRad(c,m.x,m.y,20,520,P.light,.06,.4);}
  c.restore();}
function paint(c){syncST();const P=K.pal(),X0=-170,X1=W+250,T0=-110;LAMPS=[];SMOKES=[];TOPS=[];
  backdrop(c,P,X0,X1,T0);front(c,P);ledge(c,P);between(c,P);stair(c,P);for(const s of stalls())stall(c,P,s);derrick(c,P);lightPass(c,P);
  TOPS.sort((a,b)=>a.x-b.x);}
// ---------- the rail along the edge, over the people ----------
// posts and two rails, a sack hung over it to air, a lamp on a post at each end of the market
function fore(c){c=c||ctx;const P=K.pal(),e=ED()+2,sh=(col,k)=>K.shade(P,col,k),x0=LEDGE.x0+LEDGE.in-4,x1=LEDGE.x1-LEDGE.in+4,h=36;c.save();
  c.fillStyle=sh('#2a1e14',1.1);for(let x=x0;x<=x1;x+=46){const a=Q(x,0,e),b=Q(x,h+3,e);c.fillRect(a.x-2.2,b.y,4.4,a.y-b.y);}
  for(const [hh,lw] of [[h,3.2],[h-16,2]]){const a=Q(x0,hh,e),b=Q(x1,hh,e);c.strokeStyle=sh('#33251a',1.1);c.lineWidth=lw;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
  {const a=Q(x0,h,e),b=Q(x1,h,e);c.strokeStyle=rgba(P.light,.1+.4*P.lightA);c.lineWidth=.9;c.beginPath();c.moveTo(a.x,a.y-1.4);c.lineTo(b.x,b.y-1.4);c.stroke();}
  {const p=Q(232,h,e);c.fillStyle=sh('#6a5a3e');c.beginPath();c.moveTo(p.x-12,p.y-1);c.lineTo(p.x+12,p.y-1);c.lineTo(p.x+11,p.y+14);c.lineTo(p.x-10,p.y+12);c.closePath();c.fill();
    c.fillStyle=rgba('#000000',.25);c.fillRect(p.x-2,p.y,1.2,13);}
  for(const lx of [8,890]){const a=Q(lx,0,e),b=Q(lx,110,e);c.fillStyle=sh('#22180f',1.1);c.fillRect(a.x-2.6,b.y,5.2,a.y-b.y);c.strokeStyle=sh('#22180f');c.lineWidth=2;c.beginPath();c.moveTo(b.x,b.y+4);c.lineTo(b.x+14,b.y+4);c.lineTo(b.x+14,b.y+8);c.stroke();
    K.lantern(c,P,b.x+14,b.y+8,1.1,true);c.globalCompositeOperation='lighter';K.glowAt(c,b.x+14,b.y+16,11,'#fff0c8',.7*(.6+.4*P.lamp));K.glowAt(c,b.x+14,b.y+16,40,'#ffb25e',.24*(.6+.4*P.lamp));c.globalCompositeOperation='source-over';c.globalAlpha=1;}
  c.restore();}
// ---------- above the layer ----------
// the far side past the wall's edges, the wall going on up in walkways and shacks into the haze, the sky over the Pit's rim
function upperPaint(c,P,x0,x1,y0,y1){const X0=-170,X1=W+250;
  c.fillStyle=K.shade(P,P.wall,1);c.fillRect(x0,y0,x1-x0,y1-y0);
  K.shackRows(c,Object.assign({pal:P,x0:X0,x1:X1,yTop:-650,clip:[-650,y1],pipes:2},UROWS));
  farSide(c,P,X0,X1,-650,y1+1,{});
  edgeLines(c,P);
  c.fillStyle=lin(c,0,-640,0,-470,[[0,rgba(P.sky[1],.8)],[1,rgba(P.air[0],0)]]);c.fillRect(x0,-640,x1-x0,170);
  K.skyTop(c,x0,x1,y0,-636,P,{tower:-40});}
// ---------- what moves ----------
// smoke from the kettle and up the wall and out of the drop; the fires below and the lamps breathing; the tarps' torn valances and
// the bunting stirring in the draught that comes up the Pit
function live(){syncST();const t=S.t,P=K.pal();ctx.save();
  K.upper('shelf:'+P.key,-1000,(c,x0,x1,y0,y1)=>upperPaint(c,P,x0,x1,y0,y1));
  {const srcs=SMOKES.slice();for(const ch of UPW.chims.slice(0,6))srcs.push({x:ch.x,y:ch.y,s:2.6*(ch.s||1),sp:.08,n:5,h:60+50*(ch.s||1),dx:12,a:.4*(1-ch.hz*.6),ph:ch.x*.013});K.smoke(ctx,srcs,t,P.smoke,1);}
  {const pf=K.puffSpr(P.smoke);for(let q=0;q<4;q++){const u=(t*.04+q/4)%1,x=90+q*230+Math.sin(t*.3+q*2)*30,y=548-u*120,R=16+u*30;ctx.globalAlpha=.22*(1-u)*Math.min(1,u*4);ctx.drawImage(pf,x-R,y-R,R*2,R*2);}ctx.globalAlpha=1;}
  ctx.globalCompositeOperation='lighter';
  for(const L1 of [BEL.fires,FAR.fires,UPW.fires])for(const f of L1){const a=(.6+.4*Math.sin(t*9+f.x)*Math.sin(t*3.3+f.y))*P.fire*(1-(f.hz||0)*.6);K.glowAt(ctx,f.x,f.y-4*f.s,14*f.s,'#ff8a3c',.5*a);K.glowAt(ctx,f.x,f.y-3*f.s,4*f.s,'#ffd28a',.7*a);}
  for(const L2 of LAMPS){const k=.9+.1*Math.sin(t*7+L2.x)*Math.sin(t*2.3+L2.y);if(L2.fire){K.glowAt(ctx,L2.x,L2.y-4,22,'#ff8a3c',.45*k*P.fire+.15);continue;}
    K.glowAt(ctx,L2.x,L2.y,8,'#fff0c8',.7*k*(.55+.45*P.lamp));K.glowAt(ctx,L2.x,L2.y,24,'#ffb25e',.26*k*(.55+.45*P.lamp));}
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  // the valance along each tarp's front, torn into tongues
  for(const s of stalls()){const x0=s.x-s.w/2-8,x1=s.x+s.w/2+8,n=7;ctx.fillStyle=K.shade(P,TARP[s.id]||'#3e3a2a',1.2);ctx.beginPath();
    for(let k=0;k<=n;k++){const p=Q(lerp(x0,x1,k/n),ST.th,ST.tf);k?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y);}
    for(let k=n;k>=0;k--){const u=k/n,p=Q(lerp(x0,x1,u),ST.th,ST.tf);ctx.lineTo(p.x+Math.sin(t*1.6+u*5+s.x)*1.2,p.y+(k%2?7:9)+Math.sin(t*2.1+k)*.8);}ctx.closePath();ctx.fill();}
  // the bunting from pole top to pole top: the strings, then the rags a colour at a time
  {const nc=BUNTC.length,flags=[];ctx.lineWidth=.6;ctx.strokeStyle=K.shade(P,'#4a4038');ctx.beginPath();
    for(let i=0;i+1<TOPS.length;i++){const a=TOPS[i],b=TOPS[i+1],len=b.x-a.x;if(len<8)continue;const n=Math.max(2,Math.round(len/10)),sag=3+len*.06+Math.sin(t*.8+i)*.8,at=u=>lerp(a.y,b.y,u)+sag*4*u*(1-u);
      ctx.moveTo(a.x,a.y);for(let k=1;k<=10;k++){const u=k/10;ctx.lineTo(lerp(a.x,b.x,u),at(u));}
      for(let k=0;k<n;k++){const u=(k+.5)/n;flags.push([lerp(a.x,b.x,u),at(u),Math.sin(t*2.2+k*1.3+i*2.1)*1.2,(k+i*3)%nc]);}}
    ctx.stroke();
    for(let ci=0;ci<nc;ci++){ctx.fillStyle=K.shade(P,BUNTC[ci],.9);ctx.beginPath();for(const [x,y,sw,cc] of flags)if(cc===ci){ctx.moveTo(x-3.4,y);ctx.lineTo(x+3.4,y);ctx.lineTo(x+sw,y+8);ctx.closePath();}ctx.fill();}}
  ctx.restore();}
// the light that rims a man on the Shelf: the nearest of the stalls' lamps
function light(f){syncST();const px=f.p[PEL].x;let best=450,bd=1e9;for(const s of stalls())for(const x of [s.x-s.w/2+12,s.x+s.w/2-12]){const dd=Math.abs(x-px);if(dd<bd){bd=dd;best=x;}}
  const q=Q(best,ST.th-8,ST.tf+2);return{light:{x:q.x-f.dep*PSX,y:q.y+f.dep*PSY}};}
const LAYOUT={stall:ST,ledge:LEDGE,stair:SR,hoist:DK,signs:SIGN};
E.S.shelf={paint,live,fore,light,key,pieces,LAYOUT};
})();
// ===== ENV SHELF END =====
