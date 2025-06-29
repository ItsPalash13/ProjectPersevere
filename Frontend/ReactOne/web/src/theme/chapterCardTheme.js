import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import { colors, getThemeColor, getThemeGradient, themeColors } from './colors.js';

export const StyledChapterCard = styled(Box)(({ theme }) => ({
  maxWidth: 360,
  height: '100%',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
  borderRadius: 10,
  background: 'transparent',
  border: 'none',
  boxShadow: 'none',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    background: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.03)'
      : 'rgba(0, 0, 0, 0.03)',
  },
}));

export const chapterCardStyles = {
  imageContainer: {
    height: 200,
    width: '100%',
    borderRadius: '10px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
    padding: 0,
  },
  image: {
    height: '100%',
    objectFit: 'contain',
  },
  placeholderContainer: {
    height: 200,
    width: '100%',
    backgroundColor: 'rgb(23, 23, 24)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
    padding: 0,
  },
  cardContent: {
    p: 1.5,
    pb: 2,
    backgroundColor: 'transparent',
    '&:last-child': {
      pb: 2,
    },
  },
  title: {
    fontWeight: 500,
    mb: 1.5,
    color: 'text.primary',
    lineHeight: 1.3,
    fontSize: '0.95rem',
    minHeight: '1.3em',
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  topicsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
    mt: 0.25,
  },
  topicChip: {
    backgroundColor: getThemeColor(colors.app.light.border, colors.app.dark.border),
    color: getThemeColor(colors.text.light.primary, colors.text.dark.primary),
    px: 1,
    py: 0.25,
    borderRadius: 1.5,
    fontSize: '0.65rem',
    fontWeight: 400,
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: getThemeColor(colors.app.light.accent, colors.app.dark.accent),
    },
  },
  topicCount: {
    color: 'text.secondary',
    alignSelf: 'center',
    fontSize: '0.65rem',
    fontWeight: 400,
  },
}; 