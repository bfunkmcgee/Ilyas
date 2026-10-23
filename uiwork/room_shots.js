// The room as a player sees it (sk_room.js, sk_roomui.js), in the dining room: Kael's turn with the room's moves on offer (the dock
// and the gold guides in the picture), each room move played out (frames along it), and a body knocked into a man.
// usage: node uiwork/room_shots.js <outdir> [scenes] [sizes] [ok|fail]
//   scenes: offer, hurl, pane, flip, lamp, bowl (a body flung into a man), tip (a body into the table's side)
const {chromium}=require('playwright');const fs=require('fs');
const OUT=process.argv[2]||'uiwork/room',SC=(process.argv[3]||'offer,hurl').split(','),SZ=(process.argv[4]||'land,port,desk').split(','),OK=(process.argv[5]||'ok')==='ok';
const SIZES={land:{w:844,h:390,dpr:2,mob:true},port:{w:390,h:844,dpr:2,mob:true},desk:{w:1440,h:900,dpr:1,mob:false}};
fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(require('fs').existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)});
  for(const sz of SZ){const Z=SIZES[sz];
    for(const sc of SC){const errs=[];
      const ctx=await b.newContext({viewport:{width:Z.w,height:Z.h},deviceScaleFactor:Z.dpr,isMobile:Z.mob,hasTouch:Z.mob});const p=await ctx.newPage();
      p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts|ERR_|net::/.test(m.text()))errs.push('console: '+m.text());});
      await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
      await p.goto('file://'+process.cwd()+'/'+(process.env.PAGE||'test_page.html'));await p.waitForTimeout(250);
      const info=await p.evaluate(([sc,OK])=>{S.soundOn=false;window.__now=performance.now()+1000;
        const step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
        let a=31;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
        S.arenaKey='restaurant';S.introOn=false;S.cfg.n=2;S.cfg.crew=false;S.cfg.ally.on=false;S.auto=false;S.tableOn=true;S.divOn=true;S.F=[];rosterBuild();restart();step(30);
        const K=S.F[0],V=S.F[1],B=S.F[2];
        const put=(f,x,z,fa)=>{f.station=x;f.lane=f.dep=f.stepDep=z;f.facing=fa;f.dsd={};if(f.team)f.side=Math.sign(x-S.F[0].station)||1;f.build();};
        // the places: Kael on the left facing right, Vargo in reach, Brask where the scene wants him
        if(sc==='offer'||sc==='hurl'||sc==='roomtab'||sc==='log'){put(K,380,140,1);put(V,380+engageGap(K,V)+4,140,-1);put(B,V.station+86,136,-1);}
        else if(sc==='pane'){const w=S.divs.find(d=>d.mat==='glass');put(K,w.x-w.t/2-30-engageGap(K,V)-4,90,1);put(V,w.x-w.t/2-30,90,-1);put(B,240,150,1);}
        else if(sc==='flip'){const bx=tableBox(),T=S.table;put(K,bx.r+92,T.dep,-1);put(V,bx.l-62,T.dep,1);put(B,640,150,-1);}
        else if(sc==='lamp'){const L=S.lamps.find(l=>l.x===420&&l.dep===92);put(K,L.x+4-engageGap(K,V)-10,92,1);put(V,L.x+4,92,-1);put(B,700,150,-1);}
        else if(sc==='bowl'||sc==='tip'){put(K,380,140,1);put(V,470,140,-1);put(B,560,138,-1);if(sc==='tip'){const bx=tableBox(),T=S.table;put(K,bx.r+150,T.dep,-1);put(V,bx.r+70,T.dep,1);put(B,640,150,-1);}}
        else if(sc==='ontable'){const bx=tableBox(),T=S.table;put(K,bx.r+110,T.dep,-1);put(V,bx.r+50,T.dep,1);put(B,640,150,-1);}
        warm(30);for(const L of S.lamps){L.p.x=L.p.px=L.x;L.p.y=L.p.py=L.ay+L.L;}const g=S.game;g.phase='input';startTurn(0);g.aiAt=null;g.active=0;for(const f of S.F){f.intent=null;f.ready=f===K?0:60;f.foot=footMaxOf(f);}setTgt(K,V.idx);
        updateStatus();step(4);
        let offer=roomMoves(K).map(m=>m.cmd+':'+m.D.name+(m.E?'>'+m.E.name:''));
        let frames=[];
        if(sc==='ontable'){// Vargo knocked back onto the table (down), then Kael's turn
          knockDown(V);{const bx=tableBox(),pel={x:V.p[PEL].x,y:V.p[PEL].y},top=tableTopAt(bx.cx);for(const q of V.p){const dx=q.x-pel.x,dy=q.y-pel.y;q.x=q.px=bx.cx+20+dy;q.y=q.py=top-12+dx;}}g.phase='exchange';g.ex={A:K,D:V,t0:S.t,cmd:'slash',perf:{},depth:0,plan:null,dur:.1};step(40);
          g.phase='input';g.ex=null;startTurn(0);g.aiAt=null;g.active=0;for(const f of S.F){f.intent=null;f.ready=f===K?0:60;}updateStatus();step(2);
          window.__onTable=roomMoves(K).map(m=>m.cmd+(m.on?'(on)':'')+':'+m.D.name).join(' ')+' pel '+Math.round(V.p[PEL].y)+' top '+Math.round(tableIntact()?tableTopAt(V.p[PEL].x):0);}
        if(sc==='roomtab'){hudSetTab('room',true);previewAction('room1');updateStatus();}
        if(sc==='log'){const ok=command(0,'room1');frames.push(ok?'cmd ok':'refused');}
        if(sc!=='offer'&&sc!=='bowl'&&sc!=='tip'&&sc!=='roomtab'&&sc!=='log'){
          // the dice: the move goes in or fails, as asked
          const want=OK,save=S.rng;let first=true;S.rng=()=>{if(first){first=false;return want?.97:.02;}return save();};
          const ms0=roomMoves(K),want0=sc==='ontable'?'flip':sc;const ok=ms0.length?command(0,ms0[0].cmd===want0?'room1':'room2'):false;S.rng=save;frames.push(ok?'cmd ok':'cmd refused');}
        else if(sc==='bowl'){// Vargo knocked flying into Brask: as a heavy blow would send him
          V.motor=.1;V.knockUntil=S.t+1;for(const q of V.p){q.px=q.x-620*DT;q.py=q.y+40*DT;}g.phase='exchange';g.ex={A:K,D:V,t0:S.t,cmd:'slash',perf:{},depth:0,plan:null,dur:1.4};}
        else if(sc==='tip'){V.motor=.1;V.knockUntil=S.t+1;for(const q of V.p){q.px=q.x+560*DT;q.py=q.y+20*DT;}g.phase='exchange';g.ex={A:K,D:V,t0:S.t,cmd:'slash',perf:{},depth:0,plan:null,dur:1.4};}
        window.__step=step;
        return{onTable:window.__onTable,offer,frames,K:[K.station,K.lane],V:[Math.round(V.station),V.lane],B:[Math.round(B.station),B.lane],mode:document.getElementById('wrap').dataset.mode,
          tab:document.getElementById('commands').dataset.tab,room1:(document.getElementById('cmd-room1')||{}).textContent,roomTab:!document.getElementById('tabRoom').hidden};},[sc,OK]);
      const shots=process.env.SHOTS?process.env.SHOTS.split(',').map(Number):sc==='offer'||sc==='roomtab'?[0]:sc==='log'?[200]:sc==='lamp'?[8,22,34,60]:sc==='flip'?[12,26,38,52,80]:sc==='bowl'||sc==='tip'?[6,14,24,50]:[10,20,30,40,70];let at=0,k=0;
      for(const t of shots){await p.evaluate(n=>window.__step(n),t-at);at=t;await p.waitForTimeout(60);
        await p.evaluate(()=>{window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);});
        if(sc==='log')await p.evaluate(()=>{hudLog(true);window.__step(2);});
        await p.screenshot({path:`${OUT}/${sz}_${sc}${['offer','bowl','tip','roomtab','log'].includes(sc)?'':OK?'_ok':'_fail'}_${k++}.png`});}
      const after=await p.evaluate(()=>({F:S.F.map(f=>`${f.name} ${Math.round(f.hp)}/${f.maxHp} bal ${f.foot}${f.downed?' down':''}${f.dead?' dead':''}`),
        log:[...document.querySelectorAll('#log li')].slice(0,3).map(li=>li.textContent.replace(/\s+/g,' ').trim()),table:S.table&&S.table.state,ev:S.roomN||0}));
      console.log(sz,sc,JSON.stringify(info),JSON.stringify(after),'errors',errs.length,errs.slice(0,3).join(' | '));
      await ctx.close();}}
  await b.close();})();
