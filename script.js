/* ============================================================
   script.js — For Ash ❤️
   Handles: loading countdown, screen transitions, scroll
   animations, typing effects, AI meter, confetti,
   floating hearts particle system, progress tracking.
   ============================================================ */

'use strict';

// ── State ───────────────────────────────────────────────────
const state = {
  currentSection: 0,      // 0=loading 1=welcome 2=cards 3=ai 4=letter 5=final
  cardsOutroStarted: false,
  aiStarted: false,
  finalAnimStarted: false,
};

// ── DOM refs ─────────────────────────────────────────────────
const screens = {
  loading:  document.getElementById('loading-screen'),
  welcome:  document.getElementById('welcome-screen'),
  cards:    document.getElementById('cards-screen'),
  ai:       document.getElementById('ai-screen'),
  letter:   document.getElementById('letter-screen'),
  final:    document.getElementById('final-screen'),
};

const progressBar    = document.getElementById('progress-bar');
const progressCont   = document.getElementById('progress-bar-container');
const progressSteps  = document.querySelectorAll('.step');
const countdownEl    = document.getElementById('countdown');
const handwrittenEl  = document.getElementById('handwritten-text');
const startBtn       = document.getElementById('start-btn');
const cardsContainer = document.getElementById('cards-container');
const cardsOutro     = document.getElementById('cards-outro');
const cardsOutroText = document.getElementById('cards-outro-text');
const cardsContinue  = document.getElementById('cards-continue-btn');
const meterFill      = document.getElementById('meter-fill');
const meterPercent   = document.getElementById('meter-percent');
const meterError     = document.getElementById('meter-error');
const aiContinueBtn  = document.getElementById('ai-continue-btn');
const forgiveBtn     = document.getElementById('forgive-btn');
const alwaysBtn      = document.getElementById('always-btn');
const finalLines     = document.querySelectorAll('.final-line');
const finalMessage   = document.getElementById('final-message');
const confettiCanvas = document.getElementById('confetti-canvas');
const particleCanvas = document.getElementById('particle-canvas');

// ── Progress mapping ──────────────────────────────────────
const sectionProgress = [0, 0, 25, 50, 75, 100];

function setProgress(section) {
  const pct = sectionProgress[section] || 0;
  progressBar.style.width = pct + '%';
  progressSteps.forEach((s, i) => {
    s.classList.toggle('done', i < section);
  });
  if (section > 0) progressCont.classList.add('visible');
}

// ── Screen transition ─────────────────────────────────────
function goTo(targetId) {
  const sectionNames = {
    'welcome-screen':  'welcome',
    'cards-screen':    'cards',
    'ai-screen':       'forgiveness_meter',
    'letter-screen':   'letter',
    'final-screen':    'final',
  };
  if (sectionNames[targetId]) {
    trackEvent('section_reached', { section: sectionNames[targetId], message: `Ash reached: ${sectionNames[targetId]}` });
  }
  const current = document.querySelector('.screen.active');
  if (current) {
    current.classList.add('exit');
    current.classList.remove('active');
    setTimeout(() => current.classList.remove('exit'), 500);
  }
  const next = document.getElementById(targetId);
  if (!next) return;
  setTimeout(() => {
    next.classList.add('active');
    next.scrollTop = 0;
  }, 350);
}

// ══════════════════════════════════════════════════════════
// SECTION 1 — LOADING
// ══════════════════════════════════════════════════════════
function runLoading() {
  let count = 5;
  countdownEl.textContent = count;

  const tick = setInterval(() => {
    count--;
    if (count > 0) {
      countdownEl.style.animation = 'none';
      void countdownEl.offsetWidth; // reflow
      countdownEl.style.animation = 'pulse-num 1s ease-in-out';
      countdownEl.textContent = count;
    } else {
      clearInterval(tick);
      // Fade loading out → show welcome
      setTimeout(() => {
        state.currentSection = 1;
        setProgress(1);
        goTo('welcome-screen');
        setTimeout(runWelcome, 500);
      }, 400);
    }
  }, 1000);
}

// ══════════════════════════════════════════════════════════
// SECTION 2 — WELCOME
// ══════════════════════════════════════════════════════════
function runWelcome() {
  const msg = 'Thank you for giving me a moment of your time.';
  typeText(handwrittenEl, msg, 46, () => {
    handwrittenEl.classList.add('done');
  });
}

startBtn.addEventListener('click', () => {
  trackEvent('button_clicked', { button: 'read_my_heart', section: 'welcome', message: 'Ash clicked Read My Heart' });
  sendNotif('🌹 She clicked Read My Heart', 'Ash is now reading your heart cards...', 'default');
  state.currentSection = 2;
  setProgress(2);
  goTo('cards-screen');
  setTimeout(initCards, 500);
});

// ══════════════════════════════════════════════════════════
// SECTION 3 — HEART CARDS
// ══════════════════════════════════════════════════════════
const msgCards = document.querySelectorAll('.msg-card');

function initCards() {
  // Find the true last index dynamically
  const lastIndex = Math.max(...Array.from(msgCards).map(c => parseInt(c.dataset.index)));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
        const idx = parseInt(entry.target.dataset.index);
        if (idx === lastIndex && !state.cardsOutroStarted) {
          state.cardsOutroStarted = true;
          setTimeout(showCardsOutro, 700);
        }
      }
    });
  }, { threshold: 0.25, rootMargin: '0px 0px -40px 0px', root: screens.cards });

  msgCards.forEach(card => observer.observe(card));

  // Trigger first few immediately if already in view
  setTimeout(() => {
    msgCards.forEach(card => {
      const rect = card.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        card.classList.add('visible');
      }
    });
  }, 200);
}

function showCardsOutro() {
  cardsOutro.classList.remove('hidden');
  const text = `I am really sorry for hurting you. I love you more than anything in this world. Aroju aa situation lo emi cheyalo teliyaka ala adiganu, but that doesn't change the fact that I hurt you, and I'm truly sorry for that.\n\nThe thing that hurts me the most is knowing that the person I love the most had to feel pain because of me. You never deserved that. If I could go back and change that moment, I would without thinking twice.\n\nPlease forgive me na babuuu. 🥺❤️ I know I can't undo what happened, but I promise I'll learn from my mistakes and make it up to you with my actions, not just my words. No matter what, my love for you has never changed and never will.`;
  typeText(cardsOutroText, text, 28);
}

cardsContinue.addEventListener('click', () => {
  trackEvent('button_clicked', { button: 'one_more_thing', section: 'cards', message: 'Ash read all cards and continued' });
  sendNotif('📜 She read all 9 cards!', 'Ash finished the heart cards and is continuing...', 'default');
  state.currentSection = 3;
  setProgress(3);
  goTo('ai-screen');
  setTimeout(runAIMeter, 600);
});

// ══════════════════════════════════════════════════════════
// SECTION 4 — AI FORGIVENESS METER
// ══════════════════════════════════════════════════════════
const meterSteps = [0, 8, 19, 31, 47, 64, 82, 95, 100, 112, 128, 145, 163, 180];

function runAIMeter() {
  if (state.aiStarted) return;
  state.aiStarted = true;

  let stepIdx = 0;

  function nextStep() {
    if (stepIdx >= meterSteps.length) {
      // Show ??? then trigger glitch
      meterPercent.textContent = '???';
      meterPercent.style.background = 'linear-gradient(135deg, #e84040, #e8779c, #1e6ec8)';
      meterPercent.style.webkitBackgroundClip = 'text';
      meterPercent.style.backgroundClip = 'text';
      setTimeout(showMeterGlitch, 700);
      return;
    }
    const pct = meterSteps[stepIdx];
    // Cap bar width at 100% visually but keep going
    const barWidth = Math.min(pct, 100);
    meterFill.style.width = barWidth + '%';

    // Once past 100, bar glows red and shakes
    if (pct > 100) {
      meterFill.style.background = 'linear-gradient(90deg, #e84040, #e8779c, #5aa3f0, #e84040)';
      meterFill.style.backgroundSize = '200% 100%';
      meterFill.style.animation = 'overflow-pulse 0.4s ease-in-out infinite alternate';
      meterPercent.textContent = pct + '%';
      meterPercent.style.color = '#e84040';
      meterPercent.style.background = 'none';
      meterPercent.style.webkitTextFillColor = '#e84040';
    } else {
      meterFill.style.width = pct + '%';
      meterPercent.textContent = pct + '%';
    }

    stepIdx++;
    const delay = pct < 100 ? (stepIdx < 4 ? 400 : stepIdx < 7 ? 300 : 250) : 220;
    setTimeout(nextStep, delay);
  }

  nextStep();
}

function showMeterGlitch() {
  const struggling   = document.getElementById('meter-struggling');
  const errorLines   = document.getElementById('error-lines');
  const brokenMeter  = document.getElementById('broken-meter');
  const reasonBlock  = document.getElementById('error-reason-block');
  const diagCards    = document.getElementById('diag-cards');

  // Step 1: show struggling spinner (already visible via meter-error reveal)
  meterError.classList.remove('hidden');

  // Step 2: after struggle, show glitch errors
  setTimeout(() => {
    struggling.style.transition = 'opacity 0.3s';
    struggling.style.opacity = '0';
    setTimeout(() => {
      struggling.classList.add('hidden');
      errorLines.classList.remove('hidden');
      brokenMeter.classList.remove('hidden');
    }, 300);
  }, 1400);

  // Step 3: glitch fades, reason appears
  setTimeout(() => {
    errorLines.style.transition = 'opacity 0.3s';
    errorLines.style.opacity = '0';
    setTimeout(() => {
      errorLines.classList.add('hidden');
      reasonBlock.classList.remove('hidden');
    }, 300);
  }, 3000);

  // Step 4: diagnostic cards slide in
  setTimeout(() => {
    diagCards.classList.remove('hidden');
  }, 4000);

  // Step 5: continue button
  setTimeout(() => {
    aiContinueBtn.classList.remove('hidden');
  }, 5000);
}

aiContinueBtn.addEventListener('click', () => {
  trackEvent('button_clicked', { button: 'i_love_you', section: 'forgiveness_meter', message: 'Ash saw the forgiveness meter and continued' });
  sendNotif('🔬 She saw the Forgiveness Meter!', 'Ash is now reading your letter...', 'default');
  state.currentSection = 4;
  setProgress(4);
  goTo('letter-screen');
});

// ══════════════════════════════════════════════════════════
// SECTION 5 — LETTER
// ══════════════════════════════════════════════════════════
forgiveBtn.addEventListener('click', () => {
  trackEvent('button_clicked', { button: 'accept_bribe_forgive', section: 'letter', message: 'Ash read the letter and accepted the bribe' });
  sendNotif('🍫 She accepted the bribe!', 'Ash read your letter and is heading to the final screen...', 'default');
  state.currentSection = 5;
  setProgress(5);
  goTo('final-screen');
  setTimeout(runFinalScreen, 500);
});

// ══════════════════════════════════════════════════════════
// SECTION 6 — FINAL
// ══════════════════════════════════════════════════════════
function runFinalScreen() {
  if (state.finalAnimStarted) return;
  state.finalAnimStarted = true;

  finalLines.forEach((line, i) => {
    const delay = parseInt(line.dataset.delay) + 400;
    setTimeout(() => {
      line.classList.remove('hidden');
      requestAnimationFrame(() => requestAnimationFrame(() => line.classList.add('show')));
    }, delay);
  });

  // Show always button after all lines
  setTimeout(() => {
    alwaysBtn.classList.remove('hidden');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      alwaysBtn.style.opacity = '0';
      alwaysBtn.style.transform = 'translateY(16px)';
      alwaysBtn.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      requestAnimationFrame(() => {
        alwaysBtn.style.opacity = '1';
        alwaysBtn.style.transform = 'translateY(0)';
      });
    }));
  }, 2800);
}

alwaysBtn.addEventListener('click', () => {
  trackEvent('message_read_completely', { button: 'always_yours', section: 'final', message: '💌 Ash read the entire message completely' });
  sendNotif('💌 She read everything!', 'Ash clicked Always Yours ❤️ — your entire message was read completely. Now wait for her reply 🥺', 'urgent');
  launchConfetti();
  burstHearts();
  setTimeout(() => {
    finalMessage.classList.remove('hidden');
    requestAnimationFrame(() => requestAnimationFrame(() => finalMessage.classList.add('show')));
  }, 600);
  // Scroll into view
  setTimeout(() => {
    finalMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 700);
});

// ══════════════════════════════════════════════════════════
// TYPING ANIMATION
// ══════════════════════════════════════════════════════════
function typeText(el, text, speed = 40, callback) {
  el.textContent = '';
  let i = 0;
  function tick() {
    if (i < text.length) {
      el.textContent += text[i];
      i++;
      setTimeout(tick, speed);
    } else if (callback) {
      callback();
    }
  }
  tick();
}

// ══════════════════════════════════════════════════════════
// FLOATING HEART PARTICLES
// ══════════════════════════════════════════════════════════
const pCtx = particleCanvas.getContext('2d');
const particles = [];
const PARTICLE_COUNT = 22;

function resizeParticleCanvas() {
  particleCanvas.width  = window.innerWidth;
  particleCanvas.height = window.innerHeight;
}

const HEARTS   = ['❤️', '💙', '💜', '🩷', '✨', '🌸', '💫'];
const SIZES    = [12, 14, 16, 18, 10];
const SPEEDS   = [0.4, 0.6, 0.8, 0.5, 0.7];

function createParticle() {
  return {
    x:       Math.random() * window.innerWidth,
    y:       window.innerHeight + 20,
    size:    SIZES[Math.floor(Math.random() * SIZES.length)],
    speed:   SPEEDS[Math.floor(Math.random() * SPEEDS.length)],
    drift:   (Math.random() - 0.5) * 0.6,
    opacity: Math.random() * 0.5 + 0.3,
    symbol:  HEARTS[Math.floor(Math.random() * HEARTS.length)],
    wobble:  Math.random() * Math.PI * 2,
    wobbleSpeed: 0.02 + Math.random() * 0.02,
  };
}

for (let i = 0; i < PARTICLE_COUNT; i++) {
  const p = createParticle();
  p.y = Math.random() * window.innerHeight;  // distribute initially
  particles.push(p);
}

function animateParticles() {
  pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

  particles.forEach((p, idx) => {
    p.y -= p.speed;
    p.wobble += p.wobbleSpeed;
    p.x += p.drift + Math.sin(p.wobble) * 0.5;

    pCtx.globalAlpha = p.opacity;
    pCtx.font = `${p.size}px serif`;
    pCtx.fillText(p.symbol, p.x, p.y);

    if (p.y < -30) {
      particles[idx] = createParticle();
    }
  });

  pCtx.globalAlpha = 1;
  requestAnimationFrame(animateParticles);
}

// ══════════════════════════════════════════════════════════
// CONFETTI
// ══════════════════════════════════════════════════════════
const cCtx = confettiCanvas.getContext('2d');
let confettiPieces = [];
let confettiActive = false;

function resizeConfettiCanvas() {
  confettiCanvas.width  = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}

const confettiColors = [
  '#f7a8c4', '#6ab0f5', '#c9b8e8', '#fde8f0',
  '#e8779c', '#3a82d4', '#9a7fc7', '#ffffff',
];

function createConfettiPiece() {
  return {
    x:     Math.random() * window.innerWidth,
    y:     -10,
    w:     6 + Math.random() * 6,
    h:     10 + Math.random() * 8,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    vy:    2 + Math.random() * 4,
    vx:    (Math.random() - 0.5) * 4,
    rot:   Math.random() * Math.PI * 2,
    rotV:  (Math.random() - 0.5) * 0.2,
    alpha: 1,
  };
}

function launchConfetti() {
  confettiActive = true;
  confettiPieces = [];
  for (let i = 0; i < 160; i++) {
    const p = createConfettiPiece();
    p.y = -Math.random() * 300; // stagger launch
    confettiPieces.push(p);
  }
  animateConfetti();
}

function animateConfetti() {
  if (!confettiActive) return;
  cCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  let alive = 0;
  confettiPieces.forEach(p => {
    p.y  += p.vy;
    p.x  += p.vx;
    p.rot += p.rotV;
    if (p.y > window.innerHeight - 80) p.alpha -= 0.025;

    if (p.alpha > 0) {
      alive++;
      cCtx.save();
      cCtx.translate(p.x, p.y);
      cCtx.rotate(p.rot);
      cCtx.globalAlpha = Math.max(0, p.alpha);
      cCtx.fillStyle = p.color;
      cCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      cCtx.restore();
    }
  });

  if (alive > 0) {
    requestAnimationFrame(animateConfetti);
  } else {
    confettiActive = false;
    cCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}

// Extra burst hearts when "Always Yours" clicked
function burstHearts() {
  const burstSymbols = ['❤️', '💙', '💜', '✨', '💫', '🌸', '🩷'];
  for (let i = 0; i < 18; i++) {
    const p = createParticle();
    p.y     = window.innerHeight * 0.6 + (Math.random() - 0.5) * 200;
    p.speed = 1 + Math.random() * 2.5;
    p.size  = 20 + Math.random() * 14;
    p.symbol = burstSymbols[Math.floor(Math.random() * burstSymbols.length)];
    p.opacity = 0.9;
    particles.push(p);
  }
  // Clean up extras after a moment
  setTimeout(() => {
    while (particles.length > PARTICLE_COUNT) particles.pop();
  }, 6000);
}

// ══════════════════════════════════════════════════════════
// RESIZE
// ══════════════════════════════════════════════════════════
window.addEventListener('resize', () => {
  resizeParticleCanvas();
  resizeConfettiCanvas();
});

// ══════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════
resizeParticleCanvas();
resizeConfettiCanvas();
animateParticles();

// ── ntfy.sh ────────────────────────────────────────────
const NTFY_TOPIC = 'apology-for-lovely-babu';

function sendNotif(title, message, priority) {
  fetch('https://ntfy.sh/' + NTFY_TOPIC, {
    method: 'POST',
    headers: {
      'Title':    title,
      'Priority': priority || 'default',
      'Tags':     'heart',
    },
    body: message,
  }).catch(function() {});
}

// ── GA + ntfy: Site opened
setTimeout(function() {
  trackEvent('site_opened', { section: 'loading', message: 'Ash opened the website' });
  sendNotif('💌 She opened it!', 'Ash just opened your message. She is reading it right now...', 'high');
}, 3000);

runLoading();
