# The Roof and the Fall: the helicopter, the man in white and his one round; down the face of the tower, through the Pit, the hay.
import numpy as np
from gens import *
from amb import *
from reg import sound
from rec_fights import P, GLASS_RATIOS, shimmer
from rec_open import gusts


def blade_train(rng, d, rate, blades=4, kern=None, loop=False, spread=(1.0, 0.85, 0.95, 0.8)):
    """a rotor's blade passes: rate (passes a second, a number or a curve) through a thump kernel; each blade its own weight"""
    n = N(d)
    pulses = np.zeros(n)
    if loop:
        k = round(d * rate / blades) * blades
        for i in range(k):
            pulses[int(round(i * n / k)) % n] += spread[i % blades] * (1 + rng.normal(0, 0.03))
        kp = np.zeros(n)
        kp[:len(kern)] = kern
        return np.fft.irfft(np.fft.rfft(pulses) * np.fft.rfft(kp), n)
    ph = np.cumsum(np.broadcast_to(np.asarray(rate, float), (n,))) / SR
    idx = np.nonzero(np.diff(np.floor(ph)) > 0)[0] + 1
    for j, i in enumerate(idx):
        pulses[i] += spread[j % blades] * (1 + rng.normal(0, 0.03))
    return np.convolve(pulses, kern)[:n]


def whop(rng):
    """one main-rotor blade going by: a low thump with a slap on its front"""
    kd = 0.06
    t = tvec(kd)
    return lp(white(kd, rng), 380, 4) * env_ad(t, 0.004, 0.012) * 2 + np.sin(TAU * 70 * t) * env_ad(t, 0.004, 0.015) * 0.8 \
        + hp(white(kd, rng), 1200) * env_exp(t, 0.0015) * 0.25


def buzz_kern(rng):
    kd = 0.01
    return bp(white(kd, rng), 300, 2000) * env_exp(tvec(kd), 0.0015)


@sound('amb_roof_loop', kind='loop', L=20)
def amb_roof_loop(rng, k):
    L = 20
    G = gusts(rng, L, 0.5, (1, 3, 7), 0.3)
    w = diffuse(lambda r: unit(wind(r, L, fc=600, q=0.7, G=G, whistle=0.5, wf=900)), rng)
    sock = pan(unit(flaps(rng, L, G / G.max(), (14, 24), 400, 4000)), 0.5)
    beacon = pan(unit(hum(L, 120, ((1, 1), (2, 0.5), (3, 0.3)), buzz=0.1)), -0.3)
    city = unit(tone(rng, L, 30, 300, 'brown', (0.3, 0.6, 1.0)))
    return w + sock * db(-9) + beacon * db(-23) + city * db(-16)


@sound('heli_loop', kind='loop', L=8)
def heli_loop(rng, k):
    L = 8
    t = tvec(L)
    main = blade_train(rng, L, 22.5, 4, whop(rng), loop=True)
    tail = blade_train(rng, L, 120, 4, buzz_kern(rng), loop=True, spread=(1, 1, 1, 1))
    turb = closed_sine(6150, L, t) + closed_sine(6150.5, L, t) * 0.8 + 0.3 * closed_sine(12300, L, t)
    chop = 1 + 0.15 * np.sin(TAU * round(22.5 * L) / L * t)
    wash = diffuse(lambda r: unit(periodic(pink(L, r), lambda x: bp(x, 100, 2000))) * chop, rng)
    mid = unit(main) + unit(tail) * db(-14) + unit(turb) * db(-24)
    return np.stack([mid, mid]) + wash * db(-5)


@sound('heli_approach', 1)
def heli_approach(rng, k):
    d = 6.0
    t = tvec(d)
    s = np.clip(t / 5.6, 0, 1)
    near = s ** 1.6          # 0 far off, 1 in its hover over the pad
    dop = 1.0 + 0.1 * (1 - s) ** 1.5
    gain = db(-24 * (1 - near))
    main = blade_train(rng, d, 22.5 * dop, 4, whop(rng))
    tail = blade_train(rng, d, 120 * dop, 4, buzz_kern(rng), spread=(1, 1, 1, 1))
    turb = sweep_sine(6150 * dop) + 0.3 * sweep_sine(12300 * dop)
    body = unit(main) + unit(tail) * db(-14) + unit(turb) * db(-24) * near ** 1.5
    body = svf(body, 700 + 9000 * near ** 0.6, 0.7, 'lp') * gain
    wash = np.stack([svf(pink(d, rng), 400 + 1200 * near, 0.8) for _ in range(2)]) * np.clip((t - 3.5) / 2.0, 0, 1) ** 1.5
    y = pan_t(body, -0.6 * (1 - near)) + P(wash) * db(-8) * np.max(np.abs(body))
    y = convolve(y, ir(1.4, rng, bright=2500, stereo=True), 0.25 * (1 - 0.5 * near.mean()))[:, :N(d)]
    return fade(y, 0.5, 0.05)


@sound('heli_door', 1)
def heli_door(rng, k):
    d = 1.25
    t = tvec(d)
    y = P(metal(rng, 0.1, 1500, 6000, n=4, tau=0.012, imp=0.6, beats=0, ring=0.5))
    y = np.concatenate([y, np.zeros(N(d) - len(y))]) * db(-8)
    end = rng.uniform(0.85, 0.9)
    run = np.clip((t - 0.05) / 0.08, 0, 1) * (t < end)
    slide = lp(white(d, rng), 700, 2) * grain(d, 20, rng, 0.4) * run + bp(brown(d, rng), 60, 300) * run * 0.6
    tk = np.zeros(N(d))
    at = 0.08
    while at < end - 0.03:
        place(tk, metal(rng, 0.05, 700, 3500, n=3, tau=0.01, imp=0.3, beats=0, ring=0.6), at, rng.uniform(0.4, 1.0))
        at += 1 / rng.uniform(9, 12)
    y += P(slide) + P(tk) * db(-16)
    cd = d - end
    clunk = P(metal(rng, cd, 200, 2500, n=10, tau=0.08, imp=0.8, beats=1, ring=0.6)) + P(lp(white(cd, rng), 250, 4) * env_ad(tvec(cd), 0.002, 0.03)) * db(-3)
    place(y, clunk, end, db(1))
    return fade(y, 0.002, 0.08)


@sound('hex_charge', 1)
def hex_charge(rng, k):
    d = 1.22
    t = tvec(d)
    pk = 1.15
    u = np.clip(t / pk, 0, 1)
    env = u ** 2 * np.where(t < pk, 1.0, np.exp(-(t - pk) / 0.012))
    f = 70 * 2 ** (1.6 * u)
    hum_ = sum(a * (sweep_sine(f * h, 1.0, rng.uniform(0, TAU)) + 0.6 * sweep_sine(f * h * 1.007, 1.0, rng.uniform(0, TAU)))
               for h, a in ((1, 1.0), (2, 0.6), (3, 0.4), (4, 0.25), (5, 0.15), (6, 0.1)))
    whine = sweep_sine(700 * 2 ** (1.7 * u)) + 0.4 * sweep_sine(1400 * 2 ** (1.7 * u) * 1.003)
    trem = 1 - 0.3 * (0.5 + 0.5 * np.sin(TAU * np.cumsum(6 + 12 * u) / SR))
    crack_ = crinkle(rng, d, 900, 400, 4000, u ** 2, (0.0006, 0.003))
    y = P(lp(hum_, 2500) * env * trem) + P(whine * env * trem) * db(-10) + P(crack_ * env) * db(-8)
    return fade(y, 0.02, 0.02)


@sound('hex_shot', 1)
def hex_shot(rng, k):
    d = 2.3
    t = tvec(d)
    shot = gunshot(rng, 1.0, None, crack=2.2, blast=(400, 0.012, 1.8), body=(80, 1200, 0.06, 1.8), thump=(85, 36, 0.09, 1.6), drive=3.0)
    y = np.zeros(N(d))
    place(y, P(shot), 0)
    fs = np.array([310, 467, 701, 948, 1393, 1811]) * rng.uniform(0.97, 1.03)
    ring = modes(d, fs, [1, 0.8, 0.6, 0.45, 0.3, 0.2], rng.uniform(0.6, 1.2, 6), rng, attack=0.004)
    ring *= (1 - 0.25 * (0.5 + 0.5 * np.sin(TAU * 37 * t))) * np.clip((d - t) / 0.6, 0, 1)
    u = np.clip((t - 0.05) / 1.55, 0, 1)
    fsw = 1300 * 2 ** (-2 * u) * (1 + 0.01 * np.sin(TAU * 6 * t))
    sweep = (sweep_sine(fsw) + svf(white(d, rng), fsw, 8) * 0.5) * np.sin(np.pi * u) ** 1.5 * (t > 0.05)
    y = y + P(ring) * db(-7) + P(sweep) * db(-11)
    y = echoes(np.stack([y, y]), [(0.35, 0.15, 1500), (0.6, 0.08, 1000)])
    y = convolve(y, ir(0.5, rng, bright=3000, stereo=True), 0.08)
    return fade(y[:, :N(d + 0.5)], 0.0, 0.3)


@sound('hex_wound', 1)
def hex_wound(rng, k):
    d = 0.65
    y = P(impact(rng, d, crack=dict(f=2500, tau=0.004, g=0.3), thump=dict(f=380, tau=0.07, g=3.0), sub=dict(f0=110, f1=40, tf=0.07, tau=0.1, g=1.3),
                 cloth=dict(g=0.3), drive=1.8))
    place(y, P(tear(rng, 0.12, wet=True, rate=(150, 240))), 0.01, db(-7))
    place(y, P(tear(rng, 0.05, rate=(200, 300), lo=1500, hi=6000)), 0.03, db(-12))
    return fade(y, 0.0004, 0.08)


@sound('aether_drain', 1)
def aether_drain(rng, k):
    # (the pilot's code)
    d = 2.4
    t = tvec(d)
    u = np.clip(t / 2.0, 0, 1)
    env = np.minimum(t / 0.12, 1) * (1 - u) ** 1.6
    flick = 1 - 0.55 * u ** 1.5 * smooth_random(d, 22, rng, 0, 1)
    y = np.zeros_like(t)
    for i, f0 in enumerate([1320, 1985, 2650, 3530, 4410, 5290]):
        f = f0 * rng.uniform(0.995, 1.005) * 2 ** (-1.4 * u ** 1.3)
        y += sweep_sine(f, 1 / (i + 1) ** 0.7, rng.uniform(0, TAU))
    y *= env * flick * 0.3
    for _ in range(70):
        at = rng.beta(1.2, 2.6) * 2.0
        gd = rng.uniform(0.006, 0.025)
        gf = rng.uniform(3000, 9000) * (1 - 0.45 * at / 2.0)
        g = np.sin(TAU * gf * tvec(gd)) * np.sin(np.pi * np.linspace(0, 1, N(gd))) ** 2
        place(y, g, at, 0.08 * (1 - at / 2.2))
    hum_ = (sweep_sine(220 * 2 ** (-u)) + 0.3 * sweep_sine(330 * 2 ** (-u))) * np.minimum(t / 0.2, 1) * (1 - u) ** 1.2 * 0.12
    air = hp(white(d, rng), 4000) * env * 0.03
    y = y + hum_ + air
    y = convolve(y, ir(1.5, rng, bright=7000), 0.35)[:N(d)]
    return fade(y, 0.002, 0.3)


@sound('over_edge', 1)
def over_edge(rng, k):
    d = 1.6
    t = tvec(d)
    y = np.zeros((2, N(d)))
    sd = 0.18
    scr = bp(white(sd, rng), 800, 4000) * grain(sd, 120, rng, 0.2) * bump(sd, 1)
    place(y, pan(P(scr), 0.0), 0, db(-10))
    for c in range(2):
        w = whoosh(rng, 1.5, 300, 1500, 250, 0.28, q=0.9, body=1.0, hiss=0.1, rise=1.6, fall=2.2, low=0.6)
        place(y[c], P(w), 0.05)
    away = np.clip((t - 0.4) / 1.1, 0, 1)
    rush = np.stack([svf(pink(d, rng), 3000 * (400 / 3000) ** away, 0.7, 'lp') * (1 - 0.8 * away) * np.clip(t / 0.15, 0, 1) for _ in range(2)])
    y = y + P(rush) * db(-6)
    return fade(y, 0.003, 0.2)


@sound('fall_wind_loop', kind='loop', L=20)
def fall_wind_loop(rng, k):
    # (the pilot's code)
    L = 20.0
    chans = []
    for c in range(2):
        r = np.random.default_rng(rng.integers(1 << 30))
        roar = periodic(pink(L, r), lambda x: lp(x, 520, 2)) * (0.8 + 0.2 * lfo(1, L, r.uniform(0, TAU)))
        fc = 950 * (1 + 0.32 * lfo(3, L, r.uniform(0, TAU)) + 0.18 * lfo(7, L, r.uniform(0, TAU)))
        rush_src = pink(L, r)
        rush = svf(np.concatenate([rush_src] * 3), np.concatenate([fc] * 3), 0.7)[N(L):2 * N(L)]
        wf = 1250 * (1 + 0.28 * lfo(2, L, r.uniform(0, TAU)) + 0.1 * lfo(5, L, r.uniform(0, TAU)))
        wh_src = white(L, r)
        whistle = svf(np.concatenate([wh_src] * 3), np.concatenate([wf] * 3), 16)[N(L):2 * N(L)]
        whistle *= 0.55 + 0.45 * lfo(4, L, r.uniform(0, TAU))
        gate = np.zeros(N(L))
        at = 0.0
        while at < L:
            fd = r.uniform(0.022, 0.05)
            bump_ = np.sin(np.pi * np.linspace(0, 1, N(fd))) ** 2 * r.uniform(0.35, 1.0)
            place_wrap(gate, bump_, at)
            at += 1 / r.uniform(9, 15)
        flap = periodic(white(L, r), lambda x: bp(x, 280, 2800)) * gate
        chans.append(roar * 1.0 + rush * 0.8 + whistle * 0.16 + flap * 0.45)
    a, b = chans
    return np.stack([0.75 * a + 0.25 * b, 0.25 * a + 0.75 * b])


def body_hit(rng, d, g=1.0, thump_f=320, sub=(80, 36)):
    t = tvec(d)
    x = lp(white(d, rng), thump_f, 4) * env_ad(t, 0.002, 0.06) * 3 + sweep_sine(pitch_drop(t, sub[0], sub[1], 0.08)) * env_ad(t, 0.002, 0.12)
    return fade(P(x) * g, 0.0, min(0.1, d * 0.3))


@sound('pit_steel', 2)
def pit_steel(rng, k):
    d = 1.1
    t = tvec(d)
    y = body_hit(rng, d)
    y += P(metal(rng, d, rng.uniform(60, 75), 2500, n=16, tau=0.7, tau_exp=0.7, imp=0.6, imp_f=900, beats=2, ring=0.7)) * db(-1)
    y += P(modes(d, rng.uniform(90, 250, 3), [1, 0.7, 0.5], [0.5, 0.4, 0.3], rng)) * db(-4)
    y += P(sweep_sine(pitch_drop(t, 55, 35, 0.2)) * env_ad(t, 0.003, 0.3)) * db(-4)
    return fade(y, 0.0004, 0.2)


@sound('pit_wood', 2)
def pit_wood(rng, k):
    d = 0.85
    y = body_hit(rng, d)
    y += P(wood_knock(rng, d, 80, 400, 7, 0.08, 0.5)) * db(-2)
    place(y, P(creak(rng, 0.4, 70, 110, 0.35, ((350, 5), (800, 4), (1700, 3)))), rng.uniform(0.12, 0.18), db(-10))
    return fade(y, 0.0004, 0.1)


@sound('pit_wood_break', 1)
def pit_wood_break(rng, k):
    d = 1.25
    y = body_hit(rng, d)
    for at in (0.0, rng.uniform(0.03, 0.05), rng.uniform(0.08, 0.12)):
        place(y, P(snap(rng, 0.6, 50, 0.08, 900, 7000, 1.2)), at, db(rng.uniform(-3, 0)))
    for _ in range(rng.integers(5, 9)):          # the boards going down after him
        place(y, P(wood_knock(rng, 0.3, 90, 600, 6, 0.06, 0.4)), rng.uniform(0.25, 1.1), db(rng.uniform(-16, -8)))
    return fade(y, 0.0004, 0.12)


@sound('pit_car', 2)
def pit_car(rng, k):
    d = 1.25
    t = tvec(d)
    y = body_hit(rng, d)
    roof = sweep_sine(pitch_drop(t, 300, 150, 0.04)) * env_ad(t, 0.002, 0.06)          # the roof buckling in
    y += P(roof + metal(rng, d, 150, 3000, n=16, tau=0.12, imp=0.8, beats=2, ring=0.5)) * db(-2)
    place(y, P(np.concatenate([crunch(rng, 0.2, 30, 0.03, 800, 5000), np.zeros(N(d) - N(0.2))])), 0.003, db(-8))
    place(y, P(glass(rng, 1.1, shards=(70, 110), fmin=1500, fmax=11000, span=0.03, fall=(30, 50), fall_span=0.8, crack_g=1.0, floor=0.0, big=True)),
          rng.uniform(0.03, 0.06), db(-4))
    place(y, P(chain_rattle(rng, 0.5, 14, 0.3, 1500, 6000, 1.0)), 0.05, db(-15))
    return fade(y, 0.0004, 0.15)


@sound('pit_pipe', 2)
def pit_pipe(rng, k):
    d = 1.05
    t = tvec(d)
    f = rng.uniform(300, 550)
    bonk = modes(d, [f, f * 2.76, f * 5.4, f * 8.93], [1, 0.6, 0.35, 0.2], [0.25, 0.15, 0.09, 0.06], rng)
    y = body_hit(rng, d, db(-2)) + P(bonk + hp(white(d, rng), 1500) * env_exp(t, 0.002) * 0.4) * db(-2)
    bt = rng.uniform(0.06, 0.1)
    bd = d - bt
    tb = tvec(bd)
    burst = P(hp(white(bd, rng), 1000) * env_exp(tb, 0.006) + lp(white(bd, rng), 300, 4) * env_exp(tb, 0.02))
    spray_env = np.clip(tb / 0.02, 0, 1) * np.exp(-tb / 0.3)
    spray = hp(white(bd, rng), 1500) * grain(bd, 120, rng, 0.4) * spray_env + crinkle(rng, bd, 600, 2000, 9000, spray_env) * 0.5
    place(y, burst * db(-4) + P(spray) * db(-10), bt)
    return fade(y, 0.0004, 0.15)


@sound('pit_neon', 2)
def pit_neon(rng, k):
    d = 1.45
    t = tvec(d)
    y = body_hit(rng, d, db(-3))
    for _ in range(rng.integers(3, 6)):          # the tubes going one after another
        place(y, P(glass(rng, 0.5, shards=(20, 35), fmin=2500, fmax=11000, span=0.01, fall=(5, 10), fall_span=0.3, crack_g=1.2, floor=0.0)),
              rng.uniform(0.0, 0.15), db(rng.uniform(-6, -2)))
    on = np.clip((t - 0.01) / 0.01, 0, 1) * np.exp(-t / 0.5) * (smooth_random(d, 25, rng, 0, 1) > 0.35)
    saw = sum(np.sin(TAU * 60 * h * t) / h for h in range(1, 30))
    hum_ = lp(saw, 4000) * lp(on.astype(float), 200)
    sparks = crinkle(rng, d, 400, 3000, 10000, np.exp(-t / 0.4) * (smooth_random(d, 12, rng, 0, 1) > 0.5))
    y += P(hum_) * db(-9) + P(sparks) * db(-9)
    return fade(y, 0.0004, 0.15)


@sound('pit_rock', 3)
def pit_rock(rng, k):
    d = 0.85
    y = body_hit(rng, d, 1.0, 280)
    place(y, P(crunch(rng, 0.2, 15, 0.02, 500, 4000)), 0.002, db(-8))
    for _ in range(rng.integers(4, 8)):          # stones knocked loose, going down
        st = rng.uniform(0.05, 0.6)
        x = modes(0.15, rng.uniform(1000, 5000, 3), [1, 0.6, 0.4], rng.uniform(0.005, 0.015, 3), rng) + lp(white(0.15, rng), 600, 4) * env_ad(tvec(0.15), 0.001, 0.01) * 2
        place(y, P(lp(x, 8000 - 6000 * st)), st, db(rng.uniform(-18, -10)))
    return fade(y, 0.0004, 0.1)


@sound('gravel', 2)
def gravel(rng, k):
    d = 1.05
    t = tvec(d)
    dens = np.clip(t / 0.03, 0, 1) * (0.3 + 0.7 * np.exp(-t / 0.25)) * np.clip((d - t) / 0.3, 0, 1)
    grit = crinkle(rng, d, 1800, 1200, 7000, dens, (0.0005, 0.002)) * dens
    stones = np.zeros(N(d))
    for _ in range(rng.integers(10, 18)):
        at = rng.uniform(0, 0.85)
        x = modes(0.1, rng.uniform(1200, 5000, 3), [1, 0.6, 0.4], rng.uniform(0.004, 0.012, 3), rng) + lp(white(0.1, rng), 700, 4) * env_ad(tvec(0.1), 0.001, 0.008)
        place(stones, x, at, rng.uniform(0.3, 1.0) * (1 - 0.6 * at))
    y = P(grit) + P(stones) * db(-4)
    y = svf(y, 9000 * (2500 / 9000) ** (t / d), 0.7, 'lp')          # going down and away
    return fade(y, 0.002, 0.15)


@sound('spike_impale', 1)
def spike_impale(rng, k):
    d = 1.05
    t = tvec(d)
    y = P(impact(rng, d, crack=dict(f=2500, tau=0.004, g=0.6), thump=dict(f=380, tau=0.04, g=2.5), wet=dict(f=1500, tf=0.04, q=3, tau=0.07, g=1.5), drive=1.7))
    place(y, P(crunch(rng, 0.15, 40, 0.02, 800, 6000)), 0.008, db(-5))
    y += P(metal(rng, d, 200, 1500, n=10, tau=0.3, imp=0.3, imp_f=800, beats=1, ring=0.6)) * db(-12)
    jt = rng.uniform(0.09, 0.14)          # the body brought up short on it
    place(y, body_hit(rng, 0.5, db(-2)), jt)
    place(y, P(tear(rng, 0.06, rate=(200, 300), lo=800, hi=5000)), jt, db(-12))
    place(y, P(creak(rng, 0.4, 60, 90, 0.4, ((300, 5), (700, 4), (1500, 3)))), jt + 0.05, db(-14))
    place(y, P(tear(rng, 0.2, wet=True, rate=(80, 140))), jt + 0.04, db(-14))
    return fade(y, 0.0004, 0.12)


@sound('arm_tear', 5)
def arm_tear(rng, k):
    # five times, each worse than the one before
    d = 0.18 + 0.05 * k
    y = np.zeros(N(0.42))
    place(y, P(tear(rng, d, wet=True, rate=(80 + 25 * k, 140 + 30 * k), env=env_ad(tvec(d), 0.01, d * (0.5 + 0.08 * k)))), 0)
    for _ in range(k):          # sinews going
        sd = 0.06
        ts = tvec(sd)
        tw = sweep_sine(rng.uniform(150, 300) * (1 - 0.3 * ts / sd)) * env_ad(ts, 0.001, 0.012)
        place(y, P(tw), rng.uniform(0.02, d), db(-12 + k))
    y *= db(-6 + 1.5 * k)
    return fade(y, 0.002, 0.05)


@sound('sleeve_tear', 5)
def sleeve_tear(rng, k):
    d = 0.16 + 0.05 * k
    t = tvec(d)
    y = np.zeros(N(0.42))
    rip = tear(rng, d, rate=(120 + 20 * k, 220 + 30 * k), lo=800, hi=5000) + 0.6 * tear(rng, d, rate=(60, 120), lo=400, hi=1500)
    place(y, P(rip), 0)
    y *= db(-6 + 1.5 * k)
    return fade(y, 0.002, 0.05)


@sound('arm_rip', 1)
def arm_rip(rng, k):
    d = 1.05
    t = tvec(d)
    rd = 0.35
    y = np.zeros(N(d))
    place(y, P(tear(rng, rd, wet=True, rate=(200, 320), env=np.minimum(tvec(rd) / 0.03, 1) * np.exp(-tvec(rd) / 0.25))), 0)
    place(y, P(crunch(rng, 0.15, 50, 0.03, 700, 5000)), 0.18, db(-3))
    place(y, P(impact(rng, 0.2, wet=dict(f=1400, tf=0.03, q=3, tau=0.05, g=1.5), thump=dict(f=400, tau=0.03, g=2.0), drive=1.6)), 0.2, db(-5))
    fd = d - 0.3
    tf = tvec(fd)
    away = whoosh(rng, fd, 600, 900, 200, 0.15, q=0.8, body=0.8, hiss=0.05, rise=1.2, fall=2.0)
    place(y, P(svf(away, 4000 * (500 / 4000) ** (tf / fd), 0.7, 'lp')), 0.3, db(-10))
    return fade(y, 0.002, 0.15)


@sound('hay_land', 1)
def hay_land(rng, k):
    d = 1.55
    t = tvec(d)
    y = P(lp(white(d, rng), 200, 4) * env_ad(t, 0.008, 0.12) * 3 + sweep_sine(pitch_drop(t, 70, 40, 0.1)) * env_ad(t, 0.005, 0.15))
    burst = np.clip(t / 0.01, 0, 1) * (0.3 * np.exp(-t / 0.6) + 0.7 * np.exp(-t / 0.15))
    y += P(rustle(rng, d, 1600, 1500, 7000, burst, snaps=6) * burst) * db(-3)
    fall_env = np.clip((t - 0.2) / 0.1, 0, 1) * np.exp(-np.clip(t - 0.2, 0, None) / 0.5)
    y += P(crinkle(rng, d, 500, 1500, 6000, fall_env, (0.001, 0.003))) * db(-14)
    y += P(metal(rng, d, 80, 600, n=8, tau=0.3, imp=0.1, imp_f=500, beats=1, ring=0.6)) * db(-12)
    place(y, P(creak(rng, 0.8, 50, 80, 0.4, ((250, 5), (600, 4), (1300, 3)))), 0.3, db(-14))
    return fade(y, 0.003, 0.2)


@sound('birds_up', 1)
def birds_up(rng, k):
    # (the pilot's code)
    d = 3.3
    y = np.zeros((2, N(d)))
    for b in range(36):
        t0 = min(rng.exponential(0.2), 0.75)
        rate = rng.uniform(7, 11)
        p = rng.uniform(-0.85, 0.85)
        away = rng.uniform(0.7, 1.5)
        at = t0
        i = 0
        while at < d - 0.1:
            dt = at - t0
            far = np.exp(-dt / away)
            if far < 0.04:
                break
            fd = rng.uniform(0.03, 0.05)
            tt = tvec(fd)
            flap = bp(white(fd, rng), 450, 2600) * env_ad(tt, 0.003, 0.014)
            if i < 2:
                flap += hp(white(fd, rng), 1500) * env_exp(tt, 0.004) * 1.6
            flap = lp(flap, 900 + 4500 * far)
            place(y, pan(flap, p), at, far * rng.uniform(0.6, 1.0))
            at += 1 / rate * rng.uniform(0.9, 1.1)
            i += 1
    for _ in range(4):
        cd = rng.uniform(0.14, 0.24)
        tt = tvec(cd)
        u = tt / cd
        f0 = rng.uniform(260, 360) * (1 + 0.25 * np.sin(np.pi * u)) * (1 + 0.02 * np.sin(TAU * 28 * tt))
        ph = np.cumsum(f0) / SR
        src = (np.mod(ph, 1) < 0.18).astype(float) - 0.18
        voice_ = bp(src, 380, 700) + 0.6 * bp(src, 900, 1400)
        voice_ *= np.sin(np.pi * u) ** 1.5
        place(y, pan(voice_, rng.uniform(-0.7, 0.7)), rng.uniform(0.15, 1.4), 0.5)
    y = convolve(y, ir(0.8, rng, bright=5000, stereo=True), 0.2)[:, :N(d)]
    return fade(y, 0.0, 0.4)


@sound('eye_light', 1)
def eye_light(rng, k):
    d = 2.1
    t = tvec(d)
    sw = np.sin(np.pi * np.clip(t / 2.0, 0, 1)) ** 2
    hum_ = (np.sin(TAU * 220 * t) + 0.5 * np.sin(TAU * 330 * t + 1.0)) * sw
    sh = shimmer(rng, d, rng.uniform(3000, 3600), stagger=0.6, tau=(0.8, 1.2), am=(4, 9), am_depth=0.25, attack=0.4) * sw
    y = P(hum_) * db(-6) + P(sh)
    y = convolve(y, ir(1.5, rng, bright=7000), 0.4)[:N(d)]
    return fade(y, 0.05, 0.3)
