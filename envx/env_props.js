// ===== ENV PROPS =====
// The furniture and the fixtures in the Noir Gilt look, drawn from the same points and slices as the game's own (so they move,
// tip and break as before). Each returns true when it has drawn the thing.
const EnvProps=(()=>{const E=EnvLook,{C,lin,rad,rgba,mix,glow,vine,scroll,gilt,rng,lerp,clamp,TAU}=E;
// draw in the plane of a divider: (depth, height) -> screen, with the panel's lean
function divPlane(w,x,g){const lean=w.wob/w.h;ctx.transform(PSX,-PSY,-lean,1,x+lean*g,0);}
// A divider's face drawn once, in its own plane (depth across, height up), and cut into the slices the game draws among the fighters.
// face(c, w, A, B, yt, g, h) draws the whole face on c. One canvas for each height of ground the divider stands on (the street's kerb
// gives a fence more than one); pad is how far above its top the face reaches.
const FACES=new WeakMap();
function divFace(it,key,face,pad){const w=it.dv,A=it.a,B=it.b,xr=divR(w),g=S.arena.ground(w.x,(A+B)/2),h=w.h,yt=g-h,sx=2.5,sy=3;
  const k=key+'|'+w.d0+'|'+w.d1+'|'+h+'|'+g.toFixed(1);let M=FACES.get(w);if(!M){M=new Map();FACES.set(w,M);}let F=M.get(k);
  if(!F){if(M.size>6)M.clear();const d0=w.d0-2,d1=w.d1+2,y0=yt-pad,y1=g+2,cn=document.createElement('canvas');cn.width=Math.ceil((d1-d0)*sx);cn.height=Math.ceil((y1-y0)*sy);
    const c=cn.getContext('2d');c.setTransform(sx,0,0,sy,-d0*sx,-y0*sy);face(c,w,w.d0,w.d1,yt,g,h);F={cn,d0,d1,y0,y1};M.set(k,F);}
  ctx.save();divPlane(w,xr,g);ctx.beginPath();ctx.rect(A,F.y0,B-A,F.y1-F.y0);ctx.clip();ctx.drawImage(F.cn,F.d0,F.y0,F.d1-F.d0,F.y1-F.y0);ctx.restore();}
// ---------- a plank fence: in town a hoarding with bills pasted on it, out of town weathered boards with a lantern on its post ----------
function plankFence(it,style){const w=it.dv;if(w.state==='broken')return false;const A=it.a,B=it.b,xr=divR(w),g=S.arena.ground(w.x,(A+B)/2),h=w.h,yt=g-h,town=style==='town';
  divFace(it,'fence'+style,(ctx,w,A,B,yt,g,h)=>fenceFace(ctx,w,A,B,yt,g,h,town),14);
  // the posts at the ends, square, capped; out of town a lantern hangs from the near one
  if(it.first||it.last){const d=it.first?A:B,pl=divL(w)-3,pr=divR(w)+3,P2=(x,y)=>P(x,y,d);
    ctx.fillStyle=town?'#100b0e':'#211b18';const q=[P2(pl,g),P2(pl,yt-10),P2(pr,yt-10),P2(pr,g)];ctx.beginPath();ctx.moveTo(q[0].x,q[0].y);for(const p of q.slice(1))ctx.lineTo(p.x,p.y);ctx.closePath();ctx.fill();
    ctx.strokeStyle=rgba(C.rim,.5);ctx.lineWidth=.8;ctx.beginPath();const a=P2(pr,yt-10),b=P2(pr,g);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
    const cap=[P2(pl-1.5,yt-10),P2((pl+pr)/2,yt-15),P2(pr+1.5,yt-10)];ctx.fillStyle=town?'#1a1216':'#2e2622';ctx.beginPath();ctx.moveTo(cap[0].x,cap[0].y);ctx.lineTo(cap[1].x,cap[1].y);ctx.lineTo(cap[2].x,cap[2].y);ctx.fill();
    if(!town&&it.first){const L=P2(pr+2,yt+6);ctx.strokeStyle='#120e0c';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(L.x,L.y-8);ctx.lineTo(L.x+5,L.y-8);ctx.lineTo(L.x+5,L.y-4);ctx.stroke();
      ctx.fillStyle='#120e0c';ctx.fillRect(L.x+2.5,L.y-4,5,1.2);ctx.fillStyle=lin(ctx,0,L.y-3,0,L.y+4,[[0,'#fff3d2'],[1,'#ffb259']]);ctx.fillRect(L.x+3,L.y-3,4,6.5);ctx.fillStyle='#120e0c';ctx.fillRect(L.x+2.5,L.y+3.5,5,1.2);
      glow(ctx,L.x+5,L.y,34,'#ffc070',.5);}}
  for(const m of w.marks){if(m.d<A||m.d>=B)continue;drawDivMark(w,m);}
  return true;}
// the fence's face, whole, in its own plane (ctx here is the face's own canvas)
function fenceFace(ctx,w,A,B,yt,g,h,town){
  // the boards: one every 7 units of depth, each its own shade, with a dark gap
  const r0=rng(w.seed);for(let d=Math.floor(w.d0/7)*7,k=0;d<w.d1;d+=7,k++){if(d+7<A||d>B)continue;const r=rng(w.seed*13+k*7),v=r();
    const top=yt+(town?0:(r()*5-1)),col=town?mix('#1c1418','#2c2024',v):mix('#2a2422','#3d3530',v);ctx.fillStyle=lin(ctx,0,top,0,g,[[0,mix(col,'#000000',.1)],[1,mix(col,'#000000',.45)]]);ctx.fillRect(d+.4,top,6.2,g-top);
    ctx.fillStyle=rgba('#000000',.55);ctx.fillRect(d+6.6,top,.8,g-top);
    // grain and a knot
    ctx.strokeStyle=rgba(town?'#3a2a2a':'#5a4e44',.45);ctx.lineWidth=.4;ctx.beginPath();for(let j=0;j<3;j++){const x=d+1.5+j*1.8;ctx.moveTo(x,top+4);ctx.bezierCurveTo(x+.5,top+h*.3,x-.5,top+h*.6,x+.3,g-3);}ctx.stroke();
    if(r()<.35){ctx.fillStyle=rgba('#000000',.45);ctx.beginPath();ctx.ellipse(d+3.5,top+h*(.2+r()*.6),1.2,2.4,0,0,TAU);ctx.fill();}
    // the top of each board catches the light
    ctx.fillStyle=rgba(C.rim,.45);ctx.fillRect(d+.4,top,6.2,.9);
    if(!town&&r()<.4){ctx.fillStyle=rgba('#3a4a2a',.5);ctx.fillRect(d+.4,g-8-r()*10,6.2,8);}}
  // two rails behind, showing in the gaps, with nail heads
  ctx.fillStyle=rgba('#000000',.3);for(const y of [g-30,yt+24])ctx.fillRect(A,y-3,B-A,6);
  ctx.fillStyle=rgba('#8a8070',.6);for(let d=Math.floor(w.d0/7)*7+3.5;d<w.d1;d+=7){if(d<A-4||d>B+4)continue;for(const y of [g-30,yt+24]){ctx.fillRect(d-.5,y-.5,1,1);}}
  if(town){// bills pasted on the boards: the bistro's, the house's and torn notices
    const bill=(d0,d1,y0,y1,fn)=>{if(d1<A||d0>B)return;ctx.save();ctx.translate(d0,y0);fn(d1-d0,y1-y0);ctx.restore();};
    bill(w.d0+8,w.d0+34,yt+18,yt+64,(bw,bh)=>{ctx.fillStyle='#5a1218';ctx.fillRect(0,0,bw,bh);ctx.fillStyle=rgba('#000000',.25);ctx.fillRect(0,bh*.82,bw,bh*.18);
      ctx.strokeStyle=C.gold;ctx.lineWidth=.6;ctx.strokeRect(1.5,1.5,bw-3,bh-3);
      const lx=bw/2,ly=bh*.42;ctx.fillStyle='#0a0808';ctx.beginPath();ctx.moveTo(lx-3,ly-6);ctx.lineTo(lx,ly-9);ctx.lineTo(lx+3,ly-6);ctx.fill();ctx.fillStyle=C.goldL;ctx.fillRect(lx-2.6,ly-6,5.2,8);ctx.fillStyle='#0a0808';ctx.fillRect(lx-3,ly+2,6,1.4);
      ctx.fillStyle=C.gold;ctx.font='700 4.2px "Alegreya SC",Georgia,serif';ctx.textAlign='center';ctx.fillText('LANTERN',bw/2,bh*.72);ctx.fillText('BISTRO',bw/2,bh*.8);});
    bill(w.d0+40,w.d0+66,yt+10,yt+48,(bw,bh)=>{ctx.fillStyle='#0c0c10';ctx.fillRect(0,0,bw,bh);ctx.fillStyle=C.gold;const hs=bh*.42,hx=bw/2,hy=bh*.4;ctx.fillRect(hx-hs*.45,hy-hs*.5,hs*.18,hs);ctx.fillRect(hx+hs*.27,hy-hs*.5,hs*.18,hs);ctx.fillRect(hx-hs*.45,hy-hs*.08,hs*.9,hs*.16);
      ctx.font='700 3.1px "Alegreya SC",Georgia,serif';ctx.textAlign='center';ctx.fillText('HALLOWELL',bw/2,bh*.82);ctx.strokeStyle=rgba(C.gold,.6);ctx.lineWidth=.4;ctx.strokeRect(1,1,bw-2,bh-2);});
    bill(w.d0+68,w.d0+88,yt+36,yt+70,(bw,bh)=>{ctx.fillStyle='#d8ccb0';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(bw,2);ctx.lineTo(bw-2,bh*.7);ctx.lineTo(bw*.6,bh);ctx.lineTo(1,bh-2);ctx.closePath();ctx.fill();
      ctx.fillStyle=rgba('#2a2018',.75);for(let k=0;k<6;k++)ctx.fillRect(3,5+k*4,bw-8-(k%3)*3,1.2);ctx.fillStyle=rgba('#000000',.25);ctx.fillRect(0,0,bw,bh*.15);});
    bill(w.d0+14,w.d0+30,yt+70,yt+92,(bw,bh)=>{ctx.fillStyle='#c8b890';ctx.fillRect(0,0,bw,bh);ctx.fillStyle=rgba('#3a2a1a',.8);for(let k=0;k<4;k++)ctx.fillRect(2,3+k*4,bw-5,1);});
    // the wash of the street lamps on the bills, and the grime at the foot
    ctx.fillStyle=lin(ctx,0,yt,0,g,[[0,rgba('#ffcf86',.08)],[.6,rgba('#000000',0)],[1,rgba('#000000',.35)]]);ctx.fillRect(A,yt,B-A,h);}
  // the cap board along the top, lit
  ctx.fillStyle=town?'#140e11':'#2a2420';ctx.fillRect(A,yt-3,B-A,4);ctx.fillStyle=rgba(C.rim,.6);ctx.fillRect(A,yt-3,B-A,.8);
}
// ---------- the table out in the open: heavy oak on iron legs, a pewter tankard and a bottle on it ----------
function fieldTable(style){const T=S.table;if(!T||!T.on||T.state==='broken')return false;
  const Q=T.pts,bk=T.dep+TD,fr=T.dep-TD,lp=(a,b,u)=>({x:lerp(a.x,b.x,u),y:lerp(a.y,b.y,u)}),at=(q,d)=>P(q.x,q.y,d),seg=(a,b,w,col)=>{ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();};
  const la=lp(Q[0],Q[1],.08),lb=lp(Q[0],Q[1],.92),iron='#0a090c',ironL=rgba(C.rim,.35);ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  // the back legs and the stretcher
  seg(at(la,bk),at(Q[3],bk),3.4,iron);seg(at(lb,bk),at(Q[2],bk),3.4,iron);
  seg(at(lp(la,Q[3],.6),bk),at(lp(lb,Q[2],.6),bk),2,iron);seg(at(lp(la,Q[3],.6),fr),at(lp(la,Q[3],.6),bk),1.8,iron);seg(at(lp(lb,Q[2],.6),fr),at(lp(lb,Q[2],.6),bk),1.8,iron);
  // the top: oak planks, the grain running along, the edge toward the light bright
  const top=[at(Q[0],bk),at(Q[1],bk),at(Q[1],fr),at(Q[0],fr)];ctx.fillStyle=lin(ctx,0,top[0].y,0,top[3].y,[[0,'#2a1d16'],[1,'#3d2a1e']]);
  ctx.beginPath();ctx.moveTo(top[0].x,top[0].y);for(const q of top.slice(1))ctx.lineTo(q.x,q.y);ctx.closePath();ctx.fill();
  ctx.strokeStyle=rgba('#000000',.4);ctx.lineWidth=.5;ctx.beginPath();for(const u of [.25,.5,.75]){const a=P(lerp(Q[0].x,Q[1].x,0),lerp(Q[0].y,Q[1].y,0),lerp(bk,fr,u)),b=P(Q[1].x,Q[1].y,lerp(bk,fr,u));ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();
  ctx.strokeStyle=rgba(C.rim,.5);ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(top[0].x,top[0].y);ctx.lineTo(top[1].x,top[1].y);ctx.stroke();
  // the front: the apron board and the legs with a scroll at each knee
  const a0=at(Q[0],fr),a1=at(Q[1],fr);ctx.fillStyle='#24180f';ctx.beginPath();ctx.moveTo(a0.x,a0.y);ctx.lineTo(a1.x,a1.y);ctx.lineTo(a1.x,a1.y+5);ctx.lineTo(a0.x,a0.y+5);ctx.closePath();ctx.fill();
  ctx.fillStyle=rgba(C.rim,.4);ctx.fillRect(Math.min(a0.x,a1.x),a0.y,Math.abs(a1.x-a0.x),.8);
  seg(at(la,fr),at(Q[3],fr),3.6,iron);seg(at(lb,fr),at(Q[2],fr),3.6,iron);seg(at(lp(la,Q[3],.6),fr),at(lp(lb,Q[2],.6),fr),2.2,iron);
  for(const [q0,dir] of [[la,1],[lb,-1]]){const k=at(lp(q0,dir>0?Q[3]:Q[2],.18),fr);scroll(ctx,k.x+dir*4,k.y+2,3.6,dir,iron,1.4,1.2);scroll(ctx,k.x+dir*4,k.y+2,3.6,dir,rgba(C.gold,.55),.5,1.2);}
  seg(at(la,fr),at(Q[3],fr),.6,ironL);
  // what stands on it
  for(const q of T.props){const s=P(q.x,q.y,T.dep);ctx.save();ctx.translate(s.x,s.y);ctx.rotate(q.ang);
    if(q.kind==='mug'){ctx.fillStyle=lin(ctx,-3.5,0,3.5,0,[[0,'#3a3a40'],[.4,'#8a8a92'],[1,'#2a2a30']]);ctx.fillRect(-3.5,-4.5,7,9);ctx.fillStyle='#202026';ctx.fillRect(-3.8,-5.2,7.6,1.4);ctx.fillRect(-3.8,3.6,7.6,1.2);
      ctx.strokeStyle='#5a5a62';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(4,0,2.6,-Math.PI/2,Math.PI/2);ctx.stroke();ctx.fillStyle=rgba('#fff3e0',.6);ctx.fillRect(-1.5,-3.5,.8,7);}
    else{ctx.fillStyle='#0c1a12';ctx.beginPath();ctx.moveTo(-3,4);ctx.lineTo(-3,-1);ctx.lineTo(-1.2,-3.5);ctx.lineTo(-1.2,-8);ctx.lineTo(1.2,-8);ctx.lineTo(1.2,-3.5);ctx.lineTo(3,-1);ctx.lineTo(3,4);ctx.closePath();ctx.fill();
      ctx.fillStyle=C.gold;ctx.fillRect(-1.3,-8.5,2.6,2.4);ctx.fillStyle='#e8dcc0';ctx.fillRect(-2.6,0,5.2,2.8);ctx.fillStyle=rgba('#ffffff',.35);ctx.fillRect(-2,-2.5,.7,5);}
    ctx.restore();}
  ctx.restore();return true;}
return{divPlane,divFace,plankFence,fieldTable};
})();
// ===== ENV PROPS END =====
