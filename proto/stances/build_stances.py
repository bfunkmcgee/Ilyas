#!/usr/bin/env python3
"""The stance and rise test page: the game's own modules in the game's order, with the test's rules (sk_downfork.js, sk_stances.js,
sk_spells.js, and the stances' motion, sk_stnmotion.js) after the game's parts, its UI (sk_stancesui.js, sk_spellsui.js) after the features' UI parts and its stylesheet after theirs. The game's own build and
files are not touched.

  python3 proto/stances/build_stances.py         stances-test.html (the page to publish), stances_full.js (its script alone) and
                                                 stances_test_page.html (the same page with the charset and SK_TEST, for the checks)
  python3 proto/stances/build_stances.py --lint  the same, then ESLint over stances_full.js with the game's own rules
"""
import os, sys, json, subprocess, bisect, re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, ROOT)
import build as B  # noqa: E402

REL = os.path.relpath(HERE, ROOT)
_core, _ui, _css = B.core_files, B.ui_files, B.css_files
B.core_files = lambda: _core() + [os.path.join(REL, 'sk_downfork.js'), os.path.join(REL, 'sk_stances.js'), os.path.join(REL, 'sk_spells.js'), os.path.join(REL, 'sk_stnmotion.js')]
B.ui_files = lambda: (lambda u: u[:-1] + [os.path.join(REL, 'sk_stancesui.js'), os.path.join(REL, 'sk_spellsui.js')] + u[-1:])(_ui())
B.css_files = lambda: _css() + [os.path.join(REL, 'sk_css_stances.css')]

TITLE = 'Stance and Rise Test'

def lint(starts):
    exe = next((e for e in (os.path.join(ROOT, 'node_modules', 'eslint', 'bin', 'eslint.js'), os.path.join(ROOT, 'tools', 'node_modules', 'eslint', 'bin', 'eslint.js')) if os.path.exists(e)), None)
    if not exe: return ['ESLint is not installed: run npm install in the repository']
    r = subprocess.run(['node', exe, '-c', os.path.join(ROOT, 'tools', 'eslint.config.mjs'), '--no-config-lookup', '-f', 'json', os.path.join(HERE, 'stances_full.js')],
                       cwd=ROOT, capture_output=True, text=True)
    try: res = json.loads(r.stdout or '[]')
    except Exception: return ['ESLint did not run: ' + (r.stderr or r.stdout)[:400]]
    lines = [s['line'] for s in starts]; out = []
    for f in res:
        for m in f.get('messages', []):
            ln = m.get('line', 0); i = bisect.bisect_right(lines, ln) - 1
            src, at = (starts[i]['file'], ln - starts[i]['line'] + 1) if i >= 0 else ('stances_full.js', ln)
            out.append('%s:%d:%d %s (%s)' % (src, at, m.get('column', 0), m.get('message', ''), m.get('ruleId') or 'parse'))
    return out

def main():
    B.build_scenes()
    js, html, starts = B.assemble()
    html = re.sub(r'<title>.*?</title>', '<title>%s</title>' % TITLE, html, count=1, flags=re.S)
    outs = {'stances-test.html': html, 'stances_full.js': js,
            'stances_test_page.html': '<meta charset="utf-8">\n<script>window.SK_TEST=1</script>\n' + html}
    for n, s in outs.items():
        open(os.path.join(HERE, n), 'w', encoding='utf-8').write(s)
    print('built ' + ', '.join('%s (%d KB)' % (n, len(s.encode('utf-8')) // 1024) for n, s in outs.items()))
    if '--lint' in sys.argv[1:]:
        probs = lint(starts)
        for p in probs: print(p)
        print('lint: %d problem%s' % (len(probs), '' if len(probs) == 1 else 's'))
        sys.exit(1 if probs else 0)

if __name__ == '__main__':
    main()
