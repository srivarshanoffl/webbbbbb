# Specification Survey: Ant-Man Nano-Repair 2.5D Game
**Role:** Specification Miner (`explorer_survey_1`)  
**Workspace:** `c:\Users\sriva\parllel3`  
**Reference Document:** `ORIGINAL_REQUEST.md` (R1–R4, Acceptance Criteria)  
**Target Tech Stack:** Pure HTML5, CSS3, Vanilla JavaScript (zero external dependencies)

---

## 1. Executive Summary & Architectural Philosophy

The objective is to produce a deterministic, highly polished, responsive 2.5D cinematic web game where Ant-Man shrinks to repair a malfunctioning nanotech machine.

### Core Architectural Invariants
1. **Zero External Dependencies (R1):** Strictly single `index.html`, `style.css`, and `script.js`. No CDNs, no external npm packages, no TypeScript, no build steps. All graphics are code-generated via pure HTML, CSS 3D transforms, SVG vector shapes, and HTML5 Canvas (where appropriate for particles).
2. **Deterministic Finite State Machine (FSM):** All application state resides in a single, predictable state container. State transitions cannot be bypassed except through explicit event dispatches with valid guards.
3. **Dual-Coded Accessibility (R4):** Color alone NEVER conveys state. Every interactive terminal combines:
   - Primary Hue (e.g. Red, Blue, Yellow, Green)
   - Geometric Symbol (e.g. Triangle `▲`, Square `■`, Circle `●`, Diamond `◆`)
   - Numerical Index (`1`, `2`, `3`, `4`)
   - Text Label / Callout (`ALPHA`, `BETA`, `GAMMA`, `DELTA`)
4. **Resilient Non-Destructive Puzzle Design:** Mismatched wires or missed timing windows allow immediate retry **without resetting already completed connections**.
5. **Universal Input Support:** Mouse drag-and-drop, touch drag, click/tap selection, and full keyboard navigation (Tab/Shift-Tab, Arrows, Enter, Space, Escape) must be functionally equivalent.

---

## 2. Exhaustive Eight-Phase Specification

### Phase 1: Laboratory Scene & Machine Malfunction
- **Visual Context:** Normal human scale inside a high-tech research facility. Ant-Man stands at full size (~1.0 scale factor, ~180px height relative to 720px viewport) beside a large nanotech console.
- **Visual FX:**
  - Machine console chassis with flashing warning lights (CSS keyframes alternating warning crimson `#FF1744` and amber `#FF9100`).
  - Active sparking particle emitter emitting code-generated sparks (SVG or canvas particles) around fractured machine conduits.
  - Ambient lab depth: layered background with subtle parallax (perspective grid floor, background server racks).
- **DOM Elements & Identifiers:**
  - Container: `#phase-1` or `[data-phase="1"]`
  - Warning Status Display: `#lab-status-display`
    - Mandatory Verbatim Text: `"NANOTECH SYSTEM FAILURE DETECTED / MANUAL REPAIR REQUIRED"`
  - Character Element: `#antman-character` (scale: 1.0)
  - Action Control: `<button id="btn-begin-repair" class="btn-primary">Begin Repair</button>`
- **Behavioral Specification:**
  - On page load, game initializes to Phase 1.
  - Flashing lights and sparks loop continuously.
  - The "Begin Repair" button is enabled with prominent focus indicator.
  - Clicking or pressing Enter/Space on `#btn-begin-repair` dispatches `BEGIN_REPAIR` transition to Phase 2.
- **Invariants:**
  - No puzzle terminals or Phase 2/3 HUD elements are visible.
  - Audio-visual readiness: Screen reader announcement via `aria-live="polite"` announces system malfunction.

---

### Phase 2: Shrinking Sequence (Cinematic Transition)
- **Visual Context:** Ant-Man activates the Pym Particle regulator on his suit. The camera dynamically pushes forward toward the microscopic intake aperture of the machine while Ant-Man shrinks exponentially.
- **Visual FX:**
  - Suit Activation: Chest and helmet conduits flare with Pym Particle red energy (`box-shadow: 0 0 25px #FF1744`, pulsating glow).
  - Energy Field: Expanding red ring waves (`transform: scale(0.1) -> scale(3.0)`, `opacity: 1 -> 0`).
  - Particle Vortex: Swirling subatomic particles contracting toward Ant-Man's core.
  - Scale Transition: Ant-Man element scales smoothly from `transform: scale(1.0)` down to `transform: scale(0.04)` over a baseline of 3000ms.
  - Camera Push: Machine aperture scales up (`transform: scale(1.0) -> scale(4.0)`) with 3D perspective giving the sensation of entering the internal nanotech structure.
- **DOM Elements & Identifiers:**
  - Container: `#phase-2` or `[data-phase="2"]`
  - Skip Control: `<button id="btn-skip-shrink" class="btn-secondary" aria-label="Skip shrinking animation">Skip Animation</button>`
- **Behavioral Specification:**
  - Natural Completion: When shrinking animation finishes (after ~3000ms or CSS `animationend`), automatically dispatch `SHRINK_COMPLETE` to enter Phase 3.
  - Interactive Skip: The `#btn-skip-shrink` button is prominently visible and immediately clickable from t = 0ms to t = 3000ms.
  - Clicking `#btn-skip-shrink` immediately cancels active animation timers/frames and transitions to Phase 3 without delay or visual stutter.
- **Invariants:**
  - Clicking Skip must never cause a double-transition or throw an unhandled exception.
  - Respects `prefers-reduced-motion`: If active, duration drops to 0ms (or instant crossfade directly to Phase 3).

---

### Phase 3: Entering the Nano Machine (Microscopic Interior)
- **Visual Context:** Full transition into the microscopic nanotech realm.
- **Visual FX:**
  - Huge oversized circuit traces, glowing silicon microstructures, microscopic transistor towers, and floating quantum dust motes.
  - Deep 2.5D layered perspective (`perspective: 1000px`, `transform-style: preserve-3d` with layers at `translateZ(-200px)`, `translateZ(-100px)`, `translateZ(0px)`).
  - Glowing circuit bus lines running neon cyan (`#00E5FF`) and amber pulses through the floor.
  - Ant-Man rendered at nano scale standing on a silicon platform surveying the dislodged wiring conduits.
- **DOM Elements & Identifiers:**
  - Container: `#phase-3` or `[data-phase="3"]`
  - Objective Prompt Display: `#nano-objective-prompt`
    - Mandatory Verbatim Text: `"Reconnect four matching wire pairs."` (or displayed prominently in uppercase: `"RECONNECT FOUR MATCHING WIRE PAIRS"`).
  - Action Control: `<button id="btn-enter-circuit" class="btn-primary">Access Wiring Terminal</button>`
- **Behavioral Specification:**
  - Environment displays the damaged circuit block with pulsing disconnected sockets.
  - Player reads the objective prompt.
  - Clicking `#btn-enter-circuit` or pressing Enter/Space dispatches `PROCEED_TO_WIRING` transition to Phase 4.
- **Invariants:**
  - Prepares the wire layout data structures in memory prior to Phase 4 presentation.

---

### Phase 4: First 4-Wire Colour-Matching Challenge
- **Visual Context:** Close-up interactive terminal view of the damaged nano-junction board.
- **Wire Specification (4 Pairs, Quad-Coded):**

| Wire ID | Color Name | Hex Code | Symbol | Number | Label | Left Terminal Index | Scrambled Right Terminal Index |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `wire-1` | High-Power Red | `#FF2A42` | Triangle `▲` | `1` | `ALPHA-1` | 0 | 2 |
| `wire-2` | Signal Blue | `#00B0FF` | Square `■` | `2` | `BETA-2` | 1 | 0 |
| `wire-3` | Sync Amber | `#FFC107` | Circle `●` | `3` | `GAMMA-3` | 2 | 3 |
| `wire-4` | Flux Green | `#00E676` | Diamond `◆` | `4` | `DELTA-4` | 3 | 1 |

- **DOM Elements & Identifiers:**
  - Container: `#phase-4` or `[data-phase="4"]`
  - Progress Counter Display: `#phase4-progress-counter`
    - Exact format: `"X / 4 connected"` (e.g. `"0 / 4 connected"`, `"1 / 4 connected"`, ..., `"4 / 4 connected"`).
  - Terminal Containers:
    - Left Column: `#terminals-left-p4` (Sources)
    - Right Column: `#terminals-right-p4` (Destinations)
    - Terminal items: `<button class="terminal" data-wire-id="wire-1" data-side="left" role="button" tabindex="0">...</button>`
  - Wire Canvas / SVG Overlay: `#wiring-canvas-p4` (for drawing connecting paths, dynamic drag cords, and energy glows).
  - Action Control: `<button id="btn-phase4-continue" class="btn-primary" disabled aria-hidden="true">Continue</button>`
- **Interaction Mechanics:**
  1. **Click / Tap Selection:**
     - Click Left Terminal -> becomes active selected (`aria-pressed="true"`, glowing border, selected wire indicator).
     - Click Right Terminal -> checks if IDs match:
       - **Match:** Wire locks, SVG path draws connected line with glowing pulse. Both terminals marked disabled. Progress counter increments (`1 / 4 connected`).
       - **Mismatch:** Terminals flash red error state (`shake` animation), display temporary toast/status `"MISMATCH: RECONNECT REQUIRED"`, and clear selection. **Already connected wires are NOT reset.**
  2. **Drag & Drop / Pointer Drag:**
     - PointerDown on Left Terminal -> begins drag.
     - PointerMove -> dynamically draws glowing bezier curve from terminal center to pointer coordinates.
     - PointerUp over Right Terminal -> validates match.
     - PointerUp over invalid area -> cord retracts smoothly to source terminal.
  3. **Keyboard Controls:**
     - Tab / Arrow keys navigate between terminals.
     - Enter/Space to select source terminal.
     - Tab/Arrow to destination terminal, Enter/Space to complete.
     - Escape cancels active selection.
- **Circuit Stabilization & Continuation:**
  - Upon reaching `4 / 4 connected`:
    - All 4 wires pulse in unison.
    - Central circuit board triggers a stabilization animation (glow wave, circuits changing from red warning to cyan active).
    - Status changes to: `"CIRCUIT STABILIZED — AUXILIARY COUPLING READY"`.
    - `#btn-phase4-continue` is enabled, made visible, and given focus.
    - Clicking Continue dispatches `CONTINUE_TO_PHASE5`.
- **Invariants:**
  - Impossible to disconnect an already locked wire.
  - Erroneous attempts never reset previously solved connections.
  - Continue button remains strictly disabled until count === 4.

---

### Phase 5: Second 4-Wire Challenge with Timing Mechanic
- **Visual Context:** Second nano-junction board operating under live, oscillating high-voltage electrical current.
- **Wire Specification (4 Conduits with Dynamic Timing):**

| Wire ID | Color Name | Hex Code | Symbol | Number | Label | Safe Window (Min–Max %) | Current Speed |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `timed-1` | Quantum Violet | `#B026FF` | Star `★` | `1` | `Q-PULSE 1` | 40% – 60% | 1.8s cycle |
| `timed-2` | Plasma Cyan | `#00E5FF` | Hexagon `⬡` | `2` | `P-FLOW 2` | 35% – 55% | 1.5s cycle |
| `timed-3` | Solar Orange | `#FF6D00` | Cross `✚` | `3` | `S-GRID 3` | 45% – 65% | 2.0s cycle |
| `timed-4` | Neon Emerald | `#76FF03` | Shield `⛉` | `4` | `N-CORE 4` | 30% – 50% | 1.6s cycle |

- **DOM Elements & Identifiers:**
  - Container: `#phase-5` or `[data-phase="5"]`
  - Progress Counter: `#phase5-progress-counter` (format: `"X / 4 connected"` or `"X / 4 stabilized"`).
  - Timing Gauge HUD: `#timing-gauge`
    - Meter Track: `#timing-track`
    - Safe Zone Target Window: `#timing-safe-zone` (clearly styled bracketed area with text `"SAFE TARGET WINDOW"`).
    - Moving Current Indicator: `#timing-needle` or `#timing-pulse` (travels back and forth smoothly).
  - Left & Right Terminal Columns: `#terminals-left-p5`, `#terminals-right-p5`
  - Action Control: `<button id="btn-phase5-continue" class="btn-primary" disabled aria-hidden="true">Continue</button>`
- **Timing Mechanic Invariants & Math:**
  - Moving current indicator position $P(t) \in [0, 100]\%$ calculated via triangular wave or sine wave:
    $$P(t) = 50 + 50 \cdot \sin(2\pi \cdot t / T)$$
    where $T$ is the period (1.5s – 2.0s).
  - When the player attempts connection between matching terminals (via terminal click/engage or drop):
    - **Timing Check:** Evaluate if $P(t_{engage}) \ge \text{SafeMin}$ AND $P(t_{engage}) \le \text{SafeMax}$.
    - **Case 1: Correct Match + In Safe Window:**
      - SUCCESS: Conduit locks into place with energetic electrical surge.
      - Counter increments.
      - Connected terminals locked.
    - **Case 2: Correct Match + OUTSIDE Safe Window (Missed Timing):**
      - MISSED TIMING: Warning surge deflects the connection (deflection spark effect).
      - Status notification: `"TIMING DESYNC: DISCHARGE DEFLECTED — RETRY NOW"`.
      - Connection is released back to ready state.
      - **CRITICAL INVARIANT:** Completed wire pairs are **NOT reset**. Player immediately retries without penalty.
    - **Case 3: Mismatched Terminals:**
      - Mismatch error triggers regardless of timing; completed pairs remain safe.
- **Circuit Stabilization & Continuation:**
  - When 4 of 4 conduits are successfully locked:
    - Oscillating meter stabilizes at 50% (steady green line).
    - Circuit stabilization animation triggers across the entire junction board.
    - `#btn-phase5-continue` is enabled, unhidden, and focused.
    - Clicking Continue dispatches `CONTINUE_TO_PHASE6`.

---

### Phase 6: Debugging Placeholder Screen
- **Visual Context:** Diagnostic interruption modal overlay inside the nano machine's logic processing unit.
- **DOM Elements & Identifiers:**
  - Container: `#phase-6` or `[data-phase="6"]`
  - Diagnostic Header: `#debug-placeholder-title`
    - Mandatory Verbatim Text: `"DEBUGGING CHALLENGE — PLACEHOLDER"`
  - Explanatory Copy: `#debug-placeholder-copy`
    - Clear explanatory text: `"Interactive nano-logic debugging simulation will be integrated in a future expansion. Use diagnostic bypass to proceed with system initialization."`
  - Bypass Action Control: `<button id="btn-bypass-debug" class="btn-primary">Bypass for Testing</button>`
- **Behavioral Specification:**
  - No fake mini-games, deceptive clickable fake bugs, or unresolvable puzzles.
  - The "Bypass for Testing" button is prominent, styled clearly, fully accessible, and immediately functional.
  - Clicking `#btn-bypass-debug` (or Enter/Space) immediately and cleanly transitions the state machine directly to Phase 7.
- **Invariants:**
  - Bypass transition is atomic and error-free.

---

### Phase 7: Machine Restart & Circuit Power-Up
- **Visual Context:** The nanotech machine's internal and external subsystems powering on sequentially.
- **Visual FX:**
  - Sequential power-up sequence across 3 distinct visual tiers:
    1. Primary Quantum Conduits light up (neon cyan glow).
    2. Logic Processing Grid online (emerald data pulses).
    3. Magnetic Containment Stabilized (amber lights transition to solid steady green `#00E676`).
  - All red flashing alarms and warning klaxons switch OFF.
  - Machine hums with smooth ambient energy waves.
- **DOM Elements & Identifiers:**
  - Container: `#phase-7` or `[data-phase="7"]`
  - Restored Status Display: `#restart-status-display`
    - Mandatory Verbatim Text: Contains `"NANOTECH SYSTEM RESTORED"` and `"ALL CIRCUITS OPERATIONAL"`.
  - Sequential Progress Indicators: `#powerup-stages` (Stage 1: Power, Stage 2: Logic, Stage 3: Stabilizers).
  - Action Control: `<button id="btn-phase7-continue" class="btn-primary">Return to Normal Size</button>`
- **Behavioral Specification:**
  - Power-up animation sequence runs smoothly (approx 2000ms total, or immediate under reduced motion).
  - Upon power-up completion, `#btn-phase7-continue` is enabled and receives focus.
  - Clicking Continue dispatches `INITIATE_GROWTH` transition to Phase 8.
- **Invariants:**
  - Warning lights must be verified off/green before enabling continue.

---

### Phase 8: Ant-Man Returns to Normal Size (Growth & Victory)
- **Visual Context:** Reverse scale growth sequence returning Ant-Man to the full-scale laboratory, followed by the victory completion screen.
- **Visual FX:**
  - Reverse Scale Transition: Ant-Man triggers Pym particle growth. Scale animates from microscopic `scale(0.04)` up to full scale `scale(1.0)` with blue/red energy aura and particle dispersal.
  - Environment transitions from microscopic circuit interior back to normal laboratory.
  - Fully restored machine visible in background with calm, operational green indicators.
  - Victory banner with celebratory visual feedback.
- **DOM Elements & Identifiers:**
  - Container: `#phase-8` or `[data-phase="8"]`
  - Victory Banner Title: `#victory-title`
    - Mandatory Verbatim Text: `"MISSION COMPLETED / NANOTECH REPAIRED"`
  - Mission Stats Display: `#victory-stats` (e.g., `"All 8 Conduits Reconnected | System Operational"`).
  - Reset Action Control: `<button id="btn-play-again" class="btn-primary">Play Again</button>`
- **Reset Behavior ("Play Again"):**
  - Clicking `#btn-play-again` executes a **full, deterministic reset**:
    1. Game state resets to Phase 1 (`currentPhase = 1`).
    2. All wire connection states in Phase 4 and Phase 5 reset to `connected: false`.
    3. SVG wire lines and canvas particle buffers cleared.
    4. Counters reset (`0 / 4 connected`).
    5. Machine warning lights in Phase 1 reset to flashing red/amber.
    6. Phase 1 status text restored to `"NANOTECH SYSTEM FAILURE DETECTED / MANUAL REPAIR REQUIRED"`.
    7. All animations reset to initial frames.
    8. Focus cleanly placed on `#btn-begin-repair`.
- **Invariants:**
  - Zero memory leaks, zero dangling `requestAnimationFrame` loops, zero uncleaned event listeners.
  - Game can be played repeatedly an arbitrary number of times without console errors or degraded performance.

---

## 3. Deterministic Finite State Machine (FSM) Specification

### State Enumeration
```javascript
const GamePhase = Object.freeze({
  PHASE_1_MALFUNCTION: 1,
  PHASE_2_SHRINKING: 2,
  PHASE_3_ENTERING_NANO: 3,
  PHASE_4_COLOR_WIRING: 4,
  PHASE_5_TIMED_WIRING: 5,
  PHASE_6_DEBUG_PLACEHOLDER: 6,
  PHASE_7_RESTART: 7,
  PHASE_8_VICTORY_GROWTH: 8
});
```

### State Machine Transition Table

| Source State | Event Trigger | Guard Condition | Target State | Side Effects / Actions |
|---|---|---|---|---|
| `1: MALFUNCTION` | `EV_BEGIN_REPAIR` | None | `2: SHRINKING` | Mount Phase 2 scene, start scale animation, start particle vortex. |
| `2: SHRINKING` | `EV_SKIP_SHRINK` | `phase === 2` | `3: ENTERING_NANO` | Cancel shrinking rAF/timers, snap scale to nano, clean up vortex particles. |
| `2: SHRINKING` | `EV_SHRINK_COMPLETE`| `phase === 2` | `3: ENTERING_NANO` | Animation elapsed -> transition to nano interior scene. |
| `3: ENTERING_NANO`| `EV_PROCEED_WIRING` | None | `4: COLOR_WIRING` | Mount Phase 4 wiring puzzle, render terminals, init wire coords. |
| `4: COLOR_WIRING` | `EV_WIRE_CONNECTED` | `isMatch && !alreadyConnected` | `4: COLOR_WIRING` | Mark wire connected, draw SVG path, increment counter. |
| `4: COLOR_WIRING` | `EV_WIRE_MISMATCH` | `!isMatch` | `4: COLOR_WIRING` | Play error flash, reset active selection. Keep completed wires intact. |
| `4: COLOR_WIRING` | `EV_P4_CONTINUE` | `connectedCount === 4` | `5: TIMED_WIRING` | Mount Phase 5 puzzle, start timing oscillation loop. |
| `5: TIMED_WIRING` | `EV_TIMED_ATTEMPT` | `isMatch && inSafeWindow` | `5: TIMED_WIRING` | Mark timed wire connected, lock conduit, increment counter. |
| `5: TIMED_WIRING` | `EV_TIMED_MISS` | `isMatch && !inSafeWindow`| `5: TIMED_WIRING` | Play deflection flash, release selection. Keep completed intact. |
| `5: TIMED_WIRING` | `EV_P5_CONTINUE` | `connectedCount === 4` | `6: DEBUG_PLACEHOLDER`| Stop timing oscillation loop, mount diagnostic modal. |
| `6: DEBUG_PLACEHOLDER`| `EV_BYPASS_DEBUG` | None | `7: RESTART` | Direct transition to Phase 7 power-up sequence. |
| `7: RESTART` | `EV_INITIATE_GROWTH`| `powerUpComplete === true`| `8: VICTORY_GROWTH`| Start growth animation, reverse scale to lab, mount victory screen. |
| `8: VICTORY_GROWTH`| `EV_PLAY_AGAIN` | None | `1: MALFUNCTION` | Full state reset: clear all wire records, reset DOM, focus Phase 1. |

### Global State Schema
```javascript
const GameState = {
  phase: 1, // 1 through 8
  antManScale: 1.0, // 1.0 down to 0.04
  p4: {
    wires: [
      { id: 'wire-1', color: '#FF2A42', symbol: '▲', number: 1, label: 'ALPHA-1', connected: false },
      { id: 'wire-2', color: '#00B0FF', symbol: '■', number: 2, label: 'BETA-2', connected: false },
      { id: 'wire-3', color: '#FFC107', symbol: '●', number: 3, label: 'GAMMA-3', connected: false },
      { id: 'wire-4', color: '#00E676', symbol: '◆', number: 4, label: 'DELTA-4', connected: false }
    ],
    selectedLeft: null,
    connectedCount: 0,
    stabilized: false
  },
  p5: {
    conduits: [
      { id: 'timed-1', color: '#B026FF', symbol: '★', number: 1, label: 'Q-PULSE 1', safeMin: 0.40, safeMax: 0.60, connected: false },
      { id: 'timed-2', color: '#00E5FF', symbol: '⬡', number: 2, label: 'P-FLOW 2', safeMin: 0.35, safeMax: 0.55, connected: false },
      { id: 'timed-3', color: '#FF6D00', symbol: '✚', number: 3, label: 'S-GRID 3', safeMin: 0.45, safeMax: 0.65, connected: false },
      { id: 'timed-4', color: '#76FF03', symbol: '⛉', number: 4, label: 'N-CORE 4', safeMin: 0.30, safeMax: 0.50, connected: false }
    ],
    timingCurrent: 0.5, // 0.0 to 1.0
    timingDirection: 1,
    selectedLeft: null,
    connectedCount: 0,
    stabilized: false
  },
  p7: {
    powerStage: 0, // 0 to 3
    isRestored: false
  }
};
```

---

## 4. Puzzle Data Structures, Mathematics & Layout Coordinates

### Wire Coordinate & SVG Path Calculation Invariant
When drawing wires between terminals (both in Phase 4 and Phase 5):
1. **Coordinate Retrieval:** Terminal center coordinates must be computed dynamically using `getBoundingClientRect()` relative to the parent SVG container's bounding rect:
   $$x_{left} = \text{rect}_{left.center} - \text{rect}_{svg.left}$$
   $$y_{left} = \text{rect}_{left.center} - \text{rect}_{svg.top}$$
   $$x_{right} = \text{rect}_{right.center} - \text{rect}_{svg.left}$$
   $$y_{right} = \text{rect}_{right.center} - \text{rect}_{svg.top}$$
2. **Smooth Cubic Bezier Cable Curve:**
   The SVG `<path>` uses cubic Bézier handles offset horizontally to create natural cable droop / horizontal expansion:
   $$\text{controlOffset} = \max(60, |x_{right} - x_{left}| \times 0.5)$$
   $$\text{pathData} = \text{"M } x_1 \text{ } y_1 \text{ C } (x_1 + \text{offset}) \text{ } y_1 \text{, } (x_2 - \text{offset}) \text{ } y_2 \text{, } x_2 \text{ } y_2 \text{"}$$
3. **Resize Observer Invariant:**
   A single `ResizeObserver` on the game container or `window.addEventListener('resize')` recalculates all connected SVG paths so cables never distort or detach upon viewport resize or device orientation change.

### Timing Indicator Oscillation Math (Phase 5)
- Standard delta-time driven accumulator:
  ```javascript
  let lastTime = performance.now();
  function updateTiming(now) {
    const delta = (now - lastTime) / 1000;
    lastTime = now;
    
    // Smooth ping-pong oscillation between 0.0 and 1.0
    // Period T = 1.6 seconds -> frequency f = 0.625 Hz
    gaugeProgress += timingDirection * (delta / cycleDuration);
    if (gaugeProgress >= 1.0) {
      gaugeProgress = 1.0;
      timingDirection = -1;
    } else if (gaugeProgress <= 0.0) {
      gaugeProgress = 0.0;
      timingDirection = 1;
    }
    
    // Render needle at gaugeProgress * 100 %
  }
  ```
- **Tolerance Window:**
  Each conduit defines `safeMin` (e.g. 0.40) and `safeMax` (e.g. 0.60).
  Safe hit condition: `gaugeProgress >= safeMin && gaugeProgress <= safeMax`.
  Safe target window bracket visually highlights this exact normalized span on the meter track.

---

## 5. Edge Case Matrix & Fault Tolerance

| # | Edge Case Scenario | Potential Failure Mode | Required Deterministic Behavior |
|---|---|---|---|
| **E1** | **Rapid Double-Clicks on Buttons** | Multiple transitions, double phase increments, race conditions | Event handlers guard against duplicate dispatch by verifying `currentPhase === expectedPhase` before mutating state. Disable trigger button immediately upon first click. |
| **E2** | **Clicking Skip Shrink Mid-Animation** | Dangling timers or orphaned requestAnimationFrames | `skipShrink()` immediately calls `cancelAnimationFrame`, clears timeouts, forcibly sets `antManScale = 0.04`, and executes immediate atomic state shift to Phase 3. |
| **E3** | **Window Resize During Wire Dragging** | Inaccurate SVG coordinates, detached cursor lines | Drag calculation derives offsets using `clientX/Y` vs `svg.getBoundingClientRect()`. Resize observer re-computes connected wire paths. |
| **E4** | **Pointer Leaves Window Mid-Drag** | Stuck drag state, wire floating infinitely | `pointercancel` and window `pointerup` event listeners catch out-of-bounds releases and gracefully snap wire back to source. |
| **E5** | **Drag onto Wrong / Already Connected Terminal** | Overwriting solved pairs or invalid wiring | Target terminal validation checks: 1) Is target already connected? 2) Does target match source ID? If invalid, trigger shake animation and snap back; DO NOT modify solved pairs. |
| **E6** | **Connecting Two Left or Two Right Terminals** | Nonsensical self-connection | Terminal selection state rejects connection attempts between terminals belonging to the same column (`data-side === data-side`). |
| **E7** | **Missed Timing Window in Phase 5** | Frustration if previous progress is lost | **Zero penalty on prior wires:** Only the current connection attempt fails. Previously connected conduits remain 100% locked. Player immediately retries. |
| **E8** | **Keyboard-Only Traversal (Accessibility)** | Trapping focus or inaccessible wire terminals | Terminals are native `<button>` or have `role="button"` + `tabindex="0"`. Space/Enter triggers selection. Esc cancels active selection. Visible high-contrast focus rings (`outline: 3px solid #00E5FF`). |
| **E9** | **Prefers-Reduced-Motion Enabled** | Motion sickness or flashing lights trigger | CSS `@media (prefers-reduced-motion: reduce)` disables intense camera shaking, flashing lights switch to gentle color fades, and shrinking/growth transitions snap instantly or crossfade smoothly. |
| **E10**| **"Play Again" Memory Leak / State Bleed** | Orphaned animation loops, lingering wire connections | `resetGame()` cleanly resets state object, stops all `requestAnimationFrame` loops, clears SVG `<path>` elements, resets DOM classes, and returns focus to Phase 1. |
| **E11**| **Mobile Touch Scrolling During Wire Drag** | Page scrolls instead of drawing wire | Interactive wire puzzle area has `touch-action: none` to prevent default touch scroll during drag operations. |
| **E12**| **Very Narrow Mobile Viewport (< 360px)** | Terminal labels overlap or become unreadable | Responsive flex/grid layout stacks left and right terminals with clear vertical clearance, scaling font size and symbol glyphs cleanly. |

---

## 6. Exact Verbatim String & DOM Contract Reference

To guarantee 100% adherence to all acceptance criteria, the following exact text strings must be present in the UI:

| Phase | Required Element | Exact Verbatim String Requirement |
|---|---|---|
| **Phase 1** | Machine Status Text | `"NANOTECH SYSTEM FAILURE DETECTED / MANUAL REPAIR REQUIRED"` |
| **Phase 1** | Primary Action Button | `"Begin Repair"` |
| **Phase 2** | Skip Action Button | `"Skip"` or `"Skip Animation"` |
| **Phase 3** | Objective Prompt | `"Reconnect four matching wire pairs."` |
| **Phase 4** | Progress Counter | `"X / 4 connected"` (e.g. `"0 / 4 connected"`, `"4 / 4 connected"`) |
| **Phase 4** | Next Phase Action | `"Continue"` |
| **Phase 5** | Timing Gauge Safe Zone | Visible label indicating `"SAFE TARGET WINDOW"` / `"SAFE ZONE"` |
| **Phase 5** | Next Phase Action | `"Continue"` |
| **Phase 6** | Placeholder Diagnostic Header | `"DEBUGGING CHALLENGE — PLACEHOLDER"` |
| **Phase 6** | Bypass Action Button | `"Bypass for Testing"` |
| **Phase 7** | System Restored Status | `"NANOTECH SYSTEM RESTORED"` / `"ALL CIRCUITS OPERATIONAL"` |
| **Phase 7** | Next Phase Action | `"Continue"` |
| **Phase 8** | Victory Screen Banner | `"MISSION COMPLETED / NANOTECH REPAIRED"` |
| **Phase 8** | Replay Action Button | `"Play Again"` |

---

## 7. Discovered Features & Edge Cases Tables

### Features Discovered Table
| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|---|---|---|---|---|---|---|
| 1 | Flow | Malfunction Display (P1) | Displays malfunctioning machine, flashing warnings, sparks | Page load | Rendered 2.5D lab scene | Fallback to static text if CSS fail | ORIGINAL_REQUEST R3 |
| 2 | Navigation | Begin Repair (P1) | Advances from Phase 1 to Phase 2 | Click, Touch, Enter/Space | Phase transition to P2 | Ignored if not in Phase 1 | ORIGINAL_REQUEST R3 |
| 3 | Animation | Shrinking Transition (P2) | Scales Ant-Man down, camera zooms into aperture | Timer / rAF tick | Smooth scale down (1.0 -> 0.04) | Reduced motion disables animation | ORIGINAL_REQUEST R2, R3 |
| 4 | Navigation | Skip Shrink (P2) | Immediately bypasses shrinking animation | Click, Touch, Enter/Space | Immediate transition to P3 | Safe no-op if clicked at animation end | ORIGINAL_REQUEST R2, R3 |
| 5 | Environment | Microscopic Nano Hub (P3) | Renders interior nano circuit environment with depth | Transition from P2 | 2.5D microscopic view + objective | Graceful fallback without 3D perspective | ORIGINAL_REQUEST R3 |
| 6 | Puzzle | 4-Wire Color Match (P4) | Color + Symbol + Number + Label dual-coded wiring | Click/Tap or Drag-and-Drop | Connected wire SVG path, counter inc | Error flash on mismatch; retains solved | ORIGINAL_REQUEST R3, R4 |
| 7 | Puzzle | Non-Destructive Wire Retry (P4) | Allows retrying failed wire without losing solved pairs | Mismatched pair drop/click | Shake anim, audio-visual feedback | No loss of completed pairs | ORIGINAL_REQUEST R3 |
| 8 | Animation | Circuit Stabilization (P4) | Animates circuit power sync once 4/4 connected | 4/4 completed wires | Conduit glow wave, enables Continue | Continue disabled until 4/4 | ORIGINAL_REQUEST R3 |
| 9 | Puzzle | Moving Current Timing Match (P5) | Connect wire when moving indicator is in safe window | Engage wire during safe window | Successful lock, counter increment | Deflection flash on miss; retains solved | ORIGINAL_REQUEST R3 |
| 10 | Puzzle | Timing Gauge Indicator (P5) | Oscillating current gauge with highlighted safe zone | rAF animation loop | Moving needle + bracketed safe zone | Fallback to static centered needle | ORIGINAL_REQUEST R3 |
| 11 | Diagnostic | Debugging Placeholder (P6) | Explicit placeholder screen for future mini-game | Transition from P5 | Header + explanatory copy + bypass btn | N/A (static accessible screen) | ORIGINAL_REQUEST R3 |
| 12 | Navigation | Bypass for Testing (P6) | Directly transitions from Phase 6 to Phase 7 | Click, Touch, Enter/Space | Immediate transition to P7 | Atomically shifts state | ORIGINAL_REQUEST R3 |
| 13 | Animation | Sequential Power-Up (P7) | Subsystems reactivate sequentially, warnings clear | Transition from P6 | 3-stage visual restore, green lights | Fast-forward under reduced motion | ORIGINAL_REQUEST R3 |
| 14 | Status | Restored Status Display (P7) | Verbatim restored messages displayed clearly | Power-up finish | "NANOTECH SYSTEM RESTORED" etc. | High contrast guaranteed | ORIGINAL_REQUEST R3 |
| 15 | Animation | Growth Return Transition (P8) | Reverse-scale animation back to lab | Continue click from P7 | Scale up (0.04 -> 1.0) into lab | Fast-forward under reduced motion | ORIGINAL_REQUEST R2, R3 |
| 16 | Victory | Victory Screen (P8) | Mission completion banner and metrics | Growth completion | "MISSION COMPLETED / NANOTECH REPAIRED" | High contrast display | ORIGINAL_REQUEST R3 |
| 17 | Reset | Deterministic Play Again (P8) | Resets state completely back to Phase 1 | Click, Touch, Enter/Space | Clean reset of state, wires, DOM | Clears all rAF and event states | ORIGINAL_REQUEST R3 |
| 18 | Accessibility | Dual-Coded Terminals | Every terminal has color, symbol, number, label | Visual/DOM render | Accessible to colorblind & screen readers | Fallback labels always in DOM | ORIGINAL_REQUEST R4 |
| 19 | Accessibility | Full Keyboard Navigation | Complete game playable via Tab/Arrow/Enter/Esc | Keydown events | Focus rings, selection toggles | Escape releases active selection | ORIGINAL_REQUEST R4 |
| 20 | Responsiveness | Fluid 2.5D Viewport Adapt | Adapts cleanly from 320px mobile to 4K desktop | Viewport resize | Dynamic SVG wire recalculated | ResizeObserver prevents cord detach | ORIGINAL_REQUEST R4 |

### Edge Cases Table
| # | Feature | Input | Observed Behavior |
|---|---|---|---|
| 1 | Begin Repair Button | Rapid double-click | First click dispatches transition; second click is ignored because phase is no longer Phase 1. |
| 2 | Skip Shrink Button | Clicked at t = 2990ms (right as animation completes) | State guard checks `if (state.phase === 2)`; transitions cleanly to Phase 3 without double-firing. |
| 3 | Wire Drag (P4/P5) | Drag started on left terminal, cursor released outside window | Window-level `pointerup` cancels drag, cord retracts smoothly to source terminal; state remains idle. |
| 4 | Wire Connection (P4) | Drag Left Terminal 1 to Right Terminal 3 (Mismatch) | Red jitter/shake animation, toast message; selection cleared; already completed wires remain connected. |
| 5 | Wire Connection (P4/P5)| Drag Left Terminal 1 to already connected Right Terminal | Drop ignored, wire snaps back to source; no mutation of existing connections. |
| 6 | Wire Connection (P4/P5)| Drag Left Terminal 1 to Left Terminal 2 | Terminal side comparison rejects connection; selection cleared. |
| 7 | Timed Wire (P5) | Correct wire match engaged while indicator is at 10% (Outside 40-60% Safe Window) | Deflection spark effect; toast `"TIMING DESYNC"`; wire remains unconnected; all previously solved wires remain locked. |
| 8 | Timed Wire (P5) | Correct wire match engaged while indicator is at 50% (Inside Safe Window) | Successful connection; glowing lock animation; conduit locked; counter increments. |
| 9 | Bypass for Testing (P6)| Clicked repeatedly | Transitions directly to Phase 7 on first click; subsequent clicks no-op. |
| 10 | Resize During Game | Viewport resized from desktop to mobile portrait | `ResizeObserver` detects container rect change, recalculates SVG terminal coordinates, updates `<path d="...">` paths in real time. |
| 11 | Reduced Motion Mode | System setting `prefers-reduced-motion: reduce` enabled | Shrink (P2) and Growth (P8) scale durations collapse to instant/crossfade; sparks are gentle fades; flashing lights use non-strobing calm pulses. |
| 12 | Play Again Replay | "Play Again" clicked after completing full playthrough | Resets all wires, counters, DOM classes, timers, and returns focus to "Begin Repair" in Phase 1 with zero console errors. |

---

## 8. Conclusion & Handoff Readiness

This specification defines every phase, state transition, data structure, math formula, edge case, and exact text requirement. It serves as an unambiguous blueprint for the test authoring agent and the core implementation team.
