// ===== SECRET UI =====
// (loaded ahead of the main UI script; everything here runs only once the UI is up)
// The kitchen's hidden lift is drawn live over the kitchen's layer from S.secret. The pieces that draw a lift (its frame, car, doors,
// line of light and the light it throws on the floor) are written for any context, because the lobby's lift uses them too.
const LIFT_COL={steel:'#8d99a3',steelD:'#5f6a74',glass:'#070b11',cold:'196,230,255'};
// the frame round the opening: brushed steel, and a black display over the doors with a chevron on it
function liftFrame(c,cx,yB,w,h,fr,hd){
  const x0=cx-w/2-fr,x1=cx+w/2+fr,y0=yB-h-hd,g=c.createLinearGradient(x0,0,x1,0);
  g.addColorStop(0,'#aeb9c2');g.addColorStop(.2,'#6b7681');g.addColorStop(.5,'#919da7');g.addColorStop(.8,'#6b7681');g.addColorStop(1,'#a6b1bb');
  c.fillStyle=g;c.fillRect(x0,y0,x1-x0,yB-y0);
  c.fillStyle='rgba(255,255,255,.07)';for(let x=x0+2;x<x1;x+=3)c.fillRect(x,y0,.7,yB-y0);
  c.fillStyle='rgba(0,0,0,.35)';c.fillRect(x0,y0,1,yB-y0);c.fillRect(x1-1,y0,1,yB-y0);c.fillStyle='rgba(255,255,255,.3)';c.fillRect(x0,y0,x1-x0,1);
  c.fillStyle='#070b10';c.fillRect(cx-15,y0+3,30,hd-6);
  c.fillStyle='rgba(150,216,255,.95)';c.beginPath();c.moveTo(cx,y0+4.5);c.lineTo(cx-3.4,y0+hd-4.5);c.lineTo(cx+3.4,y0+hd-4.5);c.closePath();c.fill();
  c.fillRect(cx-11,y0+hd/2-.6,4,1.2);c.fillRect(cx+7,y0+hd/2-.6,4,1.2);
  c.fillStyle='#04070b';c.fillRect(cx-w/2,yB-h,w,h);
}
// the car seen through the open doors: a bright steel box with a strip of light in the ceiling and a rail on the back wall
function liftCabin(c,cx,yB,w,h){
  const x0=cx-w/2,x1=cx+w/2,top=yB-h,ix=7,it=9,ib=10,bx0=x0+ix,bx1=x1-ix,bt=top+it,bb=yB-ib,poly=(a,col)=>{c.fillStyle=col;c.beginPath();c.moveTo(a[0],a[1]);for(let i=2;i<a.length;i+=2)c.lineTo(a[i],a[i+1]);c.closePath();c.fill();};
  poly([x0,top,bx0,bt,bx0,bb,x0,yB],'#4b6073');poly([x1,top,bx1,bt,bx1,bb,x1,yB],'#3a4d5f');
  const g=c.createLinearGradient(0,bt,0,bb);g.addColorStop(0,'#c4d8e8');g.addColorStop(.5,'#93acc0');g.addColorStop(1,'#62798d');
  c.fillStyle=g;c.fillRect(bx0,bt,bx1-bx0,bb-bt);
  c.fillStyle='rgba(255,255,255,.1)';for(let x=bx0+1.5;x<bx1;x+=2.5)c.fillRect(x,bt,.6,bb-bt);
  poly([x0,top,x1,top,bx1,bt,bx0,bt],'#e2f0fb');
  poly([x0,yB,x1,yB,bx1,bb,bx0,bb],'#161e27');c.fillStyle='rgba(190,226,255,.18)';c.fillRect(bx0+4,bb,bx1-bx0-8,3);
  c.fillStyle='rgba(255,255,255,.5)';c.fillRect(cx-.7,bt+2,1.4,bb-bt-4);
  c.fillStyle='rgba(40,55,70,.5)';c.fillRect(bx0,bb-h*.36+1.5,bx1-bx0,2);c.fillStyle='#dbe4ec';c.fillRect(bx0,bb-h*.36-.5,bx1-bx0,2);
}
// the two black glass leaves: o is 0 when shut and 1 when open, each leaf sliding back into its own jamb
function liftDoors(c,cx,yB,w,h,o){
  const top=yB-h,hw=w/2,open=hw*o;
  for(const s of [-1,1]){const a=s<0?cx-hw:cx+open,b=s<0?cx-open:cx+hw;if(b-a<.6)continue;
    const g=c.createLinearGradient(0,top,0,yB);g.addColorStop(0,'#0b121b');g.addColorStop(1,'#04070b');c.fillStyle=g;c.fillRect(a,top,b-a,h);
    const sg=c.createLinearGradient(a,top,b,top+h*.7);sg.addColorStop(0,'rgba(150,190,235,0)');sg.addColorStop(.4,'rgba(150,190,235,.11)');sg.addColorStop(.55,'rgba(150,190,235,0)');c.fillStyle=sg;c.fillRect(a,top,b-a,h);
    const ex=s<0?b-3:a;c.fillStyle='#a3aeb8';c.fillRect(ex,top,3,h);c.fillStyle='rgba(255,255,255,.35)';c.fillRect(ex+(s<0?0:2.2),top,.8,h);}
  if(o<.02){c.fillStyle='rgba(196,230,255,.5)';c.fillRect(cx-.4,top,.8,h);}
}
// a thin line of cold white-blue light round the opening, k from 0 to 1
function liftLine(c,cx,yB,w,h,k){
  if(k<=0)return;const x0=cx-w/2,top=yB-h;c.save();c.globalCompositeOperation='lighter';c.lineJoin='miter';c.lineCap='butt';
  for(const [lw,al] of [[8,.05],[3.6,.13],[1.3,.95]]){c.strokeStyle=`rgba(${LIFT_COL.cold},${(al*k).toFixed(3)})`;c.lineWidth=lw;c.beginPath();c.moveTo(x0,yB);c.lineTo(x0,top);c.lineTo(x0+w,top);c.lineTo(x0+w,yB);c.stroke();}
  c.restore();
}
// cold light spilling out across the floor from a lift in the back wall (world x hx, depth dp), and a halo on the wall; k from 0 to 1
function liftSpill(c,hx,dp,w,k,reach){
  if(k<=0)return;const a=P(hx-w/2,GB,dp),b=P(hx+w/2,GB,dp),d1=dp-reach,e=P(hx+w/2+reach*.55,GB,d1),f=P(hx-w/2-reach*.55,GB,d1),yB=a.y,cx=(a.x+b.x)/2;
  c.save();c.globalCompositeOperation='lighter';
  const g=c.createLinearGradient(0,yB,0,e.y);g.addColorStop(0,`rgba(196,230,255,${(.4*k).toFixed(3)})`);g.addColorStop(.5,`rgba(170,212,250,${(.14*k).toFixed(3)})`);g.addColorStop(1,'rgba(150,200,250,0)');
  c.fillStyle=g;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineTo(e.x,e.y);c.lineTo(f.x,f.y);c.closePath();c.fill();
  const g2=c.createLinearGradient(0,yB,0,yB+(e.y-yB)*.6);g2.addColorStop(0,`rgba(230,246,255,${(.3*k).toFixed(3)})`);g2.addColorStop(1,'rgba(200,230,255,0)');
  c.fillStyle=g2;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineTo(lerp(b.x,e.x,.35),lerp(b.y,e.y,.6));c.lineTo(lerp(a.x,f.x,.35),lerp(a.y,f.y,.6));c.closePath();c.fill();
  const rg=c.createRadialGradient(cx,yB-70,6,cx,yB-70,104);rg.addColorStop(0,`rgba(190,226,255,${(.2*k).toFixed(3)})`);rg.addColorStop(1,'rgba(170,210,250,0)');c.fillStyle=rg;c.fillRect(cx-104,yB-174,208,174);
  c.restore();
}

// ---------- the kitchen's hidden lift ----------
// where the lift is on the screen: its opening, the frame round it, and the section of tiled wall that covers it all
function secretGeom(){
  const far=KITCHEN.far,yB=prjY(GB,far),A=SECRET_ART,cx=SECRET_DOOR.x+far*PSX;
  return{yB,cx,ty0:yB-A.h-A.hd,pl:cx-A.w/2-A.fr,pr:cx+A.w/2+A.fr};}
// the tiled section as it looks in the wall: the same tiles, grout and skirting the kitchen's layer paints there
function secretSlab(g){
  const{yB,ty0,pl,pr}=g,X0=-140,X1=W+220;
  ctx.fillStyle=KM.tile;ctx.fillRect(pl,ty0,pr-pl,yB-ty0);
  ctx.strokeStyle=KM.grout;ctx.lineWidth=1;ctx.beginPath();
  for(let y=ty0;y<yB;y+=12){ctx.moveTo(pl,y);ctx.lineTo(pr,y);}
  for(let row=0,y=ty0;y<yB;y+=12,row++)for(let x=X0+(row%2)*12;x<X1;x+=24){if(x<pl-1||x>pr+1)continue;ctx.moveTo(x,y);ctx.lineTo(x,y+12);}
  ctx.stroke();ctx.fillStyle='rgba(255,255,255,.05)';for(let y=ty0;y<yB;y+=12)ctx.fillRect(pl,y+1,pr-pl,1.2);
  ctx.fillStyle='#1a1f22';ctx.fillRect(pl,yB-9,pr-pl,9);ctx.fillStyle='rgba(6,8,10,.55)';ctx.fillRect(pl,yB-2,pr-pl,3);
}
// how far along each stage the reveal is, for a time u after the click
function secretStage(u){const e=SECRET_T;
  return{slide:sstep((u-e.slide0)/(e.slide1-e.slide0)),line:clamp((u-e.line)/.4,0,1),open:sstep((u-e.open0)/(e.open1-e.open0)),jolt:Math.sin(clamp(u/.14,0,1)*Math.PI)};}
function drawSecretDoor(){
  if(S.room!=='kitchen')return;const D=S.secret;
  // before the reveal only the faintest seam in the tiles shows, for a sharp eye
  if(!D){if(deepOn()){const g=secretGeom();ctx.fillStyle='rgba(6,10,10,.2)';ctx.fillRect(g.pl,g.ty0+1,.9,g.yB-g.ty0-3);ctx.fillRect(g.pr-.9,g.ty0+1,.9,g.yB-g.ty0-3);}return;}
  const g=secretGeom(),{yB,cx,ty0,pl,pr}=g,A=SECRET_ART,u=S.t-D.t0,st=secretStage(u),s=st.slide*(pr-pl)+st.jolt*1.2;
  ctx.save();
  // the lift, once any of it shows
  if(st.slide>.001){
    liftFrame(ctx,cx,yB,A.w,A.h,A.fr,A.hd);
    if(st.open>0)liftCabin(ctx,cx,yB,A.w,A.h);
    liftDoors(ctx,cx,yB,A.w,A.h,st.open);
    liftLine(ctx,cx,yB,A.w,A.h,st.line*(1-.25*st.open));}
  // the wall section sliding aside into the wall on the right
  ctx.save();ctx.beginPath();ctx.rect(pl,ty0,pr-pl,yB-ty0+2);ctx.clip();
  if(s>0){const sh=ctx.createLinearGradient(pl+s-10,0,pl+s,0);sh.addColorStop(0,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(0,0,0,.55)');ctx.fillStyle=sh;ctx.fillRect(pl+s-10,ty0,10,yB-ty0);}
  if(s<pr-pl-.5){ctx.translate(s,0);secretSlab(g);ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(pl,ty0,1.2,yB-ty0);ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(pl+1.2,ty0,.8,yB-ty0);}
  ctx.restore();
  // dust sifting out along the moving edge of the section and falling down the wall
  if(u>SECRET_T.slide0-.08&&u<SECRET_T.slide1+.9){
    ctx.fillStyle='#aab1a9';
    for(let i=0;i<22;i++){const b=SECRET_T.slide0-.04+i*.045,a=u-b;if(a<0||a>1)continue;
      const x=pl+secretStage(b).slide*(pr-pl)+((i*7)%9)-1,y=ty0+((i*13)%9)+a*(34+(i%5)*10)+a*a*55;ctx.globalAlpha=(1-a)*.5;ctx.fillRect(x,y,1.3+(i%3)*.5,1.5+(i%2)*.6);}
    ctx.globalAlpha=1;}
  ctx.restore();
  // the light that comes out of the doors
  if(st.open>0)liftSpill(ctx,SECRET_DOOR.x,KITCHEN.far,A.w,st.open,170);
}
V11UI.init.push(()=>{
  const live=drawKitchenLive;drawKitchenLive=()=>{live();drawSecretDoor();};
  // on a phone the view settles on the right-hand end of the kitchen while the wall opens, so the lift is in it (the heroes too when they stand
  // in the right half); once the walk starts the camera follows them again
  const uc=updateCamera;
  updateCamera=rdt=>{
    const T=S.stage.tr;
    if(cssW>=640||S.room!=='kitchen'||!S.secret||!T||T.step!=='pre'){uc(rdt);return;}
    let lo=1e9;for(const f of S.F)if(f.team===0&&!f.dead&&!f.gone)lo=Math.min(lo,prjX(f.p[PEL].x,f.dep));
    const tw=clamp(W-(lo-70),560,700),k=Math.min(1,rdt*3.5);
    cam.viewW+=(tw-cam.viewW)*k;cam.x+=(W-tw/2-cam.x)*k;};
  // new sounds: the latch, the grind of the wall section, and the chime as the lift doors part
  // The grind lasts as long as the slide (about a second), so it holds its level and trembles like a heavy slab on a rail. The shared noise
  // buffer is 0.6 s long and plays once, so the grind plays it in a loop.
  const grind=()=>{const a=AC,t0=a.currentTime,D=1.2,env=a.createGain(),am=a.createGain(),lfo=a.createOscillator(),lg=a.createGain(),o=a.createOscillator(),og=a.createGain();
    env.gain.setValueAtTime(.0001,t0);env.gain.exponentialRampToValueAtTime(1,t0+.14);env.gain.setValueAtTime(1,t0+D-.22);env.gain.exponentialRampToValueAtTime(.0001,t0+D);
    am.gain.value=.72;lg.gain.value=.28;lfo.frequency.value=13;lfo.connect(lg);lg.connect(am.gain);env.connect(am);am.connect(master);lfo.start(t0);lfo.stop(t0+D+.05);
    const rub=(type,f0,f1,q,vol)=>{const s=a.createBufferSource(),fl=a.createBiquadFilter(),g=a.createGain();s.buffer=noiseBuf;s.loop=true;fl.type=type;fl.Q.value=q;g.gain.value=vol;
      fl.frequency.setValueAtTime(f0,t0);fl.frequency.linearRampToValueAtTime(f1,t0+D);s.connect(fl);fl.connect(g);g.connect(env);s.start(t0);s.stop(t0+D+.05);};
    rub('lowpass',320,200,1.5,.5);rub('bandpass',520,300,4,.13);
    o.type='sawtooth';o.frequency.setValueAtTime(54,t0);o.frequency.linearRampToValueAtTime(42,t0+D);og.gain.value=.05;o.connect(og);og.connect(env);o.start(t0);o.stop(t0+D+.05);};
  const snd=S.hooks.sound;
  S.hooks.sound=(k,v)=>{
    if(k!=='click'&&k!=='grind'&&k!=='chime'&&k!=='arrive'){snd(k,v);return;}
    if(!S.soundOn||!AC||AC.state!=='running')return;
    try{
      if(k==='click'){nz(.05,'bandpass',2600,1000,3.5,.4);tone(.08,'square',230,95,.06);tone(.14,'sine',130,62,.26);}
      else if(k==='grind')grind();
      else{const bell=(f,dt,vol)=>{const a=AC,t0=a.currentTime+dt,o=a.createOscillator(),g=a.createGain(),o2=a.createOscillator(),g2=a.createGain();
          o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(vol,t0+.012);g.gain.exponentialRampToValueAtTime(.0001,t0+1.5);
          o2.type='sine';o2.frequency.value=f*2.76;g2.gain.setValueAtTime(.0001,t0);g2.gain.exponentialRampToValueAtTime(vol*.22,t0+.01);g2.gain.exponentialRampToValueAtTime(.0001,t0+.45);
          o.connect(g);g.connect(master);o2.connect(g2);g2.connect(master);o.start(t0);o.stop(t0+1.6);o2.start(t0);o2.stop(t0+.5);};
        bell(1175,0,.07);bell(880,.26,.07);}
    }catch(e){}
  };
});
// ===== SECRET UI END =====
