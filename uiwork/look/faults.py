#!/usr/bin/env python3
"""The drawing guide's two picture faults in each frame of a look audit: flat lit patches and visible repeats.

    python3 uiwork/look/faults.py <audit folder>

Reads <folder>/audit.json and each frame's quarter-size canvas picture (<frame>_canvas.png, written by audit.js) and writes
<folder>/faults.json: for every frame, the flat patches and the repeating bands found.

- A flat patch: a connected region of lit pixels (luma .15 and up) whose value hardly varies (the spread of luma over the 5 by 5
  pixels round each one under .008), covering 2% of the picture or more. A bare gradient sky counts: the guide wants big surfaces
  to carry texture.
- A repeat: a band of rows whose column-by-column light, its slow swell taken out, lines up with itself shifted sideways by 12 to
  100 pixels (about 30 to 250 world units at the closest view) with a correlation of .7 or more, more than once across the picture.
  Repeats where a world's rhythm is its style (the gilt's bays, the underground's ribs) are kept and marked by whoever reads them.
"""
import json
import os
import sys

import numpy as np
from PIL import Image


def luma(path):
    a = np.asarray(Image.open(path).convert('RGB'), dtype=np.float32) / 255
    return .2126 * a[..., 0] + .7152 * a[..., 1] + .0722 * a[..., 2], a


def box(a, r):
    """the mean of a over (2r+1) square windows, edges clamped"""
    p = np.pad(a, r, mode='edge')
    c = p.cumsum(0).cumsum(1)
    c = np.pad(c, ((1, 0), (1, 0)))
    k = 2 * r + 1
    return (c[k:, k:] - c[:-k, k:] - c[k:, :-k] + c[:-k, :-k]) / (k * k)


def flats(L, rgb):
    m = box(L, 2)
    sd = np.sqrt(np.maximum(box(L * L, 2) - m * m, 0))
    mask = (sd < .008) & (L >= .15)
    h, w = L.shape
    seen = np.zeros_like(mask)
    out = []
    for y0 in range(h):
        for x0 in range(w):
            if not mask[y0, x0] or seen[y0, x0]:
                continue
            stack = [(y0, x0)]
            seen[y0, x0] = True
            pts = []
            while stack:
                y, x = stack.pop()
                pts.append((y, x))
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    yy, xx = y + dy, x + dx
                    if 0 <= yy < h and 0 <= xx < w and mask[yy, xx] and not seen[yy, xx]:
                        seen[yy, xx] = True
                        stack.append((yy, xx))
            share = len(pts) / (h * w)
            if share >= .02:
                ys = [p[0] for p in pts]
                xs = [p[1] for p in pts]
                col = rgb[ys, xs].mean(0)
                out.append({'share': round(share * 100, 1), 'box': [min(xs), min(ys), max(xs), max(ys)],
                            'y': [round(min(ys) / h, 2), round(max(ys) / h, 2)], 'luma': round(float(L[ys, xs].mean()), 3),
                            'rgb': '#%02x%02x%02x' % tuple(int(v * 255) for v in col)})
    return out


def repeats(L):
    h, w = L.shape
    bands = []
    for y in range(0, h - 8, 4):
        s = L[y:y + 8].mean(0)
        k = 31
        sm = np.convolve(np.pad(s, k // 2, mode='edge'), np.ones(k) / k, mode='valid')
        d = s - sm
        if d.std() < .012:
            continue
        best, lag = 0, 0
        for t in range(12, min(101, w // 2)):
            a, b = d[:-t], d[t:]
            if a.std() < 1e-6 or b.std() < 1e-6:
                continue
            r = float(np.corrcoef(a, b)[0, 1])
            if r > best:
                best, lag = r, t
        if best >= .7 and w / lag > 2:
            bands.append((y, lag, round(best, 2)))
    # bands next to each other, at about the same period, make one region
    regs = []
    for y, lag, r in bands:
        if regs and y - regs[-1]['y1'] <= 8 and abs(lag - regs[-1]['lag']) <= 4:
            regs[-1]['y1'] = y + 8
            regs[-1]['r'] = max(regs[-1]['r'], r)
        else:
            regs.append({'y0': y, 'y1': y + 8, 'lag': lag, 'r': r})
    return [dict(g, y=[round(g['y0'] / h, 2), round(g['y1'] / h, 2)], tall=round((g['y1'] - g['y0']) / h * 100, 1))
            for g in regs if g['y1'] - g['y0'] >= 12]


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    folder = sys.argv[1]
    audit = json.load(open(os.path.join(folder, 'audit.json')))
    res = []
    for s in audit['shots']:
        if s.get('gone') or not s.get('file'):
            continue
        pic = os.path.join(folder, s['file'][:-4] + '_canvas.png')
        if not os.path.exists(pic):
            continue
        L, rgb = luma(pic)
        f, r = flats(L, rgb), repeats(L)
        res.append({'id': s['id'], 'moment': s.get('moment'), 'flats': f, 'repeats': r})
        print('%-12s %-6s flat %s  repeat %s' % (s['id'], s.get('moment'),
              ', '.join('%.1f%% y%.2f-%.2f %s' % (x['share'], x['y'][0], x['y'][1], x['rgb']) for x in f) or '-',
              ', '.join('y%.2f-%.2f p%d r%.2f' % (g['y'][0], g['y'][1], g['lag'], g['r']) for g in r) or '-'))
    json.dump(res, open(os.path.join(folder, 'faults.json'), 'w'), indent=0)


if __name__ == '__main__':
    main()
