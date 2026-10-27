# Hallowell Tower: the lobby and the office. The guards' guns at the lift, the charge on the doors, the last scene, the glass.
import numpy as np
from gens import *
from amb import *
from reg import sound
from rec_fights import P


@sound('amb_lobby_loop', kind='loop', L=20)
def amb_lobby_loop(rng, k):
    L = 20
    vent = diffuse(lambda r: unit(tone(r, L, 80, 1000, 'pink')), rng)
    fan = unit(closed_sine(118, L) + 0.5 * closed_sine(236, L))
    light = unit(hum(L, 50, ((2, 1), (4, 0.3)), buzz=0.1))
    city = diffuse(lambda r: unit(tone(r, L, 30, 250, 'brown', (0.3, 0.6, 1.0))), rng)
    hall = conv_circ(vent + city * db(-8), ir(1.6, rng, bright=5000, stereo=True), 0.3)
    return unit(hall) + fan * db(-21) + light * db(-19)


@sound('coat_sweep', 1)
def coat_sweep(rng, k):
    d = 0.55
    t = tvec(d)
    pk = 0.4
    e = pass_env(t / d, pk, 2.0, 3.0)
    air = whoosh(rng, d, 200, 900, 350, pk, q=0.9, body=1.0, hiss=0.03, rise=2.0, fall=3.0, low=0.3)
    gate = np.zeros(N(d))
    at = 0.0
    while at < d:
        fd = rng.uniform(0.015, 0.03)
        place(gate, bump(fd, 2) * rng.uniform(0.5, 1.0), at)
        at += 1 / rng.uniform(14, 20)
    flap = bp(white(d, rng), 300, 3000) * gate * e
    mail = chain_rattle(rng, d, 40, d * 0.8, 4000, 10000, 1.0) * e
    y = P(air) + P(flap) * db(-7) + P(mail) * db(-11)
    return fade(y, 0.004, 0.05)


@sound('coat_throw', 1)
def coat_throw(rng, k):
    d = 0.85
    t = tvec(d)
    pk = 0.35
    air = whoosh(rng, 0.7, 180, 1000, 300, pk, q=0.9, body=1.1, hiss=0.03, rise=1.6, fall=2.6, low=0.3)
    y = np.zeros(N(d))
    place(y, P(air), 0)
    e = np.concatenate([pass_env(tvec(0.7) / 0.7, pk, 1.6, 2.6), np.zeros(N(d) - N(0.7))])
    gate = np.zeros(N(d))
    at = 0.03
    while at < 0.6:
        fd = rng.uniform(0.02, 0.04)
        place(gate, bump(fd, 2) * rng.uniform(0.5, 1.0), at)
        at += 1 / rng.uniform(10, 16)
    y += P(bp(white(d, rng), 250, 3000) * gate * e) * db(-5)
    place(y, P(lp(white(0.15, rng), 400, 4) * bump(0.15, 3)), rng.uniform(0.28, 0.33), db(-8))          # the cloth snapping open
    jing = np.zeros(N(d))
    place(jing, chain_rattle(rng, 0.7, 30, 0.5, 3000, 9000, 1.0), 0.05)
    for _ in range(rng.integers(3, 6)):          # torn rings dropping out of it
        place(jing, metal(rng, 0.1, 3000, 8000, n=3, tau=0.03, imp=0.4, beats=0, ring=0.6), rng.uniform(0.5, 0.78), rng.uniform(0.2, 0.5))
    y += P(jing) * db(-8)
    return fade(y, 0.004, 0.06)


@sound('charge_plant', 1)
def charge_plant(rng, k):
    d = 0.42
    y = np.zeros(N(d))
    cd = 0.2
    clack = P(wood_knock(rng, cd, 200, 1200, 5, 0.02, 0.6)) + P(metal(rng, cd, 1500, 6000, n=5, tau=0.015, imp=1.0, beats=0, ring=0.5)) * db(-2)
    place(y, clack, 0.005)
    at = rng.uniform(0.2, 0.24)
    ad = d - at
    ta = tvec(ad)
    arm = hp(white(ad, rng), 3000) * env_exp(ta, 0.0006)
    place(arm, metal(rng, ad, 2500, 7000, n=4, tau=0.008, imp=0.6, beats=0, ring=0.5), 0.004)
    place(y, P(arm), at, db(-6))
    return fade(y, 0.002, 0.04)


@sound('charge_beep', 1)
def charge_beep(rng, k):
    return beep(0.1, 3200)


@sound('boom_breach', 1)
def boom_breach(rng, k):
    from pedalboard import Pedalboard, Compressor, Limiter
    d = 3.2
    t = tvec(d)
    y = explosion(rng, d, boom_tau=0.3, boom_g=4.5, sub=(65, 30, 0.8, 0.4, 1.2), whoomp=None, roar=(0.15, 0.3), crack_g=2.5, debris=50,
                  kinds=(0.15, 0.0, 0.25, 0.6), spread=1.5, echo_taps=SPACES['hall']['taps'], rt=1.8, wet=0.25, bright=4000)
    y = y / np.max(np.abs(y))
    for _ in range(3):          # the hardwood going to splinters
        place(y, pan(P(snap(rng, 0.9, 60, 0.1, 900, 7000, 1.2)), rng.uniform(-0.4, 0.4)), rng.uniform(0.002, 0.02), db(-5))
    dust_env = np.clip((t - 0.3) / 0.3, 0, 1) * np.exp(-np.clip(t - 0.3, 0, None) / 0.9)
    dust = np.stack([crinkle(rng, d, 400, 1500, 6000, dust_env, (0.0008, 0.003)) * dust_env for _ in range(2)])
    y = y + P(dust) * db(-20)
    board = Pedalboard([Compressor(threshold_db=-8, ratio=2, attack_ms=10, release_ms=300), Limiter(threshold_db=-2, release_ms=200)])
    y = board(y.astype(np.float32), SR).astype(float)
    return fade(y, 0.0, 0.5)


@sound('debris_rattle', 1)
def debris_rattle(rng, k):
    d = 1.7
    y = np.zeros(N(d))
    for _ in range(rng.integers(40, 60)):
        at = min(rng.exponential(0.35), 1.45)
        if rng.random() < 0.6:
            x = wood_knock(rng, 0.1, 400, 2500, 4, 0.015, 0.7)
        else:
            x = metal(rng, 0.12, 2000, 7000, n=3, tau=0.03, imp=0.5, beats=0, ring=0.6)
        x = x + hp(white(len(x) / SR, rng), 3000) * env_exp(tvec(len(x) / SR), 0.001) * 0.4
        g = rng.uniform(0.2, 1.0) * np.exp(-at / 0.9)
        place(y, x, at, g)
        if rng.random() < 0.3:
            place(y, x, at + rng.uniform(0.04, 0.09), g * 0.35)
    y = convolve(y, ir(1.6, rng, bright=5000), 0.15)[:N(d)]
    return fade(P(y), 0.0005, 0.1)


@sound('wood_clack', 4)
def wood_clack(rng, k):
    d = 0.22
    x = wood_knock(rng, d, 500, 2500, 5, 0.02, 0.8) + hp(white(d, rng), 3000) * env_exp(tvec(d), 0.0008) * 0.5
    y = P(x)
    place(y, P(wood_knock(rng, 0.15, 500, 2500, 4, 0.015, 0.8)), rng.uniform(0.04, 0.08), rng.uniform(0.3, 0.5))
    return fade(y, 0.0003, 0.04)


@sound('amb_office_loop', kind='loop', L=20)
def amb_office_loop(rng, k):
    L = 20
    room = diffuse(lambda r: unit(tone(r, L, 60, 1200, 'pink')), rng)
    moan = unit(periodic(pink(L, rng), lambda x: svf(x, 250, 2)) * circ_am(rng, L, 0.3, 0.5, 1.0))
    whistle = unit(periodic(white(L, rng), lambda x: svf(x, 1100, 14)) * circ_am(rng, L, 0.4, 0.2, 1.0))
    glass_wall = pan(moan + whistle * db(-10), 0.6)
    embers = pan(unit(crackle(rng, L, 6, 1200, 6000, (0.0005, 0.003), heavy=1.8, low=0.2)), -0.6)
    t = tvec(L)
    jet = unit(periodic(pink(L, rng), lambda x: bp(x, 150, 900))) + 0.05 * unit(closed_sine(2300, L, t))
    jet *= 0.35 + 0.65 * (0.5 + 0.5 * lfo(1, L, rng.uniform(0, TAU)))
    jet = pan_t(jet, 0.4 * lfo(1, L, rng.uniform(0, TAU)))
    return room + glass_wall * db(-5) + embers * db(-9) + unit(jet) * db(-15)


@sound('chair_topple', 1)
def chair_topple(rng, k):
    d = 1.25
    t = tvec(d)
    roll_end = rng.uniform(0.4, 0.48)
    rl = np.clip(t / 0.03, 0, 1) * np.clip((roll_end - t) / roll_end, 0, 1)
    roll = lp(white(d, rng), 600, 2) * grain(d, 18, rng, 0.3) * rl
    tk = np.zeros(N(d))
    at, rate = 0.02, 12.0
    while at < roll_end:
        place(tk, wood_knock(rng, 0.05, 600, 2000, 3, 0.008, 0.4), at, rng.uniform(0.4, 1.0))
        at += 1 / rate
        rate = max(5.0, rate * 0.9)
    y = P(roll) * db(-6) + P(tk) * db(-14)
    place(y, P(creak(rng, 0.25, 120, 180, 0.3, ((500, 4), (1100, 4), (2300, 3)))), roll_end - 0.12, db(-11))
    ct = roll_end + rng.uniform(0.1, 0.15)
    cd = d - ct
    tc = tvec(cd)
    crash = P(lp(white(cd, rng), 250, 4) * env_ad(tc, 0.002, 0.06)) + P(wood_knock(rng, cd, 80, 500, 6, 0.06, 0.4)) * db(-3)
    crash += P(metal(rng, cd, 300, 2500, n=8, tau=0.06, imp=0.6, beats=0, ring=0.6)) * db(-8) + P(bp(white(cd, rng), 500, 2500) * env_exp(tc, 0.02)) * db(-10)
    spin = np.zeros(N(cd))
    at = 0.08
    while at < cd - 0.1:          # a castor still spinning
        place(spin, metal(rng, 0.04, 1500, 4000, n=2, tau=0.006, imp=0.3, beats=0, ring=0.5), at, np.exp(-at / 0.25))
        at += 1 / 15
    crash += P(spin) * db(-20)
    place(y, crash, ct)
    return fade(y, 0.004, 0.1)


@sound('desk_slam', 1)
def desk_slam(rng, k):
    d = 0.65
    t = tvec(d)
    y = P(lp(white(d, rng), 350, 4) * env_ad(t, 0.002, 0.05) * 3 + sweep_sine(pitch_drop(t, 100, 45, 0.06)) * env_ad(t, 0.002, 0.08))
    y += P(wood_knock(rng, d, 90, 500, 7, 0.09, 0.5)) * db(-2)
    y += P(hp(white(d, rng), 2500) * env_exp(t, 0.004)) * db(-9)
    place(y, P(crunch(rng, 0.1, 12, 0.01, 1000, 6000)), 0.002, db(-10))
    for _ in range(rng.integers(4, 7)):          # what was on the desk
        kind = rng.integers(0, 3)
        if kind == 0:
            x = wood_knock(rng, 0.1, 1000, 3000, 3, 0.01, 0.6)
        elif kind == 1:
            x = modes(0.2, rng.uniform(2000, 6000, 3), [1, 0.6, 0.4], rng.uniform(0.03, 0.06, 3), rng)
        else:
            x = metal(rng, 0.15, 800, 4000, n=5, tau=0.05, imp=0.5, beats=0, ring=0.6)
        place(y, P(x), rng.uniform(0.05, 0.35), db(rng.uniform(-16, -10)))
    return fade(y, 0.0004, 0.08)


@sound('over_desk', 1)
def over_desk(rng, k):
    d = 1.3
    t = tvec(d)
    dr = np.clip(t / 0.05, 0, 1) * np.clip((0.6 - t) / 0.1, 0, 1)
    y = P(bp(white(d, rng), 300, 3000) * grain(d, 40, rng, 0.3) * dr) * db(-6)
    pe = np.clip((t - 0.1) / 0.05, 0, 1) * np.clip((0.75 - t) / 0.15, 0, 1)
    y += P(crinkle(rng, d, 900, 1500, 8000, pe, (0.001, 0.004)) * pe) * db(-10)
    for _ in range(rng.integers(4, 7)):
        kind = rng.integers(0, 3)
        x = [wood_knock(rng, 0.12, 600, 2500, 3, 0.012, 0.6), modes(0.2, rng.uniform(2000, 6000, 3), [1, 0.6, 0.4], rng.uniform(0.03, 0.06, 3), rng),
             metal(rng, 0.15, 800, 4000, n=5, tau=0.05, imp=0.5, beats=0, ring=0.6)][kind]
        place(y, P(x), rng.uniform(0.4, 0.95), db(rng.uniform(-16, -10)))
    ft = rng.uniform(0.7, 0.8)
    fall = impact(rng, d - ft, thump=dict(f=300, tau=0.08, g=3.4), sub=dict(f0=75, f1=32, tf=0.1, tau=0.14, g=1.4), knock=dict(lo=120, hi=450, tau=0.04, g=1.0),
                  cloth=dict(g=0.3), limbs=2, drive=1.7)
    place(y, P(fall), ft)
    return fade(y, 0.004, 0.1)


@sound('window_crash', 1)
def window_crash(rng, k):
    d = 2.2
    t = tvec(d)
    chans = []
    for c in range(2):
        g = glass(rng, d, shards=(150, 220), fmin=1200, fmax=11000, span=0.05, fall=(90, 130), fall_span=1.7, crack_g=1.4, floor=0.0,
                  tink=(900, 2000), big=True, ring=0.15)
        g = svf(g, 12000 * (4000 / 12000) ** np.clip(t / 1.8, 0, 1), 0.7, 'lp') * (1 - 0.4 * np.clip(t / 2.0, 0, 1))          # out and away
        chans.append(P(g))
    y = np.stack(chans)
    body = lp(white(d, rng), 250, 4) * env_ad(t, 0.002, 0.05)
    y = y + P(body) * db(-6)
    rush = np.clip((t - 0.1) / 1.2, 0, 1) ** 0.8
    wind_ = np.stack([svf(pink(d, rng), 300 + 1200 * rush, 0.8) * rush for _ in range(2)])
    return fade(y + P(wind_) * db(-13), 0.0003, 0.3)


@sound('wind_in', 1)
def wind_in(rng, k):
    d = 3.2
    t = tvec(d)
    env = np.minimum(t / 0.15, 1) * (0.3 + 0.7 * np.exp(-np.clip(t - 0.6, 0, None) / 0.9))
    chans = []
    for c in range(2):
        fc = 850 * (1 + 0.25 * smooth_random(d, 2, rng, -1, 1))
        roar = lp(pink(d, rng), 500, 2)
        rush = svf(pink(d, rng), fc, 0.8)
        howl = svf(white(d, rng), 700 + 300 * smooth_random(d, 1.5, rng, 0, 1), 10)
        chans.append((unit(roar) + unit(rush) * 0.9 + unit(howl) * 0.35) * env * smooth_random(d, 3, rng, 0.75, 1.0))
    y = np.stack(chans)
    pg = np.zeros(N(d))
    at = 0.2
    while at < 2.4:          # papers lifting and fluttering
        fd = rng.uniform(0.015, 0.035)
        place(pg, bump(fd, 2) * rng.uniform(0.3, 1.0) * np.exp(-(at - 0.2) / 0.9), at)
        at += 1 / rng.uniform(10, 20)
    papers = bp(white(d, rng), 1000, 6000) * pg
    y = P(y) + pan(P(papers), rng.uniform(-0.4, 0.4)) * db(-8)
    return fade(y, 0.01, 0.4)
