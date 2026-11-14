#!/usr/bin/env python3
"""The layers test: the built game with the motion test (its drawn pose and its panel) and, after them, layers.js (the picture on
three sheets, shown by Phaser with focus and dust between them, and the yard's far bands sliding behind it) and panel.js (its
switches). In this copy of the page the yard's painter is opened so that its bands can be painted apart (YARD, below). Not part of
the game's build.

    python3 build.py                        (the game, as always)
    python3 spike/layers/build_layers.py    spike/layers/out/layers-test.html, and out/index.html wrapped for publishing
"""
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
PARTS = (('spike', 'motion', 'motion.js'), ('spike', 'motion', 'panel.js'), ('spike', 'layers', 'layers.js'), ('spike', 'layers', 'panel.js'))


# The yard's painter, opened in this page's copy only (the game's file, envx/env_yard.js, is not changed). Each piece of its text
# must be found once, or the build stops: a painter that has changed has to be opened again by hand.
#   - paint(c, only): 'far' the Pit's far side, 'mid' the shacks round the yard and the lane beyond the fence, 'light' the light
#     over it all, 'over' what the painter lays over that light (the things along the walls again, what grows), anything else the
#     yard itself under its light; with nothing, the whole picture as ever;
#   - behindRow: the middle band's row of shacks run on behind the woodshed and the Sump, and the pole's wires with it. The whole
#     picture hides them; the band shows them as it slides out from behind the yard;
#   - what moves on the far wall (the picture above the layer, the tram, the far chimneys' smoke, the fires, the windows going
#     dark) is drawn on the far band's own sheet when layers.js hands one over (__lyp.far), with no need of the skyline's clip
#     there, since the nearer bands lie over it; the neighbours' chimneys smoke where the middle band has gone (__lyp.mid);
#   - bands: 1 says the painter is open;
#   - lightPass leaves its pools of lamplight out while the page asks (__lyp.unlit: Phaser's lamps then give that light);
#   - normals(c): which way the yard's surfaces face, as a normal map's flat colours, for the plate under the lamps;
#   - drawPiece tells the page each piece it sets down (__lyp.piece), and glowAt asks it how much of a glow to paint
#     (__lyp.glowK; the window's and the open door's own glows are marked __lyp.own and painted whole), both for the lamps
#     (layers.js, "the pieces' shapes"). One line of the light module (sk_lightui.js, put)
#     is opened with them: it tells the page each man's picture it sets down (__lyp.fig);
#   - lampsAt(t, still): the yard's lamps for Phaser's lights (layers.js, "the lamps"): where each is in the picture, how far it
#     reaches, its colour and its strength by the hour, flickering by the painter's own measures.
SLID = "globalThis.__lyp"
YARD = (
    ("function paint(c){const P=K.pal(),X0=-170,X1=W+250,T0=-110;\n  backdrop(c,P,X0,X1,T0);neighbours(c,P);beyond(c,P);\n  ground(c,P);\n",
     "function behindRow(c,P){\n"
     "  for(const f of [{x0:424,x1:512,top:200,base:262,seed:31,col:'#342b2c',wins:[[24,16,13,11]]},{x0:512,x1:584,top:212,base:262,seed:37,col:'#3d3330',wins:[[28,13,12,10]],kind:'tin'},\n"
     "    {x0:584,x1:640,top:192,base:262,seed:41,col:'#30282a',wins:[[16,16,12,10]]}]){f.hz=.12;K.facade(c,P,f);}\n"
     "  c.strokeStyle=rgba('#0a0808',.65);c.lineWidth=1.51;c.beginPath();c.moveTo(700,126);c.lineTo(424,108);c.moveTo(640,156);c.lineTo(424,152);c.stroke();}\n"
     "function paint(c,only){const P=K.pal(),X0=-170,X1=W+250,T0=-110;\n  if(only==='light'){lightPass(c,P);dropShade(c,P);return;}\n  if(only==='over'){crisp(c,P);southOver(c,P);growth(c,P);return;}\n"
     "  if(!only||only==='far')backdrop(c,P,X0,X1,T0);\n  if(only==='mid'&&(" + SLID + "||0).ext!==false)behindRow(c,P);\n"
     "  if(!only||only==='mid'){neighbours(c,P);beyond(c,P);}\n  if(only==='far'||only==='mid')return;\n  ground(c,P);\n"),
    ("  southShadows(c,P);\n  lightPass(c,P);\n  dropShade(c,P);crisp(c,P);southOver(c,P);growth(c,P);}\n// ---------- the pieces that stand among the people",
     "  southShadows(c,P);\n  if(!only){lightPass(c,P);dropShade(c,P);crisp(c,P);southOver(c,P);growth(c,P);}}\n// ---------- the pieces that stand among the people"),
    ("  K.upper('yard:'+T,-1000,",
     "  const __L=" + SLID + ",__c0=ctx,__fc=__L&&__L.far?__L.far(ctx):null;if(__fc)ctx=__fc;\n  K.upper('yard:'+T,-1000,"),
    ("  ctx.save();ctx.clip(skyPath());\n", "  ctx.save();if(!__fc)ctx.clip(skyPath());\n"),
    ("  ctx.restore();\n  // the Sump's stovepipe and the chimneys round the yard\n",
     "  ctx.restore();\n  if(__fc){ctx=__c0;__L.end();}\n  // the Sump's stovepipe and the chimneys round the yard\n"),
    ("  {const srcs=[{x:STOVE.x,y:STOVE.y,s:5,sp:.1,n:8,h:180,dx:24,a:.55}];for(const ch of NEARCH)srcs.push({x:ch.x,y:ch.y,s:4,sp:.09,n:6,h:120,dx:16,a:.45,ph:ch.x*.013});"
     "K.smoke(ctx,srcs,t,P.smoke,T==='night'?.6:1);}\n",
     "  {const srcs=[{x:STOVE.x,y:STOVE.y,s:5,sp:.1,n:8,h:180,dx:24,a:.55}],src2=[];for(const ch of NEARCH)src2.push({x:ch.x,y:ch.y,s:4,sp:.09,n:6,h:120,dx:16,a:.45,ph:ch.x*.013});"
     "K.smoke(ctx,srcs,t,P.smoke,T==='night'?.6:1);\n    ctx.save();if(__L&&__L.mid)__L.mid(ctx);K.smoke(ctx,src2,t,P.smoke,T==='night'?.6:1);ctx.restore();}\n"),
    ("ctx.drawImage(R.cv,0,0,R.w,R.h,R.x,R.y,R.w,R.h);ctx.restore();return true;}\n// where his floor is under him, in canvas pixels",
     "ctx.drawImage(R.cv,0,0,R.w,R.h,R.x,R.y,R.w,R.h);ctx.restore();{const f=(" + SLID + "||0).fig;if(f)f(R);}return true;}\n// where his floor is under him, in canvas pixels"),
    ("function drawPiece(c,T){c.drawImage(T.cv,T.x,T.y,T.w,T.h);}",
     "function drawPiece(c,T){c.drawImage(T.cv,T.x,T.y,T.w,T.h);const f=(" + SLID + "||0).piece;if(f)f(c,T);}"),
    ("function glowAt(c,x,y,r,col,a,sq){if(!(a>0.003))return;",
     "function glowAt(c,x,y,r,col,a,sq){{const f=(" + SLID + "||0).glowK;if(f)a*=f(c,x,y);}if(!(a>0.003))return;"),
    ("K.glowAt(ctx,wp.x,wp.y,40,'#ff9a4a',(T==='night'?.16:.06)*(.9+.1*Math.sin(t*2.3)));",
     "{const o=" + SLID + "||{};o.own=1;K.glowAt(ctx,wp.x,wp.y,40,'#ff9a4a',(T==='night'?.16:.06)*(.9+.1*Math.sin(t*2.3)));o.own=0;}"),
    ("K.glowAt(ctx,dp.x,dp.y,46,'#ff9a4a',.1*(.9+.1*Math.sin(t*5.1)*Math.sin(t*1.3)));",
     "{const o=" + SLID + "||{};o.own=1;K.glowAt(ctx,dp.x,dp.y,46,'#ff9a4a',.1*(.9+.1*Math.sin(t*5.1)*Math.sin(t*1.3)));o.own=0;}"),
    ("function lightPass(c,P){const Yd=Y(),T=P.key,far=Yd.far;\n  c.save();c.globalCompositeOperation='lighter';\n  if(T==='night'){// the back door's light",
     "function lightPass(c,P){const Yd=Y(),T=P.key,far=Yd.far,__ul=!!(" + SLID + "||0).unlit;\n  c.save();c.globalCompositeOperation='lighter';\n  if(T==='night'){// the back door's light"),
    # (the open door's own light stays painted, inside the doorway only: the door is lit from within and takes no lamp, and the
    # step and the wall round it have the lamps now)
    ("K.cRad(c,dp.x,dp.y,6,170,'#ffa850',.34,.42);\n    const dg=Q(D.x,70,far);K.cRad(c,dg.x,dg.y,4,110,'#ff9a4a',.14,1);\n",
     "{const a=Q(D.x-D.w/2,SUMP.doorH,far),b=Q(D.x+D.w/2,0,far);if(__ul){c.save();c.beginPath();c.rect(a.x,a.y,b.x-a.x,b.y-a.y);c.clip();}}K.cRad(c,dp.x,dp.y,6,170,'#ffa850',.34,.42);\n"
     "    const dg=Q(D.x,70,far);K.cRad(c,dg.x,dg.y,4,110,'#ff9a4a',.14,1);if(__ul)c.restore();\n    if(!__ul){\n"),
    ("K.cRad(c,df.x-30,df.y-40,6,90,'#ff9a4a',.08,1);}", "K.cRad(c,df.x-30,df.y-40,6,90,'#ff9a4a',.08,1);}}"),
    # (the candles at the lip and at the drain have no light of Phaser's: their small pools stay painted)
    ("K.cRad(c,sl.x,sl.y,4,96,'#ffcf86',.13*k,.45);K.cRad(c,fr.x,fr.y,6,84,'#ff9a4a',.16*k,.5);K.cRad(c,cd.x,cd.y,3,44,'#ffb070',.1*k,.5);",
     "if(!__ul){K.cRad(c,sl.x,sl.y,4,96,'#ffcf86',.13*k,.45);K.cRad(c,fr.x,fr.y,6,84,'#ff9a4a',.16*k,.5);}K.cRad(c,cd.x,cd.y,3,44,'#ffb070',.1*k,.5);"),
    ("K.cRad(c,tl.x,tl.y,4,90,'#ffcf86',.14*k,.5);K.cRad(c,ls.x,ls.y,10,170,'#ffcf86',.09*k,.36);",
     "if(!__ul){K.cRad(c,tl.x,tl.y,4,90,'#ffcf86',.14*k,.5);K.cRad(c,ls.x,ls.y,10,170,'#ffcf86',.09*k,.36);}"),
    ("E.S.yard={set:()=>SETS[K.tod()]||SETS.day,paint,live,light,key,pieces,LAYOUT,deep:YFOOT+90};",
     "function yardLamps(t,st){const P=K.pal(),T=P.key,Yd=Y(),So=SO(),far=Yd.far,L=[],lit=T==='night'?1:T==='dusk'?.45:0,dk=T==='night'?1:T==='dusk'?.5:.1,\n"
     "    fl=(a,b,p)=>st?1:.86+.14*Math.sin(t*a+p)*Math.sin(t*b+p*1.7),DOWN=[Math.PI/2,2.2,3.1],\n"
     "    // (k: a lamp's strength by the hour, and a lamp under a fifth is not lit at all; f: its flicker on top of that)\n"
     "    add=(q,r,col,k,f,z,cone)=>{if(q&&k>.2)L.push({x:q.x,y:q.y,r,col,k:k*f,z,cone});},\n"
     "    zp=(z,p)=>z&&p.x?{x:z[0]+(p.x-z[0])*z[2],y:z[1]+(p.y-z[1])*z[2]}:null;\n"
     "  // (z is how far a lamp stands out of the picture, as a part of its reach: small for a lamp on a wall or on a line, which then\n"
     "  // shows tight on the wall and as a pool on the ground before it, and lights a man less than the ground; larger for a fire in\n"
     "  // the open, which lights what stands round it)\n"
     "  add(Q(LANT.x,LANT.h-6,LANT.d),280,0xffd29a,LK.wall*lit,fl(7.3,2.9,0),.12);\n"
     "  add(Q(FENCE.x+GLAMP.dx,GLAMP.h-3,Yd.gate.d-Yd.gate.w/2+GLAMP.dd),250,0xffd29a,LK.wall*lit,fl(7.3,2.9,1),.12);\n"
     "  {const q=zp(SHEDS.z,SHEDS.lamp);if(q)add({x:q.x,y:q.y+6},250,0xffd29a,LK.wall*lit,fl(6.7,2.3,2),.12);}\n"
     "  {const q=zp(TABLES.z,TABLES.lamp);add(q,210,0xffd29a,LK.free*lit,fl(6.1,2.7,3),.2);}\n"
     "  {const R=RAILS.lamps;for(const [a,b] of [[0,1],[2,4],[5,7]]){let x=0,y=0,n=0;for(let i=a;i<=b&&i<R.length;i++){x+=R[i].x;y+=R[i].y;n++;}\n"
     "    if(n)add({x:x/n,y:y/n+8},270,0xffd29a,LK.rail*(.7+.15*n)*lit,fl(5.3+a*.7,2.1,4+a),.1);}}\n"
     "  {const W0=Yd.window;add(Q((W0.x0+W0.x1)/2,(W0.y0+W0.y1)/2,far),250,0xffb070,T==='night'?LK.win:T==='dusk'?LK.win*.5:0,fl(2.3,1.1,7),.2,DOWN);}\n"
     "  if(T==='night'){const D=Yd.door;add(Q(D.x,SUMP.doorH*.5,far),340,0xffbe84,LK.door,fl(5.1,1.3,8),.2,DOWN);}\n"
     "  {const F=So.fire;add(Q(F.x,34,F.d),230,0xff9a58,LK.fire*dk,st?.85:.72+.28*Math.sin(t*8.3)*Math.sin(t*2.7),.35);}\n"
     "  add(Q(DRUM.x,34*DRUM.k,DRUM.d),240,0xff9650,LK.drum*P.fire*dk,st?.8:.75+.25*Math.sin(t*11)*Math.sin(t*3.7),.3);\n"
     "  return L;}\n"
     "const LK={wall:.9,free:2,rail:2.2,win:.5,door:.95,fire:1.7,drum:1.7};\n"
     "function yardNormals(c){const Yd=Y(),So=SO(),far=Yd.far,T=K.pal().key,G='rgb(127,191,238)',W='rgb(127,127,255)',R='rgb(127,230,203)',E='rgb(127,127,0)',\n"
     "    box=(col,x0,x1,h0,h1,d,d1)=>{const a=Q(x0,h1,d1==null?d:d1),b=Q(x1,h0,d);c.fillStyle=col;c.fillRect(a.x,a.y,b.x-a.x,b.y-a.y);};\n"
     "  c.fillStyle=G;c.fillRect(-900,-600,3200,3200);\n"
     "  {const f=Q(0,0,far).y,w=Q(0,Yd.wall.h,Yd.wall.d).y,x1=Q(SHED.x1,0,far).x,top=Q(0,SUMP.ridge,far+SUMP.rd).y;\n"
     "    c.fillStyle=W;c.fillRect(-900,-600,3200,f+600);box(W,Yd.wall.x0,Yd.wall.x1+400,0,Yd.wall.h,Yd.wall.d);\n"
     "    c.fillStyle=E;c.fillRect(-900,-600,3200,top+600-26);c.fillRect(x1,-600,2400,w+600);}\n"
     "  box(R,SUMP.x0-6,SUMP.x1+4,SUMP.eave,SUMP.ridge,far,far+SUMP.rd);box(R,SUMP.x1+4,SHED.x1+2,SHED.h,SHED.back,far,far+40);\n"
     "  if(T==='night'||T==='dusk'){const W0=Yd.window;box(E,W0.x0,W0.x1,W0.y1,W0.y0,far);}\n"
     "  if(T==='night'){const D=Yd.door;box(E,D.x-D.w/2,D.x+D.w/2,0,SUMP.doorH,far);}\n"
     "  {const D=So.drain;box(W,D.x-D.r-24,D.x+D.r+24,0,D.r*2+30,D.d);box(E,D.x-D.r+8,D.x+D.r-8,6,D.r*2-10,D.d);\n"
     "    const L=So.lip,p0=Q(L[0][0],0,L[0][1]);c.fillStyle=E;c.beginPath();c.moveTo(2400,p0.y);for(const [x,d] of L){const p=Q(x,0,d);c.lineTo(p.x,p.y);}\n"
     "    {const p=Q(L[L.length-1][0],0,L[L.length-1][1]);c.lineTo(p.x,2600);}c.lineTo(2400,2600);c.closePath();c.fill();}}\n"
     "E.S.yard={set:()=>SETS[K.tod()]||SETS.day,paint,live,light,key,pieces,LAYOUT,deep:YFOOT+90,bands:1,lampsAt:yardLamps,normals:yardNormals,LK};"),
)


def open_yard(page):
    for old, new in YARD:
        if page.count(old) != 1:
            sys.exit('the yard\'s painter is not as the layers test expects (found %d times): %r' % (page.count(old), old[:70]))
        page = page.replace(old, new)
    return page


def main():
    args = sys.argv[1:]
    src = os.path.abspath(args[0]) if args else os.path.join(ROOT, 'ragdoll-skirmish-lab.html')
    page = open(src, encoding='utf-8').read()
    parts = [('/'.join(n), open(os.path.join(ROOT, *n), encoding='utf-8').read()) for n in PARTS]
    for name, s in parts:
        if '</script' in s:
            sys.exit(name + ' holds a closing script tag: it cannot go in the page as it is')
    title = '<title>Ragdoll Skirmish Lab</title>'
    if page.count(title) == 1:
        page = page.replace(title, '<title>Ilyas: layers test</title>')
    page = open_yard(page)
    out = page + ''.join('<script>\n' + s + '\n</script>\n' for _, s in parts)
    os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
    p = os.path.join(HERE, 'out', 'layers-test.html')
    open(p, 'w', encoding='utf-8').write(out)
    print('built %s (%d KB)' % (os.path.relpath(p, ROOT), len(out.encode('utf-8')) // 1024))
    subprocess.check_call([sys.executable, os.path.join(ROOT, 'tools', 'wrap_page.py'), os.path.join(HERE, 'out', 'index.html'), p])


if __name__ == '__main__':
    main()
