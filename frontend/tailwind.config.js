import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Lab colors (optional)
        "lab-blue": "#2563eb",
        "lab-cyan": "#06b6d4",
        "lab-emerald": "#10b981",
        "lab-purple": "#8b5cf6",
        "lab-orange": "#f59e0b",

        // StudyFlow core palette
        "sf-green": "#034F46",   // Calm accent
        "sf-dark": "#1A1A1A",    // Neutral dark text
        "sf-cream": "#FFFFEB",   // Warm background base
        "sf-light": "#FFFBEB",   // Slightly lighter cream
        "sf-border": "#FEF3C7",  // Soft amber border
        "sf-text": "#5C4A3D",    // Soft brown for warmth
      },
      backgroundImage: {
        "sf-gradient": "linear-gradient(to bottom right, #FFFBEB, #FFFFFF, #FEF3C7)",
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        fadeIn: "fadeIn 0.4s ease-in-out",
        "fadeIn-slow": "fadeIn 0.6s ease-in-out",
        "fadeIn-delay": "fadeIn 0.7s ease-in-out 0.1s both",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(4px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        studyflow: {
          primary: "#034F46",       // Buttons, links
          secondary: "#FFFBEB",     // Secondary highlights
          accent: "#FEF3C7",        // Borders, subtle accents
          neutral: "#1A1A1A",       // Default text
          "base-100": "#FFFFEB",    // Page backgrounds
          "base-200": "#FFFBEB",    // Slightly lighter panels
          "base-300": "#FEF3C7",    // Cards, borders
          info: "#2563eb",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
          "--rounded-btn": "0.5rem",
          "--rounded-box": "1rem",
        },
      },
      "light",
      "dark",
    ],
  },
};
