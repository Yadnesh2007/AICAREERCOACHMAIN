/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cobalt: {
          DEFAULT: '#1746A2',
          dark: '#0F3070',
          light: '#2359C7',
        },
        blue: {
          DEFAULT: '#3978E8',
          hover: '#2963D0',
        },
        ice: {
          DEFAULT: '#BBD9FF',
          light: '#DCEBFF',
          soft: '#EAF3FF',
        },
        cloud: {
          DEFAULT: '#F3F7FC',
          light: '#FAFBFD',
          dark: '#E5EDF7',
        },
        amber: {
          DEFAULT: '#FFC66B',
          hover: '#F5B754',
          subtle: '#FFF5E5',
        },
        app: '#F3F7FC',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(23, 70, 162, 0.06), 0 2px 6px -1px rgba(23, 70, 162, 0.04)',
        'card': '0 0 0 1px rgba(23, 70, 162, 0.08), 0 4px 16px -2px rgba(23, 70, 162, 0.05)',
        'card-hover': '0 0 0 1px rgba(57, 120, 232, 0.25), 0 12px 28px -4px rgba(23, 70, 162, 0.12)',
        'amber-glow': '0 4px 14px 0 rgba(255, 198, 107, 0.39)',
        'cobalt-glow': '0 4px 14px 0 rgba(23, 70, 162, 0.35)',
      }
    },
  },
  plugins: [],
}
