/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/renderer/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)',
        sidebar: 'var(--sidebar)',
        paper: 'var(--paper)',
        card: 'var(--card)',
        gold: 'var(--gold)',
        violet: 'var(--violet)',
        leaf: 'var(--leaf)',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        struct: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        hero: 'calc(8px - var(--press-dist, 0px)) calc(8px - var(--press-dist, 0px)) 0 var(--ink)',
        tile: 'calc(6px - var(--press-dist, 0px)) calc(6px - var(--press-dist, 0px)) 0 var(--ink)',
        small: 'calc(4px - var(--press-dist, 0px)) calc(4px - var(--press-dist, 0px)) 0 var(--ink)',
        pressed: '2px 2px 0 var(--ink)',
      },
      borderRadius: {
        tile: '18px',
        badge: '16px',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.015)' },
        },
        popIn: {
          '0%': { opacity: 0, transform: 'translateY(10px) scale(0.97)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        expandDown: {
          '0%': { maxHeight: '0' },
          '100%': { maxHeight: '15rem' }
        },
        expandGrid: {
          '0%': { gridTemplateRows: '0fr' },
          '100%': { gridTemplateRows: '1fr' }
        }
      },
      animation: {
        breathe: 'breathe 4s ease-in-out infinite',
        popIn: 'popIn 400ms cubic-bezier(.2,.8,.2,1) both',
        expandDown: 'expandDown 250ms cubic-bezier(0.16, 1, 0.3, 1) both',
        expandGrid: 'expandGrid 250ms cubic-bezier(0.16, 1, 0.3, 1) both',
        fadeIn: 'fadeIn 250ms ease-out both',
      },
    },
  },
  plugins: [],
};
