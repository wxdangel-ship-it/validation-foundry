/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}", "./.storybook/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ember: "#f48b54",
        ink: "#091218",
        steel: "#90a5a8",
        sand: "#f4dec0",
        moss: "#8db98f",
        tide: "#1b3340",
      },
      boxShadow: {
        dune: "0 24px 64px rgba(0, 0, 0, 0.22)",
      },
    },
  },
  plugins: [],
};
