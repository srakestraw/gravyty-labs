import { createTheme, ThemeOptions, Theme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

// Extend MUI theme with custom properties
declare module '@mui/material/styles' {
  interface Theme {
    custom?: {
      shadows?: {
        soft: string;
        medium: string;
        strong: string;
      };
      transitions?: {
        fast: string;
        normal: string;
        slow: string;
      };
    };
  }
  interface ThemeOptions {
    custom?: {
      shadows?: {
        soft: string;
        medium: string;
        strong: string;
      };
      transitions?: {
        fast: string;
        normal: string;
        slow: string;
      };
    };
  }
}

/**
 * Base theme configuration following MUI design principles
 * with custom Gravyty Labs styling
 */
export const createGravytyTheme = (mode: PaletteMode = 'light'): Theme => {
  const isLight = mode === 'light';

  const baseTheme: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: isLight ? '#0052CC' : '#2172E5', // Jira blue / lighter blue for dark
        light: isLight ? '#2684FF' : '#4C9AFF',
        dark: isLight ? '#0065FF' : '#0052CC',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: isLight ? '#6554C0' : '#8777D9', // Purple
        light: isLight ? '#8777D9' : '#A594F9',
        dark: isLight ? '#5243AA' : '#6554C0',
        contrastText: '#FFFFFF',
      },
      error: {
        main: isLight ? '#DE350B' : '#FF5630',
        light: isLight ? '#FF5630' : '#FF8F73',
        dark: isLight ? '#BF2600' : '#DE350B',
        contrastText: '#FFFFFF',
      },
      warning: {
        main: isLight ? '#FFAB00' : '#FFC400',
        light: isLight ? '#FFC400' : '#FFE380',
        dark: isLight ? '#FF8B00' : '#FFAB00',
        contrastText: '#FFFFFF',
      },
      info: {
        main: isLight ? '#00B8D9' : '#00D9F5', // Teal
        light: isLight ? '#00D9F5' : '#79E2F2',
        dark: isLight ? '#00A3BF' : '#00B8D9',
        contrastText: '#FFFFFF',
      },
      success: {
        main: isLight ? '#36B37E' : '#4BCE97',
        light: isLight ? '#4BCE97' : '#7EE2B8',
        dark: isLight ? '#00875A' : '#36B37E',
        contrastText: '#FFFFFF',
      },
      background: {
        default: isLight ? '#FFFFFF' : '#0A1A2F',
        paper: isLight ? '#FFFFFF' : '#1A2A3F',
      },
      text: {
        primary: isLight ? '#172B4D' : '#FFFFFF',
        secondary: isLight ? '#6B778C' : '#B3BAC5',
      },
      divider: isLight ? '#DFE1E6' : '#344563',
    },
    typography: {
      fontFamily: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 700,
        lineHeight: 1.3,
        letterSpacing: '-0.01em',
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.5,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: 1.5,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
    spacing: 8, // 8px base unit
    shadows: [
      'none',
      '0px 1px 2px rgba(9, 30, 66, 0.08)',
      '0px 2px 4px rgba(9, 30, 66, 0.08)',
      '0px 4px 8px rgba(9, 30, 66, 0.08)',
      '0px 8px 16px rgba(9, 30, 66, 0.08)',
      '0px 12px 24px rgba(9, 30, 66, 0.12)',
      '0px 16px 32px rgba(9, 30, 66, 0.12)',
      '0px 20px 40px rgba(9, 30, 66, 0.16)',
      '0px 24px 48px rgba(9, 30, 66, 0.16)',
      '0px 28px 56px rgba(9, 30, 66, 0.2)',
      '0px 32px 64px rgba(9, 30, 66, 0.2)',
      '0px 36px 72px rgba(9, 30, 66, 0.24)',
      '0px 40px 80px rgba(9, 30, 66, 0.24)',
      '0px 44px 88px rgba(9, 30, 66, 0.28)',
      '0px 48px 96px rgba(9, 30, 66, 0.28)',
      '0px 52px 104px rgba(9, 30, 66, 0.32)',
      '0px 56px 112px rgba(9, 30, 66, 0.32)',
      '0px 60px 120px rgba(9, 30, 66, 0.36)',
      '0px 64px 128px rgba(9, 30, 66, 0.36)',
      '0px 68px 136px rgba(9, 30, 66, 0.4)',
      '0px 72px 144px rgba(9, 30, 66, 0.4)',
      '0px 76px 152px rgba(9, 30, 66, 0.44)',
      '0px 80px 160px rgba(9, 30, 66, 0.44)',
      '0px 84px 168px rgba(9, 30, 66, 0.48)',
    ],
    transitions: {
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
      },
      easing: {
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
    },
    // Custom theme extensions
    custom: {
      shadows: {
        soft: '0px 2px 8px rgba(9, 30, 66, 0.08)',
        medium: '0px 4px 16px rgba(9, 30, 66, 0.12)',
        strong: '0px 8px 24px rgba(9, 30, 66, 0.16)',
      },
      transitions: {
        fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
        normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
        slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
    components: {
      // Global component overrides will go here
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 16px',
            fontWeight: 500,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0px 2px 8px rgba(9, 30, 66, 0.08)',
          },
        },
      },
    },
  };

  return createTheme(baseTheme);
};

// Export default light theme
export const defaultTheme = createGravytyTheme('light');

