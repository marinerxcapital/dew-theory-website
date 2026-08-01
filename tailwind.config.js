/** Dew Theory tokens — quiet clinical palette from the liquid-chrome wordmark. */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pearl:    '#F7F5F2',
        ivory:    '#F1ECE6',
        chrome:   '#6B7680',
        graphite: '#1F2128',
        ice:      '#C4DAE9',
        lavender: '#CECDE1',
        blush:    '#DEC2CF',
        charcoal: '#1A1C20',
        surface:  '#FFFFFF'
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        label:   ['var(--font-label)', 'system-ui', 'sans-serif'],
        body:    ['var(--font-body)', 'system-ui', 'sans-serif']
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500'
      },
      letterSpacing: { lockup: '0.28em', wide2: '0.12em' },
      maxWidth: { shell: '76rem' },
      borderRadius: {
        card: '2px'
      },
      boxShadow: {
        card: '0 1px 0 rgba(31, 33, 40, 0.04), 0 18px 40px -28px rgba(31, 33, 40, 0.18)',
        'card-hover': '0 1px 0 rgba(31, 33, 40, 0.05), 0 28px 56px -30px rgba(31, 33, 40, 0.28)'
      }
    }
  },
  plugins: []
};
