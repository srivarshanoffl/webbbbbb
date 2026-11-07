/**
 * WANDA – THE PORTAL AWAKENING
 * 2.5D Particle Engine & Energy Tendril Renderer
 */

class ParticleEngine {
  constructor() {
    this.canvas = document.getElementById('particles-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.lightningCanvas = document.getElementById('lightning-canvas');
    this.lCtx = this.lightningCanvas ? this.lightningCanvas.getContext('2d') : null;

    this.particles = [];
    this.bursts = [];
    this.shockwaves = [];
    this.portalParticles = [];
    this.energyArcs = [];
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.portalActive = false;
    this.portalCenter = { x: this.width / 2, y: this.height / 2 - 20 };

    this.init();
  }

  init() {
    if (!this.canvas || !this.ctx) return;
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Generate ambient embers
    for (let i = 0; i < 90; i++) {
      this.particles.push(this.createAmbientParticle());
    }

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    if (this.canvas) {
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }
    if (this.lightningCanvas) {
      this.lightningCanvas.width = this.width;
      this.lightningCanvas.height = this.height;
    }
    this.portalCenter = { x: this.width / 2, y: this.height / 2 - 20 };
  }

  createAmbientParticle() {
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      z: (Math.random() - 0.5) * 400,
      vx: (Math.random() - 0.5) * 0.7,
      vy: -0.4 - Math.random() * 0.9,
      size: 1.5 + Math.random() * 3,
      alpha: 0.2 + Math.random() * 0.7,
      color: Math.random() > 0.3 ? '#ff103f' : '#ff7597',
      pulse: Math.random() * Math.PI * 2
    };
  }

  createPortalParticle() {
    const angle = Math.random() * Math.PI * 2;
    const tier = Math.random();
    const dist = tier > 0.4 ? (180 + Math.random() * 190) : (80 + Math.random() * 120);
    const colors = ['#ffffff', '#ff99b8', '#ff103f', '#e50938', '#ffd700', '#ff3366'];
    const chosenColor = colors[Math.floor(Math.random() * colors.length)];
    
    return {
      angle: angle,
      radius: dist,
      speed: (0.018 + Math.random() * 0.035) * (tier > 0.4 ? 1 : 1.4),
      decay: 0.988 + Math.random() * 0.008,
      size: 1.8 + Math.random() * 3.8,
      alpha: 0.85,
      color: chosenColor
    };
  }

  triggerBurst(x, y, count = 35, color = '#ff103f') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 7;
      this.bursts.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 4.5,
        alpha: 1.0,
        decay: 0.02 + Math.random() * 0.03,
        color: color
      });
    }
  }

  triggerShockwave(x, y, maxRadius = 160, color = 'rgba(255, 30, 80, 0.85)') {
    this.shockwaves.push({
      x: x,
      y: y,
      radius: 6,
      maxRadius: maxRadius,
      speed: 5.2,
      alpha: 1.0,
      color: color
    });
  }

  drawChaosArc(ctx, x1, y1, x2, y2, color = '#ff103f', maxOffset = 22) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy);
    if (dist < 4) return;
    const steps = Math.max(6, Math.floor(dist / 14));

    ctx.save();
    const points = [{ x: x1, y: y1 }];

    for (let i = 1; i < steps; i++) {
      const progress = i / steps;
      const normalX = -dy / dist;
      const normalY = dx / dist;
      const envelope = Math.sin(progress * Math.PI);
      const jitter = (Math.random() - 0.5) * maxOffset * envelope;
      const px = x1 + dx * progress + normalX * jitter;
      const py = y1 + dy * progress + normalY * jitter;
      points.push({ x: px, y: py });
    }
    points.push({ x: x2, y: y2 });

    // 1. Broad Volumetric Outer Glow
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 4.8;
    ctx.shadowColor = color;
    ctx.shadowBlur = 24;
    ctx.stroke();

    // 2. High-energy Plasma Mid-Core
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = '#ff7597';
    ctx.lineWidth = 2.4;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 12;
    ctx.stroke();

    // 3. Hot White Center Filament
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.1;
    ctx.stroke();

    // 4. Procedural Secondary Branching Discharges
    const branchCount = Math.floor(Math.random() * 3) + 1;
    for (let b = 0; b < branchCount; b++) {
      if (points.length > 5) {
        const branchIdx = Math.floor(Math.random() * (points.length - 2)) + 1;
        const bp = points[branchIdx];
        const bAngle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 1.5;
        const bLen = 20 + Math.random() * 35;
        const midX = bp.x + Math.cos(bAngle) * (bLen * 0.5) + (Math.random() - 0.5) * 10;
        const midY = bp.y + Math.sin(bAngle) * (bLen * 0.5) + (Math.random() - 0.5) * 10;
        const endX = bp.x + Math.cos(bAngle) * bLen;
        const endY = bp.y + Math.sin(bAngle) * bLen;

        ctx.beginPath();
        ctx.moveTo(bp.x, bp.y);
        ctx.lineTo(midX, midY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = 'rgba(255, 160, 200, 0.85)';
        ctx.lineWidth = 1.2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  setPortalMode(active) {
    this.portalActive = active;
  }

  setEnergyArcs(arcs) {
    this.energyArcs = arcs || [];
  }

  animate() {
    if (!this.ctx) return;

    this.ctx.clearRect(0, 0, this.width, this.height);
    if (this.lCtx) {
      this.lCtx.clearRect(0, 0, this.width, this.height);
    }

    // 1. Ambient Chaos Embers
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += 0.04;

      if (p.y < -20 || p.x < -20 || p.x > this.width + 20) {
        p.x = Math.random() * this.width;
        p.y = this.height + 15;
      }

      const depthScale = (p.z + 500) / 700;
      const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0.1, Math.min(1, currentAlpha));
      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 8 * depthScale;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, Math.max(1, p.size * depthScale), 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // 2. Bursts
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const b = this.bursts[i];
      b.x += b.vx;
      b.y += b.vy;
      b.alpha -= b.decay;

      if (b.alpha <= 0) {
        this.bursts.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = b.alpha;
      this.ctx.fillStyle = b.color;
      this.ctx.shadowColor = b.color;
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // 3. Shockwave Rings
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += sw.speed;
      sw.alpha = 1 - (sw.radius / sw.maxRadius);

      if (sw.alpha <= 0) {
        this.shockwaves.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = sw.alpha;
      this.ctx.strokeStyle = sw.color;
      this.ctx.lineWidth = 3;
      this.ctx.shadowColor = sw.color;
      this.ctx.shadowBlur = 15;
      this.ctx.beginPath();
      this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    }

    // 4. Portal Inflow Vortex Particles (Cosmic Velocity Streaks)
    if (this.portalActive) {
      if (this.portalParticles.length < 420) {
        this.portalParticles.push(this.createPortalParticle());
        this.portalParticles.push(this.createPortalParticle());
      }

      for (let i = this.portalParticles.length - 1; i >= 0; i--) {
        const pp = this.portalParticles[i];
        const oldX = this.portalCenter.x + Math.cos(pp.angle) * pp.radius;
        const oldY = this.portalCenter.y + Math.sin(pp.angle) * pp.radius * 0.9;

        pp.angle += pp.speed;
        pp.radius *= pp.decay;
        pp.alpha = (pp.radius / 240);

        if (pp.radius < 14 || pp.alpha <= 0.04) {
          this.portalParticles.splice(i, 1);
          continue;
        }

        const px = this.portalCenter.x + Math.cos(pp.angle) * pp.radius;
        const py = this.portalCenter.y + Math.sin(pp.angle) * pp.radius * 0.9;

        this.ctx.save();
        this.ctx.globalAlpha = Math.min(1, pp.alpha * 1.2);
        this.ctx.strokeStyle = pp.color;
        this.ctx.fillStyle = pp.color;
        this.ctx.shadowColor = pp.color;
        this.ctx.shadowBlur = 14;

        // Render velocity streak with curved tangential stretch
        this.ctx.lineWidth = Math.max(1.2, pp.size * 0.85);
        this.ctx.beginPath();
        this.ctx.moveTo(oldX, oldY);
        this.ctx.lineTo(px, py);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(px, py, pp.size * 0.8, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    }

    // 5. Energy Lightning Arcs (Phase 5 construction)
    if (this.lCtx && this.energyArcs.length > 0) {
      for (const arc of this.energyArcs) {
        this.drawChaosArc(this.lCtx, arc.x1, arc.y1, arc.x2, arc.y2, arc.color || '#ff103f', arc.offset || 20);
      }
    }

    requestAnimationFrame(this.animate);
  }
}

window.ParticleSystem = new ParticleEngine();
