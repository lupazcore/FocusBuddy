import type { LivingMixIntensity } from '@shared/types';

interface ActiveSound {
  id: string;
  url: string;
  source: AudioBufferSourceNode;
  gain: GainNode;
  levelPercent: number; // 0-100, user-set target level
}

const INTENSITY_RANGE: Record<LivingMixIntensity, { amount: number; periodMs: [number, number] }> = {
  subtle: { amount: 0.08, periodMs: [9000, 16000] },
  moderate: { amount: 0.16, periodMs: [6000, 11000] },
  lively: { amount: 0.28, periodMs: [3500, 7000] },
};

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private loadingPromises = new Map<string, Promise<AudioBuffer>>();
  private active = new Map<string, ActiveSound>();
  private masterVolumePercent = 100;
  private livingMixTimers = new Map<string, number>();
  private livingMixIntensity: LivingMixIntensity = 'subtle';
  private livingMixEnabled = false;

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.masterVolumePercent / 100;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => undefined);
    }
    return this.ctx;
  }

  private async loadBuffer(id: string, url: string): Promise<AudioBuffer> {
    const cached = this.buffers.get(id);
    if (cached) return cached;
    const inFlight = this.loadingPromises.get(id);
    if (inFlight) return inFlight;

    const ctx = this.ensureContext();
    const promise = fetch(url)
      .then((res) => res.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data))
      .then((buffer) => {
        this.buffers.set(id, buffer);
        this.loadingPromises.delete(id);
        return buffer;
      });
    this.loadingPromises.set(id, promise);
    return promise;
  }

  /** Start looping a sound, fading in to the given level. */
  async play(id: string, url: string, percent: number, fadeSec = 1.2): Promise<void> {
    const ctx = this.ensureContext();
    if (this.active.has(id)) {
      this.setLevel(id, percent, fadeSec);
      return;
    }
    const buffer = await this.loadBuffer(id, url);
    // A stop() may have happened while awaiting the load.
    if (this.active.has(id)) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = ctx.createGain();
    gain.gain.value = 0;
    source.connect(gain);
    gain.connect(this.master!);
    source.start();

    this.active.set(id, { id, url, source, gain, levelPercent: percent });
    this.rampGain(gain, percent / 100, fadeSec);
  }

  setLevel(id: string, percent: number, fadeSec = 0.15) {
    const s = this.active.get(id);
    if (!s) return;
    s.levelPercent = percent;
    this.rampGain(s.gain, percent / 100, fadeSec);
  }

  stop(id: string, fadeSec = 1.2) {
    const s = this.active.get(id);
    if (!s) return;
    this.stopLivingMixFor(id);
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    s.gain.gain.cancelScheduledValues(now);
    s.gain.gain.setValueAtTime(s.gain.gain.value, now);
    s.gain.gain.linearRampToValueAtTime(0.0001, now + Math.max(0.05, fadeSec));
    const source = s.source;
    window.setTimeout(() => {
      try {
        source.stop();
        source.disconnect();
      } catch {
        /* already stopped */
      }
    }, fadeSec * 1000 + 60);
    this.active.delete(id);
    this.maybeSuspend();
  }


  pause(fadeSec = 1.0) {
    if (!this.master || !this.ctx) return;
    this.rampGain(this.master, 0.0001, fadeSec);
    window.setTimeout(() => {
      if (this.master?.gain.value && this.master.gain.value <= 0.01 && this.ctx?.state === 'running') {
        this.ctx.suspend().catch(() => undefined);
      }
    }, fadeSec * 1000 + 100);
  }

  resume(fadeSec = 1.0) {
    if (!this.master || !this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => undefined);
    }
    this.rampGain(this.master, this.masterVolumePercent / 100, fadeSec);
  }

  isPlaying(id: string): boolean {
    return this.active.has(id);
  }


  setMasterVolume(percent: number, fadeSec = 0.1) {
    this.masterVolumePercent = percent;
    if (!this.master || !this.ctx) return;
    this.rampGain(this.master, percent / 100, fadeSec);
  }


  private rampGain(node: GainNode, target: number, durationSec: number) {
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    const clamped = Math.max(0.0001, target);
    node.gain.cancelScheduledValues(now);
    node.gain.setValueAtTime(node.gain.value, now);
    if (durationSec <= 0.02) {
      node.gain.setValueAtTime(clamped, now);
    } else {
      node.gain.linearRampToValueAtTime(clamped, now + durationSec);
    }
  }

  /** Start Living Mix drift on the given sounds. */
  enableLivingMix(activeVariableIds: string[], intensity: LivingMixIntensity) {
    this.livingMixEnabled = true;
    this.livingMixIntensity = intensity;
    for (const id of activeVariableIds) {
      this.startLivingMixFor(id);
    }
  }

  disableLivingMix() {
    this.livingMixEnabled = false;
    for (const id of Array.from(this.livingMixTimers.keys())) {
      this.stopLivingMixFor(id);
    }
  }

  updateLivingMixMembership(activeVariableIds: string[]) {
    if (!this.livingMixEnabled) return;
    const wanted = new Set(activeVariableIds);
    for (const id of Array.from(this.livingMixTimers.keys())) {
      if (!wanted.has(id)) this.stopLivingMixFor(id);
    }
    for (const id of wanted) {
      if (!this.livingMixTimers.has(id)) this.startLivingMixFor(id);
    }
  }

  private startLivingMixFor(id: string) {
    if (this.livingMixTimers.has(id)) return;
    const schedule = () => {
      const s = this.active.get(id);
      if (!s || !this.livingMixEnabled) return;
      const { amount, periodMs } = INTENSITY_RANGE[this.livingMixIntensity];
      const drift = (Math.random() * 2 - 1) * amount;
      const base = s.levelPercent / 100;
      const target = Math.min(1, Math.max(0.03, base + base * drift));
      const period = periodMs[0] + Math.random() * (periodMs[1] - periodMs[0]);
      this.rampGain(s.gain, target, period / 1000);
      const timer = window.setTimeout(schedule, period);
      this.livingMixTimers.set(id, timer);
    };
    schedule();
  }

  private stopLivingMixFor(id: string) {
    const timer = this.livingMixTimers.get(id);
    if (timer) {
      window.clearTimeout(timer);
      this.livingMixTimers.delete(id);
    }
    const s = this.active.get(id);
    if (s) this.rampGain(s.gain, s.levelPercent / 100, 0.8);
  }

  private maybeSuspend() {
    if (this.active.size === 0 && this.ctx && this.ctx.state === 'running') {
      window.setTimeout(() => {
        if (this.active.size === 0 && this.ctx) {
          this.ctx.suspend().catch(() => undefined);
        }
      }, 400);
    }
  }

  async setOutputDevice(deviceId: string) {
    const ctx = this.ensureContext();
    const anyCtx = ctx as unknown as { setSinkId?: (id: string) => Promise<void> };
    if (typeof anyCtx.setSinkId === 'function') {
      try {
        await anyCtx.setSinkId(deviceId);
      } catch {
        /* setSinkId on AudioContext is still experimental in some Chromium builds */
      }
    }
  }
}

export const audioEngine = new AudioEngine();
