
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
  let order = [];
  let position = 0;
  let playing = false;
  let duckedForComic = false;

  const audio = new Audio();
  audio.volume = 0.6;
  audio.preload = "auto";

  const wrap = document.getElementById("site-player");
  const trackLabel = document.getElementById("player-track-label");
  const btnPlay = wrap.querySelector(".btn-play");
  const iconPlay = wrap.querySelector(".icon-play");
  const iconPause = wrap.querySelector(".icon-pause");
  const btnPrev = wrap.querySelector(".btn-prev");
  const btnNext = wrap.querySelector(".btn-next");

  function shuffledOrder(length) {
    const arr = Array.from({ length }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function currentTrack() {
    return PLAYLIST[order[position]];
  }

  function loadTrack() {
    const track = currentTrack();
    if (!track) return;
    audio.src = track.src;
  }

  function updateUI() {
    const track = currentTrack();
    iconPlay.style.display = playing ? "none" : "block";
    iconPause.style.display = playing ? "block" : "none";
    btnPlay.disabled = duckedForComic;
    btnPlay.style.opacity = duckedForComic ? "0.4" : "1";
    trackLabel.textContent = duckedForComic
      ? "paused for comic"
      : (track ? track.title : "tap play to start");
  }

  function play() {
    if (duckedForComic) return;
    audio.play().then(() => {
      playing = true;
      updateUI();
    }).catch(() => {
      playing = false;
      updateUI();
    });
  }

  function pause() {
    audio.pause();
    playing = false;
    updateUI();
  }

  function next() {
    position = (position + 1) % order.length;
    if (position === 0) order = shuffledOrder(PLAYLIST.length);
    const wasPlaying = playing;
    loadTrack();
    if (wasPlaying) play();
    updateUI();
  }

  function prev() {
    position = (position - 1 + order.length) % order.length;
    const wasPlaying = playing;
    loadTrack();
    if (wasPlaying) play();
    updateUI();
  }

  audio.addEventListener("ended", next);

  btnPlay.addEventListener("click", () => (playing ? pause() : play()));
  btnNext.addEventListener("click", next);
  btnPrev.addEventListener("click", prev);

  // ---- messages from framed pages (Stone:Heart duck/unduck) ----
  window.addEventListener("message", (e) => {
    const data = e.data;
    if (!data || typeof data !== "object") return;

    if (data.type === "comic-music-active") {
      duckedForComic = true;
      pause();
      updateUI();
    } else if (data.type === "comic-music-inactive") {
      duckedForComic = false;
      updateUI();
      // Deliberately NOT auto-resuming playback here — respects the
      // site-wide "press play" UX. The button just becomes usable again.
    }
  });

  if (window.drawSketchBorder) {
    window.drawSketchBorder(wrap);
  }

  // ---- initial setup ----
  order = shuffledOrder(PLAYLIST.length);
  loadTrack();
  updateUI();
})();
