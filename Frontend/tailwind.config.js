/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', 
  theme: {
    extend: {
      colors: {
        // Map the CSS variables to Tailwind class names
        main: "var(--color-bg-main)",
        surface: "var(--color-bg-surface)",
        sidebar: "var(--color-sidebar)",
        
        primary: "var(--color-text-primary)",
        secondary: "var(--color-text-secondary)",
        
        divider: "var(--color-border)",
        brand: "var(--color-brand)",
        "brand-hover": "var(--color-brand-hover)",
      }
    },
  },
  plugins: [],
}