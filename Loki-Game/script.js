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
  // PHASE 4: CINEMATIC GRAND FINALE - CLAIM THE TESSERACT
  // ==========================================================================
  let cinematicVFXRunning = false;
  let cinematicVFXAnimId = null;

  // --------------------------------------------------------------------------
  // High-Performance 60fps 4D Hypercube & Particle Physics VFX Engine
  // --------------------------------------------------------------------------
  const CinematicEngine = (() => {
    const vfxCanvas = document.getElementById('cinematic-vfx-canvas');
    const vfxCtx = vfxCanvas ? vfxCanvas.getContext('2d') : null;

    // 4D Hypercube (Tesseract) Mathematical Model
    const tesseractVertices = [];
    for (let i = 0; i < 16; i++) {
      tesseractVertices.push([
        (i & 1 ? 1 : -1),
        (i & 2 ? 1 : -1),
        (i & 4 ? 1 : -1),
        (i & 8 ? 1 : -1)
      ]);
    }

    const tesseractEdges = [];
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        let diff = 0;
        for (let k = 0; k < 4; k++) {
          if (tesseractVertices[i][k] !== tesseractVertices[j][k]) diff++;
        }
        if (diff === 1) tesseractEdges.push([i, j]);
      }
    }

    // 24 Hypercube square faces for volumetric translucent refraction
    const tesseractFaces = [];
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        for (let k = j + 1; k < 16; k++) {
          for (let l = k + 1; l < 16; l++) {
            let sharedCoords = 0;
            for (let c = 0; c < 4; c++) {
              if (tesseractVertices[i][c] === tesseractVertices[j][c] &&
                  tesseractVertices[j][c] === tesseractVertices[k][c] &&
                  tesseractVertices[k][c] === tesseractVertices[l][c]) {
                sharedCoords++;
              }
            }
            if (sharedCoords === 2) {
              tesseractFaces.push([i, j, l, k]);
            }
          }
        }
      }
    }

    // Orbiting cosmic stardust particles
    const cosmicMotes = Array.from({ length: 48 }, (_, i) => ({
      angle: (i / 48) * Math.PI * 2,
      orbitR: 28 + (i % 6) * 9,
      speed: 0.02 + (i % 5) * 0.008,
      tilt: 0.35 + (i % 3) * 0.25,
      yOffset: ((i % 7) - 3) * 5,
      size: 1.2 + (i % 3) * 0.8,
      alpha: 0.3 + (i % 4) * 0.22
    }));

    // Particle pools for explosion & shockwaves
    let shards = [];
    let shockwaves = [];
    let sparks = [];
    let tendrilParticles = [];
    let distortionRings = [];

    // State variables
    let cubeX = 1091;
    let cubeY = 428;
    let cubeScale = 1.0;
    let cubeVisible = false;
    let tesseractAngles = { xw: 0, yz: 0, zw: 0 };
    let runeAngle = 0;
    let tendrilStrength = 0;
    let flashAlpha = 0;
    let caught = false;
    let catchGlow = 0;

    function reset() {
      shards = [];
      shockwaves = [];
      sparks = [];
      tendrilParticles = [];
      distortionRings = [];
      cubeX = 1091;
      cubeY = 428;
      cubeScale = 1.0;
      cubeVisible = false;
      tesseractAngles = { xw: 0, yz: 0, zw: 0 };
      runeAngle = 0;
      tendrilStrength = 0;
      flashAlpha = 0;
      caught = false;
      catchGlow = 0;
      if (vfxCtx && vfxCanvas) {
        vfxCtx.clearRect(0, 0, vfxCanvas.width, vfxCanvas.height);
      }
    }

    function triggerBarrierShatter(centerX, centerY) {
      flashAlpha = 0.95;
      shockwaves.push({
        x: centerX,
        y: centerY,
        radius: 10,
        maxRadius: 380,
        speed: 16,
        alpha: 1.0,
        color: '#00e5ff'
      });

      // 160 Faceted Crystalline Glass Shards
      const shardCount = 160;
      for (let i = 0; i < shardCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 4 + Math.random() * 19;
        const numPts = 3 + Math.floor(Math.random() * 3);
        const polyPts = [];
        const baseRadius = 4 + Math.random() * 14;
        for (let p = 0; p < numPts; p++) {
          const pAngle = (p / numPts) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
          const r = baseRadius * (0.6 + Math.random() * 0.8);
          polyPts.push({ x: Math.cos(pAngle) * r, y: Math.sin(pAngle) * r });
        }

        shards.push({
          x: centerX + (Math.random() - 0.5) * 20,
          y: centerY + (Math.random() - 0.5) * 20,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (1.5 + Math.random() * 3.5),
          rot: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.28,
          poly: polyPts,
          alpha: 1.0,
          life: 0,
          maxLife: 55 + Math.random() * 45,
          colorHue: 185 + Math.random() * 30
        });
      }

      // Spark Burst
      for (let s = 0; s < 60; s++) {
        const sAngle = Math.random() * Math.PI * 2;
        const sSpeed = 3 + Math.random() * 14;
        sparks.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(sAngle) * sSpeed,
          vy: Math.sin(sAngle) * sSpeed,
          life: 0,
          maxLife: 30 + Math.random() * 35,
          alpha: 1.0,
          color: s % 2 === 0 ? '#00e5ff' : '#00ff77',
          size: 1.5 + Math.random() * 2
        });
      }
    }

    function triggerCatchBurst(handX, handY) {
      caught = true;
      catchGlow = 1.0;
      flashAlpha = 0.85;

      // Colossal full-screen supernova shockwave
      shockwaves.push({
        x: handX,
        y: handY,
        radius: 12,
        maxRadius: 850,
        speed: 28,
        alpha: 1.0,
        color: '#ffffff'
      });
      shockwaves.push({
        x: handX,
        y: handY,
        radius: 8,
        maxRadius: 720,
        speed: 22,
        alpha: 0.9,
        color: '#00e5ff'
      });
      shockwaves.push({
        x: handX,
        y: handY,
        radius: 4,
        maxRadius: 600,
        speed: 17,
        alpha: 0.85,
        color: '#00ff77'
      });

      // 80 High-Velocity Forward Kinetic Sparks
      for (let s = 0; s < 80; s++) {
        const sAngle = -Math.PI * 0.75 + Math.random() * Math.PI * 1.5;
        const sSpeed = 6 + Math.random() * 22;
        sparks.push({
          x: handX,
          y: handY,
          vx: Math.cos(sAngle) * sSpeed,
          vy: Math.sin(sAngle) * sSpeed,
          life: 0,
          maxLife: 40 + Math.random() * 45,
          alpha: 1.0,
          color: s % 3 === 0 ? '#ffffff' : (s % 3 === 1 ? '#00e5ff' : '#00ff77'),
          size: 2 + Math.random() * 2.5
        });
      }
    }

    // 4D Rotation and Projection of Hypercube
    function project4D(v, angles, size, cx, cy) {
      let x = v[0], y = v[1], z = v[2], w = v[3];

      // Rotate X-W plane
      const c1 = Math.cos(angles.xw), s1 = Math.sin(angles.xw);
      const x1 = x * c1 - w * s1;
      const w1 = x * s1 + w * c1;

      // Rotate Y-Z plane
      const c2 = Math.cos(angles.yz), s2 = Math.sin(angles.yz);
      const y2 = y * c2 - z * s2;
      const z2 = y * s2 + z * c2;

      // Rotate Z-W plane
      const c3 = Math.cos(angles.zw), s3 = Math.sin(angles.zw);
      const z3 = z2 * c3 - w1 * s3;
      const w3 = z2 * s3 + w1 * c3;

      // 4D to 3D perspective projection
      const wDist = 2.4;
      const scale4D = 1 / (wDist - w3);
      const x3D = x1 * scale4D;
      const y3D = y2 * scale4D;
      const z3D = z3 * scale4D;

      // 3D to 2D perspective projection
      const zDist = 3.6;
      const scale3D = (size * 105) / (zDist - z3D);
      return {
        x: cx + x3D * scale3D,
        y: cy + y3D * scale3D,
        depth: z3D + w3
      };
    }

    function render(time) {
      if (!vfxCtx || !vfxCanvas) return;
      vfxCtx.clearRect(0, 0, vfxCanvas.width, vfxCanvas.height);

      const lokiHandX = (lokiContainer ? lokiContainer.offsetLeft : 310) + 168;
      const lokiHandY = 465;

      // 1. Full-Screen Flash Bleed
      if (flashAlpha > 0.005) {
        vfxCtx.save();
        vfxCtx.fillStyle = `rgba(200, 245, 255, ${flashAlpha})`;
        vfxCtx.fillRect(0, 0, vfxCanvas.width, vfxCanvas.height);
        vfxCtx.restore();
        flashAlpha *= 0.88;
      }

      // 2. Crystalline Glass Shards Physics
      for (let i = shards.length - 1; i >= 0; i--) {
        const s = shards[i];
        s.life++;
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.32; // Gravity
        s.vx *= 0.985;
        s.vy *= 0.985;
        s.rot += s.vRot;
        s.alpha = Math.max(0, 1 - (s.life / s.maxLife));

        vfxCtx.save();
        vfxCtx.translate(s.x, s.y);
        vfxCtx.rotate(s.rot);
        vfxCtx.beginPath();
        if (s.poly && s.poly.length > 0) {
          vfxCtx.moveTo(s.poly[0].x, s.poly[0].y);
          for (let p = 1; p < s.poly.length; p++) {
            vfxCtx.lineTo(s.poly[p].x, s.poly[p].y);
          }
          vfxCtx.closePath();
          vfxCtx.fillStyle = `hsla(${s.colorHue}, 90%, 65%, ${s.alpha * 0.45})`;
          vfxCtx.fill();
          vfxCtx.lineWidth = 1.2;
          vfxCtx.strokeStyle = `rgba(220, 255, 255, ${s.alpha * 0.95})`;
          vfxCtx.stroke();
        }
        vfxCtx.restore();

        // Shard Spark Trail
        if (s.life % 4 === 0 && s.alpha > 0.3) {
          sparks.push({
            x: s.x,
            y: s.y,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            life: 0,
            maxLife: 20,
            alpha: s.alpha * 0.7,
            color: '#00e5ff',
            size: 1
          });
        }

        if (s.life >= s.maxLife) {
          shards.splice(i, 1);
        }
      }

      // 3. Shockwave Rings
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += sw.speed;
        sw.alpha = Math.max(0, 1 - (sw.radius / sw.maxRadius));

        vfxCtx.save();
        vfxCtx.beginPath();
        vfxCtx.ellipse(sw.x, sw.y, sw.radius, sw.radius * 0.58, 0, 0, Math.PI * 2);
        vfxCtx.lineWidth = Math.max(1, (1 - (sw.radius / sw.maxRadius)) * 6.5);
        vfxCtx.strokeStyle = sw.color;
        vfxCtx.globalAlpha = sw.alpha;
        vfxCtx.shadowColor = sw.color;
        vfxCtx.shadowBlur = 24;
        vfxCtx.stroke();
        vfxCtx.restore();

        if (sw.radius >= sw.maxRadius) {
          shockwaves.splice(i, 1);
        }
      }

      // 4. Kinetic Sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i];
        sp.life++;
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vy += 0.08;
        sp.vx *= 0.97;
        sp.alpha = Math.max(0, 1 - (sp.life / sp.maxLife));

        vfxCtx.save();
        vfxCtx.fillStyle = sp.color;
        vfxCtx.globalAlpha = sp.alpha;
        vfxCtx.shadowColor = sp.color;
        vfxCtx.shadowBlur = 8;
        vfxCtx.fillRect(sp.x - sp.size / 2, sp.y - sp.size / 2, sp.size, sp.size);
        vfxCtx.restore();

        if (sp.life >= sp.maxLife) {
          sparks.splice(i, 1);
        }
      }

      // 5. Loki's Seidr Magic Tendrils & 3D Runic Arrays
      if (tendrilStrength > 0.01) {
        // A. 3D Rotating Asgardian Runic Circles around Loki's Hand
        runeAngle += 0.035;
        vfxCtx.save();
        vfxCtx.translate(lokiHandX, lokiHandY);
        vfxCtx.scale(1, 0.45); // 3D Perspective tilt
        vfxCtx.rotate(runeAngle);

        vfxCtx.beginPath();
        vfxCtx.arc(0, 0, 52 * tendrilStrength, 0, Math.PI * 2);
        vfxCtx.strokeStyle = 'rgba(0, 255, 119, 0.7)';
        vfxCtx.lineWidth = 2.2;
        vfxCtx.shadowColor = '#00ff77';
        vfxCtx.shadowBlur = 18;
        vfxCtx.stroke();

        vfxCtx.beginPath();
        vfxCtx.arc(0, 0, 36 * tendrilStrength, 0, Math.PI * 2);
        vfxCtx.setLineDash([8, 6]);
        vfxCtx.strokeStyle = 'rgba(242, 201, 76, 0.85)';
        vfxCtx.lineWidth = 1.8;
        vfxCtx.stroke();
        vfxCtx.setLineDash([]);

        // Runic Glyphs
        const runes = ['ᛚ', 'ᛟ', 'ᚲ', 'ᛁ', 'ᚨ', 'ᛋ', 'ᚷ', 'ᚨ', 'ᚱ', 'ᛞ'];
        vfxCtx.font = 'bold 13px Cinzel, serif';
        vfxCtx.fillStyle = 'rgba(255, 230, 130, 0.9)';
        for (let r = 0; r < runes.length; r++) {
          const rA = (r / runes.length) * Math.PI * 2;
          const rx = Math.cos(rA) * 44 * tendrilStrength;
          const ry = Math.sin(rA) * 44 * tendrilStrength;
          vfxCtx.fillText(runes[r], rx - 4, ry + 4);
        }
        vfxCtx.restore();

        // B. Procedural Writhing Seidr Tendrils Connecting Hand to Cube
        const numTendrils = 4;
        const dx = cubeX - lokiHandX;
        const dy = cubeY - lokiHandY;

        for (let t = 0; t < numTendrils; t++) {
          const wavePhase = time * 0.004 + t * 1.6;
          const cp1x = lokiHandX + dx * 0.3 + Math.sin(wavePhase) * 45;
          const cp1y = lokiHandY + dy * 0.3 - 40 + Math.cos(wavePhase * 1.2) * 35;
          const cp2x = lokiHandX + dx * 0.7 + Math.cos(wavePhase * 0.8) * 40;
          const cp2y = lokiHandY + dy * 0.7 - 20 + Math.sin(wavePhase * 1.5) * 30;

          // Triple-Pass Glow
          vfxCtx.save();
          vfxCtx.beginPath();
          vfxCtx.moveTo(lokiHandX, lokiHandY);
          vfxCtx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, cubeX, cubeY);

          // Wide outer emerald aura
          vfxCtx.lineWidth = 16 * tendrilStrength;
          vfxCtx.strokeStyle = 'rgba(0, 255, 119, 0.22)';
          vfxCtx.shadowColor = '#00ff77';
          vfxCtx.shadowBlur = 25;
          vfxCtx.stroke();

          // Electric cyan-green plasma ribbon
          vfxCtx.lineWidth = 5 * tendrilStrength;
          vfxCtx.strokeStyle = t % 2 === 0 ? 'rgba(0, 235, 255, 0.85)' : 'rgba(0, 255, 180, 0.85)';
          vfxCtx.shadowColor = '#00e5ff';
          vfxCtx.shadowBlur = 15;
          vfxCtx.stroke();

          // White-hot core
          vfxCtx.lineWidth = 1.8 * tendrilStrength;
          vfxCtx.strokeStyle = '#ffffff';
          vfxCtx.stroke();
          vfxCtx.restore();
        }

        // Particle stream along tendrils
        if (Math.random() < 0.6) {
          tendrilParticles.push({
            p: 0,
            speed: 0.02 + Math.random() * 0.02,
            waveOff: (Math.random() - 0.5) * 20,
            size: 1.5 + Math.random() * 2
          });
        }

        for (let pIdx = tendrilParticles.length - 1; pIdx >= 0; pIdx--) {
          const tp = tendrilParticles[pIdx];
          tp.p += tp.speed;
          if (tp.p >= 1) {
            tendrilParticles.splice(pIdx, 1);
            continue;
          }
          const tP = tp.p;
          const pX = Math.pow(1 - tP, 3) * lokiHandX +
                     3 * Math.pow(1 - tP, 2) * tP * (lokiHandX + dx * 0.3) +
                     3 * (1 - tP) * Math.pow(tP, 2) * (lokiHandX + dx * 0.7) +
                     Math.pow(tP, 3) * cubeX + tp.waveOff * Math.sin(tP * Math.PI);
          const pY = Math.pow(1 - tP, 3) * lokiHandY +
                     3 * Math.pow(1 - tP, 2) * tP * (lokiHandY + dy * 0.3 - 40) +
                     3 * (1 - tP) * Math.pow(tP, 2) * (lokiHandY + dy * 0.7 - 20) +
                     Math.pow(tP, 3) * cubeY;

          vfxCtx.save();
          vfxCtx.fillStyle = '#00ff77';
          vfxCtx.shadowColor = '#00e5ff';
          vfxCtx.shadowBlur = 10;
          vfxCtx.beginPath();
          vfxCtx.arc(pX, pY, tp.size, 0, Math.PI * 2);
          vfxCtx.fill();
          vfxCtx.restore();
        }
      }

      // 6. Volumetric 4D Tesseract Rendering
      if (cubeVisible) {
        tesseractAngles.xw += 0.018;
        tesseractAngles.yz += 0.024;
        tesseractAngles.zw += 0.012;

        const projected = tesseractVertices.map(v =>
          project4D(v, tesseractAngles, cubeScale, cubeX, cubeY)
        );

        // A. 360-Degree Volumetric God Rays
        vfxCtx.save();
        const rayCount = 14;
        const rayLen = (140 + Math.sin(time * 0.005) * 35) * cubeScale;
        vfxCtx.globalCompositeOperation = 'screen';
        for (let r = 0; r < rayCount; r++) {
          const rAng = (r / rayCount) * Math.PI * 2 + time * 0.0012;
          const rW = 0.09 + (r % 3) * 0.03;
          vfxCtx.beginPath();
          vfxCtx.moveTo(cubeX, cubeY);
          vfxCtx.lineTo(cubeX + Math.cos(rAng - rW) * rayLen, cubeY + Math.sin(rAng - rW) * rayLen);
          vfxCtx.lineTo(cubeX + Math.cos(rAng + rW) * rayLen, cubeY + Math.sin(rAng + rW) * rayLen);
          vfxCtx.closePath();
          const rayGrad = vfxCtx.createRadialGradient(cubeX, cubeY, 5, cubeX, cubeY, rayLen);
          rayGrad.addColorStop(0, 'rgba(200, 245, 255, 0.45)');
          rayGrad.addColorStop(0.35, 'rgba(0, 210, 255, 0.22)');
          rayGrad.addColorStop(1, 'transparent');
          vfxCtx.fillStyle = rayGrad;
          vfxCtx.fill();
        }
        vfxCtx.restore();

        // B. Translucent Refractive Facet Faces
        vfxCtx.save();
        vfxCtx.globalCompositeOperation = 'screen';
        tesseractFaces.forEach((face, fIdx) => {
          vfxCtx.beginPath();
          vfxCtx.moveTo(projected[face[0]].x, projected[face[0]].y);
          for (let pt = 1; pt < 4; pt++) {
            vfxCtx.lineTo(projected[face[pt]].x, projected[face[pt]].y);
          }
          vfxCtx.closePath();
          vfxCtx.fillStyle = fIdx % 2 === 0
            ? 'rgba(0, 220, 255, 0.12)'
            : 'rgba(0, 150, 255, 0.08)';
          vfxCtx.fill();
        });
        vfxCtx.restore();

        // C. Glowing 4D Hypercube Wireframe Edges
        vfxCtx.save();
        vfxCtx.lineWidth = 2.2 * cubeScale;
        vfxCtx.strokeStyle = 'rgba(0, 235, 255, 0.95)';
        vfxCtx.shadowColor = '#00e5ff';
        vfxCtx.shadowBlur = 18;
        tesseractEdges.forEach(edge => {
          const p1 = projected[edge[0]];
          const p2 = projected[edge[1]];
          vfxCtx.beginPath();
          vfxCtx.moveTo(p1.x, p1.y);
          vfxCtx.lineTo(p2.x, p2.y);
          vfxCtx.stroke();
        });
        vfxCtx.restore();

        // D. Inner Space Stone Singularity Plasma Core
        vfxCtx.save();
        const coreR = (22 + Math.sin(time * 0.008) * 4) * cubeScale;
        const coreGrad = vfxCtx.createRadialGradient(cubeX, cubeY, 0, cubeX, cubeY, coreR);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.3, 'rgba(180, 245, 255, 0.95)');
        coreGrad.addColorStop(0.65, 'rgba(0, 210, 255, 0.6)');
        coreGrad.addColorStop(1, 'transparent');

        vfxCtx.beginPath();
        vfxCtx.arc(cubeX, cubeY, coreR, 0, Math.PI * 2);
        vfxCtx.fillStyle = coreGrad;
        vfxCtx.shadowColor = '#00e5ff';
        vfxCtx.shadowBlur = 30;
        vfxCtx.fill();

        // 8-Point Caustic Star Flares
        const starLen = (48 + Math.cos(time * 0.01) * 12) * cubeScale;
        vfxCtx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        vfxCtx.lineWidth = 1.8 * cubeScale;
        vfxCtx.shadowColor = '#ffffff';
        vfxCtx.shadowBlur = 14;
        vfxCtx.beginPath();
        vfxCtx.moveTo(cubeX - starLen, cubeY);
        vfxCtx.lineTo(cubeX + starLen, cubeY);
        vfxCtx.moveTo(cubeX, cubeY - starLen);
        vfxCtx.lineTo(cubeX, cubeY + starLen);
        const diagLen = starLen * 0.6;
        vfxCtx.moveTo(cubeX - diagLen, cubeY - diagLen);
        vfxCtx.lineTo(cubeX + diagLen, cubeY + diagLen);
        vfxCtx.moveTo(cubeX + diagLen, cubeY - diagLen);
        vfxCtx.lineTo(cubeX - diagLen, cubeY + diagLen);
        vfxCtx.stroke();
        vfxCtx.restore();

        // E. Orbiting Celestial Stardust Motes
        vfxCtx.save();
        cosmicMotes.forEach(m => {
          m.angle += m.speed;
          const mx = cubeX + Math.cos(m.angle) * m.orbitR * cubeScale;
          const my = cubeY + Math.sin(m.angle) * m.orbitR * m.tilt * cubeScale + m.yOffset * cubeScale;

          vfxCtx.fillStyle = '#e0f8ff';
          vfxCtx.globalAlpha = m.alpha;
          vfxCtx.shadowColor = '#00e5ff';
          vfxCtx.shadowBlur = 6;
          vfxCtx.beginPath();
          vfxCtx.arc(mx, my, m.size * cubeScale, 0, Math.PI * 2);
          vfxCtx.fill();
        });
        vfxCtx.restore();
      }

      // 7. Cataclysmic Catch Aura Resonance & Celestial Specular Glow
      if (cubeVisible && cubeX < lokiHandX + 220) {
        vfxCtx.save();
        vfxCtx.globalCompositeOperation = 'screen';
        const glowProximity = Math.max(0, 1 - (cubeX - lokiHandX) / 220);
        const lokiGlowGrad = vfxCtx.createRadialGradient(lokiHandX - 25, lokiHandY - 60, 10, lokiHandX - 25, lokiHandY - 60, 150);
        lokiGlowGrad.addColorStop(0, `rgba(0, 225, 255, ${0.45 * glowProximity})`);
        lokiGlowGrad.addColorStop(0.5, `rgba(0, 255, 119, ${0.2 * glowProximity})`);
        lokiGlowGrad.addColorStop(1, 'transparent');
        vfxCtx.fillStyle = lokiGlowGrad;
        vfxCtx.beginPath();
        vfxCtx.arc(lokiHandX - 25, lokiHandY - 60, 150, 0, Math.PI * 2);
        vfxCtx.fill();
        vfxCtx.restore();
      }

      if (caught && catchGlow > 0.01) {
        vfxCtx.save();
        const auraR = 110 * catchGlow;
        const cGrad = vfxCtx.createRadialGradient(lokiHandX, lokiHandY, 0, lokiHandX, lokiHandY, auraR);
        cGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        cGrad.addColorStop(0.3, 'rgba(0, 225, 255, 0.65)');
        cGrad.addColorStop(0.7, 'rgba(0, 255, 119, 0.35)');
        cGrad.addColorStop(1, 'transparent');

        vfxCtx.beginPath();
        vfxCtx.arc(lokiHandX, lokiHandY, auraR, 0, Math.PI * 2);
        vfxCtx.fillStyle = cGrad;
        vfxCtx.fill();
        vfxCtx.restore();
      }
    }

    return {
      reset,
      render,
      triggerBarrierShatter,
      triggerCatchBurst,
      setCubePos: (x, y, scale = 1.0) => {
        cubeX = x;
        cubeY = y;
        cubeScale = scale;
      },
      setCubeVisible: (v) => { cubeVisible = v; },
      setTendrilStrength: (s) => { tendrilStrength = s; },
      getCubePos: () => ({ x: cubeX, y: cubeY })
    };
  })();

  function startCinematicVFXLoop() {
    if (cinematicVFXRunning) return;
    cinematicVFXRunning = true;
    function loop(time) {
      if (!cinematicVFXRunning) return;
      CinematicEngine.render(time);
      cinematicVFXAnimId = requestAnimationFrame(loop);
    }
    cinematicVFXAnimId = requestAnimationFrame(loop);
  }

  function stopCinematicVFXLoop() {
    cinematicVFXRunning = false;
    if (cinematicVFXAnimId) {
      cancelAnimationFrame(cinematicVFXAnimId);
      cinematicVFXAnimId = null;
    }
    CinematicEngine.reset();
  }

  // --------------------------------------------------------------------------
  // The Complete Marvel Cinematic Finale Sequence
  // --------------------------------------------------------------------------
  function executeVaultRebootSequence() {
    // 1. Silent, pure visual sequence initialization
    dismissInfiltrationAlarms();
    phases.debug.classList.remove('active');

    // Enable Widescreen 2.39:1 Anamorphic Cinema Bars
    gameContainer.classList.add('cinematic-active');
    gameContainer.classList.remove('cinematic-finished');

    // Reset and launch 60fps VFX Engine
    CinematicEngine.reset();
    startCinematicVFXLoop();

    // Hide old HTML cube and old green bridge; our canvas draws the authentic 4D hypercube
    if (tesseractCube) {
      tesseractCube.style.opacity = '0';
      tesseractCube.style.display = 'none';
    }
    if (greenMagicBridge) {
      greenMagicBridge.style.opacity = '0';
      greenMagicBridge.style.display = 'none';
    }
    const lokiHeldCube = document.getElementById('loki-held-cube');
    if (lokiHeldCube) {
      lokiHeldCube.style.opacity = '0';
      lokiHeldCube.style.display = 'none';
    }

    // Pedestal coordinates in chamber for dramatic cinematic staging
    const pedestalX = 880;
    const pedestalY = 415;

    // Glide the physical pedestal into the hero chamber focal point
    const tesseractChamber = document.getElementById('tesseract-chamber');
    if (tesseractChamber) {
      tesseractChamber.style.transition = 'left 1.4s cubic-bezier(0.25, 1, 0.5, 1), top 1.4s ease';
      tesseractChamber.style.left = `${pedestalX}px`;
      tesseractChamber.style.top = `${pedestalY}px`;
    }

    // Loki advances smoothly into regal hero staging
    const lokiTargetLeft = 310;
    if (lokiContainer) {
      lokiContainer.style.transition = 'left 1.8s cubic-bezier(0.25, 1, 0.5, 1)';
      lokiContainer.style.left = `${lokiTargetLeft}px`;
    }

    // Camera Shot 1: Majestic Establishing Dolly-In
    if (vaultScene) {
      vaultScene.style.transition = 'transform 2.2s cubic-bezier(0.25, 1, 0.5, 1)';
      vaultScene.style.transform = 'scale(1.06) translate(-25px, -12px)';
    }

    // Loki casting pose with dialogue
    setLokiState('loki-actor-casting');
    showDialogue("Alarms silenced. The vault belongs to me.");

    // Conduits vent excess plasma
    const conduitAlpha = document.getElementById('conduit-alpha');
    const conduitBeta = document.getElementById('conduit-beta');
    if (conduitAlpha) conduitAlpha.classList.add('conduit-venting');
    if (conduitBeta) conduitBeta.classList.add('conduit-venting');

    // ------------------------------------------------------------------------
    // Beat 2: Loki Channels Seidr Magic (t = 1.8s)
    // ------------------------------------------------------------------------
    setTimeout(() => {
      // Fade in Seidr Tendrils & 3D Runic Circles
      let str = 0;
      const tendrilInterval = setInterval(() => {
        str += 0.05;
        CinematicEngine.setTendrilStrength(Math.min(1.0, str));
        if (str >= 1.0) clearInterval(tendrilInterval);
      }, 30);

      // Camera Shot 2: Focused Channeling Zoom
      if (vaultScene) {
        vaultScene.style.transition = 'transform 1.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
        vaultScene.style.transform = 'scale(1.12) translate(-60px, -18px)';
      }
    }, 1800);

    // ------------------------------------------------------------------------
    // Beat 3: The Crystalline Barrier Rupture (t = 3.2s)
    // ------------------------------------------------------------------------
    setTimeout(() => {
      // Dissolve the DOM dome and explode 160+ crystalline glass shards on Canvas
      if (barrierDome) {
        barrierDome.classList.remove('active');
        barrierDome.classList.add('dissolved');
      }

      CinematicEngine.triggerBarrierShatter(pedestalX, pedestalY);

      // Camera Impulse Shake & Kinetic Kickback
      if (vaultScene) {
        vaultScene.classList.remove('camera-shaking');
        void vaultScene.offsetWidth; // Force reflow
        vaultScene.classList.add('camera-shaking');
        setTimeout(() => {
          vaultScene.classList.remove('camera-shaking');
        }, 650);
      }
    }, 3200);

    // ------------------------------------------------------------------------
    // Beat 4: Zero-G Levitation of the 4D Tesseract (t = 4.2s)
    // ------------------------------------------------------------------------
    setTimeout(() => {
      CinematicEngine.setCubeVisible(true);
      CinematicEngine.setCubePos(pedestalX, pedestalY, 1.0);

      // Smooth vertical zero-g lift from pedestal
      let liftProgress = 0;
      const liftInterval = setInterval(() => {
        liftProgress += 0.04;
        const curY = pedestalY - Math.sin(liftProgress * Math.PI * 0.5) * 45;
        CinematicEngine.setCubePos(pedestalX, curY, 1.0 + liftProgress * 0.15);
        if (liftProgress >= 1.0) clearInterval(liftInterval);
      }, 25);
    }, 4200);

    // ------------------------------------------------------------------------
    // Beat 5: Celestial Arc Flight across the Vault (t = 5.6s to 8.0s)
    // ------------------------------------------------------------------------
    setTimeout(() => {
      const lokiHandX = lokiTargetLeft + 168;
      const lokiHandY = 465;
      const startX = pedestalX;
      const startY = pedestalY - 45;

      // Camera Shot 3: Tracking Flight
      if (vaultScene) {
        vaultScene.style.transition = 'transform 2.4s cubic-bezier(0.25, 1, 0.5, 1)';
        vaultScene.style.transform = 'scale(1.15) translate(-110px, -22px)';
      }

      const flightDuration = 2200; // ms
      let flightStart = null;

      function animateFlight(now) {
        if (!flightStart) flightStart = now;
        const elapsed = now - flightStart;
        const p = Math.min(1.0, elapsed / flightDuration);

        // Cubic Bezier spline trajectory
        const easeP = 0.5 - Math.cos(p * Math.PI) * 0.5; // Smooth S-curve
        const cpX = (startX + lokiHandX) * 0.5;
        const cpY = Math.min(startY, lokiHandY) - 50;

        const curX = Math.pow(1 - easeP, 2) * startX + 2 * (1 - easeP) * easeP * cpX + Math.pow(easeP, 2) * lokiHandX;
        const curY = Math.pow(1 - easeP, 2) * startY + 2 * (1 - easeP) * easeP * cpY + Math.pow(easeP, 2) * lokiHandY;
        const curScale = 1.15 - easeP * 0.35; // Scales gracefully as it approaches hand

        CinematicEngine.setCubePos(curX, curY, curScale);

        // Specular glow on Loki increases as cube nears
        if (p > 0.6) {
          gameContainer.classList.add('loki-specular-active');
        }

        if (p < 1.0) {
          requestAnimationFrame(animateFlight);
        } else {
          // ------------------------------------------------------------------
          // Beat 6: The Catch — Cataclysmic Cosmic Supernova Burst (t = 8.0s)
          // ------------------------------------------------------------------
          CinematicEngine.setCubePos(lokiHandX, lokiHandY, 0.78);
          CinematicEngine.setTendrilStrength(0);
          CinematicEngine.triggerCatchBurst(lokiHandX, lokiHandY);

          // Transition Loki to Victory Pose
          setLokiState('loki-actor-victory');

          // Camera Impulse Catch
          if (vaultScene) {
            vaultScene.classList.remove('camera-shaking');
            void vaultScene.offsetWidth;
            vaultScene.classList.add('camera-shaking');
            setTimeout(() => {
              vaultScene.classList.remove('camera-shaking');
              vaultScene.style.transition = 'transform 2.5s cubic-bezier(0.16, 1, 0.3, 1)';
              vaultScene.style.transform = 'scale(1.08) translate(-95px, -16px)';
            }, 650);
          }

          // Chamber circuits cosmic surge
          gameContainer.classList.add('vault-cosmic-surge');

          // Subtitle dialogue
          showDialogue("And that... was easier than expected.", 8000);

          // ------------------------------------------------------------------
          // Beat 7: Triumphant Stance (NO VICTORY LAYOUT)
          // ------------------------------------------------------------------
          setTimeout(() => {
            setPhase(STATES.COMPLETED);
            gameContainer.classList.add('cinematic-finished');
          }, 1400);
        }
      }

      requestAnimationFrame(animateFlight);
    }, 5600);
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
        // Stop VFX engine
        stopCinematicVFXLoop();

        // Reset camera and cinematic classes
        gameContainer.classList.remove(
          'cinematic-active',
          'cinematic-finished',
          'loki-specular-active',
          'vault-cosmic-surge'
        );
        if (vaultScene) {
          vaultScene.classList.remove('camera-shaking');
          vaultScene.style.transition = 'none';
          vaultScene.style.transform = 'translateZ(0px)';
        }

        // Reset Loki to left staging
        if (lokiContainer) {
          lokiContainer.style.transition = 'none';
          lokiContainer.style.left = '-15px';
        }

        // Reset chamber elements
        const tChamber = document.getElementById('tesseract-chamber');
        if (tChamber) {
          tChamber.style.transition = 'none';
          tChamber.style.left = '1091px';
          tChamber.style.top = '428px';
        }
        if (barrierDome) {
          barrierDome.classList.remove('dissolved');
          barrierDome.classList.add('active');
        }
        if (tesseractCube) {
          tesseractCube.style.transition = 'none';
          tesseractCube.style.transform = 'none';
          tesseractCube.style.opacity = '1';
          tesseractCube.classList.remove('scripted-motion', 'surging', 'in-flight');
        }
        if (greenMagicBridge) {
          greenMagicBridge.classList.remove('active');
          greenMagicBridge.style.transform = 'none';
          greenMagicBridge.style.width = '';
        }
        const dockPulse = document.getElementById('tesseract-dock-pulse');
        if (dockPulse) dockPulse.classList.remove('pulsing');

        dismissInfiltrationAlarms();
        setPhase(STATES.INTRO);
      };
    }

    document.addEventListener('keydown', event => {
      if (currentState === STATES.MIRROR_PUZZLE && event.key.toLowerCase() === 'r') {
        event.preventDefault();
        btnResetMirrors?.click();
      } else if (currentState === STATES.COMPLETED && event.key.toLowerCase() === 'r') {
        event.preventDefault();
        btnPlayAgain?.click();
      }
    });
  }

  window.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    window.addEventListener('resize', fitPuzzleBoard);
    setPhase(STATES.INTRO);
  });

  // Global exports for test automation and cinematic inspection
  window.LokiGame = {
    setPhase,
    executeVaultRebootSequence,
    STATES
  };
  window.__setPhase = setPhase;
  window.__executeVaultRebootSequence = executeVaultRebootSequence;

})();
