import type { StateCreator } from 'zustand';
import type { Stats } from '@shared/types';

export interface StatsSlice {
  stats: Stats;
  setStats: (stats: Stats) => void;
  logMinute: (soundIds: string[]) => void;
  logSessionComplete: () => void;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function dayDiff(a: string, b: string): number {
  const da = new Date(a).getTime();
  const db = new Date(b).getTime();
  return Math.round((db - da) / 86_400_000);
}

export const createStatsSlice: StateCreator<StatsSlice, [], [], StatsSlice> = (set, get) => ({
  stats: { days: [], sessionCount: 0, currentStreak: 0, longestStreak: 0, totalMinutes: 0 },

  setStats: (stats) => set({ stats }),

  logMinute: (soundIds) => {
    const { stats } = get();
    const key = todayKey();
    const days = [...stats.days];
    let day = days.find((d) => d.date === key);
    if (!day) {
      day = { date: key, minutes: 0, soundsPlayed: {} };
      days.push(day);
    }
    day.minutes += 1;
    for (const id of soundIds) {
      day.soundsPlayed[id] = (day.soundsPlayed[id] ?? 0) + 1;
    }

    let currentStreak = stats.currentStreak;
    const sorted = [...days].sort((a, b) => (a.date < b.date ? -1 : 1));
    const yesterday = sorted.filter((d) => d.date !== key).at(-1);
    if (day.minutes === 1) {
      if (yesterday && dayDiff(yesterday.date, key) === 1) {
        currentStreak = stats.currentStreak + 1;
      } else {
        currentStreak = 1;
      }
    }

    const longestStreak = Math.max(stats.longestStreak, currentStreak);
    const totalMinutes = stats.totalMinutes + 1;

    set({
      stats: {
        ...stats,
        days,
        currentStreak,
        longestStreak,
        totalMinutes,
      },
    });
  },

  logSessionComplete: () => {
    const { stats } = get();
    set({ stats: { ...stats, sessionCount: stats.sessionCount + 1 } });
  },
});
