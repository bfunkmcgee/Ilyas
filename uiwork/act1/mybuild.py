# My own copy of the page to take stills from (the art agents build theirs), from whatever is on disk now
import sys,os
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0,ROOT);os.chdir(ROOT)
import build
EXTRA=[e for e in os.environ.get('EXTRA','').split(',') if e]
for e in EXTRA:
    if e not in build.FEAT: build.FEAT.append(e)
    if os.path.exists('sk_css_%s.css'%e) and e not in build.CSS: build.CSS.append(e)
build.build_scenes(force=False)
js,html,starts=build.assemble()
out=sys.argv[1] if len(sys.argv)>1 else 'uiwork/act1/mine_test.html'
open(out,'w',encoding='utf-8').write('<meta charset="utf-8">\n<script>window.SK_TEST=1</script>\n'+html)
print('built',out,len(html)//1024,'KB')
