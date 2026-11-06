// ===== THE ORDER DRILL UI START =====
// (since V95) The Order drill on the page: the baton drawn (a black steel expandable baton: the rubber grip and its cap, two tubes
// and the tip), and what the guards shout: "Get back!" as a shove of theirs lands, "Man down!" when a partner falls. Their Cover on their
// plates, the drill's name on their plate's line and the log's line when they first fight in it are sk_stylesui.js's (any man's
// style and meter).
{const dw=drawWeaponAt;drawWeaponAt=function(key,h,t,sd){if(key!=='baton')return dw.apply(this,arguments);
  const wp=WEAPONS.baton,L=Math.hypot(t.x-h.x,t.y-h.y)||1,ux=(t.x-h.x)/L,uy=(t.y-h.y)/L,nx=-uy,ny=ux,n=wp.len;
  const pt=(a,b=0)=>({x:h.x+ux*a+nx*b,y:h.y+uy*a+ny*b});
  ctx.fillStyle=SIL;
  seg(pt(-wp.butt),pt(9),4.4,SIL);circ(pt(-wp.butt),2.5);   // the grip and its cap
  seg(pt(9),pt(n*.58),3,SIL);circ(pt(n*.58),2.1);           // the first tube and its collar
  seg(pt(n*.58),pt(n-2),2.2,SIL);circ(pt(n),2.7);           // the second tube and the tip
  seg(pt(11,.7),pt(n-4,.5),.9,HL);};}
const ORDER_SAY={shove:'Get back!',down:'Man down!'};
V11UI.init.push(()=>{const oh=S.hooks.order;S.hooks.order=function(ev,o){if(oh)oh.apply(this,arguments);const t=ORDER_SAY[ev];
  if(t&&o&&o.A&&!S.warming)S.callouts.push({i:o.A.idx,text:t,age:0,life:1.1,dx:0,dy:-18});};});
// ===== THE ORDER DRILL UI END =====
