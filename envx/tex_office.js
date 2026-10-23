// ===== OFFICE TEXTURES =====
// Surfaces for Mr. Hallowell's office, made pixel by pixel once from EnvTex's primitives: moiré silk for the walls, gold leaf, pebbled
// leather, travertine, and the canvas weave of a painting. Every noise runs at a whole number of cycles across its tile so it repeats clean.
const OfficeTex=(()=>{const T=EnvTex,{noise2,fbm,pix,hex,lerp3}=T,{rng,clamp}=EnvLook,TAU=Math.PI*2;
const CACHE={},memo=(k,f)=>CACHE[k]||(CACHE[k]=f());
// moiré silk: shot pale gold, the weft in fine lines, the watering in long wavy bands that catch the light
function silk(seed,o){o=o||{};return memo('silk'+seed+JSON.stringify(o),()=>{const w=o.w||256,h=o.h||256,n=noise2(seed,8),n2=noise2(seed+3,64),n3=noise2(seed+5,16),b=hex(o.base||'#a89064'),hi=hex(o.hi||'#e6d4a4'),lo=hex(o.lo||'#5e4c30');
  return pix(w,h,(u,v,out)=>{const wv=fbm(n,u*8,v*8,3),band=Math.sin((v*20+wv*3.4+Math.sin(u*TAU*2)*.35)*TAU),band2=Math.sin((v*33+fbm(n3,u*16,v*16,2)*2.2)*TAU);
    const weft=.5+.5*Math.sin(v*h*Math.PI*.5),warp=.5+.5*Math.sin(u*w*Math.PI*.5),fine=fbm(n2,u*64,v*64,2);
    const t=clamp(.5+band*.1+band2*.04+(weft-.5)*.12+(warp-.5)*.04+(fine-.5)*.1,0,1);
    const c=t<.5?lerp3(lo,b,t*2):lerp3(b,hi,(t-.5)*2);out[0]=c[0];out[1]=c[1];out[2]=c[2];});});}
// gold leaf: squares of leaf laid edge to edge, each catching the light its own way, a hairline at every overlap, cracked to the red bole here and there
function goldLeaf(seed,o){o=o||{};return memo('leaf'+seed+JSON.stringify(o),()=>{const w=o.w||256,h=o.h||256,S=o.sq||32,n=noise2(seed,32),r=rng(seed),cols=Math.round(w/S),rows=Math.round(h/S),tone=[];for(let i=0;i<cols*rows;i++)tone.push(r());
  const g0=hex(o.c0||'#a8803e'),g1=hex(o.c1||'#ecd08a'),bole=hex(o.bole||'#6a2e1a');
  return pix(w,h,(u,v,out)=>{const X=u*w,Y=v*h,ci=Math.min(cols-1,Math.floor(X/S)),ri=Math.min(rows-1,Math.floor(Y/S)),t=tone[ri*cols+ci],bx=X-ci*S,by=Y-ri*S,e=Math.min(bx,S-bx,by,S-by);
    let c=lerp3(g0,g1,clamp(t*(o.var==null?.55:o.var)+fbm(n,u*32,v*32,3)*.55,0,1));if(e<.9)c=lerp3(c,[96,64,28],o.seam==null?.35:o.seam);
    const cr=fbm(n,u*32+7,v*32+3,4);if(Math.abs(cr-.66)<.006)c=bole;out[0]=c[0];out[1]=c[1];out[2]=c[2];});});}
// pebbled leather: a fine grain of tiny pebbles, a few creases, in the colour given
function leather(seed,o){o=o||{};return memo('lea'+seed+JSON.stringify(o),()=>{const w=o.w||128,h=o.h||128,n=noise2(seed,64),n2=noise2(seed+5,16),b=hex(o.base||'#7a4428');
  return pix(w,h,(u,v,out)=>{const p=fbm(n,u*64,v*64,2),cr=fbm(n2,u*16,v*16,3);let k=.88+(p-.5)*.3+(cr-.5)*.22;if(Math.abs(cr-.5)<.012)k*=.82;
    out[0]=Math.min(255,b[0]*k);out[1]=Math.min(255,b[1]*k);out[2]=Math.min(255,b[2]*k);});});}
// travertine: pale warm stone laid down in layers, its pores dark
function travertine(seed,o){o=o||{};return memo('trav'+seed+JSON.stringify(o),()=>{const w=o.w||256,h=o.h||128,n=noise2(seed,16),n2=noise2(seed+2,64),b=hex(o.base||'#c8b48c'),d=hex(o.dark||'#8a7454');
  return pix(w,h,(u,v,out)=>{const layer=Math.sin((v*12+fbm(n,u*16,v*16,3)*1.6)*TAU)*.5+.5,pore=fbm(n2,u*64,v*64,2);let c=lerp3(b,d,layer*.28+(fbm(n,u*16,v*16,4)-.5)*.3);
    if(pore>.7)c=lerp3(c,[70,56,40],clamp((pore-.7)*4,0,.7));out[0]=c[0];out[1]=c[1];out[2]=c[2];});});}
// a painter's canvas: the weave showing through thin paint, used as an overlay in multiply-like darkening
function canvasWeave(seed){return memo('cw'+seed,()=>{const w=64,h=64,n=noise2(seed,16);return pix(w,h,(u,v,out)=>{const a=.5+.5*Math.sin(u*w*Math.PI*.5),b=.5+.5*Math.sin(v*h*Math.PI*.5),k=(a*.5+b*.5)*.6+fbm(n,u*16,v*16,2)*.4;
  out[0]=0;out[1]=0;out[2]=0;out[3]=Math.round(clamp(k,0,1)*60);});});}
return{silk,goldLeaf,leather,travertine,canvasWeave};})();
// ===== OFFICE TEXTURES END =====
