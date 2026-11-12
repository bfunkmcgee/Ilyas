#!/usr/bin/env python3
"""The motion test's numbers, read: a trace written by trace.js, plotted and searched for jumps.

    python3 spike/motion/trace_plot.py <trace.json> <out.png> [t0 t1]
"""
import json
import sys

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

NAMES = ['PEL', 'CHE', 'HEAD', 'ELF', 'HAF', 'ELB', 'HAB', 'KNF', 'FTF', 'KNB', 'FTB', 'TIP']


def main():
    rows = json.load(open(sys.argv[1]))
    t = np.array([r['t'] for r in rows])
    if len(sys.argv) > 4:
        keep = (t >= float(sys.argv[3])) & (t <= float(sys.argv[4]))
        rows = [r for r, k in zip(rows, keep) if k]
        t = t[keep]
    sim = np.array([r['sim'] for r in rows])
    out = np.array([r['out'] if r['out'] else r['sim'] for r in rows])
    shown = np.array([1 if r['out'] else 0 for r in rows])
    w = np.array([r['w'] for r in rows])
    gy = np.array([r['gy'] for r in rows])
    fa = np.array([r['fa'] for r in rows])
    print('frames %d, drawn in the pose %d, ragdoll weight over .01 in %d' % (len(rows), shown.sum(), (w > .01).sum()))
    # jumps: the second difference of each joint measured from the hips (feet: on the floor), where it stands out of its neighbours
    loc = out - out[:, :1, :]
    loc[:, 0, :] = out[:, 0, :]
    for i in (8, 10):
        loc[:, i, :] = out[:, i, :]
    d2 = np.abs(loc[2:] - 2 * loc[1:-1] + loc[:-2]).max(axis=2)
    flips = np.abs(np.diff(fa)) > 0
    worst = []
    for i in range(12):
        j = int(d2[:, i].argmax())
        worst.append((round(float(d2[j, i]), 1), NAMES[i], round(float(t[j + 1]), 2)))
    print('largest change of pace in one frame (units):', ' '.join('%s %.1f@%.2f' % (n, v, tt) for v, n, tt in sorted(worst, reverse=True)[:8]))
    big = sorted(set(round(float(t[j + 1]), 1) for j in np.where(d2.max(axis=1) > 6)[0]))
    print('frames over 6:', big[:40], 'turns at', [round(float(x), 2) for x in t[1:][flips]][:12])
    fig, ax = plt.subplots(5, 1, figsize=(15, 13), sharex=True)
    ax[0].plot(t, gy - out[:, 8, 1], label='front foot, drawn')
    ax[0].plot(t, gy - out[:, 10, 1], label='back foot, drawn')
    ax[0].plot(t, gy - sim[:, 8, 1], ':', label='front foot, ragdoll')
    ax[0].plot(t, gy - sim[:, 10, 1], ':', label='back foot, ragdoll')
    ax[0].set_ylabel('ankle over the floor')
    ax[1].plot(t, gy - out[:, 0, 1], label='hips, drawn')
    ax[1].plot(t, gy - sim[:, 0, 1], ':', label='hips, ragdoll')
    ax[1].set_ylabel('hips over the floor')
    ax[2].plot(t, gy - out[:, 2, 1], label='head, drawn')
    ax[2].plot(t, gy - sim[:, 2, 1], ':', label='head, ragdoll')
    ax[2].set_ylabel('head over the floor')
    ax[3].plot(t, (out[:, 4, 0] - out[:, 0, 0]) * fa, label='hand ahead of hips, drawn')
    ax[3].plot(t, (sim[:, 4, 0] - sim[:, 0, 0]) * fa, ':', label='hand, ragdoll')
    ax[3].plot(t, (out[:, 2, 0] - out[:, 0, 0]) * fa, label='head ahead of hips, drawn')
    ax[3].plot(t, (sim[:, 2, 0] - sim[:, 0, 0]) * fa, ':', label='head, ragdoll')
    ax[3].set_ylabel('ahead of the hips')
    ax[4].plot(t, (out[:, 8, 0] - out[:, 0, 0]) * fa, label='front foot ahead of hips, drawn')
    ax[4].plot(t, (out[:, 10, 0] - out[:, 0, 0]) * fa, label='back foot, drawn')
    ax[4].plot(t, w * 40, 'k--', label='ragdoll weight x40')
    ax[4].set_ylabel('feet ahead of the hips')
    for a in ax:
        a.legend(loc='upper right', fontsize=7, ncol=4)
        a.grid(alpha=.3)
    plt.tight_layout()
    plt.savefig(sys.argv[2], dpi=70)


if __name__ == '__main__':
    main()
