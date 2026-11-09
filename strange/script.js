/* ============================================================
   DOCTOR STRANGE: THE THREE LOST RELICS
   Massive Cinematic VFX, Fast Scene Transitions & Grand Artifacts
   ============================================================ */

(function () {
  'use strict';

  // ------------------------------------------------------------
  // GAME CONFIGURATION & RELIC DEFINITIONS
  // ------------------------------------------------------------
  const CONFIG = {
    timelineDuration: 10.0, // Exactly 10.0s timeline duration
    sceneTransitionDelay: 1000, // Reduced to 1.0s as requested ("reduce seen time to 1s")
    toastDuration: 1000, // 1.0s quick celebration
    relics: [
      {
        id: 'crystal',
        name: 'RELIC 1: THE ANCIENT VASE',
        elementName: 'TIME CRYSTAL',
        color: '#00ff88',
        windowMin: 0.485,
        windowMax: 0.515, // Exactly 0.3s window (0.03 * 10s)
        bgImage: 'assets/backgrounds/vault_kamar_taj.jpg',
        relicElId: 'relic-vase',
        collectibleId: 'collectible-crystal',
        slotId: 'slot-crystal',
        slotClass: 'slot-crystal-secured',
        toastTitle: 'TIME CRYSTAL COLLECTED',
        toastDesc: 'The emerald essence of Agamotto resonates within you.'
      },
      {
        id: 'gear',
        name: 'RELIC 2: THE MAGICAL CLOCK',
        elementName: 'ETERNITY GEAR',
        color: '#f5c452',
        windowMin: 0.485,
        windowMax: 0.515, // Exactly 0.3s window (0.03 * 10s)
        bgImage: 'assets/backgrounds/clock_tower.jpg',
        relicElId: 'relic-clock',
        collectibleId: 'collectible-gear',
        slotId: 'slot-gear',
        slotClass: 'slot-gear-secured',
        toastTitle: 'ETERNITY GEAR COLLECTED',
        toastDesc: 'The celestial clockwork of the cosmos stabilizes in your grasp.'
      },
      {
        id: 'core',
        name: 'RELIC 3: THE COSMIC ORB',
        elementName: 'COSMIC CORE',
        color: '#c540ff',
        windowMin: 0.485,
        windowMax: 0.515, // Exactly 0.3s window (0.03 * 10s)
        bgImage: 'assets/backgrounds/cosmic_rift.jpg',
        relicElId: 'relic-orb',
        collectibleId: 'collectible-core',
        slotId: 'slot-core',
        slotClass: 'slot-core-secured',
        toastTitle: 'COSMIC CORE COLLECTED',
        toastDesc: 'Pure multidimensional astral energy hums in unison.'
      }
    ]
  };

  // ------------------------------------------------------------
  // ENGINE STATE
  // ------------------------------------------------------------
  const state = {
    phase: 'INTRO', // INTRO | RELIC_1 | RELIC_2 | RELIC_3 | FINALE | VICTORY
    currentRelicIndex: 0,
    t: 1.0, // normalized timeline 0.0 (past/intact) to 1.0 (present/shattered)
    isReversing: false,
    isForwarding: false,
    isPaused: true,
    collected: {
      crystal: false,
      gear: false,
      core: false
    },
    collectedCount: 0,
    lastTime: performance.now(),
    relicTransitioning: false,
    screenShakeTimer: 0,
    hitStopUntil: 0,
    motionTime: 0
  };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Expose on window for inspection & testing
  window.__gameState = state;

  // ------------------------------------------------------------
  // DOM REFERENCES
  // ------------------------------------------------------------
  const DOM = {
    viewport: document.getElementById('game-viewport'),
    bgFar: document.getElementById('bg-far'),
    bgRestored: document.getElementById('bg-restored'),
    riftOverlay: document.getElementById('reality-rift-overlay'),
    fxCanvas: document.getElementById('fx-canvas'),
    strangeRig: document.getElementById('strange-rig'),
    relicStage: document.getElementById('relic-stage'),
    activeRelicName: document.getElementById('active-relic-name'),
    timelineTrack: document.getElementById('timeline-track'),
    timelineHead: document.getElementById('timeline-head'),
    timelineWindowZone: document.getElementById('timeline-window-zone'),
    timeStateLabel: document.getElementById('time-state-label'),
    eyeIris: document.getElementById('eye-iris'),
    exposureAlert: document.getElementById('exposure-alert'),
    progressText: document.getElementById('progress-text'),
    keyQ: document.getElementById('key-q'),
    keyE: document.getElementById('key-e'),
    keyPause: document.getElementById('key-pause'),
    storyModal: document.getElementById('story-modal'),
    modalContinueBtn: document.getElementById('modal-continue-btn'),
    finaleCheckpoint: document.getElementById('finale-checkpoint'),
    finaleContinueBtn: document.getElementById('solve-bug-continue-btn'),
    bugWindowToggle: document.getElementById('bug-window-toggle'),
    bugWindow: document.getElementById('bug-window'),
    solveBugBtn: document.getElementById('solve-bug-btn'),
    relicToast: document.getElementById('relic-toast'),
    toastIcon: document.getElementById('toast-icon'),
    toastTitle: document.getElementById('toast-title'),
    toastDesc: document.getElementById('toast-desc'),
    victoryModal: document.getElementById('victory-modal'),
    btnReplay: document.getElementById('btn-replay'),
    // Relic containers
    relicVase: document.getElementById('relic-vase'),
    relicClock: document.getElementById('relic-clock'),
    relicOrb: document.getElementById('relic-orb'),
    relicFinaleAltar: document.getElementById('relic-finale-altar')
  };

  // ------------------------------------------------------------
  // MASSIVE & SPECTACULAR PARTICLE & SHADER SYSTEM (Canvas 2D)
  // ------------------------------------------------------------
  const fx = {
    ctx: DOM.fxCanvas.getContext('2d'),
    width: 0,
    height: 0,
    particles: [],
    shockwaves: [],
    lightningArcs: [],
    beams: [],

    init() {
      this.resize();
      window.addEventListener('resize', () => this.resize());
    },

    resize() {
      const rect = DOM.viewport.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      this.width = rect.width;
      this.height = rect.height;
      DOM.fxCanvas.width = Math.round(rect.width * dpr);
      DOM.fxCanvas.height = Math.round(rect.height * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },

    // Massive stream of temporal particles mapped to Strange's hands and Eye of Agamotto
    spawnTimeParticles(direction, color) {
      const strangeRect = DOM.strangeRig.getBoundingClientRect();
      const viewRect = DOM.viewport.getBoundingClientRect();

      // Precision mapping to Doctor Strange's hero anatomy:
      // 1. Eye of Agamotto on chest (55.2%, 31.3%)
      const eyeX = (strangeRect.left + strangeRect.width * 0.552) - viewRect.left;
      const eyeY = (strangeRect.top + strangeRect.height * 0.313) - viewRect.top;

      // 2. Right forward casting palm (30.2%, 44.8%)
      const rightHandX = (strangeRect.left + strangeRect.width * 0.302) - viewRect.left;
      const rightHandY = (strangeRect.top + strangeRect.height * 0.448) - viewRect.top;

      // 3. Left raised sling-ring mudra (69.8%, 13.8%)
      const leftHandX = (strangeRect.left + strangeRect.width * 0.698) - viewRect.left;
      const leftHandY = (strangeRect.top + strangeRect.height * 0.138) - viewRect.top;

      const relicRect = DOM.relicStage.getBoundingClientRect();
      const targetX = (relicRect.left + relicRect.width * 0.5) - viewRect.left;
      const targetY = (relicRect.top + relicRect.height * 0.45) - viewRect.top;

      const origins = [
        { x: eyeX, y: eyeY },
        { x: rightHandX, y: rightHandY },
        { x: leftHandX, y: leftHandY }
      ];

      // Controlled streams keep the action legible and the canvas lightweight.
      const count = reducedMotion ? 1 : 3;
      if (this.particles.length > 260) this.particles.splice(0, this.particles.length - 220);
      for (let k = 0; k < count; k++) {
        const randOrig = origins[Math.floor(Math.random() * origins.length)];
        const fromX = direction < 0 ? targetX + (Math.random() - 0.5) * 120 : randOrig.x;
        const fromY = direction < 0 ? targetY + (Math.random() - 0.5) * 120 : randOrig.y;
        const toX = direction < 0 ? randOrig.x : targetX + (Math.random() - 0.5) * 120;
        const toY = direction < 0 ? randOrig.y : targetY + (Math.random() - 0.5) * 120;

        this.particles.push({
          x: fromX,
          y: fromY,
          startX: fromX,
          startY: fromY,
          targetX: toX,
          targetY: toY,
          progress: 0,
          speed: 0.022 + Math.random() * 0.014,
          size: 2.8 + Math.random() * 3.4,
          color: color || '#00ff88',
          curve: (Math.random() - 0.5) * 180,
          phase: Math.random() * Math.PI * 2,
          tail: []
        });
      }

      // Keep crackling arcs close to the relic impact so the main magic reads as a beam.
      if (!reducedMotion && Math.random() < 0.09 && this.lightningArcs.length < 5) {
        this.lightningArcs.push({
          x1: targetX + (Math.random() - 0.5) * 100,
          y1: targetY + (Math.random() - 0.5) * 100,
          x2: targetX + (Math.random() - 0.5) * 190,
          y2: targetY + (Math.random() - 0.5) * 190,
          color: color || '#00ff88',
          life: 18,
          seed: Math.random() * Math.PI * 2
        });
      }
    },

    // Massive Nova Shockwave Burst on Element Collection
    spawnNovaShockwave(x, y, color) {
      const ringCount = reducedMotion ? 1 : 4;
      for (let ring = 0; ring < ringCount; ring++) {
        this.shockwaves.push({ x, y, radius: 8 + ring * 14, maxRadius: 300 + ring * 65, color, alpha: 0.96 - ring * 0.15, lineWidth: ring ? 3.4 : 10, speed: 7.2 - ring * 0.65, delay: ring * 6 });
      }

      // 2. Exploding sparks
      for (let i = 0; i < (reducedMotion ? 10 : 64); i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 3.2 + Math.random() * 8.8;
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          isRadial: true,
          size: 2 + Math.random() * 4.6,
          color: color,
          alpha: 1.0,
          decay: 0.012 + Math.random() * 0.012,
          drag: 0.976
        });
      }

      const tracker = DOM.progressText.getBoundingClientRect();
      const viewport = DOM.viewport.getBoundingClientRect();
      const targetX = tracker.left + tracker.width * 0.5 - viewport.left;
      const targetY = tracker.top + tracker.height * 0.5 - viewport.top;
      for (let i = 0; i < (reducedMotion ? 2 : 18); i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 35 + Math.random() * 90;
        this.particles.push({ x: x + Math.cos(angle) * radius, y: y + Math.sin(angle) * radius, startX: x + Math.cos(angle) * radius, startY: y + Math.sin(angle) * radius, targetX, targetY, progress: 0, speed: 0.022 + Math.random() * 0.014, curve: (Math.random() - 0.5) * 80, size: 2 + Math.random() * 2.5, color, isPull: true, phase: Math.random() * Math.PI * 2 });
      }

      state.screenShakeTimer = reducedMotion ? 0 : 8;
      state.hitStopUntil = performance.now() + (reducedMotion ? 0 : 90);
    },

    updateAndRender() {
        this.ctx.clearRect(0, 0, this.width, this.height);

      const strangeRect = DOM.strangeRig.getBoundingClientRect();
      const viewRect = DOM.viewport.getBoundingClientRect();

      // Precision mapping to Doctor Strange's hero anatomy:
      const eyeX = (strangeRect.left + strangeRect.width * 0.552) - viewRect.left;
      const eyeY = (strangeRect.top + strangeRect.height * 0.313) - viewRect.top;

      const rightHandX = (strangeRect.left + strangeRect.width * 0.302) - viewRect.left;
      const rightHandY = (strangeRect.top + strangeRect.height * 0.448) - viewRect.top;

      const leftHandX = (strangeRect.left + strangeRect.width * 0.698) - viewRect.left;
      const leftHandY = (strangeRect.top + strangeRect.height * 0.138) - viewRect.top;

      const relicRect = DOM.relicStage.getBoundingClientRect();
      const targetX = (relicRect.left + relicRect.width * 0.5) - viewRect.left;
      const targetY = (relicRect.top + relicRect.height * 0.45) - viewRect.top;

      // Draw a broad, curved mana beam between Strange's palm and the active relic.
      if (state.isReversing || state.isForwarding) {
        const beamColor = state.isReversing ? '#00ff88' : '#f5c452';
        const pulse = reducedMotion ? 1 : 0.78 + 0.22 * Math.sin(state.motionTime * 7);
        const x0 = rightHandX;
        const y0 = rightHandY;
        const c1x = rightHandX + 135;
        const c1y = rightHandY - 145;
        const c2x = targetX - 185;
        const c2y = targetY + 115;
        const x1 = targetX;
        const y1 = targetY;
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'lighter';
        const drawBeamBody = (startWidth, endWidth, alpha, stops, blur) => {
          const left = [];
          const right = [];
          const steps = 28;
          for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const inv = 1 - t;
            const x = inv ** 3 * x0 + 3 * inv ** 2 * t * c1x + 3 * inv * t ** 2 * c2x + t ** 3 * x1;
            const y = inv ** 3 * y0 + 3 * inv ** 2 * t * c1y + 3 * inv * t ** 2 * c2y + t ** 3 * y1;
            const dx = 3 * inv ** 2 * (c1x - x0) + 6 * inv * t * (c2x - c1x) + 3 * t ** 2 * (x1 - c2x);
            const dy = 3 * inv ** 2 * (c1y - y0) + 6 * inv * t * (c2y - c1y) + 3 * t ** 2 * (y1 - c2y);
            const length = Math.max(1, Math.hypot(dx, dy));
            const width = startWidth + endWidth * Math.pow(Math.max(0, Math.sin(t * Math.PI)), 0.72);
            const nx = -dy / length * width * 0.5;
            const ny = dx / length * width * 0.5;
            left.push([x + nx, y + ny]);
            right.push([x - nx, y - ny]);
          }
          this.ctx.beginPath();
          this.ctx.moveTo(left[0][0], left[0][1]);
          for (let i = 1; i < left.length; i++) this.ctx.lineTo(left[i][0], left[i][1]);
          for (let i = right.length - 1; i >= 0; i--) this.ctx.lineTo(right[i][0], right[i][1]);
          this.ctx.closePath();
          const gradient = this.ctx.createLinearGradient(x0, y0, x1, y1);
          for (const [position, color] of stops) gradient.addColorStop(position, color);
          this.ctx.fillStyle = gradient;
          this.ctx.shadowColor = beamColor;
          this.ctx.shadowBlur = blur;
          this.ctx.globalAlpha = alpha * pulse;
          this.ctx.fill();
        };
        drawBeamBody(5.76, 53.28, 0.25, [[0, 'rgba(255,255,255,.05)'], [.12, beamColor], [.68, beamColor], [1, 'rgba(255,255,255,.18)']], 31);
        drawBeamBody(3.24, 34.56, 0.5, [[0, 'rgba(255,255,255,.16)'], [.22, beamColor], [.8, beamColor], [1, '#eaffff']], 19);
        drawBeamBody(1.44, 12.24, 0.78, [[0, 'rgba(255,255,255,.65)'], [.2, '#eaffff'], [.78, '#eaffff'], [1, 'rgba(255,255,255,.95)']], 11);

        // A broad moving surge travels inside the beam body and lights its destination.
        const t = (state.motionTime * 0.34) % 1;
        const inv = 1 - t;
        const mx = inv ** 3 * x0 + 3 * inv ** 2 * t * c1x + 3 * inv * t ** 2 * c2x + t ** 3 * x1;
        const my = inv ** 3 * y0 + 3 * inv ** 2 * t * c1y + 3 * inv * t ** 2 * c2y + t ** 3 * y1;
        const surge = this.ctx.createRadialGradient(mx, my, 2, mx, my, 32);
        surge.addColorStop(0, 'rgba(255,255,255,.95)');
        surge.addColorStop(0.18, beamColor);
        surge.addColorStop(1, 'rgba(255,255,255,0)');
        this.ctx.fillStyle = surge;
        this.ctx.globalAlpha = 0.43;
        this.ctx.fillRect(mx - 32, my - 32, 64, 64);

        const impact = this.ctx.createRadialGradient(targetX, targetY, 2, targetX, targetY, 54);
        impact.addColorStop(0, 'rgba(255,255,255,.92)');
        impact.addColorStop(0.2, beamColor);
        impact.addColorStop(1, 'rgba(255,255,255,0)');
        this.ctx.fillStyle = impact;
        this.ctx.globalAlpha = 0.26 + pulse * 0.09;
        this.ctx.fillRect(targetX - 54, targetY - 54, 108, 108);
        this.ctx.restore();
      }

      // Update & Render Lightning Arcs
      for (let i = this.lightningArcs.length - 1; i >= 0; i--) {
        const arc = this.lightningArcs[i];
        arc.life -= 0.8;
        if (arc.life <= 0) {
          this.lightningArcs.splice(i, 1);
          continue;
        }
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(arc.x1, arc.y1);
        const dx = arc.x2 - arc.x1;
        const dy = arc.y2 - arc.y1;
        const length = Math.max(1, Math.hypot(dx, dy));
        const bend = Math.sin(state.motionTime * 22 + arc.seed) * 24;
        const midX = (arc.x1 + arc.x2) * 0.5 - dy / length * bend;
        const midY = (arc.y1 + arc.y2) * 0.5 + dx / length * bend;
        this.ctx.quadraticCurveTo(midX, midY, arc.x2, arc.y2);
        this.ctx.lineTo(arc.x2, arc.y2);
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.shadowColor = arc.color;
        this.ctx.shadowBlur = 34;
        this.ctx.lineWidth = 4.2;
        this.ctx.globalAlpha = Math.min(1, arc.life / 8);
        this.ctx.stroke();
        this.ctx.restore();
      }

      // Update & Render Shockwaves
      for (let i = this.shockwaves.length - 1; i >= 0; i--) {
        const sw = this.shockwaves[i];
        if (sw.delay > 0) { sw.delay--; continue; }
        sw.radius += sw.speed || 8;
        sw.alpha -= 0.012;
        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          this.shockwaves.splice(i, 1);
          continue;
        }
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = sw.color;
        this.ctx.shadowColor = sw.color;
        this.ctx.shadowBlur = 38;
        this.ctx.lineWidth = sw.lineWidth;
        this.ctx.globalAlpha = sw.alpha;
        this.ctx.stroke();
        this.ctx.restore();
      }

      // Update & Render Particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];

        if (p.isRadial) {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= p.drag || 0.95;
          p.vy *= p.drag || 0.95;
          p.alpha -= p.decay;
          if (p.alpha <= 0) {
            this.particles.splice(i, 1);
            continue;
          }
          this.ctx.save();
          this.ctx.globalCompositeOperation = 'lighter';
          this.ctx.lineCap = 'round';
          this.ctx.beginPath();
          this.ctx.moveTo(p.x - p.vx * 1.8, p.y - p.vy * 1.8);
          this.ctx.lineTo(p.x, p.y);
          this.ctx.strokeStyle = p.color;
          this.ctx.shadowColor = p.color;
          this.ctx.shadowBlur = 26;
          this.ctx.lineWidth = Math.max(1.4, p.size * 0.9);
          this.ctx.globalAlpha = p.alpha * 0.75;
          this.ctx.stroke();
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          this.ctx.fillStyle = p.color;
          this.ctx.shadowColor = p.color;
          this.ctx.shadowBlur = 30;
          this.ctx.globalAlpha = p.alpha;
          this.ctx.fill();
          this.ctx.restore();
          continue;
        }

        p.progress += p.speed;
        if (p.progress >= 1.0) {
          this.particles.splice(i, 1);
          continue;
        }

        const midX = (p.startX + p.targetX) * 0.5;
        const midY = (p.startY + p.targetY) * 0.5 + p.curve;
        const t = p.progress;
        const curX = (1 - t) * (1 - t) * p.startX + 2 * (1 - t) * t * midX + t * t * p.targetX;
        const curY = (1 - t) * (1 - t) * p.startY + 2 * (1 - t) * t * midY + t * t * p.targetY;

        if (p.isPull) {
          this.ctx.save();
          const tailX = curX - (p.targetX - p.startX) * 0.04;
          const tailY = curY - (p.targetY - p.startY) * 0.04;
          this.ctx.globalCompositeOperation = 'lighter';
          this.ctx.beginPath();
          this.ctx.moveTo(tailX, tailY);
          this.ctx.lineTo(curX, curY);
          this.ctx.strokeStyle = p.color;
          this.ctx.lineCap = 'round';
          this.ctx.lineWidth = Math.max(2, p.size * 1.15);
          this.ctx.shadowColor = p.color;
          this.ctx.shadowBlur = 42;
          this.ctx.globalAlpha = Math.sin(t * Math.PI) * 0.8;
          this.ctx.stroke();
          this.ctx.beginPath();
          this.ctx.arc(curX, curY, p.size * (1.65 - t * 0.55), 0, Math.PI * 2);
          this.ctx.fillStyle = p.color;
          this.ctx.shadowColor = p.color;
          this.ctx.shadowBlur = 64;
          this.ctx.globalAlpha = Math.sin(t * Math.PI);
          this.ctx.fill();
          this.ctx.restore();
          continue;
        }

        this.ctx.save();
        const trailX = curX - (p.targetX - p.startX) * 0.018;
        const trailY = curY - (p.targetY - p.startY) * 0.018;
        this.ctx.lineCap = 'round';
        this.ctx.globalCompositeOperation = 'lighter';
        this.ctx.beginPath();
        this.ctx.moveTo(trailX, trailY);
        this.ctx.lineTo(curX, curY);
        this.ctx.fillStyle = p.color;
        this.ctx.strokeStyle = p.color;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 34;
        this.ctx.lineWidth = p.size * 1.8;
        this.ctx.globalAlpha = Math.sin(p.progress * Math.PI);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.arc(curX, curY, p.size * 0.72, 0, Math.PI * 2);
        this.ctx.fillStyle = '#effff9';
        this.ctx.shadowBlur = 18;
        this.ctx.globalAlpha = Math.sin(p.progress * Math.PI) * 0.92;
        this.ctx.fill();
        this.ctx.restore();
      }

      // Render energy beams in finale
      if (this.beams.length > 0) {
        for (const beam of this.beams) {
          this.ctx.save();
          const pulse = 0.72 + 0.28 * Math.sin(this.motionTime * 5 + beam.phase * 6);
          const dx = beam.x2 - beam.x1;
          const dy = beam.y2 - beam.y1;
          const length = Math.max(1, Math.hypot(dx, dy));
          const nx = -dy / length;
          const ny = dx / length;
          const drawBeam = (width, alpha, blur, color) => {
            this.ctx.beginPath();
            this.ctx.moveTo(beam.x1 + nx * width * 0.5, beam.y1 + ny * width * 0.5);
            this.ctx.lineTo(beam.x2 + nx * width * 0.5, beam.y2 + ny * width * 0.5);
            this.ctx.lineTo(beam.x2 - nx * width * 0.5, beam.y2 - ny * width * 0.5);
            this.ctx.lineTo(beam.x1 - nx * width * 0.5, beam.y1 - ny * width * 0.5);
            this.ctx.closePath();
            const gradient = this.ctx.createLinearGradient(beam.x1, beam.y1, beam.x2, beam.y2);
            gradient.addColorStop(0, 'rgba(255,255,255,.18)');
            gradient.addColorStop(0.5, color);
            gradient.addColorStop(1, 'rgba(255,255,255,.8)');
            this.ctx.fillStyle = gradient;
            this.ctx.shadowColor = beam.color;
            this.ctx.shadowBlur = blur;
            this.ctx.globalAlpha = alpha * pulse;
            this.ctx.fill();
          };
          this.ctx.globalCompositeOperation = 'lighter';
          drawBeam(24.48, 0.3, 26, beam.color);
          drawBeam(15.12, 0.56, 15, beam.color);
          drawBeam(6.12, 0.9, 10, '#effff9');

          // Traveling light motes are embedded in each broad triangle side.
          const moteT = (this.motionTime * 0.18 + beam.phase) % 1;
          const mx = beam.x1 + (beam.x2 - beam.x1) * moteT;
          const my = beam.y1 + (beam.y2 - beam.y1) * moteT;
          this.ctx.beginPath();
          this.ctx.arc(mx, my, 8 + pulse * 3, 0, Math.PI * 2);
          this.ctx.fillStyle = '#ffffff';
          this.ctx.shadowColor = beam.color;
          this.ctx.shadowBlur = 12;
          this.ctx.globalAlpha = 0.92;
          this.ctx.fill();
          this.ctx.restore();
        }
      }
    }
  };

  // ------------------------------------------------------------
  // RELIC 1: GRAND ANCIENT VASE SHARDS (280x400 Authentic Cutouts)
  // ------------------------------------------------------------
  const vaseShardsConfig = [
    // 0: Rim / Top Neck - hovers high in window, falls backward when broken
    { expX: 0, expY: -115, expRot: 28, expZ: 70, windowY: -75 },
    // 1: Upper Left Shoulder - floats outward
    { expX: -75, expY: -65, expRot: -38, expZ: 50, windowY: -45 },
    // 2: Upper Right Shoulder - floats outward
    { expX: 75, expY: -60, expRot: 35, expZ: 50, windowY: -45 },
    // 3: Mid Body Left - tilts down onto altar
    { expX: -85, expY: 40, expRot: -48, expZ: 25, windowY: 0 },
    // 4: Mid Body Right - tilts down onto altar
    { expX: 90, expY: 35, expRot: 45, expZ: -25, windowY: 0 },
    // 5: Lower Body Left - slides on altar surface
    { expX: -55, expY: 65, expRot: -22, expZ: 15, windowY: 0 },
    // 6: Lower Body Right - slides on altar surface
    { expX: 60, expY: 65, expRot: 28, expZ: -15, windowY: 0 },
    // 7: Pedestal Foot Base - stays anchored on the altar
    { expX: 0, expY: 18, expRot: 0, expZ: 0, windowY: 0 }
  ];

  function buildVaseShards() {
    const container = document.getElementById('vase-shards');
    container.innerHTML = '';
    vaseShardsConfig.forEach((cfg, idx) => {
      const el = document.createElement('div');
      el.className = 'vase-shard-piece';
      el.id = `v-shard-${idx}`;
      el.style.backgroundImage = `url('assets/relics/vase_grand_shard_${idx}.png')`;
      container.appendChild(el);
    });
  }

  // ------------------------------------------------------------
  // RELIC 2: GRAND MAGICAL CLOCK (360x360 Astronomical Face & Cogs)
  // ------------------------------------------------------------
  const clockCogsConfig = [
    { id: 'cog-large', file: 'clock_cog_large.png', size: 105, x: -45, y: 35, expX: -125, expY: -65, ratio: 1.5 },
    { id: 'cog-med', file: 'clock_cog_med.png', size: 80, x: 275, y: 15, expX: 135, expY: -75, ratio: -2.2 },
    { id: 'cog-small', file: 'clock_cog_small.png', size: 62, x: 285, y: 245, expX: 140, expY: 95, ratio: 3.0 },
    { id: 'cog-pinion', file: 'clock_cog_pinion.png', size: 48, x: -30, y: 235, expX: -115, expY: 90, ratio: -3.8 }
  ];

  function buildClockCogs() {
    const container = document.getElementById('clock-gears');
    container.innerHTML = '';
    clockCogsConfig.forEach((cfg, idx) => {
      const el = document.createElement('div');
      el.className = 'clock-cog-piece';
      el.id = `c-cog-${idx}`;
      el.style.width = cfg.size + 'px';
      el.style.height = cfg.size + 'px';
      el.style.left = cfg.x + 'px';
      el.style.top = cfg.y + 'px';
      el.style.backgroundImage = `url('assets/relics/${cfg.file}')`;
      container.appendChild(el);
    });
  }

  // ------------------------------------------------------------
  // RELIC 3: GRAND COSMIC ORB (Thick Crystal Prism Shell)
  // ------------------------------------------------------------
  const orbFacetsConfig = [
    { angle: 0, distExp: 160, rotExp: 45 },
    { angle: 45, distExp: 165, rotExp: -50 },
    { angle: 90, distExp: 155, rotExp: 60 },
    { angle: 135, distExp: 170, rotExp: -40 },
    { angle: 180, distExp: 160, rotExp: 55 },
    { angle: 225, distExp: 165, rotExp: -65 },
    { angle: 270, distExp: 155, rotExp: 45 },
    { angle: 315, distExp: 170, rotExp: -55 }
  ];

  function buildOrbFacets() {
    const container = document.getElementById('orb-facets');
    container.innerHTML = '';
    orbFacetsConfig.forEach((cfg, idx) => {
      const el = document.createElement('div');
      el.className = 'orb-facet-piece';
      el.id = `o-facet-${idx}`;
      el.style.backgroundImage = `url('assets/relics/orb_grand_prism_${idx}.png')`;
      el.style.left = '55px';
      el.style.top = '55px';
      container.appendChild(el);
    });
  }

  // ------------------------------------------------------------
  // TIMELINE VISUAL INTERPOLATION (0.0 Past -> 1.0 Present)
  // ------------------------------------------------------------
  function updateRelicVisuals(t) {
    const relic = CONFIG.relics[state.currentRelicIndex];
    if (!relic) return;

    // Check if within window
    const inWindow = (t >= relic.windowMin && t <= relic.windowMax);
    const collectible = document.getElementById(relic.collectibleId);

    if (state.collected[relic.id]) {
      if (collectible) {
        collectible.classList.remove('in-window');
        collectible.classList.add('collected');
      }
      DOM.exposureAlert.classList.add('hidden');
      DOM.strangeRig.classList.remove('window-open');
    } else {
      if (collectible) {
        if (inWindow) {
          collectible.classList.add('in-window');
          DOM.exposureAlert.classList.remove('hidden');
          DOM.strangeRig.classList.add('window-open');
        } else {
          collectible.classList.remove('in-window');
          DOM.exposureAlert.classList.add('hidden');
          DOM.strangeRig.classList.remove('window-open');
        }
      }
    }

    const wMin = relic.windowMin;
    const wMax = relic.windowMax;
    const easeInOut = value => value * value * (3 - 2 * value);

    // RELIC 1: GRAND ANCIENT VASE
    if (relic.id === 'crystal') {
      vaseShardsConfig.forEach((cfg, idx) => {
        const el = document.getElementById(`v-shard-${idx}`);
        if (!el) return;

        let curX, curY, curRot, curZ;

        if (t <= wMin) {
          // Deep Past: Fully intact vase!
          curX = 0;
          curY = 0;
          curRot = 0;
          curZ = 0;
        } else if (t <= wMax) {
          // Window: Neck hovers open high, revealing the glowing Time Crystal!
          const wFactor = (t - wMin) / (wMax - wMin);
          const reveal = easeInOut(wFactor);
          curX = cfg.expX * 0.35 * reveal;
          curY = cfg.windowY * (0.6 + reveal * 0.4);
          curRot = cfg.expRot * 0.35 * reveal;
          curZ = cfg.expZ * 0.35 * reveal;
        } else {
          // Destroyed Present: Shards tumbled across the altar table
          const dFactor = easeInOut((t - wMax) / (1.0 - wMax));
          curX = cfg.expX * 0.35 + (cfg.expX - cfg.expX * 0.35) * dFactor;
          curY = cfg.windowY + (cfg.expY - cfg.windowY) * dFactor;
          curRot = cfg.expRot * 0.35 + (cfg.expRot - cfg.expRot * 0.35) * dFactor;
          curZ = cfg.expZ * dFactor;
        }

        el.style.transform = `translate3d(${curX}px, ${curY}px, ${curZ}px) rotate(${curRot}deg)`;
      });
    }

    // RELIC 2: GRAND MAGICAL CLOCK
    else if (relic.id === 'gear') {
      const hourHand = document.querySelector('.hour-hand');
      const minuteHand = document.querySelector('.minute-hand');

      // Hands sweep backwards as time rewinds
      const hourDeg = (t * 720);
      const minDeg = (t * 4320);
      if (hourHand) hourHand.style.transform = `rotate(${hourDeg}deg)`;
      if (minuteHand) minuteHand.style.transform = `rotate(${minDeg}deg)`;

      // Gears rotate in interlocking alternating ratios
      clockCogsConfig.forEach((cfg, idx) => {
        const el = document.getElementById(`c-cog-${idx}`);
        if (!el) return;
        const factor = easeInOut(Math.min(Math.max((t - 0.25) / 0.75, 0), 1));
        const curX = cfg.expX * factor;
        const curY = cfg.expY * factor;
        const curRot = (t * 360 * cfg.ratio);
        el.style.transform = `translate3d(${curX}px, ${curY}px, 0) rotate(${curRot}deg)`;
      });
    }

    // RELIC 3: GRAND COSMIC ORB
    else if (relic.id === 'core') {
      const singularity = document.querySelector('.orb-inner-singularity');
      if (singularity) {
        singularity.style.transform = `scale(${0.9 + (1 - t) * 0.35})`;
      }

      // 8 Prisms: t=0.0 (closed sphere, dist=0) -> window (open lotus, dist=55) -> t=1.0 (scattered, dist=165)
      orbFacetsConfig.forEach((cfg, idx) => {
        const el = document.getElementById(`o-facet-${idx}`);
        if (!el) return;

        let curDist, curRot;
        if (t <= wMin) {
          curDist = 10 * easeInOut(t / wMin);
          curRot = cfg.angle;
        } else if (t <= wMax) {
          const wFactor = easeInOut((t - wMin) / (wMax - wMin));
          curDist = 20 + 40 * wFactor; // open lotus
          curRot = cfg.angle + cfg.rotExp * 0.3 * wFactor;
        } else {
          const dFactor = easeInOut((t - wMax) / (1.0 - wMax));
          curDist = 60 + (cfg.distExp - 60) * dFactor;
          curRot = cfg.angle + cfg.rotExp * 0.3 + (cfg.rotExp - cfg.rotExp * 0.3) * dFactor;
        }

        const rad = (cfg.angle * Math.PI) / 180;
        const curX = Math.cos(rad) * curDist;
        const curY = Math.sin(rad) * curDist;

        el.style.transform = `translate3d(${curX}px, ${curY}px, 0) rotate(${curRot}deg)`;
      });
    }
  }

  // ------------------------------------------------------------
  // TIMELINE TIME LOOP (Q Reverse, E Forward, Pause)
  // ------------------------------------------------------------
  function updateTimeline(deltaTime) {
    if (state.phase === 'INTRO' || state.phase === 'FINALE' || state.phase === 'VICTORY' || state.relicTransitioning) {
      return;
    }

    let rate = 0;
    // Conflict resolution: Q takes priority if both are pressed
    if (state.isReversing) {
      rate = -1.0 / CONFIG.timelineDuration;
    } else if (state.isForwarding) {
      rate = 1.0 / CONFIG.timelineDuration;
    }

    // Update t
    if (rate !== 0) {
      state.t = Math.min(Math.max(state.t + rate * deltaTime, 0.0), 1.0);
      state.isPaused = false;

      // Spawn massive magical particles
      const relic = CONFIG.relics[state.currentRelicIndex];
      fx.spawnTimeParticles(rate, relic ? relic.color : '#00ff88');

      if (!reducedMotion) state.screenShakeTimer = Math.max(state.screenShakeTimer, 1);
    } else {
      state.isPaused = true;
    }

    // Update HUD dial and labels
    DOM.timelineHead.style.left = (state.t * 100) + '%';

    if (state.isReversing) {
      DOM.timeStateLabel.textContent = '<< REVERSING TIME';
      DOM.timeStateLabel.style.color = '#00ff88';
      DOM.eyeIris.style.transform = 'scale(1.35)';
      DOM.eyeIris.style.filter = 'drop-shadow(0 0 20px #00ff88)';
      DOM.strangeRig.classList.add('casting');
      DOM.strangeRig.classList.toggle('casting-reverse', true);
      DOM.strangeRig.classList.toggle('casting-forward', false);
      DOM.keyQ.classList.add('active');
      DOM.keyE.classList.remove('active');
      DOM.keyPause.classList.remove('active');
    } else if (state.isForwarding) {
      DOM.timeStateLabel.textContent = '>> FORWARDING TIME';
      DOM.timeStateLabel.style.color = '#f5c452';
      DOM.eyeIris.style.transform = 'scale(1.15)';
      DOM.eyeIris.style.filter = 'drop-shadow(0 0 20px #f5c452)';
      DOM.strangeRig.classList.add('casting');
      DOM.strangeRig.classList.toggle('casting-forward', true);
      DOM.strangeRig.classList.toggle('casting-reverse', false);
      DOM.keyE.classList.add('active');
      DOM.keyQ.classList.remove('active');
      DOM.keyPause.classList.remove('active');
    } else {
      DOM.timeStateLabel.textContent = '|| TIMELINE FROZEN';
      DOM.timeStateLabel.style.color = '#3df0d5';
      DOM.eyeIris.style.transform = 'scale(1.0)';
      DOM.eyeIris.style.filter = 'none';
      DOM.strangeRig.classList.remove('casting');
      DOM.strangeRig.classList.remove('casting-forward', 'casting-reverse');
      DOM.keyPause.classList.add('active');
      DOM.keyQ.classList.remove('active');
      DOM.keyE.classList.remove('active');
    }

    // Apply visual positions to active relic
    updateRelicVisuals(state.t);
  }

  // ------------------------------------------------------------
  // COLLECTIBLE ELEMENT CLICK HANDLER
  // ------------------------------------------------------------
  function onCollectElement(relicId) {
    if (state.collected[relicId]) return;
    const relic = CONFIG.relics[state.currentRelicIndex];
    if (!relic || relic.id !== relicId) return;

    // Check if within window
    if (state.t < relic.windowMin || state.t > relic.windowMax) {
      return;
    }

    // Mark as collected
    state.collected[relicId] = true;
    state.collectedCount++;
    state.relicTransitioning = true;

    // Trigger Massive Nova Shockwave Burst at element center
    const el = document.getElementById(relic.collectibleId);
    if (el) {
      const rect = el.getBoundingClientRect();
      const vRect = DOM.viewport.getBoundingClientRect();
      const clickX = (rect.left + rect.width * 0.5) - vRect.left;
      const clickY = (rect.top + rect.height * 0.5) - vRect.top;
      const trackerRect = DOM.progressText.getBoundingClientRect();
      el.style.setProperty('--collect-dx', `${trackerRect.left + trackerRect.width * 0.5 - (rect.left + rect.width * 0.5)}px`);
      el.style.setProperty('--collect-dy', `${trackerRect.top + trackerRect.height * 0.5 - (rect.top + rect.height * 0.5)}px`);
      fx.spawnNovaShockwave(clickX, clickY, relic.color);

      el.classList.remove('in-window');
      el.classList.add('collected');
    }
    DOM.exposureAlert.classList.add('hidden');

    // Update HUD Tracker
    DOM.progressText.textContent = `${state.collectedCount} / 3`;
    const slot = document.getElementById(relic.slotId);
    if (slot) {
      slot.setAttribute('data-status', 'secured');
      slot.classList.add(relic.slotClass);
      const statusSpan = slot.querySelector('.slot-status');
      if (statusSpan) statusSpan.textContent = 'SECURED';
    }

    // Show Toast
    showToast(relic.toastTitle, relic.toastDesc, relic.color);

    // Fast scene transition: reduced to 1.0s ("reduce seen time to 1s")
    setTimeout(() => {
      advanceStage();
    }, CONFIG.sceneTransitionDelay);
  }

  function showToast(title, desc, color) {
    DOM.toastTitle.textContent = title;
    DOM.toastDesc.textContent = desc;
    DOM.toastTitle.style.color = color || '#fff';
    DOM.relicToast.classList.remove('hidden');

    setTimeout(() => {
      DOM.relicToast.classList.add('hidden');
    }, CONFIG.toastDuration);
  }

  // ------------------------------------------------------------
  // STAGE TRANSITIONS & ENVIRONMENT SETUP
  // ------------------------------------------------------------
  function switchRelicAssembly(index) {
    [DOM.relicVase, DOM.relicClock, DOM.relicOrb, DOM.relicFinaleAltar].forEach(el => {
      if (el) el.classList.remove('active');
    });

    const relic = CONFIG.relics[index];
    if (!relic) return;

    const activeEl = document.getElementById(relic.relicElId);
    if (activeEl) activeEl.classList.add('active');

    // Update active name in HUD
    DOM.activeRelicName.textContent = relic.name;

    // Update window indicator on scrubber
    DOM.timelineWindowZone.style.left = (relic.windowMin * 100) + '%';
    DOM.timelineWindowZone.style.width = ((relic.windowMax - relic.windowMin) * 100) + '%';
    DOM.timelineWindowZone.style.borderColor = relic.color;
    DOM.timelineWindowZone.style.boxShadow = `0 0 20px ${relic.color}`;

    // Update background
    DOM.bgFar.style.backgroundImage = `url('${relic.bgImage}')`;
    state.t = 1.0; // Reset timeline to destroyed present
    DOM.timelineHead.style.left = '100%';
    updateRelicVisuals(state.t);
    state.relicTransitioning = false;
  }

  function advanceStage() {
    if (state.currentRelicIndex === 0) {
      // Vase -> Clock
      state.currentRelicIndex = 1;
      state.phase = 'RELIC_2';
      switchRelicAssembly(1);
    } else if (state.currentRelicIndex === 1) {
      // Clock -> Orb
      state.currentRelicIndex = 2;
      state.phase = 'RELIC_3';
      switchRelicAssembly(2);
    } else if (state.currentRelicIndex === 2) {
      // Let the player acknowledge the checkpoint before the triangle forms.
      state.phase = 'BUG_PAUSE';
      DOM.finaleCheckpoint.classList.add('open');
      DOM.finaleCheckpoint.setAttribute('aria-hidden', 'false');
      DOM.finaleContinueBtn.focus();
    }
  }

  // ------------------------------------------------------------
  // FINALE SEQUENCE: COMBINE & PROTECT REALITY
  // ------------------------------------------------------------
  function startFinaleSequence() {
    state.relicTransitioning = true;
    DOM.activeRelicName.textContent = 'CENTRAL SANCTUM: REALITY CONVERGENCE';
    DOM.timelineTrack.style.opacity = '0.3';
    DOM.timeStateLabel.textContent = 'TIME MATRIX CONVERGENCE';
    DOM.timeStateLabel.style.color = '#ffd700';

    // 1. Reality collapse environment (Sanctum Chamber tearing apart)
    DOM.bgFar.style.backgroundImage = "url('assets/backgrounds/sanctum_collapsing.jpg')";
    DOM.riftOverlay.style.opacity = '1';

    // 2. Hide other relics, reveal Finale Altar
    [DOM.relicVase, DOM.relicClock, DOM.relicOrb].forEach(el => el.classList.remove('active'));
    DOM.relicFinaleAltar.classList.add('active');

    // Strange takes epic casting pose
    DOM.strangeRig.classList.add('casting');
        state.screenShakeTimer = 30;

    // 3. Fast, spectacular sequential slotting
    setTimeout(() => {
      // Slot 1: Time Crystal
      document.getElementById('socket-1').classList.add('filled');
      showToast('TIME CRYSTAL ENGAGED', 'The emerald pillar stabilizes the northern meridian.', '#00ff88');
      fx.spawnNovaShockwave(fx.width * 0.72, fx.height * 0.35, '#00ff88');
    }, 600);

    setTimeout(() => {
      // Slot 2: Eternity Gear
      document.getElementById('socket-2').classList.add('filled');
      showToast('ETERNITY GEAR ENGAGED', 'The golden axle locks into the cosmic matrix.', '#f5c452');
      fx.spawnNovaShockwave(fx.width * 0.65, fx.height * 0.58, '#f5c452');
    }, 1400);

    setTimeout(() => {
      // Slot 3: Cosmic Core
      document.getElementById('socket-3').classList.add('filled');
      showToast('COSMIC CORE ENGAGED', 'The purple nexus harmonizes dimensional boundaries.', '#c540ff');
      fx.spawnNovaShockwave(fx.width * 0.79, fx.height * 0.58, '#c540ff');
    }, 2200);

    // 4. Tri-color energy convergence beams
    setTimeout(() => {
      setupEnergyBeams();
      DOM.relicFinaleAltar.classList.add('forming');
      showToast('CONVERGENCE ACTIVE', 'The tri-chromatic shield of Agamotto ignites!', '#3df0d5');
      state.screenShakeTimer = reducedMotion ? 0 : 12;
    }, 2900);

    // 5. Giant shield expansion & reality restoration
    setTimeout(() => {
      const shield = document.querySelector('.barrier-generator');
      if (shield) shield.classList.add('expanding');

      // Sanctum Restored background crossfades in
      DOM.bgFar.style.backgroundImage = "url('assets/backgrounds/sanctum_restored.jpg')";
      DOM.riftOverlay.style.opacity = '0';
      DOM.strangeRig.classList.remove('casting');
    }, 4200);

    // 6. Victory screen modal
    setTimeout(() => {
      fx.beams = [];
      DOM.victoryModal.classList.remove('hidden');
      state.phase = 'VICTORY';
    }, 6200);
  }

  function setupEnergyBeams() {
    const s1 = document.getElementById('socket-1').getBoundingClientRect();
    const s2 = document.getElementById('socket-2').getBoundingClientRect();
    const s3 = document.getElementById('socket-3').getBoundingClientRect();
    const vRect = DOM.viewport.getBoundingClientRect();

    const p1 = { x: s1.left + s1.width * 0.5 - vRect.left, y: s1.top + s1.height * 0.5 - vRect.top };
    const p2 = { x: s2.left + s2.width * 0.5 - vRect.left, y: s2.top + s2.height * 0.5 - vRect.top };
    const p3 = { x: s3.left + s3.width * 0.5 - vRect.left, y: s3.top + s3.height * 0.5 - vRect.top };

    fx.beams = [
      { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, color: '#00ff88', phase: 0 },
      { x1: p2.x, y1: p2.y, x2: p3.x, y2: p3.y, color: '#f5c452', phase: 0.34 },
      { x1: p3.x, y1: p3.y, x2: p1.x, y2: p1.y, color: '#c540ff', phase: 0.67 }
    ];
  }

  // ------------------------------------------------------------
  // INPUT HANDLING (Desktop Q / E / Space / Click / Scrubber Scrub)
  // ------------------------------------------------------------
  function initInput() {
    window.addEventListener('keydown', (e) => {
      // Prevent browser scrolling with space, Q, E
      if (['q', 'Q', 'e', 'E', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'q' || e.key === 'Q') {
        state.isReversing = true;
      }
      if (e.key === 'e' || e.key === 'E') {
        state.isForwarding = true;
      }

      if (e.key === ' ' || e.code === 'Space') {
        if (state.phase === 'INTRO') {
          startGameFromIntro();
        }
      }

      if (e.key === 'Escape' && DOM.bugWindow.classList.contains('open')) {
        closeBugWindow();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'q' || e.key === 'Q') {
        state.isReversing = false;
      }
      if (e.key === 'e' || e.key === 'E') {
        state.isForwarding = false;
      }
    });

    // Collectible clicks
    document.getElementById('collectible-crystal').addEventListener('click', () => onCollectElement('crystal'));
    document.getElementById('collectible-gear').addEventListener('click', () => onCollectElement('gear'));
    document.getElementById('collectible-core').addEventListener('click', () => onCollectElement('core'));

    // Timeline Track Click & Drag to Scrub
    let isDraggingScrubber = false;
    const handleScrub = (clientX) => {
      if (state.phase === 'INTRO' || state.phase === 'FINALE' || state.phase === 'VICTORY' || state.relicTransitioning) {
        return;
      }
      const rect = DOM.timelineTrack.getBoundingClientRect();
      const clickRatio = Math.min(Math.max((clientX - rect.left) / rect.width, 0.0), 1.0);
      state.t = clickRatio;
      updateRelicVisuals(state.t);
      DOM.timelineHead.style.left = (state.t * 100) + '%';
    };

    DOM.timelineTrack.addEventListener('mousedown', (e) => {
      isDraggingScrubber = true;
      handleScrub(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (isDraggingScrubber) {
        handleScrub(e.clientX);
      }
    });

    window.addEventListener('mouseup', () => {
      isDraggingScrubber = false;
    });

    DOM.timelineTrack.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        isDraggingScrubber = true;
        handleScrub(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (isDraggingScrubber && e.touches.length > 0) {
        handleScrub(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDraggingScrubber = false;
    });

    // On-screen HUD Action Pills Mouse & Touch Hold
    const startReverse = (e) => { if (e.cancelable) e.preventDefault(); state.isReversing = true; state.isForwarding = false; };
    const stopReverse = () => { state.isReversing = false; };
    const startForward = (e) => { if (e.cancelable) e.preventDefault(); state.isForwarding = true; state.isReversing = false; };
    const stopForward = () => { state.isForwarding = false; };

    if (DOM.keyQ) {
      DOM.keyQ.addEventListener('mousedown', startReverse);
      DOM.keyQ.addEventListener('mouseup', stopReverse);
      DOM.keyQ.addEventListener('mouseleave', stopReverse);
      DOM.keyQ.addEventListener('touchstart', startReverse, { passive: false });
      DOM.keyQ.addEventListener('touchend', stopReverse);
    }

    if (DOM.keyE) {
      DOM.keyE.addEventListener('mousedown', startForward);
      DOM.keyE.addEventListener('mouseup', stopForward);
      DOM.keyE.addEventListener('mouseleave', stopForward);
      DOM.keyE.addEventListener('touchstart', startForward, { passive: false });
      DOM.keyE.addEventListener('touchend', stopForward);
    }

    if (DOM.keyPause) {
      DOM.keyPause.addEventListener('click', () => {
        state.isReversing = false;
        state.isForwarding = false;
      });
    }

    // Modal action buttons
    DOM.modalContinueBtn.addEventListener('click', startGameFromIntro);
    DOM.btnReplay.addEventListener('click', restartGame);
    DOM.finaleContinueBtn.addEventListener('click', () => {
      DOM.finaleCheckpoint.classList.remove('open');
      DOM.finaleCheckpoint.setAttribute('aria-hidden', 'true');
      state.phase = 'FINALE';
      startFinaleSequence();
    });
    DOM.bugWindowToggle.addEventListener('click', openBugWindow);
    DOM.solveBugBtn.addEventListener('click', closeBugWindow);
  }

  function openBugWindow() {
    state.isReversing = false;
    state.isForwarding = false;
    DOM.bugWindow.classList.add('open');
    DOM.bugWindow.setAttribute('aria-hidden', 'false');
    DOM.bugWindowToggle.setAttribute('aria-expanded', 'true');
    DOM.solveBugBtn.focus();
  }

  function closeBugWindow() {
    DOM.bugWindow.classList.remove('open');
    DOM.bugWindow.setAttribute('aria-hidden', 'true');
    DOM.bugWindowToggle.setAttribute('aria-expanded', 'false');
    DOM.bugWindowToggle.focus();
  }

  function startGameFromIntro() {
    DOM.storyModal.classList.add('hidden');
    state.phase = 'RELIC_1';
    state.currentRelicIndex = 0;
    switchRelicAssembly(0);
  }

  function restartGame() {
    state.collected = { crystal: false, gear: false, core: false };
    state.collectedCount = 0;
    state.currentRelicIndex = 0;
    state.phase = 'RELIC_1';
    state.t = 1.0;
    state.relicTransitioning = false;

    // Reset HUD
    DOM.progressText.textContent = '0 / 3';
    ['slot-crystal', 'slot-gear', 'slot-core'].forEach(id => {
      const slot = document.getElementById(id);
      if (slot) {
        slot.setAttribute('data-status', 'empty');
        slot.className = 'relic-slot';
        const span = slot.querySelector('.slot-status');
        if (span) span.textContent = 'NOT COLLECTED';
      }
    });

    // Reset Collectibles
    ['collectible-crystal', 'collectible-gear', 'collectible-core'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.className = el.className.replace(/collected|in-window/g, '').trim();
    });

    // Reset Altar
    ['socket-1', 'socket-2', 'socket-3'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('filled');
    });

    const shield = document.querySelector('.barrier-generator');
    if (shield) shield.classList.remove('expanding');

    DOM.timelineTrack.style.opacity = '1';
    DOM.victoryModal.classList.add('hidden');
    DOM.relicFinaleAltar.classList.remove('forming');

    switchRelicAssembly(0);
  }

  // ------------------------------------------------------------
  // MAIN ANIMATION LOOP
  // ------------------------------------------------------------
  function gameLoop(now) {
    const deltaTime = Math.min((now - state.lastTime) / 1000, 0.1);
    state.lastTime = now;

    // Screen Shake
    if (state.screenShakeTimer > 0) {
      state.screenShakeTimer--;
      DOM.viewport.classList.add('screen-shake');
    } else {
      DOM.viewport.classList.remove('screen-shake');
    }

    state.motionTime = now / 1000;
    if (now >= state.hitStopUntil) updateTimeline(deltaTime);
    fx.updateAndRender();

    requestAnimationFrame(gameLoop);
  }

  // ------------------------------------------------------------
  // INITIALIZATION
  // ------------------------------------------------------------
  function init() {
    fx.init();
    buildVaseShards();
    buildClockCogs();
    buildOrbFacets();
    initInput();

    // Set initial background to Sanctum Chamber
    DOM.bgFar.style.backgroundImage = "url('assets/backgrounds/sanctum_chamber.jpg')";

    window.gameState = state;
    window.gameDOM = DOM;
    window.onCollectElement = onCollectElement;

    requestAnimationFrame(gameLoop);
  }

  window.addEventListener('DOMContentLoaded', init);

})();
