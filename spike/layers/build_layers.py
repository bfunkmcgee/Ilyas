#!/usr/bin/env python3
"""The layers test's page: the published page (which since V118 holds the drawn movement, motion.js, and the layers, layers.js)
with the two tests' panels after it: every switch of the motion test and of the layers, the hour, and what a frame costs. Not part
of the game's build.

    python3 build.py                        (the game, as always)
    python3 spike/layers/build_layers.py    spike/layers/out/layers-test.html, and out/index.html wrapped for publishing
"""
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
# (since V118 motion.js and layers.js are in the published page itself, and the yard's painter is open in its own source: this page
# adds the two tests' panels, with every switch and the hour)
PARTS = (('spike', 'motion', 'panel.js'), ('spike', 'layers', 'panel.js'))



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
