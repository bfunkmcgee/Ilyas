# Ilyas

Ragdoll Skirmish Lab: a turn-based melee RPG that runs in one HTML page. The fighters are procedural 2D ragdolls on a 2.5D floor.
Dice decide each exchange and the ragdolls act the result out, so no attack animation is drawn by hand. The hero, Ilyas, is an elven
enforcer with an arc-blade. The page opens on the story: the prologue in the city, then Act I in the Pit, where he learns to fight
again with one arm. The skirmish lab (an arena, enemies, an ally, a fight) is the menu's other half.

## Play it

```
python3 build.py
```

Then open `ragdoll-skirmish-lab.html` in a browser. It is one self-contained file and needs no server.

## What you need

- Python 3.10 or newer, for the build and the test runner
- Node 20 or newer, for the checks
- `npm install`, once: ESLint for the static check, Playwright for the page suites
- `npx playwright install chromium`, once: the browser the page suites drive (or set `SK_CHROMIUM` to a Chromium of your own)

## Build and test

| Command | What it does | Time |
|---|---|---|
| `python3 build.py` | builds the page and the files the checks load | 1 s |
| `python3 check.py` | builds, then the static check: ESLint over the assembled script and the project's own rules | 10 s |
| `python3 test.py` | the quick tier: the static check and the game-logic suites | 2 min |
| `python3 test.py full` | every suite, the page suites in a headless browser, then the timing checks | 13 min |
| `python3 test.py --list` | the suites and what each one covers | |

Each suite's output goes to `test_out/`. GitHub runs the quick tier on every push.

## How it is put together

`GUIDE.md` is the working guide: which files are live, how the modules load, the rules that keep the game and its checks working,
and notes on every system. Read it before changing anything. In short:

- `build.py` lists every module in load order, and joins them into one classic script inside one page.
- `sk_*.js` are the modules: the game's rules (no DOM, so the logic suites run them in Node) and each feature's UI part (`sk_*ui.js`).
- `sk_css_*.css`, `sk_head.txt` and `sk_body.html` make the page around the script.
- `envx/` holds the scene painters that draw every place in the game; the build bundles them.
- `sk_*test.js` and `sk_*_page.js` are the suites, and `test.py` runs them.
- `uiwork/` and `probes/` hold the screenshot and trace tools the guide names.

## Versions

Each published version is a commit tagged `vNN`. This repository starts at `v63`; the guide's notes say what changed in each version.
