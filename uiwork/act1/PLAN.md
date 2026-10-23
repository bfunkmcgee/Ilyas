# Act I, the Pit: beats 1 and 2 — working plan

Source: the user's doc "Ragdoll Skirmish: Veil Synopsis", tab "Act I, beats 1 and 2" (Claude Docs project
29dd5804-240f-4a3b-b025-14a1509912c0, body node 6fd45e04-effb; artifact https://claude.ai/artifact/6AqcLth1dg7x3BmeAt8uKu).
A copy of the tab's text is in uiwork/act1/doc.md. Nine scenes, six weeks: from the night of the fall to the first morning Ilyas
holds Tamm's door.

## Versions
- V48: the fall in line with the synopsis (thoughts, eye light, arm on the spike lit, the Sump). Published before Act I work.
- V49: Act I foundations + scenes 1-4 (cutscene off the roof and the kitchen; back room with look/interact and the Aether tab
  flicker; Tamm's crate and the gear screen; the yard tutorial: lurch, jog, the bucket in the hand slot, the gate, the ladder).
- V50: scene 5 (Pit map, stair-streets and the Shelf, shop, satchel inventory, Nim, beggars, the bare spike).
- V51: scenes 6-7 (the toll: the losing fight; Tamm's scripted fight with Short Hand moves).
- V52: scenes 8-9 (the yard at night; Short Hand lessons, bouts, styles screen).

## Status (Oct 22)
All four versions are published: V49 (scenes 1-4), V50 (scene 5), V51 (scenes 6-8 and the Short Hand style), V52 (scene 9: the
lessons, the bouts, the styles screen; the whetstone and the salve work; no flow while drained). The salve has no fight to heal
between until later beats (the toll is the only fight that hurts in beats 1 and 2).

## Decisions
- Act I continues the story: STAGES after 'fall' (fall.next -> first Act I stage). Stage records carry act:1.
- Ilyas in Act I (S.story.flags.pit): drained (K.drain=1: scars, no magic, a man's speed via drained()), balance 4 pips
  (footMaxOf), one arm, the hip dagger in his left hand.
- One arm: the rig's BACK arm (ELB/HAB) is the one gone in Act I (f.oneArm). The weapon stays in the front hand (HAF/TIP), so every
  weapon system works unchanged. The drawing puts the arm he has on his FAR side (it is his left: facing right, his right side is
  toward us) and the near shoulder shows what is left of the right one: the dressed stump, or the empty sleeve pinned up. Scene 1
  (minutes after the fall) keeps the fall's rig (front arm torn, the stump in view) for the wound.
- Exploration mode (new sk_explore.js / sk_exploreui.js): free walking on the 2.5D floor; tap a spot to walk, tap it again (or a
  second tap) to jog; tap a thing to go and use it; keys: arrows/WASD, Shift jog, E use. A man's jog only (no elf sprint).
  Hotspots, NPC talk, exits between areas, an objective line, the hand slot (what his one hand holds).
- UI screens (DOM, Noir Gilt): gear (equipment), satchel (inventory grid + weight), shop, Pit map, styles.
- Layouts are game-side records (like PIT in sk_story.js); painters (envx/) draw from them.

## Open
- Doc's open question (Sareth cut with the scrap arm) is beat 3+, not here.
