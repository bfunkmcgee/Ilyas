# Ragdoll Skirmish Lab: working guide

Read this first in a new session. It says which files are live, how to build, check and test, how the code is put together, and
the rules that keep it working. Everything not named here as live is history (see "The folder").

## What it is
A turn-based melee RPG in one HTML page. Fighters are procedural 2D ragdolls (Verlet) on a 2.5D floor; dice decide each exchange
and the ragdolls act the result out. Kael (index 0, team 0; Ilyas on screen, see "Names") is an elven enforcer with an arc-blade;
Amri is the optional ally; enemies are team 1. The page opens on the story: the prologue (the road outside the city at sundown, the crop field, on to the roof of Hallowell Tower and the fall), then Act I in the Pit (see "Act I"); the skirmish lab (arena, enemies,
crew, ally, bench) is the menu's other half. The look is Noir Gilt: black and gold, figures lit along one edge, never stick figures.

Published as https://claude.ai/artifact/61wMNijJeCxJvsa3vWMbxJ (see "Publishing"). The source is the GitHub repository
https://github.com/bfunkmcgee/Ilyas (since V63): work in a clone of it.

## Commands (run from this folder)
| Command | What it does | Time |
|---|---|---|
| `npm install` | once, in a new clone: ESLint (the static check) and Playwright (the page suites). The suites use this machine's Chromium at /opt/pw-browsers/chromium where it is, else `SK_CHROMIUM`, else Playwright's own (`npx playwright install chromium`) | 30 s |
| `python3 build.py` | builds the page and everything the checks load | 1 s |
| `python3 build.py --qa` | the same into uiwork/qa_*.html, for screenshots while checks run on test_page.html | 1 s |
| `python3 check.py` | build, then the static check: ESLint over the assembled script, the UI dice rule, CSS braces. Messages name the source file and line | 6 s |
| `python3 test.py` | quick tier: the static check and the seven game-logic suites | 1.5 min |
| `python3 test.py affected` | the static check, then the suites that cover what changed since the last full pass (game rules: everything; drawing or page: the page suites it touches) | varies |
| `python3 test.py full` | every suite two at a time, then the timing checks alone. Run before every publish | 13 min (was 36) |
| `python3 test.py NAME ...` | named suites (`--list` shows them and what each covers) | |
| `python3 test.py perf` | the timing checks alone; nothing else may load the machine | 50 s |
| `python3 test.py look` | the look review alone (uiwork/look/review.py, since V88): every place the game draws, on a phone and a wide screen, against the style and drawing guides' measured rules; a frame that breaks one fails. Run before every publish, after the full run, with nothing beside it | 20 min |
| `python3 test.py --status` | whether the sources are the ones the last full run and the last look review passed with | instant |

Each suite's output is in test_out/NAME.txt. uiwork/qa_build.py calls `build.py --qa`. Always run long things under `timeout`. The
machine has two cores and about 7 GB. GitHub runs `python3 build.py` and the quick tier on every push to main
(.github/workflows/checks.yml).

## The folder
Live sources (the only files to edit for the game):
- **build.py**: the module lists, in load order (CORE, FEAT, UI_FIRST, UI_LAST, CSS, SCENES). A new feature `x` is picked up from
  sk_x.js (game), sk_xui.js (UI) and sk_css_x.css once its name is in FEAT/CSS.
- Game (no DOM; node loads it through sk_src.js): sk_core.js, sk_anim.js, sk_brawl.js, sk_fin.js, sk_team.js, sk_env.js, sk_phase.js, sk_arc.js,
  then the features' game parts: crew chain insure style secret lobby breach office finale ctxmoves cast arms guns story beast elf
  (hud and light have UI parts only) react room rise stances spells stnmotion, then Act I's (explore, the pit scenes, short).
- UI: sk_envui.js, sk_phaseui.js, sk_arcui.js, the features' UI parts (crewui ... figui lookui castui sceneui armsui gunsui storyui
  beastui elfui hudui lightui reactui roomui stancesui spellsui ... sfxui, in FEAT order), then sk_ui.js last (its frame loop starts
  the game).
- Page: sk_head.txt, sk_body.html, the sk_css_*.css in build.py's CSS list.
- Music: music/lepers_ascent.mp3, the prologue's song. Not built into the page: published beside it (see "Publishing").
- Sounds: sfx/*.mp3, the prologue's 153 recorded sounds, made in code by tools/sfx (see "The recorded sounds" under "How the code is
  put together"). Not built into the page: published beside it (see "Publishing").
- Scenes: envx/*.js painters named in build.py's SCENES, plus sk_scene_glue.js. **sk_sceneui.js is generated from them: never edit it.**
- Built (never edit): ragdoll-skirmish-lab.html (published), sk_full.js, test_page.html (opens on the lab: `window.SK_TEST=1`),
  build_map.json, build_modules.json, uiwork/qa_*.
- Checks: check.py, test.py, tools/eslint.config.mjs, the suites in test.py's SUITES, probes/draw_free.js, sk_perf_page.js,
  tools/cmp/run_pages.py (the page suites timed, drawing every frame or one in N, for comparing the two).

The repository holds the live files above and the tools this guide names, nothing else. What the work left behind before V63
(snapshot folders, files named *_pre_*, *_backup*, *.bak*, the old sk_core_t1..t3/kd/fin1 copies, patch and edit scripts, merge
and probe output folders, the old agent briefs, the old test files not in SUITES) stayed in the original workspace and is not in it.
Built files, test output and screenshots are ignored (.gitignore): the tools under uiwork/ are tracked, what they write is not.

## How the code is put together
**One script, one scope.** The build joins every file into one classic `<script>`: load order is definition order, and any file can
reassign a function another defined. Features hook in by wrapping: `const _f=fn;fn=function(...a){...;return _f(...a);};`. The last
wrapper in load order runs first. To see a function's chain: `grep -n "^function NAME\|[^.a-zA-Z_]NAME=" $(python3 -c "import json;m=json.load(open('build_modules.json'));print(' '.join(m['core']+m['ui']))")`.
Most-wrapped game functions: cmdValid, command, aiChoice, slotAction (guns, story, beast, elf, room), the opening functions (beast, elf),
controlAndForces, updateSteps, and the room's contacts (onDivHit, lampHit, onTableContact). UI: updateOrder, roleText, updateCommands, updateTags, drawFx, envItems/drawEnvItem, updateCamera,
drawFighter, drawWeapon/drawItem.

**Hooks** (sk_core.js line ~209): `V11.exchangeEnd, V11.kill (fn(D,dir)), V11.turnStart, V11.step (every sim step), V11.duelStart
(every new fight: reset feature state here)`. UI: `V11UI.init` (once, after sk_ui.js defined everything: wrap UI functions here),
`V11UI.tick` (every frame, drawn or not: HUD state, panels, scene sounds, timers that the page reads), `V11UI.world` (in render, in
world coordinates, after effects and labels), `V11UI.screen` (end of render, device pixels).

**The frame** (sk_ui.js `frame`): sim steps at DT=1/120 (simStep), the opening timer, shake/punch/camKick decay, updateTags every
.25 s, updateCamera, camVert, `uiTick()` (V11UI.tick), then `render()`.

**render()** order: sky and floor (or drawRoom), FXL.frame (the fighters' sprites, cast shadows, reflections, light), spills, lamp
pools, stains, shards, shadows, footing and its labels, then every floor item far to near (fighters, table, debris, env items,
rubble, items, ghosts), FXL.front, the floor's foot fade, FXL.grade, drawFx, head bars, labels, V11UI.world, debug, the opening
ring and vignette, the wipe, V11UI.screen, FXL.done (timing).

**Coordinates.** World: x 0..W=900, y down with the floor at GB=470, depth d from DEP_MIN=12 (near) to DEP_MAX=170 (rooms' back
wall at `far`, 236). Screen-world: `prjX(x,d)=x+d*PSX`, `prjY(y,d)=y-d*PSY` (PSX .2, PSY .75); `P(x,y,d)` in UI code. A fighter's
figure is drawn translated by (dep*PSX, -dep*PSY) and uses his raw x/y. Canvas pixels: render's transform `s=cv.width/cam.viewW`,
`L=cam.x-cam.viewW/2`, `T=camTop()`. CSS pixels: cssW/cssH; canvas px = CSS px x dpr. `HUD_IN={top,bottom}` is what the HUD covers
(CSS px); the camera frames the fighters inside the rest. On an upright phone (the HUD's 'port' layout) the moves fade away while the
player has nothing to press (`HUD.drop`, sk_hudui.js: the exchange, the others' turns, the fight's end) and the camera pushes in
(`camPush`, `camNarrowW`, `camPushW`, `camCardH` in sk_ui.js, since V74): at its closest 700 units of height fill the screen (about
404 across at 412x714), never closer than lets everyone fit, the band of fighters standing on the top of the tallest opening card met
(246 CSS px before one is met), so the cards come and go over the floor and the camera holds still; with reduced motion it cuts
(`cam.cut`); as the moves come back it follows quickly for 0.7 s (`cam.riseT`). A scene's own camera (`S.camCut`) wins. On an upright phone a cut with no narrow view or band of its own (`wn`, `band`, `bandN`, `bandS`), in a place whose picture stops at its ceiling or its dark (`EnvLook.S[k].close`: the Sump's rooms and roof), comes in wherever the view it asks for is taller between the bars than the place is painted (since V76, `camCutFit` in sk_storyui.js, and camTarget in sk_pitui.js): as close as lets the painted part (the layer's `top` to its `bot`, the rows that are not flat black: `sceneBandOf`), or 700 units of it (`PUSH_H`, or `S.camCut.fitH`), fill the height between the bars (wherever a scene asks with `fitH`: the platform), never so close that anyone in the view leaves it (the whole body with 46 units of air), never outside the view the scene asked for, the people in the middle; it follows them (a glide at 2.2, a cut with reduced motion only when someone would leave the frame) and lands at once on a cut (k 0). Elsewhere the scene's own framing stands (the Pit's terraces go on up over the yard and the stairs, the action low under them). Fighters: `f.p[PEL|CHE|HEAD|ELF|HAF|ELB|HAB|KNF|FTF|KNB|FTB|TIP]`,
`f.station` (x), `f.lane`/`f.dep` (depth), `f.facing` +1/-1, `f.action={t0,end,body:[keys],arm:[keys]}` drives the motors.

**Modules worth knowing.**
- sk_story.js / sk_storyui.js: STAGES (sundown field chase roadblock vargo dining kitchen platform line deep lobby office roof fall). A
  scene is a generator the sim runs a step at a time (`S.cut`), so scenes are as repeatable as fights. `S.story` null means the lab.
  The hero is one Fighter for the whole run (`S.story.K`): what a stage leaves on him (a bike under him, `rideLean`, `offstage`) goes
  on into the next stage unless that stage or the one before clears it. A bike the scene drives can carry its rider (`B.carry`: that
  share of its speed is moved straight into his body each step, so his saddle's springs follow only the rest): the field's ride-out
  (since V83, asked for) goes flat out to 1300 units a second in under a second with three quarters carried, the front up through
  the shift, a second rev, and off the edge of the picture.
- An elf's dash in a scene (since V85, asked for): `dashTo(f, x, z, o)` (`dashPlan` the keys) drops him into the run, low and leaning
  with his arms trailing, carries his hips to the mark at an even pace (`lin` between the keys; `o.v` units a second, 600 unless
  said), bounds any concrete barrier on the way with his knees drawn up (`f.vaultDiv` lets him through it while he is over it), and
  slides onto the mark low (`o.low`: he stays down, to take something off the ground). `f.blur` streams the afterimages off him and
  `f.sceneAgile` lets his body answer as quickly as in a fight. The field's outro dashes him to the bike; the checkpoint's outro
  drops the rifle, dashes him over the concrete to the gunner thrown off the carrier, takes the grenade off his belt, sweeps the
  coat open with the hand that holds it (as at the bistro's door: `K.coatOpen`), puts it in the loop on the lining, says his line
  and dashes him up the road out of the picture.
- The checkpoint's carrier is a wall (since V85, asked for: an officer could step along its flank and behind it): along its length
  (from 50 short of its nose) nobody stands deeper than `APC_NEAR` (24) short of its depth (`apcLaneMax`): `laneOK` refuses such a
  lane, `clampSt` keeps a man at such a depth short of it, and a step moves anyone the blast threw there back out.
- A rifleman's stance (since V85, asked for: the ready hung the rifle across him, and at the concrete its muzzle went into the
  barrier and pushed the stock up behind his head): the rifle is in his shoulder in every stance, its butt nested into the pocket
  at the front of the shoulder (asked for again in V86 and V87: in V85 it lay over the top and out behind him, in V86 his head
  was bent right down onto it): the rifle comes up to his eye. AIM.rifle (sk_guns.js) puts the hand on the grip a little over half
  an arm ahead of his shoulder (`hx` .55, `hy` .03), so the stock ends in front of the shoulder, and its `tilt` (.25) leaves his
  head nearly upright with the cheek on the stock and the eye behind the sight; `aimBody` leans him a little into it. GUARD.rifle: his weight forward, the feet a
  short stride apart and both knees soft, the support hand on the handguard (`off` 24, the foregrip of GunLook's rifle with it).
  sk_story.js lays the ready on whoever he faces (shouldered, the muzzle a little down), over the top of a barrier he stands at,
  and upright in front of him when he is down behind it; a lowered muzzle turns about the butt in his shoulder (`rifleDip`).
- The opening, `sundown` (since V58; no number, no title, so not a chapter: Begin plays it): the road outside the Sprawl at sundown
  (arena `outskirts`, envx/env_outskirts.js: the sun going down behind hills on the left, `sunNow()` sinking it over the scene from `S.story.sun.t0`,
  the city with the Hallowell tower on the right, poplars on the brow, the road along the rise bending over it on the right:
  `SUNDOWN.road`). It is cut as a film (since V59): it opens on the sky under the prologue's title (`S.story.title`, drawn in
  drawStoryScreen with no card behind it) and tilts down to him (`sundownTilt` eases the band between `SUNDOWN.shots`: sky, road,
  close, ride, city); the picture closes in slowly while he talks; he sits the bike upright (`K.rideLean`) and turns his head alone
  to the sun (`turnHead`: `f.headTurn`, which the look draws as the head's own turn in profile, round past the viewer; not
  `lookAt`, whose glance tilts the head back on the neck); he says three lines, starts the bike (a small `S.camKick` at the
  launch) and rides off over the brow; the picture turns to the city and his tail light crosses the valley toward it
  (`S.story.far`, drawn by the painter's live, hidden behind the fence's posts) as the light dims and the screen fades;
  `sundownEnd` takes him off the bike. A soft wind plays while the scene is on the outskirts (`windFrame` in sk_storyui.js). While he says the second line ("On the wire...") `S.story.sand` is set for
  `SUNDOWN.sand.dur`, and the page draws a few grains of sand blowing past the bike (`storySand` in sk_storyui.js): a hallucination,
  his desert, meant to be missed the first time (no sound, faint, quick). The fall's monologue is where the wire and the Rangers are
  said outright. The camera there has narrow-screen settings: `S.camCut.xn` (where it looks) and `S.camCut.bandN` (the band kept
  between the bars) next to `wn`; the lighting pass lights the outskirts from the low sun (sk_lightui.js `SC`, `MOON`).
- Lamplight Street, `vargo` (since V75): the street is drawn to the size of the people on it, so a shop's door stands a head taller
  than a man on the flags and the bistro's higher still. envx/env_street.js lays the houses out on screen and draws them `SK` (1.6)
  times the size of their own numbers about their feet (`big()`, `inX`, `inY`, `outX`; `facade()` draws its body there and the lamps'
  light on it on screen; `shopAt` the shopfronts, `o.doorAt` and `o.doorW` placing a door); the lamps are `LK` (1.4) times their old
  size. The Lantern Bistro's front is drawn at full size from `BG` (its ends, the fascia, the two arched windows `W1` `W2`, the door
  `DR`, the piers and their lanterns, the steps), and everything that touches it reads `BG`: the aftermath, the blast (`liveBlast`,
  three seconds: the front lit, a ring over the flags, fire out of the door and both windows, the glass and the door's pieces thrown
  out to where they lie, dust off the cornice, embers, the smoke; Lite throws half the pieces) and the story's door (`doorAt`, read
  by `bistroDoor()`). The two steps are the street's own ground (`BISTRO_STEPS` in sk_core.js; past DEP_MAX, so no fight stands on
  them). The fight is on the bistro's flags (spawn depths 150 and 160); Qadir waits at the foot of his steps (`V.zMax` lets him stand
  deeper than DEP_MAX). A scene painter's `lookUp` (here the bistro's fascia) is how high the camera keeps the picture in view in a
  fight where the screen has room (`camBand`, never in the push-in). The outro: his near hand sweeps the coat back (`K.coatOpen`,
  drawn by KaelLook's `flapDraw`: its lining quilted, a leather loop on it and the grenade strapped in it while `K.grenade==='coat'`),
  takes the grenade, the other hand pulls the pin (`K.nadePin`; the ring is a `S.thrown` of kind `'pin'`), a toss and a catch
  (`K.nadeUp`, `K.nadeAng`), then he turns his back on the door and sends it back over his shoulder and walks away as it goes; the
  blast's wind lifts his coat (`kaelWind`); the fire in the hole lights the street (a light of the moment, `FXL.lights`).
  `node uiwork/look/vargo.js <page> <outprefix> w h dpr` shoots the stage at its moments. The dining room behind the two windows
  is drawn live (since V83, asked for): the layer paints the room without its people (`bistroInside`'s `o.live`) and the street's
  `live()` draws the diners and the waiter behind the glass every frame (`liveDining`, the sash's middle bar and the sheen laid on
  again over them, cut off at the curtain's rod). Over supper they eat, talk and glance out; when the fight starts they turn to the
  window, stand to see it and flinch at its flashes; one in each window goes to the back a few seconds in, the waiter a while after,
  and the rest one by one once Qadir is down, so the room is empty when the grenade comes. It reads `S.story.fightT0` and `outroT0`
  (storyFight and storyCleared set them) and `S.flashes`, and keeps nothing; with reduced motion nobody bobs or flinches; in the
  lab they watch and stay. Since V85 (asked for) they are the game's own people: each diner (`dinerSpec`: an elf or a human, a man
  or a woman, dressed for supper) and the waiter (the dining room's crew) is drawn by CastLook into sprites once (`dinerSprites`,
  at `DS_R` pixels a unit, the figure `DS_K` times a diner's size), one for each way he is seen (`DPOSE`: at supper, a glass on the
  way up and at his lips, half turned to the window, on his feet facing it; the waiter with his tray up, and facing the window),
  lit from the candle on the table, and `liveDiner` and `liveWaiter` set them down (`dPut`), mirrored for whoever faces left.
  Without CastLook the old silhouettes stand in.
- The avenue (envx/env_chase.js; since V85, asked for: one block of shops came round every second and a half): the street's strip
  is three blocks of 1560 (`VARS`: each one's row, lamps, the gaps where the city behind shows (`sq`), its marquee (`marq`, `cine`)
  and what stands on its flags), painted once each (`ST.streets`) and set side by side in a seeded round of 24 with no block twice
  running (`SEQ`, `seqAt`, `streetBlocks`, `blitOne`; a block's device pixels follow from the first one's, so no seam opens). The
  first block is the old row; the market end has a florist, a chemist with his carboys lit, the Bank of the Towers, a vintner,
  Kestrel Gardens behind their railings, a jeweller, the elven teahouse Ithrel, a clockmaker and a bakery shut; the theatre end a
  noodle house in yellow neon, a newsagent, a building site behind a hoarding of bills, the chapel of the Lamp with its rose window
  lit, a hatter, the Royal, a grocer shut, the Maison and a tobacconist. `light(f)` and the lamps' flames follow the blocks. Our own
  kerb is three times as long (3510) and laid out from its seed: bollards in twos and threes, pillar boxes, the pavement's lamps,
  benches and fire points. The strips take about twice as long to make when the stage starts (about half a second here).
- The held sounds (sk_storyui.js, run from `V11UI.tick`): the bike's engine (`engineFrame`: the first bike in `S.veh` with `run`
  above 0 and near the picture; its level `ENG_LVL` x run, a quarter when far), the rails (`railFrame`) and the wind (`windFrame`).
  Each is one voice made once and set every frame. A held voice's modulation must work on a gain of its own ahead of the level,
  never on the level's AudioParam: an LFO connected to a gain param is added to whatever the param is set to, so setting the level
  to 0 leaves the throb going. Before V62 the engine's did exactly that and the engine played on, as loud as when he rode, from the
  opening to the end of the story (even with the sound off). The engine is now stopped after `ENG_HUSH` seconds quiet. Suite:
  `soundpage` (sk_sound_page.js) hears the page's own output at the master gain (Chromium with
  `--autoplay-policy=no-user-gesture-required`, an AnalyserNode on `master`, the game held still while the audio plays on).
- The prologue's song (since V68): music/lepers_ascent.mp3, "Lepers Ascent", the author's own track (made with Suno; cover art and
  tags stripped, the audio itself untouched). `MUSIC` in sk_storyui.js starts it on the 'stage' story hook for the first stage (sundown: Begin and Play
  again; a chapter from the menu does not start it) and it plays once through, about five minutes. Over http(s) an audio element with
  `crossOrigin` goes through `MUSIC.g` straight to `AC.destination`, not `master`, so the effects checks never hear it and its level
  (`MUSIC.lvl`, .5; the track is -16.7 LUFS) holds on iPhones, which ignore an element's own volume. If it will not load that way
  (another origin without CORS) it falls back to a plain element at that volume; a page opened as a file always plays it plain (the
  graph would hear zeros). Sound off or the page hidden holds it; the 'quit' hook fades it out and drops it; a play() the browser
  refuses (no press yet) tries again at the next click, key or touch. The page loads it beside itself by a relative path: the
  published page needs the file published with it (see "Publishing"), and uiwork/qa_*.html have none (it simply does not play).
- The recorded sounds (since V69): sk_sfxui.js plays the prologue's sounds from recordings, "The Long Night Sound List" (153 sounds)
  made in code by tools/sfx. One file a sound in sfx/ (its takes one after another, or a loop with a margin each side), and
  `SFX_MAN` says where each take sits (`{t:[[offset, length, LUFS], ...]}`) or a loop's window (`{l:[start, end]}`). Over http(s)
  the page loads them beside itself: the fights' own (`SFX_FIGHT`) always, a stage's (`SFX_STAGE`) with it and the next one, and in
  the lab the ground's footsteps, the room's kit and the guns' when a gun is in the fight; what is no longer wanted is let go. A page
  opened as a file, or a call whose recording has not loaded yet, plays the synthesized sounds as before (uiwork/qa_*.html have none).
  The sound hook is wrapped last (sfx is the last name in FEAT), so it hears every call first, with a third argument the inner
  wrappers never see. The game's calls keep their old keys (the synthesized sounds and the logic suites still hear them) and say more
  in it: `{s:'desk_slam'}` names the recording, `{skip:'desk_slam'}` is silent while that one is loaded (another call carries the
  moment), and `take`, `delay`, `dur`, `g` (gain), `A`/`D` (the fighters: a blow sounds by the striker's weapon), `kind` (a blast),
  `door`, `clack`, `tumble`, `body` (a falling body: one thud for all of it, none in the jolt of a scene put in place), `pit`. A key
  with no synthesized sound that is a recording's name (`maize_push`, `lift_doors`, `tail_writhe` ...) plays only the recording.
  `sfxRoute` is the table from a call to a recording (a swing by the weapon's mass, a thud by its weight and the floor, `sfxFloor`).
  The held sounds, from `V11UI.tick`: the stage's background (`SFX_BED`, crossfaded), his bike on two loops blended by speed (the
  synthesized engine, rails and wind stand down while their recordings are loaded), the riders' bike, the rails and their joints, the
  carrier, the fire, the train at the platform, the freight lift, the helicopter's hover and the fall's wind. Footsteps are the game's
  own steps (`f.steps`) put down, by the floor; fight footwork scuffs now and then. Levels: `SFX_GAIN` (the one-shots peak at -1
  dBTP) and `SFX_LOOP` (a loop's loudness in LUFS where it is heard fullest; the files hold -20). Every recording goes out through
  `SFX.bus`, which the sound switch closes at once. Voices are capped (`SFX_CAP`, 4 a sound, 40 in all). Nothing here writes what
  the game reads. Suite: soundpage (over http, from a server it starts).
  The generator, tools/sfx (Python 3 with numpy, scipy, soundfile and pedalboard, matplotlib for the sheets; ffmpeg with libmp3lame;
  a C compiler makes the filters much faster, else they run in Python): list.json is the list, rec_*.py the recipes (one function a
  sound, `@sound(key, takes, kind, L)`), gens.py and amb.py the families they are made from, dsp.py the kit. `python3
  tools/sfx/render.py <out> --web --install .` renders every sound (about half a minute here), packs them and installs sfx/ and the
  manifest (<out> is a folder outside the repository, or tools/sfx/out, which git ignores); `python3 tools/sfx/render.py <out> KEY
  ...` renders some (the masters, to listen to, in <out>/wav), and `python3 tools/sfx/sheet.py <out> <sheet.png> [KEY,KEY]` draws
  their spectrograms (a loop's seam measured). A take is seeded by its key and number, so a render comes out the same every
  time. A new sound: its recipe and its line in list.json, render all and install (the manifest installed is the whole of
  <out>/web/manifest.json), its level in `SFX_GAIN` or `SFX_LOOP`, the stage that loads it in `SFX_STAGE`, and the call that plays it.
- sk_lookui.js (Kael), sk_castui.js (everyone else), sk_figui.js (FigKit: the shared shaping and light). drawFighterItem in sk_ui.js.
- sk_lightui.js (FXL): effects Full/Lite/Off (localStorage sk_fx; auto-drops to Lite on a slow device, never under SK_TEST). Full
  draws each fighter into a sprite (ctx swapped) reused for cast shadows and reflections; the fx are restyled as light; the vignette
  is CSS (data-fx on #wrap). With Off the picture is the old one.
- sk_hudui.js: the full-screen HUD. Modes by size: land (phone sideways), port (phone upright: one focus plate per side), tab, desk.
  Command dock with tabs (strike, move, tactics, room, aether; the tactics tab's key is still `guard`), menu and log drawers. The
  Room tab shows only while the room offers something (sk_roomui.js); on a desktop the room's two buttons sit in the Tactics group.
  While Ilyas fights with the arc-blade the stance bar sits over the moves (sk_stancesui.js: the dock's first row upright, over the
  bar beside the tabs sideways and on a tablet, the dock's top row on a desktop).
- sk_envui.js + envx/ (via sk_sceneui.js): rooms paint their still parts once into a layer and draw what moves each frame.

**Animation (since V64).** A move is `f.action={t0,end,body:[keys],arm:[keys]}`: keyframes `{t,v,e}` of body poses (px, pz, crouch,
lean, stF, stB, th, lift, kick, kw) and arm poses (hand, wAng, off, tilt), sampled by `sample` in controlAndForces and driven into the
ragdoll by its motors. sk_anim.js names the poses (`POSE.body`, `POSE.arm`) in the body's own units, as GUARD writes the guard: crouch
and lean, the feet `sf`/`sb` in leg lengths, the hand `hx`/`hy` and the free hand `off` in arm lengths, the blade's angle `w` (or `wg`,
the weapon's guard angle plus it), the head's `tilt`; `two` is what changes with the weapon in both hands, `free` keeps the free hand
off the grip. A pose with `on:'guard'` stands on his guard and is sampled live (what it does not say comes from the guard, `add` adds to
the guard's own values); `on:'now'` is laid over where he is when the move is planned; anything else is fixed at planning. Planners
write tracks with `bodyKeys(f,[[t,pose,changes,ease],...])` and `armKeys`: a pose is a name, `'guard'` (live), `'now'` (where he is),
a function or a pose object; changes are laid over it in world terms (px, pz, a hand aimed at a contact point as {fn}), a change that
is a function is read live, and `flip` (+1/-1) turns the lean or tilt round for a man behind him. `bodyPose`/`armPose` make one pose
for a fighter. Story scenes (sk_story.js, the Pit's scenes), the finale's driver, the gun aim (AIM in sk_guns.js) and the arc-blade's
flourishes (sk_arc.js) keep their own choreography. The attack is data (since V65): `ATTACK` in sk_anim.js holds its times, the
approach speed, the body's form at the impact and in the windup by the form of the blow (`form`: slash, thrust, overhead, sweep, and
passing, butt, ground, leap and the kicks laid over them), the windup's and follow-through's numbers, the arm's windup and
follow-through by form, the free hand and the head's tilt; planAttack, windupBase and followBase read it through `attackTable(A)` and
`attackForm`, and aim at the contact point as before. Styles (since V66): `ANIM_STYLE` in sk_anim.js, one per animation style, and
`f.animStyle` (default 'tactical' for Kael, sk_style.js, 'regular' for everyone else). A style is its pace (`moves`, faded in with
skill up to `full`), changes to the guard (`guard`), to named poses (`pose.body`, `pose.arm`), to ATTACK (`attack`, merged a level at a
time) and its glance after a kill (`look`). `styleMoves`, `styleGuard`, `styleWind` and `styleFollow` apply it; Short Hand's stance wraps
styleGuard. Animation only: the dice, the tempo, the footing and the AI never read a style. The library (since V67): his rank shows in
his motion (`ANIM_SKILL`: a Novice's changes all there at skill 1 and half at 2, a Master's half at 4 and all at 5, through `skillGuard`,
`skillPose`, `skillAttack`, the pace in `styleMoves` and `hitTime`; a style's own motion takes the rank's place as it comes in, so Ilyas
moves as his style has it). A blow of the blow's own shape (`VARIANT_KEYS`: not the butt, the pommel, the lash, a kick, a flourish ...)
comes in one of its variants (`ATTACK.variant`: the cut diagonal, level, rising, short or drawn; the thrust in line, low, high or on a
lunge; the overhead straight down or from the shoulder; the low cut, from a knee or hooked), picked by `blowVariant` by weight, skill and
weapon, seldom the same twice running, and a blow straight after one goes on from where that left the blade (`A.animLast`,
`ANIM_CHAIN`). A skilled man's blow may open with a combo (`ATTACK.combo`, `blowCombo`, `comboPlan`): a lead or two (one off an opening)
that the man parries (`comboReact`, `leadClash`), then the blow, whose dice it is; Beat and thrust always opens with its beat on the
blade, and a spin with a lead parried first. The answers are acted out (planReaction): a Counter cuts into the blow, Turn him carries it
on past with a hand on his arm, an Expert's parry rolls onto the other's blade, a Parry or Counter that sends a blow wide beats it aside,
Step back over a low blow is a hop, and an answer to a blow that lands comes a beat late; a blow taken comes in more ways (hitReaction).
In context: from behind the free hand takes his shoulder, a stab down at a man on the floor has the free hand on the pommel, a man off
balance is pressed, a man attacking off balance overbalances, a badly hurt man is slower, and a Master flicks the blade after a kill. The
animation's own dice are `animDice(res, salt)`, from the seed the blow was thrown with: a variant or a combo throws none of the game's
and moves nobody the rules read (checked). `S.animForce` {variant, combo, hit} sets them for a check or a still. Suite: `anim`
(sk_anim_test.js). `node tools/cmp/anim_probe.js` counts the variants and combos by rank over the auto fights; `FX=off node
uiwork/anim/moves.js <outdir> <shots.json>` photographs single blows as strips of frames (a shot names the attacker, the man struck,
the blow, its outcome, the answer, the variant and the combo). The motion traces prove a refactor moves every body the same: `node
uiwork/anim/trace.js <repo> <out.json> [quick]` (64 seeded lab fights, every joint hashed every 6 steps, and which planners ran) and
`--cmp a b`; `node uiwork/anim/suites.js <repo> <out.jsonl>` (the logic suites, their dice seeded) and `node uiwork/anim/cmp_suites.js a b`;
`node uiwork/anim/trace_page.js <repo> <out.json>` (the prologue on into Act I with each fight played on auto for a while, and the
restaurant's four rooms, on the page and never drawn) and `--cmp a b`. Trace a build of main (a worktree) and the change, and compare.

**Combat (since V40).** Balance (`f.foot` in the code; the player sees "balance") is a bar of pips: FOOT_MAX 6, a crew man 4, a
boss 8 (`footMaxOf`). The other side takes it (`knockBalance(D,n,by)`, BAL in sk_core.js); your own heavy moves spend it
(`footDelta`, FOOT_COST); two pips come back at the start of each own turn (startTurn). Knocked to 0 by the other side a fighter is
Broken (`f.broken`, `breakFighter`): no answer until his turn, and the 'broken' opening gives the other side one free move (`freshBreak`,
`f.broken.paid`) without the +3 (`openBonus`). There is no Guard or Counter command in a melee: every blow at a standing fighter is answered as it comes
(sk_react.js). `launchAttack` is wrapped: an AI defender answers at once (`aiReact`, his read); a hero the player controls gets an
opening with `source:'react'` (the blow is held: `ex.reactPending`, `ex.pendReact`) and `resolveReact` launches it once he picks.
An answer sets `D.react` (and `D.guarding` for a Parry, `D.counter` for a Counter) for that one blow; REACT_DEF holds Slip, Step
back and Turn him's DEF. 'guard' is valid only in a gunfight, as cover (`gunFight`, sk_guns.js); the guard slot is empty otherwise.
Kael's Flow (sk_chain.js, since V41): every takedown and every break he lands adds to the run (`chainAdd`); after a takedown with
another enemy in reach he gets a link (a 'flow' opening, `o.link`), and the free move on a man he broke is a link too. A link is at
+min(n,3), 15% cheaper per step (45% at most) and spends no balance (`chainFoot`, checked in beginAction). The run carries across
exchanges and turns and ends on any damage to Kael (V11.step watches his HP), when he is down, held or broken, or the fight ends.
The react suite (sk_react_test.js) checks the window, each answer and what it pays, a break's one free move, balance coming back,
Hold, cover and Flow. `node tools/cmp/flow_probe.js` counts runs and how they end over the 36 auto fights. `node tools/cmp/react_probe.js` and `node tools/cmp/break_causes.js` run 36 auto fights and count answers, breaks and wins;
`node tools/cmp/fight_trace.js <arena> <n> <seed>` traces one fight. `node uiwork/react_shots.js <out> [react,broken,input]
[land,port,desk] [arena] [crew]` photographs the answer window and a break.

**Stances, the free rise and the new spells (since V70).** Tried first on a test page of their own (the stances-test branch,
proto/stances/), then put in the game: four features after the room in FEAT, so Act I's scene rules (a stage that spares everyone,
the toll) still wrap them.
- The free rise (sk_rise.js, `DOWNF`): a fighter knocked down stays down until his own turn starts, then rises free (`freeRiseOK`:
  not npc, not struck on the floor, not held or carried). `startTurn` is wrapped to play a Get up that costs nothing as an exchange
  of its own (`ex.rise`; the log's 'getup' entry with `free`; `S.hooks.freeRise`), and when it ends the same turn goes on
  (`riseContinue`, `S._riseCont`), Off balance (`DOWNF.rise` 'off'; 'committed' gives three pips). A blow that lands on a man on the
  floor kills a crew man (`hench`) with his weapon's finisher (the resolveAttack wrapper; not in a stage that spares everyone,
  `act1Spare`), and anyone else loses the free rise (`f.noRise`, 'No free rise' in the log, `S.hooks.downStruck`) and gets up as
  before. The page labels a man on the floor (`intentLabel`: Rises free, Must get up) and the tip line says what it means.
- The stances (sk_stances.js, sk_stancesui.js, sk_css_stances.css): while Ilyas fights with the arc-blade and is not drained
  (`stanceOn`) he holds one of three (`f.stance`, STANCES): Bound (the blade locked: the crescents and the two-man strokes, a short
  blade kept at the point), Unbound (a bladed whip: every blow a lash from where he stands, the tip's crack from `STN.tip` past his
  striking distance and the chain's body inside it, the Ankle wrap, a stop-lash on a man who closes, relocked blows inside his reach
  at -2, Parry -1 and Counter -2) and Close (the blade choked: the hilt-ring, the spine, the inside hook, the grab +2, an axe swung in
  reach jammed on its haft, -1 to everyone else while tied up inside one man). He changes it free on his own turn before he acts
  (`setStance`; the stance bar over the dock, keys Z, X and C). `STN_ANS` is what each stance does to a man's blow (Bound beats a
  thrust aside +3 and takes a cut on the blade +2, Close gets inside an overhead +3 or a cut +2 from a man in reach, Unbound catches
  the raised arm of a man coming in with an overhead +3; and what each gives way to: an overhead beats Bound -2, a point catches
  Close -2 and comes inside Unbound's chain -2, a sweep takes Close planted -1; Bound's and Close's were -1 until V89), and an
  answered blow that misses costs the man a pip more (`STN_MISS`);
  `stnRange` is the range of Ilyas's own blows in each. The bar marks the stance that answers his target best (`stanceMatch`, scored
  by `stanceFactors`: the man's weapon and its habits `STN_HABIT`, the range, the blow each man shows, the crowd) with its reason,
  and Ilyas on auto takes it (`STANCE.policy`); a blow a man shows is the blow he throws (the ensureIntents wrapper).
- A man who reads the stance (since V89, asked for: there was rarely a reason to change stance; Bound answers the thrust and the cut,
  the blows men throw most, and holding it won as often as changing): a foe of Veteran rank or better plans his blow against the
  stance Ilyas holds (`STN_READ`, `stnReads`: by skill, Trained half, Novice none; `stnReadWeights` in the moveWeights wrapper): a
  blow it answers by a weighs 1/(1 + shy x a x read), one it gives way to by a gains give x a x read. So a Veteran in reach shows
  Bound an overhead about half the time and Close a thrust, and the stance taken on Ilyas's turn answers the blow shown; the next
  one reads that stance. The bar scores his habits as he would throw them (`stnHabitRead`), and the tip line says "Qadir reads Bound
  and is gearing up an overhead". STN_READ.on false is the old play.
- His grip (sk_arc.js, since V89, asked for: the arc-blade was knocked out of his hand too often, in about one lab fight in six,
  nearly all of it a bind after a man parried him, which won three times in four): a disarm takes the arc-blade only on a crushing
  roll, ten over the mark or a natural 20 (`ARC_GRIP`, `arcGrip`, the tryDisarm wrapper); a lesser win leaves it in his hand (`r.held`:
  a bind pins it, three pips and +20 tempo; a guard is still broken) and the log says what would have taken it (`gripNote`, sk_ui.js).
  Broken (ten easier) is where he still loses it. Unbound's chain
  is the page's own (`K._whip`: stepped after each simStep by `whipTick`, drawn over the arc-blade's hilt by `whipPaint`; the rules
  read nothing from it): it trails the hand, is thrown with each lash window (`whipWin`: a combo's leads to the parry, the blow onto
  the blade's tip, the catch round a man's arm), hangs at rest and locks into the blade for a relocked blow or a blow taken on it.
  Its crack and reel are synthesized (the stance UI's sound wrapper, ahead of sfx's).
- The stances' motion (sk_stnmotion.js): the whip's blows and Close's hilt-ring, spine and hook come in variants of their own
  (`STN_VAR`, picked by blowVariant from the animation's dice) and open with combos of their own (`STN_LEADS`, `stnComboPlan`: the
  whip's flicks run out to where the man's parry meets them), and each stance's answer is acted out when the blow it answers misses
  (`STN_ANSWER`: Bound's beat and the braced blade, Close stepping inside, Unbound's chain round the forearm `D.stnCatch`), with the
  footwork of a Slip or Step back for the beat and the catch, in place of an elf's evasion. `STN_MOTION.on` false is the game's own.
- The new spells (sk_spells.js, sk_spellsui.js, sk_css_spells.css; `SPELL2`): Glare (1 Aether, key A: a man in his face swings at
  -3, a Thrust -4, and defends at -2 till he acts), Gilt line (2, key S: a yank that lands a man who holds off where the stance
  strikes best), Gilt edge (1, key D, lit free on his turn: Bound +1 and through a guard, Unbound's tip burns, Close's hilt dazes),
  the Gilt ward (1: an answer in the window, +5 against an Overhead, +4 a Cut, +2 a Thrust, an axe cracks it) and Overdrive (a spell
  one or two Aether short burns 8 health a point).
Suites: `stances` (sk_stances_page.js: the lab's fight with the bar, the whip, the answers and their dice, each spell's button and
what it does, a fall and a blow on the floor, the rules off) and `stnmotion` (sk_stnmotion_page.js: the variants, combos and
answers, no game dice). `node tools/cmp/stances_probe.js [fights] [key=value ...]` plays the lab's auto fights with each rule on or
off and counts what they do (its usage lines list the options; since V89 also how often the bar marks another stance at his turn,
his changes, the blows thrown at each stance and the disarms tried on him and won). At V89, 54 fights each (3 a setup): matching
the bar won 91% with 70% of his health left, Bound held throughout 83% and 56%, Close 83% and 53%, Unbound 80% and 61%; before,
Bound held had won 89% to the bar's 83%. He lost the blade in one fight in fifty, from about one in six. The logic suites that look at a man after a move read him where the
move's exchange ends (`wasDown`): their runs play on into his free rise.

**The room (sk_room.js, since V42).** Events: in V11.step, any body knocked flying (`roomFlying`: dead or motor < .62, not the man
making the move) that meets a standing man's HEAD-PEL capsule at a closing speed over ROOMEV.hit is an impact of speed x weight ratio:
over ROOMEV.down (a boss more) he goes down, under it he is knocked back two pips. `onDivHit`, `lampHit` and `onTableContact` are
wrapped: a flying body over ROOMEV.burst[mat] bursts a pane, over lampFall brings a lamp down, over tableBreak from above breaks the
table, over tableTip into its side spins it about its far feet (`roomSpin`). Each is a `roomEvent` (slow motion .6 s, its name over the man
kept under the top bar, S.hooks.roomEvent for the log); a man Kael set going counts toward his flow (`roomBy`, `f._roomBy`,
`roomTakedown`). Aimed drives and throws keep their own rules (`ex.divSlam`, `ex.res.table`, `ex.domino`, a throw's body hazard).
Room moves: `roomMoves(A)` offers up to two (hurl, pane, flip including a man sprawled on the table `m.on`, lamp), one of each kind;
commands room1/room2 (keys R and G), ROOM_COST/ROOM_FOOT through the moveCost/footDelta wrappers, the roll in `roomMods`. Hurl and
pane go through startCarry/landThrow (the pane with startBreach); flip launches the table (`roomFlipTable`); the lamp drops with
`L.drop`. The AI takes the first move with a chance by temper times its odds (aiChoice wrapper). The room suite
(sk_room_test.js) checks each event and move. `node tools/cmp/room_probe.js [seeds] [crew]` counts events, offers and moves over the
auto fights (NOROOM=1 turns the moves off, NOFOE=1 leaves them to Kael, ALWAYS=1/FAKE=1 compare Kael always taking them against the
same dice spent without them). `node uiwork/room_shots.js <out> [offer,hurl,pane,flip,lamp,ontable,bowl,tip,roomtab,log] [sizes]
[ok|fail]` photographs them in the dining room (SHOTS=frames,... picks the frames).

**The Pit and the wind (since V43).** The Pit's walls (envx/env_fall.js) are junk. The near walls are tiles, 240 x 128 a side
(`nearTile`), each the dark mass and the pieces of `jCell` that reach into it (deep and dark, mid, the face's pieces sticking out,
small stuff in the gaps; `junk()` draws one piece of any kind). The face (`jFace`) stands JW.inset in from the Pit's own line and never
nearer the middle than JW.LIM, clear of everywhere his body goes (picture x 259..681, `node tools/cmp/pit_path.js`); what he hits is
still `pitLayout()`. The far side is tiles of four rows (`farTile`/`farRow`): shacks on walkways, each walkway on a course of packed
junk (`farBand`), heaps in the gaps; far pieces draw plain (`junkSmall`). Tiles are painted at the screen's scale and kept in
`JK` (`EnvLook.S.fall.jk`: 34 at most, the least recently used let go, four canvases kept for reuse): one a frame ahead of need
(`jkLater`), one more if the screen shows one not painted yet (it counts in `JK.miss`); sk_storyui.js lets them all go outside the
fall (`EnvLook.S.fall.free`). `node uiwork/wind/tilecost.js w h dpr from to` counts the paints, misses and their cost through the
fall; `node uiwork/wind/prof2.js farTile|nearTile` profiles the painting. Kael's coat takes the wind of a ride: `kaelWind(f)` in
sk_lookui.js (on a bike `-(B.vx+S.scrollV)`, in the tunnel `-S.scrollV`, on a moving train `-(T.v+S.scrollV)`) goes to KaelLook.draw as
`o.wind`; `windTargets` turns the hem corners' targets downwind (WIND: lead and trail angles, `windK` the strength), and `FL` is the
drawn-only flutter on the skirt's edges and hem: a wave running down the cloth plus the tail whipping up and down as a whole (since
V44). In a wind the corners are not mirrored while he is drawn turning round (drawTurned's `f._phys.mir`), so the hem stays downwind (the look suite checks both: the wind's sources, and the hem streaming back in a
headwind, forward in a tailwind, hanging again in none). `node uiwork/wind/stand.js <out.png> <wind,...> [facing] [frames]` shows him
standing in set winds; `node uiwork/wind/shots.js <out> <stage> w h dpr <frame,...>` photographs a story stage at chosen frames.

**The desert in his head (since V72).** As he goes down the face thinking of the wire, the night out past the corner turns by
degrees to the noon he rode it in, and the tower's windows fill with sand and pour it. `fallDream()` (sk_story.js) is how deep it is,
0 awake to 1: FALL_DREAM gives it at the end of each of FALL_LINES (it comes with the Rangers and the wire, deepens with the wells,
falls back a little with the Sprawl, and is everything by the wire again), eased through each thought from `S.pit.dream` ({k, t0}:
which thought, since when, set by the fall's script); it holds while the tower's foot comes up, and the first blow in the Pit
(`pitWake`, from pitImpact, pitCatch or pitLand: `S.pit.woke`) ends it at once. The memory slows the face going by (`fallSlow()`,
FALL_SLOW: down to 38% of the speed at the deepest), and as he swears to come back the speed comes back, all of it, before the Pit, so
the Pit plays as it always did. The painter (envx/env_fall.js, "the desert in his head"): `desertView()` is the view out past the
corner painted once (`desertPaint`: the sky white with heat at the horizon, the sun where the moon was, a mirage of water lying on
the sand, dunes to the horizon lit where they turn to the sun and shaded where they turn away, glittering near, the border wire's
posts running out across them, a buried fortress's glass domes, a cistern, a well with people waiting at it). Since V73 the sand
comes in on a tide (`tideY`, `wh0`): a wall of dust rolls in from the horizon over the city's lights, the sand behind it dark under
the night at first, while the sky goes by a dawn to the noon; the searchlights, the far towers' lights, the traffic and the city's
drift go as the tide reaches them; at noon the heat wavers over the horizon (strips of the view laid over themselves a little to the
side). The windows fill with sand like the glass of an hourglass (`sandAt` on `dreamMax`: each its own moment, as deep as the dream
has gone, so they never drain when it falls back a little; a few never fill): one of six pieces of sand (`fpSandIn`: its layers, its
lit skin and crest, three softnesses for the speed) drawn only as deep as the window holds it, the room above it, the frames over it
in one batch, a thread of sand running in from the top of some while they fill; half of them pour a stream down the face
(`sandPour`: three streams, a sheet breaking into ropes and grains), the setbacks hold drifts and pour curtains, the fins burn in the
sun, the noon comes down across the face in two soft shafts at the deepest, the haze goes warm (`hazeSpr`), sand blows up past him in
four batches, and the sun throws faint ghosts in the lens (`flare`). The light that rims him moves from the city's glow to the sun
(`light`). Waking (`dreamFore`): a white flash gone in a third of a second and the last of the sand blown off him. The sound
(sk_storyui.js `dreamFrame`): a soft hiss of blowing sand as deep as the dream, cut dead at the waking with a breath drawn in; down
the face the fall's wind goes with its speed (sk_sfxui.js: quieter and lower while the memory slows it). The thoughts get a soft shade
under them while the dream is bright behind them. On a screen too short for the floor's band (a phone on its side) the fall's camera
keeps him whole: `S.camCut.bandS` (sk_pitui.js). `node uiwork/fall48/dreamshot.js <outprefix> w h dpr <secs,...>` photographs the
fall at chosen seconds; `node uiwork/fall48/dreamprobe.js [w h]` traces its depth, the face's speed, the waking and what the moving
picture costs.

**The fall as a camera takes it (since V73).** The face: every window is a piece from a set painted once at the screen's scale
(`facePieces`: ten lit rooms of the house, three of an elf's cyan, three with someone at the glass, eight dark), each in two smears
for the speed (`fpSmear`, crossed over in narrow bands of speed), the spandrel and the ledge a strip each (softened at speed); the
glass then holds the night behind him (`glassSky`, full effects: one small picture for each depth of the dream, fixed to the screen
and laid over the glass column by column, so it stands still while the face goes by); each setback's lights wash the face under them
(`scallop`); a lit window's light smears down the stone at speed (`spill`). The night: clouds heaped from soft puffs and lit from
under (`cloudBank`, painted once), the moon's corona and ring, the far towers in the haze, two searchlights sweeping (`beamSpr`), the
towers' red lights, traffic along the avenues and a plane (`nightLive`). Near the lens, out-of-focus motes go up past him (`bokeh`).
The Pit: the far side's haze (cold by the rim, the fires' smoke warm by the floor: `farAir`) and its windows' glow are painted into its
pieces (farTile), and over them live the pools of the lamps and braziers, the signs' glow, mist in bands at three depths and, at full
effects, two shafts of the moon with dust in them (`pitAir`); the near walls darken back toward the rock and catch the moon on their
edge (nearTile). Over the finished frame (`post`, before the thoughts and the bars; since V79 the shared finish, `EnvLook.finish`,
at the fall's strengths: the pitfalls below): the light blooms and runs
out in a lens's streaks (one small picture, the frame an eighth the size multiplied by itself, laid over the frame once with screen),
the edges darken in three bands (not along the top, where the moon and the sun are; first, so that a light in a corner keeps its
glow), and a pixel's grain moves over it on a wide screen. Full effects: all of it; Lite: the dark at the edges; Off: none. Phones
first: on a phone's 1.2 million pixels in the headless (CPU) canvas the bloom costs about 6 ms, the glass 3.5, the edges 2, the Pit's
air 3.5, the sand in the windows 2 to 3.5; V73's fall at Full drew 9 to 15 ms a frame over V72's there, at Lite 3 to 6 (a GPU
canvas pays a small part of that, and a device that cannot keep up drops to Lite by itself). The look suite checks the pass runs on
every frame the fall draws, the bloom's range, the sand never draining while the dream lasts and gone when he wakes, and that Off
draws none of it.

**Kael with the coat off (since V46).** From the lobby on (`S.story.flags.coatOff`) his arms are bare: `bareTube` in sk_lookui.js
builds each from FigKit.tube with `o.prof` (MUS: the width each side at points down the arm: the shoulder's cap, the biceps in front
and the triceps behind, the forearm full at the elbow), `armFront` says which side is the front (the inside of the elbow's bend, or
the way he faces), and `muscleLines` draws the creases and the light on each muscle's belly. The tattoos glow on them until the hex
round on the roof drains him (`F.drain` 0..1 over 1.6 s): the ink burns out as an ember and leaves scars in its pattern (`tattoo`'s
`o.dr`, SCAR_DEF on the noir skin), his eyes go a dull grey with no glow (EYE_DULL) and the crystal clasps on his vest go dull
(CRYSTAL_DULL). They stay so through the fall. At its end (since V48, the synopsis's ending) he lands face up in the hay (`pitLand` turns
him so), a faint light comes back into his eye (`F.eyeLit`, FALL_EYE of the eye's light, apart from the drain: `eyeDr`), and the picture
climbs the wall to the arm on the spike (`pitLookUp`, `P.look` overrides the riding camera; PIT.lookY/lookDur), whose lines light again
as it comes away (`pitArmDrain` in sk_storyui.js, cut off from the null) with a halo on the wall. With gore off there is no arm on the
spike and no last look. Nothing of him below the Sump's roof is drawn once he has landed (his hair goes down into the heap). The look
suite checks the muscles' outline, the glow turning to scars, the eye's faint light, the arm's light and the fall played to its end;
`node uiwork/fall48/fallend.js <out> w h dpr [secs after landing]` photographs the end. `node uiwork/wind/portrait.js <out.png> <scale> <drain,...> [frames]
[guard|easy|out]` draws him alone at any scale (6 is a close-up); `node uiwork/wind/bare.js <out.png> <drain,...> <dpr>` crops him in a
fight; `node uiwork/wind/drainshots.js <outdir> w h dpr` photographs the drain on the roof.

**Names (since V47).** The names and the spoken lines through the roof follow the user's Veil synopsis (Oct 21): Kael is Ilyas on
screen, Vargo Qadir, Vosk Ixet, Mara Amri, the lobby's Varn Doran, Halloran Hallowell (the executive is `'Mr. Hallowell'`, the tower
Hallowell Tower). The code keeps Kael as its own word for the hero (`hero()`, KaelLook, STORY_KAEL, the design keys `sig:Kael` and
`house:Kael:`, and Kael in HOUSE and SIGKEY), so comments still say Kael. Whatever is shown, or compared with a fighter's name, uses
`HERO_NAME` (sk_core.js), FOE_NAMES, FOE3_NAMES, ALLY_NAME, EXEC.name. Tables keyed by the shown name: sk_cast.js's bodies,
ARMS.sig (sk_arms.js), CAST (sk_castui.js), HOUSE and SIGKEY (sk_armsui.js). The guns carry Veil makes: the Veskar VS-8 Scour, the
Hallowell Guardian Nine, the Hallowell Skyline PDX, and the Maben Register pistol on the roof. The lines are the `speak()` calls in
sk_story.js and FIN_LINES in sk_finale.js, and the fall's thoughts are FALL_LINES (the synopsis's twelve, since V48; the bar he lands
on is the Sump, its sign THE SUMP). The lines in play order: `node uiwork/names_lines.js <outdir> [w h] [regex]` (shots of the box for lines matching the regex). The checks compare
against shown names too (logs, popups, hooks that record `f.name`, the Fighters panel, sorted name lists): a rename touches
sk_react_test.js, sk_teamtest_body.js, sk_cast_page.js, sk_arms_page.js, sk_v12finale_test.js and others; grep them all.

**Act I, the Pit (since V49).** The user's doc tab "Act I, beats 1 and 2" (copy: uiwork/act1/doc.md; plan: uiwork/act1/PLAN.md) is
nine scenes. Scenes 1 to 5 are built: the fall goes on (`fall.next`) to `roof1` and `kitchen1` (scene 1, sk_pit.js), `backroom`
(scene 2, sk_pit.js), `lostprop` (scene 3) and `yard1` (scene 4, sk_pit2.js), then scene 5 (sk_pit5.js): `list` (the yard, Tamm's
list and the satchel), `stairsup` (the Lane stair by day; the empty spike; the collectors at their stand), `shelfstair` (the Shelf
stair by day, the silent row; since V71), `shelf` (the market) and `stairsdown` (the Shelf stair at dusk, the beggars); the last
goes on (since V51) into scene 6, `toll` (sk_pit6.js: the losing fight on the Lane stair), scene 7, `tamm` (sk_pit7.js: Tamm's
scripted fight), scene 8, `night` (sk_pit8.js: the yard at night) and scene 9 (since V52), `sh1` to `sh6` (sk_pit9.js: the Short
Hand lessons and bouts), the last of which sets `S.story.ended='act1'`: the end card says the rest of Act I is being built. All
nine scenes of beats 1 and 2 are in the game. Stages carry `act:1`; the act's first shows its card first (`st.actCard`, `S.card.pre`) and each
scene's card reads ACT I · SCENE n (`S.card.kick`); the Chapters menu groups them under the act.
- Who he is (sk_pit.js): ACT1_K (the hip dagger, skill 4, 150 health, four pips: footMaxOf), drained, `st.weapon` ('fists' where he
  holds nothing), `st.wear` (what he wears, below; 'kit' means the crate's choice), and one arm. `f.oneArm` turns off the BACK arm's
  sticks and keeps its points at the chest; the rig's front arm (every weapon system's) is his left. Scene 1 keeps the fall's own
  wound instead (`st.wound`: `armOff`, the front arm gone), and the skillet sets `K.seared`. `S.act1` is the Pit's record of what each
  scene did (reset when a story run starts); `S.story.flags.kit` is the crate's choice.
- The look (sk_lookui.js): `F.wear` = {top 'bare'|'shirt'|'jersey'|'under', coat 'oilcloth'|'canvas'|null, scarf, hands 'glove'|'wrap',
  feet 'boots'|'sandals'|'bare', belt 'belt'|'rope', bandage, pinned} draws him in the Pit's colours (`pitLook`: PIT_COL over each
  look, `look.noGold`: goldLine and tornTrim draw nothing). With `F.oneArm` the arm he has is drawn as the far arm with the weapon in
  its hand (`weaponArm`, `pitArm` per sleeve), and the near shoulder carries what is left (`lostArm`: `bandStump`, dressed or not, or
  `pinnedSleeve`, hanging its full length until Tamm pins it). `F.phantom` (0..1, set by an action that has `phantom`) is the reach of
  the arm that is not there: the empty side comes up. In the Pit the hip dagger is 'crew:kaeldull' (sk_armsui.js: the gilt gone).
  The crate's slots are KIT in sk_pit2.js (`kitWear`, `KIT_CUT`: the oilcloth coat takes 1 off a blade's blow). The crate's preview
  draws him three times (sk_pit2ui.js `A1G_VIEWS`, since V60): in profile, at yaw 3π/2 (turned to face the viewer:
  `KaelLook.draw(c,F,{yaw,headYaw})`) and at yaw π (the profile from his other side, the arm he has toward the viewer), one pose
  (`a1StandFront`) seen three ways, his scarf's end hanging still. `a1FigDraw(canvas, wear)` draws them for any canvas (the menu's
  Gear too): each view is drawn small first and its pixels measured, then the three stand side by side at one size on one floor.
  Turned that far toward the viewer the look draws the scarf's wrap and hanging end from the front and each foot from the front
  (`shoeAt`: `S.front`, drawn over the trouser and the boot's shaft; since V55). Since V56 the front view stands easy (`a1StandFront`,
  `A1G_FRONT`: a little turned, his arm toward the viewer, one foot out: `o.latFootN/F`, `o.latKneeN/F`; since V60 the arm hangs out
  from his side, `latArm` 2.1, the elbow a little bent, `reach` .97 of full reach, `fwd` 3), his hand open
  (`F.openHand`), drawn close up however small (`o.lodMin`). Facing the viewer close up his face has its shapes (`headRound`: pale
  brows, pupils, the lit side of the nose, cheekbone, lip and chin), and in the Pit's wear his feet have theirs (`footDetail`: the
  boot's sole, welt, toe seam and laces, the sandal's rope sole and straps, the toes); the Pit's boots are a worn brown.
- Posed by the scene (sk_pit.js, the back room): `f.bed = {seq, t0}` sets his joints itself after each step's physics (the collide
  wrapper): `bedPoses(K)` (lie, reach, sat, knees, edge, lean, rise, stand: hips, trunk and head angles, hand and feet with the way
  each elbow and knee bends, and the blanket's state), `bedGo(K, [[pose, secs], ...])`, `bedEnd(K)` (his own legs again, standing).
  `A.blanket` draws the cot's blanket over him (sk_pitui.js) until his legs are out from under it (since V55). A pose's `yaw`/`hy`
  turn him toward the room (sk_pitui.js draws him turned, his knees a little lower and apart as he sits: `o.latKnee/latFoot`); he
  swings round to sit on the edge facing the room, and with the hilt turns (the game's own turn, half way) and sits the same way;
  `bedFrom(K)` starts a run from where he is; `poseJoints(b, pose)` is the joints of a pose; `KaelLook.seen` is where his hand and
  hips were drawn, for the hilt and the plates (since V56).
- Carried (sk_pit2.js, scene 3): Tamm brings the crate in in her arms (since V57). `crateTake(T)` (at the stage's setup, while she is
  out of sight) makes `A.crate.held` her and her guard pose the carry (`crateBody`: leaning back a little; `crateArm`: her hands to
  its sides, `A.crate.at()` giving where it is, in her depth, and the hold `grip`); `crateSetDown(T, x)` brings her feet together,
  squats her and takes it to the floor at x, her hands with it, then she stands and it is a floor thing again (`A.crate.x, d`). (A
  deep squat with one foot back lays that shin low, and the cast's `shoeOf` then draws the shoe toes down through the floor: keep the
  feet together, each shin within about 54 degrees of upright.) While she has it the page draws
  it in her own drawing, over her body and under her near arm (sk_pit2ui.js: CastLook.draw's `afterTorso`, `a1CrateArt`), and the
  floor list leaves it out. The same pattern serves for anything a cast member carries in both arms.
- Scene 4, the yard (sk_pit2.js): Tamm gives him the job at the start (water for Dob's birds: fill the bucket at the pump, take it up
  to the loft; Dob watches from his crate), the goal box follows the job (`yardGoal`), and its hint says how each part is done, for a
  finger or for keys (`yardHint`: walking first, then take, fill, the ladder, the gate's free hand, the stairs; since V63). On a
  narrow screen (up to 700 px wide) the walking-about controls stack: the action and Jog on the bottom row, what his hand holds on the
  row over Jog (named Hand), the note over that (sk_css_explore.css); wider, they share one row.
- Walking about (sk_explore.js, sk_exploreui.js): a stage with `explore(st)` returns {bounds, spots, exits, goal {text or fn, hint
  {touch, keys}, done}, view}. A spot: {id, label, verb, x, z, at, run (a scene), when, once, key, needs ('free', 'two' or a fn giving
  the reason), refused (a scene), take (an item into his hand)}. S.ex holds it all: `exGo`, `exUse`, `exSetDown` (what he holds goes on
  the floor as a spot), `exNote`. On auto `exAutoPick` uses each thing in turn (refusals once each, the goal's own last) and sets down
  what blocks him. The page: the goal box (place, goal, hint), the action button, Jog, the hand chip with Set down, the note. A scene
  that starts while he walks about (cutStart, wrapped in sk_explore.js since V60) stops his feet where he is (`cutWalk`, `walkV`
  cleared) but keeps where he was going: exStep does not run under a scene, so a walk left on stepped in place (Dob's line in the yard).
- The people: ACT1_CAST (height, build, posture) and `act1Npc(name)`, drawn by their CastLook.CAST entries (sk_pitcastui.js, which
  adds heads, hair and hats; sk_castui.js gained races, skirts, aprons, braids and the rest). A fighting collector needs
  `f.pitCast='Collector'` or `'Big collector'`. `node uiwork/act1/castview.js <out.png> "Tamm,Dob,Nim" [w h dpr] [arena] [view] [frames] [js]`
  lines them up; `node uiwork/act1/art_c/portrait.js` draws one close; `node uiwork/act1/art_c/castcmp.js check` proves the prologue's
  cast unchanged.
- The places: ACT1_PLACES (sk_pit.js) are the layouts; the painters read them. envx/env_sumproof.js (with the Sump's shared kit
  EnvLook.sump: keep it first of the three), env_sumpkitchen.js, env_backroom.js, env_yard.js (with the Pit's kit EnvLook.pitKit for
  the stairs and the Shelf: S.act1.night/morning/dusk set the time of day), env_stairs.js, env_shelf.js. No fighter stands deeper
  than DEP_MAX (170): Dob perches on the yard's crate, not its wall. A scene can look up: `S.camCut.band` {top, foot} keeps that much of the picture between the letterbox's bars, centred (sk_pitui.js), and `S.camCut.wn` sets the view's width on a narrow screen (the kitchen's window shot; since V53). The three Sump rooms' ceilings are drawn, not left black (since V76, `EnvLook.sump.ceiling`: planks, joists leaning as the floor's boards run, the beams pieced with iron straps, lit where the room's lamp, stove or window reaches), the roof's sky goes on up with the far wall's windows, and their floors run on to 870, so an upright phone's closer framing (`camCutFit`) fills with the room. Where the ground climbs (an arena with `climb(x)`, how far it has come up without the steps: the stair-streets), a walk about or a cut with no band frames the floor's band (BAND0) raised that far where the camera looks, so the picture goes up the stair with him (since V71; a phone on its side lost his head over the top landing).
- One Pit (since V71; the comment over ACT1_PLACES). The yard, the stair-streets and the Shelf are all seen from the Pit's open middle
  looking at the wall the Sump stands under (the Sump's rooms and roof look the other way, at the far wall and the spike), so left and
  right there are left and right on the Pit map: up he walks to the right in every scene, down to the left, through the same places.
  The way: the yard's gate (right) onto the lane; the short flight up from the lane; the Lane stair to the switchback; inside the rock
  back up to the Shelf stair's foot; the Shelf stair; inside the rock up to the Shelf's stair-head at its left end. The stair-streets
  are one arena and one ground ('stairs', act1StairY) and two flights: `S.act1.flight` 'lane' (stairsup, toll, tamm) or 'shelf'
  (shelfstair, stairsdown), set in each setup; env_stairs.js paints each its own (`key()` has the flight). An arch in the back wall is
  each way through the rock (the switchback at the Lane stair's top, the Shelf stair's foot and top, the Shelf's stair-head), with a
  painted board by it (THE SHELF, THE FLOOR). The people (sk_pit5.js): `act1Row(A, K)` seats the silent row and the old man on the
  Shelf stair (ACT1_PLACES.stairs.beggars n, x0..x1; the painter sets a tin cup before each place as a piece), by day too (the old
  man looks off down the street then; at dusk he follows Ilyas); `act1Stand(A)` puts Tarr's two collectors at their stand by day
  (stand: the board at x, the stool at sit, the big one by the door at by; they turn to keep him in sight; at dusk the stand is
  empty and the big one comes down out of it in the toll); `act1Folk(A, key)` the townsfolk and children of ACT1_FOLK by day
  (cast 'Townsfolk' and 'Child', drawn from their seeds: sk_pitcastui.js `folkSpec`, `childSpec`). An NPC's x is held to the stage's
  bounds (clampStage: 60 to 840). The Lane stair has the city's trades and talk on it (a fish stall shut for good with the Tarkesh
  foundries' mark on its post, a skewer stall, the choirhouse and its bell, the Mendery's FREE MENDING, a rondel court chalked at a
  child's height, the match bill, the Nightglass, tracts, a numbers board, the toll board over the stand); the Shelf stair the tea
  stall (TEA, BELLBREAD), the cookshop, the row under Hallowell's old billboard and the keeping niche (its candles three at dusk);
  Tarr's main runs along both with a rag of his blue on its valve, and his tag hangs on the yard pump. The walls' painted boards
  (pitKit WORDS) have the city's words too. The Halo Tram crosses the sky over the Rim (`K.tram`, live, where an upright phone sees
  the sky). Everything on a wall is kept low enough to show under the letterbox: about 205 up at the back wall, 70 over the top landing.
- The Pit map (sk_pit5ui.js, PITMAP, since V71): the same view, on a 600 by 420 sheet: the Floor (the Sump, its gate, the lane, Tarr's
  pumphouse), the two flights rising right (the water toll at the switchback, the beggars' row), the turns inside the rock dashed with
  an arch at each end, the Shelf with its stalls (their names a step up and down in turn), the closed ladders, the spike, the Rim and
  the tower's foot. `a1MapAt(stage)` is where it puts him (PITMAP_AT for scene 5, where the Map button shows; PITMAP_FIGHT for the
  toll and Tamm, for the menu's map).
  A raised place (the hay, the table, the cot) is ground for any body over it at its depth, so a knee or foot that swings past its
  edge is lifted onto its top and the body bobs. In the kitchen Tamm and Dob stand on the floor at the table's ends with
  `f.gr=()=>GB` (since V53); Dob holds the ankles with `F.lookBack` (his face turned away), and Tamm's pan is aimed at the stump.
- The scenes' own things: sk_pitui.js (skillet, soup, hilt, plates, curtain, the skillet's flash and steam, the Aether tab's one
  flicker), sk_pit2ui.js (the gear screen with him drawn in the choice, the crate, the bucket), sk_pit5ui.js (the Pit map, a stall's
  shop with the purse and the satchel grid, the satchel alone, the Map and Satchel buttons; while one of them is up the stage wrap
  has `.a1-modal` and the walking-about controls are put away). Each of sk_pitui.js's things is drawn only in its own room (the
  skillet in the kitchen; the soup, hilt and plates in the back room), and the next scene's setup clears what the last one left
  (since V54). The skillet glows red with `A.skillet.heat` (0 to 1) and is a light: `FXL.lights` (sk_lightui.js) holds a scene's own
  lights, each a function handed `addLight` once a frame.
- The menu in the Pit (sk_pitmenu.js, sk_pitmenuui.js, sk_css_pitmenu.css; since V60): in Act I the menu drawer is his. `PIT_MENU`
  {id, name, stage, got}: Gear from the crate (scene 3, `flags.kit`), Satchel and Map from Tamm's list (scene 5, `A.satchel`, `A.map`),
  Codex with the toll's fight (scene 6), Styles after the first lesson (scene 9, `A.styles`). `pitMenuOpen()` is what is open (a
  section's own stage once `got()`, every stage after it along `storyRank`, the chain of `next` from the first stage); `pitScene(st)`
  is the scene a stage belongs to. The drawer's head reads his name and Act I · Scene n · title; before the crate it holds a line and
  the way to the title. The page (`PM`): a tab and pane per section (the Gear pane draws him with `a1FigDraw` and lists the slots,
  the right arm Missing and his hand; the Satchel pane moves goods to his hand and back while he walks about; the Map pane is
  `a1MapSvg(at)`; the Styles pane `a9CardsHtml()`; the codex is the drawer's own). A section newly open marks the menu button
  (`data-new`), opens the menu on itself, and shows "New in the menu: ..." under the button and the top's boxes and plates once he
  is the player's (`pmFree`). Outside Act I the drawer is the lab's and the prologue's as before. `node uiwork/act1/pmshot.js <outdir>
  <stage> <secs|test> [sizes] [tabs]` shoots a stage, then the menu and each tab.
- Fights of the Pit (sk_pit6.js, for every Act I stage): Kael's flow (sk_chain.js) starts no run while he is drained; a story foe with `cast` gets that cast figure's body and look
  (`storyRoster`); `f.tempoK` scales every cost a fighter pays (`actionCost`), so the turn order, the plans shown and the dock agree;
  a stage with `spare:true` lets nobody die (the killing blow puts him down with 1 left, no finisher; `kill` does the same);
  `oneArmLock(A,cmd)`: with `f.oneArm` the throw and, held from behind, Twist free need two hands and the elbow, shield and stab are
  "Arm pinned" (`cmdValid` refuses them; the dock says why, sk_pit6ui.js); his shove is the "Shoulder shove" on the dock and in a
  window (since V61). The dock also lists the arc-blade's techniques, dark, in a group and tab of their own while he fights in the
  Pit. Drained (`act1Drained(f)`, since V61), his Flow is a fighter's of his rank: `flowTarget` finds a man within 60 (past the gap)
  and 56 deep, and `considerFlow` rolls the read; the free read and the long reach were the light's. `riseUp(fs, t)` (sk_pit.js) is
  how a scene stands its downed people up before it moves them (the motor eased back in, not snapped): every outro uses it. A scene
  that walks people past one another routes them round in depth (the toll's and Tamm's outros: nobody walks through anybody).
- Scene 6, the toll (sk_pit6.js): TOLL {pace, gangHits, heldTurns, breaks, hpEnd}; `S.act1.toll` {breaks, stepIns, acts, gang
  (null, 'armed', 'held'), hits, pins, pinDowns, downed, end}. His first step in (or his third turn) arms the pin; the bigger one
  grabs from behind (forced), holds, and the smaller one works on him; after `gangHits` blows (or `heldTurns` of his turns) he is
  dropped, Broken (the first break that counts). The fight ends at the turn after the second break or under a third of his health
  (`startTurn` wrapper, `storyCleared`). `S.story.flags.downedOne` when he put a collector down. What he held goes down on the step
  (`S.act1.tollDrop`); the rice splits (`S.act1.riceSpill`). `S.act1.tollEnd` hands the positions to scene 7.
- Scene 7, Tamm (sk_pit7.js): Tamm is a team-0 fighter made in setup (`act1Fighter`), `f.scripted` (the AI plays her: `isAI`),
  `f.pocketHand` (her left hand stays in her apron pocket: `pocketFollow`), the boning knife ('crew:boning'), Short Hand at a
  master's rank. Ilyas is down and `npc` for the fight. `S.act1.t7.beat`: 0 the bigger one grabs (her Wrist toll), 1 the other swings
  (forced to land: her Hinge), 2 her Short ladder as a threat (`A.shortThreat`); no free moves (`considerOpening`); the threat's
  hold ends the fight (`S.hooks.short('ladder')` with `res.threat`) and the outro lets him go (`shortRelease`). Her closing line
  reads `riceWhere()` and `flags.downedOne`. The dock is put away while it plays (`.a1-watch`). Where they meet her (since V63): the
  two collectors stand just past him on her side (up the stair, unless he lies too near the top) and she a fight's distance on;
  whoever must pass him goes round in front; at the end of the intro each one's `side` is set from where he stands. The fight's
  `resolveStations` keeps a foe on his own side of the hero (the stage's spawn side), so a collector scene 6 left on the far side of
  Ilyas was put straight back over him, behind Tamm, at his first turn: her Wrist toll was lost and the beats went wrong.
- Scene 8, the yard at night (sk_pit8.js, sk_pit8ui.js): the old ways as buttons (Unroll, Glimmer step; keys U and G) while he walks
  about (`S.ex.old`); Unroll spills the nine plates (spots added as they land), the Glimmer step flickers the Aether tab out; a
  thought on each of the first two tries and the third with the ninth plate; Tamm and he sit on the step (`seatOn`: the crouch is
  eased until the hips rest on it; `f.zMax` lets them sit deeper than a fight's floor).
- Scene 9, Short Hand (sk_pit9.js, sk_pit9ui.js): six yard stages, `sh1` to `sh6` (SH_LESSONS: the move each teaches, Tamm's line,
  the drill, its count). A lesson is a drill (Tamm's turns scripted: shoves with the broom, swings, reaches and grabs, room for the
  ladder, the check and the hook; what counts comes from `S.hooks.short`, the stance from shoves he stays up through, counted as
  his window on her opens when he takes it, since that exchange ends on his move: before V61 a hold he followed up went uncounted) and then a bout
  with the rolling pin (`S.act1.sh.phase`: 'drill', then 'bout' after the cut `shToBout`); a hit is a touch (no damage in the yard,
  no knockdown but a sweep's), his first touch ends a lesson's bout and his third the week's; her fifth ends a lesson's bout too and
  her sixth the week's (`SH_TOUCH`; "Again tomorrow.", and the story goes on: since V61). A drill ends on its count or after `L.cap`
  of Tamm's turns ("Enough. Now properly."), and from her third turn with nothing counted, every third, she says what to do
  (`L.coach`, `R.coach`, in the lesson box in gold; `L.praise` when the count is met). The drill's answer is marked on its button
  ("Lesson": `a9Want()`, sk_pit9ui.js). In the ladder drill she lets the Short ladder in once he is inside her reach (`shLadderShown`:
  she Parries, which it goes under, and the hit is forced), and on auto he holds outside her reach and Hinges her swing in the ladder
  and check drills (since V63: on auto it could miss the count at the cap). A lesson is not a fight: no blood, marks or wounds, a touch's popup reads Touch, the Wrist
  toll stops at the wrist, a disarm is shown and let go, and the knife is back in his hand at his turn. The broom goes for the
  rolling pin by `setWeapon` alone (a `build()` stands her up anew and her hands jump). `S.story.flags.short` is what he has
  learned (each stage's `flagsOut`, so a chapter starts with the lessons before it; `shApply` at every Act I fight). The yard's
  barrels and crates are fixed props in these fights (`painted`: the painter draws them, the engine does not). The styles screen
  opens after the first lesson (`S.act1.styles`) and from its button on his turns after that. In a drill Tamm's balance is full at
  each of her turns and her shoves in the stance drill are at -5; on auto he does what the drill asks. The lesson's box under the
  top bar counts as HUD for the camera (`hudMeasure` wrapper). In a Short Hand fight his empty side turns toward the man in front
  (`f.phantom` held at .22). `node uiwork/act1/probe9.js <stage> <secs>` traces the drills and bouts; `node uiwork/act1/shot9.js
  <outdir> [sizes]` shoots a drill, the styles screen and the last bout.
- Short Hand (sk_short.js, sk_shortui.js; its own report: uiwork/act1/SHORT_REPORT.md): `f.style='shorthand'`, `f.styleMoves`
  {stance, hinge, toll, ladder, check, hook}; `shortOn`, `shortKnows`; the answers 'hinge' (in the Parry's place) and 'toll' (a
  thrust, or a grab in a window of its own, source 'toll'); the techniques 'shortladder' and 'anklehook', the shove 'blindcheck';
  `f.inside` (+2 on his next attack after a Hinge); `A.shortThreat` and `shortRelease(A)`; `S.hooks.short(event, {A, D, kind, res})`
  for 'hinge', 'toll', 'ladder', 'check', 'hook'; every number in SHORT_HAND; STYLES and SHORT_MOVES for a styles screen. Nothing
  changes for a fighter without the style. Suite: `short` (sk_short_test.js). GOODS, STALLS (prices in coin and chits), ERRAND_LIST, SATCHEL (4x2 cells, weight 9) and the errand
  record `S.act1.errand` {bag, hand, coin, chits, got, nim, sharp, salve}; `riceWhere()` ('bag', 'hand' or null) is what Tamm's lines
  in scene 7 read. The Shelf's keepers stand 200 deep behind their counters (their own `f.zMax`; the painter's default). What the
  shop sells works (sk_pit6.js, ACT1_GOODS): the whetstone gives his blade +2 a cut for the next fight he fights (`K.whet`, spent at
  its end), and a salve heals four tenths at the start of the next real fight he is hurt for (not the lessons). No buy may leave the
  list out of reach (`errandAffords(E, got, coin, chits)`: "Tamm’s money: the list first", "That leaves too little for the list"),
  since the way home opens only with the list got (since V61). `errandHome(A)` gives the list's goods over at night and in the
  lessons (what he bought for himself stays in the satchel; a chapter picked there starts with it done).
- Checks: sk_act1_page.js (`act1page`: the scenes on auto, their lines and cards, walking the back room and the yard by hand, the
  gear screen, scene 5's map, shop and satchel rules and the purse kept for the list, the goods given over at home, nobody walked
  through in the outros, the drained Flow, a lesson with nothing pressed that still ends with no blood and the knife kept, the menu
  in the Pit, the Pit's look), and draw_free plays on through them. The V61 audit's tools (uiwork/audit61/): `node anim.js
  [stages] [secs]` watches every Act I stage on auto for stepping in place, sliding feet, feet under the floor, joint jumps, a
  speaker turned away and people in one another; `node lesson.js <stage> <follow|naive|passive|random|literal> [secs] [seed]`
  plays a lesson as a player would; `node shopbrute.js` tries every way of shopping the list. Stills: `node uiwork/act1/play.js <outdir> <stage> w h dpr
  <secs,...>` (a stage on auto, with what was said), `node uiwork/act1/gearshot.js <outdir>` (the gear screen at three sizes), `node uiwork/act1/figshot.js <outdir> <w,h,dpr,mob> [tries.js]`
  (the gear screen's figure alone, after snippets run in the page: for tuning `A1G_FRONT`).
  `EXTRA=name python3 uiwork/act1/mybuild.py <out.html>` builds a page with a module not yet in build.py; `SK_EXTRA=name node
  <suite>.js` loads one into a logic suite (sk_src.js). `node uiwork/act1/shopshot.js <outdir> [w,h,dpr,mobile;...]` shoots scene 5's
  map, shop and satchel. The engine map for the Act I fights: uiwork/act1/COMBAT_MAP.md. The toll: `node uiwork/act1/probe6.js
  <seed>` (turn by turn: pins, breaks), `node uiwork/act1/shot6.js <seed> <outdir>` (stills of the pin and the end), `node
  uiwork/act1/dock6.js <outdir> <seed> [sizes]` (the dock as the player sees it while held); `node uiwork/act1/probe7.js` (scene 7's
  beats). The places (since V71): `node uiwork/act1/placeshot.js <out.png> <stage> [heroX|-] [camX|-] [w h] [secs]` (a still once
  he walks about, him or the camera put where you say), `node uiwork/act1/cutshot.js <out.png> <stage> <secs> [w h]` (a stage on
  auto, cuts and all), `node uiwork/act1/mapshot.js <out.png> [stage] [w h]` (the Pit map as it opens there), `node
  uiwork/act1/tammprobe.js [n]` (Tamm's outro after n endings of the toll: who walked through whom).

## Rules
1. **The drawing never changes the game.** render() and everything it calls may not change anything the game or the page reads. Work
   that must happen every frame goes in `V11UI.tick`. Game-time code in UI files (hooks the game calls, like the suit-tear hook
   `S.hooks.rip`) must not decide anything from drawing caches (`f._coat`, `f._turn`, sprites): those exist only once a figure has
   been drawn. The drawfree suite proves it: the prologue, seven fights and the restaurant's four-room run drawn one frame in eight
   and never drawn must come out the same. The page suites rely on it to skip drawing.
2. **Two sets of dice.** The game's dice are `Math.random` and its own handle to it, `S.rng` (the checks seed both). The UI's are
   `uiRand()` (sk_envui.js, its own seeded generator). No Math.random in a UI file (check.py enforces it), except the bench's "new body" seed line.
   The animation's choices (a blow's variant, a combo, the way a blow is taken) use neither: `animDice` (sk_anim.js) draws them from the
   seed the blow was thrown with, so they change nothing the rules read.
3. Respect `reduceMotion` (shake, flashes, camera punches) and `S.gore` ('off' | 'ink' | 'red').
4. Phones first: paint still things once; no per-frame gradients in loops, no shadowBlur, no big particle counts. sk_perf_page.js
   holds the costs (Kael under 1.5 ms, each cast figure under 1.2, each weapon under .3, the arc-blade's limits).
5. Player-facing text: declarative, matter-of-fact, short, no em dashes. Names come from the Veil synopsis (see "Names"), and are fictional.

## Writing checks
- Page suites step the real page with a fake clock: `window.step(k)` runs k frames and draws **one in eight** by default
  (`window.__drawEvery`; the arc-blade and light suites, which only look at the picture, draw every frame). A check that counts draw
  calls, reads pixels, or looks at drawing state (Kael's coat moves only when he is drawn) must draw every frame:
  `drawAll(()=>{...; step(n); ...})` or `step(n,{every:1})`, and call `render()` once before reading pixels. sk_dom.js draws one
  frame in eight on its stub canvas. `SK_DRAW_EVERY=1 node sk_cast_page.js` runs a suite drawing every frame.
- Read pictures at a pose you set (`put()` the fighters, step, then read), not wherever a seeded fight happens to leave them: a
  change to the dice moves every fight.
- Time an event by what the game records for it, not by the frame a check first sees it in: `S.t` at a frame's end is a sim step
  or two past an event that fell mid-frame, and where in its frame an event falls moves with everything run before it (V89's fights
  moved the fall's first blow off a frame's last step, and the wake check, which compared the two, failed; it now reads the blow's
  own time from pitImpact). And force every answer a forced outcome depends on: `FORCE=['block']` can come as a counter, whose
  opening has no bind (`REACTS=['parry']` too).
- Timing belongs in sk_perf_page.js only (it draws every frame and runs alone at the end of a full run).
- A new suite: add it to SUITES in test.py (command, kind, what it covers), to ORDER (longest first), and to COVERS for the source
  files it covers. A suite fails on a nonzero exit, a line starting `FAIL`, or a closing `errors N` / `problems [...]` that is not empty.
- `SK_TIMING=1 node sk_look_page.js` prints the seconds at each check. `python3 tools/cmp/run_pages.py 1|default <outdir>` runs
  the page suites drawing every frame or as set, timed, to compare the two.
- Node logic checks: `const core=require('./sk_src.js')(); eval(core+'...')` (see sk_v12test.js: FORCE dice, expect(), act()).
- If drawfree reports a difference, some drawing code changes the game. `node probes/lockstep.js` steps a drawn and an undrawn page
  side by side and names the first field where they part; `node probes/render_writes.js` lists what a call of render() changes
  (known drawing caches: `_turn`, `S._rf`, a result word's layout `nx`/`ny`/`w`/`wt`, `S.breach.fl0`, `S.finale.smear.a`; a popup that would rise
  under the top bar or a letterbox stops below it: `ny`, since V61). Move the write to
  `V11UI.tick`, or make the game-time code stop reading the cache.
- `DRAW_EVERY=1 node probes/draw_free.js` prints one way's lines (1 draws every frame, as the real page does); `PART=rooms` runs
  one part.

## Screenshots
Build a copy first (`python3 build.py --qa`) and point the tools at it with `PAGE=uiwork/qa_test.html` so checks can run meanwhile.
- `node uiwork/survey.js <out> [w h dpr] [grounds]`: every ground at a fighting moment.
- `node uiwork/story_tour.js <out> [w h]`: each story stage in its fight and opening scene.
- `node uiwork/stage_shot.js <out> <stage> [frames per still] [stills]`: one stage stepped.
- `node uiwork/hud_shots.js <out> [states] [land,port,desk,tab] [arena]`: the HUD as a player sees it.
- `node uiwork/focus_shots.js <out> [sizes]`: the top bar with a crowd. `node uiwork/fx_shots.js <out> <arena> ...`: hits and magic.
- `node uiwork/pose_light.js <out.png> <ground> kx kz ex ez`: two fighters placed by hand. `node envx/game_shot.js <script.json>`:
  scripted steps on the game's own canvas. `node uiwork/shots.js <prefix> w h dpr [mobile] [load|fight|story]`: the real page.
Look at the pictures at phone sizes (390x844 upright, 844x390 sideways) as well as desktop.
- `node uiwork/look/audit.js <out> [w h dpr] [ids]`: the look audit. Every place the game draws (the story's stages in order and the
  lab's own grounds) at set moments on auto, shot as the player sees it (412x714 upright by default), with each frame's numbers in
  audit.json from the game's canvas between the bars: its average colour and what its light is made of (six clusters of the lit
  pixels), how light, how varied, how saturated, how much of it is flat black (`empty`), how much of Ilyas's outline reads against
  what is next to it (`hero.read`, with the marks on the fight hidden and only what of him shows; `hero.Lb` the ground round him;
  the style guide's rule 8, below), what it costs to draw, and the fight's words over the fighters (`words`: how many are drawn and
  how many the game has said; rule 7); a quarter-size picture of the canvas and the frame round him at full size. It ends with the
  most words drawn at once and the frames that break rule 8. The fast-forward to each moment is not drawn, then two seconds are; the fall is
  drawn all the way. About a quarter of an hour for all 65 frames at 412x714. Each frame's cost is the median of 6 draws (COSTN=<n>
  for more: single draws here wander by several milliseconds; compare two builds with them timed by turns, below).
- `node uiwork/look/push.js <stage|lab_arena> <outprefix> [w h] [reduce]`: the push-in as a player meets it (since V74): the fight
  run to his turn, a move picked, the action played on in real time with his opening cards answered; shots of his turn, the action
  with no card up and his card up, with the camera's numbers, the layer's foot, scale and paint time, and `empty` below the top bar.
- `node uiwork/look/vargo.js <page> <outprefix> <w> <h> <dpr> [marks]`: Lamplight Street from its intro to its outro at its moments on
  auto (since V75): Qadir at his door, the fight, the coat swept back, the pin, the toss, the turn and throw, the blast at 0 to 3 s, the walk in.
- `python3 uiwork/look/hues.py <out>`: from an audit's canvas pictures, each frame's share of the style guide's four colours (gold,
  sodium orange, cyan, white) in its lit picture, into hues.json; the guide's colour checks read it.
- `python3 uiwork/look/faults.py <out>`: the drawing guide's two picture faults in each frame, into faults.json: flat lit patches
  over 2% of the picture (a bare gradient sky counts) and bands that repeat more than once across it. The gilt's bays and the
  underground's ribs repeat by design; whoever reads the result marks those.
- `node uiwork/look/lines.js <out> [w h dpr] [ids]` then `python3 uiwork/look/lines.py <page> <out>`: every stroke's width in world
  units where it lands on the screen (through the still layer, sprites and offscreen bitmaps), put down to the lineWidth assignment
  that set it (file, line and column): its median, least and most, colour and alpha, and whether it meets the drawing guide's rule 2
  (1.5 units; 1 for a highlight). `LWF=<file>` ({"line:col": k} for the page the run uses) previews a change to those assignments.
- `python3 uiwork/look/review.py [out] [--judge] [--no-desk] [--keep-lines "why"]`: the look review (since V88; `python3 test.py
  look` runs it alone into test_out/look and records its pass in test_out/look_pass.json, which `--status` checks). It runs the
  audit at 412x714 alone, then the audit at 1280x800 beside the line widths, the colours and the picture faults, and times again
  by turns against the fall (`costs.js`) the phone's frames that cost 85% of the fall's dearest frame or more. Then it fails a frame
  for each rule it breaks, on a line starting FAIL: black (the style guide's rule 1: 5% at most, in the action and the scenes),
  outline and ground (rule 8, as the audit judges them), cost (rule 6: no more than the fall's dearest frame timed by turns, 5%
  over being the timing's own wander), gold (rule 3: under 1% in each frame of Act I lit 2% or more), rooms (rule 3: across the
  lobby's frames and across the office's, gold at least matches sodium), words (rule 7: two), flat and repeat (the drawing guide's
  rules 5 and 6, from faults.py), thin (rule 2, faint lines aside) and errors (a page error, a moment never reached). It writes
  review.json: every frame's numbers, pictures and verdicts (the lookbook's source). What has been judged and kept is in
  uiwork/look/kept.json (by rule, then a frame, a frame at one size such as `night_t15@1280x800`, or a place, each with its
  reason; a flat patch up to a share of the picture and above a row) and kept_lines.json (each thin line kept, by its file and the
  source round its lineWidth, with its reason); a kept entry nothing needs any more is named, so the lists stay true. `--judge`
  judges a folder again without running anything (after a change to the lists); `--keep-lines "why"` adds the thin lines a run
  found to kept_lines.json with that reason, once they have been judged; `--no-desk` is a partial review, never a pass.
- `python3 uiwork/look/lookbook.py [review folder] [out]` (test_out/look, test_out/lookbook): the lookbook (since Nov 4), every place
  beside the frame of its kind (the style guide's rule 2 and its place table: set pieces beside the fall, rooms and the underground
  beside the lobby, the city at night beside Lamplight Street in the rain, the Pit and its rooms beside the stairs at dusk), each
  with its frames, the review's numbers and its word, and a verdict by eye (holds, mixed, falls off) with notes; the four frames
  to match, the colour script in story order (each frame's light and its gold) and the review's rules. It is built from a look
  review's folder and uiwork/look/lookbook.json (the places, their kinds and frames, the verdicts and notes, judged by eye at V88,
  the 13 mixed ones again at V90: judge a place again when it changes), into index.html and img/ (each frame's phone still at 618 by 1071, a small one, its wide
  one at 960 by 600; about 10 MB).
- `node uiwork/look/costs.js <out.json> <frame,...> [w h dpr]`: frames held where the audit shoots them, each in a page of its own,
  timed by turns against the fall as it plays drawn all the way (`ROUNDS`, default 3, of `COSTN` draws): the cost the review
  judges. A single run of the audit wanders by a quarter; by turns, by about 5%.
- uiwork/look/places.js: the places and moments the audit, the line widths and the costs visit, Act I and the family's rooms, and
  the page's fake clock, dice and moments. In these tools the page's own clock (`performance.now`) follows the fake one (since
  V88), so what the drawing times by it (a struck man's flash, a layer painted again once the zoom holds still, the shake) comes
  out the same however fast the machine runs; the cost alone is timed by the real clock.

**The visual director (since Nov 2).** The look kept consistent by design rather than by memory, in four phases: (1) the audit,
done: the Noir Gilt Audit (https://claude.ai/artifact/AmXd4JN8ZqZQ4SbNq6Ae9a) has every place's frames with a verdict (9 hold, 12
mixed, 6 fall off of 27 views) and notes, the problems that run across places (an upright phone sees past what 19 of 27 views
paint; the camera's finish lives only in the fall; light drawn as hard wedges and slabs; the Pit by day has no light; Ilyas lost on
dark ground; the fight's words in four styles; the underground without its lights; no colour script; the crowded fights cost up to
47 ms here), the colour script as it stands, and the eight decisions phase 2 was written from; (2) the style guide, approved by
the user on Nov 2: the Noir Gilt Style Guide (https://claude.ai/artifact/Lue47W1ygrJFpaUjErsuXM), whose standing rules follow, with
its companion the Noir Gilt Drawing Guide (https://claude.ai/artifact/PN2fZLGXe4kfyxitjDYejm: detail by depth, the phone's scale,
the four worlds' shapes, how an object is built, materials, repetition, people and signs, the faults the audit found), approved
Nov 2 too, its rules after the look's; and the Noir Gilt Remediation List (https://claude.ai/artifact/XuHtYYHCfBNG47sQBAS7mR), every
instance in V73 that breaks the two guides (133, in phase 3's order, each with a fixed ID such as P1 or L3 and a status to keep up
as the work lands); (3) the look held in one place in the code, in the style guide's order (the push-in, the look as data, one soft
light, the rim from the key, cheaper crowds, the shared finish, the words, the colour script), working down the list; (4) a
reviewer, checks and a lookbook. Phase 3 began with V74 (Nov 2): the push-in (P1 to P4) and the ground in front of every fight
(the action's part of P5 to P29); V75 (Nov 3, asked for) drew Lamplight Street to the size of the people on it and moved the
Qadir fight onto the bistro's flags; V76 (Nov 3) finished the push-in's rows (P5 to P29): the scenes framed closer on an upright phone where a place stops at its ceiling (`camCutFit`), the Sump's ceilings drawn, the lobby's and the office's coffers going on up (`upTile`), the lobby's marble and the chase's pavement run on toward us (`below`, the front band), the tunnel's vault, the night skies lifted to a deep blue at their tops (`sceneNightLift`); V77 (Nov 3) made light one soft piece (L1 to L20: `EnvLook.softCone` and `softSpill`, below); V78 (Nov 3) gave the figures' rim each place's key light and lit the ground behind every fight (M1 to M22: `FigKit.useKey`, each place's `set`, below); V79 (Nov 3) made the crowded fights cheaper and gave every place the finish (C1 to C5, F1, F2: `EnvLook.finish`, below); V80 (Nov 3) set the fight's words in one style, two at most (W1 to W15: `fightWords`, `logNote`, below); V81 (Nov 4) wrote the colour script (K1 to K9: the office and the lobby lit gold, the Pit's hay and lamplight kept off it, the roof's gold draining with the round, the Pit's sun, ivory cloths in the dining room; `pitKit.sun`, `sunlight`, the roof's `GILT`, below); V82 (Nov 4) drew the places' faults (D1 to D25: the sundown's cirrus and dust, the avenue's speed, the checkpoint's firelight, a blow's flash, the station's crystals, clean trails, the roof's cloud, the hay's straw, the back room's lamp, the Pit's wall, floors and skies, `pitKit.mottle`, below); V83 (Nov 4) set the fine marks (T1 to T6: the places' thin lines brought to the drawing guide's widths from where they land, `uiwork/look/lines.js`; the world's signs in Alegreya SC, 12 units where they are read, the checkpoint's message board in hand-drawn lamps, below) and, asked for, brought the bistro's dining room to life behind its windows in the Qadir fight and made the ride out of the field fast. The remediation list is done; V84 (Nov 4, asked for) gave the fighters the same line pass (Ilyas, the weapons, the guns, the beasts and the figure kit's folds, below); V85 (Nov 4, asked for) drew the bistro's diners as the game's people, made the avenue three blocks in a seeded order, dashed him to the bike and to the grenade, walled the checkpoint's carrier and shouldered his rifle (above); V86 (Nov 4, asked for) nested the rifle's butt into the pocket of his shoulder and V87 (asked for) lifted his head back up behind the sight (above); V88 (Nov 4, asked for) began phase 4 with the reviewer (`python3 test.py look`, below) and put right what its first run failed, and the lookbook (Nov 4, asked for: the Noir Gilt Lookbook, https://claude.ai/artifact/UGQyH4NAZm5wik41FkMVqs) finished it: every place beside the frame of its kind, with the review's numbers and a verdict by eye, 15 hold, 13 mixed and none falls off of 28 views (9, 12 and 6 of 27 at the audit). V89 (Nov 4, asked for: the arc-blade knocked out of his hand too much, and rarely a reason to change stance) gave him his grip (a disarm takes the arc-blade only on a crushing roll) and men who read his stance (a Veteran throws what it gives way to; Bound's overhead and Close's point -2): matching the bar now wins the lab's auto fights 91% to Bound's 83%, and he loses the blade in one fight in fifty. V90 (Nov 5, asked for: fix the lookbook's mixed places) put the 13 mixed views right, each by what its note found (the mixed places, below): cloud over the night skies, warm light beside the cold fights, the tunnel's lamps lighting its vault, the Pit's walls in the sun, the morning's warmth, the day through the back room's boards, rain on the Sump's roof; judged again, the lookbook has 28 hold, none mixed and none falling off of 28 views (15, 13 and 0 at V88).

**The look's rules (the style guide, approved Nov 2).** Visual work follows them; the guide has the reasons and the numbers' sources.
1. An upright phone: push in. On the player's turn the moves cover the band under the floor; when they drop for the action the
   camera eases in until the place fills the screen (about 404 units across on a 412x714 phone, y -90 to 610), stopping where
   everyone in the fight still fits. The black under the world's foot (y 500, solid by 540) moves down, and a place paints more
   ground wherever a wide fight still shows black: the audit's `empty` 5% or less in the action. Story beats frame the same way
   between the bars; reduced motion cuts instead of gliding; a wide screen is unchanged.
2. The frames to match: the fall for set pieces, the lobby for rooms (the underground's too), Lamplight Street in the rain for the
   city at night, the stairs at dusk for the Pit, its rooms too. The road at sundown is a set piece.
3. Colour by meaning: gold #e2b65a (HUD #e9c46e) is the gilt and the family's money, cyan #7ff3e3 elven light, sodium orange
   (#ffb25e, #ff8a3c) the city and the poor, white #f2ece0 the man in white alone. The roof's betrayal drains the gold; the Pit has
   none but what fell with him (his arm on the spike, his cut suit's trim); the joining brings it back. Checked with
   `uiwork/look/hues.py`: gold under 1% of Act I's lit picture, and at least as much gold as sodium in the family's rooms.
4. The Pit by day: a pale warm sun (about #ffd6a0, never gilt) low over the quarry's rim, soft shafts down the terraces, cool slate
   shadows under the walkways; its saturation aims near .3.
5. Light is soft: its sides feather across at least a quarter of its width at the foot, it fades with distance, and one shared
   piece in env_look.js draws it, replacing `beam()`, the helicopter's own `beam()`, `glowSprites()` and `liftSpill()`. Hard
   geometry stays in the gilt ornament.
6. The finish (glow, darkened edges, grain) in every place from one shared pass. Glow: the fall's .34 to .6 for set pieces, .3 for
   rooms and the city, .2 for the underground and the Pit; edges .3 to .62, .5 and .62; grain on screens 640 points and up. Lite
   keeps only the edges, Off none. The pass costs no more than the fall's (6.7 ms at Full, 2.0 at Lite at 412x714), and no place's
   frame costs more than the fall's in the same audit run (38 ms on Nov 2); the deep station, the kitchen and the dining room come
   down 10 to 15 ms first.
7. The fight's words: at most two over the fighters (the move's name and its result), both Alegreya SC in cream #f3ead6; one result
   word, the biggest (Broken, Disarmed, Guard broken, Tripped or Knocked down, Critical, damage, Blocked); routine states (off
   balance, committed, rises, down, braces) go to the poses, the footing ring and the log. The enemies' intent boxes on your turn stay.
8. Darkness: the figures' rim (FigKit) takes each place's key light, its direction and colour, and brightens on ground under .2; the
   ground behind the fight band never measures under .2 and aims for .28; the audit fails any frame where under two thirds of
   Ilyas's outline reads, measured with the footing rings and head bars hidden.

**The drawing's rules (the drawing guide, approved Nov 2).** How things are drawn; the guide has the tables and the examples.
1. Detail follows depth in five tiers: far (shapes and lit specks, within .15 of the sky behind), the set (the most detail, above
   the fight), the fight (the figure kit's), the floor (calm: one material at low contrast, .2 to .4), the foreground (big dark
   shapes over the fighters, never across a head, at most a tenth of the screen's width each). The set is quiet right behind the
   heads.
2. The phone sets the scale: the smallest mark is 1.5 units (1 only for a highlight on a lit edge); one repeat of a texture is 4
   to 40 units; fine texture is baked into tiles (env_tex.js), never drawn mark by mark in a frame; still layers are painted for the
   push-in's closest view (about 2.3 pixels per unit); a sign meant to be read is at least 12 units tall.
3. Four worlds, four shape languages: the gilt upright, exact, mirrored; the city ordered and worn; the underground ribbed, tiled,
   in a steady beat with breaks; the Pit crooked, patched, stacked, never square, no straight run over 40 units unbroken.
4. Every object is built in eight steps: silhouette, planes of light from the key, its material's tile, structure, ornament, the
   world's wear, a light catch with a contact shadow, then the tier's air.
5. One tile and one light behaviour per material (the drawing guide's table), and no flat fills.
6. Machine-made things may repeat exactly, lived-in things never; a tile repeats no more than once across 900 units; the Pit's
   pieces vary by up to a quarter in size, 6 degrees in lean and two fifths in spacing; every choice comes from a seed.
7. People who are not fighting are drawn with the figure kit's planes and rim, busy and in overlapping groups; world text is
   Alegreya SC or hand-drawn, never the HUD's Barlow; props tell the place's story or serve the fight.

**The look review (since V88, phase 4).** `python3 test.py look` holds every place to the two guides' measured rules, frame by
frame, on an upright phone and a wide screen (uiwork/look/review.py, under Screenshots), and a frame that breaks one fails. A fail
is put right, or judged and kept with its reason: a frame or a place in uiwork/look/kept.json, a thin line in kept_lines.json.
Its first run failed the station's and the tunnel's flat black (6 to 8% where the finish's dark foot met their darkest ground),
a flat patch under the stairs' ledge and Ilyas's outline in the yard at night on a wide screen (.64), all put right in V88: the
platform's face and the siding's bed lighter and the near bed's fall-off eased (1 to 2% now), the tunnel's vault less sooted and
the bed under the car drawn in its shadow (4%), ledgers across the timbers under the stairs' ledge, and his scarf given edges, the
side toward the key light caught in it and the other in its own shade (.70; the yard's night light lifts the ground off its pools a
little more too, `base` .36). It failed the deep station's cost as well, read then against the fall's middle frame; the cost is read
against the fall's dearest frame, as the audit of Nov 2 and V79 read it, and by turns the deep station's fight runs 94 to 104% of
that, its lizard alone about 9 ms of the frame (his sprite is a third of the screen). The new lines since V84 were brought to the
drawing guide's width (the avenue's new fronts, the diners' glasses), and the bistro's diners are drawn at the cast kit's least
detail (`o.lod`: their sprite shows at under a pixel a unit of the figure, so a face's fine lines landed under half a unit of the
world). Kept: the three title cards' black, the dream's open sky and the sundown's late one, the repeats of the gilt, the
underground, the dining room's ceiling beams, the tower's windows and Lamplight Street's arches and lamps, and the 251 thin lines
judged in V83 and V84. A change to the fights moves what the frames hold: V89's (men who read his stance) brought the chase's f8
and the kitchen's f5 to the push-in at its closest on a clash, and Ilyas into Unbound, none of it shot before. Nothing was drawn
differently, so they are kept, and the open ones say so ("open (V89)", with what is to do): the two frames' cost (119 and 116% of
the fall's dearest; the avenue's bands are 22 ms of the chase's 45 there, the light's sprites 16 of the kitchen's), the avenue's
29 lines at .7 of their width pushed in, and with their tiers the whip's 5 lines and the blade's 3 (the figure tier) and one
reflection's width (the caller's). A kept cost holds up to its max, as a flat patch does (since V89): those two to 130%, and the
deep station's f4 to 115%, at the line since V88 and 108% in one of V89's runs, when the fall's own dearest frame came in at 38.5 ms
against 42.4 in the run before (three timings a moment: the reference wanders as much as the frames). V90's places brought the old station into the line's f5 and so its lines into the review for the first time: brought to the drawing guide's widths, its platform's joints kept as fine texture. At f5's push-in the kitchen's course of green tiles repeats at the line (r .71 in one run), kept as machine-made. And the prologue's crowded fights cross the cost line and back from run to run, the fall's own dearest frame at 40 to 47 ms in V90's four timings: the chase's f8 110 to 139%, the dining room's f2 96 to 119% and f5 88 to 103%, the kitchen's f2 89 to 101%, the deep station's f4 up to 106%, none of them drawn differently (by turns against V89's build). They are kept to a max with those ranges: the chase's f8 to 145%, the dining room's f2 to 125%, the others to 115 or 120%.

## Publishing
Run `python3 test.py full` first, then `python3 test.py look` (alone, about 20 minutes: it times the drawing), and `python3 test.py
--status` just before publishing (it names any file changed since either passed). A version that changes the look republishes the
lookbook too: `python3 uiwork/look/lookbook.py` after the look review, its verdicts brought up to date in lookbook.json, then
test_out/lookbook's files (index.html and every img/ file) to https://claude.ai/artifact/UGQyH4NAZm5wik41FkMVqs with the artifacts
server's `publish_files` (slug dccdac2e-9c8b-4fce-913b-3e3954155312, its live version as `base_version`; a frame no longer shot
goes in `remove`).
Publish ragdoll-skirmish-lab.html with the Artifact tool to the same url (https://claude.ai/artifact/61wMNijJeCxJvsa3vWMbxJ) with a
short label "V91 ..." (V90 was the last published; count on from it). Where the Artifact tool is not offered, the artifacts
server's `publish_files` publishes it (slug 289f303f-7e57-4646-ab76-3e919649925f, the live version as `base_version`): it wants a
whole document, so the page goes as index.html wrapped as the Artifact tool wraps it, `python3 tools/wrap_page.py <out.html>` (V88). The song and the recorded sounds are published beside the page
as the artifact's files: `files: {"music/lepers_ascent.mp3": "music/lepers_ascent.mp3", "sfx/swing_mid.mp3": "sfx/swing_mid.mp3",
...}`, every file in sfx/ under its own path (153; one publish takes up to 255 files). An update keeps the files it does not name,
so pass them only when they change or when publishing to a new url (V68 sent the song, V69 the sounds). (At V56 the perf check "each elf or crew member under 1.2 ms" ran 1.13 to 1.39 ms here, the V55 look file the same or slower: this machine, not the code. At V71 it ran 1.14 to 1.27 ms, and V70's code 1.09 to 1.25 ms in the same hour, run by turns; at V72, 1.28 at the end of the full run. At V82, 1.17 to 1.32, and V81's build 1.24 to 1.33 by turns in the same hour. At V90 his suit cut to ribbons came in .80 ms over him plain in one full run, at the limit, with nothing of his drawing changed, and under it in the runs either side.) Never delete the duplicate artifact
https://claude.ai/artifact/GFgjvMLi5jWg7TAKFgkqqm.
Then the version goes into the repository: commit the changed sources (`git add -A`; the message "V91: ..." and a line or two of what
changed) and push it (`git push origin main`). One commit per published version, named by its message. (Tags: the workspace's git
access refuses a tag push, so a version that wants a tag is tagged from GitHub's Releases page or from a clone with full access.)

## Reporting to the user
They read on a phone. Reports are declarative and matter-of-fact, short, with few em dashes. Say what changed for the player, what
was checked, and anything that did not work, plainly.

## Pitfalls met before
- Seed both of the game's dice handles in a check: `Math.random=...;S.rng=Math.random;`. The game keeps its own handle (S.rng, set
  at load); a check that only replaces Math.random is not reproducible (the finale suite was like that until Oct 20).
- sk_dom.js plays at random on purpose (a fuzz run): its counts differ every run. Only its errors and problem counters matter.
  An empty intents panel counts as a problem only while Kael lives and a foe stands (on Oct 21 it tripped once in an ally fight that
  ran out of time mid-exchange, most likely with Kael dead and Mara fighting on, where the panel is empty by design); each empty
  panel it meets is printed with the state, so a new trip can be read from test_out/dom.txt.
- A page check that reads Kael's picture after a scripted fight depends on which frames were drawn before it (his coat moves only
  when drawn, and earlier checks that play fights to the end shift the one-in-eight phase). Settle him with `drawAll(()=>step(n))`
  before reading pixels (the suit-tear check in sk_look_page.js broke this way when Flow changed how fights end).
- Game helpers that remember things can write game state from the drawing: divSide sets `f.dsd` when it has no answer yet. Code the
  drawing calls (sk_roomui.js asks roomMoves for its guides) reads without writing (`roomSide`).
- ESLint must run from this folder with `-c tools/eslint.config.mjs --no-config-lookup` (check.py does).
- `.frows` is a column in the base CSS: a row of plates needs `flex-direction:row`.
- Timing checks fail under load: never run sk_perf_page.js beside another suite. The crew figure's check sits close to its limit
  (1.16 ms against 1.2 on Oct 21; one full run read 1.201): a miss by a hundredth is noise, so run `python3 test.py perf` alone to
  confirm, then the full run again for the record. On the machine of the afternoon of Oct 21 it read 1.23 to 1.38 for the V45 and
  V46 builds alike (and once the weapon check missed too): a slower machine, not the change. To tell which, build the sources before
  the change (keep copies) and time both on the same machine. On Oct 28 (V70) the crew figure read 1.07 alone and 1.22 to 1.31 at the
  end of each full run, and the V69 build timed beside it read 1.14 to 1.28: the machine again (V70 was published on the 24 other
  suites and the timing checks passing alone).
- Under SK_TEST the effects never auto-drop; in a real browser a slow first second can move a device to Lite.
- The node checks have no Path2D or DOMMatrix: FXL and the scene painters stand down there (`SCENE_OK`).
- A scene's still layer (sceneLayer) covers RC: y -90 to 870 since V74 (the part below 610 kept only on an upright screen,
  `sceneLayerH`), painted for the push-in's closest view (`camCloseW`: 2.4 pixels a unit at the most, about twice V73's paint time
  and pixels on a phone). Each place's ground runs on to `EnvLook.FOOT` (depth `EnvLook.NEAR`), its darkening as it was down to the
  fight's front and held there beyond (`EnvLook.fallKeep`); a place that adds rows or marks in front keeps them on their own dice, so
  what was behind the fight is painted as before. The black starts where the layer was measured to stop painting (`sceneBandOf`,
  which also reads where its rows stop being flat black, `top` and `bot`; `camPaintFoot`; the old look keeps H+40). Above the
  layer `sceneDraw` stretches the layer's top row up (under a night sky, `SCENE_NIGHT`, with a field of faint stars laid over it;
  a night sky that went to black at the layer's top is lifted to a deep blue there when it is painted, `sceneNightLift`, since
  V76), or, for a place with `upTile`, draws that many units of the layer's top on up again and again, each a little darker (the
  lobby's coffers, rows of 66 jointed at y -90). A place with `below(c, x0, x1, y0, y1)` runs its floor on under the layer's foot
  and has no black there (the lobby's marble, since V76). The tunnel's vault goes on up over its wall in its live() (`vaultTile`,
  scrolled with the wall). Elsewhere a phone held upright, which sees far above the layer, shows bare stripes there unless the
  scene's live() draws that part. The fall's live
  picture runs from the camera's top to its foot, -110 to H+120 at the least (since V72, `EnvLook.S.fall.span`; before, the floors
  stopped at -110 and an upright phone showed a band of bare piers over them, and the night's top row of stars stretched into lines).
  Anything drawn in pieces there clips to that range (`junkWalls` does), or it pokes out above the far side's top edge.
- Light is one piece (since V77, the style guide's rule 5): `EnvLook.softSpr(col, spread, fall, lead)` makes a cone once for each colour, spread (its source's width over its foot's, in twentieths) and fall, row by row with a gradient across each (a canvas with no pixel access makes it too): a bell with a brighter core, its sides feathering from full to nothing between three and five quarters of the nominal half-width (a quarter of the width at the foot on each side), fading along with the distance. `EnvLook.softCone(c, x, y, w0, w1, h, col, a, ang, fall)` stamps it from a source (w0 and w1 are where it is half gone; ang is the turn from straight down), `softSpill(c, x, d, w0, w1, len, col, a, g, ang)` lays it in the ground plane, from a door out toward us by default (full at the sill). `beam()` is softCone; glowSprites().cone (the room lamps: the dining room, the kitchen, the lobby, the office) is the sprite itself, so the width it is stamped at is where the last of it goes; liftSpill (the kitchen's secret lift, the lobby's, the platform's) is two softSpills and the wall's halo; the checkpoint's floods and searchlights, the roof's crown beam and searchlights, the helicopter's searchlight, the train's and the bikes' headlamps, the street's window spills, the lobby's slot light and the sundown's shafts are the piece too, and the line of light under the executive's doors fades at its ends. The helicopter's open door is a light (FXL's lights, sk_storyui.js: the man in white lit warm) with its own spill across the pad (HeliLook.wash). The fall keeps its own per-pixel beams, the model the piece was made from.
- The rim and the darkness (since V78, the style guide's rule 8). Each place's `light(f)` gives its key light's colour (`col`) with
  where it is; `kaelLight` passes it on with `rk`, how much stronger the rim is on the ground there, and the figures' drawings
  (Ilyas's, the cast's, the beasts', his arm on the spike) start with `FigKit.useKey(o)`: every rim, lit plane, fold and edge of
  light takes the key's colour brought up to a rim's brightness (`FigKit.rimCol`; `rimOf` keeps its hue, the brightest channel
  full, then toward white until it is .72 light), and `FigKit.light` lays the rim on stronger and wider by `rimK` (1.8 times at a
  ground of .1 and under, nothing over .2). The ground behind a figure is read off the place's layer as it is painted (`sceneGrid`,
  a cell every 10 units; `sceneGround`), or given by a place whose ground is drawn as it moves (`ground`: the tunnel .26, the chase
  .28, the fall .24). The ground behind the fight band is lit to .2 and more, aiming at .28, by each place's `set` (an object, or a
  function of the hour: the yard, the stairs, the fall): {col, gain (colour-dodge: each surface so many times as light at full,
  black left black), soft (soft-light: the darks lifted most, the lights least), air (screen: the darks a touch), y: [y0, y1, y2, y3]
  (nothing at y0, full from y1 to y2, nothing at y3), base and pools ([x, half width, 0..1]: the yard's door and window at night)}.
  It is laid into the layer once as it is painted (`setDraw`): soft-light over the band costs a CPU canvas about 8 ms a frame, so
  only `setLive` places (the chase's street, the face in the fall) draw it each frame, at 5 to 10 ms there; the tunnel's (since
  V79) is laid into each made picture that goes by in its band, the wall, its passages, the old station and the far rail, as it is
  made (`lit` in env_tunnel.js), and into the layer for the deck: the band runs the same all along the line. The
  flatcar's deck is a lit grey plate and the station's bores carry the far lamp's light in their air, the two dark grounds the light
  cannot lift. The audit reads his outline on the frame drawn again without the footing rings, the head bars and the
  labels, once more without him and once without anyone (their shadows kept), so only what of him shows counts (`shown`) and only
  where it is against the ground (`alone`: Tamm holding him up is left out); an outline mostly hidden (under 24 points of it), or
  one with a blow's flash on him (`FXL.struck` over .25: struck white, an impact where he is) is not judged, and the run ends with
  `rule 8 fails`. The finish's grain (on a wide screen) is held still while he is measured, or the frames drawn again would differ
  by it everywhere; and every pixel is read (since V79: a sample of one in four moved with where his sprite's box starts, and two
  builds whose boxes differed by a pixel read up to a tenth apart on the same picture; the counts are kept in its quarters). Each
  shot writes `<id>_<moment>_hero.png`, the frame round him as he was measured; INJ=<file.js> runs a
  script in the page once it loads, to try a change before making it.
- The finish and the cheaper crowds (since V79, the style guide's rule 6). `EnvLook.finish(o)` (env_look.js) takes the frame as a
  camera takes it; `sceneFinish` (sk_scene_glue.js) runs it from drawFx (sk_ui.js) once the world and its sparks are down, before
  the fight's words, the head bars, the labels, the guides, the badges and the story's words and bars. o is {glow, streak,
  streakCol, edges, edgeCol}: a place's own `finish` (an object, or a function of the moment), else its world's (`SCENE_WORLD`,
  `SCENE_FINISH`: the city, the country round it and the rooms glow .3 with edges .5, the underground and the Pit .2 and .62, the
  road at sundown a set piece's .42 with warm streaks); the fall gives its own each frame from its `post()` (.6 at night to .34 in
  the dream, .48 in the Pit, a burst as he wakes; edges .5 to .3, .62 in the Pit). At Full the light is the frame at an eighth of
  its size multiplied by itself twice, with the moment's big glows and a crit's flash laid into it there (`FXL.glows()`; FXL then
  draws neither over the whole frame), brought up smoothly to half the size and laid over the frame doubled without smoothing; the
  edges are three bands painted once at half the size for each strength, colour and place of the bars, laid on without smoothing;
  the grain only on screens 640 points and up. Lite: the edges. Off: none. Where it draws, the wrap carries `data-fin="1"` and the
  page's own vignette (sk_css_light.css) stands down. Timed by turns with it and without on a phone here: 4 to 6.5 ms at Full (the
  fall 5.7, where its own pass was 6.7), under 1 at Lite. `EnvLook.finishLast` counts the passes and keeps the last strengths; the
  look suite checks the street and the yard at each setting.
  The crowds cost less by drawing less, not less of the look. Each figure's sprite box (`prepass`, sk_lightui.js) is its joints,
  scarf and tail with margins measured over long fights (a man 70 to the sides, 48 up and 28 down; a beast 44, 38 and 28), mirrored
  about his middle only while he turns round or spins (`mirrored`); before, every box was mirrored, a beast's reached 140 past its
  joints and a spin added its sweep. The wash of each ground's tint over every sprite went (the V78 rim carries the key); two or
  more lights on a man are drawn into a map a quarter of his sprite's size and laid over him once, without smoothing (the glows are
  soft); in a crowd (more than four men
  standing) each casts only the shadow of the lamp that lights him most; reflection bands fainter than .03 are left out; a goblin
  or the lizard keeps the game's own detail up to 3.4 pixels a unit (`LOD` in beasts.js, 1.9 before: the push-in's 2.3 drew them at
  a close view's cost); over a layer's top the sky is a fill of the top row's colours (`sceneTopFill`), and the night's stars are
  specks drawn only where the view needs them, not a pattern scaled over the sky; the tunnel's light on the fight goes into its
  made pictures (above). Against V78, timed by turns at 412x714 with the finish in every place now: the deep station's fight 54
  to 39 ms, the kitchen's 43 to 36, the dining room's 45 to 37, the lab's street 41 to 31, the checkpoint's 33 to 28, the train's
  33 to 25; the fall's two dearest frames 41 to 38 and 40 to 35 (its finish is cheaper too). The deep station is the one place
  near the fall's cost (39 against 38 by turns): its lizard alone draws in 5 to 6 ms.
- The fight's words (since V80, the style guide's rule 7). At most two over the fighters: the move's name (a callout, over the
  mover as it starts) and its result (a popup, over the one it lands on), both Alegreya SC in cream #f3ead6 with the dark stroke,
  the name 15 units and underlined in the mover's colour, the result 19 with the damage beside its word, both in the world's units
  as the fighters are and kept inside the view and under the top bar (`WORD`, `fightWords`, `drawCallouts`, `drawResult` in
  sk_ui.js; sk_finaleui.js and sk_roomui.js wrap drawCallouts). A new name replaces the last. The result is the newest move's
  biggest: each popup is kept as it was said (the checks read them), with its rank (`POP_RANK`, sk_core.js: a kill 10, Broken 9,
  Disarmed 8, Guard broken 7, a fall 6, Critical 5, anything else it did 4.5, plain damage 4, Blocked, Deflected or Countered 2, a
  miss 1), its damage, its fighter and its move (`g`: each exchange its own, and each stretch between them); a lesser one than the
  move has said goes when that one does, and the damage the move did to that man stands beside the word ("Knocked down 14"). A
  number's second line that is a result (Out, Knocked down, Swept, Critical, Dazed) is its word; any other second line goes to the
  log (`logNote`, `S.hooks.note`: a line in the exchange's entry, or an entry of its own), and so do the routine states, which get
  no word at all: Keeps his feet, Braced, Steps in, Glass underfoot, Spear set, Covered, Back up, Freed, Breaks free, Overdrive,
  Gilt edge, Whetted edge, Salve, Down on the steps, No free rise, Rises, Clear, Braces, Stuck, Dagger drawn, Overextended, Twists
  free, On the glass, Lamp out, The knife, Keeps his seat. Nothing is written at the feet: the footing ring (the balance bar, off
  balance and Broken pulsing on it), the guard's arc and the pose say how a man stands. The Flow count is the corner badge's alone.
  A table's, a wall's or a screen's result is said where it happened (`popAt`). The enemies' intent boxes on your turn stay as they
  were. The look suite checks it through a crowded fight in the dining room.
- The colour script (since V81, the style guide's rules 3 and 4). Gold is the gilt and the family's money: the office's and the
  lobby's lamps are lit gold (#e2b65a's hue, their light and glows turned from the amber they had: `glowSprites()` gives those two
  rooms gold sprites, `GLOW_AU` in sk_envui.js), the office's oak and burl and the lobby's onyx gilded to match, so gold at least
  matches sodium in both (at 412x714 the office 31 to 32% of its light gold to 24 to 27% sodium, the lobby 13 to 16% to 8%; V80's
  office was 63% sodium to 6% gold). The Pit has none: the landing's hay is straw (under .45 saturation in the gold hues, env_sumproof.js),
  and the yard's lamplight at night is the poor's orange, its door and window painted dark because the yard's set light (a dodge)
  lifts what is painted by its pools, and a bright orange lifted that way clips to yellow (gold in the yard at night 1.5% to .3%).
  The roof's betrayal drains the gold: paint() keeps each gold shape as it draws it (`GILT` in env_roof.js: the crown's blades and
  mullions, the coping, the stair head's trim, the pad's ring and H in the deck's plane, the edge's lip and the line by it), in
  four rings out from the crown, and live() lays a dark tarnish (multiply, #2a2e36) over each ring as hero().drain rises after the
  round (sk_story.js: 0 to 1 over 1.6 s), the crown's cyan left on the dead blades; the crown flares cyan as the round lands, read
  back from how far the drain has gone (nothing kept a frame), and the roof's `light(f)` turns the rim to the crown's cyan while it
  lasts. The helicopter keeps its trim (the family's). The camera eases after him as he backs to the edge (sk_story.js), so the
  gilt going dark on him is in the picture. The audit's roof has frames as the round lands (t32.9, at 32.1: the game slows there)
  and after the drain (t33.9, at 33.4): gold 2.8% of the light before it, .7% after. The Pit by day has a sun
  (`pitKit.sun()`: about #ffd6a0 low over the rim at the left; by morning #ffe2bf from the right, cooler; none at dusk or at night)
  and `pitKit.sunlight(c, P, x0, x1, y0, y1, o)` lays its light into a place's layer and the picture above it alike, from the rim
  (y -640) down: the side toward it warmer, soft shafts slanting down the terraces (softCone), the far side and the low air cooled
  toward slate. The day's palette has the sun's light on the tops of things, the high haze warm and the shadows and the low air
  slate; by morning the high haze peach where the sun reaches and the shade blue, the sun's wash laid round it (`SUN.morning.wash`,
  fading out before the yard's floor: laid in one veil over the shade's blue, the two made grey) and, through the mist, its side of
  the yard turned warm with its own values kept ('color'; since V90). The figures' rim comes from the sun by day and by
  morning (the yard, the stairs); the Shelf's stall lamps light their shelves (a cone down from each) and their counters' tops.
  Saturation at 412x714: the yard by day .31, the stairs .24 to .29, the Shelf .26 to .28, the mornings .18 to .19 (V89: .32, .27
  to .30, .26 to .28, .15 to .18; V80: .24, .18 to .23, .27, .09 to .10). The dining room's cloths and its tables' marble are ivory and lower (white 3.4% of the light to
  under 1%): white is the man in white's. The look suite checks the drain and the sun.
- The drawing, place by place (since V82, the remediation list's D rows; `faults.py` measures the flat patches and the repeats). The
  road at sundown has high cirrus combed across its sky (the flat patch there 14% of the picture to none early on, 5% as the light goes) and dust hanging in the low
  sun. The avenue shows its speed while the road goes by (`S.scrollV`): the far kerb's lamps drawn out behind them, the wet road's
  lights streaking past, the kerb and its bollards smeared by a faint second copy a little behind. Near the burning carrier the
  checkpoint's `light(f)` takes the fire's orange and its place for the officers' rims and planes, the nearer the more. A man
  struck is lit from where the blow landed (`hitFrom`, sk_lightui.js: the nearest of the moment's flashes), never filled white, and a
  big blow's flash over him is softer. The station's crystals burn cyan with a white heart in their gold cages, their light cyan
  and the brass gold, on the platform and in the deep station. A weapon's trail thins toward its tip as it ages and fades faster
  than it thins (`drawTrail`), so the old part of a swing goes instead of piling into a smear. A rack of cloud goes over the roof,
  its underside warm with the city (one sprite each, six of them). The landing's hay has a straw tile (`strawTile`) over each
  slice, the face toward us darker and each crest catching the hut's light. The back room's lamp pools on the floor and the cot.
  The Pit's wall: each row of shacks its own height (a quarter more or less), lean, value and how much it has given way, with bands
  of smoke and haze across it at their own heights (`shackRows`); its floors and its skies carry `pitKit.mottle(c, x0, y0, x1, y1, k,
  o)`, a soft tile laid on with 'overlay' (made once from EnvTex's noise), and the skies over the rim haze streaks by day, morning
  and dusk; the yard's floor more grit and, by day and by morning, the sun's long shadows across it. The Shelf's and the stairs'
  rail posts are set by hand (their spacing two fifths either way). Judged and kept: Lamplight Street's lamps keep their beat
  (machine-made, and `faults.py` finds no repeat there now), the dream's open sky stays clean (the one clean sky in the game), and
  the far city on the ledge no longer repeats. Already holding from earlier versions: the sundown's verge, the field's maize, the
  avenue's fronts, the tunnel's ribs and lamps, the platform's push-in, the lab's grounds (the hill's pools of light are wider).
- The mixed places (since V90, asked for: the lookbook's 13 mixed views put right), each by what its note found:
  - The Pit by day (the yard, the stairs, the Shelf): `shackRows` lights its rows by the sun by day and by morning, from dice of each
    row's own (`rl`, so the rows keep their shacks): seven shack fronts in ten catch it, the walkways' lit edge and the roofs' edges
    brighter and wider, a cool slate shade under each walkway (`ways`), fading with the haze; the kit's mottle lighter by day (.16
    under the layer, .2 over it). The Lane stair's prow (env_stairs.js `spikePaint`): its beds stronger, a sunlit band along its top
    and four dark cracks down it. The morning: above, under the colour script.
  - The back room: three seams in the back wall stand open (`SEAMS`, `seamLight`), a bright line of the day through each, the planks
    either side catching it, a faint sheet of it down through the dust and a sliver of it across the floorboards.
  - Off the Roof (env_sumproof.js): the sign's amber over the eaves along the whole front and raking the near tin (two more pools of
    it; the gutter's lit edge wider), the near edge's dark eased, and rain lying in three dents of the near tin (`pool`): dark water,
    the sky's sheen along its far side, the Pit's lights and the sign's amber in it as short smeared streaks, its wet rim.
  - The night skies: `EnvLook.nightDeck(c, x0, x1, y0, y1, o)` lays a deck of cloud masses (five to nine lobes each), silvered on the
    side toward the moon (`o.mx`, `o.my`), dark in the body and warm underneath toward the city (`o.cx`, `o.cr`); every lobe stays
    under the layer's top (`o.top`, else RC.y0 + 14: an upright phone stretches the layer's top rows up into streaks). Over the lab's
    field, hill, wall and ledge, the story's field and the roof.
  - Warm by the fight: in the story's field the driver's truck (env_crops.js `TRUCK`) faces the fight from the clearing's far side,
    its headlamps' beams across the ground (two softSpills and a softCone); in the lab, the plank fence's lantern pools on the ground
    under it (env_props.js) and the wall's gate fire runs down the wet setts of the road toward us (a softSpill).
  - The roof: the far city in the band an upright phone sees between the horizon and the parapet, each avenue a straight line of
    lamps out to the vanishing point, closing up and dimming as it goes, cross streets crowding toward the horizon, and the city's
    glow rising into the haze over it.
  - The line (env_tunnel.js): the old station every 8400 (it was 12600; every nine seconds or so at speed); a signal halfway between
    each two lamps (`SIG`, red, one in three green, a streak at speed); two heavy cables over the spring on hooks in the rings; a
    second lantern on the far rail (`LANTERNS`) and each lantern's warm pool on the wall it passes; and the lamps' light thrown up
    the wall into the vault, leaning as the vault does (`UP`, `upLight`: color-dodge toward the crystals' cyan, and a cool wash). That
    light is made into the wall's picture at every lamp and into the vault's first course (`l0`), and a dead lamp's is taken out
    again live by its inverse laid on with multiply (worked out on the sooted brick's value): drawn live it cost 3 to 8 ms a frame
    on a phone, made in it costs nothing, about 2 ms while a dead lamp is in view. The look suite holds it (the wall at the spring
    over every lit lamp half again as bright as over any dead one) and the morning's warm side (the red over the blue of the
    picture's right third against its left: -.06 and -.06 at V89, about .01 and -.08 now).
- The fine marks (since V83, the remediation list's T rows). The thin lines were measured where they land (`uiwork/look/lines.js`,
  above): each lineWidth assignment the places draw, its typical width in world units through the layer, sprites and baked bitmaps.
  Those whose typical width was half a unit or more were brought to the drawing guide's width (1.5; 1 for a highlight on a lit edge:
  a light colour or 'lighter'), their numbers scaled by what each needed (three times at the most), and a second pass took the ones
  left a little under; single hairlines under half a unit were doubled. At V83 922 of the places' 1146 assignments meet it (76 more
  are faint, 76 are hairlines, 72 texture or a caller's width; the figure tier's 201 aside). Kept as they are: faint lines (alpha under .2, tone rather
  than marks), runs of fine texture drawn in a loop (spokes, grilles, grain, mortar, stitching), widths that come in as a variable
  from the caller, and the figure tier (its own pass in V84, below). The kit's gilt
  vine and wrought scroll never go under 1. No frame's light moved more than .006 for it. World text is Alegreya SC: the checkpoint's
  POLICE markings and its tape; its message board's letters are drawn lamp by lamp on the board's own grid, five by seven and 12
  units tall (`boardFace`: CHECK POINT, then STOP and arrows); the platform's plaque; NO ENTRY on the sealed door at 12, the station's
  direction boards at 12. Signs that are read are 12 units: the Shelf's stall names and THE FLOOR (a second line at 8), the
  stair-streets' way boards and stands (the price as well), FISH, CHOIRHOUSE, FREE MENDING (the Mendery's hanging sign moved clear),
  the WATER TOLL board and its price (the board lighter and its paint darker, to be read), the avenue's shop names (their fascias
  16 tall), the hotel's canopy, the square's name plate (flying left of its post) and the theatre's bill (THE GILDED HOUR). Bills,
  posters, chalked numbers and window lettering stay small, as texture.
  V84 (asked for) gave the fighters the same pass, held to their drawing budgets (the timing checks: him under 1.5 ms a frame and
  his suit cut to ribbons under .8 ms more, each crew member under 1.2, each weapon under .3), timed by turns against V83's build:
  the beasts and the guns by the same rules; Ilyas's head (the hair's light, the ear, the brow, the mouth), hands, boots and belt
  charge brought to the width or doubled, his trim and the lines of his jacket, sleeves and cuffs a quarter wider and the dagger's
  ink half again (the full width put him over budget); the tears' rims, the scar's tissue, the coat's ribbons' seams, the vine where
  the band crosses it and the sleeve's torn edge keep theirs (a torn piece of cloth is drawn in an offscreen layer with round joins,
  where a wider line costs most). The weapons (sk_armsui.js): a part's ink line keeps its .9 (doubled it cost .15 ms a weapon), the
  rim .83 (.55), a tube's light line .6 at the least, the others widened, the busiest half again. The figure kit's folds (sk_figui.js:
  every other fighter's creases) are half again as wide. A width given in pixels (`.9/k`, one pixel close up) keeps that form, both
  its numbers scaled. 74 of the fighters' 177 assignments meet the rule (19 before; Ilyas 11 of 42); the rest are wider but under
  it, hairlines doubled (the guns' engraving, the weapons' fine edges, the beasts' glints) and fine texture. The spells (fx_elven.js)
  are light, not marks, and stay.
- Time a painter on a phone's screen by drawing the same moment over and over with a part left out by turns (as the V72 dream was
  timed): one run against another on this machine differs by 2 ms or more.
- What a pass over the whole frame costs is its pixels times its blend, and in a CPU canvas it is dear: on a phone's 1.2 million
  pixels here (Oct 28) one picture laid over all of it costs about 4 to 5 ms whatever the blend, soft-light 8, overlay 5, a pattern
  scaled up 9 (unscaled 4), a gradient fill 3.5, a solid fill under 1. The V73 fall's first camera pass cost 35 ms there (two screens,
  a soft-light grade and a scaled overlay grain) and was cut to 6. Lay the bloom and the streaks over in one picture, darken in bands
  where the dark is, paint into the still pieces what does not move (the Pit's haze and window glow went into its tiles: 13 ms to 3.5),
  and cull what spans the world to what the screen shows. To time a part, leave it out with a switch for the while (taken out again
  after) and time it paired, each round against all of it just before, the median of the differences (single runs here wander by
  4 ms); `node uiwork/fall48/pagesab.js w h dpr <secs,...> <pageA> <pageB> [full|lite|off]` times two builds by turns.
- In headless Chromium the canvas is rastered on the CPU when it is drawn, so a profile puts most of a frame in `restore`/`drawImage`
  (FXL's `put`); time a painter's own work with performance.now() round it (as `JK.ms` does) rather than from that profile.
