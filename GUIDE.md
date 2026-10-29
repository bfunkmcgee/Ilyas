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
| `python3 test.py --status` | whether the sources are the ones the last full run passed with | instant |

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
(CSS px); the camera frames the fighters inside the rest. Fighters: `f.p[PEL|CHE|HEAD|ELF|HAF|ELB|HAB|KNF|FTF|KNB|FTB|TIP]`,
`f.station` (x), `f.lane`/`f.dep` (depth), `f.facing` +1/-1, `f.action={t0,end,body:[keys],arm:[keys]}` drives the motors.

**Modules worth knowing.**
- sk_story.js / sk_storyui.js: STAGES (sundown field chase roadblock vargo dining kitchen platform line deep lobby office roof fall). A
  scene is a generator the sim runs a step at a time (`S.cut`), so scenes are as repeatable as fights. `S.story` null means the lab.
  The hero is one Fighter for the whole run (`S.story.K`): what a stage leaves on him (a bike under him, `rideLean`, `offstage`) goes
  on into the next stage unless that stage or the one before clears it.
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
  `act1Spare`), and anyone else loses the free rise (`f.noRise`, the 'No free rise' popup, `S.hooks.downStruck`) and gets up as
  before. The page labels a man on the floor (`intentLabel`: Rises free, Must get up) and the tip line says what it means.
- The stances (sk_stances.js, sk_stancesui.js, sk_css_stances.css): while Ilyas fights with the arc-blade and is not drained
  (`stanceOn`) he holds one of three (`f.stance`, STANCES): Bound (the blade locked: the crescents and the two-man strokes, a short
  blade kept at the point), Unbound (a bladed whip: every blow a lash from where he stands, the tip's crack from `STN.tip` past his
  striking distance and the chain's body inside it, the Ankle wrap, a stop-lash on a man who closes, relocked blows inside his reach
  at -2, Parry -1 and Counter -2) and Close (the blade choked: the hilt-ring, the spine, the inside hook, the grab +2, an axe swung in
  reach jammed on its haft, -1 to everyone else while tied up inside one man). He changes it free on his own turn before he acts
  (`setStance`; the stance bar over the dock, keys Z, X and C). `STN_ANS` is what each stance does to a man's blow (Bound beats a
  thrust aside +3 and takes a cut on the blade +2, Close gets inside an overhead +3 or a cut +2 from a man in reach, Unbound catches
  the raised arm of a man coming in with an overhead +3), and an answered blow that misses costs the man a pip more (`STN_MISS`);
  `stnRange` is the range of Ilyas's own blows in each. The bar marks the stance that answers his target best (`stanceMatch`, scored
  by `stanceFactors`: the man's weapon and its habits `STN_HABIT`, the range, the blow each man shows, the crowd) with its reason,
  and Ilyas on auto takes it (`STANCE.policy`); a blow a man shows is the blow he throws (the ensureIntents wrapper). Unbound's chain
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
off and counts what they do (its usage lines list the options). The logic suites that look at a man after a move read him where the
move's exchange ends (`wasDown`): their runs play on into his free rise.

**The room (sk_room.js, since V42).** Events: in V11.step, any body knocked flying (`roomFlying`: dead or motor < .62, not the man
making the move) that meets a standing man's HEAD-PEL capsule at a closing speed over ROOMEV.hit is an impact of speed x weight ratio:
over ROOMEV.down (a boss more) he goes down, under it he is knocked back two pips. `onDivHit`, `lampHit` and `onTableContact` are
wrapped: a flying body over ROOMEV.burst[mat] bursts a pane, over lampFall brings a lamp down, over tableBreak from above breaks the
table, over tableTip into its side spins it about its far feet (`roomSpin`). Each is a `roomEvent` (slow motion .6 s, a big callout
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
edge (nearTile). Over the finished frame (`post`, run by sk_storyui.js before the thoughts and the bars): the light blooms and runs
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
  than DEP_MAX (170): Dob perches on the yard's crate, not its wall. A scene can look up: `S.camCut.band` {top, foot} keeps that much of the picture between the letterbox's bars, centred (sk_pitui.js), and `S.camCut.wn` sets the view's width on a narrow screen (the kitchen's window shot; since V53). Where the ground climbs (an arena with `climb(x)`, how far it has come up without the steps: the stair-streets), a walk about or a cut with no band frames the floor's band (BAND0) raised that far where the camera looks, so the picture goes up the stair with him (since V71; a phone on its side lost his head over the top landing).
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
- Timing belongs in sk_perf_page.js only (it draws every frame and runs alone at the end of a full run).
- A new suite: add it to SUITES in test.py (command, kind, what it covers), to ORDER (longest first), and to COVERS for the source
  files it covers. A suite fails on a nonzero exit, a line starting `FAIL`, or a closing `errors N` / `problems [...]` that is not empty.
- `SK_TIMING=1 node sk_look_page.js` prints the seconds at each check. `python3 tools/cmp/run_pages.py 1|default <outdir>` runs
  the page suites drawing every frame or as set, timed, to compare the two.
- Node logic checks: `const core=require('./sk_src.js')(); eval(core+'...')` (see sk_v12test.js: FORCE dice, expect(), act()).
- If drawfree reports a difference, some drawing code changes the game. `node probes/lockstep.js` steps a drawn and an undrawn page
  side by side and names the first field where they part; `node probes/render_writes.js` lists what a call of render() changes
  (known drawing caches: `_turn`, `S._rf`, popup layout `nx`/`ny`/`w`, `S.breach.fl0`, `S.finale.smear.a`; a popup that would rise
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

## Publishing
Run `python3 test.py full` first, and `python3 test.py --status` just before publishing (it names any file changed since).
Publish ragdoll-skirmish-lab.html with the Artifact tool to the same url (https://claude.ai/artifact/61wMNijJeCxJvsa3vWMbxJ) with a
short label "V74 ..." (V73 was the last published; count on from it). The song and the recorded sounds are published beside the page
as the artifact's files: `files: {"music/lepers_ascent.mp3": "music/lepers_ascent.mp3", "sfx/swing_mid.mp3": "sfx/swing_mid.mp3",
...}`, every file in sfx/ under its own path (153; one publish takes up to 255 files). An update keeps the files it does not name,
so pass them only when they change or when publishing to a new url (V68 sent the song, V69 the sounds). (At V56 the perf check "each elf or crew member under 1.2 ms" ran 1.13 to 1.39 ms here, the V55 look file the same or slower: this machine, not the code. At V71 it ran 1.14 to 1.27 ms, and V70's code 1.09 to 1.25 ms in the same hour, run by turns; at V72, 1.28 at the end of the full run.) Never delete the duplicate artifact
https://claude.ai/artifact/GFgjvMLi5jWg7TAKFgkqqm.
Then the version goes into the repository: commit the changed sources (`git add -A`; the message "V73: ..." and a line or two of what
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
- A scene's still layer (sceneLayer) covers RC (y -90 to H+110); above it `sceneDraw` only stretches the layer's top row up, so a
  phone held upright, which sees far above it, shows bare stripes there unless the scene's live() draws that part. The fall's live
  picture runs from the camera's top to its foot, -110 to H+120 at the least (since V72, `EnvLook.S.fall.span`; before, the floors
  stopped at -110 and an upright phone showed a band of bare piers over them, and the night's top row of stars stretched into lines).
  Anything drawn in pieces there clips to that range (`junkWalls` does), or it pokes out above the far side's top edge.
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
