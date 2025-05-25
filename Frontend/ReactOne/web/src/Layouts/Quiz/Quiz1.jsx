import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Create socket instance outside component
const socket = io(import.meta.env.VITE_BACKEND_URL, {
  withCredentials: true,
  autoConnect: false // Prevent auto-connection
});

const Quiz1 = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(0);
  const [quizMessage, setQuizMessage] = useState('');
  const levelSession = useSelector(state => state.levelSession.session);

  useEffect(() => {
    // Connect only once when component mounts
    if (!socket.connected) {
      socket.connect();
    }

    // Initialize timer with session's total time
    if (levelSession?.currentTime) {
      setCurrentTime(levelSession.currentTime);
    }

    // Start timer interval
    const timerInterval = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev - 1;
        // Emit time update every 5 seconds
        if (newTime % 5 === 0) {
          socket.emit('sendUpdateTime', { currentTime: newTime, userLevelSessionId: levelSession?._id });
        }
        // Send quiz end when time reaches 0
        if (newTime <= 0) {
          socket.emit('sendQuizEnd', { userLevelSessionId: levelSession?._id });
          clearInterval(timerInterval);
        }
        return newTime;
      });
    }, 1000);

    // Listen for time updates from server
    socket.on('timeUpdated', ({ currentTime: serverTime }) => {
      setCurrentTime(serverTime);
    });

    // Listen for quiz finished
    socket.on('quizFinished', ({ message }) => {
      clearInterval(timerInterval);
      setQuizMessage(message);
    });

    // Listen for quiz errors
    socket.on('quizError', (error) => {
      console.error('Quiz error:', error);
    });

    // Cleanup on unmount
    return () => {
      clearInterval(timerInterval);
      socket.disconnect();
      socket.off('timeUpdated');
      socket.off('quizFinished');
      socket.off('quizError');
    };
  }, [levelId, levelSession, navigate]);

  return (
    <div>
      <h1>Quiz</h1>
      <div>Time: {currentTime} seconds</div>
      {quizMessage && (
        <div style={{ 
          color: 'red', 
          fontSize: '1.2rem', 
          marginTop: '1rem',
          textAlign: 'center' 
        }}>
          {quizMessage}
        </div>
      )}
      {/* Add your quiz UI components here */}
    </div>
  );
};

export default Quiz1;
