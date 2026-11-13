#!/usr/bin/env python3
"""The layers test: the built game with the motion test (its drawn pose and its panel) and, after them, layers.js (the picture on
three sheets, shown by Phaser with focus and dust between them) and panel.js (its switches). Not part of the game's build.

    python3 build.py                        (the game, as always)
    python3 spike/layers/build_layers.py    spike/layers/out/layers-test.html, and out/index.html wrapped for publishing
"""
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
PARTS = (('spike', 'motion', 'motion.js'), ('spike', 'motion', 'panel.js'), ('spike', 'layers', 'layers.js'), ('spike', 'layers', 'panel.js'))


def main():
    args = sys.argv[1:]
    src = os.path.abspath(args[0]) if args else os.path.join(ROOT, 'ragdoll-skirmish-lab.html')
    page = open(src, encoding='utf-8').read()
    parts = [('/'.join(n), open(os.path.join(ROOT, *n), encoding='utf-8').read()) for n in PARTS]
    for name, s in parts:
        if '</script' in s:
            sys.exit(name + ' holds a closing script tag: it cannot go in the page as it is')
    title = '<title>Ragdoll Skirmish Lab</title>'
    if page.count(title) == 1:
        page = page.replace(title, '<title>Ilyas: layers test</title>')
    out = page + ''.join('<script>\n' + s + '\n</script>\n' for _, s in parts)
    os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
    p = os.path.join(HERE, 'out', 'layers-test.html')
    open(p, 'w', encoding='utf-8').write(out)
    print('built %s (%d KB)' % (os.path.relpath(p, ROOT), len(out.encode('utf-8')) // 1024))
    subprocess.check_call([sys.executable, os.path.join(ROOT, 'tools', 'wrap_page.py'), os.path.join(HERE, 'out', 'index.html'), p])


if __name__ == '__main__':
    main()
