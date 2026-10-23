## Combat systems map for the Act I fights and Short Hand

**Folder:** the repository's root. Every `file:line` below is in it (as of when this map was made: lines have moved since). The files that matter:
- `sk_core.js`, `sk_brawl.js`, `sk_team.js`, `sk_react.js`, `sk_reactui.js`, `sk_elf.js`, `sk_elfui.js`
- `sk_story.js`, `sk_storyui.js`, `sk_pit.js`, `sk_pit2.js`, `sk_pitui.js`, `sk_pit2ui.js`
- `sk_style.js`, `sk_room.js`, `sk_roomui.js`, `sk_hudui.js`, `sk_ui.js`
- `sk_env.js`, `sk_phase.js`, `sk_chain.js`, `sk_crew.js`, `sk_ctxmoves.js`, `sk_arms.js`, `sk_explore.js`, `sk_arc.js`
- Design: `uiwork/act1/doc.md` (scene 6 at 104-122, scene 7 at 124-140, scene 9 at 161-196, the styles table at 183-189, design notes at 198-214) and `uiwork/act1/PLAN.md`.

`sk_pit5.js` and `sk_pit5ui.js` (scene 5: satchel, rice, `riceWhere()` at `sk_pit5.js:66`) exist but are not in build.py FEAT. They were being edited while I worked, between 21:27 and 21:31.

**Existing wrap chains.** The last wrapper in load order runs first. A new module placed after pit2 wraps everything listed here.
- `actionCost`: elf:53
- `command`: guns:80, beast:299, elf:198, elf:443, room:186
- `cmdValid`: guns:44, story:258, beast:298, elf:196, room:182
- `aiChoice`: guns:204, beast:343, elf:429, room:278
- `slotAction`: guns:40, story:259, beast:297, react:87, room:183
- `launchAttack`: beast:357, react:58
- `resolveAttack`: pit2:34
- `computeMods`: elf:60
- `pickTechnique`: story:923, beast:228
- `applyImpact`: beast:233, elf:141
- Opening functions (`openingChoices`, `openValid`, `openCost`, `aiOpening`, `resolveOpening`): beast 310-321, elf 412-418 and 445, react 80-85
- `finishExchange`: story:394
- `footMaxOf`: pit:27
- `breakFighter`: chain:73
- `knockDown`: story:265
- Not wrapped by anyone: `startTurn`, `nextActor`, `isAI`, `resolveGrab`, `doGrab`.

---

### 1. Turn order and tempo

**State.** `S.game={phase,turnNo,active,ex,aiAt}` (core:221).
- Phases: `idle` → `intro` (weapons out: arc:78 and 84) → `input` ↔ `exchange` → `over`.
- The story adds `cut` (story:63) and the explore system adds `explore`. There are also `transit` and `finale`.

**Who acts next.** Each fighter has a `f.ready` clock.
- `nextActor()` and `actorAt` (core:1036-1038) pick the lowest `ready` among fighters that are not dead and not npc. Ties go to the higher skill, then the lower idx.
- `startTurn(i)` (core:2084-2105), in order:
  - runs `V11.turnStart`
  - subtracts the minimum `ready` from everyone
  - sets stations and facings, then `g.active=i` and `phase='input'`
  - clears the actor's `broken` and `react` and gives him +2 pips (2101)
  - runs `ensureIntents()`
  - sets `g.aiAt = isAI(i) ? S.t+.55 : null` (2104)
- The AI fires inside `simStep` (2346-2347). Team 1 uses `takeIntent(A)`, which is the plan shown in the intents panel (2030). Everyone else uses `aiChoice(i)`. If the command fails, it falls back to `getup`, then `wait`.
- The player goes through `humanCommand` (ui:643) → `slotAction` → `command`.
- `command(i,cmd)` (2131) only works in the `input` phase for `g.active` with no opening up. It adds `A.ready += actionCost(A,cmd,moveCost) + approachCost` (2135) and builds `ex`.
- `finishExchange` (2061-2076) clears `ex`, runs `pending`, runs `V11.exchangeEnd`, checks for over, runs `S.queued`, then does `turnNo++; startTurn(nextActor())`.

**What tempo is.** Tempo is the cost, in `ready` units, that an action adds to its actor's clock.
- `actionCost(f,cmd,extra)` (core:1034-1035) = `round((ACTIONS[cmd].cost+extra) × (attack or shove ? f.wp.tempo : 1) × lerp(1.25,.8,f.sk) × crowdFactor(f))`.
  - The elf wrapper (elf:53) then multiplies by .86 while `elfRate(f)>1`.
  - `crowdFactor` (1032) = `1 + .22 × max(0, ownSide − max(1, otherSide))`.
  - Weapon tempo (core:36-50): dagger .85, fists .8, club 1, chair leg .95.
- Openings cost half: `openCost` (1045).
- Each answer to a blow costs 5 tempo, 12 for Turn him (react:35).
- Flat penalties exist elsewhere: +15 for a broken guard, +25 or +12 for being shoved, +20 for a bind, and `REPLAN_COST` 15.
- Starting ready is half a slash (core:2390, story:344).

**What `drained()` does.** `drained(f)` (elf:17) makes `elfRate` 1. That removes:
- the .86 tempo multiplier
- `compressEx` (faster plans)
- the agile body
- the elven +1 DEF
- the longer steps
- the magic

Act I sets `K.drain=1` (pit:32).

**Numbers today.**

| Fighter | Slash | Other |
|---|---|---|
| Ilyas, skill 4, dagger | 78 | thrust 70, overhead 93, grab 59 |
| Trained collector, 2 against 1 (crowd 1.22), club | 139 | |
| Trained collector, dagger | 118 | |
| Novice collector, club | 153 | |

So each collector acts about 0.56 times per Ilyas action, and both together about 1.1 times.

**Cleanest lever.** Wrap `actionCost` in the new module, for example:

```
{const ac=actionCost;actionCost=function(f,c,x){const v=ac(f,c,x);return f&&f.tempoK?Math.round(v*f.tempoK):v;};}
```

Set `f.tempoK` in the stage's setup, either on the hero or on the foes.
- "Each collector acts twice per his one" needs a foe slash of about 39 (half of 78).
- "The two together act twice" needs a foe slash of about 78.
- Because every consumer goes through `actionCost`, this one wrap keeps all of them consistent: command costs, `openCost`, `turnOrder` (the HUD order chips, the "after your next move" intents, `threatOn`), the "Tempo per slash" line (ui:867) and the button text.
- Do not script `nextActor` alone, because the HUD's `turnOrder` would stop matching.

**Pitfalls.**
- `storyDuel` computes starting readies before `V11.duelStart` and `setup` run, while `K.drain` is still 0 (story:338 and 344). His first ready therefore uses elf tempo. Recompute it in setup if that matters.
- The 2-against-1 crowd penalty disappears in scene 7 once Tamm is on team 0.
- Ilyas's own answers add about 20 tempo per round.
- To keep a fighter out of the order, give him a huge `ready` or wrap `actorAt`.

### 2. Answers (reactions)

**Rules.**
- `REACT_DEF` (core:152): Slip, Step back and Turn him give a DEF bonus per attack kind.
- `REACT_NAME` (153) and `reactDef` (154).
- Parry is `D.guarding`. In `computeMods` the `gb` term is +4, or +2 against an overhead or a technique with `T.hook` or `T.beat`, or +1 against a sweep (1056).
- Counter is `D.counter`: +3 against an overhead, −1 against a thrust (1057). A blow that lands into a Counter does ×1.25 damage (1084-1085).
- Defence total = 10 + skill + gb + posture + daze + ctr + reaction + read (1062).

**`sk_react.js`.**
- `REACT` (14); `reactChoices(D,A)` returns parry, counter, slip, back, and turn when a partner is behind (25).
- `canReact` (27-29) requires: an `ATTACKS` kind; the defender not down, not in a clinch and not Broken; the `exchange` phase; no cut playing.
- `withReact` (31) and `applyReaction` (34-36) set `D.guarding`, `D.counter` and `D.react`, and add the tempo cost.
- `aiReact` (39-47) keeps a local pay table `{parry,counter,slip,back,turn}`.
- The `launchAttack` wrapper (58-66): an AI defender answers immediately. A player defender gets a window:
  - `ex.pendReact={A,D,kind,opening,popts}`, `ex.reactPending=true`, `ex.dur=99`
  - `tellPose` shows the windup
  - `S.opening={f:D,opp:A,ex,depth,kind:'react',source:'react',attack:kind,tech:T,dur,left,aiDelay:.35}`
- `resolveReact` (68-78): a timeout or invalid pick is replaced by `aiReact`. Then `applyReaction`, `launchAttack(...,{snap:true})` and `afterLaunch(ex)`.
- The opening wrappers are at 80-85.

**Effects in `applyImpact`.**
- Block (core:1599-1612): the attacker loses 2 pips when parried or countered, 1 otherwise.
- Dodge (1613-1617): the attacker loses 1 pip (2 for an overhead or into a Counter). Step back gives the defender +1 pip.
- `D.react` is cleared at 1618.
- Openings follow (1619-1637): a fresh Broken gives a `broken` opening; Turn him gives `turn` (1627); a block gives `parry`/`counter`/`block` (1632); a dodge gives `dodge`/`dodgeOver` (1633); a hit gives `hit`; a takedown gives `flow`; a landed hit can give `gang` (1637).
- `considerOpening` (1767) reads are free for fumble, parry, counter, broken and turn. Any other source rolls `readRoll` (1138).

**Pitfall: the technique is picked twice.** The window's `o.tech` is picked before the answer, and the real one is picked again after `applyReaction` (1882). For example, a thrust into a Parry can become Beat and thrust.

**Adding the Hinge in place of Parry.**
1. Wrap `reactChoices` to map `'parry'` to `'hinge'` when `D.style==='shorthand'`. It is used by aiReact:40, resolveReact:71, react:80-81 and the react UI.
2. Add `REACT_NAME.hinge`. This is mandatory: core:1061 calls `.toLowerCase()` on it and crashes without it. Add `REACT_DEF.hinge` for its DEF by kind.
3. Wrap `aiReact`. A new key gets NaN from the pay table and is never chosen as the best answer.
4. "Glancing on the shoulder": wrap `resolveAttack` (pattern at pit2:34). Lower `dmg`, set `tech.zone='arm'`, clear `tech.fin` and fix `kd`. The original already picked a finisher (1093) and set `kd` when `hp−dmg≤0` (1121).
5. "Ends inside his reach with +2": wrap `applyImpact`.
   - Read `D.react` before calling the original, because the original clears it.
   - Then move `D.station` closer. The floor on spacing is `need=max(70,52+(bulk)×9)` (core:443), and `resolveStations` (438) will push him back to it.
   - Set a flag that a `computeMods` wrapper turns into +2.
   - Optionally replace the opening by setting `ex.openAt/openFor/openSource/openKind` directly, as clinchFollow does (brawl:271-275), plus `OPEN_SETS`/`OPEN_KIND` and `OPEN_TITLE`/`OPEN_WHY` (ui:1092-1094).
6. The existing +2 "inside the reach" (core:1054) is weapon length only: `outreaches(D,A)` means `D.wp.len−A.wp.len≥20` (840).
   - Dagger (26) against club (44) is 18, so no bonus.
   - Dagger against sword (56) qualifies.
7. Animation: the defender's pose comes from `planReaction` (1423; it reads `D.react` at 1446). Replace it from an `afterLaunch` wrapper (elf:442) the way `elfEvade` does (elf:97-138), guarding against `ex._elf`.
8. UI:
   - `REACT_SUB` (reactui:11) needs an entry.
   - `reactText` (20-25) falls through to the Turn him text for unknown keys.
   - `reactBonus` (17) sums defence mods named `REACT_NAME[k].toLowerCase()`.
   - `REACT_TIP` (8) feeds the tip at ui:893.

**The Wrist toll against a Thrust.** `reactChoices(D,A)` gets no attack kind. Read it from `S.opening.attack` for the window, or from `S.game.ex.cmd` otherwise. `g.ex` is set before every `launchAttack` (core:2137, 1851). Apply the effects in the `applyImpact` wrapper: `knockBalance(A,2,D)`, damage, and optionally `tryDisarm` (brawl:496). If your pips Break him after the original's opening logic has run, call `considerOpening` yourself.

**The Wrist toll against a Grab.** Grabs never reach `launchAttack`: `command('grab')` (core:2151) → `resolveGrab` (brawl:241) → `planGrab` (242) → `doGrab` at Tc (256).
- When the defender is AI, as Tamm would be: wrap `resolveGrab` to force `ok=false, toll=true`. Wrap `doGrab` to replace its failure branch (263-267), which costs the grabber 3 pips (`FOOT_HIT`, not 2) and opens a `brace` opening.
- When the defender is the player: wrap `command('grab')` to hold the exchange and open a window with its own `source`. Do not use `'react'`, because `resolveReact` always calls `launchAttack(P.kind)`. Add wrappers on the five opening functions like react:80-85 or beast:310-334.

### 3. Strikes and techniques

**Choosing.** `ATTACKS` (core:89), `ACTIONS` accuracy, multiplier and cost (54-58). `pickTechnique(A,D,kind)` (923-1028) returns `T`, whose shape is at 927-928:

`{kind,key,name,why,tags,acc,dmg,along,ang(fn),amp,overlap,reach,anchor,kick,vault,around,rising,descend,windCap,passing,flair,multi,knock,kdEase}`

Optional flags: `move, cost, foot, recov, hook, beat, beard, murder, pinWall, backT, haftCut, lash/snare, hamstring, stop, fin, zone, dice, onHit, dirty, magic, into/through`.

The dagger's techniques today:
- Thrust: Gut stab, Back thrust, Pin to the wall, Passing lunge, Darting stab
- Slash: hooking cut, Spinning backhand
- Sweep: Reaping kick (`T.kick`), Hamstring
- Overhead: overhead blow, Leaping stab

Flourishes need Expert (skill 4) and pass `styleRoll` at ≤.55, or ≤.85 for a Master (285, 337).

**Resolving.** `launchAttack` (1878-1900) → `pickTechnique` → `resolveAttack` (1071-1128) → `beginAction` → `planAttack` (1239-1422).
- `computeMods` (1046-1063): skill, weapon, stance, height ±2, technique, opening +3, chain, pinned +2, footing, angle (thrust off line −4), from behind +2, arm wound, outclassed, dazed, held +2 (+3 from behind), shield −4, inside the reach +2 or jammed −2, shadow, feint.
- `outcomeOf` (1067): a natural 1 is a fumble; a crit is a 20, or a roll of 17+ that beats DEF by 12+; hit is total ≥ DEF; block is ≥ DEF−4; otherwise dodge.
- Damage (1088-1090): `(dice sum + base) × mult`, where mult includes `T.dmg`, ×.75 when off balance, ×1.25 into a Counter and ×.6 for a crew attacker (`CREW.dmg`, crew:11). A crit doubles it.
- The return shape is at 1127.

**Motion.**
- `anchorFor` (1150); `belly` is added by beast:336-339.
- `impactAngle` (1165), `windupBase` (1175; the thrust windup is hand back and low), `followBase` (1185).
- `T.rising` only shapes slashes.
- A thrust's crouch and lean are fixed at .76 and .24 (1255-1256). A low stance needs a `planAttack` wrapper that edits the returned body keys. Some keyframe `v` values are functions.

**Adding the Short ladder.** The cheapest route is a `pickTechnique` wrapper: when the style is Short Hand, the kind is thrust and the weapon is the dagger, set:
- `key 'shortladder'`, `anchor 'belly'`
- `ang: a=>a-.3`, `reach ~.7`, `along len*.6`
- `hook:true`, so a Parry adds only +2 ("under the guard")
- `move:true`, for the blue mark
- `dmg` scaled by how far inside he is

The answers, the HUD name, the hit %, the log and the AI all follow automatically. A separate command needs the beast:296-306 pattern plus a dock button like sk_roomui:38-47. Even then it must launch as kind `'thrust'`, or no answer window will open.

**How "inside reach" is measured.** There is no single spatial test. The pieces:
- `engageGap(A,D)=30+(bulkA+bulkD)×9+.55×(A.arm+A.wp.len)` (830) is A's striking distance: about 91 with a dagger, 101 with a club, 107 with a sword.
- `stopRange(D,A)` (843) is where D's point meets a man coming in.
- `techContext` (831) gives `gap=|A.station−D.station|`.
- The field line says "in reach" when the distance is ≤ engageGap+40 (ui:965).

`pickTechnique` sees the stations before the run-in, so "from inside" means he is already standing inside, for example `gap < engageGap(D,A)`.

### 4. Styles

**No style system exists.** There is no `sk_styleui.js` and no styles screen. "Origin" and "expertise" exist only in doc.md:183-189. PLAN.md:27 lists a styles DOM screen as planned.

**What `sk_style.js` is.** It is Kael's tactical animation profile only. Dice, tempo, footing and the AI never read it.
- `TACTICAL` (5-25); `f.tactical` defaults to `S.F[0]` (27).
- `tacOf` (29) feeds timing into planAttack (core:1248, 1284-1285).
- `tacGuard` (35) is called by `guardBody`/`guardArm` every step for every fighter (core:595, 597). `tacWind` (42) and `tacFollow` (49) shape the windup and follow-through.

**What does vary today.**
- The stance per weapon: `GUARD[weaponKey]` (core:178-191) with `hx/hy` hand position, `w/gw` weapon angles, `off` (the free hand, or null for a two-handed grip), `crouch`, `lean`, `sf/sb` foot spread.
- Dagger: `{hx:.5,hy:.3,w:-.55,gw:-.35,off:[.4,.12],crouch:.84,lean:.14,sf:.24,sb:-.3}`. Tactical tightens it to hx .42, hy .22, crouch .81, lean .17, sf .216, sb −.27.
- Techniques vary by weapon key, and rank gates them (`RANK` 282).

**Adding Short Hand.**
- A `STYLES` table plus `f.style`, set game-side in `V11.duelStart` from `S.story.flags`.
- Keep expertise separate from `f.skill`. `f.skill` drives to-hit, DEF, tempo, techniques, outclass and reads.
- Stance: wrap `tacGuard` to return the Short Hand overrides: lower crouch, more lean, small `hx/hy` (knife tight to the chest), narrow `sf/sb`.
- Feet never cross while front `stF>0` and back `stB<0` (core:653, 657-664).
- Short chopping steps: wrap `updateSteps` (647; already wrapped at elf:51, story:89 and :253) to shorten `dur` and clamp the step length.
- "Empty side turned toward the enemy" is drawing only. The look draws the remaining arm as the far arm and the stump or pinned sleeve on the near side (lookui:760-766). New fields have to pass through `snap` (lookui:1210).
- Do not reuse `F.phantom` for a held pose: pit2:179-180 zeroes it every step unless an action carries `phantom`.

### 5. Clinch and grab

**State.** `S.clinches`, with `c={a:holder, b:held, behind, t0}`.
- `makeClinch`, `endClinch`, `clinchPartner`, `heldBy` (brawl:195-205).
- The held fighter is kept at `clinchGap` from the holder (core:470).

**The grab.**
- `grabInfo` (brawl:226): gap ≤ engageGap+34 and depth difference ≤ 26. `behind` is `facingAway(D,A)`.
- `grabMods` and `resolveGrab` (235-241).
- On success: `clinchFollow` (271). A grab from behind with a partner in range gives that partner a free `gang` opening; otherwise the holder gets a `clinch` opening.
- On failure: the grabber loses 3 pips.

**Commands while clinched.**
- `cmdValid` (core:1983-1990).
- Slot mapping (brawl:568-569): slash→elbow, overhead→headbutt, thrust→knee, sweep→throw, shove→push or breakfree, guard→shield, advance→stab.
- `throwInfo` (333): a man held from behind can only throw over the shoulder.
- `breakMods` (421): −2 when held from behind. The popup reads "Twisted free" (434-435).
- The UI calls it "Twist free" when held from behind (ui:795).
- `OPEN_SETS.clinch` (1749) and `openValid` throw/push (1758-1759).
- AI: `aiClinch` (2231) and `aiOpening` (1803-1806).

**While held.**
- No answers (react:28).
- He can never be Broken (core:116 requires `!D.clinch`).
- Attackers get +3 when he is held from behind.
- `aiChoice` piles in on a held target (2263-2266).
- A blow on the holder frees him (`rescueFrom`, team:128).
- No stab in Act I, because `K.sidearm=null`.

**Locking throw and twist free with "Needs two hands".**
- Rules: wrap `cmdValid` to refuse `throw` and `breakfree`-while-behind when `A.oneArm`. Also wrap `openValid` for the clinch opening and `aiClinch`; otherwise the AI picks them, fails, and falls back to wait.
- UI: wrap `cmdInfo` (ui:767) so it returns `{tq:'Needs two hands',h:'',ok:false,ft:0}`. It must run first, because `cmdInfo` otherwise turns an invalid command into "Not possible" (769). The button stays listed because `slotAction` still returns the command.
- Opening panel: wrap `openingSub` and `openingHint` (ui:1096, 1109).
- The string has a precedent at explore:23.

**Scripting the gang-up.**
- Wrap `aiChoice` for the holder. It feeds the intents panel through `ensureIntents`, which recomputes a stale plan at turn starts, so it can be called more than once per action. Keep it idempotent and advance the script from a `command` wrapper.
- Wrap `resolveGrab` to force `ok:true, behind:true`.
- Wrap `aiClinch` to return `wait`.
- `gangPartner` (443) needs |gap−engageGap| ≤ 50 and depth difference ≤ 40.
- "Down, Broken" has to be scripted: `endClinch`, then `breakFighter`, then `knockDown`.

**One-arm visuals.** Several poses drive the missing back hand, which `f.oneArm` pins at the chest (pit:43-46):
- the grab reach and the holder's grip (brawl:251, 214-215)
- push and shove (core:1505-1508)
- hurl (room:210)
- the bottle throw (ctxmoves:122, 142)

### 6. Balance, Broken, knockdowns and the end of a fight

**Pips.** `FOOT_MAX` 6 (core:97).
- `footMaxOf` (110): crew 4, boss 8. Act I gives Ilyas 4 (pit:27). Story foes marked human become crew with 4 pips.
- Bands (103): ≥4 set, 2-3 committed, 0-1 off. With 4 pips he is set only when full.
- +2 pips at each of his own turns (2101).
- `BAL` (112): a hit takes 2, a heavy hit takes `hitFoot`=3 (134) minus outclass; parried or countered 2; blocked 1; dodged 1 (2 for an overhead).
- His own heavy moves cost pips through `footDelta` and `beginAction` (165-177).

**Outclass** (131-135): `max(0, D.skill−A.skill−1)`.
- Novice collectors against skill-4 Ilyas: −4 to hit, every hit takes 1 pip, and only a crit puts him down.
- Trained collectors: −2. Veteran: no gap.

**Broken.** `knockBalance` (114-116) calls `breakFighter` (119-122) when the other side takes his last pip.
- It sets `D.broken={by,t,paid:false}`.
- He has no answers.
- The other side gets one free move with no +3: `freshBreak` (118) → the `broken` opening set (1748), triggered from core:1623-1624, core:1717, brawl:266 and brawl:359.
- Disarm DC drops by 10 (brawl:493).
- It is cleared at his own turn (2101).
- Nothing counts breaks. Wrap `breakFighter` in game code. `S.hooks.broken` only exists in the page (reactui:59).

**Knockdowns.** `knockDown` (brawl:146) causes:
- the kd rules in resolveAttack (core:1116-1125)
- shoulder checks and crushing shoves (1700-1703)
- trips over bodies, the curb and props (brawl:53-73)
- throws
- room events

**The end.**
- `finishExchange` (2070): if he is dead or no foe stands, `phase='over'` and `S.hooks.over(won)`.
- `storyCatchOver` (story:391-395) wraps `finishExchange` and `endFight`. A win goes to `storyCleared()` (377). A loss sets `step='fallen'` and fires `S.hooks.story('fallen')`; storyui:59 shows the "fallen" card 1.2 s later (45-46), with Try again (`storyRetry`, 382).

**Scripted end ("Broken twice or under a third of his health").**
1. Count breaks in the `breakFighter` wrapper and check the third-of-health threshold. `maxHp` is 150 via pit:21-25; `hp` can carry over from `SV.hp` (story:340).
2. End from a `startTurn` wrapper: `if(S.act1.endNow&&S.story.step==='fight'){...;storyCleared();return;}`.
   - `startTurn` is the last thing `finishExchange` calls.
   - Calling `storyCleared` from a `V11.exchangeEnd` listener breaks: `startTurn` then resets `phase='input'` and `aiAt` (2098, 2104).
   - `S.queued` (2072-2074) can run one more attack first.
3. Prevent death and finishers: cap damage on Ilyas in a `resolveAttack` wrapper, clearing `tech.fin` and fixing `kd`, and add a guard in `kill`. Throws (brawl:386-407), shoves into things (core:1698-1699), room events and trips also do damage outside `resolveAttack`.
4. If the player kills both collectors, the existing code treats it as a win. Guard against that.
5. Store what scene 7 reads in `S.story.flags`. `flagsAt` snapshots it for retry (story:373). `S.act1` is reset only by `storyBegin` (pit:51) and is not restored by `storyRetry`, so reset per-stage counters in `setup`.

### 7. Room moves

**How they work.** `roomMoves(A)` (room:138-167) offers the best two moves, one per kind:
- hurl `{D,E,dir}`: D within 40 and depth 34, with one of his own 34-150 beyond him
- pane `{w}`
- flip `{on?}`
- lamp `{L}`

It must not write game state: the UI calls it every frame (use `roomSide` at 171).
- `roomPick` (173); `ROOM_COST` and `ROOM_FOOT` (135); `ACTIONS.room1/room2` and `NEEDS_FOOT` (136).
- `roomMods` (176): build and footing against the other's resistance.
- Wrappers at 182-193; `roomLaunch` (194) → `planHurl` (206), `planFlip` (234), `planLamp` (264). AI odds at 278-283.
- UI: names and text (roomui:8-26), `roomDock` hides the buttons and the tab (29-36), `HUD_GROUPS.room` and `HUD_TABS` (39), buttons built in a dock wrapper (40-47), guides (53-77).

**The yard.** `ACT1_PLACES.yard.barrels` and `crates` (pit:85) are layout only.
- The painter draws them (`envx/env_yard.js` 637-671, with its own copy of the layout at 285-286).
- There are no `S.props` in the yard.
- Crate 2 is Dob's seat, and its top counts as ground (pit2:111-112).
- To make them physical, call `addProp('barrel'|'crate',x,d,s)` (env:208; shapes at phase:180-197) in the stage's `setup`.
- That gives, without further work: drive targets (env:333-345), prop damage when a man is driven into one (core:1106, 1567, 1697), and trips over them (brawl:59, core:1588).
- Pitfall: the painter keeps drawing its own barrels and crates, so they would appear twice.

**Blind-side check.** The base is the shoulder check: the `shoveVariant` kind `'shoulder'` (core:911-916), available only against a man off balance, at −20 tempo. It floors him (1700-1703); the tucked pose is at 1509-1515. Wrap `shoveVariant` to return a cheaper `{kind:'shoulder',blind:true}` under the style's conditions. The name comes from `moveName` (ctxmoves:197-203) and the AI weight from `moveWeights` (177).

**Ankle hook.** Two routes:
- A new room-move kind, which needs entries in `roomMoves`, the cost tables, `roomMods`, `roomLaunch`, and the UI name, text and guide.
- A sweep technique for the style.

A trip into a prop uses `tripDown(D,{what:'prop',p},fa)` (brawl:63).

### 8. The command dock

**Structure.**
- `body.html:55-69` has `#cmdTabs`: strike, move, guard (shown as Tactics), room, aether.
- `CMD_ORDER` slot buttons `cmd-<slot>` with spans `n-`, `t-`, `h-`, `f-` (ui:634, 640-641).
- `HUD_GROUPS` and `HUD_TABS` (hudui:8-9). `hudBuildDock` (87-99) builds the sections, the aether one from `#magic`.
- CSS shows one group at a time on phones (hud.css:112-115).

**Techniques are not listed on their own.** Each slot's `t-` line shows this turn's `T.name` (`cmdInfo0`, ui:798-802).
- `updateCommands` (816-826) sets `disabled = !human || !ok` and toggles the mark classes from a literal list (821).

**The Aether tab.** It hides itself when the hero is drained: `updateMagic` (elfui:81-91) hides the box at line 82, and `hudAfterCommands` hides the tab when the box is hidden (hudui:70-71). The Act I flicker is a separate overlay (pitui:84-91).

**Precedents for a disabled button with a reason.**
- "No balance" and "Not possible" (ui:767-769)
- "Needs N Aether" (elfui:90)
- "Needs two hands" (explore:23)
- the gear screen's hatched "Missing" slot (pit2ui:15-21)
- `.cmd:disabled` styles (base.css:88-89)

**Dark or locked entries.**
- For an existing slot: wrap `cmdInfo` to return `ok:false` with the reason, and toggle your own class in an `updateCommands` wrapper, as `roomDock` does.
- For the arc-blade's techniques, which are not slots: add a new group or tab like Room's, with always-disabled buttons. Alternatively, keep `#magic` visible but dark by wrapping `updateMagic`.

**Where UI wraps go.** Feature UI files load before `sk_ui.js`. Its function declarations are hoisted, so top-level wraps work (reactui:27-32, roomui:19-28). But `S.hooks.opening`, `over` and `status`, which `sk_ui.js` assigns when it runs, must be wrapped inside `V11UI.init` (reactui:39-53).

### 9. Stages and a scripted ally

**Stage records** (`STAGES`, story:361) have these fields:
- `key, act, num, title, sub, arena, room, table, divs, next`
- `noFight, noWarm, cardDur, actCard, weapon, wear, wound, flagsOut`
- `foes`, `spawn` (`[[x,d]` for the hero, then `[x,d,side]` per foe)
- `setup, *intro, introSkip, *outro, outroSkip, explore`

A foe record is `{name, seed, weapon, skill, temper, hp, human, ward, arms, color, beast}`. `human` makes the foe crew: 4 pips and ×.6 damage. Example stages: vargo and dining (story:748-828), and the Act I stages (pit:143, 173, 223; pit2:62, 120).

**Flow.**
- `storyStage` (372) → `storyDuel` (329-350): ally off at 333, roster, `initFighter` for each, hp, readies at 344, `duelStart` at 345, `setup` at 348, `warm`.
- Then the intro cut, then `storyFight` (352).
- `storyRoster` (319-327) builds the hero plus the foes, all team 1.
- Collectors need `f.pitCast` before `initFighter` to get the cast's body (pit:68). Wrap `storyRoster`, or rebuild the body in `setup`.

**The lab ally (Mara Amri).** `S.cfg.ally` (core:220) → `rosterBuild` (2367) creates team 0 with `ally:true`. `isAI` makes her AI only under `S.allyAuto` (2031). The team logic is in `sk_team.js`. No story stage uses an ally.

**Tamm as a team-0 fighter, built in `setup`.**
1. `new Fighter(S.F.length,0,'Tamm',color)`, `pitCast='Tamm'`, then `S.F.push` and `S.trails.push([])`. Her idx must equal her position in `S.F`.
2. Call `initFighter(f,[x,d],sp)`. Do not convert an `act1Npc`: fields such as `ready` would be missing.
   - `initFighter` gives a team-0 non-ally the hero's weapon and 120 HP (core:2371, 2374), so afterwards call `setWeapon('dagger')` and set hp, skill, `oneArm=true` (hand in the apron) and `ready`.
   - For the look, wrap `S.hooks.arms` to return `'crew:boning'` ("Boning knife", arms:18).
3. Wrap `isAI` to return true for her. Otherwise the player controls her, because `cmdHero` hands the dock to any player-controlled team-0 fighter.
4. Script her through `aiChoice` (her idx), `aiReact` and `aiOpening`. Force outcomes with the `resolveForced` pattern (core:1859-1864) or wrappers on `resolveAttack`/`resolveGrab`.
5. Side effects of a team-0 fighter:
   - The crowd penalty goes away.
   - `partnerOf(K)` becomes her, which enables team moves. The Team and Cover buttons stay hidden without `f.ally` (ui:817, 819).
   - `resolveStations` spacing applies to her.
   - `retargetFoe` may choose her.
   - `rescueFrom` means her blow on the holder frees him.
   - She gets a plate and a weapons-out intro.
6. To keep Ilyas out: give him a huge `ready`. If he is down, foes finish him first (2260-2261).
7. End the fight with the same `startTurn` → `storyCleared` path.

### Cross-cutting pitfalls

**Determinism.**
- `S.rng` and `Math.random` are one stream in the checks. Any new cosmetic `Math.random` in game code shifts every later roll.
- UI code uses `uiRand` only.
- Openings are ticked by the page frame (ui:1292, with the sim at .08 speed) or by a harness calling `tickOpening(DT*3)`.

**Rule 1 (drawing never changes the game).** Style and flags live in game code. Anything the UI calls must be read-only, like `roomMoves`.

**Tests to update.** react, room, act1page, drawfree, hudpage, dom.

**To remember.** As of Oct 21 the game has no fighting-style system. Short Hand and the styles screen are design only (doc.md, PLAN.md V51/V52).