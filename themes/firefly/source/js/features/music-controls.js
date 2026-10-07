(function() {
  function bindAPlayer(ap) {
    if (!ap) return;

    function getAPInstance() {
      if (ap.aplayer) return ap.aplayer;
      if (window.aplayers && window.aplayers.length > 0) {
        for (var i = 0; i < window.aplayers.length; i++) {
          if (window.aplayers[i].container === ap || ap.contains(window.aplayers[i].container)) {
            return window.aplayers[i];
          }
        }
        return window.aplayers[0];
      }
      return null;
    }

    // Wait for APlayer, then bind each control bar only once. DOM updates from
    // icons/notices must not reset the selected playback mode.
    var player = getAPInstance();
    if (!player) return;

    // Ensure cover image is circular
    var pic = ap.querySelector('.aplayer-pic');
    if (pic) pic.style.borderRadius = '50%';

    // Inject or query custom control bar
    var controls = ap.querySelector('.custom-music-controls');
    if (!controls) {
      controls = document.createElement('div');
      controls.className = 'custom-music-controls';
      controls.innerHTML = `
        <button class="music-ctrl-btn music-btn-mode" title="列表循环" type="button">
          <span class="material-symbols-outlined">repeat</span>
        </button>
        <button class="music-ctrl-btn music-btn-prev" title="上一首" type="button">
          <span class="material-symbols-outlined">skip_previous</span>
        </button>
        <button class="music-ctrl-btn music-btn-play" title="播放/暂停" type="button">
          <svg class="play-triangle-svg" viewBox="0 0 24 24" width="26" height="26" style="display:block;margin:0 auto;">
            <path fill="#10b981" d="M8 5v14l11-7z"/>
          </svg>
        </button>
        <button class="music-ctrl-btn music-btn-next" title="下一首" type="button">
          <span class="material-symbols-outlined">skip_next</span>
        </button>
        <button class="music-ctrl-btn music-btn-list" title="播放列表" type="button">
          <span class="material-symbols-outlined">queue_music</span>
        </button>
      `;
      var body = ap.querySelector('.aplayer-body');
      if (body) body.appendChild(controls);
    }

    if (controls.dataset.musicBound === 'true') return;
    controls.dataset.musicBound = 'true';

    var playBtn = controls.querySelector('.music-btn-play');
    var waiting = false;
    function syncPlayback() {
      var paused = player.audio.paused;
      var label = paused ? '播放' : waiting ? '正在缓冲，点击暂停' : '暂停';
      playBtn.title = label;
      playBtn.setAttribute('aria-label', label);
      playBtn.setAttribute('aria-pressed', String(!paused));
      playBtn.setAttribute('aria-busy', String(waiting && !paused));
      playBtn.dataset.state = paused ? 'paused' : waiting ? 'loading' : 'playing';
      var path = playBtn.querySelector('path');
      if (path) path.setAttribute('d', paused ? 'M8 5v14l11-7z' : 'M6 5h4v14H6z M14 5h4v14h-4z');
      ap.dataset.playback = playBtn.dataset.state;
    }
    player.on('play', syncPlayback);
    player.on('pause', function() { waiting = false; syncPlayback(); });
    player.on('waiting', function() { waiting = true; syncPlayback(); });
    player.on('playing', function() { waiting = false; syncPlayback(); });
    player.on('canplay', function() { waiting = false; syncPlayback(); });
    player.on('ended', function() { waiting = false; syncPlayback(); });
    player.on('error', function() {
      waiting = false;
      syncPlayback();
      playBtn.title = '音频加载失败，点击重试';
      playBtn.setAttribute('aria-label', playBtn.title);
    });
    syncPlayback();

    playBtn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      var apInst = getAPInstance();
      if (apInst) {
        apInst.toggle();
      } else {
        var audio = ap.querySelector('audio');
        if (audio) {
          if (audio.paused) audio.play(); else audio.pause();
        } else {
          var origBtn = ap.querySelector('.aplayer-button');
          if (origBtn) origBtn.click();
        }
      }
    };

    controls.querySelector('.music-btn-prev').onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      var apInst = getAPInstance();
      if (!apInst || !apInst.list) return;
      var mode = window.__FIREFLY_MUSIC_MODE || 'list';
      if (mode === 'random') {
        var total = apInst.list.audios.length;
        var nextIdx = Math.floor(Math.random() * total);
        apInst.list.switch(nextIdx);
      } else {
        apInst.skipBack();
      }
      apInst.play();
    };

    controls.querySelector('.music-btn-next').onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      var apInst = getAPInstance();
      if (!apInst || !apInst.list) return;
      var mode = window.__FIREFLY_MUSIC_MODE || 'list';
      if (mode === 'random') {
        var total = apInst.list.audios.length;
        var nextIdx = Math.floor(Math.random() * total);
        apInst.list.switch(nextIdx);
      } else {
        apInst.skipForward();
      }
      apInst.play();
    };

    controls.querySelector('.music-btn-list').onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      var list = ap.querySelector('.aplayer-list');
      var apInst = getAPInstance();
      if (list && apInst && apInst.list) {
        var open = list.classList.contains('aplayer-list-hide');
        if (open) apInst.list.show(); else apInst.list.hide();
        this.setAttribute('aria-expanded', String(open));
      }
    };

    var modeBtn = controls.querySelector('.music-btn-mode');
    var modes = [
      { key: 'list', title: '列表循环', icon: 'repeat' },
      { key: 'single', title: '单曲循环', icon: 'repeat_one' },
      { key: 'random', title: '随机播放', icon: 'shuffle' }
    ];
    var currentModeIndex = player.options.loop === 'one' ? 1 : player.options.order === 'random' ? 2 : 0;

    function updateModeButton(mode) {
      var modeIcon = modeBtn.querySelector('.material-symbols-outlined');
      if (modeIcon) modeIcon.textContent = mode.icon;
      modeBtn.title = mode.title;
      modeBtn.setAttribute('aria-label', mode.title);
      modeBtn.dataset.mode = mode.key;
      window.__FIREFLY_MUSIC_MODE = mode.key;
    }
    updateModeButton(modes[currentModeIndex]);

    modeBtn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      currentModeIndex = (currentModeIndex + 1) % modes.length;
      var activeMode = modes[currentModeIndex];
      updateModeButton(activeMode);

      var apInst = getAPInstance();
      if (apInst) {
        // APlayer's own ended handler reads these options, so UI and playback
        // use the same mode rather than competing audio event handlers.
        apInst.options.loop = activeMode.key === 'single' ? 'one' : 'all';
        apInst.options.order = activeMode.key === 'random' ? 'random' : 'list';
        if (apInst.notice) apInst.notice('播放模式: ' + activeMode.title);
      }
    };
  }

  function initAll() {
    document.querySelectorAll('.music-widget .aplayer').forEach(bindAPlayer);
  }

  window.MusicControls = { init: initAll };

  var observer = new MutationObserver(function() {
    initAll();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  document.addEventListener('DOMContentLoaded', initAll);
  document.addEventListener('pjax:complete', initAll);
  initAll();
})();
