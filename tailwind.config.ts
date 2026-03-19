import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Friendly Blue Theme - Thân thiện + Đáng tin
        "bg-app": "var(--bg-app)",
        surface: "var(--surface)",
        "border-subtle": "var(--border-subtle)",
        "text-strong": "var(--text-strong)",
        "text-muted": "var(--text-muted)",

        // Primary - Blue Brand
        primary: {
          DEFAULT: "var(--primary-600)",
          600: "var(--primary-600)",
          700: "var(--primary-700)",
          foreground: "var(--primary-foreground)",
        },

        // Accent - Amber CTA (Buy/Pay/Confirm)
        accent: {
          DEFAULT: "var(--accent-600)",
          600: "var(--accent-600)",
          foreground: "var(--accent-foreground)",
        },

        // Status
        success: {
          DEFAULT: "var(--success-600)",
          600: "var(--success-600)",
        },
        warning: {
          DEFAULT: "var(--warning-600)",
          600: "var(--warning-600)",
        },
        error: {
          DEFAULT: "var(--error-600)",
          600: "var(--error-600)",
        },
        destructive: {
          DEFAULT: "var(--error-600)",
          foreground: "var(--primary-foreground)",
        },

        // Base colors from shadcn
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",

        // Chart colors - Friendly Blue palette
        chart: {
          1: "var(--chart-1)",
          2: "var(--chart-2)",
          3: "var(--chart-3)",
          4: "var(--chart-4)",
          5: "var(--chart-5)",
        },

        // Sidebar
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },
      borderRadius: {
        sm: "10px",
        md: "14px",
        lg: "18px",
        xl: "24px",
        pill: "9999px",
      },
      fontSize: {
        // Premium Typography Scale
        display: ["56px", { lineHeight: "64px", fontWeight: "700" }],
        h1: ["40px", { lineHeight: "48px", fontWeight: "700" }],
        h2: ["32px", { lineHeight: "40px", fontWeight: "700" }],
        h3: ["24px", { lineHeight: "32px", fontWeight: "600" }],
        h4: ["20px", { lineHeight: "28px", fontWeight: "600" }],
        h5: ["18px", { lineHeight: "28px", fontWeight: "600" }],
        h6: ["16px", { lineHeight: "24px", fontWeight: "600" }],
        "body-l": ["18px", { lineHeight: "30px", fontWeight: "400" }],
        body: ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-s": ["14px", { lineHeight: "22px", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "18px", fontWeight: "500" }],
      },
      spacing: {
        // 8pt spacing scale
        "4": "4px",
        "8": "8px",
        "12": "12px",
        "16": "16px",
        "24": "24px",
        "32": "32px",
        "40": "40px",
        "48": "48px",
        "56": "56px",
        "64": "64px",
        "72": "72px",
        "80": "80px",
        "88": "88px",
        "96": "96px",
      },
      boxShadow: {
        "elevation-1":
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "elevation-2":
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        "elevation-3":
          "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        "elevation-focus": "0 0 0 3px rgb(37 99 235 / 0.2)",
      },
      maxWidth: {
        container: "1600px",
        "container-lg": "1440px",
        "container-md": "1200px",
        "container-sm": "960px",
        text: "68ch",
      },
      screens: {
        xs: "430px",
        sm: "768px",
        md: "1024px",
        lg: "1280px",
        xl: "1440px",
        "2xl": "1536px",
        "3xl": "1920px",
      },
    },
  },
  plugins: [],
};

export default config;
