import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Box,
  Backdrop,
  CircularProgress,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  Chip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowBack as ArrowBackIcon, Analytics as AnalyticsIcon, Favorite as HealthIcon } from '@mui/icons-material';
// @ts-ignore
import { useGetChapterInfoQuery, useStartLevelMutation } from '../../features/api/levelAPI';
// @ts-ignore
import { setLevelSession } from '../../features/auth/levelSessionSlice';
// @ts-ignore
import { selectUserHealth, setSession } from '../../features/auth/authSlice';
// @ts-ignore
import { authClient } from '../../lib/auth-client';
// @ts-ignore
import { levelsStyles } from '../../theme/levelsTheme';
// @ts-ignore
import LevelCard from '../../components/LevelCard';
// @ts-ignore
import Performance from '../../components/Performance';

export interface Level {
  _id: string;
  name: string;
  levelNumber: number;
  description: string;
  topics: string[];
  status: boolean;
  type: 'time_rush' | 'precision_path';
  unitId: string; // <-- Add this line
  
  // Mode-specific nested fields from Level model (conditional based on type)
  timeRush?: {
    requiredXp: number;
    totalTime: number;
  };
  precisionPath?: {
    requiredXp: number;
  };
  
  // Runtime mode for display (derived from type)
  mode: 'time_rush' | 'precision_path';
  
  // Additional fields from API response
  isStarted: boolean;
  
  userProgress?: {
    timeRush?: {
      maxXp: number;
      attempts: number;
      requiredXp: number;
      timeLimit?: number;
    };
    precisionPath?: {
      minTime: number | null;
      attempts: number;
      requiredXp: number;
    };
    _id: string;
    userId: string;
    chapterId: string;
    levelId: string;
    levelNumber: number;
    status: string;
    lastAttemptedAt: string;
    attemptType: 'time_rush' | 'precision_path';
    completedAt?: string;
    __v?: number;
  } | null;
}

export interface Chapter {
  _id: string;
  name: string;
  description: string;
  gameName: string;
  topics: string[];
  status: boolean;
  thumbnailUrl?: string;
}

const Levels: React.FC = () => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [showPerformance, setShowPerformance] = useState(false);
  const [showUnitPerformance, setShowUnitPerformance] = useState<string | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: chapterData, isLoading, refetch } = useGetChapterInfoQuery(chapterId || '', {
    skip: !chapterId
  });
  const [startLevel] = useStartLevelMutation();
  const [units, setUnits] = useState<any[]>([]);
  
  // Get user health from Redux store
  const userHealth = useSelector(selectUserHealth) as number;
  
  // Get session data from auth client
  const { data: session, refetch: refetchSession } = authClient.useSession();

  // Helper function to serialize dates in an object
  const serializeDates = (obj: any) => {
    if (!obj) return obj;
    
    const result = { ...obj };
    for (const key in result) {
      if (result[key] instanceof Date) {
        result[key] = result[key].toISOString();
      } else if (typeof result[key] === 'object' && result[key] !== null) {
        result[key] = serializeDates(result[key]);
      }
    }
    return result;
  };

  useEffect(() => {
    console.log('Session data from auth client in Levels:', session); // Debug log
    if (session?.session && session?.user) {
      // Serialize dates before dispatching to Redux
      const serializedSession = serializeDates(session.session);
      const serializedUser = serializeDates(session.user);

      console.log('Dispatching to Redux from Levels:', { serializedSession, serializedUser }); // Debug log
      dispatch(setSession({
        session: serializedSession,
        user: serializedUser
      }));
    }
  }, [session, dispatch]);

  // Force session refetch on component mount
  useEffect(() => {
    console.log('Levels component mounted, refetching session...');
    refetchSession();
  }, [refetchSession]);

  useEffect(() => {
    if (chapterId) {
      refetch();
    }
  }, [chapterId, refetch]);

  useEffect(() => {
    if (chapterData?.data) {
      // API returns a single mixed array sorted by levelNumber
      const allLevels = chapterData.data as Level[];
      setLevels(allLevels);
    }
    if (chapterData?.meta?.chapter) {
      setChapter(chapterData.meta.chapter);
    }
    if (chapterData?.meta?.units) {
      setUnits(chapterData.meta.units);
    }
  }, [chapterData]);

  const handleLevelClick = async (levelId: string, mode: 'time_rush' | 'precision_path') => {
    try {
      // Clear any previous health errors
      setHealthError(null);
      
      // Check if user has sufficient health
      if (userHealth <= 0) {
        setHealthError('Insufficient health to start level. You need health greater than 0 to play.');
        return;
      }
      
      // Find the level to validate mode compatibility
      const level = levels.find(l => l._id === levelId);
      
      if (!level) {
        console.error('Level not found');
        return;
      }
      
      // Use the level's actual type for the request
      const attemptType = level.type;
      
      setIsStarting(true);
      const result = await startLevel({ levelId, attemptType }).unwrap();
      dispatch(setLevelSession(result.data.session));
      
      // Store selected level ID and start countdown
      setSelectedLevelId(levelId);
      setCountdown(3);
      setShowCountdown(true);
      setIsStarting(false);
    } catch (error: any) {
      console.error('Failed to start level:', error);
      if (error?.data?.error) {
        console.error('Server error:', error.data.error);
        
        // Handle health-related errors
        if (error.data.error.includes('Insufficient health')) {
          setHealthError(error.data.error);
        }
      }
      setIsStarting(false);
    }
  };

  // Countdown effect
  useEffect(() => {
    if (showCountdown && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (showCountdown && countdown === 0) {
      // Navigate to quiz when countdown reaches 0
      if (selectedLevelId) {
        navigate(`/quiz/${selectedLevelId}`);
      }
    }
  }, [showCountdown, countdown, selectedLevelId, navigate]);

  const handleCancelCountdown = () => {
    setShowCountdown(false);
    setCountdown(3);
    setSelectedLevelId(null);
  };

  // Group levels by unitId
  const levelsByUnit: { [unitId: string]: Level[] } = {};
  levels.forEach(level => {
    if (!levelsByUnit[level.unitId]) levelsByUnit[level.unitId] = [];
    levelsByUnit[level.unitId].push(level);
  });

  if (isLoading) {
    return (
      <Box sx={levelsStyles.container}>
        <Backdrop sx={levelsStyles.backdrop} open={true}>
          <Box sx={levelsStyles.loadingContainer}>
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
    <Box sx={levelsStyles.container}>
      {/* Health Error Alert */}
      {healthError && (
        <Alert 
          severity="error" 
          sx={{ mb: 2, mx: 2 }}
          onClose={() => setHealthError(null)}
        >
          {healthError}
        </Alert>
      )}
      
      
      {/* Countdown Fullscreen Overlay */}
      {showCountdown && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            color: 'white'
          }}
        >
          {/* Back Button */}
          <IconButton
            onClick={handleCancelCountdown}
            sx={{
              position: 'absolute',
              top: 20,
              left: 20,
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>

          {/* Countdown Display */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h1" 
              sx={{ 
                fontSize: '8rem', 
                fontWeight: 'bold',
                color: 'white',
                textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
                animation: countdown > 0 ? 'pulse 1s ease-in-out' : 'none',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.1)' },
                  '100%': { transform: 'scale(1)' }
                }
              }}
            >
              {countdown}
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                mt: 2,
                color: 'white',
                opacity: 0.8
              }}
            >
              {countdown > 0 ? 'Get Ready!' : 'Starting...'}
            </Typography>
          </Box>
        </Box>
      )}

      <Backdrop sx={levelsStyles.backdrop} open={isStarting}>
        <Box sx={levelsStyles.loadingContainer}>
          <CircularProgress color="primary" size={60} />
          <Typography variant="h6">
            Loading Session...
          </Typography>
        </Box>
      </Backdrop>

      <Container maxWidth="lg" sx={levelsStyles.pageContainer}>
        {chapter && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                {chapter.name}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AnalyticsIcon />}
                onClick={() => setShowPerformance(true)}
                sx={{ ml: 2 }}
              >
                Performance Analytics
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
              {chapter.topics && chapter.topics.length > 0 ? (
                chapter.topics.map((topic, index) => (
                <Box
                  key={index}
                  sx={{
                    px: 1,
                    py: 0.25,
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    borderRadius: 0.75,
                    fontSize: '0.75rem',
                    fontWeight: 500
                  }}
                >
                  {topic}
                </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No topics available
                </Typography>
              )}
            </Box>
          </Box>
        )}
        {/* Render units and their levels */}
        <Box sx={levelsStyles.gridContainer}>
          {units.map(unit => (
            <Box key={unit._id} sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {unit.name}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AnalyticsIcon />}
                onClick={() => setShowUnitPerformance(unit._id)}
                sx={{ ml: 2, mb: 1 }}
              >
                Unit Analytics
              </Button>
              </Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {unit.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                {unit.topics.map((topic: string, idx: number) => (
                  <Box
                    key={idx}
                    sx={{
                      px: 1,
                      py: 0.25,
                      backgroundColor: 'secondary.main',
                      color: 'secondary.contrastText',
                      borderRadius: 0.75,
                      fontSize: '0.75rem',
                      fontWeight: 500
                    }}
                  >
                    {topic}
                  </Box>
                ))}
              </Box>
              <Box sx={levelsStyles.gridContainer}>
                {(levelsByUnit[unit._id] || []).map(level => (
                  <LevelCard
                    key={`${level._id}_${level.type}`}
                    level={level}
                    chapter={chapter}
                    onLevelClick={handleLevelClick}
                  />
                ))}
                {(levelsByUnit[unit._id] || []).length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No levels available for this unit.
                  </Typography>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Container>

      {/* Performance Analytics Dialog */}
      <Dialog
        open={showPerformance}
        onClose={() => setShowPerformance(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              Performance Analytics - {chapter?.name}
            </Typography>
            <IconButton onClick={() => setShowPerformance(false)}>
              <ArrowBackIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {chapterId && (
            <Performance
              chapterId={chapterId}
              onClose={() => setShowPerformance(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Unit Performance Analytics Dialog */}
      <Dialog
        open={!!showUnitPerformance}
        onClose={() => setShowUnitPerformance(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              Unit Analytics - {units.find(u => u._id === showUnitPerformance)?.name}
            </Typography>
            <IconButton onClick={() => setShowUnitPerformance(null)}>
              <ArrowBackIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {showUnitPerformance && (
            <Performance
              unitId={showUnitPerformance}
              onClose={() => setShowUnitPerformance(null)}
              mode="unit"
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Levels;
