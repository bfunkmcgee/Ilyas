#!/usr/bin/env python3
"""The four colours of the style guide in each frame of a look audit.

    python3 uiwork/look/hues.py <audit folder>

Reads <folder>/audit.json and each frame's quarter-size canvas picture (<frame>_canvas.png, written by audit.js) and prints, for
every frame, how much of the picture is lit and what share of the lit part is each of the guide's four colours. Writes the same
numbers to <folder>/hues.json.

- Lit: luma .12 and up (the near-black that frames the picture is left out).
- Gold: hue 38 to 54 degrees, saturation .45 and up (the gilt; pale sun, sand and cream stay out).
- Sodium orange: hue 12 to 38 degrees, saturation .45 and up (the city's lamps, the Pit's lamps and stoves).
- Cyan: hue 160 to 200 degrees, saturation .3 and up (elven light).
- White: saturation under .12 and luma over .72.
Saturation is the HSV kind. The checks in the Noir Gilt Style Guide read these shares: gold under 1% in Act I, and gold at least
half of sodium orange in the family's rooms. A frame with under 2% of it lit (a fade, a card) says nothing about colour, and the
checks skip it.
"""
import colorsys
import json
import os
import sys

from PIL import Image


def shares(path):
    im = Image.open(path).convert('RGB')
    n = lit = gold = sodium = cyan = white = 0
    for r, g, b in im.getdata():
        n += 1
        h, s, _ = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        luma = (.2126 * r + .7152 * g + .0722 * b) / 255
        if luma < .12:
            continue
        lit += 1
        deg = h * 360
        if s < .12 and luma > .72:
            white += 1
        elif s >= .45 and 38 <= deg < 54:
            gold += 1
        elif s >= .45 and 12 <= deg < 38:
            sodium += 1
        elif s >= .3 and 160 <= deg < 200:
            cyan += 1
    pc = lambda k: round(100 * k / max(1, lit), 1)
    return {'lit': round(100 * lit / max(1, n), 1), 'gold': pc(gold), 'sodium': pc(sodium), 'cyan': pc(cyan), 'white': pc(white)}


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    folder = sys.argv[1]
    audit = json.load(open(os.path.join(folder, 'audit.json')))
    out = []
    for s in audit['shots']:
        if s.get('gone') or not s.get('file'):
            continue
        pic = os.path.join(folder, s['file'][:-4] + '_canvas.png')
        if not os.path.exists(pic):
            continue
        row = {'id': s['id'], 'moment': s.get('moment'), **shares(pic)}
        out.append(row)
        print('%-12s %-6s lit %5.1f  gold %5.1f  sodium %5.1f  cyan %5.1f  white %5.1f' % (
            row['id'], row['moment'], row['lit'], row['gold'], row['sodium'], row['cyan'], row['white']))
    json.dump(out, open(os.path.join(folder, 'hues.json'), 'w'), indent=0)


if __name__ == '__main__':
    main()
