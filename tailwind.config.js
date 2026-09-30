/**
 * Dew Theory — PEARL EDITORIAL design tokens.
 *
 * Direction: quiet luxury. A soft luminous ivory ground, near-black editorial
 * typography, hairline rules, near-square geometry and almost no shadow.
 * Iridescent colour appears only as reflected light (champagne, blush, ice,
 * faint lavender) — never as a UI surface. There is no saturated second accent:
 * the accent is ink itself, and restraint is the brand.
 *
 * Conventions
 * -----------
 * 1. Component code uses these token names only. No raw hex in components.
 * 2. Legacy semantic aliases (ivory/forest/muted/border/surface/void/pink…) are
 *    retained because ~40 components already consume them; their values are
 *    remapped to the pearl system here rather than rewriting every call site.
 *    `void` is therefore the *page ground* (it was the noir ground) and `pink`
 *    is the single ink accent (it was the noon pink).
 * 3. Alpha-capable tokens are declared as hex so Tailwind opacity modifiers
 *    (`bg-ink/10`, `border-hairline/60`) resolve. The authoritative `rgba()`
 *    values live in `app/globals.css` as CSS custom properties.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'ivory': 'rgb(var(--dt-green-100-rgb) / <alpha-value>)',
        'forest': 'rgb(var(--dt-green-900-rgb) / <alpha-value>)',
        'ink': 'rgb(var(--dt-green-900-rgb) / <alpha-value>)',
        'charcoal': 'rgb(var(--dt-green-900-rgb) / <alpha-value>)',
        'graphite': 'rgb(var(--dt-green-900-rgb) / <alpha-value>)',
        'black': 'rgb(var(--dt-green-900-rgb) / <alpha-value>)',
        'white': 'rgb(var(--dt-green-50-rgb) / <alpha-value>)',
        'surface': 'rgb(var(--dt-green-50-rgb) / <alpha-value>)',
        'surface-light': 'rgb(var(--dt-green-200-rgb) / <alpha-value>)',
        'surface-warm': 'rgb(var(--dt-green-50-rgb) / <alpha-value>)',
        'muted': 'rgb(var(--dt-green-700-rgb) / <alpha-value>)',
        'chrome': 'rgb(var(--dt-green-700-rgb) / <alpha-value>)',
        'border': 'rgb(var(--dt-green-400-rgb) / <alpha-value>)',
        'hairline': 'rgb(var(--dt-green-400-rgb) / <alpha-value>)',
        'pearl': 'rgb(var(--dt-green-50-rgb) / <alpha-value>)',
        'stone': 'rgb(var(--dt-green-200-rgb) / <alpha-value>)',
        'ice': 'rgb(var(--dt-green-200-rgb) / <alpha-value>)',
        'lavender': 'rgb(var(--dt-green-200-rgb) / <alpha-value>)',
        'blush': 'rgb(var(--dt-green-200-rgb) / <alpha-value>)',
        'sage-deep': 'rgb(var(--dt-green-700-rgb) / <alpha-value>)',
        void: { 'DEFAULT': 'rgb(var(--dt-green-100-rgb) / <alpha-value>)', 'elevated': 'rgb(var(--dt-green-50-rgb) / <alpha-value>)', 'elevated2': 'rgb(var(--dt-green-200-rgb) / <alpha-value>)' },
        pink: { 'DEFAULT': 'rgb(var(--dt-green-700-rgb) / <alpha-value>)', 'bright': 'rgb(var(--dt-green-700-rgb) / <alpha-value>)', 'dim': 'rgb(var(--dt-green-900-rgb) / <alpha-value>)', 'wash': 'rgb(var(--dt-green-200-rgb) / <alpha-value>)' },
        dew: { 'DEFAULT': 'rgb(var(--dt-green-700-rgb) / <alpha-value>)', 'dark': 'rgb(var(--dt-green-900-rgb) / <alpha-value>)', 'mid': 'rgb(var(--dt-green-300-rgb) / <alpha-value>)', 'soft': 'rgb(var(--dt-green-200-rgb) / <alpha-value>)', 'surface': 'rgb(var(--dt-green-300-rgb) / <alpha-value>)' },
        sage: { 'DEFAULT': 'rgb(var(--dt-green-300-rgb) / <alpha-value>)', 'deep': 'rgb(var(--dt-green-700-rgb) / <alpha-value>)', 'soft': 'rgb(var(--dt-green-200-rgb) / <alpha-value>)', 'surface': 'rgb(var(--dt-green-300-rgb) / <alpha-value>)' },
        promo: { 'DEFAULT': 'rgb(var(--dt-green-700-rgb) / <alpha-value>)', 'dark': 'rgb(var(--dt-green-900-rgb) / <alpha-value>)' },
        champagne: { 'DEFAULT': 'rgb(var(--dt-green-300-rgb) / <alpha-value>)', 'deep': 'rgb(var(--dt-green-700-rgb) / <alpha-value>)' },
        aqua: { 'DEFAULT': 'rgb(var(--dt-green-300-rgb) / <alpha-value>)', 'deep': 'rgb(var(--dt-green-700-rgb) / <alpha-value>)', 'soft': 'rgb(var(--dt-green-200-rgb) / <alpha-value>)' },
        lilac: { 'DEFAULT': 'rgb(var(--dt-green-300-rgb) / <alpha-value>)', 'deep': 'rgb(var(--dt-green-700-rgb) / <alpha-value>)', 'soft': 'rgb(var(--dt-green-200-rgb) / <alpha-value>)' },
        peach: { 'DEFAULT': 'rgb(var(--dt-green-300-rgb) / <alpha-value>)', 'deep': 'rgb(var(--dt-green-700-rgb) / <alpha-value>)', 'soft': 'rgb(var(--dt-green-200-rgb) / <alpha-value>)' },
        botanical: { 'DEFAULT': 'rgb(var(--dt-green-300-rgb) / <alpha-value>)', 'deep': 'rgb(var(--dt-green-700-rgb) / <alpha-value>)', 'soft': 'rgb(var(--dt-green-200-rgb) / <alpha-value>)' },
        green: { '50': 'rgb(var(--dt-green-50-rgb) / <alpha-value>)', '100': 'rgb(var(--dt-green-100-rgb) / <alpha-value>)', '200': 'rgb(var(--dt-green-200-rgb) / <alpha-value>)', '300': 'rgb(var(--dt-green-300-rgb) / <alpha-value>)', '400': 'rgb(var(--dt-green-400-rgb) / <alpha-value>)', '700': 'rgb(var(--dt-green-700-rgb) / <alpha-value>)', '900': 'rgb(var(--dt-green-900-rgb) / <alpha-value>)' },
      },

      fontFamily: {
        display: ['var(--font-display)', 'Fraunces', 'Didot', 'Georgia', 'serif'],
        label: ['var(--font-body)', 'Figtree', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'Figtree', 'system-ui', 'sans-serif']
      },

      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600'
      },

      /* Modular type scale, ratio 1.25, base 16px.
         Steps: 16 / 20 / 25 / 31 / 39 / 49 / 61 / 76 / 95. */
      fontSize: {
        micro: ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.16em' }],
        'step-1': ['1rem', { lineHeight: '1.6' }],
        'step-2': ['1.25rem', { lineHeight: '1.5' }],
        'step-3': ['1.5625rem', { lineHeight: '1.35' }],
        'step-4': ['1.953rem', { lineHeight: '1.25' }],
        'step-5': ['2.441rem', { lineHeight: '1.15' }],
        'step-6': ['3.052rem', { lineHeight: '1.08' }],
        'step-7': ['3.815rem', { lineHeight: '1.04' }],
        'step-8': ['4.768rem', { lineHeight: '1.0' }],
        'step-9': ['5.96rem', { lineHeight: '0.98' }]
      },

      letterSpacing: {
        lockup: '0.2em',
        wide2: '0.08em',
        eyebrow: '0.18em',
        hero: '-0.015em',
        headline: '-0.01em'
      },

      maxWidth: {
        shell: '75rem', // 1408px content frame
        measure: '44rem'
      },

      /* 8px base unit — section rhythm, not one repeated py-20. */
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        26: '6.5rem',
        30: '7.5rem',
        34: '8.5rem',
        42: '10.5rem',
        50: '12.5rem',
        header: '4.5rem',
        'section-sm': '4rem',
        'section-md': '5rem',
        'section-lg': '6rem',
        'section-xl': '7rem'
      },

      borderRadius: {
        card: 'var(--dt-radius-md)'
        ,sm: 'var(--dt-radius-sm)', lg: 'var(--dt-radius-lg)'
      },

      boxShadow: { card: 'var(--dt-shadow-card)', 'card-hover': 'var(--dt-shadow-hover)', glow: 'var(--dt-shadow-card)', 'glow-soft': 'var(--dt-shadow-card)' },

      keyframes: {
        'bag-pop': {
          '0%': { transform: 'scale(1)' },
          '38%': { transform: 'scale(1.28)' },
          '100%': { transform: 'scale(1)' }
        },
        'rim-sweep': {
          '0%': { transform: 'translate3d(-120%, 0, 0)', opacity: '0' },
          '35%': { opacity: '1' },
          '100%': { transform: 'translate3d(140%, 0, 0)', opacity: '0' }
        },
        'skeleton-breathe': {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '0.7' }
        }
      },

      animation: {
        'bag-pop': 'bag-pop 420ms cubic-bezier(0.22, 1, 0.36, 1)',
        'rim-sweep': 'rim-sweep 1200ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'skeleton-breathe': 'skeleton-breathe 1900ms ease-in-out infinite'
      }
    }
  },
  plugins: []
};
