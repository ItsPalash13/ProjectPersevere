import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Box,
  Backdrop,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
// @ts-ignore
import { useGetChapterInfoQuery, useStartLevelMutation } from '../../features/api/levelAPI';
// @ts-ignore
import { setLevelSession } from '../../features/auth/levelSessionSlice';
// @ts-ignore
import { levelsStyles } from '../../theme/levelsTheme';
// @ts-ignore
import LevelCard from '../../components/LevelCard';

export interface Level {
  _id: string;
  name: string;
  levelNumber: number;
  description: string;
  topics: string[];
  status: boolean;
  type: 'time_rush' | 'precision_path';
  
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
  const [levels, setLevels] = useState<{ timeRush: Level[], precisionPath: Level[] }>({ timeRush: [], precisionPath: [] });
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: chapterData, isLoading, refetch } = useGetChapterInfoQuery(chapterId || '', {
    skip: !chapterId
  });
  const [startLevel] = useStartLevelMutation();

  useEffect(() => {
    if (chapterId) {
      refetch();
    }
  }, [chapterId, refetch]);

  useEffect(() => {
    if (chapterData?.data) {
      // Filter levels based on their actual type, not the API array they come from
      const allLevels = [...chapterData.data.timeRush, ...chapterData.data.precisionPath];
      
      const timeRushLevels = allLevels.filter(level => level.type === 'time_rush');
      const precisionPathLevels = allLevels.filter(level => level.type === 'precision_path');
      
      setLevels({
        timeRush: timeRushLevels,
        precisionPath: precisionPathLevels
      });
    }
    if (chapterData?.meta?.chapter) {
      setChapter(chapterData.meta.chapter);
    }
  }, [chapterData]);

  const handleLevelClick = async (levelId: string, mode: 'time_rush' | 'precision_path') => {
    try {
      // Find the level to validate mode compatibility
      const allLevels = [...levels.timeRush, ...levels.precisionPath];
      const level = allLevels.find(l => l._id === levelId);
      
      if (!level) {
        console.error('Level not found');
        return;
      }
      
      // Use the level's actual type for the request
      const attemptType = level.type;
      
      setIsStarting(true);
      const result = await startLevel({ levelId, attemptType }).unwrap();
      dispatch(setLevelSession(result.data.session));
      navigate(`/quiz/${levelId}`);
    } catch (error: any) {
      console.error('Failed to start level:', error);
      if (error?.data?.error) {
        console.error('Server error:', error.data.error);
        // Could show user-friendly error message based on error.data.error
      }
      setIsStarting(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

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
      <Backdrop sx={levelsStyles.backdrop} open={isStarting}>
        <Box sx={levelsStyles.loadingContainer}>
          <CircularProgress color="primary" size={60} />
          <Typography variant="h6">
            Loading Chapter...
          </Typography>
        </Box>
      </Backdrop>

      <Container maxWidth="lg" sx={levelsStyles.pageContainer}>
        {chapter && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
              {chapter.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
              {chapter.topics.map((topic, index) => (
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
              ))}
            </Box>
          </Box>
        )}
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="level mode tabs">
            <Tab 
              label={`Time Rush (${levels.timeRush.length})`} 
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
            <Tab 
              label={`Precision Path (${levels.precisionPath.length})`} 
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
          </Tabs>
        </Box>

        <Box sx={levelsStyles.gridContainer}>
          {activeTab === 0 && levels.timeRush.map(level => (
            <LevelCard 
              key={`${level._id}_time_rush`}
              level={level} 
              chapter={chapter}
              onLevelClick={handleLevelClick} 
            />
          ))}
          {activeTab === 1 && levels.precisionPath.map(level => (
            <LevelCard 
              key={`${level._id}_precision_path`}
              level={level} 
              chapter={chapter}
              onLevelClick={handleLevelClick} 
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Levels;
