

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { createTheme, Theme, ThemeOptions } from '@mui/material/styles';
import createCache from '@emotion/cache';
import stylisRtlPlugin from 'stylis-plugin-rtl';

const commonSettings: Omit<ThemeOptions, 'palette'> = {
  direction: 'rtl',
  typography: {
    fontFamily: "'Assistant', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: {
      fontWeight: 600
    }
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { 
          textTransform: 'none', 
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          }
        },
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: 'none' }
      }
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--card-shadow)',
        },
      }
    },
    MuiCard: {
        styleOverrides: {
            root: {
                boxShadow: 'var(--card-shadow)',
                border: '1px solid var(--border-color)',
            }
        }
    },
    MuiTabs: {
        styleOverrides: {
            indicator: {
                height: '3px',
                borderRadius: '3px 3px 0 0'
            }
        }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 'var(--card-radius)'
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: 'var(--text-color-light)'
        }
      }
    }
  }
};

export const getTheme = (mode: 'light' | 'dark'): Theme => {
  if (mode === 'light') {
    return createTheme({
      ...commonSettings,
      palette: {
        mode: 'light',
        primary: { 
          main: 'hsl(248 75% 60%)',
          dark: 'hsl(248, 75%, 55%)',
          light: 'hsla(248, 75%, 60%, 0.1)',
          contrastText: 'hsl(0 0% 100%)'
        },
        secondary: { 
          main: 'hsl(220 15% 94%)',
          contrastText: 'hsl(220 15% 30%)',
        },
        background: {
          default: 'hsl(220 20% 98%)',
          paper: 'hsl(0 0% 100%)',
        },
        text: {
          primary: 'hsl(220 15% 20%)',
          secondary: 'hsl(220 10% 45%)',
        },
        action: {
            hover: 'hsla(220, 15%, 50%, 0.08)'
        },
        success: { 
          main: 'hsl(142 61% 45%)',
          light: 'hsla(142, 61%, 45%, 0.1)'
        },
        warning: { 
          main: 'hsl(45 93% 55%)',
          light: 'hsla(45, 93%, 55%, 0.1)'
        },
        error: { 
          main: 'hsl(0 84% 60%)',
          light: 'hsla(0, 84%, 60%, 0.1)'
        },
        info: {
          main: 'hsl(200 88% 55%)',
          light: 'hsla(200, 88%, 55%, 0.1)'
        },
        divider: 'hsl(220 15% 90%)',
      },
    });
  }
  // Dark mode
  return createTheme({
    ...commonSettings,
    palette: {
      mode: 'dark',
      primary: { 
        main: 'hsl(248 80% 70%)',
        dark: 'hsl(248, 80%, 70%)',
        light: 'hsla(248, 80%, 70%, 0.15)',
        contrastText: 'hsl(220, 15%, 10%)'
      },
      secondary: { 
        main: 'hsl(220 13% 24%)',
        contrastText: 'hsl(220 20% 98%)',
      },
      background: {
        default: 'hsl(220 13% 10%)',
        paper: 'hsl(220 13% 14%)',
      },
      text: {
        primary: 'hsl(220 20% 98%)',
        secondary: 'hsl(220 10% 65%)',
      },
      action: {
          hover: 'hsla(220, 10%, 80%, 0.08)'
      },
      success: { 
        main: 'hsl(142 55% 55%)',
        light: 'hsla(142, 55%, 55%, 0.15)'
      },
      warning: { 
        main: 'hsl(45 90% 60%)',
        light: 'hsla(45, 90%, 60%, 0.15)'
      },
      error: { 
        main: 'hsl(0 70% 60%)',
        light: 'hsla(0, 70%, 60%, 0.15)'
      },
      info: {
        main: 'hsl(200 85% 65%)',
        light: 'hsla(200, 85%, 65%, 0.15)'
      },
      divider: 'hsl(220 13% 24%)',
    },
  });
};

// Create rtl cache
export const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [stylisRtlPlugin],
});