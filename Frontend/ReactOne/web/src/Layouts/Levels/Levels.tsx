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
  CircularProgress
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
  activeSession?: {
    _id: string;
    currentTime: number;
    currentXp: number;
  } | null;
}

const Levels: React.FC = () => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [isStarting, setIsStarting] = useState(false);
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

  const handleLevelClick = async (levelId: string) => {
    try {
      setIsStarting(true);
      const result = await startLevel(levelId).unwrap();
      dispatch(setLevelSession(result.data.session));
      navigate(`/quiz/${levelId}`);
    } catch (error) {
      console.error('Failed to start level:', error);
      setIsStarting(false);
    }
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
        <Grid container spacing={3}>
          {levels.map((level) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={level._id}>
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
                onClick={() => level.status && !level.activeSession && handleLevelClick(level._id)}
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
                      Required XP: {level.requiredXP}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={0} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  {level.activeSession && (
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
                      <Typography variant="body2" color="warning.dark">
                        Time Remaining: {Math.floor(level.activeSession.currentTime / 60)}:{(level.activeSession.currentTime % 60).toString().padStart(2, '0')}
                      </Typography>
                      <Typography variant="body2" color="warning.dark">
                        Current XP: {level.activeSession.currentXp}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  {level.activeSession ? (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        size="small" 
                        color="warning"
                        variant="contained"
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(setLevelSession(level.activeSession));
                          navigate(`/quiz/${level._id}`);
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
                          handleLevelClick(level._id);
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
                        level.status && handleLevelClick(level._id);
                      }}
                    >
                      {level.status ? 'Start Level' : 'Locked'}
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Levels;
