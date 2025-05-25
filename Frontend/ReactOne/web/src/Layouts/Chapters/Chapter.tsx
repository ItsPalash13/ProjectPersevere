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
  Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Chapter {
  _id: string;
  name: string;
  description: string;
  gameName: string;
  topics: string[];
  status: boolean;
}

const Chapters: React.FC = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/chapters`);
        setChapters(response.data.data);
      } catch (error) {
        console.error('Error fetching chapters:', error);
      }
    };

    fetchChapters();
  }, []);

  const handleChapterClick = (chapterId: string) => {
    navigate(`/levels/${chapterId}`);
  };

  return (
    <Box sx={{minHeight: '100vh'}}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Chapters
        </Typography>
        <Grid container spacing={3}>
          {chapters.map((chapter) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={chapter._id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: chapter.status ? 1 : 0.7,
                  '&:hover': {
                    boxShadow: chapter.status ? 6 : 1,
                    cursor: chapter.status ? 'pointer' : 'not-allowed'
                  }
                }}
                onClick={() => chapter.status && handleChapterClick(chapter._id)}
              >
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {chapter.name}
                    {!chapter.status && (
                      <Chip 
                        label="Coming Soon" 
                        size="small" 
                        color="default" 
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Typography>
                  <Typography color="text.secondary" paragraph sx={{ flexGrow: 1 }}>
                    {chapter.description}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {chapter.topics.map((topic, index) => (
                      <Chip 
                        key={index}
                        label={topic}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Game: {chapter.gameName}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    color="primary"
                    disabled={!chapter.status}
                    onClick={(e) => {
                      e.stopPropagation();
                      chapter.status && handleChapterClick(chapter._id);
                    }}
                  >
                    {chapter.status ? 'View Levels' : 'Coming Soon'}
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

export default Chapters;
