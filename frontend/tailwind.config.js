/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          // 透明度变体 - 玻璃拟态专用
          "500/5": "rgba(59, 130, 246, 0.05)",
          "500/10": "rgba(59, 130, 246, 0.1)",
          "500/20": "rgba(59, 130, 246, 0.2)",
          "500/40": "rgba(59, 130, 246, 0.4)",
          "500/60": "rgba(59, 130, 246, 0.6)",
          "500/80": "rgba(59, 130, 246, 0.8)",
        },
        emergency: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
          // 透明度变体
          "500/5": "rgba(239, 68, 68, 0.05)",
          "500/10": "rgba(239, 68, 68, 0.1)",
          "500/20": "rgba(239, 68, 68, 0.2)",
          "500/40": "rgba(239, 68, 68, 0.4)",
          "500/60": "rgba(239, 68, 68, 0.6)",
          "500/80": "rgba(239, 68, 68, 0.8)",
        },
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          // 透明度变体
          "500/5": "rgba(34, 197, 94, 0.05)",
          "500/10": "rgba(34, 197, 94, 0.1)",
          "500/20": "rgba(34, 197, 94, 0.2)",
          "500/40": "rgba(34, 197, 94, 0.4)",
          "500/60": "rgba(34, 197, 94, 0.6)",
          "500/80": "rgba(34, 197, 94, 0.8)",
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          // 透明度变体
          "500/5": "rgba(245, 158, 11, 0.05)",
          "500/10": "rgba(245, 158, 11, 0.1)",
          "500/20": "rgba(245, 158, 11, 0.2)",
          "500/40": "rgba(245, 158, 11, 0.4)",
          "500/60": "rgba(245, 158, 11, 0.6)",
          "500/80": "rgba(245, 158, 11, 0.8)",
        },
        // 玻璃拟态专用色彩
        glass: {
          light: "rgba(255, 255, 255, 0.1)",
          medium: "rgba(255, 255, 255, 0.2)",
          heavy: "rgba(255, 255, 255, 0.3)",
          border: "rgba(255, 255, 255, 0.2)",
          "dark-light": "rgba(0, 0, 0, 0.1)",
          "dark-medium": "rgba(0, 0, 0, 0.2)",
          "dark-heavy": "rgba(0, 0, 0, 0.3)",
          "dark-border": "rgba(255, 255, 255, 0.1)",
        },
        // 发光效果色彩
        glow: {
          blue: "rgba(59, 130, 246, 0.15)",
          red: "rgba(239, 68, 68, 0.15)",
          green: "rgba(34, 197, 94, 0.15)",
          purple: "rgba(147, 51, 234, 0.15)",
          yellow: "rgba(245, 158, 11, 0.15)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        // 增强的投影系统
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        medium:
          "0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        large: "0 10px 50px -12px rgba(0, 0, 0, 0.25)",
        // 发光效果阴影
        "glow-blue":
          "0 0 20px rgba(59, 130, 246, 0.15), 0 0 40px rgba(59, 130, 246, 0.1)",
        "glow-red":
          "0 0 20px rgba(239, 68, 68, 0.15), 0 0 40px rgba(239, 68, 68, 0.1)",
        "glow-green":
          "0 0 20px rgba(34, 197, 94, 0.15), 0 0 40px rgba(34, 197, 94, 0.1)",
        "glow-purple":
          "0 0 20px rgba(147, 51, 234, 0.15), 0 0 40px rgba(147, 51, 234, 0.1)",
        "glow-yellow":
          "0 0 20px rgba(245, 158, 11, 0.15), 0 0 40px rgba(245, 158, 11, 0.1)",
        // 玻璃效果阴影
        "glass-light": "0 8px 32px rgba(0, 0, 0, 0.1)",
        "glass-medium": "0 8px 32px rgba(0, 0, 0, 0.15)",
        "glass-heavy": "0 8px 32px rgba(0, 0, 0, 0.2)",
      },
      backgroundImage: {
        // 玻璃渐变背景
        "glass-gradient":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%)",
        "glass-gradient-dark":
          "linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 100%)",
        // 发光渐变
        "primary-glow":
          "linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.1) 100%)",
        "emergency-glow":
          "linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(239, 68, 68, 0.1) 100%)",
        "success-glow":
          "linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(34, 197, 94, 0.1) 100%)",
        // 微妙的纹理渐变
        "glass-texture":
          "linear-gradient(45deg, rgba(255, 255, 255, 0.1) 25%, transparent 25%, transparent 75%, rgba(255, 255, 255, 0.1) 75%)",
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "16px",
        xl: "24px",
        "2xl": "40px",
        "3xl": "64px",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        // 玻璃拟态专用动画
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "glass-shimmer": "glassShimmer 3s ease-in-out infinite",
        ripple: "ripple 0.6s linear",
        // 微交互动画
        "bounce-subtle": "bounceSubtle 0.3s ease-out",
        float: "float 3s ease-in-out infinite",
        "gradient-shift": "gradientShift 4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.1)" },
          "50%": { boxShadow: "0 0 30px rgba(59, 130, 246, 0.2)" },
        },
        glassShimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        ripple: {
          "0%": { transform: "scale(0)", opacity: "1" },
          "100%": { transform: "scale(4)", opacity: "0" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-2px)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
