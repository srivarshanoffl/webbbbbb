# Visual Flaw Audit & Technical Remediation: Wanda (The Portal Awakening)

**Target Game**: `wanda/` (Wanda – The Portal Awakening | 2.5D Mystical Experience)  
**Entry Point**: `wanda/index.html`  
**Auditor**: Teamwork Visual Quality Specialist (`worker_batch4`)  
**Date**: 2026-11-08  
**Audit Standard**: 9-Dimension Visual Quality Rubric (Critical, Major, Minor, Polish)  

---

## 1. Executive Summary & Overall Visual Health Rating

### Overall Visual Health Rating: 54 / 100

| Metric | Score | Assessment |
| :--- | :---: | :--- |
| **Aesthetic Cohesion** | 58 / 100 | High cinematic ambition and intricate Elder Futhark SVG runes, but crippled by an unmasked bounding box on Wanda and overwhelming crimson monochrome saturation. |
| **Responsive Stability** | 35 / 100 | Critical failure on screens < 850px; fixed pixel offsets (`calc(50% ± 390px)`) push interactive relics completely offscreen, breaking the gameplay progression. |
| **Animation Quality** | 62 / 100 | Smooth 6-phase CSS 3D camera choreography, but hand flares drift from mudra hand positions and Phase 4 freezes abruptly without particle easing. |
| **HUD & Viewport Integration** | 50 / 100 | Duplicate DOM hand-flare nodes; developer test scaffolding ("ERROR CODE: 003 / BYPASS FOR TESTING") shatters mystical Marvel immersion. |
| **Asset Fidelity** | 55 / 100 | High-resolution photorealistic relic WebP cutouts, but `wanda_meditation.webp` has near-black bounding background that glows as a harsh rectangular box. |
| **Technical Architecture** | 52 / 100 | Severe CSS syntax errors in `.ambient-godrays` (malformed `repeating-linear-gradient` missing comma, duplicate keyframes, duplicate properties). |

### Executive Summary
`wanda/` presents a visually ambitious 2.5D hybrid experience featuring Wanda Maximoff (the Scarlet Witch) floating in deep meditation at the center of an Elder Futhark runic sanctum. The experience orchestrates dynamic 3D camera perspectives across six distinct progression phases (`cam-phase-1` through `cam-phase-6`), interactive telekinetic relic assemblies, and canvas-based ambient particle and lightning effects. However, its visual execution is undermined by two critical defects: an unmasked, near-black rectangular bounding background on `wanda_meditation.webp` that produces a glaring glowing box around Wanda's silhouette, and hardcoded pixel offsets (`calc(50% - 390px)`) that push interactive relics entirely off the viewport on screens narrower than 850px. Furthermore, the stylesheet contains fatal CSS syntax errors in `.ambient-godrays` that invalidate volumetric lighting, the scene suffers from monochromatic crimson fatigue, and Phase 4 resorts to an immersion-breaking developer error box with a "BYPASS FOR TESTING" button.

---

## 2. Comprehensive Evaluation Across the 9 Visual Dimensions

### 2.1 Layout
- **Offscreen Relic Pushing on Sub-850px Viewports**: In `wanda/css/style.css:636-676`, the three floating interactive relics are positioned using hardcoded pixel offsets from `50%`:
  ```css
  #object-crystal {
    left: calc(50% - 390px);
    top: calc(50% - 150px);
  }
  #object-ring {
    left: calc(50% + 220px);
    top: calc(50% - 140px);
  }
  #object-artifact {
    left: calc(50% + 180px);
    top: calc(50% + 120px);
  }
  ```
  On a standard tablet or narrow mobile screen (e.g. 768px width), `calc(50% - 390px)` evaluates to `384px - 390px = -6px`, pushing the crystal off the left screen edge. On an iPhone viewport (375px), `187.5px - 390px = -202.5px`, placing the crystal **over 200px entirely offscreen to the left**, while the ring (`187.5px + 220px = 407.5px`) is pushed **32.5px offscreen to the right**. Neither relic can be seen, clicked, or interacted with.
- **2.5D Viewport & Camera Phase Structure**: The 3D stage (`#world-stage`, `wanda/css/style.css:58-87`) applies perspective camera offsets for phases 1 to 6. While desktop framing is well-centered, on mobile portrait orientations (e.g. 390x844), camera translation `translateX(-180px)` in Phase 2 moves Wanda almost completely out of view, while the telekinetic cradle UI covers the remaining viewport.
- **Ground Array Scaling**: The runic ground disc (`.mystic-ground`, `wanda/css/style.css:292-311`) is set to a rigid `1550px x 1550px`. On ultra-wide displays (> 1920px), the disc appears miniature, while on narrow laptop screens, its circular boundary creates jarring angular intersections with the bottom of the viewport.

### 2.2 Styling
- **Fatal CSS Syntax Errors in `.ambient-godrays`**:
  In `wanda/css/style.css:259-270`, the `repeating-linear-gradient` property is malformed:
  ```css
  background: repeating-linear-gradient(
    115deg,
    rgba(255, 30, 80, 0.04) 0px,
    rgba(255, 30, 80, 0.04) 40px,
    transparent 60px,
    transparent 140px
    118deg,
    rgba(255, 30, 80, 0.05) 0px,
    rgba(255, 30, 80, 0.05) 45px,
    transparent 70px,
    transparent 150px
  );
  ```
  **Direct Defect**: Line 264 ends with `transparent 140px` without a terminating comma, followed immediately by `118deg,` on line 265. Because two angles (`115deg` and `118deg`) are combined without valid CSS gradient stop syntax, **the entire `background` property is discarded by CSS parsers in Chrome, Firefox, and Safari**.
  Additionally, lines 271-279 feature duplicate contradictory declarations in the exact same rule:
  ```css
  filter: blur(16px);
  opacity: 0.8;
  animation: godRaysDrift 18s ease-in-out infinite alternate;
  transform: translateZ(-200px);
  filter: blur(20px);         /* Overrides line 271 */
  opacity: 0.85;              /* Overrides line 272 */
  animation: godRaysDrift 20s;/* Overrides line 273 */
  transform: translateZ(-220px); /* Overrides line 274 */
  ```
  Furthermore, `@keyframes godRaysDrift` (lines 281-286) contains duplicate `0%` and `100%` blocks.
- **Monochromatic Crimson Visual Wash**:
  The entire color scheme is drenched in crimson and scarlet (`--chaos-red: #ff103f;`, `--chaos-scarlet: #e50938;`, `--chaos-glow: #ff2a5f;`, `--chaos-crimson: #a00020;`). The background nebula, ambient godrays, monolith runes, 16 ground runes, energy ripples, Wanda's aura, hand flares, relic glows, and HUD borders all emit the same 620nm–650nm red wavelengths. This eliminates visual hierarchy and causes rapid ocular fatigue.

### 2.3 Animations
- **Hand Flare Mudra Drift**:
  In `wanda/css/style.css:572-579`, mudra flares are fixed at `.hand-flare.left-hand { top: 322px; left: 16px; }` and `.hand-flare.right-hand { top: 322px; right: 16px; }` inside `#wanda-container`. While `wandaLevitate` animates `#wanda-container` vertically by 26px (`translateY(-26px)`), the hand flares stay fixed to the container bounds. However, because `wanda-crest-svg` and `chaos-silk` animate on different sinusoidal curves and scaling factors, the plasma cores visually drift away from Wanda's mudra fingertips during peak levitation.
- **Abrupt Phase 4 Glitch Halt**:
  In `wanda/js/game.js:701-705`, transitioning into Phase 4 suddenly freezes artifact animation via `.glitch-freeze` with no deceleration curve, easing, or sound-synced mystic dissipation, feeling like a browser frame freeze rather than a scripted magical anomaly.
- **Phase Tracker Jump Snapping**:
  The phase indicator pills in the header allow jumping directly between phases (`wanda/js/game.js:106-113`). Rapidly clicking through phases 1 &rarr; 3 &rarr; 5 causes `#world-stage` 3D rotations to snap abruptly because pending CSS transitions are cut off without velocity blending.

### 2.4 Responsiveness
- **Complete Relic Disappearance on Mobile**:
  On viewports under 850px, `#object-crystal` is pushed off the left screen boundary and `#object-ring` off the right screen boundary due to `left: calc(50% - 390px)` and `left: calc(50% + 220px)`. The user cannot progress through Phase 1 or click the ancient crystal to begin Phase 2.
- **Phase 2 UI Occlusion on Mobile Landscape**:
  In Phase 2, the telekinetic cradle builder `#alignment-widget` occupies the bottom center. On short screens (height < 600px), the widget height (140px) combined with the header (65px) leaves only 190px of visible viewport height, completely occluding Wanda's torso and the glowing crystal.
- **Absence of Responsive Viewport Scaling**:
  While `@media (max-width: 760px)` (`wanda/css/style.css:1549-1566`) reduces font sizes in `#alignment-widget`, it contains zero rules adjusting `#object-crystal`, `#object-ring`, `#object-artifact`, or `#wanda-container`, leaving the core 3D scene completely unresponsive.

### 2.5 Assets
- **Critical Asset Defect: Glowing Rectangular Bounding Box on `wanda_meditation.webp`**:
  `wanda/assets/wanda_meditation.webp` is the central character asset. The image contains near-black, non-transparent pixels in the space surrounding Wanda's head, shoulders, and crossed legs. When CSS `drop-shadow` is applied in `wanda/css/style.css:549-551`:
  ```css
  filter: 
    drop-shadow(0 0 24px rgba(255, 16, 63, 0.6)) 
    drop-shadow(0 0 55px rgba(229, 9, 56, 0.35));
  ```
  The browser applies the drop-shadow filter to the outer rectangular boundary of the non-transparent image canvas rather than Wanda's organic body contours. In all phases, a harsh glowing crimson rectangular box is clearly etched around Wanda's head, upper arms, and lap against the red sanctum and circular portal vortex.
- **Immersion-Breaking Phase 4 Developer Scaffolding**:
  In Phase 4, the game displays `#error-modal` (`wanda/index.html:374-400`):
  ```html
  <div class="error-code">ERROR CODE: 003</div>
  <div class="error-title">MAGIC INSTABILITY DETECTED</div>
  <div class="debug-code-preview">
    // Anomaly trace: Memory address 0x7F4A desynchronized
    // Ready for external DevTools debugging module integration.
  </div>
  <button id="bypass-btn" class="bypass-btn">BYPASS FOR TESTING</button>
  ```
  This developer test harness completely shatters narrative immersion, substituting an authentic Marvel mystical crisis with dummy software error logs and a test bypass button.
- **Temporary Test Asset Bloat**:
  The directory contains lingering test and intermediate image cutouts (`test_no_crest_box.png`, `orig_face.png`, `head_clean_v1.png`, `head_inspect_box.png`, `isolate_no_inner.png`, `isolate_no_rect.png`), reflecting uncleaned development debris.

### 2.6 HUD and Canvas Alignment
- **Duplicate DOM Hand-Flare Nodes**:
  In `wanda/index.html:208-223`, duplicate `.hand-flare` elements are declared consecutively:
  ```html
  <!-- Lines 209-210: Empty duplicate flares -->
  <div class="hand-flare left-hand"></div>
  <div class="hand-flare right-hand"></div>

  <!-- Lines 216-223: Actual flare containers with plasma cores -->
  <div class="hand-flare left-hand">
    <div class="hand-plasma-core"></div>
    <div class="hand-plasma-orbit"></div>
  </div>
  <div class="hand-flare right-hand">
    <div class="hand-plasma-core"></div>
    <div class="hand-plasma-orbit"></div>
  </div>
  ```
  The empty divs in lines 209-210 create duplicate stacking contexts with blur filters directly over the plasma core flares.
- **Phase 5 Lightning Coordinate Misalignment**:
  In Phase 5 (`wanda/js/game.js:763-780`), lightning arcs are drawn on `#lightning-canvas` using `getBoundingClientRect()` of `#object-crystal`, `#object-ring`, and `#object-artifact`. Because `#world-stage` applies 3D perspective rotation (`rotateX`, `rotateY`, `translateZ`), during camera transitions the 2D canvas coordinates temporarily misalign with the 3D-projected relic centers, causing lightning bolts to terminate in empty space next to the floating relics.

### 2.7 Contrast
- **Total Monochromatic Crimson Saturation**:
  All visual elements share the same red/pink hue spectrum:
  - Background: `#070308` with radial red `#20040f`
  - Sanctum Monoliths: `#1b050c` with red rune glow (`#ff6699`)
  - Ground Array: `#ff103f`, `#90001c`, `#3a000b`
  - Floating Relics: red aura filters
  - Hand Flares: `#ff2a5f`
  Interactive elements fail to stand out from background scenery. Introducing warm golden amber accents (`#f5c542`) and deep twilight violet (`#4a0072`) to background layers is required to establish visual contrast.
- **Instruction Text Readability**:
  The prompt banner (`wanda/css/style.css:1564-1566`) uses `#cbd5e1` with gold `<b>` highlights over a semi-transparent dark crimson container (`rgba(18, 4, 12, 0.9)`). In Phase 5, when the portal vortex and lightning canvas ignite, bright background bloom shines through the frosted glass, dropping text contrast below 3:1.

### 2.8 Clipping
- **Ground Array Viewport Polygon Clipping**:
  `.mystic-ground` (`wanda/css/style.css:292-311`) is a 1550px circle rotated 74 degrees on X-axis (`transform: rotateX(74deg) translateZ(-160px)`). The outer edges of this disc extend far beyond the left and right screen boundaries. Because the SVG has sharp vector outer borders without alpha feathering, the disc cuts into the screen edges as sharp, jagged diagonal polygon lines.
- **Monolith Clipping During Camera Yaw**:
  In Phase 2 (`cam-phase-2`: `translateX(-180px) rotateY(-6deg)`), monolith 1 is translated off the left edge of the viewport, getting sliced midway through its runic pillar by the viewport container boundary.

### 2.9 Visual Spectacle
- **Phase 5 Green Artifact / Particle Discoloration**:
  In `wanda/js/game.js:722`, resolving Phase 4 triggers `ParticleSystem.triggerBurst(..., 40, '#00ffa0')`. In Phase 5, stray lightning canvas fills occasionally produce green polygon specks near the Darkhold artifact that clash violently with the mystical scarlet portal aesthetics.
- **Flat 2D Portal Accretion Disk**:
  The central portal vortex (`assets/portal_vortex.webp`, `wanda/css/style.css:355-385`) is a 2D rotating WebP image. It lacks gravitational lens distortion, event-horizon light bending, or refraction shaders to warp stars and runes passing behind it.
- **Portal Singularity Depth**:
  The singularity core is a flat CSS gradient circle (`.portal-singularity`). Adding multi-layered depth parallax or an accretion disc with spinning event-horizon tendrils would dramatically elevate cinematic fidelity.

---

## 3. Prioritized Defect Catalog

| ID | Dimension | Severity | Location / Element | Defect Summary |
| :--- | :--- | :---: | :--- | :--- |
| **WANDA-DEF-01** | Assets | **Critical** | `wanda/assets/wanda_meditation.webp`; `wanda/css/style.css:543-555` | `wanda_meditation.webp` contains near-black unmasked bounding pixels; CSS `drop-shadow` generates a harsh glowing rectangular box around Wanda's head, arms, and lap. |
| **WANDA-DEF-02** | Layout / Responsive | **Critical** | `wanda/css/style.css:636-675`; `#object-crystal`, `#object-ring` | Fixed pixel offsets (`calc(50% - 390px)`, `calc(50% + 220px)`) push interactive relics completely offscreen on viewports narrower than 850px. |
| **WANDA-DEF-03** | Styling | **Major** | `wanda/css/style.css:259-279`; `.ambient-godrays` | Fatal CSS syntax error in `repeating-linear-gradient` (missing comma between gradient stops), duplicate properties, and duplicate `@keyframes godRaysDrift` blocks. |
| **WANDA-DEF-04** | Contrast | **Major** | `wanda/css/style.css:1-20, 24-40`; Global CSS tokens | Monochromatic crimson overload across all layers eliminates visual hierarchy and causes rapid eye fatigue; interactive elements blend into background void. |
| **WANDA-DEF-05** | Assets / Immersion | **Major** | `wanda/index.html:374-400`; `#error-modal` | Phase 4 displays a developer debugging error box ("ERROR CODE: 003 / Anomaly trace: Memory address 0x7F4A desynchronized") with "BYPASS FOR TESTING" button. |
| **WANDA-DEF-06** | Clipping | **Major** | `wanda/css/style.css:292-311`; `.mystic-ground` | 1550px 3D ground disc lacks radial edge feathering, creating sharp, jagged diagonal polygon slicing against screen boundaries on standard viewports. |
| **WANDA-DEF-07** | HUD & Canvas | **Major** | `wanda/index.html:208-223`; `.hand-flare` | Duplicate consecutive `.hand-flare.left-hand` and `.hand-flare.right-hand` empty divs in DOM cause redundant stacking contexts and filter compounding. |
| **WANDA-DEF-08** | Animations | **Minor** | `wanda/css/style.css:572-579`; `.hand-flare` | Mudra plasma orbs are pinned with fixed pixel offsets, drifting out of alignment with Wanda's actual hands during `wandaLevitate` cycle. |
| **WANDA-DEF-09** | HUD & Canvas | **Minor** | `wanda/js/game.js:763-780`; `#lightning-canvas` | 2D canvas lightning arcs computed from DOM `getBoundingClientRect()` temporarily desynchronize with 3D perspective-rotated relics during camera easing. |
| **WANDA-DEF-10** | Animations | **Minor** | `wanda/js/game.js:701-705`; `glitch-freeze` | Phase 4 glitch anomaly halts artifact floating abruptly with no deceleration curve, sound-synced tremor, or dissipation particles. |
| **WANDA-DEF-11** | Visual Spectacle | **Polish** | `wanda/js/game.js:722`; `ParticleSystem.triggerBurst` | Green particle burst (`#00ffa0`) during Phase 4 resolution creates an incongruous green visual artifact that clashes with the scarlet chaos magic theme. |
| **WANDA-DEF-12** | Visual Spectacle | **Polish** | `wanda/css/style.css:355-385`; `#portal-container` | Portal vortex relies on a flat rotating 2D WebP image without gravitational lensing, starfield refraction, or multi-plane accretion disk depth. |

---

## 4. Concrete Technical Remediation Plans

### Remediation 1: Clean Wanda Alpha Mask & Radial Edge Feathering (WANDA-DEF-01)
**Problem**: `wanda_meditation.webp` has an unmasked rectangular dark background, producing a glaring glowing box around Wanda when `drop-shadow` is applied.  
**Solution**: Apply a CSS `mask-image` with a feathered radial gradient to eliminate outer bounding box borders, or re-mask the image asset with true PNG alpha transparency:

```css
/* File: wanda/css/style.css (lines 543-555) */
/* REMEDIATION: Feathered silhouette alpha mask eliminating bounding box */
.wanda-cinematic-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  position: relative;
  z-index: 5;
  /* Apply radial alpha mask feathering outer rectangular boundary */
  -webkit-mask-image: radial-gradient(ellipse at 50% 50%, black 65%, transparent 95%);
  mask-image: radial-gradient(ellipse at 50% 50%, black 65%, transparent 95%);
  filter: 
    drop-shadow(0 0 20px rgba(255, 16, 63, 0.7)) 
    drop-shadow(0 0 45px rgba(229, 9, 56, 0.4));
  transition: all 1.8s ease;
  user-select: none;
  -webkit-user-drag: none;
}
```

---

### Remediation 2: Responsive Relic Positioning via Fluid Clamp Math (WANDA-DEF-02)
**Problem**: Fixed pixel offsets (`calc(50% - 390px)`, `calc(50% + 220px)`) push relics offscreen on viewports < 850px.  
**Solution**: Replace rigid pixel calculations with responsive `clamp()` and viewport-relative units, ensuring relics stay within visible boundaries across mobile, tablet, and desktop:

```css
/* File: wanda/css/style.css (lines 636-676) */
/* REMEDIATION: Fully responsive fluid relic placement */
#object-crystal {
  width: clamp(100px, 12vw, 140px);
  height: clamp(130px, 15vw, 180px);
  left: clamp(16px, calc(50% - min(390px, 38vw)), calc(50% - 140px));
  top: clamp(80px, calc(50% - 150px), calc(50% - 100px));
  animation: floatCrystal 6s ease-in-out infinite alternate;
}

#object-ring {
  width: clamp(120px, 14vw, 170px);
  height: clamp(120px, 14vw, 170px);
  left: clamp(calc(50% + 80px), calc(50% + min(220px, 24vw)), calc(100% - 150px));
  top: clamp(80px, calc(50% - 140px), calc(50% - 90px));
  animation: floatRing 5.4s ease-in-out infinite alternate;
}

#object-artifact {
  width: clamp(110px, 13vw, 160px);
  height: clamp(110px, 13vw, 160px);
  left: clamp(calc(50% + 60px), calc(50% + min(180px, 20vw)), calc(100% - 140px));
  top: clamp(calc(50% + 60px), calc(50% + 120px), calc(100% - 180px));
  animation: floatArtifact 7s ease-in-out infinite alternate;
}

@media (max-width: 768px) {
  #object-crystal {
    left: 12px;
    top: 22%;
  }
  #object-ring {
    left: auto;
    right: 12px;
    top: 22%;
  }
  #object-artifact {
    left: auto;
    right: 18px;
    top: 52%;
  }
}
```

---

### Remediation 3: Clean `.ambient-godrays` CSS Syntax & Consolidate Keyframes (WANDA-DEF-03)
**Problem**: Missing comma between gradient stops in `repeating-linear-gradient`, duplicate properties, and duplicate `@keyframes` blocks invalidate godrays.  
**Solution**: Correct the gradient syntax and consolidate property definitions into a single, valid, standards-compliant rule:

```css
/* File: wanda/css/style.css (lines 248-286) */
/* REMEDIATION: Valid CSS gradient syntax and consolidated keyframes */
.ambient-godrays {
  position: absolute;
  width: 140vw;
  height: 140vh;
  top: -30vh;
  left: -20vw;
  pointer-events: none;
  background: repeating-linear-gradient(
    115deg,
    rgba(255, 30, 80, 0.04) 0px,
    rgba(255, 30, 80, 0.04) 40px,
    transparent 60px,
    transparent 140px,
    rgba(255, 30, 80, 0.05) 140px,
    rgba(255, 30, 80, 0.05) 185px,
    transparent 210px,
    transparent 290px
  );
  filter: blur(18px);
  opacity: 0.82;
  transform: translateZ(-210px);
  animation: godRaysDrift 19s ease-in-out infinite alternate;
}

@keyframes godRaysDrift {
  0% {
    transform: translateZ(-210px) rotate(-1.5deg) scale(0.97);
    opacity: 0.65;
  }
  100% {
    transform: translateZ(-210px) rotate(2.5deg) scale(1.05);
    opacity: 0.92;
  }
}
```

---

### Remediation 4: Diversify Color Palette & Introduce Contrast Accents (WANDA-DEF-04)
**Problem**: Universal monochromatic red palette causes visual fatigue and makes interactive relics indistinguishable from background scenery.  
**Solution**: Introduce cosmic violet/indigo to the background void and enhance warm gold/amber accents on interactive runes and relics:

```css
/* File: wanda/css/style.css (lines 6-20 and 37-40) */
/* REMEDIATION: Balanced mystical color palette with hierarchical contrast */
:root {
  --bg-dark: #050208;
  --bg-deep: #0a0412;
  --void-indigo: #14052b;
  --chaos-red: #ff103f;
  --chaos-scarlet: #e50938;
  --chaos-glow: #ff2a5f;
  --chaos-crimson: #a00020;
  --chaos-pink: #ff6699;
  --mystic-gold: #f5c542;
  --astral-cyan: #38bdf8;
}

html, body {
  background-color: var(--bg-dark);
  background-image: 
    radial-gradient(ellipse at 50% 45%, #2a0518 0%, var(--void-indigo) 45%, #050208 100%);
}

/* Highlight interactive floating relics with distinct warm golden aura */
.floating-object:hover {
  filter: drop-shadow(0 0 25px var(--mystic-gold)) drop-shadow(0 0 50px var(--chaos-red));
}
```

---

### Remediation 5: Replace Developer Error Modal with "Chaos Fracture" In-Universe Event (WANDA-DEF-05)
**Problem**: Phase 4 displays a developer error box with "ERROR CODE: 003" and "BYPASS FOR TESTING".  
**Solution**: Re-style the anomaly into an authentic Marvel cosmic emergency ("CHAOS FRACTURE // DARKHOLD INSTABILITY") featuring glowing runic glyphs and a "RESTORE HARMONY" channel button:

```html
<!-- File: wanda/index.html (lines 374-400) -->
<!-- REMEDIATION: In-universe narrative event replacing developer error box -->
<div id="error-modal" class="chaos-fracture-modal">
  <div class="fracture-header">
    <div class="fracture-glyph">⚠️ ᛞ ⚠️</div>
    <div class="fracture-tag">DARKHOLD ANOMALY // REALITY BREACH</div>
  </div>
  
  <div class="fracture-title">CHAOS FRACTURE DETECTED</div>

  <div class="fracture-body">
    A dimensional fissure has ruptured Wanda's telekinetic tether! The Darkhold artifact is destabilizing between multiversal frequencies. Channel raw Chaos Magic to seal the breach!
  </div>

  <div class="fracture-rune-matrix">
    <span class="pulse-glyph">ᚲ</span>
    <span class="pulse-glyph active">ᛉ</span>
    <span class="pulse-glyph">ᛟ</span>
  </div>

  <button id="bypass-btn" class="channel-magic-btn">⚡ CHANNEL CHAOS MAGIC TO SEAL BREACH</button>
</div>
```

---

### Remediation 6: Feather Ground Array Outer Boundary (WANDA-DEF-06)
**Problem**: 1550px 3D ground disc cuts harshly into the viewport edges as jagged diagonal polygon slices.  
**Solution**: Apply a radial gradient alpha mask to `.mystic-ground` so its outer perimeter dissolves smoothly into the cosmic void:

```css
/* File: wanda/css/style.css (lines 292-311) */
/* REMEDIATION: Feathered radial mask for 3D ground disc */
.mystic-ground {
  position: absolute;
  width: 1550px;
  height: 1550px;
  bottom: -490px;
  border-radius: 50%;
  pointer-events: none;
  transform: rotateX(74deg) translateZ(-160px);
  /* Dissolve outer 15% of disc seamlessly into the background void */
  -webkit-mask-image: radial-gradient(circle at 50% 50%, black 55%, rgba(0,0,0,0.6) 75%, transparent 100%);
  mask-image: radial-gradient(circle at 50% 50%, black 55%, rgba(0,0,0,0.6) 75%, transparent 100%);
}
```

---

### Remediation 7: Remove Duplicate DOM Hand Flares (WANDA-DEF-07)
**Problem**: Consecutive duplicate `.hand-flare` elements in `index.html:208-223` create redundant stacking contexts.  
**Solution**: Delete the empty lines 209-210, preserving only the configured plasma core nodes:

```html
<!-- File: wanda/index.html (lines 208-224) -->
<!-- REMEDIATION: Cleaned non-redundant hand flare elements -->
<!-- Swirling Chaos Silk Ribbons around her Torso & Arms -->
<div class="chaos-silk chaos-silk-1"></div>
<div class="chaos-silk chaos-silk-2"></div>

<!-- Left & Right Hand Dynamic Mudra Plasma Orbs (Single Instance) -->
<div class="hand-flare left-hand">
  <div class="hand-plasma-core"></div>
  <div class="hand-plasma-orbit"></div>
</div>
<div class="hand-flare right-hand">
  <div class="hand-plasma-core"></div>
  <div class="hand-plasma-orbit"></div>
</div>
```

---

## 5. Visual Verification Checklist

- [ ] **Wanda Asset Bounding Box**: Load `wanda/index.html`; inspect Wanda's silhouette against the red sanctum and portal vortex. Verify that no rectangular glowing box or square border is visible around her head, shoulders, or lap.
- [ ] **Mobile Relic Visibility**: Resize the viewport to 375px, 414px, and 768px. Verify that `#object-crystal`, `#object-ring`, and `#object-artifact` remain 100% visible, fully inside the viewport bounds, and freely clickable.
- [ ] **CSS Syntax Validity**: Inspect `.ambient-godrays` in browser DevTools Styles pane; confirm that `repeating-linear-gradient` is fully parsed and active, with zero discarded properties or syntax warnings.
- [ ] **Ground Array Edge Softness**: Inspect the outer perimeter of `.mystic-ground` at 1920x1080 and 1366x768. Confirm that the outer disc perimeter fades smoothly into the dark void with zero harsh diagonal polygon clipping.
- [ ] **Palette & Contrast**: Verify that the background void features deep indigo/violet contrast, and that interactive relics and runes exhibit clear golden-amber visual separation from the red ambient particles.
- [ ] **Narrative Immersion in Phase 4**: Trigger Phase 4; verify that the developer error box ("ERROR CODE: 003 / BYPASS FOR TESTING") is replaced with the in-universe "Chaos Fracture" narrative modal.
- [ ] **DOM Cleanliness**: Inspect `#wanda-container` in DevTools Elements tab; confirm that only one left hand flare and one right hand flare exist in the DOM.
- [ ] **Phase 5 Lightning Accuracy**: Observe Phase 5 portal construction; confirm that lightning arcs terminate cleanly at relic center coordinates without green burst artifacts or coordinate drift.
