# a contact sheet of spectrograms (and the waveform's envelope) for the rendered files; loops: the jump at the seam
import sys, glob, os, numpy as np, soundfile as sf, matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
files = sorted(glob.glob(os.path.join(sys.argv[1], 'wav', '*.wav')))
pick = [f for f in files if f.endswith('_01.wav')] if len(sys.argv) < 4 else [f for f in files if any(k in f for k in sys.argv[3].split(','))]
cols = 3; rows = (len(pick) + cols - 1) // cols
fig, axs = plt.subplots(rows, cols, figsize=(cols * 5.2, rows * 2.6), facecolor='#111')
for ax, f in zip(axs.flat, pick):
    y, sr = sf.read(f)
    m = y.mean(axis=1) if y.ndim == 2 else y
    ax.specgram(m, NFFT=1024, Fs=sr, noverlap=768, cmap='magma', vmin=-130, vmax=-20)
    ax.set_ylim(0, 16000); ax.set_title(os.path.basename(f), color='w', fontsize=9); ax.tick_params(colors='#aaa', labelsize=7)
    env = np.sqrt(np.convolve(m ** 2, np.ones(480) / 480, 'same')); t = np.arange(len(m)) / sr
    ax2 = ax.twinx(); ax2.plot(t, 20 * np.log10(env + 1e-9), color='#7ff', lw=.8); ax2.set_ylim(-80, 0); ax2.tick_params(colors='#7ff', labelsize=6)
    if 'loop' in f:
        d = np.abs(np.diff(m)); jump = abs(m[0] - m[-1])
        print(f'{os.path.basename(f)}: seam jump {jump:.5f}, typical step {np.median(d):.5f}, 99th pct step {np.percentile(d, 99):.5f}')
for ax in list(axs.flat)[len(pick):]: ax.axis('off')
plt.tight_layout(); plt.savefig(sys.argv[2], dpi=70, facecolor='#111')
