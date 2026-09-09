import type {
  Preset,
  StatsDay,
  LivingMixIntensity,
  SessionPhase,
} from '@shared/types';

export interface MixStoreState {
  levels: Record<string, number>;
  favorites: string[];
  hydrated: boolean;
}

export interface SessionStoreState {
  phase: SessionPhase;
  endsAt: number | null; // epoch ms
  focusWorkMinutes: number;
  focusBreakMinutes: number;
  windDownMinutes: number;
  livingMixEnabled: boolean;
  livingMixIntensity: LivingMixIntensity;
  now: number;
}



export type { Preset, StatsDay };
