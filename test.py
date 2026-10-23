#!/usr/bin/env python3
"""The checks, in tiers. Every run builds first and starts with the static check (check.py, seconds).

  python3 test.py              quick: the static check and the eight game-logic suites (about two minutes)
  python3 test.py affected     the static check, then the suites that cover what changed since the last full run that passed
                               (a change to the game's rules runs everything; a change to the drawing, the page suites it touches)
  python3 test.py full         every suite (two at a time: the machine has two cores), then the timing checks alone
  python3 test.py perf         the timing checks alone (sk_perf_page.js): nothing else may load the machine while they run
  python3 test.py NAME ...     the named suites (see SUITES), after the static check
  python3 test.py --list       the suites and what each covers
  python3 test.py --status     whether the sources are the ones the last full run passed with (check before publishing)

Each suite's output goes to test_out/NAME.txt; the summary gives each one's time and verdict. A suite fails on a nonzero exit, a
line starting "FAIL", or a closing "errors N" / "problems [...]" that is not empty. A full run that passes records the sources it
passed with (test_out/last_pass.json): "affected" runs the suites that cover the files changed since.
"""
import os, sys, re, json, time, hashlib, subprocess, threading

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'test_out')
def path(*p): return os.path.join(HERE, *p)

# ---------- the suites ----------
# name: (command, kind, what it covers). kind: logic (node, no page), page (the real page in Chromium), live (the published page),
# perf (timing: run alone)
SUITES = {
    'v12':        (['node', 'sk_v12test.js'], 'logic', 'the restaurant run on to the lobby and the office'),
    'team':       (['node', 'sk_teamtest.js'], 'logic', 'the ally and the off-hand dagger'),
    'brawl':      (['node', 'sk_brawltest.js'], 'logic', 'every brawl action and outcome'),
    'sktest':     (['node', 'sk_test.js'], 'logic', 'the core rules, balance runs'),
    'env':        (['node', 'sk_envtest.js'], 'logic', 'dividers, furniture, tableware, lamps'),
    'v12finale':  (['node', 'sk_v12finale_test.js'], 'logic', 'the executive and the last scene'),
    'react':      (['node', 'sk_react_test.js'], 'logic', 'answers to blows, balance, breaks and Kael\'s flow'),
    'room':       (['node', 'sk_room_test.js'], 'logic', 'the room: bodies, panes, lamps and the table, and the room moves'),
    'short':      (['node', 'sk_short_test.js'], 'logic', 'Short Hand: the stance, the Hinge, the Wrist toll, the Short ladder, the check and the hook'),
    'dom':        (['node', 'sk_dom.js'], 'page', 'the whole UI on a stub page: scripted play in every arena'),
    'lookpage':   (['node', 'sk_look_page.js'], 'page', "Kael's look: coat, tears, every arena and state"),
    'castpage':   (['node', 'sk_cast_page.js'], 'page', 'the cast and the crews drawn'),
    'armspage':   (['node', 'sk_arms_page.js'], 'page', 'the weapons drawn'),
    'arcpage':    (['node', 'sk_arc_page.js'], 'page', 'the arc-blade'),
    'finalepage': (['node', 'sk_v12finale_page.js'], 'page', "the finale's panels and choice in the page"),
    'hudpage':    (['node', 'sk_hud_page.js'], 'page', 'the HUD by screen, the plates, tabs, drawers, riposte dock'),
    'lightpage':  (['node', 'sk_light_page.js'], 'page', 'the lighting and effects'),
    'drawfree':   (['node', 'probes/draw_free.js'], 'page', 'the prologue and Act I played through and seven fights, the same drawn or not'),
    'act1page':   (['node', 'sk_act1_page.js'], 'page', 'Act I: every scene on auto, their lines, cards and rules, walking about by hand, the Pit look'),
    'soundpage':  (['node', 'sk_sound_page.js'], 'page', 'the held sounds heard: the bike\'s engine while it runs, and silent once the bike part is over'),
    'live':       (['node', 'figwork/livecheck.js'], 'live', 'the published page runs its own loop without errors'),
    'perf':       (['node', 'sk_perf_page.js'], 'perf', 'what drawing costs a frame (timing: run alone)'),
}
LOGIC = [n for n, s in SUITES.items() if s[1] == 'logic']
PAGES = [n for n, s in SUITES.items() if s[1] == 'page']
# the longest first, so the two lanes finish together
# (seconds each in a full run, the other lane busy: drawfree 205, arms 195, look 185, cast 185, dom 180, light 150, finale 130,
# sktest 50, hud 35, v12 30, v12finale 20, brawl 10, team 10, arc 10, live 5, env 5)
ORDER = ['drawfree', 'armspage', 'lookpage', 'castpage', 'dom', 'lightpage', 'finalepage', 'sktest', 'act1page', 'hudpage', 'v12',
         'v12finale', 'brawl', 'team', 'react', 'room', 'short', 'soundpage', 'arcpage', 'live', 'env']

# ---------- what covers what ----------
GAME = r'^sk_(core|brawl|fin|team|env|phase|arc|crew|chain|insure|style|secret|lobby|breach|office|finale|ctxmoves|cast|arms|guns|story|beast|elf|react|room|explore|pit|pit2|pit5|short|pit6|pit7|pit8|pit9|pitmenu)\.js$'
COVERS = [
    (GAME, 'ALL'),                                                     # the rules: everything
    (r'^build\.py$|^sk_src\.js$', 'ALL'),
    (r'^sk_(ui|envui|phaseui|arcui|sceneui|scene_glue)\.js$|^envx/', PAGES),   # the drawing every page shares
    (r'^sk_(lookui|figui)\.js$', ['lookpage', 'castpage', 'lightpage', 'dom']),
    (r'^sk_castui\.js$', ['castpage', 'dom']),
    (r'^sk_(armsui|gunsui)\.js$', ['armspage', 'arcpage', 'dom']),
    (r'^sk_arcui\.js$', ['arcpage', 'armspage', 'dom']),
    (r'^sk_(hudui|chainui|crewui|insureui|ctxmovesui)\.js$|^sk_css_.*\.css$|^sk_body\.html$|^sk_head\.txt$', ['hudpage', 'finalepage', 'lightpage', 'dom']),
    (r'^sk_(finaleui|officeui|breachui|secretui|lobbyui)\.js$', ['finalepage', 'hudpage', 'dom']),
    (r'^sk_(storyui|beastui|elfui|styleui|reactui|roomui|shortui)\.js$', ['finalepage', 'hudpage', 'dom', 'act1page']),
    (r'^sk_storyui\.js$', ['soundpage']),
    (r'^sk_lightui\.js$', ['lightpage', 'lookpage', 'dom']),
    (r'^sk_(exploreui|pitui|pitcastui|pit2ui|pit5ui|pit6ui|pit7ui|pit8ui|pit9ui|pitmenuui)\.js$|^sk_css_(explore|pit|pit2|pit5|pit6|pit7|pit8|pit9|pitmenu)\.css$', ['act1page', 'hudpage', 'dom']),
    (r'^sk_(lookui|armsui|storyui)\.js$', ['act1page']),
]
TEST_FILE = {s[0][1]: n for n, s in SUITES.items()}

def modules():
    try: return json.load(open(path('build_modules.json')))
    except Exception: return {'core': [], 'ui': [], 'css': []}

def tracked():
    """The files a run depends on: the game's sources and page, the scene painters, the build and the checks."""
    m = modules()
    fs = m['core'] + m['ui'] + m['css'] + ['sk_head.txt', 'sk_body.html', 'sk_scene_glue.js', 'build.py', 'check.py', 'sk_src.js']
    src = open(path('build.py')).read()
    scenes = re.search(r"SCENES = \[(.*?)\]", src, re.S)
    if scenes: fs += ['envx/%s.js' % s for s in re.findall(r"'(\w+)'", scenes.group(1))]
    fs += [s[0][1] for s in SUITES.values()]
    return sorted(set(f for f in fs if os.path.exists(path(f))))

def digest(fs):
    out = {}
    for f in fs:
        try: out[f] = hashlib.sha1(open(path(f), 'rb').read()).hexdigest()
        except OSError: pass
    return out

def covered(changed):
    # (the logic suites load the game's own files only: a change to the drawing or the page leaves them alone)
    want = set()
    ui = set(modules()['ui'])
    for f in changed:
        if f in TEST_FILE: want.add(TEST_FILE[f]); continue
        hit = False
        for pat, suites in COVERS:
            if re.search(pat, f):
                hit = True
                want |= set(SUITES) if suites == 'ALL' else set(suites)
        if f in ui: want.add('drawfree')   # any drawing code could reach into the game
        if not hit and f.endswith(('.js', '.css', '.html')):
            want |= set(PAGES)   # a file the map does not know: every page suite, to be safe
    want.discard('perf'); want.discard('live')
    return [n for n in ORDER if n in want]

# ---------- running ----------
def verdict(name, code, text):
    if code == -999: return False, 'timed out'
    if code != 0: return False, 'exit status %d' % code
    fails = [l for l in text.split('\n') if l.startswith('FAIL')]
    if fails: return False, '%d FAIL: %s' % (len(fails), fails[0][5:120])
    e = last_errors(text)
    if e: return False, 'errors ' + e
    m = re.findall(r'^problems (\[.*\])\s*$', text, re.M)
    if m and m[-1] != '[]': return False, 'problems ' + m[-1][:120]
    if name == 'dom':
        # (the scripted play counts what it saw; a name starting "_" is a problem it found, save the previews it counts and a crew
        # fight its random play lost before a henchman fell)
        s = re.search(r'^seen (\{.*?\}) frames', text, re.M)
        if not s: return False, 'no closing "seen" line'
        seen = json.loads(s.group(1))
        bad = [k for k in seen if k.startswith('_') and k not in ('_preview', '_crewNoDeaths')]
        runs = [k for k in seen if k.startswith('run')]
        if bad: return False, 'problems seen: ' + ', '.join(bad)
        if len(runs) != 3 or not all(k.endswith('_over@office_fin') for k in runs): return False, 'the restaurant runs did not all end: ' + ', '.join(runs)
    if not text.strip(): return False, 'no output'
    oks = len(re.findall(r'^ok ', text, re.M))
    return True, ('%d checks' % oks) if oks else 'clean'

def last_errors(text):
    """The closing 'errors' of a suite's output, when it is not empty: 'errors 3 [...]', 'errors [...]', or nothing."""
    m = re.findall(r'errors (\d+|\[.*?\])', text)
    if not m: return ''
    v = m[-1]
    if v.isdigit(): return v if int(v) else ''
    return '' if v == '[]' else v[:200]

def run_one(name, env=None):
    cmd = SUITES[name][0]
    e = dict(os.environ); e.update(env or {})
    t0 = time.time()
    try:
        p = subprocess.run(cmd, cwd=HERE, capture_output=True, text=True, env=e, timeout=3600)
        code, text = p.returncode, p.stdout + ('\n' + p.stderr if p.stderr.strip() else '')
    except subprocess.TimeoutExpired as x:
        code, text = -999, (x.stdout or b'').decode('utf-8', 'replace') if isinstance(x.stdout, bytes) else (x.stdout or '')
    open(os.path.join(OUT, name + '.txt'), 'w').write(text)
    ok, why = verdict(name, code, text)
    return {'name': name, 'ok': ok, 'why': why, 'secs': time.time() - t0}

def show(r):
    print('  %-11s %-4s %6.1fs  %s' % (r['name'], 'ok' if r['ok'] else 'FAIL', r['secs'], r['why']), flush=True)

def run_many(names, lanes=2):
    """Two at a time, longest first; prints each as it finishes."""
    queue, results, lock = list(names), [], threading.Lock()
    def lane():
        while True:
            with lock:
                if not queue: return
                n = queue.pop(0)
            r = run_one(n)
            with lock:
                results.append(r); show(r)
    ts = [threading.Thread(target=lane) for _ in range(min(lanes, len(names)))]
    for t in ts: t.start()
    for t in ts: t.join()
    return results

def static():
    p = subprocess.run([sys.executable, path('check.py')], cwd=HERE, capture_output=True, text=True)
    print(p.stdout.strip(), flush=True)
    return p.returncode == 0

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    flags = [a for a in sys.argv[1:] if a.startswith('--')]
    os.makedirs(OUT, exist_ok=True)
    if '--status' in flags:
        try: last = json.load(open(os.path.join(OUT, 'last_pass.json')))
        except Exception: print('no full run has passed yet'); return 1
        now = digest(tracked()); changed = [f for f in now if last.get(f) != now[f]]
        when = time.strftime('%b %d %H:%M', time.localtime(last.get('_when', 0)))
        if changed: print('changed since the full run that passed (%s): %s' % (when, ', '.join(changed))); return 1
        print('the sources are the ones the full run of %s passed with' % when); return 0
    if '--list' in flags:
        for n in ORDER + ['perf']:
            c, k, what = SUITES[n]; print('  %-11s %-6s %s' % (n, k, what))
        return 0
    mode = args[0] if args and args[0] in ('quick', 'affected', 'full', 'perf') else ('named' if args else 'quick')
    t0 = time.time()
    if not static(): print('stopped: the static check found problems'); return 1
    if mode == 'perf':
        names = ['perf']
    elif mode == 'named':
        bad = [a for a in args if a not in SUITES]
        if bad: print('no such suite:', ', '.join(bad), '(python3 test.py --list)'); return 1
        names = args
    elif mode == 'quick':
        names = LOGIC
    elif mode == 'affected':
        last = {}
        try: last = json.load(open(os.path.join(OUT, 'last_pass.json')))
        except Exception: pass
        now = digest(tracked())
        changed = [f for f in now if last.get(f) != now[f]]
        names = covered(changed) if last else [n for n in ORDER if n != 'live']
        print('changed since the last full pass: %s' % ((', '.join(changed[:12]) + (' and %d more' % (len(changed) - 12) if len(changed) > 12 else '') or 'nothing') if last else 'no full pass recorded yet: every suite'))
    else:
        names = list(ORDER)
    if mode != 'perf': names = [n for n in names if n != 'perf']
    names = [n for n in ORDER if n in names] + [n for n in names if n not in ORDER]
    print('%s: %s' % (mode, ', '.join(names) or 'nothing to run'), flush=True)
    res = run_many(names)
    if mode == 'full' and all(r['ok'] for r in res):
        print('timing checks, alone:')
        r = run_one('perf'); res.append(r); show(r)
    ok = all(r['ok'] for r in res)
    if ok and mode == 'full':
        json.dump(dict(digest(tracked()), _when=time.time()), open(os.path.join(OUT, 'last_pass.json'), 'w'), indent=0)
    print('%s: %s in %.1f min (%d suites)' % (mode, 'PASS' if ok else 'FAIL: ' + ', '.join(r['name'] for r in res if not r['ok']), (time.time() - t0) / 60, len(res)))
    return 0 if ok else 1

if __name__ == '__main__':
    sys.exit(main())
