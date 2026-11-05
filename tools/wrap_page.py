#!/usr/bin/env python3
"""The built page wrapped as the Artifact tool wraps it, for a publish through the artifacts server's publish_files (which wants
a whole HTML document) when the Artifact tool is not offered:

    python3 tools/wrap_page.py <out.html> [page]      (page: ragdoll-skirmish-lab.html)

The skeleton is the Artifact tool's own, byte for byte: V87's page wrapped so matched the published index.html's sha256. Publish
the result as index.html; the song and the sounds stay as they are (a publish keeps the files it does not name).
"""
import hashlib
import os
import sys

HEAD = ('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,'
        'viewport-fit=cover"><style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);'
        'padding-bottom:env(safe-area-inset-bottom,0px)}html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;'
        'padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}img{max-width:100%}'
        '[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>\n')
TAIL = '\n</body></html>'


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    page = sys.argv[2] if len(sys.argv) > 2 else os.path.join(here, 'ragdoll-skirmish-lab.html')
    body = open(page, 'rb').read()
    out = HEAD.encode() + body + TAIL.encode()
    open(sys.argv[1], 'wb').write(out)
    print('%s: %d bytes, sha256 %s' % (sys.argv[1], len(out), hashlib.sha256(out).hexdigest()))


if __name__ == '__main__':
    main()
