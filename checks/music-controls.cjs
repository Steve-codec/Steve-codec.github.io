const fs = require('fs');
const vm = require('vm');
const assert = require('assert/strict');
const script = fs.readFileSync('themes/firefly/source/js/features/music-controls.js','utf8');
let observer;
const icon = { textContent: 'repeat' };
const playPath = {setAttribute(k,v){this[k]=v;}};
const handlers = {};
const attrs = {};
const buttons = Object.fromEntries(['play','prev','next','list','mode'].map(name=>['.music-btn-'+name,{dataset:{},title:'列表循环',querySelector:selector=>selector==='path'?playPath:icon,setAttribute(k,v){this[k]=v;}}]));
const controls = {dataset:{},querySelector:selector=>buttons[selector]};
const player = {audio:{paused:true}, on(name,fn){(handlers[name] ||= []).push(fn);}, toggle(){this.audio.paused=!this.audio.paused;(handlers[this.audio.paused?'pause':'play'] || []).forEach(fn=>fn());},options:{loop:'all',order:'list'},notice:()=>observer()};
const container = {dataset:{},aplayer:player,querySelector:selector=>selector==='.custom-music-controls'?controls:null};
const document = {body:{},querySelectorAll:()=>[container],addEventListener(){}};
vm.runInNewContext(script,{document,window:{},MutationObserver:class{constructor(callback){observer=callback;} observe(){}}});
const states=[];
for(let i=0;i<6;i++){
 buttons['.music-btn-mode'].onclick.call(buttons['.music-btn-mode'],{preventDefault(){},stopPropagation(){}});
 observer(); // APlayer notices and icon updates cause fresh DOM mutations.
 states.push({label:buttons['.music-btn-mode'].title,loop:player.options.loop,order:player.options.order});
}
assert.deepEqual(states.map(s=>s.label),['单曲循环','随机播放','列表循环','单曲循环','随机播放','列表循环']);
assert.deepEqual(states.map(s=>[s.loop,s.order]),[['one','list'],['all','random'],['all','list'],['one','list'],['all','random'],['all','list']]);
console.log('PASS: two mode cycles survive DOM changes and match APlayer playback options.');

const play = buttons['.music-btn-play'];
assert.equal(play['aria-label'],'播放');
play.onclick({preventDefault(){},stopPropagation(){}});
assert.equal(play['aria-label'],'暂停');
assert.equal(play['aria-pressed'],'true');
assert.match(playPath.d,/M6 5h4/);
handlers.waiting.forEach(fn=>fn());
assert.equal(play['aria-busy'],'true');
play.onclick({preventDefault(){},stopPropagation(){}});
assert.equal(play['aria-label'],'播放');
assert.equal(play['aria-busy'],'false');
assert.equal(handlers.play.length,1);
console.log('PASS: real play/pause/waiting events update icon, label and busy state without duplicate bindings.');

