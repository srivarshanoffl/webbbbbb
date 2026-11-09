(() => {
  'use strict';

  const game = document.getElementById('game');
  const screens = {
    intro: document.getElementById('intro'),
    reveal: document.getElementById('reveal'),
    console: document.getElementById('console'),
    door: document.getElementById('door-open'),
    bug: document.getElementById('bug-screen'),
    ending: document.getElementById('ending')
  };

  const phaseLabel = document.getElementById('phase-label');
  const chapterName = document.getElementById('chapter-name');
  const statusLine = document.getElementById('status-line');
  const storyCue = document.getElementById('story-cue');
  const storyLine = document.getElementById('story-line');
  const feedback = document.getElementById('feedback');
  const consolePrompt = document.getElementById('console-prompt');
  const consoleState = document.getElementById('console-state');
  const syncLabel = document.getElementById('sync-label');
  const indicator = document.getElementById('lock-indicator');
  const inputs = [0, 1, 2].map(index => document.getElementById(`frequency-${index}`));
  const targets = [0, 1, 2].map(index => document.getElementById(`paper-code-${index}`));
  const values = [0, 1, 2].map(index => document.getElementById(`dial-value-${index}`));
  const lockStatuses = [0, 1, 2].map(index => document.getElementById(`lock-status-${index}`));
  const lockUnits = [...document.querySelectorAll('.lock-unit')];
  const scopeScreen = document.querySelector('.scope-screen');
  const scopeTraces = [...document.querySelectorAll('.scope-trace')];
  const scopeCursor = document.querySelector('.scope-cursor');
  const scopeCursorDot = document.querySelector('.scope-cursor-dot');
  const digitWindows = [...document.querySelectorAll('.digit-window b')];
  const wheelButtons = [...document.querySelectorAll('.wheel-step')];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Tactical Reticle Cursor & FX references
  const tacticalCursor = document.getElementById('tactical-cursor');
  const fxCanvas = document.getElementById('fx-canvas');
  const radarCanvas = document.getElementById('radar-canvas');
  const tableWaveCanvas = document.getElementById('table-wave-canvas');
  const osdTimecode = document.getElementById('osd-timecode');
  const cursorCoords = document.getElementById('cursor-coords');
  const dialResonanceFill = document.getElementById('dial-resonance-fill');
  const dialResonanceVal = document.getElementById('dial-resonance-val');
  const pinStatusText = document.getElementById('pin-status-text');
  const crtSpectrum = document.getElementById('crt-spectrum');
  const fixNowBtn = document.getElementById('fix-now');
  const bugProgress = document.getElementById('bug-bypass-progress');

  let state = 'intro';
  let activeLock = 0;
  let secretFrequencies = null;
  let lastFrequencies = null;
  let revealTimeout = 0;
  let revealCloseTimeout = 0;
  let retryTimeout = 0;
  let transitionTimeout = 0;
  let decryptInterval = 0;
  let parallaxFrame = 0;
  let pointerDepth = { x: 0, y: 0 };
  let scopeDragging = false;
  let screenShake = 0;

  // -------------------------------------------------------------------------
  // 60fps Particle & Atmosphere Canvas Engine
  // -------------------------------------------------------------------------
  let fxCtx = null;
  let radarCtx = null;
  let tableWaveCtx = null;
  let canvasW = 0;
  let canvasH = 0;
  let animationId = 0;
  let startTime = performance.now();

  const particles = [];
  const sparks = [];
  const steamPuffs = [];

  function initFxCanvas() {
    if (!fxCanvas) return;
    fxCtx = fxCanvas.getContext('2d');
    if (radarCanvas) radarCtx = radarCanvas.getContext('2d');
    if (tableWaveCanvas) tableWaveCtx = tableWaveCanvas.getContext('2d');

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    particles.length = 0;
    const count = 45;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvasW,
        y: Math.random() * canvasH,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -0.15 - Math.random() * 0.35,
        size: 1 + Math.random() * 2,
        alpha: 0.15 + Math.random() * 0.45,
        pulseSpeed: 0.01 + Math.random() * 0.02,
        baseAlpha: 0.2 + Math.random() * 0.4
      });
    }

    if (crtSpectrum && crtSpectrum.children.length === 0) {
      for (let i = 0; i < 24; i++) {
        const bar = document.createElement('div');
        bar.className = 'crt-spec-col';
        bar.style.cssText = 'flex:1;background:rgba(54,240,163,0.35);margin:0 1px;border-radius:1px;height:20%;transition:height 0.1s;';
        crtSpectrum.appendChild(bar);
      }
    }

    renderLoop();
  }

  function resizeCanvas() {
    if (!fxCanvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasW = window.innerWidth;
    canvasH = window.innerHeight;
    fxCanvas.width = canvasW * dpr;
    fxCanvas.height = canvasH * dpr;
    fxCanvas.style.width = `${canvasW}px`;
    fxCanvas.style.height = `${canvasH}px`;
    if (fxCtx) fxCtx.scale(dpr, dpr);

    if (radarCanvas && radarCtx) {
      const rw = 100;
      const rh = 16;
      radarCanvas.width = Math.round(rw * dpr);
      radarCanvas.height = Math.round(rh * dpr);
      radarCanvas.style.width = `${rw}px`;
      radarCanvas.style.height = `${rh}px`;
      radarCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    if (tableWaveCanvas && tableWaveCtx) {
      const tw = 160;
      const th = 28;
      tableWaveCanvas.width = Math.round(tw * dpr);
      tableWaveCanvas.height = Math.round(th * dpr);
      tableWaveCanvas.style.width = `${tw}px`;
      tableWaveCanvas.style.height = `${th}px`;
      tableWaveCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  function spawnSparks(x, y, count = 20, color = '#ff3b50') {
    if (prefersReducedMotion) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 7;
      sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        life: 1,
        decay: 0.02 + Math.random() * 0.04,
        size: 1.5 + Math.random() * 2.5,
        color
      });
    }
  }

  function spawnSteam(x, y, count = 3) {
    if (prefersReducedMotion) return;
    for (let i = 0; i < count; i++) {
      steamPuffs.push({
        x: x + (Math.random() - 0.5) * 40,
        y,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -1.2 - Math.random() * 1.5,
        radius: 8 + Math.random() * 14,
        maxRadius: 35 + Math.random() * 40,
        alpha: 0.35 + Math.random() * 0.25,
        growth: 0.4 + Math.random() * 0.6
      });
    }
  }

  function triggerScreenShake(amount = 8) {
    if (prefersReducedMotion) return;
    screenShake = amount;
  }

  function renderLoop() {
    const now = performance.now();
    const elapsed = now - startTime;

    // Minimal running timecode
    if (osdTimecode) {
      const totalSec = Math.floor(elapsed / 1000);
      const mins = Math.floor(totalSec / 60);
      const secs = totalSec % 60;
      osdTimecode.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    if (fxCtx) {
      fxCtx.clearRect(0, 0, canvasW, canvasH);

      if (screenShake > 0.1) {
        const ox = (Math.random() - 0.5) * screenShake * 2;
        const oy = (Math.random() - 0.5) * screenShake * 2;
        game.style.transform = `translate3d(${ox}px, ${oy}px, 0)`;
        screenShake *= 0.88;
      } else if (screenShake !== 0) {
        screenShake = 0;
        game.style.transform = '';
      }

      // Draw Floating Dust Motes
      fxCtx.fillStyle = '#c2e2ff';
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx + Math.sin(now * 0.001 + i) * 0.15;
        p.y += p.vy;

        if (p.x < 0) p.x = canvasW;
        if (p.x > canvasW) p.x = 0;
        if (p.y < 0) p.y = canvasH;

        p.alpha = p.baseAlpha + Math.sin(now * p.pulseSpeed) * 0.15;
        fxCtx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        fxCtx.beginPath();
        fxCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        fxCtx.fill();
      }

      // Draw Steam
      for (let i = steamPuffs.length - 1; i >= 0; i--) {
        const puff = steamPuffs[i];
        puff.x += puff.vx;
        puff.y += puff.vy;
        puff.radius += puff.growth;
        puff.alpha -= 0.005;

        if (puff.alpha <= 0 || puff.radius >= puff.maxRadius) {
          steamPuffs.splice(i, 1);
          continue;
        }

        const grad = fxCtx.createRadialGradient(puff.x, puff.y, 0, puff.x, puff.y, puff.radius);
        grad.addColorStop(0, `rgba(200, 230, 245, ${puff.alpha * 0.6})`);
        grad.addColorStop(0.6, `rgba(160, 200, 220, ${puff.alpha * 0.3})`);
        grad.addColorStop(1, 'rgba(160, 200, 220, 0)');

        fxCtx.globalAlpha = 1;
        fxCtx.fillStyle = grad;
        fxCtx.beginPath();
        fxCtx.arc(puff.x, puff.y, puff.radius, 0, Math.PI * 2);
        fxCtx.fill();
      }

      // Draw Sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.22;
        s.life -= s.decay;

        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        fxCtx.globalAlpha = s.life;
        fxCtx.fillStyle = s.color;
        fxCtx.shadowColor = s.color;
        fxCtx.shadowBlur = 8;
        fxCtx.beginPath();
        fxCtx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
        fxCtx.fill();
        fxCtx.shadowBlur = 0;
      }
      fxCtx.globalAlpha = 1;

      if (Math.random() < 0.03) {
        spawnSteam(canvasW * 0.52, canvasH * 0.68, 1);
      }
    }

    // Mini Radar
    if (radarCtx) {
      const rw = radarCanvas.width;
      const rh = radarCanvas.height;
      radarCtx.clearRect(0, 0, rw, rh);
      radarCtx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
      radarCtx.lineWidth = 1;
      radarCtx.beginPath();
      for (let x = 0; x < rw; x += 3) {
        const y = rh / 2 + Math.sin(x * 0.15 + now * 0.008) * 5 * Math.sin(now * 0.003);
        if (x === 0) radarCtx.moveTo(x, y);
        else radarCtx.lineTo(x, y);
      }
      radarCtx.stroke();
    }

    // Table Screen Wave
    if (tableWaveCtx) {
      const tw = tableWaveCanvas.width;
      const th = tableWaveCanvas.height;
      tableWaveCtx.clearRect(0, 0, tw, th);
      tableWaveCtx.strokeStyle = 'rgba(54, 240, 163, 0.7)';
      tableWaveCtx.lineWidth = 1.5;
      tableWaveCtx.beginPath();
      for (let x = 0; x < tw; x += 2) {
        const y = th / 2 + Math.sin(x * 0.2 + now * 0.012) * 6;
        if (x === 0) tableWaveCtx.moveTo(x, y);
        else tableWaveCtx.lineTo(x, y);
      }
      tableWaveCtx.stroke();
    }

    // CRT Spectrum
    if (crtSpectrum && state === 'puzzle' && activeLock === 1) {
      const children = crtSpectrum.children;
      const inputVal = Number(inputs[1].value);
      for (let i = 0; i < children.length; i++) {
        const h = 15 + Math.abs(Math.sin(now * 0.006 + i * 0.4)) * 70 * (0.4 + (inputVal / 999) * 0.6);
        children[i].style.height = `${Math.min(95, h)}%`;
      }
    }

    animationId = requestAnimationFrame(renderLoop);
  }

  // -------------------------------------------------------------------------
  // Narrative & Phase Orchestration
  // -------------------------------------------------------------------------
  const setStatus = (phase, text) => {
    state = phase;
    game.className = `game phase-${phase}`;
    statusLine.textContent = text;
    const labels = {
      intro: 'THE DEAD FREQUENCY',
      entering: 'INFILTRATING',
      reveal: 'MEMORIZE',
      puzzle: 'OVERRIDE',
      unlocking: 'RELEASING',
      alarm: 'SCRAMBLE',
      door: 'TARGET IN SIGHT',
      theft: 'RETRIEVING',
      bug: 'SIGNAL LOST',
      escape: 'EXFILTRATING',
      ending: 'COMPLETE'
    };
    phaseLabel.textContent = labels[phase] || 'DEAD FREQUENCY';

    const chapterIndex = ['unlocking', 'door', 'theft'].includes(phase) ? 1 : ['bug', 'escape', 'ending'].includes(phase) ? 2 : 0;
    const chapterLabels = ['INFILTRATE', 'STEAL', 'EXFILTRATE'];
    if (chapterName) chapterName.textContent = chapterLabels[chapterIndex];

    const nodes = document.querySelectorAll('.chapter-node');
    nodes.forEach((node, index) => {
      node.querySelector('i').classList.toggle('active', index === chapterIndex);
      node.querySelector('i').classList.toggle('complete', index < chapterIndex);
    });
  };

  function setScreen(name, visible) {
    if (screens[name]) screens[name].hidden = !visible;
  }

  function narrate(text, visible = true) {
    if (storyLine) storyLine.textContent = text;
    if (storyCue) storyCue.hidden = !visible || !text;
  }

  function updateParallax(event) {
    // Custom Reticle Cursor positioning & hover detection
    if (tacticalCursor && event.pointerType === 'mouse') {
      tacticalCursor.classList.add('active');
      tacticalCursor.style.left = `${event.clientX}px`;
      tacticalCursor.style.top = `${event.clientY}px`;
      const isInteractive = event.target.closest('button, input, .scope-screen, a');
      tacticalCursor.classList.toggle('cursor-hover', Boolean(isInteractive));
    }

    if (prefersReducedMotion || event.pointerType !== 'mouse') return;
    const bounds = game.getBoundingClientRect();
    const mx = event.clientX - bounds.left;
    const my = event.clientY - bounds.top;

    if (cursorCoords) {
      cursorCoords.textContent = `${String(Math.round(mx)).padStart(3, '0')} // ${String(Math.round(my)).padStart(3, '0')}`;
    }

    pointerDepth = {
      x: (mx / bounds.width - 0.5) * 16,
      y: (my / bounds.height - 0.5) * 10
    };

    if (parallaxFrame) return;
    parallaxFrame = window.requestAnimationFrame(() => {
      game.style.setProperty('--depth-x', `${-pointerDepth.x}px`);
      game.style.setProperty('--depth-y', `${-pointerDepth.y}px`);
      game.style.setProperty('--light-x', `${pointerDepth.x * 0.4}px`);
      game.style.setProperty('--light-y', `${pointerDepth.y * 0.4}px`);
      parallaxFrame = 0;
    });
  }

  function resetParallax() {
    if (parallaxFrame) window.cancelAnimationFrame(parallaxFrame);
    parallaxFrame = 0;
    game.style.setProperty('--depth-x', '0px');
    game.style.setProperty('--depth-y', '0px');
    game.style.setProperty('--light-x', '0px');
    game.style.setProperty('--light-y', '0px');
  }

  function generateFrequencies() {
    let code;
    do {
      code = Array.from({ length: 3 }, () => Math.floor(Math.random() * 1000));
    } while (new Set(code).size !== code.length || (lastFrequencies && code.every((value, index) => value === lastFrequencies[index])));
    lastFrequencies = code.slice();
    return code;
  }

  function clearTimers() {
    window.clearTimeout(revealTimeout);
    window.clearTimeout(revealCloseTimeout);
    window.clearTimeout(retryTimeout);
    window.clearTimeout(transitionTimeout);
    window.clearInterval(decryptInterval);
    revealTimeout = 0;
    revealCloseTimeout = 0;
    retryTimeout = 0;
    transitionTimeout = 0;
    decryptInterval = 0;
  }

  function setActiveLock() {
    lockUnits.forEach((unit, index) => {
      const isActive = index === activeLock;
      unit.classList.toggle('active-lock', isActive);
      unit.setAttribute('aria-hidden', String(!isActive));
      inputs[index].disabled = !isActive;
      wheelButtons.filter(button => unit.contains(button)).forEach(button => { button.disabled = !isActive; });
    });

    const indPills = document.querySelectorAll('.ind-pill');
    indPills.forEach((pill, index) => {
      pill.classList.toggle('current', index === activeLock);
      pill.classList.toggle('active', index < activeLock);
    });

    syncLabel.textContent = `RELEASE 0${activeLock + 1}`;
    document.getElementById('sync').disabled = false;
  }

  function resetConsole() {
    screens.console.classList.remove('bad-entry', 'correct-entry');
    activeLock = 0;
    inputs.forEach((input, index) => {
      input.value = '0';
      input.disabled = false;
      updateDial(index);
      lockStatuses[index].textContent = 'ARMED';
      lockUnits[index].classList.remove('locked-in', 'unlocking', 'active-lock');
    });
    wheelButtons.forEach(button => { button.disabled = false; });
    setActiveLock();
    document.querySelectorAll('.ind-pill').forEach(pill => pill.classList.remove('active', 'current'));
    document.getElementById('sync').disabled = false;
    feedback.textContent = '';
    consoleState.textContent = 'SIGNAL LOST';
  }

  // -------------------------------------------------------------------------
  // Minimal Dossier Reveal & Decryption
  // -------------------------------------------------------------------------
  function startReveal() {
    clearTimers();
    secretFrequencies = generateFrequencies();

    let decryptStep = 0;
    const hexChars = '0123456789ABCDEF';
    decryptInterval = window.setInterval(() => {
      decryptStep++;
      targets.forEach((target, index) => {
        if (decryptStep > 10 + index * 4) {
          target.textContent = String(secretFrequencies[index]).padStart(3, '0');
        } else {
          target.textContent = Array.from({ length: 3 }, () => hexChars[Math.floor(Math.random() * hexChars.length)]).join('');
        }
      });

      if (decryptStep > 22) {
        window.clearInterval(decryptInterval);
        decryptInterval = 0;
      }
    }, 40);

    resetConsole();
    setScreen('intro', false);
    setScreen('door', false);
    setScreen('bug', false);
    setScreen('ending', false);
    setScreen('console', false);
    setScreen('reveal', true);
    screens.reveal.classList.remove('paper-closing');
    setStatus('reveal', 'MEMORIZE');
    narrate('Three carriers. Memorize.');

    spawnSparks(window.innerWidth * 0.5, window.innerHeight * 0.35, 20, '#ffd166');

    const progress = document.getElementById('reveal-progress');
    progress.style.animation = 'none';
    void progress.offsetWidth;
    progress.style.animation = '';

    revealCloseTimeout = window.setTimeout(() => {
      screens.reveal.classList.add('paper-closing');
      spawnSparks(window.innerWidth * 0.5, window.innerHeight * 0.35, 25, '#ff3b50');
    }, 3600);

    revealTimeout = window.setTimeout(() => {
      targets.forEach(target => { target.textContent = ''; });
      setScreen('reveal', false);
      setScreen('console', true);
      setStatus('puzzle', 'LOCK 01');
      consoleState.textContent = 'LOCK 01 ACTIVE';
      narrate('Rotary active.');
      inputs[0].focus({ preventScroll: true });
    }, 4000);
  }

  // -------------------------------------------------------------------------
  // Tactical Instrument Updates
  // -------------------------------------------------------------------------
  function updateDial(index) {
    const value = Number(inputs[index].value);
    const digits = String(value).padStart(3, '0');

    let closeness = 0;
    if (secretFrequencies) {
      const delta = Math.abs(value - secretFrequencies[index]);
      closeness = Math.max(0, 1 - delta / 300);
    }

    if (index === 2) {
      digitWindows.forEach((digit, place) => {
        if (digit.textContent === digits[place]) return;
        digit.textContent = digits[place];
        const wheel = digit.closest('.digit-window');
        wheel.classList.remove('rolling');
        void wheel.offsetWidth;
        wheel.classList.add('rolling');
      });

      if (pinStatusText) {
        if (secretFrequencies && value === secretFrequencies[2]) {
          pinStatusText.textContent = 'READY';
          pinStatusText.style.color = 'var(--gold-core)';
        } else if (closeness > 0.8) {
          pinStatusText.textContent = 'SYNCING';
          pinStatusText.style.color = 'var(--cyan-core)';
        } else {
          pinStatusText.textContent = 'ENGAGED';
          pinStatusText.style.color = '';
        }
      }
    } else {
      if (values[index]) values[index].textContent = digits;
    }

    const angle = -135 + (value / 999) * 270;
    if (index === 0) {
      const needle = lockUnits[0].querySelector('.dial-needle');
      const tickRing = lockUnits[0].querySelector('.dial-tick-ring');
      if (needle) needle.style.transform = `rotate(${angle}deg)`;
      if (tickRing) tickRing.style.transform = `rotate(${angle * 0.08}deg)`;

      if (dialResonanceFill && dialResonanceVal) {
        const pct = Math.round(closeness * 100);
        dialResonanceFill.style.height = `${pct}%`;
        dialResonanceVal.textContent = `${pct}%`;
      }

      if (closeness > 0.95 && Math.random() < 0.25) {
        const shell = lockUnits[0].querySelector('.dial-shell');
        if (shell) {
          const rect = shell.getBoundingClientRect();
          spawnSparks(rect.left + rect.width / 2, rect.top + rect.height / 2, 3, '#00e5ff');
        }
      }
    } else if (index === 1) {
      const x = (value / 999) * 300;
      if (scopeCursor) {
        scopeCursor.setAttribute('x1', x);
        scopeCursor.setAttribute('x2', x);
      }
      if (scopeCursorDot) scopeCursorDot.setAttribute('cx', x);
      const cursorRing = lockUnits[1].querySelector('.scope-cursor-ring');
      if (cursorRing) cursorRing.setAttribute('cx', x);

      const targetVal = secretFrequencies ? secretFrequencies[1] : 500;
      const refTrace = lockUnits[1].querySelector('.scope-trace-ref');
      if (refTrace) {
        const refCycles = 4 + (targetVal / 999) * 6;
        const refPoints = Array.from({ length: 51 }, (_, point) => {
          const px = point * 6;
          const py = 66 + Math.sin((point / 50) * Math.PI * 2 * refCycles + performance.now() * 0.003) * 18;
          return `${point === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`;
        }).join(' ');
        refTrace.setAttribute('d', refPoints);
      }

      scopeTraces.forEach((trace, channel) => {
        if (trace.classList.contains('scope-trace-ref')) return;
        const amplitude = [26, 16, 10][channel] || 18;
        const phase = value * 0.008 + channel * 1.4 + performance.now() * 0.004;
        const cycles = 3.5 + (value / 999) * 6.5;
        const harmonicBonus = closeness > 0.85 ? Math.sin(performance.now() * 0.02) * (closeness * 10) : 0;

        const points = Array.from({ length: 51 }, (_, point) => {
          const px = point * 6;
          const py = 66 + Math.sin((point / 50) * Math.PI * 2 * cycles + phase) * amplitude + harmonicBonus;
          return `${point === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`;
        }).join(' ');
        trace.setAttribute('d', points);
      });
    }
  }

  function setScopeFromPointer(event) {
    const bounds = scopeScreen.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    inputs[1].value = String(Math.round(ratio * 999));
    updateDial(1);
  }

  function stepDigit(event) {
    if (state !== 'puzzle') return;
    const button = event.currentTarget;
    const place = Number(button.dataset.place);
    const direction = Number(button.dataset.direction);
    const digits = String(Number(inputs[2].value)).padStart(3, '0').split('');
    const digitIndex = place === 100 ? 0 : place === 10 ? 1 : 2;
    digits[digitIndex] = String((Number(digits[digitIndex]) + direction + 10) % 10);
    inputs[2].value = String(Number(digits.join('')));
    updateDial(2);

    const rect = button.getBoundingClientRect();
    spawnSparks(rect.left + rect.width / 2, rect.top + rect.height / 2, 4, '#ffd166');
  }

  // -------------------------------------------------------------------------
  // Lock Synchronization
  // -------------------------------------------------------------------------
  function syncFrequencies() {
    if (state !== 'puzzle' || !secretFrequencies) return;
    const correct = Number(inputs[activeLock].value) === secretFrequencies[activeLock];

    if (!correct) {
      triggerScreenShake(14);
      const panel = screens.console;
      panel.classList.remove('bad-entry');
      void panel.offsetWidth;
      panel.classList.add('bad-entry');

      const activeUnit = lockUnits[activeLock];
      const rect = activeUnit.getBoundingClientRect();
      spawnSparks(rect.left + rect.width / 2, rect.top + rect.height / 2, 30, '#ff1a35');

      inputs.forEach(input => { input.disabled = true; });
      document.getElementById('sync').disabled = true;
      wheelButtons.forEach(button => { button.disabled = true; });
      feedback.textContent = 'WRONG CARRIER';
      consoleState.textContent = 'SCRAMBLED';
      setStatus('alarm', 'SCRAMBLE');
      narrate('Carrier desync.');
      secretFrequencies = null;
      retryTimeout = window.setTimeout(startReveal, 1100);
      return;
    }

    screens.console.classList.remove('bad-entry');
    screens.console.classList.add('correct-entry');
    const completedLock = activeLock;
    inputs[completedLock].disabled = true;
    document.getElementById('sync').disabled = true;
    wheelButtons.filter(button => lockUnits[completedLock].contains(button)).forEach(button => { button.disabled = true; });

    consoleState.textContent = `LOCK 0${completedLock + 1} CLEARED`;
    feedback.textContent = `RELEASED`;

    const activeUnit = lockUnits[completedLock];
    const rect = activeUnit.getBoundingClientRect();
    spawnSparks(rect.left + rect.width / 2, rect.top + rect.height / 2, 35, '#00e5ff');
    spawnSteam(rect.left + rect.width / 2, rect.bottom, 3);

    const releaseLock = index => {
      lockStatuses[index].textContent = 'RELEASED';
      lockUnits[index].classList.add('locked-in', 'unlocking');
      const indPills = document.querySelectorAll('.ind-pill');
      if (indPills[index]) indPills[index].classList.add('active');
    };
    releaseLock(completedLock);

    if (completedLock < 2) {
      const nextLock = completedLock + 1;
      statusLine.textContent = `LOCK 0${nextLock + 1} READY`;
      narrate(completedLock === 0 ? 'Rotary released.' : 'Scope locked.');

      transitionTimeout = window.setTimeout(() => {
        lockStatuses[completedLock].textContent = 'DISENGAGED';
        lockUnits[completedLock].classList.remove('unlocking');
        activeLock = nextLock;
        screens.console.classList.remove('correct-entry');
        setActiveLock();
        consoleState.textContent = `LOCK 0${activeLock + 1} ACTIVE`;
        feedback.textContent = '';
        inputs[activeLock].focus({ preventScroll: true });
      }, 900);
      return;
    }

    // Final Unlock
    secretFrequencies = null;
    setStatus('unlocking', 'UNSEALING');
    narrate('All locks cleared.');
    triggerScreenShake(10);
    spawnSteam(window.innerWidth * 0.6, window.innerHeight * 0.5, 8);

    transitionTimeout = window.setTimeout(() => {
      lockStatuses[2].textContent = 'DISENGAGED';
      lockUnits[2].classList.remove('unlocking');
      setStatus('door', 'VAULT OPEN');
      narrate('Vault unsealed.');
      game.classList.add('door-opening');
      triggerScreenShake(8);

      transitionTimeout = window.setTimeout(() => {
        setScreen('console', false);
        setScreen('door', true);
        document.getElementById('exit-vault').focus({ preventScroll: true });
      }, 1500);
    }, 900);
  }

  function beginOperation() {
    setScreen('intro', false);
    setStatus('entering', 'INFILTRATING');
    narrate('Infiltrating.');
    transitionTimeout = window.setTimeout(startReveal, 2450);
  }

  function beginTheft() {
    if (state !== 'door') return;
    setScreen('door', false);
    setStatus('theft', 'RETRIEVING');
    narrate('Retrieving asset.');

    transitionTimeout = window.setTimeout(() => {
      game.classList.add('theft-snatch');
      triggerScreenShake(12);
      spawnSparks(window.innerWidth * 0.57, window.innerHeight * 0.52, 45, '#ff1a35');
      narrate('Archive secured.');

      transitionTimeout = window.setTimeout(() => {
        game.classList.remove('theft-snatch');
        game.classList.add('intel-secured');
        statusLine.textContent = 'SECURED';
        phaseLabel.textContent = 'SECURED';
        transitionTimeout = window.setTimeout(enterBug, 900);
      }, 1000);
    }, 900);
  }

  function enterBug() {
    setScreen('door', false);
    setScreen('bug', true);
    setStatus('bug', 'LINK LOST');
    triggerScreenShake(10);
    narrate('Link lost.');
    document.getElementById('continue').focus({ preventScroll: true });
  }

  function triggerBypass() {
    if (fixNowBtn) {
      fixNowBtn.disabled = true;
      fixNowBtn.innerHTML = '<span>BYPASSING...</span>';
    }
    if (bugProgress) {
      bugProgress.style.transition = 'width 1s ease-out';
      bugProgress.style.width = '100%';
    }
    triggerScreenShake(6);
    spawnSparks(window.innerWidth * 0.5, window.innerHeight * 0.5, 35, '#00e5ff');
    narrate('Bypass executed.');

    window.setTimeout(() => {
      continueEscape();
    }, 1100);
  }

  function continueEscape() {
    setScreen('bug', false);
    setStatus('escape', 'EXFILTRATING');
    narrate('Exfiltrating.');
    game.classList.add('door-opening');
    triggerScreenShake(6);

    transitionTimeout = window.setTimeout(() => {
      setStatus('ending', 'COMPLETE');
      narrate('', false);
      setScreen('ending', true);
      statusLine.textContent = 'COMPLETE';
      document.getElementById('play-again').focus({ preventScroll: true });
    }, 1800);
  }

  function restart() {
    clearTimers();
    secretFrequencies = null;
    game.classList.remove('door-opening', 'theft-snatch', 'intel-secured');
    for (const name of Object.keys(screens)) setScreen(name, name === 'intro');
    setStatus('intro', 'STANDBY');
    narrate('', false);
    resetConsole();
    if (fixNowBtn) {
      fixNowBtn.disabled = false;
      fixNowBtn.innerHTML = '<span class="fix-glitch-text">BYPASS</span>';
    }
    if (bugProgress) {
      bugProgress.style.transition = 'none';
      bugProgress.style.width = '0%';
    }
  }

  // -------------------------------------------------------------------------
  // Event Bindings
  // -------------------------------------------------------------------------
  inputs.forEach((input, index) => {
    input.addEventListener('input', () => updateDial(index));
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        syncFrequencies();
      }
    });
  });

  wheelButtons.forEach(button => button.addEventListener('click', stepDigit));

  if (scopeScreen) {
    scopeScreen.addEventListener('pointerdown', event => {
      if (state !== 'puzzle') return;
      scopeDragging = true;
      scopeScreen.setPointerCapture(event.pointerId);
      setScopeFromPointer(event);
    });
    scopeScreen.addEventListener('pointermove', event => {
      if (scopeDragging) setScopeFromPointer(event);
    });
    scopeScreen.addEventListener('pointerup', () => { scopeDragging = false; });
    scopeScreen.addEventListener('pointercancel', () => { scopeDragging = false; });
  }

  document.getElementById('begin').addEventListener('click', beginOperation);
  document.getElementById('sync').addEventListener('click', syncFrequencies);
  document.getElementById('exit-vault').addEventListener('click', beginTheft);
  document.getElementById('continue').addEventListener('click', continueEscape);
  if (fixNowBtn) fixNowBtn.addEventListener('click', triggerBypass);
  document.getElementById('restart').addEventListener('click', restart);
  document.getElementById('play-again').addEventListener('click', restart);

  window.addEventListener('pointermove', updateParallax);
  game.addEventListener('pointerleave', resetParallax);

  // Initialize Canvas & System
  initFxCanvas();
  restart();
})();
