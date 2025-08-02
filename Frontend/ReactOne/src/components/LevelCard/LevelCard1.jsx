import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Chip,
  Box,
  Rating
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { levelsStyles } from '../../theme/levelsTheme';

const LevelCard1 = ({ level, chapter, onLevelClick, onLevelDetails }) => {
  const isTimeRush = level.mode === 'time_rush';
  const cardStyles = {
    ...levelsStyles.levelCard,
    overflow: 'visible',
    ...(level.status ? levelsStyles.activeCard : levelsStyles.lockedCard),
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    }
  };

  // Calculate star rating based on progress or performance (3-star system)
  const getStarRating = () => {
    if (!level.status || !level.userProgress) return 0;
    
    // If there's a specific rating in userProgress, use it (convert from 5-star to 3-star)
    if (level.userProgress.rating !== undefined) {
      const rating = level.userProgress.rating;
      if (rating >= 4) return 3;
      if (rating >= 2.5) return 2;
      if (rating >= 1) return 1;
      return 0;
    }
    
    // Calculate rating based on progress percentage (3-star system)
    if (level.progress !== undefined && level.progress !== null) {
      const progress = level.progress;
      if (progress >= 85) return 3; // 3 stars for excellent performance
      if (progress >= 60) return 2; // 2 stars for good performance
      if (progress >= 30) return 1; // 1 star for basic completion
    }
    
    return 0;
  };

  return (
    <Card 
      sx={cardStyles}
      onClick={() => onLevelDetails(level)}
    >
    
      {/* Chapter Image with Level Name Overlay */}
      <Box 
        sx={{ 
          position: 'relative',
          width: '100%',
          height: 200,
          borderRadius: '8px',
          overflow: 'hidden',
          background: chapter?.thumbnailUrl 
            ? `url(${chapter.thumbnailUrl}) center/cover no-repeat`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Dark overlay for better text visibility */}
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1
          }}
        />
        
        {/* Lock Icon */}
        {!level.status && (
          <LockIcon 
            sx={{ 
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 3,
              color: 'white',
              fontSize: '5rem',
              filter: 'drop-shadow(0 0 8px rgba(0, 0, 0, 0.8))'
            }} 
          />
        )}
        
        {/* Mode Indicator */}
        <Box 
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 3,
            backgroundColor: isTimeRush ? 'rgba(255, 165, 0, 0.9)' : 'rgba(138, 43, 226, 0.9)',
            color: 'white',
            borderRadius: '12px',
            px: 1.5,
            py: 0.5,
            fontSize: '0.75rem',
            fontWeight: 600,
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
          }}
        >
          {isTimeRush ? '⏱️ Time Rush' : '⚡ Precision Path'}
        </Box>
        
        {/* Level Name Overlay */}
        <Typography 
          variant="h5" 
          component="h2"
          sx={{ 
            position: 'relative',
            zIndex: 2,
            color: 'white',
            fontWeight: 700,
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
            px: 2
          }}
        >
          {level.name}
        </Typography>
      </Box>
        {/* Gamified Star Rating */}
        {level.status && level.userProgress?.status !== 'not_started' && (
          <Box sx={{ 
            mt: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column',
            position: 'absolute',
            left: 'calc(50% - 3.75rem)',
            bottom: '-8%',
            zIndex:10,
            gap: 1
          }}>
            {console.log((level.progress/100*3).toFixed(2))}
            <Rating
              value={level.progress/100*3}
              precision={0.10}
              max={3}
              readOnly
              size="large"
              sx={{
                '& .MuiRating-iconFilled': {
                  fontSize: '2.5rem',
                },
                '& .MuiRating-iconEmpty': {
                  fontSize: '2.5rem',
                }
              }}
            />
          </Box>
        )}

    </Card>
  );
};

export default LevelCard1; 