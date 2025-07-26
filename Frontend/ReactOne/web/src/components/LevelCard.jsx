import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Chip,
  Box,
  IconButton
} from '@mui/material';
import { ProgressBar } from 'react-progressbar-fancy';
import LockIcon from '@mui/icons-material/Lock';
import { levelsStyles } from '../theme/levelsTheme';

const LevelCard = ({ level, chapter, onLevelClick, onLevelDetails }) => {
  const isTimeRush = level.mode === 'time_rush';
  const cardStyles = {
    ...levelsStyles.levelCard,
    ...(level.status ? levelsStyles.activeCard : levelsStyles.lockedCard),
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    }
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
          height: 160,
          borderRadius: '8px 8px 0 0',
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
          <Box 
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <LockIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          </Box>
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
      
      <CardContent sx={levelsStyles.cardContent}>
        
        {/* Topics */}
        <Box sx={levelsStyles.topicsContainer}>
          {level.topics.map((topic, index) => (
            <Chip 
              key={index}
              label={typeof topic === 'string' ? topic : topic.topic}
              size="small"
              sx={levelsStyles.topicChip}
            />
          ))}
        </Box>
        
        {/* Progress */}
        {level.status && level.progress !== undefined && level.progress !== null && (
          <Box sx={{ mt: 2 }}>
            <ProgressBar score={level.progress} progressColor='blue' hideText={true} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default LevelCard; 