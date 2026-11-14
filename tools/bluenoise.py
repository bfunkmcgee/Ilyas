#!/usr/bin/env python3
"""The blue-noise tile the look test's dither and grain are laid from (spike/look/look_test.js).

  python3 tools/bluenoise.py            writes spike/look/bluenoise.js (a 128 x 128 tile, one byte a pixel, as base64)
  python3 tools/bluenoise.py --check    makes the tile again and says how it measures, writing nothing

A blue-noise tile is a square of thresholds 0 to 255, each used equally often, laid out so that the pixels under any one threshold
are spread as evenly as they can be: no clumps and no gaps, and so no pattern the eye picks up, where plain random specks clump. It
is made here by the void-and-cluster method (Ulichney, 1993), on a tile that wraps at its edges so that it repeats without a seam:
a few specks are scattered and spread out evenly, then every pixel is ranked by taking the specks away from where they crowd most
and adding them where the tile is emptiest. Seeded: the same tile every time.
"""
import base64, os, sys
import numpy as np

N = 128          # the tile's side, the size of the finish's own grain tile (envx/env_look.js grainPat)
SIGMA = 1.9      # the width of the neighbourhood a speck is felt over, in pixels
SEED = 907
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def kernel():
    """how strongly a speck at the corner is felt at every pixel of the wrapping tile"""
    d = np.minimum(np.arange(N), N - np.arange(N)).astype(np.float64)
    g = np.exp(-d * d / (2 * SIGMA * SIGMA))
    return np.outer(g, g)


def make():
    K = kernel()
    rng = np.random.default_rng(SEED)
    M = N * N
    ones = M // 10

    def felt(y, x):
        return np.roll(np.roll(K, y, axis=0), x, axis=1)

    # the first specks, scattered, then spread: the most crowded one is moved to the emptiest place until that changes nothing
    b = np.zeros(M, dtype=bool)
    b[rng.choice(M, ones, replace=False)] = True
    b = b.reshape(N, N)
    e = np.zeros((N, N))
    for y, x in zip(*np.nonzero(b)):
        e += felt(y, x)
    while True:
        y, x = np.unravel_index(np.argmax(np.where(b, e, -np.inf)), e.shape)
        b[y, x] = False
        e -= felt(y, x)
        v, u = np.unravel_index(np.argmin(np.where(b, np.inf, e)), e.shape)
        b[v, u] = True
        e += felt(v, u)
        if (v, u) == (y, x):
            break
    rank = np.zeros((N, N), dtype=np.int64)
    # the specks ranked from the last to the first: the most crowded goes first
    b1, e1 = b.copy(), e.copy()
    for r in range(ones - 1, -1, -1):
        y, x = np.unravel_index(np.argmax(np.where(b1, e1, -np.inf)), e1.shape)
        b1[y, x] = False
        e1 -= felt(y, x)
        rank[y, x] = r
    # the rest ranked as they are added, each in the emptiest place left
    for r in range(ones, M):
        y, x = np.unravel_index(np.argmin(np.where(b, np.inf, e)), e.shape)
        b[y, x] = True
        e += felt(y, x)
        rank[y, x] = r
    return (rank * 256 // M).astype(np.uint8)


def measure(t):
    """the share of the tile's unevenness that lies in its broad patches (the lowest tenth of its frequencies): what the eye sees
    as blotches. Plain random specks have about 3% there; a blue-noise tile next to none."""
    f = np.abs(np.fft.fft2(t.astype(np.float64) - t.mean())) ** 2
    fy = np.minimum(np.arange(N), N - np.arange(N))
    r = np.hypot(*np.meshgrid(fy, fy))
    low = f[(r > 0) & (r <= N * .1)].sum() / f.sum()
    counts = np.bincount(t.ravel(), minlength=256)
    return low, counts.min(), counts.max()


if __name__ == '__main__':
    t = make()
    low, cmin, cmax = measure(t)
    white = np.random.default_rng(1).integers(0, 256, (N, N)).astype(np.uint8)
    print('tile %d x %d: each threshold used %d to %d times; broad patches %.3f%% of its unevenness (plain random specks: %.2f%%)'
          % (N, N, cmin, cmax, 100 * low, 100 * measure(white)[0]))
    if '--check' not in sys.argv:
        out = os.path.join(HERE, 'spike', 'look', 'bluenoise.js')
        os.makedirs(os.path.dirname(out), exist_ok=True)
        with open(out, 'w', encoding='utf-8') as f:
            f.write('// The look test\'s blue-noise tile: %d x %d thresholds, one byte each, row by row, as base64. Made by tools/bluenoise.py\n'
                    '// (python3 tools/bluenoise.py writes this file again, the same every time). Never edited by hand.\n'
                    'var LOOK_BN = { n: %d, d: \'%s\' };\n' % (N, N, N, base64.b64encode(t.tobytes()).decode('ascii')))
        print('wrote ' + os.path.relpath(out, HERE))
