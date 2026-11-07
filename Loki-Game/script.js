/**
 * ============================================================================
 * LOKI: THE STOLEN TESSERACT - REDESIGNED COMPLEX PUZZLE ENGINE
 * ============================================================================
 * Pure Vanilla JavaScript implementation
 * No external libraries or engines
 */

(function () {
  'use strict';

  // ==========================================================================
  // GAME STATE DEFINITIONS (Streamlined 4-Phase Progression)
  // ==========================================================================
  const STATES = {
    INTRO: 'INTRO',
    MIRROR_PUZZLE: 'MIRROR_PUZZLE',
    DEBUGGING: 'DEBUGGING',
    RESTART: 'RESTART',
    COMPLETED: 'COMPLETED'
  };

  let currentState = STATES.INTRO;
  let isTransitioning = false;

  // DOM Core Elements
  const gameContainer = document.getElementById('game-container');
  const vaultScene = document.getElementById('vault-scene');
  const barrierDome = document.getElementById('barrier-dome');
  const tesseractCube = document.getElementById('tesseract-cube');
  const dialogueBox = document.getElementById('dialogue-box');
  const dialogueText = document.getElementById('dialogue-text');
  const greenMagicBridge = document.getElementById('green-magic-bridge');
  const lokiContainer = document.getElementById('loki-container');
  const lokiActor = document.getElementById('loki-actor');
  const lokiMasterArt = document.getElementById('loki-master');
  const LOKI_POSES = {
    idle: 'assets/characters/loki-catch.png',
    casting: 'assets/characters/loki-catch.png',
    glitch: 'assets/characters/loki-catch.png',
    victory: 'assets/characters/loki-catch.png'
  };

  // Phase Layers
  const phases = {
    intro: document.getElementById('phase-intro'),
    puzzle: document.getElementById('phase-puzzle'),
    debug: document.getElementById('phase-debug'),
    finale: document.getElementById('phase-finale')
  };

  // ==========================================================================
  // UNIFIED LOKI CHARACTER CONTROLLER (Consistent Master Asset)
  // ==========================================================================
  function setLokiState(stateClass) {
    if (!lokiActor) return;
    lokiActor.className = 'loki-sprite-wrapper';
    if (stateClass) {
      lokiActor.classList.add(stateClass);
    }
    const pose = stateClass === 'loki-actor-casting' ? LOKI_POSES.casting
      : stateClass === 'loki-actor-glitch' ? LOKI_POSES.glitch
        : stateClass === 'loki-actor-victory' ? LOKI_POSES.victory
          : LOKI_POSES.idle;
    if (lokiMasterArt && !lokiMasterArt.src.endsWith(pose.replace('assets/', ''))) {
      lokiMasterArt.src = pose;
    }
  }

  // ==========================================================================
  // CINEMATIC DIALOGUE SYSTEM
  // ==========================================================================
  let dialogueTimeout = null;
  let typewriterInterval = null;

  function showDialogue(text, durationMs = 4500) {
    if (typewriterInterval) clearInterval(typewriterInterval);
    if (dialogueTimeout) clearTimeout(dialogueTimeout);

    dialogueText.textContent = '';
    dialogueBox.classList.remove('dialogue-hidden');

    let charIndex = 0;
    typewriterInterval = setInterval(() => {
      if (charIndex < text.length) {
        dialogueText.textContent += text.charAt(charIndex);
        charIndex++;
      } else {
        clearInterval(typewriterInterval);
      }
    }, 25);

    dialogueTimeout = setTimeout(() => {
      dialogueBox.classList.add('dialogue-hidden');
    }, durationMs);
  }

  // ==========================================================================
  // STATE MACHINE & PHASE TRANSITIONS
  // ==========================================================================
  function dismissInfiltrationAlarms() {
    gameContainer.classList.remove('alarm-active', 'infiltration-active');
    const infiltrationSystem = document.getElementById('vault-infiltration-system');
    if (infiltrationSystem) {
      infiltrationSystem.classList.add('powering-down');
    }
  }

  function setPhase(targetState) {
    if (isTransitioning && targetState !== STATES.COMPLETED) return;
    isTransitioning = true;
    currentState = targetState;

    if (targetState !== STATES.MIRROR_PUZZLE && beamAnimFrame) {
      cancelAnimationFrame(beamAnimFrame);
      beamAnimFrame = null;
    }

    // Hide all phase layers
    Object.values(phases).forEach(phase => {
      if (phase) phase.classList.remove('active');
    });

    // Reset alarm styling unless in debug
    if (targetState !== STATES.DEBUGGING) {
      dismissInfiltrationAlarms();
    }

    switch (targetState) {
      case STATES.INTRO:
        phases.intro.classList.add('active');
        setLokiState('');
        if (lokiContainer) lokiContainer.style.left = '-15px';
        vaultScene.style.transform = 'translateZ(0px)';
        dismissInfiltrationAlarms();
        isTransitioning = false;
        break;

      case STATES.MIRROR_PUZZLE:
        phases.puzzle.classList.add('active');
        setLokiState('loki-actor-casting');
        if (lokiContainer) lokiContainer.style.left = '-15px';
        vaultScene.style.transform = 'translateZ(0px)';
        showDialogue("A dual-harmonic containment grid. Let us see if its architects were clever.");
        initComplexMirrorPuzzle();
        isTransitioning = false;
        break;

      case STATES.DEBUGGING:
        phases.debug.classList.add('active');
        setLokiState('loki-actor-glitch');
        gameContainer.classList.add('alarm-active', 'infiltration-active');
        const infiltrationSystem = document.getElementById('vault-infiltration-system');
        if (infiltrationSystem) {
          infiltrationSystem.classList.remove('powering-down');
          const topTape = infiltrationSystem.querySelector('.hazard-tape.top .hazard-text');
          const botTape = infiltrationSystem.querySelector('.hazard-tape.bottom .hazard-text');
          if (topTape) topTape.textContent = '⚠ SECURITY BREACH: UNAUTHORIZED INFILTRATION DETECTED // SECTOR 07 ⚠';
          if (botTape) botTape.textContent = '⚠ TEMPORAL LOCKDOWN ACTIVE // CODE: TVA-404 // ALL EXITS SEALED ⚠';
        }
        vaultScene.style.transform = 'translateZ(0px)';
        showDialogue("The vault detects an intruder. How amusingly desperate.");
        initDebuggingPhase();
        isTransitioning = false;
        break;

      case STATES.RESTART:
        vaultScene.style.transform = 'translateZ(0px)';
        executeVaultRebootSequence();
        break;

      case STATES.COMPLETED:
        phases.finale.classList.add('active');
        vaultScene.style.transform = 'translateZ(0px)';
        dismissInfiltrationAlarms();
        isTransitioning = false;
        break;
    }
  }

  // ==========================================================================
  // PHASE 2: ADVANCED 9x7 SPLIT-BEAM PUZZLE ENGINE
  // ==========================================================================
  const beamCanvas = document.getElementById('beam-canvas');
  const beamCtx = beamCanvas.getContext('2d');
  const puzzleStatusEl = document.getElementById('puzzle-status');
  const relayAlphaTag = document.getElementById('relay-alpha-tag');
  const relayBetaTag = document.getElementById('relay-beta-tag');
  const receiverAlphaEl = document.getElementById('receiver-alpha');
  const receiverBetaEl = document.getElementById('receiver-beta');
  const prismSplitterEl = document.getElementById('prism-splitter');
  const btnResetMirrors = document.getElementById('btn-reset-mirrors');

  // A fixed 9 x 7 optical grid: four mirrors reach the prism, then each branch
  // passes three mirrors before reaching its relay. Two red decoys guard side routes.
  const SOURCE_POS = { x: 40, y: 260 };
  const SPLITTER_POS = { x: 480, y: 260 };
  const RCV_A_POS = { x: 920, y: 113 };
  const RCV_B_POS = { x: 920, y: 407 };
  const OBSTACLES = [
    { x: 260, y: 40 }, { x: 810, y: 40 }, { x: 920, y: 40 },
    { x: 260, y: 480 }, { x: 810, y: 480 }, { x: 920, y: 480 }
  ];
  // Most route pieces need one or two turns; the opening beam touches a decoy
  // for free as a visual warning, while only player-caused new contacts cost integrity.
  const INITIAL_ANGLES = [0, 0, 270, 270, 0, 270, 0, 270, 0, 0, 90, 180];
  const mirrors = [
    { id: 'mirror-0', x: 150, y: 260, angle: 0, solvedAngle: 90, el: document.getElementById('mirror-0') },
    { id: 'mirror-1', x: 150, y: 113, angle: 0, solvedAngle: 90, el: document.getElementById('mirror-1') },
    { id: 'mirror-2', x: 370, y: 113, angle: 270, solvedAngle: 0, el: document.getElementById('mirror-2') },
    { id: 'mirror-3', x: 370, y: 260, angle: 270, solvedAngle: 0, el: document.getElementById('mirror-3') },
    { id: 'mirror-4', x: 480, y: 40, angle: 0, solvedAngle: 90, el: document.getElementById('mirror-4') },
    { id: 'mirror-5', x: 700, y: 40, angle: 270, solvedAngle: 0, el: document.getElementById('mirror-5') },
    { id: 'mirror-6', x: 700, y: 113, angle: 0, solvedAngle: 0, el: document.getElementById('mirror-6') },
    { id: 'mirror-7', x: 480, y: 480, angle: 270, solvedAngle: 0, el: document.getElementById('mirror-7') },
    { id: 'mirror-8', x: 700, y: 480, angle: 0, solvedAngle: 90, el: document.getElementById('mirror-8') },
    { id: 'mirror-9', x: 700, y: 407, angle: 0, solvedAngle: 90, el: document.getElementById('mirror-9') },
    { id: 'mirror-decoy-a', x: 150, y: 333, angle: 90, decoy: true, el: document.getElementById('mirror-decoy-a') },
    { id: 'mirror-decoy-b', x: 590, y: 113, angle: 180, decoy: true, el: document.getElementById('mirror-decoy-b') }
  ];

  const ROUTE_MIRROR_COUNT = mirrors.filter(mirror => !mirror.decoy).length;
  const integrityCells = [...document.querySelectorAll('.integrity-cell')];
  let integrityStrikes = 0;
  let decoyFaultActive = false;
  let puzzleOverloading = false;

  let puzzleSolved = false;
  let beamAnimFrame = null;
  let beamPulsePhase = 0;

  function reflectRay(inDir, angle) {
    if (angle === 0) {
      if (inDir === 'RIGHT') return 'DOWN';
      if (inDir === 'DOWN')  return 'RIGHT';
      return null;
    }
    if (angle === 90) {
      if (inDir === 'RIGHT') return 'UP';
      if (inDir === 'UP')    return 'RIGHT';
      return null;
    }
    if (angle === 180) {
      if (inDir === 'LEFT')  return 'UP';
      if (inDir === 'UP')    return 'LEFT';
      return null;
    }
    if (angle === 270) {
      if (inDir === 'LEFT')  return 'DOWN';
      if (inDir === 'DOWN')  return 'LEFT';
      return null;
    }
    return null;
  }

  function initComplexMirrorPuzzle() {
    puzzleSolved = false;
    integrityStrikes = 0;
    decoyFaultActive = false;
    puzzleOverloading = false;
    document.getElementById('puzzle-board')?.classList.remove('decoy-hit', 'overload');
    renderIntegrity();
    puzzleStatusEl.textContent = 'CONTAINMENT ACTIVE';
    puzzleStatusEl.classList.remove('connected');

    receiverAlphaEl.classList.remove('active');
    receiverBetaEl.classList.remove('active');
    prismSplitterEl.classList.remove('active');

    const conduitAlpha = document.getElementById('conduit-alpha');
    const conduitBeta = document.getElementById('conduit-beta');
    if (conduitAlpha) conduitAlpha.classList.remove('charged', 'conduit-venting');
    if (conduitBeta) conduitBeta.classList.remove('charged', 'conduit-venting');

    relayAlphaTag.classList.remove('powered');
    relayAlphaTag.querySelector('.relay-text').textContent = 'RELAY α: INACTIVE';
    relayBetaTag.classList.remove('powered');
    relayBetaTag.querySelector('.relay-text').textContent = 'RELAY β: INACTIVE';

    // Setup mirror elements
    mirrors.forEach((m, idx) => {
      m.angle = INITIAL_ANGLES[idx];
      updateMirrorVisuals(m);
      m.el.classList.remove('locked', 'energized');
      m.el.tabIndex = 0;
      m.el.setAttribute('role', 'button');
      m.el.setAttribute('aria-disabled', 'false');
      m.el.onkeydown = event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onMirrorClick(idx);
        }
      };
      m.el.onclick = () => onMirrorClick(idx);
    });

    if (btnResetMirrors) {
      btnResetMirrors.onclick = () => {
        if (puzzleSolved || puzzleOverloading) return;
        mirrors.forEach((m, idx) => {
          m.angle = INITIAL_ANGLES[idx];
          updateMirrorVisuals(m);
        });
        evaluatePuzzle({ penalize: false });
      };
    }

    startBeamRenderer();
    evaluatePuzzle();
    fitPuzzleBoard();
  }

  function fitPuzzleBoard() {
    const board = document.getElementById('puzzle-board');
    if (!board) return;
    const scale = Math.min(1, (board.clientWidth - 24) / 960, (board.clientHeight - 24) / 520);
    document.documentElement.style.setProperty('--puzzle-scale', String(Math.max(0.45, scale)));
  }

  // Telekinetic and Spark VFX System
  const sparkParticles = [];
  const magicArcs = [];
  let photonTravelOffset = 0;

  function triggerLokiTelekinesis(targetX, targetY) {
    setLokiState('loki-actor-casting');
    magicArcs.push({
      startX: 70,
      startY: 260,
      targetX,
      targetY,
      alpha: 1.0,
      decay: 0.05,
      branches: Array.from({ length: 4 }, () => Math.random() * 20 - 10)
    });

    // Spawn green glyph burst at mirror target
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.2;
      const speed = 1.5 + Math.random() * 2.5;
      sparkParticles.push({
        x: targetX,
        y: targetY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 2,
        color: '#00ff77',
        alpha: 1,
        decay: 0.04
      });
    }

    setTimeout(() => {
      if (currentState === STATES.MIRROR_PUZZLE) {
        setLokiState('loki-actor-casting');
      }
    }, 600);
  }

  function spawnLaserSparks(x, y, color = '#00d2ff', count = 3) {
    if (sparkParticles.length > 80) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.8 + Math.random() * 2.2;
      sparkParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1.5 + Math.random() * 2,
        color,
        alpha: 0.9,
        decay: 0.035
      });
    }
  }

  function onMirrorClick(mirrorIndex) {
    if (puzzleSolved || puzzleOverloading) return;
    const mirror = mirrors[mirrorIndex];
    mirror.angle = (mirror.angle + 90) % 360;
    updateMirrorVisuals(mirror);
    triggerLokiTelekinesis(mirror.x, mirror.y);
    evaluatePuzzle({ penalize: true });
  }

  function updateMirrorVisuals(mirror) {
    const surfaceLine = mirror.el.querySelector('.mirror-surface-indicator');
    const angleTag = mirror.el.querySelector('.mirror-angle-tag');

    if (angleTag) angleTag.textContent = `${mirror.angle}°`;
    if (surfaceLine) {
      surfaceLine.style.transform = `rotate(${mirror.angle + 45}deg)`;
    }
    mirror.el.setAttribute('data-angle', mirror.angle);
    const label = mirror.decoy ? `Red decoy mirror ${mirror.el.dataset.index}` : `Route mirror ${Number(mirror.el.dataset.index) + 1}`;
    mirror.el.setAttribute('aria-label', `${label}, ${mirror.angle} degrees. Activate to rotate 90 degrees.`);
  }

  function renderIntegrity() {
    integrityCells.forEach((cell, index) => cell.classList.toggle('spent', index < integrityStrikes));
    const readout = document.getElementById('integrity-readout');
    if (readout) readout.setAttribute('aria-label', `Vault integrity: ${integrityCells.length - integrityStrikes} of ${integrityCells.length} cells remaining`);
  }

  function traceSingleRay(startPos, startDir) {
    let pos = { x: startPos.x, y: startPos.y };
    let dir = startDir;
    const path = [{ x: pos.x, y: pos.y }];
    const energized = new Set();
    let hitSplitter = false;
    let hitRcvA = false;
    let hitRcvB = false;
    let hitDecoy = false;

    for (let step = 0; step < 12; step++) {
      let nextHit = null;
      let minDist = Infinity;

      // Check obstacles
      OBSTACLES.forEach(obs => {
        let hit = false, dist = Infinity;
        if (dir === 'RIGHT' && obs.y === pos.y && obs.x > pos.x) { hit = true; dist = obs.x - pos.x; }
        else if (dir === 'LEFT' && obs.y === pos.y && obs.x < pos.x) { hit = true; dist = pos.x - obs.x; }
        else if (dir === 'DOWN' && obs.x === pos.x && obs.y > pos.y) { hit = true; dist = obs.y - pos.y; }
        else if (dir === 'UP' && obs.x === pos.x && obs.y < pos.y) { hit = true; dist = pos.y - obs.y; }
        if (hit && dist < minDist) { minDist = dist; nextHit = { type: 'obs', pos: obs }; }
      });

      // Check splitter
      let sHit = false, sDist = Infinity;
      if (dir === 'RIGHT' && SPLITTER_POS.y === pos.y && SPLITTER_POS.x > pos.x) { sHit = true; sDist = SPLITTER_POS.x - pos.x; }
      else if (dir === 'LEFT' && SPLITTER_POS.y === pos.y && SPLITTER_POS.x < pos.x) { sHit = true; sDist = pos.x - SPLITTER_POS.x; }
      else if (dir === 'DOWN' && SPLITTER_POS.x === pos.x && SPLITTER_POS.y > pos.y) { sHit = true; sDist = SPLITTER_POS.y - pos.y; }
      else if (dir === 'UP' && SPLITTER_POS.x === pos.x && SPLITTER_POS.y < pos.y) { sHit = true; sDist = pos.y - SPLITTER_POS.y; }
      if (sHit && sDist < minDist) { minDist = sDist; nextHit = { type: 'splitter', pos: SPLITTER_POS }; }

      // Check mirrors
      mirrors.forEach(m => {
        let hit = false, dist = Infinity;
        if (dir === 'RIGHT' && m.y === pos.y && m.x > pos.x) { hit = true; dist = m.x - pos.x; }
        else if (dir === 'LEFT' && m.y === pos.y && m.x < pos.x) { hit = true; dist = pos.x - m.x; }
        else if (dir === 'DOWN' && m.x === pos.x && m.y > pos.y) { hit = true; dist = m.y - pos.y; }
        else if (dir === 'UP' && m.x === pos.x && m.y < pos.y) { hit = true; dist = pos.y - m.y; }
        if (hit && dist < minDist) { minDist = dist; nextHit = { type: 'mirror', mirror: m, pos: { x: m.x, y: m.y } }; }
      });

      // Check receivers
      const targets = [
        { type: 'rcvA', pos: RCV_A_POS },
        { type: 'rcvB', pos: RCV_B_POS }
      ];
      targets.forEach(tgt => {
        let hit = false, dist = Infinity;
        if (dir === 'RIGHT' && tgt.pos.y === pos.y && tgt.pos.x > pos.x) { hit = true; dist = tgt.pos.x - pos.x; }
        else if (dir === 'LEFT' && tgt.pos.y === pos.y && tgt.pos.x < pos.x) { hit = true; dist = pos.x - tgt.pos.x; }
        else if (dir === 'DOWN' && tgt.pos.x === pos.x && tgt.pos.y > pos.y) { hit = true; dist = tgt.pos.y - pos.y; }
        else if (dir === 'UP' && tgt.pos.x === pos.x && tgt.pos.y < pos.y) { hit = true; dist = pos.y - tgt.pos.y; }
        if (hit && dist < minDist) { minDist = dist; nextHit = tgt; }
      });

      if (!nextHit) {
        let endX = pos.x, endY = pos.y;
        if (dir === 'RIGHT') endX = 960;
        if (dir === 'LEFT')  endX = 0;
        if (dir === 'DOWN')  endY = 520;
        if (dir === 'UP')    endY = 0;
        path.push({ x: endX, y: endY });
        break;
      }

      path.push({ x: nextHit.pos.x, y: nextHit.pos.y });
      pos = nextHit.pos;

      if (nextHit.type === 'obs') break;
      if (nextHit.type === 'rcvA') { hitRcvA = true; break; }
      if (nextHit.type === 'rcvB') { hitRcvB = true; break; }
      if (nextHit.type === 'splitter') { hitSplitter = true; break; }

      if (nextHit.type === 'mirror') {
        if (nextHit.mirror.decoy) {
          hitDecoy = true;
          break;
        }
        const outDir = reflectRay(dir, nextHit.mirror.angle);
        if (outDir) {
          energized.add(nextHit.mirror.id);
          dir = outDir;
        } else {
          break;
        }
      }
    }

    return { path, energized, hitSplitter, hitRcvA, hitRcvB, hitDecoy };
  }

  function traceFullOpticalCircuit() {
    const primary = traceSingleRay(SOURCE_POS, 'RIGHT');
    let alpha = null;
    let beta = null;
    const allEnergized = new Set(primary.energized);

    if (primary.hitSplitter) {
      alpha = traceSingleRay(SPLITTER_POS, 'UP');
      beta = traceSingleRay(SPLITTER_POS, 'DOWN');
      alpha.energized.forEach(id => allEnergized.add(id));
      beta.energized.forEach(id => allEnergized.add(id));
    }

    const hitRcvA = alpha ? alpha.hitRcvA : false;
    const hitRcvB = beta ? beta.hitRcvB : false;
    const hitDecoy = primary.hitDecoy || Boolean(alpha?.hitDecoy) || Boolean(beta?.hitDecoy);

    return { primary, alpha, beta, allEnergized, hitRcvA, hitRcvB, hitDecoy };
  }

  function evaluatePuzzle({ penalize = false } = {}) {
    const { primary, allEnergized, hitRcvA, hitRcvB, hitDecoy } = traceFullOpticalCircuit();
    const board = document.getElementById('puzzle-board');

    if (penalize && hitDecoy && !decoyFaultActive) {
      integrityStrikes += 1;
      renderIntegrity();
      board?.classList.add('decoy-hit');
      gameContainer.classList.add('alarm-active');
      setTimeout(() => {
        board?.classList.remove('decoy-hit');
        if (currentState !== STATES.DEBUGGING) gameContainer.classList.remove('alarm-active');
      }, 650);

      if (integrityStrikes >= integrityCells.length) {
        puzzleOverloading = true;
        board?.classList.add('overload');
        puzzleStatusEl.textContent = 'CORE OVERLOAD · CIRCUIT RESETTING';
        showDialogue('The decoys have overloaded the vault. Recalibrating the circuit.');
        setTimeout(() => {
          mirrors.forEach((mirror, index) => {
            mirror.angle = INITIAL_ANGLES[index];
            updateMirrorVisuals(mirror);
            mirror.el.classList.remove('energized');
          });
          integrityStrikes = 0;
          decoyFaultActive = false;
          puzzleOverloading = false;
          board?.classList.remove('decoy-hit', 'overload');
          gameContainer.classList.remove('alarm-active');
          renderIntegrity();
          evaluatePuzzle();
          puzzleStatusEl.textContent = `CONTAINMENT ACTIVE · 0/${ROUTE_MIRROR_COUNT} MIRRORS`;
        }, 1100);
        return;
      }
    }
    decoyFaultActive = hitDecoy;

    // Visual feedback on mirror nodes
    mirrors.forEach(m => {
      m.el.classList.toggle('energized', allEnergized.has(m.id));
    });

    // Visual feedback on splitter
    prismSplitterEl.classList.toggle('active', primary.hitSplitter);

    // Visual feedback on receivers
    receiverAlphaEl.classList.toggle('active', hitRcvA);
    receiverBetaEl.classList.toggle('active', hitRcvB);

    // Update HUD Relay badges
    if (hitRcvA) {
      relayAlphaTag.classList.add('powered');
      relayAlphaTag.querySelector('.relay-text').textContent = 'RELAY α: CHARGED';
    } else {
      relayAlphaTag.classList.remove('powered');
      relayAlphaTag.querySelector('.relay-text').textContent = 'RELAY α: INACTIVE';
    }

    if (hitRcvB) {
      relayBetaTag.classList.add('powered');
      relayBetaTag.querySelector('.relay-text').textContent = 'RELAY β: CHARGED';
    } else {
      relayBetaTag.classList.remove('powered');
      relayBetaTag.querySelector('.relay-text').textContent = 'RELAY β: INACTIVE';
    }

    // Win condition: both relays charged through all ten route mirrors.
    if (hitRcvA && hitRcvB && allEnergized.size === ROUTE_MIRROR_COUNT && !hitDecoy && !puzzleSolved) {
      puzzleSolved = true;
      puzzleStatusEl.textContent = 'DUAL CONTAINMENT BREACHED';
      puzzleStatusEl.classList.add('connected');

      mirrors.forEach(m => m.el.classList.add('locked'));
      mirrors.forEach(m => {
        m.el.tabIndex = -1;
        m.el.setAttribute('aria-disabled', 'true');
      });
      showDialogue("The twin harmonics align. The vault is collapsing!");

      // Loki strides confidently into center stage!
      if (lokiContainer) {
        lokiContainer.style.left = '515px';
      }

      setTimeout(() => {
        setPhase(STATES.DEBUGGING);
      }, 2400);
    } else if (hitRcvA || hitRcvB) {
      puzzleStatusEl.textContent = `PARTIAL ALIGNMENT · ${allEnergized.size}/${ROUTE_MIRROR_COUNT} MIRRORS`;
      puzzleStatusEl.classList.remove('connected');
    } else {
      puzzleStatusEl.textContent = `CONTAINMENT ACTIVE · ${allEnergized.size}/${ROUTE_MIRROR_COUNT} MIRRORS`;
      puzzleStatusEl.classList.remove('connected');
    }

    if (hitDecoy && !puzzleOverloading) {
      puzzleStatusEl.textContent = `DECOY HIT · ${integrityCells.length - integrityStrikes} INTEGRITY LEFT`;
    }
  }

  function drawLaserPathVolumetric(ctx, path, primaryColor, glowColor, width = 6, isDecoy = false) {
    if (!path || path.length < 2) return;

    // 1. Broad Volumetric Atmospheric Haze
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const glowWidth = width * 3.2 + Math.sin(beamPulsePhase) * 4;
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = glowWidth;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 24;
    ctx.stroke();

    // 2. Focused Plasma Core Body
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = width * 1.2;
    ctx.shadowBlur = 10;
    ctx.stroke();

    // 3. Ultra-Bright White Hot Centerline
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1.8, width * 0.35);
    ctx.shadowBlur = 4;
    ctx.stroke();

    // 4. Traveling Photon Energy Packets along the beam lines
    for (let i = 0; i < path.length - 1; i++) {
      const p1 = path[i];
      const p2 = path[i + 1];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 4) continue;

      const photonSpacing = 55;
      const speed = photonTravelOffset % photonSpacing;

      for (let offset = speed; offset < dist; offset += photonSpacing) {
        const ratio = offset / dist;
        const px = p1.x + dx * ratio;
        const py = p1.y + dy * ratio;

        ctx.beginPath();
        ctx.arc(px, py, Math.max(2, width * 0.45), 0, Math.PI * 2);
        ctx.fillStyle = isDecoy ? '#ff99aa' : '#ffffff';
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 12;
        ctx.fill();
      }

      // Spark bursts at reflection vertices
      if (i > 0 && Math.random() < 0.25) {
        spawnLaserSparks(p1.x, p1.y, isDecoy ? '#ff2244' : '#00e1ff', 1);
      }
    }

    // Spark burst at terminal impact point
    const endPoint = path[path.length - 1];
    if (Math.random() < 0.3) {
      spawnLaserSparks(endPoint.x, endPoint.y, isDecoy ? '#ff2244' : primaryColor, 2);
    }
  }

  function drawMagicArcs(ctx) {
    for (let i = magicArcs.length - 1; i >= 0; i--) {
      const arc = magicArcs[i];
      arc.alpha -= arc.decay;
      if (arc.alpha <= 0) {
        magicArcs.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(arc.startX, arc.startY);

      const midX = (arc.startX + arc.targetX) / 2;
      const midY = (arc.startY + arc.targetY) / 2;
      const jitterX = Math.sin(beamPulsePhase * 4 + i) * 18;
      const jitterY = Math.cos(beamPulsePhase * 4 + i) * 18;

      ctx.quadraticCurveTo(midX + jitterX, midY + jitterY, arc.targetX, arc.targetY);
      ctx.strokeStyle = `rgba(0, 255, 119, ${arc.alpha})`;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#00ff77';
      ctx.shadowBlur = 18;
      ctx.stroke();

      ctx.strokeStyle = `rgba(255, 255, 255, ${arc.alpha * 0.9})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    }
  }

  function updateAndDrawSparks(ctx) {
    for (let i = sparkParticles.length - 1; i >= 0; i--) {
      const p = sparkParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        sparkParticles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    }
  }

  function startBeamRenderer() {
    if (beamAnimFrame) cancelAnimationFrame(beamAnimFrame);

    function renderLoop() {
      beamPulsePhase += 0.06;
      photonTravelOffset += 1.8;
      beamCtx.clearRect(0, 0, 960, 520);

      const { primary, alpha, beta } = traceFullOpticalCircuit();

      // 1. Draw Primary Beam (Electric Tesseract Blue)
      drawLaserPathVolumetric(
        beamCtx,
        primary.path,
        primary.hitDecoy ? 'rgba(255, 50, 75, 0.95)' : 'rgba(0, 215, 255, 0.9)',
        primary.hitDecoy ? 'rgba(255, 20, 50, 0.6)' : 'rgba(0, 180, 255, 0.45)',
        6,
        primary.hitDecoy
      );

      // 2. Draw Branch Alpha (Upper - Prismatic Azure Cyan)
      if (alpha) {
        drawLaserPathVolumetric(
          beamCtx,
          alpha.path,
          alpha.hitDecoy ? 'rgba(255, 50, 75, 0.95)' : 'rgba(0, 235, 255, 0.92)',
          alpha.hitDecoy ? 'rgba(255, 20, 50, 0.6)' : 'rgba(0, 210, 255, 0.45)',
          5.5,
          alpha.hitDecoy
        );
      }

      // 3. Draw Branch Beta (Lower - Mystic Emerald Cyan)
      if (beta) {
        drawLaserPathVolumetric(
          beamCtx,
          beta.path,
          beta.hitDecoy ? 'rgba(255, 50, 75, 0.95)' : 'rgba(0, 255, 170, 0.92)',
          beta.hitDecoy ? 'rgba(255, 20, 50, 0.6)' : 'rgba(0, 255, 119, 0.45)',
          5.5,
          beta.hitDecoy
        );
      }

      // 4. Draw Loki Magic Telekinetic Arcs
      drawMagicArcs(beamCtx);

      // 5. Draw Spark Particles
      updateAndDrawSparks(beamCtx);

      beamAnimFrame = requestAnimationFrame(renderLoop);
    }

    renderLoop();
  }

  // ==========================================================================
  // PHASE 3: TVA DIAGNOSTICS & DEBUGGING INTERRUPTION
  // ==========================================================================
  const btnDebugBypass = document.getElementById('btn-debug-bypass');

  function initDebuggingPhase() {
    document.querySelectorAll('.terminal-log .dynamic-log').forEach(line => line.remove());
    btnDebugBypass.disabled = false;
    btnDebugBypass.querySelector('.btn-text').textContent = 'OVERRIDE LOCKDOWN';
    btnDebugBypass.onclick = handleBypassClick;
  }

  function handleBypassClick() {
    btnDebugBypass.disabled = true;
    btnDebugBypass.querySelector('.btn-text').textContent = 'INITIALIZING SYSTEM OVERRIDE...';

    const terminalLog = document.querySelector('.terminal-log');
    const p1 = document.createElement('p');
    p1.className = 'log-line warning dynamic-log';
    p1.innerHTML = '<span class="log-prefix">&gt;&gt;</span> INJECTING TEMPORAL BYPASS PROTOCOL...';
    terminalLog.appendChild(p1);

    setTimeout(() => {
      const p2 = document.createElement('p');
      p2.className = 'log-line success dynamic-log';
      p2.innerHTML = '<span class="log-prefix">&gt;&gt;</span> TVA ERROR OVERRIDDEN. CORE RESTORATION CONFIRMED.';
      terminalLog.appendChild(p2);

      // Infiltration alarm dismissal: update tapes and trigger complete power-down!
      const topTape = document.querySelector('.hazard-tape.top .hazard-text');
      const botTape = document.querySelector('.hazard-tape.bottom .hazard-text');
      if (topTape) topTape.textContent = '>> TEMPORAL OVERRIDE ACCEPTED // SECURITY PURGE COMPLETE <<';
      if (botTape) botTape.textContent = '>> INFILTRATION PURGED // CONTAINMENT RESTORED TO STASIS <<';

      setTimeout(() => {
        dismissInfiltrationAlarms();
        showDialogue("A childish security protocol. Easily bypassed.");
      }, 500);

      setTimeout(() => {
        setPhase(STATES.RESTART);
      }, 1600);
    }, 1200);
  }

  function triggerBarrierShatter() {
    const container = document.getElementById('barrier-shards');
    if (!container) return;
    container.innerHTML = '';
    container.classList.add('barrier-shards-active');

    // 6 radial hexagon shards flying outward in a circle
    const vectors = [
      'translate(0px, -65px)',
      'translate(56px, -32px)',
      'translate(56px, 32px)',
      'translate(0px, 65px)',
      'translate(-56px, 32px)',
      'translate(-56px, -32px)'
    ];

    vectors.forEach((vec, idx) => {
      const shard = document.createElement('div');
      shard.className = 'barrier-shard';
      shard.style.top = '50%';
      shard.style.left = '50%';
      shard.style.setProperty('--shard-vector', vec);
      shard.style.animationDelay = `${idx * 0.04}s`;
      container.appendChild(shard);
    });

    setTimeout(() => {
      container.classList.remove('barrier-shards-active');
      container.innerHTML = '';
    }, 1400);
  }

  // ==========================================================================
  // PHASE 4: GRAND FINALE - CLAIM THE TESSERACT
  // ==========================================================================
  function executeVaultRebootSequence() {
    // 1. Vault restarts, all infiltration alarms completely cleared
    dismissInfiltrationAlarms();
    phases.debug.classList.remove('active');

    // Loki advances boldly towards the Tesseract!
    if (lokiContainer) {
      lokiContainer.style.left = '750px';
    }

    // 2. Power conduit venting & Loki casting
    setLokiState('loki-actor-casting');
    showDialogue("Alarms silenced. The vault belongs to me.");

    // Conduits vent excess plasma
    const conduitAlpha = document.getElementById('conduit-alpha');
    const conduitBeta = document.getElementById('conduit-beta');
    if (conduitAlpha) conduitAlpha.classList.add('conduit-venting');
    if (conduitBeta) conduitBeta.classList.add('conduit-venting');

    // 3. Shatter energy barrier dome with hexagonal fragments
    setTimeout(() => {
      barrierDome.classList.remove('active');
      barrierDome.classList.add('dissolved');
      triggerBarrierShatter();
    }, 1200);

    // 4. Free the Tesseract and create mathematical vector magic bridge
    setTimeout(() => {
      tesseractCube.classList.add('scripted-motion', 'surging');
      tesseractCube.style.transition = 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
      tesseractCube.style.transform = 'translateY(-35px) scale(1.1)';

      const dock = document.getElementById('loki-held-cube');
      const cubeRect = tesseractCube.getBoundingClientRect();
      const dockRect = dock.getBoundingClientRect();
      const containerRect = gameContainer.getBoundingClientRect();

      const bridgeStartX = (dockRect.left + dockRect.width / 2) - containerRect.left;
      const bridgeStartY = (dockRect.top + dockRect.height / 2) - containerRect.top;
      const bridgeEndX = (cubeRect.left + cubeRect.width / 2) - containerRect.left;
      const bridgeEndY = (cubeRect.top + cubeRect.height / 2) - containerRect.top;

      const dist = Math.hypot(bridgeEndX - bridgeStartX, bridgeEndY - bridgeStartY);
      const angle = Math.atan2(bridgeEndY - bridgeStartY, bridgeEndX - bridgeStartX) * 180 / Math.PI;

      greenMagicBridge.style.left = `${bridgeStartX}px`;
      greenMagicBridge.style.top = `${bridgeStartY}px`;
      greenMagicBridge.style.width = `${dist}px`;
      greenMagicBridge.style.transform = `rotate(${angle}deg)`;
      greenMagicBridge.classList.add('active');
    }, 2200);

    // 5. Tesseract floats across chamber toward Loki's hand
    setTimeout(() => {
      const dock = document.getElementById('loki-held-cube');
      const cubeRect = tesseractCube.getBoundingClientRect();
      const dockRect = dock.getBoundingClientRect();
      const dx = dockRect.left + dockRect.width / 2 - (cubeRect.left + cubeRect.width / 2);
      const dy = dockRect.top + dockRect.height / 2 - (cubeRect.top + cubeRect.height / 2);
      tesseractCube.classList.add('in-flight');
      tesseractCube.style.transition = 'transform 2.6s cubic-bezier(0.25, 1, 0.5, 1)';
      tesseractCube.style.transform = `translate(${dx}px, ${dy}px) scale(0.6)`;
    }, 3200);

    // 6. Loki catches and docks the Tesseract in hand with radial shockwave
    setTimeout(() => {
      greenMagicBridge.classList.remove('active');
      tesseractCube.style.opacity = '0';
      setLokiState('loki-actor-victory');

      const dockPulse = document.getElementById('tesseract-dock-pulse');
      if (dockPulse) dockPulse.classList.add('pulsing');

      showDialogue("And that... was easier than expected.", 5000);
    }, 5800);

    // 7. Show Asgardian Victory Overlay
    setTimeout(() => {
      setPhase(STATES.COMPLETED);
      const victoryCard = document.getElementById('victory-card');
      victoryCard.classList.remove('hidden');
    }, 7200);
  }

  // ==========================================================================
  // EVENT LISTENERS & INITIALIZATION
  // ==========================================================================
  function setupEventListeners() {
    const btnStartPuzzle = document.getElementById('btn-start-puzzle');
    if (btnStartPuzzle) {
      btnStartPuzzle.onclick = () => setPhase(STATES.MIRROR_PUZZLE);
    }

    const btnPlayAgain = document.getElementById('btn-play-again');
    if (btnPlayAgain) {
      btnPlayAgain.onclick = () => {
        // Reset Loki to left staging
        if (lokiContainer) {
          lokiContainer.style.left = '-15px';
        }
        // Reset chamber elements
        barrierDome.classList.remove('dissolved');
        barrierDome.classList.add('active');
        tesseractCube.style.transition = 'none';
        tesseractCube.style.transform = 'none';
        tesseractCube.style.opacity = '1';
        tesseractCube.classList.remove('scripted-motion', 'surging', 'in-flight');
        greenMagicBridge.classList.remove('active');
        greenMagicBridge.style.transform = 'none';
        greenMagicBridge.style.width = '';
        const dockPulse = document.getElementById('tesseract-dock-pulse');
        if (dockPulse) dockPulse.classList.remove('pulsing');
        dismissInfiltrationAlarms();
        const victoryCard = document.getElementById('victory-card');
        victoryCard.classList.add('hidden');
        vaultScene.style.transform = 'translateZ(0px)';
        setPhase(STATES.INTRO);
      };
    }

    document.addEventListener('keydown', event => {
      if (currentState !== STATES.MIRROR_PUZZLE || event.key.toLowerCase() !== 'r') return;
      event.preventDefault();
      btnResetMirrors?.click();
    });
  }

  window.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    window.addEventListener('resize', fitPuzzleBoard);
    setPhase(STATES.INTRO);
  });

})();
