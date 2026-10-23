// ===== CAST UI =====
// The restaurant's people in Kael's Noir Gilt manner: the named enemies are elves, the crews that come through the doors are humans.
// Everyone is a dark figure lit along one edge, built from shaped pieces that ride the ragdoll's joints, like Kael. What sets an elf
// apart is light: eyes that glow in his or her own colour (the colour the game already gives them), a silk scarf in it, piping on
// tailored clothes, long ears and fine features. The humans have none of it: work clothes in dull browns and greys, round ears,
// heavier faces, caps and aprons, and plain eyes that catch the light without giving any.
// Act I's people of the Pit (sk_pitcastui.js) add their own parts to the tables here: an orc's and a goblin's heads, kerchiefs and
// hoods, and what they wear that the restaurant's people never did (a skirt, a bib, a shawl, a rope coil, a satchel, an armband,
// patches, goggles, tusks). Each is drawn only for someone whose look asks for it.
const CastLook=(()=>{
const PEL=0,CHE=1,HEAD=2,ELF=3,HAF=4,ELB=5,HAB=6,KNF=7,FTF=8,KNB=9,FTB=10,TIP=11;
const V=(x,y)=>({x,y}),add=(a,b)=>V(a.x+b.x,a.y+b.y),sub=(a,b)=>V(a.x-b.x,a.y-b.y),mul=(a,k)=>V(a.x*k,a.y*k),
  len=a=>Math.hypot(a.x,a.y),nrm=a=>{const l=Math.hypot(a.x,a.y)||1;return V(a.x/l,a.y/l);},perp=a=>V(-a.y,a.x),
  mix=(a,b,u)=>V(a.x+(b.x-a.x)*u,a.y+(b.y-a.y)*u),dot=(a,b)=>a.x*b.x+a.y*b.y,rot=(v,t)=>V(v.x*Math.cos(t)-v.y*Math.sin(t),v.x*Math.sin(t)+v.y*Math.cos(t)),
  cl=(v,a,b)=>Math.max(a,Math.min(b,v)),TAU=Math.PI*2;

// ---------- shapes (as in KaelLook) ----------
function smooth(Q,closed=true,t=.5,P=new Path2D()){
  const n=Q.length,g=i=>Q[closed?((i%n)+n)%n:cl(i,0,n-1)];P.moveTo(Q[0].x,Q[0].y);
  for(let i=0;i<(closed?n:n-1);i++){const p0=g(i-1),p1=g(i),p2=g(i+1),p3=g(i+2);
    P.bezierCurveTo(p1.x+(p2.x-p0.x)*t/3,p1.y+(p2.y-p0.y)*t/3,p2.x-(p3.x-p1.x)*t/3,p2.y-(p3.y-p1.y)*t/3,p2.x,p2.y);}
  if(closed)P.closePath();return P;}
function piece(Q,t=.5,lit=false){return FigKit.piece(Q,t,2,lit);}
function capsule(a,b,wa,wb){return FigKit.capsule(a,b,wa,wb);}
// (a point out of sight on a turned torso is flagged h; the points either side of it are too)
function resample(Q,per){const out=[],n=Q.length,g=i=>Q[cl(i,0,n-1)];
  for(let i=0;i<n-1;i++)for(let j=0;j<per;j++){const t=j/per,p0=g(i-1),p1=g(i),p2=g(i+1),p3=g(i+2),t2=t*t,t3=t2*t;
    const q=V(.5*(2*p1.x+(-p0.x+p2.x)*t+(2*p0.x-5*p1.x+4*p2.x-p3.x)*t2+(-p0.x+3*p1.x-3*p2.x+p3.x)*t3),.5*(2*p1.y+(-p0.y+p2.y)*t+(2*p0.y-5*p1.y+4*p2.y-p3.y)*t2+(-p0.y+3*p1.y-3*p2.y+p3.y)*t3));
    if(p1.h||p2.h)q.h=true;out.push(q);}
  out.push(Q[n-1]);return out;}
function unionOf(ps){if(ps.length===1)return ps[0].p;const U=new Path2D();for(const q of ps)U.addPath(q.p);return U;}
function mid(a,b,u){const h=x=>[1,3,5].map(i=>parseInt(x.slice(i,i+2),16)),A=h(a),B=h(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*u).toString(16).padStart(2,'0')).join('');}
function rgba(hex,a){const h=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));return`rgba(${h[0]},${h[1]},${h[2]},${a})`;}
function line(c,Q,col,w){if(Q.some(q=>q.h)){for(const R of FigKit.seen(Q))line(c,R,col,w);return;}c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(Q[0].x,Q[0].y);for(const q of Q.slice(1))c.lineTo(q.x,q.y);c.stroke();}

// ---------- the head, in its own frame: cranium centred on 0,0, facing +x, about 94 units crown to chin (Kael's frame) ----------
const R1=v=>Math.round(v*10)/10,Sp=p=>`${R1(p.x)},${R1(p.y)}`;
function smoothD(Q,closed=true,t=.5){const n=Q.length;let d=`M${Sp(Q[0])}`;const g=i=>Q[closed?(i+n)%n:Math.max(0,Math.min(n-1,i))];
  for(let i=0;i<(closed?n:n-1);i++){const p0=g(i-1),p1=g(i),p2=g(i+1),p3=g(i+2);
    d+=` C${Sp(V(p1.x+(p2.x-p0.x)*t/3,p1.y+(p2.y-p0.y)*t/3))} ${Sp(V(p2.x-(p3.x-p1.x)*t/3,p2.y-(p3.y-p1.y)*t/3))} ${Sp(p2)}`;}
  return d+(closed?' Z':'');}
const HP=a=>a.map(([x,y])=>V(x,y));
// skulls, nose to nape; eye: where the eye sits; brow: the brow line; jaw: the line of the jaw (for the human faces)
const SKULLS={
  elf:{pts:[[4,-37],[-18,-33],[-33,-18],[-37,2],[-33,20],[-25,36],[-10,40],[-3,44],[12,52],[29,57],[37,52],[38,46],[35,43],[39,39],[37,36.5],[41,33],[40,29.5],[50,24],[48,20],[37,3],[39,-3],[35,-20],[24,-31]],
    eye:[27.6,5.6],brow:'M12,-3.5 Q24,-10 37.5,-2.5'},
  hawk:{pts:[[4,-37],[-18,-33],[-33,-18],[-38,2],[-34,20],[-26,36],[-10,41],[-3,45],[13,54],[30,59],[39,54],[40,47],[36,43],[40,39.5],[37.5,37],[41.5,33.5],[41,30],[47,28.5],[51.5,24],[51,18],[47,10],[41,3],[42,-4],[36,-21],[24,-31]],
    eye:[29,6],brow:'M13,-4 Q26,-12 40,-4.5'},
  soft:{pts:[[4,-36],[-17,-32],[-32,-18],[-35,2],[-31,19],[-24,34],[-10,38],[-3,42],[11,49],[27,54],[34,50],[35,45],[33,42],[38,38.5],[35.5,36.2],[39,33],[37.5,30],[45,26],[44,21.5],[35,4],[37,-3],[34,-20],[24,-30]],
    eye:[26.5,6],brow:'M13,-3 Q24,-9.5 36,-3.5'},
  long:{pts:[[4,-38],[-18,-34],[-33,-19],[-36,2],[-32,21],[-24,38],[-9,43],[-2,47],[12,57],[28,63],[36,58],[37,51],[34,47],[38,43],[36,40.5],[40,37],[39,33],[49,27],[47,23],[36,4],[38,-3],[34,-21],[24,-32]],
    eye:[27,6],brow:'M12,-3.5 Q24,-10 37,-3'},
  brute:{pts:[[4,-36],[-19,-32],[-35,-17],[-39,3],[-35,22],[-27,38],[-11,43],[-3,47],[14,56],[31,60],[40,55],[41,47],[37,43],[41,39.5],[38.5,37],[42.5,33.5],[42,29],[48,26.5],[49,21],[40,4],[43,-4],[37,-20],[25,-31]],
    eye:[29,6.5],brow:'M13,-3 Q27,-11 42,-3.5'},
  old:{pts:[[4,-37],[-18,-33],[-33,-18],[-37,2],[-33,20],[-25,36],[-10,41],[-2,46],[10,55],[22,59],[32,57],[36,51],[35,45],[38,40],[36,37.5],[39,34],[39,31],[46,30],[51,26],[48,20],[37,3],[39,-3],[35,-20],[24,-31]],
    eye:[27.6,6.5],brow:'M12,-3 Q24,-8.5 37.5,-1.5'},
  human:{pts:[[2,-35],[-19,-32],[-34,-17],[-38,3],[-34,22],[-26,37],[-11,42],[-3,47],[14,56],[30,59],[39,55],[41,48],[37,44],[41,40],[38.5,37.5],[42,34],[41,30.5],[46.5,29],[49.5,24.5],[47,19],[40,6],[42,-3],[37,-19],[24,-30]],
    eye:[28.5,7],brow:'M13,-1 Q27,-8 41,-1',human:1},
  flat:{pts:[[2,-35],[-19,-32],[-34,-17],[-38,3],[-34,22],[-26,37],[-11,42],[-3,47],[15,57],[31,60],[40,56],[42,48],[37,44],[41,40],[38.5,37.5],[42,34],[42,30.5],[46,28],[46.5,22],[43,15],[40,5],[43,-3],[37,-19],[24,-30]],
    eye:[29,7],brow:'M13,-1 Q27,-7 42,-1.5',human:1},
  round:{pts:[[2,-34],[-19,-31],[-34,-16],[-38,4],[-34,23],[-27,38],[-12,44],[-4,50],[6,57],[18,61],[29,61],[37,56],[39,50],[36,45.5],[40,41.5],[37.5,38.8],[41,35.5],[40,31.5],[46,29],[47.5,24],[44,18.5],[38,5],[40,-3],[36,-19],[23,-30]],
    eye:[28,8],brow:'M13,0 Q26,-6 39,-.5',human:1},
  gaunt:{pts:[[3,-36],[-18,-33],[-33,-18],[-36,2],[-32,20],[-24,36],[-9,41],[-2,45],[12,54],[27,59],[35,55],[36,48],[33,44],[37,40],[35,37.5],[38,34],[38,31],[44,29],[48.5,23],[46,15],[38,4],[40,-3],[35,-20],[24,-31]],
    eye:[27,6],brow:'M12,-2 Q25,-8 39,-2',human:1}};
// ears: elves long or swept, Qadir's notched; humans round
const EARS={
  long:{d:smoothD(HP([[3,4],[-10,-3],[-30,-16],[-54,-32],[-43,-17],[-30,-1],[-19,16],[-8,30],[1,28]]),true,.48),inner:'M-5,8 Q-23,-4 -44,-25 Q-31,-8 -12,19'},
  swept:{d:smoothD(HP([[3,4],[-10,-1],[-28,-9],[-58,-19],[-44,-6],[-30,6],[-19,18],[-8,30],[1,28]]),true,.48),inner:'M-5,8 Q-24,-2 -48,-14 Q-30,2 -12,19'},
  short:{d:smoothD(HP([[3,4],[-9,-1],[-22,-10],[-40,-24],[-32,-9],[-24,5],[-16,18],[-7,30],[1,28]]),true,.48),inner:'M-5,8 Q-18,-1 -32,-17 Q-24,0 -11,19'},
  notched:{d:'M3,4 C-3,0 -16,-7 -21,-9 L-26,-8.5 L-28.5,-15 C-38,-21 -47,-27 -54,-32 C-50,-25 -36,-10 -30,-1 C-26,5 -22,11 -19,16 C-15,22 -12,28 -8,30 C-5,31 -1,30 1,28 Z',inner:'M-5,8 Q-23,-4 -44,-25 Q-31,-8 -12,19'},
  human:{d:smoothD(HP([[4,8],[-3,1],[-11,1],[-16,9],[-15,19],[-10,27],[-3,31],[3,28]]),true,.5),inner:'M-3,9 Q-11,8 -11,16 Q-10,22 -4,24',human:1}};
// the edge of the hair from the nape round the ear to the temple and the forehead (Kael's), and the human one round a round ear
const HAIRLINE_ELF=' Q-24,30 -14,14 Q-6,2 4,-2 Q8,-4 9,4 L13,5 Q14,-10 22,-18 Q28,-22 31,-19 Z';
const HAIRLINE_HUMAN=' Q-24,28 -20,14 Q-14,-3 2,-3 Q8,-4 9,5 L13,6 Q14,-10 22,-18 Q28,-22 31,-19 Z';
function hairPath(pts,human,closing){let d=`M${Sp(V(pts[0][0],pts[0][1]))}`;const Q=HP(pts);
  // a smooth run through the outline points, then the hairline back to the forehead
  for(let i=1;i<Q.length;i++){const a=Q[i-1],b=Q[i],c2=Q[Math.min(Q.length-1,i+1)],a0=Q[Math.max(0,i-2)],t=.45;
    d+=` C${Sp(V(a.x+(b.x-a0.x)*t/3,a.y+(b.y-a0.y)*t/3))} ${Sp(V(b.x-(c2.x-a.x)*t/3,b.y-(c2.y-a.y)*t/3))} ${Sp(b)}`;}
  return d+(closing||(human?HAIRLINE_HUMAN:HAIRLINE_ELF));}
// spiky hair (Kael's way): alternating tips and valleys
function spikyPath(pts,human){const Q=pts.map(([x,y,t])=>({x,y,t:!!t})),C0=V(-8,-8);let d=`M${Sp(Q[0])}`;
  for(let i=1;i<Q.length;i++){const a=Q[i-1],b=Q[i],m=mix(a,b,.5),seg=len(sub(b,a));let nn=nrm(perp(sub(b,a)));if(dot(nn,sub(m,C0))<0)nn=mul(nn,-1);
    const bulge=b.t?.13:a.t?-.09:0;d+=` Q${Sp(add(m,mul(nn,bulge*seg)))} ${Sp(b)}`;}
  return d+(human?HAIRLINE_HUMAN:HAIRLINE_ELF);}
// hair: 'cap' over the skull, 'back' behind it (long falls, tails, buns), strands for close views; tie: where a cord binds it
const SLICK=[[31,-19],[31,-27],[24,-36],[8,-41.5],[-12,-40],[-28,-31],[-38,-16],[-41.5,2],[-38,17],[-31,25]];
const HAIR={
  slick:{cap:hairPath(SLICK),strands:'M28,-27 Q8,-40 -26,-30 M26,-22 Q2,-33 -34,-14 M22,-17 Q-4,-24 -37,2'},
  topknot:{cap:hairPath(SLICK),strands:'M28,-27 Q8,-40 -26,-32 M24,-21 Q0,-32 -34,-16',
    back:smoothD(HP([[-4,-38],[-6,-50],[-14,-58],[-26,-56],[-32,-47],[-28,-38],[-40,-38],[-54,-30],[-62,-16],[-56,-20],[-46,-30],[-34,-33],[-22,-34]]),true,.5),
    tie:'M-6,-44 Q-16,-38 -27,-44 M-8,-48 Q-18,-42 -30,-48'},
  longfall:{cap:hairPath(SLICK),strands:'M28,-27 Q8,-40 -26,-31 M24,-21 Q-2,-31 -36,-12 M-42,8 Q-46,44 -38,80',
    back:smoothD(HP([[-26,-30],[-40,-16],[-46,8],[-48,36],[-46,62],[-40,84],[-30,92],[-22,86],[-24,64],[-24,40],[-22,24],[-28,10]]),true,.45)},
  lowtail:{cap:hairPath(SLICK),strands:'M28,-27 Q8,-40 -26,-31 M24,-21 Q-2,-31 -36,-12',
    back:smoothD(HP([[-36,14],[-44,30],[-48,52],[-46,74],[-40,88],[-36,76],[-36,54],[-30,34],[-28,22]]),true,.45),tie:'M-44,26 L-31,22 M-45,31 L-32,27'},
  pixie:{cap:spikyPath([[31,-19],[49,-9,1],[32,-28],[26,-44,1],[12,-41],[-2,-52,1],[-12,-42],[-30,-46,1],[-32,-30],[-48,-22,1],[-40,-10],[-48,4,1],[-38,10],[-38,24,1],[-30,22]]),
    strands:'M42,-12 Q30,-24 10,-34 M22,-40 Q8,-38 -8,-44'},
  platinum:{cap:hairPath(SLICK),strands:'M28,-27 Q8,-40 -24,-34 M24,-21 Q0,-32 -32,-24',
    back:smoothD(HP([[-12,-40],[-22,-50],[-38,-52],[-54,-44],[-64,-26],[-68,0],[-66,30],[-60,58],[-52,80],[-44,96],[-46,72],[-50,46],[-52,18],[-50,-6],[-44,-24],[-34,-34]]),true,.45),
    tie:'M-20,-50 Q-25,-40 -33,-44 M-24,-52 Q-29,-42 -37,-46'},
  crest:{cap:smoothD(HP([[27,-33],[26,-43],[12,-51],[-8,-51],[-24,-45],[-35,-33],[-36,-24],[-24,-35],[-6,-40],[12,-39],[23,-34]]),true,.4),strands:'M22,-40 L18,-46 M10,-44 L6,-50 M-2,-45 L-6,-51 M-14,-43 L-18,-49 M-24,-39 L-29,-45',shaved:1},
  quiff:{cap:hairPath([[31,-19],[46,-26],[44,-33],[32,-41],[14,-47],[-6,-47],[-22,-40],[-30,-30],[-30,-22]],false,' Q-22,-27 -10,-30 Q6,-31 18,-26 Q26,-22 31,-19 Z'),
    strands:'M42,-28 Q20,-42 -6,-44 M38,-30 Q16,-38 -18,-36',shaved:1},
  silver:{cap:hairPath([[20,-29],[16,-36],[6,-41.5],[-12,-40],[-28,-31],[-38,-16],[-41.5,2],[-38,17],[-31,25]],false,' Q-24,30 -14,14 Q-6,2 4,-2 Q8,-4 9,4 L13,5 Q12,-12 14,-22 Q16,-27 20,-29 Z'),
    strands:'M16,-33 Q0,-40 -26,-31 M14,-27 Q-6,-33 -34,-14'},
  // the humans
  crop:{cap:hairPath([[30,-22],[28,-31],[20,-38.5],[4,-41],[-14,-39],[-29,-29.5],[-37,-14],[-39.5,2],[-36,16],[-30,22]],true),strands:'M24,-32 Q4,-40 -24,-31'},
  sidepart:{cap:hairPath([[31,-21],[34,-30],[26,-39],[8,-43],[-12,-41],[-29,-31],[-38,-15],[-40,2],[-36,16],[-30,22]],true),strands:'M30,-30 Q8,-41 -24,-33 M26,-26 Q2,-34 -34,-15'},
  curly:{cap:spikyPath([[30,-22],[34,-31,1],[24,-35],[20,-44,1],[8,-41],[0,-48,1],[-10,-41],[-20,-46,1],[-26,-35],[-36,-35,1],[-36,-22],[-44,-14,1],[-39,-4],[-44,8,1],[-36,12],[-36,22,1],[-30,22]],true)},
  bald:{}};
// hats: crown and brim in the hat's own material; a band; the toque's pleats
const HATS={
  toque:{crown:smoothD(HP([[33,-29],[40,-52],[44,-78],[38,-98],[20,-110],[-2,-112],[-22,-106],[-36,-90],[-38,-64],[-34,-40],[-33,-28]]),true,.42),
    band:smoothD(HP([[36,-16],[37,-30],[-35,-26],[-38,-11]]),true,.25),pleats:'M24,-34 Q30,-70 22,-104 M6,-36 Q8,-74 2,-110 M-12,-34 Q-16,-72 -20,-106 M-26,-32 Q-32,-64 -34,-90',mat:'hat'},
  flatcap:{crown:smoothD(HP([[37,-20],[34,-31],[18,-44],[-4,-47],[-25,-39],[-38,-24],[-41,-7],[-31,-10],[-12,-21],[14,-24]]),true,.45),
    brim:smoothD(HP([[34,-22],[50,-19],[53,-15],[36,-15]]),true,.35),mat:'hat'},
  beanie:{crown:smoothD(HP([[34,-15],[34,-27],[24,-41],[4,-48],[-18,-45],[-34,-33],[-41,-15],[-41,-4],[-28,-8],[-8,-15],[14,-17]]),true,.45),
    band:smoothD(HP([[35,-15],[35,-23],[-41,-10],[-41,-3]]),true,.2),mat:'hat'},
  bandana:{crown:smoothD(HP([[33,-19],[32,-31],[22,-41],[2,-45],[-20,-41],[-36,-27],[-40,-9],[-30,-7],[-12,-15],[12,-18]]),true,.45),
    knot:smoothD(HP([[-36,-14],[-44,-17],[-52,-9],[-50,1],[-56,10],[-47,6],[-42,-2],[-34,-4]]),true,.45),mat:'hat'},
  seccap:{crown:smoothD(HP([[34,-17],[32,-31],[20,-42],[0,-46],[-20,-42],[-34,-28],[-38,-11],[-24,-14],[0,-18],[20,-19]]),true,.45),
    brim:smoothD(HP([[31,-19],[57,-15],[56,-10],[30,-13]]),true,.3),badge:[20,-30],mat:'hat'},
  skullcap:{crown:smoothD(HP([[32,-20],[31,-32],[17,-43],[-4,-45],[-22,-39],[-34,-25],[-37,-11],[-20,-16],[4,-21]]),true,.45),mat:'hat'}};
// beards and moustaches (the humans; Orrin's is the only elf's)
const BEARDS={
  full:smoothD(HP([[8,6],[13,18],[24,25],[36,29],[45,30],[44,36],[42.5,40],[44,48],[41,58],[30,65],[15,61],[2,52],[-4,42],[-2,30],[3,16]]),true,.45),
  short:smoothD(HP([[10,14],[16,24],[28,29],[42,30],[43,36],[41.5,40],[42.5,47],[39,56],[29,61],[15,58],[4,50],[1,40],[4,26]]),true,.45),
  moustache:smoothD(HP([[38,30.5],[45,29],[48,33],[44,35.5],[40,34.5]]),true,.4),
  goatee:smoothD(HP([[37,40],[41.5,40],[42.5,47],[39,56],[31,58],[33,50],[35,44]]),true,.45),
  chops:smoothD(HP([[8,6],[14,18],[22,28],[26,40],[18,46],[6,44],[0,34],[2,18]]),true,.45)};
let HPATH=null;const PATHS={};
function P2(d){return PATHS[d]||(PATHS[d]=new Path2D(d));}

// ---------- materials ----------
// the noir fill, with a colour table per person: the rim is the whole shape again, nudged toward the light, under the shape itself
const RIMMED={suit:1,skin:1,shoe:1,coat:1,lapel:1,shirt:1,vest:1,apron:1,hat:1,trouser:1,sleeve:1,chef:1,shawl:1,bag:1,rope:1,band:1};
// the materials the light is worked out for (FigKit.light), and as what (a person's colours can say otherwise: col.lit, as
// {coat:'leather'} for oilcloth, {skin:'gskin'} for a green skin)
const LIT={suit:'wool',coat:'wool',trouser:'wool',hat:'wool',vest:'wool',lapel:'satin',tie:'satin',scarfC:'satin',sashC:'satin',shirt:'cotton',sleeve:'cotton',apron:'cotton',
  chef:'cotton',chefPanel:'cotton',skin:'skin',shoe:'leather',glove:'leather',wrap:'leather',shawl:'wool',bag:'leather',rope:'cotton',band:'cotton'};
function paint(c,ps,mat,env){const C=env.col,base=(env.far&&C[mat+'Far'])||(env.far?mid(C[mat]||C.suit,'#3a3346',.32):C[mat])||C.suit,U=unionOf(ps),lit=(C.lit&&C.lit[mat])||LIT[mat],old=lit?ps.filter(q=>!FigKit.litOK(q,env)):ps;
  // (flat: what is on a turned torso, whose light its main shape carries)
  if(env.flat){c.fillStyle=base;c.fill(U);return;}
  if(RIMMED[mat]&&old.length){const a0=c.globalAlpha,dx=env.L.x*env.rw,dy=env.L.y*env.rw;c.globalAlpha=a0*(env.far?.4:1);c.translate(dx,dy);c.fillStyle=C.rim;c.fill(old.length===ps.length?U:unionOf(old));c.translate(-dx,-dy);c.globalAlpha=a0;}
  c.fillStyle=base;c.fill(U);
  if(lit&&base[0]==='#'&&base.length===7)FigKit.light(c,ps,env,{cls:lit,base,light:C.rim||'#ffcf86',far:env.far});}

// ---------- the coat's skirt (KaelLook's) ----------
const COAT={w:21,z:.8,vmax:1100,snap:110};
function coatTargets(an,fa,gy){
  return an.map((a,i)=>{const X0=a.p.x*fa,hemY=a.p.y+a.len*.82;let ext=null;
    for(const q of a.pts){if(q.y>hemY+6)continue;const X=q.x*fa;ext=ext==null?X:i?Math.min(ext,X):Math.max(ext,X);}
    const X=i?Math.min(X0-1.5,ext==null?X0:ext-a.clear):Math.max(X0+1.5,ext==null?X0:ext+a.clear);
    let dX=cl(X-X0,-a.len*.95,a.len*.95),y=a.p.y+Math.sqrt(a.len*a.len-dX*dX),x=(X0+dX)*fa;
    const fl=gy(x)-1;
    if(y>fl){const room=Math.max(0,fl-a.p.y),flat=Math.sqrt(Math.max(0,a.len*a.len-room*room)),spread=Math.min(flat,a.len*.22+flat*.25);
      dX=(i?-1:1)*Math.max(Math.abs(dX),spread);x=(X0+dX)*fa;y=Math.min(a.p.y+room,gy(x)-1);}
    return{x,y};});}
function coatStep(F,key,an,fa,gy,now){
  const tg=coatTargets(an,fa,gy),st=F[key];
  if(!st||!st.q||st.q.length!==2||tg.some((t,i)=>Math.hypot(t.x-st.q[i].x,t.y-st.q[i].y)>COAT.snap)){F[key]={t:now,q:tg.map(t=>({x:t.x,y:t.y,vx:0,vy:0}))};return F[key].q;}
  const dt=cl(now-(st.t??now),0,1/15);st.t=now;if(!(dt>0))return st.q;
  const n=Math.ceil(dt*120),h=dt/n,w=COAT.w,z=COAT.z;
  for(let k=0;k<n;k++)st.q.forEach((q,i)=>{const t=tg[i],a=an[i];
    q.vx+=(w*w*(t.x-q.x)-2*z*w*q.vx)*h;q.vy+=(w*w*(t.y-q.y)-2*z*w*q.vy)*h;
    const sp=Math.hypot(q.vx,q.vy);if(sp>COAT.vmax){q.vx*=COAT.vmax/sp;q.vy*=COAT.vmax/sp;}
    q.x+=q.vx*h;q.y+=q.vy*h;
    const dx=q.x-a.p.x,dy=q.y-a.p.y,d=Math.hypot(dx,dy),L=a.len*1.04;
    if(d>L){const kx=dx/d,ky=dy/d;q.x=a.p.x+kx*L;q.y=a.p.y+ky*L;const vr=q.vx*kx+q.vy*ky;if(vr>0){q.vx-=vr*kx;q.vy-=vr*ky;}}
    const fl=gy(q.x)-1;if(q.y>fl){q.y=fl;if(q.vy>0)q.vy=0;}});
  return st.q;}
function curveThrough(P,Q,t=.45){const n=Q.length,g=i=>Q[cl(i,0,n-1)];
  for(let i=0;i<n-1;i++){const p0=g(i-1),p1=g(i),p2=g(i+1),p3=g(i+2);
    P.bezierCurveTo(p1.x+(p2.x-p0.x)*t/3,p1.y+(p2.y-p0.y)*t/3,p2.x-(p3.x-p1.x)*t/3,p2.y-(p3.y-p1.y)*t/3,p2.x,p2.y);}}

// ---------- the people ----------
// an elf's colours from his or her own colour; a human's from the room's crew
function elfCol(accent,o={}){const dark=o.dark||'#0e0c14',tint=mid(dark,accent,.028);
  return Object.assign({suit:tint,suitFar:mid(tint,'#2b2238',.55),skin:'#100d16',skinFar:'#231b32',shoe:'#09080d',shoeFar:'#1d1629',shirt:mid('#0a090f',accent,.12),shirtFar:'#1d1629',
    lapel:mid('#1a1720',accent,.1),coat:mid('#0c0b11',accent,.06),coatFar:mid('#1e1729',accent,.08),trouser:tint,trouserFar:mid(tint,'#2b2238',.55),
    hair:'#e7e0cf',hairShade:'#a99c80',hairLine:'#8a7c60',hairHi:'#fffaea',rim:'#ffcf86',accent,accentShade:mid(accent,'#000000',.45),lining:mid(accent,'#000000',.25),
    eye:mid(accent,'#ffffff',.55),trim:accent,button:mid(accent,'#e2b65a',.35),hat:'#d8cdb6',hatShade:'#9f937c',
    tie:accent,square:accent,sashC:accent,sleeve:mid('#0a090f',accent,.12),vest:tint,apron:'#15120f',apronFar:'#272030',glove:'#141118',gloveFar:'#26202c',chef:tint,chefPanel:mid(tint,'#000000',.2),wrap:accent,scarfC:accent,scarfCFar:mid(accent,'#000000',.4)},o);}
function humanCol(o={}){
  return Object.assign({suit:'#17130f',suitFar:'#2a231d',skin:'#1d1512',skinFar:'#2c221d',shoe:'#0d0b09',shoeFar:'#221c17',shirt:'#3d362d',shirtFar:'#2c2721',
    lapel:'#211c17',coat:'#15120f',vest:'#16120e',vestFar:'#2a231d',trouser:'#1e1915',trouserFar:'#2e2721',apron:'#2a2622',apronFar:'#38332d',hat:'#2a241e',hatShade:'#1a1612',
    hair:'#2a211b',hairShade:'#1b1511',hairLine:'#4a3c30',hairHi:'#6a5848',rim:'#ffcf86',eye:'#9aa6b8',trim:null,button:'#6f6656',beard:'#231b15',
    sleeve:'#3d362d',tie:'#0e0c0a',braces:'#2c241d',chef:'#5e584e',chefPanel:'#6a6458',belt:'#120f0c',glove:'#15120f'},o);}

// ---------- the whole figure ----------
// F: a fighter. spec: who it is (CAST below). o: {light or dir, now, drawOther (the weapon), opening, yaw: turned about the upright
// axis (as KaelLook's: 0 is the profile the fights are drawn in), headYaw, spin (0..1, how far through a spin: a coat flares)}
// How wide a torso is across, up it ([a, half-width across]), for a turned view
function torsoWide(T,D){return[[-.17*T,11.6*D],[-.1*T,12.6*D],[0,12.8*D],[.2*T,11.6*D],[.4*T,10.9*D],[.55*T,11.8*D],[.72*T,13.2*D],[.86*T,14.6*D],[.97*T,15.2*D],[T+.4,11],[T+1.4,6],[T+2.6,4.8]];}
function tabAt(tab,a){let i=0;while(i<tab.length-2&&tab[i+1][0]<a)i++;const A=tab[i],B=tab[i+1],t=cl((a-A[0])/((B[0]-A[0])||1),0,1);return A.slice(1).map((v,j)=>v+(B[j+1]-v)*t);}
// The sections of a torso drawn round an outline (points [a, s] in order round it): at each height, from where the outline crosses it
// at the back to where it crosses it at the front, as wide across as wide() says; above or below the outline (the hips under a short
// vest), the body's own sections (body). So the outline's back edge is the line down the middle of his back, its front edge the line
// down his front, and turned, its two halves meet on them.
function torsoSecs(Jl,wide,body){let a0=1e9,a1=-1e9;for(const q of Jl){a0=Math.min(a0,q[0]);a1=Math.max(a1,q[0]);}
  const cross=a=>{let lo=1e9,hi=-1e9;for(let i=0;i<Jl.length;i++){const p=Jl[i],q=Jl[(i+1)%Jl.length];if((p[0]-a)*(q[0]-a)>0||p[0]===q[0])continue;const s=p[1]+(q[1]-p[1])*(a-p[0])/(q[0]-p[0]);lo=Math.min(lo,s);hi=Math.max(hi,s);}return lo<hi?[lo,hi]:null;};
  const as=[...new Set([...Jl.map(q=>q[0]),...wide.map(q=>q[0]),...body.map(q=>q[0])])].sort((x,y)=>x-y);
  return as.map(a=>{const e=a>a0+.01&&a<a1-.01?cross(a):null,B=tabAt(body,a);return[a,e?e[0]:B[0],e?e[1]:B[1],tabAt(wide,a)[0]];});}
// the body's own sections where no garment's outline says otherwise: [a, s at the back, s at the front]
function torsoBody(T,D){return[[-.25*T,-6.6,4.2],[-.17*T,-8.4,5.8],[-.1*T,-8.8*D,6.6*D],[0,-9.3*D,7.7*D],[.2*T,-7.6*D,7.7*D],[.4*T,-6.5*D,8.2*D],[.55*T,-7.3*D,9*D],
  [.72*T,-8.9*D,10*D],[.86*T,-8.8*D,9.2*D],[.97*T,-6.2,7.8*D],[T+.4,-4.4,5.2],[T+1.4,-3.3,3],[T+2.6,-2.6,1]];}
function draw(c,F,spec,o={}){
  const C=spec.col,out=spec.outfit,hd=spec.head,elf=spec.race==='elf',now=o.now??(F.t||0);
  const p0=F.p,fa=F.facing,b=F.body,tr=c.getTransform?c.getTransform():null,k=tr&&tr.a!=null?Math.hypot(tr.a,tr.b)||1:2;
  const P0=p0[PEL],C0=p0[CHE],u0=nrm(sub(C0,P0)),n0=mul(perp(u0),fa),T=len(sub(C0,P0)),sz=b.h*(.93+.07*b.bulk),wf=(.7+.3*b.bulk)*(elf?.96:1.04);
  const at=(a,s)=>add(add(P0,mul(u0,a)),mul(n0,s*sz*wf));
  const Ld=o.dir?nrm(o.dir):o.light?nrm(sub(o.light,mix(P0,C0,.5))):nrm(V(.5,-1));
  const env={k,fa,L:Ld,far:false,col:C,rw:Math.max(.9,1.25/k)*1.05,ow:Math.max(.55,1.05/k),planeMax:5.4*sz,litMin:3.1*sz};
  const lod=k<2.4?0:k<5?1:2;
  const gy=typeof F.gr==='function'?(x=>F.gr(x)):(x=>F.ground??(Math.max(p0[FTF].y,p0[FTB].y)+3));
  const pt=(ps,mat,far=false)=>{env.far=far;paint(c,ps,mat,env);env.far=false;};
  const lw=(.6+.4*b.bulk)*(elf?.96:1.04),W=w=>w*sz*lw;
  // ----- turned (a spin): as KaelLook's. Each joint has a place across the body, p is where each is seen, fv the way the figure
  // seems to face, dp how far toward the viewer a place is -----
  const yaw=+(o.yaw??F.yaw??0)||0,TN=Math.abs(Math.sin(yaw))>.015||Math.cos(yaw)<0;
  const onGrip=(P,td)=>{const h=P[HAB],a=sub(P[HAF],mul(td,9)),bq=P[TIP],ab=sub(bq,a),t=cl(dot(sub(h,a),ab)/(dot(ab,ab)||1),0,1);return len(sub(h,add(a,mul(ab,t))))<4.5;};
  const tipDir0=nrm(sub(p0[TIP],p0[HAF])),offOnGrip=onGrip(p0,tipDir0);
  const pxs=(P0.x+C0.x)/2,VW=TN?FigKit.view(pxs,fa,yaw):null,LS=12*sz*wf,LH=5.6*sz*wf,fwd=q=>cl((q.x-pxs)*fa/(.55*T),0,1);
  const lHF=LS*(1-.5*fwd(p0[HAF])),lEF=LS*(1-.15*fwd(p0[ELF])),lHB=offOnGrip?lHF:-LS*(1-.5*fwd(p0[HAB])),lEB=offOnGrip?0:-LS*(1-.15*fwd(p0[ELB]));
  const LAT=[0,0,0,lEF,lHF,lEB,lHB,LH,LH,-LH,-LH,lHF];
  const p=TN?p0.map((q,i)=>VW.at(q,LAT[i])):p0,fv=TN?VW.fv:fa,u=TN?nrm(sub(p[CHE],p[PEL])):u0;
  const dp=(q,l)=>TN?VW.dep(q,l):l;
  const across=(l,fn)=>{if(!TN){fn();return;}const cc=Math.abs(VW.c)<.07?(VW.c<0?-.07:.07):VW.c;c.save();c.translate(VW.px+fa*l*VW.s,0);c.scale(cc,1);c.translate(-VW.px,0);fn();c.restore();};
  const sh0=at(T-2.8,-.6),SH=TN?[VW.at(sh0,LS),VW.at(sh0,-LS)]:[sh0,sh0],HIP=TN?[VW.at(P0,LH),VW.at(P0,-LH)]:[P0,P0];
  const D=out.coat?1.07:1,base=torsoBase(spec,T,D),TAB=TN?torsoSecs(base.Q,torsoWide(T,D),torsoBody(T,D)):null,secAt=a=>tabAt(TAB,a);
  c.save();c.lineCap='round';c.lineJoin='round';

  // the scarf in his or her colour, or a braid, trails from the back of the neck behind everything
  if(spec.trail&&spec.trail.kind!=='braid'&&F.scarf&&F.scarf.length>2&&!F.severed)across(0,()=>trail(c,F,spec,env,now,sz));

  // ----- the arms -----
  const sleeveMat=out.sleeves==='jacket'?(out.top==='chef'?'chef':out.coat?'coat':'suit'):'sleeve';
  // an arm is one shape from the shoulder to the wrist, the shoulder's mass its rounded top (it turns with the upper arm and rides up
  // with a raised arm); the elbow gathers the sleeve inside and is pulled round outside
  const shoulderFor=(E,S)=>{const d=nrm(sub(E,S)),up=dot(d,u);return add(S,add(mul(u,cl(up,0,1)*1.5*sz),mul(d,.6*sz)));};
  // (out.forearm: a heavy forearm, thick at the elbow and swelling below it, for a rolled sleeve on someone who works with her hands)
  const FW=out.forearm||0,armW=FW?[W(4.25),W(3.2*(1+FW*.7)),W(2.55*(1+FW*.45))]:[W(4.25),W(3.2),W(2.55)],armB=FW?[.1,.05+FW*.9]:[.1,.05];
  const armParts=(E,H,S)=>{const fd=nrm(sub(H,E)),Wr=sub(H,mul(fd,3.6*sz)),S0=shoulderFor(E,S);
    const tb=FigKit.tube([S0,E,sub(Wr,mul(fd,.2*sz))],armW,{cap0:1.16,bulge:armB,gather:.34,stretch:.14,lite:lod===0});tb.pf=.55;
    // (the upper sleeve on its own, for a rolled sleeve, and the cuff are made when they are asked for)
    let up=null,cuff=null;return{tb,get up(){return up||(up=FigKit.tube([S0,E],[W(4.35),W(3.35)],{cap0:1.16,bulge:[.08],lite:lod===0}));},lo:tb,
      get cuff(){return cuff||(cuff=capsule(sub(Wr,mul(fd,.4*sz)),add(Wr,mul(fd,1*sz)),W(4.9),W(4.6)));},Wr,fd,H,E,S:S0};};
  const tipV=sub(p[TIP],p[HAF]),tipDir=!TN||len(tipV)>6?nrm(tipV):nrm(sub(p[HAF],p[ELF])),armed=F.wp?!F.wp.unarmed:!!(F.weaponKey&&F.weaponKey!=='unarmed');
  // a hand with weight to it: a full fist, the thumb's knuckle along the top of the grip
  const fist=(H,g,s)=>{const q=perp(g),kk=1.22,ptq=(a,bb)=>add(H,add(mul(g,a*s*kk),mul(q,bb*s*kk)));
    return piece([ptq(-3.2,-2.7),ptq(.4,-3.3),ptq(2.5,-3.7),ptq(3.9,-1.5),ptq(3.8,1.4),ptq(2.7,3),ptq(-2.8,3),ptq(-3.8,.2)],.55);};
  const foldCol={lit:rgba(C.rim||'#ffcf86',.24),dark:'rgba(0,0,0,.5)'},foldFar={lit:rgba(C.rim||'#ffcf86',.1),dark:'rgba(0,0,0,.28)',far:true};
  // (near: the arm on the near side, which holds the weapon; far: painted as the far side of him)
  const arm=(A,far,near)=>{
    if(out.sleeves==='bare'){pt([A.tb],'skin',far);pt([capsule(sub(A.Wr,mul(A.fd,2.2*sz)),add(A.Wr,mul(A.fd,.6*sz)),W(5.2),W(4.8))],'wrap',far);}
    else if(out.sleeves==='rolled'){const roll=capsule(mix(A.E,A.S,.12),mix(A.E,A.H,.12),W(7),W(6.6));
      pt([A.tb,capsule(sub(A.Wr,mul(A.fd,.4*sz)),add(A.Wr,mul(A.fd,1*sz)),W(4.6),W(4.4))],'skin',far);pt([A.up],'sleeve',far);pt([roll],'sleeve',far);}
    else{pt([A.tb],sleeveMat,far);FigKit.folds(c,A.tb,env,far?foldFar:foldCol);if(out.cuffs!==false)pt([A.cuff],out.gloves?'glove':'shirt',far);}
    // a rag tied round the upper arm (out.armband; C.band its colour): the band, and the knot behind the arm with its two ends
    if(out.armband&&near){const d=nrm(sub(A.E,A.S)),m0=mix(A.S,A.E,.44),m1=mix(A.S,A.E,.6),w=W(4.3);let q=perp(d);if(dot(q,V(-fv,0))<0)q=mul(q,-1);
      const kn=add(mix(m0,m1,.5),mul(q,w*.92));
      pt([piece([add(m0,mul(q,w)),add(mix(m0,m1,.5),mul(q,w*1.06)),add(m1,mul(q,w)),add(m1,mul(q,-w)),add(mix(m0,m1,.5),mul(q,-w*1.06)),add(m0,mul(q,-w))],.3),
        piece([add(kn,mul(d,-1.3*sz)),add(kn,mul(q,1.5*sz)),add(kn,mul(d,1.4*sz)),add(kn,mul(q,-.8*sz))],.5)],'band',far);
      if(lod>=1)pt([piece([kn,add(kn,V(-fv*1.6*sz,1.2*sz)),add(kn,V(-fv*2.8*sz,5.4*sz)),add(kn,V(-fv*1.4*sz,5*sz))],.4),piece([kn,add(kn,V(-fv*.4*sz,1.6*sz)),add(kn,V(fv*.4*sz,6.2*sz)),add(kn,V(fv*1.4*sz,5.6*sz))],.4)],'band',far);}
    const g=armed&&near?tipDir:(!near&&offOnGrip?tipDir:A.fd),s=sz*(near?1:.95);
    if(out.gloves&&C.glove)pt([fist(A.H,g,s)],'glove',far);else pt([fist(A.H,g,s)],'skin',far);};
  const farArm=far=>{arm(armParts(p[ELB],p[HAB],SH[1]),far,false);if(o.afterFarArm)across(LAT[HAB],()=>o.afterFarArm(F));};
  const nearArm=far=>{if(armed&&o.drawOther)across(LAT[HAF],()=>o.drawOther(F));
    const AF=armParts(p[ELF],p[HAF],SH[0]);arm(AF,far,true);
    if(elf&&lod>=1&&out.sleeves!=='rolled'&&C.trim){const q=perp(AF.fd),Wr=AF.Wr,e=sub(Wr,mul(AF.fd,1.3*sz));line(c,[add(Wr,mul(q,W(2.55))),add(e,mul(q,W(2.65))),sub(e,mul(q,W(2.65))),sub(Wr,mul(q,W(2.55)))],C.trim,Math.max(.45,.6/k));}};

  // ----- the legs -----
  // a leg is one shape from the hip to the ankle: the knee gathers the trouser behind it and pulls it round in front, the calf swells
  const legParts=(K,A,hip)=>{const sd=nrm(sub(A,K)),calf=dot(perp(sd),V(-fv,0))>0?1:-1,tb=FigKit.tube([hip,K,A],[W(6.1),W(4.2),W(3.4)],{gather:.3,stretch:.12,bulge:[.06,.16],bulgeSide:[0,calf],lite:lod===0});
    return{tb,th:tb,sh:tb};};
  const big=out.boots?1.12:1;
  const shoeOf=(K,A)=>{const sd=nrm(sub(A,K)),g=gy(A.x);let d;const planted=A.y>g-6&&Math.abs(Math.atan2(sd.x,sd.y))<.95;
    if(planted)d=V(fa,0);else{d=perp(sd);if(dot(d,n0)<0)d=mul(d,-1);}
    let w=perp(d);if(dot(w,sub(K,A))<0)w=mul(w,-1);const q=(a,bb)=>add(A,add(mul(d,a*sz),mul(w,bb*sz)));
    const Q=[q(-3.4*big,-3),q(-3.6*big,0),q(-1.6,2.2),q(2.4,1.4),q(6.4*big,-.4),q(9.6*big,-1.4),q(11.8*big,-2.5),q(11*big,-3.2),q(3,-3.3)];
    return{pc:piece(Q,.45,k>=2.4),Q,w,boot:out.boots?capsule(mix(K,A,.62),add(A,mul(w,1.2*sz)),W(8.6),W(7.8)):null,toe:q(9*big,-1.6),d};};
  // turned: the outline round the shoe's profile set out either side of the foot; a boot's shaft round the shin as it is seen
  const shoeAt=(kn,ft,l)=>{const S0=shoeOf(p0[kn],p0[ft]);if(!TN)return S0;const pts=[];for(const q of S0.Q)for(const w of [-2.4*sz,2.4*sz])pts.push(VW.at(q,l+w));
    const K=p[kn],A=p[ft];return{pc:piece(FigKit.hull(pts),.4,k>=2.4),boot:out.boots?capsule(mix(K,A,.62),add(A,V(0,-1.2*sz)),W(8.6),W(7.8)):null};};
  const leg=(kn,ft,side,far)=>{const L=legParts(p[kn],p[ft],HIP[side>0?0:1]),S=shoeAt(kn,ft,side*LH);
    pt([S.pc],'shoe',far);pt([L.tb],'trouser',far);FigKit.folds(c,L.tb,env,far?foldFar:foldCol);if(S.boot)pt([S.boot],'shoe',far);
    // a patch sewn over the knee (out.kneePatch; C.patch), on the front of it
    if(out.kneePatch&&lod>=1){const K=p[kn],d=nrm(sub(p[ft],HIP[side>0?0:1]));let n=perp(d);if(dot(n,V(fv,0))<0)n=mul(n,-1);const m=add(K,mul(n,W(1.1))),a=mul(d,W(3.3)),b=mul(n,W(2.7));
      const Q=[add(m,add(a,b)),add(m,sub(b,a)),sub(m,add(a,b)),add(m,sub(a,b))];c.fillStyle=far?mid(C.patch||C.trouser,'#2a2433',.3):C.patch||mid(C.trouser,'#8a7a62',.25);c.fill(piece(Q,.25).p);
      if(lod>=2&&!far){c.setLineDash([1.1*sz,1*sz]);line(c,[...Q,Q[0]],rgba('#d8c8a8',.45),Math.max(.4,.35*sz));c.setLineDash([]);}}};
  // the seat of the trousers: the weight of the hips, both thighs going into it
  const seat=()=>{const dn=nrm(add(sub(p0[KNF],P0),sub(p0[KNB],P0))),crotch=add(P0,mul(dn,5.4*sz));
    if(!TN){pt([piece([at(T*.06,-8.2),at(-T*.1,-9.4),add(at(-T*.2,-7.6),mul(dn,1.6*sz)),crotch,add(at(-T*.2,6.8),mul(dn,1.6*sz)),at(-T*.08,8.3),at(T*.06,7.9)],.45,k>=2.4)],'trouser');return;}
    const pts=[VW.at(crotch,0)];for(const a of [T*.04,-T*.12]){const R=secAt(a),sc=(R[0]+R[1])/2,Dd=(R[1]-R[0])/2;for(let i=0;i<12;i++){const t=i/12*TAU;pts.push(VW.at(at(a,sc+Dd*Math.cos(t)),R[2]*Math.sin(t)*sz*wf));}}
    for(const hp of HIP)pts.push(add(hp,V(0,4*sz)));
    pt([piece(FigKit.hull(pts),.4,k>=2.4)],'trouser');};

  // ----- a long coat's skirt: between the legs in profile, in front of the far one; turned, a cone round both (KaelLook's) -----
  // (out.coat.closed: a skirt, closed all round: in profile it hangs over both legs, in front of the near one too)
  let skirtDraw=null,SK=null;const shut=!!(out.coat&&out.coat.closed);
  if(out.coat){const L0=out.coat.len||46,farPts=[mix(P0,p0[KNB],.5),p0[KNB],mix(p0[KNB],p0[FTB],.45)],allPts=[...farPts,mix(P0,p0[KNF],.5),p0[KNF],mix(p0[KNF],p0[FTF],.45)];
    const an=[{p:at(-T*.06,7.4),len:L0*sz,pts:shut?allPts:farPts,clear:4.2*sz},{p:at(-T*.08,-8.6),len:(L0+1)*sz,pts:allPts,clear:4.8*sz}];
    const Qc=coatStep(F,'_castCoat',an,fa,gy,now);let fr=V(Qc[0].x,Qc[0].y),bk=V(Qc[1].x,Qc[1].y);if(fr.x*fa<bk.x*fa){const t=fr;fr=bk;bk=t;}
    if(TN){const R0=secAt(-T*.06),top={F:at(-T*.06,R0[1]),B:at(-T*.06,R0[0]),w:R0[2]*sz*wf},fl=o.spin!=null?Math.sin(Math.PI*cl(o.spin,0,1)):0;
      SK=FigKit.cone(VW,top,{F:fr,B:bk,w:Math.max(R0[2]*sz*wf*1.12,len(sub(fr,bk))*.42)+fl*9*sz,lift:fl*7*sz},{open:shut?[0,0]:[.14,.5+.45*fl],gy});}
    else skirtDraw=()=>{
    const WF=at(T*.33,7.4),HF=at(T*.05,8.8),HB=at(-T*.06,-9.2),WB=at(T*.3,-7),base=t=>add(mix(fr,bk,t),V(0,2.2*sz*4*t*(1-t)));
    // (out.coat.ragged: a hem worn to rags, the points of it hanging lower in turn)
    const rg=(out.coat.ragged||0)*sz,hemPt=i=>{const q=base(i/10);return V(q.x,Math.min(rg?q.y+(i%2?rg:-rg*.4):q.y,gy(q.x)-.5));};
    const SP=new Path2D();SP.moveTo(WF.x,WF.y);curveThrough(SP,[WF,HF,mix(HF,fr,.55),fr],.4);for(let i=1;i<=10;i++){const q=hemPt(i);SP.lineTo(q.x,q.y);}
    curveThrough(SP,[bk,mix(HB,bk,.5),HB,WB],.4);SP.closePath();
    const skO=[...FigKit.curvePts([WF,HF,mix(HF,fr,.55),fr],false,.4,4).pts];for(let i=1;i<=10;i++)skO.push(hemPt(i));
    skO.push(...FigKit.curvePts([bk,mix(HB,bk,.5),HB,WB],false,.4,4).pts.slice(1));
    const skP=FigKit.outlined(SP,skO,mix(WF,mix(fr,bk,.5),.5),len(sub(fr,bk))*.4);skP.pw=6.5*sz;pt([skP],'coat');
    if(C.lining&&out.coat.lining!==false){c.save();c.clip(SP);line(c,resample([at(T*.25,7.4),mix(HF,fr,.08),mix(HF,fr,.55),fr],4),C.coatLining||C.lining,Math.max(.9,2.6*sz));c.restore();}
    if(C.trim&&out.piping){line(c,resample([at(T*.2,7.8),mix(HF,fr,.5),fr],4),C.trim,Math.max(.45,.7/k));line(c,resample([fr,base(.5),bk],3),C.trim,Math.max(.4,.6/k));}};}
  const skirtInner=()=>{if(!SK)return;c.fillStyle=mid(mid(C.coatFar||mid(C.coat||C.suit,'#3a3346',.32),C.coatLining||C.lining||C.coat||C.suit,.4),'#000000',.3);c.fill(FigKit.pathOf(SK.inner));};
  const skirtOuter=()=>{if(!SK)return;
    const ps=SK.panels.map(Pn=>{let cx=0,cy=0;for(const q of Pn.pts){cx+=q.x;cy+=q.y;}const pc=FigKit.outlined(FigKit.pathOf(Pn.pts),Pn.pts,V(cx/Pn.pts.length,cy/Pn.pts.length),Math.max(4,len(sub(Pn.pts[0],Pn.pts[Math.floor(Pn.pts.length/2)]))*.4));pc.pw=6.5*sz;return pc;});
    if(ps.length)pt(ps,'coat');
    if(C.trim&&out.piping){for(const E of SK.edges)line(c,E,C.trim,Math.max(.45,.7/k));for(const Pn of SK.panels)line(c,Pn.hem,C.trim,Math.max(.4,.6/k));}};

  // ----- an apron hangs in front of both legs from the waist (turned: a panel of cloth round his front) -----
  const apron=()=>{if(!out.apron)return;const A0=out.apron,ln=(A0.len||32)*sz,top=at(-T*.02,8.6),back=at(-T*.02,-3.2);
    const thigh=nrm(add(sub(p0[KNF],P0),sub(p0[KNB],P0))),dn=nrm(add(mul(thigh,.6),V(0,.4))),fw=V(fa,0);
    const kneeF=p0[KNF].x*fa>p0[KNB].x*fa?p0[KNF]:p0[KNB];
    let bf=add(top,mul(dn,ln));const lead=(kneeF.x+fa*5*sz)*fa;if(bf.x*fa<lead)bf=V(lead*fa,bf.y);bf=V(bf.x,Math.min(bf.y,gy(bf.x)-1.5));
    let bb=add(back,mul(dn,ln*.97));bb=V(bb.x,Math.min(bb.y,gy(bb.x)-1.5));
    if(TN){const R0=secAt(-T*.02),wd=R0[2]*sz*wf,AP=FigKit.cone(VW,{F:at(-T*.02,R0[1]),B:at(-T*.02,R0[0]),w:wd},{F:bf,B:add(at(-T*.02,R0[0]),mul(dn,ln*.97)),w:wd*1.06},{span:1.55,gy});
      for(const Pn of AP.panels){let cx=0,cy=0;for(const q of Pn.pts){cx+=q.x;cy+=q.y;}pt([FigKit.outlined(FigKit.pathOf(Pn.pts),Pn.pts,V(cx/Pn.pts.length,cy/Pn.pts.length),Math.max(4,ln*.3))],'apron');}return;}
    const ap=piece([top,add(mix(top,bf,.5),mul(fw,1.2*sz)),bf,add(mix(bf,bb,.5),V(0,1.2*sz)),bb,mix(back,bb,.5),back],.32,true);pt([ap],'apron');
    if(lod>=1&&A0.ties){line(c,[back,add(back,mul(fw,-6*sz)),add(add(back,mul(fw,-8*sz)),V(0,7*sz))],C.apronTie||mid(C.apron,'#ffffff',.12),Math.max(.6,1.1*sz));}
    // (a place on the apron: u down it from the waist, v across it from the back edge to the front)
    const AQ=(u,v)=>mix(mix(back,top,v),mix(bb,bf,v),u);
    // stains down its front (A0.stains), darker blotches
    if(A0.stains&&lod>=1){c.fillStyle=rgba(C.apronStain||'#000000',.24);c.beginPath();
      for(const [u,v,r,e] of [[.5,.72,1.5,.3],[.53,.79,.9,1.2],[.72,.56,1.7,-.4],[.27,.9,.8,.9],[.86,.8,1.1,.2],[.64,.9,.7,0]]){const q=AQ(u,v);c.moveTo(q.x+r*1.5*sz,q.y);c.ellipse(q.x,q.y,r*1.5*sz,r*.8*sz,e,0,TAU);}c.fill();}
    // a pocket sewn on the front at the thigh (A0.pocket), its opening catching the light; tools standing up out of it (A0.tools)
    if(A0.pocket){const Q=[AQ(.17,.5),AQ(.17,.97),AQ(.4,.99),AQ(.41,.52)];
      if(A0.tools&&lod>=1){const st=C.steel||'#5d626b';for(const [v,h,t] of [[.56,8,-.6],[.7,10.5,.5],[.84,6.5,1.4]]){const b0=AQ(.2,v),tp=add(b0,V(fa*t*sz,-h*sz));
        line(c,[b0,tp],st,Math.max(.6,1.1*sz));c.strokeStyle=st;c.lineWidth=Math.max(.5,.8*sz);c.beginPath();c.arc(tp.x,tp.y,1.25*sz,.6,TAU-.6);c.stroke();}}
      const pk=piece(Q,.25);pt([pk],'apron');c.fillStyle=rgba('#000000',.22);c.fill(pk.p);
      if(lod>=1){line(c,[Q[0],Q[1]],rgba(C.rim||'#ffcf86',.38),Math.max(.5,.7*sz));if(lod>=2){c.setLineDash([1.1*sz,1*sz]);line(c,[Q[1],Q[2],Q[3],Q[0]],rgba('#d8c8a8',.3),Math.max(.4,.3*sz));c.setLineDash([]);}}}};
  // ----- things worn on the torso over the clothes (drawn on it, as the scarf and the watch are) -----
  const extras=(AT,side)=>{const P=Q=>Q.map(([a,s2])=>AT(a,s2));
    // an apron's bib over the chest (out.apron.bib), and its strap round the neck
    if(out.apron&&out.apron.bib){pt([piece(P([[-T*.04,1.8],[T*.4,2.2],[T*.78,3.4],[T*.84,5.4],[T*.83,9.4],[T*.6,9],[T*.34,7.9],[T*.1,7.7],[-T*.04,8.9]]),.35)],'apron');
      if(lod>=1)line(c,resample(P([[T*.83,3.8],[T+1.4,1.6],[T+2.8,-2.6]]),2),C.apronTie||mid(C.apron,'#000000',.3),Math.max(.6,1.2*sz));}
    // a shawl round the shoulders (out.shawl): over the top of the chest and the back, its point hanging behind
    if(out.shawl){const s0=out.shawl===true?1:out.shawl;pt([piece(P([[T+1.2,-5.8],[T+3.4,-1.4],[T+2.6,4.4],[T*.9,9.6],[T*.66,10.2*s0],[T*.46,9.4],[T*.5,4.2],[T*.4,-2],[T*.16,-9.6],[T*.4,-10.6],[T*.7,-10],[T*.92,-8.2]]),.4,lod>=1)],'shawl');
      if(lod>=1&&side>=0)line(c,resample(P([[T*.86,9.2],[T*.62,4.8],[T*.5,-1.2],[T*.3,-8.4]]),3),rgba('#000000',.32),Math.max(.5,.8*sz));}
    // a coil of rope slung over the near shoulder (out.rope; C.rope): a ring of it round him, over the shoulder, a few turns showing
    if(out.rope&&side>=0){const ca=T*.52,ra=T*.6,rs=9.8,th=3.8,ring=(k,n)=>{const Q=[];for(let i=0;i<n;i++){const t=i/n*TAU;Q.push(AT(ca+Math.sin(t)*(ra+k),Math.cos(t)*(rs+k)-1.4));}return Q;};
      const Ro=ring(th/2,24),Ri=ring(-th/2,24).reverse(),RP=new Path2D();for(const R of [Ro,Ri]){RP.moveTo(R[0].x,R[0].y);for(const q of R.slice(1))RP.lineTo(q.x,q.y);RP.closePath();}
      pt([{p:RP,c:AT(ca,0),r:rs*sz,lit:false}],'rope');
      // (the turns of the coil, and the twist across them)
      if(lod>=1){for(const k of [-.65,.65]){const Rm=ring(k,24);line(c,[...Rm,Rm[0]],rgba(C.ropeLine||'#000000',.4),Math.max(.4,.55*sz));}
        if(lod>=2){const A1=ring(th/2,24),A2=ring(-th/2,24);c.strokeStyle=rgba(C.ropeLine||'#000000',.3);c.lineWidth=Math.max(.3,.4*sz);c.beginPath();for(let i=0;i<24;i+=2){c.moveTo(A1[i].x,A1[i].y);c.lineTo(A2[(i+1)%24].x,A2[(i+1)%24].y);}c.stroke();}}}
    // a satchel at the near hip on a strap across the chest (out.satchel; C.bag), its flap and buckle
    if(out.satchel&&side>=0){line(c,resample(P([[T*.18,-3.4],[T*.52,2.8],[T*.84,6.8],[T+1.6,4.6]]),2),C.strap||mid(C.bag,'#000000',.35),Math.max(.7,1.3*sz));
      pt([piece(P([[T*.2,-10.8],[T*.22,-2.6],[-T*.2,-2.2],[-T*.25,-11.2]]),.25)],'bag');
      const fl=piece(P([[T*.22,-11],[T*.24,-2.4],[T*.02,-2.2],[-T*.02,-6.6],[T*.01,-11]]),.3);pt([fl],'bag');
      if(lod>=1){c.fillStyle=rgba('#000000',.3);c.fill(fl.p);const q=AT(T*.03,-6.6);if(!q.h){c.fillStyle=C.button;c.beginPath();c.arc(q.x,q.y,.8*sz,0,TAU);c.fill();}}}
    // patches sewn on (out.patches: [a as a share of the torso, s across, size, which colour]; C.patch, C.patch2)
    if(out.patches&&lod>=1&&side>=0)for(const [a,s2,r,k] of out.patches){const Q=P([[T*a+r,s2-r*.9],[T*a+r*1.1,s2+r],[T*a-r,s2+r*1.1],[T*a-r*.9,s2-r]]);if(Q.some(q=>q.h))continue;
      c.fillStyle=k?C.patch2||C.patch:C.patch;c.fill(piece(Q,.2).p);if(lod>=2){c.setLineDash([1*sz,.9*sz]);line(c,[...Q,Q[0]],rgba('#d8c8a8',.4),Math.max(.4,.3*sz));c.setLineDash([]);}}};

  // ----- the torso -----
  // In profile, drawn once with at(). Turned, as its two halves (FigKit.torsoMap): the main shape of the two together carries the
  // light, and what is on it is drawn flat on each half, the far one first.
  const copies=TN?(()=>{const L=[],aN=FigKit.torsoMap(VW,P0,u0,n0,sz*wf,TAB,1),aF=FigKit.torsoMap(VW,P0,u0,n0,sz*wf,TAB,-1);if(aF.vis>.04)L.push([aF,-1]);if(aN.vis>.04)L.push([aN,1]);return L;})():[[at,0]];
  const onCopies=fn=>{if(TN)env.flat=true;for(const [AT,side] of copies)fn(AT,side);env.flat=false;};
  const neck=()=>{
    if(!F.severed)pt([capsule(add(p[CHE],mul(u,-1.5)),mix(p[CHE],p[HEAD],.7),W(6.9)*(elf?.92:1.08),W(6.1)*(elf?.92:1.08))],'skin');
    onCopies(AT=>{if(out.neck==='turtle')pt([piece([AT(T-2,-4.2),AT(T+5.6,-3.6),AT(T+6.4,0),AT(T+5.6,3.8),AT(T-1.6,4.6),AT(T-3,0)],.45)],'shirt');
      else if(out.neck==='mandarin')pt([piece([AT(T-.4,-4),AT(T+4.2,-3.6),AT(T+4.4,-.4),AT(T+3.6,3.6),AT(T-.2,5.2),AT(T-1.4,1.5)],.45)],out.top==='chef'?'chef':'shirt');
      else pt([piece([AT(T+.4,-3.7),AT(T+4.3,-3.3),AT(T+4.5,-.4),AT(T+3.1,3.1),AT(T+.6,5.0),AT(T-1,1.5)],.45)],'shirt');});};
  const torsoAll=()=>{
    const bs=copies.map(([AT])=>{const q=piece(base.Q.map(([a,s])=>AT(a,s)),.42,true);if(base.pw){q.pw=base.pw*sz;q.pf=base.pf;}return q;});pt(bs,base.mat);
    onCopies((AT,side)=>{torso(c,spec,{at:AT,side,T,sz,wf,lod,k,pt,env});
      // a standing collar, turned up behind the neck to the jaw (Kade's coat)
      if(out.highCollar&&!F.severed){const P=Q=>Q.map(([a,s2])=>AT(a,s2));pt([piece(P([[T-2.4,-5.6],[T+8.6,-6.4],[T+10.6,-3.4],[T+7.4,-.6],[T+1,-1.2],[T-2.6,-1.4]]),.4)],'coat');
        if(C.trim&&lod>=1)line(c,resample(P([[T+8.6,-6.4],[T+10.6,-3.4],[T+7.4,-.6]]),3),C.trim,Math.max(.45,.7/k));}});
    if(spec.trail&&spec.trail.kind==='braid'&&F.scarf&&F.scarf.length>2&&!F.severed)across(0,()=>trail(c,F,spec,env,now,sz));
    onCopies((AT,side)=>{
      if(spec.trail&&spec.trail.kind==='scarf'&&!F.severed){const P=Q=>Q.map(([a,s2])=>AT(a,s2));
        pt([piece(P([[T+.2,-4.6],[T+4.2,-4.2],[T+5.4,0],[T+4.6,4.8],[T+.8,5.8],[T-1.4,1]]),.5)],'scarfC');
        if(spec.trail.knot!==false&&side>=0)pt([piece(P([[T+1,4.2],[T-.4,7.4],[T-4.6,7.2],[T-6.8,6.4],[T-3.6,5],[T-.8,3.6]]),.45)],'scarfC');}
      if(out.watch&&lod>=1&&side>=0){const P=Q=>Q.map(([a,s2])=>AT(a,s2));line(c,resample(P([[T*.42,7.2],[T*.36,4.4],[T*.4,1.6]]),3),C.button,Math.max(.5,.9*sz));}});
    if((out.apron&&out.apron.bib)||out.shawl||out.rope||out.satchel||out.patches)onCopies(extras);};
  const head=()=>{if(!F.severed)drawHead(c,F,spec,env,lod,o,sz,TN?{h:p[HEAD],C0:p[CHE],fa,hy:o.headYaw??FigKit.headYaw(yaw)}:null);};

  if(!TN){
    // in profile: the far arm, the far leg, the seat, a coat's skirt, the near leg, an apron, the neck, the torso, the head, the near arm
    farArm(true);leg(KNB,FTB,-1,true);seat();if(skirtDraw&&!shut)skirtDraw();leg(KNF,FTF,1,false);if(skirtDraw&&shut)skirtDraw();apron();
    neck();torsoAll();if(o.afterTorso)o.afterTorso(F);head();nearArm(false);}
  else{
    // turned: arms and legs in the order of how far toward the viewer each is (KaelLook's), a coat round the legs, an apron over them
    const dFarArm=(dp(sh0,-LS)+dp(p0[ELB],LAT[ELB])+dp(p0[HAB],LAT[HAB]))/3,dNA=(dp(sh0,LS)+dp(p0[ELF],LAT[ELF])+dp(p0[HAF],LAT[HAF]))/3,dNearArm=armed?(dNA*2+dp(p0[TIP],LAT[TIP]))/3:dNA;
    const dFarLeg=(dp(P0,-LH)+dp(p0[KNB],-LH)+dp(p0[FTB],-LH))/3,dNearLeg=(dp(P0,LH)+dp(p0[KNF],LH)+dp(p0[FTF],LH))/3;
    const arms=[{d:dFarArm,fn:()=>farArm(dFarArm<0)},{d:dNearArm,fn:()=>nearArm(dNearArm<0)}].sort((a,bb)=>a.d-bb.d);
    const legs=[{d:dFarLeg,fn:()=>leg(KNB,FTB,-1,dFarLeg<0)},{d:dNearLeg,fn:()=>leg(KNF,FTF,1,dNearLeg<0)}].sort((a,bb)=>a.d-bb.d);
    const prof=Math.abs(VW.s)<.35;
    for(const A of arms)if(A.d<0)A.fn();
    if(!shut)skirtInner();
    for(const L of legs)if(L.d<0)L.fn();
    seat();
    if(!(SK&&prof)||shut)for(const L of legs)if(L.d>=0)L.fn();
    skirtOuter();
    if(SK&&prof&&!shut)for(const L of legs)if(L.d>=0)L.fn();
    apron();
    neck();torsoAll();if(o.afterTorso)across(LH,()=>o.afterTorso(F));
    head();
    for(const A of arms)if(A.d>=0)A.fn();}
  c.restore();
}

// the main shape of the torso by cut, as an outline in profile ([a, s]): a jacket (suit, double-breasted, blazer, a coat's body), a
// shirt (under a waistcoat or braces), a chef's jacket, a fitted top
function torsoBase(spec,T,D){const out=spec.outfit,top=out.top;
  if(top==='suit'||top==='double'||top==='blazer'||top==='coat')return{Q:[[T+1.2,-3.4],[T*.97,-6.2],[T*.80,-8.6*D],[T*.55,-7.0*D],[T*.40,-6.1*D],[T*.18,-7.4*D],[T*.0,-8.9*D],[-T*.12,-8.6],[-T*.16,-6.5],[-T*.15,2.0],
    [-T*.11,5.4],[T*.05,7.4*D],[T*.20,7.3*D],[T*.33,7.0*D],[T*.48,7.9*D],[T*.64,9.4*D],[T*.80,9.4*D],[T*.92,7.6*D],[T+.9,4.2],[T+2.4,.4]],mat:out.coat?'coat':'suit',pw:7.6,pf:.55};
  if(top==='waistcoat'||top==='shirt')return{Q:[[T+1,-3.6],[T*.95,-6.6],[T*.75,-7.4],[T*.5,-6.6],[T*.25,-7],[0,-7.8],[-T*.1,-7.2],[-T*.12,4],[0,7.2],[T*.3,7.4],[T*.55,8.2],[T*.8,8.6],[T+1,5]],mat:'shirt'};
  if(top==='chef')return{Q:[[T+1,-3.6],[T*.95,-6.8],[T*.75,-7.8],[T*.5,-7],[T*.25,-7.4],[0,-8.4],[-T*.14,-8],[-T*.16,-2],[-T*.15,6],[0,8],[T*.3,8.2],[T*.55,8.8],[T*.8,9],[T+1,5]],mat:'chef'};
  return{Q:[[T+1,-3.4],[T*.95,-6.4],[T*.75,-7.2],[T*.5,-6],[T*.25,-6.4],[0,-7.4],[-T*.12,-7],[-T*.13,4],[0,6.8],[T*.3,6.6],[T*.55,7.6],[T*.8,8],[T+1,4.6]],mat:'suit'};}
// what is on the torso by cut (its main shape is torsoBase's). s runs across him, front positive; a runs up him from the hip.
// g.side: 0 in profile, 1 the near half of a turned torso, -1 the far half (a pocket square, a watch chain and the like are on one side)
function torso(c,spec,g){
  const C=spec.col,out=spec.outfit,{at,T,sz,lod,k,pt}=g,top=out.top,D=out.coat?1.07:1,trimW=Math.max(.45,.75/k),side=g.side||0;
  const P=Q=>Q.map(([a,s])=>at(a,s)),dot0=(q,r)=>{if(q.h)return;c.beginPath();c.arc(q.x,q.y,r,0,TAU);c.fill();};
  if(top==='suit'||top==='double'||top==='blazer'||top==='coat'){
    if(out.neck==='turtle'){}// the turtleneck fills the throat; no lapel shirt front
    else pt([piece(P([[T+.4,2.4],[T*.9,4.4],[T*.72,5.2],[T*.55,4.6],[T*.6,7.6],[T*.8,8.8],[T+.5,4.6]]),.45)],'shirt');
    // a three-piece: the waistcoat shows in the opening of the jacket
    if(out.three)pt([piece(P([[T*.74,4.6],[T*.7,7.8],[T*.5,8.2],[T*.3,7.6],[T*.12,7.2],[T*.12,3.6],[T*.4,3.8],[T*.62,4.2]]),.4)],'vest');
    // the lapel: wider on a double-breasted jacket
    const w=top==='double'?1.25:1;
    pt([piece(P([[T+.9,4.2],[T*.92,7.6*D],[T*.80,9.4*D*w],[T*.64,9.4*D],[T*.48,7.9*D],[T*.33,7.0*D],[T*.40,5.0*D],[T*.55,6.6*D],[T*.72,7.0*D],[T*.86,5.6*D],[T+.2,2.4]]),.45)],'lapel');
    pt([piece(P([[T-1.2,-3.8],[T+2.9,-3.8],[T+3.5,-.9],[T+2.0,2.6],[T-.4,2.3]]),.5)],out.coat?'coat':'suit');
    if(out.tie==='tie')pt([piece(P([[T+.2,5.1],[T*.92,6.3],[T*.7,6.6],[T*.52,6.4],[T*.5,5.4],[T*.7,5.2],[T*.9,5]]),.4)],'tie');
    if(out.tie==='cravat')pt([piece(P([[T+.4,5.3],[T*.94,7.6],[T*.84,7.8],[T*.76,6.8],[T*.86,5.2]]),.5)],'tie');
    const btn=top==='double'?[[T*.36,7.6*D],[T*.22,7.8*D],[T*.36,3.6*D],[T*.22,3.8*D]]:[[T*.33,7.25*D],[T*.20,7.55*D]];
    c.fillStyle=C.button;for(const [a,s] of btn)dot0(at(a,s),.85*sz);
    // an elf's piping down the front and round the hem, in his or her colour (turned, round the side to the back)
    if(C.trim&&out.piping)line(c,resample(P([[T+.7,3.9],[T*.92,7.3*D],[T*.80,9.0*D],[T*.64,9.0*D],[T*.48,7.55*D],[T*.33,6.65*D],[T*.20,6.95*D],[T*.05,7.05*D],[-T*.10,5.1],[-T*.14,1.9],
      ...(side?[[-T*.143,-.2],[-T*.146,-2.3],[-T*.149,-4.3]]:[]),[-T*.15,-6.3],[-T*.115,-8.3]]),3),C.trim,trimW);
    if(out.square&&side>=0){const a0=T*.66;pt([piece(P([[a0,5.6],[a0+2.6,6.3],[a0+1.4,7.1],[a0+3.0,7.9],[a0,8.6]]),.3)],'square');}
    if(out.lanyard&&lod>=1&&side>=0){line(c,P([[T+.6,1.4],[T*.7,1.8],[T*.52,2.2]]),C.lanyard,Math.max(.5,.7*sz));const q=at(T*.48,2.4);if(!q.h){c.fillStyle=C.badge||C.lanyard;c.fillRect(q.x-1.6*sz,q.y-.4*sz,3.2*sz,4.2*sz);}}
  }else if(top==='waistcoat'||top==='shirt'){
    // the waistcoat or the braces over the shirt
    if(top==='waistcoat')pt([piece(P([[T*.86,-5.2],[T*.6,-7.4],[T*.35,-6.8],[T*.1,-7.4],[-T*.06,-7.6],[-T*.08,2],[-T*.02,6.6],[T*.15,7.6],[T*.35,7.6],[T*.55,7.2],[T*.62,4.4],[T*.74,2.2],[T*.8,-1.8]]),.42,true)],'vest');
    if(top==='waistcoat'){c.fillStyle=C.button;for(const a of [T*.42,T*.3,T*.18,T*.06])dot0(at(a,7.1),.7*sz);}
    if(out.braces){const w=Math.max(.6,1.3*sz);line(c,P([[T*.92,-2.4],[T*.5,-3.2],[-T*.02,-3.6]]),C.braces,w);line(c,P([[T*.96,3.2],[T*.5,4.6],[-T*.02,4.8]]),C.braces,w);}
    if(out.tie==='bow'){const q=at(T*.96,4.6);if(!q.h){c.fillStyle=C.tie;c.beginPath();c.moveTo(q.x,q.y);const a=at(T*1.02,6.8),b2=at(T*.88,6.8),a2=at(T*1.04,2.6),b3=at(T*.86,2.6);
      c.lineTo(a.x,a.y);c.lineTo(b2.x,b2.y);c.closePath();c.fill();c.beginPath();c.moveTo(q.x,q.y);c.lineTo(a2.x,a2.y);c.lineTo(b3.x,b3.y);c.closePath();c.fill();}}
    if(out.tie==='tie')pt([piece(P([[T+.2,5.1],[T*.92,6.3],[T*.7,6.6],[T*.52,6.4],[T*.5,5.4],[T*.7,5.2],[T*.9,5]]),.4)],'tie');
    // (the belt round the waist: turned, it goes round him)
    if(out.belt)line(c,P(side?[[-T*.02,-7.4],[-T*.02,-4],[-T*.02,0],[-T*.02,4],[-T*.02,7.6]]:[[-T*.02,-7.4],[-T*.02,7.6]]),C.belt||C.suit,Math.max(.8,2.2*sz));
  }else if(top==='chef'){
    // double-breasted, the overlap buttoned down the near side, a straight hem at the hip
    pt([piece(P([[T*.92,1.2],[T*.94,8.4],[T*.6,8.6],[T*.3,8],[-T*.12,7.4],[-T*.13,2.6],[T*.3,2.2],[T*.6,1.6]]),.42)],'chefPanel');
    c.fillStyle=C.button;for(const a of [T*.8,T*.6,T*.4,T*.2])for(const s of [3.6,6.8])dot0(at(a,s),.75*sz);
    if(C.trim&&out.piping){line(c,resample(P([[T*.93,8.6],[T*.6,8.8],[T*.3,8.2],[-T*.13,7.6]]),3),C.trim,trimW);line(c,resample(P([[-T*.15,7.4],[-T*.16,-2],[-T*.14,-8]]),2),C.trim,trimW);}
  }else if(top==='vestTop'){
    // a fitted sleeveless top cinched with a sash (Iyla)
    if(C.trim&&out.piping)line(c,resample(P([[T+.6,4.2],[T*.8,7.8],[T*.55,7.4],[T*.3,6.4]]),3),C.trim,trimW);
  }
  if(out.sash){pt([piece(P([[T*.06,-7.4],[T*.07,7.2],[-T*.02,7.5],[-T*.03,-7.6]]),.3)],'sashC');
    if(side>=0)pt([piece(P([[T*.02,-6.4],[-T*.12,-8.6],[-T*.34,-9.4],[-T*.3,-7.6],[-T*.12,-6.6],[-T*.02,-5.2]]),.4),piece(P([[0,-5.6],[-T*.2,-6.2],[-T*.42,-6.2],[-T*.38,-4.6],[-T*.18,-4.4],[0,-4.2]]),.4)],'sashC');}
}

// the scarf, or Kade's braid, along the chain the game already swings from the back of every named fighter's neck
// (tr.back: the chain hangs from the middle of the neck; a braid worn from the nape is drawn that far toward the back)
function trail(c,F,spec,env,now,sz){
  const s=F.scarf,tr=spec.trail,bk=tr.back?-F.facing*tr.back*sz:0,pts0=s.slice(0,tr.n||s.length).map(q=>V(q.x+bk,q.y)),pts=resample(pts0,3),N=pts.length,C=spec.col;
  if(tr.kind==='braid'){
    // a plait: a run of overlapping lobes, thinner toward the end, and a tie in his colour
    for(let i=N-1;i>=0;i--){const w=(3.4-1.6*i/(N-1))*sz;c.fillStyle=i%2?C.hairShade:C.hair;c.beginPath();c.ellipse(pts[i].x,pts[i].y,w*1.15,w*.85,Math.atan2((pts[Math.min(N-1,i+1)].y-pts[Math.max(0,i-1)].y),(pts[Math.min(N-1,i+1)].x-pts[Math.max(0,i-1)].x)),0,TAU);c.fill();}
    const e=pts[N-1];c.fillStyle=C.accent;c.beginPath();c.arc(e.x,e.y,1.6*sz,0,TAU);c.fill();return;}
  const A=[],B=[],side=[],wid=(tr.w||4)*sz;
  for(let i=0;i<N;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(N-1,i+1)],nn=perp(nrm(sub(b,a))),u=i/(N-1),tw=Math.cos(u*4.2+now*2.4),w=(1-.35*u)*wid*(.3+.7*Math.abs(tw));
    A.push(add(pts[i],mul(nn,w/2)));B.push(sub(pts[i],mul(nn,w/2)));side.push(tw);}
  for(let i=0;i<N-1;i++){const front=(side[i]+side[i+1])>=0,P=new Path2D();P.moveTo(A[i].x,A[i].y);P.lineTo(A[i+1].x,A[i+1].y);P.lineTo(B[i+1].x,B[i+1].y);P.lineTo(B[i].x,B[i].y);P.closePath();
    c.fillStyle=front?(side[i]<.35?C.accentShade:C.accent):mid(C.accentShade,'#000000',.3);c.fill(P);}
}

// hj (a turned figure): {h, C0: the head and the chest as seen, fa, hy: the head's own turn}. Near the profile the profile drawing,
// a little narrower as it turns; further round, the head in the round (headRound).
function drawHead(c,F,spec,env,lod,o,sz,hj){
  const fa=hj?hj.fa:F.facing,C=spec.col,hd=spec.head,elf=spec.race==='elf',C0=hj?hj.C0:F.p[CHE],h=hj?hj.h:F.p[HEAD],v=sub(h,C0),thw=Math.atan2(v.x,-v.y);
  // (hd.scale: a head drawn bigger than the body's own, for a child or a goblin)
  const s=F.body.headR*.0198*(sz/F.body.h)*(hd.scale||1);
  if(hj&&Math.abs(Math.sin(hj.hy))>.42){headRound(c,F,spec,env,lod,o,s,h,thw,fa,hj.hy);return;}
  const back=hj?(Math.cos(hj.hy)<0?-1:1):(F.lookBack||o.lookBack?-1:1),sx=hj?.8+.2*Math.abs(Math.cos(hj.hy)):1;
  const SK=SKULLS[hd.skull||'elf'],EAR=EARS[hd.ear||(elf?'long':'human')],HR=HAIR[hd.hair||'slick'],HT=hd.hat?HATS[hd.hat]:null;
  c.save();c.translate(h.x,h.y);c.scale(fa*back*sx,1);c.rotate(thw*fa*back);c.scale(s,s);c.translate(0,-8);
  const Lw=env.L,Lh=rot(V(Lw.x*fa*back,Lw.y),-thw*fa*back),he={...env,L:Lh,rw:env.rw/s,ow:env.ow/s,k:env.k*s};
  const fillHair=(path)=>{c.fillStyle=C.hairShade;c.fill(path);c.save();c.clip(path);c.translate(Lh.x*9,Lh.y*9);c.fillStyle=C.hair;c.fill(path);c.restore();};
  // long hair, tails and buns behind the skull
  if(HR.back)fillHair(P2(HR.back));
  const skull=SK.path||(SK.path=new Path2D(smoothD(HP(SK.pts),true,.42)));
  paint(c,[{p:skull,c:V(6,10),r:42}],'skin',he);
  if(HR.shaved&&lod>=1){c.save();c.clip(skull);c.fillStyle=rgba(C.hair,.18);c.fill(P2(smoothD(HP(SLICK.concat([[-30,24],[-14,14],[4,-2],[13,5],[22,-18]])),true,.4)));c.restore();}
  if(HR.cap){fillHair(P2(HR.cap));if(lod>=1&&HR.strands){c.save();c.clip(P2(HR.cap));c.strokeStyle=C.hairHi;c.lineWidth=2;c.globalAlpha=elf?.55:.3;c.stroke(P2(HR.strands));c.restore();}}
  if(HR.tie){c.strokeStyle=C.accent||C.hairLine;c.lineWidth=3;c.stroke(P2(HR.tie));}
  // the ear over the hair (an elf's points out through it); an ear marked over stands out over a hat too (a goblin's through her
  // headcloth)
  const ear=()=>{paint(c,[{p:P2(EAR.d),c:V(-20,4),r:14}],'skin',he);
    if(lod>=1){c.strokeStyle=C.earIn||(elf?'#2b2128':'#2c221d');c.lineWidth=4.4;c.stroke(P2(EAR.inner));}
    if(hd.earring&&lod>=1){c.strokeStyle=C.button;c.lineWidth=1.6;for(const [x,y,r] of hd.earring){c.beginPath();c.arc(x,y,r,0,TAU);c.stroke();}}};
  const earOver=!!(EAR.over&&HT);
  if(!earOver)ear();
  if(hd.beard){c.fillStyle=C.beard||C.hair;c.fill(P2(BEARDS[hd.beard]));}
  if(hd.moustache){c.fillStyle=C.beard||C.hair;c.fill(P2(BEARDS.moustache));}
  // tusks up out of the lower jaw (hd.tusks; where they stand is the skull's: [base x, y, tip x, y, half-width, far])
  if(hd.tusks&&SK.tusks)for(const [bx,by,tx,ty,w,far] of SK.tusks){const d=`M${bx-w},${by} Q${R1(bx-w*.7)},${R1((by+ty)/2)} ${tx},${ty} Q${R1(bx+w*1.1)},${R1((by+ty)/2+1)} ${bx+w},${by} Z`;
    c.fillStyle=far?C.tuskShade||'#8a8068':C.tusk||'#cfc4a2';c.fill(P2(d));
    if(lod>=1&&!far){c.strokeStyle=C.tuskShade||'#8a8068';c.lineWidth=1.2;c.beginPath();c.moveTo(bx+w*.5,by);c.quadraticCurveTo(bx+w*.6,(by+ty)/2,tx,ty);c.stroke();}}
  if(HT){const fillHat=(d,shade)=>{const P=P2(d),dx=Lh.x*he.rw,dy=Lh.y*he.rw;c.translate(dx,dy);c.fillStyle=C.rim;c.fill(P);c.translate(-dx,-dy);c.fillStyle=shade?C.hatShade:C.hat;c.fill(P);};
    if(HT.knot)fillHat(HT.knot,true);fillHat(HT.crown);if(HT.band)fillHat(HT.band,true);if(HT.brim)fillHat(HT.brim,true);
    if(HT.pleats&&lod>=1){c.strokeStyle=C.hatShade;c.lineWidth=2.4;c.stroke(P2(HT.pleats));}
    if(HT.badge&&lod>=1){c.fillStyle=C.badge||C.button;c.beginPath();c.arc(HT.badge[0],HT.badge[1],3.2,0,TAU);c.fill();}}
  if(earOver)ear();
  // goggles pushed up on the brow (hd.goggles: true, or {x, y, r}): the strap round the head, the far eyecup behind the near one,
  // each a short drum ending in a brass rim round dark glass
  if(hd.goggles){const G=hd.goggles===true?{}:hd.goggles,gx=G.x??25,gy=G.y??-26,r=G.r??8,an=G.a??-.5,ux=Math.cos(an),uy=Math.sin(an);
    c.strokeStyle=C.strap||'#17130f';c.lineWidth=4.4;c.beginPath();c.moveTo(gx-2,gy+3);c.quadraticCurveTo(gx-26,gy+1,-38,gy+16);c.stroke();
    for(const [ox,oy,far] of [[-4,-3.4,1],[0,0,0]]){const x0=gx+ox,y0=gy+oy,x1=x0+ux*7,y1=y0+uy*7;
      c.fillStyle=far?'#0c0b0a':C.strap||'#17130f';c.beginPath();c.ellipse(x0,y0,r*.42,r,an,0,TAU);c.ellipse(x1,y1,r*.42,r,an,0,TAU);c.fill();
      c.beginPath();c.moveTo(x0-uy*r,y0+ux*r);c.lineTo(x1-uy*r,y1+ux*r);c.lineTo(x1+uy*r,y1-ux*r);c.lineTo(x0+uy*r,y0-ux*r);c.closePath();c.fill();
      c.fillStyle=far?mid(C.glass||'#1d2a2c','#000000',.4):C.glass||'#1d2a2c';c.beginPath();c.ellipse(x1,y1,r*.36,r*.84,an,0,TAU);c.fill();
      c.strokeStyle=far?mid(C.brass||'#b28d3d','#000000',.45):C.brass||'#b28d3d';c.lineWidth=2.6;c.beginPath();c.ellipse(x1,y1,r*.42,r,an,0,TAU);c.stroke();
      if(lod>=1&&!far){c.strokeStyle=rgba(C.brassHi||'#ffe299',.75);c.lineWidth=1.2;c.beginPath();c.ellipse(x1,y1,r*.42,r,an,-2.2,-.6);c.stroke();
        c.strokeStyle='rgba(220,240,240,.35)';c.lineWidth=1.4;c.beginPath();c.moveTo(x1-uy*r*.4+ux*.6,y1+ux*r*.4+uy*.6);c.lineTo(x1-uy*r*.05+ux*.6,y1+ux*r*.05+uy*.6);c.stroke();}}}
  if(hd.scar&&lod>=1){c.strokeStyle=elf?mid(C.accent,'#ffffff',.2):'#5a4438';c.lineWidth=2.2;c.globalAlpha=.85;c.stroke(P2(hd.scar));c.globalAlpha=1;}
  // the face: a brow, and the eye
  const E=V(SK.eye[0],SK.eye[1]);
  if(lod>=1){c.strokeStyle=C.brow||(elf?'#22202a':'#2a201a');c.lineWidth=SK.browW||(elf?6:7.5);c.stroke(P2(SK.brow));}
  const open=!!o.opening||!!F.opening;
  if(elf&&!F.dead){
    // the glow: what marks an elf at any size, in the colour the game gives him or her
    const g0=c.globalCompositeOperation;c.globalCompositeOperation='lighter';const r=open?13:9,gl=c.createRadialGradient(E.x-2,E.y,0,E.x-2,E.y,r*1.8);
    gl.addColorStop(0,open?'rgba(255,214,140,1)':rgba(C.eye,1));gl.addColorStop(.35,open?'rgba(255,193,99,.75)':rgba(C.accent,.72));gl.addColorStop(1,rgba(C.accent,0));
    c.fillStyle=gl;c.beginPath();c.arc(E.x-2,E.y,r*1.8,0,TAU);c.fill();c.globalCompositeOperation=g0;
    if(lod>=1){c.fillStyle=open?'#ffc163':C.eye;c.fill(P2(`M${E.x-10.6},${E.y+.4} Q${E.x-4.1},${E.y-5.1} ${E.x+3.4},${E.y-1.1} Q${E.x-3.1},${E.y+3.9} ${E.x-10.6},${E.y+.4} Z`));}}
  else if(!F.dead){
    // a human's eye catches the light and gives none back
    c.fillStyle=open?'#ffc163':rgba(C.eye,lod?.8:.65);c.beginPath();c.ellipse(E.x-1,E.y,lod?3.4:4.2,lod?2.2:3,0,0,TAU);c.fill();}
  // gold-rimmed spectacles (a cast entry's head.glasses)
  if(hd.glasses&&!F.severed){c.strokeStyle=C.glasses||C.button||'#e2b65a';c.lineWidth=lod>=1?2:2.6;c.beginPath();c.ellipse(E.x-3.4,E.y+.6,8,6.2,0,0,TAU);c.moveTo(E.x-11.4,E.y-.4);c.lineTo(E.x-30,E.y-3.6);c.stroke();
    if(lod>=1){c.fillStyle='rgba(255,255,255,.07)';c.beginPath();c.ellipse(E.x-3.4,E.y+.6,7.2,5.4,0,0,TAU);c.fill();}}
  c.restore();
}

// ---------- a head in the round ----------
// Turned well away from the profile, a head is built from its parts in three dimensions (FigKit.headModel): the skull and the face from
// the profile skull, the ears standing off it (an elf's long and turned out, a human's round and close), the hair over it in its cut, a
// hat, a beard.
const EAR3={long:{pts:[[3,4],[-10,-3],[-30,-16],[-54,-32],[-43,-17],[-30,-1],[-19,16],[-8,30],[1,28]],out:15,flare:4.5,base:27},
  swept:{pts:[[3,4],[-10,-1],[-28,-9],[-58,-19],[-44,-6],[-30,6],[-19,18],[-8,30],[1,28]],out:13,flare:4,base:27},
  short:{pts:[[3,4],[-9,-1],[-22,-10],[-40,-24],[-32,-9],[-24,5],[-16,18],[-7,30],[1,28]],out:10,flare:3,base:27},
  human:{pts:[[4,8],[-3,1],[-11,1],[-16,9],[-15,19],[-10,27],[-3,31],[3,28]],root:[-2,16],out:4,flare:2,base:29}};
EAR3.notched=EAR3.long;
// the hairline round the head from the front (azimuth, y): an elf's low and swept, a human's, a high one
const LINE3={elf:[[0,-19],[.5,-12],[.8,-2],[1.1,7],[1.3,7],[1.45,-3],[1.75,-3],[2,12],[2.5,22],[3.15,25]],
  human:[[0,-22],[.5,-16],[.85,-4],[1.1,4],[1.3,4],[1.45,-2],[1.75,-2],[2,10],[2.5,18],[3.15,22]],
  high:[[0,-29],[.5,-22],[.8,-6],[1.1,6],[1.3,6],[1.45,-3],[1.75,-3],[2,12],[2.5,22],[3.15,25]]};
const HAIR3={slick:{line:'elf',puff:3},topknot:{line:'elf',puff:3,bun:{c:[-14,-50,0],r:12}},longfall:{line:'elf',puff:3,fall:{top:-14,bot:88,w0:26,w1:20,f0:-30,f1:-40}},
  lowtail:{line:'elf',puff:3,tail:{pts:[[-40,22],[-44,46],[-46,70],[-42,88]],w:7}},
  pixie:{line:'human',puff:5,spikes:[[[18,-30,0],[40,-26,0],7],[[2,-40,0],[4,-56,0],8],[[-18,-40,0],[-32,-52,0],8],[[-32,-24,0],[-50,-24,0],7],[[10,-32,16],[24,-42,22],7],[[-14,-36,18],[-28,-48,24],7],[[-30,-14,22],[-46,-12,28],6]]},
  platinum:{line:'elf',puff:3,tail:{pts:[[-24,-48],[-50,-40],[-63,-16],[-64,14],[-58,46],[-50,74],[-45,96]],w:9}},
  crest:{line:'elf',puff:7,strip:9},quiff:{line:'human',puff:8,front:1},silver:{line:'high',puff:2.5},
  crop:{line:'human',puff:2},sidepart:{line:'human',puff:3},curly:{line:'human',puff:6},bald:null};
const HAT3={toque:{top:-98,base:-22,puff:5,flare:.12,tall:1,topW:1.16,dome:14,band:[-30,-17]},flatcap:{top:-46,base:-16,puff:3,brim:{len:16,w:.7,y:-17}},
  beanie:{top:-50,base:-12,puff:5,band:[-20,-10]},bandana:{top:-48,base:-12,puff:3,knot:{c:[-46,-10,0],r:8}},
  seccap:{top:-48,base:-15,puff:3,brim:{len:22,w:.75,y:-16}},skullcap:{top:-47,base:-17,puff:2}};
const BEARD3={full:{y0:8,y1:66,az:1.45},short:{y0:16,y1:60,az:1.35},goatee:{y0:38,y1:62,az:.45},chops:{y0:6,y1:46,az:1.5},moustache:{y0:28,y1:36,az:.45}};
// how wide each skull is across for its length
const WIDE3={elf:1,hawk:.98,soft:.97,long:.96,brute:1.08,old:.98,human:1.05,flat:1.07,round:1.1,gaunt:.97};
const HMODEL={};
function headModelOf(hd,elf){const key=[hd.skull,hd.ear,hd.hair,hd.hat,hd.beard,hd.moustache,elf].join('|');if(HMODEL[key])return HMODEL[key];
  const SK=SKULLS[hd.skull||'elf'],w=WIDE3[hd.skull||'elf']||1,H=HAIR3[hd.hair||'slick'];
  const hair=H?{line:LINE3[H.line],puff:H.puff,spikes:H.spikes,bun:H.bun,fall:H.fall,tail:H.tail,strip:H.strip,front:H.front}:null;
  const beard=[hd.beard?BEARD3[hd.beard]:null,hd.moustache?BEARD3.moustache:null].filter(Boolean);
  return HMODEL[key]=FigKit.headModel({skull:SK.pts,w,ear:EAR3[hd.ear||(elf?'long':'human')],eye:[SK.eye[0],SK.eye[1],12.5*w],hair,hat:hd.hat?HAT3[hd.hat]:null,beard:beard.length?beard:null});}
function headRound(c,F,spec,env,lod,o,s,h,thw,fa,hy){
  const C=spec.col,hd=spec.head,elf=spec.race==='elf',M=headModelOf(hd,elf),HV=FigKit.headView(M,hy);
  c.save();c.translate(h.x,h.y);c.scale(fa,1);c.rotate(thw*fa);c.scale(s,s);c.translate(0,-8);
  const Lw=env.L,Lh=rot(V(Lw.x*fa,Lw.y),-thw*fa),he={...env,L:Lh,rw:env.rw/s,ow:env.ow/s,k:env.k*s};
  const fillHair=P=>{if(!P)return;c.fillStyle=C.hairShade;c.fill(P);c.save();c.clip(P);c.translate(Lh.x*9,Lh.y*9);c.fillStyle=C.hair;c.fill(P);c.restore();};
  const HT=HV.hat,fillHat=(P,shade)=>{const dx=Lh.x*he.rw,dy=Lh.y*he.rw;c.translate(dx,dy);c.fillStyle=C.rim;c.fill(P);c.translate(-dx,-dy);c.fillStyle=shade?C.hatShade:C.hat;c.fill(P);};
  // behind the head: a hat's knot or its brim seen from behind, the hair, the far ear; then the skull and the face, a beard, the hair
  // over them, the near ear, the hat
  if(HT&&HT.knot&&!HT.knotFront)fillHat(HT.knot,true);
  if(HT&&HT.brim&&!HT.brimFront)fillHat(HT.brim,true);
  fillHair(HV.hairBack);
  for(const E of HV.earsBack)paint(c,[{p:E.p,c:V(-20,4),r:14}],'skin',{...he,far:true});
  paint(c,[{p:HV.skull,c:V(6,10),r:42}],'skin',he);
  if(HV.beard){c.fillStyle=C.beard||C.hair;c.fill(HV.beard);}
  // (the tusks and the goggles stand where the profile puts them, set out either side of the face)
  const cy=Math.cos(hy),sy=Math.sin(hy),PJ=q=>V(q[0]*cy+q[2]*sy,q[1]),ZJ=q=>-q[0]*sy+q[2]*cy,SK=SKULLS[hd.skull||'elf'];
  if(hd.tusks&&SK.tusks)for(const [bx,by,tx,ty,w,far] of SK.tusks){if(far)continue;for(const sd of [1,-1]){const l=sd*(SK.tuskL||9),z=ZJ([bx,by,l]);if(z<-3)continue;
    const a=PJ([bx-w,by,l]),b=PJ([bx+w,by,l]),t=PJ([tx,ty,l*1.04]);c.fillStyle=C.tusk||'#cfc4a2';c.beginPath();c.moveTo(a.x,a.y);c.quadraticCurveTo(a.x,(a.y+t.y)/2,t.x,t.y);c.quadraticCurveTo(b.x,(b.y+t.y)/2,b.x,b.y);c.closePath();c.fill();}}
  fillHair(HV.hairFront);
  const earOver=!!(EARS[hd.ear]&&EARS[hd.ear].over&&HT);
  if(!earOver)for(const E of HV.earsFront)paint(c,[{p:E.p,c:V(-20,4),r:14}],'skin',he);
  if(HT){fillHat(HT.crown);if(HT.band)fillHat(HT.band,true);if(HT.brim&&HT.brimFront)fillHat(HT.brim,true);if(HT.knot&&HT.knotFront)fillHat(HT.knot,true);}
  if(earOver)for(const E of HV.earsFront)paint(c,[{p:E.p,c:V(-20,4),r:14}],'skin',he);
  if(hd.goggles){const G=hd.goggles===true?{}:hd.goggles,gx=(G.x??25)-4,gy=G.y??-26,r=G.r??8;
    for(const sd of [-1,1]){const q=[gx,gy,sd*11],z=ZJ(q);if(z<-6)continue;const e=PJ(q),rx=Math.max(1.6,r*Math.abs(sy)*.9);
      c.fillStyle=C.glass||'#1d2a2c';c.beginPath();c.ellipse(e.x,e.y,rx,r*.8,0,0,TAU);c.fill();c.strokeStyle=C.brass||'#b28d3d';c.lineWidth=2.6;c.stroke();}}
  // the eyes, as squarely as each faces the viewer: an elf's glow in his or her colour, a human's catching the light
  const open=!!o.opening||!!F.opening;
  if(!F.dead)for(const e of HV.eyes||[]){if(e.face<.05)continue;const f=cl(e.face*1.5,.2,1),E=e.p;
    if(lod>=1){c.strokeStyle=C.brow||(elf?'#22202a':'#2a201a');c.lineWidth=elf?5:6;c.beginPath();c.moveTo(E.x-7*f,E.y-7);c.quadraticCurveTo(E.x,E.y-12,E.x+7*f,E.y-8);c.stroke();}
    if(elf){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=Math.min(1,.35+f*.75);const r=open?13:9,gl=c.createRadialGradient(E.x,E.y,0,E.x,E.y,r*1.8);
      gl.addColorStop(0,open?'rgba(255,214,140,1)':rgba(C.eye,1));gl.addColorStop(.35,open?'rgba(255,193,99,.75)':rgba(C.accent,.72));gl.addColorStop(1,rgba(C.accent,0));
      c.fillStyle=gl;c.beginPath();c.arc(E.x,E.y,r*1.8,0,TAU);c.fill();c.restore();}
    else{c.fillStyle=open?'#ffc163':rgba(C.eye,lod?.8:.65);c.beginPath();c.ellipse(E.x,E.y,(lod?3.4:4.2)*f,lod?2.2:3,0,0,TAU);c.fill();}}
  c.restore();}

// ---------- who they are ----------
// the dining room's elves, the kitchen's, the lobby's, the office; and the human crews of each room
const CAST={
  Qadir:{race:'elf',room:'dining',role:'Runs the Lantern Bistro floor',temper:'brute',
    col:elfCol('#ff6b5b',{hair:'#7a2a20',hairShade:'#3a120d',hairHi:'#e07a62',dark:'#100c0d'}),
    head:{skull:'hawk',ear:'notched',hair:'topknot',earring:[[-20,14,2.6],[-24,6,2.2]],scar:'M30,-14 Q34,-2 36,12'},
    outfit:{top:'double',sleeves:'jacket',neck:'collar',tie:'tie',piping:1,square:1},trail:{kind:'scarf',w:4.6},
    build:{cm:192,bulk:1.26}},
  Brask:{race:'elf',room:'dining',role:'Qadir\u2019s second. Keeps his distance and his reach',temper:'keeper',
    col:elfCol('#b591ff',{hair:'#d9dce6',hairShade:'#8d90a3',hairHi:'#ffffff',dark:'#0e0c16'}),
    head:{skull:'long',ear:'swept',hair:'longfall'},
    outfit:{top:'coat',sleeves:'jacket',neck:'collar',tie:'cravat',coat:{len:40},piping:1},trail:null,
    build:{cm:194,bulk:0.95}},
  Iyla:{race:'elf',room:'dining',role:'Gets inside a guard and grabs',temper:'rusher',
    col:elfCol('#ff7eb6',{hair:'#f6dbe8',hairShade:'#b08ea0',hairHi:'#ffffff',dark:'#120c11'}),
    head:{skull:'soft',ear:'short',hair:'pixie'},
    outfit:{top:'vestTop',sleeves:'bare',neck:'collar',piping:1,sash:1},trail:{kind:'scarf',w:3.8},
    build:{cm:180,bulk:0.92}},
  Orrin:{race:'elf',room:'kitchen',role:'Head chef. Runs the kitchen crew',temper:'brute',
    col:elfCol('#ff9a3c',{hair:'#b8692e',hairShade:'#6e3a18',hairHi:'#ffc08a',dark:'#0f0d0d',beard:'#a35a26',apron:'#1a1512',apronFar:'#2c2420',chef:'#14110f',chefPanel:'#1b1714'}),
    head:{skull:'brute',ear:'short',hair:'crop',hat:'toque',beard:'short'},
    outfit:{top:'chef',sleeves:'jacket',neck:'mandarin',piping:1,apron:{len:34,ties:1}},trail:{kind:'scarf',w:4.8,n:3},
    build:{cm:196,bulk:1.36}},
  Hesk:{race:'elf',room:'kitchen',role:'Sous-chef. Cold and exact',temper:'keeper',
    col:elfCol('#62b6ff',{hair:'#26304a',hairShade:'#11172a',hairHi:'#7d9ad0',dark:'#0b0d12',apron:'#aeb7c6',apronFar:'#6e7686',apronTie:'#62b6ff'}),
    head:{skull:'long',ear:'long',hair:'lowtail'},
    outfit:{top:'waistcoat',sleeves:'rolled',neck:'collar',tie:'tie',piping:1,apron:{len:48,ties:1}},trail:null,
    build:{cm:195,bulk:0.86}},
  Odile:{race:'elf',room:'kitchen',role:'Line cook. Quick with a knife',temper:'rusher',
    col:elfCol('#ffe066',{hair:'#3a2a1c',hairShade:'#1f150d',hairHi:'#7a5a3a',dark:'#0f0d0b',hat:'#ffe066',hatShade:'#b99a2c',apron:'#1c1814',shirt:'#15120f',sleeve:'#15120f',shirtFar:'#2a2420',sleeveFar:'#2a2420'}),
    head:{skull:'soft',ear:'swept',hair:'crop',hat:'bandana'},
    outfit:{top:'shirt',sleeves:'rolled',neck:'collar',apron:{len:30}},trail:{kind:'scarf',w:3,n:3},
    build:{cm:178,bulk:0.88}},
  Sable:{race:'elf',room:'lobby',role:'Heads the lobby\u2019s security detail',temper:'keeper',
    col:elfCol('#e3e6f2',{hair:'#f1f2f7',hairShade:'#a9adbd',hairHi:'#ffffff',dark:'#0d0d12',accentShade:'#8f94a6',coat:'#bfc3cf',coatFar:'#7b7f8c',coatLining:'#2a2d36'}),
    head:{skull:'soft',ear:'long',hair:'platinum'},
    outfit:{top:'coat',sleeves:'jacket',neck:'turtle',coat:{len:46},piping:1,gloves:1},trail:null,
    build:{cm:196,bulk:1.0}},
  Doran:{race:'elf',room:'lobby',role:'Security. The heavy',temper:'brute',
    col:elfCol('#e0464f',{hair:'#8a242b',hairShade:'#40101a',hairHi:'#e06872',dark:'#0e0c0f'}),
    head:{skull:'brute',ear:'notched',hair:'crest'},
    outfit:{top:'blazer',sleeves:'jacket',neck:'turtle',piping:1,boots:1},trail:{kind:'scarf',w:4.8,knot:false},
    build:{cm:193,bulk:1.38}},
  Kessa:{race:'elf',room:'lobby',role:'Security. Close work with a knife',temper:'rusher',
    col:elfCol('#ff5fc0',{hair:'#17121a',hairShade:'#0b080d',hairHi:'#ff5fc0',dark:'#0f0b10'}),
    head:{skull:'soft',ear:'swept',hair:'quiff'},
    outfit:{top:'blazer',sleeves:'jacket',neck:'turtle',piping:1},trail:{kind:'scarf',w:3.8,knot:false},
    build:{cm:186,bulk:0.92}},
  Kade:{race:'elf',room:'office',role:'Mr. Hallowell\u2019s head of security',temper:'keeper',
    col:elfCol('#ff4d6d',{hair:'#141018',hairShade:'#0a080c',hairHi:'#5a4a60',dark:'#0b0a0e',glove:'#141118',gloveFar:'#26202c'}),
    head:{skull:'hawk',ear:'long',hair:'slick',scar:'M2,30 Q14,36 24,48'},
    outfit:{top:'coat',sleeves:'jacket',neck:'turtle',coat:{len:50},piping:1,gloves:1,highCollar:1},trail:{kind:'braid',n:6},
    build:{cm:198,bulk:1.18}},
  Hallowell:{race:'elf',room:'office',role:'The executive. Never fights',temper:null,
    col:elfCol('#d8cfa8',{hair:'#d4d7dc',hairShade:'#8b8f96',hairHi:'#ffffff',dark:'#0d0c10',accentShade:'#8f876a',vest:'#8f866a',vestFar:'#5e5846',button:'#e2b65a'}),
    head:{skull:'old',ear:'short',hair:'silver'},
    outfit:{top:'suit',sleeves:'jacket',neck:'collar',tie:'tie',piping:0,square:1,watch:1,three:1},trail:null,
    build:{cm:185,bulk:1.08}},
  // Kael's partner in the free fights, not one of the restaurant's people: an elf in a short coat and boots, her hair tied back,
  // the green she has always fought in at the trim of her coat and in her eyes
  Amri:{race:'elf',room:null,role:'Ilyas\u2019s partner. Fights at his side',temper:null,
    col:elfCol('#8bdc6a',{hair:'#2a1f1a',hairShade:'#140e0b',hairHi:'#8a6a52',dark:'#0c0f0d'}),
    head:{skull:'soft',ear:'swept',hair:'lowtail'},
    outfit:{top:'coat',sleeves:'jacket',neck:'turtle',coat:{len:36},piping:1,gloves:1,boots:1},trail:null,
    build:null}};
// the crews: what a human of each room wears, drawn by his seed from the room's wardrobe
const CREWS={
  dining:{name:'Dining room crew',note:'Waiters and floor muscle: black waistcoats over white shirts, long aprons, bow ties, flat caps',
    col:{vest:'#121010',vestFar:'#262020',shirt:'#8b8274',shirtFar:'#5c564c',sleeve:'#8b8274',sleeveFar:'#5c564c',apron:'#151311',apronFar:'#2a2622',tie:'#0c0b0a',braces:'#1c1714',hat:'#2c2620',hatShade:'#1c1814'},
    tops:[['waistcoat',4],['shirt',2]],sleeves:[['rolled',3],['shirt',2]],hats:[[null,3],['flatcap',2]],aprons:[[null,2],[{len:46,ties:1},3]],ties:[['bow',3],[null,2]],braces:.6},
  kitchen:{name:'Kitchen crew',note:'Cooks and porters: whites gone grey, darker aprons, caps and bandanas',
    col:{chef:'#8a8478',chefFar:'#5c584f',chefPanel:'#958f82',shirt:'#8a8478',shirtFar:'#5c584f',sleeve:'#8a8478',sleeveFar:'#5c584f',apron:'#3e3a34',apronFar:'#4f4a43',hat:'#9a9486',hatShade:'#6c675e'},
    tops:[['chef',3],['shirt',2]],sleeves:[['rolled',3],['jacket',1]],hats:[['skullcap',2],['bandana',2],[null,1]],aprons:[[{len:32},3],[{len:42},1]],ties:[[null,1]],braces:0},
  street:{name:'Street crew',note:'Qadir\u2019s people off the bistro floor: work jackets and waistcoats in browns and greys, braces, flat caps, boots',
    col:{suit:'#2a221b',suitFar:'#3a3027',lapel:'#30271f',vest:'#1a1612',vestFar:'#2c251f',shirt:'#6f6656',shirtFar:'#4c463c',sleeve:'#6f6656',sleeveFar:'#4c463c',trouser:'#1f1b17',trouserFar:'#2f2924',braces:'#17130f',hat:'#2c2620',hatShade:'#1c1814',tie:'#0e0c0a'},
    tops:[['suit',2],['waistcoat',2],['shirt',1]],sleeves:[['rolled',2],['shirt',2]],hats:[['flatcap',3],[null,2]],aprons:[[null,1]],ties:[[null,3],['tie',1]],braces:.6,boots:1},
  lobby:{name:'Lobby security',note:'Contract guards: slate blazers, caps, lanyards, boots',
    col:{suit:'#2b313c',suitFar:'#3a404c',lapel:'#323946',shirt:'#4a525f',hat:'#1d222b',hatShade:'#141820',lanyard:'#9aa3b3',badge:'#c9d0dc',trouser:'#1d2129',trouserFar:'#2c313b'},
    tops:[['blazer',3],['suit',1]],sleeves:[['jacket',1]],hats:[['seccap',2],[null,2]],aprons:[[null,1]],ties:[[null,2],['tie',1]],braces:0,lanyard:1,boots:1}};
const HUMAN_HEADS={skull:[['human',3],['flat',2],['round',2],['gaunt',2]],hair:[['crop',3],['sidepart',2],['curly',1],['bald',1]],
  beard:[[null,4],['full',1],['short',2],['goatee',1],['chops',1]],moustache:.25,
  hairCol:[['#2a211b',3],['#3a2c22',2],['#1a1716',2],['#5a4a3a',1],['#6b6560',1]]};
function pick(R,list){let t=R()*list.reduce((s,e)=>s+e[1],0);for(const e of list){t-=e[1];if(t<0)return e[0];}return list[0][0];}
function rng(a){return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
// one human of a room's crew, the same every time for the same seed
function crewSpec(room,seed){
  const W=CREWS[room]||CREWS.dining,R=rng(seed*977+room.length*131),top=pick(R,W.tops),hat=pick(R,W.hats),hc=pick(R,HUMAN_HEADS.hairCol);
  const sleeves=top==='chef'&&pick(R,W.sleeves)==='jacket'?'jacket':top==='blazer'||top==='suit'?'jacket':pick(R,W.sleeves);
  const col=humanCol(Object.assign({},W.col,{hair:hc,hairShade:mid(hc,'#000000',.4),beard:mid(hc,'#000000',.15)}));
  const head={skull:pick(R,HUMAN_HEADS.skull),ear:'human',hair:hat==='toque'?'crop':pick(R,HUMAN_HEADS.hair),hat,beard:pick(R,HUMAN_HEADS.beard)};
  if(!head.beard&&R()<HUMAN_HEADS.moustache)head.moustache=1;
  const out={top,sleeves,neck:top==='chef'?'mandarin':top==='blazer'&&R()<.6?'turtle':'collar',tie:top==='chef'?null:pick(R,W.ties),apron:pick(R,W.aprons),braces:top==='shirt'&&R()<(W.braces||0),
    lanyard:W.lanyard&&(top==='blazer'||top==='suit'),boots:!!W.boots};
  out.belt=top==='shirt'&&!out.apron;
  return{race:'human',room,col,head,outfit:out,trail:null};}
// (the tables a later file adds its people's parts to: the profile's SKULLS, EARS, HAIR, HATS, BEARDS, and for a head turned in the
// round EAR3, HAIR3, HAT3, BEARD3, WIDE3, LINE3; shapes: how the hair and hats here are made, and the colour mix)
return{draw,CAST,CREWS,crewSpec,SKULLS,EARS,HAIR,HATS,BEARDS,EAR3,HAIR3,HAT3,BEARD3,WIDE3,LINE3,elfCol,humanCol,
  shapes:{smoothD,hairPath,spikyPath,SLICK,HP,mid},ok:typeof Path2D==='function'};
})();
// ---------- in the game ----------
// The named enemies, the crews and Amri are drawn by CastLook (sk_cast.js says who is an elf and who a human); S.classicLook brings back
// the old figures, Kael's included. Without Path2D (the headless checks) everyone keeps the old figure.
// Amri, Kael's partner when she fights beside him, is dressed by it too (CAST.Amri)
function isAlly(f){return!!f&&!!f.ally&&f.team===0;}
function castOn(f){return CastLook.ok&&!S.classicLook&&(isElf(f)||isHuman(f)||isAlly(f));}
// a crew member dresses for the room he comes into: the dining room, the kitchen, the lobby, or the street outside the restaurant
function castRoom(f){return f.p2?'kitchen':f.p3?'lobby':S.arenaKey==='restaurant'?'dining':'street';}
function castSpec(f){
  if(isHuman(f)){const room=castRoom(f),seed=f.seed||f.idx,c=f._cspec;if(c&&c.seed===seed&&c.room===room)return c.spec;f._cspec={seed,room,spec:CastLook.crewSpec(room,seed)};return f._cspec.spec;}
  if(isAlly(f))return CastLook.CAST.Amri;
  return CastLook.CAST[f.name==='Mr. Hallowell'?'Hallowell':f.name];}
function drawCast(f){
  const L=kaelLight(f),sp=castSpec(f);
  CastLook.draw(ctx,f,sp,{light:L.light,dir:L.dir,now:S.t,yaw:f._yaw||0,spin:f._spinU,opening:!!(S.opening&&S.opening.f===f),lookBack:!!(f.look&&typeof tacLook==='function'&&tacLook(f)<-.4),
    drawOther:drawWeapon,afterFarArm:f.sidearm==='offhand'?drawOffDagger:null,afterTorso:f.sidearm==='sheathed'?drawSheath:f.scab&&!f.dead?drawScabbard:null});
  if(f.severed&&S.gore!=='off'){ctx.fillStyle=GORE_COL[S.gore].mark;circ(f.p[CHE],f.body.torsoW*.34);}
  drawMarks(f);}
// ===== CAST UI END =====
