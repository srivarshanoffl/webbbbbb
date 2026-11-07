(() => {
  const game = document.querySelector('#game');
  const timerEl = document.querySelector('#timer');
  const progressFill = document.querySelector('#progressFill');
  const progressText = document.querySelector('#progressText');
  const missionText = document.querySelector('#missionText');
  const pile = document.querySelector('#structure');
  const zone = document.querySelector('#removalZone');
  const startScreen = document.querySelector('#startScreen');
  const bugScreen = document.querySelector('#bugScreen');
  const resultScreen = document.querySelector('#resultScreen');
  const resultStamp = document.querySelector('#resultStamp');
  const resultTitle = document.querySelector('#resultTitle');
  const resultText = document.querySelector('#resultText');
  const sticks = [...document.querySelectorAll('.stick')];
  const hulk = document.querySelector('.hulk');
  const hulkSprite = document.querySelector('.hulk-sprite');
  const playfield = document.querySelector('#playfield');
  const targetPulls = 12;
  const state = {
    mode: 'start', startAt: 0, elapsed: 0, animationFrame: 0,
    pulled: new Set(), dragging: null, dragBlocked: false, dragOffsetX: 0, dragOffsetY: 0,
    downX: 0, downY: 0,
    hulkAnimation: 'idle', hulkFrame: 0, hulkTimer: 0,
    // TODO(console-window-bug): Reserved empty state for the requested future console-window bug.
    consoleBug: null
  };

  function formatTime(seconds) {
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }
  function setHulkAnimation(name) {
    if (state.hulkAnimation === name && state.hulkTimer) return;
    state.hulkAnimation = name;
    state.hulkFrame = 0;
    window.clearInterval(state.hulkTimer);
    if (!hulkSprite) return;
    const showFrame = () => {
      const frameCount = name === 'bend' ? 6 : 8;
      hulkSprite.src = `assets/hulk-animation/${name}-${state.hulkFrame % frameCount}.png`;
      state.hulkFrame += 1;
    };
    showFrame();
    state.hulkTimer = window.setInterval(showFrame, name === 'pull' ? 75 : (name === 'bend' ? 120 : 150));
  }
  function moveHulkNear(stick) {
    if (!hulk) return;
    const fieldRect = (playfield || document.querySelector('#playfield')).getBoundingClientRect();
    const rodRect = stick.getBoundingClientRect();
    const hulkRect = hulk.getBoundingClientRect();
    const visualWidth = hulkRect.width;
    const rodX = rodRect.left + rodRect.width / 2 - fieldRect.left;
    const visualLeft = Math.max(0, Math.min(fieldRect.width - visualWidth, rodX - visualWidth * .72));
    hulk.style.left = `${visualLeft}px`;
    hulk.style.top = '';
    hulk.style.bottom = '';
  }
  function returnHulkHome() {
    if (!hulk) return;
    hulk.style.left = '';
    hulk.style.top = '';
    hulk.style.bottom = '';
    hulk.classList.remove('exerting', 'straining-hazard', 'heaving');
  }
  function tick() {
    if (state.mode !== 'play') return;
    state.elapsed = Math.floor((Date.now() - state.startAt) / 1000);
    if (timerEl) {
      timerEl.textContent = formatTime(Math.max(0, 120 - state.elapsed));
      timerEl.parentElement?.classList.toggle('over-target', state.elapsed >= 120);
    }
    state.animationFrame = requestAnimationFrame(tick);
  }
  function endpoints(stick) {
    const box = pile.getBoundingClientRect();
    const x = Number.parseFloat(stick.style.getPropertyValue('--x')) / 100 * box.width;
    const y = Number.parseFloat(stick.style.getPropertyValue('--y')) / 100 * box.height;
    const length = Number.parseFloat(stick.style.getPropertyValue('--w')) / 100 * box.width;
    const angle = Number.parseFloat(stick.style.getPropertyValue('--angle')) * Math.PI / 180;
    const dx = Math.cos(angle) * length / 2, dy = Math.sin(angle) * length / 2;
    return [{ x: x - dx, y: y - dy }, { x: x + dx, y: y + dy }];
  }
  function pointSegmentDistance(p, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const lengthSq = dx * dx + dy * dy;
    const t = lengthSq ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSq)) : 0;
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
  }
  function orientation(a, b, c) { return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x); }
  function segmentsTouch(a, b, c, d) {
    const ab1 = orientation(a, b, c), ab2 = orientation(a, b, d);
    const cd1 = orientation(c, d, a), cd2 = orientation(c, d, b);
    const onSegment = (p, q, r) => q.x >= Math.min(p.x, r.x) - .01 && q.x <= Math.max(p.x, r.x) + .01 && q.y >= Math.min(p.y, r.y) - .01 && q.y <= Math.max(p.y, r.y) + .01;
    if ((ab1 * ab2 < 0 && cd1 * cd2 < 0) ||
        (Math.abs(ab1) < .01 && onSegment(a, c, b)) ||
        (Math.abs(ab2) < .01 && onSegment(a, d, b)) ||
        (Math.abs(cd1) < .01 && onSegment(c, a, d)) ||
        (Math.abs(cd2) < .01 && onSegment(c, b, d))) return true;
    return Math.min(pointSegmentDistance(a, c, d), pointSegmentDistance(b, c, d), pointSegmentDistance(c, a, b), pointSegmentDistance(d, a, b)) < 18;
  }
  function isBlocked(stick) {
    const depth = Number(stick.style.getPropertyValue('--depth'));
    const [a, b] = endpoints(stick);
    return sticks.some(other => {
      if (other === stick || other.hidden || state.pulled.has(other.dataset.stick)) return false;
      if (Number(other.style.getPropertyValue('--depth')) <= depth) return false;
      const [c, d] = endpoints(other);
      return segmentsTouch(a, b, c, d);
    });
  }
  function resetGame() {
    cancelAnimationFrame(state.animationFrame);
    state.mode = 'start'; state.elapsed = 0; state.dragging = null; state.dragBlocked = false; state.pulled = new Set();
    if (timerEl) {
      timerEl.textContent = '02:00';
      timerEl.parentElement?.classList.remove('over-target');
    }
    sticks.forEach(stick => {
      pile.append(stick);
      stick.hidden = false; stick.classList.remove('dragging', 'depositing', 'vanishing');
      stick.style.left = ''; stick.style.top = ''; stick.style.width = ''; stick.style.height = '';
    });
    returnHulkHome();
    setHulkAnimation('idle');
    hulk?.classList.remove('exerting', 'straining-hazard', 'heaving');
    document.querySelectorAll('.hazard-pulling').forEach(p => p.classList.remove('hazard-pulling'));
    pile.classList.remove('pile-shift', 'settling'); zone.classList.remove('accepting'); document.querySelector('.hulk')?.classList.remove('reaching');
    progressFill.style.width = '0%'; progressText.textContent = `0 / ${targetPulls} PULLED`;
    missionText.textContent = 'Pull one clear rod at a time. Keep the pile still.';
    game.dataset.state = 'start'; resultScreen.hidden = true; bugScreen.hidden = true; startScreen.hidden = false;
  }
  function startGame() {
    state.mode = 'play'; state.startAt = Date.now(); state.elapsed = 0;
    setHulkAnimation('idle');
    game.dataset.state = 'play'; startScreen.hidden = true; resultScreen.hidden = true; tick();
  }
  function fixBug() {}
  function clearBugAndFinish() {
    fixBug();
    bugScreen.hidden = true;
    state.mode = 'clearing';
    game.dataset.state = 'clearing';
    window.setTimeout(() => {
      if (state.mode === 'clearing') showResult('complete');
    }, 1000);
  }
  function showBugWindow() {
    state.elapsed = Math.floor((Date.now() - state.startAt) / 1000);
    if (timerEl) {
      timerEl.textContent = formatTime(Math.max(0, 120 - state.elapsed));
      timerEl.parentElement?.classList.toggle('over-target', state.elapsed >= 120);
    }
    cancelAnimationFrame(state.animationFrame);
    state.mode = 'bug';
    game.dataset.state = 'bug';
    bugScreen.hidden = false;
  }
  function showResult(kind) {
    cancelAnimationFrame(state.animationFrame); state.mode = kind; game.dataset.state = kind; resultScreen.hidden = false;
    setHulkAnimation('idle');
    if (kind === 'collapse') {
      resultStamp.textContent = 'PILE SHIFTED'; resultTitle.textContent = 'TOO TANGLED.';
      resultText.textContent = 'That rod was pinned under another piece. The pile shifted before Hulk could pull it free.';
    } else {
      resultStamp.textContent = '12 RODS RECOVERED';
      resultTitle.textContent = 'CLEAN PULL.';
      resultText.textContent = 'All twelve debris rods recovered without shifting the pile.';
    }
  }
  function finishPull(stick) {
    state.pulled.add(stick.dataset.stick);
    stick.classList.add('depositing'); zone.classList.add('accepting'); pile.classList.add('settling');
    hulk?.classList.add('heaving');
    progressFill.style.width = `${(state.pulled.size / targetPulls) * 100}%`;
    progressText.textContent = `${state.pulled.size} / ${targetPulls} PULLED`;
    missionText.textContent = 'Nice and steady. Find another rod with a clear path out.';
    const currentPulls = state.pulled;
    window.setTimeout(() => {
      if (state.pulled === currentPulls && state.pulled.has(stick.dataset.stick)) {
        stick.hidden = true; stick.classList.remove('depositing');
        pile.append(stick);
        stick.style.left = ''; stick.style.top = ''; stick.style.width = ''; stick.style.height = '';
      }
      zone.classList.remove('accepting'); pile.classList.remove('settling');
      hulk?.classList.remove('heaving', 'exerting');
      returnHulkHome();
      if (state.mode === 'play') setHulkAnimation('idle');
    }, 460);
    if (state.pulled.size >= targetPulls) window.setTimeout(() => {
      if (state.mode === 'play' && state.pulled.size >= targetPulls) showBugWindow();
    }, 480);
  }
  function releaseDrag(event) {
    const stick = state.dragging;
    if (!stick) return;
    try { stick.releasePointerCapture?.(event.pointerId); } catch (_) {}
    stick.classList.remove('dragging', 'vanishing', 'hazard-pulling');
    hulk?.classList.remove('straining-hazard', 'exerting');
    const box = zone.getBoundingClientRect();
    const inside = event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
    const wasBlocked = state.dragBlocked;
    state.dragging = null; state.dragBlocked = false;
    if (!inside) {
      setHulkAnimation('idle');
      returnHulkHome();
      pile.append(stick);
      stick.style.left = ''; stick.style.top = ''; stick.style.width = ''; stick.style.height = '';
      return;
    }
    if (wasBlocked) {
      setHulkAnimation('idle');
      returnHulkHome();
      pile.classList.add('pile-shift');
      showResult('collapse');
      return;
    }
    finishPull(stick);
  }
  sticks.forEach(stick => {
    stick.addEventListener('pointerdown', event => {
      if (state.mode !== 'play' || state.pulled.has(stick.dataset.stick)) return;
      event.preventDefault();
      state.dragging = stick;
      state.dragBlocked = isBlocked(stick);
      state.downX = event.clientX;
      state.downY = event.clientY;
      moveHulkNear(stick);
      setHulkAnimation('bend');
      hulk?.classList.add('exerting');
      if (state.dragBlocked) {
        hulk?.classList.add('straining-hazard');
        stick.classList.add('hazard-pulling');
      }
      const rect = stick.getBoundingClientRect();
      const stickWidth = stick.offsetWidth;
      const stickHeight = stick.offsetHeight;
      state.dragOffsetX = event.clientX - (rect.left + rect.width / 2);
      state.dragOffsetY = event.clientY - (rect.top + rect.height / 2);
      document.body.append(stick);
      try { stick.setPointerCapture(event.pointerId); } catch (_) {}
      stick.classList.add('dragging');
      stick.style.width = `${stickWidth}px`;
      stick.style.height = `${stickHeight}px`;
      stick.style.left = `${event.clientX - state.dragOffsetX}px`;
      stick.style.top = `${event.clientY - state.dragOffsetY}px`;
    });
    stick.addEventListener('pointermove', event => {
      if (state.dragging !== stick) return;
      stick.style.left = `${event.clientX - state.dragOffsetX}px`;
      stick.style.top = `${event.clientY - state.dragOffsetY}px`;
      const dist = Math.hypot(event.clientX - state.downX, event.clientY - state.downY);
      if (dist > 18 && state.hulkAnimation !== 'pull') {
        setHulkAnimation('pull');
      }
      const zoneBox = zone.getBoundingClientRect();
      const inExit = event.clientX >= zoneBox.left && event.clientX <= zoneBox.right && event.clientY >= zoneBox.top && event.clientY <= zoneBox.bottom;
      stick.classList.toggle('vanishing', inExit);
    });
    stick.addEventListener('pointerup', releaseDrag);
    stick.addEventListener('pointercancel', releaseDrag);
  });
  document.querySelector('#startButton').addEventListener('click', startGame);
  document.querySelector('#fixNowButton').addEventListener('click', clearBugAndFinish);
  document.querySelector('#againButton').addEventListener('click', resetGame);
  document.querySelector('#restartButton').addEventListener('click', resetGame);
  window.showBugWindow = showBugWindow;
  window.clearBugAndFinish = clearBugAndFinish;
  document.addEventListener('pointermove', event => {
    const x = (event.clientX / innerWidth - .5) * 18, y = (event.clientY / innerHeight - .5) * 12;
    document.querySelectorAll('[data-depth]').forEach(layer => {
      const depth = Number(layer.dataset.depth); layer.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
    });
  });
  resetGame();
})();
