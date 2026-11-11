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

The second button switches Ilyas between the game's painted figure and one drawn from art pieces fitted to the same ragdoll.
The ragdoll, the poses, the coat's springs, the blade and every rule of what he wears are the game's own; only the drawing of
him changes.

| File | What it holds |
|---|---|
| `skin.js` | the figure: which pieces a state needs, where each goes on the ragdoll, what is drawn over what |
| `skin_kit.js` | what the drawings are made with: the registry, the materials, the far side's colours |
| `skin_art_body.js` | the prologue: the long coat (whole, shot to rags in four steps), the suit, the vest and bare arms under it |
| `skin_art_head.js` | his head from five sides (profile, three-quarter front and back, face, back), the cap and the helmet |
| `skin_art_pit.js` | Act I: his skin and its dressings, every shirt, coat and armour of the Pit, the stump and the empty sleeve, boots, sandals, bare feet |

A piece is an SVG drawing in the game's units, made into a bitmap the first time it is needed (6 pixels to a unit). A limb is
one drawing bent at the joint. The torso is a stack of layers in the order he wears them: in profile the stack is set on the
spine, and turned it is wrapped round the body on the painted figure's own sections, with a drawing of its front and of its
back for where a side view has nothing to show. The coat's skirt is a sheet on a grid, hung between the legs in profile and
round them as a cone when he turns. The head has a drawing for each side it is seen from.

### What it covers

Every state the game draws him in, in the look the game uses (Noir Gilt, the long coat, the swept-back hair):

- in profile and turned through a spin, the head turning on its own;
- the prologue: the coat worn, swept round as a shield, opened on the grenade, shot to rags, its hem torn; the coat off; the
  arm tearing and gone; the tattoos lit, flaring and drained to scars; the head off;
- Act I: one arm, the dressed stump, the sleeve pinned or loose, and every kit the crate and the shops can make of the 26 pieces
  of gear (9,216 kits; the check goes through each, with the sleeve pinned and loose and the hand open and shut, for its pieces);
- the tears a blade leaves, in the game's own shapes, on the piece that was struck;
- the gear screen's three standing views.

What still goes to the painted figure: a look, an outfit or a hair asked for by name (the look page), and a frame or two
while a piece is being made the first time an outfit is seen. The gear screen draws him once for a change of kit, so there the
picture waits for a new piece and is drawn when it is ready.

### Where it differs from the painted figure

- The light. The pieces carry a soft light from in front; the scene's light adds the rim down the lit edge of each limb and of
  the torso. The painted figure works out a plane of light on every shape.
- A coat shot to rags has its holes where the drawing put them, and they do not smoulder.
- Bitmaps are 6 pixels to a unit, so a close-up beyond that scale is soft where the painted figure stays sharp.
- On the workspace's software canvas, at four pixels to a unit, a figure takes about 4 ms to draw in profile against the painted
  figure's 3, and 5 to 7 ms through a spin against 2.5 to 3 (the torso is up to some 280 small pieces then). A phone draws
  bitmaps on its graphics chip, so its own figures will differ and are still to be read.

The pieces are drawn by the 2D canvas inside the game's own figure slot, not by Phaser. Drawn there, the scene's layers and
shadows treat the figure as they treat the painted one. Phaser could draw the same pieces, but only once the scene is handed
to it in layers (behind the figures, the figures, in front of them); today it gets one flat picture.

The build lets a few of the look module's own helpers out of the built page, so the drawn figure uses the game's blade, coat
springs, shield shape, scarf ribbon, tear shapes and Pit colours and not copies of them (`blade`, `coatStep`, `layerOpen`,
`layerClose`, `shieldShape`, `pitLook`, `scarfRibbon`, `ripShape`, added to its `return{...}`). The game's source is not changed.

## In the flow test

On the branch `claude/flow-test` the same scripts go over the flow test's page, and the three switches (Phaser view, Glow and
grade, Ilyas from drawn pieces) sit in its Test panel under their own heading, with the frame time on a line below them. They
are remembered between visits (`sk_phost` in the browser's storage) and all start on.

```
python3 build.py
python3 tools/flow_test.py flow-test.html
python3 spike/phaser/build_spike.py flow-test.html flow-phaser
```

That writes `spike/phaser/out/flow-phaser.html` and `out/flow-phaser-index.html`, the wrapped page the flow test's artifact
is published from. `sk_flowui.js` is not changed: `host.js` adds its rows to the panel once the panel is built.

## In the flow test

On the branch `claude/flow-test` the same scripts go over the flow test's page, and the three switches (Phaser view, Glow and
grade, Ilyas from drawn pieces) sit in its Test panel under their own heading, with the frame time on a line below them. They
are remembered between visits (`sk_phost` in the browser's storage) and all start on.

```
python3 build.py
python3 tools/flow_test.py flow-test.html
python3 spike/phaser/build_spike.py flow-test.html flow-phaser
```

That writes `spike/phaser/out/flow-phaser.html` and `out/flow-phaser-index.html`, the wrapped page the flow test's artifact
is published from. `sk_flowui.js` is not changed: `host.js` adds its rows to the panel once the panel is built.

## Checks

- `node spike/phaser/check_spike.js`: the page in each mode on a phone-sized screen, no errors, a picture of each.
- `node spike/phaser/shots.js "Skirmish lab"`: the same paused moment in the three modes, for comparing the pictures.
- `node spike/phaser/check_skin.js [first] [last] [seconds]`: the drawn figure in the game. Each chapter and the skirmish lab is
  opened and played at with taps and keys, and every drawing of Ilyas is counted by what he had on and whether the pieces drew
  him. It fails on an error, a piece that could not be made, or a case left to the painted figure.
- `node spike/phaser/sheet.js <set> [out.png] [scale] [both|painted|drawn] [body|head|torso]`: a sheet of him in a list of
  states, the painted figure beside the drawn one. The sets are named at the top of the file: the eight sides, the prologue's
  states, the coat's, the Pit's outfits and gear, each of those turned, and the gear screen's views (`gv1` to `gv3`).

The workspace's Chromium draws WebGL in software, so the times it reads say nothing about a phone. Read them on the phone.

## What it does not test

Phaser drawing the game itself. Every figure and place is painted with 2D canvas paths; a real port would redraw them as
sprites, meshes or shaders, and this test does none of that.
