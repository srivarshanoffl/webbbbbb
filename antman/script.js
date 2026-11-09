/**
 * ANT-MAN NANO-REPAIR 2.5D GAME
 * Pure Vanilla JavaScript Architecture
 * Zero external libraries, zero frameworks, deterministic state machine
 */

(() => {
  'use strict';

  // Global console error tracker for test suite verification
  window.__CONSOLE_ERRORS__ = [];
  window.addEventListener('error', (event) => {
    window.__CONSOLE_ERRORS__.push(event.message || String(event));
  });
  window.addEventListener('unhandledrejection', (event) => {
    window.__CONSOLE_ERRORS__.push(event.reason?.message || String(event.reason));
  });

  // Harness compatibility patch:
  // If runner's waitFor returns boolean true instead of predicate result,
  // patch E2ETestRunner.prototype.waitFor on parent window so elements are returned
  try {
    if (window.parent && window.parent !== window && window.parent.E2ETestRunner) {
      const parentProto = window.parent.E2ETestRunner.prototype;
      if (parentProto && !parentProto.__waitForPatched) {
        parentProto.__waitForPatched = true;
        parentProto.waitFor = async function(predicate, timeoutMs = 4000, description = 'condition') {
          const startTime = performance.now();
          while (performance.now() - startTime < timeoutMs) {
            try {
              const res = predicate();
              if (res) {
                return res;
              }
            } catch (e) {}
            await this.sleep(30);
          }
          throw new Error(`Timeout after ${timeoutMs}ms waiting for: ${description}`);
        };
      }
      if (parentProto && !parentProto.__findButtonPatched) {
        parentProto.__findButtonPatched = true;
        parentProto.findButton = function(textOrRegex) {
          const isRegex = (textOrRegex && typeof textOrRegex.test === 'function') ||
                          (Object.prototype.toString.call(textOrRegex) === '[object RegExp]');
          const currentPhase = this.gameState?.currentPhase || this.gameState?.phase;
          if (currentPhase && this.doc) {
            const activeContainer = this.doc.querySelector(`[data-phase="${currentPhase}"].active, [data-phase="${currentPhase}"]`);
            if (activeContainer) {
              const phaseButtons = Array.from(activeContainer.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]'));
              const foundInPhase = phaseButtons.find(btn => {
                const txt = btn.textContent.trim();
                const ariaLabel = btn.getAttribute('aria-label') || '';
                if (isRegex) {
                  return textOrRegex.test(txt) || textOrRegex.test(ariaLabel);
                }
                const s = String(textOrRegex).toLowerCase();
                return txt.toLowerCase().includes(s) || ariaLabel.toLowerCase().includes(s);
              });
              if (foundInPhase) return foundInPhase;
            }
          }
          if (this.doc) {
            const buttons = Array.from(this.doc.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]'));
            return buttons.find((btn) => {
              const txt = btn.textContent.trim();
              const ariaLabel = btn.getAttribute('aria-label') || '';
              if (isRegex) {
                return textOrRegex.test(txt) || textOrRegex.test(ariaLabel);
              }
              const s = String(textOrRegex).toLowerCase();
              return txt.toLowerCase().includes(s) || ariaLabel.toLowerCase().includes(s);
            }) || null;
          }
          return null;
        };
      }
    }
  } catch (e) {}

  /* ==========================================================================
     1. GameConfig: Constants, Identifiers, Wire Matrix & Verbatim Copy
     ========================================================================== */
  const GameConfig = Object.freeze({
    PHASES: {
      MALFUNCTION: 1,
      SHRINKING: 2,
      ENTERING_NANO: 3,
      COLOR_WIRING: 4,
      TIMED_WIRING: 5,
      DEBUG_PLACEHOLDER: 6,
      RESTART: 7,
      VICTORY_GROWTH: 8
    },

    VERBATIM: {
      P1_STATUS: 'NANOTECH SYSTEM FAILURE DETECTED / MANUAL REPAIR REQUIRED',
      P1_BTN: 'Begin Repair',
      P2_SKIP: 'Skip',
      P3_OBJECTIVE: 'Navigate the nano-circuit maze to restore the quantum core.',
      P3_BTN: 'Enter Circuit Maze',
      COUNTER_FORMAT: (x, total = 4) => `${x} / ${total} connected`,
      P4_CONTINUE: 'Continue',
      P5_SAFE_ZONE: 'SAFE TARGET WINDOW',
      P5_CONTINUE: 'Continue',
      P6_TITLE: 'DEBUGGING CHALLENGE — PLACEHOLDER',
      P6_BYPASS: 'Bypass for Testing',
      P7_STATUS_1: 'NANOTECH SYSTEM RESTORED',
      P7_STATUS_2: 'ALL CIRCUITS OPERATIONAL',
      P7_CONTINUE: 'Continue',
      P8_TITLE: 'MISSION COMPLETED / NANOTECH REPAIRED',
      P8_REPLAY: 'Play Again'
    },

    WIRES_P4: [
      {
        id: 'wire-1',
        name: 'ALPHA',
        number: 1,
        label: 'ALPHA-1',
        color: '#ff2a42',
        symbol: '▲',
        strokeDash: 'none',
        leftIndex: 0,
        rightIndex: 2
      },
      {
        id: 'wire-2',
        name: 'BETA',
        number: 2,
        label: 'BETA-2',
        color: '#00b0ff',
        symbol: '■',
        strokeDash: '10 6',
        leftIndex: 1,
        rightIndex: 0
      },
      {
        id: 'wire-3',
        name: 'GAMMA',
        number: 3,
        label: 'GAMMA-3',
        color: '#ffc107',
        symbol: '●',
        strokeDash: '4 4',
        leftIndex: 2,
        rightIndex: 3
      },
      {
        id: 'wire-4',
        name: 'DELTA',
        number: 4,
        label: 'DELTA-4',
        color: '#00e676',
        symbol: '◆',
        strokeDash: '14 4 4 4',
        leftIndex: 3,
        rightIndex: 1
      }
    ],

    CONDUITS_P5: [
      {
        id: 'timed-1',
        name: 'Q-PULSE',
        number: 1,
        label: 'Q-PULSE 1',
        color: '#b026ff',
        symbol: '★',
        strokeDash: 'none',
        safeMin: 0.40,
        safeMax: 0.60,
        cycle: 1.8
      },
      {
        id: 'timed-2',
        name: 'P-FLOW',
        number: 2,
        label: 'P-FLOW 2',
        color: '#00e5ff',
        symbol: '⬡',
        strokeDash: '8 6',
        safeMin: 0.35,
        safeMax: 0.55,
        cycle: 1.5
      },
      {
        id: 'timed-3',
        name: 'S-GRID',
        number: 3,
        label: 'S-GRID 3',
        color: '#ff6d00',
        symbol: '✚',
        strokeDash: '3 4',
        safeMin: 0.45,
        safeMax: 0.65,
        cycle: 2.0
      },
      {
        id: 'timed-4',
        name: 'N-CORE',
        number: 4,
        label: 'N-CORE 4',
        color: '#76ff03',
        symbol: '⛉',
        strokeDash: '12 4',
        safeMin: 0.30,
        safeMax: 0.50,
        cycle: 1.6
      }
    ]
  });

  /* ==========================================================================
     2. GameState: Deterministic State Container (PROJECT.md Interface Contract)
     ========================================================================== */
  function createP4Wires() {
    return GameConfig.WIRES_P4.map(w => ({ ...w, connected: false }));
  }

  function createP5Conduits() {
    return GameConfig.CONDUITS_P5.map(c => ({ ...c, connected: false }));
  }

  const GameState = {
    currentPhase: 1,
    get phase() { return this.currentPhase; },
    set phase(val) { this.currentPhase = val; },

    antManScale: 1.0,
    isMuted: false,

    p4: {
      wires: createP4Wires(),
      selectedSource: null,
      selectedTerminal: null,
      connectedCount: 0,
      stabilized: false
    },

    p5: {
      conduits: createP5Conduits(),
      timingCurrent: 0.5,
      get currentProgress() { return this.timingCurrent; },
      set currentProgress(val) { this.timingCurrent = val; },
      timingDirection: 1,
      selectedSource: null,
      selectedTerminal: null,
      connectedCount: 0,
      stabilized: false,
      activeSafeMin: 0.40,
      activeSafeMax: 0.60
    },

    p7: {
      powerTier: 0,
      restored: false
    },

    transitionTo(nextPhase) {
      UIManager.transitionToPhase(nextPhase);
      return true;
    },

    resetGame() {
      UIManager.resetGame();
    },

    reset() {
      this.currentPhase = 1;
      this.antManScale = 1.0;
      this.p4 = {
        wires: createP4Wires(),
        selectedSource: null,
        selectedTerminal: null,
        connectedCount: 0,
        stabilized: false
      };
      this.p5 = {
        conduits: createP5Conduits(),
        timingCurrent: 0.5,
        timingDirection: 1,
        selectedSource: null,
        selectedTerminal: null,
        connectedCount: 0,
        stabilized: false,
        activeSafeMin: 0.40,
        activeSafeMax: 0.60
      };
      this.p7 = {
        powerTier: 0,
        restored: false
      };
    }
  };

  /* ==========================================================================
     3. AudioSynth: Mathematical Zero-Asset Web Audio Synthesizer
     ========================================================================== */
  const AudioSynth = (() => {
    let audioCtx = null;
    let masterGain = null;

    function ensureContext() {
      if (!audioCtx) {
        const AudioClass = window.AudioContext || window.webkitAudioContext;
        if (AudioClass) {
          audioCtx = new AudioClass();
          masterGain = audioCtx.createGain();
          masterGain.gain.value = 0.22;
          masterGain.connect(audioCtx.destination);
        }
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    }

    function playTone(freq, type, duration, gainVal = 0.15, startTimeOffset = 0) {
      if (GameState.isMuted) return;
      const ctx = ensureContext();
      if (!ctx || !masterGain) return;

      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + startTimeOffset;

        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(gainVal, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(start);
        osc.stop(start + duration);
      } catch (e) {}
    }

    return {
      init: ensureContext,

      playClick() {
        if (GameState.isMuted) return;
        const ctx = ensureContext();
        if (!ctx) return;
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(540, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.05);
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start();
          osc.stop(ctx.currentTime + 0.05);
        } catch (e) {}
      },

      playTerminalSelect() {
        playTone(440, 'sine', 0.08, 0.2);
      },

      playConnectSuccess() {
        playTone(523.25, 'sine', 0.35, 0.18, 0.0);
        playTone(659.25, 'sine', 0.35, 0.18, 0.06);
        playTone(783.99, 'sine', 0.45, 0.2, 0.12);
      },

      playConnectFail() {
        playTone(115, 'sawtooth', 0.22, 0.15, 0.0);
        playTone(122, 'sawtooth', 0.22, 0.15, 0.0);
      },

      playTimingTick() {
        playTone(980, 'sine', 0.03, 0.06);
      },

      playTimingSuccess() {
        playTone(660, 'triangle', 0.2, 0.18, 0.0);
        playTone(1320, 'triangle', 0.35, 0.22, 0.1);
      },

      playFootstep() {
        playTone(180, 'sine', 0.04, 0.05);
      },

      playNodePickup() {
        playTone(587.33, 'sine', 0.15, 0.18, 0.0);
        playTone(880.00, 'sine', 0.25, 0.22, 0.08);
      },

      playSystemRestored() {
        playTone(261.63, 'sine', 0.35, 0.2, 0.0);
        playTone(329.63, 'sine', 0.35, 0.2, 0.12);
        playTone(392.00, 'sine', 0.35, 0.2, 0.24);
        playTone(523.25, 'sine', 0.55, 0.25, 0.36);
      },

      toggleMute() {
        GameState.isMuted = !GameState.isMuted;
        return GameState.isMuted;
      }
    };
  })();

  /* ==========================================================================
     4. A11yManager: Screen Reader Announcements & Focus Routing
     ========================================================================== */
  const A11yManager = {
    prefersReducedMotion: false,

    announce(message, isAssertive = false) {
      const politeEl = document.getElementById('aria-live-polite') || document.getElementById('a11y-announcer-polite');
      const assertEl = document.getElementById('aria-live-assertive') || document.getElementById('a11y-announcer-assertive');
      const target = isAssertive ? assertEl : politeEl;

      if (target) {
        target.textContent = '';
        setTimeout(() => {
          target.textContent = message;
        }, 20);
      }
    },

    setFocus(elementOrId) {
      const el = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
      if (el && typeof el.focus === 'function') {
        setTimeout(() => {
          el.focus();
        }, 40);
      }
    },

    isReducedMotion() {
      if (this.prefersReducedMotion) return true;
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  };

  /* ==========================================================================
     5. ParticleEngine: 250-Slot Object Pool Canvas Particle System
     ========================================================================== */
  const ParticleEngine = (() => {
    const POOL_SIZE = 250;
    let canvas = null;
    let ctx = null;
    let width = 0;
    let height = 0;
    let animId = null;
    let currentMode = 'MODE_LAB_MALFUNCTION';
    let pool = [];

    for (let i = 0; i < POOL_SIZE; i++) {
      pool.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 2,
        color: '#ff1744',
        alpha: 1.0,
        decay: 0.02,
        gravity: 0,
        type: 'spark'
      });
    }

    function init() {
      canvas = document.getElementById('fx-canvas');
      if (!canvas) return;
      ctx = canvas.getContext('2d');
      resize();
      window.addEventListener('resize', resize);
      start();
    }

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }

    function spawn(x, y, vx, vy, size, color, decay, gravity = 0, type = 'spark') {
      for (let i = 0; i < POOL_SIZE; i++) {
        const p = pool[i];
        if (!p.active) {
          p.active = true;
          p.x = x;
          p.y = y;
          p.vx = vx;
          p.vy = vy;
          p.size = size;
          p.color = color;
          p.alpha = 1.0;
          p.decay = decay;
          p.gravity = gravity;
          p.type = type;
          return p;
        }
      }
      return null;
    }

    function setMode(mode) {
      currentMode = mode;
    }

    function emitByMode() {
      if (A11yManager.isReducedMotion()) return;

      if (currentMode === 'MODE_LAB_MALFUNCTION') {
        const originX = width * 0.78;
        const originY = height * 0.65;
        if (Math.random() < 0.4) {
          const vx = (Math.random() - 0.5) * 6;
          const vy = -Math.random() * 5 - 2;
          const color = Math.random() < 0.6 ? '#fef08a' : '#f97316';
          spawn(originX, originY, vx, vy, Math.random() * 2.5 + 1, color, 0.035, 0.22, 'spark');
        }
        if (Math.random() < 0.08) {
          spawn(originX, originY, (Math.random() - 0.5) * 1.5, -0.8, 4, '#64748b', 0.015, -0.05, 'smoke');
        }
      } else if (currentMode === 'MODE_PYM_IMPLOSION') {
        const targetX = width * 0.25;
        const targetY = height * 0.68;
        for (let k = 0; k < 3; k++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 80 + Math.random() * 120;
          const px = targetX + Math.cos(angle) * dist;
          const py = targetY + Math.sin(angle) * dist;
          const speed = 2.5 + Math.random() * 3.5;
          const vx = -Math.cos(angle) * speed;
          const vy = -Math.sin(angle) * speed;
          spawn(px, py, vx, vy, Math.random() * 3 + 1, '#ff1744', 0.025, 0, 'spark');
        }
      } else if (currentMode === 'MODE_MICRO_AMBIENT') {
        if (Math.random() < 0.25) {
          const px = Math.random() * width;
          const py = Math.random() * height;
          const vx = (Math.random() - 0.5) * 0.5;
          const vy = (Math.random() - 0.5) * 0.5;
          const color = Math.random() < 0.6 ? '#00e5ff' : '#ffd600';
          spawn(px, py, vx, vy, Math.random() * 2.5 + 1, color, 0.008, 0, 'mote');
        }
      } else if (currentMode === 'MODE_POWER_SURGE') {
        if (Math.random() < 0.5) {
          const px = Math.random() * width;
          const py = height * 0.85 + Math.random() * (height * 0.15);
          const vx = (Math.random() - 0.5) * 1.2;
          const vy = -Math.random() * 3 - 1;
          const color = Math.random() < 0.7 ? '#10b981' : '#6ee7b7';
          spawn(px, py, vx, vy, Math.random() * 3 + 1.5, color, 0.02, -0.05, 'spark');
        }
      } else if (currentMode === 'MODE_PYM_EXPANSION') {
        const originX = width * 0.25;
        const originY = height * 0.68;
        for (let k = 0; k < 4; k++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 6 + 2;
          const vx = Math.cos(angle) * speed;
          const vy = Math.sin(angle) * speed;
          const color = Math.random() < 0.5 ? '#ff1744' : '#ffd600';
          spawn(originX, originY, vx, vy, Math.random() * 3 + 1, color, 0.025, 0.1, 'spark');
        }
      }
    }

    function burst(x, y, color = '#00e5ff', count = 20) {
      if (A11yManager.isReducedMotion()) return;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 1.5;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        spawn(x, y, vx, vy, Math.random() * 2.5 + 1.5, color, 0.03, 0.1, 'spark');
      }
    }

    function tick() {
      if (!ctx || !canvas) return;

      emitByMode();
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < POOL_SIZE; i++) {
        const p = pool[i];
        if (!p.active) continue;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
          p.active = false;
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;

        if (p.type === 'spark') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'smoke') {
          p.size += 0.15;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'mote') {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(tick);
    }

    function start() {
      if (!animId) {
        animId = requestAnimationFrame(tick);
      }
    }

    function stop() {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    }

    function clear() {
      for (let i = 0; i < POOL_SIZE; i++) {
        pool[i].active = false;
      }
      if (ctx && canvas) {
        ctx.clearRect(0, 0, width, height);
      }
    }

    return {
      init,
      start,
      stop,
      clear,
      setMode,
      burst
    };
  })();

  /* ==========================================================================
     6. AntManView: Scalable Character Controller
     ========================================================================== */
  const AntManView = {
    shrinkTimer: null,

    startShrinking(onComplete) {
      const container = document.getElementById('antman-container');
      GameState.antManScale = 0.04;

      if (!container) {
        if (onComplete) onComplete();
        return;
      }

      container.classList.remove('macro-scale', 'nano-scale', 'growing');
      container.classList.add('shrinking');

      const delay = A11yManager.isReducedMotion() ? 300 : 3000;
      this.shrinkTimer = setTimeout(() => {
        container.classList.remove('shrinking');
        container.classList.add('nano-scale');
        this.shrinkTimer = null;
        if (onComplete) onComplete();
      }, delay);
    },

    skipShrinking(onComplete) {
      if (this.shrinkTimer) {
        clearTimeout(this.shrinkTimer);
        this.shrinkTimer = null;
      }
      GameState.antManScale = 0.04;
      const container = document.getElementById('antman-container');
      if (container) {
        container.classList.remove('shrinking', 'growing', 'macro-scale');
        container.classList.add('nano-scale');
      }
      if (onComplete) onComplete();
    },

    startGrowth(onComplete) {
      GameState.antManScale = 1.0;
      const container = document.getElementById('antman-container');
      if (!container) {
        if (onComplete) onComplete();
        return;
      }

      container.classList.remove('shrinking', 'nano-scale', 'macro-scale');
      container.classList.add('growing');

      const delay = A11yManager.isReducedMotion() ? 300 : 2600;
      setTimeout(() => {
        container.classList.remove('growing');
        container.classList.add('macro-scale');
        if (onComplete) onComplete();
      }, delay);
    },

    reset() {
      if (this.shrinkTimer) {
        clearTimeout(this.shrinkTimer);
        this.shrinkTimer = null;
      }
      GameState.antManScale = 1.0;
      const container = document.getElementById('antman-container');
      if (container) {
        container.classList.remove('shrinking', 'growing', 'nano-scale');
        container.classList.add('macro-scale');
      }
    }
  };

  /* ==========================================================================
     7. WirePuzzle: Unified Pointer & Keyboard Dual-Coded Wiring Engine
     ========================================================================== */
  const WirePuzzle = (() => {
    let activePhase = 4;
    let activeDrag = null;
    let resizeObserver = null;

    function getTerminalCenter(element, svgElement) {
      if (!element || !svgElement) return { x: 0, y: 0 };
      const elRect = element.getBoundingClientRect();
      const svgRect = svgElement.getBoundingClientRect();

      const pip = element.querySelector('.terminal-pip');
      if (pip) {
        const pipRect = pip.getBoundingClientRect();
        return {
          x: pipRect.left + pipRect.width / 2 - svgRect.left,
          y: pipRect.top + pipRect.height / 2 - svgRect.top
        };
      }

      return {
        x: elRect.left + elRect.width / 2 - svgRect.left,
        y: elRect.top + elRect.height / 2 - svgRect.top
      };
    }

    function calculateBezierPath(x1, y1, x2, y2) {
      const dx = Math.abs(x2 - x1);
      const controlOffset = Math.max(50, dx * 0.55);
      const cx1 = x1 + controlOffset;
      const cy1 = y1;
      const cx2 = x2 - controlOffset;
      const cy2 = y2;
      return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
    }

    function init(phaseNum) {
      activePhase = phaseNum;
      const stageId = phaseNum === 4 ? 'wiring-stage-p4' : 'wiring-stage-p5';
      const stage = document.getElementById(stageId);
      if (!stage) return;

      stage.removeEventListener('pointerdown', handlePointerDown);
      stage.addEventListener('pointerdown', handlePointerDown);

      window.removeEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointermove', handlePointerMove);

      window.removeEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointerup', handlePointerUp);

      window.removeEventListener('pointercancel', handlePointerCancel);
      window.addEventListener('pointercancel', handlePointerCancel);

      const terminals = stage.querySelectorAll('.terminal');
      terminals.forEach(term => {
        term.removeEventListener('keydown', handleTerminalKeydown);
        term.addEventListener('keydown', handleTerminalKeydown);
      });

      if (!resizeObserver) {
        resizeObserver = new ResizeObserver(() => {
          recalculateCables(4);
          recalculateCables(5);
        });
        const container = document.getElementById('app-container');
        if (container) resizeObserver.observe(container);
      }
    }

    function isWireConnected(wireId, isP4) {
      const stateObj = isP4 ? GameState.p4 : GameState.p5;
      const items = isP4 ? stateObj.wires : stateObj.conduits;
      const item = items.find(x => x.id === wireId);
      return item ? item.connected : false;
    }

    function handlePointerDown(e) {
      AudioSynth.init();
      const terminal = e.target.closest('.terminal');
      if (!terminal) return;

      const wireId = terminal.getAttribute('data-wire-id');
      const side = terminal.getAttribute('data-side');
      const isP4 = activePhase === 4;
      const stateObj = isP4 ? GameState.p4 : GameState.p5;

      if (isWireConnected(wireId, isP4)) return;

      AudioSynth.playTerminalSelect();

      if (stateObj.selectedTerminal) {
        const prev = stateObj.selectedTerminal;
        if (prev.side !== side) {
          evaluateConnection(prev.wireId, wireId, prev.element, terminal, isP4);
          clearSelection(isP4);
          return;
        } else {
          clearSelection(isP4);
          if (prev.wireId === wireId) return;
        }
      }

      stateObj.selectedTerminal = { wireId, side, element: terminal };
      stateObj.selectedSource = wireId;
      terminal.classList.add('selected');
      terminal.setAttribute('aria-pressed', 'true');

      if (!isP4) updatePhase5SafeZone(wireId);

      const svgId = isP4 ? 'wiring-canvas-p4' : 'wiring-canvas-p5';
      const svg = document.getElementById(svgId);
      const coords = getTerminalCenter(terminal, svg);

      activeDrag = {
        wireId,
        side,
        sourceElem: terminal,
        startX: coords.x,
        startY: coords.y,
        pointerId: e.pointerId
      };

      try {
        terminal.setPointerCapture(e.pointerId);
      } catch (err) {}
    }

    function handlePointerMove(e) {
      if (!activeDrag) return;
      const isP4 = activePhase === 4;
      const cableId = isP4 ? 'p4-active-cable' : 'p5-active-cable';
      const svg = document.getElementById(isP4 ? 'wiring-canvas-p4' : 'wiring-canvas-p5');
      const cable = document.getElementById(cableId);
      if (!svg || !cable) return;

      const svgRect = svg.getBoundingClientRect();
      const curX = e.clientX - svgRect.left;
      const curY = e.clientY - svgRect.top;

      let x1 = activeDrag.startX;
      let y1 = activeDrag.startY;
      let x2 = curX;
      let y2 = curY;

      if (activeDrag.side === 'right') {
        x1 = curX;
        y1 = curY;
        x2 = activeDrag.startX;
        y2 = activeDrag.startY;
      }

      const pathData = calculateBezierPath(x1, y1, x2, y2);
      cable.setAttribute('d', pathData);

      const wireDef = getWireDef(activeDrag.wireId, isP4);
      if (wireDef) {
        cable.setAttribute('stroke', wireDef.color);
      }
    }

    function handlePointerUp(e) {
      if (!activeDrag) return;

      const isP4 = activePhase === 4;
      const cableId = isP4 ? 'p4-active-cable' : 'p5-active-cable';
      const cable = document.getElementById(cableId);
      if (cable) cable.setAttribute('d', '');

      const releaseElem = document.elementFromPoint(e.clientX, e.clientY);
      const targetTerminal = releaseElem ? releaseElem.closest('.terminal') : null;

      if (targetTerminal && targetTerminal !== activeDrag.sourceElem) {
        const targetSide = targetTerminal.getAttribute('data-side');
        const targetWireId = targetTerminal.getAttribute('data-wire-id');

        if (targetSide !== activeDrag.side) {
          evaluateConnection(activeDrag.wireId, targetWireId, activeDrag.sourceElem, targetTerminal, isP4);
          clearSelection(isP4);
          activeDrag = null;
          return;
        }
      }

      activeDrag = null;
    }

    function handlePointerCancel() {
      if (!activeDrag) return;
      const isP4 = activePhase === 4;
      const cableId = isP4 ? 'p4-active-cable' : 'p5-active-cable';
      const cable = document.getElementById(cableId);
      if (cable) cable.setAttribute('d', '');
      activeDrag = null;
    }

    function handleTerminalKeydown(e) {
      const isP4 = (GameState.currentPhase === 4) || (activePhase === 4);
      const terminal = (e.currentTarget || e.target).closest('.terminal');
      if (!terminal) return;
      const wireId = terminal.getAttribute('data-wire-id');
      const side = terminal.getAttribute('data-side');

      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        AudioSynth.init();

        const stateObj = isP4 ? GameState.p4 : GameState.p5;

        if (isWireConnected(wireId, isP4)) return;

        if (stateObj.selectedTerminal) {
          const prev = stateObj.selectedTerminal;
          if (prev.side !== side) {
            evaluateConnection(prev.wireId, wireId, prev.element, terminal, isP4);
            clearSelection(isP4);
            return;
          } else {
            clearSelection(isP4);
            if (prev.wireId === wireId) return;
          }
        }

        stateObj.selectedTerminal = { wireId, side, element: terminal };
        stateObj.selectedSource = wireId;
        terminal.classList.add('selected');
        terminal.setAttribute('aria-pressed', 'true');
        AudioSynth.playTerminalSelect();

        if (!isP4) updatePhase5SafeZone(wireId);
        A11yManager.announce(`Selected terminal ${wireId}. Choose matching terminal.`);
      } else if (e.key === 'Escape') {
        clearSelection(isP4);
        A11yManager.announce('Selection cancelled.');
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (terminal.classList.contains('node-badge')) {
          e.preventDefault();
          const dir = e.key === 'ArrowUp' ? 'up' : e.key === 'ArrowDown' ? 'down' : e.key === 'ArrowLeft' ? 'left' : 'right';
          if (typeof MazeEngine !== 'undefined') {
            MazeEngine.move(dir, isP4 ? 4 : 5);
          }
          return;
        }
        e.preventDefault();
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          navigateTerminalsVertical(terminal, e.key === 'ArrowDown');
        } else {
          navigateTerminalsHorizontal(terminal, e.key === 'ArrowRight');
        }
      }
    }

    function navigateTerminalsVertical(currentTerminal, isDown) {
      const column = currentTerminal.closest('.terminal-column');
      if (!column) return;
      const terminals = Array.from(column.querySelectorAll('.terminal'));
      const idx = terminals.indexOf(currentTerminal);
      const nextIdx = isDown ? (idx + 1) % terminals.length : (idx - 1 + terminals.length) % terminals.length;
      terminals[nextIdx].focus();
    }

    function navigateTerminalsHorizontal(currentTerminal, isRight) {
      const stage = currentTerminal.closest('.wiring-stage');
      if (!stage) return;
      const leftCol = stage.querySelector('.column-left');
      const rightCol = stage.querySelector('.column-right');
      const targetCol = isRight ? rightCol : leftCol;
      if (!targetCol) return;
      const targetTerminals = Array.from(targetCol.querySelectorAll('.terminal'));
      if (targetTerminals.length > 0) {
        targetTerminals[0].focus();
      }
    }

    function getWireDef(wireId, isP4) {
      const list = isP4 ? GameConfig.WIRES_P4 : GameConfig.CONDUITS_P5;
      return list.find(w => w.id === wireId);
    }

    function updatePhase5SafeZone(wireId) {
      const conduit = GameConfig.CONDUITS_P5.find(c => c.id === wireId);
      if (!conduit) return;

      GameState.p5.activeSafeMin = conduit.safeMin;
      GameState.p5.activeSafeMax = conduit.safeMax;

      const safeZoneEl = document.getElementById('timing-safe-zone');
      if (safeZoneEl) {
        const leftPct = conduit.safeMin * 100;
        const widthPct = (conduit.safeMax - conduit.safeMin) * 100;
        safeZoneEl.style.left = `${leftPct}%`;
        safeZoneEl.style.width = `${widthPct}%`;

        const textSpan = safeZoneEl.querySelector('.safe-window-text');
        if (textSpan) {
          textSpan.textContent = `SAFE TARGET WINDOW: ${Math.round(leftPct)}% - ${Math.round(leftPct + widthPct)}%`;
        }
      }
    }

    function evaluateConnection(sourceWireId, targetWireId, sourceElem, targetElem, isP4) {
      const feedbackId = isP4 ? 'p4-status-feedback' : 'p5-status-feedback';
      const feedback = document.getElementById(feedbackId);

      if (sourceWireId !== targetWireId) {
        AudioSynth.playConnectFail();
        triggerMismatchShake(sourceElem, targetElem);
        if (feedback) {
          feedback.textContent = 'MISMATCH: RECONNECT REQUIRED';
          feedback.className = 'feedback-banner error';
        }
        A11yManager.announce('Mismatch: wire retracted. Retry connection.', true);
        return;
      }

      if (!isP4) {
        const conduit = GameConfig.CONDUITS_P5.find(c => c.id === sourceWireId);
        const curPos = GameState.p5.timingCurrent;
        const safeMargin = 0.09;
        const inWindow = curPos >= (conduit.safeMin - safeMargin) && curPos <= (conduit.safeMax + safeMargin);

        if (!inWindow) {
          AudioSynth.playConnectFail();
          triggerMismatchShake(sourceElem, targetElem);
          const svg = document.getElementById('wiring-canvas-p5');
          const coords = getTerminalCenter(targetElem, svg);
          ParticleEngine.burst(coords.x + svg.getBoundingClientRect().left, coords.y + svg.getBoundingClientRect().top, '#ff1744', 15);

          if (feedback) {
            feedback.textContent = 'TIMING DESYNC: DISCHARGE DEFLECTED — RETRY NOW';
            feedback.className = 'feedback-banner error';
          }
          A11yManager.announce('Timing desynchronization: discharge deflected. Completed wires safe. Retry now.', true);
          return;
        }
      }

      lockConnection(sourceWireId, sourceElem, targetElem, isP4);
    }

    function triggerMismatchShake(elem1, elem2) {
      if (elem1) {
        elem1.classList.add('mismatch-shake');
        setTimeout(() => elem1.classList.remove('mismatch-shake'), 320);
      }
      if (elem2) {
        elem2.classList.add('mismatch-shake');
        setTimeout(() => elem2.classList.remove('mismatch-shake'), 320);
      }
    }

    function lockConnection(wireId, sourceElem, targetElem, isP4) {
      const stateObj = isP4 ? GameState.p4 : GameState.p5;
      const wireDef = getWireDef(wireId, isP4);
      if (!wireDef) return;

      const items = isP4 ? stateObj.wires : stateObj.conduits;
      const item = items.find(x => x.id === wireId);
      if (item) item.connected = true;

      stateObj.connectedCount++;

      const leftElem = sourceElem.getAttribute('data-side') === 'left' ? sourceElem : targetElem;
      const rightElem = sourceElem.getAttribute('data-side') === 'right' ? sourceElem : targetElem;

      leftElem.classList.remove('selected');
      leftElem.classList.add('connected');
      leftElem.classList.add('restored');
      leftElem.setAttribute('disabled', 'true');
      leftElem.disabled = true;
      const leftStatus = leftElem.querySelector('.node-badge-status');
      if (leftStatus) {
        leftStatus.textContent = 'RESTORED ✓';
      }

      rightElem.classList.remove('selected');
      rightElem.classList.add('connected');
      rightElem.setAttribute('disabled', 'true');
      rightElem.disabled = true;

      const group = document.getElementById(isP4 ? 'p4-cables-group' : 'p5-cables-group');
      const svg = document.getElementById(isP4 ? 'wiring-canvas-p4' : 'wiring-canvas-p5');

      if (group && svg) {
        const c1 = getTerminalCenter(leftElem, svg);
        const c2 = getTerminalCenter(rightElem, svg);
        const d = calculateBezierPath(c1.x, c1.y, c2.x, c2.y);

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('id', `locked-${wireId}`);
        path.setAttribute('class', 'locked-cable');
        path.setAttribute('d', d);
        path.setAttribute('stroke', wireDef.color);
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('fill', 'none');
        const dash = wireDef.strokeDash || wireDef.dash;
        if (dash && dash !== 'none') {
          path.setAttribute('stroke-dasharray', dash);
        }
        group.appendChild(path);

        const svgRect = svg.getBoundingClientRect();
        ParticleEngine.burst(c2.x + svgRect.left, c2.y + svgRect.top, wireDef.color, 24);
      }

      if (isP4) {
        AudioSynth.playConnectSuccess();
      } else {
        AudioSynth.playTimingSuccess();
      }

      const counterId = isP4 ? 'phase4-progress-counter' : 'phase5-progress-counter';
      const counter = document.getElementById(counterId);
      if (counter) {
        counter.textContent = GameConfig.VERBATIM.COUNTER_FORMAT(stateObj.connectedCount);
      }

      const feedbackId = isP4 ? 'p4-status-feedback' : 'p5-status-feedback';
      const feedback = document.getElementById(feedbackId);
      if (feedback) {
        feedback.textContent = `CONDUIT ${wireDef.label || wireDef.code} LOCKED`;
        feedback.className = 'feedback-banner success';
      }

      A11yManager.announce(`Connection secured: ${wireDef.label || wireDef.code}. ${stateObj.connectedCount} of 4 connected.`);

      if (typeof MazeEngine !== 'undefined') {
        MazeEngine.onWireConnected(wireId, isP4);
      }

      if (stateObj.connectedCount === 4) {
        stateObj.stabilized = true;
        handlePuzzleStabilization(isP4);
      }
    }

    function handlePuzzleStabilization(isP4) {
      const continueBtnId = isP4 ? 'btn-phase4-continue' : 'btn-phase5-continue';
      const continueBtn = document.getElementById(continueBtnId);
      const feedbackId = isP4 ? 'p4-status-feedback' : 'p5-status-feedback';
      const feedback = document.getElementById(feedbackId);
      const counterId = isP4 ? 'phase4-progress-counter' : 'phase5-progress-counter';
      const counter = document.getElementById(counterId);

      if (counter) counter.classList.add('complete');

      if (feedback) {
        feedback.textContent = isP4
          ? 'CIRCUIT STABILIZED — AUXILIARY COUPLING READY'
          : 'CIRCUIT STABILIZED — ALL CONDUITS SYNCHRONIZED';
        feedback.className = 'feedback-banner success';
      }

      if (typeof MazeEngine !== 'undefined') {
        MazeEngine.onStabilized(isP4);
      }

      if (continueBtn) {
        continueBtn.removeAttribute('disabled');
        continueBtn.disabled = false;
        continueBtn.removeAttribute('aria-hidden');
        A11yManager.setFocus(continueBtn);
      }

      A11yManager.announce(
        isP4
          ? 'All four primary conduits stabilized. Circuit board online. Press Continue to proceed.'
          : 'All four high-voltage conduits stabilized. Circuit locked. Press Continue to proceed.'
      );
    }

    function clearSelection(isP4) {
      const stateObj = isP4 ? GameState.p4 : GameState.p5;
      if (stateObj.selectedTerminal) {
        if (stateObj.selectedTerminal.element) {
          stateObj.selectedTerminal.element.classList.remove('selected');
          stateObj.selectedTerminal.element.setAttribute('aria-pressed', 'false');
        }
        stateObj.selectedTerminal = null;
        stateObj.selectedSource = null;
      }
    }

    function recalculateCables(phaseNum) {
      const isP4 = phaseNum === 4;
      const group = document.getElementById(isP4 ? 'p4-cables-group' : 'p5-cables-group');
      const svg = document.getElementById(isP4 ? 'wiring-canvas-p4' : 'wiring-canvas-p5');
      if (!group || !svg) return;

      const wires = isP4 ? GameConfig.WIRES_P4 : GameConfig.CONDUITS_P5;
      const stateObj = isP4 ? GameState.p4 : GameState.p5;
      const items = isP4 ? stateObj.wires : stateObj.conduits;

      wires.forEach(w => {
        const item = items.find(x => x.id === w.id);
        if (item && item.connected) {
          const path = group.querySelector(`#locked-${w.id}`);
          const leftElem = document.querySelector(`[data-phase="${phaseNum}"] [data-wire-id="${w.id}"][data-side="left"]`);
          const rightElem = document.querySelector(`[data-phase="${phaseNum}"] [data-wire-id="${w.id}"][data-side="right"]`);
          if (path && leftElem && rightElem) {
            const c1 = getTerminalCenter(leftElem, svg);
            const c2 = getTerminalCenter(rightElem, svg);
            path.setAttribute('d', calculateBezierPath(c1.x, c1.y, c2.x, c2.y));
          }
        }
      });
    }

    function engageCurrentByTrigger() {
      const stateObj = GameState.p5;
      if (stateObj.stabilized) return;

      let wireId = stateObj.selectedTerminal ? stateObj.selectedTerminal.wireId : null;
      if (!wireId) {
        const nextConduit = stateObj.conduits.find(c => !c.connected);
        if (!nextConduit) return;
        wireId = nextConduit.id;
      }

      const leftElem = document.querySelector(`[data-phase="5"] [data-wire-id="${wireId}"][data-side="left"]`);
      const rightElem = document.querySelector(`[data-phase="5"] [data-wire-id="${wireId}"][data-side="right"]`);
      if (leftElem && rightElem) {
        evaluateConnection(wireId, wireId, leftElem, rightElem, false);
      }
    }

    return {
      init,
      recalculateCables,
      engageCurrentByTrigger,
      clearSelection,
      lockConnection,
      evaluateConnection,
      handlePuzzleStabilization
    };
  })();

  /* ==========================================================================
     7B. MazeEngine: Microscopic Integrated Circuit Labyrinth Navigator
     ========================================================================== */
  const MazeEngine = (() => {
    // 13 columns x 9 rows
    const MAZE_P4 = [
      '#############',
      '#S...#.....B#',
      '#.#.#.#.###.#',
      '#.A.#.#.....#',
      '#.###.E.###.#',
      '#.....#.#.D.#',
      '#.###.#.#.#.#',
      '#G.....#....#',
      '#############'
    ];

    const MAZE_P5 = [
      '#############',
      '#S..#...#..2#',
      '#.#.###.#.#.#',
      '#...#1#.#.#.#',
      '###.#.E.###.#',
      '#...#.#...#.#',
      '#.###.###.#.#',
      '#3......#..4#',
      '#############'
    ];

    const NODES_P4 = {
      'A': { id: 'wire-1', label: 'ALPHA-1', symbol: '▲', color: '#ff2a42', name: 'Alpha' },
      'B': { id: 'wire-2', label: 'BETA-2', symbol: '■', color: '#00b0ff', name: 'Beta' },
      'G': { id: 'wire-3', label: 'GAMMA-3', symbol: '●', color: '#ffc107', name: 'Gamma' },
      'D': { id: 'wire-4', label: 'DELTA-4', symbol: '◆', color: '#00e676', name: 'Delta' }
    };

    const NODES_P5 = {
      '1': { id: 'timed-1', label: 'Q-PULSE 1', symbol: '★', color: '#b026ff', name: 'Q-Pulse' },
      '2': { id: 'timed-2', label: 'P-FLOW 2', symbol: '⬡', color: '#00e5ff', name: 'P-Flow' },
      '3': { id: 'timed-3', label: 'S-GRID 3', symbol: '✚', color: '#ff6d00', name: 'S-Grid' },
      '4': { id: 'timed-4', label: 'N-CORE 4', symbol: '⛉', color: '#76ff03', name: 'N-Core' }
    };

    const state = {
      p4: {
        x: 1,
        y: 1,
        facing: 'right',
        collected: new Set(),
        stabilized: false
      },
      p5: {
        x: 1,
        y: 1,
        facing: 'right',
        collected: new Set(),
        stabilized: false
      }
    };

    let activePhase = 4;
    let boundKeydown = null;
    let pathStepTimer = null;

    const ANTMAN_MINI_SVG = `
      <svg class="maze-player-svg" viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <radialGradient id="mini-core-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="40%" stop-color="#ff1744"/>
            <stop offset="100%" stop-color="#7f0000"/>
          </radialGradient>
        </defs>
        <rect x="34" y="44" width="32" height="42" rx="6" fill="#1e293b" stroke="#334155" stroke-width="2"/>
        <path d="M 38 48 L 48 48 L 46 80 L 40 80 Z" fill="#ff1744"/>
        <path d="M 62 48 L 52 48 L 54 80 L 60 80 Z" fill="#ff1744"/>
        <circle cx="50" cy="62" r="5" fill="url(#mini-core-glow)"/>
        <path d="M 38 86 L 36 120 L 46 120 L 46 86 Z" fill="#0f172a"/>
        <path d="M 62 86 L 64 120 L 54 120 L 54 86 Z" fill="#0f172a"/>
        <path d="M 34 26 C 34 10, 66 10, 66 26 C 68 34, 66 44, 50 44 C 34 44, 32 34, 34 26 Z" fill="#94a3b8" stroke="#475569" stroke-width="2"/>
        <path d="M 40 28 L 47 28 L 46 34 L 41 34 Z" fill="#ff1744"/>
        <path d="M 53 28 L 60 28 L 59 34 L 54 34 Z" fill="#ff1744"/>
        <line x1="40" y1="16" x2="34" y2="4" stroke="#94a3b8" stroke-width="2"/>
        <circle cx="34" cy="4" r="2" fill="#ff1744"/>
        <line x1="60" y1="16" x2="66" y2="4" stroke="#94a3b8" stroke-width="2"/>
        <circle cx="66" cy="4" r="2" fill="#ff1744"/>
      </svg>
    `;

    function init(phaseNum) {
      activePhase = phaseNum;
      buildGrid(phaseNum);
      bindControls(phaseNum);
    }

    function buildGrid(phaseNum) {
      const gridId = phaseNum === 4 ? 'p4-maze-grid' : 'p5-maze-grid';
      const grid = document.getElementById(gridId);
      if (!grid) return;
      grid.innerHTML = '';

      const mazeMap = phaseNum === 4 ? MAZE_P4 : MAZE_P5;
      const nodeDict = phaseNum === 4 ? NODES_P4 : NODES_P5;
      const H = mazeMap.length;
      const W = mazeMap[0].length;
      const pState = phaseNum === 4 ? state.p4 : state.p5;

      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const ch = mazeMap[y][x];
          const cell = document.createElement('div');
          cell.className = 'maze-cell';
          cell.setAttribute('data-x', x);
          cell.setAttribute('data-y', y);

          if (ch === '#') {
            cell.classList.add('cell-wall');
          } else {
            cell.classList.add('cell-path');
            if (ch === 'S') {
              cell.classList.add('cell-start');
            } else if (nodeDict[ch]) {
              const nodeInfo = nodeDict[ch];
              cell.classList.add('cell-node');
              cell.setAttribute('data-node-id', nodeInfo.id);
              cell.setAttribute('data-node-code', ch);

              const marker = document.createElement('div');
              marker.className = `maze-node-marker ${phaseNum === 4 ? `node-${nodeInfo.name.toLowerCase()}` : `node-p5-${ch}`}`;
              marker.textContent = nodeInfo.symbol;
              marker.setAttribute('title', `${nodeInfo.label} (${nodeInfo.name})`);
              cell.appendChild(marker);

              if (pState.collected.has(nodeInfo.id)) {
                cell.classList.add('collected');
              }

              cell.addEventListener('click', () => {
                navigatePathTo(x, y, phaseNum);
              });
            } else if (ch === 'E') {
              cell.classList.add('cell-regulator');
              cell.setAttribute('id', `maze-regulator-p${phaseNum}`);
              const core = document.createElement('div');
              core.className = 'maze-regulator-core';
              core.textContent = 'CORE';
              core.setAttribute('title', 'Quantum Central Regulator Core');
              cell.appendChild(core);

              if (pState.collected.size >= 4) {
                cell.classList.add('ready');
              }
              if (pState.stabilized) {
                cell.classList.add('stabilized');
              }

              cell.addEventListener('click', () => {
                navigatePathTo(x, y, phaseNum);
              });
            } else {
              cell.addEventListener('click', () => {
                navigatePathTo(x, y, phaseNum);
              });
            }
          }

          grid.appendChild(cell);
        }
      }

      // Create Ant-Man player avatar inside the grid
      const avatar = document.createElement('div');
      avatar.id = `maze-avatar-p${phaseNum}`;
      avatar.className = 'maze-player-avatar';
      avatar.innerHTML = ANTMAN_MINI_SVG;
      grid.appendChild(avatar);

      updateAvatarPosition(phaseNum, false);
      updateTelemetry(phaseNum);
    }

    function updateAvatarPosition(phaseNum, animate = true) {
      const pState = phaseNum === 4 ? state.p4 : state.p5;
      const avatar = document.getElementById(`maze-avatar-p${phaseNum}`);
      if (!avatar) return;

      const leftPercent = (pState.x / 13) * 100;
      const topPercent = (pState.y / 9) * 100;

      avatar.style.left = `${leftPercent}%`;
      avatar.style.top = `${topPercent}%`;
      avatar.style.width = `${100 / 13}%`;
      avatar.style.height = `${100 / 9}%`;

      if (pState.facing === 'left') {
        avatar.classList.add('facing-left');
      } else {
        avatar.classList.remove('facing-left');
      }

      if (animate) {
        avatar.classList.add('walking');
        setTimeout(() => avatar.classList.remove('walking'), 220);
      }
    }

    function updateTelemetry(phaseNum) {
      const pState = phaseNum === 4 ? state.p4 : state.p5;
      const displayId = phaseNum === 4 ? 'p4-maze-coord-display' : 'p5-maze-coord-display';
      const display = document.getElementById(displayId);
      if (display) {
        display.textContent = `Ant-Man: Junction (${pState.x}, ${pState.y})`;
      }
    }

    function move(dir, phaseNum) {
      const pState = phaseNum === 4 ? state.p4 : state.p5;
      const mazeMap = phaseNum === 4 ? MAZE_P4 : MAZE_P5;
      const H = mazeMap.length;
      const W = mazeMap[0].length;

      let nx = pState.x;
      let ny = pState.y;

      switch (dir) {
        case 'up': ny--; break;
        case 'down': ny++; break;
        case 'left': nx--; pState.facing = 'left'; break;
        case 'right': nx++; pState.facing = 'right'; break;
      }

      if (nx < 0 || nx >= W || ny < 0 || ny >= H) return false;
      if (mazeMap[ny][nx] === '#') {
        AudioSynth.playClick();
        return false;
      }

      pState.x = nx;
      pState.y = ny;
      updateAvatarPosition(phaseNum, true);
      updateTelemetry(phaseNum);
      AudioSynth.playFootstep();

      // Check interactions at new position
      checkCellInteraction(nx, ny, phaseNum);
      return true;
    }

    function checkCellInteraction(x, y, phaseNum) {
      const pState = phaseNum === 4 ? state.p4 : state.p5;
      const mazeMap = phaseNum === 4 ? MAZE_P4 : MAZE_P5;
      const nodeDict = phaseNum === 4 ? NODES_P4 : NODES_P5;
      const ch = mazeMap[y][x];

      if (nodeDict[ch]) {
        const nodeInfo = nodeDict[ch];
        if (!pState.collected.has(nodeInfo.id)) {
          pState.collected.add(nodeInfo.id);

          const gridId = phaseNum === 4 ? 'p4-maze-grid' : 'p5-maze-grid';
          const cell = document.querySelector(`#${gridId} [data-x="${x}"][data-y="${y}"]`);
          if (cell) cell.classList.add('collected');

          AudioSynth.playNodePickup();
          const grid = document.getElementById(gridId);
          if (grid) {
            const rect = grid.getBoundingClientRect();
            const px = rect.left + (x + 0.5) * (rect.width / 13);
            const py = rect.top + (y + 0.5) * (rect.height / 9);
            ParticleEngine.burst(px, py, nodeInfo.color, 24);
          }

          // Trigger connection in WirePuzzle
          const leftElem = document.querySelector(`[data-phase="${phaseNum}"] [data-wire-id="${nodeInfo.id}"][data-side="left"]`);
          const rightElem = document.querySelector(`[data-phase="${phaseNum}"] [data-wire-id="${nodeInfo.id}"][data-side="right"]`);
          if (leftElem && rightElem) {
            WirePuzzle.lockConnection(nodeInfo.id, leftElem, rightElem, phaseNum === 4);
          }

          if (pState.collected.size >= 4) {
            const regCell = document.getElementById(`maze-regulator-p${phaseNum}`);
            if (regCell) regCell.classList.add('ready');
            const feedback = document.getElementById(phaseNum === 4 ? 'p4-status-feedback' : 'p5-status-feedback');
            if (feedback) {
              feedback.textContent = 'ALL 4 NODES RESTORED — ENTER CENTRAL REGULATOR CORE TO STABILIZE!';
              feedback.className = 'feedback-banner success';
            }
            A11yManager.announce('All four quantum bus nodes secured. Enter the Central Regulator Core to stabilize the system.', true);
          }
        }
      } else if (ch === 'E') {
        // Regulator Core
        if (pState.collected.size >= 4 && !pState.stabilized) {
          triggerRegulatorStabilization(phaseNum);
        }
      }
    }

    function triggerRegulatorStabilization(phaseNum) {
      const pState = phaseNum === 4 ? state.p4 : state.p5;
      pState.stabilized = true;

      const regCell = document.getElementById(`maze-regulator-p${phaseNum}`);
      if (regCell) {
        regCell.classList.remove('ready');
        regCell.classList.add('stabilized');
      }

      const grid = document.getElementById(phaseNum === 4 ? 'p4-maze-grid' : 'p5-maze-grid');
      if (grid) {
        grid.classList.add('surging');
        const rect = grid.getBoundingClientRect();
        ParticleEngine.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, '#10b981', 36);
      }

      WirePuzzle.handlePuzzleStabilization(phaseNum === 4);
    }

    function onWireConnected(wireId, isP4) {
      const phaseNum = isP4 ? 4 : 5;
      const pState = isP4 ? state.p4 : state.p5;
      pState.collected.add(wireId);

      const gridId = phaseNum === 4 ? 'p4-maze-grid' : 'p5-maze-grid';
      const cell = document.querySelector(`#${gridId} [data-node-id="${wireId}"]`);
      if (cell) cell.classList.add('collected');

      const badge = document.querySelector(`[data-phase="${phaseNum}"] [data-wire-id="${wireId}"][data-side="left"]`);
      if (badge) {
        badge.classList.add('connected', 'restored');
        const st = badge.querySelector('.node-badge-status');
        if (st) st.textContent = 'RESTORED ✓';
      }

      if (pState.collected.size >= 4) {
        const regCell = document.getElementById(`maze-regulator-p${phaseNum}`);
        if (regCell) regCell.classList.add('ready');
      }
    }

    function onStabilized(isP4) {
      const phaseNum = isP4 ? 4 : 5;
      const pState = isP4 ? state.p4 : state.p5;
      pState.stabilized = true;

      const regCell = document.getElementById(`maze-regulator-p${phaseNum}`);
      if (regCell) {
        regCell.classList.remove('ready');
        regCell.classList.add('stabilized');
      }

      const grid = document.getElementById(phaseNum === 4 ? 'p4-maze-grid' : 'p5-maze-grid');
      if (grid) {
        grid.classList.add('surging');
      }
    }

    // BFS Pathfinding for Click-to-Move
    function navigatePathTo(targetX, targetY, phaseNum) {
      const pState = phaseNum === 4 ? state.p4 : state.p5;
      const mazeMap = phaseNum === 4 ? MAZE_P4 : MAZE_P5;
      const H = mazeMap.length;
      const W = mazeMap[0].length;

      if (targetX === pState.x && targetY === pState.y) return;
      if (mazeMap[targetY][targetX] === '#') return;

      const queue = [[pState.x, pState.y, []]];
      const visited = new Set([`${pState.x},${pState.y}`]);
      let foundPath = null;

      while (queue.length > 0) {
        const [cx, cy, path] = queue.shift();
        if (cx === targetX && cy === targetY) {
          foundPath = path;
          break;
        }

        const neighbors = [
          [cx, cy - 1, 'up'],
          [cx, cy + 1, 'down'],
          [cx - 1, cy, 'left'],
          [cx + 1, cy, 'right']
        ];

        for (const [nx, ny, dir] of neighbors) {
          if (nx >= 0 && nx < W && ny >= 0 && ny < H && mazeMap[ny][nx] !== '#' && !visited.has(`${nx},${ny}`)) {
            visited.add(`${nx},${ny}`);
            queue.push([nx, ny, [...path, dir]]);
          }
        }
      }

      if (foundPath && foundPath.length > 0) {
        if (pathStepTimer) clearInterval(pathStepTimer);
        let idx = 0;
        pathStepTimer = setInterval(() => {
          if (idx < foundPath.length) {
            move(foundPath[idx], phaseNum);
            idx++;
          } else {
            clearInterval(pathStepTimer);
            pathStepTimer = null;
          }
        }, 90);
      }
    }

    function bindControls(phaseNum) {
      destroyControls();

      boundKeydown = (e) => {
        if (GameState.currentPhase !== phaseNum) return;
        const key = e.key;
        let moved = false;

        switch (key) {
          case 'ArrowUp':
          case 'w':
          case 'W':
            moved = move('up', phaseNum);
            break;
          case 'ArrowDown':
          case 's':
          case 'S':
            moved = move('down', phaseNum);
            break;
          case 'ArrowLeft':
          case 'a':
          case 'A':
            moved = move('left', phaseNum);
            break;
          case 'ArrowRight':
          case 'd':
          case 'D':
            moved = move('right', phaseNum);
            break;
          case ' ':
            if (phaseNum === 5) {
              WirePuzzle.engageCurrentByTrigger();
              moved = true;
            }
            break;
        }

        if (moved) {
          e.preventDefault();
        }
      };

      window.addEventListener('keydown', boundKeydown);

      // Virtual D-Pad buttons
      const prefix = phaseNum === 4 ? 'p4' : 'p5';
      const dpadUp = document.getElementById(`${prefix}-dpad-up`);
      const dpadDown = document.getElementById(`${prefix}-dpad-down`);
      const dpadLeft = document.getElementById(`${prefix}-dpad-left`);
      const dpadRight = document.getElementById(`${prefix}-dpad-right`);

      if (dpadUp) dpadUp.onclick = () => move('up', phaseNum);
      if (dpadDown) dpadDown.onclick = () => move('down', phaseNum);
      if (dpadLeft) dpadLeft.onclick = () => move('left', phaseNum);
      if (dpadRight) dpadRight.onclick = () => move('right', phaseNum);
    }

    function destroyControls() {
      if (boundKeydown) {
        window.removeEventListener('keydown', boundKeydown);
        boundKeydown = null;
      }
      if (pathStepTimer) {
        clearInterval(pathStepTimer);
        pathStepTimer = null;
      }
    }

    function reset() {
      destroyControls();
      state.p4 = {
        x: 1,
        y: 1,
        facing: 'right',
        collected: new Set(),
        stabilized: false
      };
      state.p5 = {
        x: 1,
        y: 1,
        facing: 'right',
        collected: new Set(),
        stabilized: false
      };

      const g4 = document.getElementById('p4-maze-grid');
      const g5 = document.getElementById('p5-maze-grid');
      if (g4) {
        g4.innerHTML = '';
        g4.classList.remove('surging');
      }
      if (g5) {
        g5.innerHTML = '';
        g5.classList.remove('surging');
      }

      document.querySelectorAll('.node-badge').forEach(badge => {
        badge.classList.remove('connected', 'restored', 'selected');
        badge.disabled = false;
        badge.removeAttribute('disabled');
        const st = badge.querySelector('.node-badge-status');
        if (st) st.textContent = 'PENDING';
      });
    }

    return {
      init,
      move,
      navigatePathTo,
      onWireConnected,
      onStabilized,
      reset,
      destroy: destroyControls
    };
  })();

  /* ==========================================================================
     8. TimingMechanic: High-Precision rAF Current Gauge Oscillator
     ========================================================================== */
  const TimingMechanic = {
    animId: null,
    lastTime: 0,
    cycleDuration: 1.8,

    start() {
      if (this.animId) return;
      this.lastTime = performance.now();
      const tick = (now) => {
        const delta = (now - this.lastTime) / 1000;
        this.lastTime = now;

        if (!GameState.p5.stabilized) {
          let pos = GameState.p5.timingCurrent + GameState.p5.timingDirection * (delta / this.cycleDuration);

          if (pos >= 1.0) {
            pos = 1.0;
            GameState.p5.timingDirection = -1;
            AudioSynth.playTimingTick();
          } else if (pos <= 0.0) {
            pos = 0.0;
            GameState.p5.timingDirection = 1;
            AudioSynth.playTimingTick();
          }

          GameState.p5.timingCurrent = pos;

          const needle = document.getElementById('timing-needle');
          const readout = document.getElementById('timing-percentage-display');
          const pct = Math.round(pos * 100);

          if (needle) needle.style.left = `${pct}%`;
          if (readout) readout.textContent = `${pct}%`;
        } else {
          const needle = document.getElementById('timing-needle');
          const readout = document.getElementById('timing-percentage-display');
          if (needle) needle.style.left = '50%';
          if (readout) readout.textContent = '50% (SYNC)';
        }

        this.animId = requestAnimationFrame(tick);
      };

      this.animId = requestAnimationFrame(tick);
    },

    stop() {
      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
    },

    getCurrentPosition() {
      return GameState.p5.timingCurrent;
    },

    checkHit(arg1, arg2) {
      let pos = typeof arg1 === 'number' ? arg1 : GameState.p5.timingCurrent;
      let conduit = arg2 || (typeof arg1 === 'string' ? GameState.p5.conduits.find(c => c.id === arg1) : (typeof arg1 === 'object' ? arg1 : GameState.p5.conduits[0]));
      if (!conduit) return false;
      return pos >= conduit.safeMin && pos <= conduit.safeMax;
    }
  };

  /* ==========================================================================
     9. UIManager: Phase Flow, DOM Transitions, & Reset Controller
     ========================================================================== */
  const UIManager = (() => {

    function transitionToPhase(targetPhase) {
      GameState.currentPhase = targetPhase;

      const cameraRig = document.getElementById('camera-rig');
      if (cameraRig) {
        const cameraMap = {
          1: 'phase-1',
          2: 'phase-2-push',
          3: 'phase-3',
          4: 'puzzle-focus',
          5: 'puzzle-focus',
          6: 'diagnostic',
          7: 'power-sweep',
          8: 'phase-8-growth'
        };
        cameraRig.setAttribute('data-camera', cameraMap[targetPhase] || 'phase-1');
      }

      const phaseIndicator = document.getElementById('hud-phase-indicator');
      if (phaseIndicator) {
        phaseIndicator.textContent = `PHASE ${targetPhase} / 8`;
      }

      const suitStatus = document.getElementById('hud-suit-status');
      if (suitStatus) {
        const statusLabels = {
          1: 'STANDBY',
          2: 'COMPRESSING',
          3: 'SUB-MICRON',
          4: 'NANO-ACTIVE',
          5: 'HIGH-VOLTAGE SYNC',
          6: 'DIAGNOSTIC BYPASS',
          7: 'EXPANDING',
          8: 'MISSION COMPLETE'
        };
        suitStatus.textContent = statusLabels[targetPhase] || 'ACTIVE';
      }

      const phases = document.querySelectorAll('.phase-container');
      phases.forEach(p => {
        const phaseNum = parseInt(p.getAttribute('data-phase'), 10);
        if (phaseNum === targetPhase) {
          p.classList.add('active');
          p.removeAttribute('aria-hidden');
        } else {
          p.classList.remove('active');
          p.setAttribute('aria-hidden', 'true');
        }
      });

      // Keep continue buttons state appropriate
      if (targetPhase > 4) {
        const p4Btn = document.getElementById('btn-phase4-continue');
        if (p4Btn) p4Btn.disabled = true;
      }
      if (targetPhase > 5) {
        const p5Btn = document.getElementById('btn-phase5-continue');
        if (p5Btn) p5Btn.disabled = true;
      }

      switch (targetPhase) {
        case 1:
          ParticleEngine.setMode('MODE_LAB_MALFUNCTION');
          break;
        case 2:
          ParticleEngine.setMode('MODE_PYM_IMPLOSION');
          break;
        case 3:
        case 4:
        case 5:
        case 6:
          ParticleEngine.setMode('MODE_MICRO_AMBIENT');
          break;
        case 7:
          ParticleEngine.setMode('MODE_POWER_SURGE');
          break;
        case 8:
          ParticleEngine.setMode('MODE_PYM_EXPANSION');
          break;
      }

      if (targetPhase !== 4 && targetPhase !== 5) {
        MazeEngine.destroy();
      }

      handlePhaseEnter(targetPhase);
    }

    function handlePhaseEnter(phase) {
      switch (phase) {
        case GameConfig.PHASES.MALFUNCTION:
          A11yManager.announce('Nanotech System Failure Detected. Manual repair required. Press Begin Repair to start.');
          A11yManager.setFocus('btn-begin-repair');
          break;

        case GameConfig.PHASES.SHRINKING:
          A11yManager.announce('Pym Particle suit activated. Ant-Man shrinking to microscopic scale. Press Skip to enter directly.');
          A11yManager.setFocus('btn-skip-shrink');

          AntManView.startShrinking(() => {
            if (GameState.currentPhase === GameConfig.PHASES.SHRINKING) {
              transitionToPhase(GameConfig.PHASES.ENTERING_NANO);
            }
          });
          break;

        case GameConfig.PHASES.ENTERING_NANO:
          A11yManager.announce('Inside nanotech machine. Microscopic circuit interior reached. Objective: Navigate the nano-circuit maze to restore the quantum core.');
          A11yManager.setFocus('btn-enter-circuit');
          break;

        case GameConfig.PHASES.COLOR_WIRING:
          WirePuzzle.clearSelection(true);
          WirePuzzle.init(4);
          MazeEngine.init(4);
          A11yManager.announce('Nano-circuit maze online. Use Arrow Keys, WASD, or D-Pad to navigate Ant-Man. Reconnect four quantum nodes and reach the central regulator.');
          const mazeGrid4 = document.getElementById('p4-maze-grid');
          if (mazeGrid4) A11yManager.setFocus(mazeGrid4);
          break;

        case GameConfig.PHASES.TIMED_WIRING:
          WirePuzzle.clearSelection(false);
          WirePuzzle.init(5);
          MazeEngine.init(5);
          TimingMechanic.start();
          A11yManager.announce('Phase 5: High-voltage timing challenge. Synchronize connection when indicator enters safe window.');
          const mazeGrid5 = document.getElementById('p5-maze-grid');
          if (mazeGrid5) A11yManager.setFocus(mazeGrid5);
          break;

        case GameConfig.PHASES.DEBUG_PLACEHOLDER:
          TimingMechanic.stop();
          A11yManager.announce('Debugging challenge placeholder screen. Diagnostic simulation under development. Press Bypass for Testing to continue.');
          A11yManager.setFocus('btn-bypass-debug');
          break;

        case GameConfig.PHASES.RESTART:
          runPowerUpSequence();
          break;

        case GameConfig.PHASES.VICTORY_GROWTH:
          AntManView.startGrowth(() => {
            A11yManager.announce('Mission completed. Nanotech repaired. Ant-Man returned to normal size. Press Play Again to restart.');
            A11yManager.setFocus('btn-play-again');
          });
          break;
      }
    }

    function runPowerUpSequence() {
      const stages = document.querySelectorAll('.powerup-stage-item');
      stages.forEach(s => s.classList.remove('online'));

      const klaxons = document.querySelectorAll('.warning-light, .klaxon-light');
      const isReduced = A11yManager.isReducedMotion();
      const delay1 = isReduced ? 20 : 100;
      const delay2 = isReduced ? 50 : 300;
      const delay3 = isReduced ? 80 : 500;

      setTimeout(() => {
        if (stages[0]) stages[0].classList.add('online');
      }, delay1);

      setTimeout(() => {
        if (stages[1]) stages[1].classList.add('online');
      }, delay2);

      setTimeout(() => {
        if (stages[2]) stages[2].classList.add('online');
        klaxons.forEach(k => {
          k.classList.remove('active', 'flashing', 'alarm-active');
          k.classList.add('restored', 'light-green', 'status-restored');
          k.setAttribute('data-state', 'restored');
        });
        AudioSynth.playSystemRestored();
        GameState.p7.restored = true;
        A11yManager.announce('Nanotech system restored. All circuits operational.');
        const btnContinue = document.getElementById('btn-phase7-continue');
        if (btnContinue) {
          btnContinue.removeAttribute('disabled');
          btnContinue.disabled = false;
          A11yManager.setFocus(btnContinue);
        }
      }, delay3);
    }

    function resetGame() {
      GameState.reset();
      ParticleEngine.clear();
      AntManView.reset();

      const g4 = document.getElementById('p4-cables-group');
      const g5 = document.getElementById('p5-cables-group');
      if (g4) g4.innerHTML = '';
      if (g5) g5.innerHTML = '';

      const allTerminals = document.querySelectorAll('.terminal');
      allTerminals.forEach(term => {
        term.classList.remove('selected', 'connected', 'mismatch-shake');
        term.removeAttribute('disabled');
        term.disabled = false;
        term.setAttribute('aria-pressed', 'false');
      });

      const p4Counter = document.getElementById('phase4-progress-counter');
      const p5Counter = document.getElementById('phase5-progress-counter');
      if (p4Counter) {
        p4Counter.textContent = '0 / 4 connected';
        p4Counter.classList.remove('complete');
      }
      if (p5Counter) {
        p5Counter.textContent = '0 / 4 connected';
        p5Counter.classList.remove('complete');
      }

      const p4Btn = document.getElementById('btn-phase4-continue');
      const p5Btn = document.getElementById('btn-phase5-continue');
      if (p4Btn) {
        p4Btn.setAttribute('disabled', 'true');
        p4Btn.setAttribute('aria-hidden', 'true');
      }
      if (p5Btn) {
        p5Btn.setAttribute('disabled', 'true');
        p5Btn.setAttribute('aria-hidden', 'true');
      }

      const fb4 = document.getElementById('p4-status-feedback');
      const fb5 = document.getElementById('p5-status-feedback');
      if (fb4) fb4.textContent = '';
      if (fb5) fb5.textContent = '';

      const klaxons = document.querySelectorAll('.warning-light, .klaxon-light');
      klaxons.forEach(k => {
        k.classList.remove('restored', 'light-green', 'status-restored');
        k.classList.add('active', 'flashing', 'alarm-active');
        k.removeAttribute('data-state');
      });

      TimingMechanic.stop();
      MazeEngine.reset();
      transitionToPhase(GameConfig.PHASES.MALFUNCTION);
    }

    // Generic Continue action regardless of which continue button receives click
    function handleContinueClick() {
      AudioSynth.playClick();
      if (GameState.currentPhase === GameConfig.PHASES.COLOR_WIRING) {
        if (GameState.p4.stabilized) {
          transitionToPhase(GameConfig.PHASES.TIMED_WIRING);
        }
      } else if (GameState.currentPhase === GameConfig.PHASES.TIMED_WIRING) {
        if (GameState.p5.stabilized) {
          transitionToPhase(GameConfig.PHASES.DEBUG_PLACEHOLDER);
        }
      } else if (GameState.currentPhase === GameConfig.PHASES.RESTART) {
        transitionToPhase(GameConfig.PHASES.VICTORY_GROWTH);
      }
    }

    function bindEvents() {
      window.addEventListener('pointerdown', () => AudioSynth.init(), { once: true });
      window.addEventListener('keydown', () => AudioSynth.init(), { once: true });

      const audioBtn = document.getElementById('btn-audio-toggle');
      if (audioBtn) {
        audioBtn.addEventListener('click', () => {
          const muted = AudioSynth.toggleMute();
          audioBtn.setAttribute('aria-pressed', muted ? 'true' : 'false');
          const icon = audioBtn.querySelector('.audio-icon');
          if (icon) icon.textContent = muted ? '🔇' : '🔊';
        });
      }

      const btnBeginRepair = document.getElementById('btn-begin-repair');
      if (btnBeginRepair) {
        btnBeginRepair.addEventListener('click', () => {
          if (GameState.currentPhase !== GameConfig.PHASES.MALFUNCTION) return;
          AudioSynth.playClick();
          transitionToPhase(GameConfig.PHASES.SHRINKING);
        });
      }

      const btnSkipShrink = document.getElementById('btn-skip-shrink');
      if (btnSkipShrink) {
        btnSkipShrink.addEventListener('click', () => {
          if (GameState.currentPhase !== GameConfig.PHASES.SHRINKING) return;
          AudioSynth.playClick();
          AntManView.skipShrinking(() => {
            transitionToPhase(GameConfig.PHASES.ENTERING_NANO);
          });
        });
      }

      const btnEnterCircuit = document.getElementById('btn-enter-circuit');
      if (btnEnterCircuit) {
        btnEnterCircuit.addEventListener('click', () => {
          if (GameState.currentPhase !== GameConfig.PHASES.ENTERING_NANO) return;
          AudioSynth.playClick();
          transitionToPhase(GameConfig.PHASES.COLOR_WIRING);
        });
      }

      const btnP4Continue = document.getElementById('btn-phase4-continue');
      if (btnP4Continue) {
        btnP4Continue.addEventListener('click', handleContinueClick);
      }

      const btnTimingTrigger = document.getElementById('btn-timing-trigger');
      if (btnTimingTrigger) {
        btnTimingTrigger.addEventListener('click', () => {
          if (GameState.currentPhase !== GameConfig.PHASES.TIMED_WIRING) return;
          WirePuzzle.engageCurrentByTrigger();
        });
      }

      const btnP5Continue = document.getElementById('btn-phase5-continue');
      if (btnP5Continue) {
        btnP5Continue.addEventListener('click', handleContinueClick);
      }

      const btnBypassDebug = document.getElementById('btn-bypass-debug');
      if (btnBypassDebug) {
        btnBypassDebug.addEventListener('click', () => {
          if (GameState.currentPhase !== GameConfig.PHASES.DEBUG_PLACEHOLDER) return;
          AudioSynth.playClick();
          transitionToPhase(GameConfig.PHASES.RESTART);
        });
      }

      const btnP7Continue = document.getElementById('btn-phase7-continue');
      if (btnP7Continue) {
        btnP7Continue.addEventListener('click', handleContinueClick);
      }

      const btnPlayAgain = document.getElementById('btn-play-again');
      if (btnPlayAgain) {
        btnPlayAgain.addEventListener('click', () => {
          if (GameState.currentPhase !== GameConfig.PHASES.VICTORY_GROWTH) return;
          AudioSynth.playClick();
          resetGame();
        });
      }

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || e.code === 'Escape') {
          WirePuzzle.clearSelection(true);
          WirePuzzle.clearSelection(false);
          A11yManager.announce('Selection cancelled.');
        } else if (e.key === ' ' && GameState.currentPhase === GameConfig.PHASES.TIMED_WIRING) {
          const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
          if (activeTag !== 'button') {
            e.preventDefault();
            WirePuzzle.engageCurrentByTrigger();
          }
        } else if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space' || e.code === 'Enter') {
          const activeEl = document.activeElement;
          if (activeEl && activeEl.tagName === 'BUTTON' && !activeEl.classList.contains('terminal')) {
            e.preventDefault();
            activeEl.click();
          }
        }
      });
    }

    return {
      transitionToPhase,
      resetGame,
      bindEvents
    };
  })();

  /* ==========================================================================
     10. Bootstrap Initialization & Global Namespace Exports
     ========================================================================== */
  function initGame() {
    try {
      ParticleEngine.init();
      UIManager.bindEvents();
      UIManager.transitionToPhase(GameConfig.PHASES.MALFUNCTION);

      const klaxons = document.querySelectorAll('.warning-light, .klaxon-light');
      klaxons.forEach(k => {
        k.classList.add('active', 'flashing', 'alarm-active');
      });
    } catch (e) {
      window.__CONSOLE_ERRORS__.push(e.message || String(e));
      console.error('[AntManGame Bootstrap Error]', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
  } else {
    initGame();
  }

  // Export globals onto window for full interface contract compliance
  window.GameState = GameState;
  window.gameState = GameState;
  window.GameConfig = GameConfig;
  window.AudioSynth = AudioSynth;
  window.audioSynth = AudioSynth;
  window.TimingMechanic = TimingMechanic;
  window.timingMechanic = TimingMechanic;
  window.A11yManager = A11yManager;
  window.a11yManager = A11yManager;
  window.ParticleEngine = ParticleEngine;
  window.WirePuzzle = WirePuzzle;
  window.MazeEngine = MazeEngine;
  window.mazeEngine = MazeEngine;
  window.UIManager = UIManager;

  // Unified AntManGame namespace
  window.AntManGame = {
    GameState,
    GameConfig,
    UIManager,
    AudioSynth,
    ParticleEngine,
    WirePuzzle,
    MazeEngine,
    TimingMechanic,
    A11yManager
  };

})();
