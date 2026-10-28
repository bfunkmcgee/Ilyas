// Tamm's scene after many endings of the toll: does anybody on his feet walk through anybody in its outro? node uiwork/act1/tammprobe.js [n]
// Each line: the toll's ending (where Ilyas and the two collectors were, who was down) and the pairs that stood in one another, frames.
const {chromium}=require('playwright');const fs=require('fs');const N=+(process.argv[2]||24),PAGE=process.env.PAGE||'test_page.html';
(async()=>{const b=await chromium.launch({executablePath:process.env.SK_CHROMIUM||(fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined)});
  const p=await (await b.newContext({viewport:{width:1000,height:640}})).newPage(),errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{window.requestAnimationFrame=cb=>{window.__raf=cb;return 1;};});
  await p.goto('file://'+process.cwd()+'/'+PAGE);await p.waitForTimeout(300);
  const out=await p.evaluate(N=>{S.soundOn=false;window.__now=performance.now()+1000;window.render=()=>{};const step=k=>{for(let i=0;i<k;i++){window.__now+=16.7;const f=window.__raf;window.__raf=null;if(f)f(window.__now);}};
    const res=[];let a=7;const R=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};
    for(let n=0;n<N;n++){const kx=260+R()*560,kz=92+R()*16,side=R()<.5?-1:1;
      const E={K:{x:kx,z:kz,hp:60},big:{x:kx+side*(24+R()*30),z:kz+(R()-.5)*16,hp:50,down:R()<.25},small:{x:kx-side*(30+R()*60),z:kz+(R()-.5)*20,hp:30,down:R()<.3},drop:R()<.5?{id:'rice',x:kx+side*12,d:kz+8}:null,spill:null};
      storyGo('tamm');S.storyAuto=true;S.auto=true;S.act1.tollEnd=E;S.act1.tollDrop=undefined;S.act1.riceSpill=undefined;storyGo('tamm');S.act1.tollEnd=E;step(2);
      let over={},k=0;while(S.story.key==='tamm'&&S.story.step!=='done'&&k<12000){step(1);k++;
        if(S.story.step==='outro'){const up=S.F.filter(f=>!f.hidden&&!f.offstage&&!f.downed&&!f.dead&&!f.gone);
          for(let i=0;i<up.length;i++)for(let j=i+1;j<up.length;j++)if(Math.abs(up[i].station-up[j].station)<14&&Math.abs(up[i].lane-up[j].lane)<10){const q=up[i].name+'+'+up[j].name;over[q]=(over[q]||0)+1;}}}
      res.push(JSON.stringify({n,K:[Math.round(kx),Math.round(kz)],big:[Math.round(E.big.x),Math.round(E.big.z),E.big.down?'d':''],small:[Math.round(E.small.x),Math.round(E.small.z),E.small.down?'d':''],over,end:S.story.key}));}
    return res;},N);
  console.log(out.join('\n'));console.log('errors',JSON.stringify(errs.slice(0,3)));await b.close();})();
