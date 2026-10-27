# Lamplight Street and the Lantern Bistro: Qadir's step and the grenade, the dining room, the kitchen, the family's lift.
import numpy as np
from gens import *
from amb import *
from reg import sound
from rec_fights import P


@sound('amb_street_loop', kind='loop', L=20)
def amb_street_loop(rng, k):
    L = 20
    gutters = np.zeros((2, N(L)))
    for per, p, f in ((0.9, -0.6, (1100, 2200)), (1.6, 0.3, (800, 1600)), (2.3, 0.8, (1300, 2600))):
        gutters += pan(drops(rng, L, period=per, jitter=0.15, f=f, sizes=(0.6, 1.0)), p)
    loose = np.stack([drops(rng, L, rate=1.5), drops(rng, L, rate=1.5)])
    run = pan(trickle(rng, L, 70), -0.4)
    lamps = pan(unit(periodic(white(L, rng), lambda x: bp(x, 2500, 9000)) * circ_am(rng, L, 0.5, 0.85, 1.0)), -0.7) \
        + pan(unit(periodic(white(L, rng), lambda x: bp(x, 2500, 9000)) * circ_am(rng, L, 0.5, 0.85, 1.0)), 0.6)
    traffic = passbys(rng, L, 3, (3.0, 5.0), 60, 900, 0.3)
    bell_ = np.zeros(N(L + 2.5))          # a tram far off, two strokes of its bell
    f0 = rng.uniform(1600, 1800)
    at = rng.uniform(9, 13)
    for i in range(2):
        place(bell_, bell(rng, 1.2, f0, partials=((1, 1), (2.0, 0.4), (2.76, 0.25), (5.4, 0.1)), tau=0.6, attack=0.002), at + i * 0.22,
              1.0 - 0.2 * i)
    bell_ = lp(convolve(bell_, ir(1.5, rng, bright=2500), 0.8, 0.3)[:N(L + 2.5)], 2500)
    bell_ = pan(fold(bell_, L), 0.3)
    city = unit(tone(rng, L, 30, 300, 'brown', (0.3, 0.7, 1.0)))
    wet = conv_circ(unit(gutters) + unit(loose) * db(-6), ir(0.9, rng, bright=4000, stereo=True), 0.2)
    return unit(wet) * db(-3) + unit(run) * db(-10) + unit(lamps) * db(-17) + unit(traffic) * db(-10) + unit(bell_) * db(-26) + city * db(-14)


@sound('grenade_pin', 1)
def grenade_pin(rng, k):
    d = 0.45
    sd = 0.12
    ts = tvec(sd)
    src = bp(white(sd, rng), 3000, 9000) * grain(sd, 300, rng, 0.1) * bump(sd, 1)
    ring = src * 0.4
    for f in rng.uniform(3500, 7000, 3):
        ring = ring + svf(src, f, 30)
    y = np.zeros(N(d))
    place(y, P(ring), 0, db(-4))
    place(y, P(metal(rng, 0.3, 3000, 8000, n=6, tau=0.05, imp=0.5, beats=0, ring=0.6)), sd - 0.01, db(-2))
    pd = d - sd - 0.01
    tp = tvec(pd)
    fp = rng.uniform(2600, 3400) * (1 + 0.02 * np.sin(TAU * 40 * tp) * np.exp(-tp / 0.05))
    ping = (sweep_sine(fp) + 0.3 * sweep_sine(fp * 2.71)) * env_ad(tp, 0.001, 0.08)
    place(y, P(ping), sd + 0.005, db(-7))
    return fade(y, 0.002, 0.06)


@sound('grenade_bounce', 2)
def grenade_bounce(rng, k):
    d = 0.6

    def clink(g):
        x = metal(rng, 0.4, 900, 5000, n=10, tau=0.08, imp=1.0, imp_f=1500, beats=1, ring=0.55)
        x += hp(white(0.4, rng), 2000) * env_exp(tvec(0.4), 0.0015) * 0.6 + lp(white(0.4, rng), 400, 4) * env_exp(tvec(0.4), 0.015) * 2
        return P(x) * g

    y = np.zeros(N(d))
    place(y, clink(1.0), 0)
    sk = rng.uniform(0.1, 0.14)
    place(y, clink(db(-5)), sk)
    rd = d - sk - 0.06
    tr = tvec(rd)
    roll = lp(white(rd, rng), 900, 2) * grain(rd, 40, rng, 0.3) * np.exp(-tr / 0.15)
    tk = np.zeros(N(rd))
    at = 0.0
    while at < rd - 0.05:
        place(tk, metal(rng, 0.05, 1500, 5000, n=3, tau=0.01, imp=0.3, beats=0, ring=0.6), at, np.exp(-at / 0.15))
        at += 1 / rng.uniform(20, 30)
    place(y, P(roll + P(tk) * 0.4), sk + 0.06, db(-14))
    return fade(y, 0.0003, 0.08)


@sound('boom_grenade', 1)
def boom_grenade(rng, k):
    from pedalboard import Pedalboard, Compressor, Limiter
    d = 3.2
    y = explosion(rng, d, boom_tau=0.26, boom_g=4.0, sub=(70, 32, 0.6, 0.3, 1.0), whoomp=(0.02, 0.15, 0.6), roar=(0.25, 0.3), crack_g=2.2,
                  debris=60, kinds=(0.15, 0.35, 0.2, 0.3), spread=1.6, echo_taps=SPACES['narrow']['taps'], rt=1.0, wet=0.16, bright=2200)
    y = y / np.max(np.abs(y))
    for p in (-0.6, 0.55):          # the windows
        place(y, pan(P(glass(rng, 1.4, shards=(70, 110), fmin=1500, fmax=11000, span=0.03, fall=(30, 50), fall_span=0.9, crack_g=1.0,
                               floor=0.0, big=True)), p), rng.uniform(0.004, 0.02), db(-7))
    for _ in range(2):          # the door
        place(y, pan(P(snap(rng, 0.8, 60, 0.08, 900, 7000, 1.2)), rng.uniform(-0.2, 0.2)), rng.uniform(0.002, 0.012), db(-6))
    board = Pedalboard([Compressor(threshold_db=-8, ratio=2, attack_ms=10, release_ms=300), Limiter(threshold_db=-2, release_ms=200)])
    y = board(y.astype(np.float32), SR).astype(float)
    return fade(y, 0.0, 0.5)


@sound('amb_dining_loop', kind='loop', L=20)
def amb_dining_loop(rng, k):
    L = 20
    room = diffuse(lambda r: unit(tone(r, L, 60, 900, 'pink')), rng)
    lanterns = np.stack([unit(hum(L, 50, ((2, 1), (4, 0.4), (6, 0.2)), buzz=0.08)) * 1.0,
                         unit(hum(L, 50, ((2, 1), (4, 0.4), (6, 0.2)), buzz=0.08)) * 0.7])
    smolder = pan(unit(crackle(rng, L, 8, 1200, 7000, (0.0005, 0.003), heavy=1.8, low=0.3)), -0.65)
    embers = pan(unit(periodic(pink(L, rng), lambda x: bp(x, 1500, 5000)) * circ_am(rng, L, 1.5, 0.4, 1.0)), -0.6)
    street = unit(passbys(rng, L, 2, (3.0, 5.0), 60, 300, 0.1)) + pan(unit(periodic(drops(rng, L, rate=0.8, f=(600, 1500)), lambda x: lp(x, 600))), -0.5) * 0.5
    settle = pan(unit(creaks(rng, L, 1, (0.3, 0.5), (90, 140), far=0.5)), 0.4)
    return room + lanterns * db(-9) + smolder * db(-7) + embers * db(-15) + unit(street) * db(-14) + settle * db(-25)


@sound('amb_kitchen_loop', kind='loop', L=20)
def amb_kitchen_loop(rng, k):
    L = 20
    burners = sum(pan(unit(burner(rng, L, rng.uniform(700, 1100))), p) for p in (-0.5, 0.0, 0.45))
    bub = pan(unit(bubbles(rng, L, 22, (200, 800))), -0.4) + pan(unit(bubbles(rng, L, 14, (300, 1100))), 0.35) * 0.7
    lid = pan(unit(ticks(rng, L, 5, 2500, 6000)), -0.4)
    src = white(L, rng)
    draft = pan(unit(periodic(src, lambda x: svf(x, 750, 7)) * circ_am(rng, L, 0.6, 0.4, 1.0))
                + unit(tone(rng, L, 100, 500, 'pink', (0.5, 0.5, 1.0))), 0.8)
    room = diffuse(lambda r: unit(tone(r, L, 80, 1500, 'pink')), rng)
    return unit(burners) + unit(bub) * db(-6) + lid * db(-22) + unit(draft) * db(-15) + room * db(-13)


@sound('wall_latch', 1)
def wall_latch(rng, k):
    d = 0.45
    y = np.zeros(N(d))
    place(y, P(metal(rng, 0.1, 2000, 7000, n=5, tau=0.01, imp=0.8, beats=0, ring=0.5)), 0, db(-8))
    at = rng.uniform(0.05, 0.08)
    cd = d - at
    tc = tvec(cd)
    clunk = P(lp(white(cd, rng), 300, 4) * env_ad(tc, 0.002, 0.03)) + P(metal(rng, cd, 150, 900, n=8, tau=0.06, imp=0.5, beats=0, ring=0.6)) * db(-3)
    clunk += P(modes(cd, rng.uniform(1500, 4000, 4), rng.uniform(0.5, 1, 4), rng.uniform(0.01, 0.025, 4), rng)) * db(-12)
    place(y, clunk, at)
    return fade(y, 0.0003, 0.06)


@sound('wall_slide', 1)
def wall_slide(rng, k):
    d = 1.35
    t = tvec(d)
    stop = rng.uniform(1.0, 1.05)
    run = np.clip(t / 0.06, 0, 1) * np.where(t < stop, 1 - 0.25 * t / stop, 0.0)
    grind = bp(pink(d, rng), 80, 600) * grain(d, 35, rng, 0.5) * run
    roll = lp(white(d, rng), 1200, 2) * grain(d, 12, rng, 0.5) * run
    tk = np.zeros(N(d))
    at = rng.uniform(0.05, 0.15)
    while at < stop - 0.05:
        place(tk, metal(rng, 0.1, 400, 2500, n=4, tau=0.02, imp=0.4, beats=0, ring=0.6), at, rng.uniform(0.5, 1.0))
        at += 1 / rng.uniform(6, 8)
    sq = svf(white(d, rng), 2200 * (1 + 0.05 * smooth_random(d, 3, rng, -1, 1)), 25) * run * grain(d, 6, rng, 0.0)
    y = P(grind) + P(roll) * db(-6) + P(tk) * db(-16) + P(sq) * db(-22)
    td = d - stop
    tt = tvec(td)
    place(y, P(lp(white(td, rng), 200, 4) * env_ad(tt, 0.003, 0.04) + wood_knock(rng, td, 100, 500, 4, 0.04, 0.2) * 0.3), stop, db(-2))
    return fade(y, 0.01, 0.08)


@sound('lift_bell', 2)
def lift_bell(rng, k):
    d = 1.7
    hi, lo = [(1318.5, 1046.5), (1174.7, 932.3)][k]          # a falling major third
    y = np.zeros(N(d))
    for i, f0 in enumerate((hi, lo)):
        b = bell(rng, d - 0.33 * i, f0 * rng.uniform(0.998, 1.002), partials=((1, 1), (2.0, 0.3), (2.76, 0.18), (5.4, 0.06)),
                 tau=0.8, tau_exp=0.5, attack=0.002)
        b += hp(white(d - 0.33 * i, rng), 1500) * env_exp(tvec(d - 0.33 * i), 0.001) * 0.1
        place(y, b, 0.33 * i, 1.0 if i == 0 else 0.9)
    y = convolve(y, ir(0.7, rng, bright=5000), 0.2)[:N(d)]
    return fade(y, 0.0005, 0.25)


@sound('lift_doors', 2)
def lift_doors(rng, k):
    d = 1.1
    t = tvec(d)
    end = rng.uniform(0.78, 0.84) if k == 0 else rng.uniform(0.7, 0.76)
    run = np.clip(t / 0.08, 0, 1) * np.where(t < end, 1.0, 0.0) * (1 - 0.3 * np.clip(t / end, 0, 1))
    slide = lp(white(d, rng), 500, 2) * grain(d, 25, rng, 0.4) * run
    tk = np.zeros(N(d))
    at = 0.05
    while at < end - 0.03:
        place(tk, metal(rng, 0.05, 600, 3000, n=3, tau=0.01, imp=0.3, beats=0, ring=0.6), at, rng.uniform(0.4, 1.0))
        at += 1 / 15 * rng.uniform(0.8, 1.2)
    hs = 0.0 if k == 0 else end - 0.25
    hiss = np.zeros(N(d))
    place(hiss, hp(white(0.3, rng), 2000) * bump(0.3, 1.5), hs)
    y = P(slide) + P(tk) * db(-18) + P(hiss) * db(-10)
    td = d - end
    tt = tvec(td)
    thud = lp(white(td, rng), 220, 4) * env_ad(tt, 0.003, 0.04) + metal(rng, td, 200, 1500, n=6, tau=0.04, imp=0.3, beats=0, ring=0.4) * 0.3
    place(y, P(thud), end, db(-3) if k == 0 else db(0))
    return fade(y, 0.01, 0.08)
