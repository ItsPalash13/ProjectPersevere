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

const LevelCard = ({ level, onLevelClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isTimeRush = level.mode === 'time_rush';
  const progress = isTimeRush ? level.userProgress?.timeRush : level.userProgress?.precisionPath;
  const activeSession = level.activeSession;
  const cardStyles = {
    ...levelsStyles.levelCard,
    ...(level.status ? levelsStyles.activeCard : levelsStyles.lockedCard)
  };

  return (
    <Card sx={cardStyles}>
      <CardContent sx={levelsStyles.cardContent}>
        <Box sx={levelsStyles.cardHeader}>
          <Typography variant="h5" component="h2" sx={levelsStyles.cardTitle}>
            {level.levelNumber ? `${level.levelNumber}. ${level.name}` : level.name}
          </Typography>
          {!level.status && (
            <IconButton disabled size="small" sx={levelsStyles.lockIcon}>
              <LockIcon />
            </IconButton>
          )}
        </Box>
        
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
          <Box sx={levelsStyles.metricCard}>
            <Typography sx={levelsStyles.metricIcon}>🎯</Typography>
            <Typography sx={levelsStyles.metricValue}>
              {progress?.requiredXp || level.requiredXP || 0}
            </Typography>
            <Typography sx={levelsStyles.metricLabel}>
              Target XP
            </Typography>
          </Box>
          
          {isTimeRush && level.timeRushTime && (
            <Box sx={levelsStyles.metricCard}>
              <Typography sx={levelsStyles.metricIcon}>⏱️</Typography>
              <Typography sx={levelsStyles.metricValue}>
                {formatTime(level.timeRushTime)}
              </Typography>
              <Typography sx={levelsStyles.metricLabel}>
                Time Limit
              </Typography>
            </Box>
          )}
          
          {progress && (
            <Box sx={levelsStyles.metricCard}>
              <Typography sx={levelsStyles.metricIcon}>
                {isTimeRush ? '🏆' : '⚡'}
              </Typography>
              <Typography sx={levelsStyles.metricValue}>
                {isTimeRush 
                  ? `${progress.maxXp || 0}`
                  : formatTime(progress.minTime || 0)
                }
              </Typography>
              <Typography sx={levelsStyles.metricLabel}>
                {isTimeRush ? 'Best' : 'Fastest'}
              </Typography>
            </Box>
          )}
        </Box>
        
        {activeSession && (
          <Box sx={levelsStyles.activeSessionContainer}>
            <Typography variant="body2" sx={levelsStyles.activeSessionTitle}>
              🔥 Active Session
            </Typography>
            <Box sx={levelsStyles.activeSessionStats}>
              <Box sx={levelsStyles.activeSessionStat}>
                <Typography sx={levelsStyles.activeSessionStatValue}>
                  {isTimeRush 
                    ? formatTime(activeSession.timeRush?.currentTime || 0)
                    : formatTime(activeSession.precisionPath?.currentTime || 0)
                  }
                </Typography>
                <Typography sx={levelsStyles.activeSessionStatLabel}>
                  {isTimeRush ? 'Time Left' : 'Elapsed'}
                </Typography>
              </Box>
              <Box sx={levelsStyles.activeSessionStat}>
                <Typography sx={levelsStyles.activeSessionStatValue}>
                  {isTimeRush 
                    ? (activeSession.timeRush?.currentXp || 0)
                    : (activeSession.precisionPath?.currentXp || 0)
                  }
                </Typography>
                <Typography sx={levelsStyles.activeSessionStatLabel}>
                  Current XP
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </CardContent>
      
      <CardActions sx={{ p: 0 }}>
        {activeSession ? (
          <Box sx={levelsStyles.buttonsContainer}>
            <Button 
              {...levelsStyles.reconnectButton}
              sx={levelsStyles.reconnectButton.sx}
              onClick={async (e) => {
                e.stopPropagation();
                await dispatch(setLevelSession(activeSession));
                navigate(`/quiz/${level._id}`, { replace: true });
              }}
            >
              🔄 Reconnect
            </Button>
            <Button 
              {...levelsStyles.startFreshButton}
              sx={levelsStyles.startFreshButton.sx}
              onClick={(e) => {
                e.stopPropagation();
                onLevelClick(level._id, level.mode);
              }}
            >
              🆕 Start Fresh
            </Button>
          </Box>
        ) : (
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
        )}
      </CardActions>
    </Card>
  );
};

export default LevelCard; 