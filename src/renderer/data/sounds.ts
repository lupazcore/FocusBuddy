import type { SoundDef, StarterBlend } from '@shared/types';

export const BUILT_IN_SOUNDS: SoundDef[] = [
  { id: 'rain', name: 'Rain', family: 'leaf', icon: 'rain', variable: true },
  { id: 'storm', name: 'Storm', family: 'leaf', icon: 'storm', variable: true },
  { id: 'wind', name: 'Wind', family: 'leaf', icon: 'wind', variable: true },
  { id: 'waves', name: 'Waves', family: 'leaf', icon: 'waves', variable: true },
  { id: 'stream', name: 'River Stream', family: 'leaf', icon: 'stream' },
  { id: 'chimes', name: 'Wind Chimes', family: 'leaf', icon: 'chimes' },
  { id: 'birds', name: 'Birds', family: 'leaf', icon: 'birds' },
  { id: 'crickets', name: 'Night Crickets', family: 'leaf', icon: 'crickets' },
  { id: 'fireplace', name: 'Fireplace', family: 'gold', icon: 'fireplace', variable: true },
  { id: 'coffeeshop', name: 'Coffee Shop', family: 'gold', icon: 'coffeeshop' },
  { id: 'city', name: 'City', family: 'gold', icon: 'city' },
  { id: 'train', name: 'Train', family: 'gold', icon: 'train' },
  { id: 'boat', name: 'Boat', family: 'gold', icon: 'boat' },
  { id: 'whitenoise', name: 'White Noise', family: 'gold', icon: 'noise' },
  { id: 'keyboard', name: 'Keyboard Typing', family: 'gold', icon: 'keyboard' },
];

export const SOUND_FILE_MAP: Record<string, string> = {
  rain: 'rain.mp3',
  storm: 'storm.mp3',
  wind: 'wind.mp3',
  waves: 'waves.mp3',
  stream: 'stream.mp3',
  chimes: 'chimes.mp3',
  birds: 'birds.mp3',
  crickets: 'crickets.mp3',
  fireplace: 'fireplace.mp3',
  coffeeshop: 'coffeeshop.mp3',
  city: 'city.mp3',
  train: 'train.mp3',
  boat: 'boat.mp3',
  whitenoise: 'white-noise.mp3',
  keyboard: 'keyboard.mp3',
};

export const STARTER_BLENDS: StarterBlend[] = [
  {
    id: 'rainy-cafe',
    name: 'Rainy Cafe',
    description: 'Rain against the window and a coffee shop.',
    levels: { rain: 55, coffeeshop: 50 },
  },
  {
    id: 'night-watch',
    name: 'Night Watch',
    description: 'Crickets, a light wind, and distant wind chimes for late hours.',
    levels: { crickets: 50, wind: 20, chimes: 30 },
  },
  {
    id: 'deep-focus',
    name: 'Deep Focus',
    description: 'White noise with a soft keyboard undertone to lock into work.',
    levels: { whitenoise: 45, keyboard: 25 },
  },
  {
    id: 'fireside',
    name: 'Fireside',
    description: 'A crackling fireplace with wind just outside.',
    levels: { fireplace: 60, wind: 15 },
  },
  {
    id: 'open-water',
    name: 'Open Water',
    description: 'Waves, gulls of wind, and a boat creaking gently.',
    levels: { waves: 55, wind: 20, boat: 20 },
  },
];
