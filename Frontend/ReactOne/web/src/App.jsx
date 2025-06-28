import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
      main: '#9667e0',
      light: '#d4bbfc',
      dark: '#7c3aed',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#d4bbfc',
      light: '#ebd9fc',
      dark: '#9667e0',
    },
    background: {
      default: isDark ? '#1a1a2e' : '#fbfaff',
      paper: isDark ? '#2d2d44' : '#ffffff',
    },
    text: {
      primary: isDark ? '#fbfaff' : '#2d2d44',
      secondary: isDark ? 'rgba(251, 250, 255, 0.7)' : 'rgba(45, 45, 68, 0.7)',
    },
    divider: isDark ? 'rgba(150, 103, 224, 0.2)' : 'rgba(150, 103, 224, 0.1)',
    action: {
      hover: isDark ? 'rgba(150, 103, 224, 0.1)' : '#f2ebfb',
      selected: isDark ? 'rgba(150, 103, 224, 0.2)' : '#ebd9fc',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: isDark 
            ? '0 2px 8px rgba(0, 0, 0, 0.2)' 
            : '0 2px 8px rgba(150, 103, 224, 0.08)',
          border: isDark 
            ? '1px solid rgba(150, 103, 224, 0.2)' 
            : '1px solid rgba(242, 235, 251, 0.8)',
          background: isDark 
            ? 'linear-gradient(145deg, #2d2d44 0%, #3a3a5c 100%)'
            : 'linear-gradient(145deg, #ffffff 0%, #fbfaff 100%)',
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
          background: 'linear-gradient(135deg, #9667e0 0%, #d4bbfc 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #7c3aed 0%, #9667e0 100%)',
          },
        },
        outlined: {
          borderColor: '#9667e0',
          color: '#9667e0',
          '&:hover': {
            backgroundColor: '#f2ebfb',
            borderColor: '#9667e0',
          },
        },
      },
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
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
  const [devicePixelRatio, setDevicePixelRatio] = useState(window.devicePixelRatio);

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
  useEffect(() => {
    const updateDevicePixelRatio = () => {
      const newRatio = window.devicePixelRatio;
      setDevicePixelRatio(newRatio);
      
      // At 90% zoom (approximately 0.9 ratio), if collapsed, set to expanded
      if (Math.round(newRatio * 100) === 90 && !sidebarOpen) {
        setSidebarOpen(true);
        setStorageValue(STORAGE_KEYS.SIDEBAR_OPEN, true);
      }
    };

    // Listen for resize events (which occur when zooming)
    window.addEventListener('resize', updateDevicePixelRatio);
    
    // Also listen for orientation changes on mobile
    window.addEventListener('orientationchange', updateDevicePixelRatio);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('resize', updateDevicePixelRatio);
      window.removeEventListener('orientationchange', updateDevicePixelRatio);
    };
  }, [sidebarOpen]);

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
  const showNavbar = !['/login', '/register'].includes(location.pathname);
  
  // Determine if we should show the sidebar
  const showSidebar = isAuthenticated && !['/login', '/register'].includes(location.pathname);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
              devicePixelRatio={devicePixelRatio}
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
              <Route path="/quiz/:levelId" element={<ProtectedRoute><Quiz socket={socket} /></ProtectedRoute>} />
              <Route path="/chapters" element={<ProtectedRoute><Chapters /></ProtectedRoute>} />
              <Route path="/levels/:chapterId" element={<ProtectedRoute><Levels /></ProtectedRoute>} />
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
