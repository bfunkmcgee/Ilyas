# Generator families for the prologue's sounds (The Long Night Sound List). Each family makes one kind of sound from a few
# parameters; sounds.py picks them per sound. Mono float64 at 48 kHz unless a family says stereo. All randomness comes from the
# Generator passed in, so every take renders the same each time.
import numpy as np
from dsp import *


def grain(d, rate, rng, lo=0.3):
    """a rough, fast amplitude jitter (cloth, friction, crackle)"""
    return smooth_random(d, rate, rng, lo, 1.0)


def pitch_drop(t, f0, f1, tau):
    return f1 + (f0 - f1) * np.exp(-t / tau)


def unit(x):
    m = np.max(np.abs(x))
    return x / m if m > 0 else x


def bump(d, shape=2.0):
    """a smooth hump d seconds long"""
    return np.sin(np.pi * np.linspace(0, 1, max(N(d), 2))) ** shape


# ---------- air ----------
def whoosh(rng, d, f0, f1, f2, pk, q=1.7, body=0.5, hiss=0.1, edge=0.0, rise=2.2, fall=3.4, turn=0.0, lpf=None, bodyk=(0.28, 0.38), low=0.0):
    """something moving through air: a band of noise sweeping up to the pass (pk, a fraction of d) and down after it"""
    t = tvec(d)
    u = t / d
    e = pass_env(u, pk, rise, fall)
    if turn:
        p2, w2 = pk + rng.uniform(0.22, 0.3), rng.uniform(0.07, 0.1)
        e = e + turn * np.exp(-0.5 * ((u - p2) / w2) ** 2)
        e /= e.max()
    fc = np.where(u < pk, f0 * (f1 / f0) ** (u / pk), f1 * (f2 / f1) ** ((u - pk) / (1 - pk)))
    y = svf(pink(d, rng), fc, q) * e
    if body:
        y += svf(pink(d, rng), fc * rng.uniform(*bodyk), 0.9) * e * body
    if hiss:
        y += hp(white(d, rng), rng.uniform(3800, 5200)) * e ** 2.5 * hiss
    if edge:
        y += svf(white(d, rng), fc * rng.uniform(1.25, 1.4), rng.uniform(14, 22)) * e ** 1.4 * edge
    if lpf:
        y = lp(y, lpf, 2)
    if low:
        y += lp(brown(d, rng), 120, 2) * e * low
    return fade(y, 0.004, 0.03)


def pass_env(u, pk, rise=2.2, fall=3.4):
    """the loudness of a pass: rising to its peak at pk (u and pk fractions of the length), dying after it"""
    return np.where(u < pk, (np.maximum(u, 0) / pk) ** rise, np.exp(-(u - pk) / (1 - pk) * fall))


def wind(rng, L, fc=500, q=0.7, gust=0.3, gusts=(1, 3, 7), level=1.0, whistle=0.0, wf=1250, low=1.0, G=None):
    """wind over a loop of L seconds: a low roar, a band of rushing air that gusts, a whistle; periodic in L (mono).
    G, a gust curve over the loop (about 1 on average), makes it follow gusts shared with other parts of a bed."""
    n = N(L)
    if G is None:
        roar = periodic(pink(L, rng), lambda x: lp(x, fc, 2)) * (1 - gust * 0.6 + gust * 0.6 * lfo(gusts[0], L, rng.uniform(0, TAU)))
        mod = 1 + gust * (0.6 * lfo(gusts[1], L, rng.uniform(0, TAU)) + 0.35 * lfo(gusts[2], L, rng.uniform(0, TAU)))
    else:
        roar = periodic(pink(L, rng), lambda x: lp(x, fc, 2)) * (0.6 + 0.4 * G)
        mod = G
    src = pink(L, rng)
    rush = svf(np.concatenate([src] * 3), np.concatenate([fc * 1.9 * mod] * 3), q)[n:2 * n]
    rush *= 0.75 + 0.25 * lfo(gusts[1], L, rng.uniform(0, TAU))
    y = roar * low + rush * 0.8
    if whistle:
        wsrc = white(L, rng)
        wfr = wf * (1 + 0.28 * lfo(2, L, rng.uniform(0, TAU)) + 0.1 * lfo(5, L, rng.uniform(0, TAU)))
        wh = svf(np.concatenate([wsrc] * 3), np.concatenate([wfr] * 3), 16)[n:2 * n]
        y += wh * (0.55 + 0.45 * lfo(4, L, rng.uniform(0, TAU))) * whistle
    return y * level


def flutter(rng, L, rate=(9, 15), lo=280, hi=2800, dur=(0.022, 0.05), amp=(0.35, 1.0)):
    """cloth flapping in a wind: bursts of noise at rate a second, laid round a loop of L seconds"""
    gate = np.zeros(N(L))
    at = 0.0
    while at < L:
        fd = rng.uniform(*dur)
        place_wrap(gate, bump(fd) * rng.uniform(*amp), at)
        at += 1 / rng.uniform(*rate)
    return periodic(white(L, rng), lambda x: bp(x, lo, hi)) * gate


# ---------- blows and bodies ----------
def impact(rng, d, crack=None, thump=None, sub=None, knock=None, cloth=None, wet=None, limbs=0, drive=1.5, fout=0.05):
    """a body struck or falling: layers of a crack, a dull thump, a low pitch drop, a knock, cloth, and a wet squelch"""
    t = tvec(d)
    y = np.zeros(N(d))
    if crack:
        y += hp(white(d, rng), crack.get('f', 2500)) * env_exp(t, crack.get('tau', 0.006)) * crack['g']
    if thump:
        y += lp(white(d, rng), thump.get('f', 420), 4) * env_ad(t, 0.002, thump.get('tau', 0.05)) * thump['g']
    if sub:
        y += sweep_sine(pitch_drop(t, sub.get('f0', 140), sub.get('f1', 50), sub.get('tf', 0.06))) * env_ad(t, 0.001, sub.get('tau', 0.07)) * sub['g']
    if knock:
        y += bp(white(d, rng), knock['lo'], knock['hi']) * env_ad(t, 0.001, knock.get('tau', 0.035)) * knock['g']
    if cloth:
        y += bp(white(d, rng), cloth.get('lo', 1200), cloth.get('hi', 3600)) * env_ad(t, 0.002, cloth.get('tau', 0.03)) * grain(d, 320, rng) * cloth['g']
    if wet:
        fc = 450 + wet.get('f', 1200) * np.exp(-t / wet.get('tf', 0.03))
        y += svf(white(d, rng), fc, wet.get('q', 3.0)) * env_ad(t, 0.003, wet.get('tau', 0.04)) * grain(d, 180, rng, 0.5) * wet['g']
    for _ in range(limbs):
        ld = 0.1
        limb = lp(white(ld, rng), 650, 4) * env_ad(tvec(ld), 0.001, 0.025) * rng.uniform(0.5, 1.0)
        place(y, limb, rng.uniform(0.03, 0.15), 0.6)
    return fade(sat(unit(y), drive), 0.0004, fout)


def crunch(rng, d, n=30, span=0.03, lo=900, hi=7000, g=1.0):
    """bone or brittle stuff giving: a dense cluster of tiny broadband cracks"""
    y = np.zeros(N(d))
    for _ in range(n):
        cd = 0.01
        c = bp(white(cd, rng), lo, hi) * env_exp(tvec(cd), rng.uniform(0.0005, 0.002))
        place(y, c, rng.exponential(span / 3) if span else 0, rng.uniform(0.3, 1.0) * g)
    return y


def crinkle(rng, d, rate, lo=1500, hi=6000, env=None, size=(0.0006, 0.003)):
    """a texture of tiny dry clicks (straw, stubble, leaves, paper, gravel trickle): rate per second, shaped by env"""
    y = np.zeros(N(d))
    n = int(rate * d)
    times = np.sort(rng.uniform(0, d, n))
    amp = np.ones(len(times))
    if env is not None:
        e = np.interp(times, tvec(d), env)
        keep = rng.random(n) < e
        times, amp = times[keep], np.sqrt(np.clip(e[keep], 0, None))          # fewer, and softer, as env falls
    for at, a in zip(times, amp):
        cd = 0.012
        c = white(cd, rng) * env_exp(tvec(cd), rng.uniform(*size))
        place(y, c, at, rng.uniform(0.2, 1.0) * a)
    return bp(y, lo, hi)


# ---------- struck things ----------
def metal(rng, d, fmin, fmax, n=10, tau=0.3, tau_exp=0.8, amp_exp=0.55, imp=1.0, imp_f=1500, beats=2, scrape=0.0, flex=0.0,
          attack=0.0005, ring=0.45):
    """a struck piece of metal: an impact transient over inharmonic partials, the higher dying sooner; beating pairs shimmer"""
    t = tvec(d)
    y = hp(white(d, rng), imp_f) * env_exp(t, 0.0025) * imp
    fs = np.sort(rng.uniform(fmin, fmax, n))
    amps = rng.uniform(0.5, 1.0, n) * (fs / fmin) ** -amp_exp
    taus = tau * (fs / fmin) ** -tau_exp * rng.uniform(0.7, 1.3, n)
    r = modes(d, fs, amps, taus, rng, attack)
    for f in rng.choice(fs[:max(2, n * 2 // 3)], min(beats, n), replace=False) if beats else []:
        r += modes(d, [f * rng.uniform(1.002, 1.006)], [0.45 * (f / fmin) ** -amp_exp], [tau * 0.8 * (f / fmin) ** -tau_exp], rng)
    y = y + r * ring
    if scrape:
        sd = rng.uniform(0.04, 0.09)
        sc = bp(white(sd, rng), 2500, 7500) * grain(sd, 55, rng, 0.0) * env_ad(tvec(sd), 0.004, sd * 0.5)
        place(y, sc, rng.uniform(0.004, 0.012), scrape)
    if flex:
        y += modes(d, rng.uniform(560, 900, 2), [0.5, 0.3], [0.06, 0.045], rng) * flex
    return y


def bounces(rng, d, hit, n, t0=0.0, gap=0.12, ratio=0.62, decay=0.55, jitter=0.15):
    """something dropped: hit(i) laid down n times, each bounce sooner and softer"""
    y = np.zeros(N(d))
    at, g = t0, 1.0
    for i in range(n):
        if at >= d:
            break
        place(y, hit(i), at, g)
        at += gap * rng.uniform(1 - jitter, 1 + jitter)
        gap *= ratio
        g *= decay * rng.uniform(0.85, 1.1)
    return y


def chain_rattle(rng, d, n=14, span=0.4, fmin=2500, fmax=8000, g=0.3):
    """a short run of small metal ticks: a chain, links, a lamp's fittings"""
    y = np.zeros(N(d))
    for _ in range(n):
        at = rng.uniform(0, span)
        place(y, metal(rng, 0.08, fmin, fmax, n=3, tau=0.03, imp=0.4, beats=0, ring=0.6), at, rng.uniform(0.3, 1.0) * g)
    return y


def wood_knock(rng, d, fmin=150, fmax=900, n=6, tau=0.04, click=0.6):
    """a knock on wood: a few low, quickly damped modes and a click"""
    t = tvec(d)
    fs = rng.uniform(fmin, fmax, n)
    y = modes(d, fs, rng.uniform(0.5, 1, n), tau * rng.uniform(0.6, 1.3, n), rng, 0.0003)
    y += hp(white(d, rng), 1800) * env_exp(t, 0.0015) * click
    y += lp(white(d, rng), 500, 2) * env_exp(t, 0.012) * 0.6
    return y


def snap(rng, d, fibers=25, span=0.04, lo=1200, hi=7000, knock=0.8, g=1.0):
    """wood breaking: a sharp crack, the fibres tearing in a crackle after it, and a low knock"""
    t = tvec(d)
    y = hp(white(d, rng), 900) * env_exp(t, 0.003) * 1.3
    y += crunch(rng, d, fibers, span, lo, hi, 0.7)
    if knock:
        y += wood_knock(rng, d, 120, 700, 5, 0.05, 0.3) * knock
    return y * g


def creak(rng, d, f0=180, f1=260, rough=0.25, res=((420, 6), (1100, 5), (2400, 4)), env=None, rate_jit=0.15):
    """wood or hinges under strain: stick-slip pulses at a wandering rate, rung through the wood's resonances"""
    t = tvec(d)
    f = f0 + (f1 - f0) * (t / d) + f0 * rate_jit * (smooth_random(d, 9, rng, -1, 1))
    ph = np.cumsum(np.maximum(f, 20)) / SR
    k = np.floor(ph)
    imp = np.zeros(N(d))
    edges = np.nonzero(np.diff(k) > 0)[0]
    imp[edges] = 1 + rough * rng.standard_normal(len(edges))
    src = imp + 0.05 * white(d, rng)
    y = np.zeros(N(d))
    for fc, q in res:
        y += svf(src, fc * rng.uniform(0.93, 1.07), q)
    if env is None:
        env = bump(d, 1.2)[:N(d)]
    return y * env


def glass(rng, d, shards=(35, 60), fmin=3000, fmax=12000, span=0.025, fall=(10, 22), fall_span=0.5, crack_g=0.9, floor=0.3,
          tink=(2600, 4200), big=False, ring=None):
    """glass breaking: the crack, the piece going to bits all at once, the shards coming down and skittering"""
    t = tvec(d)
    y = hp(white(d, rng), 1500 if big else 2000) * env_exp(t, 0.006 if big else 0.004) * crack_g
    if tink:
        y += modes(d, rng.uniform(*tink, 2), [1, 0.5], [0.04, 0.03], rng) * 0.45
    for _ in range(rng.integers(*shards)):
        at = min(rng.exponential(span), span * 5)
        nf = rng.integers(2, 4)
        x = modes(0.25, rng.uniform(fmin, fmax, nf), rng.uniform(0.4, 1, nf), rng.uniform(0.015, ring or (0.12 if big else 0.09), nf), rng)
        place(y, x, at, rng.uniform(0.12, 0.5))
    for _ in range(rng.integers(*fall)):
        at = span * 3 + rng.uniform(0, fall_span) ** 1.3
        x = modes(0.1, rng.uniform(max(fmin, min(4500, fmax * 0.7)), fmax, 2), [1, 0.6], rng.uniform(0.01, 0.04, 2), rng)
        place(y, x, at, rng.uniform(0.06, 0.22) * max(0.05, 1 - at / (fall_span + span * 3 + 0.3)))
    if floor:
        y += lp(white(d, rng), 300) * env_exp(t, 0.02) * floor
    return fade(y, 0.0003, 0.08)


# ---------- spaces ----------
SPACES = {
    'street': dict(taps=[(0.072, 0.32, 3500), (0.128, 0.22, 2800), (0.19, 0.15, 2200), (0.27, 0.1, 1800)], rt=0.9, bright=2600, wet=0.16),
    'narrow': dict(taps=[(0.031, 0.35, 4000), (0.058, 0.26, 3200), (0.093, 0.18, 2600), (0.14, 0.12, 2000)], rt=1.0, bright=3000, wet=0.18),
    'hall': dict(taps=[(0.017, 0.4, 6000), (0.031, 0.3, 5000), (0.049, 0.22, 4500), (0.083, 0.15, 4000)], rt=1.6, bright=6000, wet=0.22),
    'roof': dict(taps=[], rt=0.5, bright=3000, wet=0.07),
    'vault': dict(taps=[(0.045, 0.3, 4500), (0.09, 0.22, 3800), (0.15, 0.15, 3000)], rt=2.4, bright=4500, wet=0.3),
    'tunnel': dict(taps=[(0.012, 0.35, 5000), (0.025, 0.28, 4500), (0.038, 0.22, 4000), (0.051, 0.17, 3500), (0.064, 0.13, 3000)], rt=1.4, bright=3500, wet=0.25),
    'room': dict(taps=[(0.011, 0.25, 6000), (0.019, 0.18, 5000)], rt=0.45, bright=6000, wet=0.1),
    'field': dict(taps=[(0.35, 0.08, 1500)], rt=0.6, bright=2500, wet=0.05),
}


def space(rng, y, name, wet_k=1.0, stereo=False):
    """put a dry sound in a place: its early reflections, then a tail"""
    S = SPACES[name]
    if S['taps']:
        y = echoes(y, S['taps'])
    h = ir(S['rt'], rng, bright=S['bright'], stereo=stereo)
    return convolve(y, h, S['wet'] * wet_k)


# ---------- guns and blasts ----------
def gunshot(rng, d, place_='street', crack=1.6, blast=(700, 0.007, 1.2), body=(150, 1500, 0.03, 1.4), thump=(110, 55, 0.04, 0.7), drive=2.5,
            wet_k=1.0, extra=None):
    """a gunshot: the crack (an N-wave), the blast, the body of the report and its thump, in a place"""
    t = tvec(d)
    nw = np.zeros_like(t)
    m = N(0.0007)
    nw[:m] = np.linspace(1, -1, m)
    y = nw * crack
    y += hp(white(d, rng), blast[0]) * env_exp(t, blast[1]) * blast[2]
    y += bp(white(d, rng), body[0], body[1]) * env_ad(t, 0.0005, body[2]) * body[3]
    y += sweep_sine(pitch_drop(t, thump[0], thump[1], 0.03)) * env_exp(t, thump[2]) * thump[3]
    if extra is not None:
        y += extra(t)
    y = sat(y, drive)
    if place_:
        y = space(rng, y, place_, wet_k)
    return fade(y[:N(d)], 0.0, 0.15)


def ricochet_whine(rng, d, f0=(2800, 4200), f1=(900, 1600), g=0.3):
    """a round going off a hard surface: a thin falling whine"""
    t = tvec(d)
    fa, fb = rng.uniform(*f0), rng.uniform(*f1)
    f = fb + (fa - fb) * np.exp(-t / (d * 0.5))
    w = sweep_sine(f) * (1 + 0.3 * np.sin(TAU * rng.uniform(25, 45) * t))
    return w * env_ad(t, 0.01, d * 0.4) * g


def explosion(rng, d, boom_tau=0.38, boom_g=4.0, sub=(58, 30, 1.2, 0.45, 1.2), whoomp=(0.05, 0.4, 1.6), roar=(0.5, 0.5),
              crack_g=1.4, debris=46, kinds=(0.45, 0.25, 0.30), spread=3.0, echo_taps=None, rt=1.6, wet=0.12, bright=1800,
              comp=(-8, 2), extra=None):
    """a blast: the crack, the boom and its pitch falling, the fireball's whoomp, a roar, the debris coming down, the place
    giving it back; stereo"""
    t = tvec(d)
    chans = []
    crack = hp(white(d, rng), 500) * env_exp(t, 0.004) * crack_g
    for c in range(2):
        boom = lp(brown(d, rng), 140, 4) * env_ad(t, 0.006, boom_tau) * boom_g
        boom += sweep_sine(pitch_drop(t, sub[0], sub[1], sub[2])) * env_ad(t, 0.005, sub[3]) * sub[4]
        y = crack + boom
        if whoomp:
            fc = np.where(t < 0.15, 250 + 450 * t / 0.15, 700 * np.exp(-(t - 0.15) / 0.9) + 220)
            y += svf(pink(d, rng), fc, 0.8) * env_ad(t, whoomp[0], whoomp[1]) * whoomp[2]
        if roar:
            ck = (rng.random(len(t)) < 0.0015 * np.exp(-t / 0.9)).astype(float) * rng.uniform(-1, 1, len(t))
            y += bp(pink(d, rng) * 0.4 + lp(ck, 4000) * 6, 500, 3000) * env_ad(t, 0.02, roar[1]) * roar[0]
        chans.append(y)
    y = np.stack(chans)
    names = ['metal', 'glass', 'lump', 'wood']
    probs = np.array(list(kinds) + [0.0] * (4 - len(kinds)))
    probs = probs / probs.sum()
    for _ in range(debris):
        at = rng.exponential(0.6)
        at = 0.25 + (at if at < spread else rng.uniform(0, spread))
        kind = rng.choice(names, p=probs)
        dd = 0.3
        if kind == 'metal':
            x = modes(dd, rng.uniform(1200, 5500, 3), rng.uniform(0.4, 1, 3), rng.uniform(0.04, 0.18, 3), rng)
            g = rng.uniform(0.12, 0.35)
        elif kind == 'glass':
            x = modes(dd, rng.uniform(5000, 11000, 3), rng.uniform(0.4, 1, 3), rng.uniform(0.015, 0.06, 3), rng)
            g = rng.uniform(0.08, 0.25)
        elif kind == 'wood':
            x = wood_knock(rng, dd, 200, 1200, 4, 0.03, 0.5)
            g = rng.uniform(0.12, 0.3)
        else:
            x = lp(white(dd, rng), 700, 4) * env_ad(tvec(dd), 0.001, 0.03) * 2
            g = rng.uniform(0.15, 0.45)
        place(y, pan(x, rng.uniform(-0.9, 0.9)), at, g * np.exp(-(at - 0.25) / 2.2))
    if extra is not None:
        y = y + extra
    if echo_taps:
        y = echoes(y, echo_taps)
    y = convolve(y, ir(rt, rng, bright=bright, stereo=True), wet)
    return y[:, :N(d)]


# ---------- engines ----------
def engine(rng, d, rpm, pattern=(0.0, 0.375), jit_t=0.00012, jit_a=0.12, kern_tau=0.0012, kern_lp=3000,
           res=((165, 4, 12), (420, 3, 8), (950, 2, 4)), muffle=2600, mech=0.05, mech_f=2800, loop=False, seed=0, knock=0.0,
           body=0.0, body_f=90):
    """an internal-combustion engine as a train of exhaust pulses: pattern is where each cylinder fires in the 720-degree
    cycle (as a fraction), rpm a number or a curve; loop=True makes it a seamless loop of d seconds (d rounded to whole cycles)"""
    n = N(d)
    crng = np.random.default_rng(seed)
    pulses = np.zeros(n)
    if loop:
        ncyc = max(1, round(d * rpm / 120))
        cyc = d / ncyc
        for c in range(ncyc):
            for ph in pattern:
                i = int(round((c * cyc + ph * cyc + crng.normal(0, jit_t)) * SR)) % n
                pulses[i] += 1 + crng.normal(0, jit_a)
    else:
        r = np.broadcast_to(np.asarray(rpm, float), (n,))
        cycles = np.cumsum(r / 120.0) / SR
        for ph in pattern:
            k = np.floor(cycles - ph)
            idx = np.nonzero(np.diff(k) > 0)[0] + 1
            for i in idx:
                j = min(n - 1, max(0, i + int(crng.normal(0, jit_t) * SR)))
                pulses[j] += 1 + crng.normal(0, jit_a)
    kd = 0.006
    kern = lp(white(kd, rng), kern_lp) * env_exp(tvec(kd), kern_tau)
    if knock:
        kern += hp(white(kd, rng), 2500) * env_exp(tvec(kd), 0.0006) * knock
    if loop:
        kp = np.zeros(n)
        kp[:len(kern)] = kern
        ex = np.fft.irfft(np.fft.rfft(pulses) * np.fft.rfft(kp), n)
        f = lambda x: lp(_res(x, res), muffle, 2)
        pipe = periodic(ex, f)
        env = periodic(np.abs(pulses), lambda x: lp(x, 60))
        mn = periodic(white(d, rng), lambda x: hp(x, mech_f))
    else:
        ex = np.convolve(pulses, kern)[:n]
        pipe = lp(_res(ex, res), muffle, 2)
        env = lp(np.abs(pulses), 60)
        mn = hp(white(d, rng), mech_f)
    p = pipe / (np.std(pipe) + 1e-9)
    m = mn * env
    y = p + m / (np.std(m) + 1e-9) * mech
    if body:          # the block and the pipes' low rumble, filling between the firings
        if loop:
            rb = periodic(brown(d, rng), lambda x: lp(x, body_f, 2)) * periodic(np.abs(pulses), lambda x: lp(x, 25))
        else:
            rb = lp(brown(d, rng), body_f, 2) * lp(np.abs(pulses), 25)
        y += rb / (np.std(rb) + 1e-9) * body
    return y


def _res(x, res):
    for f, q, g in res:
        x = peak(x, f, q, g)
    return x


def closed_sine(f, L, t=None, vib=0.0, vib_n=0, amp=1.0):
    """a sine that closes on a loop of L seconds: frequency rounded to whole cycles per loop, vibrato a whole number of cycles"""
    t = tvec(L) if t is None else t
    f = round(f * L) / L
    ph = TAU * f * t
    if vib and vib_n:
        ph += f * vib * L / vib_n * (1 - np.cos(TAU * vib_n * t / L))
    return amp * np.sin(ph)


# ---------- bells and electronics ----------
def bell(rng, d, f0, partials=((1, 1), (2.0, 0.35), (2.76, 0.2), (4.07, 0.08)), tau=0.7, tau_exp=0.6, detune=0.0006, attack=0.003):
    t = tvec(d)
    fs, amps, taus = [], [], []
    for r, a in partials:
        fs.append(f0 * r)
        amps.append(a)
        taus.append(tau * r ** -tau_exp)
    y = modes(d, fs, amps, taus, rng, attack)
    if detune:
        y += modes(d, [f0 * (1 + detune)], [0.45], [tau * 0.95], rng, attack)
    return y


def beep(d, f, duty_soft=0.004):
    t = tvec(d)
    y = sum(np.sin(TAU * f * h * t) / h for h in range(1, 40, 2) if f * h < 12000) * 0.75 + np.sin(TAU * 2 * f * t) * 0.15
    e = np.ones_like(t)
    a = N(duty_soft)
    e[:a] = np.linspace(0, 1, a)
    e[-a:] = np.linspace(1, 0, a)
    return y * e


# ---------- voices: a pulse source through formants ----------
def voice(rng, d, f0, formants, rasp=0.3, jit=0.02, shim=0.1, growl=0.0, sub=0.0, env=None, open_q=0.25):
    """a creature's voice: a glottal pulse train (f0 a number or a curve) with jitter, rough with noise and growl, through
    formant bands [(centre, q, gain)] (centres may be curves)"""
    t = tvec(d)
    n = N(d)
    f = np.broadcast_to(np.asarray(f0, float), (n,)) * (1 + jit * smooth_random(d, 30, rng, -1, 1))
    ph = np.cumsum(f) / SR
    frac = np.mod(ph, 1)
    pulse = np.where(frac < open_q, np.sin(np.pi * frac / open_q) ** 2, 0.0)
    pulse *= 1 + shim * smooth_random(d, 40, rng, -1, 1)
    if sub:          # a subharmonic: every other pulse weaker
        pulse *= 1 - sub * (np.mod(np.floor(ph), 2))
    dp = np.diff(pulse, prepend=0)
    src = dp / (np.std(dp) + 1e-12) + rasp * 1.5 * white(d, rng) * (0.5 + pulse)
    if growl:
        src *= 1 + growl * smooth_random(d, rng.uniform(25, 40), rng, -1, 1)
    y = np.zeros(n)
    for fc, q, g in formants:
        y += svf(src, fc, q) * g
    if env is not None:
        y *= env
    return y


# ---------- cloth and flesh ----------
def tear(rng, d, wet=False, rate=(90, 160), lo=1500, hi=6000, g=1.0, env=None):
    """something torn: fabric a dense crackle of fibres going; flesh lower and squelching"""
    t = tvec(d)
    y = np.zeros(N(d))
    jerk = smooth_random(d, 28, rng, 0.25, 1.6)          # it gives in jerks
    at = 0.0
    while at < d:
        cd = rng.uniform(0.003, 0.012)
        c = white(cd, rng) * env_exp(tvec(cd), cd / 3)
        j = np.interp(at, t, jerk)
        place(y, c, at, rng.uniform(0.3, 1.0) * min(1.0, j))
        at += 1 / (rng.uniform(*rate) * j)
    if wet:
        y = bp(y, 350, 2600)
        fc = 600 + 900 * smooth_random(d, 25, rng, 0, 1)
        y = y * 0.6 + svf(y + 0.15 * white(d, rng), fc, 4) * 0.9
    else:
        y = bp(y, lo, hi)
    if env is None:
        env = env_ad(t, 0.01, d * 0.5)
    return fade(y * env * g, 0.001, min(0.02, d * 0.3))


def rustle(rng, d, rate=600, lo=800, hi=6500, env=None, snaps=0):
    """leaves, stalks or hay pushed through: a thick crinkle with a few sharper snaps in it"""
    t = tvec(d)
    if env is None:
        env = bump(d, 1.5)[:N(d)]
    y = crinkle(rng, d, rate, lo, hi, env, (0.0008, 0.004))
    y += bp(white(d, rng), lo, hi) * env * 0.08
    for _ in range(snaps):
        place(y, snap(rng, 0.08, 8, 0.01, 1500, 6000, 0.2, 0.5), rng.uniform(0.05, d - 0.1))
    return y


# ---------- footsteps ----------
def step(rng, surface):
    """a man's boot step: the heel, then the toe a moment after, in what it is made of where he walks"""
    d = 0.3
    t = tvec(d)
    y = np.zeros(N(d))
    toe_at = rng.uniform(0.04, 0.07)

    def strike(g):
        x = np.zeros(N(d))
        if surface == 'dirt':
            x += lp(white(d, rng), 300, 4) * env_exp(t, 0.02) * 1.4
            x += crinkle(rng, d, 900, 1500, 5000, env_exp(t, 0.03), (0.0006, 0.002)) * env_exp(t, 0.035) * 2.2
        elif surface == 'wet_stone':
            x += hp(white(d, rng), 1500) * env_exp(t, 0.003) * 0.9
            x += bp(white(d, rng), 300, 900) * env_exp(t, 0.01) * 0.9
            x += bp(white(d, rng), 2000, 7000) * env_ad(t, 0.004, 0.035) * grain(d, 300, rng) * 0.6
        elif surface == 'wood':
            x += wood_knock(rng, d, 120, 700, 5, 0.03, 0.5)
        elif surface == 'tile':
            x += hp(white(d, rng), 2000) * env_exp(t, 0.002) * 1.0
            x += modes(d, rng.uniform(1500, 4500, 4), rng.uniform(0.4, 1, 4), rng.uniform(0.008, 0.02, 4), rng) * 0.5
            x += lp(white(d, rng), 400, 2) * env_exp(t, 0.01) * 0.5
        elif surface == 'iron':
            x += metal(rng, d, 150, 2000, n=8, tau=0.08, imp=0.5, imp_f=1200, beats=1, ring=0.5)
            x += lp(white(d, rng), 300, 4) * env_exp(t, 0.015) * 0.9
        elif surface == 'marble':
            x += hp(white(d, rng), 2500) * env_exp(t, 0.002) * 1.0
            x += modes(d, rng.uniform(2000, 6000, 3), rng.uniform(0.3, 1, 3), rng.uniform(0.02, 0.04, 3), rng) * 0.35
            x += lp(white(d, rng), 400, 2) * env_exp(t, 0.008) * 0.5
        return x * g

    y += strike(1.0)
    place(y, strike(rng.uniform(0.35, 0.55))[:N(d - toe_at)], toe_at)
    return fade(y, 0.0003, 0.05)
