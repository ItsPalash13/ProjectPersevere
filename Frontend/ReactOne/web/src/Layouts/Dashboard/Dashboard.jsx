import React from 'react';
import { Box, Chip } from '@mui/material';
import SubjectSection from '../Subjects/SubjectSection';
import { dashboardStyles } from '../../theme/dashboardTheme';

// Chapters by Subject Component
const ChaptersBySubject = ({ darkMode }) => {
  const subjects = [
    { name: 'JEE Mathematics', slug: 'math', icon: '' }
  ];

  return (
    <Box sx={dashboardStyles.chaptersContainer}>
      {subjects.map((subject) => (
        <SubjectSection key={subject.slug} subject={subject} />
      ))}
    </Box>
  );
};

const Dashboard = ({ darkMode, onDarkModeToggle }) => {
  const [selectedTopic, setSelectedTopic] = React.useState('All');
  
  const jeeTopics = [
    'All',
    'Calculus',
    'Algebra',
    'Trigonometry',
    'Mechanics',
    'Electromagnetism',
    'Thermodynamics',
    'Organic Chemistry',
    'Inorganic Chemistry',
    'Physical Chemistry',
    'Coordination Chemistry',
    'Electrochemistry',
    'Chemical Kinetics'
  ];

  return (
    <Box sx={dashboardStyles.container}>
      {/* JEE Topic Tags */}
      <Box sx={{ mb: 1.25, px: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          pt:1.5,
          gap: 1, 
          overflowX: 'auto',
          overflowY: 'hidden',
          whiteSpace: 'nowrap',
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE and Edge
          '&::-webkit-scrollbar': { // Chrome, Safari, Opera
            display: 'none'
          },
          pb: 1 // Add padding bottom for hidden scrollbar
        }}>
          {jeeTopics.map((topic, index) => {
            const isSelected = selectedTopic === topic;
            return (
              <Chip
                key={index}
                label={topic}
                size="small"
                clickable
                onClick={() => setSelectedTopic(topic)}
                sx={{
                  backgroundColor: isSelected ? 'primary.main' : 'background.paper',
                  color: isSelected ? 'primary.contrastText' : 'text.secondary',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: isSelected ? 600 : 500,
                  flexShrink: 0, // Prevent chips from shrinking
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: isSelected ? 'primary.dark' : 'action.hover',
                    borderColor: isSelected ? 'transparent' : 'primary.main',
                  },
                  transition: 'all 0.2s ease',
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* Chapters by Subject */}
      <ChaptersBySubject darkMode={darkMode} />
    </Box>
  );
};

export default Dashboard; 