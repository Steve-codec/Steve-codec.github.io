(function() {
  var scripts = {};
  function loadScript(path, globalName) {
    if (window[globalName]) return Promise.resolve();
    if (scripts[path]) return scripts[path];
    var version = document.documentElement.dataset.assetVersion || '';
    var root = document.documentElement.dataset.blogRoot || '/';
    scripts[path] = new Promise(function(resolve, reject) {
      var script = document.createElement('script');
      script.src = root + path + '?v=' + encodeURIComponent(version);
      script.onload = resolve;
      script.onerror = function() { delete scripts[path]; script.remove(); reject(new Error('Could not load ' + path)); };
      document.body.appendChild(script);
    });
    return scripts[path];
  }

  function switchGrid(oldGrid, newGrid) {
    document.dispatchEvent(new CustomEvent('page:dispose'));
    window.TOC?.observer?.disconnect();
    var parking = document.getElementById('persistent-music');
    oldGrid.querySelectorAll('.music-widget').forEach(function(widget) {
      widget.dataset.musicSlot = widget.closest('.mobile-bottom-sidebar') ? 'mobile' : 'desktop';
      parking.appendChild(widget);
    });
    newGrid.querySelectorAll('.music-widget').forEach(function(placeholder) {
      var slot = placeholder.closest('.mobile-bottom-sidebar') ? 'mobile' : 'desktop';
      var existing = parking.querySelector('[data-music-slot="' + slot + '"]');
      if (existing) placeholder.replaceWith(existing);
    });
    // Preserve live visitor counters instead of replacing them with placeholders.
    var footer = oldGrid.querySelector('.site-footer');
    var nextFooter = newGrid.querySelector('.site-footer');
    if (footer && nextFooter) nextFooter.replaceWith(footer);
    var sourceHead = newGrid.ownerDocument.head;
    var meta = 'meta[name="description"],meta[property^="og:"],meta[name^="twitter:"],link[rel="canonical"]';
    document.head.querySelectorAll(meta).forEach(function(node) { node.remove(); });
    sourceHead.querySelectorAll(meta).forEach(function(node) { document.head.appendChild(node.cloneNode(true)); });
    oldGrid.replaceWith(newGrid);
    this.onSwitch();
  }

  async function refreshPage() {
    var main = document.getElementById('main-content');
    if (main) main.removeAttribute('aria-busy');
    document.body.classList.toggle('is-home', !!document.querySelector('#banner-overlay-container .home-text-overlay'));
    window.ScrollManager?.closeMobileMenu();
    window.initTypewriter?.();
    window.TOC?.init();
    window.PostLayoutManager?.init();
    window.MusicPlayer?.initLocalPlaylist();
    window.MusicControls?.init();
    window.BlogComments?.init();
    window.refreshBlogStats?.();
    window.FancyboxManager?.init();
    window.processCodeBlocks?.();
    window.mermaid?.run?.();
    var layout = window.Settings?.getPostListLayout() || 'list';
    document.querySelectorAll('.post-list-container').forEach(function(node) { node.dataset.layout = layout; });
    document.querySelectorAll('.post-list').forEach(function(node) { node.dataset.mode = layout; });
    window.pjax?.refresh(document);
    if (location.hash) {
      var target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      target?.scrollIntoView();
    } else {
      window.scrollTo({top:0,behavior:'instant'});
    }
    try {
      if (document.querySelector('.category-folder-visual')) {
        await loadScript('js/ui/category-folders.js', 'CategoryFolders');
        window.CategoryFolders?.init();
      }
      if (document.querySelector('#toc-body') && document.querySelector('.markdown-body')) {
        await loadScript('js/ui/rare-components.js', 'RareReading');
        window.RareReading?.init();
      }
      if (document.getElementById('encrypted-content')) {
        await loadScript('js/features/encrypted-post.js', 'EncryptedPost');
        window.EncryptedPost?.init();
      }
    } catch(error) { console.warn('[Navigation]', error.message); }
  }

  function init() {
    if (typeof Pjax === 'undefined') return;
    window.pjax = new Pjax({
      selectors:['title','#banner-overlay-container','#navbar-menu','#main-grid'],
      elements:'a[href]:not([target="_blank"]):not([href^="#"]):not([href^="javascript:"]):not([download]):not([data-fancybox]):not([data-no-pjax]):not([href$=".xml"]):not([href$=".mp3"]):not([href$=".pdf"])',
      switches:{
        '#banner-overlay-container':Pjax.switches.outerHTML,
        '#navbar-menu':Pjax.switches.outerHTML,
        '#main-grid':switchGrid
      },
      cacheBust:false,
      currentUrlFullReload:false,
      scrollTo:false,
      timeout:10000,
      analytics:false
    });
    document.addEventListener('pjax:send', function() {
      document.getElementById('main-content')?.setAttribute('aria-busy', 'true');
    });
    document.addEventListener('pjax:complete', refreshPage);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
