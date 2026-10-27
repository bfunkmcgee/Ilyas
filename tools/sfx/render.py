# Renders the prologue's sounds (The Long Night Sound List, list.json) from their recipes.
#   python3 render.py <out dir> [key ...] [--web] [--jobs N]
# Writes <out>/wav/<key>_<NN>.wav, the masters (48 kHz 24-bit; one-shots peak at -1 dBTP; loops one seamless period at
# -20 LUFS, peaks under -3 dBTP). With --web it also packs each key into <out>/web/<key>.mp3 (its takes one after another,
# a loop with a margin of itself on each side) and writes <out>/web/manifest.json: where each take sits, or the loop's window.
import json, os, subprocess, sys, zlib
from multiprocessing import Pool
import numpy as np
import soundfile as sf
from dsp import SR, N, true_peak, norm_peak, norm_loop, limit_loop, lufs, fade
from reg import REG

HERE = os.path.dirname(os.path.abspath(__file__))
for _m in ('rec_fights', 'rec_rooms', 'rec_open', 'rec_city', 'rec_line', 'rec_tower', 'rec_roof', 'rec_steps'):
    if os.path.exists(os.path.join(HERE, _m + '.py')):
        __import__(_m)          # each registers its recipes
LIST = json.load(open(os.path.join(HERE, 'list.json')))
GAP = 0.1          # silence between packed takes
MARGIN = 0.25          # a loop's margin each side of its window (more than any MP3 decoder's delay)


def trim(y):
    """under 10 ms of silence before the first sound; the tail let ring out to true silence and no further"""
    m = np.abs(y).max(axis=0) if y.ndim == 2 else np.abs(y)
    pk = m.max()
    on = np.nonzero(m > pk * 10 ** (-50 / 20))[0]
    off = np.nonzero(m > pk * 10 ** (-80 / 20))[0]
    a = max(0, on[0] - N(0.003))
    b = min(len(m), off[-1] + N(0.01))
    return fade(y[..., a:b], 0.0, 0.01)


def render_take(key, take):
    R = REG[key]
    rng = np.random.default_rng(zlib.crc32(f'{key}:{take}'.encode()))
    y = np.asarray(R['fn'](rng, take), float)
    if R['kind'] == 'loop':
        assert y.shape[-1] == N(R['L']), (key, y.shape, N(R['L']))
        y = norm_loop(y)
        if lufs(y) < -21 and (key.startswith('amb_') or key == 'fire_loop'):          # a bed held down by a few peaks
            y = limit_loop(y)
        return y
    return norm_peak(trim(y), -1.0)


def _job(a):
    key, take, out = a
    y = render_take(key, take)
    name = f'{key}_{take + 1:02d}'
    sf.write(os.path.join(out, 'wav', name + '.wav'), y.T if y.ndim == 2 else y, SR, subtype='PCM_24')
    return key, take, y.shape[-1] / SR, y.ndim, 20 * np.log10(true_peak(y) + 1e-12), lufs(y)


def pack(key, out):
    """one web file per key: its takes in a row with a gap between (or a loop with its margins), and where each sits"""
    R = REG[key]
    ys = [sf.read(os.path.join(out, 'wav', f'{key}_{k + 1:02d}.wav'), always_2d=True)[0].T for k in range(R['takes'])]
    ch = ys[0].shape[0]
    ent = dict(ch=ch)
    if R['kind'] == 'loop':
        y = ys[0]
        m = N(MARGIN)
        buf = np.concatenate([y[:, -m:], y, y[:, :m]], axis=1)
        ent['loop'] = [MARGIN, MARGIN + R['L']]
        ent['lufs'] = round(lufs(y), 1)
    else:
        parts, takes, at = [], [], 0
        for y in ys:
            takes.append([round(at / SR, 5), round(y.shape[1] / SR, 5), round(lufs(y), 1)])
            parts += [y, np.zeros((ch, N(GAP)))]
            at += y.shape[1] + N(GAP)
        buf = np.concatenate(parts[:-1], axis=1)
        ent['takes'] = takes
    wav = os.path.join(out, 'web', key + '.wav')
    sf.write(wav, buf.T, SR, subtype='FLOAT')
    rate = '160k' if ch == 2 and R['kind'] != 'loop' else '128k' if ch == 2 else '112k'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-codec:a', 'libmp3lame', '-b:a', rate, '-ar', str(SR),
                    os.path.join(out, 'web', key + '.mp3')], check=True)
    os.remove(wav)
    ent['bytes'] = os.path.getsize(os.path.join(out, 'web', key + '.mp3'))
    return ent


def main():
    args = sys.argv[1:]
    web = '--web' in args
    jobs = 2
    if '--jobs' in args:
        jobs = int(args[args.index('--jobs') + 1])
        del args[args.index('--jobs'):args.index('--jobs') + 2]
    args = [a for a in args if a != '--web']
    out = args[0]
    keys = args[1:] or [e['key'] for e in LIST]
    missing = [k for k in keys if k not in REG]
    if missing:
        print('no recipe yet:', ' '.join(missing))
    keys = [k for k in keys if k in REG]
    for d in ('wav', 'web'):
        os.makedirs(os.path.join(out, d), exist_ok=True)
    work = [(k, t, out) for k in keys for t in range(REG[k]['takes'])]
    with Pool(jobs) as p:
        for key, take, dur, nd, pk, lu in p.imap(_job, work):
            print(f'{key}_{take + 1:02d}'.ljust(24), f'{dur:5.2f} s  {"stereo" if nd == 2 else "mono  "}  peak {pk:6.1f} dBTP  {lu:6.1f} LUFS',
                  flush=True)
    if web:
        mpath = os.path.join(out, 'web', 'manifest.json')
        man = json.load(open(mpath)) if os.path.exists(mpath) else {}
        with Pool(jobs) as p:
            for key, ent in zip(keys, p.starmap(pack, [(k, out) for k in keys])):
                man[key] = ent
        man = {e['key']: man[e['key']] for e in LIST if e['key'] in man}
        json.dump(man, open(mpath, 'w'), indent=0, separators=(',', ':'))
        tot = sum(e['bytes'] for e in man.values())
        print(f'web: {len(man)} files, {tot / 1e6:.2f} MB')


if __name__ == '__main__':
    main()
