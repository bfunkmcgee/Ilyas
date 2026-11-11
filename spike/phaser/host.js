// ===== PHASER HOST (a test, not part of the game) =====
// The whole game runs as it is: its rules, its ragdolls, its painters, its HUD and its walking about. This script only changes
// where the picture ends up. The game still paints its own 2D canvas (#cv); in the two Phaser modes that canvas is made
// see-through (it still takes every touch) and a Phaser scene under it shows the same picture as a GPU texture, sent up again
// each frame. The third mode puts Phaser's filters over it. A small meter says what each mode costs.
//
// Modes (tap the View button to change): Direct (the game as published), Phaser (hosted, no effects), Phaser + effects.
// The second button switches Ilyas between the game's painted figure and the one drawn from pieces (skin.js).
(function () {
  'use strict';
  if (typeof Phaser === 'undefined' || typeof cv === 'undefined') { return; }

  const MODES = ['Direct', 'Phaser', 'Phaser + effects'];
  // (the skinned figure, where its scripts are on the page: skin.js, with its pieces in skin_kit.js and the skin_art_*.js files. The
  // pieces he starts in are made as the page opens; the rest as he comes to need them)
  const HAS_SKIN = typeof Skin !== 'undefined' && typeof SkinArt !== 'undefined';
  if (HAS_SKIN) { Skin.install(); Skin.ready = Skin.prewarm(); }
  // (the cast's skins, cast_skin.js: everyone the cast's painter draws, from textures made of each of them as they first appear)
  const HAS_CAST = typeof CastSkin !== 'undefined' && CastSkin.install();
  // (the fall's new cut, fall_cut.js: the roof's end and the fall filmed again, in place of the two stages' own scripts while it is on)
  const HAS_FALL = typeof FallCut !== 'undefined' && FallCut.install();
  try { const o = JSON.parse(localStorage.getItem('sk_phost') || 'null'); if (HAS_SKIN && o && o.skin === false) { Skin.state.on = false; } if (HAS_CAST && o && o.cast === false) { CastSkin.state.on = false; } if (HAS_FALL && o && o.fall === false) { FallCut.state.on = false; } } catch (e) { /* no storage */ }
  const q = new URLSearchParams(location.search);
  // (in the flow test's page the switches live in its Test panel and are remembered; there the effects start on)
  const IN_FLOW = typeof FLOW !== 'undefined' && !!FLOW.on;
  let saved = null; try { saved = JSON.parse(localStorage.getItem('sk_phost') || 'null'); } catch (e) { saved = null; }
  const start = q.get('host') != null ? +q.get('host') : saved && typeof saved.mode === 'number' ? saved.mode : IN_FLOW ? 2 : 1;
  const state = { mode: Math.max(0, Math.min(2, start | 0)), hostMs: 0, err: null, frames: 0 };
  const save = () => { try { localStorage.setItem('sk_phost', JSON.stringify({ mode: state.mode, skin: HAS_SKIN ? Skin.state.on : true, cast: HAS_CAST ? CastSkin.state.on : true, fall: HAS_FALL ? FallCut.state.on : true })); } catch (e) { /* no storage: nothing kept */ } };
  window.PHOST = state;

  // ---------- the Phaser canvas, under the game's ----------
  const gl = document.createElement('canvas');
  gl.id = 'phaserCv';
  gl.setAttribute('aria-hidden', 'true');
  gl.style.pointerEvents = 'none';
  cv.parentElement.insertBefore(gl, cv);

  const KEY = 'game';
  let img = null, texW = 0, texH = 0, fx = null, t0 = 0;

  class Host extends Phaser.Scene {
    constructor() { super('host'); }
    create() { this.bind(); }
    // (the game's canvas changes size with the screen: the texture and Phaser's own canvas follow it, pixel for pixel)
    bind() {
      const w = cv.width, h = cv.height;
      if (this.textures.exists(KEY)) { this.textures.remove(KEY); }
      // (a plain texture over the game's canvas, not Phaser's CanvasTexture: that one reads the pixels back, which can take a
      // canvas off the GPU)
      this.textures.create(KEY, cv, w, h).add('__BASE', 0, 0, 0, w, h);
      texW = w; texH = h;
      this.scale.resize(w, h);
      this.cameras.main.setSize(w, h);
      if (img) { img.destroy(); }
      img = this.add.image(0, 0, KEY).setOrigin(0, 0);
      gl.style.width = ''; gl.style.height = '';
    }
    update() {
      if (cv.width !== texW || cv.height !== texH) { this.bind(); }
      else { this.textures.get(KEY).source[0].update(); }
      state.frames++;
    }
  }

  let game = null;
  try {
    game = new Phaser.Game({
      type: Phaser.WEBGL, canvas: gl, width: cv.width, height: cv.height, backgroundColor: '#000000',
      banner: false, audio: { noAudio: true }, input: { mouse: false, touch: false, keyboard: false, gamepad: false },
      scale: { mode: Phaser.Scale.NONE, autoCenter: Phaser.Scale.NO_CENTER },
      render: { antialias: true, powerPreference: 'high-performance' },
      scene: Host
    });
    // what Phaser's own frame takes on the main thread: the texture sent up, the scene drawn, the filters run
    game.events.on('prestep', () => { t0 = performance.now(); });
    game.events.on('postrender', () => { state.hostMs += (performance.now() - t0 - state.hostMs) * .05; });
  } catch (e) { state.err = String(e && e.message || e); state.mode = 0; }
  state.game = game;

  // ---------- the effects: what a GPU renderer adds that the 2D canvas cannot afford on a phone ----------
  function effects(on) {
    const cam = game && game.scene.getScene('host') && game.scene.getScene('host').cameras.main;
    if (!cam) { return; }
    if (on && !fx) {
      const list = cam.filters.internal;
      // bloom: the bright parts (lamps, gilt, the blade's arc) blurred and laid back over the picture
      const pf = list.addParallelFilters();
      pf.top.addThreshold(.62, .95);
      pf.top.addBlur(1, 2, 2, 1.4, 0xffffff, 4);
      pf.blend.blendMode = Phaser.BlendModes.ADD;
      pf.blend.amount = .55;
      // grade: a little more contrast, a little less colour
      const cm = list.addColorMatrix();
      cm.colorMatrix.contrast(.12, true);
      cm.colorMatrix.saturate(-.12, true);
      // the corners drawn down
      const vg = list.addVignette(.5, .5, 1.2, .5);
      fx = [pf, cm, vg];
    } else if (!on && fx) {
      cam.filters.internal.clear();
      fx = null;
    }
  }

  function apply() {
    const hosted = state.mode > 0 && game && !state.err;
    cv.style.opacity = hosted ? '0' : '';
    gl.style.display = hosted ? '' : 'none';
    if (game) {
      if (hosted) { game.loop.wake(); } else { game.loop.sleep(); }
      try { effects(state.mode === 2); } catch (e) { state.err = 'effects: ' + String(e && e.message || e); }
    }
    draw();
  }

  // ---------- the bar: the two switches and the meter ----------
  const N = 120, dts = new Float32Array(N);
  let k = 0, filled = 0, lastT = 0;
  const bar = document.createElement('div');
  bar.id = 'phostBar';
  bar.style.cssText = 'position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 3px);transform:translateX(-50%);z-index:99999;display:flex;gap:5px;align-items:stretch;' +
    'font:500 10.5px/1.2 "IBM Plex Mono",ui-monospace,monospace;white-space:nowrap';
  const mkBtn = id => { const b = document.createElement('button'); b.type = 'button'; b.id = id;
    b.style.cssText = 'font:inherit;color:#f3e3b3;background:rgba(10,9,8,.84);border:1px solid #6d5a2b;border-radius:8px;padding:3px 8px;text-align:center;white-space:pre;touch-action:manipulation';
    bar.appendChild(b); return b; };
  const pill = mkBtn('phostMeter'), figBtn = HAS_SKIN ? mkBtn('phostFig') : null;
  if (IN_FLOW) { bar.style.display = 'none'; }
  document.body.appendChild(bar);
  pill.addEventListener('click', e => { e.stopPropagation(); state.set(state.mode + 1); });
  state.set = m => { state.mode = m % (game && !state.err ? 3 : 1); filled = 0; k = 0; apply(); save(); };
  if (figBtn) figBtn.addEventListener('click', e => { e.stopPropagation(); Skin.state.on = !Skin.state.on; filled = 0; k = 0; draw(); save(); });

  // ---------- in the flow test: three more switches in its Test panel, and the meter as a line under them ----------
  let rows = null, meterLine = null;
  function panelRows() {
    const p = IN_FLOW && FLOW.panel && FLOW.panel.querySelector('.fw-in'); if (!p || rows) { return; }
    const parts = [['view', 'Phaser view', 'The picture shown through the GPU'], ['fx', 'Glow and grade', 'Bloom and a colour grade, over Phaser view']];
    if (HAS_SKIN) { parts.push(['skin', 'Ilyas from drawn pieces', 'Art pieces on the same ragdoll']); }
    if (HAS_CAST) { parts.push(['cast', 'Everyone else skinned', 'Each of them painted once in detail, laid on the ragdoll']); }
    if (HAS_FALL) { parts.push(['fall', 'The fall, new cut', 'The roof\u2019s end and the fall, filmed again. Off: the scene as it is']); }
    const h = document.createElement('p'); h.className = 'fw-h'; h.textContent = 'Look (Phaser test)';
    rows = document.createElement('div'); rows.className = 'fw-parts';
    rows.innerHTML = parts.map(([k2, n, d]) => '<label class="fw-part"><input type="checkbox" data-ph="' + k2 + '"><span><b>' + n + '</b><small>' + d + '</small></span></label>').join('') +
      // (two ways to it: the roof's whole scene and then the fall, or the fall alone)
      (HAS_FALL && typeof storyGo === 'function' ? '<div class="fw-foot" style="margin-top:8px"><button type="button" class="fw-go" data-phgo="roof">Play the roof, then the fall</button><button type="button" class="fw-go" data-phgo="fall">Play the fall</button></div>' : '');
    rows.addEventListener('click', e => { const b = e.target.closest && e.target.closest('button[data-phgo]'); if (!b) { return; } e.stopPropagation(); if (typeof ensureAudio === 'function') { ensureAudio(); }
      if (typeof flowPanel === 'function') { flowPanel(false); } S.paused = false; storyGo(b.dataset.phgo); });
    meterLine = document.createElement('p'); meterLine.className = 'fw-t'; meterLine.style.margin = '8px 0 0';   // (not the panel's own .fw-stat: the flow test fills the first of those)
    const before = p.querySelector('.fw-h');
    p.insertBefore(h, before); p.insertBefore(rows, before); p.insertBefore(meterLine, before);
    rows.addEventListener('change', e => { const c = e.target, k2 = c && c.dataset && c.dataset.ph; if (!k2) { return; } e.stopPropagation();
      if (k2 === 'skin') { Skin.state.on = !!c.checked; save(); }
      else if (k2 === 'cast') { CastSkin.state.on = !!c.checked; save(); }
      else if (k2 === 'fall') { FallCut.state.on = !!c.checked; save(); }
      else { const view = k2 === 'view' ? c.checked : state.mode > 0 || c.checked, fx = k2 === 'fx' ? c.checked : state.mode === 2; state.set(view ? (fx ? 2 : 1) : 0); }
      draw(); });
  }
  function panelFill() {
    if (!rows) { return; }
    const ok = !!game && !state.err;
    rows.querySelectorAll('input[data-ph]').forEach(c => { const k2 = c.dataset.ph;
      c.checked = k2 === 'view' ? state.mode > 0 : k2 === 'fx' ? state.mode === 2 : k2 === 'cast' ? CastSkin.state.on && !CastSkin.state.err : k2 === 'fall' ? FallCut.state.on : Skin.state.on && !Skin.state.err;
      c.disabled = k2 === 'skin' ? !!Skin.state.err : k2 === 'cast' ? !!CastSkin.state.err : k2 === 'fall' ? false : !ok; });
    meterLine.textContent = (state.err ? 'Phaser did not start on this device. ' : '') + (filled < 30 ? 'Frame time: measuring.' : 'Frame time: ' + state.avg.toFixed(1) + ' ms, worst ' + state.worst.toFixed(0) + ' ms' + (state.mode > 0 ? ', of which Phaser ' + state.hostMs.toFixed(1) + ' ms.' : '.') + '');
  }

  function draw() {
    let sum = 0, worst = 0, slow = 0;
    for (let i = 0; i < filled; i++) { const d = dts[i]; sum += d; if (d > worst) { worst = d; } if (d > 20) { slow++; } }
    const avg = filled ? sum / filled : 0;
    const l1 = 'View: ' + MODES[state.mode];
    const l2 = state.err ? 'Phaser did not start' : filled < 30 ? 'measuring' : avg.toFixed(1) + ' ms  worst ' + worst.toFixed(0) + (state.mode > 0 ? '  Phaser ' + state.hostMs.toFixed(1) : '');
    pill.textContent = l1 + '\n' + l2;
    if (figBtn) { const K = Skin.state; figBtn.textContent = 'Ilyas: ' + (K.err ? 'painted' : K.on ? 'drawn pieces' : 'painted') + '\n' + (K.err ? 'pieces failed' : 'tap to switch'); }
    if (!(IN_FLOW && FLOW.panel && !FLOW.panel.hidden) || filled >= 30 && !state.avg) { state.avg = avg; state.worst = worst; state.slow = filled ? slow / filled : 0; }
    panelRows(); panelFill();
  }
  function tick(now) {
    requestAnimationFrame(tick);
    if (lastT && !(IN_FLOW && FLOW.panel && !FLOW.panel.hidden)) { dts[k] = now - lastT; k = (k + 1) % N; if (filled < N) { filled++; } }
    lastT = now;
    // (Phaser wakes its own loop when the page comes back into view: in Direct it stays asleep)
    if (game && state.mode === 0 && game.loop.running) { game.loop.sleep(); }
    if (k % 30 === 0) { draw(); }
  }
  requestAnimationFrame(tick);

  if (game) { game.events.once('ready', apply); } else { apply(); }
})();
