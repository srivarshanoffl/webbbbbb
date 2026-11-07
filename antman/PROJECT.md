# Project: Ant-Man Nano-Repair 2.5D Game

## Architecture
The game is built strictly using Vanilla HTML5, CSS3, and JavaScript across three canonical files: `index.html`, `style.css`, and `script.js` without any external frameworks, libraries, build tools, or preprocessors.

```
+--------------------------------------------------------------------------+
|                                Viewport                                  |
|  +--------------------------------------------------------------------+  |
|  | #app-container (Perspective 1000px, 3D Camera Rig)                  |  |
|  |  +--------------------------------------------------------------+  |  |
|  |  | 6-Plane 2.5D CSS Stage (-400px to +140px translateZ)         |  |  |
|  |  |   - Plane 1 (-400px): Distant Lab/Quantum Void               |  |  |
|  |  |   - Plane 2 (-200px): Machine Chassis / Monolithic ICs       |  |  |
|  |  |   - Plane 3 (0px): Ground Platform / PCB Surface             |  |  |
|  |  |   - Plane 4 (+40px): Actors (Ant-Man SVG, Terminals)         |  |  |
|  |  |   - Plane 5 (+80px): SVG Dynamic Cable Overlay (#wire-svg)   |  |  |
|  |  |   - Plane 6 (+140px): Foreground Bokeh & Conduit Traces      |  |  |
|  |  +--------------------------------------------------------------+  |  |
|  |  | #fx-canvas (Full-viewport 250-Object Pool Canvas Particle Engine)  |
|  |  +--------------------------------------------------------------+  |  |
|  |  | #hud-overlay (A11y Counters, Status, Bypass/Skip Buttons, Dialogs) |
|  |  +--------------------------------------------------------------+  |  |
|  |  | #aria-live-polite & #aria-live-assertive (Screen Reader Support)   |
|  +--------------------------------------------------------------------+  |
+--------------------------------------------------------------------------+
```

### Module Boundaries & Namespaces in `script.js`
1. `GameConfig`: Static constants, phase definitions, wire terminal data, timing parameters, and copy text.
2. `GameState`: Deterministic state machine container, transition guards, and phase state data.
3. `AudioSynth`: Algorithmic Web Audio API synthesizer for tactile audio feedback (zero asset files).
4. `ParticleEngine`: 250-element Object Pool Canvas particle system (7 phase-specific emitter modes).
5. `AntManView`: Inline SVG character controller (scale transforms 1.0 to 0.04, visor glow, energy field).
6. `WirePuzzle`: Pointer Events drag-and-drop & click-to-connect engine, cubic Bézier SVG renderer, ResizeObserver.
7. `MazeEngine`: Microscopic integrated circuit labyrinth navigator, BFS pathfinding, collision physics, dual-coded quantum nodes, virtual D-Pad.
8. `TimingMechanic`: High-precision rAF current gauge oscillator, safe-window hit detector, deflection FX.
9. `A11yManager`: Screen reader live announcements, keyboard navigation matrix, focus manager, reduced-motion detector.
10. `UIManager`: Scene orchestrator, button binding, verbatim text enforcement, Phase 6 bypass, Phase 8 reset.

---

## Feature Inventory
Every feature from the Survey phase appears here with an assigned milestone. No feature is unassigned.

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Malfunction Display (P1) | Flashing warning lights, malfunction sparks, verbatim warning status | M1 | survey_spec |
| 2 | Begin Repair Action (P1) | "Begin Repair" button transitioning to Phase 2 with keyboard/touch support | M1 | survey_spec |
| 3 | Shrinking Transition (P2) | Ant-Man smooth scale reduction (1.0 -> 0.04), camera push, energy aura | M1 | survey_spec, survey_visuals |
| 4 | Skip Shrink Action (P2) | Working "Skip" button immediately jumping to Phase 3 (<50ms) | M1 | survey_spec, survey_visuals |
| 5 | Microscopic Nano Hub (P3) | Oversized circuit traces, layered platforms, verbatim objective prompt | M1 | survey_spec, survey_visuals |
| 6 | 4-Wire Color Match (P4) | 4-pair wiring puzzle with distinct colors, symbols, numbers, and labels | M1 | survey_spec, survey_a11y |
| 7 | Non-Destructive Wire Retry (P4) | Mismatched wire allows immediate retry without resetting completed pairs | M1 | survey_spec |
| 8 | Circuit Stabilization (P4) | All 4 wires connected triggers stabilization animation and enables Continue | M1 | survey_spec |
| 9 | Moving Current Timing Match (P5) | Oscillating current indicator with safe window; connection in safe window locks wire | M1 | survey_spec |
| 10 | Non-Destructive Timing Retry (P5) | Missed timing window deflects current but does NOT reset completed connections | M1 | survey_spec |
| 11 | Circuit Stabilization (P5) | All 4 timed conduits connected stabilizes circuit and enables Continue | M1 | survey_spec |
| 12 | Debugging Placeholder (P6) | Screen marked "DEBUGGING CHALLENGE — PLACEHOLDER" with explanatory copy | M1 | survey_spec |
| 13 | Bypass for Testing (P6) | Prominent, working "Bypass for Testing" button directly advancing to Phase 7 | M1 | survey_spec |
| 14 | Sequential Circuit Power-Up (P7) | 3-tier sequential power restoration, warning lights turning off/green | M1 | survey_spec, survey_visuals |
| 15 | Restored Status Display (P7) | Displays "NANOTECH SYSTEM RESTORED" / "ALL CIRCUITS OPERATIONAL" and Continue | M1 | survey_spec |
| 16 | Reverse Growth Transition (P8) | Scale growth from nano (0.04) back to lab size (1.0) with Pym aura | M1 | survey_spec, survey_visuals |
| 17 | Victory Screen Banner (P8) | Displays "MISSION COMPLETED / NANOTECH REPAIRED" with stats | M1 | survey_spec |
| 18 | Deterministic Play Again (P8) | "Play Again" button executing full, clean state reset back to Phase 1 | M1 | survey_spec |
| 19 | Scalable SVG Ant-Man Asset | Pure SVG vector character scaling smoothly without pixelation or image swapping | M1 | survey_visuals |
| 20 | Layered 2.5D CSS Stage | 6 discrete spatial depth planes with CSS 3D perspective and dynamic shadows | M1 | survey_visuals |
| 21 | Canvas Particle Engine | 250-element Object Pool particle system with 7 emitter modes (60 FPS, 0 GC) | M1 | survey_visuals |
| 22 | Prefers-Reduced-Motion Overrides | Motion-reduced fallbacks suppressing vertigo swoops and strobes | M1 | survey_visuals, survey_a11y |
| 23 | Multi-Modal Input Parity | Pointer Events drag-and-drop, tap-to-connect, and full keyboard navigation matrix | M1 | survey_a11y |
| 24 | High-Contrast Focus & Touch Targets | Minimum 48x48px hit areas, dual-layer focus rings (>10:1 contrast) | M1 | survey_a11y |
| 25 | 5-Dimensional Terminal Dual-Coding | Color + Symbol + Number + Label + Stroke dash (WCAG 1.4.1 compliance) | M1 | survey_a11y |
| 26 | Synthesized Web Audio API | Zero-asset mathematical sound engine for tactile audio-visual cues | M1 | survey_a11y |
| 27 | Dynamic SVG Wire Tracking | ResizeObserver updating Bézier cable coordinates on viewport change | M1 | survey_spec, survey_a11y |
| 28 | Screen Reader ARIA Live Regions | Dual polite/assertive live regions with verbatim status announcements | M1 | survey_a11y |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| **TEST** | **E2E Testing Track** | Independent opaque-box test suite (Tiers 1-4) creating `TEST_INFRA.md` & `TEST_READY.md` | None | DONE |
| **M1** | **Full Product Implementation** | Build complete, playable game in `index.html`, `style.css`, and `script.js` implementing all 28 features from survey blueprints | None | IN_PROGRESS |
| **M2** | **Final Milestone: E2E Pass, Hardening & Audit** | Pass 100% E2E test suite (Tiers 1-4), adversarial test coverage hardening (Tier 5), forensic integrity audit (`teamwork_auditor`), zero console errors | TEST, M1 | PLANNED |

---

## Interface Contracts

### GameState ↔ View Controllers
```javascript
GameState = {
  currentPhase: 1, // 1 to 8
  antManScale: 1.0, // 1.0 to 0.04
  p4: {
    wires: [{ id, color, symbol, number, label, strokeDash, connected }],
    selectedSource: null,
    connectedCount: 0,
    stabilized: false
  },
  p5: {
    conduits: [{ id, color, symbol, number, label, safeMin, safeMax, connected }],
    currentProgress: 0.5, // 0.0 to 1.0
    selectedSource: null,
    connectedCount: 0,
    stabilized: false
  },
  transitionTo(nextPhase): Boolean,
  resetGame(): Void
}
```

### WirePuzzle ↔ SVG Renderer
```javascript
WireRenderer = {
  updateWirePath(pathElement, x1, y1, x2, y2): Void,
  recalculateAllWires(): Void, // Called on resize / orientation change
  lockWire(wireId, sourceElem, targetElem): Void
}
```

### TimingMechanic ↔ Gauge View
```javascript
TimingMechanic = {
  start(): Void,
  stop(): Void,
  checkHit(conduitId): Boolean, // Returns true if indicator within safe window
  getCurrentPosition(): Number // 0.0 to 1.0
}
```

---

## Code Layout
Strictly three files in the root workspace:
- `c:\Users\sriva\parllel3\index.html`: Semantic HTML5 markup, SVG defs, 6-plane stage, UI containers, ARIA live regions.
- `c:\Users\sriva\parllel3\style.css`: Modern CSS3 custom properties, 2.5D perspective/preserve-3d rules, keyframe animations, high-contrast accessible styles, focus rings, responsive breakpoints, reduced-motion media query.
- `c:\Users\sriva\parllel3\script.js`: Clean modular Vanilla JavaScript containing `GameConfig`, `GameState`, `AudioSynth`, `ParticleEngine`, `AntManView`, `WirePuzzle`, `TimingMechanic`, `A11yManager`, and `UIManager`.

Test Infrastructure:
- `c:\Users\sriva\parllel3\test\e2e_runner.html`: In-browser automated E2E test runner executing Tiers 1-4 tests against `index.html` via iframe or direct harness.
- `c:\Users\sriva\parllel3\test\e2e_suite.js`: Opaque-box requirement-driven test assertions covering all 28 features, boundaries, timing, and edge cases.
- `c:\Users\sriva\parllel3\TEST_INFRA.md`: Test architecture, methodology, and tier coverage definitions.
- `c:\Users\sriva\parllel3\TEST_READY.md`: Signal file published upon test suite completion.
