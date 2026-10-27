# A small kit for synthesizing game sound effects offline: 48 kHz float64 numpy arrays, mono (n,) or stereo (2, n).
# Everything is seeded (pass a numpy Generator), so a take always renders the same.
import numpy as np
import scipy.signal as sg

SR = 48000
TAU = 2 * np.pi


def N(d):
    return int(round(d * SR))


def tvec(d):
    return np.arange(N(d)) / SR


# ---------- noise (FFT-shaped noises are circular: they loop on their own length) ----------
def white(d, rng):
    return rng.standard_normal(N(d))


def colored(d, rng, slope):
    """noise with power falling as f^-slope (1 pink, 2 brown), unit std, circular over its length"""
    n = N(d)
    X = np.fft.rfft(rng.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    f[0] = f[1]
    X /= f ** (slope / 2)
    x = np.fft.irfft(X, n)
    return x / (np.std(x) + 1e-12)


def pink(d, rng):
    return colored(d, rng, 1.0)


def brown(d, rng):
    return colored(d, rng, 2.0)


# ---------- envelopes ----------
def env_exp(t, tau):
    return np.exp(-t / tau)


def env_ad(t, a, tau, hold=0.0):
    """linear attack over a, held for hold, then exponential decay with time constant tau"""
    e = np.exp(-np.clip(t - a - hold, 0, None) / tau)
    return np.where(t < a, t / max(a, 1e-9), e)


def fade(x, fin=0.002, fout=0.02):
    x = x.copy()
    n = x.shape[-1]
    a, b = min(N(fin), n), min(N(fout), n)
    if a > 0:
        x[..., :a] *= 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, a))
    if b > 0:
        x[..., n - b:] *= 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, b))
    return x


def smooth_random(d, rate, rng, lo=0.0, hi=1.0, circular=False):
    """a random curve through points rate times a second, smoothly joined (circular: it ends where it began)"""
    n = N(d)
    k = max(2, int(d * rate) + 1)
    pts = rng.uniform(lo, hi, k)
    if circular:
        pts[-1] = pts[0]
    xs = np.linspace(0, n - 1, k)
    i = np.arange(n)
    # cosine interpolation between the points
    j = np.clip(np.searchsorted(xs, i, side='right') - 1, 0, k - 2)
    u = (i - xs[j]) / (xs[j + 1] - xs[j])
    w = 0.5 - 0.5 * np.cos(np.pi * u)
    return pts[j] * (1 - w) + pts[j + 1] * w


def lfo(n_cycles, L, phase=0.0):
    """a sine that makes a whole number of cycles over L seconds (for loops)"""
    t = tvec(L)
    return np.sin(TAU * n_cycles * t / L + phase)


# ---------- filters ----------
def _sos(kind, f, order):
    return sg.butter(order, f, btype=kind, fs=SR, output='sos')


def lp(x, f, order=2):
    return sg.sosfilt(_sos('lowpass', f, order), x)


def hp(x, f, order=2):
    return sg.sosfilt(_sos('highpass', f, order), x)


def bp(x, lo, hi, order=2):
    return sg.sosfilt(_sos('bandpass', [lo, hi], order), x)


def peak(x, f, q, gain_db):
    """RBJ peaking EQ"""
    A = 10 ** (gain_db / 40)
    w = TAU * f / SR
    al = np.sin(w) / (2 * q)
    b = [1 + al * A, -2 * np.cos(w), 1 - al * A]
    a = [1 + al / A, -2 * np.cos(w), 1 - al / A]
    return sg.lfilter(b, a, x)


_SVF_C = r'''
#include <math.h>
void svf(const double* x, const double* fc, const double* q, long n, int mode, double sr, double* y) {
  double ic1 = 0, ic2 = 0;
  for (long i = 0; i < n; i++) {
    double f = fc[i];
    if (f < 5) f = 5;
    if (f > sr * 0.45) f = sr * 0.45;
    double g = tan(M_PI * f / sr), k = 1.0 / q[i];
    double a1 = 1.0 / (1.0 + g * (g + k)), a2 = g * a1, a3 = g * a2;
    double v3 = x[i] - ic2, v1 = a1 * ic1 + a2 * v3, v2 = ic2 + a2 * ic1 + a3 * v3;
    ic1 = 2 * v1 - ic1;
    ic2 = 2 * v2 - ic2;
    y[i] = mode == 0 ? k * v1 : mode == 1 ? v2 : x[i] - k * v1 - v2;
  }
}
'''
_svf_lib = None


def _svf_c():
    """the same filter compiled (a C compiler is used when there is one; it is two orders of magnitude faster)"""
    global _svf_lib
    if _svf_lib is None:
        _svf_lib = False
        try:
            import ctypes, hashlib, os, subprocess
            d = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.cache')
            os.makedirs(d, exist_ok=True)
            so = os.path.join(d, 'svf_' + hashlib.sha1(_SVF_C.encode()).hexdigest()[:12] + '.so')
            if not os.path.exists(so):
                open(so[:-3] + '.c', 'w').write(_SVF_C)
                subprocess.run(['cc', '-O2', '-shared', '-fPIC', '-o', so, so[:-3] + '.c', '-lm'], check=True, capture_output=True)
            lib = ctypes.CDLL(so)
            P = ctypes.POINTER(ctypes.c_double)
            lib.svf.argtypes = [P, P, P, ctypes.c_long, ctypes.c_int, ctypes.c_double, P]
            _svf_lib = (lib, P)
        except Exception:
            _svf_lib = False
    return _svf_lib


def svf(x, fc, q, mode='bp'):
    """Zavalishin's TPT state-variable filter, stable under fast changes of fc and q (per-sample arrays allowed).
    'bp' is normalized to unity gain at the centre."""
    n = len(x)
    fc = np.broadcast_to(np.asarray(fc, float), (n,))
    q = np.broadcast_to(np.asarray(q, float), (n,))
    c = _svf_c()
    if c:
        lib, P = c
        xa, fa, qa = (np.ascontiguousarray(a, dtype=float) for a in (x, fc, q))
        y = np.empty(n)
        lib.svf(xa.ctypes.data_as(P), fa.ctypes.data_as(P), qa.ctypes.data_as(P), n, {'bp': 0, 'lp': 1}.get(mode, 2), float(SR),
                y.ctypes.data_as(P))
        return y
    g = np.tan(np.pi * np.clip(fc, 5, SR * 0.45) / SR)
    k = 1.0 / q
    a1 = 1.0 / (1.0 + g * (g + k))
    a2 = g * a1
    a3 = g * a2
    xs, A1, A2, A3, K = x.tolist(), a1.tolist(), a2.tolist(), a3.tolist(), k.tolist()
    y = [0.0] * n
    ic1 = ic2 = 0.0
    if mode == 'bp':
        for i in range(n):
            v3 = xs[i] - ic2
            v1 = A1[i] * ic1 + A2[i] * v3
            v2 = ic2 + A2[i] * ic1 + A3[i] * v3
            ic1 = 2 * v1 - ic1
            ic2 = 2 * v2 - ic2
            y[i] = K[i] * v1
    elif mode == 'lp':
        for i in range(n):
            v3 = xs[i] - ic2
            v1 = A1[i] * ic1 + A2[i] * v3
            v2 = ic2 + A2[i] * ic1 + A3[i] * v3
            ic1 = 2 * v1 - ic1
            ic2 = 2 * v2 - ic2
            y[i] = v2
    else:
        for i in range(n):
            v3 = xs[i] - ic2
            v1 = A1[i] * ic1 + A2[i] * v3
            v2 = ic2 + A2[i] * ic1 + A3[i] * v3
            ic1 = 2 * v1 - ic1
            ic2 = 2 * v2 - ic2
            y[i] = xs[i] - K[i] * v1 - v2
    return np.array(y)


def periodic(x, fn):
    """run fn (a filter) over three copies of a looping signal and keep the middle one: the result loops seamlessly"""
    n = x.shape[-1]
    y = fn(np.concatenate([x, x, x], axis=-1))
    return y[..., n:2 * n]


# ---------- sources ----------
def sweep_sine(f, amp=1.0, phase=0.0):
    """a sine whose frequency follows the array f (Hz, per sample)"""
    return amp * np.sin(phase + TAU * np.cumsum(f) / SR)


def modes(d, freqs, amps, taus, rng, attack=0.0005):
    """struck object: a sum of exponentially decaying partials with random phases"""
    t = tvec(d)
    y = np.zeros_like(t)
    for f, a, tau in zip(freqs, amps, taus):
        if f >= SR * 0.45:
            continue
        y += a * np.exp(-t / tau) * np.sin(TAU * f * t + rng.uniform(0, TAU))
    if attack > 0:
        y *= np.clip(t / attack, 0, 1)
    m = min(N(0.03), int(len(t) * 0.15))          # whatever still rings at the end of the buffer dies away, not cut off
    if m > 1:
        y[-m:] *= 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, m))
    return y


def place(buf, x, at, gain=1.0):
    """add x into buf starting at time at (s); mono into mono, or mono/stereo into stereo"""
    i = N(at)
    if i >= buf.shape[-1]:
        return buf
    k = x.shape[-1]
    tail = np.abs(x[..., -max(1, k // 100):]).max()
    if k > 8 and tail > 1e-4 * (np.abs(x).max() + 1e-12):          # x stops while it still sounds: let it die away instead
        x = x.copy()
        f = max(2, min(N(0.02), k // 5))
        x[..., -f:] *= 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, f))
    m = min(x.shape[-1], buf.shape[-1] - i)
    if buf.ndim == 2 and x.ndim == 1:
        buf[:, i:i + m] += gain * x[:m]
    else:
        buf[..., i:i + m] += gain * x[..., :m]
    return buf


def place_wrap(buf, x, at, gain=1.0):
    """place, wrapping round the end of buf (for loops)"""
    n = buf.shape[-1]
    i = N(at) % n
    m = x.shape[-1]
    idx = (i + np.arange(m)) % n
    if buf.ndim == 1:
        np.add.at(buf, idx, gain * x)
    else:
        for c in range(buf.shape[0]):
            np.add.at(buf[c], idx, gain * (x[c] if x.ndim == 2 else x))
    return buf


def pan(x, p):
    """equal-power pan of a mono signal, p from -1 (left) to 1 (right)"""
    a = (p + 1) * np.pi / 4
    return np.stack([np.cos(a) * x, np.sin(a) * x])


def sat(x, drive=1.5):
    return np.tanh(drive * x) / np.tanh(drive)


# ---------- spaces ----------
def ir(rt60, rng, d=None, predelay=0.0, bright=6000, hi_rt=None, stereo=False, early=()):
    """a synthetic impulse response: decaying noise, the highs dying sooner; early = [(delay, gain)] reflections"""
    d = d or rt60 * 1.1
    t = tvec(d)

    def one():
        nz = rng.standard_normal(len(t))
        lo = lp(nz, 2500) * np.exp(-6.9 * t / rt60)
        hi = hp(nz, 2500) * np.exp(-6.9 * t / (hi_rt or rt60 * 0.45))
        r = lp(lo + hi, bright)
        r *= np.clip(t / 0.004, 0, 1)
        out = np.zeros(N(predelay) + len(r))
        out[N(predelay):] = r
        for dl, g in early:
            j = N(dl)
            if j < len(out):
                out[j] += g * 6
        return out / np.sqrt(np.sum(out ** 2) + 1e-12)

    return np.stack([one(), one()]) if stereo else one()


def convolve(x, h, wet, dry=1.0):
    """reverb by convolution; the result is long enough for the tail"""
    if x.ndim == 1 and h.ndim == 1:
        y = sg.fftconvolve(x, h)
        out = np.zeros(len(y))
        out[:len(x)] += dry * x
        return out + wet * y
    xs = x if x.ndim == 2 else np.stack([x, x])
    hs = h if h.ndim == 2 else np.stack([h, h])
    y = np.stack([sg.fftconvolve(xs[c], hs[c]) for c in range(2)])
    out = np.zeros_like(y)
    out[:, :xs.shape[1]] += dry * xs
    return out + wet * y


def conv_circ(x, h, wet, dry=1.0):
    """reverb for a loop: circular convolution, so the tail wraps round into the start (h shorter than x)"""
    n = x.shape[-1]
    hs = h if h.ndim == 2 else np.stack([h, h]) if x.ndim == 2 else h
    hp_ = np.zeros(hs.shape[:-1] + (n,))
    hp_[..., :min(n, hs.shape[-1])] = hs[..., :n]
    y = np.fft.irfft(np.fft.rfft(x) * np.fft.rfft(hp_), n)
    return dry * x + wet * y


def echoes(x, taps):
    """discrete reflections: taps = [(delay s, gain, lowpass Hz)]"""
    n = x.shape[-1] + N(max(d for d, _, _ in taps)) + 1
    out = np.zeros(x.shape[:-1] + (n,))
    out[..., :x.shape[-1]] += x
    for dl, g, f in taps:
        i = N(dl)
        out[..., i:i + x.shape[-1]] += g * lp(x, f)
    return out


# ---------- levels ----------
def true_peak(x):
    xs = x if x.ndim == 2 else x[None]
    return max(np.max(np.abs(sg.resample_poly(c, 4, 1))) for c in xs)


def norm_peak(x, db=-1.0):
    return x * (10 ** (db / 20) / (true_peak(x) + 1e-12))


def lufs(x):
    """integrated loudness, ITU-R BS.1770-4 (K-weighting, 400 ms blocks, gated)"""
    xs = x if x.ndim == 2 else x[None]
    b1, a1 = [1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585]
    b2, a2 = [1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621]
    k = [sg.lfilter(b2, a2, sg.lfilter(b1, a1, c)) for c in xs]
    blk, hop = N(0.4), N(0.1)
    n = xs.shape[1]
    if n < blk:
        z = sum(np.mean(c ** 2) for c in k)
        return -0.691 + 10 * np.log10(z + 1e-12)
    zs = np.array([sum(np.mean(c[i:i + blk] ** 2) for c in k) for i in range(0, n - blk + 1, hop)])
    lk = -0.691 + 10 * np.log10(zs + 1e-12)
    zs = zs[lk > -70]
    if not len(zs):
        return -70.0
    rel = -0.691 + 10 * np.log10(np.mean(zs)) - 10
    zs2 = zs[(-0.691 + 10 * np.log10(zs + 1e-12)) > rel]
    return -0.691 + 10 * np.log10(np.mean(zs2 if len(zs2) else zs))


def norm_loop(x, target=-20.0, ceiling=-3.0):
    """a loop at a steady loudness, its peaks kept under the ceiling"""
    y = x * 10 ** ((target - lufs(x)) / 20)
    p = true_peak(y)
    lim = 10 ** (ceiling / 20)
    if p > lim:
        y = y * (lim / p)
    return y


def loop_xfade(x, L, xf):
    """make a seamless loop of length L from x (at least L + xf long): its end crossfaded (equal power) into its start"""
    n, m = N(L), N(xf)
    y = x[..., :n].copy()
    w = np.linspace(0, np.pi / 2, m)
    y[..., :m] = x[..., :m] * np.sin(w) + x[..., n:n + m] * np.cos(w)
    return y


def limit_loop(x, target=-20.0, ceiling=-3.0, most=10.0, win=0.01):
    """a loop brought up to its loudness with its peaks held under the ceiling: a gain that dips around each peak (a running
    minimum, then smoothed, so it never rises above what the peak needs), worked round the seam so the loop stays seamless.
    It takes off at most `most` dB; past that the loop is left quieter."""
    from scipy.ndimage import minimum_filter1d, uniform_filter1d
    y = x
    lim = 10 ** ((ceiling - 0.2) / 20)
    for _ in range(3):
        y = y * 10 ** ((target - lufs(y)) / 20)
        a = np.abs(y).max(axis=0) if y.ndim == 2 else np.abs(y)
        g = np.clip(lim / np.maximum(a, 1e-12), 10 ** (-most / 20), 1.0)
        w = N(win)
        g3 = np.concatenate([g, g, g])
        gs = uniform_filter1d(minimum_filter1d(g3, size=2 * w + 1), size=w)[len(g):2 * len(g)]
        y = y * gs
    p = true_peak(y)
    if p > 10 ** (ceiling / 20):
        y = y * (10 ** (ceiling / 20) / p)
    return y
