import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  CircularProgress,
  ThemeProvider,
  createTheme,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Star as StarIcon, Close as CloseIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const quizTheme = createTheme({
  palette: {
    primary: {
      main: '#424242',
      light: '#616161',
      dark: '#212121',
    },
    secondary: {
      main: '#757575',
      light: '#9e9e9e',
      dark: '#616161',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    error: {
      main: '#c62828',
      light: '#ef5350',
      dark: '#b71c1c',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    h5: {
      fontWeight: 600,
      color: '#212121',
    },
    body1: {
      fontSize: '1.1rem',
      fontWeight: 500,
      color: '#424242',
    },
  },
  shape: {
    borderRadius: 12,
  },
});

const QuizContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.default,
  backgroundImage: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
  position: 'relative',
}));

const QuestionCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  backgroundColor: theme.palette.background.paper,
  border: '1px solid rgba(0,0,0,0.1)',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[3],
  },
}));

const OptionCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[1],
  backgroundColor: theme.palette.background.paper,
  minHeight: '160px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid rgba(0,0,0,0.1)',
  padding: theme.spacing(2, 0),
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
  '&.selected': {
    border: `2px solid ${theme.palette.primary.main}`,
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    '& .MuiTypography-root': {
      color: 'white',
    }
  },
  '&.correct': {
    border: `2px solid ${theme.palette.success.main}`,
    backgroundColor: theme.palette.success.main,
    color: 'white',
    '& .MuiTypography-root': {
      color: 'white',
    }
  },
  '&.wrong': {
    border: `2px solid ${theme.palette.error.main}`,
    backgroundColor: theme.palette.error.main,
    color: 'white',
    '& .MuiTypography-root': {
      color: 'white',
    }
  },
  '&.correct-answer': {
    border: `2px solid ${theme.palette.success.main}`,
    backgroundColor: theme.palette.success.main,
    color: 'white',
    '& .MuiTypography-root': {
      color: 'white',
    }
  }
}));

const QuizHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(1.5, 4),
  fontSize: '1.1rem',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: theme.shadows[2],
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const TimeDisplay = styled(Box)(({ theme }) => ({
  fontSize: '1.2rem',
  fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1, 3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  display: 'inline-block',
  margin: '0 auto',
}));

const XpDisplay = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  '& .MuiSvgIcon-root': {
    color: theme.palette.warning.main,
    animation: 'pulse 2s infinite',
  },
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
    },
    '50%': {
      transform: 'scale(1.1)',
    },
    '100%': {
      transform: 'scale(1)',
    },
  },
}));

const PowerupDisplay = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  marginLeft: theme.spacing(2),
}));

const PowerupItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  padding: theme.spacing(0.5, 1),
  backgroundColor: theme.palette.primary.light,
  borderRadius: theme.shape.borderRadius,
  color: 'white',
  fontSize: '0.9rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    transform: 'translateY(-2px)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));

const CongratsDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.shape.borderRadius * 2,
    padding: theme.spacing(3),
    textAlign: 'center',
    maxWidth: '400px',
    width: '100%',
  },
}));

const EmojiDisplay = styled(Box)(({ theme }) => ({
  fontSize: '4rem',
  marginBottom: theme.spacing(2),
  animation: 'bounce 1s infinite',
  '@keyframes bounce': {
    '0%, 100%': {
      transform: 'translateY(0)',
    },
    '50%': {
      transform: 'translateY(-20px)',
    },
  },
}));

const PowerupTimer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  backgroundColor: theme.palette.success.main,
  color: 'white',
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.9rem',
  animation: 'pulse 2s infinite',
  '@keyframes pulse': {
    '0%': {
      opacity: 1,
    },
    '50%': {
      opacity: 0.7,
    },
    '100%': {
      opacity: 1,
    },
  },
}));

const DialogMigrate = ({
  children,
  disableBackdropClick,
  disableEscapeKeyDown,
  onClose,
  ...rest
}) => {
  const handleClose = (event, reason) => {
    if (disableBackdropClick && reason === "backdropClick") {
      return false;
    }

    if (disableEscapeKeyDown && reason === "escapeKeyDown") {
      return false;
    }

    if (typeof onClose === "function") {
      onClose();
    }
  };

  return (
    <Dialog onClose={handleClose} {...rest}>
      {children}
    </Dialog>
  );
};

const FloatingButton = styled(Button)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  right: theme.spacing(4),
  borderRadius: '50%',
  width: '60px',
  height: '60px',
  minWidth: '60px',
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  boxShadow: theme.shadows[4],
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    boxShadow: theme.shadows[6],
  },
}));

const Quiz = ({ socket }) => {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(0);
  const [quizMessage, setQuizMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answerResult, setAnswerResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const levelSession = useSelector((state) => state.levelSession.session);
  const [currentXp, setCurrentXp] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [isSocketInitialized, setIsSocketInitialized] = useState(false);
  const initializedRef = React.useRef(false);
  const [availablePowerups, setAvailablePowerups] = useState([]);
  const [activePowerups, setActivePowerups] = useState([]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleEndQuiz = () => {
    setOpenDialog(true);
  };

  const confirmEndQuiz = () => {
    socket.emit('sendQuizEnd', { userLevelSessionId: levelSession?._id });
    setOpenDialog(false);
  };

  const requestQuestion = () => {
    setIsLoading(true);
    socket.emit('question', { userLevelSessionId: levelSession?._id, userLevelId: levelId });
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswer === '') {
      setQuizMessage('Please select an answer');
      return;
    }
    socket.emit('answer', {
      userLevelSessionId: levelSession?._id,
      answer: parseInt(selectedAnswer)
    });
  };

  const handleNextQuestion = () => {
    setAnswerResult(null);
    requestQuestion();
  };

  const getOptionClass = (index) => {
    if (!answerResult) return selectedAnswer === index.toString() ? 'selected' : '';
    
    if (index === answerResult.correctAnswer) {
      return 'correct-answer';
    }
    
    if (index.toString() === selectedAnswer) {
      return answerResult.isCorrect ? 'correct' : 'wrong';
    }
    
    return '';
  };

  const handleBack = () => {
    navigate(`/levels/${levelSession?.chapterId}`);
  };

  const getLevelSession = () => {
    if (!levelSession?._id || quizFinished) {
      console.log("No level session ID available or quiz finished");
      return;
    }
    if (initializedRef.current) {
      console.log("Already initialized, skipping getLevelSession");
      return;
    }
    if (!socket.connected) {
      console.log("Socket not connected, connecting...");
      socket.connect();
      return;
    }
    console.log("Getting level session for ID:", levelSession._id);
    socket.emit('getLevelSession', { userLevelSessionId: levelSession._id });
    initializedRef.current = true;
  };

  useEffect(() => {
    if (!levelSession?._id || quizFinished) {
      return;
    }

    if (!socket.connected && !quizFinished) {
      console.log("Connecting socket for session:", levelSession._id);
      socket.connect();
    }

    return () => {
      if (!showResults && !quizFinished) {
        socket.disconnect();
      }
    };
  }, [levelSession?._id, quizFinished, socket, showResults]);

  useEffect(() => {
    if (!levelSession?._id || quizFinished) {
      return;
    }

    socket.on('connect', () => {
      console.log("Socket connected, getting level session");
      getLevelSession();
    });

    socket.on('levelSession', (data) => {
      console.log("Received level session data:", data);
      if (data.currentQuestion) {
        setCurrentQuestion({
          question: data.currentQuestion.ques,
          options: data.currentQuestion.options,
          correctAnswer: data.currentQuestion.correct
        });
        setIsLoading(false);
      } else {
        requestQuestion();
      }
      if (data.currentTime) {
        setCurrentTime(data.currentTime);
      }
      if (data.currentXp) {
        setCurrentXp(data.currentXp);
      }
      if (data.powerups) {
        setAvailablePowerups(data.powerups);
      }
    });

    socket.on('question', (data) => {
      console.log("Received question:", data);
      setCurrentQuestion(data);
      setSelectedAnswer('');
      setIsLoading(false);
    });

    socket.on('answerResult', ({ isCorrect, correctAnswer, currentXp }) => {
      console.log("Received answer result:", { isCorrect, correctAnswer, currentXp });
      setAnswerResult({ isCorrect, correctAnswer });
      setCurrentXp(currentXp);
    });

    socket.on('levelCompleted', ({ message }) => {
      console.log("Level completed:", message);
      setShowCongrats(true);
    });

    socket.on('quizFinished', ({ message, currentXp, requiredXp, maxXp }) => {
      console.log("Quiz finished:", { message, currentXp, requiredXp, maxXp });
      clearInterval(timerInterval);
      setQuizFinished(true);
      setQuizResults({ currentXp, requiredXp, maxXp, message });
      setShowResults(true);
    });

    socket.on('quizError', ({ type, message }) => {
      console.error('Quiz error:', { type, message });
      if (type === 'failure') {
        setErrorMessage(message);
        setShowError(true);
        setQuizFinished(true);
      } else {
        setQuizMessage(message);
      }
    });

    getLevelSession();

    if (levelSession._id && !quizFinished) {
      socket.emit('getCurrentTime', { userLevelSessionId: levelSession._id });
    }

    if (levelSession?.currentTime) {
      setCurrentTime(levelSession.currentTime);
    }

    const timerInterval = setInterval(() => {
      if (quizFinished) {
        clearInterval(timerInterval);
        return;
      }
      setCurrentTime(prev => {
        const newTime = prev - 1;
        if (newTime % 5 === 0 && levelSession._id && !quizFinished) {
          socket.emit('sendUpdateTime', { currentTime: newTime, userLevelSessionId: levelSession._id });
        }
        if (newTime <= 0) {
          socket.emit('sendTimesUp', { userLevelSessionId: levelSession._id });
          clearInterval(timerInterval);
        }
        return newTime;
      });
    }, 1000);

    return () => {
      console.log("Cleaning up socket connection");
      clearInterval(timerInterval);
      socket.off('connect');
      socket.off('timeUpdated');
      socket.off('question');
      socket.off('quizFinished');
      socket.off('quizError');
      socket.off('answerResult');
      socket.off('levelCompleted');
      socket.off('levelSession');
      initializedRef.current = false;
    };
  }, [levelSession?._id, quizFinished, socket, showResults]);

  useEffect(() => {
    socket.on('powerupSet', ({ message, effect }) => {
      if (effect?.duration) {
        setActivePowerups(prev => [
          ...prev,
          {
            name: message.split(' ')[0],
            remainingTime: effect.duration,
            effect: effect
          }
        ]);
      }
    });

    socket.on('powerupError', ({ message }) => {
      setQuizMessage(message);
    });

    return () => {
      socket.off('powerupSet');
      socket.off('powerupError');
    };
  }, [socket]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePowerups(prev => 
        prev.map(powerup => ({
          ...powerup,
          remainingTime: Math.max(0, powerup.remainingTime - 1)
        })).filter(powerup => powerup.remainingTime > 0)
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handlePowerupClick = (powerup) => {
    socket.emit('usePowerup', {
      userLevelSessionId: levelSession?._id,
      powerupId: powerup.powerupId
    });
  };

  return (
    <ThemeProvider theme={quizTheme}>
      <QuizContainer>
        <QuizHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              onClick={handleBack} 
              size="large"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,1)',
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <XpDisplay>
              <StarIcon />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {currentXp} XP
              </Typography>
            </XpDisplay>
            {activePowerups.length > 0 && (
              <PowerupDisplay>
                {activePowerups.map((powerup, index) => (
                  <PowerupTimer key={index}>
                    <Typography variant="body2">
                      {powerup.name}: {powerup.remainingTime}s
                    </Typography>
                  </PowerupTimer>
                ))}
              </PowerupDisplay>
            )}
            {availablePowerups.length > 0 && (
              <PowerupDisplay>
                {availablePowerups.map((powerup) => (
                  <PowerupItem 
                    key={powerup.powerupId}
                    onClick={() => handlePowerupClick(powerup)}
                  >
                    <Typography variant="body2">
                      {powerup.name} x{powerup.quantity}
                    </Typography>
                  </PowerupItem>
                ))}
              </PowerupDisplay>
            )}
          </Box>
          <StyledButton
            variant="contained"
            color="error"
            onClick={handleEndQuiz}
          >
            End Quiz
          </StyledButton>
        </QuizHeader>

        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <TimeDisplay>
            Time Remaining: {formatTime(currentTime)}
          </TimeDisplay>
        </Box>

        {quizMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {quizMessage}
          </Alert>
        )}

        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : currentQuestion ? (
          <>
            <QuestionCard>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  {currentQuestion.question}
                </Typography>
              </CardContent>
            </QuestionCard>

            <Grid container spacing={3} sx={{ mt: 2 }}>
              {currentQuestion.options.map((option, index) => (
                <Grid size={{xs:12,sm:6,md:3}} key={index}>
                  <OptionCard
                    className={getOptionClass(index)}
                    onClick={() => !answerResult && setSelectedAnswer(index.toString())}
                  >
                    <CardContent>
                      <Typography variant="body1" align="center">
                        {option}
                      </Typography>
                    </CardContent>
                  </OptionCard>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
              {!answerResult ? (
                <StyledButton
                  variant="contained"
                  size="large"
                  onClick={handleAnswerSubmit}
                  disabled={selectedAnswer === ''}
                >
                  Submit Answer
                </StyledButton>
              ) : (
                <StyledButton
                  variant="contained"
                  size="large"
                  onClick={handleNextQuestion}
                  disabled={isLoading}
                >
                  Next Question
                </StyledButton>
              )}
            </Box>
          </>
        ) : null}

        {currentQuestion && (
          <FloatingButton
            variant="contained"
            onClick={() => setShowCorrectAnswer(!showCorrectAnswer)}
            sx={{
              position: 'fixed',
              bottom: 32,
              right: 32,
              zIndex: 1000,
            }}
          >
            {showCorrectAnswer ? currentQuestion.correctAnswer : '?'}
          </FloatingButton>
        )}

        <CongratsDialog 
          open={showCongrats} 
          onClose={() => setShowCongrats(false)}
        >
          <IconButton
            onClick={() => setShowCongrats(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
          <EmojiDisplay>🎉</EmojiDisplay>
          <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
            Congratulations!
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              You've completed the level with {currentXp} XP!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Keep up the great work! 🚀
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2 }}>
            <StyledButton
              variant="outlined"
              onClick={() => {
                setShowCongrats(false);
                navigate(`/levels/${levelSession?.chapterId}`);
              }}
            >
              Back to Levels
            </StyledButton>
            <StyledButton
              variant="contained"
              onClick={() => setShowCongrats(false)}
            >
              Continue Quiz
            </StyledButton>
          </DialogActions>
        </CongratsDialog>

        <DialogMigrate 
          open={showResults} 
          onClose={() => setShowResults(false)}
          disableBackdropClick
          disableEscapeKeyDown
          BackdropProps={{
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
            }
          }}
          PaperProps={{
            sx: {
              borderRadius: 3,
              padding: 3,
              textAlign: 'center',
              maxWidth: '400px',
              width: '100%',
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
            Quiz Results
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                {quizResults?.currentXp} XP
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                Required: {quizResults?.requiredXp} XP
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Max Score: {quizResults?.maxXp} XP
              </Typography>
              <Typography variant="body1" sx={{ 
                color: 'text.primary',
                fontStyle: 'italic',
                mb: 2,
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider'
              }}>
                {quizResults?.message}
              </Typography>
            </Box>
            <Box sx={{ 
              width: '100%', 
              height: '8px', 
              bgcolor: 'grey.200', 
              borderRadius: '4px',
              overflow: 'hidden',
              mb: 2
            }}>
              <Box sx={{ 
                width: `${(quizResults?.currentXp / quizResults?.requiredXp) * 100}%`,
                height: '100%',
                bgcolor: 'primary.main',
                transition: 'width 0.5s ease-in-out'
              }} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {quizResults?.currentXp >= quizResults?.requiredXp 
                ? "Congratulations! You've completed the level! 🎉" 
                : "Keep practicing to reach the required XP! 💪"}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <StyledButton
              variant="contained"
              onClick={() => {
                setShowResults(false);
                navigate(`/levels/${levelSession?.chapterId}`);
              }}
            >
              Back to Levels
            </StyledButton>
          </DialogActions>
        </DialogMigrate>

        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          PaperProps={{
            sx: {
              borderRadius: 2,
              padding: 2
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 'bold' }}>
            End Quiz
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to end the quiz? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ padding: 2 }}>
            <Button 
              onClick={() => setOpenDialog(false)}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmEndQuiz} 
              color="error" 
              variant="contained"
            >
              End Quiz
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog 
          open={showError} 
          onClose={() => setShowError(false)}
          BackdropProps={{
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
            }
          }}
          PaperProps={{
            sx: {
              borderRadius: 3,
              padding: 3,
              textAlign: 'center',
              maxWidth: '400px',
              width: '100%',
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem', color: 'error.main' }}>
            Quiz Error
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" color="text.primary" sx={{ mb: 2 }}>
                {errorMessage}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please return to levels and try again.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <StyledButton
              variant="contained"
              color="error"
              onClick={() => {
                setShowError(false);
                navigate(`/levels/${levelSession?.chapterId}`);
              }}
            >
              Back to Levels
            </StyledButton>
          </DialogActions>
        </Dialog>
      </QuizContainer>
    </ThemeProvider>
  );
};

export default Quiz;
