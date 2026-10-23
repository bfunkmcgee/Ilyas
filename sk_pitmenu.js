// ===== ACT I MENU =====
// The menu in the Pit. From the crate on (scene 3) the menu (the top bar's menu button, or Escape) is his: at first only what he
// wears, then each thing as the act hands it to him: the satchel, with the purse and Tamm's list (scene 5), the map (scene 5), the
// codex once he has fought (scene 6), his styles once Tamm has started teaching him (scene 9). Before the crate the menu holds the
// way back to the title and nothing else. A section opens the moment its scene hands it over (got), and a chapter picked later has
// it from the start. PIT_MENU: {id, name, stage (the scene that hands it over), got() (true once that scene has)}.
const PIT_MENU=[
  {id:'gear',name:'Gear',stage:'lostprop',got:()=>!!(S.story&&S.story.flags&&S.story.flags.kit)},
  {id:'satchel',name:'Satchel',stage:'list',got:()=>!!(S.act1&&S.act1.satchel)},
  {id:'map',name:'Map',stage:'list',got:()=>!!(S.act1&&S.act1.map)},
  {id:'codex',name:'Codex',stage:'toll',got:()=>!!S.story&&S.story.step==='fight'},
  {id:'styles',name:'Styles',stage:'sh1',got:()=>!!(S.act1&&S.act1.styles)}];
// where a stage comes in the story: its place along the chain of each stage's next, from the first
function storyRank(key){
  if(!storyRank.R){const R={};let st=STAGES[0],n=0;while(st&&R[st.key]==null){R[st.key]=n++;st=typeof st.next==='string'?STAGES[stageIx(st.next)]:null;}storyRank.R=R;}
  return storyRank.R[key]??-1;}
// the sections open now, in the menu's order (none outside Act I)
function pitMenuOpen(){const st=act1Stage();if(!st)return[];const r=storyRank(st.key);
  return PIT_MENU.filter(m=>{const k=storyRank(m.stage);return k>=0&&r>=0&&(r>k||(r===k&&m.got()));});}
// the scene a stage belongs to (a stage with no number of its own is part of the last one that had one): {num, title}
function pitScene(st){if(!st)return null;let s=st,guard=0;
  while(s&&!s.num&&guard++<40){const prev=STAGES.find(x=>x.next===s.key);if(!prev||!prev.act)break;s=prev;}
  return s&&s.num?{num:s.num,title:s.title}:{num:'',title:st.title||''};}
// ===== ACT I MENU END =====
