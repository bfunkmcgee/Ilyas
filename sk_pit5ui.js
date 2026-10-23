// ===== ACT I, SCENE 5 UI =====
// (loaded ahead of the main UI script; everything here runs only once the UI is up)
// Scene 5 on the page: the Pit map (the four tiers, the routes and the closed ladders, the landmarks, a waypoint for each thing on
// Tamm's list, and where he is), the stall's shop screen with the satchel and the purse beside it, the satchel on its own (what rides
// in it and what rides in his hand), and the buttons that open them while he walks about. The buttons call the game's own
// act1MapClose, act1ShopBuy, act1ShopClose, errandToHand and errandToBag.

const A1M={};
// ---------- the Pit map ----------
// A section through the Pit, drawn once as a picture: the walls, the Floor with the Sump and Tarr's pumphouse, the stair-streets
// switchbacking up the left wall to the Shelf, the ladders (closed: two hands), the spike high on the right wall, the Rim and the
// tower's foot at the top. The route he takes is traced in gold; the list's waypoints sit on the Shelf's stalls; a marker shows him.
const PITMAP={sump:[150,352],gate:[214,352],pump:[404,352],spike:[528,170],stairs:[[214,352],[96,318],[196,286],[90,252],[180,218],[118,196]],
  shelf:[[84,196],[440,196]],stalls:{oil:[136,188],grain:[180,188],linen:[224,188],nim:[268,188],grind:[312,188]},
  ladders:[{at:[340,352,340,200],name:'Ladder'},{at:[140,196,140,62],name:'Ladder'},{at:[500,352,500,250],name:'Ladder'}],rim:[[40,60],[560,60]],tower:[[300,60],[330,0],[370,0],[400,60]]};
const PITMAP_AT={list:'yard',stairsup:'stairs',shelf:'shelf',stairsdown:'stairs'};
function a1MapSvg(atK){const P=PITMAP,pt=a=>a.join(','),A=S.act1,E=A&&A.errand,at=atK||PITMAP_AT[S.story&&S.story.key]||'yard';
  const here=at==='yard'?P.sump:at==='shelf'?[230,196]:[150,270];
  const stalls=Object.entries(P.stalls).map(([id,[x,y]])=>{const st=STALLS[id],need=st.goods.some(g=>GOODS[g.id].list&&!(E&&E.got[GOODS[g.id].list]));
    return`<g class="a1m-wp${need?' need':''}"><circle cx="${x}" cy="${y}" r="5"/><text x="${x}" y="${y-10}" text-anchor="middle">${{oil:'Oil',grain:'Rice, salt',linen:'Linen',nim:'Valve',grind:'Salves'}[id]}</text></g>`;}).join('');
  const lad=P.ladders.map(L=>{const [x0,y0,x1,y1]=L.at,mx=(x0+x1)/2,my=(y0+y1)/2;return`<g class="a1m-lad"><line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}"/>`+
    `<circle cx="${mx}" cy="${my}" r="9"/><line class="x" x1="${mx-6}" y1="${my-6}" x2="${mx+6}" y2="${my+6}"/></g>`;}).join('');
  return`<svg class="a1m-svg" viewBox="0 0 600 380" role="img" aria-label="The Pit: the Floor, the stair-streets, the Shelf market and the Rim">`+
    // the walls of the Pit, and the sky above the Rim
    `<rect x="0" y="0" width="600" height="380" fill="#0b0a0d"/><path class="a1m-wall" d="M0 0 L40 0 L40 60 L64 120 L56 196 L76 260 L60 352 L0 380 Z"/>`+
    `<path class="a1m-wall" d="M600 0 L560 0 L560 60 L540 130 L552 210 L536 290 L548 352 L600 380 Z"/>`+
    // the tiers
    `<line class="a1m-tier" x1="40" y1="60" x2="560" y2="60"/><line class="a1m-tier" x1="56" y1="196" x2="372" y2="196"/><line class="a1m-tier" x1="60" y1="352" x2="548" y2="352"/>`+
    `<text class="a1m-tname" x="552" y="52" text-anchor="end">THE RIM</text><text class="a1m-tname" x="440" y="214" text-anchor="end">THE SHELF</text>`+
    `<text class="a1m-tname" x="226" y="300">STAIR-STREETS</text><text class="a1m-tname" x="540" y="372" text-anchor="end">THE FLOOR</text>`+
    // the tower's foot on the Rim
    `<path class="a1m-tower" d="M${P.tower.map(pt).join(' L')} Z"/><text class="a1m-lm" x="350" y="80" text-anchor="middle">The tower’s foot</text>`+
    // the ladders, closed to a man with one hand
    lad+`<text class="a1m-note" x="352" y="282">Ladders: two hands</text>`+
    // the stair-streets and the Shelf
    `<polyline class="a1m-stairs" points="${P.stairs.map(pt).join(' ')}"/><line class="a1m-shelf" x1="${P.shelf[0][0]}" y1="${P.shelf[0][1]}" x2="${P.shelf[1][0]}" y2="${P.shelf[1][1]}"/>`+
    // the route: out the gate, up the switchbacks, along the Shelf
    `<polyline class="a1m-route" points="${pt(P.sump)} ${P.stairs.map(pt).join(' ')} ${pt([230,196])}"/>`+
    // the landmarks
    `<g class="a1m-sump"><rect x="${P.sump[0]-20}" y="${P.sump[1]-22}" width="40" height="22"/><path d="M${P.sump[0]-24} ${P.sump[1]-22} L${P.sump[0]} ${P.sump[1]-36} L${P.sump[0]+24} ${P.sump[1]-22} Z"/></g>`+
    `<text class="a1m-lm" x="${P.sump[0]}" y="${P.sump[1]+14}" text-anchor="middle">The Sump</text>`+
    `<g class="a1m-pump"><rect x="${P.pump[0]-26}" y="${P.pump[1]-30}" width="52" height="30"/><line x1="${P.pump[0]+26}" y1="${P.pump[1]-18}" x2="${P.pump[0]+70}" y2="${P.pump[1]-18}"/></g>`+
    `<text class="a1m-lm" x="${P.pump[0]}" y="${P.pump[1]-38}" text-anchor="middle">Tarr’s pumphouse</text>`+
    `<g class="a1m-spike"><path d="M${P.spike[0]+12} ${P.spike[1]-6} L${P.spike[0]-26} ${P.spike[1]} L${P.spike[0]+12} ${P.spike[1]+6} Z"/></g><text class="a1m-lm" x="${P.spike[0]-6}" y="${P.spike[1]+22}" text-anchor="middle">The spike</text>`+
    stalls+
    // where he is
    `<g class="a1m-you"><circle cx="${here[0]+30}" cy="${here[1]-8}" r="6"/><text x="${here[0]+40}" y="${here[1]-14}">You</text></g></svg>`;}
V11UI.init.push(()=>{const W=storyStageWrap();if(!W)return;
  const m=stEl('div','a1-panel a1-map');m.id='a1Map';m.hidden=true;m.setAttribute('role','dialog');m.setAttribute('aria-label','The Pit map');
  m.innerHTML='<div class="a1-panel-in"><p class="st-kick">The Pit</p><div class="a1-map-pic" id="a1MapPic"></div>'+
    '<p class="a1-map-tip" id="a1MapTip">The way to the Shelf is the stair-streets. The ladders are shorter and need two hands.</p>'+
    '<div class="st-btns"><button type="button" class="st-btn st-go" id="a1MapDone">Close the map</button></div></div>';
  W.appendChild(m);A1M.map=m;m.querySelector('#a1MapDone').addEventListener('click',()=>act1MapClose());
  // the shop, and the satchel on its own
  const s=stEl('div','a1-panel a1-shop');s.id='a1Shop';s.hidden=true;s.setAttribute('role','dialog');s.setAttribute('aria-label','A stall on the Shelf');
  s.innerHTML='<div class="a1-panel-in"><p class="st-kick" id="a1ShopK"></p><h2 class="a1-panel-t" id="a1ShopT"></h2><div class="a1-shop-body"><ul class="a1-goods" id="a1Goods"></ul>'+
    '<div class="a1-bagbox"><p class="a1-purse" id="a1Purse"></p><div class="a1-bag" id="a1Bag"></div><p class="a1-wt" id="a1Wt"></p><div class="a1-handrow" id="a1HandRow"></div></div></div>'+
    '<p class="a1-shop-note" id="a1ShopNote" aria-live="polite"></p><div class="st-btns"><button type="button" class="st-btn st-go" id="a1ShopDone">Done</button></div></div>';
  W.appendChild(s);A1M.shop=s;
  s.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.id==='a1ShopDone'){if(S.act1&&S.act1.shop&&S.act1.shop.open)act1ShopClose();else A1M.bagOnly=false;a1ShopFill();return;}
    if(b.dataset.buy){act1ShopBuy(b.dataset.buy,b.dataset.pay);a1ShopFill();return;}
    if(b.dataset.tohand!=null){const why=errandToHand(+b.dataset.tohand);a1Note(why);a1ShopFill();return;}
    if(b.dataset.tobag!=null){const why=errandToBag();a1Note(why);a1ShopFill();return;}});
  // the buttons over the picture while he walks about: the map, and the satchel
  const mb=stEl('button','ex-side','Map');mb.type='button';mb.id='a1MapBtn';mb.hidden=true;W.appendChild(mb);A1M.mapBtn=mb;mb.addEventListener('click',()=>{if(exOn()&&!S.cut)act1MapOpen();});
  const bb=stEl('button','ex-side ex-side2','Satchel');bb.type='button';bb.id='a1BagBtn';bb.hidden=true;W.appendChild(bb);A1M.bagBtn=bb;bb.addEventListener('click',()=>{if(exOn()&&!S.cut){A1M.bagOnly=true;a1ShopFill();}});});
function a1Note(t){A1M.note=t?{text:t,t0:S.t}:null;}
// the shop's goods, the purse, the satchel's grid and his hand (or the satchel alone)
function a1ShopFill(){const s=A1M.shop;if(!s)return;const A=S.act1,Sh=A&&A.shop&&A.shop.open?A.shop:null,E=A&&A.errand;if(!E)return;
  const only=!Sh&&A1M.bagOnly;s.classList.toggle('a1-bagonly',only);
  if(Sh){const St=STALLS[Sh.stall],R=ACT1_PLACES.shelf.stalls.find(x=>x.id===Sh.stall);$('a1ShopK').textContent=St.keeper;$('a1ShopT').textContent=R?R.name:'';
    $('a1Goods').innerHTML=St.goods.map(g=>{const G=GOODS[g.id],pr=goodPrice(Sh.stall,g),got=G.list?E.got[G.list]:g.id==='whet'?E.sharp:false,onList=!!G.list;
      const btn=(pay,n)=>n==null?'':`<button type="button" class="a1-buy" data-buy="${g.id}" data-pay="${pay}"${got&&g.id!=='salve'?' disabled':''}>${n} ${pay==='chit'?(n===1?'chit':'chits'):'coin'}</button>`;
      return`<li class="a1-good${got?' got':''}"><span class="a1-good-n">${G.name}${onList?'<span class="a1-onlist">'+(got?'Got':'On the list')+'</span>':''}</span>`+
        `<span class="a1-good-w">${g.what||''}</span><span class="a1-good-b">${btn('coin',pr.coin)}${btn('chit',pr.chit)}</span></li>`;}).join('');}
  else{$('a1ShopK').textContent='Satchel';$('a1ShopT').textContent='What he carries';$('a1Goods').innerHTML='';}
  $('a1Purse').textContent=`Coin ${E.coin} · Chits ${E.chits}`;
  // the grid: each good as a block over the cells it takes; a good is tapped to go into his hand
  const G=satchelGrid(E.bag)||{items:[]},C=SATCHEL.cols;
  $('a1Bag').innerHTML=Array.from({length:SATCHEL.cols*SATCHEL.rows},(_,i)=>`<span class="a1-cell" style="grid-column:${i%C+1};grid-row:${Math.floor(i/C)+1}"></span>`).join('')+
    G.items.map(it=>`<button type="button" class="a1-item" data-tohand="${it.i}" style="grid-column:${it.cell%C+1}/span ${it.n};grid-row:${Math.floor(it.cell/C)+1}" title="Carry in hand">${GOODS[it.id].name}</button>`).join('');
  $('a1Wt').textContent=`Weight ${satchelWeight(E.bag)} of ${SATCHEL.wt}`;
  $('a1HandRow').innerHTML=E.hand?`<span class="a1-hand-k">Hand</span><span class="a1-hand-v">${GOODS[E.hand].name}</span><button type="button" class="a1-buy" data-tobag="1">Into the satchel</button>`
    :'<span class="a1-hand-k">Hand</span><span class="a1-hand-v a1-free">Free</span>';
  const N=Sh&&Sh.note&&S.t-Sh.note.t0<3?Sh.note:A1M.note&&S.t-A1M.note.t0<3?A1M.note:null;$('a1ShopNote').textContent=N?N.text:'';}
V11UI.tick.push(()=>{if(!A1M.map)return;const A=S.act1,on1=act1On();
  // the map
  const mo=!!(on1&&A&&A.map&&A.map.open);if(A1M.map.hidden===mo){A1M.map.hidden=!mo;if(mo){$('a1MapPic').innerHTML=a1MapSvg();$('a1MapTip').hidden=!A.map.tutor;}}
  // the shop (or the satchel alone)
  const so=!!(on1&&A&&((A.shop&&A.shop.open)||A1M.bagOnly&&exOn()));if(!so&&A1M.bagOnly&&!exOn())A1M.bagOnly=false;
  if(A1M.shop.hidden===so){A1M.shop.hidden=!so;if(so)a1ShopFill();}else if(so&&A.shop&&A.shop.note&&A1M.lastNote!==A.shop.note){A1M.lastNote=A.shop.note;a1ShopFill();}
  // while a screen is up, the walking-about controls under it are put away (the screen has its own)
  const W=A1M.map.parentNode,modal=mo||so;if(W&&W.classList&&A1M.modal!==modal){A1M.modal=modal;W.classList.toggle('a1-modal',modal);}
  // the buttons: while he walks about in a stage that has the map, and once he has the satchel
  const E=S.ex,ex=exOn()&&!S.card&&!S.cut&&!S.say,sp=act1Stage(),mapOK=ex&&!!sp&&!!PITMAP_AT[sp.key],bagOK=ex&&!!(A&&A.satchel||A&&A.errand&&(A.errand.bag.length||A.errand.hand));
  if(A1M.mapBtn.hidden===mapOK)A1M.mapBtn.hidden=!mapOK;if(A1M.bagBtn.hidden===bagOK)A1M.bagBtn.hidden=!bagOK;void E;});

// ---------- what he carries, drawn ----------
// The satchel slung across him (once Tamm has given it), and a good in his hand: the rice sack heavy at the end of his arm.
{const ei=envItems;envItems=function(items){ei(items);const A=S.act1;if(!A||!act1On())return;const K=hero();if(!K)return;
  if(A.satchel||A.errand&&A.errand.bag.length)items.push({d:K.dep-.45,a1g:'satchel'});
  const H=S.ex&&S.ex.hand;if(H&&H.good)items.push({d:K.dep-.5,a1g:'held',id:H.id});};}
{const de=drawEnvItem;drawEnvItem=function(it){if(!it.a1g)return de(it);ctx.save();try{A1G_DRAW[it.a1g](it);}catch(e){}ctx.restore();return true;};}
const A1G_DRAW={
  satchel(){const K=hero(),p=K.p,fa=K.facing,c=p[CHE],pl=p[PEL],q=P(pl.x-fa*4,pl.y-4,K.dep),sh=P(c.x-fa*2,c.y+2,K.dep);
    // the strap from the shoulder down across him, the bag at his hip behind
    ctx.strokeStyle='#4a3b28';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(sh.x,sh.y);ctx.lineTo(q.x+fa*3,q.y-6);ctx.stroke();
    ctx.fillStyle='#5a4a32';ctx.beginPath();ctx.moveTo(q.x-fa*10,q.y-8);ctx.lineTo(q.x+fa*4,q.y-8);ctx.lineTo(q.x+fa*5,q.y+8);ctx.quadraticCurveTo(q.x-fa*3,q.y+11,q.x-fa*11,q.y+7);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.5)';ctx.lineWidth=.8;ctx.stroke();ctx.fillStyle='#4a3b28';ctx.fillRect(Math.min(q.x-fa*10,q.x+fa*4),q.y-8,14,4);},
  held(it){const K=hero(),h=K.p[HAF],q=P(h.x,h.y,K.dep),id=it.id;
    if(id==='rice'){ctx.fillStyle='#b8a47a';ctx.beginPath();ctx.moveTo(q.x-6,q.y+1);ctx.quadraticCurveTo(q.x-9,q.y+14,q.x-5,q.y+22);ctx.lineTo(q.x+6,q.y+22);ctx.quadraticCurveTo(q.x+10,q.y+12,q.x+5,q.y+1);ctx.closePath();ctx.fill();
      ctx.strokeStyle='rgba(60,45,25,.8)';ctx.lineWidth=.8;ctx.stroke();ctx.fillStyle='#8a7550';ctx.fillRect(q.x-3,q.y-1,6,3);return;}
    ctx.fillStyle=id==='oil'||id==='oilcheap'?'#3a3226':id==='linen'?'#d8d0bc':id==='valve'?'#5a5650':'#8a7a5a';ctx.beginPath();ctx.ellipse(q.x,q.y+5,4,5,0,0,Math.PI*2);ctx.fill();}};
// ===== ACT I, SCENE 5 UI END =====
