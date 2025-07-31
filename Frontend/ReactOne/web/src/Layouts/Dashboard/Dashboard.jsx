import React from 'react';
import { Box, Chip } from '@mui/material';
import { useDispatch } from 'react-redux';
import SubjectSection from '../Subjects/SubjectSection';
import { dashboardStyles } from '../../theme/dashboardTheme';
import { authClient } from '../../lib/auth-client';
import { setSession } from '../../features/auth/authSlice';

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
  const dispatch = useDispatch();
  const [selectedTopic, setSelectedTopic] = React.useState('All');
  
  // Get session data from auth client
  const { data: session, refetch: refetchSession } = authClient.useSession();
  
  // Helper function to serialize dates in an object
  const serializeDates = (obj) => {
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

  // Update session data on load
  React.useEffect(() => {
    console.log('Session data from auth client in Dashboard:', session); // Debug log
    if (session?.session && session?.user) {
      // Serialize dates before dispatching to Redux
      const serializedSession = serializeDates(session.session);
      const serializedUser = serializeDates(session.user);

      console.log('Dispatching to Redux from Dashboard:', { serializedSession, serializedUser }); // Debug log
      dispatch(setSession({
        session: serializedSession,
        user: serializedUser
      }));
    }
  }, [session, dispatch]);

  // Force session refetch on component mount
  React.useEffect(() => {
    console.log('Dashboard component mounted, refetching session...');
    refetchSession();
  }, [refetchSession]);
  
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