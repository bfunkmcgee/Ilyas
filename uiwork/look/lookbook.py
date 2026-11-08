#!/usr/bin/env python3
"""The lookbook: every place the game draws beside the frame of its kind, with the look review's numbers and a judgment by eye
(phase 4 of the visual director, since Nov 4). Built from a look review's folder and uiwork/look/lookbook.json (the places, their
kinds and targets, the verdicts and notes), as a page and its pictures to publish as one artifact (the Noir Gilt Lookbook).

    python3 uiwork/look/lookbook.py [review folder] [out folder]      (test_out/look, test_out/lookbook)

Writes <out>/index.html and <out>/img/: each frame's phone still (618 by 1071, the page as a player sees it), a small one for the
pickers, and its wide-screen still (960 by 600). Publish the folder's files (index.html and img/*) to the lookbook's artifact.
"""
import html
import json
import os
import sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
VERDICT = {'target': ('tgt', 'The frame to match'), 'ok': ('ok', 'Holds'), 'mid': ('mid', 'Mixed'), 'bad': ('bad', 'Falls off')}


def esc(s):
    return html.escape(str(s), quote=True)


def when(m):
    if not m or m == 'fight':
        return 'in the fight'
    if m[0] == 'f':
        return '%s s into the fight' % m[1:]
    return '%s s in' % m[1:]


def pct(v, d=0):
    return ('%.' + str(d) + 'f%%') % (v * 100)


def pictures(review, out, frames):
    os.makedirs(os.path.join(out, 'img'), exist_ok=True)
    for n in frames:
        F = review['frames'][n]
        for size, src, dst, box, q in (('phone', 'page', n + '.jpg', (618, 1071), 80), ('phone', 'page', n + '_s.jpg', (124, 215), 72),
                                       ('desk', 'page', n + '_w.jpg', (960, 600), 78)):
            p = (F.get(size) or {}).get('pictures', {}).get(src)
            if not p:
                continue
            im = Image.open(os.path.join(review['_dir'], p)).convert('RGB').resize(box, Image.LANCZOS)
            im.save(os.path.join(out, 'img', dst), quality=q, optimize=True, progressive=True)


def frame_data(review, kept, n):
    """what the page shows of a frame: its moment, its numbers on the phone (and the wide screen's outline), the review's word"""
    F = review['frames'][n]
    ph, dk = F.get('phone') or {}, F.get('desk') or {}
    st, h, hu = ph.get('stats') or {}, ph.get('hero') or {}, ph.get('hues') or {}
    c = ph.get('cost')
    d = {'n': n, 'when': when(F.get('moment')), 'empty': st.get('empty'), 'read': h.get('read'), 'ground': h.get('Lb'),
         'struck': (h.get('struck') or 0) > .25, 'ms': ph.get('ms'), 'cost': c and {'ms': c['ms'], 'of': c['of']},
         'gold': hu.get('gold'), 'sodium': hu.get('sodium'), 'cyan': hu.get('cyan'), 'lit': hu.get('lit'), 'sat': st.get('sat'),
         'words': (ph.get('words') or {}).get('n'), 'wread': (dk.get('hero') or {}).get('read'), 'main': st.get('main') or [],
         'fails': [v['rule'] + ': ' + v['what'] for v in F.get('verdicts') or []], 'kept': []}
    if (st.get('empty') or 0) > .05 and n in kept.get('black', {}):
        d['kept'].append(kept['black'][n])
    fl = (ph.get('faults') or {})
    if fl.get('flats') and F['id'] in kept.get('flat', {}):
        d['kept'].append(kept['flat'][F['id']]['why'])
    if fl.get('repeats') and F['id'] in kept.get('repeat', {}):
        d['kept'].append(kept['repeat'][F['id']])
    return d


def nums(d):
    """the numbers line for a frame"""
    out = []
    if d['empty'] is not None:
        out.append(('Black', pct(d['empty'])))
    if d['read'] is not None:
        out.append(('Outline', pct(d['read']) + (' (struck)' if d['struck'] else '')))
    if d['ground'] is not None:
        out.append(('Ground', '%.2f' % d['ground']))
    if d['cost']:
        out.append(('Cost', '%.1f ms, %s of the fall' % (d['cost']['ms'], pct(d['cost']['of']))))
    elif d['ms'] is not None:
        # (a frame not timed by turns: the audit's one timing, taken beside its other shots since Nov 8)
        out.append(('Cost', '%.0f ms in the audit, not timed by turns' % d['ms']))
    if d['gold'] is not None:
        out.append(('Gold', '%.1f%%' % d['gold']))
        out.append(('Sodium', '%.0f%%' % d['sodium']))
        if d['cyan'] and d['cyan'] >= 1:
            out.append(('Cyan', '%.0f%%' % d['cyan']))
    if d['sat'] is not None:
        out.append(('Sat', '%.2f' % d['sat']))
    if d['words']:
        out.append(('Words', str(d['words'])))
    return ''.join('<span><b>%s</b> %s</span>' % (esc(k), esc(v)) for k, v in out)


CSS = r"""
/* Layout: a dark gallery in the game's black and gold. Up top the four frames every place is held to, then each kind's places as
   cards, each still beside its target's; one card a row on a phone, two wider, three wider still. */
:root{
  --ink:#09080c;--panel:#121017;--panel2:#1a1720;--line:#2f2817;--rule:#3a3122;
  --gold:#e2b65a;--goldL:#ffe2a3;--text:#ece5d3;--muted:#a69d89;--faint:#7a7262;
  --ok:#7fd6b0;--mid:#f0b454;--bad:#ff7d6c;--tgt:#e2b65a;
  --fd:'Alegreya SC',Georgia,'Times New Roman',serif;--fb:'Barlow Semi Condensed','Arial Narrow',Arial,sans-serif;
  color-scheme:dark}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;background:var(--ink)}
body{background:var(--ink);color:var(--text);font:16px/1.5 var(--fb);margin:0}
body::before{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:10;background:var(--ink)}
a{color:var(--goldL)}
a:focus-visible,button:focus-visible{outline:2px solid var(--goldL);outline-offset:2px}
.wrap{max-width:1160px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:24px 56px}
header{display:grid;gap:10px;padding-bottom:18px;border-bottom:1px solid var(--line)}
.kick{font:600 12px/1 var(--fb);letter-spacing:.22em;text-transform:uppercase;color:var(--gold)}
h1{font:700 clamp(34px,8vw,56px)/1 var(--fd);margin:0;color:var(--goldL);letter-spacing:.01em;text-wrap:balance}
h2{font:700 26px/1.15 var(--fd);margin:0;color:var(--goldL);text-wrap:balance}
h3{font:700 19px/1.2 var(--fd);margin:0;color:var(--text);text-wrap:balance}
.lede{max-width:64ch;margin:0}
.meta{color:var(--muted);font-size:14px;margin:0}
.counts{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:4px}
.counts .was{font-size:13px;color:var(--faint)}
.chip{display:inline-flex;align-items:center;gap:6px;font:600 13px/1 var(--fb);letter-spacing:.04em;padding:6px 9px;border-radius:999px;border:1px solid currentColor;white-space:nowrap}
.chip i{width:8px;height:8px;border-radius:50%;background:currentColor;display:inline-block}
.chip.ok{color:var(--ok)}.chip.mid{color:var(--mid)}.chip.bad{color:var(--bad)}.chip.tgt{color:var(--tgt)}
nav{position:sticky;top:env(safe-area-inset-top,0px);z-index:5;background:color-mix(in srgb,var(--ink) 92%,transparent);backdrop-filter:blur(6px);border-bottom:1px solid var(--line)}
nav .in{max-width:1160px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:9px;display:flex;gap:16px;overflow-x:auto;scrollbar-width:none}
nav a{font:600 14px/1 var(--fb);letter-spacing:.06em;color:var(--muted);text-decoration:none;white-space:nowrap;padding-block:4px}
nav a:hover{color:var(--goldL)}
section{padding-top:32px;display:grid;gap:14px;scroll-margin-top:48px}
section>p{margin:0;max-width:66ch;color:var(--muted)}
.four{display:grid;gap:12px;grid-template-columns:1fr 1fr}
@media (min-width:860px){.four{grid-template-columns:repeat(4,1fr)}}
.four figure{margin:0;display:grid;gap:8px;align-content:start}
.four button{border:1px solid var(--rule);border-radius:4px;padding:0;background:#000;cursor:pointer;overflow:hidden;aspect-ratio:412/714}
.four img{width:100%;height:100%;object-fit:cover;display:block}
.four figcaption{display:grid;gap:3px}
.four figcaption b{font:700 17px/1.2 var(--fd);color:var(--goldL)}
.four figcaption span{font-size:14px;color:var(--muted);line-height:1.4}
.four figcaption .k{font:600 11px/1 var(--fb);letter-spacing:.16em;text-transform:uppercase;color:var(--gold)}
.grid{display:grid;gap:12px;grid-template-columns:1fr}
@media (min-width:760px){.grid{grid-template-columns:1fr 1fr}}
@media (min-width:1120px){.grid{grid-template-columns:1fr 1fr 1fr}}
.card{background:var(--panel);border:1px solid var(--line);border-radius:6px;padding:12px;display:grid;gap:10px;align-content:start;scroll-margin-top:56px}
.card.is-tgt{border-color:#6a5427;background:linear-gradient(180deg,#1a1610,var(--panel) 40%)}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.pair figure{margin:0;display:grid;gap:5px}
.pair button{border:1px solid var(--rule);border-radius:3px;padding:0;background:#000;cursor:pointer;overflow:hidden;aspect-ratio:412/714;position:relative}
.pair img{width:100%;height:100%;object-fit:cover;display:block}
.pair figcaption{font:600 11px/1.2 var(--fb);letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
.pair .tg figcaption{color:var(--gold)}
.body{display:grid;gap:7px;min-width:0}
.top{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:baseline;justify-content:space-between}
.sub{font-size:13px;color:var(--muted);margin:-3px 0 0}
.frames{display:flex;flex-wrap:wrap;gap:5px}
.frames button{border:1px solid var(--rule);border-radius:3px;padding:0;background:#000;cursor:pointer;width:40px;aspect-ratio:412/714;overflow:hidden;opacity:.62}
.frames button[aria-pressed="true"]{opacity:1;border-color:var(--gold)}
.frames img{width:100%;height:100%;object-fit:cover;display:block}
.when{font-size:13px;color:var(--faint);margin:0}
.notes{margin:0;padding:0;list-style:none;display:grid;gap:5px;font-size:15px;line-height:1.4}
.notes li{padding-left:16px;position:relative}
.notes li::before{position:absolute;left:0;top:0;font-weight:600}
.notes li.p::before{content:"+";color:var(--ok)}
.notes li.m::before{content:"\2212";color:var(--bad)}
.notes li.o::before{content:"\2192";color:var(--mid)}
.nums{display:flex;flex-wrap:wrap;gap:3px 10px;font-size:12.5px;color:var(--faint);font-variant-numeric:tabular-nums;margin:0}
.nums b{color:var(--muted);font-weight:500}
.rev{font-size:13px;color:var(--muted);margin:0;border-top:1px solid var(--line);padding-top:7px}
.rev b{color:var(--ok);font-weight:600}.rev b.f{color:var(--bad)}
.script{display:grid;gap:16px}
.strip{display:grid;gap:6px}
.strip .lab{font:600 12px/1.3 var(--fb);letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
.cols{display:flex;gap:3px;overflow-x:auto;padding-bottom:4px}
.col{flex:0 0 22px;display:grid;grid-template-rows:150px 46px auto;gap:5px;cursor:pointer;background:none;border:0;padding:0;color:inherit}
.bar{display:flex;flex-direction:column;border-radius:2px;overflow:hidden;outline:1px solid #ffffff14}
.bar span{display:block}
.gold{display:flex;align-items:flex-end;justify-content:center;border-bottom:1px solid var(--rule)}
.gold span{display:block;width:10px;background:var(--gold);border-radius:1px 1px 0 0;min-height:1px}
.col .nm{writing-mode:vertical-rl;transform:rotate(180deg);font:500 11px/1 var(--fb);color:var(--muted);letter-spacing:.04em;justify-self:center;white-space:nowrap;max-height:110px;overflow:hidden}
.key{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:13px;color:var(--faint)}
.tbl{overflow-x:auto;border:1px solid var(--line);border-radius:6px}
table{border-collapse:collapse;width:100%;min-width:620px;font-size:14px}
th,td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--line);vertical-align:top}
th{font:600 12px/1.2 var(--fb);letter-spacing:.14em;text-transform:uppercase;color:var(--gold);background:var(--panel2)}
td{font-variant-numeric:tabular-nums}
td.ok{color:var(--ok);font-weight:600;white-space:nowrap}
tr:last-child td{border-bottom:0}
.kept{margin:0;padding-left:1.2em;display:grid;gap:6px;max-width:74ch;color:var(--muted);font-size:15px}
.kept li::marker{color:var(--gold)}
.kept b{color:var(--text);font-weight:600}
.legend{display:grid;gap:12px;font-size:15px;color:var(--muted);max-width:72ch}
.legend p{margin:0}
.legend b{color:var(--text);font-weight:600}
footer{margin-top:36px;padding-top:16px;border-top:1px solid var(--line);color:var(--faint);font-size:13px}
[hidden]{display:none!important}
.lb{position:fixed;inset:0;z-index:20;background:#060509;display:grid;grid-template-rows:auto minmax(0,1fr) auto;padding:calc(env(safe-area-inset-top,0px) + 10px) max(12px,env(safe-area-inset-right,0px)) calc(env(safe-area-inset-bottom,0px) + 12px) max(12px,env(safe-area-inset-left,0px))}
.lb .hd{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-bottom:8px}
.lb .hd h3{font-size:17px}
.lb .pic{min-height:0;display:flex;align-items:center;justify-content:center}
.lb .pic img{max-width:100%;max-height:100%;object-fit:contain;border:1px solid var(--rule)}
.lb .ft{display:grid;gap:8px;padding-top:8px;color:var(--muted);font-size:14px}
.lb .row{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
.seg{display:inline-flex;border:1px solid var(--rule);border-radius:4px;overflow:hidden}
.seg button{font:600 13px/1 var(--fb);letter-spacing:.06em;color:var(--muted);background:var(--panel2);border:0;padding:8px 11px;cursor:pointer}
.seg button[aria-pressed="true"]{color:var(--ink);background:var(--gold)}
.btn{font:600 14px/1 var(--fb);letter-spacing:.06em;color:var(--goldL);background:var(--panel2);border:1px solid var(--rule);border-radius:4px;padding:9px 13px;cursor:pointer}
.btn[disabled]{opacity:.35;cursor:default}
"""

JS = r"""
(()=>{const D=JSON.parse(document.getElementById('data').textContent),F=D.frames,P=D.places;
const $=s=>document.querySelector(s),lb=$('.lb'),img=$('.lb .pic img'),cap=$('.lb .hd h3'),sub=$('.lb .when'),nm=$('.lb .nums'),
  prev=$('.lb .prev'),next=$('.lb .next'),seg=[...document.querySelectorAll('.lb .seg button')];
let cur=null,i=0,wide=false,back=null;
// (a card's still and its numbers follow the frame picked under it)
document.querySelectorAll('.frames button').forEach(b=>b.addEventListener('click',()=>{const c=b.closest('.card'),n=b.dataset.n,f=F[n];
  c.querySelectorAll('.frames button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  const im=c.querySelector('.pair .me img');im.src='img/'+n+'.jpg';im.alt=c.dataset.title+', '+f.when;
  c.querySelector('.pair .me button').dataset.open=c.id+':'+b.dataset.i;c.querySelector('.when').textContent=f.when;c.querySelector('.nums').innerHTML=f.nums;}));
function show(){const p=P[cur],n=p.frames[i],f=F[n],w=wide&&f.wide;img.src='img/'+n+(w?'_w':'')+'.jpg';img.alt=p.title+', '+f.when;
  cap.textContent=p.title;sub.textContent=f.when+(p.frames.length>1?'  ·  '+(i+1)+' of '+p.frames.length:'');nm.innerHTML=f.nums+(f.wread!=null?'<span><b>Wide screen outline</b> '+Math.round(f.wread*100)+'%</span>':'');
  prev.disabled=i<=0;next.disabled=i>=p.frames.length-1;seg.forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.w==='1')===w)));seg[1].disabled=!f.wide;}
function open(key,from){const [id,k]=key.split(':');if(!P[id])return;cur=id;i=+k||0;back=from||null;lb.hidden=false;document.body.style.overflow='hidden';show();$('.lb .close').focus();}
function close(){lb.hidden=true;document.body.style.overflow='';if(back)back.focus();}
document.addEventListener('click',e=>{const b=e.target.closest('[data-open]');if(b){e.preventDefault();open(b.dataset.open,b);}});
$('.lb .close').addEventListener('click',close);prev.addEventListener('click',()=>{if(i>0){i--;show();}});next.addEventListener('click',()=>{if(i<P[cur].frames.length-1){i++;show();}});
seg.forEach(b=>b.addEventListener('click',()=>{wide=b.dataset.w==='1';show();}));
lb.addEventListener('click',e=>{if(e.target===lb||e.target.classList.contains('pic'))close();});
document.addEventListener('keydown',e=>{if(lb.hidden)return;if(e.key==='Escape')close();else if(e.key==='ArrowLeft'&&!prev.disabled){i--;show();}else if(e.key==='ArrowRight'&&!next.disabled){i++;show();}});})();
"""


def build(review_dir, out):
    review = json.load(open(os.path.join(review_dir, 'review.json')))
    review['_dir'] = review_dir
    book = json.load(open(os.path.join(HERE, 'lookbook.json')))
    kept = json.load(open(os.path.join(HERE, 'kept.json')))
    places = book['places']
    byid = {p['id']: p for p in places}
    frames = [n for p in places for n in p['frames']]
    missing = [n for n in frames if n not in review['frames']]
    if missing:
        sys.exit('frames the review does not have: ' + ', '.join(missing))
    pictures(review, out, frames)
    FD = {n: frame_data(review, kept, n) for n in frames}
    for n, d in FD.items():
        d['nums'] = nums(d)
        d['wide'] = os.path.exists(os.path.join(out, 'img', n + '_w.jpg'))
    kinds = {k['id']: k for k in book['kinds']}
    counts = {'ok': 0, 'mid': 0, 'bad': 0}
    for p in places:
        counts['ok' if p['verdict'] == 'target' else p['verdict']] += 1
    A = book['audit']
    # (the lookbook's own last judging, when a version judged places again: since V90)
    B = book.get('before')
    was = (' At %s (%s): %d hold, %d mixed, %d fall off.' % (esc(B['version']), esc(B['date']), B['ok'], B['mid'], B['bad'])) if B else ''
    H = []
    w = H.append
    w('<!DOCTYPE html>\n<html lang="en"><head><meta charset="utf-8">\n'
      '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
      '<title>Noir Gilt Lookbook</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'
      '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
      '<link href="https://fonts.googleapis.com/css2?family=Alegreya+SC:wght@500;700&family=Barlow+Semi+Condensed:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">\n'
      '<style>' + CSS + '</style></head><body>\n')
    w('<div class="wrap" style="padding-bottom:0"><header>')
    w('<div class="kick">Noir Gilt &middot; the visual director, phase 4</div><h1>Lookbook</h1>')
    w('<p class="lede">Every place the game draws, held beside the frame of its kind: set pieces beside the fall, rooms beside the lobby, '
      'the city at night beside Lamplight Street in the rain, and the Pit beside the stairs at dusk. The numbers are the look review\'s; '
      'the verdicts are by eye, and say whether a place stands next to its frame without looking flatter or cheaper.</p>')
    w('<p class="meta">%s &middot; a 412 &times; 714 phone held upright &middot; effects at Full &middot; %s</p>' % (esc(book['version']), esc(book['date'])))
    n_views = len(places)
    w('<div class="counts"><span class="chip ok"><i></i>%d hold</span><span class="chip mid"><i></i>%d mixed</span><span class="chip bad"><i></i>%d fall off</span>'
      '<span class="was">of %d views, the four frames to match counted as holding.%s At the audit (%s, %s): %d hold, %d mixed, %d fall off, of %d.</span></div>'
      % (counts['ok'], counts['mid'], counts['bad'], n_views, was, esc(A['version']), esc(A['date']), A['ok'], A['mid'], A['bad'], A['views']))
    w('</header></div>')
    w('<nav aria-label="Sections"><div class="in"><a href="#four">The four frames</a>' + ''.join('<a href="#%s">%s</a>' % (k['id'], esc(k['title'])) for k in book['kinds'])
      + '<a href="#script">Colour script</a><a href="#review">The review</a><a href="#how">How it was made</a></div></nav>')
    w('<main class="wrap" style="padding-top:0">')
    # the four frames
    w('<section id="four"><h2>The four frames</h2><p>One frame sets the standard for each kind of place, and every other place is judged against the one of its kind.</p><div class="four">')
    for k in book['kinds']:
        t = byid[k['target']]
        idx = t['frames'].index(k['frame'])
        w('<figure><button type="button" data-open="%s:%d" aria-label="%s, full size"><img src="img/%s.jpg" alt="%s" width="618" height="1071"></button>'
          '<figcaption><span class="k">%s</span><b>%s</b><span>%s</span></figcaption></figure>'
          % (esc(t['id']), idx, esc(t['title']), esc(k['frame']), esc(t['title']), esc(k['title']), esc(t['title']), esc(k['sets'])))
    w('</div></section>')
    # each kind's places
    for k in book['kinds']:
        t = byid[k['target']]
        ps = [p for p in places if p['kind'] == k['id']]
        ps.sort(key=lambda p: p['verdict'] != 'target')
        c = {'ok': 0, 'mid': 0, 'bad': 0}
        for p in ps:
            if p['verdict'] != 'target':
                c[p['verdict']] += 1
        w('<section id="%s"><h2>%s</h2><p>Held to %s: %s %s</p><div class="grid">' % (
            esc(k['id']), esc(k['title']), esc(k['name']), esc(k['sets'][0].lower() + k['sets'][1:]),
            esc('Beside it, %d hold, %d mixed, %d fall off.' % (c['ok'], c['mid'], c['bad']))))
        for p in ps:
            vk, vt = VERDICT[p['verdict']]
            f0 = p['frames'][0]
            d0 = FD[f0]
            tgt = p['verdict'] == 'target'
            w('<article class="card%s" id="%s" data-title="%s">' % (' is-tgt' if tgt else '', esc(p['id']), esc(p['title'])))
            w('<div class="pair"><figure class="me"><button type="button" data-open="%s:0" aria-label="%s, full size"><img src="img/%s.jpg" alt="%s, %s" loading="lazy" width="618" height="1071"></button><figcaption>%s</figcaption></figure>'
              % (esc(p['id']), esc(p['title']), esc(f0), esc(p['title']), esc(d0['when']), 'This place' if not tgt else 'The frame'))
            if tgt:
                alt = p['frames'][1] if len(p['frames']) > 1 else f0
                w('<figure class="tg"><button type="button" data-open="%s:%d" aria-label="%s, full size"><img src="img/%s.jpg" alt="%s, %s" loading="lazy" width="618" height="1071"></button><figcaption>Another moment</figcaption></figure></div>'
                  % (esc(p['id']), p['frames'].index(alt), esc(p['title']), esc(alt), esc(p['title']), esc(FD[alt]['when'])))
            else:
                ti = t['frames'].index(k['frame'])
                w('<figure class="tg"><button type="button" data-open="%s:%d" aria-label="%s, full size"><img src="img/%s.jpg" alt="%s" loading="lazy" width="618" height="1071"></button><figcaption>Its frame: %s</figcaption></figure></div>'
                  % (esc(t['id']), ti, esc(t['title']), esc(k['frame']), esc(t['title']), esc(k['name'])))
            w('<div class="body"><div class="top"><h3>%s</h3><span class="chip %s"><i></i>%s</span></div><p class="sub">%s</p>' % (esc(p['title']), vk, vt, esc(p['sub'])))
            if len(p['frames']) > 1:
                w('<div class="frames" role="group" aria-label="Frames">' + ''.join(
                    '<button type="button" data-n="%s" data-i="%d" aria-pressed="%s" aria-label="%s"><img src="img/%s_s.jpg" alt="" loading="lazy" width="124" height="215"></button>'
                    % (esc(n), i, 'true' if i == 0 else 'false', esc(FD[n]['when']), esc(n)) for i, n in enumerate(p['frames'])) + '</div>')
            w('<p class="when">%s</p>' % esc(d0['when']))
            w('<ul class="notes">' + ''.join('<li class="%s">%s</li>' % (esc(kk), esc(tx)) for kk, tx in p['notes']) + '</ul>')
            w('<p class="nums">%s</p>' % d0['nums'])
            fails = [x for n in p['frames'] for x in FD[n]['fails']]
            keptw = sorted({x for n in p['frames'] for x in FD[n]['kept']})
            if fails:
                w('<p class="rev"><b class="f">The review fails it:</b> %s</p>' % esc('; '.join(fails)))
            else:
                w('<p class="rev"><b>Passes the review</b> in every frame%s</p>' % ((', with what is kept: ' + esc('; '.join(keptw)) + '.') if keptw else '.'))
            w('</div></article>')
        w('</div></section>')
    # the colour script
    w('<section id="script"><h2>The colour script</h2><p>Each column is one frame, in story order: the colours its light is made of '
      '(the near-black left out), the most used at the top, each as tall as its share; under it, gold\'s share of the lit picture. '
      'Gold belongs to the family\'s rooms and drains on the roof; the Pit has none. Tap a column to see its frame.</p><div class="script">')
    gmax = max([FD[n]['gold'] or 0 for s in book['script'] for n in s['frames']] + [1])
    loc = {n: (p['id'], i) for p in places for i, n in enumerate(p['frames'])}
    for s in book['script']:
        w('<div class="strip"><div class="lab">%s</div><div class="cols">' % esc(s['label']))
        for n in s['frames']:
            d = FD[n]
            pid, i = loc[n]
            tot = sum(m[1] for m in d['main']) or 1
            bar = ''.join('<span style="background:%s;height:%.1f%%"></span>' % (esc(m[0]), 100 * m[1] / tot) for m in d['main'])
            g = d['gold'] or 0
            w('<button type="button" class="col" data-open="%s:%d" aria-label="%s, %s: gold %.1f%%"><span class="bar">%s</span><span class="gold"><span style="height:%.0f%%"></span></span><span class="nm">%s</span></button>'
              % (esc(pid), i, esc(byid[pid]['title']), esc(d['when']), g, bar, 100 * g / gmax, esc(byid[pid]['title'].split('. ')[-1])))
        w('</div></div>')
    w('<div class="key"><span>Gold\'s share, tallest: %.0f%% (the office)</span><span>The roof before the shot, as it fires and after: %.1f%%, %.1f%%, %.1f%%</span><span>The Pit, most: %.1f%%</span></div>'
      % (gmax, FD['roof_t22']['gold'], FD['roof_t32.9']['gold'], FD['roof_t33.9']['gold'],
         max(FD[n]['gold'] or 0 for p in places if p['kind'] == 'pit' for n in p['frames'] if (FD[n]['lit'] or 0) >= 2)))
    w('</div></section>')
    # the review's rules
    rv = review
    loc = {n: (p['id'], i) for p in places for i, n in enumerate(p['frames'])}
    def fname(n):
        if n in loc:
            return '%s, %s' % (byid[loc[n][0]]['title'], FD[n]['when'])
        F = rv['frames'][n]
        return '%s, %s' % (byid[F['id']]['title'] if F['id'] in byid else F['id'], when(F.get('moment')))
    ph = [(n, f['phone']) for n, f in rv['frames'].items() if not (f.get('phone') or {}).get('gone')]
    worst_black = max((p['stats']['empty'], n) for n, p in ph if n not in kept.get('black', {}))
    reads = [((p.get('hero') or {}).get('read'), n) for n, p in ph if (p.get('hero') or {}).get('read') is not None and not (p.get('hero') or {}).get('struck', 0) > .25]
    worst_read = min(reads)
    grounds = [((p.get('hero') or {}).get('Lb'), n) for n, p in ph if (p.get('hero') or {}).get('Lb') is not None]
    worst_ground = min(grounds)
    costs = sorted(((p['cost']['of'], n, p['cost']['ms']) for n, p in ph if p.get('cost')), reverse=True)
    act1 = set(['roof1', 'kitchen1', 'backroom', 'lostprop', 'yard1', 'list', 'stairsup', 'shelfstair', 'shelf', 'stairsdown', 'toll', 'tamm', 'night', 'sh1'])
    pit_gold = max(((p.get('hues') or {}).get('gold', 0), n) for n, p in ph if rv['frames'][n]['id'] in act1 and (p.get('hues') or {}).get('lit', 0) >= 2)
    words = max((p.get('words') or {}).get('n') or 0 for n, p in ph)
    L = rv['lines']
    rows = [
        ('Flat black', 'The style guide\'s rule 1: 5% of the picture or less, in the action and the scenes', 'At most %s (%s); the three title cards kept' % (pct(worst_black[0]), fname(worst_black[1]))),
        ('Ilyas stands out', 'Rule 8: two thirds of his outline or more, on a phone and a wide screen', 'Least %s (%s); a struck outline is not judged' % (pct(worst_read[0]), fname(worst_read[1]))),
        ('The ground round him', 'Rule 8: .2 or more', 'Least %.2f (%s)' % (worst_ground[0], fname(worst_ground[1]))),
        ('The cost', 'Rule 6: no more than the fall\'s dearest frame, timed by turns, 5% over for the timing\'s wander', 'The fall\'s dearest %.1f ms; the dearest place %s at %.1f ms (%s)' % (rv['fall_ms'], fname(costs[0][1]), costs[0][2], pct(costs[0][0])) if costs else '-'),
        ('No gold in the Pit', 'Rule 3: under 1% of the lit picture in every frame of Act I', 'At most %.1f%% (%s)' % (pit_gold[0], fname(pit_gold[1]))),
        ('The family\'s rooms are gold', 'Rule 3: gold at least matches sodium orange across the lobby\'s and the office\'s frames', 'The lobby %.1f%% against %.1f%%; the office %.1f%% against %.1f%%' % (rv['rooms']['lobby']['gold'], rv['rooms']['lobby']['sodium'], rv['rooms']['office']['gold'], rv['rooms']['office']['sodium'])),
        ('Two words at most', 'Rule 7: over the fighters at once', 'At most %d' % words),
        ('Flat patches', 'The drawing guide\'s rule 5: none lit over 2% of the picture', 'None but those kept'),
        ('Repeats', 'The drawing guide\'s rule 6: no band that repeats across the picture, but where a world\'s rhythm is its style', 'None but those kept'),
        ('Thin lines', 'The drawing guide\'s rule 2: 1.5 units at the least (1 for a highlight), faint lines aside', '%d of %d meet it; %d faint; %d kept as judged in V83 and V84' % (L['meet'], L['assignments'], L['faint'], L['kept'])),
    ]
    w('<section id="review"><h2>The review</h2><p>The measured rules, as <code>python3 test.py look</code> applied them to this version: every frame '
      'on a phone and on a wide screen. A frame that breaks one fails, unless it was judged and kept.</p>')
    w('<div class="tbl"><table><thead><tr><th>Rule</th><th>Passes when</th><th>%s</th><th>Verdict</th></tr></thead><tbody>' % esc(book['version']))
    for a, b, c2 in rows:
        w('<tr><td>%s</td><td>%s</td><td>%s</td><td class="ok">%s</td></tr>' % (esc(a), esc(b), esc(c2), 'Passes' if rv['pass'] else 'See the review'))
    w('</tbody></table></div><h3>Judged and kept</h3><ul class="kept">')
    for rule, K in kept.items():
        if rule.startswith('_'):
            continue
        for name, v in K.items():
            if name.startswith('_'):
                continue
            why = v['why'] if isinstance(v, dict) else v
            nm = name.split('@')[0]   # (a frame kept at one size: name@412x714)
            title = byid[nm]['title'] if nm in byid else (byid[nm.split('_')[0]]['title'] + ', ' + when(nm.split('_')[-1]) if nm.split('_')[0] in byid else nm)
            w('<li><b>%s</b> (%s): %s</li>' % (esc(title), esc({'black': 'flat black', 'flat': 'a flat patch', 'repeat': 'repeats', 'cost': 'its cost'}.get(rule, rule)), esc(why)))
    w('<li><b>%d thin lines</b>: the figure tier\'s, held to the fighters\' drawing budgets, and the places\' fine texture, hairlines and callers\' widths, as judged in V83, V84 and V89.</li>' % L['kept'])
    w('</ul></section>')
    # how it was made
    w('<section id="how"><h2>How it was made</h2><div class="legend">'
      '<p><b>The frames.</b> The look review\'s, of %s as published: every place on auto at set moments (seconds after its stage starts, '
      'or after its fight\'s first turn), shot as a player sees it on a 412 &times; 714 phone held upright, two pixels to the point, effects at Full. '
      'Each still is the page with the game\'s canvas under it; nothing is retouched. The wide-screen stills are 1280 &times; 800.</p>'
      '<p><b>The numbers.</b> Flat black is the share of the picture\'s rows that are flat near-black; the outline, the share of Ilyas\'s '
      'outline where the light steps by .08 or more; the ground, the light right round him (0 black, 1 white); the cost, milliseconds to '
      'draw the frame on a canvas with no graphics chip, timed by turns against the fall where it comes near; gold, sodium and cyan, '
      'each colour\'s share of the lit picture; saturation, the frame\'s average.</p>'
      '<p><b>The verdicts.</b> By eye, each place beside the frame of its kind: it holds when it stands next to it without looking '
      'flatter or cheaper, is mixed when part of it does, and falls off when it does not. A note marked + holds, − does not, '
      '→ is what would bring it up.</p>'
      '<p><b>Again.</b> <code>python3 uiwork/look/lookbook.py</code> builds this page from a look review and the verdicts in '
      'uiwork/look/lookbook.json; it is published again when a version changes the look.</p></div></section>' % esc(book['version']))
    w('<footer>Noir Gilt Lookbook &middot; %s &middot; built from the look review of %s.</footer></main>' % (esc(book['version']), esc(rv['when'])))
    # the lightbox
    w('<div class="lb" hidden role="dialog" aria-modal="true" aria-label="Frame"><div class="hd"><h3></h3><button type="button" class="btn close">Close</button></div>'
      '<div class="pic"><img alt=""></div><div class="ft"><div class="row"><span class="when"></span><span class="seg" role="group" aria-label="Screen">'
      '<button type="button" data-w="0" aria-pressed="true">Phone</button><button type="button" data-w="1" aria-pressed="false">Wide screen</button></span></div>'
      '<p class="nums"></p><div class="row"><button type="button" class="btn prev">Earlier</button><button type="button" class="btn next">Later</button></div></div></div>')
    data = {'frames': {n: {'when': d['when'], 'nums': d['nums'], 'wide': d['wide'], 'wread': d['wread']} for n, d in FD.items()},
            'places': {p['id']: {'title': p['title'], 'frames': p['frames']} for p in places}}
    w('<script id="data" type="application/json">%s</script>' % json.dumps(data, ensure_ascii=False).replace('</', '<\\/'))
    w('<script>' + JS + '</script></body></html>\n')
    open(os.path.join(out, 'index.html'), 'w', encoding='utf8').write(''.join(H))
    size = sum(os.path.getsize(os.path.join(out, 'img', f)) for f in os.listdir(os.path.join(out, 'img')))
    print('lookbook: %d places, %d frames, %d pictures (%.1f MB) in %s' % (len(places), len(frames), len(os.listdir(os.path.join(out, 'img'))), size / 1e6, out))
    print('  %d hold, %d mixed, %d fall off' % (counts['ok'], counts['mid'], counts['bad']))


if __name__ == '__main__':
    a = [x for x in sys.argv[1:] if not x.startswith('--')]
    build(os.path.abspath(a[0] if a else os.path.join(REPO, 'test_out', 'look')), os.path.abspath(a[1] if len(a) > 1 else os.path.join(REPO, 'test_out', 'lookbook')))
