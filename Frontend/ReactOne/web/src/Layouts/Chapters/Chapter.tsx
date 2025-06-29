import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Grid, 
  Typography, 
  Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// @ts-ignore
import ChapterCard from '../../components/ChapterCard';

interface Chapter {
  _id: string;
  name: string;
  description: string;
  gameName: string;
  topics: string[];
  status: boolean;
  thumbnailUrl?: string;
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
              <ChapterCard 
                chapter={{
                  ...chapter,
                  image: chapter.thumbnailUrl
                }}
                onClick={() => chapter.status && handleChapterClick(chapter._id)}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Chapters;
