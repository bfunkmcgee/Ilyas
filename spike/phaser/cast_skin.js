// The cast's skins (Nov 11; asked for: more detailed skins for everyone, as Ilyas has). Not in the game: the test pages only.
//
// Ilyas's skin is art drawn piece by piece for one man (skin_art_*.js). There are forty-odd others, each made from a spec (his cut,
// his colours, his head, his build), so theirs are made from the spec too: the cast's painter (sk_castui.js) paints each part of a
// man once, alone, on a figure stood straight, at six pixels a unit and at its closest detail, and every shape it paints goes
// through this file's own painting (paint, below), which can afford what a frame cannot: a soft shadow under each layer, a form to
// each shape (lighter down its middle, darker to its edges), a grain by its material. The parts are kept as textures: each arm and
// leg, near and far, the torso in two layers, the head. When the game draws him the painter still does the posing and the layering
// and lays the textures on (CastLook.skin, the hook; sk_castui.js says where): an arm's or a leg's shapes are filled from its
// texture along the limb as it bends, the torso and the head drawn from theirs, and the light of the place goes on over them.
//
// What it does not cover: a turned figure (the painter paints him as ever), hands, shoes, the neck, a coat's skirt, an apron,
// and the eyes, which are drawn each frame; the beasts and Ilyas, who are not the cast's painter's.
//
// The parts are made a few milliseconds at a time, one a frame, the first time a man is drawn; until his are made he is painted.
const CastSkin = (() => {
  'use strict';
  const TS = 6, PA = .5, PARTS = ['torso1', 'head', 'armN', 'legN', 'armF', 'legF', 'torso2'];
  // (state.no: parts left to the painter, to tell what each costs: any of l (limbs), t (torso), h (head), m (the materials' tiles))
  const state = { on: true, err: null, men: 0, parts: 0, failed: 0, ms: 0, worst: 0, calls: 0, full: 0, last: '', no: '' };
  const ENT = new WeakMap(), QUEUE = new Set();
  let stamp = -1, scratch = null;
  const V = (x, y) => ({ x, y }), sub = (a, b) => V(a.x - b.x, a.y - b.y), len = a => Math.hypot(a.x, a.y), nrm = a => { const l = len(a) || 1; return V(a.x / l, a.y / l); }, perp = a => V(-a.y, a.x);
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
  const sctx = () => scratch || (scratch = mk(2, 2).getContext('2d'));

  // ---------- the painting of a bake ----------
  // grain by material: a tile of specks, light and dark, laid over the shape a pixel to a pixel
  const GRAIN = {};
  function grain(kind) {
    if (GRAIN[kind]) { return GRAIN[kind]; }
    const n = 96, cv = mk(n, n), x = cv.getContext('2d'), im = x.createImageData(n, n), d = im.data; let s = { wool: 11, cotton: 23, leather: 37, hair: 53, skin: 71 }[kind] || 5;
    const r = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    const amt = { wool: 9, cotton: 6, leather: 7, hair: 16, skin: 3 }[kind] || 6;
    // (leather: soft blotches, a coarse grid of chances smoothed between its points)
    const G = 4, grid = []; for (let i = 0; i < G * G; i++) { grid.push(r()); } const blot = (i, j) => { const u = i / n * G, v = j / n * G, i0 = Math.floor(u) % G, j0 = Math.floor(v) % G, i1 = (i0 + 1) % G, j1 = (j0 + 1) % G, fu = u - Math.floor(u), fv = v - Math.floor(v), sm = t => t * t * (3 - 2 * t), a = sm(fu), b = sm(fv);
      return (grid[j0 * G + i0] * (1 - a) + grid[j0 * G + i1] * a) * (1 - b) + (grid[j1 * G + i0] * (1 - a) + grid[j1 * G + i1] * a) * b; };
    for (let j = 0; j < n; j++) { for (let i = 0; i < n; i++) { const o = (j * n + i) * 4, v = r();
      // (hair: streaks down it; leather: blotches; cloth: specks)
      const t = kind === 'hair' ? (Math.sin(i * 1.9 + Math.sin(j * .11) * 2.2) * .5 + .5) * .7 + v * .3 : kind === 'leather' ? blot(i, j) * .45 + v * .55 : v;
      const lightSpeck = t > .5; d[o] = d[o + 1] = d[o + 2] = lightSpeck ? 255 : 0; d[o + 3] = Math.round(Math.abs(t - .5) * 2 * amt); } }
    x.putImageData(im, 0, 0); return GRAIN[kind] = sctx().createPattern(cv, 'repeat');
  }
  const KIND = { wool: 'wool', cotton: 'cotton', satin: 'cotton', leather: 'leather', hide: 'leather', skin: 'skin', gskin: 'skin', hair: 'hair', hat: 'wool' };
  // how thick a shape is (world units): twice its area over its outline's length, from the pieces' own points
  function thick(ps) { if (!ps) { return 7; } let A = 0, P = 0; for (const q of ps) { const o = q.o; if (!o || o.length < 3) { return 7; }
    for (let i = 0; i < o.length; i++) { const a = o[i], b = o[(i + 1) % o.length]; A += a.x * b.y - b.x * a.y; P += Math.hypot(b.x - a.x, b.y - a.y); } } return P ? Math.max(1.5, Math.abs(A) / P) : 7; }
  const lift = (hex, t) => { if (typeof hex !== 'string' || hex[0] !== '#' || hex.length !== 7) { return hex; } const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255, T = [150, 140, 132];
    return '#' + [r, g, b].map((v, i) => Math.round(v + (T[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
  // one shape of a part: its shadow on what is under it, itself a little lifted, the shade of its own edges inside it, its grain.
  // (the shadows are a shape drawn far off the canvas with its shadow thrown back onto it: only the shadow lands)
  function paint(c, ps, mat, env, base, U, cls) {
    const m = c.getTransform(), D = c.canvas.width + 600, w = thick(ps), kind = KIND[cls] || KIND[mat] || 'wool', dark = kind === 'skin' ? .3 : .4;
    c.save(); c.globalCompositeOperation = 'source-atop'; c.setTransform(m.a, m.b, m.c, m.d, m.e - D, m.f);
    c.shadowColor = 'rgba(3,2,7,.5)'; c.shadowBlur = 1.1 * TS; c.shadowOffsetX = D; c.shadowOffsetY = .3 * TS; c.fillStyle = '#000'; c.fill(U); c.restore();
    const col = lift(base, kind === 'skin' ? .03 : .04), sc = Math.hypot(m.a, m.b) || 1; c.fillStyle = col; c.fill(U);
    // (a seam just inside the edge of a shape with some width to it: stitches on leather, a pressed edge on cloth. Two strokes kept
    // inside the shape, the second in its own colour over all but the seam)
    if (w > 2.6 && kind !== 'skin' && kind !== 'hair' && ps) { const d = (kind === 'leather' ? 4.2 : 5) / sc, hw = .75 / sc; c.save(); c.clip(U); c.lineJoin = 'round';
      if (kind === 'leather') { c.setLineDash([2.2 / sc, 1.8 / sc]); c.strokeStyle = 'rgba(226,204,160,.34)'; } else { c.strokeStyle = 'rgba(2,2,5,.3)'; }
      c.lineWidth = 2 * (d + hw); c.stroke(U); c.setLineDash([]); c.strokeStyle = col; c.lineWidth = 2 * (d - hw); c.stroke(U); c.restore(); }
    // (the torso and the head stand as they are painted: a little more light on the top of each shape than at its foot)
    if (PART && PART[0] !== 'a' && PART[0] !== 'l' && ps) { const bb = boxOf(ps, m, c.canvas, 0), g = c.createLinearGradient(0, bb[1], 0, bb[3]); g.addColorStop(0, 'rgba(255,244,226,.07)'); g.addColorStop(.5, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,6,.2)');
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const U2 = new Path2D(); U2.addPath(U, m); c.fillStyle = g; c.fill(U2); c.restore(); }
    // (what is outside the shape, in the canvas's own pixels, as far round it as its shadow reaches: that shadow falls inside it)
    const blur = Math.max(3, Math.min(15, w * .2 * TS)), bb = boxOf(ps, m, c.canvas, blur * 3 + 4), hole = new Path2D(); hole.rect(bb[0], bb[1], bb[2] - bb[0], bb[3] - bb[1]); hole.addPath(U, m);
    c.save(); c.clip(U); c.setTransform(1, 0, 0, 1, -D, 0); c.shadowColor = 'rgba(3,2,7,' + dark + ')'; c.shadowBlur = blur; c.shadowOffsetX = D; c.fillStyle = '#000';
    c.fill(hole, 'evenodd'); c.restore();
    const g = grain(kind); g.setTransform(m.inverse()); c.fillStyle = g; c.fill(U); NPAINT++;
    if (ps && BOX) { const b = boxOf(ps, m, c.canvas, 0); if (b[0] < -80) { BOX = null; } else { if (b[0] < BOX[0]) { BOX[0] = b[0]; } if (b[1] < BOX[1]) { BOX[1] = b[1]; } if (b[2] > BOX[2]) { BOX[2] = b[2]; } if (b[3] > BOX[3]) { BOX[3] = b[3]; } } } else { BOX = null; }
  }
  // a shape's box in the canvas's pixels, grown by pad (the whole canvas where its points are not known)
  function boxOf(ps, m, cv, pad) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, ok = !!ps;
    if (ps) { for (const q of ps) { const o = q.o; if (!o || !o.length) { ok = false; break; } for (const a of o) { const x = m.a * a.x + m.c * a.y + m.e, y = m.b * a.x + m.d * a.y + m.f; if (x < x0) { x0 = x; } if (x > x1) { x1 = x; } if (y < y0) { y0 = y; } if (y > y1) { y1 = y; } } } }
    return ok ? [x0 - pad, y0 - pad, x1 + pad, y1 + pad] : [-90, -90, cv.width + 90, cv.height + 90]; }
  let NPAINT = 0, PART = null, BOX = null;

  // a material on its own: the lifted colour and the grain as a tile, for the shapes painted each frame beside the textures (a
  // coat's skirt, the seat, an apron, the neck, the hands), so they are of a piece with them. It lies still on the figure (its
  // pelvis, set by the hook each time he is drawn). At the game's own size the grain is too fine to see and the colour alone is laid.
  const TILE = new Map(); let ORG = { x: 0, y: 0 }, KNOW = 3;
  function tile(base, cls, mat) { if (state.no.includes('m')) { return null; } const kind = KIND[cls] || KIND[mat] || 'wool', key = base + kind; let t = TILE.get(key);
    if (!t) { if (TILE.size > 90) { TILE.clear(); } const cv = mk(96, 96), x = cv.getContext('2d'), col = lift(base, kind === 'skin' ? .03 : .04); x.fillStyle = col; x.fillRect(0, 0, 96, 96); const g = grain(kind); g.setTransform(new DOMMatrix()); x.fillStyle = g; x.fillRect(0, 0, 96, 96);
      t = { pa: PA, col, p: sctx().createPattern(cv, 'repeat'), flat() { return KNOW < 2.7 ? this.col : null; }, fill(c, U) { this.p.setTransform(new DOMMatrix([1 / TS, 0, 0, 1 / TS, ORG.x, ORG.y])); c.fillStyle = this.p; c.fill(U); } }; TILE.set(key, t); }
    return t; }

  // ---------- a man's textures ----------
  // the figure stood straight to be painted: the joints of his own body's lengths, facing right, arms and legs hanging
  function stood(F) {
    const p = F.p, d = (a, b) => Math.hypot(p[a].x - p[b].x, p[a].y - p[b].y), T = d(1, 0), n = d(2, 1), Lu = d(3, 1), Lf = d(4, 3), Lt = d(7, 0), Ls = d(8, 7);
    const q = []; q[0] = V(0, 0); q[1] = V(0, -T); q[2] = V(0, -T - n); q[3] = V(1, -T + Lu); q[4] = V(1, -T + Lu + Lf); q[5] = V(1, -T + Lu); q[6] = V(1, -T + Lu + Lf);
    q[7] = V(0, Lt); q[8] = V(0, Lt + Ls); q[9] = V(0, Lt); q[10] = V(0, Lt + Ls); q[11] = V(1, -T + Lu + Lf + 10);
    const G = Object.create(F); Object.assign(G, { p: q, facing: 1, yaw: 0, dead: false, severed: false, lookBack: false, opening: false, _yaw: 0 }); return G;
  }
  const OPT = part => ({ only: part, dir: { x: 0, y: -1 }, key: '#ffffff', rimK: 1, now: 0, yaw: 0 });
  let GEO = null;
  function geoOf(G, spec) { GEO = {}; const x = mk(8, 8).getContext('2d'); x.setTransform(TS, 0, 0, TS, 0, 0); CastLook.draw(x, G, spec, OPT('geo')); const g = GEO; GEO = null; return g; }
  // the edge's colours carried outward a few pixels, so a limb bent further than it was painted is still filled to its edge
  function bleed(cv) { const x = cv.getContext('2d'); x.save(); x.globalCompositeOperation = 'destination-over';
    for (const d of [2, 5]) { for (const [i, j] of [[d, 0], [-d, 0], [0, d], [0, -d], [d, d], [-d, d], [d, -d], [-d, -d]]) { x.drawImage(cv, i, j); } } x.restore(); }
  function half(cv) { const h = mk(cv.width / 2, cv.height / 2), x = h.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(cv, 0, 0, h.width, h.height); return h; }
  function drawPart(x, G, spec, part) { const f0 = FigKit.fine; HOOK.baking = true; FigKit.fine = true; GEO = {}; NPAINT = 0; PART = part; BOX = [1e9, 1e9, -1e9, -1e9];
    try { CastLook.draw(x, G, spec, OPT(part)); } finally { HOOK.baking = false; FigKit.fine = f0; } const g = GEO; GEO = null; return g; }

  // an arm or a leg: painted along the texture (the limb's root to its end left to right, its back side down), then cut in two at
  // the joint: each half a pattern that does not repeat, so a fill of the limb's shape takes each half only where that half lies
  function bakeLimb(e, G, spec, part) {
    const [S, E, W] = e.geo[part], ax = nrm(sub(W, S)), bk = perp(ax), L = len(sub(E, S)) + len(sub(W, E)), mu = 9, mv = part[0] === 'a' ? 10 : 15;
    const cv = mk((L + 2 * mu) * TS, 2 * mv * TS), x = cv.getContext('2d');
    x.setTransform(ax.x * TS, bk.x * TS, ax.y * TS, bk.y * TS, (-(S.x * ax.x + S.y * ax.y) + mu) * TS, (-(S.x * bk.x + S.y * bk.y) + mv) * TS);
    drawPart(x, G, spec, part); if (!NPAINT) { return { none: true }; } bleed(cv);
    const tp = q => V(((q.x - S.x) * ax.x + (q.y - S.y) * ax.y + mu) * TS, ((q.x - S.x) * bk.x + (q.y - S.y) * bk.y + mv) * TS), tR = tp(S), tM = tp(E), tE = tp(W);
    const lvl = (c0, k) => { const R = V(tR.x / k, tR.y / k), M = V(tM.x / k, tM.y / k), En = V(tE.x / k, tE.y / k), ov = Math.round(mv * 1.25 * TS / k), xl = Math.max(0, Math.round(M.x - 1.5 * TS / k)), wu = Math.min(c0.width, Math.round(M.x + ov));
      const up = mk(wu, c0.height), lo = mk(c0.width - xl, c0.height); up.getContext('2d').drawImage(c0, 0, 0); lo.getContext('2d').drawImage(c0, -xl, 0);
      return { R, M, E: En, xl, s: TS / k, pu: sctx().createPattern(up, 'no-repeat'), pl: sctx().createPattern(lo, 'no-repeat') }; };
    // (a small shape that lies wholly past the joint, a cuff or a boot's shaft, takes the lower half alone, and one before it the upper)
    return { limb: true, lv: [lvl(cv, 1), lvl(half(cv), 2)], pa: PA, cur: null, J: null, ax: null, len: 1,
      fill(c, U, ps) { const t = this.cur; let side = 0; if (ps && ps.length === 1 && ps[0].c && ps[0].r) { const q = ps[0], d = (q.c.x - this.J.x) * this.ax.x + (q.c.y - this.J.y) * this.ax.y; if (q.r < this.len * .3) { side = d > q.r * 1.5 ? 1 : d < -q.r * 1.5 ? -1 : 0; } }
        if (side <= 0) { c.fillStyle = t.pu; c.fill(U); } if (side >= 0) { c.fillStyle = t.pl; c.fill(U); } } };
  }
  // where a half of the limb's texture goes: its own root onto R, its axis along R to M at the limb's present length, its back side
  // to the back of the figure as he faces (fa)
  function segMat(tR, tM, R, M, fa, s, x0) { const e = nrm(sub(tM, tR)), f = perp(e), l = len(sub(tM, tR)) || 1, g = nrm(sub(M, R)), h = V(-g.y * fa, g.x * fa), sx = (len(sub(M, R)) || 1) / l, sy = 1 / s;
    const a = g.x * sx * e.x + h.x * sy * f.x, b = g.y * sx * e.x + h.y * sy * f.x, cc = g.x * sx * e.y + h.x * sy * f.y, d = g.y * sx * e.y + h.y * sy * f.y, tx = R.x - (a * tR.x + cc * tR.y), ty = R.y - (b * tR.x + d * tR.y);
    return new DOMMatrix([a, b, cc, d, tx + a * x0, ty + b * x0]); }
  // the torso (either layer) and the head: painted upright, kept as what was painted and where it lay
  function bakeBox(e, G, spec, part, x0, y0, w, h) {
    const cv = mk(w * TS, h * TS), x = cv.getContext('2d'); x.setTransform(TS, 0, 0, TS, -x0 * TS, -y0 * TS);
    const g = drawPart(x, G, spec, part); if (!NPAINT) { return { none: true }; }
    // (the torso's main layer is cut to what was painted, every shape's own points saying where it lay; not its second layer, whose
    // straps and chains are lines with no shape to them, nor the head, whose hair and hat are paths alone)
    if (part === 'torso1' && BOX && BOX[2] > BOX[0]) { const pad = 3 * TS, bx = Math.max(0, Math.floor(BOX[0] - pad)), by = Math.max(0, Math.floor(BOX[1] - pad)), bw = Math.min(cv.width, Math.ceil(BOX[2] + pad)) - bx, bh = Math.min(cv.height, Math.ceil(BOX[3] + pad)) - by;
      if (bw > 0 && bh > 0 && bw * bh < cv.width * cv.height * .85) { const t = mk(bw, bh); t.getContext('2d').drawImage(cv, -bx, -by); return { cv: t, hf: half(t), x: x0 + bx / TS, y: y0 + by / TS, w: bw / TS, h: bh / TS, g }; } }
    return { cv, hf: half(cv), x: x0, y: y0, w: cv.width / TS, h: cv.height / TS, g };
  }
  function bake(e, F, spec, part) {
    const G = e.G || (e.G = stood(F)); if (!e.geo) { e.geo = geoOf(G, spec); }
    const T = e.geo.T, P0 = e.geo.P0;
    if (part === 'head') { const hp = G.p[2], t = bakeBox(e, G, spec, part, hp.x - 26, hp.y - 38, 50, 68); if (t.none) { return t; } const hd = t.g.head, s = hd.s;
      // (in the head's own units, as the painter's transform has them: 8 above its joint, s of a unit each)
      return Object.assign(t, { hx: (t.x - hd.h.x) / s, hy: (t.y - hd.h.y) / s + 8, hw: t.w / s, hh: t.h / s, rim: new Map() }); }
    if (part === 'torso1' || part === 'torso2') { return Object.assign(bakeBox(e, G, spec, part, P0.x - 24, P0.y - T - 18, 50, T + 18 + 34), { P0 }); }
    return bakeLimb(e, G, spec, part);
  }
  // the shape of a texture in one colour, for the rim of light laid a little toward the light under it
  function rimOf(t, col) { let r = t.rim.get(col); if (!r) { if (t.rim.size > 3) { t.rim.clear(); } r = mk(t.hf.width, t.hf.height); const x = r.getContext('2d'); x.drawImage(t.hf, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, r.width, r.height); t.rim.set(col, r); } return r; }

  // ---------- the hook ----------
  function entry(F, spec) {
    const e = { spec, bh: F.body.h, bk: F.body.bulk, T: {}, todo: PARTS.slice(), G: null, geo: null, fail: false, env: null, api: null };
    e.api = { pa: PA, mat: tile,
      // an arm's or a leg's texture set to where the limb is now (S its root, E its joint, W its end); null until it is made
      limb(key, S, E, W) { const t = e.T[key]; if (!t || !t.limb || state.no.includes('l')) { return null; } const lv = t.lv[e.env.k < 2.7 ? 1 : 0], fa = e.env.fa;
        lv.pu.setTransform(segMat(lv.R, lv.M, S, E, fa, lv.s, 0)); lv.pl.setTransform(segMat(lv.M, lv.E, E, W, fa, lv.s, lv.xl)); t.cur = lv; t.J = E; t.ax = nrm(sub(W, E)); t.len = len(sub(W, E)); return t; },
      // the torso's layer drawn where the torso is (its pelvis, the way up it, the way to its front); true once it is made
      torso(c, key, P0, u0, n0) { const t = e.T[key]; if (!t || t.none || state.no.includes('t')) { return false; } const b = t.P0;
        c.save(); c.transform(n0.x, n0.y, -u0.x, -u0.y, P0.x - (n0.x * b.x - u0.x * b.y), P0.y - (n0.y * b.x - u0.y * b.y)); c.drawImage(e.env.k < 2.7 ? t.hf : t.cv, t.x, t.y, t.w, t.h); c.restore(); return true; },
      get head() { const t = e.T.head; return t && !t.none && !state.no.includes('h') ? t : null; } };
    return e;
  }
  function headDraw(c, he) { const t = this, C = he.col, a0 = c.globalAlpha, dx = he.L.x * he.rw, dy = he.L.y * he.rw;
    c.globalAlpha = a0 * Math.min(1, FigKit.rimK()); c.drawImage(rimOf(t, FigKit.rimCol(C.rim || '#ffcf86')), t.hx + dx, t.hy + dy, t.hw, t.hh); c.globalAlpha = a0;
    c.drawImage(t.ent.env.k < 2.7 ? t.hf : t.cv, t.hx, t.hy, t.hw, t.hh); }
  function make(job) {
    const e = job.e, F = job.F, spec = job.spec, part = e.todo[0], t0 = performance.now();
    try { const t = bake(e, F, spec, part); if (part === 'head' && !t.none) { t.draw = headDraw; t.ent = e; } e.T[part] = t; e.todo.shift(); state.parts++; if (!e.todo.length) { state.men++; e.G = null; QUEUE.delete(job); } }
    catch (err) { e.fail = true; e.todo.length = 0; state.failed++; state.last = part + ': ' + String(err && err.stack || err).slice(0, 300); HOOK.baking = false; QUEUE.delete(job); }
    const ms = performance.now() - t0; state.ms += ms; if (ms > state.worst) { state.worst = ms; }
  }
  const HOOK = { baking: false, paint,
    geo(g) { if (GEO) { Object.assign(GEO, g); } },
    // a figure's textures as far as they are made; one more part of someone's is made each frame until all are
    get(F, spec, o, env, lod) {
      if (!state.on || state.err || o.lod === 0 || !F.body || !F.p) { return null; }
      let e = ENT.get(F); if (!e || e.spec !== spec || e.bh !== F.body.h || e.bk !== F.body.bulk) { e = entry(F, spec); e.job = { e, F, spec }; ENT.set(F, e); QUEUE.add(e.job); }
      state.calls++; if (e.fail) { return null; }
      if (e.todo.length) { const s = Math.floor(performance.now() / 14); if (s !== stamp) { stamp = s; make(e.job); } } else { state.full++; }
      e.env = env; ORG = F.p[0]; KNOW = env.k; return e.api; } };
  // everything waiting, made now (the tools; a page may call it while a curtain is down)
  function flush() { for (const j of [...QUEUE]) { while (j.e.todo.length && !j.e.fail) { make(j); } } QUEUE.clear(); }
  function install() { if (typeof CastLook === 'undefined' || !('skin' in CastLook) || typeof DOMMatrix === 'undefined') { state.err = 'the painter has no place for a skin'; return false; } CastLook.skin = HOOK; return true; }
  return { state, install, flush, TS, HOOK };
})();
if (typeof window !== 'undefined') { window.CastSkin = CastSkin; }
