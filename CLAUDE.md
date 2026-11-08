# Working on this repository

This is Ragdoll Skirmish Lab, the game whose hero is Ilyas. Read `GUIDE.md` first: it is the working guide, and its rules apply to
every change.

- Build with `python3 build.py`. Run `python3 check.py` after every edit. Before publishing: `python3 test.py github` (it pushes the
  working tree as a candidate, and GitHub runs the suites on it), then `python3 test.py look` (the look review, alone) and
  `python3 test.py full` (it takes GitHub's passes, runs here what they do not cover and the timing checks alone), then
  `python3 test.py --status`. `python3 test.py places` checks a version's new places while it is built.
- Never edit the built files (`ragdoll-skirmish-lab.html`, `sk_full.js`, `sk_sceneui.js`, `test_page.html`, `build_*.json`). They are
  made by the build and are not tracked.
- Publishing and versions: `GUIDE.md`, "Publishing". Once a version is published, commit it with a message that starts with its
  number ("V64: ...") and push it to main.
