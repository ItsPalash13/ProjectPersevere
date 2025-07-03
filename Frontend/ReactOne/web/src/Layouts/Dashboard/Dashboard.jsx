import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';
import SubjectSection from '../Subjects/SubjectSection';
import { dashboardStyles } from '../../theme/dashboardTheme';
import { navbarStyles } from '../../theme/navbarTheme';

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
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality here
      console.log('Searching for:', searchQuery);
      // You can add navigation to search results page or API call here
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <Box sx={dashboardStyles.container}>
      {/* Search Bar */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', px: 2 }}>
        <Box component="form" onSubmit={handleSearchSubmit} sx={navbarStyles.searchBar}>
          <Box
            component="input"
            sx={{
              ...navbarStyles.searchInput,
              '&::placeholder': {
                color: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.3)' 
                  : 'rgba(0, 0, 0, 0.5)',
                fontSize: '0.9rem',
                fontWeight: 400,
              },
            }}
            placeholder="Search chapters, subjects, or topics..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <Box sx={navbarStyles.searchActions}>
            {searchQuery && (
              <IconButton
                onClick={handleClearSearch}
                sx={navbarStyles.clearButton}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            )}
            <IconButton
              type="submit"
              sx={navbarStyles.searchIconButton}
            >
              <SearchIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Chapters by Subject */}
      <ChaptersBySubject darkMode={darkMode} />
    </Box>
  );
};

export default Dashboard; 