const fs = require('fs');
const vm = require('vm');
const assert = require('assert/strict');
const handlers = {};
const storage = new Map();
let container, css, currentFrame, replacedUrl;
const listeners = (event, fn) => (handlers[event] ||= []).push(fn);
function freshContainer() {
  return {id:'giscus-container',dataset:{repo:'Steve-codec/Steve-codec.github.io',repoId:'repo',category:'Announcements',categoryId:'cat'},appendChild(node){currentFrame=node;},replaceChildren(){}};
}
container = freshContainer();
const location = {href:'https://example.test/post-one/?giscus=example-session',pathname:'/post-one/'};
const document = {
  readyState:'complete', documentElement:{classList:{contains:()=>true}},
  getElementById(id){return id==='giscus-container' ? container : css;},
  querySelector(){return {content:'A note'};}, addEventListener:listeners,
  head:{appendChild(node){css=node;}},
  createElement(tag){return {tag,style:{},contentWindow:{},setAttribute(){},replaceWith(node){this.replacement=node;}};}
};
const window = {addEventListener:listeners};
vm.runInNewContext(fs.readFileSync('themes/firefly/source/js/features/comments.js','utf8'),{
  document,window,location,URL,URLSearchParams,
  history:{state:{uid:1},replaceState(_state,_title,url){replacedUrl=url;}},
  localStorage:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)}
});
assert.equal(new URL(currentFrame.src).searchParams.get('term'),'post-one/');
assert.equal(new URL(currentFrame.src).searchParams.get('session'),'example-session');
assert.equal(new URL(replacedUrl).searchParams.has('giscus'),false);
assert.equal(handlers.message.length,1);
const firstFrame=currentFrame;
window.BlogComments.init();
assert.equal(currentFrame,firstFrame);
handlers.message[0]({origin:'https://untrusted.test',source:currentFrame.contentWindow,data:{giscus:{signOut:true}}});
assert.ok(storage.has('giscus-session'));
handlers['page:dispose'][0]();
container=freshContainer(); location.href='https://example.test/post-two/'; location.pathname='/post-two/';
window.BlogComments.init();
assert.notEqual(currentFrame,firstFrame);
assert.equal(new URL(currentFrame.src).searchParams.get('term'),'post-two/');
assert.equal(new URL(currentFrame.src).searchParams.get('backLink'),location.href);
assert.equal(handlers.message.length,1);
handlers.message[0]({origin:'https://giscus.app',source:firstFrame.contentWindow,data:{giscus:{resizeHeight:999}}});
assert.equal(currentFrame.style.height,undefined);
handlers.message[0]({origin:'https://giscus.app',source:currentFrame.contentWindow,data:{giscus:{resizeHeight:450}}});
assert.equal(currentFrame.style.height,'450px');
handlers.message[0]({origin:'https://giscus.app',source:currentFrame.contentWindow,data:{giscus:{signOut:true}}});
assert.equal(new URL(currentFrame.src).searchParams.get('session'),'');
assert.equal(storage.has('giscus-session'),false);
handlers.message[0]({origin:'https://giscus.app',source:currentFrame.contentWindow,data:{giscus:{error:'giscus is not installed on this repository'}}});
assert.match(currentFrame.replacement.textContent,/评论服务准备中/);
console.log('PASS: comments map to the current route, handle session callbacks, ignore stale/untrusted frames, and keep one listener.');
