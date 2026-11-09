# Visual Flaw Audit & Technical Remediation: Civil War

**Target Application**: `civil war/`
- **Main Cinematic Combat**: `civilwar.html` (3,414 lines)
- **Embedded Sub-Game**: `arc-reactor-game/` (`index.html`, `style.css` 1,178 lines, `script.js` 1,139 lines)
**Auditor**: Teamwork Visual & QA Specialist  
**Evaluation Mode**: Brutally Honest, Evidence-Based Code & Asset Audit  
**Status**: COMPLETE

---

## 1. Executive Summary & Overall Visual Health Rating

### Visual Health Score: 58 / 100

| Sub-System | Visual Score | Primary Bottleneck |
| :--- | :---: | :--- |
| **Main Siberian Cinematic (`civilwar.html`)** | **64 / 100** | Critical stage cropping on non-16:9 viewports (`Math.max`), deliberate keyframe bug crippling impact climax, frozen puddle reflection transforms. |
| **Arc Reactor Minigame (`arc-reactor-game/`)** | **52 / 100** | Identical duplicated dummy audio assets, missing high-DPI Retina canvas scaling, 3.6 MB raw asset bloat, iframe mobile gesture collisions. |

The *Civil War* module represents an ambitious, cinematic showcase combining a 1600×900 virtual world multi-camera director rig, procedural snow physics, volumetric Siberian bunker lighting, and an embedded Iron Man drone flight sub-game. However, critical layout math errors, missing responsive touch mechanics, frozen puddle reflections, identical dummy audio duplication, and unscaled canvases severely degrade the visual presentation on any display that is not a standard 16:9 desktop monitor.

---

## 2. In-Depth Evaluation Across All 9 Visual Dimensions

### 1. Layout (Structure, Viewport Framing, Element Placement)
- **Main Cinematic (`civilwar.html:2785-2788`) — Critical**:  
  The stage fit calculation uses:
  ```javascript
  function fitStage() {
    stageScale = Math.max(innerWidth / 1600, innerHeight / 900);
    applyCam(0);
  }
  ```
  Using `Math.max` instead of `Math.min` causes catastrophic cropping on any non-16:9 aspect ratio. On mobile portrait viewports (e.g., 390×844 iPhone 13/14/15 or 412×915 Android), `innerHeight / 900 ≈ 0.938`, which scales the 1600px stage to ~1500px wide inside a 390px physical screen. Because the camera centers on world coordinates, Captain America (staged at x=320) is pushed off the left screen edge, while Iron Man (staged at x=1150) is pushed off the right screen edge. The entire clash animation occurs in invisible clipped off-screen margins.
- **Arc Reactor Sub-Game (`arc-reactor-game/style.css:140-180`) — Major**:  
  The top telemetry bar (`.hud-top`) uses `display: flex; justify-content: space-between; align-items: flex-start; padding: 20px 30px;`. On screen widths under 800px, the 3 HUD clusters (`DRONE HULL INTEGRITY`, `STARK RESTORATION PROTOCOL`, `ENERGY MATRIX HARVEST`) wrap unpredictably, overlapping the center mission banner (`#objective-banner`) and obscuring the 2.5D flight corridor.
- **Sub-Game Modal Integration (`civilwar.html:2585-2595`) — Minor**:  
  The `#arc-game-modal` container is pinned via `position: fixed; inset: 0; z-index: 80;`. However, the iframe child `#arc-game-iframe` lacks explicit flex containment, causing letterbox artifacts on ultra-wide (21:9) monitors where the 16:9 iframe leaves empty black margins that do not match the Siberian bunker background.

### 2. Styling (Color Palette, Typography, Visual Hierarchy, Theme Cohesion)
- **Main Cinematic (`civilwar.html:2370-2378`) — Critical (Deliberate CSS Bug)**:  
  In `#bug-css`, the stylesheet contains:
  ```css
  .shield-impact {
      animation: shieldImpact 800ms ease-out forwards;
  }
  ```
  The animation identifier refers to `shieldImpact` (camelCase), but the keyframe block in `#keyframes-css:2329` is defined as `@keyframes shield-impact` (kebab-case). Because CSS animation names are case-sensitive identifiers, the browser rejects the rule. When Cap’s vibranium shield strikes Iron Man’s chest plate, `.shield-impact` displays as a static, un-animated 230px blue circle instead of an expanding, shockwave-dispersing pulse. While designed as a DevTools debugging puzzle, it permanently cripples the visual climax of the scene if unpatched.
- **Main Cinematic Palette Cohesion — Polish**:  
  The Siberian bunker palette (`#04060a` deep void, `#0e1828` industrial steel, `#7fd8ff` arc cyan, `#c23040` shield crimson) is masterfully chosen. However, duplicate inline color literals appear across lines 2180–2250 rather than referencing centralized CSS custom properties.
- **Arc Reactor Styling (`arc-reactor-game/style.css:6-22`) — Minor**:  
  The subgame uses Stark HUD tokens (`--stark-cyan: #00e5ff`, `--stark-gold: #ffd54f`, `--stark-red: #ff3344`). However, in `style.css:88-98`, the `.lab-grid-bg` declares `background-image: linear-gradient(...)` with hardcoded `rgba(0, 229, 255, 0.08)` instead of using `var(--stark-cyan)`.

### 3. Animations (Transitions, Motion Fluidity, Timing, Visual Feedback)
- **Main Cinematic (`civilwar.html:784-791`) — Major (Frozen Reflection Transforms)**:  
  Floor reflections on the wet Siberian concrete are styled with:
  ```css
  #cap-refl .pose-inner,
  #im-refl .pose-inner {
      transform: none !important;
  }
  #im-refl .im-upper {
      transform: none !important;
  }
  ```
  This rule explicitly suppresses all dynamic limb, torso, and arm transforms on reflected avatars. When Captain America transitions from idle into an aggressive forward guard or windup lunge, his reflection remains completely frozen in the default rest pose. When Iron Man raises his arm to fire repulsors, the puddle reflection stays stiff with arms down. This produces an uncanny visual dissonance on the wet floor.
- **Arc Reactor Drone Inertia (`arc-reactor-game/script.js:475-510`) — Minor**:  
  The drone physics loop updates `drone.vx += ax` and `drone.vy += ay` with friction damping `0.92`. However, drone banking tilt (`drone.angle = drone.vx * 0.04`) snaps instantaneously without spherical or rotational interpolation (slerp), creating jerky sprite tilting during rapid key changes.
- **Arc Reactor Particle Dissipation (`arc-reactor-game/script.js:650-680`) — Polish**:  
  Energy cell harvest particles abruptly disappear when `p.life <= 0` instead of executing a smooth cubic-bezier alpha and scale fade-out.

### 4. Responsiveness (Scaling Across Resolutions, Aspect Ratios, Mobile/Desktop)
- **Main Cinematic (`civilwar.html:2608, 3194, 3212, 3223`) — Critical**:  
  The entire fight progression relies on keyboard input: `SPACE / RAISE SHIELD`, `SPACE / THROW THE SHIELD`, `SPACE / BRACE THE IMPACT`. On touchscreen devices (smartphones, iPads, tablets), there is zero on-screen touch UI or tap listener on `#prompt`. Mobile users see the prompt appear and count down, unable to interact, resulting in an automatic failure state.
- **Mobile Viewport Aspect Ratio Collapse — Critical**:  
  As identified in Dimension 1, viewport widths below 1200px or heights below 700px cause extreme cropping due to `Math.max` scaling in `civilwar.html:2786`.
- **Arc Reactor Sub-Game Iframe Touch Trapping (`arc-reactor-game/script.js:410-427`) — Major**:  
  While virtual touch buttons exist (`#boost-touch-btn`, `#dash-touch-btn`), the canvas touch listeners do not prevent default iOS viewport bouncing or gesture zoom gestures, leading to erratic game state resets when swiping near the viewport boundaries.

### 5. Assets (Sprites, Textures, Resolution, Fidelity, Placeholder Detection)
- **Arc Reactor Sub-Game Audio Assets — Critical (Identical Dummy Duplication)**:  
  In `civil war/arc-reactor-game/assets/sounds/`:
  - `activation.mp3`: 25,020 bytes (SHA-256: `3396a2851fe8368812c32cf9fcf534b4...`)
  - `collection.mp3`: 25,020 bytes (SHA-256: `3396a2851fe8368812c32cf9fcf534b4...`)
  - `synchronization.mp3`: 25,020 bytes (SHA-256: `3396a2851fe8368812c32cf9fcf534b4...`)
  - `warning.mp3`: 25,020 bytes (SHA-256: `3396a2851fe8368812c32cf9fcf534b4...`)
  Every single sound effect file in the sub-game is an identical duplicate audio file! Collecting an energy cell, receiving an obstacle proximity alarm, synchronizing the matrix, and activating the reactor core all play the exact same beep. This completely destroys audio-visual feedback.
- **Arc Reactor Sub-Game Asset Bloat — Major**:  
  `civil war/arc-reactor-game/assets/images/reactor-bg.png` is an uncompressed 3,634,816 byte (3.63 MB) PNG image. Loading a 3.6 MB image inside an iframe on mobile data causes significant frame drops and delay before Stage 1 initializes.
- **Main Cinematic Asset Fidelity — Minor**:  
  Main character artwork (`assets/im_clean.png` and `assets/cap_clean.png`) uses 260×560px raster sprites overlaid with vector SVGs. On high-resolution displays when the camera pushes into `closeRepl` or `finalWide`, raster compression artifacts and pixelation become visible along Cap’s helmet straps and Iron Man’s shoulder seams.

### 6. HUD and Canvas Alignment (Overlay Positioning, Health Bars, Coordinate Mapping)
- **Arc Reactor Canvas High-DPI Scaling (`arc-reactor-game/script.js:429-438`) — Major**:  
  ```javascript
  function resizeCanvases() {
      if (DOM.canvas1) {
          DOM.canvas1.width = window.innerWidth;
          DOM.canvas1.height = window.innerHeight;
      }
      if (lightCanvas) {
          lightCanvas.width = window.innerWidth;
          lightCanvas.height = window.innerHeight;
      }
  }
  ```
  The canvases are sized directly to CSS logical pixels with zero `window.devicePixelRatio` scaling. On MacBook Retina displays (DPR: 2.0), 4K monitors (DPR: 1.5–2.0), or modern smartphones (DPR: 2.5–3.0), the 2.5D drone flight tunnel, electric hazard arcs, and light cones are drawn at 1x and upscaled by the GPU, resulting in blurry, fuzzy visuals.
- **Main Cinematic Coordinate Decoupling (`civilwar.html:2643-2648`) — Minor**:  
  Master impact anchor points (`P_IM_CHEST = { x: 1255, y: 394 }`, `P_CLASH = { x: 820, y: 465 }`) are hardcoded in world coordinates. When the camera dynamically shakes (`shake-l`), sparks are spawned into `#sparks` inside `#world`, while `#flash-full` is outside `#world` inside `#app`. This creates a slight 1-frame perceptual parallax between the full-screen flash and the localized spark emitter.

### 7. Contrast (Readability, Background vs Foreground, Accessibility)
- **DevTools Debugging Overlay (`civilwar.html:2150-2180`) — Major**:  
  In `#debug-overlay`, the secondary instruction text (`.d-instruction`, `.d-sub`) is rendered in `#7a8fa6` on a dark translucent panel (`rgba(6, 10, 18, 0.94)`) with an intense red ambient box shadow (`0 0 80px rgba(255, 30, 30, 0.3)`). The contrast ratio is 3.4:1, failing WCAG 2.1 AA requirements (minimum 4.5:1). Under bright ambient lighting or on low-contrast screens, players struggle to read the DOM attribute instructions.
- **Flash Screen Subtitle Bleach (`civilwar.html:2470, 2803-2808`) — Minor**:  
  When `#flash-full` fires at opacity `0.7–0.8` during the unibeam clash, the white subtitle text in `#caption` lacks a sufficient dark underlay outline or backdrop filter, making dialog momentarily invisible against the whiteout flash.

### 8. Clipping (Z-Index Overlaps, Boundary Breaches, Overflow Issues)
- **Cinema Letterbox Text Cutoff (`civilwar.html:2200-2220, 2510-2540`) — Major**:  
  The letterbox bars (`#letterbox-t`, `#letterbox-b`) are styled with `height: 6.5vh; min-height: 48px; z-index: 60;`. On laptop screens with short viewport heights (<650px) or mobile landscape orientations (<450px), the bottom letterbox bar directly overlaps `#caption` and `#prompt`, cutting off the lower half of subtitle text and action buttons.
- **Arc Reactor Chamber Overflow (`arc-reactor-game/style.css:82-86`) — Minor**:  
  `#stage2-chamber` has `overflow-y: auto`. On short browser windows, the vertical chamber rings trigger a native browser scrollbar inside the iframe, disrupting the futuristic HUD frame.

### 9. Visual Spectacle (Special Effects, Impact Feel, Visual Juice, Cinematic Polish)
- **Cinematic Strengths**:  
  Outstanding multi-camera direction with seamless lerp transitions, atmospheric Siberian snowfall with randomized wind drift, swinging overhead utility light fixture casting dynamic shadows, and chest-originating unibeam flare.
- **Spectacle Defect (Climactic Shield Impact Freeze) — Major**:  
  Because of the CSS identifier case bug (`shieldImpact`), the climactic moment where Cap slams his shield into Tony’s arc reactor loses its kinetic impact. Instead of an expanding shockwave with secondary light bursts, the impact freezes as an opaque circle.
- **Lack of Screen Distortion / Chromatic Aberration — Polish**:  
  The unibeam discharge and finishing shield strike would benefit immensely from a momentary SVG displacement filter (`feDisplacementMap`) or chromatic aberration shift on `#world`.

---

## 3. Prioritized Defect Catalog

| Defect ID | Dimension | Severity | Location / Element | Defect Summary |
| :--- | :--- | :---: | :--- | :--- |
| **CW-DEF-01** | Layout / Resp | **Critical** | `civilwar.html:2786` | `Math.max` in `fitStage()` crops Cap and Iron Man off-screen on non-16:9 and mobile viewports. |
| **CW-DEF-02** | Styling | **Critical** | `civilwar.html:2376` | Keyframe case mismatch (`shieldImpact` vs `shield-impact`) breaks the climactic impact VFX ring. |
| **CW-DEF-03** | Assets | **Critical** | `arc-reactor-game/assets/sounds/` | All 4 MP3 audio files (`activation`, `collection`, `synchronization`, `warning`) are identical 25KB duplicates. |
| **CW-DEF-04** | Responsiveness | **Critical** | `civilwar.html:2608, 3194` | Zero touch interaction or visible touch action targets for mobile/tablet players during prompts. |
| **CW-DEF-05** | Animations | **Major** | `civilwar.html:784-791` | Floor puddle reflections have `transform: none !important`, freezing avatar limbs in static rest poses. |
| **CW-DEF-06** | HUD / Canvas | **Major** | `arc-reactor-game/script.js:429-438` | Canvas resize lacks `window.devicePixelRatio` scaling, causing blurry rendering on Retina/High-DPI displays. |
| **CW-DEF-07** | Assets | **Major** | `arc-reactor-game/assets/images/` | `reactor-bg.png` is an uncompressed 3.63 MB PNG causing network and decode latency. |
| **CW-DEF-08** | Clipping | **Major** | `civilwar.html:2200-2220, 2510` | Bottom letterbox bar (`#letterbox-b`) overlaps captions and prompt button on screens <650px high. |
| **CW-DEF-09** | Contrast | **Major** | `civilwar.html:2150-2180` | DevTools instruction text (`#7a8fa6`) on dark red glow fails WCAG AA contrast (3.4:1 vs 4.5:1). |
| **CW-DEF-10** | Layout | **Major** | `arc-reactor-game/style.css:140-180` | HUD top bar flex layout breaks and overlaps objective banner on widths <800px. |
| **CW-DEF-11** | Contrast | **Minor** | `civilwar.html:2470, 2803` | Screen flash (`#flash-full`) bleaches out subtitles due to missing text casing/backdrop. |
| **CW-DEF-12** | Animations | **Minor** | `arc-reactor-game/script.js:475-510` | Drone banking angle snaps linearly without rotational smoothing (lerp). |
| **CW-DEF-13** | Visual Spectacle | **Polish** | `civilwar.html:2475-2500` | Unibeam impact lacks chromatic aberration / lens distortion kick. |

---

## 4. Concrete Technical Remediation Plans

### Remediation 1: Fix Virtual World Stage Scaling (CW-DEF-01)
**File**: `civil war/civilwar.html`  
**Lines**: 2785–2788  
**Issue**: `Math.max` scales based on the larger axis, causing extreme horizontal cropping on tall or narrow viewports.  
**Replacement Code**:
```javascript
function fitStage() {
    // Letterbox/pillarbox cleanly across all display ratios using Math.min
    stageScale = Math.min(innerWidth / 1600, innerHeight / 900);
    applyCam(0);
}
addEventListener('resize', fitStage);
```

---

### Remediation 2: Repair Deliberate Keyframe Animation Mismatch (CW-DEF-02)
**File**: `civil war/civilwar.html`  
**Lines**: 2370–2378  
**Issue**: Keyframes rule is named `shield-impact` in `#keyframes-css`, but selector references `shieldImpact`.  
**Replacement Code**:
```html
<style id="bug-css">
    /* ── SHIELD IMPACT FX REPAIR ───────────────────────────────
       Corrected keyframe identifier to kebab-case matching #keyframes-css
       ─────────────────────────────────────────────────────────── */
    .shield-impact {
        animation: shield-impact 800ms cubic-bezier(0.15, 0.85, 0.35, 1.2) forwards;
    }
</style>
```

---

### Remediation 3: Synchronize Puddle Reflection Poses (CW-DEF-05)
**File**: `civil war/civilwar.html`  
**Lines**: 784–791  
**Issue**: `transform: none !important` freezes character reflections in static standing poses.  
**Replacement Code**:
```css
/* Inherit dynamic parent pose rotations and limb transforms with inverted Y scale */
#cap-refl .pose-inner {
    transform: scaleY(-1) !important;
    transform-origin: center bottom;
}
#im-refl .pose-inner {
    transform: scaleY(-1) !important;
    transform-origin: center bottom;
}
#im-refl .im-upper {
    transform: scaleY(-1) !important;
    transform-origin: center 40%;
}
```

---

### Remediation 4: Universal Touch Interaction Support (CW-DEF-04)
**File**: `civil war/civilwar.html`  
**Lines**: 2670–2710, 3194  
**Issue**: Keyboard-only `SPACE` listener locks out touch device users.  
**Replacement Code**:
```javascript
// Add explicit touch handler to interactive prompt element
if (promptEl) {
    promptEl.style.cursor = 'pointer';
    promptEl.style.pointerEvents = 'auto';
    promptEl.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (S.prompt && S.prompt.active) {
            handleActionInput();
        }
    });
}

// Global tap fallback during active combat prompts
window.addEventListener('pointerdown', (e) => {
    // Ignore clicks on header/audio buttons or modal overlays
    if (e.target.closest('#mute') || e.target.closest('#start') || e.target.closest('#arc-game-modal')) return;
    if (S.prompt && S.prompt.active) {
        handleActionInput();
    }
});

function handleActionInput() {
    if (!S.prompt || !S.prompt.active) return;
    if (S.prompt.type === 'BLOCK') { S.flags.blocked = true; doBlock(); }
    else if (S.prompt.type === 'THROW') { S.flags.thrown = true; doThrow(); }
    else if (S.prompt.type === 'BRACE') { S.flags.braced = true; doBrace(); }
    resolvePrompt(true);
}
```

---

### Remediation 5: High-DPI Retina Canvas Scaling (CW-DEF-06)
**File**: `civil war/arc-reactor-game/script.js`  
**Lines**: 429–438  
**Issue**: 1x canvas buffer causes fuzzy rendering on high-DPI displays.  
**Replacement Code**:
```javascript
function resizeCanvases() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for performance
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (DOM.canvas1) {
        DOM.canvas1.width = w * dpr;
        DOM.canvas1.height = h * dpr;
        DOM.canvas1.style.width = w + 'px';
        DOM.canvas1.style.height = h + 'px';
        const ctx = DOM.canvas1.getContext('2d');
        ctx.resetTransform();
        ctx.scale(dpr, dpr);
    }
    if (lightCanvas) {
        lightCanvas.width = w * dpr;
        lightCanvas.height = h * dpr;
        lightCanvas.style.width = w + 'px';
        lightCanvas.style.height = h + 'px';
        const lctx = lightCanvas.getContext('2d');
        lctx.resetTransform();
        lctx.scale(dpr, dpr);
    }
}
```

---

### Remediation 6: Synthesize Procedural Web Audio for Sub-Game (CW-DEF-03)
**File**: `civil war/arc-reactor-game/script.js`  
**Lines**: 120–160  
**Issue**: All 4 MP3 files are identical dummy audio files.  
**Remediation**: In lieu of large multi-megabyte sound assets, implement a lightweight procedural Web Audio API synthesizer matching the main game:
```javascript
const SoundFX = (function() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    return {
        collect() {
            if (ctx.state === 'suspended') ctx.resume();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            osc.frequency.exponentialRampToValueAtTime(880.00, ctx.currentTime + 0.15); // A5
            gain.gain.setValueAtTime(0.25, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(); osc.stop(ctx.currentTime + 0.2);
        },
        warning() {
            if (ctx.state === 'suspended') ctx.resume();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(160, ctx.currentTime + 0.25);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(); osc.stop(ctx.currentTime + 0.3);
        },
        activate() {
            if (ctx.state === 'suspended') ctx.resume();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.6);
            gain.gain.setValueAtTime(0.35, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(); osc.stop(ctx.currentTime + 0.7);
        }
    };
})();
```

---

### Remediation 7: Responsive Subtitle and Letterbox Clamping (CW-DEF-08)
**File**: `civil war/civilwar.html`  
**Lines**: 2200–2220, 2510–2520  
**Issue**: Absolute 6.5vh letterbox bar overlaps captions on short viewports.  
**Replacement Code**:
```css
#caption {
    position: absolute;
    bottom: clamp(52px, 8vh, 85px);
    left: 50%;
    transform: translateX(-50%);
    width: min(90vw, 920px);
    text-align: center;
    font-size: clamp(14px, 1.8vw, 22px);
    z-index: 65; /* Sits cleanly above letterbox bar (z-index: 60) */
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.95), 0 0 2px #000;
}

#prompt {
    bottom: clamp(95px, 14vh, 145px);
    z-index: 70;
}
```

---

## 5. Visual Verification Checklist

- [ ] **Stage Framing Check**: Resize browser window to mobile portrait (390×844) and ultrawide (21:9); confirm Captain America (left) and Iron Man (right) remain fully visible within letterboxed bounds.
- [ ] **Impact Ring Animation Check**: Trigger scene 3 clash; confirm `.shield-impact` plays an expanding 800ms shockwave pulse rather than displaying a static blue circle.
- [ ] **Reflection Parity Check**: Inspect Siberian floor during Cap's guard and Tony's unibeam windup; confirm puddle reflections mimic character arm and body angles in real-time.
- [ ] **Touch Input Verification**: On mobile device or Chrome touch emulation, verify tapping the screen or prompt button successfully advances combat cues (`BLOCK`, `THROW`, `BRACE`).
- [ ] **Retina Canvas Sharpness**: On a high-DPI display, inspect drone flight canvas and lightning arcs; verify lines are crisp without 1x GPU bitmap interpolation.
- [ ] **Audio Distinction Test**: In Arc Reactor subgame, collect an energy cell and approach an obstacle; verify distinct pitches for collection vs warning.
- [ ] **Caption Legibility Check**: Trigger unibeam full-screen flash; verify subtitles remain legible with high-contrast text backing.
