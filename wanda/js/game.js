/**
 * WANDA – THE PORTAL AWAKENING
 * Game State Machine & Gameplay Controller
 */

class GameEngine {
  constructor() {
    this.currentPhase = 1;
    this.viewport = document.getElementById('game-viewport');
    this.instructionText = document.getElementById('instruction-text');
    this.phaseTracker = document.getElementById('phase-tracker');

    // Phase 2: rebuild the cradle from exact crops of its source artwork.
    this.stackOrder = [
      { piece: 'lower-right', slot: 'lower-right', name: 'Lower-right section' },
      { piece: 'upper-left', slot: 'upper-left', name: 'Upper-left section' },
      { piece: 'lower-left', slot: 'lower-left', name: 'Lower-left section' },
      { piece: 'upper-right', slot: 'upper-right', name: 'Upper-right section' }
    ];
    this.stackStepIndex = 0;
    this.stackSelectedId = null;
    this.stackDrag = null;
    this.stackSuppressClick = false;
    this.stackPieceElements = new Map();

    // Phase 3: Energy Stabilization
    this.stabilizationAttempts = 0;
    this.requiredStabilizations = 3;
    this.isCharging = false;
    this.chargeProgress = 0;
    this.chargeInterval = null;

    // Phase 4: Bug & Bypass
    this.isBugBypassed = false;

    // Phase 5: Lightning loop
    this.lightningInterval = null;

    this.bindEvents();
    this.setPhase(1);
  }

  bindEvents() {
    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      // Prevent scrolling
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      this.handleKeyDown(e);
    });

    window.addEventListener('keyup', (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      this.handleKeyUp(e);
    });

    // Bypass button for Phase 4
    const bypassBtn = document.getElementById('bypass-btn');
    if (bypassBtn) {
      bypassBtn.addEventListener('click', () => {
        this.resolveBypass();
      });
    }

    // Replay button for Phase 6
    const replayBtn = document.getElementById('replay-btn');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        this.restartGame();
      });
    }

    // Touch/click controls for Phase 3
    const chargeBtn = document.getElementById('btn-charge-hold');
    if (chargeBtn) {
      chargeBtn.addEventListener('mousedown', () => this.startCharging());
      chargeBtn.addEventListener('mouseup', () => this.releaseCharging());
      chargeBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.startCharging(); });
      chargeBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.releaseCharging(); });
    }

    // Instruction box click in Phase 1
    const instructionBox = document.querySelector('.instruction-box');
    if (instructionBox) {
      instructionBox.style.cursor = 'pointer';
      instructionBox.addEventListener('click', () => {
        if (this.currentPhase === 1) this.setPhase(2);
      });
    }

    // Viewport click in Phase 1
    if (this.viewport) {
      this.viewport.addEventListener('click', (e) => {
        if (this.currentPhase === 1 && !e.target.closest('.hud-header')) {
          this.setPhase(2);
        }
      });
    }

    // Phase Tracker navigation pills (allows jumping to / testing any phase)
    const trackerNodes = document.querySelectorAll('.tracker-node');
    trackerNodes.forEach(node => {
      node.addEventListener('click', () => {
        const targetPhase = parseInt(node.getAttribute('data-phase'));
        if (targetPhase && targetPhase !== this.currentPhase) {
          this.jumpToPhase(targetPhase);
        }
      });
    });

    // Object click shortcuts
    const objCrystal = document.getElementById('object-crystal');
    const objArtifact = document.getElementById('object-artifact');

    if (objCrystal) {
      objCrystal.addEventListener('click', () => {
        if (this.currentPhase === 1) this.setPhase(2);
      });
    }
    if (objArtifact) {
      objArtifact.addEventListener('click', () => {
        if (this.currentPhase === 3 && this.stabilizationAttempts >= 3) this.setPhase(4);
      });
    }
  }

  jumpToPhase(phaseNumber) {
    // Clean up any ongoing intervals or modals
    if (this.chargeInterval) clearInterval(this.chargeInterval);
    if (this.lightningInterval) clearInterval(this.lightningInterval);
    const glitchOverlay = document.getElementById('glitch-overlay');
    const errorModal = document.getElementById('error-modal');
    if (glitchOverlay) glitchOverlay.style.display = 'none';
    if (errorModal) errorModal.style.display = 'none';

    // Update ground surge state
    const groundEl = document.getElementById('sanctum-ground');
    if (groundEl) {
      groundEl.classList.toggle('ground-portal-surge', phaseNumber >= 5);
    }
    const crystal = document.getElementById('object-crystal');
    const ring = document.getElementById('object-ring');
    const artifact = document.getElementById('object-artifact');

    if (crystal) {
      if (phaseNumber >= 3) {
        crystal.classList.add('placed-node-1');
        this.stackStepIndex = this.stackOrder.length;
      } else {
        crystal.classList.remove('placed-node-1');
        this.stackStepIndex = 0;
      }
    }
    if (this.stackDrag) {
      clearTimeout(this.stackDrag.stabilityTimer);
      try { if (this.stackDrag.piece.hasPointerCapture(this.stackDrag.pointerId)) this.stackDrag.piece.releasePointerCapture(this.stackDrag.pointerId); } catch (_) { /* The browser may already have released the pointer. */ }
      this.stackDrag.piece.style.transform = '';
      this.stackDrag.piece.classList.remove('dragging-piece', 'steady-piece');
    }
    this.stackDrag = null;
    this.stackSelectedId = null;

    if (ring) {
      if (phaseNumber >= 4) {
        ring.classList.add('placed-node-2');
        ring.classList.remove('ring-oscillating');
        this.stabilizationAttempts = 3;
      } else {
        ring.classList.remove('placed-node-2');
        if (phaseNumber === 3) ring.classList.add('ring-oscillating');
        this.stabilizationAttempts = 0;
      }
    }

    if (artifact) {
      if (phaseNumber >= 5) {
        artifact.classList.add('placed-node-3');
        artifact.classList.remove('glitch-freeze');
      } else {
        artifact.classList.remove('placed-node-3', 'glitch-freeze');
        artifact.style.transform = '';
      }
    }

    const portal = document.getElementById('portal-container');
    if (portal && phaseNumber < 5) {
      portal.classList.remove('portal-active');
      portal.style.transform = '';
    }

    const endingScreen = document.getElementById('ending-screen');
    if (endingScreen) {
      endingScreen.style.display = 'none';
      endingScreen.style.opacity = '0';
    }

    if (phaseNumber < 6 && window.Wanda) {
      window.Wanda.reset();
    }

    this.setPhase(phaseNumber);
  }

  handleKeyDown(e) {
    if (this.currentPhase === 1) {
      if (e.code === 'Space' || e.code === 'Enter') {
        this.setPhase(2);
      }
    } else if (this.currentPhase === 2) {
      if (/^(Digit|Numpad)[1-7]$/.test(e.code)) {
        this.selectStackPieceByIndex(Number(e.code.slice(-1)) - 1);
      } else if (e.code === 'Enter' && this.stackSelectedId) {
        e.preventDefault();
        const activeStep = this.stackOrder[this.stackStepIndex];
        if (activeStep) this.commitSelectedStackPiece(activeStep.slot);
      } else if (e.code === 'Escape') {
        this.selectStackPiece(null);
      }
    } else if (this.currentPhase === 3) {
      if (e.code === 'Space' && !this.isCharging) {
        this.startCharging();
      }
    }
  }

  handleKeyUp(e) {
    if (this.currentPhase === 3 && e.code === 'Space') {
      this.releaseCharging();
    }
  }

  // Phase Transition Controller
  setPhase(phaseNumber) {
    this.currentPhase = phaseNumber;
    document.body.classList.toggle('phase-stack-active', phaseNumber === 2);

    // Update camera angle
    if (this.viewport) {
      this.viewport.className = `cam-phase-${phaseNumber}`;
    }

    // Update HUD tracker
    this.updateHUDTracker(phaseNumber);

    // Hide/show UI widgets
    const alignmentWidget = document.getElementById('alignment-widget');
    const stabilizationWidget = document.getElementById('stabilization-widget');
    const controlsPhase3 = document.getElementById('controls-phase3');
    const glitchOverlay = document.getElementById('glitch-overlay');
    const errorModal = document.getElementById('error-modal');

    if (alignmentWidget) alignmentWidget.style.display = (phaseNumber === 2) ? 'flex' : 'none';
    if (stabilizationWidget) stabilizationWidget.style.display = (phaseNumber === 3) ? 'flex' : 'none';
    if (controlsPhase3) controlsPhase3.style.display = (phaseNumber === 3) ? 'flex' : 'none';

    // Phase specifics
    switch (phaseNumber) {
      case 1:
        this.instructionText.innerHTML = `Wanda centers her Chaos Magic in deep meditation.<br><b>Press SPACE</b> or click the Ancient Crystal to begin the cradle challenge.`;
        break;

      case 2:
        this.instructionText.innerHTML = `<b>Phase 2: Telekinetic Cradle.</b> Drag a crop to the highlighted quadrant and hold briefly to steady it. Keys <span class="key-badge">1–7</span> select a fragment and <span class="key-badge">ENTER</span> places it. Match the picture edges; three shifted crops are decoys.`;
        this.initPhase2();
        break;

      case 3:
        this.instructionText.innerHTML = `<b>Phase 3: Energy Stabilization.</b> Press & hold <span class="key-badge">SPACE</span> to channel Chaos Magic. Release in green harmonic zone (3 times)!`;
        this.initPhase3();
        break;

      case 4:
        this.instructionText.innerHTML = `<b>Phase 4: Telekinetic Malfunction!</b> An unexpected anomaly has frozen the artifact.`;
        this.triggerPhase4Glitch();
        break;

      case 5:
        this.instructionText.innerHTML = `<b>Phase 5: Portal Construction.</b> Wanda channels Chaos Magic through all three relics to manifest the portal!`;
        this.startPhase5Construction();
        break;

      case 6:
        this.instructionText.innerHTML = `<b>Phase 6: Portal Awakening.</b> The threshold is open. Wanda prepares to enter.`;
        this.startPhase6Ending();
        break;
    }
  }

  updateHUDTracker(phaseNumber) {
    const nodes = document.querySelectorAll('.tracker-node');
    nodes.forEach((node, idx) => {
      const p = idx + 1;
      node.classList.remove('active', 'completed');
      if (p === phaseNumber) {
        node.classList.add('active');
      } else if (p < phaseNumber) {
        node.classList.add('completed');
      }
    });
  }

  // =========================================================================
  // PHASE 2: TELEKINETIC CRADLE STACK
  // =========================================================================
  initPhase2() {
    this.stackStepIndex = 0;
    this.stackSelectedId = null;
    this.stackDrag = null;
    this.stackSuppressClick = false;
    this.stackPieceElements.clear();
    this.stackTrayOrder = [];
    this.stackSlotElements = [...document.querySelectorAll('.stack-slot')];
    document.getElementById('stack-build-area')?.classList.remove('complete');

    const tray = document.getElementById('stack-piece-tray');
    tray.replaceChildren();
    const pieceSpecs = [
      { id: 'upper-left', asset: 'upper-left.webp', genuine: true, label: 'Upper-left cradle image crop' },
      { id: 'upper-right', asset: 'upper-right.webp', genuine: true, label: 'Upper-right cradle image crop' },
      { id: 'lower-left', asset: 'lower-left.webp', genuine: true, label: 'Lower-left cradle image crop' },
      { id: 'lower-right', asset: 'lower-right.webp', genuine: true, label: 'Lower-right cradle image crop' },
      { id: 'decoy-center', asset: 'decoy-center.webp', genuine: false, label: 'Shifted arch image crop' },
      { id: 'decoy-left', asset: 'decoy-left.webp', genuine: false, label: 'Shifted left-side image crop' },
      { id: 'decoy-right', asset: 'decoy-right.webp', genuine: false, label: 'Shifted right-side image crop' }
    ];
    this.stackTrayOrder = pieceSpecs.map(piece => piece.id);
    for (let index = this.stackTrayOrder.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [this.stackTrayOrder[index], this.stackTrayOrder[swapIndex]] = [this.stackTrayOrder[swapIndex], this.stackTrayOrder[index]];
    }

    this.stackSlotElements.forEach(slot => {
      slot.classList.remove('filled', 'rejected', 'active-target');
      const targetArt = document.createElement('img');
      targetArt.className = 'stack-target-art';
      targetArt.src = `assets/stack/${slot.dataset.targetAsset}`;
      targetArt.alt = '';
      targetArt.draggable = false;
      targetArt.setAttribute('aria-hidden', 'true');
      slot.replaceChildren(targetArt);
      slot.onclick = () => this.commitSelectedStackPiece(slot.dataset.stackSlot);
      slot.setAttribute('aria-label', `${slot.dataset.stackSlot.replace('-', ' ')} cradle image target`);
    });

    pieceSpecs.forEach(spec => {
      const piece = document.createElement('button');
      piece.type = 'button';
      piece.className = `stack-piece${spec.genuine ? ' genuine-piece' : ' dummy-piece'}`;
      piece.dataset.pieceId = spec.id;
      piece.setAttribute('aria-label', spec.label);
      piece.innerHTML = `<img class="piece-image" src="assets/stack/${spec.asset}" alt="" draggable="false" aria-hidden="true">`;
      piece.addEventListener('click', event => {
        if (this.stackSuppressClick) { event.preventDefault(); return; }
        this.selectStackPiece(spec.id);
      });
      piece.addEventListener('pointerdown', event => this.beginStackDrag(event, spec.id));
      piece.addEventListener('pointermove', event => this.moveStackPiece(event));
      piece.addEventListener('pointerup', event => this.endStackDrag(event));
      piece.addEventListener('pointercancel', event => this.cancelStackDrag(event));
      this.stackPieceElements.set(spec.id, piece);
    });
    this.stackTrayOrder.forEach((id, index) => {
      const piece = this.stackPieceElements.get(id);
      piece.dataset.trayIndex = String(index + 1);
      tray.append(piece);
    });

    this.updateStackHUD('Drag or select a crop. Keys 1–7 select; Enter places. Match the image edges to the highlighted quadrant.');
    this.updateStackTargets();
    const crystal = document.getElementById('object-crystal');
    crystal?.classList.remove('placed-node-1');
  }

  selectStackPiece(id) {
    if (this.currentPhase !== 2 || this.stackDrag) return;
    if (id && this.stackPieceElements.get(id)?.disabled) return;
    this.stackSelectedId = id;
    this.stackPieceElements.forEach((piece, pieceId) => piece.classList.toggle('selected-piece', pieceId === id));
    this.updateStackTargets();
    if (id) {
      this.updateStackHUD('Crop selected. Compare its picture edges with the highlighted quadrant.');
    } else {
      this.updateStackHUD('Crop released. Choose the image section that continues the cradle.');
    }
  }

  selectStackPieceByIndex(index) {
    const id = this.stackTrayOrder[index];
    if (id) this.selectStackPiece(id);
  }

  updateStackHUD(message) {
    const progress = document.getElementById('stack-progress');
    const feedback = document.getElementById('stack-feedback');
    const calmMeter = document.querySelector('.stack-stability i');
    if (progress) progress.textContent = `${this.stackStepIndex} / ${this.stackOrder.length} PIECES`;
    if (feedback && message) feedback.textContent = message;
    if (calmMeter) calmMeter.style.width = this.stackDrag?.stable ? '100%' : '0%';
  }

  updateStackTargets() {
    const activeStep = this.stackOrder[this.stackStepIndex];
    this.stackSlotElements.forEach(slot => {
      slot.classList.toggle('active-target', Boolean(activeStep && slot.dataset.stackSlot === activeStep.slot));
      slot.classList.toggle('hover-target', Boolean(this.stackDrag && this.stackPointInside(slot, this.stackDrag.x, this.stackDrag.y)));
    });
  }

  beginStackDrag(event, id) {
    if (this.currentPhase !== 2 || this.stackStepIndex >= this.stackOrder.length || event.button !== 0) return;
    const piece = this.stackPieceElements.get(id);
    if (!piece || piece.disabled || piece.parentElement?.classList.contains('stack-slot')) return;
    event.preventDefault();
    this.stackSelectedId = id;
    this.stackPieceElements.forEach((element, pieceId) => element.classList.toggle('selected-piece', pieceId === id));
    this.stackDrag = {
      id,
      piece,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      lastMoveAt: performance.now(),
      speed: 0,
      moved: false,
      x: event.clientX,
      y: event.clientY,
      stable: false,
      stabilityTimer: 0
    };
    piece.classList.add('dragging-piece');
    try { piece.setPointerCapture(event.pointerId); } catch (_) { /* Pointer capture is optional in older browsers. */ }
    this.updateStackTargets();
  }

  moveStackPiece(event) {
    const drag = this.stackDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const now = performance.now();
    const deltaX = event.clientX - drag.lastX;
    const deltaY = event.clientY - drag.lastY;
    const elapsed = Math.max(1, now - drag.lastMoveAt);
    drag.speed = Math.hypot(deltaX, deltaY) / elapsed;
    drag.moved ||= Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 6;
    drag.x = event.clientX;
    drag.y = event.clientY;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.lastMoveAt = now;
    const sway = Math.max(-9, Math.min(9, deltaX * .12));
    drag.piece.style.transform = `translate(${event.clientX - drag.startX}px, ${event.clientY - drag.startY}px) rotate(${sway}deg)`;
    drag.stable = false;
    drag.piece.classList.remove('steady-piece');
    const calmMeter = document.querySelector('.stack-stability i');
    if (calmMeter) calmMeter.style.width = `${Math.max(0, Math.min(88, 88 - drag.speed * 110))}%`;
    clearTimeout(drag.stabilityTimer);
    drag.stabilityTimer = setTimeout(() => {
      if (this.stackDrag !== drag) return;
      drag.stable = true;
      drag.piece.classList.add('steady-piece');
      if (calmMeter) calmMeter.style.width = '100%';
    }, 145);
    this.updateStackTargets();
  }

  stackPointInside(slot, x, y, padding = 14) {
    const rect = slot.getBoundingClientRect();
    return x >= rect.left - padding && x <= rect.right + padding && y >= rect.top - padding && y <= rect.bottom + padding;
  }

  endStackDrag(event) {
    const drag = this.stackDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const elapsedSinceMovement = performance.now() - drag.lastMoveAt;
    const pieceRect = drag.piece.getBoundingClientRect();
    const pieceCenterX = pieceRect.left + pieceRect.width / 2;
    const pieceCenterY = pieceRect.top + pieceRect.height / 2;
    const target = this.stackSlotElements.find(slot =>
      this.stackPointInside(slot, event.clientX, event.clientY) ||
      this.stackPointInside(slot, pieceCenterX, pieceCenterY, 6)
    );
    const isClick = !drag.moved;
    const isSteady = elapsedSinceMovement >= 130 && drag.stable;
    clearTimeout(drag.stabilityTimer);
    drag.piece.style.transform = '';
    drag.piece.classList.remove('dragging-piece', 'steady-piece');
    try { if (drag.piece.hasPointerCapture(event.pointerId)) drag.piece.releasePointerCapture(event.pointerId); } catch (_) { /* Already released by the browser. */ }
    this.stackDrag = null;
    this.stackSuppressClick = true;
    setTimeout(() => { this.stackSuppressClick = false; }, 0);

    if (isClick) {
      this.selectStackPiece(drag.id);
      return;
    }
    if (!target) {
      this.selectStackPiece(drag.id);
      this.updateStackHUD('The piece floats back. Place it over the glowing socket.');
      return;
    }
    if (!isSteady) {
      this.selectStackPiece(drag.id);
      this.updateStackHUD('It is still swinging. Hold steady over the socket, then release.');
      target.classList.add('rejected');
      setTimeout(() => target.classList.remove('rejected'), 380);
      return;
    }
    this.tryPlaceStackPiece(drag.id, target.dataset.stackSlot, target);
  }

  cancelStackDrag(event) {
    if (!this.stackDrag || this.stackDrag.pointerId !== event.pointerId) return;
    const id = this.stackDrag.id;
    clearTimeout(this.stackDrag.stabilityTimer);
    this.stackDrag.piece.style.transform = '';
    this.stackDrag.piece.classList.remove('dragging-piece', 'steady-piece');
    this.stackDrag = null;
    this.selectStackPiece(id);
  }

  commitSelectedStackPiece(slotId) {
    if (!this.stackSelectedId || this.currentPhase !== 2 || this.stackStepIndex >= this.stackOrder.length) return;
    const slot = this.stackSlotElements.find(item => item.dataset.stackSlot === slotId);
    this.tryPlaceStackPiece(this.stackSelectedId, slotId, slot);
  }

  tryPlaceStackPiece(pieceId, slotId, slotElement) {
    const expected = this.stackOrder[this.stackStepIndex];
    const piece = this.stackPieceElements.get(pieceId);
    if (!expected || !piece || !slotElement) return;
    if (pieceId !== expected.piece || slotId !== expected.slot) {
      const message = 'This crop does not continue the picture at that gap. Try another fragment.';
      this.stackSelectedId = null;
      this.stackPieceElements.forEach(element => element.classList.remove('selected-piece'));
      this.updateStackTargets();
      this.updateStackHUD(message);
      slotElement.classList.add('rejected');
      setTimeout(() => slotElement.classList.remove('rejected'), 420);
      return;
    }

    piece.classList.remove('selected-piece', 'steady-piece');
    piece.classList.add('placed-piece');
    piece.style.transform = '';
    piece.disabled = true;
    piece.setAttribute('aria-label', `${expected.name}, secured`);
    slotElement.classList.add('filled');
    slotElement.append(piece);
    this.stackSelectedId = null;
    this.stackStepIndex += 1;
    this.updateStackTargets();
    this.updateStackHUD(`${expected.name} secured. The cradle is settling.`);

    const rect = slotElement.getBoundingClientRect();
    if (window.ParticleSystem) {
      window.ParticleSystem.triggerBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 18, '#ff315f');
      window.ParticleSystem.triggerShockwave(rect.left + rect.width / 2, rect.top + rect.height / 2, 75, 'rgba(255, 49, 95, 0.6)');
    }
    const groundEl = document.getElementById('sanctum-ground');
    groundEl?.classList.add('ground-pulse-fast');
    setTimeout(() => groundEl?.classList.remove('ground-pulse-fast'), 520);

    if (this.stackStepIndex === this.stackOrder.length) this.completePhase2();
  }

  completePhase2() {
    document.getElementById('stack-build-area')?.classList.add('complete');
    this.updateStackHUD('Cradle complete. The crystal settles into place.');
    this.stackSlotElements.forEach(slot => slot.classList.remove('active-target'));
    this.instructionText.innerHTML = `<b>Cradle Stabilized!</b> Wanda's Chaos Magic seats the Ancient Crystal in the portal matrix.`;
    const crystal = document.getElementById('object-crystal');
    window.Wanda.setEnergyIntensity(1.6);
    const rect = crystal.getBoundingClientRect();
    window.ParticleSystem.triggerBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 45, '#ff103f');
    window.ParticleSystem.triggerShockwave(rect.left + rect.width / 2, rect.top + rect.height / 2, 220, 'rgba(255, 16, 63, 0.9)');

    setTimeout(() => {
      crystal.classList.add('placed-node-1');
      window.Wanda.setEnergyIntensity(1.0);
    }, 800);
    setTimeout(() => this.setPhase(3), 2800);
  }

  // =========================================================================
  // PHASE 3: ENERGY STABILIZATION LOGIC
  // =========================================================================
  initPhase3() {
    this.stabilizationAttempts = 0;
    this.chargeProgress = 0;
    this.updateStabilizationUI();
    const ring = document.getElementById('object-ring');
    if (ring) {
      ring.classList.add('ring-oscillating');
    }
  }

  startCharging() {
    if (this.currentPhase !== 3 || this.isCharging) return;
    this.isCharging = true;
    window.Wanda.setEnergyIntensity(1.8);

    const fillBar = document.getElementById('meter-fill');
    this.chargeInterval = setInterval(() => {
      this.chargeProgress += 1.8;
      if (this.chargeProgress > 100) {
        this.chargeProgress = 100;
      }
      if (fillBar) {
        fillBar.style.width = `${this.chargeProgress}%`;
      }
    }, 20);
  }

  releaseCharging() {
    if (this.currentPhase !== 3 || !this.isCharging) return;
    this.isCharging = false;
    clearInterval(this.chargeInterval);
    window.Wanda.setEnergyIntensity(1.0);

    const fillBar = document.getElementById('meter-fill');
    // Target zone: 65% to 87%
    if (this.chargeProgress >= 65 && this.chargeProgress <= 87) {
      // SUCCESS!
      this.stabilizationAttempts++;

      const ring = document.getElementById('object-ring');
      if (ring) {
        const rect = ring.getBoundingClientRect();
        window.ParticleSystem.triggerBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 35, '#ff103f');
        window.ParticleSystem.triggerShockwave(rect.left + rect.width / 2, rect.top + rect.height / 2, 160, 'rgba(0, 240, 160, 0.85)');
      }

      this.updateStabilizationUI();

      if (this.stabilizationAttempts >= this.requiredStabilizations) {
        this.completePhase3();
      }
    } else {
      // Mis-timed release
      const widget = document.getElementById('stabilization-widget');
      if (widget) {
        widget.style.transform = 'translateX(-8px)';
        setTimeout(() => { widget.style.transform = 'translateX(8px)'; }, 80);
        setTimeout(() => { widget.style.transform = ''; }, 160);
      }
    }

    // Reset bar fill
    this.chargeProgress = 0;
    if (fillBar) fillBar.style.width = '0%';
  }

  updateStabilizationUI() {
    const gems = document.querySelectorAll('.stabilize-gem');
    gems.forEach((gem, idx) => {
      gem.classList.toggle('charged', idx < this.stabilizationAttempts);
    });
  }

  completePhase3() {
    this.instructionText.innerHTML = `<b>Harmonic Balance Achieved!</b> The Mystical Energy Ring stabilizes and locks into the portal matrix.`;
    const ring = document.getElementById('object-ring');
    if (ring) {
      ring.classList.remove('ring-oscillating');
    }

    setTimeout(() => {
      // Move ring to bottom-left node 2
      ring.classList.add('placed-node-2');
    }, 800);

    // Proceed to Phase 4
    setTimeout(() => {
      this.setPhase(4);
    }, 2800);
  }

  // =========================================================================
  // PHASE 4: DEBUGGING INTERRUPTION & BYPASS
  // =========================================================================
  triggerPhase4Glitch() {
    const artifact = document.getElementById('object-artifact');
    
    // Artifact starts moving towards Wanda
    if (artifact) {
      artifact.style.transition = 'transform 1.4s ease-out';
      artifact.style.transform = 'translate(-80px, -80px) scale(1.1)';
    }

    // Suddenly freeze and glitch at 1.2s!
    setTimeout(() => {
      if (artifact) {
        artifact.classList.add('glitch-freeze');
      }

      const glitchOverlay = document.getElementById('glitch-overlay');
      const errorModal = document.getElementById('error-modal');
      if (glitchOverlay) glitchOverlay.style.display = 'block';
      if (errorModal) errorModal.style.display = 'flex';
    }, 1200);
  }

  resolveBypass() {
    if (this.isBugBypassed) return;
    this.isBugBypassed = true;

    const glitchOverlay = document.getElementById('glitch-overlay');
    const errorModal = document.getElementById('error-modal');
    const artifact = document.getElementById('object-artifact');

    if (glitchOverlay) glitchOverlay.style.display = 'none';
    if (errorModal) errorModal.style.display = 'none';

    if (artifact) {
      artifact.classList.remove('glitch-freeze');
      const rect = artifact.getBoundingClientRect();
      window.ParticleSystem.triggerBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 40, '#00ffa0');
    }

    this.instructionText.innerHTML = `<b>Telekinetic Connection Restored!</b> Third artifact synchronized successfully.`;

    setTimeout(() => {
      // Move artifact to bottom-right node 3
      if (artifact) {
        artifact.style.transform = '';
        artifact.classList.add('placed-node-3');
      }
    }, 900);

    // Proceed to Phase 5
    setTimeout(() => {
      this.setPhase(5);
    }, 3000);
  }

  // =========================================================================
  // PHASE 5: PORTAL CONSTRUCTION
  // =========================================================================
  startPhase5Construction() {
    window.Wanda.setEnergyIntensity(2.4);

    const portal = document.getElementById('portal-container');
    if (portal) {
      portal.classList.add('portal-active');
    }

    const groundEl = document.getElementById('sanctum-ground');
    if (groundEl) {
      groundEl.classList.add('ground-portal-surge');
    }

    window.ParticleSystem.setPortalMode(true);

    // Continuous Chaos Lightning Arcs
    const updateLightning = () => {
      if (this.currentPhase !== 5) return;

      const hands = window.Wanda.getHandPositions();
      const node1 = document.getElementById('object-crystal').getBoundingClientRect();
      const node2 = document.getElementById('object-ring').getBoundingClientRect();
      const node3 = document.getElementById('object-artifact').getBoundingClientRect();

      const n1Pos = { x: node1.left + node1.width / 2, y: node1.top + node1.height / 2 };
      const n2Pos = { x: node2.left + node2.width / 2, y: node2.top + node2.height / 2 };
      const n3Pos = { x: node3.left + node3.width / 2, y: node3.top + node3.height / 2 };

      const arcs = [
        // Wanda hands to objects (originating cleanly from mudra hands)
        { x1: hands.left.x, y1: hands.left.y, x2: n2Pos.x, y2: n2Pos.y, color: '#ff103f', offset: 25 },
        { x1: hands.right.x, y1: hands.right.y, x2: n3Pos.x, y2: n3Pos.y, color: '#ff103f', offset: 25 },
        { x1: (hands.left.x + hands.right.x) / 2, y1: hands.left.y - 10, x2: n1Pos.x, y2: n1Pos.y, color: '#ff4070', offset: 20 },
        // Between the 3 objects (triangle of power)
        { x1: n1Pos.x, y1: n1Pos.y, x2: n2Pos.x, y2: n2Pos.y, color: '#ff2055', offset: 15 },
        { x1: n2Pos.x, y1: n2Pos.y, x2: n3Pos.x, y2: n3Pos.y, color: '#ff2055', offset: 15 },
        { x1: n3Pos.x, y1: n3Pos.y, x2: n1Pos.x, y2: n1Pos.y, color: '#ff2055', offset: 15 }
      ];

      window.ParticleSystem.setEnergyArcs(arcs);
    };

    this.lightningInterval = setInterval(updateLightning, 60);

    // After 5 seconds of spectacular portal creation, proceed to Phase 6
    setTimeout(() => {
      clearInterval(this.lightningInterval);
      window.ParticleSystem.setEnergyArcs([]);
      this.setPhase(6);
    }, 5500);
  }

  // =========================================================================
  // PHASE 6: ENTERING THE PORTAL (COMPLETION)
  // =========================================================================
  startPhase6Ending() {
    this.instructionText.innerHTML = `Wanda ascends into the infinite threshold of Chaos Magic...`;

    // Dynamic camera rumble
    const stage = document.getElementById('world-stage');
    if (stage) {
      stage.classList.add('screen-rumble');
      setTimeout(() => stage.classList.remove('screen-rumble'), 1200);
    }

    // Transcendent ascension into portal vortex in meditation pose
    window.Wanda.ascendIntoPortal(() => {
      // Portal collapses and closes behind her
      // Portal collapses and closes behind her with heavy dimensional implosion
      const portal = document.getElementById('portal-container');
      if (stage) {
        stage.classList.add('screen-shake-heavy');
        setTimeout(() => stage.classList.remove('screen-shake-heavy'), 1000);
      }
      if (portal) {
        portal.style.transform = 'scale(0.01) translateZ(-160px)';
        portal.style.transition = 'transform 1.2s cubic-bezier(0.8, 0, 0.2, 1)';
      }

      // Fade to black & ending card
      setTimeout(() => {
        const endingScreen = document.getElementById('ending-screen');
        if (endingScreen) {
          endingScreen.style.display = 'flex';
          void endingScreen.offsetWidth;
          endingScreen.style.opacity = '1';
        }
      }, 600);
    });
  }

  restartGame() {
    location.reload();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.Game = new GameEngine();
});

