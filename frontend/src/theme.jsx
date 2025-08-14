// src/theme.jsx
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  // ## Color Palette
  palette: {
    primary: {
      main: '#4365E2', // university brand color
    },
    secondary: {
      main: '#6c757d', // neutral secondary color
    },
    success: {
      main: '#28a745', // standard success green
    },
    error: {
      main: '#dc3545', // standard error red
    },
    warning: {
        main: '#ffc107', // standard warning yellow
    },
    background: {
      default: '#f8f9fa', // very light, clean grey for the main background
      paper: '#ffffff',   // pure white for Cards, Modals, etc.
    },
    text: {
      primary: '#212529',   // dark grey for high-contrast, readable text
      secondary: '#6c757d', // lighter grey for secondary info
    },
  },

  // ## Typography (Consistent + Hierarchical)
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2rem', // 32px
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem', // 24px
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem', // 20px
    },
  },

  // ## Spacing & Layout ##
  // MUI's default spacing is 8px
  spacing: 8,

  // ## Global Component Styles ##
  components: {
    // style all Cards consistently
    MuiCard: {
      defaultProps: {
        elevation: 0, // flatter, more modern look
      },
      styleOverrides: {
        root: {
          borderRadius: '12px', // softer radius
          border: '1px solid #dee2e6', // subtle border instead of heavy shadow
        },
      },
    },
    // style all Buttons for consistent interactivity
    MuiButton: {
      defaultProps: {
        disableElevation: true, // flat buttons are cleaner
      },
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none', // more readable button text
          fontWeight: 600,
        },
      },
    },
    // style all Alerts for consistent feedback
    MuiAlert: {
        styleOverrides: {
            root: {
                borderRadius: '8px',
            }
        }
    },
    // style all TextFields
    MuiTextField: {
        styleOverrides: {
            root: {
                '--TextField-brandBorderColor': '#E0E3E7',
                '--TextField-brandBorderHoverColor': '#B2BAC2',
                '--TextField-brandBorderFocusedColor': '#4365E2', // use primary color on focus
            }
        }
    }
  },
});