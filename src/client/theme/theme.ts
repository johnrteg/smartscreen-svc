import { red } from '@mui/material/colors';
import { createTheme, Theme } from '@mui/material/styles';

// Create a theme instance.
const theme : Theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
                  main: '#2196f3',
                },
    secondary: {
                  main: '#19857b',
              },
    error: {
                  main: red.A400,
                },
  }
});

export default theme;

// eof

