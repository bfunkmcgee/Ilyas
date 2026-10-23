// Where Kael's body goes in the Pit (picture x), from the Pit opening until he lands: node tools/cmp/pit_path.js
const core=require('../../sk_src.js')();process.chdir(__dirname+'/../..');
eval(core+`
let a=5;Math.random=()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff;};S.rng=Math.random;
S.storyAuto=true;S.auto=true;storyBegin('fall',{auto:true});
let lo=1e9,hi=-1e9,loY=0,hiY=0,k=0,stages={};
while(k<120*80&&!(S.story&&S.story.ended)){simStep();k++;const P=S.pit;if(!P||!P.on||P.base==null)continue;stages[P.stage]=(stages[P.stage]||0)+1;
  const K=S.F[0];for(const q of K.p){const pp=pitFromW(q.x,q.y);if(pp.y<330)continue;if(pp.x<lo){lo=pp.x;loY=pp.y;}if(pp.x>hi){hi=pp.x;hiY=pp.y;}}}
console.log('steps',k,'ended',S.story&&S.story.ended,'stages',JSON.stringify(stages));
console.log('picture x range below y 330:',lo.toFixed(0),'at y',loY.toFixed(0),'..',hi.toFixed(0),'at y',hiY.toFixed(0));
console.log('wall faces: left',[600,1500,2600,3400].map(y=>pitWallX(PIT.wallL,y).toFixed(0)).join(','),'right',[600,1500,2600,3400].map(y=>pitWallX(PIT.wallR,y).toFixed(0)).join(','));
`);
