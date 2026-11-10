#!/usr/bin/env python3
"""The Phaser host test: the built game with Phaser and host.js added after its script. Not part of the game's build.

    python3 build.py                        (the game, as always)
    (cd spike/phaser && npm install)        (once: Phaser)
    python3 spike/phaser/build_spike.py     spike/phaser/out/phaser-spike.html, and out/index.html wrapped for publishing

Open the page with ?host=0, 1 or 2 to start in Direct, Phaser or Phaser + effects (1 when not given).
"""
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))


def main():
    page = open(os.path.join(ROOT, 'ragdoll-skirmish-lab.html'), encoding='utf-8').read()
    phaser = open(os.path.join(HERE, 'node_modules', 'phaser', 'dist', 'phaser.min.js'), encoding='utf-8').read()
    # (the painted figure's arc-blade painter is let out of its module, so the skinned figure can hold the same blade)
    seam = 'return{draw,snap,cfg,ok,rng,LOOKS,'
    if page.count(seam) != 1:
        sys.exit('the look module no longer ends the way this test expects: see build_spike.py')
    page = page.replace(seam, 'return{blade,draw,snap,cfg,ok,rng,LOOKS,')
    parts = [('phaser.min.js', phaser)] + [(n, open(os.path.join(HERE, n), encoding='utf-8').read()) for n in ('skin_ilyas.js', 'skin.js', 'host.js')]
    for name, s in parts:
        if '</script' in s:
            sys.exit(name + ' holds a closing script tag: it cannot go in the page as it is')
    out = page + ''.join('<script>\n' + s + '\n</script>\n' for _, s in parts)
    os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
    p = os.path.join(HERE, 'out', 'phaser-spike.html')
    open(p, 'w', encoding='utf-8').write(out)
    print('built %s (%d KB)' % (os.path.relpath(p, ROOT), len(out.encode('utf-8')) // 1024))
    subprocess.check_call([sys.executable, os.path.join(ROOT, 'tools', 'wrap_page.py'), os.path.join(HERE, 'out', 'index.html'), p])


if __name__ == '__main__':
    main()
