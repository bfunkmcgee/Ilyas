# Fights: swings and blows, blocks and bodies, Kael's arc-blade, his magic and elven speed, and the guns.
import numpy as np
from gens import *
from amb import db
from reg import sound


def P(x):
    """peak-normalized (parts are mixed in dB against each other)"""
    m = np.max(np.abs(x))
    return x / m if m > 0 else x


# ---------- swings ----------
def swing_of(rng, K):
    U = lambda key: rng.uniform(*K[key]) if isinstance(K[key], tuple) else K[key]
    d = U('d')
    return whoosh(rng, d, U('f0'), U('f1'), U('f2'), U('pk'), q=U('q'), body=K.get('body', 0.5), hiss=K.get('hiss', 0.1),
                  edge=K.get('edge', 0.0), rise=K.get('rise', 2.2), fall=K.get('fall', 3.4), turn=K.get('turn', 0.0),
                  lpf=K.get('lp'), low=K.get('low', 0.0))


# a knife's flick; a fist or a bottle, thicker; a thin slash whose edge whistles; a backhand flick and its return
LIGHT_KINDS = [
    dict(d=(0.17, 0.20), pk=(0.50, 0.58), f0=(900, 1100), f1=(3600, 4200), f2=(1900, 2300), q=(2.4, 3.0), body=0.15, edge=0.12, hiss=0.18, rise=2.6, fall=4.0),
    dict(d=(0.21, 0.25), pk=(0.45, 0.52), f0=(450, 600), f1=(2200, 2700), f2=(1000, 1300), q=(1.4, 1.8), body=0.45, edge=0.0, hiss=0.06, rise=1.8, fall=3.2),
    dict(d=(0.19, 0.23), pk=(0.55, 0.62), f0=(800, 1000), f1=(3800, 4600), f2=(2200, 2600), q=(3.4, 4.2), body=0.12, edge=0.3, hiss=0.12, rise=3.0, fall=4.5),
    dict(d=(0.20, 0.24), pk=(0.30, 0.36), f0=(700, 900), f1=(3000, 3600), f2=(1400, 1800), q=(2.0, 2.6), body=0.25, edge=0.1, hiss=0.12, rise=1.4, fall=3.2, turn=0.55),
]


@sound('swing_light', 4)
def swing_light(rng, k):
    return swing_of(rng, LIGHT_KINDS[k])


# Each take of a swing is its own kind of pass, so repeats do not sound like one sample: a full arc, a tight pass whose edge
# whistles, a broad heavy cut, and a quick turn of the wrist (two pulses as the blade turns). Detail is random within each.
SWING_KINDS = [
    dict(d=(0.34, 0.40), pk=(0.50, 0.58), f0=(380, 480), f1=(2000, 2500), f2=(800, 1000), q=(1.5, 1.9), body=0.55, edge=0.0, hiss=0.10, rise=2.2, fall=3.4, turn=0.0),
    dict(d=(0.27, 0.32), pk=(0.56, 0.66), f0=(650, 850), f1=(2900, 3500), f2=(1400, 1800), q=(2.8, 3.6), body=0.28, edge=0.22, hiss=0.15, rise=3.2, fall=4.5, turn=0.0),
    dict(d=(0.43, 0.50), pk=(0.40, 0.48), f0=(200, 280), f1=(1100, 1450), f2=(420, 560), q=(1.0, 1.25), body=1.0, edge=0.0, hiss=0.02, rise=1.5, fall=2.6, turn=0.0, lp=2600),
    dict(d=(0.27, 0.32), pk=(0.32, 0.40), f0=(520, 660), f1=(2300, 2900), f2=(950, 1250), q=(1.7, 2.3), body=0.45, edge=0.08, hiss=0.12, rise=1.3, fall=3.0, turn=0.65),
]


@sound('swing_mid', 4)
def swing_mid(rng, k):
    # (the pilot's code, kept as it was so the takes stay the ones that were approved)
    K = SWING_KINDS[k % len(SWING_KINDS)]
    U = lambda key: rng.uniform(*K[key])
    d = U('d')
    t = tvec(d)
    u = t / d
    pk = U('pk')
    e = np.where(u < pk, (u / pk) ** K['rise'], np.exp(-(u - pk) / (1 - pk) * K['fall']))
    if K['turn']:
        p2 = pk + rng.uniform(0.22, 0.3)
        w2 = rng.uniform(0.07, 0.1)
        e = e + K['turn'] * np.exp(-0.5 * ((u - p2) / w2) ** 2)
        e /= e.max()
    f0, f1, f2 = U('f0'), U('f1'), U('f2')
    fc = np.where(u < pk, f0 * (f1 / f0) ** (u / pk), f1 * (f2 / f1) ** ((u - pk) / (1 - pk)))
    air = svf(pink(d, rng), fc, U('q')) * e
    body = svf(pink(d, rng), fc * rng.uniform(0.28, 0.38), 0.9) * e * K['body']
    hiss = hp(white(d, rng), rng.uniform(3800, 5200)) * e ** 2.5 * K['hiss']
    y = air + body + hiss
    if K['edge']:
        y += svf(white(d, rng), fc * rng.uniform(1.25, 1.4), rng.uniform(14, 22)) * e ** 1.4 * K['edge']
    if K.get('lp'):
        y = lp(y, K['lp'], 2)
    return fade(y, 0.004, 0.03)


# a big overhead; a weapon spun up as a fighter readies (two passes); a low, broad cut
HEAVY_KINDS = [
    dict(d=(0.50, 0.56), pk=(0.42, 0.50), f0=(150, 200), f1=(800, 1000), f2=(300, 380), q=(0.9, 1.1), body=1.0, hiss=0.02, rise=1.8, fall=2.4, lp=2200, low=0.7),
    dict(d=(0.62, 0.70), pk=(0.28, 0.34), f0=(180, 230), f1=(900, 1150), f2=(350, 450), q=(1.0, 1.2), body=0.9, hiss=0.02, rise=1.5, fall=2.4, turn=0.85, lp=2400, low=0.5),
    dict(d=(0.48, 0.54), pk=(0.50, 0.56), f0=(130, 170), f1=(700, 880), f2=(260, 330), q=(0.8, 1.0), body=1.2, hiss=0.0, rise=2.4, fall=2.8, lp=1800, low=0.9),
]


@sound('swing_heavy', 3)
def swing_heavy(rng, k):
    return swing_of(rng, HEAVY_KINDS[k])


# ---------- blows ----------
@sound('hit_cut', 4)
def hit_cut(rng, k):
    d = 0.32
    t = tvec(d)
    slice_ = hp(white(d, rng), 2600) * env_exp(t, 0.006) * 0.75
    shk = bp(white(d, rng), 4200, 9500) * env_ad(t, 0.001, 0.022) * 0.35
    meat = lp(white(d, rng), rng.uniform(340, 480), 4) * env_ad(t, 0.002, 0.05) * 2.4
    sub = sweep_sine(pitch_drop(t, 150, 55, 0.06)) * env_ad(t, 0.001, 0.07) * 0.65
    cloth = bp(white(d, rng), 1200, 3600) * env_ad(t, 0.002, 0.03) * grain(d, 320, rng) * 0.35
    wet = bp(white(d, rng), 520, 1150) * env_ad(t, 0.004, 0.026) * 0.22
    y = slice_ + shk + meat + sub + cloth + wet
    return fade(sat(y / np.max(np.abs(y)), 1.7), 0.0005, 0.05)


@sound('hit_blunt', 4)
def hit_blunt(rng, k):
    d = 0.32
    t = tvec(d)
    j = rng.uniform(0.92, 1.08)
    y = impact(rng, d, thump=dict(f=380 * j, tau=0.055, g=3.0), sub=dict(f0=120 * j, f1=45, tf=0.06, tau=0.07, g=1.0),
               knock=dict(lo=150, hi=500, tau=0.03, g=1.2), cloth=dict(g=0.3), drive=1.6)
    if k == 1:          # a fist: the knuckles' slap on the cloth
        y = P(y) + P(hp(white(d, rng), 1800) * env_exp(t, 0.004)) * db(-9)
    elif k == 2:        # a club of wood: its knock
        y = P(y) + P(wood_knock(rng, d, 250, 900, 5, 0.03, 0.4)) * db(-7)
    elif k == 3:        # a bottle that holds: a dull glassy thunk
        y = P(y) + P(modes(d, rng.uniform(900, 2400, 4), rng.uniform(0.5, 1, 4), rng.uniform(0.012, 0.03, 4), rng)) * db(-10)
    return fade(y, 0.0005, 0.05)


@sound('hit_bullet', 3)
def hit_bullet(rng, k):
    d = 0.32
    y = impact(rng, d, crack=dict(f=3000, tau=0.003, g=1.2), thump=dict(f=500, tau=0.035, g=2.2),
               sub=dict(f0=180, f1=70, tf=0.03, tau=0.05, g=0.8), cloth=dict(g=0.4), drive=1.7)
    rip = tear(rng, rng.uniform(0.05, 0.08), rate=(160, 260), lo=1200, hi=6000)
    y = P(y)
    place(y, P(rip), rng.uniform(0.004, 0.01), db(-8))
    return fade(y, 0.0004, 0.05)


@sound('crit_cut', 3)
def crit_cut(rng, k):
    d = 0.55
    y = P(impact(rng, d, crack=dict(f=2400, tau=0.007, g=0.9), thump=dict(f=420, tau=0.07, g=3.2),
                 sub=dict(f0=130, f1=42, tf=0.07, tau=0.09, g=1.2), knock=dict(lo=180, hi=600, tau=0.04, g=1.0), cloth=dict(g=0.3),
                 wet=dict(f=1300, tf=0.04, q=3, tau=0.05, g=0.5), drive=1.8))
    bone = crunch(rng, 0.2, n=rng.integers(25, 40), span=0.025, lo=900, hi=6000)
    place(y, P(bone), rng.uniform(0.003, 0.008), db(-7))
    return fade(y, 0.0004, 0.08)


@sound('crit_blunt', 3)
def crit_blunt(rng, k):
    d = 0.55
    t = tvec(d)
    y = P(impact(rng, d, thump=dict(f=330, tau=0.08, g=3.4), sub=dict(f0=100, f1=36, tf=0.08, tau=0.1, g=1.3),
                 knock=dict(lo=120, hi=450, tau=0.045, g=1.2), cloth=dict(g=0.25), limbs=2, drive=1.8))
    bone = crunch(rng, 0.15, n=rng.integers(15, 25), span=0.015, lo=700, hi=4500)
    place(y, P(bone), rng.uniform(0.002, 0.006), db(-8))
    y += P(hp(white(d, rng), 2000) * env_exp(t, 0.005)) * db(-12)
    if k == 2:          # a table brought down on him: wood in it
        place(y, P(snap(rng, 0.3, 12, 0.02, 1200, 6000, 0.6)), 0.004, db(-9))
    return fade(y, 0.0004, 0.08)


@sound('finish_through', 2)
def finish_through(rng, k):
    d = 0.78
    t = tvec(d)
    y = P(impact(rng, d, crack=dict(f=2200, tau=0.005, g=0.8), thump=dict(f=380, tau=0.05, g=2.5),
                 sub=dict(f0=140, f1=50, tf=0.05, tau=0.06, g=0.9), wet=dict(f=1400, tf=0.05, q=3, tau=0.08, g=1.0), drive=1.6))
    place(y, P(crunch(rng, 0.15, 30, 0.02, 800, 5000)), rng.uniform(0.03, 0.05), db(-7))
    place(y, P(tear(rng, 0.22, wet=True, rate=(120, 200))), 0.04, db(-9))
    # the blade drawn back out: steel sliding, the edge's partials singing faintly, a wet draw
    at = rng.uniform(0.36, 0.42)
    sd = 0.26
    ts = tvec(sd)
    e = bump(sd, 1.2) * np.exp(-ts / 0.2)
    src = bp(white(sd, rng), 2000, 8000) * grain(sd, 220, rng, 0.1)
    out = src * e * 0.5
    for f in rng.uniform(2800, 7000, 4):
        out += svf(src, f * (1 + 0.03 * ts / sd), 35) * e * 0.5
    out += svf(white(sd, rng), 600 + 700 * ts / sd, 4) * e * grain(sd, 90, rng, 0.3) * 0.8
    place(y, P(out), at, db(-6))
    return fade(y, 0.0004, 0.08)


@sound('finish_neck', 2)
def finish_neck(rng, k):
    d = 0.6
    lead = 0.07
    y = np.zeros(N(d))
    place(y, P(whoosh(rng, lead + 0.02, 600, 2600, 2000, 0.85, q=1.8, body=0.4, hiss=0.1)), 0, db(-12))
    cd = d - lead
    t = tvec(cd)
    chop = P(impact(rng, cd, crack=dict(f=2000, tau=0.006, g=1.1), thump=dict(f=450, tau=0.05, g=2.8),
                    sub=dict(f0=150, f1=55, tf=0.05, tau=0.06, g=0.9), wet=dict(f=1200, tf=0.03, q=3, tau=0.05, g=0.8), drive=1.9))
    chop += P(crunch(rng, cd, rng.integers(40, 55), 0.02, 700, 6000)) * db(-5)
    chop += P(tear(rng, cd, wet=True, rate=(150, 240), env=env_ad(t, 0.004, 0.06))) * db(-8)
    chop *= np.where(t < 0.28, 1.0, np.exp(-(t - 0.28) / 0.012))          # cut off short
    place(y, chop, lead)
    return fade(y, 0.0004, 0.03)


# ---------- blocks, weapons and bodies ----------
@sound('clang', 4)
def clang(rng, k):
    d = 0.68
    t = tvec(d)
    imp = hp(white(d, rng), 1500) * env_exp(t, 0.0025) * 1.0
    fs = np.sort(rng.uniform(1500, 9500, 12))
    amps = rng.uniform(0.5, 1.0, 12) * (fs / 2000) ** -0.55
    taus = 0.28 * (fs / 1500) ** -0.8 * rng.uniform(0.7, 1.3, 12)
    ring = modes(d, fs, amps, taus, rng)
    for f in rng.choice(fs[:8], 3, replace=False):
        ring += modes(d, [f * rng.uniform(1.002, 1.006)], [0.45 * (f / 2000) ** -0.55], [0.22 * (f / 1500) ** -0.8], rng)
    scrape = np.zeros_like(t)
    s_d = rng.uniform(0.04, 0.09)
    sc = bp(white(s_d, rng), 2500, 7500) * grain(s_d, 55, rng, 0.0) * env_ad(tvec(s_d), 0.004, s_d * 0.5)
    place(scrape, sc, rng.uniform(0.004, 0.012), 0.55)
    flex = modes(d, rng.uniform(560, 900, 2), [0.5, 0.3], [0.06, 0.045], rng)
    y = imp + ring * 0.45 + scrape + flex * 0.35
    return fade(y, 0.0003, 0.08)


@sound('clang_light', 3)
def clang_light(rng, k):
    d = 0.4
    t = tvec(d)
    y = P(metal(rng, d, rng.uniform(1600, 2200), rng.uniform(7000, 9000), n=8, tau=0.12, imp=0.5, imp_f=2500, beats=1, ring=0.55))
    y += P(bp(white(d, rng), 600, 2000) * env_exp(t, 0.006)) * db(-8)
    if k == 1:          # a pot: its brass body under the tink
        y += P(modes(d, rng.uniform(600, 1200, 3), [1, 0.7, 0.5], rng.uniform(0.08, 0.15, 3), rng)) * db(-8)
    elif k == 2:        # a dagger out of the belt: a quick scrape first
        out = np.zeros(N(d))
        sd = 0.05
        place(out, P(bp(white(sd, rng), 3000, 8000) * grain(sd, 260, rng, 0.1) * bump(sd, 1)), 0, db(-10))
        place(out, y, 0.035)
        y = out
    return fade(y, 0.0003, 0.05)


@sound('shing', 3)
def shing(rng, k):
    d = 0.62
    t = tvec(d)
    ex = rng.uniform(0.2, 0.26)          # the tip leaves the throat
    run = np.clip(t / ex, 0, 1) ** 1.5 * np.where(t < ex, 1.0, np.exp(-(t - ex) / 0.008))
    leather = bp(white(d, rng), 500, 2500) * grain(d, 120, rng, 0.2) * run
    src = bp(white(d, rng), 2000, 9000) * grain(d, 300, rng, 0.0) * run
    ring = np.zeros(N(d))
    for f in np.sort(rng.uniform(2500, 9000, 7)):
        ring += svf(src, f * (1 + 0.04 * np.clip(t / ex, 0, 1)), 40)
    free = np.zeros(N(d))
    place(free, metal(rng, d - ex, 2500, 9000, n=10, tau=0.3, imp=0.0, beats=2, ring=1.0), ex)
    air = np.zeros(N(d))
    place(air, whoosh(rng, 0.2, 1200, 3500, 2000, 0.3, q=1.6, body=0.2, hiss=0.15), ex - 0.05)
    y = P(ring) + P(leather) * db(-10) + P(free) * db(-5) + P(air) * db(-12)
    return fade(y, 0.003, 0.08)


@sound('crack', 3)
def crack(rng, k):
    d = 0.48
    pre = rng.uniform(0.02, 0.04)          # the fibres going before it breaks
    y = np.zeros(N(d))
    place(y, P(crinkle(rng, pre + 0.01, 1200, 1500, 7000, None, (0.0005, 0.0015))), 0, db(-14))
    thick = [0.8, 1.0, 1.25][k]
    place(y, P(snap(rng, d - pre, rng.integers(30, 46), 0.05, 1000, 7000, 0.9 * thick)), pre)
    return fade(y, 0.0005, 0.06)


@sound('bottle_smash', 3)
def bottle_smash(rng, k):
    d = 0.75
    t = tvec(d)
    y = P(glass(rng, d, shards=(45, 70), fmin=2200, fmax=11000, span=0.02, fall=(14, 26), fall_span=0.5, crack_g=1.0, floor=0.0,
                tink=(1800, 3000)))
    thunk = lp(white(d, rng), 350, 4) * env_ad(t, 0.001, 0.03) + modes(d, rng.uniform(1200, 2500, 3), [1, 0.6, 0.4], [0.015, 0.012, 0.01], rng)
    y += P(thunk) * db(-6)
    return fade(y, 0.0003, 0.08)


@sound('drop_blade', 3)
def drop_blade(rng, k):
    d = 0.75

    def hit(i):
        x = metal(rng, 0.6, 700, 7000, n=12, tau=0.22, tau_exp=0.7, imp=0.7, imp_f=1500, beats=2, ring=0.5)
        place(x, metal(rng, 0.4, 1200, 8000, n=6, tau=0.08, imp=0.5, beats=0, ring=0.4), rng.uniform(0.012, 0.03), 0.6)
        x += hp(white(0.6, rng), 2000) * env_exp(tvec(0.6), 0.0015) * 0.6
        return x

    y = bounces(rng, d, hit, rng.integers(3, 5), gap=rng.uniform(0.1, 0.14), ratio=0.55, decay=0.45)
    return fade(y, 0.0003, 0.1)


@sound('drop_gun', 3)
def drop_gun(rng, k):
    d = 0.7
    if k < 2:          # a handgun: steel and polymer, a short bounce, a slide
        def hit(i):
            x = metal(rng, 0.3, 400, 3500, n=8, tau=0.05, imp=0.8, imp_f=1800, beats=0, ring=0.6)
            x += bp(white(0.3, rng), 300, 1400) * env_exp(tvec(0.3), 0.015) * 1.2
            return x
        y = bounces(rng, d, hit, 2, gap=rng.uniform(0.08, 0.1), ratio=0.5, decay=0.4)
        place(y, P(bp(white(0.08, rng), 1500, 6000) * grain(0.08, 200, rng, 0.2) * bump(0.08, 1)), rng.uniform(0.16, 0.2), 0.15)
    else:              # Kael's rifle: the stock and the barrel land apart
        def hit(i):
            x = wood_knock(rng, 0.4, 150, 900, 6, 0.04, 0.5)
            place(x, metal(rng, 0.35, 500, 4000, n=10, tau=0.12, imp=0.6, beats=1, ring=0.6), rng.uniform(0.04, 0.06), 0.8)
            return x
        y = bounces(rng, d, hit, 2, gap=0.13, ratio=0.5, decay=0.35)
    return fade(y, 0.0003, 0.08)


@sound('thud_light', 4)
def thud_light(rng, k):
    d = 0.32
    t = tvec(d)

    def foot():
        x = lp(white(d, rng), 320, 4) * env_ad(t, 0.002, 0.03) * 2.5
        x += sweep_sine(pitch_drop(t, 100, 60, 0.03)) * env_ad(t, 0.002, 0.04) * 0.5
        x += hp(white(d, rng), 1500) * env_exp(t, 0.002) * 0.25
        return x

    y = foot()
    place(y, foot(), rng.uniform(0.015, 0.045), rng.uniform(0.6, 0.9))
    cloth = bp(white(d, rng), 1000, 4500) * grain(d, 260, rng) * np.concatenate([bump(0.12, 1.5), np.zeros(N(d) - N(0.12))])
    y = P(y) + P(cloth) * db(-12 if k < 3 else -7)
    return fade(y, 0.0005, 0.05)


@sound('thud', 4)
def thud(rng, k):
    d = 0.48
    t = tvec(d)
    sub = sweep_sine(pitch_drop(t, 88, 40, 0.12)) * env_ad(t, 0.002, 0.09) * 0.9
    body = lp(white(d, rng), 380, 4) * env_ad(t, 0.002, 0.06) * 3.0
    knock = bp(white(d, rng), 150, 420) * env_ad(t, 0.001, 0.035) * 1.6
    y = sub + body + knock
    for _ in range(rng.integers(2, 4)):
        dd = 0.1
        limb = lp(white(dd, rng), 650, 4) * env_ad(tvec(dd), 0.001, 0.025) * rng.uniform(0.5, 1.0)
        place(y, limb, rng.uniform(0.03, 0.15), 1.0)
    cloth = bp(white(d, rng), 1500, 5000) * env_ad(t, 0.006, 0.08) * grain(d, 260, rng) * 0.2
    y = y + cloth
    return fade(sat(y / np.max(np.abs(y)), 1.4), 0.0005, 0.06)


@sound('thud_heavy', 3)
def thud_heavy(rng, k):
    d = 0.6
    y = P(impact(rng, d, thump=dict(f=330, tau=0.085, g=3.5), sub=dict(f0=75, f1=32, tf=0.1, tau=0.16, g=1.6),
                 knock=dict(lo=120, hi=450, tau=0.045, g=1.2), cloth=dict(g=0.25), limbs=3, drive=1.8))
    rattle = np.zeros(N(d))
    for _ in range(rng.integers(5, 9)):
        if rng.random() < 0.5:
            x = wood_knock(rng, 0.1, 600, 2500, 3, 0.012, 0.6)
        else:
            x = metal(rng, 0.15, 2000, 7000, n=3, tau=0.03, imp=0.4, beats=0, ring=0.6)
        place(rattle, x, rng.uniform(0.03, 0.3), rng.uniform(0.4, 1.0))
    y += P(rattle) * db(-16)
    return fade(y, 0.0004, 0.08)


@sound('thud_dirt', 3)
def thud_dirt(rng, k):
    d = 0.5
    t = tvec(d)
    body = lp(white(d, rng), 300, 4) * env_ad(t, 0.004, 0.07) * 3 + sweep_sine(pitch_drop(t, 80, 40, 0.1)) * env_ad(t, 0.003, 0.09)
    for _ in range(rng.integers(2, 4)):
        place(body, lp(white(0.1, rng), 500, 4) * env_ad(tvec(0.1), 0.002, 0.03), rng.uniform(0.04, 0.16), rng.uniform(0.6, 1.2))
    stalks = crinkle(rng, d, 1400, 1200, 6500, env_ad(t, 0.002, 0.08), (0.0006, 0.0025))
    y = P(body) + P(stalks) * db(-8)
    for _ in range(rng.integers(2, 4)):
        place(y, P(snap(rng, 0.1, 8, 0.01, 1500, 6000, 0.2)), rng.uniform(0.01, 0.15), db(-14))
    y += P(hp(pink(d, rng), 1500) * env_ad(t, 0.01, 0.12)) * db(-20)
    return fade(y, 0.0005, 0.08)


@sound('thud_metal', 3)
def thud_metal(rng, k):
    d = 0.65
    t = tvec(d)
    body = lp(white(d, rng), 380, 4) * env_ad(t, 0.002, 0.05) * 3 + sweep_sine(pitch_drop(t, 65, 38, 0.1)) * env_ad(t, 0.002, 0.2) * 0.8
    deck = metal(rng, d, rng.uniform(85, 110), 1600, n=14, tau=0.35, tau_exp=0.6, amp_exp=0.4, imp=0.3, imp_f=800, beats=2, ring=0.7)
    y = P(body) + P(deck) * db(-3)
    for _ in range(rng.integers(2, 4)):
        place(y, P(metal(rng, 0.2, 200, 2000, n=6, tau=0.06, imp=0.3, beats=0, ring=0.5)), rng.uniform(0.04, 0.16), db(-12))
    return fade(y, 0.0004, 0.1)


# ---------- Kael's arc-blade ----------
@sound('arc_unroll', 2)
def arc_unroll(rng, k):
    # A tight steel ratchet, not a scale: the nine segments snap out quick and dry (each a latch and its catch, no pitch that
    # climbs), steel sliding on steel under them, the blade cutting air as it grows, and the last segment seating heavier.
    d = 0.42
    y = np.zeros(N(d))
    gaps = np.array([0.033, 0.030, 0.027, 0.025, 0.023, 0.022, 0.024, 0.029]) * rng.uniform(0.86, 1.14, 8)
    times = 0.01 + np.concatenate([[0.0], np.cumsum(gaps)])
    for i, at in enumerate(times[:-1]):
        cd = 0.03
        tc = tvec(cd)
        nm = rng.integers(5, 8)
        click = hp(white(cd, rng), 1500) * env_exp(tc, rng.uniform(0.0006, 0.001))
        click += modes(cd, rng.uniform(2200, 9500, nm), rng.uniform(0.3, 1.0, nm), rng.uniform(0.003, 0.009, nm), rng) * 0.6
        click += bp(white(cd, rng), 600, 1800) * env_exp(tc, 0.004) * 0.5
        catch = hp(white(cd, rng), 2500) * env_exp(tc, 0.0006) * rng.uniform(0.35, 0.55)
        place(click, catch, rng.uniform(0.0025, 0.004))
        place(y, click, at, rng.uniform(0.75, 1.0) * (0.85 + 0.15 * i / 8))
    end = times[-1]
    sd = 0.08
    ts = tvec(sd)
    seat = modes(sd, [rng.uniform(1300, 1500), rng.uniform(2600, 3000), rng.uniform(4100, 4600)], [1, 0.6, 0.4], [0.02, 0.014, 0.01], rng)
    seat += bp(white(sd, rng), 400, 1200) * env_exp(ts, 0.006) * 0.8 + hp(white(sd, rng), 2000) * env_exp(ts, 0.0012)
    place(y, seat, end, 1.0)
    t = tvec(d)
    run = np.clip(t / end, 0, 1) * (t < end) + (t >= end) * np.exp(-(t - end) / 0.012)
    friction = bp(white(d, rng), 2500, 6500) * smooth_random(d, 450, rng, 0.3, 1.0) * run ** 1.2 * 0.1
    swish = svf(pink(d, rng), 700 * (2600 / 700) ** np.clip(t / end, 0, 1), 1.2) * run ** 1.6 * 0.3
    return fade(y + friction + swish, 0.001, 0.05)


@sound('arc_lock', 2)
def arc_lock(rng, k):
    d = 1.0
    t = tvec(d)
    clack = modes(d, [1150 * rng.uniform(0.97, 1.03), 1930, 2750], [1, 0.6, 0.4], [0.04, 0.03, 0.022], rng)
    clack += hp(white(d, rng), 1200) * env_exp(t, 0.002) * 0.9
    clack += sweep_sine(pitch_drop(t, 170, 80, 0.02)) * env_exp(t, 0.03) * 0.5
    bells = np.zeros_like(t)
    for f0 in (1568, 2349, 3136):
        f0 *= rng.uniform(0.998, 1.002)
        b = modes(d, [f0, f0 * 1.0006, f0 * 2.0, f0 * 2.76, f0 * 4.07], [1, 0.45, 0.35, 0.2, 0.08],
                  np.array([0.3, 0.28, 0.2, 0.16, 0.11]) * rng.uniform(0.9, 1.1), rng, attack=0.003)
        place(bells, b, 0.008, 0.2)
    y = clack + bells
    y = convolve(y, ir(0.6, rng, bright=7000), 0.15)[:N(d)]
    return fade(y, 0.0005, 0.12)


@sound('arc_reroll', 2)
def arc_reroll(rng, k):
    # The segments slide home: the same dry ratchet as the unroll, softer and slowing as the blade gets shorter, steel sliding
    # under it, the air of the blade falling away; a soft seated click at the end.
    d = 0.72
    y = np.zeros(N(d))
    gaps = np.array([0.024, 0.025, 0.027, 0.029, 0.032, 0.036, 0.041, 0.048]) * rng.uniform(0.88, 1.12, 8)
    times = 0.012 + np.concatenate([[0.0], np.cumsum(gaps)])
    for i, at in enumerate(times[:-1]):
        cd = 0.03
        tc = tvec(cd)
        nm = rng.integers(4, 7)
        click = hp(white(cd, rng), 1300) * env_exp(tc, rng.uniform(0.0006, 0.001)) * 0.8
        click += modes(cd, rng.uniform(1800, 7000, nm), rng.uniform(0.3, 1.0, nm), rng.uniform(0.003, 0.008, nm), rng) * 0.6
        click += bp(white(cd, rng), 500, 1500) * env_exp(tc, 0.004) * 0.5
        place(click, hp(white(cd, rng), 2500) * env_exp(tc, 0.0006) * rng.uniform(0.3, 0.5), rng.uniform(0.0025, 0.004))
        place(y, click, at, rng.uniform(0.7, 0.95) * (1.0 - 0.25 * i / 8))
    end = times[-1]
    sd = 0.1
    ts = tvec(sd)
    seat = modes(sd, [rng.uniform(900, 1100), rng.uniform(2100, 2400)], [1, 0.5], [0.022, 0.014], rng)
    seat += lp(white(sd, rng), 400, 2) * env_exp(ts, 0.01) * 1.2 + hp(white(sd, rng), 1500) * env_exp(ts, 0.001) * 0.5
    place(y, seat, end + 0.006, 0.6)
    t = tvec(d)
    run = np.clip(1 - t / end, 0, 1) ** 0.7 * (t < end)
    friction = bp(white(d, rng), 1800, 5500) * smooth_random(d, 380, rng, 0.3, 1.0) * run * 0.1
    swish = svf(pink(d, rng), 2200 * (700 / 2200) ** np.clip(t / end, 0, 1), 1.2) * run ** 1.4 * 0.22
    return fade(y + friction + swish, 0.001, 0.05)


@sound('arc_lash', 3)
def arc_lash(rng, k):
    d = 0.5
    t = tvec(d)
    ct = rng.uniform(0.26, 0.32)          # the crack at full length
    y = np.zeros(N(d))
    at, i = 0.0, 0
    while at < ct - 0.004:          # the links running out, faster and faster
        u = at / ct
        x = modes(0.03, rng.uniform(2000, 8000, 3), rng.uniform(0.5, 1, 3), rng.uniform(0.003, 0.009, 3), rng)
        x += hp(white(0.03, rng), 2500) * env_exp(tvec(0.03), 0.0006) * 0.6
        place(y, x, at, 0.25 + 0.75 * u ** 1.5)
        at += 1 / (45 + 95 * u ** 1.3) * rng.uniform(0.85, 1.15)
        i += 1
    run = np.clip(t / ct, 0, 1) ** 2 * (t < ct)
    air = svf(pink(d, rng), 600 * (3500 / 600) ** np.clip(t / ct, 0, 1), 1.4) * run
    crack_ = np.zeros(N(d))
    m = N(0.0003)
    crack_[N(ct):N(ct) + m] = np.linspace(1, -1, m) * 1.5
    tc = np.clip(t - ct, 0, None)
    crack_ += (hp(white(d, rng), 2000) * env_exp(tc, 0.002) * 1.4 + bp(white(d, rng), 800, 3000) * env_exp(tc, 0.006) * 0.8) * (t >= ct)
    after = np.zeros(N(d))
    place(after, chain_rattle(rng, d - ct, 8, 0.08, 3000, 9000, 1.0), ct + 0.004)
    out = P(crack_) + P(y) * db(-9) + P(air) * db(-12) + P(after) * db(-16)
    return fade(out, 0.002, 0.05)


# ---------- Kael's magic and elven speed ----------
GLASS_RATIOS = [1.0, 1.52, 2.03, 2.71, 3.4, 4.6]


def shimmer(rng, d, f0, ratios=GLASS_RATIOS, stagger=0.06, tau=(0.15, 0.3), rise=0.03, glide=0.0, am=(18, 30), am_depth=0.25, attack=0.004):
    """a cluster of glassy partials blooming in, the lower first; a slight glide up; a faint shimmer on each"""
    t = tvec(d)
    y = np.zeros(N(d))
    for i, r in enumerate(ratios):
        f = f0 * r * rng.uniform(0.995, 1.005) * (1 + glide * np.minimum(t / rise, 1))
        a = 1 / (i + 1) ** 0.6
        st = stagger * i / max(1, len(ratios) - 1) * rng.uniform(0.7, 1.3)
        e = np.clip((t - st) / attack, 0, 1) * np.exp(-np.clip(t - st, 0, None) / rng.uniform(*tau))
        sh = 1 - am_depth + am_depth * np.sin(TAU * rng.uniform(*am) * t + rng.uniform(0, TAU))
        y += sweep_sine(f, a, rng.uniform(0, TAU)) * e * sh
    return y


@sound('bolt', 3)
def bolt(rng, k):
    d = 0.5
    t = tvec(d)
    f0 = rng.uniform(1400, 1800)
    sh = shimmer(rng, d, f0, stagger=0.07, tau=(0.12, 0.25), rise=0.1, glide=0.03)
    pk = rng.uniform(0.25, 0.36)
    air = whoosh(rng, d, 1500, 6500, 3000, pk, q=2.5, body=0.1, hiss=0.3)
    y = P(sh) + P(air) * db(-5)
    y = convolve(y, ir(0.6, rng, bright=8000), 0.15)[:N(d)]
    return fade(y, 0.002, 0.08)


@sound('bolt_hit', 3)
def bolt_hit(rng, k):
    d = 0.45
    t = tvec(d)
    pop = hp(white(d, rng), 1800) * env_exp(t, 0.003) + lp(white(d, rng), 300, 4) * env_exp(t, 0.015) * 1.2
    pop += modes(d, rng.uniform(3000, 9000, 6), rng.uniform(0.4, 1, 6), rng.uniform(0.02, 0.06, 6), rng) * 0.5
    fizz = crinkle(rng, d, 400, 4000, 11000, env_exp(t, 0.12), (0.0003, 0.001))
    fizz += hp(white(d, rng), 5000) * env_exp(t, 0.1) * 0.15
    fc = rng.uniform(2600, 3300)
    chime = np.zeros(N(d))
    place(chime, bell(rng, d - 0.01, fc, partials=((1, 1), (2.0, 0.3), (2.76, 0.2)), tau=0.14, attack=0.003), 0.01)
    y = P(pop) + P(fizz) * db(-10) + P(chime) * db(-16)
    return fade(y, 0.0004, 0.08)


@sound('gale', 2)
def gale(rng, k):
    d = 1.1
    t = tvec(d)
    push = whoosh(rng, d, 180, 1100, 380, 0.22, q=0.8, body=1.1, hiss=0.05, rise=1.2, fall=2.0, low=0.8)
    e = pass_env(t / d, 0.22, 1.2, 2.0)
    swirl = svf(pink(d, rng), 520 * (1 + 0.5 * np.sin(TAU * rng.uniform(6, 8) * t)), 2.0) * e
    leaves = rustle(rng, d, 900, 1500, 7000, env_ad(t, 0.08, 0.35), snaps=3)
    dust = hp(pink(d, rng), 2500) * e
    thump = sweep_sine(pitch_drop(t, 65, 35, 0.08)) * env_ad(t, 0.004, 0.12) + lp(brown(d, rng), 100, 2) * env_ad(t, 0.004, 0.1)
    y = P(push) + P(swirl) * db(-8) + P(leaves) * db(-10) + P(dust) * db(-16) + P(thump) * db(-3)
    return fade(y, 0.003, 0.15)


@sound('blink', 3)
def blink(rng, k):
    d = 0.62
    t = tvec(d)
    to = rng.uniform(0.18, 0.24)          # gone
    ti = to + rng.uniform(0.05, 0.09)          # back
    gone = np.exp(-np.clip(to - t, 0, None) / 0.06) * (t < to)
    inward = svf(pink(d, rng), 4000 * (900 / 4000) ** np.clip(t / to, 0, 1), 2.0) * gone
    f0 = rng.uniform(1800, 2300)
    glassy = np.zeros(N(d))
    for i, r in enumerate(GLASS_RATIOS[:5]):
        glassy += sweep_sine(f0 * r * (1 - 0.06 * np.clip(t / to, 0, 1)), 1 / (i + 1) ** 0.6, rng.uniform(0, TAU))
    glassy *= gone ** 1.5
    back = np.zeros(N(d))
    bd = d - ti
    tb = tvec(bd)
    pop = hp(white(bd, rng), 2500) * env_exp(tb, 0.002) * 0.8 + bp(white(bd, rng), 1000, 4000) * env_exp(tb, 0.02) * 0.5
    pop += shimmer(rng, bd, rng.uniform(2600, 3200), stagger=0.02, tau=(0.12, 0.22), am=(20, 32), am_depth=0.3) * 0.7
    place(back, pop, ti)
    y = P(inward) * db(-6) + P(glassy) * db(-12) + P(back)
    y = convolve(y, ir(0.5, rng, bright=8000), 0.18)[:N(d)]
    return fade(y, 0.003, 0.08)


@sound('vault', 3)
def vault(rng, k):
    d = rng.uniform(0.3, 0.36)
    t = tvec(d)
    pk = rng.uniform(0.38, 0.5)
    air = whoosh(rng, d, 300, 1500, 600, pk, q=1.1, body=0.7, hiss=0.06)
    e = pass_env(t / d, pk, 2.0, 3.0)
    gate = np.zeros(N(d))
    at = 0.0
    while at < d:
        fd = rng.uniform(0.012, 0.025)
        place(gate, bump(fd, 2) * rng.uniform(0.5, 1.0), at)
        at += 1 / rng.uniform(20, 28)
    flutter_ = bp(white(d, rng), 300, 2500) * gate * e
    y = P(air) + P(flutter_) * db(-7)
    return fade(y, 0.003, 0.03)


@sound('wow', 2)
def wow(rng, k):
    d = 1.3
    t = tvec(d)
    sw = 0.12
    swell = svf(brown(d, rng), 200 * (900 / 200) ** np.clip(t / sw, 0, 1), 0.7, 'lp') * np.where(t < sw, (t / sw) ** 2, np.exp(-(t - sw) / 0.06))
    boom = np.zeros(N(d))
    bd = d - sw
    tb = tvec(bd)
    b = sweep_sine(pitch_drop(tb, 52, 38, 0.3)) * env_ad(tb, 0.03, 0.55) + lp(brown(bd, rng), 120, 2) * env_ad(tb, 0.02, 0.4) * 0.6
    place(boom, fade(b, 0.0, 0.4), sw)
    gold = np.zeros(N(d))
    fs = np.sort(rng.uniform(1100, 4200, 8))
    g = np.zeros(N(bd))
    for f in fs:
        g += modes(bd, [f, f * 1.003], [1, 0.7], [rng.uniform(0.6, 0.9)] * 2, rng, attack=0.1) * (f / 1100) ** -0.5
    place(gold, fade(g, 0.0, 0.4), sw)
    y = P(boom) + P(swell) * db(-10) + P(gold) * db(-15)
    y = convolve(y, ir(1.5, rng, bright=6000), 0.3)[:N(d + 0.3)]
    return fade(y, 0.005, 0.3)


# ---------- guns ----------
@sound('shot_pistol', 4)
def shot_pistol(rng, k):
    d = 0.9
    t = tvec(d)
    nw = np.zeros_like(t)
    m = N(0.0007)
    nw[:m] = np.linspace(1, -1, m)
    blast = hp(white(d, rng), 700) * env_exp(t, 0.007) * 1.2
    body = bp(white(d, rng), 150, 1500) * env_ad(t, 0.0005, 0.03) * 1.4
    thump = sweep_sine(pitch_drop(t, 110, 55, 0.03)) * env_exp(t, 0.04) * 0.7
    dry = sat(nw * 1.6 + blast + body + thump, 2.5)
    j = rng.uniform(0.92, 1.08)
    wet = echoes(dry, [(0.072 * j, 0.32, 3500), (0.128 * j, 0.22, 2800), (0.19 * j, 0.15, 2200), (0.27 * j, 0.1, 1800)])
    y = convolve(wet, ir(0.9, rng, bright=2600), 0.16)
    return fade(y[:N(d)], 0.0, 0.15)


@sound('shot_rifle', 3)
def shot_rifle(rng, k):
    d = 1.3
    fr = rng.uniform(3000, 3400)

    def extra(t):
        bark = bp(white(len(t) / SR, rng), 900, 4000) * env_ad(t, 0.004, 0.018) * 1.0
        ring = modes(len(t) / SR, [fr, fr * 1.502, fr * 1.997], [1, 0.6, 0.4], [0.4, 0.3, 0.22], rng, attack=0.002) * 0.035
        return bark + ring
    return gunshot(rng, d, 'street', crack=2.0, blast=(500, 0.01, 1.6), body=(100, 1300, 0.045, 1.7), thump=(95, 42, 0.06, 1.1),
                   drive=2.6, wet_k=1.2, extra=extra)


@sound('shot_smg', 4)
def shot_smg(rng, k):
    return gunshot(rng, 0.42, 'hall', crack=1.4, blast=(900, 0.005, 1.1), body=(200, 2200, 0.02, 1.2), thump=(130, 70, 0.025, 0.6),
                   drive=2.4, wet_k=0.8)


@sound('shot_mg', 3)
def shot_mg(rng, k):
    return gunshot(rng, 0.55, 'street', crack=1.8, blast=(450, 0.009, 1.5), body=(90, 1100, 0.04, 1.6), thump=(80, 38, 0.07, 1.4),
                   drive=2.8, wet_k=0.9)


@sound('gun_dryfire', 3)
def gun_dryfire(rng, k):
    d = 0.16
    t = tvec(d)
    y = hp(white(d, rng), 3000) * env_exp(t, 0.0006) * 0.4
    hd = d - 0.012
    th = tvec(hd)
    hammer = metal(rng, hd, 1500, 7000, n=6, tau=0.012, imp=1.0, imp_f=2000, beats=0, ring=0.5)
    hammer += bp(white(hd, rng), 700, 1600) * env_exp(th, 0.008) * 0.6
    place(y, hammer, rng.uniform(0.006, 0.012))
    return fade(y, 0.0002, 0.03)


@sound('ricochet', 4)
def ricochet(rng, k):
    d = 0.65
    t = tvec(d)
    chip = hp(white(d, rng), 1500) * env_exp(t, 0.003) * 1.2 + bp(white(d, rng), 600, 2500) * env_ad(t, 0.0005, 0.01) * 0.8
    chip = P(chip) + P(crunch(rng, d, 15, 0.01, 1500, 9000)) * db(-8)
    chip += P(crinkle(rng, d, 300, 2000, 8000, env_exp(t, 0.12))) * db(-14)
    whine = ricochet_whine(rng, rng.uniform(0.35, 0.5), (2800, 4200), (900, 1600), 1.0)
    place(chip, P(whine), rng.uniform(0.008, 0.02), db(-7))
    y = space(rng, chip, 'street', 0.5)
    return fade(y[:N(d)], 0.0003, 0.1)


@sound('bullet_ground', 3)
def bullet_ground(rng, k):
    d = 0.35
    t = tvec(d)
    thwack = hp(white(d, rng), 1200) * env_exp(t, 0.004) + bp(white(d, rng), 400, 1800) * env_exp(t, 0.01) * 0.9
    thwack += lp(white(d, rng), 250, 4) * env_exp(t, 0.015) * 1.5
    y = P(thwack) + P(crinkle(rng, d, 900, 1500, 9000, env_exp(t, 0.06))) * db(-8)
    y += P(hp(white(d, rng), 2500) * grain(d, 200, rng) * env_ad(t, 0.002, 0.07)) * db(-10)
    y = space(rng, y, 'street', 0.4)
    return fade(y[:N(d)], 0.0003, 0.06)


@sound('bullet_metal', 4)
def bullet_metal(rng, k):
    d = 0.3
    y = P(metal(rng, d, 1800, 9000, n=10, tau=0.09, imp=1.2, imp_f=2500, beats=2, ring=0.55))
    y += P(chain_rattle(rng, d, 10, 0.06, 3500, 9500, 1.0)) * db(-9)
    z = np.zeros(N(d))
    place(z, ricochet_whine(rng, 0.15, (4500, 6000), (2500, 3500), 1.0), 0.005)
    y += P(z) * db(-12)
    return fade(y, 0.0003, 0.05)


@sound('casing', 4)
def casing(rng, k):
    d = 0.5

    def hit(i):
        return metal(rng, 0.2, 3500, 12000, n=6, tau=0.05, tau_exp=0.5, imp=0.5, imp_f=4000, beats=1, ring=0.6)
    y = bounces(rng, d, hit, rng.integers(4, 7), gap=rng.uniform(0.07, 0.1), ratio=0.62, decay=0.6)
    return fade(y, 0.0003, 0.06)


@sound('bullet_whiz', 3)
def bullet_whiz(rng, k):
    d = 0.3
    t = tvec(d)
    pk = rng.uniform(0.3, 0.4)
    u = t / d
    e = pass_env(u, pk, 3.0, 5.0)
    fc = rng.uniform(5500, 7000) * (rng.uniform(1600, 2000) / 6500) ** u
    y = svf(white(d, rng), fc, 5) * e + sweep_sine(fc * 0.6) * e * 0.15
    return fade(y, 0.002, 0.03)
