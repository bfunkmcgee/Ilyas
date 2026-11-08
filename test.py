#!/usr/bin/env python3
"""The checks, in tiers. Every run builds first and starts with the static check (check.py, seconds).

  python3 test.py              quick: the static check and the game-logic suites (about two minutes)
  python3 test.py affected     the static check, then the suites that cover what changed since the last full run that passed
                               (a change to the game's rules runs everything; a change to the drawing, the page suites it touches)
  python3 test.py full         every suite whose last pass no longer stands (two at a time: the machine has two cores), then the
                               timing checks alone if theirs does not either; --all runs every suite whatever passed before;
                               --no-timing leaves the timing checks out (GitHub's runners: their limits are set for this machine).
                               First it takes the passes GitHub made on the last candidate (test.py github) for the same inputs,
                               waiting for that run while it goes on and the working tree is still the candidate; --here does not
  python3 test.py github       pushes the working tree, as it is, to GitHub as a candidate (the branch try/candidate; nothing is
                               committed here) for its checks to run the suites on it (12 to 18 minutes there); --wait waits for
                               that run and takes its passes
  python3 test.py perf         the timing checks alone (sk_perf_page.js): nothing else may load the machine while they run
  python3 test.py look         the look review alone (uiwork/look/review.py, about 21 minutes): every place against the style and
                               drawing guides' measured rules; it times the drawing, so nothing else may run beside it. Only what
                               its last pass, or its last run that failed, does not cover: nothing, the judging alone (a minute),
                               the costs timed again and the judging (about seven minutes) or the whole review; --all: whole
  python3 test.py places [ID ...]  the places' check: the look review of those places alone (their ids in uiwork/look/places.js;
                               none named, the places with a frame the last review did not shoot), about five minutes, into
                               test_out/look_places; never a pass. Alone, as it times them; --no-cost leaves the timing out
  python3 test.py NAME ...     the named suites (see SUITES), after the static check
  python3 test.py --list       the suites and what each covers
  python3 test.py --status     builds, takes GitHub's passes on the last candidate if its run is done, then says whether every
                               suite's last pass and the look review's still stand, and for each that does not, why (check before
                               publishing)

Each suite's output goes to test_out/NAME.txt; the summary gives each one's time and verdict. A suite fails on a nonzero exit, a
line starting "FAIL", or a closing "errors N" / "problems [...]" that is not empty.

What a pass rests on (since V99). A suite's verdict follows from what it reads (the checks are seeded and run on a fake clock), so a
suite that passed need not run again while all of that is as it was. Each node suite runs with tools/test_reads.js, which notes the
files of the repository it reads, the folders it lists and the files it looks at; its pass is kept with those and what each held
(test_out/passes.json), together with what it rests on without reading it itself: its own file, and for a page suite the page
(test_page.html, opened by Chromium) and the song the page loads beside it (a page opened as a file loads no other recording), and
the machine's node, Chromium and Playwright. Scripts, styles and pages are compared by tools/canon.js, which leaves out comments and
spacing (a line break kept where it can end a statement), so a change to a comment changes nothing a check can see. The suite runs
again when any of it differs, when its kept output no longer meets today's verdict, or when it last failed; "live" (the published
page) always runs. So: a change to the game runs the suites that read it (the page suites, for anything the page is built from); a
voice, sound or song file runs the suites that load it; a suite's own file, that suite alone; a document, a comment or a tool no
suite uses, nothing; a run cut short goes on with the suites it had not passed. The look review rests on the page, the song and its
own files: a change to the page or to what takes its pictures (places.js, audit.js, lines.js, review.py) takes them again; a change
to costs.js times the costs again; a change only to what reads them (hues.py, faults.py, lines.py, kept.json, kept_lines.json) reads
them again and judges. A review that failed keeps its pictures too (since Nov 8): the next takes them again only when what they rest
on changed, times the costs again when it failed on them, and else reads the pictures again and judges.
A full run that passes also records the sources it passed with (test_out/last_pass.json), which "affected" reads.

GitHub (since Nov 8). `test.py github` pushes the working tree as a commit of its own (the index and HEAD untouched) to the branch
try/candidate; GitHub's checks run on it, and its page job ends by packing its passes and their outputs into its log
(`test.py --export`). `test.py full` and `--status` read that log over GitHub's API and take each pass whose inputs here hold what
they held there, as a pass made here (marked "by"), when the machine there ran the same Playwright, Chromium build and node major;
the timing checks and the look review are this machine's alone.
"""
import os, sys, re, json, time, hashlib, subprocess, threading, shutil, zlib, base64, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'test_out')
def path(*p): return os.path.join(HERE, *p)
READS = os.path.join(OUT, 'reads')           # what each suite read as it ran (tools/test_reads.js): NAME.<pid>.json
PASSES = os.path.join(OUT, 'passes.json')    # each suite's last pass and what it rested on, and the look review's
PAGE = os.environ.get('PAGE', 'test_page.html')
CANON = ('.js', '.mjs', '.cjs', '.css', '.html', '.htm')   # compared by tools/canon.js: comments and spacing left out

# ---------- the suites ----------
# name: (command, kind, what it covers). kind: logic (node, no page), page (the real page in Chromium), live (the published page),
# perf (timing: run alone), look (the look review: timing and pictures, run alone)
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
    'anim':       (['node', 'sk_anim_test.js'], 'logic', 'the motion: rank, every variant of every blow, combos, the answers acted out, blows taken'),
    'rules':      (['node', 'sk_rules_test.js'], 'logic', 'the rules list: every entry, its order, each reader, and each system against the game without it'),
    'growth':     (['node', 'sk_growth_test.js'], 'logic', 'levels and growth: the curve to 100 and the styles\' to 20, what an enemy is worth, the XP a night gets and its levels, what each level gives by the rules, the style he fights in and its perks, Try again and the saves; the lab without it'),
    'styles':     (['node', 'sk_styles_test.js'], 'logic', 'the styles as a framework: the registry and a malformed style refused, who fights in what and each lock, the switch, the Wire drill\'s look, its count, the Long count, its rules and mastery, the night\'s XP and the pick kept, the Sareth cut with the scrap arm, Short Hand in the registry, the Order drill (the guards\' baton course: not his, its look, Cover, alone, the limbs, its answers, the push and the arm bar, the AI, the lobby)'),
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
    'soundpage':  (['node', 'sk_sound_page.js'], 'page', 'the held sounds heard: the bike\'s engine while it runs, and silent once the bike part is over; the prologue\'s song, from a file and over http; the recorded sounds over http (loading, the calls, the held ones, the sound switch, footsteps); the cast\'s voices (every line its file, word for word; over http loading, playing, the song stepping back, stopping, the switch, the hold)'),
    'stances':    (['node', 'sk_stances_page.js'], 'page', 'the stances, the free rise and the new spells in the lab: the stance bar, the whip, the answers and their dice, each spell\'s button and what it does, a fall and a blow on the floor, the rules off'),
    'growthpage': (['node', 'sk_growth_page.js'], 'page', 'levels on the page: his level on his plate in the story and not in the lab, the drawer\'s line, a level said over him and in the log, each style\'s level on its card, the title\'s line, a night\'s level through a reload and Continue'),
    'stylespage': (['node', 'sk_styles_page.js'], 'page', 'the styles on the page: the chip on the stance bar and the switch on his turn (a tap and V), the count on his plate and the chip, the log\'s lines, the Long count\'s callout, the menu\'s Styles tab in the lab and the prologue, the pick through a reload and Continue, the lobby\'s guards in the Order drill (the log, their plates, the batons, what they shout), Act I\'s cards, the chip and the plates at each screen'),
    'savepage':   (['node', 'sk_save_page.js'], 'page', 'the saves: the night kept at each stage, Continue on the title as the night was, a chapter as a replay, Begin\'s question, the end of what is built, a broken record or storage refused, the settings kept'),
    'stnmotion':  (['node', 'sk_stnmotion_page.js'], 'page', 'the stances\' motion: the whip\'s and Close\'s variants and combos, the leads on the parry, each answer acted out, no game dice'),
    'live':       (['node', 'figwork/livecheck.js'], 'live', 'the published page runs its own loop without errors'),
    'perf':       (['node', 'sk_perf_page.js'], 'perf', 'what drawing costs a frame (timing: run alone)'),
    'look':       (['python3', 'uiwork/look/review.py', 'test_out/look'], 'look', 'the look review: every place the game draws against the guides\' measured rules (alone, about 20 minutes)'),
}
LOGIC = [n for n, s in SUITES.items() if s[1] == 'logic']
PAGES = [n for n, s in SUITES.items() if s[1] == 'page']
# the longest first, so the two lanes finish together
# (seconds each in a full run, the other lane busy: drawfree 205, arms 195, look 185, cast 185, dom 180, light 150, finale 130,
# sktest 50, hud 35, v12 30, v12finale 20, brawl 10, team 10, arc 10, live 5, env 5)
ORDER = ['drawfree', 'stnmotion', 'armspage', 'lookpage', 'castpage', 'dom', 'stances', 'lightpage', 'finalepage', 'sktest', 'act1page', 'hudpage', 'v12',
         'v12finale', 'anim', 'brawl', 'team', 'react', 'room', 'short', 'soundpage', 'savepage', 'growthpage', 'stylespage', 'arcpage', 'live', 'env', 'rules', 'growth', 'styles']

# ---------- what covers what ----------
GAME = r'^sk_(core|rules|anim|brawl|fin|team|env|phase|arc|crew|chain|insure|style|secret|lobby|breach|office|finale|ctxmoves|cast|arms|guns|story|beast|elf|react|room|rise|stances|spells|stnmotion|explore|pit|pit2|gear|pit5|short|pit6|pit7|pit8|pit9|pitmenu|save|growth|styles|wire|order|vo)\.js$'
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
    (r'^sk_storyui\.js$|^music/|^sfx/|^sk_voui\.js$|^vo/|^tools/vo/', ['soundpage']),
    (r'^sk_sfxui\.js$', ['soundpage', 'dom']),
    (r'^sk_lightui\.js$', ['lightpage', 'lookpage', 'dom']),
    (r'^sk_(exploreui|pitui|pitcastui|gearui|pit2ui|pit5ui|pit6ui|pit7ui|pit8ui|pit9ui|pitmenuui)\.js$|^sk_css_(explore|pit|pit2|gear|pit5|pit6|pit7|pit8|pit9|pitmenu)\.css$', ['act1page', 'hudpage', 'dom']),
    (r'^sk_(lookui|armsui|storyui)\.js$', ['act1page']),
    (r'^sk_(stancesui|spellsui)\.js$|^sk_css_(stances|spells)\.css$', ['stances', 'stnmotion', 'hudpage', 'dom']),
    (r'^sk_(saveui|storyui)\.js$|^sk_css_story\.css$', ['savepage', 'growthpage', 'hudpage', 'dom']),
    (r'^sk_growthui\.js$|^sk_css_growth\.css$', ['growthpage', 'savepage', 'act1page', 'hudpage', 'dom']),
    (r'^sk_pit9ui\.js$', ['growthpage', 'stylespage']),
    (r'^sk_stylesui\.js$|^sk_css_styles\.css$', ['stylespage', 'stances', 'act1page', 'growthpage', 'hudpage', 'dom']),
    (r'^sk_orderui\.js$', ['stylespage', 'act1page', 'hudpage', 'dom']),
]
TEST_FILE = {s[0][1]: n for n, s in SUITES.items()}

def modules():
    try: return json.load(open(path('build_modules.json')))
    except Exception: return {'core': [], 'ui': [], 'css': []}

def tracked():
    """The files "affected" compares with the last full pass: the game's sources and page, the scene painters, the build, the
    suites' files, and the song and the recordings published beside the page (the full run and the look review go by what each pass
    rests on instead: the docstring's last paragraph)."""
    m = modules()
    fs = m['core'] + m['ui'] + m['css'] + ['sk_head.txt', 'sk_body.html', 'sk_scene_glue.js', 'build.py', 'sk_src.js']
    src = open(path('build.py')).read()
    scenes = re.search(r"SCENES = \[(.*?)\]", src, re.S)
    if scenes: fs += ['envx/%s.js' % s for s in re.findall(r"'(\w+)'", scenes.group(1))]
    fs += [s[0][1] for s in SUITES.values() if s[1] != 'look']
    for d in ('music', 'sfx', 'vo'):
        if os.path.isdir(path(d)): fs += ['%s/%s' % (d, f) for f in os.listdir(path(d)) if f.endswith('.mp3')]
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
    want.discard('perf'); want.discard('live'); want.discard('look')
    return [n for n in ORDER if n in want]

# ---------- what a pass rests on (since V99: the docstring's last paragraph) ----------
LOCK = threading.Lock()
# the look review's own files: what takes its pictures (a change: the whole review again), what times its costs (since Nov 8: the
# costs timed again, the pictures read again) and what reads and judges them (a change: those read again from the pictures it has)
LOOK_SHOOT = ['uiwork/look/%s' % f for f in ('places.js', 'audit.js', 'lines.js', 'review.py')]
LOOK_TIME = ['uiwork/look/costs.js']
LOOK_JUDGE = ['uiwork/look/%s' % f for f in ('hues.py', 'faults.py', 'lines.py', 'kept.json', 'kept_lines.json')]

def env_key():
    """The machine's own tools a verdict rests on too: node, the Chromium the suites drive, Playwright."""
    def out(cmd):
        try: return subprocess.run(cmd, capture_output=True, text=True, timeout=60).stdout.strip()
        except Exception: return '?'
    ch = os.environ.get('SK_CHROMIUM') or ('/opt/pw-browsers/chromium' if os.path.exists('/opt/pw-browsers/chromium') else '')
    try: pw = json.load(open(path('node_modules', 'playwright', 'package.json')))['version']
    except Exception: pw = '?'
    return {'node': out(['node', '-v']), 'chromium': os.path.realpath(ch) if ch else "Playwright's own", 'playwright': pw}

def digests(keys):
    """Today's digest of each input: 'r:<file>' what it holds (scripts, styles and pages by tools/canon.js), 'd:<folder>' what it
    lists, 's:<file>' whether it is there and its size. None: not there."""
    out, canon = {}, []
    for k in keys:
        kind, f = k[0], k[2:]
        p = path(f)
        if kind == 'r':
            if f.lower().endswith(CANON) and os.path.isfile(p): canon.append(f); continue
            try: out[k] = hashlib.sha1(open(p, 'rb').read()).hexdigest()
            except OSError: out[k] = None
        elif kind == 'd':
            try: out[k] = hashlib.sha1('\n'.join(sorted(os.listdir(p))).encode()).hexdigest()
            except OSError: out[k] = None
        else:
            out[k] = 'folder' if os.path.isdir(p) else ('%d' % os.path.getsize(p)) if os.path.exists(p) else None
    for i in range(0, len(canon), 400):
        part = canon[i:i + 400]
        r = subprocess.run(['node', path('tools', 'canon.js')] + part, cwd=HERE, capture_output=True, text=True)
        got = json.loads(r.stdout) if r.returncode == 0 and r.stdout.strip() else {}
        for f in part: out['r:' + f] = got.get(f, 'unread')
    return out

def passes():
    try:
        P = json.load(open(PASSES))
        return {'suites': P.get('suites') or {}, 'look': P.get('look'), 'look_shot': P.get('look_shot')}
    except Exception: return {'suites': {}, 'look': None, 'look_shot': None}

def save_passes(P):
    tmp = PASSES + '.tmp'
    json.dump(P, open(tmp, 'w'), indent=0)
    os.replace(tmp, PASSES)

def implicit(name):
    """What a suite rests on without reading it itself: its own file; for a page suite the page, which Chromium opens, and the song the
    page loads beside it (a page opened as a file loads no other recording: sfxCan and voxCan want http)."""
    keys = ['r:' + SUITES[name][0][1]]
    if SUITES[name][1] in ('page', 'perf', 'look'):
        keys.append('r:' + PAGE)
        if os.path.isdir(path('music')): keys += ['r:music/' + f for f in sorted(os.listdir(path('music'))) if f.endswith('.mp3')]
    return keys

def look_keys():
    return sorted(set(implicit('look') + ['r:' + f for f in LOOK_SHOOT + LOOK_TIME + LOOK_JUDGE]))

def reads_of(name):
    """The inputs a suite noted as it ran, every process of it (None when a note will not read)."""
    seen = {}
    if not os.path.isdir(READS): return None
    for f in os.listdir(READS):
        if not (f.startswith(name + '.') and f.endswith('.json')): continue
        try: d = json.load(open(os.path.join(READS, f)))
        except Exception: return None
        for p, k in d.items():
            if p not in seen or 'sdr'.index(k) > 'sdr'.index(seen[p]): seen[p] = k
    return ['%s:%s' % (k, p) for p, k in seen.items()]

def record(name, start, env):
    """A suite that passed: its pass kept with what it rested on, as that stood when the run began (an input that changed while it
    ran leaves the pass unkept, so the next run takes it again)."""
    got = reads_of(name) if SUITES[name][0][0] == 'node' else []
    if got is None: return
    keys = sorted(set(got) | set(implicit(name)))
    now = digests(keys)
    if any(k in start and start[k] != now[k] for k in keys): return
    with LOCK:
        P = passes()
        P['suites'][name] = {'inputs': now, 'env': env, 'when': time.time()}
        save_passes(P)

def unkeep(name):
    with LOCK:
        P = passes()
        if P['suites'].pop(name, None) is not None: save_passes(P)

def stale(name, P, now, env):
    """Why a suite has to run again, or None while its last pass stands."""
    if name == 'live': return 'it checks the published page'
    rec = P['suites'].get(name)
    if not rec: return 'no pass kept'
    if rec.get('env') != env: return "the machine's node, Chromium or Playwright is not the one it passed with"
    ch = [k[2:] for k, v in rec['inputs'].items() if now.get(k, 'unknown') != v]
    ch += [k[2:] for k in implicit(name) if k not in rec['inputs']]
    if ch: return 'changed: ' + ', '.join(ch[:4]) + (' and %d more' % (len(ch) - 4) if len(ch) > 4 else '')
    try: text = open(os.path.join(OUT, name + '.txt')).read()
    except OSError: return 'its last output is gone'
    ok, why = verdict(name, 0, text)
    return None if ok else 'its last output does not meet the verdict now (%s)' % why

LOOK_DO = {'all': 'the whole review', 'judge': 'its pictures read again and judged',
           'time': 'its costs timed again, its pictures read again and judged'}

def look_stale(P, now, env):
    """What the look review has to do again, and why: None (its pass stands), 'judge' (read its pictures again and judge), 'time'
    (time its costs again, read its pictures again and judge) or 'all'. A review that failed after taking and judging its pictures
    keeps them (P['look_shot'], since Nov 8): the next one takes them again only when the page, the song or what takes them changed,
    times the costs again when it failed on them (or costs.js changed), and else reads the pictures again and judges."""
    have = os.path.exists(os.path.join(OUT, 'look', 'review.json'))
    part = lambda k: 'judge' if k[2:] in LOOK_JUDGE else 'time' if k[2:] in LOOK_TIME else 'shoot'
    names = lambda ks: ', '.join(k[2:] for k in ks[:4]) + (' and %d more' % (len(ks) - 4) if len(ks) > 4 else '')
    rec = P.get('look')
    if rec and rec.get('env') == env:
        ch = [k for k in look_keys() if now.get(k, 'unknown') != rec['inputs'].get(k)]
        if not ch: return None, ''
        shoot = [k for k in ch if part(k) == 'shoot']
        if shoot or not have: return 'all', 'changed: ' + names(shoot or ch)
        return ('time' if any(part(k) == 'time' for k in ch) else 'judge'), 'changed: ' + names(ch)
    S = P.get('look_shot')
    if S and S.get('env') == env and have:
        ch = [k for k in look_keys() if now.get(k, 'unknown') != S['inputs'].get(k)]
        shoot = [k for k in ch if part(k) == 'shoot']
        failed = S.get('failed') or []
        if shoot: return 'all', 'changed since its last review failed: ' + names(shoot)
        why = 'its last review failed on %s, and its pictures stand%s' % (', '.join(failed) or 'a step', ('; changed: ' + names(ch)) if ch else '')
        return ('time' if 'cost' in failed or any(part(k) == 'time' for k in ch) else 'judge'), why
    if not rec: return 'all', 'no pass kept'
    return 'all', "the machine's tools changed"

def all_keys(P):
    """Every input any kept pass names, and every suite's implicit ones: what a run digests once, as it begins."""
    ks = set(look_keys())
    for r in P['suites'].values(): ks |= set(r['inputs'])
    for n in SUITES: ks |= set(implicit(n))
    if P.get('look'): ks |= set(P['look']['inputs'])
    return sorted(ks)

# ---------- GitHub: the suites run there on a candidate, their passes taken here (since Nov 8: the docstring's last paragraph) ----------
GITHUB = os.path.join(OUT, 'github.json')   # the last candidate pushed: its commit, its tree, the HEAD it was made on, when
BRANCH = 'try/candidate'
MARK = 'SK-PASSES'

def git(*a, env=None):
    return subprocess.run(['git'] + list(a), cwd=HERE, capture_output=True, text=True, env=env)

def repo_slug():
    u = git('remote', 'get-url', 'origin').stdout.strip()
    m = re.search(r'github\.com[:/]+([^/]+/[^/]+?)(?:\.git)?/?$', u)
    return os.environ.get('SK_GITHUB_REPO') or (m.group(1) if m else 'bfunkmcgee/Ilyas')

def work_tree():
    """The working tree as `git add -A` would commit it (what .gitignore leaves out, left out), as a tree, the index untouched: a copy
    of it takes the files."""
    os.makedirs(OUT, exist_ok=True)
    idx = os.path.join(OUT, 'candidate.index')
    real = git('rev-parse', '--path-format=absolute', '--git-path', 'index').stdout.strip()
    try: shutil.copyfile(real, idx)
    except OSError:
        if os.path.exists(idx): os.remove(idx)
    e = dict(os.environ, GIT_INDEX_FILE=idx)
    if git('add', '-A', env=e).returncode: return None
    t = git('write-tree', env=e)
    return t.stdout.strip() if t.returncode == 0 else None

def push_candidate():
    tree = work_tree()
    if not tree: print('github: git could not read the working tree'); return 1
    head = git('rev-parse', 'HEAD').stdout.strip()
    if git('rev-parse', 'HEAD^{tree}').stdout.strip() == tree: sha = head
    else:
        c = git('commit-tree', tree, '-p', head, '-m', "Candidate: the working tree for GitHub's checks (python3 test.py github)")
        if c.returncode: print('github: git could not make the candidate:\n' + c.stderr.strip()); return 1
        sha = c.stdout.strip()
    p = git('push', '-f', 'origin', '%s:refs/heads/%s' % (sha, BRANCH))
    if p.returncode: print('github: the push was refused:\n' + p.stderr.strip()); return 1
    json.dump({'sha': sha, 'tree': tree, 'head': head, 'when': time.time()}, open(GITHUB, 'w'), indent=0)
    # (the repository is public: what the candidate carries that HEAD does not is named, the new files by name)
    ch = [l.split('\t') for l in git('diff', '--name-status', head, sha).stdout.split('\n') if '\t' in l]
    new = [p[-1] for p in ch if p[0].startswith('A')]
    print('github: the working tree pushed as the candidate %s (on %s, %d files changed%s) to %s; its checks run the suites there,'
          ' 12 to 18 minutes:\n  %s' % (sha[:7], head[:7], len(ch), ', new: ' + ', '.join(new[:12]) + (' and %d more' % (len(new) - 12) if len(new) > 12 else '') if new else '',
                                        BRANCH, 'https://github.com/%s/actions?query=branch%%3A%s' % (repo_slug(), BRANCH.replace('/', '%2F'))))
    return 0

def api(p, text=False):
    """GitHub's REST API (public reads); None when it does not answer."""
    req = urllib.request.Request('https://api.github.com' + p, headers={'Accept': 'application/vnd.github+json', 'User-Agent': 'ilyas-test.py'})
    try:
        with urllib.request.urlopen(req, timeout=90) as r: b = r.read()
        return b.decode('utf-8', 'replace') if text else json.loads(b)
    except Exception: return None

def unpack(log):
    """The passes a page job packed into its log (test.py --export), or None."""
    parts, on = [], False
    for line in (log or '').split('\n'):
        line = re.sub(r'^﻿?\d{4}-\d\d-\d\dT[\d:.]+Z ', '', line.rstrip('\r'))
        if line.startswith(MARK + '-END'): break
        if on and line.startswith(MARK + ' '): parts.append(line[len(MARK) + 1:].strip())
        elif line.startswith(MARK + '-BEGIN'): on = True
    try: return json.loads(zlib.decompress(base64.b64decode(''.join(parts))))
    except Exception: return None

def export():
    """(GitHub's page job, at its end) its passes and their outputs, packed into its log for test.py on the machine the game is made on."""
    P = passes()
    outs = {}
    for n in P['suites']:
        try: outs[n] = open(os.path.join(OUT, n + '.txt')).read()
        except OSError: pass
    D = {'env': env_key(), 'sha': os.environ.get('GITHUB_SHA'), 'when': time.time(), 'suites': P['suites'], 'outputs': outs}
    blob = base64.b64encode(zlib.compress(json.dumps(D, separators=(',', ':')).encode(), 9)).decode()
    print('::group::%d passes, for test.py on the machine the game is made on' % len(P['suites']))
    print(MARK + '-BEGIN')
    for i in range(0, len(blob), 1000): print(MARK + ' ' + blob[i:i + 1000])
    print(MARK + '-END')
    print('::endgroup::')
    return 0

def same_tree(C):
    """Whether the working tree is still the candidate's, but for documents (*.md) and the workflows."""
    t = work_tree()
    if not t or t == C['tree']: return bool(t)
    d = git('diff', '--name-only', C['tree'], t)
    return d.returncode == 0 and all(f.endswith('.md') or f.startswith('.github/') for f in d.stdout.split())

def github_take(env, wait=False):
    """The passes GitHub's page job made on the last candidate, each taken as this machine's where every input it rests on holds here
    what it held there (and the suite's output meets the verdict): its pass then stands as one made here. wait: while that run goes
    on and the working tree is still the candidate's, wait for it. Prints what it did; gives the suites taken."""
    try: C = json.load(open(GITHUB))
    except Exception: return []
    slug, short, t0 = repo_slug(), C['sha'][:7], time.time()
    if wait and not same_tree(C):
        print('github: the working tree has changed since the candidate %s was pushed (python3 test.py github pushes it again): its'
              ' passes taken where they rest on what is here, without waiting for its run' % short)
        wait = False
    told = 0
    while True:
        d = api('/repos/%s/actions/runs?head_sha=%s&per_page=20' % (slug, C['sha']))
        if d is None: print("github: GitHub's API did not answer: no passes taken from it"); return []
        runs = sorted((r for r in d.get('workflow_runs') or [] if r.get('name') == 'checks'), key=lambda r: r.get('created_at') or '')
        run = runs[-1] if runs else None
        if run and run.get('status') == 'completed': break
        late = time.time() - C['when'] > 15 * 60
        if not wait or (not run and late) or time.time() - t0 > 80 * 60:
            print('github: %s on the candidate %s%s' % ('its run is %s' % run['status'].replace('_', ' ') if run else 'no run yet',
                  short, ' (%s)' % run['html_url'] if run else ''))
            return []
        if time.time() - told > 120:
            print('github: waiting for its run on the candidate %s (%s, %.0f min since the push)' % (
                short, run['status'].replace('_', ' ') if run else 'not started', (time.time() - C['when']) / 60), flush=True)
            told = time.time()
        time.sleep(30)
    j = api('/repos/%s/actions/runs/%d/jobs' % (slug, run['id'])) or {}
    jobs = {x['name']: x for x in j.get('jobs') or []}
    pages = jobs.get('pages')
    head = 'github: run %d on the candidate %s (%s; quick %s, pages %s)' % (run['id'], short, run.get('conclusion'),
           (jobs.get('quick') or {}).get('conclusion'), (pages or {}).get('conclusion'))
    if not pages or pages.get('conclusion') in (None, 'skipped', 'cancelled'):
        print(head + ': no passes to take'); return []
    D = unpack(api('/repos/%s/actions/jobs/%d/logs' % (slug, pages['id']), text=True))
    if not D: print(head + ': its log holds no passes'); return []
    # (the machine there: the same Playwright, the same Chromium build and node's major version; a runner's Chromium is Playwright's
    # own, the revision its browsers.json names, the one this machine's folder is named for)
    def build(e):
        if e.get('chromium') == "Playwright's own":
            try: return next(b['revision'] for b in json.load(open(path('node_modules', 'playwright-core', 'browsers.json')))['browsers'] if b['name'] == 'chromium')
            except Exception: return None
        return (re.findall(r'chromium[-_](\d+)', e.get('chromium') or '') or [None])[-1]
    there = D.get('env') or {}
    if (there.get('playwright') != env.get('playwright') or build(there) is None or build(there) != build(env)
            or (there.get('node') or 'x').split('.')[0] != (env.get('node') or 'y').split('.')[0]):
        print(head + ': its node, Chromium or Playwright is not this machine\'s (%s against %s): no passes taken' % (there, env)); return []
    S = {n: r for n, r in (D.get('suites') or {}).items() if n in SUITES and SUITES[n][1] in ('logic', 'page')}
    now = digests(sorted(set(k for r in S.values() for k in r['inputs'])))
    taken, differ = [], []
    with LOCK:
        P = passes()
        for n, r in sorted(S.items()):
            text = (D.get('outputs') or {}).get(n)
            if (any(now.get(k, 'unknown') != v for k, v in r['inputs'].items()) or any(k not in r['inputs'] for k in implicit(n))
                    or text is None or not verdict(n, 0, text)[0]):
                differ.append(n); continue
            open(os.path.join(OUT, n + '.txt'), 'w').write(text)
            P['suites'][n] = {'inputs': r['inputs'], 'env': env, 'when': r.get('when'), 'by': 'GitHub run %d (%s)' % (run['id'], short)}
            taken.append(n)
        save_passes(P)
    print(head + ': %d passes taken%s' % (len(taken), '; not taken, as their inputs here are not what they were there: ' + ', '.join(differ) if differ else ''))
    return taken

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

RUN = {'start': {}, 'env': None}   # this run's: what every input held as it began, and the machine's tools

def run_one(name, env=None, extra=()):
    cmd = list(SUITES[name][0]) + list(extra)
    e = dict(os.environ); e.update(env or {})
    if cmd[0] == 'node':
        # (what the suite reads, noted as it runs: tools/test_reads.js)
        os.makedirs(READS, exist_ok=True)
        for f in os.listdir(READS):
            if f.startswith(name + '.'): os.remove(os.path.join(READS, f))
        cmd = ['node', '-r', path('tools', 'test_reads.js')] + cmd[1:]
        e['SK_READS'] = os.path.join(READS, name)
    t0 = time.time()
    try:
        p = subprocess.run(cmd, cwd=HERE, capture_output=True, text=True, env=e, timeout=3600)
        code, text = p.returncode, p.stdout + ('\n' + p.stderr if p.stderr.strip() else '')
    except subprocess.TimeoutExpired as x:
        code, text = -999, (x.stdout or b'').decode('utf-8', 'replace') if isinstance(x.stdout, bytes) else (x.stdout or '')
    open(os.path.join(OUT, name + '.txt'), 'w').write(text)
    ok, why = verdict(name, code, text)
    # (a pass kept with what it rested on, a failure's pass let go: the look review keeps its own, in main)
    if name != 'look' and RUN['env'] is not None:
        if ok: record(name, RUN['start'], RUN['env'])
        else: unkeep(name)
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

def new_places():
    """The places in places.js with a frame the last look review did not shoot (none when there is no review to go by)."""
    try: shot = set(json.load(open(os.path.join(OUT, 'look', 'review.json'))).get('frames') or {})
    except Exception: return []
    js = ("const P=require(%r);console.log(JSON.stringify(P.SHOTS.map(s=>[s.id,s.lab?[s.id]:s.at.map(m=>P.frameName(s.id,m))])))"
          % path('uiwork', 'look', 'places.js'))
    S = json.loads(subprocess.run(['node', '-e', js], capture_output=True, text=True, check=True).stdout)
    return [i for i, names in S if any(n not in shot for n in names)]

def places_check(ids, no_cost, t0):
    """The places' check (since Nov 8): the look review of the places named, or of the new ones, alone; never a pass."""
    if not ids:
        ids = new_places()
        if not ids:
            print('places: every place in places.js has its frames in the last look review: name the places to look at'
                  ' (python3 test.py places gondola officeback)')
            return 1
        print('places: the places with a frame the last look review did not shoot: ' + ', '.join(ids))
    ids = [p for a in ids for p in a.split(',') if p]
    cmd = [sys.executable, path('uiwork', 'look', 'review.py'), os.path.join(OUT, 'look_places'), '--places', ','.join(ids)] + (['--no-cost'] if no_cost else [])
    print('places: %s, %s' % (', '.join(ids), 'not timed (--no-cost)' if no_cost else 'timed by turns against the fall (alone: it times the drawing)'), flush=True)
    try:
        p = subprocess.run(cmd, cwd=HERE, capture_output=True, text=True, timeout=3600)
        code, text = p.returncode, p.stdout + ('\n' + p.stderr if p.stderr.strip() else '')
    except subprocess.TimeoutExpired:
        code, text = -999, 'timed out'
    open(os.path.join(OUT, 'places.txt'), 'w').write(text)
    print(text.rstrip())
    print('places: %s in %.1f min (test_out/places.txt; its pictures in test_out/look_places)' % (
        'clean' if code == 0 else 'FAIL', (time.time() - t0) / 60))
    return 0 if code == 0 else 1

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    flags = [a for a in sys.argv[1:] if a.startswith('--')]
    os.makedirs(OUT, exist_ok=True)
    every = '--all' in flags
    if '--export' in flags:
        return export()
    if '--status' in flags:
        # (the page suites and the review rest on the page: built from today's sources first)
        b = subprocess.run([sys.executable, path('build.py')], cwd=HERE, capture_output=True, text=True)
        if b.returncode: print('the build failed:\n' + b.stderr[-2000:]); return 1
        env = env_key()
        github_take(env)
        P = passes()
        now = digests(all_keys(P))
        why = {n: stale(n, P, now, env) for n in ORDER + ['perf'] if n != 'live'}
        due = [n for n in why if why[n]]
        if due:
            print('to run again, %d of %d suites:' % (len(due), len(why)))
            for n in due: print('  %-11s %s' % (n, why[n]))
        else: print("every suite's last pass stands (%d suites; live checks the published page whenever it runs)" % len(why))
        by = sorted(set(P['suites'][n].get('by') for n in why if not why[n] and P['suites'].get(n, {}).get('by')))
        if by: print('  (%d of them made by %s)' % (sum(1 for n in why if not why[n] and P['suites'].get(n, {}).get('by')), ', '.join(by)))
        lk, lwhy = look_stale(P, now, env)
        print('the look review: ' + ('its last pass stands' if not lk else '%s to do (%s)' % (LOOK_DO[lk], lwhy)))
        return 1 if due or lk else 0
    if '--list' in flags:
        for n in ORDER + ['perf', 'look']:
            c, k, what = SUITES[n]; print('  %-11s %-6s %s' % (n, k, what))
        return 0
    mode = args[0] if args and args[0] in ('quick', 'affected', 'full', 'perf', 'look', 'places', 'github') else ('named' if args else 'quick')
    t0 = time.time()
    if not static(): print('stopped: the static check found problems'); return 1
    if mode == 'github':
        if '--wait' in flags:
            got = github_take(env_key(), wait=True)
            return 0 if got else 1
        return push_candidate()
    if mode == 'places':
        return places_check(args[1:], '--no-cost' in flags, t0)
    # (what every input holds as the run begins, and the machine's tools: what a pass is kept with)
    P = passes()
    RUN['env'] = env_key()
    if mode == 'full' and not every and '--here' not in flags:
        # (since Nov 8) the passes GitHub made on the last candidate, where they rest on what is here
        if github_take(RUN['env'], wait=True): P = passes()
    RUN['start'] = digests(all_keys(P))
    if mode == 'look':
        lk, lwhy = ('all', 'asked for all') if every else look_stale(P, RUN['start'], RUN['env'])
        if not lk:
            print('look: its last pass stands, nothing to run (--all runs it whatever)')
            return 0
        print('look: %s (%s)' % (LOOK_DO[lk], lwhy), flush=True)
        if lk == 'all':
            # (its pictures are about to be taken again: what the last run left stands no more, however this one ends)
            P['look'] = P['look_shot'] = None
            save_passes(P)
        began = time.time()
        r = run_one('look', extra={'all': (), 'judge': ('--analyse',), 'time': ('--retime',)}[lk])
        show(r)
        P = passes()
        now = digests(look_keys())
        # (kept only when nothing it rests on changed while it ran)
        steady = all(RUN['start'].get(k) == v for k, v in now.items())
        if r['ok']:
            P['look'] = {'inputs': now, 'env': RUN['env'], 'when': time.time()} if steady else None
            P['look_shot'] = None
        else:
            P['look'] = None
            # a review that took and judged its pictures (its review.json written by this run) leaves them to the next (since Nov 8);
            # one that stopped at a step leaves what was there
            rj = os.path.join(OUT, 'look', 'review.json')
            try: R = json.load(open(rj)) if os.path.getmtime(rj) >= began else None
            except Exception: R = None
            if R is not None:
                P['look_shot'] = {'inputs': now, 'env': RUN['env'], 'when': time.time(),
                                  'failed': sorted(set(v['rule'] for v in R.get('fails') or []))} if steady else None
        save_passes(P)
        print('look: %s in %.1f min' % ('PASS' if r['ok'] else 'FAIL', (time.time() - t0) / 60))
        if not r['ok'] and P.get('look_shot'):
            nk, nwhy = look_stale(P, now, RUN['env'])
            if nk and nk != 'all': print('look: the next run: %s (%s)' % (LOOK_DO[nk], nwhy))
        return 0 if r['ok'] else 1
    kept = []
    if mode == 'perf':
        names = [mode]
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
    elif every:
        names = list(ORDER)
    else:
        # every suite whose last pass no longer stands, and why
        why = {n: stale(n, P, RUN['start'], RUN['env']) for n in ORDER}
        names = [n for n in ORDER if why[n]]
        kept = [n for n in ORDER if not why[n]]
        if kept: print('passes that stand, not run again (%d): %s' % (len(kept), ', '.join(kept)))
        for n in names: print('  %-11s %s' % (n, why[n]))
    if mode != 'perf': names = [n for n in names if n != 'perf']
    names = [n for n in ORDER if n in names] + [n for n in names if n not in ORDER]
    print('%s: %s' % (mode, ', '.join(names) or 'nothing to run'), flush=True)
    res = run_many(names)
    timing = '--no-timing' not in flags
    if mode == 'full' and not timing:
        print('timing checks: not run (--no-timing: their limits are set for the machine the game is made on)')
    elif mode == 'full' and all(r['ok'] for r in res):
        pw = 'asked for all' if every else stale('perf', P, RUN['start'], RUN['env'])
        if pw:
            print('timing checks, alone (%s):' % pw)
            r = run_one('perf'); res.append(r); show(r)
        else:
            print('timing checks: their last pass stands'); kept.append('perf')
    ok = all(r['ok'] for r in res)
    if ok and mode == 'full' and timing:
        # (every suite's pass stands now: the sources they stand with, which "affected" reads)
        json.dump(dict(digest(tracked()), _when=time.time()), open(os.path.join(OUT, 'last_pass.json'), 'w'), indent=0)
    print('%s: %s in %.1f min (%d suites run%s)' % (mode, 'PASS' if ok else 'FAIL: ' + ', '.join(r['name'] for r in res if not r['ok']),
                                                   (time.time() - t0) / 60, len(res), ', %d passes standing' % len(kept) if kept else ''))
    return 0 if ok else 1

if __name__ == '__main__':
    sys.exit(main())
