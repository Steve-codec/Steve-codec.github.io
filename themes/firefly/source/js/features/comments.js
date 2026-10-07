(function() {
  var origin = 'https://giscus.app';
  var frame;
  function session() {
    try { return JSON.parse(localStorage.getItem('giscus-session') || '""'); }
    catch (_) { localStorage.removeItem('giscus-session'); return ''; }
  }
  function currentTheme() {
    return document.documentElement.classList.contains('dark') ? 'transparent_dark' : 'light';
  }
  function init() {
    var container = document.getElementById('giscus-container');
    if (!container || container.dataset.bound) return;
    container.dataset.bound = 'true';
    // Own one message listener across route changes; loading client.js per page
    // would retain a listener for every removed iframe.
    var page = new URL(location.href);
    var callback = page.searchParams.get('giscus');
    if (callback) {
      localStorage.setItem('giscus-session', JSON.stringify(callback));
      page.searchParams.delete('giscus');
      history.replaceState(history.state, '', page.toString());
    }
    page.hash = '';
    var data = container.dataset;
    var params = new URLSearchParams({
      origin:page.toString() + '#' + container.id, session:session(),
      theme:currentTheme(), repo:data.repo, repoId:data.repoId,
      category:data.category, categoryId:data.categoryId,
      term:location.pathname.length < 2 ? 'index' : location.pathname.slice(1).replace(/\.\w+$/, ''),
      strict:data.strict || '1', reactionsEnabled:data.reactionsEnabled || '1',
      emitMetadata:data.emitMetadata || '1', inputPosition:data.inputPosition || 'top',
      description:document.querySelector('meta[name="description"]')?.content || '',
      backLink:page.toString()
    });
    frame = document.createElement('iframe');
    frame.className = 'giscus-frame';
    frame.title = '评论';
    frame.setAttribute('scrolling', 'no');
    frame.setAttribute('allow', 'clipboard-write');
    frame.loading = data.loading || 'lazy';
    frame.src = origin + '/' + (data.lang || 'zh-CN') + '/widget?' + params;
    container.appendChild(frame);
    if (!document.getElementById('giscus-css')) {
      var css = document.createElement('link');
      css.id = 'giscus-css'; css.rel = 'stylesheet'; css.href = origin + '/default.css';
      document.head.appendChild(css);
    }
  }
  window.BlogComments = {init:init};
  document.addEventListener('page:dispose', function() { frame = null; });
  window.addEventListener('message', function(event) {
    if (!frame || event.origin !== origin || event.source !== frame.contentWindow || !event.data?.giscus) return;
    var data = event.data.giscus;
    if (Number.isFinite(data.resizeHeight)) frame.style.height = Math.max(100, data.resizeHeight) + 'px';
    if (data.signOut || /Bad credentials|Invalid state value|State has expired/.test(data.error || '')) {
      localStorage.removeItem('giscus-session');
      var url = new URL(frame.src); url.searchParams.set('session', ''); frame.src = url;
    }
    if ((data.error || '').includes('not installed')) {
      var notice = document.createElement('p');
      notice.className = 'comments-login-note';
      notice.textContent = '评论服务准备中，完成 Giscus 安装后即可留言。';
      frame.replaceWith(notice); frame = null;
    }
  });
  document.addEventListener('themechange', function() {
    if (frame) frame.contentWindow.postMessage({giscus:{setConfig:{theme:currentTheme()}}}, origin);
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
