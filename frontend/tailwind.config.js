/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // enables "dark:" variants via a class
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:"#eef9ff",100:"#d7f1ff",200:"#b0e3ff",300:"#81d1ff",
          400:"#4fb8ff",500:"#1f9fff",600:"#0f83e6",700:"#0b67b4",
          800:"#0e558f",900:"#0f4977"
        },
      },
      boxShadow: {
        card: "0 8px 30px rgba(2, 8, 23, .08)",
        glow: "0 0 4px rgba(255,255,255,.15), 0 10px 30px rgba(255,255,255,.25)",
      },
      borderRadius: { xl: "1rem", "2xl": "1.25rem" },
      backdropBlur: { xs: "2px" },
    },
  },
  plugins: [],
}

