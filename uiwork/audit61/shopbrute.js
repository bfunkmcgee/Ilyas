// every sequence of purchases at the Shelf: with the guard on the extras only, can the list still be stranded?
const STALLS={oil:[{id:'oil',chit:1,list:'oil'},{id:'oilcheap',coin:2,list:'oil'}],grain:[{id:'rice',coin:3,list:'rice'},{id:'salt',coin:1,list:'salt'}],
  linen:[{id:'linen',coin:2,list:'linen'}],nim:[{id:'valve',coin:3,list:'valve'}],grind:[{id:'salve',coin:2},{id:'whet',coin:1}]};
const LIST=['oil','rice','salt','valve','linen'];
const ways=g=>{const w=[];const c=g.coin??null,h=g.chit??(c!=null?Math.ceil(c/2):null);if(c!=null&&!(g.chit&&g.coin==null))w.push(['coin',c]);if(h!=null)w.push(['chit',h]);return w;};
function affords(got,coin,chits){const left=LIST.filter(l=>!got[l]);const W=left.map(l=>{const w=[];for(const s in STALLS)for(const g of STALLS[s])if(g.list===l)for(const [p,n] of ways(g))w.push(p==='coin'?[n,0]:[0,n]);return w;});
  const go=(i,c,h)=>i>=W.length||W[i].some(([a,b])=>a<=c&&b<=h&&go(i+1,c-a,h-b));return go(0,coin,chits);}
const seen=new Set();let strand=[],states=0;
function rec(st,path,guardAll){const key=JSON.stringify(st);if(seen.has(key))return;seen.add(key);states++;
  const done=LIST.every(l=>st.got[l]);if(done)return;
  let any=false;
  for(const s in STALLS)for(const g of STALLS[s]){if(g.list&&st.got[g.list])continue;if(g.id==='whet'&&st.sharp)continue;if(g.id==='salve'&&st.salve>=4)continue;
    for(const [p,n] of ways(g)){const c=st.coin-(p==='coin'?n:0),h=st.chits-(p==='chit'?n:0);if(c<0||h<0)continue;
      const got={...st.got};if(g.list)got[g.list]=true;
      if((!g.list||guardAll)&&!affords(got,c,h))continue;
      if(g.list)any=true;
      rec({coin:c,chits:h,got,sharp:st.sharp||g.id==='whet',salve:st.salve+(g.id==='salve'?1:0)},path.concat(g.id+'/'+p),guardAll);}}
  if(!any&&!done)strand.push(path.join(' '));}
for(const guardAll of [false,true]){seen.clear();strand=[];states=0;rec({coin:12,chits:3,got:{},sharp:false,salve:0},[],guardAll);
  console.log((guardAll?'guard on every buy':'guard on the extras only')+': states',states,'stranded',strand.length,strand.slice(0,3));}
// and with no guard at all
{const s0=[];let n=0;const sn=new Set();(function r(st,path){const k=JSON.stringify(st);if(sn.has(k))return;sn.add(k);n++;if(LIST.every(l=>st.got[l]))return;let any=false;
  for(const s in STALLS)for(const g of STALLS[s]){if(g.list&&st.got[g.list])continue;if(g.id==='whet'&&st.sharp)continue;if(g.id==='salve'&&st.salve>=4)continue;
    for(const [p,q] of ways(g)){const c=st.coin-(p==='coin'?q:0),h=st.chits-(p==='chit'?q:0);if(c<0||h<0)continue;const got={...st.got};if(g.list){got[g.list]=true;any=true;}
      r({coin:c,chits:h,got,sharp:st.sharp||g.id==='whet',salve:st.salve+(g.id==='salve'?1:0)},path.concat(g.id+'/'+p));}}
  if(!any)s0.push(path.join(' '));})({coin:12,chits:3,got:{},sharp:false,salve:0},[]);console.log('no guard: states',n,'stranded',s0.length,s0.slice(0,2));}
