#!/usr/bin/env python3
"""The motion test: the built game with motion.js (the drawn pose) and panel.js (its switches and its walk) added after the game's
script. Not part of the game's build.

    python3 build.py                        (the game, as always)
    python3 spike/motion/build_motion.py    spike/motion/out/motion-test.html, and out/index.html wrapped for publishing
"""
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
PARTS = ('motion.js', 'panel.js')


def main():
    args = sys.argv[1:]
    src = os.path.abspath(args[0]) if args else os.path.join(ROOT, 'ragdoll-skirmish-lab.html')
    page = open(src, encoding='utf-8').read()
    parts = [(n, open(os.path.join(HERE, n), encoding='utf-8').read()) for n in PARTS if os.path.exists(os.path.join(HERE, n))]
    for name, s in parts:
        if '</script' in s:
            sys.exit(name + ' holds a closing script tag: it cannot go in the page as it is')
    title = '<title>Ragdoll Skirmish Lab</title>'
    if page.count(title) == 1:
        page = page.replace(title, '<title>Ilyas: motion test</title>')
    out = page + ''.join('<script>\n' + s + '\n</script>\n' for _, s in parts)
    os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
    p = os.path.join(HERE, 'out', 'motion-test.html')
    open(p, 'w', encoding='utf-8').write(out)
    print('built %s (%d KB)' % (os.path.relpath(p, ROOT), len(out.encode('utf-8')) // 1024))
    subprocess.check_call([sys.executable, os.path.join(ROOT, 'tools', 'wrap_page.py'), os.path.join(HERE, 'out', 'index.html'), p])


if __name__ == '__main__':
    main()
