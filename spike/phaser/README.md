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
`2` to start in a mode; tap the View button at the top to change it.

| Mode | What draws the screen |
|---|---|
| Direct | the game's own canvas, as published; Phaser asleep |
| Phaser | Phaser, showing the game's canvas as a texture |
| Phaser + effects | the same, with Phaser's filters over it: bloom on the bright parts, a grade, a light vignette |

The meter shows the time between frames (average, worst, share over 20 ms) and, in the Phaser modes, the main-thread time
Phaser's own frame takes.

## The skinned figure

The second button switches Ilyas between the game's painted figure and one drawn from art pieces fitted to the same ragdoll
(`skin.js`; the pieces are SVG drawings in `skin_ilyas.js`). The ragdoll, the poses, the coat's springs and the blade are the
game's own. Limbs are single drawings bent at the joint, the torso, head, hands and shoes are stiff pieces, and the coat's skirt
is a drawing stretched over a grid hung from the hips to the hem corners.

It covers the Ilyas of the fights: in profile, two arms, the long coat. Anything else (Act I's clothes, one arm, a portrait)
falls back to the painted figure. It does not have the painted figure's turning body, its light that follows the scene's
lamps, the tears a blade leaves in the suit, or the wind in the coat.

The pieces are drawn by the 2D canvas inside the game's own figure slot, not by Phaser. Drawn there, the scene's layers and
shadows treat the figure as they treat the painted one. Phaser could draw the same pieces, but only once the scene is handed
to it in layers (behind the figures, the figures, in front of them); today it gets one flat picture.

For the blade, the build lets `blade` out of the look module of the built page (one name added to its `return{...}`); the
game's source is not changed.

## Checks

- `node spike/phaser/check_spike.js`: the page in each mode on a phone-sized screen, no errors, a picture of each.
- `node spike/phaser/shots.js "Skirmish lab"`: the same paused moment in the three modes, for comparing the pictures.

The workspace's Chromium draws WebGL in software, so the times it reads say nothing about a phone. Read them on the phone.

## What it does not test

Phaser drawing the game itself. Every figure and place is painted with 2D canvas paths; a real port would redraw them as
sprites, meshes or shaders, and this test does none of that.
