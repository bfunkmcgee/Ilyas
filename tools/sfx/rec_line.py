# The Line and the Deep Station: the family's railway under the city, the goblins on the flatcar, Ixet's station.
import numpy as np
from gens import *
from amb import *
from reg import sound
from rec_fights import P, GLASS_RATIOS


@sound('amb_station_loop', kind='loop', L=20)
def amb_station_loop(rng, k):
    L = 20
    lamps = unit(hum(L, 50, ((1, 0.5), (2, 1.0), (3, 0.3), (4, 0.2)), buzz=0.05, beat=0.4))
    t = tvec(L)
    crystal = np.zeros(N(L))
    for f in (2093, 3136, 4186):
        crystal += closed_sine(f, L, t) * (0.6 + 0.4 * lfo(rng.integers(2, 5), L, rng.uniform(0, TAU)))
    lamps_st = np.stack([lamps + unit(crystal) * db(-14), lamps * 0.8 + unit(crystal) * db(-17)])
    src = pink(L, rng)
    moan = lambda r, f: unit(periodic(pink(L, r), lambda x: svf(x, f, 3)) * circ_am(r, L, 0.5, 0.5, 1.0)) \
        + 0.6 * unit(periodic(pink(L, r), lambda x: bp(x, 300, 1200)) * circ_am(r, L, 0.4, 0.4, 1.0))
    wind_ = pan(moan(rng, 180), -0.7) + pan(moan(rng, 210), 0.7) * 0.8
    drip = pan(drops(rng, L, rate=0.5, f=(700, 1800)), -0.4) + pan(drops(rng, L, rate=0.5, f=(700, 1800)), 0.5)
    wet = conv_circ(unit(wind_) + unit(drip) * db(-2), ir(2.4, rng, bright=4500, stereo=True), 0.5)
    return lamps_st * db(-7) + unit(wet)


@sound('train_idle_loop', kind='loop', L=6)
def train_idle_loop(rng, k):
    L = 6
    t = tvec(L)
    drone = np.zeros(N(L))
    for h, a in ((1, 1.0), (2, 0.6), (3, 0.35), (4, 0.2), (5, 0.1)):
        drone += a * closed_sine(55 * h, L, t)
        if h in (2, 3):
            drone += a * 0.5 * closed_sine(55 * h + 0.5, L, t)          # a slow beat in it
    warm = periodic(brown(L, rng), lambda x: lp(x, 200))
    crystal = closed_sine(1760, L, t) * (0.7 + 0.3 * lfo(3, L)) + 0.6 * closed_sine(2640, L, t) * (0.7 + 0.3 * lfo(5, L, 1.0))
    tk = np.zeros(N(L))
    for i in range(20):          # the valve gear ticking over
        x = metal(rng, 0.05, 1500, 5000, n=3, tau=0.008, imp=0.4, beats=0, ring=0.5) + wood_knock(rng, 0.05, 400, 1500, 3, 0.008, 0.3)
        place_wrap(tk, x, i * L / 20 + rng.normal(0, 0.006), rng.uniform(0.6, 1.0))
    return unit(drone) + unit(warm) * db(-12) + unit(crystal) * db(-28) + unit(tk) * db(-16)


@sound('train_depart', 1)
def train_depart(rng, k):
    d = 4.3
    t = tvec(d)
    y = np.zeros((2, N(d)))
    for i, at in enumerate((0.15, 0.48, 0.85, 1.2)):          # the couplings taking up, down the train
        x = metal(rng, 0.8, 150, 2500, n=12, tau=0.2, imp=0.8, beats=1, ring=0.6) + lp(white(0.8, rng), 250, 4) * env_ad(tvec(0.8), 0.002, 0.03) * 2
        x = lp(x, 6000 - 1100 * i)
        place(y, pan(P(x), -0.5 + 0.35 * i), at + rng.uniform(-0.03, 0.03), db(-2 - 3 * i))
    v = np.clip((t - 0.6) / 3.7, 0, 1) ** 1.5          # speed
    f = 55 * (1 + 0.45 * v)
    drone = sum(a * sweep_sine(f * h) for h, a in ((1, 1.0), (2, 0.6), (3, 0.35), (4, 0.2)))
    drone += 0.03 * sweep_sine(1760 * (1 + 0.45 * v))
    drone *= 0.5 + 0.5 * np.clip(t / 2.5, 0, 1)
    rumble = lp(brown(d, rng), 150, 2) * (0.1 + 0.9 * v) * grain(d, 20, rng, 0.6)
    clacks = np.zeros(N(d))
    dist = np.cumsum(v) / SR * 9.0          # metres travelled
    joint = 3.0
    for m in np.arange(joint, dist[-1], joint):
        i = np.searchsorted(dist, m)
        for off in (0.0, 1.8):
            j = np.searchsorted(dist, m + off)
            if j < N(d):
                place(clacks, metal(rng, 0.25, 300, 3000, n=8, tau=0.03, imp=0.8, beats=0, ring=0.5), j / SR, rng.uniform(0.6, 1.0))
    squeal = svf(white(d, rng), 2800, 30) * np.exp(-0.5 * ((t - 1.6) / 0.25) ** 2)
    mid = P(drone) * db(-6) + P(rumble) * db(-4) + P(clacks) * db(-10) + P(squeal) * db(-26)
    y = y + np.stack([mid, mid]) * 0.9
    return fade(convolve(y, ir(1.2, rng, bright=3500, stereo=True), 0.2)[:, :N(d)], 0.003, 0.3)


@sound('rail_loop', kind='loop', L=12)
def rail_loop(rng, k):
    L = 12
    rumble = diffuse(lambda r: unit(periodic(brown(L, r), lambda x: bp(x, 35, 260)) * circ_am(r, L, 18, 0.6, 1.0)), rng)
    roar = diffuse(lambda r: unit(periodic(pink(L, r), lambda x: peak(peak(bp(x, 150, 1500), 320, 3, 6), 680, 3, 4))), rng)
    air = diffuse(lambda r: unit(periodic(pink(L, r), lambda x: bp(x, 600, 5000)) * circ_am(r, L, 0.8, 0.7, 1.0)), rng)
    y = rumble + roar * db(-3) + air * db(-7)
    return y + 0.3 * np.roll(y, N(0.009), axis=-1)          # the tunnel's walls close by


@sound('rail_clack', 4)
def rail_clack(rng, k):
    d = 0.4

    def knock():
        x = metal(rng, 0.3, 300, 3000, n=10, tau=0.03, imp=0.8, imp_f=1200, beats=0, ring=0.5)
        return x + lp(white(0.3, rng), 200, 4) * env_ad(tvec(0.3), 0.002, 0.02) * 2

    y = np.zeros(N(d))
    place(y, P(knock()), 0)
    place(y, P(knock()), rng.uniform(0.06, 0.09), rng.uniform(0.7, 0.9))
    return fade(space(rng, y, 'tunnel', 0.5)[:N(d)], 0.0003, 0.08)


def creature(rng, d, f0, formants, env, rasp=0.5, growl=0.3, jit=0.04, shim=0.2, sub=0.0):
    return voice(rng, d, f0, formants, rasp=rasp, jit=jit, shim=shim, growl=growl, sub=sub, env=env)


def syllable(rng, sd, base, form):
    """one goblin chitter: a quick rasp of a syllable, its pitch flicking"""
    t = tvec(sd)
    f0 = base * (1 + rng.uniform(-0.25, 0.3) * t / sd)
    return creature(rng, sd, f0, form, bump(sd, 1.2)[:N(sd)], rasp=0.6, growl=0.3)


@sound('goblin_chitter', 1)
def goblin_chitter(rng, k):
    d = 3.2
    y = np.zeros((2, N(d)))
    for g in range(5):
        p = rng.uniform(-0.85, 0.85)
        far = rng.uniform(0.3, 1.0)
        form = [(rng.uniform(1100, 1400), 4, 1.0), (rng.uniform(2300, 2700), 5, 0.7), (rng.uniform(3500, 4000), 6, 0.4)]
        track = np.zeros(N(d))
        for _ in range(rng.integers(2, 4)):          # runs of chatter
            at = rng.uniform(0, 2.6)
            base = rng.uniform(450, 850)
            for _ in range(rng.integers(4, 10)):
                sd = rng.uniform(0.03, 0.08)
                place(track, syllable(rng, sd, base * rng.uniform(0.85, 1.2), form), at, rng.uniform(0.5, 1.0))
                at += 1 / rng.uniform(9, 14)
        for _ in range(rng.integers(1, 3)):          # a hiss
            hd = rng.uniform(0.2, 0.4)
            place(track, bp(white(hd, rng), 2000, 7000) * bump(hd, 1.5) * 0.4, rng.uniform(0, d - hd))
        for _ in range(rng.integers(1, 3)):          # teeth
            at = rng.uniform(0, d - 0.3)
            for i in range(rng.integers(3, 7)):
                place(track, hp(white(0.01, rng), 3000) * env_exp(tvec(0.01), 0.0008) * 0.8, at + i / rng.uniform(28, 40))
        track = P(track)
        if far < 0.6:
            track = lp(track, 1500 + 4000 * far)
        place(y, pan(track, p), 0, far)
    y = convolve(y, ir(1.4, rng, bright=3500, stereo=True), 0.35)[:, :N(d)]
    return fade(y, 0.005, 0.3)


@sound('goblin_drop', 3)
def goblin_drop(rng, k):
    d = 0.55
    t = tvec(d)
    y = P(lp(white(d, rng), 400, 4) * env_ad(t, 0.002, 0.025) + sweep_sine(pitch_drop(t, 120, 60, 0.03)) * env_ad(t, 0.002, 0.04) * 0.5)
    y += P(metal(rng, d, rng.uniform(100, 120), 1500, n=12, tau=0.25, imp=0.2, imp_f=800, beats=1, ring=0.6)) * db(-8)
    cl = np.zeros(N(d))
    at = rng.uniform(0.02, 0.04)
    end = rng.uniform(0.18, 0.3)
    while at < end:          # its claws scrabbling for a grip
        x = hp(white(0.02, rng), 2500) * env_exp(tvec(0.02), 0.003) + metal(rng, 0.02, 2500, 7000, n=2, tau=0.004, imp=0.2, beats=0, ring=0.4)
        place(cl, x, at, rng.uniform(0.4, 1.0))
        at += 1 / rng.uniform(15, 30)
    y += P(cl) * db(-9)
    return fade(y, 0.0003, 0.08)


GOBLIN_FORM = [(2600, 5, 1.0), (3900, 6, 0.6), (1300, 3, 0.5)]


@sound('goblin_squeal', 4)
def goblin_squeal(rng, k):
    d = rng.uniform(0.38, 0.5)
    t = tvec(d)
    u = t / d
    base = rng.uniform(900, 1200)
    f0 = base * (1 + 0.35 * np.sin(np.pi * np.minimum(u * 1.3, 1)) ** 0.7) * (1 + 0.03 * np.sin(TAU * 28 * t))
    env = np.minimum(t / 0.02, 1) * np.exp(-np.clip(t - 0.08, 0, None) / (d * 0.45))
    y = creature(rng, d, f0, GOBLIN_FORM, env, rasp=1.0, growl=0.5, jit=0.09, shim=0.4)
    y = P(y) + P(hp(white(d, rng), 3000) * env) * db(-14)
    return fade(y, 0.003, 0.05)


@sound('goblin_snarl', 4)
def goblin_snarl(rng, k):
    d = 0.42
    t = tvec(d)
    y = np.zeros(N(d))
    hd = 0.12
    place(y, P(bp(white(hd, rng), 2500, 7000) * env_ad(tvec(hd), 0.01, 0.05)), 0, db(-5))
    sd = 0.3
    ts = tvec(sd)
    f0 = rng.uniform(190, 230) * (1 + 0.2 * np.sin(np.pi * ts / sd))
    sn = creature(rng, sd, f0, [(800, 3, 1.0), (1800, 4, 0.8), (3000, 5, 0.5)], bump(sd, 1.0)[:N(sd)], rasp=0.9, growl=0.8, sub=0.5)
    place(y, P(sn), 0.06)
    return fade(y, 0.003, 0.05)


@sound('goblin_death', 3)
def goblin_death(rng, k):
    d = 0.5
    t = tvec(d)
    cut = rng.uniform(0.32, 0.42)
    f0 = rng.uniform(1050, 1250) * (0.6 + 0.4 * np.exp(-t / 0.2)) * (1 + 0.05 * smooth_random(d, 18, rng, -1, 1))
    env = np.minimum(t / 0.015, 1) * np.where(t < cut, 1.0, np.exp(-(t - cut) / 0.006))
    y = creature(rng, d, f0, GOBLIN_FORM, env, rasp=1.1, growl=0.6, jit=0.1, shim=0.4, sub=0.3)
    return fade(P(y), 0.002, 0.03)


@sound('splat', 3)
def splat(rng, k):
    d = 0.45
    y = P(impact(rng, d, crack=dict(f=2500, tau=0.004, g=0.4), thump=dict(f=450, tau=0.04, g=2.5), sub=dict(f0=150, f1=60, tf=0.04, tau=0.05, g=0.6),
                 wet=dict(f=1600, tf=0.04, q=3, tau=0.06, g=1.5), drive=1.6))
    place(y, P(tear(rng, 0.15, wet=True, rate=(150, 250))), 0.01, db(-6))
    for _ in range(rng.integers(6, 12)):          # what spatters after
        x = bp(white(0.03, rng), 800, 3000) * env_exp(tvec(0.03), 0.006)
        place(y, P(x), rng.uniform(0.05, 0.35), db(rng.uniform(-20, -12)))
    return fade(y, 0.0003, 0.06)


@sound('brake', 2)
def brake(rng, k):
    d = 2.7
    t = tvec(d)
    env = np.clip(t / 0.25, 0, 1) * np.clip((2.55 - t) / 0.35, 0, 1)
    y = np.zeros(N(d))
    # the wheels squeal on a few modes at once, each wandering and catching, and the squeal jumps between them
    for i, f in enumerate(rng.uniform(2400, 3600, 4) * (1.0 if k == 0 else 0.88)):
        fw = f * (1 + 0.012 * smooth_random(d, 3, rng, -1, 1) + 0.004 * smooth_random(d, 9, rng, -1, 1))
        am = 1 - 0.35 * (0.5 + 0.5 * np.sin(TAU * np.cumsum(rng.uniform(18, 35) * (1 + 0.2 * smooth_random(d, 2, rng, -1, 1))) / SR))
        on = np.clip(smooth_random(d, 2.5, rng, -0.6, 1.4), 0, 1)
        tone_ = sweep_sine(fw) + 0.25 * sweep_sine(2 * fw) + 0.1 * sweep_sine(3 * fw)
        y += tone_ * am * on * rng.uniform(0.5, 1.0)
        y += svf(white(d, rng), fw, 60) * on * 0.6
    y *= env * smooth_random(d, 6, rng, 0.6, 1.0)
    hiss = hp(white(d, rng), 2500) * np.exp(-0.5 * ((t - 0.25) / 0.1) ** 2)
    grind = lp(brown(d, rng), 300, 2) * env * grain(d, 15, rng, 0.5)
    y = P(y) + P(hiss) * db(-14) + P(grind) * db(-9)
    return fade(space(rng, y, 'tunnel', 0.6)[:N(d)], 0.005, 0.15)


@sound('ixet_roar', 2)
def ixet_roar(rng, k):
    d = 1.6
    t = tvec(d)
    f0 = (75 + 20 * np.sin(np.pi * np.clip(t / 0.4, 0, 1)) * np.exp(-np.clip(t - 0.2, 0, None) / 0.6) - 8 * t / d) * rng.uniform(0.94, 1.06)
    env = np.minimum(t / 0.08, 1) * np.where(t < 1.15, 1.0, np.exp(-(t - 1.15) / 0.15))
    v1 = creature(rng, d, f0, [(180, 2, 0.8), (320, 3, 1.0), (720, 4, 0.8), (1400, 4, 0.5), (2600, 5, 0.3)], env, rasp=0.5, growl=0.7, sub=0.5,
                  jit=0.03, shim=0.2)
    v2 = creature(rng, d, f0 * 2.01, [(600, 3, 0.6), (1500, 4, 0.5), (3000, 5, 0.3)], env * 0.5, rasp=0.6, growl=0.5)
    hiss = bp(white(d, rng), 1500, 6000) * np.clip((t - 0.6) / 0.5, 0, 1) * env * grain(d, 30, rng, 0.5)
    chest = lp(brown(d, rng), 120, 2) * env
    y = sat(P(v1) + P(v2) * db(-6) + P(hiss) * db(-8) + P(chest) * db(-6), 2.0)
    return fade(space(rng, y, 'vault', 1.0)[:N(d + 0.8)], 0.005, 0.4)


@sound('ixet_hiss', 3)
def ixet_hiss(rng, k):
    d = 1.1
    t = tvec(d)
    env = np.minimum(t / 0.1, 1) * np.where(t < 0.8, 1.0, np.exp(-(t - 0.8) / 0.1))
    hiss = bp(white(d, rng), 500, 3500) * env * smooth_random(d, 4, rng, 0.6, 1.0)
    f0 = rng.uniform(48, 60) * (1 + 0.08 * smooth_random(d, 5, rng, -1, 1))
    growl = creature(rng, d, f0, [(250, 3, 1.0), (600, 4, 0.7), (1100, 4, 0.4)], env, rasp=0.8, growl=0.9, sub=0.6)
    y = P(hiss) * db(-3) + P(growl) + P(lp(brown(d, rng), 100, 2) * env) * db(-8)
    return fade(y, 0.005, 0.1)


@sound('tail_swing', 2)
def tail_swing(rng, k):
    d = 0.55
    t = tvec(d)
    st = rng.uniform(0.36, 0.42)
    y = np.zeros(N(d))
    place(y, P(whoosh(rng, st + 0.05, 150, 900, 300, 0.75, q=0.9, body=1.0, hiss=0.02, low=0.6)), 0)
    y += P(crinkle(rng, d, 800, 2000, 6000, pass_env(t / (st + 0.05), 0.75, 2.2, 3.4))) * db(-18)
    sd = d - st
    ts = tvec(sd)
    slap = hp(white(sd, rng), 1000) * env_exp(ts, 0.008) + lp(white(sd, rng), 300, 4) * env_exp(ts, 0.03) * 2 + bp(white(sd, rng), 600, 2500) * env_exp(ts, 0.015)
    place(y, P(slap), st, db(1))
    return fade(y, 0.003, 0.06)


@sound('tail_writhe', 1)
def tail_writhe(rng, k):
    d = 2.0
    y = np.zeros(N(d))
    at = 0.0
    while at < d - 0.15:
        rate = 9 - 7 * at / d
        n = rng.integers(1, 4)          # it twitches in little bursts
        for i in range(n):
            sd = 0.12
            ts = tvec(sd)
            if rng.random() < 0.55:
                x = lp(white(sd, rng), 350, 4) * env_ad(ts, 0.002, 0.02) * 2 + svf(white(sd, rng), 900 + 600 * np.exp(-ts / 0.02), 3) * env_ad(ts, 0.003, 0.03)
            else:
                x = bp(white(sd, rng), 1000, 5000) * grain(sd, 150, rng, 0.2) * bump(sd, 1.5) * 0.6
            place(y, x, at + i * rng.uniform(0.03, 0.06), rng.uniform(0.4, 1.0) * (1 - 0.6 * at / d))
        at += 1 / rate * rng.uniform(0.7, 1.4)
    t = tvec(d)
    under = bp(white(d, rng), 900, 4500) * grain(d, 40, rng, 0.1) * (1 - 0.7 * t / d) * smooth_random(d, 7, rng, 0.2, 1.0)
    y = P(y) + P(under) * db(-16)          # the scales never quite still on the tile
    return fade(y, 0.003, 0.1)


@sound('cage_gate', 2)
def cage_gate(rng, k):
    d = 1.15
    t = tvec(d)
    end = rng.uniform(0.7, 0.75) if k == 0 else rng.uniform(0.55, 0.6)
    run = np.clip(t / 0.05, 0, 1) * (t < end)
    rat = np.zeros(N(d))
    at = 0.02
    while at < end:
        place(rat, metal(rng, 0.08, 1500, 6000, n=3, tau=0.015, imp=0.4, beats=0, ring=0.6), at, rng.uniform(0.3, 1.0))
        at += 1 / rng.uniform(25, 40)
    track = lp(white(d, rng), 700, 2) * grain(d, 20, rng, 0.4) * run
    y = P(rat) * db(-6) + P(track) * db(-8)
    cd = d - end
    tc = tvec(cd)
    clang_ = P(metal(rng, cd, 300, 4000, n=12, tau=0.3, imp=0.8, beats=2, ring=0.6)) + P(lp(white(cd, rng), 300, 4) * env_ad(tc, 0.002, 0.03)) * db(-6)
    place(y, clang_, end, db(-2) if k == 0 else db(0))
    if k == 1:
        place(y, P(metal(rng, 0.1, 2000, 6000, n=4, tau=0.012, imp=0.6, beats=0, ring=0.5)), end + 0.04, db(-10))
    return fade(y, 0.005, 0.1)


@sound('freight_start', 1)
def freight_start(rng, k):
    d = 1.25
    t = tvec(d)
    y = P(metal(rng, d, 90, 900, n=12, tau=0.15, imp=0.6, imp_f=600, ring=0.6)) + P(lp(white(d, rng), 250, 4) * env_ad(t, 0.002, 0.04)) * db(-2)
    place(y, P(creak(rng, 0.35, 50, 70, 0.3, ((250, 4), (600, 4), (1300, 3)))), 0.08, db(-9))
    m = np.clip((t - 0.25) / 0.2, 0, 1)
    f = 30 + 70 * m
    motor = (sweep_sine(f) + 0.5 * sweep_sine(2 * f) + 0.3 * sweep_sine(3 * f) + 0.2 * sweep_sine(11.5 * f)) * m
    motor += bp(brown(d, rng), 40, 300) * m * 2 + bp(white(d, rng), 800, 3000) * m * grain(d, 20, rng, 0.5) * 0.15
    y += P(motor) * db(-5)
    place(y, P(chain_rattle(rng, 0.6, 10, 0.4, 1500, 5000, 1.0)), 0.3, db(-15))
    return fade(y, 0.0003, 0.1)


@sound('freight_loop', kind='loop', L=6)
def freight_loop(rng, k):
    L = 6
    t = tvec(L)
    motor = closed_sine(100, L, t) + 0.5 * closed_sine(200, L, t) + 0.3 * closed_sine(300, L, t)
    whine = closed_sine(1150, L, t) * (0.8 + 0.2 * lfo(3, L)) + 0.3 * closed_sine(2300, L, t)
    cables = periodic(brown(L, rng), lambda x: bp(x, 40, 300)) * circ_am(rng, L, 4, 0.7, 1.0)
    chains = np.zeros(N(L))
    for at in times(rng, L, 2.5):
        place_wrap(chains, metal(rng, 0.3, 150, 2500, n=8, tau=0.08, imp=0.6, beats=1, ring=0.6), at, rng.uniform(0.4, 1.0))
    rattle = np.zeros(N(L))
    for at in times(rng, L, 12):
        place_wrap(rattle, metal(rng, 0.08, 1000, 5000, n=3, tau=0.015, imp=0.4, beats=0, ring=0.6), at, rng.uniform(0.3, 1.0))
    rattle *= circ_am(rng, L, 2, 0.3, 1.0)
    return unit(motor) * db(-6) + unit(whine) * db(-16) + unit(cables) + unit(chains) * db(-8) + unit(rattle) * db(-12)
