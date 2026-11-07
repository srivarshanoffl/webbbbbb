# Visual Architecture & 2.5D Rendering Specification
**Ant-Man Nano-Repair Interactive 2.5D Showcase**  
**Role:** explorer_survey_2 (Visual Architecture Explorer)  
**Date:** 2026-11-06  
**Status:** Complete  

---

## 1. Executive Summary & Core Principles

This document specifies the complete visual architecture for the Ant-Man Nano-Repair showcase game. Built exclusively with **pure HTML5, CSS3, and Vanilla JavaScript** (strictly zero external frameworks, engines, or heavy libraries), the visual pipeline delivers a cinematic 2.5D presentation with seamless multi-scale continuity.

### Core Visual Pillars
1. **Mathematical Multi-Scale Continuity:** Rather than swapping between low-resolution and high-resolution raster sprites, Ant-Man is constructed as a **pure SVG/CSS vector asset**. This enables continuous, artifact-free scale transitions from macro laboratory scale (human proportion, 1:1) down to nano-scale (1:1000) with sub-pixel crispness on all displays (Standard, Retina, 4K).
2. **Layered 2.5D CSS Perspective Pipeline:** A hardware-accelerated 3D coordinate system (`perspective: 1000px`, `transform-style: preserve-3d`, `translateZ`) generates genuine spatial parallax across 6 discrete depth planes, dynamic cast shadows, and responsive camera pitching/zooming.
3. **Contrasting Macro Lab vs. Micro Nanotech Aesthetics:** A dramatic stylistic shift between the brushed titanium, amber-alert industrial Hank Pym laboratory (Phase 1, 8) and the hyper-detailed quantum silicon substrate (Phases 3–7), featuring oversized IC dies, golden bond wires, and glowing circuit bus traces.
4. **Unified 60 FPS Particle Engine (Canvas Overlay):** A lightweight 2D Canvas overlay with an object pool (250 recycled particle slots) that handles phase-specific particle effects: laboratory sparks and smoke, red Pym particle implosion/explosion fields, Brownian subatomic dust motes, and cascading emerald power-up waves.
5. **Accessibility & Reduced-Motion First:** Comprehensive `@media (prefers-reduced-motion: reduce)` fallbacks that eliminate vestibular-triggering camera swoops and rapid strobes while maintaining immediate, legible game state clarity.

---

## 2. Layered 2.5D Rendering Pipeline & Camera Rig

### 2.1 Coordinate System & DOM Architecture
The visual engine utilizes a nested container hierarchy separating viewport perspective, camera transformation, 2.5D world layers, dynamic particle effects, and the interactive HUD overlay.

```html
<!-- Main Application Viewport -->
<div id="game-viewport" class="game-viewport" role="region" aria-label="Ant-Man Nano Repair Game">
  
  <!-- 3D Camera Rig: Moves and rotates in 3D space -->
  <div id="camera-rig" class="camera-rig">
    
    <!-- 3D World Stage: Maintains preserve-3d coordinate space -->
    <div id="world-stage" class="world-stage">
      
      <!-- Layer -3: Far Background (Distant lab walls / silicon wafer horizon) [translateZ(-400px)] -->
      <div id="layer-bg-far" class="scene-layer layer-bg-far"></div>
      
      <!-- Layer -2: Mid Background (Heavy machinery / giant capacitors & IC packages) [translateZ(-200px)] -->
      <div id="layer-bg-mid" class="scene-layer layer-bg-mid"></div>
      
      <!-- Layer -1: Ground Surface (Workbench plane / PCB substrate with bus traces) [translateZ(0px)] -->
      <div id="layer-ground" class="scene-layer layer-ground"></div>
      
      <!-- Layer 0: Primary Interactive Stage (Ant-Man, nano-machine exterior, wire consoles) [translateZ(40px)] -->
      <div id="layer-actors" class="scene-layer layer-actors">
        <!-- Ant-Man Character Container -->
        <div id="antman-container" class="antman-container"></div>
        <!-- Machine Exterior (Phase 1/8) or Terminal Console (Phase 4/5) -->
        <div id="machine-exterior" class="machine-exterior"></div>
        <div id="micro-console" class="micro-console"></div>
      </div>
      
      <!-- Layer +1: Volumetric Lighting & Electrical Arcs [translateZ(80px)] -->
      <div id="layer-lighting" class="scene-layer layer-lighting"></div>
      
      <!-- Layer +2: Foreground & Depth-of-Field Bokeh [translateZ(140px)] -->
      <div id="layer-foreground" class="scene-layer layer-foreground"></div>
      
    </div>
  </div>

  <!-- Layer +3: Unified FX Canvas (Particle Engine) -->
  <canvas id="fx-canvas" class="fx-canvas"></canvas>

  <!-- Layer +4: High-Contrast 2D HUD & UI Overlay -->
  <div id="ui-overlay" class="ui-overlay">
    <header id="hud-header" class="hud-header"></header>
    <main id="hud-modal-container" class="hud-modal-container"></main>
    <footer id="hud-footer" class="hud-footer"></footer>
  </div>

</div>
```

### 2.2 Depth Stacking & Parallax Parameters

| Layer Name | Selector | `translateZ` | Base Scale | Purpose / Visual Elements |
|---|---|---|---|---|
| Far Background | `.layer-bg-far` | `-400px` | `1.4` | Lab structural pillars, dim fluorescent lighting, distant silicon wafer horizon |
| Mid Background | `.layer-bg-mid` | `-200px` | `1.2` | Lab diagnostic monitors, giant electrolytic capacitors, heat sinks |
| Ground Plane | `.layer-ground` | `0px` | `1.0` | Brushed steel workbench, micro PCB ground plane, glowing circuit bus traces |
| Primary Actors | `.layer-actors` | `+40px` | `1.0` | Ant-Man vector model, machine chassis, wire puzzle terminals, interactive plugs |
| Lighting/FX | `.layer-lighting` | `+80px` | `1.0` | Plasma glow overlays, laser soldering sparks, Pym energy shockwaves |
| Foreground | `.layer-foreground` | `+140px` | `0.9` | Out-of-focus giant solder balls, drifting subatomic bokeh motes, lens vignette |
| Particle Canvas | `#fx-canvas` | Fixed 2D | Screen | 60 FPS canvas particle simulations (sparks, Pym vortex, dust, emerald wave) |
| UI Overlay | `#ui-overlay` | Fixed 2D | Screen | Mission status HUD, buttons, wire counters, bypass dialogs, victory screen |

### 2.3 Camera Transform Math Across Phases
Camera movements are applied to `#camera-rig` using hardware-accelerated 3D matrix transforms:

```css
/* Base Camera Rig */
.camera-rig {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  will-change: transform;
  transition: transform 1.2s cubic-bezier(0.22, 1, 0.36, 1);
}

/* Phase 1: Macro Lab Overview (Slight downward angle) */
.camera-rig[data-camera="phase-1"] {
  transform: translate3d(0, 0, 0) rotateX(4deg) rotateY(0deg);
}

/* Phase 2: Cinematic Shrinking Push toward machine intake port */
.camera-rig[data-camera="phase-2-push"] {
  transform: translate3d(-120px, -40px, 620px) rotateX(10deg) rotateY(-6deg);
  transition: transform 2.8s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Phase 3: Microscopic World Entry (Settling on PCB platform) */
.camera-rig[data-camera="phase-3"] {
  transform: translate3d(0, 10px, 40px) rotateX(12deg) rotateY(0deg);
  transition: transform 1.0s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Phases 4 & 5: Puzzle Playfield (Optimal top-down 2.5D tilt for wire connection) */
.camera-rig[data-camera="puzzle-focus"] {
  transform: translate3d(0, 20px, 100px) rotateX(16deg) rotateY(0deg);
  transition: transform 0.6s ease-out;
}

/* Phase 6: Diagnostic Interruption (HUD Glitch & slight camera recoil) */
.camera-rig[data-camera="diagnostic"] {
  transform: translate3d(0, 15px, 80px) rotateX(14deg) rotateY(2deg);
}

/* Phase 7: Circuit Power-Up Sweep (Gentle panoramic tilt) */
.camera-rig[data-camera="power-sweep"] {
  transform: translate3d(0, -10px, 60px) rotateX(8deg) rotateY(0deg);
  transition: transform 1.8s ease-in-out;
}

/* Phase 8: Growth Sequence & Victory Return */
.camera-rig[data-camera="phase-8-growth"] {
  transform: translate3d(0, 0, 0) rotateX(4deg) rotateY(0deg);
  transition: transform 2.4s cubic-bezier(0.25, 1, 0.5, 1);
}
```

### 2.4 Dynamic Shadows & Depth Lighting
1. **Dynamic Character Contact Shadow:** Ant-Man projects an elliptical shadow onto `#layer-ground`. In CSS:
   ```css
   .antman-shadow {
     position: absolute;
     bottom: -6px;
     left: 50%;
     transform: translateX(-50%);
     width: 80px;
     height: 18px;
     background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0) 70%);
     border-radius: 50%;
     pointer-events: none;
     transition: transform 0.3s ease, width 0.3s ease, opacity 0.3s ease;
   }
   ```
   During shrinking, `.antman-shadow` scales down synchronously with the character down to `width: 6px; height: 2px`, with opacity tightening to maintain physical contact grounding.
2. **Ambient Occlusion & Vignette:** The viewport features a radial gradient vignette overlay:
   ```css
   .game-viewport::after {
     content: '';
     position: absolute;
     inset: 0;
     background: radial-gradient(circle at 50% 50%, transparent 55%, rgba(2, 6, 18, 0.85) 100%);
     pointer-events: none;
     z-index: 5;
   }
   ```

---

## 3. Ant-Man Character Asset: Pure Scalable SVG/CSS

### 3.1 Design Specifications
To prevent image swapping, blurriness, or pixelation, Ant-Man is rendered as an inline, highly detailed SVG vector asset. 

- **Internal ViewBox:** `0 0 100 160` (width 100, height 160 units).
- **Macro Human Size (Phase 1 & 8):** Rendered at `160px × 256px`.
- **Nano Size (Phase 3–7):** Rendered at `40px × 64px` inside the nano-machine environment.
- **Shrinking Transition (Phase 2):** CSS `transform: scale(...)` seamlessly scales the SVG from `1.0` down to `0.05` while maintaining vector sharpness.

### 3.2 Detailed SVG Anatomy & Structure
The vector representation features:
- **Helmet:** Polished titanium/chrome casing (`#d0d5dd`, `#98a2b3`), gunmetal jaw/rebreather plates (`#1d2939`, `#344054`), twin side antennas, and glowing red dual visors (`#ff1744`) with SVG gaussian blur filter glow.
- **Chest & Harness:** Charcoal carbon-fiber weave texture (`#111827`, `#1f2937`), reinforced crimson Pym-Tech armor plates (`#e53935`, `#b71c1c`), and the central circular Pym Regulator Core with animated concentric energy rings.
- **Limbs & Gauntlets:** Segmented armor plates, red piping along muscles, and silver wrist gauntlets housing the shrink activation trigger button.

```html
<!-- Scalable Ant-Man SVG Definition -->
<svg id="antman-svg" class="antman-svg" viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg" aria-label="Ant-Man character">
  <defs>
    <!-- Visor Glow Filter -->
    <filter id="visor-glow-filter" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- Metallic Shading Gradients -->
    <linearGradient id="metal-silver" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc" />
      <stop offset="45%" stop-color="#cbd5e1" />
      <stop offset="100%" stop-color="#64748b" />
    </linearGradient>

    <linearGradient id="armor-charcoal" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#334155" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>

    <linearGradient id="pym-red" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff334b" />
      <stop offset="50%" stop-color="#dc2626" />
      <stop offset="100%" stop-color="#991b1b" />
    </linearGradient>

    <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="40%" stop-color="#ff1744" />
      <stop offset="100%" stop-color="#7f1d1d" />
    </radialGradient>
  </defs>

  <!-- Dynamic Ground Contact Shadow -->
  <ellipse id="svg-floor-shadow" cx="50" cy="155" rx="35" ry="5" fill="rgba(0,0,0,0.6)" />

  <!-- Legs & Boots -->
  <g id="antman-legs">
    <!-- Left Leg -->
    <path d="M 36 94 L 30 135 L 24 150 L 36 152 L 40 148 L 42 135 L 43 94 Z" fill="url(#armor-charcoal)" />
    <path d="M 33 112 L 31 138 L 26 149 L 36 151 L 38 138 Z" fill="url(#metal-silver)" />
    <path d="M 35 96 L 36 130" stroke="url(#pym-red)" stroke-width="2" stroke-linecap="round" />
    <!-- Right Leg -->
    <path d="M 64 94 L 70 135 L 76 150 L 64 152 L 60 148 L 58 135 L 57 94 Z" fill="url(#armor-charcoal)" />
    <path d="M 67 112 L 69 138 L 74 149 L 64 151 L 62 138 Z" fill="url(#metal-silver)" />
    <path d="M 65 96 L 64 130" stroke="url(#pym-red)" stroke-width="2" stroke-linecap="round" />
    <!-- Belt with Pym Regulator Discs -->
    <rect x="34" y="90" width="32" height="6" rx="2" fill="#1e293b" stroke="#475569" stroke-width="1" />
    <circle cx="50" cy="93" r="4" fill="url(#metal-silver)" />
    <circle cx="39" cy="93" r="2.5" fill="url(#pym-red)" />
    <circle cx="61" cy="93" r="2.5" fill="url(#pym-red)" />
  </g>

  <!-- Torso & Arms -->
  <g id="antman-torso">
    <!-- Under-suit Torso -->
    <path d="M 32 48 L 68 48 L 65 92 L 35 92 Z" fill="url(#armor-charcoal)" />
    <!-- Red Chest Armor Plates (Pym harness) -->
    <path d="M 35 48 L 46 48 L 44 86 L 37 86 Z" fill="url(#pym-red)" />
    <path d="M 65 48 L 54 48 L 56 86 L 63 86 Z" fill="url(#pym-red)" />
    <path d="M 44 54 L 56 54 L 52 74 L 48 74 Z" fill="#0f172a" />
    <!-- Pym Particle Chest Core (Luminescent) -->
    <circle class="pym-core-disc" cx="50" cy="65" r="7" fill="url(#metal-silver)" />
    <circle class="pym-core-lens" cx="50" cy="65" r="4.5" fill="url(#core-glow)" filter="url(#visor-glow-filter)" />
    
    <!-- Left Arm -->
    <g id="arm-left">
      <path d="M 32 50 L 22 75 L 20 98 L 26 98 L 30 78 L 34 56 Z" fill="url(#armor-charcoal)" />
      <!-- Silver Shoulder Pauldron -->
      <path d="M 33 48 L 22 52 L 20 62 L 32 58 Z" fill="url(#metal-silver)" />
      <!-- Wrist Gauntlet & Trigger -->
      <rect x="18" y="88" width="9" height="12" rx="2" fill="url(#metal-silver)" />
      <circle class="wrist-trigger" cx="22" cy="94" r="2" fill="url(#pym-red)" />
      <path d="M 19 99 L 21 106 L 26 106 L 27 99 Z" fill="#334155" />
    </g>
    <!-- Right Arm -->
    <g id="arm-right">
      <path d="M 68 50 L 78 75 L 80 98 L 74 98 L 70 78 L 66 56 Z" fill="url(#armor-charcoal)" />
      <!-- Silver Shoulder Pauldron -->
      <path d="M 67 48 L 78 52 L 80 62 L 68 58 Z" fill="url(#metal-silver)" />
      <!-- Wrist Gauntlet -->
      <rect x="73" y="88" width="9" height="12" rx="2" fill="url(#metal-silver)" />
      <path d="M 81 99 L 79 106 L 74 106 L 73 99 Z" fill="#334155" />
    </g>
  </g>

  <!-- Helmet & Glowing Visors -->
  <g id="antman-helmet">
    <!-- Antennas -->
    <line x1="38" y1="20" x2="30" y2="4" stroke="url(#metal-silver)" stroke-width="2" stroke-linecap="round" />
    <circle cx="30" cy="4" r="2" fill="url(#pym-red)" />
    <line x1="62" y1="20" x2="70" y2="4" stroke="url(#metal-silver)" stroke-width="2" stroke-linecap="round" />
    <circle cx="70" cy="4" r="2" fill="url(#pym-red)" />
    
    <!-- Helmet Main Dome -->
    <path d="M 33 26 C 33 12, 67 12, 67 26 C 70 32, 69 44, 65 48 C 61 52, 39 52, 35 48 C 31 44, 30 32, 33 26 Z" fill="url(#metal-silver)" stroke="#475569" stroke-width="0.8" />
    <!-- Brow & Cheek Carbon Insets -->
    <path d="M 36 28 L 64 28 L 61 34 L 39 34 Z" fill="#0f172a" />
    <path d="M 34 38 L 40 46 L 36 48 Z" fill="url(#armor-charcoal)" />
    <path d="M 66 38 L 60 46 L 64 48 Z" fill="url(#armor-charcoal)" />
    
    <!-- Iconic Red Visor Eyes -->
    <g class="antman-visor" filter="url(#visor-glow-filter)">
      <!-- Left Eye -->
      <path d="M 38 31 L 47 31 L 46 36 L 39 36 Z" fill="#ff1744" />
      <path d="M 39 32 L 46 32" stroke="#ffffff" stroke-width="0.8" stroke-linecap="round" />
      <!-- Right Eye -->
      <path d="M 53 31 L 62 31 L 61 36 L 54 36 Z" fill="#ff1744" />
      <path d="M 54 32 L 61 32" stroke="#ffffff" stroke-width="0.8" stroke-linecap="round" />
    </g>

    <!-- Mouth Rebreather & Exhaust Filters -->
    <path d="M 44 42 L 56 42 L 54 50 L 46 50 Z" fill="#1e293b" />
    <rect x="46" y="44" width="8" height="2" fill="url(#metal-silver)" />
    <circle cx="42" cy="46" r="2" fill="url(#metal-silver)" />
    <circle cx="58" cy="46" r="2" fill="url(#metal-silver)" />
  </g>
</svg>
```

### 3.3 CSS Animation States for Ant-Man
```css
/* Container Wrapper for Positioning & Scaling */
.antman-container {
  position: absolute;
  bottom: 80px;
  left: 20%;
  width: 150px;
  height: 240px;
  transform-origin: 50% 95%; /* Shrinks towards feet contact point */
  will-change: transform, filter;
  z-index: 10;
}

/* Idle Breathing & Core Pulse */
.antman-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
  animation: antman-idle-sway 4s ease-in-out infinite;
}

@keyframes antman-idle-sway {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

.antman-visor, .pym-core-lens {
  animation: visor-pulse 3s ease-in-out infinite alternate;
}

@keyframes visor-pulse {
  0% {
    filter: drop-shadow(0 0 2px #ff1744) brightness(1.0);
  }
  100% {
    filter: drop-shadow(0 0 8px #ff1744) brightness(1.4);
  }
}

/* Phase 2: Shrink Animation Keyframes */
@keyframes antman-shrink-implosion {
  0% {
    transform: scale(1.0) translateY(0);
    filter: brightness(1.0);
  }
  20% {
    /* Arm raises to trigger wrist button, energy charges */
    transform: scale(1.05) translateY(-5px);
    filter: brightness(2.0) drop-shadow(0 0 20px #ff1744);
  }
  40% {
    transform: scale(0.6) translateY(20px);
    filter: brightness(3.0) drop-shadow(0 0 35px #ff1744);
  }
  80% {
    transform: scale(0.12) translateY(50px);
    filter: brightness(4.0) drop-shadow(0 0 15px #ff1744);
    opacity: 1;
  }
  100% {
    transform: scale(0.04) translateY(65px);
    filter: brightness(5.0);
    opacity: 0.9;
  }
}

/* Phase 8: Growth Sequence Keyframes */
@keyframes antman-grow-explosion {
  0% {
    transform: scale(0.04) translateY(65px);
    filter: brightness(4.0) drop-shadow(0 0 10px #ff1744);
    opacity: 0.8;
  }
  40% {
    transform: scale(0.4) translateY(35px);
    filter: brightness(2.8) drop-shadow(0 0 40px #ff1744);
    opacity: 1;
  }
  85% {
    transform: scale(1.08) translateY(-8px);
    filter: brightness(1.4) drop-shadow(0 0 20px #ff1744);
  }
  100% {
    transform: scale(1.0) translateY(0);
    filter: brightness(1.0) drop-shadow(0 0 0 transparent);
  }
}
```

---

## 4. Nano Machine Exterior vs. Microscopic Interior Aesthetics

### 4.1 Macro Laboratory Environment (Phase 1 & Phase 8)
- **Mood & Atmosphere:** Serious, cutting-edge R&D facility in distress. Dim ambient lighting with stark fluorescent workbench illumination, contrasting against harsh red hazard alarms.
- **Palette (CSS Variables):**
  - `--lab-bg`: `#080d16` (Deep slate navy)
  - `--bench-metal`: `#1e293b` (Brushed titanium surface)
  - `--bench-bevel`: `#334155` (Metallic chamfered edge)
  - `--alarm-red`: `#ef4444` (Flashing beacon red)
  - `--warning-amber`: `#f59e0b` (Hazard stripe amber)
  - `--hud-text-cyan`: `#38bdf8` (Lab diagnostic telemetry text)
- **Nano Machine Exterior Chassis:**
  - A heavy industrial hexagonal casing (`width: 320px; height: 380px`) mounted on the workbench right side.
  - Circular quantum entry aperture at center with glowing iris shutter rings (`border: 4px solid #475569; box-shadow: inset 0 0 25px rgba(239, 68, 68, 0.5)`).
  - Malfunction status CRT display panel:
    ```css
    .crt-screen {
      background: #020617;
      border: 2px solid #ef4444;
      box-shadow: 0 0 15px rgba(239, 68, 68, 0.4), inset 0 0 10px rgba(239, 68, 68, 0.3);
      padding: 12px;
      font-family: 'Courier New', Courier, monospace;
      color: #ef4444;
      text-transform: uppercase;
      letter-spacing: 1px;
      background-image: repeating-linear-gradient(0deg, rgba(0,0,0,0.3), rgba(0,0,0,0.3) 2px, transparent 2px, transparent 4px);
    }
    ```
  - Flashing alarm beacon lamps on chassis corners pulsing at `0.8s` frequency.
  - Physical spark discharge point above the intake port discharging yellow sparks.

### 4.2 Microscopic Interior Environment (Phases 3–7)
- **Mood & Atmosphere:** Deep quantum scale reality. Silicon structures appear like monolithic cybernetic cities. The dark navy substrate is alive with glowing energy highways and floating subatomic particles.
- **Micro Palette (CSS Variables):**
  - `--micro-bg`: `#010409` (Subatomic void)
  - `--pcb-substrate`: `#031322` (Dark cyan-black silicon die)
  - `--trace-inactive`: `#1e293b` (Unpowered cold copper bus)
  - `--trace-active`: `#00d2ff` (High-frequency data pulse cyan)
  - `--trace-power`: `#10b981` (Restored stabilized emerald green)
  - `--chip-monolith`: `#090e17` (Silicon IC chip body)
  - `--gold-bond`: `#fbbf24` (Microscopic gold wire arcs)
- **Oversized Silicon IC Packages:**
  - Towering black monolithic chip packages flanking the background (`translateZ(-200px)`), with laser-etched markings: `PYM-QUANTUM-Q88` and `CORE-LOGIC-01`.
  - Realistic gold bond wires arching from chip dies down to the substrate using curved SVG paths with gold gradient stroke.
- **Glowing Circuit Bus Traces (CSS Shader/Gradient Effect):**
  - The floor plane features multi-channel bus traces. In CSS, animated linear gradients create continuous pulses of high-speed electron flow:
  ```css
  .circuit-bus-trace {
    position: absolute;
    height: 4px;
    background: #0f172a;
    border-radius: 2px;
    overflow: hidden;
  }
  
  .circuit-bus-trace::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, var(--trace-active), transparent);
    transform: translateX(-100%);
    animation: trace-pulse-flow 2s linear infinite;
  }

  @keyframes trace-pulse-flow {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
  }
  ```

---

## 5. Particle Systems Architecture (Canvas & DOM Hybrid)

To achieve high visual density without triggering DOM garbage collection stutters, particle simulations are handled by a **unified 2D Canvas engine (`#fx-canvas`)** operating an **Object Pool of 250 pre-allocated particles**.

```
                +---------------------------------------+
                |         Unified Canvas Engine         |
                |   (#fx-canvas, width=100%, height=100%)|
                +---------------------------------------+
                                    |
          +-------------------------+-------------------------+
          |                         |                         |
+-------------------+     +-------------------+     +-------------------+
|  Particle Pool    |     | Phase Controller  |     |  Render Loop      |
|  250 Pre-allocated|     | Switches Emitter  |     |  requestAnimation |
|  Particle Objects |     | Behaviors 1-8     |     |  Frame (60 FPS)   |
+-------------------+     +-------------------+     +-------------------+
```

### 5.1 Particle Modes Across Game Phases

| Phase | Mode Identifier | Particle Behavior & Physics | Visual Characteristics | Target Count |
|---|---|---|---|---|
| **Phase 1** | `MODE_LAB_MALFUNCTION` | Erupted from machine exhaust port. High initial velocity, gravity pull (`g = +0.25`), bounce dampening on bench plane. Accompanied by slow expanding smoke puffs (`vy = -0.6`). | Sparks: Bright white-yellow `#fef08a` and orange `#f97316`, radius 1–3px. Smoke: Translucent slate `#64748b`, alpha 0.15 → 0. | 40 sparks, 15 smoke puffs |
| **Phase 2** | `MODE_PYM_IMPLOSION` | Spawned on a circular perimeter (radius 180px around Ant-Man). Inward radial acceleration toward Ant-Man's center of mass with spiral tangential velocity. Expanding shockwave ring overlays. | Radiant ruby red `#ff1744`, crimson `#dc2626`, and core white `#ffffff`. Streaks with velocity stretch. | 120 particles |
| **Phase 3–6** | `MODE_MICRO_AMBIENT` | Brownian motion / fluid drift. Low velocity (`vx, vy ~ ±0.2`), sinusoidal oscillation, alpha pulsation to simulate depth of field (larger particles blurred, smaller sharp). | Quantum motes: Cyan `#38bdf8`, electric blue `#60a5fa`, and soft amber `#fef08a`. Alpha 0.2 to 0.7. | 70 floating motes |
| **Phase 4** | `MODE_WIRE_SNAP` | Burst emitter triggered on valid wire terminal connection. Radial blast of 20 high-speed sparks. | Matching wire color (Red, Blue, Amber, or Green) with white-hot core. | 20 per connection |
| **Phase 5** | `MODE_TIMING_SPARK` | Continuous spark trail emitted from the moving electrical charge cursor. On successful hit: bright plasma burst. On miss: red fizzle arc with rapid decay. | Hit: Electric violet `#c084fc` & cyan `#22d3ee`. Miss: Glitch crimson `#ef4444`. | 30 continuous |
| **Phase 7** | `MODE_POWER_SURGE` | Cascading waves of luminescent emerald energy motes rising upward from newly stabilized circuit terminals. | Emerald green `#10b981`, mint `#6ee7b7`, golden telemetry `#fcd34d`. Upward buoyancy. | 80 rising motes |
| **Phase 8** | `MODE_PYM_EXPANSION` | Explosive outward radial blast expanding from nano Ant-Man outwards as he grows back to macro scale, followed by celebratory golden motes. | Ruby red `#ff1744` expanding shockwaves transitioning to golden victory motes. | 150 particles |

### 5.2 Particle Pool Implementation Architecture
```javascript
// Lightweight, GC-free Particle Pool Class Structure
class ParticlePool {
  constructor(maxParticles = 250) {
    this.pool = new Array(maxParticles);
    for (let i = 0; i < maxParticles; i++) {
      this.pool[i] = {
        active: false,
        x: 0, y: 0,
        vx: 0, vy: 0,
        size: 2,
        color: '#ff1744',
        alpha: 1.0,
        decay: 0.02,
        gravity: 0,
        type: 'spark' // 'spark', 'smoke', 'mote', 'wave'
      };
    }
  }

  spawn(x, y, vx, vy, size, color, decay, gravity = 0, type = 'spark') {
    for (let i = 0; i < this.pool.length; i++) {
      const p = this.pool[i];
      if (!p.active) {
        p.active = true;
        p.x = x; p.y = y;
        p.vx = vx; p.vy = vy;
        p.size = size;
        p.color = color;
        p.alpha = 1.0;
        p.decay = decay;
        p.gravity = gravity;
        p.type = type;
        return p;
      }
    }
    return null; // Pool full, gracefully omit rather than allocate
  }

  updateAndDraw(ctx, width, height) {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < this.pool.length; i++) {
      const p = this.pool[i];
      if (!p.active) continue;

      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.alpha -= p.decay;

      if (p.alpha <= 0 || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
        p.active = false;
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;

      if (p.type === 'spark') {
        // Draw elongated spark in direction of velocity
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'smoke') {
        p.size += 0.2; // Smoke expands
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'mote') {
        // Soft glowing quantum dust
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}
```

---

## 6. Cinematic Transitions Choreography

### 6.1 Phase 1 → Phase 2 (Suit Activation & Shrink Sequence)
- **Duration:** 3.2 seconds (with instant, working `Skip [Space]` button available at any millisecond).
- **Choreography Sequence:**
  1. **t = 0.0s:** Player clicks "Begin Repair". Laboratory warning lights redouble. The HUD slides down into cinematic mode.
  2. **t = 0.3s:** Ant-Man's wrist trigger illuminates; his hand taps the gauntlet button. The central Pym regulator core flares from dark red to radiant white-hot ruby (`filter: brightness(3.0)`).
  3. **t = 0.8s:** Crimson Pym particle vortex ignites on the canvas (`MODE_PYM_IMPLOSION`), with energy motes spiraling inward into Ant-Man.
  4. **t = 1.2s:** Camera rig executes smooth push-and-pitch:
     ```css
     transform: translate3d(-140px, -50px, 620px) rotateX(10deg) rotateY(-6deg);
     ```
     Concurrently, Ant-Man scales down along his contact point from `scale(1.0)` to `scale(0.04)`.
  5. **t = 2.8s:** Ant-Man passes into the machine's quantum entry iris. A radial red light flash covers the viewport (`opacity: 1` flash overlay).
  6. **t = 3.2s:** Camera coordinates snap to the micro-world (`Phase 3`).
- **Skip Button Guarantee:** A fixed-position, high-contrast button labeled `SKIP SEQUENCE [Space]` is active on screen. If pressed, it cancels the active CSS transitions, stops the canvas vortex, clears camera transforms, and calls the Phase 3 initializer within `< 50ms`.

### 6.2 Phase 2 → Phase 3 (Entering the Nano Machine)
- **Duration:** 1.2 seconds.
- **Choreography Sequence:**
  1. **t = 0.0s:** Red flash overlay dissolves (`opacity: 1 → 0` over 300ms).
  2. **t = 0.2s:** Microscopic PCB landscape resolves into view with 3D parallax depth layers settling into position (`translateZ` settling from deep negative space).
  3. **t = 0.5s:** Nano Ant-Man (rendered at `40px × 64px`) lands on the central silicon platform with a subtle red shockwave ring.
  4. **t = 0.8s:** Objective banner animates into the top HUD with high-contrast cybernetic styling:
     `OBJECTIVE: RECONNECT FOUR MATCHING WIRE PAIRS`

### 6.3 Phases 4 & 5 (Wire Challenges & Dynamic Visual Feedback)
- **Interactive Wire Bezier Curves:**
  Connecting wires are rendered via dynamic SVG paths:
  ```html
  <svg id="wires-svg-layer" class="wires-svg-layer">
    <!-- Active dragging wire follows cursor/touch -->
    <path id="active-wire-path" d="M 120 80 C 180 80, 200 160, 260 160" stroke="#00d2ff" stroke-width="6" stroke-linecap="round" fill="none" />
  </svg>
  ```
  The control points `(cx1, cy1)` and `(cx2, cy2)` calculate dynamically to give the wire realistic cable tension and natural gravitational droop.
- **Terminal Socket Visual Feedback:**
  - Inactive: Dark recessed ring with colored LED rim and glowing symbol.
  - Hover/Selected: Glowing neon halo (`box-shadow: 0 0 15px currentColor`) and subtle scale-up (`scale(1.08)`).
  - Valid Connection Snap: Immediate particle burst (`MODE_WIRE_SNAP`), terminal socket turns solid illuminated color, wire locks into position with high-contrast braided texture, and counter updates (`"1 / 4 CONNECTED"`).
  - Invalid Connection: Wire snaps back with red warning vibration shake (`@keyframes error-shake`) and error audio-visual chime, **without resetting any previously connected wires**.
- **Phase 5 Moving Current Indicator:**
  - A glowing high-frequency electrical charge packet slides along the horizontal conduit track (`animation: timing-sweep 2.4s ease-in-out infinite alternate`).
  - Safe target window is marked by bright neon brackets with dual indicators (green target crosshairs + text label `"SAFE SYNC ZONE"`).
  - Connecting outside the safe zone triggers a yellow warning spark dissipation, keeping completed wires intact and immediately allowing retry.

### 6.4 Phase 6 (Diagnostic Interruption Screen)
- **Aesthetic:** High-contrast cybernetic diagnostic interruption.
- **Visuals:**
  - Subtle digital CRT scanlines sweep over the micro-stage.
  - Prominent diagnostic window with amber warning header:
    `DEBUGGING CHALLENGE — PLACEHOLDER`
  - Explanatory copy: `"Sub-circuit diagnostic routines in development. Manual bypass authorized for nanotech field testing."`
  - Highly visible, pulsating cyan button: `BYPASS FOR TESTING [Enter]`. Clicking this immediately advances the deterministic state machine to Phase 7.

### 6.5 Phase 7 (Sequential Circuit Power-Up Wave)
- **Wavefront Propagation:**
  - Node 1 (Alpha - Red): t = 0ms (turns emerald green `#10b981`)
  - Node 2 (Beta - Blue): t = 300ms
  - Node 3 (Gamma - Amber): t = 600ms
  - Node 4 (Delta - Green): t = 900ms
  - Main Conduit Bus: t = 1200ms (entire board bus trace grid flares to life with flowing green pulses)
- Malfunctioning red warning strobes deactivate and turn to steady green telemetry indicators.
- System HUD status updates with glowing typography:
  `NANOTECH SYSTEM RESTORED / ALL CIRCUITS OPERATIONAL`
- Functional button illuminates: `EXIT NANO MACHINE & RESTORE SIZE [Enter]`.

### 6.6 Phase 8 (Reverse Growth Expansion & Victory Screen)
- **Duration:** 2.8 seconds.
- **Choreography Sequence:**
  1. **t = 0.0s:** Player clicks "Exit Nano Machine". Ant-Man's Pym core flares to high intensity.
  2. **t = 0.4s:** Outward Pym particle explosion (`MODE_PYM_EXPANSION`) generates expanding ruby shockwaves.
  3. **t = 0.8s:** Camera executes reverse zoom; micro-world crossfades out as laboratory workbench crossfades in.
  4. **t = 1.6s:** Ant-Man expands from `scale(0.04)` to `scale(1.0)` with an authoritative floor contact impact ring on the workbench.
  5. **t = 2.0s:** Machine exterior beside Ant-Man displays steady green telemetry and operational indicator lights.
  6. **t = 2.4s:** Victory modal animates into view:
     - Header: `MISSION COMPLETED / NANOTECH REPAIRED`
     - Telemetry Summary: 8/8 Circuit Terminals Restored, Machine Fully Stabilized.
     - Action: Prominent `PLAY AGAIN [Enter]` button that cleanly resets the state machine back to Phase 1.

---

## 7. Accessibility & `prefers-reduced-motion` Architecture

To guarantee full compliance with WCAG 2.2 Level AAA (Guideline 2.3.3 Animation from Interactions) and respect users' vestibular sensitivities, all visual motion effects are governed by `prefers-reduced-motion`.

```css
/* ==========================================================================
   Reduced Motion Accessibility Overrides
   ========================================================================== */
@media (prefers-reduced-motion: reduce) {
  
  /* 1. Eliminate 3D camera swoops, zooms, and perspective rotations */
  .camera-rig {
    transition: none !important;
    transform: none !important;
  }

  /* 2. Replace multi-second continuous scaling with instant opacity crossfades */
  .antman-container {
    animation: none !important;
    transition: opacity 0.25s ease !important;
  }

  .antman-svg {
    animation: none !important;
  }

  .antman-visor, .pym-core-lens {
    animation: none !important;
    filter: drop-shadow(0 0 4px #ff1744) !important;
  }

  /* 3. Disable particle engine animations to prevent visual noise / distraction */
  .fx-canvas {
    opacity: 0.15 !important; /* Low static ambient or hide completely */
  }

  /* 4. Disable rapid alarm flashing and strobes (Prevents photosensitive seizure risks) */
  .alarm-strobe, .crt-screen {
    animation: none !important;
    background-color: #ef4444 !important;
    color: #ffffff !important;
    box-shadow: none !important;
  }

  /* 5. Phase 5 Timing Indicator: Slow predictable linear motion with solid contrast */
  .timing-cursor {
    animation-duration: 6s !important; /* Significantly slower, predictable rhythm */
  }

  /* 6. Wire vibration shakes and UI transitions replaced by clean discrete states */
  .error-shake {
    animation: none !important;
    outline: 3px solid #ef4444 !important;
  }

  /* 7. Automatic Skip Prompt: Highlight skip immediately in Phase 2 */
  .skip-button {
    font-weight: 700 !important;
    box-shadow: 0 0 0 3px #ffffff !important;
  }
}
```

### Motion-Reduction Design Table

| Element / Phase | Default High-Motion Experience | `prefers-reduced-motion: reduce` Fallback |
|---|---|---|
| **Phase 2 (Shrinking)** | 2.8s continuous camera zoom + 3D push + scaling implosion | 0.3s gentle crossfade directly to nano scale; no camera movement. |
| **Phase 1 & 8 Warnings** | Rapid 0.8s red alarm strobe on machine corners | Solid amber/red badge with steady high-contrast text; zero flashing. |
| **Canvas FX** | 120-particle swirling vortex and spark bursts | Particle rendering suppressed; static subtle glowing aura. |
| **Phase 5 Current Sync** | High-speed electrical pulse oscillation | Slowed 6-second predictable linear cursor with clear textual safe indicator. |
| **Wire Error Feedback** | 15Hz rapid CSS vibration shake | Red border highlight (`3px solid #ef4444`) and text error readout. |

---

## 8. Complete Layout & Styling Specification

### 8.1 Color Theme & Custom Properties
```css
:root {
  /* System Foundations */
  --font-mono: 'Consolas', 'Monaco', 'Courier New', monospace;
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  /* Macro Laboratory Palette */
  --color-lab-bg: #070b12;
  --color-lab-bench: #151d2a;
  --color-lab-bench-border: #283548;
  --color-lab-metal: #94a3b8;
  --color-lab-metal-dark: #334155;
  --color-alarm-red: #ef4444;
  --color-alarm-red-glow: rgba(239, 68, 68, 0.45);
  --color-warning-amber: #f59e0b;
  
  /* Micro Silicon Palette */
  --color-micro-bg: #020611;
  --color-pcb-substrate: #041424;
  --color-pcb-border: #0c2a46;
  --color-trace-inactive: #1e293b;
  --color-trace-active: #00d2ff;
  --color-trace-powered: #10b981;
  
  /* Dual-Coded Terminal Colors (WCAG Compliant) */
  --terminal-alpha-red: #ef4444;
  --terminal-beta-blue: #0284c7;
  --terminal-gamma-amber: #d97706;
  --terminal-delta-green: #059669;
  
  /* UI & HUD */
  --color-hud-bg: rgba(6, 12, 24, 0.88);
  --color-hud-border: #1e3a5f;
  --color-hud-text: #f8fafc;
  --color-hud-accent: #38bdf8;
  --color-hud-focus: #facc15;
}
```

### 8.2 Production CSS Rules for 2.5D Viewport & Scene Elements
```css
/* Viewport Container: Fullscreen or Embedded Showcase Frame */
.game-viewport {
  position: relative;
  width: 100vw;
  height: 100vh;
  min-height: 600px;
  background-color: var(--color-lab-bg);
  overflow: hidden;
  perspective: 1000px;
  perspective-origin: 50% 50%;
  font-family: var(--font-sans);
  color: var(--color-hud-text);
  user-select: none;
  -webkit-user-select: none;
}

/* Canvas Particle Overlay: Covers entire screen, click-through */
.fx-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

/* Scene Layers */
.scene-layer {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  pointer-events: none;
}

.layer-bg-far {
  transform: translateZ(-400px) scale(1.4);
  background: radial-gradient(circle at 50% 30%, #0d1829 0%, #030712 85%);
}

.layer-bg-mid {
  transform: translateZ(-200px) scale(1.2);
}

.layer-ground {
  transform: translateZ(0px);
}

.layer-actors {
  transform: translateZ(40px);
  pointer-events: auto; /* Interactive wires & buttons live here */
}

.layer-lighting {
  transform: translateZ(80px);
  mix-blend-mode: screen;
}

.layer-foreground {
  transform: translateZ(140px);
}

/* UI Overlay: Fixed 2D HUD above 3D world */
.ui-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  pointer-events: none;
  z-index: 20;
}

.ui-overlay button, 
.ui-overlay a, 
.ui-overlay [tabindex="0"] {
  pointer-events: auto;
}

/* Accessible Interactive Buttons */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 180px;
  min-height: 48px; /* > 44px touch target */
  padding: 12px 24px;
  background: linear-gradient(180deg, #0284c7 0%, #0369a1 100%);
  border: 1px solid #38bdf8;
  border-radius: 6px;
  color: #ffffff;
  font-family: var(--font-mono);
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.btn-primary:hover {
  background: linear-gradient(180deg, #0369a1 0%, #075985 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(2, 132, 199, 0.5);
}

.btn-primary:active {
  transform: translateY(1px);
}

.btn-primary:focus-visible {
  outline: 3px solid var(--color-hud-focus);
  outline-offset: 3px;
}

/* Skip Button (Phase 2) */
.btn-skip {
  position: absolute;
  top: 24px;
  right: 24px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid #64748b;
  color: #e2e8f0;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  padding: 10px 18px;
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.btn-skip:hover {
  background: #1e293b;
  border-color: #94a3b8;
}

.btn-skip:focus-visible {
  outline: 3px solid var(--color-hud-focus);
  outline-offset: 2px;
}
```

---

## 9. Verification & Architectural Invariants

### 9.1 Verification Checklist
- [x] **No Raster Graphics Required:** Ant-Man is 100% scalable vector SVG, rendering sharply at any size from 1:1 down to 1:1000.
- [x] **Layered 2.5D Parallax:** 6 discrete CSS 3D planes linked to a camera rig responding to phase state transitions.
- [x] **Zero DOM Thrashing Particle FX:** Canvas overlay with pre-allocated object pool of 250 elements.
- [x] **Instant Working Skip Option:** Space bar / button directly advances Phase 2 to Phase 3 in <50ms without visual artifacts.
- [x] **Strict Accessibility (`prefers-reduced-motion`):** Complete fallback set replacing camera swoops and rapid strobes with gentle crossfades.
- [x] **Dual-Coded Wire Terminals:** Red/Alpha/1, Blue/Beta/2, Amber/Gamma/3, Green/Delta/4.

### 9.2 Handoff & Next Steps for Team
- **Explorer 1 (Spec & State Machine):** Align phase triggers with camera rig attributes (`data-camera="phase-X"`).
- **Explorer 3 (UX & Accessibility):** Ensure focus rings (`:focus-visible`) and dual-coded wire identifiers map cleanly to terminal SVGs.
- **Implementer (Phase 1):** Use SVG definitions and Canvas object pool provided in Sections 3 and 5 directly in `index.html`, `style.css`, and `script.js`.
