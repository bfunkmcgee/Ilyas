// ===== ILYAS IN THE PIT (art for the skinned-figure test) =====
// Act I: one arm, and what Tamm's lost property gave him, in soot, oilcloth and rust with no gold anywhere. The torso's layers (his
// skin and its dressings, the undershirt, the work shirt, the jersey, the trousers and their belts, the canvas jacket, the oilcloth
// coat, the three armours, the scarf), the sleeves and the bare arm he has left, what is on his hand, the dressed stump and the empty
// sleeve, the trousers, the shin guards, the boots, the sandals and his bare feet. See skin_kit.js for the frames.
(() => {
  const K = SkinArt, { def, f, pt, P, L, poly, curve, mat, tone, RIM } = K, R = K.rest, T = R.torso, A2 = K.A2, Q2 = K.Q2, TB = K.TB;
  const La = R.ua + R.fa, e = R.ua, Ll = R.th + R.sh, kn = R.th, far = { far: true };
  const dark = (d, w = .4, a = .5) => L(d, '#000', w, `stroke-opacity="${a}"`), lite = (d, w = .3, a = .4, col = '#fff') => L(d, col, w, `stroke-opacity="${a}"`);
  const HORN = '#4a3d2e', PIN = '#9a958a', LINEN = '#bdb4a0', ROPE = '#5c4c33';
  // ---------- the torso's layers ----------
  const shirtOut = B => ({ back: [[-.05 * T, -1.2], [-.04 * T, -8.2 * B], [.02 * T, -8.4 * B], [.18 * T, -7.6 * B], [.4 * T, -6.6 * B], [.55 * T, -7.4 * B], [.8 * T, -8.6 * B], [.97 * T, -6.6 * B], [T + 2.2, -3.4]], top: [[T + 2.8, 0]],
    front: [[T + 2.4, 3.6], [T + .9, 5], [.92 * T, 7.3 * B], [.8 * T, 9.1 * B], [.64 * T, 9.2 * B], [.48 * T, 8.0 * B], [.33 * T, 7.2 * B], [.18 * T, 7.4 * B], [-.04 * T, 7.6 * B], [-.05 * T, 1]] });
  const clipTo = (out, body, id = 'dc') => `<clipPath id="${id}"><path d="${K.outPath(out)}"/></clipPath><g clip-path="url(#${id})">${body}</g>`;
  const hline = (a, x0 = -15, x1 = 15) => `M${pt(x0, -a)} L${pt(x1, -a)}`;
  // his skin: bare to the waist. From the side the line of the chest and the ribs under it; square on, the collarbones, the chest,
  // the belly; from behind the spine and the shoulder blades
  const skinOut = shirtOut(.94);
  K.tlayer('t.skin', { out: skinOut, mat: 'skin', x1: -8, x2: 9, body:
    dark(`M${A2(.78 * T, 3)} C${A2(.7 * T, 6)} ${A2(.66 * T, 7.6)} ${A2(.68 * T, 8.6)}`, .45, .55) + dark(`M${A2(.56 * T, 3.4)} l2.4,-.5 M${A2(.48 * T, 3.2)} l2.4,-.5 M${A2(.4 * T, 3)} l2.3,-.5`, .35, .4)
    + dark(`M${A2(.84 * T, -3)} C${A2(.6 * T, -4.6)} ${A2(.3 * T, -3.6)} ${A2(.02 * T, -4.4)}`, .4, .4) + dark(`M${A2(.3 * T, 1.4)} C${A2(.2 * T, 3.4)} ${A2(.1 * T, 4.6)} ${A2(.0 * T, 6.4)}`, .4, .4),
    front: dark(`M0,${f(-(T + .4))} L0,${f(-.1 * T)}`, .4, .45) + dark(`M-1,${f(-(T - .6))} Q-5,${f(-(T + .6))} -10,${f(-(T - .2))} M1,${f(-(T - .6))} Q5,${f(-(T + .6))} 10,${f(-(T - .2))}`, .45, .5)
      + dark(`M-.6,${f(-.7 * T)} Q-5,${f(-.62 * T)} -9.4,${f(-.72 * T)} M.6,${f(-.7 * T)} Q5,${f(-.62 * T)} 9.4,${f(-.72 * T)}`, .5, .55) + dark([.52, .4, .28].map(a => `M-4.2,${f(-a * T)} L-.5,${f(-a * T - .3)} M4.2,${f(-a * T)} L.5,${f(-a * T - .3)}`).join(' '), .35, .4)
      + dark(`M-7,${f(-.5 * T)} Q-6,${f(-.3 * T)} -4.6,${f(-.08 * T)} M7,${f(-.5 * T)} Q6,${f(-.3 * T)} 4.6,${f(-.08 * T)}`, .35, .35) + `<ellipse cx="0" cy="${f(-.14 * T)}" rx=".5" ry=".8" fill="#000" fill-opacity=".6"/>`,
    back: dark(`M0,${f(-(T + 1))} L0,${f(-.02 * T)}`, .5, .55) + dark(`M-2,${f(-.9 * T)} Q-7,${f(-.8 * T)} -5.4,${f(-.6 * T)} M2,${f(-.9 * T)} Q7,${f(-.8 * T)} 5.4,${f(-.6 * T)}`, .45, .45) + dark(`M-3.6,${f(-.5 * T)} Q-2.4,${f(-.3 * T)} -2.8,${f(-.1 * T)} M3.6,${f(-.5 * T)} Q2.4,${f(-.3 * T)} 2.8,${f(-.1 * T)}`, .35, .35) });
  // the dressings: round his chest under the arms, and from the stump forward and back across him
  const wrapMarks = (x0, x1, a, w, step = 2.6) => { let d = ''; for (let x = x0; x < x1; x += step) d += `M${pt(x, -a - w * .5)} L${pt(x + 1, -a + w * .5)} `; return dark(d, .3, .3); };
  const bandH = (a, w) => P(poly([[-15, -a - w / 2], [15, -a - w / 2], [15, -a + w / 2], [-15, -a + w / 2]]), mat('linen', true), 'stroke="#000" stroke-width=".3" stroke-opacity=".35"') + wrapMarks(-15, 15, a, w);
  const bandD = (Q, w) => { const d = K.stripD(Q.map(q => [q[1], -q[0]]), w); return P(d, LINEN, 'stroke="#000" stroke-width=".3" stroke-opacity=".35"'); };
  K.stripD = (Q, w) => { const Aq = [], Bq = []; for (let i = 0; i < Q.length; i++) { const a = Q[Math.max(0, i - 1)], b = Q[Math.min(Q.length - 1, i + 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / l * w / 2, ny = (b[0] - a[0]) / l * w / 2; Aq.push([Q[i][0] + nx, Q[i][1] + ny]); Bq.push([Q[i][0] - nx, Q[i][1] - ny]); } return poly([...Aq, ...Bq.reverse()]); };
  // (round his chest from every side; the two from the stump forward and back across him are the profile's own, as the game has them)
  K.tdeco('t.bandage', clipTo(skinOut, bandH(.74 * T, 3.8)), { svgP: clipTo(skinOut, bandD([[T - 1.2, 1.2], [.8 * T, 6.2], [.6 * T, 9.8]], 3.2) + bandD([[T - 1.6, -2.2], [.8 * T, -6.8], [.6 * T, -9.6]], 3.2), 'dn'),
    front: bandH(.74 * T, 3.8), back: bandH(.74 * T, 3.8) });
  // the sleeveless undershirt: a scoop at the neck; the dressings show above it
  const underOut = { back: [[-.05 * T, -1.2], [-.04 * T, -8.1], [.02 * T, -8.3], [.18 * T, -7.5], [.4 * T, -6.5], [.55 * T, -7.3], [.8 * T, -8.5], [.96 * T, -6.4]],
    front: [[.97 * T, -4.6], [.9 * T, -1.4], [.85 * T, 2.6], [.8 * T, 6.2], [.74 * T, 8.6], [.64 * T, 9.0], [.48 * T, 7.9], [.33 * T, 7.1], [.18 * T, 7.3], [-.04 * T, 7.5], [-.05 * T, 1]] };
  const scoop = (aMid, aEdge, front) => `<defs>${K.pgrad('pg', 'under', front)}</defs>` + P(`M-15,${f(-aEdge)} Q0,${f(-(2 * aMid - aEdge))} 15,${f(-aEdge)} L15,${f(.06 * T)} L-15,${f(.06 * T)} Z`, 'url(#pg)') + dark(`M-15,${f(-aEdge)} Q0,${f(-(2 * aMid - aEdge))} 15,${f(-aEdge)}`, .5, .5);
  K.tlayer('t.under', { out: underOut, mat: 'under', x1: -8.5, x2: 9, body: dark(`M${A2(.97 * T, -4.6)} L${A2(.9 * T, -1.4)} L${A2(.85 * T, 2.6)} L${A2(.8 * T, 6.2)} L${A2(.74 * T, 8.6)}`, .5, .5) + dark(`M${A2(.5 * T, -2)} q.8,6 -.6,12`, .35, .25),
    frontRaw: scoop(.74 * T, T + 1.5, true) + dark(`M-3,${f(-.3 * T)} q3,1 6,0`, .35, .25), backRaw: scoop(.86 * T, T + 1.5, false) });
  // the work shirt: collarless linen gone grey, a placket and horn buttons, gathered into the belt
  const gathers = [-5, -1, 3.5, 6.4].map(s0 => `M${A2(.09 * T, s0)} L${A2(.2 * T, s0 + .6)}`).join(' ');
  const horn = (x, y, r = .75) => `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${HORN}"/>`;
  K.tlayer('t.shirt', { out: shirtOut(1.05), mat: 'shirt', x1: -9.5, x2: 10, body: dark(curve(Q2([[T + 2.0, -3.2], [T + 2.8, 0], [T + 2.4, 3.3]])), .5, .5) + dark(`M${A2(T + 2.2, 3.4)} L${A2(.86 * T, 6.6)} L${A2(.62 * T, 8.2)}`, .35, .5) + dark(gathers, .35, .32)
      + horn(6.9, -.9 * T) + horn(6.9, -.74 * T) + dark(`M${A2(.84 * T, -1.6)} C${A2(.6 * T, -2.6)} ${A2(.3 * T, -1.8)} ${A2(0, -2)}`, .4, .35),
    front: dark(`M-.9,${f(-(T + 1.6))} L-.9,${f(-.02 * T)} M.9,${f(-(T + 1.6))} L.9,${f(-.02 * T)}`, .3, .45) + [.92, .76, .6, .44, .28, .12].map(a => horn(0, -a * T, .6)).join('') + dark(`M-15,${f(-(T + 1.2))} Q0,${f(-(T - 1.4))} 15,${f(-(T + 1.2))}`, .5, .5)
      + P(`M-15,${f(-(T + 9))} L15,${f(-(T + 9))} L15,${f(-(T + 1.2))} Q0,${f(-(T - 1.4))} -15,${f(-(T + 1.2))} Z`, tone('skin', 2)) + dark([-7, -3.4, 3.4, 7].map(x => `M${pt(x, -.1 * T)} L${pt(x + .4, -.2 * T)}`).join(' '), .35, .3),
    back: dark(`M-15,${f(-.86 * T)} Q0,${f(-.8 * T)} 15,${f(-.86 * T)}`, .4, .45) + dark(`M-.8,${f(-.82 * T)} L-.8,${f(-.1 * T)} M.8,${f(-.82 * T)} L.8,${f(-.1 * T)}`, .3, .35) + dark(`M-15,${f(-(T + 1.8))} Q0,${f(-(T + 1))} 15,${f(-(T + 1.8))}`, .5, .5) });
  // the knitted jersey: dark wool worn over the trousers, a rib at the neck and the hem, the knit running down it
  const knitS = [-6, -3, 0, 3, 6].map(s0 => `M${A2(.1 * T, s0)} L${A2(.86 * T, s0 * .95)}`).join(' '), knitP = (() => { let d = ''; for (let x = -13.5; x <= 13.5; x += 2.7) d += `M${pt(x, -.06 * T)} L${pt(x, -(T + 1))} `; return d; })();
  K.tlayer('t.jersey', { out: shirtOut(1.08), mat: 'jersey', x1: -9.8, x2: 10.2, D: 1.03, body: dark(curve(Q2([[T + 1.8, -3.4], [T + 2.6, 0], [T + 2.2, 3.5]])), 1.3, .45) + dark(`M${A2(.02 * T, -8.8)} L${A2(-.02 * T, 0)} L${A2(.02 * T, 8)}`, 1.1, .45) + dark(knitS, .3, .28),
    front: dark(knitP, .3, .28) + dark(hline(.0 * T), 1.1, .45) + dark(`M-15,${f(-(T + 1.4))} Q0,${f(-(T - .8))} 15,${f(-(T + 1.4))}`, 1.3, .5) + P(`M-15,${f(-(T + 9))} L15,${f(-(T + 9))} L15,${f(-(T + 2))} Q0,${f(-(T - .2))} -15,${f(-(T + 2))} Z`, tone('skin', 2)),
    back: dark(knitP, .3, .28) + dark(hline(.0 * T), 1.1, .45) + dark(`M-15,${f(-(T + 2))} Q0,${f(-(T + 1.2))} 15,${f(-(T + 2))}`, 1.3, .5) });
  // the linen trousers at the hips, their drawstring (when nothing is over it), and the two belts
  K.tlayer('t.waist.soot', { out: K.waistOut, mat: 'soot', body: dark(`M${A2(.02 * T, -8.6)} L${A2(.03 * T, 7.6)}`, .4, .5), front: K.waistFront, back: K.waistBack });
  K.tdeco('t.string', L(`M${A2(.07 * T, 5.2)} Q${A2(.02 * T, 6.6)} ${A2(-.03 * T, 6.4)}`, LINEN, .63), { front: L(`M0,${f(-.03 * T)} q-1.6,1.6 -2,3.4 M0,${f(-.03 * T)} q1.2,1.8 1.4,3`, LINEN, .6) + `<circle cx="0" cy="${f(-.03 * T)}" r=".7" fill="${LINEN}"/>` });
  const beltQ = Q2([[-.015 * T, -8.5], [.075 * T, -8.7], [.08 * T, 7.9], [-.01 * T, 7.6]]), beltBand = col => `<rect x="-15" y="${f(-.078 * T)}" width="30" height="${f(.092 * T)}" fill="${col}"/>`;
  K.tdeco('t.belt', P(poly(beltQ), 'url(#m-band)') + `<rect x="6" y="${f(-.03 * T - 1.4)}" width="2.4" height="2.8" fill="none" stroke="${PIN}" stroke-width=".6"/>`,
    { front: beltBand('#34261c') + dark(hline(.075 * T), .3, .5) + `<rect x="-1.5" y="${f(-.078 * T - .2)}" width="3" height="${f(.092 * T + .4)}" fill="none" stroke="${PIN}" stroke-width=".65"/>`, back: beltBand('#1f1610') + dark(hline(.075 * T), .3, .5) });
  K.tdeco('t.rope', P(poly(Q2([[0, -8.6], [.05 * T, -8.7], [.055 * T, 8.0], [.005 * T, 7.8]])), 'url(#m-rope)') + `<circle cx="7.6" cy="${f(-.03 * T)}" r="1.2" fill="${ROPE}"/>` + L(`M7.6,${f(-.03 * T)} L7.9,${f(.12 * T)} M7.6,${f(-.03 * T)} L6.6,${f(.1 * T)}`, ROPE, .9),
    { front: `<rect x="-15" y="${f(-.055 * T)}" width="30" height="${f(.05 * T)}" fill="${tone('rope', 2)}"/>` + dark((() => { let d = ''; for (let x = -14; x < 15; x += 1.6) d += `M${pt(x, -.052 * T)} l.8,${f(.046 * T)} `; return d; })(), .3, .35) + `<circle cx="-1" cy="${f(-.03 * T)}" r="1.3" fill="${ROPE}"/>` + L(`M-1,${f(-.03 * T)} L-1.6,${f(.13 * T)} M-1,${f(-.03 * T)} L.6,${f(.11 * T)}`, ROPE, .9),
      back: `<rect x="-15" y="${f(-.055 * T)}" width="30" height="${f(.05 * T)}" fill="${tone('rope', 1)}"/>` });
  // the short canvas jacket: to the hips, buttoned, a small collar and a pocket flap
  const canvasOut = { back: [[-.09 * T, -6.5], [-.06 * T, -8.8], [0, -9.1], [.18 * T, -7.8], [.4 * T, -6.5], [.55 * T, -7.4], [.8 * T, -8.9], [.97 * T, -6.4], [T + 1.2, -3.6]], top: [[T + 3.4, -3.2], [T + 3.8, -.6]],
    front: [[T + 2.4, 2.6], [T + .9, 4.4], [.92 * T, 7.8], [.8 * T, 9.6], [.64 * T, 9.7], [.48 * T, 8.3], [.33 * T, 7.4], [.2 * T, 7.7], [.05 * T, 7.8], [-.06 * T, 5.8], [-.09 * T, 2]] };
  K.tlayer('t.canvas', { out: canvasOut, mat: 'canvas', D: 1.1, body: P(poly(Q2([[T - 1.2, -4.0], [T + 3.0, -4.0], [T + 3.8, -1.0], [T + 2.4, 2.8], [T - .4, 2.4]])), tone('canvas', 2)) + dark(`M${A2(.9 * T, 7.6)} L${A2(.6 * T, 8.9)} L${A2(.3 * T, 7.5)} L${A2(-.05 * T, 6.2)}`, .45, .5)
      + dark(`M${A2(.78 * T, 3.2)} L${A2(.78 * T, 7.2)} L${A2(.7 * T, 7.3)} L${A2(.7 * T, 3.3)} Z`, .35, .5) + dark(`M${A2(.06 * T, -8.4)} L${A2(.06 * T, 7.4)}`, .35, .4) + [.78, .6, .42, .24].map(a => horn(7.4, -a * T)).join('') + dark(`M${A2(.84 * T, -1.4)} C${A2(.6 * T, -2.4)} ${A2(.3 * T, -1.6)} ${A2(-.06 * T, -1.8)}`, .4, .35),
    front: dark(`M1.2,${f(-(T + 1))} L1.2,${f(.08 * T)}`, .45, .55) + [.8, .62, .44, .26, .08].map(a => horn(0, -a * T, .7)).join('') + dark(`M-9.4,${f(-.7 * T)} L-5.4,${f(-.7 * T)} L-5.4,${f(-.78 * T)} L-9.4,${f(-.78 * T)} Z M9.4,${f(-.7 * T)} L5.4,${f(-.7 * T)} L5.4,${f(-.78 * T)} L9.4,${f(-.78 * T)} Z`, .35, .5)
      + dark(hline(-.04 * T), .35, .4) + P(poly([[-15, -(T + 9)], [15, -(T + 9)], [15, -(T + 1.4)], [3, -(T + 2.4)], [0, -(T - .6)], [-3, -(T + 2.4)], [-15, -(T + 1.4)]]), tone('canvas', 3)) + dark(`M-15,${f(-(T + 1.4))} L-3,${f(-(T + 2.4))} L0,${f(-(T - .6))} L3,${f(-(T + 2.4))} L15,${f(-(T + 1.4))}`, .4, .5),
    back: dark(`M-15,${f(-.86 * T)} Q0,${f(-.8 * T)} 15,${f(-.86 * T)}`, .4, .45) + dark(`M0,${f(-.82 * T)} L0,${f(.08 * T)}`, .35, .4) + dark(hline(-.04 * T), .35, .4) + P(poly([[-15, -(T + 9)], [15, -(T + 9)], [15, -(T + 1.6)], [0, -(T + 1)], [-15, -(T + 1.6)]]), tone('canvas', 1)) });
  // the oilcloth coat: an orc dockhand's, two sizes too big; its collar turned up, the front lapped over, a patch pocket, horn toggles
  const Do = 1.16, oilOut = { back: [[-.17 * T, -6.6], [-.12 * T, -8.8], [0, -8.9 * Do], [.18 * T, -7.4 * Do], [.4 * T, -6.1 * Do], [.55 * T, -7.0 * Do], [.8 * T, -8.6 * Do], [.97 * T, -6.4], [T + 1.4, -4.7], [T + 4.2, -4.5]], top: [[T + 5.3, -2.4], [T + 5.4, .2]],
    front: [[T + 3.8, 3.2], [T + 1, 4.4], [.92 * T, 7.6 * Do], [.8 * T, 9.4 * Do], [.64 * T, 9.4 * Do], [.48 * T, 7.9 * Do], [.33 * T, 7.0 * Do], [.2 * T, 7.3 * Do], [.05 * T, 7.4 * Do], [-.11 * T, 5.4], [-.165 * T, 1.6]] };
  const toggle = (x0, x1, y) => L(`M${pt(x0, y)} L${pt(x1, y)}`, HORN, 1.5);
  K.tlayer('t.oil', { out: oilOut, mat: 'coat', D: Do, x1: -11, x2: 11.5, body: P(poly(Q2([[T - 1.8, -4.8], [T + 4.4, -4.6], [T + 5.4, -1.0], [T + 3.6, 3.4], [T - .6, 3.0]])), tone('coat', 2)) + P(poly(Q2([[T + 1.4, 2.4], [T + 2.4, 4.4], [.9 * T, 6.8 * Do], [.84 * T, 4.6]])), tone('shirt', 2))
      + dark(`M${A2(.9 * T, 7.4 * Do)} L${A2(.6 * T, 8.6 * Do)} L${A2(.3 * T, 7.0 * Do)} L${A2(-.1 * T, 5.4)}`, .6, .5) + dark(`M${A2(.24 * T, 1.8)} L${A2(.24 * T, 6.6 * Do)} L${A2(-.04 * T, 6.2 * Do)} L${A2(-.04 * T, 1.6)} Z`, .4, .5)
      + [.72, .52, .32].map(a => toggle(6.6 * Do, 8.0 * Do, -a * T)).join('') + dark(`M${A2(.84 * T, -1)} C${A2(.6 * T, -2.2)} ${A2(.3 * T, -1.4)} ${A2(-.13 * T, -1.6)}`, .45, .4),
    front: dark(`M2.6,${f(-(T + 1))} L2.2,${f(.14 * T)}`, .6, .55) + [.72, .52, .32].map(a => toggle(-.4, 2.6, -a * T)).join('') + dark(`M-10,${f(-.24 * T)} L-4.6,${f(-.24 * T)} L-4.6,${f(.04 * T)} L-10,${f(.04 * T)} Z M10,${f(-.24 * T)} L4.6,${f(-.24 * T)} L4.6,${f(.04 * T)} L10,${f(.04 * T)} Z`, .4, .5)
      + P(poly([[-15, -(T + 9)], [15, -(T + 9)], [15, -(T + 1.4)], [4, -(T + 3)], [1.4, -(T - 1.6)], [-2, -(T + 3)], [-15, -(T + 1.4)]]), tone('coat', 3)) + P(poly([[-2, -(T + 3)], [1.4, -(T - 1.6)], [4, -(T + 3)], [1, -(T + 4)]]), tone('shirt', 2))
      + dark(`M-15,${f(-(T + 1.4))} L-2,${f(-(T + 3))} L1.4,${f(-(T - 1.6))} L4,${f(-(T + 3))} L15,${f(-(T + 1.4))}`, .45, .5),
    back: dark(`M0,${f(-.8 * T)} L0,${f(.14 * T)}`, .45, .5) + dark(`M-15,${f(-.84 * T)} Q0,${f(-.74 * T)} 15,${f(-.84 * T)}`, .5, .45) + lite(`M-15,${f(-.82 * T)} Q0,${f(-.72 * T)} 15,${f(-.82 * T)}`, .4, .1) + P(poly([[-15, -(T + 9)], [15, -(T + 9)], [15, -(T + 1.8)], [0, -(T + 1.2)], [-15, -(T + 1.8)]]), tone('coat', 1)) });
  // its skirt: the same sheet as the long coat's, in oilcloth: plain, a seam down it, the sheen of the cloth, no trim
  { const SW = K.SW, SH = K.SH;
    def('sk.oil', [0, 0, SW, SH], `<rect x="0" y="0" width="${SW}" height="${SH}" fill="${mat('coat', true)}"/><g filter="url(#soft)">${P(`M4.4,6 L5.8,${SH} L3.2,${SH}Z M11,10 L12.8,${SH} L9.8,${SH}Z M16.4,8 L18,${SH} L15,${SH}Z`, '#000', 'fill-opacity=".5"')}${P(`M7.4,8 L9,${SH} L7.6,${SH}Z M13.8,10 L15,${SH} L14,${SH}Z`, '#5a6048', 'fill-opacity=".35"')}</g>
      ${dark(`M.5,14 L.5,${SH} M${SW - 2.6},0 L${SW - 2.6},${SH}`, .5, .5)}${dark(`M0,${SH - 1.6} L${SW},${SH - 1.6}`, .4, .45)}`, { kind: 'sheet', w: SW, rows: K.rows }); }
  // Act I's armour, over whatever he wears: the drover's leather jerkin, the stab vest, the tyre plates laced onto canvas
  // (each in two sizes: over the shirt, the jersey or the canvas jacket, and let out to go round the oilcloth coat)
  for (const [sfx, Bv] of [['', 1.09], ['.big', 1.2]]) { const lo = .1 * T, Bt = 1 + (Bv - 1) * .25, Bm = 1 + (Bv - 1) * .7;
  const armOut = { back: [[lo - .025 * T, -1.2], [lo, -8.9 * Bv], [.22 * T, -8.1 * Bv], [.4 * T, -7.1 * Bv], [.55 * T, -7.9 * Bv], [.8 * T, -9.1 * Bm], [.97 * T, -6.9 * Bt], [T + 1.3, -3.6]], top: [[T + 1.5, -1.4], [T + 1.3, 1.6]],
    front: [[T + .5, 4.8], [.92 * T, 7.7 * Bt], [.8 * T, 9.7 * Bm], [.64 * T, 9.8 * Bv], [.48 * T, 8.6 * Bv], [.33 * T, 7.8 * Bv], [.22 * T, 8.0 * Bv], [lo, 8.0 * Bv], [lo - .025 * T, 1]] };
  const lacing = (x0, x1, a0, n, step) => { let d = ''; for (let j = 0; j < n; j++) { const a = a0 - j * step; d += `M${pt(x1, -a)} L${pt(x0, -(a - step * .5))} M${pt(x0, -a)} L${pt(x1, -(a - step * .5))} `; } return L(d, ROPE, .42); };
  K.tlayer('t.jerkin' + sfx, { out: armOut, mat: 'jerkin', D: Bv, x1: -9.1 * Bv, x2: 9.8 * Bv, body: dark(curve(Q2([[.92 * T, 7.0 * Bv], [.8 * T, 8.9 * Bv], [.64 * T, 9.0 * Bv], [.48 * T, 7.9 * Bv], [.33 * T, 7.1 * Bv], [.22 * T, 7.3 * Bv], [lo + .03 * T, 7.3 * Bv]])), .45, .55)
      + L(`M${A2(lo + .035 * T, -8.2 * Bv)} L${A2(lo + .035 * T, 7.4 * Bv)}`, '#000', .35, 'stroke-opacity=".45" stroke-dasharray="1.2 1"') + dark(`M${A2(.9 * T, -2.8)} L${A2(.5 * T, -1.6)} L${A2(lo + .04 * T, -1.4)}`, .4, .4) + lacing(6.6 * Bv, 8.3 * Bv, .82 * T, 5, .14 * T) + lite(`M${A2(.8 * T, 6)} q-4,2 -8,.4`, .5, .1),
    front: dark(`M0,${f(-(T + 1))} L0,${f(-lo)}`, .4, .5) + lacing(-1.3, 1.3, .9 * T, 6, .13 * T) + L(hline(lo + .035 * T), '#000', .35, 'stroke-opacity=".45" stroke-dasharray="1.2 1"') + dark(`M-15,${f(-(T + .2))} Q0,${f(-(T - 2.6))} 15,${f(-(T + .2))}`, .45, .5),
    back: dark(`M0,${f(-(T + 1))} L0,${f(-lo)}`, .35, .4) + L(hline(lo + .035 * T), '#000', .35, 'stroke-opacity=".45" stroke-dasharray="1.2 1"') + dark(`M-15,${f(-.84 * T)} Q0,${f(-.78 * T)} 15,${f(-.84 * T)}`, .4, .4) });
  const EDGE = '#0b0c10';
  K.tlayer('t.stab' + sfx, { out: armOut, mat: 'stab', D: Bv * 1.05, x1: -9.1 * Bv, x2: 9.8 * Bv, body: L(K.outPath(armOut), EDGE, 2.2) + [[.36, .29], [.6, .53]].map(([a0, a1]) => P(poly(Q2([[a0 * T, -3.4], [a0 * T, 3.4], [a1 * T, 3.4], [a1 * T, -3.4]])), EDGE)).join('') + P(poly(Q2([[T + 1.4, -2.6], [T + 1.5, 2.2], [.9 * T, 2.6], [.9 * T, -2.9]])), EDGE)
      + dark(`M${A2(.88 * T, -8.2 * Bv)} L${A2(.3 * T, -7.4 * Bv)} L${A2(lo + .04 * T, -8 * Bv)} M${A2(.88 * T, 8.4 * Bv)} L${A2(.5 * T, 7.8 * Bv)} L${A2(lo + .04 * T, 7.4 * Bv)}`, .4, .35),
    near: P(poly(Q2([[.76 * T, 5.0], [.76 * T, 8.2], [.63 * T, 8.4], [.63 * T, 5.0]])), '#2b2f36', 'stroke="#000" stroke-width=".3" stroke-opacity=".5" stroke-dasharray=".6 .7"'),
    front: P(curve([[-9.6, -.92 * T], [9.6, -.92 * T], [9, -(lo + .04 * T)], [-9, -(lo + .04 * T)]], true, .12), K.mixHex(tone('stab', 1), tone('stab', 2), .55), `stroke="${EDGE}" stroke-width="1.6"`) + P(poly([[-9, -.76 * T], [-5.4, -.76 * T], [-5.4, -.63 * T], [-9, -.63 * T]]), '#2b2f36', 'stroke="#000" stroke-width=".3" stroke-opacity=".5" stroke-dasharray=".6 .7"')
      + dark(hline(.5 * T, -9, 9), .4, .3) + P(poly([[-15, -(T + 9)], [15, -(T + 9)], [15, -(T - 1)], [5, -(T + 1)], [0, -(T - 2.4)], [-5, -(T + 1)], [-15, -(T - 1)]]), tone('stab', 1)),
    back: P(curve([[-9.6, -.92 * T], [9.6, -.92 * T], [9, -(lo + .04 * T)], [-9, -(lo + .04 * T)]], true, .12), K.mixHex(tone('stab', 0), tone('stab', 1), .6), `stroke="${EDGE}" stroke-width="1.6"`) + dark(hline(.5 * T, -9, 9), .4, .3) });
  const tyre = (cx, cy, rx, ry) => `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="url(#m-tyre)" stroke="#000" stroke-width=".35" stroke-opacity=".7"/>` + L([-2, -1, 0, 1, 2].map(j => `M${pt(cx - rx * .9, cy + j * ry * .42)} L${pt(cx + rx * .9, cy + j * ry * .42 - ry * .12)}`).join(' '), '#050505', .5)
    + L(`M${pt(cx - rx * .3, cy - ry * .75)} L${pt(cx + rx * .3, cy - ry * .75)}`, ROPE, .4);
  K.tlayer('t.tyre' + sfx, { out: armOut, mat: 'canvas', D: Bv * 1.02, x1: -9.1 * Bv, x2: 9.8 * Bv, body: L(K.outPath(armOut), '#000', 1.5, 'stroke-opacity=".6"') + [.3, .53, .76].map(a => [-6.6, -2.6, 2.6, 6.6].map(s0 => tyre(s0 * Bv, -a * T, 2.55 * Bv, .115 * T)).join('')).join(''),
    front: [.3, .53, .76].map(a => [-7.6, -2.6, 2.6, 7.6].map(x => tyre(x, -a * T, 2.5, .115 * T)).join('')).join('') + dark(`M-15,${f(-(T + .2))} Q0,${f(-(T - 2.6))} 15,${f(-(T + .2))}`, .5, .5),
    back: [.3, .53, .76].map(a => [-7.6, -2.6, 2.6, 7.6].map(x => tyre(x, -a * T, 2.5, .115 * T)).join('')).join('') }); }
  // the rust scarf: wound round his neck over the collar, one end hanging down his front
  const SC = 'url(#mx-scarf)', scWrap = P(curve(Q2([[T + 1.2, -4.8], [T + 4.4, -4.4], [T + 5.4, -.6], [T + 4.6, 4.0], [T + 1.6, 4.8], [T + .2, .2]]), true, .45), SC) + dark(`M${A2(T + .9, -2.2)} L${A2(T + 3.4, -1.6)} L${A2(T + 4.6, 1.6)} M${A2(T + .8, 1.6)} L${A2(T + 2.6, 2.6)} L${A2(T + 3.6, 4.2)}`, .45, .45);
  K.tdeco('t.scarf', '', { svgN: P(K.stripD(Q2([[T + 1.4, 3.6], [.93 * T, 6.2], [.8 * T, 7.2], [.7 * T, 7.5]]), 3.4), tone('scarf', 1)) + dark(`M${A2(.92 * T, 6.1)} L${A2(.72 * T, 7.3)}`, .35, .3) + scWrap,
    front: `<rect x="-15" y="${f(-(T + 5.6))}" width="30" height="5" fill="${tone('scarf', 2)}"/>` + dark(`M-15,${f(-(T + 3.2))} Q0,${f(-(T + 1.8))} 15,${f(-(T + 3.6))} M-15,${f(-(T + .7))} L15,${f(-(T + .7))}`, .45, .45),
    back: `<rect x="-15" y="${f(-(T + 5.6))}" width="30" height="5" fill="${tone('scarf', 0)}"/>` + dark(`M-15,${f(-(T + 3))} Q0,${f(-(T + 2))} 15,${f(-(T + 3.2))}`, .45, .45) });

  // ---------- the arm he has left, in what he wears ----------
  // the work shirt's sleeve rolled to the elbow over it
  { const Qs = [[-4.5, .01, .01], [-3.5, 3.1, 3.0], [-1.6, 4.5, 4.4], [.6, 4.8, 4.6], [8, 4.6, 4.4], [.76 * e, 4.3, 4.2], [.79 * e, 4.9, 4.8], [.93 * e, 4.8, 4.7], [.95 * e, 3.1, 3.3], ...K.BARE.filter(r => r[0] > e + 1)];
    def('arm.rolled', K.stripBox(Qs, 2.4), P(K.stripPath(K.BARE), mat('skin')) + `<clipPath id="ba"><path d="${K.stripPath(K.BARE)}"/></clipPath><g clip-path="url(#ba)">${K.scarArm}</g>`
      + P(curve([[-4.5, 0], [-3.5, 3.1], [-1.6, 4.5], [.6, 4.8], [8, 4.6], [.78 * e, 4.3], [.78 * e, -4.2], [8, -4.4], [.6, -4.6], [-1.6, -4.4], [-3.5, -3]], true, .4), mat('shirt')) + P(poly([[.78 * e, -4.8], [.94 * e, -4.7], [.94 * e, 4.8], [.78 * e, 4.9]]), mat('shirt')) + dark(`M${pt(.86 * e, -4.7)} L${pt(.86 * e, 4.8)} M${pt(.78 * e, -4.8)} L${pt(.78 * e, 4.9)}`, .4, .5) + dark(`M3,-1 C8,-2 13,-1.6 ${pt(.7 * e, -.6)}`, .4, .35), { prof: Qs, far: [['shirt', -9, .95 * e], [true, .95 * e, La + 9]] }); }
  // the jersey's sleeve to the wrist, a ribbed cuff, and the darn at the elbow
  { const Qs = [[-4.5, .01, .01], [-3.5, 2.8, 2.7], [-1.6, 4.1, 4.0], [.5, 4.45, 4.35], [8, 4.2, 4.1], [e - 6, 3.7, 3.6], [e, 3.5, 3.5], [e + 6, 3.25, 3.15], [La - 9, 2.95, 2.85], [La - 3.8, 3.2, 3.2], [La - 2.1, 3.2, 3.2]];
    K.strip('arm.jersey', Qs, 'jersey', dark(`M2,-.8 C${pt(e * .4, -1.8)} ${pt(e * .8, -1.6)} ${pt(e - 2, -.5)}`, .5, .4) + dark([-1.8, -.9, 0, .9, 1.8].map(i => `M${pt(e - 1.6 + i * .3, i - 1.2)} l3.2,2.4`).join(' '), .3, .5)
      + dark(`M${pt(La - 3.7, -3.4)} L${pt(La - 3.7, 3.4)}`, .35, .5) + dark([-2.7, -1.8, -.9, 0, .9, 1.8, 2.7].map(y => `M${pt(La - 3.6, y)} L${pt(La - 2.2, y)}`).join(' '), .3, .45)); }
  // the oilcloth coat's sleeve, too long and too wide, down over the wrist; the canvas jacket's to the wrist
  { const Qo = [[-4.8, .01, .01], [-3.6, 3.2, 3.1], [-1.6, 4.7, 4.6], [.6, 5.1, 5.0], [8, 4.9, 4.8], [e - 6, 4.4, 4.3], [e, 4.1, 4.1], [e + 6, 3.95, 3.9], [La - 8, 3.8, 3.75], [La - 3, 4.4, 4.4], [La - 1, 4.4, 4.4]];
    K.strip('arm.oil', Qo, 'coat', dark(`M2,-.8 C${pt(e * .4, -2)} ${pt(e * .8, -1.8)} ${pt(e - 2, -.5)}`, .5, .4) + dark(`M${pt(e - 3, -4)} q2.6,3 1.6,6.2 M${pt(e, -4)} q2.6,2.6 2.4,5.4 M${pt(e + 3.4, -3.9)} q1.8,1.8 2,3.8`, .55, .45) + lite(`M3,2.6 C${pt(e * .5, 3.4)} ${pt(e, 2.8)} ${pt(La - 6, 2.6)}`, .5, .1) + dark(`M${pt(La - 3, -4.4)} L${pt(La - 3, 4.4)}`, .4, .5));
    const Qc = [[-4.6, .01, .01], [-3.5, 2.9, 2.8], [-1.6, 4.3, 4.2], [.5, 4.65, 4.55], [8, 4.4, 4.3], [e - 6, 3.9, 3.8], [e, 3.7, 3.7], [e + 6, 3.4, 3.3], [La - 9, 3.1, 3.0], [La - 3.6, 3.4, 3.4], [La - 2.3, 3.4, 3.4]];
    K.strip('arm.canvas', Qc, 'canvas', dark(`M2,-.8 C${pt(e * .4, -1.8)} ${pt(e * .8, -1.6)} ${pt(e - 2, -.5)}`, .5, .4) + dark(`M${pt(e - 3, -3.6)} q2.2,2.6 1.4,5.4 M${pt(e, -3.6)} q2.4,2.2 2.2,4.6`, .5, .45) + dark(`M${pt(La - 3.6, -3.4)} L${pt(La - 3.6, 3.4)}`, .35, .5) + horn(La - 2.9, 2.2, .5)); }
  // on the hand (the grip at 0,0, +x down the hand): a strip of linen round the wrist; the grinder's gauntlet, split hide most of the way
  // to the elbow, its cuff flared, a seam down it
  def('cuff.wrap', [-10, -6, 14, 12], P(curve([[-6.9, -2.3], [-5.6, -3.0], [-2.2, -2.9], [-1.2, -2.1], [-1.2, 2.1], [-2.2, 2.9], [-5.6, 3.0], [-6.9, 2.3]], true, .35), mat('linen')) + dark('M-5.8,-2.9 L-5,2.9 M-4.4,-2.9 L-3.6,2.9 M-3,-2.9 L-2.2,2.9', .3, .32), { far: 'linen' });
  def('cuff.gauntlet', [-18, -7, 20, 14], P(curve([[-14.4, -4.5], [-8, -4.0], [-2.2, -3.5], [-2.2, 3.5], [-8, 4.0], [-14.4, 4.5]], true, .25), mat('hide')) + L('M-14,1.2 L-2.4,.9', '#000', .4, 'stroke-opacity=".5" stroke-dasharray="1 .8"') + dark('M-13.2,-4.6 L-13.2,4.6', .6, .55), { far: 'hide' });
  const fistQ = [[-3.9, 3.3], [.5, 4.0], [3.05, 4.5], [4.75, 1.85], [4.65, -1.7], [3.3, -3.65], [-3.4, -3.65], [-4.6, -.25]], openQ = [[-3.1, 2.8], [1.6, 3.1], [5.4, 2.8], [8.7, 2.0], [10.7, .7], [10.6, -1.0], [8.5, -2.1], [4.7, -2.8], [1.8, -3.25], [-.7, -4.8], [-2.7, -4.4], [-3.7, -.7]];
  const fistLines = dark('M1.9,-3.5 q.9,3 .2,6.9 M3.4,-3.3 q.8,2.6 .1,6.2 M.4,-3.6 q.8,3.2 .3,7.2', .35, .55) + L('M-3.4,3.2 Q0,4.4 3,4.3', RIM, .4, 'stroke-opacity=".5"'), openLines = dark('M5.1,1.3 L9.6,1 M5.1,-.1 L9.9,-.2 M5.1,-1.5 L9.4,-1.2', .4, .5);
  const HBx = [-7, -7, 20, 14];
  // (the fingerless glove: old leather over the palm, the fingers bare past the knuckles)
  def('hand.fist.glove', HBx, P(curve(fistQ, true, .35), mat('glove')) + P(poly([[2.2, -3.7], [4.9, -3], [4.9, 3], [2.4, 4.6]]), mat('skin')) + fistLines + dark('M2.3,-3.7 L2.5,4.5', .35, .5), { far: [['glove', -8, 2.3], [true, 2.3, 14]] });
  def('hand.open.glove', HBx, P(curve(openQ, true, .35), mat('skin')) + P(curve([[-3.1, 2.8], [1.6, 3.1], [4.6, 2.9], [4.6, -2.8], [1.8, -3.25], [-.7, -4.8], [-2.7, -4.4], [-3.7, -.7]], true, .3), mat('glove')) + openLines, { far: [['glove', -8, 4.6], [true, 4.6, 14]] });
  def('hand.fist.hide', HBx, P(curve(fistQ, true, .35), mat('hide')) + fistLines, { far: 'hide' });
  def('hand.open.hide', HBx, P(curve(openQ, true, .35), mat('hide')) + openLines, { far: 'hide' });

  // ---------- the near shoulder: the dressed stump, or the empty sleeve ----------
  // (the shoulder at 0,0, +x the way it hangs, +y his front)
  const stumpD = curve([[-1.2, -4.7], [1.6, -4.5], [4.4, -4.1], [7.2, -2.9], [8.5, 0], [7.2, 2.9], [4.4, 4.1], [1.6, 4.5], [-1.2, 4.7], [-4.5, 3.3], [-5.9, 0], [-4.5, -3.3]], true, .45);
  def('stump.band', [-8, -8, 20, 16], P(stumpD, mat('linen')) + L(stumpD, '#000', .5, 'stroke-opacity=".5"') + `<clipPath id="stc"><path d="${stumpD}"/></clipPath><g clip-path="url(#stc)">` + dark('M-.6,-5.4 L1.6,5.4 M.95,-5.4 L3.15,5.4 M2.5,-5.4 L4.7,5.4', .5, .34) + '</g>', { kind: 'band', stain: [6.6, 0, 1.6, 2.6] });
  def('stump.skin', [-8, -8, 20, 16], P(stumpD, mat('skin')) + L(stumpD, '#000', .5, 'stroke-opacity=".5"') + dark('M6.2,-2.9 Q7.6,0 6.2,2.9', .4, .5), { kind: 'band' });
  // the empty sleeve hanging from the shoulder, its foot folded up and held with Tamm's pin; or not pinned yet, all of it hanging
  const Lp = 18.2, Ll2 = 44, sleeveP = (Q, Lx, kq) => Q.map(([a, b]) => [a * Lx, b - kq * a * a]);
  const capD = curve([[-2.4, -4.8], [1.4, -4.6], [2.6, -3], [2.9, 0], [2.6, 3], [1.4, 4.6], [-2.4, 4.8], [-4.4, 2.6], [-4.8, 0], [-4.4, -2.6]], true, .45);
  for (const [m, name] of [['shirt', 'shirt'], ['jersey', 'jersey'], ['coat', 'coat'], ['canvas', 'canvas']]) {
    const Qp = sleeveP([[0, 4.6], [.3, 3.9], [.62, 3.2], [.9, 2.7], [1, 1], [1.01, -1], [.92, -2.5], [.62, -3.1], [.3, -3.9], [0, -4.6]], Lp, .9), at2 = (a, b) => pt(a * Lp, b - .9 * a * a), dP = curve(Qp, true, .35);
    def('sleeve.pin.' + name, [-7, -9, 30, 18], P(dP, mat(m)) + P(capD, mat(m)) + L(dP, '#000', .55, 'stroke-opacity=".6"') + `<clipPath id="sp"><path d="${dP}"/></clipPath><g clip-path="url(#sp)">`
      + dark(`M${at2(.58, 3.4)} Q${at2(.66, 0)} ${at2(.6, -3.3)}`, .6, .6) + L(`M${at2(.53, 3.4)} Q${at2(.61, 0)} ${at2(.55, -3.3)}`, RIM, .4, 'stroke-opacity=".3"') + dark(`M${at2(.14, 1.8)} L${at2(.5, .6)} M${at2(.2, -1.6)} L${at2(.48, -.4)} M${at2(.7, 1.6)} L${at2(.94, .4)}`, .45, .4) + '</g>'
      + L(`M${at2(.5, 1.4)} L${at2(.66, .9)}`, PIN, .8) + `<circle cx="${f(.5 * Lp)}" cy="${f(1.4 - .9 * .25)}" r=".9" fill="${PIN}"/>`, { kind: 'sleeve' });
    const Ql = sleeveP([[0, 4.6], [.3, 3.6], [.6, 2.9], [.9, 2.5], [1, 1.8], [1.02, -.4], [.98, -2.2], [.6, -2.8], [.3, -3.8], [0, -4.6]], Ll2, 2.2), al = (a, b) => pt(a * Ll2, b - 2.2 * a * a), dL = curve(Ql, true, .35);
    def('sleeve.loose.' + name, [-7, -10, 56, 20], P(dL, mat(m)) + P(capD, mat(m)) + L(dL, '#000', .5, 'stroke-opacity=".6"') + `<clipPath id="sl"><path d="${dL}"/></clipPath><g clip-path="url(#sl)">`
      + dark(`M${al(.1, 1.6)} L${al(.4, .4)} M${al(.3, -1.4)} L${al(.62, -.2)} M${al(.66, 1.2)} L${al(.86, .2)} M${al(.92, 2)} L${al(.94, -2)}`, .45, .4) + '</g>', { kind: 'sleeve' });
  }

  // ---------- legs and feet ----------
  // the linen trousers: no crease, the cloth loose at the knee, the hem rough
  K.strip('leg.soot', K.LEG, 'soot', dark(`M3,-1 C${pt(kn * .5, -2.4)} ${pt(kn - 4, -1)} ${pt(kn, -.4)} M${pt(kn + 3, 1.4)} C${pt(kn + 12, .6)} ${pt(Ll - 14, 1)} ${pt(Ll - 4, .4)}`, .45, .4)
    + dark(`M${pt(kn - 3.6, -4.2)} q3,2.6 2.4,6 M${pt(kn - .4, -4.1)} q2.8,2.4 2.6,5.2 M${pt(kn + 3, -3.9)} q1.8,1.6 2,3.4 M${pt(kn - 6, 4.4)} q-1,-2.4 1,-4`, .5, .45) + dark(`M${pt(Ll - 3.4, -3.4)} L${pt(Ll - 3.4, 3.4)}`, .35, .5));
  // the shin guard: tyre rubber strapped on from under the knee to the top of the boot (its top at 0,0, +x down the shin, +y the front)
  { const Lg = 30.8; def('shin.guard', [-2, -6, Lg + 4, 12], P(curve([[0, -3.3], [Lg * .3, -3.5], [Lg, -3.0], [Lg, 3.0], [Lg * .3, 3.5], [0, 3.3]], true, .2), mat('shin')) + L((() => { let d = ''; for (let t = .3; t < .72; t += .1) d += `M${pt(Lg * t, 4)} L${pt(Lg * t + .8, -4)} `; return d; })(), '#050505', .5)
      + [.14, .84].map(t => `<rect x="${f(Lg * t - .85)}" y="-4.6" width="1.7" height="9.2" rx=".5" fill="url(#m-band)"/>`).join(''), { far: 'shin', len: Lg }); }
  // the boots' shafts up the shin, the trousers tucked into them (the ankle at 0,0, +x up the shin, +y the front)
  def('shaft.boot', [-3, -6, 14, 12], P(curve([[-.6, -3.6], [7.4, -3.8], [7.4, 3.9], [-.6, 3.7]], true, .2), mat('boot')) + dark('M7.3,-3.9 L7.3,3.9', .7, .55) + L([1.6, 3.6, 5.6].map(x => `M${pt(x, 3)} l.8,-1.4`).join(' '), ROPE, .38), { far: 'boot' });
  def('shaft.dock', [-3, -6, 16, 12], P(curve([[-.6, -4.1], [9.6, -4.4], [9.6, 4.4], [-.6, 4.2]], true, .2), mat('dock')) + dark('M9.2,-4.4 L9.2,4.4', .7, .55) + L([1.6, 3.6, 5.6, 7.6].map(x => `M${pt(x, 3.4)} l.8,-1.4`).join(' '), ROPE, .38), { far: 'dock' });
  // the feet. S: from the side (the ankle at 0,0, +x to the toe, +y to the sole); F: toe on; B: from behind
  const footS = curve([[-3.4, 3.2], [-3.9, 1.4], [-3.6, -.6], [-1.7, -2.3], [.8, -2.2], [2.6, -1.4], [6.4, .4], [9.6, 1.3], [11.8, 2.3], [12.1, 3.1], [11, 3.3], [3, 3.35]], true, .4);
  const footF = curve([[-2.7, -2.4], [2.7, -2.4], [3.5, -.4], [4.0, 1.6], [3.8, 3.2], [0, 3.5], [-3.8, 3.2], [-4.0, 1.6], [-3.5, -.4]], true, .4), footB = curve([[-2.6, -2.4], [2.6, -2.4], [3.1, .4], [3.1, 3.2], [0, 3.45], [-3.1, 3.2], [-3.1, .4]], true, .4);
  const SB = [-6, -5, 21, 11], FB = [-7, -5, 14, 11];
  for (const [kind, m, steel] of [['boot', 'boot', false], ['dock', 'dock', true]]) {
    const st = steel ? P(poly([[7.3, 3.2], [11.1, 3.15], [11.9, 2.4], [11.2, 1.4], [9.4, 1.0], [7.6, 1.4]]), 'url(#steel)', 'fill-opacity=".6"') + L('M7.6,1.4 L7.3,3.1', '#000', .3, 'stroke-opacity=".55"') + [-2.6, -.9, .8, 2.5, 4.2, 5.9, 7.6, 9.3].map(x => `<circle cx="${x}" cy="3.5" r=".24" fill="#5a5852"/>`).join('') : '';
    def('shoe.' + kind + '.S', SB, P(footS, mat(m)) + P(poly([[-3.6, 2.2], [11.8, 2.35], [11.5, 3.5], [-3.6, 3.5]]), '#0c0907') + P(poly([[-3.7, 2.15], [-.2, 2.15], [-.3, 3.5], [-3.7, 3.5]]), '#080605') + L('M-3.5,2.2 L11.6,2.35', '#7a5c3e', .5, 'stroke-opacity=".85"')
      + dark('M7.4,.7 Q8,1.9 8.7,2.3', .38, .55) + L([0, .5, 1].map(t => `M${pt(1.8 + 3.8 * t - .3, -1.7 + 1.7 * t - .8)} l.6,1.7`).join(' '), ROPE, .4) + st + L('M2.6,-1.4 C5.4,-.2 9.4,.9 11.6,2.1', RIM, .4, 'stroke-opacity=".5"'), { far: m });
    def('shoe.' + kind + '.F', FB, P(footF, mat(m, true)) + P(poly([[-3.9, 2.35], [3.9, 2.35], [3.8, 3.5], [-3.8, 3.5]]), '#0c0907') + L('M-3.75,2.3 L3.75,2.3', '#7a5c3e', .55, 'stroke-opacity=".85"') + dark('M-3.1,1.1 Q0,-.8 3.1,1.1', .4, .55)
      + (steel ? P(poly([[-3.5, 1.2], [3.5, 1.2], [3.8, 2.3], [-3.8, 2.3]]), 'url(#steel)', 'fill-opacity=".6"') + [-3, -1.5, 0, 1.5, 3].map(x => `<circle cx="${x}" cy="2.9" r=".24" fill="#5a5852"/>`).join('') : '') + L('M-1.3,-2.2 L1.3,-1.4 M1.3,-2.2 L-1.3,-1.4 M-1.3,-1 L1.3,-.2 M1.3,-1 L-1.3,-.2', ROPE, .38), { far: m });
    def('shoe.' + kind + '.B', FB, P(footB, mat(m, true)) + P(poly([[-3.2, 2.35], [3.2, 2.35], [3.1, 3.5], [-3.1, 3.5]]), '#080605') + L('M-3.1,2.3 L3.1,2.3', '#7a5c3e', .5, 'stroke-opacity=".85"') + dark('M0,-2.2 L0,2.2 M-2.4,.6 Q0,1.4 2.4,.6', .35, .5), { far: m });
  }
  // his bare feet: the toes, the ankle bone; the rope sandals: a sole under the foot, a strap over the toes and one round the ankle
  const toes = y0 => [[0, 1.05], [1, .82], [2, .74], [3, .66], [4, .57]].map(([i, r]) => `<ellipse cx="${f(-(2.5 - i * 1.27) - (i ? 0 : .1))}" cy="${f(y0 + (1 - r) * .7)}" rx="${f(r * .76)}" ry="${f(r * .98)}" fill="${tone('skin', 2)}" stroke="#000" stroke-width=".18" stroke-opacity=".5"/>`).join('');
  const bareF = curve([[-2.2, -2.4], [2.2, -2.4], [2.8, -.5], [3.4, 1.3], [3.3, 2.9], [2.6, 3.4], [-2.6, 3.4], [-3.3, 2.9], [-3.4, 1.3], [-2.8, -.5]], true, .4);
  def('shoe.bare.S', SB, P(footS, mat('skin')) + dark('M9.8,1.1 L10.4,2.9 M10.9,1.5 L11.4,3', .28, .5) + `<ellipse cx="-.6" cy="-1.4" rx=".9" ry=".7" fill="${RIM}" fill-opacity=".25"/>` + L('M2.6,-1.4 C5.4,-.2 9.4,.9 11.6,2.1', RIM, .35, 'stroke-opacity=".4"'), far);
  def('shoe.bare.F', FB, P(bareF, mat('skin', true)) + toes(2.45) + L('M-1.6,-1.6 L-2.1,-.6', RIM, .35, 'stroke-opacity=".3"'), far);
  def('shoe.bare.B', FB, P(footB, mat('skin', true)) + dark('M-1.4,-2.2 Q0,.6 -1,3 M1.4,-2.2 Q0,.6 1,3', .3, .35), far);
  def('shoe.sandal.S', SB, P(footS, mat('skin')) + L('M-3.4,3.3 L11.3,3.3', ROPE, 1.4) + dark([-2.8, -1.2, .4, 2, 3.6, 5.2, 6.8, 8.4, 10].map(x => `M${pt(x, 3.8)} l.8,-1.1`).join(' '), .25, .35) + L('M3.4,-1.3 L4.6,2.8', ROPE, .6) + L('M8.4,1.2 L9.2,3 M-2.2,-.2 L2.2,-.6', ROPE, .7) + dark('M10.2,1.3 L11.2,2.7', .3, .45), far);
  def('shoe.sandal.F', FB, P(poly([[-3.8, 2.6], [3.8, 2.6], [3.8, 3.5], [-3.8, 3.5]]), ROPE) + P(bareF, mat('skin', true)) + toes(1.9) + L('M-3.4,-.6 L3.4,-.6', ROPE, .6) + L('M-3.3,1.05 L3.3,1.05', ROPE, .5), far);
  def('shoe.sandal.B', FB, P(footB, mat('skin', true)) + P(poly([[-3.3, 2.7], [3.3, 2.7], [3.2, 3.5], [-3.2, 3.5]]), ROPE) + L('M-2.8,-.4 L2.8,-.4', ROPE, .6), far);
})();
