/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#081318",
        sand: "#dcc7a0",
        ember: "#ef8d54",
        moss: "#84b59f",
        steel: "#8ba6b1",
      },
      boxShadow: {
        dune: "0 24px 80px rgba(8, 19, 24, 0.35)",
      },
      fontFamily: {
        sans: ["Trebuchet MS", "Gill Sans", "sans-serif"],
        display: ["Impact", "Haettenschweiler", "sans-serif"],
      },
    },
  },
  plugins: [],
};
