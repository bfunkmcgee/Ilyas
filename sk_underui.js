// ===== UNDER THE CITY ON THE PAGE START (since V105) =====
// What the scenes of sk_under.js leave in the world, drawn where the painters do not: the goblin at the brakes (a drawn goblin: the
// game poses it, the page draws it as the fight's own are drawn, at its depth, in front of the car's near side; the trolley's crew are
// drawn by the tunnel's painter, behind the car's tail), the trolley's stolen lamp and the car's tail lamp as lights, and the scenes'
// own sounds. Nothing here writes what the game reads (the drawfree suite).

// ---------- the drawn goblins ----------
function underCrew(){const out=[];if(S.arenaKey!=='tunnel')return out;const B=S.brakeCut;if(B&&B.g&&!B.g.hidden)out.push(B.g);return out;}
// (and in the deep station, the wreck's pieces thrown out in front of the engine: the station painter's wreckItem, by its depth)
{const ei=envItems;envItems=function(items){ei(items);for(const g of underCrew())items.push({d:g.dep,underGob:g});
  if(S.arenaKey==='station'&&S.wreck&&!S.classicLook&&typeof EnvLook!=='undefined'&&EnvLook.S.station&&EnvLook.S.station.wreckItem){const it=EnvLook.S.station.wreckItem();items.push({d:it.d,underDraw:it});}};}
{const de=drawEnvItem;drawEnvItem=function(it){
  if(it.underDraw){ctx.save();try{it.underDraw.draw(ctx);}catch(e){}ctx.restore();return true;}
  if(!it.underGob)return de(it);const g=it.underGob;ctx.save();ctx.translate(g.dep*PSX,-g.dep*PSY);try{drawFighter(g);}catch(e){}ctx.restore();return true;};}

// ---------- their light ----------
V11UI.init.push(()=>{if(typeof FXL==='undefined'||!FXL.lights)return;
  FXL.lights.push(add=>{if(S.arenaKey!=='tunnel')return;
    // the stolen crystal swinging from the trolley's frame, a sick green-cyan
    const T=S.trolley;if(T&&T.state!=='gone'){const xf=trolleyXf(T),B=trolleyBeam(T),p=xf(B.pv.x+6,B.pv.y-10);add(p.x,p.y,TROLLEY.dep,'#9cf5c8',.9*T.lamp,260);}
    // the car's red tail lamp, over the line behind it
    add(LINE_REAR+4,GB-16,4,'#ff3a2a',.5,200);});});

// ---------- their sounds ----------
// the trolley's beam squealing on its pivot and its wheels clanking at the rail joints; a timber of the trestle going; the water taking
// it; the hollow of the cistern; the brake cable parting; the crash at the end of the line (with the recordings it can borrow)
V11UI.init.push(()=>{const snd=S.hooks.sound;
  const held=(D,type,f0,f1,q,vol,att,rel,delay)=>{const a=AC,t0=a.currentTime+(delay||0),s=a.createBufferSource(),fl=a.createBiquadFilter(),g=a.createGain();s.buffer=noiseBuf;s.loop=true;fl.type=type;fl.Q.value=q;
    fl.frequency.setValueAtTime(f0,t0);fl.frequency.exponentialRampToValueAtTime(f1,t0+D);g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(vol,t0+D*att);
    g.gain.setValueAtTime(vol,t0+D*(1-rel));g.gain.exponentialRampToValueAtTime(.0001,t0+D);s.connect(fl);fl.connect(g);g.connect(master);s.start(t0);s.stop(t0+D+.05);};
  const later=(ms,fn)=>setTimeout(()=>{try{fn();}catch(e){}},ms);
  const OWN=new Set(['trolley','trolley_crash','timber','splash','cistern','cable_snap','hose','crash_train','rail_fast']);
  S.hooks.sound=(k,v,c)=>{
    if(!OWN.has(k)){snd(k,v,c);return;}
    // (a moment a recording carries goes back up through the whole hook, so the recordings hear it: sk_sfxui.js)
    const rec=S.hooks.sound;
    if(k==='trolley_crash'){rec('clang',1.2,{s:'pit_steel'});rec('plaster',1.2,{s:'pit_wood_break',delay:.06});rec('rattle',.9,{s:'debris_rattle',delay:.2});return;}
    if(k==='crash_train'){rec('crit',30,{s:'bike_into_apc'});rec('clang',1.6,{s:'pit_steel',delay:.05});rec('plaster',1.4,{s:'pit_wood_break',delay:.12});return;}
    if(k==='timber'&&uiRand()<.5){rec('plaster',v,{s:'pit_wood_break',g:.7});return;}
    if(!S.soundOn||typeof AC==='undefined'||!AC||AC.state!=='running')return;
    try{
      if(k==='trolley'){for(let i=0;i<14;i++){later(i*230,()=>{tone(.09,'triangle',1700+uiRand()*140,1180,.05);});if(i%2===0)later(i*230+90,()=>{nz(.05,'bandpass',900,600,3,.22);tone(.06,'square',220,160,.04);});}}
      else if(k==='timber'){nz(.09,'bandpass',1400,500,1.4,.4*v);later(30,()=>nz(.16,'lowpass',600,140,.8,.3*v));}
      else if(k==='splash'){held(1.1,'lowpass',1800,300,.6,.32*v,.08,.7);later(40,()=>held(.7,'bandpass',3200,1600,1.2,.12*v,.1,.6));}
      else if(k==='cistern'){tone(1.8,'sine',62,48,.25);held(3.2,'bandpass',420,260,3,.08,.3,.6);for(let i=0;i<4;i++)later(500+i*640+uiRand()*200,()=>tone(.12,'sine',1900+uiRand()*500,1500,.05));}
      else if(k==='cable_snap'){tone(.5,'sawtooth',520,70,.18);nz(.12,'highpass',3000,1800,1,.3);later(60,()=>tone(.32,'triangle',260,90,.1));}
      // (the air going out of the cut hose: a shriek that falls away)
      else if(k==='hose'){held(1.3,'highpass',6200,2400,.9,.3,.04,.75);held(1.1,'bandpass',2800,1500,4,.1,.05,.7);}
      else if(k==='rail_fast'){held(2.4,'bandpass',300,900,.9,.2,.6,.2);}
    }catch(e){}};});
// ===== UNDER THE CITY ON THE PAGE END =====
