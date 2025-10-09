import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        md: "2rem",
        lg: "2.5rem",
        xl: "3rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    screens: {
      xs: "475px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1400px",
      "3xl": "1600px",
      // Device-specific breakpoints
      mobile: { max: "767px" },
      tablet: { min: "768px", max: "1023px" },
      desktop: { min: "1024px" },
      // Touch devices
      touch: { raw: "(pointer: coarse)" },
      "no-touch": { raw: "(pointer: fine)" },
      // Orientation
      portrait: { raw: "(orientation: portrait)" },
      landscape: { raw: "(orientation: landscape)" },
      // High DPI
      retina: { raw: "(-webkit-min-device-pixel-ratio: 2)" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        cinema: {
          yellow: "#FFD700",
          "yellow-dark": "#E6C200",
          dark: "#0A0A0A",
          "dark-lighter": "#1A1A1A",
          gray: "#2A2A2A",
          "gray-light": "#3A3A3A",
          "gray-lighter": "#4A4A4A",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "fade-in": {
          from: {
            opacity: "0",
            transform: "translateY(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "slide-up": {
          from: {
            opacity: "0",
            transform: "translateY(40px) scale(0.95)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0) scale(1)",
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0px) rotate(0deg)",
            opacity: "0.7",
          },
          "50%": {
            transform: "translateY(-20px) rotate(180deg)",
            opacity: "1",
          },
        },
        "spin-slow": {
          from: {
            transform: "rotate(0deg)",
          },
          to: {
            transform: "rotate(360deg)",
          },
        },
        glow: {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(255, 215, 0, 0.3)",
          },
          "50%": {
            boxShadow: "0 0 40px rgba(255, 215, 0, 0.6)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.8s ease-out",
        "slide-up": "slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        float: "float 6s ease-in-out infinite",
        "spin-slow": "spin-slow 20s linear infinite",
        glow: "glow 2s ease-in-out infinite",
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Add custom utilities
    function({ addUtilities, theme, e }: any) {
      const newUtilities = {
        // Touch-friendly sizing
        '.touch-target': {
          minHeight: '44px',
          minWidth: '44px',
        },
        '.touch-target-sm': {
          minHeight: '32px',
          minWidth: '32px',
        },
        '.touch-target-lg': {
          minHeight: '56px',
          minWidth: '56px',
        },
        // Device-specific hiding
        '.hide-mobile': {
          '@media (max-width: 767px)': {
            display: 'none',
          },
        },
        '.hide-tablet': {
          '@media (min-width: 768px) and (max-width: 1023px)': {
            display: 'none',
          },
        },
        '.hide-desktop': {
          '@media (min-width: 1024px)': {
            display: 'none',
          },
        },
        // Show only on specific devices
        '.mobile-only': {
          '@media (min-width: 768px)': {
            display: 'none',
          },
        },
        '.tablet-only': {
          '@media (max-width: 767px), (min-width: 1024px)': {
            display: 'none',
          },
        },
        '.desktop-only': {
          '@media (max-width: 1023px)': {
            display: 'none',
          },
        },
      };

      addUtilities(newUtilities, ['responsive', 'hover']);
    }
  ],
} satisfies Config;
