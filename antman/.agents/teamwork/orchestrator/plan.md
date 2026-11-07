# Orchestration Plan: Ant-Man Nano-Repair 2.5D Game

## Objective
Build a complete, responsive, highly polished 2.5D Ant-Man nano-repair game with HTML5, CSS3, and Vanilla JavaScript across an 8-phase sequence adhering strictly to R1-R4 and all acceptance criteria.

## Strategy & Phases
1. **Phase 0: Survey & Specification**
   - Dispatch 3 Explorers in parallel (or Spec Miners/Explorers) to explore:
     - Explorer 1: 8-Phase state machine, interactions, transitions, and timing mechanics.
     - Explorer 2: 2.5D visual design, CSS perspective, layers, particles, animations, responsive layout.
     - Explorer 3: Accessibility (keyboard, focus, symbols/contrast), touch support, sound visual feedback, clean Vanilla JS architecture.
   - Synthesize findings into `PROJECT.md` (Features, Milestones, Contracts, Code Layout).

2. **Phase 1: Dual Track Launch**
   - **E2E Testing Track**: Build comprehensive opaque-box test runner / suites covering all 4 Tiers.
   - **Implementation Track**: Decompose into modular milestones:
     - M1: Core Engine, 2.5D Scene Architecture, Deterministic State Machine (Phases 1-8 routing), HUD/Controls.
     - M2: Visual Assets, Particle Engine, Ant-Man SVG/CSS Character, Lab & Microscopic Backgrounds, Scale Transitions (Phase 1, 2, 3, 7, 8).
     - M3: Puzzle Mechanics & Accessibility (Phase 4 4-wire color/symbol match, Phase 5 timed current match, Phase 6 placeholder bypass).
     - M4: Integration, Full E2E Test Suite Validation, and Adversarial Hardening.

3. **Phase 2: Final Verification & Audit**
   - E2E Test Execution (100% pass across Tiers 1-4).
   - Adversarial Coverage Hardening (Tier 5).
   - Forensic Integrity Audit (`teamwork_auditor`).
   - Final report to caller/Sentinel.
