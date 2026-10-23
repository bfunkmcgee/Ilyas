// the static check's rules: the game is one classic script in the browser (every file shares one scope)
import globals from 'globals';
export default [{
  files:['**/*.js'],
  languageOptions:{ecmaVersion:2022,sourceType:'script',globals:{...globals.browser}},
  linterOptions:{reportUnusedDisableDirectives:'off'},
  rules:{
    'no-undef':'error','no-const-assign':'error','no-dupe-keys':'error','no-dupe-args':'error','no-redeclare':['error',{builtinGlobals:false}],
    'no-unreachable':'error','no-self-assign':'error','no-dupe-else-if':'error','no-duplicate-case':'error','use-isnan':'error','valid-typeof':'error',
    'no-unsafe-finally':'error','no-obj-calls':'error','no-shadow-restricted-names':'error','no-global-assign':'error','no-import-assign':'error',
    'no-setter-return':'error','no-sparse-arrays':'error','no-unexpected-multiline':'error','no-unsafe-negation':'error','getter-return':'error',
    'no-compare-neg-zero':'error','no-cond-assign':['error','except-parens'],'no-constant-binary-expression':'error','no-loss-of-precision':'error'}}];
