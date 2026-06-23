// comic-music-handoff.js
// Include this on every Stone:Heart page (the chapter pages, the section
// landing page, etc). It tells the parent shell "pause your music, I'm
// handling audio myself" on load, and "you can resume control" when the
// user navigates away.
//
// This only works because shell.html (the permanent top-level page) never
// itself reloads — only the iframe inside it does, swapping between
// index.html, stone-heart/index.html, etc. The postMessage channel to
// window.parent stays valid across that, since the parent document never
// goes away. If this page is ever opened directly (NOT inside the shell's
// iframe), window.parent === window, and these messages simply go nowhere
// — harmless, just inert.

(function () {
  function notifyParent(type) {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type }, "*");
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    notifyParent("comic-music-active");
  });

  // Covers normal navigation away (clicking a nav link, back button, etc).
  window.addEventListener("beforeunload", () => {
    notifyParent("comic-music-inactive");
  });
})();
