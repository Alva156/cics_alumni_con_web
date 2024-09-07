/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bgray: "#F6F6F6", //backgound color of our website
        hgray: "#D9D9D9", //Header color of our website
        fgray: "#3D3C3C", //Footer color of our website
        white: "#FFFEFE",
        grayt: "#FFFFFF", //gray text of our website
        black: "#000000",
        green: "#056E34",
        blue: "#1458BE",
        orange: "#E58008",
        red: "#BE142E",
      },
      letterSpacing: {
        "extra-wide": "0.5em",
      },
      height: { 128: "30rem", 130: "35rem" },

      fontSize: {
        xxs: "0.5rem",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["bumblebee"],
  },
};
