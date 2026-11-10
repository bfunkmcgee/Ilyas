// ===== SKINNED FIGURE (a test, not part of the game) =====
// Ilyas drawn from art pieces fitted to the game's ragdoll each frame, in place of the painted figure (KaelLook.draw).
// The ragdoll, the poses and the weapon are the game's own; only the body's drawing changes. The pieces are SVG drawings
// (skin_ilyas.js), turned into bitmaps once when the page opens:
//   - a limb is one long drawing (shoulder to wrist, hip to ankle) laid along its two bones and bent at the joint;
//   - the torso, the head, the hands and the shoes are stiff pieces set on their joints;
//   - the coat's skirt is one drawing stretched over a grid hung from the hips to the two hem corners, which swing on the
//     same springs the painted coat uses.
// It is drawn with the 2D canvas inside the game's own figure slot, so the scene's layers, shadows and lighting treat it as
// they treat the painted figure. It covers the profile, two-armed, coated Ilyas of the fights; anything else (Act I's
// clothes, one arm, a portrait) falls back to the painted figure.
const Skin = (() => {
  'use strict';
  const TS = 6;                                   // bitmap pixels to one world unit
  const V = (x, y) => ({ x, y }), add = (a, b) => V(a.x + b.x, a.y + b.y), sub = (a, b) => V(a.x - b.x, a.y - b.y), mul = (a, k) => V(a.x * k, a.y * k),
    len = a => Math.hypot(a.x, a.y), nrm = a => { const l = Math.hypot(a.x, a.y) || 1; return V(a.x / l, a.y / l); }, perp = a => V(-a.y, a.x),
    mix = (a, b, u) => V(a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u), cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const PEL = 0, CHE = 1, HEAD = 2, ELF = 3, HAF = 4, ELB = 5, HAB = 6, KNF = 7, FTF = 8, KNB = 9, FTB = 10;
  const state = { on: true, ready: false, tex: {}, err: null, drawn: 0 };

  // ---------- the pieces, made into bitmaps ----------
  function load(art) {
    const names = Object.keys(art.pieces);
    return Promise.all(names.map(name => new Promise((res, rej) => {
      const P = art.pieces[name], [vx, vy, vw, vh] = P.box, w = Math.ceil(vw * TS), h = Math.ceil(vh * TS);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${vx} ${vy} ${vw} ${vh}">${art.defs || ''}${P.svg}</svg>`;
      const img = new Image();
      img.onload = () => {
        const mk = far => { const cv2 = document.createElement('canvas'); cv2.width = w; cv2.height = h; const x = cv2.getContext('2d'); x.drawImage(img, 0, 0, w, h);
          // (the far side of him: the same piece, pushed toward the dusk violet the game gives his far arm and leg)
          if (far) { x.globalCompositeOperation = 'source-atop'; x.fillStyle = art.far || 'rgba(52,40,78,.6)'; x.fillRect(0, 0, w, h); }
          return cv2; };
        state.tex[name] = { img: mk(false), ox: -vx * TS, oy: -vy * TS, w, h };
        if (P.far) state.tex[name + 'Far'] = { img: mk(true), ox: -vx * TS, oy: -vy * TS, w, h };
        res();
      };
      img.onerror = () => rej(new Error('piece ' + name + ' did not load'));
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }))).then(() => { state.art = art; state.ready = true; }, e => { state.err = String(e.message || e); });
  }

  // ---------- drawing a piece ----------
  // a stiff piece: its drawing's origin at O, its +x along X and its +y along Y (unit vectors; k scales it)
  function rigid(c, T, O, X, Y, k = 1) {
    const s = k / TS; c.save(); c.transform(X.x * s, X.y * s, Y.x * s, Y.y * s, O.x, O.y); c.drawImage(T.img, -T.ox, -T.oy); c.restore();
  }
  // a limb: the drawing runs along +x from the first joint (u=0) through the middle one (u=L0) to the last (u=L0+L1), its +y
  // toward his front. It is laid along A-J-B in slices, the bend at J taken round a short curve of radius r.
  function strip(c, T, A, J, B, L0, L1, fa, sz, o = {}) {
    const d0 = nrm(sub(J, A)), d1 = nrm(sub(B, J)), l0 = len(sub(J, A)), l1 = len(sub(B, J)), r = Math.min(o.r || 3.5, l0 * .4, l1 * .4), M = o.m || 5;
    const pts = [{ p: A, u: 0 }, { p: sub(J, mul(d0, r)), u: L0 - r * L0 / l0 }];
    const Ja = pts[1].p, Jb = add(J, mul(d1, r));
    for (let i = 1; i < M; i++) { const t = i / M, q = mix(mix(Ja, J, t), mix(J, Jb, t), t); pts.push({ p: q, u: L0 - r * L0 / l0 + (r * L0 / l0 + r * L1 / l1) * t }); }
    pts.push({ p: Jb, u: L0 + r * L1 / l1 }, { p: B, u: L0 + L1 });
    const n = pts.length, hw = (o.hw || 5) * sz, pa = o.padA ?? 4, pb = o.padB ?? 2, dirs = [];
    for (let i = 0; i < n - 1; i++) dirs.push(nrm(sub(pts[i + 1].p, pts[i].p)));
    for (let i = 0; i < n - 1; i++) {
      const d = dirs[i], a = pts[i], b = pts[i + 1];
      // (each slice reaches a little past its ends, far enough to close the wedge the turn opens on the outside of the bend)
      const turn = (j, k2) => j >= 0 && k2 < n - 1 ? Math.acos(cl(dirs[j].x * dirs[k2].x + dirs[j].y * dirs[k2].y, -1, 1)) : 0;
      const e0 = i === 0 ? pa : hw * Math.tan(Math.min(.6, turn(i - 1, i) / 2)) + .35, e1 = i === n - 2 ? pb : hw * Math.tan(Math.min(.6, turn(i, i + 1) / 2)) + .35;
      const S = sub(a.p, mul(d, e0)), E = add(b.p, mul(d, e1)), su0 = T.ox + (a.u - e0) * TS, su1 = T.ox + (b.u + e1) * TS, sw = su1 - su0;
      if (sw <= 0) continue;
      const kx = len(sub(E, S)) / sw, F = mul(perp(d), -fa * sz / TS);
      c.save(); c.transform(d.x * kx, d.y * kx, F.x, F.y, S.x - T.oy * F.x, S.y - T.oy * F.y); c.drawImage(T.img, su0, 0, sw, T.h, 0, 0, sw, T.h); c.restore();
    }
  }
  // a triangle of a drawing, its three corners (u,v in bitmap pixels) put at three places
  function tri(c, img, p0, p1, p2, u0, v0, u1, v1, u2, v2) {
    const d = u0 * (v1 - v2) + u1 * (v2 - v0) + u2 * (v0 - v1); if (Math.abs(d) < 1e-6) return;
    const a = (p0.x * (v1 - v2) + p1.x * (v2 - v0) + p2.x * (v0 - v1)) / d, b = (p0.y * (v1 - v2) + p1.y * (v2 - v0) + p2.y * (v0 - v1)) / d,
      cc = (p0.x * (u2 - u1) + p1.x * (u0 - u2) + p2.x * (u1 - u0)) / d, dd = (p0.y * (u2 - u1) + p1.y * (u0 - u2) + p2.y * (u1 - u0)) / d,
      e = p0.x - a * u0 - cc * v0, f = p0.y - b * u0 - dd * v0;
    // (grown a little about its middle, so no seam shows between it and the next)
    const mx = (p0.x + p1.x + p2.x) / 3, my = (p0.y + p1.y + p2.y) / 3, g = q => { const dx = q.x - mx, dy = q.y - my, l = Math.hypot(dx, dy) || 1; return V(q.x + dx / l * .45, q.y + dy / l * .45); };
    const q0 = g(p0), q1 = g(p1), q2 = g(p2);
    c.save(); c.beginPath(); c.moveTo(q0.x, q0.y); c.lineTo(q1.x, q1.y); c.lineTo(q2.x, q2.y); c.closePath(); c.clip();
    c.transform(a, b, cc, dd, e, f); c.drawImage(img, 0, 0); c.restore();
  }
  // a drawing stretched over a grid of places: G[row][col], the rows at the drawing's vs[] and the columns at its us[] (world units)
  function mesh(c, T, G, us, vs) {
    for (let r = 0; r < G.length - 1; r++) for (let k = 0; k < G[r].length - 1; k++) {
      const u0 = T.ox + us[k] * TS, u1 = T.ox + us[k + 1] * TS, v0 = T.oy + vs[r] * TS, v1 = T.oy + vs[r + 1] * TS, a = G[r][k], b = G[r][k + 1], d = G[r + 1][k], e = G[r + 1][k + 1];
      tri(c, T.img, a, b, e, u0, v0, u1, v0, u1, v1); tri(c, T.img, a, e, d, u0, v0, u1, v1, u0, v1);
    }
  }

  // ---------- the coat's hem: the painted coat's own springs (KaelLook.coatTargets), so the two swing alike ----------
  function hem(F, an, fa, gy, now) {
    const C = KaelLook.COAT, tg = KaelLook.coatTargets(an, fa, gy), st = F._coat;
    if (!st || !st.q || st.q.length !== 2 || st.warp !== F.warpAt || tg.some((t, i) => Math.hypot(t.x - st.q[i].x, t.y - st.q[i].y) > C.snap)) {
      F._coat = { t: now, warp: F.warpAt, q: tg.map(t => ({ x: t.x, y: t.y, vx: 0, vy: 0 })) }; return F._coat.q; }
    const dt = cl(now - (st.t ?? now), 0, 1 / 15); st.t = now; if (!(dt > 0)) return st.q;
    const n = Math.ceil(dt * 120), h = dt / n, w = C.w, z = C.z, vm = C.vmax;
    for (let k = 0; k < n; k++) st.q.forEach((q, i) => { const t = tg[i], a = an[i];
      q.vx += (w * w * (t.x - q.x) - 2 * z * w * q.vx) * h; q.vy += (w * w * (t.y - q.y) - 2 * z * w * q.vy) * h;
      const sp = Math.hypot(q.vx, q.vy); if (sp > vm) { q.vx *= vm / sp; q.vy *= vm / sp; }
      q.x += q.vx * h; q.y += q.vy * h;
      const dx = q.x - a.p.x, dy = q.y - a.p.y, d = Math.hypot(dx, dy), L = a.len * 1.04;
      if (d > L) { const kx = dx / d, ky = dy / d; q.x = a.p.x + kx * L; q.y = a.p.y + ky * L; const vr = q.vx * kx + q.vy * ky; if (vr > 0) { q.vx -= vr * kx; q.vy -= vr * ky; } }
      const fl = gy(q.x) - 1; if (q.y > fl) { q.y = fl; if (q.vy > 0) q.vy = 0; } });
    return st.q;
  }

  // ---------- the figure ----------
  function covers(F, o) { return state.on && state.ready && !F.wear && !F.oneArm && !o.look && !o.outfit && !o.hair && !o.lodMin; }
  function draw(c, F, o = {}) {
    const X = state.tex, A = state.art, R = A.rest, p = F.p, fa = F.facing, b = F.body, sz = b.h * (.93 + .07 * b.bulk), now = o.now ?? (F.t || 0);
    const P0 = p[PEL], C0 = p[CHE], u0 = nrm(sub(C0, P0)), n0 = mul(perp(u0), fa), T = len(sub(C0, P0));
    const at = (a, s) => add(add(P0, mul(u0, a)), mul(n0, s * sz));
    const gy = typeof F.gr === 'function' ? (x => F.gr(x)) : (x => F.ground ?? (Math.max(p[FTF].y, p[FTB].y) + 3));
    const sh = at(T - 2.8 * sz, -.6);
    const arm = (el, ha, far) => {
      strip(c, X[far ? 'armFar' : 'arm'], sh, p[el], p[ha], R.ua, R.fa, fa, sz, { r: 3.2, hw: 4.6, padA: 4.5, padB: 1.5 });
      const d = nrm(sub(p[ha], p[el])); rigid(c, X[far ? 'handFar' : 'hand'], p[ha], d, mul(perp(d), -fa), sz);
    };
    const leg = (kn, ft, far) => {
      strip(c, X[far ? 'legFar' : 'leg'], P0, p[kn], p[ft], R.th, R.sh, fa, sz, { r: 4.2, hw: 6, padA: 5.5, padB: 1.2 });
      // the shoe: out from the ankle across the shin, toward his front; the toe never below the floor
      const d = nrm(sub(p[ft], p[kn])), planted = p[ft].y > gy(p[ft].x) - 6 && Math.abs(Math.atan2(d.x, d.y)) < .95; let f = planted ? V(fa, 0) : mul(perp(d), -fa);
      const toe = add(p[ft], mul(f, 11 * sz)), fl = gy(toe.x) - .5; if (!planted && toe.y > fl) { const dy = Math.min(8, fl - p[ft].y), dx = Math.sqrt(Math.max(1, 121 * sz * sz - dy * dy)) * Math.sign(f.x || fa); f = nrm(V(dx, dy)); }
      rigid(c, X[far ? 'shoeFar' : 'shoe'], p[ft], f, mul(perp(f), fa), sz);
    };
    c.save(); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    arm(ELB, HAB, true);
    if (o.afterFarArm) o.afterFarArm(F);
    leg(KNB, FTB, true);
    // the skirt: hung from the hips, in front of the far leg and behind the near one
    {
      const farPts = [mix(P0, p[KNB], .5), p[KNB], mix(p[KNB], p[FTB], .45)], allPts = [...farPts, mix(P0, p[KNF], .5), p[KNF], mix(p[KNF], p[FTF], .45)];
      const an = [{ p: at(-T * .06, 7.4), len: 46 * sz, pts: farPts, clear: 4.2 * sz }, { p: at(-T * .08, -8.6), len: 47 * sz, pts: allPts, clear: 4.8 * sz }];
      const Q = hem(F, an, fa, gy, now); let fr = V(Q[0].x, Q[0].y), bk = V(Q[1].x, Q[1].y);
      if (fr.x * fa < bk.x * fa) { const t = fr; fr = bk; bk = t; }
      const WF = at(T * .33, 7.4), HF = at(T * .05, 8.8), HB = at(-T * .06, -9.2), WB = at(T * .3, -7);
      const L = [WB, HB, mix(HB, bk, .34), mix(HB, bk, .67), bk], Rr = [WF, HF, mix(HF, fr, .34), mix(HF, fr, .67), fr], cols = 4, G = [];
      for (let r = 0; r < 5; r++) { const row = []; for (let k = 0; k <= cols; k++) { const s = k / cols, q = mix(L[r], Rr[r], s);
          // (the hem sags between its corners, and the cloth bellies a little on the way down)
          if (r > 1) { q.y += Math.sin(Math.PI * s) * 2.2 * sz * (r - 1) / 3; const fl = gy(q.x) - .5; if (q.y > fl) q.y = fl; }
          row.push(q); } G.push(row); }
      const SK = A.skirt; mesh(c, X.skirt, G, Array.from({ length: cols + 1 }, (_, k) => SK.w * k / cols), SK.rows);
    }
    leg(KNF, FTF, false);
    // the neck, the torso over it
    { const d = nrm(sub(p[HEAD], C0)); rigid(c, X.neck, C0, mul(perp(d), fa), mul(d, -1), sz); }
    rigid(c, X.torso, P0, n0, mul(u0, -T / R.torso / sz), sz);
    if (o.afterTorso) o.afterTorso(F);
    // the head: on the neck's line, turned to look behind him when the game says so
    { const v = sub(p[HEAD], C0), d = nrm(v), back = (F.lookBack || o.lookBack) ? -1 : 1; rigid(c, X.head, p[HEAD], mul(perp(d), fa * back), mul(d, -1), sz * b.headR / (R.headR * b.h)); }
    // the weapon, then the near arm over its grip: his arc-blade by the painted figure's own blade painter (KaelLook.blade, which
    // the test's build lets out of its module), any other weapon by the game's
    if (!(F.wp && F.wp.unarmed)) {
      if (F.weaponKey === 'elven' && KaelLook.blade) { if (o.bladeOK !== false) { const tr = c.getTransform(), k = Math.hypot(tr.a, tr.b) || 1, h = p[HAF],
          Ld = o.dir ? nrm(o.dir) : o.light ? nrm(sub(o.light, mix(P0, C0, .5))) : nrm(V(.5, -1)), hv = h.px != null && typeof DT !== 'undefined' ? V((h.x - h.px) / DT, (h.y - h.py) / DT) : V(0, 0);
          KaelLook.blade(c, h, p[11], fa, o.arcSt !== undefined ? o.arcSt : (F.arcSt || null), KaelLook.LOOKS.noir.col, null, Math.max(.55, 1.05 / k), now, Ld, k, hv); } }
      else if (o.drawOther) o.drawOther(F);
    }
    arm(ELF, HAF, false);
    c.restore(); state.drawn++;
  }

  // ---------- in the game: Ilyas's own drawing, where the pieces cover him ----------
  function install() {
    if (typeof KaelLook === 'undefined' || KaelLook._painted) return;
    const painted = KaelLook.draw; KaelLook._painted = painted;
    KaelLook.draw = function (c, F, o) {
      if (covers(F, o || {}) && typeof S !== 'undefined' && S.F && F === S.F[0]) { try { draw(c, F, o || {}); return; } catch (e) { state.err = String(e.message || e); state.on = false; } }
      return painted.apply(this, arguments);
    };
  }
  return { state, load, install, draw, covers };
})();
