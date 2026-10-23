# (the screenshot copy: build.py --qa, the same build into uiwork/qa_*.html)
import os,sys,runpy
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.argv=[os.path.join(root,'build.py'),'--qa']
runpy.run_path(sys.argv[0],run_name='__main__')
