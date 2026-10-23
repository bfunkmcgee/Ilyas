// ===== ENV TEX B =====
// Surfaces for the old elven ground outside the city: dressed stone in courses, the terrace's paving with its brass inlay, turf and
// earth. Built from EnvTex's primitives, pixel by pixel, once. Every noise runs a whole number of cycles across its tile so the tiles
// repeat clean.
const EnvTexB=(()=>{const T=EnvTex,{rng,clamp}=EnvLook,{noise2,fbm,pix,hex,lerp3}=T;const CACHE={},memo=(k,fn)=>CACHE[k]||(CACHE[k]=fn());
// ---------- ashlar: dressed stone in courses bh units high, blocks about bl long. A tooled face pitted by weather, the arrises worn round
// and dark, the top arris catching the light, lichen in pale rosettes, moss in the joints ----------
function ashlar(seed,o){o=o||{};return memo('ashlar'+seed+JSON.stringify(o),()=>{
  const bh=o.bh||16,bl=o.bl||34,cols=o.cols||6,rows=o.rows||6,sc=o.sc||4,TW=cols*bl,TH=rows*bh,W2=Math.round(TW*sc),H2=Math.round(TH*sc),jw=o.jw||.8;
  const n=noise2(seed,16),n2=noise2(seed+3,64),n3=noise2(seed+7,32),r=rng(seed),R=[];
  for(let j=0;j<rows;j++){const ws=[];let s=0;for(let i=0;i<cols;i++){const w=.6+r()*.8;ws.push(w);s+=w;}const cuts=[0];let a=0;for(let i=0;i<cols;i++){a+=ws[i]/s*TW;cuts.push(a);}
    const t=[];for(let i=0;i<cols;i++)t.push({t:r(),u:Math.floor(r()*16),v:Math.floor(r()*16),lich:r(),dark:r()<.15});R.push({off:r()*TW,cuts,t});}
  const c0=hex(o.c0||'#6a6458'),c1=hex(o.c1||'#857c6c'),jc=hex(o.joint||'#1a1814'),moss=hex(o.moss||'#2e3a20'),lich=hex(o.lichen||'#9a9a78');
  return pix(W2,H2,(u,v,out)=>{const X=u*TW,Y=v*TH,row=Math.min(rows-1,Math.floor(Y/bh)),RR=R[row],xs=(X+RR.off)%TW;let ci=0;while(ci<cols-1&&xs>=RR.cuts[ci+1])ci++;
    const L2=RR.cuts[ci+1]-RR.cuts[ci],bx=xs-RR.cuts[ci],by=Y-row*bh,t=RR.t[ci],rag=fbm(n2,u*64,v*64,2)*.6,e=Math.min(bx,L2-bx,by,bh-by);
    if(e<jw+rag){const m=fbm(n3,u*32,v*32,3),cc=m>.5?lerp3(jc,moss,clamp((m-.5)*3,0,.8)):jc;out[0]=cc[0];out[1]=cc[1];out[2]=cc[2];return;}
    const nn=fbm(n,u*16+t.u,v*16+t.v,5,.55),pit=fbm(n2,u*64,v*64,3);let cc=lerp3(c0,c1,clamp(t.t*.6+nn*.5,0,1));if(t.dark)cc=lerp3(cc,[30,28,24],.35);
    const edge=clamp((e-jw-rag)/2.2,0,1);let k=(.62+.38*Math.sqrt(edge))*(.86+pit*.28);if(by-jw<2.2&&e>jw+rag)k*=1.1;
    const lv=fbm(n3,u*32+t.u,v*32+t.v,3);if(lv>.64)cc=lerp3(cc,lich,clamp((lv-.64)*3.5,0,.7)*(.4+t.lich*.6));
    out[0]=Math.min(255,cc[0]*k);out[1]=Math.min(255,cc[1]*k);out[2]=Math.min(255,cc[2]*k);});});}
// ---------- the terrace's paving: big slabs of pale elven limestone in a running bond (L along x, D into the ground), a thin line of
// brass let into every third course joint, moss and earth in the joints, cracks, a few slabs sunk and dark ----------
function paving(seed,o){o=o||{};return memo('paving'+seed+JSON.stringify(o),()=>{
  const L=o.L||36,D=o.D||18,cols=o.cols||4,rows=o.rows||6,sc=o.sc||5,TW=cols*L,TH=rows*D,W2=Math.round(TW*sc),H2=Math.round(TH*sc),jw=o.jw||.38;
  const n=noise2(seed,16),n2=noise2(seed+9,32),ng=noise2(seed+4,128),r=rng(seed),R=[];
  for(let j=0;j<rows;j++){const ws=[];let s=0;for(let i=0;i<cols;i++){const w=.75+r()*.5;ws.push(w);s+=w;}const cuts=[0];let a=0;for(let i=0;i<cols;i++){a+=ws[i]/s*TW;cuts.push(a);}
    const t=[];for(let i=0;i<cols;i++)t.push({t:r(),u:Math.floor(r()*16),v:Math.floor(r()*16),crack:r()<.22?{a:.2+r()*2.7,p:.25+r()*.5,q:.25+r()*.5}:null,sunk:r()<.07});R.push({off:r()*TW,cuts,t,brass:j%3===0});}
  const c0=hex(o.c0||'#77706a'),c1=hex(o.c1||'#948a7e'),moss=hex(o.moss||'#2a3420'),jc=hex(o.joint||'#2a2620'),brass=hex(o.brass||'#c9a25a');
  return pix(W2,H2,(u,v,out)=>{const X=u*TW,Y=v*TH,row=Math.min(rows-1,Math.floor(Y/D)),RR=R[row],xs=(X+RR.off)%TW;let ci=0;while(ci<cols-1&&xs>=RR.cuts[ci+1])ci++;
    const L2=RR.cuts[ci+1]-RR.cuts[ci],bx=xs-RR.cuts[ci],by=Y-row*D,t=RR.t[ci],rag=fbm(n2,u*32,v*32,2)*.4,e=Math.min(bx,L2-bx,by,D-by);
    // the brass inlay runs along the course joint at the slab's near edge
    if(RR.brass&&by<jw+.9&&by>jw-.2){const w=fbm(n2,u*32+5,v*32,2);const k=.7+w*.5;out[0]=brass[0]*k;out[1]=brass[1]*k;out[2]=brass[2]*k;return;}
    if(e<jw+rag){const m=fbm(n2,u*32+3,v*32+7,3),cc=m>.48?lerp3(jc,moss,clamp((m-.48)*3,0,.85)):jc;out[0]=cc[0];out[1]=cc[1];out[2]=cc[2];return;}
    const nn=fbm(n,u*16+t.u,v*16+t.v,5,.55),g=ng(u*128,v*128);let cc=lerp3(c0,c1,clamp(t.t*.55+nn*.5,0,1));
    const st=fbm(n2,u*32+t.v,v*32+t.u,3);if(st>.6)cc=lerp3(cc,[48,46,38],clamp((st-.6)*1.4,0,.3));
    let k=(.86+.14*clamp((e-jw)/1.6,0,1))*(.94+g*.12);if(e<1.2&&by>D-1.8)k*=1.1;if(t.sunk)k*=.62;
    if(t.crack){const cx=L2*t.crack.p,cy=D*t.crack.q,dd=Math.abs((bx-cx)*Math.sin(t.crack.a)-(by-cy)*Math.cos(t.crack.a))+(fbm(n2,u*32,v*32,3)-.5)*2.2;if(dd<.22&&Math.hypot(bx-cx,by-cy)<L2*.32)k*=.5;}
    out[0]=cc[0]*k;out[1]=cc[1]*k;out[2]=cc[2]*k;});});}
// ---------- turf: dark grass worn to earth in places, a scatter of small stones, clumps. In ground units ----------
function turf(seed,o){o=o||{};return memo('turf'+seed+JSON.stringify(o),()=>{const w=o.w||256,h=o.h||256,n=noise2(seed,16),n2=noise2(seed+5,64),ng=noise2(seed+8,128),r=rng(seed);
  const g0=hex(o.g0||'#2a3220'),g1=hex(o.g1||'#46502e'),dry=hex(o.dry||'#6a6440'),earth=hex(o.earth||'#3a2c20'),stone=hex(o.stone||'#8a8478');
  const stones=[];for(let i=0;i<(o.stones||40);i++)stones.push({x:r(),y:r(),rr:(1+r()*2.6)/w,t:r()});
  return pix(w,h,(u,v,out)=>{const big=fbm(n,u*16,v*16,4),fine=fbm(n2,u*64,v*64,3),bl=ng(u*128,v*128);
    let cc=lerp3(g0,g1,clamp(fine*.9+bl*.3-.1,0,1));if(bl>.78)cc=lerp3(cc,dry,.45);
    const er=clamp((big-.56)*3.2,0,1);cc=lerp3(cc,earth,er*.85);
    for(const s of stones){let dx=u-s.x,dy=v-s.y;if(dx>.5)dx-=1;if(dx<-.5)dx+=1;if(dy>.5)dy-=1;if(dy<-.5)dy+=1;const d=Math.hypot(dx,dy*1.6)/s.rr;if(d<1){cc=lerp3(stone,[40,38,34],.3+s.t*.4);if(dy<0&&d>.5)cc=lerp3(cc,[200,190,170],.25);break;}}
    const k=.85+fine*.3;out[0]=cc[0]*k;out[1]=cc[1]*k;out[2]=cc[2]*k;});});}
return{ashlar,paving,turf};})();
// ===== ENV TEX B END =====
