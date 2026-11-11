// ===== SKINNED FIGURE (a test, not part of the game) =====
// Ilyas drawn from art pieces fitted to the game's ragdoll each frame, in place of the painted figure (KaelLook.draw). The ragdoll,
// the poses, the coat's springs, the blade and every rule of what he wears are the game's own; only the drawing of him changes. The
// pieces are SVG drawings (skin_kit.js and the skin_art_*.js files), turned into bitmaps the first time each is needed.
//   - a limb is one long drawing laid along its two bones and bent at the joint (strip);
//   - the torso is a stack of layers (what he wears, in the order he wears it) put together once into one drawing; in profile it is
//     set on the spine, and turned it is wrapped round the body on the painted figure's own sections (FigKit.torsoMap), so one
//     drawing serves every side of him;
//   - the coat's skirt is a sheet of cloth on a grid: hung between the legs in profile, round them as a cone turned (FigKit.cone);
//   - the head is a drawing for each side it is seen from (profile, three-quarter front and back, front, back), with what is on it;
//   - hands, shoes and what is left of the lost arm are stiff pieces set on their joints;
//   - the light's edge (the rim) is put on from where the scene's light is.
// It follows the painted figure's own geometry (where each joint is seen when he turns, what is drawn over what), copied from
// sk_lookui.js. While a piece it needs is still loading, or for a case it does not cover, the painted figure is drawn instead.
const Skin = (() => {
  'use strict';
  const TS = 6;                                   // bitmap pixels to one world unit
  const A = SkinArt, R = A.rest, PI = Math.PI, TAU = PI * 2;
  const V = (x, y) => ({ x, y }), add = (a, b) => V(a.x + b.x, a.y + b.y), sub = (a, b) => V(a.x - b.x, a.y - b.y), mul = (a, k) => V(a.x * k, a.y * k), dot = (a, b) => a.x * b.x + a.y * b.y,
    len = a => Math.hypot(a.x, a.y), nrm = a => { const l = Math.hypot(a.x, a.y) || 1; return V(a.x / l, a.y / l); }, perp = a => V(-a.y, a.x),
    mix = (a, b, u) => V(a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u), cl = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, u) => a + (b - a) * u;
  const PEL = 0, CHE = 1, HEAD = 2, ELF = 3, HAF = 4, ELB = 5, HAB = 6, KNF = 7, FTF = 8, KNB = 9, FTB = 10, TIP = 11;
  // drawn: frames of him drawn from the pieces; missed: frames left to the painted figure while a piece was being made; other: frames
  // that asked for a look the pieces do not have
  const state = { on: true, err: null, drawn: 0, missed: 0, other: 0, loaded: 0, failed: {}, smooth: 'high' };

  // ---------- the pieces, made into bitmaps when they are first needed ----------
  const TEX = {}, PEND = {};
  function raster(body, box) {
    return new Promise((res, rej) => { const [vx, vy, vw, vh] = box, w = Math.ceil(vw * TS), h = Math.ceil(vh * TS);
      const img = new Image(); img.onload = () => { const cv2 = document.createElement('canvas'); cv2.width = w; cv2.height = h; cv2.getContext('2d').drawImage(img, 0, 0, w, h); res(cv2); };
      img.onerror = () => rej(new Error('a piece did not load'));
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${vx} ${vy} ${vw} ${vh}">${A.defs()}${body}</svg>`); });
  }
  const texOf = (img, box) => ({ img, ox: -box[0] * TS, oy: -box[1] * TS, w: img.width, h: img.height, box });
  // (the far side of him: the same piece, pushed toward the far colour the game gives his far arm and leg: see the kit)
  function tinted(cv0, far, box) { const cv2 = document.createElement('canvas'); cv2.width = cv0.width; cv2.height = cv0.height; const x = cv2.getContext('2d'); x.drawImage(cv0, 0, 0);
    x.globalCompositeOperation = 'source-atop';
    if (Array.isArray(far)) for (const [m, x0, x1] of far) { x.fillStyle = A.farOf(m); const a = Math.max(0, Math.round((x0 - box[0]) * TS)), b2 = Math.min(cv2.width, Math.round((x1 - box[0]) * TS)); if (b2 > a) x.fillRect(a, 0, b2 - a, cv2.height); }
    else { x.fillStyle = A.farOf(far); x.fillRect(0, 0, cv2.width, cv2.height); }
    return cv2; }
  function load(name) {
    if (PEND[name]) return PEND[name];
    const Pc = A.pieces[name]; if (!Pc) { state.failed[name] = 'no such piece'; return PEND[name] = Promise.resolve(); }
    const jobs = [raster(Pc.svg, Pc.box).then(cv2 => { TEX[name] = texOf(cv2, Pc.box); if (Pc.far) TEX[name + '@far'] = texOf(tinted(cv2, Pc.far, Pc.box), Pc.box); })];
    if (Pc.svgN) jobs.push(raster(Pc.svg + Pc.svgN, Pc.box).then(cv2 => { TEX[name + '@n'] = texOf(cv2, Pc.box); }));
    if (Pc.svgP) jobs.push(raster(Pc.svg + (Pc.svgN || '') + Pc.svgP, Pc.box).then(cv2 => { TEX[name + '@p'] = texOf(cv2, Pc.box); }));
    if (Pc.bleed) jobs.push(raster(Pc.bleed, Pc.box).then(cv2 => { TEX[name + '@b'] = texOf(cv2, Pc.box); }));
    if (Pc.front) jobs.push(raster(Pc.front, Pc.box).then(cv2 => { TEX[name + '@F'] = texOf(cv2, Pc.box); }));
    if (Pc.back) jobs.push(raster(Pc.back, Pc.box).then(cv2 => { TEX[name + '@K'] = texOf(cv2, Pc.box); }));
    return PEND[name] = Promise.all(jobs).then(() => { state.loaded++; }, e => { delete TEX[name]; state.failed[name] = String(e.message || e); });
  }
  // whether every piece named is ready; the ones that are not start loading
  function need(names) { let ok = true; for (const n of names) { if (!n) continue; const Pc = A.pieces[n]; if (!TEX[n] || (Pc && Pc.svgN && !TEX[n + '@n']) || (Pc && Pc.svgP && !TEX[n + '@p']) || (Pc && Pc.bleed && !TEX[n + '@b']) || (Pc && Pc.front && !TEX[n + '@F']) || (Pc && Pc.back && !TEX[n + '@K'])) { ok = false; if (!state.failed[n]) load(n); } } return ok; }
  // Pieces are made when they are first needed, so what is kept is what he has worn, not everything he could wear. What he will need
  // next is made ahead, a piece at a time between frames: the other sides of his head, his feet seen from the front, the next step of
  // the coat's shredding, what is under the coat. So a turn or a torn coat does not wait on a drawing.
  const WARM = [], QUEUED = {}; let warming = false;
  function warm(names) { for (const n of names) if (n && A.pieces[n] && !PEND[n] && !QUEUED[n]) { QUEUED[n] = 1; WARM.push(n); }
    if (warming || !WARM.length) return; warming = true;
    const step = () => { const n = WARM.shift(); if (!n) { warming = false; return; } load(n).then(() => setTimeout(step, 12)); }; setTimeout(step, 40); }
  // several pieces of one box laid over one another into one drawing, kept
  const COMP = {};
  function stack(key, list) { if (COMP[key]) return COMP[key]; const t0 = list[0], cv2 = document.createElement('canvas'); cv2.width = t0.w; cv2.height = t0.h; const x = cv2.getContext('2d'); for (const t of list) x.drawImage(t.img, 0, 0); return COMP[key] = texOf(cv2, t0.box); }
  // The torso in what he wears. Each layer is drawn three times over: from the side (its profile, wrapped round the near and the far
  // half of him), and its front and its back square on (the panels across the middle of his chest and of his back, where a side view
  // has nothing to show). Put together here, once for each set of layers: the profile as it is seen, the side of the near half and of
  // the far half with no gaps (for wrapping), the front and the back panels, and his sections up the spine [a, s at the back, s at
  // the front, half-width across]. A layer's trim (the gilt vine) is not in its drawings: it is a line drawn on him each frame, so
  // it keeps its width whichever way he turns.
  const TF = 40 * PI / 180, TGRID = [0, TF / 3, TF * 2 / 3, TF, TF + (PI - 2 * TF) * .25, PI / 2, PI - TF - (PI - 2 * TF) * .25, PI - TF, PI - TF * 2 / 3, PI - TF / 3, PI];
  const sector = tm => tm < TF ? 'F' : tm > PI - TF ? 'K' : 'S';
  // where a place on a section (r: its row, t: round from the front, side: the near half 1 or the far -1) is in a drawing: across the
  // side's, or across the front's or the back's as the viewer would see them
  const uOf = (sec, r, t, side) => sec === 'S' ? (r[1] + r[2]) / 2 + (r[2] - r[1]) / 2 * Math.cos(t) : sec === 'F' ? -side * r[3] * Math.sin(t) : side * r[3] * Math.sin(t);
  function torsoOf(layers) { const key = 'T:' + layers.join('+'); if (COMP[key]) return COMP[key];
    const Ls = layers.map(n => A.pieces[n]), tx = layers.map(n => TEX[n]), txN = layers.map(n => TEX[n + '@n'] || TEX[n]), bl = layers.map(n => TEX[n + '@b']);
    const weave = (top, withBleed) => { const list = []; top.forEach((t, i) => { if (withBleed && bl[i]) list.push(bl[i]); list.push(t); }); return list; };
    // (a panel: each layer's own drawing of it; a layer that covers him but has none is its plain cloth there)
    const panel = sfx => { if (!layers.some(n => TEX[n + sfx])) return null; const list = []; layers.forEach((n, i) => { if (TEX[n + sfx]) list.push(TEX[n + sfx]); else if (bl[i]) list.push(bl[i]); }); return list.length ? stack(key + sfx, list) : null; };
    let a0 = 1e9, a1 = -1e9; for (const Lp of Ls) if (Lp.out) { for (const q of [...Lp.out.back, ...Lp.out.front, ...(Lp.out.top || [])]) { a0 = Math.min(a0, q[0]); a1 = Math.max(a1, q[0]); } }
    // (the rows: evenly up the body, and closer together over the shoulders, where his width changes fastest)
    const rowsOf = N => { const tab = [], lo = a0 + .3, hi = a1 - .3, top = Math.min(hi, .9 * R.torso), as = []; for (let i = 0; i <= N; i++) as.push(lerp(lo, top, i / N)); for (let a = top + 1.7; a < hi - .5; a += 1.7) as.push(a); if (hi > top) as.push(hi);
      for (const a of as) { let sB = 1e9, sF = -1e9, D = 1; for (const Lp of Ls) { if (!Lp.out) continue; const r = A.reach(Lp.out, a); if (!r) continue; if (r[0] < sB) sB = r[0]; if (r[1] > sF) sF = r[1]; D = Math.max(D, Lp.D || 1); }
        if (sB > sF) continue; tab.push([a, sB, sF, A.tab(A.wide, a / R.torso) * D]); } return tab; };
    const C = { near: stack(key + ':n', weave(txN, false)), far: stack(key + ':f', weave(tx, false)), nearB: stack(key + ':nb', weave(txN, true)), farB: stack(key + ':fb', weave(tx, true)), frontB: panel('@F'), backB: panel('@K'), tab: rowsOf(10) };
    // the profile: the near side, with what each layer shows only in profile (the edge of what is on his front, drawn to be seen)
    C.prof = layers.some(n => TEX[n + '@p']) ? stack(key + ':p', layers.map(n => TEX[n + '@p'] || TEX[n + '@n'] || TEX[n])) : C.near;
    return COMP[key] = C;
  }

  // ---------- drawing a piece ----------
  // a stiff piece: its drawing's origin at O, its +x along X and its +y along Y (unit vectors; k scales it)
  function rigid(c, T, O, X, Y, k = 1, ky = k) { const s = k / TS, t = ky / TS; c.save(); c.transform(X.x * s, X.y * s, Y.x * t, Y.y * t, O.x, O.y); c.drawImage(T.img, -T.ox, -T.oy); c.restore(); }
  // the light's edge along a line of places: the runs of it whose outward side (N at each place) faces the light
  function edgeRim(c, Q, N, Lt, col, w, a) { let on = false, any = false; c.beginPath();
    for (let i = 0; i < Q.length - 1; i++) { const lit = (N[i].x + N[i + 1].x) * Lt.x + (N[i].y + N[i + 1].y) * Lt.y > .36; if (lit) { if (!on) c.moveTo(Q[i].x, Q[i].y); c.lineTo(Q[i + 1].x, Q[i + 1].y); any = true; } on = lit; }
    if (!any) return; c.save(); c.globalAlpha *= a; c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); c.restore(); }
  // a limb: the drawing runs along +x from the first joint (u=0) through the middle one (u=L0) to the last (u=L0+L1), its +y toward
  // his front (fv: the way he is seen to face). It is laid along A-J-B in slices, the bend at J taken round a short curve.
  // o.rim: {L, col, w, a, prof}: the light's edge down whichever side of it faces the light
  function strip(c, T, A0, J, B, L0, L1, fv, sz, o = {}) {
    const d0 = nrm(sub(J, A0)), d1 = nrm(sub(B, J)), l0 = len(sub(J, A0)) || 1, l1 = len(sub(B, J)) || 1, r = Math.min(o.r || 3.5, l0 * .4, l1 * .4), M = o.m || 5;
    const pts = [{ p: A0, u: 0 }, { p: sub(J, mul(d0, r)), u: L0 - r * L0 / l0 }], Ja = pts[1].p, Jb = add(J, mul(d1, r));
    for (let i = 1; i < M; i++) { const t = i / M; pts.push({ p: mix(mix(Ja, J, t), mix(J, Jb, t), t), u: L0 - r * L0 / l0 + (r * L0 / l0 + r * L1 / l1) * t }); }
    pts.push({ p: Jb, u: L0 + r * L1 / l1 }, { p: B, u: L0 + L1 });
    const n = pts.length, hw = (o.hw || 5) * sz, pa = o.padA ?? 4, pb = o.padB ?? 2, dirs = [];
    for (let i = 0; i < n - 1; i++) dirs.push(nrm(sub(pts[i + 1].p, pts[i].p)));
    const turn = (j, k2) => j >= 0 && k2 < n - 1 ? Math.acos(cl(dot(dirs[j], dirs[k2]), -1, 1)) : 0;
    for (let i = 0; i < n - 1; i++) { const d = dirs[i], a = pts[i], b = pts[i + 1];
      // (each slice reaches a little past its ends, far enough to close the wedge the turn opens on the outside of the bend)
      const e0 = i === 0 ? pa : hw * Math.tan(Math.min(.6, turn(i - 1, i) / 2)) + .35, e1 = i === n - 2 ? pb : hw * Math.tan(Math.min(.6, turn(i, i + 1) / 2)) + .35;
      const S0 = sub(a.p, mul(d, e0)), E = add(b.p, mul(d, e1)), su0 = T.ox + (a.u - e0) * TS, su1 = T.ox + (b.u + e1) * TS, sw = su1 - su0; if (sw <= 0) continue;
      const kx = len(sub(E, S0)) / sw, Fn = mul(perp(d), -fv * sz / TS);
      c.save(); c.transform(d.x * kx, d.y * kx, Fn.x, Fn.y, S0.x - T.oy * Fn.x, S0.y - T.oy * Fn.y); c.drawImage(T.img, su0, 0, sw, T.h, 0, 0, sw, T.h); c.restore(); }
    if (o.rim && o.rim.prof) { const Rm = o.rim, Fq = [], Bq = [], NF = [], NB = [];
      for (let i = 0; i < n; i++) { const d = i === 0 ? dirs[0] : i === n - 1 ? dirs[n - 2] : nrm(add(dirs[i - 1], dirs[i])), Fu = mul(perp(d), -fv), u = pts[i].u;
        Fq.push(add(pts[i].p, mul(Fu, A.tab(Rm.prof, u, 1) * sz))); Bq.push(sub(pts[i].p, mul(Fu, A.tab(Rm.prof, u, 2) * sz))); NF.push(Fu); NB.push(mul(Fu, -1)); }
      edgeRim(c, Fq, NF, Rm.L, Rm.col, Rm.w, Rm.a); edgeRim(c, Bq, NB, Rm.L, Rm.col, Rm.w, Rm.a); }
  }
  // a cell of a drawing ([u0,u1] x [v0,v1], in the drawing's units) put on four places (p00 at u0,v0; p10 at u1,v0; p01 at u0,v1; p11),
  // as the parallelogram nearest them: no clipping, so a grid of cells is cheap; each is drawn a little over its edges to close the seams
  function cell(c, T, u0, v0, u1, v1, p00, p10, p01, p11) {
    if (u1 < u0) { let t = u0; u0 = u1; u1 = t; t = p00; p00 = p10; p10 = t; t = p01; p01 = p11; p11 = t; }
    if (v1 < v0) { let t = v0; v0 = v1; v1 = t; t = p00; p00 = p01; p01 = t; t = p10; p10 = p11; p11 = t; }
    const sw = (u1 - u0) * TS, sh = (v1 - v0) * TS; if (sw < .02 || sh < .02) return;
    const Xx = (p10.x - p00.x + p11.x - p01.x) / 2 / sw, Xy = (p10.y - p00.y + p11.y - p01.y) / 2 / sw, Yx = (p01.x - p00.x + p11.x - p10.x) / 2 / sh, Yy = (p01.y - p00.y + p11.y - p10.y) / 2 / sh;
    if (Math.abs(Xx * Yy - Xy * Yx) < 1e-7) return;
    const su = T.ox + u0 * TS, sv = T.oy + v0 * TS, mx = (p00.x + p10.x + p01.x + p11.x) / 4, my = (p00.y + p10.y + p01.y + p11.y) / 4;
    const ex = Math.min(1.2, .45 / (Math.hypot(Xx, Xy) || 1) + .2), ey = Math.min(1.2, .45 / (Math.hypot(Yx, Yy) || 1) + .2);
    c.save(); c.transform(Xx, Xy, Yx, Yy, mx - Xx * (su + sw / 2) - Yx * (sv + sh / 2), my - Xy * (su + sw / 2) - Yy * (sv + sh / 2));
    c.drawImage(T.img, su - ex, sv - ey, sw + 2 * ex, sh + 2 * ey, su - ex, sv - ey, sw + 2 * ex, sh + 2 * ey); c.restore();
  }
  // a drawing stretched over a grid of places: G[row][col], the rows at the drawing's vs[] and the columns at its us[] (or us[row][col])
  function grid(c, T, G, us, vs) { const per = Array.isArray(us[0]);
    for (let r = 0; r < G.length - 1; r++) for (let k = 0; k < G[r].length - 1; k++) { const a = G[r][k], b = G[r][k + 1], d = G[r + 1][k], e = G[r + 1][k + 1]; if (!a || !b || !d || !e) continue; if (a.h && b.h && d.h && e.h) continue;
      const u0 = per ? (us[r][k] + us[r + 1][k]) / 2 : us[k], u1 = per ? (us[r][k + 1] + us[r + 1][k + 1]) / 2 : us[k + 1];
      cell(c, T, u0, vs[r], u1, vs[r + 1], a, b, d, e); } }
  // the light of an eye (its own teal, or the amber of an opening), a small picture made once
  const GLOWS = {};
  function glowOf(amber) { const k2 = amber ? 'a' : 't'; if (GLOWS[k2]) return GLOWS[k2]; const cv2 = document.createElement('canvas'); cv2.width = cv2.height = 64; const x = cv2.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, amber ? 'rgba(255,214,140,1)' : 'rgba(214,251,255,1)'); g.addColorStop(.35, amber ? 'rgba(255,193,99,.75)' : 'rgba(127,243,227,.7)'); g.addColorStop(1, 'rgba(127,243,227,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return GLOWS[k2] = cv2; }
  const pathOf = (Q, close = true) => { const P = new Path2D(); P.moveTo(Q[0].x, Q[0].y); for (let i = 1; i < Q.length; i++) P.lineTo(Q[i].x, Q[i].y); if (close) P.closePath(); return P; };
  const ease = t => { t = cl(t, 0, 1); return t * t * (3 - 2 * t); };

  // ---------- what he has on: the pieces a figure needs ----------
  // the head as it is seen: its turn hy (0 the profile, pi/2 the back of it, 3pi/2 the face) picks the drawing and its side
  function headView(hy) { const cs = Math.cos(hy), sn = Math.sin(hy), mir = cs < 0 ? -1 : 1;
    if (Math.abs(sn) <= .42) return { v: 'P', mir, sx: .8 + .2 * Math.abs(cs) };
    if (Math.abs(cs) > .5) return { v: sn > 0 ? 'R' : 'Q', mir, sx: 1 };
    return { v: sn > 0 ? 'B' : 'F', mir: 1, sx: 1 }; }
  function kitOf(F, o, TN) {
    const W = F.wear && typeof F.wear === 'object' ? F.wear : null, ONE = !!F.oneArm, K = { W, ONE, needs: [] }, nd = K.needs;
    if (W) {
      // Act I, the Pit: what Tamm's lost property gave him, over the linen trousers
      const top = W.top || 'bare', oil = W.coat === 'oilcloth', can = W.coat === 'canvas';
      K.coatOn = oil; K.skirt = oil ? 'sk.oil' : null; K.coatLen = 1.1;
      if (oil) K.torso = ['t.waist.soot', 't.oil'];
      else { K.torso = top === 'jersey' ? ['t.waist.soot', 't.jersey'] : top === 'shirt' ? ['t.shirt', 't.waist.soot'] : top === 'under' ? ['t.skin', W.bandage ? 't.bandage' : null, 't.under', 't.waist.soot'] : ['t.skin', W.bandage ? 't.bandage' : null, 't.waist.soot', 't.string'];
        if (top !== 'bare') K.torso.push(W.belt === 'rope' ? 't.rope' : 't.belt'); if (can) K.torso.push('t.canvas'); }
      if (W.vest) K.torso.push('t.' + W.vest + (oil ? '.big' : ''));
      if (W.scarf) K.torso.push('t.scarf');
      K.torso = K.torso.filter(Boolean);
      K.arm = oil ? 'arm.oil' : can ? 'arm.canvas' : top === 'jersey' ? 'arm.jersey' : top === 'shirt' ? 'arm.rolled' : 'arm.pbare';
      K.cuff = W.hands === 'gauntlet' ? 'cuff.gauntlet' : W.hands === 'wrap' ? 'cuff.wrap' : null;
      const hm = W.hands === 'gauntlet' ? '.hide' : W.hands === 'glove' ? '.glove' : '';
      K.hand = (F.openHand ? 'hand.open' : 'hand.fist') + hm; K.fist = 'hand.fist' + hm; K.hm = hm;
      K.lost = !W.coat && (top === 'bare' || top === 'under') ? (W.bandage ? 'stump.band' : 'stump.skin') : (W.pinned !== false ? 'sleeve.pin.' : 'sleeve.loose.') + (oil ? 'coat' : can ? 'canvas' : top === 'jersey' ? 'jersey' : 'shirt');
      K.leg = 'leg.soot'; K.shin = W.legs === 'shins' ? 'shin.guard' : null;
      K.foot = W.feet === 'bare' ? 'bare' : W.feet === 'sandals' ? 'sandal' : W.feet === 'dock' ? 'dock' : 'boot'; K.shaft = K.foot === 'boot' ? 'shaft.boot' : K.foot === 'dock' ? 'shaft.dock' : null;
      K.hat = W.head === 'cap' || W.head === 'helmet' ? W.head : null; K.seat = A.tone('soot', 1); K.noGold = true;
    } else {
      // the prologue: the long coat over the suit; or the coat off, and the vest and his bare arms
      const off = !!F.coatOff; K.coatOff = off; K.coatOn = !off; K.coatLen = 1;
      const sh = off ? 0 : Math.min(4, Math.ceil(cl(F.coatShred || 0, 0, 1) * 4 - 1e-6)); K.shredLv = sh;
      K.skirt = off ? null : 'sk.coat' + (sh ? '.s' + sh : '');
      K.torso = off ? ['t.waist.suit', 't.vest', F.charge === 'belt' ? 't.charge' : null].filter(Boolean) : ['t.coat' + (sh ? '.s' + sh : '')]; K.back = off ? (F.sidearm === 'sheathed' ? 'dagger.back' : 'sheath.back') : null;
      K.arm = off ? ((F.drain || 0) > .5 ? 'arm.scar' : 'arm.bare') : 'arm.suit'; K.glow = off && (F.drain || 0) < .98 ? 'arm.glow' : null;
      K.hand = F.openHand ? 'hand.open' : 'hand.fist'; K.fist = 'hand.fist'; K.lost = F.armOff ? (off ? 'stump.torn.skin' : 'stump.torn.suit') : null;
      K.leg = 'leg.suit'; K.foot = 'ox'; K.hat = null; K.seat = A.tone('wool', 1);
    }
    nd.push(...K.torso, K.skirt, K.arm, K.glow, K.cuff, K.hand, K.fist, K.lost, K.back, K.leg, K.shin, K.shaft, 'neck', 'shoe.' + K.foot + '.S');
    if (TN) nd.push('shoe.' + K.foot + '.F', 'shoe.' + K.foot + '.B');
    return K; }
  // what a figure in this kit will want soon (see warm)
  const VIEWS = ['P', 'Q', 'F', 'R', 'B'];
  function alsoOf(K) { const out = []; for (const v of VIEWS) out.push(...headParts(v, K.hat, K.noGold), 'head.' + v + '.dull', 'head.' + v + '.shut'); out.push('shoe.' + K.foot + '.F', 'shoe.' + K.foot + '.B');
    if (K.W) out.push('hand.open' + (K.hm || ''), 'hand.fist' + (K.hm || ''));
    else { out.push('hand.open', 'hand.fist', 'sk.lining', 'grenade', 'grenade.loop', 'stump.torn.suit', 'stump.torn.skin');
      if (K.coatOn) { if (K.shredLv < 4) out.push('t.coat.s' + (K.shredLv + 1), 'sk.coat.s' + (K.shredLv + 1)); out.push('t.waist.suit', 't.vest', 'arm.bare', 'arm.scar', 'arm.glow', 'sheath.back', 'dagger.back'); }
      else out.push('arm.bare', 'arm.scar', 'arm.glow', 't.charge', 'sheath.back', 'dagger.back'); }
    return out; }
  let lastWarm = '';
  const headParts = (v, hat, plain) => ['head.' + v + '.base', 'head.' + v + (hat ? '.hairLow' : '.hair'), hat ? 'hat.' + hat + '.' + v : null, 'head.' + v + (plain ? '.earPlain' : '.ear')].filter(Boolean);

  // ---------- the figure ----------
  // true when he was drawn; false when a piece is not ready yet or the case is not covered (the painted figure is drawn then)
  function draw(c, F, o = {}) {
    // (the pieces are of him as the game has him: the Noir look, the swept-back hair, the long coat; a look, an outfit or a hair asked
    // for by name, in the look page, is the painted figure's)
    const cf = typeof KaelLook !== 'undefined' && KaelLook.cfg || null;
    if (o.look || o.outfit || o.hair || (cf && (cf.look !== 'noir' || cf.hair !== 'swept' || (cf.outfit !== 'coat' && !(F.wear && typeof F.wear === 'object'))))) { state.other++; return false; }
    const p0 = F.p, fa = F.facing, b = F.body, sz = b.h * (.93 + .07 * b.bulk), now = o.now ?? (F.t || 0);
    const yaw = +(o.yaw ?? F.yaw ?? 0) || 0, TN = Math.abs(Math.sin(yaw)) > .015 || Math.cos(yaw) < 0;
    const K = kitOf(F, o, TN), W = K.W, ONE = K.ONE;
    // the head's turn, and what the head needs
    const hyRaw = TN ? (o.headYaw ?? FigKit.headYaw(yaw)) : (o.headYaw || null), HV = hyRaw != null ? headView(hyRaw) : { v: 'P', mir: (F.lookBack || o.lookBack) ? -1 : 1, sx: 1 };
    const hp = headParts(HV.v, K.hat, K.noGold); K.needs.push(...hp);
    if (!need(K.needs)) { state.missed++; return false; }
    { const wk = K.torso.join('+') + '|' + (K.hat || '') + '|' + K.foot + '|' + (K.shredLv || 0) + '|' + (K.hm || ''); if (wk !== lastWarm) { lastWarm = wk; warm(alsoOf(K)); } }
    if (typeof FigKit.useKey === 'function') FigKit.useKey(o);
    const tr = c.getTransform ? c.getTransform() : null, k = tr && tr.a != null ? Math.hypot(tr.a, tr.b) || 1 : 2;
    const P0 = p0[PEL], C0 = p0[CHE], u0 = nrm(sub(C0, P0)), n0 = mul(perp(u0), fa), T = len(sub(C0, P0)), kT = T / R.torso;
    const at = (a, s) => add(add(P0, mul(u0, a)), mul(n0, s * sz));
    const Ld = o.dir ? nrm(o.dir) : o.light ? nrm(sub(o.light, mix(P0, C0, .5))) : nrm(V(.5, -1));
    const rimCol = typeof FigKit.rimCol === 'function' ? FigKit.rimCol('#ffcf86') : '#ffcf86', rimW = Math.max(.5, .95 / k), RIMON = k > 1.2;
    const rimOf = (name, far) => RIMON && !far && A.pieces[name].prof ? { L: Ld, col: rimCol, w: rimW, a: .8, prof: A.pieces[name].prof } : null;
    const gy = typeof F.gr === 'function' ? (x => F.gr(x)) : (x => F.ground ?? (Math.max(p0[FTF].y, p0[FTB].y) + 3));
    // ----- turned: where each joint is seen (the painted figure's own reckoning) -----
    const onGrip = (Pq, td) => { const h = Pq[HAB], a = sub(Pq[HAF], mul(td, 9)), bq = Pq[TIP], ab = sub(bq, a), t = cl(dot(sub(h, a), ab) / (dot(ab, ab) || 1), 0, 1); return len(sub(h, add(a, mul(ab, t)))) < 4.5; };
    const tipDir0 = nrm(sub(p0[TIP], p0[HAF])), offOnGrip = !ONE && !o.apart && onGrip(p0, tipDir0);
    const kA = o.latArm ?? 1, kE = o.latElbow ?? (.3 + .7 * kA);
    const pxs = (P0.x + C0.x) / 2, VW = TN ? FigKit.view(pxs, fa, yaw) : null, LS = 12 * sz, LH = 5.6 * sz * (o.latLeg ?? 1), fwd = q => cl((q.x - pxs) * fa / (.55 * T), 0, 1);
    const sw = ONE ? -1 : 1, lHF = sw * LS * (1 - .5 * fwd(p0[HAF])) * kA, lEF = sw * LS * (1 - .15 * fwd(p0[ELF])) * kE, lHB = offOnGrip ? lHF : -LS * (1 - .5 * fwd(p0[HAB])) * kA, lEB = offOnGrip ? 0 : -LS * (1 - .15 * fwd(p0[ELB])) * kE;
    const LKn = LH * (o.latKneeN ?? o.latKnee ?? 1), LKf = LH * (o.latKneeF ?? o.latKnee ?? 1), LFn = LH * (o.latFootN ?? o.latFoot ?? 1), LFf = LH * (o.latFootF ?? o.latFoot ?? 1),
      LAT = [0, 0, 0, lEF, lHF, lEB, lHB, LKn, LFn, -LKf, -LFf, lHF];
    const p = TN ? p0.map((q, i) => VW.at(q, LAT[i])) : p0, fv = TN ? VW.fv : fa, u = TN ? nrm(sub(p[CHE], p[PEL])) : u0, n = mul(perp(u), fv);
    if (typeof KaelLook !== 'undefined' && KaelLook.seen) KaelLook.seen.set(F, { haf: V(p[HAF].x, p[HAF].y), pel: V(p[PEL].x, p[PEL].y), turned: TN });
    const dp = (q, l) => TN ? VW.dep(q, l) : l;
    const across = (l, fn) => { if (!TN) { fn(); return; } const cc = Math.abs(VW.c) < .07 ? (VW.c < 0 ? -.07 : .07) : VW.c; c.save(); c.translate(VW.px + fa * l * VW.s, 0); c.scale(cc, 1); c.translate(-VW.px, 0); fn(); c.restore(); };
    const sh0 = at(T - 2.8 * sz, -.6), SH = TN ? [VW.at(sh0, LS), VW.at(sh0, -LS)] : [sh0, sh0], HIP = TN ? [VW.at(P0, LH), VW.at(P0, -LH)] : [P0, P0], shoulder = SH[0];
    const tipV = sub(p[TIP], p[HAF]), tipDir = !TN || len(tipV) > 6 ? nrm(tipV) : nrm(sub(p[HAF], p[ELF])), armed = F.wp ? !F.wp.unarmed : !!(F.weaponKey && F.weaponKey !== 'unarmed');
    const comp = torsoOf(K.torso);
    const shoulderFor = (E, S0) => { const d = nrm(sub(E, S0)), up = dot(d, u); return add(S0, add(mul(u, cl(up, 0, 1) * 1.5 * sz), mul(d, .6 * sz))); };
    c.save(); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = state.smooth; c.lineCap = 'round'; c.lineJoin = 'round';
    // the scarf's other end trails from the back of his neck, behind everything (the game's own ribbon, in the Pit's rust)
    if (W && W.scarf && F.scarf && F.scarf.length > 2 && !F.severed && KaelLook.scarfRibbon && KaelLook.pitLook)
      across(0, () => KaelLook.scarfRibbon(c, F, KaelLook.pitLook('noir'), { k, fa, L: Ld, far: false, rw: Math.max(.9, 1.25 / k) * 1.05, ow: Math.max(.55, 1.05 / k) }, now, sz));

    // ----- the tears a blade leaves (F.rips), each on the piece it struck: the game's own ragged shapes, what is under showing through,
    // their edges in the light. AT: where a place on a turned torso is seen; place: a tear's own place (the skirt's) -----
    const Rp = Array.isArray(F.rips) ? F.rips : [];
    const ripCol = (g, far) => g === 'legN' || g === 'legF' ? (K.noGold ? (far ? '#5e594e' : '#4a463d') : (far ? '#2a141b' : '#47202a')) : (K.noGold ? (far ? '#1e1b12' : '#2c2719') : (far ? '#1b4a46' : '#45d8c8'));
    const tearOn = (g, far, clipQ, AT, place) => { if (!Rp.length || !KaelLook.ripShape) return; let acc = null;
      for (const r of Rp) { if (r.g !== g) continue; let ctr, d;
        if (place) { const pl = place(r); if (!pl) continue; ctr = pl[0]; d = pl[1]; }
        else if (r.a == null || !p0[r.a] || !p0[r.b]) continue;
        else if (AT) { const a = dot(sub(mix(p0[r.a], p0[r.b], r.u), P0), u0); ctr = AT(a, r.off || 0); if (ctr.h) continue; const e = AT(a + Math.cos(r.ang || 0) * 3, (r.off || 0) + Math.sin(r.ang || 0) * 3 / sz); d = nrm(sub(e, ctr)); }
        else { const Aq = p[r.a], Bq = p[r.b], sd = nrm(sub(Bq, Aq)), nn = mul(perp(sd), fv); ctr = add(mix(Aq, Bq, r.u), mul(nn, (r.off || 0) * sz)); d = add(mul(sd, Math.cos(r.ang || 0)), mul(nn, Math.sin(r.ang || 0))); }
        if (!acc) acc = { hole: new Path2D(), gore: new Path2D(), rim: new Path2D() };
        KaelLook.ripShape(ctr, d, r, acc, .7 / k); if (o.onRip) o.onRip(r, ctr, c); }
      if (!acc) return; c.save(); if (clipQ) c.clip(pathOf(clipQ)); c.fillStyle = ripCol(g, far); c.fill(acc.hole); if (o.gore) { c.fillStyle = o.gore; c.fill(acc.gore); }
      c.strokeStyle = rimCol; c.globalAlpha *= .72; c.lineWidth = Math.max(.5, .95 / k); c.stroke(acc.rim); c.restore(); };
    // (the shape of a limb, to keep a tear inside it)
    const limbQ = (A0, J, B, w0, w1, w2) => { const na = perp(nrm(sub(J, A0))), nb = perp(nrm(sub(B, J))), nm = nrm(add(na, nb));
      return [add(A0, mul(na, w0 * sz)), add(J, mul(nm, w1 * sz)), add(B, mul(nb, w2 * sz)), sub(B, mul(nb, w2 * sz)), sub(J, mul(nm, w1 * sz)), sub(A0, mul(na, w0 * sz))]; };
    const armQ = (E, H, S0) => limbQ(shoulderFor(E, S0), E, H, 4.6, 3.5, 2.9);

    // ----- the arms -----
    const tx = (name, far) => (far && TEX[name + '@far']) || TEX[name];
    const armStrip = (name, E, H, S0, far) => { strip(c, tx(name, far), shoulderFor(E, S0), E, H, R.ua, R.fa, fv, sz, { r: 3.2, hw: 5.4, padA: 5, padB: 1, rim: rimOf(name, far) }); };
    const handAt = (name, H, g, far, s = 1) => { rigid(c, tx(name, far), H, g, mul(perp(g), -fv), sz * s); };
    const weapon = () => { if (!armed) return;
      if (!ONE && F.weaponKey === 'elven' && KaelLook.blade) { if (o.bladeOK === false) return; const h = p0[HAF], hv = h.px != null && typeof DT !== 'undefined' ? V((h.x - h.px) / DT, (h.y - h.py) / DT) : V(0, 0);
        across(LAT[HAF], () => KaelLook.blade(c, p0[HAF], p0[TIP], fa, o.arcSt !== undefined ? o.arcSt : (F.arcSt || null), KaelLook.LOOKS.noir.col, null, Math.max(.55, 1.05 / k), now, Ld, k, hv)); }
      else if (o.drawOther) across(LAT[HAF], () => o.drawOther(F)); };
    // (the tattoos' own light, over the arm: brighter with an opening, a fast hand, a flare)
    const glowArm = (E, H, S0, far) => { const hq0 = p0[HAF], hsp = hq0.px != null && typeof DT !== 'undefined' ? Math.hypot(hq0.x - hq0.px, hq0.y - hq0.py) / DT : 0, g = ((o.opening || F.opening) ? .8 : 0) + cl(hsp / 800, 0, .6) + cl(F.flare || 0, 0, 1.4);
      if (g <= .02 || !TEX[K.glow]) return; c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha *= cl(g * .55, 0, 1) * (1 - cl(F.drain || 0, 0, 1)) * (far ? .5 : 1);
      strip(c, TEX[K.glow], shoulderFor(E, S0), E, H, R.ua, R.fa, fv, sz, { r: 3.2, hw: 5.4, padA: 5, padB: 1 }); c.restore(); };
    const farArm = far => { armStrip(K.arm, p[ELB], p[HAB], SH[1], far); const fd = nrm(sub(p[HAB], p[ELB]));
      if (!K.coatOff) tearOn('armF', far, armQ(p[ELB], p[HAB], SH[1]));
      if (K.glow) glowArm(p[ELB], p[HAB], SH[1], far);
      handAt(K.hand, p[HAB], offOnGrip ? tipDir : fd, far, .95);
      if (o.afterFarArm) across(LAT[HAB], () => o.afterFarArm(F)); };
    const nearArm = far => { weapon();
      if (F.armOff) { lostArm(); return; }
      armStrip(K.arm, p[ELF], p[HAF], SH[0], far); const fd = nrm(sub(p[HAF], p[ELF]));
      if (!K.coatOff) tearOn('armN', far, armQ(p[ELF], p[HAF], SH[0]));
      if (K.glow) glowArm(p[ELF], p[HAF], SH[0], far);
      handAt(K.hand, p[HAF], armed ? tipDir : fd, far, 1);
      if (F.armTear > 0) seamTear(shoulder, p[ELF], F.armTear); };
    // the arm he has left (Act I), drawn as the far arm is, and what is in its hand
    const weaponArm = far => { if (armed && o.drawOther) across(LAT[HAF], () => o.drawOther(F));
      armStrip(K.arm, p[ELF], p[HAF], SH[1], far); const fd = nrm(sub(p[HAF], p[ELF])), op = !!F.openHand && !(armed && o.drawOther);
      if (K.cuff) rigid(c, tx(K.cuff, far), p[HAF], fd, mul(perp(fd), -fv), sz);
      handAt(op ? K.hand : K.fist, p[HAF], armed && !op ? tipDir : fd, far, 1); };
    // the near shoulder with the arm gone: torn away (the prologue's end), dressed, or the empty sleeve
    const lostArm = () => { if (!K.lost || !TEX[K.lost]) return; const Pc = A.pieces[K.lost], lift = cl(F.phantom || 0, 0, 1); let Sx = shoulder, d;
      if (Pc.kind === 'torn') d = nrm(add(u, mul(n, .35)));
      else if (Pc.kind === 'band') { if (lift) Sx = add(Sx, mul(u, 1.2 * sz * lift)); d = nrm(mix(nrm(add(mul(u, -1), mul(n, .2))), nrm(add(n, mul(u, .5))), lift * .7)); }
      else { const Cq = p0[CHE], vx = Cq.px != null && typeof DT !== 'undefined' ? cl((Cq.x - Cq.px) / DT, -400, 400) : 0, hd0 = nrm(add(mix(mul(u, -1), V(0, 1), .5), V(-vx * .0012, 0)));
        if (lift) Sx = add(Sx, mul(u, 1.2 * sz * lift)); d = nrm(mix(hd0, nrm(add(n, mul(u, .6))), lift * .85)); }
      let q = perp(d); if (dot(q, n) < 0) q = mul(q, -1);
      rigid(c, TEX[K.lost], Sx, d, q, sz);
      // (the old wound come through the linen at the end of the stump, with blood on)
      if (Pc.stain && o.gore) { const st = Pc.stain, m = add(Sx, add(mul(d, st[0] * sz), mul(q, st[1] * sz))); c.save(); c.fillStyle = '#5e2d1d'; c.globalAlpha *= .42; c.beginPath(); c.ellipse(m.x, m.y, st[3] * sz, st[2] * sz, Math.atan2(q.y, q.x), 0, TAU); c.fill(); c.restore(); }
      if (Pc.kind === 'torn' && o.gore) goreAt(add(Sx, mul(d, 3.4 * sz)), d, q, !!F.seared, o.gore); };
    const goreAt = (tip, d, q, seared, col) => { c.save(); const blob = (r0, st) => { c.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, rr = (r0 + ((i * st) % 3) * .4) * sz, q2 = add(add(tip, mul(d, Math.cos(a) * rr * .45)), mul(q, Math.sin(a) * rr)); if (i) c.lineTo(q2.x, q2.y); else c.moveTo(q2.x, q2.y); } c.closePath(); };
      if (seared) { c.fillStyle = '#22110b'; blob(3.4, 7); c.fill(); c.strokeStyle = '#6a2e16'; c.lineWidth = Math.max(.4, .6 * sz); c.stroke(); }
      else { c.fillStyle = col; blob(3.6, 5); c.fill(); c.fillStyle = 'rgba(50,0,8,.55)'; c.beginPath(); c.ellipse(tip.x, tip.y, 1.2 * sz, 2.4 * sz, Math.atan2(d.y, d.x), 0, TAU); c.fill(); c.fillStyle = '#e9ddc6'; c.beginPath(); c.arc(tip.x + d.x * .9 * sz, tip.y + d.y * .9 * sz, 1.25 * sz, 0, TAU); c.fill(); }
      c.restore(); };
    // (the arm giving at the shoulder: the seam opening, the lining and, with blood on, the flesh in it)
    const seamTear = (Sh, E, tr2) => { const d = nrm(sub(E, Sh)), m = add(Sh, mul(d, 1.6 * sz)), Lg = (2.4 + 6.2 * tr2) * sz, Wd = (.8 + 2.6 * tr2) * sz, an = Math.atan2(d.y, d.x) + PI / 2; c.save();
      if (!K.coatOff) { c.fillStyle = A.TEAL; c.globalAlpha *= .75; c.beginPath(); c.ellipse(m.x, m.y, Wd * 1.25 + .6 * sz, Lg * .62 + sz, an, 0, TAU); c.fill(); c.globalAlpha /= .75; }
      if (o.gore) { c.fillStyle = o.gore; c.beginPath(); c.ellipse(m.x, m.y, Wd, Lg * .55, an, 0, TAU); c.fill(); c.fillStyle = 'rgba(40,0,6,.55)'; c.beginPath(); c.ellipse(m.x, m.y, Wd * .45, Lg * .4, an, 0, TAU); c.fill(); }
      c.restore(); };

    // ----- the legs -----
    const shoeView = (kn, ft, l) => { const sd = nrm(sub(p0[ft], p0[kn])), g = gy(p0[ft].x), planted = p0[ft].y > g - 6 && Math.abs(Math.atan2(sd.x, sd.y)) < .95; let d;
      if (planted) d = V(fa, 0); else { d = perp(sd); if (dot(d, n0) < 0) d = mul(d, -1); }
      if (!TN) return { v: 'S', d, A0: p0[ft], sx: 1, planted };
      const flat = Math.abs(d.y) < .6;
      if (VW.s < -.5 && Math.abs(VW.c) < .5 && flat) return { v: 'F', A0: VW.at(p0[ft], l) };
      if (VW.s > .5 && Math.abs(VW.c) < .5 && flat) return { v: 'B', A0: VW.at(p0[ft], l) };
      // (turned part of the way, the profile shoe is seen shortened, pointing the way he is seen to face)
      return { v: 'S', d: V(d.x * (VW.c < 0 ? -1 : 1), d.y), A0: VW.at(p0[ft], l), sx: Math.max(.5, Math.abs(VW.c)), planted }; };
    const leg = (kn, ft, side, far) => { const hip = HIP[side > 0 ? 0 : 1], S = shoeView(kn, ft, side * LH), shoe = tx('shoe.' + K.foot + '.' + S.v, far);
      // (the sole is the side of it away from the knee; planted, under it)
      const putShoe = () => { if (S.v === 'S') { let w = V(0, 1); if (!S.planted) { w = perp(S.d); if (dot(w, sub(p[kn], p[ft])) > 0) w = mul(w, -1); } rigid(c, shoe, S.A0, S.d, w, sz * S.sx, sz); } else rigid(c, shoe, S.A0, V(1, 0), V(0, 1), sz); };
      if (S.v !== 'F') putShoe();
      strip(c, tx(K.leg, far), hip, p[kn], p[ft], R.th, R.sh, fv, sz, { r: 4.2, hw: 7, padA: 6.5, padB: 1, rim: rimOf(K.leg, far) });
      tearOn(side > 0 ? 'legN' : 'legF', far, limbQ(hip, p[kn], p[ft], 6.3, 4.5, 3.6));
      const up = nrm(sub(p[kn], p[ft]));
      // (the Pit's boots: the trousers tucked into them, the shaft up the shin)
      if (K.shaft) rigid(c, tx(K.shaft, far), p[ft], up, mul(perp(up), fv), sz);
      // (the shin guards: tyre rubber strapped on the front of the shin, from under the knee to the top of the boot)
      if (K.shin) { const dn = mul(up, -1), q = perp(dn), cf = dot(q, V(-fv, 0)) > 0 ? -1 : 1, pf = TN ? cl(Math.abs(VW.c) * 1.3, 0, 1) : 1, off = mul(q, cf * 1.6 * sz * pf),
          g0 = add(add(p[kn], mul(dn, 2.4 * sz)), off), g1 = add(add(p[ft], mul(dn, -(K.foot === 'bare' || K.foot === 'sandal' ? 2.2 : 5.4) * sz)), off);
        rigid(c, tx(K.shin, far), g0, dn, mul(q, cf), len(sub(g1, g0)) / A.pieces[K.shin].len, sz * (1 - .12 * pf)); }
      if (S.v === 'F') putShoe(); };
    // the seat of the trousers: the weight of the hips, both thighs going into it
    const seat = () => { const dn = nrm(add(sub(p0[KNF], P0), sub(p0[KNB], P0))), crotch = add(P0, mul(dn, 5.4 * sz)); let Q;
      if (!TN) Q = [at(T * .06, -8.2), at(-T * .1, -9.4), add(at(-T * .2, -7.6), mul(dn, 1.6 * sz)), crotch, add(at(-T * .2, 6.8), mul(dn, 1.6 * sz)), at(-T * .08, 8.3), at(T * .06, 7.9)];
      else { Q = [VW.at(crotch, 0)]; for (const a of [T * .04, -T * .12]) { const sB = -9, sF = 7.8, sc = (sB + sF) / 2, Dd = (sF - sB) / 2, wd = A.tab(A.wide, a / T); for (let i = 0; i < 12; i++) { const t = i / 12 * TAU; Q.push(VW.at(at(a, sc + Dd * Math.cos(t)), wd * Math.sin(t) * sz)); } }
        for (const hq of HIP) Q.push(add(hq, V(0, 4 * sz))); Q = FigKit.hull(Q); }
      c.fillStyle = K.seat; c.fill(pathOf(Q)); };

    // ----- the coat's skirt -----
    let skirtDraw = null, SK = null, skirtOver = false, shield = 0, shieldAt = null;
    const hasHoles = () => !W && Array.isArray(F.hemTears) && F.hemTears.length > 0;
    // (what cuts through the skirt: it is drawn in a layer of its own and the cuts taken out of that)
    const holed = (Q, fn, cutFn) => { const Ly = KaelLook.layerOpen ? KaelLook.layerOpen(c, Q, 8) : null; if (!Ly) { fn(); return; } const c0 = c; c = Ly.g; c.imageSmoothingEnabled = true;
      try { fn(); c.save(); c.globalCompositeOperation = 'destination-out'; cutFn(c); c.restore(); } finally { c = c0; } KaelLook.layerClose(c, Ly); };
    // (the notches a hard blow tears from the hem: F.hemTears, each a place along the hem)
    const hemNotches = (cc, row) => { cc.fillStyle = '#000'; const n2 = row.length - 1, hl = Math.max(1, len(sub(row[n2], row[0]))), at2 = t => { const x = cl(1 - t, 0, 1) * n2, i = Math.min(n2 - 1, Math.floor(x)); return mix(row[i], row[i + 1], x - i); }, mid0 = at(T * .02, 0);
      for (const nq of F.hemTears) { const w = Math.min(nq.w / hl, .12), t = cl(nq.t, .04 + w, .96 - w), d = Math.min(nq.d, hl * .6 + 2), a = at2(t - w), bq = at2(t + w), m = at2(t), up = nrm(sub(mid0, m)), tip = add(m, mul(up, d));
        cc.beginPath(); cc.moveTo(a.x, a.y + 4); cc.lineTo(a.x, a.y - .4); cc.lineTo(tip.x, tip.y); cc.lineTo(bq.x, bq.y - .4); cc.lineTo(bq.x, bq.y + 4); cc.closePath(); cc.fill(); } };
    if (K.coatOn && K.skirt) {
      const PH = o.phys, pr = PH ? PH.p : p0, faR = PH ? PH.fa : fa, PR = pr[PEL], ur = PH ? nrm(sub(pr[CHE], PR)) : u0, nr = mul(perp(ur), faR), atR = PH ? (a, s) => add(add(PR, mul(ur, a)), mul(nr, s * sz)) : at;
      const farPts = [mix(PR, pr[KNB], .5), pr[KNB], mix(pr[KNB], pr[FTB], .45)], allPts = [...farPts, mix(PR, pr[KNF], .5), pr[KNF], mix(pr[KNF], pr[FTF], .45)];
      const lc = K.coatLen, an = [{ p: atR(-T * .06, 7.4), len: 46 * sz * lc, pts: farPts, clear: 4.2 * sz }, { p: atR(-T * .08, -8.6), len: 47 * sz * lc, pts: allPts, clear: 4.8 * sz }];
      const Qc = KaelLook.coatStep(F, an, faR, gy, now, o.wind); let fr0 = V(Qc[0].x, Qc[0].y), bk0 = V(Qc[1].x, Qc[1].y);
      const ws = KaelLook.windK(o.wind);
      if (PH && PH.mir) { const k2 = cl(ws * 2, 0, 1); fr0 = mix(V(2 * PH.cx - fr0.x, fr0.y), fr0, k2); bk0 = mix(V(2 * PH.cx - bk0.x, bk0.y), bk0, k2); }
      if (fr0.x * fa < bk0.x * fa) { const t = fr0; fr0 = bk0; bk0 = t; }
      skirtOver = ws > .3 && ((fr0.x + bk0.x) / 2 - P0.x) * fa > 14 * sz;
      // (in the wind the cloth flutters: a wave down it from the hips to the hem, growing toward the hem)
      const FL = ws > 0 ? (() => { const H = at(-T * .02, 0), D = nrm(sub(mix(fr0, bk0, .5), H)), Nn = perp(D), Ls = Math.max(8, len(sub(mix(fr0, bk0, .5), H))), fq = 1.8 + 2.6 * ws,
          gust = .8 + .13 * Math.sin(now * 1.7) + .1 * Math.sin(now * 4.3 + 1), Am = 10 * sz * ws * gust, Bm = 5.5 * sz * ws * gust * Math.sin(TAU * (1.3 + 1.1 * ws) * now + .7);
        return q => { const r = sub(q, H), s = cl(dot(r, D) / Ls, 0, 1.2), ph = TAU * (s - fq * now) + 2.4 * dot(r, Nn) / Ls; return add(q, mul(Nn, Am * Math.pow(s, 1.4) * (Math.sin(ph) + .3 * Math.sin(2.2 * ph + 1.3)) / 1.3 + Bm * s * s)); }; })() : null;
      const Sp = A.pieces[K.skirt], Stx = TEX[K.skirt];
      shield = !TN && !W ? ease(F.coatShield || 0) : 0;
      if (TN) { const row = comp.tab.reduce((m, r) => Math.abs(r[0] * kT + T * .06) < Math.abs(m[0] * kT + T * .06) ? r : m), top = { F: at(-T * .06, row[2]), B: at(-T * .06, row[1]), w: row[3] * sz }, fl = o.spin != null ? Math.sin(PI * cl(o.spin, 0, 1)) : 0;
        const hem = { F: FL ? FL(fr0) : fr0, B: FL ? FL(bk0) : bk0, w: Math.max(row[3] * sz * 1.12, len(sub(fr0, bk0)) * .42) + fl * 9 * sz, lift: fl * 7 * sz };
        SK = FigKit.cone(VW, top, hem, { open: [.14, .5 + .45 * fl], gy, rows: 6 }); SK.tex = Stx; SK.sp = Sp; SK.lin = K.noGold ? '#17150d' : '#0c2422'; }
      else skirtDraw = () => { const WF = at(T * .33, 7.4), HF = at(T * .05, 8.8), HB = at(-T * .06, -9.2), WB = at(T * .3, -7); let fr = fr0, bk = bk0;
        // (swept round as a shield, the skirt keeps only its back part, and the back comes in to his legs)
        if (shield > 0) { const hb = KaelLook.hemLine(fr0, bk0, 2.2 * sz, null, mix(HF, HB, .5), gy).base(.32); fr = mix(fr0, hb, shield); bk = mix(bk0, V(P0.x - fa * 5 * sz, gy(P0.x) - 24 * sz), shield * .55); shieldAt = { fr: fr0, hb }; }
        const fq = FL || (q => q), Le = [WB, HB, fq(mix(HB, bk, .34)), fq(mix(HB, bk, .67)), fq(bk)], Re = [WF, HF, fq(mix(HF, fr, .34)), fq(mix(HF, fr, .67)), fq(fr)], cols = 4, G = [];
        for (let r = 0; r < 5; r++) { const rw = []; for (let j = 0; j <= cols; j++) { const s = j / cols, q = mix(Le[r], Re[r], s);
            // (the hem sags between its corners, and the cloth bellies a little on the way down)
            if (r > 1) { q.y += Math.sin(PI * s) * 2.2 * sz * (r - 1) / 3; const fl2 = gy(q.x) - .5; if (q.y > fl2) q.y = fl2; } rw.push(q); } G.push(rw); }
        const us = Array.from({ length: cols + 1 }, (_, j) => Sp.w * j / cols);
        if (hasHoles()) holed(G.flat(), () => grid(c, Stx, G, us, Sp.rows), cut => hemNotches(cut, G[4])); else grid(c, Stx, G, us, Sp.rows);
        skirtRips(HF, HB, G[4], [...G.map(rw => rw[0]), ...G[4], ...G.map(rw => rw[cols]).reverse()]);
        if (RIMON) { const Fe = Re.slice(1), Nf = Fe.map((q, i) => { const d = nrm(sub(Fe[Math.min(Fe.length - 1, i + 1)], Fe[Math.max(0, i - 1)])); let nn = perp(d); if (dot(nn, n0) < 0) nn = mul(nn, -1); return nn; }); edgeRim(c, Fe, Nf, Ld, rimCol, rimW, .7); } };
    }
    // turned: the inside of its back, then (after the legs) the panels round him
    const skirtInner = () => { if (!SK) return; c.fillStyle = SK.lin; c.fill(pathOf(SK.inner)); };
    const skirtOuter = () => { if (!SK) return; const Sp = SK.sp, N = 6, M = 5, y0 = Sp.rows[1], y1 = Sp.rows[Sp.rows.length - 1];
      for (const Pn of SK.panels) { const G = [], us = [], vs = [];
        for (let i = 0; i <= N; i++) { const v = i / N, lo = Pn.L[i][0], hi = Pn.R[i][0], op = SK.open(v), rw = [], ur = []; vs.push(lerp(y0, y1, v));
          for (let j = 0; j <= M; j++) { const t = lerp(lo, hi, j / M); rw.push(SK.at(t, v)); ur.push(Sp.w * cl((PI - Math.abs(t)) / (PI - op), 0, 1)); } G.push(rw); us.push(ur); }
        grid(c, SK.tex, G, us, vs); } };

    // ----- the torso, the neck, the head -----
    const tornTorso = !(W && !W.coat && (W.top || 'bare') === 'bare');
    const torso = () => {
      if (!TN) { rigid(c, comp.prof, P0, n0, mul(u0, -1), sz, kT);
        // (the dagger at the small of his back, the coat off)
        if (K.back) rigid(c, TEX[K.back], P0, n0, mul(u0, -1), sz);
        const Fq = [], Bq = []; for (const r of comp.tab) { Fq.push(at(r[0] * kT, r[2])); Bq.push(at(r[0] * kT, r[1])); }
        if (tornTorso) tearOn('torso', false, [...Fq, ...Bq.slice().reverse()]);
        if (RIMON) { const NF = [], NB = [];
          for (let i = 0; i < Fq.length; i++) { const dF = nrm(sub(Fq[Math.min(Fq.length - 1, i + 1)], Fq[Math.max(0, i - 1)])), dB = nrm(sub(Bq[Math.min(Bq.length - 1, i + 1)], Bq[Math.max(0, i - 1)])); let a = perp(dF); if (dot(a, n0) < 0) a = mul(a, -1); let b2 = perp(dB); if (dot(b2, n0) > 0) b2 = mul(b2, -1); NF.push(a); NB.push(b2); }
          edgeRim(c, Fq, NF, Ld, rimCol, rimW, .8); edgeRim(c, Bq, NB, Ld, rimCol, rimW, .8); }
        trims(at); return; }
      const tab = comp.tab, tabA = tab.map(r => [r[0] * kT, r[1], r[2], r[3]]), NT = TGRID.length;
      for (const side of [-1, 1]) { const fm = FigKit.torsoMap(VW, P0, u0, n0, sz, tabA, side); if (!(fm.vis > .04)) continue;
        const Pm = tab.map(r => TGRID.map(t => fm(r[0] * kT, (r[1] + r[2]) / 2 + (r[2] - r[1]) / 2 * Math.cos(t))));
        for (let j = 0; j < NT - 1; j++) { let sec = sector((TGRID[j] + TGRID[j + 1]) / 2), tex = sec === 'F' ? comp.frontB : sec === 'K' ? comp.backB : null; if (!tex) { sec = 'S'; tex = side > 0 ? comp.nearB : comp.farB; }
          for (let i = 0; i < tab.length - 1; i++) { const a = Pm[i][j], b2 = Pm[i][j + 1], d = Pm[i + 1][j], e = Pm[i + 1][j + 1]; if (a.h && b2.h && d.h && e.h) continue;
            cell(c, tex, (uOf(sec, tab[i], TGRID[j], side) + uOf(sec, tab[i + 1], TGRID[j], side)) / 2, -tab[i][0], (uOf(sec, tab[i], TGRID[j + 1], side) + uOf(sec, tab[i + 1], TGRID[j + 1], side)) / 2, -tab[i + 1][0], a, b2, d, e); } }
        // (the dagger at the small of his back: on his near half, round him with the rest, while that half's back can be seen)
        if (side > 0 && K.back) { const bx = A.pieces[K.back].box, us = [0, .25, .5, .75, 1].map(t => bx[0] + bx[2] * t), vs = [0, .5, 1].map(t => bx[1] + bx[3] * t), G = vs.map(v => us.map(uq => fm(-v * sz, uq)));
          grid(c, TEX[K.back], G, us, vs); }
        if (side > 0 && tornTorso) tearOn('torso', false, null, fm);
        trims(fm); } };
    // the gilt vine along a line of places: a line at game size, leaves on it when there is room to see them
    const GOLDC = '#e2b65a', GOLDS = '#b8862e';
    const vineOn = Q => { if (Q.length < 2) return; const big = k >= 2.4; c.strokeStyle = big ? GOLDS : GOLDC; c.lineWidth = Math.max(.56, big ? .56 : .94); c.beginPath(); c.moveTo(Q[0].x, Q[0].y);
      for (let i = 1; i < Q.length - 1; i++) { const m = mix(Q[i], Q[i + 1], .5); c.quadraticCurveTo(Q[i].x, Q[i].y, m.x, m.y); } c.lineTo(Q[Q.length - 1].x, Q[Q.length - 1].y); c.stroke();
      if (!big) return; c.fillStyle = GOLDC; c.beginPath(); let carry = 1.2, sd = 1;
      for (let i = 1; i < Q.length; i++) { const a = Q[i - 1], b2 = Q[i], sl = len(sub(b2, a)); if (sl < 1e-6) continue; const ux = (b2.x - a.x) / sl, uy = (b2.y - a.y) / sl;
        while (carry <= sl) { const x = a.x + ux * carry, y = a.y + uy * carry, cs = Math.cos(.8 * sd), sn = Math.sin(.8 * sd), dx = ux * cs - uy * sn, dy = ux * sn + uy * cs, Lf = 1.7 * sz, Wf = .62 * sz;
          c.moveTo(x, y); c.quadraticCurveTo(x + dx * Lf * .5 - dy * Wf, y + dy * Lf * .5 + dx * Wf, x + dx * Lf, y + dy * Lf); c.quadraticCurveTo(x + dx * Lf * .5 + dy * Wf, y + dy * Lf * .5 - dx * Wf, x, y); sd = -sd; carry += 2.1 * sz; } carry -= sl; }
      c.fill(); };
    const trims = AT => { if (K.noGold) return; for (const nm of K.torso) { const Tr = A.pieces[nm].trim; if (!Tr) continue; for (const Q of Tr) { const R2 = Q.map(q => AT(q[0] * kT, q[1])); if (R2.some(q => q.h)) { for (const run of FigKit.seen(R2)) vineOn(run); } else vineOn(R2); } } };
    const neck = () => { if (F.severed) return; const d = nrm(sub(p[HEAD], p[CHE])); rigid(c, TEX.neck, p[CHE], mul(perp(d), fv), mul(d, -1), sz); };
    const head = () => { const d = nrm(sub(p[HEAD], p[CHE])), tex = stack('H:' + hp.join('+'), hp.map(n2 => TEX[n2])), hs = sz * b.headR / (R.headR * b.h), X = mul(perp(d), fa * HV.mir);
      rigid(c, tex, p[HEAD], X, mul(d, -1), hs * HV.sx, hs);
      // the eyes: their own light (an opening turns it amber); drained, they are dull
      const E = A.pieces['head.' + HV.v + '.base'].eyes || [], dr = cl((F.drain || 0) - (F.eyeLit || 0), 0, 1), open = !!o.opening || !!F.opening, dull = 'head.' + HV.v + (F.dead ? '.shut' : '.dull');
      if ((dr > .02 || F.dead) && A.pieces[dull] && need([dull])) { c.save(); c.globalAlpha *= F.dead ? 1 : dr; rigid(c, TEX[dull], p[HEAD], X, mul(d, -1), hs * HV.sx, hs); c.restore(); }
      if (!F.dead && dr < .98 && E.length) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha *= 1 - dr;
        // (a small picture of the light, made once, laid over each eye: no gradient is made in a frame)
        const gl = glowOf(open); for (const e of E) { const q = add(p[HEAD], add(mul(X, e[0] * hs * HV.sx), mul(d, -e[1] * hs))), r = (open ? 2.9 : 2) * 1.8 * hs * (e[2] || 1); c.drawImage(gl, q.x - r, q.y - r, 2 * r, 2 * r); }
        c.restore(); } };
    // (the coat held up as a shield, and its front swept back in his hand: in profile only, a sheet of the coat's cloth over the painted
    // figure's own shapes)
    const sheetOn = (name, at2, NR, NC) => { const Sp = A.pieces[name], G = []; for (let i = 0; i <= NR; i++) { const rw = []; for (let j = 0; j <= NC; j++) rw.push(at2(j / NC, i / NR)); G.push(rw); }
      grid(c, TEX[name], G, Array.from({ length: NC + 1 }, (_, j) => Sp.w * j / NC), Array.from({ length: NR + 1 }, (_, i) => lerp(Sp.rows[0], Sp.rows[Sp.rows.length - 1], i / NR))); };
    // (a smooth line on through places, added to a path whose point is at the first of them)
    const curveTo = (Pth, Q, kq = .45) => { for (let i = 0; i < Q.length - 1; i++) { const a = Q[Math.max(0, i - 1)], b2 = Q[i], d = Q[i + 1], e = Q[Math.min(Q.length - 1, i + 2)];
        Pth.bezierCurveTo(b2.x + (d.x - a.x) * kq / 3, b2.y + (d.y - a.y) * kq / 3, d.x - (e.x - b2.x) * kq / 3, d.y - (e.y - b2.y) * kq / 3, d.x, d.y); } };
    const shieldDraw = () => { if (!(shield > 0 && shieldAt) || !KaelLook.shieldShape) return; const Sh = KaelLook.shieldShape(p, at, T, sz, fa, P0, shieldAt.fr, shieldAt.hb, shield, now, gy);
      const lineAt = (E, v) => { const s0 = cl(v, 0, 1) * (E.length - 1), i = Math.min(E.length - 2, Math.floor(s0)); return mix(E[i], E[i + 1], s0 - i); }, E1 = [Sh.A0, Sh.Wf, Sh.Kf, Sh.Bh], E2 = [Sh.top, Sh.U, Sh.L, Sh.Fh];
      // (its outline is the painted figure's own; the cloth is the skirt's, kept inside it)
      const hemS = KaelLook.hemLine(Sh.Fh, Sh.Bh, 3 * sz * shield, null, mix(Sh.L, Sh.Kf, .5), gy), SP = new Path2D(); SP.moveTo(Sh.A0.x, Sh.A0.y); curveTo(SP, [Sh.A0, Sh.top, Sh.U]); curveTo(SP, [Sh.U, Sh.L, Sh.Fh]);
      for (const q of hemS.pts.slice(1)) SP.lineTo(q.x, q.y); curveTo(SP, [Sh.Bh, Sh.Kf, Sh.Wf, Sh.A0], .4); SP.closePath();
      c.save(); c.fillStyle = A.tone('wool', 1); c.fill(SP); c.clip(SP);
      const mid = mix(Sh.L, Sh.Kf, .5), out2 = (q, e) => add(q, mul(nrm(sub(q, mid)), e));
      sheetOn(K.skirt, (uu, vv) => { const a = lineAt(E1, vv), b2 = lineAt(E2, vv); return mix(out2(a, 2 * sz), out2(b2, 2 * sz), uu); }, 6, 4);
      // (the lining shows along the turned front edge)
      c.strokeStyle = A.TEAL; c.globalAlpha *= .55 * shield; c.lineWidth = 2.2 * sz; c.beginPath(); c.moveTo(Sh.U.x, Sh.U.y); curveTo(c, [Sh.U, Sh.L, Sh.Fh]); c.stroke(); c.restore();
      // (and the vine runs down it)
      if (!K.noGold && K.shredLv < 3) vineOn([Sh.U, mix(Sh.U, Sh.L, .5), Sh.L, mix(Sh.L, Sh.Fh, .5), Sh.Fh]); };
    const flap = K.coatOn && !TN && !W && !ONE ? ease(F.coatOpen || 0) : 0;
    const flapDraw = () => { if (!(flap > .01) || !need(['sk.lining', 'grenade', 'grenade.loop'])) return; const h = p[HAF], D = 1.07, H0 = at(T * .93, .6), H1 = at(-T * .12, .2), E0 = at(T * .9, 7.4 * D), E1 = at(T * .56, 8.8 * D), E2 = at(-T * .1, 5.4);
      const O1 = V(h.x + fa * 1.4 * sz, h.y - 1.2 * sz), O0 = add(mix(at(T * .9, -4.5), O1, .18), V(0, -1.5 * sz)), O2 = V(h.x - fa * 2.4 * sz + Math.sin(now * 3.1) * .8 * sz, h.y + 21 * sz);
      const F0 = mix(E0, O0, flap), F1 = mix(E1, O1, flap), F2 = mix(E2, O2, flap), inside = dot(sub(F1, mix(H0, H1, .42)), n0) < 0;
      const FP = new Path2D(); FP.moveTo(H0.x, H0.y); curveTo(FP, [H0, F0, F1, F2], .42); FP.lineTo(H1.x, H1.y); FP.closePath();
      const fAt = (uu, vv) => { const hv = mix(H0, H1, vv), ev = vv < .4 ? mix(F0, F1, vv / .4) : mix(F1, F2, (vv - .4) / .6); return mix(hv, ev, uu); };
      // (swept forward it shows its outside: the coat's plain cloth, the light on its edge)
      if (!inside) { const mH = mix(H0, H1, .5), g = c.createLinearGradient(mH.x, mH.y, F1.x, F1.y); g.addColorStop(0, A.tone('wool', 0)); g.addColorStop(.6, A.tone('wool', 1)); g.addColorStop(1, A.tone('wool', 2)); c.fillStyle = g; c.fill(FP);
        if (RIMON) { const Eq = [F0, mix(F0, F1, .5), F1, mix(F1, F2, .5), F2], Nq = Eq.map(q => nrm(sub(q, mH))); edgeRim(c, Eq, Nq, Ld, rimCol, rimW, .7); } return; }
      // (swept back, its lining: quilted, in the coat's shade at the hinge; the facing along the front edge, the coat's own cloth turned
      // in, and its vine; the loop sewn across it, and the grenade in the loop while it is there)
      c.save(); c.fillStyle = A.TEAL; c.fill(FP); c.clip(FP); sheetOn('sk.lining', (uu, vv) => fAt(uu * 1.08 - .04, vv * 1.08 - .04), 6, 3);
      c.strokeStyle = A.tone('wool', 1); c.lineWidth = 3.2 * sz; c.beginPath(); c.moveTo(F0.x, F0.y); curveTo(c, [F0, F1, F2], .42); c.stroke(); c.restore();
      vineOn([F0, mix(F0, F1, .5), F1, mix(F1, F2, .5), F2]);
      if (flap > .3) { const nade = F.nade ?? F.grenade === 'coat', G0 = fAt(.58, .27), ax = nrm(sub(fAt(.58, .4), G0)); c.save(); c.globalAlpha *= cl((flap - .3) / .25, 0, 1); rigid(c, TEX[nade ? 'grenade' : 'grenade.loop'], G0, perp(ax), ax, sz * 1.15); c.restore(); } };
    const skirtRips = (HFq, HBq, hemRow, clipQ) => tearOn('skirt', false, clipQ, null, r => { const n2 = hemRow.length - 1, x = cl(1 - r.t, 0, 1) * n2, i = Math.min(n2 - 1, Math.floor(x)), bot = mix(hemRow[i], hemRow[i + 1], x - i), h = nrm(sub(hemRow[0], hemRow[n2]));
      return [mix(mix(HFq, HBq, r.t), bot, r.v), add(mul(h, Math.cos(r.ang || 0)), mul(perp(h), Math.sin(r.ang || 0) * fa))]; });

    if (!TN) {
      // in profile: the far arm, the far leg, the seat, the coat's skirt, the near leg, the neck, the torso, the head, the near arm
      if (ONE) weaponArm(true); else farArm(true); leg(KNB, FTB, -1, true); seat(); if (skirtDraw && !skirtOver) skirtDraw(); leg(KNF, FTF, 1, false); if (skirtDraw && skirtOver) skirtDraw();
      neck(); torso(); if (o.afterTorso) o.afterTorso(F); shieldDraw(); flapDraw(); head(); if (ONE) lostArm(); else nearArm(false);
    } else {
      // turned: the arms and legs in the order of how far toward the viewer each is, the ones behind him first; the skirt round the legs
      const dFarArm = (dp(sh0, -LS) + dp(p0[ELB], LAT[ELB]) + dp(p0[HAB], LAT[HAB])) / 3, dNA = (dp(sh0, LS) + dp(p0[ELF], LAT[ELF]) + dp(p0[HAF], LAT[HAF])) / 3, dNearArm = armed ? (dNA * 2 + dp(p0[TIP], LAT[TIP])) / 3 : dNA;
      const dFarLeg = (dp(P0, -LH) + dp(p0[KNB], -LH) + dp(p0[FTB], -LH)) / 3, dNearLeg = (dp(P0, LH) + dp(p0[KNF], LH) + dp(p0[FTF], LH)) / 3;
      const dW = (dp(sh0, -LS) + dp(p0[ELF], LAT[ELF]) + dp(p0[HAF], LAT[HAF])) / 3, dWeap = armed ? (dW * 2 + dp(p0[TIP], LAT[TIP])) / 3 : dW, dLost = dp(sh0, LS);
      const arms = (ONE ? [{ d: dWeap, fn: () => weaponArm(dWeap < 0) }, { d: dLost, fn: () => lostArm() }] : [{ d: dFarArm, fn: () => farArm(dFarArm < 0) }, { d: dNearArm, fn: () => nearArm(dNearArm < 0) }]).sort((a, b2) => a.d - b2.d);
      const legs = [{ d: dFarLeg, fn: () => leg(KNB, FTB, -1, dFarLeg < 0) }, { d: dNearLeg, fn: () => leg(KNF, FTF, 1, dNearLeg < 0) }].sort((a, b2) => a.d - b2.d);
      const prof = Math.abs(VW.s) < .35;
      for (const Am of arms) if (Am.d < 0) Am.fn();
      skirtInner();
      for (const Lg of legs) if (Lg.d < 0) Lg.fn();
      seat();
      if (!(SK && prof)) for (const Lg of legs) if (Lg.d >= 0) Lg.fn();
      skirtOuter();
      if (SK && prof) for (const Lg of legs) if (Lg.d >= 0) Lg.fn();
      neck(); torso(); if (o.afterTorso) across(LH, () => o.afterTorso(F));
      head();
      for (const Am of arms) if (Am.d >= 0) Am.fn();
    }
    c.restore(); state.drawn++; return true;
  }

  // ---------- in the game: Ilyas's own drawing, where the pieces cover him ----------
  function install() {
    if (typeof KaelLook === 'undefined' || KaelLook._painted) return;
    const painted = KaelLook.draw; KaelLook._painted = painted;
    KaelLook.draw = function (c, F, o) {
      if (state.on && !state.err) { let done = false; c.save(); try { done = draw(c, F, o || {}); } catch (e) { state.err = String(e && e.stack || e); } c.restore(); if (done) return; }
      return painted.apply(this, arguments);
    };
    // The gear screen draws him once for each thing he tries on, not every frame, so it cannot wait a frame for a piece. Where a piece
    // of what he tries on is still being made, the picture as it was stays until the piece is ready and is drawn then; only the first
    // picture of all is drawn at once whatever is ready (the painted figure standing in for a moment, if it must).
    try { if (typeof a1FigDraw === 'function') { const fd = a1FigDraw;   // eslint-disable-line no-undef
        a1FigDraw = function (cvs, wear) { if (!state.on || state.err || !cvs || !wear || typeof wear !== 'object') return fd(cvs, wear);   // eslint-disable-line no-global-assign, no-undef
          cvs._skinWant = wear; const K = kitOf({ wear, oneArm: true, openHand: true }, {}, true), names = [...K.needs, ...headParts('P', K.hat, true), ...headParts('F', K.hat, true)];
          if (need(names)) { cvs._skinDrawn = true; return fd(cvs, wear); }
          settled().then(() => { if (cvs._skinWant === wear) { cvs._skinDrawn = true; fd(cvs, wear); } });
          if (!cvs._skinDrawn) { cvs._skinDrawn = true; return fd(cvs, wear); } }; } } catch (e) { /* no gear screen on this page */ }
  }
  // when every piece now being made is ready
  const settled = () => Promise.all(Object.keys(PEND).map(k => PEND[k]));
  // every piece made ready ahead of need (the checks and the sheets wait on this)
  const loadAll = () => Promise.all(Object.keys(A.pieces).map(load));
  // as the page opens: him as the game first shows him (the long coat, in profile), then what that kit wants next
  const prewarm = () => { const K = kitOf({}, {}, false), first = [...K.needs, ...headParts('P', null, false)].filter(Boolean); return Promise.all(first.map(load)).then(() => { warm(alsoOf(K)); }); };
  return { state, TEX, load, loadAll, prewarm, warm, need, install, draw, kitOf, headView, TS };
})();
