// ===== TEX LOBBY =====
// Stone and cloth for the Hallowell lobby, made pixel by pixel once from EnvTex's primitives: Nero Portoro (black marble veined in gold
// and white), the grey floor marble, honey onyx to light from behind, black leather and gold velvet. Every noise runs at whole cycles of
// its grid, so a tile repeats clean.
const LobbyTex=(()=>{const T=EnvTex,{noise2,fbm,pix,hex,lerp3}=T,{clamp}=EnvLook;const CACHE={};const memo=(k,f)=>CACHE[k]||(CACHE[k]=f());
const ss=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
// a ridge: 1 on the line where the noise crosses its middle, falling away either side
// a family of veins: thin lines where a warped wave crosses zero. a and b are whole numbers, so the wave repeats with the tile
const veinLine=(u,v,a,b,warp,k)=>Math.pow(1-Math.abs(Math.sin(Math.PI*(a*u+b*v)+warp)),k);
// ---------- Nero Portoro: black, clouded deeper black; gold veins in long sweeps, here and there swelling into a gold cloud with white
// at its edge; a net of white hairlines ----------
function nero(seed,w,h,o){o=o||{};return memo('nero'+seed+w+h+JSON.stringify(o),()=>{
  const nL=noise2(seed,4),nM=noise2(seed+1,8),nW=noise2(seed+2,16),nH=noise2(seed+3,32),nF=noise2(seed+4,128);
  const base=hex(o.base||'#100e12'),cloud=hex(o.cloud||'#1d1a20'),gold=hex(o.gold||'#a8884e'),goldL=hex(o.goldL||'#dcc08a'),white=hex(o.white||'#d6d0c4');
  const gk=o.goldK==null?1:o.goldK,wk=o.whiteK==null?1:o.whiteK;
  return pix(w,h,(u,v,out)=>{
    const w1=fbm(nL,u*4,v*4,4)*2.6+fbm(nW,u*16,v*16,3)*.7,w2=fbm(nL,u*4+2.3,v*4+1.1,4)*3+fbm(nW,u*16+5,v*16+3,3)*.8;
    const t=fbm(nM,u*8,v*8,4);let col=lerp3(base,cloud,ss(.35,.75,t));
    // the gold: two families of veins, shown only where a slow mask lets them through, fuzzy-edged with a brighter core
    const m1=ss(.3,.55,fbm(nL,u*4+1.7,v*4+.4,3)),m2=ss(.45,.65,fbm(nM,u*8+4,v*8+2,3));
    const g1=veinLine(u,v,1,2,w1,18)*m1,g2=veinLine(u,v,2,-1,w2,34)*m2*.75,gh=veinLine(u,v,1,2,w1,3)*m1*.22;
    const g=clamp((g1+g2+gh)*gk,0,1);
    // white hairlines: a finer net
    const wr=veinLine(u,v,3,5,w2*1.6+fbm(nH,u*32,v*32,3)*2,90)+veinLine(u,v,5,-2,w1*1.3+fbm(nH,u*32+3,v*32,3)*2,120);
    col=lerp3(col,white,clamp(wr,0,1)*.5*wk);
    col=lerp3(col,lerp3(gold,goldL,ss(.55,1,g)),ss(.05,.6,g));
    if(g>.75)col=lerp3(col,white,(g-.75)*.6);
    const sp=nF(u*128,v*128);if(sp>.9)col=lerp3(col,[255,250,240],.05);
    out[0]=col[0];out[1]=col[1];out[2]=col[2];});});}
// ---------- the floor: a dark grey marble, calm, a few long pale veins running one way ----------
function greyStone(seed,w,h,o){o=o||{};return memo('grey'+seed+w+h+JSON.stringify(o),()=>{
  const nL=noise2(seed,4),nM=noise2(seed+1,8),nW=noise2(seed+2,16),nF=noise2(seed+3,64);
  const base=hex(o.base||'#3a3a40'),cloud=hex(o.cloud||'#4a4a52'),dark=hex(o.dark||'#2c2c32'),vein=hex(o.vein||'#b8b4ae');
  return pix(w,h,(u,v,out)=>{const wv=fbm(nL,u*4,v*4,4)*2.4+fbm(nW,u*16,v*16,3)*.6;
    const t=fbm(nM,u*8,v*8,5,.55);let col=lerp3(dark,cloud,ss(.25,.8,t));col=lerp3(col,base,.35);
    const m=ss(.45,.65,fbm(nL,u*4+2,v*4+3,3));
    const vv=(veinLine(u,v,1,1,wv,34)*m+veinLine(u,v,2,1,wv*1.3+1,60)*.6)*(o.veinK==null?.5:o.veinK);col=lerp3(col,vein,clamp(vv,0,1));
    const f=fbm(nF,u*64,v*64,2);col=lerp3(col,[0,0,0],(1-f)*.08);
    out[0]=col[0];out[1]=col[1];out[2]=col[2];});});}
// ---------- honey onyx: bands of amber laid down in wavy layers, translucent; lit from behind it glows ----------
function onyx(seed,w,h,o){o=o||{};return memo('onyx'+seed+w+h,()=>{const nL=noise2(seed,4),nM=noise2(seed+1,16),nF=noise2(seed+2,64);
  const deep=hex('#7a3a10'),mid=hex('#d8862a'),pale=hex('#ffd88a'),milk=hex('#fff0cc');
  return pix(w,h,(u,v,out)=>{const warp=fbm(nL,u*4,v*4,4)*2.4+fbm(nM,u*16,v*16,3)*.35;
    const b=.5+.5*Math.sin((v*6+warp)*Math.PI*2),b2=.5+.5*Math.sin((v*17+warp*2.2)*Math.PI*2);
    let col=lerp3(deep,mid,ss(.1,.7,b));col=lerp3(col,pale,ss(.55,1,b)*.7);col=lerp3(col,milk,ss(.8,1,b2)*.35*b);
    const f=fbm(nF,u*64,v*64,2);col=lerp3(col,deep,(1-f)*.18);
    out[0]=col[0];out[1]=col[1];out[2]=col[2];});});}
// ---------- black leather: a fine pebble grain, creased softly ----------
function leather(seed,w,h,o){o=o||{};return memo('lea'+seed+w+h+(o.base||''),()=>{const nG=noise2(seed,64),nC=noise2(seed+1,8),b=hex(o.base||'#1a1718');
  return pix(w,h,(u,v,out)=>{const g=fbm(nG,u*64,v*64,2),c=fbm(nC,u*8,v*8,4);const k=.86+g*.22+(c-.5)*.25;out[0]=b[0]*k;out[1]=b[1]*k;out[2]=b[2]*k;});});}
// ---------- velvet: the pile catches the light unevenly, brushed one way ----------
function velvet(seed,w,h,o){o=o||{};return memo('vel'+seed+w+h+(o.base||''),()=>{const nG=noise2(seed,32),nC=noise2(seed+1,8),b=hex(o.base||'#8a6a2a');
  return pix(w,h,(u,v,out)=>{const g=fbm(nG,u*32,v*32,3),c=fbm(nC,u*8,v*8,3);const k=.78+g*.3+(c-.5)*.35;out[0]=Math.min(255,b[0]*k);out[1]=Math.min(255,b[1]*k);out[2]=Math.min(255,b[2]*k);});});}
// a texture laid from (x, y), u units to a texture pixel, turned rot degrees, flipped when fx is -1 (book-matched panels)
function at(c,cv,x,y,u,rot,fx){const p=c.createPattern(cv,'repeat');if(p.setTransform){let m=new DOMMatrix().translate(x,y);if(rot)m=m.rotate(rot);if(fx===-1)m=m.scale(-1,1);p.setTransform(m.scale(u));}return p;}
return{nero,greyStone,onyx,leather,velvet,at,ss};})();
// ===== TEX LOBBY END =====
