import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { authClient } from './lib/auth-client';
import { useDispatch } from 'react-redux';
import { setSession } from './features/auth/authSlice';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import Home from './components/Home';
import Login from './Layouts/Auth/Login';
import Register from './Layouts/Auth/Register';
import Dashboard from './Layouts/Dashboard/Dashboard';
import Quiz from './Layouts/Quiz/Quiz';
import Chapters from './Layouts/Chapters/Chapter';
import Levels from './Layouts/Levels/Levels';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import './App.css';
import Admin from './Layouts/Admin/Admin';
import Profile from './Layouts/Profile/Profile';

// Create socket instance outside component
export const socket = io(import.meta.env.VITE_BACKEND_URL, {
  withCredentials: true,
  autoConnect: false // Prevent auto-connection
});

// localStorage keys
const STORAGE_KEYS = {
  DARK_MODE: 'projectx_dark_mode',
  SIDEBAR_OPEN: 'projectx_sidebar_open',
};

// Helper functions for localStorage
const getStorageValue = (key, defaultValue) => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

const setStorageValue = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error setting localStorage key "${key}":`, error);
  }
};

// Create theme function
const createAppTheme = (isDark) => createTheme({
  palette: {
    mode: isDark ? 'dark' : 'light',
    primary: {
      main: isDark ? '#FBFBFA' : '#1F1F1F',
      light: isDark ? '#FFFFFF' : '#666666',
      dark: isDark ? '#CCCCCC' : '#000000',
      contrastText: isDark ? '#1F1F1F' : '#FFFFFF',
    },
    secondary: {
      main: isDark ? '#CCCCCC' : '#666666',
      light: isDark ? '#E5E5E5' : '#999999',
      dark: isDark ? '#999999' : '#333333',
    },
    background: {
      default: isDark ? '#1F1F1F' : '#FFFFFF',
      surface: isDark ? '#0A0A0A' : '#FFFFFF',
      paper: isDark ? '#2A2A2A' : '#FBFBFA',
    },
    text: {
      primary: isDark ? '#FBFBFA' : '#1F1F1F',
      secondary: isDark ? '#CCCCCC' : '#666666',
    },
    divider: isDark ? '#404040' : '#E5E5E5',
    action: {
      hover: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      selected: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: isDark 
            ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
            : '0 2px 8px rgba(0, 0, 0, 0.05)',
          border: isDark 
            ? '1px solid #404040' 
            : '1px solid #E5E5E5',
          background: isDark ? '#2A2A2A' : '#FBFBFA',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
        },
        contained: {
          background: isDark ? '#404040' : '#E5E5E5',
          color: isDark ? '#FBFBFA' : '#1F1F1F',
          '&:hover': {
            background: isDark ? '#555555' : '#DDDDDD',
          },
        },
        outlined: {
          borderColor: isDark ? '#555555' : '#CCCCCC',
          color: isDark ? '#CCCCCC' : '#666666',
          '&:hover': {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
            borderColor: isDark ? '#666666' : '#999999',
          },
        },
      },
    },
  },
  typography: {
    fontFamily: '"Roboto", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '1.75rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.1rem',
    },
    body1: {
      fontSize: '0.9rem',
    },
    body2: {
      fontSize: '0.8rem',
    },
  },
});

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

// Quiz wrapper component to force remount on levelId change
const QuizWrapper = ({ socket }) => {
  const { levelId } = useParams();
  return <Quiz key={levelId} socket={socket} />;
};

function AppContent() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { data: session, isLoading } = authClient.useSession();
  const [darkMode, setDarkMode] = useState(() => 
    getStorageValue(STORAGE_KEYS.DARK_MODE, false)
  );
  const [sidebarOpen, setSidebarOpen] = useState(() => 
    getStorageValue(STORAGE_KEYS.SIDEBAR_OPEN, true)
  );
  
  // Device pixel ratio state for zoom level tracking
  // const [devicePixelRatio, setDevicePixelRatio] = useState(window.devicePixelRatio);

  const theme = createAppTheme(darkMode);
  const isAuthenticated = !!session?.session;

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    setStorageValue(STORAGE_KEYS.DARK_MODE, newDarkMode);
  };

  const handleSidebarToggle = () => {
    const newSidebarOpen = !sidebarOpen;
    setSidebarOpen(newSidebarOpen);
    setStorageValue(STORAGE_KEYS.SIDEBAR_OPEN, newSidebarOpen);
  };

  // Track device pixel ratio changes (zoom level changes)
  // useEffect(() => {
  //   const updateDevicePixelRatio = () => {
  //     const newRatio = window.devicePixelRatio;
  //     setDevicePixelRatio(newRatio);
  //     
  //     // At 90% zoom (approximately 0.9 ratio), if collapsed, set to expanded
  //     if (Math.round(newRatio * 100) === 90 && !sidebarOpen) {
  //       setSidebarOpen(true);
  //       setStorageValue(STORAGE_KEYS.SIDEBAR_OPEN, true);
  //     }
  //   };

  //   // Listen for resize events (which occur when zooming)
  //   window.addEventListener('resize', updateDevicePixelRatio);
  //   
  //   // Also listen for orientation changes on mobile
  //   window.addEventListener('orientationchange', updateDevicePixelRatio);

  //   // Cleanup event listeners
  //   return () => {
  //     window.removeEventListener('resize', updateDevicePixelRatio);
  //     window.removeEventListener('orientationchange', updateDevicePixelRatio);
  //   };
  // }, [sidebarOpen]);

  useEffect(() => {
    console.log('Session data from auth client:', session); // Debug log
    if (session?.session && session?.user) {
      // Serialize dates before dispatching to Redux
      const serializedSession = serializeDates(session.session);
      const serializedUser = serializeDates(session.user);

      console.log('Dispatching to Redux:', { serializedSession, serializedUser }); // Debug log
      dispatch(setSession({
        session: serializedSession,
        user: serializedUser
      }));
    }
  }, [session, dispatch]);

  // Determine if we should show the navbar
  const showNavbar = !['/login', '/register'].includes(location.pathname) && !location.pathname.startsWith('/quiz');
  
  // Determine if we should show the sidebar
  const showSidebar = isAuthenticated && !['/login', '/register'].includes(location.pathname);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: theme.palette.background.surface}}>
        {showNavbar && (
          <Navbar 
            darkMode={darkMode} 
            onDarkModeToggle={handleDarkModeToggle}
          />
        )}
        <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
          {showSidebar && (
            <Sidebar 
              open={sidebarOpen} 
              onToggle={handleSidebarToggle}
              // devicePixelRatio={devicePixelRatio}
            />
          )}
          <Box 
            component="main"
            sx={{ 
              flexGrow: 1, 
              minHeight: 0,
              overflowY: 'auto',
              backgroundColor: 'background.default'
            }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard darkMode={darkMode} onDarkModeToggle={handleDarkModeToggle} />
                  </ProtectedRoute>
                }
              />
              <Route path="/quiz/:levelId" element={<ProtectedRoute><QuizWrapper socket={socket} /></ProtectedRoute>} />
              <Route path="/chapters" element={<ProtectedRoute><Chapters /></ProtectedRoute>} />
              <Route path="/chapter/:chapterId" element={<ProtectedRoute><Levels /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function ProtectedRoute({ children }) {
  const { data: session, isLoading } = authClient.useSession();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default App;
