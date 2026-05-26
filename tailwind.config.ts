import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Abril Fatface'", "sans-serif"],
        body: ["'Nunito Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
