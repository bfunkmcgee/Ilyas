// ===== BEASTS IN THE FIGHT: UI =====
// The severed tail drawn where it lies (by the beasts' painter, or plainly without it), the swirl of a tail blow, the words for
// the new choices (Toss, Cut the tail) and for the new kills, and the beasts' noises.

// ---------- the severed tail, on the floor among everything else ----------
{const ei=envItems;envItems=function(items){ei(items);for(const P of S.tailBits||[])items.push({d:P.dep+.015,tailBit:P});};}
{const de=drawEnvItem;drawEnvItem=function(it){if(it.tailBit){drawTailBit(it.tailBit);return true;}return de(it);};}
function drawTailBit(P){ctx.save();ctx.translate(P.dep*PSX,-P.dep*PSY);
  try{if(typeof BeastLook!=='undefined'&&BeastLook.tailPiece&&!S.classicLook){const L=kaelLight(P.F);BeastLook.tailPiece(ctx,P,{light:L.light,dir:L.dir,now:S.t});}
    else{// plainly: a tapering dark shape along the chain, the cut end red
      const q=P.q,n=q.length;ctx.lineCap='round';ctx.strokeStyle='#15140f';
      for(let i=0;i<n-1;i++){ctx.lineWidth=Math.max(1,tailW(P.F,(P.i0+i)/TAIL.N)*.9);ctx.beginPath();ctx.moveTo(q[i].x,q[i].y);ctx.lineTo(q[i+1].x,q[i+1].y);ctx.stroke();}
      ctx.fillStyle='#7a1712';ctx.beginPath();ctx.arc(q[0].x,q[0].y,tailW(P.F,P.i0/TAIL.N)*.42,0,TAU);ctx.fill();}}
  catch(e){}
  ctx.restore();}
// a tail blow's swirl follows the tail, low along the floor or level at the hips, in the lizard's bronze
{const dsw=drawSwirl;drawSwirl=function(f,u,px,back){if(!f.tailAct||!f.tail||!f.tail.q)return dsw(f,u,px,back);
  const q=f.tail.q,tip=q[q.length-1],mid=q[Math.floor(q.length*.6)],R=Math.max(30,Math.abs(tip.x-px)),y0=lerp(mid.y,tip.y,.5),phi=u*TAU,sg=Math.sign(tip.x-px)||-f.facing;
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
  const N=22,span=2.6;let prev=null;
  for(let i=0;i<=N;i++){const th=phi-span+span*i/N,dz=R*Math.sin(th),pt={x:px+sg*R*Math.cos(th)+dz*PSX,y:y0-dz*PSY};
    if(prev&&((Math.sin(th)>0)===back)){const a=i/N;ctx.globalAlpha=a*a*.6;ctx.strokeStyle='#c08a3a';ctx.lineWidth=2+a*7;ctx.beginPath();ctx.moveTo(prev.x,prev.y);ctx.lineTo(pt.x,pt.y);ctx.stroke();
      ctx.globalAlpha=a*a*.45;ctx.strokeStyle='#fff1d0';ctx.lineWidth=1.3;ctx.stroke();}
    prev=pt;}
  ctx.restore();};}

// ---------- the new choices in an opening ----------
{const ol=openingLabel;openingLabel=function(o,k){return k==='toss'?'Toss':k==='tailcut'?'Cut the tail':ol(o,k);};}
{const os=openingSub;openingSub=function(o,k){
  if(k==='toss'){const ti=tossInfo(o.f,o.opp);return ti?tossText(ti):'No room';}
  if(k==='tailcut')return'Out behind him';
  return os(o,k);};}
{const oh=openingHint;openingHint=function(o,k){const A=o.f,D=o.opp;
  if(k==='toss')return`${Math.round(chanceOf(tossMods(A,D))*100)}% · ${openCost(A,k)} tempo`;
  if(k==='tailcut')return`${Math.round(tailCutChance(A,D)*100)}% · ${openCost(A,k)} tempo`;
  return oh(o,k);};}
{const of=openingFt0;openingFt0=function(o,k){if(k==='toss')return o.link?0:-FOOT_COST.throw;if(k==='tailcut'){const d=footDelta(o.f,'overhead',tailCutTech(o.f,o.opp));return o.link?Math.max(0,d):d;}return of(o,k);};}
{const rt=roleText;roleText=function(A,D,k){const dn=D?D.name:'';
  if(k==='toss'){const ti=tossInfo(A,D);if(!ti)return'Too far to get a hand on him.';
    const into=ti.hazard?(ti.hazard.kind==='body'?`into ${ti.hazard.o.name}, and knock them down too`:`${tossText(ti).toLowerCase()}`):ti.dir===Math.sign(D.station-A.station)?'across the floor':'over your shoulder';
    return`Grab ${dn} by the scruff and throw him ${into}: he lands hard and stays down until his next turn.`;}
  if(k==='tailcut')return`Chop through ${dn}'s tail where it hangs out behind him: it comes off for good, and with it his tail blows. A miss costs balance like any Overhead.`;
  return rt(A,D,k);};}
{const ci=cmdInfo0;cmdInfo0=function(A,D,k){if(k!=='toss')return ci(A,D,k);const ti=D?tossInfo(A,D):null,c=actionCost(A,'toss',0);
  return{tq:ti?tossText(ti):'Out of reach',h:ti?`${Math.round(chanceOf(tossMods(A,D))*100)}% · ${c} tempo`:'',ok:!!ti,mark:'brawl'};};}
function tossText(ti){if(ti.hazard){if(ti.hazard.kind==='body')return'Into '+ti.hazard.o.name;const h=typeof hazardText==='function'?hazardText(ti.hazard,ti):null;return h||THROW_INTO[ti.hazard.kind]||'Into the '+ti.hazard.kind;}
  return'Across the floor';}
{const tt=throwText;throwText=function(th){return th&&th.how==='toss'?tossText(th):tt(th);};}

// the lizard's card says whether he still has his tail
{const ut=updateTags;updateTags=function(){ut();for(const f of S.F){if(f.beast!=='lizard'||f.dead)continue;const el=$('tags'+f.idx);if(!el)continue;
  const cut=!!(f.tail&&f.tail.cut!=null),old=el.querySelector('.tag-tail');if(old){if(old.textContent===(cut?'Tailless':'Tail'))continue;old.remove();}
  el.insertAdjacentHTML('beforeend',cut?'<span class="tag tag-tail" style="color:var(--hp-low)" title="His tail has been cut off: no more Tail sweeps or Tail whips">Tailless</span>'
    :'<span class="tag tag-tail" style="color:#d9b26a" title="Tail sweep (at the shins) and Tail whip (at the body): a full turn that brings the tail round. One that misses leaves him with his back turned and the tail out, and Ilyas can cut it off">Tail</span>');}};}

// ---------- words and sounds ----------
V11UI.init.push(()=>{
  FIN_TXT.bisect=i=>'cut clean in half';FIN_LINE.bisect=n=>`Cut in half by ${n}`;
  FLAIR_TXT.tailsweep='a full turn that brings the tail round at the shins: anyone not set on his feet goes down. A miss leaves him with his back turned and the tail out.';
  FLAIR_TXT.tailwhip='a full turn that brings the tail round at the body, hard enough to throw a man back. A miss leaves him with his back turned and the tail out.';
  const sd=S.hooks.sound;S.hooks.sound=(k,v)=>{
    if(k!=='roar'&&k!=='tail'&&k!=='squeal'&&k!=='splat')return sd(k,v);
    if(!S.soundOn||!AC||AC.state!=='running')return;
    try{
      // the lizard-man: a low, ragged bellow
      if(k==='roar'){tone(1,'sawtooth',96,58,.16);tone(.9,'square',142,80,.05);nz(1.1,'lowpass',760,180,1.4,.38);setTimeout(()=>{try{nz(.6,'bandpass',420,260,3,.18);}catch(e){}},260);}
      // the tail coming round: a heavy rush of air
      else if(k==='tail'){nz(.42,'bandpass',380,1500,1.3,.34);tone(.34,'sine',110,52,.1);}
      // a goblin: a thin shriek
      else if(k==='squeal'){tone(.26,'sawtooth',880,1560,.045*(v||1));tone(.3,'square',1240,640,.025*(v||1));}
      // a body cut through
      else if(k==='splat'){nz(.28,'lowpass',1100,180,.8,.34);tone(.12,'triangle',180,70,.07);}
    }catch(e){}};});
// ===== BEASTS IN THE FIGHT: UI END =====
