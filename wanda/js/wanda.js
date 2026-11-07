/**
 * WANDA – THE PORTAL AWAKENING
 * Wanda Maximoff Character Controller
 */

class WandaController {
  constructor() {
    this.container = document.getElementById('wanda-container');
    this.aura = document.querySelector('.wanda-aura');
    this.crestHalo = document.querySelector('.wanda-crest-svg');
    this.leftHand = document.querySelector('.hand-flare.left-hand');
    this.rightHand = document.querySelector('.hand-flare.right-hand');
  }

  // Get current screen coordinates of Wanda's hands
  getHandPositions() {
    if (!this.container) return { left: { x: 0, y: 0 }, right: { x: 0, y: 0 }, center: { x: 0, y: 0 } };
    const rect = this.container.getBoundingClientRect();
    return {
      left: {
        x: rect.left + rect.width * 0.12,
        y: rect.top + rect.height * 0.74
      },
      right: {
        x: rect.left + rect.width * 0.88,
        y: rect.top + rect.height * 0.74
      },
      center: {
        x: rect.left + rect.width * 0.5,
        y: rect.top + rect.height * 0.40
      }
    };
  }

  // Flare up Wanda's magical aura when casting or channeling
  setEnergyIntensity(multiplier = 1.0) {
    if (!this.aura) return;
    const blur = 25 * multiplier;
    const scale = 1.0 + (multiplier - 1.0) * 0.25;
    this.aura.style.filter = `blur(${blur}px)`;
    this.aura.style.transform = `scale(${scale}) translateZ(-20px)`;

    if (this.crestHalo) {
      if (multiplier >= 1.8) {
        this.crestHalo.classList.add('crest-energized');
      } else {
        this.crestHalo.classList.remove('crest-energized');
      }
    }
  }

  // Phase 6: Transcendent Levitation Ascension into Portal
  ascendIntoPortal(callback) {
    if (!this.container) return;

    this.container.classList.remove('wanda-floating');
    this.setEnergyIntensity(2.8);

    // Initial ascension surge
    this.container.style.transform = 'translateY(-20px) translateZ(40px) scale(1.05)';

    setTimeout(() => {
      // Ascend directly into the portal vortex while dissolving
      this.container.classList.add('wanda-ascend-portal');
      if (callback) {
        setTimeout(callback, 2200);
      }
    }, 600);
  }

  // Backward compatibility alias for transitionToStanding
  transitionToStanding(callback) {
    this.ascendIntoPortal(callback);
  }

  // Turn towards portal
  turnTowardsPortal(callback) {
    if (callback) callback();
  }

  // Walk into portal and dissolve
  walkIntoPortal(callback) {
    if (callback) callback();
  }

  // Reset to initial meditation state
  reset() {
    if (!this.container) return;
    this.container.className = 'wanda-floating';
    this.container.style.transform = '';
    this.container.style.opacity = '1';
    this.container.style.filter = '';
    if (this.crestHalo) {
      this.crestHalo.classList.remove('crest-energized');
    }
    this.setEnergyIntensity(1.0);
  }
}

window.Wanda = new WandaController();

