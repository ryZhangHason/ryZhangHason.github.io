(function () {
  const desktopQuery = window.matchMedia("(min-width: 1024px)");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const spritePath = "/images/Cat_Updated.svg";

  const CAT_SIZE = 100;
  const EDGE_PADDING = 26;
  const FLOOR_RANGE_RATIO = 0.2;
  const SPRITE_INSET = {
    left: 28,
    right: 28,
    top: 24,
    bottom: 26,
  };
  const SPEED = 28;
  const FLOOR_BOUNCE_PIXELS = 24;
  const WALL_BOB_PIXELS = 4;
  const STOP_MIN_MS = 420;
  const STOP_MAX_MS = 1100;
  const STOP_CHANCE = 0.005;
  const REVERSE_CHANCE = 0.003;
  const TURN_PAUSE_MS = 90;
  const WALL_REVERSE_MARGIN = 48;

  let cat = null;
  let rafId = null;
  let state = null;
  let pauseUntil = 0;

  function enabled() {
    return desktopQuery.matches && !reducedMotionQuery.matches;
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function buildBounds() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const left = EDGE_PADDING - SPRITE_INSET.left;
    const top = EDGE_PADDING - SPRITE_INSET.top;
    const right = width - EDGE_PADDING - (CAT_SIZE - SPRITE_INSET.right);
    const bottom = height - EDGE_PADDING - (CAT_SIZE - SPRITE_INSET.bottom);

    return {
      left,
      top,
      right: Math.max(left, right),
      bottom: Math.max(top, bottom),
    };
  }

  function stateMeta(mode) {
    const floorOrigin = `${Math.round(CAT_SIZE / 2)}px ${CAT_SIZE - SPRITE_INSET.bottom}px`;
    const leftWallOrigin = `${SPRITE_INSET.left}px ${Math.round(CAT_SIZE / 2)}px`;
    const rightWallOrigin = `${CAT_SIZE - SPRITE_INSET.right}px ${Math.round(CAT_SIZE / 2)}px`;

    if (mode === "floor-right") {
      return {
        rotation: "rotate(0deg)",
        origin: floorOrigin,
      };
    }

    if (mode === "floor-left") {
      return {
        rotation: "scaleX(-1)",
        origin: floorOrigin,
      };
    }

    if (mode === "left-wall-down") {
      return {
        rotation: "rotate(90deg)",
        origin: leftWallOrigin,
      };
    }

    if (mode === "left-wall-up") {
      return {
        rotation: "rotate(90deg) scaleX(-1)",
        origin: leftWallOrigin,
      };
    }

    if (mode === "right-wall-down") {
      return {
        rotation: "rotate(-90deg)",
        origin: rightWallOrigin,
      };
    }

    return {
      rotation: "rotate(-90deg) scaleX(-1)",
      origin: rightWallOrigin,
    };
  }

  function isFloor(mode) {
    return mode === "floor-right" || mode === "floor-left";
  }

  function isLeftWall(mode) {
    return mode === "left-wall-down" || mode === "left-wall-up";
  }

  function isRightWall(mode) {
    return mode === "right-wall-down" || mode === "right-wall-up";
  }

  function currentDirection(mode) {
    if (mode === "floor-right" || mode === "left-wall-down" || mode === "right-wall-down") {
      return 1;
    }

    return -1;
  }

  function edgeTransform(mode, progress) {
    const wave = Math.abs(Math.sin(progress * Math.PI * 2));

    if (isFloor(mode)) {
      const bounce = Math.round(wave * FLOOR_BOUNCE_PIXELS);
      return `translate3d(0, ${-bounce}px, 0)`;
    }

    const bob = Math.round(Math.sin(progress * Math.PI * 2) * WALL_BOB_PIXELS);
    return `translate3d(0, ${bob}px, 0)`;
  }

  function anchoredPosition(mode, progress, bounds) {
    if (mode === "floor-right" || mode === "floor-left") {
      return {
        x: progress,
        y: bounds.bottom,
      };
    }

    if (mode === "left-wall-down" || mode === "left-wall-up") {
      return {
        x: bounds.left,
        y: progress,
      };
    }

    return {
      x: bounds.right,
      y: progress,
    };
  }

  function pathLimits(mode, bounds) {
    if (isFloor(mode)) {
      const floorMax = bounds.left + (bounds.right - bounds.left) * FLOOR_RANGE_RATIO;
      return { min: bounds.left, max: Math.max(bounds.left, floorMax) };
    }

    return { min: bounds.top, max: bounds.bottom };
  }

  function placeCat(mode, progress, bounceProgress) {
    if (!cat || !state) return;

    const meta = stateMeta(mode);
    const pos = anchoredPosition(mode, progress, state.bounds);
    const bounce = edgeTransform(mode, bounceProgress);

    cat.style.left = `${pos.x}px`;
    cat.style.top = `${pos.y}px`;
    cat.style.transformOrigin = meta.origin;
    cat.style.transform = `${meta.rotation} ${bounce}`;
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
      mode: "floor-right",
      progress: bounds.left,
      traveled: 0,
      lastTime: null,
    };
    pauseUntil = 0;
    placeCat(state.mode, state.progress, 0);
  }

  function nextModeAtBoundary(mode) {
    if (mode === "left-wall-down") return "floor-right";
    if (mode === "floor-right") return "floor-left";
    if (mode === "floor-left") return "left-wall-up";
    if (mode === "left-wall-up") return "left-wall-down";
    if (mode === "right-wall-down") return "right-wall-up";
    return "left-wall-down";
  }

  function maybePause(now) {
    if (Math.random() < STOP_CHANCE) {
      pauseUntil = now + randomBetween(STOP_MIN_MS, STOP_MAX_MS);
      return true;
    }

    return false;
  }

  function maybeReverse(now) {
    if (Math.random() >= REVERSE_CHANCE) return false;

    if (isFloor(state.mode)) {
      state.mode = state.mode === "floor-right" ? "floor-left" : "floor-right";
      state.traveled = 0;
      pauseUntil = now + TURN_PAUSE_MS;
      return true;
    }

    const { min, max } = pathLimits(state.mode, state.bounds);
    if (state.progress <= min + WALL_REVERSE_MARGIN || state.progress >= max - WALL_REVERSE_MARGIN) {
      return false;
    }

    if (state.mode === "left-wall-down") state.mode = "left-wall-up";
    else if (state.mode === "left-wall-up") state.mode = "left-wall-down";
    else if (state.mode === "right-wall-down") state.mode = "right-wall-up";
    else if (state.mode === "right-wall-up") state.mode = "right-wall-down";
    else return false;

    state.traveled = 0;
    pauseUntil = now + TURN_PAUSE_MS;
    return true;
  }

  function advance(now, dt) {
    const { min, max } = pathLimits(state.mode, state.bounds);
    let remaining = SPEED * dt;

    while (remaining > 0) {
      const direction = currentDirection(state.mode);
      const distanceToEdge = direction > 0 ? max - state.progress : state.progress - min;

      if (remaining < distanceToEdge) {
        state.progress += direction * remaining;
        state.traveled += remaining;
        remaining = 0;
      } else {
        state.progress = direction > 0 ? max : min;
        state.traveled = 0;
        remaining -= Math.max(distanceToEdge, 0);
        state.mode = nextModeAtBoundary(state.mode);
        const nextLimits = pathLimits(state.mode, state.bounds);

        if (state.mode === "floor-right") state.progress = nextLimits.min;
        else if (state.mode === "floor-left") state.progress = nextLimits.max;
        else if (state.mode === "left-wall-down") state.progress = state.bounds.top;
        else if (state.mode === "left-wall-up") state.progress = state.bounds.bottom;
        else if (state.mode === "right-wall-down") state.progress = state.bounds.top;
        else if (state.mode === "right-wall-up") state.progress = state.bounds.bottom;

        pauseUntil = now + TURN_PAUSE_MS;
        break;
      }
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
      placeCat(state.mode, state.progress, 0);
      rafId = requestAnimationFrame(step);
      return;
    }

    if (maybePause(now)) {
      placeCat(state.mode, state.progress, 0);
      rafId = requestAnimationFrame(step);
      return;
    }

    if (maybeReverse(now)) {
      placeCat(state.mode, state.progress, 0);
      rafId = requestAnimationFrame(step);
      return;
    }

    advance(now, dt);
    placeCat(state.mode, state.progress, state.traveled / 16);
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
