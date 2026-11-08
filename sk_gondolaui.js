// ===== THE GONDOLA ON THE PAGE START (since V106) =====
// What the scenes of sk_gondola.js leave in the world, drawn where the painter does not: the cradle's near side among the people (the
// painter's frontItem, by depth: whoever is on the deck is behind its toe board and its near rail), the work lamps as lights, and the
// scenes' own sounds. Nothing here writes what the game reads (the drawfree suite).

// ---------- the near side among the people ----------
function gondOn(){return S.arenaKey==='gondola'&&!!S.gondola&&!S.classicLook&&typeof envKey==='function'&&envKey()==='gondola';}
{const ei=envItems;envItems=function(items){ei(items);if(!gondOn())return;const L=EnvLook.S.gondola;if(L&&L.frontItem){const it=L.frontItem();items.push({d:it.d,gondFront:it});}};}
{const de=drawEnvItem;drawEnvItem=function(it){if(!it.gondFront)return de(it);ctx.save();try{it.gondFront.draw(ctx);}catch(e){}ctx.restore();return true;};}

// ---------- the work lamps' light ----------
V11UI.init.push(()=>{if(typeof FXL==='undefined'||!FXL.lights)return;
  FXL.lights.push(add=>{if(!gondOn())return;for(const x of [GOND.x0+10,GOND.x1-10]){const p=gondXf(x,GB-GOND.stir+18);add(p.x,p.y,GOND.d1-6,'#e8f4ff',.5,240);}});});

// ---------- the sounds ----------
// the cradle's steel creaking on its ropes, a rope creaking under him as he climbs, the wind going past a body falling away
V11UI.init.push(()=>{const snd=S.hooks.sound,OWN=new Set(['creak','rope_creak','fall_away']);
  const later=(ms,fn)=>setTimeout(()=>{try{fn();}catch(e){}},ms);
  S.hooks.sound=(k,v,c)=>{if(!OWN.has(k)){snd(k,v,c);return;}
    if(!S.soundOn||typeof AC==='undefined'||!AC||AC.state!=='running')return;
    try{
      if(k==='creak'){for(let i=0;i<3;i++)later(i*170+uiRand()*60,()=>{tone(.22,'sawtooth',180+uiRand()*60,120,.05*v);nz(.14,'bandpass',700,420,6,.08*v);});}
      else if(k==='rope_creak'){for(let i=0;i<6;i++)later(i*420,()=>{tone(.16,'triangle',320+uiRand()*80,240,.04);nz(.08,'bandpass',1400,900,4,.05);});}
      else if(k==='fall_away'){nz(1.6,'bandpass',900,300,1.2,.18*v);}
    }catch(e){}};});
// ===== THE GONDOLA ON THE PAGE END =====
