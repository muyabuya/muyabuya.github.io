// sketch-borders.js
// Draws wobbly, hand-marker-style borders into any .sketch-border element.
// Each call generates a fresh random wobble so every box looks uniquely drawn,
// the way a real marker pass never traces the same line twice.

function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function wobblyRoundedRect(width, height, rand, options = {}) {
  const {
    radius = 18,
    wobble = 3,
    strokeWidth = 4,
    passes = 2,
    inset = 6
  } = options;

  const w = width;
  const h = height;
  const r = Math.min(radius, w / 2 - inset, h / 2 - inset);

  // Build a rounded-rect path with small random jitter on each control point
  function jitter(v) {
    return v + (rand() - 0.5) * wobble;
  }

  function buildPath() {
    const x0 = inset, y0 = inset, x1 = w - inset, y1 = h - inset;
    return `
      M ${jitter(x0 + r)} ${jitter(y0)}
      L ${jitter(x1 - r)} ${jitter(y0)}
      Q ${jitter(x1)} ${jitter(y0)} ${jitter(x1)} ${jitter(y0 + r)}
      L ${jitter(x1)} ${jitter(y1 - r)}
      Q ${jitter(x1)} ${jitter(y1)} ${jitter(x1 - r)} ${jitter(y1)}
      L ${jitter(x0 + r)} ${jitter(y1)}
      Q ${jitter(x0)} ${jitter(y1)} ${jitter(x0)} ${jitter(y1 - r)}
      L ${jitter(x0)} ${jitter(y0 + r)}
      Q ${jitter(x0)} ${jitter(y0)} ${jitter(x0 + r)} ${jitter(y0)}
      Z
    `;
  }

  let paths = '';
  for (let i = 0; i < passes; i++) {
    paths += `<path d="${buildPath()}" fill="none" stroke="var(--marker)" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" opacity="${0.85 - i * 0.15}"/>`;
  }
  return paths;
}

function drawSketchBorder(el, options = {}) {
  const rect = el.getBoundingClientRect();
  const width = rect.width + 12;
  const height = rect.height + 12;

  // stable-ish seed per element so it doesn't redraw wildly on resize,
  // but still unique per element on the page
  const seedSource = el.dataset.sketchSeed || Math.floor(Math.random() * 10000);
  el.dataset.sketchSeed = seedSource;
  const rand = seededRandom(Number(seedSource));

  let svg = el.querySelector('svg.border-svg');
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'border-svg');
    el.insertBefore(svg, el.firstChild);
  }

  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.innerHTML = wobblyRoundedRect(width, height, rand, options);
}

function initSketchBorders() {
  const els = document.querySelectorAll('.sketch-border');
  els.forEach((el) => drawSketchBorder(el));
}

// Redraw on load and on resize (debounced)
window.addEventListener('DOMContentLoaded', initSketchBorders);

let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(initSketchBorders, 150);
});
