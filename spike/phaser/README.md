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

## The cast's skins

Everyone the cast's painter draws (the named elves, the crews, the Pit's people) is skinned too (`cast_skin.js`; asked for Nov
11: skins for everyone, as Ilyas has). Ilyas's skin is art drawn piece by piece for one man. Theirs are made from each one's
spec, the way the painter makes the man: the painter paints each of his parts once, alone, on a figure stood straight, at six
pixels a unit and at its closest detail, with the finer figures on, and every shape goes through the skin's own painting, which
adds what a frame cannot afford: a soft shadow under each layer, a shade inside each shape's edges, a seam just inside the
edge (stitches on leather), a grain by material, more light on the top of a shape than at its foot. The parts are kept as
textures: each arm and leg, near and far, the torso in two layers (a braid swings between them), the head.

When the game draws him the painter still does the posing and the layering. `CastLook.skin` (sk_castui.js; null in the game) is
where the skin sits: in profile an arm's or a leg's shapes are filled from its texture along the limb as it bends (each half
of the limb a pattern that does not repeat, so a fill takes each half only where it lies), the torso and the head are drawn
from theirs, the eyes are drawn over the head each frame, and the shapes with no texture of their own (hands, shoes, the neck,
the seat, a coat's skirt, an apron) take the material's own tile in a close view and its colour at the game's size, so they
are of a piece with the rest. The place's light goes on over the textures, its plane at half strength.

| What | Where |
|---|---|
| the hook, the one part painted alone (`o.only`), the texture fills | `sk_castui.js` (search "the skin") |
| the light at part strength over a texture (`o.pa`) | `sk_figui.js` |
| the making of the textures and the laying of them on | `cast_skin.js` |

What it does not cover: a turned figure, who is painted as ever, so a man who spins goes from skinned to painted and back; the
beasts and Ilyas, who have their own painters; the weapons; a crowd's small figures.

A part takes about 6 ms to make here (the worst about 20), one a frame the first time a man is drawn, so he is painted for his
first seven frames. A skinned figure costs about 1.9 ms a frame on this machine's software canvas against 1.2 painted, most of
it the limbs' fills; a phone's canvas is not this one, and the Test panel's meter is the number to read. A man's textures
take about 4 MB and go when he does. `CastSkin.state.no` leaves parts to the painter (`l` limbs, `t` torso, `h` head, `m` the
tiles), to tell what each costs on a device.

## In the flow test

On the branch `claude/flow-test` the same scripts go over the flow test's page, and the five switches (Phaser view, Glow and
grade, Ilyas from drawn pieces, Everyone else skinned, The fall, new cut) sit in its Test panel under their own heading, with the frame time on a
line below them. They are remembered between visits (`sk_phost` in the browser's storage) and all start on.

```
python3 build.py
python3 tools/flow_test.py flow-test.html
python3 spike/phaser/build_spike.py flow-test.html flow-phaser
```

That writes `spike/phaser/out/flow-phaser.html` and `out/flow-phaser-index.html`, the wrapped page the flow test's artifact
is published from. `sk_flowui.js` is not changed: `host.js` adds its rows to the panel once the panel is built.

## The fall, a new cut

`fall_cut.js` (`FallCut`) films the roof's last seconds and the whole of the fall again: the same lines and the same things
happening to him, with a camera that moves, a body that acts, and the desert in his head as scenes of its own. It is a fifth
switch in the flow test's panel, "The fall, new cut", on; under it two buttons play the roof and then the fall, or the fall
alone. Off, the two stages run their own scripts: checked frame for frame against the page without the script.

It changes no file of the game. `FallCut.install()` puts its own generators in place of `STAGES` roof's `intro` and fall's
`setup` and `intro` (each calls the stage's own when the switch is off), adds a callback to `V11.step` after the Pit's, a
pass at the head of `V11UI.screen` (under the story's bars and words) and one in `V11UI.world`, and wraps `kaelLight`.

- The roof: the stage's own script runs to the moment he is let go, with this cut's camera from the shot on (a push in, then
  held close while the gilt goes out); the steps back end with his heels on the coping; then the tip is played, not fallen
  (`tip`: the heel nearer the edge on the lip, the body going back over it stiff, slowed), and there is no black. In the game
  as published he never goes over: his mark stays where he stood, and the limp body is drawn back to it across the roof
  before the cut to black.
- His body: poses are angles in his own frame (`POSES`, `poseStep`: each limb turned a part of the way each step, so bones keep
  their lengths and the trunk is not pushed), `act({pose, k, ang, rate, spin})` says what he is asked to do, `turnBy` and
  `stillSpin` face him the way the shot wants. In the Pit he is the game's ragdoll again.
- The camera: `shot(name, {w, wn, dx, dy, at, k, cut})` sets `S.camCut` each step from where he is (`wn` and `dxn`, `dyn` on an
  upright phone); with reduced motion every shot is a cut. The picture is kept above where the fall's far side stops being
  painted (596 down the world) unless the shot says `deep`.
- The desert: three memories, each the whole picture, on the lines that speak of it: the inking (a needle of light down his
  arm, the lines taking light behind it, his eye last), the wire (him small at a post, the posts to the horizon), the well and
  the people with their jars. In through his eye (the picture closes on it and a light takes everything), out by the picture
  torn upward in strands. On "I can wait" the air he lies on becomes a dune under him; the vow tears it away. Each is a plate
  painted once at the screen's size (`plates`, no more than 1.7 million pixels, painted a piece at a time from the stage's
  start by `warm`, let go at the Pit), with him drawn into it by his own painter as he was (`rangerOf`, `bakeFigure`: the
  gilt alight) and a little that moves. `FALL_DREAM` and `FALL_SLOW` are given this cut's values for the stage and put back.
- The Pit: its mouth slowed and wide, the first blow punched in on, the reach slowed, the spike held close, the picture left
  with the arm as he drops (`PC.hold`: the Pit's own camera move taken back each step), then waiting at the Sump's roof; a
  spark in his eye; the arm; the dark closing on its lines.
- Every frame is drawn. Skipping the fall's own drawing under a memory made its painter take up to a second on the first
  frame back, so it is drawn under the memories as always.

Tools kept outside the repository drove it (stills at chosen seconds with the script injected into `test_page.html`). Nothing
new was recorded for it: the wind's loop follows the fall's speed, so the memories are hushed.

## Checks

- `node spike/phaser/check_spike.js`: the page in each mode on a phone-sized screen, no errors, a picture of each.
- `node spike/phaser/shots.js "Skirmish lab"`: the same paused moment in the three modes, for comparing the pictures.
- `node spike/phaser/check_skin.js [first] [last] [seconds]`: the drawn figure in the game. Each chapter and the skirmish lab is
  opened and played at with taps and keys, and every drawing of Ilyas is counted by what he had on and whether the pieces drew
  him. It fails on an error, a piece that could not be made, or a case left to the painted figure. It also says how many of
  the cast were skinned, what share of their drawings had every texture, and what a part took to make, and fails if a
  skin could not be made. `SK_FINE=1` plays with the finer figures on.
- `MODE=skin PAGE=uiwork/qa_test.html node uiwork/look/figsheet.js <out> [K] [easy|guard] [cast|pit|all]`: everyone painted
  (the finer figures on) above and skinned below, on sheets of five. The tool puts `cast_skin.js` into the QA page itself.
- `node spike/phaser/sheet.js <set> [out.png] [scale] [both|painted|drawn] [body|head|torso]`: a sheet of him in a list of
  states, the painted figure beside the drawn one. The sets are named at the top of the file: the eight sides, the prologue's
  states, the coat's, the Pit's outfits and gear, each of those turned, and the gear screen's views (`gv1` to `gv3`).

The workspace's Chromium draws WebGL in software, so the times it reads say nothing about a phone. Read them on the phone.

## What it does not test

Phaser drawing the game itself. Every figure and place is painted with 2D canvas paths; a real port would redraw them as
sprites, meshes or shaders, and this test does none of that.
