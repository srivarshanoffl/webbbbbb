# Wanda – The Portal Awakening

An interactive, cinematic 2.5D browser puzzle experience featuring **Wanda Maximoff (Scarlet Witch)**, inspired by her telekinetic and Chaos Magic abilities in the Marvel Cinematic Universe.

Built strictly using **HTML5, CSS3, and Vanilla JavaScript** with **zero external dependencies or frameworks**.

---

## 🌟 Game Experience & Phases

### 🧘 Phase 1: Wanda's Meditation
- Wanda floats serenely at the center of the environment in a meditation pose (legs crossed, hands hovering, eyes closed).
- Deep 2.5D mystical atmosphere with dark cosmic nebula gradients, floating red particles, glowing floor sanctum, and dynamic depth.
- Three mystical objects hover around Wanda:
  1. **Ancient Magical Crystal**
  2. **Floating Mystical Energy Ring**
  3. **Mysterious Magical Artifact**

### 🔮 Phase 2: First Object – Telekinetic Cradle
- Wanda rebuilds the Ancient Crystal's cradle from four crops cut directly from the same completed cradle image.
- Three shifted crops from that image act as decoys. The correct pieces reproduce the source image exactly when placed in the four highlighted quadrants.
- **Controls**: Drag a crop into the highlighted quadrant with mouse or touch. Pause briefly to steady it, then release. Click a crop and click the target, or press `1`–`7` then `Enter`, as alternatives.
- Crops must match the highlighted image section in sequence. A decoy or wrong crop returns to the tray without losing progress.
- Once the cradle is complete, Wanda seats the crystal in portal position 1.

### ⚡ Phase 3: Second Object – Energy Stabilization Challenge
- Wanda controls the Floating Mystical Energy Ring, which oscillates and wobbles erratically.
- **Controls**: Press and hold `SPACEBAR` (or on-screen Channel button) to charge Chaos Magic energy into the ring.
- Release when the meter hits the green Harmonic Frequency Zone (65%–87%).
- Successfully stabilize the frequency **3 times** to lock the ring into portal position 2.

### ⚠️ Phase 4: Third Object – The Unexpected Bug (Anomaly)
- Wanda telekinetically pulls the Mysterious Artifact towards the center.
- Suddenly, the energy connection flickers, screen glitches with scanlines and chromatic distortion, and the artifact freezes in mid-air.
- A **Chaos Magic System** error interface appears:
  - Error Code: `003`
  - Message: *"An unexpected anomaly has interrupted Wanda's telekinetic connection. Third artifact synchronization failed."*
  - Dedicated **Modular Debugging Placeholder** ready for future DevTools challenges.
  - Functional **BYPASS FOR TESTING** button to simulate bug resolution and restore the conduit.
- Clicking bypass unfreezes the artifact and locks it into portal position 3.

### 🌀 Phase 5: Portal Construction
- All three objects are locked into a geometric power triangle around the nexus.
- Wanda unleashes powerful Chaos Magic: procedural red lightning arcs bridge Wanda to each object and connect the objects into a flaming triangular matrix.
- The portal vortex expands with swirling accretion disk particles, counter-rotating runic rings, and a deep singularity core accompanied by cinematic audio.

### ✨ Phase 6: Entering the Portal (Game Completion)
- Wanda gracefully descends from levitation and touches down, transitioning from meditation pose to standing pose.
- Her glowing scarlet eyes open.
- The 2.5D camera shifts to a cinematic perspective.
- Wanda turns toward the portal and walks forward into the magical vortex, dissolving into ascending scarlet energy.
- The portal collapses with a flash, the screen fades to black, and the final cinematic conclusion card appears with a replay option.

---

## 🎮 Controls

| Action | Keyboard | Touch / Mouse |
|---|---|---|
| **Build Cradle (Phase 2)** | Select piece `1`–`7`, then `Enter` | Drag or click piece, then target |
| **Channel Energy (Phase 3)** | Hold & Release `SPACEBAR` | Hold & Release Channel Button |
| **Resolve Bug (Phase 4)** | Click Bypass Button | Tap Bypass Button |
| **Toggle Audio** | Click Speaker Icon `🔊` / `🔇` | Tap Speaker Icon |

---

## 🛠️ Architecture & Technology Stack
- **HTML5**: Semantic 2.5D stage layout and custom SVG character and artifact rigs.
- **CSS3**: 3D transforms (`perspective`, `rotateX`, `rotateY`, `translateZ`), keyframe animations, glow filters, scanline glitch overlays.
- **Vanilla JavaScript**:
  - `js/audio.js`: Procedural Web Audio API sound synthesizer (drone, chimes, charge hum, glitch burst, portal roar).
  - `js/particles.js`: 60 FPS 2.5D particle engine & chaos lightning arcs.
  - `js/wanda.js`: Character state controller for pose morphing, levitation, and walking.
  - `js/game.js`: Finite state machine driving the 6 sequential phases.

## 🎨 Local Art Assets
- `assets/stack/` contains the complete cradle illustration and the active seven transparent WebP crops used in the Phase 2 puzzle. The four correct crops are cut from the exact source image, so their edges and proportions match the cradle targets.
- These fragment images were generated for this project and copied locally; the gameplay does not fetch images from external sites.

