# Visual Flaw Audit & Technical Remediation Report: Captain America (Safe Passage)

**Audit Target**: `captain-america-safe-passage/`  
**Game Title**: Captain America: Safe Passage  
**Primary Tech Stack**: HTML5, Vanilla JavaScript (ES6+), 2.5D Comic Layout, Canvas VFX (Debris/Sparks/Shockwaves)  
**Key Entry Files**: `index.html` (70 lines), `styles.css` (49 lines / minified composite), `game.js` (828 lines)  
**Auditor**: Teamwork Visual Flaw Auditor (Batch 1)  
**Integrity Mode**: Genuine Inspection & Comprehensive Technical Remediation  

---

## 1. Executive Summary & Overall Visual Health Rating

### Visual Health Rating: 66 / 100

Captain America: Safe Passage delivers some of the punchiest kinetic feedback in the workspace: polygon shard shattering with texture clipping, double vibranium shockwaves, screen flashes, and camera kicks (`@keyframes cinematicCameraKick`). However, the game suffers from severe visual compromises: a 180ms ease transition on Steve Rogers that causes dragging lag and rubber-banding, extreme art style dissonance spanning 5 unrelated visual mediums, an ungrounded hybrid coordinate system (percentage X vs. pixel Y), oversized hazard bounding boxes, and duplicate CSS rules.

### Key Strengths
- **Kinetic Impact Juice**: Molten spark bursts, polygonal debris physics with ground bouncing, and dual vibranium shockwave rings make shield blocks feel physically powerful.
- **Comic Book Layout**: Authentic comic typography (`Bangers`, `Barlow Condensed`) combined with a dynamic halftone dot screen matrix (`.game:before`).
- **Escort Progression**: Clear 3-section progression with narrative civilian status markers and dynamic route tracking.

### Critical Deficiencies
1. **Severe Multi-Medium Art Style Dissonance (`assets/`)**: Juxtaposes a live-action MCU photographic actor cutout of Chris Evans (`captain-america.png`) with a flat 2D geometric vector SVG (`shield.svg`), AI-painted comic civilians (`civilians.png`), a 3D-rendered photorealistic rock chunk (`debris-obstacle.png`), and a stylized matte painting (`city-route.png`).
2. **180ms Drag Lag & Bounding Rect Feedback Loop (`styles.css:16`, `game.js:428-441`)**: `.captain { transition: left .18s ease, top .18s ease; }` causes Steve Rogers to lag behind the user's cursor while `getBoundingClientRect()` mid-transition introduces positioning drift.
3. **Hybrid Coordinate Horizon Drift (`game.js:417-418, 442-446`)**: `playerX` is calculated in percentages (`%`) while `playerY` is locked to absolute pixels (`px`), causing Cap to sink into or hover above the street horizon when the viewport changes.
4. **Hazard Visual Hitbox Mismatch (`styles.css:20`)**: `.hazard-art` is scaled to 138% width and 158% height with `-19%` left and `-29%` top offsets, visually projecting the rock far outside the collision box.
5. **Exact Duplicate CSS Declarations (`styles.css:8-13`)**: Lines 11–13 are an exact 100% duplicate of lines 8–10 (`.vfx-canvas` and `.screen-flash`).

---

## 2. In-Depth Evaluation Across All 9 Visual Dimensions

### 1. Layout
- **Observation**: 2.5D comic street composition: backdrop (`z-index: -6`), street level (`z-index: -3`, height: 24%), rubble (`z-index: -2`), civilians (`z-index: 4`), Captain America (`z-index: 6`), shield (`z-index: 8`), hazard (`z-index: 9`), and VFX canvas (`z-index: 10`).
- **Visual Defect (Major - Hybrid Coordinate Horizon Drift)**: In `game.js:416-419`:
  ```javascript
  function actorLayout() {
    captain.style.left = `${state.playerX}%`;
    captain.style.top = `${state.playerY}px`;
  }
  ```
  Captain America's horizontal position is managed via percentage width (`%`), but his vertical placement is hardcoded as an absolute pixel value (`px`), initialized at `state.playerY = innerHeight * .37` (`game.js:444`). On window resize, `resizeCanvas()` is invoked, but `state.playerY` is never recalibrated. On screens with non-standard aspect ratios (e.g. 4:3, 16:10, 21:9), Steve Rogers detaches from the sidewalk, either hovering in mid-air or clipping through the street pavement.
- **Severity**: **Major**
- **Impact**: Destroys ground contact illusion when resizing or playing on non-16:9 viewports.

### 2. Styling
- **Observation**: Comic aesthetic with Google Fonts (`Barlow Condensed` and `Bangers`), halftone screen dots, and dynamic contrast styling.
- **Visual Defect (Minor - Byte-Identical Duplicate Declarations)**: In `styles.css:8-13`:
  ```css
  8: .vfx-canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:10}
  9: .screen-flash{position:absolute;inset:0;pointer-events:none;z-index:22;opacity:0;mix-blend-mode:screen;background:radial-gradient(circle at var(--fx,50%) var(--fy,50%),rgba(255,255,255,.96) 0%,rgba(140,230,255,.62) 24%,rgba(30,115,220,.32) 52%,transparent 72%);transition:opacity .18s cubic-bezier(.1,.9,.2,1)}
  10: .screen-flash.active{opacity:1;transition:none}
  11: .vfx-canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:10}
  12: .screen-flash{position:absolute;inset:0;pointer-events:none;z-index:22;opacity:0;mix-blend-mode:screen;background:radial-gradient(circle at var(--fx,50%) var(--fy,50%),rgba(255,255,255,.96) 0%,rgba(140,230,255,.62) 24%,rgba(30,115,220,.32) 52%,transparent 72%);transition:opacity .18s cubic-bezier(.1,.9,.2,1)}
  13: .screen-flash.active{opacity:1;transition:none}
  ```
  Lines 11–13 repeat the exact declarations of lines 8–10 verbatim, bloating stylesheet parsing with dead code.
- **Severity**: **Minor**

### 3. Animations
- **Observation**: Vibranium recoil animation (`@keyframes vibraniumKineticRecoil`, `styles.css:18`), debris tumbling (`@keyframes hazardBallisticTumble`), and cinematic camera impulse (`@keyframes cinematicCameraKick`).
- **Visual Defect (Major - 180ms Input Drag Lag & Position Jitter)**: In `styles.css:16`:
  ```css
  .captain {
    position: absolute;
    ...
    transition: left .18s ease, top .18s ease;
  }
  ```
  When the player clicks and drags the shield, `moveByPointer(event)` continuously fires `setShieldPoint()`. Because `.captain` enforces a 180ms ease transition on `left` and `top`, Captain America lags noticeably behind the pointer. Furthermore, `setShieldPoint` computes relative offsets by calling `captain.getBoundingClientRect()` and `shield.getBoundingClientRect()`. Because the element is mid-transition, `getBoundingClientRect()` returns interpolated in-flight coordinates, creating an oscillating feedback loop of positional jitter and rubber-banding during active drags.
- **Severity**: **Major**
- **Impact**: Makes shield interception feel sluggish and floaty rather than tight and responsive.

### 4. Responsiveness
- **Observation**: Media query `@media (max-width: 760px)` (`styles.css:39`) adjusts typography and enables virtual touch controls (`.touch-controls`).
- **Visual Defect (Major - Trajectory Angle Distortion on Ultrawide)**: In `game.js:501-507`:
  ```javascript
  function pathFor(direction) {
    const bounds = game.getBoundingClientRect();
    const target = getTargetPoint();
    if (direction === 'right') return { start: { x: bounds.width + 70, y: target.y - 72 }, end: { x: target.x, y: target.y } };
    if (direction === 'left') return { start: { x: -70, y: target.y - 52 }, end: { x: target.x, y: target.y } };
    return { start: { x: target.x + 90, y: -70 }, end: { x: target.x, y: target.y } };
  }
  ```
  On 21:9 ultrawide monitors, `bounds.width` is disproportionately large compared to `bounds.height`. Spawning hazards at `bounds.width + 70` makes the trajectory line traverse an extremely flat, elongated horizontal angle across the entire screen, while vertical falling debris (`up`) arrives almost instantaneously due to the shorter vertical travel distance.
- **Severity**: **Major**

### 5. Assets
- **Observation**: Assets include `captain-america.png`, `shield.svg`, `civilians.png`, `civilians-fallen.png`, `debris-obstacle.png`, and `city-route.png`.
- **Visual Defect (Critical - Severe Art Style Clash)**: The game combines 5 incompatible art styles:
  1. `captain-america.png`: A high-resolution live-action photographic movie still cutout of Chris Evans from *Captain America: The Winter Soldier*.
  2. `shield.svg`: An ultra-clean, flat 2D vector geometric graphic with sharp untextured vector fills.
  3. `civilians.png` & `civilians-fallen.png`: AI-generated painted comic book illustrations with painterly textures and loose brushstrokes.
  4. `debris-obstacle.png`: A photorealistic 3D rendered rock chunk with complex diffuse normal mapping.
  5. `city-route.png`: A stylized matte painted concept art cityscape.
  Placing a completely flat SVG vector circle onto the arm of a live-action photographic human actor, who stands in front of illustrated comic-book civilians protecting them from a 3D-rendered rock, looks like an uncurated collage of placeholder assets rather than a cohesive title.
- **Severity**: **Critical**
- **Impact**: Completely destroys visual immersion and professional presentation.

### 6. HUD and Canvas Alignment
- **Observation**: Dynamic trajectory path (`#trajectory`, `styles.css:14`) and alert banner (`#warning`).
- **Visual Defect (Minor - HUD Vertical Collision on Compact Screens)**: In `styles.css:14`:
  `#missionCue` is positioned at `top: 99px; left: 50%; transform: translateX(-50%);` while `#warning` is placed at `top: 157px; left: 50%; transform: translateX(-50%);`. On small mobile viewports (e.g. 667px height or landscape phones), `#warning` collides with Captain America's helmet (`top: 37%`), creating visual overlap between critical game state cues and actor sprites.
- **Severity**: **Minor**

### 7. Contrast
- **Observation**: Vibrant comic lettering with deep drop shadows (`text-shadow: 5px 6px 0 #10283b`).
- **Visual Defect (Minor - Trajectory Line Low Contrast on Dust)**: In Section 2, the city backdrop features sunlit dusty clouds and light asphalt. The trajectory guide (`border-top: 2px dashed #ffe79a99; filter: drop-shadow(0 0 4px #f9c667);`, `styles.css:14`) blends into the background haze, making the path hard to distinguish until the rock has already begun moving.
- **Severity**: **Minor**

### 8. Clipping
- **Observation**: Strict z-index stack (`-6` to `25`).
- **Visual Defect (Major - Hazard Visual Bounding Box Breach)**: In `styles.css:20`:
  ```css
  .hazard-art {
    position: absolute;
    z-index: 1;
    left: -19%;
    top: -29%;
    width: 138%;
    height: 158%;
    object-fit: contain;
    filter: drop-shadow(0 0 13px #ffad53a8) drop-shadow(3px 8px 5px #07131c);
  }
  ```
  The visual artwork for the falling rock is inflated to 138% width and 158% height, projecting 29% above and 19% to the left of the logical `.hazard` container. When checking collisions in `checkShieldCollision()` (`game.js:626-634`), distance is calculated from the geometric center of `.hazard`. Because the visible rock texture extends far beyond that bounding circle, the rock visibly clips into the shield rim or civilian heads several frames before a collision registers, giving the impression of broken hit detection.
- **Severity**: **Major**

### 9. Visual Spectacle
- **Observation**: Exceptional kinetic impact: polygon shards tumble and bounce with gravity (`game.js:248-290`), radial shockwaves expand, and the entire game viewport kicks with directional camera recoil (`cinematicCameraKick`).
- **Visual Defect (Polish - Generic Sci-Fi Impact HUD Label)**: When a block occurs, `#impact` displays a rectangular semi-transparent cyan HUD card with `font: 16px 'Barlow Condensed'` and `letter-spacing: 3px` (`styles.css:31-34`). This sleek cybernetic aesthetic clashes with the bombastic comic book headline typography (`Bangers`, 132px). Needs an authentic comic book impact bubble ("CLANG!", "THWACK!", "BLOCKED!").
- **Severity**: **Polish**

---

## 3. Prioritized Defect Catalog

| Defect ID | Visual Dimension | Severity | Location / Element | Defect Summary |
| :--- | :--- | :--- | :--- | :--- |
| **CAP-01** | Assets | **Critical** | `assets/*` | Multi-medium art style clash: MCU live-action movie still (Cap) + flat vector SVG (shield) + AI painted comic (civilians) + 3D render (rock). |
| **CAP-02** | Animations | **Major** | `styles.css:16` | `.captain` transition `left .18s ease, top .18s ease` causes severe drag lag and rubber-banding during pointer tracking. |
| **CAP-03** | Layout | **Major** | `game.js:417-418, 444` | Hybrid coordinate disconnect: `playerX` in percentage vs. `playerY` in pixels causes Cap to float or sink on non-16:9 viewports. |
| **CAP-04** | Clipping | **Major** | `styles.css:20` | `.hazard-art` inflated to 138% width / 158% height, causing visible rock texture to clip through shield before collision trigger. |
| **CAP-05** | Responsiveness | **Major** | `game.js:501-507` | Fixed horizontal offsets (`bounds.width + 70`) distort trajectory line angles on 21:9 ultrawide and mobile portrait screens. |
| **CAP-06** | Styling | **Minor** | `styles.css:8-13` | Exact duplicate CSS declarations: lines 11–13 duplicate lines 8–10 (`.vfx-canvas` and `.screen-flash`). |
| **CAP-07** | Contrast | **Minor** | `styles.css:14` | Dashed trajectory guide `#ffe79a99` washes out against bright dust and sky in Section 2 backdrop. |
| **CAP-08** | HUD / Canvas | **Minor** | `styles.css:14` | `#warning` (top: 157px) and `#missionCue` (top: 99px) crowd and collide with Cap sprite on short viewports. |
| **CAP-09** | Visual Spectacle | **Polish** | `styles.css:31-34` | `.impact` feedback banner uses sleek sci-fi styling that clashes with the comic book title font (`Bangers`). |

---

## 4. Concrete Technical Remediation Plans

### Remediation for CAP-01: Harmonize Art Direction Across Assets
**Location**: `captain-america-safe-passage/styles.css:16-17`, `captain-america-safe-passage/assets/`  
**Problem**: Live-action MCU Chris Evans photo, flat vector SVG shield, and AI-painted comic civilians produce jarring art style dissonance.  
**Fix**: Apply an authentic comic-book ink filter to Captain America to match the illustrated civilians, and apply metallic rim lighting and texture to the flat SVG shield:

```css
/* Apply Comic-Book Halftone Ink & Posterization Shader to Captain America Sprite */
.captain-sprite {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center bottom;
  /* Harmonize live-action photo into illustrated comic style */
  filter: contrast(1.25) 
          saturate(0.95) 
          brightness(0.92) 
          drop-shadow(2px 0 0 #091725) 
          drop-shadow(-2px 0 0 #091725) 
          drop-shadow(0 2px 0 #091725) 
          drop-shadow(0 -2px 0 #091725);
  pointer-events: none;
}

/* Give flat vector shield metallic curvature and rim lighting */
.shield {
  position: absolute;
  z-index: 8;
  left: 30%;
  top: 50%;
  width: 49%;
  height: auto;
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  touch-action: none;
  cursor: grab;
  /* Add metallic radial depth */
  background: radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 50%);
  border-radius: 50%;
  filter: drop-shadow(0 8px 12px rgba(9, 23, 37, 0.8)) 
          drop-shadow(0 0 12px rgba(103, 232, 249, 0.4));
  transition: filter 0.16s, scale 0.16s;
}
```

---

### Remediation for CAP-02: Eliminate 180ms Drag Latency and Position Jitter
**Location**: `captain-america-safe-passage/styles.css:16-17`, `captain-america-safe-passage/game.js:715-719`  
**Problem**: `.captain { transition: left .18s ease, top .18s ease; }` causes drag lag and corrupts `getBoundingClientRect()` readings.  
**Fix**: Add a `.dragging` modifier class to `.captain` during active pointer drags that disables CSS transitions completely:

```css
/* BEFORE: */
.captain {
  position: absolute;
  z-index: 6;
  left: 38%;
  top: 37%;
  width: clamp(210px, 26vw, 350px);
  height: clamp(230px, 48vh, 470px);
  transition: left .18s ease, top .18s ease;
  ...
}

/* AFTER: */
.captain {
  position: absolute;
  z-index: 6;
  left: 38%;
  top: 37%;
  width: clamp(210px, 26vw, 350px);
  height: clamp(230px, 48vh, 470px);
  transition: left .18s ease, top .18s ease;
  ...
}

/* Immediate 1:1 hardware pointer tracking during drag */
.captain.dragging {
  transition: none !important;
}
```

```javascript
// In game.js: Add/remove dragging class
function onPointerDown(event) {
  state.draggingShield = true;
  captain.classList.add('dragging');
  shield.classList.add('dragging');
  ...
}

function onPointerUp() {
  state.draggingShield = false;
  captain.classList.remove('dragging');
  shield.classList.remove('dragging');
  ...
}
```

---

### Remediation for CAP-03: Anchor Cap Vertically to the Street Baseline
**Location**: `captain-america-safe-passage/game.js:416-447`  
**Problem**: Managing `playerX` in percentages and `playerY` in absolute pixels breaks ground alignment on window resize.  
**Fix**: Express vertical position relative to the street baseline (`.street { height: 24%; }`) using percentage or viewport height units:

```javascript
// BEFORE:
function actorLayout() {
  captain.style.left = `${state.playerX}%`;
  captain.style.top = `${state.playerY}px`;
}

function setShieldHome(section = 0) {
  state.playerX = innerWidth <= 760 ? (section === 2 ? 0 : 42) : (section === 2 ? 1 : 38);
  state.playerY = innerHeight * .37;
  state.shieldMoved = false;
  actorLayout();
}

// AFTER (GROUNDED PERCENTAGE COORDINATES):
function actorLayout() {
  captain.style.left = `${state.playerX}%`;
  // Cap's feet remain grounded exactly at 76% of viewport height (top of 24% street)
  captain.style.top = `${state.playerY}%`;
}

function setShieldHome(section = 0) {
  state.playerX = innerWidth <= 760 ? (section === 2 ? 0 : 42) : (section === 2 ? 1 : 38);
  state.playerY = 37; // Consistently 37% of viewport height
  state.shieldMoved = false;
  actorLayout();
}
```

---

### Remediation for CAP-04: Re-Align Hazard Graphic with Collision Bounding Box
**Location**: `captain-america-safe-passage/styles.css:19-20`  
**Problem**: `.hazard-art` is set to 138% width, 158% height, `-19%` left, `-29%` top, causing rock visual clipping through shields.  
**Fix**: Fit `.hazard-art` snugly within the 100% bounds of `.hazard` and center its object fit:

```css
/* BEFORE: */
.hazard-art {
  position: absolute;
  z-index: 1;
  left: -19%;
  top: -29%;
  width: 138%;
  height: 158%;
  object-fit: contain;
  filter: drop-shadow(0 0 13px #ffad53a8) drop-shadow(3px 8px 5px #07131c);
}

/* AFTER: */
.hazard-art {
  position: absolute;
  z-index: 1;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center center;
  filter: drop-shadow(0 0 13px #ffad53a8) drop-shadow(3px 8px 5px #07131c);
}
```

---

### Remediation for CAP-06: Remove Duplicate CSS Blocks
**Location**: `captain-america-safe-passage/styles.css:8-13`  
**Problem**: Lines 11–13 duplicate lines 8–10 verbatim.  
**Fix**: Delete duplicate lines 11–13:

```css
/* KEEP (lines 8-10): */
.vfx-canvas { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 10; }
.screen-flash { position: absolute; inset: 0; pointer-events: none; z-index: 22; opacity: 0; mix-blend-mode: screen; background: radial-gradient(circle at var(--fx,50%) var(--fy,50%), rgba(255,255,255,.96) 0%, rgba(140,230,255,.62) 24%, rgba(30,115,220,.32) 52%, transparent 72%); transition: opacity .18s cubic-bezier(.1,.9,.2,1); }
.screen-flash.active { opacity: 1; transition: none; }

/* REMOVE lines 11-13 */
```

---

### Remediation for CAP-07: Enhance Trajectory Contrast with Underlaid Casing Stroke
**Location**: `captain-america-safe-passage/styles.css:14`  
**Problem**: Dashed gold line `#ffe79a99` washes out against bright dust.  
**Fix**: Add a dark underlaid drop-shadow casing stroke to ensure trajectory visibility against all backgrounds:

```css
/* BEFORE: */
.trajectory {
  position: absolute;
  z-index: 5;
  height: 2px;
  transform-origin: left center;
  border-top: 2px dashed #ffe79a99;
  filter: drop-shadow(0 0 4px #f9c667);
  pointer-events: none;
}

/* AFTER: */
.trajectory {
  position: absolute;
  z-index: 5;
  height: 2px;
  transform-origin: left center;
  border-top: 3px dashed #ffe79a;
  /* Dual drop-shadow provides a dark protective casing against bright dust */
  filter: drop-shadow(0 0 2px #07131c) 
          drop-shadow(0 0 5px #091725) 
          drop-shadow(0 0 8px #f9c667);
  pointer-events: none;
}
```

---

### Remediation for CAP-09: Convert Sci-Fi Impact HUD to Comic Sound Burst
**Location**: `captain-america-safe-passage/styles.css:31-34`  
**Problem**: Sleek cyan cyber box clashes with the comic book theme.  
**Fix**: Style `.impact` using dynamic comic book bursts and `Bangers` typography:

```css
/* Comic Book Impact Bubble */
.impact {
  position: absolute;
  z-index: 18;
  transform: translate(-50%, -50%) scale(0.8);
  opacity: 0;
  min-width: 140px;
  padding: 8px 18px;
  border: 3px solid #f8ebc5;
  border-radius: 6px;
  background: linear-gradient(135deg, #d33a3f 0%, #8e2630 100%);
  color: #fff3cc;
  font-family: 'Bangers', Impact, sans-serif;
  font-size: 26px;
  letter-spacing: 2px;
  text-align: center;
  text-transform: uppercase;
  pointer-events: none;
  box-shadow: 5px 6px 0 #091725, 0 0 20px rgba(255, 217, 120, 0.6);
  transform-origin: center center;
}

.impact.show {
  animation: comicImpactPop 0.65s cubic-bezier(0.15, 0.9, 0.25, 1);
}

@keyframes comicImpactPop {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.4) rotate(-8deg); }
  25% { opacity: 1; transform: translate(-50%, -50%) scale(1.15) rotate(3deg); }
  60% { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(0deg); }
  100% { opacity: 0; transform: translate(-50%, -70%) scale(0.85); }
}
```

---

## 5. Visual Verification Checklist

- [ ] **1:1 Shield Drag Responsiveness**: Click and drag Steve Rogers' shield across the screen. Confirm that Cap tracks the pointer with zero input lag (0ms delay) and no rubber-band snapping.
- [ ] **Vertical Horizon Grounding**: Resize the browser window from 1920×1080 to 1280×1024 (5:4) and 2560×1080 (21:9). Verify Cap's feet remain anchored to the street horizon line and do not float into the sky or sink below ground.
- [ ] **Hazard Bounding Box Precision**: Watch incoming debris approach the shield. Confirm that the physical rock texture matches the collision moment without pre-contact clipping.
- [ ] **Trajectory Visibility in Section 2**: Advance to Section 2 (Crossing Under Fire). Verify the dashed incoming threat line is sharply visible against dusty background explosions.
- [ ] **Elimination of Duplicate CSS**: Inspect `styles.css` lines 8–13. Confirm `.vfx-canvas` and `.screen-flash` are declared only once.
- [ ] **Comic Impact Burst Visuals**: Successfully block a rock with a centered deflection. Verify the comic sound bubble displays with bold `Bangers` typography and crimson comic gradients instead of the generic blue sci-fi rectangle.
- [ ] **Mobile HUD Spacing**: Test at 375×667 viewport (iPhone SE). Verify `#warning` and `#missionCue` do not overlap with Captain America's head.
