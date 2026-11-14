#!/usr/bin/env python3
"""The levels of detail, read from detail.js's stills (since Nov 14; the drawing's rule 13).

    python3 uiwork/look/detail.py <folder>

For each still, and each box in it (the people, a few things, a wall, the roof, the floor, the Pit's far wall):
  busy   the mean step in lightness between neighbouring pixels, times 100
  loud   the 95th percentile of those steps, times 100: how hard its marks are
and for each view the pixels a unit it shows, the level the figure kit draws people at there (game size under 2.4, close to 5,
portrait over) and how far the place is enlarged from the scale it was painted at. A box is a rectangle round the thing, so it
holds some of what is behind it: the numbers place things in an order, they are not limits to the last digit. Nothing fails here.
"""
import glob
import json
import os
import sys

import numpy as np
from PIL import Image


def steps(path):
    a = np.asarray(Image.open(path).convert('RGB'), dtype=np.float32) / 255
    L = .2126 * a[..., 0] + .7152 * a[..., 1] + .0722 * a[..., 2]
    gx = np.zeros_like(L)
    gy = np.zeros_like(L)
    gx[:, 1:-1] = (L[:, 2:] - L[:, :-2]) / 2
    gy[1:-1, :] = (L[2:, :] - L[:-2, :]) / 2
    return np.hypot(gx, gy)


def main():
    folder = sys.argv[1] if len(sys.argv) > 1 else '.'
    for jf in sorted(glob.glob(os.path.join(folder, '*.json'))):
        J = json.load(open(jf))
        tag = os.path.basename(jf)[:-5]
        for v in J['views']:
            g = steps(os.path.join(folder, tag + '_' + v['name'] + '.png'))
            H, W = g.shape
            level = 'game size' if v['ppu'] < 2.4 else 'close' if v['ppu'] < 5 else 'portrait'
            big = v['ppu'] / v['painted']
            print('%s %s: %g across, %.2f pixels a unit, people at %s, the place %s' % (
                tag, v['name'], v['across'], v['ppu'], level, 'enlarged %.2f times' % big if big > 1.02 else 'at its painted size or under'))
            rows = []
            for n, b in v['boxes'].items():
                x0, y0, x1, y1 = max(0, b[0]), max(0, b[1]), min(W, b[2]), min(H, b[3])
                if x1 - x0 < 8 or y1 - y0 < 8:
                    continue
                G = g[y0:y1, x0:x1]
                rows.append((float(np.percentile(G, 95)) * 100, float(G.mean()) * 100, n, n in v['people']))
            for loud, busy, n, who in sorted(rows, reverse=True):
                print('    %-12s busy %5.2f  loud %5.2f%s' % (n, busy, loud, '  (a person)' if who else ''))


if __name__ == '__main__':
    main()
