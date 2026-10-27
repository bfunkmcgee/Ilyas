# The registry of recipes: each sound on the list is a function (rng, take) -> samples, registered under its key.
REG = {}


def sound(key, takes=1, kind='shot', L=None):
    """kind 'shot': a one-shot, peak -1 dBTP. kind 'loop': a seamless loop of L seconds at -20 LUFS, peaks under -3 dBTP
    (the recipe returns exactly one period; the renderer adds the margins the game loops inside)."""
    def deco(fn):
        assert key not in REG, key
        REG[key] = dict(key=key, fn=fn, takes=takes, kind=kind, L=L)
        return fn
    return deco
