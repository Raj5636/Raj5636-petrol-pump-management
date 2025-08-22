/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'display': ['Poppins', 'Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
        'sm': ['0.875rem', { lineHeight: '1.6', letterSpacing: '0.025em' }],
        'base': ['1rem', { lineHeight: '1.6', letterSpacing: '0.025em' }],
        'lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0.025em' }],
        'xl': ['1.25rem', { lineHeight: '1.6', letterSpacing: '0.025em' }],
        '2xl': ['1.5rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
        '3xl': ['1.875rem', { lineHeight: '1.4', letterSpacing: '0.025em' }],
      },
      colors: {
        bg: '#0f1a2b',
        panel: '#17243a'
      },
      boxShadow: {
        soft: '0 6px 20px rgba(0,0,0,0.25)'
      },
      borderRadius: {
        xl2: '1.25rem'
      }
    },
  },
  plugins: [],
}
