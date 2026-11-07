# Test Infrastructure & E2E Test Architecture Specification

**Project:** Ant-Man Nano-Repair 2.5D Game  
**Author:** E2E Test Architect (`test_writer_e2e`)  
**Status:** Canonical Test Infrastructure Specification  
**Version:** 1.0.0  

---

## 1. Test Philosophy & Design Principles

### 1.1 Strict Opaque-Box Methodology
The End-to-End (E2E) testing suite operates on a strict **opaque-box (black-box)** testing philosophy. Tests are derived 100% from user requirements (`ORIGINAL_REQUEST.md`) and behavioral specifications (`PROJECT.md`).
- **No Reliance on Implementation Details:** Tests never depend on private function names, internal variables, or non-contractual closures.
- **Contractual DOM & State Surface:** Interactions occur via standard user interface actions (DOM click events, Pointer Events, Keyboard Events, ResizeObserver triggers) and observe observable DOM output (elements, text, classes, ARIA states, SVG paths, coordinates, and computed styles) along with public interface contracts.
- **Zero Dummy / Facade Testing:** Hardcoded passing or mock assertions designed to bypass real logic are strictly prohibited. Every test case actively exercises actual UI, animation, timing, accessibility, and state transitions.

### 1.2 Deterministic Output Derivation
Every assertion in this suite has an authoritative derivation source:
1. **Verbatim Text Contracts:** Extracted directly from `ORIGINAL_REQUEST.md` (e.g. `"NANOTECH SYSTEM FAILURE DETECTED / MANUAL REPAIR REQUIRED"`, `"Reconnect four matching wire pairs."`, `"DEBUGGING CHALLENGE — PLACEHOLDER"`, `"Bypass for Testing"`, `"NANOTECH SYSTEM RESTORED"`, `"MISSION COMPLETED / NANOTECH REPAIRED"`).
2. **State & Logic Contracts:** Phase progression (1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 1), 4-wire connectivity counters (`X / 4 connected`), timing window tolerance bounds ($[\text{safeMin}, \text{safeMax}]$), and non-destructive retry guarantees.
3. **Accessibility (WCAG 2.1 AA/AAA) Specifications:** Dual-coding (Color + Symbol + Number + Label), minimum 44×44px hit targets, `:focus-visible` dual-ring indicators, and ARIA live notifications.

---

## 2. Feature Inventory: 8 Phases & 28 Features

All 28 features identified in `PROJECT.md` are mapped directly into the testing matrix:

| Feature ID | Feature Name | Phase / Scope | Primary Contract & Verification Point |
|---|---|---|---|
| **F01** | Malfunction Display | Phase 1 | Verbatim failure text, flashing warning lights, spark emitter container |
| **F02** | Begin Repair Action | Phase 1 | "Begin Repair" button initiates transition to Phase 2 with keyboard/mouse/touch parity |
| **F03** | Shrinking Transition | Phase 2 | Ant-Man scale reduction (1.0 -> 0.04), camera push perspective, Pym particle aura |
| **F04** | Skip Shrink Action | Phase 2 | "Skip Animation" / "Skip" button immediately snaps to Phase 3 (<50ms) |
| **F05** | Microscopic Nano Hub | Phase 3 | 2.5D circuit depth layers, verbatim objective prompt "Reconnect four matching wire pairs." |
| **F06** | 4-Wire Color Match | Phase 4 | 4 pairs with distinct color, symbol, number, and label; drag/click connect locks path |
| **F07** | Non-Destructive Wire Retry | Phase 4 | Incorrect wire connection triggers error flash but retains already connected pairs |
| **F08** | Circuit Stabilization | Phase 4 | Connecting all 4 pairs triggers circuit stabilization animation and enables "Continue" |
| **F09** | Moving Current Timing Match | Phase 5 | Oscillating current needle; connection within safe target window locks conduit |
| **F10** | Non-Destructive Timing Retry | Phase 5 | Missed timing window deflects connection without resetting completed connections |
| **F11** | Circuit Stabilization | Phase 5 | Connecting all 4 conduits stabilizes gauge and enables "Continue" button |
| **F12** | Debugging Placeholder | Phase 6 | Header "DEBUGGING CHALLENGE — PLACEHOLDER" with explanatory copy |
| **F13** | Bypass for Testing | Phase 6 | Prominent, working "Bypass for Testing" button advancing directly to Phase 7 |
| **F14** | Sequential Circuit Power-Up | Phase 7 | 3-stage visual sequential circuit activation; warning lights switch off / green |
| **F15** | Restored Status Display | Phase 7 | Status displays "NANOTECH SYSTEM RESTORED" / "ALL CIRCUITS OPERATIONAL" and Continue |
| **F16** | Reverse Growth Transition | Phase 8 | Ant-Man scales back from nano (0.04) to lab (1.0) with Pym particle energy field |
| **F17** | Victory Screen Banner | Phase 8 | Victory banner displays "MISSION COMPLETED / NANOTECH REPAIRED" with stats |
| **F18** | Deterministic Play Again | Phase 8 | "Play Again" button executes complete, clean state reset back to Phase 1 |
| **F19** | Scalable SVG Ant-Man Asset | Visual / Cross-Phase | Pure SVG vector character scaling smoothly without raster degradation or image swap |
| **F20** | Layered 2.5D CSS Stage | Visual / Cross-Phase | 6 discrete spatial depth planes (-400px to +140px translateZ) with perspective |
| **F21** | Canvas Particle Engine | FX / Cross-Phase | Full-viewport canvas particle system with phase emitter modes |
| **F22** | Prefers-Reduced-Motion Overrides | A11y / Cross-Phase | Motion query overrides eliminating rapid strobing and camera swoops |
| **F23** | Multi-Modal Input Parity | Interaction | Pointer Events (drag/drop + tap) and complete Keyboard matrix (Tab/Enter/Space/Arrows/Esc) |
| **F24** | High-Contrast Focus & Touch Targets | A11y / Interaction | Minimum 44×44px touch targets; dual-layer focus rings (>10:1 contrast) |
| **F25** | 5-Dimensional Terminal Dual-Coding | A11y / Puzzle | Color + Symbol + Number + Label + Stroke dash (WCAG 1.4.1 non-color reliance) |
| **F26** | Synthesized Web Audio API | Audio / UX | Zero-asset algorithmic Web Audio sound engine for tactile audio-visual cues |
| **F27** | Dynamic SVG Wire Tracking | Layout / Responsiveness | ResizeObserver recalculates Bézier coordinates dynamically upon window resize |
| **F28** | Screen Reader ARIA Live Regions | A11y / Screen Readers | Dual polite/assertive ARIA live regions with verbatim status announcements |

---

## 3. Four-Tier Test Methodology

The E2E test suite organizes tests into four concentric validation tiers, progressing from fundamental feature coverage up to full-scale end-to-end user playthroughs:

```
+-------------------------------------------------------------------------+
|                  Tier 4: Real-World Scenarios (Playthroughs)            |
|       Golden Path | Fast Skip | A11y Keyboard | Multi-Cycle Reset       |
+-------------------------------------------------------------------------+
                                     |
+-------------------------------------------------------------------------+
|                Tier 3: Cross-Feature Interactions & Modes               |
|      A11y + Wiring | Reduced Motion + Transitions | Resize + Puzzle     |
+-------------------------------------------------------------------------+
                                     |
+-------------------------------------------------------------------------+
|                  Tier 2: Boundary & Corner Cases                        |
|   Rapid Clicks | Boundary Timing Hits/Misses | Out-of-Bounds Drops     |
+-------------------------------------------------------------------------+
                                     |
+-------------------------------------------------------------------------+
|                  Tier 1: Comprehensive Feature Coverage                 |
|             >= 5 Dedicated Test Cases Per Core Phase / Feature          |
+-------------------------------------------------------------------------+
```

### 3.1 Tier 1: Feature Coverage (>=5 Test Cases per Phase / Core Area)
Validates that every phase and feature exhibits its primary contract and happy-path behavior:
- **Phase 1 (5+ tests):**
  - T1.P1.01: Verbatim status text `"NANOTECH SYSTEM FAILURE DETECTED / MANUAL REPAIR REQUIRED"` present.
  - T1.P1.02: Flashing warning lights and spark particle emitter present in DOM.
  - T1.P1.03: Ant-Man rendered at initial full laboratory scale (scale factor ~1.0).
  - T1.P1.04: "Begin Repair" action button exists, enabled, and has accessible name.
  - T1.P1.05: Triggering "Begin Repair" dispatches state transition to Phase 2.
- **Phase 2 (5+ tests):**
  - T1.P2.01: Phase 2 active state confirmed; Ant-Man Pym particle energy aura active.
  - T1.P2.02: Scale transform decreases continuously toward nano-scale (~0.04).
  - T1.P2.03: Camera rig applies 3D perspective zoom towards machine aperture.
  - T1.P2.04: "Skip" button exists, visible, and labeled "Skip" / "Skip Animation".
  - T1.P2.05: Clicking "Skip" immediately advances game to Phase 3 without waiting.
- **Phase 3 (5+ tests):**
  - T1.P3.01: Phase 3 microscopic interior environment loaded with 2.5D depth layers.
  - T1.P3.02: Verbatim objective text `"Reconnect four matching wire pairs."` displayed.
  - T1.P3.03: Nano-scale Ant-Man visible on micro silicon platform.
  - T1.P3.04: Circuit access / continue button present and functional.
  - T1.P3.05: Proceeding from Phase 3 mounts Phase 4 wiring puzzle.
- **Phase 4 (5+ tests):**
  - T1.P4.01: Phase 4 renders 4 left source terminals and 4 right destination terminals.
  - T1.P4.02: All terminals exhibit 5-dimensional dual coding (color, symbol, number, label, dash).
  - T1.P4.03: Initial counter displays `"0 / 4 connected"`; Continue button is disabled.
  - T1.P4.04: Matching wire connection increments counter (`"1 / 4 connected"`) and draws SVG wire path.
  - T1.P4.05: Connecting all 4 matching pairs triggers circuit stabilization and enables "Continue".
- **Phase 5 (5+ tests):**
  - T1.P5.01: Phase 5 renders 4 timed conduits with oscillating electrical current gauge.
  - T1.P5.02: Safe target window clearly defined and visually indicated (`"SAFE TARGET WINDOW"`).
  - T1.P5.03: Connecting conduit inside safe target window locks wire and increments counter.
  - T1.P5.04: Non-destructive retry: Missed timing window deflects connection without resetting completed wires.
  - T1.P5.05: All 4 timed conduits completed stabilizes circuit and enables "Continue" button.
- **Phase 6 (5+ tests):**
  - T1.P6.01: Phase 6 diagnostic container active.
  - T1.P6.02: Verbatim header `"DEBUGGING CHALLENGE — PLACEHOLDER"` present.
  - T1.P6.03: Explanatory copy clearly informs user that simulation will be added in future expansion.
  - T1.P6.04: "Bypass for Testing" button prominent, accessible, and active.
  - T1.P6.05: Clicking "Bypass for Testing" directly advances state machine to Phase 7.
- **Phase 7 (5+ tests):**
  - T1.P7.01: Phase 7 sequential circuit power-up initiates.
  - T1.P7.02: Warning lights transition from flashing red/amber to steady green/off.
  - T1.P7.03: Verbatim restored status contains `"NANOTECH SYSTEM RESTORED"` and `"ALL CIRCUITS OPERATIONAL"`.
  - T1.P7.04: Power-up sequence completes enabling Continue button.
  - T1.P7.05: Clicking Continue initiates growth transition to Phase 8.
- **Phase 8 (5+ tests):**
  - T1.P8.01: Phase 8 reverse-scale growth restores Ant-Man to laboratory scale (1.0).
  - T1.P8.02: Verbatim victory banner `"MISSION COMPLETED / NANOTECH REPAIRED"` displayed.
  - T1.P8.03: Mission stats summary displayed.
  - T1.P8.04: "Play Again" button visible, enabled, and labeled.
  - T1.P8.05: Clicking "Play Again" performs full deterministic reset to Phase 1.
- **Cross-Cutting Systems (10+ tests):**
  - T1.CC.01: Pure SVG character controller (scalable vector, no broken external image links).
  - T1.CC.02: 6-plane 2.5D CSS stage structure with `preserve-3d` and discrete `translateZ` planes.
  - T1.CC.03: Full-viewport canvas particle engine with active context.
  - T1.CC.04: Minimum 44×44px touch targets on all interactive controls.
  - T1.CC.05: Dual polite and assertive ARIA live regions for screen readers.

### 3.2 Tier 2: Boundary & Corner Cases
Validates stability under adversarial input, boundary numbers, and edge transitions:
- **T2.01: Rapid Double-Clicks:** Consecutive rapid clicks on "Begin Repair" in Phase 1 do not cause state race or skip Phase 2.
- **T2.02: Skip Shrink at Boundary:** Clicking "Skip" at start or right before natural completion smoothly transitions to Phase 3 without double-dispatch.
- **T2.03: Out-of-Bounds Wire Drag:** Dragging a wire cursor outside the window or off-canvas triggers pointercancel/snapback to source without dangling coordinates.
- **T2.04: Same-Column Terminal Connection:** Attempting to connect two Left terminals or two Right terminals is strictly rejected.
- **T2.05: Overwrite Prevention:** Attempting to drop a wire onto an already-connected terminal is rejected without corrupting the existing connection.
- **T2.06: Timing Gauge Boundary Hit:** Engaging timed conduit at exactly `safeMin` (e.g. 0.40) or `safeMax` (e.g. 0.60) counts as a successful hit.
- **T2.07: Timing Gauge Boundary Miss:** Engaging timed conduit at `safeMin - 0.01` or `safeMax + 0.01` triggers deflection without penalty on prior wires.
- **T2.08: Window Resize During Puzzle:** Simulating window resize event causes `ResizeObserver` to recalculate connected SVG Bézier wire paths without detachment.
- **T2.09: Rapid Bypass Clicks:** Clicking "Bypass for Testing" in Phase 6 multiple times is idempotent and advances cleanly to Phase 7.
- **T2.10: Extreme Viewport Stress:** 320px mobile portrait vs 1920px desktop layouts maintain terminal readability and interactive target clearance.

### 3.3 Tier 3: Cross-Feature Interactions
Validates multi-modal input combinations, accessibility modes, and concurrent subsystem interactions:
- **T3.01: Click Selection + Keyboard Escape:** Selecting a wire terminal via click then pressing Escape cancels selection state cleanly.
- **T3.02: Keyboard Navigation Matrix:** Complete Phase 4 wire connection executed purely with Tab/Arrows navigation and Enter/Space activation.
- **T3.03: Reduced Motion + Phase 2 Shrink:** Under `prefers-reduced-motion: reduce`, shrinking transition completes instantly without vertigo zoom.
- **T3.04: Reduced Motion + Phase 7 Power-Up:** Under reduced motion, sequential power-up completes cleanly without flashing or delayed transitions.
- **T3.05: Reduced Motion + Phase 8 Growth:** Under reduced motion, growth transition to lab completes cleanly without camera shake.
- **T3.06: Partial Wiring + Resize + Completion:** Connecting 2 of 4 wires in Phase 4, resizing the window, then connecting the remaining 2 wires succeeds with accurate SVG paths.
- **T3.07: Partial Timed Wiring + Timing Miss + Subsequent Hit:** In Phase 5, connecting wire 1, failing wire 2 timing, and immediately succeeding wire 2 preserves wire 1 and advances counter to 2/4.
- **T3.08: Web Audio Synthesizer Safety:** Interacting with sound-producing actions does not throw exceptions if audio context is suspended or autoplay-restricted.
- **T3.09: Dual ARIA Live Synchronization:** Phase transitions and puzzle events dispatch appropriate announcements to polite/assertive live regions.

### 3.4 Tier 4: Real-World Scenarios
Validates complete user journeys from start to finish:
- **T4.01: Full Golden Path Playthrough:**
  Player navigates Phase 1 -> Phase 2 (natural shrinking) -> Phase 3 -> Phase 4 (connects all 4 wire pairs) -> Phase 5 (connects all 4 timed conduits) -> Phase 6 (clicks Bypass) -> Phase 7 (power-up sequence) -> Phase 8 (growth & victory screen verified).
- **T4.02: Fast Skip Speedrun Playthrough:**
  Player starts Phase 1 -> clicks Skip on Phase 2 (<50ms) -> Phase 3 -> connects Phase 4 wires -> connects Phase 5 conduits -> Phase 6 Bypass -> Phase 7 -> Phase 8.
- **T4.03: Accessible Keyboard-Only & Non-Color Playthrough:**
  Full playthrough from Phase 1 to Phase 8 using only Keyboard events (Enter, Space, Tab) and matching terminals solely by symbol, number, and label without reliance on color.
- **T4.04: Multi-Cycle Replay & State Cleanliness:**
  Full playthrough to Phase 8 victory -> click "Play Again" -> verify complete reset to Phase 1 (wires disconnected, counters 0/4, lights flashing red, status text reset) -> complete second full playthrough to Phase 8 with zero console errors.

---

## 4. Test Runner Architecture

### 4.1 In-Browser Test Runner (`test/e2e_runner.html`)
The in-browser test runner embeds `index.html` within an isolated `<iframe>` element.
- **Isolation & Communication:** Interacts directly with the iframe DOM through standard DOM APIs (`iframe.contentDocument`, `iframe.contentWindow`).
- **Real-Time Visual Dashboard:** Displays test status cards, tier breakdowns, real-time pass/fail indicators, execution time, and expandable test step logs.
- **Automated Summary Object:** Populates `window.__TEST_RESULTS__`:
  ```javascript
  window.__TEST_RESULTS__ = {
    total: 58,
    passed: 58,
    failed: 0,
    errors: [],
    durationMs: 12450,
    completed: true,
    tiers: {
      tier1: { total: 45, passed: 45, failed: 0 },
      tier2: { total: 10, passed: 10, failed: 0 },
      tier3: { total: 9, passed: 9, failed: 0 },
      tier4: { total: 4, passed: 4, failed: 0 }
    }
  };
  ```

### 4.2 Headless Execution Runner (`test/run_headless.js`)
A zero-dependency Node.js execution script:
- Spins up a local HTTP server serving the workspace.
- Launches Microsoft Edge or Google Chrome in headless mode with `--remote-debugging-port`.
- Connects to Chrome DevTools Protocol (CDP) via WebSocket.
- Navigates to `http://127.0.0.1:<port>/test/e2e_runner.html`.
- Streams console logs, monitors test progress, and extracts `window.__TEST_RESULTS__`.
- Exits with return code 0 on complete pass, or return code 1 on failure.

---

## 5. Summary & Test Readiness Checklist
- [x] Opaque-box philosophy strictly defined.
- [x] All 8 phases and 28 features mapped to explicit test cases.
- [x] Tier 1 Feature Coverage (>=5 tests per phase) specified.
- [x] Tier 2 Boundary & Corner Cases specified.
- [x] Tier 3 Cross-Feature Interactions specified.
- [x] Tier 4 Real-World End-to-End Playthroughs specified.
- [x] Test runner architecture and automation hooks specified.
