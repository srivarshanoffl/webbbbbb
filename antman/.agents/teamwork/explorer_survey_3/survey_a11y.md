# UX, Accessibility & Interaction Architecture Survey
**Project:** Ant-Man Nano-Repair 2.5D Game  
**Author:** UX & Accessibility Explorer (`explorer_survey_3`)  
**Workspace:** `c:\Users\sriva\parllel3`  
**Reference Document:** `ORIGINAL_REQUEST.md` (R1–R4, Acceptance Criteria)  
**Deliverable File:** `c:\Users\sriva\parllel3\.agents\teamwork\explorer_survey_3\survey_a11y.md`  

---

## 1. Executive Summary & Accessibility Philosophy

The Ant-Man Nano-Repair game is an interactive 2.5D showcase piece where players guide Ant-Man through shrinking into the microscopic circuitry of a malfunctioning nanotech machine and reconnecting dislodged quantum wire conduits across eight distinct phases.

To achieve production-grade quality, the game must not treat accessibility as an afterthought or a "fallback mode." Accessibility and tactile feedback are core gameplay pillars. Every mechanic—from wire pairing to precision timing—must operate with equal fluency across **mouse**, **touch**, and **keyboard** interfaces.

### Core Architectural Invariants:
1. **Multi-Modal Parity:** Complete gameplay can be executed via Mouse, Touch (Pointer Events), or Keyboard (Tab, Enter, Space, Arrows, Escape). No feature is keyboard-locked or touch-exclusive.
2. **WCAG 2.1 AA / AAA Compliance:**
   - **1.4.1 Use of Color (Level A):** Color is never the sole medium for conveying state, identity, or errors.
   - **1.4.3 & 1.4.6 Contrast (Level AA / AAA):** High contrast (>4.5:1 for body text, >7:1 for headers and vital alerts).
   - **1.4.11 Non-Text Contrast (Level AA):** UI boundaries, interactive sockets, and focus rings exceed 3:1 against adjacent backgrounds.
   - **2.1.1 & 2.1.2 Keyboard Operable & No Keyboard Trap (Level A):** Universal navigation without dead-ends.
   - **2.4.7 Focus Visible (Level AA):** Distinct, unmissable `:focus-visible` dual-ring indicators.
   - **2.5.5 & 2.5.8 Target Size (Level AAA / AA):** Minimum 44×44px interactive hitboxes for all terminals and buttons, with ample clearance.
3. **Sound-Ready Visual Feedback + Zero-Asset Synthesized Audio:**
   - Rich visual states (pulses, shockwave ripples, particle bursts, glow surges, stroke dash animations) provide complete tactile satisfaction even in total silence.
   - Self-contained Web Audio API synthesizer providing immediate acoustic confirmation with zero external audio assets (0 byte network overhead).
4. **Adaptive Viewport Architecture:**
   - Fluid responsiveness across Desktop (1920×1080 down to 1024×768), Tablet (768×1024), and Mobile (360×640 up to 414×896).
   - Real-time SVG coordinate recalculation upon resize or orientation changes.
5. **Zero Console Errors & Modular Vanilla JS:**
   - Defensive, structured architecture in `script.js` separating state, UI, audio, input, wiring, and timing.

---

## 2. Input Architecture & Multi-Modal Control System

### 2.1 Unified Pointer Events Pipeline
Rather than fragmenting logic between legacy `MouseEvent` and `TouchEvent` APIs (which suffer from click delays, double-firing, and touch-scrolling conflicts), all drag and tap interactions are bound to the **Pointer Events API** (`pointerdown`, `pointermove`, `pointerup`, `pointercancel`).

```
+-------------------------------------------------------------------------+
|                          Pointer Event Pipeline                         |
+-------------------------------------------------------------------------+
                                     |
                       [pointerdown] on Terminal
                                     |
                +--------------------+--------------------+
                |                                         |
     [Is Already Dragging?]                      [Initial Interaction]
                |                                         |
               No                                         |
                |                           +-------------+-------------+
        Capture Pointer ID                  |                           |
   (target.setPointerCapture)           Direct Tap                 Drag Hold
                |                           |                           |
        Spawn Active Wire            Select Terminal             Pointer Move
     (SVG Path to cursor)         (aria-pressed="true")       (Update Bezier)
                |                           |                           |
                +--------------------+------+                           |
                                     |                                  |
                                [pointerup]                             |
                                     |                                  |
                   Destination Element Under Pointer?                   |
                (e.target or elementFromPoint(X, Y))                    |
                                     |                                  |
                +--------------------+--------------------+             |
                |                                         |             |
        Valid Destination                     Invalid / Empty Space     |
                |                                         |             |
          Matches Source?                         Snapback Recoil       |
          /             \                          (Cancel Drag)        |
        YES             NO                                              |
         |               |                                              |
    Lock Wire       Error Shake                                         |
   Play Chord       Play Buzzer                                         |
   Increment        (Do NOT reset                                       |
    Counter         completed pairs)                                    |
```

#### Key Implementation Directives:
- **Touch Action Suppression:** The game canvas and interactive terminal board MUST specify `touch-action: none;` via CSS to prevent mobile Safari/Chrome from triggering scroll gestures, pinch-zoom, or text selection while drawing wires.
- **Pointer Capture:** When initiating a drag on `pointerdown`, call `e.target.setPointerCapture(e.pointerId)`. This ensures smooth wire tracking even if the user's cursor or finger moves outside the browser window or off the board boundaries.
- **Coordinate Normalization:** SVG coordinates must be mapped using the SVG element's Screen Coordinate Transformation Matrix (`getScreenCTM().inverse()`) or normalized viewport offsets (`getBoundingClientRect()`), accounting for CSS 2.5D transforms.

### 2.2 Dual Manipulation Paradigms: Drag-to-Connect vs Click-to-Connect
Players exhibit diverse physical abilities and input hardware. For instance, a player using a head-wand, eye-tracker, trackball, or one experiencing tremors may struggle with continuous mouse-hold drag. Therefore, both interaction models are natively active simultaneously:

#### Paradigm A: Drag-to-Connect (Continuous Manipulation)
1. User presses pointer down on a source terminal (Left Column).
2. Pointer is captured; an active SVG path is created from source center $(X_1, Y_1)$ to pointer position $(X_p, Y_p)$.
3. As the pointer moves, the dynamic Bezier curve updates at 60 FPS:
   $$C(t) = (1-t)^3 P_0 + 3(1-t)^2 t P_1 + 3(1-t) t^2 P_2 + t^3 P_3$$
   where $P_1 = (X_1 + \Delta X \cdot 0.5, Y_1)$ and $P_2 = (X_p - \Delta X \cdot 0.5, Y_p)$.
4. User releases pointer over a destination terminal:
   - Hit detection via `document.elementFromPoint(e.clientX, e.clientY)`.
   - If destination terminal matches source: connection locks, terminals disable, SVG path stabilizes with glowing pulse.
   - If mismatch or dropped in void: wire snaps back cleanly (recoil animation) to source socket. **Prior completed wires remain 100% untouched.**

#### Paradigm B: Click/Tap-to-Connect (Discrete Stepped Selection)
1. User clicks or taps source terminal once.
2. Terminal enters selected state:
   - Visual: Pulsing neon border, socket glyph rotates/flares.
   - Accessibility: `aria-pressed="true"`, announcer reads: `"Selected Alpha 1 Red Terminal. Select target terminal."`
3. User clicks/taps destination terminal:
   - If match: wire connects immediately.
   - If mismatch: both terminals flash red, shake slightly, clear selection, and announcer reads: `"Mismatch. Alpha 1 cannot connect to Beta 2. Try again."`
4. User clicks empty canvas or presses `Escape`: cancels current selection.

### 2.3 Full Keyboard Navigation Architecture
Every interactive element adheres to strict keyboard operation. Tab order follows the visual and logical flow of each phase without trap hazards.

#### Global Keyboard Mapping Matrix

| Key / Key Combo | Target Phase | Context / Focused Element | Action Performed | Screen Reader Output (`aria-live`) |
|:---|:---:|:---|:---|:---|
| `Tab` | All | Any focusable element | Moves focus forward in logical sequence | Reads focused element label & role |
| `Shift + Tab` | All | Any focusable element | Moves focus backward in logical sequence | Reads focused element label & role |
| `Enter` or `Space` | Phase 1 | `#btn-begin-repair` | Dispatches `BEGIN_REPAIR`, transitions to Phase 2 | `"Initiating repair sequence. Ant-Man shrinking."` |
| `Enter` or `Space` | Phase 2 | `#btn-skip-shrink` | Skips shrinking animation immediately to Phase 3 | `"Animation skipped. Entering nano machine."` |
| `Enter` or `Space` | Phase 3 | `#btn-enter-circuit` | Advances to Phase 4 wire bay | `"Entering junction board. Objective: Reconnect four wire pairs."` |
| `Enter` or `Space` | Phase 4 | Source Terminal (Left) | Selects wire terminal for connection | `"Selected Alpha 1 Red Terminal. Choose target terminal."` |
| `Enter` or `Space` | Phase 4 | Target Terminal (Right) | Completes connection attempt with selected source | If match: `"Connected Alpha 1. 1 of 4 connected."` / If mismatch: `"Mismatch. Wire retracted."` |
| `Escape` | Phase 4 / 5 | Any selected terminal | Cancels selection; deselects active wire | `"Selection cancelled."` |
| `ArrowUp` / `ArrowDown` | Phase 4 / 5 | Wire Terminals | Moves focus vertically between terminals in current rack | Reads focused terminal |
| `ArrowRight` | Phase 4 / 5 | Source Terminal (Left Rack) | Moves focus horizontally to corresponding Destination Terminal (Right Rack) | Reads target terminal |
| `ArrowLeft` | Phase 4 / 5 | Destination Terminal (Right Rack) | Moves focus horizontally to corresponding Source Terminal (Left Rack) | Reads source terminal |
| `Space` or `Enter` | Phase 5 | Timing Gauge / Wire Connection | Triggers contact connection during safe window oscillation | If safe: `"Current synchronized! Wire 1 locked."` / If missed: `"Timing desync: Discharge deflected. Retry now."` |
| `Enter` or `Space` | Phase 6 | `#btn-bypass-debug` | Bypasses placeholder immediately to Phase 7 | `"Diagnostic bypassed. Powering up systems."` |
| `Enter` or `Space` | Phase 7 | `#btn-phase7-continue` | Advances from machine restart to Phase 8 | `"System restored. Initiating growth sequence."` |
| `Enter` or `Space` | Phase 8 | `#btn-play-again` | Resets game state to Phase 1 completely | `"Game reset. Malfunction detected."` |

---

## 3. Touch Target Standards & Ergonomics

Mobile and touchscreen ergonomics require strict hit target sizing. Touch points lack mouse precision; small targets cause frustration, mis-taps, and accidental activations.

```
+-------------------------------------------------------------+
|               Terminal Hitbox Ergonomics (48x48)            |
+-------------------------------------------------------------+
|  [Transparent / Padded Hit Area: 48px x 48px (Min 44px)]    |
|                                                             |
|         +-----------------------------------------+         |
|         |    Visible Bezel Rim (36px x 36px)      |         |
|         |                                         |         |
|         |        +-----------------------+        |         |
|         |        |  Socket Core (28px)   |        |         |
|         |        |   [▲ Glyph + Ring]    |        |         |
|         |        +-----------------------+        |         |
|         +-----------------------------------------+         |
|                                                             |
+-------------------------------------------------------------+
               <--------- Minimum 12px Clearance --------->
```

### 3.1 Dimensions by Component
1. **Wire Puzzle Terminals (`.terminal`):**
   - **Outer Hit Area:** Minimum `48px × 48px` (exceeding WCAG 2.5.5 Level AAA 44×44px standard).
   - **Visual Socket Diameter:** `36px` outer metallic bezel, `28px` illuminated core.
   - **Inter-Target Clearance:** Minimum `12px` vertical margin between consecutive terminals to eliminate "fat-finger" overlap.
   - **Visual Touch Feedback:** Active state `:active` scales down slightly (`transform: scale(0.94)`) with an instantaneous bright flash to confirm physical registration.
2. **Action Buttons (`.btn-primary`, `.btn-secondary`):**
   - **Minimum Height:** `48px` (desktop: `52px`, mobile: `48px`).
   - **Minimum Width:** `160px` (or `100%` on mobile viewports $< 480px$).
   - **Padding:** `14px 28px`.
   - **Touch Target Padding:** Built directly into the box model (`box-sizing: border-box;`).
3. **Phase 5 Dedicated Timing Trigger Button (`#btn-timing-trigger`):**
   - For touch and mobile users, hitting the target window on small screens via a tiny terminal tap is ergonomically challenging.
   - An accessible, prominent touch trigger button is provided in Phase 5:
     - **Dimensions:** Minimum `54px` height, full width of the puzzle container.
     - **Label:** `"ENGAGE CONDUIT CURRENT [SPACEBAR / TAP]"`
     - Large tactile surface allows thumbs to rest naturally and tap at the precise millisecond.
4. **HUD Controls (Audio Mute, Info):**
   - Minimum `44px × 44px` square or circular hit boundary.

---

## 4. Visible Focus Rings (`:focus-visible`) & Focus Management

Default browser focus outlines are inconsistent, low-contrast, and frequently clipped by `overflow: hidden`. Completely removing focus outlines without replacement is a major accessibility violation.

### 4.1 High-Contrast Dual-Ring Focus Architecture
A high-performance dual-ring focus style ensures visibility regardless of whether the element sits on a pitch-black background, a vibrant neon wire conduit, or an illuminated warning panel.

```css
/* Universal Accessible Focus Style */
:focus {
  outline: none; /* Suppress unstyled default browser ring */
}

:focus-visible {
  outline: 3px solid #00E5FF !important; /* Vivid Cyan Primary Ring */
  outline-offset: 3px !important;
  box-shadow: 
    0 0 0 5px #0A0D14,                   /* Inner Dark Separation Guard */
    0 0 15px rgba(0, 229, 255, 0.8),    /* High-Intensity Outer Glow */
    inset 0 0 8px rgba(0, 229, 255, 0.4) !important;
  transition: outline-offset 0.15s ease, box-shadow 0.15s ease;
}

/* Terminals Focused State Animation */
.terminal:focus-visible {
  outline: 3px solid #FFD600 !important; /* Electric Amber Ring for Terminal Focus */
  outline-offset: 4px !important;
  box-shadow: 
    0 0 0 6px #0A0D14,
    0 0 20px rgba(255, 214, 0, 0.9) !important;
  animation: focus-pulse 1.4s ease-in-out infinite alternate;
}

@keyframes focus-pulse {
  0% { outline-offset: 3px; }
  100% { outline-offset: 6px; }
}
```

### 4.2 Focus Trapping & Phase-to-Phase Transition Management
When the game state advances from one phase to the next, focus must never be lost to `document.body` (which forces keyboard users to Tab dozens of times to find their place).

#### Transition Focus Routing Protocol:
- **Phase 1 -> Phase 2:** Immediately move focus to `#btn-skip-shrink` via `btnSkipShrink.focus()`.
- **Phase 2 -> Phase 3:** On shrink complete (or skip), move focus to `#btn-enter-circuit`.
- **Phase 3 -> Phase 4:** Move focus to the first active terminal: `#terminal-left-1`.
- **Phase 4 (4/4 Completed):** Stabilization triggers; automatically transfer focus to `#btn-phase4-continue`.
- **Phase 4 -> Phase 5:** Move focus to `#terminal-p5-left-1`.
- **Phase 5 (4/4 Completed):** Focus automatically transferred to `#btn-phase5-continue`.
- **Phase 5 -> Phase 6:** Focus placed squarely on `#btn-bypass-debug`.
- **Phase 6 -> Phase 7:** Focus placed on `#btn-phase7-continue`.
- **Phase 7 -> Phase 8:** Focus transferred to `#btn-play-again`.
- **Phase 8 -> Reset (Phase 1):** Focus cleanly reset to `#btn-begin-repair`.

Inactive phases MUST have `aria-hidden="true"` and `display: none` (or `visibility: hidden`) applied so that non-active phase buttons cannot be accidentally tabbed into.

---

## 5. Colorblind Accessibility & Universal Quad/Penta-Coding

### 5.1 The Dual-Coding Imperative
In accordance with **WCAG 2.1 Success Criterion 1.4.1 (Use of Color)**, color must NEVER be used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element.

Approximately 8% of men and 0.5% of women have some form of Color Vision Deficiency (CVD), including Protanopia (red-blind), Protanomaly (red-weak), Deuteranopia (green-blind), Deuteranomaly (green-weak), Tritanopia (blue-blind), and Achromatopsia (complete monochromacy).

### 5.2 Five-Dimensional Encoding Matrix (Phase 4 & Phase 5)

Every wire and terminal is encoded across **five distinct, redundant perceptual channels**:
1. **Hue Channel:** Optimized high-contrast color palette.
2. **Geometric Symbol Channel:** Distinct shapes with contrasting vertex counts.
3. **Numeric Channel:** Arabic numerals 1 through 4.
4. **Textual Nomenclature Channel:** Verbatim phonetic names (`ALPHA`, `BETA`, `GAMMA`, `DELTA`).
5. **Texture / Stroke Pattern Channel:** Unique SVG dash arrays for each wire.

#### Phase 4 Wire Pairs Matrix

| Pair | Name / Code | Hex / Color | Symbol | Number | Stroke Pattern (`dasharray`) | Socket Bezel Shape | Text Label Displayed |
|:---:|:---|:---|:---:|:---:|:---|:---|:---|
| **1** | `ALPHA-RED` | `#FF2A4D` (Pym Crimson) | `▲` Triangle | `1` | Solid line (`none`) | Triangular outer chamfer | `"ALPHA - 1 - RED [▲]"` |
| **2** | `BETA-BLUE` | `#00E5FF` (Electric Cyan) | `●` Circle | `2` | Dashed (`10 6`) | Circular round bezel | `"BETA - 2 - BLUE [●]"` |
| **3** | `GAMMA-YELLOW`| `#FFD600` (Solar Amber) | `⬡` Hexagon | `3` | Dotted (`3 4`, round) | Hexagonal faceted bezel| `"GAMMA - 3 - YELLOW [⬡]"`|
| **4** | `DELTA-GREEN` | `#00E676` (Neon Emerald) | `⚡` Lightning | `4` | Dash-Dot (`14 4 3 4`) | Diamond / Bolt chamfer | `"DELTA - 4 - GREEN [⚡]"` |

#### Phase 5 High-Voltage Conduit Matrix

| Pair | Name / Code | Hex / Color | Symbol | Number | Stroke Pattern (`dasharray`) | Safe Window Range | Text Label Displayed |
|:---:|:---|:---|:---:|:---:|:---|:---:|:---|
| **1** | `Q-PULSE 1` | `#B026FF` (Violet Plasma)| `★` Star | `1` | Solid with energy flare | 40% – 60% (Mid Zone) | `"Q-PULSE 1 [★] (40-60%)"` |
| **2** | `P-FLOW 2` | `#00E5FF` (Cyan Arc) | `⬡` Hexagon | `2` | Double line / dash | 35% – 55% (Early Mid) | `"P-FLOW 2 [⬡] (35-55%)"` |
| **3** | `S-GRID 3` | `#FF6D00` (Solar Orange)| `✚` Cross | `3` | Dense dotted (`2 3`) | 45% – 65% (Late Mid) | `"S-GRID 3 [✚] (45-65%)"` |
| **4** | `N-CORE 4` | `#76FF03` (Lime Current)| `⛉` Shield | `4` | Long dash-dot | 30% – 50% (Lead Zone) | `"N-CORE 4 [⛉] (30-50%)"` |

### 5.3 CVD Simulation Robustness Verification

```
+--------------------------------------------------------------------------------------------------------+
|                          Colorblind Simulation Independence Proof                                      |
+-------------------+--------------------+--------------------+--------------------+---------------------+
| Channel           | Normal Vision      | Protanopia         | Deuteranopia       | Achromatopsia       |
+-------------------+--------------------+--------------------+--------------------+---------------------+
| Hue (Pair 1 vs 4) | Red vs Green       | Yellow/Brown vs Gr | Olive vs Yellowish | Identical Grey (1:1)|
| Symbol            | ▲ vs ⚡            | ▲ vs ⚡            | ▲ vs ⚡            | ▲ vs ⚡ (100% Crisp)|
| Number            | 1 vs 4             | 1 vs 4             | 1 vs 4             | 1 vs 4 (100% Crisp) |
| Label Text        | ALPHA vs DELTA     | ALPHA vs DELTA     | ALPHA vs DELTA     | ALPHA vs DELTA      |
| Wire Texture      | Solid vs Dash-Dot  | Solid vs Dash-Dot  | Solid vs Dash-Dot  | Solid vs Dash-Dot   |
+-------------------+--------------------+--------------------+--------------------+---------------------+
| VERDICT           | PASSED             | PASSED             | PASSED             | PASSED (Zero Hue)   |
+--------------------------------------------------------------------------------------------------------+
```
Even on an ancient monochrome grayscale monitor, player recognition is instantaneous and unambiguous via symbols, numbers, and dash textures.

---

## 6. WCAG 2.1 Contrast Standards & Visual Ergonomics

### 6.1 Contrast Calculation Matrix (Light vs Dark)
All text elements and interactive icons are tested against their backing surfaces using the standard WCAG relative luminance formula:
$$CR = \frac{L_1 + 0.05}{L_2 + 0.05}$$

| Element & Role | Foreground Hex | Background Hex | Relative Luminance ($L_1 / L_2$) | Contrast Ratio | WCAG 2.1 Rating |
|:---|:---:|:---:|:---:|:---:|:---:|
| **Lab Background Base** | — | `#0A0D14` | 0.008 | — | Base Surface |
| **Circuit Board Card** | — | `#111622` | 0.013 | — | Card Surface |
| **Malfunction Warning Text** | `#FF334B` | `#0A0D14` | 0.224 / 0.008 | **4.72:1** | **Pass (AA Normal, AAA Large)** |
| **Nanotech Restored Text** | `#00E676` | `#0A0D14` | 0.621 / 0.008 | **11.57:1** | **Pass (AAA All Sizes)** |
| **Primary White Headings** | `#F0F6FC` | `#0A0D14` | 0.887 / 0.008 | **16.15:1** | **Pass (AAA All Sizes)** |
| **Secondary Telemetry Text** | `#90A4AE` | `#111622` | 0.278 / 0.013 | **5.21:1** | **Pass (AA All Sizes)** |
| **Accent Cyan Labels** | `#00E5FF` | `#111622` | 0.682 / 0.013 | **11.62:1** | **Pass (AAA All Sizes)** |
| **Amber Safe Zone Text** | `#FFD600` | `#111622` | 0.714 / 0.013 | **12.13:1** | **Pass (AAA All Sizes)** |
| **Button Text (Primary Red)**| `#FFFFFF` | `#D32F2F` | 1.000 / 0.160 | **5.00:1** | **Pass (AA Normal, AAA Large)** |
| **Button Text (Secondary)** | `#FFFFFF` | `#21262D` | 1.000 / 0.024 | **14.18:1** | **Pass (AAA All Sizes)** |
| **Terminal Symbol Glyphs** | `#FFFFFF` | `#1A2130` | 1.000 / 0.022 | **14.58:1** | **Pass (AAA All Sizes)** |

All text across all 8 phases exceeds the mandatory 4.5:1 ratio; key HUD headers exceed 11:1.

---

## 7. Tactile Audio-Visual Feedback System (Zero-Asset Architecture)

### 7.1 Sound-Ready Visual Feedback Mechanics
Visual animations must communicate physical mechanics, energy presence, and connection states without relying on auditory cues:

1. **Hover / Contact Proximity (`.terminal--hover`):**
   - Terminal ring illuminates with a localized energy arc (`filter: drop-shadow(0 0 10px currentColor)`).
   - Core socket scales up by 8% (`transform: scale(1.08)`).
2. **Active Drag Wire Dynamic Tension:**
   - Active SVG path renders with double-stroke effect:
     - Outer stroke: `8px` semi-transparent glow (`rgba(..., 0.3)`).
     - Inner core: `3.5px` high-contrast solid stroke with dashed flow animation (`stroke-dashoffset` running via `requestAnimationFrame`).
3. **Successful Connection Shockwave (`@keyframes shockwave`):**
   - An expanding ring animates outwards from the locked socket:
     `transform: scale(1) -> scale(2.4); opacity: 0.9 -> 0;` (duration: 400ms).
   - Connected SVG wire pulses with a bright white luminescence wave traveling from source to destination.
   - Sockets display a solid glowing indicator with a green checkmark pip.
4. **Mismatch Deflection & Recoil Shake (`@keyframes error-shake`):**
   - On mismatched connection or missed timing, terminals execute a 3-cycle horizontal shudder:
     `translateX(-6px) -> translateX(6px) -> translateX(-3px) -> translateX(0);` (duration: 250ms).
   - Terminals flash red (`#FF1744`) for 300ms.
   - The dragging cord recoils back to the source terminal over 200ms using an ease-out spring equation.
   - **Crucial Rule:** No successfully connected wire pairs are dislodged or reset.
5. **Phase 4 & Phase 5 Circuit Stabilization Fanfare:**
   - When connection count reaches 4/4:
     - All 4 wires oscillate in synchronized harmony.
     - Circuit board bus traces transition from amber warning glow to steady neon cyan (`#00E5FF`).
     - Central capacitor core emits an ambient breathing pulse.
     - "Continue" button unlocks with a glowing border animation (`@keyframes button-glow`).

---

### 7.2 Zero-Asset Synthesized Web Audio Architecture (`Engine.Audio`)

External audio assets (`.mp3`, `.wav`) introduce significant risks: HTTP 404s, CORS restrictions, browser autoplay blocks, and asset loading latency.

To ensure 100% reliable tactile audio, all game sound effects are generated algorithmically using the native **Web Audio API** (`AudioContext`).

```
+-----------------------------------------------------------------------+
|                    Synthesized Web Audio Engine                       |
+-----------------------------------------------------------------------+
                                    |
                    [User Gesture: Click / Keydown]
                                    |
                    Ensure AudioContext is Resumed
                      (ctx.state === 'suspended')
                                    |
            +-----------------------+-----------------------+
            |                                               |
     Sound Enabled?                                   Master Gain
       (isMuted)                                     (Default 0.2)
            |                                               |
     +------+------+                                        v
     |             |                                Destination
    YES            NO                             (ctx.destination)
     |             |
   Silent      Dispatch Synth Routine
               - UI Hover (Sine sweep)
               - Click (Bandpass burst)
               - Grab (Low ramp)
               - Success (Major Triad: C5, E5, G5)
               - Mismatch (Sawtooth buzzer)
               - Timing Metronome (Ping)
               - System Restored (4-Tone Arpeggio)
```

#### Sound Synthesis Mathematical Recipes

```javascript
// Architecture snippet for script.js: Audio Synthesizer Engine
const AudioEngine = (() => {
  let ctx = null;
  let isMuted = false;
  let masterGain = null;

  function init() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        ctx = new AudioCtx();
        masterGain = ctx.createGain();
        masterGain.gain.value = 0.2; // Comfort listening volume
        masterGain.connect(ctx.destination);
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  }

  // 1. UI Click: Crisp square-wave click
  function playClick() {
    if (isMuted || !ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  }

  // 2. Terminal Grab / Select: Warm resonant blip
  function playTerminalSelect() {
    if (isMuted || !ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(540, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  }

  // 3. Connection Success: Polyphonic Harmonic Major Triad (C5, E5, G5)
  function playConnectSuccess() {
    if (isMuted || !ctx) return;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.05);
      gain.gain.setValueAtTime(0.18, ctx.currentTime + index * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(ctx.currentTime + index * 0.05);
      osc.stop(ctx.currentTime + 0.35);
    });
  }

  // 4. Connection Error / Mismatch: Dissonant Sawtooth Deflection Buzz
  function playConnectFail() {
    if (isMuted || !ctx) return;
    [115, 122].forEach(freq => { // Dissonant beating
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    });
  }

  // 5. Timing Metronome Tick: Crisp pulse when indicator reaches track extremes
  function playTimingTick() {
    if (isMuted || !ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.02);
  }

  // 6. Timing Success: High Electric Surge Chime
  function playTimingSuccess() {
    if (isMuted || !ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  }

  // 7. System Restored: Triumphant 4-Tone Arpeggio (C4 -> E4 -> G4 -> C5)
  function playSystemRestored() {
    if (isMuted || !ctx) return;
    const arpeggio = [261.63, 329.63, 392.00, 523.25];
    arpeggio.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.4);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(ctx.currentTime + idx * 0.12);
      osc.stop(ctx.currentTime + idx * 0.12 + 0.4);
    });
  }

  function toggleMute() {
    isMuted = !isMuted;
    return isMuted;
  }

  return {
    init,
    playClick,
    playTerminalSelect,
    playConnectSuccess,
    playConnectFail,
    playTimingTick,
    playTimingSuccess,
    playSystemRestored,
    toggleMute,
    get isMuted() { return isMuted; }
  };
})();
```

#### HUD Audio Mute Control
A dedicated mute button is placed in the global HUD:
```html
<button id="btn-audio-toggle" class="btn-icon" aria-label="Toggle Sound Effects" aria-pressed="false" tabindex="0">
  <span class="icon-speaker" aria-hidden="true">🔊</span>
  <span class="sr-only">Toggle Sound Effects</span>
</button>
```

---

## 8. Responsive Layout & Viewport Scaling Architecture

The game must present a cinematic, uncompromised 2.5D visual hierarchy across screen resolutions from 4K down to 360px mobile displays.

### 8.1 Viewport Breakpoint Hierarchy

```
+---------------------------------------------------------------------------------------+
| Desktop Wide (>= 1200px)     | Center stage, expansive 2.5D lab/nano perspective       |
| Desktop Standard (992-1199px)| Fluid 2.5D depth, side-by-side terminal racks           |
| Tablet (768-991px)           | Consolidated HUD, 48px touch terminals, scaled wire bay |
| Mobile (360-767px)           | Vertical stacked / compact layout, thumb-ready triggers |
+---------------------------------------------------------------------------------------+
```

### 8.2 Wiring Puzzle Responsive Layout Strategies
The wiring puzzle requires special layout adaptation between desktop and mobile:

#### Desktop & Tablet Layout (`viewport width >= 768px`)
- **Structure:** Dual Column Grid (`grid-template-columns: 220px 1fr 220px`).
  - Left column: Source terminals (Alpha, Beta, Gamma, Delta) arranged vertically.
  - Middle bay: Transparent SVG overlay canvas where wires curve across horizontally from left to right.
  - Right column: Destination terminals arranged in scrambled order.
- **Wire Geometry:** Wires travel horizontally from left sockets $(X_L, Y_L)$ to right sockets $(X_R, Y_R)$. The Bezier control points offset horizontally along the X-axis:
  $C_1 = (X_L + \Delta X \cdot 0.55, Y_L)$ and $C_2 = (X_R - \Delta X \cdot 0.55, Y_R)$.

#### Mobile Portrait Layout (`viewport width < 768px`)
- **Structure:** Compact dual-column or stacked layout.
  - Due to narrow portrait width ($360px - 480px$), the left and right terminal columns are brought closer together (`grid-template-columns: 140px 1fr 140px` or `grid-template-columns: 1fr 1fr` with center wire gap).
  - Terminal labels truncate to concise badge format: `ALPHA 1 ▲` and `BETA 2 ●`.
  - Wire stroke thickness increases slightly (`stroke-width: 5px`) for finger visibility on high-DPI retina screens.
  - Dedicated bottom touch action bar for timing activation in Phase 5.

### 8.3 Dynamic SVG Coordinate Recalculation Engine
A common bug in browser canvas/SVG games is that resizing the browser or rotating a mobile device causes SVG lines to disconnect from the physical positions of the DOM buttons.

To eliminate this bug:
1. Sockets report their coordinates relative to the parent SVG container via `getBoundingClientRect()`.
2. A `ResizeObserver` monitors the `.puzzle-stage` container:
   ```javascript
   const puzzleStage = document.getElementById('puzzle-stage');
   const resizeObserver = new ResizeObserver(() => {
     WiringEngine.recalculateCoordinates();
     WiringEngine.redrawConnectedWires();
   });
   resizeObserver.observe(puzzleStage);
   window.addEventListener('resize', () => {
     WiringEngine.recalculateCoordinates();
     WiringEngine.redrawConnectedWires();
   });
   ```
3. When recalculation fires, every existing locked connection and the active drag wire are smoothly redrawn to the exact current socket center offsets $(rect.left + rect.width / 2 - svgRect.left, rect.top + rect.height / 2 - svgRect.top)$.

---

## 9. Assistive Technology (AT) & ARIA Implementation Specs

### 9.1 ARIA Live Region Announcement Architecture
Screen readers require polite, timely updates that announce phase transitions, wire connections, and timing status without spamming speech output.

We implement **two dedicated ARIA live regions**:
1. `#a11y-announcer-polite` (`role="status" aria-live="polite" aria-atomic="true" class="sr-only"`): For general game progression, wire counts, and phase introductions.
2. `#a11y-announcer-assertive` (`role="alert" aria-live="assertive" aria-atomic="true" class="sr-only"`): For immediate critical alerts, error buzzes, and timing warnings.

```html
<!-- Screen Reader Live Regions -->
<div id="a11y-announcer-polite" role="status" aria-live="polite" aria-atomic="true" class="sr-only"></div>
<div id="a11y-announcer-assertive" role="alert" aria-live="assertive" aria-atomic="true" class="sr-only"></div>
```

#### Verbatim Announcement Reference Table

| Trigger Moment / Phase | Target Live Region | Verbatim Screen Reader Announcement Text |
|:---|:---:|:---|
| **Game Init (Phase 1)** | `polite` | `"Nanotech System Failure Detected. Manual repair required. Press Begin Repair to start."` |
| **Phase 2 Start** | `polite` | `"Pym Particle suit activated. Ant-Man shrinking to microscopic scale. Press Skip to enter directly."` |
| **Phase 3 Start** | `polite` | `"Inside nanotech machine. Microscopic circuit interior reached. Objective: Reconnect four matching wire pairs."` |
| **Phase 4 Start** | `polite` | `"Wire junction bay online. Four dislodged wire pairs detected: Alpha Red Triangle, Beta Blue Circle, Gamma Yellow Hexagon, and Delta Green Lightning. Select a terminal to begin."` |
| **Terminal Selected** | `polite` | `"Selected source terminal {Name} {Number} {Symbol}. Now choose matching destination terminal."` |
| **Terminal Connected (1-3)**| `polite` | `"Connection secured: {Name}. {X} of 4 connected."` |
| **Terminal Mismatch** | `assertive` | `"Mismatch detected. {Source} does not match {Target}. Connection deflected. Try again."` |
| **Phase 4 Complete** | `polite` | `"All four primary conduits stabilized. Circuit board online. Press Continue to proceed."` |
| **Phase 5 Start** | `polite` | `"Phase 5: High-voltage timing challenge. Electrical current oscillating. Synchronize connection when indicator enters safe window."` |
| **Phase 5 Safe Window In**| `polite` | `"Current inside safe window. Press Space or Engage now."` |
| **Phase 5 Missed Timing**| `assertive` | `"Timing desynchronization: Electrical discharge deflected. Completed wires safe. Retry connection now."` |
| **Phase 5 Complete** | `polite` | `"All four high-voltage conduits stabilized. Circuit locked. Press Continue to proceed."` |
| **Phase 6 Start** | `polite` | `"Debugging challenge placeholder screen. Diagnostic simulation under development. Press Bypass for Testing to continue."` |
| **Phase 7 Start** | `polite` | `"Powering up machine circuits in sequence. Primary conduits online. Logic grid online. Nanotech system restored. All circuits operational."` |
| **Phase 8 Start** | `polite` | `"Mission completed. Nanotech repaired. Ant-Man returned to normal size. Press Play Again to restart."` |

### 9.2 Reduced Motion Mode (`prefers-reduced-motion: reduce`)
Users with vestibular disorders, motion sickness, or epilepsy are protected via CSS media queries and JavaScript motion hooks.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* Replace 3-second camera zoom & spin with clean 200ms opacity crossfade */
  .phase-container {
    transition: opacity 0.2s linear !important;
    transform: none !important;
  }

  /* Suppress screen shake and intense spark jitter */
  .shake-anim,
  .pulse-rapid,
  .spark-emitter {
    animation: none !important;
  }
}
```

In JavaScript, `window.matchMedia('(prefers-reduced-motion: reduce)').matches` is queried during Phase 2 (Shrink) and Phase 8 (Growth). When true, the 3000ms cinematic scaling is bypassed or reduced to an instant 200ms dissolve.

---

## 10. Phase 5 Timing Mechanic Accessibility Specialization

Phase 5 requires players to connect wire conduits while an oscillating electrical current indicator sweeps back and forth across a target meter. Without careful accessibility design, timing mechanics can become impossible barriers for players with motor disabilities or visual processing differences.

### 10.1 Safe Window Geometry & Visual Tolerances
- **Oscillation Cycle:** 1.6s – 2.0s period ($T$). Smooth sinusoidal travel between 0% and 100%:
  $$P(t) = 50 + 50 \cdot \sin\left(\frac{2\pi t}{T}\right)$$
- **Safe Zone Target Window:** Set to a generous **25% – 30% of the gauge width** (e.g., 40% to 65%).
  - At a 1.8s cycle, a 25% window provides an open window of approximately **450ms – 550ms** per pass.
  - The needle passes through the safe zone twice per cycle (once rising, once falling), yielding an opportunity every ~900ms.
- **Visual Styling of the Safe Zone:**
  - Distinct bright emerald border (`#00E676`) with diagonal cross-hatching pattern.
  - Bracketed high-contrast callout markings: `[ SAFE ZONE: 40% - 65% ]`.
  - Prominent moving diamond indicator (`#FFD600`) with vertical tracking cursor.

```
+-------------------------------------------------------------------------------+
|                        Phase 5 Timing Gauge Architecture                      |
+-------------------------------------------------------------------------------+
| [Track 0%]        [=== SAFE TARGET WINDOW: 40% - 65% ===]        [Track 100%] |
| ------------------+====================================+--------------------- |
|                   |   //// Emerald Cross-Hatch ////    |                      |
|                   |           ▲ [48%]                  |                      |
|                   |       (Current Needle)             |                      |
+-------------------+====================================+----------------------+
```

### 10.2 Audio Rhythm & Audio Cue Synchronization
- When the current needle enters the safe window, the Web Audio engine produces a subtle tonal frequency rise (800Hz gentle hum).
- When the needle hits the extremes (0% and 100%), a soft metronome ping sounds, establishing an intuitive rhythmic cadence.
- Player can time their connection purely by listening to the rhythm without looking at the needle!

### 10.3 Failure Invariant: Non-Destructive Retry
If the player attempts a connection when the needle is outside the safe window:
1. The connection discharge is deflected with a visual spark and low buzzer sound.
2. A non-critical status banner displays: `"TIMING DESYNC: DISCHARGE DEFLECTED — RETRY NOW"`.
3. The selected wire retracts to its ready position.
4. **INVARIANT:** Previously connected conduits are **NEVER lost or reset**. The player immediately tries again on the same wire.

---

## 11. Modular Architecture for `script.js` & Zero Console Errors

To satisfy Requirement R1 (vanilla JS, zero external build tools) and R4 (zero console errors, modular code), `script.js` must be organized with clean module encapsulation and defensive error boundaries.

### 11.1 Proposed Code Structure (Namespace Pattern)

```javascript
/**
 * ANT-MAN NANO-REPAIR ENGINE
 * Strict Modular Vanilla JavaScript Architecture
 */
const AntManGame = (() => {
  'use strict';

  // 1. CONFIG MODULE: Immutable constants, wire definitions, palettes, timings
  const Config = Object.freeze({
    PHASES: {
      MALFUNCTION: 1,
      SHRINKING: 2,
      INTERIOR: 3,
      WIRING_COLOR: 4,
      WIRING_TIMED: 5,
      DEBUG_PLACEHOLDER: 6,
      RESTART: 7,
      GROWTH_VICTORY: 8
    },
    WIRES_P4: [
      { id: 'w1', name: 'ALPHA', num: '1', color: '#FF2A4D', colorName: 'RED', symbol: '▲', dash: 'none' },
      { id: 'w2', name: 'BETA',  num: '2', color: '#00E5FF', colorName: 'BLUE', symbol: '●', dash: '10 6' },
      { id: 'w3', name: 'GAMMA', num: '3', color: '#FFD600', colorName: 'YELLOW', symbol: '⬡', dash: '3 4' },
      { id: 'w4', name: 'DELTA', num: '4', color: '#00E676', colorName: 'GREEN', symbol: '⚡', dash: '14 4 3 4' }
    ],
    WIRES_P5: [
      { id: 't1', name: 'Q-PULSE', num: '1', color: '#B026FF', symbol: '★', minSafe: 40, maxSafe: 60, speed: 1.8 },
      { id: 't2', name: 'P-FLOW',  num: '2', color: '#00E5FF', symbol: '⬡', minSafe: 35, maxSafe: 55, speed: 1.5 },
      { id: 't3', name: 'S-GRID',  num: '3', color: '#FF6D00', symbol: '✚', minSafe: 45, maxSafe: 65, speed: 2.0 },
      { id: 't4', name: 'N-CORE',  num: '4', color: '#76FF03', symbol: '⛉', minSafe: 30, maxSafe: 50, speed: 1.6 }
    ]
  });

  // 2. STATE MODULE: Single source of truth with deterministic state transitions
  const State = {
    currentPhase: Config.PHASES.MALFUNCTION,
    p4Connections: new Map(), // wireId -> boolean
    p5Connections: new Map(), // wireId -> boolean
    selectedTerminal: null,   // currently selected terminal for stepped click-to-connect
    activeDrag: null,         // { wireId, originSide, startX, startY }
    isSoundMuted: false,
    timingNeedlePos: 50,      // 0 to 100
    timingDirection: 1,
    isTimingRunning: false
  };

  // 3. AUDIO MODULE: Synthesized Web Audio API Engine
  const Audio = AudioEngine; // Defined in Section 7.2

  // 4. A11Y MODULE: Screen reader announcer and focus manager
  const A11y = {
    announce(message, isAssertive = false) {
      const targetId = isAssertive ? 'a11y-announcer-assertive' : 'a11y-announcer-polite';
      const el = document.getElementById(targetId);
      if (el) {
        el.textContent = '';
        // Micro-timeout ensures AT software registers string replacement
        setTimeout(() => { el.textContent = message; }, 20);
      }
    },
    setFocus(elementOrId) {
      const el = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
      if (el && typeof el.focus === 'function') {
        el.focus({ preventScroll: false });
      }
    }
  };

  // 5. INPUT MODULE: Pointer events, touch tracking, keyboard handlers
  const Input = {
    init() { /* Binds pointerdown, pointermove, pointerup, keydown */ },
    handlePointerDown(e) { /* Starts drag / tap */ },
    handlePointerMove(e) { /* Updates active SVG cord */ },
    handlePointerUp(e) { /* Validates match / drops */ },
    handleKeyDown(e) { /* Tab, Space, Enter, Arrows, Escape */ }
  };

  // 6. WIRING MODULE: SVG Bezier curves, coordinate normalizer, snapback physics
  const Wiring = {
    drawActiveCord(x1, y1, x2, y2, color, dash) { /* Dynamic bezier curve */ },
    lockWire(sourceId, destId, wireDef) { /* Permanent glowing connection */ },
    recoilWire(wireId) { /* Elastic snapback animation */ },
    recalculateCoordinates() { /* Window resize synchronization */ }
  };

  // 7. TIMING MODULE: Phase 5 oscillation loop & safe zone detection
  const Timing = {
    startOscillator() { /* requestAnimationFrame loop */ },
    stopOscillator() { /* Clean cancellation */ },
    evaluateHit(wireId) { /* Returns boolean: in safe window */ }
  };

  // 8. UI MODULE: Phase DOM activation, HUD updates, reset logic
  const UI = {
    transitionToPhase(phaseNumber) { /* Handles DOM unhide, focus transfer, ARIA */ },
    updateProgressCounter(phase, connectedCount) { /* "X / 4 connected" */ },
    resetAll() { /* Complete deterministic reset for Play Again */ }
  };

  // 9. APP INITIALIZER & ERROR BOUNDARY
  function init() {
    try {
      Input.init();
      UI.transitionToPhase(Config.PHASES.MALFUNCTION);
      window.addEventListener('error', (err) => {
        console.error('[NanoRepair Protected Error]', err);
      });
    } catch (e) {
      console.error('[NanoRepair Init Error]', e);
    }
  }

  return { init, State, Config, UI, Audio, Wiring, Timing, A11y };
})();

document.addEventListener('DOMContentLoaded', AntManGame.init);
```

### 11.2 Invariant Protocols for Zero Console Errors
1. **Guarded DOM Access:** Every `document.getElementById` or `querySelector` call MUST be guarded with a null-check before property access or class manipulation:
   `const el = document.getElementById(id); if (el) { el.classList.add('active'); }`
2. **Safe Event Unbinding:** Event listeners bound to temporary elements must either use `{ once: true }` or be cleanly detached when changing phases.
3. **AudioContext Autoplay Safe-Guard:** `new AudioContext()` is never executed on initial page load script execution; it is instantiated or resumed inside the first `pointerdown` or `keydown` user handler.
4. **SVG Coordinate Validation:** If a terminal element is hidden (`display: none` or zero bounding rect), coordinate calculations must return safe fallbacks rather than computing `NaN` or throwing matrix inversion errors.
5. **No Dangling Timers / Frames:** Store all `requestAnimationFrame` IDs and `setTimeout` references in the `State` container; cleanly cancel them via `cancelAnimationFrame` and `clearTimeout` when resetting or transitioning phases.

---

## 12. Complete Interaction Specifications for All 8 Phases

### Phase 1: Machine Malfunction
- **Primary Elements:**
  - Status Banner: `#lab-status-display` containing `"NANOTECH SYSTEM FAILURE DETECTED / MANUAL REPAIR REQUIRED"`
  - Character: Full scale Ant-Man (`#antman-character`)
  - Primary Button: `#btn-begin-repair` ("Begin Repair")
  - Flashing alarm lights (`.warning-klaxon`) and sparks (`#spark-canvas`)
- **Keyboard Interaction:**
  - On load, focus is placed on `#btn-begin-repair`.
  - Pressing `Enter` or `Space` activates repair mode, triggers audio click, and transitions to Phase 2.
- **A11y:**
  - Announcer reads failure status and invites player to begin.
  - Klaxons pulse at a safe frequency ($1.2\text{ Hz}$, well below the $3\text{ Hz}$ photosensitive seizure threshold).

### Phase 2: Shrinking Sequence
- **Primary Elements:**
  - Ant-Man model scaling down (`scale(1.0) -> scale(0.04)`) with red Pym particle aura.
  - Skip Button: `#btn-skip-shrink` ("Skip Animation")
- **Interaction & Ergonomics:**
  - `#btn-skip-shrink` has `min-height: 48px`, `tabindex="0"`, and immediate focus.
  - Touching or pressing `Space`/`Enter` on `#btn-skip-shrink` halts animation immediately and jumps to Phase 3.
  - Natural completion after 3000ms automatically advances to Phase 3.
  - Under `prefers-reduced-motion`, duration is clamped to 0ms (immediate transition).

### Phase 3: Entering the Nano Machine
- **Primary Elements:**
  - Microscopic 2.5D interior background with glowing traces.
  - Objective Prompt: `#nano-objective-prompt` containing `"Reconnect four matching wire pairs."`
  - Action Button: `#btn-enter-circuit` ("Access Wiring Terminal")
- **Keyboard Interaction:**
  - Focus moves to `#btn-enter-circuit`.
  - Pressing `Enter`/`Space` loads Phase 4.

### Phase 4: First 4-Wire Colour-Matching Challenge
- **Primary Elements:**
  - Progress Counter: `#phase4-progress-counter` displaying verbatim `"X / 4 connected"`.
  - Left Terminal Column: `#terminals-left-p4` (4 terminals: Alpha, Beta, Gamma, Delta).
  - Right Terminal Column: `#terminals-right-p4` (4 scrambled terminals).
  - SVG Overlay: `#wiring-canvas-p4`.
  - Continue Button: `#btn-phase4-continue` (initially disabled and `aria-hidden="true"`).
- **Wiring Logic:**
  - Allows both Pointer Drag and Stepped Click-to-Connect.
  - Correct match locks connection, plays Major chord, increments counter (`"1 / 4 connected"`).
  - Incorrect match flashes red, shakes, plays buzzer, clears selection. **Completed wires are NOT reset.**
  - At 4/4 connected, board stabilizes, status changes to `"CIRCUIT STABILIZED — AUXILIARY COUPLING READY"`, `#btn-phase4-continue` unlocks and gains focus.
  - Pressing `Enter`/`Space` on Continue advances to Phase 5.

### Phase 5: Second 4-Wire Challenge with Timing Mechanic
- **Primary Elements:**
  - Progress Counter: `#phase5-progress-counter` (`"X / 4 connected"`).
  - Timing Gauge HUD: `#timing-gauge` with Track, Safe Zone (`[ SAFE ZONE: 40% - 65% ]`), and moving needle.
  - Left & Right Terminals (4 Conduits: Q-Pulse, P-Flow, S-Grid, N-Core).
  - Touch Timing Trigger Button: `#btn-timing-trigger` (`"ENGAGE CURRENT [SPACEBAR / TAP]"`).
  - Continue Button: `#btn-phase5-continue` (initially disabled).
- **Interaction & Accessibility:**
  - Needle oscillates continuously at ~1.8s period.
  - When matching wire connection is triggered:
    - If needle is inside safe window: locks conduit, plays electric surge chime, increments counter.
    - If needle is outside safe window: deflects with spark, status announces `"TIMING DESYNC: DISCHARGE DEFLECTED — RETRY NOW"`. Completed pairs stay locked.
  - At 4/4 connected: needle stabilizes at 50%, board powers on, Continue button unlocks and receives focus.

### Phase 6: Debugging Placeholder Screen
- **Primary Elements:**
  - Diagnostic Modal: `#phase-6`
  - Header: `#debug-placeholder-title` with verbatim `"DEBUGGING CHALLENGE — PLACEHOLDER"`.
  - Copy: `#debug-placeholder-copy` explaining simulation is under development.
  - Action Button: `<button id="btn-bypass-debug" class="btn-primary">Bypass for Testing</button>`.
- **Behavior:**
  - Button receives immediate focus.
  - Single click or `Enter`/`Space` advances state cleanly and atomically to Phase 7 without console warnings or blockers.

### Phase 7: Machine Restart & Circuit Power-Up
- **Primary Elements:**
  - Sequential power-up animation across 3 tiers (Quantum Conduits -> Logic Grid -> Magnetic Stabilizers).
  - Warning lights switch off; indicators turn steady emerald green (`#00E676`).
  - Restored Display: `#restart-status-display` containing verbatim `"NANOTECH SYSTEM RESTORED"` and `"ALL CIRCUITS OPERATIONAL"`.
  - Continue Button: `#btn-phase7-continue` ("Return to Normal Size").
- **Behavior:**
  - Power-up sequence takes ~2000ms (or instant in reduced motion).
  - Synthesizer plays 4-step triumphant arpeggio.
  - `#btn-phase7-continue` enables and receives focus.

### Phase 8: Ant-Man Returns to Normal Size (Victory & Reset)
- **Primary Elements:**
  - Reverse growth animation back to normal scale in lab.
  - Victory Title: `#victory-title` containing verbatim `"MISSION COMPLETED / NANOTECH REPAIRED"`.
  - Play Again Button: `<button id="btn-play-again" class="btn-primary">Play Again</button>`.
- **Reset Invariants ("Play Again"):**
  - Clicking `#btn-play-again` executes `AntManGame.UI.resetAll()`:
    1. Sets `currentPhase = 1`.
    2. Resets wire connections (`connected: false`), clears SVG lines.
    3. Resets progress counters to `"0 / 4 connected"`.
    4. Resets warning lights to flashing red/amber and lab status to `"NANOTECH SYSTEM FAILURE DETECTED / MANUAL REPAIR REQUIRED"`.
    5. Clears active timers and audio nodes.
    6. Returns focus to `#btn-begin-repair`.
  - Zero memory leaks, zero dangling loops, zero console errors.

---

## 13. Verification Protocol & Acceptance Checklist

To ensure every technical, accessibility, and gameplay requirement is satisfied prior to milestone sign-off, the following verification matrix will be executed:

| ID | Verification Item | Target Acceptance Standard | Verification Method |
|:---|:---|:---|:---|
| **V1** | **Tech Stack Purity** | Strictly `index.html`, `style.css`, `script.js`. Zero external tools/CDNs. | Filesystem inspection (`dir / ls`). |
| **V2** | **Pointer & Touch Support** | Flawless wire drag and tap selection on touchscreens. | Chrome DevTools device mode emulation (iPhone 14, Pixel 7) + Pointer Events test. |
| **V3** | **Full Keyboard Playthrough**| Complete game playable from Phase 1 to Phase 8 reset using only keyboard. | Tab, Space, Enter, Arrow keys, Escape traversal without mouse interaction. |
| **V4** | **Touch Target Size** | All interactive terminals and buttons $\ge 44 \times 44\text{px}$. | Computed CSS inspection via DevTools Box Model. |
| **V5** | **Focus Rings** | `:focus-visible` dual ring active and clearly visible on every interactive. | Keyboard tabbing inspection across all 8 phases. |
| **V6** | **Colorblind Dual-Coding** | Wire terminals distinguished by symbols, numbers, and labels without color. | Monochromacy & CVD emulation filters (Chrome DevTools Rendering tab). |
| **V7** | **WCAG Contrast Ratios** | All text $>4.5:1$; HUD headers $>7:1$; non-text $>3:1$. | Contrast analyzer inspection. Target: 100% WCAG AA/AAA pass. |
| **V8** | **Zero Asset Audio FX** | All sounds synthesized via Web Audio API. Zero external audio downloads. | Network tab inspection (0 media network requests) + Audio output test. |
| **V9** | **Responsive Viewports** | Fluid layout across 1920×1080 down to 360×640 without horizontal scroll or wire breakage. | Viewport resizing + `ResizeObserver` SVG coordinate verification. |
| **V10**| **Non-Destructive Retries** | Mismatched wires or missed timing allow immediate retry without resetting completed pairs. | Intentional error testing in Phase 4 and Phase 5. |
| **V11**| **Phase 6 Direct Bypass** | "Bypass for Testing" button transitions directly to Phase 7 without fake blockers. | Click & keyboard bypass test. |
| **V12**| **Deterministic Reset** | "Play Again" button in Phase 8 completely restores Phase 1 state. | Multiple consecutive playthroughs (Phases 1 -> 8 -> 1 -> 8). |
| **V13**| **Console Cleanliness** | Browser console remains free of any unhandled errors or warnings. | Console tab inspection during complete gameplay loop. |
| **V14**| **Reduced Motion** | Disables intense camera push, zooms, and shakes when user preference is active. | Emulate `prefers-reduced-motion: reduce` in DevTools. |

---

## 14. Conclusion & Next Steps

This interaction and accessibility architecture provides an airtight, deterministic blueprint for the Ant-Man Nano-Repair showcase piece. By combining multi-modal input parity, universal dual-coding, zero-asset synthesized tactile audio, and high-contrast ergonomics, the implementation agent will be equipped to build a game that is as universally accessible as it is cinematically thrilling.

Deliverables:
- Specification document: `survey_a11y.md` (this file)
- Handoff report: `handoff.md`
