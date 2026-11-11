// A sheet of Ilyas in a list of states, the painted figure beside the drawn one, for comparing them.
//   node spike/phaser/sheet.js <set> [out.png] [scale] [mode]
// set: a name from SETS below, or a JSON list of states [{n: label, f: {fields put on the fighter}, o: {options for the draw}}].
// mode: 'both' (painted | drawn, the default), 'painted', 'drawn'. The pose is his guard in the skirmish lab's street.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const Y = Math.PI / 4, yaws = [0, 1, 2, 3, 4, 5, 6, 7].map(i => ({ n: 'yaw ' + i * 45, o: { yaw: i * Y } }));
const SETS = {
  turn: yaws,
  one: [{ n: 'profile', o: {} }],
  coatoff: yaws.filter((_, i) => i % 2 === 0 || i === 7).map(s => ({ n: 'coat off, ' + s.n, f: { coatOff: true }, o: s.o })),
  prologue: [{ n: 'coat', o: {} }, { n: 'coat off', f: { coatOff: true } }, { n: 'shred .5', f: { coatShred: .5 } }, { n: 'shred 1', f: { coatShred: 1 } }, { n: 'arm off', f: { armOff: true } },
    { n: 'arm off, coat off', f: { armOff: true, coatOff: true } }, { n: 'look back', f: { lookBack: true } }, { n: 'drained', f: { drain: 1 } }],
  // (Act I: his tattoos are scars and his eyes dull, F.drain 1; most of it he fights with his fist)
  pit: [{ n: 'bare, bandage', f: { oneArm: true, drain: 1, weaponKey: 'fists', wear: { top: 'bare', bandage: true, feet: 'bare' } } }, { n: 'under', f: { oneArm: true, drain: 1, weaponKey: 'fists', wear: { top: 'under', feet: 'boots', belt: 'belt' } } },
    { n: 'shirt', f: { oneArm: true, drain: 1, weaponKey: 'club', wear: { top: 'shirt', feet: 'boots', belt: 'belt' } } }, { n: 'jersey', f: { oneArm: true, drain: 1, weaponKey: 'fists', wear: { top: 'jersey', feet: 'boots', belt: 'rope' } } },
    { n: 'oilcloth + scarf', f: { oneArm: true, drain: 1, weaponKey: 'dagger', wear: { top: 'shirt', coat: 'oilcloth', scarf: 'rust', feet: 'boots', belt: 'belt' } } }, { n: 'canvas + scarf', f: { oneArm: true, drain: 1, weaponKey: 'fists', wear: { top: 'shirt', coat: 'canvas', scarf: 'rust', feet: 'dock', belt: 'belt' } } },
    { n: 'scarf only, sandals', f: { oneArm: true, drain: 1, weaponKey: 'shard', wear: { top: 'shirt', scarf: 'rust', feet: 'sandals', belt: 'rope' } } }, { n: 'unpinned', f: { oneArm: true, drain: 1, weaponKey: 'fists', wear: { top: 'shirt', feet: 'boots', belt: 'belt', pinned: false } } }],
  gear: [{ n: 'cap, jerkin', f: { oneArm: true, drain: 1, weaponKey: 'club', wear: { top: 'shirt', head: 'cap', vest: 'jerkin', feet: 'boots', belt: 'belt' } } }, { n: 'helmet, stab vest', f: { oneArm: true, drain: 1, weaponKey: 'fists', wear: { top: 'jersey', head: 'helmet', vest: 'stab', feet: 'dock', belt: 'belt' } } },
    { n: 'tyre plates, shins', f: { oneArm: true, drain: 1, weaponKey: 'fists', wear: { top: 'shirt', vest: 'tyre', legs: 'shins', feet: 'boots', belt: 'belt' } } }, { n: 'glove', f: { oneArm: true, drain: 1, weaponKey: 'fists', wear: { top: 'under', hands: 'glove', feet: 'boots', belt: 'belt' } } },
    { n: 'wrap', f: { oneArm: true, drain: 1, weaponKey: 'fists', wear: { top: 'bare', hands: 'wrap', feet: 'bare', bandage: true } } }, { n: 'gauntlet', f: { oneArm: true, drain: 1, weaponKey: 'fists', wear: { top: 'shirt', hands: 'gauntlet', legs: 'shins', feet: 'dock', belt: 'belt' } } },
    { n: 'oilcloth, cap, stab', f: { oneArm: true, drain: 1, weaponKey: 'dagger', wear: { top: 'jersey', coat: 'oilcloth', scarf: 'rust', head: 'cap', vest: 'stab', feet: 'dock', belt: 'belt' } } }, { n: 'open hand', f: { oneArm: true, drain: 1, openHand: true, weaponKey: 'unarmed', wear: { top: 'shirt', feet: 'boots', belt: 'belt' } } }]
};
// (the gear screen's own three views of him standing, in what he can wear)
const gearViews = list => list.flatMap(([label, wear]) => [0, 1, 2].map(gv => ({ n: label + (gv === 1 ? ', front' : gv ? ', other side' : ''), gv, f: { oneArm: true, drain: 1, wear: JSON.parse(JSON.stringify(wear)) } })));
SETS.gv1 = gearViews([['bare, dressed', { top: 'bare', bandage: true, feet: 'bare' }], ['undershirt', { top: 'under', feet: 'boots', belt: 'belt', bandage: true }], ['shirt', { top: 'shirt', feet: 'boots', belt: 'belt' }], ['jersey', { top: 'jersey', feet: 'boots', belt: 'rope' }]]);
SETS.gv2 = gearViews([['oilcloth, scarf, cap', { top: 'shirt', coat: 'oilcloth', scarf: 'rust', head: 'cap', feet: 'boots', belt: 'belt' }], ['canvas, scarf, dock boots', { top: 'shirt', coat: 'canvas', scarf: 'rust', feet: 'dock', belt: 'belt' }],
  ['jerkin, cap', { top: 'shirt', vest: 'jerkin', head: 'cap', feet: 'boots', belt: 'belt' }], ['stab vest, helmet, gauntlet', { top: 'jersey', vest: 'stab', head: 'helmet', hands: 'gauntlet', feet: 'dock', belt: 'belt' }]]);
SETS.gv3 = gearViews([['tyre plates, shins', { top: 'shirt', vest: 'tyre', legs: 'shins', feet: 'boots', belt: 'belt' }], ['glove, sandals', { top: 'under', hands: 'glove', feet: 'sandals', belt: 'rope' }], ['wrap, bare feet', { top: 'bare', hands: 'wrap', feet: 'bare', bandage: true }],
  ['sleeve unpinned, oilcloth over stab', { top: 'shirt', coat: 'oilcloth', vest: 'stab', feet: 'boots', belt: 'belt', pinned: false }]]);
// (what the coat does and what is done to it, in the prologue)
SETS.coat = [{ n: 'shield .5', f: { coatShield: .5 } }, { n: 'shield 1', f: { coatShield: 1 } }, { n: 'open .5', f: { coatOpen: .5, nade: true } }, { n: 'open 1, grenade', f: { coatOpen: 1, nade: true } },
  { n: 'open 1, loop empty', f: { coatOpen: 1, nade: false } }, { n: 'swept back, grenade', f: { coatOpen: 1, nade: true }, j: { 3: [-9, -30], 4: [-13, -8], 11: [-2, -40] } }, { n: 'swept back, empty', f: { coatOpen: 1, nade: false }, j: { 3: [-9, -30], 4: [-13, -8], 11: [-2, -40] } }, { n: 'swept back .6', f: { coatOpen: .6, nade: true }, j: { 3: [-9, -30], 4: [-13, -8], 11: [-2, -40] } }, { n: 'hem torn', f: { hemTears: [{ t: .4, d: 8, w: 4 }, { t: .7, d: 11, w: 3.4 }] } },
  { n: 'cut about', f: { rips: [{ g: 'torso', a: 0, b: 1, u: .55, off: -3, ang: .4, seed: 11, len: 7, wid: 1.6 }, { g: 'armN', a: 3, b: 4, u: .5, off: .4, ang: .3, seed: 5, len: 5, wid: 1.4 }, { g: 'armN', a: 1, b: 3, u: .5, off: -.6, ang: 1.2, seed: 9, stab: true, r: 1.8 },
    { g: 'legN', a: 0, b: 7, u: .55, off: 1, ang: .5, seed: 3, len: 6, wid: 1.5 }, { g: 'legF', a: 9, b: 10, u: .4, off: 0, ang: 1.3, seed: 4, len: 5, wid: 1.3 }, { g: 'skirt', t: .5, v: .5, ang: 1.5, seed: 21, len: 9, wid: 1.8 }, { g: 'skirt', t: .75, v: .65, ang: .2, seed: 8, stab: true, r: 2.2 }] }, o: { gore: '#8a1420' } },
  { n: 'arm tearing', f: { armTear: .8 }, o: { gore: '#8a1420' } }, { n: 'shred .25', f: { coatShred: .25 } }, { n: 'shred .75', f: { coatShred: .75 } }, { n: 'shield, shred .75', f: { coatShield: 1, coatShred: .75 } },
  { n: 'arm off, seared', f: { armOff: true, seared: true }, o: { gore: '#8a1420' } }, { n: 'arm off, blood', f: { armOff: true }, o: { gore: '#8a1420' } }, { n: 'coat off, flare', f: { coatOff: true, flare: 1.2 } }, { n: 'coat off, drained .6', f: { coatOff: true, drain: .6 } }, { n: 'coat off, charge', f: { coatOff: true, charge: 'belt', sidearm: 'sheathed' } }];
// (the Pit's outfits turned through the eight sides)
const turned = (label, f) => yaws.map(s => ({ n: label + ', ' + s.n, f: JSON.parse(JSON.stringify(f)), o: s.o }));
SETS.shirtturn = turned('shirt', { oneArm: true, drain: 1, weaponKey: 'fists', wear: { top: 'shirt', feet: 'boots', belt: 'belt' } });
SETS.bareturn = turned('bare', { oneArm: true, drain: 1, weaponKey: 'fists', wear: { top: 'bare', bandage: true, feet: 'bare' } });
SETS.underturn = turned('under', { oneArm: true, drain: 1, weaponKey: 'fists', wear: { top: 'under', feet: 'sandals', belt: 'rope', hands: 'wrap' } });
SETS.oilturn = turned('oilcloth', { oneArm: true, drain: 1, weaponKey: 'dagger', wear: { top: 'shirt', coat: 'oilcloth', scarf: 'rust', head: 'cap', feet: 'boots', belt: 'belt' } });
SETS.canvasturn = turned('canvas', { oneArm: true, drain: 1, weaponKey: 'club', wear: { top: 'shirt', coat: 'canvas', scarf: 'rust', feet: 'dock', belt: 'belt', legs: 'shins', hands: 'glove' } });
SETS.jerseyturn = turned('jersey', { oneArm: true, drain: 1, weaponKey: 'fists', wear: { top: 'jersey', head: 'helmet', vest: 'stab', feet: 'dock', belt: 'rope', hands: 'gauntlet', pinned: false } });
SETS.tyreturn = turned('tyre', { oneArm: true, drain: 1, weaponKey: 'fists', wear: { top: 'shirt', vest: 'tyre', legs: 'shins', feet: 'boots', belt: 'belt' } });
SETS.jerkinturn = turned('jerkin', { oneArm: true, drain: 1, weaponKey: 'shard', wear: { top: 'shirt', vest: 'jerkin', head: 'cap', feet: 'boots', belt: 'belt' } });
SETS.vestturn = turned('coat off', { coatOff: true });
(async () => {
  const arg = process.argv[2] || 'turn', states = SETS[arg] || JSON.parse(arg), out = process.argv[3] || '/tmp/sheet.png', K = +(process.argv[4] || 3), mode = process.argv[5] || 'both', focus = process.argv[6] || 'body';
  const exe = process.env.SK_CHROMIUM || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  const b = await chromium.launch({ executablePath: exe });
  const p = await (await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1 })).newPage(); p.on('pageerror', e => console.log('page error: ' + e.message));
  await p.goto('file://' + path.join(__dirname, 'out', 'phaser-spike.html') + '?host=0', { waitUntil: 'load' }); await p.waitForTimeout(1000);
  await p.getByText('Skirmish lab', { exact: true }).first().click(); await p.waitForTimeout(2600);
  const r = await p.evaluate(async ({ states, k, mode, focus }) => {
    if (typeof Skin !== 'undefined') await Skin.loadAll();
    const f = S.F[0], P = f.p, both = mode === 'both', hd = focus === 'head', tr = focus === 'torso', cw = (both ? (hd ? 100 : tr ? 110 : 250) : (hd ? 50 : tr ? 56 : 130)) * k, ch = (hd ? 52 : tr ? 96 : 200) * k, FO = hd ? { x: P[2].x - 3 * f.facing, y: P[2].y - 3 } : tr ? { x: (P[0].x + P[1].x) / 2, y: (P[0].y + P[1].y) / 2 - 6 } : { x: P[0].x, y: P[0].y - 20 }, cols = states[0] && states[0].gv != null ? (both ? 3 : 6) : Math.min(states.length, both ? 4 : 8), rows = Math.ceil(states.length / cols);
    const c = document.createElement('canvas'); c.width = cw * cols; c.height = ch * rows; const x = c.getContext('2d'), errs = [];
    x.fillStyle = '#57504a'; x.fillRect(0, 0, c.width, c.height);
    const old = ctx; ctx = x;
    states.forEach((st, i) => {
      const cx0 = (i % cols) * cw, cy0 = Math.floor(i / cols) * ch;
      const mk = () => { const F = KaelLook.snap(f, Object.assign({}, st.f || {})); F.wp = st.f && st.f.weaponKey === 'unarmed' ? { unarmed: true } : st.f && st.f.weaponKey && typeof WEAPONS !== 'undefined' && WEAPONS[st.f.weaponKey] ? WEAPONS[st.f.weaponKey] : f.wp; if (st.f && st.f.weaponKey) F.arcSt = null; if (F.wear) F.wear = JSON.parse(JSON.stringify(F.wear)); if (st.j) for (const i in st.j) { F.p[i] = { x: F.p[0].x + st.j[i][0] * F.facing, y: F.p[0].y + st.j[i][1] }; } return st.gv != null ? a1StandFront(F, f) : F; };
      const o = () => st.gv != null ? Object.assign(a1GearOpt(A1G_VIEWS[st.gv]), st.o || {}) : Object.assign({ now: S.t, light: { x: P[0].x + 220 * f.facing, y: P[0].y - 300 }, drawOther: drawWeapon }, st.o || {});
      const put = (j, fn) => { x.save(); x.beginPath(); x.rect(cx0, cy0, cw, ch); x.clip(); x.setTransform(k, 0, 0, k, cx0 + (both ? (j ? .75 : .25) : .5) * cw - FO.x * k, cy0 + ch * .5 - FO.y * k); try { fn(); } catch (e) { errs.push(st.n + ': ' + (e.stack || e).toString().slice(0, 300)); } x.restore(); x.setTransform(1, 0, 0, 1, 0, 0); };
      if (mode !== 'drawn') put(0, () => KaelLook._painted.call(KaelLook, x, mk(), o()));
      if (mode !== 'painted') put(1, () => { const F = mk(), O = o(); if (!Skin.draw(x, F, O)) { x.fillStyle = '#e66'; x.font = 5 + 'px sans-serif'; const K2 = Skin.kitOf(F, O, true), miss = K2.needs.filter(n => n && !Skin.TEX[n]); x.fillText('falls back', FO.x - 12, FO.y); errs.push(st.n + ': missing ' + miss.join(' ')); } });
      x.fillStyle = '#f3e3b3'; x.font = 600 + ' ' + Math.round(Math.min(18, 6.2 * k)) + 'px sans-serif'; x.fillText(st.n, cx0 + 6, cy0 + 20);
      x.strokeStyle = 'rgba(0,0,0,.35)'; x.strokeRect(cx0 + .5, cy0 + .5, cw - 1, ch - 1);
    });
    ctx = old;
    if (Skin.state.err) errs.push('skin error: ' + Skin.state.err); const fl = Object.keys(Skin.state.failed); if (fl.length) errs.push('failed pieces: ' + fl.map(n => n + ' (' + Skin.state.failed[n] + ')').join(', '));
    return { url: c.toDataURL('image/png'), errs: [...new Set(errs)], w: c.width, h: c.height };
  }, { states, k: K, mode, focus });
  fs.writeFileSync(out, Buffer.from(r.url.split(',')[1], 'base64'));
  console.log(out + ' ' + r.w + 'x' + r.h + (r.errs.length ? '\nERRORS:\n' + r.errs.join('\n') : ''));
  await b.close();
})();
