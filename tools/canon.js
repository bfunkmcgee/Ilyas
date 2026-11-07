// Digests that leave out what cannot change what a file does (since V99), so test.py can tell a change to a comment or to spacing
// from a change to the game. JavaScript: its tokens (acorn, the parser eslint brings), each with whether a line break comes before it
// (the automatic semicolons follow line breaks; a block comment holding one counts as one), every token as written. CSS: comments out
// (one between two tokens still parts them) and every run of spacing as one space, strings as they are. A page (.html): its scripts
// and its style so, the rest as it is. Anything else: its bytes. A file that will not read as its kind is taken by its bytes.
// usage: node tools/canon.js file ...    prints {"file": "<sha1>" or null when it is not there, ...}
const fs=require('fs'),crypto=require('crypto'),path=require('path');
const acorn=require(path.join(__dirname,'..','node_modules','acorn'));
const sha=s=>crypto.createHash('sha1').update(s).digest('hex');
const LT=/[\n\r\u2028\u2029]/;
function js(code){const out=[];let prev=0;
  for(const t of acorn.tokenizer(code,{ecmaVersion:'latest',sourceType:'script',allowHashBang:true,allowReturnOutsideFunction:true,allowAwaitOutsideFunction:true})){
    out.push((LT.test(code.slice(prev,t.start))?'\n':' ')+code.slice(t.start,t.end));prev=t.end;}
  return out.join('');}
function css(s){let o='',i=0;
  while(i<s.length){const c=s[i];
    if(c==='"'||c==="'"){let j=i+1;while(j<s.length&&s[j]!==c){if(s[j]==='\\')j++;j++;}o+=s.slice(i,j+1);i=j+1;continue;}
    if(c==='/'&&s[i+1]==='*'||/\s/.test(c)){let gap=false;   // a run of comments and spacing: one space if it holds spacing, else a mark
      while(i<s.length){if(s[i]==='/'&&s[i+1]==='*'){const e=s.indexOf('*/',i+2);i=e<0?s.length:e+2;}else if(/\s/.test(s[i])){gap=true;i++;}else break;}
      o+=gap?' ':'\u0001';continue;}
    o+=c;i++;}
  return o.trim();}
function page(s){let o='',i=0;const lo=s.toLowerCase();
  while(i<s.length){const a=lo.indexOf('<script',i),b=lo.indexOf('<style',i);let k=-1,tag='';
    if(a>=0&&(b<0||a<b)){k=a;tag='script';}else if(b>=0){k=b;tag='style';}
    if(k<0){o+=s.slice(i);break;}
    const open=s.indexOf('>',k);if(open<0){o+=s.slice(i);break;}
    const close=lo.indexOf('</'+tag,open+1);if(close<0){o+=s.slice(i);break;}
    o+=s.slice(i,open+1)+'\u0002'+(tag==='script'?js(s.slice(open+1,close)):css(s.slice(open+1,close)))+'\u0002';i=close;}
  return o;}
const out={};
for(const f of process.argv.slice(2)){
  let b;try{b=fs.readFileSync(f);}catch(e){out[f]=null;continue;}
  const ext=path.extname(f).toLowerCase();let d;
  try{d=ext==='.js'||ext==='.mjs'||ext==='.cjs'?sha('js\0'+js(b.toString('utf8'))):ext==='.css'?sha('css\0'+css(b.toString('utf8'))):
    ext==='.html'||ext==='.htm'?sha('page\0'+page(b.toString('utf8'))):sha(b);}
  catch(e){d=sha(b);}
  out[f]=d;}
process.stdout.write(JSON.stringify(out));
