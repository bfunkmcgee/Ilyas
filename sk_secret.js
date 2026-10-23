// ===== SECRET START =====
// The kitchen's hidden lift. Once the kitchen is clear and the run goes on, a section of tiled wall to the right of the alley door
// slides aside into the wall and a private lift stands behind it: a click, a low grind, a thin line of cold light, then the lift's
// doors part and the light spills across the kitchen floor. Until that moment the wall looks like the rest of the kitchen wall.
// Contract: SECRET_DOOR={x, slots:[[x,depth],...]} is where the heroes walk to leave the kitchen (the first slot for whoever is
// nearest); revealStart(T) starts the reveal when the kitchen is clear and returns a step function that the transit calls every
// sim step until it returns true; S.secret holds the door's state for drawing and is cleared on every new fight.
const SECRET_DOOR={x:796,slots:[[796,168],[838,150]]};
// the size of the lift in the wall (floor units): the opening, the frame round it and the header above it
const SECRET_ART={w:55,h:138,fr:5,hd:9};
// the reveal on a clock of seconds after the click: the heroes turn to look, the wall section slides aside, the line of light comes on,
// the chime sounds as the doors part, and the walk to the lift starts at the end
const SECRET_T={turn:.3,grind:.36,slide0:.4,slide1:1.4,line:1.2,chime:1.62,open0:1.65,open1:2.35,end:2.55};
S.secret=null;
function revealStart(T){
  if(!deepOn())return null;
  const t0=S.t,D=S.secret={t0},hx=SECRET_DOOR.x,tp=GB-SECRET_ART.h-8,snd=(k,v)=>S.hooks.sound(k,v);
  // dust sifts out of the seams as the section moves
  const puff=()=>dust(hx+(Math.random()-.5)*SECRET_ART.w,tp-(Math.random()*70|0),1,KITCHEN.far,'#cfd8d4');
  const cues=[[0,()=>{snd('click',1);S.shake=Math.max(S.shake,2.5);}],
    [SECRET_T.turn,()=>{for(const h of S.F)if(h.team===0&&!h.dead&&!h.carry)faceToward(h,hx);}],
    [SECRET_T.grind,()=>{snd('grind',1);puff();puff();}],[.7,puff],[1,()=>{puff();puff();}],[SECRET_T.slide1-.05,()=>{puff();S.shake=Math.max(S.shake,3);snd('thud',120);}],
    [SECRET_T.chime,()=>snd('chime',1)]];
  let k=0;
  return()=>{
    if(S.secret!==D)return true;const u=S.t-t0;
    while(k<cues.length&&u>=cues[k][0])cues[k++][1]();
    // a low shudder while the section grinds along
    if(u>SECRET_T.slide0&&u<SECRET_T.slide1)S.shake=Math.max(S.shake,1.4);
    return u>=SECRET_T.end;};
}
V11.duelStart.push(()=>{S.secret=null;});
// ===== SECRET END =====
