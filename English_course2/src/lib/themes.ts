export type ThemeMode = 'light' | 'dark' | 'system'

export type ThemeVariant = 
  | 'default' 
  | 'blue' 
  | 'green' 
  | 'purple' 
  | 'orange' 
  | 'red' 
  | 'rose' 
  | 'slate'

export interface ThemeConfig {
  mode: ThemeMode
  variant: ThemeVariant
}

export interface ThemeColors {
  background: string
  foreground: string
  card: string
  cardForeground: string
  popover: string
  popoverForeground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  destructive: string
  border: string
  input: string
  ring: string
}

export const themeVariants: Record<ThemeVariant, { light: ThemeColors; dark: ThemeColors }> = {
  default: {
    light: {
      background: 'oklch(1 0 0)',
      foreground: 'oklch(0.129 0.042 264.695)',
      card: 'oklch(1 0 0)',
      cardForeground: 'oklch(0.129 0.042 264.695)',
      popover: 'oklch(1 0 0)',
      popoverForeground: 'oklch(0.129 0.042 264.695)',
      primary: 'oklch(0.208 0.042 265.755)',
      primaryForeground: 'oklch(0.984 0.003 247.858)',
      secondary: 'oklch(0.968 0.007 247.896)',
      secondaryForeground: 'oklch(0.208 0.042 265.755)',
      muted: 'oklch(0.968 0.007 247.896)',
      mutedForeground: 'oklch(0.554 0.046 257.417)',
      accent: 'oklch(0.968 0.007 247.896)',
      accentForeground: 'oklch(0.208 0.042 265.755)',
      destructive: 'oklch(0.577 0.245 27.325)',
      border: 'oklch(0.929 0.013 255.508)',
      input: 'oklch(0.929 0.013 255.508)',
      ring: 'oklch(0.704 0.04 256.788)',
    },
    dark: {
      background: 'oklch(0.129 0.042 264.695)',
      foreground: 'oklch(0.984 0.003 247.858)',
      card: 'oklch(0.208 0.042 265.755)',
      cardForeground: 'oklch(0.984 0.003 247.858)',
      popover: 'oklch(0.208 0.042 265.755)',
      popoverForeground: 'oklch(0.984 0.003 247.858)',
      primary: 'oklch(0.929 0.013 255.508)',
      primaryForeground: 'oklch(0.208 0.042 265.755)',
      secondary: 'oklch(0.279 0.041 260.031)',
      secondaryForeground: 'oklch(0.984 0.003 247.858)',
      muted: 'oklch(0.279 0.041 260.031)',
      mutedForeground: 'oklch(0.704 0.04 256.788)',
      accent: 'oklch(0.279 0.041 260.031)',
      accentForeground: 'oklch(0.984 0.003 247.858)',
      destructive: 'oklch(0.704 0.191 22.216)',
      border: 'oklch(1 0 0 / 10%)',
      input: 'oklch(1 0 0 / 15%)',
      ring: 'oklch(0.551 0.027 264.364)',
    }
  },
  blue: {
    light: {
      background: 'oklch(1 0 0)',
      foreground: 'oklch(0.15 0.05 240)',
      card: 'oklch(1 0 0)',
      cardForeground: 'oklch(0.15 0.05 240)',
      popover: 'oklch(1 0 0)',
      popoverForeground: 'oklch(0.15 0.05 240)',
      primary: 'oklch(0.55 0.25 240)',
      primaryForeground: 'oklch(0.98 0.02 240)',
      secondary: 'oklch(0.96 0.02 240)',
      secondaryForeground: 'oklch(0.25 0.05 240)',
      muted: 'oklch(0.96 0.02 240)',
      mutedForeground: 'oklch(0.45 0.05 240)',
      accent: 'oklch(0.96 0.02 240)',
      accentForeground: 'oklch(0.25 0.05 240)',
      destructive: 'oklch(0.577 0.245 27.325)',
      border: 'oklch(0.9 0.02 240)',
      input: 'oklch(0.9 0.02 240)',
      ring: 'oklch(0.55 0.25 240)',
    },
    dark: {
      background: 'oklch(0.08 0.02 240)',
      foreground: 'oklch(0.98 0.02 240)',
      card: 'oklch(0.12 0.03 240)',
      cardForeground: 'oklch(0.98 0.02 240)',
      popover: 'oklch(0.12 0.03 240)',
      popoverForeground: 'oklch(0.98 0.02 240)',
      primary: 'oklch(0.7 0.25 240)',
      primaryForeground: 'oklch(0.08 0.02 240)',
      secondary: 'oklch(0.2 0.03 240)',
      secondaryForeground: 'oklch(0.98 0.02 240)',
      muted: 'oklch(0.2 0.03 240)',
      mutedForeground: 'oklch(0.65 0.05 240)',
      accent: 'oklch(0.2 0.03 240)',
      accentForeground: 'oklch(0.98 0.02 240)',
      destructive: 'oklch(0.704 0.191 22.216)',
      border: 'oklch(0.2 0.03 240)',
      input: 'oklch(0.2 0.03 240)',
      ring: 'oklch(0.7 0.25 240)',
    }
  },
  green: {
    light: {
      background: 'oklch(1 0 0)',
      foreground: 'oklch(0.15 0.05 140)',
      card: 'oklch(1 0 0)',
      cardForeground: 'oklch(0.15 0.05 140)',
      popover: 'oklch(1 0 0)',
      popoverForeground: 'oklch(0.15 0.05 140)',
      primary: 'oklch(0.55 0.25 140)',
      primaryForeground: 'oklch(0.98 0.02 140)',
      secondary: 'oklch(0.96 0.02 140)',
      secondaryForeground: 'oklch(0.25 0.05 140)',
      muted: 'oklch(0.96 0.02 140)',
      mutedForeground: 'oklch(0.45 0.05 140)',
      accent: 'oklch(0.96 0.02 140)',
      accentForeground: 'oklch(0.25 0.05 140)',
      destructive: 'oklch(0.577 0.245 27.325)',
      border: 'oklch(0.9 0.02 140)',
      input: 'oklch(0.9 0.02 140)',
      ring: 'oklch(0.55 0.25 140)',
    },
    dark: {
      background: 'oklch(0.08 0.02 140)',
      foreground: 'oklch(0.98 0.02 140)',
      card: 'oklch(0.12 0.03 140)',
      cardForeground: 'oklch(0.98 0.02 140)',
      popover: 'oklch(0.12 0.03 140)',
      popoverForeground: 'oklch(0.98 0.02 140)',
      primary: 'oklch(0.7 0.25 140)',
      primaryForeground: 'oklch(0.08 0.02 140)',
      secondary: 'oklch(0.2 0.03 140)',
      secondaryForeground: 'oklch(0.98 0.02 140)',
      muted: 'oklch(0.2 0.03 140)',
      mutedForeground: 'oklch(0.65 0.05 140)',
      accent: 'oklch(0.2 0.03 140)',
      accentForeground: 'oklch(0.98 0.02 140)',
      destructive: 'oklch(0.704 0.191 22.216)',
      border: 'oklch(0.2 0.03 140)',
      input: 'oklch(0.2 0.03 140)',
      ring: 'oklch(0.7 0.25 140)',
    }
  },
  purple: {
    light: {
      background: 'oklch(1 0 0)',
      foreground: 'oklch(0.15 0.05 280)',
      card: 'oklch(1 0 0)',
      cardForeground: 'oklch(0.15 0.05 280)',
      popover: 'oklch(1 0 0)',
      popoverForeground: 'oklch(0.15 0.05 280)',
      primary: 'oklch(0.55 0.25 280)',
      primaryForeground: 'oklch(0.98 0.02 280)',
      secondary: 'oklch(0.96 0.02 280)',
      secondaryForeground: 'oklch(0.25 0.05 280)',
      muted: 'oklch(0.96 0.02 280)',
      mutedForeground: 'oklch(0.45 0.05 280)',
      accent: 'oklch(0.96 0.02 280)',
      accentForeground: 'oklch(0.25 0.05 280)',
      destructive: 'oklch(0.577 0.245 27.325)',
      border: 'oklch(0.9 0.02 280)',
      input: 'oklch(0.9 0.02 280)',
      ring: 'oklch(0.55 0.25 280)',
    },
    dark: {
      background: 'oklch(0.08 0.02 280)',
      foreground: 'oklch(0.98 0.02 280)',
      card: 'oklch(0.12 0.03 280)',
      cardForeground: 'oklch(0.98 0.02 280)',
      popover: 'oklch(0.12 0.03 280)',
      popoverForeground: 'oklch(0.98 0.02 280)',
      primary: 'oklch(0.7 0.25 280)',
      primaryForeground: 'oklch(0.08 0.02 280)',
      secondary: 'oklch(0.2 0.03 280)',
      secondaryForeground: 'oklch(0.98 0.02 280)',
      muted: 'oklch(0.2 0.03 280)',
      mutedForeground: 'oklch(0.65 0.05 280)',
      accent: 'oklch(0.2 0.03 280)',
      accentForeground: 'oklch(0.98 0.02 280)',
      destructive: 'oklch(0.704 0.191 22.216)',
      border: 'oklch(0.2 0.03 280)',
      input: 'oklch(0.2 0.03 280)',
      ring: 'oklch(0.7 0.25 280)',
    }
  },
  orange: {
    light: {
      background: 'oklch(1 0 0)',
      foreground: 'oklch(0.15 0.05 40)',
      card: 'oklch(1 0 0)',
      cardForeground: 'oklch(0.15 0.05 40)',
      popover: 'oklch(1 0 0)',
      popoverForeground: 'oklch(0.15 0.05 40)',
      primary: 'oklch(0.55 0.25 40)',
      primaryForeground: 'oklch(0.98 0.02 40)',
      secondary: 'oklch(0.96 0.02 40)',
      secondaryForeground: 'oklch(0.25 0.05 40)',
      muted: 'oklch(0.96 0.02 40)',
      mutedForeground: 'oklch(0.45 0.05 40)',
      accent: 'oklch(0.96 0.02 40)',
      accentForeground: 'oklch(0.25 0.05 40)',
      destructive: 'oklch(0.577 0.245 27.325)',
      border: 'oklch(0.9 0.02 40)',
      input: 'oklch(0.9 0.02 40)',
      ring: 'oklch(0.55 0.25 40)',
    },
    dark: {
      background: 'oklch(0.08 0.02 40)',
      foreground: 'oklch(0.98 0.02 40)',
      card: 'oklch(0.12 0.03 40)',
      cardForeground: 'oklch(0.98 0.02 40)',
      popover: 'oklch(0.12 0.03 40)',
      popoverForeground: 'oklch(0.98 0.02 40)',
      primary: 'oklch(0.7 0.25 40)',
      primaryForeground: 'oklch(0.08 0.02 40)',
      secondary: 'oklch(0.2 0.03 40)',
      secondaryForeground: 'oklch(0.98 0.02 40)',
      muted: 'oklch(0.2 0.03 40)',
      mutedForeground: 'oklch(0.65 0.05 40)',
      accent: 'oklch(0.2 0.03 40)',
      accentForeground: 'oklch(0.98 0.02 40)',
      destructive: 'oklch(0.704 0.191 22.216)',
      border: 'oklch(0.2 0.03 40)',
      input: 'oklch(0.2 0.03 40)',
      ring: 'oklch(0.7 0.25 40)',
    }
  },
  red: {
    light: {
      background: 'oklch(1 0 0)',
      foreground: 'oklch(0.15 0.05 20)',
      card: 'oklch(1 0 0)',
      cardForeground: 'oklch(0.15 0.05 20)',
      popover: 'oklch(1 0 0)',
      popoverForeground: 'oklch(0.15 0.05 20)',
      primary: 'oklch(0.55 0.25 20)',
      primaryForeground: 'oklch(0.98 0.02 20)',
      secondary: 'oklch(0.96 0.02 20)',
      secondaryForeground: 'oklch(0.25 0.05 20)',
      muted: 'oklch(0.96 0.02 20)',
      mutedForeground: 'oklch(0.45 0.05 20)',
      accent: 'oklch(0.96 0.02 20)',
      accentForeground: 'oklch(0.25 0.05 20)',
      destructive: 'oklch(0.577 0.245 27.325)',
      border: 'oklch(0.9 0.02 20)',
      input: 'oklch(0.9 0.02 20)',
      ring: 'oklch(0.55 0.25 20)',
    },
    dark: {
      background: 'oklch(0.08 0.02 20)',
      foreground: 'oklch(0.98 0.02 20)',
      card: 'oklch(0.12 0.03 20)',
      cardForeground: 'oklch(0.98 0.02 20)',
      popover: 'oklch(0.12 0.03 20)',
      popoverForeground: 'oklch(0.98 0.02 20)',
      primary: 'oklch(0.7 0.25 20)',
      primaryForeground: 'oklch(0.08 0.02 20)',
      secondary: 'oklch(0.2 0.03 20)',
      secondaryForeground: 'oklch(0.98 0.02 20)',
      muted: 'oklch(0.2 0.03 20)',
      mutedForeground: 'oklch(0.65 0.05 20)',
      accent: 'oklch(0.2 0.03 20)',
      accentForeground: 'oklch(0.98 0.02 20)',
      destructive: 'oklch(0.704 0.191 22.216)',
      border: 'oklch(0.2 0.03 20)',
      input: 'oklch(0.2 0.03 20)',
      ring: 'oklch(0.7 0.25 20)',
    }
  },
  rose: {
    light: {
      background: 'oklch(1 0 0)',
      foreground: 'oklch(0.15 0.05 350)',
      card: 'oklch(1 0 0)',
      cardForeground: 'oklch(0.15 0.05 350)',
      popover: 'oklch(1 0 0)',
      popoverForeground: 'oklch(0.15 0.05 350)',
      primary: 'oklch(0.55 0.25 350)',
      primaryForeground: 'oklch(0.98 0.02 350)',
      secondary: 'oklch(0.96 0.02 350)',
      secondaryForeground: 'oklch(0.25 0.05 350)',
      muted: 'oklch(0.96 0.02 350)',
      mutedForeground: 'oklch(0.45 0.05 350)',
      accent: 'oklch(0.96 0.02 350)',
      accentForeground: 'oklch(0.25 0.05 350)',
      destructive: 'oklch(0.577 0.245 27.325)',
      border: 'oklch(0.9 0.02 350)',
      input: 'oklch(0.9 0.02 350)',
      ring: 'oklch(0.55 0.25 350)',
    },
    dark: {
      background: 'oklch(0.08 0.02 350)',
      foreground: 'oklch(0.98 0.02 350)',
      card: 'oklch(0.12 0.03 350)',
      cardForeground: 'oklch(0.98 0.02 350)',
      popover: 'oklch(0.12 0.03 350)',
      popoverForeground: 'oklch(0.98 0.02 350)',
      primary: 'oklch(0.7 0.25 350)',
      primaryForeground: 'oklch(0.08 0.02 350)',
      secondary: 'oklch(0.2 0.03 350)',
      secondaryForeground: 'oklch(0.98 0.02 350)',
      muted: 'oklch(0.2 0.03 350)',
      mutedForeground: 'oklch(0.65 0.05 350)',
      accent: 'oklch(0.2 0.03 350)',
      accentForeground: 'oklch(0.98 0.02 350)',
      destructive: 'oklch(0.704 0.191 22.216)',
      border: 'oklch(0.2 0.03 350)',
      input: 'oklch(0.2 0.03 350)',
      ring: 'oklch(0.7 0.25 350)',
    }
  },
  slate: {
    light: {
      background: 'oklch(1 0 0)',
      foreground: 'oklch(0.129 0.042 264.695)',
      card: 'oklch(1 0 0)',
      cardForeground: 'oklch(0.129 0.042 264.695)',
      popover: 'oklch(1 0 0)',
      popoverForeground: 'oklch(0.129 0.042 264.695)',
      primary: 'oklch(0.208 0.042 265.755)',
      primaryForeground: 'oklch(0.984 0.003 247.858)',
      secondary: 'oklch(0.968 0.007 247.896)',
      secondaryForeground: 'oklch(0.208 0.042 265.755)',
      muted: 'oklch(0.968 0.007 247.896)',
      mutedForeground: 'oklch(0.554 0.046 257.417)',
      accent: 'oklch(0.968 0.007 247.896)',
      accentForeground: 'oklch(0.208 0.042 265.755)',
      destructive: 'oklch(0.577 0.245 27.325)',
      border: 'oklch(0.929 0.013 255.508)',
      input: 'oklch(0.929 0.013 255.508)',
      ring: 'oklch(0.704 0.04 256.788)',
    },
    dark: {
      background: 'oklch(0.129 0.042 264.695)',
      foreground: 'oklch(0.984 0.003 247.858)',
      card: 'oklch(0.208 0.042 265.755)',
      cardForeground: 'oklch(0.984 0.003 247.858)',
      popover: 'oklch(0.208 0.042 265.755)',
      popoverForeground: 'oklch(0.984 0.003 247.858)',
      primary: 'oklch(0.929 0.013 255.508)',
      primaryForeground: 'oklch(0.208 0.042 265.755)',
      secondary: 'oklch(0.279 0.041 260.031)',
      secondaryForeground: 'oklch(0.984 0.003 247.858)',
      muted: 'oklch(0.279 0.041 260.031)',
      mutedForeground: 'oklch(0.704 0.04 256.788)',
      accent: 'oklch(0.279 0.041 260.031)',
      accentForeground: 'oklch(0.984 0.003 247.858)',
      destructive: 'oklch(0.704 0.191 22.216)',
      border: 'oklch(1 0 0 / 10%)',
      input: 'oklch(1 0 0 / 15%)',
      ring: 'oklch(0.551 0.027 264.364)',
    }
  }
}

export function getThemeColors(variant: ThemeVariant, mode: 'light' | 'dark'): ThemeColors {
  return themeVariants[variant][mode]
}

export function generateThemeCSS(variant: ThemeVariant, mode: 'light' | 'dark'): string {
  const colors = getThemeColors(variant, mode)
  const cssVars = Object.entries(colors)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      return `  --${cssKey}: ${value};`
    })
    .join('\n')
  
  return cssVars
}
