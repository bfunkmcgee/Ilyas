// ===== THE FALL, AS IT IS FILMED: WHAT IS DRAWN (since V116) =====
// sk_fallcut.js runs the scene; this draws what it asks for over the fall's own picture (FallCut.V) and keeps its camera in bounds.
//   the memories   three plates, each the whole picture, painted once at the screen's size (plates: the sky, the sun, the dunes, the
//                  wire, the well and the people at it; no more than 1.7 million pixels each, painted a piece at a time from the
//                  stage's start, let go when the Pit has him), with him in them drawn by his own painter as he was (rangerOf,
//                  bakeFigure: bare of the coat, the gilt alight), and a little that moves over each (the needle and the lines taking
//                  light, the scarf, the sand on the wind). In through his eye (V.eye, V.white), out torn upward in strands (V.strip).
//                  Waiting on the wire, a dune under him in the world's own terms (duneLie: a piece painted once), and he is
//                  drawn again over it. Their lines are the drawing guide's widths in the world's units as the camera under them
//                  has them (FallCut.MEM; PXU, dkw, ltw); their skies carry combed cirrus and their sand the wind's ripples: a
//                  bare sky or a bare face of sand is a flat patch to the look review.
//   besides        the helicopter's light far up (V.heli), the sign's colour over the picture (V.wash), beads of blood and motes
//                  of the gilt's light left above him, a pulse of the rim's light as each setback passes, the spark in his eye
//                  (V.spark), the dark closing on the arm at the end (V.last).
// Under a memory that covers the picture the page's drawing runs as always, but inside an empty clip (covered, render): the fall's
// painter keeps its pieces up (skipping the drawing made it take up to a second on the first frame back) and nothing of it is put
// down. With reduced motion the flash, the strands, the sand and the pulse are left out and the camera cuts.
const FallCutUI = (() => {
  'use strict';
  const { state, V, FX, POSES, fk, bonesOf, hsh, armAt, MEM, WIRE } = FallCut, DEG = Math.PI / 180, PL = { key: '', P: null, n: 0 };

  // ---------- the desert in his head ----------
  // Three memories and a waking dream, each the whole picture: painted once as a plate the size of the screen (the sky, the sun, the
  // dunes, the wire, the well and the people at it), with him in them drawn by his own painter as he was (bare-armed, a Ranger's
  // scarf, the gilt alight), and a little that moves over each (the sand on the wind, the heat, the light being inked into him).
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(2, Math.round(w)); c.height = Math.max(2, Math.round(h)); return c; };
  const lin = (g, x0, y0, x1, y1, st) => { const q = g.createLinearGradient(x0, y0, x1, y1); for (const [a, c] of st) { q.addColorStop(a, c); } return q; };
  const rad = (g, x, y, r0, r1, st) => { const q = g.createRadialGradient(x, y, r0, x, y, r1); for (const [a, c] of st) { q.addColorStop(a, c); } return q; };
  // him as he was, in a pose, as his painter wants a man handed to it (o.wear: what he has on; o.drain: 1 the lines unlit)
  function rangerOf(pose, o) { const K = hero(), B = bonesOf(K), fa = o.fa || 1, R = fk(B, pose, Math.sin((o.ang || 0) * DEG), -Math.cos((o.ang || 0) * DEG), fa), pts = [];
    for (let i = 0; i < K.p.length; i++) { const r = R[i] || [R[HAF][0], R[HAF][1] + 4]; pts.push({ x: r[0], y: r[1] }); }
    const c = pts[CHE], sc = []; for (let i = 0; i < 7; i++) { const u = i / 6; sc.push({ x: c.x - fa * (2 + u * 30) , y: c.y - 5 - Math.sin(u * 2.6) * 5 + u * u * 6 }); }
    const foot = Math.max(pts[FTF].y, pts[FTB].y) + 3, body = Object.assign(Object.create(K), { p: pts, facing: fa, scarf: sc, gr: () => foot, look: null });
    const F = KaelLook.snap(body, { wear: o.wear || null, drain: o.drain || 0, eyeLit: 0, armOff: false, armTear: 0, oneArm: false, coatOff: true, coatShield: 0, coatOpen: 0, coatShred: 0, hemTears: null, nade: false, charge: null,
      dead: false, downed: false, severed: false, seared: false, lookBack: false, opening: false, ground: foot, t: 0 });
    F.rips = []; F.foot = foot; F.top = Math.min(...pts.map(q => q.y)) - 16; return F; }
  // a figure painted once into a piece: {cv, ox, oy, k}: (ox, oy) is where his feet's middle is in the piece, k its pixels to his units
  function bakeFigure(F, k, o) { const hgt = F.foot - F.top, w = Math.ceil((150) * k), h = Math.ceil((hgt + 14) * k), cvs = mk(w, h), g = cvs.getContext('2d'), ox = w * .5, oy = h - 6 * k;
    g.setTransform(k, 0, 0, k, ox - ((F.p[FTF].x + F.p[FTB].x) / 2) * k, oy - F.foot * k);
    // (his painter's own drawing, whatever else is drawing him on this page: lines stay sharp at any size)
    (KaelLook._painted || KaelLook.draw).call(KaelLook, g, F, Object.assign({ dir: { x: .78, y: -.62 }, key: '#ffe6b4', now: 0, wind: 0, gore: null, bladeOK: false }, o || {}));
    return { cv: cvs, ox, oy, k, F }; }

  // ----- the plates -----
  const vt = () => (V.tFix != null ? V.tFix : S.t - V.t0);
  // the picture between the bars: its size in the canvas's own pixels, u a unit that keeps things the same size on any screen
  // (px: the screen's pixels to one of the world's units as the camera under the memories has them, FallCut.MEM)
  function box() { const w = cv.width, h = cv.height, bar = S.letter ? Math.round(h * .105) : 0, vh = h - 2 * bar; return { w, h, y0: bar, vh, tall: vh > w * 1.05, u: Math.min(w, vh * 1.9) / 1000, px: w / (cssW < 640 ? MEM.wn : MEM.w) }; }
  // The drawing guide's widths (rule 2) in pictures painted for the screen: a dark line is a unit and a half at the least and a
  // light one a unit, of the world's units as the camera under the memories has them (PXU, set with the plates).
  // (a little over, for the inking's plate: it stands behind the dune while the camera closes an eighth before the vow's first cut)
  let PXU = 1; const dkw = v => Math.max(v, 1.7 * PXU), ltw = v => Math.max(v, 1.15 * PXU);
  function skyAndSun(g, B, hz, sx, sy, sr) { const { w, h } = B;
    g.fillStyle = lin(g, 0, B.y0, 0, hz, [[0, '#2b65a5'], [.42, '#6ea7d5'], [.78, '#cadedb'], [1, '#fbecca']]); g.fillRect(0, 0, w, hz + 2);
    cirrus(g, B, hz, sx, sy, Math.round(hz + sx));
    g.fillStyle = rad(g, sx, sy, 0, sr * 9, [[0, 'rgba(255,253,244,1)'], [.1, 'rgba(255,247,220,.9)'], [.24, 'rgba(255,232,170,.45)'], [.55, 'rgba(255,214,140,.14)'], [1, 'rgba(255,205,130,0)']]); g.fillRect(0, 0, w, h);
    g.fillStyle = '#fffef6'; g.beginPath(); g.arc(sx, sy, sr, 0, TAU); g.fill(); }
  // High cirrus combed out along the wind over the whole of a sky, white where the sky is deep and the sun near, a cooler thread
  // low down where the sky is white with the heat (a bare sky is a flat patch: the drawing guide's rule 5).
  function cirrus(g, B, hz, sx, sy, seed) { const { w } = B, r = mulberry32(seed), y0 = B.y0, D = hz - y0, n = Math.round(w * D / (PXU * PXU * 520));
    for (let i = 0; i < n; i++) { const v = r(), y = y0 + D * (.02 + .96 * v), x = r() * w, hw = (24 + r() * 130) * PXU, hh = (.9 + r() * 2.2) * PXU, near = clamp(1 - Math.hypot(x - sx, (y - sy) * 1.4) / (w * .9), 0, 1), cool = r() < .12 + .5 * v * v;
      g.fillStyle = cool ? 'rgba(96,134,176,' + (.07 + .1 * r()).toFixed(3) + ')' : 'rgba(255,255,255,' + ((.05 + .08 * near) * (.5 + r() * .5) * (1.25 - .5 * v)).toFixed(3) + ')';
      g.beginPath(); g.ellipse(x, y, hw, hh, -.05 + (r() - .5) * .05, 0, TAU); g.fill(); } }
  // The wind's ripples across open sand from y0 down to y1 (u: how near, 0 at the horizon to 1 at the picture's foot; none far
  // off): broken lines running with the wind, each a lip of light over a line of shade, wider apart and longer the nearer.
  function ripples(g, B, y0, y1, u, seed) { if (u < .3 || y1 <= y0) { return; } const { w } = B, r = mulberry32(seed), gap = (5 + 11 * u) * PXU; g.save(); g.beginPath(); g.rect(0, y0, w, y1 - y0); g.clip(); g.lineCap = 'round';
    for (let y = y0 + gap * (.5 + r()); y < y1 + gap; y += gap * (.75 + r() * .5)) { const ph = r() * 7, amp = (1 + 2.2 * u) * PXU, wl = (26 + 30 * u) * (.8 + .4 * r()) * PXU; let x = -r() * 120 * PXU;
      while (x < w) { const xa = x, xb = Math.min(w + 10, xa + (50 + r() * 190) * (.5 + u) * PXU), run = dy => { g.beginPath(); for (let xx = xa; xx <= xb; xx += 9 * PXU) { const yy = y - (xx - xa) * .03 + Math.sin(xx / wl + ph) * amp + dy; if (xx === xa) { g.moveTo(xx, yy); } else { g.lineTo(xx, yy); } } g.stroke(); };
        g.strokeStyle = 'rgba(112,64,26,' + (.1 + .08 * u).toFixed(3) + ')'; g.lineWidth = dkw(1.2 * PXU * (.6 + u)); run(0);
        g.strokeStyle = 'rgba(255,240,208,' + (.1 + .08 * u).toFixed(3) + ')'; g.lineWidth = ltw(PXU * (.5 + u * .6)); run(-1.6 * PXU * (.7 + u * .5));
        x = xb + (16 + r() * 90) * PXU; } }
    g.restore(); }
  // The land from the horizon to the picture's foot: ridge behind ridge of sand, each pale along its crest and deeper toward its
  // foot, paler and flatter the further off; then (o.dunes) the near dunes, each with the crest that winds down from its top toward
  // us and the face left of it turned from the sun.
  const RIDGE = [['#f7ead0', '#efddb8'], ['#f3e0b6', '#e7cb9a'], ['#efd29c', '#dbb47a'], ['#e9c181', '#cd9c5e'], ['#e2b066', '#bd8648'], ['#d99f50', '#aa7238'], ['#cd8d3e', '#93602c']];
  function ridge(g, B, y, amp, seed, col, foot, lw) { const { w } = B, r = mulberry32(seed), f1 = (1.1 + r() * 1.5) * Math.PI / w, f2 = (2.7 + r() * 2.4) * Math.PI / w, p1 = r() * 7, p2 = r() * 7, n = 40; let top = 1e9;
    const P = []; for (let i = 0; i <= n; i++) { const x = -20 + (w + 40) * i / n, a = .5 + .5 * Math.sin(x * f1 + p1), b2 = .5 + .5 * Math.sin(x * f2 + p2), yy = y - amp * (a * .72 + b2 * .28) * (.7 + .3 * Math.sin(x * f1 * .41 + p2)); P.push([x, yy]); top = Math.min(top, yy); }
    const path = () => { g.beginPath(); g.moveTo(P[0][0], P[0][1]); for (let i = 1; i < n; i++) { g.quadraticCurveTo(P[i][0], P[i][1], (P[i][0] + P[i + 1][0]) / 2, (P[i][1] + P[i + 1][1]) / 2); } g.lineTo(P[n][0], P[n][1]); };
    path(); g.lineTo(w + 20, foot + 4); g.lineTo(-20, foot + 4); g.closePath(); g.fillStyle = lin(g, 0, top, 0, Math.min(foot, y + amp * 2.2 + (foot - y) * .35), [[0, col[0]], [1, col[1]]]); g.fill();
    path(); g.strokeStyle = 'rgba(255,250,232,.5)'; g.lineWidth = lw; g.stroke(); }
  function dune(g, cx, by, hw, hh, foot, C, lw) { const px = cx, py = by - hh, L = cx - hw * 1.9, R = cx + hw * 1.6;
    const body = new Path2D(); body.moveTo(L, foot + 4); body.lineTo(L, by + hh * .12); body.bezierCurveTo(cx - hw * 1.0, by + hh * .02, cx - hw * .42, py + hh * .24, px, py);
    body.bezierCurveTo(cx + hw * .3, py + hh * .1, cx + hw * .8, by - hh * .2, R, by + hh * .08); body.lineTo(R, foot + 4); body.closePath();
    g.fillStyle = lin(g, 0, py, 0, foot, [[0, C.l[0]], [1, C.l[1]]]); g.fill(body);
    const sh = new Path2D(), ex = px - hw * .24, ky = by + (foot - by) * .28; sh.moveTo(px, py); sh.bezierCurveTo(cx - hw * .42, py + hh * .24, cx - hw * 1.0, by + hh * .02, L, by + hh * .12); sh.lineTo(L, foot + 4); sh.lineTo(ex, foot + 4);
    sh.bezierCurveTo(px - hw * .56, ky, px + hw * .2, py + hh * .52, px, py); sh.closePath(); g.fillStyle = lin(g, 0, py, 0, foot, [[0, C.s[0]], [1, C.s[1]]]); g.fill(sh);
    g.beginPath(); g.moveTo(px, py); g.bezierCurveTo(px + hw * .2, py + hh * .52, px - hw * .56, ky, ex, foot + 4); g.strokeStyle = C.c; g.lineWidth = lw; g.lineCap = 'round'; g.stroke();
    // the wind's ripples down the lit side
    g.save(); g.clip(body); g.strokeStyle = 'rgba(120,70,30,.13)'; g.lineWidth = dkw(lw * .7); for (let i = 1; i < 8; i++) { const t = i / 8; g.beginPath(); g.moveTo(px + hw * (.1 + t * .16), py + hh * (.2 + t * .5)); g.bezierCurveTo(px + hw * .5, py + hh * (.3 + t * .7), px + hw * 1.0, by + (foot - by) * t * .5, R, by + hh * .2 + (foot - by) * t * .8); g.stroke(); } g.restore(); }
  const DUNE = [{ l: ['#ecc88c', '#dcae6a'], s: ['#b98a56', '#c69860'], c: 'rgba(255,246,220,.85)' }, { l: ['#e4b468', '#cf9648'], s: ['#96663a', '#a97642'], c: 'rgba(255,242,208,.9)' }, { l: ['#dba24e', '#b97c36'], s: ['#74482a', '#8a5a30'], c: 'rgba(255,238,196,.95)' }];
  function land(g, B, hz, seed, o) { const { w, h, u } = B, foot = B.y0 + B.vh, D = foot - hz; o = o || {};
    g.fillStyle = lin(g, 0, hz, 0, foot, [[0, '#f5e6c4'], [1, '#d9a85e']]); g.fillRect(0, hz - 1, w, h - hz + 1);
    const ys = o.ys || [.03, .075, .14, .23, .36, .54, .78], n = ys.length;
    for (let i = 0; i < n; i++) { ridge(g, B, hz + D * ys[i], D * (.012 + .028 * i) * (o.amp || 1), seed * 13 + i, RIDGE[Math.min(RIDGE.length - 1, Math.round(i * (RIDGE.length - 1) / (n - 1)))], foot, ltw((.7 + i * .25) * u));
      ripples(g, B, hz + D * ys[i] + 2 * PXU, i + 1 < n ? hz + D * ys[i + 1] + 2 * PXU : foot + 4, i / (n - 1), seed * 31 + i);
      for (const d of (o.dunes || [])) { if (d.after === i) { dune(g, w * d.x, hz + D * d.y, w * d.w * (B.tall ? 1.5 : 1), Math.min(D * d.h, w * d.w * (B.tall ? .8 : 9)), foot, DUNE[d.tone ?? 1], ltw((d.lw || 2) * u)); } } }
    // the white of the heat lying along the horizon
    g.fillStyle = lin(g, 0, hz - D * .06, 0, hz + D * .1, [[0, 'rgba(255,250,236,0)'], [.36, 'rgba(255,250,236,.75)'], [1, 'rgba(255,250,236,0)']]); g.fillRect(0, hz - D * .06, w, D * .16);
    // grain in the sand
    g.save(); g.beginPath(); g.rect(0, hz, w, h - hz); g.clip(); grain(g, B); g.restore(); }
  let GRAIN = null;
  function grain(g, B) { if (!GRAIN) { GRAIN = mk(96, 96); const q = GRAIN.getContext('2d'), r = mulberry32(51); for (let i = 0; i < 700; i++) { q.fillStyle = r() < .5 ? 'rgba(90,50,20,.1)' : 'rgba(255,246,220,.12)'; q.fillRect(r() * 96, r() * 96, 1 + r(), 1 + r()); } }
    g.fillStyle = g.createPattern(GRAIN, 'repeat'); g.fillRect(0, 0, B.w, B.h); }
  // a post of the wire, and the wire's strands from one post to the next
  function post(g, x, y, hgt, lean) { const w0 = hgt * .05, w1 = hgt * .032, tx = x + lean * hgt;
    g.beginPath(); g.moveTo(x - w0, y); g.lineTo(tx - w1, y - hgt); g.lineTo(tx + w1, y - hgt * 1.01); g.lineTo(x + w0, y); g.closePath(); g.fillStyle = '#2c1b13'; g.fill();
    g.beginPath(); g.moveTo(x + w0 * .9, y); g.lineTo(tx + w1 * .9, y - hgt * 1.01); g.strokeStyle = 'rgba(255,214,150,.8)'; g.lineWidth = ltw(w0 * .34); g.stroke();
    return [.93, .72, .5].map(f => ({ x: lerp(x, tx, f), y: y - hgt * f })); }
  // (far off, where the three would run together, the wire is one line)
  function strands(g, A, Bq, lw) { g.strokeStyle = 'rgba(46,28,18,.92)'; g.lineWidth = lw; g.lineCap = 'round'; const one = Math.abs(Bq[1].y - Bq[0].y) < lw * 2.4;
    for (let i = one ? 1 : 0; i < (one ? 2 : 3); i++) { const a = A[i], b = Bq[i], sag = Math.hypot(b.x - a.x, b.y - a.y) * .05; g.beginPath(); g.moveTo(a.x, a.y); g.quadraticCurveTo((a.x + b.x) / 2, (a.y + b.y) / 2 + sag, b.x, b.y); g.stroke(); } }
  // the wire running out to the horizon: posts from near (x0, y0, height h0) to far, and what hangs on it
  function wire(g, B, near, far, n, seed) { const r = mulberry32(seed), P = []; const c = .55, F = 1 - 1 / (1 + n * c);
    for (let k = 0; k <= n; k++) { const s = (1 - 1 / (1 + k * c)) / F; P.push({ x: lerp(near.x, far.x, s), y: lerp(near.y, far.y, s), h: lerp(near.h, far.h, s), lean: (r() - .5) * .07 }); }
    let prev = null; const tops = [];
    for (let k = n; k >= 0; k--) { const q = P[k], T = post(g, q.x, q.y, q.h, q.lean); tops[k] = T; }
    for (let k = n; k > 0; k--) { strands(g, tops[k], tops[k - 1], dkw(P[k - 1].h * .011));
      // (rags and tin tags tied along the nearer spans)
      if (k < 4) { const a = tops[k][1], b = tops[k - 1][1]; for (let j = 1; j < 5; j++) { const t = j / 5, x = lerp(a.x, b.x, t), y = lerp(a.y, b.y, t) + Math.sin(t * Math.PI) * Math.hypot(b.x - a.x, b.y - a.y) * .025, sz = P[k - 1].h * .03;
        g.fillStyle = j % 2 ? '#8e3f24' : '#d9c9a0'; g.fillRect(x - sz * .3, y, sz * .6, sz * (1 + r())); } } }
    return { P, tops }; }
  // someone in a robe and a head-cloth, a jar with them (o.jar: 'head', 'hip' or none; o.dir: the way they face)
  const ROBES = ['#7b4a2e', '#4e3b4f', '#8a6a3c', '#5a3a2a', '#3d4a5a', '#6b2f24', '#756a4a'];
  function robed(g, x, y, hgt, o) { const d = o.dir || -1, X = a => x + a * hgt * d, Y = b => y + b * hgt, col = o.col || ROBES[0];
    const body = new Path2D(); body.moveTo(X(-.105), Y(-.8)); body.quadraticCurveTo(X(-.16), Y(-.42), X(-.19), Y(0)); body.lineTo(X(.2), Y(0)); body.quadraticCurveTo(X(.17), Y(-.45), X(.1), Y(-.8)); body.quadraticCurveTo(X(0), Y(-.87), X(-.105), Y(-.8)); body.closePath();
    g.fillStyle = col; g.fill(body);
    // (the side of them turned from the sun)
    g.save(); g.clip(body); g.fillStyle = 'rgba(20,10,8,.42)'; g.fillRect(x - hgt * .25, y - hgt, hgt * .25 - hgt * .01, hgt); g.restore();
    // the head, the face toward the well, and the head-cloth over the back of it and down the shoulders
    g.fillStyle = '#7a4c30'; g.beginPath(); g.ellipse(X(.012), Y(-.9), hgt * .056, hgt * .068, 0, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(X(.05), Y(-.905)); g.lineTo(X(.082), Y(-.885)); g.lineTo(X(.05), Y(-.87)); g.closePath(); g.fill();
    g.fillStyle = o.cloth || '#e6d7b4'; g.beginPath(); g.moveTo(X(.03), Y(-.975)); g.quadraticCurveTo(X(-.075), Y(-.99), X(-.07), Y(-.89)); g.quadraticCurveTo(X(-.135), Y(-.82), X(-.118), Y(-.68)); g.lineTo(X(-.02), Y(-.77));
    g.quadraticCurveTo(X(-.012), Y(-.86), X(.004), Y(-.9)); g.quadraticCurveTo(X(.03), Y(-.94), X(.03), Y(-.975)); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(60,34,20,.35)'; g.lineWidth = dkw(hgt * .012); g.beginPath(); g.moveTo(X(-.06), Y(-.88)); g.quadraticCurveTo(X(-.1), Y(-.8), X(-.09), Y(-.71)); g.stroke();
    const jar = (jx, jy, s) => { g.fillStyle = '#9a5a34'; g.beginPath(); g.ellipse(jx, jy, s * .8, s, 0, 0, TAU); g.fill(); g.fillRect(jx - s * .3, jy - s * 1.35, s * .6, s * .5);
      g.fillStyle = 'rgba(255,226,170,.75)'; g.beginPath(); g.ellipse(jx + s * .3, jy - s * .2, s * .16, s * .5, .2, 0, TAU); g.fill(); };
    if (o.jar === 'head') { jar(X(.0), Y(-1.06), hgt * .075); g.strokeStyle = col; g.lineWidth = hgt * .045; g.lineCap = 'round'; g.beginPath(); g.moveTo(X(.08), Y(-.76)); g.lineTo(X(.07), Y(-1.02)); g.stroke(); }
    else if (o.jar === 'hip') { jar(X(.17), Y(-.4), hgt * .085); g.strokeStyle = col; g.lineWidth = hgt * .045; g.lineCap = 'round'; g.beginPath(); g.moveTo(X(.07), Y(-.74)); g.lineTo(X(.15), Y(-.48)); g.stroke(); }
    else if (o.jar === 'cup') { g.strokeStyle = col; g.lineWidth = hgt * .045; g.lineCap = 'round'; g.beginPath(); g.moveTo(X(.07), Y(-.74)); g.lineTo(X(.2), Y(-.62)); g.stroke(); }
    // the sun along the edge of them
    g.save(); g.clip(body); g.strokeStyle = 'rgba(255,226,170,.9)'; g.lineWidth = ltw(hgt * .028); g.beginPath(); const sx = d < 0 ? X(-.105) : X(.1), ex = d < 0 ? X(-.19) : X(.2);
    g.moveTo(sx, Y(-.8)); g.quadraticCurveTo(d < 0 ? X(-.16) : X(.17), Y(-.43), ex, Y(0)); g.stroke(); g.restore(); }
  // the well: its ring of stone, the dark of its mouth, the frame over it, the rope and the pail
  function well(g, x, y, s) { const rx = 62 * s, ry = 17 * s, hh = 38 * s;
    g.fillStyle = 'rgba(70,40,22,.28)'; g.beginPath(); g.ellipse(x - rx * .9, y + ry * .3, rx * 1.5, ry * 1.1, 0, 0, TAU); g.fill();
    g.fillStyle = 'rgba(255,238,200,.55)'; g.beginPath(); g.ellipse(x + rx * .3, y + ry * .55, rx * 1.5, ry * .9, 0, 0, TAU); g.fill();
    const wall = new Path2D(); wall.moveTo(x - rx, y - hh); wall.lineTo(x - rx, y); wall.ellipse(x, y, rx, ry, 0, Math.PI, 0, true); wall.lineTo(x + rx, y - hh); wall.closePath();
    g.fillStyle = lin(g, x - rx, 0, x + rx, 0, [[0, '#6a4a32'], [.45, '#a8825a'], [.8, '#dcbb88'], [1, '#e9cd9c']]); g.fill(wall);
    g.save(); g.clip(wall); g.strokeStyle = 'rgba(40,24,14,.42)'; g.lineWidth = dkw(1.2 * s);
    for (let i = 1; i < 3; i++) { g.beginPath(); g.ellipse(x, y - hh * i / 3, rx, ry, 0, 0, Math.PI); g.stroke(); }
    for (let i = 0; i < 3; i++) { for (let j = 0; j < 9; j++) { const a = (j + (i % 2) * .5) / 9 * Math.PI, bx = x - Math.cos(a) * rx, by0 = y - hh * (i + 1) / 3 + Math.sin(a) * ry; g.beginPath(); g.moveTo(bx, by0); g.lineTo(bx, by0 + hh / 3); g.stroke(); } }
    g.restore();
    g.fillStyle = '#ecd2a2'; g.beginPath(); g.ellipse(x, y - hh, rx, ry, 0, 0, TAU); g.fill();
    g.fillStyle = '#140c07'; g.beginPath(); g.ellipse(x, y - hh, rx * .76, ry * .7, 0, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(110,200,214,.55)'; g.lineWidth = ltw(1.6 * s); g.beginPath(); g.ellipse(x, y - hh + ry * .1, rx * .5, ry * .34, 0, .3, 2.2); g.stroke();
    // the frame, the wheel, the rope, the pail with the light in its water
    g.strokeStyle = '#3a2416'; g.lineCap = 'round'; g.lineWidth = 7 * s; g.beginPath(); g.moveTo(x - rx * .86, y - hh * .6); g.lineTo(x - rx * .7, y - hh - 104 * s); g.moveTo(x + rx * .86, y - hh * .6); g.lineTo(x + rx * .7, y - hh - 104 * s); g.stroke();
    g.lineWidth = 8 * s; g.beginPath(); g.moveTo(x - rx * .82, y - hh - 104 * s); g.lineTo(x + rx * .82, y - hh - 106 * s); g.stroke();
    g.strokeStyle = 'rgba(255,214,150,.8)'; g.lineWidth = ltw(1.6 * s); g.beginPath(); g.moveTo(x + rx * .9, y - hh * .6); g.lineTo(x + rx * .74, y - hh - 104 * s); g.stroke();
    g.fillStyle = '#4a2e1c'; g.beginPath(); g.arc(x, y - hh - 96 * s, 9 * s, 0, TAU); g.fill();
    g.strokeStyle = '#cdb68c'; g.lineWidth = ltw(1.5 * s); g.beginPath(); g.moveTo(x, y - hh - 88 * s); g.lineTo(x, y - hh - 30 * s); g.stroke();
    const py = y - hh - 30 * s; g.fillStyle = '#5a3a22'; g.beginPath(); g.moveTo(x - 11 * s, py); g.lineTo(x + 11 * s, py); g.lineTo(x + 8 * s, py + 17 * s); g.lineTo(x - 8 * s, py + 17 * s); g.closePath(); g.fill();
    g.fillStyle = '#bff3ff'; g.beginPath(); g.ellipse(x, py + 1 * s, 10 * s, 2.6 * s, 0, 0, TAU); g.fill();
    return { pail: { x, y: py }, top: y - hh }; }
  // The dune he lies on, waiting: its lit face and the face turned from the sun, the crest winding down between them toward us,
  // the wind's ripples over the lit face (each a lip of light over a line of shade), the sand's slips down the other, and the
  // glitter of the grains. In its own terms: x from his middle, y from where he lies; vw the view's width, HW how far it runs to
  // either side, D how deep. (Painted once: a face of bare gradients is a flat patch, the drawing guide's rule 5.)
  function duneLie(g, vw, HW, D) { const Lx = -HW - 10, Rx = HW + 10, bot = D + 10, eL = -vw / 2 - 30, eR = vw / 2 + 30, yL = 64 + (40 - 64) / (-vw * .3 - eL) * (Lx - eL), yR = 52 + (52 - 16) / (eR - 190) * (Rx - eR);
    const bz = (a, b, c2, d, t) => { const m = 1 - t; return m * m * m * a + 3 * m * m * t * b + 3 * m * t * t * c2 + t * t * t * d; }, r = mulberry32(77);
    const body = new Path2D(); body.moveTo(Lx, yL); body.lineTo(eL, 64); body.bezierCurveTo(-vw * .3, 40, -150, 1, -30, 0); body.bezierCurveTo(70, -1, 190, 16, eR, 52); body.lineTo(Rx, yR); body.lineTo(Rx, bot); body.lineTo(Lx, bot); body.closePath();
    g.fillStyle = lin(g, 0, 0, 0, D, [[0, '#e9bd72'], [.5, '#d09a4c'], [1, '#a8702f']]); g.fill(body);
    // (the lit face's top edge, to lay the ripples under)
    const TP = []; for (let i = 0; i <= 40; i++) { TP.push([bz(-30, 70, 190, eR, i / 40), bz(0, -1, 16, 52, i / 40)]); } TP.push([Rx + 1, yR]);
    const topY = x => { for (let i = 1; i < TP.length; i++) { if (x <= TP[i][0]) { const a = TP[i - 1], b = TP[i]; return a[1] + (b[1] - a[1]) * (x - a[0]) / Math.max(1e-6, b[0] - a[0]); } } return yR; };
    g.save(); g.clip(body); g.lineCap = 'round'; const xs = -270;
    for (let d = 8 + r() * 3, i = 0; d < bot + 20; d += 9 + i * 1.15 + r() * 4, i++) { const ph = r() * 7, amp = Math.min(2.6, .8 + i * .14), spread = .55 + r() * .2;
      const line = dy => { g.beginPath(); for (let x = xs; x <= Rx; x += 7) { const u = clamp((x + 30) / (Rx + 30), 0, 1), y = topY(Math.max(x, -30)) + Math.max(0, -30 - x) * .12 + d * (1 + spread * u) + Math.sin(x / (21 + i) + ph) * amp + dy; if (x === xs) { g.moveTo(x, y); } else { g.lineTo(x, y); } } g.stroke(); };
      g.strokeStyle = 'rgba(112,64,26,.17)'; g.lineWidth = 1.65; line(0); g.strokeStyle = 'rgba(255,236,196,.16)'; g.lineWidth = 1.2; line(-1.5); }
    g.fillStyle = '#fff8e6'; for (let i = 0, n = Math.round((Rx + 200) * bot / 170); i < n; i++) { const x = -200 + r() * (Rx + 200), y = topY(Math.max(x, -30)) + 3 + r() * bot; g.globalAlpha = .2 + .5 * r(); g.fillRect(x, y, 1.1, 1.1); } g.globalAlpha = 1;
    g.restore();
    // the face turned from the sun, and the sand's slips down it
    const sh = new Path2D(); sh.moveTo(-30, 0); sh.bezierCurveTo(-150, 1, -vw * .3, 40, eL, 64); sh.lineTo(Lx, yL); sh.lineTo(Lx, bot); sh.lineTo(-190, bot); sh.bezierCurveTo(-240, 120, -20, 70, -30, 0); sh.closePath();
    g.fillStyle = lin(g, 0, 0, 0, D, [[0, '#9a6638'], [1, '#7a4a28']]); g.fill(sh);
    g.save(); g.clip(sh); g.lineCap = 'round';
    for (let off = 11 + r() * 4, j = 0; off < HW + 260; off += 12 + j * 2.2 + r() * 6, j++) { const ph = r() * 7, slip = k => { g.beginPath(); for (let i = 0; i <= 24; i++) { const t = i / 24, x = bz(-30, -20, -240, -190, t) - off * (.25 + .75 * t) + Math.sin(t * 9 + ph) * 2.2 + k, y = bz(0, 70, 120, bot, t); if (i) { g.lineTo(x, y); } else { g.moveTo(x, y); } } g.stroke(); };
      g.strokeStyle = 'rgba(46,24,12,.2)'; g.lineWidth = 1.65; slip(0); g.strokeStyle = 'rgba(206,146,90,.15)'; g.lineWidth = 1.5; slip(2.2); }
    g.restore();
    // the crest catching the noon
    g.beginPath(); g.moveTo(-30, 0); g.bezierCurveTo(-20, 70, -240, 120, -190, bot); g.strokeStyle = 'rgba(255,240,204,.9)'; g.lineWidth = 1.7; g.stroke(); }
  // the plates of this screen, made when first wanted (again if the screen changes)
  function plates() { const B = box(), key = B.w + 'x' + B.h + (S.letter ? 'L' : ''); if (PL.P && PL.key === key) { return PL.P; } freePlates(); PL.key = key; PXU = B.px; const P = PL.P = { B }, { w, h, u, y0, vh, tall } = B;
    // (each plate is painted when it is first asked for: warmTick asks for them one at a time before they are wanted)
    const ps = Math.min(1, Math.sqrt(1.7e6 / (w * h))), plate = fn => { const c = mk(w * ps, h * ps), g = c.getContext('2d'); g.setTransform(ps, 0, 0, ps, 0, 0); fn(g); return c; };
    const lazy = (o, k, fn) => Object.defineProperty(o, k, { configurable: true, get() { const v = fn(); Object.defineProperty(o, k, { value: v, writable: true }); return v; } });
    // the inking: a sky white with noon and far dunes, the sun beyond his arm
    P.ink = { hz: y0 + vh * (tall ? .62 : .64), sun: { x: w * (tall ? .78 : .74), y: y0 + vh * (tall ? .26 : .24), r: 30 * u } };
    lazy(P.ink, 'cv', () => plate(g => { const I = P.ink; skyAndSun(g, B, I.hz, I.sun.x, I.sun.y, I.sun.r); land(g, B, I.hz, 7, { ys: [.05, .16, .34, .6], amp: 1.5, dunes: [{ after: 1, x: .78, y: .3, w: .16, h: .34, tone: 0 }, { after: 2, x: .5, y: .62, w: .22, h: .4, tone: 1 }] });
      g.fillStyle = 'rgba(255,246,224,.16)'; g.fillRect(0, 0, w, h); }));
    // the wire: the land wide, the posts running from the picture's foot to the horizon
    P.wire = { hz: y0 + vh * (tall ? .5 : .42), sun: { x: w * .8, y: y0 + vh * (tall ? .13 : .13), r: 24 * u } };
    lazy(P.wire, 'cv', () => plate(g => { const I = P.wire; skyAndSun(g, B, I.hz, I.sun.x, I.sun.y, I.sun.r); land(g, B, I.hz, 21, { dunes: [{ after: 3, x: .2, y: .34, w: .13, h: .2, tone: 0 }, { after: 4, x: .62, y: .5, w: .2, h: .24, tone: 1 }, { after: 5, x: .1, y: .8, w: .24, h: .3, tone: 2 }] }); }));
    P.wire.near = { x: w * (tall ? .95 : .93), y: y0 + vh * (tall ? .92 : .9), h: vh * (tall ? .56 : .98) }; P.wire.far = { x: w * (tall ? .16 : .22), y: P.wire.hz + vh * .012, h: vh * .02 };
    lazy(P.wire, 'fg', () => plate(g => { P.wire.W = wire(g, B, P.wire.near, P.wire.far, 9, 5); }));
    // the well: the ring of it, the people with their jars in a line to it
    P.well = { hz: y0 + vh * (tall ? .44 : .33), sun: { x: w * .9, y: y0 + vh * .09, r: 28 * u } };
    lazy(P.well, 'cv', () => plate(g => { const I = P.well, s = u * (tall ? 1.5 : 1.36), wx = w * (tall ? .4 : .45), wy = y0 + vh * (tall ? .72 : .68), gap = tall ? 45 : 62, lead = tall ? 88 : 104; skyAndSun(g, B, I.hz, I.sun.x, I.sun.y, I.sun.r);
      land(g, B, I.hz, 33, { ys: [.04, .1, .19, .31, .46], dunes: [{ after: 2, x: .16, y: .3, w: .14, h: .2, tone: 0 }, { after: 3, x: .84, y: .42, w: .2, h: .22, tone: 1 }] });
      // the line of them, the furthest first, coming down from the right
      const N = 7; for (let i = N - 1; i >= 0; i--) { const t = i / (N - 1), px = wx + (lead + i * gap + (i % 2) * 10) * s, py = wy - t * vh * .05 + (i % 2) * 6 * s, hg = (150 - t * 30) * s * (i === 2 ? .6 : 1);
        g.fillStyle = 'rgba(70,40,22,.3)'; g.beginPath(); g.ellipse(px - hg * .18, py, hg * .24, hg * .035, 0, 0, TAU); g.fill();
        robed(g, px, py, hg, { dir: -1, col: ROBES[(i * 3 + 1) % ROBES.length], jar: i === 0 ? 'cup' : i === 2 ? null : i % 2 ? 'head' : 'hip', cloth: i % 3 === 1 ? '#cfb07a' : '#e6d7b4' }); }
      I.well = well(g, wx, wy, s); I.s = s; I.wx = wx; I.wy = wy; I.him = tall ? 116 : 150; }));
    // the dune he waits on, in its own terms (x from his middle, y from where he lies), at the size the wire's shot shows it
    { const vw = cssW < 640 ? WIRE.wn : WIRE.w, sc = w / vw, HW = vw / 2 + 150, D = h / sc * .56 + 40, yd = -14, q = Math.min(1, Math.sqrt(1.3e6 / (2 * HW * sc * (D - yd) * sc)));
      P.dune = { x0: -HW, y0: yd, w: 2 * HW, h: D - yd };
      lazy(P.dune, 'cv', () => { const c = mk(2 * HW * sc * q, (D - yd) * sc * q), g = c.getContext('2d'); g.setTransform(sc * q, 0, 0, sc * q, HW * sc * q, -yd * sc * q); duneLie(g, vw, HW, D); return c; }); }
    // the light of noon let in round the edges of a memory
    lazy(P, 'glow', () => { const c = mk(256, 256), g = c.getContext('2d'); g.setTransform(256 / w, 0, 0, 256 / h, 0, 0); g.fillStyle = rad(g, w / 2, y0 + vh / 2, Math.min(w, vh) * .32, Math.hypot(w, vh) * .62, [[0, 'rgba(255,248,228,0)'], [.7, 'rgba(255,246,222,.2)'], [1, 'rgba(255,244,214,.62)']]); g.fillRect(0, 0, w, h); return c; });
    return P; }

  // ----- him in them, and what moves -----
  function figs(P) { if (P.fig) { return P.fig; } const B = P.B, { w, u, vh, tall } = B, F = P.fig = {}, K = hero(), bn = bonesOf(K);
    const lazy = (k, fn) => Object.defineProperty(F, k, { configurable: true, get() { const v = fn(); Object.defineProperty(F, k, { value: v, writable: true }); return v; } });
    // the inking: his head, his breast and the arm he holds out, once unlit and once alight
    const hold = { aN: [84, 4], aF: [-8, 12], lN: [4, -4], lF: [-4, -4], hd: 9 }, k1 = Math.min(13, (tall ? .54 : .33) * w / (bn.ua + bn.fa + 8));
    lazy('inkLit', () => bakeFigure(rangerOf(hold, { drain: 0 }), k1)); lazy('inkDark', () => bakeFigure(rangerOf(hold, { drain: 1 }), k1));
    // standing at the wire, looking out along it; and by the well, a hand at his belt
    const stand = { aN: [10, 14], aF: [-8, 12], lN: [5, -4], lF: [-5, -4], hd: 3 }, guard = { aN: [26, 62], aF: [-6, 10], lN: [7, -5], lF: [-6, -4], hd: 5 };
    lazy('wire', () => { void P.wire.fg; const f1 = rangerOf(stand, { drain: 0, fa: -1 }); return bakeFigure(f1, P.wire.W.P[1].h * .64 / (f1.foot - f1.top)); });
    lazy('well', () => { void P.well.cv; const f2 = rangerOf(guard, { drain: 0, fa: 1 }); return bakeFigure(f2, 178 * P.well.s / (f2.foot - f2.top)); });
    // a spark's glow
    lazy('glow', () => { const cg = mk(64, 64), g = cg.getContext('2d'); g.fillStyle = rad(g, 32, 32, 0, 32, [[0, 'rgba(255,255,255,1)'], [.2, 'rgba(190,246,255,.8)'], [.5, 'rgba(120,226,240,.28)'], [1, 'rgba(120,226,240,0)']]); g.fillRect(0, 0, 64, 64); return cg; });
    return F; }
  // everything the memories are made of, asked for a piece at a time from the stage's start, before the first of them is wanted;
  // and let go once the Pit has him
  function warmTick() { if (!state.run || S.arenaKey !== 'fall' || !S.pit) { if (PL.P) { freePlates(); } return; } if (S.pit.on) { if (PL.P && !V.kind && !V.strip) { freeBig(); } return; }
    if (++PL.n % 20) { return; } try { const P = plates(), F = figs(P), jobs = [() => P.ink.cv, () => F.inkDark, () => F.inkLit, () => P.wire.cv, () => P.wire.fg, () => F.wire, () => P.well.cv, () => F.well, () => P.dune.cv, () => (P.glow, F.glow)];
      P.wi = P.wi || 0; if (P.wi < jobs.length) { jobs[P.wi++](); } } catch (e) { state.err = String(e && e.message || e); } }
  // a piece set down with one of his joints at (x, y) on the screen; back: where another joint then is
  function putFig(c, Fg, joint, x, y) { const F = Fg.F, fm = (F.p[FTF].x + F.p[FTB].x) / 2, dx = x - (Fg.ox + (F.p[joint].x - fm) * Fg.k), dy = y - (Fg.oy + (F.p[joint].y - F.foot) * Fg.k);
    return { dx, dy, at: i => ({ x: x + (F.p[i].x - F.p[joint].x) * Fg.k, y: y + (F.p[i].y - F.p[joint].y) * Fg.k }) }; }
  // the Ranger's scarf out on the wind from his neck (s: the screen's pixels to one of his units; dir: the way the wind takes it)
  function scarfLive(c, x, y, s, t, dir) { const N = 10, L = 5 * s, top = [], bot = [];
    for (let i = 0; i <= N; i++) { const a = i / N, px = x + dir * i * L, py = y + a * a * 8 * s + Math.sin(t * 7.5 - i * .85) * (.8 + 5.2 * a) * s, wd = (3.4 - 2.3 * a) * s; top.push([px, py - wd]); bot.push([px, py + wd]); }
    c.beginPath(); c.moveTo(top[0][0], top[0][1]); for (const q of top) { c.lineTo(q[0], q[1]); } for (let i = N; i >= 0; i--) { c.lineTo(bot[i][0], bot[i][1]); } c.closePath(); c.fillStyle = '#a4532e'; c.fill();
    // (its shaded edge and its lit one, as far along it as it is wide enough to carry them)
    const wD = dkw(1.3 * s), wL = ltw(.7 * s), m = Math.floor(clamp((3.4 - (wD + wL) / s) / 2.3, 0, 1) * N);
    if (m > 0) { c.lineCap = 'round'; c.beginPath(); c.moveTo(bot[0][0], bot[0][1]); for (let i = 1; i <= m; i++) { c.lineTo(bot[i][0], bot[i][1]); } c.strokeStyle = '#6a3018'; c.lineWidth = wD; c.stroke();
      c.beginPath(); c.moveTo(top[0][0], top[0][1]); for (let i = 1; i <= m; i++) { c.lineTo(top[i][0], top[i][1]); } c.strokeStyle = 'rgba(255,214,160,.7)'; c.lineWidth = wL; c.stroke(); }
    // (the knot of it at his throat)
    c.fillStyle = '#8e4526'; c.beginPath(); c.ellipse(x, y, 3.6 * s, 3 * s, 0, 0, TAU); c.fill(); }
  // sand going by on the wind, in one batch (big: the nearer, faster, longer streaks)
  function sandWind(c, B, t, ya, yb, n, a, big) { if (reduceMotion) { return; } const { w, u } = B, len = (big ? 110 : 50) * u, span = w + len * 2; c.save(); c.strokeStyle = 'rgba(255,243,214,' + a + ')'; c.lineWidth = ltw((big ? 2.2 : 1.2) * u); c.lineCap = 'round'; c.beginPath();
    for (let i = 0; i < n; i++) { const sp = (.3 + hsh(i, 3) * .5) * w * (big ? 1.7 : 1), x = w + len - ((hsh(i, 1) * span + t * sp) % span), y = lerp(ya, yb, hsh(i, 2)) + Math.sin(t * 2 + i) * 4 * u, l = len * (.4 + hsh(i, 4));
      c.moveTo(x, y); c.lineTo(x + l, y - l * .05); } c.stroke(); c.restore(); }
  // the Ranger who inks him: a hand out of a rust sleeve, the needle of light in it, its point at (tx, ty)
  function inker(c, tx, ty, s, t) { const an = -1.16, L = 25 * s, hx = tx + Math.cos(an) * L, hy = ty + Math.sin(an) * L, sa = -.62, dx = Math.cos(sa), dy = Math.sin(sa), nx = -dy, ny = dx;
    c.lineCap = 'round'; c.strokeStyle = '#24140c'; c.lineWidth = dkw(1.5 * s); c.beginPath(); c.moveTo(tx, ty); c.lineTo(hx + Math.cos(an) * 7 * s, hy + Math.sin(an) * 7 * s); c.stroke();
    c.strokeStyle = '#e0aa50'; c.lineWidth = ltw(.8 * s); c.beginPath(); c.moveTo(lerp(tx, hx, .5), lerp(ty, hy, .5)); c.lineTo(lerp(tx, hx, .66), lerp(ty, hy, .66)); c.stroke();
    // the sleeve, wide at the cuff, going off to the corner
    const cx0 = hx + dx * 7 * s, cy0 = hy + dy * 7 * s, far = 420 * s; c.beginPath(); c.moveTo(cx0 + nx * 7.5 * s, cy0 + ny * 7.5 * s); c.lineTo(cx0 + dx * far + nx * 34 * s, cy0 + dy * far + ny * 34 * s); c.lineTo(cx0 + dx * far - nx * 30 * s, cy0 + dy * far - ny * 30 * s); c.lineTo(cx0 - nx * 7 * s, cy0 - ny * 7 * s); c.closePath();
    c.fillStyle = lin(c, cx0 - nx * 8 * s, cy0 - ny * 8 * s, cx0 + nx * 9 * s, cy0 + ny * 9 * s, [[0, '#b65e34'], [.55, '#8e4324'], [1, '#5c2917']]); c.fill();
    c.strokeStyle = '#e0aa50'; c.lineWidth = ltw(1.5 * s); c.beginPath(); c.moveTo(cx0 + nx * 7.5 * s, cy0 + ny * 7.5 * s); c.lineTo(cx0 - nx * 7 * s, cy0 - ny * 7 * s); c.stroke();
    c.strokeStyle = 'rgba(224,170,80,.7)'; c.lineWidth = ltw(.6 * s); c.beginPath(); c.moveTo(cx0 + dx * 3.4 * s + nx * 7.9 * s, cy0 + dy * 3.4 * s + ny * 7.9 * s); c.lineTo(cx0 + dx * 3.4 * s - nx * 7.4 * s, cy0 + dy * 3.4 * s - ny * 7.4 * s); c.stroke();
    // the hand closed on the needle: the back of it, the thumb, the knuckles
    c.fillStyle = '#7c4a2a'; c.beginPath(); c.ellipse(hx + dx * 1.4 * s, hy + dy * 1.4 * s, 6.2 * s, 4.7 * s, sa, 0, TAU); c.fill();
    c.fillStyle = '#935a34'; c.beginPath(); c.ellipse(hx - dx * 2.4 * s + nx * 2.6 * s, hy - dy * 2.4 * s + ny * 2.6 * s, 3.4 * s, 2.3 * s, sa + .9, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(40,20,10,.5)'; c.lineWidth = dkw(.5 * s); c.beginPath(); for (let i = -1; i <= 1; i++) { c.moveTo(hx + dx * (.6 + i * 2.2) * s - nx * 2.6 * s, hy + dy * (.6 + i * 2.2) * s - ny * 2.6 * s); c.lineTo(hx + dx * (1.2 + i * 2.2) * s - nx * 4.4 * s, hy + dy * (1.2 + i * 2.2) * s - ny * 4.4 * s); } c.stroke();
    c.strokeStyle = 'rgba(255,214,160,.6)'; c.lineWidth = ltw(.6 * s); c.beginPath(); c.ellipse(hx + dx * 1.4 * s, hy + dy * 1.4 * s, 6.2 * s, 4.7 * s, sa, -1.2, .5); c.stroke(); }
  // The inking (2.2 s): the needle goes down his arm from the shoulder to the wrist and the lines take light behind it; then the
  // stones on his breast, and last his eye.
  function drawInk(c, P, t) { const B = P.B, { w, h, u, y0, vh, tall } = B, I = P.ink, F = figs(P), L = F.inkLit, s = L.k, uu = clamp(t / 2.2, 0, 1), z = 1.07 - .06 * sstep(uu);
    c.save(); c.translate(w * .5, y0 + vh * .5); c.scale(z, z); c.translate(-w * .5, -(y0 + vh * .5));
    c.drawImage(I.cv, 0, 0, B.w, B.h);
    const M = putFig(c, L, CHE, w * (tall ? .24 : .31), y0 + vh * (tall ? .5 : .57)), sh = M.at(CHE), el = M.at(ELF), ha = M.at(HAF);
    c.drawImage(F.inkDark.cv, M.dx, M.dy);
    const a = sstep(clamp((t - .15) / 1.45, 0, 1)), f = lerp(.12, .97, a), tip = f < .5 ? { x: lerp(sh.x, el.x, f * 2), y: lerp(sh.y, el.y, f * 2) } : { x: lerp(el.x, ha.x, f * 2 - 1), y: lerp(el.y, ha.y, f * 2 - 1) };
    tip.y -= 4.6 * s; tip.x += Math.sin(t * 21) * .5 * s;
    // (alight: his arm as far as the needle, then the rest of him in two more parts)
    const lit = (x0, y0q, x1, y1, al) => { if (al <= 0) { return; } c.save(); c.globalAlpha *= al; c.beginPath(); c.rect(x0, y0q, x1 - x0, y1 - y0q); c.clip(); c.drawImage(L.cv, M.dx, M.dy); c.restore(); };
    const armT = Math.min(sh.y, ha.y) - 12 * s, armB = Math.max(sh.y, ha.y) + 13 * s, bodyX = sh.x + 7 * s;
    if (t > .15) { lit(bodyX, armT, tip.x + 1.5 * s, armB, 1); }
    lit(M.dx, sh.y - 9 * s, bodyX, h, sstep(clamp((t - 1.5) / .35, 0, 1))); lit(M.dx, 0, bodyX + 30 * s, sh.y - 9 * s, sstep(clamp((t - 1.78) / .3, 0, 1)));
    if (a < 1) { inker(c, tip.x, tip.y, s, t);
      // the point of light, and what flies off it
      c.save(); c.globalCompositeOperation = 'lighter'; const g = 10 * s * (1 + .25 * Math.sin(t * 31)); c.drawImage(F.glow, tip.x - g, tip.y - g, g * 2, g * 2);
      if (!reduceMotion) { c.lineCap = 'round'; c.lineWidth = ltw(.7 * s); const fr = Math.floor(t * 30);
        for (let i = 0; i < 9; i++) { const an = -Math.PI * (.15 + .7 * hsh(i, fr)), l0 = (3 + 9 * hsh(i, fr + 7)) * s, l1 = l0 + (3 + 7 * hsh(i, fr + 13)) * s; c.strokeStyle = i % 3 ? 'rgba(190,246,255,.9)' : 'rgba(255,232,170,.9)';
          c.beginPath(); c.moveTo(tip.x + Math.cos(an) * l0, tip.y + Math.sin(an) * l0); c.lineTo(tip.x + Math.cos(an) * l1, tip.y + Math.sin(an) * l1); c.stroke(); } }
      c.restore(); }
    else { // the eye taking light: a breath of it over the whole picture
      const e = clamp((t - 1.78) / .4, 0, 1), k = Math.sin(e * Math.PI); if (k > 0) { const hd = M.at(HEAD), g = 46 * s * (.5 + e); c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha *= .7 * k; c.drawImage(F.glow, hd.x + 4 * s - g, hd.y - g, g * 2, g * 2); c.restore(); } }
    sandWind(c, B, t, I.hz - vh * .05, y0 + vh, 26, .3, false); c.restore();
    sandWind(c, B, t + 3, y0 + vh * .55, y0 + vh, 7, .26, true); c.drawImage(P.glow, 0, 0, B.w, B.h); }
  // The wire: the land wide and the posts running out to the horizon, him small at the second of them, looking out along it.
  function drawWire(c, P, t) { void P.wire.fg; const B = P.B, { w, h, u, y0, vh } = B, I = P.wire, F = figs(P), z = 1.06 - .06 * sstep(clamp(t / 2.4, 0, 1));
    c.save(); c.translate(I.far.x, I.far.y); c.scale(z, z); c.translate(-I.far.x, -I.far.y);
    c.drawImage(I.cv, 0, 0, B.w, B.h); sandWind(c, B, t, I.hz, y0 + vh * .8, 40, .3, false);
    c.drawImage(I.fg, 0, 0, B.w, B.h);
    const q = I.W.P[1], Fg = F.wire, fx = q.x - q.h * .34, fy = q.y + q.h * .03; c.fillStyle = 'rgba(70,40,22,.34)'; c.beginPath(); c.ellipse(fx - Fg.k * 8, fy, Fg.k * 22, Fg.k * 3.4, 0, 0, TAU); c.fill();
    const M = putFig(c, Fg, FTB, fx, fy - 3 * Fg.k), ch = M.at(CHE); scarfLive(c, ch.x - 1 * Fg.k, ch.y - 8 * Fg.k, Fg.k, t, -1); c.drawImage(Fg.cv, M.dx, M.dy);
    c.restore(); sandWind(c, B, t + 5, y0 + vh * .5, y0 + vh, 8, .28, true); c.drawImage(P.glow, 0, 0, B.w, B.h); }
  // The well: the people who had nothing in a line to it with their jars, and him beside it.
  function drawWell(c, P, t) { void P.well.cv; const B = P.B, { w, h, u, y0, vh } = B, I = P.well, F = figs(P), z = 1 + .05 * sstep(clamp(t / 3.2, 0, 1)), s = I.s;
    c.save(); c.translate(I.wx, I.wy - vh * .2); c.scale(z, z); c.translate(-I.wx, -(I.wy - vh * .2));
    c.drawImage(I.cv, 0, 0, B.w, B.h);
    const Fg = F.well, fx = I.wx - I.him * s, fy = I.wy + 10 * s; c.fillStyle = 'rgba(70,40,22,.34)'; c.beginPath(); c.ellipse(fx - Fg.k * 8, fy, Fg.k * 22, Fg.k * 3.4, 0, 0, TAU); c.fill();
    const M = putFig(c, Fg, FTB, fx, fy - 3 * Fg.k), ch = M.at(CHE); scarfLive(c, ch.x - 1 * Fg.k, ch.y - 8 * Fg.k, Fg.k, t, -1); c.drawImage(Fg.cv, M.dx, M.dy);
    // the light on the water in the pail
    { const pl = I.well.pail, k = .6 + .4 * Math.sin(t * 5.2), g = 26 * s * k; c.save(); c.globalCompositeOperation = 'lighter'; c.drawImage(F.glow, pl.x - g, pl.y - g, g * 2, g * 2); c.restore(); }
    sandWind(c, B, t, I.hz, y0 + vh * .9, 34, .28, false); c.restore(); sandWind(c, B, t + 9, y0 + vh * .5, y0 + vh, 7, .26, true); c.drawImage(P.glow, 0, 0, B.w, B.h); }
  // Waiting: the air he lies on becomes a dune under him, the wire beside him, the noon over it. The far of it is the inking's plate;
  // the dune and the post are drawn in the world's own terms under where his body is, and he is drawn again over them.
  function drawDune(c, P, t, bare) { const B = P.B, K = hero(), I = P.ink; c.drawImage(I.cv, 0, 0, B.w, B.h);
    const s = cv.width / cam.viewW, L = cam.x - cam.viewW / 2, T = camTop(), vw = cam.viewW; let lo = -1e9, x0 = 1e9, x1 = -1e9;
    for (const i of [PEL, CHE, HEAD, KNF, FTF, KNB, FTB]) { const q = K.p[i], y = prjY(q.y, K.dep) + (q.r || 3), x = prjX(q.x, K.dep); lo = Math.max(lo, y); x0 = Math.min(x0, x); x1 = Math.max(x1, x); }
    const cx = (x0 + x1) / 2, top = lo - 2, Dn = P.dune; c.save(); c.setTransform(s, 0, 0, s, -L * s, -T * s);
    c.drawImage(Dn.cv, cx + Dn.x0, top + Dn.y0, Dn.w, Dn.h);
    // a post of the wire by his head, the strands going off both ways
    { const px = cx + (x1 - x0) * .5 + 46, py = top + 12, hh = 150; c.fillStyle = '#2c1b13'; c.beginPath(); c.moveTo(px - 4, py); c.lineTo(px - 1, py - hh); c.lineTo(px + 4.4, py - hh - 1); c.lineTo(px + 5, py); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(255,214,150,.8)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(px + 4.4, py); c.lineTo(px + 4, py - hh); c.stroke();
      c.strokeStyle = 'rgba(46,28,18,.9)'; c.lineWidth = 1.6; for (const f of [.93, .72, .5]) { const y = py - hh * f; c.beginPath(); c.moveTo(px + 1, y); c.quadraticCurveTo(px + 180, y + 26, L + vw + 30, y - 18 + f * 20); c.moveTo(px + 1, y); c.quadraticCurveTo(px - 200, y + 30, L - 30, y + 8 - f * 30); c.stroke(); } }
    if (!bare) { c.translate(K.dep * PSX, -K.dep * PSY); drawKael(K); }
    c.restore();
    sandWind(c, B, t, B.y0 + B.vh * .4, B.y0 + B.vh, 22, .26, false); c.drawImage(P.glow, 0, 0, B.w, B.h); }
  function drawKind(c, P, kind, t, bare) { if (kind === 'ink') { drawInk(c, P, t); } else if (kind === 'wire') { drawWire(c, P, t); } else if (kind === 'well') { drawWell(c, P, t); } else if (kind === 'dune') { drawDune(c, P, t, bare); } }

  function drawStrip(c, B) { const Z = V.strip, P0 = plates(), zc = Z.kind === 'well' ? P0.well.cv : Z.kind === 'wire' ? P0.wire.cv : P0.ink.cv, uu = clamp((S.t - Z.t0) / Z.dur, 0, 1), N = reduceMotion ? 1 : 60, sw = Math.ceil(B.w / N); if (uu >= 1) { V.strip = null; return; }
    for (let i = 0; i < N; i++) { const d = reduceMotion ? 0 : (i / N) * .3 + hsh(i, 9) * .3, v = clamp((uu - d) / (1 - d), 0, 1), e = reduceMotion ? 0 : v * v * (1.05 + .5 * hsh(i, 5)), al = (reduceMotion ? 1 - v : 1 - v * v * v) * Z.a; if (al <= 0) { continue; } c.globalAlpha = al;
      { const kx = zc.width / B.w; c.drawImage(zc, i * sw * kx, 0, sw * kx, zc.height, i * sw, -e * B.h, sw, B.h); } }
    if (Z.kind === 'well' && uu < .3) { const P = plates(), I = P.well, Fg = figs(P).well, M = putFig(c, Fg, FTB, I.wx - I.him * I.s, I.wy + 10 * I.s - 3 * Fg.k); c.globalAlpha = (1 - uu / .3) * Z.a; c.drawImage(Fg.cv, M.dx, M.dy - uu * uu * B.h * .8); }
    c.globalAlpha = 1; }
  // Under a memory that covers the whole picture nothing of the fall shows, so none of it is put down: the page's drawing runs as
  // always (every piece the fall keeps is kept up: skipping the drawing made its painter take up to a second on the first frame
  // back), but inside an empty clip, where a draw costs next to nothing; the pass below lifts the clip before it draws the memory.
  let CLIP = false;
  const covered = () => state.run && !state.err && S.arenaKey === 'fall' && !!V.kind && V.alpha >= 1 && !V.strip && !!PL.P && !PL.P.freed;
  function unclip() { if (!CLIP) { return; } CLIP = false; ctx.restore(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
  // the pass itself: under the story's bars and words
  function drawVision() { unclip(); if (!state.run || S.arenaKey !== 'fall' || (!V.kind && V.white <= 0 && !V.strip && !V.eye && !V.wash && !V.last && !V.heli)) { return; } const c = ctx; c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
    try { const P = plates(), B = P.B;
      if (V.kind && V.alpha > 0) { c.globalAlpha = V.alpha; drawKind(c, P, V.kind, vt()); c.globalAlpha = 1; c.setTransform(1, 0, 0, 1, 0, 0); }
      if (V.strip) { drawStrip(c, B); }
      // the light that comes up in his eye and takes the picture, on the way in
      if (V.eye) { const K = hero(), s = cv.width / cam.viewW, hx = (prjX(K.p[HEAD].x, K.dep) - (cam.x - cam.viewW / 2)) * s, hy = (prjY(K.p[HEAD].y, K.dep) - camTop()) * s, F = figs(P), g = (10 + 900 * V.eye * V.eye) * B.u;
        c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.min(1, V.eye * 2.2); c.drawImage(F.glow, hx - g, hy - g, g * 2, g * 2); c.restore(); }
      if (V.white > 0 && !reduceMotion) { c.globalAlpha = clamp(V.white, 0, 1); c.fillStyle = '#fff7e2'; c.fillRect(0, 0, B.w, B.h); c.globalAlpha = 1; }
      if (V.heli) { const t = S.t - V.heli.t0, a = clamp(t / .5, 0, 1) * clamp((V.heli.dur - t) / .5, 0, 1), x = B.w * ((B.tall ? .9 : .765) + .006 * t), y = B.y0 + B.vh * (.3 - .03 * t), F = figs(P), g = 15 * B.u;
        c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a * .75; c.drawImage(F.glow, x - g, y - g, g * 2, g * 2); c.globalAlpha = a; c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x, y, 1.7 * B.u, 0, TAU); c.fill();
        if ((t % .9) < .13) { c.fillStyle = '#ff5340'; c.beginPath(); c.arc(x - 6.5 * B.u, y + 1.6 * B.u, 2.1 * B.u, 0, TAU); c.fill(); } c.restore(); }
      if (V.wash) { const u = (S.t - V.wash.t0) / V.wash.dur; if (u >= 1) { V.wash = null; } else if (!reduceMotion) { c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(' + V.wash.col + ',' + (.3 * (1 - u) * (1 - u)).toFixed(3) + ')'; c.fillRect(0, 0, B.w, B.h); c.restore(); } }
      // the last light: the dark closing from the picture's edges on the arm, then on its lines alone, then all of it
      if (V.last && S.pit && S.pit.arm) { const u = clamp((S.t - V.last.t0) / V.last.dur, 0, 1), s = cv.width / cam.viewW, A = armAt(), ax = (A.x - (cam.x - cam.viewW / 2)) * s, ay = (A.y - camTop()) * s;
        const r1 = lerp(Math.hypot(B.w, B.h) * .9, 46 * s, sstep(clamp(u / .6, 0, 1))) * (1 - sstep(clamp((u - .8) / .2, 0, 1))), r0 = r1 * .12;
        c.fillStyle = r1 < 1 ? '#000' : rad(c, ax, ay, r0, r1, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,1)']]); c.fillRect(0, 0, B.w, B.h); } }
    catch (e) { state.err = String(e && e.message || e); V.kind = null; V.white = 0; V.strip = null; V.eye = 0; V.last = null; }
    c.restore(); }
  function freePlates() { const P = PL.P; if (!P) { return; } for (const o of [P.ink, P.wire, P.well, P.dune]) { for (const k of ['cv', 'fg']) { const d = o && Object.getOwnPropertyDescriptor(o, k); if (d && d.value && d.value.width) { d.value.width = d.value.height = 0; } } }
    if (P.fig) { for (const k of ['inkLit', 'inkDark', 'wire', 'well']) { const d = Object.getOwnPropertyDescriptor(P.fig, k); if (d && d.value && d.value.cv) { d.value.cv.width = d.value.cv.height = 0; } } } PL.P = null; PL.key = ''; }
  function drawFx() { if (!state.run || S.arenaKey !== 'fall' || !S.pit) { return; } const K = hero(), c = ctx;
    if (FX.beads.length && !(V.kind && V.alpha > .5)) { c.save(); c.fillStyle = typeof GORE_COL !== 'undefined' && GORE_COL[S.gore] ? GORE_COL[S.gore].mark : '#a01420';
      for (const b of FX.beads) { const q = P(b.x, b.y, K.dep), a = clamp(1 - b.age / b.life, 0, 1); c.globalAlpha = Math.min(1, a * 1.6); c.beginPath(); c.ellipse(q.x, q.y, b.r * .8, b.r * 1.5, 0, 0, TAU); c.fill(); } c.restore(); }
    // the eye's spark: a star of light where his eye is, large as it comes and settling small, and a glint on the straw about it
    const sp = V.spark; if (sp) { const t = S.t - sp.t0, h = K.p[HEAD], c0 = K.p[CHE], ux = h.x - c0.x, uy = h.y - c0.y, L = Math.hypot(ux, uy) || 1, fa = K.facing, e = P(h.x + (-uy / L) * fa * 3.4 + ux / L * 1.5, h.y + (ux / L) * fa * 3.4 + uy / L * 1.5, K.dep);
      const k = t < .5 ? eOut(t / .5) : 1 - .62 * sstep(clamp((t - .5) / 1.3, 0, 1)), R = (2 + 15 * k) * (reduceMotion ? .7 : 1 + .08 * Math.sin(t * 9)), a = clamp(t / .25, 0, 1);
      c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a;
      c.fillStyle = 'rgba(190,246,255,.9)'; c.beginPath(); for (let i = 0; i < 4; i++) { const an = i * Math.PI / 2 + .3, an2 = an + Math.PI / 4; c.lineTo(e.x + Math.cos(an) * R, e.y + Math.sin(an) * R); c.lineTo(e.x + Math.cos(an2) * R * .16, e.y + Math.sin(an2) * R * .16); } c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,.95)'; c.beginPath(); c.arc(e.x, e.y, 1.3 + k * 1.2, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(190,246,255,' + (.5 * k).toFixed(3) + ')'; c.lineWidth = 1.5; c.beginPath(); for (let i = 0; i < 7; i++) { const an = hsh(i, 61) * TAU, r0 = 9 + hsh(i, 67) * 22, x = e.x + Math.cos(an) * r0, y = e.y + Math.abs(Math.sin(an)) * r0 * .5 + 4, l = 3 + hsh(i, 71) * 5; c.moveTo(x - l, y + l * .3); c.lineTo(x + l, y - l * .3); } c.stroke();
      c.restore(); } }
  // the cyan of the tower's setbacks on him as each goes by (every tenth floor: about once a second), as the light that rims him
  function lightOf(f, L) { if (!state.run || reduceMotion || S.arenaKey !== 'fall' || f !== S.F[0] || !S.pit || S.pit.on || (V.kind && V.alpha > .5)) { return L; }
    const d = ((S.scrollY || 0) + 105) % 1000, near = Math.min(d, 1000 - d), k = clamp(1 - near / 170, 0, 1); if (k <= 0) { return L; }
    return Object.assign({}, L, { rk: (L.rk || 1) * (1 + 1.3 * k * k) }); }


  // (once the Pit has him only the small pieces are kept: the plates and the figures in them go)
  function freeBig() { const P = PL.P; if (!P || P.freed) { return; } const keep = P.fig && Object.getOwnPropertyDescriptor(P.fig, 'glow'); freePlates(); if (keep && keep.value) { const Q = plates(); figs(Q); Object.defineProperty(Q.fig, 'glow', { value: keep.value, writable: true }); Q.freed = true; Q.wi = 99; } }

  // ---------- into the page ----------
  V11UI.screen.unshift(drawVision); V11UI.world.push(drawFx); V11UI.tick.push(warmTick);
  { const kl = kaelLight; kaelLight = function (f) { return lightOf(f, kl(f)); }; }   // eslint-disable-line no-global-assign
  // the scene's camera: with reduced motion every shot is a cut; and the picture is kept above the lowest it may show (C.footMax)
  { const r0 = render; render = function () { if (!covered()) { return r0(); }   // eslint-disable-line no-global-assign
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 0, 0); ctx.clip(); CLIP = true; try { r0(); } finally { unclip(); } }; }
  { let seen = null; const uc = updateCamera; updateCamera = function (rdt) { const C = S.camCut; if (C && C.fc && reduceMotion) { C.k = 0; if (C !== seen) { seen = C; cam.cut = true; } } uc(rdt); }; }   // eslint-disable-line no-global-assign
  { const ct = camTarget; camTarget = function () { const t = ct(), C = S.camCut; if (!C || C.footMax == null) { return t; }   // eslint-disable-line no-global-assign
      const s = cssW / Math.max(1, cam.viewW), bar = S.letter ? cssH * .105 : 0; return Math.min(t, C.footMax - (cssH - Math.max(HUD_IN.bottom, bar)) / s); }; }
  return { plates, rangerOf, bakeFigure, drawVision, PL };
})();
