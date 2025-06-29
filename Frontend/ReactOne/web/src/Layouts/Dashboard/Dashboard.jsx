import React from 'react';
import { Box } from '@mui/material';
import SubjectSection from '../Subjects/SubjectSection';
import { dashboardStyles } from '../../theme/dashboardTheme';

// Chapters by Subject Component
const ChaptersBySubject = ({ darkMode }) => {
  const subjects = [
    { name: 'Mathematics', slug: 'math', icon: '' }
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
  return (
    <Box sx={dashboardStyles.container}>
      {/* Chapters by Subject */}
      <ChaptersBySubject darkMode={darkMode} />
    </Box>
  );
};

export default Dashboard; 