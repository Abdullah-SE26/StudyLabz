import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],

  plugins: [daisyui],

  daisyui: {
    themes: [
      {
        studyflow: {
          primary: "#034F46",
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
