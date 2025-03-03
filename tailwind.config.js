/** @type {import('tailwindcss').Config} */
module.exports = {
  ode: "jit",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        body: "var(--font-outfit), sans-serif",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
