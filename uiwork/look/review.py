#!/usr/bin/env python3
"""The look review: the style guide's and the drawing guide's measured rules over every place the game draws, and a verdict on
every frame (phase 4 of the visual director, since V88). `python3 test.py look` runs it alone and records its pass.

    python3 uiwork/look/review.py [out folder] [--judge] [--no-desk] [--keep-lines "why"]

It runs (about 20 minutes, and nothing else may load the machine: it times the drawing):
  1. the look audit on a 412x714 phone held upright (audit.js), alone, for the costs
  2. the same audit at 1280x800 (rules 1, 7 and 8 on a wide screen), beside the line widths (lines.js, then lines.py)
  3. the colours and the picture faults of the phone's frames (hues.py, faults.py)
  4. the phone's frames that cost near the fall's dearest frame or more, timed again by turns against the fall (costs.js)
and fails a frame for each rule it breaks:
  black    style rule 1: flat black (the audit's empty) 5% or less, in the action and in the scenes
  outline  style rule 8: two thirds of Ilyas's outline or more reads (the audit judges; a hidden or struck outline is not judged)
  ground   style rule 8: the ground round him .2 or more
  cost     style rule 6: no frame costs more than the fall's dearest, timed by turns (5% over is the timing's own wander)
  gold     style rule 3: gold under 1% of the lit picture in every frame of Act I (a frame under 2% lit says nothing of colour)
  rooms    style rule 3: across the lobby's frames, and across the office's, gold at least matches sodium orange
  words    style rule 7: two words at most over the fighters
  flat     drawing rule 5: no flat lit patch of 2% of the picture or more
  repeat   drawing rule 6: no band that repeats across the picture, but where a world's rhythm is its style
  thin     drawing rule 2: no line under 1.5 units (1 for a highlight on a lit edge); faint lines (alpha under .2) aside
  errors   no page errors, and every moment reached
What was judged and kept is in kept.json (frames and places, each with its reason) and kept_lines.json (the line widths kept, each
with its reason); a kept entry no frame needs any more is named, so the lists stay true. Writes <out>/review.json (every frame's
numbers, pictures and verdicts: the lookbook reads it) and prints the fails, each on a line starting FAIL; exit status 1 on any.
--judge judges what is already in the folder without running anything again; --no-desk leaves out the wide screen (not a full
review); --keep-lines "why" adds the lines the run finds under the rule to kept_lines.json with that reason (once judged).
"""
import json, os, re, subprocess, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
PHONE, DESK = (412, 714, 2), (1280, 800, 1)
BLACK = .05        # rule 1
PIT_GOLD = 1.0     # rule 3, percent of the lit picture
LIT_MIN = 2.0      # percent lit under which a frame says nothing about colour
WORDS = 2          # rule 7
COST_OVER = 1.05   # rule 6: the fall's dearest frame, and the timing's wander by turns
SUSPECT = .85      # a phone frame at this share of the fall's dearest or more is timed again by turns
FAINT = .2         # drawing rule 2: fainter lines are tone, not marks


def places():
    """The shots, Act I and the family's rooms, from places.js (the one list the tools share)."""
    js = "const P=require(%r);console.log(JSON.stringify({SHOTS:P.SHOTS,ACT1:P.ACT1,ROOMS:P.ROOMS}))" % os.path.join(HERE, 'places.js')
    return json.loads(subprocess.run(['node', '-e', js], capture_output=True, text=True, check=True).stdout)


def frame_name(s):
    m = s.get('moment')
    return s['id'] + '_' + m if m and m != 'fight' else s['id']


def size_key(sz):
    return '%dx%d' % sz[:2]


def run(label, cmd, log, env=None):
    t0 = time.time()
    with open(log, 'w') as f:
        p = subprocess.run(cmd, cwd=REPO, stdout=f, stderr=subprocess.STDOUT, env=dict(os.environ, **(env or {})))
    print('  %-34s %5.0fs%s' % (label, time.time() - t0, '' if p.returncode == 0 else '  (exit %d: %s)' % (p.returncode, log)), flush=True)
    return p.returncode == 0


def together(jobs):
    """Two jobs at once (the machine's two cores): [(label, cmd, log, env)]"""
    t0, ps = time.time(), []
    for label, cmd, log, env in jobs:
        f = open(log, 'w')
        ps.append((label, subprocess.Popen(cmd, cwd=REPO, stdout=f, stderr=subprocess.STDOUT, env=dict(os.environ, **(env or {}))), f, log))
    ok = True
    for label, p, f, log in ps:
        code = p.wait(); f.close()
        print('  %-34s %5.0fs%s' % (label, time.time() - t0, '' if code == 0 else '  (exit %d: %s)' % (code, log)), flush=True)
        ok = ok and code == 0
    return ok


def norm(src):
    return re.sub(r'\s+', ' ', src or '').strip()


class Review:
    def __init__(self, kept):
        self.kept, self.used, self.fails, self.notes = kept, set(), [], []

    def keep(self, rule, *names):
        """The kept entry for this rule under any of the names (a frame at a size, the frame, its place), or None."""
        K = self.kept.get(rule, {})
        for n in names:
            if n in K:
                self.used.add((rule, n))
                return K[n]
        return None

    def fail(self, name, size, rule, what):
        self.fails.append({'frame': name, 'size': size, 'rule': rule, 'what': what})


def judge(out, P, kept, kept_lines, desk=True):
    R = Review(kept)
    act1, rooms = set(P['ACT1']), P['ROOMS']
    sizes = [('phone', PHONE)] + ([('desk', DESK)] if desk else [])
    audits = {k: json.load(open(os.path.join(out, k, 'audit.json'))) for k, _ in sizes}
    frames = {}
    # every frame's numbers and pictures, by name
    for k, sz in sizes:
        for s in audits[k]['shots']:
            n = frame_name(s)
            F = frames.setdefault(n, {'id': s['id'], 'moment': s.get('moment'), 'verdicts': []})
            if s.get('gone'):
                F[k] = {'gone': True}
                continue
            base = os.path.join(k, s['file'][:-4])
            F[k] = {'scene': s.get('scene'), 'step': s.get('step'), 'phase': s.get('phase'), 't': s.get('t'), 'stats': s['stats'],
                    'hero': s.get('hero'), 'ms': s.get('ms'), 'words': s.get('words'), 'errs': s.get('errs') or [],
                    'pictures': {'page': os.path.join(k, s['file']), 'canvas': base + '_canvas.png',
                                 'hero': base + '_hero.png' if os.path.exists(os.path.join(out, base + '_hero.png')) else None}}
    for name, F in frames.items():
        for k, sz in sizes:
            f, sk = F.get(k), size_key(sz)
            if f is None:
                continue
            at = (name + '@' + sk, name, F['id'])
            if f.get('gone'):
                R.fail(name, sk, 'errors', 'the stage ended before this moment')
                continue
            for e in f['errs']:
                R.fail(name, sk, 'errors', 'page error: ' + e[:160])
            e = f['stats']['empty']
            if e > BLACK and R.keep('black', *at) is None:
                R.fail(name, sk, 'black', '%.0f%% flat black (5%% at most)' % (e * 100))
            h = f.get('hero') or {}
            for why in h.get('fails') or []:
                if R.keep(why, *at) is None:
                    R.fail(name, sk, why, ('%.0f%% of his outline reads (two thirds at least)' % (h['read'] * 100)) if why == 'outline'
                           else 'the ground round him at %.2f (.2 at least)' % h['Lb'])
            w = f.get('words') or {}
            if (w.get('n') or 0) > WORDS and R.keep('words', *at) is None:
                R.fail(name, sk, 'words', '%d words over the fighters (two at most)' % w['n'])
    ph = size_key(PHONE)
    # the colours (rule 3), on the phone
    hues = {(h['id'], h['moment']): h for h in json.load(open(os.path.join(out, 'phone', 'hues.json')))}
    for (i, m), h in hues.items():
        n = frame_name({'id': i, 'moment': m})
        if n in frames:
            frames[n]['phone']['hues'] = h
        if i in act1 and h['lit'] >= LIT_MIN and h['gold'] >= PIT_GOLD and R.keep('gold', n + '@' + ph, n, i) is None:
            R.fail(n, ph, 'gold', '%.1f%% gold in the lit picture of Act I (under 1%%)' % h['gold'])
    place = {}
    for r in rooms:
        H = [h for (i, m), h in hues.items() if i == r and h['lit'] >= LIT_MIN]
        lit = sum(h['lit'] for h in H) or 1
        g, so = sum(h['gold'] * h['lit'] for h in H) / lit, sum(h['sodium'] * h['lit'] for h in H) / lit
        place[r] = {'gold': round(g, 1), 'sodium': round(so, 1), 'frames': len(H)}
        if (not H or g < so) and R.keep('rooms', r) is None:
            R.fail(r, ph, 'rooms', 'gold %.1f%% against sodium %.1f%% across its frames (gold at least matches)' % (g, so))
    # the picture faults (drawing rules 5 and 6), on the phone
    for x in json.load(open(os.path.join(out, 'phone', 'faults.json'))):
        n = frame_name(x)
        if n in frames:
            frames[n]['phone']['faults'] = {'flats': x['flats'], 'repeats': x['repeats']}
        for f in x['flats']:
            k = R.keep('flat', n + '@' + ph, n, x['id'])
            if k is None or f['share'] > k.get('max', 0) or f['y'][1] > k.get('above', 1):
                R.fail(n, ph, 'flat', 'a flat lit patch over %.1f%% of the picture (%s, rows %.2f to %.2f)' % (f['share'], f['rgb'], f['y'][0], f['y'][1]))
        if x['repeats'] and R.keep('repeat', n + '@' + ph, n, x['id']) is None:
            R.fail(n, ph, 'repeat', 'bands repeat across it: ' + ', '.join('rows %.2f to %.2f every %d px (r %.2f)' % (g['y'][0], g['y'][1], g['lag'], g['r']) for g in x['repeats']))
    # the cost (rule 6): the phone's frames near the fall's or over, timed again by turns
    cost = {}
    cf = os.path.join(out, 'costs.json')
    if os.path.exists(cf):
        cost = json.load(open(cf))
        for n, c in cost.get('frames', {}).items():
            if n in frames:
                frames[n]['phone']['cost'] = c
            if c['of'] is not None and c['of'] > COST_OVER and R.keep('cost', n + '@' + ph, n, frames.get(n, {}).get('id')) is None:
                R.fail(n, ph, 'cost', '%.1f ms a frame against the fall\'s dearest %.1f, timed by turns (%.0f%%)' % (c['ms'], cost['fall']['ms'], c['of'] * 100))
        for e in cost.get('errors') or []:
            R.fail('costs', ph, 'errors', e[:160])
    # the line widths (drawing rule 2)
    lines = {'assignments': 0, 'meet': 0, 'faint': 0, 'kept': 0}
    sf = os.path.join(out, 'lines', 'sites.json')
    if os.path.exists(sf):
        KL = {(k['file'], norm(k['src'])): k for k in kept_lines}
        seen = set()
        for r in json.load(open(sf)):
            lines['assignments'] += 1
            if r['meets']:
                lines['meet'] += 1
                continue
            if r['alpha'] < FAINT:
                lines['faint'] += 1
                continue
            key = (r['file'], norm(r['source']))
            if key in KL:
                lines['kept'] += 1
                seen.add(key)
                continue
            R.fail('%s:%d' % (r['file'], r['line']), ph, 'thin', '%.2f units (%.1f at least): %s' % (r['med'], r['target'], norm(r['source'])[:110]))
        for fn in sorted(os.listdir(os.path.join(out, 'lines'))):
            if fn.endswith('.json') and fn != 'sites.json':
                for e in json.load(open(os.path.join(out, 'lines', fn))).get('errs') or []:
                    R.fail(fn[:-5], ph, 'errors', 'page error (lines): ' + e[:160])
        lines['stale'] = len(set(KL) - seen)
    for v in R.fails:
        if v['frame'] in frames:
            frames[v['frame']]['verdicts'].append(v)
    stale = sorted('%s %s' % (rule, n) for rule, K in kept.items() if not rule.startswith('_') for n in K
                   if not n.startswith('_') and (rule, n) not in R.used)
    return R, frames, place, cost, lines, stale


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    flags = [a for a in sys.argv[1:] if a.startswith('--')]
    keep_why = None
    if '--keep-lines' in flags:
        i = sys.argv.index('--keep-lines')
        keep_why = sys.argv[i + 1] if i + 1 < len(sys.argv) else None
        if not keep_why:
            sys.exit('--keep-lines needs the reason the lines are kept')
        args = [a for a in args if a != keep_why]
    out = os.path.abspath(args[0] if args else os.path.join(REPO, 'test_out', 'look'))
    page = os.path.abspath(os.environ.get('PAGE', os.path.join(REPO, 'test_page.html')))
    desk = '--no-desk' not in flags
    P = places()
    kept = json.load(open(os.path.join(HERE, 'kept.json')))
    klf = os.path.join(HERE, 'kept_lines.json')
    kept_lines = json.load(open(klf))
    t0 = time.time()
    if '--judge' not in flags:
        os.makedirs(out, exist_ok=True)
        env = {'PAGE': page}
        print('look review of %s into %s' % (os.path.relpath(page, REPO), out), flush=True)
        ok = run('the audit, 412x714 (alone)', ['node', os.path.join(HERE, 'audit.js'), os.path.join(out, 'phone')] + [str(v) for v in PHONE],
                 os.path.join(out, 'phone.log'), env)
        jobs = [('the line widths, 412x714', ['node', os.path.join(HERE, 'lines.js'), os.path.join(out, 'lines')] + [str(v) for v in PHONE],
                 os.path.join(out, 'lines.log'), env)]
        if desk:
            jobs.insert(0, ('the audit, 1280x800', ['node', os.path.join(HERE, 'audit.js'), os.path.join(out, 'desk')] + [str(v) for v in DESK],
                            os.path.join(out, 'desk.log'), dict(env, COSTN='2')))
        ok = together(jobs) and ok
        ok = run('the line widths, read', [sys.executable, os.path.join(HERE, 'lines.py'), page, os.path.join(out, 'lines')],
                 os.path.join(out, 'lines_read.log')) and ok
        ok = run('the colours', [sys.executable, '-W', 'ignore', os.path.join(HERE, 'hues.py'), os.path.join(out, 'phone')], os.path.join(out, 'hues.log')) and ok
        ok = run('the picture faults', [sys.executable, os.path.join(HERE, 'faults.py'), os.path.join(out, 'phone')], os.path.join(out, 'faults.log')) and ok
        # the frames to time again: near the fall's dearest frame or over it in the audit's run
        A = json.load(open(os.path.join(out, 'phone', 'audit.json')))
        line = max([s['ms'] for s in A['shots'] if s['id'] == 'fall' and not s.get('gone')] or [0])
        sus = [frame_name(s) for s in A['shots'] if s['id'] != 'fall' and not s.get('gone') and line and s['ms'] >= SUSPECT * line]
        cf = os.path.join(out, 'costs.json')
        if os.path.exists(cf):
            os.remove(cf)
        if sus:
            ok = run('the cost of %d frames, by turns (alone)' % len(sus), ['node', os.path.join(HERE, 'costs.js'), cf, ','.join(sus)] + [str(v) for v in PHONE],
                     os.path.join(out, 'costs.log'), env) and ok
        if not ok:
            print('FAIL a step of the review did not finish: see its log in %s' % out)
            sys.exit(1)
    R, frames, place, cost, lines, stale = judge(out, P, kept, kept_lines, desk)
    if keep_why:
        S = json.load(open(os.path.join(out, 'lines', 'sites.json')))
        have = {(k['file'], norm(k['src'])) for k in kept_lines}
        add, seen = [], set()
        for r in S:
            key = (r['file'], norm(r['source']))
            if not r['meets'] and r['alpha'] >= FAINT and key not in have and key not in seen:
                seen.add(key)
                add.append({'file': r['file'], 'src': key[1], 'med': r['med'], 'why': keep_why})
        json.dump(kept_lines + add, open(klf, 'w'), indent=0)
        print('kept %d more lines in %s' % (len(add), os.path.relpath(klf, REPO)))
        R, frames, place, cost, lines, stale = judge(out, P, kept, kept_lines + add, desk)
    rules = ['black', 'outline', 'ground', 'cost', 'gold', 'rooms', 'words', 'flat', 'repeat', 'thin', 'errors']
    count = {r: sum(1 for v in R.fails if v['rule'] == r) for r in rules}
    kept_n = {r: sum(1 for (rule, n) in R.used if rule == r) for r in rules}
    res = {'when': time.strftime('%Y-%m-%d %H:%M'), 'page': os.path.relpath(page, REPO), 'sizes': [size_key(PHONE)] + ([size_key(DESK)] if desk else []),
           'pass': not R.fails and desk, 'fails': R.fails, 'count': count, 'kept': kept_n, 'stale': stale, 'rooms': place,
           'fall_ms': cost.get('fall', {}).get('ms'), 'lines': lines, 'frames': frames}
    json.dump(res, open(os.path.join(out, 'review.json'), 'w'), indent=0)
    nf = len(frames)
    print('look review: %d frames at %s, %d line assignments (%d meet the rule, %d faint, %d kept)%s' % (
        nf, ' and '.join(res['sizes']), lines['assignments'], lines['meet'], lines['faint'], lines['kept'],
        ', %.1f min' % ((time.time() - t0) / 60) if '--judge' not in flags else ''))
    if cost.get('fall'):
        print('  the fall\'s dearest frame costs %.1f ms; timed by turns against it: %s' % (cost['fall']['ms'], ', '.join(
            '%s %.1f' % (n, c['ms']) for n, c in sorted(cost['frames'].items(), key=lambda x: -x[1]['ms']))))
    print('  ' + '  '.join('%s %d%s' % (r, count[r], ' (%d kept)' % kept_n[r] if kept_n[r] else '') for r in rules))
    for v in R.fails:
        print('FAIL %-16s %-8s %-7s %s' % (v['frame'], v['size'], v['rule'], v['what']))
    for s in stale:
        print('  kept but no longer needed: %s (kept.json)' % s)
    if lines.get('stale'):
        print('  %d kept lines no longer drawn (kept_lines.json)' % lines['stale'])
    if not desk:
        print('review: partial (no wide screen)')
    print('review: %s' % ('PASS' if res['pass'] else 'FAIL (%d)' % len(R.fails) if R.fails else 'not a full review'))
    return 0 if res['pass'] else 1


if __name__ == '__main__':
    sys.exit(main())
