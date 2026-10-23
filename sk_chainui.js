// ===== KILL CHAIN UI START =====
// The count badge in the corner of the stage, and the opening panel, preview and log tags for Kael's links.
const chainUI={seq:-1,n:0,live:false,bump:-1e9,endAt:-1e9,final:0};
// what a link gives, in the panel's words
function chainHintText(o){
  const k=o.link,hit=Math.min(k,CHAIN.hit),cut=Math.round(Math.min(k*CHAIN.tempo,CHAIN.tempoMax)*100);
  return`+${hit} to hit, ${cut}% less tempo, no balance spent`;}
function chainRRect(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
// top right of the stage, under the damage bill; holds the final count for a second after the run ends, then fades
function drawChainBadge(){
  const c=chainSt(),u=chainUI,now=performance.now();
  if(c.seq!==u.seq){
    if(c.live){if(c.n>u.n)u.bump=now;u.n=c.n;u.live=true;u.endAt=-1e9;}
    else{if(u.live){u.final=c.last;u.endAt=now;}u.live=false;u.n=0;}
    u.seq=c.seq;}
  let n=0,a=1;
  if(u.live&&u.n>=2)n=u.n;
  else if(!u.live&&u.final>=2){const dt=now-u.endAt;if(dt<1350){n=u.final;a=1-clamp((dt-1000)/350,0,1);}}
  if(!n||a<=0)return;
  const k0=cv.width/Math.max(1,cssW),k=k0*(cssW<520?.86:1),w=84*k,h=36*k,bill=$('bill'),hb=typeof hudBadgeAt==='function'?hudBadgeAt():null,
    x=cv.width-(hb?hb.right:10)*k0-w,y=(hb?hb.top:bill&&!bill.hidden?44:10)*k0;
  const sc=reduceMotion?1:1+.3*Math.max(0,1-(now-u.bump)/240);
  ctx.save();ctx.globalAlpha=a;ctx.translate(x+w/2,y+h/2);ctx.scale(sc,sc);ctx.translate(-w/2,-h/2);
  chainRRect(0,0,w,h,2*k);ctx.fillStyle='rgba(10,8,14,.86)';ctx.fill();ctx.lineWidth=1.4*k;ctx.strokeStyle='#e9c46e';ctx.stroke();
  ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.lineJoin='round';
  ctx.font=`800 ${11*k}px "Alegreya SC",Georgia,serif`;ctx.fillStyle='#b8ad94';ctx.fillText('FLOW',10*k,h/2+4*k);
  ctx.font=`800 ${24*k}px "Alegreya SC",Georgia,serif`;ctx.textAlign='right';ctx.lineWidth=4*k;ctx.strokeStyle='rgba(11,8,32,.9)';
  ctx.strokeText('×'+n,w-9*k,h/2+8.5*k);ctx.fillStyle='#f2cf86';ctx.fillText('×'+n,w-9*k,h/2+8.5*k);
  ctx.restore();}
V11UI.screen.push(drawChainBadge);
V11UI.init.push(()=>{
  // the opening panel: a chain link says so, and shows what it is worth
  const baseOpening=S.hooks.opening;
  S.hooks.opening=function(o){
    baseOpening.apply(this,arguments);
    const el=$('opening');if(el&&el.classList)el.classList.toggle('chain',!!(o&&o.link));
    if(!o||!o.link)return;
    $('opTitle').textContent=o.source==='broken'?`Broken · Flow ×${o.link}`:`Flow ×${o.link} · next in line`;
    $('opSub').textContent=`${o.f.name} vs ${o.opp.name}${isAI(o.f.idx)?' · deciding…':' · time slows, choose'}`;
    $('opHint').textContent=chainHintText(o);};
  // updateOrder rewrites the hint line on every refresh: keep the chain's line unless a choice is being hovered
  const baseOrder=updateOrder;
  updateOrder=function(){baseOrder.apply(this,arguments);const o=S.opening;if(o&&o.link&&(!previewCmd||cssW<520))$('opHint').textContent=chainHintText(o);};
  // a link spends no balance: the preview says so
  const basePreview=previewInfo;
  previewInfo=function(k){const r=basePreview.apply(this,arguments),o=S.opening;if(r&&o&&o.link&&k!=='hold'&&r.ft<0)r.ft=0;return r;};
  // the log tags a link with its place in the run
  const baseLog=S.hooks.log;
  S.hooks.log=function(e){
    baseLog.apply(this,arguments);
    const ex=e&&e.ex;if(!ex||!ex.link||!ex.li||!ex.li.querySelector)return;
    const tag=ex.li.querySelector('.lg-tag');if(tag)tag.textContent=`Flow ×${ex.link}`;};
});
// ===== KILL CHAIN UI END =====
