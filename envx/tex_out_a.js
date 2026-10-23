// ===== ENV OUTDOOR TEXTURES (field, hill) =====
// Surfaces for the open grounds, made pixel by pixel once like EnvTex's: grazed grass seen from above, and weathered stone with lichen.
// Every noise runs at a whole number of cycles across the tile so the patterns repeat clean.
const OutTex=(()=>{const T=EnvTex,{noise2,fbm,pix,hex,lerp3}=T,{clamp}=EnvLook;const CACHE={};const memo=(k,fn)=>CACHE[k]||(CACHE[k]=fn());
// grass seen from above: lusher and thinner patches, dry stalks, bare earth showing through; U plane units square at sc px a unit
function meadow(seed,o){o=o||{};return memo('meadow'+seed+JSON.stringify(o),()=>{const U=o.U||128,sc=o.sc||3,N=Math.round(U*sc),n=noise2(seed,16),n2=noise2(seed+1,64),n3=noise2(seed+2,128);
  const g0=hex(o.g0||'#16241a'),g1=hex(o.g1||'#2a3a24'),dry=hex(o.dry||'#3a3a26'),earth=hex(o.earth||'#2a2018');
  return pix(N,N,(u,v,out)=>{const a=fbm(n,u*16,v*16,4),b=fbm(n2,u*64,v*64,3),f=n3(u*128,v*128);
    let cc=lerp3(g0,g1,clamp(a*1.2-.1,0,1));cc=lerp3(cc,dry,clamp((b-.55)*2,0,.55));
    if(a<.32)cc=lerp3(cc,earth,clamp((.32-a)*4,0,.65));
    const k=.84+f*.32;out[0]=cc[0]*k;out[1]=cc[1]*k;out[2]=cc[2]*k;});});}
// weathered stone: limestone mottled by the weather, dark streaks run down it, lichen in crusts (rust-gold and pale grey-green), moss low down
function lichenStone(seed,w,h,o){o=o||{};return memo('lst'+seed+w+h+JSON.stringify(o),()=>{const n=noise2(seed,16),n2=noise2(seed+3,64),n3=noise2(seed+5,32);
  const b=hex(o.base||'#8a8478'),dk=hex(o.dark||'#3a3832'),l1=hex(o.l1||'#b8863a'),l2=hex(o.l2||'#8a9a7a'),moss=hex(o.moss||'#2e3e22');
  return pix(w,h,(u,v,out)=>{const m=fbm(n,u*16,v*16,4),g=n2(u*64,v*64),st=fbm(n3,u*32,3.5,3);
    let cc=lerp3(b,dk,clamp((m-.35)*1.4,0,.8));cc=lerp3(cc,dk,clamp((st-.52)*2.4,0,.55)*(.4+.6*v));
    const l=fbm(n2,u*64+7,v*64+3,3);if(l>.66)cc=lerp3(cc,l1,clamp((l-.66)*4,0,.7));else if(l<.3)cc=lerp3(cc,l2,clamp((.3-l)*3,0,.55));
    if(v>.72){const mm=fbm(n3,u*32+9,v*32,3);if(mm>.45)cc=lerp3(cc,moss,clamp((mm-.45)*3*(v-.72)*3.6,0,.8));}
    const k=.88+g*.24;out[0]=cc[0]*k;out[1]=cc[1]*k;out[2]=cc[2]*k;});});}
// packed earth and fine gravel for a path: ruts, stones, a damp sheen
function pathEarth(seed,o){o=o||{};return memo('path'+seed+JSON.stringify(o),()=>{const U=o.U||64,sc=o.sc||4,N=Math.round(U*sc),n=noise2(seed,16),n2=noise2(seed+1,128);
  const e0=hex(o.e0||'#2a2219'),e1=hex(o.e1||'#463a2c'),st=hex(o.stone||'#6a6458');
  return pix(N,N,(u,v,out)=>{const a=fbm(n,u*16,v*16,4),g=n2(u*128,v*128);let cc=lerp3(e0,e1,clamp(a*1.3-.15,0,1));
    if(g>.8)cc=lerp3(cc,st,clamp((g-.8)*4,0,.8));else if(g<.15)cc=lerp3(cc,[14,10,8],.5);
    out[0]=cc[0];out[1]=cc[1];out[2]=cc[2];});});}
return{meadow,lichenStone,pathEarth};
})();
// ===== ENV OUTDOOR TEXTURES END =====
