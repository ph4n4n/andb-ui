/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#edf0f9',
          100: '#d5dcf1',
          200: '#abbbd8',
          300: '#8299bf',
          400: '#5a77a6',
          500: '#32558c',
          600: '#264678',
          700: '#1b3864',
          800: '#122b50',
          900: '#0a1f3d',
          950: '#061529',
        },
        gray: {
          50: '#f8f8f8',
          100: '#f3f3f3', // VS Code Light Sidebar
          200: '#e5e5e5',
          300: '#cccccc',
          400: '#a3a3a3',
          500: '#858585',
          600: '#525252',
          700: '#3c3c3c', // VS Code Dark Header
          800: '#252526', // VS Code Dark Sidebar
          900: '#1e1e1e', // VS Code Dark Background
          950: '#121212',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
  darkMode: 'class',
}
