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
      setLevels(chapterData.data);
    }
    if (chapterData?.meta?.chapter) {
      setChapter(chapterData.meta.chapter);
    }
  }, [chapterData]);

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
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ flex: 1 }} />
          <Box sx={{ ml: 'auto' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{
                minHeight: 'auto',
                '& .MuiTabs-indicator': {
                  height: 2,
                },
                '& .MuiTab-root': {
                  minHeight: 'auto',
                  minWidth: 'auto',
                  px: 2,
                  py: 1,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textTransform: 'none',
                },
              }}
            >
              <Tab label="Time Rush" />
              <Tab label="Precision Path" />
            </Tabs>
          </Box>
        </Box>

        <Box sx={levelsStyles.gridContainer}>
          {activeTab === 0 
            ? levels.timeRush.map(level => (
                <LevelCard 
                  key={`${level._id}_${level.mode}`}
                  level={level} 
                  chapter={chapter}
                  onLevelClick={handleLevelClick} 
                />
              ))
            : levels.precisionPath.map(level => (
                <LevelCard 
                  key={`${level._id}_${level.mode}`}
                  level={level} 
                  chapter={chapter}
                  onLevelClick={handleLevelClick} 
                />
              ))
          }
        </Box>
      </Container>
    </Box>
  );
};

export default Levels;
