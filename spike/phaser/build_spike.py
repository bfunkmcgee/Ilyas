#!/usr/bin/env python3
"""The Phaser host test: the built game with Phaser and host.js added after its script. Not part of the game's build.

    python3 build.py                        (the game, as always)
    (cd spike/phaser && npm install)        (once: Phaser)
    python3 spike/phaser/build_spike.py     spike/phaser/out/phaser-spike.html, and out/index.html wrapped for publishing

Over another page (the flow test's, on the branch claude/flow-test, where the switches go into its Test panel):

    python3 tools/flow_test.py flow-test.html
    python3 spike/phaser/build_spike.py flow-test.html flow-phaser     out/flow-phaser.html and out/flow-phaser-index.html

Open the page with ?host=0, 1 or 2 to start in Direct, Phaser or Phaser + effects (1 when not given).
"""
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))


def main():
    args = sys.argv[1:]
    src = os.path.abspath(args[0]) if args else os.path.join(ROOT, 'ragdoll-skirmish-lab.html')
    outname = args[1] if len(args) > 1 else 'phaser-spike'
    page = open(src, encoding='utf-8').read()
    phaser = open(os.path.join(ROOT, 'vendor', 'phaser.min.js'), encoding='utf-8').read()
    # (a few of the painted figure's own helpers are let out of its module for the skinned figure: the arc-blade's painter, the coat's
    # springs and shield, the layer a cut cloth is drawn in, the Pit's colours)
    # (since V116 the look module lets these out itself; a page built before it is patched here)
    seam = 'return{draw,snap,cfg,ok,rng,LOOKS,'
    if page.count(seam) == 1:
        page = page.replace(seam, 'return{blade,coatStep,layerOpen,layerClose,shieldShape,pitLook,scarfRibbon,ripShape,draw,snap,cfg,ok,rng,LOOKS,')
    elif 'return{blade,coatStep,layerOpen,layerClose,shieldShape,pitLook,scarfRibbon,ripShape,draw,snap,cfg,ok,rng,LOOKS,' not in page:
        sys.exit('the look module no longer ends the way this test expects: see build_spike.py')
    parts = [('phaser.min.js', phaser)] + [(n, open(os.path.join(HERE, n), encoding='utf-8').read()) for n in ('skin_kit.js', 'skin_art_body.js', 'skin_art_head.js', 'skin_art_pit.js', 'skin.js', 'cast_skin.js', 'host.js')]
    for name, s in parts:
        if '</script' in s:
            sys.exit(name + ' holds a closing script tag: it cannot go in the page as it is')
    out = page + ''.join('<script>\n' + s + '\n</script>\n' for _, s in parts)
    os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
    p = os.path.join(HERE, 'out', outname + '.html')
    open(p, 'w', encoding='utf-8').write(out)
    print('built %s (%d KB)' % (os.path.relpath(p, ROOT), len(out.encode('utf-8')) // 1024))
    subprocess.check_call([sys.executable, os.path.join(ROOT, 'tools', 'wrap_page.py'), os.path.join(HERE, 'out', 'index.html' if outname == 'phaser-spike' else outname + '-index.html'), p])


if __name__ == '__main__':
    main()
