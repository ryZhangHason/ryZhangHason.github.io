---
layout: single
title: "Pixel Cat Preview"
permalink: /pixel-cat-preview/
author_profile: false
---

<style>
.cat-preview-shell {
  max-width: 980px;
  margin: 0 auto;
}

.cat-preview-hero {
  padding: 28px 32px;
  border: 1px solid #ecd7be;
  border-radius: 20px;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.9), transparent 42%),
    linear-gradient(135deg, #fff6ec 0%, #ffe8d0 52%, #fffaf4 100%);
  box-shadow: 0 18px 40px rgba(125, 74, 24, 0.12);
}

.cat-preview-hero p {
  max-width: 56rem;
  margin-bottom: 0;
}

.cat-preview-stage {
  position: relative;
  margin-top: 28px;
  min-height: 540px;
  border: 2px solid #efcfaa;
  border-radius: 24px;
  overflow: hidden;
  background:
    linear-gradient(to bottom, rgba(255, 255, 255, 0.65), rgba(255, 248, 238, 0.9)),
    repeating-linear-gradient(
      0deg,
      rgba(236, 202, 164, 0.18) 0,
      rgba(236, 202, 164, 0.18) 1px,
      transparent 1px,
      transparent 32px
    ),
    repeating-linear-gradient(
      90deg,
      rgba(236, 202, 164, 0.18) 0,
      rgba(236, 202, 164, 0.18) 1px,
      transparent 1px,
      transparent 32px
    ),
    linear-gradient(180deg, #fffdf9 0%, #ffeedd 100%);
}

.cat-preview-note {
  position: absolute;
  top: 22px;
  left: 26px;
  max-width: 350px;
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(201, 147, 85, 0.28);
  color: #70431c;
  backdrop-filter: blur(6px);
}

.cat-preview-note strong {
  display: block;
  margin-bottom: 6px;
}

.cat-preview-cat {
  position: absolute;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  filter: drop-shadow(0 12px 14px rgba(138, 74, 32, 0.18));
}

.cat-preview-cat--edge {
  top: 18px;
  right: 120px;
  width: 144px;
}

.cat-preview-cat--large {
  right: 64px;
  bottom: 58px;
  width: 320px;
}

.cat-preview-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 18px;
}

.cat-preview-chip {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(201, 147, 85, 0.3);
  color: #8a4a20;
  font-size: 0.92rem;
}

@media (max-width: 900px) {
  .cat-preview-stage {
    min-height: 440px;
  }

  .cat-preview-cat--large {
    width: 240px;
    right: 24px;
  }

  .cat-preview-cat--edge {
    width: 116px;
    right: 48px;
  }
}
</style>

<div class="cat-preview-shell">
  <div class="cat-preview-hero">
    <p>This is a first sprite pass for the laptop version: a light-orange pixel cat with a soft cream face and a simple sitting pose. I staged it in a fake desktop window so you can judge the proportions, color, and overall vibe before we build the edge-walking behavior.</p>
    <div class="cat-preview-chip-row">
      <span class="cat-preview-chip">Palette: light orange</span>
      <span class="cat-preview-chip">Style: crisp pixel art</span>
      <span class="cat-preview-chip">Next step: edge-walk animation</span>
    </div>
  </div>

  <div class="cat-preview-stage">
    <div class="cat-preview-note">
      <strong>Preview target</strong>
      Laptop-first sizing, with one smaller edge-scale cat and one enlarged sprite so you can inspect the pixel design.
    </div>

    <img class="cat-preview-cat cat-preview-cat--edge" src="/images/pixel-cat.svg" alt="Light orange pixel art cat">
    <img class="cat-preview-cat cat-preview-cat--large" src="/images/pixel-cat.svg" alt="Enlarged light orange pixel art cat">
  </div>
</div>
