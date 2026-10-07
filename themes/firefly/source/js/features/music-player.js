(function() {
  var MusicPlayer = {
    init: function() {
      if (this.initialized) return;
      this.initialized = true;
      if (Array.isArray(window.__LOCAL_PLAYLIST) && window.__LOCAL_PLAYLIST.length) {
        this.initLocalPlaylist();
        return;
      }
      // MetingJS auto-initializes via <meting-js> custom element
      // Handle APlayer instance if present
      this.waitForAPlayer();
    },

    initLocalPlaylist: function() {
      if (typeof window.APlayer !== 'function') return;
      var self = this;
      document.querySelectorAll('.aplayer-local').forEach(function(container) {
        if (container.aplayer) return;
        var ap = new window.APlayer({container:container, audio:window.__LOCAL_PLAYLIST,
          autoplay:false, preload:'metadata', volume:0.7, listFolded:true,
          lrcType:window.__LOCAL_PLAYLIST.some(function(track) {return !!track.lrc;}) ? 3 : 0});
        container.aplayer = ap;
        window.aplayers = window.aplayers || [];
        window.aplayers.push(ap);
        self.onAPlayerReady(ap);
      });
    },

    getActivePlayer: function() {
      var players = window.aplayers || [];
      return players.find(function(ap) { return !ap.audio.paused; }) ||
        players.find(function(ap) { return ap.container.offsetParent !== null; }) || players[0];
    },

    waitForAPlayer: function() {
      var self = this;

      // APlayer is loaded via CDN and creates window.APlayer
      // The <meting-js> element handles initialization
      var checkInterval = setInterval(function() {
        var metingEl = document.querySelector('meting-js');
        if (metingEl && metingEl.aplayer) {
          clearInterval(checkInterval);
          self.onAPlayerReady(metingEl.aplayer);
        }
      }, 500);

      // Timeout after 10 seconds
      setTimeout(function() {
        clearInterval(checkInterval);
      }, 10000);
    },

    onAPlayerReady: function(ap) {
      // Store reference
      window.__aplayer = ap;

      // Force playlist and lyrics to fold/close on startup
      // Use a small delay to ensure APlayer has fully initialized DOM
      var self = this;
      setTimeout(function() {
        if (ap.lrc) {
          ap.lrc.hide();
        }
        if (ap.list) {
          ap.list.hide();
        }
      }, 200);

      // Handle volume from settings
      var savedVolume = localStorage.getItem('musicVolume');
      if (savedVolume !== null) {
        ap.volume(parseFloat(savedVolume));
      }

      ap.on('volumechange', function() {
        localStorage.setItem('musicVolume', ap.audio.volume);
      });
    }
  };

  window.MusicPlayer = MusicPlayer;
  document.addEventListener('DOMContentLoaded', function() {
    MusicPlayer.init();
  });
})();
