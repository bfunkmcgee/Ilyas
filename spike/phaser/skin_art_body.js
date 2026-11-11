// ===== ILYAS, THE PROLOGUE'S PIECES (art for the skinned-figure test) =====
// The long coat over the suit, and what is under it when the coat is gone: the vest, his bare arms and their tattoos. Limbs,
// hands, shoes, the torso's layers, the coat's skirt and its lining, what is left when the arm is torn away. See skin_kit.js for
// the frames each kind of piece is drawn in.
(() => {
  const K = SkinArt, { def, f, pt, P, L, poly, curve, vine, mat, tone, GOLD, TEAL, GLOW } = K, R = K.rest, T = R.torso;
  const far = { far: true };
  // ---------- limbs ----------
  // a strip: its outline filled with a material, what is drawn on it kept inside the outline
  K.strip = (name, prof, m, body, meta = {}) => def(name, K.stripBox(prof, 2.4), `<clipPath id="sc"><path d="${K.stripPath(prof)}"/></clipPath>` + (m ? P(K.stripPath(prof), mat(m)) : '') + `<g clip-path="url(#sc)">${body}</g>` + (meta.over || ''), Object.assign({ prof, far: K.FARC[m] ? m : true }, meta));
  const La = R.ua + R.fa, e = R.ua, Ll = R.th + R.sh, kn = R.th;
  // short dark creases where a sleeve or a trouser leg gathers at the joint, and the lit edge of one
  const folds = (u, w, n = 3) => { let d = ''; for (let i = 0; i < n; i++) { const x = u - 3 + i * 2.8; d += `M${pt(x, -w)} q${pt(2.3 - i * .3, w * .7)} ${pt(1.5 - i * .2, w * (1.5 - i * .15))} `; } return L(d, '#000', .5, 'stroke-opacity=".5"') + L(`M${pt(u - 2.4, w)} q${pt(-.7, -w * .5)} ${pt(.8, -w * .9)}`, '#6a6488', .35, 'stroke-opacity=".6"'); };
  // the suit's sleeve: tailored, a gilt band and a vine above the cuff, a sliver of shirt at the wrist
  K.ARM = [[-4.5, .01, .01], [-3.5, 2.7, 2.6], [-1.6, 4.0, 3.9], [.5, 4.35, 4.25], [8, 4.15, 4.0], [e - 6, 3.65, 3.5], [e, 3.45, 3.4], [e + 6, 3.2, 3.1], [La - 10, 2.85, 2.75], [La - 4.2, 2.65, 2.6]];
  K.strip('arm.suit', K.ARM, 'wool', `
    ${L(`M2,-.8 C${pt(e * .4, -1.8)} ${pt(e * .8, -1.6)} ${pt(e - 2, -.5)}`, '#000', .5, 'stroke-opacity=".45"')}${folds(e, 3.4)}
    <rect x="${f(La - 8.4)}" y="-4" width=".7" height="8" fill="${GOLD}"/><rect x="${f(La - 5.6)}" y="-4" width=".7" height="8" fill="${GOLD}"/>
    ${vine([[La - 7.2, -2.5], [La - 7.2, 2.6]], { step: 1.5, leaf: 1.2, wide: .5, sw: .28 })}`,
    { over: P(poly([[La - 4.4, -2.5], [La - 2.7, -2.4], [La - 2.7, 2.45], [La - 4.4, 2.55]]), mat('shirtn')) + L(`M${pt(La - 4.4, -2.5)} L${pt(La - 4.4, 2.55)}`, '#000', .3, 'stroke-opacity=".6"') });
  // a bare arm: the shoulder's swell, the upper arm and the forearm; the tattoos down it (their light, or drained to scars)
  K.BARE = [[-4.5, .01, .01], [-3.4, 3.0, 2.9], [-1.4, 4.4, 4.2], [1.6, 4.8, 4.5], [7, 4.5, 4.1], [12, 4.3, 4.4], [18, 3.6, 3.8], [e - 2, 3.05, 3.25], [e, 2.95, 3.15], [e + 4.5, 3.45, 3.3], [e + 9.5, 3.2, 2.9], [La - 9, 2.55, 2.35], [La - 3.2, 2.15, 2.05]];
  const muscle = L(`M${pt(3, 1)} C${pt(8, 3.2)} ${pt(13, 3)} ${pt(17, .6)} M${pt(6, -3.6)} C${pt(11, -2)} ${pt(16, -2.6)} ${pt(e - 3, -1.4)} M${pt(e + 2, 2.4)} C${pt(e + 7, 1.6)} ${pt(e + 12, 1.2)} ${pt(La - 8, .6)}`, '#000', .5, 'stroke-opacity=".42"')
    + L(`M${pt(2.5, 3.4)} C${pt(8, 4.2)} ${pt(13, 3.9)} ${pt(17, 2.6)} M${pt(e + 3, 3)} C${pt(e + 8, 2.9)} ${pt(e + 12, 2.2)} ${pt(La - 8, 1.7)}`, '#8a7a90', .3, 'stroke-opacity=".5"');
  // the tattoo: a stem winding down the arm with barbs off it, and a ring at the shoulder, above the elbow and at the wrist
  const tatD = (() => { let d = `M${pt(1, -1.6)}`; const Q = []; for (let u = 1; u <= La - 7; u += 1.2) Q.push([u, 1.5 * Math.sin(u * .42) * (u < e ? 1 : .8)]); d = curve(Q);
    for (let i = 3; i < Q.length - 2; i += 3) { const q = Q[i], sg = i % 2 ? 1 : -1; d += ` M${pt(q[0], q[1])} l${pt(1.5, sg * 1.5)} M${pt(q[0] + .4, q[1])} l${pt(-.9, sg * 1.1)}`; }
    for (const [u, w] of [[4.5, 4.3], [e - 5, 3.3], [La - 8.5, 2.4]]) d += ` M${pt(u, -w)} Q${pt(u + 1.3, 0)} ${pt(u, w)} M${pt(u + 1.2, -w)} Q${pt(u + 2.5, 0)} ${pt(u + 1.2, w)}`; return d; })();
  const band = P(poly([[La - 5.9, -2.9], [La - 4.2, -2.85], [La - 4.2, 2.8], [La - 5.9, 2.9]]), mat('band')) + `<rect x="${f(La - 5.3)}" y="-3" width=".45" height="6" fill="${GOLD}"/>`;
  K.strip('arm.bare', K.BARE, 'skin', muscle + L(tatD, GLOW, 1.3, 'stroke-opacity=".5" filter="url(#soft)"') + L(tatD, '#b9fff4', .42) + band);
  K.strip('arm.scar', K.BARE, 'skin', muscle + L(tatD, '#5f4c56', .75, 'stroke-opacity=".8"') + L(tatD, '#a88c8a', .34, 'stroke-opacity=".85"') + band);
  K.scarArm = muscle + L(tatD, '#5f4c56', .75, 'stroke-opacity=".8"') + L(tatD, '#a88c8a', .34, 'stroke-opacity=".85"');
  K.strip('arm.pbare', K.BARE, 'skin', K.scarArm);
  K.strip('arm.glow', K.BARE, null, L(tatD, GLOW, 2.2, 'filter="url(#soft2)"') + L(tatD, '#d9fffa', .6), { far: false });
  // ---------- hands (the grip at 0,0; +x down the hand; +y the thumb's side) ----------
  const fistQ = [[-3.9, 3.3], [.5, 4.0], [3.05, 4.5], [4.75, 1.85], [4.65, -1.7], [3.3, -3.65], [-3.4, -3.65], [-4.6, -.25]], openQ = [[-3.1, 2.8], [1.6, 3.1], [5.4, 2.8], [8.7, 2.0], [10.7, .7], [10.6, -1.0], [8.5, -2.1], [4.7, -2.8], [1.8, -3.25], [-.7, -4.8], [-2.7, -4.4], [-3.7, -.7]];
  const hand = (name, Q, m, lines, extra = '') => def(name, [-7, -7, 20, 14], P(curve(Q, true, .35), mat(m)) + lines + extra, far);
  const fistLines = L('M1.9,-3.5 q.9,3 .2,6.9 M3.4,-3.3 q.8,2.6 .1,6.2 M.4,-3.6 q.8,3.2 .3,7.2', '#000', .35, 'stroke-opacity=".55"') + L('M-3.4,3.2 Q0,4.4 3,4.3', K.RIM, .4, 'stroke-opacity=".55"');
  const openLines = L('M5.1,1.3 L9.6,1 M5.1,-.1 L9.9,-.2 M5.1,-1.5 L9.4,-1.2', '#000', .4, 'stroke-opacity=".5"') + L('M-2.8,2.7 Q2,3.6 8.6,2.1', K.RIM, .4, 'stroke-opacity=".5"');
  hand('hand.fist', fistQ, 'skin', fistLines, `<rect x=".4" y="2.5" width="1.5" height="1.3" rx=".3" fill="${GOLD}"/>`);
  hand('hand.open', openQ, 'skin', openLines);
  // ---------- legs and shoes ----------
  K.LEG = [[-6, .01, .01], [-4.7, 3.6, 3.6], [-2, 5.6, 5.6], [1, 6.1, 6.1], [10, 5.7, 5.8], [kn - 8, 4.8, 4.9], [kn, 4.3, 4.35], [kn + 7, 3.9, 4.5], [kn + 16, 3.6, 4.1], [Ll - 10, 3.4, 3.5], [Ll - 2.6, 3.3, 3.3]];
  K.strip('leg.suit', K.LEG, 'wool', `
    ${L(`M2,1.7 C${pt(kn * .5, 1.6)} ${pt(kn, 1.2)} ${pt(Ll - 3, .9)}`, '#5c5678', .4, 'stroke-opacity=".8"')}${L(`M2,1.1 C${pt(kn * .5, 1)} ${pt(kn, .6)} ${pt(Ll - 3, .3)}`, '#000', .4, 'stroke-opacity=".5"')}${folds(kn, 4.2)}
    ${P(poly([[Ll - 5.2, -4], [Ll - 2, -4], [Ll - 2, 4], [Ll - 5.2, 4]]), '#1b1826')}${L(`M${pt(Ll - 5.2, -4)} L${pt(Ll - 5.2, 4)}`, '#000', .35, 'stroke-opacity=".7"')}`);
  // the shoe: a slim black Oxford, a toe cap, a gilt heel plate. S: from the side (the ankle at 0,0, +x to the toe, +y to the sole);
  // F: toe on (the ankle at 0,0 as seen, +y down); B: from behind
  const shoeD = curve([[-3.4, 3.2], [-3.9, 1.4], [-3.6, -.6], [-1.7, -2.3], [.8, -2.2], [2.6, -1.4], [6.4, .4], [9.6, 1.3], [11.8, 2.3], [12.1, 3.1], [11, 3.3], [3, 3.35]], true, .4);
  def('shoe.ox.S', [-6, -5, 21, 11], P(shoeD, mat('leather')) + P(poly([[-3.7, 2.75], [12, 2.75], [11.8, 3.5], [-3.6, 3.5]]), '#000') + L('M7.4,.7 q-1,1.3 -.6,2.1', '#5c5678', .35)
    + L('M2.6,-1.4 C5.4,-.2 9.4,.9 11.6,2.1', K.RIM, .4, 'stroke-opacity=".75"') + L('M8.4,1.2 q1.5,.3 2.4,1', '#fff', .5, 'stroke-opacity=".45"') + P(poly([[-3.9, 1.4], [-1.5, 1.4], [-1.5, 2.75], [-3.8, 2.75]]), GOLD), far);
  def('shoe.ox.F', [-7, -5, 14, 11], P(curve([[-2.7, -2.4], [2.7, -2.4], [3.5, -.4], [4.0, 1.6], [3.8, 3.2], [0, 3.5], [-3.8, 3.2], [-4.0, 1.6], [-3.5, -.4]], true, .4), mat('leather', true)) + P(poly([[-3.9, 2.7], [3.9, 2.7], [3.8, 3.5], [-3.8, 3.5]]), '#000')
    + L('M-3.1,1.1 Q0,-.8 3.1,1.1', '#5c5678', .35) + L('M-1.6,1.9 Q0,1.2 1.6,1.9', '#fff', .5, 'stroke-opacity=".4"') + L('M2.7,-2.3 Q3.9,.4 3.9,2.4', K.RIM, .4, 'stroke-opacity=".6"'), far);
  def('shoe.ox.B', [-7, -5, 14, 11], P(curve([[-2.6, -2.4], [2.6, -2.4], [3.1, .4], [3.1, 3.2], [0, 3.45], [-3.1, 3.2], [-3.1, .4]], true, .4), mat('leather', true)) + P(poly([[-3.2, 2.7], [3.2, 2.7], [3.1, 3.5], [-3.1, 3.5]]), '#000')
    + L('M0,-2.2 L0,2.6', '#000', .35, 'stroke-opacity=".6"') + P(poly([[-2.2, 1.3], [2.2, 1.3], [2.3, 2.7], [-2.3, 2.7]]), GOLD) + L('M2.6,-2.3 Q3.2,.4 3.1,2.4', K.RIM, .4, 'stroke-opacity=".5"'), far);
  // the neck: in shadow under the jaw (the chest point at 0,0, up the neck toward -y, +x his front)
  def('neck', [-6, -16, 12, 20], P(poly([[-3.3, 2.5], [-3.0, -11.5], [3.1, -11.5], [3.45, 2.5]]), mat('skin', true)) + P(poly([[-3.3, 2.5], [-3.0, -11.5], [.2, -11.5], [-.4, 2.5]]), '#000', 'fill-opacity=".35"') + L('M3.4,2 L3.1,-11', K.RIM, .4, 'stroke-opacity=".35"'));

  // ---------- the torso's layers ----------
  const TB = [-15, -(T + 8), 30, T + 21];
  const ugrad = (id, m, x1, x2) => { const st = K.MATS[m]; return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="0" x2="${x2}" y2="0"><stop offset="0" stop-color="${st[0]}"/><stop offset=".42" stop-color="${st[1]}"/><stop offset=".8" stop-color="${st[2]}"/><stop offset="1" stop-color="${st[3]}"/></linearGradient>`; };
  // a layer that covers him from its back edge to its front: its outline filled with a material, what is on it kept inside it, and the
  // same material run out past the outline (bleed) for when the layer is wrapped round him
  // a panel's cloth (the front or the back of a layer, square on): at its edges the tone the side's drawing has where the two meet,
  // and across the middle of it a little more of the light on his front, a little less on his back
  K.panTone = (m, front, mid) => { const st = K.MATS[m]; return front ? (mid ? K.mixHex(st[2], st[3], .3) : st[2]) : K.mixHex(st[0], st[1], mid ? .2 : .44); };
  K.pgrad = (id, m, front) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="-10" y1="0" x2="10" y2="0"><stop offset="0" stop-color="${K.panTone(m, front)}"/><stop offset=".5" stop-color="${K.panTone(m, front, true)}"/><stop offset="1" stop-color="${K.panTone(m, front)}"/></linearGradient>`;
  K.tlayer = (name, o) => { const g = `<defs>${ugrad('tg', o.mat, o.x1 ?? -10, o.x2 ?? 10.5)}<clipPath id="tc"><path d="${K.outPath(o.out)}"/></clipPath></defs>`;
    let a0 = 1e9, a1 = -1e9; for (const q of [...o.out.back, ...o.out.front]) { a0 = Math.min(a0, q[0]); a1 = Math.max(a1, q[0]); }
    // (its front and its back square on: the cloth in the tone the side has where the panel meets it, and what is drawn on it. The
    // front is drawn as the viewer sees it, his near side on the left; the back with his near side on the right)
    const pan = (front, body) => `<defs>${K.pgrad('pg', o.mat, front)}</defs><rect x="${TB[0]}" y="${f(-a1)}" width="${TB[2]}" height="${f(a1 - a0)}" fill="url(#pg)"/>` + body;
    return def(name, TB, g + P(K.outPath(o.out), 'url(#tg)') + `<g clip-path="url(#tc)">${o.body || ''}</g>` + (o.over || ''),
      { kind: 'torso', out: o.out, D: o.D || 1, svgN: o.near ? `<g clip-path="url(#tc)">${o.near}</g>` : (o.nearOver || undefined), svgP: o.prof ? `<g clip-path="url(#tc)">${o.prof}</g>` : undefined, trim: o.trim, bleed: g + `<rect x="${TB[0]}" y="${f(-a1)}" width="${TB[2]}" height="${f(a1 - a0)}" fill="url(#tg)"/>`,
        front: o.frontRaw ?? (o.front != null ? pan(true, o.front) : undefined), back: o.backRaw ?? (o.back != null ? pan(false, o.back) : undefined) }); };
  // something on the torso that does not cover it (a belt, a scarf, a dressing): drawn over the layers under it
  K.tdeco = (name, svg, meta = {}) => def(name, TB, svg, Object.assign({ kind: 'deco' }, meta));
  K.mixHex = (a, b, u) => { const h = x => [1, 3, 5].map(i => parseInt(x.slice(i, i + 2), 16)), A = h(a), B = h(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * u).toString(16).padStart(2, '0')).join(''); };
  K.TB = TB; K.ugrad = ugrad;
  const A2 = (a, s) => pt(s, -a), Q2 = list => list.map(q => [q[1], -q[0]]);   // [a up the spine, s across] to the drawing's x, y
  K.A2 = A2; K.Q2 = Q2;
  const D = 1.07;
  // the coat's body over the suit
  const coatOut = { back: [[-.17 * T, -6.6], [-.12 * T, -8.6], [0, -9.5], [.18 * T, -7.9], [.4 * T, -6.5], [.55 * T, -7.5], [.8 * T, -9.2], [.97 * T, -6.4], [T + 1.4, -4.3], [T + 3.4, -4.0]], top: [[T + 4.7, -2.6], [T + 4.9, .6]],
    front: [[T + 3.5, 3.3], [T + 1.2, 4.5], [.92 * T, 8.1], [.8 * T, 10], [.64 * T, 10], [.48 * T, 8.45], [.33 * T, 7.5], [.2 * T, 7.8], [.05 * T, 7.9], [-.11 * T, 5.4], [-.165 * T, 1.6]] };
  K.coatOut = coatOut;
  // the vine: from the collar down the front edge and round the hem to the back (drawn on him as a line, not in the drawings)
  const TRIM = [[T + .7, 3.9], [.92 * T, 7.3 * D], [.8 * T, 9.0 * D], [.64 * T, 9.0 * D], [.48 * T, 7.55 * D], [.33 * T, 6.65 * D], [.2 * T, 6.95 * D], [.05 * T, 7.05 * D], [-.1 * T, 5.1], [-.14 * T, 1.9], [-.143 * T, -.2], [-.146 * T, -2.3], [-.149 * T, -4.3], [-.15 * T, -6.3], [-.115 * T, -8.3]];
  // (shot up, it breaks into runs)
  const tornTrim = (Q, lv, seed) => { if (!lv) return [Q]; const Rn = rnd(seed + lv), cut = [0, .1, .2, .32, .45][lv], runs = []; let run = []; const fine = []; for (let i = 0; i < Q.length - 1; i++) for (let j = 0; j < 4; j++) fine.push([Q[i][0] + (Q[i + 1][0] - Q[i][0]) * j / 4, Q[i][1] + (Q[i + 1][1] - Q[i][1]) * j / 4]); fine.push(Q[Q.length - 1]);
    for (const q of fine) { if (Rn() < cut) { if (run.length > 2) runs.push(run); run = []; } else run.push(q); } if (run.length > 2) runs.push(run); return runs; };
  // (from the side: the collar, the side seam and the line of the back, the sleeve's shadow, the pocket)
  const coatBody = () => `
    ${P(poly(Q2([[T - 1.2, -4.4], [T + 3.0, -4.4], [T + 4.9, -2.4], [T + 5, .8], [T + 3.4, 3.6], [T + 1.0, 4.6], [T - .2, 2.3], [T + 1.8, .4], [T + 1.6, -2.4]])), '#1d1a28')}
    ${L(curve(Q2([[T + 1.4, -3.6], [T + 2.4, -1.6], [T + 2.3, 1.2], [T + 1.0, 3.6]])), GOLD, .5)}
    ${L(`M${A2(.84 * T, -1)} C${A2(.6 * T, -2.2)} ${A2(.3 * T, -1.4)} ${A2(-.13 * T, -1.6)}`, '#000', .45, 'stroke-opacity=".5"')}${L(`M${A2(.84 * T, -.3)} C${A2(.6 * T, -1.5)} ${A2(.3 * T, -.7)} ${A2(-.13 * T, -.9)}`, '#4a4466', .3, 'stroke-opacity=".5"')}
    <ellipse cx="-.6" cy="${f(-(T - 3.4))}" rx="4.6" ry="5.4" fill="#000" fill-opacity=".3" filter="url(#soft)"/>
    ${L(`M${A2(.1 * T, 0)} L${A2(.1 * T, 5)}`, '#000', .4, 'stroke-opacity=".5"')}${L(`M${A2(.44 * T, -4)} q2.5,1.2 5,.2 M${A2(.4 * T, 1)} q2.4,.9 4.4,-.2`, '#000', .4, 'stroke-opacity=".3"')}`;
  // (in profile only: the satin lapel along the front, the edge of the waistcoat and the tie beyond it, the pocket square, the buttons)
  const coatProf = `
    ${P(poly(Q2([[T + .9, 4.2], [.92 * T, 7.6 * D], [.8 * T, 9.4 * D], [.64 * T, 9.4 * D], [.48 * T, 7.9 * D], [.33 * T, 7.0 * D], [.40 * T, 5.0 * D], [.55 * T, 6.6 * D], [.72 * T, 7.0 * D], [.86 * T, 5.6 * D], [T + .2, 2.4]])), 'url(#m-satin)')}
    ${P(poly(Q2([[T + .5, 3.7], [.9 * T, 8.8], [.8 * T, 10.6], [.6 * T, 10.6], [.5 * T, 9.2], [.62 * T, 9.75], [.8 * T, 9.75], [.92 * T, 8.0]])), mat('tie', true))}
    ${(() => { const a0 = .66 * T; return P(poly(Q2([[a0, 5.4], [a0 + 2.6, 6.1], [a0 + 1.4, 6.9], [a0 + 3.0, 7.7], [a0, 8.4]])), TEAL) + L(`M${A2(a0, 5.2)} L${A2(a0, 8.7)}`, GOLD, .35); })()}
    <circle cx="${f(6.2 * D)}" cy="${f(-.33 * T)}" r=".9" fill="${GOLD}"/><circle cx="${f(6.5 * D)}" cy="${f(-.2 * T)}" r=".9" fill="${GOLD}"/>`;
  // (from the front: the coat open down the middle on the waistcoat and the tie, the satin facings either side of the opening, the
  // pocket square on his near side; the vines run down the two edges of the opening)
  const HEMA = -.128 * T;
  const coatFront = () => `
    ${P(poly([[-3.7, -(T + 3)], [3.7, -(T + 3)], [3.9, -HEMA + 3], [-3.9, -HEMA + 3]]), '#12131c')}${L(`M0,${f(-.78 * T)} L0,${f(-HEMA + 2)}`, '#000', .4, 'stroke-opacity=".6"')}
    ${[.7, .58, .46, .34, .22, .1].map(a => `<circle cx="0" cy="${f(-a * T)}" r=".62" fill="${GOLD}"/>`).join('')}
    ${P(poly([[-3.7, -(T + 2.2)], [3.7, -(T + 2.2)], [0, -.76 * T]]), '#2b2a3a')}${P(poly([[-.95, -(T + .8)], [.95, -(T + .8)], [1.15, -(T - 1.6)], [0, -.8 * T], [-1.15, -(T - 1.6)]]), mat('tie', true))}${L(`M0,${f(-(T - 2))} L0,${f(-.83 * T)}`, GLOW, .25, 'stroke-opacity=".6"')}
    ${P(poly([[-3.7, -(T + 2.6)], [-7.6, -.88 * T], [-5.6, -.82 * T], [-6.8, -.72 * T], [-3.9, -.36 * T], [-3.7, -.5 * T]]), 'url(#m-satin)')}${P(poly([[3.7, -(T + 2.6)], [7.6, -.88 * T], [5.6, -.82 * T], [6.8, -.72 * T], [3.9, -.36 * T], [3.7, -.5 * T]]), 'url(#m-satin)')}
    ${L(`M-3.75,${f(-(T + 2))} L-3.9,${f(-HEMA + 3)} M3.75,${f(-(T + 2))} L3.9,${f(-HEMA + 3)}`, '#000', .5, 'stroke-opacity=".7"')}
    ${P(poly([[-9.4, -.7 * T], [-6.4, -.7 * T], [-6.6, -.7 * T - 2.6], [-7.6, -.7 * T - 1.6], [-8.5, -.7 * T - 3], [-9.4, -.7 * T - 1.4]]), TEAL)}${L(`M-9.6,${f(-.7 * T)} L-6.2,${f(-.7 * T)}`, GOLD, .35)}
    ${L(`M5.4,${f(-.1 * T)} L10,${f(-.1 * T)} M-5.4,${f(-.1 * T)} L-10,${f(-.1 * T)}`, '#000', .4, 'stroke-opacity=".5"')}
    ${P(poly([[-15, -(T + 9)], [15, -(T + 9)], [15, -(T + 1.6)], [3.7, -(T + 2.6)], [0, -(T + 1.4)], [-3.7, -(T + 2.6)], [-15, -(T + 1.6)]]), '#1d1a28')}${L(`M-15,${f(-(T + 1.6))} L-3.7,${f(-(T + 2.6))} M3.7,${f(-(T + 2.6))} L15,${f(-(T + 1.6))}`, GOLD, .45)}`;
  // (from behind: the seam down the middle to the vent, the yoke, the half belt and its buttons)
  const coatBack = () => `
    ${L(`M0,${f(-(T + 1))} L0,${f(-.14 * T)}`, '#000', .45, 'stroke-opacity=".7"')}${L(`M.5,${f(-(T + 1))} L.5,${f(-.14 * T)}`, '#3a3552', .3, 'stroke-opacity=".5"')}
    ${P(poly([[0, -.14 * T], [.9, -HEMA + 4], [-.9, -HEMA + 4]]), '#000')}
    ${L(`M-15,${f(-.86 * T)} Q0,${f(-.78 * T)} 15,${f(-.86 * T)}`, '#000', .4, 'stroke-opacity=".5"')}
    ${P(poly([[-5.4, -.46 * T], [5.4, -.46 * T], [5.4, -.39 * T], [-5.4, -.39 * T]]), '#15131d', 'stroke="#000" stroke-width=".3" stroke-opacity=".6"')}<circle cx="-4.2" cy="${f(-.425 * T)}" r=".85" fill="${GOLD}"/><circle cx="4.2" cy="${f(-.425 * T)}" r=".85" fill="${GOLD}"/>
    ${P(poly([[-15, -(T + 9)], [15, -(T + 9)], [15, -(T + 1.2)], [0, -(T + .4)], [-15, -(T + 1.2)]]), '#1d1a28')}${L(`M-15,${f(-(T + 1.2))} L0,${f(-(T + .4))} L15,${f(-(T + 1.2))}`, GOLD, .45)}`;
  K.tlayer('t.coat', { out: coatOut, mat: 'wool', body: coatBody(), prof: coatProf, front: coatFront(), back: coatBack(), trim: [TRIM] });
  // shot through: the holes come one at a time, each staying where it went in (four steps of it), the trim breaking up between them
  const rnd = seed => () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  K.rnd = rnd;
  const ragged = (cx, cy, r, Rn, n = 9) => { const Q = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, rr = r * (.6 + Rn() * .6); Q.push([cx + Math.cos(a) * rr * 1.15, cy + Math.sin(a) * rr]); } return poly(Q); };
  K.ragged = ragged;
  const coatHoles = (() => { const Rn = rnd(90210), H = []; for (let i = 0; i < 14; i++) { const a = (-.1 + Rn() * .95) * T, s = -6 + Rn() * 13; H.push({ d: ragged(s, -a, 1.1 + Rn() * 1.5, Rn), sc: Rn() < .35, x: s, y: -a, r: 1.6 + Rn() * 1.4 }); } return H; })();
  for (let lv = 1; lv <= 4; lv++) { const n = [0, 3, 6, 10, 14][lv], H = coatHoles.slice(0, n);
    const marks = Hq => Hq.map(h => (h.sc ? `<circle cx="${f(h.x)}" cy="${f(h.y)}" r="${f(h.r * 1.5)}" fill="#000" fill-opacity=".5" filter="url(#soft)"/>` : '') + P(h.d, '#1c1d2b') + L(h.d, K.RIM, .3, 'stroke-opacity=".4"') + (h.sc ? L(h.d, '#ff8a3a', .25, 'stroke-opacity=".5"') : '')).join('');
    const Rf = rnd(555), Hf = [], Hb = []; for (let i = 0; i < 9; i++) { const mk = () => { const x = -8 + Rf() * 16, y = -(-.05 + Rf() * .85) * T; return { d: ragged(x, y, 1 + Rf() * 1.4, Rf), sc: Rf() < .35, x, y, r: 1.5 + Rf() * 1.3 }; }; Hf.push(mk()); Hb.push(mk()); }
    K.tlayer('t.coat.s' + lv, { out: coatOut, mat: 'wool', body: coatBody() + marks(H), prof: coatProf, front: coatFront() + marks(Hf.slice(0, [0, 2, 4, 6, 9][lv])), back: coatBack() + marks(Hb.slice(0, [0, 2, 4, 6, 9][lv])), trim: tornTrim(TRIM, lv, 17) }); }
  // the suit's trousers at the hips (the coat off): the waistband and the seat's top
  const waistOut = { back: [[-.215 * T, -1.2], [-.16 * T, -8.4], [-.02 * T, -8.9], [.055 * T, -8.7]], front: [[.06 * T, 7.7], [-.03 * T, 7.9], [-.12 * T, 7.2], [-.215 * T, 2.2]] };
  K.waistOut = waistOut;
  K.waistFront = `${L(`M-15,${f(-.02 * T)} L15,${f(-.02 * T)}`, '#000', .4, 'stroke-opacity=".5"')}${L(`M0,${f(-.02 * T)} L0,${f(.2 * T)}`, '#000', .4, 'stroke-opacity=".55"')}`;
  K.waistBack = `${L(`M-15,${f(-.02 * T)} L15,${f(-.02 * T)}`, '#000', .4, 'stroke-opacity=".5"')}${L(`M0,${f(-.02 * T)} L0,${f(.2 * T)}`, '#000', .4, 'stroke-opacity=".4"')}`;
  K.tlayer('t.waist.suit', { out: waistOut, mat: 'wool', body: L(`M${A2(.02 * T, -8.6)} L${A2(.03 * T, 7.6)}`, '#000', .4, 'stroke-opacity=".5"'), front: K.waistFront, back: K.waistBack });
  // the vest: close fitting, plate panels set into it, gold vine along its edges, cyan crystal fastenings down the front, a high collar
  const vestOut = { back: [[-.03 * T, -1.6], [-.02 * T, -7.7], [.02 * T, -8.1], [.18 * T, -7.2], [.4 * T, -6.2], [.55 * T, -7.0], [.8 * T, -8.3], [.97 * T, -6.4], [T + 3.4, -3.6]], top: [[T + 4.0, 0]],
    front: [[T + 3.6, 3.7], [T + .9, 4.8], [.92 * T, 7.0], [.8 * T, 8.8], [.64 * T, 8.9], [.48 * T, 7.7], [.33 * T, 6.9], [.18 * T, 7.1], [-.02 * T, 7.3], [-.03 * T, 1]] };
  const plate = Qa => P(curve(Q2(Qa), true, .2), 'url(#m-plate)') + L(curve(Q2(Qa), true, .2), '#9c7428', .3, 'stroke-opacity=".55"');
  const crystal = a => { const x = 6.3, y = -a; return `<circle cx="${x}" cy="${f(y)}" r="2.8" fill="url(#eyeGlow)" opacity=".7"/><circle cx="${x}" cy="${f(y)}" r="1.28" fill="#9c7428"/>` + P(poly([[x, y - .95], [x + .67, y], [x, y + .95], [x - .67, y]]), GLOW); };
  K.tlayer('t.vest', { out: vestOut, mat: 'vest', x1: -8.5, x2: 9, trim: [[[T + .9, 4.8], [.92 * T, 7.0], [.8 * T, 8.8], [.64 * T, 8.9], [.48 * T, 7.7], [.33 * T, 6.9], [.18 * T, 7.1], [-.02 * T, 7.3]]], body:
    plate([[.8 * T, 2.2], [.8 * T, 8.4], [.62 * T, 8.6], [.44 * T, 7.4], [.44 * T, 2.6]]) + plate([[.38 * T, 3.2], [.38 * T, 7.0], [.24 * T, 7.0], [.24 * T, 3.0]]) + plate([[.2 * T, 3.0], [.2 * T, 7.0], [.06 * T, 7.2], [.06 * T, 3.0]]) + plate([[.86 * T, -2.6], [.84 * T, -7.6], [.46 * T, -6.6], [.42 * T, -2.8]])
    + L(curve(Q2([[.97 * T, -6.2], [.96 * T, -2.4], [T + 1.2, 1.6], [.96 * T, 4.4]])), GOLD, .4) + L(curve(Q2([[-.01 * T, 7.1], [-.02 * T, -1], [-.01 * T, -7.5]])), GOLD, .4) + L(curve(Q2([[T + 3.2, -3.4], [T + 3.8, 0], [T + 3.4, 3.5]])), GOLD, .4)
    + [.72, .56, .40, .24].map(x => crystal(x * T)).join('')
    + P(poly(Q2([[-.015 * T, -8.5], [.075 * T, -8.7], [.08 * T, 7.9], [-.01 * T, 7.6]])), 'url(#m-band)'),
    // (from the front: the plates either side of the closing, the vine down it, the belt and its buckle, the collar's gold edge)
    front: [[.8, .44, 1.2, 9.6], [.38, .24, 1, 8.4], [.2, .06, 1, 8.2]].map(([a1, a0, l0, l1]) => [-1, 1].map(sg => P(curve([[sg * l0, -a1 * T], [sg * l1, -a1 * T], [sg * l1, -a0 * T], [sg * l0, -a0 * T]], true, .15), 'url(#m-plate)', 'stroke="#9c7428" stroke-width=".3" stroke-opacity=".55"')).join('')).join('')
      + L(`M0,${f(-(T + .5))} L0,${f(-.09 * T)}`, '#000', .4, 'stroke-opacity=".6"') + `<rect x="-15" y="${f(-.078 * T)}" width="30" height="${f(.09 * T)}" fill="url(#m-band)"/><rect x="-1.5" y="${f(-.078 * T - .2)}" width="3" height="${f(.09 * T + .4)}" fill="${GOLD}"/>`
      + L(`M-15,${f(-(T + 3.2))} Q0,${f(-(T + 2.4))} 15,${f(-(T + 3.2))}`, GOLD, .4),
    back: P(curve([[-8.4, -.86 * T], [8.4, -.86 * T], [7.6, -.44 * T], [-7.6, -.44 * T]], true, .15), 'url(#m-plate)', 'stroke="#9c7428" stroke-width=".3" stroke-opacity=".55"') + L(`M0,${f(-(T + 2))} L0,${f(-.09 * T)}`, '#000', .4, 'stroke-opacity=".5"')
      + `<rect x="-15" y="${f(-.078 * T)}" width="30" height="${f(.09 * T)}" fill="url(#m-band)"/>` + L(`M-15,${f(-(T + 3))} Q0,${f(-(T + 2.2))} 15,${f(-(T + 3))}`, GOLD, .4) });
  // the breaching charge on his belt (a black and brass case, a cyan core behind a grille), near side only
  K.tdeco('t.charge', '', { svgN: (() => { const a = .02 * T, x0 = 3.4; return P(poly([[x0 - 3.6, -(a + 3.4)], [x0 + 3.8, -(a + 3.4)], [x0 + 3.8, -(a - 3.6)], [x0 - 3.6, -(a - 3.6)]]), '#0d0c12', 'stroke="#b08a3c" stroke-width=".7"') + `<circle cx="${f(x0 + .2)}" cy="${f(-a + .2)}" r="3.2" fill="url(#eyeGlow)"/>` + L(`M${pt(x0 - 1.2, -a - 1.8)} L${pt(x0 - 1.2, -a + 1.8)} M${pt(x0, -a - 1.8)} L${pt(x0, -a + 1.8)} M${pt(x0 + 1.2, -a - 1.8)} L${pt(x0 + 1.2, -a + 1.8)}`, '#0a090e', .45); })() });
  // the dagger in its sheath at the small of his back (the pelvis at 0,0, +x his front, up the spine toward -y); the sheath alone
  const dag = full => { const g = [-6.5, -2], t = [-20, 15], dx = t[0] - g[0], dy = t[1] - g[1], l = Math.hypot(dx, dy), d = [dx / l, dy / l], q = [-d[1], d[0]], pp = (b, a) => [b[0] + q[0] * a, b[1] + q[1] * a];
    let s = P(poly([pp(g, 2.1), pp(t, .6), [t[0] + d[0] * 1.4, t[1] + d[1] * 1.4], pp(t, -.6), pp(g, -2.1)]), 'url(#m-band)', `stroke="#9c7428" stroke-width=".4"`) + `<circle cx="${f(g[0] + d[0] * 1.2)}" cy="${f(g[1] + d[1] * 1.2)}" r="1.5" fill="${GOLD}"/><circle cx="${t[0]}" cy="${t[1]}" r="1.1" fill="${GOLD}"/>`;
    if (full) s += L(`M${pt(g[0], g[1])} L-3,-10`, '#060509', 2.6) + L('M-9,-4 L-4,0', '#e2b65a', 1.2) + `<circle cx="-3" cy="-10" r="1.4" fill="${GOLD}"/>` + L('M-5,-5 L-3.6,-8.5', '#ffe2aa', .4, 'stroke-opacity=".45"'); return s; };
  def('dagger.back', [-24, -14, 26, 34], dag(true)); def('sheath.back', [-24, -14, 26, 34], dag(false));

  // ---------- the coat's skirt: a flat sheet of the cloth (its back edge at x=0, its front edge at x=w; the waist at y=0, the hips
  // at rows[1], the hem at the last row), the vine down its front edge and along the hem, the folds down it ----------
  const SW = 22, SH = 60, rows = [0, 14, 29.5, 45, 60];
  const skirtArt = (lv = 0) => { const Rn = rnd(4242 + lv), holes = [], n = [0, 4, 8, 13, 18][lv];
    { const R0 = rnd(777); for (let i = 0; i < 18; i++) { const x = 2 + R0() * (SW - 5), y = 16 + R0() * 38, r = 1.2 + R0() * 2.2; holes.push({ d: ragged(x, y, r, R0, 10), x, y, r, sc: R0() < .4 }); } }
    const Hs = holes.slice(0, n), notch = (() => { if (!lv) return ''; let d = ''; const m = [0, 3, 5, 8, 11][lv]; for (let i = 0; i < m; i++) { const x = 1 + Rn() * (SW - 2), w = .8 + Rn() * 1.4, dp = (5 + Rn() * 12) * (.3 + lv / 4 * 1.05); d += `M${pt(x - w, SH + 1)} L${pt(x + (Rn() - .5) * w, SH - dp)} L${pt(x + w, SH + 1)}Z `; } return d; })();
    const art = `<rect x="0" y="0" width="${SW}" height="${SH}" fill="${mat('wool', true)}"/>
      <g filter="url(#soft)">${P(`M4.4,6 L5.6,${SH} L3.4,${SH}Z M10.6,10 L12.4,${SH} L9.8,${SH}Z M16,8 L17.6,${SH} L15,${SH}Z`, '#000', 'fill-opacity=".55"')}${P(`M7,8 L8.6,${SH} L7.4,${SH}Z M13.4,10 L14.6,${SH} L13.6,${SH}Z`, '#4a4466', 'fill-opacity=".5"')}</g>
      ${L(`M.5,14 L.5,${SH}`, '#000', .5, 'stroke-opacity=".6"')}
      ${lv >= 3 ? '' : vine([[SW - 2.4, 0], [SW - 2.4, SH - 3.4]], { step: 2.6, leaf: 2, wide: .8, sw: .45 })}${lv >= 2 ? '' : vine([[SW - 2.4, SH - 2.6], [1.2, SH - 2.6]], { step: 2.4, leaf: 1.9, wide: .75, sw: .45 })}
      ${lv >= 2 ? '' : `<rect x="0" y="${SH - 1}" width="${SW}" height="1" fill="${GOLD}" fill-opacity=".85"/>`}`;
    if (!lv) return art;
    return `<mask id="hm"><rect x="-1" y="-1" width="${SW + 2}" height="${SH + 3}" fill="#fff"/>${Hs.map(h => P(h.d, '#000')).join('')}${P(notch, '#000')}</mask><g mask="url(#hm)">${art}${Hs.map(h => h.sc ? `<circle cx="${f(h.x)}" cy="${f(h.y)}" r="${f(h.r * 1.7)}" fill="#000" fill-opacity=".55" filter="url(#soft)"/>` : '').join('')}</g>`
      + Hs.map(h => L(h.d, K.RIM, .3, 'stroke-opacity=".35"') + (h.sc ? L(h.d, '#ff8a3a', .25, 'stroke-opacity=".45"') : '')).join(''); };
  def('sk.coat', [0, 0, SW, SH], skirtArt(0), { kind: 'sheet', w: SW, rows });
  for (let lv = 1; lv <= 4; lv++) def('sk.coat.s' + lv, [0, 0, SW, SH], skirtArt(lv), { kind: 'sheet', w: SW, rows });
  K.SW = SW; K.SH = SH; K.rows = rows;
  // its lining, when the front is swept back: teal, quilted in diamonds, in the coat's shade at the hinge; the coat's own cloth turned
  // in along the edge, and its gold
  def('sk.lining', [0, 0, SW, SH], `<rect x="0" y="0" width="${SW}" height="${SH}" fill="#2f9d92"/><rect x="0" y="0" width="${SW}" height="${SH}" fill="url(#lg)"/>
    <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".66"/><stop offset=".55" stop-color="#000" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity=".05"/></linearGradient></defs>
    ${L((() => { let d = ''; for (let i = -6; i <= 14; i++) { d += `M0,${f(i * 6)} L${SW},${f(i * 6 + 19)} M0,${f(i * 6 + 19)} L${SW},${f(i * 6)} `; } return d; })(), '#0f4d47', .4, 'stroke-opacity=".6"')}
    <rect x="${SW - 3.2}" y="0" width="3.2" height="${SH}" fill="${mat('wool', true)}"/>${vine([[SW - 1.6, 0], [SW - 1.6, SH]], { step: 2.6, leaf: 1.8, wide: .7, sw: .4 })}`, { kind: 'sheet', w: SW, rows });
  // the loop sewn across the lining and the grenade strapped in it (the loop's middle at 0,0, +x along the strap, +y down the lining)
  const loop = L('M-5.4,0 Q0,-1.2 5.4,0', '#1e130b', 2.6) + L('M-5.4,-1.1 Q0,-2.3 5.4,-1.1', '#ffdcaa', .5, 'stroke-opacity=".22"') + `<rect x="2.2" y="-1.6" width="2.6" height="3.2" fill="${GOLD}"/><rect x="3" y="-.9" width="1" height="1.8" fill="#1e130b"/>`;
  def('grenade', [-8, -8, 16, 14], `<ellipse cx="0" cy="0" rx="3.9" ry="3.1" fill="#2b3324" stroke="#0a0c08" stroke-width=".8"/><ellipse cx="-1.2" cy="-1" rx="1.7" ry="1.1" fill="#bed296" fill-opacity=".22"/>${L('M-1.6,-3 L-1.6,3 M0,-3.1 L0,3.1 M1.6,-3 L1.6,3', '#000', .4, 'stroke-opacity=".45"')}
    <rect x="-5.6" y="-1.3" width="2" height="2.6" fill="#8e95a3"/><rect x="-5.4" y="1" width="5.2" height="1" fill="#8e95a3"/><circle cx="-5" cy="-2.2" r="1.4" fill="none" stroke="#c8ccd4" stroke-width=".6"/>` + loop);
  def('grenade.loop', [-8, -8, 16, 14], loop);

  // ---------- what is left at the shoulder once the arm is torn away (the shoulder at 0,0, +x the way the stub points) ----------
  const stub = (name, m, lin) => def(name, [-6, -8, 16, 16], P(curve([[-1.4, -4.9], [1.6, -4.7], [3.6, -4.2], [4.2, -3.4], [5.4, -2.6], [4.0, -1.4], [5.6, -.2], [4.1, 1], [5.4, 2.4], [4, 3.3], [3.4, 4.2], [1.4, 4.7], [-1.4, 4.8], [-3.6, 2.6], [-3.9, 0], [-3.6, -2.6]], true, .25), mat(m))
    + (lin ? L('M4.2,-3.4 L5.4,-2.6 L4,-1.4 L5.6,-.2 L4.1,1 L5.4,2.4 L4,3.3', TEAL, .45, 'stroke-opacity=".6"') : '') + L('M-1.2,4.8 Q2,5 3.4,4.2', K.RIM, .4, 'stroke-opacity=".5"'), { kind: 'torn' });
  stub("stump.torn.suit", "wool", true); stub("stump.torn.skin", "skin", false);
})();
