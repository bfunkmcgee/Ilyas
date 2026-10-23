// ===== INSURANCE UI START =====
// the log line for the stab, and the sentence in the command preview
V11UI.init.push(()=>{
  S.hooks.insurance=(ex,i)=>{if(!ex||!ex.li)return;const d=document.createElement('div');d.className='lg-perf lg-fin';
    d.textContent=i.kill?`Insurance: ${i.D.name} finished on the way past`:`Insurance: ${i.D.name} stabbed on the way past, ${i.dmg}`;ex.li.appendChild(d);};
});
function insureNote(A,D,k){const E=insurancePreview(A,D,k);return E?`On the way past, ${A.name} stabs ${E.name} on the ground.`:'';}
// ===== INSURANCE UI END =====
