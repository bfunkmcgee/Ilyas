// ===== THE FALL, AS IT IS FILMED (since V116) =====
// The roof's last seconds and the whole of the fall as a scene with a camera: the same lines and the same things happening to him as
// sk_story.js sets down, shot by shot. This file stands in for three of those two stages' scripts (the roof's intro from the shot on,
// the fall's setup and its intro); with FallCut.state.on false they run as they were to V115. What is drawn is sk_fallcutui.js's.
//
//   the roof    a push in on the shot, the steps back to the lip, the tip over it, slowed; no black
//               (to V115 he never went over: his mark stayed where he stood, and the limp body was drawn back to it before the cut)
//   the tower   under the coping, the drop, a shot for each thought, his body posed for each; the desert in his head as three
//               memories that take the whole picture (the inking, the wire, the well) and a dune under him when he says he can wait
//   the Pit     its mouth slowed and wide, the first blow, the spike held close, the hay, the eye's spark, the arm
//
// His body down the tower is posed, not fallen: a pose is angles in his own frame (POSES), each limb turned a part of the way to it
// each step (poseStep), the whole of him turned to face the way a shot wants (turnBy, stillSpin). In the Pit he is the ragdoll again.
// The camera is S.camCut, set each step from where he is (shot, camStep): w and wn the picture's width (wn on an upright phone), dx,
// dy where it looks from his middle, at a point to frame instead of him, k how fast it glides, cut to land at once; C.footMax is
// the lowest the picture may show (the fall's far side is painted only so far down: the UI keeps the view above it), C.fc marks the
// camera as this scene's (with reduced motion the UI makes every shot a cut).
// FallCut.V is what the picture is asked to show over the fall (read by the UI): kind (the memory up: ink, wire, well, dune) since
// t0 at alpha; white (the flash), eye (the light coming up in his eye), strip (the memory being torn away), heli, wash, spark, last.
const FallCut = (() => {
  'use strict';
  const state = { on: true, run: false, err: null, shot: '', log: [] };
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
  function actStep(f) { if (!ACT.B) { return; }
    if (ACT.to && ACT.k > 0) { poseStep(f, ACT.B, mixPose(ACT.from, ACT.to, sstep(clamp((S.t - ACT.t0) / ACT.over, 0, 1))), ACT.k); }
    if (ACT.ang != null && ACT.rate > 0) { stillSpin(f, 1); const d = wrap180(ACT.ang - trunkAng(f)); turnBy(f, clamp(d * 5 * DT, -ACT.rate * DT, ACT.rate * DT)); }
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
  // (two shots the drawing is made for: MEM, where the camera stands under the three memories, which is the shot the tear-away
  // opens on, so the picture under them is ready and their lines are painted to its scale; and WIRE, the shot the dune is laid in)
  const MEM = { w: 800, wn: 560 }, WIRE = { w: 860, wn: 560 };
  function shot(name, o) { const cut = o.cut || !S.camCut; SHOT = Object.assign({ w: 760, dx: 0, dy: 0, k: 2 }, o, { name });
    SHOT.wn = o.wn ?? Math.max(200, Math.min(SHOT.w, SHOT.w * .62)); SHOT.dxn = o.dxn ?? SHOT.dx * .6; SHOT.dyn = o.dyn ?? SHOT.dy;
    if (cut) { S.camCut = { snap: true, k: 0, fc: true }; } else { S.camCut = Object.assign({}, S.camCut, { snap: false, fc: true }); }
    note(name); camStep(); }
  function camStep() { const C = S.camCut, s = SHOT; if (!C || !s) { return; } const ax = s.at ? s.at().x : EYE.x, ay = s.at ? s.at().y : EYE.y, h = s.half ?? 50;
    C.x = ax + s.dx; C.xn = ax + s.dxn; C.w = s.w; C.wn = s.wn; C.x0 = -900; if (!C.snap) { C.k = s.k; }
    C.band = { top: ay + s.dy - h, foot: ay + s.dy + h }; C.bandN = { top: ay + s.dyn - h, foot: ay + s.dyn + h }; C.bandS = null;
    // (the fall's far side stops near the world's foot: the picture is kept above it, unless the Sump fills what is below)
    C.footMax = s.deep || S.arenaKey !== 'fall' ? null : 596; }

  // ---------- the roof: the shot, the lip, the tip ----------
  // The stage's own script runs as it is, a step at a time, up to the moment he is let go at the edge. From the shot on, the camera is
  // this cut's; the steps back are his own again but end with his heels on the coping, not past it; and then the stage's script is
  // left where it stands (its wait and its black) and the tip is played here.
  function* roofCut(st, orig) { const K = hero(), g = orig.call(st, st); let shotOn = false, mine = null;
    while (true) { const r = g.next(); if (r.done) { return; }
      if (!shotOn && S.slowT > 1.5 && S.arenaKey === 'roof') { shotOn = true; EYE.set = false; eyeStep(K, 1); shot('roof: the shot', { w: 460, wn: 300, dx: -46, dxn: -10, dy: -14, dyn: 62, k: 2.6 }); }
      if (shotOn) { eyeStep(K, .2);
        // (the stage sets its own camera after the hit: this cut's again, on the same frame)
        if (S.camCut && S.camCut.snap === undefined) { S.camCut = { snap: false, k: SHOT.k, fc: true }; }
        if (K.action && K.action !== mine && K.action.end === 2.2) { mine = K.action = stepsBack(K, K.action.t0); shot('roof: the gilt goes out', { w: 420, wn: 280, dx: 30, dxn: 12, dy: -10, dyn: 62, k: 1.6 }); }
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
    shot('roof: the edge', { w: 400, wn: 270, at: () => ({ x: prjX(ROOF_EDGE + 10, K.dep), y: prjY(GB - 64, K.dep) }), dyn: 88, k: 2.4 });
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
  // (sk_story.js's tables of how deep the desert is and how much it slows the fall at each thought's end, and this scene's: beside
  // the tower the desert is what is left over between the memories, and all there is again when he waits on the wire; it holds, as it
  // always did, until the first blow in the Pit wakes him. It never goes quite out between: the sand in the windows does not drain)
  let TAB0 = null;
  const DREAM1 = [0, .5, .62, .3, .2, .16, .13, .1, .06, .05, 1, 1], SLOW1 = [0, .5, .62, .5, .42, .4, .38, .34, .5, .5, .9, 0];
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
    yield* all(hold, lines);
    yield* pitCut(K, P); }
  // what the picture and his body do through each thought (i: which, d: how long it is up)
  function* thought(i, d, K, P) {
    if (i === 0) { shot('his dead hand', { w: 360, wn: 230, dy: -6, cut: true }); act({ pose: 'hand', over: .7, k: .2, ang: 62, rate: 90, spin: 0 }); yield* wait(d); }
    else if (i === 1) { // in through his eye: the picture closes on it, a light comes up in it and takes everything; then the inking, then the wire
      const head = () => ({ x: prjX(K.p[HEAD].x, K.dep), y: prjY(K.p[HEAD].y, K.dep) });
      shot('into his eye', { w: 300, wn: 200, at: head, dy: 6, k: 3.4 }); S.hooks.sound('eye_light', 1);
      const t0 = S.t; yield* until(() => { const u = (S.t - t0) / .62; V.eye = clamp(u, 0, 1); V.white = clamp((u - .5) / .5, 0, 1); return u >= 1; });
      V.eye = 0; shot('under the memories', Object.assign({ dx: -40, dy: 10, cut: true }, MEM)); vision('ink'); act({ pose: 'slack', over: 1.5, k: .1, ang: null, spin: 14 });
      const t1 = S.t; yield* until(() => { V.white = 1 - clamp((S.t - t1) / .5, 0, 1); return S.t > t1 + 2.25; });
      vision('wire'); const t2 = S.t, left = d - (S.t - t0); yield* until(() => { V.white = .5 * (1 - clamp((S.t - t2) / .3, 0, 1)); return S.t > t2 + left; }); }
    else if (i === 2) { vision('well'); const t2 = S.t; yield* until(() => { V.white = .5 * (1 - clamp((S.t - t2) / .3, 0, 1)); return S.t > t2 + d; }); }
    else if (i === 3) { // the Sprawl takes it: the memory is torn away upward and he is back at the tower, the house's mark going by
      strip(1.0, 1); V.kind = null; V.white = 0;
      shot('the house’s mark', Object.assign({ dx: -40, dy: 10, cut: true }, MEM)); act({ pose: 'curl', over: 1.2, k: .14, ang: null, spin: -22 }); yield* wait(d); }
    else if (i === 4) { shot('thirty years', { w: 520, wn: 340, dy: 0, cut: true }); act({ pose: 'slack', over: 1.4, k: .1, spin: 16 }); yield* wait(d); }
    else if (i === 5) { shot('every door', { w: 600, wn: 380, dx: -60, dy: 10, cut: true }); yield* wait(d); }
    else if (i === 6) { shot('every name', { w: 440, wn: 290, dx: 20, dy: -6, cut: true }); act({ pose: 'curl', over: 1.6, k: .12, spin: 10 }); yield* wait(d); }
    else if (i === 7) { shot('the height', { w: 900, wn: 620, dx: -25, dy: -62, dyn: -150, half: 60, cut: true }); act({ pose: 'slack', over: 1.2, k: .1, ang: 100, rate: 60, spin: 0 }); V.heli = { t0: S.t, dur: d }; yield* wait(d); V.heli = null; }
    else if (i === 8) { shot('the turn', { w: 300, wn: 210, at: () => ({ x: prjX(K.p[HEAD].x, K.dep), y: prjY(K.p[HEAD].y, K.dep) }), dy: 14, cut: true }); act({ pose: 'set', over: .5, k: .26, ang: 100, rate: 40 }); yield* wait(d); }
    else if (i === 9) { SHOT.k = .9; SHOT.w = 360; SHOT.wn = 240; yield* wait(d); }
    else if (i === 10) { // he can wait: wide and still, and the air he lies on becomes the sand of the wire
      shot('the wire', Object.assign({ dx: -4, dxn: 40, dy: 6, cut: true }, WIRE)); act({ pose: 'lie', over: .7, k: .22, ang: 90, rate: 200 });
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
  function* pitCut(K, P) { V.kind = null; V.strip = null; const chest = () => D2((K.p[PEL].x + K.p[CHE].x) / 2, (K.p[PEL].y + K.p[CHE].y) / 2), head = () => D2(K.p[HEAD].x, K.p[HEAD].y);
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

  // ---------- what the picture is asked to show ----------
  const V = { kind: null, t0: 0, alpha: 1, white: 0, eye: 0, strip: null, tFix: null, heli: null, wash: null, last: null, spark: null };
  const hsh = (i, k) => { let h = (Math.imul(i | 0, 73856093) ^ Math.imul(k | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return (h >>> 8) / 16777216; };
  function vision(kind) { V.kind = kind; V.t0 = S.t; V.alpha = 1; V.tFix = null; note('memory: ' + kind); }
  // (the memory up is torn away over dur: the UI draws it going, from here on there is none up)
  function strip(dur, a) { if (!V.kind) { return; } V.strip = { kind: V.kind, t0: S.t, dur, a: a == null ? 1 : a }; }
  function visionOff() { V.kind = null; V.white = 0; V.eye = 0; V.strip = null; V.alpha = 1; V.tFix = null; V.wash = null; V.last = null; V.spark = null; V.heli = null; }

  // ---------- into the stages ----------
  { const R = STAGES[stageIx('roof')], F = STAGES[stageIx('fall')], o = { roofIntro: R.intro, fallSetup: F.setup, fallIntro: F.intro };
    R.intro = function* (st) { if (!state.on) { yield* o.roofIntro.call(this, st); return; } yield* roofCut(st, o.roofIntro); };
    F.setup = function (st) { state.run = !!state.on; tables(state.on); PC.hold = null; if (!state.on) { visionOff(); o.fallSetup.call(this, st); return; } fallSetup(st, o.fallSetup); };
    F.intro = function* (st) { if (!state.run) { yield* o.fallIntro.call(this, st); return; } yield* fallCutIntro(st); };
    V11.step.push(afterStep);
    // (any other fight or scene: nothing of this one is left up)
    V11.duelStart.push(() => { if (S.arenaKey !== 'fall') { state.run = false; visionOff(); PC.hold = null; } }); }
  return { state, V, FX, PC, POSES, ACT, act, fk, bonesOf, hsh, armAt, MEM, WIRE };
})();
