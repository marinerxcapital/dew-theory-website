/** Dew Theory brand tokens — forest / sage / ivory / stone editorial system. */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Authoritative brand five
        forest: '#1E2B22',
        'sage-deep': '#5B7356',
        sage: {
          DEFAULT: '#93A890',
          deep: '#5B7356',
          soft: '#E4E8E0',
          surface: '#D8E0D4'
        },
        ivory: '#EDEDE6',
        stone: '#C9C4B8',

        // Structure aliases (preserve existing classnames)
        black: '#1E2B22',
        ink: '#1E2B22',
        charcoal: '#1E2B22',
        muted: '#5A655C',
        border: '#D4CFC6',
        'surface-light': '#E5E2D9',
        'surface-warm': '#EDEDE6',
        white: '#FFFFFF',
        surface: '#FFFFFF',

        // Legacy aliases remapped to brand system
        pearl: '#EDEDE6',
        chrome: '#5A655C',
        graphite: '#1E2B22',
        ice: '#E4E8E0',
        lavender: '#D8E0D4',
        blush: '#E5E2D9',

        // Functional alert only (sparse)
        promo: {
          DEFAULT: '#8B3A3A',
          dark: '#6E2E2E'
        },

        // Dew guidance → sage family
        dew: {
          DEFAULT: '#5B7356',
          dark: '#1E2B22',
          mid: '#93A890',
          soft: '#E4E8E0',
          surface: '#D8E0D4'
        }
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        label: ['var(--font-label)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif']
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500'
      },
      letterSpacing: { lockup: '0.22em', wide2: '0.12em' },
      maxWidth: { shell: '90rem' },
      borderRadius: {
        card: '2px'
      },
      boxShadow: {
        card: '0 1px 0 rgba(30, 43, 34, 0.04)',
        'card-hover': '0 8px 24px -16px rgba(30, 43, 34, 0.18)'
      },
      spacing: {
        18: '4.5rem',
        header: '4.5rem'
      }
    }
  },
  plugins: []
};
