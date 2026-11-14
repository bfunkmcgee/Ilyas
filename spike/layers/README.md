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

- **Parallax, in the yard.** The yard's still picture is painted back to front in bands: the far side of the Pit, the neighbours'
  shacks with the lane beyond the fence, the yard itself. Here the two far bands go on sheets of their own under the plate, and
  each has its own view of the world, worked out from the camera's:
  - going along the yard, the far side follows a fifth of the camera's move and the neighbours' shacks about seven tenths, so
    they slide past slower than the yard does;
  - pushing in, the far side grows as the 0.65th power of the push and the shacks as the 0.88th, so from the whole yard to a
    close shot the far side grows about two thirds as much as the yard and shows more of its wall;
  - the bands stand on the line where the yard's ground ends, and keep to it;
  - a band grown less shows more of itself higher up. In a view that looks high the bands are let grow until the far wall's own
    view stops where its painted wall does, so the sky comes into a shot only where the game's own picture has it. The widest
    view on an upright phone looks that high already, and has the bands as they were painted.
  What moves on the far wall (smoke, fires, windows going dark, the tram, the picture above the layer) is drawn on the far
  band's sheet, so it slides and softens with it. Each band has its own softness with the focus on. Where motion is reduced
  the bands stand still, as painted.

- **The lamps, in the yard.** The yard's lamps are Phaser's own lights (its lights manager, with the air left white): the
  door's lantern and the gate's lamp, the window, the open door at night, the fire ring, the drum fire in the lane, the shed's
  lantern, the table's, and the lamps strung along the lip in three groups. The stage takes them, so the people and the pieces
  near a lamp are lit by it, warmer and brighter the nearer they stand, and the light moves as its flame does. Where each lamp
  is, how far it reaches and how strong it is by the hour is said by the yard's painter (`lampsAt`, added to this page's copy by
  `build_layers.py`: it uses the painter's own places for its lamps and its own measures of flicker). By day only the two
  fires give any, and little. The Test panel has two rows for it: Lamps (on, off) and Hour (day, dusk, night: Act I's own hours,
  set on this page for looking).

A frame is painted flat, as published, wherever the sheets cannot be used: Phaser's view off, a place that finishes its own picture
(the fall) or streaks its light (the road at sundown), the old look, a screen that has just changed size. `LayerTest.why` says
which. Everything the test adds sits under the game's own canvas in Phaser's scene, so a fault leaves the published picture.

## Build and open

```
python3 build.py
python3 spike/layers/build_layers.py
```

That writes `spike/layers/out/layers-test.html` and `out/index.html`, wrapped for publishing. In that copy of the page the yard's
painter is opened so that it can paint its bands apart (the `YARD` list in `build_layers.py`: each piece of the painter's text
must be found once, or the build stops). The test changes nothing in `envx/env_yard.js`. Since the yard's painter lays some things
over its own light (the things along the walls a second time, what grows: the V118 work on the yard), the band the yard itself
is on gets them in that order too: the light, those, then the place's key light. The page carries the motion test as
well (spike/motion: the drawn pose and its panel), and opens on its walk across the yard. It is published as a private test page
of its own, "Ilyas: layers test" (artifact 4d618786-0672-492b-89f5-519c9ad07370: index.html and the sounds the test's scenes
play), beside the game's page and the motion test's, which it does not touch.

The Test button opens the panel: what a frame costs on this device, the drawing (the motion test's new or old), the scene (the walk,
the yard as the game plays it, a fight in the restaurant that plays itself), the picture (in layers or flat), the focus (all of it,
about half of it, or none), the dust, the parallax, the lamps and the hour. The button beside it switches between layers and flat.

| File | What it holds |
|---|---|
| `layers.js` | the sheets and their seams, the focus's masks, the footfalls, the bloom, the far bands and their views, the lamps, and Phaser's side of it all |
| `panel.js` | its rows in the motion test's panel, and the meter |
| `build_layers.py` | the built game with the motion test and these two added after its script, and the yard's painter opened in that copy |
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

### The parallax

- **The same picture with the bands unmoved.** The bands apart, their sliding and their growing both turned off, the row behind
  left out, the focus off, against the whole picture on the sheets: 0.35 of 255 apart on average, 0.33% of the pixels by more
  than 12. What differs is fine lines on the far wall and the pole's wires, which are painted smaller on the bands' sheets and
  drawn out again.
- **The same game.** `probe.js` again with the bands apart: all six scenes agree (the yard 899 frames on the sheets, the walk 599).
- **Pictures looked at** on an upright phone: the walk's pan from end to end; the yard as the game plays it (the whole yard, the
  door, the pump, Dob on his crate); the camera put at the far left and far right of the yard at 440 and 300 units of view, and
  looking up over the roof; by night and at dusk; and a phone held sideways, where the walk's view shows no far wall at all.
- **Switching.** Parallax off and on, flat and back, the three settings of focus, the restaurant and back to the yard, the screen
  turned, Phaser's view off and on: by the page's own buttons at 412x714, no errors, and each state as the meter says.
- **What it costs.** Painting the bands the first time the yard is shown took about a quarter of a second here, once (the yard's
  still picture is painted, then its three bands). After that, on this machine's software canvas, a frame's painting measured
  the same with the bands apart as without. As with the rest, only the phone can say what Phaser's side costs.

## Found on the way

- **The fill over the layer.** A view taller than the layer is filled above it with the colours of the layer's top row, and the
  picture above the layer is drawn over that fill. With the far wall on a sheet under the plate, the fill hid it: the yard's
  layer carries no top row while its far bands are apart.
- **A wire that ends in the air.** In the game's own yard one of the two wires from the pole ends in the air a little right of
  the woodshed (env_yard.js, `neighbours`: the curve ends at 700, 126; the woodshed's roof ends at 652). On the middle band's
  sheet both wires run on to the Sump.

- **The game has its own light and air already** (sk_lightui.js, since V38): each fighter in a sprite of his own, the shadows and
  reflections made from it, rain, mist and motes by place, dust and sparks at the big moments; and its own finish over the frame
  (env_look.js: bloom, dark edges, grain). The yard has none of that air. So what Phaser adds in dust is where it sits (between
  the sheets, in front of one and behind another) and what it costs, not that there is dust.
- **Phaser's own tilt-shift filter is not used.** It takes a hundred samples for every pixel, and its sharp band is fixed across
  the middle of the screen. The focus here is two small blurred copies and two masks: a handful of samples, and sharp where he is.
- **A filter runs at its picture's own size**, not the screen's. A copy a quarter the size is blurred at a sixteenth of the cost
  and then drawn out to the screen.
- **Phaser's particle emitter draws on `Math.random`.** So does the game, for its dice. The dust is sprites the test places itself.

### The lamps

- **Tried first on the plate as well, and taken off it.** A light in Phaser multiplies what it falls on. The yard's still
  picture has its lamplight painted on it already, so by the back door at night the lit wall and the step went to white under
  a light strong enough to show on the dark ground beside them. With the painter's own pools laid on at three tenths it was
  the same: the wall by the door is bright from the door itself. So the plate keeps its painted light and only the stage is
  lit. To light the ground and the walls this way the place would have to be painted a second time with none of its own
  lamplight on it, and the lights would then have to give all of it.
- **No normal maps.** The stage's sheet has none, so Phaser's flat one stands in: a lamp is a round of light falling off from
  where it hangs, the same on every face of a thing. Its height off the sheet (a part of its reach) sets how wide and soft
  the round is.
- **A lamp is where it is in the picture, not in the yard.** A man who stands well in front of a lamp but under it on the
  screen is lit by it. The lamps' reaches are kept short on the walls for that; the door's light at night is let fall across
  the yard, as it would.
- **What the stage already paints bright goes brighter**: the shed's window and the glass of the lamps on the line glow hot
  under their own lights.
- **Ten lights at once** is Phaser's own limit as the page is set up; the yard has eleven after dark. Lights outside the view
  are not counted, and a view that holds all eleven loses the one furthest from its middle.
- **A name.** Another place keeps its own list under `lamps`, so the painter's word here is `lampsAt`; calling the list as a
  function stopped the sheets on the title screen until it was renamed.
- **Checked**: the page by its own rows at 412x714 (the walk and the yard: the hour to night, the lamps off and on, dusk, day:
  eleven lamps, none, eleven, ten, two; no errors); stills through Phaser with the lamps on and off by the door at night and
  at dusk, by the fire and by the shed; `probe.js` on the yard and the walk (the game computes the same). What the lights cost
  on a phone is not known here, as with the rest: one more pass of the stage through a shader that reads up to ten lights.

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
- **The parallax is the yard's only**, and has three planes. The floor itself cannot take part: the game draws depth on the floor
  as a slant, with no vanishing point, so every row of it moves at one pace. A place gets its bands by its painter being opened
  band by band, as the yard's is here.
- **The neighbour's shack past the Sump's corner goes with the middle band.** With the camera at the yard's far left it slides
  out of view and the alley beside the stair widens onto the far wall. The row over the yard wall is painted on behind the
  woodshed for the other end; nothing is painted on behind the Sump on this side.
- **The far side is less soft with the bands apart** (2.4 points at full focus, against 3.6 on the plate), so that its rows of
  shacks can be seen to slide. Turning the parallax off at full focus makes it softer again.
- **The yard is painted twice over the first time it is shown**: whole, for the game's own measuring, then band by band.
- Nothing is in the game. The published page is as it was.

## The yard's south (V118, in work)

The test page is built from the working tree, so it shows the yard as the branch has it: the floor run on south, twice as far as
it first was, to a drain in a bank of spoil, a kerb with Tarr's main on it, and the lip of the quarry's last cut with a shed by
it; a garden, a practice ground, the quarry's tram road and more between (GUIDE.md, "The yard's south"). It is the first place
to walk about in it. What that means for the layers:

- The south is on the near band with the rest of the floor: its pieces (the shed, the main, the rail and hoist with their lamps,
  the fire, the cart, the garden's two rows, the tree, the wagon, the sleepers, the table, the straw man) go on the stage's
  sheet with the people, and what moves in the picture (the gully, the drain, the cut) on the plate.
- The yard's layer is higher than the others (1200 world units where they have 960: `EnvLook.S.yard.deep`). The sheets take
  their size from the game's layer, so nothing here had to change for it; at 2.4 pixels a unit it is 3072 x 2880.
- The yard's painter is opened by the same patches, which follow its changed lines (`YARD` in build_layers.py: the south's
  shade and its second painting are with the light and the over pass; the E.S.yard line names the layer's height now).
- The focus follows him south: the Sump goes soft behind him, and the view down past the lip is soft as the nearest rows are.
- `probe.js` on the yard and on the walk: the sums agree, flat and on the sheets, with the walk about begun.
