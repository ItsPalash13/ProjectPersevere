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
  IconButton
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
}

const Levels: React.FC = () => {
  const [levels, setLevels] = useState<Level[]>([]);
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: levelsData, isLoading } = useGetLevelsQuery(chapterId || '');
  const [startLevel] = useStartLevelMutation();

  useEffect(() => {
    if (levelsData?.data) {
      setLevels(levelsData.data);
    }
  }, [levelsData]);

  const handleLevelClick = async (levelId: string) => {
    try {
      const result = await startLevel(levelId).unwrap();
      dispatch(setLevelSession(result.data.session));
      navigate(`/quiz1/${levelId}`);
    } catch (error) {
      console.error('Failed to start level:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{minHeight: '100vh'}}>
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
                onClick={() => level.status && handleLevelClick(level._id)}
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
                </CardContent>
                <CardActions>
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
