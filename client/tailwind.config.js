/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        army: {
          50:  '#f0f4e8',
          100: '#dce8c4',
          200: '#c0d895',
          300: '#a0c462',
          400: '#84b43a',
          500: '#5d8a1e',
          600: '#4a6e17',
          700: '#3a5512',
          800: '#2c400e',
          900: '#1e2c09',
          950: '#111a04',
        },
        olive: {
          500: '#6b7c3a',
          600: '#556130',
          700: '#404a24',
        }
      },
      fontFamily: {
        sans: ['Rajdhani', 'system-ui', 'sans-serif'],
        mono: ['Share Tech Mono', 'monospace'],
        display: ['Oswald', 'sans-serif'],
      },
      backgroundImage: {
        'camo-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234a6e17' fill-opacity='0.08'%3E%3Ccircle cx='30' cy='30' r='15'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
