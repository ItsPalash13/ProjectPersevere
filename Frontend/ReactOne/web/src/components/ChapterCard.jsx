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
    // Navigate to levels page
    navigate(`/levels/${chapter._id}`);
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
        
        {chapter.topics && chapter.topics.length > 0 && (
          <Box sx={chapterCardStyles.topicsContainer}>
            {chapter.topics.slice(0, 4).map((topic, index) => (
              <Typography 
                key={index} 
                variant="caption" 
                sx={chapterCardStyles.topicChip}
              >
                {topic}
              </Typography>
            ))}
            {chapter.topics.length > 4 && (
              <Typography 
                variant="caption" 
                sx={chapterCardStyles.topicCount}
              >
                +{chapter.topics.length - 4}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </StyledChapterCard>
  );
};

export default ChapterCard; 