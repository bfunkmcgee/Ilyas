// The test page opened in each mode on a phone-sized screen: no errors, Phaser up, a picture taken of each.
//   node spike/phaser/check_spike.js      (pictures and the report go to spike/phaser/out/)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const out = path.join(__dirname, 'out'), page0 = 'file://' + path.join(out, 'phaser-spike.html');
(async () => {
  const exe = process.env.SK_CHROMIUM || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  const b = await chromium.launch({ executablePath: exe, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  let bad = 0;
  for (const mode of [0, 1, 2]) {
    const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
    const p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push(String(e.message)));
    p.on('console', m => { if (m.type() === 'error' && !/fonts\.g|Failed to load resource|net::ERR/.test(m.text())) errs.push(m.text()); });
    await p.goto(page0 + '?host=' + mode, { waitUntil: 'load' });
    await p.waitForTimeout(6000);
    const s = await p.evaluate(() => ({ mode: PHOST.mode, err: PHOST.err, frames: PHOST.frames, hostMs: +PHOST.hostMs.toFixed(2), avg: +(PHOST.avg || 0).toFixed(1),
      skin: typeof Skin !== 'undefined' ? [Skin.state.ready, Skin.state.err] : null, cv: [cv.width, cv.height, getComputedStyle(cv).opacity], gl: (g => [g.width, g.height, getComputedStyle(g).display])(document.getElementById('phaserCv')),
      meter: document.getElementById('phostMeter').textContent }));
    await p.screenshot({ path: path.join(out, 'mode' + mode + '.png') });
    const ok = !errs.length && !s.err && (!s.skin || (s.skin[0] && !s.skin[1])) && s.mode === mode && (mode === 0 || (s.frames > 3 && s.gl[0] === s.cv[0] && s.gl[1] === s.cv[1]));
    if (!ok) bad++;
    console.log((ok ? 'ok   ' : 'FAIL ') + 'mode ' + mode + ' ' + JSON.stringify(s) + (errs.length ? '\n     errors: ' + errs.slice(0, 5).join(' | ') : ''));
    await ctx.close();
  }
  await b.close(); process.exit(bad ? 1 : 0);
})();
