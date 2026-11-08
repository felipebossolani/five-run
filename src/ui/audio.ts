let context: AudioContext | undefined;

export function sound(
  kind: "ball" | "shoe" | "crowd" | "electronic",
  muted: boolean,
): void {
  if (muted || document.hidden) return;
  try {
    context ??= new AudioContext();
    const audio = context;
    void audio.resume();
    const now = audio.currentTime;
    const tone = (
      start: number,
      end: number,
      duration: number,
      volume: number,
      type: OscillatorType = "sine",
    ) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(start, now);
      oscillator.frequency.exponentialRampToValueAtTime(end, now + duration);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start(now);
      oscillator.stop(now + duration);
    };
    const noise = (
      duration: number,
      frequency: number,
      q: number,
      volume: number,
    ) => {
      const buffer = audio.createBuffer(
        1,
        Math.ceil(audio.sampleRate * duration),
        audio.sampleRate,
      );
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const source = audio.createBufferSource();
      const filter = audio.createBiquadFilter();
      const gain = audio.createGain();
      source.buffer = buffer;
      filter.type = "bandpass";
      filter.frequency.value = frequency;
      filter.Q.value = q;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(
        volume,
        now + Math.min(0.03, duration / 3),
      );
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      source.connect(filter).connect(gain).connect(audio.destination);
      source.start(now);
      source.stop(now + duration);
    };
    if (kind === "ball") {
      tone(155, 48, 0.2, 0.09);
      noise(0.055, 800, 0.7, 0.08);
    } else if (kind === "shoe") {
      tone(1050, 570, 0.13, 0.025, "triangle");
      noise(0.1, 2200, 2, 0.035);
    } else if (kind === "crowd") {
      noise(0.65, 700, 0.45, 0.055);
      tone(240, 270, 0.48, 0.008, "triangle");
      tone(310, 260, 0.53, 0.007, "triangle");
      tone(390, 430, 0.42, 0.005, "triangle");
    } else {
      tone(660, 880, 0.16, 0.035, "square");
    }
  } catch {
    /* Audio is optional. */
  }
}

export function pauseAudio(): void {
  if (context && context.state === "running") void context.suspend();
}
