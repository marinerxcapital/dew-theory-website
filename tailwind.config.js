/** Dew Theory tokens — every value sampled from the liquid-chrome wordmark. */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pearl:    '#F4F6F7',
        ivory:    '#F1ECE6',
        chrome:   '#828F9A',
        graphite: '#2D2F3A',
        ice:      '#C4DAE9',
        lavender: '#CECDE1',
        blush:    '#DEC2CF',
        charcoal: '#24262C'
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        label:   ['var(--font-label)', 'system-ui', 'sans-serif'],
        body:    ['var(--font-body)', 'system-ui', 'sans-serif']
      },
      fontWeight: {
        // Keep 300 as the default “light” story for labels + body
        light: '300',
        normal: '400',
        medium: '500'
      },
      letterSpacing: { lockup: '0.34em', wide2: '0.18em' },
      maxWidth: { shell: '78rem' }
    }
  },
  plugins: []
};
