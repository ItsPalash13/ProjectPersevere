import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  CardActions, 
  Button,
  Chip,
  Box,
  LinearProgress,
  IconButton,
  Backdrop,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
// @ts-ignore
import { useGetLevelsQuery, useStartLevelMutation } from '../../features/api/levelAPI';
// @ts-ignore
import { setLevelSession } from '../../features/auth/levelSessionSlice';

export interface Level {
  _id: string;
  name: string;
  description: string;
  requiredXP: number;
  topics: string[];
  status: boolean;
  mode: 'time_rush' | 'precision_path';
  timeRushTime?: number;
  activeSession?: {
    _id: string;
    attemptType: 'time_rush' | 'precision_path';
    timeRush?: {
      currentTime: number;
      currentXp: number;
      timeLimit: number;
    };
    precisionPath?: {
      currentTime: number;
      currentXp: number;
    };
  } | null;
  userProgress?: {
    timeRush?: {
      maxXp: number;
      attempts: number;
      requiredXp: number;
    };
    precisionPath?: {
      minTime: number;
      attempts: number;
      requiredXp: number;
    };
  } | null;
}

const Levels: React.FC = () => {
  const [levels, setLevels] = useState<{ timeRush: Level[], precisionPath: Level[] }>({ timeRush: [], precisionPath: [] });
  const [isStarting, setIsStarting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: levelsData, isLoading, refetch } = useGetLevelsQuery(chapterId || '', {
    skip: !chapterId
  });
  const [startLevel] = useStartLevelMutation();

  useEffect(() => {
    if (chapterId) {
      refetch();
    }
  }, [chapterId, refetch]);

  useEffect(() => {
    if (levelsData?.data) {
      setLevels(levelsData.data);
    }
  }, [levelsData]);

  const handleLevelClick = async (levelId: string, mode: 'time_rush' | 'precision_path') => {
    try {
      setIsStarting(true);
      const result = await startLevel({ levelId, attemptType: mode }).unwrap();
      dispatch(setLevelSession(result.data.session));
      navigate(`/quiz/${levelId}`);
    } catch (error) {
      console.error('Failed to start level:', error);
      setIsStarting(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (isLoading) {
    return (
      <Box sx={{minHeight: '100vh'}}>
        <Backdrop
          sx={{ 
            color: '#fff', 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: 'rgba(0, 0, 0, 0.8)'
          }}
          open={true}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 2
          }}>
            <CircularProgress color="primary" size={60} />
            <Typography variant="h6">
              Loading Levels...
            </Typography>
          </Box>
        </Backdrop>
      </Box>
    );
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderLevelCard = (level: Level) => {
    const isTimeRush = level.mode === 'time_rush';
    const progress = isTimeRush ? level.userProgress?.timeRush : level.userProgress?.precisionPath;
    const activeSession = level.activeSession;

    return (
      <Grid size={{xs: 12, sm: 6, md: 4}} key={`${level._id}_${level.mode}`}>
        <Card 
          sx={{ 
            height: '100%',
            width: '370px',
            display: 'flex',
            flexDirection: 'column',
            opacity: level.status ? 1 : 0.7,
            '&:hover': {
              boxShadow: level.status ? 6 : 1,
              cursor: level.status ? 'pointer' : 'not-allowed'
            }
          }}
        >
          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h5" component="h2" noWrap>
                {level.name}
              </Typography>
              {!level.status && (
                <IconButton disabled size="small">
                  <LockIcon />
                </IconButton>
              )}
            </Box>
            <Typography color="text.secondary" paragraph sx={{ flexGrow: 1 }}>
              {level.description}
            </Typography>
            <Box sx={{ mb: 2 }}>
              {level.topics.map((topic, index) => (
                <Chip 
                  key={index}
                  label={topic}
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Required XP: {progress?.requiredXp}
              </Typography>
              {isTimeRush && level.timeRushTime && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Time Limit: {formatTime(level.timeRushTime)}
                </Typography>
              )}
              {progress && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {isTimeRush 
                    ? `Best Score: ${(progress as { maxXp: number }).maxXp || 0} XP`
                    : `Best Time: ${formatTime((progress as { minTime: number }).minTime || 0)}`
                  }
                </Typography>
              )}
              <LinearProgress 
                variant="determinate" 
                value={0} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            {activeSession && (
              <Box sx={{ 
                mt: 2, 
                p: 2, 
                bgcolor: 'warning.light', 
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'warning.main'
              }}>
                <Typography variant="body2" color="warning.dark" gutterBottom>
                  Active Session
                </Typography>
                {isTimeRush ? (
                  <>
                    <Typography variant="body2" color="warning.dark">
                      Time Remaining: {formatTime(activeSession.timeRush?.currentTime || 0)}
                    </Typography>
                    <Typography variant="body2" color="warning.dark">
                      Current XP: {activeSession.timeRush?.currentXp || 0}
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" color="warning.dark">
                      Time: {formatTime(activeSession.precisionPath?.currentTime || 0)}
                    </Typography>
                    <Typography variant="body2" color="warning.dark">
                      Current XP: {activeSession.precisionPath?.currentXp || 0}
                    </Typography>
                  </>
                )}
              </Box>
            )}
          </CardContent>
          <CardActions>
            {activeSession ? (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  size="small" 
                  color="warning"
                  variant="contained"
                  onClick={async (e) => {
                    e.stopPropagation();
                    await dispatch(setLevelSession(activeSession));
                    navigate(`/quiz/${level._id}`, { replace: true });
                  }}
                >
                  Reconnect
                </Button>
                <Button 
                  size="small" 
                  color="error"
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLevelClick(level._id, level.mode);
                  }}
                >
                  Start Fresh
                </Button>
              </Box>
            ) : (
              <Button 
                size="small" 
                color="primary"
                disabled={!level.status}
                onClick={(e) => {
                  e.stopPropagation();
                  level.status && handleLevelClick(level._id, level.mode);
                }}
              >
                {level.status ? 'Start Level' : 'Locked'}
              </Button>
            )}
          </CardActions>
        </Card>
      </Grid>
    );
  };

  return (
    <Box sx={{minHeight: '100vh'}}>
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.8)'
        }}
        open={isStarting}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: 2
        }}>
          <CircularProgress color="primary" size={60} />
          <Typography variant="h6">
            Starting Level...
          </Typography>
        </Box>
      </Backdrop>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Levels
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Time Rush" />
            <Tab label="Precision Path" />
          </Tabs>
        </Box>

        <Grid container spacing={3}>
          {activeTab === 0 
            ? levels.timeRush.map(renderLevelCard)
            : levels.precisionPath.map(renderLevelCard)
          }
        </Grid>
      </Container>
    </Box>
  );
};

export default Levels;
