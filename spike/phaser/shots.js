// Pictures of the same moment in each mode: node spike/phaser/shots.js "Skirmish lab" [wait ms]   (into spike/phaser/out/)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const out = path.join(__dirname, 'out'), btn = process.argv[2] || 'Skirmish lab', wait = +(process.argv[3] || 5000);
(async () => {
  const exe = process.env.SK_CHROMIUM || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  const b = await chromium.launch({ executablePath: exe, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('error: ' + e.message));
  await p.goto('file://' + path.join(out, 'phaser-spike.html') + '?host=1', { waitUntil: 'load' });
  await p.waitForTimeout(1500);
  await p.getByText(btn, { exact: true }).first().click(); await p.waitForTimeout(wait);
  await p.evaluate(() => { S.paused = true; }); await p.waitForTimeout(600);
  for (const m of [0, 1, 2]) {
    await p.evaluate(m => PHOST.set(m), m); await p.waitForTimeout(2500);
    await p.screenshot({ path: path.join(out, 'play' + m + '.png') });
    console.log('mode ' + m + ' ' + await p.evaluate(() => JSON.stringify({ running: PHOST.mode, frames: PHOST.frames, err: PHOST.err })));
  }
  await b.close();
})();
