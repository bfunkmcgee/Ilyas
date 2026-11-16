# python3 uiwork/gore/sheet.py <dir> <out.jpg> <first> <step> <count> [cols] [crop x0,y0,x1,y1] [scale]
import sys,os
from PIL import Image,ImageDraw
d,out,first,step,count=sys.argv[1],sys.argv[2],int(sys.argv[3]),int(sys.argv[4]),int(sys.argv[5])
cols=int(sys.argv[6]) if len(sys.argv)>6 else 6
crop=tuple(int(v) for v in sys.argv[7].split(',')) if len(sys.argv)>7 and sys.argv[7]!='-' else None
sc=float(sys.argv[8]) if len(sys.argv)>8 else 1
fs=sorted(os.listdir(d));pn=[f for f in fs if f.endswith('.png')];fs=pn or fs;ims=[]
for k in range(count):
    i=first+k*step
    if i>=len(fs):break
    im=Image.open(os.path.join(d,fs[i])).convert('RGB')
    if crop:im=im.crop(crop)
    if sc!=1:im=im.resize((int(im.width*sc),int(im.height*sc)),Image.LANCZOS)
    ImageDraw.Draw(im).text((3,2),str(i),fill=(255,240,160));ims.append(im)
w,h=ims[0].size;rows=(len(ims)+cols-1)//cols;o=Image.new('RGB',(cols*(w+3),rows*(h+3)),(40,0,40))
for k,im in enumerate(ims):o.paste(im,((k%cols)*(w+3),(k//cols)*(h+3)))
o.save(out,quality=88);print(o.size,len(ims))
