// ===== THE GONDOLA START (since V106) =====
// Asked for in V106: in the office, Kade kicks Ilyas back through the glass and the two of them come down on the window cleaners'
// cradle hanging outside the tower; they finish the duel on it while one of its ropes parts and it swings down until it hangs on the
// other; then Ilyas climbs back in to Hallowell. The kick is a set piece of the office's fight (setPiece, sk_lantern.js); the cradle is
// a stage of the office's chapter with no card of its own (gondola), its rope parting another set piece, his climb its closing scene;
// the office again, the game's last scene with Hallowell in it, is another (officeback). What happens is the game's, here; the page
// draws it (envx/env_gondola.js, sk_gondolaui.js).

// ---------- the cradle ----------
// world units: its deck from x0 to x1 and from depth d0 to d1 (at GB), its stirrups stir high with the hoists on them, its ropes at
// depth rd; the tower's glass face at depth face behind it and its corner, a floor of the tower every floor up it. The right rope's
// drum is the hanger it swings on once the left rope has gone (hx, hy).
const GOND={x0:150,x1:760,d0:10,d1:176,stir:120,rd:93,face:200,corner:826,floor:330};GOND.hx=GOND.x1;GOND.hy=GB-GOND.stir-17;
// S.gondola: dy, how it bucks on its ropes when they land on it; tilt, how far it has swung down on the right rope (0 level, -1.48
// near hanging); snap, when the left rope parted; wy, how far the face has gone down past him as he climbs
S.gondola=null;V11.duelStart.push(()=>{S.gondola=null;});
// a point of the cradle (x and y as it hangs level and still) where it is now: bucked (dy), turned about the right hanger as it swings
// down (tilt), and gone down with the face as he climbs (wy)
function gondXf(x,y){const s=S.gondola;if(!s)return{x,y};const a=s.tilt||0,off=(s.dy||0)+(s.wy||0),y2=y+off;if(!a)return{x,y:y2};
  const ca=Math.cos(a),sa=Math.sin(a),hx=GOND.hx,hy=GOND.hy+off;return{x:hx+(x-hx)*ca-(y2-hy)*sa,y:hy+(x-hx)*sa+(y2-hy)*ca};}
storyArena('gondola',{label:'Gondola',name:'The window cleaners’ cradle',ground:x=>x>GOND.x0+2&&x<GOND.x1-2?GB+(S.gondola&&S.gondola.dy||0):GB+3000,wall:null,far:180,
  minX:GOND.x0+46,maxX:GOND.x1-46});
// the stirrups at its ends hold whoever is on it on it (the stage's minX and maxX keep where they mean to stand; a body thrown at an
// end stops at it); whoever the scene has hanging off it is held there by the scene (f.hanging: no ground under him)
{const cl=collide;collide=function(f,fin){cl(f,fin);if(S.arenaKey!=='gondola'||f.offstage||f.hanging)return;
  for(const q of f.p){if(q.x<GOND.x0+8)q.x=GOND.x0+8;else if(q.x>GOND.x1-8)q.x=GOND.x1-8;}};}
{const gr=Fighter.prototype.gr;Fighter.prototype.gr=function(x){return this.hanging?GB+5000:gr.call(this,x);};}
// a body the scene holds in a pose of its own after the world's step (f.pin(): gobPose's terms, sk_under.js, with xf a turn of the
// world laid over it), at rest there
{const ep=envPost;envPost=function(){ep();for(const f of S.F){if(!f.pin)continue;const o=f.pin();if(o)gobPose(f,o,o.xf||null);}};}
// the pose of a body hanging from a hand at H (the world's x and y): the chest under it at the arm's reach, the hips under that, the
// legs hanging, a little swing; o.grip says which hand holds on ('off', the other holding the blade out at o.free, or 'both')
function hangPose(f,H,o={}){const b=f.body,reach=b.ua+b.fa-.8,sw=o.sw||0,che={x:H.x+sw*.7-f.facing*3,y:H.y+reach*.9},cr=o.crouch??.88,pel={x:che.x+sw,y:che.y+b.torso};
  const lean=Math.atan2(che.x-pel.x,pel.y-che.y)*f.facing;
  const grip=o.grip||'off',free=o.free||{x:che.x+f.facing*reach*.8,y:che.y+6};
  return{x:pel.x,y:pel.y+f.leg*cr,crouch:cr,lean,up:o.up??.25,hf:grip==='off'?free:H,hb:grip==='both'?{x:H.x+f.facing*5,y:H.y}:(grip==='off'?H:free),stF:o.stF??.06,stB:o.stB??.12,wAng:o.wAng};}
const kadeOf=()=>S.F.find(f=>f.team===1&&f.name==='Kade'&&!f.dead)||null;

// ---------- the office: the kick ----------
// Soon in the office's fight (once Kade has been hurt, two turns in, or five turns in), the two of them free: he drives Ilyas back across the room to the glass, and a front kick puts
// him back through a pane; Ilyas's hand closes on Kade's lapel as he goes, so Kade goes with him. Out past the glass the two show
// only through it (clipRect), and drop out of it: the cut is to the cradle two floors down.
const KICK={pane:0,x:640,dx:-74,dz:-24};
function kickAction(f,t0){const x=f.station,z=f.lane,L=f.leg;
  return{t0,end:.8,body:bodyKeys(f,[[0,'now'],[.16,'kickCock',{px:x,pz:z},eOut],[.3,{px:x+6,pz:z,crouch:.9,lean:-.22,stF:.08*L,stB:-.3*L,th:.9,kick:{pl:[1.02*L,-.34*L]},kw:1},eIn],
      [.48,{px:x+8,pz:z,crouch:.9,lean:-.18,stF:.08*L,stB:-.3*L,th:.9,kick:{pl:[.92*L,-.22*L]},kw:.9},sstep],[.8,'guard',{px:x+6,pz:z},sstep]]),
    arm:armKeys(f,[[0,'now'],[.3,'guard'],[.8,'guard']])};}
// (a walk in a scene facing the other way: giving ground, his face to the man driving him)
function* backTo(f,x,z,v,fa){f.cutWalk=true;f.walkEnd={x,z};const t1=S.t+Math.hypot(x-f.station,z-f.lane)/v+1;
  while(true){const dx=x-f.station,dz=z-f.lane,d=Math.hypot(dx,dz),st=v*DT;f.facing=fa;if(d<=st||S.t>t1){f.station=x;f.lane=z;break;}
    f.station+=dx/d*st;f.lane+=dz/d*st;f.walkV={x:dx/d*v,z:dz/d*v};yield;}
  f.cutWalk=false;f.walkV=null;f.walkEnd=null;f.velX=0;}
// (a body thrown out through the glass: its hips along a curve, its depth going on out past the glass, then dropping away)
function* throwOut(f,dur,to,dep1){const p=f.p[PEL],z0=f.dep,t0=S.t;f.carry={t0,dur,from:{x:p.x,y:p.y},apex:{x:lerp(p.x,to.x,.4),y:Math.min(p.y,to.y)-34},to,spin:f.facing*-.9};
  while(S.t<t0+dur){const u=(S.t-t0)/dur;f.lane=f.dep=f.stepDep=lerp(z0,dep1,sstep(u));yield;}}
setPiece({stage:'office',key:'kick',
  due(sv){const K=hero(),Kd=kadeOf(),n=sv.oTurns||0;return!!Kd&&setPieceFree(K,Kd)&&!K.mount&&(n>=2&&Kd.hp<Kd.maxHp*.92||n>=5);},
  *run(sv){const K=hero(),Kd=kadeOf(),G0=OFFICE_GLASS,pane=glassPane(G0.x0+G0.pane*(KICK.pane+.5)),kz=G0.d+KICK.dz,cx=KICK.x+KICK.dx;letter(1);
    for(const f of [K,Kd]){f.guarding=false;f.counter=false;f.intent=null;f.zMax=G0.d+140;}
    camTo(KICK.x-40,640,1.1);Object.assign(S.camCut,{band:{top:GB-G0.head-90,foot:GB+40},bandN:{top:GB-G0.head-130,foot:GB+70},xn:KICK.x-20,wn:330});
    // driven back across the room to the glass, giving ground with his guard up
    yield* all(backTo(K,KICK.x,kz,170,-1),(function*(){yield* wait(.12);yield* stepTo(Kd,cx,kz,180);})());
    K.facing=-1;Kd.facing=1;K.station=KICK.x;K.lane=kz;Kd.station=cx;Kd.lane=kz;
    yield* wait(.15);
    // the front kick: the heel into his chest
    Kd.action=kickAction(Kd,S.t);S.hooks.sound('swing',1.4,{s:'swing_heavy'});
    yield* wait(.3);
    S.hooks.sound('crit',26,{s:'crit_blunt'});S.shake=Math.max(S.shake,7);S.freeze=Math.max(S.freeze,.07);
    // back through the pane, his hand closing on Kade's lapel, and Kade with him
    K.action=null;K.downed=true;K.knockUntil=Infinity;K.motor=.06;K.offstage=true;K.wasDown=true;
    const pk=K.p[PEL],out1={x:pk.x+46,y:pk.y+6};
    const goK=throwOut(K,.42,out1,G0.d+70);
    const goKd=(function*(){yield* wait(.14);Kd.action=null;Kd.downed=true;Kd.knockUntil=Infinity;Kd.motor=.06;Kd.offstage=true;Kd.wasDown=true;
      const p=Kd.p[PEL];yield* throwOut(Kd,.46,{x:p.x+90,y:p.y+14},G0.d+58);})();
    const glass=until(()=>{if(K.dep>=G0.d-3&&!(S.story.glass)){glassBreak(K,pane);K.clipRect=glassRect();}if(Kd.dep>=G0.d-3&&S.story.glass)Kd.clipRect=glassRect();return!!K.clipRect&&!!Kd.clipRect;},1.2);
    yield* all(goK,goKd,glass);
    // and down out of the glass, the two of them
    for(const f of [K,Kd]){const p=f.p[PEL];f.carry={t0:S.t,dur:.7,from:{x:p.x,y:p.y},apex:{x:p.x+20,y:p.y-10},to:{x:p.x+40,y:p.y+420},spin:f.facing*-1.4};}
    S.hooks.sound('wind_in',1);yield* wait(.85);
    gondolaGo(sv,K,Kd);},
  // (skipped: as if it had played)
  skip(sv){const K=hero(),Kd=kadeOf();gondolaGo(sv,K,Kd);}});
// on to the cradle: his strength as it is (no breath got back between: the stage after is this one going on), Kade's, the pane
function gondolaGo(sv,K,Kd){sv.flags.officePane=true;sv.flags.kadeHp=Kd?Kd.hp:null;sv.hp=K.hp;sv.healAt='gondola';
  for(const f of [K,Kd])if(f){f.carry=null;f.clipRect=null;f.zMax=null;}storyStage('gondola');}

// ---------- the cradle: the stage ----------
const GOND_SPAWN=[[380,92],[560,100,1]];
// the depths they hang at once the rope has gone (Ilyas's hand on the back rail, Kade at the stirrup's bar)
const GOND_HANG={k:120,kd:100};
// the cradle bucking on its ropes as they come down on it (S.gondola.dy), and swinging down on the right rope once the left has gone
// (S.gondola.tilt): a fall checked hard by the rope, two swings past hanging and back, then hanging
V11.step.push(()=>{const s=S.gondola;if(!s||S.arenaKey!=='gondola')return;
  if(s.buck!=null){const u=S.t-s.buck;s.dy=u<0?0:7*Math.exp(-u*3.4)*Math.sin(u*15);}
  if(s.snap!=null){const u=S.t-s.snap,T=-1.48;s.tilt=u<0?0:T*(1-Math.exp(-2.4*u)*(Math.cos(4.6*u)+.52*Math.sin(4.6*u)));}});
// the two coming down onto it from the face above (a body dropped in: its hips from over the picture down onto the deck)
function* dropOn(f,x,z,dur){f.hidden=false;f.offstage=true;f.downed=true;f.knockUntil=Infinity;f.motor=.08;f.wasDown=true;f.lane=f.dep=f.stepDep=z;
  const y=GB-f.leg*.3;f.carry={t0:S.t,dur,from:{x:x-30,y:GB-560},apex:{x:x-10,y:GB-420},to:{x,y},spin:f.facing*-.8};yield* wait(dur);f.carry=null;}
STAGES.splice(stageIx('office')+1,0,
  {key:'gondola',num:'',title:'',sub:'',part:'office',arena:'gondola',next:'officeback',cardDur:0,noXP:true,
    foes:[{name:'Kade',seed:9301,weapon:'sword',skill:3,temper:'keeper',hp:104}],
    spawn:GOND_SPAWN,
    setup(st){const K=hero(),Kd=S.F[1],sv=S.story;S.gondola={tilt:0,dy:0,wy:0,snap:null,buck:null};sv.flags.officePane=true;
      if(sv.flags.kadeHp!=null)Kd.hp=Math.max(1,Math.min(Kd.maxHp,sv.flags.kadeHp));
      // (out of the picture until they come down onto it)
      for(const f of [K,Kd]){f.hidden=true;f.offstage=true;f.zMax=null;}K.facing=1;Kd.facing=-1;},
    *intro(st){const K=hero(),Kd=S.F[1],s=S.gondola;letter(1);
      camTo((GOND.x0+GOND.x1)/2,860,0);Object.assign(S.camCut,{band:{top:GB-330,foot:GB+150},bandN:{top:GB-420,foot:GB+200},xn:470,wn:380});
      S.hooks.sound('wind_in',1);
      // down out of the night onto the deck, one after the other; it bucks on its ropes
      yield* all(dropOn(K,GOND_SPAWN[0][0],GOND_SPAWN[0][1],.55),(function*(){yield* wait(.22);yield* dropOn(Kd,GOND_SPAWN[1][0],GOND_SPAWN[1][1],.5);})(),
        (function*(){yield* wait(.5);s.buck=S.t;S.hooks.sound('thud_metal',1.4);S.hooks.sound('creak',1);S.shake=Math.max(S.shake,9);})());
      yield* wait(.35);
      // up again, both of them, on the swaying deck
      for(const f of [K,Kd]){f.carry=null;f.motor=1;standUp(f);f.offstage=false;}
      yield* wait(.9);
      yield* speak('Kade','Long way down.',{dur:1.6});
      yield* speak(HERO_NAME,'After you.',{dur:1.4});
      yield* wait(.1);},
    introSkip(st){const K=hero(),Kd=S.F[1];for(const [f,sp] of [[K,GOND_SPAWN[0]],[Kd,GOND_SPAWN[1]]]){f.hidden=false;f.offstage=false;f.carry=null;f.motor=1;
        f.station=sp[0];f.lane=f.dep=f.stepDep=sp[1];f.downed=false;f.knockUntil=S.t;f.build();}
      S.gondola.buck=null;S.gondola.dy=0;},
    // his climb: up the cradle hanging off its rope, onto its stirrup, and up the rope two floors to the pane he went out of, and in
    *outro(st){yield* climbOut();},
    outroSkip(st){const K=hero();K.pin=null;K.hanging=false;}},
  {key:'officeback',num:'',title:'',sub:'',part:'office',arena:'restaurant',room:'office',next:'roof',cardDur:0,noXP:true,
    foes:[],spawn:[[640,180]],
    setup(st){const K=hero(),sv=S.story;officeSetup(st.spawn,[K]);S.finaleDone=false;
      // the pane he went out through, gone (the page draws what is left of it)
      {const OG=OFFICE_GLASS,p=glassPane(OG.x0+OG.pane*(KICK.pane+.5)),g=GB;sv.glass={x0:p.x0,x1:p.x1,d:OG.d,y0:g-OG.head,y1:g-OG.sill,t0:S.t-30,seed:7,hx:(p.x0+p.x1)/2,hy:g-130,frag:[]};}
      standEasy(K);K.facing=-1;K.hidden=true;K.offstage=true;K.zMax=OFFICE_GLASS.d+80;K.station=KICK.x;K.lane=K.dep=K.stepDep=OFFICE_GLASS.d+40;K.build();},
    *intro(st){const K=hero(),G0=OFFICE_GLASS;letter(1);camTo(560,760,0);Object.assign(S.camCut,{xn:600,wn:360});
      // in over the sill out of the night, down onto the boards
      // (out past the glass he shows only through it, the gone pane's gap, until he is in)
      yield* wait(.3);K.hidden=false;K.clipRect=glassRect();S.hooks.sound('wind_in',1);
      K.action=vaultIn(K,S.t,G0.d-30);yield* until(()=>{if(K.clipRect&&K.dep<G0.d-4)K.clipRect=null;return!K.action||S.t>K.action.t0+K.action.end;},1.6);K.action=null;K.clipRect=null;
      K.station=KICK.x-20;K.lane=K.dep=G0.d-30;K.offstage=false;K.zMax=null;K.facing=1;
      yield* goTo(K,560,150,90);K.facing=1;
      // the office, and Hallowell behind his desk: the game's own last scene
      yield* wait(.3);standEasy(K,false);letter(0);camFree();S.story.step='fight';S.story.fightT0=S.t;beginFinale();},
    introSkip(st){const K=hero();K.hidden=false;K.offstage=false;K.zMax=null;K.action=null;K.station=560;K.lane=K.dep=150;K.facing=1;K.build();standEasy(K,false);
      S.story.step='fight';S.story.fightT0=S.t;letter(0);camFree();beginFinale();},
    outro(st){return STAGES[stageIx('office')].outro(st);},
    outroSkip(st){}});
// over the sill and in: up onto it from outside, a knee on it, and down onto the boards
function vaultIn(K,t0,z1){const x=K.station,z0=K.lane,L=K.leg;
  return{t0,end:1.2,quiet:true,body:bodyKeys(K,[[0,{px:x,pz:z0,crouch:.7,lean:.3,stF:.2*L,stB:-.2*L,th:.4,lift:30}],[.35,'overTop',{px:x-6,pz:lerp(z0,z1,.4),lift:44},eOut],
      [.7,'overLand',{px:x-14,pz:z1},eIn],[1.2,{px:x-20,pz:z1,crouch:.9,lean:.06,stF:.12*L,stB:-.14*L,th:.25},sstep]]),
    arm:armKeys(K,[[0,'now'],[.35,'leap',eOut],[.7,'guard'],[1.2,'guard']])};}
// (the office's last scene with Hallowell is the game's own, sk_finale.js; in the story it is the office's closing scene that follows it,
// here the office again's: its stage has no enemy, so the finale is begun by its opening, and its end ends the stage)

// (the cradle's fight is the office's: the office's own XP for it, which its clearing would have given, comes when the cradle is
// cleared; the cradle and the office again give none of their own, noXP, sk_growth.js)
{const sc=storyCleared;storyCleared=function(){const SV=S.story,st=SV&&STAGES[SV.i];
  if(st&&st.key==='gondola'&&typeof growthOn==='function'&&growthOn()&&growthOnce('stage:office')){const O=STAGES[stageIx('office')];xpGain(growthStageXP(O),O.title);}
  return sc.apply(this,arguments);};}

// ---------- the cradle: the rope parts ----------
// Three turns in at least, Kade at a third of his strength or less (or eight turns in), whether they are on their feet or not (the
// deck goes from under them) but in no clinch: the left rope parts at its drum and the cradle drops at that end and swings down until it
// hangs off the right one. Both go down the deck; Ilyas gets a hand on the back rail high up by the hanger and hangs there, the blade
// in the other; Kade goes on down and catches the stirrup at the bottom, and climbs at him up the deck's rail like a ladder, cutting
// at his legs. Ilyas draws his legs up from it and puts a heel in his face: Kade's hands go, and he falls away down the face into
// the night. The fight is over: the scene's end ends the stage.
// (Kade lives to see the glass and the rope go, and comes out onto the cradle with the most of the fight still in him: in the office's
// fight before the kick his strength goes no lower than KADE_KEEP of it, and on the cradle before the rope parts no lower than a breath,
// a blow that would have killed him putting him down, with no finisher, as a stage that spares its people does, sk_pit6.js; the set
// piece comes once he is up. Only a death in the fight, with an exchange on the books: a scene's own kill, sceneKill, goes through, as
// does a test's.)
const KADE_KEEP=.55;
function kadeFloor(D){const sv=S.story;if(!D||!sv||sv.step!=='fight'||D.team!==1||D.npc)return 0;const done=k=>!!(sv.pieces&&sv.pieces[k]);
  return sv.key==='office'&&!done('kick')?Math.ceil(D.maxHp*KADE_KEEP):sv.key==='gondola'&&!done('snap')?1:0;}
{const ra=resolveAttack;resolveAttack=function(A,D,kind,op,T){const r=ra.apply(this,arguments),fl=kadeFloor(D);
  if(r&&fl&&(r.out==='hit'||r.out==='crit')){if(D.hp-r.dmg<fl){if(r.dmg>=D.hp)r.kd=true;r.dmg=Math.max(0,D.hp-fl);}if(r.tech&&r.tech.fin)r.tech={...r.tech,fin:null};}
  return r;};}
{const k=kill;kill=function(D,dir){if(kadeFloor(D)&&!D.dead&&S.game&&S.game.ex){D.hp=Math.max(1,D.hp);if(!D.downed)knockDown(D);return;}return k.apply(this,arguments);};}
// (the turns of the fight on the cradle: a couple at least go by before the rope parts)
V11.turnStart.push(()=>{const sv=S.story;if(!sv||sv.step!=='fight')return;if(sv.key==='gondola')sv.gTurns=(sv.gTurns||0)+1;else if(sv.key==='office')sv.oTurns=(sv.oTurns||0)+1;});
setPiece({stage:'gondola',key:'snap',
  due(sv){const K=hero(),Kd=kadeOf(),n=sv.gTurns||0,loose=f=>!f.dead&&!f.clinch&&!f.carry&&!heldBy(f);return!!Kd&&loose(K)&&loose(Kd)&&n>=3&&(Kd.hp<=Kd.maxHp*.35||n>=8);},
  *run(sv){const K=hero(),Kd=kadeOf(),s=S.gondola;letter(1);sv.snapKade=Kd;
    for(const f of [K,Kd]){f.guarding=false;f.counter=false;f.intent=null;}
    camTo(780,820,1.4);Object.assign(S.camCut,{band:{top:GB-260,foot:GB+600},bandN:{top:GB-300,foot:GB+700},xn:800,wn:400});
    // the crack overhead, and the left end going
    S.hooks.sound('cable_snap',1.4);S.hooks.sound('creak',1.2,{delay:.1});s.snap=S.t;S.shake=Math.max(S.shake,10);
    // (what was spilt on the deck goes off it as it swings down)
    S.stains.length=0;if(S.blood)S.blood.length=0;
    // both of them taken off their feet: down the deck as it goes (the deck's own frame: where along it, how far up off it)
    const along0=K.station,kd0=Kd.station,t0=S.t,kz0=K.dep,dz0=Kd.dep;
    // (each taken to a depth on the cradle as it goes, the same whatever lane the fight left them in: his hand meets its rail)
    const toDep=(f,z0,z)=>{const w=Math.min(1,(S.t-t0)/.3);f.lane=f.dep=f.stepDep=lerp(z0,z,sstep(w));};
    for(const f of [K,Kd]){f.action=null;f.carry=null;f.hanging=true;f.offstage=true;f.downed=true;f.knockUntil=Infinity;f.motor=0;f.wasDown=true;}
    // Ilyas: a stumble with the deck, then a hand on the back rail high up by the hanger; Kade: down the deck to the bottom stirrup
    const railAt=(x)=>gondXf(x,GB-44);
    const KG=GOND.x1-70,KdBot=GOND.x0+30;
    K.pin=()=>{const u=S.t-t0,tl=s.tilt||0;toDep(K,kz0,GOND_HANG.k);
      if(u<.32){const x=lerp(along0,KG,sstep(u/.32));return{...standOn(K,x,.6,.5),xf:(a,b)=>gondXf(a,b)};}
      const H=railAt(KG),sw=Math.sin((S.t-t0)*3.1)*10*Math.exp(-(u-.32)*1.2);void tl;
      return hangPose(K,H,{grip:'off',sw,free:{x:H.x+K.facing*22,y:H.y+44},wAng:K.facing>0?.4:Math.PI-.4,up:.3});};
    Kd.pin=()=>{const u=S.t-t0;toDep(Kd,dz0,GOND_HANG.kd);
      if(u<.5){const x=lerp(kd0,KdBot,Math.pow(u/.5,1.6));return{...standOn(Kd,x,.55,-.3),xf:(a,b)=>gondXf(a,b)};}
      // (hanging by both hands from the bottom stirrup's bar; climbing comes after)
      const H=gondXf(sv.kdAt??KdBot,GB-44);return hangPose(Kd,H,{grip:'both',sw:Math.sin((S.t-t0)*2.6)*8,up:.5});};
    yield* wait(1.6);
    // Kade climbs at him, hand over hand up the rail
    sv.kdAt=KdBot;const climb=until(()=>{sv.kdAt=Math.min(KG-150,sv.kdAt+DT*120);return sv.kdAt>=KG-150;},3);
    S.hooks.sound('step_iron',.8);yield* climb;
    // the cut at his legs: Kade one-handed now, the sword up at him
    Kd.pin=()=>{const H=gondXf(sv.kdAt,GB-44),u=S.t-sv.cutT;return hangPose(Kd,H,{grip:'off',free:{x:H.x+Kd.facing*30,y:H.y-30-Math.min(1,u*4)*20},wAng:-Math.PI/2+Kd.facing*.3,up:.6});};
    sv.cutT=S.t;S.hooks.sound('swing',1.2,{s:'swing_heavy'});
    // his legs up out of it, and the heel in Kade's face
    K.pin=()=>{const H=railAt(KG),u=S.t-sv.cutT,up=Math.min(1,u*5);return{...hangPose(K,H,{grip:'off',free:{x:H.x+K.facing*22,y:H.y+44},wAng:K.facing>0?.4:Math.PI-.4,crouch:lerp(.88,.4,up),up:.3}),stF:lerp(.06,.5,up),stB:lerp(.12,-.1,up)};};
    yield* wait(.35);S.hooks.sound('crit',22,{s:'crit_blunt'});S.shake=Math.max(S.shake,6);S.freeze=Math.max(S.freeze,.08);
    // Kade's hands go: away down the face into the night
    const p=Kd.p[PEL];Kd.pin=null;Kd.hanging=true;const ns=S.stains.length,ni=S.items.length;sceneKill(Kd,-1);S.stains.length=ns;S.items.length=ni;
    Kd.carry={t0:S.t,dur:1.6,from:{x:p.x,y:p.y},apex:{x:p.x-60,y:p.y-30},to:{x:p.x-120,y:p.y+1400},spin:-Math.PI*2.6};S.slowT=Math.max(S.slowT,1);
    S.hooks.sound('fall_away',1);S.hooks.sound('over_edge',1);
    yield* wait(1.4);Kd.hidden=true;
    // hanging still, then the climb is the stage's closing scene
    K.pin=()=>hangPose(K,railAt(KG),{grip:'off',free:{x:railAt(KG).x+K.facing*22,y:railAt(KG).y+44},wAng:K.facing>0?.4:Math.PI-.4,up:.3});
    yield* wait(.5);},
  skip(sv){const Kd=sv.snapKade;const s=S.gondola;if(s){s.snap=S.t-5;s.tilt=-1.48;}
    if(Kd&&!Kd.dead){const ns=S.stains.length,ni=S.items.length;sceneKill(Kd,-1);S.stains.length=ns;S.items.length=ni;}if(Kd){Kd.pin=null;Kd.carry=null;Kd.hidden=true;}
    const K=hero(),H=gondXf(GOND.x1-70,GB-44);K.hanging=true;K.offstage=true;K.downed=true;K.knockUntil=Infinity;K.motor=0;K.lane=K.dep=K.stepDep=GOND_HANG.k;
    K.pin=()=>hangPose(K,H,{grip:'off',free:{x:H.x+K.facing*22,y:H.y+44},wAng:K.facing>0?.4:Math.PI-.4,up:.3});}});
// a body standing on the deck at x (the deck's own frame): knees bent and arms out as it goes from under him
function standOn(f,x,crouch,lean){const L=f.leg;return{x,y:GB,crouch:crouch??.8,lean:lean??.2,up:.2,hf:{x:x+f.facing*28,y:GB-L*1.6},hb:{x:x-f.facing*24,y:GB-L*1.5},stF:.3,stB:.32};}
// his climb out: up the hanging deck to the hanger, onto the rope, and up it hand over hand while the face goes down past him two floors
// to the pane he went out through, and in at it
function* climbOut(){const K=hero(),s=S.gondola,KG=GOND.x1-70;letter(1);
  camTo(GOND.x1-10,720,1.2);Object.assign(S.camCut,{band:{top:GB-440,foot:GB+200},bandN:{top:GB-500,foot:GB+260},xn:GOND.x1+10,wn:330});
  // (Kade gone before the rope ever parted: he is on his feet on the level deck; to its right end, and up onto the stirrup's rail)
  if(!K.pin){K.guarding=false;K.counter=false;yield* goTo(K,KG,GOND.d1-20,120,{direct:true});K.facing=1;K.action=null;
    K.hanging=true;K.offstage=true;K.downed=true;K.knockUntil=Infinity;K.motor=0;const H0=gondXf(KG,GB-44);
    K.pin=()=>hangPose(K,H0,{grip:'off',free:{x:H0.x+K.facing*22,y:H0.y+44},wAng:.4,up:.3});yield* wait(.2);}
  // up the rail to the drum: his hand going from the rail to the rope over it
  const h0=gondXf(KG,GB-44),h1={x:GOND.hx,y:GOND.hy-40},t0=S.t;
  const z0=K.dep;K.pin=()=>{const u=clamp((S.t-t0)/1.2,0,1),H={x:lerp(h0.x,h1.x,sstep(u)),y:lerp(h0.y,h1.y,sstep(u))};K.lane=K.dep=K.stepDep=lerp(z0,GOND.rd,sstep(u));
    return hangPose(K,H,{grip:'off',free:{x:H.x+K.facing*16,y:H.y-30+Math.sin(u*Math.PI*3)*14},wAng:-Math.PI/2,up:.4,sw:Math.sin(u*6)*4});};
  yield* wait(1.2);
  // hand over hand up the rope (the blade rolled up and away: both hands on it), the face going down past him
  stowBlade(K);S.hooks.sound('rope_creak',1);const rx=h1.x,ry=h1.y,t1=S.t,D=2*GOND.floor,V=230;
  K.pin=()=>{const u=S.t-t1,ph=u*5.4,a=Math.sin(ph)*16;return hangPose(K,{x:rx,y:ry+a*.4},{grip:'both',up:.5,stF:.2+.18*Math.sin(ph),stB:.1-.18*Math.sin(ph),crouch:.7});};
  yield* until(()=>{s.wy=Math.min(D,s.wy+V*DT);return s.wy>=D;},D/V+1);
  // at the sill: a swing in through the gap, and the night behind him
  S.hooks.sound('wind_in',.8);yield* wait(.25);
  const tf=S.t;while(S.t<tf+.6){S.fade=(S.t-tf)/.6;yield;}S.fade=1;K.pin=null;K.hanging=false;K.hidden=true;}
// ===== THE GONDOLA END =====
