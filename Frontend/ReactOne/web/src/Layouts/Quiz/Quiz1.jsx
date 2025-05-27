import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent, Typography, RadioGroup, Radio, FormControlLabel } from '@mui/material';

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
  const [openDialog, setOpenDialog] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const levelSession = useSelector((state) => state.levelSession.session);

  const handleEndQuiz = () => {
    setOpenDialog(true);
  };

  const confirmEndQuiz = () => {
    socket.emit('sendQuizEnd', { userLevelSessionId: levelSession?._id });
    setOpenDialog(false);
    setTimeout(() => {
      navigate(`/`);
    }, 1000);
  };

  const requestQuestion = () => {
    socket.emit('question', { userLevelSessionId: levelSession?._id });
  };

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
    });

    // Listen for questions
    socket.on('question', (data) => {
      setCurrentQuestion(data);
      setSelectedAnswer('');
    });

    // Listen for quiz finished
    socket.on('quizFinished', ({ message }) => {
      clearInterval(timerInterval);
      setQuizMessage(message);
      setTimeout(() => {
        navigate(`/`);
      }, 1000);
    });

    // Listen for quiz errors
    socket.on('quizError', ({ type, message }) => {
      console.error('Quiz error:', message);
      if (type === 'failure') {
        setQuizMessage(message);
        setTimeout(() => {
          navigate(`/`);
        }, 1000);
      } else {
        // Show error but don't navigate
        setQuizMessage(message);
      }
    });

    // Cleanup on unmount
    return () => {
      clearInterval(timerInterval);
      socket.disconnect();
      socket.off('timeUpdated');
      socket.off('question');
      socket.off('quizFinished');
      socket.off('quizError');
    };
  }, [levelId, levelSession, navigate]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
        <h1>Quiz</h1>
        <Button 
          variant="contained" 
          color="error" 
          onClick={handleEndQuiz}
          disabled={!!quizMessage}
        >
          End Quiz
        </Button>
      </div>
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

      <div style={{ padding: '2rem' }}>
        {!currentQuestion ? (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={requestQuestion}
            disabled={!!quizMessage}
          >
            Get Question
          </Button>
        ) : (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {currentQuestion.question}
              </Typography>
              <RadioGroup
                value={selectedAnswer}
                onChange={(e) => setSelectedAnswer(e.target.value)}
              >
                {currentQuestion.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={option}
                    control={<Radio />}
                    label={option}
                  />
                ))}
              </RadioGroup>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={requestQuestion}
                disabled={!!quizMessage}
                style={{ marginTop: '1rem' }}
              >
                Next Question
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>End Quiz</DialogTitle>
        <DialogContent>
          Are you sure you want to end the quiz? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={confirmEndQuiz} color="error" variant="contained">
            End Quiz
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add your quiz UI components here */}
    </div>
  );
};

export default Quiz1;
