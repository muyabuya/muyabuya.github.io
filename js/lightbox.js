// lightbox.js
// Click-to-enlarge image viewer for gallery tiles.
// Usage: give any element with a full-size image to show the class
// "lightbox-trigger" and a data-full="path/to/full-image.jpg" attribute
// (optionally data-caption="..."). Clicking it opens that image centered,
// full scale, over a dimmed backdrop. Works across any number of triggers
// on the page and lets you arrow between them in DOM order.

(function () {
  let triggers = [];
  let currentIndex = -1;
  let overlay, imgEl, captionEl, closeBtn, prevBtn, nextBtn;

  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.id = 'lightbox-overlay';
    overlay.innerHTML = `
      <button class="lightbox-close" aria-label="Close">&times;</button>
      <button class="lightbox-nav lightbox-prev" aria-label="Previous">&#10094;</button>
      <div class="lightbox-stage">
        <img class="lightbox-img" alt="">
        <div class="lightbox-caption"></div>
      </div>
      <button class="lightbox-nav lightbox-next" aria-label="Next">&#10095;</button>
    `;
    document.body.appendChild(overlay);

    imgEl = overlay.querySelector('.lightbox-img');
    captionEl = overlay.querySelector('.lightbox-caption');
    closeBtn = overlay.querySelector('.lightbox-close');
    prevBtn = overlay.querySelector('.lightbox-prev');
    nextBtn = overlay.querySelector('.lightbox-next');

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showAt(currentIndex - 1); });
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showAt(currentIndex + 1); });

    // Click on the dimmed backdrop (not the image itself) closes it
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.classList.contains('lightbox-stage')) {
        close();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') showAt(currentIndex - 1);
      if (e.key === 'ArrowRight') showAt(currentIndex + 1);
    });
  }

  function showAt(index) {
    if (!triggers.length) return;
    currentIndex = (index + triggers.length) % triggers.length;
    const trigger = triggers[currentIndex];
    const fullSrc = trigger.dataset.full || trigger.querySelector('img')?.src;
    const caption = trigger.dataset.caption || trigger.querySelector('img')?.alt || '';

    imgEl.src = fullSrc;
    imgEl.alt = caption;
    captionEl.textContent = caption;

    // Hide arrows entirely if there's only one piece — nothing to navigate to
    const multi = triggers.length > 1;
    prevBtn.style.display = multi ? 'flex' : 'none';
    nextBtn.style.display = multi ? 'flex' : 'none';
  }

  function open(index) {
    showAt(index);
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden'; // prevent background scroll while open
  }

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function initLightbox() {
    triggers = Array.from(document.querySelectorAll('.lightbox-trigger'));
    if (!triggers.length) return;

    buildOverlay();

    triggers.forEach((trigger, i) => {
      trigger.style.cursor = 'pointer';
      trigger.addEventListener('click', () => open(i));
    });
  }

  window.addEventListener('DOMContentLoaded', initLightbox);
})();
