/**
 * ============================================================================
 * IRON MAN – ARC REACTOR: CORE RESTORATION
 * Photorealistic 2.5D Engine & Stark Cybernetic Restoration System
 * ============================================================================
 */

(function () {
    "use strict";

    /* ========================================================================
       1. GAME CONFIGURATION & CONSTANTS
       ======================================================================== */
    const CONFIG = {
        STAGE1: {
            TARGET_CELLS: 10,
            SPAWN_INTERVAL_ENERGY: 1300,
            SPAWN_INTERVAL_HAZARD: 2000,
            MAX_ENERGY_CELLS: 6,
            MAX_HAZARDS: 5,
            DRONE_SPEED: 460,
            DRONE_BOOST_MULT: 1.9,
            DRONE_ACCEL: 2200,
            DRONE_FRICTION: 0.88,
            HAZARD_DAMAGE: 20,
            MAGNETIC_RANGE: 140,
            MAGNETIC_PULL: 280
        }
    };

    /* ========================================================================
       2. GAME STATE MANAGEMENT
       ======================================================================== */
    const GameState = {
        phase: 'BOOT', // BOOT, STAGE1, ACTIVATION, VICTORY, FAILED_STAGE1, PAUSED
        isPaused: false,
        totalElapsedTime: 0,
        stageStartTime: 0,
        muted: false,

        // Stage 1 State
        stage1: {
            hull: 100,
            energyCollected: 0,
            cells: [],
            hazards: [],
            particles: [],
            lastEnergySpawn: 0,
            lastHazardSpawn: 0,
            drone: {
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                angle: 0,
                roll: 0,
                pitch: 0,
                radius: 32,
                boosting: false
            }
        },

        // Input State
        keys: {
            up: false,
            down: false,
            left: false,
            right: false,
            boost: false
        },
        touch: {
            active: false,
            dx: 0,
            dy: 0,
            boost: false
        }
    };

    let lightCanvas = null;
    let lightCtx = null;

    // DOM Element References
    const DOM = {};
    function cacheDOM() {
        DOM.canvas1 = document.getElementById('stage1-canvas');
        DOM.ctx1 = DOM.canvas1 ? DOM.canvas1.getContext('2d') : null;

        DOM.stage1HUD = document.getElementById('stage1-hud');
        DOM.hullBar = document.getElementById('hull-bar');
        DOM.hullVal = document.getElementById('hull-val');
        DOM.energyBar = document.getElementById('energy-bar');
        DOM.energyVal = document.getElementById('energy-val');

        // Flight visor readouts
        DOM.targetRangefinder = document.getElementById('target-rangefinder');
        DOM.flightSpeed = document.getElementById('flight-speed');
        DOM.gForceMeter = document.getElementById('g-force-meter');
        DOM.hazardProximity = document.getElementById('hazard-proximity');

        DOM.hudToast = document.getElementById('hud-toast');
        DOM.activationFX = document.getElementById('activation-fx');

        // Screens
        DOM.screenStart = document.getElementById('screen-start');
        DOM.screenFail1 = document.getElementById('screen-fail-stage1');
        DOM.screenVictory = document.getElementById('screen-victory');

        // Victory stats
        DOM.vStatTime = document.getElementById('v-stat-time');
        DOM.vStatEnergy = document.getElementById('v-stat-energy');
        DOM.vStatSync = document.getElementById('v-stat-sync');

        // Buttons
        DOM.btnStart = document.getElementById('btn-start-mission');
        DOM.btnRetry1 = document.getElementById('btn-retry-stage1');
        DOM.btnRestartAll1 = document.getElementById('btn-restart-all-1');
        DOM.btnContinueDiag = document.getElementById('btn-continue-diagnostics');
        DOM.btnPlayAgain = document.getElementById('btn-play-again');
        DOM.btnMute = document.getElementById('btn-audio-mute');

        // Touch
        DOM.touchControls = document.getElementById('touch-controls');
        DOM.joystickBase = document.getElementById('joystick-base');
        DOM.joystickStick = document.getElementById('joystick-stick');
        DOM.boostTouchBtn = document.getElementById('boost-touch-btn');

        lightCanvas = document.createElement('canvas');
        lightCtx = lightCanvas.getContext('2d');
    }

    /* ========================================================================
       3. AUDIO ENGINE & SOUND EFFECTS (Synthesizer + File Fallback)
       ======================================================================== */
    const Sound = (() => {
        let actx = null;
        let ambientHumNode = null;
        let ambientGain = null;

        function getContext() {
            if (!actx && typeof (window.AudioContext || window.webkitAudioContext) !== 'undefined') {
                try {
                    actx = new (window.AudioContext || window.webkitAudioContext)();
                } catch (e) {
                    actx = null;
                }
            }
            if (actx && actx.state === 'suspended') {
                actx.resume();
            }
            return actx;
        }

        function playTone(freqStart, freqEnd, type, duration, peakVol) {
            if (GameState.muted) return;
            const ctx = getContext();
            if (!ctx) return;

            const t = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type || 'sine';
            osc.frequency.setValueAtTime(freqStart, t);
            if (freqEnd && freqEnd !== freqStart) {
                osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), t + duration);
            }

            gain.gain.setValueAtTime(0.0001, t);
            gain.gain.exponentialRampToValueAtTime(peakVol || 0.25, t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + duration + 0.05);
        }

        function playNoise(duration, peakVol, type, freq) {
            if (GameState.muted) return;
            const ctx = getContext();
            if (!ctx) return;

            const bufferSize = ctx.sampleRate * duration;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = ctx.createBiquadFilter();
            filter.type = type || 'bandpass';
            filter.frequency.value = freq || 800;

            const gain = ctx.createGain();
            const t = ctx.currentTime;
            gain.gain.setValueAtTime(0.0001, t);
            gain.gain.exponentialRampToValueAtTime(peakVol || 0.2, t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            noise.start(t);
        }

        function startAmbientHum() {
            if (GameState.muted || ambientHumNode) return;
            const ctx = getContext();
            if (!ctx) return;

            try {
                ambientHumNode = ctx.createOscillator();
                ambientHumNode.type = 'sawtooth';
                ambientHumNode.frequency.setValueAtTime(45, ctx.currentTime);

                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(105, ctx.currentTime);

                ambientGain = ctx.createGain();
                ambientGain.gain.setValueAtTime(0.045, ctx.currentTime);

                ambientHumNode.connect(filter);
                filter.connect(ambientGain);
                ambientGain.connect(ctx.destination);
                ambientHumNode.start();
            } catch (e) { }
        }

        function stopAmbientHum() {
            if (ambientHumNode) {
                try {
                    ambientHumNode.stop();
                    ambientHumNode.disconnect();
                } catch (e) { }
                ambientHumNode = null;
            }
        }

        return {
            init() {
                getContext();
                startAmbientHum();
            },
            toggleMute() {
                GameState.muted = !GameState.muted;
                if (ambientGain) {
                    ambientGain.gain.value = GameState.muted ? 0 : 0.045;
                }
                if (DOM.btnMute) {
                    DOM.btnMute.classList.toggle('muted', GameState.muted);
                }
                return GameState.muted;
            },
            collection() {
                playTone(920, 1840, 'sine', 0.22, 0.25);
                setTimeout(() => playTone(1840, 2760, 'triangle', 0.18, 0.2), 60);
            },
            warning() {
                playNoise(0.25, 0.35, 'highpass', 1400);
                playTone(240, 70, 'sawtooth', 0.35, 0.35);
            },
            activation() {
                playTone(60, 580, 'sawtooth', 1.6, 0.45);
                playTone(120, 1160, 'sine', 1.8, 0.38);
                playNoise(1.4, 0.35, 'lowpass', 500);
                setTimeout(() => {
                    [523, 659, 784, 1046, 1318].forEach((f, idx) => {
                        setTimeout(() => playTone(f, f, 'sine', 0.8, 0.3), idx * 100);
                    });
                }, 700);
            },
            stopAll() {
                stopAmbientHum();
            }
        };
    })();

    /* ========================================================================
       4. ASSET LOADING & TEXTURES
       ======================================================================== */
    const Assets = {
        images: {
            bg: new Image(),
            drone: new Image(),
            energyCell: new Image(),
            reactorCore: new Image()
        },
        loaded: false,
        init() {
            this.images.bg.src = 'assets/images/reactor-bg.png';
            this.images.drone.src = 'assets/images/drone.png';
            this.images.energyCell.src = 'assets/images/energy-cell.png';
            this.images.reactorCore.src = 'assets/images/reactor-core.png';

            let count = 0;
            const onLoaded = () => {
                count++;
                if (count >= 4) {
                    this.loaded = true;
                }
            };
            for (let k in this.images) {
                this.images[k].onload = onLoaded;
                this.images[k].onerror = onLoaded;
            }
        }
    };

    /* ========================================================================
       5. INPUT HANDLING (Keyboard, Touch, Visibility)
       ======================================================================== */
    function setupInput() {
        window.addEventListener('keydown', (e) => {
            if (GameState.phase === 'STAGE1') {
                if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') GameState.keys.up = true;
                if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') GameState.keys.down = true;
                if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') GameState.keys.left = true;
                if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') GameState.keys.right = true;
                if (e.key === 'Shift' || e.key === ' ') {
                    GameState.keys.boost = true;
                    e.preventDefault();
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') GameState.keys.up = false;
            if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') GameState.keys.down = false;
            if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') GameState.keys.left = false;
            if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') GameState.keys.right = false;
            if (e.key === 'Shift' || e.key === ' ') GameState.keys.boost = false;
        });

        window.addEventListener('resize', () => {
            resizeCanvases();
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                GameState.isPaused = true;
            } else {
                GameState.isPaused = false;
                lastFrameTime = performance.now();
            }
        });

        // Mobile Touch Joystick
        if (DOM.joystickBase) {
            let joyTouchId = null;
            let joyCenter = { x: 0, y: 0 };
            const joyMaxRadius = 45;

            DOM.joystickBase.addEventListener('touchstart', (e) => {
                const t = e.changedTouches[0];
                joyTouchId = t.identifier;
                const rect = DOM.joystickBase.getBoundingClientRect();
                joyCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
                updateJoystick(t.clientX, t.clientY);
                e.preventDefault();
            }, { passive: false });

            window.addEventListener('touchmove', (e) => {
                if (joyTouchId === null) return;
                for (let i = 0; i < e.changedTouches.length; i++) {
                    const t = e.changedTouches[i];
                    if (t.identifier === joyTouchId) {
                        updateJoystick(t.clientX, t.clientY);
                        break;
                    }
                }
            }, { passive: false });

            const resetJoy = () => {
                joyTouchId = null;
                GameState.touch.active = false;
                GameState.touch.dx = 0;
                GameState.touch.dy = 0;
                if (DOM.joystickStick) {
                    DOM.joystickStick.style.transform = `translate(0px, 0px)`;
                }
            };

            window.addEventListener('touchend', (e) => {
                for (let i = 0; i < e.changedTouches.length; i++) {
                    if (e.changedTouches[i].identifier === joyTouchId) {
                        resetJoy();
                        break;
                    }
                }
            });
            window.addEventListener('touchcancel', resetJoy);

            function updateJoystick(cx, cy) {
                const dx = cx - joyCenter.x;
                const dy = cy - joyCenter.y;
                const dist = Math.hypot(dx, dy);
                const angle = Math.atan2(dy, dx);
                const cappedDist = Math.min(dist, joyMaxRadius);

                const sx = Math.cos(angle) * cappedDist;
                const sy = Math.sin(angle) * cappedDist;

                if (DOM.joystickStick) {
                    DOM.joystickStick.style.transform = `translate(${sx}px, ${sy}px)`;
                }

                GameState.touch.active = true;
                GameState.touch.dx = sx / joyMaxRadius;
                GameState.touch.dy = sy / joyMaxRadius;
            }
        }

        // Mobile Touch Boost button
        if (DOM.boostTouchBtn) {
            DOM.boostTouchBtn.addEventListener('touchstart', (e) => {
                GameState.touch.boost = true;
                e.preventDefault();
            }, { passive: false });
            DOM.boostTouchBtn.addEventListener('touchend', () => {
                GameState.touch.boost = false;
            });
        }
    }

    function resizeCanvases() {
        if (DOM.canvas1) {
            DOM.canvas1.width = window.innerWidth;
            DOM.canvas1.height = window.innerHeight;
        }
        if (lightCanvas) {
            lightCanvas.width = window.innerWidth;
            lightCanvas.height = window.innerHeight;
        }
    }

    /* ========================================================================
       6. STAGE 1: 2.5D DRONE FLIGHT & LIGHTING ENGINE
       ======================================================================== */
    function initStage1() {
        GameState.phase = 'STAGE1';
        GameState.stageStartTime = performance.now();
        const s1 = GameState.stage1;

        s1.hull = 100;
        s1.energyCollected = 0;
        s1.cells = [];
        s1.hazards = [];
        s1.particles = [];
        s1.lastEnergySpawn = 0;
        s1.lastHazardSpawn = 0;

        s1.drone.x = window.innerWidth / 2;
        s1.drone.y = window.innerHeight / 2 + 100;
        s1.drone.vx = 0;
        s1.drone.vy = 0;
        s1.drone.angle = 0;
        s1.drone.roll = 0;
        s1.drone.pitch = 0;
        s1.drone.boosting = false;

        for (let i = 0; i < 4; i++) {
            spawnEnergyCell();
        }
        spawnHazard();

        updateHUD();
        showToast("STAGE 01: HARVEST 10 ARC ENERGY CELLS");
    }

    function spawnEnergyCell() {
        const s1 = GameState.stage1;
        if (s1.cells.length >= CONFIG.STAGE1.MAX_ENERGY_CELLS) return;

        const padX = 140;
        const padY = 120;
        const x = padX + Math.random() * (window.innerWidth - padX * 2);
        const y = padY + Math.random() * (window.innerHeight - padY * 2);

        s1.cells.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 22,
            vy: (Math.random() - 0.5) * 22,
            baseRadius: 18,
            phaseOffset: Math.random() * Math.PI * 2,
            collected: false
        });
    }

    function spawnHazard() {
        const s1 = GameState.stage1;
        if (s1.hazards.length >= CONFIG.STAGE1.MAX_HAZARDS) return;

        const side = Math.floor(Math.random() * 4);
        let x, y, vx, vy;
        const speed = 75 + Math.random() * 55;

        if (side === 0) {
            x = Math.random() * window.innerWidth;
            y = -40;
            vx = (Math.random() - 0.5) * 40;
            vy = speed;
        } else if (side === 1) {
            x = Math.random() * window.innerWidth;
            y = window.innerHeight + 40;
            vx = (Math.random() - 0.5) * 40;
            vy = -speed;
        } else if (side === 2) {
            x = -40;
            y = Math.random() * window.innerHeight;
            vx = speed;
            vy = (Math.random() - 0.5) * 40;
        } else {
            x = window.innerWidth + 40;
            y = Math.random() * window.innerHeight;
            vx = -speed;
            vy = (Math.random() - 0.5) * 40;
        }

        s1.hazards.push({
            x,
            y,
            vx,
            vy,
            radius: 22,
            phaseOffset: Math.random() * Math.PI * 2,
            tendrils: []
        });
    }

    function updateStage1(dt) {
        const s1 = GameState.stage1;
        const d = s1.drone;
        const now = performance.now();

        // 1. Spawning
        if (now - s1.lastEnergySpawn > CONFIG.STAGE1.SPAWN_INTERVAL_ENERGY) {
            spawnEnergyCell();
            s1.lastEnergySpawn = now;
        }
        if (now - s1.lastHazardSpawn > CONFIG.STAGE1.SPAWN_INTERVAL_HAZARD) {
            spawnHazard();
            s1.lastHazardSpawn = now;
        }

        // 2. Drone Movement
        let ax = 0;
        let ay = 0;

        if (GameState.keys.left) ax -= 1;
        if (GameState.keys.right) ax += 1;
        if (GameState.keys.up) ay -= 1;
        if (GameState.keys.down) ay += 1;

        if (GameState.touch.active) {
            ax += GameState.touch.dx;
            ay += GameState.touch.dy;
        }

        const mag = Math.hypot(ax, ay);
        if (mag > 1) {
            ax /= mag;
            ay /= mag;
        }

        const isBoosting = GameState.keys.boost || GameState.touch.boost;
        d.boosting = isBoosting;

        const maxSpeed = CONFIG.STAGE1.DRONE_SPEED * (isBoosting ? CONFIG.STAGE1.DRONE_BOOST_MULT : 1.0);
        const accel = CONFIG.STAGE1.DRONE_ACCEL * (isBoosting ? 1.6 : 1.0);

        d.vx += ax * accel * dt;
        d.vy += ay * accel * dt;

        d.vx *= Math.pow(CONFIG.STAGE1.DRONE_FRICTION, dt * 60);
        d.vy *= Math.pow(CONFIG.STAGE1.DRONE_FRICTION, dt * 60);

        const currentSpeed = Math.hypot(d.vx, d.vy);
        if (currentSpeed > maxSpeed) {
            d.vx = (d.vx / currentSpeed) * maxSpeed;
            d.vy = (d.vy / currentSpeed) * maxSpeed;
        }

        d.x += d.vx * dt;
        d.y += d.vy * dt;

        // Boundaries
        const pad = d.radius + 15;
        if (d.x < pad) { d.x = pad; d.vx *= -0.5; }
        if (d.x > window.innerWidth - pad) { d.x = window.innerWidth - pad; d.vx *= -0.5; }
        if (d.y < pad + 60) { d.y = pad + 60; d.vy *= -0.5; }
        if (d.y > window.innerHeight - pad) { d.y = window.innerHeight - pad; d.vy *= -0.5; }

        // 3D Banking & Pitch Physics
        if (currentSpeed > 10) {
            const targetAngle = Math.atan2(d.vy, d.vx) + Math.PI / 2;
            let diff = targetAngle - d.angle;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            d.angle += diff * 11 * dt;
        }

        const targetRoll = Math.max(-0.4, Math.min(0.4, -d.vx * 0.0008));
        d.roll += (targetRoll - d.roll) * 12 * dt;

        const targetPitch = Math.max(-0.25, Math.min(0.25, d.vy * 0.0006));
        d.pitch += (targetPitch - d.pitch) * 12 * dt;

        // Thruster exhaust particles
        if (currentSpeed > 15 || isBoosting) {
            const emitRate = isBoosting ? 5 : 2;
            for (let i = 0; i < emitRate; i++) {
                const spread = (Math.random() - 0.5) * 0.35;
                const pSpeed = 80 + Math.random() * 110;
                s1.particles.push({
                    x: d.x - Math.cos(d.angle - Math.PI / 2) * 24 + (Math.random() - 0.5) * 8,
                    y: d.y - Math.sin(d.angle - Math.PI / 2) * 24 + (Math.random() - 0.5) * 8,
                    vx: -Math.cos(d.angle - Math.PI / 2 + spread) * pSpeed,
                    vy: -Math.sin(d.angle - Math.PI / 2 + spread) * pSpeed,
                    color: isBoosting ? '#ffd54f' : '#00e5ff',
                    radius: isBoosting ? 5.5 : 3.5,
                    alpha: 1.0,
                    life: 0.38
                });
            }
        }

        // 3. Update Energy Cells & Magnetism
        let closestDist = Infinity;
        for (let i = s1.cells.length - 1; i >= 0; i--) {
            const c = s1.cells[i];
            c.x += c.vx * dt;
            c.y += c.vy * dt;

            if (c.x < 100 || c.x > window.innerWidth - 100) c.vx *= -1;
            if (c.y < 100 || c.y > window.innerHeight - 100) c.vy *= -1;

            const dist = Math.hypot(d.x - c.x, d.y - c.y);
            if (dist < closestDist) closestDist = dist;

            if (dist < CONFIG.STAGE1.MAGNETIC_RANGE) {
                const pull = (1 - dist / CONFIG.STAGE1.MAGNETIC_RANGE) * CONFIG.STAGE1.MAGNETIC_PULL;
                const angle = Math.atan2(d.y - c.y, d.x - c.x);
                c.x += Math.cos(angle) * pull * dt;
                c.y += Math.sin(angle) * pull * dt;
            }

            if (dist < d.radius + c.baseRadius) {
                s1.cells.splice(i, 1);
                s1.energyCollected++;
                Sound.collection();

                for (let p = 0; p < 22; p++) {
                    const ang = Math.random() * Math.PI * 2;
                    const spd = 90 + Math.random() * 190;
                    s1.particles.push({
                        x: c.x,
                        y: c.y,
                        vx: Math.cos(ang) * spd,
                        vy: Math.sin(ang) * spd,
                        color: Math.random() > 0.3 ? '#00e5ff' : '#ffffff',
                        radius: 4 + Math.random() * 3.5,
                        alpha: 1.0,
                        life: 0.6
                    });
                }

                updateHUD();

                if (s1.energyCollected >= CONFIG.STAGE1.TARGET_CELLS) {
                    onStage1Complete();
                    return;
                }
            }
        }

        // 4. Update Hazards & Lightning Tendrils
        for (let i = s1.hazards.length - 1; i >= 0; i--) {
            const h = s1.hazards[i];
            h.x += h.vx * dt;
            h.y += h.vy * dt;

            if (h.x < -100 || h.x > window.innerWidth + 100 || h.y < -100 || h.y > window.innerHeight + 100) {
                s1.hazards.splice(i, 1);
                continue;
            }

            // Generate lightning tendrils
            h.tendrils = [];
            const numTendrils = 4;
            for (let t = 0; t < numTendrils; t++) {
                const tAng = Math.random() * Math.PI * 2;
                const tLen = h.radius * (1.2 + Math.random() * 1.5);
                h.tendrils.push({
                    x1: h.x,
                    y1: h.y,
                    x2: h.x + Math.cos(tAng) * tLen,
                    y2: h.y + Math.sin(tAng) * tLen
                });
            }

            const dist = Math.hypot(d.x - h.x, d.y - h.y);
            if (dist < d.radius + h.radius) {
                s1.hull -= CONFIG.STAGE1.HAZARD_DAMAGE;
                Sound.warning();
                s1.hazards.splice(i, 1);

                for (let p = 0; p < 28; p++) {
                    const ang = Math.random() * Math.PI * 2;
                    const spd = 140 + Math.random() * 240;
                    s1.particles.push({
                        x: d.x,
                        y: d.y,
                        vx: Math.cos(ang) * spd,
                        vy: Math.sin(ang) * spd,
                        color: '#ff3344',
                        radius: 4.5 + Math.random() * 4.5,
                        alpha: 1.0,
                        life: 0.65
                    });
                }

                updateHUD();

                if (s1.hull <= 0) {
                    s1.hull = 0;
                    onStage1Failed();
                    return;
                }
            }
        }

        // 5. Update FX Particles
        for (let i = s1.particles.length - 1; i >= 0; i--) {
            const p = s1.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            p.alpha = Math.max(0, p.life / 0.6);
            if (p.life <= 0) {
                s1.particles.splice(i, 1);
            }
        }

        // 6. Update Tactical Telemetry
        if (DOM.targetRangefinder) {
            if (closestDist < Infinity) {
                DOM.targetRangefinder.textContent = `TARGET ARC CELL: ${(closestDist * 0.1).toFixed(1)}m`;
            } else {
                DOM.targetRangefinder.textContent = `SCANNING ARC CELLS...`;
            }
        }
        if (DOM.flightSpeed) {
            const thrustPct = Math.round((currentSpeed / maxSpeed) * 100);
            DOM.flightSpeed.textContent = `THRUST: ${thrustPct}%`;
        }
        if (DOM.gForceMeter) {
            const g = (1.0 + (currentSpeed / maxSpeed) * 1.8).toFixed(1);
            DOM.gForceMeter.textContent = `G-LOAD: ${g}G`;
        }
        if (DOM.hazardProximity) {
            DOM.hazardProximity.textContent = `ANOMALIES: ${s1.hazards.length} ACTIVE`;
            DOM.hazardProximity.style.color = s1.hazards.length > 2 ? '#ff3344' : '#8da4be';
        }
    }

    /* --- Procedural Lightning Drawing Helper --- */
    function drawJaggedLightning(ctx, x1, y1, x2, y2, color, width) {
        const dist = Math.hypot(x2 - x1, y2 - y1);
        const steps = Math.max(3, Math.floor(dist / 12));
        ctx.strokeStyle = color || '#ff5252';
        ctx.shadowColor = color || '#ff1744';
        ctx.shadowBlur = 10;
        ctx.lineWidth = width || 2;

        ctx.beginPath();
        ctx.moveTo(x1, y1);

        let curX = x1;
        let curY = y1;
        for (let s = 1; s < steps; s++) {
            const t = s / steps;
            const baseX = x1 + (x2 - x1) * t;
            const baseY = y1 + (y2 - y1) * t;
            const normalX = -(y2 - y1) / dist;
            const normalY = (x2 - x1) / dist;
            const offset = (Math.random() - 0.5) * 18;

            curX = baseX + normalX * offset;
            curY = baseY + normalY * offset;
            ctx.lineTo(curX, curY);
        }
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    function renderStage1() {
        const ctx = DOM.ctx1;
        if (!ctx) return;
        const w = DOM.canvas1.width;
        const h = DOM.canvas1.height;
        const s1 = GameState.stage1;
        const d = s1.drone;
        const time = performance.now() * 0.001;

        ctx.clearRect(0, 0, w, h);

        // 1. Draw 2.5D Background
        if (Assets.loaded && Assets.images.bg.complete) {
            const parallaxX = (d.x - w / 2) * 0.04;
            const parallaxY = (d.y - h / 2) * 0.04;
            ctx.drawImage(Assets.images.bg, -25 + parallaxX, -25 + parallaxY, w + 50, h + 50);
        }

        // 2. Central High-Energy Radiant Arc Core (Quantum Fusion Silo)
        const coreX = w / 2;
        const coreY = h / 2;
        const coreSize = Math.min(w, h) * 0.44;

        ctx.save();
        ctx.translate(coreX, coreY);
        ctx.rotate(time * 0.12);
        if (Assets.loaded && Assets.images.reactorCore.complete) {
            // Blinding core radiance layer
            ctx.shadowColor = '#00e5ff';
            ctx.shadowBlur = 40 + Math.sin(time * 3) * 15;
            ctx.globalAlpha = 0.75 + Math.sin(time * 2.5) * 0.18;
            ctx.drawImage(Assets.images.reactorCore, -coreSize / 2, -coreSize / 2, coreSize, coreSize);
        }
        ctx.restore();

        // 3. Render Energy Cells
        s1.cells.forEach(c => {
            const bob = Math.sin(time * 4.5 + c.phaseOffset) * 7;
            ctx.save();
            ctx.translate(c.x, c.y + bob);

            if (Assets.loaded && Assets.images.energyCell.complete) {
                const s = c.baseRadius * 3.0;
                ctx.drawImage(Assets.images.energyCell, -s / 2, -s / 2, s, s);
            }
            ctx.restore();
        });

        // 4. Render Procedural Electric Lightning Hazards
        s1.hazards.forEach(hz => {
            const pulse = 1 + Math.sin(time * 9 + hz.phaseOffset) * 0.22;
            ctx.save();

            ctx.shadowColor = '#ff1744';
            ctx.shadowBlur = 24;
            ctx.fillStyle = '#ff1744';
            ctx.beginPath();
            ctx.arc(hz.x, hz.y, hz.radius * pulse, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(hz.x, hz.y, hz.radius * 0.45, 0, Math.PI * 2);
            ctx.fill();

            if (hz.tendrils) {
                hz.tendrils.forEach(t => {
                    drawJaggedLightning(ctx, t.x1, t.y1, t.x2, t.y2, '#ff6b81', 2.5);
                });
            }

            ctx.restore();
        });

        // 5. Render FX Particles
        s1.particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // 6. Render 3D Drone with Banking & Tilt
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.angle);

        ctx.transform(1, d.roll, d.pitch, 1, 0, 0);

        if (Assets.loaded && Assets.images.drone.complete) {
            const s = d.radius * 3.0;
            ctx.drawImage(Assets.images.drone, -s / 2, -s / 2, s, s);
        }

        ctx.strokeStyle = d.boosting ? 'rgba(255, 213, 79, 0.85)' : 'rgba(0, 229, 255, 0.45)';
        ctx.shadowColor = d.boosting ? '#ffd54f' : '#00e5ff';
        ctx.shadowBlur = 12;
        ctx.lineWidth = d.boosting ? 3.5 : 2;
        ctx.beginPath();
        ctx.arc(0, 0, d.radius + 6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();

        // 7. Dynamic Lighting Pass (Conical Headlight & Repulsor Illumination)
        if (lightCtx) {
            lightCtx.clearRect(0, 0, w, h);

            lightCtx.fillStyle = 'rgba(3, 7, 14, 0.6)';
            lightCtx.fillRect(0, 0, w, h);

            lightCtx.save();
            lightCtx.globalCompositeOperation = 'destination-out';

            const headAngle = d.angle - Math.PI / 2;
            const beamDist = 340;
            const beamSpread = 0.45;

            const grad = lightCtx.createRadialGradient(d.x, d.y, 10, d.x, d.y, beamDist);
            grad.addColorStop(0, 'rgba(0,0,0, 0.95)');
            grad.addColorStop(0.5, 'rgba(0,0,0, 0.65)');
            grad.addColorStop(1, 'rgba(0,0,0, 0)');

            lightCtx.fillStyle = grad;
            lightCtx.beginPath();
            lightCtx.moveTo(d.x, d.y);
            lightCtx.arc(d.x, d.y, beamDist, headAngle - beamSpread, headAngle + beamSpread);
            lightCtx.closePath();
            lightCtx.fill();

            const repGrad = lightCtx.createRadialGradient(d.x, d.y, 5, d.x, d.y, d.radius * 3.8);
            repGrad.addColorStop(0, 'rgba(0,0,0, 0.88)');
            repGrad.addColorStop(1, 'rgba(0,0,0, 0)');
            lightCtx.fillStyle = repGrad;
            lightCtx.beginPath();
            lightCtx.arc(d.x, d.y, d.radius * 3.8, 0, Math.PI * 2);
            lightCtx.fill();

            s1.cells.forEach(c => {
                const cGrad = lightCtx.createRadialGradient(c.x, c.y, 5, c.x, c.y, 90);
                cGrad.addColorStop(0, 'rgba(0,0,0, 0.75)');
                cGrad.addColorStop(1, 'rgba(0,0,0, 0)');
                lightCtx.fillStyle = cGrad;
                lightCtx.beginPath();
                lightCtx.arc(c.x, c.y, 90, 0, Math.PI * 2);
                lightCtx.fill();
            });

            lightCtx.restore();

            ctx.drawImage(lightCanvas, 0, 0);
        }
    }

    function updateHUD() {
        const s1 = GameState.stage1;
        if (DOM.hullBar) {
            DOM.hullBar.style.width = `${s1.hull}%`;
            DOM.hullBar.className = s1.hull > 30 ? 'meter-fill green' : 'meter-fill warn';
        }
        if (DOM.hullVal) {
            DOM.hullVal.textContent = `${Math.round(s1.hull)}%`;
        }
        if (DOM.energyBar) {
            const pct = Math.min(100, Math.round((s1.energyCollected / CONFIG.STAGE1.TARGET_CELLS) * 100));
            DOM.energyBar.style.width = `${pct}%`;
        }
        if (DOM.energyVal) {
            const pct = Math.min(100, Math.round((s1.energyCollected / CONFIG.STAGE1.TARGET_CELLS) * 100));
            DOM.energyVal.textContent = `${s1.energyCollected} / ${CONFIG.STAGE1.TARGET_CELLS} CELLS (${pct}%)`;
        }
    }

    function onStage1Complete() {
        GameState.phase = 'ACTIVATION';
        if (DOM.stage1HUD) DOM.stage1HUD.classList.add('hidden');
        if (DOM.activationFX) DOM.activationFX.classList.remove('hidden');

        showToast("ENERGY MATRIX HARVESTED! INITIATING QUANTUM RESTORATION...", 3200);
        Sound.activation();

        setTimeout(() => {
            onFinalVictory();
        }, 3200);
    }

    function onStage1Failed() {
        GameState.phase = 'FAILED_STAGE1';
        if (DOM.screenFail1) DOM.screenFail1.classList.remove('hidden');
    }

    /* ========================================================================
       7. FINAL VICTORY & SEQUENCE COMPLETION
       ======================================================================== */
    function onFinalVictory() {
        GameState.phase = 'VICTORY';
        if (DOM.activationFX) DOM.activationFX.classList.add('hidden');
        if (DOM.screenVictory) DOM.screenVictory.classList.remove('hidden');

        const elapsed = (performance.now() - GameState.totalElapsedTime) * 0.001;
        if (DOM.vStatTime) DOM.vStatTime.textContent = `${elapsed.toFixed(1)}s`;
        if (DOM.vStatEnergy) DOM.vStatEnergy.textContent = `${GameState.stage1.energyCollected} / ${CONFIG.STAGE1.TARGET_CELLS} (100%)`;

        try {
            window.parent.postMessage({
                type: 'ARC_REACTOR_RESTORED',
                elapsedTime: elapsed,
                source: 'arc-reactor-game'
            }, '*');
        } catch (e) { }
    }

    /* ========================================================================
       8. RETRY & RESET HANDLERS
       ======================================================================== */
    function retryStage1() {
        if (DOM.screenFail1) DOM.screenFail1.classList.add('hidden');
        initStage1();
    }

    function resetAllGameProgress() {
        GameState.phase = 'BOOT';
        GameState.isPaused = false;
        GameState.totalElapsedTime = performance.now();

        GameState.stage1.cells = [];
        GameState.stage1.hazards = [];
        GameState.stage1.particles = [];

        if (DOM.screenStart) DOM.screenStart.classList.remove('hidden');
        if (DOM.screenFail1) DOM.screenFail1.classList.add('hidden');
        if (DOM.screenVictory) DOM.screenVictory.classList.add('hidden');
        if (DOM.activationFX) DOM.activationFX.classList.add('hidden');
        if (DOM.stage1HUD) DOM.stage1HUD.classList.add('hidden');
    }

    function showToast(text, duration) {
        if (!DOM.hudToast) return;
        DOM.hudToast.textContent = text;
        DOM.hudToast.classList.remove('hidden');
        DOM.hudToast.style.opacity = '1';

        setTimeout(() => {
            if (DOM.hudToast) {
                DOM.hudToast.style.opacity = '0';
                setTimeout(() => DOM.hudToast.classList.add('hidden'), 300);
            }
        }, duration || 2400);
    }

    /* ========================================================================
       9. MASTER GAME LOOP (requestAnimationFrame)
       ======================================================================== */
    let lastFrameTime = performance.now();
    let animFrameId = null;

    function gameLoop(now) {
        animFrameId = requestAnimationFrame(gameLoop);

        const dt = Math.min(0.1, (now - lastFrameTime) * 0.001);
        lastFrameTime = now;

        if (GameState.isPaused) return;

        if (GameState.phase === 'STAGE1') {
            updateStage1(dt);
            renderStage1();
        } else if (GameState.phase === 'ACTIVATION') {
            // Keep background reactor spinning smoothly during the activation flare!
            renderStage1();
        }
    }

    /* ========================================================================
       10. INITIALIZATION & BINDINGS
       ======================================================================== */
    function init() {
        cacheDOM();
        Assets.init();
        setupInput();
        resizeCanvases();

        if (DOM.btnStart) {
            DOM.btnStart.addEventListener('click', () => {
                Sound.init();
                if (DOM.screenStart) DOM.screenStart.classList.add('hidden');
                if (DOM.stage1HUD) DOM.stage1HUD.classList.remove('hidden');
                GameState.totalElapsedTime = performance.now();
                initStage1();
            });
        }

        if (DOM.btnRetry1) DOM.btnRetry1.addEventListener('click', retryStage1);
        if (DOM.btnRestartAll1) DOM.btnRestartAll1.addEventListener('click', resetAllGameProgress);
        if (DOM.btnPlayAgain) DOM.btnPlayAgain.addEventListener('click', resetAllGameProgress);

        if (DOM.btnContinueDiag) {
            DOM.btnContinueDiag.addEventListener('click', () => {
                try {
                    window.parent.postMessage({
                        type: 'PROCEED_TO_LIFE_SUPPORT_DIAGNOSTICS',
                        source: 'arc-reactor-game'
                    }, '*');
                } catch (e) { }
            });
        }

        if (DOM.btnMute) {
            DOM.btnMute.addEventListener('click', () => {
                Sound.toggleMute();
            });
        }

        if (animFrameId) cancelAnimationFrame(animFrameId);
        lastFrameTime = performance.now();
        animFrameId = requestAnimationFrame(gameLoop);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.ArcReactorGame = {
        GameState,
        CONFIG,
        Sound,
        initStage1,
        resetAllGameProgress,
        onFinalVictory
    };

})();
