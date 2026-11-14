# Look tests

A test on the branch `claude/ink-dither-test`, not part of the game and not published. Three things to judge by eye, each a switch
under "Look tests" in the Options panel, each off until it is switched on. With all three off the page draws the same pixels as
main's (checked at two frames), and test_page.html, which the suites run, has none of it.

| Switch | What it does |
|---|---|
| Dither | A fine blue noise laid into the picture round the finish: every pixel up to two levels lighter before the finish darkens the edges and lays its glow on, and up to one more after. Too fine and too faint to see as grain. It breaks up the steps a slow dark gradient shows. |
| Film grain | The same tile at twice the size, laid on in the `overlay` blend: lit parts of the picture get a grain a phone can show, black stays black. |
| Brushed trails | A weapon's trail as one brush stroke that follows the blade's outer part, as wide as the blade swept there, drawn out to a point where the swing began. |

`?look=dither,grain,ink` in the address switches those on. The switches are remembered (`sk_looktest`). `LOOKTEST` in the page
holds the numbers to try: `pre` and `post` (the dither's levels), `grainA`, and the brush's `at`, `wide`, `slim`, `tail` and `a`.

## Files

| File | What it holds |
|---|---|
| `look_test.js` | the three tests and their switches |
| `bluenoise.js` | the blue-noise tile, 128 by 128, made by `python3 tools/bluenoise.py` (the same every time; never edited by hand) |
| `check_look.js` | the check, below |
| `vendor/perfect-freehand.min.js` | the brush library (perfect-freehand 1.2.3, MIT), bundled as one classic script |

`build.py` puts the library, the tile and the tests after the game's script and the Phaser parts (`LOOK_TESTS`).

## What was found (Nov 13, on the workspace's machine)

- **The game is not changed.** A stage played to the same frame comes out with every joint and the clock the same with each
  test on (`check_look.js`).
- **The dither.** With the contrast raised six or seven times, the darkened edge of the street's sky shows upright stripes and
  the yard's dark ground a regular lattice; with the dither on both dissolve into even noise. At the picture's true contrast no
  difference could be seen in a screenshot. This Chromium already dithers a canvas gradient itself (the lattice is its pattern,
  doubled where the finish lays a half-size layer on); a browser that does not would show plainer bands, and that is the case to
  look at on a phone, in the dark, at full brightness. The picture comes out 1.4 levels lighter on average.
- **The grain** shows on lit walls and windows and leaves the dark alone. Its first form, light and dark specks laid plainly
  over the picture as the finish's own grain is, lifted a dark picture by more than three levels; the `overlay` blend lifts it by none.
- **Brushed trails.** The arc-blade's long coloured trails read as a drawn stroke with a bright core where the game's own is a
  soft wash. A short plain cut (a tenth of a second of trail) comes out a comma by the blade: plainer to see than the game's
  faint band, and a matter of taste. A stroke is never wider than a fifth of its own length, or a short trail is a blot.
- **Cost** on this machine's software canvas, at an upright phone's size (824 by 1428), where a frame of the field's fight
  takes about 12 ms: the dither about 4 ms more (two whole-picture passes), the grain 2 to 3.5, brushed trails nothing that
  could be measured. A phone draws these on its graphics chip; its own numbers are still to be read.
- **Not tried:** an inked outline on the figures. Their edge in this look is the rim of light the figure kit draws and the look
  review measures; a drawn outline there is a change of art direction, for mockups first.

## Check

```
python3 build.py --qa
node spike/look/check_look.js [stage] [frames]
```

The field's fight played on auto to frame 1400 (a crew man's cut is in the air there), once with every test off and once with
each on, on a fake clock with seeded dice. It fails on an error, on a test that changed the game, on a dither that lifts a pixel
by more than its levels or does not reach the picture, on a grain that is missing, too strong or shifts the picture's brightness,
and on a brushed trail that drew nothing or drew away from the blades. It ends with what each costs a frame.
