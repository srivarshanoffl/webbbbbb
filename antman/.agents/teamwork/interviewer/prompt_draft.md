A polished, playable 2.5D Ant-Man nano-repair game created as a showcase piece using only HTML, CSS, and Vanilla JavaScript. Ant-Man shrinks to enter and repair a malfunctioning nanotechnology machine across an eight-phase interactive sequence.

Working directory: c:\Users\sriva\parllel3
Integrity mode: development

## Requirements

### R1. Tech Stack and Project Architecture
Build the game using only `index.html`, `style.css`, and `script.js`. Do not use frameworks, libraries, game engines, TypeScript, or external build tools. External asset files (such as images, sprite sheets, or audio clips) may be referenced where needed alongside code-generated graphics and styles.

### R2. Cinematic 2.5D Visuals and Scale Transitions
Create a cinematic 2.5D look using layered HTML/CSS elements, perspective, lighting, shadows, parallax, and animation. Provide cinematic scale transitions for Ant-Man shrinking (Phase 2, with a working skip option) and growing back to normal size (Phase 8), establishing clear scale differences between Ant-Man and the surrounding machine without abrupt character image replacement. Respect user reduced-motion preferences.

### R3. Eight-Phase Game Flow and Deterministic State Management
Implement a deterministic game-state model managing the complete eight-phase sequence:
- Phase 1 (Machine Malfunction): Laboratory scene showing Ant-Man beside a malfunctioning machine with flashing warning lights, sparks, readable status ("NANOTECH SYSTEM FAILURE DETECTED / MANUAL REPAIR REQUIRED"), and a "Begin Repair" button.
- Phase 2 (Shrinking Sequence): Suit activation with pulsing red energy field, particles, changing scale, camera push toward the machine, and a working skip option.
- Phase 3 (Entering the Nano Machine): Microscopic interior environment with oversized circuit structures, glowing traces, layered platforms, floating particles, and objective "Reconnect four matching wire pairs."
- Phase 4 (First 4-Wire Colour-Matching Challenge): Four-pair wiring puzzle with distinct colour and symbol/number/label-coded wire pairs. Support drag-to-connect or terminal click-to-connect. Display selected wire, connection glow, sound-ready visual feedback, progress counter ("X / 4 connected"), individual error retry without resetting completed pairs, and stabilization animation enabling a "Continue" button.
- Phase 5 (Second 4-Wire Challenge with Timing Mechanic): Four-pair matching puzzle with a moving electrical current indicator and readable safe target window. For each connection, the player must activate when the indicator is in the safe zone. A missed window allows retrying that connection without removing completed pairs. Completing all four connections stabilizes the circuit and enables continuation.
- Phase 6 (Debugging Placeholder): Diagnostic interruption screen clearly marked "DEBUGGING CHALLENGE — PLACEHOLDER" with copy explaining the full debugging interaction will be added later, and a prominent, functional "Bypass for Testing" button that directly advances the game state to Phase 7 without fake debugging blockers.
- Phase 7 (Machine Restart): Sequential circuit power-up, warning lights turning off/green, "NANOTECH SYSTEM RESTORED" / "ALL CIRCUITS OPERATIONAL" status, and Continue button.
- Phase 8 (Ant-Man Returns to Normal Size): Reverse-scale growth transition back to the laboratory with particles and energy effects, final victory screen ("MISSION COMPLETED / NANOTECH REPAIRED"), and a "Play Again" button that resets the game state to Phase 1.

### R4. Accessibility, Controls, and Polish
Make the game responsive across desktop and mobile viewports with mouse, touch, and keyboard interaction. Provide large touch targets and visible focus states. Terminal connections must use symbols, numbers, or labels in addition to colours for accessibility. Ensure high text contrast against backgrounds, no dead controls, zero console errors, and clean modular code for future puzzle extension.

## Acceptance Criteria

### Game Flow and State Transitions
- [ ] Phase 1 displays malfunctioning machine with flashing warnings, sparks, readable failure message, and functional "Begin Repair" button.
- [ ] Phase 2 animates Ant-Man shrinking with energy effects and camera zoom, and includes a working Skip button that advances immediately.
- [ ] Phase 3 transitions into the microscopic machine interior with depth layers and displays the wiring objective.
- [ ] Phase 4 provides a 4-wire matching puzzle with distinct colours and accessible labels/symbols; incorrect connections allow retries without resetting completed wires; completing all 4 enables continuation.
- [ ] Phase 5 provides a 4-wire puzzle with an active timing indicator and visible safe target window; incorrect timing allows retry without resetting completed connections; completing all 4 stabilizes the circuit.
- [ ] Phase 6 displays "DEBUGGING CHALLENGE — PLACEHOLDER" and a working "Bypass for Testing" button that advances directly to Phase 7 without fake debugging puzzles.
- [ ] Phase 7 shows circuits powering up in sequence, warning lights clearing, and displays "NANOTECH SYSTEM RESTORED".
- [ ] Phase 8 shows Ant-Man growing back to original size in the lab, displays a completion/victory screen, and provides a "Play Again" button that resets the game to Phase 1.

### Technical and Accessibility Guardrails
- [ ] Implemented strictly using `index.html`, `style.css`, and `script.js` without external frameworks, libraries, game engines, TypeScript, or external build tools.
- [ ] Responsive layout adapts cleanly across desktop and mobile viewports.
- [ ] Supports mouse, touch, and keyboard interactions with visible focus rings and accessible touch targets.
- [ ] Wire puzzle terminals are distinguishable without relying on colour perception alone.
- [ ] Browser console remains free of unhandled errors during a complete playthrough from Phase 1 through Phase 8 replay.
