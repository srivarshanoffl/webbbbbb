# Doctor Strange: The Three Lost Relics
## Official Storyline, Stage Reference & Gameplay Architecture

---

## 1. Narrative Overview & Premise

Across the multiverse, reality is anchored by primal mystical artifacts. A catastrophic dimensional force has ruptured these foundations, shattering three ancient relics and scattering their concentrated magical elements across disjointed pockets of time.

In the present, the relics are utterly destroyed—reduced to shattered shards, disconnected gears, and fragmented glass. Their magical essences cannot be touched or perceived in the current moment.

As Master of the Mystic Arts and guardian of the Time Stone, **Doctor Strange** activates the **Eye of Agamotto**. By casting localized temporal reversal fields, Strange can peel back the history of each relic. As time flows backward, the broken objects reconstruct. Within a specific, delicate temporal interval—the **Exposure Window**—the inner magical element becomes visible and vulnerable to extraction.

Strange must journey through time, recover all three lost elements, and combine them at the Sanctum Altar to project an impenetrable reality shield before the universe fractures permanently.

---

## 2. Core Time Manipulation Mechanics

The game revolves entirely around temporal navigation using the Eye of Agamotto:

| Control | Action | Mechanical Effect |
| :--- | :--- | :--- |
| **Hold `Q`** | **Reverse Time** | Moves object's timeline backwards ($t$ decreases). Shards rise and reconstruct. |
| **Hold `E`** | **Forward Time** | Moves object's timeline forwards ($t$ increases). Object returns toward ruined present. |
| **Release `Q` / `E`** | **Freeze Timeline** | Freezes time instantaneously. Objects remain suspended in mid-air. |
| **Mouse Click** | **Collect Element** | Interacts with and collects an exposed magical element during its window. |
| **`SPACE`** | **Interact / Advance** | Advances dialogue, confirms prompts, or initiates phase transitions. |

### The Exposure Window Rule
- Each relic features a normalized timeline $t \in [0.0, 1.0]$, where $1.0$ is the **Destroyed Present** and $0.0$ is the **Pristine Ancient Past**.
- The magical element is accessible **only** within a focused, high-intensity temporal window:
  $$\text{Window Interval: } t \in [0.45, 0.55]$$
  spanning exactly **1.0 second** of live timeline playback speed ($0.10 \times 10.0\text{s}$).
- In the deep past ($t < 0.45$), the object is fully assembled and sealed; the element is hidden inside and inaccessible.
- In the ruined present ($t > 0.55$), the object is completely shattered and the element has vanished into the timeline.
- **Freeze & Collect**: When the timeline reaches the 1.0s window, releasing `[Q]` or `[E]` immediately freezes the timeline, suspending the shards in mid-air and giving the player all the time needed to click and retrieve the element. If the player overshoots, they simply hold `[E]` to scrub back into the window. Once collected, the element remains permanently secured.
- The magical element is accessible **only** within a rapid, precision temporal flash:
  $$\text{Window Interval: } t \in [0.49, 0.51]$$
  spanning exactly **0.2 seconds** of live timeline playback speed ($0.02 \times 10.0\text{s}$).
- **No Progress Bar**: The scrubber bar is intentionally hidden from the HUD. Players must rely on their direct visual observation of the physical object reconstructing on the altar to spot the moment the magical element is exposed.
- In the deep past ($t < 0.49$), the object is fully assembled and sealed; the element is hidden inside and inaccessible.
- In the ruined present ($t > 0.51$), the object is completely shattered and the element has vanished into the timeline.
- **Freeze & Collect**: When the relic reaches the 0.2s window, releasing `[Q]` or `[E]` immediately freezes the timeline, suspending the shards in mid-air and giving the player all the time needed to click and retrieve the element. If the player overshoots, they simply hold `[E]` to scrub back into the window. Once collected, the element remains permanently secured.

---

## 3. Stage-by-Stage Reference Guide

### Stage 1: Introduction & The Awakening of Agamotto
- **Setting**: The Great Relic Hall of the Sanctum Sanctorum. Distant dimensional fissures flicker through the grand skylight.
- **Narrative**:
  - Doctor Strange discovers reality tearing at the seams.
  - The Eye of Agamotto opens on his chest, revealing the temporal signatures of three lost artifacts.
  - Strange explains the nature of temporal reversal to the player.
- **Gameplay / Tutorial**:
  - The player is introduced to the controls: `[Q]` to reverse, `[E]` to forward, release to freeze.
  - A small Kamar-Taj training glyph gives the player immediate, tactile feedback on how temporal scrubbing works.
  - Pressing `SPACE` transports Strange into the first timeline pocket.

---

### Stage 2: Relic One — The Ancient Vase (Kamar-Taj Vault)
- **Setting**: Deep subterranean stone vault beneath Kamar-Taj, illuminated by jade-green braziers and ancient Sanskrit runes.
- **The Relic**: An ancient, ornate mystical ceramic vase adorned with gold leaf and celestial filigree.
- **Magical Element**: **Time Crystal** (Luminous Emerald Green).
- **Timeline Breakdown**:
  - $t = 1.0$ (Present): The vase lies in shattered pottery fragments strewn across the altar floor.
  - $t = 0.8 \rightarrow 0.63$: Holding `Q` causes shards to rise from the floor on gravitational arcs, tumbling and rotating into position.
  - $t \in [0.38, 0.62]$ (**Collection Window ~4.5s**): The vase body has partially knit together, but the neck and upper rim remain open in floating suspension. Suspended at the center of the vase, the radiant green **Time Crystal** hovers, radiating green Tao glyph rings.
  - $t < 0.38$ (Deep Past): The vase fully reconstructs into its pristine unbroken form. The ceramic walls seal shut, obscuring the crystal completely.
- **Player Objective**: Hold `Q`, observe the reassembly, release `Q` when the Time Crystal appears, and click it.
- **Reward**: Time Crystal recovered. HUD updates to `1 / 3`.

---

### Stage 3: Relic Two — The Magical Clock (Chrono-Sanctum Tower)
- **Setting**: A monumental astronomical clockwork cathedral with colossal interlocking brass gear assemblies and golden sunbeam shafts.
- **The Relic**: An ancient golden astronomical chronometer whose internal escapement and gear trains were catastrophically derailed.
- **Magical Element**: **Eternity Gear** (Radiant Celestial Gold).
- **Timeline Breakdown**:
  - $t = 1.0$ (Present): The clock casing is fractured; cogs and bronze teeth are scattered and dead.
  - $t = 0.8 \rightarrow 0.61$: Holding `Q` causes gear wheels to spin backward along concentric axes, re-engaging with their axles. The clock hands spin counter-clockwise, trailing golden chronal dust.
  - $t \in [0.36, 0.60]$ (**Collection Window ~4.5s**): The internal gear train separates along an astral gimbal, exposing the radiant golden **Eternity Gear** rotating in place with ancient astrological engravings.
  - $t < 0.36$ (Deep Past): The clock face snaps shut and the brass filigree housing locks, fully sealing the mechanism.
- **Player Objective**: Scrub time backwards (or forwards if overshot), pause within the window, and click the golden Eternity Gear.
- **Reward**: Eternity Gear recovered. HUD updates to `2 / 3`.

---

### Stage 4: Relic Three — The Cosmic Orb (Astral Plane Rift)
- **Setting**: The boundless Astral Void—a surreal zero-gravity dimension with swirling purple nebulae and floating crystalline monoliths.
- **The Relic**: A crystalline cosmic orb containing pure multiversal matter, previously shattered into weightless prismatic glass shards.
- **Magical Element**: **Cosmic Core** (Pulsating Astral Purple).
- **Timeline Breakdown**:
  - $t = 1.0$ (Present): The orb is completely shattered; jagged glass facets float aimlessly in space.
  - $t = 0.8 \rightarrow 0.65$: Holding `Q` creates a reverse-suction vortex, pulling the floating glass facets inward toward a central singularity.
  - $t \in [0.40, 0.64]$ (**Collection Window ~4.5s**): The glass facets form an open geodesic cage, revealing the pulsating violet **Cosmic Core** swirling with miniature galaxies and quantum sparks.
  - $t < 0.40$ (Deep Past): The glass facets fuse seamlessly into a solid, impenetrable crystal sphere, locking the core within.
- **Player Objective**: Reverse into the window, freeze time, and click the Cosmic Core.
- **Reward**: Cosmic Core recovered. HUD updates to `3 / 3`. All three elements secured!

---

### Stage 5: Final Phase — World Protection & Reality Restoration
- **Setting**: Central Sanctum Chamber under severe multiversal collapse. The sky is shattered into geometric shards, architecture is disintegrating, and red/violet dimensional storm clouds swirl violently.
- **The Convergence Altar**: Doctor Strange approaches the central circular stone altar marked with three runic sockets.
- **Cinematic Sequence**:
  1. Strange activates the Eye of Agamotto. Brilliant emerald light bathes the chamber.
  2. The **Time Crystal** floats into the first socket (emitting emerald rays).
  3. The **Eternity Gear** floats into the second socket (emitting radiant golden rays).
  4. The **Cosmic Core** floats into the third socket (emitting deep violet rays).
  5. The three elements synchronize, creating a tri-chromatic energy circuit.
  6. The altar's central Tao mandala begins spinning at tremendous speed.
  7. A massive hemispheric protective barrier expands outward across the entire screen.
  8. The crumbling reality stabilizes: cracks in the sky knit together, masonry reassembles, and the chaotic storm transforms into a serene starlit twilight.
  9. Doctor Strange lowers his hands as the Eye of Agamotto softly closes.
- **Victory Screen**:
  - **WORLD PROTECTED**
  - **ALL THREE MAGICAL ELEMENTS RECOVERED**
  - *"Reality has been restored across the multiverse."*

