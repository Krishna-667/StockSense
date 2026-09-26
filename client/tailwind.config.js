/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zoho: {
          red: '#E52E2E', // Zoho Inventory Signature Red
          redHover: '#C82323',
          redLight: '#FDF2F2',
          sidebar: '#1E1F28', // Dark Zoho Sidebar
          sidebarHover: '#2A2B36',
          sidebarText: '#9E9EAE',
          bg: '#F4F5F8', // Zoho Light Gray Workspace Background
          card: '#FFFFFF',
          border: '#E3E6EC',
          blue: '#1A73E8',
          emerald: '#10B981',
          amber: '#F59E0B',
          dark: '#1C2536',
          muted: '#6C757D',
        },
        brand: {
          50: '#FDF2F2',
          100: '#FDE8E8',
          500: '#E52E2E',
          600: '#E52E2E',
          700: '#C82323',
          800: '#9B1C1C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'zoho': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'zoho-card': '0 2px 8px 0 rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
}
