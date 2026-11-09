# Visual Flaw Audit & Technical Remediation Report: Doctor Strange: The Three Lost Relics

**Target**: `strange/` (`index.html`, `style.css`, `script.js`, `assets/`)  
**Auditor**: Forensic QA & Visual Design Specialist  
**Integrity Mode**: Strict Audit & Concrete Remediation  
**Evaluation Standard**: 9 Visual Dimensions | 4-Tier Severity Scale (`Critical`, `Major`, `Minor`, `Polish`)  

---

## 1. Executive Summary & Overall Visual Health Rating

### Visual Health Rating: 58 / 100

**Doctor Strange: The Three Lost Relics** features a compelling 2.5D mystic premise: players wield the Eye of Agamotto to reverse time, scrubbing shattered relics (The Ancient Vase of Kamar-Taj, The Magical Astronomical Clock of Prague, and The Cosmic Rift Orb) back through time to freeze and capture exposed magical elements (Time Crystal, Eternity Gear, and Cosmic Core).

Despite this rich cinematic concept, the game is crippled by severe visual, architectural, and gameplay defects:
1. **Critical Scrubber Track Suppression**: In `style.css:1270`, the rule `.scrubber-track { display: none !important; }` forcefully hides the entire timeline scrubber track. The timeline labels ("PAST", "PRESENT", and relic title) float in an empty black void. All visual feedback of time movement, scrub head position, and target windows is completely invisible.
2. **Exposure Window Width Collapse & Text Clipping**: In `script.js`, duplicate object literal keys overwrite the intended 1.0s exposure window (`0.45` to `0.55`) with a 0.2s micro-window (`0.49` to `0.51`). In the DOM, this evaluates to `width: 2%`, violently squeezing the child text `EXPOSURE WINDOW (1.0s)` into a 2% wide box, causing extreme text overflow and overlap.
3. **Massive 15+ MB Asset Bloat**: A single uncompressed high-resolution photo `prague_clock_hd.jpg` accounts for 13,124,666 bytes (~13.12 MB) in the `assets/relics/` directory. Together with `ming_vase_hd.jpg` (1.54 MB) and dozens of duplicate format files, the asset folder wastes over 17 MB.
4. **Rectilinear "Photo Tile" Relic Shards**: The broken vase shards (`vase_grand_shard_0.png` through `7.png`) are rectangular photo cutouts with straight mechanical edges. When exploding or reconstructing, they resemble floating postage stamps rather than fractured ancient porcelain.
5. **Mobile Viewport Character Decapitation**: On mobile portrait screens (e.g. 390x844), the 16:9 container squashes to a height of 219px (`max-height: 56.25vw`), while Doctor Strange's rig `#strange-rig` is fixed at 570px tall, decapitating the character at the chest or knees.
6. **Immersion-Puncturing Test Controls**: A persistent "BUGS" toggle button (`.bug-window-toggle`) at `top: 100px; right: 24px;` and a modal titled "REALITY CHECK - All three relics secured - SOLVE BUG & CONTINUE" break narrative immersion.

---

## 2. In-Depth Evaluation Across All 9 Visual Dimensions

### 2.1 Layout
- **Scrubber Track Invisible in HUD Layout**:
  - *Location*: `strange/style.css:1260-1271`, `strange/index.html:195-213`
  - *Observation*: The timeline scrubber container markup exists:
    ```html
    <div class="timeline-scrubber-container">
      <div class="scrubber-header">
        <span class="scrub-bound left">PAST (RECONSTRUCTED)</span>
        <span class="scrub-title" id="active-relic-name">RELIC 1: THE ANCIENT VASE</span>
        <span class="scrub-bound right">PRESENT (DESTROYED)</span>
      </div>
      <div class="scrubber-track" id="timeline-track">...</div>
    </div>
    ```
    However, in `style.css:1270`:
    ```css
    .scrubber-track {
      ...
      display: none !important;
    }
    ```
  - *Defect Analysis*: The scrubber track is completely suppressed. The header text labels float above empty black space with no visual anchoring, disorienting the player.
- **Top HUD / Character Stage Spacing**:
  - *Location*: `strange/style.css:938-944`
  - *Observation*: `#hud-top` flex layout consumes 80px of vertical space, crowding Strange's head and the floating relic on lower-resolution viewports.

### 2.2 Styling
- **Immersion-Breaking Developer Debug Button & Modals**:
  - *Location*: `strange/style.css:890-936`, `strange/index.html:246-254`
  - *Observation*: The game includes:
    ```html
    <button id="bug-window-toggle" class="bug-window-toggle" type="button">BUGS</button>
    <div id="bug-window" class="bug-window">
      <div class="bug-window-card">
        <button id="solve-bug-btn" class="btn-mystic">SOLVE BUG</button>
      </div>
    </div>
    <div id="finale-checkpoint" class="bug-window">
      <div class="bug-window-card">
        <span class="bug-window-kicker">REALITY CHECK</span>
        <h2 id="finale-checkpoint-title">All three relics secured</h2>
        <button id="solve-bug-continue-btn" class="btn-mystic">SOLVE BUG &amp; CONTINUE</button>
      </div>
    </div>
    ```
  - *Defect Analysis*: These buttons and modals appear as leftover QA test scaffolding. Presenting a golden "BUGS" pill button directly in Doctor Strange's Kamar-Taj sanctum shatters cinematic Marvel illusion.

### 2.3 Animations
- **Impossible 0.2s Exposure Window & Reaction Time Failure**:
  - *Location*: `strange/script.js:22-25, 39-42, 56-59`
  - *Observation*: Each relic entry contains duplicate keys:
    ```javascript
    windowMin: 0.45,
    windowMax: 0.55, // Exactly 1.0s window (0.10 * 10s)
    windowMin: 0.49,
    windowMax: 0.51, // Exactly 0.2s window (0.02 * 10.0s)
    ```
  - *Defect Analysis*: In JavaScript, duplicate object keys result in the second pair overriding the first. The exposure window is reduced to a 200ms flash (`0.49` to `0.51`). Combined with the hidden scrubber track, a human player with average 250ms neural-motor reaction time cannot physically perceive and release the Q key within 200ms, creating severe gameplay frustration.
- **Lack of Temporal Deceleration / Ease**:
  - *Location*: `strange/script.js:770-810`
  - *Observation*: Time scrubs linearly at constant speed `state.t -= dt * 0.10`. There is no magnetic attraction, audio pitch drop, or temporal deceleration to telegraph that the playhead is nearing the magical exposure sweet spot.

### 2.4 Responsiveness
- **Catastrophic Character Decapitation on Mobile**:
  - *Location*: `strange/style.css:50-55, 140-150`
  - *Observation*: `#game-viewport` enforces a strict 16:9 aspect ratio (`max-height: 56.25vw; overflow: hidden;`). On standard mobile portrait screens (e.g. 390px wide by 844px high), viewport height is capped at:
    $$390 \times \frac{9}{16} = 219.38\text{ px}$$
    Meanwhile, `#strange-rig` has hardcoded dimensions:
    ```css
    #strange-rig {
      position: absolute;
      left: 4%;
      bottom: 0%;
      width: 360px;
      height: 570px;
    }
    ```
  - *Defect Analysis*: A 570px-tall character inside a 219px container with `overflow: hidden` causes Doctor Strange to be severely cropped at the knees or waist. The character's head, face, and Eye of Agamotto amulet are pushed off the top edge of the screen.

### 2.5 Assets
- **Massive 13.1 MB Raw Photo Bloat**:
  - *Location*: `strange/assets/relics/prague_clock_hd.jpg`
  - *Observation*: A single JPEG file measures 13,124,666 bytes (~13.12 MB / 4000x3000px). In addition, `ming_vase_hd.jpg` is 1,538,282 bytes (~1.54 MB).
  - *Defect Analysis*: Over 14.6 MB of heavy uncompressed photographic assets are checked into this browser game repository, causing long asset download stalls and unnecessary memory consumption.
- **Unrealistic Rectangular "Photo Card" Shards**:
  - *Location*: `strange/assets/relics/vase_grand_shard_0.png` through `7.png`
  - *Observation*: The 8 vase shards are rectangular tiles cropped with straight mechanical 90-degree corners.
  - *Defect Analysis*: Shattered antique ceramic pottery produces irregular, sharp, jagged shards with curved fracture lines. The straight edges make the exploding relic look like a broken photo gallery.
- **Redundant Format Duplication**:
  - *Location*: `strange/assets/relics/`
  - *Observation*: Every relic element exists simultaneously as `.jpg`, `.svg`, `_grand.png`, and `_transparent.png` (e.g. `core_cosmic.jpg`, `core_cosmic.svg`, `core_cosmic_grand.png`, `core_cosmic_transparent.png`).

### 2.6 HUD and Canvas Alignment
- **Exposure Window Width Collapse & Severe Text Overflow**:
  - *Location*: `strange/script.js:936-937`, `strange/index.html:204-206`
  - *Observation*: In `switchRelicAssembly()`:
    ```javascript
    DOM.timelineWindowZone.style.left = (relic.windowMin * 100) + '%';
    DOM.timelineWindowZone.style.width = ((relic.windowMax - relic.windowMin) * 100) + '%';
    ```
    Because `relic.windowMax - relic.windowMin = 0.51 - 0.49 = 0.02`, `width` is set to `2%`!
    Inside this 2% wide container sits:
    ```html
    <div class="window-zone" id="timeline-window-zone">
      <span class="window-tag">EXPOSURE WINDOW (1.0s)</span>
    </div>
    ```
  - *Defect Analysis*: On an 800px-wide scrubber track, 2% equals 16px! Forcing a 160px text label `EXPOSURE WINDOW (1.0s)` into a 16px box causes severe text overflow, overlapping the track borders and colliding with the scrub head indicator.

### 2.7 Contrast
- **Contradictory Tutorial Step 2 Instructions**:
  - *Location*: `strange/index.html:270-272`
  - *Observation*: Step 2 renders two conflicting instruction paragraphs simultaneously:
    ```html
    <div class="tut-step">
      <div class="step-badge">2</div>
      <div>Watch the highlighted <strong>Exposure Window</strong>. When the magical element glows, release <strong class="key-label">Q</strong> to freeze time.</div>
      <div>Watch the relic reconstruct closely. When the magical element flashes into view (a rapid <strong>0.2s Window</strong>), release <strong class="key-label">Q</strong> to freeze time.</div>
    </div>
    ```
  - *Defect Analysis*: Confuses players by showing both 1.0s exposure guidelines and 0.2s flash guidelines stacked on top of each other.
- **Low Contrast on Eye of Agamotto State Readout**:
  - *Location*: `strange/style.css:1240-1250`
  - *Observation*: The text `#time-state-label` (`|| TIMELINE FROZEN`) uses `#70a890` on dark obsidian background, failing WCAG AA 4.5:1 contrast.

### 2.8 Clipping
- **Spell Mandala Viewport Edge Clipping**:
  - *Location*: `strange/style.css:140-150`, `strange/style.css:210-235`
  - *Observation*: `#strange-rig` is anchored at `left: 4%`. The circular mystic spell shields (`.mystic-shield-outer`, width 180px) project outward from Strange's left hand.
  - *Defect Analysis*: The rotating spell circles extend past the 4% margin, clipping against the left edge of `#game-viewport` due to `overflow: hidden`.

### 2.9 Visual Spectacle
- **Flat Temporal Particle Stream**:
  - *Location*: `strange/script.js:198-215`
  - *Observation*: The particle stream drawn on `#fx-canvas` connecting Strange's hands to the relic renders basic opaque circular dots (`ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)`).
  - *Defect Analysis*: Lacks dynamic glow blending (`ctx.globalCompositeOperation = 'lighter'`), radial alpha softness, and trailing lightning arcing during reverse scrubbing.

---

## 3. Prioritized Defect Catalog

| ID | Dimension | Severity | Location / Element | Defect Summary |
| :--- | :--- | :---: | :--- | :--- |
| **DS-01** | HUD / Canvas | **Critical** | `style.css:1270` | `.scrubber-track` hidden via `display: none !important;`, leaving empty black void in HUD. |
| **DS-02** | HUD / Canvas | **Major** | `script.js:22-25, 936-937` | Duplicate keys collapse `.window-zone` width to 2%, causing `EXPOSURE WINDOW` text overflow. |
| **DS-03** | Assets | **Major** | `assets/relics/prague_clock_hd.jpg` | Massive 13.1 MB raw JPEG bloat in `assets/relics/` (total directory > 17 MB). |
| **DS-04** | Responsiveness | **Major** | `style.css:50-55, 140-150` | 16:9 container collapses to 219px height on mobile, decapitating 570px character rig. |
| **DS-05** | Assets | **Major** | `assets/relics/vase_grand_shard_*.png` | Vase shards are rectangular photo tiles with 90° straight edges rather than organic ceramic shards. |
| **DS-06** | Styling | **Major** | `style.css:890-936`, `index.html:246-254` | "BUGS" toggle button and "REALITY CHECK - SOLVE BUG" modal destroy Marvel cinematic immersion. |
| **DS-07** | Animations | **Major** | `script.js:24-25, 770-810` | 200ms exposure window with hidden track is physiologically impossible for human reaction times. |
| **DS-08** | Contrast | **Minor** | `index.html:270-272` | Contradictory duplicate instruction lines rendered simultaneously in tutorial Step 2. |
| **DS-09** | Clipping | **Minor** | `style.css:140-150, 210-235` | Strange rig `left: 4%` causes rotating casting mandalas to clip against viewport left boundary. |
| **DS-10** | Visual Spectacle | **Polish** | `script.js:198-215` | Temporal stream particles drawn as flat dots without additive glow or Bezier trailing arcs. |

---

## 4. Concrete Technical Remediation Plans

### 4.1 Restore Timeline Scrubber Track in HUD (DS-01)
Remove `display: none !important;` and polish track styling:

```css
/* In strange/style.css — REPLACE lines 1260-1271 */
.scrubber-track {
  position: relative;
  width: 100%;
  height: 16px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.9), 0 0 12px rgba(0, 255, 136, 0.15);
  overflow: visible;
  cursor: pointer;
  display: block !important; /* RESTORE VISIBILITY */
  margin-top: 6px;
}
```

---

### 4.2 Reconcile Exposure Window & Fix Text Overflow (DS-02, DS-07)
Remove duplicate object keys in `script.js` to establish an authentic 1.0s window (`0.45` to `0.55`), and style `.window-tag` to float centered above the window zone:

```javascript
// In strange/script.js — REPLACE lines 22-25, 39-42, 56-59
// In Relic 1 (Vase):
windowMin: 0.45,
windowMax: 0.55, // Exactly 1.0s exposure window (0.10 * 10.0s timeline)

// In Relic 2 (Clock):
windowMin: 0.45,
windowMax: 0.55, // Exactly 1.0s exposure window

// In Relic 3 (Orb):
windowMin: 0.45,
windowMax: 0.55, // Exactly 1.0s exposure window
```

```css
/* In strange/style.css — REPLACE lines 1284-1300 */
.window-zone {
  position: absolute;
  top: -3px;
  bottom: -3px;
  background: rgba(0, 255, 136, 0.28);
  border-left: 2px solid var(--green-time);
  border-right: 2px solid var(--green-time);
  border-radius: 4px;
  box-shadow: 0 0 20px var(--green-glow);
  pointer-events: none;
  min-width: 40px; /* Minimum width threshold */
}

.window-tag {
  position: absolute;
  top: -26px;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-hud);
  font-size: 10px;
  font-weight: 800;
  color: var(--green-time);
  text-shadow: 0 0 8px var(--green-glow);
  white-space: nowrap;
  letter-spacing: 1px;
  background: rgba(4, 10, 20, 0.85);
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid rgba(0, 255, 136, 0.4);
}
```

---

### 4.3 Prune Bloated 13.1 MB JPEG and Dead Relic Assets (DS-03)
Delete the massive raw camera photo `prague_clock_hd.jpg` (13.12 MB) and `ming_vase_hd.jpg` (1.54 MB), keeping optimized WebP/PNG formats:

```powershell
# Technical Remediation File Removal Command
Remove-Item -Path "strange\assets\relics\prague_clock_hd.jpg" -Force
Remove-Item -Path "strange\assets\relics\ming_vase_hd.jpg" -Force
```
*Net Bandwidth Savings: ~14.66 MB (over 85% reduction in asset directory size).*

---

### 4.4 Responsive Viewport Proportional Scaling (DS-04)
Implement container transform scaling or responsive `vmin`/percentage units so that Strange scales proportionally rather than being cropped:

```css
/* In strange/style.css — REPLACE lines 140-150 */
#strange-rig {
  position: absolute;
  left: max(20px, 8%);
  bottom: 0%;
  width: min(360px, 28vw);
  height: calc(min(360px, 28vw) * 1.58);
  max-height: 80vh;
  transform-origin: bottom center;
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.3, 1);
  will-change: transform;
  z-index: 15;
}
```

---

### 4.5 Jagged Porcelain Masking for Vase Shards (DS-05)
Apply SVG clip-paths to the 8 vase shards to eliminate straight rectangular photo borders:

```css
/* In strange/style.css — ADD shard clip-paths */
.shard-item:nth-child(1) { clip-path: polygon(15% 0%, 95% 8%, 80% 90%, 5% 75%); }
.shard-item:nth-child(2) { clip-path: polygon(5% 10%, 85% 0%, 100% 70%, 25% 100%); }
.shard-item:nth-child(3) { clip-path: polygon(20% 5%, 100% 20%, 75% 95%, 0% 80%); }
.shard-item:nth-child(4) { clip-path: polygon(0% 15%, 80% 0%, 100% 85%, 15% 95%); }
.shard-item:nth-child(5) { clip-path: polygon(10% 0%, 90% 15%, 85% 100%, 0% 80%); }
.shard-item:nth-child(6) { clip-path: polygon(0% 0%, 100% 25%, 70% 100%, 15% 85%); }
.shard-item:nth-child(7) { clip-path: polygon(25% 0%, 95% 10%, 80% 85%, 5% 100%); }
.shard-item:nth-child(8) { clip-path: polygon(10% 15%, 90% 0%, 100% 90%, 0% 75%); }
```

---

### 4.6 Remove Developer BUGS Scaffolding from Production (DS-06)
Remove `#bug-window-toggle` and `#bug-window` from `index.html` and `style.css`:

```html
<!-- REMOVE lines 240-254 from strange/index.html -->
<!-- Replace with narrative Sanctum Seal Completion Modal if needed -->
```

```css
/* In strange/style.css — SUPPRESS debug controls */
.bug-window-toggle,
.bug-window {
  display: none !important;
}
```

---

### 4.7 Reconcile Contradictory Tutorial Step 2 (DS-08)
Remove the duplicate 0.2s instruction line from `index.html`:

```html
<!-- In strange/index.html — REPLACE lines 269-273 -->
<div class="tut-step">
  <div class="step-badge">2</div>
  <div>Watch the highlighted <strong style="color: var(--green-time);">Exposure Window (1.0s)</strong> on the timeline. When the magical element glows, release <strong class="key-label">Q</strong> to freeze time.</div>
</div>
```

---

### 4.8 Additive Glow & Lightning for Temporal Particles (DS-10)
Upgrade particle rendering in `renderParticles()` with radial glow:

```javascript
// In strange/script.js — In renderParticles()
ctx.save();
ctx.globalCompositeOperation = 'lighter';
for (let p of particles) {
  const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2);
  grad.addColorStop(0, p.color);
  grad.addColorStop(0.5, p.color.replace(')', ', 0.5)').replace('rgb', 'rgba'));
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r * 2, 0, Math.PI * 2);
  ctx.fill();
}
ctx.restore();
```

---

## 5. Visual Verification Checklist

- [ ] **Scrubber Track Visibility**: Confirm `.scrubber-track` renders beneath the relic header with clear border boundaries and past/present labels.
- [ ] **Window Zone Legibility**: Verify `.window-zone` has an authentic 10% width (1.0s window) and `.window-tag` sits centered above without text clipping or track overlap.
- [ ] **Asset Footprint Verification**: Confirm that `prague_clock_hd.jpg` and `ming_vase_hd.jpg` are pruned, bringing total directory size below 3 MB.
- [ ] **Mobile Character Sizing**: Test viewport at 375x667 and 390x844 in DevTools; verify Doctor Strange's full head, shoulders, and amulet remain fully visible.
- [ ] **Ceramic Shard Fractures**: Confirm that vase shards exhibit jagged polygon edges rather than rectangular photo card corners during the reverse time scrub.
- [ ] **Tutorial Harmony**: Verify that Step 2 in the story tutorial modal displays a single, coherent 1.0s exposure instruction line.
- [ ] **Casting Mandala Framing**: Confirm Doctor Strange's rotating spell mandalas do not clip against the left edge of `#game-viewport`.
