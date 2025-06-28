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
import { useGetLevelsQuery, useStartLevelMutation } from '../../features/api/levelAPI';
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
            Starting Level...
          </Typography>
        </Box>
      </Backdrop>

      <Container maxWidth="lg" sx={levelsStyles.pageContainer}>
        <Typography variant="h4" component="h1" gutterBottom sx={levelsStyles.pageTitle}>
          Levels
        </Typography>
        
        <Box sx={levelsStyles.tabsContainer}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Time Rush" />
            <Tab label="Precision Path" />
          </Tabs>
        </Box>

        <Box sx={levelsStyles.gridContainer}>
          {activeTab === 0 
            ? levels.timeRush.map(level => (
                <LevelCard 
                  key={`${level._id}_${level.mode}`}
                  level={level} 
                  onLevelClick={handleLevelClick} 
                />
              ))
            : levels.precisionPath.map(level => (
                <LevelCard 
                  key={`${level._id}_${level.mode}`}
                  level={level} 
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
