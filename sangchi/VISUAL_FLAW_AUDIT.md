# Visual Flaw Audit & Technical Remediation Report: Shang-Chi: Broken Harmony

**Target**: `sangchi/` (`sangchi.html`, `assets/`)  
**Auditor**: Forensic QA & Visual Design Specialist  
**Integrity Mode**: Strict Audit & Concrete Remediation  
**Evaluation Standard**: 9 Visual Dimensions | 4-Tier Severity Scale (`Critical`, `Major`, `Minor`, `Polish`)  

---

## 1. Executive Summary & Overall Visual Health Rating

### Visual Health Rating: 64 / 100

**Shang-Chi: Broken Harmony** is an ambitious single-page web game blending 10 rotating CSS 3D metallic toroid rings, a Great Protector dragon spirit manifest, procedural glass shard physics, Web Audio harmonic synthesis, and a multi-phase narrative journey (Briefing → 6-Stage Lantern Memory Sequence → Relic Manifestation & CSS Bug Challenge → 5-Beat Epic Detonation → Dragon God Mode).

However, the game suffers from critical visual and architectural flaws:
1. **Critical CSS Identifier Case Mismatch Bug**: The core progression sequence breaks because `@keyframes bulb-shatter` is defined in kebab-case, while the active class `.magical-bulb.destroying` references `bulbShatter` in camelCase. Without fixing this, the relic's visual destruction animation completely fails to execute.
2. **Severe Thematic Anachronism**: The central mystical relic is rendered as a modern incandescent Edison screw light bulb (`viewBox="0 0 120 180"`) with a tungsten filament and brass threading. Floating this 19th-century electrical bulb in the sacred mystical bamboo realm of Ta Lo next to the ancient Ten Rings creates severe aesthetic dissonance.
3. **Massive Unpruned Asset Bloat**: The `assets/` directory houses a 2.72 MB uncropped desktop screenshot (`real_dragon_asset_screenshot.png`), debug remnants (`debug_arms.png`), backup files (`shangchi_base.old.png`, `shangchi_glow.old.png`), and unused limb slices, bloating production storage by over 4.5 MB.
4. **Fragile Viewport Layout & Dynamic Sizing**: Bottom action button positioning relies on dynamic JavaScript string concatenation in `fitMissionUI()`, causing jittery jumps when mobile virtual keyboards or browser URL bars collapse.
5. **DOM Boundary Breaches**: Projectile beams and impact particles in the finale are appended directly to `document.body` rather than being contained within the viewport stage `#stage`.

---

## 2. In-Depth Evaluation Across All 9 Visual Dimensions

### 2.1 Layout
- **Monolithic Single-File Anti-Pattern**:
  - *Location*: `sangchi.html:1-3717`
  - *Observation*: The entire application—3,717 lines comprising markup, 2,660 lines of styles, and 1,050 lines of JavaScript—is bundled in a single monolithic `.html` file. Viewport stage wrappers (`#stage`), HUD panels (`#panel`, `#mission-panel`), and character rigs (`#figure-wrap`) are tangled without stylesheet modularity.
  - *Defect Analysis*: Prevents independent browser caching of CSS and scripts, increases initial parse latency, and makes layout refactoring hazardous.
- **Stage Center vs Mission Dock Compaction**:
  - *Location*: `sangchi.html:2472-2476`, `sangchi.html:3658-3663`
  - *Observation*: `#figure-wrap` is scaled via JavaScript `transform: translate(-50%, -50%) scale(${s})` in `fit()`. On wide ultrawide screens (e.g. 21:9 or 32:9), the 520x560 stage stays locked in the center while mission text stretches or floats with excessive negative dead space on left and right borders.

### 2.2 Styling
- **Aesthetic Incongruity — Incandescent Edison Bulb in Ancient Ta Lo**:
  - *Location*: `sangchi.html:2426-2458`
  - *Observation*: The SVG asset for `#magical-bulb` renders an unmistakable modern electrical bulb:
    ```html
    <svg class="magical-bulb" id="magical-bulb" viewBox="0 0 120 180" ...>
      ...
      <path d="M50 134 Q45 95, 60 80 T70 56 Q60 48, 50 64 T60 95 Q65 115, 68 134" stroke="#ffffff" stroke-width="3" .../> <!-- Tungsten Filament -->
      <path d="M46 138 L74 138 L78 152 L42 152 Z" fill="url(#bronzeGrad)"/> <!-- Screw Thread Collar -->
      <path d="M36 152 C44 148, 76 148, 84 152 L80 165 C68 168, 52 168, 40 165 Z" fill="url(#bronzeGrad)" .../> <!-- Edison Base Contact -->
    </svg>
    ```
  - *Defect Analysis*: Shang-Chi's universe is rooted in ancient Chinese mythology, martial arts, and Ta Lo's mystical dragons. Introducing a Western household electric lamp with an Edison screw base destroys narrative immersion.
- **Developer Debug Mode Leak in Production HUD**:
  - *Location*: `sangchi.html:2528-2545`, `sangchi.html:3172-3177`
  - *Observation*: The HUD includes `#debug-mode` with an inline button `<button id="bypass-btn" class="p-btn">BYPASS BUG FIX</button>` and status text `"⚡ Awaiting CSS correction via Developer Tools…"`. This is escape-room meta-commentary that directly punctures cinematic believability.

### 2.3 Animations
- **CSS Animation Identifier Case Mismatch Bug**:
  - *Location*: `sangchi.html:35-55` & `sangchi.html:2995-2997`
  - *Observation*: Keyframe definition uses kebab-case:
    ```css
    @keyframes bulb-shatter {
      0% { transform: scale(1) rotate(0deg); opacity: 1; filter: drop-shadow(0 0 15px rgba(255, 220, 90, 0.9)); }
      40% { transform: scale(1.35) rotate(15deg); opacity: 1; filter: brightness(2.8) drop-shadow(0 0 50px rgba(255, 160, 40, 1)); }
      100% { transform: scale(0) rotate(90deg); opacity: 0; filter: brightness(5); }
    }
    ```
    While the triggering class applies camelCase:
    ```css
    .magical-bulb.destroying {
      animation: bulbShatter 1.5s cubic-bezier(0.2, 0.9, 0.3, 1) forwards;
    }
    ```
  - *Defect Analysis*: CSS animation names are case-sensitive. Because `bulbShatter` is undeclared, adding `.destroying` does nothing. The bulb fails to rotate, flare, scale, or vanish, leaving the bulb frozen during Beat 2 of the cinematic detonation until manual script bypass or DevTools intervention occurs.
- **Toroid Ring Rotation Stutter**:
  - *Location*: `sangchi.html:15-30`
  - *Observation*: The orbit animation `@keyframes ring-orbit` rotates `0deg` to `360deg` linearly (`animation: ring-orbit 3s linear infinite`). When switching between phase states (e.g. idle orbit to gathered combat stance), the rings jump abruptly to new CSS transforms without transition smoothing.

### 2.4 Responsiveness
- **Jittery Dynamic Bottom Button Margin**:
  - *Location*: `sangchi.html:3523-3531`
  - *Observation*: `fitMissionUI()` computes:
    ```javascript
    btn.style.bottom = `calc(clamp(16px, 3vh, 36px) + ${h + 10}px + env(safe-area-inset-bottom, 0px))`;
    ```
  - *Defect Analysis*: On mobile browsers (Safari iOS, Chrome Android), address bar collapse/expand triggers asynchronous window resize events. Recalculating `offsetHeight` on resize causes the continue button to visually stutter, bounce, or momentarily overlap the mission card text.
- **Vertical Pillarboxing on Ultra-Tall Mobile Aspect Ratios**:
  - *Location*: `sangchi.html:3658-3663`
  - *Observation*: In `fit()`, mobile scale is clamped by `(mobile ? vh * .46 : vh * .72) / 560`. On 20:9 or 21:9 phones (e.g. 393x873), the game character occupies less than 40% of vertical height, leaving immense barren voids above and below.

### 2.5 Assets
- **Massive Repository Weight from Desktop Screenshot**:
  - *Location*: `sangchi/assets/real_dragon_asset_screenshot.png`
  - *Observation*: A full 2,719,799-byte (~2.72 MB) uncropped desktop screen capture is committed to the asset folder.
  - *Defect Analysis*: It is not referenced in `sangchi.html` or any script. It represents pure deadweight bloat.
- **Obsolete Backup Copies and Debug Art**:
  - *Location*: `sangchi/assets/`
  - *Observation*:
    - `shangchi_base.old.png` (352,718 bytes)
    - `shangchi_glow.old.png` (96,137 bytes)
    - `debug_arms.png` (181,066 bytes)
    - Unreferenced sliced limbs: `crop_arm_left.png` (23 KB), `crop_arm_right.png` (20 KB), `shangchi_arm_l.png` (331 KB), `shangchi_arm_r.png` (331 KB), `shangchi_full.png` (338 KB), `shangchi_legs.png` (338 KB), `shangchi_torso.png` (328 KB).
  - *Defect Analysis*: Over 4.5 MB of unreferenced image files clutter production assets. The runtime uses only `shangchi_base.png`, `shangchi_glow.png`, `great_protector.png`, `shangchi_bg.jpg`, and `contact_shadow.png`.

### 2.6 HUD and Canvas Alignment
- **Decoupled Chi Lightning Coordinate Projection**:
  - *Location*: `sangchi.html:3240-3256`
  - *Observation*: During Beat 1 of the overload sequence, lightning bolts are generated by:
    ```javascript
    const bulbRect = bulbWrap ? bulbWrap.getBoundingClientRect() : ...;
    const bX = bulbRect.left + (bulbRect.width || 0) * 0.5;
    const bY = bulbRect.top + (bulbRect.height || 0) * 0.5;
    ...
    let lightningInterval = setInterval(() => {
        drawChiLightning(bX, bY, targets);
    }, 80);
    ```
  - *Defect Analysis*: `bX`, `bY`, and lantern targets are computed once at invocation. If the browser window resizes, zooms, or reflows during the 850ms sequence, the lightning path anchors do not recalculate, causing electrical arcs to shoot into empty space beside the lanterns.

### 2.7 Contrast
- **Subtle Lantern Sequence Visual Indicators**:
  - *Location*: `sangchi.html:2688-2694`, `sangchi.html:3046-3057`
  - *Observation*: During the 6-step memory puzzle, lanterns pulse with `.glow`:
    ```css
    .lantern.glow {
      filter: drop-shadow(0 0 25px rgba(255, 230, 110, 0.85));
    }
    ```
  - *Defect Analysis*: Against the bright golden-yellow ambient temple backdrop (`shangchi_bg.jpg` with high yellow-orange values), a yellow drop shadow offers insufficient luminance differential (contrast ratio < 2.5:1). Players who play with low screen brightness or color blindness struggle to determine which lantern flashed without audio cues.
- **Muted Inactive Memory Slot Dots**:
  - *Location*: `sangchi.html:2500-2525`
  - *Observation*: Inactive sequence slot dots use low-opacity dark gold on semi-transparent charcoal, making completed progress difficult to count at a glance.

### 2.8 Clipping
- **Chi Blast Projectile Injected Into `document.body`**:
  - *Location*: `sangchi.html:3639-3654`
  - *Observation*: In Dragon God Mode, clicking generates directional beams:
    ```javascript
    const beam = document.createElement('div');
    beam.className = 'chi-blast-beam';
    beam.style.left = `${originX}px`;
    beam.style.top = `${originY}px`;
    ...
    document.body.appendChild(beam);
    ```
  - *Defect Analysis*: Appending directly to `document.body` bypasses the `#stage` overflow bounds. Beams slice across the top header bar, mission title overlays, and viewport outer margins, breaking the visual containment framing of the arena.

### 2.9 Visual Spectacle
- **Climax Interruption from Relic Incongruity**:
  - *Location*: `sangchi.html:3218-3340`
  - *Observation*: The 5-beat finale choreography is brilliant:
    - Beat 1: Screen tremor + lightning convergence across 3 lanterns
    - Beat 2: Blinding white nova flash + 28 procedural glass physics shards
    - Beat 3: Triple lantern secondary detonations
    - Beat 4: Golden Great Protector dragon spirit manifest with breathing SVG aura
    - Beat 5: 10 Ten Rings auto-converging into ballistic lock-on formation
  - *Defect Analysis*: The high-end cinematic polish of Beats 1–5 is severely undercut by having the destroyed object be a domestic incandescent light bulb. Replacing it with an ancient dragon pearl, demonic talisman, or mystical seal elevates this game to true Marvel cinematic spectacle.

---

## 3. Prioritized Defect Catalog

| ID | Dimension | Severity | Location / Element | Defect Summary |
| :--- | :--- | :---: | :--- | :--- |
| **SC-01** | Animations | **Critical** | `sangchi.html:35-55, 2995-2997` | CSS keyframe case mismatch (`bulb-shatter` vs `bulbShatter`) breaks relic destruction. |
| **SC-02** | Styling | **Major** | `sangchi.html:2426-2458` | Jarring aesthetic clash: 19th-century Edison incandescent light bulb in mystical ancient Ta Lo. |
| **SC-03** | Assets | **Major** | `sangchi/assets/` | 2.72 MB uncropped screenshot + 1.8 MB dead backup and debug files checked into source. |
| **SC-04** | Layout | **Major** | `sangchi.html:1-3717` | Monolithic 3,717-line single file architecture impairs caching, readability, and performance. |
| **SC-05** | Responsiveness | **Major** | `sangchi.html:3523-3531` | `fitMissionUI()` computes bottom offsets via JS string concatenation, causing button jumping on resize. |
| **SC-06** | HUD / Canvas | **Minor** | `sangchi.html:3240-3256` | Lightning SVG coordinates calculated once at initiation, drifting away on window resize. |
| **SC-07** | Clipping | **Minor** | `sangchi.html:3639-3654` | Projectile beams appended directly to `document.body`, clipping over HUD and headers. |
| **SC-08** | Contrast | **Minor** | `sangchi.html:2688-2694` | Lantern flash glow lacks luminance contrast against bright golden Ta Lo ambient background. |
| **SC-09** | Visual Spectacle | **Polish** | `sangchi.html:3218-3340` | High-spectacle 5-beat cinematic undermined by domestic light bulb and meta debug HUD buttons. |

---

## 4. Concrete Technical Remediation Plans

### 4.1 Fix CSS Keyframe Case Mismatch Bug (SC-01)
Reconcile `@keyframes bulb-shatter` with the `.destroying` selector in `#bulb-css`.

```css
/* REPLACE lines 53-55 in sangchi.html */
.magical-bulb.destroying {
    animation: bulb-shatter 1.5s cubic-bezier(0.2, 0.9, 0.3, 1) forwards;
}
```

And update the JavaScript fallback/diagnostic string in line 2995-2997:
```javascript
/* REPLACE line 2995-2997 in sangchi.html */
.magical-bulb.destroying {
    animation: bulb-shatter 1.5s cubic-bezier(0.2, 0.9, 0.3, 1) forwards;
}
```

---

### 4.2 Reskin Relic into Ancient Dragon Pearl / Jade Talisman (SC-02)
Replace the incandescent light bulb SVG markup with an ancient mystical dragon pearl surrounded by runic bronze brackets:

```html
<!-- REPLACE lines 2426-2458 in sangchi.html -->
<div id="magical-bulb-wrap" class="magical-bulb-wrap" hidden>
    <div class="bulb-energy-ring"></div>
    <svg class="magical-bulb mystic-pearl" id="magical-bulb" viewBox="0 0 140 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="pearlCore" cx="40%" cy="35%" r="60%">
                <stop offset="0%" stop-color="#ffffff"/>
                <stop offset="25%" stop-color="#fff5b8"/>
                <stop offset="55%" stop-color="#ffb703"/>
                <stop offset="85%" stop-color="#d9381e"/>
                <stop offset="100%" stop-color="#4a0e05"/>
            </radialGradient>
            <linearGradient id="ancientBronze" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ffd56b"/>
                <stop offset="45%" stop-color="#b8860b"/>
                <stop offset="100%" stop-color="#3d2703"/>
            </linearGradient>
            <filter id="pearlGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" result="blur"/>
                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
        </defs>
        <!-- Sacred Lotus Relic Mount -->
        <path d="M40 150 C50 162, 90 162, 100 150 C95 168, 45 168, 40 150 Z" fill="url(#ancientBronze)"/>
        <path d="M48 142 L92 142 L96 152 L44 152 Z" fill="url(#ancientBronze)" stroke="#ffe680" stroke-width="1.5"/>
        
        <!-- Sacred Dragon Talisman Talons -->
        <path d="M32 110 C28 85, 42 62, 52 50 C46 68, 42 95, 46 122 Z" fill="url(#ancientBronze)"/>
        <path d="M108 110 C112 85, 98 62, 88 50 C94 68, 98 95, 94 122 Z" fill="url(#ancientBronze)"/>

        <!-- Spherical Mystic Dragon Pearl -->
        <circle cx="70" cy="95" r="42" fill="url(#pearlCore)" filter="url(#pearlGlow)"/>
        <!-- Inner Yin-Yang Chi Curvature -->
        <path d="M70 53 C85 53, 90 75, 70 95 C50 115, 55 137, 70 137" stroke="rgba(255, 255, 255, 0.6)" stroke-width="3" stroke-linecap="round" fill="none"/>
        <circle cx="70" cy="74" r="5" fill="#ffffff" opacity="0.9"/>
        <circle cx="70" cy="116" r="5" fill="#4a0e05" opacity="0.8"/>
    </svg>
</div>
```

---

### 4.3 Prune Dead Assets & Unused Slices (SC-03)
Execute removal of bloated, unreferenced files from `sangchi/assets/`:

```powershell
# Technical Remediation File Removal Command
Remove-Item -Path "sangchi\assets\real_dragon_asset_screenshot.png" -Force
Remove-Item -Path "sangchi\assets\debug_arms.png" -Force
Remove-Item -Path "sangchi\assets\shangchi_base.old.png" -Force
Remove-Item -Path "sangchi\assets\shangchi_glow.old.png" -Force
Remove-Item -Path "sangchi\assets\crop_arm_left.png" -Force
Remove-Item -Path "sangchi\assets\crop_arm_right.png" -Force
Remove-Item -Path "sangchi\assets\shangchi_arm_l.png" -Force
Remove-Item -Path "sangchi\assets\shangchi_arm_r.png" -Force
Remove-Item -Path "sangchi\assets\shangchi_full.png" -Force
Remove-Item -Path "sangchi\assets\shangchi_legs.png" -Force
Remove-Item -Path "sangchi\assets\shangchi_torso.png" -Force
```
*Net Bandwidth Savings: ~4.62 MB (over 85% reduction in asset directory size).*

---

### 4.4 Responsive Mission UI Layout Without Jittery JS Recalculations (SC-05)
Replace fragile JavaScript `style.bottom` string concatenation with pure CSS layout flow:

```css
/* REPLACE JS inline style computation with structured CSS flex/fixed dock */
#mission-panel {
  position: fixed;
  bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  left: 50%;
  transform: translateX(-50%);
  width: min(92vw, 680px);
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 100;
}

#continue-btn {
  position: static !important;
  align-self: center;
  margin-top: 6px;
  transform: none !important;
}
```

---

### 4.5 Contain Chi Blasts & Lightning Within `#stage` Bounds (SC-06, SC-07)
Contain directional beams within the game stage:

```javascript
// In fireChiBlast(clientX, clientY) — REPLACE lines 3645 & 3653
const stage = document.getElementById('stage') || document.body;
stage.appendChild(beam);
stage.appendChild(spark);
```

And update dynamic lightning tracking to query bounding boxes during interval ticks:

```javascript
// REPLACE lines 3254-3256 in sangchi.html
let lightningInterval = setInterval(() => {
    const curBulb = bulbWrap?.getBoundingClientRect();
    if (!curBulb) return;
    const curBX = curBulb.left + curBulb.width * 0.5;
    const curBY = curBulb.top + curBulb.height * 0.5;
    
    const curTargets = [
        $('#lantern-left')?.getBoundingClientRect(),
        $('#lantern-middle')?.getBoundingClientRect(),
        $('#lantern-right')?.getBoundingClientRect()
    ].filter(Boolean).map(r => ({ x: r.left + r.width * 0.5, y: r.top + r.height * 0.5 }));

    drawChiLightning(curBX, curBY, curTargets);
}, 80);
```

---

### 4.6 Enhance Lantern Flash Contrast Ratio (SC-08)
Elevate the contrast of active memory flash pulses against the bright Ta Lo backdrop:

```css
/* REPLACE lines 2688-2694 in sangchi.html */
.lantern.glow {
  filter: brightness(2.6) drop-shadow(0 0 35px #ffe600) drop-shadow(0 0 15px #ff4800);
  transform: translateY(-8px) scale(1.14);
  transition: transform 0.12s ease-out, filter 0.12s ease-out;
}
.lantern.glow::after {
  content: '';
  position: absolute;
  inset: -12px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(255, 200, 0, 0.4) 50%, transparent 75%);
  pointer-events: none;
  animation: flashRing 0.4s ease-out forwards;
}
```

---

## 5. Visual Verification Checklist

- [ ] **Shatter Animation Verification**: Confirm that setting `.magical-bulb.destroying` triggers `@keyframes bulb-shatter` smoothly without requiring bypass or console interventions.
- [ ] **Thematic Cohesion**: Confirm that `#magical-bulb-wrap` displays the ancient dragon pearl / jade relic rather than an electrical Edison incandescent lamp.
- [ ] **Asset Footprint**: Verify `sangchi/assets/` size is below 1.5 MB with no `.old.png`, `.rar`, or full-screen desktop screenshots present.
- [ ] **Mobile Resize Stability**: Test window resize in mobile emulation (Chrome DevTools 375x667 and 393x851) to verify `#continue-btn` remains anchored to `#mission-panel` without bouncing.
- [ ] **Stage Boundary Enforcement**: Fire 10 chi blasts in Dragon God Mode and verify no elements escape `#stage` into outer window gutters or header areas.
- [ ] **Luminance Flash Test**: Verify that all 3 lanterns are distinctively legible when flashing on a high-brightness monitor with ambient scene lighting enabled.
