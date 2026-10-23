// ===== CREW UI =====
// (loaded ahead of the main UI script; everything here runs only once the UI is up)
// ---------- the look: no scarf, a plain suit ----------
const SUIT={shirt:'#e4e1d6',tie:'#7a2d40'};
// a pale shirt collar open at the throat and a dark tie hanging down the chest, drawn over the silhouette
function drawSuit(f){
  if(!f.hench)return;
  const p=f.p,b=f.body,fa=f.facing,C=p[CHE],P=p[PEL],dx=C.x-P.x,dy=C.y-P.y,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,fx=-uy*fa,fy=ux*fa,w=b.torsoW;
  const at=(a,s)=>({x:C.x+ux*a+fx*s,y:C.y+uy*a+fy*s});
  ctx.save();ctx.globalAlpha=f.dead?.5:1;ctx.lineCap='round';ctx.lineJoin='round';
  const t0=at(w*.62,w*.02),t1=at(w*.5,w*.56),ap=at(-w*.42,w*.3);
  ctx.fillStyle=SUIT.shirt;ctx.beginPath();ctx.moveTo(t0.x,t0.y);ctx.lineTo(t1.x,t1.y);ctx.lineTo(ap.x,ap.y);ctx.closePath();ctx.fill();
  const k=at(w*.12,w*.3),e=at(-w*1.05,w*.32);
  ctx.strokeStyle=SUIT.tie;ctx.lineWidth=Math.max(2,w*.2);ctx.beginPath();ctx.moveTo(k.x,k.y);ctx.lineTo(e.x,e.y);ctx.stroke();
  ctx.restore();
}

// ---------- the doors ----------
// the kitchen's back door folds open as a henchman comes in, over the closed one painted into the room
function drawCrewBackDoor(){
  const o=crewDoorOpen('kitchen');if(o<.01)return;
  const far=KITCHEN.far,yB=prjY(GB,far),x0=694+far*PSX,x1=x0+62,top=yB-138,w=62*Math.cos(o*1.28),grow=o*10;
  const g=ctx.createLinearGradient(0,top,0,yB);g.addColorStop(0,'#070b16');g.addColorStop(.7,'#121c30');g.addColorStop(1,'#26344c');
  ctx.fillStyle=g;ctx.fillRect(x0,top,x1-x0,yB-top);
  if(w>1.5){const free=x0+w,fy0=top-grow,fy1=yB+grow*.6;
    const lg=ctx.createLinearGradient(x0,0,free,0);lg.addColorStop(0,'#3a2618');lg.addColorStop(1,'#2a1a10');
    ctx.fillStyle=lg;ctx.beginPath();ctx.moveTo(x0,top);ctx.lineTo(free,fy0);ctx.lineTo(free,fy1);ctx.lineTo(x0,yB);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1;ctx.beginPath();for(let k=1;k<4;k++){const x=lerp(x0,free,k/4);ctx.moveTo(x,lerp(top,fy0,k/4));ctx.lineTo(x,lerp(yB,fy1,k/4));}ctx.stroke();
    ctx.fillStyle='#2a2f34';for(const u of [.2,.75]){const y0=lerp(top,yB,u),yf=lerp(fy0,fy1,u);ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(free,yf);ctx.lineTo(free,yf+5);ctx.lineTo(x0,y0+5);ctx.closePath();ctx.fill();}
    ctx.fillStyle='#c9a25a';ctx.beginPath();ctx.arc(free-3,lerp(fy0,fy1,.565),2.4,0,TAU);ctx.fill();}
}

// ---------- the status panel ----------
const CREW_NUM=['none','one','two','three','four','five','six'];
function crewNote(n){return crewOn()?`Leads ${CREW_NUM[n]} henchmen. They come in as others fall.`:null;}
// the fallen collapse into one line, and one line says how many are still to come
function crewRows(){return crewOn()?'<div class="frow crew-sum" id="crewDown" data-team="1" hidden></div><div class="frow crew-sum" id="crewLeft" data-team="1" hidden></div>':'';}
function crewStatus(){
  const on=crewOn();for(const id of ['targets','frows'])$(id).classList.toggle('crew',on);
  if(!on)return;const d=$('crewDown'),l=$('crewLeft');if(!d||!l)return;
  const down=crewDown(),left=crewLeft();
  d.hidden=!down;d.textContent=`${down} ${down===1?'henchman':'henchmen'} down`;
  l.hidden=!left;l.textContent=`${left} still to come`;
}

V11UI.init.push(()=>{
  // the arrival in the log
  const log=S.hooks.log;
  S.hooks.log=e=>{
    if(e.type==='crew'){const li=newEntry(false);li.innerHTML=`<div class="lg-l">${who(e.f)}<span>comes in ${e.how}</span><span class="out out-move">Crew</span></div><div class="lg-perf">${e.left?e.left+' still to come':'the last of them'}</div>`;pushEntry(li);return;}
    log(e);};
  // a new body in the roster needs its row
  S.hooks.crew=()=>{buildRows();updateStatus();};
  // the doors: the dining room's kitchen door already swings for the walk through, so it learns to swing for a henchman too
  const open=diningDoorOpen;diningDoorOpen=()=>Math.max(open(),crewDoorOpen('dining'));
  const live=drawKitchenLive;drawKitchenLive=()=>{live();drawCrewBackDoor();};
});
// ===== CREW UI END =====
