// The look tests checked in the game's page: node spike/look/check_look.js [stage] [frames]   (after python3 build.py --qa)
// A story stage is played on auto to a frame, with a fake clock and seeded dice, once with every test off and once with each on
// (field and 1400 when not given: a crew man's cut is in the air there). It fails on an error, on a test that changed the game
// (every fighter's joints and the game's clock must come out the same in every run), on a dither that lifts a pixel by more than
// its levels or a picture it does not reach, on a grain that is not there or is too strong, and on a brushed trail that drew
// nothing or drew anywhere but round the blades. It ends with what each test costs a frame on this machine.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const ROOT = path.join(__dirname, '..', '..'), STAGE = process.argv[2] || 'field', FRAMES = +(process.argv[3] || 1400);
const PAGE = process.env.PAGE ? path.resolve(process.env.PAGE) : [path.join(ROOT, 'uiwork', 'qa_full.html'), path.join(ROOT, 'ragdoll-skirmish-lab.html')].find(f => fs.existsSync(f));
(async () => {
  if (!PAGE) { console.log('FAIL no page: run python3 build.py --qa first'); process.exit(1); }
  const exe = process.env.SK_CHROMIUM || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  const b = await chromium.launch({ executablePath: exe });
  const run = async (look, cost) => {
    const p = await (await b.newContext({ viewport: { width: 412, height: 714 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })).newPage(), errs = [];
    p.on('pageerror', e => errs.push(String(e.message)));
    p.on('console', m => { if (m.type() === 'error' && !/fonts\.g|Failed to load resource|net::ERR|ERR_TUNNEL/.test(m.text())) { errs.push(m.text()); } });
    // (every frame callback asked for is run at each step: the game's, the Phaser host's meter)
    await p.addInitScript(() => { window.__rafq = []; window.requestAnimationFrame = cb => { window.__rafq.push(cb); return window.__rafq.length; }; });
    await p.goto('file://' + PAGE + '?host=0&look=' + look, { waitUntil: 'load' }); await p.waitForTimeout(500);
    const r = await p.evaluate(([K, F, cost]) => {
      S.soundOn = false; let a = 5; Math.random = () => { a = (a * 1103515245 + 12345) & 0x7fffffff; return a / 0x7fffffff; }; S.rng = Math.random;
      const real = performance.now.bind(performance); window.__now = 10000; performance.now = () => window.__now;
      const step = k => { for (let i = 0; i < k; i++) { window.__now += 16.7; const q = window.__rafq; window.__rafq = []; for (const f of q) { f(window.__now); } } };
      S.storyAuto = true; S.auto = true; storyBegin(K, { auto: true }); step(2); step(F);
      let hash = 0; for (const f of S.F) { if (f && f.p) { for (const q of f.p) { if (q) { hash += q.x * 1.0001 + q.y * 1.37; } } } }
      const out = { hash: +hash.toFixed(3), t: +S.t.toFixed(4), err: LOOKTEST.err, strokes: LOOKTEST.strokes, passes: LOOKTEST.passes, w: cv.width, h: cv.height, bars: typeof ST_LB === 'number' ? ST_LB : 0 };
      const d = ctx.getImageData(0, 0, cv.width, cv.height).data; let s = ''; const CH = 0x8000;
      for (let i = 0; i < d.length; i += CH) { s += String.fromCharCode.apply(null, d.subarray(i, i + CH)); } out.px = btoa(s);
      if (cost) {
        // (a frame's drawing timed by the real clock, the canvas made to finish before and after it: the middle of 15)
        const time = set => { for (const k of ['dither', 'grain', 'ink']) { LOOKTEST[k] = set.includes(k); } const T = []; for (let i = 0; i < 15; i++) { ctx.getImageData(0, 0, 1, 1); const s0 = real(); render(); ctx.getImageData(0, 0, 1, 1); T.push(real() - s0); } T.sort((x, y) => x - y); return +T[7].toFixed(2); };
        out.cost = { off: time([]), dither: time(['dither']), grain: time(['grain']), ink: time(['ink']), off2: time([]) };
      }
      return out;
    }, [STAGE, FRAMES, !!cost]);
    await p.close(); r.errs = errs; r.px = Buffer.from(r.px, 'base64'); return r;
  };
  const off = await run(''), dither = await run('dither'), grain = await run('grain'), ink = await run('ink', true);
  await b.close();
  let bad = 0; const say = (ok, what) => { if (!ok) { bad++; } console.log((ok ? 'ok   ' : 'FAIL ') + what); };
  const diff = (A, B) => { let n = 0, lo = 0, hi = 0, sum = 0, abs = 0; const a = A.px, c = B.px; for (let i = 0; i < a.length; i += 4) { let ch = false; for (let k = 0; k < 3; k++) { const d = c[i + k] - a[i + k]; if (d) { ch = true; if (d < lo) { lo = d; } if (d > hi) { hi = d; } sum += d; abs += Math.abs(d); } } if (ch) { n++; } } const N = a.length / 4; return { share: n / N, lo, hi, mean: sum / (N * 3), abs: abs / (N * 3) }; };
  const all = { off, dither, grain, ink };
  for (const k of Object.keys(all)) { const r = all[k]; say(!r.errs.length && !r.err, k + ': no errors' + (r.errs.length || r.err ? ' (' + (r.err || r.errs.slice(0, 3).join(' | ')) + ')' : '')); }
  say(Object.values(all).every(r => r.hash === off.hash && r.t === off.t), 'the game is the same in every run (joints ' + off.hash + ', clock ' + off.t + ')');
  const dd = diff(off, dither);
  say(dither.passes > 0 && dd.lo >= -1 && dd.hi <= 4 && dd.mean > .4 && dd.mean < 2.2 && dd.share > .3, 'dither: ' + (100 * dd.share).toFixed(0) + '% of the picture lifted, by ' + dd.lo + ' to ' + dd.hi + ' levels, ' + dd.mean.toFixed(2) + ' on average');
  const dg = diff(off, grain);
  say(grain.passes > 0 && dg.share > .3 && dg.abs > .2 && dg.abs < 6 && Math.abs(dg.mean) < .6, 'grain: ' + (100 * dg.share).toFixed(0) + '% of the picture touched, ' + dg.abs.toFixed(2) + ' levels on average, the picture ' + (dg.mean >= 0 ? 'lighter' : 'darker') + ' by ' + Math.abs(dg.mean).toFixed(2));
  const di = diff(off, ink);
  say(ink.strokes > 0 && di.share < .02, 'brushed trails: ' + ink.strokes + ' strokes drawn by this frame, ' + (100 * di.share).toFixed(2) + '% of this frame\'s picture differs');
  const c = ink.cost; console.log('     a frame here: ' + c.off + ' ms (and ' + c.off2 + ' timed again); with the dither ' + c.dither + ', with the grain ' + c.grain + ', with brushed trails ' + c.ink);
  process.exit(bad ? 1 : 0);
})();
