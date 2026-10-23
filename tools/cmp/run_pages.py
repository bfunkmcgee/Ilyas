#!/usr/bin/env python3
# the page suites with every check timed, drawing every frame or one in N: python3 tools/cmp/run_pages.py <every> <outdir> [suites]
import os, sys, subprocess, threading, time
HERE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
EV, OUT = sys.argv[1], sys.argv[2]
NAMES = sys.argv[3].split(',') if len(sys.argv) > 3 else ['lookpage', 'castpage', 'armspage', 'finalepage', 'arcpage', 'hudpage', 'lightpage']
FILE = {'lookpage': 'sk_look_page.js', 'castpage': 'sk_cast_page.js', 'armspage': 'sk_arms_page.js', 'arcpage': 'sk_arc_page.js',
        'finalepage': 'sk_v12finale_page.js', 'hudpage': 'sk_hud_page.js', 'lightpage': 'sk_light_page.js'}
os.makedirs(os.path.join(HERE, OUT), exist_ok=True)
q, lock = list(NAMES), threading.Lock()
def lane():
    while True:
        with lock:
            if not q: return
            n = q.pop(0)
        t0 = time.time()
        env = dict(os.environ, SK_TIMING='1')
        if EV != 'default': env['SK_DRAW_EVERY'] = EV   # (default: each suite as it is set, as test.py runs it)
        try:
            p = subprocess.run(['node', FILE[n]], cwd=HERE, capture_output=True, text=True, env=env, timeout=2400)
            text = p.stdout + p.stderr
        except subprocess.TimeoutExpired:
            text = 'TIMEOUT'
        open(os.path.join(HERE, OUT, n + '.txt'), 'w').write(text + '\nsecs %.1f\n' % (time.time() - t0))
        with lock: print('%s %.1fs' % (n, time.time() - t0), flush=True)
ts = [threading.Thread(target=lane) for _ in range(int(os.environ.get('LANES', '2')))]
for t in ts: t.start()
for t in ts: t.join()
