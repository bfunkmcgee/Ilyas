#!/usr/bin/env python3
"""The layers test: the built game with the motion test (its drawn pose and its panel) and, after them, layers.js (the picture on
three sheets, shown by Phaser with focus and dust between them, and the yard's far bands sliding behind it) and panel.js (its
switches). In this copy of the page the yard's painter is opened so that its bands can be painted apart (YARD, below). Not part of
the game's build.

    python3 build.py                        (the game, as always)
    python3 spike/layers/build_layers.py    spike/layers/out/layers-test.html, and out/index.html wrapped for publishing
"""
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
PARTS = (('spike', 'motion', 'motion.js'), ('spike', 'motion', 'panel.js'), ('spike', 'layers', 'layers.js'), ('spike', 'layers', 'panel.js'))


# The yard's painter, opened in this page's copy only (the game's file, envx/env_yard.js, is not changed). Each piece of its text
# must be found once, or the build stops: a painter that has changed has to be opened again by hand.
#   - paint(c, only): 'far' the Pit's far side, 'mid' the shacks round the yard and the lane beyond the fence, 'light' the light
#     over it all, 'over' what the painter lays over that light (the things along the walls again, what grows), anything else the
#     yard itself under its light; with nothing, the whole picture as ever;
#   - behindRow: the middle band's row of shacks run on behind the woodshed and the Sump, and the pole's wires with it. The whole
#     picture hides them; the band shows them as it slides out from behind the yard;
#   - what moves on the far wall (the picture above the layer, the tram, the far chimneys' smoke, the fires, the windows going
#     dark) is drawn on the far band's own sheet when layers.js hands one over (__lyp.far), with no need of the skyline's clip
#     there, since the nearer bands lie over it; the neighbours' chimneys smoke where the middle band has gone (__lyp.mid);
#   - bands: 1 says the painter is open.
SLID = "globalThis.__lyp"
YARD = (
    ("function paint(c){const P=K.pal(),X0=-170,X1=W+250,T0=-110;\n  backdrop(c,P,X0,X1,T0);neighbours(c,P);beyond(c,P);\n  ground(c,P);\n",
     "function behindRow(c,P){\n"
     "  for(const f of [{x0:424,x1:512,top:200,base:262,seed:31,col:'#342b2c',wins:[[24,16,13,11]]},{x0:512,x1:584,top:212,base:262,seed:37,col:'#3d3330',wins:[[28,13,12,10]],kind:'tin'},\n"
     "    {x0:584,x1:640,top:192,base:262,seed:41,col:'#30282a',wins:[[16,16,12,10]]}]){f.hz=.12;K.facade(c,P,f);}\n"
     "  c.strokeStyle=rgba('#0a0808',.65);c.lineWidth=1.51;c.beginPath();c.moveTo(700,126);c.lineTo(424,108);c.moveTo(640,156);c.lineTo(424,152);c.stroke();}\n"
     "function paint(c,only){const P=K.pal(),X0=-170,X1=W+250,T0=-110;\n  if(only==='light'){lightPass(c,P);return;}\n  if(only==='over'){crisp(c,P);growth(c,P);return;}\n"
     "  if(!only||only==='far')backdrop(c,P,X0,X1,T0);\n  if(only==='mid'&&(" + SLID + "||0).ext!==false)behindRow(c,P);\n"
     "  if(!only||only==='mid'){neighbours(c,P);beyond(c,P);}\n  if(only==='far'||only==='mid')return;\n  ground(c,P);\n"),
    ("  lightPass(c,P);\n  crisp(c,P);growth(c,P);}\n// ---------- the pieces that stand among the people",
     "  if(!only){lightPass(c,P);crisp(c,P);growth(c,P);}}\n// ---------- the pieces that stand among the people"),
    ("  K.upper('yard:'+T,-1000,",
     "  const __L=" + SLID + ",__c0=ctx,__fc=__L&&__L.far?__L.far(ctx):null;if(__fc)ctx=__fc;\n  K.upper('yard:'+T,-1000,"),
    ("  ctx.save();ctx.clip(skyPath());\n", "  ctx.save();if(!__fc)ctx.clip(skyPath());\n"),
    ("  ctx.restore();\n  // the Sump's stovepipe and the chimneys round the yard\n",
     "  ctx.restore();\n  if(__fc){ctx=__c0;__L.end();}\n  // the Sump's stovepipe and the chimneys round the yard\n"),
    ("  {const srcs=[{x:STOVE.x,y:STOVE.y,s:5,sp:.1,n:8,h:180,dx:24,a:.55}];for(const ch of NEARCH)srcs.push({x:ch.x,y:ch.y,s:4,sp:.09,n:6,h:120,dx:16,a:.45,ph:ch.x*.013});"
     "K.smoke(ctx,srcs,t,P.smoke,T==='night'?.6:1);}\n",
     "  {const srcs=[{x:STOVE.x,y:STOVE.y,s:5,sp:.1,n:8,h:180,dx:24,a:.55}],src2=[];for(const ch of NEARCH)src2.push({x:ch.x,y:ch.y,s:4,sp:.09,n:6,h:120,dx:16,a:.45,ph:ch.x*.013});"
     "K.smoke(ctx,srcs,t,P.smoke,T==='night'?.6:1);\n    ctx.save();if(__L&&__L.mid)__L.mid(ctx);K.smoke(ctx,src2,t,P.smoke,T==='night'?.6:1);ctx.restore();}\n"),
    ("E.S.yard={set:()=>SETS[K.tod()]||SETS.day,paint,live,light,key,pieces,LAYOUT};",
     "E.S.yard={set:()=>SETS[K.tod()]||SETS.day,paint,live,light,key,pieces,LAYOUT,bands:1};"),
)


def open_yard(page):
    for old, new in YARD:
        if page.count(old) != 1:
            sys.exit('the yard\'s painter is not as the layers test expects (found %d times): %r' % (page.count(old), old[:70]))
        page = page.replace(old, new)
    return page


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
    page = open_yard(page)
    out = page + ''.join('<script>\n' + s + '\n</script>\n' for _, s in parts)
    os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
    p = os.path.join(HERE, 'out', 'layers-test.html')
    open(p, 'w', encoding='utf-8').write(out)
    print('built %s (%d KB)' % (os.path.relpath(p, ROOT), len(out.encode('utf-8')) // 1024))
    subprocess.check_call([sys.executable, os.path.join(ROOT, 'tools', 'wrap_page.py'), os.path.join(HERE, 'out', 'index.html'), p])


if __name__ == '__main__':
    main()
