// The drawn figure in the game itself: each chapter (and the skirmish lab) opened on a phone-sized screen and played at for a while
// with taps and keys, and a count kept of every drawing of Ilyas, by what he had on and how he stood, and of whether the pieces
// drew him or the painted figure had to. It fails on an error, on a piece that could not be made, or on a case the pieces left to the
// painted figure after they had loaded.
//   node spike/phaser/check_skin.js [first] [last] [seconds each]     (chapters by their place in the list, 0 the skirmish lab)
//   pictures of each go to spike/phaser/out/skin_<n>.png
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const out = path.join(__dirname, 'out'), page0 = 'file://' + path.join(out, 'phaser-spike.html') + '?host=0';
const first = +(process.argv[2] || 0), last = +(process.argv[3] || 99), secs = +(process.argv[4] || 14);
(async () => {
  const exe = process.env.SK_CHROMIUM || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  const b = await chromium.launch({ executablePath: exe });
  const open = async () => { const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true }); const p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push(String(e.message))); await p.goto(page0, { waitUntil: 'load' }); await p.waitForTimeout(1200);
    // (the count: every drawing of him, under what he had on and how he was seen)
    await p.evaluate(() => { const d = KaelLook.draw, cov = window.__cov = {};
      KaelLook.draw = function (c, F, o) { const s0 = Skin.state.drawn, r = d.apply(this, arguments), drew = Skin.state.drawn > s0, yaw = +((o && o.yaw) ?? F.yaw ?? 0) || 0, W = F.wear && typeof F.wear === 'object' ? F.wear : null;
        const key = (W ? 'pit ' + Object.keys(W).filter(k => W[k]).map(k => k + ':' + W[k]).join(',') : F.coatOff ? 'coat off' : 'coat' + (F.coatShred ? ' shred' : '')) + (F.oneArm ? ' | one arm' : '') + (F.armOff ? ' | arm off' : '')
          + (Math.abs(Math.sin(yaw)) > .015 || Math.cos(yaw) < 0 ? ' | turned' : '') + (o && o.headYaw ? ' | head turned' : '') + (F.severed ? ' | severed' : '') + (F.coatShield ? ' | shield' : '') + (F.coatOpen ? ' | open' : '') + (F.rips && F.rips.length ? ' | torn' : '') + (o && (o.look || o.outfit || o.hair) ? ' | a look by name' : '');
        const e = cov[key] || (cov[key] = [0, 0]); e[drew ? 0 : 1]++; return r; }; });
    return { ctx, p, errs }; };
  // the chapters' names, in the order the list has them; and first, every kit there can be gone through for its pieces
  const L = await open(); let bad = 0;
  { const r = await L.p.evaluate(() => { if (typeof GEAR === 'undefined' || typeof kitWear !== 'function') return null; const ids = {}; for (const id in GEAR) (ids[GEAR[id].slot] = ids[GEAR[id].slot] || []).push(id); let n = 0; const missing = new Set(), has = nm => !!SkinArt.pieces[nm];
      const rec = (i, kit) => { if (i === GEAR_SLOTS.length) { n++; for (const pinned of [true, false]) for (const open of [false, true]) { const K = Skin.kitOf({ wear: kitWear(kit, { pinned }), oneArm: true, openHand: open }, {}, true);
            for (const nm of K.needs) if (nm && !has(nm)) missing.add(nm);
            for (const v of ['P', 'Q', 'F', 'R', 'B']) { for (const part of ['base', K.hat ? 'hairLow' : 'hair', 'earPlain']) if (!has('head.' + v + '.' + part)) missing.add('head.' + v + '.' + part); if (K.hat && !has('hat.' + K.hat + '.' + v)) missing.add('hat.' + K.hat + '.' + v); }
            for (const v of ['S', 'F', 'B']) if (!has('shoe.' + K.foot + '.' + v)) missing.add('shoe.' + K.foot + '.' + v); } return; }
        for (const id of ids[GEAR_SLOTS[i]]) { kit[GEAR_SLOTS[i]] = id; rec(i + 1, kit); } };
      rec(0, {}); return { n, gear: Object.keys(GEAR).length, missing: [...missing] }; });
    if (r) { if (r.missing.length) bad++; console.log((r.missing.length ? 'FAIL ' : 'ok   ') + 'every kit of the ' + r.gear + ' pieces of gear (' + r.n + ' kits): ' + (r.missing.length ? 'no drawing for ' + r.missing.join(', ') : 'each has its pieces')); } }
  await L.p.getByText('Chapters', { exact: true }).first().click(); await L.p.waitForTimeout(800);
  const names = await L.p.evaluate(() => { const seen = new Set(), outN = []; for (const el of document.querySelectorAll('button')) { if (!el.offsetParent) continue; const t = el.textContent.trim().replace(/\s+/g, ' '); if (!/^(?:[IVX]+|\d+)?The |^(?:[IVX]+|\d+)[A-Z]|^Check and|^Three T/.test(t) || seen.has(t)) continue; if (/^(Resume|Fight|Arena|Codex|Title)/.test(t)) continue; seen.add(t); outN.push(t); } return outN; });
  await L.ctx.close();
  const list = ['Skirmish lab', ...names]; const all = {};
  for (let i = Math.max(0, first); i <= Math.min(last, list.length - 1); i++) {
    const { ctx, p, errs } = await open(), name = list[i];
    if (i === 0) await p.getByText('Skirmish lab', { exact: true }).first().click();
    else { await p.getByText('Chapters', { exact: true }).first().click(); await p.waitForTimeout(600); await p.getByText(name, { exact: true }).first().click(); }
    await p.waitForTimeout(1500);
    // played at: taps to move the story on, a walk to the right, and in a fight whatever command is offered
    const t0 = Date.now(); let n = 0;
    while (Date.now() - t0 < secs * 1000) { n++;
      const cmd = await p.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(q => q.offsetParent && !q.disabled && /^(Slash|Overhead|Thrust|Sweep|Shove|Jab|Cross|Hook|Strike|Kick|Stab|Cut|Grab|Throw|Continue|Next|Go on|Begin|Start|Fight|Take|Leave|Wear|Try|Look|Stand|Get up|Walk|Rise)/.test(q.textContent.trim()) && !/Title|Restart|Chapters|lab/.test(q.textContent));
        if (!bs.length) return null; const q = bs[Math.floor(Math.random() * bs.length)]; q.click(); return q.textContent.trim().slice(0, 24); });
      if (!cmd) { if (n % 3 === 0) { await p.keyboard.down('ArrowRight'); await p.waitForTimeout(500); await p.keyboard.up('ArrowRight'); } else { await p.touchscreen.tap(422 + (n % 2 ? 150 : -40), 200 + (n % 4) * 30).catch(() => {}); if (n % 5 === 0) await p.keyboard.press('Space').catch(() => {}); } }
      await p.waitForTimeout(450); }
    await p.screenshot({ path: path.join(out, 'skin_' + i + '.png') });
    const r = await p.evaluate(() => ({ st: Skin.state, cov: window.__cov }));
    const left = Object.entries(r.cov).filter(([k, v]) => v[1] > 2 && !/a look by name/.test(k)), failed = Object.keys(r.st.failed);
    const ok = !errs.length && !r.st.err && !failed.length && !left.length; if (!ok) bad++;
    for (const k in r.cov) { const a = all[k] || (all[k] = [0, 0]); a[0] += r.cov[k][0]; a[1] += r.cov[k][1]; }
    console.log((ok ? 'ok   ' : 'FAIL ') + i + ' ' + name.slice(0, 44) + ': drawn ' + r.st.drawn + ', waiting on pieces ' + r.st.missed + ', other looks ' + r.st.other + ', pieces made ' + r.st.loaded
      + (r.st.err ? '\n     skin error: ' + r.st.err.slice(0, 400) : '') + (failed.length ? '\n     pieces failed: ' + failed.map(k => k + ' (' + r.st.failed[k] + ')').join(', ') : '') + (left.length ? '\n     left to the painted figure: ' + left.map(([k, v]) => k + ' x' + v[1]).join('; ') : '') + (errs.length ? '\n     errors: ' + errs.slice(0, 4).join(' | ') : ''));
    await ctx.close();
  }
  console.log('\nevery way he was drawn (by the pieces / by the painted figure):'); for (const k of Object.keys(all).sort()) console.log('  ' + String(all[k][0]).padStart(6) + ' / ' + String(all[k][1]).padEnd(4) + ' ' + k);
  await b.close(); process.exit(bad ? 1 : 0);
})();
