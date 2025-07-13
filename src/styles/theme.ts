import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// Create a theme instance.
const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: '#6200EE', // A modern, vibrant purple
    },
    secondary: {
      main: '#03DAC6', // A bright teal for accents
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#f4f5f7', // A slightly cooler gray
      paper: '#ffffff',
    },
    text: {
      primary: '#172b4d',
      secondary: '#6b778c',
    }
  },
  typography: {
    fontFamily: 'Rubik, "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
        fontWeight: 600,
    },
    h6: {
        fontWeight: 600,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
            color: '#fff',
        }
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiCard: {
        styleOverrides: {
            root: {
                borderRadius: 12,
                boxShadow: '0 4px 12px 0 rgba(0,0,0,0.08)'
            }
        }
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                
            },
            elevation1: {
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            },
            elevation3: {
                 boxShadow: '0 4px 12px 0 rgba(0,0,0,0.08)'
            }
        }
    },
    MuiAppBar: {
        styleOverrides: {
            root: {
                boxShadow: 'none',
                borderBottom: '1px solid #e0e0e0'
            }
        }
    }
  },
});

export default theme;