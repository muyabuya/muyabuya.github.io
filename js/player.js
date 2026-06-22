// player.js
// Site-wide shuffle music player, bottom-right, hand-drawn styling.
// Starts paused on every page load (browsers block audible autoplay anyway,
// and we chose the honest "press play" UX over the muted-autoplay trick).
// Track + position persist across page navigations via localStorage, since
// each page load is a fresh document and the <audio> element doesn't survive
// navigation.

// ---- EDIT THIS LIST to add/remove tracks ----
// `src` is relative to the site root (resolved correctly from any page depth below).
// Drop your mp3 files into /audio/ and list them here.
const PLAYLIST = [
  { title: "STONE", src: "audio/coles-theme.mp3" },
  { title: "BURNT HEART", src: "audio/jades-theme.mp3" },
  { title: "ACE UP YOUR SLEEVE!", src: "audio/aces-theme.mp3" },
  { title: "Sunkissed", src: "audio/beris-theme.mp3" },
  { title: "Trinity", src: "audio/novas-theme.mp3" },
  { title: "Undeniable Presence", src: "audio/mordecais-theme.mp3" },
  { title: "Formal Greeting", src: "audio/stoneheart-title.mp3" },
];
// ----------------------------------------------

(function () {
  const STORAGE_KEY = "muyabuya-player-state";

  // Figure out the path back to the site root from whatever page we're on,
  // so audio/foo.mp3 resolves correctly whether we're at / or /portfolio/.
  function getRootPrefix() {
    const depth = window.location.pathname
      .replace(/^\//, "")
      .split("/")
      .filter(Boolean).length - 1; // subtract the html file itself
    return depth > 0 ? "../".repeat(depth) : "";
  }

  function shuffledOrder(length) {
    const arr = Array.from({ length }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* ignore */
    }
  }

  function buildPlayerDOM() {
    const wrap = document.createElement("div");
    wrap.id = "site-player";
    wrap.className = "sketch-border";
    wrap.innerHTML = `
      <div class="content player-content">
        <button class="player-btn btn-prev" title="Previous" aria-label="Previous track">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
        </button>
        <button class="player-btn btn-play" title="Play" aria-label="Play">
          <svg class="icon-play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          <svg class="icon-pause" viewBox="0 0 24 24" fill="currentColor" style="display:none;"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>
        </button>
        <button class="player-btn btn-next" title="Next" aria-label="Next track">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 6h2v12h-2zm-2 6L5.5 6v12z"/></svg>
        </button>
        <div class="player-track" id="player-track-label">tap play to start</div>
      </div>
    `;
    document.body.appendChild(wrap);
    return wrap;
  }

  function initPlayer() {
    if (!PLAYLIST.length) return;

    const root = getRootPrefix();
    const wrap = buildPlayerDOM();
    const trackLabel = wrap.querySelector("#player-track-label");
    const btnPlay = wrap.querySelector(".btn-play");
    const iconPlay = wrap.querySelector(".icon-play");
    const iconPause = wrap.querySelector(".icon-pause");
    const btnPrev = wrap.querySelector(".btn-prev");
    const btnNext = wrap.querySelector(".btn-next");

    const audio = new Audio();
    audio.preload = "auto";
    audio.volume = 0.6;

    let state = loadState();
    if (!state || !Array.isArray(state.order) || state.order.length !== PLAYLIST.length) {
      state = {
        order: shuffledOrder(PLAYLIST.length),
        position: 0, // index into `order`
        time: 0,
        playing: false, // always start paused on page load
      };
    } else {
      // Even if we have saved progress, never auto-resume playback on a
      // fresh page load — browsers would block it anyway, and we want the
      // explicit "press play" moment every time.
      state.playing = false;
    }

    function currentTrack() {
      const idx = state.order[state.position];
      return PLAYLIST[idx];
    }

    function loadTrack(resumeTime) {
      const track = currentTrack();
      audio.src = root + track.src;
      trackLabel.textContent = track.title;
      if (resumeTime) {
        audio.currentTime = resumeTime;
      }
    }

    function persist() {
      state.time = audio.currentTime || 0;
      saveState(state);
    }

    function updatePlayIcon() {
      iconPlay.style.display = state.playing ? "none" : "block";
      iconPause.style.display = state.playing ? "block" : "none";
      btnPlay.setAttribute("title", state.playing ? "Pause" : "Play");
      btnPlay.setAttribute("aria-label", state.playing ? "Pause" : "Play");
    }

    function play() {
      audio.play().then(() => {
        state.playing = true;
        updatePlayIcon();
        persist();
      }).catch(() => {
        state.playing = false;
        updatePlayIcon();
      });
    }

    function pause() {
      audio.pause();
      state.playing = false;
      updatePlayIcon();
      persist();
    }

    function next() {
      const wasPlaying = state.playing;
      state.position = (state.position + 1) % state.order.length;
      // reshuffle once we've gone through the whole list
      if (state.position === 0) {
        state.order = shuffledOrder(PLAYLIST.length);
      }
      state.time = 0;
      loadTrack(0);
      if (wasPlaying) play();
      persist();
    }

    function prev() {
      const wasPlaying = state.playing;
      state.position = (state.position - 1 + state.order.length) % state.order.length;
      state.time = 0;
      loadTrack(0);
      if (wasPlaying) play();
      persist();
    }

    // ---- wire up controls ----
    btnPlay.addEventListener("click", () => {
      if (state.playing) {
        pause();
      } else {
        play();
      }
    });
    btnNext.addEventListener("click", next);
    btnPrev.addEventListener("click", prev);

    audio.addEventListener("ended", next);

    // Save progress periodically and on page unload (so resuming the SAME
    // track mid-way works if the user navigates pages without finishing it,
    // even though playback itself always starts paused on the new page).
    setInterval(() => {
      if (state.playing) persist();
    }, 4000);
    window.addEventListener("beforeunload", persist);

    // ---- initial load: track is loaded and ready, but paused ----
    loadTrack(state.time);
    updatePlayIcon();

    if (window.drawSketchBorder) {
      window.drawSketchBorder(wrap);
    }
  }

  window.addEventListener("DOMContentLoaded", initPlayer);
})();
