#!/usr/bin/env python3
"""The cast's voices: Suno takes cut into one file a line (since V98).

  python3 tools/vo/cut.py            cut every take in tools/vo/takes.json into vo/<line>.mp3 and report each line's length
  python3 tools/vo/cut.py --install  the same, then write the lengths into sk_vo.js (VO_LEN), which the game times its lines by
  (--takes DIR reads the takes from another folder, --out DIR writes the lines to another: a trial run)

A take is one Suno speech clip carrying a character's lines for a scene or two, so the voice stays the same from line to line (one
take a character: separate generations come out as different men). takes.json says, for each take: its file (src, beside this
script in takes/), the Suno clip it came from (suno), who speaks, which lines it carries in order (lines: ids in VO_LINES, sk_vo.js;
null for a reading not used, when Suno read a line twice),
the longest pause to keep inside a line (gap, seconds), optionally how long to keep after a line's last word (tail, seconds, when
something follows it closely that is not to be kept), and where Suno's word timings for the clip are kept (align: a file in align/,
{suno, who, title, words: [[start, end, word], ...]}, from the connector's lyrics-alignment; a word with a blank line before its
letters begins the next line of the script). align/ keeps the takes not chosen as well, so a take can be swapped for another. Each line is cut from a little
before its first word to a little after its last, any pause inside it longer than gap taken in to gap, and the take's lines brought to
one loudness together (so a quiet line stays quieter than a loud one), -16 LUFS for the take, its peaks held under -1.5 dBFS: mono,
44.1 kHz MP3. Needs ffmpeg.

Suno's word timings are sometimes wrong (a word put after the pause it came before, two words squeezed into one moment), and a cut
made from a wrong timing loses part of a word. So the take's own sound is checked against the cut: any run of it loud enough to be
talk that no line keeps, and any stretch that begins or ends while he is talking, is reported (a "!" line, with the time). The fix
is in the take's align file: the word's start and end set to where it is said, and the take cut again. Talk left out can also be
sound beyond the script (Suno sometimes adds a cough, a laugh or a word after the last line), which is right to leave out; a listen
there tells which, and the take's skip in takes.json ([[start, end, what it is], ...]) names it so the check passes over it.
"""
import array, json, math, os, re, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
OUT = os.path.join(ROOT, 'vo')
LEAD, TAIL, EDGE = .09, .26, .012   # before the first word, after the last, the fade at each join
TARGET, PEAK = -16.0, -1.5          # the take's loudness (LUFS) and its peaks (dBFS)
HOP, TALK, RUN = .01, 18.0, .06     # the check's level frames (s); talk: within TALK dB of the take's speaking level; the shortest run that counts (s)

def run(args):
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode != 0: raise SystemExit('ffmpeg failed: ' + ' '.join(args) + '\n' + r.stderr[-2000:])
    return r

def words_of(take):
    return json.load(open(os.path.join(HERE, take['align']), encoding='utf-8'))['words']

def lines_of(take):
    """The take's words split into its lines: a word with a blank line before its letters starts the next one (one that ends in a
    blank line only closes its own)."""
    out, cur = [], []
    for s, e, w in words_of(take):
        if '\n\n' in w and w.rsplit('\n\n', 1)[-1].strip(' \n.,!?;:') and cur:
            out.append(cur); cur = []
        if w.strip(' \n.,!?;:'): cur.append((float(s), float(e)))
        elif cur: cur[-1] = (cur[-1][0], max(cur[-1][1], float(e)))
    if cur: out.append(cur)
    return out

def spans(words, gap, lo, hi, tail=TAIL):
    """The stretches of the take a line keeps: from before its first word to after its last, a long pause inside taken in."""
    a = max(lo, words[0][0] - LEAD); keep = []
    for (s0, e0), (s1, e1) in zip(words, words[1:]):
        if s1 - e0 > gap:
            keep.append((a, e0 + gap * .55)); a = s1 - gap * .45
    keep.append((a, min(hi, words[-1][1] + tail)))
    return keep

def loudness(path):
    r = run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'])
    I = re.findall(r'I:\s+(-?[\d.]+) LUFS', r.stderr); P = re.findall(r'Peak:\s+(-?[\d.]+) dBFS', r.stderr)
    return float(I[-1]) if I else None, float(P[-1]) if P else None

def levels(path, rate=16000):
    """The take's level frame by frame (HOP seconds each), in dB below full scale, each frame the loudest of it and its neighbours."""
    r = subprocess.run(['ffmpeg', '-hide_banner', '-v', 'error', '-i', path, '-vn', '-ac', '1', '-ar', str(rate), '-f', 's16le', '-'],
                       capture_output=True)
    if r.returncode != 0: raise SystemExit('ffmpeg failed reading ' + path + '\n' + r.stderr.decode(errors='replace')[-2000:])
    a = array.array('h'); a.frombytes(r.stdout[:len(r.stdout) // 2 * 2])
    if sys.byteorder == 'big': a.byteswap()
    n = int(rate * HOP)
    lv = [10 * math.log10(sum(x * x for x in a[i:i + n]) / n / 1073741824.0 + 1e-12) for i in range(0, len(a) - n + 1, n)]
    return [max(lv[max(0, i - 1):i + 2]) for i in range(len(lv))]

def check(src, cuts, skip=()):
    """What the cut gets wrong, by the take's own sound: talk that no line keeps, and stretches that begin or end in talk. skip:
    stretches of the take known to be beyond its script ([start, end, what it is]), passed over."""
    lv = levels(src)
    if not lv: return ['the take has no sound']
    top = sorted(lv)[int(len(lv) * .95)]
    talk = [x > top - TALK for x in lv]
    kept = bytearray(len(lv))
    for a, b in [s for sp in cuts.values() for s in sp] + [(s[0], s[1]) for s in skip]:
        for i in range(max(0, int(a / HOP)), min(len(lv), int(math.ceil(b / HOP)))): kept[i] = 1
    def where(t):
        ids = list(cuts)
        for k, lid in enumerate(ids):
            a, b = cuts[lid][0][0], cuts[lid][-1][1]
            if a <= t <= b: return 'inside ' + lid
            if t < a: return ('before ' + lid) if not k else ('between %s and %s' % (ids[k - 1], lid))
        return 'after ' + ids[-1]
    out, i = [], 0
    while i < len(lv):
        if talk[i] and not kept[i]:
            j = i
            while j < len(lv) and talk[j] and not kept[j]: j += 1
            if (j - i) * HOP >= RUN:
                out.append('talk left out at %.2f-%.2f s (%+.0f dB), %s' % (i * HOP, j * HOP, max(lv[i:j]) - top, where(i * HOP)))
            i = j
        else: i += 1
    for lid, sp in cuts.items():
        for k, (a, b) in enumerate(sp):
            for t, edge in ((a, 'begins'), (b, 'ends')):
                f = min(len(lv) - 1, max(0, int(round(t / HOP))))
                if not talk[f]: continue
                # at the take's own start or end the clip itself is cut there, which no timing can mend: a note, not a warning
                if f == 0 or f == len(lv) - 1: out.append('note: %s %s with the take, which %s partway into a word' % (lid, edge, edge))
                else: out.append('%s: stretch %d %s in talk at %.2f s' % (lid, k + 1, edge, t))
    return out

def cut_take(take, tmp):
    src = os.path.join(HERE, take['src'])
    if not os.path.exists(src): raise SystemExit('missing take: ' + take['src'])
    L = lines_of(take)
    if len(L) != len(take['lines']):
        raise SystemExit('%s: %d lines in the words, %d named' % (take['src'], len(L), len(take['lines'])))
    raw, unused = [], []
    for i, (lid, words) in enumerate(zip(take['lines'], L)):
        # a reading not used (null in lines: Suno read the line twice, say): not cut, and the check passes over it
        if not lid: unused.append((words[0][0] - LEAD, words[-1][1] + TAIL, 'a reading not used')); continue
        lo = (L[i - 1][-1][1] + .02) if i else 0.0
        hi = (L[i + 1][0][0] - .05) if i + 1 < len(L) else 1e9
        sp = spans(words, take.get('gap', .6), lo, hi, take.get('tail', TAIL))
        # each stretch faded a breath at its edges, then joined
        parts = ''.join('[0:a]atrim=%.3f:%.3f,asetpts=PTS-STARTPTS,afade=t=in:d=%.3f,areverse,afade=t=in:d=%.3f,areverse[s%d];'
                        % (a, b, EDGE, EDGE * 2, j) for j, (a, b) in enumerate(sp))
        cat = ''.join('[s%d]' % j for j in range(len(sp))) + 'concat=n=%d:v=0:a=1,highpass=f=70,aformat=channel_layouts=mono[o]' % len(sp)
        f = os.path.join(tmp, lid + '.wav')
        run(['ffmpeg', '-hide_banner', '-y', '-i', src, '-filter_complex', parts + cat, '-map', '[o]', '-ar', '44100', f])
        raw.append((lid, f, sp))
    # the take's loudness, all its lines together, and one gain for every line of it
    lst = os.path.join(tmp, 'all.txt')
    with open(lst, 'w') as fh: fh.write(''.join("file '%s'\n" % f for _, f, _ in raw))
    allf = os.path.join(tmp, 'all.wav'); run(['ffmpeg', '-hide_banner', '-y', '-f', 'concat', '-safe', '0', '-i', lst, allf])
    I, P = loudness(allf)
    g = TARGET - I
    out = {}
    for lid, f, sp in raw:
        dst = os.path.join(OUT, lid + '.mp3')
        run(['ffmpeg', '-hide_banner', '-y', '-i', f, '-af', 'volume=%.2fdB,alimiter=limit=%.4f:attack=2:release=40:level=disabled' % (g, 10 ** (PEAK / 20)),
             '-ar', '44100', '-ac', '1', '-c:a', 'libmp3lame', '-q:a', '4', dst])
        d = float(run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', dst]).stdout.strip())
        out[lid] = round(d, 2)
        print('  %-10s %5.2f s  (%d stretch%s)' % (lid, d, len(sp), '' if len(sp) == 1 else 'es'))
    print('  take %s: %.1f LUFS, brought to %.1f (%+.1f dB)' % (take['src'], I, TARGET, g))
    found = check(src, {lid: sp for lid, _, sp in raw}, list(take.get('skip', [])) + unused)
    warn = [w for w in found if not w.startswith('note: ')]
    for w in found: print(('  - ' + w[6:]) if w.startswith('note: ') else ('  ! ' + w))
    return out, warn

def install(lens):
    p = os.path.join(ROOT, 'sk_vo.js'); s = open(p, encoding='utf-8').read()
    new = '/*VO_LEN*/' + json.dumps(dict(sorted(lens.items())), separators=(',', ':')) + '/*VO_LEN_END*/'
    s2, n = re.subn(r'/\*VO_LEN\*/.*?/\*VO_LEN_END\*/', lambda m: new, s, flags=re.S)
    if n != 1: raise SystemExit('sk_vo.js: no VO_LEN to write')
    open(p, 'w', encoding='utf-8').write(s2); print('wrote the lengths into sk_vo.js')

def main():
    global OUT
    spec = json.load(open(os.path.join(HERE, 'takes.json'), encoding='utf-8'))
    # (--takes DIR: the takes' files from another folder; --out DIR: the lines into another folder, for a trial)
    a = sys.argv
    if '--takes' in a:
        d = os.path.abspath(a[a.index('--takes') + 1])
        for t in spec['takes']: t['src'] = os.path.join(d, os.path.basename(t['src']))
    if '--out' in a: OUT = os.path.abspath(a[a.index('--out') + 1])
    os.makedirs(OUT, exist_ok=True); lens = {}; warn = 0
    with tempfile.TemporaryDirectory() as tmp:
        for take in spec['takes']:
            got, w = cut_take(take, tmp); lens.update(got); warn += len(w)
    if warn: print('%d warning%s. Talk left out is either a word whose timing in the align file is off (set its start and end to where it '
                   'is said, and cut again) or sound the take has beyond its script, a laugh or a word Suno added, which is right to leave '
                   'out: listen there to tell which.' % (warn, '' if warn == 1 else 's'))
    if '--install' in sys.argv: install(lens)

if __name__ == '__main__':
    main()
