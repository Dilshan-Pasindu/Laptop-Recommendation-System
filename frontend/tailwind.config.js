/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Outfit', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        background: "#030014",
        surface: "#0a0520",
        surfaceHigh: "#100a2e",
        cardBg: "rgba(16, 10, 46, 0.6)",
        cardBorder: "rgba(139, 92, 246, 0.12)",
        cardBorderHover: "rgba(139, 92, 246, 0.35)",
        primary: {
          50:  "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          DEFAULT: "#8b5cf6",
          light: "#a78bfa",
          glow: "rgba(139, 92, 246, 0.4)",
        },
        cyan: {
          DEFAULT: "#06b6d4",
          light: "#22d3ee",
          glow: "rgba(6, 182, 212, 0.4)",
        },
        pink: {
          DEFAULT: "#ec4899",
          light: "#f472b6",
          glow: "rgba(236, 72, 153, 0.35)",
        },
        emerald: {
          DEFAULT: "#10b981",
          light: "#34d399",
          glow: "rgba(16, 185, 129, 0.35)",
        }
      },
      boxShadow: {
        neon: "0 0 20px rgba(139, 92, 246, 0.3), 0 0 60px rgba(139, 92, 246, 0.1)",
        neonCyan: "0 0 20px rgba(6, 182, 212, 0.3), 0 0 60px rgba(6, 182, 212, 0.1)",
        neonPink: "0 0 20px rgba(236, 72, 153, 0.3), 0 0 60px rgba(236, 72, 153, 0.1)",
        neonGreen: "0 0 20px rgba(16, 185, 129, 0.3), 0 0 60px rgba(16, 185, 129, 0.1)",
        card: "0 4px 24px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05) inset",
        cardHover: "0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(139, 92, 246, 0.3), 0 0 30px rgba(139, 92, 246, 0.15)",
        glass: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset",
        glassHover: "0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(139, 92, 246, 0.2) inset",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-glow": "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139, 92, 246, 0.15), transparent)",
        "card-shine": "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%)",
        "primary-glow": "linear-gradient(135deg, #8b5cf6, #6d28d9)",
        "cyan-glow": "linear-gradient(135deg, #22d3ee, #06b6d4)",
        "spectrum": "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 50%, #10b981 100%)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "float-delay": "float 6s ease-in-out 2s infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "gradient-x": "gradient-x 4s ease infinite",
        "scan-line": "scan-line 3s linear infinite",
        "fade-in-up": "fade-in-up 0.5s ease forwards",
        "orbit": "orbit 8s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        orbit: {
          "0%": { transform: "rotate(0deg) translateX(80px) rotate(0deg)" },
          "100%": { transform: "rotate(360deg) translateX(80px) rotate(-360deg)" },
        },
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
}
