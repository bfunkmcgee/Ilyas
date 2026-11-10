// ===== PHASER HOST (a test, not part of the game) =====
// The whole game runs as it is: its rules, its ragdolls, its painters, its HUD and its walking about. This script only changes
// where the picture ends up. The game still paints its own 2D canvas (#cv); in the two Phaser modes that canvas is made
// see-through (it still takes every touch) and a Phaser scene under it shows the same picture as a GPU texture, sent up again
// each frame. The third mode puts Phaser's filters over it. A small meter says what each mode costs.
//
// Modes (tap the meter to change): Direct (the game as published), Phaser (hosted, no effects), Phaser + effects.
(function () {
  'use strict';
  if (typeof Phaser === 'undefined' || typeof cv === 'undefined') { return; }

  const MODES = ['Direct', 'Phaser', 'Phaser + effects'];
  const q = new URLSearchParams(location.search);
  const state = { mode: Math.max(0, Math.min(2, +(q.get('host') || 1))), hostMs: 0, err: null, frames: 0 };
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

  // ---------- the meter ----------
  const N = 120, dts = new Float32Array(N);
  let k = 0, filled = 0, lastT = 0;
  const pill = document.createElement('button');
  pill.type = 'button'; pill.id = 'phostMeter';
  pill.style.cssText = 'position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 4px);transform:translateX(-50%);z-index:99999;' +
    'font:500 11px/1.25 "IBM Plex Mono",ui-monospace,monospace;color:#f3e3b3;background:rgba(10,9,8,.82);border:1px solid #6d5a2b;' +
    'border-radius:9px;padding:4px 9px;text-align:center;white-space:pre;touch-action:manipulation';
  document.body.appendChild(pill);
  pill.addEventListener('click', e => {
    e.stopPropagation();
    state.set(state.mode + 1);
  });
  state.set = m => { state.mode = m % (game && !state.err ? 3 : 1); filled = 0; k = 0; apply(); };

  function draw() {
    let sum = 0, worst = 0, slow = 0;
    for (let i = 0; i < filled; i++) { const d = dts[i]; sum += d; if (d > worst) { worst = d; } if (d > 20) { slow++; } }
    const avg = filled ? sum / filled : 0;
    const l1 = MODES[state.mode] + '  (tap to change)';
    const l2 = filled < 30 ? 'measuring' : 'frame ' + avg.toFixed(1) + ' ms   worst ' + worst.toFixed(0) + '   slow ' + Math.round(100 * slow / filled) + '%';
    const l3 = state.err ? 'Phaser did not start: ' + state.err : state.mode > 0 ? 'Phaser\'s share ' + state.hostMs.toFixed(2) + ' ms' : 'Phaser asleep';
    pill.textContent = l1 + '\n' + l2 + '\n' + l3;
    state.avg = avg; state.worst = worst; state.slow = filled ? slow / filled : 0;
  }
  function tick(now) {
    requestAnimationFrame(tick);
    if (lastT) { dts[k] = now - lastT; k = (k + 1) % N; if (filled < N) { filled++; } }
    lastT = now;
    // (Phaser wakes its own loop when the page comes back into view: in Direct it stays asleep)
    if (game && state.mode === 0 && game.loop.running) { game.loop.sleep(); }
    if (k % 30 === 0) { draw(); }
  }
  requestAnimationFrame(tick);

  if (game) { game.events.once('ready', apply); } else { apply(); }
})();
