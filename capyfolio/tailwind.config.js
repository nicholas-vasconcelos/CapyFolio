/** @type {import('tailwindcss').Config} */
// Values mirror design-system/tokens.json (also exposed as CSS variables in src/styles/tokens.css).
// Colours are literal so Tailwind opacity modifiers (bg-navy/95) keep working.
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: '#FAF7F2',
        surface: '#FFFFFF',
        'paper-deep': '#EFEBE4',
        ink: '#182536',
        'ink-soft': '#3A4B5F',
        'ink-muted': '#56616D',
        'ink-subtle': '#7A848E',
        placeholder: '#6B7682',
        navy: '#1E3C61',
        'navy-tint': '#EAF0F5',
        'on-navy': '#FAF7F2',
        'on-navy-muted': '#DCE5EE',
        'gold-light': '#FFD98A',
        'brand-green': '#1B8243',
        'green-tint': '#EAF5EE',
        'green-ink': '#14602F',
        gold: '#FEA402',
        'gold-tint': '#FFF4D6',
        'amber-ink': '#8A5500',
        line: '#DDE2E6',
        'line-strong': '#CBD3DA',
        'field-border': '#8A96A3',
        'dot-grid': 'rgba(250, 247, 242, 0.13)',
        focus: '#FEA402',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '12px',
        md: '14px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '28px',
        '4xl': '32px',
        pill: '999px',
        // radius-full is 50% in the tokens; Tailwind's 9999px is kept for `full`
        // because 50% turns the app's existing non-square rounded-full pills into ellipses.
        circle: '50%',
      },
      boxShadow: {
        xs: '2px 2px 0 #182536',
        sm: '3px 3px 0 #182536',
        md: '4px 4px 0 #182536',
        hover: '6px 6px 0 #182536',
        'primary-sm': '3px 3px 0 #FEA402',
        primary: '4px 4px 0 #FEA402',
        'on-navy': '4px 4px 0 #FAF7F2',
        card: '8px 8px 0 #1E3C61',
        'card-gold': '8px 8px 0 #FEA402',
        'card-green': '8px 8px 0 #1B8243',
        photo: '10px 10px 0 #FEA402',
      },
    },
  },
  plugins: [],
}
