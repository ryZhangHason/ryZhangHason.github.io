(function () {
  const desktopQuery = window.matchMedia("(min-width: 1024px)");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const spritePath = "/images/Pixel%208%20position/svgviewer-output%20(main).svg";

  let cat = null;
  let rafId = null;
  let state = null;
  let pauseUntil = 0;

  const CAT_SIZE = 92;
  const EDGE_PADDING = 18;
  const TOP_CLEARANCE = 110;
  const SPEED = 34;
  const BOUNCE_PIXELS = 7;
  const PAUSE_MIN_MS = 500;
  const PAUSE_MAX_MS = 1500;
  const STOP_CHANCE = 0.0011;
  const REVERSE_CHANCE = 0.0015;

  function enabled() {
    return desktopQuery.matches && !reducedMotionQuery.matches;
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function buildBounds() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const left = EDGE_PADDING;
    const top = TOP_CLEARANCE;
    const right = Math.max(left, width - CAT_SIZE - EDGE_PADDING);
    const bottom = Math.max(top, height - CAT_SIZE - EDGE_PADDING);

    return { left, top, right, bottom };
  }

  function orientationFor(surface, direction) {
    if (surface === "floor") {
      return direction === 1 ? "rotate(0deg)" : "scaleX(-1)";
    }

    if (surface === "left-wall") {
      return direction === 1 ? "rotate(90deg)" : "rotate(-90deg)";
    }

    return direction === 1 ? "rotate(-90deg)" : "rotate(90deg)";
  }

  function bounceOffset(surface, progress) {
    const amplitude = Math.round(Math.abs(Math.sin(progress * Math.PI * 2)) * BOUNCE_PIXELS);

    if (surface === "floor") {
      return { x: 0, y: -amplitude };
    }

    if (surface === "left-wall") {
      return { x: amplitude, y: 0 };
    }

    return { x: -amplitude, y: 0 };
  }

  function placeCat(x, y, transform, bounce) {
    if (!cat) return;
    cat.style.left = `${x + bounce.x}px`;
    cat.style.top = `${y + bounce.y}px`;
    cat.style.transform = transform;
  }

  function ensureCat() {
    if (cat) return;

    cat = document.createElement("img");
    cat.className = "pixel-cat-walker";
    cat.src = spritePath;
    cat.alt = "";
    cat.decoding = "async";
    cat.setAttribute("aria-hidden", "true");
    document.body.appendChild(cat);
  }

  function removeCat() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (cat) {
      cat.remove();
      cat = null;
    }
    state = null;
    pauseUntil = 0;
  }

  function resetState() {
    const bounds = buildBounds();
    state = {
      bounds,
      surface: "left-wall",
      direction: 1,
      progress: 0,
      x: bounds.left,
      y: bounds.top,
      lastTime: null,
    };
    pauseUntil = 0;
    placeCat(state.x, state.y, orientationFor(state.surface, state.direction), { x: 0, y: 0 });
  }

  function syncPositionFromState() {
    const { bounds, surface, progress } = state;

    if (surface === "left-wall") {
      state.x = bounds.left;
      state.y = progress;
      return;
    }

    if (surface === "right-wall") {
      state.x = bounds.right;
      state.y = progress;
      return;
    }

    state.x = progress;
    state.y = bounds.bottom;
  }

  function transitionAtBoundary() {
    const { bounds, surface, direction } = state;

    if (surface === "left-wall") {
      if (direction > 0) {
        state.surface = "floor";
        state.direction = 1;
        state.progress = bounds.left;
      } else {
        state.direction = 1;
        state.progress = bounds.top;
      }
      return;
    }

    if (surface === "right-wall") {
      if (direction > 0) {
        state.direction = -1;
        state.progress = bounds.bottom;
      } else {
        state.surface = "floor";
        state.direction = -1;
        state.progress = bounds.right;
      }
      return;
    }

    if (direction > 0) {
      state.surface = "right-wall";
      state.direction = -1;
      state.progress = bounds.bottom;
    } else {
      state.surface = "left-wall";
      state.direction = -1;
      state.progress = bounds.bottom;
    }
  }

  function maybePause(now) {
    if (Math.random() < STOP_CHANCE) {
      pauseUntil = now + randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS);
      return true;
    }

    return false;
  }

  function maybeReverse() {
    if (Math.random() >= REVERSE_CHANCE) return;

    if (state.surface === "floor") {
      state.direction *= -1;
      return;
    }

    if (state.progress > state.bounds.top + 30 && state.progress < state.bounds.bottom - 30) {
      state.direction *= -1;
    }
  }

  function step(now) {
    if (!enabled()) {
      removeCat();
      return;
    }

    if (!cat || !state) {
      ensureCat();
      resetState();
    }

    if (!state.lastTime) {
      state.lastTime = now;
    }

    const dt = Math.min((now - state.lastTime) / 1000, 0.05);
    state.lastTime = now;
    state.bounds = buildBounds();

    if (pauseUntil > now) {
      syncPositionFromState();
      placeCat(state.x, state.y, orientationFor(state.surface, state.direction), { x: 0, y: 0 });
      rafId = requestAnimationFrame(step);
      return;
    }

    if (maybePause(now)) {
      syncPositionFromState();
      placeCat(state.x, state.y, orientationFor(state.surface, state.direction), { x: 0, y: 0 });
      rafId = requestAnimationFrame(step);
      return;
    }

    maybeReverse();

    const bounds = state.bounds;
    let min;
    let max;

    if (state.surface === "floor") {
      min = bounds.left;
      max = bounds.right;
    } else {
      min = bounds.top;
      max = bounds.bottom;
    }

    state.progress += state.direction * SPEED * dt;

    if (state.progress >= max) {
      state.progress = max;
      transitionAtBoundary();
      pauseUntil = now + 260;
    } else if (state.progress <= min) {
      state.progress = min;
      transitionAtBoundary();
      pauseUntil = now + 260;
    }

    syncPositionFromState();
    const bounce = bounceOffset(state.surface, state.progress / 16);
    placeCat(state.x, state.y, orientationFor(state.surface, state.direction), bounce);
    rafId = requestAnimationFrame(step);
  }

  function start() {
    if (!enabled()) {
      removeCat();
      return;
    }

    ensureCat();
    resetState();

    if (rafId) {
      cancelAnimationFrame(rafId);
    }
    rafId = requestAnimationFrame(step);
  }

  window.addEventListener("load", start);
  window.addEventListener("resize", start);
  desktopQuery.addEventListener("change", start);
  reducedMotionQuery.addEventListener("change", start);
})();
