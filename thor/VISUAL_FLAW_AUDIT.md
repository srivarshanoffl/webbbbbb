# Visual Flaw Audit & Technical Remediation: Thor (Mjölnir Return)

**Target Game**: `thor/` (Mjölnir Return | Realm Defense)  
**Entry Point**: `thor/index.html` (and duplicate `thor/thor-hammer.html`)  
**Auditor**: Teamwork Visual Quality Specialist (`worker_batch4`)  
**Date**: 2026-11-08  
**Audit Standard**: 9-Dimension Visual Quality Rubric (Critical, Major, Minor, Polish)  

---

## 1. Executive Summary & Overall Visual Health Rating

### Overall Visual Health Rating: 48 / 100

| Metric | Score | Assessment |
| :--- | :---: | :--- |
| **Aesthetic Cohesion** | 52 / 100 | Energetic lightning and atmospheric particles exist, but are compromised by severed character sprites and legacy CSS bloat. |
| **Responsive Stability** | 32 / 100 | Severe failure on mobile and narrow viewports; fixed pixel sprites on fluid percentages cause 100%+ sprite collisions and offscreen clipping. |
| **Animation Quality** | 45 / 100 | Thor's sprite is completely static with clenched fists down at hips throughout aiming, charging, and throwing. |
| **HUD & Viewport Integration** | 50 / 100 | Floating action button occludes villain and civilian sprites on screens < 900px; DevTools debug console breaks narrative immersion. |
| **Asset Fidelity** | 42 / 100 | `civilian1.png` is cropped at the waist, rendering as a severed floating torso with an empty void above the ground shadow. |
| **Technical Architecture** | 48 / 100 | Over 1,600 lines of dead legacy CSS loaded in `<head>`, overridden by 580 lines of inline styles; duplicate 977-line entry point. |

### Executive Summary
`thor/` presents a canvas-based Marvel superhero mini-game featuring Thor defending Asgard from traitors who hold civilians as human shields. While the game features ambient stormy rain mist, dynamic 2D lighting masks, and thunder flashes, its visual presentation suffers from critical asset deficiencies and responsive layout flaws. Most prominently, `civilian1.png` is a waist-up bust asset rendered as a standing ground entity, creating a severed floating torso. On mobile screens (< 768px), fixed 300px entity sizes cause Thor, Traitors, and Civilians to crash into each other in an illegible visual pileup, while Traitor 3 clips offscreen by over 50px. Thor himself is completely static with zero throwing or charging poses, and the game forces an artificial escape-room CSS syntax bug (`display: center;`) with an in-game simulated DevTools terminal that shatters superhero combat immersion.

---

## 2. Comprehensive Evaluation Across the 9 Visual Dimensions

### 2.1 Layout
- **Fullscreen Viewport Framing**: The game sets `.canvas-wrapper` to `width: 100vw; height: 100dvh; overflow: hidden;` (`thor/index.html:45-58`). However, the starting screen overlay `.cinematic-mission-panel` (`thor/index.html:61-93`) has `width: min(900px, calc(100% - 32px))` and is positioned at `bottom: clamp(16px, 3vh, 36px)`. On short landscape viewports (e.g. mobile 667x375 or 740x360), this panel consumes over 60% of the screen height, completely occluding Thor, the civilians, and the traitors.
- **HUD Element Placement**: The primary action button container `.fs-controls-container` is anchored at `bottom: clamp(20px, 3.5vw, 36px); right: clamp(20px, 3.5vw, 36px);` (`thor/index.html:160-166`). On screens between 768px and 960px, this button sits directly in front of Traitor 3 (`x = vWidth * 0.86`) and Civilian 3, blocking the player's view of enemy health, lock-on status, and captive energy bonds.
- **Entry Point Duplication**: The project directory contains two identical 977-line files: `index.html` and `thor-hammer.html`. Any visual modifications applied to one are absent from the other, causing maintenance desynchronization.

### 2.2 Styling
- **Inline Style Bloat & Legacy Dead Code**: `thor/index.html:13-14` loads two external stylesheets: `<link rel="stylesheet" href="css/hub.css">` (931 lines) and `<link rel="stylesheet" href="css/game.css">` (704 lines). These sheets originate from an older multi-game modal hub and define selectors like `.game-modal`, `.arena-header`, `.arena-hero-badge`, `.loading-screen`, and `.portal-hero`, none of which exist in the game DOM. To override these, 580 lines of styles are embedded directly inside an inline `<style>` block in `thor/index.html:26-606`.
- **Contrived DevTools CSS Defect**: At `thor/index.html:16-24`, an intentional invalid CSS rule is embedded:
  ```css
  <style id="bifrost-ward-css">
    .bifrost-ward {
      position: relative;
      display: center; /* Defective CSS property value */
      width: 100%;
      border-radius: 8px;
    }
  </style>
  ```
  This is tied to `#debugTerminalOverlay` (`thor/index.html:679-715`), which instructs the user to open browser DevTools, inspect `#bifrostWard`, or click "AUTO-PATCH". This escape-room meta-puzzle completely undermines the cinematic Asgardian battlefield atmosphere.
- **Theme Consistency**: While the HUD uses cyan (`#00f0ff`) and gold (`#ffd200`) accents matching Asgardian Bifrost lore, the terminal overlay adopts standard web developer styling (monospace fonts, line numbers, red/green diff bars) that clashes violently with the cosmic Norse setting.

### 2.3 Animations
- **Completely Static Hero Character**: Thor's character sprite (`thor/assets/thor.png`, rendered in `thor-hammer.js:956-1016`) is a single static, full-frontal standing pose with fists clenched at his hips. During aiming, charging, hammer release, and hammer recall, Thor does not move an arm, turn his torso, or change expression.
- **Floating Weapon Detachment**: In `thor-hammer.js:100-101`, Thor's hand coordinates are hardcoded as `this.thor.handX = this.thor.x + 70; this.thor.handY = this.groundY - 155;`. Because Thor's sprite has clenched fists resting on his belt line, Mjölnir hovers awkwardly in empty midair next to his right pectoral muscle, rather than being held in an outstretched or raised hand.
- **Propeller-Like Hammer Rotation**: In `thor-hammer.js:1413`, Mjölnir rotates around its geometric image center `(0, 0)`:
  ```javascript
  ctx.translate(this.hammer.x, this.hammer.y);
  ctx.rotate(this.hammer.rotation);
  ctx.drawImage(this.mjolnirImg, -drawW / 2, -drawH * 0.28, drawW, drawH);
  ```
  Because the rotation center is not offset to the heavy hammerhead center-of-mass, the hammer appears to spin like a light propeller blade rather than a weapon propelled by centrifugal momentum.
- **Enemy & Civilian Idle Rigidity**: Traitors and Civilians possess only a 2px vertical sinusoidal translation (`bob = Math.sin(this.lightningTimer * 3 + t.x) * 2;`). They lack breathing expansion, cloth/cape physics, head turns, or anticipatory recoil before being struck.

### 2.4 Responsiveness
- **Fatal Entity Collision on Screens < 768px**:
  In `thor-hammer.js:98-128`, character positions are computed using viewport percentage fractions (`Thor: 0.16`, `Traitor 1 / Civ 1: 0.50`, `Traitor 2 / Civ 2: 0.69`, `Traitor 3 / Civ 3: 0.86`), while entity dimensions remain hardcoded in fixed pixels (`Thor: width 300, height 345`; `Traitors: w 195-220, h 245-265`; `Civilians: drawH 185, drawW ~120`).
  - **On a 375px Mobile Viewport (iPhone SE/13 mini)**:
    - Thor: Center `X = 375 * 0.16 = 60px`. Left edge = `-90px` (clipped 90px offscreen). Right edge = `+210px`.
    - Traitor 1: Center `X = 375 * 0.50 = 187.5px`. Left edge = `187.5 - 97.5 = 90px`. Right edge = `285px`.
    - **Collision**: Thor's right edge (`210px`) overlaps Traitor 1's left edge (`90px`) by **120px**! Thor completely covers Traitor 1 and Civilian 1.
    - Traitor 2: Center `X = 375 * 0.69 = 258.75px`. Left edge = `161.25px`. Traitor 1 overlaps Traitor 2 by **123.75px**.
    - Traitor 3: Center `X = 375 * 0.86 = 322.5px`. Right edge = `322.5 + 110 = 432.5px`. Traitor 3 extends **57.5px beyond the right edge of the screen**, clipping severely.
  - On screens narrower than 768px, the game is completely unplayable visually because all seven characters collapse into an unintelligible pile of overlapping sprites.

### 2.5 Assets
- **Critical Asset Defect: Severed Civilian Sprite (`civilian1.png`)**:
  `thor/assets/civilian1.png` is an image asset cropped horizontally at the waist/hips. When rendered on the canvas in `thor-hammer.js:1220-1225`:
  ```javascript
  const drawH = 185;
  const aspect = cImg.naturalWidth / cImg.naturalHeight;
  const drawW = drawH * aspect;
  ctx.drawImage(cImg, -drawW / 2, -drawH + 16 + bob, drawW, drawH);
  ```
  The sprite terminates in a straight horizontal line midway up her torso. There are no legs or dress folds extending to the ground, leaving an empty gap between her severed hips and the ground contact shadow.
- **CPU-Intensive Chroma-Key Hack for Traitors**:
  In `thor-hammer.js:1019-1054`, `getFeatheredTraitor()` runs an image processing loop extracting pixel data via `cx.getImageData()` to strip black borders:
  ```javascript
  for (let i = 0; i < data.length; i += 4) {
    const maxVal = Math.max(r, g, b);
    if (maxVal < 15) data[i + 3] = 0;
  }
  ```
  This CPU-bound raster pixel manipulation should be handled via properly masked PNG/WebP alpha channel assets at compile-time rather than dynamically generating auxiliary canvases at runtime.
- **Asset Redundancy**: `thor/assets/thor.jpg` (58.5 KB) and `thor/assets/thor_raw.jpg` (58.5 KB) are identical duplicate files that are never referenced by the codebase.

### 2.6 HUD and Canvas Alignment
- **Occlusion of Action Targets by HUD**: The bottom-right floating controls (`.fs-controls-container`) occupy 140px by 54px at `bottom: 24px; right: 24px;`. Traitor 3 sits at `x = vWidth * 0.86, y = vHeight * 0.82`. On desktop screens between 850px and 1100px, the "DEBUG CODE" / "UNLEASH MJÖLNIR" button sits directly over Traitor 3's legs and captive Civilian 3.
- **Aim Trajectory Origin Mismatch**: In `thor-hammer.js:1361`, the dashed aiming line begins at `this.hammer.x, this.hammer.y`. However, while aiming, the hammer remains pinned at Thor's hip (`handX, handY`), while the reticle moves with the mouse. Because Thor's arm does not track the pointer, the aiming laser appears to fire out of a stationary hammer resting on Thor's hip.
- **Milestone Toast Overlay**: The transient milestone toast (`.cinematic-toast`, `thor/index.html:247-271`) is positioned at `top: 22%; left: 50%; transform: translate(-50%, -50%);`. On 16:9 displays, this banner renders directly over the heads of Traitors 1 and 2 during crucial combat phase changes.

### 2.7 Contrast
- **Trajectory Guide Visibility**: In `thor-hammer.js:1355-1364`, the laser trajectory guide is drawn with `rgba(0, 240, 255, 0.45)` and a dashed line `[12, 8]`. Against the bright golden Bifrost shards and thunderstorm lightning flashes, this faint cyan line completely washes out.
- **Lock-On Reticle vs Villain Cloaks**: The lock-on combat reticle (`thor-hammer.js:1382-1388`) uses `#ff1744` with a 3px stroke. Traitors 2 and 3 feature crimson and dark-red cape accents, causing the lock-on circle to blend directly into the villain sprites.
- **Briefing Text Legibility**: In `.cinematic-mission-panel`, the `.mission-description` text is styled with `#cbd5e1` at `clamp(12px, 1.25vw, 15px)` over `rgba(4, 10, 22, 0.88)` with `backdrop-filter: blur(16px)`. When lightning flashes illuminate the canvas behind the modal, the white flash causes the contrast ratio to drop below WCAG 2.1 AA standards (3:1).

### 2.8 Clipping
- **Right Border Enemy Truncation**: Traitor 3 is placed at `this.vWidth * 0.86` with `w = 220px`. The right boundary of Traitor 3 reaches `this.vWidth * 0.86 + 110px`. Whenever `this.vWidth < 1100px`, `this.vWidth * 0.86 + 110 > this.vWidth` (e.g. at 1000px width, `860 + 110 = 970px`, leaving only 30px of margin; at 768px, `660 + 110 = 770px`, clipping 2px past the right canvas border).
- **Left Border Hero Truncation**: Thor is placed at `this.vWidth * 0.16` with `width = 300px`. Thor's left boundary reaches `this.vWidth * 0.16 - 150px`. Whenever `this.vWidth < 938px` (`0.16 * 938 = 150px`), Thor's left cape, arm, and shoulder are sliced off by the left screen border.
- **Mission Panel Height Overflow**: On mobile landscape orientations (e.g. iPhone horizontal 667x375), `.cinematic-mission-panel` height exceeds 200px, leaving less than 175px of vertical canvas and forcing text to overflow its container.

### 2.9 Visual Spectacle
- **Flat Flash Lighting**: In `thor-hammer.js:1254-1268`, lightning during the evacuation sequence is implemented as a flat rectangular alpha fill:
  ```javascript
  ctx.fillStyle = `rgba(180, 230, 255, ${flashAlpha})`;
  ctx.fillRect(0, 0, this.vWidth, this.vHeight);
  ```
  This creates an unconvincing screen-flicker effect rather than realistic directional illumination from high-altitude lightning strikes.
- **Absence of Combat Screen-Shake**: When Mjölnir impacts a traitor or when lightning strikes to evacuate a civilian, there is zero viewport shake or chromatic aberration. The lack of tactile visual recoil makes divine thunder strikes feel lightweight and powerless.
- **Linear Hammer Return Trajectory**: When Mjölnir returns to Thor after eliminating a traitor, it moves in a sterile straight vector (`vx, vy`) rather than an Asgardian parabolic arc with trailing electric particles and winding lightning streamers.

---

## 3. Prioritized Defect Catalog

| ID | Dimension | Severity | Location / Element | Defect Summary |
| :--- | :--- | :---: | :--- | :--- |
| **THOR-DEF-01** | Assets | **Critical** | `thor/assets/civilian1.png`; `thor-hammer.js:1220-1225` | `civilian1.png` is cropped at the waist, rendering as a severed floating torso with an empty void above the ground shadow. |
| **THOR-DEF-02** | Responsiveness | **Critical** | `thor/js/games/thor-hammer.js:98-128, 170-176, 204-256` | Rigid fixed-pixel entity widths (300px hero, 220px traitors) on percentage X positions cause total sprite collisions and offscreen clipping on screens < 768px. |
| **THOR-DEF-03** | Animations | **Major** | `thor/assets/thor.png`; `thor-hammer.js:956-1016` | Thor's sprite is completely static with fists clenched at his hips during charging, aiming, and throwing; Mjölnir floats detached in midair beside his chest. |
| **THOR-DEF-04** | Styling | **Major** | `thor/index.html:15-24, 678-715`; `#bifrost-ward-css` | Intentional defective CSS rule (`display: center;`) with in-game simulated DevTools terminal breaks Marvel universe immersion and gameplay focus. |
| **THOR-DEF-05** | Styling | **Major** | `thor/css/hub.css`, `thor/css/game.css`, `thor/index.html:26-606` | 1,600+ lines of dead legacy hub CSS loaded in `<head>`, while 580 lines of active styles are duplicated into an inline `<style>` tag. |
| **THOR-DEF-06** | HUD & Canvas | **Major** | `thor/index.html:160-166, 624-631`; `.fs-controls-container` | Bottom-right floating controls directly occlude Traitor 3 and Civilian 3 on viewport widths between 768px and 1000px. |
| **THOR-DEF-07** | Clipping | **Minor** | `thor/js/games/thor-hammer.js:98, 240-256` | Traitor 3 clips beyond the right canvas border on screens < 1100px; Thor clips beyond the left canvas border on screens < 938px. |
| **THOR-DEF-08** | Contrast | **Minor** | `thor/js/games/thor-hammer.js:1354-1365` | Dashed laser trajectory line washes out against bright golden Bifrost battlefield terrain and thunder flashes. |
| **THOR-DEF-09** | HUD & Canvas | **Minor** | `thor/index.html:246-271`; `.cinematic-toast` | Milestone center toast renders at `top: 22%`, cutting directly across villain character heads during phase transitions. |
| **THOR-DEF-10** | Animations | **Polish** | `thor/js/games/thor-hammer.js:1413-1448` | Mjölnir rotates around its geometric image center rather than its heavy hammerhead center-of-mass, creating a propeller-like spin. |
| **THOR-DEF-11** | Visual Spectacle | **Polish** | `thor/js/games/thor-hammer.js:1254-1268` | Thunder illumination is a flat rectangular alpha fill lacking directional gradients, branching lightning tendrils, and camera screen-shake. |
| **THOR-DEF-12** | Layout | **Polish** | `thor/index.html` & `thor/thor-hammer.html` | Redundant identical duplicate entry point file (`thor-hammer.html`) creates repository maintenance risk and code desynchronization. |

---

## 4. Concrete Technical Remediation Plans

### Remediation 1: Resolve Severed Civilian 1 Asset & Ground Positioning (THOR-DEF-01)
**Problem**: `assets/civilian1.png` is cropped at the waist, resulting in a floating torso.  
**Solution**: Either replace `civilian1.png` with a full-body illustrated cutout or dynamically anchor her behind battlefield debris/barricade props that naturally conceal the lower body cutoff. Furthermore, add a soft vertical fading alpha mask to the image if waist-level termination is detected:

```javascript
// File: thor/js/games/thor-hammer.js (lines 1220-1235)
// REMEDIATION: Full-body alignment or barricade ground anchoring
const cImg = this.civilianImages[i % this.civilianImages.length];
if (cImg && cImg.complete && cImg.naturalWidth > 0) {
  const drawH = 185 * this.entityScale;
  const aspect = cImg.naturalWidth / cImg.naturalHeight;
  const drawW = drawH * aspect;
  
  // Render Asgardian protective rubble barrier to ground the civilian naturally
  ctx.save();
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-drawW * 0.55, -24 + bob, drawW * 1.1, 28, 6);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Draw civilian character sprite seated/shielded behind the barrier
  ctx.drawImage(cImg, -drawW / 2, -drawH + 16 + bob, drawW, drawH);
}
```

---

### Remediation 2: Dynamic Responsive Entity Scaling & Clamp Math (THOR-DEF-02, THOR-DEF-07)
**Problem**: Fixed pixel widths (300px Thor, 220px Traitors) cause complete sprite overlap and boundary clipping on mobile viewports.  
**Solution**: Introduce a dynamic responsive scale factor `this.entityScale = Math.min(1.0, Math.max(0.48, this.vWidth / 1280))` and clamp horizontal positions so sprites never breach the left or right canvas boundaries:

```javascript
// File: thor/js/games/thor-hammer.js (lines 89-129)
// REMEDIATION: Dynamic entity scaling and viewport boundary clamping
onResize() {
  if (this.lightCanvas) {
    this.lightCanvas.width = this.vWidth;
    this.lightCanvas.height = this.vHeight;
  }
  this.groundY = this.vHeight * 0.82;

  // Compute dynamic scale based on 1280px reference design
  this.entityScale = Math.min(1.0, Math.max(0.48, this.vWidth / 1280));

  // Scale Thor and clamp within left margin
  if (this.thor) {
    this.thor.width = 300 * this.entityScale;
    this.thor.height = 345 * this.entityScale;
    // Ensure Thor is never clipped off left screen border
    this.thor.x = Math.max(this.thor.width * 0.55, this.vWidth * 0.16);
    this.thor.y = this.groundY;
    this.thor.handX = this.thor.x + 65 * this.entityScale;
    this.thor.handY = this.groundY - 150 * this.entityScale;
  }

  // Scale and distribute Traitors with minimum spacing
  if (this.traitors) {
    const basePositions = [0.48, 0.68, 0.86];
    this.traitors.forEach((t, i) => {
      t.w = (i === 2 ? 220 : 195) * this.entityScale;
      t.h = (i === 2 ? 265 : 245) * this.entityScale;
      t.r = (i === 2 ? 58 : 52) * this.entityScale;
      
      // Clamp rightmost enemy so right edge never breaches vWidth
      const targetX = this.vWidth * basePositions[i];
      const maxX = this.vWidth - t.w * 0.55;
      const minX = (this.thor ? this.thor.x + this.thor.width * 0.6 : 100) + i * (t.w * 0.85);
      t.x = Math.max(minX, Math.min(maxX, targetX));
      t.y = this.groundY;
    });
  }

  // Align Civilians exactly with Traitors
  if (this.civilians && this.traitors) {
    this.civilians.forEach((civ, i) => {
      civ.r = 36 * this.entityScale;
      civ.x = this.traitors[i].x;
      if (!civ.rescued && !civ.evacuating) {
        civ.y = this.groundY - 15 * this.entityScale;
      }
    });
  }
}
```

---

### Remediation 3: Dynamic Thor Aiming Stance & Weapon Grip Alignment (THOR-DEF-03)
**Problem**: Thor remains in a rigid, clenched-fist standing pose while Mjölnir floats detached in midair beside his chest.  
**Solution**: Render a dynamic throwing arm or rotate Thor's weapon grip origin according to `this.aimAngle`, aligning Mjölnir directly with Thor's extended arm:

```javascript
// File: thor/js/games/thor-hammer.js (lines 956-1016)
// REMEDIATION: Dynamic arm rendering and aim tracking
drawThor(ctx) {
  ctx.save();
  ctx.translate(this.thor.x, this.thor.y);

  const bob = Math.sin(this.lightningTimer * 3.5) * 2;
  const drawW = this.thor.width;
  const drawH = this.thor.height;
  const drawX = -drawW / 2;
  const drawY = -drawH + 12 + bob;

  // Ground shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.beginPath();
  ctx.ellipse(0, 6, 95 * this.entityScale, 22 * this.entityScale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw Thor base body
  if (this.thorImg && this.thorImg.complete && this.thorImg.naturalWidth > 0) {
    ctx.drawImage(this.thorImg, drawX, drawY, drawW, drawH);
    
    // Draw Dynamic Combat Arm when aiming / charging Mjölnir
    if (this.missionState === 'COMBAT' || this.isCharging) {
      ctx.save();
      const shoulderX = 35 * this.entityScale;
      const shoulderY = -drawH * 0.58 + bob;
      ctx.translate(shoulderX, shoulderY);
      ctx.rotate(this.aimAngle);
      
      // Render armor gauntlet reaching toward the aiming reticle
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(0, -10 * this.entityScale, 55 * this.entityScale, 20 * this.entityScale, 6);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      
      // Update hand origin to end of extended gauntlet
      this.thor.handX = this.thor.x + shoulderX + Math.cos(this.aimAngle) * (55 * this.entityScale);
      this.thor.handY = this.thor.y + shoulderY + Math.sin(this.aimAngle) * (55 * this.entityScale);
    }
  }
  ctx.restore();
}
```

---

### Remediation 4: Replace Immersion-Breaking DevTools Bug with In-Game Bifrost Ward Alignment (THOR-DEF-04, THOR-DEF-05)
**Problem**: Intentional CSS bug `#bifrost-ward-css` (`display: center;`) and in-game simulated DevTools terminal break comic-book superhero immersion.  
**Solution**: Remove `#bifrost-ward-css` and `#debugTerminalOverlay`. Re-theme the power restoration step into an in-universe Asgardian Bifrost Runic Conduit alignment puzzle directly on the canvas or via a stylized Asgardian HUD modal:

```html
<!-- File: thor/index.html (Replace lines 15-24 and 678-715) -->
<!-- REMEDIATION: Clean in-universe Asgardian Bifrost Terminal -->
<div class="asgard-conduit-overlay hidden" id="conduitOverlay">
  <div class="asgard-conduit-modal">
    <div class="conduit-header">
      <span class="conduit-glyph">⚡</span>
      <h3>BIFROST RUNIC HARMONIZER</h3>
      <button class="conduit-close-btn" id="conduitCloseBtn">&times;</button>
    </div>
    <p class="conduit-lore">
      The Dark Elves have inverted the Bifrost light frequencies. Realign the three primary runic conduits to channel divine thunder and evacuate the captive Asgardians!
    </p>
    <div class="conduit-switches">
      <button class="rune-conduit-btn active" data-conduit="fehu">ᚠ LIGHTNING CONDUIT [ALIGNED]</button>
      <button class="rune-conduit-btn" id="alignBifrostBtn">ᛏ BIFROST WARD [PRESS TO HARMONIZE]</button>
      <button class="rune-conduit-btn active" data-conduit="uruz">ᚢ THUNDER CONDUIT [ALIGNED]</button>
    </div>
  </div>
</div>
```

---

### Remediation 5: Prevent HUD Overlap on Villain Sprites (THOR-DEF-06)
**Problem**: `.fs-controls-container` at bottom-right covers Traitor 3 and Civilian 3 on viewports < 1000px.  
**Solution**: Relocate action buttons to a centered bottom bar with automatic safe-area padding, or dock them to the bottom-left beneath Thor:

```css
/* File: thor/index.html (lines 160-166) */
/* REMEDIATION: Reposition essential controls to avoid villain occlusion */
.fs-controls-container {
  position: absolute;
  bottom: clamp(16px, 2.5vh, 28px);
  bottom: calc(clamp(16px, 2.5vh, 28px) + env(safe-area-inset-bottom, 0px));
  left: 50%;
  transform: translateX(-50%);
  right: auto;
  z-index: 20;
  display: flex;
  gap: 12px;
  pointer-events: auto;
}

@media (max-width: 768px) {
  .fs-controls-container {
    bottom: 12px;
    width: calc(100% - 24px);
    justify-content: center;
  }
  .cinematic-action-btn {
    width: 100%;
    justify-content: center;
    padding: 10px 18px;
    font-size: 13px;
  }
}
```

---

### Remediation 6: High-Contrast Trajectory Guide & Hammerhead Center-of-Mass Rotation (THOR-DEF-08, THOR-DEF-10)
**Problem**: Faint cyan dashed aim line washes out over bright terrain, and Mjölnir rotates around its geometric image center.  
**Solution**: Add a high-contrast dark stroke outline behind the dashed trajectory line, and offset Mjölnir's rotation anchor to its physical hammerhead center-of-mass:

```javascript
// File: thor/js/games/thor-hammer.js (lines 1354-1365 and 1411-1448)
// REMEDIATION: High-contrast trajectory stroke & offset hammer rotation
drawTrajectory(ctx, endX, endY) {
  ctx.save();
  // 1. Dark high-contrast drop-shadow underlay
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.lineWidth = (this.isCharging ? 5 : 3.5) * this.entityScale;
  ctx.setLineDash([12, 8]);
  ctx.beginPath();
  ctx.moveTo(this.hammer.x, this.hammer.y);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  // 2. High-intensity neon cyan laser core
  ctx.strokeStyle = this.isCharging ? '#ffd200' : '#00f0ff';
  ctx.shadowColor = this.isCharging ? '#ffd200' : '#00f0ff';
  ctx.shadowBlur = 14;
  ctx.lineWidth = (this.isCharging ? 3 : 2) * this.entityScale;
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

drawMjolnir(ctx) {
  ctx.save();
  ctx.translate(this.hammer.x, this.hammer.y);
  ctx.rotate(this.hammer.rotation);

  const drawW = 75 * this.entityScale;
  const drawH = 100 * this.entityScale;
  // Offset pivot point to hammerhead center of mass (top 28% of sprite)
  const pivotOffsetY = -drawH * 0.28;
  ctx.drawImage(this.mjolnirImg, -drawW / 2, pivotOffsetY, drawW, drawH);
  ctx.restore();
}
```

---

## 5. Visual Verification Checklist

- [ ] **Asset Integrity**: Open `thor/index.html` in browser; verify that Civilian 1 does not appear as a severed floating torso. Ground contact is clean and natural.
- [ ] **Mobile Responsiveness**: Resize browser viewport to 375x667, 390x844, and 768x1024. Confirm that Thor, all three Traitors, and all three Civilians maintain clear horizontal separation with zero sprite overlap.
- [ ] **Boundary Clamping**: Verify that Traitor 3's right shoulder never clips past the right viewport border, and Thor's cape never clips past the left viewport border.
- [ ] **HUD Positioning**: Confirm that the action buttons at the bottom of the screen do not cover Traitor 3, Civilian 3, or target lock reticles on viewports between 768px and 1080px.
- [ ] **Aim Trajectory Contrast**: Engage combat aiming; confirm that the trajectory guide remains crisp and clearly visible across dark ground, bright golden Bifrost shards, and thunder flashes.
- [ ] **Hammer Rotation Feel**: Throw Mjölnir; verify that the hammer rotates around its weighted hammerhead center rather than spinning like a symmetrical propeller.
- [ ] **Dead Code Elimination**: Validate that `css/hub.css` and `css/game.css` are either pruned or cleaned of legacy modal classes, and that duplicate entry point `thor-hammer.html` is eliminated.
- [ ] **Narrative Immersion**: Confirm that developer DevTools prompts and intentional CSS syntax bugs (`display: center;`) are replaced with in-universe Asgardian Bifrost mechanics.
