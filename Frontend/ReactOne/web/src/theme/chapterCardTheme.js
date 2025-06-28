import { styled } from '@mui/material/styles';
import { Card } from '@mui/material';
import { colors, getThemeColor, getThemeGradient, themeColors } from './colors.js';

export const StyledChapterCard = styled(Card)(({ theme }) => ({
  minWidth: 260,
  maxWidth: 280,
  height: '100%',
  cursor: 'pointer',
  transition: 'all 0.3s ease-in-out',
  borderRadius: 16,
  background: getThemeGradient(colors.gradients.cardLightAlt, colors.gradients.cardDarkAlt)(theme),
  border: getThemeColor(colors.border.light.secondary, colors.border.dark.accent)(theme),
  boxShadow: getThemeColor(colors.shadow.light.low, colors.shadow.dark.low)(theme),
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: getThemeColor(colors.shadow.light.primaryMedium, colors.shadow.dark.medium)(theme),
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