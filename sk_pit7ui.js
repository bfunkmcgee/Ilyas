// ===== ACT I, SCENE 7 UI =====
// (loaded ahead of the main UI script; everything here runs only once the UI is up)
// Tamm's fight is the engine's, played for him to watch: while it runs the dock and the target buttons are put away (.a1-watch on
// the page), and the moves' names come up as the engine's own popups (sk_short.js).
const A7W={on:false};
V11UI.tick.push(()=>{const st=act1Stage(),W=document.getElementById('wrap');if(!W||!W.classList)return;
  const on=!!st&&st.key==='tamm';if(A7W.on!==on){A7W.on=on;W.classList.toggle('a1-watch',on);}});
// ===== ACT I, SCENE 7 UI END =====
