# Rooms and props: the bistro's dining room and kitchen, the lobby and the office, broken as the fights go through them.
import numpy as np
from gens import *
from amb import db
from reg import sound
from rec_fights import P


@sound('glass_small', 4)
def glass_small(rng, k):
    # (the pilot's code)
    d = 0.7
    t = tvec(d)
    y = hp(white(d, rng), 2000) * env_exp(t, 0.004) * 0.9
    y += modes(d, rng.uniform(2600, 4200, 2), [1, 0.5], [0.04, 0.03], rng) * 0.45
    for _ in range(rng.integers(35, 60)):
        at = min(rng.exponential(0.025), 0.12)
        nf = rng.integers(2, 4)
        x = modes(0.2, rng.uniform(3000, 12000, nf), rng.uniform(0.4, 1, nf), rng.uniform(0.015, 0.09, nf), rng)
        place(y, x, at, rng.uniform(0.12, 0.5))
    for _ in range(rng.integers(10, 22)):
        at = 0.08 + rng.uniform(0, 0.5) ** 1.3
        x = modes(0.1, rng.uniform(5000, 11000, 2), [1, 0.6], rng.uniform(0.01, 0.04, 2), rng)
        place(y, x, at, rng.uniform(0.06, 0.22) * (1 - at / 0.8))
    y += lp(white(d, rng), 300) * env_exp(t, 0.02) * 0.3
    return fade(y, 0.0003, 0.08)


@sound('glass_large', 3)
def glass_large(rng, k):
    d = 1.6
    t = tvec(d)
    y = P(glass(rng, d, shards=(90, 140), fmin=1500, fmax=11000, span=0.04, fall=(40, 70), fall_span=1.0, crack_g=1.2, floor=0.0,
                tink=(1200, 2500), big=True))
    big = np.zeros(N(d))
    for _ in range(rng.integers(6, 10)):          # the big pieces coming down
        x = modes(0.4, rng.uniform(900, 4000, 4), rng.uniform(0.4, 1, 4), rng.uniform(0.05, 0.15, 4), rng)
        x += hp(white(0.4, rng), 1500) * env_exp(tvec(0.4), 0.002) * 0.5
        place(big, x, 0.08 + rng.uniform(0, 0.8), rng.uniform(0.4, 1.0))
    body = lp(white(d, rng), 250, 4) * env_ad(t, 0.002, 0.05)
    y = y + P(big) * db(-12) + P(body) * db(-6)
    return fade(space(rng, y, 'room')[:N(d)], 0.0003, 0.15)


@sound('glass_crunch', 3)
def glass_crunch(rng, k):
    d = 0.32
    t = tvec(d)
    grind = crunch(rng, d, rng.integers(40, 60), 0.05, 2000, 11000)
    bits = np.zeros(N(d))
    for _ in range(rng.integers(15, 30)):
        x = modes(0.05, rng.uniform(5000, 12000, 2), [1, 0.6], rng.uniform(0.004, 0.015, 2), rng)
        place(bits, x, rng.uniform(0, 0.12), rng.uniform(0.3, 1))
    grit = crinkle(rng, d, 1500, 2500, 10000, env_ad(t, 0.005, 0.05))
    boot = lp(white(d, rng), 280, 4) * env_ad(t, 0.003, 0.03)
    y = P(grind) + P(bits) * db(-5) + P(grit) * db(-9) + P(boot) * db(-7)
    return fade(y, 0.0003, 0.05)


@sound('china', 4)
def china(rng, k):
    d = 0.65
    if k < 3:          # plates and bowls
        y = P(glass(rng, d, shards=(25, 40), fmin=1500, fmax=7000, span=0.015, fall=(8, 16), fall_span=0.4, crack_g=1.0, floor=0.6,
                    tink=(1100, 2200), ring=0.05))
    else:              # an orchid's pot: duller, and the soil
        t = tvec(d)
        y = P(glass(rng, d, shards=(15, 25), fmin=700, fmax=3500, span=0.012, fall=(6, 10), fall_span=0.3, crack_g=0.8, floor=1.0,
                    tink=(600, 1200), ring=0.025))
        y += P(crinkle(rng, d, 900, 400, 2500, env_ad(t, 0.01, 0.12), (0.001, 0.004))) * db(-10)
    y += P(wood_knock(rng, d, 120, 600, 4, 0.03, 0.3)) * db(-9)
    return fade(y, 0.0003, 0.08)


@sound('paper', 3)
def paper(rng, k):
    d = 0.6
    t = tvec(d)
    y = P(tear(rng, rng.uniform(0.18, 0.26), rate=(250, 450), lo=1800, hi=9000))
    y = np.concatenate([y, np.zeros(N(d) - len(y))])
    y += P(crinkle(rng, d, 600, 1500, 8000, env_ad(t, 0.01, 0.15), (0.001, 0.004))) * db(-6)
    for _ in range(rng.integers(2, 4)):          # the lattice
        place(y, P(snap(rng, 0.12, 10, 0.01, 1500, 7000, 0.35)), rng.uniform(0.01, 0.12), db(-4))
    y += P(lp(white(d, rng), 300, 4) * env_ad(t, 0.003, 0.04)) * db(-8)
    return fade(y, 0.0005, 0.06)


@sound('plaster', 3)
def plaster(rng, k):
    d = 0.75
    t = tvec(d)
    y = P(impact(rng, d, thump=dict(f=300, tau=0.07, g=3.0), sub=dict(f0=90, f1=40, tf=0.08, tau=0.1, g=1.0),
                 knock=dict(lo=180, hi=600, tau=0.04, g=1.4), drive=1.7))
    place(y, P(crunch(rng, 0.2, 30, 0.04, 800, 5000)), 0.002, db(-6))
    fall_env = np.clip((t - 0.05) / 0.05, 0, 1) * np.exp(-np.clip(t - 0.05, 0, None) / 0.25)
    y += P(crinkle(rng, d, 500, 500, 4000, fall_env, (0.001, 0.004))) * db(-11)
    y += P(bp(pink(d, rng), 300, 2000) * env_ad(t, 0.02, 0.3)) * db(-20)
    return fade(y, 0.0004, 0.1)


@sound('door_swing', 2)
def door_swing(rng, k):
    d = 0.95
    t = tvec(d)

    def whump(g):
        x = lp(white(d, rng), 250, 4) * env_ad(t, 0.004, 0.05) + wood_knock(rng, d, 90, 350, 4, 0.06, 0.15) * 0.5
        return P(x) * g

    y = whump(1.0)
    place(y, P(whoosh(rng, 0.35, 150, 600, 250, 0.4, q=0.8, body=1.0, hiss=0.0)), 0.02, db(-10))
    place(y, P(creak(rng, 0.35, 220, 330, 0.2, ((900, 8), (1800, 6), (3200, 5)))), 0.05, db(-9))
    back = rng.uniform(0.44, 0.5)
    place(y, whump(db(-6)), back)
    place(y, P(creak(rng, 0.2, 300, 240, 0.2, ((900, 8), (1800, 6), (3200, 5)))), back - 0.06, db(-13))
    place(y, whump(db(-15)), back + rng.uniform(0.18, 0.24))
    return fade(y, 0.002, 0.08)


@sound('table_topple', 2)
def table_topple(rng, k):
    d = 1.15
    t = tvec(d)
    y = np.zeros(N(d))
    tilt = rng.uniform(0.18, 0.24)
    place(y, P(bp(white(tilt, rng), 400, 2500) * grain(tilt, 90, rng, 0.2) * np.linspace(0.3, 1, N(tilt))), 0, db(-16))
    place(y, P(creak(rng, tilt, 70, 110, 0.3, ((300, 5), (700, 4), (1500, 3)))), 0.0, db(-18))
    cd = d - tilt
    tc = tvec(cd)
    crash = P(impact(rng, cd, thump=dict(f=260, tau=0.08, g=3.0), sub=dict(f0=70, f1=35, tf=0.08, tau=0.12, g=1.2),
                     knock=dict(lo=100, hi=400, tau=0.05, g=1.0), drive=1.6))
    crash += P(wood_knock(rng, cd, 80, 400, 6, 0.08, 0.4)) * db(-5)
    for _ in range(2):
        place(crash, P(glass(rng, 0.6, shards=(15, 25), fmin=1500, fmax=7000, span=0.012, fall=(5, 10), fall_span=0.3, floor=0.2,
                             tink=(1100, 2200), ring=0.05)), rng.uniform(0.01, 0.08), db(-7))
    place(crash, P(chain_rattle(rng, 0.7, 22, 0.35, 2000, 7000, 1.0)), 0.005, db(-8))
    place(crash, P(lp(white(0.2, rng), 300, 4) * env_ad(tvec(0.2), 0.002, 0.04)), rng.uniform(0.1, 0.14), db(-8))
    place(y, crash, tilt)
    return fade(y, 0.003, 0.1)


@sound('table_break', 2)
def table_break(rng, k):
    d = 1.1
    y = P(impact(rng, d, thump=dict(f=300, tau=0.07, g=3.0), sub=dict(f0=80, f1=35, tf=0.08, tau=0.12, g=1.2), drive=1.6))
    place(y, P(snap(rng, 0.6, 50, 0.08, 900, 7000, 1.2)), 0.005, db(-1))
    place(y, P(snap(rng, 0.5, 35, 0.06, 900, 7000, 1.0)), rng.uniform(0.05, 0.08), db(-5))
    place(y, P(crunch(rng, 0.4, 40, 0.1, 1500, 8000)), 0.01, db(-11))
    for i in range(rng.integers(6, 10)):          # the pieces coming down
        place(y, P(wood_knock(rng, 0.2, 150, 1200, 5, 0.03, 0.5)), rng.uniform(0.12, 0.7), db(rng.uniform(-16, -8)))
    return fade(y, 0.0004, 0.1)


@sound('prop_tumble', 3)
def prop_tumble(rng, k):
    d = 0.75
    y = np.zeros(N(d))
    if k == 0:          # a chair: its legs and its seat clattering over
        at, g = 0.0, 1.0
        for i in range(rng.integers(4, 7)):
            x = wood_knock(rng, 0.2, 500, 2200, 5, 0.02, 0.6) if i % 2 == 0 else lp(white(0.2, rng), 400, 4) * env_ad(tvec(0.2), 0.002, 0.03) * 2
            place(y, P(x), at, g)
            at += rng.uniform(0.05, 0.13)
            g *= rng.uniform(0.6, 0.85)
    elif k == 1:          # a crate: hollow, heavier
        def hit(i):
            return wood_knock(rng, 0.3, 90, 500, 6, 0.06, 0.3) + lp(white(0.3, rng), 250, 4) * env_ad(tvec(0.3), 0.002, 0.04)
        y = bounces(rng, d, hit, 3, gap=0.16, ratio=0.6, decay=0.45)
    else:          # a trolley: its frame and its wheels
        t = tvec(d)
        y = P(metal(rng, d, 300, 3000, n=10, tau=0.12, imp=0.6, beats=1, ring=0.6)) + P(chain_rattle(rng, d, 16, 0.3, 1500, 6000, 1.0)) * db(-6)
        y += P(lp(white(d, rng), 400, 2) * grain(d, 30, rng, 0.4) * env_ad(t, 0.01, 0.2)) * db(-10)
        place(y, P(metal(rng, 0.4, 250, 2500, n=10, tau=0.1, imp=0.6, beats=1, ring=0.6)), rng.uniform(0.15, 0.22), db(-4))
    return fade(y, 0.0003, 0.08)


@sound('prop_break', 3)
def prop_break(rng, k):
    d = 1.0
    t = tvec(d)
    y = P(lp(white(d, rng), 300, 4) * env_ad(t, 0.002, 0.05) + sweep_sine(pitch_drop(t, 90, 40, 0.08)) * env_ad(t, 0.002, 0.08) * 0.5)
    for _ in range(rng.integers(2, 5)):
        place(y, P(snap(rng, 0.4, 30, 0.04, 1000, 7000, 0.8)), rng.uniform(0.0, 0.08), db(rng.uniform(-4, 0)))
    lo, hi = [(300, 1800), (90, 600), (120, 900)][k]
    for _ in range(rng.integers(6, 11)):
        place(y, P(wood_knock(rng, 0.25, lo, hi, 5, 0.04 if k else 0.025, 0.5)), rng.uniform(0.1, 0.8), db(rng.uniform(-18, -8)))
    if k == 2:          # a barrel: its hoops
        place(y, P(metal(rng, 0.5, 400, 3000, n=8, tau=0.15, imp=0.5, beats=1, ring=0.6)), rng.uniform(0.05, 0.15), db(-6))
    return fade(y, 0.0004, 0.1)


@sound('lamp_knock', 3)
def lamp_knock(rng, k):
    d = 0.75
    t = tvec(d)
    lo, hi = [(700, 5000), (500, 3000), (900, 6000)][k]
    y = P(metal(rng, d, lo, hi, n=10, tau=0.18, imp=0.7, beats=2, ring=0.6))
    sw = np.sin(np.pi * np.clip(t / 0.3, 0, 2)) ** 2 * np.exp(-t / 0.4)          # its swing, back and forth
    y += P(lp(creak(rng, d, 300, 380, 0.15, ((1800, 24), (3100, 20), (4700, 16)), env=sw), 5000)) * db(-21)
    y += P(chain_rattle(rng, d, 8, 0.12, 2500, 7000, 1.0)) * db(-13)
    if k == 2:          # a chandelier: its glass drops
        tk = np.zeros(N(d))
        for _ in range(rng.integers(10, 18)):
            place(tk, modes(0.2, rng.uniform(4000, 10000, 2), [1, 0.5], rng.uniform(0.03, 0.08, 2), rng), rng.uniform(0.005, 0.35),
                  rng.uniform(0.3, 1))
        y += P(tk) * db(-10)
    return fade(y, 0.0003, 0.1)


@sound('lamp_fall', 2)
def lamp_fall(rng, k):
    d = 1.15
    t = tvec(d)
    y = P(metal(rng, d, 400, 5000, n=14, tau=0.4, imp=0.9, beats=3, ring=0.6))
    y += P(lp(white(d, rng), 300, 4) * env_ad(t, 0.002, 0.04)) * db(-6)
    place(y, P(glass(rng, 0.8, shards=(30, 50), fmin=2500, fmax=11000, span=0.02, fall=(10, 18), fall_span=0.5, floor=0.0)), 0.004, db(-4))
    at, rate = 0.18, 7.0          # the brass rolling away, wobbling faster as it settles
    roll = np.zeros(N(d))
    while at < 0.98:
        place(roll, metal(rng, 0.12, 900, 5000, n=5, tau=0.035, imp=0.4, beats=0, ring=0.6), at, rng.uniform(0.3, 1.0) * (1 - (at - 0.18) / 0.9))
        at += 1 / rate * rng.uniform(0.6, 1.4)
        rate = min(30, rate * 1.1)
    rl = np.clip((t - 0.18) / 0.05, 0, 1) * np.clip((1.0 - t) / 0.4, 0, 1)
    roll += lp(white(d, rng), 1500, 2) * grain(d, 40, rng, 0.2) * rl * 0.15
    y += P(roll) * db(-15)
    return fade(y, 0.0003, 0.12)


@sound('range_slam', 2)
def range_slam(rng, k):
    d = 0.9
    y = P(impact(rng, d, thump=dict(f=320, tau=0.06, g=3.0), sub=dict(f0=90, f1=40, tf=0.06, tau=0.08, g=1.0), drive=1.6))
    y += P(metal(rng, d, 120, 2500, n=16, tau=0.3, tau_exp=0.7, amp_exp=0.7, imp=0.6, imp_f=900, beats=2, ring=0.6)) * db(-2)
    for _ in range(rng.integers(3, 6)):          # the copper pots
        place(y, P(metal(rng, 0.5, 500, 4000, n=8, tau=0.15, imp=0.5, beats=1, ring=0.6)), rng.uniform(0.02, 0.25), db(rng.uniform(-11, -6)))
    place(y, P(chain_rattle(rng, 0.5, 12, 0.4, 1500, 6000, 1.0)), 0.03, db(-13))
    return fade(y, 0.0003, 0.12)


@sound('sizzle', 2)
def sizzle(rng, k):
    d = 0.95
    t = tvec(d)
    env = np.minimum(t / 0.015, 1) * (0.35 + 0.65 * np.exp(-t / 0.12)) * np.exp(-t / 0.6)
    y = P(crinkle(rng, d, 2500, 2500, 12000, env, (0.0003, 0.0012)) * env)
    y += P(hp(white(d, rng), 3000) * grain(d, 80, rng, 0.6) * env) * db(-4)
    puff = np.clip((t - 0.05) / 0.04, 0, 1) * np.exp(-np.clip(t - 0.05, 0, None) / 0.12)
    y += P(bp(white(d, rng), 900, 4000) * puff) * db(-8)
    return fade(y, 0.003, 0.15)
