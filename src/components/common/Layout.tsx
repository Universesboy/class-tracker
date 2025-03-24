import React, { ReactNode } from 'react';
import { Box, Container, CssBaseline, createTheme, ThemeProvider, Typography } from '@mui/material';
import AppHeader from './AppHeader';

interface LayoutProps {
  children: ReactNode;
}

// Enhanced theme with more modern design
const theme = createTheme({
  palette: {
    primary: {
      main: '#4361ee', // Modern blue
      light: '#7295ff',
      dark: '#0031b9',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f72585', // Vibrant pink
      light: '#ff67ae',
      dark: '#be005f',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc', // Light bluish-gray background with a hint of softness
      paper: '#ffffff',
    },
    error: {
      main: '#e5383b',
      light: '#ff867c',
      dark: '#b61827',
    },
    warning: {
      main: '#ff9e00',
      light: '#ffcd38',
      dark: '#c67100',
    },
    success: {
      main: '#06d6a0',
      light: '#65ffd3',
      dark: '#00a371',
    },
    info: {
      main: '#4cc9f0',
      light: '#8fffff',
      dark: '#0098bd',
    },
    text: {
      primary: '#2b2d42',
      secondary: '#6c757d',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 800,
      fontSize: '2.5rem',
      letterSpacing: '-0.03em',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      letterSpacing: '-0.02em',
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.75rem',
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      letterSpacing: '-0.01em',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      letterSpacing: '0.01em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 16, // Slightly increased roundness for a modern feel
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
          padding: '10px 20px', // Slightly more padding for better touch targets
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 6px 12px rgba(38, 46, 86, 0.15)',
          },
        },
        contained: {
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #4361ee 0%, #3a56d4 100%)',
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #f72585 0%, #dc246d 100%)',
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 5px 20px rgba(0, 0, 0, 0.05)',
        },
        elevation1: {
          boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.05)',
        },
        elevation3: {
          boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          overflow: 'hidden',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0px 12px 30px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.07)',
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          borderCollapse: 'separate',
          borderSpacing: '0 10px', // Increased spacing between rows
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(67, 97, 238, 0.04)',
            transform: 'scale(1.005)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: 'none',
          padding: '16px',
        },
        head: {
          fontWeight: 600,
          color: '#6c757d',
          borderBottom: '1px solid #e9ecef',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontSize: '0.75rem',
        },
        body: {
          fontSize: '0.95rem',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          transition: 'all 0.2s ease',
          '&.Mui-focused': {
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#4361ee',
            borderWidth: '2px',
          },
          '&.Mui-focused': {
            boxShadow: '0px 4px 12px rgba(67, 97, 238, 0.15)',
          },
        },
        notchedOutline: {
          borderColor: '#e0e0e0',
          transition: 'border-color 0.2s ease',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
        },
        standardSuccess: {
          backgroundImage: 'linear-gradient(to right, rgba(6, 214, 160, 0.05), rgba(6, 214, 160, 0.15))',
          borderLeft: '4px solid #06d6a0',
        },
        standardError: {
          backgroundImage: 'linear-gradient(to right, rgba(229, 56, 59, 0.05), rgba(229, 56, 59, 0.15))',
          borderLeft: '4px solid #e5383b',
        },
        standardWarning: {
          backgroundImage: 'linear-gradient(to right, rgba(255, 158, 0, 0.05), rgba(255, 158, 0, 0.15))',
          borderLeft: '4px solid #ff9e00',
        },
        standardInfo: {
          backgroundImage: 'linear-gradient(to right, rgba(76, 201, 240, 0.05), rgba(76, 201, 240, 0.15))',
          borderLeft: '4px solid #4cc9f0',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0px 12px 40px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          '&.MuiChip-colorPrimary': {
            background: 'linear-gradient(135deg, #4361ee 0%, #3a56d4 100%)',
          },
          '&.MuiChip-colorSecondary': {
            background: 'linear-gradient(135deg, #f72585 0%, #dc246d 100%)',
          },
          '&.MuiChip-colorSuccess': {
            background: 'linear-gradient(135deg, #06d6a0 0%, #00a371 100%)',
          },
          '&.MuiChip-colorError': {
            background: 'linear-gradient(135deg, #e5383b 0%, #b61827 100%)',
          },
          '&.MuiChip-colorWarning': {
            background: 'linear-gradient(135deg, #ff9e00 0%, #c67100 100%)',
          },
          '&.MuiChip-colorInfo': {
            background: 'linear-gradient(135deg, #4cc9f0 0%, #0098bd 100%)',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          padding: '6px 12px',
          fontSize: '0.75rem',
          backdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(43, 45, 66, 0.9)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          margin: '8px 0',
        },
      },
    },
  },
});

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <AppHeader />
        <Container
          sx={{
            flexGrow: 1,
            paddingY: 3,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </Container>
        <Box
          component="footer"
          sx={{
            py: 4,
            px: 2,
            mt: 'auto',
            backgroundColor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'rgba(0, 0, 0, 0.06)',
            textAlign: 'center',
          }}
        >
          <Container maxWidth="sm">
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.9998 14L10.9998 22L7.99976 9L15.9998 12L11.9998 14Z" fill="#4361ee" />
                  <path d="M11.9998 14L12.9998 6L15.9998 19L7.99976 16L11.9998 14Z" fill="#f72585" />
                </svg>
                <Typography 
                  variant="h6" 
                  component="span" 
                  sx={{ 
                    fontWeight: 700, 
                    color: 'text.primary',
                    background: 'linear-gradient(90deg, #4361ee, #f72585)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Badminton Class Tracker
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} • Made with{' '}
                <Box component="span" sx={{ color: '#f72585' }}>❤️</Box> for Badminton Coaches
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  mt: 1,
                  justifyContent: 'center'
                }}
              >
                <Typography
                  component="a"
                  variant="caption"
                  href="#"
                  sx={{
                    color: 'text.secondary',
                    textDecoration: 'none',
                    '&:hover': {
                      color: 'primary.main',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Privacy Policy
                </Typography>
                <Typography
                  component="a"
                  variant="caption"
                  href="#"
                  sx={{
                    color: 'text.secondary',
                    textDecoration: 'none',
                    '&:hover': {
                      color: 'primary.main',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Terms of Service
                </Typography>
                <Typography
                  component="a"
                  variant="caption"
                  href="#"
                  sx={{
                    color: 'text.secondary',
                    textDecoration: 'none',
                    '&:hover': {
                      color: 'primary.main',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Help
                </Typography>
              </Box>
            </Box>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Layout; 