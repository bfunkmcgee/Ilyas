# Motion test

A test, not part of the game. It answers one question: can the figures move like drawn people, not like ragdolls, while the
ragdoll stays the game's mechanism for fights, clothes, weapons and armour?

Nothing under `sk_*.js`, `envx/` or the build is touched. The test goes into a copy of the built page, after the game's script.

## Build and open

```
python3 build.py
python3 spike/motion/build_motion.py
```

That writes `spike/motion/out/motion-test.html` (and `out/index.html`, wrapped for publishing). The page opens on the test's own
scene. Two buttons sit at the right edge: `New` / `Old` changes the drawing, `Test` opens the rest (poses a second, how a blow
is drawn, the two bodies as lines, the scene). `?scene=none` opens the page on the game's title instead.

| Scene | What it is |
|---|---|
| Walk | Ilyas in the Sump's yard: a walk across and back, a jog across and back, squaring up, standing easy; Tamm crossing behind him |
| Yard | the yard as the game plays it (scene 4), to walk about in |
| Fight | a fight in the lab that plays itself |

The page is published as a private artifact of its own (slug `f83e8c2e-151d-4761-8e06-24956d3f680a`): `publish_files`, mode
`patch`, `out/index.html` as `index.html`. The sounds its scenes use are published beside it under `sfx/`, from the repository's
own; the song and the voices are not.

## What it changes

The game poses a figure in two steps. Each step of its clock it reads the pose he is meant to be in (the keys of his action, or
his guard), and then it pulls a ragdoll toward that pose with springs. What the game draws is the ragdoll: the pose arrived at
late, with the sway and settling of the springs in it. With the test on, the figure is drawn in the pose itself.

| | The game | The test |
|---|---|---|
| Hips along the floor | the ragdoll's | the ragdoll's: he is never drawn through a table, and a shove still moves him |
| Height of the hips, chest, head, hands, blade | springs chasing the pose | the pose's own numbers |
| Elbows and knees | springs | found from shoulder and hand, hip and foot |
| A planted foot | held by a spring | where it was planted, to the unit |
| An action's keys | chased, and so rounded off late | read at five moments about now and averaged: rounded off on time |
| A blow in a fight | the ragdoll | above the hips the ragdoll's, carried on the drawn hips and legs (the switch `Blows in a fight`: `Drawn` takes the blow from its keys as well) |
| A change of pose made at once (a stance, a guard) | springs swing him into it | eased over a quarter of a second, head first, hands last |
| Walking | feet slid low along the floor on bent knees | heel off, the ankle up and through, a straight leg under the hips |
| A turn round | Ilyas through the front view, everyone else at once | the cast through the front view as well |
| Standing easy the old way (`STAND0`) | on bent knees, stock still | on straight legs, breathing |
| The blur of a quick blade | swept by the ragdoll's blade | swept by the blade he is drawn with |
| Hit hard, thrown, down | the ragdoll | the ragdoll: the drawing gives way to it, and takes him back as the game does |
| Mounted, perched, held, carried, a beast, a puppet, in bed | the ragdoll | left alone |

`Poses a second: 12` holds each drawing for a twelfth of a second. The hips still travel every frame and a planted foot stays
planted, so nothing slides; the pose changes twelve times a second.

## Blows

A blow's keys were tuned by eye against what the springs and the weight of the weapon made of them. Drawn from the keys alone a
blow is smaller and tighter than the one the game shows: the arm stays bent where the ragdoll's is thrown out straight, and the
body does not follow the weapon through. It is also exact: the blade is at the head on the frame of the hit, where the ragdoll's
has already gone 60 units past it. The test keeps the game's blow by default and offers the other on a switch.

## What it found

In Act I the game keeps the two joints of Ilyas's missing arm on his chest (`oneArmFollow`, `sk_pit.js`), and the springs of that
arm still pull at them. The pull has nowhere to go but into his chest, so it lifts him: his hips ride about 10 units above the
pose and his feet 3 to 9 units off the floor, and when he walks his hips go up and down by 12 units where the pose asks for 2.6.
That is a fault in the game, not in this test, and it is a large part of how he walks in Act I. The test draws him on the floor.

## Files

| File | What it holds |
|---|---|
| `motion.js` | the drawn pose: reading the pose, the walk, the easing, giving way to the ragdoll, holding on twos |
| `panel.js` | the test's scene and its switches |
| `build_motion.py` | the page |
| `probe.js` | the check that the game is the same with the test on (below) |
| `strip.js` | pictures: a tile round a figure every few frames, the same game drawn either way |
| `trace.js`, `trace_plot.py` | numbers: every joint each frame, as the game has it and as it is drawn |

## The check

```
NODE_PATH=node_modules node spike/motion/probe.js 9000
```

Each scene is played from a fresh page four times with nothing painted: twice with the test off, once with it on and once on
twos. Every 300 frames the game's state is summed up (every figure's joints, scarf, strength, footing and place, the clock, the
turn, the story's step, the dice). The sums must agree. Scenes: a lab fight of five, the prologue from its start, Act I from its
start, the toll, the yard, the test's own scene.

## What it does not do

- The game is not changed. Taking this into the game is a version of its own: the drawing would move into the UI files, and the
  fault above would be mended in the game itself.
- The staggering first steps in the yard (scene 4) are the scene's own sway, drawn as written.
- A walk still starts and stops at once, and squares up with two quick steps. The steps are the game's.
- Jogging keeps the game's footfalls, which are a fast walk's. The test adds the heel kick, the bent arms and the bounce.
