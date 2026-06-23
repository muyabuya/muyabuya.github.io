
const PLAYLIST = [
  { title: "STONE", src: "audio/coles-theme.mp3" },
  { title: "BURNT HEART", src: "audio/jades-theme.mp3" },
  { title: "ACE UP YOUR SLEEVE!", src: "audio/aces-theme.mp3" },
  { title: "Sunkissed", src: "audio/beris-theme.mp3" },
  { title: "Trinity", src: "audio/novas-theme.mp3" },
  { title: "Formal Greeting", src: "audio/stoneheart-title.mp3" },
   { title: "SHUT UP AND ENJOY THE NIGHTCORE", src: "audio/SHUTUPANDENJOYTHENIGHTCORE.mp3" },
  { title: "Practicing my Dragon Punches in the Backyard", src: "audio/backyarddragonpunches if it doesnt render properly i'll gameend everyone.mp3" },
  { title: "Nihilistic Serenade", src: "audio/battle.mp3" },
  { title: "On Our Way!", src: "audio/casual theme.mp3" },
  { title: "Trinity", src: "audio/novas-theme.mp3" },
  { title: "Dark Gold Perfume", src: "audio/darkgoldperfume.mp3" },
  { title: "The Evils of Truth and Love", src: "evilsoftruthandlove.mp3" },
   { title: "Let's Get Involved!", src: "audio/gleeful.mp3" },
  { title: "Cyclical Cynicism", src: "audio/misha limbostage.mp3" },
  { title: "Smells like Passion, Cigarettes, and Beauty.", src: "audio/passioncigs.mp3" },
  { title: "Hold it!", src: "audio/pause.mp3" },
  { title: "Pixel Perfect Performance", src: "audio/pixelperfect.mp3" },
  { title: "Stone Cold Apathy", src: "audio/stonecoldapathy.mp3" },
  { title: "One Good Deed a Day Keeps the Inner Demons Away!", src: "audio/tutorial.mp3" },
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
  const timeCurrentEl = document.getElementById("player-time-current");
  const timeDurationEl = document.getElementById("player-time-duration");
  const progressFill = document.getElementById("player-progress-fill");
 
  function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }
 
  function updateProgress() {
    const duration = audio.duration || 0;
    const current = audio.currentTime || 0;
    const pct = duration > 0 ? (current / duration) * 100 : 0;
    progressFill.style.width = `${pct}%`;
    timeCurrentEl.textContent = formatTime(current);
    timeDurationEl.textContent = formatTime(duration);
  }
 
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
    progressFill.style.width = "0%";
    timeCurrentEl.textContent = "0:00";
    timeDurationEl.textContent = "0:00";
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
  audio.addEventListener("timeupdate", updateProgress);
  audio.addEventListener("loadedmetadata", updateProgress);
 
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
