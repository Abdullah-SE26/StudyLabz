/** @type {import('tailwindcss').Config} */

export default {

  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],

  theme: {
    extend: {
      colors: {
        "sf-green": "#034F46",
        "sf-dark": "#1A1A1A",
        "sf-cream": "#FFFFEB",
        "sf-light": "#FFFBEB",
        "sf-border": "#FEF3C7",
        "sf-text": "#5C4A3D",
      },
      backgroundImage: {
        "sf-gradient":
          "linear-gradient(to bottom right, #FFFBEB, #FFFFFF, #FEF3C7)",
      },
    },
  },

  daisyui: {

    themes: [

      {

        studyflow: {

          primary: "#034F46", // Buttons, borders, hover

          secondary: "#FFFBEB",

          accent: "#FEF3C7",

          neutral: "#1A1A1A",

          "base-100": "#FFFFEB",

          "base-200": "#FFFBEB",

          "base-300": "#FEF3C7",

          info: "#2563eb",

          success: "#10b981",

          warning: "#f59e0b",

          error: "#ef4444",

          "--rounded-btn": "0.5rem",

          "--rounded-box": "1rem",

        },

      },

    ],

    darkTheme: "studyflow",

  },

};
