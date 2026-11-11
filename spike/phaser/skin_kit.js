// ===== SKIN ART KIT (art for the skinned-figure test) =====
// What every drawing of Ilyas is made with: the pieces' registry, the materials (one set of gradients for the suit and the gilt of
// the prologue, one for the soot, oilcloth and rust of the Pit), and the small helpers the drawings share. A piece is an SVG drawing
// in world units (one unit is one of the game's, at his standing size), facing right, lit softly from in front; the light's own edge
// (the rim) is put on when he is drawn, from where the scene's light is, and is not in the drawings of anything that bends or turns.
//
// Frames, by kind of piece (skin.js fits each to the ragdoll):
//   strip   a limb, one drawing along +x: the first joint at (0,0), the middle one at (L0,0), the last at (L0+L1,0); +y is his front.
//           prof: [[u, half-width to the front, half-width to the back], ...] is its outline, for the rim
//   torso   a layer of the torso in profile: the pelvis at (0,0), the chest at (0,-R.torso); +x is his front. out: {back, front}:
//           its outline as [a up the spine, s across] (turned, the same drawing is wrapped round the body on these)
//   rigid   a stiff piece on a joint: that joint at (0,0); hands and shoes with +x along them, heads with the face toward +x
//   sheet   a flat sheet of cloth stretched over a grid (the coat's skirt)
const SkinArt = (() => {
  const R = { torso: 47.3, ua: 24.7, fa: 22.85, th: 33.5, sh: 38.6, headR: 10.54 };
  const pieces = {};
  const def = (name, box, svg, meta = {}) => { pieces[name] = Object.assign({ name, box, svg }, meta); return pieces[name]; };
  const f = n => (Math.round(n * 100) / 100).toString(), pt = (x, y) => f(x) + ',' + f(y);
  // ---------- paths ----------
  const P = (d, fill, x = '') => `<path d="${d}" fill="${fill}" ${x}/>`;
  const L = (d, stroke, w, x = '') => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${x}/>`;
  const poly = (Q, close = true) => 'M' + Q.map(q => pt(q[0], q[1])).join(' L') + (close ? 'Z' : '');
  // a smooth line through points (Catmull-Rom as cubics); closed: round the whole loop
  function curve(Q, closed = false, k = .5) { const n = Q.length, g = i => closed ? Q[((i % n) + n) % n] : Q[Math.max(0, Math.min(n - 1, i))]; let d = 'M' + pt(Q[0][0], Q[0][1]);
    for (let i = 0; i < (closed ? n : n - 1); i++) { const a = g(i - 1), b = g(i), c = g(i + 1), e = g(i + 2);
      d += ' C' + pt(b[0] + (c[0] - a[0]) * k / 3, b[1] + (c[1] - a[1]) * k / 3) + ' ' + pt(c[0] - (e[0] - b[0]) * k / 3, c[1] - (e[1] - b[1]) * k / 3) + ' ' + pt(c[0], c[1]); }
    return d + (closed ? 'Z' : ''); }
  // points along a polyline, every `step`, with the way the line runs there
  function along(Q, step, start = step / 2) { const out = []; let carry = start;
    for (let i = 1; i < Q.length; i++) { const a = Q[i - 1], b = Q[i], sl = Math.hypot(b[0] - a[0], b[1] - a[1]); if (sl < 1e-6) continue; const ux = (b[0] - a[0]) / sl, uy = (b[1] - a[1]) / sl;
      while (carry <= sl) { out.push({ x: a[0] + ux * carry, y: a[1] + uy * carry, ux, uy }); carry += step; } carry -= sl; }
    return out; }
  // a gilt vine: a stem through the points with a small leaf to each side in turn (col: its paint, the gilt by default)
  function vine(Q, o = {}) { const Lf = o.leaf || 1.9, W = o.wide || .75, col = o.col || 'url(#gold)'; let leaves = '', side = 1;
    for (const q of along(Q, o.step || 2.5, (o.step || 2.5) * .6)) { const ang = .75 * side, c = Math.cos(ang), s = Math.sin(ang), dx = q.ux * c - q.uy * s, dy = q.ux * s + q.uy * c, nx = -dy, ny = dx;
      leaves += `M${pt(q.x, q.y)} Q${pt(q.x + dx * Lf * .5 + nx * W, q.y + dy * Lf * .5 + ny * W)} ${pt(q.x + dx * Lf, q.y + dy * Lf)} Q${pt(q.x + dx * Lf * .5 - nx * W, q.y + dy * Lf * .5 - ny * W)} ${pt(q.x, q.y)}Z`; side = -side; }
    return L(o.smooth ? curve(Q) : poly(Q, false), col, o.sw || .42) + P(leaves, col); }
  // a value read off a table of [x, y...] rows at x (straight between rows, held past the ends)
  function tab(T, x, j = 1) { if (x <= T[0][0]) return T[0][j]; for (let i = 1; i < T.length; i++) if (x <= T[i][0]) { const a = T[i - 1], b = T[i], t = (x - a[0]) / ((b[0] - a[0]) || 1); return a[j] + (b[j] - a[j]) * t; } return T[T.length - 1][j]; }
  // ---------- strips (limbs) ----------
  // the outline of a strip from its profile rows [u, front, back]: round the front edge and back along the other
  const stripPath = prof => curve([...prof.map(r => [r[0], r[1]]), ...prof.slice().reverse().map(r => [r[0], -r[2]])], true, .5);
  const stripBox = (prof, pad = 2) => { let u0 = 1e9, u1 = -1e9, h = 0; for (const r of prof) { u0 = Math.min(u0, r[0]); u1 = Math.max(u1, r[0]); h = Math.max(h, r[1], r[2]); } return [u0 - pad, -h - pad, u1 - u0 + 2 * pad, 2 * h + 2 * pad]; };
  // ---------- the torso's layers ----------
  // out: {back: [[a, s], ...] up the back, top: [[a, s], ...] over the top from the back to the front, front: [[a, s], ...] down the
  // front}; the drawing's own coordinates are x = s, y = -a
  const outPts = o => [...o.back, ...(o.top || []), ...o.front].map(q => [q[1], -q[0]]);
  const outPath = o => curve(outPts(o), true, .5);
  // the outline's reach at a height: [the back's s, the front's s], or null where the layer is not
  function reach(o, a) { const B = o.back, Fr = o.front, lo = Math.min(B[0][0], Fr[Fr.length - 1][0]), hi = Math.max(B[B.length - 1][0], Fr[0][0]); if (a < lo - 1e-6 || a > hi + 1e-6) return null;
    const at = (Q, up) => { const T2 = up ? Q : Q.slice().reverse(); return tab(T2, a); };
    return [at(B, true), at(Fr, false)]; }
  // ---------- materials ----------
  // each: its tones from the shade to the light; `m-name` runs them across y (a strip, lit toward +y), `mx-name` across x (the torso)
  const MATS = {
    // the prologue: wool, satin, leather, gilt
    wool: ['#06050a', '#12101a', '#1f1c2c', '#322e46'], satin: ['#15121d', '#2a2638', '#5a5474', '#1a1724'], leather: ['#050408', '#14121b', '#2c283a', '#3b3650'],
    skin: ['#15111b', '#221c2a', '#352c3a', '#4a3e4c'], shirtn: ['#6a6378', '#8f879c', '#b9b1c6', '#d6cfdc'], vest: ['#0b0c12', '#15161f', '#232534', '#33364a'],
    plate: ['#141520', '#1f2130', '#343849', '#4a4f66'], band: ['#0c0705', '#1f1610', '#34261c', '#463426'], tie: ['#0c2423', '#17403d', '#236a64', '#2f8a82'],
    // the Pit: soot, oilcloth and rust
    soot: ['#080605', '#15110e', '#272018', '#3a3024'], shirt: ['#1a1814', '#2f2c26', '#48443a', '#5c574b'], jersey: ['#0e0f13', '#1c1d24', '#2d2f3a', '#3c3e4b'],
    under: ['#2a2721', '#423e36', '#575146', '#6a6356'], coat: ['#0a0b07', '#181a12', '#292d1f', '#3c412f'], canvas: ['#1b1811', '#2f2a1f', '#453e2f', '#584f3e'],
    scarf: ['#4a2214', '#7c3b1f', '#96492a', '#b05a36'], linen: ['#8e8776', '#bdb4a0', '#d4ccb8', '#e6dfcc'], glove: ['#0d0906', '#1d140d', '#2f2318', '#3e2f21'],
    rope: ['#433827', '#5c4c33', '#746143', '#8a7452'], jerkin: ['#150e09', '#261b12', '#3a2b1e', '#4c3a2a'], stab: ['#0b0c10', '#15181e', '#252a33', '#343a46'],
    tyre: ['#090909', '#141414', '#242424', '#343434'], cap: ['#0c0c0f', '#17171b', '#28282e', '#38383f'], helmet: ['#1b1c1a', '#2e2f2c', '#454642', '#5c5d58'],
    shin: ['#0a0a0a', '#151515', '#262626', '#363636'], boot: ['#150e09', '#2a1e15', '#3f2f22', '#57422f'], dock: ['#0e0b08', '#1c1611', '#2f251c', '#423528'],
    hide: ['#211a14', '#352a21', '#4b3d30', '#5f4e3e'] };
  const grad = (id, st, x) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x ? 1 : 0}" y2="${x ? 0 : 1}"><stop offset="0" stop-color="${st[0]}"/><stop offset=".42" stop-color="${st[1]}"/><stop offset=".8" stop-color="${st[2]}"/><stop offset="1" stop-color="${st[3]}"/></linearGradient>`;
  let DEFS = null;
  const defs = () => DEFS || (DEFS = `<defs>${Object.keys(MATS).map(k => grad('m-' + k, MATS[k], false) + grad('mx-' + k, MATS[k], true)).join('')}
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe6a8"/><stop offset=".5" stop-color="#e2b65a"/><stop offset="1" stop-color="#9c7428"/></linearGradient>
    <linearGradient id="hair" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaea"/><stop offset=".45" stop-color="#ece2c2"/><stop offset="1" stop-color="#a8976f"/></linearGradient>
    <linearGradient id="hairB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaea"/><stop offset=".5" stop-color="#e6dbb8"/><stop offset="1" stop-color="#a8976f"/></linearGradient>
    <linearGradient id="skinF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a303c"/><stop offset=".6" stop-color="#2a2331"/><stop offset="1" stop-color="#17131d"/></linearGradient>
    <linearGradient id="steel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8a8880"/><stop offset=".5" stop-color="#5a5852"/><stop offset="1" stop-color="#34332f"/></linearGradient>
    <radialGradient id="eyeGlow"><stop offset="0" stop-color="#d9fffa" stop-opacity=".95"/><stop offset=".35" stop-color="#7ff3e3" stop-opacity=".55"/><stop offset="1" stop-color="#45d8c8" stop-opacity="0"/></radialGradient>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation=".9"/></filter>
    <filter id="soft2" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="1.6"/></filter>
  </defs>`);
  const RIM = '#ffcf86', GOLD = 'url(#gold)', TEAL = '#45d8c8', GLOW = '#7ff3e3';
  // the far side of him. The game gives his far arm and leg a lighter, flatter tone, as if a little way off: the dusk violet of his
  // skin and of the prologue's suit, and in the Pit each cloth's own far colour (the game's Pit colours). A piece says which with
  // `far`: true (the violet), a material's name, or bands along it [[material or true, from x, to x], ...]
  const FARV = 'rgba(52,40,78,.6)', FARC = { soot: '#29221b', shirt: '#48433a', coat: '#2e3224', jersey: '#33343e', under: '#5e594e', canvas: '#463f30', glove: '#2f2318', rope: '#433827', jerkin: '#3a2b1e',
    stab: '#282c35', tyre: '#272727', cap: '#2b2b31', helmet: '#42433f', shin: '#282828', dock: '#2d241b', hide: '#4a3c30', boot: '#3a2b1e', linen: '#8e8776', band: '#2e2117', scarf: '#4a2214' };
  const farOf = m => { const h = FARC[m]; if (!h) return FARV; return `rgba(${parseInt(h.slice(1, 3), 16)},${parseInt(h.slice(3, 5), 16)},${parseInt(h.slice(5, 7), 16)},.62)`; };
  const mat = (name, x) => `url(#${x ? 'mx' : 'm'}-${name})`, tone = (name, i) => MATS[name][i];
  return { rest: R, pieces, def, defs, f, pt, P, L, poly, curve, along, vine, tab, stripPath, stripBox, outPts, outPath, reach, MATS, mat, tone, RIM, GOLD, TEAL, GLOW, far: FARV, farOf, FARC,
    // the widths across him, up the torso (half-widths, in his own units): the painted figure's own
    wide: [[-.17, 11.6], [-.1, 12.6], [0, 12.8], [.2, 11.6], [.4, 10.9], [.55, 11.8], [.72, 13.2], [.86, 14.6], [.97, 15.2], [1.008, 11], [1.03, 6], [1.055, 4.8], [1.12, 4.4]] };
})();
