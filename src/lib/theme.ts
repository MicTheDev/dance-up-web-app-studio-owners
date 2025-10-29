'use client';

import { createTheme } from '@mui/material/styles';

// Create a theme with vibrant purple-pink gradient colors matching LDC dance studio
export const theme = createTheme({
  palette: {
    primary: {
      main: '#8B5CF6', // vibrant purple
      light: '#A78BFA', // lighter purple
      dark: '#7C3AED', // darker purple
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#EC4899', // vibrant pink
      light: '#F472B6', // lighter pink
      dark: '#DB2777', // darker pink
      contrastText: '#ffffff',
    },
    background: {
      default: '#FAF5FF', // very light purple tint
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1F2937', // dark gray
      secondary: '#6B7280', // medium gray
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
    },
    info: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
  },
  typography: {
    fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontWeight: 700,
      background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontWeight: 600,
          textTransform: 'none',
        },
        contained: {
          boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.39)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.1), 0 2px 4px -1px rgba(236, 72, 153, 0.06)',
          border: '1px solid rgba(139, 92, 246, 0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

