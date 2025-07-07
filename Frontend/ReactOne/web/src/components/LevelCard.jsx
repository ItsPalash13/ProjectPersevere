import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  CardActions, 
  Button,
  Chip,
  Box,
  LinearProgress,
  IconButton
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setLevelSession } from '../features/auth/levelSessionSlice';
import { levelsStyles } from '../theme/levelsTheme';

const LevelCard = ({ level, chapter, onLevelClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isTimeRush = level.mode === 'time_rush';
  const progress = isTimeRush ? level.userProgress?.timeRush : level.userProgress?.precisionPath;
  const cardStyles = {
    ...levelsStyles.levelCard,
    ...(level.status ? levelsStyles.activeCard : levelsStyles.lockedCard)
  };

  return (
    <Card sx={cardStyles}>
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
        
        <Typography variant="body2" paragraph sx={levelsStyles.cardDescription}>
          {level.description}
        </Typography>
        
        <Box sx={levelsStyles.topicsContainer}>
          {level.topics.map((topic, index) => (
            <Chip 
              key={index}
              label={topic}
              size="small"
              sx={levelsStyles.topicChip}
            />
          ))}
        </Box>
        
        <Box sx={levelsStyles.metricsGrid}>
          {/* Target XP - Always show if available */}
          {(isTimeRush ? level.timeRush?.requiredXp : level.precisionPath?.requiredXp) && (
            <Box sx={levelsStyles.metricCard}>
              <Typography sx={levelsStyles.metricIcon}>🎯</Typography>
              <Typography sx={levelsStyles.metricValue}>
                {isTimeRush ? level.timeRush.requiredXp : level.precisionPath.requiredXp}
              </Typography>
              <Typography sx={levelsStyles.metricLabel}>
                Target XP
              </Typography>
            </Box>
          )}
          
          {/* Time Rush: Total Time */}
          {isTimeRush && level.timeRush?.totalTime && (
            <Box sx={levelsStyles.metricCard}>
              <Typography sx={levelsStyles.metricIcon}>⏱️</Typography>
              <Typography sx={levelsStyles.metricValue}>
                {formatTime(level.timeRush.totalTime)}
              </Typography>
              <Typography sx={levelsStyles.metricLabel}>
                Total Time
              </Typography>
            </Box>
          )}
          
          {/* Time Rush: Best Score (Max XP) */}
          {isTimeRush && progress?.maxXp !== null && progress?.maxXp !== undefined && (
            <Box sx={levelsStyles.metricCard}>
              <Typography sx={levelsStyles.metricIcon}>🏆</Typography>
              <Typography sx={levelsStyles.metricValue}>
                {progress.maxXp}
              </Typography>
              <Typography sx={levelsStyles.metricLabel}>
                Best Score
              </Typography>
            </Box>
          )}
          
          {/* Precision Path: Min Time */}
          {!isTimeRush && progress?.minTime !== null && progress?.minTime !== undefined && (
            <Box sx={levelsStyles.metricCard}>
              <Typography sx={levelsStyles.metricIcon}>⚡</Typography>
              <Typography sx={levelsStyles.metricValue}>
                {formatTime(progress.minTime)}
              </Typography>
              <Typography sx={levelsStyles.metricLabel}>
                Best Time
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
      
      <CardActions sx={{ p: 0 }}>
        <Box sx={levelsStyles.buttonsContainer}>
          <Button 
            fullWidth
            disabled={!level.status}
            sx={level.status ? levelsStyles.startButton.sx : levelsStyles.lockedButton.sx}
            onClick={(e) => {
              e.stopPropagation();
              level.status && onLevelClick(level._id, level.mode);
            }}
          >
            {level.status ? 'Start Level' : '🔒 Locked'}
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};

export default LevelCard; 