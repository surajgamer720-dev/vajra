let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function ramp(
  gain: GainNode,
  start: number,
  end: number,
  startTime: number,
  duration: number,
) {
  gain.gain.setValueAtTime(start, startTime);
  gain.gain.linearRampToValueAtTime(end, startTime + duration);
}

export function playCompletionSound(enabled = true): void {
  if (!enabled) return;
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;

    // Soft crackle — filtered noise burst
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.3));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.05, now);
    noiseGain.gain.linearRampToValueAtTime(0, now + 0.15);
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);

    // Harp pluck — decaying sine
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.3);
    const gain = ctx.createGain();
    ramp(gain, 0.3, 0, now, 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);

    // Second harmonic
    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1320, now + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(990, now + 0.35);
    const gain2 = ctx.createGain();
    ramp(gain2, 0.15, 0, now + 0.05, 0.3);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.4);
  } catch {
    // Ignore audio errors
  }
}

export function playMilestoneSound(enabled = true): void {
  if (!enabled) return;
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;

    // Gong strike
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 2);
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.5, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 2);

    // Brass stab — triumphant chord
    const notes = [220, 277, 330, 440];
    notes.forEach((freq, i) => {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, now + i * 0.05);
      g.gain.linearRampToValueAtTime(0.12, now + i * 0.05 + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.8);
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 2000;
      o.connect(filter);
      filter.connect(g);
      g.connect(ctx.destination);
      o.start(now + i * 0.05);
      o.stop(now + 1);
    });
  } catch {
    // Ignore audio errors
  }
}

export function playBreakSound(enabled = true): void {
  if (!enabled) return;
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;

    // Fizzle — descending pitch with noise
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.8);
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.8);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.8);

    // Melancholic minor chord (descending)
    const minorNotes = [330, 392, 494];
    minorNotes.forEach((freq, i) => {
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.setValueAtTime(freq, now + i * 0.1);
      o.frequency.linearRampToValueAtTime(freq * 0.8, now + i * 0.1 + 0.6);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.08, now + i * 0.1);
      g.gain.linearRampToValueAtTime(0, now + i * 0.1 + 0.6);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(now + i * 0.1);
      o.stop(now + 1);
    });
  } catch {
    // Ignore audio errors
  }
}

export function playAddActivitySound(enabled = true): void {
  if (!enabled) return;
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;

    // Positive ascending pop
    const freqs = [523, 659, 784];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + i * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.25);
    });
  } catch {
    // Ignore audio errors
  }
}
