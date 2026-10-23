#!/usr/bin/env python3
"""The static check: seconds, before any test is run.

  python3 check.py              build, then check
  python3 check.py --no-build   check what is already built

What it checks:
  - the game's assembled script (sk_full.js) with ESLint: syntax, names used but never defined, a const assigned to, keys given twice,
    code after a return, and the like (tools/eslint.config.mjs). Messages name the source file and its own line (build_map.json).
  - the game's own rule that the drawing never rolls the game's dice: no Math.random in the UI files (the drawing has uiRand), save the
    bench's "new body" button, which picks a seed for the player.
  - each stylesheet's braces and comments are closed.
Exit status 0 when clean, 1 when not.
"""
import os, sys, json, subprocess, time, re, bisect

HERE = os.path.dirname(os.path.abspath(__file__))
def path(*p): return os.path.join(HERE, *p)

def where(starts, line):
    """A line of sk_full.js as (source file, its line there)."""
    lines = [s['line'] for s in starts]
    i = bisect.bisect_right(lines, line) - 1
    if i < 0: return ('sk_full.js', line)
    return (starts[i]['file'], line - starts[i]['line'] + 1)

def eslint(starts):
    # (installed at the root by `npm install`, or in tools/ as it was first set up)
    exe = next((e for e in (path('node_modules', 'eslint', 'bin', 'eslint.js'), path('tools', 'node_modules', 'eslint', 'bin', 'eslint.js')) if os.path.exists(e)), None)
    if not exe:
        return ['ESLint is not installed: run npm install in this folder']
    r = subprocess.run(['node', exe, '-c', path('tools', 'eslint.config.mjs'), '--no-config-lookup', '-f', 'json', 'sk_full.js'],
                       cwd=HERE, capture_output=True, text=True)
    try: res = json.loads(r.stdout or '[]')
    except Exception: return ['ESLint did not run: ' + (r.stderr or r.stdout)[:400]]
    out = []
    for f in res:
        for m in f.get('messages', []):
            if 'line' not in m: out.append('sk_full.js: ' + m.get('message', '')); continue
            src, ln = where(starts, m['line'])
            out.append('%s:%d:%d %s (%s)' % (src, ln, m.get('column', 0), m.get('message', ''), m.get('ruleId') or 'parse'))
    return out

def ui_dice(mods):
    out = []
    files = mods['ui'] + ['sk_scene_glue.js']
    for f in files:
        for i, l in enumerate(open(path(f), encoding='utf-8').read().split('\n'), 1):
            if 'Math.random' in l and 'cfg.seed=seed' not in l and not l.lstrip().startswith('//'):
                out.append('%s:%d Math.random in the UI: the drawing has its own dice (uiRand), the game\'s are Math.random' % (f, i))
    return out

def css_balance(mods):
    out = []
    for f in mods['css']:
        s = open(path(f), encoding='utf-8').read()
        if s.count('/*') != s.count('*/'): out.append('%s: a comment is left open' % f); continue
        body = re.sub(r'/\*.*?\*/', '', s, flags=re.S)
        body = re.sub(r'"[^"\n]*"|\'[^\'\n]*\'', '""', body)
        depth = 0
        for i, ch in enumerate(body):
            if ch == '{': depth += 1
            elif ch == '}':
                depth -= 1
                if depth < 0: out.append('%s: a } with no { (line %d)' % (f, body[:i].count('\n') + 1)); break
        if depth > 0: out.append('%s: %d { left open' % (f, depth))
    return out

def main():
    t0 = time.time()
    if '--no-build' not in sys.argv:
        r = subprocess.run([sys.executable, path('build.py')], cwd=HERE, capture_output=True, text=True)
        if r.returncode: print('build failed:\n' + r.stderr); return 1
    starts = json.load(open(path('build_map.json')))
    mods = json.load(open(path('build_modules.json')))
    probs = eslint(starts) + ui_dice(mods) + css_balance(mods)
    for p in probs: print(p)
    print('static check: %s (%d script files, %d stylesheets, %.1f s)' % ('clean' if not probs else '%d problem%s' % (len(probs), 's' if len(probs) > 1 else ''),
          len(mods['core']) + len(mods['ui']), len(mods['css']), time.time() - t0))
    return 1 if probs else 0

if __name__ == '__main__':
    sys.exit(main())
