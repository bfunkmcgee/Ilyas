// ===== GEAR UI =====
// (loaded ahead of the main UI script, and ahead of the crate's screen, sk_pit2ui.js, the Shelf's stalls, sk_pit5ui.js, and the menu,
// sk_pitmenuui.js, which use it; everything here reads the game and changes nothing)
// What the gear's screens share (since V97): a thing's short line (what it stops and where, its holds and its weight), and the sum of
// what he wears: what it takes off a cut, a thrust and a blunt blow on his head, his body and his legs, what he carries and what it
// costs his pace, and his holds against a disarm, a sweep and a grab, each marked with what the last change did to it.

function gearNum(v){return String(Math.round(v*10)/10);}
function gearSigned(v){return v>0?'+'+gearNum(v):v<0?'−'+gearNum(-v):'0';}
// a thing's short line: "Body: Cut 2 Thrust 3 Blunt 1 · Wt 3.5"
function gearTag(id){const g=GEAR[id];if(!g)return'';const out=[];
  if(g.def){const k=GEAR_KINDS.filter(k=>g.def[k]).map(k=>GEAR_KIND_NAME[k]+' '+g.def[k]).join(' ');
    if(k)out.push((g.cover||[]).map(z=>GEAR_ZONE_NAME[z]).join(', ')+': '+k);}
  if(g.grip)out.push('Disarm '+gearSigned(g.grip));
  if(g.footing)out.push('Sweep '+gearSigned(g.footing));
  if(g.snag)out.push('Grab '+gearSigned(g.snag));
  out.push('Wt '+gearNum(g.wt||0));
  return out.join(' · ');}
// how much slower every move is for what he carries (a whole percent)
function gearSlow(st){return Math.round((st.pace-1)*100);}
// the sum (st: gearStats; was: the sum before the last change, to mark what it did: better or worse)
function gearSumHtml(st,was){
  const mark=(dv,good)=>dv?`<i class="gs-d ${(good?dv>0:dv<0)?'gs-up':'gs-dn'}">${gearSigned(dv)}</i>`:'';
  const dz=(a,b)=>was?Math.round((a-b)*10)/10:0;
  let h='<div class="gs"><table class="gs-t"><caption>Off each blow</caption><thead><tr><td></td>'+GEAR_KINDS.map(k=>`<th scope="col">${GEAR_KIND_NAME[k]}</th>`).join('')+'</tr></thead><tbody>';
  for(const z of GEAR_ZONES)h+=`<tr><th scope="row">${GEAR_ZONE_NAME[z]}</th>`+GEAR_KINDS.map(k=>{const v=st.def[z][k];
    return`<td${v?'':' class="gs-0"'}>${v||'0'}${mark(dz(v,was?was.def[z][k]:0),true)}</td>`;}).join('')+'</tr>';
  h+='</tbody></table><dl class="gs-x">';
  const row=(k,v,cls='')=>`<div class="gs-r${cls}"><dt>${k}</dt><dd>${v}</dd></div>`;
  const sl=gearSlow(st),sl0=was?gearSlow(was):sl;
  h+=row('Weight',`${gearNum(st.wt)}${mark(dz(st.wt,was?was.wt:0),false)}<span class="gs-s"> of ${GEAR_FREE} free</span>`,st.wt>GEAR_FREE?' gs-over':'');
  h+=row('Pace',(sl?sl+'% slower':'Full')+mark(was?sl-sl0:0,false),sl?' gs-over':'');
  h+=row('Against a disarm',gearSigned(st.grip)+mark(dz(st.grip,was?was.grip:0),true));
  h+=row('Against a sweep',gearSigned(st.footing)+mark(dz(st.footing,was?was.footing:0),true));
  h+=row('Against a grab',gearSigned(st.snag)+mark(dz(st.snag,was?was.snag:0),true));
  return h+'</dl></div>';}
// one thing at length: its name, its words, and what it does
function gearDetHtml(id){const g=GEAR[id];if(!g)return'';const L=gearLines(id);
  return`<p class="gd-n">${g.name}<span class="gd-wt">Weight ${gearNum(g.wt||0)}</span></p><p class="gd-w">${g.what}</p>`+
    `<p class="gd-g">${L.length?L.join('. ')+'.':'It stops nothing.'}</p>`;}
// what the screens say before a thing is picked
const GEAR_HOW='What he wears takes something off each blow that lands where it covers him. Past '+GEAR_FREE+' in weight, every move is slower.';
// ===== GEAR UI END =====
