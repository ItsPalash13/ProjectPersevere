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
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...(theme.palette.mode === 'dark' && {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
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
    background: getThemeGradient(colors.gradients.cardLight, colors.gradients.cardDark),
    backdropFilter: 'blur(20px)',
    border: themeColors.card.border,
    boxShadow: themeColors.card.shadow,
  },
  title: {
    textAlign: 'center',
    mb: 3,
    fontWeight: 700,
    fontSize: '2rem',
    background: colors.gradients.primary,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  submitButton: {
    mt: 2,
    py: 1.5,
    background: colors.gradients.primary,
    color: colors.special.white,
    '&:hover': {
      background: colors.gradients.primaryDark,
      transform: 'translateY(-1px)',
    },
    transition: 'all 0.2s ease',
  },
  linkButton: {
    mt: 2,
    textAlign: 'center',
    color: colors.primary.main,
    textDecoration: 'none',
    '&:hover': {
      color: colors.primary.accent,
      textDecoration: 'underline',
    },
  },
}; 