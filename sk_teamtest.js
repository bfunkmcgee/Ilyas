// Forced tests for the teammate and the off-hand dagger
const core=require('./sk_src.js')(process.argv[2]);
eval(core+'\n'+require('fs').readFileSync(__dirname+'/sk_teamtest_body.js','utf8'));
