// ===== KILL CHAIN START =====
// Kael only. Flow is the backbone of his fighting. Every takedown he lands (a kill or a knockdown) and every enemy he breaks puts him
// in flow and adds to the run. After a takedown, if another upright enemy stands in reach, he goes again straight away: a link, with
// no read roll and no rank needed. A link taken after k takedowns and breaks hits at +min(k,3) and costs 15% less tempo for each
// (45% at most), and a link spends no balance at all. The free move on a man he broke counts as a link too. Flow carries from
// exchange to exchange and turn to turn: it ends the moment a blow lands on him (any damage taken), when he goes down, is held or is
// broken, and when the fight is over. A link that does not put its target down, or one he lets pass, keeps the run. Amri and the
// enemies keep the old Flow rules (Expert, 60 units, read roll).
const CHAIN={reach:110,depth:70,maxDepth:7,hit:3,tempo:.15,tempoMax:.45,hurt:.4};
// n: takedowns and breaks in the run so far; last: the final count of the run that just ended (the badge holds it); seq counts changes
S.chain={n:0,live:false,last:0,seq:0,hp:0};Object.defineProperty(S.chain,'game',{value:null,writable:true});
// a run belongs to one fight: a new game starts clean
function chainSt(){const c=S.chain;if(c.game!==S.game){c.game=S.game;c.n=0;c.live=false;c.last=0;c.seq++;}return c;}
function chainEnd(){const c=chainSt();if(!c.live)return;c.live=false;c.last=c.n;c.n=0;c.seq++;}
// one more for the run: a takedown or a break by Kael
function chainAdd(){const c=chainSt(),K=hero();if(!c.live){c.live=true;c.n=0;}c.n++;c.seq++;c.hp=K?K.hp:0;
  if(c.n>=2&&K)S.callouts.push({i:K.idx,text:'Flow ×'+c.n,age:0,life:1.5,dx:K.facing*6,dy:-30,big:true});}
// Flow target for Kael: the nearest upright enemy within 110 units past striking distance and 70 units of depth, measured from where
// the bodies are now (the run-in of the blow that just landed has not reached the logical stations yet)
const chainX=f=>f.curBody&&!f.dead?f.curBody.px:f.station,chainZ=f=>f.curBody&&f.curBody.pz!=null&&!f.dead?f.curBody.pz:f.lane;
function chainTarget(A,D){
  if(A.foot<1)return null;let best=null,bd=1e9;const ax=chainX(A),az=chainZ(A);
  for(const o of rivals(A)){if(o===D)continue;const d=Math.abs(chainX(o)-ax)-engageGap(A,o),dz=Math.abs(chainZ(o)-az);
    if(d<=CHAIN.reach&&dz<=CHAIN.depth&&d+dz<bd){bd=d+dz;best=o;}}
  return best;}
// Kael's blade can come out of a body it went through: a kill that holds the blade in the corpse does not break the run unless it sticks
function chainFree(A){return A===hero()&&!!A.finRelease&&!A.finRelease.stuck;}
// the link an opening or an exchange belongs to: its number is the count of the run before it (0 when it is no link)
function chainLinkNo(A){
  const o=S.opening;if(o)return o.f===A&&o.link?o.link:0;
  const ex=S.game.ex;return ex&&ex.A===A&&ex.link?ex.link:0;}
function chainHit(A,opening){return A===hero()?Math.min(chainLinkNo(A),CHAIN.hit):0;}
function chainTempo(f,o){o=o===undefined?S.opening:o;return o&&o.f===f&&o.link?1-Math.min(o.link*CHAIN.tempo,CHAIN.tempoMax):1;}
// a link spends no balance: the blow's own cost is waived (a Recovering cut still buys its pip back)
function chainFoot(A,chain){return(chain==='flow'||chain==='broken')&&A===hero()&&chainSt().live;}
// a primary impact by Kael: a takedown adds to the run (a two-target stroke is one link: the second impact may add to it too)
function chainImpact(ex,A,D,res){
  if(A!==hero()||D.team===A.team)return;
  if(!((res.out==='hit'||res.out==='crit')&&(D.dead||res.kd)))return;
  chainAdd();ex.took=true;ex.tookBy=D;}
// the second target of a two-target stroke: it counts too, and once both blows have landed the next link may open
function chainSecond(ex,A,D,res){
  if(A!==hero()||D.team===A.team)return;
  if((res.out==='hit'||res.out==='crit')&&(D.dead||res.kd))chainImpact(ex,A,D,res);
  if(!ex.took)return;
  const E=flowTarget(A,ex.tookBy);if(E)considerFlow(ex,A,E);
}
// an opening is starting: Kael's own flow link, and his free move on a man he broke, carry the count; nothing else touches the run
function chainOpening(o){
  const c=chainSt();
  if(o.f===hero()&&(o.source==='flow'||o.source==='broken')&&c.live){o.link=c.n;if(o.source==='flow'&&o.ex.tookBy)o.prev=o.ex.tookBy;}
}
// the link is chosen: free the blade from the body it went through
function chainLaunch(o,choice){
  if(!o.link)return;
  if(choice!=='hold'&&o.f.finRelease)releaseBlade(o.f);
}
// auto-battle Kael inside a link: links cost nothing, so he takes them, and lets one pass only for a man too far gone to matter
function chainAI(o,ch){
  const f=o.f,D=o.opp;if(!o.link||f!==hero()||o.source!=='flow')return null;
  const atk=ch.filter(k=>ATTACKS.includes(k));if(!atk.length)return'hold';
  // the blow most likely to put them down (a hit that kills, or an Overhead that floors)
  let best=atk[0],bs=-1e9;
  for(const k of atk){const T=pickTechnique(f,D,k),[n,s,b]=T.dice||f.wp.dice,avg=(n*(s+1)/2+b)*ACTIONS[k].mult*(T.dmg||1)*(f.posture==='off'?.75:1);
    const sc=hitChanceT(f,D,k,true,T)*(avg>=D.hp?1:k==='overhead'?.6:.1);
    if(sc>bs){bs=sc;best=k;}}
  return best;}
// what ends the run: any damage taken, going down, being held or broken, the fight over
V11.step.push(()=>{const c=S.chain;if(!c.live||c.game!==S.game)return;const K=hero();
  if(!K||K.dead||K.downed||K.clinch||K.broken||S.game.phase==='over'||K.hp<c.hp){chainEnd();return;}
  c.hp=K.hp;});
// a break by Kael adds to the run
{const bf=breakFighter;breakFighter=function(D,by){const r=bf.apply(this,arguments);if(by&&by===hero()&&D.team!==by.team)chainAdd();return r;};}
// ===== KILL CHAIN END =====
