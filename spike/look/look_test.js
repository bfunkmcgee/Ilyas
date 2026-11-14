// ===== LOOK TEST (a test on a branch, not part of the game) =====
// Three things to judge by eye, each with a switch under "Look tests" in the Options panel, each off until it is switched on. With
// all three off the game draws exactly as it did. Nothing here is read by the game: it only draws.
//
//   dither   a fine blue noise laid into the picture round the finish, between the story's bars: every pixel a level or two lighter
//            by a pattern with no clumps in it (bluenoise.js, made by tools/bluenoise.py). It is too fine and too faint to see as
//            grain. What it does is break up the steps a slow dark gradient shows where 256 levels are not enough: the bands
//            down the picture's darkened edges, the rings round a lamp's glow.
//   grain    the same tile at twice the size, making what is under it a little lighter or darker by a share of its own
//            brightness: a grain coarse enough to show on a phone, strongest where the picture is lit, and none in the black
//            (the finish's own grain is a pixel of the canvas and is left off under 640 points).
//   ink      a weapon's trail as one brush stroke: a line that follows the blade's outer part, its width the width the blade swept
//            there, drawn out to a point where the swing began (perfect-freehand, MIT, vendor/perfect-freehand.min.js). The game's
//            own trail is a band of four-cornered pieces, each fading on its own.
//
// The switches are remembered (`sk_looktest` in the browser's storage). ?look=dither,grain,ink in the address switches those on.
// LOOKTEST (below) holds the state and the numbers to try: LOOKTEST.pre, .post, .grainA, and the brush's .at, .wide, .slim, .tail and .a.
/* global cv, ctx, S, DT, FXL, FLOW, reduceMotion, ST_LB, LOOK_BN, PerfectFreehand, sceneFinish:writable, drawTrail:writable */
(function () {
  'use strict';
  if (typeof cv === 'undefined' || typeof ctx === 'undefined' || typeof LOOK_BN === 'undefined') { return; }
  const PF = typeof PerfectFreehand !== 'undefined' ? PerfectFreehand : null;
  const KEYS = ['dither', 'grain', 'ink'];
  const state = {
    dither: false, grain: false, ink: false,
    // the dither: the most levels a pixel is lifted (0 to that many, evenly), before the finish darkens the picture's edges and
    // lays its glow on, and after it
    pre: 2, post: 1,
    grainA: .06,       // the grain: how strongly it is laid on
    // the brushed trail: where its line runs between the swept band's inner edge (0) and the blade's tip (1), the share of the
    // swept width it takes, the most of its own length it may be wide, how much of its length draws out to a point, and how
    // strongly it is laid on (plain, coloured)
    at: .88, wide: .4, slim: .2, tail: .8, a: [.46, .5],
    err: null, ms: 0, strokes: 0, passes: 0
  };
  try { const o = JSON.parse(localStorage.getItem('sk_looktest') || 'null'); if (o) { for (const k of KEYS) { if (typeof o[k] === 'boolean') { state[k] = o[k]; } } } } catch (e) { /* no storage: all off */ }
  const q = new URLSearchParams(location.search).get('look');
  if (q != null) { for (const k of KEYS) { state[k] = q.split(',').includes(k); } }
  if (!PF) { state.ink = false; }
  const save = () => { try { const o = {}; for (const k of KEYS) { o[k] = !!state[k]; } localStorage.setItem('sk_looktest', JSON.stringify(o)); } catch (e) { /* no storage: nothing kept */ } };
  window.LOOKTEST = state;

  // ---------- the tile ----------
  const N = LOOK_BN.n;
  let BN = null;
  function tile() {
    if (BN) { return BN; }
    const s = atob(LOOK_BN.d); BN = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) { BN[i] = s.charCodeAt(i); }
    return BN;
  }
  const pats = {};
  // the dither's tile: each pixel 0 to k levels of grey, to be added to the picture
  function ditherPat(k) {
    const key = 'd' + k; if (pats[key]) { return pats[key]; }
    const c = document.createElement('canvas'); c.width = c.height = N;
    const g = c.getContext('2d'), im = g.createImageData(N, N), t = tile();
    for (let i = 0; i < N * N; i++) { const v = Math.floor(t[i] * (k + 1) / 256); im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
    g.putImageData(im, 0, 0);
    return (pats[key] = ctx.createPattern(c, 'repeat'));
  }
  // the grain's tile, at twice the size: greys either side of the middle, to be laid on in the 'overlay' blend, which makes what
  // is under a lighter grey lighter and what is under a darker one darker, each by a share of its own brightness: black stays
  // black (a grain of light and dark specks laid plainly over a dark picture lifts it into a haze), and the grain shows most
  // where the picture is lit, as a film's does
  function grainPat() {
    if (pats.g) { return pats.g; }
    const M = N * 2, c = document.createElement('canvas'); c.width = c.height = M;
    const g = c.getContext('2d'), im = g.createImageData(M, M), t = tile();
    for (let y = 0; y < M; y++) {
      for (let x = 0; x < M; x++) { const i = (y * M + x) * 4; im.data[i] = im.data[i + 1] = im.data[i + 2] = t[(y >> 1) * N + (x >> 1)]; im.data[i + 3] = 255; }
    }
    g.putImageData(im, 0, 0);
    return (pats.g = ctx.createPattern(c, 'repeat'));
  }

  // ---------- the dither and the grain: round the finish, before the fight's words and the bars ----------
  // The dither is laid twice. Before the finish: the finish darkens the picture toward its edges by a slow gradient, and a picture
  // with the noise already in it comes out of that darkening with its steps broken up for good (each pixel rounds its own way, and
  // on average they land on the smooth slope). After it: fainter, over the glow the finish adds, whose own steps the first cannot
  // reach. The grain goes on last.
  function lay(k, f, still, W, H, y0) {
    const ox = still ? 0 : (f * 53) % N, oy = still ? 0 : (f * 97) % N;
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1; ctx.fillStyle = ditherPat(Math.max(1, Math.min(8, k | 0)));
    ctx.translate(-ox, -oy); ctx.fillRect(ox, y0 + oy, W, H - 2 * y0); ctx.translate(ox, oy);
  }
  function pass(after) {
    if (!state.dither && !(after && state.grain)) { return; }
    if (typeof FXL !== 'undefined' && FXL.q === 'off') { return; }
    const W = cv.width, H = cv.height; if (!W || !H) { return; }
    const t0 = performance.now();
    // (the tile moves every frame, still where motion is reduced: what the eye adds up over a few frames is smoother again)
    const f = (typeof S !== 'undefined' && S._rf) || 0, still = typeof reduceMotion !== 'undefined' && reduceMotion;
    const bars = typeof ST_LB === 'number' ? Math.max(0, Math.min(1, ST_LB)) : 0, y0 = Math.floor(H * .105 * bars);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (state.dither && !after && state.pre > 0) { lay(state.pre, f, still, W, H, y0); }
    if (state.dither && after && state.post > 0) { lay(state.post, f + 7, still, W, H, y0); }
    if (state.grain && after) {
      const M = N * 2, ox = still ? 0 : (f * 61) % M, oy = still ? 0 : (f * 113) % M;
      ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = state.grainA; ctx.fillStyle = grainPat();
      ctx.translate(-ox, -oy); ctx.fillRect(ox, y0 + oy, W, H - 2 * y0);
    }
    ctx.restore();
    if (after) { state.passes++; }
    state.ms += (performance.now() - t0 - state.ms) * .1;
  }
  if (typeof sceneFinish === 'function') {
    const fin = sceneFinish;
    sceneFinish = function () {
      try { pass(false); } catch (e) { state.err = String((e && e.message) || e); state.dither = state.grain = false; }
      fin.apply(this, arguments);
      try { pass(true); } catch (e) { state.err = String((e && e.message) || e); state.dither = state.grain = false; }
    };
  }

  // ---------- the brushed trail ----------
  const lerp = (a, b, t) => a + (b - a) * t, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // one run of a trail (its samples a step apart, of one colour) as a stroke; false where there is too little of it to brush
  function brush(run) {
    const n = run.length, C = new Array(n);
    for (let i = 0; i < n; i++) {
      // (the band the game's own trail fills at this sample: from the tip in toward the grip, less of it as it ages)
      const p = run[i], u = clamp(p.age / p.life, 0, 1), w = 1 - u * u, ix = lerp(p.tx, p.hx, w), iy = lerp(p.ty, p.hy, w);
      C[i] = { x: lerp(ix, p.tx, state.at), y: lerp(iy, p.ty, state.at), bx: p.tx - ix, by: p.ty - iy, w: 0 };
    }
    // (the width a brush wants is across its path: a cut sweeps the blade's whole length, a thrust only its thickness)
    let maxW = 0, len = 0;
    for (let i = 0; i < n; i++) {
      const a = C[Math.max(0, i - 1)], b = C[Math.min(n - 1, i + 1)], c = C[i]; let dx = b.x - a.x, dy = b.y - a.y; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      c.w = Math.abs(dx * c.by - dy * c.bx) * state.wide; if (c.w > maxW) { maxW = c.w; }
      if (i) { len += Math.hypot(c.x - C[i - 1].x, c.y - C[i - 1].y); }
    }
    // (a stroke is a line: never wider than a share of its own length, or a short trail would come out a blot)
    maxW = Math.min(maxW, len * state.slim);
    if (maxW < 1.5 || len < 6) { return false; }
    const head = run[n - 1], uh = clamp(head.age / head.life, 0, 1), col = head.c, al = (col ? state.a[1] : state.a[0]) * Math.pow(1 - uh, 1.5);
    if (al <= .004) { return true; }
    const pts = C.map(c => [c.x, c.y, clamp(c.w / maxW, .05, 1)]);
    const opt = { size: maxW / 2, thinning: 1, smoothing: .6, streamline: .25, simulatePressure: false, last: true, start: { taper: len * state.tail, cap: false }, end: { taper: 0, cap: true } };
    const fill = (o) => {
      const m = o.length; if (m < 3) { return; }
      ctx.beginPath(); ctx.moveTo((o[m - 1][0] + o[0][0]) / 2, (o[m - 1][1] + o[0][1]) / 2);
      for (let i = 0; i < m; i++) { const a = o[i], b = o[(i + 1) % m]; ctx.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); }
      ctx.closePath(); ctx.fill();
    };
    ctx.globalAlpha = al; ctx.fillStyle = col || '#ffecd0'; if (col) { ctx.globalCompositeOperation = 'lighter'; }
    fill(PF.getStroke(pts, opt));
    // (a coloured trail's bright core while it is young, as the game's own has its bright edge)
    if (col && uh < .5) { ctx.globalAlpha = al * .9 * (1 - uh * 2); ctx.fillStyle = '#fff6e0'; opt.size = Math.max(.8, maxW * .11); fill(PF.getStroke(pts, opt)); }
    if (col) { ctx.globalCompositeOperation = 'source-over'; }
    state.strokes++;
    return true;
  }
  if (PF && typeof drawTrail === 'function') {
    const own = drawTrail;
    drawTrail = function (tr) {
      if (!state.ink || !tr || tr.length < 2) { return own(tr); }
      try {
        // (a trail breaks where the blade was not recorded for a step or more, and where its colour changes)
        let run = [], left = null;
        const flush = () => { if (run.length >= 2 && !brush(run)) { (left = left || []).push(run); } run = []; };
        for (let i = 0; i < tr.length; i++) { const p = tr[i]; if (i && (p.t - tr[i - 1].t > DT * 2.5 || p.c !== tr[i - 1].c)) { flush(); } run.push(p); }
        flush(); ctx.globalAlpha = 1;
        // (what was too slight to brush is drawn as it always was)
        if (left) { for (const r of left) { own(r); } }
      } catch (e) { state.err = String((e && e.message) || e); state.ink = false; ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; own(tr); }
    };
  }

  // ---------- the switches, under the Options panel's own ----------
  let rows = null, tries = 0;
  function panelRows() {
    const p = typeof FLOW !== 'undefined' && FLOW.on && FLOW.panel && FLOW.panel.querySelector('.fw-in');
    if (!p) { if (++tries < 200) { setTimeout(panelRows, 300); } return; }
    if (rows) { return; }
    const parts = [['dither', 'Dither', 'A fine noise that hides the steps in dark gradients'], ['grain', 'Film grain', 'A coarser grain that shows on a phone']];
    if (PF) { parts.push(['ink', 'Brushed trails', 'A blade\'s trail as one tapered brush stroke']); }
    const h = document.createElement('p'); h.className = 'fw-h'; h.textContent = 'Look tests';
    rows = document.createElement('div'); rows.className = 'fw-parts';
    rows.innerHTML = parts.map(([k, n, d]) => '<label class="fw-part"><input type="checkbox" data-lt="' + k + '"><span><b>' + n + '</b><small>' + d + '</small></span></label>').join('');
    const before = p.querySelector('.fw-stat') || p.querySelector('.fw-foot');
    p.insertBefore(h, before); p.insertBefore(rows, before);
    rows.querySelectorAll('input[data-lt]').forEach(c => { c.checked = !!state[c.dataset.lt]; });
    rows.addEventListener('change', e => { const c = e.target, k = c && c.dataset && c.dataset.lt; if (!k) { return; } e.stopPropagation(); state[k] = !!c.checked; save(); });
  }
  panelRows();
})();
