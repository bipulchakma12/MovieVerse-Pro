import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f2',
          100: '#ffe4e6',
          500: '#e11d48',
          600: '#e11d48',
          700: '#be123c',
          900: '#881337',
        },
        dark: {
          bg: '#0a0a0f',
          card: '#12121a',
          nav: '#0f0f17',
          border: '#1f1f2e',
        }
      },
    },
  },
  plugins: [],
};
export default config;
