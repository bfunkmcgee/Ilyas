# Layers test

A test, not part of the game. It answers one question: what does Phaser add once the game hands it the picture in layers, and not
as one finished picture?

The published page (since V116) paints the whole frame on the game's 2D canvas and Phaser shows that canvas with a glow and a grade
over it. Phaser cannot put anything between the figures and what is behind them, because it never sees them apart. Here it does.

## What it does

The same painters, in the same order, paint the frame onto three sheets:

| Sheet | What is on it |
|---|---|
| the plate | the place and everything laid on its floor: the scene's layer, its moving parts, the light and the shadows on the ground |
| the stage | everyone and everything that stands on the floor, far to near: the figures and the place's pieces |
| the top | what goes over them: the air in front, the sparks, the dark at the edges, the words, the bars, the labels |

The game's painters all draw through one variable, `ctx`, and the game itself points it at another canvas when it draws a fighter
into his sprite (sk_lightui.js). The sheets are changed the same way, at two places in `render()`: where it gathers what stands on
the floor (`envItems`), and at the first thing it draws once they are down (`FXL.front`, `FXL.grade` or `drawFx`). The top sheet is
the game's own canvas, so whatever is drawn outside `render()` lands where it always did. No file of the game is changed.

Phaser shows the three sheets one over the other, and between them:

- **Focus.** Two more copies of the plate, one a little blurred and one a good deal, laid over it through masks that follow depth:
  nothing soft at the depth Ilyas stands at, more the further a row of the floor lies from it (the game's own projection says how
  deep a row is), the wall at the far edge of the floor as soft as the floor at its foot, and what rises beyond the wall softest.
  The focus follows him over half a second when he walks deeper or nearer. The copies are a half and a quarter the size, so the
  blurring is cheap. Set for the yard and the restaurant; other places go onto the sheets and stay sharp.
- **Dust.** Motes in the air behind the stage and in front of it, the near ones larger and faster past the camera, and a puff where
  a foot comes down on the yard's dirt. Only in the yard. They are Phaser sprites placed by the test from a hash of each one's
  number. Phaser's own particle emitter is not used: it draws on the page's `Math.random`, which is the game's dice.
- **The finish's bloom.** The game blooms its one picture (env_look.js). On the sheets that pass finds only the top, so the bloom of
  the plate and the stage is made here the same way (the frame an eighth the size, multiplied by itself twice, at the place's
  strength) and Phaser lays it over them in the blend the game uses.

A frame is painted flat, as published, wherever the sheets cannot be used: Phaser's view off, a place that finishes its own picture
(the fall) or streaks its light (the road at sundown), the old look, a screen that has just changed size. `LayerTest.why` says
which. Everything the test adds sits under the game's own canvas in Phaser's scene, so a fault leaves the published picture.

## Build and open

```
python3 build.py
python3 spike/layers/build_layers.py
```

That writes `spike/layers/out/layers-test.html` and `out/index.html`, wrapped for publishing. The page carries the motion test as
well (spike/motion: the drawn pose and its panel), and opens on its walk across the yard.

The Test button opens the panel: what a frame costs on this device, the drawing (the motion test's new or old), the scene (the walk,
the yard as the game plays it, a fight in the restaurant that plays itself), the picture (in layers or flat), the focus (all of it,
about half of it, or none) and the dust. The button beside it switches between layers and flat.

| File | What it holds |
|---|---|
| `layers.js` | the sheets and their seams, the focus's masks, the footfalls, the bloom, and Phaser's side of it all |
| `panel.js` | its rows in the motion test's panel, and the meter |
| `build_layers.py` | the built game with the motion test and these two added after its script |
| `probe.js` | the check that the game computes the same on the sheets as flat |
| `shots.js` | pictures of the page through Phaser: one moment drawn several ways, or a strip of frames |

## What was checked

- **The same picture.** One moment painted flat, then on the sheets with the focus and the dust off (`shots.js still`). In the
  walk the two pictures differ by 0.09 of 255 on average, and 0.02% of their pixels by more than 12; in the yard as the game plays
  it, 0.09 on average and nowhere by more than 13. Painting one moment twice the same way gives more than that (0.23% of the
  pixels), because a walking figure's drawing moves on a little with each painting. In the restaurant the hanging lamps swing
  between two paintings as well; nothing else was found there.
- **The same game.** `probe.js`: six scenes, each played twice flat and once on the sheets with the same dice, every frame painted,
  the game's state summed every 300 frames. The sums agree in all six: the walk (599 frames on the sheets), the yard (899), a
  three-a-side fight in the restaurant (599), Act I from the roof (599), the toll (299), and the prologue's road, which streaks its
  light and so stayed flat throughout.
- **The painting costs the same.** On this machine's software canvas, 824 by 1428: flat 16 ms a frame, on the sheets 15.6, and 17.7
  with the focus's two small copies made. What Phaser's side costs cannot be read here (below).
- **The page by its own buttons** at 412x714, 360x640 and 844x390: layers and flat, the three scenes, the screen turned and turned
  back, Phaser's view off and on again. No errors.
- The pictures were looked at in the yard by day and by night, in the restaurant and on the stair-street at dusk. On the stair the
  shop signs behind the walkway went too soft to read, which is why the focus is set place by place.

## Found on the way

- **The game has its own light and air already** (sk_lightui.js, since V38): each fighter in a sprite of his own, the shadows and
  reflections made from it, rain, mist and motes by place, dust and sparks at the big moments; and its own finish over the frame
  (env_look.js: bloom, dark edges, grain). The yard has none of that air. So what Phaser adds in dust is where it sits (between
  the sheets, in front of one and behind another) and what it costs, not that there is dust.
- **Phaser's own tilt-shift filter is not used.** It takes a hundred samples for every pixel, and its sharp band is fixed across
  the middle of the screen. The focus here is two small blurred copies and two masks: a handful of samples, and sharp where he is.
- **A filter runs at its picture's own size**, not the screen's. A copy a quarter the size is blurred at a sixteenth of the cost
  and then drawn out to the screen.
- **Phaser's particle emitter draws on `Math.random`.** So does the game, for its dice. The dust is sprites the test places itself.

## What it does not tell, and where it falls short

- **What it costs on a phone.** The published page sends one picture to the graphics chip each frame. This sends three, and two
  small ones more with the focus on, and draws about a dozen passes. This machine draws Phaser in software, which says nothing
  about a phone. The panel's meter is there to be read on the device: the time between frames in layers against flat.
- **The focus goes by rows.** One softness for each row of the screen, so a low shed and a tall house at the far wall share theirs,
  and what shows beside the shed is no softer than the house. The cure is a depth of its own for each part of the plate, painted
  by the scene.
- **The pieces are never soft.** The stage is one sheet, so a barrel well in front of him is as sharp as he is. It cannot go soft
  alone, and blurring the whole sheet would blur him. That needs each piece, and each figure, to be an object of its own in Phaser.
- **A glow drawn among the figures** (a lamp's halo in the restaurant) falls on a clear sheet and is laid over the plate plainly,
  where on the one picture it was added to it. The difference measured small and is not seen at the game's size.
- **The dust takes no light.** It is not in the bloom, and a lamp does not light it.
- Nothing is in the game. The published page is as it was.
