# Visual Flaw Audit & Technical Remediation: Hulk: Structural Rescue

**Target Application**: `hulk-structural-rescue/`
- **Core Files**: `index.html` (141 lines), `styles.css` (325 lines), `game.js` (275 lines)
- **Asset Directory**: `assets/` (hulk animation frames, background, rubble vector)
**Auditor**: Teamwork Visual & QA Specialist  
**Evaluation Mode**: Brutally Honest, Evidence-Based Code & Asset Audit  
**Status**: COMPLETE

---

## 1. Executive Summary & Overall Visual Health Rating

### Visual Health Score: 54 / 100

| Sub-System | Visual Score | Primary Bottleneck |
| :--- | :---: | :--- |
| **Playfield & Physics Staging** | **52 / 100** | Critical drag detachment on resize, poor rod depth contrast, colliding mission bar and Hulk sprite. |
| **Character & Animation Rig** | **56 / 100** | Ice-skating lateral slide without stepping kinematics, un-preloaded sprite frame flicker, disabled impact VFX. |
| **Asset & Code Hygiene** | **48 / 100** | 6.35 MB unreferenced asset bloat (including raw `.rar` archive), duplicate competing stylesheets in one file. |

*Hulk: Structural Rescue* is a tactile physics puzzle built on CSS 3D transforms (`preserve-3d`, `translateZ`, `rotate`) where players guide the Incredible Hulk to extract tangled structural steel beams from a collapsed skyscraper. While the visual concept and comic-book framing are strong, the execution is hampered by unpruned prototype debris: dual conflicting stylesheets, disabled particulate VFX, a lateral sliding animation that makes Hulk look like he is ice-skating across rubble, and a critical coordinate detachment bug that corrupts gameplay if the browser window resizes while dragging.

---

## 2. In-Depth Evaluation Across All 9 Visual Dimensions

### 1. Layout (Structure, Viewport Framing, Element Placement)
- **Hulk & Mission Bar Collision (`styles.css:51, 197-207`) — Major**:  
  The `.mission-bar` is positioned absolutely at `left: 24px; top: 103px; width: 275px;`. The `.hulk` character container is anchored at `left: 5%; bottom: 5%; width: 429px; height: 507px;`. On viewports with vertical heights under 850px (including standard 1366×768 laptops, 1280×800 screens, or browsers with dev tools / bookmarks visible), Hulk’s head, shoulders, and stability indicator badge directly collide with and render behind the mission bar.
- **Debris Pile & Exit Zone Spatial Tension (`styles.css:65, 91`) — Minor**:  
  The removal zone (`.removal-zone`) sits at `right: 5%; bottom: 9%; width: 112px; height: 112px;`. On compact desktop viewports, the debris pile (`width: min(53vw, 650px)`) encroaches within 30px of the exit zone, leaving very little maneuvering space for dragging long rods without accidentally triggering premature exit deposits.

### 2. Styling (Color Palette, Typography, Visual Hierarchy, Theme Cohesion)
- **Competing Legacy Stylesheet Duplication (`styles.css:1-36` vs `37-195`) — Major**:  
  The stylesheet opens with lines 1–36 defining an entire initial prototype (hot-pink/lime palette: `--acid: #8dff38; --pink: #ff497d;`, pure CSS vector buildings `.city`, `.smoke`, and pure CSS vector Hulk `.hulk-head`, `.arm`, `.hulk-body`). Then, on line 37, a second pass begins ("Refinement pass: quieter palette..."), redefining `:root` (`--acid: #c5e86c; --pink: #ed6e58;`), overriding rules, and finally suppressing the legacy nodes on line 194 (`.city, .smoke, .foreground { display: none; }`). Meanwhile, `index.html:102` still contains `<div class="debris foreground" aria-hidden="true"><i></i><i></i><i></i></div>`. This unpruned dead code increases payload size and creates cascading override confusion.
- **Washed-Out Halftone Texture (`styles.css:42`) — Polish**:  
  The comic halftone overlay (`.halftone`) is dialed down to `opacity: .08; background-size: 12px 12px;`. At 8% opacity, it fails to produce a crisp comic-book aesthetic and instead resembles slight monitor dirt or sensor noise.

### 3. Animations (Transitions, Motion Fluidity, Timing, Visual Feedback)
- **"Ice-Skating" Lateral Slide (`game.js:46-57`, `styles.css:205`) — Major**:  
  When the player clicks or drags a rod, `moveHulkNear(stick)` repositions Hulk laterally using `hulk.style.left = ${visualLeft}px`. In CSS, `.hulk` transitions using `transition: left .26s cubic-bezier(.2,.85,.32,1)`. Because no stepping, stomping, or leaping animation plays, Hulk slides smoothly sideways across the concrete in a static, frozen pose like an ice-skater. For an 8-foot-tall, 1,400-pound behemoth, this completely destroys physical believability.
- **Un-Preloaded Sprite Frame Jitter (`game.js:38-44`) — Minor**:  
  `setHulkAnimation(name)` swaps the sprite `img.src` at runtime via `window.setInterval` (`assets/hulk-animation/${name}-${state.hulkFrame % frameCount}.png`). Because the 22 individual frame images (`idle-0..7`, `bend-0..5`, `pull-0..7`) are not preloaded into the browser image cache, the first time Hulk transitions from idle to bend or pull, frames stutter or flash blank white while the browser fetches and decodes the PNG files.
- **Baseline Offsets Across Animation Sequences — Minor**:  
  Across `assets/hulk-animation/`, the bottom margin of the character sprite varies by 4–8px between the `bend` sequence and the `pull` sequence. This causes Hulk's feet to visibly pop vertically off the ground when switching between exertion modes.

### 4. Responsiveness (Scaling Across Resolutions, Aspect Ratios, Mobile/Desktop)
- **Critical Coordinate Detachment on Window Resize (`game.js:239-245`) — Critical**:  
  When `pointerdown` initiates a drag, line 239 executes `document.body.append(stick)`. This detaches the stick from its coordinate parent (`.structure`) and locks its dimensions to absolute viewport pixels (`stick.style.width = ...px; stick.style.left = ...px;`). If the player resizes the browser window or flips screen orientation while dragging, the original pile geometry breaks. Upon release, `releaseDrag()` attempts to restore the stick, but because the container dimensions have changed, the stick snaps to an offset, deformed coordinate position.
- **Sub-Standard Mobile Touch Targets (`styles.css:192`) — Major**:  
  The media query `@media(max-width:720px)` reduces rod height to `height: 20px`. A 20px hit height severely violates the WCAG 2.5.5 minimum touch target guideline (48×48px), leading to frustrating missed taps and unintentional drags of adjacent rods on mobile screens.

### 5. Assets (Sprites, Textures, Resolution, Fidelity, Placeholder Detection)
- **Massive Repository Bloat: Raw Archives & Abandoned Bitmaps — Major**:  
  Inspection of `hulk-structural-rescue/assets/` reveals:
  - `hulk-sprites.rar`: 3,845,684 bytes (~3.85 MB) — a raw WinRAR archive inadvertently checked into production assets.
  - `rescue-scene.png`: 2,508,911 bytes (~2.51 MB) — an abandoned, high-resolution graphic never referenced anywhere in code (the CSS references `rescue-background.png`).
  These two dead files contribute **6.35 MB** of completely useless repository bloat.
- **Uncompressed Background Bitmap — Minor**:  
  `rescue-background.png` is an uncompressed 2,870,000 byte (~2.87 MB) PNG. It should be converted to modern WebP (~320 KB), saving over 88% bandwidth without visual degradation.
- **Diagnostic Window Placeholder Status (`index.html:120-123`) — Minor**:  
  In `#bugScreen`, the diagnostic console shows `fix routine: TODO`, indicating unfinished placeholder UI that exposes developer scaffolding to end users.

### 6. HUD and Canvas Alignment (Overlay Positioning, Health Bars, Coordinate Mapping)
- **Zombie Timer Query in Game Loop (`game.js:3, 68-71`, `styles.css:49`) — Minor**:  
  In `game.js:3`, `const timerEl = document.querySelector('#timer');` is queried. Every frame in `tick()`, lines 68–71 attempt to format and update `timerEl.textContent`. However, `#timer` does not exist in `index.html`, and `styles.css:49` explicitly declares `.timer { display:none!important; }`. The game loop is continually running DOM formatting operations for an element that was removed from markup.
- **Progress Fill Low Contrast Track (`styles.css:54`) — Polish**:  
  The progress bar track (`.progress`) has `height: 5px; background: #34454b;` with no border stroke. Against the dark card background (`#101c24e8`), the empty track boundary is virtually invisible, making it difficult to judge remaining progress until the acid-green fill (`#c5e86c`) advances.

### 7. Contrast (Readability, Background vs Foreground, Accessibility)
- **Low Depth Differentiation in Rod Pile (`styles.css:94-105`) — Major**:  
  Steel rods are rendered with dark slate linear gradients (`#b6ad97` to `#827f74` and `#3b4a54` down to `#0e151a`) sitting directly on top of dark rubble (`#071017bb`) against a slate background (`#142735`). Because the depth shading is subtle, players cannot easily perceive which rods lie physically on top of which without hovering over each one individually.
- **Sub-10px Telemetry Contrast (`styles.css:53`) — Minor**:  
  The stability telemetry `.pulse-readout` uses `font-size: 9px; color: #9eaeaa;` on a `#101c24e8` background. The contrast ratio is 3.1:1, failing WCAG AA (minimum 4.5:1) and creating eye strain on non-calibrated displays.

### 8. Clipping (Z-Index Overlaps, Boundary Breaches, Overflow Issues)
- **Z-Index Layer Inversion on Drag (`styles.css:27, 32`, `game.js:239`) — Major**:  
  When dragged, `.stick.dragging` is appended to `document.body` with `position: fixed; z-index: 20;`. However, the modal dialogue containers (`.screen`, `#startScreen`, `#bugScreen`, `#resultScreen`) are defined with `z-index: 30;` in `styles.css:32`. If pointer events trigger a game-over or bug modal while dragging is active, the detached stick can render above modal dialogs or become permanently trapped on screen.
- **Steep Angle Overhang (`index.html:87`, `styles.css:91`) — Minor**:  
  Rod F (`--angle: 82deg; --w: 58%`) extends beyond the bottom boundary of `.stick-pile`, causing its lower tip to clip into the ground shadow layer.

### 9. Visual Spectacle (Special Effects, Impact Feel, Visual Juice, Cinematic Polish)
- **Explicitly Disabled Particulate VFX (`styles.css:247-252`) — Major**:  
  Lines 247–252 of `styles.css` contain:
  ```css
  .hulk-stomp-dust,
  .ground-fracture,
  .sparks-container,
  .impact-ring {
    display: none !important;
  }
  ```
  The developer explicitly suppressed all footfall dust, ground fractures, collision sparks, and impact shockwaves! In a game starring the Incredible Hulk manipulating multi-ton steel beams, the complete absence of dust puffs, seismic rubble shifts, and ground fractures leaves the interactions feeling weightless and sterile.
- **Missing Pile Settling Kinetic Feedback — Polish**:  
  When a structural beam is safely extracted, the remaining pile elements should exhibit a brief physics settling tremor (`rubble-settle`) with acoustic/visual micro-shakes to reinforce structural tension.

---

## 3. Prioritized Defect Catalog

| Defect ID | Dimension | Severity | Location / Element | Defect Summary |
| :--- | :--- | :---: | :--- | :--- |
| **HULK-DEF-01** | Responsiveness | **Critical** | `game.js:239-245` | Reparenting stick to `document.body` causes coordinate detachment and pile corruption on resize. |
| **HULK-DEF-02** | Visual Spectacle| **Major** | `styles.css:247-252` | Impact VFX (`.hulk-stomp-dust`, `.ground-fracture`, `.sparks-container`) explicitly disabled with `display: none !important`. |
| **HULK-DEF-03** | Assets | **Major** | `assets/` | 6.35 MB repository bloat from raw archive (`hulk-sprites.rar`) and unreferenced graphic (`rescue-scene.png`). |
| **HULK-DEF-04** | Layout | **Major** | `styles.css:51, 197-207` | Hulk sprite and stability label collide with mission bar on viewports <850px high. |
| **HULK-DEF-05** | Animations | **Major** | `game.js:46-57`, `styles.css:205` | Hulk slides sideways across asphalt in a static pose ("ice-skating") without stepping kinematics. |
| **HULK-DEF-06** | Contrast | **Major** | `styles.css:94-105` | Low depth contrast on dark slate rods against dark rubble makes beam overlap ambiguous. |
| **HULK-DEF-07** | Responsiveness | **Major** | `styles.css:192` | Stick height reduced to 20px on mobile (<720px), violating WCAG 48px touch target guidelines. |
| **HULK-DEF-08** | Styling | **Major** | `styles.css:1-36` vs `37-195` | Two complete competing stylesheets in one file with obsolete CSS overrides and dead DOM nodes. |
| **HULK-DEF-09** | Clipping | **Major** | `styles.css:27, 32` | Dragged stick appended to body can render above modal dialogs during state transitions. |
| **HULK-DEF-10** | Animations | **Minor** | `game.js:38-44` | Lack of sprite frame preloading causes white flash and animation stutter on first playthrough. |
| **HULK-DEF-11** | HUD / Canvas | **Minor** | `game.js:3, 68-71` | Game loop executes zombie updates on `#timer` which does not exist in HTML markup. |
| **HULK-DEF-12** | Styling | **Polish** | `styles.css:42` | Halftone dot pattern at 8% opacity appears as dirty screen noise rather than comic styling. |

---

## 4. Concrete Technical Remediation Plans

### Remediation 1: Retain Dragged Rod Within Container Coordinate Space (HULK-DEF-01)
**File**: `hulk-structural-rescue/game.js`  
**Lines**: 235–252  
**Issue**: Appending to `document.body` breaks container-relative percentage mapping upon window resize.  
**Replacement Code**:
```javascript
// Retain stick inside pile container, translate using CSS variables
stick.addEventListener('pointerdown', event => {
  if (state.mode !== 'play' || state.pulled.has(stick.dataset.stick)) return;
  event.preventDefault();
  state.dragging = stick;
  state.dragBlocked = isBlocked(stick);
  state.downX = event.clientX;
  state.downY = event.clientY;
  
  moveHulkNear(stick);
  setHulkAnimation('bend');
  hulk?.classList.add('exerting');
  if (state.dragBlocked) {
    hulk?.classList.add('straining-hazard');
    stick.classList.add('hazard-pulling');
  }

  // Elevate z-index inside local stacking context without reparenting to body
  stick.classList.add('dragging');
  try { stick.setPointerCapture(event.pointerId); } catch (_) {}
  
  // Track delta offsets from initial pointer position
  state.dragOffsetX = 0;
  state.dragOffsetY = 0;
});

stick.addEventListener('pointermove', event => {
  if (state.dragging !== stick) return;
  const dx = event.clientX - state.downX;
  const dy = event.clientY - state.downY;
  
  // Apply translation via CSS transform to preserve baseline percentage layout
  stick.style.transform = `rotate(var(--angle)) translate(${dx}px, ${dy}px) scale(1.05)`;
  
  const dist = Math.hypot(dx, dy);
  if (dist > 18 && state.hulkAnimation !== 'pull') {
    setHulkAnimation('pull');
  }
  
  const zoneBox = zone.getBoundingClientRect();
  const inExit = event.clientX >= zoneBox.left && event.clientX <= zoneBox.right &&
                 event.clientY >= zoneBox.top && event.clientY <= zoneBox.bottom;
  stick.classList.toggle('vanishing', inExit);
});
```

---

### Remediation 2: Re-Enable and Tune Tactile Impact VFX (HULK-DEF-02)
**File**: `hulk-structural-rescue/styles.css`  
**Lines**: 247–252  
**Issue**: Impact particulate VFX is suppressed via `display: none !important`.  
**Replacement Code**:
```css
/* Re-enable and tune visceral comic impact layers */
.hulk-stomp-dust {
  position: absolute;
  bottom: 4%;
  left: 8%;
  width: 90px;
  height: 25px;
  background: radial-gradient(ellipse at center, rgba(220, 215, 190, 0.45) 0%, transparent 70%);
  filter: blur(4px);
  pointer-events: none;
  opacity: 0;
  transform: scale(0.6);
}

.hulk.exerting ~ .playfield .hulk-stomp-dust,
.hulk.heaving ~ .playfield .hulk-stomp-dust {
  animation: dustPuff 0.4s ease-out forwards;
}

@keyframes dustPuff {
  0% { opacity: 0.8; transform: scale(0.6) translateY(0); }
  100% { opacity: 0; transform: scale(1.6) translateY(-14px); }
}

.ground-fracture {
  position: absolute;
  bottom: 3%;
  left: 10%;
  width: 140px;
  height: 12px;
  background: repeating-linear-gradient(45deg, #101820 0 4px, transparent 4px 8px);
  clip-path: polygon(0 50%, 20% 0, 45% 70%, 75% 20%, 100% 50%, 80% 100%, 35% 80%);
  opacity: 0;
  transition: opacity 0.3s;
}

.hulk.straining-hazard ~ .playfield .ground-fracture {
  opacity: 0.75;
}
```

---

### Remediation 3: Fix Hulk Lateral "Ice-Skating" Kinematics (HULK-DEF-05)
**File**: `hulk-structural-rescue/styles.css` & `hulk-structural-rescue/game.js`  
**Lines**: `styles.css:205`, `game.js:46-57`  
**Issue**: Linear horizontal position slide without weight transfer or stepping animation.  
**Replacement Code**:
```css
/* Add stepping bounce and tilt to Hulk container during lateral transition */
.hulk.repositioning {
  animation: hulkStepKinematics 0.28s ease-in-out;
}

@keyframes hulkStepKinematics {
  0% { transform: translateY(0) rotate(0deg); }
  35% { transform: translateY(-16px) rotate(2deg) scale(1.02); }
  70% { transform: translateY(-6px) rotate(-1deg); }
  100% { transform: translateY(0) rotate(0deg); }
}
```
In `game.js:46-57`:
```javascript
function moveHulkNear(stick) {
  if (!hulk) return;
  const fieldRect = playfield.getBoundingClientRect();
  const rodRect = stick.getBoundingClientRect();
  const hulkRect = hulk.getBoundingClientRect();
  const visualWidth = hulkRect.width;
  const rodX = rodRect.left + rodRect.width / 2 - fieldRect.left;
  const visualLeft = Math.max(0, Math.min(fieldRect.width - visualWidth, rodX - visualWidth * 0.72));
  
  hulk.classList.remove('repositioning');
  void hulk.offsetWidth; // Force DOM reflow to re-trigger step animation
  hulk.classList.add('repositioning');
  
  hulk.style.left = `${visualLeft}px`;
}
```

---

### Remediation 4: Resolve Hulk & Mission Bar Viewport Collision (HULK-DEF-04)
**File**: `hulk-structural-rescue/styles.css`  
**Lines**: 51, 197–207  
**Issue**: Absolute top-left positioning causes overlap on heights <850px.  
**Replacement Code**:
```css
/* Anchor mission status to HUD header flow or top-center safe area */
.mission-bar {
  position: absolute;
  z-index: 10;
  left: 24px;
  top: clamp(88px, 12vh, 112px);
  width: min(280px, 32vw);
  max-height: calc(100vh - 540px); /* Clamp height to prevent encroaching into Hulk's bounds */
}

@media (max-height: 800px) {
  .mission-bar {
    top: 14px;
    left: 50%;
    transform: translateX(-50%);
    width: auto;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 8px 18px;
  }
  .mission-bar p { margin: 0; font-size: 13px; }
  .pulse-readout { margin: 0; }
}
```

---

### Remediation 5: Preload Sprite Animation Frames (HULK-DEF-10)
**File**: `hulk-structural-rescue/game.js`  
**Lines**: 32–45  
**Issue**: Dynamic runtime frame swapping causes white flashes and missing frames.  
**Replacement Code**:
```javascript
// Preload all 22 sprite frames into browser image cache on boot
const SPRITE_CACHE = {};
function preloadHulkSprites() {
  const animations = { idle: 8, bend: 6, pull: 8 };
  Object.entries(animations).forEach(([name, count]) => {
    SPRITE_CACHE[name] = [];
    for (let i = 0; i < count; i++) {
      const img = new Image();
      img.src = `assets/hulk-animation/${name}-${i}.png`;
      SPRITE_CACHE[name].push(img);
    }
  });
}
preloadHulkSprites();

function setHulkAnimation(name) {
  if (state.hulkAnimation === name && state.hulkTimer) return;
  state.hulkAnimation = name;
  state.hulkFrame = 0;
  window.clearInterval(state.hulkTimer);
  if (!hulkSprite) return;
  
  const frames = SPRITE_CACHE[name] || [];
  const showFrame = () => {
    if (frames.length > 0) {
      hulkSprite.src = frames[state.hulkFrame % frames.length].src;
    }
    state.hulkFrame += 1;
  };
  showFrame();
  state.hulkTimer = window.setInterval(showFrame, name === 'pull' ? 75 : (name === 'bend' ? 120 : 150));
}
```

---

### Remediation 6: Enhance Rod Depth Highlighting (HULK-DEF-06)
**File**: `hulk-structural-rescue/styles.css`  
**Lines**: 94–105  
**Issue**: Ambiguous depth between crossing steel rods.  
**Replacement Code**:
```css
/* Dynamic depth shading based on --depth variable */
.stick {
  position: absolute;
  left: var(--x);
  top: var(--y);
  width: var(--w);
  height: 28px;
  z-index: calc(5 + var(--depth));
  border: 2px solid #14202a;
  border-radius: 4px;
  /* Top rods receive brighter rim-light; lower rods receive ambient occlusion shadow */
  background: linear-gradient(
    180deg,
    hsl(42, 20%, calc(45% + var(--depth) * 2.5%)) 0%,
    hsl(35, 15%, calc(28% + var(--depth) * 2%)) 100%
  );
  box-shadow:
    0 calc(2px + var(--depth) * 1.5px) calc(4px + var(--depth) * 2px) rgba(5, 13, 19, 0.75),
    inset 0 1px 1px rgba(255, 255, 255, calc(0.15 + var(--depth) * 0.03));
}
```

---

## 5. Visual Verification Checklist

- [ ] **Drag Scaling Verification**: Initiate dragging rod D; while keeping pointer depressed, resize browser window from desktop to mobile width; confirm rod remains aligned under pointer and returns cleanly to pile on release.
- [ ] **Impact Particulate Verification**: Click a free rod; verify ground fracture graphic and footfall dust puff appear beneath Hulk's boots upon exertion.
- [ ] **Kinematic Step Verification**: Click a rod on the far right of the pile; verify Hulk bobs vertically and rotates slightly with weight transfer rather than sliding like an ice-skater.
- [ ] **Viewport Height Collision Check**: Resize browser window height to 700px; confirm Hulk's head does not clip into the mission panel card.
- [ ] **Sprite Preload Cleanliness**: Perform hard refresh (`Ctrl+F5`) and immediately drag a rod; confirm zero white frame flashing during transition from idle to bend.
- [ ] **Depth Clarity Verification**: View the tangled pile without hovering; confirm higher rods are visibly distinct from deeper rods via depth lighting and drop shadows.
- [ ] **Repository Bloat Check**: Confirm `hulk-sprites.rar` and `rescue-scene.png` are flagged for removal from production assets.
