
    // =========================================================================
    // CONFIG (at top of file as specified in Section 10)
    // =========================================================================
    const CONFIG = {
      autoSolve: {
        enabled: true,
        unlockAfterSec: 30
      },
      schedule: {
        firstRingPassAt: 6.0,
        ringInterval: 2.0
      },
      tunnel: {
        farPlane: 60,
        focalLength: 16,
        baseSpeed: 14 // units/s
      },
      suit: {
        zDepth: 0,
        ringRadius: 0.28,
        maxSpeed: 0.9,     // tunnel-heights per second
        accel: 4.0,        // /s^2
        brake: 6.0,        // /s^2
        maxPitchDeg: 12
      },
      authoredRings: [
        { num: 1, y: 0.0, dummy: false },
        { num: 2, y: 0.5, dummy: false },
        { num: 3, y: -0.4, dummy: false },
        { num: 4, y: 0.7, dummy: false },
        { num: 5, y: -0.6, dummy: false },
        { num: 6, y: 0.2, dummy: false },
        { num: 7, y: -0.7, dummy: false },
        { num: 8, y: 0.55, dummy: false },
        { num: 9, y: -0.2, dummy: true },
        { num: 10, y: 0.3, dummy: true }
      ]
    };

    // =========================================================================
    // JARVIS SUBTITLE LINES (Section 1)
    // =========================================================================
    const SUBTITLES = {
      launch: "Emergency shutter sealed, sir. Eight clean ring passes will unlock the exit.",
      ring4: "Four locks are charging the shutter. Hold your flight line.",
      ring8: "Eight clean passes. Exit shutters releasing. Wait—loop fault detected.",
      ring9: "That ring is corrupted. The exit mechanism is stalling.",
      ring10: "The tunnel loop is feeding false gates. The hatch is jammed.",
      freeze: "Exit hatch jammed by a sequence loop. I need a repair in the console.",
      fix: "Loop closed. The exit shutter is responding. Full thrust, sir.",
      autoSolve: "Allow me, sir. Review the change afterwards."
    };

    const HINTS = [
      "Run suit.status() and read the value of gate.step.",
      "A loop only ends when i grows toward 10. What does i += 0 do?",
      "Set gate.step to 1."
    ];

    // =========================================================================
    // GLOBAL CONSOLE API OBJECTS (Section 8)
    // =========================================================================
    const gate = {
      step: 1,
      i: 0,
      ringsPassed: 0
    };

    function scoreRing(idx) {
      gate.i = idx + 1;
    }

    // Guarded exit-sequence.js loop so the simulated fault cannot freeze the browser
    function runGuardedReactorLoop() {
      let iterations = 0;
      const maxIterations = 24;
      let i = gate.ringsPassed;
      if (typeof gate.step !== 'number' || Number.isNaN(gate.step)) {
        return { completed: false, reason: 'NaN', finalI: i, counted: 0 };
      }
      let counted = 0;
      while (i < 10 && iterations < maxIterations) {
        iterations++;
        counted++;
        i += gate.step;
        if (gate.step <= 0) break;
      }
      return {
        completed: gate.step === 1 && i === 10 && counted === 2,
        finalI: i,
        counted: counted
      };
    }

    const suit = {
      status: function() {
        const snapshot = {
          ringsPassed: gate.ringsPassed,
          "gate.step": gate.step,
          i: gate.i,
          status: gate.step === 1 ? "GOOD" : "STUCK"
        };
        console.table(snapshot);
        return snapshot;
      }
    };

    const jarvis = {
      hint: function() {
        return triggerNextHint();
      }
    };

    const game = {
      restart: function() {
        resetAndStartRun();
        return "Escape run restarted.";
      }
    };

    window.gate = gate;
    window.suit = suit;
    window.jarvis = jarvis;
    window.game = game;

    // =========================================================================
    // DOM ELEMENTS
    // =========================================================================
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const tunnelImage = new Image();
    let tunnelImageLoaded = false;
    tunnelImage.onload = () => { tunnelImageLoaded = true; };
    tunnelImage.onerror = () => console.error('Local tunnel image failed to load: assets/stark-flight-tunnel.jpg');
    tunnelImage.src = 'assets/stark-flight-tunnel.jpg';
    const ironManImage = new Image();
    let ironManImageLoaded = false;
    ironManImage.onload = () => { ironManImageLoaded = true; };
    ironManImage.onerror = () => console.error('Local character image failed to load: assets/characters/iron-man-rear-flight.png');
    ironManImage.src = 'assets/characters/iron-man-rear-flight.png';
    const redEdgePulseEl = document.getElementById('red-edge-pulse');
    const terminalOverlayEl = document.getElementById('terminal-overlay');
    const terminalWindowEl = document.getElementById('terminal-window');
    const statusChipEl = document.getElementById('status-chip');
    const valRingsPassedEl = document.getElementById('val-rings-passed');
    const valGateStepEl = document.getElementById('val-gate-step');
    const valLoopIEl = document.getElementById('val-loop-i');
    const termFeedbackEl = document.getElementById('term-feedback');
    const termHintBoxEl = document.getElementById('term-hint-box');
    const autosolveExplainEl = document.getElementById('autosolve-explain');
    const termTimerBarEl = document.getElementById('term-timer-bar');
    const btnHintEl = document.getElementById('btn-hint');
    const hintCounterTextEl = document.getElementById('hint-counter-text');
    const btnAutosolveEl = document.getElementById('btn-autosolve');
    const autosolveRingEl = document.getElementById('autosolve-ring');
    const autosolveLabelEl = document.getElementById('autosolve-label');
    const confirmModalEl = document.getElementById('confirm-modal');
    const btnConfirmYesEl = document.getElementById('btn-confirm-yes');
    const btnConfirmNoEl = document.getElementById('btn-confirm-no');
    const terminalCmdFormEl = document.getElementById('terminal-cmd-form');
    const terminalCmdInputEl = document.getElementById('terminal-cmd-input');
    const endOverlayEl = document.getElementById('end-overlay');
    const endCardPanelEl = document.getElementById('end-card-panel');
    const endCardTagEl = document.getElementById('end-card-tag');
    const endCardTitleEl = document.getElementById('end-card-title');
    const endFactsListEl = document.getElementById('end-facts-list');
    const factFixTimeEl = document.getElementById('fact-fix-time');
    const factHintsEl = document.getElementById('fact-hints');
    const factAutosolveEl = document.getElementById('fact-autosolve');
    const btnRestartEndEl = document.getElementById('btn-restart-end');
    const btnFlyUpEl = document.getElementById('btn-fly-up');
    const btnFlyDownEl = document.getElementById('btn-fly-down');
    const btnReducedFxEl = document.getElementById('btn-reduced-fx');

    // =========================================================================
    // GAME STATE & POOLS
    // =========================================================================
    // Valid states: 'title', 'countdown', 'flight', 'dummy rings', 'freeze', 'terminal', 'solved', 'finale', 'end'
    let gameState = 'title';
    let runTime = 0;           // total elapsed run timer
    let stateTime = 0;         // elapsed time in current state
    let flightClock = 0;       // elapsed time since flight start (0:10)
    let reducedMode = false;   // toggled by Q key
    let tabPaused = false;     // pauses when browser tab loses focus

    // Input flags
    const keys = {
      up: false,
      down: false,
      touchUp: false,
      touchDown: false
    };

    // Player suit state
    const player = {
      y: 0,           // -1 (floor) to +1 (ceiling)
      vy: 0,          // vertical velocity
      pitchDeg: 0,    // up to 12 deg
      rollDeg: 0,     // slight roll
      dropOffset: 0,  // used during 0:04-0:10 countdown drop-in
      afterimages: [] // up to 4 stored frames
    };

    // Camera state
    const camera = {
      swayTime: 0,
      shakeTimer: 0,
      shakeMag: 0,
      fovScale: 1.0,
      screenFlash: 0,
      redFlash: 0
    };

    // Subtitle state
    const subtitle = {
      text: '',
      timer: 0
    };

    // Rings & schedule state
    let ringQueue = [];
    let activeRings = [];
    let nextScheduleIndex = 0;
    let nextSpawnFlightTime = 0; // relative to flight start
    let dummyGlitchTimer = 0;
    let pipPopTimers = new Array(10).fill(0);
    let passLabels = []; // floating PERFECT / GOOD / MISS / COUNT ERROR labels

    // Terminal & Fix tracking
    let terminalTimer = 50.0;
    let terminalElapsed = 0;
    let hintsUsed = 0;
    let autoSolveUsed = false;
    let autoSolveTyping = false;
    let fixCheckAccumulator = 0;
    let solvedPhaseTime = 0;
    let finaleTime = 0;
    let endReason = 'complete'; // 'complete' or 'timeout'


    // Visual effects pools (Section 13 budget)
    // Boot & palm jets: 120 pooled particles
    const jetPool = Array.from({ length: 120 }, () => ({
      active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, size: 4, color: '#00f0ff'
    }));

    // Dust streaks / motes: 60 pooled
    const dustPool = Array.from({ length: 60 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 0.25 + Math.random() * 0.72,
      z: Math.random() * CONFIG.tunnel.farPlane,
      speedMul: 0.65 + Math.random() * 0.85,
      isStreak: Math.random() > 0.45
    }));

    // Pass bursts & miss shards (80 per pass)
    const burstParticles = [];
    const shockwaves = [];

    // Finale sparks (200)
    const finaleSparks = [];

    // =========================================================================
    // INITIALIZATION & RESET
    // =========================================================================
    function buildInitialRingSchedule() {
      ringQueue = CONFIG.authoredRings.map((r) => ({
        num: r.num,
        y: r.y,
        dummy: r.dummy,
        isRecovery: false
      }));
      activeRings = [];
      nextScheduleIndex = 0;
      // Preserve the six-second first-ring arrival; subsequent rings use the tighter fixed cadence.
      // The 60-unit approach at 14 units/s takes about 4.286s, so gate 1 spawns at about 1.714s.
      nextSpawnFlightTime = CONFIG.schedule.firstRingPassAt - (CONFIG.tunnel.farPlane / CONFIG.tunnel.baseSpeed);
    }

    function setSubtitle(text, duration = 4.6) {
      subtitle.text = text;
      subtitle.timer = duration;
    }

    function resetAndStartRun() {
      gameState = 'title';
      runTime = 0;
      stateTime = 0;
      flightClock = 0;
      gate.step = 1;
      gate.i = 0;
      gate.ringsPassed = 0;

      player.y = 0;
      player.vy = 0;
      player.pitchDeg = 0;
      player.rollDeg = 0;
      player.dropOffset = 0;
      player.afterimages = [];

      camera.shakeTimer = 0;
      camera.fovScale = 1.0;
      camera.screenFlash = 0;
      camera.redFlash = 0;

      pipPopTimers.fill(0);
      passLabels = [];
      burstParticles.length = 0;
      shockwaves.length = 0;
      finaleSparks.length = 0;
      jetPool.forEach((p) => { p.active = false; });

      terminalTimer = 50.0;
      terminalElapsed = 0;
      hintsUsed = 0;
      autoSolveUsed = false;
      autoSolveTyping = false;
      fixCheckAccumulator = 0;
      solvedPhaseTime = 0;
      finaleTime = 0;
      dummyGlitchTimer = 0;

      // Reset UI
      canvas.classList.remove('frozen-blur');
      redEdgePulseEl.classList.remove('active');
      terminalOverlayEl.classList.remove('visible');
      terminalWindowEl.classList.remove('solved-theme');
      confirmModalEl.classList.remove('open');
      endOverlayEl.classList.remove('visible');
      termHintBoxEl.classList.remove('shown');
      termHintBoxEl.textContent = '';
      autosolveExplainEl.classList.remove('shown');
      terminalCmdInputEl.value = '';
      hintCounterTextEl.textContent = 'Hints used: 0/3';
      btnHintEl.disabled = false;

      buildInitialRingSchedule();
      subtitle.text = '';
      subtitle.timer = 0;
    }

    // =========================================================================
    // CONSOLE HINTS & AUTO-SOLVE (Sections 8, 9, 10)
    // =========================================================================
    function triggerNextHint() {
      if (hintsUsed < 3) {
        const hintMsg = HINTS[hintsUsed];
        hintsUsed++;
        hintCounterTextEl.textContent = `Hints used: ${hintsUsed}/3`;
        termHintBoxEl.textContent = `Hint ${hintsUsed}: ${hintMsg}`;
        termHintBoxEl.classList.add('shown');
        console.info(`%cJARVIS HINT (${hintsUsed}/3): ${hintMsg}`, 'color:#ffcc33; font-weight:bold;');
        if (hintsUsed >= 3) {
          btnHintEl.disabled = true;
          updateAutoSolveLockUI();
        }
        return hintMsg;
      }
      return HINTS[2];
    }

    function updateAutoSolveLockUI() {
      if (!CONFIG.autoSolve.enabled) {
        btnAutosolveEl.style.display = 'none';
        return;
      }
      btnAutosolveEl.style.display = 'inline-flex';
      const unlockSec = CONFIG.autoSolve.unlockAfterSec;
      const unlockedByHints = hintsUsed >= 3;
      const unlockedByTime = terminalElapsed >= unlockSec;
      const isUnlocked = unlockedByHints || unlockedByTime;

      if (isUnlocked) {
        btnAutosolveEl.disabled = autoSolveTyping || gameState !== 'terminal';
        autosolveRingEl.classList.add('unlocked');
        autosolveRingEl.style.setProperty('--progress', '100%');
        autosolveLabelEl.textContent = 'Auto-solve with JARVIS';
      } else {
        btnAutosolveEl.disabled = true;
        autosolveRingEl.classList.remove('unlocked');
        const pct = Math.min(100, Math.round((terminalElapsed / unlockSec) * 100));
        autosolveRingEl.style.setProperty('--progress', `${pct}%`);
        const rem = Math.max(1, Math.ceil(unlockSec - terminalElapsed));
        autosolveLabelEl.textContent = `Auto-solve with JARVIS (${rem}s)`;
      }
    }

    function startAutoSolveSequence() {
      if (autoSolveTyping || (gameState !== 'terminal' && gameState !== 'freeze')) return;
      if (gameState === 'freeze') {
        enterTerminalState();
      }
      confirmModalEl.classList.remove('open');
      autoSolveTyping = true;
      autoSolveUsed = true;
      btnAutosolveEl.disabled = true;
      setSubtitle(SUBTITLES.autoSolve, 5.0);

      const cmdText = 'gate.step = 1';
      terminalCmdInputEl.value = '';
      let charIdx = 0;

      const typeTimer = setInterval(() => {
        charIdx++;
        terminalCmdInputEl.value = cmdText.slice(0, charIdx);
        if (charIdx >= cmdText.length) {
          clearInterval(typeTimer);
          setTimeout(() => {
            gate.step = 1;
            autosolveExplainEl.classList.add('shown');
            evaluateGateStep100ms();
          }, 180);
        }
      }, 65);
    }

    // Check gate.step every 100 ms (Section 8)
    function evaluateGateStep100ms() {
      if (gameState !== 'terminal') return;

      const stepVal = gate.step;
      valRingsPassedEl.textContent = String(gate.ringsPassed);
      valGateStepEl.textContent = typeof stepVal === 'string' ? `"${stepVal}"` : String(stepVal);

      const faultExprEl = document.getElementById('fault-code-expr');
      if (faultExprEl) {
        faultExprEl.textContent = `i += ${typeof stepVal === 'string' ? `"${stepVal}"` : stepVal}`;
      }

      let feedback = '';
      let isSolved = false;

      if (typeof stepVal === 'string') {
        feedback = 'step is text, not a number';
        gate.i = 8;
      } else if (typeof stepVal !== 'number' || Number.isNaN(stepVal)) {
        feedback = 'step is text, not a number';
        gate.i = 8;
      } else if (stepVal === 0) {
        feedback = 'Loop stuck: i stays 8';
        gate.i = 8;
      } else if (stepVal < 0) {
        feedback = 'i moves away from 10';
        gate.i = 8 + stepVal;
      } else if (stepVal === 1) {
        feedback = 'Solved';
        isSolved = true;
      } else if (stepVal === 2) {
        feedback = 'Counted 1 of 2 rings: loop skipped ring 9';
        gate.i = 10;
      } else if (stepVal >= 3) {
        feedback = 'Loop overshoots 10: rings missed';
        gate.i = 8 + stepVal;
      } else {
        // Non-integer positive number
        feedback = 'Loop overshoots 10: rings missed';
        gate.i = Number((8 + stepVal).toFixed(2));
      }

      valLoopIEl.textContent = String(gate.i);
      termFeedbackEl.textContent = feedback;

      if (isSolved) {
        valGateStepEl.classList.remove('bad');
        valGateStepEl.classList.add('ok');
        statusChipEl.textContent = 'GOOD';
        statusChipEl.classList.add('good');
        termFeedbackEl.classList.add('solved');
        terminalWindowEl.classList.add('solved-theme');
        triggerLoopSolvedTransition();
      } else {
        valGateStepEl.classList.add('bad');
        valGateStepEl.classList.remove('ok');
        statusChipEl.textContent = 'STUCK';
        statusChipEl.classList.remove('good');
        termFeedbackEl.classList.remove('solved');
      }
    }

    function enterTerminalState() {
      gameState = 'terminal';
      stateTime = 0;
      terminalOverlayEl.classList.add('visible');
      console.log('JARVIS: Reactor loop stalled at i = 8.');
      updateAutoSolveLockUI();
      evaluateGateStep100ms();
    }

    function triggerLoopSolvedTransition() {
      if (gameState === 'solved' || gameState === 'finale') return;
      gameState = 'solved';
      stateTime = 0;
      solvedPhaseTime = 0;
      finaleTime = 0;
      redEdgePulseEl.classList.remove('active');
      if (!autoSolveUsed) {
        setSubtitle(SUBTITLES.fix, 4.5);
      }
      console.info('%cJARVIS: Loop closed. Reactor sequence restored.', 'color:#00ff88; font-weight:bold;');
    }

    // =========================================================================
    // COLOUR PROGRESSION HELPER (Section 4)
    // =========================================================================
    function lerp(a, b, t) {
      return a + (b - a) * Math.max(0, Math.min(1, t));
    }

    // =========================================================================
    // PARTICLE & EFFECT SPAWNERS
    // =========================================================================
    function spawnJetParticles(dt, leftFootX, rightFootX, feetY, movingUpFactor) {
      const maxPool = reducedMode ? 60 : 120;
      const spawnRate = reducedMode ? 45 : 95;
      const toSpawn = Math.ceil(spawnRate * dt * (0.7 + movingUpFactor * 0.8));

      let spawned = 0;
      for (let i = 0; i < maxPool && spawned < toSpawn; i++) {
        const p = jetPool[i];
        if (!p.active) {
          p.active = true;
          const nozzle = spawned % 2;
          if (nozzle === 0) { p.x = leftFootX; p.y = feetY; }
          else { p.x = rightFootX; p.y = feetY; }

          p.x += (Math.random() - 0.5) * 6;
          p.y += (Math.random() - 0.5) * 4;
          p.vx = (Math.random() - 0.5) * 32 + (nozzle >= 2 ? (nozzle === 2 ? -22 : 22) : 0);
          p.vy = 95 + Math.random() * 110 + movingUpFactor * 75;
          p.maxLife = 0.16 + Math.random() * 0.18 + movingUpFactor * 0.08;
          p.life = p.maxLife;
          p.size = (nozzle < 2 ? 5.5 : 3.8) * (1 + movingUpFactor * 0.45);
          p.color = Math.random() > 0.35 ? '#66f7ff' : '#ffdd77';
          spawned++;
        }
      }
    }

    function triggerRingPassEffect(ring, resultLabel, screenX, screenY, screenRadius) {
      const count = reducedMode ? 40 : 80;
      const color = ring.dummy ? '#ff9922' : (resultLabel === 'PERFECT' ? '#ffe066' : '#00f0ff');

      shockwaves.push({
        x: screenX,
        y: screenY,
        r: screenRadius,
        maxR: screenRadius * 2.6,
        alpha: 1.0,
        color: color,
        shatter: false
      });

      for (let i = 0; i < count; i++) {
        const ang = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
        const spd = 90 + Math.random() * 260;
        burstParticles.push({
          x: screenX + Math.cos(ang) * screenRadius * 0.85,
          y: screenY + Math.sin(ang) * screenRadius * 0.85,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          life: 0.45 + Math.random() * 0.35,
          maxLife: 0.8,
          size: 2.5 + Math.random() * 3.5,
          color: i % 3 === 0 ? '#ffffff' : color,
          isShard: false,
          rot: 0,
          vRot: 0
        });
      }

      camera.screenFlash = 0.32;
      passLabels.push({
        text: resultLabel,
        x: screenX,
        y: screenY - 45,
        life: 1.1,
        maxLife: 1.1,
        color: ring.dummy ? '#ff8822' : (resultLabel === 'PERFECT' ? '#ffe066' : '#00f0ff')
      });
    }

    function triggerRingMissEffect(ring, screenX, screenY, screenRadius) {
      const shardCount = reducedMode ? 24 : 44;
      for (let i = 0; i < shardCount; i++) {
        const ang = (i / shardCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
        const spd = 70 + Math.random() * 210;
        burstParticles.push({
          x: screenX + Math.cos(ang) * screenRadius,
          y: screenY + Math.sin(ang) * screenRadius,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd + 40,
          life: 0.55 + Math.random() * 0.35,
          maxLife: 0.9,
          size: 7 + Math.random() * 6,
          color: '#ff3355',
          isShard: true,
          rot: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 10
        });
      }

      camera.shakeTimer = 0.38;
      camera.shakeMag = 11;
      camera.redFlash = 0.65;

      passLabels.push({
        text: ring.dummy ? 'CORRUPTED' : 'MISS',
        x: screenX,
        y: screenY - 40,
        life: 1.1,
        maxLife: 1.1,
        color: '#ff3355'
      });
    }

    function spawnFinaleSparkBurst() {
      finaleSparks.length = 0;
      const count = reducedMode ? 100 : 200;
      const vpX = canvas.width * 0.5;
      const vpY = canvas.height * 0.46;
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 60 + Math.random() * 420;
        finaleSparks.push({
          x: vpX,
          y: vpY,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          life: 1.1 + Math.random() * 0.9,
          maxLife: 2.0,
          size: 2 + Math.random() * 4.5,
          color: Math.random() > 0.28 ? '#ffcc33' : '#fff5cc'
        });
      }
    }

    // =========================================================================
    // UPDATE LOOP
    // =========================================================================
    function updateGame(dt) {
      if (tabPaused) return;

      // Update subtitle timer
      if (subtitle.timer > 0) {
        subtitle.timer = Math.max(0, subtitle.timer - dt);
      }

      // Update pip pop timers
      for (let i = 0; i < 10; i++) {
        if (pipPopTimers[i] > 0) {
          pipPopTimers[i] = Math.max(0, pipPopTimers[i] - dt * 2.5);
        }
      }

      // Update floating pass labels
      for (let i = passLabels.length - 1; i >= 0; i--) {
        const lbl = passLabels[i];
        lbl.life -= dt;
        lbl.y -= 28 * dt;
        if (lbl.life <= 0) passLabels.splice(i, 1);
      }

      // Update shockwaves & burst particles
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.r += (sw.maxR - sw.r) * 8 * dt;
        sw.alpha -= dt * 2.2;
        if (sw.alpha <= 0) shockwaves.splice(i, 1);
      }

      for (let i = burstParticles.length - 1; i >= 0; i--) {
        const p = burstParticles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vRot * dt;
        p.life -= dt;
        if (p.life <= 0) burstParticles.splice(i, 1);
      }

      // Camera decays
      if (camera.shakeTimer > 0) {
        camera.shakeTimer = Math.max(0, camera.shakeTimer - dt);
      }
      if (camera.screenFlash > 0) {
        camera.screenFlash = Math.max(0, camera.screenFlash - dt * 1.8);
      }
      if (camera.redFlash > 0) {
        camera.redFlash = Math.max(0, camera.redFlash - dt * 1.4);
      }

      // State Machine
      stateTime += dt;

      if (gameState === 'title') {
        runTime += dt;
        camera.swayTime += dt;
        updateTunnelMotion(dt, CONFIG.tunnel.baseSpeed * 0.55);
        if (runTime >= 4.0) {
          gameState = 'countdown';
          stateTime = 0;
        }
        return;
      }

      if (gameState === 'countdown') {
        runTime += dt;
        camera.swayTime += dt;
        updateTunnelMotion(dt, CONFIG.tunnel.baseSpeed * 0.85);
        // Suit drops into the tunnel mouth during last 1.5s of countdown
        const dropProgress = Math.max(0, Math.min(1, (stateTime - 3.8) / 2.2));
        player.dropOffset = (1 - easeOutCubic(dropProgress)) * -260;

        if (runTime >= 10.0) {
          player.dropOffset = 0;
          gameState = 'flight';
          stateTime = 0;
          flightClock = 0;
          setSubtitle(SUBTITLES.launch, 4.8);
        }
        return;
      }

      if (gameState === 'flight' || gameState === 'dummy rings') {
        runTime += dt;
        flightClock += dt;
        camera.swayTime += dt;

        updatePlayerControls(dt);
        updateTunnelMotion(dt, CONFIG.tunnel.baseSpeed);
        updateRingsAndSpawning(dt);

        if (gameState === 'dummy rings') {
          dummyGlitchTimer += dt;
        }
        return;
      }

      if (gameState === 'freeze') {
        // Short 0.55s dramatic freeze before sliding in terminal
        if (stateTime >= 0.55) {
          enterTerminalState();
        }
        return;
      }

      if (gameState === 'terminal') {
        terminalElapsed += dt;
        terminalTimer = Math.max(0, 50.0 - terminalElapsed);
        termTimerBarEl.style.width = `${(terminalTimer / 50.0) * 100}%`;

        updateAutoSolveLockUI();

        fixCheckAccumulator += dt;
        if (fixCheckAccumulator >= 0.1) {
          fixCheckAccumulator = 0;
          evaluateGateStep100ms();
        }

        if (terminalTimer <= 0) {
          // Timeout: "Loop never closed," game over (Section 2 & 12)
          endReason = 'timeout';
          gameState = 'end';
          terminalOverlayEl.classList.remove('visible');
          showEndCard();
        }
        return;
      }

      if (gameState === 'solved' || gameState === 'finale') {
        finaleTime += dt;
        // 0.0-1.2 s: the code-loop visualiser advances its loop index; ring progress stays at eight real passes.
        if (finaleTime < 1.2) {
          if (finaleTime >= 0.35 && gate.i < 9) {
            gate.i = 9;
            valLoopIEl.textContent = '9';
          }
          if (finaleTime >= 0.8 && gate.i < 10) {
            gate.i = 10;
            valLoopIEl.textContent = '10';
          }
        } else if (gameState === 'solved') {
          // 1.2s: Transition into active finale flight
          gameState = 'finale';
          terminalOverlayEl.classList.remove('visible');
          canvas.classList.remove('frozen-blur');
        }

        if (finaleTime >= 1.2) {
          // 1.2-2.4 s: The tunnel unfreezes, speed doubles, and the view widens slightly
          camera.swayTime += dt;
          updatePlayerControls(dt);
          // Ease player gently toward centre during finale
          player.y = lerp(player.y, 0, dt * 2.5);
          updateTunnelMotion(dt, CONFIG.tunnel.baseSpeed * 2.0);
          const widenT = Math.min(1, (finaleTime - 1.2) / 1.2);
          camera.fovScale = 1.0 + widenT * 0.18;
        }

        // 3.4 s: White flash + Gold spark burst
        if (finaleTime >= 3.4 && finaleSparks.length === 0) {
          camera.screenFlash = 1.0;
          spawnFinaleSparkBurst();
        }

        for (let i = finaleSparks.length - 1; i >= 0; i--) {
          const sp = finaleSparks[i];
          sp.x += sp.vx * dt;
          sp.y += sp.vy * dt;
          sp.life -= dt;
        }

        if (finaleTime >= 5.2) {
          endReason = 'complete';
          gameState = 'end';
          showEndCard();
        }
        return;
      }
    }

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    // =========================================================================
    // PLAYER MOVEMENT & TUNNEL MOTION (Sections 3 & 4)
    // =========================================================================
    function updatePlayerControls(dt) {
      const upPressed = keys.up || keys.touchUp;
      const downPressed = keys.down || keys.touchDown;

      // Holding both cancels out
      let dir = 0;
      if (upPressed && !downPressed) dir = 1;
      else if (downPressed && !upPressed) dir = -1;

      if (dir !== 0) {
        player.vy += dir * CONFIG.suit.accel * dt;
        if (player.vy > CONFIG.suit.maxSpeed) player.vy = CONFIG.suit.maxSpeed;
        if (player.vy < -CONFIG.suit.maxSpeed) player.vy = -CONFIG.suit.maxSpeed;
      } else {
        // Releasing the key brakes at 6.0/s^2
        if (player.vy > 0) {
          player.vy = Math.max(0, player.vy - CONFIG.suit.brake * dt);
        } else if (player.vy < 0) {
          player.vy = Math.min(0, player.vy + CONFIG.suit.brake * dt);
        }
      }

      player.y += player.vy * dt;
      if (player.y > 1) {
        player.y = 1;
        player.vy = 0;
      } else if (player.y < -1) {
        player.y = -1;
        player.vy = 0;
      }

      // Suit pitches up to 12 deg with vertical velocity and rolls slightly, then eases back to level
      const normVel = player.vy / CONFIG.suit.maxSpeed;
      const targetPitch = normVel * CONFIG.suit.maxPitchDeg;
      const targetRoll = normVel * 5.5 * Math.sin(runTime * 4.5);
      player.pitchDeg = lerp(player.pitchDeg, targetPitch, Math.min(1, dt * 10));
      player.rollDeg = lerp(player.rollDeg, targetRoll, Math.min(1, dt * 8));

      // Store afterimage (up to 4 stored frames)
      if (!reducedMode) {
        player.afterimages.unshift({
          y: player.y,
          pitchDeg: player.pitchDeg,
          rollDeg: player.rollDeg
        });
        if (player.afterimages.length > 4) {
          player.afterimages.pop();
        }
      } else {
        player.afterimages.length = 0;
      }
    }

    function updateTunnelMotion(dt, speed) {
      const dustLimit = reducedMode ? 30 : 60;
      for (let i = 0; i < dustLimit; i++) {
        const d = dustPool[i];
        d.z -= speed * d.speedMul * dt;
        if (d.z <= 0.3) {
          d.z += CONFIG.tunnel.farPlane;
          d.angle = Math.random() * Math.PI * 2;
        }
      }
    }

    // =========================================================================
    // RINGS & PASSING PRECISION (Section 6)
    // =========================================================================
    function updateRingsAndSpawning(dt) {
      // Catch up scheduled gates after a slow frame while preserving their true approach spacing.
      while (nextScheduleIndex < ringQueue.length && flightClock >= nextSpawnFlightTime) {
        const spec = ringQueue[nextScheduleIndex];
        const scheduledAt = nextSpawnFlightTime;
        nextScheduleIndex++;
        nextSpawnFlightTime += CONFIG.schedule.ringInterval;

        activeRings.push({
          num: spec.num,
          y: spec.y,
          z: Math.max(-3.1, CONFIG.tunnel.farPlane - CONFIG.tunnel.baseSpeed * (flightClock - scheduledAt)),
          rotAngle: 0,
          dummy: spec.dummy,
          isRecovery: spec.isRecovery,
          tested: false
        });

        // Switch state label when dummy rings begin spawning
        if (spec.dummy && gameState === 'flight') {
          gameState = 'dummy rings';
        }
      }

      const rotSpeedRad = (40 * Math.PI) / 180; // about 40 deg/s

      for (let i = activeRings.length - 1; i >= 0; i--) {
        const r = activeRings[i];
        r.z -= CONFIG.tunnel.baseSpeed * dt;
        r.rotAngle += rotSpeedRad * dt;

        // Pass test the moment the ring reaches the suit's depth (z <= 0)
        if (!r.tested && r.z <= CONFIG.suit.zDepth) {
          r.tested = true;
          handleRingPassTest(r);
        }

        if (r.z < -3.0) {
          activeRings.splice(i, 1);
        }
      }

      // Once both corrupted visual gates have passed, the fault jams the exit hatch.
      if (nextScheduleIndex >= ringQueue.length && activeRings.length === 0 && gameState === 'dummy rings') {
        if (gate.ringsPassed >= 8) {
          triggerFreezeEvent();
        } else {
          // Safety net: never end the flight with incomplete real-ring progress.
          const retrySpec = CONFIG.authoredRings[Math.min(gate.ringsPassed, 7)];
          ringQueue.push({ num: retrySpec.num, y: retrySpec.y, dummy: false, isRecovery: true });
        }
      }
    }

    function handleRingPassTest(ring) {
      const dist = Math.abs(player.y - ring.y);
      const vpX = canvas.width * 0.5;
      const ringScreenY = heightToScreenY(ring.y);
      const ringScreenR = canvas.height * 0.205;

      if (ring.dummy) {
        // Two corrupted gates show the sequence fault; they never count toward the eight clean passes.
        if (dist <= 0.24) {
          triggerRingPassEffect(ring, 'CORRUPTED', vpX, ringScreenY, ringScreenR);
        } else {
          triggerRingMissEffect(ring, vpX, ringScreenY, ringScreenR);
        }

        if (ring.num === 9) {
          setSubtitle(SUBTITLES.ring9, 5.2);
        } else if (ring.num === 10) {
          setSubtitle(SUBTITLES.ring10, 5.2);
        }
        return;
      }

      // Real rings 1..8
      if (dist <= 0.24) {
        const label = dist <= 0.10 ? 'PERFECT' : 'GOOD';
        triggerRingPassEffect(ring, label, vpX, ringScreenY, ringScreenR);

        if (gate.ringsPassed < 8) {
          pipPopTimers[gate.ringsPassed] = 1.0;
          gate.ringsPassed++;
          gate.i = gate.ringsPassed;
        }

        if (gate.ringsPassed === 4) {
          setSubtitle(SUBTITLES.ring4, 4.5);
        } else if (gate.ringsPassed === 8) {
          // Corruption sets gate.step = 0 quietly in the background when ring 8 is passed (Section 8)
          gate.step = 0;
          setSubtitle(SUBTITLES.ring8, 4.8);
        }
      } else {
        // Miss! Shatters into shards, camera shake, red edge pulse
        triggerRingMissEffect(ring, vpX, ringScreenY, ringScreenR);

        // A miss never advances progress. Queue another gate until the player lands a clean pass.
        const firstDummyIndex = ringQueue.findIndex(q => q.dummy && !q.isRecovery);
        const insertIdx = firstDummyIndex < 0
          ? ringQueue.length
          : Math.max(nextScheduleIndex, firstDummyIndex);
        ringQueue.splice(insertIdx, 0, {
          num: ring.num,
          y: ring.y,
          dummy: false,
          isRecovery: true
        });
      }
    }

    function triggerFreezeEvent() {
      if (gate.ringsPassed < 8) return;
      gameState = 'freeze';
      stateTime = 0;
      gate.i = 8;
      gate.step = 0;
      runGuardedReactorLoop();
      canvas.classList.add('frozen-blur');
      redEdgePulseEl.classList.add('active');
      setSubtitle(SUBTITLES.freeze, 8.0);
    }

    function showEndCard() {
      endOverlayEl.classList.add('visible');
      if (endReason === 'complete') {
        endCardPanelEl.classList.remove('timeout-panel');
        endCardTagEl.textContent = 'STARK FLIGHT TUNNEL // ESCAPE RUN';
        endCardTitleEl.textContent = 'ESCAPE COMPLETE';
        endFactsListEl.style.display = 'flex';
        factFixTimeEl.textContent = `${terminalElapsed.toFixed(1)}s`;
        factHintsEl.textContent = `${hintsUsed} / 3`;
        factAutosolveEl.textContent = autoSolveUsed ? 'Yes' : 'No';
      } else {
        endCardPanelEl.classList.add('timeout-panel');
        endCardTagEl.textContent = 'ESCAPE ROUTE // SHUTTER SEALED';
        endCardTitleEl.textContent = 'Exit remains sealed';
        endFactsListEl.style.display = 'none';
      }
    }

    // =========================================================================
    // PROJECTION & COORDINATE HELPERS
    // =========================================================================
    function heightToScreenY(yNorm) {
      // Suit moves between 28% (y=+1 ceiling) and 72% (y=-1 floor) of screen height
      const pct = 0.50 - yNorm * 0.22;
      return canvas.height * pct;
    }

    function projectZScale(z) {
      const f = CONFIG.tunnel.focalLength * camera.fovScale;
      return f / (f + Math.max(0.1, z));
    }

    function getOctagonVertices(cx, cy, radiusX, radiusY) {
      const pts = [];
      for (let k = 0; k < 8; k++) {
        // Rotate by 22.5 deg so top and bottom faces are flat horizontal strips
        const ang = (k * Math.PI) / 4 + Math.PI / 8;
        pts.push({
          x: cx + Math.cos(ang) * radiusX,
          y: cy + Math.sin(ang) * radiusY
        });
      }
      return pts;
    }

    // =========================================================================
    // RENDERING PIPELINE (Canvas 2D with a local image-based tunnel)
    // =========================================================================
    function renderGame() {
      const W = canvas.width;
      const H = canvas.height;

      ctx.save();
      ctx.fillStyle = '#030710';
      ctx.fillRect(0, 0, W, H);

      // Camera sway (about 8 px) + short shake on miss
      const swayX = Math.sin(camera.swayTime * 1.3) * 8;
      const swayY = Math.cos(camera.swayTime * 0.95) * 5;
      let shakeX = 0;
      let shakeY = 0;
      if (camera.shakeTimer > 0) {
        shakeX = (Math.random() - 0.5) * 2 * camera.shakeMag;
        shakeY = (Math.random() - 0.5) * 2 * camera.shakeMag;
      }

      const vpX = W * 0.5 + swayX + shakeX - player.vy * 9;
      const vpY = H * 0.46 + swayY + shakeY - player.y * 9;

      // 1. Render the image-based tunnel, with the original tunnel as a local-asset fallback.
      if (tunnelImageLoaded) renderImageTunnel(W, H, vpX, vpY);
      else renderFallbackTunnel(W, H, vpX, vpY);

      // 2. Render Distant Rings (sorted far to near)
      const sortedRings = [...activeRings].sort((a, b) => b.z - a.z);
      for (let i = 0; i < sortedRings.length; i++) {
        if (sortedRings[i].z >= 0) {
          renderRing3D(sortedRings[i], W, H, vpX, vpY);
        }
      }

      // 3. Render Suit Height Guide Line across the tunnel (Section 6)
      if (gameState === 'flight' || gameState === 'dummy rings') {
        renderSuitGuideLine(W, H, vpX);
      }

      // 4. Render Floor Reflection Ellipse (Section 5)
      renderFloorReflection(W, H, vpX);

      // 5. Render Suit Afterimages & Iron Man Suit (Section 5)
      renderIronManSuitAndJets(W, H, vpX);

      // 6. Render Pass Shockwaves & Burst/Shard Particles
      renderPassAndMissEffects();

      // 7. Render Finale Vanishing Point Light & Gold Sparks (Section 11)
      if (gameState === 'solved' || gameState === 'finale') {
        renderFinaleEffects(W, H, vpX, vpY);
      }

      // 8. Screen Flashes (Pass Flash / Miss Red Pulse)
      if (camera.screenFlash > 0) {
        ctx.fillStyle = `rgba(255, 250, 235, ${camera.screenFlash})`;
        ctx.fillRect(0, 0, W, H);
      }
      if (camera.redFlash > 0) {
        const rg = ctx.createRadialGradient(W * 0.5, H * 0.5, W * 0.25, W * 0.5, H * 0.5, W * 0.65);
        rg.addColorStop(0, 'rgba(255, 20, 50, 0)');
        rg.addColorStop(1, `rgba(255, 25, 55, ${camera.redFlash * 0.75})`);
        ctx.fillStyle = rg;
        ctx.fillRect(0, 0, W, H);
      }

      // 9. Render Canvas HUD, Title Card, Countdown, or Loop Visualizer
      renderHUD(W, H);

      if (gameState === 'title') {
        renderTitleCard(W, H);
      } else if (gameState === 'countdown') {
        renderCountdownOverlay(W, H);
      } else if (gameState === 'solved' && finaleTime < 1.2) {
        renderLoopVisualizerBanner(W, H);
      } else if (gameState === 'finale' && finaleTime >= 3.4) {
        renderFinaleMissionCompleteBanner(W, H);
      }

      ctx.restore();
    }

    // =========================================================================
    // IMAGE-BASED TUNNEL RENDERER
    // =========================================================================
    function renderImageTunnel(W, H, vpX, vpY) {
      // The tunnel expands from its vanishing point as Iron Man flies into it.
      const motionClock = gameState === 'countdown'
        ? stateTime * 0.7 + runTime * 0.25
        : gameState === 'title'
          ? runTime * 0.7
          : Math.max(0, flightClock) + runTime * 0.15 + (gameState === 'finale' ? finaleTime * 2 : 0);
      const travelPush = Math.min(0.34, motionClock * 0.016);
      const finalePush = gameState === 'finale' ? Math.min(0.025, finaleTime * 0.009) : 0;
      const zoom = 1.035 + travelPush + finalePush;
      const drawW = W * zoom;
      const drawH = H * zoom;
      const swayX = Math.sin(camera.swayTime * 1.3) * 8 - player.y * 15;
      const swayY = Math.cos(camera.swayTime * 0.95) * 6 + player.vy * 3;
      const cameraBank = player.rollDeg * 0.0018 + Math.sin(camera.swayTime * 0.55) * 0.002;

      ctx.save();
      ctx.translate(W * 0.5, H * 0.5);
      ctx.rotate(cameraBank);
      ctx.drawImage(tunnelImage, -drawW * 0.5 + swayX, -drawH * 0.5 + swayY, drawW, drawH);
      ctx.restore();

      ctx.save();

      // Grade the real photo toward Stark's dark cyan reactor lighting.
      ctx.fillStyle = 'rgba(2, 9, 18, 0.43)';
      ctx.fillRect(0, 0, W, H);
      const spill = ctx.createRadialGradient(vpX, vpY + H * 0.25, 0, vpX, vpY + H * 0.25, H * 0.78);
      spill.addColorStop(0, 'rgba(0, 109, 158, 0.22)');
      spill.addColorStop(0.52, 'rgba(0, 62, 101, 0.09)');
      spill.addColorStop(1, 'rgba(0, 10, 22, 0)');
      ctx.fillStyle = spill;
      ctx.fillRect(0, 0, W, H);

      const vignette = ctx.createRadialGradient(vpX, vpY, H * 0.12, vpX, vpY, Math.max(W, H) * 0.76);
      vignette.addColorStop(0, 'rgba(0, 2, 8, 0)');
      vignette.addColorStop(0.66, 'rgba(0, 3, 9, 0.12)');
      vignette.addColorStop(1, 'rgba(0, 3, 10, 0.7)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, W, H);

      // The distant pressure hatch stays visible throughout the run and responds to clean passes.
      renderEndlessTunnelHoops(W, H, vpX, vpY, motionClock);
      renderExitAperture(W, H, vpX, vpY, motionClock);

      if (gameState === 'countdown' || gameState === 'flight' || gameState === 'dummy rings' || gameState === 'finale') {
        renderLaneLighting(W, H, vpX, vpY, motionClock);
      }

      // Light streaks stream outward from the vanishing point to reinforce forward travel.
      if (gameState === 'countdown' || gameState === 'flight' || gameState === 'dummy rings' || gameState === 'finale') {
        const maxX = W * 0.67;
        const maxY = H * 0.66;
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        for (let i = 0; i < 18; i++) {
          const angle = i * 2.399963 + Math.sin(camera.swayTime * 0.35) * 0.025;
          const phase = ((motionClock * 0.88 + i * 0.137) % 1 + 1) % 1;
          const head = 0.12 + phase * 0.82;
          const tail = Math.max(0.06, head - (0.055 + phase * 0.075));
          const alpha = Math.sin(phase * Math.PI) * 0.22;
          ctx.strokeStyle = `rgba(126, 225, 255, ${alpha})`;
          ctx.lineWidth = 0.8 + phase * 1.25;
          ctx.beginPath();
          ctx.moveTo(vpX + Math.cos(angle) * maxX * tail, vpY + Math.sin(angle) * maxY * tail);
          ctx.lineTo(vpX + Math.cos(angle) * maxX * head, vpY + Math.sin(angle) * maxY * head);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Keep the original pooled dust and speed streaks layered over the photograph.
      const dustLimit = reducedMode ? 30 : 60;
      const baseRadiusX = W * 0.62;
      const baseRadiusY = H * 0.58;
      for (let i = 0; i < dustLimit; i++) {
        const d = dustPool[i];
        const s1 = projectZScale(d.z);
        const s2 = projectZScale(d.z + (d.isStreak ? 7.5 : 0.4));
        const x1 = vpX + Math.cos(d.angle) * baseRadiusX * d.radius * s1;
        const y1 = vpY + Math.sin(d.angle) * baseRadiusY * d.radius * s1;
        const x2 = vpX + Math.cos(d.angle) * baseRadiusX * d.radius * s2;
        const y2 = vpY + Math.sin(d.angle) * baseRadiusY * d.radius * s2;
        const alpha = Math.min(0.75, (1 - d.z / CONFIG.tunnel.farPlane) * 0.8);
        if (d.isStreak) {
          ctx.strokeStyle = `rgba(121, 221, 245, ${alpha * 0.55})`;
          ctx.lineWidth = Math.max(1, 2.2 * s1);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(210, 245, 255, ${alpha * 0.65})`;
          ctx.beginPath();
          ctx.arc(x1, y1, Math.max(1.2, 3.2 * s1), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    function renderEndlessTunnelHoops(W, H, vpX, vpY, motionClock) {
      const spacing = 8.0;
      const speed = CONFIG.tunnel.baseSpeed;
      const phase = (spacing - ((motionClock * speed) % spacing)) % spacing;
      const count = Math.ceil(CONFIG.tunnel.farPlane / spacing) + 1;
      const jammed = gameState === 'freeze' || gameState === 'terminal';

      ctx.save();
      ctx.translate(vpX, vpY);
      ctx.rotate(Math.sin(camera.swayTime * 0.55) * 0.002 + player.rollDeg * 0.0018);
      ctx.globalCompositeOperation = 'screen';

      // Each hoop cycles from the distant exit toward the camera, then re-enters at the vanishing point.
      // This depth cycle is unbounded by ring count and is purely environmental, separate from gameplay gates.
      for (let index = count - 1; index >= 0; index--) {
        const z = phase + index * spacing;
        if (z > CONFIG.tunnel.farPlane) continue;
        const scale = projectZScale(z);
        const near = 1 - z / CONFIG.tunnel.farPlane;
        const rx = W * 0.78 * scale;
        const ry = H * 0.91 * scale;
        const alpha = 0.035 + near * 0.12;
        const lineWidth = 1 + scale * 4.2;

        // A dark metal silhouette and thin cyan-white edge make each ring read as tunnel hardware.
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(1, 7, 13, ${alpha * 1.7})`;
        ctx.lineWidth = lineWidth + 3.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = jammed
          ? `rgba(255, 62, 76, ${alpha * 0.8})`
          : `rgba(142, 229, 245, ${alpha})`;
        ctx.lineWidth = lineWidth;
        ctx.shadowColor = jammed ? '#ff293f' : '#63eaff';
        ctx.shadowBlur = 2 + scale * 5;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Sparse highlights on the arch imply moving light panels without forming solid polygon outlines.
        const arcOffset = motionClock * 0.18 + index * 0.12;
        for (let lamp = 0; lamp < 4; lamp++) {
          const angle = arcOffset + lamp * Math.PI * 0.5;
          const span = 0.075 + scale * 0.045;
          ctx.strokeStyle = jammed
            ? `rgba(255, 118, 120, ${alpha * 1.7})`
            : `rgba(218, 252, 255, ${alpha * 1.75})`;
          ctx.lineWidth = lineWidth + 0.5;
          ctx.beginPath();
          ctx.ellipse(0, 0, rx, ry, 0, angle, angle + span);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    function renderLaneLighting(W, H, vpX, vpY, motionClock) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      // Cold runway guides converge at the exit and widen toward the camera.
      for (const side of [-1, 1]) {
        const lane = ctx.createLinearGradient(vpX, vpY, vpX + side * W * 0.25, H * 1.04);
        lane.addColorStop(0, 'rgba(222, 255, 255, 0.9)');
        lane.addColorStop(0.22, 'rgba(66, 227, 255, 0.72)');
        lane.addColorStop(1, 'rgba(28, 172, 226, 0.04)');
        ctx.strokeStyle = lane;
        ctx.lineWidth = 1.2;
        ctx.shadowColor = '#63eaff';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(vpX + side * 2, vpY + H * 0.035);
        ctx.lineTo(vpX + side * W * 0.25, H * 1.04);
        ctx.stroke();
      }

      // White-cyan floor panels stream outward from the exit aperture past the suit.
      ctx.shadowBlur = 16;
      for (let i = 0; i < 9; i++) {
        const phase = ((motionClock * 0.46 + i / 9) % 1 + 1) % 1;
        const distance = Math.pow(phase, 1.72);
        const y = vpY + distance * (H * 0.66);
        const spread = distance * W * 0.25;
        const width = 2 + distance * 11;
        const alpha = (0.18 + distance * 0.48) * (1 - chargeFlashAt(phase));
        for (const side of [-1, 1]) {
          const x = vpX + side * spread;
          ctx.fillStyle = `rgba(190, 252, 255, ${alpha})`;
          ctx.shadowColor = '#8af4ff';
          ctx.fillRect(x - width * 0.5, y, width, 2 + distance * 7);
        }
      }

      // Red emergency lamps pulse along the tunnel shoulders while its shutter remains locked.
      const warningAlpha = gameState === 'solved' || gameState === 'finale' ? 0.12 : 0.36 + Math.sin(motionClock * 5) * 0.12;
      ctx.shadowColor = '#ff243f';
      ctx.shadowBlur = 15;
      for (let i = 0; i < 5; i++) {
        const phase = ((motionClock * 0.24 + i * 0.19) % 1 + 1) % 1;
        const distance = Math.pow(phase, 1.55);
        const y = vpY + (distance - 0.04) * H * 0.78;
        const xOffset = W * (0.08 + distance * 0.36);
        const beaconW = 3 + distance * 8;
        ctx.fillStyle = `rgba(255, 54, 69, ${warningAlpha * (0.38 + distance * 0.62)})`;
        ctx.fillRect(vpX - xOffset - beaconW * 0.5, y, beaconW, 3 + distance * 7);
        ctx.fillRect(vpX + xOffset - beaconW * 0.5, y, beaconW, 3 + distance * 7);
      }
      ctx.restore();
    }

    function chargeFlashAt(phase) {
      // Brief luminance falloff gives floor panels a traveling, pulsed quality.
      return Math.max(0, 0.22 - Math.abs(phase - 0.82)) * 0.7;
    }

    function renderExitAperture(W, H, vpX, vpY, motionClock) {
      const charge = Math.max(0, Math.min(1, gate.ringsPassed / 8));
      const jammed = gameState === 'freeze' || gameState === 'terminal';
      const opening = gameState === 'solved' || gameState === 'finale' || (gameState === 'end' && endReason === 'complete');
      const unlocking = gameState === 'dummy rings' && charge >= 1;
      const pulse = 0.82 + Math.sin(motionClock * 4.2) * 0.12;
      const jamPulse = jammed ? 0.5 + Math.sin(runTime * 17) * 0.35 : 0;
      const doorW = W * (0.026 + charge * 0.057);
      const doorH = H * (0.034 + charge * 0.078);
      const openingT = opening
        ? Math.min(1, Math.max(0, (finaleTime - 1.15) / 1.8))
        : (unlocking ? Math.min(0.48, dummyGlitchTimer / 4.5) : 0);
      const gap = doorW * (0.09 + openingT * 0.88);
      const glowAlpha = opening ? 0.55 + openingT * 0.45 : (unlocking ? 0.55 + openingT * 0.45 : 0.18 + charge * 0.42);

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const glow = ctx.createRadialGradient(vpX, vpY, 0, vpX, vpY, Math.max(doorW, doorH) * 2.2);
      glow.addColorStop(0, `rgba(143, 246, 255, ${glowAlpha * pulse})`);
      glow.addColorStop(0.38, `rgba(0, 196, 255, ${glowAlpha * 0.45})`);
      glow.addColorStop(1, 'rgba(0, 70, 255, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(vpX - doorW * 2.4, vpY - doorH * 2.4, doorW * 4.8, doorH * 4.8);
      ctx.restore();

      ctx.save();
      ctx.translate(vpX, vpY);
      const panelColor = jammed ? `rgba(255, 38, 55, ${0.48 + jamPulse * 0.45})` : `rgba(143, 244, 255, ${0.62 + charge * 0.35})`;
      const panelGlow = jammed ? '#ff243f' : '#67eaff';
      ctx.shadowColor = panelGlow;
      ctx.shadowBlur = 6 + charge * 18;
      ctx.fillStyle = 'rgba(2, 9, 19, 0.92)';
      ctx.strokeStyle = panelColor;
      ctx.lineWidth = 1.2 + charge * 1.6;
      ctx.beginPath();
      ctx.moveTo(-doorW * 0.68, -doorH * 0.48);
      ctx.lineTo(doorW * 0.68, -doorH * 0.48);
      ctx.lineTo(doorW, -doorH * 0.27);
      ctx.lineTo(doorW, doorH * 0.27);
      ctx.lineTo(doorW * 0.68, doorH * 0.48);
      ctx.lineTo(-doorW * 0.68, doorH * 0.48);
      ctx.lineTo(-doorW, doorH * 0.27);
      ctx.lineTo(-doorW, -doorH * 0.27);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // The split leaves a luminous view into the exit; charge widens it, and a repaired hatch opens fully.
      const gapW = Math.max(2, gap);
      ctx.shadowColor = opening ? '#ffffff' : panelGlow;
      ctx.shadowBlur = opening ? 20 + openingT * 30 : 5 + charge * 16;
      const slit = ctx.createLinearGradient(0, -doorH * 0.37, 0, doorH * 0.37);
      slit.addColorStop(0, 'rgba(255,255,255,0.15)');
      slit.addColorStop(0.5, opening ? `rgba(239, 255, 255, ${0.55 + openingT * 0.45})` : 'rgba(59, 225, 255, 0.8)');
      slit.addColorStop(1, 'rgba(255,255,255,0.12)');
      ctx.fillStyle = slit;
      ctx.fillRect(-gapW * 0.5, -doorH * (0.37 + openingT * 0.1), gapW, doorH * (0.74 + openingT * 0.2));

      // Segmented warning lamps make the locked mechanism legible even at the distant scale.
      for (let i = 0; i < 4; i++) {
        const y = (i - 1.5) * doorH * 0.19;
        ctx.fillStyle = jammed ? `rgba(255, 53, 66, ${0.6 + jamPulse * 0.4})` : (charge >= (i + 1) / 4 ? '#eaffff' : 'rgba(71, 193, 211, 0.42)');
        ctx.fillRect(-doorW * 0.78, y, Math.max(1.5, doorW * 0.13), Math.max(1, doorH * 0.055));
        ctx.fillRect(doorW * 0.65, y, Math.max(1.5, doorW * 0.13), Math.max(1, doorH * 0.055));
      }
      ctx.restore();

      // After the repair, the same tunnel aperture blooms into the open sky rather than cutting to another scene.
      if (openingT > 0) {
        const radius = Math.max(W, H) * (0.03 + openingT * 0.98);
        const bloom = ctx.createRadialGradient(vpX, vpY, 0, vpX, vpY, radius);
        bloom.addColorStop(0, `rgba(233, 253, 255, ${0.18 + openingT * 0.7})`);
        bloom.addColorStop(0.32, `rgba(106, 224, 255, ${0.08 + openingT * 0.23})`);
        bloom.addColorStop(1, 'rgba(111, 213, 255, 0)');
        ctx.fillStyle = bloom;
        ctx.fillRect(0, 0, W, H);
      }
    }

    // =========================================================================
    // Image fallback: camera-led gradients and lane streaks without polygon ribs.
    // =========================================================================
    function renderFallbackTunnel(W, H, vpX, vpY) {
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#091725');
      bg.addColorStop(0.48, '#06111d');
      bg.addColorStop(1, '#02060c');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      const glow = ctx.createRadialGradient(vpX, vpY, 0, vpX, vpY, H * 0.8);
      glow.addColorStop(0, 'rgba(0, 184, 230, 0.42)');
      glow.addColorStop(0.3, 'rgba(0, 67, 105, 0.2)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);
      const motionClock = flightClock + runTime * 0.7 + camera.swayTime;
      renderEndlessTunnelHoops(W, H, vpX, vpY, motionClock);
      renderExitAperture(W, H, vpX, vpY, motionClock);
      renderLaneLighting(W, H, vpX, vpY, motionClock);
    }

    // =========================================================================
    // 2. 3D RING RENDERER (Section 6)
    // =========================================================================
    function renderRing3D(ring, W, H, vpX, vpY) {
      const scale = projectZScale(ring.z);
      const proximity = Math.max(0, Math.min(1, 1 - ring.z / CONFIG.tunnel.farPlane));
      const pulse = 0.88 + 0.12 * Math.sin(runTime * 7.0);

      // Dummy ring amber flicker
      let flickerAlpha = 1.0;
      if (ring.dummy) {
        flickerAlpha = 0.65 + 0.35 * Math.sin(runTime * 28.0) * Math.cos(runTime * 13.0);
      }

      // Project ring centre and radius
      const targetScreenY = heightToScreenY(ring.y);
      const cx = vpX;
      const cy = lerp(vpY, targetScreenY, scale);
      const rOuter = H * 0.205 * scale;
      const band = Math.max(7, rOuter * 0.14);
      const rInner = rOuter - band;

      const baseRGB = ring.dummy ? [255, 145, 15] : [0, 240, 255];
      const glowAlpha = (0.28 + proximity * 0.68) * flickerAlpha * pulse;

      ctx.save();
      ctx.translate(cx, cy);

      // Offset rear rim gives each gate a solid, tunnel-mounted depth profile.
      ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
      ctx.shadowBlur = Math.max(4, 15 * scale);
      ctx.strokeStyle = `rgba(3, 15, 25, ${0.92 * glowAlpha})`;
      ctx.lineWidth = Math.max(5, band * 1.55);
      ctx.beginPath();
      ctx.arc(0, 7 * scale, (rOuter + rInner) * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      // Heavy armored annulus with a crisp inner lip and luminous outer edge.
      ctx.shadowColor = `rgb(${baseRGB[0]}, ${baseRGB[1]}, ${baseRGB[2]})`;
      ctx.shadowBlur = Math.max(2, 12 * scale * (0.65 + proximity));
      ctx.strokeStyle = `rgba(12, 31, 43, ${0.96 * flickerAlpha})`;
      ctx.lineWidth = Math.max(5, band);
      ctx.beginPath();
      ctx.arc(0, 0, (rOuter + rInner) * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = Math.max(2, 10 * scale);
      ctx.strokeStyle = `rgba(${baseRGB[0]}, ${baseRGB[1]}, ${baseRGB[2]}, ${glowAlpha})`;
      ctx.lineWidth = Math.max(1.5, 3.2 * scale);
      ctx.beginPath();
      ctx.arc(0, 0, rOuter, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = `rgba(205, 243, 255, ${0.7 * glowAlpha})`;
      ctx.lineWidth = Math.max(1, 1.6 * scale);
      ctx.beginPath();
      ctx.arc(0, 0, rInner, 0, Math.PI * 2);
      ctx.stroke();

      // Twelve inset light segments sit in the armored band.
      const segCount = 12;
      const segSpan = (Math.PI * 2) / segCount;
      ctx.strokeStyle = ring.dummy
        ? `rgba(255, 194, 91, ${0.92 * glowAlpha})`
        : `rgba(112, 248, 255, ${0.9 * glowAlpha})`;
      ctx.shadowColor = ring.dummy ? '#ff8b26' : '#42efff';
      ctx.shadowBlur = Math.max(1, 7 * scale);
      ctx.lineWidth = Math.max(2, band * 0.28);

      for (let s = 0; s < segCount; s++) {
        const a0 = ring.rotAngle + s * segSpan + 0.09;
        const a1 = a0 + segSpan * 0.48;
        ctx.beginPath();
        ctx.arc(0, 0, (rOuter + rInner) * 0.5, a0, a1);
        ctx.stroke();
      }

      // Four reinforced mounting shoes make the hoops read as installed gate hardware.
      ctx.shadowBlur = 0;
      for (let m = 0; m < 4; m++) {
        const ang = ring.rotAngle * 0.16 + m * Math.PI * 0.5;
        const midR = (rOuter + rInner) * 0.5;
        ctx.save();
        ctx.rotate(ang);
        const shoeW = Math.max(8, band * 0.92);
        const shoeH = Math.max(5, band * 0.5);
        ctx.fillStyle = `rgba(18, 37, 51, ${0.96 * flickerAlpha})`;
        ctx.strokeStyle = `rgba(190, 232, 245, ${0.62 * glowAlpha})`;
        ctx.lineWidth = Math.max(1, 1.1 * scale);
        ctx.beginPath();
        ctx.roundRect(-shoeW * 0.5, -midR - shoeH * 0.5, shoeW, shoeH, shoeH * 0.25);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = ring.dummy ? '#ffc26a' : '#8fffff';
        ctx.globalAlpha = glowAlpha;
        ctx.beginPath();
        ctx.arc(0, -midR, Math.max(1.2, 2.1 * scale), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Fine etching around the outer circumference.
      ctx.strokeStyle = `rgba(210, 246, 255, ${0.48 * glowAlpha})`;
      ctx.lineWidth = Math.max(0.8, 1.2 * scale);
      for (let t = 0; t < 32; t++) {
        const ang = (t * Math.PI) / 16;
        const tx0 = Math.cos(ang) * (rOuter + band * 0.12);
        const ty0 = Math.sin(ang) * (rOuter + band * 0.12);
        const tx1 = Math.cos(ang) * (rOuter + band * (t % 4 === 0 ? 0.36 : 0.24));
        const ty1 = Math.sin(ang) * (rOuter + band * (t % 4 === 0 ? 0.36 : 0.24));
        ctx.beginPath();
        ctx.moveTo(tx0, ty0);
        ctx.lineTo(tx1, ty1);
        ctx.stroke();
      }

      ctx.restore();
    }

    // =========================================================================
    // 3. GUIDE LINE & FLOOR REFLECTION (Sections 5 & 6)
    // =========================================================================
    function renderSuitGuideLine(W, H, vpX) {
      const yScreen = heightToScreenY(player.y);
      const halfSpan = W * 0.24;

      const grad = ctx.createLinearGradient(vpX - halfSpan, yScreen, vpX + halfSpan, yScreen);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0)');
      grad.addColorStop(0.25, 'rgba(0, 240, 255, 0.28)');
      grad.addColorStop(0.5, 'rgba(0, 240, 255, 0.08)');
      grad.addColorStop(0.75, 'rgba(0, 240, 255, 0.28)');
      grad.addColorStop(1, 'rgba(0, 240, 255, 0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(vpX - halfSpan, yScreen);
      ctx.lineTo(vpX + halfSpan, yScreen);
      ctx.stroke();
    }

    function renderFloorReflection(W, H, vpX) {
      // Soft ellipse on the floor that shrinks as the suit rises
      const floorY = H * 0.84;
      const heightNorm = (player.y + 1) * 0.5; // 0 at floor, 1 at ceiling
      const rx = lerp(95, 34, heightNorm);
      const ry = lerp(20, 7, heightNorm);
      const alpha = lerp(0.45, 0.12, heightNorm);

      ctx.save();
      ctx.translate(vpX, floorY);
      const reflGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, rx);
      reflGrad.addColorStop(0, `rgba(0, 230, 255, ${alpha})`);
      reflGrad.addColorStop(0.5, `rgba(255, 160, 40, ${alpha * 0.55})`);
      reflGrad.addColorStop(1, 'rgba(0, 230, 255, 0)');
      ctx.fillStyle = reflGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // =========================================================================
    // 4. IRON MAN CUTOUT & ADDITIVE JETS (Section 5)
    // =========================================================================
    function renderIronManSuitAndJets(W, H, vpX) {
      const suitX = W * 0.5;
      const forwardProgress = (gameState === 'flight' || gameState === 'dummy rings' || gameState === 'solved' || gameState === 'finale')
        ? Math.min(0.2, flightClock * 0.004)
        : 0;
      const surge = gameState === 'solved' || gameState === 'finale'
        ? Math.min(1, Math.max(0, (finaleTime - 1.15) / 3.5))
        : 0;
      const flightScale = (1 + forwardProgress) * (1 + surge * 1.35);
      const suitDrawH = Math.min(H * 0.38, 330) * flightScale;
      const suitDrawW = ironManImageLoaded
        ? suitDrawH * (ironManImage.naturalWidth / ironManImage.naturalHeight)
        : suitDrawH * 0.52;
      const suitY = heightToScreenY(player.y) + player.dropOffset + Math.sin(runTime * 3.4) * 1.8;
      const flightLean = gameState === 'flight' || gameState === 'dummy rings'
        ? Math.sin(runTime * 2.1) * 0.8
        : 0;

      // Draw up to 4 afterimage frames faintly behind the suit for motion blur
      if (!reducedMode && player.afterimages.length > 0) {
        for (let i = player.afterimages.length - 1; i >= 0; i--) {
          const img = player.afterimages[i];
          const ghostY = heightToScreenY(img.y) + player.dropOffset;
          const ghostAlpha = (1 - (i + 1) / (player.afterimages.length + 1)) * 0.22;
          drawIronManCutout(suitX, ghostY, img.pitchDeg + flightLean, img.rollDeg, ghostAlpha, true, H);
        }
      }

      // Draw primary Iron Man suit
      drawIronManCutout(suitX, suitY, player.pitchDeg + flightLean, player.rollDeg, 1.0, false, H);
      renderHandRepulsors(suitX, suitY - player.pitchDeg * 0.65 - suitDrawH * 0.085, suitDrawW, suitDrawH, runTime + stateTime);

      // Update & draw additive-glow boot particles; hand emitters use the clean persistent effect above.
      const dtApprox = 1 / 60;
      const movingUpFactor = Math.max(0, player.vy / CONFIG.suit.maxSpeed);

      if (gameState !== 'freeze' && gameState !== 'terminal') {
        spawnJetParticles(
          dtApprox,
          suitX - suitDrawW * 0.1, suitX + suitDrawW * 0.1, suitY + suitDrawH * 0.46,
          movingUpFactor
        );
      }

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const maxPool = reducedMode ? 60 : 120;
      for (let i = 0; i < maxPool; i++) {
        const p = jetPool[i];
        if (!p.active) continue;
        if (gameState !== 'freeze' && gameState !== 'terminal') {
          p.x += p.vx * dtApprox;
          p.y += p.vy * dtApprox;
          p.life -= dtApprox;
          if (p.life <= 0) {
            p.active = false;
            continue;
          }
        }
        const lifeRatio = Math.max(0, p.life / p.maxLife);
        const radius = p.size * lifeRatio;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 2.2);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.4, p.color);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    function renderHandRepulsors(centerX, handY, suitW, suitH, clock) {
      const trailLength = Math.max(28, Math.min(52, suitH * 0.17));
      const emitterRadius = Math.max(5.5, Math.min(8.5, suitH * 0.022));
      const pulse = 0.74 + Math.sin(clock * 5.2) * 0.1;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (const side of [-1, 1]) {
        // These coordinates align with the cutout's lowered palms, not the shoulders.
        const x = centerX + side * suitW * 0.395;
        const endX = x + side * 4;
        const endY = handY + trailLength;

        // Short, narrow trails read as palm repulsor energy rather than oversized rocket plumes.
        const trail = ctx.createLinearGradient(x, handY, endX, endY);
        trail.addColorStop(0, `rgba(238, 253, 255, ${0.9 * pulse})`);
        trail.addColorStop(0.22, `rgba(73, 190, 255, ${0.74 * pulse})`);
        trail.addColorStop(0.72, `rgba(30, 117, 255, ${0.32 * pulse})`);
        trail.addColorStop(1, 'rgba(20, 102, 255, 0)');
        ctx.strokeStyle = trail;
        ctx.lineWidth = 6;
        ctx.shadowColor = '#38aaff';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(x, handY + emitterRadius * 0.75);
        ctx.quadraticCurveTo(x + side * 2, handY + trailLength * 0.48, endX, endY);
        ctx.stroke();

        ctx.strokeStyle = `rgba(229, 252, 255, ${0.72 * pulse})`;
        ctx.lineWidth = 1.25;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.moveTo(x, handY + emitterRadius);
        ctx.lineTo(endX, endY * 0.97 + handY * 0.03);
        ctx.stroke();

        // Compact palm halo with a defined white-blue emitter center.
        const haloRadius = emitterRadius * 2.2;
        const halo = ctx.createRadialGradient(x, handY, 0, x, handY, haloRadius);
        halo.addColorStop(0, `rgba(255,255,255,${0.98 * pulse})`);
        halo.addColorStop(0.2, `rgba(174,238,255,${0.92 * pulse})`);
        halo.addColorStop(0.48, `rgba(39,158,255,${0.48 * pulse})`);
        halo.addColorStop(1, 'rgba(0,100,255,0)');
        ctx.fillStyle = halo;
        ctx.shadowColor = '#45b8ff';
        ctx.shadowBlur = 7;
        ctx.beginPath();
        ctx.arc(x, handY, haloRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(244, 254, 255, ${0.95 * pulse})`;
        ctx.beginPath();
        ctx.arc(x, handY, emitterRadius * 0.42, 0, Math.PI * 2);
        ctx.fill();

        // A pair of small traveling sparks gives the steady beam a restrained energy pulse.
        const sparkCount = reducedMode ? 1 : 2;
        for (let i = 0; i < sparkCount; i++) {
          const travel = (clock * 0.78 + i * 0.5 + (side > 0 ? 0.25 : 0)) % 1;
          const sparkX = x + side * 4 * travel;
          const sparkY = handY + emitterRadius + travel * (trailLength - emitterRadius);
          ctx.fillStyle = `rgba(210, 248, 255, ${(1 - travel * 0.55) * pulse})`;
          ctx.beginPath();
          ctx.arc(sparkX, sparkY, 1.1 + travel * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    function drawIronManCutout(x, y, pitchDeg, rollDeg, alpha, isGhost, H) {
      if (!ironManImageLoaded) return;
      const imageAspect = ironManImage.naturalWidth / ironManImage.naturalHeight;
      const forwardProgress = (gameState === 'flight' || gameState === 'dummy rings' || gameState === 'solved' || gameState === 'finale')
        ? Math.min(0.2, flightClock * 0.004)
        : 0;
      const surge = gameState === 'solved' || gameState === 'finale'
        ? Math.min(1, Math.max(0, (finaleTime - 1.15) / 3.5))
        : 0;
      const surgeScale = 1 + surge * 1.35;
      const finaleFade = gameState === 'finale' ? Math.max(0, 1 - Math.max(0, finaleTime - 4.55) / 0.65) : 1;
      const drawH = Math.min(H * 0.38, 330) * (1 + forwardProgress) * surgeScale;
      const drawW = drawH * imageAspect;
      const pitchOffset = -pitchDeg * 0.65;

      ctx.save();
      ctx.translate(x, y + pitchOffset);
      ctx.rotate((rollDeg * Math.PI) / 180);
      ctx.globalAlpha = alpha * (isGhost ? 1 : finaleFade);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.shadowColor = isGhost ? 'rgba(30, 223, 255, 0.5)' : 'rgba(0, 224, 255, 0.3)';
      ctx.shadowBlur = isGhost ? 7 : 13;
      ctx.filter = isGhost ? 'hue-rotate(145deg) saturate(1.35) brightness(1.15)' : 'contrast(1.04) saturate(1.06)';
      ctx.drawImage(ironManImage, -drawW * 0.5, -drawH * 0.5, drawW, drawH);
      ctx.restore();
    }

    // =========================================================================
    // 5. PASS SHOCKWAVES, BURSTS, SHARDS & FINALE EFFECTS
    // =========================================================================
    function renderPassAndMissEffects() {
      ctx.save();
      for (let i = 0; i < shockwaves.length; i++) {
        const sw = shockwaves[i];
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = Math.max(0, sw.alpha);
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      for (let i = 0; i < burstParticles.length; i++) {
        const p = burstParticles[i];
        const alpha = Math.max(0, p.life / p.maxLife);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;

        if (p.isShard) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size * 0.7, p.size * 0.8);
          ctx.lineTo(-p.size * 0.7, p.size * 0.5);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Floating PERFECT / GOOD / COUNT ERROR labels
      for (let i = 0; i < passLabels.length; i++) {
        const lbl = passLabels[i];
        const alpha = Math.max(0, lbl.life / lbl.maxLife);
        ctx.globalAlpha = alpha;
        ctx.font = '800 22px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = lbl.color;
        ctx.shadowColor = lbl.color;
        ctx.shadowBlur = 12;
        ctx.fillText(lbl.text, lbl.x, lbl.y);
      }
      ctx.restore();
    }

    function renderFinaleEffects(W, H, vpX, vpY) {
      // 2.4-3.4 s: A light grows at the vanishing point as the suit flies toward it
      if (finaleTime >= 2.4 && finaleTime < 3.6) {
        const growT = Math.min(1, (finaleTime - 2.4) / 1.0);
        const rad = lerp(20, W * 0.75, growT * growT);
        const grad = ctx.createRadialGradient(vpX, vpY, 0, vpX, vpY, rad);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
        grad.addColorStop(0.35, 'rgba(255, 220, 100, 0.75)');
        grad.addColorStop(1, 'rgba(255, 190, 40, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(vpX, vpY, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3.4-5.0 s: Gold spark burst
      if (finaleSparks.length > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < finaleSparks.length; i++) {
          const sp = finaleSparks[i];
          if (sp.life <= 0) continue;
          const a = Math.max(0, sp.life / sp.maxLife);
          ctx.fillStyle = sp.color;
          ctx.globalAlpha = a;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // =========================================================================
    // 6. HUD RENDERER (Section 7)
    // =========================================================================
    function renderHUD(W, H) {
      ctx.save();

      // Top-left: clean passes power the exit; corrupted gates never add progress.
      const isDummyGlitch = gameState === 'dummy rings' || gameState === 'freeze' || gameState === 'terminal';
      const ringText = `EXIT CHARGE ${gate.ringsPassed}/8`;

      ctx.font = '800 20px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';

      if (isDummyGlitch) {
        const gx = (Math.random() - 0.5) * 5;
        const gy = (Math.random() - 0.5) * 2;
        ctx.fillStyle = 'rgba(255, 30, 70, 0.85)';
        ctx.fillText(ringText, 32 + gx, 40 + gy);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.85)';
        ctx.fillText(ringText, 32 - gx, 40 - gy);
      }
      ctx.fillStyle = '#e6f7ff';
      ctx.fillText(ringText, 32, 40);

      // Eight stabilizer locks; the two corrupted gates are visual bug signals only.
      for (let i = 0; i < 8; i++) {
        const px = 32 + i * 20;
        const py = 52;
        const pop = pipPopTimers[i] * 4;
        const lit = i < gate.ringsPassed;

        ctx.fillStyle = lit ? (gate.ringsPassed === 8 ? '#ffcc33' : '#00f0ff') : 'rgba(255, 255, 255, 0.16)';
        ctx.strokeStyle = lit ? '#ffffff' : 'rgba(0, 240, 255, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.fillRect(px - pop * 0.5, py - pop * 0.5, 14 + pop, 8 + pop);
        ctx.strokeRect(px - pop * 0.5, py - pop * 0.5, 14 + pop, 8 + pop);
      }

      // Top-centre: flight-tunnel escape route identity
      ctx.font = '700 15px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(0, 240, 255, 0.85)';
      ctx.fillText(gameState === 'title' ? 'STARK FLIGHT TUNNEL // EXIT SEALED' : 'STARK FLIGHT TUNNEL // ESCAPE ROUTE', W * 0.5, 38);

      // Top-right: Run timer
      const mins = Math.floor(runTime / 60);
      const secs = Math.floor(runTime % 60);
      const tenths = Math.floor((runTime * 10) % 10);
      const timerStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${tenths}`;
      ctx.font = '700 20px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillStyle = '#e6f7ff';
      ctx.fillText(timerStr, W - 32, 40);

      if (reducedMode) {
        ctx.font = '600 11px "JetBrains Mono", monospace';
        ctx.fillStyle = '#ffcc33';
        ctx.fillText('REDUCED FX (Q)', W - 32, 58);
      }

      // Right edge: Direction chevron toward the next ring whenever suit is more than 0.3 away
      if (gameState === 'flight' || gameState === 'dummy rings') {
        const nextRing = activeRings.find(r => !r.tested && r.z > 0);
        if (nextRing) {
          const diff = nextRing.y - player.y;
          if (Math.abs(diff) > 0.3) {
            const chevX = W - 46;
            const chevY = heightToScreenY(nextRing.y);
            const pointingUp = diff > 0;
            const bounce = Math.sin(runTime * 9) * 5;

            ctx.save();
            ctx.translate(chevX, chevY + (pointingUp ? -bounce : bounce));
            ctx.strokeStyle = nextRing.dummy ? '#ff9922' : '#ffcc33';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            if (pointingUp) {
              ctx.moveTo(-11, 7);
              ctx.lineTo(0, -6);
              ctx.lineTo(11, 7);
              ctx.moveTo(-11, 16);
              ctx.lineTo(0, 3);
              ctx.lineTo(11, 16);
            } else {
              ctx.moveTo(-11, -7);
              ctx.lineTo(0, 6);
              ctx.lineTo(11, -7);
              ctx.moveTo(-11, -16);
              ctx.lineTo(0, -3);
              ctx.lineTo(11, -16);
            }
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // Bottom-left: Vertical height meter (-1 floor to +1 ceiling)
      const meterX = 36;
      const meterTop = H - 175;
      const meterHeight = 130;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(meterX, meterTop, 10, meterHeight);

      // Centre tick
      ctx.beginPath();
      ctx.moveTo(meterX - 4, meterTop + meterHeight * 0.5);
      ctx.lineTo(meterX + 14, meterTop + meterHeight * 0.5);
      ctx.stroke();

      // Player marker on height meter
      const markerY = meterTop + (1 - (player.y + 1) * 0.5) * meterHeight;
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(meterX - 3, markerY - 3, 16, 6);

      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(180, 230, 255, 0.8)';
      ctx.fillText(`ALT ${(player.y >= 0 ? '+' : '') + player.y.toFixed(2)}`, meterX + 20, meterTop + meterHeight - 2);

      // Bottom-right: Controls reminder, fading after 15 seconds
      if (runTime < 16.5) {
        const ctrlAlpha = runTime < 15.0 ? 0.85 : Math.max(0, 1 - (runTime - 15.0) / 1.5) * 0.85;
        ctx.font = '600 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillStyle = `rgba(180, 230, 255, ${ctrlAlpha})`;
        ctx.fillText('CONTROLS: ↑/↓ or W/S  |  Q: REDUCED FX', W - 32, H - 32);
      }

      // Bottom-centre: JARVIS subtitle line
      if (subtitle.timer > 0 && subtitle.text) {
        const subAlpha = Math.min(1, subtitle.timer / 0.4);
        ctx.font = '600 16px Inter, sans-serif';
        const textWidth = ctx.measureText(subtitle.text).width;
        const boxW = textWidth + 96;
        const boxX = (W - boxW) * 0.5;
        const boxY = H - 64;

        ctx.fillStyle = `rgba(4, 12, 24, ${0.82 * subAlpha})`;
        ctx.strokeStyle = `rgba(0, 240, 255, ${0.45 * subAlpha})`;
        ctx.lineWidth = 1;
        ctx.fillRect(boxX, boxY, boxW, 38);
        ctx.strokeRect(boxX, boxY, boxW, 38);

        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(0, 240, 255, ${subAlpha})`;
        ctx.fillText(`JARVIS: "${subtitle.text}"`, W * 0.5, boxY + 24);
      }

      ctx.restore();
    }

    // =========================================================================
    // 7. OVERLAY BANNERS (Title, Countdown, Loop Visualiser, Finale)
    // =========================================================================
    function renderTitleCard(W, H) {
      ctx.save();
      ctx.fillStyle = 'rgba(2, 6, 15, 0.72)';
      ctx.fillRect(0, 0, W, H);

      ctx.textAlign = 'center';
      ctx.font = '700 13px "JetBrains Mono", monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.fillText('STARK INDUSTRIES // EMERGENCY FLIGHT TUNNEL', W * 0.5, H * 0.34);

      ctx.font = '900 44px Inter, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 240, 255, 0.5)';
      ctx.shadowBlur = 20;
      ctx.fillText('STARK SKIES: ESCAPE RUN', W * 0.5, H * 0.43);

      ctx.shadowBlur = 0;
      ctx.font = '600 16px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ffcc33';
      ctx.fillText('PASS 8 STABILIZER RINGS TO UNLOCK THE EXIT', W * 0.5, H * 0.51);

      ctx.font = '500 14px "JetBrains Mono", monospace';
      ctx.fillStyle = '#bfe8ff';
      ctx.fillText('JARVIS: Hatch sealed. Eight clean passes will charge the exit.', W * 0.5, H * 0.58);
      ctx.fillText('FLY: Up / Down Arrows (or W / S)   •   REDUCED FX: Q', W * 0.5, H * 0.64);
      ctx.restore();
    }

    function renderCountdownOverlay(W, H) {
      // 0:04 to 0:10 -> 3, 2, 1, then suit drops into tunnel mouth
      const elapsed = stateTime; // 0 to 6s
      let label = '';
      if (elapsed < 1.5) label = '3';
      else if (elapsed < 3.0) label = '2';
      else if (elapsed < 4.5) label = '1';
      else label = 'DROP IN';

      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '900 68px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ffcc33';
      ctx.shadowColor = 'rgba(255, 204, 51, 0.6)';
      ctx.shadowBlur = 24;
      ctx.fillText(label, W * 0.5, H * 0.34);
      ctx.restore();
    }

    function renderLoopVisualizerBanner(W, H) {
      ctx.save();
      const bx = W * 0.5 - 210;
      const by = 82;
      ctx.fillStyle = 'rgba(4, 18, 16, 0.92)';
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;
      ctx.fillRect(bx, by, 420, 54);
      ctx.strokeRect(bx, by, 420, 54);

      ctx.font = '700 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#00ff88';
      ctx.fillText(`LOOP STEPPING: i = ${gate.i}  →  CLEAN PASSES ${gate.ringsPassed}/8`, W * 0.5, by + 33);
      ctx.restore();
    }

    function renderFinaleMissionCompleteBanner(W, H) {
      ctx.save();
      const t = Math.min(1, (finaleTime - 3.4) / 0.6);
      ctx.globalAlpha = t;
      ctx.textAlign = 'center';
      ctx.font = '900 46px Inter, sans-serif';
      ctx.fillStyle = '#ffcc33';
      ctx.shadowColor = 'rgba(255, 204, 51, 0.85)';
      ctx.shadowBlur = 28;
      ctx.fillText('MISSION COMPLETE', W * 0.5, H * 0.47);
      ctx.restore();
    }

    // =========================================================================
    // EVENT LISTENERS & CONSOLE MIRROR EXECUTION
    // =========================================================================
    function executeConsoleMirrorCommand(rawInput) {
      const cmd = rawInput.trim();
      if (!cmd) return;

      // Support gate.step assignments, suit.status(), jarvis.hint(), game.restart()
      const stepAssignMatch = cmd.match(/^(?:window\.)?gate\.step\s*=\s*(.+?);?$/);
      if (stepAssignMatch) {
        const rhs = stepAssignMatch[1].trim();
        if ((rhs.startsWith('"') && rhs.endsWith('"')) || (rhs.startsWith("'") && rhs.endsWith("'"))) {
          gate.step = rhs.slice(1, -1);
        } else if (rhs === 'true' || rhs === 'false') {
          gate.step = rhs;
        } else {
          const num = Number(rhs);
          gate.step = Number.isNaN(num) ? rhs : num;
        }
        evaluateGateStep100ms();
        return;
      }

      if (cmd === 'suit.status()' || cmd === 'suit.status') {
        const st = suit.status();
        termFeedbackEl.textContent = `status: ringsPassed=${st.ringsPassed}, gate.step=${st["gate.step"]}, i=${st.i}`;
        return;
      }

      if (cmd === 'jarvis.hint()' || cmd === 'jarvis.hint') {
        jarvis.hint();
        return;
      }

      if (cmd === 'game.restart()' || cmd === 'game.restart') {
        game.restart();
        return;
      }

      termFeedbackEl.textContent = 'Try: gate.step = 1 or suit.status()';
    }

    terminalCmdFormEl.addEventListener('submit', (e) => {
      e.preventDefault();
      executeConsoleMirrorCommand(terminalCmdInputEl.value);
    });

    btnHintEl.addEventListener('click', () => {
      jarvis.hint();
    });

    btnAutosolveEl.addEventListener('click', () => {
      if (btnAutosolveEl.disabled) return;
      confirmModalEl.classList.add('open');
    });

    btnConfirmYesEl.addEventListener('click', () => {
      startAutoSolveSequence();
    });

    btnConfirmNoEl.addEventListener('click', () => {
      confirmModalEl.classList.remove('open');
    });

    btnRestartEndEl.addEventListener('click', () => {
      resetAndStartRun();
    });

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      // Judge override: Ctrl+Shift+J triggers auto-solve action (Section 10)
      if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
        e.preventDefault();
        if (gameState === 'terminal' || gameState === 'freeze') {
          startAutoSolveSequence();
        }
        return;
      }

      // Do not intercept typing when terminal input is focused
      if (document.activeElement === terminalCmdInputEl) {
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        keys.up = true;
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        keys.down = true;
      } else if (e.key === 'q' || e.key === 'Q') {
        reducedMode = !reducedMode;
      } else if (e.key === 'Enter' && gameState === 'end') {
        resetAndStartRun();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        keys.up = false;
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        keys.down = false;
      }
    });

    // Touch / On-screen controls
    const bindHoldButton = (btn, keyProp) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        keys[keyProp] = true;
      });
      const clearKey = () => { keys[keyProp] = false; };
      btn.addEventListener('pointerup', clearKey);
      btn.addEventListener('pointerleave', clearKey);
      btn.addEventListener('pointercancel', clearKey);
    };
    bindHoldButton(btnFlyUpEl, 'touchUp');
    bindHoldButton(btnFlyDownEl, 'touchDown');

    btnReducedFxEl.addEventListener('click', () => {
      reducedMode = !reducedMode;
    });

    // Pause when browser tab loses focus (Section 3)
    window.addEventListener('blur', () => {
      tabPaused = true;
      keys.up = false;
      keys.down = false;
    });

    window.addEventListener('focus', () => {
      tabPaused = false;
      lastFrameTime = performance.now();
    });

    document.addEventListener('visibilitychange', () => {
      tabPaused = document.hidden;
      if (!tabPaused) {
        lastFrameTime = performance.now();
      }
    });

    // =========================================================================
    // MAIN 60 FPS ANIMATION LOOP
    // =========================================================================
    let lastFrameTime = performance.now();
    let rafId = null;

    function frameLoop(now) {
      const rawDt = (now - lastFrameTime) / 1000;
      lastFrameTime = now;
      const dt = Math.min(0.05, Math.max(0.001, rawDt));

      updateGame(dt);
      renderGame();

      rafId = requestAnimationFrame(frameLoop);
    }

    window.addEventListener('load', () => {
      if (rafId) cancelAnimationFrame(rafId);
      resetAndStartRun();
      lastFrameTime = performance.now();
      rafId = requestAnimationFrame(frameLoop);
    });
  
