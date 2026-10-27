#!/usr/bin/env python3
"""The one build of Ragdoll Skirmish Lab. Every module is listed once, here, in load order.

  python3 build.py            ragdoll-skirmish-lab.html (the page that is published), sk_full.js (the game's script alone, for the
                              node checks), test_page.html (the same page opening on the lab, for the browser checks) and
                              build_map.json (where each source file starts in sk_full.js, for the static check's messages)
  python3 build.py --qa       the same three into uiwork/ as qa_full.html, qa_full.js and qa_test.html: a copy to take screenshots
                              from while the checks run on test_page.html
  python3 build.py --scenes   rebuild sk_sceneui.js from the scene painters in envx/ and sk_scene_glue.js even if it looks current
                              (it is rebuilt anyway whenever one of them is newer than it)

The page is one classic <script>: every file shares one global scope, so the order below is the order things are defined and run.
"""
import os, sys, json

# ---------- the modules ----------
# the rules, the physics and the systems of the game (no DOM: the node checks load these through sk_src.js)
CORE = ['core', 'anim', 'brawl', 'fin', 'team', 'env', 'phase', 'arc']
# the features, each with a game part (sk_<f>.js) and a UI part (sk_<f>ui.js) where it has one
FEAT = ['crew', 'chain', 'insure', 'style', 'secret', 'lobby', 'breach', 'office', 'finale', 'ctxmoves', 'fig', 'look', 'cast',
        'scene', 'arms', 'guns', 'story', 'beast', 'elf', 'hud', 'light', 'react', 'room', 'explore', 'pit', 'pitcast', 'pit2', 'pit5', 'short', 'pit6', 'pit7', 'pit8', 'pit9', 'pitmenu', 'sfx']
# the UI parts that come before the features' UI parts, and the main UI script that comes last (its frame loop starts the game)
UI_FIRST = ['envui', 'phaseui', 'arcui']
UI_LAST = 'ui'
# the stylesheets, in cascade order
CSS = ['base', 'extra', 'crew', 'chain', 'insure', 'style', 'secret', 'lobby', 'breach', 'office', 'finale', 'ctxmoves', 'arms', 'story',
       'elf', 'hud', 'light', 'react', 'room', 'explore', 'pit', 'pit2', 'pit5', 'pit6', 'pit7', 'pit8', 'pit9', 'pitmenu']
# the scene painters (envx/) that make sk_sceneui.js, with the glue that puts them in the game last
SCENES = ['env_look', 'env_tex', 'env_props', 'tex_lobby', 'tex_office', 'tex_out_a', 'tex_out_b', 'env_street', 'env_dining', 'env_kitchen',
          'env_lobby', 'env_office', 'env_field', 'env_hill', 'env_ledge', 'env_wall', 'env_crops', 'env_outskirts', 'env_chase', 'env_roadblock', 'env_roof',
          'env_fall', 'veh_bike', 'veh_apc', 'env_station', 'env_tunnel', 'veh_heli', 'veh_train', 'fx_guns', 'beasts', 'fx_elven',
          'env_sumproof', 'env_sumpkitchen', 'env_backroom', 'env_yard', 'env_stairs', 'env_shelf']
SCENE_GLUE = 'sk_scene_glue.js'
SCENE_HEAD = '''// ===== SCENE UI =====
// (loaded ahead of the main UI script; everything here runs only once the UI is up)
// Every fighting ground drawn in full, in the Noir Gilt look: Lamplight Street, the bistro's dining room and kitchen, the Halloran
// lobby and the office upstairs, the meadow, the hillside, the broken ledge and the ruin wall, and the prologue's own grounds (the crop field outside the city, the avenue at speed, the checkpoint, the family's railway and its stations, the roof and the long fall), with the bikes, the carrier, the train, the helicopter, the guns and the gunfire, and the beasts of the old line. Each scene paints its still parts once
// into a layer and draws what moves over it every frame; the game's own furniture, lamps, tables and dividers are redrawn in its
// materials. The painters below are the ones the mockups were made with; the glue at the end puts them in the game.
'''

HERE = os.path.dirname(os.path.abspath(__file__))
def path(*p): return os.path.join(HERE, *p)
def read(n): return open(path(n), encoding='utf-8').read()

def core_files():
    return ['sk_%s.js' % m for m in CORE] + ['sk_%s.js' % f for f in FEAT if os.path.exists(path('sk_%s.js' % f))]
def ui_files():
    return ['sk_%s.js' % m for m in UI_FIRST] + ['sk_%sui.js' % f for f in FEAT if os.path.exists(path('sk_%sui.js' % f))] + ['sk_%s.js' % UI_LAST]
def css_files():
    return ['sk_css_%s.css' % c for c in CSS if os.path.exists(path('sk_css_%s.css' % c))]
def scene_sources():
    return [path('envx', s + '.js') for s in SCENES] + [path(SCENE_GLUE)]

# ---------- the scene bundle ----------
def build_scenes(force=False):
    out_p = path('sk_sceneui.js')
    if not force and os.path.exists(out_p):
        newest = max(os.path.getmtime(p) for p in scene_sources())
        if newest <= os.path.getmtime(out_p): return False
    out = SCENE_HEAD
    for f in SCENES:
        s = read(os.path.join('envx', f + '.js'))
        if f == 'env_office':
            # (the painter puts the desk in the game itself when it runs alone; in the bundle the glue does it)
            lines = s.split('\n'); k = [i for i, l in enumerate(lines) if l.startswith("if(typeof drawDesk==='function'&&!window.__officeDesk)")]
            assert len(k) == 1; lines[k[0]] = '// (the desk is put in the game by the glue below)'; s = '\n'.join(lines)
        out += s.rstrip('\n') + '\n'
    out += read(SCENE_GLUE).rstrip('\n') + '\n// ===== SCENE UI END =====\n'
    open(out_p, 'w', encoding='utf-8').write(out)
    return True

# ---------- the page ----------
def assemble():
    """The game's script and the page, exactly as the build has always joined them, with where each file starts in the script."""
    parts, starts = [], []
    line = 1
    def add(name, text):
        nonlocal line
        starts.append({'file': name, 'line': line})
        parts.append(text); line += text.count('\n')
    def add_sep(text):
        nonlocal line
        parts.append(text); line += text.count('\n')
    # the game: each part followed by a line break, and one more between the game and its UI
    for f in core_files():
        add(f, read(f)); add_sep('\n')
    add_sep('\n')
    uf = ui_files()
    for i, f in enumerate(uf):
        add(f, read(f))
        # (the first three UI parts and the features' parts are each followed by a line break; the main UI script ends the script)
        if i < len(uf) - 1: add_sep('\n')
    js = ''.join(parts)
    css = ''.join(read(c) for c in css_files())
    html = read('sk_head.txt') + css + '</style>\n\n' + read('sk_body.html') + '\n<script>\n' + js + '</script>\n'
    return js, html, starts

def build(qa=False, scenes=False):
    regenerated = build_scenes(force=scenes)
    js, html, starts = assemble()
    test = '<meta charset="utf-8">\n<script>window.SK_TEST=1</script>\n' + html
    if qa:
        outs = {'uiwork/qa_full.html': html, 'uiwork/qa_full.js': js, 'uiwork/qa_test.html': test}
    else:
        # (file:// pages need the charset the artifact wrapper adds when published; the test copy opens on the lab, not the prologue)
        outs = {'ragdoll-skirmish-lab.html': html, 'sk_full.js': js, 'test_page.html': test,
                'build_map.json': json.dumps(starts, indent=0),
                # (the node checks load the game without its UI from this list: sk_src.js)
                'build_modules.json': json.dumps({'core': core_files(), 'ui': ui_files(), 'css': css_files()}, indent=1)}
    for n, s in outs.items():
        open(path(n), 'w', encoding='utf-8').write(s)
    return regenerated, outs

if __name__ == '__main__':
    args = sys.argv[1:]
    regen, outs = build(qa='--qa' in args, scenes='--scenes' in args)
    print(('scenes rebuilt; ' if regen else '') + 'built ' + ', '.join('%s (%d KB)' % (n, len(s.encode('utf-8')) // 1024) for n, s in outs.items()))
