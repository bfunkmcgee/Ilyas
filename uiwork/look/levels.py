#!/usr/bin/env python3
"""The levels of detail across the story, read from levels.js's stills (since V118; the drawing's rule 13).

    python3 uiwork/look/levels.py <folder>/<w>x<h> [--sheets]

For each frame: the view's pixels a unit, the level the figure kit draws people at there (game size under 2.4, close to 5, portrait
over), how far the place is enlarged from the scale it was painted at, and how busy and how loud four parts of the picture are:
  people   each figure's box (the lead is the first of them: the player's man)
  things   what stands on the floor with them: the stage's sheet outside their boxes
  set      the 150 units above the far edge of the floor
  floor    from the floor's far edge to its foot
  top      everything above the set
Where spike/layers/scenes.js has saved a frame's two sheets (the place alone, and the people and things alone) the parts are read
from those; from levels.js's whole picture the people's boxes are left out of the place's parts, things are not read, and the
fight's words and bars are in it.
busy is the mean step in lightness between neighbouring pixels, times 100; loud the 95th percentile of those steps. Then what rule 13
asks, marked where a frame does not hold it:
  soft   the place is enlarged over 1.05 times under people drawn at the screen's own pixels
  things what stands on the floor is louder than the lead
  set    the set is louder than half the lead
  floor  the floor is louder than a sixth of the lead
  calm   the floor is over half as busy as the set
  top    what is above the set is louder than the set
A region is a band of the picture, not a thing: the marks say where to look, and the stills decide. Writes levels.csv beside the
stills; with --sheets, sheet-N.jpg: every frame small, named, with its marks. Nothing fails here.
"""
import csv
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont


def steps(a):
    L = .2126 * a[..., 0] + .7152 * a[..., 1] + .0722 * a[..., 2]
    gx = np.zeros_like(L)
    gy = np.zeros_like(L)
    gx[:, 1:-1] = (L[:, 2:] - L[:, :-2]) / 2
    gy[1:-1, :] = (L[2:, :] - L[:-2, :]) / 2
    return np.hypot(gx, gy)


def grow(m, n):
    for _ in range(n):
        o = m.copy()
        o[1:, :] |= m[:-1, :]
        o[:-1, :] |= m[1:, :]
        o[:, 1:] |= m[:, :-1]
        o[:, :-1] |= m[:, 1:]
        m = o
    return m


def stat(g, mask):
    v = g[mask]
    if v.size < 400:
        return None
    return float(v.mean()) * 100, float(np.percentile(v, 95)) * 100


def read(folder, f):
    base = os.path.join(folder, f['name'])
    sheets = os.path.exists(base + '_plate.png') and os.path.exists(base + '_stage.png')
    if sheets:
        # the place alone and the stage alone (spike/layers/scenes.js): the people and the things are read where the stage is
        # painted, with their edge against the place; the set, the floor and the top on the place alone
        P = np.asarray(Image.open(base + '_plate.png').convert('RGB'), dtype=np.float32) / 255
        St = np.asarray(Image.open(base + '_stage.png').convert('RGBA'), dtype=np.float32) / 255
        a = St[..., 3:4]
        comp = P * (1 - a) + St[..., :3] * a
        gP, gC, on = steps(P), steps(comp), grow(a[..., 0] > .5, 2)
        im = Image.fromarray((comp * 255).astype(np.uint8))
    else:
        file = base + '.png' if os.path.exists(base + '.png') else base + '_flat.png'
        im = Image.open(file).convert('RGB')
        gC = gP = steps(np.asarray(im, dtype=np.float32) / 255)
        on = None
    H, W = gC.shape
    bar = f.get('bar', 0)
    ppu = f['ppu']
    inside = np.zeros((H, W), bool)
    inside[bar:H - bar, :] = True
    free = inside.copy()
    ppl = []
    for q in f['people']:
        x0, y0, x1, y1 = [int(v) for v in q['box']]
        x0, y0, x1, y1 = max(0, x0), max(bar, y0), min(W, x1), min(H - bar, y1)
        if x1 - x0 < 8 or y1 - y0 < 8:
            continue
        # (a man down is no thing: his box is left out of the things and of the place like any other's, and he is not read)
        free[max(0, y0 - 6):y1 + 6, max(0, x0 - 6):x1 + 6] = False
        if q.get('dead'):
            continue
        m = np.zeros((H, W), bool)
        m[y0:y1, x0:x1] = True
        s = stat(gC, m & on if sheets else m)
        if s:
            ppl.append((q['name'],) + s)
    yF = int(np.clip(f['yFar'], bar, H - bar))
    yS = int(np.clip(f['yFar'] - 150 * ppu, bar, H - bar))
    yB = int(np.clip(f['yFoot'], bar, H - bar))
    rows = np.arange(H)[:, None]
    place = inside if sheets else free
    reg = {'set': place & (rows >= yS) & (rows < yF), 'floor': place & (rows >= yF) & (rows < yB), 'top': place & (rows < yS)}
    out = {k: stat(gP, m) for k, m in reg.items()}
    out['things'] = stat(gC, on & free) if sheets else None
    lead = ppl[0] if ppl else None
    level = 'game size' if ppu < 2.4 else 'close' if ppu < 5 else 'portrait'
    big = ppu / f['painted'] if f.get('painted') else 1
    marks = []
    if big > 1.05:
        marks.append('soft %.2f' % big)
    if lead:
        if out['things'] and out['things'][1] > lead[2]:
            marks.append('things')
        if out['set'] and out['set'][1] > lead[2] / 2:
            marks.append('set')
        if out['floor'] and out['floor'][1] > lead[2] / 6:
            marks.append('floor')
    if out['floor'] and out['set'] and out['floor'][0] > out['set'][0] / 2:
        marks.append('calm')
    if out['top'] and out['set'] and out['top'][1] > out['set'][1]:
        marks.append('top')
    return {'name': f['name'], 'key': f['key'], 'step': f['step'] + ('/cut' if f.get('cut') else ''), 'across': f['across'], 'ppu': ppu, 'level': level,
            'enlarged': round(big, 2), 'people': len(ppl), 'lead': lead, 'others': ppl[1:], 'things': out['things'], 'set': out['set'], 'floor': out['floor'],
            'top': out['top'], 'marks': marks, 'sheets': sheets}, im


def main():
    folder = sys.argv[1]
    J = json.load(open(os.path.join(folder, 'levels.json' if os.path.exists(os.path.join(folder, 'levels.json')) else 'scenes.json')))
    rows, thumbs = [], []
    for f in J['frames']:
        r, im = read(folder, f)
        rows.append(r)
        thumbs.append((r, im))
    n2 = lambda t, i: '' if not t else '%.1f' % t[i]
    with open(os.path.join(folder, 'levels.csv'), 'w', newline='') as fh:
        w = csv.writer(fh)
        w.writerow(['frame', 'place', 'step', 'units across', 'pixels a unit', 'people at', 'place enlarged', 'lead loud', 'others loud (most)', 'things loud', 'set loud',
                    'set busy', 'floor loud', 'floor busy', 'top loud', 'marks', 'read from'])
        for r in rows:
            w.writerow([r['name'], r['key'], r['step'], r['across'], r['ppu'], r['level'], r['enlarged'], '%.1f' % r['lead'][2] if r['lead'] else '',
                        '%.1f' % max(o[2] for o in r['others']) if r['others'] else '', n2(r['things'], 1), n2(r['set'], 1), n2(r['set'], 0), n2(r['floor'], 1), n2(r['floor'], 0),
                        n2(r['top'], 1), ' '.join(r['marks']), 'the sheets' if r['sheets'] else 'the whole picture'])
    for r in rows:
        print('%-15s %-10s %5.2f px/u %-9s x%.2f  lead %5s things %5s set %5s/%4s floor %5s/%4s top %5s  %s%s' % (
            r['name'], (r['key'] or '')[:10], r['ppu'], r['level'], r['enlarged'], '%.1f' % r['lead'][2] if r['lead'] else '-', n2(r['things'], 1) or '-', n2(r['set'], 1) or '-',
            n2(r['set'], 0) or '-', n2(r['floor'], 1) or '-', n2(r['floor'], 0) or '-', n2(r['top'], 1) or '-', ' '.join(r['marks']), '' if r['sheets'] else '  (whole picture)'))
    if '--sheets' in sys.argv:
        fp = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
        font = ImageFont.truetype(fp, 15) if os.path.exists(fp) else ImageFont.load_default()
        wide = J['w'] > J['h']
        tw = 300 if wide else 206
        th = int(tw * J['h'] / J['w'])
        per, cols = (12, 4) if wide else (12, 6)
        for s in range(0, len(thumbs), per):
            part = thumbs[s:s + per]
            R = (len(part) + cols - 1) // cols
            sheet = Image.new('RGB', (cols * (tw + 8) + 8, R * (th + 44) + 8), (22, 19, 17))
            d = ImageDraw.Draw(sheet)
            for i, (r, im) in enumerate(part):
                x, y = 8 + (i % cols) * (tw + 8), 8 + (i // cols) * (th + 44)
                sheet.paste(im.convert('RGB').resize((tw, th), Image.LANCZOS), (x, y))
                d.text((x, y + th + 2), r['name'], font=font, fill=(243, 234, 214))
                d.text((x, y + th + 21), ('%.1f px/u ' % r['ppu']) + ' '.join(r['marks']), font=font, fill=(226, 150, 110) if r['marks'] else (150, 140, 125))
            sheet.save(os.path.join(folder, 'sheet-%d.jpg' % (s // per + 1)), quality=86)
        print('sheets:', (len(thumbs) + per - 1) // per)


if __name__ == '__main__':
    main()
