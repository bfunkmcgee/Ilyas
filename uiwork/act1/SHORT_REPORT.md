Short Hand is built: the rules, AI, answer windows and UI, all in new files. My suite passes 56/56 and nothing changes for fighters without the style: all 8 logic suites give byte-identical output with and without the module. Nothing published.

**Files** (all at the repository's root)
- `sk_short.js`: the game rules, no DOM. Every number is in one `SHORT_HAND` table.
- `sk_shortui.js`: the UI.
- `sk_short_test.js`: the logic suite.
- No CSS file: the grab window reuses the answer window's `.opening.react` style.
- My scratch files are in `uiwork/short/`: the page check `short_page.js`, still strips `hinge_strip.js`, a load-order check `order_check.js`, a `seedrand.js` preload, suite outputs in `reg/`, stills in `shots/`, and a page built with the module, `short_test.html`.

**API: all your names, nothing renamed**
- `shortOn(f)` is `f.style==='shorthand'`, dagger in hand, not mounted, not down, not dead. It does not check `styleMoves.stance`.
- `STYLES` has your exact values. I added `SHORT_MOVES` (lesson, name, one-line text) for your styles screen.
- Shove variant is `{kind:'blindcheck', floor, cost}`.
- `shortRelease(A)` returns true if it released a hold. While held, `A._threat={D,ex}` and `D.frozen=true`.
- `S.hooks.short` gets `{A,D,kind,res}`. A is whoever made the blow, grab or shove: the attacker for 'hinge' and 'toll', the Short Hand fighter for 'ladder', 'check' and 'hook'. 'toll' also gets `ok` and `dmg`. The threat fires 'ladder' with `res.threat=true`.
- `aiToll` and `shortAiReact` are both wrappable. Extra helpers: `canToll`, `shortInside`, `shortInsideFlag`, `shortNeed`, `shortHookProp`, `shortAny`.

**Rules as settled.** Where I read your spec one way, that's marked (my reading).
- **Stance:**
  - Guard: crouch .74, lean .24, hx .26, hy .30, blade −.85. Committed no longer pushes the hand out. A one-armed fighter's back hand is left alone.
  - Steps: 0.8× duration, no longer than half a leg, feet kept at least .12 leg apart and never crossed.
  - Shoves and sweeps at him are at −2, and a shove takes one pip less.
- **Hinge:**
  - DEF +2 slash, +2 overhead, +1 thrust, −1 sweep. Usual 5 tempo.
  - A hit lands glancing at ×.45 of the pre-crit damage. No crit double, no finisher, no knockdown unless the blow is lethal, nothing driven into furniture, wound on the arm, at most 1 pip.
  - He steps to the minimum station spacing + 2, and the attacker's settle keeps him there.
  - (My reading) The attacker's 1 pip comes on top of the engine's own miss/block cost, so a hinged miss costs him 2. It's applied first so a Break still gets its free move.
  - (My reading) "No riposte" only blocks the hinger's openings. The attacker's press and gang-ups stay as the engine has them.
- **Inside:**
  - (My reading) The +2 does not stack with the engine's existing +2 for a dagger inside a sword or spear.
  - It's used by his next attack on that man, and kept while that attack waits on the man's answer window.
  - Any other action of his clears it (a command, or an opening other than Hold). Answers don't count as actions.
  - It also lapses if the man gets more than his striking distance + 12 away.
- **Wrist toll vs a Thrust:**
  - +2 DEF, offered only against thrusts.
  - On a miss or block: a cut of 1d4+2 (×0.6 if the cutter is crew, never lethal), an arm wound, and −2 pips. (My reading) The 2 pips come on top of the miss's own 1.
  - On a hit: normal damage.
- **Wrist toll vs a Grab:**
  - The AI decides by read: .3 + .14×his skill − .05×grabber's skill, −.15 if dazed, −.15 if off balance, kept between .1 and .92.
  - The grab fails, the hand is cut, and the grabber loses exactly 2 pips.
  - It can't be used against a grab from behind.
  - For the player, the window (source 'toll') offers Wrist toll for 5 tempo or Let it come for 0.
- **Short ladder:**
  - +1 to hit, aimed at the belly, rising line, reach .7, a Parry adds only +2.
  - It doesn't replace the back thrust, pin to the wall or haft cut.
  - ×1.35 from inside: the Hinge flag, or standing closer than both men's striking distances − 8. (My reading) Using the target's striking distance alone would make a dagger "inside" any longer weapon at normal range.
  - Threat: it can't be answered, lands for 0, and the exchange holds until `shortRelease`. The target loses every pip (Broken, free move marked used) and freezes. No openings at all.
- **Blind-side check:**
  - Costs −30 off a shove's tempo (the Shoulder check is −20): 27 against 34 for Ilyas. Range is his striking distance + 40.
  - Off balance, it floors him as the Shoulder check does. Committed, or Set with Ilyas inside: −2 pips, back 24 units, +12 tempo.
- **Ankle hook:** kdEase 1, a Parry is worth 0 against it, and a barrel or crate within 40 behind his heels means any hit trips him over it (`tripDown`).
- **AI:** pay table adds hinge 1.0 and toll 1.2.
  - Inside: thrust weight +6, slash ×.5.
  - Hook: sweep +4 with a prop behind him, +1.5 against a Committed man.
  - Check: shove weight 5 (floor) or 2.5 (drive) when the shove has at least a 45% chance.

**Implementation notes**
- The Hinge and toll poses come from a `planReaction` wrapper rather than an `elfEvade`-style replacement afterwards. The plan is built with them, so there's nothing to apply twice.
- A scene wrapper that forces an `aiReact` answer is honoured in either load order. I checked this with a wrapper loaded ahead of mine (4/4 kept).
- A grab on a player who knows the toll is held without running the command. On his answer the real command runs once, through every command wrapper loaded before mine.
- Your `applyImpact`, `doShove` or `doGrab` wrappers won't see three things: the threat's impact, the check's step-back, or the toll on a grab. Use `S.hooks.short` for those.
- Move-name popups are game-side, like the engine's.

**Tests, 56/56 with `SK_EXTRA=short`** (without it the suite prints one FAIL saying it isn't loaded):
- **Stance:** guard values; body pose; Committed hand; plain fighters untouched; one-armed back hand; steps (37 vs 136 units long, 0.114 vs 0.144 s, no crossing); −2 on shoves and sweeps; one pip less to a shove.
- **Hinge:** only when learned; in the Parry's place; +2 and 5 tempo; forced crit lands glancing; pip cap and the attacker's pip; ends inside; no riposte; a miss costs him nothing.
- **Inside:** +2 once, then cleared; cleared by a Hold; no double +2 against a sword.
- **Toll:** not against a slash; offered against a thrust; +2; cut on a miss; normal damage on a hit; AI against a grab, with no window and exactly 2 pips; not before learned; the player's window with both choices; time-out uses his own read.
- **Short ladder:** only when learned; its line; a Parry adds +2; ×1.35 inside; real damage multiplier; the threat (lands for 0, holds at the chin, Broken and frozen, no openings, released).
- **Check:** when it's available; cost and name; drive on a Committed man; floor on an off-balance man.
- **Hook:** only when learned; kdEase and Parry value; trip over a crate.
- **AI:** each of the six choices.
- **Whole fights:** six whole fights (2- and 3-foe, props, style on either side) run to the end and use every move.
- **Determinism:** the same seed gives the same 28-exchange fight twice.

**No regressions**
- Your six suites, plus env and v12finale, give byte-identical output with and without the module.
- `sk_brawltest.js` differs between two plain runs even without my module, because it never seeds `Math.random`. With it seeded by a preload, it is identical too.
- HUD page suite: 61/61 on both a plain build and a `short` build, identical output.
- Playwright page check: no errors. The windows, the dock names (Short ladder / Ankle hook / Blind-side check) and the log lines all read correctly, and the threat holds then releases. Stills are in `uiwork/short/shots/`.

**When you add it to the build**
- **build.py:** append `'short'` to FEAT after `'pit2'`. It only has to come after `'react'` and `'ctxmoves'` (the code reads `REACT_GOOD` at load, and the UI wraps functions from sk_reactui and sk_ctxmovesui). Order relative to pit and pit2 doesn't matter. No CSS entry.
- **test.py:** add `'short': (['node','sk_short_test.js'],'logic',…)`, add `short` to the GAME pattern, and put `shortui` in the covers alongside reactui.
- **Fighters:** set `f.style` and `f.styleMoves` yourself; nothing resets them.
- **Scenes:** the Hinge and toll follow the engine's answer rules, so there are no answers while `S.cut` is set or outside the exchange phase. That matters for Tamm in scene 7.