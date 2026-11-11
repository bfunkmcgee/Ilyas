// ===== THE FALL, A NEW CUT (a test, not part of the game) =====
// The roof's last seconds and the whole of the fall, filmed again: the same lines, the same things happening to him, a camera that
// moves with them, a body that acts them, and the desert in his head as scenes of its own. Nothing in the game's files is changed:
// this script stands in for two stages' scripts while its switch is on (FallCut.state.on), and leaves them as they are when it is
// off. It rides on the game's own hooks: the stages' intro and setup (STAGES), a callback each step after the story's and the Pit's
// (V11.step), a pass under the story's bars and words (V11UI.screen, first), and a pass in the world (V11UI.world).
//
// The cut, in order:
//   the roof    the push in on the shot, the steps back to the lip, the tip over it, slowed; no black
//   the tower   under the coping, the drop, his thoughts shot by shot; the desert as three memories (the inking, the wire, the well)
//               that take the whole picture on the lines that speak of it, and the dune under him when he says he can wait
//   the Pit     its mouth slowed and wide, the first blow, the spike held close, the hay, the eye's spark, the arm
// With reduced motion the camera cuts instead of moving and the flicker and the streaks are left out.
const FallCut = (() => {
  'use strict';
  const state = { on: true, err: null, shot: '', vis: null, log: [] };
  const DEG = Math.PI / 180;
  const note = s => { state.shot = s; if (state.log.length < 200) { state.log.push([+S.t.toFixed(2), s]); } };

  // ---------- his body in the air ----------
  // A pose is angles in his own frame (degrees): an arm's at the shoulder from hanging along the trunk (0) round to the front (90)
  // and up past the head (180), then the elbow's bend; a leg's at the hip the same way, then the knee's (a knee bends back: minus);
  // the head's nod. The trunk is left to the fall: each limb is drawn toward where the pose puts it from where the trunk is now.
  const POSES = {
    stand:    { aN: [8, 8],     aF: [-6, 10],   lN: [4, -4],    lF: [-4, -4],   hd: 0 },
    // going over the lip: the arms come up in front of him, toward the roof he is leaving
    tip:      { aN: [96, 10],   aF: [78, 16],   lN: [6, -6],    lF: [-5, -9],   hd: -8 },
    // on his back under the edge: one hand up at the light, the legs trailing above the hips
    reach:    { aN: [104, 6],   aF: [64, 34],   lN: [34, -40],  lF: [14, -26],  hd: -12 },
    // the hand he reached with, in front of his face
    hand:     { aN: [78, 96],   aF: [38, 26],   lN: [28, -34],  lF: [10, -20],  hd: 16 },
    // let go: everything trailing
    slack:    { aN: [128, 22],  aF: [104, 34],  lN: [36, -46],  lF: [16, -30],  hd: -4 },
    // drawn in on himself
    curl:     { aN: [52, 104],  aF: [40, 96],   lN: [78, -96],  lF: [62, -84],  hd: 26 },
    // the fists closed, the limbs his own again
    set:      { aN: [26, 78],   aF: [14, 66],   lN: [12, -18],  lF: [-2, -12],  hd: 6 },
    // lying out on the air, on the sand
    lie:      { aN: [22, 12],   aF: [-12, 18],  lN: [6, -10],   lF: [-4, -5],   hd: -4 },
    // head down, the arms back along him
    dive:     { aN: [-18, -6],  aF: [-30, -8],  lN: [2, -2],    lF: [5, -5],    hd: 12 },
    // the arms thrown up in front of him
    shield:   { aN: [112, 64],  aF: [96, 76],   lN: [64, -84],  lF: [44, -70],  hd: 18 },
  };
  const mixPose = (a, b, u) => { const o = {}; for (const k of ['aN', 'aF', 'lN', 'lF']) { o[k] = [lerp(a[k][0], b[k][0], u), lerp(a[k][1], b[k][1], u)]; } o.hd = lerp(a.hd, b.hd, u); return o; };
  // the lengths of his bones (the body's own)
  function bonesOf(f) { const b = f.body; return { torso: b.torso, neck: b.neck, ua: b.ua, fa: b.fa, th: b.th, sh: b.sh }; }
  // which way his trunk points (0 upright, 90 the head to the right, 180 head down)
  function trunkAng(f) { const a = f.p[PEL], b = f.p[CHE]; return Math.atan2(b.x - a.x, -(b.y - a.y)) / DEG; }
  const wrap180 = d => ((d + 180) % 360 + 360) % 360 - 180;
  // where a pose puts every joint from his hips, for a trunk pointing along (ux, uy): [dx, dy] by joint (the trunk's own two as well)
  function fk(B, P, ux, uy, fa) { const fx = -uy * fa, fy = ux * fa, dir = g => { const c = Math.cos(g * DEG), s = Math.sin(g * DEG); return [-ux * c + fx * s, -uy * c + fy * s]; }, R = [];
    R[PEL] = [0, 0]; R[CHE] = [ux * B.torso, uy * B.torso];
    const limb = (i0, i1, root, A, l0, l1) => { const d0 = dir(A[0]), d1 = dir(A[0] + A[1]); R[i0] = [root[0] + d0[0] * l0, root[1] + d0[1] * l0]; R[i1] = [R[i0][0] + d1[0] * l1, R[i0][1] + d1[1] * l1]; };
    limb(ELF, HAF, R[CHE], P.aN, B.ua, B.fa); limb(ELB, HAB, R[CHE], P.aF, B.ua, B.fa); limb(KNF, FTF, R[PEL], P.lN, B.th, B.sh); limb(KNB, FTB, R[PEL], P.lF, B.th, B.sh);
    const hc = Math.cos(P.hd * DEG), hs = Math.sin(P.hd * DEG); R[HEAD] = [R[CHE][0] + (ux * hc + fx * hs) * B.neck, R[CHE][1] + (uy * hc + fy * hs) * B.neck];
    return R; }
  const LIMBS = [HEAD, ELF, HAF, ELB, HAB, KNF, FTF, KNB, FTB];
  // One step of a pose: each limb turned a part of the way (k) to where the pose has it, from the trunk as it is now. The turning is
  // done in angles, so every bone keeps its length and nothing pushes back on the trunk; his middle is kept where it was.
  function poseStep(f, B, P, k) { const p = f.p, a = p[PEL], b = p[CHE], L = Math.hypot(b.x - a.x, b.y - a.y) || 1, ux = (b.x - a.x) / L, uy = (b.y - a.y) / L, fa = f.facing, fx = -uy * fa, fy = ux * fa;
    const angOf = (vx, vy) => Math.atan2(vx * fx + vy * fy, -(vx * ux + vy * uy)) / DEG, dir = g => { const c = Math.cos(g * DEG), s = Math.sin(g * DEG); return [-ux * c + fx * s, -uy * c + fy * s]; };
    const gone = !!(S.pit && (S.pit.armGone || S.pit.pin)); let sx = 0, sy = 0, M = 0; for (const q of p) { M += q.m; }
    const move = (q, x, y) => { const dx = x - q.x, dy = y - q.y; q.x = x; q.y = y; q.px += dx; q.py += dy; sx += dx * q.m; sy += dy * q.m; return [dx, dy]; };
    const limb = (i0, i1, root, A, l0, l1) => { const e = p[i0], h = p[i1], g0 = angOf(e.x - root.x, e.y - root.y), g1 = angOf(h.x - e.x, h.y - e.y);
      const n0 = g0 + wrap180(A[0] - g0) * k, n1 = g1 + wrap180(A[0] + A[1] - g1) * k, d0 = dir(n0), d1 = dir(n1), ex = root.x + d0[0] * l0, ey = root.y + d0[1] * l0;
      move(e, ex, ey); return move(h, ex + d1[0] * l1, ey + d1[1] * l1); };
    if (!gone) { const d = limb(ELF, HAF, b, P.aN, Math.hypot(p[ELF].x - b.x, p[ELF].y - b.y), B.fa), t = p[TIP]; move(t, t.x + d[0], t.y + d[1]); }
    limb(ELB, HAB, b, P.aF, B.ua, B.fa); limb(KNF, FTF, a, P.lN, B.th, B.sh); limb(KNB, FTB, a, P.lF, B.th, B.sh);
    { const h = p[HEAD], g = Math.atan2((h.x - b.x) * fx + (h.y - b.y) * fy, (h.x - b.x) * ux + (h.y - b.y) * uy) / DEG, n = g + wrap180(P.hd - g) * k, c = Math.cos(n * DEG), s2 = Math.sin(n * DEG);
      move(h, b.x + (ux * c + fx * s2) * B.neck, b.y + (uy * c + fy * s2) * B.neck); }
    sx /= M; sy /= M; for (const q of p) { q.x -= sx; q.y -= sy; q.px -= sx; q.py -= sy; } }
  // every joint put exactly where a pose has it, his hips at (x, y) and his trunk at an angle: for the moments that are played, not fallen
  function poseSet(f, B, P, x, y, ang, still) { const R = fk(B, P, Math.sin(ang * DEG), -Math.cos(ang * DEG), f.facing), p = f.p;
    for (const i of [PEL, CHE, ...LIMBS]) { const q = p[i], nx = x + R[i][0], ny = y + R[i][1]; q.px = still ? nx : q.x; q.py = still ? ny : q.y; q.x = nx; q.y = ny; }
    const t = p[TIP], h = p[HAF]; t.px = still ? h.x : t.x; t.py = still ? h.y + 4 : t.y; t.x = h.x; t.y = h.y + 4; }
  // the whole of him turned about his middle by d degrees, where he is and where he was alike (so nothing is thrown)
  function turnBy(f, d) { if (!d) { return; } const p = f.p; let mx = 0, my = 0, M = 0; for (const q of p) { mx += q.x * q.m; my += q.y * q.m; M += q.m; } mx /= M; my /= M;
    const c = Math.cos(d * DEG), s = Math.sin(d * DEG), rot = (x, y) => ({ x: mx + (x - mx) * c - (y - my) * s, y: my + (x - mx) * s + (y - my) * c });
    for (const q of p) { const a = rot(q.x, q.y), b = rot(q.px, q.py); q.x = a.x; q.y = a.y; q.px = b.x; q.py = b.y; }
    for (const q of f.scarf || []) { const a = rot(q.x, q.y), b = rot(q.px, q.py); q.x = a.x; q.y = a.y; q.px = b.x; q.py = b.y; } }
  // the turning he has of his own taken out of him, a part (k) each step: so a way he is asked to face is the way he faces
  function stillSpin(f, k) { const p = f.p; let mx = 0, my = 0, vx = 0, vy = 0, M = 0; for (const q of p) { mx += q.x * q.m; my += q.y * q.m; vx += (q.x - q.px) * q.m; vy += (q.y - q.py) * q.m; M += q.m; }
    mx /= M; my /= M; vx /= M; vy /= M; let Lz = 0, I = 0; for (const q of p) { const rx = q.x - mx, ry = q.y - my; Lz += q.m * (rx * (q.y - q.py - vy) - ry * (q.x - q.px - vx)); I += q.m * (rx * rx + ry * ry); }
    const w = I > 1e-6 ? Lz / I * k : 0; for (const q of p) { const rx = q.x - mx, ry = q.y - my; q.px += -ry * w; q.py += rx * w; } }
  // The actor: what his body is asked to do just now. act({pose, k, ang, rate, spin}): a pose to come to (over `over` seconds), how hard
  // it holds him, a way for his trunk to point and how fast he may be turned to it, or a steady turn. Run each step by the director.
  const ACT = { B: null, from: POSES.slack, to: null, t0: 0, over: .5, k: 0, ang: null, rate: 0, spin: 0 };
  function act(o) { const now = ACT.to ? mixPose(ACT.from, ACT.to, sstep(clamp((S.t - ACT.t0) / ACT.over, 0, 1))) : ACT.from;
    if (o.pose !== undefined) { ACT.from = now; ACT.to = o.pose ? (typeof o.pose === 'string' ? POSES[o.pose] : o.pose) : null; ACT.t0 = S.t; ACT.over = o.over ?? .5; }
    if (o.k != null) { ACT.k = o.k; } if (o.ang !== undefined) { ACT.ang = o.ang; } if (o.rate != null) { ACT.rate = o.rate; } if (o.spin != null) { ACT.spin = o.spin; } }
  function actStep(f) { if (!ACT.B) { return; } const D = state.dbg || {};
    if (ACT.to && ACT.k > 0 && !D.noPose) { poseStep(f, ACT.B, mixPose(ACT.from, ACT.to, sstep(clamp((S.t - ACT.t0) / ACT.over, 0, 1))), ACT.k); }
    if (D.noTurn) { return; }
    if (ACT.ang != null && ACT.rate > 0) { if (!D.noStill) { stillSpin(f, 1); } const d = wrap180(ACT.ang - trunkAng(f)); turnBy(f, clamp(d * 5 * DT, -ACT.rate * DT, ACT.rate * DT)); }
    else if (ACT.spin) { stillSpin(f, 1); turnBy(f, ACT.spin * DT); } }
  function actOff() { ACT.to = null; ACT.k = 0; ACT.ang = null; ACT.rate = 0; ACT.spin = 0; ACT.from = POSES.slack; }

  // ---------- the camera ----------
  // Where he is in the picture's own terms (his middle), eased a little so the frame does not shiver with his limbs.
  const EYE = { x: 460, y: 275, set: false };
  function eyeStep(f, k) { const a = f.p[PEL], b = f.p[CHE], x = prjX((a.x + b.x) / 2, f.dep), y = prjY((a.y + b.y) / 2, f.dep);
    if (!EYE.set || k >= 1) { EYE.x = x; EYE.y = y; EYE.set = true; } else { EYE.x += (x - EYE.x) * k; EYE.y += (y - EYE.y) * k; } }
  // A shot: how wide the picture is (w; wn on an upright phone), where it looks from his middle (dx, dy; dxn, dyn upright), and how
  // it gets there: cut (lands at once) or glide at a rate k. With reduced motion every shot is a cut. at: a point to frame instead of him.
  let SHOT = null;
  function shot(name, o) { const cut = o.cut || reduceMotion || !S.camCut; SHOT = Object.assign({ w: 760, dx: 0, dy: 0, k: 2 }, o, { name });
    SHOT.wn = o.wn ?? Math.max(200, Math.min(SHOT.w, SHOT.w * .62)); SHOT.dxn = o.dxn ?? SHOT.dx * .6; SHOT.dyn = o.dyn ?? SHOT.dy;
    if (cut) { S.camCut = { snap: true, k: 0 }; } else { S.camCut = Object.assign({}, S.camCut, { snap: false }); }
    note(name); camStep(); }
  function camStep() { const C = S.camCut, s = SHOT; if (!C || !s) { return; } const ax = s.at ? s.at().x : EYE.x, ay = s.at ? s.at().y : EYE.y, h = s.half ?? 50;
    C.x = ax + s.dx; C.xn = ax + s.dxn; C.w = s.w; C.wn = s.wn; C.x0 = -900; if (!C.snap) { C.k = s.k; }
    const lim = w0 => (s.deep || S.arenaKey !== 'fall' ? 1e9 : 596 - cssH * .395 * w0 / Math.max(1, cssW)), cy = Math.min(ay + s.dy, lim(s.w)), cyn = Math.min(ay + s.dyn, lim(s.wn));
    C.band = { top: cy - h, foot: cy + h }; C.bandN = { top: cyn - h, foot: cyn + h }; C.bandS = null; }

  // ---------- the roof: the shot, the lip, the tip ----------
  // The stage's own script runs as it is, a step at a time, up to the moment he is let go at the edge. From the shot on, the camera is
  // this cut's; the steps back are his own again but end with his heels on the coping, not past it; and then the stage's script is
  // left where it stands (its wait and its black) and the tip is played here.
  function* roofCut(st, orig) { const K = hero(), g = orig.call(st, st); let shotOn = false, mine = null;
    while (true) { const r = g.next(); if (r.done) { return; }
      if (!shotOn && S.slowT > 1.5 && S.arenaKey === 'roof') { shotOn = true; EYE.set = false; eyeStep(K, 1); shot('roof: the shot', { w: 460, wn: 300, dx: -46, dxn: -10, dy: -14, k: 2.6 }); }
      if (shotOn) { eyeStep(K, .2);
        // (the stage sets its own camera after the hit: this cut's again, on the same frame)
        if (S.camCut && S.camCut.snap === undefined) { S.camCut = { snap: false, k: SHOT.k }; }
        if (K.action && K.action !== mine && K.action.end === 2.2) { mine = K.action = stepsBack(K, K.action.t0); shot('roof: the gilt goes out', { w: 420, wn: 280, dx: 30, dxn: 12, dy: -10, k: 1.6 }); }
        camStep();
        if (K.knockUntil > S.t + 50) { break; } }
      yield; }
    yield* tip(K); }
  // back to the edge a step at a time, a hand at the wound: the last step leaves his heels on the coping and him leaning out over it
  function stepsBack(K, t0) { const a = K.arm, x0 = K.station, lip = ROOF_EDGE - 22;
    return { t0, end: 2.2, body: [{ t: 0, v: () => ({ ...easyBody(K), px: x0, lean: -.2, crouch: .86 }) }, { t: .6, v: () => ({ ...easyBody(K), px: lerp(x0, lip, .34), lean: -.04, crouch: .8 }), e: eOut },
      { t: 1.35, v: () => ({ ...easyBody(K), px: lerp(x0, lip, .74), lean: -.24, crouch: .83 }), e: sstep }, { t: 2.2, v: () => ({ ...easyBody(K), px: lip, lean: -.34, crouch: .9 }), e: sstep }],
      arm: [{ t: 0, v: K.curArm }, { t: .4, v: { hand: { sh: [.1 * a, .1 * a] }, wAng: 1.2, off: { sh: [.05 * a, .08 * a] }, tilt: .3 }, e: eOut },
        { t: 2.2, v: { hand: { sh: [.06 * a, .14 * a] }, wAng: 1.3, off: { sh: [.3 * a, -.02 * a] }, tilt: .2 } }] }; }
  function* tip(K) { const fa = 1, p = K.p, B = ACT.B = bonesOf(K); actOff();
    // nothing holds him to his mark any more. The tip is played, not fallen: the heel nearer the edge finds the lip, and he goes back
    // over it stiff as a board, slowly at first, his arms coming up in front of him; then he is let go with the turn he has
    K.station = ROOF_EDGE + 200; K.offstage = true; K.motor = 0; K.knockUntil = S.t + 99; K.action = null;
    const heel = p[FTF].x > p[FTB].x ? FTF : FTB, from = p.map(q => ({ x: q.x, y: q.y })), a0 = clamp(trunkAng(K), 8, 40), a1 = 97, T = .5, lipX = ROOF_EDGE - 1, lipY = p[heel].y;
    const at = (u, blend) => { const ang = lerp(a0, a1, Math.pow(u, 2.3)), ps = mixPose(POSES.stand, POSES.tip, sstep(clamp(u * 1.6, 0, 1))), R = fk(B, ps, Math.sin(ang * DEG), -Math.cos(ang * DEG), K.facing);
      // (his hips are where they must be for that heel to be on the lip, sliding out a little as he goes)
      const hx = lerp(from[heel].x, lipX, sstep(clamp(u * 4, 0, 1))) + 26 * u * u, hy = lipY, x = hx - R[heel][0], y = hy - R[heel][1];
      poseSet(K, B, ps, x, y, ang, true);
      if (blend < 1) { for (let i = 0; i < p.length; i++) { const q = p[i]; q.x = lerp(from[i].x, q.x, blend); q.y = lerp(from[i].y, q.y, blend); q.px = q.x; q.py = q.y; } } };
    shot('roof: the edge', { w: 400, wn: 270, at: () => ({ x: prjX(ROOF_EDGE + 10, K.dep), y: prjY(GB - 64, K.dep) }), k: 2.4 });
    S.slowT = Math.max(S.slowT, .2);
    const t0 = S.t; let last = null;
    yield* until(() => { const u = clamp((S.t - t0) / T, 0, 1); last = p.map(q => ({ x: q.x, y: q.y })); at(u, sstep(clamp((S.t - t0) / .14, 0, 1))); camStep();
      if (S.t > t0 + .06) { S.slowT = Math.max(S.slowT, .3); } return u >= 1; });
    // let go: he keeps the turn and the fall he had
    for (let i = 0; i < p.length; i++) { p[i].px = last[i].x - 40 * DT; p[i].py = last[i].y; }
    ACT.from = POSES.tip; act({ pose: 'reach', over: .5, k: .16 });
    const t1 = S.t; yield* until(() => { actStep(K); camStep(); S.slowT = Math.max(S.slowT, .3); return p[PEL].y > GB + 36 || S.t > t1 + .5; });
    S.slowT = 0; }

  // ---------- the tower: his thoughts ----------
  // (the game's own tables of how deep the desert is and how much it slows the fall at each thought's end, and this cut's: here the
  // desert beside the tower is only what is left over between the memories)
  let TAB0 = null;
  const DREAM1 = [0, .5, .62, .3, .2, .16, .13, .1, .04, 0, .5, 0], SLOW1 = [0, .5, .62, .5, .42, .4, .38, .34, .5, .5, .9, 0];
  function tables(on) { if (!TAB0) { TAB0 = { d: FALL_DREAM.slice(), s: FALL_SLOW.slice() }; } const d = on ? DREAM1 : TAB0.d, s = on ? SLOW1 : TAB0.s;
    for (let i = 0; i < d.length; i++) { FALL_DREAM[i] = d[i]; FALL_SLOW[i] = s[i]; } }
  function fallSetup(st, orig) { orig.call(st, st); const K = hero(); ACT.B = bonesOf(K); actOff(); visionOff(); FX.beads = []; FX.n = 0; FX.t0 = S.t;
    // he comes into this picture as he left the last: on his back just under the coping, his head toward the open air, still slowed
    K.facing = -1; const P0 = K.p[PEL], cx = P0.x, cy = P0.y;
    for (const q of K.p) { const x = q.x - cx, y = q.y - cy; q.x = cx - y; q.y = cy + x; q.px = q.x; q.py = q.y; }
    const d0 = FALL_Y - 36 - K.p[PEL].y; for (const q of K.p) { q.y += d0; q.py += d0; q.px = q.x - .1 * DT * 60; }
    for (const q of K.scarf || []) { q.x = K.p[CHE].x; q.y = K.p[CHE].y; q.px = q.x; q.py = q.y; }
    S.fade = 0; EYE.set = false; eyeStep(K, 1);
    // (the first picture of this stage is this cut's: the camera, the bars and the slowing are set before anything is drawn)
    letter(1); S.slowT = 1.25; ACT.from = POSES.tip; act({ pose: 'reach', over: .6, k: .22, ang: 96, rate: 160 });
    shot('under the edge', { w: 640, wn: 420, dy: -41, dyn: -70, half: 100, cut: true }); }
  function* fallCutIntro(st) { const K = hero(), P = S.pit;
    letter(1); S.fade = 0;
    // the face goes up past him; the air holds him in the picture (as the stage's own script has it), and the actor has his limbs
    const speed = () => (V.kind && V.kind !== 'dune' ? 220 : 1800 * (1 - fallSlow()));
    const hold = (function* () { while (!P.on) { const tg = speed(); S.scrollYV += clamp(tg - S.scrollYV, -520 * DT, 800 * DT); S.scrollY += S.scrollYV * DT;
      const P0 = K.p[PEL], n = K.p.length; let mx = 0, my = 0; for (const q of K.p) { mx += q.x - q.px; my += q.y - q.py; } mx /= n; my /= n;
      const tx = clamp((440 - P0.x) * .7, -50, 50) * DT, ty = clamp((FALL_Y - P0.y) * .9, -70, 70) * DT;
      for (const q of K.p) { q.px += (mx - tx) * .1; q.py += (my - ty) * .1 + G * DT * DT; }
      actStep(K); fxStep(K); eyeStep(K, .12); camStep(); yield; } })();
    const lines = (function* () {
      // the drop: the wind comes in and the picture pulls wide
      yield* until(() => S.slowT <= 0, 3); shot('the drop', { w: 900, wn: 620, dy: 20, k: 1.5 }); act({ pose: 'slack', over: .9, k: .12, ang: null, spin: 34 });
      yield* wait(1.5);
      for (let i = 0; i < FALL_LINES.length; i++) { const [txt, d] = FALL_LINES[i]; S.thought = { text: txt, t0: S.t, dur: d }; P.dream = { k: i, t0: S.t };
        yield* thought(i, d, K, P); }
      P.dream = { k: FALL_LINES.length, t0: S.t }; S.thought = null; yield* wait(.35); pitOpen(K); })();
    yield* all(hold, lines, warm());
    yield* pitCut(K, P); }
  // what the picture and his body do through each thought (i: which, d: how long it is up)
  function* thought(i, d, K, P) {
    if (i === 0) { shot('his dead hand', { w: 360, wn: 230, dy: -6, cut: true }); act({ pose: 'hand', over: .7, k: .2, ang: 62, rate: 90, spin: 0 }); yield* wait(d); }
    else if (i === 1) { // in through his eye: the picture closes on it, a light comes up in it and takes everything; then the inking, then the wire
      const head = () => ({ x: prjX(K.p[HEAD].x, K.dep), y: prjY(K.p[HEAD].y, K.dep) });
      shot('into his eye', { w: 300, wn: 200, at: head, dy: 6, k: 3.4 }); S.hooks.sound('eye_light', 1);
      const t0 = S.t; yield* until(() => { const u = (S.t - t0) / .62; V.eye = clamp(u, 0, 1); V.white = reduceMotion ? 0 : clamp((u - .5) / .5, 0, 1); return u >= 1; });
      V.eye = 0; vision('ink'); act({ pose: 'slack', over: 1.5, k: .1, ang: null, spin: 14 });
      const t1 = S.t; yield* until(() => { V.white = reduceMotion ? 0 : 1 - clamp((S.t - t1) / .5, 0, 1); return S.t > t1 + 2.25; });
      vision('wire'); const t2 = S.t, left = d - (S.t - t0); yield* until(() => { V.white = reduceMotion ? 0 : .5 * (1 - clamp((S.t - t2) / .3, 0, 1)); return S.t > t2 + left; }); }
    else if (i === 2) { vision('well'); const t2 = S.t; yield* until(() => { V.white = reduceMotion ? 0 : .5 * (1 - clamp((S.t - t2) / .3, 0, 1)); return S.t > t2 + d; }); }
    else if (i === 3) { // the Sprawl takes it: the memory is torn away upward and he is back at the tower, the house's mark going by
      strip(1.0, 1); V.kind = null; V.white = 0;
      shot('the house’s mark', { w: 800, wn: 560, dx: -40, dy: 10, cut: true }); act({ pose: 'curl', over: 1.2, k: .14, ang: null, spin: -22 }); yield* wait(d); }
    else if (i === 4) { shot('thirty years', { w: 520, wn: 340, dy: 0, cut: true }); act({ pose: 'slack', over: 1.4, k: .1, spin: 16 }); yield* wait(d); }
    else if (i === 5) { shot('every door', { w: 600, wn: 380, dx: -60, dy: 10, cut: true }); yield* wait(d); }
    else if (i === 6) { shot('every name', { w: 440, wn: 290, dx: 20, dy: -6, cut: true }); act({ pose: 'curl', over: 1.6, k: .12, spin: 10 }); yield* wait(d); }
    else if (i === 7) { shot('the height', { w: 900, wn: 620, dx: -25, dy: -62, dyn: -150, half: 60, cut: true }); act({ pose: 'slack', over: 1.2, k: .1, ang: 100, rate: 60, spin: 0 }); V.heli = { t0: S.t, dur: d }; yield* wait(d); V.heli = null; }
    else if (i === 8) { shot('the turn', { w: 300, wn: 210, at: () => ({ x: prjX(K.p[HEAD].x, K.dep), y: prjY(K.p[HEAD].y, K.dep) }), dy: 14, cut: true }); act({ pose: 'set', over: .5, k: .26, ang: 100, rate: 40 }); yield* wait(d); }
    else if (i === 9) { SHOT.k = .9; SHOT.w = 360; SHOT.wn = 240; yield* wait(d); }
    else if (i === 10) { // he can wait: wide and still, and the air he lies on becomes the sand of the wire
      shot('the wire', { w: 860, wn: 560, dx: -4, dxn: 40, dy: 6, cut: true }); act({ pose: 'lie', over: .7, k: .22, ang: 90, rate: 200 });
      vision('dune'); V.alpha = 0; const t0 = S.t; yield* until(() => { V.alpha = sstep(clamp((S.t - t0 - .25) / .9, 0, 1)); return S.t > t0 + d; }); }
    else { // the vow: three cuts in, one on each "For", and the speed back in three jolts
      const marks = [0, .2, .46, .7].map(u => u * d), W = [[620, 400], [460, 300], [320, 220]];
      act({ pose: 'set', over: .4, k: .24, ang: 96, rate: 120 }); SHOT.k = .8; SHOT.w = 760; SHOT.wn = 500;
      for (let j = 0; j < 3; j++) { yield* wait(marks[j + 1] - marks[j]);
        // (a gust of the fall takes a part of the desert with it each time)
        if (V.kind === 'dune') { strip(1.15, 1); V.kind = null; }
        shot('the vow ' + (j + 1), { w: W[j][0], wn: W[j][1], dy: 4, cut: true });
        act({ pose: j === 2 ? 'dive' : 'set', over: .5, k: .26, ang: 96 + 28 * (j + 1), rate: 220 }); S.scrollYV = Math.min(1800, S.scrollYV + 380); }
      yield* wait(d - marks[3]); } }

  // ---------- the Pit ----------
  // From here the stage's own Pit has him (pitStep, as ever): what he hits and what it does to him are the game's. The cut frames it
  // and paces it: its mouth slowed and wide, the first blow punched in on, the reach for the spike slowed, the spike held close, the
  // camera left with the arm as he drops, then waiting for him at the roof of the Sump. The ending is the stage's own, beat for beat.
  const D2 = (x, y) => ({ x: prjX(x, PIT_DEP), y: prjY(y, PIT_DEP) });
  const armAt = () => { const P = S.pit, Q = P.arm.pts, w = pitToW((Q[0].x + Q[1].x + Q[2].x) / 3, (Q[0].y + Q[1].y + Q[2].y) / 3); return D2(w.x, w.y); };
  function* pitCut(K, P) { V.kind = null; V.strip = null; freePlates(); const chest = () => D2((K.p[PEL].x + K.p[CHE].x) / 2, (K.p[PEL].y + K.p[CHE].y) / 2), head = () => D2(K.p[HEAD].x, K.p[HEAD].y);
    const tipS = () => { const w = pitSpikeW(.8); return D2(w.x, w.y); }, mid = (a, b2, u) => ({ x: lerp(a.x, b2.x, u), y: lerp(a.y, b2.y, u) });
    const keep = function* (sec) { const t = S.t + sec; while (S.t < t) { eyeStep(K, .2); camStep(); yield; } };
    let mode = 'mouth', tM = S.t, neon = false; PC.hold = null;
    act({ pose: 'shield', over: .5, k: .2, ang: 170, rate: 120 });
    shot('the mouth of the Pit', { w: 900, wn: 460, dy: 78, dyn: 90, half: 60, k: 2.6 });
    yield* until(() => {
      if (mode === 'mouth') { actStep(K); if (P.py > -430 && P.py < 30 && P.woke == null) { S.slowT = Math.max(S.slowT, .1); }
        if (P.woke != null || P.py > 420) { mode = 'girder'; tM = S.t; actOff(); shot('the first blow', { w: 470, wn: 300, k: 12 }); } }
      else if (mode === 'girder' && S.t > tM + .42) { mode = 'pit'; shot('the Pit', { w: 620, wn: 400, dy: 18, dyn: 30, k: 1.5 }); }
      // the sign: its colour over everything for a moment
      if (!neon) { const it = P.items.find(q => q.key === 'neon'); if (it && it.dead) { neon = true; V.wash = { t0: S.t, dur: .55, col: '255,74,214' }; } }
      // the reach: slowed, the spike in the picture with him before he is on it
      if (mode === 'pit' && P.stage === 'fall' && P.py > PIT.spike.b[1] - 300 && P.py < PIT.spike.a[1] + 40) { mode = 'reach'; shot('the reach', { w: 540, wn: 360, at: () => mid(chest(), tipS(), .5), k: 5 }); }
      if (mode === 'reach' && !P.pin) { S.slowT = Math.max(S.slowT, .1); }
      if (P.stage === 'pinned' && mode !== 'pinned') { mode = 'pinned'; shot('on the spike', { w: 330, wn: 225, at: () => mid(chest(), tipS(), .46), dy: -4, cut: true }); }
      if (P.stage === 'drop' && (mode === 'pinned' || mode === 'pit' || mode === 'reach')) { tM = S.t; if (P.arm) { mode = 'arm'; PC.hold = 'arm'; shot('the arm stays', { w: 330, wn: 225, at: armAt, k: 2.4 }); } else { mode = 'follow'; shot('the drop', { w: 760, wn: 520, k: 2 }); } }
      // (the world is held where it is while the picture stays with the arm, and he falls out of it: afterStep; then it is cut down to
      // the roof of the Sump, at its mark, and held there for him to come into)
      else if (mode === 'arm' && S.t > tM + .44) { mode = 'sump'; PC.hold = 'sump'; const lim = FALL_YREF + P.base + PIT.roof.y - S.scrollY - PIT.mark; pitShift(lim); P.cv = 0; PC.last = S.scrollY;
        shot('the roof of the Sump', { w: 760, wn: 520, deep: true, at: () => { const w = pitToW(PIT.hay.x, PIT.roof.y - 104); return D2(w.x, w.y); }, cut: true }); }
      eyeStep(K, .2); camStep(); return P.stage === 'landed'; }, 45);
    if (P.stage !== 'landed') { pitLand(K); } PC.hold = null;
    // the hay: a slow push toward his face while the straw settles
    shot('the hay', { w: 700, wn: 480, deep: true, at: () => mid(chest(), head(), .5), dy: -12, k: 1.4 }); yield* keep(.9); SHOT.k = .42; SHOT.w = 360; SHOT.wn = 240; yield* keep(1.5);
    // still alive: a light comes back into his eye (the stage's own; the spark that shows it is this cut's)
    S.hooks.sound('eye_light', 1); V.spark = { t0: S.t }; const t1 = S.t; yield* until(() => { K.eyeLit = FALL_EYE * sstep(clamp((S.t - t1) / 1.4, 0, 1)); eyeStep(K, .2); camStep(); return S.t > t1 + 1.4; }, 2);
    yield* keep(1.1);
    if (P.arm) { pitLookUp(P); shot('the arm', { w: 380, wn: 250, at: armAt, dy: 8, k: 1.3 }); yield* until(() => { camStep(); return S.t >= P.look.t0 + P.look.dur; }, PIT.lookDur + 1); yield* keep(1.6);
      // the last light: the dark closes on the arm, and its lines are the last thing seen
      V.last = { t0: S.t, dur: 2.6 }; yield* keep(2.6); S.fade = 1; V.last = null; }
    else { yield* keep(.5); const t0 = S.t; while (S.t < t0 + 1.8) { S.fade = (S.t - t0) / 1.8; camStep(); yield; } S.fade = 1; }
    V.spark = null; S.story.ended = 'fall'; yield* wait(.8); }

  // After the Pit's own step each step (this is registered after it): the Pit's camera is the world moved past the picture, so to keep
  // the picture where the cut wants it the move is taken back (hold 'arm': all of it; 'sump': only what would take it back up to him).
  const PC = { hold: null, last: 0 };
  function afterStep() { const P = S.pit; if (!state.run || S.arenaKey !== 'fall' || !P || !P.on) { PC.last = S.scrollY || 0; return; } const d = S.scrollY - PC.last;
    if (PC.hold === 'arm' && d) { pitShift(-d); P.cv = 0; S.scrollYV = 0; } else if (PC.hold === 'sump') { if (d < 0) { pitShift(-d); P.cv = 0; } S.scrollYV = 0; }
    PC.last = S.scrollY; if (S.cut && SHOT && S.camCut) { camStep(); } }

  // ---------- what else is seen: the light leaving him, the blood left behind, the cyan of the setbacks on him, the eye's spark ----------
  const FX = { beads: [], n: 0 };
  // each step while he falls down the tower (run from the hold): motes of the gilt's light and beads of blood left above him
  function fxStep(K) { if (S.arenaKey !== 'fall' || !S.pit || S.pit.on) { return; } const age = S.t - (FX.t0 || 0); FX.n++;
    if (age < 5.5 && FX.n % (age < 2 ? 5 : 11) === 0 && !(V.kind && V.kind !== 'dune')) { const q = K.p[[CHE, ELF, HAF, PEL, HEAD][FX.n % 5]];
      addMotes(q.x, q.y, K.dep, 1, { sx: 10, sy: 10, vx: 0, vy: -(40 + (S.scrollYV || 0) * .16), spread: 26, g: -30, life: 1.0, cyan: .65, r: 1.1 }); }
    if (S.gore !== 'off' && age < 7 && FX.n % 16 === 0 && FX.beads.length < 26) { const c = K.p[CHE]; FX.beads.push({ x: c.x + (hsh(FX.n, 3) - .5) * 8, y: c.y, vx: (hsh(FX.n, 5) - .5) * 26, vy: -(50 + hsh(FX.n, 7) * 60 + (S.scrollYV || 0) * .1), r: 1.2 + hsh(FX.n, 9) * 1.4, age: 0, life: 1.1 }); }
    for (const b of FX.beads) { b.age += DT; b.x += b.vx * DT; b.y += b.vy * DT; b.vy -= 40 * DT; } if (FX.beads.length) { FX.beads = FX.beads.filter(b => b.age < b.life); } }
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
  const V = { kind: null, t0: 0, alpha: 1, white: 0, strip: null, key: '', P: null, tFix: null };
  const vt = () => (V.tFix != null ? V.tFix : S.t - V.t0);
  const hsh = (i, k) => { let h = (Math.imul(i | 0, 73856093) ^ Math.imul(k | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return (h >>> 8) / 16777216; };
  // the picture between the bars: its size in the canvas's own pixels, u a unit that keeps things the same size on any screen
  function box() { const w = cv.width, h = cv.height, bar = S.letter ? Math.round(h * .105) : 0, vh = h - 2 * bar; return { w, h, y0: bar, vh, tall: vh > w * 1.05, u: Math.min(w, vh * 1.9) / 1000 }; }
  function skyAndSun(g, B, hz, sx, sy, sr) { const { w, h } = B;
    g.fillStyle = lin(g, 0, B.y0, 0, hz, [[0, '#2b65a5'], [.42, '#6ea7d5'], [.78, '#cadedb'], [1, '#fbecca']]); g.fillRect(0, 0, w, hz + 2);
    g.fillStyle = rad(g, sx, sy, 0, sr * 9, [[0, 'rgba(255,253,244,1)'], [.1, 'rgba(255,247,220,.9)'], [.24, 'rgba(255,232,170,.45)'], [.55, 'rgba(255,214,140,.14)'], [1, 'rgba(255,205,130,0)']]); g.fillRect(0, 0, w, h);
    g.fillStyle = '#fffef6'; g.beginPath(); g.arc(sx, sy, sr, 0, TAU); g.fill(); }
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
    g.save(); g.clip(body); g.strokeStyle = 'rgba(120,70,30,.13)'; g.lineWidth = Math.max(1, lw * .7); for (let i = 1; i < 8; i++) { const t = i / 8; g.beginPath(); g.moveTo(px + hw * (.1 + t * .16), py + hh * (.2 + t * .5)); g.bezierCurveTo(px + hw * .5, py + hh * (.3 + t * .7), px + hw * 1.0, by + (foot - by) * t * .5, R, by + hh * .2 + (foot - by) * t * .8); g.stroke(); } g.restore(); }
  const DUNE = [{ l: ['#ecc88c', '#dcae6a'], s: ['#b98a56', '#c69860'], c: 'rgba(255,246,220,.85)' }, { l: ['#e4b468', '#cf9648'], s: ['#96663a', '#a97642'], c: 'rgba(255,242,208,.9)' }, { l: ['#dba24e', '#b97c36'], s: ['#74482a', '#8a5a30'], c: 'rgba(255,238,196,.95)' }];
  function land(g, B, hz, seed, o) { const { w, h, u } = B, foot = B.y0 + B.vh, D = foot - hz; o = o || {};
    g.fillStyle = lin(g, 0, hz, 0, foot, [[0, '#f5e6c4'], [1, '#d9a85e']]); g.fillRect(0, hz - 1, w, h - hz + 1);
    const ys = o.ys || [.03, .075, .14, .23, .36, .54, .78], n = ys.length;
    for (let i = 0; i < n; i++) { ridge(g, B, hz + D * ys[i], D * (.012 + .028 * i) * (o.amp || 1), seed * 13 + i, RIDGE[Math.min(RIDGE.length - 1, Math.round(i * (RIDGE.length - 1) / (n - 1)))], foot, Math.max(1, (.7 + i * .25) * u)); 
      for (const d of (o.dunes || [])) { if (d.after === i) { dune(g, w * d.x, hz + D * d.y, w * d.w * (B.tall ? 1.5 : 1), Math.min(D * d.h, w * d.w * (B.tall ? .8 : 9)), foot, DUNE[d.tone ?? 1], Math.max(1.5, (d.lw || 2) * u)); } } }
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
    g.beginPath(); g.moveTo(x + w0 * .9, y); g.lineTo(tx + w1 * .9, y - hgt * 1.01); g.strokeStyle = 'rgba(255,214,150,.8)'; g.lineWidth = Math.max(1, w0 * .34); g.stroke();
    return [.93, .72, .5].map(f => ({ x: lerp(x, tx, f), y: y - hgt * f })); }
  function strands(g, A, Bq, lw) { g.strokeStyle = 'rgba(46,28,18,.92)'; g.lineWidth = lw; g.lineCap = 'round';
    for (let i = 0; i < 3; i++) { const a = A[i], b = Bq[i], sag = Math.hypot(b.x - a.x, b.y - a.y) * .05; g.beginPath(); g.moveTo(a.x, a.y); g.quadraticCurveTo((a.x + b.x) / 2, (a.y + b.y) / 2 + sag, b.x, b.y); g.stroke(); } }
  // the wire running out to the horizon: posts from near (x0, y0, height h0) to far, and what hangs on it
  function wire(g, B, near, far, n, seed) { const r = mulberry32(seed), P = []; const c = .55, F = 1 - 1 / (1 + n * c);
    for (let k = 0; k <= n; k++) { const s = (1 - 1 / (1 + k * c)) / F; P.push({ x: lerp(near.x, far.x, s), y: lerp(near.y, far.y, s), h: lerp(near.h, far.h, s), lean: (r() - .5) * .07 }); }
    let prev = null; const tops = [];
    for (let k = n; k >= 0; k--) { const q = P[k], T = post(g, q.x, q.y, q.h, q.lean); tops[k] = T; }
    for (let k = n; k > 0; k--) { strands(g, tops[k], tops[k - 1], Math.max(1, P[k - 1].h * .011));
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
    g.strokeStyle = 'rgba(60,34,20,.35)'; g.lineWidth = Math.max(1, hgt * .012); g.beginPath(); g.moveTo(X(-.06), Y(-.88)); g.quadraticCurveTo(X(-.1), Y(-.8), X(-.09), Y(-.71)); g.stroke();
    const jar = (jx, jy, s) => { g.fillStyle = '#9a5a34'; g.beginPath(); g.ellipse(jx, jy, s * .8, s, 0, 0, TAU); g.fill(); g.fillRect(jx - s * .3, jy - s * 1.35, s * .6, s * .5);
      g.fillStyle = 'rgba(255,226,170,.75)'; g.beginPath(); g.ellipse(jx + s * .3, jy - s * .2, s * .16, s * .5, .2, 0, TAU); g.fill(); };
    if (o.jar === 'head') { jar(X(.0), Y(-1.06), hgt * .075); g.strokeStyle = col; g.lineWidth = hgt * .045; g.lineCap = 'round'; g.beginPath(); g.moveTo(X(.08), Y(-.76)); g.lineTo(X(.07), Y(-1.02)); g.stroke(); }
    else if (o.jar === 'hip') { jar(X(.17), Y(-.4), hgt * .085); g.strokeStyle = col; g.lineWidth = hgt * .045; g.lineCap = 'round'; g.beginPath(); g.moveTo(X(.07), Y(-.74)); g.lineTo(X(.15), Y(-.48)); g.stroke(); }
    else if (o.jar === 'cup') { g.strokeStyle = col; g.lineWidth = hgt * .045; g.lineCap = 'round'; g.beginPath(); g.moveTo(X(.07), Y(-.74)); g.lineTo(X(.2), Y(-.62)); g.stroke(); }
    // the sun along the edge of them
    g.save(); g.clip(body); g.strokeStyle = 'rgba(255,226,170,.9)'; g.lineWidth = Math.max(1.5, hgt * .028); g.beginPath(); const sx = d < 0 ? X(-.105) : X(.1), ex = d < 0 ? X(-.19) : X(.2);
    g.moveTo(sx, Y(-.8)); g.quadraticCurveTo(d < 0 ? X(-.16) : X(.17), Y(-.43), ex, Y(0)); g.stroke(); g.restore(); }
  // the well: its ring of stone, the dark of its mouth, the frame over it, the rope and the pail
  function well(g, x, y, s) { const rx = 62 * s, ry = 17 * s, hh = 38 * s;
    g.fillStyle = 'rgba(70,40,22,.28)'; g.beginPath(); g.ellipse(x - rx * .9, y + ry * .3, rx * 1.5, ry * 1.1, 0, 0, TAU); g.fill();
    g.fillStyle = 'rgba(255,238,200,.55)'; g.beginPath(); g.ellipse(x + rx * .3, y + ry * .55, rx * 1.5, ry * .9, 0, 0, TAU); g.fill();
    const wall = new Path2D(); wall.moveTo(x - rx, y - hh); wall.lineTo(x - rx, y); wall.ellipse(x, y, rx, ry, 0, Math.PI, 0, true); wall.lineTo(x + rx, y - hh); wall.closePath();
    g.fillStyle = lin(g, x - rx, 0, x + rx, 0, [[0, '#6a4a32'], [.45, '#a8825a'], [.8, '#dcbb88'], [1, '#e9cd9c']]); g.fill(wall);
    g.save(); g.clip(wall); g.strokeStyle = 'rgba(40,24,14,.42)'; g.lineWidth = Math.max(1, 1.2 * s);
    for (let i = 1; i < 3; i++) { g.beginPath(); g.ellipse(x, y - hh * i / 3, rx, ry, 0, 0, Math.PI); g.stroke(); }
    for (let i = 0; i < 3; i++) { for (let j = 0; j < 9; j++) { const a = (j + (i % 2) * .5) / 9 * Math.PI, bx = x - Math.cos(a) * rx, by0 = y - hh * (i + 1) / 3 + Math.sin(a) * ry; g.beginPath(); g.moveTo(bx, by0); g.lineTo(bx, by0 + hh / 3); g.stroke(); } }
    g.restore();
    g.fillStyle = '#ecd2a2'; g.beginPath(); g.ellipse(x, y - hh, rx, ry, 0, 0, TAU); g.fill();
    g.fillStyle = '#140c07'; g.beginPath(); g.ellipse(x, y - hh, rx * .76, ry * .7, 0, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(110,200,214,.55)'; g.lineWidth = Math.max(1, 1.6 * s); g.beginPath(); g.ellipse(x, y - hh + ry * .1, rx * .5, ry * .34, 0, .3, 2.2); g.stroke();
    // the frame, the wheel, the rope, the pail with the light in its water
    g.strokeStyle = '#3a2416'; g.lineCap = 'round'; g.lineWidth = 7 * s; g.beginPath(); g.moveTo(x - rx * .86, y - hh * .6); g.lineTo(x - rx * .7, y - hh - 104 * s); g.moveTo(x + rx * .86, y - hh * .6); g.lineTo(x + rx * .7, y - hh - 104 * s); g.stroke();
    g.lineWidth = 8 * s; g.beginPath(); g.moveTo(x - rx * .82, y - hh - 104 * s); g.lineTo(x + rx * .82, y - hh - 106 * s); g.stroke();
    g.strokeStyle = 'rgba(255,214,150,.8)'; g.lineWidth = Math.max(1, 1.6 * s); g.beginPath(); g.moveTo(x + rx * .9, y - hh * .6); g.lineTo(x + rx * .74, y - hh - 104 * s); g.stroke();
    g.fillStyle = '#4a2e1c'; g.beginPath(); g.arc(x, y - hh - 96 * s, 9 * s, 0, TAU); g.fill();
    g.strokeStyle = '#cdb68c'; g.lineWidth = Math.max(1, 1.5 * s); g.beginPath(); g.moveTo(x, y - hh - 88 * s); g.lineTo(x, y - hh - 30 * s); g.stroke();
    const py = y - hh - 30 * s; g.fillStyle = '#5a3a22'; g.beginPath(); g.moveTo(x - 11 * s, py); g.lineTo(x + 11 * s, py); g.lineTo(x + 8 * s, py + 17 * s); g.lineTo(x - 8 * s, py + 17 * s); g.closePath(); g.fill();
    g.fillStyle = '#bff3ff'; g.beginPath(); g.ellipse(x, py + 1 * s, 10 * s, 2.6 * s, 0, 0, TAU); g.fill();
    return { pail: { x, y: py }, top: y - hh }; }
  // the plates of this screen, made when first wanted (again if the screen changes)
  function plates() { const B = box(), key = B.w + 'x' + B.h + (S.letter ? 'L' : ''); if (V.P && V.key === key) { return V.P; } V.key = key; const P = V.P = { B }, { w, h, u, y0, vh, tall } = B;
    // (each plate is painted when it is first asked for: warm() asks for them one at a time before they are wanted)
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
  // everything the memories are made of, asked for a piece at a time over a couple of seconds, before the first of them is wanted
  function* warm() { try { const P = plates(), F = figs(P), jobs = [() => P.ink.cv, () => F.inkDark, () => F.inkLit, () => P.wire.cv, () => P.wire.fg, () => F.wire, () => P.well.cv, () => F.well, () => (P.glow, F.glow)];
      for (const j of jobs) { j(); yield* wait(.33); } } catch (e) { state.err = String(e && e.message || e); } }
  // a piece set down with one of his joints at (x, y) on the screen; back: where another joint then is
  function putFig(c, Fg, joint, x, y) { const F = Fg.F, fm = (F.p[FTF].x + F.p[FTB].x) / 2, dx = x - (Fg.ox + (F.p[joint].x - fm) * Fg.k), dy = y - (Fg.oy + (F.p[joint].y - F.foot) * Fg.k);
    return { dx, dy, at: i => ({ x: x + (F.p[i].x - F.p[joint].x) * Fg.k, y: y + (F.p[i].y - F.p[joint].y) * Fg.k }) }; }
  // the Ranger's scarf out on the wind from his neck (s: the screen's pixels to one of his units; dir: the way the wind takes it)
  function scarfLive(c, x, y, s, t, dir) { const N = 10, L = 5 * s, top = [], bot = [];
    for (let i = 0; i <= N; i++) { const a = i / N, px = x + dir * i * L, py = y + a * a * 8 * s + Math.sin(t * 7.5 - i * .85) * (.8 + 5.2 * a) * s, wd = (3.4 - 2.3 * a) * s; top.push([px, py - wd]); bot.push([px, py + wd]); }
    c.beginPath(); c.moveTo(top[0][0], top[0][1]); for (const q of top) { c.lineTo(q[0], q[1]); } for (let i = N; i >= 0; i--) { c.lineTo(bot[i][0], bot[i][1]); } c.closePath(); c.fillStyle = '#a4532e'; c.fill();
    c.beginPath(); c.moveTo(bot[0][0], bot[0][1]); for (const q of bot) { c.lineTo(q[0], q[1]); } c.strokeStyle = '#6a3018'; c.lineWidth = Math.max(1, 1.3 * s); c.stroke();
    c.beginPath(); c.moveTo(top[0][0], top[0][1]); for (const q of top) { c.lineTo(q[0], q[1]); } c.strokeStyle = 'rgba(255,214,160,.7)'; c.lineWidth = Math.max(1, .7 * s); c.stroke();
    // (the knot of it at his throat)
    c.fillStyle = '#8e4526'; c.beginPath(); c.ellipse(x, y, 3.6 * s, 3 * s, 0, 0, TAU); c.fill(); }
  // sand going by on the wind, in one batch (big: the nearer, faster, longer streaks)
  function sandWind(c, B, t, ya, yb, n, a, big) { if (reduceMotion) { return; } const { w, u } = B, len = (big ? 110 : 50) * u, span = w + len * 2; c.save(); c.strokeStyle = 'rgba(255,243,214,' + a + ')'; c.lineWidth = Math.max(1, (big ? 2.2 : 1.2) * u); c.lineCap = 'round'; c.beginPath();
    for (let i = 0; i < n; i++) { const sp = (.3 + hsh(i, 3) * .5) * w * (big ? 1.7 : 1), x = w + len - ((hsh(i, 1) * span + t * sp) % span), y = lerp(ya, yb, hsh(i, 2)) + Math.sin(t * 2 + i) * 4 * u, l = len * (.4 + hsh(i, 4));
      c.moveTo(x, y); c.lineTo(x + l, y - l * .05); } c.stroke(); c.restore(); }
  // the Ranger who inks him: a hand out of a rust sleeve, the needle of light in it, its point at (tx, ty)
  function inker(c, tx, ty, s, t) { const an = -1.16, L = 25 * s, hx = tx + Math.cos(an) * L, hy = ty + Math.sin(an) * L, sa = -.62, dx = Math.cos(sa), dy = Math.sin(sa), nx = -dy, ny = dx;
    c.lineCap = 'round'; c.strokeStyle = '#24140c'; c.lineWidth = 1.5 * s; c.beginPath(); c.moveTo(tx, ty); c.lineTo(hx + Math.cos(an) * 7 * s, hy + Math.sin(an) * 7 * s); c.stroke();
    c.strokeStyle = '#e0aa50'; c.lineWidth = .8 * s; c.beginPath(); c.moveTo(lerp(tx, hx, .5), lerp(ty, hy, .5)); c.lineTo(lerp(tx, hx, .66), lerp(ty, hy, .66)); c.stroke();
    // the sleeve, wide at the cuff, going off to the corner
    const cx0 = hx + dx * 7 * s, cy0 = hy + dy * 7 * s, far = 420 * s; c.beginPath(); c.moveTo(cx0 + nx * 7.5 * s, cy0 + ny * 7.5 * s); c.lineTo(cx0 + dx * far + nx * 34 * s, cy0 + dy * far + ny * 34 * s); c.lineTo(cx0 + dx * far - nx * 30 * s, cy0 + dy * far - ny * 30 * s); c.lineTo(cx0 - nx * 7 * s, cy0 - ny * 7 * s); c.closePath();
    c.fillStyle = lin(c, cx0 - nx * 8 * s, cy0 - ny * 8 * s, cx0 + nx * 9 * s, cy0 + ny * 9 * s, [[0, '#b65e34'], [.55, '#8e4324'], [1, '#5c2917']]); c.fill();
    c.strokeStyle = '#e0aa50'; c.lineWidth = 1.5 * s; c.beginPath(); c.moveTo(cx0 + nx * 7.5 * s, cy0 + ny * 7.5 * s); c.lineTo(cx0 - nx * 7 * s, cy0 - ny * 7 * s); c.stroke();
    c.strokeStyle = 'rgba(224,170,80,.7)'; c.lineWidth = .6 * s; c.beginPath(); c.moveTo(cx0 + dx * 3.4 * s + nx * 7.9 * s, cy0 + dy * 3.4 * s + ny * 7.9 * s); c.lineTo(cx0 + dx * 3.4 * s - nx * 7.4 * s, cy0 + dy * 3.4 * s - ny * 7.4 * s); c.stroke();
    // the hand closed on the needle: the back of it, the thumb, the knuckles
    c.fillStyle = '#7c4a2a'; c.beginPath(); c.ellipse(hx + dx * 1.4 * s, hy + dy * 1.4 * s, 6.2 * s, 4.7 * s, sa, 0, TAU); c.fill();
    c.fillStyle = '#935a34'; c.beginPath(); c.ellipse(hx - dx * 2.4 * s + nx * 2.6 * s, hy - dy * 2.4 * s + ny * 2.6 * s, 3.4 * s, 2.3 * s, sa + .9, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(40,20,10,.5)'; c.lineWidth = Math.max(1, .5 * s); c.beginPath(); for (let i = -1; i <= 1; i++) { c.moveTo(hx + dx * (.6 + i * 2.2) * s - nx * 2.6 * s, hy + dy * (.6 + i * 2.2) * s - ny * 2.6 * s); c.lineTo(hx + dx * (1.2 + i * 2.2) * s - nx * 4.4 * s, hy + dy * (1.2 + i * 2.2) * s - ny * 4.4 * s); } c.stroke();
    c.strokeStyle = 'rgba(255,214,160,.6)'; c.lineWidth = Math.max(1, .6 * s); c.beginPath(); c.ellipse(hx + dx * 1.4 * s, hy + dy * 1.4 * s, 6.2 * s, 4.7 * s, sa, -1.2, .5); c.stroke(); }
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
      if (!reduceMotion) { c.lineCap = 'round'; c.lineWidth = Math.max(1, .7 * s); const fr = Math.floor(t * 30);
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
    const s = cv.width / cam.viewW, L = cam.x - cam.viewW / 2, T = camTop(), vb = T + cv.height / s, vw = cam.viewW; let lo = -1e9, x0 = 1e9, x1 = -1e9;
    for (const i of [PEL, CHE, HEAD, KNF, FTF, KNB, FTB]) { const q = K.p[i], y = prjY(q.y, K.dep) + (q.r || 3), x = prjX(q.x, K.dep); lo = Math.max(lo, y); x0 = Math.min(x0, x); x1 = Math.max(x1, x); }
    const cx = (x0 + x1) / 2, top = lo - 2; c.save(); c.setTransform(s, 0, 0, s, -L * s, -T * s);
    const body = new Path2D(); body.moveTo(L - 30, top + 64); body.bezierCurveTo(L + vw * .2, top + 40, cx - 150, top + 1, cx - 30, top); body.bezierCurveTo(cx + 70, top - 1, cx + 190, top + 16, L + vw + 30, top + 52); body.lineTo(L + vw + 30, vb + 20); body.lineTo(L - 30, vb + 20); body.closePath();
    c.fillStyle = lin(c, 0, top, 0, vb, [[0, '#e9bd72'], [.5, '#d09a4c'], [1, '#a8702f']]); c.fill(body);
    const sh = new Path2D(); sh.moveTo(cx - 30, top); sh.bezierCurveTo(cx - 150, top + 1, L + vw * .2, top + 40, L - 30, top + 64); sh.lineTo(L - 30, vb + 20); sh.lineTo(cx - 190, vb + 20); sh.bezierCurveTo(cx - 240, top + 120, cx - 20, top + 70, cx - 30, top); sh.closePath();
    c.fillStyle = lin(c, 0, top, 0, vb, [[0, '#9a6638'], [1, '#7a4a28']]); c.fill(sh);
    c.strokeStyle = 'rgba(255,240,204,.9)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(cx - 30, top); c.bezierCurveTo(cx - 20, top + 70, cx - 240, top + 120, cx - 190, vb + 20); c.stroke();
    c.save(); c.clip(body); c.strokeStyle = 'rgba(120,70,30,.16)'; c.lineWidth = 1.5; for (let i = 1; i < 9; i++) { c.beginPath(); c.moveTo(cx + 10 + i * 6, top + i * 9); c.bezierCurveTo(cx + 120, top + 6 + i * 10, cx + 240, top + 24 + i * 11, L + vw + 30, top + 60 + i * 13); c.stroke(); } c.restore();
    // a post of the wire by his head, the strands going off both ways
    { const px = cx + (x1 - x0) * .5 + 46, py = top + 12, hh = 150; c.fillStyle = '#2c1b13'; c.beginPath(); c.moveTo(px - 4, py); c.lineTo(px - 1, py - hh); c.lineTo(px + 4.4, py - hh - 1); c.lineTo(px + 5, py); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(255,214,150,.8)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(px + 4.4, py); c.lineTo(px + 4, py - hh); c.stroke();
      c.strokeStyle = 'rgba(46,28,18,.9)'; c.lineWidth = 1.5; for (const f of [.93, .72, .5]) { const y = py - hh * f; c.beginPath(); c.moveTo(px + 1, y); c.quadraticCurveTo(px + 180, y + 26, L + vw + 30, y - 18 + f * 20); c.moveTo(px + 1, y); c.quadraticCurveTo(px - 200, y + 30, L - 30, y + 8 - f * 30); c.stroke(); } }
    if (!bare) { c.translate(K.dep * PSX, -K.dep * PSY); drawKael(K); }
    c.restore();
    sandWind(c, B, t, B.y0 + B.vh * .4, B.y0 + B.vh, 22, .26, false); c.drawImage(P.glow, 0, 0, B.w, B.h); }
  function drawKind(c, P, kind, t, bare) { if (kind === 'ink') { drawInk(c, P, t); } else if (kind === 'wire') { drawWire(c, P, t); } else if (kind === 'well') { drawWell(c, P, t); } else if (kind === 'dune') { drawDune(c, P, t, bare); } }
  // The memory torn away: its plate (already painted: nothing is made at that moment) goes up out of the picture in strands, one after
  // another across it, and him in it fades as they start.
  function strip(dur, a) { if (!V.kind) { return; } const P = plates(), k = V.kind; V.strip = { cv: k === 'well' ? P.well.cv : k === 'wire' ? P.wire.cv : P.ink.cv, kind: k, t0: S.t, dur, a: a == null ? 1 : a, glow: P.glow }; }
  function drawStrip(c, B) { const Z = V.strip, uu = clamp((S.t - Z.t0) / Z.dur, 0, 1), N = reduceMotion ? 1 : 60, sw = Math.ceil(B.w / N); if (uu >= 1) { V.strip = null; return; }
    for (let i = 0; i < N; i++) { const d = reduceMotion ? 0 : (i / N) * .3 + hsh(i, 9) * .3, v = clamp((uu - d) / (1 - d), 0, 1), e = reduceMotion ? 0 : v * v * (1.05 + .5 * hsh(i, 5)), al = (reduceMotion ? 1 - v : 1 - v * v * v) * Z.a; if (al <= 0) { continue; } c.globalAlpha = al;
      { const kx = Z.cv.width / B.w; c.drawImage(Z.cv, i * sw * kx, 0, sw * kx, Z.cv.height, i * sw, -e * B.h, sw, B.h); } }
    if (Z.kind === 'well' && uu < .3) { const P = plates(), I = P.well, Fg = figs(P).well, M = putFig(c, Fg, FTB, I.wx - I.him * I.s, I.wy + 10 * I.s - 3 * Fg.k); c.globalAlpha = (1 - uu / .3) * Z.a; c.drawImage(Fg.cv, M.dx, M.dy - uu * uu * B.h * .8); }
    c.globalAlpha = 1; }
  // the pass itself: under the story's bars and words
  function drawVision() { if (!state.run || S.arenaKey !== 'fall' || (!V.kind && V.white <= 0 && !V.strip && !V.eye && !V.wash && !V.last && !V.heli)) { return; } const c = ctx; c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
    try { const P = plates(), B = P.B;
      if (V.kind && V.alpha > 0) { c.globalAlpha = V.alpha; drawKind(c, P, V.kind, vt()); c.globalAlpha = 1; c.setTransform(1, 0, 0, 1, 0, 0); }
      if (V.strip) { drawStrip(c, B); }
      // the light that comes up in his eye and takes the picture, on the way in
      if (V.eye) { const K = hero(), s = cv.width / cam.viewW, hx = (prjX(K.p[HEAD].x, K.dep) - (cam.x - cam.viewW / 2)) * s, hy = (prjY(K.p[HEAD].y, K.dep) - camTop()) * s, F = figs(P), g = (10 + 900 * V.eye * V.eye) * B.u;
        c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.min(1, V.eye * 2.2); c.drawImage(F.glow, hx - g, hy - g, g * 2, g * 2); c.restore(); }
      if (V.white > 0) { c.globalAlpha = clamp(V.white, 0, 1); c.fillStyle = '#fff7e2'; c.fillRect(0, 0, B.w, B.h); c.globalAlpha = 1; }
      if (V.heli) { const t = S.t - V.heli.t0, a = clamp(t / .5, 0, 1) * clamp((V.heli.dur - t) / .5, 0, 1), x = B.w * ((B.tall ? .9 : .765) + .006 * t), y = B.y0 + B.vh * (.3 - .03 * t), F = figs(P), g = 15 * B.u;
        c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a * .75; c.drawImage(F.glow, x - g, y - g, g * 2, g * 2); c.globalAlpha = a; c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x, y, 1.7 * B.u, 0, TAU); c.fill();
        if ((t % .9) < .13) { c.fillStyle = '#ff5340'; c.beginPath(); c.arc(x - 6.5 * B.u, y + 1.6 * B.u, 2.1 * B.u, 0, TAU); c.fill(); } c.restore(); }
      if (V.wash) { const u = (S.t - V.wash.t0) / V.wash.dur; if (u >= 1) { V.wash = null; } else if (!reduceMotion) { c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(' + V.wash.col + ',' + (.3 * (1 - u) * (1 - u)).toFixed(3) + ')'; c.fillRect(0, 0, B.w, B.h); c.restore(); } }
      // the last light: the dark closing from the picture's edges on the arm, then on its lines alone, then all of it
      if (V.last && S.pit && S.pit.arm) { const u = clamp((S.t - V.last.t0) / V.last.dur, 0, 1), s = cv.width / cam.viewW, A = armAt(), ax = (A.x - (cam.x - cam.viewW / 2)) * s, ay = (A.y - camTop()) * s;
        const r1 = lerp(Math.hypot(B.w, B.h) * .9, 46 * s, sstep(clamp(u / .6, 0, 1))) * (1 - sstep(clamp((u - .8) / .2, 0, 1))), r0 = r1 * .12;
        c.fillStyle = r1 < 1 ? '#000' : rad(c, ax, ay, r0, r1, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,1)']]); c.fillRect(0, 0, B.w, B.h); } }
    catch (e) { state.err = String(e && e.message || e); V.kind = null; V.white = 0; V.strip = null; V.eye = 0; }
    c.restore(); }
  function vision(kind) { V.kind = kind; V.t0 = S.t; V.alpha = 1; V.tFix = null; note('memory: ' + kind); }
  function freePlates() { const P = V.P; if (!P) { return; } for (const o of [P.ink, P.wire, P.well]) { for (const k of ['cv', 'fg']) { const d = o && Object.getOwnPropertyDescriptor(o, k); if (d && d.value && d.value.width) { d.value.width = d.value.height = 0; } } }
    if (P.fig) { for (const k of ['inkLit', 'inkDark', 'wire', 'well']) { const d = Object.getOwnPropertyDescriptor(P.fig, k); if (d && d.value && d.value.cv) { d.value.cv.width = d.value.cv.height = 0; } } } V.P = null; V.key = ''; }
  function visionOff() { V.kind = null; V.white = 0; V.eye = 0; V.strip = null; V.alpha = 1; V.tFix = null; V.wash = null; V.last = null; V.spark = null; V.heli = null; }

  // ---------- into the game ----------
  function install() { if (state.installed) { return true; }
    try { const R = STAGES[stageIx('roof')], F = STAGES[stageIx('fall')]; if (!R || !F) { throw new Error('no roof or fall stage'); }
      const o = { roofIntro: R.intro, fallSetup: F.setup, fallIntro: F.intro };
      R.intro = function* (st) { if (!state.on) { yield* o.roofIntro.call(this, st); return; } yield* roofCut(st, o.roofIntro); };
      F.setup = function (st) { state.run = !!state.on; tables(state.on); PC.hold = null; if (!state.on) { visionOff(); o.fallSetup.call(this, st); return; } fallSetup(st, o.fallSetup); };
      F.intro = function* (st) { if (!state.run) { yield* o.fallIntro.call(this, st); return; } yield* fallCutIntro(st); };
      V11UI.screen.unshift(drawVision); V11UI.world.push(drawFx); V11.step.push(afterStep);
      if (typeof kaelLight === 'function') { const kl = kaelLight; kaelLight = function (f) { return lightOf(f, kl(f)); }; }
      state.installed = true; return true; }
    catch (e) { state.err = String(e && e.message || e); state.on = false; return false; } }
  return { state, install, POSES, act, ACT, rangerOf, bakeFigure, V, plates, drawVision };
})();
