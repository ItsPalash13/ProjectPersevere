import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { ProgressBar } from 'react-progressbar-fancy';
import { useTheme } from '@mui/material/styles';

const LevelDetailsDialog = ({ open, onClose, level, chapter, onLevelClick }) => {
  const theme = useTheme();
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isTimeRush = level?.mode === 'time_rush';
  const progress = isTimeRush ? level?.userProgress?.timeRush : level?.userProgress?.precisionPath;

  const handleStartLevel = () => {
    onLevelClick(level._id, level.mode);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.mode === 'dark' ? '#0A0A0A' : "background.paper",
          borderRadius: 3,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {level?.name}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
            {level?.description}
          </Typography>

          {/* Topics */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Topics Covered
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {level?.topics?.map((topic, index) => (
                <Chip
                  key={index}
                  label={typeof topic === 'string' ? topic : topic.topic}
                  size="small"
                  sx={{
                    backgroundColor: theme.palette.mode === 'dark' ? '#444' : 'primary.main',
                    color: theme.palette.mode === 'dark' ? 'white' : 'white',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' ? '#555' : 'primary.dark',
                    }
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Mode Indicator - use same design as LevelCard */}
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                backgroundColor: isTimeRush ? 'rgba(255, 165, 0, 0.9)' : 'rgba(138, 43, 226, 0.9)',
                color: 'white',
                borderRadius: '12px',
                px: 1.5,
                py: 0.5,
                fontSize: '0.85rem',
                fontWeight: 600,
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
                display: 'inline-block',
                minWidth: 120,
                textAlign: 'center',
              }}
            >
              {isTimeRush ? '⏱️ Time Rush' : '⚡ Precision Path'}
            </Box>
          </Box>

          {/* Progress Section */}
          {level?.progress !== undefined && 
           level?.progress !== null && 
           level?.userProgress?.status !== 'not_started' && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Progress
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <ProgressBar score={level.progress} progressColor={isTimeRush ? 'red' : 'purple'} hideText={true} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {level.progress}%
                </Typography>
              </Box>
            </Box>
          )}

          {/* Metrics Grid */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}>
              Level Metrics
            </Typography>
            <Grid container spacing={1.5}>
              {/* Target XP */}
              {(isTimeRush ? level?.timeRush?.requiredXp : level?.precisionPath?.requiredXp) && (
                <Grid item size={{xs:12,sm:3}}>
                  <Card sx={{ 
                    height: '100%',
                    backgroundColor: theme.palette.mode === 'dark' ? '#444' : 'background.paper',
                    border: '1px solid',
                    borderColor: theme.palette.mode === 'dark' ? "#444" : 'divider',
                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                    }
                  }}>
                    <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '1.5rem', mb: 0.5 }}>🎯</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.25 }}>
                        {isTimeRush ? level.timeRush.requiredXp : level.precisionPath.requiredXp}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Target XP
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Time Rush: Total Time */}
              {isTimeRush && level?.timeRush?.totalTime && (
                <Grid item size={{xs:12,sm:3}}>
                  <Card sx={{ 
                    height: '100%',
                    backgroundColor: theme.palette.mode === 'dark' ? '#444' : 'background.paper',
                    border: '1px solid',
                    borderColor: theme.palette.mode === 'dark' ? "#444" : 'divider',
                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                    }
                  }}>
                    <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '1.5rem', mb: 0.5 }}>⏱️</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.25 }}>
                        {formatTime(level.timeRush.totalTime)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Total Time
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Time Rush: Best Time Remaining */}
              {isTimeRush && progress?.minTime !== null && progress?.minTime !== undefined && progress?.minTime > 0 && (
                <Grid item size={{xs:12,sm:3}}>
                  <Card sx={{ 
                    height: '100%',
                    backgroundColor: theme.palette.mode === 'dark' ? '#444' : 'background.paper',
                    border: '1px solid',
                    borderColor: theme.palette.mode === 'dark' ? "#444" : 'divider',
                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                    }
                  }}>
                    <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '1.5rem', mb: 0.5 }}>⚡</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.25 }}>
                        {formatTime(progress.minTime)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Best Time Remaining
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Precision Path: Min Time */}
              {!isTimeRush && progress?.minTime !== null && progress?.minTime !== undefined && (
                <Grid item size={{xs:12,sm:3}}>
                  <Card sx={{ 
                    height: '100%',
                    backgroundColor: theme.palette.mode === 'dark' ? '#444' : 'background.paper',
                    border: '1px solid',
                    borderColor: theme.palette.mode === 'dark' ? "#444" : 'divider',
                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                    }
                  }}>
                    <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '1.5rem', mb: 0.5 }}>⚡</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.25 }}>
                        {formatTime(progress.minTime)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Best Time
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Total Questions - Both Modes */}
              {(isTimeRush ? level?.timeRush?.totalQuestions : level?.precisionPath?.totalQuestions) && (
                <Grid item size={{xs:12,sm:3}}>
                  <Card sx={{ 
                    height: '100%',
                    backgroundColor: theme.palette.mode === 'dark' ? '#444' : 'background.paper',
                    border: '1px solid',
                    borderColor: theme.palette.mode === 'dark' ? "#444" : 'divider',
                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                    }
                  }}>
                    <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '1.5rem', mb: 0.5 }}>❓</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.25 }}>
                        {isTimeRush ? level.timeRush.totalQuestions : level.precisionPath.totalQuestions}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Questions
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Percentile */}
              {level?.percentile !== undefined && level?.percentile !== null && (
                <Grid item size={{xs:12,sm:3}}>
                  <Card sx={{ 
                    height: '100%',
                    backgroundColor: theme.palette.mode === 'dark' ? '#444' : 'background.paper',
                    border: '1px solid',
                    borderColor: theme.palette.mode === 'dark' ? "#444" : 'divider',
                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                    }
                  }}>
                    <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '1.5rem', mb: 0.5 }}>📊</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.25, color: 'primary.main' }}>
                        {level.percentile === 100 ? 'Top 99.99%' : `Top ${100 - level.percentile}%`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Percentile
                      </Typography>
                      {level.participantCount !== undefined && level.participantCount !== null && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, opacity: 0.7 }}>
                          {level.participantCount} participants
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Start Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              disabled={!level?.status}
              onClick={handleStartLevel}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '1.1rem',
                backgroundColor: theme.palette.mode === 'dark' ? '#444' : 'primary.main',
                color: theme.palette.mode === 'dark' ? 'white' : 'white',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? '#555' : 'primary.dark',
                }
              }}
            >
              {level?.status ? 'Start Level' : '🔒 Locked'}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LevelDetailsDialog; 