// ===== EXPLORE START =====
// Walking about between the fights. The hero goes where the player sends him on the floor (a tap or a click on the ground, or the
// keys), at a walk or a jog; he looks at and uses the things round him (spots), talks to the people there, and goes on through the
// place's ways out (exits). A stage that explores carries st.explore(st) -> {bounds, start, spots, exits, goal}: the game holds all
// of it in S.ex, and the page only draws it and turns taps and keys into exGo / exUse / S.ex.keys.
// A spot: {id, label, verb ('Look', 'Use', 'Talk'...), x, z (where he stands to use it), at:{x,y,d} (the thing itself, where its
// marker is drawn and what he turns to face), run (a scene script, run like any scene: function*(spot)), when() (shown only while
// it is true), once (gone once used), key (counts toward the goal), needs ('free': an empty hand; 'two': two hands, which he has not
// got in Act I; or a function giving the reason it cannot be used now, or null), refused (a scene played when it is refused), take
// (an item: using the spot puts it in his hand)}. An exit: {id, x0,x1,z0,z1 (the ground that leads out), to, label}.
// The goal: {text (or a function giving it), done()}; when done() turns true the stage's exploring is over and its closing scene plays.
// His hand (S.ex.hand): what his one hand holds, an item {id, name} or null. What he holds he can set down at his feet, where it
// becomes a spot to take it again. A refusal shows as a short note (S.ex.note) and plays the spot's refused scene, if it has one.
// blocks: what stands on the floor that he walks round (exBlock, below). The floor is bounds' box, less any corners cut off it
// (bounds.cuts, since V118: [{nx,nz,c}], he stays where nx*x+nz*z<=c: the yard's edge over the Pit runs aslant).

// walk and jog speeds (world units a second); reach: how near a spot he must stand to use it
const EX={walk:84,jog:142,reach:30,stop:3,lift:.36};
S.ex=null;
function exOn(){return!!S.ex&&S.ex.on;}
function exSpot(id){return S.ex&&S.ex.spots.find(s=>s.id===id)||null;}
function exShown(s){return!s.gone&&(!s.when||s.when());}
// why a spot cannot be used now, or null
function exWhyNot(s){const E=S.ex;if(!s.needs)return null;
  if(s.needs==='two')return'Needs two hands';
  if(s.needs==='free')return E.hand?'Your hand is full. Set down '+E.hand.name.toLowerCase()+' first':null;
  return typeof s.needs==='function'?s.needs(s)||null:null;}
function exNote(text){if(S.ex)S.ex.note={text,t0:S.t};}
function exClampTo(x,z){const B=S.ex.bounds,p={x:clamp(x,B.x0,B.x1),z:clamp(z,B.z0,B.z1)};
  // (a cut corner: the point comes straight back onto its line, so a man steered into it goes along it)
  if(B.cuts)for(let i=0;i<3;i++)for(const k of B.cuts){const o=k.nx*p.x+k.nz*p.z-k.c;if(o>0){p.x=clamp(p.x-k.nx*o,B.x0,B.x1);p.z=clamp(p.z-k.nz*o,B.z0,B.z1);}}
  return p;}
// What stands on the floor in his way (since V117): a stage's exploring may give blocks, [{x0,x1,z0,z1}], that he walks round. Sent
// somewhere straight through one, he goes along its face and round its nearer end; steered into one, he stops against it. A point
// inside one that he is sent to, or sets something down at, is moved out to its nearest edge.
function exBlock(x,z){const B=S.ex&&S.ex.blocks;if(B)for(const b of B)if(x>b.x0&&x<b.x1&&z>b.z0&&z<b.z1)return b;return null;}
function exOutOf(x,z){const B=S.ex.bounds;
  // (things may stand against each other, since V118: the nearest edge that is not inside the next thing, and out of that one too)
  for(let i=0;i<4;i++){const b=exBlock(x,z);if(!b)break;const c=[];
    if(b.x0>=B.x0)c.push([x-b.x0,b.x0,z]);if(b.x1<=B.x1)c.push([b.x1-x,b.x1,z]);if(b.z0>=B.z0)c.push([z-b.z0,x,b.z0]);if(b.z1<=B.z1)c.push([b.z1-z,x,b.z1]);
    if(!c.length)break;c.sort((a,e)=>a[0]-e[0]);const q=c.find(q=>!exBlock(q[1],q[2]))||c[0];x=q[1];z=q[2];}
  return{x,z};}
// A way round what stands in his way (since V118: in the yard's south things stand against each other, and the step's own way
// round one thing at a time, below, cannot get past two). Where the straight line to where he is sent crosses a block, the shortest
// way by the blocks' corners (stood off a little) is found once, as he is sent: the points to walk through before the place itself.
// Null where the line is clear, or where there is no way (the step's own way round then, as before).
function exSegHits(x0,z0,x1,z1,b){const e=.01,dx=x1-x0,dz=z1-z0;let t0=0,t1=1;
  for(const [p,q] of [[-dx,x0-(b.x0+e)],[dx,(b.x1-e)-x0],[-dz,z0-(b.z0+e)],[dz,(b.z1-e)-z0]]){
    if(p===0){if(q<0)return false;continue;}const r=q/p;if(p<0){if(r>t1)return false;if(r>t0)t0=r;}else{if(r<t0)return false;if(r<t1)t1=r;}}
  return t1-t0>1e-6;}
function exRoute(ax,az,bx,bz){const E=S.ex,BL=E&&E.blocks;if(!BL||!BL.length)return null;
  const clear=(x0,z0,x1,z1)=>{for(const b of BL)if(exSegHits(x0,z0,x1,z1,b))return false;return true;};
  if(clear(ax,az,bx,bz))return null;
  const m=3,N=[[ax,az],[bx,bz]],on=(x,z)=>{const c=exClampTo(x,z);return Math.abs(c.x-x)<.01&&Math.abs(c.z-z)<.01;};
  for(const b of BL)for(const [x,z] of [[b.x0-m,b.z0-m],[b.x1+m,b.z0-m],[b.x1+m,b.z1+m],[b.x0-m,b.z1+m]])if(on(x,z)&&!exBlock(x,z))N.push([x,z]);
  const n=N.length,D=new Array(n).fill(1e9),P=new Array(n).fill(-1),done=new Array(n).fill(false);D[0]=0;
  for(;;){let u=-1;for(let i=0;i<n;i++)if(!done[i]&&D[i]<1e9&&(u<0||D[i]<D[u]))u=i;if(u<0||u===1)break;done[u]=true;
    for(let v=0;v<n;v++){if(done[v])continue;const w=Math.hypot(N[v][0]-N[u][0],N[v][1]-N[u][1]);if(D[u]+w>=D[v]||!clear(N[u][0],N[u][1],N[v][0],N[v][1]))continue;D[v]=D[u]+w;P[v]=u;}}
  if(D[1]>=1e9)return null;const out=[];for(let v=P[1];v>0;v=P[v])out.unshift(N[v]);return out;}
// begin exploring: the hero standing easy where the stage puts him, the camera riding with him
function exStart(spec){const K=hero();
  S.ex={on:true,bounds:spec.bounds||{x0:40,x1:860,z0:30,z1:150},spots:(spec.spots||[]).map(s=>Object.assign({used:0},s)),exits:spec.exits||[],
    goal:spec.goal||null,to:null,run:false,keys:{x:0,z:0,run:false},want:null,moving:false,hand:spec.hand??(S.ex?S.ex.hand:null),view:spec.view||760,viewN:spec.viewN||null,cam:spec.cam||null,blocks:spec.blocks||null,area:spec.area||S.arenaKey,t0:S.t,note:null,dropped:0};
  standEasy(K);K.offstage=false;if(spec.start){K.station=spec.start[0];K.lane=spec.start[1];}
  // (a floor that runs on toward us past where a fight goes: his own near limit goes with it, for the stage)
  K.zMin=S.ex.bounds.z0<DEP_MIN?S.ex.bounds.z0:null;
  S.game.phase='explore';S.game.ex=null;S.game.aiAt=null;S.opening=null;S.hooks.explore('start',S.ex);}
function exEnd(){if(!S.ex)return;const K=hero();exHalt(K);S.ex.on=false;S.hooks.explore('end',S.ex);}
// send him somewhere (a spot to use when he gets there, if one is given)
function exGo(x,z,o={}){if(!exOn()||S.cut)return false;const c=exClampTo(x,z),p=exOutOf(c.x,c.z),K=hero();S.ex.to={x:p.x,z:p.z,spot:o.spot||null,path:K?exRoute(K.station,K.lane,p.x,p.z):null};S.ex.run=!!o.run;S.ex.keys.x=S.ex.keys.z=0;return true;}
// go to a spot and use it (at once if he is there already)
function exUse(id,o={}){const s=exSpot(id);if(!s||!exShown(s)||!exOn()||S.cut)return false;
  const K=hero();if(Math.hypot(s.x-K.station,(s.z-K.lane)*.8)<=EX.reach){exHalt(K);exRun(s);return true;}
  return exGo(s.x,s.z,{spot:s.id,run:o.run??S.ex.run});}
// the nearest spot he could use from where he stands
function exNear(){if(!exOn())return null;const K=hero();let best=null,bd=EX.reach*1.6;
  for(const s of S.ex.spots){if(!exShown(s))continue;const d=Math.hypot(s.x-K.station,(s.z-K.lane)*.8);if(d<bd){bd=d;best=s;}}return best;}
function exHalt(K){K.cutWalk=false;K.walkV=null;K.walkEnd=null;K.velX=0;if(S.ex){S.ex.to=null;S.ex.moving=false;}}
// using a spot plays its scene; exploring picks up again when it is over
function exRun(s){const K=hero();if(s.at){const dx=s.at.x-K.station;if(Math.abs(dx)>4)K.facing=Math.sign(dx);}
  // (refused: the note, and the spot's refused scene; it does not count as used)
  const why=exWhyNot(s);if(why){s.tried=true;exNote(why);S.hooks.explore('refuse',s);if(s.refused)cutStart('refuse:'+s.id,s.refused(s),{then:()=>{if(exOn())S.game.phase='explore';}});return;}
  // (an item taken up: it is in his hand now, and the spot is gone. He stoops for it: it leaves the ground when his hand has got
  // down to it, S.ex.lift, which the page reads to draw it where it lay until then)
  if(s.take){S.ex.hand=s.take;s.gone=true;S.ex.lift=s.at?{until:S.t+EX.lift,x:s.at.x,z:s.at.d??s.z}:null;K.action=stoopAction(K,.7,{crouch:.84,lean:.42});}
  s.used++;if(s.once)s.gone=true;S.hooks.explore('use',s);
  if(!s.run){exGoalCheck();return;}
  cutStart('spot:'+s.id,s.run(s),{then:()=>{if(exOn()){S.game.phase='explore';exGoalCheck();}}});}
// what he holds, set down at his feet: a spot to take it up again
function exSetDown(){const E=S.ex;if(!exOn()||S.cut||!E.hand)return false;const K=hero(),it=E.hand,at=exOutOf(clamp(K.station+K.facing*12,E.bounds.x0,E.bounds.x1),K.lane),x=at.x,z=at.z;
  E.hand=null;E.dropped++;exHalt(K);
  E.spots.push({id:'item:'+it.id+':'+E.dropped,label:it.name,verb:'Take',x,z,at:{x,y:S.arena.ground(x,z)-6,d:z},take:it,used:0,floor:true});
  K.action=stoopAction(K,.9,{crouch:.82,lean:.42});S.hooks.explore('drop',it);return true;}
// what the auto explorer uses next: what can be used now (things before what lies on the floor, the goal's own last), else something
// not yet tried, to meet its refusal once
function exAutoPick(){const E=S.ex,live=E.spots.filter(s=>exShown(s)&&!s.used),ok=live.filter(s=>!exWhyNot(s));
  return ok.find(s=>!s.key&&!s.floor)||ok.find(s=>s.floor)||ok.find(s=>s.key)||live.find(s=>!s.tried)||null;}
function exGoalCheck(){const E=S.ex;if(!E||!E.on||!E.goal||S.cut)return;if(E.goal.done()){exEnd();if(S.story&&S.story.step==='explore')storyCleared();}}
// every step: the keys steer him, or he walks to where he was sent; at a spot he uses it; on an exit's ground he goes through it
function exStep(){const E=S.ex;if(!E||!E.on||S.cut||S.warming)return;const K=hero();if(!K||K.dead)return;
  // on auto (the checks, a watched run) he goes to each thing in turn, the ones the goal needs last (exAutoPick); with nothing he can
  // use and something in his hand, he sets it down
  if((S.storyAuto||S.auto)&&!E.to&&!E.keys.x&&!E.keys.z&&!S.say&&S.t-E.t0>.6&&!K.action){const s=exAutoPick();if(s)exUse(s.id);else if(E.hand)exSetDown();}
  let vx=0,vz=0;const sp=(E.keys.run||E.run)?EX.jog:EX.walk;
  if(E.keys.x||E.keys.z){E.to=null;const L=Math.hypot(E.keys.x,E.keys.z)||1;vx=E.keys.x/L*sp;vz=E.keys.z/L*sp*.7;}
  else if(E.to){let dx,dz,d,W0;
    // (by the points of his way round, where he was sent one: each is passed without a stop)
    for(;;){W0=E.to.path&&E.to.path[0];dx=(W0?W0[0]:E.to.x)-K.station;dz=(W0?W0[1]:E.to.z)-K.lane;d=Math.hypot(dx,dz);if(W0&&d<=sp*DT){E.to.path.shift();continue;}break;}
    if(!W0&&d<=sp*DT+EX.stop*.2){K.station=E.to.x;K.lane=E.to.z;const sid=E.to.spot;exHalt(K);if(sid){const s=exSpot(sid);if(s&&exShown(s))exRun(s);}return;}
    vx=dx/d*sp;vz=dz/d*sp;}
  if(!vx&&!vz){if(E.moving)exHalt(K);return;}
  let p=exClampTo(K.station+vx*DT,K.lane+vz*DT);
  // something standing in his way: along its face with what is left of his step; walking straight at it, sent, round its nearer end
  const blk=exBlock(p.x,p.z);
  if(blk){const B=E.bounds,st=sp*DT,px=exClampTo(K.station+vx*DT,K.lane),pz=exClampTo(K.station,K.lane+vz*DT),okx=Math.abs(vx)>1&&!exBlock(px.x,px.z),okz=Math.abs(vz)>1&&!exBlock(pz.x,pz.z);
    const inZ=K.lane>blk.z0&&K.lane<blk.z1,inX=K.station>blk.x0&&K.station<blk.x1;
    if(E.to&&(inZ||inX)){const cost=(e,a,t)=>Math.abs(a-e)+Math.abs(t-e),pick=(e0,e1,ok0,ok1,a,t)=>ok0&&(!ok1||cost(e0,a,t)<=cost(e1,a,t))?e0:ok1?e1:null,
        on=(a,e)=>e==null?a:Math.abs(e-a)<=st?e:a+Math.sign(e-a)*st;
      p=inZ?{x:K.station,z:on(K.lane,pick(blk.z0,blk.z1,blk.z0>=B.z0,blk.z1<=B.z1,K.lane,E.to.z))}:{x:on(K.station,pick(blk.x0,blk.x1,blk.x0>=B.x0,blk.x1<=B.x1,K.station,E.to.x)),z:K.lane};}
    else p=okx&&okz?(Math.abs(vx)>=Math.abs(vz)?px:pz):okx?px:okz?pz:{x:K.station,z:K.lane};
    vx=(p.x-K.station)/DT;vz=(p.z-K.lane)/DT;}
  // against the edge of where he may go: he stops there
  if(Math.hypot(p.x-K.station,p.z-K.lane)<.01){exHalt(K);return;}
  K.station=p.x;K.lane=p.z;if(Math.abs(vx)>4)K.facing=Math.sign(vx);K.cutWalk=true;K.walkEnd=E.to&&!E.keys.x&&!E.keys.z&&!(E.to.path&&E.to.path.length)?{x:E.to.x,z:E.to.z}:null;K.walkV={x:vx,z:vz};E.moving=true;
  // a way out
  for(const X of E.exits){if(X.when&&!X.when())continue;if(K.station>=X.x0&&K.station<=X.x1&&K.lane>=X.z0&&K.lane<=X.z1){exHalt(K);S.hooks.explore('exit',X);
    if(X.run)cutStart('exit:'+X.id,X.run(X),{then:()=>{if(exOn()){S.game.phase='explore';exGoalCheck();}}});else exGoalCheck();return;}}}
V11.step.push(exStep);
// a scene that starts while he is walking about (a line called out to him as he goes) stops him where he is: the step in the air
// comes down and he stands, rather than going on stepping in place under the scene (exStep does not run while a scene plays). Where
// he was going is kept, and he goes on there when the scene is over
{const cs=cutStart;cutStart=function(name,gen,o){const E=S.ex;if(E&&E.on&&E.moving){const K=hero();if(K){K.cutWalk=false;K.walkV=null;K.walkEnd=null;K.velX=0;}E.moving=false;}
  return cs(name,gen,o);};}
// the camera rides with him while he explores (a scene may take it over: S.camCut set by the scene wins while the scene runs). A
// stage may give the view's width on an upright phone (viewN) and frame it its own way each step (cam(C,K,E): the cut to adjust)
V11.step.push(()=>{const E=S.ex;if(!E||!E.on||S.cut)return;const K=hero();if(!K)return;camTo(K.station,E.view,2.2);if(E.viewN)S.camCut.wn=E.viewN;if(E.cam)E.cam(S.camCut,K,E);});
S.hooks.explore=()=>{};
// a stage that explores: once its opening scene is over, the player has him; the stage's closing scene plays when the goal is met
{const sf=storyFight;storyFight=function(list){const st=S.story&&STAGES[S.story.i];
  if(st&&st.explore){letter(0);S.story.step='explore';exStart(st.explore(st));S.hooks.story('explore');return;}
  sf(list);};}
V11.duelStart.push(()=>{if(S.ex){S.ex.on=false;S.ex=null;}});
{const sq=storyQuit;storyQuit=function(){sq();S.ex=null;};}
// ===== EXPLORE END =====
