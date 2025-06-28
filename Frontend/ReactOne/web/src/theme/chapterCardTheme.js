import { styled } from '@mui/material/styles';
import { Card } from '@mui/material';

export const StyledChapterCard = styled(Card)(({ theme }) => ({
  minWidth: 260,
  maxWidth: 280,
  height: '100%',
  cursor: 'pointer',
  transition: 'all 0.3s ease-in-out',
  borderRadius: 16,
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(145deg, #2d2d44 0%, #3a3a5c 100%)'
    : 'linear-gradient(145deg, #ffffff 0%, #fbfaff 100%)',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(150, 103, 224, 0.2)'
    : '1px solid rgba(150, 103, 224, 0.1)',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 20px rgba(0, 0, 0, 0.2)' 
    : '0 4px 20px rgba(150, 103, 224, 0.08)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
      : '0 8px 32px rgba(150, 103, 224, 0.15)',
  },
}));

export const chapterCardStyles = {
  cardContent: {
    p: 3,
  },
  title: {
    fontWeight: 600,
    mb: 1.5,
    color: 'text.primary',
    lineHeight: 1.3,
    minHeight: '2.6em',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  description: {
    color: 'text.secondary',
    mb: 2,
    minHeight: '3em',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  topicsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
  },
  topicChip: {
    backgroundColor: 'primary.main',
    color: 'primary.contrastText',
    px: 1,
    py: 0.25,
    borderRadius: 1,
    fontSize: '0.65rem',
    whiteSpace: 'nowrap',
  },
  topicCount: {
    color: 'text.secondary',
    alignSelf: 'center',
  },
}; 