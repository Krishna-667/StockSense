/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        axion: {
          bg: '#F5F5F2', // Minimalist off-white background from reference
          card: '#FFFFFF',
          dark: '#111111', // Deep charcoal black
          subtle: '#1C1C1C',
          sage: '#2E4935', // Container Olive Green from reference
          olive: '#3E5C46',
          lightSage: '#EBF1EB',
          sand: '#E8E8E3',
          border: '#E2E2DC',
          muted: '#6E6E6B',
          lightGray: '#F9F9F7',
        },
        navy: {
          950: '#111111',
          900: '#1A1A1A',
          850: '#242424',
          800: '#2E4935',
          700: '#334155',
          600: '#475569',
        },
        brand: {
          50: '#F0F4F1',
          100: '#E1EBE2',
          200: '#C3D7C5',
          500: '#2E4935', // AXION Sage Green accent
          600: '#111111', // Dark Black pill buttons
          700: '#000000',
          800: '#1A1A1A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'axion': '0 2px 10px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'axion-hover': '0 12px 30px rgba(0, 0, 0, 0.08)',
        'pill': '0 4px 14px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        'full': '9999px',
      },
    },
  },
  plugins: [],
}
