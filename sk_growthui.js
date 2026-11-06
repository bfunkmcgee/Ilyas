// ==================== LEVELS AND GROWTH ON THE PAGE (since V93) ====================
// His level on his plate in the story (after his name), the drawer's head with his level and the XP to the next, each style's level
// on its card (styleLine: the styles screen and the Pit menu's Styles, sk_pit9ui.js), and the level on the title's line for a kept
// night. What he gains is in the log (logNote) and a level comes up over him (popup), from the game's side (sk_growth.js).
// the drawer's line: "Level 7 · 52 of 288 XP to the next" (at the top: "the most there is")
function growthLineText(xp){const L=levelOf(xp);return'Level '+L+' · '+(L>=GROWTH.max?'the most there is':(xp-XP_AT[L])+' of '+xpNeed(L)+' XP to the next');}
// a style's card line: its level, its rank, and its XP to the next
function styleLine(k){const L=styleLevel(k),g=growth(),xp=g&&g.styles&&g.styles[k]!=null?g.styles[k]:STYLE_XP_AT[STYLE_GROWTH.start[k]||1];
  // (in the lab, where nothing grows, the level alone)
  const next=!g?'':L>=STYLE_GROWTH.max?'the most there is':(xp-STYLE_XP_AT[L])+' of '+styleNeed(L)+' to the next';
  return'<p class="a9-lv"><b>Level '+L+'</b> · '+styleRank(L)+(next?' · '+next:'')+'</p>';}
// his plate: the level after his name (the plate as it was in the lab)
function growthPlate(){const K=hero(),fr=K&&document.getElementById('fr'+K.idx),nm=fr&&fr.querySelector('.fname');if(!nm||!nm.dataset)return;
  const L=growthOn()?heroLevel():null,key=L==null?'':String(L);if((nm.dataset.lv||'')===key)return;nm.dataset.lv=key;
  nm.innerHTML=L==null?K.name:K.name+'<i class="flv" title="Level '+L+'">Lv '+L+'</i>';}
function growthLineSync(){const l=document.getElementById('growthLine');if(!l)return;const g=growth(),v=g?growthLineText(g.xp):'';
  if(l.textContent!==v)l.textContent=v;if(l.hidden!==!v)l.hidden=!v;}
{const br=buildRows;buildRows=function(){const r=br.apply(this,arguments);growthPlate();return r;};}
{const us=updateStatus;updateStatus=function(){const r=us.apply(this,arguments);growthPlate();return r;};}
{const ds=hudDrawerSync;hudDrawerSync=function(){const r=ds.apply(this,arguments);growthLineSync();return r;};}
V11UI.init.push(()=>{const side=document.getElementById('sideCol'),box=side&&side.querySelector&&side.querySelector('.drawer-titles');if(!box||!box.appendChild)return;
  const l=document.createElement('span');l.className='drawer-sub growth-line';l.id='growthLine';l.hidden=true;box.appendChild(l);});
{const gh=S.hooks.growth;S.hooks.growth=(k,d)=>{if(gh)gh(k,d);growthPlate();growthLineSync();};}
// the title: the level of the night kept, after where it stands
function growthKeptLevel(h){const g=h&&h.o&&h.o.cp&&h.o.cp.parts&&growthFrom(h.o.cp.parts.growth);return g?levelOf(g.xp):null;}
{const ms=saveMenuSync;saveMenuSync=function(){const r=ms.apply(this,arguments);const at=document.getElementById('stSaved');if(!at||at.hidden)return r;
  const L=growthKeptLevel(saveHeld());if(L==null)return r;const t=' · Level '+L,s=at.textContent||'';at.textContent=s.endsWith('.')?s.slice(0,-1)+t+'.':s+t;return r;};}
