# Parts for the stage beds and other loops. Each part is periodic over the loop's length L: modulations make whole cycles,
# filters run through periodic(), and things that happen (a drip, a cricket, a crackle) are laid into a buffer longer than L
# whose overhang is folded back onto the start, so the loop has no seam.
import numpy as np
from dsp import *
from gens import bump, creak, metal, wood_knock, closed_sine


def db(x):
    return 10 ** (x / 20)


def unit(x):
    """scaled to unit RMS (so a bed's parts can be mixed in dB)"""
    r = np.sqrt(np.mean(x ** 2))
    return x / r if r > 0 else x


def fold(y, L):
    """a buffer longer than L folded round onto itself: what hangs over the end lands on the start"""
    n = N(L)
    out = y[..., :n].copy()
    rest = y[..., n:]
    while rest.shape[-1]:
        m = min(n, rest.shape[-1])
        out[..., :m] += rest[..., :m]
        rest = rest[..., m:]
    return out


def times(rng, L, rate, jitter=None, period=None):
    """when things happen over a loop: at random (rate a second), or about every period seconds with some jitter"""
    out = []
    if period:
        at = rng.uniform(0, period)
        while at < L:
            out.append(at)
            at += period * rng.uniform(1 - (jitter or 0.2), 1 + (jitter or 0.2))
        # the last gap, round the seam, must look like the others
        while out and L - out[-1] + out[0] < period * (1 - (jitter or 0.2)):
            out.pop()
        return out
    at = rng.exponential(1 / rate)
    while at < L:
        out.append(at)
        at += rng.exponential(1 / rate)
    return out


def circ_am(rng, L, rate, lo, hi):
    return smooth_random(L, rate, rng, lo, hi, circular=True)


def pan_t(x, p):
    """equal-power pan that can move (p an array from -1 to 1)"""
    a = (np.asarray(p) + 1) * np.pi / 4
    return np.stack([np.cos(a) * x, np.sin(a) * x])


def diffuse(fn, rng, width=0.7):
    """a diffuse stereo part: two takes of fn, partly mixed so the field is wide but not split"""
    a, b = fn(rng), fn(rng)
    k = (1 - width) / 2
    return np.stack([(1 - k) * a + k * b, k * a + (1 - k) * b])


# ---------- air and rooms ----------
def tone(rng, L, lo, hi, kind='pink', am=None):
    """filtered noise that loops (room tone, a distant city, ventilation)"""
    src = {'white': white, 'pink': pink, 'brown': brown}[kind](L, rng)
    y = periodic(src, lambda x: bp(x, lo, hi) if lo else lp(x, hi))
    if am:
        y *= circ_am(rng, L, *am)
    return y


def hum(L, f, parts=((1, 1.0), (2, 0.5), (3, 0.25)), buzz=0.0, rng=None, beat=0.0):
    """mains or lamp hum: whole harmonics of f, closing on the loop; buzz adds a raspy series; beat a slow detuned pair"""
    t = tvec(L)
    y = np.zeros(N(L))
    for h, a in parts:
        y += a * closed_sine(f * h, L, t)
        if beat:
            y += a * beat * closed_sine(f * h + 1 / L * round(0.4 * L), L, t)
    if buzz:
        b = np.zeros(N(L))
        for h in range(4, 40):
            b += closed_sine(f * h, L, t) / h ** 0.8
        y += buzz * b / np.std(b)
    return y


def crackle(rng, L, rate, lo=1500, hi=9000, size=(0.0004, 0.004), heavy=1.6, low=0.0, cap=4.0):
    """embers and flames: clicks at rate a second, a few far bigger than the rest"""
    tail = 0.05
    y = np.zeros(N(L + tail))
    for at in times(rng, L, rate):
        cd = 0.03
        c = white(cd, rng) * env_exp(tvec(cd), rng.uniform(*size))
        if low:
            c += lp(white(cd, rng), 600) * env_exp(tvec(cd), 0.004) * low
        place(y, c, at, min(cap, rng.pareto(heavy) * 0.3 + 0.1))
    return periodic(fold(y, L), lambda x: bp(x, lo, hi))


def drops(rng, L, rate=None, period=None, jitter=0.25, f=(900, 2600), rise=(0.4, 1.2), tau=(0.008, 0.03), click=0.5,
          sizes=(0.3, 1.0)):
    """water dripping: each drop a little rising 'plip' (the bubble it makes) with a click on the surface"""
    tail = 0.2
    y = np.zeros(N(L + tail))
    for at in times(rng, L, rate, jitter, period):
        d = 0.12
        t = tvec(d)
        f0 = rng.uniform(*f)
        tu = rng.uniform(*tau)
        x = sweep_sine(f0 * (1 + rng.uniform(*rise) * np.minimum(t / (tu * 3), 1))) * env_ad(t, 0.0005, tu)
        x += hp(white(d, rng), 2500) * env_exp(t, 0.0012) * click
        place(y, x, at, rng.uniform(*sizes))
    return fold(y, L)


def rain(rng, L, rate=500, hiss=0.5, lo=1800, hi=11000):
    """light rain: many tiny strikes on wet ground and a soft hiss"""
    tail = 0.02
    y = np.zeros(N(L + tail))
    n = int(rate * L)
    for at in rng.uniform(0, L, n):
        cd = 0.008
        c = white(cd, rng) * env_exp(tvec(cd), rng.uniform(0.0003, 0.0015))
        place(y, c, at, rng.uniform(0.1, 1.0) ** 2)
    y = periodic(fold(y, L), lambda x: bp(x, lo, hi))
    h = periodic(pink(L, rng), lambda x: bp(x, 2500, 9000)) * circ_am(rng, L, 0.6, 0.75, 1.0)
    return unit(y) + unit(h) * hiss


def trickle(rng, L, rate=60, f=(700, 2200)):
    """a gutter running: a fast, thin run of drops"""
    return drops(rng, L, rate=rate, f=f, rise=(0.2, 0.8), tau=(0.004, 0.012), click=0.2, sizes=(0.2, 1.0))


def bubbles(rng, L, rate=25, f=(220, 900)):
    """a pot simmering: low blips rising in pitch as they burst"""
    tail = 0.1
    y = np.zeros(N(L + tail))
    for at in times(rng, L, rate):
        d = 0.06
        t = tvec(d)
        f0 = rng.uniform(*f)
        tu = rng.uniform(0.006, 0.02)
        x = sweep_sine(f0 * (1 + 1.5 * t / d)) * env_ad(t, 0.001, tu)
        place(y, x, at, rng.uniform(0.2, 1.0))
    return fold(y, L)


def crickets(rng, L, n=8, f=(4100, 5200), far=(0.3, 1.0)):
    """crickets: each sings short chirps of a few pulses on its own note and rhythm; returns stereo"""
    tail = 0.3
    y = np.zeros((2, N(L + tail)))
    for _ in range(n):
        fc = rng.uniform(*f)
        pulses = rng.integers(3, 6)
        pr = rng.uniform(26, 36)
        per = rng.uniform(0.35, 0.8)
        g = rng.uniform(*far)
        p = rng.uniform(-0.9, 0.9)
        pd = 0.6 / pr
        pulse = np.sin(TAU * fc * tvec(pd)) * bump(pd, 2)
        chirp = np.zeros(N(pulses / pr + pd))
        for i in range(pulses):
            place(chirp, pulse, i / pr, 0.75 + 0.25 * np.sin(np.pi * (i + 0.5) / pulses))
        if g < 0.6:
            chirp = lp(chirp, 3500 + 3000 * g)
        for at in times(rng, L, None, 0.06, per):
            place(y, pan(chirp, p), at, g * rng.uniform(0.85, 1.0))
    return fold(y, L)


def chirps(rng, L, n=6, f=(2400, 5200), far=0.5):
    """a few birds far off: short phrases of quick sweeping notes, never the same twice; returns stereo"""
    y = np.zeros((2, N(L + 1.0)))
    for at in times(rng, L, n / L):
        phrase = np.zeros(N(0.9))
        notes = rng.integers(2, 6)
        f0 = rng.uniform(*f)
        pos = 0.0
        for _ in range(notes):
            nd = rng.uniform(0.03, 0.09)
            t = tvec(nd)
            sweep = rng.uniform(-0.35, 0.45)
            fr = f0 * rng.uniform(0.85, 1.15) * (1 + sweep * t / nd)
            note = sweep_sine(fr) * bump(nd, 1.5)
            note += 0.15 * sweep_sine(2 * fr) * bump(nd, 1.5)
            place(phrase, note, pos, rng.uniform(0.6, 1.0))
            pos += nd + rng.uniform(0.03, 0.12)
        phrase = lp(phrase, 3000 + 3000 * far)
        place(y, pan(phrase, rng.uniform(-0.8, 0.8)), at, rng.uniform(0.5, 1.0))
    y = convolve(y, ir(1.2, rng, bright=3500, stereo=True), 0.6, 0.4)
    return fold(y, L)


def creaks(rng, L, n, d=(0.35, 0.8), f0=(60, 140), res=((380, 5), (900, 4), (1900, 3)), far=0.6):
    """slow creaks (a windmill, timbers settling): returns mono"""
    tail = 1.0
    y = np.zeros(N(L + tail))
    for at in times(rng, L, n / L):
        cd = rng.uniform(*d)
        a = rng.uniform(*f0)
        c = creak(rng, cd, a, a * rng.uniform(1.1, 1.5), 0.3, res)
        if far < 1:
            c = lp(c, 600 + 3000 * far)
        place(y, c, at, rng.uniform(0.6, 1.0))
    return fold(y, L)


def chatter(rng, L, bursts=3, lo=350, hi=2800):
    """a police radio far off: squelch, a few seconds of muffled talk that never makes words, squelch"""
    tail = 0.2
    y = np.zeros(N(L + tail))
    for at in times(rng, L, None, 0.5, L / bursts):
        bd = rng.uniform(1.0, 2.4)
        t = tvec(bd)
        n = N(bd)
        src = white(bd, rng) * 0.3 + np.sign(np.sin(np.cumsum(rng.uniform(110, 170) * (1 + 0.1 * smooth_random(bd, 4, rng, -1, 1))) * TAU / SR))
        f1 = 400 + 500 * smooth_random(bd, 9, rng, 0, 1)
        f2 = 1100 + 900 * smooth_random(bd, 9, rng, 0, 1)
        talk = svf(src, f1, 4) + 0.7 * svf(src, f2, 5)
        syl = np.clip(smooth_random(bd, 11, rng, -0.6, 1.2), 0, 1) * (smooth_random(bd, 2.5, rng, 0, 1) > 0.25)
        talk *= lp(syl.astype(float), 30)
        talk = sat(bp(talk, lo, hi) * 3, 2.0)
        x = np.zeros(n + N(0.12))
        x[:n] += talk / (np.max(np.abs(talk)) + 1e-9)
        sq = hp(white(0.05, rng), 1800) * env_exp(tvec(0.05), 0.012)
        place(x, sq, 0, 0.5)
        place(x, hp(white(0.1, rng), 1500) * env_exp(tvec(0.1), 0.03), bd, 0.45)
        place(y, x, at, 1.0)
    return fold(y, L)


def passbys(rng, L, n=4, d=(2.0, 3.5), lo=60, hi=1600, far=0.6):
    """traffic going by: each a swell of engine and tyres that moves across, its pitch falling as it passes; stereo"""
    tail = 4.0
    y = np.zeros((2, N(L + tail)))
    for at in times(rng, L, None, 0.35, L / n):
        pd = rng.uniform(*d)
        t = tvec(pd)
        u = t / pd
        g = 1 / (1 + ((u - 0.5) / rng.uniform(0.12, 0.2)) ** 2) * np.sin(np.pi * u) ** 0.5          # nothing starts or stops dead
        dop = 1.06 - 0.12 * (1 / (1 + np.exp(-(u - 0.5) * 14)))
        body = svf(pink(pd, rng), rng.uniform(140, 260) * dop, 0.8) + 0.5 * svf(pink(pd, rng), rng.uniform(700, 1100) * dop, 1.0)
        body = lp(body, hi * far + 400) * g
        d0 = rng.choice([-1, 1])
        place(y, pan_t(body, d0 * (0.85 - 1.7 * u)), at, rng.uniform(0.6, 1.0))
    return fold(y, L)


def flame(rng, L):
    """a fire's roar: low turbulent noise that surges"""
    a = periodic(brown(L, rng), lambda x: bp(x, 40, 500)) * circ_am(rng, L, 4, 0.5, 1.0)
    b = periodic(pink(L, rng), lambda x: bp(x, 250, 1800)) * circ_am(rng, L, 9, 0.2, 1.0) * 0.5
    return unit(a) + unit(b) * 0.5


def burner(rng, L, fc=900):
    """a gas burner: a soft steady roar of flame with a flicker"""
    return periodic(pink(L, rng), lambda x: bp(x, fc * 0.2, fc * 2.6)) * circ_am(rng, L, 14, 0.75, 1.0)


def ticks(rng, L, rate, fmin=2000, fmax=6500):
    """hot metal ticking as it moves"""
    tail = 0.2
    y = np.zeros(N(L + tail))
    for at in times(rng, L, rate):
        x = metal(rng, 0.12, fmin, fmax, n=3, tau=0.02, imp=0.6, beats=0, ring=0.5)
        place(y, x, at, rng.uniform(0.3, 1.0))
    return fold(y, L)


def flaps(rng, L, gate, rate=(14, 24), lo=500, hi=4500):
    """cloth snapping in a wind (a windsock, a flag), stronger as the gate (the gusts) rises; mono"""
    tail = 0.1
    y = np.zeros(N(L + tail))
    at = 0.0
    gt = np.interp
    while at < L:
        g = gt(at, tvec(L), gate)
        fd = rng.uniform(0.015, 0.04)
        b = bump(fd, 2) * rng.uniform(0.4, 1.0) * g ** 2
        if rng.random() < 0.12 * g:
            b = b + hp(white(fd, rng), 2000) * env_exp(tvec(fd), 0.002) * 2 * g
        place(y, b, at)
        at += 1 / rng.uniform(*rate)
    nz = white(L + tail, rng)
    y = y * nz[:len(y)]
    return periodic(fold(y, L), lambda x: bp(x, lo, hi))
