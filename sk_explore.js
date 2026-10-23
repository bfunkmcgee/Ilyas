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

// walk and jog speeds (world units a second); reach: how near a spot he must stand to use it
const EX={walk:84,jog:142,reach:30,stop:3};
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
function exClampTo(x,z){const B=S.ex.bounds;return{x:clamp(x,B.x0,B.x1),z:clamp(z,B.z0,B.z1)};}
// begin exploring: the hero standing easy where the stage puts him, the camera riding with him
function exStart(spec){const K=hero();
  S.ex={on:true,bounds:spec.bounds||{x0:40,x1:860,z0:30,z1:150},spots:(spec.spots||[]).map(s=>Object.assign({used:0},s)),exits:spec.exits||[],
    goal:spec.goal||null,to:null,run:false,keys:{x:0,z:0,run:false},want:null,moving:false,hand:spec.hand??(S.ex?S.ex.hand:null),view:spec.view||760,area:spec.area||S.arenaKey,t0:S.t,note:null,dropped:0};
  standEasy(K);K.offstage=false;if(spec.start){K.station=spec.start[0];K.lane=spec.start[1];}
  S.game.phase='explore';S.game.ex=null;S.game.aiAt=null;S.opening=null;S.hooks.explore('start',S.ex);}
function exEnd(){if(!S.ex)return;const K=hero();exHalt(K);S.ex.on=false;S.hooks.explore('end',S.ex);}
// send him somewhere (a spot to use when he gets there, if one is given)
function exGo(x,z,o={}){if(!exOn()||S.cut)return false;const p=exClampTo(x,z);S.ex.to={x:p.x,z:p.z,spot:o.spot||null};S.ex.run=!!o.run;S.ex.keys.x=S.ex.keys.z=0;return true;}
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
  // (an item taken up: it is in his hand now, and the spot is gone)
  if(s.take){S.ex.hand=s.take;s.gone=true;}
  s.used++;if(s.once)s.gone=true;S.hooks.explore('use',s);
  if(!s.run){exGoalCheck();return;}
  cutStart('spot:'+s.id,s.run(s),{then:()=>{if(exOn()){S.game.phase='explore';exGoalCheck();}}});}
// what he holds, set down at his feet: a spot to take it up again
function exSetDown(){const E=S.ex;if(!exOn()||S.cut||!E.hand)return false;const K=hero(),it=E.hand,x=clamp(K.station+K.facing*12,E.bounds.x0,E.bounds.x1),z=K.lane;
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
  else if(E.to){const dx=E.to.x-K.station,dz=E.to.z-K.lane,d=Math.hypot(dx,dz);
    if(d<=sp*DT+EX.stop*.2){K.station=E.to.x;K.lane=E.to.z;const sid=E.to.spot;exHalt(K);if(sid){const s=exSpot(sid);if(s&&exShown(s))exRun(s);}return;}
    vx=dx/d*sp;vz=dz/d*sp;}
  if(!vx&&!vz){if(E.moving)exHalt(K);return;}
  const p=exClampTo(K.station+vx*DT,K.lane+vz*DT);
  // against the edge of where he may go: he stops there
  if(Math.hypot(p.x-K.station,p.z-K.lane)<.01){exHalt(K);return;}
  K.station=p.x;K.lane=p.z;if(Math.abs(vx)>4)K.facing=Math.sign(vx);K.cutWalk=true;K.walkEnd=E.to&&!E.keys.x&&!E.keys.z?{x:E.to.x,z:E.to.z}:null;K.walkV={x:vx,z:vz};E.moving=true;
  // a way out
  for(const X of E.exits){if(X.when&&!X.when())continue;if(K.station>=X.x0&&K.station<=X.x1&&K.lane>=X.z0&&K.lane<=X.z1){exHalt(K);S.hooks.explore('exit',X);
    if(X.run)cutStart('exit:'+X.id,X.run(X),{then:()=>{if(exOn()){S.game.phase='explore';exGoalCheck();}}});else exGoalCheck();return;}}}
V11.step.push(exStep);
// a scene that starts while he is walking about (a line called out to him as he goes) stops him where he is: the step in the air
// comes down and he stands, rather than going on stepping in place under the scene (exStep does not run while a scene plays). Where
// he was going is kept, and he goes on there when the scene is over
{const cs=cutStart;cutStart=function(name,gen,o){const E=S.ex;if(E&&E.on&&E.moving){const K=hero();if(K){K.cutWalk=false;K.walkV=null;K.walkEnd=null;K.velX=0;}E.moving=false;}
  return cs(name,gen,o);};}
// the camera rides with him while he explores (a scene may take it over: S.camCut set by the scene wins while the scene runs)
V11.step.push(()=>{const E=S.ex;if(!E||!E.on||S.cut)return;const K=hero();if(K)camTo(K.station,E.view,2.2);});
S.hooks.explore=()=>{};
// a stage that explores: once its opening scene is over, the player has him; the stage's closing scene plays when the goal is met
{const sf=storyFight;storyFight=function(list){const st=S.story&&STAGES[S.story.i];
  if(st&&st.explore){letter(0);S.story.step='explore';exStart(st.explore(st));S.hooks.story('explore');return;}
  sf(list);};}
V11.duelStart.push(()=>{if(S.ex){S.ex.on=false;S.ex=null;}});
{const sq=storyQuit;storyQuit=function(){sq();S.ex=null;};}
// ===== EXPLORE END =====
