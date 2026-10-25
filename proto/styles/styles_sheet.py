#!/usr/bin/env python3
"""Lays the side-by-side cells (proto/styles/sheets/cells/<blow>_<style>_<moment>.png, made by styles_sheet.js) out as one picture
per blow: a row per style, a column per moment, the style's name at the left of its row and the moment's over its column, in the
page's black and gold. Writes proto/styles/sheets/<blow>.png.

  python3 proto/styles/styles_sheet.py [blow,...]
"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
CELLS = os.path.join(HERE, 'sheets', 'cells')
BLOWS = (sys.argv[1] if len(sys.argv) > 1 else 'slash,thrust,overhead,sweep').split(',')
STYLES = [('regular', 'Regular'), ('tactical', 'The Sareth cut'), ('wire', 'Wire drill')]
MOMENTS = [('guard', 'Guard'), ('wind', 'Windup'), ('imp', 'Impact'), ('fol', 'Follow-through'), ('back', 'Back')]
GOLD, CREAM, DIM, BG, RULE = (226, 182, 90), (243, 234, 214), (150, 140, 120), (8, 7, 11), (60, 50, 34)

def font(size, bold=True):
    for p in (['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'] if bold else []) + ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']:
        if os.path.exists(p): return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def sheet(blow):
    cells = {(s, m): Image.open(os.path.join(CELLS, '%s_%s_%s.png' % (blow, s, m))).convert('RGB') for s, _ in STYLES for m, _ in MOMENTS
             if os.path.exists(os.path.join(CELLS, '%s_%s_%s.png' % (blow, s, m)))}
    if not cells: return None
    cw, ch = next(iter(cells.values())).size
    sc = 0.62; cw2, ch2 = int(cw * sc), int(ch * sc)
    left, top, gap = 150, 34, 4
    W = left + len(MOMENTS) * (cw2 + gap); H = top + len(STYLES) * (ch2 + gap)
    im = Image.new('RGB', (W, H), BG); d = ImageDraw.Draw(im)
    f1, f2 = font(15), font(13)
    for j, (m, ml) in enumerate(MOMENTS):
        x = left + j * (cw2 + gap); d.text((x + 6, 10), ml.upper(), font=f2, fill=GOLD)
    for i, (s, sl) in enumerate(STYLES):
        y = top + i * (ch2 + gap)
        words, line, lines = sl.split(), '', []
        for w in words:
            t = (line + ' ' + w).strip()
            if d.textlength(t, font=f1) > left - 18 and line: lines.append(line); line = w
            else: line = t
        lines.append(line)
        for k, ln in enumerate(lines): d.text((10, y + ch2 / 2 - 10 * len(lines) + k * 20), ln, font=f1, fill=CREAM)
        for j, (m, _) in enumerate(MOMENTS):
            c = cells.get((s, m))
            if c: im.paste(c.resize((cw2, ch2), Image.LANCZOS), (left + j * (cw2 + gap), y))
        d.line([(10, y + ch2 + gap / 2 - 1), (W - 10, y + ch2 + gap / 2 - 1)], fill=RULE, width=1)
    out = os.path.join(HERE, 'sheets', blow + '.png'); im.save(out, optimize=True)
    return out, im.size

for b in BLOWS:
    r = sheet(b)
    print(b, r if r else 'no cells')
