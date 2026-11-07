(() => {
  const game = document.querySelector('#game');
  const captain = document.querySelector('#captain');
  const captainSprite = document.querySelector('#captainSprite');
  const civilians = document.querySelector('#civilians');
  const groupLabel = civilians.querySelector('.group-label');
  const civilianText = document.querySelector('#civilianText');
  const shield = document.querySelector('#shield');
  const hazardEl = document.querySelector('#hazard');
  const trajectory = document.querySelector('#trajectory');
  const warning = document.querySelector('#warning');
  const warningText = document.querySelector('#warningText');
  const warningArrow = document.querySelector('#warningArrow');
  const missionCue = document.querySelector('#missionCue');
  const impact = document.querySelector('#impact');
  const impactText = document.querySelector('#impactText');
  const titleScreen = document.querySelector('#titleScreen');
  const bugScreen = document.querySelector('#bugScreen');
  const fallenScreen = document.querySelector('#fallenScreen');
  const outcomeScreen = document.querySelector('#outcomeScreen');
  const outcomeEyebrow = document.querySelector('#outcomeEyebrow');
  const outcomeTitle = document.querySelector('#outcomeTitle');
  const outcomeText = document.querySelector('#outcomeText');
  const outcomeButton = document.querySelector('#outcomeButton');
  const sectionLabel = document.querySelector('#sectionLabel');
  const routeProgress = document.querySelector('#routeProgress');
  const vfxCanvas = document.querySelector('#vfxCanvas');
  const vfxCtx = vfxCanvas ? vfxCanvas.getContext('2d') : null;
  const screenFlash = document.querySelector('#screenFlash');
  const debrisImg = new Image();
  debrisImg.src = 'assets/debris-obstacle.png';

  const vfx = {
    shards: [],
    sparks: [],
    dust: [],
    shockwaves: [],
    hazardTrail: []
  };

  function resizeCanvas() {
    if (!vfxCanvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = game.getBoundingClientRect();
    vfxCanvas.width = rect.width * dpr;
    vfxCanvas.height = rect.height * dpr;
    if (vfxCtx) vfxCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function clearVFX() {
    vfx.shards.length = 0;
    vfx.sparks.length = 0;
    vfx.dust.length = 0;
    vfx.shockwaves.length = 0;
    vfx.hazardTrail.length = 0;
    if (vfxCtx && vfxCanvas) {
      vfxCtx.clearRect(0, 0, vfxCanvas.width, vfxCanvas.height);
    }
  }

  function generateRockPolygon(numVertices, radius) {
    const points = [];
    for (let i = 0; i < numVertices; i++) {
      const angle = (i / numVertices) * Math.PI * 2;
      const r = radius * (0.62 + Math.random() * 0.76);
      points.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
    }
    return points;
  }

  function triggerDebrisShatter(point, hitNormal, centerHit, bounceVector) {
    const numShards = centerHit ? Math.floor(16 + Math.random() * 8) : Math.floor(9 + Math.random() * 5);
    const bounceAngle = Math.atan2(bounceVector.y, bounceVector.x);
    const spread = centerHit ? 1.7 : 1.2;

    const imgW = debrisImg.naturalWidth || 1536;
    const imgH = debrisImg.naturalHeight || 1024;

    for (let i = 0; i < numShards; i++) {
      const isMajorChunk = !centerHit && i < 2;
      const size = isMajorChunk
        ? 48 + Math.random() * 32
        : (centerHit ? (i < 4 ? 34 + Math.random() * 22 : 12 + Math.random() * 20) : 16 + Math.random() * 26);

      const angle = bounceAngle + (Math.random() - 0.5) * spread;
      const speed = (centerHit ? 450 : 340) + Math.random() * (centerHit ? 850 : 620);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 110 * Math.random();

      const numVerts = Math.floor(5 + Math.random() * 4);
      const verts = generateRockPolygon(numVerts, size * 0.5);

      const srcW = Math.min(imgW * 0.35, 200 + Math.random() * 250);
      const srcH = Math.min(imgH * 0.35, 150 + Math.random() * 200);
      const srcX = Math.random() * Math.max(10, imgW - srcW);
      const srcY = Math.random() * Math.max(10, imgH - srcH);

      vfx.shards.push({
        x: point.x + (Math.random() - 0.5) * 32,
        y: point.y + (Math.random() - 0.5) * 32,
        vx,
        vy,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * (centerHit ? 18 : 12),
        size,
        verts,
        srcX, srcY, srcW, srcH,
        life: 0,
        maxLife: 1.1 + Math.random() * 0.8,
        gravity: 920 + Math.random() * 160,
        bounceCount: 0,
        colorTone: Math.random() < 0.4 ? '#4a5156' : (Math.random() < 0.7 ? '#6f787f' : '#2d3337')
      });
    }

    // Vibranium Shield Kinetic Shockwave
    vfx.shockwaves.push({
      x: point.x,
      y: point.y,
      radius: 14,
      maxRadius: centerHit ? 350 : 260,
      life: 0,
      maxLife: centerHit ? 0.38 : 0.3,
      thickness: centerHit ? 8 : 5,
      color: centerHit ? 'rgba(195, 245, 255, ' : 'rgba(135, 220, 255, '
    });
    // Secondary wider atmospheric shockwave
    vfx.shockwaves.push({
      x: point.x,
      y: point.y,
      radius: 22,
      maxRadius: centerHit ? 500 : 380,
      life: 0,
      maxLife: centerHit ? 0.48 : 0.4,
      thickness: centerHit ? 4 : 3,
      color: 'rgba(80, 180, 255, '
    });

    // High-Velocity Molten Friction Sparks
    const numSparks = centerHit ? Math.floor(55 + Math.random() * 20) : Math.floor(35 + Math.random() * 15);
    for (let i = 0; i < numSparks; i++) {
      const sparkAngle = bounceAngle + (Math.random() - 0.5) * (centerHit ? 1.8 : 1.3);
      const sparkSpeed = 520 + Math.random() * 1350;
      const sparkColors = ['#ffffff', '#a8f5ff', '#ffd24d', '#ff7324', '#ff4500'];
      const color = sparkColors[Math.floor(Math.random() * sparkColors.length)];
      vfx.sparks.push({
        x: point.x,
        y: point.y,
        vx: Math.cos(sparkAngle) * sparkSpeed,
        vy: Math.sin(sparkAngle) * sparkSpeed,
        life: 0,
        maxLife: 0.25 + Math.random() * 0.35,
        size: 1.5 + Math.random() * 2.5,
        color,
        gravity: 600 + Math.random() * 400
      });
    }

    // Pulverized Stone Dust Clouds
    const numDust = centerHit ? 30 : 20;
    for (let i = 0; i < numDust; i++) {
      const dustAngle = Math.random() * Math.PI * 2;
      const dustSpeed = 45 + Math.random() * 250;
      vfx.dust.push({
        x: point.x + (Math.random() - 0.5) * 20,
        y: point.y + (Math.random() - 0.5) * 20,
        vx: Math.cos(dustAngle) * dustSpeed,
        vy: Math.sin(dustAngle) * dustSpeed - 30,
        radius: 12 + Math.random() * 18,
        maxRadius: 55 + Math.random() * 45,
        life: 0,
        maxLife: 0.75 + Math.random() * 0.6,
        alpha: 0.55 + Math.random() * 0.25
      });
    }
  }

  function emitHazardInFlightVFX(x, y, dx, dy) {
    const angle = Math.atan2(dy, dx);
    const rearX = x - Math.cos(angle) * 38;
    const rearY = y - Math.sin(angle) * 38;

    for (let i = 0; i < 2; i++) {
      vfx.hazardTrail.push({
        x: rearX + (Math.random() - 0.5) * 16,
        y: rearY + (Math.random() - 0.5) * 16,
        vx: -Math.cos(angle) * (80 + Math.random() * 120) + (Math.random() - 0.5) * 60,
        vy: -Math.sin(angle) * (80 + Math.random() * 120) + (Math.random() - 0.5) * 60,
        size: 2 + Math.random() * 3,
        life: 0,
        maxLife: 0.22 + Math.random() * 0.2,
        color: Math.random() < 0.6 ? '#ff6600' : '#ffcc00'
      });
    }

    vfx.dust.push({
      x: rearX + (Math.random() - 0.5) * 14,
      y: rearY + (Math.random() - 0.5) * 14,
      vx: -Math.cos(angle) * 40 + (Math.random() - 0.5) * 25,
      vy: -Math.sin(angle) * 40 - 20,
      radius: 8 + Math.random() * 10,
      maxRadius: 32 + Math.random() * 20,
      life: 0,
      maxLife: 0.45 + Math.random() * 0.3,
      alpha: 0.35 + Math.random() * 0.2
    });
  }

  function updateAndRenderVFX(dt) {
    if (!vfxCtx || !vfxCanvas) return;
    const bounds = game.getBoundingClientRect();
    const width = bounds.width;
    const height = bounds.height;
    const floorY = height * 0.88;

    vfxCtx.clearRect(0, 0, width, height);

    // 1. Dust & Smoke (volumetric normal blend)
    vfxCtx.globalCompositeOperation = 'source-over';
    for (let i = vfx.dust.length - 1; i >= 0; i--) {
      const d = vfx.dust[i];
      d.life += dt;
      if (d.life >= d.maxLife) {
        vfx.dust.splice(i, 1);
        continue;
      }
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.vx *= 0.94;
      d.vy *= 0.94;
      const progress = d.life / d.maxLife;
      const currentRadius = d.radius + (d.maxRadius - d.radius) * Math.sin(progress * Math.PI * 0.5);
      const currentAlpha = d.alpha * (1 - progress);

      const grad = vfxCtx.createRadialGradient(d.x, d.y, 0, d.x, d.y, currentRadius);
      grad.addColorStop(0, `rgba(165, 170, 175, ${currentAlpha})`);
      grad.addColorStop(0.5, `rgba(125, 130, 135, ${currentAlpha * 0.55})`);
      grad.addColorStop(1, 'rgba(80, 85, 90, 0)');

      vfxCtx.fillStyle = grad;
      vfxCtx.beginPath();
      vfxCtx.arc(d.x, d.y, currentRadius, 0, Math.PI * 2);
      vfxCtx.fill();
    }

    // 2. Debris Shards (Physics + Rotational Clip)
    const imgLoaded = debrisImg.complete && debrisImg.naturalWidth > 0;
    for (let i = vfx.shards.length - 1; i >= 0; i--) {
      const s = vfx.shards[i];
      s.life += dt;
      if (s.life >= s.maxLife) {
        vfx.shards.splice(i, 1);
        continue;
      }
      s.vy += s.gravity * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.rotation += s.rotSpeed * dt;

      if (s.y >= floorY && s.vy > 0 && s.bounceCount < 2) {
        s.y = floorY;
        s.vy = -s.vy * 0.35;
        s.vx *= 0.65;
        s.rotSpeed *= 0.6;
        s.bounceCount++;
      }

      const progress = s.life / s.maxLife;
      const alpha = progress > 0.75 ? (1 - progress) / 0.25 : 1;

      vfxCtx.save();
      vfxCtx.translate(s.x, s.y);
      vfxCtx.rotate(s.rotation);
      vfxCtx.globalAlpha = Math.max(0, Math.min(1, alpha));

      vfxCtx.beginPath();
      for (let j = 0; j < s.verts.length; j++) {
        const pt = s.verts[j];
        if (j === 0) vfxCtx.moveTo(pt.x, pt.y);
        else vfxCtx.lineTo(pt.x, pt.y);
      }
      vfxCtx.closePath();

      if (imgLoaded) {
        vfxCtx.save();
        vfxCtx.clip();
        vfxCtx.drawImage(debrisImg, s.srcX, s.srcY, s.srcW, s.srcH, -s.size * 0.7, -s.size * 0.7, s.size * 1.4, s.size * 1.4);
        vfxCtx.restore();
      } else {
        vfxCtx.fillStyle = s.colorTone;
        vfxCtx.fill();
      }

      vfxCtx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
      vfxCtx.lineWidth = 1.2;
      vfxCtx.stroke();
      vfxCtx.restore();
    }

    // 3. Additive Compositing for Sparks, Shockwaves & Heat Embers
    vfxCtx.globalCompositeOperation = 'lighter';

    // Vibranium Kinetic Shockwaves
    for (let i = vfx.shockwaves.length - 1; i >= 0; i--) {
      const sw = vfx.shockwaves[i];
      sw.life += dt;
      if (sw.life >= sw.maxLife) {
        vfx.shockwaves.splice(i, 1);
        continue;
      }
      const progress = sw.life / sw.maxLife;
      const eased = Math.sin(progress * Math.PI * 0.5);
      const r = sw.radius + (sw.maxRadius - sw.radius) * eased;
      const alpha = (1 - progress);
      const thick = Math.max(1, sw.thickness * (1 - progress * 0.7));

      vfxCtx.strokeStyle = `${sw.color}${alpha})`;
      vfxCtx.lineWidth = thick;
      vfxCtx.beginPath();
      vfxCtx.arc(sw.x, sw.y, r, 0, Math.PI * 2);
      vfxCtx.stroke();
    }

    // High-Velocity Molten Friction Sparks
    for (let i = vfx.sparks.length - 1; i >= 0; i--) {
      const sp = vfx.sparks[i];
      sp.life += dt;
      if (sp.life >= sp.maxLife) {
        vfx.sparks.splice(i, 1);
        continue;
      }
      sp.vy += sp.gravity * dt;
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;

      const progress = sp.life / sp.maxLife;
      const alpha = 1 - progress;

      vfxCtx.strokeStyle = sp.color;
      vfxCtx.globalAlpha = alpha;
      vfxCtx.lineWidth = sp.size;
      vfxCtx.beginPath();
      vfxCtx.moveTo(sp.x, sp.y);
      vfxCtx.lineTo(sp.x - sp.vx * dt * 2.2, sp.y - sp.vy * dt * 2.2);
      vfxCtx.stroke();
    }

    // In-Flight Heat Trail Embers
    for (let i = vfx.hazardTrail.length - 1; i >= 0; i--) {
      const tr = vfx.hazardTrail[i];
      tr.life += dt;
      if (tr.life >= tr.maxLife) {
        vfx.hazardTrail.splice(i, 1);
        continue;
      }
      tr.x += tr.vx * dt;
      tr.y += tr.vy * dt;
      const progress = tr.life / tr.maxLife;
      const alpha = 1 - progress;

      vfxCtx.fillStyle = tr.color;
      vfxCtx.globalAlpha = alpha;
      vfxCtx.beginPath();
      vfxCtx.arc(tr.x, tr.y, tr.size * (1 - progress * 0.5), 0, Math.PI * 2);
      vfxCtx.fill();
    }

    vfxCtx.globalAlpha = 1;
    vfxCtx.globalCompositeOperation = 'source-over';
  }

  const sections = [
    { name: 'FIRST CONTACT', hazards: ['right', 'left'] },
    { name: 'CROSSING UNDER FIRE', hazards: ['up', 'left', 'right'] },
    { name: 'FINAL ESCORT', hazards: ['right', 'up', 'left', 'right'] }
  ];
  const warningLabel = { right: 'INCOMING FROM THE RIGHT', left: 'INCOMING FROM THE LEFT', up: 'FALLING DEBRIS' };
  const arrowLabel = { right: '←', left: '→', up: '↓' };
  const state = {
    phase: 'title', section: 0, wave: 0, playerX: 38, playerY: 0, keys: new Set(), dragOffset: { x: 0, y: 0 },
    draggingShield: false, shieldMoved: false, hazard: null, timers: new Set(), runId: 0, lastFrame: 0,
    moveDirection: 0, impactLock: false, hitStopUntil: 0
  };

  // Reserved for the later signal-console bug. This placeholder is intentionally inert.
  const consoleBug = { visible: false, fixed: false }; // TODO: implement the separate signal bug.
  void consoleBug;

  const later = (callback, delay) => {
    const id = window.setTimeout(() => { state.timers.delete(id); callback(); }, delay);
    state.timers.add(id);
    return id;
  };
  function clearTimers() {
    state.timers.forEach(window.clearTimeout);
    state.timers.clear();
  }
  function setScreen(phase) {
    state.phase = phase;
    game.dataset.phase = phase;
    titleScreen.hidden = phase !== 'title';
    bugScreen.hidden = phase !== 'bug';
    fallenScreen.hidden = phase !== 'fallen';
    outcomeScreen.hidden = phase !== 'failure' && phase !== 'complete';
  }
  function updateSectionUI() {
    const current = sections[state.section];
    game.dataset.section = String(state.section + 1);
    sectionLabel.textContent = `SECTION ${state.section + 1} / 3 · ${current.name}`;
    const completed = state.section === 2 && state.phase === 'complete' ? 1 : state.section / 3;
    routeProgress.style.width = `${completed * 100}%`;
    civilianText.textContent = '3 SAFE';
  }
  function actorLayout() {
    captain.style.left = `${state.playerX}%`;
    captain.style.top = `${state.playerY}px`;
  }
  function getTargetPoint() {
    const rect = civilians.getBoundingClientRect();
    return { x: rect.left + rect.width * .53, y: rect.top + rect.height * .7 };
  }
  function getShieldCenter() {
    const rect = shield.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }
  function setShieldPoint(x, y) {
    const bounds = game.getBoundingClientRect();
    const actorRect = captain.getBoundingClientRect();
    const shieldRect = shield.getBoundingClientRect();
    const relX = (shieldRect.left + shieldRect.width / 2 - actorRect.left) / actorRect.width;
    const relY = (shieldRect.top + shieldRect.height / 2 - actorRect.top) / actorRect.height;
    const actorWidth = actorRect.width;
    const actorHeight = actorRect.height;
    const left = x - bounds.left - actorWidth * relX;
    const top = y - bounds.top - actorHeight * relY;
    state.playerX = Math.max(3, Math.min(100 - actorWidth / bounds.width * 100 - 2, left / bounds.width * 100));
    state.playerY = Math.max(105, Math.min(bounds.height * .94 - actorHeight, top));
    actorLayout();
  }
  function setShieldHome(section = 0) {
    state.playerX = innerWidth <= 760 ? (section === 2 ? 0 : 42) : (section === 2 ? 1 : 38);
    state.playerY = innerHeight * .37;
    state.shieldMoved = false;
    actorLayout();
  }
  function maxPlayerX() {
    return 100 - captain.offsetWidth / game.clientWidth * 100 - 2;
  }
  function showTrajectory(start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy);
    trajectory.style.left = `${start.x}px`;
    trajectory.style.top = `${start.y}px`;
    trajectory.style.width = `${length}px`;
    trajectory.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
    trajectory.hidden = false;
  }
  function resetHazard() {
    state.hazard = null;
    hazardEl.hidden = true;
    hazardEl.classList.remove('in-flight', 'deflect-center', 'deflect-edge');
    warning.hidden = true;
    trajectory.hidden = true;
    state.keys.clear();
    state.draggingShield = false;
    shield.classList.remove('dragging');
    captain.classList.remove('walking', 'bracing', 'setback', 'escorting');
    vfx.hazardTrail.length = 0;
  }
  function beginSection(index) {
    clearTimers();
    clearVFX();
    resetHazard();
    state.hitStopUntil = 0;
    state.runId += 1;
    state.section = index;
    state.wave = 0;
    setShieldHome(index);
    const escortStep = innerWidth <= 760 ? [8, 12, 42][index] : 13 + index * 7;
    civilians.style.left = `${escortStep}%`;
    civilians.classList.remove('falling', 'fallen', 'recovering', 'evacuating');
    groupLabel.textContent = 'STAY CLOSE';
    state.impactLock = false;
    actorLayout();
    if (index > 0) {
      captain.classList.add('escorting', 'walking');
      later(() => captain.classList.remove('escorting', 'walking'), 900);
    }
    setScreen('play');
    updateSectionUI();
    missionCue.textContent = 'Move into the lane. Drag the shield onto the glowing path.';
    later(() => queueHazard(state.runId), 650);
  }
  function startRoute() {
    beginSection(0);
    state.lastFrame = performance.now();
  }
  function pathFor(direction) {
    const bounds = game.getBoundingClientRect();
    const target = getTargetPoint();
    if (direction === 'right') return { start: { x: bounds.width + 70, y: target.y - 72 }, end: { x: target.x, y: target.y } };
    if (direction === 'left') return { start: { x: -70, y: target.y - 52 }, end: { x: target.x, y: target.y } };
    return { start: { x: target.x + 90, y: -70 }, end: { x: target.x, y: target.y } };
  }
  function queueHazard(runId) {
    if (state.phase !== 'play' || runId !== state.runId) return;
    const direction = sections[state.section].hazards[state.wave];
    if (!direction) { sectionCleared(runId); return; }
    const path = pathFor(direction);
    warningText.textContent = warningLabel[direction];
    warningArrow.textContent = arrowLabel[direction];
    warningArrow.dataset.dir = direction;
    warning.hidden = false;
    showTrajectory(path.start, path.end);
    missionCue.textContent = 'The dotted lane leads to the civilians. Put the shield across it.';
    // Telegraph only; no timer is displayed to the player.
    later(() => spawnHazard(direction, path, runId), 2100);
  }
  function spawnHazard(direction, path, runId) {
    if (state.phase !== 'play' || runId !== state.runId) return;
    warning.hidden = true;
    trajectory.classList.add('active');
    state.hazard = { direction, ...path, startedAt: performance.now(), duration: 2600, runId, deflect: null };
    hazardEl.hidden = false;
    hazardEl.dataset.direction = direction;
    hazardEl.classList.remove('deflect-center', 'deflect-edge');
    hazardEl.classList.add('in-flight');
    placeHazard(0);
  }
  function placeHazard(progress) {
    const h = state.hazard;
    if (!h) return;
    const t = Math.max(0, Math.min(1, progress));
    const eased = t * t * (3 - 2 * t);
    const x = h.start.x + (h.end.x - h.start.x) * eased;
    const y = h.start.y + (h.end.y - h.start.y) * eased;
    hazardEl.style.left = `${x}px`;
    hazardEl.style.top = `${y}px`;
    h.current = { x, y };

    if (!h.deflect) {
      emitHazardInFlightVFX(x, y, h.end.x - h.start.x, h.end.y - h.start.y);
    }
  }
  function showImpact(kind, point) {
    impactText.textContent = kind === 'center' ? 'CLEAN RICOCHET' : 'GLANCING DEFLECT';
    impact.style.left = `${point.x}px`;
    impact.style.top = `${point.y - 45}px`;
    impact.classList.remove('show');
    void impact.offsetWidth;
    impact.classList.add('show');
  }
  function deflectHazard(centerHit) {
    const h = state.hazard;
    if (!h || h.deflect || state.impactLock) return;
    state.impactLock = true;
    const point = h.current;
    const shieldCenter = getShieldCenter();
    const bounds = game.getBoundingClientRect();
    const radius = shield.getBoundingClientRect().width * .5;
    const dx = point.x - shieldCenter.x;
    const dy = point.y - shieldCenter.y;
    const d = Math.hypot(dx, dy) || 1;
    const normal = { x: dx / d, y: dy / d };
    const incoming = { x: h.end.x - h.start.x, y: h.end.y - h.start.y };
    const incomingLength = Math.hypot(incoming.x, incoming.y) || 1;
    const unit = { x: incoming.x / incomingLength, y: incoming.y / incomingLength };
    const kind = centerHit ? 'center' : 'edge';
    captain.classList.remove('bracing', 'block-hit');
    captain.classList.add(centerHit ? 'center-hit' : 'edge-hit');
    shield.classList.add('impact-recoil');
    showImpact(kind, point);

    const perpendicular = { x: -unit.y, y: unit.x };
    const bounce = centerHit
      ? { x: -unit.x, y: -unit.y }
      : { x: unit.x * .35 + perpendicular.x * Math.sign(dx || 1), y: unit.y * .35 + perpendicular.y * Math.sign(dx || 1) };
    const bounceLength = Math.hypot(bounce.x, bounce.y) || 1;
    const bounceUnit = { x: bounce.x / bounceLength, y: bounce.y / bounceLength };

    // CINEMATIC SPECTACLE: SHATTER THE DEBRIS
    hazardEl.hidden = true;
    triggerDebrisShatter(point, normal, centerHit, bounceUnit);

    // Hit-stop micro freeze
    state.hitStopUntil = performance.now() + (centerHit ? 75 : 60);

    // Screen flash
    if (screenFlash) {
      screenFlash.style.setProperty('--fx', `${Math.round((point.x / bounds.width) * 100)}%`);
      screenFlash.style.setProperty('--fy', `${Math.round((point.y / bounds.height) * 100)}%`);
      screenFlash.classList.add('active');
      window.setTimeout(() => screenFlash.classList.remove('active'), 80);
    }

    // Directional camera kick
    game.style.setProperty('--shake-x', `${Math.round(-normal.x * (centerHit ? 24 : 16))}px`);
    game.style.setProperty('--shake-y', `${Math.round(-normal.y * (centerHit ? 24 : 16))}px`);
    game.classList.remove('scene-shake');
    void game.offsetWidth;
    game.classList.add('scene-shake');
    window.setTimeout(() => game.classList.remove('scene-shake'), 420);

    h.start = point;
    h.end = {
      x: point.x + bounceUnit.x * Math.max(bounds.width * .43, 280),
      y: point.y + bounceUnit.y * Math.max(bounds.height * .4, 250)
    };
    h.startedAt = performance.now();
    h.duration = centerHit ? 520 : 650;
    h.deflect = kind;
    state.wave += 1;
    missionCue.textContent = centerHit ? 'Centered hit! The threat is pulverized and deflected.' : 'Edge hit! The threat shatters off the civilian lane.';
    later(() => {
      if (h.runId !== state.runId || state.phase !== 'play') return;
      resetHazard();
      captain.classList.remove('center-hit', 'edge-hit');
      shield.classList.remove('impact-recoil');
      state.impactLock = false;
      later(() => queueHazard(h.runId), 520);
    }, h.duration);
  }
  function checkShieldCollision() {
    const h = state.hazard;
    if (!h || h.deflect || !state.shieldMoved) return;
    const shieldCenter = getShieldCenter();
    const point = h.current;
    const distance = Math.hypot(point.x - shieldCenter.x, point.y - shieldCenter.y);
    const radius = shield.getBoundingClientRect().width * .43;
    if (distance <= radius) deflectHazard(distance <= radius * .48);
  }
  function resolveMiss() {
    if (!state.hazard || state.hazard.deflect) return;
    hazardEl.hidden = true;
    state.hazard = null;
    showFailure();
  }
  function sectionCleared(runId) {
    if (state.phase !== 'play' || runId !== state.runId) return;
    trajectory.hidden = true;
    if (state.section === 2) {
      missionCue.textContent = 'The final lane is clear. Escorting everyone to the safe exit.';
      routeProgress.style.width = '100%';
      civilians.classList.add('evacuating');
      civilians.style.left = `${innerWidth <= 760 ? 56 : 76}%`;
      groupLabel.textContent = 'SAFE EXIT';
      state.playerX = innerWidth <= 760 ? 4 : 48;
      actorLayout();
      captain.classList.add('walking', 'escorting');
      later(() => {
        if (state.phase !== 'play' || runId !== state.runId) return;
        captain.classList.remove('walking', 'escorting');
        setScreen('complete');
        outcomeEyebrow.textContent = 'EVACUATION ROUTE CLEAR';
        outcomeTitle.textContent = 'SAFE PASSAGE.';
        outcomeText.textContent = 'The civilians reached the far end of the route. Captain America held the line.';
        outcomeButton.innerHTML = 'PLAY AGAIN <b>↻</b>';
      }, 1600);
      return;
    }
    if (state.section === 1) {
      missionCue.textContent = 'The route jolts. One evacuee stumbles as the signal drops.';
      groupLabel.textContent = 'HOLD ON';
      civilianText.textContent = '1 DOWN · 2 UP';
      civilians.classList.add('falling');
      later(() => {
        if (state.phase !== 'play' || runId !== state.runId) return;
        civilians.classList.remove('falling');
        civilians.classList.add('fallen');
        groupLabel.textContent = 'HELP THEM UP';
        setScreen('fallen');
        routeProgress.style.width = '66%';
      }, 720);
      return;
    }
    missionCue.textContent = 'Section secured. The group is advancing.';
    later(() => {
      if (state.phase !== 'play' || runId !== state.runId) return;
      beginSection(state.section + 1);
    }, 850);
  }
  function showFailure() {
    clearTimers();
    clearVFX();
    resetHazard();
    state.hitStopUntil = 0;
    captain.classList.add('setback');
    setScreen('failure');
    outcomeEyebrow.textContent = `CHECKPOINT ${state.section + 1}`;
    outcomeTitle.textContent = 'THE GROUP NEEDS COVER';
    outcomeText.textContent = 'A threat reached the civilians. Reset this section and try the interception again.';
    outcomeButton.innerHTML = 'RETRY SECTION <b>↻</b>';
  }
  function fixBug() {}
  function clearInterruption() {
    fixBug();
    clearTimers();
    setScreen('play');
    civilians.classList.remove('falling', 'fallen');
    civilians.classList.add('recovering');
    groupLabel.textContent = 'GETTING UP';
    civilianText.textContent = '3 SAFE';
    missionCue.textContent = 'The evacuee is back on their feet. Keep moving.';
    later(() => {
      civilians.classList.remove('recovering');
      beginSection(2);
    }, 900);
  }
  function continueAfterFall() {
    setScreen('bug');
  }
  function moveByPointer(event) {
    if (!state.draggingShield || state.phase !== 'play') return;
    setShieldPoint(event.clientX - state.dragOffset.x, event.clientY - state.dragOffset.y);
    state.shieldMoved = true;
  }
  function loop(now) {
    const dt = Math.min(.045, (now - state.lastFrame) / 1000 || 0);

    if (state.hitStopUntil && now < state.hitStopUntil) {
      updateAndRenderVFX(0.005);
      state.lastFrame = now;
      requestAnimationFrame(loop);
      return;
    }

    if (state.phase === 'play') {
      if (state.keys.has('left')) state.moveDirection = -1;
      else if (state.keys.has('right')) state.moveDirection = 1;
      else state.moveDirection = 0;
      if (state.moveDirection) {
        state.playerX = Math.max(3, Math.min(maxPlayerX(), state.playerX + state.moveDirection * 25 * dt));
        state.shieldMoved = true;
        captain.classList.add('walking');
        actorLayout();
      } else captain.classList.remove('walking');
      if (state.hazard) {
        const progress = Math.min(1, (now - state.hazard.startedAt) / state.hazard.duration);
        placeHazard(progress);
        if (!state.hazard.deflect) checkShieldCollision();
        else if (progress >= 1) {
          hazardEl.hidden = true;
          state.hazard.startedAt = now + 100000;
        }
        if (state.hazard && progress >= 1 && !state.hazard.deflect) resolveMiss();
      }
    }
    updateAndRenderVFX(dt);
    state.lastFrame = now;
    requestAnimationFrame(loop);
  }
  function setMove(direction, on) {
    if (on) state.keys.add(direction); else state.keys.delete(direction);
  }

  document.querySelector('#startButton').addEventListener('click', startRoute);
  document.querySelector('#fallenContinueButton').addEventListener('click', continueAfterFall);
  document.querySelector('#fixNowButton').addEventListener('click', clearInterruption);
  outcomeButton.addEventListener('click', () => {
    if (state.phase === 'complete') {
      clearTimers();
      state.section = 0;
      setShieldHome();
      civilians.style.left = `${innerWidth <= 760 ? 8 : 13}%`;
      civilians.classList.remove('evacuating', 'falling', 'fallen', 'recovering');
      groupLabel.textContent = 'STAY CLOSE';
      civilianText.textContent = '3 SAFE';
      setScreen('title');
      actorLayout();
      updateSectionUI();
    } else beginSection(state.section);
  });
  document.addEventListener('keydown', event => {
    if (['ArrowLeft', 'ArrowRight', ' '].includes(event.key)) event.preventDefault();
    if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') setMove('left', true);
    if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') setMove('right', true);
  });
  document.addEventListener('keyup', event => {
    if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') setMove('left', false);
    if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') setMove('right', false);
  });
  window.addEventListener('blur', () => state.keys.clear());
  game.addEventListener('pointerdown', event => {
    if (state.phase !== 'play') return;
    if (!(event.target === shield || shield.contains(event.target))) return;
    event.preventDefault();
    state.draggingShield = true;
    shield.classList.add('dragging');
    captain.classList.add('bracing');
    missionCue.textContent = 'Captain follows the shield. Drag to guide the interception.';
    const center = getShieldCenter();
    state.dragOffset = { x: event.clientX - center.x, y: event.clientY - center.y };
    try { game.setPointerCapture(event.pointerId); } catch (_) {}
    moveByPointer(event);
  });
  game.addEventListener('pointermove', moveByPointer);
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => game.addEventListener(type, () => {
    state.draggingShield = false;
    shield.classList.remove('dragging');
    captain.classList.remove('bracing');
  }));
  document.querySelectorAll('[data-move]').forEach(button => {
    const move = button.dataset.move;
    button.addEventListener('pointerdown', event => {
      event.preventDefault();
      setMove(move, true);
      try { button.setPointerCapture(event.pointerId); } catch (_) {}
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => button.addEventListener(type, () => setMove(move, false)));
  });
  window.addEventListener('resize', () => {
    state.playerY = Math.min(state.playerY || innerHeight * .37, innerHeight * .94 - captain.offsetHeight);
    state.playerX = Math.min(state.playerX, maxPlayerX());
    actorLayout();
  });
  if (captainSprite) {
    captainSprite.addEventListener('load', setShieldHome, { once: true });
    if (captainSprite.complete) setShieldHome();
  } else {
    setShieldHome();
  }
  updateSectionUI();
  state.lastFrame = performance.now();
  requestAnimationFrame(loop);
})();
