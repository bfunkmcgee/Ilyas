// ===== LAYERS TEST: ITS SWITCHES =====
// The layers test's rows in the test panel (the motion test's, spike/motion/panel.js, which this page carries too): the picture in
// layers or flat, the focus, the dust, the parallax, and what a frame costs either way. Not part of the game.
(function(){
'use strict';
const LY=window.LayerTest,MO=window.MotionTest,P=MO&&MO.panel;if(!LY||!P)return;
const el=P.el;
// (a phone held sideways: with this test's rows the sheet is taller than the room over the bar, so there it scrolls)
document.head.appendChild(el('style',{textContent:'@media (max-height:480px){#moSheet{max-height:calc(66vh - 6px)}}'}));
P.row('Picture',[['In layers',true],['Flat',false]],()=>LY.on,v=>{LY.on=v;});
P.row('Focus',[['Full',1],['Light',.55],['Off',0]],()=>LY.focus?LY.focusK:0,v=>{LY.focus=v>0;if(v>0)LY.focusK=v;});
P.row('Dust',[['On',true],['Off',false]],()=>LY.dust,v=>{LY.dust=v;});
P.row('Parallax',[['On',true],['Off',false]],()=>LY.parallax,v=>{LY.parallax=v;});
// The walk's camera goes along with him on an upright phone, as the yard's own does while he walks about, so that the far bands
// have a camera to slide past. On the motion test's own page it stands still.
if(typeof V11!=='undefined'&&V11.step)V11.step.push(()=>{const sv=S.story,C=S.camCut;if(!sv||sv.key!=='motion'||!C)return;const K=hero();if(!K||!K.p)return;
  C.xn=prjX(K.p[PEL].x,K.dep)+(K.cutWalk?K.facing*30:0);});
// what a frame costs on this device: the time between frames (the average and the worst of the last two seconds), what the game's
// own painting took and what Phaser's frame took
const note=el('div',{className:'r'},[el('span',{textContent:'A frame, here'})]),line=el('div',{textContent:'measuring',style:'font:500 11px/1.35 ui-monospace,Menlo,monospace;white-space:pre-line;opacity:.92'});
note.appendChild(line);P.sheet.insertBefore(note,P.sheet.firstChild);
// (this page's own quick switch is the picture's. The motion test's two closer looks, and its quick switch, stay in its own page:
// its drawing can still be changed here, in the sheet)
for(const r of P.sheet.querySelectorAll('.r')){const t=r.firstChild&&r.firstChild.textContent;if(t==='Blows in a fight'||t==='The two bodies as lines')r.style.display='none';}
for(const x of [...P.quicks.children].slice(1))x.style.display='none';
const quick=el('button',{type:'button'});quick.addEventListener('click',()=>{LY.on=!LY.on;P.repaint();});P.quicks.appendChild(quick);
P.onPaint(()=>{quick.textContent=LY.on?'Layers':'Flat';quick.classList.toggle('on',LY.on);quick.setAttribute('aria-label',LY.on?'Picture: in layers. Tap for flat':'Picture: flat. Tap for layers');});
const N=120,gaps=new Float32Array(N);let k=0,n=0,last=0,shown=0;
function tick(t){if(last){gaps[k]=t-last;k=(k+1)%N;if(n<N)n++;}last=t;
  if(t-shown>500&&n>10){shown=t;let sum=0,worst=0;for(let i=0;i<n;i++){sum+=gaps[i];if(gaps[i]>worst)worst=gaps[i];}
    const I=LY.info();line.textContent=(I.live?'in layers'+(I.parallax?', far bands apart':'')+(LY.focus&&!I.focus?' (no focus set for this place)':''):'flat'+(LY.on&&I.why?' ('+I.why+')':''))+'\nframes '+(sum/n).toFixed(1)+' ms, worst '+worst.toFixed(0)+
      '\npaint '+I.ms.toFixed(1)+' ms, Phaser '+I.host.toFixed(1)+' ms';}
  requestAnimationFrame(tick);}
requestAnimationFrame(tick);
P.repaint();
})();
