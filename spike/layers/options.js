// ===== THE DRAWN MOVEMENT AND THE LAYERS IN THE GAME'S PAGE: THEIR SWITCHES (since V118) =====
// build.py's game_page puts motion.js (spike/motion: the figures drawn in the pose itself) and layers.js (spike/layers: the picture
// handed to Phaser in layers) in the published page, after the Phaser view (spike/phaser/host.js). This part adds their rows to the
// Options panel's Look section under the view's own, keeps what is chosen (localStorage 'sk_look2'), reads ?motion= ?layers=
// ?lamps= (0 or 1) for the tools, and eases the layers on a device that cannot keep up with them. Not in test_page.html: the
// browser checks run the game as it was, and these parts have their own (spike/motion/probe.js, spike/layers/probe.js).
(function(){
'use strict';
const MO=window.MotionTest,LY=window.LayerTest;if(!MO&&!LY)return;
const q=new URLSearchParams(location.search);let saved=null;try{saved=JSON.parse(localStorage.getItem('sk_look2')||'null');}catch(e){saved=null;}
const pick=(k,d)=>q.get(k)!=null?q.get(k)!=='0':saved&&typeof saved[k]==='boolean'?saved[k]:d;
// eased: how far the layers have been stepped down for this device. 0 all of it; 1 without the lamps and the soft things on the
// stage; 2 without the focus and the sliding far walls as well; 3 flat, as before V118. It lasts the visit and is not kept: one
// slow stretch should not cost a device its layers for good. hold: a box ticked by hand in this visit (the device is then left alone).
const st=window.LOOK2={motion:pick('motion',true),layers:pick('layers',true),lamps:pick('lamps',true),eased:0,hold:q.get('layers')!=null};
const save=()=>{try{localStorage.setItem('sk_look2',JSON.stringify({motion:st.motion,layers:st.layers,lamps:st.lamps}));}catch(e){/* no storage: nothing kept */}};
function apply(){if(MO)MO.on=st.motion;if(!LY)return;const e=st.eased;LY.on=st.layers&&e<3;LY.lamps=st.lamps&&e<1;LY.soft=e<1;LY.focus=e<2;LY.parallax=e<2;}
apply();

// ---------- the rows, under the Phaser view's own ----------
let rows=null,note=null;
const viewOn=()=>typeof PHOST!=='undefined'&&PHOST&&PHOST.mode>0&&!PHOST.err;
function fill(){if(!rows)return;
  rows.querySelectorAll('input[data-lk]').forEach(c=>{const k=c.dataset.lk;
    c.checked=k==='motion'?st.motion:k==='layers'?st.layers&&st.eased<3&&viewOn():st.lamps&&st.layers&&st.eased<1&&viewOn();
    c.disabled=k!=='motion'&&(!viewOn()||k==='lamps'&&!(st.layers&&st.eased<3));});
  note.hidden=!(LY&&st.eased>0&&st.layers);note.textContent=st.eased>=3?'Depth was switched off here: this device could not keep up. Tick it to try again.':'Depth was eased here to keep the frames up. Tick Lamplight or Depth to try again.';}
function panel(){if(rows||typeof FLOW==='undefined'||!FLOW||!FLOW.panel)return;
  const a=FLOW.panel.querySelector('input[data-ph]'),host=a&&a.closest('.fw-parts');if(!host)return;
  const parts=[];if(MO)parts.push(['motion','Drawn movement','Walking, turning and standing drawn from the pose itself']);
  if(LY){parts.push(['layers','Depth','Focus, dust and far scenery that slides. Over Phaser view']);parts.push(['lamps','Lamplight','The lamps light the figures and the ground. Over Depth']);}
  rows=document.createElement('div');rows.className='fw-parts';
  rows.innerHTML=parts.map(([k,n,d])=>'<label class="fw-part"><input type="checkbox" data-lk="'+k+'"><span><b>'+n+'</b><small>'+d+'</small></span></label>').join('');
  note=document.createElement('p');note.className='fw-t';note.style.margin='6px 0 0';note.hidden=true;
  host.parentNode.insertBefore(rows,host.nextSibling);rows.parentNode.insertBefore(note,rows.nextSibling);
  rows.addEventListener('change',e=>{const c=e.target,k=c&&c.dataset&&c.dataset.lk;if(!k)return;e.stopPropagation();st[k]=!!c.checked;
    if(k!=='motion'&&c.checked){st.eased=0;st.hold=true;if(k==='lamps')st.layers=true;}apply();save();fill();});
  fill();}

// ---------- a device that cannot keep up ----------
// The Phaser view keeps the time between frames (PHOST.avg, and PHOST.slow: the share of the last 120 over 20 ms). While the picture
// is in layers and three readings two seconds apart all show most frames slow and the average over 26 ms, the layers are stepped
// down once, for the rest of the visit. A new place is given six seconds first (its pictures are being painted).
let bad=0,quiet=3,lastKey='';
setInterval(()=>{panel();fill();
  if(!LY||st.hold||st.eased>=3||!LY.on||!LY.live||!viewOn()||document.hidden)return;
  const k=typeof envKey==='function'&&envKey()||'';if(k!==lastKey){lastKey=k;quiet=3;bad=0;return;}if(quiet>0){quiet--;return;}
  if(PHOST.avg>26&&PHOST.slow>.6){if(++bad>=3){bad=0;quiet=3;st.eased++;apply();fill();}}else bad=0;},2000);
})();
