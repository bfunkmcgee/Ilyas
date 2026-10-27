# Footsteps: Kael and the men in boots on each floor of the prologue; fight footwork; the goblins' bare clawed feet.
import numpy as np
from gens import *
from amb import db
from reg import sound
from rec_fights import P

for _surface in ('dirt', 'wet_stone', 'wood', 'tile', 'iron', 'marble'):
    sound('step_' + _surface, 6)(lambda rng, k, s=_surface: step(rng, s))


@sound('scuff', 4)
def scuff(rng, k):
    d = 0.26
    t = tvec(d)
    sd = rng.uniform(0.1, 0.18)
    e = np.concatenate([bump(sd, 0.8), np.zeros(N(d) - N(sd))]) * np.exp(-t / 0.15)
    y = P(bp(white(d, rng), 800, 5000) * grain(d, 160, rng, 0.2) * e)
    if k % 2:          # a pivot: the sole squeaks a little
        f = rng.uniform(1200, 2000) * (1 + 0.04 * np.sin(TAU * 25 * t))
        y += P(sweep_sine(f) * e * grain(d, 60, rng, 0.3)) * db(-14)
    y += P(lp(white(d, rng), 300, 4) * env_ad(t, 0.003, 0.03)) * db(-10)
    return fade(y, 0.002, 0.04)


@sound('step_goblin', 4)
def step_goblin(rng, k):
    d = 0.22
    y = np.zeros(N(d))
    for i in range(rng.integers(2, 5)):          # a claw's tik on the iron, then its scratch
        sd = rng.uniform(0.015, 0.03)
        x = metal(rng, 0.05, 3000, 7000, n=3, tau=0.005, imp=0.5, imp_f=3000, beats=0, ring=0.5)
        place(x, bp(white(sd, rng), 2000, 6000) * grain(sd, 300, rng, 0.1) * bump(sd, 1) * 0.35, 0.003)
        x += lp(white(0.05, rng), 500, 4) * env_ad(tvec(0.05), 0.001, 0.006) * 0.4
        place(y, x, i * rng.uniform(0.03, 0.05), rng.uniform(0.5, 1.0))
    return fade(P(y), 0.0005, 0.03)
