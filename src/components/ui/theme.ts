import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        body: { value: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
        heading: { value: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
        mono: { value: "var(--font-geist-mono), 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace" },
      },
      colors: {
        // Bright, airy background colors
        bg: {
          canvas: { value: "#fefefe" },
          subtle: { value: "#fcfcfc" },
          muted: { value: "#f9f9f9" },
          emphasis: { value: "#ffffff" },
        },
        
        // Light gray palette for text and borders
        gray: {
          50: { value: "#fafafa" },
          100: { value: "#f5f5f5" },
          200: { value: "#e5e5e5" },
          300: { value: "#d4d4d4" },
          400: { value: "#a3a3a3" },
          500: { value: "#737373" },
          600: { value: "#525252" },
          700: { value: "#404040" },
          800: { value: "#262626" },
          900: { value: "#171717" },
          950: { value: "#0a0a0a" },
        },

        // Custom palette from user - warm cream (f4f1de)
        cream: {
          50: { value: "#fcfaf7" },
          100: { value: "#f9f6f0" },
          200: { value: "#f4f1de" },
          300: { value: "#ede7ca" },
          400: { value: "#e3d9ae" },
          500: { value: "#d7cb8f" },
          600: { value: "#c9b975" },
          700: { value: "#b5a160" },
          800: { value: "#938352" },
          900: { value: "#766b47" },
          950: { value: "#3e3724" },
        },

        // Coral/orange accent (e07a5f) 
        coral: {
          50: { value: "#fdf4f3" },
          100: { value: "#fce8e4" },
          200: { value: "#f9d5cd" },
          300: { value: "#f4b8aa" },
          400: { value: "#ec9177" },
          500: { value: "#e07a5f" },
          600: { value: "#d05a3a" },
          700: { value: "#af4a2b" },
          800: { value: "#913f26" },
          900: { value: "#773725" },
          950: { value: "#401a10" },
        },

        // Deep blue/navy (3d405b) 
        navy: {
          50: { value: "#f4f4f6" },
          100: { value: "#e7e8ec" },
          200: { value: "#d2d4db" },
          300: { value: "#b1b5c1" },
          400: { value: "#898fa1" },
          500: { value: "#6d7385" },
          600: { value: "#5a5f70" },
          700: { value: "#4a4e5c" },
          800: { value: "#3d405b" },
          900: { value: "#36394e" },
          950: { value: "#232532" },
        },

        // Sage green (81b29a)
        sage: {
          50: { value: "#f4f8f6" },
          100: { value: "#e6f1ea" },
          200: { value: "#cfe3d6" },
          300: { value: "#abceb8" },
          400: { value: "#81b29a" },
          500: { value: "#5f967a" },
          600: { value: "#4a7960" },
          700: { value: "#3d614f" },
          800: { value: "#334e41" },
          900: { value: "#2c4137" },
          950: { value: "#16241c" },
        },

        // Golden yellow (f2cc8f)
        golden: {
          50: { value: "#fefbf3" },
          100: { value: "#fdf5e1" },
          200: { value: "#fae9c2" },
          300: { value: "#f6d898" },
          400: { value: "#f2cc8f" },
          500: { value: "#eab654" },
          600: { value: "#d99d39" },
          700: { value: "#b57e2f" },
          800: { value: "#92642a" },
          900: { value: "#775326" },
          950: { value: "#422b11" },
        },

        // Primary (navy for main actions)
        primary: {
          50: { value: "#f4f4f6" },
          100: { value: "#e7e8ec" },
          200: { value: "#d2d4db" },
          300: { value: "#b1b5c1" },
          400: { value: "#898fa1" },
          500: { value: "#6d7385" },
          600: { value: "#5a5f70" },
          700: { value: "#4a4e5c" },
          800: { value: "#3d405b" },
          900: { value: "#36394e" },
          950: { value: "#232532" },
        },

        // Success (sage green)
        success: {
          50: { value: "#f4f8f6" },
          100: { value: "#e6f1ea" },
          200: { value: "#cfe3d6" },
          300: { value: "#abceb8" },
          400: { value: "#81b29a" },
          500: { value: "#5f967a" },
          600: { value: "#4a7960" },
          700: { value: "#3d614f" },
          800: { value: "#334e41" },
          900: { value: "#2c4137" },
          950: { value: "#16241c" },
        },

        // Warning (golden yellow)
        warning: {
          50: { value: "#fefbf3" },
          100: { value: "#fdf5e1" },
          200: { value: "#fae9c2" },
          300: { value: "#f6d898" },
          400: { value: "#f2cc8f" },
          500: { value: "#eab654" },
          600: { value: "#d99d39" },
          700: { value: "#b57e2f" },
          800: { value: "#92642a" },
          900: { value: "#775326" },
          950: { value: "#422b11" },
        },

        // Error (coral)
        error: {
          50: { value: "#fdf4f3" },
          100: { value: "#fce8e4" },
          200: { value: "#f9d5cd" },
          300: { value: "#f4b8aa" },
          400: { value: "#ec9177" },
          500: { value: "#e07a5f" },
          600: { value: "#d05a3a" },
          700: { value: "#af4a2b" },
          800: { value: "#913f26" },
          900: { value: "#773725" },
          950: { value: "#401a10" },
        },

        // Accent (cream for special elements)
        accent: {
          50: { value: "#fcfaf7" },
          100: { value: "#f9f6f0" },
          200: { value: "#f4f1de" },
          300: { value: "#ede7ca" },
          400: { value: "#e3d9ae" },
          500: { value: "#d7cb8f" },
          600: { value: "#c9b975" },
          700: { value: "#b5a160" },
          800: { value: "#938352" },
          900: { value: "#766b47" },
          950: { value: "#3e3724" },
        },
      },
      
      radii: {
        sm: { value: "0.375rem" },
        md: { value: "0.5rem" },
        lg: { value: "0.75rem" },
        xl: { value: "1rem" },
        "2xl": { value: "1.25rem" },
      },
      
      shadows: {
        sm: { value: "0 1px 2px 0 rgba(61, 64, 91, 0.05)" },
        md: { value: "0 4px 6px -1px rgba(61, 64, 91, 0.1), 0 2px 4px -1px rgba(61, 64, 91, 0.06)" },
        lg: { value: "0 10px 15px -3px rgba(61, 64, 91, 0.1), 0 4px 6px -2px rgba(61, 64, 91, 0.05)" },
        xl: { value: "0 20px 25px -5px rgba(61, 64, 91, 0.1), 0 10px 10px -5px rgba(61, 64, 91, 0.04)" },
      },
    },
    
    // Explicitly register color palettes for components
    semanticTokens: {
      colors: {
        // Bright background colors
        "bg.canvas": {
          value: "{bg.canvas}",
        },
        "bg.subtle": {
          value: "{bg.subtle}",
        },
        "bg.surface": {
          value: "{bg.emphasis}",
        },
        
        // Text colors with good contrast on bright backgrounds
        "fg.default": {
          value: "{navy.800}",
        },
        "fg.muted": {
          value: "{navy.600}",
        },
        "fg.subtle": {
          value: "{navy.400}",
        },
        
        // Border colors - very light for minimal appearance
        "border.default": {
          value: "{gray.200}",
        },
        "border.muted": {
          value: "{gray.100}",
        },
        
        // Component colors
        "colorPalette.50": { value: "{primary.50}" },
        "colorPalette.100": { value: "{primary.100}" },
        "colorPalette.200": { value: "{primary.200}" },
        "colorPalette.300": { value: "{primary.300}" },
        "colorPalette.400": { value: "{primary.400}" },
        "colorPalette.500": { value: "{primary.500}" },
        "colorPalette.600": { value: "{primary.600}" },
        "colorPalette.700": { value: "{primary.700}" },
        "colorPalette.800": { value: "{primary.800}" },
        "colorPalette.900": { value: "{primary.900}" },
        "colorPalette.950": { value: "{primary.950}" },
      },
    },
  },
  
  globalCss: {
    "html, body": {
      background: "bg.canvas",
      color: "fg.default",
      fontFamily: "body",
      lineHeight: "1.6",
      letterSpacing: "-0.011em",
    },
    
    "h1, h2, h3, h4, h5, h6": {
      fontFamily: "heading",
      fontWeight: "600",
      lineHeight: "1.2",
      letterSpacing: "-0.025em",
      color: "navy.800",
    },
    
    // Smooth transitions for better UX
    "*": {
      transition: "colors 150ms ease, border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease",
    },
  },
})

export const system = createSystem(defaultConfig, config)
