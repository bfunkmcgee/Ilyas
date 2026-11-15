#!/usr/bin/env python3
"""The layers across the story's places, read from scenes.js's pictures (since V118).

    python3 spike/layers/scenes.py <folder> [--sheets]

For each moment: whether the frame went onto the sheets (and why not), what was on, and how far the picture on the sheets with
every effect off ('plain') is from the flat one: the mean difference of 255 and the 99th percentile, on copies a quarter the size
(so that a line landing half a pixel over does not count). The sheets alone must change nothing that is seen: a frame is marked
where the mean is over 1 or the 99th percentile over 12, beyond what two flat paintings of the same moment differ by ('flat2'). With --sheets, pairs-N.jpg: flat and in layers side by side, named.
"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont


def small(path):
    im = Image.open(path).convert('RGB')
    return np.asarray(im.resize((im.width // 4, im.height // 4), Image.BOX), dtype=np.float32)


def main():
    folder = sys.argv[1]
    J = json.load(open(os.path.join(folder, 'scenes.json')))
    bad = 0
    tiles = []
    for f in J['frames']:
        base = os.path.join(folder, f['name'])
        a, b = small(base + '_flat.png'), small(base + '_plain.png')
        d = np.abs(a - b).max(axis=2)
        mean, p99 = float(d.mean()), float(np.percentile(d, 99))
        # (the same moment painted flat a second time: what moves by itself between two paintings)
        m0 = p0 = 0.0
        if os.path.exists(base + '_flat2.png'):
            d0 = np.abs(a - small(base + '_flat2.png')).max(axis=2)
            m0, p0 = float(d0.mean()), float(np.percentile(d0, 99))
        W = f['ways']
        L = W['layers']
        on = [k for k in ('focus', 'dust', 'parallax') if L.get(k)] + (['%d lamps' % L['lamps']] if L.get('lamps') else []) + (['%d soft' % L['soft']] if L.get('soft') else [])
        state = 'in layers' if L['live'] else 'FLAT (%s)' % L['why']
        mark = '' if (mean <= 1 + m0 and p99 <= 12 + p0) or not W['plain']['live'] else '  DIFFERS'
        bad += bool(mark)
        print('%-15s %-10s %-34s %-28s plain against flat: mean %.2f, 99th %.0f (flat twice: %.2f, %.0f)%s' % (f['name'], (f['key'] or '')[:10], state, ', '.join(on) or 'no effect set here', mean, p99, m0, p0, mark))
        tiles.append((f, state, on, mark))
    print('%d frames, %d where the sheets alone change the picture' % (len(J['frames']), bad))
    if '--sheets' in sys.argv:
        fp = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
        font = ImageFont.truetype(fp, 14) if os.path.exists(fp) else ImageFont.load_default()
        tw = 200
        th = int(tw * J['h'] / J['w'])
        per, cols = 8, 4
        for s in range(0, len(tiles), per):
            part = tiles[s:s + per]
            R = (len(part) + cols - 1) // cols
            sheet = Image.new('RGB', (cols * (2 * tw + 14) + 8, R * (th + 44) + 8), (22, 19, 17))
            dr = ImageDraw.Draw(sheet)
            for i, (f, state, on, mark) in enumerate(part):
                x, y = 8 + (i % cols) * (2 * tw + 14), 8 + (i // cols) * (th + 44)
                for k, way in enumerate(('flat', 'layers')):
                    sheet.paste(Image.open(os.path.join(folder, f['name'] + '_' + way + '.png')).convert('RGB').resize((tw, th), Image.LANCZOS), (x + k * (tw + 2), y))
                dr.text((x, y + th + 2), f['name'] + '  flat | layers', font=font, fill=(243, 234, 214))
                dr.text((x, y + th + 20), (state if not state.startswith('in') else ', '.join(on) or 'sheets only') + mark, font=font, fill=(226, 150, 110) if mark or state.startswith('FLAT') else (150, 140, 125))
            sheet.save(os.path.join(folder, 'pairs-%d.jpg' % (s // per + 1)), quality=85)
        print('sheets:', (len(tiles) + per - 1) // per)


if __name__ == '__main__':
    main()
