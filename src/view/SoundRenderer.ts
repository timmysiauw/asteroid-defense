import type { GameEvent } from '../model/events';

export class SoundRenderer {
  private audioContext: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  unlock(): void {
    const context = this.getAudioContext();

    if (context.state === 'suspended') {
      void context.resume();
    }
  }

  play(events: GameEvent[]): void {
    if (events.length === 0) {
      return;
    }

    const context = this.getAudioContext();

    if (context.state !== 'running') {
      return;
    }

    for (const event of events) {
      switch (event.type) {
        case 'laser_fired':
          this.playLaserPew(context);
          break;
        case 'asteroid_hit':
          this.playSmallExplosion(context);
          break;
        case 'building_destroyed':
          this.playMediumExplosion(context);
          break;
        case 'game_over':
          if (event.reason === 'cannon_hit') {
            this.playMediumExplosion(context);
          }
          break;
        case 'nuke_activated':
          this.playHugeExplosion(context);
          break;
        default:
          break;
      }
    }
  }

  private getAudioContext(): AudioContext {
    if (this.audioContext === null) {
      this.audioContext = new AudioContext();
    }

    return this.audioContext;
  }

  private getNoiseBuffer(context: AudioContext): AudioBuffer {
    if (this.noiseBuffer === null) {
      const buffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
      const channel = buffer.getChannelData(0);

      for (let index = 0; index < channel.length; index += 1) {
        channel[index] = Math.random() * 2 - 1;
      }

      this.noiseBuffer = buffer;
    }

    return this.noiseBuffer;
  }

  private playLaserPew(context: AudioContext): void {
    const start = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(1320, start);
    oscillator.frequency.exponentialRampToValueAtTime(520, start + 0.08);

    filter.type = 'highpass';
    filter.frequency.value = 700;

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.08, start + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.09);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);

    oscillator.start(start);
    oscillator.stop(start + 0.1);
  }

  private playSmallExplosion(context: AudioContext): void {
    this.playNoiseBurst(context, {
      duration: 0.18,
      gainPeak: 0.11,
      lowpassStart: 2200,
      lowpassEnd: 480
    });
    this.playToneBurst(context, {
      frequencyStart: 180,
      frequencyEnd: 90,
      duration: 0.14,
      gainPeak: 0.03
    });
  }

  private playMediumExplosion(context: AudioContext): void {
    this.playNoiseBurst(context, {
      duration: 0.42,
      gainPeak: 0.22,
      lowpassStart: 1800,
      lowpassEnd: 180
    });
    this.playToneBurst(context, {
      frequencyStart: 120,
      frequencyEnd: 42,
      duration: 0.34,
      gainPeak: 0.07
    });
  }

  private playHugeExplosion(context: AudioContext): void {
    this.playNoiseBurst(context, {
      duration: 0.85,
      gainPeak: 0.32,
      lowpassStart: 2400,
      lowpassEnd: 90
    });
    this.playToneBurst(context, {
      frequencyStart: 90,
      frequencyEnd: 26,
      duration: 0.72,
      gainPeak: 0.12
    });
    this.playToneBurst(context, {
      frequencyStart: 320,
      frequencyEnd: 70,
      duration: 0.22,
      gainPeak: 0.045
    });
  }

  private playNoiseBurst(
    context: AudioContext,
    options: {
      duration: number;
      gainPeak: number;
      lowpassStart: number;
      lowpassEnd: number;
    }
  ): void {
    const start = context.currentTime;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    source.buffer = this.getNoiseBuffer(context);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(options.lowpassStart, start);
    filter.frequency.exponentialRampToValueAtTime(options.lowpassEnd, start + options.duration);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(options.gainPeak, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + options.duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);

    source.start(start);
    source.stop(start + options.duration);
  }

  private playToneBurst(
    context: AudioContext,
    options: {
      frequencyStart: number;
      frequencyEnd: number;
      duration: number;
      gainPeak: number;
    }
  ): void {
    const start = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(options.frequencyStart, start);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(1, options.frequencyEnd),
      start + options.duration
    );

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(options.gainPeak, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + options.duration);

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(start);
    oscillator.stop(start + options.duration);
  }
}

