/// <reference types="vite/client" />
import type { FocusBuddyAPI } from '@shared/types';

declare global {
  interface Window {
    focusBuddy: FocusBuddyAPI;
  }
}

export {};
