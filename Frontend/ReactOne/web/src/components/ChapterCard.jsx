import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
} from '@mui/material';
import { StyledChapterCard, chapterCardStyles } from '../theme/chapterCardTheme';

const ChapterCard = ({ chapter, onClick }) => {
  const navigate = useNavigate();

  const handleChapterClick = () => {
    // Call the custom onClick handler if provided
    if (onClick) {
      onClick(chapter);
    }
    // Navigate to chapter page
    navigate(`/chapter/${chapter._id}`);
  };

  return (
    <StyledChapterCard onClick={handleChapterClick}>
      {chapter.thumbnailUrl ? (
        <Box sx={chapterCardStyles.imageContainer}>
          <img
            src={chapter.thumbnailUrl}
            alt={chapter.name}
            style={chapterCardStyles.image}
          />
        </Box>
      ) : (
        <Box sx={chapterCardStyles.placeholderContainer} />
      )}
      <Box sx={chapterCardStyles.cardContent}>
        <Typography 
          variant="h6" 
          sx={chapterCardStyles.title}
        >
          {chapter.name}
        </Typography>
        

      </Box>
    </StyledChapterCard>
  );
};

export default ChapterCard; 