import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "lab-blue": "#2563eb",
        "lab-cyan": "#06b6d4",
        "lab-emerald": "#10b981",
        "lab-purple": "#8b5cf6",
        "lab-orange": "#f59e0b",
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
};
