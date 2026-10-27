# Sundown and the Field; the Avenue and the Checkpoint. Kael's bike, the riders, the carrier, the blast.
import numpy as np
from gens import *
from amb import *
from reg import sound
from rec_fights import P

BIKE_RES = ((165, 4, 12), (420, 3, 8), (950, 2, 4))          # Kael's cafe racer: its pipes
# the same bike low and slow: a longer, deeper beat, its pipes ringing on between firings, the block's rumble under them
LOW_ENGINE = dict(kern_tau=0.004, kern_lp=1800, res=((85, 6, 12), (240, 4, 8), (650, 2, 4)), muffle=1600, mech=0.06, body=0.7)


def gusts(rng, L, depth=0.35, cyc=(2, 3, 7), lo=0.35):
    """a gust curve over a loop, about 1 on average, never below lo"""
    g = 1 + depth * (0.6 * lfo(cyc[0], L, rng.uniform(0, TAU)) + 0.3 * lfo(cyc[1], L, rng.uniform(0, TAU)) + 0.2 * lfo(cyc[2], L, rng.uniform(0, TAU)))
    return np.maximum(g, lo)


def texture(rng, L, rate, lo, hi, G, power=2.0, size=(0.0006, 0.003)):
    """a loop of tiny dry clicks (grass, leaves, stalks) whose density and level follow G"""
    tail = 0.02
    y = np.zeros(N(L + tail))
    tg = tvec(L)
    gmax = G.max()
    for at in rng.uniform(0, L, int(rate * L)):
        g = np.interp(at, tg, G) / gmax
        if rng.random() > g ** power:
            continue
        cd = 0.012
        place(y, white(cd, rng) * env_exp(tvec(cd), rng.uniform(*size)), at, rng.uniform(0.2, 1.0) * g)
    return periodic(fold(y, L), lambda x: bp(x, lo, hi))


# ---------- Sundown and the Field ----------
@sound('amb_sundown_loop', kind='loop', L=20)
def amb_sundown_loop(rng, k):
    L = 20
    G = gusts(rng, L, 0.35, (2, 3, 5), 0.4)
    w = diffuse(lambda r: unit(wind(r, L, fc=380, q=0.6, G=G)), rng)
    grass = np.stack([unit(texture(rng, L, 1800, 2500, 9000, G, 1.5) + 0.3 * unit(periodic(white(L, rng), lambda x: bp(x, 3000, 9000))) * G ** 1.5)
                      for _ in range(2)])
    birds = chirps(rng, L, 7, (2600, 5200), 0.4)
    valley = unit(tone(rng, L, None, 150, 'brown'))
    return w + grass * db(-11) + unit(birds) * db(-21) + valley * db(-12)


@sound('bike_start', 1)
def bike_start(rng, k):
    d = 2.1
    t = tvec(d)
    tc = rng.uniform(0.5, 0.58)          # it catches
    load = np.maximum(np.cos(TAU * 5.5 * t), 0) ** 3          # each compression drags the starter down as it turns it over
    on = np.clip(t / 0.02, 0, 1) * np.where(t < tc + 0.04, 1.0, np.exp(-(t - tc - 0.04) / 0.03))
    fs = 300 * (1 + 0.12 * np.minimum(t / tc, 1)) * (1 - 0.15 * load)
    whir = (sweep_sine(fs) + 0.6 * sweep_sine(2 * fs) + 0.35 * sweep_sine(3 * fs)) * (1 - 0.4 * load) * on
    gear = bp(white(d, rng), 1200, 4500) * grain(d, 220, rng, 0.3) * (0.6 + 0.4 * load) * on
    chug = lp(white(d, rng), 180, 4) * load ** 2 * on
    rt = np.clip(t - tc, 0, None)
    rpm = np.where(t < tc, 0.0, 1250 + 3000 * np.exp(-rt / 0.25) * (1 - np.exp(-rt / 0.04)) + 60 * smooth_random(d, 5, rng, -1, 1))
    eng = engine(rng, d, rpm, (0.0, 0.375), **LOW_ENGINE, seed=int(rng.integers(1 << 30)))
    eng *= np.clip(rt / 0.01, 0, 1) * (0.55 + 0.45 * np.clip((rpm - 1250) / 3000, 0, 1))
    hum = (np.sin(TAU * 1480 * t) + 0.5 * np.sin(TAU * 2220 * t)) * np.clip((t - tc - 0.1) / 0.6, 0, 1)
    y = P(eng) + P(whir) * db(-15) + P(gear) * db(-17) + P(chug) * db(-9) + P(hum) * db(-32)
    return fade(y, 0.003, 0.1)


@sound('bike_loop_low', kind='loop', L=6)
def bike_loop_low(rng, k):
    L = 6
    eng = engine(rng, L, 1500, (0.0, 0.375), **LOW_ENGINE, loop=True, seed=77)
    hum = closed_sine(1480, L, vib=0.002, vib_n=9) + 0.5 * closed_sine(2220, L)
    return unit(eng) + unit(hum) * db(-24)


@sound('bike_loop_high', kind='loop', L=6)
def bike_loop_high(rng, k):
    # (the pilot's code)
    L, rpm = 6.0, 7000
    ncyc = round(L * rpm / 120)
    cyc = L / ncyc
    n = N(L)
    pulses = np.zeros(n)
    crng = np.random.default_rng(1234 + k)
    for c in range(ncyc):          # a 270-degree twin: two firings in every 720 degrees, 270 apart
        for ph in (0.0, 270 / 720):
            i = int(round((c * cyc + ph * cyc + crng.normal(0, 0.00012)) * SR)) % n
            pulses[i] += 1 + crng.normal(0, 0.12)
    kd = 0.006
    kern = lp(white(kd, rng), 3000) * env_exp(tvec(kd), 0.0012)
    kp = np.zeros(n)
    kp[:len(kern)] = kern
    exhaust = np.fft.irfft(np.fft.rfft(pulses) * np.fft.rfft(kp), n)
    pipe = periodic(exhaust, lambda x: peak(peak(peak(x, 165, 4, 12), 420, 3, 8), 950, 2, 4))
    pipe = periodic(pipe, lambda x: lp(x, 2600, 2))
    mech = periodic(white(L, rng), lambda x: hp(x, 2800)) * periodic(np.abs(pulses), lambda x: lp(x, 60)) * 3
    tt = tvec(L)
    whine = np.sin(TAU * 2960 * tt + 0.003 * 2960 * L / (TAU * 27) * TAU * (1 - np.cos(TAU * 27 * tt / L))) \
        + 0.5 * np.sin(TAU * 4440 * tt)
    p = pipe / np.std(pipe)
    return p + mech / (np.std(mech) + 1e-9) * 0.05 + whine * 0.05


@sound('bike_rev_dirt', 2)
def bike_rev_dirt(rng, k):
    d = 1.6
    t = tvec(d)
    on = np.clip(t - 0.05, 0, None)
    rpm = 2200 + 6600 * (1 - np.exp(-on / 0.22)) + 300 * smooth_random(d, 6, rng, -1, 1) * np.clip((t - 0.4) / 0.2, 0, 1)
    eng = engine(rng, d, rpm, (0.0, 0.375), kern_lp=3000, res=BIKE_RES, muffle=3000, mech=0.06, seed=int(rng.integers(1 << 30)))
    eng *= (rpm / 8800) ** 0.7
    whine = (sweep_sine(rpm / 7000 * 2960) + 0.5 * sweep_sine(rpm / 7000 * 4440)) * (rpm / 8800)
    roost_env = np.clip((t - 0.1) / 0.08, 0, 1) * (0.7 + 0.3 * smooth_random(d, 9, rng, 0, 1))
    dirt = crinkle(rng, d, 1200, 700, 6000, roost_env, (0.001, 0.004))
    spray = bp(white(d, rng), 500, 3000) * grain(d, 60, rng, 0.4) * roost_env
    y = P(eng) + P(whine) * db(-28) + P(dirt) * db(-9) + P(spray) * db(-13)
    y *= np.where(t < 1.15, 1.0, 1 - 0.35 * (t - 1.15) / 0.45)          # pulling away
    return fade(y, 0.003, 0.1)


@sound('amb_field_loop', kind='loop', L=20)
def amb_field_loop(rng, k):
    L = 20
    G = gusts(rng, L, 0.3, (2, 3, 7), 0.4)
    w = diffuse(lambda r: unit(wind(r, L, fc=360, q=0.6, G=G)), rng)
    leaves = np.stack([unit(texture(rng, L, 2600, 1200, 7000, G, 2.0, (0.0008, 0.004)) + 0.4 * unit(periodic(white(L, rng), lambda x: bp(x, 1500, 6000))) * G ** 1.5)
                       for _ in range(2)])
    cr = crickets(rng, L, 9, (4100, 5200), (0.25, 0.9))
    mill = pan(creaks(rng, L, 3, (0.5, 0.9), (50, 90), ((300, 5), (700, 4), (1400, 3)), 0.35), 0.6)
    mill = conv_circ(mill, ir(1.2, rng, bright=2500, stereo=True), 0.5)
    city = unit(tone(rng, L, 30, 250, 'brown', (0.3, 0.7, 1.0))) + 0.05 * unit(hum(L, 60, ((1, 1), (2, 0.4), (3, 0.2))))
    return w + leaves * db(-7) + unit(cr) * db(-9) + unit(mill) * db(-21) + city * db(-18)


@sound('maize_push', 3)
def maize_push(rng, k):
    d = 1.5
    t = tvec(d)
    env = np.zeros(N(d))
    for _ in range(rng.integers(2, 4)):          # surges as each man shoves through
        w = rng.uniform(0.3, 0.6)
        place(env, bump(w, 1.2) * rng.uniform(0.6, 1.0), rng.uniform(0, d - w))
    env = np.clip(env, 0, 1) * 0.85 + 0.15 * bump(d, 0.3)[:N(d)]          # the leaves never quite still between
    y = P(rustle(rng, d, 1100, 900, 7000, env, snaps=int(rng.integers(4, 8))))
    for _ in range(rng.integers(3, 6)):          # stalks swiping past
        sd = rng.uniform(0.15, 0.3)
        place(y, P(svf(pink(sd, rng), np.linspace(rng.uniform(800, 1500), rng.uniform(2500, 4000), N(sd)), 1.5) * bump(sd, 2)),
              rng.uniform(0, d - sd), db(-9))
    for _ in range(3):
        place(y, P(lp(white(0.15, rng), 250, 4) * env_ad(tvec(0.15), 0.004, 0.03)), rng.uniform(0.05, 1.3), db(-15))
    return fade(y, 0.005, 0.1)


# ---------- the Avenue and the Checkpoint ----------
@sound('amb_avenue_loop', kind='loop', L=20)
def amb_avenue_loop(rng, k):
    L = 20
    rush = diffuse(lambda r: unit(periodic(pink(L, r), lambda x: bp(x, 150, 2500)) * circ_am(r, L, 6, 0.75, 1.0)), rng)
    low = diffuse(lambda r: unit(tone(r, L, None, 200, 'brown')), rng)
    tires = diffuse(lambda r: unit(periodic(white(L, r), lambda x: bp(x, 2500, 9000)) * circ_am(r, L, 2, 0.8, 1.0)), rng)
    spray = diffuse(lambda r: unit(crackle(r, L, 500, 2000, 9000, (0.0003, 0.001), heavy=3)), rng)
    traffic = passbys(rng, L, 5, (1.6, 2.8), 60, 1800, 0.7)
    city = unit(tone(rng, L, 30, 250, 'brown', (0.3, 0.7, 1.0)))
    return rush + low * db(-4) + tires * db(-7) + spray * db(-13) + unit(traffic) * db(-9) + city * db(-16)


@sound('bike_rival_loop', kind='loop', L=6)
def bike_rival_loop(rng, k):
    L = 6
    eng = engine(rng, L, 5600, (0.0, 315 / 720), jit_t=0.0002, jit_a=0.25, kern_tau=0.0016, kern_lp=3500,
                 res=((140, 4, 10), (380, 3, 7), (1100, 2.5, 5)), muffle=3800, mech=0.08, loop=True, seed=91, knock=0.25)
    return unit(eng)


@sound('bike_rev', 2)
def bike_rev(rng, k):
    d = 1.5
    t = tvec(d)
    blip = 4500 * np.exp(-0.5 * ((t - 0.12) / 0.05) ** 2)
    rise = np.where(t > 0.3, 4500 * (1 - np.exp(-(t - 0.3) / 0.4)), 0.0)
    rpm = 3000 + blip + 2000 * np.clip((t - 0.2) / 0.1, 0, 1) + rise
    eng = engine(rng, d, rpm, (0.0, 0.375), kern_lp=3200, res=BIKE_RES, muffle=3200, mech=0.07, seed=int(rng.integers(1 << 30)))
    eng *= (rpm / 9500) ** 0.8
    tires = hp(white(d, rng), 2500) * grain(d, 90, rng, 0.5) * np.clip(t / 1.2, 0.2, 1)
    whine = sweep_sine(rpm / 7000 * 2960) * (rpm / 9500)
    y = P(eng) + P(tires) * db(-12) + P(whine) * db(-30)
    return fade(y, 0.003, 0.1)


@sound('bike_crash', 3)
def bike_crash(rng, k):
    d = 2.2
    t = tvec(d)
    hit = P(metal(rng, d, 200, 4000, n=16, tau=0.2, imp=1.0, beats=2, ring=0.5))
    hit += P(np.concatenate([crunch(rng, 0.3, 40, 0.03, 800, 6000), np.zeros(N(d) - N(0.3))])) * db(-4)
    hit += P(lp(white(d, rng), 200, 4) * env_ad(t, 0.002, 0.06) + sweep_sine(pitch_drop(t, 60, 35, 0.08)) * env_ad(t, 0.002, 0.1)) * db(-2)
    place(hit, P(snap(rng, 0.2, 15, 0.02, 1500, 6000, 0.2)), 0.004, db(-8))
    sl = np.clip((t - 0.1) / 0.05, 0, 1) * np.exp(-np.clip(t - 0.1, 0, None) / rng.uniform(0.6, 0.8))          # sliding, slowing
    src = bp(white(d, rng), 1500, 7000) * grain(d, 60, rng, 0.3)
    scrape = src * 0.4
    for f in rng.uniform(2000, 5000, 3):
        scrape += svf(src, f, 25) * 0.6
    scrape = svf(scrape, 2500 + 4500 * sl, 0.7, 'lp') * sl
    sparks = crinkle(rng, d, 300, 6000, 12000, sl ** 2, (0.0002, 0.0008))
    y = hit + P(scrape) * db(-6) + P(sparks) * db(-14)
    for _ in range(rng.integers(2, 4)):          # it tumbles
        place(y, P(metal(rng, 0.4, 250, 3000, n=10, tau=0.08, imp=0.7, beats=1, ring=0.5)), rng.uniform(0.3, 1.2), db(rng.uniform(-12, -6)))
    return fade(y, 0.0003, 0.2)


@sound('road_tumble', 2)
def road_tumble(rng, k):
    d = 1.6
    t = tvec(d)
    y = np.zeros(N(d))
    at, g, gap = 0.0, 1.0, rng.uniform(0.11, 0.14)
    while at < d - 0.2:
        x = impact(rng, 0.3, thump=dict(f=300, tau=0.04, g=3.0), sub=dict(f0=90, f1=45, tf=0.05, tau=0.05, g=0.6), cloth=dict(g=0.5),
                   drive=1.5)
        place(y, P(x), at, g)
        at += gap * rng.uniform(0.85, 1.2)
        gap *= 1.12
        g *= rng.uniform(0.72, 0.85)
    scrape = bp(white(d, rng), 600, 4000) * grain(d, 50, rng, 0.2) * np.exp(-t / 0.6)
    y = y + P(scrape) * db(-10)
    y = svf(y, 6000 * (1500 / 6000) ** (t / d), 0.7, 'lp')          # rolling away
    return fade(y, 0.0004, 0.15)


@sound('amb_checkpoint_loop', kind='loop', L=20)
def amb_checkpoint_loop(rng, k):
    L = 20
    drizzle = diffuse(lambda r: unit(rain(r, L, 350, 0.6)), rng)
    flood = pan(unit(hum(L, 60, ((1, 0.6), (2, 1), (3, 0.4), (4, 0.25), (6, 0.1)), buzz=0.15)), -0.35)
    steam = pan(unit(periodic(white(L, rng), lambda x: bp(x, 1500, 7000)) * circ_am(rng, L, 3, 0.6, 1.0))
                + 0.5 * unit(periodic(pink(L, rng), lambda x: bp(x, 200, 800)) * circ_am(rng, L, 2, 0.7, 1.0)), 0.5)
    radio = conv_circ(pan(chatter(rng, L, 3), -0.2), ir(0.7, rng, bright=3000, stereo=True), 0.25)
    traffic = diffuse(lambda r: unit(tone(r, L, 40, 400, 'brown', (0.4, 0.6, 1.0))), rng)
    drip = np.stack([drops(rng, L, rate=0.6), drops(rng, L, rate=0.6)])
    return drizzle + flood * db(-17) + steam * db(-9) + unit(radio) * db(-21) + traffic * db(-14) + unit(drip) * db(-17)


@sound('apc_idle_loop', kind='loop', L=6)
def apc_idle_loop(rng, k):
    L = 6
    eng = engine(rng, L, 680, tuple(i / 8 for i in range(8)), jit_t=0.0003, jit_a=0.15, kern_tau=0.003, kern_lp=1500,
                 res=((55, 3, 12), (170, 3, 8), (480, 2, 5)), muffle=1800, mech=0.12, mech_f=2000, loop=True, seed=55, knock=0.9)
    fan = unit(periodic(white(L, rng), lambda x: bp(x, 2000, 6000))) * 0.5 + unit(closed_sine(1180, L))
    return unit(eng) + unit(fan) * db(-26)


@sound('rifle_draw', 1)
def rifle_draw(rng, k):
    d = 0.6
    sl = rng.uniform(0.28, 0.32)
    ts = tvec(sl)
    slide = P(creak(rng, sl, 90, 160, 0.4, ((600, 3), (1400, 3), (2800, 2)), env=np.linspace(0.4, 1, N(sl))))
    slide += P(bp(white(sl, rng), 500, 3000) * grain(sl, 140, rng, 0.3) * np.linspace(0.3, 1, N(sl))) * db(-3)
    y = np.zeros(N(d))
    place(y, fade(slide, 0.01, 0.02), 0, db(-6))
    place(y, P(whoosh(rng, 0.18, 300, 1400, 600, 0.5, q=1.2, body=0.6, hiss=0.05)), sl - 0.05, db(-12))
    ck = sl + rng.uniform(0.06, 0.09)
    cd = d - ck
    clack = P(metal(rng, cd, 600, 5000, n=10, tau=0.05, imp=1.0, beats=0, ring=0.5)) + P(wood_knock(rng, cd, 150, 800, 5, 0.03, 0.4)) * db(-4)
    place(y, clack, ck)
    return fade(y, 0.005, 0.05)


@sound('bike_into_apc', 1)
def bike_into_apc(rng, k):
    d = 1.7
    t = tvec(d)
    y = P(metal(rng, d, 150, 5000, n=20, tau=0.25, imp=1.2, beats=3, ring=0.5))
    y += P(np.concatenate([crunch(rng, 0.4, 60, 0.05, 600, 6000), np.zeros(N(d) - N(0.4))])) * db(-4)
    y += P(sweep_sine(pitch_drop(t, 50, 28, 0.2)) * env_ad(t, 0.003, 0.25) + lp(brown(d, rng), 100, 2) * env_ad(t, 0.003, 0.2)) * db(-1)
    y += P(metal(rng, d, 70, 1200, n=12, tau=0.7, imp=0.2, ring=0.7)) * db(-6)
    for _ in range(2):
        place(y, P(snap(rng, 0.2, 15, 0.02, 1500, 6000, 0.2)), rng.uniform(0.0, 0.03), db(-10))
    place(y, P(glass(rng, 0.6, shards=(20, 35), fmin=3000, fmax=11000, floor=0.0)), 0.01, db(-10))
    for _ in range(rng.integers(10, 17)):          # the parts going everywhere
        at = 0.1 + rng.exponential(0.35)
        if at > d - 0.2:
            continue
        kind = rng.random()
        if kind < 0.6:
            x = metal(rng, 0.3, 800, 6000, n=5, tau=0.06, imp=0.6, beats=0, ring=0.6)
        else:
            x = bp(white(0.3, rng), 500, 2500) * env_ad(tvec(0.3), 0.001, 0.02)
        place(y, P(x), at, db(rng.uniform(-20, -10)) * np.exp(-(at - 0.1) / 0.8))
    return fade(y, 0.0003, 0.2)


@sound('boom_fuel', 1)
def boom_fuel(rng, k):
    # (the pilot's code)
    from pedalboard import Pedalboard, Compressor, Limiter
    d = 3.6
    t = tvec(d)
    chans = []
    crack = hp(white(d, rng), 500) * env_exp(t, 0.004) * 1.4
    for c in range(2):
        boom = lp(brown(d, rng), 140, 4) * env_ad(t, 0.006, 0.38) * 4.0
        boom += sweep_sine(pitch_drop(t, 58, 30, 1.2)) * env_ad(t, 0.005, 0.45) * 1.2
        fc = np.where(t < 0.15, 250 + 450 * t / 0.15, 700 * np.exp(-(t - 0.15) / 0.9) + 220)
        whoomp = svf(pink(d, rng), fc, 0.8) * env_ad(t, 0.05, 0.4) * 1.6
        crackle_ = (rng.random(len(t)) < 0.0015 * np.exp(-t / 0.9)).astype(float) * rng.uniform(-1, 1, len(t))
        roar = bp(pink(d, rng) * 0.4 + lp(crackle_, 4000) * 6, 500, 3000) * env_ad(t, 0.02, 0.5) * 0.5
        chans.append(crack + boom + whoomp + roar)
    y = np.stack(chans)
    for _ in range(46):
        at = 0.25 + min(rng.exponential(0.6), 3.0)
        kind = rng.choice(['metal', 'glass', 'lump'], p=[0.45, 0.25, 0.30])
        dd = 0.3
        if kind == 'metal':
            x = modes(dd, rng.uniform(1200, 5500, 3), rng.uniform(0.4, 1, 3), rng.uniform(0.04, 0.18, 3), rng)
            g = rng.uniform(0.12, 0.35)
        elif kind == 'glass':
            x = modes(dd, rng.uniform(5000, 11000, 3), rng.uniform(0.4, 1, 3), rng.uniform(0.015, 0.06, 3), rng)
            g = rng.uniform(0.08, 0.25)
        else:
            x = lp(white(dd, rng), 700, 4) * env_ad(tvec(dd), 0.001, 0.03) * 2
            g = rng.uniform(0.15, 0.45)
        place(y, pan(x, rng.uniform(-0.9, 0.9)), at, g * np.exp(-(at - 0.25) / 2.2))
    y = echoes(y, [(0.19, 0.22, 1500), (0.33, 0.15, 1200), (0.52, 0.09, 900)])
    y = convolve(y, ir(1.6, rng, bright=1800, stereo=True), 0.12)
    y = y[:, :N(d)]
    board = Pedalboard([Compressor(threshold_db=-8, ratio=2, attack_ms=10, release_ms=300), Limiter(threshold_db=-2, release_ms=200)])
    y = board(y.astype(np.float32), SR).astype(float)
    return fade(y, 0.0, 0.5)


@sound('fire_loop', kind='loop', L=20)
def fire_loop(rng, k):
    L = 20
    roar = diffuse(lambda r: unit(flame(r, L)), rng)
    cr = np.stack([crackle(rng, L, 30, 1500, 9000, heavy=1.4), crackle(rng, L, 30, 1500, 9000, heavy=1.4)])
    pops = np.zeros((2, N(L + 0.5)))
    for at in times(rng, L, 0.3):
        place(pops, pan(snap(rng, 0.3, 15, 0.02, 800, 6000, 0.5), rng.uniform(-0.6, 0.6)), at, rng.uniform(0.5, 1.0))
    tk = np.stack([ticks(rng, L, 0.7), ticks(rng, L, 0.7)])
    return roar + unit(cr) * db(-7) + unit(fold(pops, L)) * db(-12) + unit(tk) * db(-19)


@sound('concrete_slam', 3)
def concrete_slam(rng, k):
    d = 0.55
    t = tvec(d)
    y = P(impact(rng, d, thump=dict(f=300, tau=0.06, g=3.0), sub=dict(f0=85, f1=40, tf=0.06, tau=0.08, g=1.0),
                 knock=dict(lo=150, hi=500, tau=0.04, g=1.5), cloth=dict(g=0.2), drive=1.7))
    sd = 0.25
    place(y, P(fade(bp(white(sd, rng), 1000, 6000) * grain(sd, 150, rng, 0.2) * env_ad(tvec(sd), 0.01, 0.08), 0.0, 0.1)), 0.008, db(-11))
    place(y, P(crunch(rng, 0.1, 12, 0.02, 1500, 8000)), 0.002, db(-15))
    return fade(space(rng, y, 'street', 0.4)[:N(d)], 0.0004, 0.08)


@sound('grenade_unclip', 1)
def grenade_unclip(rng, k):
    d = 0.32
    y = np.zeros(N(d))
    wd = 0.08
    place(y, P(bp(white(wd, rng), 800, 4000) * grain(wd, 200, rng, 0.2) * bump(wd, 1)), 0, db(-10))
    at = rng.uniform(0.055, 0.07)
    sd = d - at
    ts = tvec(sd)
    sn = P(hp(white(sd, rng), 2500) * env_exp(ts, 0.0008) + metal(rng, sd, 2000, 7000, n=6, tau=0.012, imp=0.8, beats=0, ring=0.5))
    sn += P(metal(rng, sd, 1500, 5000, n=8, tau=0.06, imp=0.3, beats=1, ring=0.6)) * db(-6)
    place(y, sn, at)
    return fade(y, 0.002, 0.04)
