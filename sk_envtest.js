// Forced tests for divider walls, furniture, tableware and lamps
const core=require('./sk_src.js')(process.argv[2]);
eval(core+'\n'+require('fs').readFileSync(__dirname+'/sk_envtest_body.js','utf8'));
