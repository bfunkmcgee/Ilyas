// ===== ARMS UI =====
// The restaurant's weapons, drawn in detail: a signature weapon for each named elf, an elven weapon in each elf's colours for the
// other kinds, and the crews' weapons, which come from the room they work in. Every design keeps its kind's geometry (the grip at the
// hand, the length to the tip, the butt behind the hand), so a fight plays exactly as before; only the drawing changes.
// A design is built once into painted parts in the weapon's own frame (x along the weapon from the grip toward the tip, y across it,
// +y the edge side) and drawn with one transform. What depends on the moment is added on top: the rim on the side that faces the
// light, a glint that slides along the blade as it turns, and ribbons and tassels that hang from the weapon in the world.
const ArmsLook=(()=>{
const TAU=Math.PI*2,lerp=(a,b,t)=>a+(b-a)*t,clamp=(v,a,b)=>v<a?a:v>b?b:v,ease=t=>t*t*(3-2*t);
// ---------- colours ----------
function rgb(c){c=c.replace('#','');if(c.length===3)c=c.split('').map(x=>x+x).join('');const n=parseInt(c,16);return[(n>>16)&255,(n>>8)&255,n&255];}
function hex(r,g,b){return'#'+[r,g,b].map(v=>Math.round(clamp(v,0,255)).toString(16).padStart(2,'0')).join('');}
function mix(a,b,t){const A=rgb(a),B=rgb(b);return hex(lerp(A[0],B[0],t),lerp(A[1],B[1],t),lerp(A[2],B[2],t));}
// materials: b the body, s its shade, l its light, e the brightest edge, o the ink line round it
const M={
  steel:{b:'#68727f',s:'#3b424c',l:'#cdd6e1',e:'#f1f5fa',o:'#0b0c0f'},
  bright:{b:'#8b96a4',s:'#4f5865',l:'#e6edf5',e:'#ffffff',o:'#0b0c0f'},
  worn:{b:'#5f6670',s:'#383d45',l:'#aab3be',e:'#dfe5ec',o:'#0b0c0f'},
  dark:{b:'#30353d',s:'#1b1e23',l:'#8f9aa8',e:'#dbe3ec',o:'#060708'},
  black:{b:'#1d1f24',s:'#101114',l:'#555d6a',e:'#c7cfda',o:'#040405'},
  silver:{b:'#a9b1bc',s:'#666e7a',l:'#f3f6fa',e:'#ffffff',o:'#0e1013'},
  iron:{b:'#46433f',s:'#272523',l:'#8a847b',e:'#b9b2a7',o:'#0a0908'},
  carbon:{b:'#4e5154',s:'#2e3032',l:'#9a9ea3',e:'#d8dce0',o:'#0a0a0b'},
  brass:{b:'#9a7634',s:'#563f17',l:'#ecc979',e:'#fff0bf',o:'#130d04'},
  gold:{b:'#b28d3d',s:'#634a19',l:'#ffe299',e:'#fff6d6',o:'#130d04'},
  rosegold:{b:'#a6705f',s:'#5c3a30',l:'#f2c2ae',e:'#ffe6dc',o:'#140a07'},
  champagne:{b:'#b9ad83',s:'#6d6448',l:'#f4ecc8',e:'#fffbe8',o:'#14120a'},
  nickel:{b:'#8e959e',s:'#535962',l:'#e9eef4',e:'#ffffff',o:'#0d0e10'},
  redpaint:{b:'#932628',s:'#541214',l:'#e0575a',e:'#ff9a94',o:'#120404'},
  slate:{b:'#34405a',s:'#1d2536',l:'#6f80a3',e:'#a9b8d6',o:'#07090d'},
  wood:{b:'#5b3a22',s:'#33200f',l:'#8f6038',g:'#2a1909',o:'#0c0704'},
  walnut:{b:'#4a2e1c',s:'#29180c',l:'#7c5434',g:'#21130a',o:'#0a0604'},
  ash:{b:'#7d6a50',s:'#4f4231',l:'#b9a17c',g:'#56483a',o:'#100c07'},
  hickory:{b:'#836946',s:'#54432b',l:'#c0a274',g:'#5a4630',o:'#110c06'},
  pale:{b:'#8b7c62',s:'#5b513f',l:'#c3b28f',g:'#64583f',o:'#110e08'},
  rosewood:{b:'#4b2219',s:'#29110c',l:'#83402c',g:'#210c07',o:'#0b0403'},
  ebony:{b:'#1d1815',s:'#0d0a09',l:'#4d413a',g:'#0a0807',o:'#040303'},
  leather:{b:'#2b1e17',s:'#160f0b',l:'#5c4434',o:'#060403'},
  blackwood:{b:'#17161a',s:'#0b0a0d',l:'#45424d',g:'#08080a',o:'#030304'},
  tar:{b:'#1f1b17',s:'#0f0d0b',l:'#4a4136',o:'#050403'}};
// a material from one colour, for grips and enamel in an elf's own colours
function matOf(c){return{b:c,s:mix(c,'#000000',.45),l:mix(c,'#ffffff',.38),e:mix(c,'#ffffff',.7),o:mix(c,'#000000',.85)};}
// ---------- paths, in the weapon's frame ----------
function pPoly(pts,p){p=p||new Path2D();p.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)p.lineTo(pts[i][0],pts[i][1]);p.closePath();return p;}
function pLine(pts,p){p=p||new Path2D();p.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)p.lineTo(pts[i][0],pts[i][1]);return p;}
// a smooth closed outline through the points (quadratic curves through the midpoints)
function pSmooth(pts,p){p=p||new Path2D();const n=pts.length,m=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];let s=m(pts[n-1],pts[0]);p.moveTo(s[0],s[1]);
  for(let i=0;i<n;i++){const a=pts[i],q=m(a,pts[(i+1)%n]);p.quadraticCurveTo(a[0],a[1],q[0],q[1]);}p.closePath();return p;}
function pEll(cx,cy,rx,ry,rot,p){p=p||new Path2D();p.moveTo(cx+rx*Math.cos(rot||0),cy+rx*Math.sin(rot||0));p.ellipse(cx,cy,rx,ry,rot||0,0,TAU);p.closePath();return p;}
function pCirc(cx,cy,r,p){return pEll(cx,cy,r,r,0,p);}
function pRound(x0,y0,x1,y1,r,p){p=p||new Path2D();r=Math.min(r,(x1-x0)/2,(y1-y0)/2);p.moveTo(x0+r,y0);p.lineTo(x1-r,y0);p.quadraticCurveTo(x1,y0,x1,y0+r);p.lineTo(x1,y1-r);
  p.quadraticCurveTo(x1,y1,x1-r,y1);p.lineTo(x0+r,y1);p.quadraticCurveTo(x0,y1,x0,y1-r);p.lineTo(x0,y0+r);p.quadraticCurveTo(x0,y0,x0+r,y0);p.closePath();return p;}
function pCmd(cmds,p){p=p||new Path2D();for(const c of cmds){const k=c[0];if(k==='M')p.moveTo(c[1],c[2]);else if(k==='L')p.lineTo(c[1],c[2]);else if(k==='Q')p.quadraticCurveTo(c[1],c[2],c[3],c[4]);
  else if(k==='C')p.bezierCurveTo(c[1],c[2],c[3],c[4],c[5],c[6]);else if(k==='Z')p.closePath();}return p;}
// a body of revolution seen side on (a haft, a grip, a turned leg): half-widths r(x) sampled from x0 to x1
function pTurn(x0,x1,r,n,p){n=n||20;const top=[],bot=[];for(let i=0;i<=n;i++){const x=lerp(x0,x1,i/n),w=r(x);top.push([x,-w]);bot.push([x,w]);}return pPoly([...top,...bot.reverse()],p);}
function mirror(pts){return pts.map(([x,y])=>[x,-y]);}
// a seeded random for scratches, grain and dimples: the same every time for the same design
function rng(a){return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
// ---------- blades ----------
// ye(t) and ys(t): the edge side and the spine side at t, 0 at the base and 1 at the tip (where they meet)
function blade(x0,x1,ye,ys,n){n=n||26;const E=[],Sp=[];for(let i=0;i<=n;i++){const t=i/n,x=lerp(x0,x1,t);E.push([x,ye(t)]);Sp.push([x,ys(t)]);}
  return{E,Sp,n,x0,x1,out:pPoly([...Sp,...E.slice().reverse()])};}
const at=(G,t)=>Math.round(clamp(t,0,1)*G.n);
// the strip along one side (+1 the edge, -1 the spine), k of the way across, from t0 to t1
function bevel(G,side,k,t0,t1){const A=side>0?G.E:G.Sp,B=side>0?G.Sp:G.E,o=[],q=[];
  for(let i=at(G,t0||0);i<=at(G,t1==null?1:t1);i++){o.push(A[i]);q.push([lerp(A[i][0],B[i][0],k),lerp(A[i][1],B[i][1],k)]);}return pPoly([...o,...q.reverse()]);}
// a line across the blade at fraction f from the edge (0) to the spine (1)
function lineAt(G,f,t0,t1,p){const pts=[];for(let i=at(G,t0);i<=at(G,t1);i++)pts.push([lerp(G.E[i][0],G.Sp[i][0],f),lerp(G.E[i][1],G.Sp[i][1],f)]);return pLine(pts,p);}
function sideLine(G,side,t0,t1,p){const A=side>0?G.E:G.Sp,pts=[];for(let i=at(G,t0==null?0:t0);i<=at(G,t1==null?1:t1);i++)pts.push(A[i]);return pLine(pts,p);}
// a wavy line along the blade, for pattern-welded steel: f0 the fraction across, amp its swing, waves along the length
function waveLine(G,f0,amp,waves,ph,t0,t1,p){const pts=[];for(let i=at(G,t0);i<=at(G,t1);i++){const t=i/G.n,f=clamp(f0+amp*Math.sin(t*waves*TAU+ph),.06,.94);
  pts.push([lerp(G.E[i][0],G.Sp[i][0],f),lerp(G.E[i][1],G.Sp[i][1],f)]);}return pLine(pts,p);}
// ---------- the parts list ----------
function Build(id){this.ops=[];this.rimE=null;this.rimS=null;this.rimW=.55;this.glint=null;this.ribbons=[];this.id=id;this.R=rng(hash(id));}
Build.prototype={
  // a part with its ink line and its body colour
  part(p,m,o){o=o||{};if(o.ink!==false)this.ops.push({p,stroke:m.o,lw:o.lw||.9});this.ops.push({p,fill:o.fill||m.b,rule:o.rule});return this;},
  fill(p,col,a,rule){this.ops.push({p,fill:col,a,rule});return this;},
  line(p,col,lw,a,comp){this.ops.push({p,stroke:col,lw,a,comp});return this;},
  // a glowing inlay: a wide faint stroke and a bright thin one, added to the light
  glow(p,col,lw,a){this.ops.push({p,stroke:col,lw:lw*3.2,a:(a||1)*.22,comp:'lighter'});this.ops.push({p,stroke:col,lw,a:a||1,comp:'lighter'});return this;},
  // a metal tube (a knuckle bow, a hook, a wire): ink, body, a thin light down its middle
  tube(p,m,w){this.ops.push({p,stroke:m.o,lw:w+.9});this.ops.push({p,stroke:m.b,lw:w});this.ops.push({p,stroke:m.l,lw:Math.max(.3,w*.32),a:.85});return this;},
  // rivets and studs: a dot of metal with a spark of light
  dots(list,r,m){const p=new Path2D(),q=new Path2D();for(const [x,y] of list){pCirc(x,y,r+.35,p);}this.ops.push({p,fill:m.o});
    const b=new Path2D();for(const [x,y] of list)pCirc(x,y,r,b);this.ops.push({p:b,fill:m.b});for(const [x,y] of list)pCirc(x-r*.3,y-r*.3,r*.42,q);this.ops.push({p:q,fill:m.l,a:.9});return this;},
  rims(G,col,w){this.rimE=sideLine(G,1);this.rimS=sideLine(G,-1);this.rimCol=col;if(w)this.rimW=w;return this;},
  // a turned shaft or grip with its shading: light along the near side, shade along the far
  turned(x0,x1,r,m,o){o=o||{};const p=pTurn(x0,x1,r,o.n);this.part(p,m);
    const hi=[],lo=[];const n=o.n||20;for(let i=0;i<=n;i++){const x=lerp(x0,x1,i/n),w=r(x);hi.push([x,-w*.82]);lo.push([x,-w*.28]);}
    this.fill(pPoly([...hi,...lo.reverse()]),m.l,o.la==null?.55:o.la);
    const s1=[],s2=[];for(let i=0;i<=n;i++){const x=lerp(x0,x1,i/n),w=r(x);s1.push([x,w*.45]);s2.push([x,w*.95]);}this.fill(pPoly([...s1,...s2.reverse()]),m.s,.7);
    if(o.grain&&m.g){const g=new Path2D();for(let k=0;k<o.grain;k++){const y0=(this.R()-.5)*1.2,ph=this.R()*6,xa=lerp(x0,x1,this.R()*.3),xb=lerp(x0,x1,.6+this.R()*.4);g.moveTo(xa,y0);
      for(let x=xa;x<=xb;x+=2.5)g.lineTo(x,y0+Math.sin(x*.21+ph)*.35);}this.line(g,m.g,.32,.75);}
    return p;},
  // a wrap round a grip or a haft: diagonal turns from x0 to x1 at half-width w
  wrap(x0,x1,w,col,base,step,lw){const b=pRound(x0,-w,x1,w,Math.min(.8,w*.6));this.part(b,matOf(base));const p=new Path2D();step=step||1.2;
    for(let x=x0+step*.3;x<x1-step*.2;x+=step){p.moveTo(x,-w);p.lineTo(Math.min(x1,x+step*.75),w);}this.line(p,col,lw||.5,.9);
    const s=new Path2D();for(let x=x0+step*.3;x<x1-step*.2;x+=step){s.moveTo(x+step*.12,-w*.9);s.lineTo(Math.min(x1,x+step*.5),-w*.1);}this.line(s,mix(col,'#ffffff',.4),.25,.6);return this;},
  // metal rings round a shaft
  rings(xs,w,r,m){const p=new Path2D();for(const x of xs)pRound(x-w/2,-r,x+w/2,r,.35,p);this.part(p,m);const l=new Path2D();for(const x of xs){l.moveTo(x-w/2+.2,-r*.7);l.lineTo(x+w/2-.2,-r*.7);}this.line(l,m.l,.35,.9);return this;},
  // a dynamic hanging thing: a ribbon, a tassel, a strap loop
  ribbon(x,y,o){this.ribbons.push(Object.assign({x,y},o));return this;},
  glintAt(x0,x1,y){this.glint={x0,x1,y};return this;},
  done(o){return Object.assign({ops:this.ops,rimE:this.rimE,rimS:this.rimS,rimCol:this.rimCol||'#ffffff',rimW:this.rimW,glint:this.glint,ribbons:this.ribbons},o||{});}};
// a blade painted: ink, body, the spine's shade, the edge's bevel (both edges if two), the ridge, the rims and the glint
function paintBlade(B,G,m,o){o=o||{};B.part(G.out,m,{rule:o.rule});
  if(o.two){B.fill(bevel(G,-1,o.k||.3,0,1),m.s,.75);B.fill(bevel(G,1,o.k||.3,0,1),m.l,.55);B.fill(bevel(G,-1,(o.k||.3)*.45,0,1),m.l,.35);}
  else{B.fill(bevel(G,-1,o.sk||.32,0,1),m.s,.8);B.fill(bevel(G,1,o.k||.3,o.b0||0,1),m.l,.6);B.fill(bevel(G,1,(o.k||.3)*.35,o.b0||0,1),m.e,.55);}
  if(o.ridge!=null)B.line(lineAt(G,o.ridge,o.r0||.02,o.r1||.97),m.e,.32,.55);
  B.rims(G,m.e);if(o.glint!==false)B.glintAt(lerp(G.x0,G.x1,.12),lerp(G.x0,G.x1,.88),lerp(G.E[at(G,.5)][1],G.Sp[at(G,.5)][1],.3));return G;}
// a guard bar seen side on, from y0 to y1 at x, thickness w, with its ends
function guardBar(B,x,y0,y1,w,m,ends){const p=pRound(x-w/2,y0,x+w/2,y1,w*.45);if(ends==='ball'){pCirc(x,y0,w*.72,p);pCirc(x,y1,w*.72,p);}B.part(p,m);
  B.line(pLine([[x-w*.18,y0+.4],[x-w*.18,y1-.4]]),m.l,.35,.85);return p;}
// ---------- the designs ----------
// each: kind (sword, dagger, axe, spear, club), name, what it is, and the function that builds it
const D={};
function def(key,kind,name,what,fn,scab){D[key]={key,kind,name,what,fn,scab:scab||null};}
// scabbard styles: body colour, metal fittings, accent, curve (for a curved blade), kind of sheath
const SC=(body,metal,o)=>Object.assign({body,metal},o||{});

// ===== the named elves =====
// Qadir: Last Orders. A bearded greataxe in blackened steel, the cheek inlaid with coral, a back spike, coral leather on the haft.
def('vargo','axe','Last Orders','a bearded greataxe in blackened steel, its cheek inlaid in coral',B=>{
  const wd=M.walnut,ac='#ff6b5b',hd=M.dark;
  B.part(pPoly([[-22,-2.1],[-22,2.1],[-24,1.3],[-26,0],[-24,-1.3]]),M.iron);
  B.turned(-22.4,70,x=>lerp(1.95,1.72,(x+22)/92),wd,{grain:5});
  B.wrap(-21,-12.5,2.15,ac,'#4a1813',1.25,.5);B.wrap(-4,5.5,2.1,ac,'#4a1813',1.25,.5);
  // langets down the haft, riveted
  const lg=new Path2D();pRound(42,-2.25,58,-1.35,.3,lg);pRound(42,1.35,58,2.25,.3,lg);B.part(lg,M.iron,{lw:.6});B.dots([[45,-1.8],[50,-1.8],[55,-1.8],[45,1.8],[50,1.8],[55,1.8]],.42,M.gold);
  // the back fluke: a short beak curving back toward the butt
  const sp=pCmd([['M',59.4,-3.2],['Q',58.6,-7.8,54.8,-11.2],['Q',61,-10,64,-3.2],['Z']]);B.part(sp,hd);
  B.fill(pCmd([['M',54.8,-11.2],['Q',61,-10,64,-3.2],['L',62.6,-3.2],['Q',59.8,-8.6,54.8,-11.2],['Z']]),hd.l,.5);
  // the bearded blade: a narrow neck at the eye, the top edge straight out, a long curved edge, the beard hooked back down the haft
  const bl=pCmd([['M',66.6,3.2],['L',77.2,9.2],['C',80.4,19.6,68,29.2,43.2,27.4],['Q',53.4,19.8,57.8,3.4],['Z']]);B.part(bl,hd);
  B.fill(pCmd([['M',57.8,3.4],['Q',53.4,19.8,43.2,27.4],['C',47.6,27.9,51.4,27.9,54.8,27.4],['Q',59.4,17.4,61.6,3.3],['Z']]),hd.s,.85);
  B.fill(pCmd([['M',66.6,3.2],['L',77.2,9.2],['L',75.4,10.6],['L',65.6,5],['Z']]),hd.l,.35);
  // the bright edge, and the edge line itself
  const eb=pCmd([['M',77.2,9.2],['C',80.4,19.6,68,29.2,43.2,27.4],['L',46.2,25.2],['C',65.6,26.2,76.6,18.6,74.6,10.4],['Z']]);B.fill(eb,hd.l,.85);
  const el=pCmd([['M',77.2,9.2],['C',80.4,19.6,68,29.2,43.2,27.4]]);B.line(el,hd.e,.55,.9);
  // coral inlay following the edge, with three leaves
  const inl=pCmd([['M',71,9.4],['C',73,17.4,63.6,23.2,50.6,22.6]]);B.glow(inl,ac,.55,.8);
  const lv=new Path2D();for(const [x,y,r] of [[70.6,14.2,.9],[65.2,19.4,.35],[58.4,21.8,.05]]){pEll(x,y,1.5,.62,r,lv);}B.fill(lv,ac,.85);
  // the eye: a collar round the haft with gold rivets, and an iron cap on top
  B.part(pRound(58,-3.4,67.4,3.4,1),hd);B.line(pLine([[58.6,-2.4],[66.8,-2.4]]),hd.l,.4,.7);B.dots([[60.6,0],[64.8,0]],.6,M.gold);
  B.part(pRound(67.2,-1.9,71.6,1.9,.9),M.iron);
  B.rimE=el;B.rimS=pCmd([['M',59.4,-3.2],['Q',58.6,-7.8,54.8,-11.2]]);B.rimCol=hd.e;B.glintAt(50,75,22);
});
// Brask: Reservation. A tall winged spear: a long leaf blade in pale steel over two crescent wings, a lavender ribbon, silver wire.
def('brask','spear','Reservation','a winged spear with a long leaf blade and a lavender ribbon',B=>{
  const ac='#b591ff',sv=M.silver;
  B.part(pPoly([[-38,-1.7],[-38,1.7],[-41,1.2],[-43.4,0],[-41,-1.2]]),sv);
  B.turned(-38.4,71,x=>1.52,M.ash,{grain:6});
  B.wrap(-38,-29,1.75,ac,'#2a2040',1.15,.45);B.wrap(-4.5,6,1.75,ac,'#2a2040',1.15,.45);
  const sw=new Path2D();for(let x=52;x<69;x+=1.6){sw.moveTo(x,-1.5);sw.lineTo(x+1.1,1.5);}B.line(sw,'#dfe3ec',.3,.75);
  // the socket, and the crescent wings
  B.part(pCmd([['M',69,-2.1],['L',76.6,-1.5],['L',76.6,1.5],['L',69,2.1],['Z']]),sv);B.rings([70.2,73.6],.7,2.15,M.silver);
  const wing=s=>pCmd([['M',74.6,-1.3*s],['Q',74,-7.9*s,80.8,-7.3*s],['Q',76.8,-5.6*s,77,-1.3*s],['Z']]);
  B.part(wing(1),sv);B.part(wing(-1),sv);B.line(pCmd([['M',75.4,-2],['Q',75.2,-6.9,80.2,-7.1]]),sv.e,.35,.8);
  // the leaf blade
  const G=blade(76.6,99.5,t=>t<.3?lerp(1.4,4.5,ease(t/.3)):4.5*Math.pow(1-(t-.3)/.7,1.12),t=>-(t<.3?lerp(1.4,4.5,ease(t/.3)):4.5*Math.pow(1-(t-.3)/.7,1.12)));
  paintBlade(B,G,M.bright,{two:true,k:.34,ridge:.5,r0:.04,r1:.98});
  B.line(lineAt(G,.5,.06,.95),'#5f6774',.3,.5);
  B.ribbon(69.6,0,{n:2,len:[14,10],w:1.7,col:ac,shade:'#5c4a8c'});
});
// Iyla: Corkscrew. A wavy kris-like dagger, the blade's pattern following its waves, a ring pommel to hook a finger through.
def('iyla','dagger','Corkscrew','a wavy-bladed dagger with a ring pommel, its grip wrapped in pink silk',B=>{
  const ac='#ff7eb6',rg=M.rosegold,wv=t=>.95*Math.sin(t*5*Math.PI)*(1-t*.55);
  const G=blade(3.2,27.6,t=>wv(t)+2.05*Math.pow(1-t,.72)+(t<.14?1.5*(1-t/.14):0),t=>wv(t)-1.95*Math.pow(1-t,.72));
  paintBlade(B,G,{...M.steel,l:'#e9d2dc',e:'#fff0f6'},{two:true,k:.26});
  B.line(waveLine(G,.36,.0,1,0,.04,.92),'#a39aa8',.3,.6);B.line(waveLine(G,.66,0,1,0,.04,.9),'#3f3a44',.3,.6);
  guardBar(B,2.6,-2.7,3.6,1.3,rg);
  B.wrap(-4.4,2,1.45,ac,'#521a35',1,.45);
  B.part(pRound(-5.2,-1.75,-4.2,1.75,.4),rg);
  const ring=new Path2D();pCirc(-7.2,.2,2.45,ring);B.ops.push({p:ring,stroke:rg.o,lw:2.2});B.ops.push({p:ring,stroke:rg.b,lw:1.3});B.ops.push({p:pCmd([['M',-9.2,-.9],['Q',-8.6,-2.2,-7.2,-2.2]]),stroke:rg.l,lw:.4});
},SC('#2a1620','rosegold',{acc:'#ff7eb6'}));
// Orrin: Butcher's Bill. A great cimeter: a broad, upswept blade of pattern-welded steel, a brass bolster, riveted rosewood.
def('orrin','sword',"Butcher's Bill",'a great cimeter of pattern-welded steel with a rosewood handle and a brass bolster',B=>{
  const ac='#ff9a3c';
  const ys=t=>-2.3-1.95*Math.pow(clamp((t-.58)/.42,0,1),1.7),ye=t=>t<.7?lerp(3.1,5.7,ease(t/.7)):-4.25+9.95*Math.pow(Math.cos((t-.7)/.3*Math.PI/2),.85);
  const G=blade(4.2,58.6,ye,ys,30),hole=pCirc(50.6,-.9,1.02);G.out.addPath(hole);
  paintBlade(B,G,M.steel,{k:.24,rule:'evenodd'});
  const dm=new Path2D();for(let i=0;i<6;i++)waveLine(G,.16+i*.13,.05,3.2+i*.4,i*1.3,.03,.86,dm);B.line(dm,'#8d97a4',.35,.55);
  const dm2=new Path2D();for(let i=0;i<5;i++)waveLine(G,.22+i*.13,.045,2.8+i*.5,i*2.1+1,.03,.84,dm2);B.line(dm2,'#3d444e',.3,.5);
  B.line(pCirc(50.6,-.9,1.02),M.steel.o,.5);
  // maker's mark, in orange
  B.fill(pPoly([[9.6,-1.4],[10.6,-.4],[9.6,.6],[8.6,-.4]]),ac,.85);
  // the handle: rosewood scales with a drop, three brass rivets, an orange spacer
  const hd=pCmd([['M',2.4,-2.1],['L',-7.6,-1.75],['Q',-10.4,-1.6,-10.4,.6],['Q',-10.4,2.9,-8,2.9],['Q',-3,2.6,2.4,2.3],['Z']]);B.part(hd,M.rosewood);
  B.fill(pCmd([['M',2.2,-1.7],['L',-7.5,-1.35],['Q',-9.6,-1.2,-9.8,0],['L',2.2,-.6],['Z']]),M.rosewood.l,.5);
  B.dots([[-7.4,.4],[-3.8,.3],[-.4,.2]],.62,M.brass);B.line(pLine([[1.95,-2],[1.95,2.25]]),ac,.55,.95);
  // the brass bolster
  B.part(pCmd([['M',2.2,-2.6],['L',4.6,-2.5],['Q',4.9,.4,4.6,3.5],['L',2.2,3.3],['Z']]),M.brass);B.line(pLine([[3,-2.2],[3,3]]),M.brass.l,.4,.8);
},SC('#1a120c','brass',{acc:'#ff9a3c',wide:1.55}));
// Hesk: Cold Cut. A long slicing blade, mirror-bright, single-edged, its edge a cold blue line; a small dark guard, pale wood.
def('hesk','sword','Cold Cut','a long single-edged slicing blade, mirror-polished, with an ice-blue edge',B=>{
  const ac='#62b6ff',ys=t=>-1.55+.35*Math.pow(t,6),ye=t=>t<.8?lerp(2.35,2.05,t/.8):-1.2+3.25*Math.pow(Math.cos((t-.8)/.2*Math.PI/2),.8);
  const G=blade(4.8,58.8,ye,ys,30);paintBlade(B,G,M.bright,{k:.52,sk:.3});
  B.line(lineAt(G,.52,.02,.95),'#f4f8fc',.32,.8);B.glow(sideLine(G,1,.06,.94),'#9fd6ff',.42,.7);
  // the collar, the guard, the handle with its horn ferrule
  B.part(pRound(3.4,-2,5,2.65,.4),M.silver);
  B.part(pRound(2.3,-3.7,3.5,3.7,.55),M.dark);B.line(pRound(2.45,-3.5,3.35,3.5,.45),ac,.32,.9);
  const hd=pCmd([['M',2.3,-1.7],['L',-10.4,-1.45],['L',-10.6,1.55],['L',2.3,1.85],['Z']]);B.part(hd,M.pale);
  B.fill(pPoly([[2.2,-1.3],[-10.3,-1.05],[-10.35,-.35],[2.2,-.5]]),M.pale.l,.6);B.fill(pPoly([[2.2,1.05],[-10.4,.85],[-10.45,1.45],[2.2,1.75]]),M.pale.s,.6);
  B.part(pRound(.9,-1.9,2.4,1.95,.35),M.blackwood);B.line(pLine([[-2,-1.6],[-2,1.7]]),ac,.4,.9);
},SC('#1b1d22','silver',{acc:'#62b6ff',kind:'wood'}));
// Odile: Eighty-Six. A chef's knife: a deep heel, a belly that rocks, the black forge skin left on the spine with hammer marks.
def('odile','dagger','Eighty-Six',"a chef's knife with a hammered black spine and a bright edge, yellow-banded handle",B=>{
  const ac='#ffe066',ys=t=>-2.05+.75*Math.pow(t,1.6)+(t>.86?(t-.86)/.14*.8:0),ye=t=>t<.42?lerp(3.65,3.35,t/.42):-.45+3.8*Math.pow(Math.cos((t-.42)/.58*Math.PI/2),.75);
  const G=blade(2.6,27.6,ye,ys,28);paintBlade(B,G,M.bright,{k:.36});
  // the black forge skin with its wavy line, and hammer dimples
  const ku=[],kl=[];for(let i=0;i<=at(G,.93);i++){ku.push(G.Sp[i]);const t=i/G.n,f=.58+.05*Math.sin(t*14);kl.push([lerp(G.Sp[i][0],G.E[i][0],f),lerp(G.Sp[i][1],G.E[i][1],f)]);}
  B.fill(pPoly([...ku,...kl.reverse()]),'#25272c',.95);
  const dp=new Path2D();for(let x=4.5;x<22;x+=2.1)for(const f of [.2,.42]){const i=Math.round((x-G.x0)/(G.x1-G.x0)*G.n),y=lerp(G.Sp[i][1],G.E[i][1],f)+((x*7)%3-1)*.15;pEll(x+(f>.3?1:0),y,.55,.4,0,dp);}
  B.fill(dp,'#5c616b',.8);
  B.part(pRound(1.3,-1.85,2.7,1.85,.3),{...M.brass,b:'#c9ab42',l:'#fff0a8'});
  const hd=pCmd([['M',1.4,-1.6],['L',-6,-1.45],['L',-6.2,1.45],['L',1.4,1.6],['Z']]);B.part(hd,M.blackwood);
  B.fill(pPoly([[1.3,-1.2],[-5.9,-1.05],[-5.95,-.4],[1.3,-.45]]),M.blackwood.l,.55);B.part(pRound(-6.8,-1.5,-5.8,1.5,.35),{...M.brass,b:'#c9ab42',l:'#fff0a8'});
},SC('#16141a','brass',{acc:'#ffe066',kind:'wood'}));
// Sable: Clearance. An elven longsword, silver-white, a long fuller, a swept silver hilt and a pearl pommel.
def('sable','sword','Clearance','an elven longsword with a swept silver hilt and a pearl pommel',B=>{
  const w=t=>t<.6?lerp(2.6,2.12,t/.6):t<.84?lerp(2.12,2.38,Math.sin((t-.6)/.24*Math.PI/2)):2.38*Math.pow(1-(t-.84)/.16,1.05);
  const G=blade(4.6,58.6,w,t=>-w(t),30);paintBlade(B,G,M.bright,{two:true,k:.3});
  B.line(lineAt(G,.5,.04,.7),'#555d69',.85,.85);B.line(lineAt(G,.42,.04,.7),'#f4f7fb',.28,.7);
  B.glow(lineAt(G,.5,.05,.68),'#e3e6f2',.25,.35);
  // the swept hilt: rings round the ricasso, the bar with curled ends, the knuckle bow back to the pommel
  const rg=pEll(4.9,0,1.55,4.5);B.ops.push({p:rg,stroke:M.silver.o,lw:1.55});B.ops.push({p:rg,stroke:M.silver.b,lw:.8});
  guardBar(B,3.2,-7.4,7.4,1.35,M.silver,'ball');
  const kb=pCmd([['M',3.2,6.6],['Q',-2.6,8.6,-8.4,2.6]]);B.tube(kb,M.silver,1.05);
  // the grip in white leather with silver wire, and the pearl
  B.wrap(-7.4,2.6,1.55,'#eef0f5','#7f8590',.95,.32);
  const pr=pEll(-9.2,0,2.05,2.45);B.part(pr,{...M.silver,b:'#e6e9ef',o:'#2a2d33'});B.fill(pEll(-9.6,.5,1.4,1.5),'#b7bdc8',.55);B.fill(pEll(-9.6,-1,.6,.5),'#ffffff',.95);
},SC('#80858e','silver',{acc:'#e3e6f2'}));
// Doran: Doorman. A partisan: a broad head with two hooked wings, dark iron with bright edges, red bands and a red horsehair tassel.
def('varn','spear','Doorman','a partisan with hooked wings, red-lacquered bands and a red horsehair tassel',B=>{
  const ac='#e0464f';
  B.part(pRound(-43.2,-2.6,-37,2.6,1.1),M.iron);B.line(pLine([[-42.2,-1.8],[-38,-1.8]]),M.iron.l,.4,.8);
  B.turned(-37.6,72,x=>1.95,M.tar,{grain:0,la:.4});
  B.rings([-10,14,30,46],2.2,2.15,{...matOf('#b8323c'),o:'#1a0507'});
  const lg=new Path2D();pRound(56,-2.35,72,-1.5,.3,lg);pRound(56,1.5,72,2.35,.3,lg);B.part(lg,M.iron,{lw:.6});B.dots([[59,-1.92],[64,-1.92],[69,-1.92],[59,1.92],[64,1.92],[69,1.92]],.45,M.iron);
  B.part(pCmd([['M',70,-2.45],['L',77.4,-1.85],['L',77.4,1.85],['L',70,2.45],['Z']]),M.iron);B.rings([72.4],.9,2.6,M.iron);
  const ear=s=>pCmd([['M',77.2,-1.7*s],['L',78.4,-6.4*s],['L',86.8,-10.2*s],['Q',82.4,-7.6*s,83.2,-4.4*s],['L',82.2,-1.7*s],['Z']]);
  B.part(ear(1),M.dark);B.part(ear(-1),M.dark);B.line(pLine([[78.6,-6.6],[86.8,-10.2]]),M.dark.e,.4,.85);B.line(pLine([[78.6,6.6],[86.8,10.2]]),M.dark.l,.4,.7);
  const G=blade(81.6,100.6,t=>4.5*Math.pow(1-t,.9),t=>-4.5*Math.pow(1-t,.9));
  paintBlade(B,G,M.dark,{two:true,k:.3,ridge:.5});
  B.ribbon(69.6,0,{n:5,len:[11,12.5,10,12,9.5],w:1.05,col:ac,shade:'#6e161c',tassel:true});
});
// Kessa: Skeleton Key. A needle of a rondel dagger in black steel, its edges lit magenta, discs at the guard and a key's bow for a pommel.
def('kessa','dagger','Skeleton Key',"a black rondel stiletto with magenta-lit edges and a key's bow for a pommel",B=>{
  const ac='#ff5fc0',w=t=>1.35*Math.pow(1-t,.9);
  const G=blade(3.8,28.4,w,t=>-w(t),24);paintBlade(B,G,M.black,{two:true,k:.4});
  B.line(lineAt(G,.5,.02,.96),'#8a92a0',.3,.75);B.glow(sideLine(G,1,.03,.95),ac,.3,.75);B.glow(sideLine(G,-1,.03,.95),ac,.24,.45);
  const disc=(x,r)=>{const p=pRound(x-.75,-r,x+.75,r,.6);B.part(p,M.black);B.line(pRound(x-.55,-r+.25,x+.55,r-.25,.45),ac,.3,.85);};
  disc(3,4.1);
  B.wrap(-3.9,2.3,1.38,'#3c3542','#0c0b0e',1,.4);
  disc(-4.6,2.6);
  const bow=new Path2D();pCirc(-7.1,0,1.25,bow);pCirc(-8.6,-1.55,1.25,bow);pCirc(-8.6,1.55,1.25,bow);
  B.ops.push({p:bow,stroke:'#050506',lw:1.6});B.ops.push({p:bow,stroke:'#a9b1bc',lw:.75});B.fill(pCirc(-8,0,.42),ac,.9);
},SC('#141216','black',{acc:'#ff5fc0'}));
// Kade: Severance. A black elven longsword with a crimson inlay down its fuller, hawk-wing quillons, a crimson stone for a pommel.
def('kade','sword','Severance','a black elven longsword with a crimson inlay, hawk-wing quillons and a crimson stone',B=>{
  const ac='#ff4d6d',w=t=>t<.78?lerp(2.75,2.15,t/.78):2.15*Math.pow(1-(t-.78)/.22,1.12);
  const G=blade(4.4,58.8,w,t=>-w(t),30);paintBlade(B,G,M.black,{two:true,k:.27});
  B.fill(bevel(G,1,.12,0,1),'#d5dbe4',.5);B.fill(bevel(G,-1,.12,0,1),'#9aa3b0',.45);
  const fu=lineAt(G,.5,.05,.74);B.line(fu,'#060607',1.25,.95);B.glow(fu,ac,.5,.9);
  const rn=new Path2D();for(let x=10;x<44;x+=4.4){rn.moveTo(x,-.75);rn.lineTo(x+.6,0);rn.lineTo(x,.75);}B.line(rn,ac,.3,.75,'lighter');
  // hawk wings swept toward the blade, a crimson line along each
  const wing=s=>pCmd([['M',1.7,-1.4*s],['Q',.2,-4.8*s,1.1,-7.4*s],['Q',3.2,-9.8*s,6.2,-9.8*s],['Q',4.4,-8.2*s,4.2,-6.4*s],['L',5.1,-6*s],['Q',3.9,-5.2*s,3.9,-3.8*s],['L',4.6,-3.5*s],['Q',3.8,-2.4*s,3.9,-1.4*s],['Z']]);
  B.part(wing(1),M.black);B.part(wing(-1),M.black);B.part(pRound(1.5,-1.7,4.4,1.7,.5),M.black);
  B.glow(pCmd([['M',2.2,-2],['Q',1.6,-5.4,2.6,-7.4],['Q',3.9,-8.9,5.6,-9.4]]),ac,.3,.7);B.glow(pCmd([['M',2.2,2],['Q',1.6,5.4,2.6,7.4],['Q',3.9,8.9,5.6,9.4]]),ac,.3,.5);
  B.wrap(-7.4,1.6,1.55,ac,'#120f15',1.05,.38);
  // the stone in a black claw
  B.part(pRound(-8.2,-1.9,-7.2,1.9,.4),M.black);
  const gm=pPoly([[-8.1,-2.2],[-9.6,-2.6],[-11.2,-1.3],[-11.4,1.3],[-9.6,2.6],[-8.1,2.2]]);B.part(gm,{b:'#7a1426',o:'#14030a'});
  B.fill(pPoly([[-8.3,-1.9],[-9.6,-2.2],[-10.6,-1],[-9.4,-.2]]),ac,.9);B.fill(pPoly([[-9.4,.3],[-10.8,1.1],[-9.6,2.2],[-8.4,1.8]]),'#b3203c',.8);B.fill(pCirc(-9.7,-1.3,.4),'#ffd6de',.95);
},SC('#121015','black',{acc:'#ff4d6d'}));

// Kael's hip dagger: the arc-blade's companion. A short curved blade of blued steel with a gilded edge and the same thread of light
// down its fuller, a gold crescent guard with a cyan stone, black ray-skin under gold wire and a ring pommel.
def('kaeldagger','dagger','Hip dagger',"Ilyas's hip dagger: a short curved blade of blued steel, gilded on the edge, with the arc-blade's light down its fuller",B=>{
  const bl={b:'#141b26',s:'#090d13',l:'#c9a465',e:'#ffd89a',o:'#04060a'},g={b:'#e2b65a',s:'#9c7428',l:'#ffe7a8',e:'#fff6dc',o:'#1a1206'},cv=t=>4*1.25*t*(1-t);
  const G=blade(3.4,27.8,t=>cv(t)+2.05*Math.pow(1-t,.8),t=>cv(t)-1.75*Math.pow(1-t,.8),24);paintBlade(B,G,bl,{k:.24,sk:.3});
  B.fill(bevel(G,-1,.18,0,1),'#3d4c63',.45);
  const fu=lineAt(G,.56,.05,.8);B.line(fu,'#010304',.85,1);B.glow(fu,'#7ff3e3',.36,.85);
  const vn=new Path2D();for(let i=0;i<=24;i++){const t=.06+i/24*.66,x=lerp(G.x0,G.x1,t),y=cv(t)-1.75*Math.pow(1-t,.8)*.55+.22*Math.sin(t*Math.PI*9);i?vn.lineTo(x,y):vn.moveTo(x,y);}B.line(vn,g.b,.2,.85);
  B.part(pCmd([['M',3.9,-4.4],['Q',.4,-3.8,.9,0],['Q',.4,4.4,3.6,5.2],['Q',2.3,2.6,2.7,0],['Q',2.3,-2.3,3.9,-4.4],['Z']]),g);
  B.fill(pEll(2.1,0,.62,.95),'#062a28');B.glow(pEll(2.1,0,.42,.72),'#7ff3e3',.3,.9);
  B.part(pRound(-4.8,-1.45,.9,1.45,.7),{b:'#0e0c14',o:'#020203'});
  const w=new Path2D();for(let x=-4.6;x<.7;x+=1.35){w.moveTo(x,-1.4);w.lineTo(Math.min(.8,x+1.25),1.4);w.moveTo(Math.min(.8,x+1.25),-1.4);w.lineTo(x,1.4);}B.line(w,g.s,.5,.95);B.line(w,g.b,.28,.95);
  B.part(pRound(-5.7,-1.2,-4.7,1.2,.4),g);
  const ring=pCirc(-7.5,0,1.7);B.ops.push({p:ring,stroke:g.o,lw:1.6});B.ops.push({p:ring,stroke:g.b,lw:.95});B.ops.push({p:pCmd([['M',-8.95,-.5],['Q',-8.7,-1.55,-7.5,-1.7]]),stroke:g.l,lw:.28,a:.9});
  B.ribbon(-9.3,0,{n:1,len:[3.8],w:.3,col:g.b,shade:g.s,bead:'#7ff3e3'});
},SC('#0b0a10','gold',{acc:'#7ff3e3'}));
// The same dagger in the Pit (Act I): the gilt has gone out of him and out of it. The gilding is dull as old brass, the fuller dark, the
// stone black, and the tassel is gone.
def('kaeldull','dagger','Hip dagger',"Ilyas's hip dagger with the light gone out of it: blued steel, the gilding dull, the fuller dark",B=>{
  const bl={b:'#141b26',s:'#090d13',l:'#7d8794',e:'#aab2bb',o:'#04060a'},g={b:'#4f4a40',s:'#2c2924',l:'#80796b',e:'#a59f92',o:'#0a0908'},cv=t=>4*1.25*t*(1-t);
  const G=blade(3.4,27.8,t=>cv(t)+2.05*Math.pow(1-t,.8),t=>cv(t)-1.75*Math.pow(1-t,.8),24);paintBlade(B,G,bl,{k:.24,sk:.3});
  B.fill(bevel(G,-1,.18,0,1),'#2c3644',.45);
  const fu=lineAt(G,.56,.05,.8);B.line(fu,'#010304',.85,1);
  B.part(pCmd([['M',3.9,-4.4],['Q',.4,-3.8,.9,0],['Q',.4,4.4,3.6,5.2],['Q',2.3,2.6,2.7,0],['Q',2.3,-2.3,3.9,-4.4],['Z']]),g);
  B.fill(pEll(2.1,0,.62,.95),'#0d1110');
  B.part(pRound(-4.8,-1.45,.9,1.45,.7),{b:'#0e0c14',o:'#020203'});
  const w=new Path2D();for(let x=-4.6;x<.7;x+=1.35){w.moveTo(x,-1.4);w.lineTo(Math.min(.8,x+1.25),1.4);w.moveTo(Math.min(.8,x+1.25),-1.4);w.lineTo(x,1.4);}B.line(w,g.s,.5,.95);
  B.part(pRound(-5.7,-1.2,-4.7,1.2,.4),g);
  const ring=pCirc(-7.5,0,1.7);B.ops.push({p:ring,stroke:g.o,lw:1.6});B.ops.push({p:ring,stroke:g.b,lw:.95});
},SC('#0b0a10','worn'));
// Tamm's yard broom (Act I, scene 9: she shoves him round the yard with it): a pale ash handle worn dark where the hands go, twine
// binding, and a straw head splayed and worn down on one side
def('broom','spear','Broom',"Tamm's yard broom, its straw worn down on one side",B=>{
  B.turned(-38,73,x=>1.3,M.ash,{grain:6});
  B.part(pRound(-6,-1.42,10,1.42,.6),{b:'#4f4231',s:'#2f271c',l:'#7d6a50',o:'#0e0b07'});
  B.rings([73.6,75.6,77.6],1.1,1.75,{b:'#6e5a3a',s:'#3e321f',l:'#a48c62',e:'#c9b38a',o:'#120e07'});
  const st={b:'#a8915c',s:'#6d5a32',l:'#d8c58e',e:'#efe2b4',o:'#1a140a'};
  B.part(pCmd([['M',76.5,-2.2],['Q',86,-4.6,97.5,-7.4],['L',99.4,-3.6],['L',98.6,1.6],['Q',95,5.6,93.4,6.3],['Q',85,4.1,76.5,2.2],['Z']]),st);
  const br=new Path2D();for(let i=0;i<9;i++){const u=i/8,y0=lerp(-2,2,u),y1=lerp(-6.8,5.8,u);br.moveTo(78.5,y0);br.lineTo(lerp(97.4,93.6,u)+(i%2?.6:0),y1);}
  B.line(br,st.s,.35,.8);
});

// ===== an elf's weapon of another kind: elven work in his or her colours =====
const HOUSE={
  Qadir:{metal:'dark',fit:'gold',grip:'#4a1813',acc:'#ff6b5b'},Brask:{metal:'bright',fit:'silver',grip:'#2a2040',acc:'#b591ff'},Iyla:{metal:'steel',fit:'rosegold',grip:'#521a35',acc:'#ff7eb6'},
  Orrin:{metal:'steel',fit:'brass',grip:'#4b2219',acc:'#ff9a3c'},Hesk:{metal:'bright',fit:'silver',grip:'#5b513f',acc:'#62b6ff'},Odile:{metal:'steel',fit:'brass',grip:'#17161a',acc:'#ffe066'},
  Sable:{metal:'bright',fit:'silver',grip:'#7f8590',acc:'#e3e6f2'},Doran:{metal:'dark',fit:'iron',grip:'#1f1b17',acc:'#e0464f'},Kessa:{metal:'black',fit:'silver',grip:'#0c0b0e',acc:'#ff5fc0'},
  Kade:{metal:'black',fit:'black',grip:'#120f15',acc:'#ff4d6d'},'Mr. Hallowell':{metal:'bright',fit:'champagne',grip:'#141216',acc:'#d8cfa8'},
  // Kael's common weapons are made to go with the arc-blade: blackened steel, ebony hafts, gold fittings with the gold vine, the
  // crescent guard and the ring pommel with its cord and bead, and the thread's light in the fuller and in a cyan stone
  Kael:{metal:'black',fit:'gold',grip:'#0e0c14',acc:'#7ff3e3',wire:'#e2b65a',haft:'blackwood',vine:'#e2b65a',stone:'#7ff3e3',crescent:true,ring:true}};
// a vine through these points with a leaf at every few, alternately on one side and the other
function vineAlong(B,pts,col,lw,every){const lf=new Path2D();every=every||3;let up=0;
  for(let i=1;i<pts.length-1;i++)if(i%every===1){const [x,y]=pts[i],[x2,y2]=pts[i+1],r=Math.atan2(y2-y,x2-x),s=(up++)%2?-1:1;
    pEll(x+.45*Math.cos(r)-s*.36*Math.sin(r),y+.45*Math.sin(r)+s*.36*Math.cos(r),.55,.21,r+s*.5,lf);}
  B.line(pLine(pts),col,lw||.2,.9);B.fill(lf,col,.9);}
// a cyan stone set in gold: dark under the glass, the light in it, a spark
function stoneAt(B,x,y,rx,ry,col){B.fill(pEll(x,y,rx+.3,ry+.3),'#1a1206');B.fill(pEll(x,y,rx,ry),'#062a28');B.glow(pEll(x,y,rx*.66,ry*.72),col,.3,.9);B.fill(pEll(x-rx*.3,y-ry*.35,rx*.26,ry*.26),'#ffffff',.9);}
function houseBuild(name,kind){const H=HOUSE[name]||HOUSE.Sable,m=M[H.metal],f=M[H.fit],ac=H.acc,hm=M[H.haft];
  return B=>{
    if(kind==='sword'||kind==='dagger'){const dg=kind==='dagger',L=dg?27:58,x0=dg?3:4.4,W=dg?2.1:2.6,w=t=>t<.55?lerp(W,W*.82,t/.55):t<.8?lerp(W*.82,W*.92,Math.sin((t-.55)/.25*Math.PI/2)):W*.92*Math.pow(1-(t-.8)/.2,1.1);
      const G=blade(x0,L,w,t=>-w(t),dg?22:28);paintBlade(B,G,m,{two:true,k:.3});B.line(lineAt(G,.5,.05,dg?.8:.66),m.s,dg?.5:.8,.9);B.glow(lineAt(G,.5,.06,dg?.75:.62),ac,.28,.6);
      if(H.vine){const pts=[];for(let i=0;i<=30;i++){const t=.06+i/30*.6,j=at(G,t),q=.79+.07*Math.sin(t*TAU*4.4);pts.push([lerp(G.E[j][0],G.Sp[j][0],q),lerp(G.E[j][1],G.Sp[j][1],q)]);}vineAlong(B,pts,H.vine,.2,3);}
      if(H.crescent){const g=dg?.62:1;B.part(pCmd([['M',4.9*g+.2,-7.3*g],['Q',.1,-6.3*g,.9,0],['Q',.1,6.3*g,4.9*g+.2,7.3*g],['Q',2.5,3.9*g,3.2,0],['Q',2.5,-3.9*g,4.9*g+.2,-7.3*g],['Z']]),f);
        B.line(pCmd([['M',4.3*g,-6.4*g],['Q',1.2,-5.2*g,1.85,0],['Q',1.2,5.2*g,4.3*g,6.4*g]]),f.o,.3,.7);B.line(pCmd([['M',4.6*g,-7*g],['Q',.7,-5.9*g,1.25,-.6]]),f.l,.32,.85);
        stoneAt(B,2.35,0,.62,.98,H.stone||ac);}
      else{const g=dg?4.6:7.6,wing=s=>pCmd([['M',2.2,-1.2*s],['Q',1.4,-g*.6*s,3.6,-g*s],['Q',3.4,-g*.55*s,3.6,-1.2*s],['Z']]);B.part(wing(1),f);B.part(wing(-1),f);}
      B.wrap(dg?-4.2:-7.4,H.crescent?.9:2,dg?1.4:1.55,H.wire||ac,H.grip,1.05,.4);const px=dg?-5.2:-8.6;
      if(H.ring){B.part(pRound(px+.1,-1.35,px+1.3,1.35,.45),f);const ring=pCirc(px-1.5,0,1.75);B.ops.push({p:ring,stroke:f.o,lw:1.7});B.ops.push({p:ring,stroke:f.b,lw:1});
        B.ops.push({p:pCmd([['M',px-3.05,-.5],['Q',px-2.8,-1.65,px-1.5,-1.75]]),stroke:f.l,lw:.3,a:.9});B.ribbon(px-3.3,0,{n:1,len:[5.2],w:.36,col:f.b,shade:f.s,bead:H.stone||ac});}
      else B.part(pCmd([['M',px+1.2,-1.6],['Q',px-1.8,-2.6,px-1.6,0],['Q',px-1.8,2.6,px+1.2,1.6],['Z']]),f);}
    else if(kind==='spear'){B.part(pPoly([[-38,-1.6],[-38,1.6],[-41,1.1],[-43,0],[-41,-1.1]]),f);B.turned(-38.4,74,x=>1.5,hm||M.ash,{grain:4});
      if(H.vine){const pts=[];for(let x=7.4;x<=69;x+=.9)pts.push([x,1.02*Math.sin((x-7.4)*.36)]);vineAlong(B,pts,H.vine,.18,5);B.rings([70.4],.9,1.85,f);}
      B.wrap(-38,-29,1.7,H.wire||ac,H.grip,1.15,.45);B.wrap(-4.5,6,1.7,H.wire||ac,H.grip,1.15,.45);B.part(pCmd([['M',72,-2],['L',77.6,-1.4],['L',77.6,1.4],['L',72,2],['Z']]),f);
      if(H.stone)stoneAt(B,74.8,0,.55,.9,H.stone);
      const w=t=>t<.28?lerp(1.3,4,ease(t/.28)):4*Math.pow(1-(t-.28)/.72,1.1);const G=blade(77.4,98.5,w,t=>-w(t));paintBlade(B,G,m,{two:true,k:.33,ridge:.5});B.glow(lineAt(G,.5,.1,.7),ac,.3,.6);}
    else{B.part(pPoly([[-22,-2],[-22,2],[-24.6,0]]),f);B.turned(-22.4,70,x=>1.8,hm||M.walnut,{grain:4});B.wrap(-21,-12.5,2.05,H.wire||ac,H.grip,1.25,.5);B.wrap(-4,5.5,2.05,H.wire||ac,H.grip,1.25,.5);
      if(H.vine){const pts=[];for(let x=7;x<=55;x+=.9)pts.push([x,1.25*Math.sin((x-7)*.33)]);vineAlong(B,pts,H.vine,.2,5);B.rings([55.8],.9,2.2,f);}
      const bl=pCmd([['M',66,3],['Q',73,6,75.6,10],['C',78,19,66,27.4,52.4,24],['Q',54,13,57.6,3],['Z']]);B.part(bl,m);
      B.fill(pCmd([['M',75.6,10],['C',78,19,66,27.4,52.4,24],['C',63.4,24.6,73,18.8,73,10.8],['Z']]),m.l,.8);B.line(pCmd([['M',75.6,10],['C',78,19,66,27.4,52.4,24]]),m.e,.5,.9);
      B.glow(pCmd([['M',69.4,9],['C',70.4,15.6,64,19.8,57,19.6]]),ac,.45,.7);
      if(H.vine){const pts=[];for(let i=0;i<=16;i++){const u=i/16,x=lerp(60.2,71.2,u),y=lerp(5.4,8.6,u)+.5*Math.sin(u*TAU*1.5);pts.push([x,y]);}vineAlong(B,pts,H.vine,.2,3);}
      B.part(pCmd([['M',58,-3],['Q',61,-7.6,66.4,-8.6],['Q',64.6,-5,66.4,-3],['Z']]),m);
      B.part(pRound(57.6,-3.3,67,3.3,1),m);B.dots(H.stone?[[59.4,0],[65.4,0]]:[[60.4,0],[64.4,0]],.55,f);if(H.stone)stoneAt(B,62.4,0,.62,.95,H.stone);
      B.rimE=pCmd([['M',75.6,10],['C',78,19,66,27.4,52.4,24]]);B.rimS=pLine([[58,-3.3],[67,-3.3]]);B.rimCol=m.e;B.glintAt(54,74,20);}
  };}

// ===== the crews: what each room has to hand =====
// the dining room: waiters and floor muscle
def('sabre','sword','Champagne sabre','a curved sabrage sabre with a brass stirrup hilt',B=>{
  const cv=t=>-2.5*t*t,ys=t=>cv(t)-1.35*(t<.82?1:Math.pow(1-(t-.82)/.18,.9)),ye=t=>cv(t)+2.45*Math.pow(1-Math.pow(t,7),.6)*(t<.97?1:(1-t)/.03);
  const G=blade(4.4,57.4,ye,ys,30);paintBlade(B,G,M.bright,{k:.34});
  const et=new Path2D();for(let i=0;i<4;i++){const x=7+i*2.8;et.moveTo(x,-.6);et.quadraticCurveTo(x+1.4,-1.8,x+2.6,-.4);et.quadraticCurveTo(x+1.4,.6,x+.4,-.2);}B.line(et,'#e4e9f0',.25,.6);
  B.part(pRound(-7.8,-1.5,2.4,1.5,.6),M.ebony);const wl=new Path2D();for(let x=-7;x<2;x+=1.1){wl.moveTo(x,-1.4);wl.lineTo(x+.8,1.4);}B.line(wl,M.brass.l,.3,.75);
  guardBar(B,3,-4.6,5.6,1.3,M.brass);B.tube(pCmd([['M',3,5.2],['Q',-2.4,7.6,-8.6,2.3]]),M.brass,1.15);
  B.part(pCmd([['M',-7.6,-1.6],['Q',-10.6,-1.8,-10.6,.4],['Q',-10.2,2.6,-8,2.4],['Z']]),M.brass);B.fill(pEll(-9.4,-.5,.9,.6),M.brass.l,.8);
},SC('#141113','brass',{curve:2.5}));
def('carving','dagger','Carving knife','a long carving knife with a riveted ebony handle',B=>{
  const ys=t=>-1.35+.55*Math.pow(t,3),ye=t=>t<.55?2.05:-0.8+2.85*Math.pow(Math.cos((t-.55)/.45*Math.PI/2),.7);
  const G=blade(3,27.4,ye,ys,24);paintBlade(B,G,M.bright,{k:.4});
  B.part(pRound(1.5,-1.75,3.1,2.15,.4),M.nickel);
  B.part(pCmd([['M',1.6,-1.55],['L',-5.4,-1.45],['Q',-6.4,-1.3,-6.4,.1],['Q',-6.4,1.7,-5.4,1.75],['L',1.6,1.85],['Z']]),M.ebony);B.dots([[-4.4,.15],[-2,.15],[.4,.15]],.5,M.nickel);
},SC('#191514','nickel',{kind:'leather'}));
def('steak','dagger','Steak knife','a serrated steak knife with a walnut handle and brass rivets',B=>{
  const ys=t=>-1.25+.2*t-(t>.75?(t-.75)/.25*.9:0),pts=[];
  const G=blade(3,25.8,t=>t<.62?1.75:-2.15+3.9*Math.pow(Math.cos((t-.62)/.38*Math.PI/2),.75),ys,22);
  // the serrations: small teeth cut into the edge
  const sp=[...G.Sp];const ed=[];for(let i=0;i<=G.n;i++){const [x,y]=G.E[i];ed.push([x,y]);}
  const teeth=[];for(let x=4;x<22;x+=1.05){const i=Math.min(G.n,Math.round((x-3)/(22.8)*G.n)),y=G.E[i][1];teeth.push([x,y],[x+.5,y-.55]);}
  const out=pPoly([...sp,...ed.slice(at(G,.84)).reverse(),...teeth.slice().reverse(),[3,G.E[0][1]]]);
  B.part(out,M.bright);B.fill(bevel(G,-1,.32,0,1),M.bright.s,.8);B.fill(pPoly([...teeth,[22,.3],[4,.3]]),M.bright.l,.45);B.rims(G,M.bright.e);B.glintAt(6,22,-.2);
  B.part(pCmd([['M',2.6,-1.55],['L',-5.2,-1.6],['Q',-6.2,-1.4,-6.2,.2],['Q',-6,1.8,-5,1.8],['L',2.6,1.75],['Z']]),M.walnut);B.dots([[-3.6,.1],[.2,.1]],.5,M.brass);
},SC('#1e1712','brass',{kind:'leather'}));
def('fireaxe','axe','Fire axe','a red-headed fire axe with a pick on the back',B=>{
  const r=M.redpaint;B.turned(-22.4,68.6,x=>lerp(1.8,1.6,(x+22)/90),M.hickory,{grain:6});
  B.part(pRound(-22.8,-2.05,-19.4,2.05,.9),r);B.part(pRound(48,-1.85,57,1.85,.4),r);
  const bl=pCmd([['M',65.6,3],['L',73.2,8.6],['Q',71.2,15.6,62.8,20.6],['L',57.4,3.4],['Z']]);B.part(bl,r);
  B.fill(pCmd([['M',73.2,8.6],['Q',71.2,15.6,62.8,20.6],['L',61.6,17.6],['Q',68.8,13.8,70.4,8.6],['Z']]),M.steel.l,.95);B.line(pCmd([['M',73.2,8.6],['Q',71.2,15.6,62.8,20.6]]),'#ffffff',.4,.8);
  const pk=pPoly([[58,-3],[61.6,-15.6],[63.2,-15.4],[66.2,-3]]);B.part(pk,r);B.fill(pPoly([[61.6,-15.6],[63.2,-15.4],[62.9,-12.2],[61.2,-12.6]]),M.steel.l,.9);
  B.part(pRound(57.4,-3.3,66.6,3.3,.9),r);B.fill(pRound(58,-2.8,66,-1.2,.5),r.l,.55);
  B.rimE=pCmd([['M',73.2,8.6],['Q',71.2,15.6,62.8,20.6]]);B.rimS=pLine([[58,-3],[61.6,-15.6]]);B.rimCol='#ffffff';B.glintAt(62,72,15);
});
def('windowpole','spear','Window pole','a brass-hooked window pole with its tip ground to a point',B=>{
  B.part(pRound(-39,-1.6,-35.4,1.6,.6),M.brass);B.turned(-35.6,84,x=>1.42,M.walnut,{grain:5});
  B.part(pCmd([['M',82.6,-1.9],['L',89,-1.3],['L',89,1.3],['L',82.6,1.9],['Z']]),M.brass);B.rings([84],.8,2,M.brass);
  B.tube(pCmd([['M',87.6,1],['Q',89,6.6,92.4,6.8],['Q',95,6.4,93.8,4.2]]),M.brass,1.3);
  const G=blade(88.6,98.4,t=>1.25*Math.pow(1-t,.9),t=>-1.25*Math.pow(1-t,.9),12);paintBlade(B,G,M.steel,{two:true,k:.4});
});
def('tableleg','club','Table leg','a turned walnut table leg, torn from its table',B=>{
  const r=x=>x<5.6?2.3:x<7.4?2.75:x<9.4?1.85:x<30?lerp(1.95,3.65,Math.sin(clamp((x-9.4)/(30-9.4),0,1)*Math.PI*.62)):x<35?lerp(3.6,1.9,(x-30)/5):x<37.6?2.65:lerp(1.95,1.55,(x-37.6)/6.4);
  B.turned(-5,44,r,M.walnut,{n:60,grain:5});
  const rl=new Path2D();for(const x of [5.6,7.4,9.4,35,37.6]){rl.moveTo(x,-r(x));rl.lineTo(x,r(x));}B.line(rl,M.walnut.s,.45,.9);
  B.part(pRound(43.6,-2,46.4,2,.9),M.brass);B.fill(pPoly([[-5,-2.3],[-6.4,-1.4],[-5.6,-.6],[-6.8,.4],[-5.4,1.1],[-6.2,2],[-5,2.3]]),M.walnut.l,.7);
  B.glintAt(12,30,-2.2);
});
// the kitchen: cooks and porters
def('kfalchion','sword','Kitchen falchion','a heavy, straight-backed falchion that the kitchen uses as a cleaver',B=>{
  const ys=t=>t<.84?-2.35:-2.35+(t-.84)/.16*4.05,ye=t=>t<.74?lerp(3.65,5,ease(t/.74)):1.7+3.3*Math.pow(Math.cos((t-.74)/.26*Math.PI/2),.55);
  const G=blade(4,57.2,ye,ys,30);G.out.addPath(pCirc(47.6,-.6,.95));paintBlade(B,G,M.worn,{k:.22,rule:'evenodd'});B.line(pCirc(47.6,-.6,.95),M.worn.o,.45);
  const sc=new Path2D();for(let i=0;i<9;i++){const x=8+B.R()*40,y=-1.6+B.R()*4.6,l=1.5+B.R()*3;sc.moveTo(x,y);sc.lineTo(x+l,y+(B.R()-.5)*.8);}B.line(sc,'#9aa2ac',.22,.6);
  B.part(pRound(2.2,-2.5,4.2,4,.4),M.steel);
  B.part(pCmd([['M',2.3,-1.7],['L',-8.8,-1.6],['Q',-10.2,-1.4,-10.2,.3],['Q',-10.2,2.1,-8.8,2.1],['L',2.3,1.9],['Z']]),M.walnut);B.dots([[-7.6,.25],[-3.8,.2],[0,.15]],.55,M.steel);
},SC('#6e6658','iron',{kind:'canvas',wide:1.6}));
def('boning','dagger','Boning knife','a narrow, upswept boning knife',B=>{
  const ys=t=>-1.15-1.1*Math.pow(t,2.2),ye=t=>t<.25?lerp(1.45,.85,t/.25):lerp(.85,-2.25,Math.pow((t-.25)/.75,1.4));
  const G=blade(3,27,ye,ys,22);paintBlade(B,G,M.bright,{k:.4});
  B.part(pRound(1.6,-1.55,3.1,1.65,.4),M.steel);
  B.part(pCmd([['M',1.7,-1.4],['L',-5.4,-1.5],['Q',-6.5,-1.2,-6.5,.2],['Q',-6.4,1.7,-5.3,1.7],['L',1.7,1.5],['Z']]),M.wood);B.dots([[-3.8,.1],[-.6,.1]],.48,M.steel);
},SC('#6e6658','iron',{kind:'canvas'}));
def('cleaver','dagger','Meat cleaver','a square meat cleaver with a hole to hang it by',B=>{
  const out=pPoly([[3.2,-2.45],[23.2,-2.45],[24.2,-1.6],[24.2,5.4],[23,6.6],[3.2,6.3]]);out.addPath(pCirc(21.4,-.6,.85));
  B.part(out,M.worn,{rule:'evenodd'});B.fill(pPoly([[3.4,4.6],[23.6,4.9],[23.6,6.2],[3.4,6.1]]),M.worn.l,.65);B.fill(pPoly([[3.4,-2.2],[23.4,-2.2],[23.4,-1.2],[3.4,-1.2]]),M.worn.s,.7);
  B.line(pCirc(21.4,-.6,.85),M.worn.o,.4);B.line(pLine([[3.4,6.1],[23.2,6.45]]),'#ffffff',.3,.7);
  const sc=new Path2D();for(let i=0;i<6;i++){const x=5+B.R()*15,y=-.6+B.R()*4.5;sc.moveTo(x,y);sc.lineTo(x+1.2+B.R()*2,y+(B.R()-.5));}B.line(sc,'#a3abb5',.22,.55);
  B.rimE=pLine([[3.2,6.3],[23,6.6]]);B.rimS=pLine([[3.2,-2.45],[23.2,-2.45]]);B.rimCol='#ffffff';B.glintAt(6,21,5.6);
  B.part(pRound(1.6,-1.7,3.3,1.7,.4),M.steel);B.turned(-6,1.8,x=>1.55,M.wood,{grain:2});
},SC('#6e6658','iron',{kind:'canvas',wide:2.4}));
def('meataxe','axe',"Butcher's axe","a butcher's axe: a cleaver's broad blade on a long handle",B=>{
  B.turned(-22.4,71.4,x=>lerp(1.85,1.6,(x+22)/94),M.wood,{grain:6});B.part(pRound(-23.2,-2.1,-21.2,2.1,.8),M.iron);
  const bl=pPoly([[50,2.6],[71.6,2.6],[72.8,4],[71.4,20.6],[69.6,21.8],[49.2,20.2]]);B.part(bl,M.worn);
  B.fill(pPoly([[49.4,17.8],[71.6,18.4],[71.4,20.6],[69.6,21.8],[49.2,20.2]]),M.worn.l,.7);B.line(pLine([[49.2,20.2],[69.6,21.8]]),'#ffffff',.35,.8);
  B.part(pRound(63,-2.8,72,2.8,.8),M.iron);B.dots([[65.2,0],[69.4,0]],.5,M.steel);
  const sc=new Path2D();for(let i=0;i<7;i++){const x=52+B.R()*16,y=5+B.R()*11;sc.moveTo(x,y);sc.lineTo(x+1.5+B.R()*2.5,y+(B.R()-.5));}B.line(sc,'#9aa2ac',.22,.55);
  B.rimE=pLine([[49.2,20.2],[69.6,21.8]]);B.rimS=pLine([[63,-2.8],[72,-2.8]]);B.rimCol='#ffffff';B.glintAt(52,70,19.4);
});
def('spit','spear','Roasting spit','an iron roasting spit, the fork still on it and the crank at the end',B=>{
  const ir=M.iron;B.turned(-36.4,90,x=>1.1,ir,{n:8,la:.6});
  B.part(pCmd([['M',89.6,-1.15],['L',97,0],['L',89.6,1.15],['Z']]),M.steel);
  // the crank
  B.tube(pLine([[-36,0],[-36,7.4]]),ir,1.5);
  const kn=new Path2D();pRound(-36.6,6.2,-30.4,8.6,1.1,kn);B.part(kn,M.wood);
  // the fork: a collar with two tines toward the point
  B.part(pRound(55.4,-3.7,58.8,3.7,.6),ir);B.dots([[57.1,0]],.55,M.steel);
  const tn=s=>pCmd([['M',58.6,-3.1*s],['L',69.6,-3*s],['L',71.8,-2.6*s],['L',69.6,-2.2*s],['L',58.6,-2.2*s],['Z']]);B.part(tn(1),M.steel,{lw:.6});B.part(tn(-1),M.steel,{lw:.6});
  B.rimE=pLine([[-30,1.1],[89,1.1]]);B.rimS=pLine([[-30,-1.1],[89,-1.1]]);B.rimCol=ir.e;B.glintAt(10,80,-.6);
});
def('rollingpin','club','Rolling pin',"a baker's rolling pin, flour still on it",B=>{
  const pw=M.pale;B.turned(-5,.4,x=>1.35,pw,{n:4});B.part(pRound(-.3,-1.85,.9,1.85,.6),pw);
  B.turned(.6,39.6,x=>3.45-.35*Math.pow((x-20)/19.5,2),pw,{n:18,grain:4});
  B.part(pRound(39.3,-1.85,40.5,1.85,.6),pw);B.turned(40.2,46,x=>1.35,pw,{n:4});
  const fl=new Path2D();for(let i=0;i<14;i++)pCirc(2+B.R()*36,(B.R()-.5)*5,.25+B.R()*.35,fl);B.fill(fl,'#e9e2d2',.55);
  B.glintAt(4,36,-2.4);
});
def('skillet','club','Skillet','a cast-iron skillet',B=>{
  const ir={...M.black,b:'#222125'};const h=pCmd([['M',-5.6,-1.3],['L',21.6,-1.6],['L',21.6,1.6],['L',-5.6,1.3],['Q',-6.8,0,-5.6,-1.3],['Z']]);h.addPath(pEll(-3.6,0,1.1,.7));B.part(h,ir,{rule:'evenodd'});
  B.line(pEll(-3.6,0,1.1,.7),ir.o,.4);B.line(pLine([[-4,-.95],[21,-1.2]]),ir.l,.3,.7);
  B.part(pEll(33.6,0,12.6,11.2),ir);B.fill(pEll(33.8,.1,11,9.7),'#2c2b30');B.fill(pEll(34.6,.7,8.6,7.4),'#1a191c',.9);
  B.line(pCmd([['M',25.8,-6.4],['Q',31,-10,37.4,-9.4]]),'#7a7a84',.55,.75);B.line(pCmd([['M',41.6,5.4],['Q',38.4,8.6,33.4,9.2]]),'#5a5a62',.4,.55);
  B.dots([[21.9,-.9],[21.9,.9]],.45,M.iron);B.glintAt(24,42,-8.4);
});
// the lobby: Hallowell's security, all issued alike in black and slate with the house's brass H
function hMark(B,x,y,s){const p=new Path2D();p.moveTo(x-s*.5,y-s*.6);p.lineTo(x-s*.5,y+s*.6);p.moveTo(x+s*.5,y-s*.6);p.lineTo(x+s*.5,y+s*.6);p.moveTo(x-s*.5,y);p.lineTo(x+s*.5,y);B.line(p,M.brass.l,.32,.95);}
def('gsword','sword',"Guard's sword","a security guard's issue sword, blackened at the hilt, stamped with the house's H",B=>{
  const w=t=>t<.82?lerp(2.5,2.05,t/.82):2.05*Math.pow(1-(t-.82)/.18,1.1);
  const G=blade(4.2,57.4,w,t=>-w(t),28);paintBlade(B,G,M.steel,{two:true,k:.3});B.line(lineAt(G,.5,.18,.62),M.steel.s,.6,.8);
  B.fill(pPoly([[4.4,-2.45],[10.4,-2.38],[10.4,2.38],[4.4,2.45]]),'#16181c',.95);hMark(B,7.4,0,1.6);
  B.part(pRound(2.3,-7.2,3.9,7.2,.3),M.black);B.line(pLine([[2.7,-6.8],[2.7,6.8]]),M.black.l,.3,.8);
  B.wrap(-7.4,2.3,1.5,'#11151d',M.slate.b,1,.45);
  B.part(pPoly([[-7.4,-1.9],[-8.6,-2.4],[-10,-1.6],[-10,1.6],[-8.6,2.4],[-7.4,1.9]]),M.black);B.fill(pPoly([[-7.6,-1.7],[-8.6,-2.1],[-9.6,-1.4],[-8.6,-1]]),M.black.l,.7);
},SC('#14161a','black',{acc:'#c9a14a'}));
def('gdagger','dagger',"Guard's dagger","a guard's black issue dagger",B=>{
  const w=t=>t<.7?lerp(2,1.7,t/.7):1.7*Math.pow(1-(t-.7)/.3,1.05);
  const G=blade(3,26.6,w,t=>-w(t),20);paintBlade(B,G,M.black,{two:true,k:.34});B.fill(bevel(G,1,.14,0,1),'#cfd6df',.5);B.fill(bevel(G,-1,.14,0,1),'#9aa3ae',.45);
  B.part(pRound(1.7,-4.2,3,4.2,.3),M.black);B.wrap(-4.2,1.8,1.4,'#11151d',M.slate.b,.95,.4);B.part(pRound(-5.6,-1.8,-4.2,1.8,.5),M.black);hMark(B,-4.9,0,1.1);
},SC('#14161a','black'));
def('breachaxe','axe','Breaching axe','a black breaching axe with a long pick, its haft in slate with grip tape',B=>{
  const s=M.slate;B.turned(-22.4,70.6,x=>1.75,s,{n:10,la:.35});
  const tp=new Path2D();for(const [a,b] of [[-21.6,-12],[-4.4,5.6]]){pRound(a,-1.95,b,1.95,.5,tp);}B.part(tp,M.tar);
  const tl=new Path2D();for(const [a,b] of [[-21.6,-12],[-4.4,5.6]])for(let x=a+.6;x<b;x+=.9){tl.moveTo(x,-1.9);tl.lineTo(x,1.9);}B.line(tl,'#3a352e',.25,.8);
  const bl=pCmd([['M',65.8,3],['L',72.4,6.6],['Q',72.2,12.6,66,16.4],['L',58.6,3.2],['Z']]);B.part(bl,M.black);
  B.fill(pCmd([['M',72.4,6.6],['Q',72.2,12.6,66,16.4],['L',64.4,13.6],['Q',69.4,11.4,69.8,6.4],['Z']]),M.steel.l,.9);
  const pk=pCmd([['M',58.4,-3],['Q',59.2,-12.4,63.4,-19.6],['Q',64,-11.4,66.6,-3],['Z']]);B.part(pk,M.black);B.fill(pCmd([['M',63.4,-19.6],['Q',64,-11.4,66.6,-3],['L',65.4,-3],['Q',63,-11,63.4,-19.6],['Z']]),M.black.l,.7);
  B.part(pRound(57.8,-3.3,67,3.3,.8),M.black);B.part(pCmd([['M',66.8,-1.6],['L',72.6,-.6],['L',72.6,.6],['L',66.8,1.6],['Z']]),M.black);
  B.rimE=pCmd([['M',72.4,6.6],['Q',72.2,12.6,66,16.4]]);B.rimS=pCmd([['M',58.4,-3],['Q',59.2,-12.4,63.4,-19.6]]);B.rimCol='#e6ecf3';B.glintAt(60,72,12);
});
def('halberd','spear','Lobby halberd',"a halberd from the lobby's display, brass-bound",B=>{
  B.part(pRound(-38.8,-1.75,-35.4,1.75,.7),M.brass);B.turned(-35.6,74,x=>1.55,M.blackwood,{n:10,la:.35});B.rings([-20,10,40],1.4,1.85,M.brass);
  B.part(pCmd([['M',70,-2.1],['L',78,-1.6],['L',78,1.6],['L',70,2.1],['Z']]),M.brass);hMark(B,73.6,0,1.6);
  const ax=pCmd([['M',76,1.6],['L',79.2,10.4],['Q',84,13.4,89.2,12],['Q',86.2,6.8,86.4,1.6],['Z']]);B.part(ax,M.bright);
  B.fill(pCmd([['M',79.2,10.4],['Q',84,13.4,89.2,12],['L',87.6,9.8],['Q',83.6,10.4,80.4,8.6],['Z']]),M.bright.e,.6);
  const hk=pCmd([['M',77.4,-1.6],['Q',77.6,-6,74.2,-10.4],['Q',79.8,-7.8,81.4,-1.6],['Z']]);B.part(hk,M.bright);
  const G=blade(78,99,t=>1.7*Math.pow(1-t,.85)+(t<.15?.7*(1-t/.15):0),t=>-(1.7*Math.pow(1-t,.85)+(t<.15?.7*(1-t/.15):0)),14);paintBlade(B,G,M.bright,{two:true,k:.4,ridge:.5});
  B.rimE=pCmd([['M',79.2,10.4],['Q',84,13.4,89.2,12]]);B.rimS=pCmd([['M',74.2,-10.4],['Q',79.8,-7.8,81.4,-1.6]]);B.rimCol='#ffffff';B.glintAt(80,96,0);
  B.ribbon(69.4,0,{n:3,len:[8,9.5,7.5],w:.95,col:'#6f80a3',shade:'#2a3550',tassel:true});
});
def('truncheon','club','Truncheon',"a guard's black truncheon on a wrist strap",B=>{
  B.turned(-5,44.6,x=>lerp(2.05,2.45,clamp((x-6)/36,0,1))-(x>42.6?(x-42.6)*.45:0),M.blackwood,{n:22,la:.5});
  const rb=new Path2D();for(let x=-4.4;x<5.6;x+=.8){rb.moveTo(x,-2);rb.lineTo(x,2);}B.line(rb,'#000000',.32,.8);B.rings([6.6],1.1,2.2,M.brass);
  B.ribbon(-4.6,0,{n:1,len:[7],w:.9,col:'#2b1e17',shade:'#120c09',loop:true});B.glintAt(10,40,-1.8);
});
// the street: Qadir's people outside the bistro
def('machete','sword','Machete','a broad machete in carbon steel with a riveted black handle',B=>{
  const ys=t=>-1.6+(t>.72?Math.pow((t-.72)/.28,1.6)*3.4:0),ye=t=>t<.78?lerp(2.6,5.6,Math.pow(t/.78,1.3)):1.8+3.8*Math.pow(Math.cos((t-.78)/.22*Math.PI/2),.6);
  const G=blade(3,56.2,ye,ys,30);paintBlade(B,G,M.carbon,{k:.2});
  const pt=new Path2D();for(let i=0;i<10;i++)pEll(8+B.R()*40,-.4+B.R()*3.4,.6+B.R()*1.6,.3+B.R()*.6,B.R(),pt);B.fill(pt,'#2e2925',.45);
  const h=pCmd([['M',2.8,-1.7],['L',-8.8,-1.7],['Q',-10.4,-1.5,-10.4,.2],['Q',-10.4,2,-8.8,2.1],['L',2.8,2],['Z']]);h.addPath(pCirc(-8.8,.2,.6));B.part(h,M.blackwood,{rule:'evenodd'});
  B.line(pCirc(-8.8,.2,.6),'#000000',.35);B.dots([[-5.6,.2],[-1.6,.2]],.55,M.brass);
},SC('#2c2219','iron',{kind:'leather',wide:2}));
def('flick','dagger','Flick knife','a flick knife with a nickel bolster and a black handle',B=>{
  const w=t=>1.65*Math.pow(1-t,.85);const G=blade(3,25.4,t=>w(t)*1.05,t=>-w(t)*.85-(t<.2?.2:0),20);paintBlade(B,G,M.bright,{two:true,k:.36});
  B.part(pRound(1.3,-1.9,3.1,1.9,.5),M.nickel);B.part(pRound(-5.6,-1.75,1.4,1.75,1.2),M.black);B.fill(pRound(-5.2,-1.4,1.2,-.5,.5),M.black.l,.6);
  B.dots([[-.6,-1.2]],.5,M.nickel);B.part(pRound(-6.2,-1.5,-5.2,1.5,.5),M.nickel);
},SC('#000000','black',{kind:'none'}));
def('trench','dagger','Trench knife','a trench knife: a spike of a blade and a brass knuckle guard',B=>{
  const w=t=>1.45*Math.pow(1-t,.95);const G=blade(3,26,w,t=>-w(t),18);paintBlade(B,G,M.dark,{two:true,k:.45,ridge:.5});
  B.part(pRound(-5.2,-1.6,2.2,1.6,.6),M.wood);
  const kd=pCmd([['M',2.6,-1.6],['L',2.6,2],['Q',2.4,6.4,-1.6,6.4],['Q',-5.6,6.4,-6.6,2.4],['L',-6.6,-1.4],['Q',-6.2,-2,-5.2,-1.7],['L',-5.2,1.6],['Q',-4.8,4.6,-1.6,4.6],['Q',1.2,4.6,1.4,1.6],['L',1.4,-1.6],['Z']]);
  B.part(kd,M.brass);B.dots([[-4.6,5.7],[-1.6,6.1],[1.4,5.2]],.62,M.brass);
},SC('#2c2219','brass'));
def('fellingaxe','axe','Felling axe',"a woodsman's felling axe on a hickory haft",B=>{
  B.turned(-23.2,68.4,x=>x<-19?lerp(2.5,1.75,(x+23.2)/4.2):lerp(1.75,1.6,(x+19)/87),M.hickory,{n:22,grain:7});
  const bl=pCmd([['M',66.6,3],['L',73.6,9.4],['Q',71.4,16.8,61,20],['Q',58.8,11,58.4,3],['Z']]);B.part(bl,M.worn);
  B.fill(pCmd([['M',73.6,9.4],['Q',71.4,16.8,61,20],['L',60.6,17.4],['Q',68.6,14.6,70.8,9],['Z']]),M.worn.l,.85);B.line(pCmd([['M',73.6,9.4],['Q',71.4,16.8,61,20]]),'#f0f3f6',.38,.8);
  const ru=new Path2D();for(let i=0;i<7;i++)pEll(60+B.R()*8,4+B.R()*9,.5+B.R()*.9,.3+B.R()*.5,B.R(),ru);B.fill(ru,'#5a3a24',.55);
  B.part(pRound(58,-4.4,67,3.3,.8),M.worn);B.fill(pRound(58.4,-4.1,66.6,-3.1,.4),M.worn.l,.6);
  B.rimE=pCmd([['M',73.6,9.4],['Q',71.4,16.8,61,20]]);B.rimS=pLine([[58,-4.4],[67,-4.4]]);B.rimCol='#ffffff';B.glintAt(61,72,15);
});
def('boathook','spear','Boat hook',"a boat hook off the river wharf, rope wound under the head",B=>{
  B.part(pRound(-39,-1.75,-35.6,1.75,.6),M.iron);B.turned(-35.8,82,x=>1.55,M.ash,{grain:6});B.rings([-12,30],1.6,1.75,{...M.tar,l:'#4a4136'});
  B.wrap(70,79,1.85,'#7a6a52','#3f3628',.8,.45);
  B.part(pCmd([['M',80.6,-1.9],['L',86.6,-1.4],['L',86.6,1.4],['L',80.6,1.9],['Z']]),M.iron);
  B.tube(pCmd([['M',85.4,1.2],['Q',87.4,7.6,91.2,7.4],['Q',93,7,91.8,5]]),M.iron,1.55);
  const G=blade(86.4,97.4,t=>1.2*Math.pow(1-t,.9),t=>-1.2*Math.pow(1-t,.9),10);paintBlade(B,G,M.iron,{two:true,k:.45});
});
def('pipe','club','Lead pipe','a length of iron pipe with its elbow still on',B=>{
  const g={b:'#56595d',s:'#303235',l:'#9da1a6',e:'#d0d4d8',o:'#0b0b0c'};B.turned(-5,39.4,x=>2,g,{n:6,la:.6});
  const th=new Path2D();for(let x=34.6;x<39.2;x+=.7){th.moveTo(x,-2);th.lineTo(x+.35,2);}B.line(th,'#2a2c2f',.3,.8);
  B.part(pRound(38.8,-2.95,46.2,2.95,.9),g);B.fill(pRound(39.4,-2.5,45.6,-1.2,.5),g.l,.5);B.fill(pEll(46.2,0,.9,2.1),'#0b0b0c');
  const ru=new Path2D();for(let i=0;i<9;i++)pEll(B.R()*36,(B.R()-.5)*3,.4+B.R()*.8,.25+B.R()*.4,B.R(),ru);B.fill(ru,'#6a4428',.5);B.glintAt(2,34,-1.4);
});
def('crowbar','club','Crowbar','a crowbar with a split claw',B=>{
  const r=M.redpaint,ir=M.iron;
  B.part(pCmd([['M',-5.6,-.4],['L',-3,-1.3],['L',38,-1.3],['L',38,1.3],['L',-3,1.3],['L',-5.6,.4],['Z']]),ir);B.fill(pRound(4,-1.25,30,1.25,.4),r.b,.85);
  const sc=new Path2D();for(let i=0;i<8;i++){const x=5+B.R()*24;sc.moveTo(x,-1.2);sc.lineTo(x+.6+B.R(),1.2);}B.line(sc,ir.b,.45,.8);
  B.tube(pCmd([['M',37.6,0],['Q',43.4,0,43.8,4.6],['Q',43.6,7.6,41.2,8.6]]),ir,2.1);B.line(pLine([[43.2,6.8],[41.4,8.2]]),'#08080a',.45,.95);
  B.line(pLine([[-4.8,0],[37,0]]),ir.l,.3,.6);B.glintAt(2,34,-1);
});
// Hallowell's cane: Fine Print. A black lacquered sword-cane with a champagne-gold crook, the hidden blade's seam a gold line.
def('halloran','cane','Fine Print','a black sword-cane with a champagne-gold crook; the seam of the hidden blade is the only sign',B=>{
  const g=M.champagne,bk=M.blackwood;
  B.part(pCmd([['M',0,-1],['L',68,-.85],['L',68,.85],['L',0,1],['Z']]),bk);B.fill(pPoly([[1,-.75],[67,-.62],[67,-.2],[1,-.2]]),bk.l,.55);
  B.part(pRound(-3.4,-1.05,.4,1.05,.5),g);B.part(pRound(54.6,-1.05,56,1.05,.25),g);B.line(pLine([[55.3,-1],[55.3,1]]),g.l,.3,.9);
  B.part(pRound(66.4,-1.2,69.4,1.2,.5),g);
  B.tube(pCmd([['M',69,0],['Q',74.2,-.2,74.6,4.4],['Q',74.6,7.6,71.4,7.6],['Q',69.6,7.4,69.8,5.8]]),g,1.9);
  B.fill(pEll(73.6,2.6,.7,.35,1),g.e,.9);B.glintAt(8,60,-.5);
});
// ===== Kael's arc-blade =====
// Nine curved plates of blued steel with gilded edges, strung on a thread of light that shows through a slot in each plate and
// glows in the seams between them; a gold crescent guard with the thread's heart, a cyan stone, at its centre; black ray-skin
// under gold wire; a ring pommel with a cord and a bead. The plates keep the old blade's curve, widths and seams, so the moves,
// the unrolling, the locking and the lash play as they did. P: the look's colours (blade, bladeEdge, gold, goldDim, glow, glow2);
// o: line and lw (the cel look's ink), now, L (toward the light), k (pixels per unit), vel (the hand's velocity), alpha.
const ARC={LEN:58,BUTT:9,N:9,g0:4.5,bow:5.2};
const ARC_NOIR={blade:'#10151d',bladeEdge:'#ffd89a',gold:'#e2b65a',goldDim:'#9c7428',glow:'#7ff3e3',glow2:'#d9fffa'};
function arcHalf(s){return s<.86?2.4+.7*(1-s/.86):2.4*(1-(s-.86)/.14);}
function arcAt(s,j,wob,now){return[ARC.g0+s*(ARC.LEN-ARC.g0),ARC.bow*4*s*(1-s)+(wob?Math.sin(now*38+j*1.9)*1.6*wob*s:0)];}
// the plates as outlines in the weapon's frame: cut, how much has unrolled; wob, how hard the unlocked plates shake
function arcPlates(cut,wob,now){const {LEN,g0,N}=ARC,gap=.55/(LEN-g0),out=[];
  for(let i=0;i<N;i++){const s0=i/N,s1=(i+1)/N;if(s0>=cut)break;const e1=Math.min(s1,cut),a0=s0+(i?gap:0),a1=e1-(e1<1?gap:0);if(a1<=a0)break;
    const E=[],Sp=[];for(let k=0;k<=5;k++){const s=lerp(a0,a1,k/5),c=arcAt(s,i,wob,now),w=arcHalf(s);E.push([c[0],c[1]+w]);Sp.push([c[0],c[1]-w*.9]);}
    out.push({E,Sp});}
  return out;}
// the lash: the plates strung out on the thread, whipping toward the tip (the old chain's motion, in the weapon's frame)
function arcChain(L,now){const {LEN,g0,N}=ARC,sl=(LEN-g0)/N,gapL=(L-g0-sl*N)/(N-1),A=Math.min(9,gapL*.22),ph=now*34,out=[],cs=[];
  for(let i=0;i<N;i++){const a=g0+i*(sl+gapL),s=(a+sl/2)/L,w=A*Math.sin(Math.PI*s)*Math.sin(ph-s*9);
    const dw=A*Math.PI/L*Math.cos(Math.PI*s)*Math.sin(ph-s*9)-A*9/L*Math.sin(Math.PI*s)*Math.cos(ph-s*9),tl=Math.hypot(1,dw),tx=1/tl,ty=dw/tl,mx=-ty,my=tx,c=[a+sl/2,w];cs.push(c);
    const hl=sl*.47,E=[],Sp=[];for(let k=0;k<=5;k++){const v=-hl+2*hl*k/5,u=(i*sl+(v+hl))/(N*sl),hw=i===N-1?arcHalf(Math.min(1,.86+.14*(v+hl)/(2*hl))):arcHalf(u);
      E.push([c[0]+tx*v+mx*hw,c[1]+ty*v+my*hw]);Sp.push([c[0]+tx*v-mx*hw*.9,c[1]+ty*v-my*hw*.9]);}
    out.push({E,Sp});}
  return{plates:out,centres:cs};}
// the painted layers of a set of plates: the body and its bands, the gilded edge; along the blade (or, out on the lash, along each
// plate) the fuller with the thread's light in it, and close up, a gold vine engraved along the spine side
function arcLayers(PL,lod,run){const Y={body:new Path2D(),shade:new Path2D(),sheen:new Path2D(),bevel:new Path2D(),bevel2:lod>=1?new Path2D():null,edge:new Path2D(),spine:new Path2D(),ful:new Path2D(),vine:lod>=1?new Path2D():null,leaf:lod>=1?new Path2D():null};
  const lp=(A,B,f)=>[lerp(A[0],B[0],f),lerp(A[1],B[1],f)];
  // out on the lash each plate keeps its hinge barrel and pin at its leading end, its stretch of the vine, and an eyelet at each
  // end of its slot where the thread runs through
  if(!run){Y.kn=new Path2D();Y.pn=new Path2D();Y.eye=new Path2D();}
  for(let j=0;j<PL.length;j++){const {E,Sp}=PL[j],n=E.length;
    pPoly([...Sp,...E.slice().reverse()],Y.body);
    const band=(f0,f1,p)=>{const a=[],b=[];for(let k=0;k<n;k++){a.push(lp(E[k],Sp[k],f0));b.push(lp(E[k],Sp[k],f1));}pPoly([...a,...b.reverse()],p);};
    band(.72,1,Y.shade);band(.3,.38,Y.sheen);band(0,.2,Y.bevel);if(Y.bevel2)band(.02,.07,Y.bevel2);pLine(E,Y.edge);pLine(Sp,Y.spine);
    if(!run){const a=lp(E[0],Sp[0],.58),b=lp(E[n-1],Sp[n-1],.58),ux=b[0]-a[0],uy=b[1]-a[1],ul=Math.hypot(ux,uy)||1;
      Y.ful.moveTo(a[0]+ux/ul*.4,a[1]+uy/ul*.4);Y.ful.lineTo(b[0]-ux/ul*.4,b[1]-uy/ul*.4);pCirc(a[0]+ux/ul*.5,a[1]+uy/ul*.5,.36,Y.eye);pCirc(b[0]-ux/ul*.5,b[1]-uy/ul*.5,.36,Y.eye);
      if(j){const D=Math.hypot(Sp[0][0]-E[0][0],Sp[0][1]-E[0][1])||1,q=lp(E[0],Sp[0],1-.12/D);pCirc(q[0],q[1],.6,Y.kn);pCirc(q[0],q[1],.24,Y.pn);}
      if(Y.vine){const at=u=>{const x=u*(n-1),i0=Math.min(n-2,Math.floor(x)),fr=x-i0;return[lp(E[i0],E[i0+1],fr),lp(Sp[i0],Sp[i0+1],fr)];},rot=Math.atan2(uy,ux);let on=false;
        for(let i=0;i<=10;i++){const u=i/10,sq=(j+u)/ARC.N;if(sq<.03||sq>.84){on=false;continue;}const [e,s]=at(u),D=Math.hypot(s[0]-e[0],s[1]-e[1])||1,wv=Math.sin(sq*Math.PI*15),v=lp(e,s,.842-.32*wv/D);
          on?Y.vine.lineTo(v[0],v[1]):Y.vine.moveTo(v[0],v[1]);on=true;if(i===3||i===7){const up=(j*2+(i===3?0:1))%2?-1:1;pEll(v[0]+.5*Math.cos(rot),v[1]+.5*Math.sin(rot)+up*.42,.62,.24,rot+up*.5,Y.leaf);}}}}}
  // along the whole blade: run = {cut, wob, now}
  if(run){const {cut,wob,now}=run,s1=Math.min(cut,.9)-.004;
    for(let i=0;i<=40;i++){const sq=lerp(.015,s1,i/40),c=arcAt(sq,Math.floor(sq*ARC.N),wob,now),w=arcHalf(sq),y=c[1]-.102*w;i?Y.ful.lineTo(c[0],y):Y.ful.moveTo(c[0],y);}
    if(Y.vine){const s2=Math.min(cut,.84);let up=0;for(let i=0;i<=56;i++){const sq=lerp(.03,s2,i/56),c=arcAt(sq,Math.floor(sq*ARC.N),wob,now),w=arcHalf(sq),wv=Math.sin(sq*Math.PI*15),y=c[1]-.6*w+.32*wv;
        i?Y.vine.lineTo(c[0],y):Y.vine.moveTo(c[0],y);if(i%4===2){up++;pEll(c[0]+.5,y+(up%2?-.42:.42),.62,.24,up%2?-.5:.5,Y.leaf);}}}}
  return Y;}
function arcPaint(c,Y,P,o,thread){const k=o.alpha==null?1:o.alpha,b=P.blade;
  c.globalAlpha=k;c.strokeStyle=o.line||'#04060a';c.lineWidth=o.line?o.lw*2:Y.vine?.42:.7;c.stroke(Y.body);
  c.fillStyle=b;c.fill(Y.body);
  const T=arcTones(P);c.globalAlpha=k*.85;c.fillStyle=T.shade;c.fill(Y.shade);
  c.globalAlpha=k*.6;c.fillStyle=T.sheen;c.fill(Y.sheen);
  c.globalAlpha=k*.92;c.fillStyle=T.bevel;c.fill(Y.bevel);if(Y.bevel2){c.globalAlpha=k*.8;c.fillStyle=T.bevel2;c.fill(Y.bevel2);}
  c.globalAlpha=k;c.strokeStyle=P.bladeEdge;c.lineWidth=.38;c.stroke(Y.edge);
  if(Y.vine){c.globalAlpha=k*.9;c.strokeStyle=P.gold;c.lineWidth=.22;c.stroke(Y.vine);c.fillStyle=P.gold;c.fill(Y.leaf);}
  // the fuller and the thread's light in it
  c.globalAlpha=k;c.strokeStyle='#010304';c.lineWidth=.95;c.stroke(Y.ful);
  c.globalCompositeOperation='lighter';c.strokeStyle=P.glow;c.globalAlpha=k*thread*.28;c.lineWidth=1.8;c.stroke(Y.ful);c.globalAlpha=k*thread;c.lineWidth=.42;c.stroke(Y.ful);
  c.globalCompositeOperation='source-over';c.globalAlpha=k;}
// the hilt, built once for each set of colours and level of detail
const ARC_HILT={};
function arcHilt(P,lod){const key=P.blade+P.gold+P.glow+lod;if(ARC_HILT[key])return ARC_HILT[key];
  const B=new Build('arc-hilt'),g={b:P.gold,s:P.goldDim,l:mix(P.gold,'#ffffff',.5),e:'#fff6dc',o:'#1a1206'},dk=mix(P.blade,'#000000',.35);
  // the ring pommel and its collar
  const ring=pCirc(-10.5,0,2.15);B.ops.push({p:ring,stroke:g.o,lw:2});B.ops.push({p:ring,stroke:g.b,lw:1.2});B.ops.push({p:pCmd([['M',-12.4,-.6],['Q',-12,-2,-10.5,-2.15]]),stroke:g.l,lw:.35,a:.9});
  B.part(pRound(-8.6,-1.3,-7.5,1.3,.45),g);
  // black ray-skin under gold wire wound in diamonds
  B.part(pRound(-7.7,-1.6,.8,1.6,.8),{b:dk,o:'#020203'});
  if(lod>=1){const nd=new Path2D(),R=rng(77);for(let i=0;i<34;i++)pCirc(-7.3+R()*7.7,(R()-.5)*2.7,.16+R()*.12,nd);B.fill(nd,'#3a3744',.8);}
  const wire=new Path2D();for(let x=-7.5;x<.6;x+=1.55){wire.moveTo(x,-1.55);wire.lineTo(Math.min(.7,x+1.45),1.55);wire.moveTo(Math.min(.7,x+1.45),-1.55);wire.lineTo(x,1.55);}
  B.line(wire,g.s,.55,.95);B.line(wire,g.b,.3,.95);
  if(lod>=1){const kn=new Path2D();for(let x=-7.5;x<0;x+=1.55)pCirc(x+.725,0,.2,kn);B.fill(kn,g.l,.9);}
  B.part(pRound(.7,-1.9,1.6,1.9,.45),g);
  // the crescent guard, its horns toward the blade, engraved along its middle
  const cg=pCmd([['M',5.1,-7.1],['Q',.1,-6.2,.9,0],['Q',.1,7.2,4.7,8.4],['Q',2.6,4.1,3.3,0],['Q',2.6,-3.7,5.1,-7.1],['Z']]);B.part(cg,g);
  B.line(pCmd([['M',4.3,-6.2],['Q',1.2,-5.1,1.85,0],['Q',1.2,5.7,4.1,7.3]]),g.o,.32,.75);
  B.line(pCmd([['M',4.6,-6.9],['Q',.7,-5.9,1.25,-.6]]),g.l,.35,.85);
  // the throat the plates come out of
  B.part(pRound(3.2,-2.9,5.3,3.3,.6),{b:mix(P.blade,'#000000',.2),o:'#020304'});B.line(pLine([[5.15,-2.6],[5.15,3]]),g.b,.4,.95);
  return(ARC_HILT[key]=B.done());}
// the stone at the guard's centre: the heart of the thread, brighter while the thread is working
let ARC_STONE=null;
function arcStone(c,P,k,hot){const Q=ARC_STONE||(ARC_STONE={a:pEll(2.6,0,1,1.5),b:pEll(2.6,0,.82,1.28),c:pCirc(2.6,0,3.4),d:pEll(2.35,-.5,.28,.38)});
  c.globalAlpha=k;c.fillStyle='#062a28';c.fill(Q.a);c.globalCompositeOperation='lighter';
  c.globalAlpha=k*(.45+.55*hot);c.fillStyle=P.glow;c.fill(Q.b);c.globalAlpha=k*.18*(.5+hot);c.fill(Q.c);
  c.globalAlpha=k*.95;c.fillStyle='#ffffff';c.fill(Q.d);c.globalCompositeOperation='source-over';}
// the colours a palette's blade is painted in, worked out once
const ARC_TONES={};
function arcTones(P){const key=P.blade+P.bladeEdge;return ARC_TONES[key]||(ARC_TONES[key]={shade:mix(P.blade,'#000000',.55),sheen:mix(P.blade,'#a9c4e6',.3),bevel:mix(mix('#cfd9e6',P.bladeEdge,.3),P.blade,.42),bevel2:mix('#e8eef5',P.bladeEdge,.35),knuckle:mix(P.blade,'#a9c4e6',.12)});}
// the seams and the hinges as paths: lit (up to lockAt) and unlit seams, the knuckles on the spine side and their pins
function arcJoints(cut,wob,now,lockAt){const lit=new Path2D(),dim=new Path2D(),kn=new Path2D(),pn=new Path2D();
  for(let i=1;i<ARC.N;i++){const sq=i/ARC.N;if(sq>cut)break;const q=arcAt(sq,i,wob,now),w=arcHalf(sq),P0=sq<=lockAt?lit:dim,y=q[1]-w*.9+.12;
    P0.moveTo(q[0],q[1]+w*.92);P0.lineTo(q[0],q[1]-w*.84);pCirc(q[0],y,.6,kn);pCirc(q[0],y,.24,pn);}
  return{lit,dim,kn,pn};}
// the plates still rolled up: a disc of steel ringed in gold, the spiral of their edges turning, the thread's light at its heart
function arcCoil(c,x,y,r,P,now,k){c.globalAlpha=k;c.fillStyle='#04060a';c.fill(pCirc(x,y,r+1.9));c.fillStyle=P.blade;c.fill(pCirc(x,y,r+1.5));
  c.strokeStyle=P.gold;c.lineWidth=.55;c.stroke(pCirc(x,y,r+1.45));
  const sp=new Path2D(),sm=new Path2D();for(let i=0;i<=40;i++){const u=i/40,a=now*9+u*TAU*1.6,rr=r*(1-u*.8),q=[x+Math.cos(a)*rr,y+Math.sin(a)*rr];i?sp.lineTo(q[0],q[1]):sp.moveTo(q[0],q[1]);
    if(i%5===2){const rr2=rr+.9;sm.moveTo(q[0],q[1]);sm.lineTo(x+Math.cos(a)*rr2,y+Math.sin(a)*rr2);}}
  c.globalAlpha=k*.85;c.strokeStyle=P.bladeEdge;c.lineWidth=.42;c.stroke(sp);
  c.globalCompositeOperation='lighter';c.globalAlpha=k*.7;c.strokeStyle=P.glow;c.lineWidth=.45;c.stroke(sm);
  const gr=c.createRadialGradient(x,y,0,x,y,r*.7);gr.addColorStop(0,'rgba(217,255,250,.9)');gr.addColorStop(1,'rgba(127,243,227,0)');c.globalAlpha=k*.8;c.fillStyle=gr;c.fill(pCirc(x,y,r*.7));
  c.globalCompositeOperation='source-over';}
const ARC_RIGID={};let ARC_JOINTS=null;
// the rim on the side that faces the light, and a glint sliding along the gilded edge as the blade turns (cut 0: no glint)
function arcLight(c,Y,P,o,k,uy,ux,s,nx,ny,cut,wob,now){const Ld=o.L||{x:.45,y:-.89},d=nx*Ld.x+ny*Ld.y;
  c.globalCompositeOperation='lighter';c.strokeStyle='#fff3da';c.lineWidth=.5;c.globalAlpha=k*clamp(.12+Math.abs(d)*.7,0,.85);c.stroke(d>0?Y.edge:Y.spine);
  if(cut>.5&&o.glint!==false){const ang=Math.atan2(uy,ux)*s,g=.5+.5*Math.sin(ang*2.3+now*.35),fl=Math.pow(Math.max(0,Math.sin(ang*3.1+1.3)),3);
    if(fl>.05){const sg=clamp(g,.08,.92)*Math.min(1,cut),q=arcAt(sg,0,wob,now),w=arcHalf(sg);c.globalAlpha=k*fl*.8;c.strokeStyle='#ffffff';c.lineWidth=.55;
      c.beginPath();c.moveTo(q[0]-2.2,q[1]+w*.8);c.lineTo(q[0]+2.2,q[1]+w*.8);c.stroke();c.lineWidth=.28;c.beginPath();c.moveTo(q[0],q[1]+w*.8-1);c.lineTo(q[0],q[1]+w*.8+1);c.stroke();}}
  c.globalCompositeOperation='source-over';}
// the locked blade painted once into a small canvas at about the pixels per unit it is shown at, at that level of detail
const ARC_SPRITE={},ARC_SPRITE_MAX=6;let ARC_SPRITES=0;
function arcSprite(P,o,lod){const q=Math.max(1,Math.round(o.k*4)/4),key=P.blade+P.bladeEdge+P.gold+P.glow+(o.line||'')+(o.line?o.lw:'')+'|'+q+'|'+lod;if(ARC_SPRITE[key])return ARC_SPRITE[key];
  if(++ARC_SPRITES>32){for(const kk in ARC_SPRITE)delete ARC_SPRITE[kk];ARC_SPRITES=1;}
  const x0=-13.4,x1=59.4,y0=-8.6,y1=9.8,cv=document.createElement('canvas');cv.width=Math.ceil((x1-x0)*q);cv.height=Math.ceil((y1-y0)*q);
  const c=cv.getContext('2d');c.setTransform(q,0,0,q,-x0*q,-y0*q);c.lineCap='round';c.lineJoin='round';
  paint(c,arcHilt(P,lod),1);arcStone(c,P,1,0);const Y=ARC_RIGID[lod]||(ARC_RIGID[lod]=arcLayers(arcPlates(1,0,0),lod,{cut:1,wob:0,now:0}));arcPaint(c,Y,P,o,.55);
  const J=ARC_JOINTS||(ARC_JOINTS=arcJoints(1,0,0,1.01));c.globalCompositeOperation='lighter';c.strokeStyle=P.glow;c.globalAlpha=.42;c.lineWidth=.5;c.stroke(J.lit);c.globalCompositeOperation='source-over';
  return(ARC_SPRITE[key]={cv,x0,y0,w:x1-x0,h:y1-y0});}
// the hinge barrels and their pins, drawn over the light on the spine as they are on the moving blade
function arcKnuckles(c,J,P,k){c.globalAlpha=k;c.strokeStyle='#04060a';c.lineWidth=.5;c.stroke(J.kn);c.fillStyle=arcTones(P).knuckle;c.fill(J.kn);c.fillStyle=P.gold;c.fill(J.pn);}
function arc(c,h,t,sd,st,P,o){o=o||{};P=P||ARC_NOIR;const mode=st?st.mode:'rigid',k=o.alpha==null?1:o.alpha,now=o.now||0,lod=o.k==null?1:o.k<2.4?0:1;
  const dx=t.x-h.x,dy=t.y-h.y,Lr=Math.hypot(dx,dy)||1,ux=dx/Lr,uy=dy/Lr,s=sd<0?-1:1,nx=-uy*s,ny=ux*s;
  c.save();c.transform(ux,uy,nx,ny,h.x,h.y);c.lineCap='round';c.lineJoin='round';
  // locked, the blade is painted once at about the pixels per unit it is shown at (in full from 2.4 up), and only its light is drawn
  // over it each frame; drawn larger than ARC_SPRITE_MAX it is drawn as paths every frame
  if(mode==='rigid'&&o.k&&o.k<ARC_SPRITE_MAX&&typeof document!=='undefined'&&!o.vector){const Sp=arcSprite(P,o,lod);c.globalAlpha=k;c.drawImage(Sp.cv,Sp.x0,Sp.y0,Sp.w,Sp.h);
    arcLight(c,ARC_RIGID[lod],P,o,k,uy,ux,s,nx,ny,1,0,now);arcKnuckles(c,ARC_JOINTS,P,k);c.restore();arcTassel(c,h,ux,uy,nx,ny,P,o,k);return;}
  // the hilt and its stone
  paint(c,arcHilt(P,lod),k);
  const hot=mode==='lock'||mode==='pulse'||mode==='lash'?1:mode==='unroll'||mode==='rolled'?.7:0;arcStone(c,P,k,hot);
  if(mode==='rolled'){arcCoil(c,7,0,5.4,P,now,k);c.restore();arcTassel(c,h,ux,uy,nx,ny,P,o,k);return;}
  let Y,thread=.55,cut=1,wob=0,cs=null;
  if(mode==='lash'){const ch=arcChain(st.L,now);Y=arcLayers(ch.plates,lod);cs=ch.centres;thread=1;}
  else if(mode==='rigid'){Y=ARC_RIGID[lod]||(ARC_RIGID[lod]=arcLayers(arcPlates(1,0,0),lod,{cut:1,wob:0,now:0}));}
  else{cut=mode==='unroll'?st.p:1;wob=mode==='unroll'?1:mode==='lock'?1-st.q:0;Y=arcLayers(arcPlates(cut,wob,now),lod,{cut,wob,now});thread=mode==='unroll'?.35:.8;}
  // the thread out on the lash: the line of light the plates are strung on
  if(cs){c.globalCompositeOperation='lighter';const tp=new Path2D();tp.moveTo(ARC.g0,0);for(const q of cs)tp.lineTo(q[0],q[1]);
    c.strokeStyle=P.glow;c.lineWidth=2.6;c.globalAlpha=k*.32;c.stroke(tp);c.strokeStyle=P.glow2;c.lineWidth=.9;c.globalAlpha=k*.85;c.stroke(tp);c.globalCompositeOperation='source-over';}
  arcPaint(c,Y,P,o,thread);
  arcLight(c,Y,P,o,k,uy,ux,s,nx,ny,mode==='lash'?0:cut,wob,now);
  if(mode==='lash'){
    // each plate's hinge barrel and pin, and the thread bright where it runs into and out of the plates
    arcKnuckles(c,Y,P,k);
    c.globalCompositeOperation='lighter';c.fillStyle=P.glow2;c.globalAlpha=k*.9;c.fill(Y.eye);c.globalCompositeOperation='source-over';c.globalAlpha=k;}
  else{
    // the seams: the thread's light between the plates, bright where it has locked; the hinges on the spine side, pinned in gold
    const lockAt=mode==='lock'||mode==='pulse'?st.q:mode==='unroll'?0:1.01,J=mode==='rigid'?(ARC_JOINTS||(ARC_JOINTS=arcJoints(1,0,0,1.01))):arcJoints(cut,wob,now,lockAt);
    c.globalCompositeOperation='lighter';c.strokeStyle=P.glow;c.globalAlpha=k*(mode==='rigid'||lockAt>1?.42:.9);c.lineWidth=mode==='rigid'||lockAt>1?.5:.8;c.stroke(J.lit);
    c.strokeStyle='#3a9f95';c.globalAlpha=k*.22;c.lineWidth=.5;c.stroke(J.dim);c.globalCompositeOperation='source-over';
    arcKnuckles(c,J,P,k);
    c.globalCompositeOperation='lighter';
    if(mode==='lock'||mode==='pulse'){const sq=clamp(lockAt,0,1),q=arcAt(sq,0,wob,now),r=mode==='pulse'?9:13,gr=c.createRadialGradient(q[0],q[1],0,q[0],q[1],r);
      gr.addColorStop(0,'rgba(217,255,250,.95)');gr.addColorStop(.4,'rgba(127,243,227,.55)');gr.addColorStop(1,'rgba(127,243,227,0)');c.globalAlpha=k;c.fillStyle=gr;c.fill(pCirc(q[0],q[1],r));}
    c.globalCompositeOperation='source-over';
    if(mode==='unroll'&&cut<1){const q=arcAt(cut,Math.floor(cut*ARC.N),wob,now),off=1.5+3.8*(1-cut);arcCoil(c,q[0],q[1]-off,1.6+3.8*(1-cut),P,now,k);}}
  c.restore();arcTassel(c,h,ux,uy,nx,ny,P,o,k);}
// a gold cord with a cyan bead hangs from the pommel ring
function arcTassel(c,h,ux,uy,nx,ny,P,o,k){ribbons(c,{ribbons:[{x:-12.5,y:0,n:1,len:[5.6],w:.38,col:P.gold,shade:P.goldDim,bead:P.glow}]},h,ux,uy,nx,ny,{vel:o.vel,now:o.now},k);}
// ---------- building and caching ----------
const BUILT={};
// design ids: 'sig:Qadir' (the elf's own), 'house:Qadir:sword' (elven work of another kind), 'crew:sabre' (the crews'); the hero's
// are 'sig:Kael' and 'house:Kael:sword' whatever he is called on the screen
const SIGKEY={Kael:'kaeldagger',Qadir:'vargo',Brask:'brask',Iyla:'iyla',Orrin:'orrin',Hesk:'hesk',Odile:'odile',Sable:'sable',Doran:'varn',Kessa:'kessa',Kade:'kade','Mr. Hallowell':'halloran'};
function spec(id){if(!id)return null;const p=id.split(':');
  if(p[0]==='sig'){const k=SIGKEY[p[1]];return k?D[k]:null;}
  if(p[0]==='crew')return D[p[1]]||null;
  if(p[0]==='house')return{key:id,kind:p[2],name:null,what:'elven '+p[2],fn:houseBuild(p[1],p[2]),scab:SC('#17141a',HOUSE[p[1]]?HOUSE[p[1]].fit:'silver',{acc:HOUSE[p[1]]?HOUSE[p[1]].acc:null})};
  return null;}
function get(id){if(!id)return null;if(BUILT[id]!==undefined)return BUILT[id];const s=spec(id);if(!s){BUILT[id]=null;return null;}
  const B=new Build(id);s.fn(B);BUILT[id]=B.done({kind:s.kind,name:s.name,scab:s.scab});return BUILT[id];}
// ---------- drawing ----------
// the direction toward the light from a point: a lamp's position or a fixed direction (as the figures use it)
function toLight(o,p){if(o&&o.dir){const l=Math.hypot(o.dir.x,o.dir.y)||1;return{x:o.dir.x/l,y:o.dir.y/l};}
  if(o&&o.light){const dx=o.light.x-p.x,dy=o.light.y-p.y,l=Math.hypot(dx,dy)||1;return{x:dx/l,y:dy/l};}return{x:.45,y:-.89};}
function paint(c,W,k){
  for(const op of W.ops){if(op.comp)c.globalCompositeOperation=op.comp;c.globalAlpha=(op.a==null?1:op.a)*k;
    if(op.fill){c.fillStyle=op.fill;if(op.rule)c.fill(op.p,op.rule);else c.fill(op.p);}else{c.strokeStyle=op.stroke;c.lineWidth=op.lw;c.stroke(op.p);}
    if(op.comp)c.globalCompositeOperation='source-over';}}
// h the grip, t the tip; sd mirrors the weapon across its line (the edge faces the way the fighter does). o: light, dir, now, cut
// (draw only up to this far from the grip: a blade coming out of its scabbard), alpha, vel (the weapon's velocity, for ribbons)
function draw(c,id,h,t,sd,o){const W=get(id);if(!W)return false;o=o||{};
  const dx=t.x-h.x,dy=t.y-h.y,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,s=sd<0?-1:1,nx=-uy*s,ny=ux*s,k=o.alpha==null?1:o.alpha;
  c.save();c.transform(ux,uy,nx,ny,h.x,h.y);c.lineCap='round';c.lineJoin='round';
  if(o.cut!=null){c.beginPath();c.rect(-60,-40,o.cut+60,80);c.clip();}
  paint(c,W,k);
  // the rim on the side that faces the light, and the glint that slides along the blade as it turns
  const mid={x:h.x+dx*.5,y:h.y+dy*.5},Ld=toLight(o,mid),d=nx*Ld.x+ny*Ld.y;
  if(W.rimE&&W.rimS){c.globalCompositeOperation='lighter';c.strokeStyle=W.rimCol;c.lineWidth=W.rimW;c.globalAlpha=k*clamp(.15+Math.abs(d)*.75,0,.9);c.stroke(d>0?W.rimE:W.rimS);
    c.globalAlpha=k*.12;c.stroke(d>0?W.rimS:W.rimE);c.globalCompositeOperation='source-over';}
  if(W.glint&&o.glint!==false){const ang=Math.atan2(uy,ux)*s,g=.5+.5*Math.sin(ang*2.3+(o.now||0)*.35),fl=Math.pow(Math.max(0,Math.sin(ang*3.1+1.3)),3);
    if(fl>.05){const x=lerp(W.glint.x0,W.glint.x1,g),y=W.glint.y;c.globalCompositeOperation='lighter';c.globalAlpha=k*fl*.7;c.strokeStyle='#ffffff';c.lineWidth=.6;
      c.beginPath();c.moveTo(x-2.4,y);c.lineTo(x+2.4,y);c.stroke();c.lineWidth=.3;c.beginPath();c.moveTo(x,y-1);c.lineTo(x,y+1);c.stroke();c.globalCompositeOperation='source-over';}}
  c.restore();
  if(W.ribbons.length&&(o.cut==null||o.cut>60))ribbons(c,W,h,ux,uy,nx,ny,o,k);
  return true;}
// ribbons and tassels hang in the world: down from where they are tied, swung back against the weapon's motion
function ribbons(c,W,h,ux,uy,nx,ny,o,k){const v=o.vel||{x:0,y:0},now=o.now||0;c.save();c.lineCap='round';
  for(const r of W.ribbons){const ax=h.x+ux*r.x+nx*r.y,ay=h.y+uy*r.x+ny*r.y;
    for(let i=0;i<r.n;i++){const len=r.len[i%r.len.length],sw=Math.sin(now*2.2+i*1.7)*1.2,spread=(i-(r.n-1)/2)*(r.tassel?.55:1.3);
      let ex=ax+clamp(-v.x*.018,-.85,.85)*len+spread+sw,ey=ay+len-Math.min(.3,Math.abs(v.y)*.004)*len;const el=Math.hypot(ex-ax,ey-ay)||1;ex=ax+(ex-ax)/el*len;ey=ay+(ey-ay)/el*len;
      const cx=lerp(ax,ex,.5)+ux*1.5+clamp(-v.x*.006,-.3,.3)*len,cy=lerp(ay,ey,.4);
      if(r.loop){c.globalAlpha=k;c.strokeStyle=r.col;c.lineWidth=r.w;c.beginPath();c.moveTo(ax,ay);c.quadraticCurveTo(ax-2.6+sw*.3,ay+len*.9,ax,ay+len);c.quadraticCurveTo(ax+2.6+sw*.3,ay+len*.9,ax+.4,ay);c.stroke();continue;}
      c.globalAlpha=k;c.strokeStyle=r.shade;c.lineWidth=r.w+.7;c.beginPath();c.moveTo(ax,ay);c.quadraticCurveTo(cx,cy,ex,ey);c.stroke();
      c.strokeStyle=r.col;c.lineWidth=r.w;c.beginPath();c.moveTo(ax,ay);c.quadraticCurveTo(cx,cy,ex,ey);c.stroke();
      if(r.bead&&i===0){c.strokeStyle=r.col;c.lineWidth=.22;c.beginPath();for(const dx of [-.45,0,.45]){c.moveTo(ex,ey+.5);c.lineTo(ex+dx*1.6,ey+2.6);}c.stroke();c.fillStyle='#062a28';c.beginPath();c.arc(ex,ey,.95,0,TAU);c.fill();c.globalCompositeOperation='lighter';c.fillStyle=r.bead;c.globalAlpha=k*.9;c.beginPath();c.arc(ex,ey,.7,0,TAU);c.fill();c.globalAlpha=k*.25;c.beginPath();c.arc(ex,ey,2,0,TAU);c.fill();c.globalCompositeOperation='source-over';c.globalAlpha=k;}}
    c.globalAlpha=k;c.fillStyle=r.shade;c.beginPath();c.arc(ax,ay,r.tassel?1.5:1.1,0,TAU);c.fill();}
  c.restore();}
// ---------- scabbards ----------
// from the mouth (at the hip) along s for len; sd mirrors it like the weapon. A curved blade's scabbard curves with it.
function scabbard(c,id,m,s,len,sd,o){const W=get(id);if(!W||!W.scab)return false;const S0=W.scab;if(S0.kind==='none')return true;o=o||{};
  const k=o.alpha==null?1:o.alpha,sg=sd<0?-1:1,nx=-s.y*sg,ny=s.x*sg,dg=W.kind==='dagger',w0=(dg?1.75:2.1)*(S0.wide?Math.min(1.25,S0.wide):1),w1=w0*.6,cv=S0.curve||0;
  c.save();c.transform(s.x,s.y,nx,ny,m.x,m.y);c.lineCap='round';c.lineJoin='round';
  const N=12,top=[],bot=[];for(let i=0;i<=N;i++){const u=i/N,x=u*len,y=-cv*u*u,w=lerp(w0,w1,Math.pow(u,1.2));top.push([x,y-w*.8]);bot.push([x,y+w]);}
  const body=pPoly([...top,[len+2.6,-cv+.4],...bot.reverse()]),mat=M[S0.metal]||M.brass,bc=S0.body;
  c.globalAlpha=k;c.strokeStyle=mix(bc,'#000000',.8);c.lineWidth=.9;c.stroke(body);c.fillStyle=S0.kind==='canvas'?bc:bc;c.fill(body);
  c.globalAlpha=k*.5;c.fillStyle=mix(bc,'#ffffff',.25);c.beginPath();for(let i=0;i<=N;i++){const [x,y]=top[i];i?c.lineTo(x,y+.5):c.moveTo(x,y+.5);}for(let i=N;i>=0;i--){const [x,y]=top[i];c.lineTo(x,y+1.3);}c.closePath();c.fill();
  if(S0.kind==='canvas'){c.globalAlpha=k*.6;c.strokeStyle=mix(bc,'#000000',.5);c.lineWidth=.3;c.setLineDash([.8,.8]);c.beginPath();for(let i=0;i<=N;i++){const [x,y]=bot[N-i];i?c.lineTo(x,y-.6):c.moveTo(x,y-.6);}c.stroke();c.setLineDash([]);}
  // the throat and the chape in metal, and the accent line down it
  if(S0.kind!=='canvas'){c.globalAlpha=k;const th=pRound(-.6,-w0*.9,3.4,w0*1.05,.6);c.strokeStyle=mat.o;c.lineWidth=.8;c.stroke(th);c.fillStyle=mat.b;c.fill(th);c.fillStyle=mat.l;c.globalAlpha=k*.7;c.fillRect(0,-w0*.75,3,.5);
    c.globalAlpha=k;const cy=-cv,ch=pCmd([['M',len-6.5,cy-w1*.85],['L',len+2.6,cy+.2],['L',len-6.5,cy+w1*1.05],['Z']]);c.strokeStyle=mat.o;c.stroke(ch);c.fillStyle=mat.b;c.fill(ch);
    if(!dg){const bd=pRound(len*.45-1,-cv*.2-w0*.82,len*.45+1,-cv*.2+w0*.95,.4);c.strokeStyle=mat.o;c.stroke(bd);c.fillStyle=mat.b;c.fill(bd);}}
  else{c.globalAlpha=k;c.fillStyle=M.iron.b;c.beginPath();c.arc(1.6,-w0*.9,.9,0,TAU);c.fill();}
  if(S0.acc){c.globalAlpha=k*.75;c.strokeStyle=S0.acc;c.lineWidth=.32;c.beginPath();for(let i=1;i<N;i++){const u=i/N,x=u*len,y=-cv*u*u+.2;i>1?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}
  c.restore();return true;}
// ---------- for the boards ----------
function names(){return Object.values(D).map(d=>({key:d.key,kind:d.kind,name:d.name,what:d.what}));}
return{draw,scabbard,get,spec,names,arc,ARC_NOIR,D,HOUSE,SIGKEY,M,mix,ok:typeof Path2D==='function'};
})();
// ---------- in the game ----------
// A fighter's weapon is drawn from its design (sk_arms.js says which, and carries it when the weapon changes hands). S.classicLook
// brings back the old silhouettes; without Path2D (the headless checks) they stay.
function armsOn(id){return!!id&&ArmsLook.ok&&!S.classicLook;}
{const _dw=drawWeapon;drawWeapon=function(f){const id=f.wdes;if(!armsOn(id)||f.wp.unarmed)return _dw(f);
  const L=kaelLight(f),o={light:L.light,dir:L.dir,now:S.t};
  // on its way out of the scabbard: the grip in the hand and the blade as far as the scabbard's mouth
  if(f.sheath&&S.t<f.sheath.t0+f.sheath.out&&f.scab===f.weaponKey){const q=scabFrame(f),h=f.p[HAF],m=q.mouth,vis=Math.hypot(m.x-h.x,m.y-h.y);
    if(vis<1)return;o.cut=Math.min(f.wp.len,vis);ArmsLook.draw(ctx,id,h,m,f.facing,o);return;}
  const t=f.p[TIP];o.vel={x:(t.x-t.px)/DT,y:(t.y-t.py)/DT};ArmsLook.draw(ctx,id,f.p[HAF],t,f.facing,o);};}
// the arc-blade in the colours of Kael's look
function arcPal(){const L=typeof KaelLook!=='undefined'&&KaelLook.LOOKS?KaelLook.LOOKS[KaelLook.cfg.look]:null;if(!L)return null;const C=L.col,t=(x,i)=>Array.isArray(x)?x[i]:x;
  return{blade:C.blade,bladeEdge:C.bladeEdge,glow:C.glow,glow2:C.glow2,gold:t(C.gold,0),goldDim:C.goldDim||t(C.gold,1)};}
// a weapon on the floor or stuck in a body keeps its look; the arc-blade too, lying where it fell
{const _di=drawItem;drawItem=function(it){
  if(it.key==='elven'&&ArmsLook.ok&&!S.classicLook){const a=P(it.a.x,it.a.y,it.dep),b=P(it.b.x,it.b.y,it.dep),L=Math.hypot(b.x-a.x,b.y-a.y)||1,wb=WEAPONS.elven.butt,tr=ctx.getTransform();
    ArmsLook.arc(ctx,{x:a.x+(b.x-a.x)/L*wb,y:a.y+(b.y-a.y)/L*wb},b,1,null,arcPal(),{now:S.t,L:{x:.2,y:-1},k:Math.hypot(tr.a,tr.b)});return;}
  if(!armsOn(it.wdes))return _di(it);
  const wp=WEAPONS[it.key],a=P(it.a.x,it.a.y,it.dep),b=P(it.b.x,it.b.y,it.dep),L=Math.hypot(b.x-a.x,b.y-a.y)||1,ux=(b.x-a.x)/L,uy=(b.y-a.y)/L,h={x:a.x+ux*wp.butt,y:a.y+uy*wp.butt};
  ArmsLook.draw(ctx,it.wdes,h,b,1,{dir:{x:.2,y:-1},now:S.t});};}
// the scabbard on the hip goes with the fighter's own weapon, whatever is in his hand now
{const _ds=drawScabbard;drawScabbard=function(f){const id=S.hooks.arms(f,f.scab);if(!armsOn(id))return _ds(f);
  const q=scabFrame(f);if(!ArmsLook.scabbard(ctx,id,q.mouth,{x:q.sx,y:q.sy},q.len,f.facing,{}))_ds(f);};}
// Mr. Hallowell's sword-cane leans on the end of his desk, its crook over the edge; he never reaches for it
{const _dd=drawDesk;drawDesk=function(Pp,back){_dd(Pp,back);if(back||!ArmsLook.ok||S.classicLook)return;
  const p=Pp.pts,d=Pp.dep,dz=Pp.dz,fr=d-dz*.8,x1=p[1].x,yt=p[0].y,g=p[2].y+2;
  ArmsLook.draw(ctx,'sig:Mr. Hallowell',P(x1+12,g,fr+4),P(x1-1.5,yt-2,fr+4),-1,{dir:{x:.2,y:-1},now:S.t});};}
// the Fighters panel names each elf's own weapon under the weapon buttons
function armsBench(){
  for(const e of benchEntries()){if(!e.foe)continue;const s=ARMS.sig[e.name],d=benchBox.querySelector(`.fcfg[data-k="${e.key}"]`);if(!s||!s.key||!d)continue;
    const seg=d.querySelector('.seg');if(!seg||typeof seg.after!=='function')continue;const p=document.createElement('p');p.className='wsig';seg.after(p);
    const upd=()=>{const k=e.cfg.weapon,sp=ArmsLook.spec('sig:'+e.name);
      p.innerHTML=k===s.key?`<b>${s.name}</b>: ${sp?sp.what:''}`:`Elven ${WEAPONS[k].name.toLowerCase()} in ${e.name}'s colours. <b>${s.name}</b>, ${e.name}'s own, is a ${WEAPONS[s.key].name.toLowerCase()}.`;};
    upd();d.querySelectorAll('[data-w]').forEach(b=>b.addEventListener('click',upd));}}
{const _bb=buildBench;buildBench=function(){_bb();armsBench();};}
// Kael's hip dagger in his off hand, in the clinch
{const _od=drawOffDagger;drawOffDagger=function(f){const id=S.hooks.arms(f,'dagger');if(!armsOn(id))return _od(f);const q=offDaggerPts(f);ArmsLook.draw(ctx,id,q.h,q.t,f.facing,{dir:{x:.2,y:-1},now:S.t});};}
// ===== ARMS UI END =====
