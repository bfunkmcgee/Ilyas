#!/usr/bin/env python3
"""The flow test's page: the built page with FLOW_TEST set ahead of its script, so sk_flowui.js is on and the page opens on its test
fight (the branch claude/flow-test; nothing of it is on in the game's own page).

    python3 tools/flow_test.py [out.html] [page]      (flow-test.html, ragdoll-skirmish-lab.html)

With --wrap the result is wrapped as the Artifact tool wraps a page (tools/wrap_page.py), to publish as an artifact's index.html.
"""
import os
import sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    out = args[0] if args else os.path.join(HERE, 'flow-test.html')
    page = args[1] if len(args) > 1 else os.path.join(HERE, 'ragdoll-skirmish-lab.html')
    s = open(page, encoding='utf8').read()
    i = s.rfind('<script>')
    if i < 0:
        sys.exit('no script in ' + page)
    s = s[:i] + '<script>var FLOW_TEST=1;</script>\n' + s[i:]
    s = s.replace('<title>Ragdoll Skirmish Lab</title>', '<title>Ilyas: flow test</title>', 1)
    if '--wrap' in sys.argv:
        sys.path.insert(0, os.path.join(HERE, 'tools'))
        import wrap_page
        s = wrap_page.HEAD + s + wrap_page.TAIL
    open(out, 'w', encoding='utf8').write(s)
    print('%s: %d bytes' % (out, len(s.encode('utf8'))))


if __name__ == '__main__':
    main()
