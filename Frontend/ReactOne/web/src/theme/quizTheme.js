import { styled } from '@mui/material/styles';
import { Box, Card, Button, Dialog } from '@mui/material';
import { colors, getThemeColor, getThemeGradient, themeColors } from './colors.js';

export const QuizContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  backgroundImage: themeColors.background.main(theme),
  position: 'relative',
  minHeight: 'calc(100vh - 64px)', // Account for navbar height
}));

export const QuestionCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  borderRadius: 16,
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(145deg, #2d2d44 0%, #3a3a5c 100%)'
    : 'linear-gradient(145deg, #ffffff 0%, #fbfaff 100%)',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(150, 103, 224, 0.2)'
    : '1px solid rgba(150, 103, 224, 0.1)',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
    : '0 8px 32px rgba(150, 103, 224, 0.08)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 12px 40px rgba(0, 0, 0, 0.4)' 
      : '0 12px 40px rgba(150, 103, 224, 0.15)',
  },
}));

export const OptionCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 0.3s ease-in-out',
  borderRadius: 16,
  minHeight: '120px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(145deg, #2d2d44 0%, #3a3a5c 100%)'
    : 'linear-gradient(145deg, #ffffff 0%, #fbfaff 100%)',
  border: theme.palette.mode === 'dark'
    ? '2px solid rgba(150, 103, 224, 0.2)'
    : '2px solid rgba(150, 103, 224, 0.1)',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 16px rgba(0, 0, 0, 0.2)' 
    : '0 4px 16px rgba(150, 103, 224, 0.08)',
  '&:hover:not(.selected):not(.correct):not(.wrong):not(.correct-answer)': {
    transform: 'translateY(-4px)',
    border: theme.palette.mode === 'dark'
      ? '2px solid rgba(150, 103, 224, 0.4)'
      : '2px solid rgba(150, 103, 224, 0.3)',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 8px 24px rgba(0, 0, 0, 0.3)' 
      : '0 8px 24px rgba(150, 103, 224, 0.15)',
  },
  '&.selected': {
    border: '2px solid #9667e0',
    background: 'linear-gradient(135deg, #9667e0 0%, #d4bbfc 100%)',
    color: 'white',
    transform: 'translateY(-2px)',
    '& .MuiTypography-root': {
      color: 'white',
      fontWeight: 600,
    }
  },
  '&.correct': {
    border: '2px solid #2e7d32',
    background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
    color: 'white',
    transform: 'translateY(-2px)',
    '& .MuiTypography-root': {
      color: 'white',
      fontWeight: 600,
    }
  },
  '&.wrong': {
    border: '2px solid #d32f2f',
    background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
    color: 'white',
    transform: 'translateY(-2px)',
    '& .MuiTypography-root': {
      color: 'white',
      fontWeight: 600,
    }
  },
  '&.correct-answer': {
    border: '2px solid #2e7d32',
    background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
    color: 'white',
    transform: 'translateY(-2px)',
    '& .MuiTypography-root': {
      color: 'white',
      fontWeight: 600,
    }
  }
}));

export const QuizHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(2),
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(145deg, #2d2d44 0%, #3a3a5c 100%)'
    : 'linear-gradient(145deg, #ffffff 0%, #fbfaff 100%)',
  borderRadius: 16,
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(150, 103, 224, 0.2)'
    : '1px solid rgba(150, 103, 224, 0.1)',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 16px rgba(0, 0, 0, 0.2)' 
    : '0 4px 16px rgba(150, 103, 224, 0.08)',
}));

export const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5, 4),
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: 'none',
  transition: 'all 0.2s ease-in-out',
  '&.MuiButton-contained': {
    background: 'linear-gradient(135deg, #9667e0 0%, #d4bbfc 100%)',
    '&:hover': {
      background: 'linear-gradient(135deg, #7c3aed 0%, #9667e0 100%)',
      transform: 'translateY(-2px)',
    },
  },
  '&.MuiButton-outlined': {
    borderColor: '#9667e0',
    color: '#9667e0',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(150, 103, 224, 0.1)' : '#f2ebfb',
      borderColor: '#9667e0',
    },
  },
}));

export const TimeDisplay = styled(Box)(({ theme }) => ({
  fontSize: '1.4rem',
  fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2, 4),
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(145deg, #2d2d44 0%, #3a3a5c 100%)'
    : 'linear-gradient(145deg, #ffffff 0%, #fbfaff 100%)',
  borderRadius: 16,
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(150, 103, 224, 0.2)'
    : '1px solid rgba(150, 103, 224, 0.1)',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 16px rgba(0, 0, 0, 0.2)' 
    : '0 4px 16px rgba(150, 103, 224, 0.08)',
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: theme.palette.mode === 'dark' ? '#d4bbfc' : '#7c3aed',
}));

export const XpDisplay = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
  padding: theme.spacing(1.5, 2.5),
  borderRadius: 12,
  color: 'white',
  fontWeight: 'bold',
  boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)',
  '& .MuiSvgIcon-root': {
    color: 'white',
    animation: 'pulse 2s infinite',
  },
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
    },
    '50%': {
      transform: 'scale(1.1)',
    },
    '100%': {
      transform: 'scale(1)',
    },
  },
}));

export const CongratsDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 20,
    padding: theme.spacing(3),
    textAlign: 'center',
    maxWidth: '400px',
    width: '100%',
    background: theme.palette.mode === 'dark' 
      ? 'linear-gradient(145deg, #2d2d44 0%, #3a3a5c 100%)'
      : 'linear-gradient(145deg, #ffffff 0%, #fbfaff 100%)',
    border: theme.palette.mode === 'dark'
      ? '1px solid rgba(150, 103, 224, 0.2)'
      : '1px solid rgba(150, 103, 224, 0.1)',
  },
}));

export const EmojiDisplay = styled(Box)(({ theme }) => ({
  fontSize: '4rem',
  marginBottom: theme.spacing(2),
  animation: 'bounce 1s infinite',
  '@keyframes bounce': {
    '0%, 100%': {
      transform: 'translateY(0)',
    },
    '50%': {
      transform: 'translateY(-20px)',
    },
  },
}));

export const FloatingButton = styled(Button)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  right: theme.spacing(4),
  borderRadius: '50%',
  width: '64px',
  height: '64px',
  minWidth: '64px',
  background: 'linear-gradient(135deg, #9667e0 0%, #d4bbfc 100%)',
  color: 'white',
  fontWeight: 'bold',
  fontSize: '1.2rem',
  boxShadow: '0 8px 24px rgba(150, 103, 224, 0.3)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    background: 'linear-gradient(135deg, #7c3aed 0%, #9667e0 100%)',
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 32px rgba(150, 103, 224, 0.4)',
  },
}));

export const quizStyles = {
  backButton: {
    background: theme => theme.palette.mode === 'dark' 
      ? 'rgba(150, 103, 224, 0.1)' 
      : 'rgba(150, 103, 224, 0.05)',
    color: '#9667e0',
    border: '1px solid rgba(150, 103, 224, 0.2)',
    borderRadius: 2,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      background: theme => theme.palette.mode === 'dark' 
        ? 'rgba(150, 103, 224, 0.2)' 
        : 'rgba(150, 103, 224, 0.1)',
      transform: 'translateY(-1px)',
    },
  },
  questionCardContent: {
    p: 4,
  },
  questionChip: {
    background: 'linear-gradient(135deg, #9667e0 0%, #d4bbfc 100%)',
    color: 'white',
    fontWeight: 'bold',
  },
  questionTitle: {
    fontWeight: 600,
    lineHeight: 1.4,
    color: theme => theme.palette.mode === 'dark' ? '#e3dff2' : '#2d1b69',
  },
  correctChip: {
    background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
    color: 'white',
    fontWeight: 'bold',
  },
  wrongChip: {
    background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
    color: 'white',
    fontWeight: 'bold',
  },
  resultContainer: {
    mb: 4,
    textAlign: 'center',
  },
  xpContainer: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 1,
    mb: 2,
    p: 2,
    borderRadius: 3,
    background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    color: 'white',
  },
  progressContainer: {
    mb: 3,
  },
  messageContainer: {
    p: 3,
    borderRadius: 2,
    background: theme => theme.palette.mode === 'dark' 
      ? 'rgba(150, 103, 224, 0.1)' 
      : 'rgba(150, 103, 224, 0.05)',
    border: theme => theme.palette.mode === 'dark'
      ? '1px solid rgba(150, 103, 224, 0.2)'
      : '1px solid rgba(150, 103, 224, 0.1)',
    mb: 3,
  },
  statusContainer: {
    textAlign: 'center',
    p: 2,
    borderRadius: 2,
  },
  completedStatus: {
    background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%)',
  },
  inProgressStatus: {
    background: 'linear-gradient(135deg, rgba(150, 103, 224, 0.1) 0%, rgba(212, 187, 252, 0.1) 100%)',
  },
}; 