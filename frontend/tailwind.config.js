/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: {
            900: '#071A2E',
            800: '#0A2540',
            700: '#0F3A66',
            600: '#154B82',
            500: '#1E609A',
            100: '#E6F0FA',
            50: '#F0F6FC'
          },
          saffron: {
            DEFAULT: '#E65100',
            light: '#FF9933',
            dark: '#BF360C',
            50: '#FFF7ED',
            100: '#FFEDD5',
            600: '#EA580C',
            700: '#C2410C'
          },
          green: {
            DEFAULT: '#138808',
            light: '#2E7D32',
            dark: '#0D5C05',
            50: '#F0FDF4',
            100: '#DCFCE7',
            600: '#16A34A',
            700: '#15803D'
          },
          ashoka: '#002B7F',
          gold: '#C59B27',
          sand: '#FAF8F5',
          border: '#D8DEE4',
          slate: '#475569'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        mono: ['Menlo', 'Monaco', 'Courier New', 'monospace']
      }
    },
  },
  plugins: [],
}
