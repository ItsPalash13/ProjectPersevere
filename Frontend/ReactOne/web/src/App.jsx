import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authClient } from './lib/auth-client';
import { useDispatch } from 'react-redux';
import { setSession } from './features/auth/authSlice';
import { useEffect } from 'react';
import Home from './components/Home';
import Login from './Layouts/Auth/Login';
import Register from './Layouts/Auth/Register';
import Dashboard from './Layouts/Dashboard/Dashboard';
import Quiz from './Layouts/Quiz/Quiz';
import './App.css';

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

function App() {
  const dispatch = useDispatch();
  const { data: session, isLoading } = authClient.useSession();

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

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
    
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        
      
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
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
