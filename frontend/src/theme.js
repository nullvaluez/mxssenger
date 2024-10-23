// theme.js

import { createTheme } from '@mui/material/styles';

const commonSettings = {
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6C63FF',
    },
    background: {
      default: '#F0F2F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#333333',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #FDEFF9 0%, #EC38BC 100%)',
          backgroundAttachment: 'fixed',
        },
      },
    },
  },
  ...commonSettings,
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF6584',
    },
    background: {
      default: '#1E1E1E',
      paper: '#2C2C2C',
    },
    text: {
      primary: '#FFFFFF',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
          backgroundAttachment: 'fixed',
        },
      },
    },
  },
  ...commonSettings,
});
