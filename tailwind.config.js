/** Dew Theory retail tokens — black/white commerce shell + Dew green + restrained promo red. */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Core retail neutrals
        black: '#000000',
        ink: '#111111',
        charcoal: '#2A2A2A',
        muted: '#666666',
        border: '#E2E2E2',
        'surface-light': '#F7F7F7',
        'surface-warm': '#FAFAF8',
        white: '#FFFFFF',
        surface: '#FFFFFF',

        // Legacy aliases remapped to retail system (keeps existing classnames coherent)
        pearl: '#FFFFFF',
        ivory: '#FAFAF8',
        chrome: '#666666',
        graphite: '#111111',
        ice: '#E8F0EB',
        lavender: '#F3F7F4',
        blush: '#F7F7F7',

        // Promotional retail red (sparse use)
        promo: {
          DEFAULT: '#D6001C',
          dark: '#A80016'
        },

        // Dew Theory identity green
        dew: {
          DEFAULT: '#2F5D4A',
          dark: '#183C30',
          mid: '#5F826F',
          soft: '#E8F0EB',
          surface: '#F3F7F4'
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
        card: '0 1px 0 rgba(0, 0, 0, 0.04)',
        'card-hover': '0 8px 24px -16px rgba(0, 0, 0, 0.18)'
      },
      spacing: {
        18: '4.5rem',
        header: '4.5rem'
      }
    }
  },
  plugins: []
};
