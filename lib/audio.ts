// Web Audio API Synthesizer for PE Whistle & Training Timer Sounds

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Sports Whistle Sound (Chirp frequency with dual oscillator modulation)
export function playWhistleSound(long: boolean = false) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    const duration = long ? 0.8 : 0.35;
    const now = ctx.currentTime;

    osc1.type = 'triangle';
    osc2.type = 'sine';

    // Whistle high pitch modulation ~ 2500 - 2800 Hz
    osc1.frequency.setValueAtTime(2550, now);
    osc1.frequency.exponentialRampToValueAtTime(2850, now + duration * 0.5);
    osc1.frequency.exponentialRampToValueAtTime(2600, now + duration);

    osc2.frequency.setValueAtTime(2650, now);
    osc2.frequency.exponentialRampToValueAtTime(2950, now + duration * 0.5);
    osc2.frequency.exponentialRampToValueAtTime(2700, now + duration);

    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.linearRampToValueAtTime(0.25, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  } catch (e) {
    console.warn('Audio feedback failed', e);
  }
}

// Lap or Milestone Beep
export function playLapBeep(highPitch: boolean = false) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(highPitch ? 880 : 587.33, now); // A5 or D5
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  } catch (e) {
    console.warn('Lap beep failed', e);
  }
}

// Countdown Tick
export function playCountdownTick(isFinal: boolean = false) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = isFinal ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isFinal ? 1046.5 : 523.25, now); // C6 or C5
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isFinal ? 0.35 : 0.12));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + (isFinal ? 0.35 : 0.12));
  } catch (e) {
    console.warn('Countdown tick failed', e);
  }
}
