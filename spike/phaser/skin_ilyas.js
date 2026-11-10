// ===== ILYAS, IN PIECES (art for the skinned-figure test) =====
// Each piece is an SVG drawing in world units (one unit is one of the game's, at his standing size), facing right, lit from
// in front and above. `box` is its viewBox; the origin of each is the joint it hangs from:
//   arm    shoulder at (0,0), elbow at (ua,0), wrist at (ua+fa,0); +y is his front
//   leg    hip at (0,0), knee at (th,0), ankle at (th+sh,0); +y is his front
//   torso  pelvis at (0,0), chest at (0,-torso); +x is his front
//   head   the rig's head point at (0,0); neck: the chest point at (0,0), up the neck
//   hand   the grip at (0,0), +x down the forearm; shoe: the ankle at (0,0), +x to the toe
//   skirt  a flat sheet, its back edge at x=0 and its front edge at x=w, the waist at y=0 and the hem at the last of rows
// To change how he looks, change these drawings; skin.js fits whatever is here to the ragdoll.
const SkinIlyas = (() => {
  const R = { torso: 47.3, ua: 24.7, fa: 22.85, th: 33.5, sh: 38.6, headR: 10.54 };
  const f = n => (Math.round(n * 100) / 100).toString();
  // a gilt vine: a stem through the points with a small leaf to each side in turn
  function vine(P, o = {}) {
    const step = o.step || 2.5, L = o.leaf || 1.9, W = o.wide || .75; let d = 'M' + P.map(q => f(q[0]) + ',' + f(q[1])).join(' L'), leaves = '', carry = step * .6, side = 1;
    for (let i = 1; i < P.length; i++) { const a = P[i - 1], b = P[i], sl = Math.hypot(b[0] - a[0], b[1] - a[1]); if (sl < 1e-6) continue; const ux = (b[0] - a[0]) / sl, uy = (b[1] - a[1]) / sl;
      while (carry <= sl) { const x = a[0] + ux * carry, y = a[1] + uy * carry, ang = .75 * side, c = Math.cos(ang), s = Math.sin(ang), dx = ux * c - uy * s, dy = ux * s + uy * c, nx = -dy, ny = dx;
        leaves += `M${f(x)},${f(y)} Q${f(x + dx * L * .5 + nx * W)},${f(y + dy * L * .5 + ny * W)} ${f(x + dx * L)},${f(y + dy * L)} Q${f(x + dx * L * .5 - nx * W)},${f(y + dy * L * .5 - ny * W)} ${f(x)},${f(y)}Z`;
        side = -side; carry += step; } carry -= sl; }
    return `<path d="${d}" fill="none" stroke="url(#gold)" stroke-width="${o.sw || .42}" stroke-linecap="round" stroke-linejoin="round"/><path d="${leaves}" fill="url(#gold)"/>`;
  }
  const defs = `<defs>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe6a8"/><stop offset=".5" stop-color="#e2b65a"/><stop offset="1" stop-color="#9c7428"/></linearGradient>
    <linearGradient id="wool" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#06050a"/><stop offset=".45" stop-color="#12101a"/><stop offset=".8" stop-color="#211e30"/><stop offset="1" stop-color="#3a3552"/></linearGradient>
    <linearGradient id="woolX" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#06050a"/><stop offset=".45" stop-color="#12101a"/><stop offset=".8" stop-color="#201d2e"/><stop offset="1" stop-color="#37324e"/></linearGradient>
    <linearGradient id="satin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1a1724"/><stop offset=".45" stop-color="#5a5474"/><stop offset=".6" stop-color="#2a2638"/><stop offset="1" stop-color="#15121d"/></linearGradient>
    <linearGradient id="leather" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b3650"/><stop offset=".35" stop-color="#14121b"/><stop offset="1" stop-color="#050408"/></linearGradient>
    <linearGradient id="skin" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#17131d"/><stop offset=".55" stop-color="#2c2533"/><stop offset="1" stop-color="#4a3e4c"/></linearGradient>
    <linearGradient id="hair" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaea"/><stop offset=".45" stop-color="#ece2c2"/><stop offset="1" stop-color="#a8976f"/></linearGradient>
    <radialGradient id="eyeGlow"><stop offset="0" stop-color="#d9fffa" stop-opacity=".95"/><stop offset=".35" stop-color="#7ff3e3" stop-opacity=".55"/><stop offset="1" stop-color="#45d8c8" stop-opacity="0"/></radialGradient>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation=".9"/></filter>
    <filter id="soft2" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="1.6"/></filter>
  </defs>`;
  const RIM = '#ffcf86';
  const pieces = {};

  // ----- the arm: a tailored sleeve, a gilt band above the cuff, a sliver of shirt at the wrist -----
  { const L = R.ua + R.fa, e = R.ua;
    const out = `M0,-4.4 C-3.4,-4.4 -4.6,-2 -4.6,0 C-4.6,2.2 -3.2,4.5 0,4.5 L${f(e - 5)},3.9 C${f(e - 1)},3.9 ${f(e + 2)},3.7 ${f(e + 5)},3.5 L${f(L - 3)},3.25 L${f(L - 3)},-3.15 L${f(e + 5)},-3.4 C${f(e + 2)},-3.7 ${f(e - 1)},-3.9 ${f(e - 5)},-3.9 Z`;
    pieces.arm = { far: true, box: [-6, -7, L + 10, 14], svg: `
      <path d="${out}" fill="url(#wool)"/>
      <path d="M${f(L - 3)},-2.8 L${f(L - .6)},-2.6 L${f(L - .6)},2.7 L${f(L - 3)},2.9 Z" fill="#8f879c"/><path d="M${f(L - 3)},1.2 L${f(L - .6)},1.1 L${f(L - .6)},2.7 L${f(L - 3)},2.9 Z" fill="#d6cfdc"/>
      <path d="M2,-1 C${f(e * .4)},-2 ${f(e * .8)},-1.8 ${f(e - 2)},-.6" fill="none" stroke="#000" stroke-opacity=".5" stroke-width=".5"/>
      <path d="M${f(e - 3.2)},-3.6 q2.2,2.6 1.4,5.2 M${f(e - .6)},-3.7 q2.4,2.2 2.2,4.6 M${f(e + 2.2)},-3.5 q1.6,1.6 1.8,3.2" fill="none" stroke="#000" stroke-opacity=".55" stroke-width=".45" stroke-linecap="round"/>
      <path d="M${f(e - 2.6)},3.7 q-.6,-1.8 .8,-3 M${f(e + 1)},3.6 q-.2,-1.4 1,-2.2" fill="none" stroke="#6a6488" stroke-opacity=".7" stroke-width=".35" stroke-linecap="round"/>
      <path d="M0,4.5 L${f(e - 5)},3.9 C${f(e - 1)},3.9 ${f(e + 2)},3.7 ${f(e + 5)},3.5 L${f(L - 3)},3.25" fill="none" stroke="${RIM}" stroke-opacity=".9" stroke-width=".55" stroke-linecap="round"/>
      <rect x="${f(L - 7.4)}" y="-3.35" width=".7" height="6.75" fill="url(#gold)"/><rect x="${f(L - 4.6)}" y="-3.3" width=".7" height="6.65" fill="url(#gold)"/>
      ${vine([[L - 6.2, -2.6], [L - 6.2, 2.8]], { step: 1.5, leaf: 1.2, wide: .5, sw: .28 })}
      <circle cx="${f(L - 5.6)}" cy="2.2" r=".55" fill="#ffe6a8"/>` };
    // the hand: a black glove closed on the grip, a gilt signet
    pieces.hand = { far: true, box: [-4, -5, 11, 10], svg: `
      <path d="M-1.6,-3 C1,-3.6 4.4,-3.4 5.2,-1.6 C5.9,0 5.6,2 4.6,3 C3,4.2 0,4 -1.6,3.2 Z" fill="url(#leather)"/>
      <path d="M2.2,-3.2 q.9,3 0,6.6 M3.7,-2.6 q.8,2.4 0,5.4 M.8,-3.2 q.8,3 0,6.6" fill="none" stroke="#000" stroke-opacity=".7" stroke-width=".35"/>
      <path d="M-1.6,3.2 C0,4 3,4.2 4.6,3 C5.6,2 5.9,0 5.2,-1.6" fill="none" stroke="${RIM}" stroke-opacity=".65" stroke-width=".4" stroke-linecap="round"/>
      <rect x="1.1" y="2.2" width="1.5" height="1.5" rx=".3" fill="url(#gold)"/><circle cx="1.85" cy="2.95" r=".35" fill="#7ff3e3"/>` };
  }

  // ----- the leg: a pressed trouser leg with its crease, a turned cuff -----
  { const L = R.th + R.sh, k = R.th;
    const out = `M0,-6 C-4.6,-6 -6,-3 -6,0 C-6,3.2 -4.4,6 0,6 C${f(k * .5)},5.6 ${f(k - 6)},4.7 ${f(k)},4.5 C${f(k + 8)},4.2 ${f(k + 20)},3.6 ${f(L - 2.4)},3.35 L${f(L - 2.4)},-3.2 C${f(k + 20)},-3.4 ${f(k + 8)},-3.9 ${f(k)},-4.2 C${f(k - 6)},-4.5 ${f(k * .5)},-5.4 0,-6 Z`;
    pieces.leg = { far: true, box: [-7, -8, L + 10, 16], svg: `
      <path d="${out}" fill="url(#wool)"/>
      <path d="M2,1.6 C${f(k * .5)},1.5 ${f(k)},1.1 ${f(L - 3)},.8" fill="none" stroke="#5c5678" stroke-opacity=".8" stroke-width=".4"/>
      <path d="M2,1 C${f(k * .5)},.9 ${f(k)},.5 ${f(L - 3)},.2" fill="none" stroke="#000" stroke-opacity=".5" stroke-width=".4"/>
      <path d="M${f(k - 3.6)},-4.2 q3,2.6 2.4,6 M${f(k - .4)},-4.1 q2.8,2.4 2.6,5.2 M${f(k + 3)},-3.9 q1.8,1.6 2,3.4" fill="none" stroke="#000" stroke-opacity=".5" stroke-width=".5" stroke-linecap="round"/>
      <path d="M${f(k - 3)},4.5 q-.8,-2 .8,-3.4" fill="none" stroke="#6a6488" stroke-opacity=".7" stroke-width=".35" stroke-linecap="round"/>
      <path d="M0,6 C${f(k * .5)},5.6 ${f(k - 6)},4.7 ${f(k)},4.5 C${f(k + 8)},4.2 ${f(k + 20)},3.6 ${f(L - 2.4)},3.35" fill="none" stroke="${RIM}" stroke-opacity=".85" stroke-width=".55" stroke-linecap="round"/>
      <path d="M${f(L - 5)},-3.3 L${f(L - 2.2)},-3.35 L${f(L - 2.2)},3.5 L${f(L - 5)},3.45 Z" fill="#1b1826"/><path d="M${f(L - 5)},-3.3 L${f(L - 5)},3.45" stroke="#000" stroke-opacity=".7" stroke-width=".35"/>
      <path d="M${f(L - 5)},3.45 L${f(L - 2.2)},3.5" stroke="${RIM}" stroke-opacity=".7" stroke-width=".4"/>` };
    // the shoe: a slim black Oxford, a toe cap, a gilt heel plate
    pieces.shoe = { far: true, box: [-6, -5, 21, 11], svg: `
      <path d="M-3.4,-2.6 C-1,-3.4 2,-3.2 3.2,-2.2 C5.4,-.6 9.4,.2 11.4,1.6 C12.6,2.4 12.6,3.6 11.6,3.6 L-3.6,3.6 C-4.2,1.6 -4.2,-1 -3.4,-2.6 Z" fill="url(#leather)"/>
      <path d="M-3.8,2.9 L11.9,2.9 L11.6,3.7 L-3.7,3.7 Z" fill="#000"/>
      <path d="M7.4,.5 q-1,1.4 -.6,2.4" fill="none" stroke="#5c5678" stroke-width=".35"/>
      <path d="M3.2,-2.2 C5.4,-.6 9.4,.2 11.4,1.6" fill="none" stroke="${RIM}" stroke-opacity=".75" stroke-width=".4" stroke-linecap="round"/>
      <path d="M8.2,.9 q1.6,.3 2.6,1.1" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width=".5" stroke-linecap="round"/>
      <path d="M-3.9,1.4 L-1.4,1.4 L-1.4,2.9 L-3.8,2.9 Z" fill="url(#gold)"/>` };
  }

  // ----- the torso: the coat's body, a satin lapel, the vine down its edge, the waistcoat and the tie in the opening -----
  { const T = R.torso;
    const body = `M-8.6,8 C-10.2,3 -9.6,-4 -8,-12 C-6.4,-19 -6.6,-25 -8.2,-33 C-9.4,-40 -8.6,-46 -5.4,-${f(T + 4.2)} C-3.4,-${f(T + 6.4)} 1.4,-${f(T + 6.6)} 3.6,-${f(T + 4.6)} C6.6,-${f(T + 1)} 9,-41 9.2,-35 C9.4,-28 7,-22 7,-16 C7,-9 9,-3 8.6,4 C8.4,7 7,9.4 4,9.6 L-5,9.6 C-7,9.6 -8,9 -8.6,8 Z`;
    const lapelEdge = [[4.4, -T - 3.2], [6.8, -42], [8.2, -35], [7.6, -28], [6.2, -21], [6.3, -15], [7.4, -8], [8.1, -1], [8, 5]];
    pieces.torso = { box: [-14, -(T + 12), 28, T + 24], svg: `
      <path d="${body}" fill="url(#woolX)"/>
      <path d="M3,-${f(T + 3.4)} L7.6,-37 L6.6,-27 L5.2,-22 L2.2,-33 Z" fill="#0a0910"/>
      <path d="M3.2,-${f(T + 3)} L5.6,-${f(T - 3)} L4.8,-30 L4,-24 L2.6,-34 Z" fill="#1c3b3a"/><path d="M3.6,-${f(T + 2)} L4.8,-${f(T - 2)} L4.3,-31" fill="none" stroke="#45d8c8" stroke-opacity=".8" stroke-width=".35"/>
      <path d="M2.4,-${f(T + 4.4)} C4.6,-${f(T + 2)} 7.4,-42 8.6,-36 C8.8,-31 7.4,-25 6.2,-21 C4.6,-26 2.6,-33 1.6,-40 C1.2,-43 1.4,-46 2.4,-${f(T + 4.4)} Z" fill="url(#satin)"/>
      <path d="M1.6,-40 C2.6,-33 4.6,-26 6.2,-21" fill="none" stroke="#000" stroke-opacity=".7" stroke-width=".4"/>
      <path d="M6.6,-39 L4.4,-37.4 L7.9,-34.6" fill="none" stroke="#000" stroke-opacity=".6" stroke-width=".4"/>
      <path d="M-5.4,-${f(T + 4.2)} C-3.4,-${f(T + 6.4)} 1.4,-${f(T + 6.6)} 3.6,-${f(T + 4.6)} L2.6,-${f(T + 2.2)} C1,-${f(T + 4)} -2.6,-${f(T + 4)} -4.6,-${f(T + 2)} Z" fill="#1d1a28"/>
      <path d="M-4.6,-${f(T + 2)} C-2.6,-${f(T + 4)} 1,-${f(T + 4)} 2.6,-${f(T + 2.2)}" fill="none" stroke="url(#gold)" stroke-width=".5"/>
      <path d="M-7.9,-12 C-3,-10.6 3,-10.6 7,-12.4 L7,-10.6 C3,-8.8 -3,-8.8 -8.1,-10.2 Z" fill="#07060a"/><rect x="4.6" y="-12.3" width="1.9" height="1.9" rx=".3" fill="url(#gold)"/>
      <path d="M-2.4,-${f(T - 1)} C-4.6,-42 -5.4,-36 -4.6,-30" fill="none" stroke="#000" stroke-opacity=".55" stroke-width=".5"/>
      <path d="M-3.2,-${f(T - 3)} C-1.4,-${f(T - 9)} -1.4,-${f(T - 15)} -3,-${f(T - 20)}" fill="none" stroke="#4a4466" stroke-opacity=".6" stroke-width=".4"/>
      <path d="M-6.4,-22 C-5,-17 -5,-10 -6.4,-3" fill="none" stroke="#000" stroke-opacity=".5" stroke-width=".45"/>
      <path d="M-1.4,-9 C-.6,-4 -.6,2 -1.2,9" fill="none" stroke="#000" stroke-opacity=".4" stroke-width=".4"/>
      ${vine(lapelEdge, { step: 2.6, leaf: 2, wide: .8, sw: .45 })}
      <circle cx="5.2" cy="-18" r=".75" fill="url(#gold)"/><circle cx="5.6" cy="-14.4" r=".75" fill="url(#gold)"/>
      <path d="M2.2,-31.6 l2.6,-.5 l.2,1.5 l-2.5,.5 Z" fill="#45d8c8"/><path d="M2.5,-32.6 l1,.9 l.9,-1.3 l.5,1.1" fill="none" stroke="#7ff3e3" stroke-width=".4"/>
      <path d="M3.6,-${f(T + 4.6)} C6.6,-${f(T + 1)} 9,-41 9.2,-35 C9.4,-28 7,-22 7,-16 C7,-9 9,-3 8.6,4" fill="none" stroke="${RIM}" stroke-opacity=".8" stroke-width=".55" stroke-linecap="round"/>
      <path d="M-5.4,-${f(T + 4.2)} C-3.4,-${f(T + 6.4)} 1.4,-${f(T + 6.6)} 3.6,-${f(T + 4.6)}" fill="none" stroke="${RIM}" stroke-opacity=".85" stroke-width=".55" stroke-linecap="round"/>` };
    // the neck: in shadow under the jaw, the shirt's stand collar round its base
    pieces.neck = { box: [-6, -18, 12, 22], svg: `
      <path d="M-2.9,2 L-2.5,-15 L2.6,-15 L3.1,2 Z" fill="url(#skin)"/><path d="M-2.9,2 L-2.5,-15 L.2,-15 L-.4,2 Z" fill="#000" fill-opacity=".35"/>
      <path d="M3.1,2 L2.6,-15" stroke="${RIM}" stroke-opacity=".35" stroke-width=".4"/>` };
  }

  // ----- the head: a long elven profile, the ear swept back with a gilt cuff, the hair combed back into blades, the eye alight -----
  pieces.head = { box: [-25, -24, 41, 40], svg: `
    <g filter="url(#soft2)" opacity=".5"><path d="M5,-9 C0,-16 -8,-17 -20,-15 C-14,-11 -18,-8 -22,-6 C-16,-4 -16,0 -18,3 C-10,2 -6,-2 2,-6 Z" fill="#fff3c8"/></g>
    <path d="M2,-9.8 C4.6,-9.4 6.4,-7.4 7,-5.2 C7.5,-3.4 8.6,-2.6 8.5,-1.6 C8.4,-.9 7.9,-.6 8.1,0 C9,1.2 10.4,2.4 10.6,3.1 C10.7,3.7 9.6,3.9 8.8,3.9 C8.6,4.5 9.2,5 9,5.5 C8.8,5.9 8.2,6 8.3,6.4 C8.5,6.9 8.8,7.2 8.5,7.8 C8.1,8.8 8,9.8 7.2,10.2 C6,10.8 4.4,10.5 2.8,9.6 C1.2,8.8 -.6,8.4 -1.8,7.2 C-2.8,6.4 -4.6,6.2 -5.8,5.4 C-7.6,3 -8.2,-1 -7.6,-4 C-7,-7.2 -4,-10.2 2,-9.8 Z" fill="url(#skin)"/>
    <path d="M-1.8,7.2 C.6,6.6 3.4,7.2 7.2,10.2 C6,10.8 4.4,10.5 2.8,9.6 C1.2,8.8 -.6,8.4 -1.8,7.2 Z" fill="#000" fill-opacity=".45"/>
    <path d="M-5.8,5.4 C-3,4.6 -1.4,2 -1,-1 L-7.6,-4 C-8.2,-1 -7.6,3 -5.8,5.4 Z" fill="#000" fill-opacity=".4"/>
    <ellipse cx="4.6" cy="3.4" rx="2.6" ry="1.5" fill="#6a5a66" opacity=".35" filter="url(#soft)"/>
    <path d="M7,-5.2 C7.5,-3.4 8.6,-2.6 8.5,-1.6 C8.4,-.9 7.9,-.6 8.1,0 C9,1.2 10.4,2.4 10.6,3.1 C10.7,3.7 9.6,3.9 8.8,3.9 C8.6,4.5 9.2,5 9,5.5 C8.8,5.9 8.2,6 8.3,6.4 C8.5,6.9 8.8,7.2 8.5,7.8 C8.1,8.8 8,9.8 7.2,10.2" fill="none" stroke="${RIM}" stroke-opacity=".8" stroke-width=".45" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M8.3,6.3 L6.4,6.5" stroke="#000" stroke-opacity=".8" stroke-width=".4" stroke-linecap="round"/><path d="M9.3,3.5 q-.6,.3 -1,-.1" fill="none" stroke="#000" stroke-opacity=".7" stroke-width=".35"/>
    <circle cx="5.9" cy="-.5" r="4.2" fill="url(#eyeGlow)"/>
    <path d="M3.9,-.4 C4.9,-1.5 6.9,-1.6 8,-.7 C7,.3 5,.4 3.9,-.4 Z" fill="#d9fffa"/><path d="M3.6,-.5 C4.8,-1.9 7.2,-2 8.3,-.8" fill="none" stroke="#06050a" stroke-width=".5" stroke-linecap="round"/>
    <path d="M2.6,-2.9 C4.6,-3.9 7,-3.6 8.6,-2.4" fill="none" stroke="#0a0810" stroke-width=".85" stroke-linecap="round"/>
    <path d="M6.6,-6.4 C5.4,-9.6 2.6,-12 -1,-12.6 C-7,-13.4 -13,-13 -21,-15.4 C-17,-12.4 -13.6,-11.4 -10,-10.4 C-14,-9.8 -18.6,-9 -23,-5.8 C-18,-6.6 -14,-6.6 -10.6,-6 C-13.6,-4.2 -16.6,-1.4 -18.6,2.8 C-14.6,0 -10.6,-2 -7,-2.8 C-8.6,-.4 -9.6,2.2 -9.8,5.4 C-7.6,2.6 -5,.4 -2.4,-1.4 C-.6,-2.6 .4,-4 1,-5.4 C2.6,-6.6 4.6,-7 6.6,-6.4 Z" fill="url(#hair)"/>
    <path d="M4.6,-8.6 C2,-12.6 -4,-15 -9.4,-18.6 C-7,-15 -4.6,-13.4 -2,-12 Z M1.6,-10.4 C-1,-14.6 -3,-17 -3.6,-20.6 C-1.4,-17.4 2,-14 4.2,-10.2 Z" fill="url(#hair)"/>
    <path d="M5.4,-7.2 C1,-10.4 -6,-11 -15,-12.6 M3,-6.4 C-3,-8.4 -10,-8 -18,-6.8 M.6,-4.8 C-5,-5 -10,-3 -15,-.2 M-1.4,-3 C-4.6,-1.4 -7,1 -8.6,3.4" fill="none" stroke="#8f8060" stroke-opacity=".75" stroke-width=".4" stroke-linecap="round"/>
    <path d="M5.8,-7.8 C2.4,-11.4 -3,-12.4 -9,-13" fill="none" stroke="#fffaea" stroke-width=".55" stroke-linecap="round"/>
    <path d="M.6,-.9 C-3,-3.6 -7,-6.6 -12.6,-9.4 C-10.4,-5.6 -7.4,-2 -4.4,1.2 C-3,2.8 -2.2,4.2 -1.6,4.8 C-.4,3.6 .9,1.2 .6,-.9 Z" fill="url(#skin)"/>
    <path d="M-.4,.2 C-3.4,-2.2 -6.6,-4.8 -10.4,-7.4" fill="none" stroke="#000" stroke-opacity=".6" stroke-width=".5" stroke-linecap="round"/>
    <path d="M.6,-.9 C-3,-3.6 -7,-6.6 -12.6,-9.4" fill="none" stroke="${RIM}" stroke-opacity=".7" stroke-width=".4" stroke-linecap="round"/>
    <path d="M-6.4,-5.9 l1.5,1.9 l-1.3,1 l-1.5,-1.9 Z" fill="url(#gold)"/><path d="M-9,-7.7 l1.1,1.5 l-1,.8 l-1.1,-1.5 Z" fill="url(#gold)"/>
    <circle cx="-1.5" cy="5.4" r=".8" fill="#7ff3e3"/><circle cx="-1.5" cy="5.4" r="1.6" fill="#7ff3e3" opacity=".3"/>
    <path d="M1,-5.4 C1.6,-3.4 1.6,-1.6 .8,.6 C2.6,-1 3.4,-3.4 3,-6.2 Z" fill="url(#hair)"/>` };

  // ----- the coat's skirt: a flat sheet of the cloth, the vine down its front edge and along the hem, the folds down it -----
  const skirt = { w: 22, rows: [0, 14, 29.5, 45, 60] };
  { const w = skirt.w, h = 60;
    pieces.skirt = { box: [0, 0, w, h], svg: `
      <rect x="0" y="0" width="${w}" height="${h}" fill="url(#woolX)"/>
      <g filter="url(#soft)"><path d="M4.4,6 L5.6,${h} L3.4,${h} Z M10.6,10 L12.4,${h} L9.8,${h} Z M16,8 L17.6,${h} L15,${h} Z" fill="#000" fill-opacity=".55"/>
      <path d="M7,8 L8.6,${h} L7.4,${h} Z M13.4,10 L14.6,${h} L13.6,${h} Z" fill="#4a4466" fill-opacity=".5"/></g>
      <rect x="${w - 1}" y="0" width="1" height="${h}" fill="${RIM}" fill-opacity=".45"/>
      ${vine([[w - 2.4, 0], [w - 2.4, h - 3.4]], { step: 2.6, leaf: 2, wide: .8, sw: .45 })}
      ${vine([[w - 2.4, h - 2.6], [1.2, h - 2.6]], { step: 2.4, leaf: 1.9, wide: .75, sw: .45 })}
      <rect x="0" y="${h - 1}" width="${w}" height="1" fill="url(#gold)" fill-opacity=".85"/>` };
  }
  return { rest: R, defs, pieces, skirt, far: 'rgba(52,40,78,.6)' };
})();
