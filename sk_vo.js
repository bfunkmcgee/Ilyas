// ===== VOICES (since V98) =====
// The lines the cast says aloud. Each is a recording made with Suno's speech (the author's own account): one take a character for a
// scene's worth of lines, so a voice stays the same from line to line, cut by tools/vo/cut.py into one file a line in vo/ (the
// long pauses inside a line taken in, the levels matched), and published beside the page as the sounds are (GUIDE.md, "Voices").
// A line is known by who says it and its words exactly as the scene's speak() has them; a line whose words change no longer has its
// recording (the checks say so). speak() keeps a voiced line up at least as long as it takes to say it (its len, in seconds, from
// the cut file), so the scene's timing is the same with the sound on or off, loaded or not. The page plays it (sk_voui.js); nothing
// here plays anything.
// VO_LINES: id (the file, vo/<id>.mp3), stage (whose scene loads it), who, text, len. The lens are the tool's (--install writes them).
const VO_LINES=[
  {id:'sundown_1',stage:'sundown',who:HERO_NAME,text:'The sun takes its time out here.'},
  {id:'sundown_2',stage:'sundown',who:HERO_NAME,text:'On the wire it dropped like a stone, and the cold came up out of the ground.'},
  {id:'sundown_3',stage:'sundown',who:HERO_NAME,text:'Going to be a long night.'},
  {id:'field_1',stage:'field',who:HERO_NAME,text:'Every floor lit. Hallowell knows I’m coming. Good.'},
  {id:'field_2',stage:'field',who:'Driver',text:'Turn the bike around, elf. Hallowell’s paying, and there’s six of us.'},
  {id:'field_3',stage:'field',who:HERO_NAME,text:'I counted.'},
  {id:'chase_1',stage:'chase',who:'Pack leader',text:'Hallowell pays by the ear, elf. We’d have done you for nothing.'},
  {id:'chase_2',stage:'chase',who:HERO_NAME,text:'Then you’ve been overpaid.'},
  {id:'roadblock_1',stage:'roadblock',who:'Sergeant',text:'On your feet! It’s one elf! Put him down!'},
  {id:'roadblock_2',stage:'roadblock',who:HERO_NAME,text:'Qadir always did like a big entrance.'},
  {id:'vargo_1',stage:'vargo',who:'Qadir',text:'Ilyas. I set your table. I hoped you’d come to eat.'},
  {id:'vargo_2',stage:'vargo',who:HERO_NAME,text:'We drank from the same cup, Qadir.'},
  {id:'vargo_3',stage:'vargo',who:'Qadir',text:'Thirty years, and the family never once filled mine. Hallowell did.'},
  {id:'vargo_4',stage:'vargo',who:HERO_NAME,text:'I met his money on the way here. It’s lying in the road.'},
  {id:'vargo_5',stage:'vargo',who:'Qadir',text:'Then there’s only me left. Last orders, old friend.'},
  {id:'vargo_6',stage:'vargo',who:HERO_NAME,text:'I’ll settle the bill.'},
  {id:'dining_1',stage:'dining',who:'Brask',text:'Qadir always said you’d come in through the front.'},
  {id:'dining_2',stage:'dining',who:'Iyla',text:'He never said you’d bring the front with you.'},
  {id:'dining_3',stage:'dining',who:HERO_NAME,text:'He’s on the step outside. Go and sit with him.'}];
const VO_LEN=/*VO_LEN*/{"chase_1":4.78,"chase_2":1.36,"dining_1":3.47,"dining_2":2.14,"dining_3":3.21,"field_1":3.24,"field_2":5.2,"field_3":1.12,"roadblock_1":4.13,"roadblock_2":2.95,"sundown_1":2.4,"sundown_2":4.94,"sundown_3":1.65,"vargo_1":4.73,"vargo_2":2.72,"vargo_3":5.51,"vargo_4":3.6,"vargo_5":4.44,"vargo_6":1.38}/*VO_LEN_END*/;
for(const L of VO_LINES)L.len=VO_LEN[L.id]||0;
// the recording of a line, if it has one (and the file is cut): by who says it and its words
function voOf(who,text){for(const L of VO_LINES)if(L.len>0&&L.who===who&&L.text===text)return L;return null;}
// ===== VOICES END =====
