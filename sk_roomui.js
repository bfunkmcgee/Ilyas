// ===== ROOM UI =====
// (loaded ahead of the main UI script; what touches the page runs once the UI is up)
// The room (sk_room.js) as the player sees it: the moves the room offers each turn as commands of their own in a Room group (a tab of
// its own on a phone, lit when something is there; keys R and G), what each would do in the preview line, the enemies' room moves in
// their intents, guides in the picture to what the room offers while the hero chooses, and the events and moves in the log.

// ---------- names ----------
function rmName(m){return!m?'Room move':m.cmd==='hurl'?'Hurl':m.cmd==='pane'?'Through '+divThe(m.w):m.cmd==='flip'?'Flip the table':'Drop the lamp';}
function rmSub(m){return!m?'':m.cmd==='hurl'?`${m.D.name} into ${m.E.name}`:m.cmd==='pane'?`Put ${m.D.name} through`:m.cmd==='flip'?(m.on?`${m.D.name} off it`:`Onto ${m.D.name}`):`On ${m.D.name}`;}
// what it does, for the preview line
function rmText(A,m){const D=m.D,pct=Math.round(roomChance(A,m)*100);
  if(m.cmd==='hurl')return`Grab ${D.name} and hurl him into ${m.E.name}, just beyond him: on a hit both go down, ${D.name} hard. A throw without a hold, your build and balance against his (${pct}%). If he braces, you lose another pip of balance and 10 tempo.`;
  if(m.cmd==='pane')return`${D.name} has ${divThe(m.w)} at his back: put him through it. On a hit it bursts and he lands hard on the far side, +${DIV_MAT[m.w.mat].breach} damage (${pct}%). If he braces, you lose another pip of balance and 10 tempo.`;
  if(m.cmd==='flip'&&m.on)return`${D.name} is sprawled on the table: heave it over and throw him off it. On a hit he lands hard with the table on him and stays down (${pct}%). If he reads it, he rolls clear first. The table goes over either way.`;
  if(m.cmd==='flip')return`Heave the table over onto ${D.name}, across it: on a hit it comes down on him and puts him down (${pct}%). If he reads it, he steps clear. The table goes over either way.`;
  return`Cut the lamp down onto ${D.name}: on a hit it lands on him, 5 to 9 damage, a daze and two pips of his balance, and a crushing hit puts him down (${pct}%). If he reads it, it lands beside him. No balance spent.`;}

// ---------- the command panel ----------
{const cn=cmdName;cmdName=function(A,act){if(act==='room1'||act==='room2')return rmName(roomPick(A,act));return cn(A,act);};}
{const ci=cmdInfo0;cmdInfo0=function(A,D,k){if(k!=='room1'&&k!=='room2')return ci(A,D,k);const m=roomPick(A,k);
  if(!m)return{tq:'Nothing here',h:'',ok:false};const c=actionCost(A,k,moveCost(A,D,k));
  return{tq:rmSub(m),h:`${Math.round(roomChance(A,m)*100)}% · ${c} tempo`,ok:true,mark:'room'};};}
{const rt=roleText;roleText=function(A,D,k){if((k==='room1'||k==='room2')&&!S.opening){const m=roomPick(A,k);return m?rmText(A,m):'';}return rt(A,D,k);};}
// the enemies' plans: the move by name, over their heads and in the intents
{const il=intentLabel;intentLabel=function(f){const it=f.intent;if(it&&(it.cmd==='room1'||it.cmd==='room2')){const m=roomPick(f,it.cmd);return m?rmName(m)+(m.cmd==='hurl'?` ${m.D.name} into ${m.E.name}`:''):'Room move';}return il(f);};}
{const mi=moveIntent;moveIntent=function(f,V,cmd){if(cmd==='room1'||cmd==='room2'){const m=roomPick(f,cmd);return m?rmName(m)+' · '+rmSub(m):null;}return mi(f,V,cmd);};}
// the room's buttons go hidden when it offers nothing; on a phone the Room tab with them, lit while something is there and it is not open
{const uc=updateCommands;updateCommands=function(){uc.apply(this,arguments);try{roomDock();}catch(e){}};}
function roomDock(){
  const g=S.game,K=cmdHero(),play=!['over','transit','intro','finale','cut'].includes(g.phase);let n=0;
  for(const k of ['room1','room2']){const b=$('cmd-'+k);if(!b)continue;const on=play&&!K.dead&&!!roomPick(K,k);b.hidden=!on;if(on)n++;}
  const sec=document.querySelector&&document.querySelector('.cg[data-g="room"]');if(sec&&sec.hidden!==!n)sec.hidden=!n;
  const tab=$('tabRoom');if(!tab)return;tab.hidden=!n;const tabs=$('cmdTabs');if(tabs&&tabs.dataset){const v=String([...(tabs.children||[])].filter(b=>!b.hidden).length);if(tabs.dataset.n!==v)tabs.dataset.n=v;}
  const human=g.phase==='input'&&!isAI(g.active)&&!S.opening&&S.F[g.active]===K;
  if(tab.classList)tab.classList.toggle('live',!!n&&human&&typeof HUD!=='undefined'&&HUD.tab!=='room');
  if(!n&&typeof HUD!=='undefined'&&HUD.tab==='room')hudSetTab(HUD.userTab!=='room'?HUD.userTab:'strike');}
// the buttons themselves, made with the others' markup just before the dock sorts them into its groups
const ROOM_KEY={room1:'R',room2:'G'};
HUD_GROUPS.room=['room1','room2'];HUD_TABS.push('room');
{const hb=hudBuildDock;hudBuildDock=function(){
  for(const k of ['room1','room2']){if(CMD_ORDER.includes(k))continue;CMD_ORDER.push(k);CMD_KEY[k]=ROOM_KEY[k];
    const b=document.createElement('button');b.type='button';b.className='cmd room';b.id='cmd-'+k;b.hidden=true;
    b.innerHTML=`<span id="n-${k}">Room move</span><span class="ft" id="f-${k}"></span><span class="tq" id="t-${k}"></span><small id="h-${k}"></small><kbd class="ck" aria-hidden="true">${ROOM_KEY[k]}</kbd>`;
    b.addEventListener('click',()=>humanCommand(k));wirePreview(b,k);cmdBox.appendChild(b);}
  const r=hb.apply(this,arguments);
  const sec=document.querySelector&&document.querySelector('.cg[data-g="room"]');if(sec){sec.hidden=true;const t=sec.querySelector('.cg-t');if(t)t.textContent='Room';sec.setAttribute('aria-label','Room');}
  return r;};}

// ---------- the picture ----------
// while the hero chooses, a gold guide to each thing the room offers, with its name: the line of a hurl, the pane at a man's back,
// the table and where it would go, the lamp over a man. A hovered room move draws its guide brighter.
const RM_SHORT={hurl:'Hurl',pane:'Through',flip:'Flip',lamp:'Drop'};
function drawRoomGuides(){
  const g=S.game,K=cmdHero();if(g.phase!=='input'||S.opening||isAI(g.active)||S.F[g.active]!==K||K.dead)return;
  const ms=roomMoves(K);if(!ms.length)return;
  const t=performance.now()/1000,hov=previewCmd==='room1'||previewCmd==='room2'?roomPick(K,previewCmd):null,u=cam.viewW/Math.max(1,cssW),desk=typeof HUD!=='undefined'&&HUD.mode==='desk';
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  ms.forEach((m,i)=>{const hi=!!hov&&roomKey(hov)===roomKey(m),a=hi?1:.72+.18*Math.sin(t*3),D=m.D;
    // a path stroked twice: dark under it, then gold, its dashes running toward where it goes
    const line=(path,dash)=>{ctx.setLineDash(dash?[7*u,5*u]:[]);ctx.lineDashOffset=-t*18*u;ctx.strokeStyle='rgba(10,6,12,.55)';ctx.lineWidth=(hi?5.5:4.5)*u;path();ctx.stroke();
      ctx.strokeStyle=`rgba(244,212,142,${a})`;ctx.lineWidth=(hi?3:2.2)*u;path();ctx.stroke();ctx.setLineDash([]);};
    const head=(x0,y0,x1,y1)=>{const s=(hi?11:9)*u,an=Math.atan2(y1-y0,x1-x0);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x1-Math.cos(an-.5)*s,y1-Math.sin(an-.5)*s);ctx.lineTo(x1-Math.cos(an+.5)*s,y1-Math.sin(an+.5)*s);ctx.closePath();
      ctx.fillStyle='rgba(10,6,12,.55)';ctx.lineWidth=2*u;ctx.strokeStyle='rgba(10,6,12,.55)';ctx.stroke();ctx.fillStyle=`rgba(244,212,142,${a})`;ctx.fill();};
    const tag=(x,y)=>{const txt=(desk?(i?'G':'R')+' · ':'')+RM_SHORT[m.cmd];ctx.font=`700 ${12*u}px "Barlow Semi Condensed","Arial Narrow",sans-serif`;ctx.textAlign='center';ctx.textBaseline='bottom';
      ctx.lineWidth=3.5*u;ctx.strokeStyle='rgba(10,6,12,.85)';ctx.strokeText(txt.toUpperCase(),x,y);ctx.fillStyle=`rgba(244,212,142,${Math.min(1,a+.1)})`;ctx.fillText(txt.toUpperCase(),x,y);};
    if(m.cmd==='hurl'){const E=m.E,mid=f=>P(lerp(f.p[PEL].x,f.p[CHE].x,.5),lerp(f.p[PEL].y,f.p[CHE].y,.5),f.dep),p=mid(D),q=mid(E),mx=(p.x+q.x)/2,my=Math.min(p.y,q.y)-18;
      line(()=>{ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.quadraticCurveTo(mx,my,q.x,q.y);},true);head(mx,my,q.x,q.y);tag(mx,(p.y+q.y)/2-12-6*u);}
    else if(m.cmd==='pane'){const w=m.w,x=m.dir>0?divL(w):divR(w),z=clamp(D.dep,w.d0+4,w.d1-4),gy=S.arena.ground(x,z),a0=P(x,gy-8,z),a1=P(x,gy-w.h*.9,z),pc=P(D.p[CHE].x,D.p[CHE].y,D.dep),mid={x:(a0.x+a1.x)/2+m.dir*18,y:(a0.y+a1.y)/2};
      line(()=>{ctx.beginPath();ctx.moveTo(a0.x,a0.y);ctx.lineTo(a1.x,a1.y);},false);line(()=>{ctx.beginPath();ctx.moveTo(pc.x,pc.y);ctx.lineTo(mid.x,mid.y);},true);head(pc.x,pc.y,mid.x,mid.y);tag(a1.x,a1.y-4*u);}
    else if(m.cmd==='flip'&&tableIntact()){const b=tableBox(),T=S.table,p0=P(b.l,b.t,T.dep),p1=P(b.r,b.t,T.dep),c=P(b.cx,b.t-34,T.dep),q=m.on?P(b.cx+m.dir*80,b.t+6,T.dep):P(D.p[CHE].x,D.p[CHE].y,D.dep);
      line(()=>{ctx.beginPath();ctx.moveTo(p0.x,p0.y-3*u);ctx.lineTo(p1.x,p1.y-3*u);},false);
      line(()=>{ctx.beginPath();ctx.moveTo(c.x-m.dir*30*u,c.y+14*u);ctx.quadraticCurveTo(c.x,c.y-12*u,q.x,q.y-10*u);},true);head(c.x,c.y-12*u,q.x,q.y-10*u);tag(c.x,c.y-14*u);}
    else if(m.cmd==='lamp'){const L=m.L,pl=P(L.p.x,L.p.y,L.dep),h=P(D.p[HEAD].x,D.p[HEAD].y-D.body.headR,D.dep);
      line(()=>{ctx.beginPath();ctx.arc(pl.x,pl.y,L.r+7*u,0,TAU);},false);line(()=>{ctx.beginPath();ctx.moveTo(pl.x,pl.y+L.r+8*u);ctx.lineTo(h.x,h.y-6*u);},true);head(pl.x,pl.y+L.r+8*u,h.x,h.y-6*u);
      ctx.save();ctx.translate(pl.x+L.r+12*u+16*u,pl.y+4*u);tag(0,0);ctx.restore();}});
  ctx.restore();}
V11UI.world.push(drawRoomGuides);
// the big callouts (the room's events, Flow, the finishers) stay under the top bar: over a man whose head is near the top of the
// picture they come down to where they show, and two that would meet sit one under the other
function roomCalloutsDown(){const u=cam.viewW/Math.max(1,cssW),top=camTop()+((typeof HUD_IN!=='undefined'?HUD_IN.top:0)+40)*u,placed=[];
  for(const c of S.callouts){if(!c.room&&!c.big)continue;if(c.dy0==null)c.dy0=c.dy||0;const f=S.F[c.i];if(!f||c.age>=c.life)continue;
    const h=f.p[HEAD],q=P(h.x+(c.dx||0),h.y-f.body.headR-34+c.dy0,f.dep),hw=c.text.length*7+6;let dy=c.dy0+Math.max(0,top-q.y),y=q.y+dy-c.dy0;
    for(let n=0;n<4;n++){const o=placed.find(p=>Math.abs(p.x-q.x)<p.hw+hw&&Math.abs(p.y-y)<26);if(!o)break;const d=o.y+28-y;dy+=d;y+=d;}
    c.dy=dy;placed.push({x:q.x,y,hw});}}
{const dc=drawCallouts;drawCallouts=function(){try{roomCalloutsDown();}catch(e){}return dc.apply(this,arguments);};}
// on a desktop the room's moves sit with the tactics (a group of their own would squeeze the others); on a phone they have their tab
function roomPlaceButtons(mode){if(!document.querySelector)return;const grid=document.querySelector(`.cg[data-g="${mode==='desk'?'guard':'room'}"] .cg-grid`);if(!grid)return;
  for(const k of ['room1','room2']){const b=$('cmd-'+k);if(b&&b.parentNode!==grid)grid.appendChild(b);}}
{const am=hudApplyMode;hudApplyMode=function(m){am.apply(this,arguments);try{if(HUD.built)roomPlaceButtons(m);}catch(e){}};}

// ---------- the log ----------
const ROOM_VERB={hurl:'hurls',pane:'puts',flip:'heaves the table over onto',lamp:'brings the lamp down on'};
function roomLogLine(e){const nm=f=>f?f.name+(f.dead?"'s body":''):'A body',O=e.o||e.at;
  if(e.kind==='body')return e.down?`${nm(e.f)} bowls over ${O.name}`:`${nm(e.f)} knocks ${O.name} back: two pips of his balance`;
  if(e.kind==='pane')return`${nm(e.f)} bursts through ${divThe(e.w)}`;
  if(e.kind==='lamp')return e.hit?`The lamp comes down on ${O.name}${e.dmg?': '+e.dmg:''}`:`${nm(e.f)} brings a lamp down`;
  if(e.kind==='table')return e.broke?`${nm(e.f)} comes down through the table`:`${nm(e.f)} sends the table over`;
  return e.text;}
V11UI.init.push(()=>{
  const base=S.hooks.log;
  S.hooks.log=e=>{if(e.type!=='room')return base(e);
    const r=e.res,m=e.m,li=newEntry(false);
    const what=m.cmd==='hurl'?`${who(m.D)}<span>into</span>${who(m.E)}`:m.cmd==='pane'?`${who(m.D)}<span>through ${divThe(m.w)}</span>`:m.cmd==='flip'&&m.on?`${who(m.D)}<span>on it</span>`:who(m.D);
    li.innerHTML=`<div class="lg-l"><span class="lg-tag lg-room">Room</span>${who(e.A)}<span>${m.cmd==='flip'&&m.on?'flips the table with':ROOM_VERB[m.cmd]}</span>${what}<span class="out out-crit pending">${rmName(m)}</span></div>
      <div class="lg-roll">d20 <b>${r.roll}</b> ${modsText(r.mods)} = <b>${r.total}</b> vs ${r.dc}${defNote(r.defMods)}${r.crush?' · crushing':''}</div><div class="lg-perf">performing…</div>`;
    e.ex.li=li;pushEntry(li);};
  S.hooks.roomDone=(ex,i)=>{if(!ex||!ex.li)return;const o=ex.li.querySelector('.out'),pf=ex.li.querySelector('.lg-perf'),m=ex.room;if(!o||!m)return;
    o.classList.remove('pending');o.className='out '+(i.ok?'out-crit':'out-dodge');
    if(i.label)o.textContent=i.label+(i.dmg?' '+i.dmg:'');
    const A=ex.A,D=m.D;let t;
    if(!i.ok)t=m.cmd==='flip'?(m.on?`${D.name} rolled clear · the table is over`:`${D.name} read it and stepped clear · the table is over`):m.cmd==='lamp'?`${D.name} read it: the lamp landed beside him`:`${D.name} braced · ${A.name} loses a pip of balance and 10 tempo`;
    else t=m.cmd==='hurl'?`${D.name} landed on ${m.E.name}: both down`:m.cmd==='pane'?`through ${divThe(m.w)} and down on the far side`:m.cmd==='flip'?(m.on?`${D.name} thrown off with the table on him: down until his next turn`:`the table came down on ${D.name}: down until his next turn`)
      :`${D.name} dazed, two pips of his balance${D.downed?', and down':''}`;
    if(pf)pf.textContent=t;};
  // an event: a line under the exchange it happened in (a room move's own event is its line already); one between exchanges stands alone
  S.hooks.roomEvent=e=>{const ex=S.game.ex;if(ex&&ex.room&&(e.by===ex.A)&&(e.f===ex.D||e.at===ex.D||e.at===ex.room.E))return;
    const line=roomLogLine(e);
    if(ex&&ex.li){const d=document.createElement('div');d.className='lg-read lg-event'+(e.quiet?' quiet':'');d.textContent=line;ex.li.appendChild(d);return;}
    const li=newEntry(false);li.innerHTML=`<div class="lg-l"><span class="lg-tag lg-room">${e.quiet?'Room':'Event'}</span><span>${line}</span></div>`;pushEntry(li);};
  // keys: R and G for the room's two moves
  document.addEventListener('keydown',e=>{if(typingIn(e.target)||e.ctrlKey||e.metaKey||e.altKey||S.opening)return;const k=e.key&&e.key.toLowerCase();
    if(k==='r'||k==='g'){humanCommand(k==='r'?'room1':'room2');e.preventDefault();}});
});
// ===== ROOM UI END =====
