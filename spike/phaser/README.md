# Phaser host test

A test, not part of the game. It answers one question: what does it cost, and what does it add, to show this game through Phaser?

The whole game runs unchanged (rules, ragdolls, painters, HUD, walking about). The game still paints its own 2D canvas. In the
Phaser modes that canvas is made see-through, still taking every touch, and a Phaser 4 scene under it shows the same picture as
a GPU texture sent up again each frame. Nothing under `sk_*.js`, `envx/` or the build is touched.

## Build and open

```
python3 build.py
(cd spike/phaser && npm install)
python3 spike/phaser/build_spike.py
```

That writes `spike/phaser/out/phaser-spike.html` (and `out/index.html`, wrapped for publishing). Open it with `?host=0`, `1` or
`2` to start in a mode; tap the meter at the top to change it.

| Mode | What draws the screen |
|---|---|
| Direct | the game's own canvas, as published; Phaser asleep |
| Phaser | Phaser, showing the game's canvas as a texture |
| Phaser + effects | the same, with Phaser's filters over it: bloom on the bright parts, a grade, a light vignette |

The meter shows the time between frames (average, worst, share over 20 ms) and, in the Phaser modes, the main-thread time
Phaser's own frame takes.

## Checks

- `node spike/phaser/check_spike.js`: the page in each mode on a phone-sized screen, no errors, a picture of each.
- `node spike/phaser/shots.js "Skirmish lab"`: the same paused moment in the three modes, for comparing the pictures.

The workspace's Chromium draws WebGL in software, so the times it reads say nothing about a phone. Read them on the phone.

## What it does not test

Phaser drawing the game itself. Every figure and place is painted with 2D canvas paths; a real port would redraw them as
sprites, meshes or shaders, and this test does none of that.
