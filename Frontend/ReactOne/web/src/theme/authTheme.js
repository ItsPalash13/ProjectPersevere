import { createTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { colors, getThemeColor, getThemeGradient, themeColors } from './colors.js';

// Custom theme configuration
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
});

export const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  ...(theme.palette.mode === 'dark' && {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

export const AuthContainer = styled(Stack)(({ theme }) => ({
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundColor: theme.palette.mode === 'dark' 
      ? colors.background.dark.primary 
      : colors.background.light.primary,
    backgroundRepeat: 'no-repeat',
  },
}));

export const authStyles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: themeColors.background.main,
    p: 2,
  },
  card: {
    maxWidth: 400,
    width: '100%',
    p: 4,
    borderRadius: 3,
    background: getThemeColor(colors.background.light.paper, colors.background.dark.paper),
    backdropFilter: 'blur(20px)',
    border: themeColors.card.border,
    boxShadow: themeColors.card.shadow,
  },
  title: {
    textAlign: 'center',
    mb: 3,
    fontWeight: 700,
    fontSize: '2rem',
    color: getThemeColor(colors.text.light.primary, colors.text.dark.primary),
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  submitButton: {
    mt: 2,
    py: 1.5,
    background: getThemeColor(colors.app.light.border, colors.app.dark.border),
    color: getThemeColor(colors.text.light.primary, colors.text.dark.primary),
    '&:hover': {
      background: getThemeColor(colors.app.light.accent, colors.app.dark.accent),
      transform: 'translateY(-1px)',
    },
    transition: 'all 0.2s ease',
  },
  linkButton: {
    mt: 2,
    textAlign: 'center',
    color: getThemeColor(colors.text.light.secondary, colors.text.dark.secondary),
    textDecoration: 'none',
    '&:hover': {
      color: getThemeColor(colors.text.light.primary, colors.text.dark.primary),
      textDecoration: 'underline',
    },
  },
}; 