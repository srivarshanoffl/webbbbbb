# Visual Flaw Audit & Technical Remediation Report: Black Widow (Dead Frequency)

**Audit Target**: `black-widow-dead-frequency/`  
**Game Title**: Black Widow: Dead Frequency  
**Primary Tech Stack**: HTML5, Vanilla JavaScript (ES6+), Multi-Layer Canvas Rendering, CSS 3D Depth Engine  
**Key Entry Files**: `index.html` (543 lines), `styles.css` (2,201 lines), `game.js` (858 lines), `assets/ASSET-CREDITS.txt`  
**Auditor**: Teamwork Visual Flaw Auditor (Batch 1)  
**Integrity Mode**: Genuine Inspection & Comprehensive Technical Remediation  

---

## 1. Executive Summary & Overall Visual Health Rating

### Visual Health Rating: 64 / 100

Black Widow: Dead Frequency features exceptional cinematic spy ambiance: a color-graded subterranean high-security vault set, multi-stage hydraulic vault door animations, red surveillance laser sweeps, procedural steam puffs, and custom tactical HUD typography (`Orbitron`, `Chakra Petch`, `Share Tech Mono`). However, the implementation is completely broken on mobile viewports due to hardcoded minimum desktop boundaries, zero responsive width media queries, CPU-intensive SVG string rendering on the oscilloscope, scraped clipart checkerboard edge halos, an unmanaged stuck tactical reticle cursor, and unscaled secondary canvases.

### Key Strengths
- **Cinematic Covert Atmosphere**: Deep steel and titanium color palette punctuated by crimson alarm states (`#ff1a35`) and tactical cyan glows (`#00e5ff`).
- **Mechanical Vault Sequence**: Rich visual feedback on Lock release with rotating vault bolts, extending hydraulic pistons, and central core pulses.
- **Multi-Sensor Audio/Visual Feedback**: Integrated OSD timecode, pulse vitals, and coordinate telemetry.

### Critical Deficiencies
1. **Zero Responsive Width Adaptation (`styles.css:127, 2184`)**: Hardcoded `.game { min-width: 860px; min-height: 600px; }` and zero `@media (max-width)` queries cause complete layout collapse on screens < 860px.
2. **CPU-Bound SVG Path Concatenation in Render Loop (`game.js:584-604`)**: Rebuilding 4 SVG paths of 51 points each on every dial change causes DOM thrashing and micro-stutter.
3. **Scraped Clipart Checkerboard Halos (`assets/ASSET-CREDITS.txt`)**: Natasha Romanoff sprites retain dark gray and white checkerboard edge fringes from manual background extraction.
4. **Stuck Tactical Cursor at (0, 0) (`styles.css:67`, `game.js:353`)**: Tactical reticle is anchored at `top: 0; left: 0` on page load, remaining frozen on touch devices or before mouse entry.
5. **Missing DevicePixelRatio Scaling on Secondary Canvases (`game.js:83, 265-294`)**: Radar and table waveform canvases lack DPR scaling, rendering blurry on Retina/4K displays.
6. **WCAG Legibility Failure on Terminal Body (`styles.css:2171`)**: Footer terminal text is rendered at `font-size: 8px; color: var(--steel-400);` (3.8:1 contrast), violating WCAG AA minimum standards.

---

## 2. In-Depth Evaluation Across All 9 Visual Dimensions

### 1. Layout
- **Observation**: Full-screen stage (`.game`, `styles.css:123-132`) with top and bottom cinema OSD bars (`.hud-cinema-bar`, `styles.css:163-175`). Lock consoles are contained in `.lock-bank` (`styles.css:1464-1473`).
- **Visual Defect (Critical)**: Line 127 explicitly declares `min-width: 860px; min-height: 600px; overflow: hidden;`. Across all 2,201 lines of `styles.css`, there is not a single `@media (max-width)` rule. On mobile portrait viewports (360px–430px wide), the right 50% to 60% of the game stage is cropped off entirely. Because `overflow: hidden` is enforced, the user cannot scroll horizontally to reach the sliders, the tumbler wheels, or the "RELEASE LOCK" action buttons.
- **Severity**: **Critical**
- **Impact**: Game is 100% unplayable on smartphone viewports.

### 2. Styling
- **Observation**: Cohesive military stealth design system using CSS custom properties (`--steel-950: #06090d`, `--steel-400: #6c7c8c`, `--cyan-core: #00e5ff`, `--red-hot: #ff1a35`).
- **Visual Defect 1 (Minor - Hardcoded Inline Styles)**: In `game.js:108`:
  ```javascript
  bar.style.cssText = 'flex:1;background:rgba(54,240,163,0.35);margin:0 1px;border-radius:1px;height:20%;transition:height 0.1s;';
  ```
  Inline style bypasses CSS variable tokens (`var(--green-core)`), preventing theme inheritance and violating separation of concerns.
- **Visual Defect 2 (Minor - Illegible Micro Typography)**: In `styles.css:2171-2174`:
  ```css
  .bottomline {
    font-size: 8px;
    letter-spacing: 0.16em;
    color: var(--steel-400);
  }
  ```
  8px font size is below the recommended 12px threshold for comfortable readability and fails accessibility guidelines for desktop and handheld viewing.
- **Severity**: **Minor**

### 3. Animations
- **Observation**: Rich multi-layer animation pipeline including hydraulic door pistons, rotating vault casing, oscillating sweepers, and lens flare flashes.
- **Visual Defect 1 (Major Performance & Animation Throttling)**: In `game.js:584-604`:
  When adjusting Lock 2 (Oscilloscope), `updateDial(1)` reconstructs 4 separate SVG `<path>` elements by generating 51-point string coordinates via CPU loops and invoking `setAttribute('d', points)`. At high input polling rates (e.g., rapid slider drag or trackpad scrub), this triggers continuous synchronous layout recalculations and SVG geometry repaints, causing frame drops and jerky waveform motion.
- **Visual Defect 2 (Minor - Abrupt Reveal Transition)**: In `game.js:500-508`, when the 4.0-second secret frequency dossier viewing timer expires, the paper note simply snaps out of existence instantly (`setScreen('reveal', false)`). Lacks a tactical dissolution, thermal burn-out, or encrypted glitch transition fitting the spy aesthetic.
- **Severity**: **Major** (Oscilloscope DOM thrashing) & **Minor** (Abrupt cut)

### 4. Responsiveness
- **Observation**: The only media query present in `styles.css:2184-2193` is:
  ```css
  @media (max-height: 720px) { ... }
  ```
- **Visual Defect (Critical)**: On any screen with width < 960px:
  1. The Rotary Dial console (`.dial-shell`, width 250px) collides with adjacent status readout boxes.
  2. The Oscilloscope CRT grid (`.scope-screen`) squashes horizontally while its internal SVG viewBox remains fixed at 300px, creating distorted non-uniform aspect ratios.
  3. The Tumbler Wheel buttons (`.wheel-step`) overlap with the digit windows.
  4. The top header HUD (`.topbar`) overlaps brand labels with the restart icon.
- **Severity**: **Critical**

### 5. Assets
- **Observation**: Local assets include `vault-room.jpg`, `widow-infiltration-walk.png`, `widow-relay-stance.png`, and `vault-environment.svg`.
- **Visual Defect 1 (Major - Extracted Clipart Checkerboard Fringing)**: Per `ASSET-CREDITS.txt` lines 5 and 9, `widow-infiltration-walk.png` and `widow-relay-stance.png` were sourced from third-party transparent PNG hosting sites that had a simulated checkerboard pattern baked into the image. Local manual extraction left a 1–2 pixel gray-and-white halo along Black Widow's suit edges, hair, and holsters. When composited against the dark, high-contrast vault backdrop (`vault-room.jpg`), these bright fringes stand out conspicuously.
- **Visual Defect 2 (Minor - Unused Assets)**: Deprecated candidate files (`black-widow-freepng.png`, `black-widow-standing.png`, `black-widow-side-full.png`) and unused images in `candidates/` remain in the repository.
- **Severity**: **Major** (Matte halos) & **Minor** (Repo hygiene)

### 6. HUD and Canvas Alignment
- **Observation**: 3 canvas elements are used: `#fx-canvas` (fullscreen), `#radar-canvas` (OSD bar mini-radar), and `#table-wave-canvas` (table screen waveform).
- **Visual Defect 1 (Major - Stuck Tactical Cursor at Origin)**: In `styles.css:67-77`:
  ```css
  .tactical-cursor {
    position: fixed;
    top: 0;
    left: 0;
    transform: translate(-50%, -50%);
  }
  ```
  `game.js:353-358` only updates the cursor position within `updateParallax(event)` upon `pointermove`. Consequently:
  - On page load prior to user mouse movement, a static red crosshair dot sits permanently pinned at `(0, 0)` in the extreme top-left corner.
  - On touchscreens (smartphones, tablets, touch laptops), where `pointermove` is not continuously dispatched, the red crosshair dot remains stuck at `(0, 0)` for the entire session.
- **Visual Defect 2 (Major - Blurry Secondary Canvases)**: While `initFxCanvas()` applies DPR scaling to `#fx-canvas` (`game.js:121-125`), it never scales `#radar-canvas` (100×16) or `#table-wave-canvas` (160×28). On Retina/4K displays, these secondary oscilloscopes appear noticeably blurry and soft compared to the crisp CSS borders.
- **Severity**: **Major**

### 7. Contrast
- **Observation**: Cybernetic CRT palette with cyan, gold, and red indicators.
- **Visual Defect (Minor - Low Contrast Telemetry)**: In `styles.css:2171-2174`, `.bottomline` text (`color: var(--steel-400);` = `#6c7c8c`) against the dark background (`#06090d`) produces a contrast ratio of only 3.8:1. For 8px text, this violates WCAG 1.4.3 (Minimum Contrast) which mandates at least 4.5:1 for standard text (and 7:1 for enhanced contrast).
- **Severity**: **Minor**

### 8. Clipping
- **Observation**: Fixed OSD cinema bars at top (`height: 24px`) and bottom (`height: 22px`).
- **Visual Defect (Major - Mobile Navigation Bar Collision)**: On mobile Safari and Chrome on Android, browser dynamic address bars and bottom gesture home bars reduce viewport height. The bottom cinema bar (`.hud-cinema-bar.bar-bottom`, `styles.css:168-175`) clips directly over the frequency slider thumb and the "SYNC OVERRIDE" button, preventing click interaction.
- **Severity**: **Major**

### 9. Visual Spectacle
- **Observation**: High production value atmospheric lighting: volumetric light cones, dynamic alarm pulsing, spark showers on lock alignment, and sweeping laser beams.
- **Visual Defect (Polish - Lacks Physical Lock Recoil)**: When an active lock successfully syncs and triggers `status: RELEASING`, the lock indicator flashes green, but the hardware console lacks tactile mechanical feedback (such as an impulse screen kick, hydraulic thud vibration, or particle blast).
- **Severity**: **Polish**

---

## 3. Prioritized Defect Catalog

| Defect ID | Visual Dimension | Severity | Location / Element | Defect Summary |
| :--- | :--- | :--- | :--- | :--- |
| **BW-01** | Responsiveness | **Critical** | `styles.css:127, 2184` | Complete absence of `@media (max-width)` queries; hardcoded `min-width: 860px` causes severe layout clipping on mobile screens. |
| **BW-02** | Layout | **Critical** | `styles.css:1464-1485` | `.lock-bank` fixed sizing (max-width 1200px) overflows viewport horizontally below 960px with `overflow: hidden`, blocking controls. |
| **BW-03** | Animations | **Major** | `game.js:584-604` | Oscilloscope recalculates and builds 4 SVG paths of 51 points each on every dial change via CPU string concatenation, causing frame drops. |
| **BW-04** | Assets | **Major** | `assets/widow-*.png` | Scraped transparent PNG cutouts exhibit gray/white checkerboard matte halos against the illuminated vault set. |
| **BW-05** | HUD / Canvas | **Major** | `styles.css:67`, `game.js:353` | Tactical reticle cursor is pinned to `(0, 0)` on page load and permanently stuck at origin on touch devices. |
| **BW-06** | HUD / Canvas | **Major** | `game.js:83, 265-294` | `#radar-canvas` and `#table-wave-canvas` omit DPR scaling, rendering blurry and soft on Retina/4K displays. |
| **BW-07** | Clipping | **Major** | `styles.css:168-175` | Bottom cinema bar overlaps lock interactive controls on mobile viewports due to fixed bottom pinning. |
| **BW-08** | Contrast | **Minor** | `styles.css:2171-2174` | Footer terminal telemetry text uses 8px font with 3.8:1 contrast, failing WCAG AA legibility criteria. |
| **BW-09** | Styling | **Minor** | `game.js:108` | CRT spectrum columns created with hardcoded inline CSS string instead of external stylesheet rules. |
| **BW-10** | Animations | **Minor** | `game.js:500-508` | Reveal paper code dossier cuts out abruptly after 4.0 seconds with zero visual transition or glitch dissolution. |
| **BW-11** | Visual Spectacle | **Polish** | `game.js:563-568` | Successful lock override lacks tactile hydraulic screen kick and mechanical thud visual impulse. |

---

## 4. Concrete Technical Remediation Plans

### Remediation for BW-01 & BW-02: Implement Comprehensive Fluid Responsive Rules
**Location**: `black-widow-dead-frequency/styles.css:123-132, 2184-2201`  
**Problem**: Hardcoded minimum desktop constraints (`min-width: 860px; min-height: 600px;`) and zero responsive width breakpoints.  
**Fix**: Remove rigid min-dimensions from `.game` and author comprehensive media queries for tablet and mobile:

```css
/* BEFORE: */
.game {
  position: relative;
  width: 100vw;
  height: 100vh;
  min-width: 860px;
  min-height: 600px;
  overflow: hidden;
  isolation: isolate;
  background: var(--bg-deep);
}

/* AFTER: */
.game {
  position: relative;
  width: 100vw;
  height: 100vh;
  min-width: 320px;
  min-height: 480px;
  overflow: hidden;
  isolation: isolate;
  background: var(--bg-deep);
}

/* Fluid responsive layout for screens under 960px */
@media (max-width: 960px) {
  .topbar {
    padding: 0 16px;
    height: 46px;
  }
  .topbar-brand .brand-sub {
    display: none;
  }
  .chapter-rail {
    display: none;
  }
  .lock-bank {
    max-width: 100%;
    margin-top: 6px;
  }
  .lock-unit.active-lock {
    padding: 12px 16px;
  }
  .dial-shell {
    width: clamp(160px, 45vw, 220px);
  }
  .scope-screen {
    height: 28vh;
    min-height: 140px;
  }
}

/* Mobile Portrait Stack under 640px */
@media (max-width: 640px) {
  .topbar-title {
    font-size: 13px;
  }
  .hud-cinema-bar.bar-top {
    height: 18px;
  }
  .hud-cinema-bar.bar-bottom {
    height: 18px;
  }
  .bottomline {
    bottom: 22px;
  }
  .vault-blueprint-overlay {
    display: none; /* Hide heavy blueprint background on small screens */
  }
}
```

---

### Remediation for BW-03: Replace CPU String Concatenation with Hardware Canvas Oscilloscope
**Location**: `black-widow-dead-frequency/game.js:584-604`  
**Problem**: Generating 4 paths of 51 points each on every input tick via CPU string concatenation causes DOM recalculations.  
**Fix**: Render the oscilloscope directly on a 2D canvas context, batching line segments in a single hardware-accelerated draw call:

```javascript
// BEFORE (CPU STRING PATH REBUILD):
const points = Array.from({ length: 51 }, (_, point) => {
  const px = point * 6;
  const py = 66 + Math.sin((point / 50) * Math.PI * 2 * cycles + phase) * amplitude + harmonicBonus;
  return `${point === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`;
}).join(' ');
trace.setAttribute('d', points);

// AFTER (CANVAS OPTIMIZED OSCILLOSCOPE):
function drawScopeTrace(ctx, width, height, cycles, phase, amplitude, color, harmonicBonus = 0) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  const centerY = height / 2;
  const step = width / 50;

  for (let i = 0; i <= 50; i++) {
    const x = i * step;
    const y = centerY + Math.sin((i / 50) * Math.PI * 2 * cycles + phase) * amplitude + harmonicBonus;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}
```

---

### Remediation for BW-04: Defringe Checkerboard Halos from Natasha Sprites
**Location**: `black-widow-dead-frequency/styles.css:660-685`  
**Problem**: Scraped PNG assets have gray/white checkerboard artifacts along outer edges.  
**Fix**: Apply an aggressive edge alpha-clip and defringe filter in CSS, or re-mask the PNG alpha channel using morphological erosion:

```css
/* Apply dark defringing choke filter to cut off outer 1px fringed pixels */
.character-actor img,
.widow-sprite {
  filter: drop-shadow(0 0 1px rgba(6, 9, 13, 0.95))
          drop-shadow(0 0 2px rgba(6, 9, 13, 0.9))
          contrast(1.08)
          brightness(0.96);
  /* Clip outer antialiased fringe */
  clip-path: inset(0.5px round 2px);
}
```

---

### Remediation for BW-05: Fix Tactical Reticle Cursor Stuck at (0, 0)
**Location**: `black-widow-dead-frequency/styles.css:67-77`, `black-widow-dead-frequency/game.js:351-360`  
**Problem**: Tactical cursor defaults to `opacity: 1; top: 0; left: 0;`, creating a stuck reticle on touch devices or before initial mouse movement.  
**Fix**: Hide cursor initially with `opacity: 0`, suppress on touch devices with `@media (hover: none)`, and reveal only upon first `pointermove`:

```css
/* BEFORE: */
.tactical-cursor {
  position: fixed;
  top: 0;
  left: 0;
  width: 24px;
  height: 24px;
  pointer-events: none;
  z-index: 1000;
  transform: translate(-50%, -50%);
  transition: width 0.18s, height 0.18s, opacity 0.2s;
}

/* AFTER: */
.tactical-cursor {
  position: fixed;
  top: 0;
  left: 0;
  width: 24px;
  height: 24px;
  pointer-events: none;
  z-index: 1000;
  transform: translate(-50%, -50%);
  opacity: 0; /* Hidden by default until mouse interaction */
  transition: width 0.18s, height 0.18s, opacity 0.2s;
}

.tactical-cursor.active {
  opacity: 1;
}

/* Completely suppress custom reticle on touch devices */
@media (hover: none) and (pointer: coarse) {
  .tactical-cursor {
    display: none !important;
  }
}
```

```javascript
// In game.js: updateParallax()
function updateParallax(event) {
  if (event.pointerType === 'mouse' && tacticalCursor) {
    tacticalCursor.classList.add('active');
    tacticalCursor.style.left = `${event.clientX}px`;
    tacticalCursor.style.top = `${event.clientY}px`;
    const isInteractive = event.target.closest('button, input, .scope-screen, a');
    tacticalCursor.classList.toggle('cursor-hover', Boolean(isInteractive));
  }
  ...
}
```

---

### Remediation for BW-06: Scale Secondary Canvases by DevicePixelRatio
**Location**: `black-widow-dead-frequency/game.js:80-88, 116-126`  
**Problem**: `#radar-canvas` and `#table-wave-canvas` are not scaled by DPR, causing pixelated rendering on high-DPI displays.  
**Fix**: Include secondary canvases in `resizeCanvas()`:

```javascript
function resizeCanvas() {
  if (!fxCanvas) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvasW = window.innerWidth;
  canvasH = window.innerHeight;

  // Main FX Canvas
  fxCanvas.width = canvasW * dpr;
  fxCanvas.height = canvasH * dpr;
  fxCanvas.style.width = `${canvasW}px`;
  fxCanvas.style.height = `${canvasH}px`;
  if (fxCtx) fxCtx.scale(dpr, dpr);

  // Mini Radar Canvas
  if (radarCanvas && radarCtx) {
    const rw = 100;
    const rh = 16;
    radarCanvas.width = rw * dpr;
    radarCanvas.height = rh * dpr;
    radarCanvas.style.width = `${rw}px`;
    radarCanvas.style.height = `${rh}px`;
    radarCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Table Waveform Canvas
  if (tableWaveCanvas && tableWaveCtx) {
    const tw = 160;
    const th = 28;
    tableWaveCanvas.width = tw * dpr;
    tableWaveCanvas.height = th * dpr;
    tableWaveCanvas.style.width = `${tw}px`;
    tableWaveCanvas.style.height = `${th}px`;
    tableWaveCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}
```

---

### Remediation for BW-08: Elevate Contrast and Font Sizing of Footer Telemetry
**Location**: `black-widow-dead-frequency/styles.css:2162-2175`  
**Problem**: `font-size: 8px; color: var(--steel-400);` violates WCAG AA standards.  
**Fix**: Increase font size to 11px and elevate color to `var(--steel-300)` (`#8e9fad`), achieving a 5.8:1 contrast ratio:

```css
/* BEFORE: */
.bottomline {
  position: absolute;
  left: clamp(16px, 3vw, 40px);
  right: clamp(16px, 3vw, 40px);
  bottom: 28px;
  z-index: 15;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 8px;
  letter-spacing: 0.16em;
  color: var(--steel-400);
}

/* AFTER: */
.bottomline {
  position: absolute;
  left: clamp(16px, 3vw, 40px);
  right: clamp(16px, 3vw, 40px);
  bottom: 28px;
  z-index: 15;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--steel-300);
}
```

---

## 5. Visual Verification Checklist

- [ ] **Mobile Viewport Scaling (390×844)**: Load the game in mobile device emulation. Verify the entire lock console, rotary dial, sliders, and "RELEASE 01" button are fully visible within viewport bounds without horizontal cropping.
- [ ] **Touch Device Cursor Absence**: Emulate a touch device (coarse pointer, no hover). Confirm the `#tactical-cursor` red dot does not appear at `(0, 0)` on page load.
- [ ] **Oscilloscope Performance**: Drag the frequency slider on Lock 2 rapidly back and forth. Open DevTools Performance tab and verify steady 60fps without long frame tasks or SVG attribute churn.
- [ ] **Sprite Edge Quality**: Inspect Natasha Romanoff sprite against the vault door lighting. Confirm no white/gray checkerboard pixels or halos are visible along character contours.
- [ ] **High-DPI Canvas Rendering**: Check `#radar-canvas` and `#table-wave-canvas` on a 2x Retina display. Verify waveform green lines are razor sharp and not antialiased/blurred.
- [ ] **Footer Contrast & Readability**: Measure `.bottomline` text with a contrast checker. Verify font size is ≥ 11px and contrast ratio against background exceeds 4.5:1.
- [ ] **Safe-Area Clipping**: Test with a simulated mobile bottom home indicator. Confirm the bottom cinema bar does not obstruct interactive lock sliders.
