import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
} from '@mui/material';
import { StyledChapterCard, chapterCardStyles } from '../theme/chapterCardTheme';

const ChapterCard = ({ chapter, onClick }) => {
  const navigate = useNavigate();
  const isActive = chapter.isActive !== false; // Default to true if not specified

  const handleChapterClick = () => {
    // Don't navigate if chapter is inactive
    if (!isActive) {
      return;
    }
    
    // Call the custom onClick handler if provided
    if (onClick) {
      onClick(chapter);
    }
    // Navigate to chapter page
    navigate(`/chapter/${chapter._id}`);
  };

  return (
    <StyledChapterCard 
      onClick={handleChapterClick}
      sx={{
        opacity: isActive ? 1 : 0.5,
        filter: isActive ? 'none' : 'grayscale(0.3)',
        cursor: isActive ? 'pointer' : 'not-allowed',
        position: 'relative',
        ...(isActive ? {} : {
          '&:hover': {
            transform: 'none',
            boxShadow: 'none'
          }
        })
      }}
    >
      {chapter.thumbnailUrl ? (
        <Box sx={chapterCardStyles.imageContainer}>
          <img
            src={chapter.thumbnailUrl}
            alt={chapter.name}
            style={{
              ...chapterCardStyles.image,
              filter: isActive ? 'none' : 'grayscale(0.5)'
            }}
          />
        </Box>
      ) : (
        <Box sx={chapterCardStyles.placeholderContainer} />
      )}
      <Box sx={chapterCardStyles.cardContent}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography 
            variant="h6" 
            sx={{
              ...chapterCardStyles.title,
              color: isActive ? 'inherit' : 'text.secondary'
            }}
          >
            {chapter.name}
          </Typography>
          
          {!isActive && (
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                fontSize: '0.75rem',
                mb:1.3
              }}
            >
              Coming Soon
            </Typography>
          )}
        </Box>
      </Box>
    </StyledChapterCard>
  );
};

export default ChapterCard; 