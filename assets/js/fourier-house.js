(() => {
  const figure = document.querySelector('.fourier-house');
  const canvas = figure?.querySelector('canvas');
  if (!figure || !canvas || !figure.offsetWidth || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const SAMPLE_COUNT = 8192;
  const HARMONIC_COUNT = 3072;
  const DRAW_SECONDS = 30;
  const WHEEL_FADE_SECONDS = 1.2;
  const LIGHT_SWEEP_SECONDS = 1.8;
  const colors = {
    trace: '#a64c42',
    traceGlow: 'rgba(166, 76, 66, .13)',
    wheel: 'rgba(138, 143, 150, .30)',
    arm: 'rgba(132, 137, 144, .38)',
    hub: 'rgba(120, 126, 134, .48)',
    tip: 'rgba(135, 141, 148, .58)',
  };
  const starColors = {
    trace: '#b8893f',
    traceGlow: 'rgba(184, 137, 63, .15)',
    wheel: 'rgba(138, 143, 150, .30)',
    arm: 'rgba(132, 137, 144, .38)',
    hub: 'rgba(120, 126, 134, .48)',
    tip: 'rgba(135, 141, 148, .58)',
  };

  let width = 0;
  let height = 0;
  let transform = null;
  let chains = null;
  let frame = 0;
  let startedAt = 0;
  let animationComplete = false;

  function fft(real, imaginary, inverse = false) {
    const n = real.length;
    for (let i = 1, j = 0; i < n; i += 1) {
      let bit = n >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) {
        [real[i], real[j]] = [real[j], real[i]];
        [imaginary[i], imaginary[j]] = [imaginary[j], imaginary[i]];
      }
    }
    for (let size = 2; size <= n; size *= 2) {
      const angle = (inverse ? 2 : -2) * Math.PI / size;
      const wr = Math.cos(angle);
      const wi = Math.sin(angle);
      for (let base = 0; base < n; base += size) {
        let cr = 1;
        let ci = 0;
        for (let j = 0; j < size / 2; j += 1) {
          const a = base + j;
          const b = a + size / 2;
          const br = real[b] * cr - imaginary[b] * ci;
          const bi = real[b] * ci + imaginary[b] * cr;
          real[b] = real[a] - br;
          imaginary[b] = imaginary[a] - bi;
          real[a] += br;
          imaginary[a] += bi;
          const nextCr = cr * wr - ci * wi;
          ci = cr * wi + ci * wr;
          cr = nextCr;
        }
      }
    }
    if (inverse) {
      for (let i = 0; i < n; i += 1) {
        real[i] /= n;
        imaginary[i] /= n;
      }
    }
  }

  function collectStrokes(svg, groupId) {
    const group = svg.querySelector(`[id="${groupId}"]`);
    if (!group) throw new Error(`Missing SVG outline group: ${groupId}`);
    const strokes = [];
    for (const element of group.querySelectorAll('path,line,rect,polygon,polyline,circle,ellipse')) {
      let length;
      try { length = element.getTotalLength(); } catch { continue; }
      const matrix = element.getCTM();
      if (!matrix || !Number.isFinite(length) || length < 0.1) continue;
      const scale = Math.max(Math.hypot(matrix.a, matrix.b), Math.hypot(matrix.c, matrix.d));
      const count = Math.min(900, Math.max(3, Math.ceil(length * scale / 4.2) + 1));
      const points = [];
      for (let i = 0; i < count; i += 1) {
        const point = element.getPointAtLength(length * i / (count - 1));
        points.push([
          point.x * matrix.a + point.y * matrix.c + matrix.e,
          point.x * matrix.b + point.y * matrix.d + matrix.f,
        ]);
      }
      strokes.push(points);
    }
    return strokes;
  }

  function orderStrokes(strokes) {
    const remaining = strokes.map(stroke => stroke.slice());
    let longestIndex = 0;
    let longestLength = -1;
    for (let i = 0; i < remaining.length; i += 1) {
      let length = 0;
      for (let j = 1; j < remaining[i].length; j += 1) {
        length += Math.hypot(remaining[i][j][0] - remaining[i][j - 1][0], remaining[i][j][1] - remaining[i][j - 1][1]);
      }
      if (length > longestLength) { longestLength = length; longestIndex = i; }
    }
    if (!remaining.length) return [];
    let current = remaining.splice(longestIndex, 1)[0];
    const ordered = [current];
    while (remaining.length) {
      const end = current[current.length - 1];
      let nearest = 0;
      let reverse = false;
      let minDistance = Infinity;
      for (let i = 0; i < remaining.length; i += 1) {
        const stroke = remaining[i];
        const first = stroke[0];
        const last = stroke[stroke.length - 1];
        const firstDistance = (end[0] - first[0]) ** 2 + (end[1] - first[1]) ** 2;
        const lastDistance = (end[0] - last[0]) ** 2 + (end[1] - last[1]) ** 2;
        if (firstDistance < minDistance) { nearest = i; reverse = false; minDistance = firstDistance; }
        if (lastDistance < minDistance) { nearest = i; reverse = true; minDistance = lastDistance; }
      }
      current = remaining.splice(nearest, 1)[0];
      if (reverse) current.reverse();
      ordered.push(current);
    }
    return ordered;
  }

  function sampleOutline(strokes) {
    const points = [];
    const ink = [];
    const ordered = orderStrokes(strokes);
    for (const stroke of ordered) {
      if (points.length) { points.push(stroke[0]); ink.push(0); }
      points.push(stroke[0]);
      ink.push(0);
      for (let i = 1; i < stroke.length; i += 1) {
        points.push(stroke[i]);
        ink.push(1);
      }
    }
    if (!points.length) throw new Error('No outline paths found');
    points.push(ordered[0][0]);
    ink.push(0);

    const cumulative = new Float64Array(points.length);
    for (let i = 1; i < points.length; i += 1) {
      const distance = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
      cumulative[i] = cumulative[i - 1] + distance * (ink[i] ? 1 : 0.2);
    }
    const real = new Float64Array(SAMPLE_COUNT);
    const imaginary = new Float64Array(SAMPLE_COUNT);
    const visible = new Uint8Array(SAMPLE_COUNT);
    let segment = 1;
    const total = cumulative[cumulative.length - 1];
    for (let i = 0; i < SAMPLE_COUNT; i += 1) {
      const distance = i / SAMPLE_COUNT * total;
      while (segment < cumulative.length - 1 && cumulative[segment] < distance) segment += 1;
      const span = cumulative[segment] - cumulative[segment - 1];
      const fraction = span > 1e-9 ? (distance - cumulative[segment - 1]) / span : 0;
      const from = points[segment - 1];
      const to = points[segment];
      real[i] = from[0] + fraction * (to[0] - from[0]);
      imaginary[i] = from[1] + fraction * (to[1] - from[1]);
      visible[i] = ink[segment];
    }
    return { real, imaginary, visible };
  }

  function compile(strokes) {
    const samples = sampleOutline(strokes);
    const coeffReal = samples.real.slice();
    const coeffImaginary = samples.imaginary.slice();
    fft(coeffReal, coeffImaginary);
    for (let i = 0; i < SAMPLE_COUNT; i += 1) {
      coeffReal[i] /= SAMPLE_COUNT;
      coeffImaginary[i] /= SAMPLE_COUNT;
    }

    const terms = [];
    const selectedReal = new Float64Array(SAMPLE_COUNT);
    const selectedImaginary = new Float64Array(SAMPLE_COUNT);
    const frequencies = [0];
    for (let frequency = 1; frequencies.length < HARMONIC_COUNT; frequency += 1) {
      frequencies.push(frequency);
      if (frequencies.length < HARMONIC_COUNT) frequencies.push(-frequency);
    }
    for (const frequency of frequencies) {
      const index = frequency >= 0 ? frequency : SAMPLE_COUNT + frequency;
      const real = coeffReal[index];
      const imaginary = coeffImaginary[index];
      selectedReal[index] = real;
      selectedImaginary[index] = imaginary;
      terms.push({ frequency, real, imaginary, radius: Math.hypot(real, imaginary) });
    }
    fft(selectedReal, selectedImaginary, true);
    const points = new Float64Array(SAMPLE_COUNT * 2);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let i = 0; i < SAMPLE_COUNT; i += 1) {
      const x = selectedReal[i] * SAMPLE_COUNT;
      const y = selectedImaginary[i] * SAMPLE_COUNT;
      points[i * 2] = x;
      points[i * 2 + 1] = y;
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
    return { terms, visible: samples.visible, points, bounds: { minX, minY, maxX, maxY } };
  }

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (chains) {
      fit();
      if (animationComplete) {
        ctx.clearRect(0, 0, width, height);
        drawOutline(chains.building, 1, 0.9, colors);
        drawOutline(chains.stars, 1, 0.9, starColors);
      }
    }
  }

  function fit() {
    const bounds = Object.values(chains).map(chain => chain.bounds);
    const b = {
      minX: Math.min(...bounds.map(bound => bound.minX)),
      minY: Math.min(...bounds.map(bound => bound.minY)),
      maxX: Math.max(...bounds.map(bound => bound.maxX)),
      maxY: Math.max(...bounds.map(bound => bound.maxY)),
    };
    const paddingX = 12;
    const paddingY = 10;
    const scale = Math.min((width - paddingX * 2) / (b.maxX - b.minX), (height - paddingY * 2) / (b.maxY - b.minY));
    transform = {
      scale,
      x: (width - (b.maxX - b.minX) * scale) / 2 - b.minX * scale,
      y: (height - (b.maxY - b.minY) * scale) / 2 - b.minY * scale,
    };
  }

  function tipAt(chain, progress) {
    let x = 0;
    let y = 0;
    const angle = 2 * Math.PI * progress;
    for (const term of chain.terms) {
      const phase = angle * term.frequency;
      const cosine = Math.cos(phase);
      const sine = Math.sin(phase);
      x += term.real * cosine - term.imaginary * sine;
      y += term.real * sine + term.imaginary * cosine;
    }
    return { x, y };
  }

  function drawOutline(chain, progress, alpha, palette) {
    const count = Math.min(SAMPLE_COUNT - 1, Math.floor(progress * SAMPLE_COUNT));
    if (count < 1) return;
    const { scale, x, y } = transform;
    ctx.beginPath();
    let active = false;
    for (let i = 1; i <= count; i += 1) {
      if (!chain.visible[i]) { active = false; continue; }
      const px = chain.points[(i - 1) * 2] * scale + x;
      const py = chain.points[(i - 1) * 2 + 1] * scale + y;
      const qx = chain.points[i * 2] * scale + x;
      const qy = chain.points[i * 2 + 1] * scale + y;
      if (!active) { ctx.moveTo(px, py); active = true; }
      ctx.lineTo(qx, qy);
    }
    ctx.globalAlpha = alpha;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = palette.traceGlow;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.strokeStyle = palette.trace;
    ctx.lineWidth = 1.75;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawWheels(chain, progress, alpha, palette) {
    const { scale, x, y } = transform;
    const angle = 2 * Math.PI * progress;
    let cx = 0;
    let cy = 0;
    ctx.beginPath();
    for (const term of chain.terms) {
      const phase = angle * term.frequency;
      const dx = term.real * Math.cos(phase) - term.imaginary * Math.sin(phase);
      const dy = term.real * Math.sin(phase) + term.imaginary * Math.cos(phase);
      const radius = term.radius * scale;
      if (term.frequency !== 0 && radius > 1.25) {
        const wheelX = cx * scale + x;
        const wheelY = cy * scale + y;
        ctx.moveTo(wheelX + radius, wheelY);
        ctx.arc(wheelX, wheelY, radius, 0, Math.PI * 2);
      }
      cx += dx;
      cy += dy;
    }
    ctx.strokeStyle = palette.wheel;
    ctx.lineWidth = 1.05;
    ctx.globalAlpha = alpha;
    ctx.stroke();

    cx = 0;
    cy = 0;
    ctx.beginPath();
    for (const term of chain.terms) {
      const phase = angle * term.frequency;
      const dx = term.real * Math.cos(phase) - term.imaginary * Math.sin(phase);
      const dy = term.real * Math.sin(phase) + term.imaginary * Math.cos(phase);
      const radius = term.radius * scale;
      if (term.frequency !== 0 && radius > 1.25) {
        const wheelX = cx * scale + x;
        const wheelY = cy * scale + y;
        ctx.moveTo(wheelX, wheelY);
        ctx.lineTo(wheelX + dx * scale, wheelY + dy * scale);
        ctx.moveTo(wheelX - 1.65, wheelY);
        ctx.arc(wheelX, wheelY, 1.65, 0, Math.PI * 2);
      }
      cx += dx;
      cy += dy;
    }
    ctx.strokeStyle = palette.arm;
    ctx.lineWidth = 1.05;
    ctx.stroke();
    cx = 0;
    cy = 0;
    ctx.beginPath();
    for (const term of chain.terms) {
      const phase = angle * term.frequency;
      const dx = term.real * Math.cos(phase) - term.imaginary * Math.sin(phase);
      const dy = term.real * Math.sin(phase) + term.imaginary * Math.cos(phase);
      if (term.frequency !== 0 && term.radius * scale > 1.25) {
        const wheelX = cx * scale + x;
        const wheelY = cy * scale + y;
        ctx.moveTo(wheelX + 1.15, wheelY);
        ctx.arc(wheelX, wheelY, 1.15, 0, Math.PI * 2);
      }
      cx += dx;
      cy += dy;
    }
    ctx.fillStyle = palette.hub;
    ctx.globalAlpha = alpha;
    ctx.fill();
    const tip = tipAt(chain, progress);
    ctx.beginPath();
    ctx.arc(tip.x * scale + x, tip.y * scale + y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = palette.tip;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawLightSweep(progress) {
    const center = -0.16 + progress * 1.32;
    const gradient = ctx.createLinearGradient(0, height, width, 0);
    const stops = [
      [center - 0.22, 'rgba(255, 250, 236, 0)'],
      [center - 0.12, 'rgba(255, 250, 236, .10)'],
      [center - 0.03, 'rgba(255, 252, 243, .36)'],
      [center + 0.03, 'rgba(255, 252, 243, .33)'],
      [center + 0.13, 'rgba(255, 250, 236, .10)'],
      [center + 0.22, 'rgba(255, 250, 236, 0)'],
    ];
    for (const [position, color] of stops) {
      gradient.addColorStop(Math.max(0, Math.min(1, position)), color);
    }
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  function draw(now) {
    if (document.visibilityState !== 'visible') { frame = 0; return; }
    if (!chains || !transform) { frame = requestAnimationFrame(draw); return; }
    const elapsed = (now - startedAt) / 1000;
    const progress = Math.min(elapsed / DRAW_SECONDS, 1);
    ctx.clearRect(0, 0, width, height);
    drawOutline(chains.building, progress, 0.9, colors);
    drawOutline(chains.stars, progress, 0.9, starColors);
    if (progress < 1) {
      drawWheels(chains.building, progress, 1, colors);
      drawWheels(chains.stars, progress, 1, starColors);
    } else {
      const afterDraw = elapsed - DRAW_SECONDS;
      const fadeProgress = Math.min(afterDraw / WHEEL_FADE_SECONDS, 1);
      if (fadeProgress < 1) {
        const wheelAlpha = 1 - fadeProgress * fadeProgress * (3 - 2 * fadeProgress);
        drawWheels(chains.building, 1, wheelAlpha, colors);
        drawWheels(chains.stars, 1, wheelAlpha, starColors);
      } else {
        const sweepProgress = (afterDraw - WHEEL_FADE_SECONDS) / LIGHT_SWEEP_SECONDS;
        if (sweepProgress < 1) {
          drawLightSweep(Math.max(0, sweepProgress));
        } else {
          ctx.clearRect(0, 0, width, height);
          drawOutline(chains.building, 1, 0.9, colors);
          drawOutline(chains.stars, 1, 0.9, starColors);
          animationComplete = true;
          frame = 0;
          return;
        }
      }
    }
    frame = requestAnimationFrame(draw);
  }

  async function initialize() {
    try {
      const response = await fetch('/assets/js/tiananmen_fourier_3072_final.svg?v=vertical-base-1');
      if (!response.ok) throw new Error('Could not load supplied Tiananmen outline');
      const source = new DOMParser().parseFromString(await response.text(), 'image/svg+xml').documentElement;
      const holder = document.createElement('div');
      holder.setAttribute('aria-hidden', 'true');
      holder.style.cssText = 'position:fixed;left:-10000px;top:0;width:932px;height:976px;visibility:hidden;pointer-events:none;';
      holder.append(source);
      document.body.append(holder);
      const buildingStrokes = collectStrokes(source, 'tiananmen-building');
      const starStrokes = collectStrokes(source, 'five-stars');
      if (buildingStrokes.length < 5 || starStrokes.length < 5) throw new Error('The supplied outline did not contain enough building and star paths');
      chains = { building: compile(buildingStrokes), stars: compile(starStrokes) };
      figure.dataset.pathSource = 'tiananmen_fourier_3072_final.zip';
      figure.dataset.harmonics = String(HARMONIC_COUNT);
      figure.dataset.chains = '2';
      holder.remove();
      resize();
      startedAt = performance.now();
      frame = requestAnimationFrame(draw);
    } catch (error) {
      console.error('Fourier animation could not initialize:', error);
    }
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !frame) frame = requestAnimationFrame(draw);
  });
  initialize();
})();
