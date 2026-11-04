# The line widths, read: what uiwork/look/lines.js saw in each place, put down to each lineWidth assignment in the sources (its file,
# line and column), with its typical width in world units (the median of its strokes), its least and most, its colour and alpha,
# and whether the drawing guide's rule 2 is met (1.5 units; 1 for a highlight on a lit edge, a light colour or a stroke laid on with
# 'lighter'). Strokes on a sprite are worked out through each time it is set down; a sprite set down at several scales gives a
# spread, so the median is what to go by (a far shot draws the same lines tiny). Widths are kept in sixteenths of an octave.
# usage: python3 uiwork/look/lines.py <page the run used> <outdir of lines.js> [sites.json]   Prints how many assignments meet the rule
# and the files with the most that do not; writes the table to sites.json (default <outdir>/sites.json).
import json,sys,os,glob,collections,importlib.util,re,math
HERE=os.path.dirname(os.path.abspath(__file__));REPO=os.path.abspath(os.path.join(HERE,'..','..'))
spec=importlib.util.spec_from_file_location('build',os.path.join(REPO,'build.py'));B=importlib.util.module_from_spec(spec);spec.loader.exec_module(B)
starts=json.load(open(os.path.join(REPO,'build_map.json')))
PAGE,IND=sys.argv[1],sys.argv[2];OUT=sys.argv[3] if len(sys.argv)>3 else os.path.join(IND,'sites.json')
pl=open(PAGE,encoding='utf8').read().split('\n');sl=max(i for i,l in enumerate(pl) if l=='<script>')+1
# where each painter starts in the scene bundle (sk_sceneui.js, as build.py joins it)
scene_start=[e['line'] for e in starts if e['file']=='sk_sceneui.js'][0];seg=[];ln=scene_start+B.SCENE_HEAD.count('\n')
for f in B.SCENES:
  s=open(os.path.join(REPO,'envx',f+'.js'),encoding='utf8').read().rstrip('\n')+'\n';seg.append(('envx/'+f+'.js',ln));ln+=s.count('\n')
seg.append((B.SCENE_GLUE,ln))
def src(p):
  if p in ('default','?'):return (p,0,0)
  line,col=(p.split(':')+['0'])[:2];j=int(line)-sl;f=None
  for e in starts:
    if e['line']<=j:f=e
    else:break
  if f is None:return ('?',j,int(col))
  if f['file']=='sk_sceneui.js':
    g=None
    for name,l0 in seg:
      if l0<=j:g=(name,l0)
    return (g[0],j-g[1]+1,int(col))
  return (f['file'],j-f['line']+1,int(col))
def luma(c):
  m=re.match(r'rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?',c)
  if m:r,g,b=[int(x)/255 for x in m.groups()[:3]];return .2126*r+.7152*g+.0722*b,float(m.group(4) or 1)
  m=re.match(r'#([0-9a-f]{6})',c)
  if m:h=m.group(1);r,g,b=[int(h[i:i+2],16)/255 for i in (0,2,4)];return .2126*r+.7152*g+.0722*b,1.0
  return None,1.0
S={}
for fn in sorted(glob.glob(os.path.join(IND,'*.json'))):
  if os.path.basename(fn)=='sites.json':continue
  R=json.load(open(fn));roots={int(k):v for k,v in R.get('roots',{}).items()};ppu={k:(v,v) for k,v in roots.items()};E=list(R.get('edges',{}).values())
  # each sprite's pixels a unit, from the canvases it was set down on
  for it in range(8):
    ch=False
    for e in E:
      s,d=e['s'],e['d']
      if s in roots:continue
      if e.get('pd'):lo,hi=e['pd']/e['kmx'],e['pd']/e['kmn']
      elif d in ppu:lo,hi=ppu[d][0]/e['kmx'],ppu[d][1]/e['kmn']
      else:continue
      nl,nh=(min(lo,ppu[s][0]),max(hi,ppu[s][1])) if s in ppu else (lo,hi)
      if ppu.get(s)!=(nl,nh):ppu[s]=(nl,nh);ch=True
    if not ch:break
  for e in R['sites'].values():
    a=e['key'].split('|')[0];cid=e['id']
    if a in ('default','?'):continue
    if e['main']:sc=1
    elif cid in roots:sc=1/roots[cid]
    elif cid in ppu:sc=2/(ppu[cid][0]+ppu[cid][1])
    else:continue
    f,l,c=src(a);s=S.setdefault((f,l,c),{'n':0,'hist':collections.Counter(),'mn':1e9,'mx':0,'cols':set(),'alpha':set(),'op':set()})
    s['n']+=e['n'];s['cols'].add(e['col']);s['alpha'].add(e['a']);s['op'].add(e.get('op','?'));s['mn']=min(s['mn'],e['mn']*sc);s['mx']=max(s['mx'],e['mx']*sc)
    for b,k in (e.get('h') or {}).items():s['hist'][round(math.log2(max(2**(int(b)/16)*sc,1e-4))*16)]+=k
src_lines={}
def line_of(f,l):
  if f not in src_lines:
    try:src_lines[f]=open(os.path.join(REPO,f),encoding='utf8').read().split('\n')
    except OSError:src_lines[f]=[]
  L=src_lines[f];return L[l-1] if 0<l<=len(L) else ''
rows=[]
for (f,l,c),s in S.items():
  H=s['hist'];tot=sum(H.values())
  if not tot:continue
  acc=0;med=None
  for b in sorted(H):
    acc+=H[b]
    if acc>=tot/2:med=2**(b/16);break
  lum=[luma(x) for x in s['cols']];L=[x[0] for x in lum if x[0] is not None];A=[x[1] for x in lum]
  light=(bool(L) and min(L)>.5) or all(o in ('lighter','screen') for o in s['op'])
  alpha=max(A or [1])*max(s['alpha'] or [1]);tg=1.0 if light else 1.5;t=line_of(f,l)
  rows.append(dict(file=f,line=l,col=c,med=round(med,3),mn=round(s['mn'],3),mx=round(s['mx'],3),n=s['n'],light=light,alpha=round(alpha,2),target=tg,
    meets=med>=tg*.97,source=t[max(0,c-61):c+70]))
rows.sort(key=lambda r:(r['file'],r['line'],r['col']));json.dump(rows,open(OUT,'w'),indent=0)
per=collections.defaultdict(lambda:[0,0])
for r in rows:per[r['file']][0]+=1;per[r['file']][1]+=not r['meets']
print(len(rows),'assignments;',sum(r['meets'] for r in rows),'meet the rule;',sum(not r['meets'] and r['alpha']<.2 for r in rows),'more under it are faint (alpha under .2)')
for f,(n,u) in sorted(per.items(),key=lambda x:-x[1][1])[:20]:print(f'{u:5d} of {n:4d} under  {f}')
